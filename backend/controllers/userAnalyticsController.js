import mongoose from "mongoose";
import { Assessment, UserAssessment } from "../models/assessmentModel.js";
import userModel from "../models/userModel.js";
function getAssessmentStreak(assessments, now = new Date()) {
  if (!assessments || !assessments.length) return 0;

  const formatLocalDay = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  // unique local days in YYYY-MM-DD, newest first
  const days = [
    ...new Set(assessments.map((a) => formatLocalDay(new Date(a.completedAt)))),
  ]
    .sort() // ascending lexicographic works with YYYY-MM-DD
    .reverse(); // newest first

  const todayStr = formatLocalDay(now);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDay(yesterday);

  const lastDay = days[0];

  // If the last completed day is neither today nor yesterday, streak is already broken
  if (lastDay !== todayStr && lastDay !== yesterdayStr) return 0;

  // Count consecutive days backwards starting from lastDay
  let streak = 1;
  // parse YYYY-MM-DD into a local Date (avoid 'new Date("YYYY-MM-DD")' timezone pitfalls)
  const [y, m, d] = lastDay.split("-").map(Number);
  const cur = new Date(y, m - 1, d);

  for (let i = 1; i < days.length; i++) {
    cur.setDate(cur.getDate() - 1);
    const prevStr = formatLocalDay(cur);
    if (days[i] === prevStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getAverageTimeSpent(attempts) {
  if (!attempts || attempts.length === 0) return 0;

  let totalMs = 0;
  attempts.forEach((attempt) => {
    let start = new Date(attempt.startedAt);
    let end = new Date(attempt.completedAt);

    if (!isNaN(start) && !isNaN(end) && end > start) {
      totalMs += end - start;
    }
  });

  return totalMs / (1000 * 60); // minutes
}

function getCompletedAndPending(allAssessments, userAttempts) {
  const completed = allAssessments?.filter((a) =>
    userAttempts.some((u) => u.assessmentId?.equals(a._id))
  );

  const pending = allAssessments?.filter(
    (a) => !userAttempts.some((u) => u.assessmentId?.equals(a._id))
  );

  return {
    total: allAssessments.length,
    completed,
    pending,
    completedCount: completed.length,
    pendingCount: pending.length,
  };
}
function normalizeScore(score, maxScore) {
  return (score / maxScore) * 10;
}

export const getUserAnalyticsData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days, therapyType } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!therapyType) {
      return res.status(400).json({ message: "therapyType is required" });
    }

    const getTherapyMetricLabel = (therapyType) => {
      switch (therapyType) {
        case "individual":
          return "Emotional Wellbeing";
        case "couple":
          return "Relationship Health";
        case "family":
          return "Family Harmony";
        case "child":
          return "Development & Growth";
        default:
          return "Emotional Wellbeing";
      }
    };

    const userassessmentsQuery = { userId, therapyType };
    let dayCount = parseInt(days) || null;

    if (dayCount) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dayCount);
      userassessmentsQuery.completedAt = { $gte: startDate };
    }

    const currentAssessments = await UserAssessment.find(userassessmentsQuery)
      .populate("assessmentId", "title description questions scoringRanges")
      .sort({ completedAt: -1 });

    const userAssessmentRecent30 = await UserAssessment.find(
      userassessmentsQuery
    )
      .populate("assessmentId", "title description questions scoringRanges")
      .sort({ completedAt: -1 })
      .limit(30);

    const avgScoreRecent30 = userAssessmentRecent30.length
      ? userAssessmentRecent30.reduce(
          (sum, ua) => sum + (ua.totalScore || 0),
          0
        ) / userAssessmentRecent30.length
      : 0;
    const assessments = await Assessment.find({ therapyType });

    const totalMinutes = getAverageTimeSpent(currentAssessments);
    const avgMinutes = totalMinutes / (currentAssessments.length || 1);
    const totalHours = totalMinutes / 60;

    const streak = getAssessmentStreak(currentAssessments);
    const { total, completedCount, pendingCount } = getCompletedAndPending(
      assessments,
      currentAssessments
    );

    const categoryScores = {};
    currentAssessments.forEach((ua) => {
      const questions = ua.assessmentId.questions || [];
      const maxScore =
        ua.assessmentId.scoringRanges?.reduce(
          (acc, curr) => Math.max(acc, curr.maxScore || 0),
          0
        ) || 30;

      questions.forEach((q) => {
        const cat = q.category?.toLowerCase() || "unknown";
        const score = normalizeScore(ua.totalScore, maxScore);
        if (!categoryScores[cat]) categoryScores[cat] = [];
        categoryScores[cat].push(score);
      });
    });

    const avgCategoryScores = {};
    Object.keys(categoryScores).forEach((cat) => {
      const scores = categoryScores[cat];
      avgCategoryScores[cat] =
        scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    const normalizeMetric = (ua) => {
      if (!ua) return 0;
      const maxScore =
        ua.assessmentId.scoringRanges?.reduce(
          (acc, curr) => Math.max(acc, curr.maxScore || 0),
          0
        ) || 10;
      const relevantQuestions = (ua.assessmentId.questions || []).filter(
        (q) => q.category?.toLowerCase() === "stress"
      );
      if (!relevantQuestions.length) return 0;
      return normalizeScore(ua.totalScore, maxScore);
    };

    const avgScore = (arr) =>
      arr.length
        ? arr.reduce((sum, a) => sum + (a.totalScore || 0), 0) / arr.length
        : 0;

    const avgMetric = (arr) =>
      arr.length
        ? arr.map(normalizeMetric).reduce((sum, s) => sum + s, 0) / arr.length
        : 0;

    // --- Previous period ---
    let lastAssessments = [];
    if (dayCount) {
      const lastStart = new Date();
      lastStart.setDate(lastStart.getDate() - dayCount * 2);
      const lastEnd = new Date();
      lastEnd.setDate(lastEnd.getDate() - dayCount);

      lastAssessments = await UserAssessment.find({
        userId,
        therapyType,
        completedAt: { $gte: lastStart, $lt: lastEnd },
      })
        .populate("assessmentId", "title description questions scoringRanges")
        .sort({ completedAt: -1 });
    } else if (currentAssessments.length > 1) {
      lastAssessments = [currentAssessments[1]];
    }

    const overallCurrent = avgScore(currentAssessments);
    const overallLast = avgScore(lastAssessments);
    const overallChange = overallLast
      ? ((overallCurrent - overallLast) / overallLast) * 100
      : 0;

    const metricCurrent = avgMetric(currentAssessments);
    const metricLast = avgMetric(lastAssessments);
    const metricChange = metricLast
      ? ((metricCurrent - metricLast) / metricLast) * 100
      : 0;

    const badges = {};
    badges.firstAssessment = currentAssessments.length > 0;
    badges.weekStreak = streak >= 7;
    const completedThisWeek = currentAssessments.filter(
      (ua) =>
        (new Date() - new Date(ua.completedAt)) / (1000 * 60 * 60 * 24) <= 7
    ).length;
    badges.consistentTracker = completedThisWeek >= 3;
    const completedThisMonth = currentAssessments.filter(
      (ua) =>
        (new Date() - new Date(ua.completedAt)) / (1000 * 60 * 60 * 24) <= 30
    ).length;
    badges.monthChampion = completedThisMonth >= 10;
    badges.mindfulWriter = currentAssessments.some(
      (ua) => ua.notes?.length > 0
    );
    badges.earlyBird = currentAssessments.some(
      (ua) => new Date(ua.completedAt).getHours() < 6
    );

    return res.status(200).json({
      streak,
      avgPerAssessment: `${avgMinutes.toFixed(2)} min`,
      totalTimeSpent: `${totalHours.toFixed(1)} hours`,
      totalAssessments: total,
      completedCount,
      pendingCount,
      avgCategoryScores: Object.fromEntries(
        Object.entries(avgCategoryScores).map(([k, v]) => [k, v.toFixed(2)])
      ),
      badges,
      userassessments: currentAssessments,
      userAssessmentRecent30,
      avgScoreRecent30,
      overallWellbeingCurrent: overallCurrent.toFixed(2),
      overallWellbeingLast: overallLast.toFixed(2),
      overallWellbeingChange: overallChange.toFixed(1),

      therapyMetric: {
        label: getTherapyMetricLabel(therapyType),
        current: metricCurrent.toFixed(2),
        last: metricLast.toFixed(2),
        change: metricChange.toFixed(1),
      },
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  }
};

export const getUserTestData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { therapyType, dayRange } = req.query;

    if (!userId)
      return res.status(400).json({ message: "User ID is required" });
    if (!therapyType)
      return res.status(400).json({ message: "therapyType is required" });

    // Calculate date range
    const today = new Date();
    const startDate = new Date();
    const range = parseInt(dayRange) || 10; // default 10 days
    startDate.setDate(today.getDate() - range);

    // Fetch data filtered by day range
    const data = await UserAssessment.find({
      userId,
      title: therapyType,
      completedAt: { $gte: startDate, $lte: today },
    })
      .populate("assessmentId", "title description questions scoringRanges")
      .sort({ completedAt: -1 })
      .limit(7);

    const overallAvg =
      data.reduce((sum, item) => sum + (item.totalScore || 0), 0) /
      (data.length || 1);

    res.status(200).json({
      data: data.slice(0, range),
      overallAvg,
      testtaken: data.length,
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  }
};

export const getUserTestCategoryData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { therapyType } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const filter = { userId };
    if (therapyType) {
      filter.therapyType = therapyType;
    }

    const data = await UserAssessment.find(filter)
      .populate(
        "assessmentId",
        "title description therapyType questions scoringRanges"
      )
      .sort({ completedAt: -1 })
      .limit(7);

    if (!data || data.length === 0) {
      return res.status(200).json({ category: [] });
    }

    // Get unique titles for the given therapyType
    const allCategory = [
      ...new Set(
        data
          .filter((item) => item.assessmentId?.therapyType === therapyType)
          .map((item) => item.assessmentId?.title)
      ),
    ];

    res.status(200).json({ category: allCategory });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal Server Error. Please try again later.",
    });
  }
};

