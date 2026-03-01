import express from "express";
import {
  getOrCreateChat,
  sendMessage,
  getUserChats,
  sendDoctorMessage,
  getDoctorChats,
  markMessagesAsRead,
  markMessagesAsReadByDoctor,
  deleteChat,
} from "../controllers/doctorChatController.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";

const router = express.Router();

// User routes
router.get("/user/chats", authUser, getUserChats);
router.get("/user/chat/:doctorId", authUser, getOrCreateChat);
router.post("/user/chat/:doctorId/send", authUser, sendMessage);
router.put("/user/chat/:doctorId/read", authUser, markMessagesAsRead);
router.delete("/user/chat/:doctorId", authUser, deleteChat);

// Doctor routes
router.get("/doctor/chats", authDoctor, getDoctorChats);
router.post("/doctor/chat/:userId/send", authDoctor, sendDoctorMessage);
router.put("/doctor/chat/:userId/read", authDoctor, markMessagesAsReadByDoctor);

export default router;
