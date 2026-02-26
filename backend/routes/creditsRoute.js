import express from 'express';
import {
  getUserCredits,
  createCreditsOrder,
  verifyCreditsPayment,
  deductCredits,
  getCreditPackages,
  handleRazorpayWebhook
} from '../controllers/creditsController.js';
import authUser from "../middlewares/authUser.js";
import { checkAndCreditPendingPayments, manualCreditUser } from '../utils/paymentUtils.js';
import userModel from '../models/userModel.js';

const router = express.Router();

// Get user credits
router.get('/balance', authUser, getUserCredits);

// Get available credit packages
router.get('/packages', getCreditPackages);

// Create order for credits purchase
router.post('/purchase-order', authUser, createCreditsOrder);

// Verify payment and add credits
router.post('/verify-payment', authUser, verifyCreditsPayment);

// Deduct credits for consultation
router.post('/deduct', authUser, deductCredits);

// Razorpay webhook endpoint (no auth required)
router.post('/razorpay-webhook', handleRazorpayWebhook);

// Admin endpoint to check and credit pending payments
router.post('/check-pending-payments', authUser, async (req, res) => {
  try {
    const result = await checkAndCreditPendingPayments(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin endpoint to manually add credits (for testing)
router.post('/admin-add-credits', async (req, res) => {
  try {
    const { email, credits } = req.body;
    
    if (!email || !credits) {
      return res.status(400).json({ success: false, message: 'Email and credits required' });
    }
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const result = await manualCreditUser(user._id, credits, 'Manual addition for testing');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
