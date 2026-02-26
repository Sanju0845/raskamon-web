import express from "express";
import { 
  saveChatMessage, 
  getChatHistory, 
  clearChatHistory, 
  sendMessage,
  getChatSummary 
} from "../controllers/chatController.js";
import authUser from "../middlewares/authUser.js";
const router = express.Router();

// Save chat message(s)
router.post('/', authUser, saveChatMessage);

// Send message to OpenAI and save reply (accessible to both guest and authenticated users)
router.post('/send', sendMessage);

// Get chat history
router.get('/', authUser, getChatHistory);

// Clear chat history
router.delete('/', authUser, clearChatHistory);

// Get chat summary with assessment results
router.post('/chat-summary', authUser, getChatSummary);

export default router;
