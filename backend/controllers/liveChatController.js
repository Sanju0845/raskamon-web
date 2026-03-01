import { chatModel } from "../models/chatModel.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";

// Get or create chat between user and doctor
export const getOrCreateChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId } = req.params;

    // Verify doctor exists
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Find existing chat
    let chat = await chatModel.findOne({
      userId,
      doctorId,
      isActive: true
    }).populate('doctorId', 'name speciality image').populate('userId', 'name email image');

    // If no chat exists, create one
    if (!chat) {
      chat = new chatModel({
        userId,
        doctorId,
        messages: [],
        lastMessage: '',
        isActive: true
      });
      await chat.save();
      
      // Populate both user and doctor info
      chat = await chatModel.findById(chat._id)
        .populate('doctorId', 'name speciality image')
        .populate('userId', 'name email image');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send message in chat
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Find chat
    let chat = await chatModel.findOne({
      userId,
      doctorId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Add new message
    const newMessage = {
      sender: 'user',
      message: message.trim(),
      timestamp: new Date(),
      read: false,
      _id: new Date().getTime().toString()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message.trim();
    chat.lastMessageTime = new Date();
    chat.lastMessageSender = 'user';
    await chat.save();

    // Populate user and doctor info for response
    chat = await chatModel.findById(chat._id)
      .populate('doctorId', 'name speciality image')
      .populate('userId', 'name email image');

    res.status(200).json({ 
      success: true, 
      message: "Message sent successfully",
      chat,
      newMessage 
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await chatModel
      .find({ userId, isActive: true })
      .populate('doctorId', 'name speciality image')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send message from doctor
export const sendDoctorMessage = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { userId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Find chat
    let chat = await chatModel.findOne({
      userId,
      doctorId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Add doctor message
    const newMessage = {
      sender: 'doctor',
      message: message.trim(),
      timestamp: new Date(),
      read: true,
      _id: new Date().getTime().toString()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message.trim();
    chat.lastMessageTime = new Date();
    chat.lastMessageSender = 'doctor';
    await chat.save();

    // Populate user and doctor info for response
    chat = await chatModel.findById(chat._id)
      .populate('doctorId', 'name speciality image')
      .populate('userId', 'name email image');

    res.status(200).json({ 
      success: true, 
      message: "Message sent successfully",
      chat,
      newMessage 
    });
  } catch (error) {
    console.error("Send doctor message error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all chats for a doctor
export const getDoctorChats = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const chats = await chatModel
      .find({ doctorId, isActive: true })
      .populate('userId', 'name email image')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Get doctor chats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get chat between doctor and specific user
export const getDoctorUserChat = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { userId } = req.params;

    const chat = await chatModel
      .findOne({ doctorId, userId, isActive: true })
      .populate('doctorId', 'name speciality image')
      .populate('userId', 'name email image');

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("Get doctor user chat error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId } = req.params;

    const chat = await chatModel.findOne({
      userId,
      doctorId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Mark all messages from other sender as read
    chat.messages.forEach(msg => {
      if (msg.sender !== 'user') {
        msg.read = true;
      }
    });

    await chat.save();

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark messages as read by doctor
export const markMessagesAsReadByDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { userId } = req.params;

    const chat = await chatModel.findOne({
      userId,
      doctorId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Mark all user messages as read
    chat.messages.forEach(msg => {
      if (msg.sender === 'user') {
        msg.read = true;
      }
    });

    await chat.save();

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get unread message count for user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId } = req.params;

    const chat = await chatModel.findOne({
      userId,
      doctorId,
      isActive: true
    });

    if (!chat) {
      return res.status(200).json({ success: true, unreadCount: 0 });
    }

    const unreadCount = chat.messages.filter(msg => 
      msg.sender === 'doctor' && !msg.read
    ).length;

    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get total unread message count for doctor
export const getDoctorUnreadCount = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const chats = await chatModel.find({ doctorId, isActive: true });
    
    let totalUnread = 0;
    chats.forEach(chat => {
      const unreadCount = chat.messages.filter(msg => 
        msg.sender === 'user' && !msg.read
      ).length;
      totalUnread += unreadCount;
    });

    res.status(200).json({ success: true, unreadCount: totalUnread });
  } catch (error) {
    console.error("Get doctor unread count error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
