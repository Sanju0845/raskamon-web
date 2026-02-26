import express from "express";
import fetch from "node-fetch";
import authUser from "../middlewares/authUser.js";
import User from "../models/userModel.js";

const router = express.Router();

// Text-to-Speech endpoint using Cartesia Sonic
router.post("/tts", authUser, async (req, res) => {
  try {
    const { text, voice = "79a125e8-cd45-4c13-8a67-188112f4dd22" } = req.body; // Default: British Lady

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Calculate credits needed (1 character = 1 credit)
    const creditsNeeded = text.length;

    // Get user and check credits
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.credits < creditsNeeded) {
      return res.status(402).json({ 
        error: "Insufficient credits",
        creditsNeeded,
        currentCredits: user.credits,
        requiresUpgrade: true
      });
    }

    console.log("Generating TTS for:", text.substring(0, 50) + "...");

    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Cartesia-Version": "2024-06-10",
        "X-API-Key": process.env.CARTESIA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: "sonic-3",
        transcript: text,
        voice: {
          mode: "id",
          id: voice,
        },
        language: detectLanguage(text),
        output_format: {
          container: "mp3",
          encoding: "mp3",
          sample_rate: 44100,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Cartesia API error:", error);
      return res.status(response.status).json({ error: "TTS generation failed" });
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Deduct credits after successful TTS generation
    user.credits -= creditsNeeded;
    await user.save();

    console.log(`Deducted ${creditsNeeded} credits. Remaining: ${user.credits}`);
    
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength,
      "X-Credits-Used": creditsNeeded,
      "X-Credits-Remaining": user.credits,
    });

    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ error: "TTS failed", details: err.message });
  }
});

function detectLanguage(text) {
  const cleaned = text.trim();

  // Hindi / Marathi / Sanskrit (Devanagari)
  if (/[\u0900-\u097F]/.test(cleaned)) {
    return "hi"; // Hindi (best-supported in TTS)
  }

  // Telugu
  if (/[\u0C00-\u0C7F]/.test(cleaned)) {
    return "te";
  }

  // Tamil
  if (/[\u0B80-\u0BFF]/.test(cleaned)) {
    return "ta";
  }

  // Kannada
  if (/[\u0C80-\u0CFF]/.test(cleaned)) {
    return "kn";
  }

  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(cleaned)) {
    return "ml";
  }

  // Bengali
  if (/[\u0980-\u09FF]/.test(cleaned)) {
    return "bn";
  }

  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(cleaned)) {
    return "gu";
  }

  // Punjabi (Gurmukhi)
  if (/[\u0A00-\u0A7F]/.test(cleaned)) {
    return "pa";
  }

  // Urdu (Arabic script)
  if (/[\u0600-\u06FF]/.test(cleaned)) {
    return "ur";
  }

  // Default
  return "en";
}


// Get available voices
router.get("/voices", async (req, res) => {
  try {
    const response = await fetch("https://api.cartesia.ai/voices", {
      method: "GET",
      headers: {
        "Cartesia-Version": "2024-06-10",
        "X-API-Key": process.env.CARTESIA_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Cartesia API error:", error);
      return res.status(response.status).json({ error: "Failed to fetch voices" });
    }

    const voices = await response.json();
    res.json(voices);
  } catch (err) {
    console.error("Get voices error:", err);
    res.status(500).json({ error: "Failed to fetch voices", details: err.message });
  }
});

export default router;