export const getAssessmentByTitle = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Fetch assessments with populated assessment details
    const userAssessments = await UserAssessment.find({
      completedAt: targetDate,
    })
      .populate("assessmentId", "title description questions scoringRanges")
      .limit(7);

    if (!userAssessments || userAssessments.length === 0) {
      return res
        .status(404)
        .json({ message: "No user assessments found for this exact date" });
    }

    // Transform each assessment to include full question info in answers
    const formattedData = userAssessments.map((ua) => {
      const questionsMap = {};
      ua.assessmentId.questions.forEach((q) => {
        questionsMap[q._id.toString()] = q; // map for quick lookup
      });

      const answersWithQuestions = ua.answers.map((a) => {
        const qId = a.questionId?.toString() || a.questionId?.$oid;
        return {
          ...a._doc, // keep existing answer fields
          question: questionsMap[qId] || null, // attach full question
        };
      });

      return {
        ...ua._doc,
        answers: answersWithQuestions,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user assessment data",
    });
  }
};

export const getUserCycleTestData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { therapyType, cycleEndDate } = req.query; // optional query param

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!therapyType) {
      return res.status(400).json({ message: "therapyType is required" });
    }

    // Get all assessments for therapy type
    const assessments = await Assessment.find({ therapyType });
    const totalTests = assessments.length;
    if (!totalTests)
      return res.status(404).json({ message: "No assessments found" });

    // Get user’s completed assessments sorted by completion date
    const userAssessments = await UserAssessment.find({
      userId,
      therapyType,
    })
      .populate("assessmentId", "title")
      .sort({ completedAt: 1 });

    let cycles = [];
    let window = [];
    let uniqueSet = new Set();

    for (let i = 0; i < userAssessments.length; i++) {
      const current = userAssessments[i];
      const currentId = current.assessmentId?._id?.toString();
      if (!currentId) continue;

      window.push(current);
      uniqueSet.add(currentId);

      // keep window size under totalTests
      if (window.length > totalTests) {
        window.shift();
        uniqueSet = new Set(window.map((w) => w.assessmentId?._id?.toString()));
      }

      // check if valid cycle (all tests + consecutive days)
      if (window.length === totalTests && uniqueSet.size === totalTests) {
        let isConsecutive = true;
        for (let j = 1; j < window.length; j++) {
          const prev = new Date(window[j - 1].completedAt);
          const curr = new Date(window[j].completedAt);
          const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
          if (diffDays !== 1) {
            isConsecutive = false;
            break;
          }
        }

        if (isConsecutive) {
          const startDate = window[0].completedAt;
          const endDate = window[window.length - 1].completedAt;

          cycles.push({
            id: `${startDate.getTime()}-${endDate.getTime()}`,
            startDate,
            endDate,
            tests: [...window],
          });

          // reset window for next potential cycle
          window = [];
          uniqueSet.clear();
        }
      }
    }

    if (cycles.length === 0) {
      return res.status(404).json({ message: "No complete cycle found" });
    }

    //Determine which cycle to return
    let selectedCycle;

    if (cycleEndDate) {
      // when frontend sends a specific cycleEndDate
      selectedCycle = cycles.find(
        (cycle) =>
          new Date(cycle.endDate).toISOString().split("T")[0] ===
          new Date(cycleEndDate).toISOString().split("T")[0]
      );

      if (!selectedCycle) {
        return res.status(404).json({
          message: "No cycle found for the selected date",
        });
      }
    } else {
      // if no date passed → return the latest (most recent) cycle
      selectedCycle = cycles[cycles.length - 1];
    }

    // Also send summaries for dropdown display
    const summaries = cycles.map((c) => ({
      id: c.id,
      startDate: c.startDate,
      endDate: c.endDate,
      totalTests: c.tests.length,
    }));

    return res.status(200).json({
      message: "Cycle data fetched successfully",
      selectedCycle: {
        id: selectedCycle.id,
        startDate: selectedCycle.startDate,
        endDate: selectedCycle.endDate,
        tests: selectedCycle.tests,
      },
      allCycles: summaries, // optional, for dropdown use
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
};

export const getUserCurrentMonthAssessmentData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { therapyType, days } = req.query; // include days

    if (!userId)
      return res.status(400).json({ message: "User ID is required" });
    if (!therapyType)
      return res.status(400).json({ message: "therapyType is required" });

    const userassessmentsQuery = { userId, therapyType };
    let dayCount = parseInt(days) || null;

    if (dayCount) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dayCount);
      userassessmentsQuery.completedAt = { $gte: startDate };
    }

    // Fetch assessments within the given date range
    const allData = await UserAssessment.find(userassessmentsQuery)
      .populate("assessmentId", "title description questions scoringRanges")
      .sort({ completedAt: -1 })
      .limit(30);

    // Keep only the most recent record per assessmentId
    const uniqueDataMap = new Map();
    for (const item of allData) {
      const key = item.assessmentId?._id?.toString();
      if (!uniqueDataMap.has(key)) uniqueDataMap.set(key, item);
    }
    const data = Array.from(uniqueDataMap.values());

    // Calculate overall average score
    const overallAvg =
      data.reduce((sum, item) => sum + (item.totalScore || 0), 0) /
      (data.length || 1);

    // Generate category-based summary with userScore and maxScore
    const categorySummaryMap = new Map();
    data.forEach((item) => {
      const category = item.assessmentId?.questions[0]?.category || "General";

      if (!categorySummaryMap.has(category)) {
        categorySummaryMap.set(category, {
          category,
          assessmentsTaken: 0,
          totalScoreSum: 0,
          totalMaxScore: 0,
          results: [],
          overallKeyRecommendation: "",
        });
      }

      const summary = categorySummaryMap.get(category);
      summary.assessmentsTaken += 1;
      summary.totalScoreSum += item.totalScore || 0;

      // Calculate max possible score for this assessment
      const questions = item.assessmentId?.questions || [];
      const maxScoreForAssessment =
        questions.reduce((sum, q) => sum + (q.maxScore || 0), 0) || 0;
      summary.totalMaxScore += maxScoreForAssessment;

      // Push individual assessment details
      summary.results.push({
        title: item.assessmentId?.title || item.title,
        score: item.totalScore,
        maxScore: maxScoreForAssessment,
        result: item.result,
        keyRecommendation: item.recommendations?.[0] || "",
      });

      // Update overall key recommendation (highest score)
      const highestScoreAssessment = summary.results.reduce((prev, curr) =>
        curr.score > prev.score ? curr : prev
      );
      summary.overallKeyRecommendation =
        highestScoreAssessment.keyRecommendation;

      categorySummaryMap.set(category, summary);
    });

    // Convert to final array
    const categorySummary = Array.from(categorySummaryMap.values()).map(
      (cat) => ({
        category: cat.category,
        assessmentsTaken: cat.assessmentsTaken,
        averageScore: parseFloat(
          (cat.totalScoreSum / cat.assessmentsTaken).toFixed(1)
        ),
        userScore: cat.totalScoreSum,
        maxScore: cat.totalMaxScore,
        results: cat.results,
        overallKeyRecommendation: cat.overallKeyRecommendation,
      })
    );

    // Final response
    res.status(200).json({
      overallAvgScore: parseFloat(overallAvg.toFixed(1)),
      testTaken: data.length,
      categorySummary,
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  }
};

