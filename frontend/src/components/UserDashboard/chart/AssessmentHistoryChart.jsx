import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";

const AssessmentHistoryChart = ({ assessmentHistory }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    Highcharts.setOptions({
      chart: {
        backgroundColor: "#ffffff", // White background
      },
      title: { style: { color: "#333333", fontSize: "2em" } },
      xAxis: { labels: { style: { color: "#333333" } } },
      yAxis: { labels: { style: { color: "#333333" } } },
      tooltip: {
        backgroundColor: "#8224ed", // Tooltip background
        style: { color: "#ffffff" }, // Tooltip text
      },
    });

    Highcharts.chart(chartRef.current, {
      chart: { type: "line" },
      title: { text: null, align: "left" },
      credits: { enabled: false },

      // Use category axis for actual assessment dates
      // xAxis: {
      //   categories: assessmentHistory?.map((item) =>
      //     Highcharts.dateFormat("%b %e", new Date(item.completedAt).getTime())
      //   ),
      //   crosshair: { width: 1, color: "#3399ff" },
      //   labels: {
      //     autoRotation: [-45],
      //     style: { fontSize: "10px", color: "#333333" },
      //   },
      //   lineWidth: 0,
      //   tickLength: 0,
      // },

      yAxis: {
        min: 0,
        max: 40,
        gridLineColor: "#f2f2f2",
        offset: 20,
        title: { text: "Score", style: { color: "#333333" } },
      },

      tooltip: {
        useHTML: true,
        formatter: function () {
          const pointIndex = this.point.index;
          const item = assessmentHistory[pointIndex];
          return `
            <b>${Highcharts.dateFormat(
              "%A, %b %e %H:%M",
              new Date(item.completedAt).getTime()
            )}</b><br/>
            Assignment: ${item.assessmentId.title}<br/>
            Score: <b>${item.totalScore}</b><br/>
            Result: <span>${item.result}</span>
          `;
        },
      },

      series: [
        {
          name: "Assignment Scores",
          data: assessmentHistory?.map((item) => ({
            y: item.totalScore,
            result: item.result,
            assignment: item.assessmentId.title,
          })),
          color: "#8224ed", //#1e90ff
          lineWidth: 2,
          marker: {
            enabled: true,
            radius: 5,
            symbol: "circle",
            fillColor: "#004c99",
          },
        },
      ],
    });
  }, [assessmentHistory]);

  return <div ref={chartRef} style={{ height: "300px" }} />;
};

export default AssessmentHistoryChart;
