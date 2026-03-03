import mongoose from 'mongoose';

const ChatPricingSchema = new mongoose.Schema({
  // Doctor-specific pricing
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    unique: true
  },
  
  // Chat Pricing
  chat: {
    pricePerMinute: {
      type: Number,
      required: true,
      min: 1,
      default: 10 // ₹10 per minute default
    },
    currency: {
      type: String,
      default: 'INR'
    },
    minimumDuration: {
      type: Number, // Minimum duration in minutes
      default: 5
    },
    maximumDuration: {
      type: Number, // Maximum duration in minutes
      default: 60
    },
    minimumCharge: {
      type: Number, // Minimum charge in paise
      default: 500 // ₹5 minimum
    }
  },
  
  // Call Pricing (if video/voice calls are supported)
  call: {
    pricePerMinute: {
      type: Number,
      required: true,
      min: 1,
      default: 15 // ₹15 per minute default
    },
    currency: {
      type: String,
      default: 'INR'
    },
    minimumDuration: {
      type: Number,
      default: 5
    },
    maximumDuration: {
      type: Number,
      default: 60
    },
    minimumCharge: {
      type: Number,
      default: 750 // ₹7.50 minimum
    }
  },
  
  // Availability
  isAvailableForChat: {
    type: Boolean,
    default: false
  },
  
  isAvailableForCall: {
    type: Boolean,
    default: false
  },
  
  // Availability Schedule (optional)
  availabilitySchedule: [{
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: { type: String }, // HH:mm format
    endTime: { type: String } // HH:mm format
  }],
  
  // Special Offers
  offers: [{
    code: String,
    discountPercentage: Number,
    validFrom: Date,
    validUntil: Date,
    minDuration: Number,
    isActive: { type: Boolean, default: true }
  }],
  
  // Platform Commission
  platformCommission: {
    type: Number,
    default: 20, // 20% commission
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes
ChatPricingSchema.index({ doctorId: 1 });
ChatPricingSchema.index({ isAvailableForChat: 1 });

const ChatPricing = mongoose.models.ChatPricing || mongoose.model('ChatPricing', ChatPricingSchema);
export default ChatPricing;
