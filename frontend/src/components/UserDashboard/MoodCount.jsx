import React, { useMemo, useState, useEffect, useContext } from "react";
import { CheckCircle2, CircleX, Heart, ArrowUp, ArrowDown } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import WeekBarChart from "./chart/WeekBarChart";
import PeriodComparisonChart from "./chart/PeriodComparisonChart";
import MoodTrendChart from "./chart/MoodTrendChart";

// ----- Moods list with hex colors -----
const moodsList = [
  { emoji: "😁", label: "Joyful", color: "#FACC15" }, // bg-yellow-400
  { emoji: "😊", label: "Happy", color: "#F59E0B" }, // bg-yellow-500
  { emoji: "😌", label: "Calm", color: "#60A5FA" }, // bg-blue-400
  { emoji: "🙏", label: "Grateful", color: "#FBBF24" }, // bg-amber-500
  { emoji: "💪", label: "Motivated", color: "#F97316" }, // bg-orange-500
  { emoji: "❤️", label: "Loved", color: "#EC4899" }, // bg-pink-500
  { emoji: "🌟", label: "Inspired", color: "#FDE047" }, // bg-yellow-300
  { emoji: "😢", label: "Sad", color: "#3B82F6" }, // bg-blue-500
  { emoji: "😡", label: "Angry", color: "#DC2626" }, // bg-red-600
  { emoji: "😰", label: "Anxious", color: "#14B8A6" }, // bg-teal-500
  { emoji: "😩", label: "Tired", color: "#9CA3AF" }, // bg-gray-400
  { emoji: "😖", label: "Overwhelmed", color: "#F87171" }, // bg-red-400
  { emoji: "😭", label: "Awful", color: "#A855F7" }, // bg-purple-500
  { emoji: "😐", label: "Neutral", color: "#6B7280" }, // bg-gray-500
  { emoji: "😕", label: "Confused", color: "#818CF8" }, // bg-indigo-400
  { emoji: "🥱", label: "Bored", color: "#94A3B8" }, // bg-slate-400
  { emoji: "🙂", label: "Okay", color: "#4ADE80" }, // bg-green-400
  { emoji: "🥹", label: "Nostalgic", color: "#F472B6" }, // bg-pink-400
  { emoji: "🌈", label: "Hopeful", color: "#34D399" }, // bg-emerald-400
  { emoji: "😔", label: "Guilty", color: "#F43F5E" }, // bg-rose-400
  { emoji: "😳", label: "Ashamed", color: "#E11D48" }, // bg-rose-500
];

function returnEmojiForMood(label) {
  const mood = moodsList.find(
    (m) => m.label.toLowerCase() === label.toLowerCase()
  );
  return mood?.emoji || "😐";
}
const tagColors = [
  "bg-red-100 text-red-700 border-red-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "bg-lime-100 text-lime-700 border-lime-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-rose-100 text-rose-700 border-rose-200",
];

