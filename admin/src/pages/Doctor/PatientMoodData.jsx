import { AppContext } from "@/context/AppContext";
import { DoctorContext } from "@/context/DoctorContext";
import React, { useContext, useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Activity,
  Clock,
  User,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import ProgressBar from "@/components/ProgressBar";
import { motion } from "motion/react";

const PatientMoodData = () => {
  const { dToken } = useContext(DoctorContext);
  const { slotDateFormat } = useContext(AppContext);

  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  // Get patient ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("patientId");

  const simulateProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const fetchPatientMoodData = async () => {
    try {
      setIsLoading(true);
      const progressInterval = simulateProgress();

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/patient-mood-data`,
        {
          headers: {
            dtoken: dToken,
          },
          params: {
            patientId,
            period: selectedPeriod,
          },
        }
      );

      if (response.data.success) {
        setPatientData(response.data);
      } else {
        toast.error(response.data.message || "Failed to fetch patient data");
      }

      setLoadingProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch patient mood data");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  useEffect(() => {
    if (dToken && patientId) {
      fetchPatientMoodData();
    }
  }, [dToken, patientId, selectedPeriod]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="text-green-500 text-xl" />;
      case "declining":
        return <TrendingDown className="text-red-500 text-xl" />;
      case "stable":
        return <Minus className="text-gray-500 text-xl" />;
      default:
        return <AlertCircle className="text-gray-400 text-xl" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full sm:w-1/2 h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <ProgressBar progress={loadingProgress} />
          <p className="mt-4 text-gray-600">Loading patient mood data...</p>
        </div>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="w-full sm:w-1/2 h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">No patient ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 w-full sm:w-[80vw] flex flex-col items-center sm:items-start justify-center pb-2 gap-4 sm:p-4 bg-gray-50 rounded">
      {/* Profile Image Popup view */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 w-screen flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            draggable="false"
            className="size-[300px] sm:size-[470px] object-cover rounded-full border bg-gray-700 select-none motion-preset-expand motion-duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Patient Mood Data
            </h1>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border">
            {["7", "30", "90", "365"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {period === "7"
                  ? "Week"
                  : period === "30"
                  ? "Month"
                  : period === "90"
                  ? "Quarter"
                  : "Year"}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border mb-6"
        >
          <div className="flex items-center space-x-4">
            <img
              className="size-16 rounded-full object-cover cursor-pointer hover:opacity-80"
              src={patientData?.patient?.image}
              alt="Patient"
              onClick={() => setSelectedImage(patientData?.patient?.image)}
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {patientData?.patient?.name}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Mail size={14} />
                  <span>{patientData?.patient?.email}</span>
                </div>
                {patientData?.patient?.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone size={14} />
                    <span>{patientData?.patient?.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                {patientData?.patient?.moodTrackingEnabled ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {patientData?.patient?.moodTrackingEnabled
                    ? "Mood Tracking Enabled"
                    : "Mood Tracking Disabled"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mood Tracking Status */}
        {!patientData?.patient?.moodTrackingEnabled ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-yellow-500 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">
                  Mood Tracking Not Enabled
                </h3>
                <p className="text-yellow-700">
                  This patient has not enabled mood tracking. No mood data is
                  available.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            >
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Average Mood
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patientData?.moodData?.analytics?.basicStats?.averageScore?.toFixed(
                        1
                      ) || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <BarChart3 className="text-blue-500 text-xl" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  {getTrendIcon(patientData?.moodData?.analytics?.trend)}
                  <span className="ml-1 text-gray-600 capitalize">
                    {patientData?.moodData?.analytics?.trend || "No trend"}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Entries
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patientData?.moodData?.totalEntries || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <Activity className="text-green-500 text-xl" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Last {selectedPeriod} days
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      AI Analysis
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patientData?.moodData?.aiAnalysis ? "Available" : "None"}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-full">
                    <Brain className="text-orange-500 text-xl" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {patientData?.patient?.aiAnalysisConsent
                    ? "Consent given"
                    : "No consent"}
                </p>
              </div>
            </motion.div>

            {/* Recent Entries */}
            {patientData?.moodData?.entries &&
              patientData.moodData.entries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg p-6 shadow-sm border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Mood Entries
                    </h3>
                    <button
                      onClick={fetchPatientMoodData}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <RefreshCw size={16} />
                      <span>Refresh</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {patientData.moodData.entries.slice(0, 5).map((entry) => (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-xl">
                            {entry.moodLabel === "very_happy" && "😊"}
                            {entry.moodLabel === "happy" && "🙂"}
                            {entry.moodLabel === "neutral" && "😐"}
                            {entry.moodLabel === "sad" && "😔"}
                            {entry.moodLabel === "very_sad" && "😢"}
                            {entry.moodLabel === "anxious" && "😰"}
                            {entry.moodLabel === "stressed" && "😤"}
                            {entry.moodLabel === "excited" && "🤩"}
                            {entry.moodLabel === "calm" && "😌"}
                            {entry.moodLabel === "angry" && "😠"}
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {entry.moodLabel.replace("_", " ")}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            Score: {entry.moodScore}/5
                          </p>
                          {entry.activities?.length > 0 && (
                            <p className="text-sm text-gray-600">
                              {entry.activities.slice(0, 2).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default PatientMoodData;
