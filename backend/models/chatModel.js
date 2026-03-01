import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'doctor',
    required: true,
  },
  messages: [{
    _id: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'doctor'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    read: {
      type: Boolean,
      default: false,
    },
  }],
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageTime: {
    type: Date,
    default: Date.now,
  },
  lastMessageSender: {
    type: String,
    enum: ['user', 'doctor'],
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

chatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const chatModel = mongoose.models.chatModel || mongoose.model("chatModel", chatSchema);
