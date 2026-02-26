import {
  MoodEntry,
  AIAnalysis,
  MoodGoal,
} from "../models/moodTrackingModel.js";
import userModel from "../models/userModel.js";
import aiAnalysisService from "../services/aiAnalysisService.js";
import notificationService from "../services/notificationService.js";
import Notification from "../models/notificationModel.js";

// Add mood entry
export const addMoodEntry = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      moodScore,
      moodLabel,
      activities,
      textFeedback,
      location,
      weather,
      sleepHours,
      stressLevel,
      energyLevel,
      socialInteraction,
      tags,
    } = req.body;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if mood tracking is enabled
    if (!user.moodTracking?.enabled) {
      return res
        .status(400)
        .json({ message: "Mood tracking is not enabled for this user" });
    }

    // Create new mood entry
    const moodEntry = new MoodEntry({
      userId,
      moodScore,
      moodLabel,
      activities,
      textFeedback,
      location,
      weather,
      sleepHours,
      stressLevel,
      energyLevel,
      socialInteraction,
      tags,
    });

    await moodEntry.save();

    // Trigger AI analysis automatically after each mood entry
    // This ensures real-time insights and analysis
    try {
      if (user.moodTracking?.aiAnalysisConsent) {
        // Run AI analysis in background to avoid blocking the response
        setImmediate(async () => {
          try {
            await triggerAIAnalysis(userId, "daily");
            console.log(
              `AI analysis completed automatically for user ${userId}`
            );
          } catch (error) {
            console.error(
              `Background AI analysis failed for user ${userId}:`,
              error
            );
          }
        });
      } else {
        // If no consent, still run basic analysis for internal insights
        setImmediate(async () => {
          try {
            await triggerBasicAnalysis(userId, "daily");
            console.log(`Basic analysis completed for user ${userId}`);
          } catch (error) {
            console.error(`Basic analysis failed for user ${userId}:`, error);
          }
        });
      }
    } catch (error) {
      console.error("Error triggering AI analysis:", error);
      // Don't fail the mood entry creation if AI analysis fails
    }

    // Trigger notification checks only for new mood entries (not updates)
    // Check if this is the first mood entry of the day for this user
    try {
      setImmediate(async () => {
        try {
          // Check if this is the first mood entry of the day
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todaysEntries = await MoodEntry.find({
            userId,
            timestamp: { $gte: today, $lt: tomorrow },
          });

          // Only trigger notifications if this is the first entry of the day
          if (todaysEntries.length === 1) {
            // Additional check: ensure we haven't triggered notifications recently
            const lastNotificationCheck = await Notification.findOne({
              userId,
              createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
            });

            if (!lastNotificationCheck) {
              await notificationService.scheduleUserNotifications(user);
              console.log(
                `Notification checks triggered for user ${userId} (first entry of the day)`
              );
            } else {
              console.log(
                `Skipping notification checks for user ${userId} (recent notification already sent)`
              );
            }
          } else {
            console.log(
              `Skipping notification checks for user ${userId} (not first entry of the day)`
            );
          }
        } catch (error) {
          console.error(
            `Notification checks failed for user ${userId}:`,
            error
          );
        }
      });
    } catch (error) {
      console.error("Error triggering notification checks:", error);
      // Don't fail the mood entry creation if notification checks fail
    }

    res.status(201).json({
      message: "Mood entry added successfully",
      moodEntry,
      aiAnalysisTriggered: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's mood entries
export const getMoodEntries = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 50, page = 1 } = req.query;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    const query = { userId };
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get mood entries with pagination
    const skip = (page - 1) * limit;
    const moodEntries = await MoodEntry.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await MoodEntry.countDocuments(query);

    res.status(200).json({
      moodEntries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        hasNext: skip + moodEntries.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get mood analytics and insights
export const getMoodAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "30" } = req.query; // days

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get mood entries for the period
    const moodEntries = await MoodEntry.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate },
    }).sort({ timestamp: 1 });

    if (moodEntries.length === 0) {
      return res.status(200).json({
        message: "No mood data available for the specified period",
        analytics: null,
      });
    }

    // Calculate analytics
    const analytics = calculateMoodAnalytics(moodEntries);

    res.status(200).json({
      analytics,
      dataPoints: moodEntries.length,
      period: `${period} days`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update mood tracking preferences
export const updateMoodTrackingPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      enabled,
      frequency,
      reminderTimes,
      aiAnalysisConsent,
      aiAnalysisLevel,
      privacySettings,
      notificationPreferences,
    } = req.body;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update mood tracking preferences
    const updateData = {};
    if (enabled !== undefined) updateData["moodTracking.enabled"] = enabled;
    if (frequency) updateData["moodTracking.frequency"] = frequency;
    if (reminderTimes) updateData["moodTracking.reminderTimes"] = reminderTimes;
    if (aiAnalysisConsent !== undefined)
      updateData["moodTracking.aiAnalysisConsent"] = aiAnalysisConsent;
    if (aiAnalysisLevel)
      updateData["moodTracking.aiAnalysisLevel"] = aiAnalysisLevel;
    if (privacySettings) {
      Object.keys(privacySettings).forEach((key) => {
        updateData[`moodTracking.privacySettings.${key}`] =
          privacySettings[key];
      });
    }
    if (notificationPreferences) {
      Object.keys(notificationPreferences).forEach((key) => {
        updateData[`moodTracking.notificationPreferences.${key}`] =
          notificationPreferences[key];
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      message: "Mood tracking preferences updated successfully",
      moodTracking: updatedUser.moodTracking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get AI analysis results
export const getAIAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const { analysisType = "weekly", limit = 10 } = req.query;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if AI analysis consent is given
    if (!user.moodTracking?.aiAnalysisConsent) {
      return res.status(403).json({ message: "AI analysis consent not given" });
    }

    // Get AI analysis results
    const analysisResults = await AIAnalysis.find({
      userId,
      analysisType,
    })
      .sort({ analysisDate: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      analysisResults,
      analysisType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get latest AI analysis for real-time updates
export const getLatestAIAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the most recent AI analysis
    const latestAnalysis = await AIAnalysis.findOne({
      userId,
    })
      .sort({ analysisDate: -1 })
      .limit(1);

    if (!latestAnalysis) {
      return res.status(200).json({
        message: "No AI analysis available",
        analysis: null,
        hasConsent: user.moodTracking?.aiAnalysisConsent || false,
      });
    }

    res.status(200).json({
      analysis: latestAnalysis,
      hasConsent: user.moodTracking?.aiAnalysisConsent || false,
      analysisLevel: latestAnalysis.metadata?.analysisLevel || "ai",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create mood goal
export const createMoodGoal = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description, targetMoodScore, targetFrequency, endDate } =
      req.body;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new mood goal
    const moodGoal = new MoodGoal({
      userId,
      title,
      description,
      targetMoodScore,
      targetFrequency,
      endDate,
    });

    await moodGoal.save();

    res.status(201).json({
      message: "Mood goal created successfully",
      moodGoal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's mood goals
export const getMoodGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { active = true } = req.query;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    const query = { userId };
    if (active !== undefined) {
      query.isActive = active === "true";
    }

    const moodGoals = await MoodGoal.find(query).sort({ startDate: -1 });

    res.status(200).json({
      moodGoals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's mood tracking preferences
export const getMoodTrackingPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      moodTracking: user.moodTracking || {
        enabled: false,
        frequency: "daily",
        aiAnalysisConsent: false,
        aiAnalysisLevel: "basic",
        privacySettings: {
          shareWithTherapist: false,
          shareWithFamily: false,
          anonymousDataSharing: false,
        },
        notificationPreferences: {
          moodReminders: true,
          weeklyInsights: true,
          crisisAlerts: true,
          therapistNotifications: false,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comprehensive mood dashboard data
export const getMoodDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "30" } = req.query;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get all required data
    const [moodEntries, aiAnalysis, goals] = await Promise.all([
      MoodEntry.find({
        userId,
        timestamp: { $gte: startDate, $lte: endDate },
      }).sort({ timestamp: 1 }),
      AIAnalysis.find({
        userId,
        analysisDate: { $gte: startDate },
      })
        .sort({ analysisDate: -1 })
        .limit(5),
      MoodGoal.find({ userId, isActive: true }),
    ]);

    if (moodEntries.length === 0) {
      return res.status(200).json({
        message: "No mood data available for the specified period",
        dashboard: {
          analytics: null,
          aiAnalysis: null,
          goals: [],
          insights: [],
          recommendations: [],
        },
      });
    }

    // Calculate comprehensive analytics
    const analytics = calculateComprehensiveAnalytics(moodEntries);

    // Generate insights and recommendations
    const insights = generateInsights(analytics, moodEntries);
    const recommendations = generateRecommendations(analytics, insights);

    res.status(200).json({
      dashboard: {
        analytics,
        aiAnalysis: aiAnalysis[0] || null,
        goals,
        insights,
        recommendations,
        dataPoints: moodEntries.length,
        period: `${period} days`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get mood patterns and correlations
export const getMoodPatterns = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "30" } = req.query;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get mood entries
    const moodEntries = await MoodEntry.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate },
    }).sort({ timestamp: 1 });

    if (moodEntries.length === 0) {
      return res.status(200).json({
        message: "No mood data available for pattern analysis",
        patterns: null,
      });
    }

    // Calculate patterns
    const patterns = calculateMoodPatterns(moodEntries);

    res.status(200).json({
      patterns,
      dataPoints: moodEntries.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get mood insights and recommendations
export const getMoodInsights = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "30" } = req.query;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get mood entries
    const moodEntries = await MoodEntry.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate },
    }).sort({ timestamp: 1 });

    if (moodEntries.length === 0) {
      return res.status(200).json({
        message: "No mood data available for insights",
        insights: [],
        recommendations: [],
      });
    }

    // Calculate analytics
    const analytics = calculateComprehensiveAnalytics(moodEntries);

    // Generate insights and recommendations
    const insights = generateInsights(analytics, moodEntries);
    const recommendations = generateRecommendations(analytics, insights);

    res.status(200).json({
      insights,
      recommendations,
      dataPoints: moodEntries.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate mood analytics
const calculateMoodAnalytics = (moodEntries) => {
  const scores = moodEntries.map((entry) => entry.moodScore);
  const labels = moodEntries.map((entry) => entry.moodLabel);

  // Basic statistics
  const averageScore =
    scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // Mood distribution
  const moodDistribution = labels.reduce((acc, label) => {
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  // Trend analysis
  const trend = calculateTrend(scores);

  // Activity correlation
  const activityCorrelation = calculateActivityCorrelation(moodEntries);

  // Time-based patterns
  const timePatterns = calculateTimePatterns(moodEntries);

  return {
    basicStats: {
      averageScore: Math.round(averageScore * 100) / 100,
      minScore,
      maxScore,
      totalEntries: moodEntries.length,
    },
    moodDistribution,
    trend,
    activityCorrelation,
    timePatterns,
  };
};

// Helper function to calculate trend
const calculateTrend = (scores) => {
  if (scores.length < 2) return "insufficient_data";

  const recentScores = scores.slice(-7); // Last 7 entries
  const olderScores = scores.slice(0, -7);

  if (olderScores.length === 0) return "insufficient_data";

  const recentAvg =
    recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const olderAvg =
    olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;

  const difference = recentAvg - olderAvg;

  if (difference > 0.5) return "improving";
  if (difference < -0.5) return "declining";
  return "stable";
};

// Helper function to calculate activity correlation
const calculateActivityCorrelation = (moodEntries) => {
  const activityMoodMap = {};

  moodEntries.forEach((entry) => {
    entry.activities?.forEach((activity) => {
      if (!activityMoodMap[activity]) {
        activityMoodMap[activity] = [];
      }
      activityMoodMap[activity].push(entry.moodScore);
    });
  });

  const correlations = {};
  Object.keys(activityMoodMap).forEach((activity) => {
    const scores = activityMoodMap[activity];
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    correlations[activity] = Math.round(avgScore * 100) / 100;
  });

  return correlations;
};

// Helper function to calculate time patterns
const calculateTimePatterns = (moodEntries) => {
  const hourlyMood = {};

  moodEntries.forEach((entry) => {
    const hour = new Date(entry.timestamp).getHours();
    if (!hourlyMood[hour]) {
      hourlyMood[hour] = [];
    }
    hourlyMood[hour].push(entry.moodScore);
  });

  const patterns = {};
  Object.keys(hourlyMood).forEach((hour) => {
    const scores = hourlyMood[hour];
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    patterns[hour] = Math.round(avgScore * 100) / 100;
  });

  return patterns;
};

// Helper function to trigger AI analysis
const triggerAIAnalysis = async (userId, analysisType) => {
  try {
    console.log(
      `AI analysis triggered for user ${userId}, type: ${analysisType}`
    );

    // Generate AI analysis
    const analysis = await aiAnalysisService.generateAnalysis(
      userId,
      analysisType
    );

    console.log(`AI analysis completed for user ${userId}`);
    return analysis;
  } catch (error) {
    console.error(`AI analysis failed for user ${userId}:`, error);
    // Don't throw error to avoid breaking mood entry creation
  }
};

// Helper function to trigger basic analysis (without AI consent)
const triggerBasicAnalysis = async (userId, analysisType) => {
  try {
    console.log(
      `Basic analysis triggered for user ${userId}, type: ${analysisType}`
    );

    // Get recent mood entries for basic analysis
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    const moodEntries = await MoodEntry.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate },
    }).sort({ timestamp: 1 });

    if (moodEntries.length === 0) {
      console.log(
        `No mood entries found for basic analysis for user ${userId}`
      );
      return null;
    }

    // Perform basic analytics without AI insights
    const analytics = calculateComprehensiveAnalytics(moodEntries);
    const insights = generateInsights(analytics, moodEntries);
    const recommendations = generateRecommendations(analytics, insights);

    // Create a basic analysis record (without AI consent)
    const basicAnalysis = new AIAnalysis({
      userId,
      analysisType,
      moodTrend: {
        direction: analytics.trend,
        confidence: analytics.trendStrength || 0.5,
        factors: ["Basic analysis - no AI consent given"],
      },
      patterns: {
        triggers: [],
        positiveActivities: [],
        riskFactors: [],
      },
      recommendations: recommendations.slice(0, 3), // Limit to 3 basic recommendations
      riskAssessment: {
        overallRisk: "low",
        riskFactors: [],
        crisisIndicators: [],
        recommendedActions: [],
      },
      insights: {
        moodVariability: analytics.moodVariability || 0,
        dominantMood: "unknown",
        bestTimeOfDay: "unknown",
        worstTimeOfDay: "unknown",
        weeklyPattern: "No AI analysis available",
        seasonalTrends: "No AI analysis available",
      },
      metadata: {
        dataPointsAnalyzed: moodEntries.length,
        timeRange: { start: startDate, end: endDate },
        aiModelVersion: "basic-v1.0.0",
        processingTime: Date.now(),
        analysisLevel: "basic",
      },
    });

    await basicAnalysis.save();
    console.log(`Basic analysis completed for user ${userId}`);
    return basicAnalysis;
  } catch (error) {
    console.error(`Basic analysis failed for user ${userId}:`, error);
    // Don't throw error to avoid breaking mood entry creation
  }
};

// Enhanced analytics calculation
const calculateComprehensiveAnalytics = (moodEntries) => {
  const scores = moodEntries.map((entry) => entry.moodScore);
  const labels = moodEntries.map((entry) => entry.moodLabel);

  // Basic statistics
  const averageScore =
    scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const medianScore = calculateMedian(scores);
  const standardDeviation = calculateStandardDeviation(scores);

  // Mood distribution
  const moodDistribution = labels.reduce((acc, label) => {
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  // Trend analysis
  const trend = calculateTrend(scores);
  const trendStrength = calculateTrendStrength(scores);

  // Activity correlation
  const activityCorrelation = calculateActivityCorrelation(moodEntries);

  // Time-based patterns
  const timePatterns = calculateTimePatterns(moodEntries);
  const weeklyPatterns = calculateWeeklyPatterns(moodEntries);
  const monthlyPatterns = calculateMonthlyPatterns(moodEntries);

  // Mood variability
  const moodVariability = calculateMoodVariability(scores);
  const moodStability = calculateMoodStability(scores);

  // Correlation with other factors
  const factorCorrelations = calculateFactorCorrelations(moodEntries);

  return {
    basicStats: {
      averageScore: Math.round(averageScore * 100) / 100,
      minScore,
      maxScore,
      medianScore: Math.round(medianScore * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      totalEntries: moodEntries.length,
    },
    moodDistribution,
    trend,
    trendStrength,
    activityCorrelation,
    timePatterns,
    weeklyPatterns,
    monthlyPatterns,
    moodVariability,
    moodStability,
    factorCorrelations,
  };
};

// Calculate mood patterns
const calculateMoodPatterns = (moodEntries) => {
  const patterns = {
    daily: calculateDailyPatterns(moodEntries),
    weekly: calculateWeeklyPatterns(moodEntries),
    monthly: calculateMonthlyPatterns(moodEntries),
    seasonal: calculateSeasonalPatterns(moodEntries),
    triggers: calculateTriggerPatterns(moodEntries),
    improvements: calculateImprovementPatterns(moodEntries),
  };

  return patterns;
};

// Generate insights
const generateInsights = (analytics, moodEntries) => {
  const insights = [];

  // Mood range insight
  if (analytics.basicStats.maxScore - analytics.basicStats.minScore > 2) {
    insights.push({
      type: "mood_variability",
      title: "High Mood Variability",
      description: `Your mood varies significantly (${
        analytics.basicStats.maxScore - analytics.basicStats.minScore
      } point range). This could indicate sensitivity to external factors or internal states.`,
      priority: "medium",
      category: "pattern",
    });
  }

  // Trend insight
  if (analytics.trend === "improving" && analytics.trendStrength > 0.7) {
    insights.push({
      type: "positive_trend",
      title: "Strong Positive Trend",
      description:
        "Your mood has been consistently improving. Keep up the activities that are working for you!",
      priority: "low",
      category: "trend",
    });
  } else if (analytics.trend === "declining" && analytics.trendStrength > 0.7) {
    insights.push({
      type: "negative_trend",
      title: "Declining Mood Pattern",
      description:
        "Your mood has been declining. Consider reaching out for support or reviewing recent changes.",
      priority: "high",
      category: "trend",
    });
  }

  // Activity correlation insights
  const topActivities = Object.entries(analytics.activityCorrelation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (topActivities.length > 0) {
    insights.push({
      type: "activity_impact",
      title: "Activity Impact on Mood",
      description: `Your highest mood scores are associated with: ${topActivities
        .map(
          ([activity, score]) =>
            `${activity.replace("_", " ")} (${score.toFixed(1)}/5)`
        )
        .join(", ")}.`,
      priority: "medium",
      category: "correlation",
    });
  }

  // Time pattern insights
  const bestTime = Object.entries(analytics.timePatterns).sort(
    ([, a], [, b]) => b - a
  )[0];

  if (bestTime) {
    insights.push({
      type: "time_pattern",
      title: "Best Time of Day",
      description: `Your mood tends to be highest around ${
        bestTime[0] === "0"
          ? "12 AM"
          : bestTime[0] === "12"
          ? "12 PM"
          : parseInt(bestTime[0]) > 12
          ? `${parseInt(bestTime[0]) - 12} PM`
          : `${bestTime[0]} AM`
      } (${bestTime[1].toFixed(1)}/5 average).`,
      priority: "low",
      category: "pattern",
    });
  }

  // Consistency insight
  if (analytics.moodStability > 0.8) {
    insights.push({
      type: "mood_stability",
      title: "Mood Stability",
      description:
        "Your mood has been very stable, which can indicate good emotional regulation.",
      priority: "low",
      category: "pattern",
    });
  }

  return insights;
};

// Generate recommendations
const generateRecommendations = (analytics, insights) => {
  const recommendations = [];

  // Based on trend
  if (analytics.trend === "declining") {
    recommendations.push({
      type: "support",
      title: "Consider Professional Support",
      description:
        "Given your declining mood trend, consider reaching out to a mental health professional.",
      priority: "high",
      category: "support",
      actionable: true,
    });
  }

  // Based on activity correlations
  const topActivities = Object.entries(analytics.activityCorrelation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  if (topActivities.length > 0) {
    recommendations.push({
      type: "activity",
      title: "Increase Positive Activities",
      description: `Try to incorporate more ${topActivities
        .map(([activity]) => activity.replace("_", " "))
        .join(" and ")} activities into your routine.`,
      priority: "medium",
      category: "lifestyle",
      actionable: true,
    });
  }

  // Based on mood variability
  if (analytics.moodVariability > 0.6) {
    recommendations.push({
      type: "stability",
      title: "Build Consistent Routines",
      description:
        "Establishing regular daily routines can help stabilize your mood.",
      priority: "medium",
      category: "lifestyle",
      actionable: true,
    });
  }

  // Based on time patterns
  const worstTime = Object.entries(analytics.timePatterns).sort(
    ([, a], [, b]) => a - b
  )[0];

  if (worstTime && worstTime[1] < 3) {
    recommendations.push({
      type: "time_management",
      title: "Optimize Difficult Times",
      description: `Your mood tends to be lower around ${
        worstTime[0] === "0"
          ? "12 AM"
          : worstTime[0] === "12"
          ? "12 PM"
          : parseInt(worstTime[0]) > 12
          ? `${parseInt(worstTime[0]) - 12} PM`
          : `${worstTime[0]} AM`
      }. Consider scheduling enjoyable activities during this time.`,
      priority: "medium",
      category: "lifestyle",
      actionable: true,
    });
  }

  return recommendations;
};

// Helper functions for enhanced analytics
const calculateMedian = (scores) => {
  const sorted = [...scores].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const calculateStandardDeviation = (scores) => {
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const squaredDiffs = scores.map((score) => Math.pow(score - mean, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length;
  return Math.sqrt(avgSquaredDiff);
};

const calculateTrendStrength = (scores) => {
  if (scores.length < 2) return 0;

  const recentScores = scores.slice(-7);
  const olderScores = scores.slice(0, -7);

  if (olderScores.length === 0) return 0;

  const recentAvg =
    recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const olderAvg =
    olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;

  const difference = Math.abs(recentAvg - olderAvg);
  return Math.min(difference / 2, 1); // Normalize to 0-1
};

const calculateMoodVariability = (scores) => {
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
    scores.length;
  return Math.min(Math.sqrt(variance) / 2, 1); // Normalize to 0-1
};

const calculateMoodStability = (scores) => {
  if (scores.length < 2) return 1;

  let stabilityScore = 0;
  for (let i = 1; i < scores.length; i++) {
    const diff = Math.abs(scores[i] - scores[i - 1]);
    stabilityScore += diff;
  }

  const avgDiff = stabilityScore / (scores.length - 1);
  return Math.max(0, 1 - avgDiff / 2); // Normalize to 0-1
};

const calculateFactorCorrelations = (moodEntries) => {
  const correlations = {
    sleep: {},
    stress: {},
    energy: {},
    social: {},
  };

  // Sleep correlation
  const sleepData = moodEntries.filter(
    (entry) => entry.sleepHours !== undefined
  );
  if (sleepData.length > 0) {
    const sleepScores = sleepData.map((entry) => entry.sleepHours);
    const moodScores = sleepData.map((entry) => entry.moodScore);
    correlations.sleep = calculateCorrelation(sleepScores, moodScores);
  }

  // Stress correlation
  const stressData = moodEntries.filter(
    (entry) => entry.stressLevel !== undefined
  );
  if (stressData.length > 0) {
    const stressScores = stressData.map((entry) => entry.stressLevel);
    const moodScores = stressData.map((entry) => entry.moodScore);
    correlations.stress = calculateCorrelation(stressScores, moodScores);
  }

  // Energy correlation
  const energyData = moodEntries.filter(
    (entry) => entry.energyLevel !== undefined
  );
  if (energyData.length > 0) {
    const energyScores = energyData.map((entry) => entry.energyLevel);
    const moodScores = energyData.map((entry) => entry.moodScore);
    correlations.energy = calculateCorrelation(energyScores, moodScores);
  }

  // Social correlation
  const socialData = moodEntries.filter(
    (entry) => entry.socialInteraction !== undefined
  );
  if (socialData.length > 0) {
    const socialScores = socialData.map((entry) => entry.socialInteraction);
    const moodScores = socialData.map((entry) => entry.moodScore);
    correlations.social = calculateCorrelation(socialScores, moodScores);
  }

  return correlations;
};

const calculateCorrelation = (x, y) => {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return denominator === 0 ? 0 : numerator / denominator;
};

const calculateDailyPatterns = (moodEntries) => {
  const dailyMood = {};

  moodEntries.forEach((entry) => {
    const hour = new Date(entry.timestamp).getHours();
    if (!dailyMood[hour]) {
      dailyMood[hour] = [];
    }
    dailyMood[hour].push(entry.moodScore);
  });

  const patterns = {};
  Object.keys(dailyMood).forEach((hour) => {
    const scores = dailyMood[hour];
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    patterns[hour] = Math.round(avgScore * 100) / 100;
  });

  return patterns;
};

const calculateWeeklyPatterns = (moodEntries) => {
  const weeklyMood = {};

  moodEntries.forEach((entry) => {
    const day = new Date(entry.timestamp).getDay();
    if (!weeklyMood[day]) {
      weeklyMood[day] = [];
    }
    weeklyMood[day].push(entry.moodScore);
  });

  const patterns = {};
  Object.keys(weeklyMood).forEach((day) => {
    const scores = weeklyMood[day];
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    patterns[day] = Math.round(avgScore * 100) / 100;
  });

  return patterns;
};

const calculateMonthlyPatterns = (moodEntries) => {
  const monthlyMood = {};

  moodEntries.forEach((entry) => {
    const month = new Date(entry.timestamp).getMonth();
    if (!monthlyMood[month]) {
      monthlyMood[month] = [];
    }
    monthlyMood[month].push(entry.moodScore);
  });

  const patterns = {};
  Object.keys(monthlyMood).forEach((month) => {
    const scores = monthlyMood[month];
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    patterns[month] = Math.round(avgScore * 100) / 100;
  });

  return patterns;
};

const calculateSeasonalPatterns = (moodEntries) => {
  const seasonalMood = { spring: [], summer: [], fall: [], winter: [] };

  moodEntries.forEach((entry) => {
    const month = new Date(entry.timestamp).getMonth();
    if (month >= 2 && month <= 4) seasonalMood.spring.push(entry.moodScore);
    else if (month >= 5 && month <= 7)
      seasonalMood.summer.push(entry.moodScore);
    else if (month >= 8 && month <= 10) seasonalMood.fall.push(entry.moodScore);
    else seasonalMood.winter.push(entry.moodScore);
  });

  const patterns = {};
  Object.keys(seasonalMood).forEach((season) => {
    const scores = seasonalMood[season];
    if (scores.length > 0) {
      const avgScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
      patterns[season] = Math.round(avgScore * 100) / 100;
    }
  });

  return patterns;
};

const calculateTriggerPatterns = (moodEntries) => {
  const triggers = {};

  moodEntries.forEach((entry) => {
    if (entry.moodScore <= 2) {
      // Low mood entries
      entry.activities?.forEach((activity) => {
        if (!triggers[activity]) {
          triggers[activity] = 0;
        }
        triggers[activity]++;
      });
    }
  });

  return triggers;
};

const calculateImprovementPatterns = (moodEntries) => {
  const improvements = {};

  moodEntries.forEach((entry) => {
    if (entry.moodScore >= 4) {
      // High mood entries
      entry.activities?.forEach((activity) => {
        if (!improvements[activity]) {
          improvements[activity] = 0;
        }
        improvements[activity]++;
      });
    }
  });

  return improvements;
};

// Delete mood entries
export const deleteMoodEntries = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all mood entries for the user
    const result = await MoodEntry.deleteMany({ userId });

    // Also delete associated AI analysis data
    await AIAnalysis.deleteMany({ userId });

    console.log(
      `Deleted ${result.deletedCount} mood entries for user ${userId}`
    );

    res.status(200).json({
      message: "All mood entries deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting mood entries:", error);
    res.status(500).json({
      message: "Failed to delete mood entries",
      error: error.message,
    });
  }
};

// Delete all mood tracking data
export const deleteAllMoodData = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all mood-related data
    const [moodEntriesResult, aiAnalysisResult, goalsResult] =
      await Promise.all([
        MoodEntry.deleteMany({ userId }),
        AIAnalysis.deleteMany({ userId }),
        MoodGoal.deleteMany({ userId }),
      ]);

    // Reset mood tracking preferences
    await userModel.findByIdAndUpdate(userId, {
      $unset: { moodTracking: 1 },
    });

    console.log(`Deleted all mood data for user ${userId}:`, {
      moodEntries: moodEntriesResult.deletedCount,
      aiAnalysis: aiAnalysisResult.deletedCount,
      goals: goalsResult.deletedCount,
    });

    res.status(200).json({
      message: "All mood tracking data deleted successfully",
      deletedData: {
        moodEntries: moodEntriesResult.deletedCount,
        aiAnalysis: aiAnalysisResult.deletedCount,
        goals: goalsResult.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error deleting all mood data:", error);
    res.status(500).json({
      message: "Failed to delete mood data",
      error: error.message,
    });
  }
};
