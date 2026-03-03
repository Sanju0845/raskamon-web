import ChatSession from '../models/chatSessionModel.js';
import ChatPricing from '../models/chatPricingModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Book a chat session (create order)
export const bookChatSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId, sessionType = 'chat', estimatedMinutes = 15, paymentMethod } = req.body;

    if (!doctorId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and payment method are required'
      });
    }

    // Get doctor pricing
    const pricing = await ChatPricing.findOne({ doctorId });
    if (!pricing || !pricing.isAvailableForChat) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available for chat sessions'
      });
    }

    const pricePerMinute = sessionType === 'call' 
      ? pricing.call.pricePerMinute 
      : pricing.chat.pricePerMinute;

    // Calculate estimated cost
    const estimatedCost = Math.max(
      pricing.chat.minimumCharge,
      pricePerMinute * estimatedMinutes * 100 // Convert to paise
    );

    const user = await userModel.findById(userId);
    let orderDetails = null;
    let creditsToUse = 0;
    let razorpayAmount = 0;

    // Handle different payment methods
    if (paymentMethod === 'credits') {
      // Check if user has enough credits
      if (user.credits < estimatedCost / 100) { // credits in rupees
        return res.status(400).json({
          success: false,
          message: `Insufficient credits. Required: ₹${estimatedCost/100}, Available: ₹${user.credits}`,
          required: estimatedCost / 100,
          available: user.credits
        });
      }
      
      creditsToUse = estimatedCost / 100;
      
    } else if (paymentMethod === 'razorpay') {
      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: estimatedCost,
        currency: 'INR',
        receipt: `chat_${Date.now()}`,
        notes: {
          userId,
          doctorId,
          sessionType,
          estimatedMinutes
        }
      });
      
      orderDetails = order;
      razorpayAmount = estimatedCost;
      
    } else if (paymentMethod === 'mixed') {
      // Use available credits + Razorpay for remainder
      const availableCreditsInPaise = user.credits * 100;
      
      if (availableCreditsInPaise >= estimatedCost) {
        // Full credits payment
        creditsToUse = estimatedCost / 100;
        paymentMethod = 'credits';
      } else {
        // Mixed payment
        creditsToUse = user.credits;
        razorpayAmount = estimatedCost - availableCreditsInPaise;
        
        const order = await razorpay.orders.create({
          amount: razorpayAmount,
          currency: 'INR',
          receipt: `chat_mixed_${Date.now()}`,
          notes: {
            userId,
            doctorId,
            sessionType,
            estimatedMinutes,
            creditsUsed: creditsToUse
          }
        });
        
        orderDetails = order;
      }
    }

    // Create session record
    const session = new ChatSession({
      userId,
      doctorId,
      sessionId: uuidv4(),
      pricePerMinute,
      currency: 'INR',
      paymentMethod,
      initialPayment: {
        amount: estimatedCost,
        razorpayOrderId: orderDetails?.id
      },
      status: 'booked',
      scheduledAt: new Date(),
      billing: {
        totalAmountCharged: 0,
        minutesUsed: 0,
        currentBalance: estimatedCost,
        warningsSent: []
      }
    });

    await session.save();

    // If using credits, deduct immediately
    if (paymentMethod === 'credits' || creditsToUse > 0) {
      user.credits -= creditsToUse;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Chat session booked successfully',
      session: {
        sessionId: session.sessionId,
        doctorId,
        status: session.status,
        pricePerMinute,
        estimatedMinutes,
        estimatedCost: estimatedCost / 100,
        creditsUsed: creditsToUse,
        razorpayAmount: razorpayAmount / 100
      },
      razorpayOrder: orderDetails ? {
        id: orderDetails.id,
        amount: orderDetails.amount,
        currency: orderDetails.currency
      } : null
    });

  } catch (error) {
    console.error('Book chat session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Verify Razorpay payment and start session
export const verifyChatPayment = async (req, res) => {
  try {
    const { sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user.id;

    const session = await ChatSession.findOne({ sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update session with payment details
    session.initialPayment.razorpayPaymentId = razorpayPaymentId;
    session.initialPayment.razorpaySignature = razorpaySignature;
    session.status = 'ongoing';
    session.startedAt = new Date();
    session.isActive = true;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified. Chat session started!',
      session: {
        sessionId: session.sessionId,
        status: 'ongoing',
        startedAt: session.startedAt,
        pricePerMinute: session.pricePerMinute,
        currentBalance: session.billing.currentBalance / 100
      }
    });

  } catch (error) {
    console.error('Verify chat payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Start session (for credit-based payments)
export const startChatSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    const session = await ChatSession.findOne({ sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'booked') {
      return res.status(400).json({
        success: false,
        message: `Session is ${session.status}, cannot start`
      });
    }

    session.status = 'ongoing';
    session.startedAt = new Date();
    session.isActive = true;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Chat session started!',
      session: {
        sessionId: session.sessionId,
        status: 'ongoing',
        startedAt: session.startedAt,
        pricePerMinute: session.pricePerMinute,
        currentBalance: session.billing.currentBalance / 100
      }
    });

  } catch (error) {
    console.error('Start chat session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Get available doctors for chat
export const getAvailableChatDoctors = async (req, res) => {
  try {
    const pricings = await ChatPricing.find({ 
      isAvailableForChat: true 
    }).populate('doctorId', 'name speciality image experience about fees');

    const doctors = pricings.map(p => ({
      doctorId: p.doctorId._id,
      name: p.doctorId.name,
      speciality: p.doctorId.speciality,
      image: p.doctorId.image,
      experience: p.doctorId.experience,
      about: p.doctorId.about,
      pricePerMinute: p.chat.pricePerMinute,
      minimumDuration: p.chat.minimumDuration,
      maximumDuration: p.chat.maximumDuration,
      minimumCharge: p.chat.minimumCharge / 100,
      isAvailableForCall: p.isAvailableForCall,
      callPricePerMinute: p.call?.pricePerMinute
    }));

    res.status(200).json({
      success: true,
      doctors
    });

  } catch (error) {
    console.error('Get available chat doctors error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Get user's active/scheduled sessions
export const getUserChatSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sessions = await ChatSession.find({
      userId,
      status: { $in: ['booked', 'ongoing', 'paused'] }
    })
    .populate('doctorId', 'name speciality image')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        doctor: s.doctorId,
        status: s.status,
        pricePerMinute: s.pricePerMinute,
        startedAt: s.startedAt,
        duration: s.duration,
        currentBalance: s.billing.currentBalance / 100,
        minutesUsed: s.billing.minutesUsed
      }))
    });

  } catch (error) {
    console.error('Get user chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Cancel session and process refund if applicable
export const cancelChatSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    const session = await ChatSession.findOne({ sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!['booked', 'ongoing', 'paused'].includes(session.status)) {
      return res.status(400).json({
        success: false,
        message: 'Session cannot be cancelled'
      });
    }

    const user = await userModel.findById(userId);
    const refundAmount = session.billing.currentBalance;

    // Refund remaining credits
    if (refundAmount > 0) {
      if (session.paymentMethod === 'credits' || session.paymentMethod === 'mixed') {
        user.credits += refundAmount / 100;
        await user.save();
      }
      
      // If Razorpay payment, initiate refund
      if (session.initialPayment.razorpayPaymentId && refundAmount > 0) {
        try {
          await razorpay.payments.refund(session.initialPayment.razorpayPaymentId, {
            amount: refundAmount
          });
          session.refundStatus = 'processing';
        } catch (refundError) {
          console.error('Razorpay refund error:', refundError);
          session.refundStatus = 'none';
        }
      }
    }

    session.status = 'cancelled';
    session.cancelledAt = new Date();
    session.isActive = false;
    session.refundAmount = refundAmount / 100;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session cancelled successfully',
      refund: {
        amount: refundAmount / 100,
        status: session.refundStatus
      }
    });

  } catch (error) {
    console.error('Cancel chat session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
