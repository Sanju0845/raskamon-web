import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString(),
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'bot'],
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

// Indexes for performance
ChatMessageSchema.index({ userId: 1, isActive: 1 });
ChatMessageSchema.index({ userId: 1, sessionId: 1 });
ChatMessageSchema.index({ 'messages.timestamp': 1 });

const ChatMessageModel = mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);
export default ChatMessageModel;
