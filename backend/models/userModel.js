import mongoose from "mongoose";

const EmotionSchema = new mongoose.Schema({
  emotion: { type: String, required: true },
  intensity: { type: Number, required: true, min: 1, max: 5 },
});

const SituationSchema = new mongoose.Schema({
  situation: { type: String, required: true },
  emotions: { type: [EmotionSchema], required: true },
  entry_score: { type: Number, required: true },
  final_adjusted: { type: Number, required: true },
  intensities: { type: [Number], default: [] },
  normalized_score: { type: Number, required: true },
  tag_adjustment: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
});

const MoodEntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  mood: { type: String, required: true },
  situations: { type: [SituationSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

//
// ===== User Schema =====
//

const userSchema = new mongoose.Schema(
  {
    // Basic user info
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: false },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dm7mykyfw/image/upload/v1755698435/0684456b-aa2b-4631-86f7-93ceaf33303c_juegb1.jpg",
    },
    address: { type: Object, default: { line1: "", line2: "" } },
    gender: { type: String, default: "Not Selected" },
    dob: { type: String, default: "Not Selected" },
    phone: { type: String, default: "0000000000" },
    joinedDate: { type: Date, default: Date.now },

    // Google OAuth
    googleId: { type: String, unique: true, sparse: true },
    isGoogleUser: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },

    // Firebase Phone Auth
    firebaseUid: { type: String, unique: true, sparse: true },

    // Mood Tracking Preferences
    moodTracking: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ["daily", "twice_daily", "weekly", "custom"],
        default: "daily",
      },
      reminderTimes: {
        type: [String],
        default: ["09:00"],
      },
      aiAnalysisConsent: { type: Boolean, default: false },
      aiAnalysisLevel: {
        type: String,
        enum: ["basic", "detailed", "comprehensive"],
        default: "basic",
      },
      privacySettings: {
        shareWithTherapist: { type: Boolean, default: false },
        shareWithFamily: { type: Boolean, default: false },
        anonymousDataSharing: { type: Boolean, default: false },
      },
      notificationPreferences: {
        moodReminders: { type: Boolean, default: true },
        weeklyInsights: { type: Boolean, default: true },
        crisisAlerts: { type: Boolean, default: true },
        therapistNotifications: { type: Boolean, default: false },
      },
      stats: {
        totalEntries: { type: Number, default: 0 },
        averageMoodScore: { type: Number, default: 0 },
        dominantMood: { type: String, default: "Neutral" },
        lastUpdated: { type: Date },
      },
    },

    // Embedded Mood Entries (your requested part)
    moodEntries: {
      type: [MoodEntrySchema],
      default: [],
    },

    // Credits and Plan
    credits: {
      type: Number,
      default: 500, // free tier credits
    },

    plan: {
      type: String,
      enum: ["free", "pro", "starter"],
      default: "free",
    },

    // Role & Meta
    role: {
      type: String,
      enum: ["user", "therapist", "admin"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ joinedDate: -1 });
userSchema.index({ emailVerified: 1 });
userSchema.index({ isGoogleUser: 1 });
userSchema.index({ name: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ email: 1, isGoogleUser: 1 });
userSchema.index({
  "moodTracking.enabled": 1,
  "moodTracking.aiAnalysisConsent": 1,
});
userSchema.index({ joinedDate: -1, "moodTracking.enabled": 1 });

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