export const monthlyMoodAnalytics = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user and sort moodEntries
    const result = await userModel.findById(userId, { moodEntries: 1 });

    if (!result || !result.moodEntries) {
      return res.status(404).json({
        message: "No mood entries found!",
      });
    }

    // Sort by createdAt (latest first)
    const sortedEntries = result.moodEntries.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      moodEntries: sortedEntries,
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const moodAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "weekly", targetMood = null } = req.query;

    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const now = new Date();
    let startDate;

    if (period === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "yearly") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      return res.status(400).json({
        message: "Invalid period! Use weekly, monthly, yearly",
      });
    }

    // Fetch user mood entries
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const entries = user.moodEntries || [];

    // Filter entries inside period
    const periodEntries = entries.filter(
      (e) => new Date(e.createdAt) >= startDate && new Date(e.createdAt) <= now
    );

    // Further filter by targetMood
    const moodEntries = targetMood
      ? periodEntries.filter((e) => e.mood === targetMood)
      : periodEntries;

    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(
      prevStartDate.getDate() -
        (period === "weekly" ? 7 : period === "monthly" ? 30 : 365)
    );

    const lastPeriodEntries = entries.filter(
      (e) =>
        new Date(e.createdAt) >= prevStartDate &&
        new Date(e.createdAt) < startDate
    );

    const getDailyCounts = (entriesList, start, end) => {
      const counts = {};
      const dateCursor = new Date(start);

      while (dateCursor <= end) {
        const dateStr = dateCursor.toISOString().split("T")[0];
        counts[dateStr] = 0;
        dateCursor.setDate(dateCursor.getDate() + 1);
      }

      entriesList.forEach((e) => {
        const dateStr = new Date(e.createdAt).toISOString().split("T")[0];
        if (counts[dateStr] !== undefined) counts[dateStr]++;
      });

      return Object.entries(counts).map(([date, count]) => ({ date, count }));
    };

    const currentPeriodDaily = getDailyCounts(moodEntries, startDate, now);
    const lastPeriodDaily = getDailyCounts(
      lastPeriodEntries,
      prevStartDate,
      startDate
    );

    const currentPeriodMoodCount = moodEntries.length;
    const lastPeriodMoodCount = lastPeriodEntries.length;

    const trend =
      currentPeriodMoodCount > lastPeriodMoodCount
        ? "increasing"
        : currentPeriodMoodCount < lastPeriodMoodCount
        ? "decreasing"
        : "stable";

    const sortByDate = [...entries].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    let withMood = 0,
      maxWithMood = 0;
    let withoutMood = 0,
      maxWithoutMood = 0;

    sortByDate.forEach((item) => {
      if (item.mood === targetMood) {
        withMood++;
        withoutMood = 0;
      } else {
        withoutMood++;
        withMood = 0;
      }
      maxWithMood = Math.max(maxWithMood, withMood);
      maxWithoutMood = Math.max(maxWithoutMood, withoutMood);
    });

    const tagCountMap = {};

    moodEntries.forEach((e) => {
      e.situations?.forEach((s) => {
        s.tags?.forEach((t) => {
          tagCountMap[t] = (tagCountMap[t] || 0) + 1;
        });
      });
    });

    const tagCount = Object.entries(tagCountMap).map(([tag, count]) => ({
      tag,
      count,
    }));

    const weekdayMap = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const occurrenceByDay = {};

    moodEntries.forEach((e) => {
      const day = weekdayMap[new Date(e.createdAt).getDay()];
      occurrenceByDay[day] = (occurrenceByDay[day] || 0) + 1;
    });

    const influence = {
      day_before: 0,
      same_day: 0,
      day_after: 0,
    };

    // Map entries by date for fast lookup
    const moodDateMap = {};
    entries.forEach((entry) => {
      const dateStr = new Date(entry.createdAt).toISOString().split("T")[0];
      if (!moodDateMap[dateStr]) moodDateMap[dateStr] = [];
      moodDateMap[dateStr].push(entry);
    });

    moodEntries.forEach((mEntry) => {
      const dateStr = new Date(mEntry.createdAt).toISOString().split("T")[0];

      // Day before
      const dayBeforeStr = new Date(
        new Date(dateStr).setDate(new Date(dateStr).getDate() - 1)
      )
        .toISOString()
        .split("T")[0];
      influence.day_before += moodDateMap[dayBeforeStr]
        ? moodDateMap[dayBeforeStr].reduce(
            (sum, e) => sum + (e.normalized_score || 0),
            0
          )
        : 0;

      // Same day
      influence.same_day += moodDateMap[dateStr]
        ? moodDateMap[dateStr].reduce(
            (sum, e) => sum + (e.normalized_score || 0),
            0
          )
        : 0;

      // Day after
      const dayAfterStr = new Date(
        new Date(dateStr).setDate(new Date(dateStr).getDate() + 1)
      )
        .toISOString()
        .split("T")[0];
      influence.day_after += moodDateMap[dayAfterStr]
        ? moodDateMap[dayAfterStr].reduce(
            (sum, e) => sum + (e.normalized_score || 0),
            0
          )
        : 0;
    });

    const emotionalBalance = (() => {
      let positive = 0,
        negative = 0;
      moodEntries.forEach((e) => {
        if (e.normalized_score > 0) positive += e.normalized_score;
        if (e.normalized_score < 0) negative += Math.abs(e.normalized_score);
      });
      const score =
        positive + negative === 0
          ? 0
          : (positive / (positive + negative)).toFixed(2);
      return { positive, negative, balance_score: Number(score) };
    })();

    const emotionalResilience = (() => {
      const sorted = [...periodEntries].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      let dips = [],
        lastLowIndex = null;

      sorted.forEach((e, i) => {
        if (e.normalized_score < -0.3) lastLowIndex = i;
        if (lastLowIndex !== null && e.normalized_score > 0.3) {
          dips.push(i - lastLowIndex);
          lastLowIndex = null;
        }
      });

      const avgRecovery =
        dips.length === 0
          ? null
          : (dips.reduce((a, b) => a + b, 0) / dips.length).toFixed(2);
      return { recovery_days: dips, average_recovery: avgRecovery };
    })();

    const moodDependency = (() => {
      const situationMap = {},
        tagMap = {};
      moodEntries.forEach((e) => {
        e.situations?.forEach((s) => {
          situationMap[s.situation] = (situationMap[s.situation] || 0) + 1;
          s.tags?.forEach((t) => (tagMap[t] = (tagMap[t] || 0) + 1));
        });
      });
      return { situations: situationMap, tags: tagMap };
    })();

    const emotionalComplexity = (() => {
      const countList = moodEntries.map((e) => e.emotions?.length || 0);
      if (countList.length === 0) return { average: 0, max: 0, entries: [] };
      const avg = (
        countList.reduce((a, b) => a + b, 0) / countList.length
      ).toFixed(2);
      return {
        average: Number(avg),
        max: Math.max(...countList),
        entries: countList,
      };
    })();


    res.json({
      period,
      targetMood,
      startDate,
      endDate: now,
      moodEntries,
      stats: {
        frequency: {
          lastPeriod: lastPeriodMoodCount,
          thisPeriod: currentPeriodMoodCount,
          trend,
          lastPeriodDaily,
          currentPeriodDaily,
        },
        streaks: {
          longest_with_mood: maxWithMood,
          longest_without_mood: maxWithoutMood,
        },
        tags: tagCount,
        weekday_occurrence: occurrenceByDay,
        influence,
      },
      advancedInsights: {
        emotionalBalance,
        emotionalResilience,
        moodDependency,
        emotionalComplexity,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
