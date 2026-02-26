import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";

const MoodTrendChart = ({ moodEntries = [] }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!moodEntries || moodEntries.length === 0) return;

    // Sort entries by date
    const sortedEntries = [...moodEntries].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Extract the mood entry dates for tooltip
    const entryDates = sortedEntries.map(
      (entry) => entry.date || entry.createdAt.split("T")[0]
    );

    // Average normalized_score per moodEntry
    const seriesData = sortedEntries.map((entry) => {
      const scores = entry.situations?.map((s) => s.normalized_score ?? 0) || [
        0,
      ];
      const avgScore =
        scores.reduce((sum, val) => sum + val, 0) / scores.length;
      return avgScore;
    });

    Highcharts.chart(chartRef.current, {
      chart: {
        type: "line",
        backgroundColor: "#ffffff",
      },
      title: { text: null },
      credits: { enabled: false },

      xAxis: {
        categories: entryDates,
        labels: { enabled: false }, // hide x-axis labels
        lineWidth: 0,
        tickLength: 0,
      },

      yAxis: {
        min: 0,
        max: 100,
        gridLineColor: "#f2f2f2",
        title: { text: null }, // remove y-axis title
        labels: { enabled: true, style: { color: "#333333" } }, // keep y-axis values
      },

      tooltip: {
        formatter: function () {
          // Use the entryDates array to show the correct date
          return `<b>Date:</b> ${entryDates[this.point.index]}`;
        },
      },

      series: [
        {
          name: "Mood Score",
          data: seriesData,
          color: "#16a34a",
          lineWidth: 2,
          marker: { enabled: true, radius: 3, fillColor: "#16a34a" },
        },
      ],

      plotOptions: {
        line: {
          dataLabels: { enabled: false },
        },
      },
    });
  }, [moodEntries]);

  return <div ref={chartRef} style={{ height: "200px" }} />;
};

export default MoodTrendChart;
