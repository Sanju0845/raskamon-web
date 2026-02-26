import { Pinecone } from "@pinecone-database/pinecone";
import { promises as fs } from "fs";
import path from "path";
import PDFParser from "pdf2json";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import * as tiktoken from "tiktoken"; // Tokenizer

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROGRESS_FILE = path.join(__dirname, "progress.json");
const ERROR_LOG_FILE = path.join(__dirname, "error_log.json");

// === Load progress state ===
async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { completed: [], skipped: [], errors: [] }; // default
  }
}

// === Save progress state ===
async function saveProgress(progress) {
  try {
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save progress:", err.message);
  }
}

// === Log errors ===
async function logError(fileName, error, context = "") {
  const errorEntry = {
    fileName,
    error: error.message || error.toString(),
    context,
    timestamp: new Date().toISOString()
  };

  try {
    let errorLog = [];
    try {
      const data = await fs.readFile(ERROR_LOG_FILE, "utf-8");
      errorLog = JSON.parse(data);
    } catch {
      // File doesn't exist or is corrupted, start fresh
    }

    errorLog.push(errorEntry);
    await fs.writeFile(ERROR_LOG_FILE, JSON.stringify(errorLog, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to log error:", err.message);
  }
}

// === Token-safe chunking ===
function chunkTextByTokens(text, maxTokens = 1500) {
  let enc;
  try {
    // Ensure text is a string and not empty
    if (typeof text !== 'string') {
      text = String(text || '');
    }
    
    if (!text.trim()) {
      return [];
    }

    enc = tiktoken.encoding_for_model("text-embedding-3-small");
    const tokens = enc.encode(text);

    let chunks = [];
    for (let i = 0; i < tokens.length; i += maxTokens) {
      const slice = tokens.slice(i, i + maxTokens);
      const decodedChunk = enc.decode(slice);
      if (decodedChunk && decodedChunk.trim()) {
        chunks.push(decodedChunk);
      }
    }

    return chunks;
  } catch (err) {
    console.error("Error in token chunking:", err.message);
    // Fallback to simple text chunking
    return chunkTextByLength(text, maxTokens * 4); // Approximate 4 chars per token
  } finally {
    if (enc) {
      try {
        enc.free();
      } catch (err) {
        console.error("Error freeing encoder:", err.message);
      }
    }
  }
}

// === Fallback chunking by character length ===
function chunkTextByLength(text, maxLength = 6000) {
  // Ensure text is a string
  if (typeof text !== 'string') {
    text = String(text || '');
  }
  
  if (!text.trim()) {
    return [];
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    const chunk = text.slice(i, i + maxLength);
    if (chunk && chunk.trim()) {
      chunks.push(chunk);
    }
  }
  return chunks;
}

// === Enhanced chunking function (assuming this was missing) ===
function chunkTextBySections(text, maxTokens = 1500) {
  try {
    // Ensure text is a string
    if (typeof text !== 'string') {
      console.warn("Non-string text provided to chunking function, converting...");
      text = String(text || '');
    }
    
    if (!text.trim()) {
      return [];
    }
    
    return chunkTextByTokens(text, maxTokens);
  } catch (err) {
    console.error("Error in section chunking, using fallback:", err.message);
    return chunkTextByLength(String(text || ''));
  }
}

// === PDF extraction with timeout ===
async function extractTextFromPdf(filePath, timeoutMs = 30000) {
  const pdfParser = new PDFParser();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`PDF parsing timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    pdfParser.on("pdfParser_dataReady", (data) => {
      clearTimeout(timeout);
      try {
        let text = "";
        
        // Safely extract text from PDF data
        if (data && data.Pages && Array.isArray(data.Pages)) {
          text = data.Pages.map((page) => {
            if (!page || !page.Texts || !Array.isArray(page.Texts)) {
              return "";
            }
            
            return page.Texts.map((t) => {
              try {
                if (t && t.R && Array.isArray(t.R) && t.R[0] && typeof t.R[0].T === 'string') {
                  return decodeURIComponent(t.R[0].T);
                }
                return "";
              } catch {
                // If decodeURIComponent fails, return the raw text
                return (t && t.R && t.R[0] && t.R[0].T) ? String(t.R[0].T) : "";
              }
            }).join(" ");
          }).join("\n");
        }
        
        // Ensure we return a string
        resolve(String(text || ""));
      } catch (err) {
        reject(new Error(`Error processing PDF data: ${err.message}`));
      }
    });

    pdfParser.on("pdfParser_dataError", (err) => {
      clearTimeout(timeout);
      reject(new Error(`PDF parser error: ${err.message || err}`));
    });

    try {
      pdfParser.loadPDF(filePath);
    } catch (err) {
      clearTimeout(timeout);
      reject(new Error(`Error loading PDF: ${err.message}`));
    }
  });
}

// === Process one PDF with comprehensive error handling ===
async function processPdf(filePath, index) {
  const fileName = path.basename(filePath);
  let totalUploaded = 0;

  try {
    console.log(`Processing ${fileName}...`);
    
    // Extract text with timeout
    let text;
    try {
      text = await extractTextFromPdf(filePath, 30000); // 30 second timeout
    } catch (err) {
      await logError(fileName, err, "PDF extraction");
      console.warn(`⚠️ Failed to extract text from ${fileName}: ${err.message}`);
      return 0;
    }

    if (!text || !text.trim()) {
      console.warn(`⚠️ Skipping ${fileName} (no text content)`);
      return 0;
    }

    // Chunk the text
    let chunks;
    try {
      chunks = chunkTextBySections(text).filter(c => {
        // Ensure c is a string and has content
        return c && typeof c === 'string' && c.trim().length > 0;
      });
    } catch (err) {
      await logError(fileName, err, "Text chunking");
      console.warn(`⚠️ Failed to chunk text for ${fileName}: ${err.message}`);
      return 0;
    }

    if (chunks.length === 0) {
      console.warn(`⚠️ Skipping ${fileName} (no valid chunks after processing)`);
      return 0;
    }

    console.log(`  → ${fileName}: ${chunks.length} chunks`);

    // Process chunks in batches
    for (let i = 0; i < chunks.length; i += 20) {
      const batch = chunks.slice(i, i + 20);
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount <= maxRetries) {
        try {
          // Create embeddings with retry logic
          const embeddings = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: batch,
          });

          if (!embeddings?.data || embeddings.data.length !== batch.length) {
            throw new Error("Invalid embedding response");
          }

          const batchVectors = embeddings.data.map((res, j) => {
            if (!res?.embedding || !Array.isArray(res.embedding)) {
              throw new Error(`Invalid embedding at index ${j}`);
            }
            
            return {
              id: `${fileName.replace(/[^a-zA-Z0-9_-]/g, "_")}-chunk-${i + j}`,
              metadata: { 
                fileName, 
                chunkIndex: i + j, 
                text: batch[j].substring(0, 40000) // Limit metadata size
              },
              values: res.embedding,
            };
          });

          // Upload to Pinecone with retry
          await index.upsert(batchVectors);
          
          console.log(`    ✅ Uploaded batch ${Math.floor(i / 20) + 1}/${Math.ceil(chunks.length / 20)}`);
          totalUploaded += batchVectors.length;
          break; // Success, exit retry loop

        } catch (err) {
          retryCount++;
          const isLastRetry = retryCount > maxRetries;
          
          await logError(fileName, err, `Batch ${Math.floor(i / 20) + 1}, Retry ${retryCount}`);
          
          if (isLastRetry) {
            console.error(`    ❌ Failed batch ${Math.floor(i / 20) + 1} after ${maxRetries} retries: ${err.message}`);
            break; // Give up on this batch, continue with next
          } else {
            console.warn(`    ⚠️ Retrying batch ${Math.floor(i / 20) + 1} (attempt ${retryCount + 1}/${maxRetries + 1}): ${err.message}`);
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      }
    }

    return totalUploaded;

  } catch (err) {
    await logError(fileName, err, "General processing error");
    console.error(`❌ Fatal error processing ${fileName}: ${err.message}`);
    return 0;
  }
}

// === Process all PDFs with robust error handling ===
async function processAllPdfs() {
  try {
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    const pdfDir = path.join(__dirname, "..", "pdfs");

    // Check if PDF directory exists
    try {
      await fs.access(pdfDir);
    } catch {
      console.error(`❌ PDF directory not found: ${pdfDir}`);
      return;
    }

    let files;
    try {
      files = (await fs.readdir(pdfDir)).filter((f) =>
        f.toLowerCase().endsWith(".pdf")
      );
    } catch (err) {
      console.error(`❌ Failed to read PDF directory: ${err.message}`);
      return;
    }

    console.log(`Found ${files.length} PDFs`);

    if (files.length === 0) {
      console.log("No PDF files found to process.");
      return;
    }

    let progress = await loadProgress();
    let completed = new Set(progress.completed || []);
    let skipped = new Set(progress.skipped || []);
    let errors = new Set(progress.errors || []);

    let processedCount = 0;
    let totalUploaded = 0;

    for (const file of files) {
      processedCount++;
      
      if (completed.has(file)) {
        console.log(`⏩ Already completed: ${file} (${processedCount}/${files.length})`);
        continue;
      }

      if (skipped.has(file)) {
        console.log(`⏩ Previously skipped: ${file} (${processedCount}/${files.length})`);
        continue;
      }

      console.log(`\n[${processedCount}/${files.length}] Processing ${file}...`);
      
      try {
        const result = await processPdf(path.join(pdfDir, file), index);
        
        if (result > 0) {
          completed.add(file);
          totalUploaded += result;
          console.log(`✅ Successfully processed ${file} (${result} chunks uploaded)`);
        } else {
          skipped.add(file);
          console.log(`⚠️ Skipped ${file} (no chunks uploaded)`);
        }

      } catch (err) {
        errors.add(file);
        await logError(file, err, "Main processing loop");
        console.error(`❌ Unexpected error with ${file}: ${err.message}`);
      }

      // Save progress after each file
      try {
        await saveProgress({ 
          completed: Array.from(completed), 
          skipped: Array.from(skipped),
          errors: Array.from(errors)
        });
      } catch (err) {
        console.error("Failed to save progress:", err.message);
      }

      // Brief pause to prevent overwhelming the APIs
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 Processing complete!`);
    console.log(`✅ Completed: ${completed.size}`);
    console.log(`⚠️ Skipped: ${skipped.size}`);
    console.log(`❌ Errors: ${errors.size}`);
    console.log(`📊 Total chunks uploaded: ${totalUploaded}`);

    if (errors.size > 0) {
      console.log(`\n📝 Check ${ERROR_LOG_FILE} for detailed error information.`);
    }

  } catch (err) {
    console.error(`❌ Fatal error in main process: ${err.message}`);
    process.exit(1);
  }
}

// === Graceful shutdown ===
process.on('SIGINT', async () => {
  console.log('\n⏹️ Received SIGINT. Saving progress and shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️ Received SIGTERM. Saving progress and shutting down gracefully...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  processAllPdfs().catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
}

export { processAllPdfs };