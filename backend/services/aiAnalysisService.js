import { MoodEntry, AIAnalysis } from "../models/moodTrackingModel.js";

class AIAnalysisService {
  constructor() {
    this.modelVersion = "v1.0.0";
  }

  // Generate AI analysis for a user
  async generateAnalysis(userId, analysisType = "weekly") {
    try {
      // Get mood entries for analysis
      const endDate = new Date();
      const startDate = new Date();

      switch (analysisType) {
        case "daily":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "weekly":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "monthly":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const moodEntries = await MoodEntry.find({
        userId,
        timestamp: { $gte: startDate, $lte: endDate },
      }).sort({ timestamp: 1 });

      if (moodEntries.length === 0) {
        return this.generateEmptyAnalysis(
          userId,
          analysisType,
          startDate,
          endDate
        );
      }

      // Perform AI analysis
      const analysis = await this.performAnalysis(
        moodEntries,
        analysisType,
        startDate,
        endDate
      );

      // Save analysis to database
      const aiAnalysis = new AIAnalysis({
        userId,
        analysisType,
        ...analysis,
        metadata: {
          dataPointsAnalyzed: moodEntries.length,
          timeRange: { start: startDate, end: endDate },
          aiModelVersion: this.modelVersion,
          processingTime: Date.now(),
        },
      });

      await aiAnalysis.save();
      return aiAnalysis;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw new Error("Failed to generate AI analysis");
    }
  }

  // Perform the actual AI analysis
  async performAnalysis(moodEntries, analysisType, startDate, endDate) {
    const scores = moodEntries.map((entry) => entry.moodScore);
    const labels = moodEntries.map((entry) => entry.moodLabel);
    const activities = moodEntries.flatMap((entry) => entry.activities || []);
    const textFeedback = moodEntries
      .map((entry) => entry.textFeedback)
      .filter((text) => text);

    // Mood Trend Analysis
    const moodTrend = this.analyzeMoodTrend(scores, moodEntries);

    // Pattern Recognition
    const patterns = this.analyzePatterns(moodEntries);

    // Generate Recommendations
    const recommendations = this.generateRecommendations(
      moodEntries,
      moodTrend,
      patterns
    );

    // Risk Assessment
    const riskAssessment = this.assessRisk(moodEntries, moodTrend);

    // Generate Insights
    const insights = this.generateInsights(moodEntries, patterns);

    return {
      moodTrend,
      patterns,
      recommendations,
      riskAssessment,
      insights,
    };
  }

  // Analyze mood trend
  analyzeMoodTrend(scores, moodEntries) {
    if (scores.length < 2) {
      return {
        direction: "insufficient_data",
        confidence: 0,
        factors: ["Not enough data points for trend analysis"],
      };
    }

    // Calculate trend using linear regression
    const n = scores.length;
    const xValues = Array.from({ length: n }, (_, i) => i);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = scores.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * scores[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const averageScore = sumY / n;

    // Determine trend direction
    let direction;
    if (slope > 0.1) direction = "improving";
    else if (slope < -0.1) direction = "declining";
    else direction = "stable";

    // Calculate confidence based on data consistency
    const variance =
      scores.reduce(
        (sum, score) => sum + Math.pow(score - averageScore, 2),
        0
      ) / n;
    const confidence = Math.max(0, Math.min(1, 1 - variance / 4)); // Normalize to 0-1

    // Identify contributing factors
    const factors = this.identifyTrendFactors(moodEntries, direction);

    return {
      direction,
      confidence: Math.round(confidence * 100) / 100,
      factors,
    };
  }

  // Analyze patterns in mood data
  analyzePatterns(moodEntries) {
    const triggers = this.identifyTriggers(moodEntries);
    const positiveActivities = this.identifyPositiveActivities(moodEntries);
    const riskFactors = this.identifyRiskFactors(moodEntries);

    return {
      triggers,
      positiveActivities,
      riskFactors,
    };
  }

  // Identify mood triggers
  identifyTriggers(moodEntries) {
    const lowMoodEntries = moodEntries.filter((entry) => entry.moodScore <= 2);
    const triggerMap = {};

    lowMoodEntries.forEach((entry) => {
      entry.activities?.forEach((activity) => {
        if (!triggerMap[activity]) {
          triggerMap[activity] = { count: 0, totalScore: 0 };
        }
        triggerMap[activity].count++;
        triggerMap[activity].totalScore += entry.moodScore;
      });
    });

    return Object.entries(triggerMap)
      .map(([factor, data]) => ({
        factor,
        impact: -1 * (data.totalScore / data.count - 3), // Negative impact
        frequency: data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  // Identify positive activities
  identifyPositiveActivities(moodEntries) {
    const highMoodEntries = moodEntries.filter((entry) => entry.moodScore >= 4);
    const activityMap = {};

    highMoodEntries.forEach((entry) => {
      entry.activities?.forEach((activity) => {
        if (!activityMap[activity]) {
          activityMap[activity] = { count: 0, totalScore: 0 };
        }
        activityMap[activity].count++;
        activityMap[activity].totalScore += entry.moodScore;
      });
    });

    return Object.entries(activityMap)
      .map(([activity, data]) => ({
        activity,
        effectiveness: (data.totalScore / data.count - 3) / 2, // Normalize to 0-1
        frequency: data.count,
      }))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 5);
  }

  // Identify risk factors
  identifyRiskFactors(moodEntries) {
    const riskFactors = [];

    // Check for consecutive low mood days
    let consecutiveLowDays = 0;
    for (let i = moodEntries.length - 1; i >= 0; i--) {
      if (moodEntries[i].moodScore <= 2) {
        consecutiveLowDays++;
      } else {
        break;
      }
    }

    if (consecutiveLowDays >= 3) {
      riskFactors.push({
        factor: "Consecutive low mood days",
        severity: Math.min(1, consecutiveLowDays / 7),
        frequency: consecutiveLowDays,
      });
    }

    // Check for high stress levels
    const highStressEntries = moodEntries.filter(
      (entry) => entry.stressLevel >= 8
    );
    if (highStressEntries.length > moodEntries.length * 0.3) {
      riskFactors.push({
        factor: "Consistently high stress levels",
        severity: 0.8,
        frequency: highStressEntries.length,
      });
    }

    // Check for poor sleep patterns
    const poorSleepEntries = moodEntries.filter(
      (entry) => entry.sleepHours < 6 || entry.sleepHours > 10
    );
    if (poorSleepEntries.length > moodEntries.length * 0.5) {
      riskFactors.push({
        factor: "Irregular sleep patterns",
        severity: 0.6,
        frequency: poorSleepEntries.length,
      });
    }

    return riskFactors;
  }

  // Generate personalized recommendations
  generateRecommendations(moodEntries, moodTrend, patterns) {
    const recommendations = [];

    // Based on mood trend
    if (moodTrend.direction === "declining") {
      recommendations.push({
        type: "activity",
        title: "Boost Your Mood",
        description:
          "Your mood has been declining. Try engaging in activities that typically improve your mood.",
        priority: "high",
        confidence: 0.8,
      });
    }

    // Based on positive activities
    if (patterns.positiveActivities.length > 0) {
      const topActivity = patterns.positiveActivities[0];
      recommendations.push({
        type: "activity",
        title: `Increase ${topActivity.activity} Time`,
        description: `${topActivity.activity} has been very effective for your mood. Consider doing more of this activity.`,
        priority: "medium",
        confidence: topActivity.effectiveness,
      });
    }

    // Based on triggers
    if (patterns.triggers.length > 0) {
      const topTrigger = patterns.triggers[0];
      recommendations.push({
        type: "activity",
        title: `Manage ${topTrigger.factor} Impact`,
        description: `${topTrigger.factor} seems to negatively affect your mood. Consider strategies to minimize its impact.`,
        priority: "high",
        confidence: 0.7,
      });
    }

    // Based on risk factors
    if (patterns.riskFactors.length > 0) {
      recommendations.push({
        type: "therapy",
        title: "Consider Professional Support",
        description:
          "Based on your patterns, you might benefit from talking to a mental health professional.",
        priority: "urgent",
        confidence: 0.9,
      });
    }

    // General wellness recommendations
    recommendations.push({
      type: "meditation",
      title: "Practice Mindfulness",
      description:
        "Daily mindfulness or meditation can help improve your overall mood and reduce stress.",
      priority: "low",
      confidence: 0.6,
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Assess overall risk level
  assessRisk(moodEntries, moodTrend) {
    let riskScore = 0;
    const riskFactors = [];
    const crisisIndicators = [];
    const recommendedActions = [];

    // Analyze recent mood scores
    const recentScores = moodEntries.slice(-7).map((entry) => entry.moodScore);
    const averageRecentScore =
      recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    if (averageRecentScore <= 2) {
      riskScore += 0.4;
      riskFactors.push("Consistently low mood scores");
      crisisIndicators.push("Persistent low mood");
      recommendedActions.push("Seek immediate professional help");
    }

    // Check for declining trend
    if (moodTrend.direction === "declining" && moodTrend.confidence > 0.7) {
      riskScore += 0.3;
      riskFactors.push("Declining mood trend");
      recommendedActions.push("Schedule a therapy session");
    }

    // Check for high stress
    const highStressCount = moodEntries.filter(
      (entry) => entry.stressLevel >= 8
    ).length;
    if (highStressCount > moodEntries.length * 0.3) {
      riskScore += 0.2;
      riskFactors.push("High stress levels");
      recommendedActions.push("Practice stress management techniques");
    }

    // Determine overall risk level
    let overallRisk;
    if (riskScore >= 0.7) overallRisk = "critical";
    else if (riskScore >= 0.5) overallRisk = "high";
    else if (riskScore >= 0.3) overallRisk = "moderate";
    else overallRisk = "low";

    return {
      overallRisk,
      riskFactors,
      crisisIndicators,
      recommendedActions,
    };
  }

  // Generate insights
  generateInsights(moodEntries, patterns) {
    const insights = {};

    // Mood variability
    const scores = moodEntries.map((entry) => entry.moodScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    insights.moodVariability = Math.round(Math.sqrt(variance) * 100) / 100;

    // Dominant mood
    const moodCounts = {};
    moodEntries.forEach((entry) => {
      moodCounts[entry.moodLabel] = (moodCounts[entry.moodLabel] || 0) + 1;
    });
    insights.dominantMood =
      Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "neutral";

    // Time patterns
    const hourlyMood = {};
    moodEntries.forEach((entry) => {
      const hour = new Date(entry.timestamp).getHours();
      if (!hourlyMood[hour]) hourlyMood[hour] = [];
      hourlyMood[hour].push(entry.moodScore);
    });

    const hourlyAverages = Object.entries(hourlyMood).map(([hour, scores]) => ({
      hour: parseInt(hour),
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    const bestHour = hourlyAverages.sort((a, b) => b.average - a.average)[0];
    const worstHour = hourlyAverages.sort((a, b) => a.average - b.average)[0];

    insights.bestTimeOfDay = bestHour
      ? `${bestHour.hour}:00`
      : "Not enough data";
    insights.worstTimeOfDay = worstHour
      ? `${worstHour.hour}:00`
      : "Not enough data";

    // Weekly patterns
    const dayOfWeekMood = {};
    moodEntries.forEach((entry) => {
      const day = new Date(entry.timestamp).getDay();
      if (!dayOfWeekMood[day]) dayOfWeekMood[day] = [];
      dayOfWeekMood[day].push(entry.moodScore);
    });

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayAverages = Object.entries(dayOfWeekMood).map(([day, scores]) => ({
      day: dayNames[parseInt(day)],
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    const bestDay = dayAverages.sort((a, b) => b.average - a.average)[0];
    insights.weeklyPattern = bestDay
      ? `You tend to feel best on ${bestDay.day}s`
      : "No clear weekly pattern";

    insights.seasonalTrends = "Seasonal analysis requires more data";

    return insights;
  }

  // Identify trend factors
  identifyTrendFactors(moodEntries, direction) {
    const factors = [];

    if (direction === "improving") {
      factors.push("Consistent positive activities");
      factors.push("Good sleep patterns");
      factors.push("Effective stress management");
    } else if (direction === "declining") {
      factors.push("Increased stress levels");
      factors.push("Poor sleep quality");
      factors.push("Reduced social interaction");
    } else {
      factors.push("Stable routine");
      factors.push("Consistent mood patterns");
    }

    return factors;
  }

  // Generate empty analysis for users with no data
  generateEmptyAnalysis(userId, analysisType, startDate, endDate) {
    return {
      userId,
      analysisType,
      moodTrend: {
        direction: "insufficient_data",
        confidence: 0,
        factors: ["No mood data available for analysis"],
      },
      patterns: {
        triggers: [],
        positiveActivities: [],
        riskFactors: [],
      },
      recommendations: [
        {
          type: "activity",
          title: "Start Tracking Your Mood",
          description:
            "Begin tracking your daily mood to get personalized insights and recommendations.",
          priority: "medium",
          confidence: 0.8,
        },
      ],
      riskAssessment: {
        overallRisk: "low",
        riskFactors: [],
        crisisIndicators: [],
        recommendedActions: [
          "Start mood tracking to enable personalized insights",
        ],
      },
      insights: {
        moodVariability: 0,
        dominantMood: "unknown",
        bestTimeOfDay: "unknown",
        worstTimeOfDay: "unknown",
        weeklyPattern: "No data available",
        seasonalTrends: "No data available",
      },
      metadata: {
        dataPointsAnalyzed: 0,
        timeRange: { start: startDate, end: endDate },
        aiModelVersion: this.modelVersion,
        processingTime: Date.now(),
      },
    };
  }
}

export default new AIAnalysisService();
