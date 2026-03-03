import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
  // Booking Details
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Pricing Configuration
  pricePerMinute: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['credits', 'razorpay', 'mixed'],
    required: true
  },
  
  // Initial Payment
  initialPayment: {
    amount: { type: Number, required: true }, // In paise for Razorpay, in rupees for credits
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String }
  },
  
  // Session Status
  status: {
    type: String,
    enum: ['booked', 'ongoing', 'paused', 'completed', 'disconnected_funds_depleted', 'cancelled'],
    default: 'booked'
  },
  
  // Session Timing
  scheduledAt: {
    type: Date,
    required: true
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  
  // Billing Tracking
  billing: {
    totalAmountCharged: { type: Number, default: 0 }, // Total charged so far
    minutesUsed: { type: Number, default: 0 },
    lastBillingAt: { type: Date },
    currentBalance: { type: Number, required: true }, // Remaining balance in paise
    warningsSent: [{ type: Number }] // Minutes remaining when warning was sent
  },
  
  // Real-time Session Data
  isActive: {
    type: Boolean,
    default: false
  },
  
  // Messages (Embedded for quick access during session)
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'doctor'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    billed: {
      type: Boolean,
      default: false // Mark true after billing for this message period
    }
  }],
  
  // Disconnection Reason
  disconnectionReason: {
    type: String,
    enum: ['user_initiated', 'doctor_initiated', 'funds_depleted', 'timeout', 'technical_error', 'session_completed']
  },
  
  // Cancellation Details
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  refundStatus: {
    type: String,
    enum: ['none', 'partial', 'full', 'processing', 'completed'],
    default: 'none'
  },
  refundAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
ChatSessionSchema.index({ userId: 1, status: 1 });
ChatSessionSchema.index({ doctorId: 1, status: 1 });
ChatSessionSchema.index({ sessionId: 1 });
ChatSessionSchema.index({ isActive: 1, startedAt: 1 });

const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);
export default ChatSession;
