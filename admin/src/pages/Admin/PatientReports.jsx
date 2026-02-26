import React, { useState, useContext } from "react";
import { AdminContext } from "@/context/AdminContext";
import { AppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Download,
  FileText,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";

const PatientReports = () => {
  const { aToken } = useContext(AdminContext);
  const { currencySymbol } = useContext(AppContext);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [reportType, setReportType] = useState("30months");

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await axios.get(
        `${backendUrl}/api/admin/download-patients-pdf`,
        {
          headers: { aToken },
          params: { reportType },
          responseType: "blob",
        }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `patient-details-${reportType}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Patient details PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await axios.get(
        `${backendUrl}/api/admin/download-patients-excel`,
        {
          headers: { aToken },
          params: { reportType },
          responseType: "blob",
        }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `patient-details-${reportType}-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Patient details Excel downloaded successfully!");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed to download Excel. Please try again.");
    } finally {
      setDownloadingExcel(false);
    }
  };

  const getReportDescription = () => {
    switch (reportType) {
      case "30months":
        return "Comprehensive report of all patient details and appointments from the last 30 days";
      case "12months":
        return "Patient details and appointments from the last 12 months";
      case "6months":
        return "Patient details and appointments from the last 6 months";
      default:
        return "Comprehensive report of all patient details and appointments from the last 30 days";
    }
  };

  const getPeriodText = () => {
    switch (reportType) {
      case "30months":
        return "30 Days";
      case "12months":
        return "12 Months";
      case "6months":
        return "6 Months";
      default:
        return "30 Days";
    }
  };

  return (
    <div className="m-2 w-full sm:w-[80vw] flex flex-col items-center sm:items-start justify-center pb-2 gap-6 sm:p-4 bg-gray-50 rounded">
      <div className="w-full">
        <h1 className="text-2xl mt-3 sm:mt-0 sm:text-3xl font-semibold px-1 tracking-wide text-primary select-none mb-2">
          Patient Reports
        </h1>
        <p className="text-gray-600 px-1">
          Generate and download comprehensive patient reports and analytics
        </p>
      </div>

      {/* Report Options */}
      <div className="w-full bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Report Configuration
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Period
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="30months">Last 30 Days (Comprehensive)</option>
              <option value="12months">Last 12 Months</option>
              <option value="6months">Last 6 Months</option>
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="text-blue-600 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-blue-800">Report Includes:</h3>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Patient personal information and contact details</li>
                  <li>• Appointment history and statistics</li>
                  <li>• Financial data and revenue analysis</li>
                  <li>• Recent appointment details</li>
                  <li>• Summary statistics and trends</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Description:</strong> {getReportDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="w-full bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Download className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Download Patient Report
              </h3>
              <p className="text-sm text-gray-600">
                Generate comprehensive reports with all patient details
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || downloadingExcel}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
            >
              {downloadingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadExcel}
              disabled={downloadingExcel || downloadingPDF}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
            >
              {downloadingExcel ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating Excel...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download Excel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <motion.div
          className="bg-white p-6 rounded-lg shadow-sm border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="text-blue-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Patient Data</p>
              <p className="text-xl font-bold text-gray-900">Complete</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-sm border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <Calendar className="text-green-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Time Period</p>
              <p className="text-xl font-bold text-gray-900">
                {getPeriodText()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-sm border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Analytics</p>
              <p className="text-xl font-bold text-gray-900">Included</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-sm border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-full">
              <DollarSign className="text-orange-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Financial</p>
              <p className="text-xl font-bold text-gray-900">Summary</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features List */}
      <div className="w-full bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Report Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={18} />
              <span className="text-sm text-gray-700">
                Patient demographics and contact information
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={18} />
              <span className="text-sm text-gray-700">
                Appointment history and statistics
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={18} />
              <span className="text-sm text-gray-700">
                Revenue analysis and financial data
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={18} />
              <span className="text-sm text-gray-700">
                Recent appointment details
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={18} />
              <span className="text-sm text-gray-700">
                Summary statistics and trends
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={18} />
              <span className="text-sm text-gray-700">
                Professional PDF and Excel formatting
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientReports;
