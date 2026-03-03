import express from 'express';
import { 
  bookChatSession, 
  verifyChatPayment, 
  startChatSession,
  getAvailableChatDoctors,
  getUserChatSessions,
  cancelChatSession
} from '../controllers/paidChatController.js';
import authUser from '../middlewares/authUser.js';

const router = express.Router();

// Book a chat session (create order)
router.post('/book', authUser, bookChatSession);

// Verify Razorpay payment and start session
router.post('/verify-payment', authUser, verifyChatPayment);

// Start session (for credit-based payments)
router.post('/start', authUser, startChatSession);

// Get available doctors for chat
router.get('/doctors', getAvailableChatDoctors);

// Get user's active/scheduled sessions
router.get('/sessions', authUser, getUserChatSessions);

// Cancel session and process refund
router.post('/cancel', authUser, cancelChatSession);

export default router;
