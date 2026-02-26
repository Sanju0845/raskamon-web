import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const MoodChart = ({ data = [] }) => {
  // Theme color
  const chartColor = "#3A8DFF";

  // 🔥 FIX 1 — Clean data so Highcharts never gets null/undefined
  const cleanedValues = data.map((d) => {
    const v = Number(d.value);
    return isNaN(v) ? 0 : v; // replace invalid with 0
  });

  const cleanedLabels = data.map((d) => d.label ?? "");

  // 🔥 FIX 2 — Adjust max dynamically so the chart never cuts
  const maxValue = Math.max(...cleanedValues, 10);

  const options = {
    chart: {
      type: "areaspline",
      height: 300,
      backgroundColor: "transparent",
    },
    title: null,
    xAxis: {
      categories: cleanedLabels,
      labels: { enabled: false },
      lineColor: "#E0E0E0",
    },
    yAxis: {
      min: 0,
      max: maxValue + 5, // dynamic
      title: null,
      gridLineColor: "#F3F3F3",
    },
    plotOptions: {
      areaspline: {
        color: chartColor,
        fillColor: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, chartColor],
            [1, "rgba(58,141,255,0)"],
          ],
        },
        marker: {
          radius: 3,
          lineWidth: 1,
          lineColor: chartColor,
          fillColor: "#fff",
        },
      },
      series: {
        connectNulls: true, // 🔥 FIX 3 — No breaks in line
      },
    },
    series: [
      {
        name: "Mood Score",
        data: cleanedValues,
        color: chartColor,
      },
    ],
    credits: { enabled: false },
    legend: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default MoodChart;
