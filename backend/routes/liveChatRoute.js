import express from "express";
import {
  getOrCreateChat,
  sendMessage,
  getUserChats,
  sendDoctorMessage,
  getDoctorChats,
  getDoctorUserChat,
  markMessagesAsRead,
  markMessagesAsReadByDoctor,
  getUnreadCount,
  getDoctorUnreadCount,
} from "../controllers/liveChatController.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";

const router = express.Router();

// User routes
router.get("/user/chats", authUser, getUserChats);
router.get("/user/chat/:doctorId", authUser, getOrCreateChat);
router.get("/user/chat/:doctorId/unread", authUser, getUnreadCount);
router.post("/user/chat/:doctorId/send", authUser, sendMessage);
router.put("/user/chat/:doctorId/read", authUser, markMessagesAsRead);

// Doctor routes
router.get("/doctor/chats", authDoctor, getDoctorChats);
router.get("/doctor/chat/:userId", authDoctor, getDoctorUserChat);
router.get("/doctor/unread-count", authDoctor, getDoctorUnreadCount);
router.post("/doctor/chat/:userId/send", authDoctor, sendDoctorMessage);
router.put("/doctor/chat/:userId/read", authDoctor, markMessagesAsReadByDoctor);

export default router;
