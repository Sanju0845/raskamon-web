import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AssessmentInsights({ data = [] }) {
  const { labels, counts, averages, total, assessmentCounts } = useMemo(() => {
    const categoryCounts = {}; // number of questions per category
    const categoryScores = {}; // total scores per category
    const assessmentCounts = {}; // number of assessments that touched each category

    data.forEach((assessment) => {
      const categoriesInThisAssessment = new Set();

      assessment.assessmentId?.questions?.forEach((q) => {
        const cat = q.category || "Other";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

        if (assessment.results && assessment.results[cat] != null) {
          categoryScores[cat] =
            (categoryScores[cat] || 0) + assessment.results[cat];
        }

        categoriesInThisAssessment.add(cat);
      });

      // Count each assessment once per category
      categoriesInThisAssessment.forEach((cat) => {
        assessmentCounts[cat] = (assessmentCounts[cat] || 0) + 1;
      });
    });

    const labels = Object.keys(categoryCounts);
    const counts = Object.values(categoryCounts);
    const averages = labels.map((cat) =>
      categoryScores[cat]
        ? (categoryScores[cat] / categoryCounts[cat]).toFixed(1)
        : 0
    );
    const total = counts.reduce((sum, v) => sum + v, 0);

    return { labels, counts, averages, total, assessmentCounts };
  }, [data]);

  const getStatus = (avgScore) => {
    if (avgScore >= 8) return "Excellent 🌟";
    if (avgScore >= 6) return "Good 🙂";
    if (avgScore >= 4) return "Needs Attention ⚡";
    return "N/A";
  };

  // const colors = [
  //   "#1e90ff", // Dodger Blue
  //   "#004c99", // Dark Blue
  //   "#5b9bd5",
  //   "#a6c8ff",
  //   "#7aa0ff",
  //   "#3399ff",
  //   "#66b3ff",
  //   "#99ccff",
  //   "#cce5ff",
  //   "#e6f2ff",
  // ];

  const colors = [
    "#EF5350", // Red
    "#AB47BC", // Purple
    "#5C6BC0", // Indigo
    "#29B6F6", // Light Blue
    "#66BB6A", // Green
    "#FFCA28", // Amber
    "#26A69A", // Teal
    "#FFA726", // Orange
    "#8D6E63", // Brown
    "#78909C", // Blue Gray
    "#E53935", // Strong Red
    "#FB8C00", // Deep Orange
    "#FDD835", // Yellow
    "#43A047", // Forest Green
    "#1E88E5", // Blue
    "#8E24AA", // Deep Purple
    "#00ACC1", // Cyan
    "#6D4C41", // Coffee Brown
    "#C0CA33", // Lime
    "#F06292", // Pink
  ];
  // Prepare dataset with coverage
  const categoryValues = labels.map((cat) => assessmentCounts[cat] || 0);
  const totalCoverage = categoryValues.reduce((a, b) => a + b, 0);

  // const doughnutData = {
  //   labels,
  //   datasets: [
  //     {
  //       data: categoryValues,
  //       backgroundColor: labels.map((_, i) => colors[i % colors.length]),
  //       borderColor: "#fff",
  //       borderWidth: 2,
  //     },
  //   ],
  // };
  const doughnutData = {
    labels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        hoverBackgroundColor: labels.map((_, i) => colors[i % colors.length]), // Add this line
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBorderColor: "#ffffff",
        borderRadius: 6,
        hoverOffset: 12,
        spacing: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#ffffff", // Match container border color
        titleColor: "#000000", // Black title text
        bodyColor: "#000000", // Black body text
        borderColor: "#9c0039",
        borderWidth: 2,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          title: () => "",
          label: function (context) {
            const category = context.label || "";
            const value = context.raw || 0;
            const percent =
              totalCoverage > 0
                ? ((value / totalCoverage) * 100).toFixed(1)
                : 0;
            return `${category}: ${value} assessments (${percent}%)`;
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: true,
    },
    onHover: (event, elements) => {
      if (event.native?.target) {
        event.native.target.style.cursor =
          elements.length > 0 ? "pointer" : "default";
      }
    },
  };

  return (
    <div className="bg-gradient-to-r from-red-100 to-red-300 rounded-xl shadow-md p-6 mt-6 transition-transform duration-200   border-r-8 border-[#e00d65]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Chart Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Assessment</h3>
          <div
            className="
               h-56 md:h-64 
               rounded-full 
               transition-transform 
               duration-300
               lg:hover:scale-110 
               lg:hover:shadow-[0_0_40px_rgba(30,144,255,0.7)]
             "
          >
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm">Assessment Summary</p>
            <p className="text-base font-medium text-blue-700">
              {data.length === 0
                ? "No assessments yet 🚀. Start your first one to begin tracking insights!"
                : data.length > 20
                ? "Great job! 🎉 You’ve completed many assessments and are building strong insights."
                : "Keep going ✍️. Completing more assessments will give you deeper insights."}
            </p>
          </div>
        </div>

        {/* Insights Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Assessment Insights</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">Total Assessments</p>
              <p className="text-base font-semibold text-blue-800">
                {data.length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">Categories Found</p>
              <p className="text-base font-semibold text-blue-800">
                {labels.length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">Most Frequent Category</p>
              <p className="text-base font-semibold text-blue-800">
                {labels.length
                  ? labels[
                      Object.values(assessmentCounts).indexOf(
                        Math.max(...Object.values(assessmentCounts))
                      )
                    ]
                  : "N/A"}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">Best Status</p>
              <p className="text-base font-semibold text-blue-800">
                {getStatus(
                  Math.max(...averages.map((a) => parseFloat(a) || 0))
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
