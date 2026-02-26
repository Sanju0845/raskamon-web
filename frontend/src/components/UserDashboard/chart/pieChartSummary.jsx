import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#60A5FA", // blue-400
  "#F472B6", // pink-400
  "#34D399", // green-400
  "#F59E0B", // amber-500
  "#A78BFA", // purple-400
  "#FB7185", // rose-400
  "#38BDF8", // sky-400
];

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border w-64 max-h-72 overflow-y-auto">
      {item.results?.length > 0 && (
        <div className="text-xs text-gray-700 space-y-2">
          <div className="font-semibold text-gray-800">{item.category}:</div>
          {item.results.map((res, idx) => (
            <div key={idx} className="border-l-2 border-indigo-400 pl-2">
              <div className="font-medium">{res.title}</div>
              <div className="text-gray-600">
                Score: <span className="font-semibold">{res.score}</span> —{" "}
                {res.result}
              </div>
              {res.keyRecommendation && (
                <div className=" text-[11px] text-amber-700 leading-snug italic">
                  {res.keyRecommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function SummaryChart({ data }) {
  const categories = Array.isArray(data) ? data : data?.categorySummary ?? [];

  if (!categories.length) {
    return (
      <div className="w-full mx-auto p-4 rounded-xl">
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }

  const pieData = categories.map((c, idx) => ({
    name: c.category ?? `Category ${idx + 1}`,
    value: c.averageScore || 0,
    ...c,
  }));

  const total = pieData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="w-full mx-auto p-4 bg-white rounded-2xl shadow-lg border-t-8 border-[#b0b300] ">
      <div className="mb-3 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Your Assessment Contribution Overview
        </h3>
        <p className="text-sm text-gray-500">
          Showing relative contribution of each category to your overall score
        </p>
      </div>

      <div className="w-full h-[340px] text-sm max-sm:text-[10px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={50}
              paddingAngle={3}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(1)}%`
              }
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600 text-center">
        Total Score: <span className="font-semibold">{total}</span>
      </div>
    </div>
  );
}
