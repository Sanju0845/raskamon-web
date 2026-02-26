import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

import ActivityDashboard from "./Activity";
import MoodAnalytics from "./MoodAnalytics";
import MoodCount from "./MoodCount";
import WritingAnalytics from "./WritingAnalytics";
import AnalyticsCards from "./AnalyticsCards";
import AssessmentHistory from "./AssessmentHistory";
import WritingInsights from "./WritingInsights";
import AssessmentInsights from "./AssessmentInsights";
import BarChart from "./BarChart";
import CycleBarChart from "./CycleBarChart";
import AssessmentResult from "./AssessmentResult";
import SummaryChart from "./chart/pieChartSummary";
import MoodScoreChart from "./chart/MoodScoreChart";
export default function UserDashboard() {
  const { userData, token, backendUrl } = useContext(AppContext);
  const [userAnalyticsData, setUserAnalyticsData] = useState(null);
  const [date, setDate] = useState("");
  const [dayRange, setDayRange] = useState(""); // "" = all days
  const [error, setError] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [singleData, setSingleData] = useState([]);
  const [therapyType, setTherapyType] = useState("individual");
  // Tabs for therapy types
  const tabs = [
    { key: "individual", label: "Individual Therapy" },
    { key: "couple", label: "Couple Therapy" },
    { key: "family", label: "Family Therapy" },
    { key: "child", label: "Child Therapy" },
  ];

  //Fetch user analytics data
  useEffect(() => {
    if (!token || !userData?._id) {
      setUserAnalyticsData(null);
      setError("You must be logged in to view analytics.");
      return;
    }

    const fetchAnalyticsUserData = async () => {
      try {
        setError("");

        // Build query string dynamically
        const params = new URLSearchParams();
        if (dayRange) params.append("days", dayRange);
        if (therapyType) params.append("therapyType", therapyType);

        const query = params.toString() ? `?${params.toString()}` : "";
        const res = await axios.get(
          `${backendUrl}/api/analytics/${userData._id}${query}`,
          { headers: { token } }
        );

        setUserAnalyticsData(res.data);
      } catch (err) {
        console.error("Error fetching user analytics data:", err);
        setError("Failed to fetch analytics. Please try again later.");
        setUserAnalyticsData(null);
      }
    };

    fetchAnalyticsUserData();
  }, [dayRange, therapyType, token, userData?._id]);

  // Memoized average score calculation
  const avgScore = useMemo(() => {
    const assessments = userAnalyticsData?.userassessments || [];
    if (!assessments.length) return 0;

    const total = assessments.reduce((sum, a) => sum + (a.totalScore || 0), 0);
    return (total / assessments.length).toFixed(1);
  }, [userAnalyticsData?.userassessments]);

  const fetchAssessment = async (date) => {
    try {
      const res = await axios.get(`${backendUrl}/api/analytics/assessment`, {
        params: { date },
        headers: { token },
      });

      setSingleData(res.data.data);
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssessment(date);
  }, [date]);

  const [newEntry, setNewEntry] = useState([]);
  const fetchWeeklyMood = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/analytics/weekly-mood/${userData._id}`,
        {
          headers: { token },
        }
      );

      setNewEntry(res.data.moodEntries);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWeeklyMood();
  }, []);

  const [summary, setSummaryData] = useState([]);
  const [isActive, setActive] = useState(false);

  const fetchUserAssessmentData = async () => {
    try {
      setError("");

      const params = new URLSearchParams();
      if (therapyType) params.append("therapyType", therapyType);
      if (dayRange) params.append("days", dayRange);
      const query = params.toString() ? `?${params.toString()}` : "";

      const res = await axios.get(
        `${backendUrl}/api/analytics/user/current-month/assessment/${userData._id}${query}`,
        { headers: { token } }
      );

      setSummaryData(res.data);
    } catch (err) {
      console.error(
        "Error fetching user assessment data:",
        err.response?.data || err.message
      );
      setError("Failed to fetch assessment data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchUserAssessmentData();
  }, [userData?._id, isActive, therapyType, dayRange]);

  const { categorySummary, overallAvgScore, testTaken } = summary;
  // Reusable grid container
  const GridContainer = ({ children }) => (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-2 lg:grid-cols-2 md:grid-cols-1 max-sm:grid-cols-1 gap-4">
      {children}
    </div>
  );

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 11c0 .828-.672 1.5-1.5 1.5S9 11.828 9 11s.672-1.5 1.5-1.5S12 10.172 12 11zM15 11c0 .828-.672 1.5-1.5 1.5S12 11.828 12 11s.672-1.5 1.5-1.5S15 10.172 15 11zM9 16h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h4l2-2h6a2 2 0 012 2v14a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800">
          You’re not logged in
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500">
          Please log in to access your personalized dashboard and see your
          analytics.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Day Range Selector + Therapy Tabs */}
      <div className="max-w-7xl mx-auto p-4 flex items-center gap-2 flex-wrap">
        <label className="font-semibold">Select Day Range:</label>
        <select
          className="border p-2 rounded"
          value={dayRange}
          onChange={(e) => setDayRange(e.target.value)}
        >
          <option value="">All</option>
          <option value="1">1 Day</option>
          <option value="7">7 Days</option>
          <option value="14">14 Days</option>
          <option value="30">30 Days</option>
        </select>
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTherapyType(item.key)}
            className={`px-4 py-2 border rounded transition ${
              therapyType === item.key
                ? "bg-gradient-to-r from-purple-600 to-pink-600  text-white border-blue-600"
                : "border-black text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <AnalyticsCards data={userAnalyticsData} />
      <GridContainer>
        <MoodAnalytics data={newEntry} />
        <MoodCount data={newEntry} />
        {/* <ActivityDashboard
          avgPerAssessment={userAnalyticsData?.avgPerAssessment || "0 min"}
          streak={userAnalyticsData?.streak || 0}
          badges={userAnalyticsData?.badges}
          totalTimeSpent={userAnalyticsData?.totalTimeSpent || "0 hours"}
          completedCount={userAnalyticsData?.completedCount || 0}
          pendingCount={userAnalyticsData?.pendingCount || 0}
        /> */}
      </GridContainer>
      <GridContainer>
        <MoodScoreChart moodEntries={newEntry} />
        <ActivityDashboard
          avgPerAssessment={userAnalyticsData?.avgPerAssessment || "0 min"}
          streak={userAnalyticsData?.streak || 0}
          badges={userAnalyticsData?.badges}
          totalTimeSpent={userAnalyticsData?.totalTimeSpent || "0 hours"}
          completedCount={userAnalyticsData?.completedCount || 0}
          pendingCount={userAnalyticsData?.pendingCount || 0}
        />
      </GridContainer>
      <GridContainer>
        <AssessmentInsights data={userAnalyticsData?.userassessments} />
        <AssessmentHistory
          data={userAnalyticsData?.userAssessmentRecent30}
          avgScore={userAnalyticsData?.avgScoreRecent30?.toFixed(0)}
        />
      </GridContainer>
      <GridContainer>
        <BarChart
          dayRange={dayRange}
          setDate={setDate}
          therapyType={therapyType}
        ></BarChart>
        <SummaryChart data={summary}></SummaryChart>
      </GridContainer>
      {/* <Dashboard></Dashboard> */}
      {/* Third Grid: Writing Analytics & Insights */}
      {/*       <GridContainer>
        <WritingAnalytics />
        <WritingInsights />
      </GridContainer> */}
      <AssessmentResult
        data={singleData[0]}
        isOpen={isOpen}
        onClose={() => {
          setOpen(false);
          setDate("");
        }}
      />
      <div className="responsive-container">
        <div className=" flex items-center justify-center min-h-screen p-4">
          <div className=" bg-white rounded-2xl shadow-lg  w-full max-w-6xl h-full  border-4 sm:border-8 border-[#72059c]">
            {/* Header */}
            <div className="sticky top-0 bg-white z-20  p-4 sm:p-6">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
                {therapyType.charAt(0).toUpperCase() + therapyType.slice(1)}{" "}
                Summary Report{" "}
                {dayRange && dayRange !== "All" && `(Last ${dayRange} Days)`}
              </h1>

              <div className="flex  justify-center items-center  gap-4 sm:gap-6 text-gray-700 ">
                <div className="text-center">
                  <p className="text-xs sm:text-sm max-sm:text-sm font-semibold text-gray-500 uppercase">
                    Total Tests Taken
                  </p>
                  <p className=" text-base sm:text-lg max-sm:text-sm font-bold text-indigo-600 hover:scale-110 sm:hover:scale-150">
                    {testTaken}
                  </p>
                </div>

                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

                <div className="text-center">
                  <p className="text-xs sm:text-sm  max-sm:text-sm font-semibold text-gray-500 uppercase">
                    Overall Avg Score
                  </p>
                  <p className="text-base sm:text-lg  max-sm:text-sm font-bold text-indigo-600  hover:scale-110 sm:hover:scale-150">
                    {overallAvgScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="m-auto space-y-4 h-96  overflow-y-auto mb-6 p-4 sm:p-6 max-sm:p-6">
              {categorySummary?.map((cat, index) => (
                <div
                  key={index}
                  className="bg-neutral-200 rounded-xl  border border-gray-200 p-4 sm:p-5"
                >
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    {cat.category}
                  </h2>
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-md mb-3">
                    <p className="text-sm italic text-gray-700">
                      {cat.overallKeyRecommendation}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1">
                      Assessments
                    </h3>
                    <ul className="space-y-2">
                      {cat.results?.map((r, idx) => (
                        <li
                          key={idx}
                          className="bg-white p-2 rounded-lg border border-gray-200 text-sm shadow-sm"
                        >
                          <p className="font-medium text-gray-800">{r.title}</p>
                          <p className="text-gray-600 text-xs">
                            Score:{" "}
                            <span className="font-semibold">{r.score}</span> |
                            Result:{" "}
                            <span className="font-semibold">{r.result}</span>
                          </p>
                          <p className="text-xs italic text-gray-500 mt-1">
                            {r.keyRecommendation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <GridContainer>
        <ActivityDashboard
          avgPerAssessment={userAnalyticsData?.avgPerAssessment || "0 min"}
          streak={userAnalyticsData?.streak || 0}
          badges={userAnalyticsData?.badges}
          totalTimeSpent={userAnalyticsData?.totalTimeSpent || "0 hours"}
          completedCount={userAnalyticsData?.completedCount || 0}
          pendingCount={userAnalyticsData?.pendingCount || 0}
        />
        <AssessmentInsights data={userAnalyticsData?.userassessments} />
        <CycleBarChart
          dayRange={dayRange}
          therapyType={therapyType}
        ></CycleBarChart>
      </GridContainer>
      {/* {isActive && ( */}
      {/* )} */}
    </div>
  );
}
