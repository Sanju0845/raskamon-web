import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Assessment } from "../../models/assessmentModel.js";

dotenv.config();

// MongoDB connection with proper error handling
async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error; // Re-throw to be caught by the main error handler
  }
}

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function formatAssessmentForEmbedding(assessment) {
  // Combine questions into readable text
  const questionsText = assessment.questions.map(q => {
    const options = q.options.map(o => `${o.text} (${o.value})`).join(", ");
    return `Q: ${q.text} | Options: ${options} | Category: ${q.category}`;
  }).join("\n");

  // Combine scoring ranges
  const scoringText = assessment.scoringRanges.map(s => {
    const recs = s.recommendations.join(" | ");
    return `Score ${s.minScore}-${s.maxScore}: ${s.result}. Recommendations: ${recs}`;
  }).join("\n");

  // Final text
  const text = `
Assessment: ${assessment.title}
Description: ${assessment.description}
Questions:
${questionsText}

Scoring:
${scoringText}
  `;

  return text;
}

async function uploadAssessment(assessment) {
  const text = formatAssessmentForEmbedding(assessment);

  try {
    // Generate embedding
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });

    const vector = embeddingRes.data[0].embedding;

    // Upsert into Pinecone
    await index.upsert([
      {
        id: `assessment-${assessment._id}`,
        values: vector,
        metadata: {
          type: "assessment",
          title: assessment.title,
          isActive: assessment.isActive,
          createdAt: assessment.createdAt,
        }
      }
    ]);

    console.log(`✅ Uploaded ${assessment.title} to Pinecone`);
  } catch (error) {
    console.error(`❌ Error uploading ${assessment.title}:`, error.message);
  }
}

async function uploadAllActiveAssessments() {
  try {
    // Fetch all active assessments
    const assessments = await Assessment.find({ isActive: true });
    console.log(`Found ${assessments.length} active assessments`);

    // Process each assessment
    for (const assessment of assessments) {
      await uploadAssessment(assessment);
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('🎉 All active assessments uploaded to Pinecone!');
  } catch (error) {
    console.error('❌ Error processing assessments:', error.message);
  }
}

async function main() {
  try {
    await connectToMongoDB();
    await uploadAllActiveAssessments();
    console.log("🎉 Upload finished successfully");
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close MongoDB connection
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }
}

main().catch(console.error);


export { uploadAllActiveAssessments, uploadAssessment, formatAssessmentForEmbedding };
