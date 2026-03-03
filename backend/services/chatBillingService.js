import ChatSession from '../models/chatSessionModel.js';
import userModel from '../models/userModel.js';
import { sendLowBalanceWarning, sendSessionEnded } from '../services/socketService.js';

// Billing service for per-minute chat sessions
class ChatBillingService {
  constructor() {
    // Store active billing intervals
    this.activeBillings = new Map(); // sessionId -> interval
    this.BILLING_INTERVAL = 60000; // 1 minute in ms
    this.WARNING_THRESHOLDS = [5, 3, 1]; // Minutes remaining warnings
  }

  // Start billing for a session
  startBilling(sessionId) {
    if (this.activeBillings.has(sessionId)) {
      console.log(`Billing already active for session ${sessionId}`);
      return;
    }

    console.log(`Starting billing for session ${sessionId}`);

    const interval = setInterval(async () => {
      await this.processBillingCycle(sessionId);
    }, this.BILLING_INTERVAL);

    this.activeBillings.set(sessionId, interval);
  }

  // Pause billing
  pauseBilling(sessionId) {
    if (this.activeBillings.has(sessionId)) {
      clearInterval(this.activeBillings.get(sessionId));
      this.activeBillings.delete(sessionId);
      console.log(`Billing paused for session ${sessionId}`);
    }
  }

  // Resume billing
  resumeBilling(sessionId) {
    this.startBilling(sessionId);
  }

  // Stop billing completely
  stopBilling(sessionId) {
    if (this.activeBillings.has(sessionId)) {
      clearInterval(this.activeBillings.get(sessionId));
      this.activeBillings.delete(sessionId);
      console.log(`Billing stopped for session ${sessionId}`);
    }
  }

  // Process a billing cycle
  async processBillingCycle(sessionId) {
    try {
      const session = await ChatSession.findOne({ sessionId, isActive: true });
      
      if (!session) {
        this.stopBilling(sessionId);
        return;
      }

      const pricePerMinutePaise = session.pricePerMinute * 100;
      const currentBalance = session.billing.currentBalance;

      // Check if enough balance
      if (currentBalance < pricePerMinutePaise) {
        await this.handleInsufficientFunds(session);
        return;
      }

      // Deduct payment
      session.billing.currentBalance -= pricePerMinutePaise;
      session.billing.totalAmountCharged += pricePerMinutePaise;
      session.billing.minutesUsed += 1;
      session.billing.lastBillingAt = new Date();
      session.duration += 60; // Add 60 seconds

      await session.save();

      // Check for warning thresholds
      await this.checkWarningThresholds(session);

      // Emit balance update to user
      this.emitBalanceUpdate(session);

    } catch (error) {
      console.error(`Billing cycle error for session ${sessionId}:`, error);
    }
  }

  // Handle insufficient funds
  async handleInsufficientFunds(session) {
    console.log(`Insufficient funds for session ${session.sessionId}`);

    // Send warning before ending
    sendLowBalanceWarning(session.userId.toString(), {
      sessionId: session.sessionId,
      message: 'Your balance is depleted. Session will end in 30 seconds.'
    });

    // Wait 30 seconds before ending
    setTimeout(async () => {
      await this.endSessionDueToNoFunds(session);
    }, 30000);

    this.stopBilling(session.sessionId);
  }

  // End session due to no funds
  async endSessionDueToNoFunds(session) {
    try {
      session.status = 'disconnected_funds_depleted';
      session.isActive = false;
      session.endedAt = new Date();
      session.disconnectionReason = 'funds_depleted';
      await session.save();

      // Notify both user and doctor
      sendSessionEnded(session.userId.toString(), {
        sessionId: session.sessionId,
        reason: 'funds_depleted',
        finalDuration: session.duration,
        totalCharged: session.billing.totalAmountCharged / 100
      });

      sendSessionEnded(session.doctorId.toString(), {
        sessionId: session.sessionId,
        reason: 'user_funds_depleted',
        finalDuration: session.duration
      });

      console.log(`Session ${session.sessionId} ended due to insufficient funds`);

    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Check warning thresholds
  async checkWarningThresholds(session) {
    const pricePerMinutePaise = session.pricePerMinute * 100;
    const minutesRemaining = Math.floor(session.billing.currentBalance / pricePerMinutePaise);

    // Check if we've hit a warning threshold
    for (const threshold of this.WARNING_THRESHOLDS) {
      if (minutesRemaining === threshold && !session.billing.warningsSent.includes(threshold)) {
        // Send warning
        sendLowBalanceWarning(session.userId.toString(), {
          sessionId: session.sessionId,
          minutesRemaining,
          message: `You have ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} of chat remaining. Consider adding more credits.`,
          currentBalance: session.billing.currentBalance / 100
        });

        // Mark warning as sent
        session.billing.warningsSent.push(threshold);
        await session.save();
        break; // Only send one warning per cycle
      }
    }
  }

  // Emit balance update
  emitBalanceUpdate(session) {
    const io = global.io;
    if (io) {
      io.to(`user_${session.userId}`).emit('balance_update', {
        sessionId: session.sessionId,
        currentBalance: session.billing.currentBalance / 100,
        minutesUsed: session.billing.minutesUsed,
        minutesRemaining: Math.floor(session.billing.currentBalance / (session.pricePerMinute * 100))
      });
    }
  }

  // Add more credits to active session
  async addCreditsToSession(sessionId, amountPaise) {
    try {
      const session = await ChatSession.findOne({ sessionId, isActive: true });
      
      if (!session) {
        return { success: false, message: 'Active session not found' };
      }

      session.billing.currentBalance += amountPaise;
      await session.save();

      // Resume billing if it was stopped
      if (!this.activeBillings.has(sessionId)) {
        this.startBilling(sessionId);
      }

      // Notify user
      this.emitBalanceUpdate(session);

      return { 
        success: true, 
        newBalance: session.billing.currentBalance / 100,
        minutesAdded: Math.floor(amountPaise / (session.pricePerMinute * 100))
      };

    } catch (error) {
      console.error('Add credits error:', error);
      return { success: false, message: error.message };
    }
  }

  // Get session billing status
  async getBillingStatus(sessionId) {
    try {
      const session = await ChatSession.findOne({ sessionId });
      
      if (!session) {
        return null;
      }

      const pricePerMinutePaise = session.pricePerMinute * 100;
      const minutesRemaining = Math.floor(session.billing.currentBalance / pricePerMinutePaise);

      return {
        sessionId: session.sessionId,
        status: session.status,
        isActive: session.isActive,
        pricePerMinute: session.pricePerMinute,
        currentBalance: session.billing.currentBalance / 100,
        totalCharged: session.billing.totalAmountCharged / 100,
        minutesUsed: session.billing.minutesUsed,
        minutesRemaining,
        duration: session.duration,
        startedAt: session.startedAt,
        warningsSent: session.billing.warningsSent
      };

    } catch (error) {
      console.error('Get billing status error:', error);
      return null;
    }
  }
}

// Singleton instance
export const chatBillingService = new ChatBillingService();
export default chatBillingService;
