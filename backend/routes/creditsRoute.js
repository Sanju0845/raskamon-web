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

export default router;
