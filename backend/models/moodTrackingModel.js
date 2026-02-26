import mongoose from "mongoose";

// Schema for individual mood entries
const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  moodLabel: {
    type: String,
    required: true,
    enum: [
      "very_happy",
      "happy",
      "neutral",
      "sad",
      "very_sad",
      "anxious",
      "stressed",
      "excited",
      "calm",
      "angry",
    ],
  },
  activities: [
    {
      type: String,
      enum: [
        "exercise",
        "work",
        "social",
        "sleep",
        "eating",
        "hobby",
        "family",
        "travel",
        "study",
        "other",
      ],
    },
  ],
  textFeedback: {
    type: String,
    maxLength: 1000,
  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number], // [longitude, latitude]
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number,
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24,
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10,
  },
  socialInteraction: {
    type: Number,
    min: 1,
    max: 10,
  },
  tags: [String], // Custom tags for categorization
  isPublic: {
    type: Boolean,
    default: false,
  },
});

// Schema for AI analysis results
const aiAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  analysisDate: {
    type: Date,
    default: Date.now,
  },
  analysisType: {
    type: String,
    enum: ["daily", "weekly", "monthly", "crisis", "pattern"],
    required: true,
  },
  moodTrend: {
    direction: {
      type: String,
      enum: ["improving", "declining", "stable", "fluctuating"],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    factors: [String],
  },
  patterns: {
    triggers: [
      {
        factor: String,
        impact: Number, // -1 to 1 scale
        frequency: Number,
      },
    ],
    positiveActivities: [
      {
        activity: String,
        effectiveness: Number, // 0 to 1 scale
        frequency: Number,
      },
    ],
    riskFactors: [
      {
        factor: String,
        severity: Number, // 0 to 1 scale
        frequency: Number,
      },
    ],
  },
  recommendations: [
    {
      type: {
        type: String,
        enum: [
          "activity",
          "therapy",
          "meditation",
          "social",
          "exercise",
          "sleep",
          "diet",
          "crisis",
        ],
      },
      title: String,
      description: String,
      priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
      },
      confidence: Number,
    },
  ],
  insights: {
    moodVariability: Number,
    dominantMood: String,
    bestTimeOfDay: String,
    worstTimeOfDay: String,
    weeklyPattern: String,
    seasonalTrends: String,
  },
  riskAssessment: {
    overallRisk: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
    },
    riskFactors: [String],
    crisisIndicators: [String],
    recommendedActions: [String],
  },
  metadata: {
    dataPointsAnalyzed: Number,
    timeRange: {
      start: Date,
      end: Date,
    },
    aiModelVersion: String,
    processingTime: Number,
  },
});

// Schema for mood goals and achievements
const moodGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  targetMoodScore: {
    type: Number,
    min: 1,
    max: 5,
  },
  targetFrequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  progress: {
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalDays: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  achievements: [
    {
      type: {
        type: String,
        enum: ["streak", "milestone", "improvement"],
      },
      title: String,
      description: String,
      achievedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Add comprehensive indexes for better query performance

// MoodEntry indexes
moodEntrySchema.index({ userId: 1, timestamp: -1 }); // For user's mood entries sorted by date
moodEntrySchema.index({ userId: 1, moodScore: 1 }); // For mood score analysis
moodEntrySchema.index({ userId: 1, moodLabel: 1 }); // For mood label filtering
moodEntrySchema.index({ timestamp: -1 }); // For all mood entries sorted by date
moodEntrySchema.index({ moodScore: 1 }); // For score-based queries
moodEntrySchema.index({ moodLabel: 1 }); // For mood label queries
moodEntrySchema.index({ isPublic: 1 }); // For public mood entries
moodEntrySchema.index({ stressLevel: 1 }); // For stress level analysis
moodEntrySchema.index({ energyLevel: 1 }); // For energy level analysis
moodEntrySchema.index({ sleepHours: 1 }); // For sleep analysis

// Compound indexes for MoodEntry
moodEntrySchema.index({ userId: 1, moodScore: 1, timestamp: -1 }); // For user's mood trends
moodEntrySchema.index({ userId: 1, moodLabel: 1, timestamp: -1 }); // For user's mood patterns
moodEntrySchema.index({ userId: 1, isPublic: 1, timestamp: -1 }); // For user's public entries
moodEntrySchema.index({ moodLabel: 1, timestamp: -1 }); // For mood label trends
moodEntrySchema.index({ userId: 1, stressLevel: 1, timestamp: -1 }); // For stress analysis
moodEntrySchema.index({ userId: 1, energyLevel: 1, timestamp: -1 }); // For energy analysis
moodEntrySchema.index({ userId: 1, sleepHours: 1, timestamp: -1 }); // For sleep patterns

// AIAnalysis indexes
aiAnalysisSchema.index({ userId: 1, analysisDate: -1 }); // For user's AI analysis history
aiAnalysisSchema.index({ userId: 1, analysisType: 1 }); // For specific analysis types
aiAnalysisSchema.index({ analysisDate: -1 }); // For all analysis sorted by date
aiAnalysisSchema.index({ analysisType: 1 }); // For analysis type queries
aiAnalysisSchema.index({ "riskAssessment.overallRisk": 1 }); // For risk assessment queries

// Compound indexes for AIAnalysis
aiAnalysisSchema.index({ userId: 1, analysisType: 1, analysisDate: -1 }); // For user's analysis by type
aiAnalysisSchema.index({ analysisType: 1, analysisDate: -1 }); // For analysis trends
aiAnalysisSchema.index({ userId: 1, "riskAssessment.overallRisk": 1 }); // For user's risk assessment

// MoodGoal indexes
moodGoalSchema.index({ userId: 1, isActive: 1 }); // For user's active goals
moodGoalSchema.index({ userId: 1, startDate: -1 }); // For user's goals sorted by start date
moodGoalSchema.index({ isActive: 1 }); // For all active goals
moodGoalSchema.index({ targetFrequency: 1 }); // For frequency-based queries
moodGoalSchema.index({ "progress.currentStreak": -1 }); // For streak-based sorting

// Compound indexes for MoodGoal
moodGoalSchema.index({ userId: 1, isActive: 1, startDate: -1 }); // For user's active goals sorted
moodGoalSchema.index({ isActive: 1, targetFrequency: 1 }); // For active goals by frequency
moodGoalSchema.index({ userId: 1, "progress.currentStreak": -1 }); // For user's goals by streak

// Text indexes for search functionality
moodEntrySchema.index({
  textFeedback: "text",
  tags: "text",
});

aiAnalysisSchema.index({
  "recommendations.title": "text",
  "recommendations.description": "text",
  "patterns.triggers.factor": "text",
  "patterns.positiveActivities.activity": "text",
});

moodGoalSchema.index({
  title: "text",
  description: "text",
});

// Create models
const MoodEntry =
  mongoose.models.MoodEntry || mongoose.model("MoodEntry", moodEntrySchema);
const AIAnalysis =
  mongoose.models.AIAnalysis || mongoose.model("AIAnalysis", aiAnalysisSchema);
const MoodGoal =
  mongoose.models.MoodGoal || mongoose.model("MoodGoal", moodGoalSchema);

export { MoodEntry, AIAnalysis, MoodGoal };
