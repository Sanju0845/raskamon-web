import React, { useState, useContext, useEffect } from "react";
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

export default function DynamicBarChart({ therapyType }) {
  const { userData, token, backendUrl } = useContext(AppContext);
  const [cycleData, setCycleData] = useState([]);
  const [allCycles, setAllCycles] = useState([]); // For dropdown list
  const [selectedCycleDate, setSelectedCycleDate] = useState(""); // endDate of selected cycle
  const [avg, setAvg] = useState(null);
  const [testTaken, setTestTaken] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch cycles (default: latest)
  const fetchCycleData = async (cycleEndDate = "") => {
    if (!token || !userData?._id) return;
    try {
      setLoading(true);
      const url = `${backendUrl}/api/analytics/user-assessment-cycle/${
        userData._id
      }?therapyType=${therapyType}${
        cycleEndDate ? `&cycleEndDate=${cycleEndDate}` : ""
      }`;

      const res = await axios.get(url, { headers: { token } });
      const selectedCycle = res.data.selectedCycle || {};
      const cyclesList = res.data.allCycles || [];

      setAllCycles(cyclesList);
      setCycleData(selectedCycle.tests || []);

      setTestTaken(selectedCycle.tests?.length || 0);

      if (selectedCycle.tests && selectedCycle.tests.length > 0) {
        const total = selectedCycle.tests.reduce(
          (sum, item) => sum + (item.totalScore || 0),
          0
        );
        setAvg((total / selectedCycle.tests.length).toFixed(2));
      } else {
        setAvg(null);
      }

      // Set default selected cycle (latest)
      if (!cycleEndDate && selectedCycle.endDate) {
        setSelectedCycleDate(
          new Date(selectedCycle.endDate).toISOString().split("T")[0]
        );
      }
    } catch (err) {
      console.error("Error fetching cycle data:", err);
      setCycleData([]);
      setAllCycles([]);
      setAvg(null);
      setTestTaken(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Initial fetch
  useEffect(() => {
    fetchCycleData();
  }, [userData?._id, token, therapyType]);

  // 🔹 Handle dropdown change
  const handleCycleChange = (e) => {
    const date = e.target.value;
    setSelectedCycleDate(date);
    fetchCycleData(date);
  };

  // Chart data
  const labels = cycleData.map((item) =>
    new Date(item.completedAt).toLocaleDateString()
  );

  const dataValues = cycleData.map((item) => item.totalScore || 0);

  const colors = cycleData.map(() => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Cycle Test Scores",
        data: dataValues,
        backgroundColor: colors,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Cycle Test Performance" },
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return cycleData[index].assessmentId?.title || "Test";
          },
          label: (context) => {
            const index = context.dataIndex;
            const item = cycleData[index];
            return [
              `Score: ${item.totalScore || 0}`,
              `Result: ${item.result}`,
              `Date: ${new Date(item.completedAt).toLocaleDateString()}`,
            ];
          },
        },
      },
    },
    // scales: {
    //   x: {
    //     ticks: { display: true },
    //     grid: { drawTicks: true, drawLabels: true },
    //   },
    //   y: { beginAtZero: true },
    // },
    scales: {
      x: {
        ticks: {
          display: false,
        },
        grid: {
          drawTicks: false,
          drawLabels: false,
        },
      },
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="p-4 bg-blue-200 rounded-2xl shadow-md  border-l-8 border-[#55099b]">
      {/* 🔸 Dropdown for selecting cycles */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div>
          <p className="text-sm  mb-1 font-semibold">Select Cycle</p>
          <select
            value={selectedCycleDate}
            onChange={handleCycleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
          >
            {allCycles.length > 0 ? (
              allCycles.map((cycle) => {
                const start = new Date(cycle.startDate).toLocaleDateString();
                const end = new Date(cycle.endDate).toLocaleDateString();
                const endIso = new Date(cycle.endDate)
                  .toISOString()
                  .split("T")[0];
                return (
                  <option key={cycle.id} value={endIso}>
                    {`${start} → ${end}`}
                  </option>
                );
              })
            ) : (
              <option>No cycles found</option>
            )}
          </select>
        </div>

        <div className="flex mt-4 gap-6 text-base font-medium">
          <span className="text-xs bg-gray-100  px-2 py-[4px] rounded-lg ">
            Tests Taken: {testTaken ?? "0"}
          </span>
          <span className="text-xs bg-gray-100  px-2 py-[4px] rounded-lg ">
            Avg Score: {avg ?? "0"}
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading chart...</p>
      ) : cycleData.length > 0 ? (
        <Bar data={data} options={options} />
      ) : (
        <p className="text-center text-gray-500">No cycle data available.</p>
      )}
    </div>
  );
}
