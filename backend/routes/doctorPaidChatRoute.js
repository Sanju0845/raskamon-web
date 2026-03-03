import express from 'express';
import { 
  setChatPricing,
  getDoctorChatPricing,
  toggleChatAvailability,
  getDoctorActiveSessions,
  getDoctorChatRevenue,
  doctorStartChat,
  doctorEndChat
} from '../controllers/doctorPaidChatController.js';
import authDoctor from '../middlewares/authDoctor.js';

const router = express.Router();

// Set/update chat pricing
router.post('/pricing', authDoctor, setChatPricing);

// Get doctor's chat pricing
router.get('/pricing', authDoctor, getDoctorChatPricing);

// Toggle availability
router.post('/availability', authDoctor, toggleChatAvailability);

// Get active sessions
router.get('/sessions', authDoctor, getDoctorActiveSessions);

// Get revenue/earnings
router.get('/revenue', authDoctor, getDoctorChatRevenue);

// Start chat session
router.post('/start', authDoctor, doctorStartChat);

// End chat session
router.post('/end', authDoctor, doctorEndChat);

export default router;
