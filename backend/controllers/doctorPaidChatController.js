import ChatPricing from '../models/chatPricingModel.js';
import ChatSession from '../models/chatSessionModel.js';
import doctorModel from '../models/doctorModel.js';

// Set or update doctor chat pricing
export const setChatPricing = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { 
      chatPricePerMinute, 
      callPricePerMinute,
      minimumDuration,
      maximumDuration,
      isAvailableForChat,
      isAvailableForCall
    } = req.body;

    // Validate pricing
    if (!chatPricePerMinute || chatPricePerMinute < 1) {
      return res.status(400).json({
        success: false,
        message: 'Chat price per minute must be at least ₹1'
      });
    }

    // Find or create pricing
    let pricing = await ChatPricing.findOne({ doctorId });
    
    if (!pricing) {
      pricing = new ChatPricing({
        doctorId,
        chat: {
          pricePerMinute: chatPricePerMinute,
          currency: 'INR',
          minimumDuration: minimumDuration || 5,
          maximumDuration: maximumDuration || 60,
          minimumCharge: chatPricePerMinute * (minimumDuration || 5) * 100
        },
        call: {
          pricePerMinute: callPricePerMinute || chatPricePerMinute,
          currency: 'INR',
          minimumDuration: minimumDuration || 5,
          maximumDuration: maximumDuration || 60,
          minimumCharge: (callPricePerMinute || chatPricePerMinute) * (minimumDuration || 5) * 100
        },
        isAvailableForChat: isAvailableForChat || false,
        isAvailableForCall: isAvailableForCall || false
      });
    } else {
      // Update existing pricing
      pricing.chat.pricePerMinute = chatPricePerMinute;
      pricing.chat.minimumDuration = minimumDuration || pricing.chat.minimumDuration;
      pricing.chat.maximumDuration = maximumDuration || pricing.chat.maximumDuration;
      pricing.chat.minimumCharge = chatPricePerMinute * (minimumDuration || pricing.chat.minimumDuration) * 100;

      if (callPricePerMinute) {
        pricing.call.pricePerMinute = callPricePerMinute;
        pricing.call.minimumCharge = callPricePerMinute * (minimumDuration || pricing.call.minimumDuration) * 100;
      }

      pricing.isAvailableForChat = isAvailableForChat !== undefined ? isAvailableForChat : pricing.isAvailableForChat;
      pricing.isAvailableForCall = isAvailableForCall !== undefined ? isAvailableForCall : pricing.isAvailableForCall;
    }

    await pricing.save();

    res.status(200).json({
      success: true,
      message: 'Chat pricing updated successfully',
      pricing: {
        chat: {
          pricePerMinute: pricing.chat.pricePerMinute,
          minimumDuration: pricing.chat.minimumDuration,
          maximumDuration: pricing.chat.maximumDuration,
          minimumCharge: pricing.chat.minimumCharge / 100
        },
        call: {
          pricePerMinute: pricing.call.pricePerMinute,
          minimumDuration: pricing.call.minimumDuration,
          maximumDuration: pricing.call.maximumDuration,
          minimumCharge: pricing.call.minimumCharge / 100
        },
        isAvailableForChat: pricing.isAvailableForChat,
        isAvailableForCall: pricing.isAvailableForCall
      }
    });

  } catch (error) {
    console.error('Set chat pricing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Get doctor's chat pricing
export const getDoctorChatPricing = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const pricing = await ChatPricing.findOne({ doctorId });

    if (!pricing) {
      return res.status(200).json({
        success: true,
        pricing: null,
        message: 'No pricing set yet'
      });
    }

    res.status(200).json({
      success: true,
      pricing: {
        chat: {
          pricePerMinute: pricing.chat.pricePerMinute,
          minimumDuration: pricing.chat.minimumDuration,
          maximumDuration: pricing.chat.maximumDuration,
          minimumCharge: pricing.chat.minimumCharge / 100
        },
        call: {
          pricePerMinute: pricing.call.pricePerMinute,
          minimumDuration: pricing.call.minimumDuration,
          maximumDuration: pricing.call.maximumDuration,
          minimumCharge: pricing.call.minimumCharge / 100
        },
        isAvailableForChat: pricing.isAvailableForChat,
        isAvailableForCall: pricing.isAvailableForCall,
        platformCommission: pricing.platformCommission
      }
    });

  } catch (error) {
    console.error('Get doctor chat pricing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Toggle chat availability
export const toggleChatAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { isAvailableForChat, isAvailableForCall } = req.body;

    let pricing = await ChatPricing.findOne({ doctorId });

    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: 'Please set chat pricing first'
      });
    }

    if (isAvailableForChat !== undefined) {
      pricing.isAvailableForChat = isAvailableForChat;
    }
    
    if (isAvailableForCall !== undefined) {
      pricing.isAvailableForCall = isAvailableForCall;
    }

    await pricing.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated',
      isAvailableForChat: pricing.isAvailableForChat,
      isAvailableForCall: pricing.isAvailableForCall
    });

  } catch (error) {
    console.error('Toggle chat availability error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Get doctor's active chat sessions
export const getDoctorActiveSessions = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const sessions = await ChatSession.find({
      doctorId,
      status: { $in: ['ongoing', 'paused', 'booked'] }
    })
    .populate('userId', 'name email image')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        user: s.userId,
        status: s.status,
        pricePerMinute: s.pricePerMinute,
        startedAt: s.startedAt,
        duration: s.duration,
        billing: {
          totalCharged: s.billing.totalAmountCharged / 100,
          minutesUsed: s.billing.minutesUsed,
          currentBalance: s.billing.currentBalance / 100
        }
      }))
    });

  } catch (error) {
    console.error('Get doctor active sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Get doctor's chat earnings/revenue
export const getDoctorChatRevenue = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { period = 'all' } = req.query; // all, today, week, month

    let dateFilter = {};
    const now = new Date();

    if (period === 'today') {
      dateFilter = {
        createdAt: {
          $gte: new Date(now.setHours(0, 0, 0, 0))
        }
      };
    } else if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    const sessions = await ChatSession.find({
      doctorId,
      status: { $in: ['completed', 'disconnected_funds_depleted'] },
      ...dateFilter
    });

    const totalRevenue = sessions.reduce((sum, s) => sum + s.billing.totalAmountCharged, 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + s.billing.minutesUsed, 0);
    const totalSessions = sessions.length;

    // Calculate platform commission
    const pricing = await ChatPricing.findOne({ doctorId });
    const commission = pricing ? pricing.platformCommission : 20;
    const netRevenue = totalRevenue * (100 - commission) / 100;

    res.status(200).json({
      success: true,
      revenue: {
        totalRevenue: totalRevenue / 100,
        netRevenue: netRevenue / 100,
        platformCommission: commission,
        commissionAmount: (totalRevenue * commission / 100) / 100,
        totalMinutes,
        totalSessions,
        averagePerSession: totalSessions > 0 ? (totalRevenue / totalSessions / 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Get doctor chat revenue error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Start chat session (doctor side)
export const doctorStartChat = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { sessionId } = req.body;

    const session = await ChatSession.findOne({ sessionId, doctorId });
    
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

    // Start billing
    const { chatBillingService } = await import('../services/chatBillingService.js');
    chatBillingService.startBilling(sessionId);

    res.status(200).json({
      success: true,
      message: 'Chat session started',
      session: {
        sessionId: session.sessionId,
        status: 'ongoing',
        startedAt: session.startedAt
      }
    });

  } catch (error) {
    console.error('Doctor start chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// End chat session (doctor side)
export const doctorEndChat = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { sessionId } = req.body;

    const session = await ChatSession.findOne({ sessionId, doctorId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Stop billing
    const { chatBillingService } = await import('../services/chatBillingService.js');
    chatBillingService.stopBilling(sessionId);

    session.status = 'completed';
    session.isActive = false;
    session.endedAt = new Date();
    session.disconnectionReason = 'doctor_initiated';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Chat session ended',
      session: {
        sessionId: session.sessionId,
        status: 'completed',
        duration: session.duration,
        totalCharged: session.billing.totalAmountCharged / 100
      }
    });

  } catch (error) {
    console.error('Doctor end chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
