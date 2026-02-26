import React, { useMemo } from "react";
import { Heart, TrendingUp } from "lucide-react";
import MoodAnalyticsCard from "./chart/mood";
import { Doughnut } from "react-chartjs-2";

function getWeeklyAverageScore(entries) {
  if (!entries || entries.length === 0) return 0;

  const dailyAvgs = entries.map((day) => {
    const scores = day.situations.map((s) => s.normalized_score || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg;
  });

  const total = dailyAvgs.reduce((a, b) => a + b, 0);
  return Math.round(total / dailyAvgs.length);
}

function getWeeklyTrend(entries) {
  if (!entries || entries.length < 2)
    return { trend: 0, label: "Not enough data" };

  const getAvg = (day) => {
    const scores = day.situations.map((s) => s.normalized_score || 0);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const today = getAvg(entries[entries.length - 1]);
  const yesterday = getAvg(entries[entries.length - 2]);

  const diff = today - yesterday;
  const percent = yesterday ? ((diff / yesterday) * 100).toFixed(1) : 0;

  return {
    trend: Math.round(diff),
    percent_change: `${percent}%`,
    label:
      diff > 0
        ? `Mood improved by +${Math.round(diff)} points (${percent}%)`
        : diff < 0
        ? `Mood decreased by ${Math.round(diff)} points (${percent}%)`
        : "Mood stayed the same",
  };
}

function calculateNormalizedScore(situation) {
  const intensities = situation.intensities ?? [];
  const entryScore = situation.entry_score ?? 0;
  const tagAdjustment = situation.tag_adjustment ?? 0;

  if (intensities.length === 0) {
    return Math.round((entryScore + tagAdjustment + 1) * 50);
  }

  const avgIntensity =
    intensities.reduce((a, b) => a + b, 0) / intensities.length;

  const intensityScaled = avgIntensity / 5;

  const baseScore = intensityScaled - 0.5;

  const finalAdjusted = baseScore + entryScore + tagAdjustment;

  return Math.round((finalAdjusted + 1) * 50);
}

const moodsList = [
  { emoji: "😁", label: "Joyful" },
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "🙏", label: "Grateful" },
  { emoji: "💪", label: "Motivated" },
  { emoji: "❤️", label: "Loved" },
  { emoji: "🌟", label: "Inspired" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😩", label: "Tired" },
  { emoji: "😖", label: "Overwhelmed" },
  { emoji: "😭", label: "Awful" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😕", label: "Confused" },
  { emoji: "🥱", label: "Bored" },
  { emoji: "🙂", label: "Okay" },
  { emoji: "🥹", label: "Nostalgic" },
  { emoji: "🌈", label: "Hopeful" },
  { emoji: "😔", label: "Guilty" },
  { emoji: "😳", label: "Ashamed" },
];

function getOverallMoodType(normalizedScore) {
  if (normalizedScore >= 64) return "positive";
  if (normalizedScore >= 45) return "neutral";
  return "negative";
}

function getSituationScores(situations = []) {
  return situations.map((s) => calculateNormalizedScore(s));
}

function returnEmojiForMood(moodLabel) {
  const userMood = moodsList.find(
    (m) => m.label.toLowerCase() === moodLabel.toLowerCase()
  );
  return userMood?.emoji || "😐";
}

const MoodAnalytics = ({ data = [] }) => {
  const today = new Date();
  console.log(data, "get sum of data....");
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Sunday
  weekEnd.setHours(23, 59, 59, 999);

  const chartData = useMemo(() => {
    return data.slice(0, 7).map((entry) => {
      const scores = getSituationScores(entry.situations);
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 50;

      const situations = entry.situations
        ?.map((s) => s.situation || "")
        .filter(Boolean)
        .join(", ");

      const userMood = moodsList.find(
        (m) => m.label.toLowerCase() === entry.mood.toLowerCase()
      );

      const type = getOverallMoodType(avgScore);
      const moodEmoji = userMood?.emoji || "😐";
      const moodLabel = userMood?.label || "Neutral";

      const day = new Date(entry.date).toLocaleDateString("en-GB", {
        weekday: "short",
      });

      return {
        id: entry._id,
        day,
        date: entry.date,
        mood: moodEmoji,
        value: avgScore,
        type,
        label: moodLabel,
        result: situations,
        recommendations: entry.recommendations ?? [],
      };
    });
  }, [data]);

  // const chartData = useMemo(() => {
  //   const sorted = [...data].sort(
  //     (a, b) => new Date(a.date) - new Date(b.date)
  //   );

  //   return sorted.slice(-7).map((entry) => {
  //     const scores = getSituationScores(entry.situations);
  //     const avgScore =
  //       scores.length > 0
  //         ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  //         : 50;

  //     const situations = entry.situations
  //       ?.map((s) => s.situation || "")
  //       .filter(Boolean)
  //       .join(", ");

  //     const userMood = moodsList.find(
  //       (m) => m.label.toLowerCase() === entry.mood?.toLowerCase()
  //     );

  //     return {
  //       id: entry._id,
  //       day: new Date(entry.date).toLocaleDateString("en-GB", {
  //         weekday: "short",
  //       }),
  //       date: entry.date,
  //       mood: userMood?.emoji || "😐",
  //       value: avgScore,
  //       type: getOverallMoodType(avgScore),
  //       label: userMood?.label || "Neutral",
  //       result: situations,
  //       recommendations: entry.recommendations ?? [],
  //     };
  //   });
  // }, [data]);

  const moodDistribution = useMemo(() => {
    const map = {};

    data.forEach((entry) => {
      const mood = entry.mood || "Unknown";

      if (!map[mood]) {
        map[mood] = { count: 0 };
      }

      map[mood].count += 1;
    });

    return map;
  }, [data]);

  const doughnutData = useMemo(() => {
    const labels = Object.keys(moodDistribution);
    const values = labels.map((m) => moodDistribution[m].count);

    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#B4FF9F",
      "#FFB3E6",
      "#8AB6FF",
      "#FF6F61",
    ];

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  }, [moodDistribution]);

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: () => "",
          label: function (context) {
            const icon = returnEmojiForMood(context.label);
            const dataset = context.dataset.data;
            const total = dataset.reduce((a, b) => a + b, 0);
            const count = context.raw;
            const percent = ((count / total) * 100).toFixed(1);
            return [`${icon}  ${context.label}`, `Percent: ${percent}%`];
          },
        },
      },
    },
  };

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-md p-6 mt-6 hover:bg-slate-100 transition duration-300">
      <div className="flex items-center space-x-2 max-sm:flex-wrap">
        <Heart className="w-5 h-5 text-[#3A8DFF]" />
        <h2 className="text-lg font-semibold text-gray-700">Mood Analytics</h2>
        <p className="text-sm text-gray-500 ">Weekly mood analytics</p>
      </div>

      <div className="p-2 rounded mb-4 flex gap-4 items-center">
        <span className="text-xs bg-gray-100 px-2 py-[4px] rounded-lg">
          Average: {getWeeklyAverageScore(data)}/100
        </span>
        <p
          className={`text-xs flex gap-2 items-center px-2 py-[4px] rounded-lg 
            ${
              getWeeklyTrend(data).trend > 0
                ? "bg-green-500 text-white"
                : getWeeklyTrend(data).trend < 0
                ? "bg-red-500 text-white"
                : "bg-gray-400 text-white"
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Trend: {getWeeklyTrend(data).trend}</span>
        </p>
      </div>

      <h3 className="text-md font-medium mb-2">Mood Over Time</h3>
      <div className="rounded-lg mb-4">
        <MoodAnalyticsCard data={chartData} />
      </div>

      <h3 className="text-md font-medium text-gray-700 mb-2">
        Weekly Mood Distribution
      </h3>
      <div className="space-y-2 max-h-56 flex justify-center items-center w-full">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>
    </div>
  );
};

export default MoodAnalytics;
