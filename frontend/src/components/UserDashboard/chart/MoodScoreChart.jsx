import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";

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

const MoodScoreChart = ({ moodEntries = [] }) => {
  const chartRef = useRef(null);
  const [uniqueSituationTags, setUniqueSituationTags] = useState([]);

  useEffect(() => {
    if (!moodEntries || moodEntries.length === 0) return;

    const sorted = [...moodEntries].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Only unique situations for tag rendering
    const situationSet = new Set();

    const chartData = sorted.map((entry) => {
      const date = entry.date || entry.createdAt.split("T")[0];
      const score =
        entry.situations && entry.situations.length
          ? Math.round(
              entry.situations.reduce(
                (sum, s) => sum + calculateNormalizedScore(s),
                0
              ) / entry.situations.length
            )
          : 50;

      // collect situation names
      (entry.situations || []).forEach((s) => {
        if (s.situation) situationSet.add(s.situation);
      });

      return {
        y: score,
        custom: {
          date,
          mood: entry.mood,
        },
      };
    });

    // Build unique tag list with color mapping
    let index = 0;
    const tagArr = [...situationSet].map((name) => ({
      name,
      color: tagColors[index++ % tagColors.length],
    }));

    setUniqueSituationTags(tagArr);

    const totalAvg =
      chartData.reduce((sum, v) => sum + v.y, 0) / chartData.length;

    Highcharts.chart(chartRef.current, {
      chart: {
        type: "spline",
        backgroundColor: "transparent",
      },
      title: {
        text: `Overall Avg Score: ${Math.round(totalAvg)}`,
        style: { fontSize: "16px", fontWeight: "600", color: "#0f172a" },
      },
      credits: { enabled: false },
      xAxis: { visible: false },
      yAxis: { min: 0, max: 100, title: null },

      tooltip: {
        formatter: function () {
          return `
            Date: ${this.point.custom.date}<br/>
            Mood: ${this.point.custom.mood}<br/>
            Score: ${this.y}
          `;
        },
      },

      series: [
        {
          name: "Mood Score",
          data: chartData,
          color: "#22c55e", // chart line stays green
          lineWidth: 3,
          marker: {
            enabled: true,
            radius: 5,
            fillColor: "#22c55e",
            lineColor: "#166534",
            lineWidth: 1,
          },
        },
      ],
    });
  }, [moodEntries]);

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-lg p-6 mt-6 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-800">Mood Score</h2>

        <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full shadow-sm">
          Overall Avg
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-gray-200 mb-8"></div>

      {/* Chart */}
      <div ref={chartRef} className="h-[350px] w-full" />

      {/* Unique Situation Tags */}
      <h1>Situations</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {uniqueSituationTags.map((tag, i) => (
          <span
            key={i}
            className={`px-3 py-1 text-sm rounded-full border ${tag.color}`}
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MoodScoreChart;
