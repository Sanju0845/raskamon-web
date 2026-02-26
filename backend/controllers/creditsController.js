import userModel from '../models/userModel.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import express from 'express';

// Get user credits
export const getUserCredits = async (req, res) => {
  try {
    console.log('Getting user credits, req.user:', req.user);
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User found, credits:', user.credits);
    res.status(200).json({
      success: true,
      credits: user.credits,
      plan: user.plan
    });
  } catch (error) {
    console.error('Error getting user credits:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create Razorpay order for credits purchase
export const createCreditsOrder = async (req, res) => {
  try {
    console.log('Creating credits order, req.user:', req.user);
    const { amount } = req.body;

    // Validate amount (minimum 1 rupee, maximum 10000 rupees)
    if (!amount || amount < 1 || amount > 10000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be between ₹1 and ₹10000' 
      });
    }

    // Credits = Amount (1 credit = 1 rupee)
    const credits = amount;

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `credits_${Date.now()}`,
      notes: {
        userId: req.user.id,
        credits: credits,
        type: 'credits_purchase'
      }
    };

    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating credits order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Verify payment and add credits
export const verifyCreditsPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Get order details to extract credits info
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const creditsToAdd = parseInt(order.notes.credits);

    // Add credits to user account
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.credits += creditsToAdd;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully added ${creditsToAdd} credits`,
      newBalance: user.credits
    });
  } catch (error) {
    console.error('Error verifying credits payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Deduct credits for chat/consultation
export const deductCredits = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.credits < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient credits',
        currentBalance: user.credits,
        required: amount
      });
    }

    user.credits -= amount;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Deducted ${amount} credits for ${reason}`,
      newBalance: user.credits
    });
  } catch (error) {
    console.error('Error deducting credits:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get credit packages (now returns suggested amounts instead of fixed packages)
export const getCreditPackages = async (req, res) => {
  try {
    // Suggested amounts for quick selection
    const suggestedAmounts = [
      { amount: 100, description: 'Minimum purchase' },
      { amount: 500, description: 'Most popular' },
      { amount: 1000, description: 'Best value' }
    ];

    res.status(200).json({
      success: true,
      suggestedAmounts
    });
  } catch (error) {
    console.error('Error getting credit packages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Razorpay webhook handler for payment verification
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Razorpay webhook secret not configured');
      return res.status(500).json({ success: false, message: 'Webhook not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Signature missing' });
    }

    // Verify webhook signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    console.log('Webhook received:', req.body);

    const event = req.body.event;
    
    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      const order_id = payment.order_id;
      
      // Get order details to extract user info and credits
      const order = await razorpay.orders.fetch(order_id);
      const userId = order.notes.userId;
      const creditsToAdd = parseInt(order.notes.credits);
      const paymentType = order.notes.type;

      if (paymentType === 'credits_purchase' && userId && creditsToAdd) {
        // Add credits to user account
        const user = await userModel.findById(userId);
        if (user) {
          user.credits += creditsToAdd;
          await user.save();
          
          console.log(`Added ${creditsToAdd} credits to user ${userId} via webhook`);
          
          // You could also send a notification to the user here
          // For example: sendEmailNotification(user.email, 'Credits Added', `Your ${creditsToAdd} credits have been added successfully.`);
        } else {
          console.error('User not found for webhook credit addition:', userId);
        }
      }
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};
