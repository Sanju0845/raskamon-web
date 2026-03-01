// backend/index.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
// Import models to ensure they're registered
import "./models/appointmentModel.js";
import "./models/doctorModel.js";
import "./models/userModel.js";
// routes
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import doctorChatRouter from './routes/doctorChatRoute.js';
import liveChatRouter from './routes/liveChatRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import assessmentRouter from './routes/assessmentRoute.js';
import testimonialRouter from './routes/testimonialRoute.js';
import analyticsRouter from './routes/userAnalyticsRoute.js';
import chatRouter from './routes/chatRoute.js';
import moodRoute from './routes/moodRoute.js';
import voiceRouter from './routes/voiceRoute.js';
import creditsRouter from './routes/creditsRoute.js';
import blogPostRouter from './routes/blogPostRoute.js';
import uploadRouter from './routes/uploadRoute.js';
import moodTrackingRouter from './routes/moodTrackingRoute.js';
import notificationRouter from './routes/notificationRoute.js';
import notificationService from './services/notificationService.js';

// -------- app config ----------
const app = express();
const port = process.env.PORT || 4000;
app.set("trust proxy", true);

// -------- database ----------
connectDB();
connectCloudinary();

// ✅ AUTO VERIFY GEO INDEX (PRODUCTION ONLY)
mongoose.connection.once("open", async () => {
  console.log("✅ MongoDB connected");

  if (process.env.NODE_ENV === "production") {
    await verifyGeoIndex();
  }
});

// -------- middlewares ---------
app.use(express.json({ limit: "400mb" }));

app.use(
  cors({
    origin: true, // (OK for now, restrict later)
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "token",
      "atoken",
      "dtoken",
    ],
  }),
);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// ------ api endpoints ------
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/moods", moodRoute);
app.use("/api/analytics", analyticsRouter);
app.use("/api/assessments", assessmentRouter);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/blog-posts", blogPostRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/mood-tracking", moodTrackingRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/chat", chatRouter);
app.use("/api/voice", voiceRouter);
app.use("/api/credits", creditsRouter);
app.use("/api/doctor-chat", doctorChatRouter);
app.use("/api/live-chat", liveChatRouter);
app.use("/api/reviews", reviewRouter);

app.get("/", (req, res) => {
  res.send("API WORKING...");
});

app.get("/test", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// -------- error handler --------
app.use((err, req, res, next) => {
  console.error("💥 Error caught:", err.stack || err.message);
  res.status(500).json({ error: "Internal server error" });
});

// -------- port listen -------
app.listen(port, () => {
  console.log("🚀 Server running on port", port);

  notificationService.start();
  console.log("🔔 Notification service started");
});
