import { Server } from 'socket.io';
import ChatSession from '../models/chatSessionModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import { chatBillingService } from './chatBillingService.js';

let io = null;

// Initialize Socket.IO
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Store io globally for access in other modules
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user/doctor room
    socket.on('join', async (data) => {
      const { userId, doctorId, sessionId, role } = data;
      
      if (role === 'user' && userId) {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
      }
      
      if (role === 'doctor' && doctorId) {
        socket.join(`doctor_${doctorId}`);
        console.log(`Doctor ${doctorId} joined their room`);
      }

      if (sessionId) {
        socket.join(`session_${sessionId}`);
        console.log(`Socket joined session ${sessionId}`);
      }
    });

    // Join paid chat session
    socket.on('join_paid_session', async (data) => {
      const { sessionId, role } = data;
      
      try {
        const session = await ChatSession.findOne({ sessionId });
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Join session room
        socket.join(`session_${sessionId}`);
        
        if (role === 'user') {
          socket.join(`user_${session.userId}`);
        } else if (role === 'doctor') {
          socket.join(`doctor_${session.doctorId}`);
        }

        // Notify both parties that someone joined
        socket.to(`session_${sessionId}`).emit('user_joined', {
          role,
          timestamp: new Date()
        });

        // Send current session status
        const billingStatus = await chatBillingService.getBillingStatus(sessionId);
        socket.emit('session_status', billingStatus);

        console.log(`${role} joined paid session ${sessionId}`);

      } catch (error) {
        console.error('Join paid session error:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Send message in paid chat
    socket.on('send_paid_message', async (data) => {
      const { sessionId, message, sender } = data;
      
      try {
        const session = await ChatSession.findOne({ 
          sessionId, 
          isActive: true,
          status: 'ongoing'
        });

        if (!session) {
          socket.emit('error', { 
            message: 'Session not active or funds depleted',
            code: 'SESSION_INACTIVE'
          });
          return;
        }

        // Check if session has balance
        if (session.billing.currentBalance <= 0) {
          socket.emit('error', {
            message: 'Insufficient balance. Please add credits.',
            code: 'INSUFFICIENT_FUNDS'
          });
          return;
        }

        // Save message
        const newMessage = {
          sender,
          message: message.trim(),
          timestamp: new Date(),
          billed: false
        };

        session.messages.push(newMessage);
        await session.save();

        // Broadcast message to session
        io.to(`session_${sessionId}`).emit('new_message', {
          sender,
          message: message.trim(),
          timestamp: newMessage.timestamp,
          sessionId
        });

        // Send updated balance
        const billingStatus = await chatBillingService.getBillingStatus(sessionId);
        io.to(`user_${session.userId}`).emit('balance_update', {
          currentBalance: billingStatus.currentBalance,
          minutesUsed: billingStatus.minutesUsed,
          minutesRemaining: billingStatus.minutesRemaining
        });

      } catch (error) {
        console.error('Send paid message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { sessionId, role } = data;
      socket.to(`session_${sessionId}`).emit('typing', { role });
    });

    // Stop typing
    socket.on('stop_typing', (data) => {
      const { sessionId } = data;
      socket.to(`session_${sessionId}`).emit('stop_typing');
    });

    // End session
    socket.on('end_session', async (data) => {
      const { sessionId, reason } = data;
      
      try {
        const session = await ChatSession.findOne({ sessionId });
        
        if (!session) return;

        // Stop billing
        chatBillingService.stopBilling(sessionId);

        session.status = 'completed';
        session.isActive = false;
        session.endedAt = new Date();
        session.disconnectionReason = reason || 'user_initiated';
        await session.save();

        // Notify both parties
        io.to(`session_${sessionId}`).emit('session_ended', {
          sessionId,
          reason: reason || 'user_initiated',
          finalDuration: session.duration,
          totalCharged: session.billing.totalAmountCharged / 100
        });

        // Leave room
        socket.leave(`session_${sessionId}`);

        console.log(`Session ${sessionId} ended: ${reason}`);

      } catch (error) {
        console.error('End session error:', error);
      }
    });

    // Add more credits to active session
    socket.on('add_credits', async (data) => {
      const { sessionId, amount } = data;
      
      try {
        const result = await chatBillingService.addCreditsToSession(sessionId, amount * 100);
        
        if (result.success) {
          socket.emit('credits_added', {
            newBalance: result.newBalance,
            minutesAdded: result.minutesAdded
          });
        } else {
          socket.emit('error', { message: result.message });
        }

      } catch (error) {
        console.error('Add credits error:', error);
        socket.emit('error', { message: 'Failed to add credits' });
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

// Helper functions to send notifications
export const sendLowBalanceWarning = (userId, data) => {
  if (io) {
    io.to(`user_${userId}`).emit('low_balance_warning', data);
  }
};

export const sendSessionEnded = (userId, data) => {
  if (io) {
    io.to(`user_${userId}`).emit('session_ended', data);
  }
};

export const sendNewMessage = (sessionId, message) => {
  if (io) {
    io.to(`session_${sessionId}`).emit('new_message', message);
  }
};

export const getIO = () => io;

export default { initializeSocket, sendLowBalanceWarning, sendSessionEnded, sendNewMessage, getIO };