const MoodCount = ({ data = [] }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [activePeriod, setActivePeriod] = useState("Weekly");
  const { userData, token, backendUrl } = useContext(AppContext);

  // Prepare mood distribution
  const moodDistribution = useMemo(() => {
    const map = {};
    data.forEach((entry) => {
      const mood = entry.mood || "Neutral";
      if (!map[mood]) map[mood] = { count: 0 };
      map[mood].count += 1;
    });
    return map;
  }, [data]);

  // Doughnut chart data
  const doughnutData = useMemo(() => {
    const labels = Object.keys(moodDistribution);
    const values = labels.map((m) => moodDistribution[m].count);
    const backgroundColors = labels.map((m) => {
      const moodObj = moodsList.find(
        (x) => x.label.toLowerCase() === m.toLowerCase()
      );
      return moodObj ? moodObj.color : "#CCCCCC";
    });

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  }, [moodDistribution]);

  // Center total plugin
  const centerTextPlugin = {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, width, height } = chart;
      ctx.save();
      const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(total, width / 2, height / 1.5); // moved up
      ctx.restore();
    },
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "80%",
    rotation: -90,
    circumference: 180,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  const [moodEmotionData, setMoodEmotionData] = useState([]);
  const fetchMoodData = async (userId, period, mood) => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/analytics/emotions-analytics/${userId}`,
        {
          params: {
            period: period?.toLowerCase(),
            targetMood: mood || null,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMoodEmotionData(res.data);
    } catch (err) {
      console.error("Mood Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (selectedMood && activePeriod) {
      fetchMoodData(userData._id, activePeriod, selectedMood);
    }
  }, [selectedMood, activePeriod]);
  function formatDate(date) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = String(d.getFullYear()).slice(-2); // last 2 digits

    return `${day}/${month}/${year}`;
  }

  const today = formatDate(new Date());
  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-md p-6 mt-6 hover:bg-slate-100 transition duration-300 relative min-h-[40vh]">
      <div className="flex items-center space-x-2 max-sm:flex-wrap">
        <Heart className="w-5 h-5 text-[#3A8DFF]" />
        <h2 className="text-lg font-semibold text-gray-700">Mood Count</h2>
      </div>

      <div className="space-y-2 flex flex-col justify-center items-center w-full  max-sm:h-auto mt-4">
        {/* Half Donut Chart */}

        <div className="">
          <Doughnut
            data={doughnutData}
            options={doughnutOptions}
            plugins={[centerTextPlugin]}
          />
        </div>

        {/* Emoji + Color Cards */}
        <div className="w-full flex flex-wrap justify-center gap-3  mt-4">
          {Object.keys(moodDistribution).map((mood) => {
            const emoji = returnEmojiForMood(mood);
            const moodObj = moodsList.find(
              (x) => x.label.toLowerCase() === mood.toLowerCase()
            );
            const color = moodObj ? moodObj.color : "#CCCCCC";

            return (
              <div
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm"
                style={{
                  backgroundColor: `${color}33`,
                  borderLeft: `4px solid ${color}`,
                }}
              >
                <span
                  className="text-2xl flex items-center justify-center rounded-full p-1"
                  style={{ backgroundColor: color + "55" }}
                >
                  {emoji}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {mood}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay Modal */}
      {selectedMood && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto"
          onClick={() => setSelectedMood(null)} // close when background clicked
        >
          <div
            className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[70vh] overflow-y-auto text-center relative"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking modal
          >
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setSelectedMood(null);
                setActivePeriod("Weekly");
              }}
            >
              ✕
            </button>

            {/* Emoji and Mood Name */}
            <div className="text-5xl mb-4">
              {returnEmojiForMood(selectedMood)}
            </div>
            <h3 className="text-lg font-semibold mb-2">{selectedMood}</h3>

            {/* Tabs */}
            <div className="relative flex justify-center mb-4 bg-gray-100 p-2 rounded-2xl">
              <div
                className={`absolute top-2 bottom-2 w-1/3 rounded-xl bg-white shadow-md transition-all duration-300`}
                style={{
                  transform:
                    activePeriod === "Weekly"
                      ? "translateX(0%)"
                      : activePeriod === "Monthly"
                      ? "translateX(100%)"
                      : "translateX(200%)",
                }}
              ></div>

              {["Weekly", "Monthly", "Yearly"].map((period) => {
                const isSelected = period === activePeriod;
                return (
                  <button
                    key={period}
                    onClick={() => setActivePeriod(period)}
                    className={`
          w-1/3 py-2 font-medium z-10 transition-colors
          ${isSelected ? "text-gray-900" : "text-gray-500"}
        `}
                  >
                    {period}
                  </button>
                );
              })}
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 w-full">
              {/* Period Comparison Chart */}
              <div className="bg-white shadow-xl p-4 space-y-2 rounded-xl flex flex-col justify-between">
                <PeriodComparisonChart
                  frequency={moodEmotionData?.stats?.frequency}
                />
              </div>

              {/* Week Bar Chart */}
              <div className="bg-white shadow-xl p-4 space-y-2 rounded-xl flex flex-col justify-between">
                <WeekBarChart
                  data={moodEmotionData?.stats?.weekday_occurrence}
                />
              </div>

              {/* Longest Period Stats */}
              <div className="bg-white shadow-xl p-4 space-y-2 rounded-xl flex flex-col justify-between">
                <h1 className="text-lg text-start font-semibold mb-4">
                  Longest Period
                </h1>
                <div className="flex justify-center items-center w-full gap-12 flex-1">
                  {/* Longest with mood */}
                  <div className="space-y-2 flex flex-col items-center justify-center">
                    <div className="flex gap-2 w-full items-center justify-center">
                      <CheckCircle2 className="text-green-500 w-6 h-6" />
                      <p className="text-xl font-semibold">
                        {moodEmotionData?.stats?.streaks?.longest_with_mood}
                      </p>
                    </div>
                    <p className="text-sm font-semibold uppercase">with mood</p>
                    <hr />
                    <p className="text-sm">{today} - Today</p>
                  </div>

                  {/* Longest without mood */}
                  <div className="space-y-2 flex flex-col items-center justify-center">
                    <div className="flex gap-2 w-full items-center justify-center">
                      <CircleX className="text-red-500 w-6 h-6" />
                      <p className="text-xl font-semibold">
                        {moodEmotionData?.stats?.streaks?.longest_without_mood}
                      </p>
                    </div>
                    <p className="text-sm font-semibold uppercase">
                      without mood
                    </p>
                    <hr />
                    <p className="text-sm">{today} - Today</p>
                  </div>
                </div>
              </div>

              {/* Influence on Daily Mood */}
              <div className="bg-white shadow-xl p-4 space-y-2 rounded-xl flex flex-col justify-between">
                <h1 className="text-lg text-start font-semibold mb-4">
                  Influence on Daily Mood
                </h1>
                <div className="flex justify-center items-center w-full gap-12 flex-1">
                  {["day_before", "same_day", "day_after"].map((key) => {
                    const value = moodEmotionData?.stats?.influence?.[key] ?? 0;
                    const isUp = value > 0;
                    const isDown = value < 0;
                    const colorClass = isUp
                      ? "text-green-500"
                      : isDown
                      ? "text-red-500"
                      : "text-gray-400";

                    return (
                      <div
                        key={key}
                        className="space-y-2 flex flex-col items-center justify-center"
                      >
                        <div className="flex gap-2 w-full items-center justify-center min-w-[50px]">
                          {isUp && (
                            <ArrowUp className={`w-6 h-6 ${colorClass}`} />
                          )}
                          {isDown && (
                            <ArrowDown className={`w-6 h-6 ${colorClass}`} />
                          )}
                          {!isUp && !isDown && <span className="w-6 h-6" />}{" "}
                          {/* placeholder */}
                          <p
                            className={`text-xl font-semibold ${colorClass} text-center`}
                          >
                            {value}
                          </p>
                        </div>
                        <p className="text-sm font-semibold uppercase text-center">
                          {key
                            .replace("_", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mood Score Chart */}
              <div className="bg-white shadow-xl p-4 space-y-2 rounded-xl flex flex-col justify-between">
                <h1 className="text-lg text-start font-semibold mb-4">
                  Mood Score
                </h1>
                <MoodTrendChart moodEntries={moodEmotionData.moodEntries} />
              </div>
              <div className="bg-white shadow-xl p-4 space-y-2 rounded-xl flex flex-col">
                <h1 className="text-lg text-start font-semibold mb-4">Tags</h1>

                <div className="flex flex-wrap gap-2">
                  {moodEmotionData?.stats?.tags?.length > 0 ? (
                    moodEmotionData.stats.tags.map((item, index) => {
                      const colorClass = tagColors[index % tagColors.length];

                      return (
                        <div
                          key={index}
                          className={`px-3 py-1 rounded-lg text-sm flex items-center justify-center 
              transition border ${colorClass}`}
                        >
                          <span className="font-medium">{item.tag}</span>
                          <span className="ml-1 text-xs opacity-70">
                            ({item.count})
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">No tags available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MoodCount;
