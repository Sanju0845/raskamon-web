import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart({ therapyType, dayRange, setDate }) {
  const { userData, token, backendUrl } = useContext(AppContext);
  const [userCategory, setUserCategory] = useState([]);
  const [selectedData, setSelectedData] = useState("");
  const [testData, setTestData] = useState([]);
  const [avg, setAvg] = useState(null);
  const [testTaken, setTestTaken] = useState(0);

  // Fetch categories when therapyType changes
  useEffect(() => {
    if (!token || !userData?._id || !therapyType) return;

    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/analytics/user-test-category/${userData._id}?therapyType=${therapyType}`,
          { headers: { token } }
        );
        const categories = res.data.category || [];
        setUserCategory(categories);

        // Persist selection if still valid, otherwise default to first category
        setSelectedData((prev) =>
          prev && categories.includes(prev) ? prev : categories[0] || ""
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, [userData?._id, token, therapyType]);

  // Fetch test data whenever selectedData or dayRange changes
  useEffect(() => {
    if (!token || !userData?._id || !selectedData) return;

    const fetchTestData = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/analytics/test-results/${userData._id}?therapyType=${selectedData}&dayRange=${dayRange}`,
          { headers: { token } }
        );
        setTestData(res.data.data || []);
        setAvg(res.data.overallAvg || 0);
        setTestTaken(res.data.data?.length || 0);
      } catch (err) {
        console.error(err);
        setTestData([]);
      }
    };

    fetchTestData();
  }, [selectedData, dayRange, userData?._id, token]);

  // Chart data memoized
  const data = useMemo(() => {
    const labels = testData.map((t) =>
      new Date(t.completedAt).toLocaleDateString()
    );
    const values = testData.map((t) => t.totalScore || 0);
    const colors = testData.map(
      () =>
        `rgba(${Math.random() * 255},${Math.random() * 255},${
          Math.random() * 255
        },0.7)`
    );

    return {
      labels,
      datasets: [
        {
          label: selectedData,
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
        },
      ],
    };
  }, [testData, selectedData]);

  // Chart options memoized
  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: `${selectedData} Chart` },
        tooltip: {
          callbacks: {
            title: (ctx) =>
              testData[ctx[0].dataIndex]?.assessmentId?.title || "Test",
            label: (ctx) => {
              const item = testData[ctx.dataIndex];
              return [
                `Score: ${item.totalScore || 0}`,
                `Result: ${item.result}`,
                `Date: ${new Date(item.completedAt).toLocaleDateString()}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { display: true },
          grid: { drawTicks: true, drawLabels: true },
        },
        y: { beginAtZero: true },
      },
      onHover: (event, elements) => {
        if (elements.length > 0) {
          event.native.target.style.cursor = "pointer";
        } else {
          event.native.target.style.cursor = "default";
        }
      },
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const item = testData[elements[0].index];
          setDate(item.completedAt || "N/A");
        }
      },
    }),
    [testData, selectedData, setDate]
  );

  return (
    <div className=" relative p-4 bg-emerald-50 rounded-2xl shadow-md hover:scale-105 transition-transform border-t-8 border-[#0b5302]">
      {testData.length > 0 && (
        <div
          className="
      absolute 
      -top-2 
      left-1/2 
      -translate-x-1/2 
      -translate-y-full 
      bg-green-700 
      text-white 
      text-xs 
      px-3 
      py-1 
      rounded-full 
      shadow-md 
      animate-bounce 
      whitespace-nowrap
      z-10
      max-sm:left-auto 
      max-sm:right-2 
      max-sm:top-0 
      max-sm:-translate-x-0 
      max-sm:-translate-y-0 
      max-sm:text-[9px] 
      max-sm:px-1.5 
      max-sm:py-[1px] 
      max-sm:rounded-md 
      max-sm:shadow-sm
    "
        >
          Click a bar for test details
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 max-sm:flex-wrap">
        <h1 className="text-base font-semibold">Select test:</h1>
        <select
          className="p-2 border rounded h-10"
          value={selectedData}
          onChange={(e) => setSelectedData(e.target.value)}
        >
          {userCategory.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4 mb-4 text-base font-medium">
        <span className="text-xs bg-gray-100  px-2 py-[4px] rounded-lg ">
          Tests Taken: {testTaken}
        </span>
        <span className="text-xs bg-gray-100  px-2 py-[4px] rounded-lg ">
          Avg Score: {avg?.toFixed(0)}
        </span>
      </div>

      <Bar data={data} options={options} />
      <p className="text-sm text-gray-500">
        Displays data from the 7 most recent assessments
      </p>
    </div>
  );
}
