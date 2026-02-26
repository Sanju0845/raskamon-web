import ChatMessage from "../models/chatMessageModel.js";
import User from "../models/userModel.js";
import { UserAssessment } from "../models/assessmentModel.js";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { getSystemPrompt } from "../config/chatPrompts.js";
import mongoose from "mongoose";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX_NAME);

// Helper: Generate structured chat summary with assessment results
const generateChatSummary = async (messages, userAssessments) => {
  try {
    const hasAssessments =
      userAssessments &&
      Array.isArray(userAssessments) &&
      userAssessments.length > 0;

    const systemPromptContent = hasAssessments
      ? `You are a healthcare assistant. Summarize the chat messages and assessment results in the following format:

**Chat Overview:**
- Key points discussed
- Main concerns/topics
- Recommendations given

---

**Assessment Results Summary:**

For each assessment, format as:
1. **Assessment Name:**
   - **Score**: [score]
   - **Result**: [result]
   - **Key Recommendations**:
     - [recommendation 1]
     - [recommendation 2]

Focus only on actionable insights and important discussion points. Do not add greetings or extra commentary.`
      : `You are a healthcare assistant. Summarize the chat messages in the following format:

**Chat Overview:**
- Key points discussed
- Main concerns/topics
- Recommendations given

Note: The user has not completed any assessments yet. If they ask about assessments or their mental health status, encourage them to complete relevant assessments for a proper evaluation.

Focus only on actionable insights and important discussion points. Do not add greetings or extra commentary. Do not make up or assume any assessment results.`;

    const systemPrompt = {
      role: "system",
      content: systemPromptContent,
    };

    const messagesText = messages
      .map(
        (m) => `${m.sender === "user" ? "Patient" : "Assistant"}: ${m.content}`
      )
      .join("\n");

    let userContent;
    if (hasAssessments) {
      const assessmentsText = userAssessments
        .map(
          (a) => `
${a.assessmentId?.title || "Assessment"}:
- Score: ${a.totalScore}
- Result: ${a.result}
- Key Recommendations: ${a.recommendations.join(", ")}`
        )
        .join("\n");

      userContent = {
        role: "user",
        content: `Chat messages:\n${messagesText}\n\nAssessment results:\n${assessmentsText}`,
      };
    } else {
      userContent = {
        role: "user",
        content: `Chat messages:\n${messagesText}\n\nNote: User has not completed any assessments.`,
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, userContent],
      max_tokens: 500,
      temperature: 0.2,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary";
  }
};

// Helper: sanitize message
function sanitizeMessage(msg) {
  return {
    sender: msg.sender === "user" ? "user" : "bot",
    content: String(msg.content).trim(),
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  };
}

// Save chat message(s)
export const saveChatMessage = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { messages } = req.body;
    const sessionId = req.body.sessionId;

    if (!userId || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });

    const sanitizedMessages = messages.map(sanitizeMessage);

    let chat;
    if (sessionId) {
      chat = await ChatMessage.findOne({ userId, sessionId });
    } else {
      chat = await ChatMessage.findOne({ userId, isActive: true });
    }

    if (!chat) {
      chat = new ChatMessage({
        userId,
        sessionId: sessionId || new mongoose.Types.ObjectId().toString(),
        isActive: true,
        messages: sanitizedMessages,
      });
    } else {
      chat.messages = [...chat.messages, ...sanitizedMessages].slice(-100);
    }
    await chat.save();
    res.json({ success: true, chat });
  } catch (err) {
    console.error("Save chat error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const sessionId = req.query.sessionId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });

    const query = sessionId
      ? { userId, sessionId }
      : { userId, isActive: true };

    const chat = await ChatMessage.findOne(query);
    res.json({ chat });
  } catch (err) {
    console.error("Get chat history error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Clear chat history (creates new session)
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });

    await ChatMessage.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false } }
    );

    const newSession = new ChatMessage({
      userId,
      sessionId: new mongoose.Types.ObjectId().toString(),
      isActive: true,
      messages: [],
    });
    await newSession.save();

    res.json({ success: true, sessionId: newSession.sessionId });
  } catch (err) {
    console.error("Clear chat history error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get chat summary with assessment results
export const getChatSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    const chat = await ChatMessage.findOne({ userId, isActive: true });
    if (!chat) {
      return res.json({
        success: true,
        summary: "No chat history available.",
        messageCount: 0,
        assessmentCount: 0,
      });
    }

    const userAssessments = Array.isArray(req.body.userAssessments)
      ? req.body.userAssessments
      : [];

    const summary = await generateChatSummary(chat.messages, userAssessments);

    res.json({
      success: true,
      summary,
      chatId: chat._id,
      messageCount: chat.messages.length,
      assessmentCount: userAssessments.length,
    });
  } catch (err) {
    console.error("Get chat summary error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Send message: save user message, call OpenAI, save bot reply, return reply
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { message, doctors } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let user = null;
    let userAssessments = null;
    let userMoodEntries = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      userAssessments = await UserAssessment.find({ userId })
        .populate("assessmentId", "title description")
        .sort({ completedAt: -1 })
        .lean();

      if (user.moodEntries && Array.isArray(user.moodEntries)) {
        userMoodEntries = user.moodEntries
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 30);
      }
    }

    const userMsg = sanitizeMessage({ sender: "user", content: message });
    let chat = await ChatMessage.findOne({ userId, isActive: true });
    if (!chat) {
      chat = new ChatMessage({ userId, messages: [userMsg] });
    } else {
      chat.messages = [...chat.messages, userMsg].slice(-50);
    }
    chat.save().catch(console.error);

    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const embedding = embeddingRes.data[0].embedding;

    const queryRes = await index.query({
      vector: embedding,
      topK: 8,
      includeMetadata: true,
    });

    const contextDocs = queryRes.matches
      .map((m) => m.metadata?.text)
      .filter(Boolean)
      .join("\n\n");

    const isMoodTrackerQuery = /\b(mood|feeling|emotion|situation|today|yesterday|week|month|trend|pattern|happy|sad|angry|calm|joyful|anxious|grateful|tracking|entry|entries|emotional|mental state)\b/i.test(message);

    const isAssessmentQuery = !isMoodTrackerQuery && /\b(assessment|test|result|score|latest|recent|last|first|completed|took|phq|gad|stress|anxiety|depression|relationship|day \d+)\b/i.test(message);

    const convo =
      userId && chat?.messages && chat?.isActive && !isAssessmentQuery && !isMoodTrackerQuery
        ? chat.messages.slice(-10).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content,
        }))
        : [];

    const systemPrompt = getSystemPrompt(user, userAssessments, doctors, userMoodEntries);

    const systemMessages = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        name: "retrieved_context",
        content: contextDocs || "No additional context available.",
      },
    ];

    const messages = [
      ...systemMessages,
      ...convo,
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });
    const botReply = response.choices?.[0]?.message?.content?.trim();
    if (userId) {
      const botMsg = sanitizeMessage({ sender: "bot", content: botReply });
      if (chat && chat.isActive) {
        chat.messages = [...chat.messages, botMsg].slice(-50);
        chat.save().catch(console.error);
      }
    }

    res.json({ success: true, reply: botReply });
  } catch (err) {
    console.log("Send message error:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
