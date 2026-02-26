import express from "express";
import {
  getProfile,
  loginUser,
  registerUser,
  updateProfile,
  bookAppointment,
  bookAppointmentCredits,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  googleLogin,
  getSlotAvailability,
  cancelPayment,
  sendOTP,
  verifyOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  phoneLogin,
  verifyPassword,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import uploadToCloudinary from "../middlewares/report.js";
import { getLocationData, getGeoLocation } from "../services/getLocation.js";
const userRouter = express.Router();

// Auth routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google-login", googleLogin);
userRouter.post("/phone-login", phoneLogin);
userRouter.post("/send-otp", sendOTP);
userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-reset-otp", verifyResetOTP);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/verify-password", authUser, verifyPassword);
userRouter.get("/location", getLocationData);
userRouter.get("/get-geolocation", getGeoLocation);

// Protected routes
userRouter.get("/profile", authUser, getProfile);
userRouter.put(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateProfile
);

// Appointment routes
userRouter.post(
  "/book-appointment",
  authUser,
  uploadToCloudinary.array("file", 5),
  bookAppointment
);
userRouter.post(
  "/book-appointment-credits",
  authUser,
  uploadToCloudinary.array("file", 5),
  bookAppointmentCredits
);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.get("/slot-availability/:docId/:slotDate", getSlotAvailability);

// Payment routes
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verify-razorpay", authUser, verifyRazorpay);
userRouter.post("/cancel-payment", authUser, cancelPayment);

export default userRouter;
