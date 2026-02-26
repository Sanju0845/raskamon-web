import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "@/context/AdminContext";
import { AppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  CalendarDays,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
} from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { motion } from "motion/react";

const Patients = () => {
  const { aToken } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currencySymbol } =
    useContext(AppContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  // loader progress simulation
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

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const progressInterval = simulateProgress();

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { data } = await axios.get(`${backendUrl}/api/admin/patients`, {
        headers: { aToken },
      });

      if (data.success) {
        setPatients(data.patients);
      } else {
        toast.error(data.message || "Failed to fetch patients");
      }

      setLoadingProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error(error.response?.data?.message || "Failed to fetch patients");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm)
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle size={16} className="text-green-500" />;
      case "Cancelled":
        return <XCircle size={16} className="text-red-500" />;
      case "Pending":
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100";
      case "Cancelled":
        return "text-red-600 bg-red-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString();
  };

  const formatAddress = (address) => {
    if (!address) return "Not provided";
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      return (
        `${address.line1 || ""} ${address.line2 || ""}`.trim() || "Not provided"
      );
    }
    return "Not provided";
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await axios.get(
        `${backendUrl}/api/admin/download-patients-pdf`,
        {
          headers: { aToken },
          responseType: "blob", // Important for file download
        }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `patient-details-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!");
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
      link.download = `patient-details-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Excel downloaded successfully!");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed to download Excel. Please try again.");
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="m-2 w-full sm:w-[80vw] flex flex-col items-center sm:items-start justify-center pb-2 gap-4 sm:p-4 bg-gray-50 rounded">
      {/* Profile Image Popup view */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            draggable="false"
            className="size-[300px] sm:size-[450px] object-cover rounded-2xl border bg-primary select-none motion-preset-expand motion-duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <h1 className="text-2xl mt-3 sm:mt-0 sm:text-3xl font-semibold px-1 tracking-wide text-primary select-none">
        All Patients
      </h1>

      {/* Search Bar and Download Button */}
      <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full max-w-md">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF || downloadingExcel}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
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
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="text-blue-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total Patients
              </p>
              <p className="text-xl font-bold text-gray-900">
                {patients.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <User className="text-green-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Active Patients
              </p>
              <p className="text-xl font-bold text-gray-900">
                {patients.filter((p) => p.joinedDate).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-xl font-bold text-gray-900">
                {
                  patients.filter((p) => {
                    const createdAt = new Date(p.joinedDate);
                    const now = new Date();
                    return (
                      createdAt.getMonth() === now.getMonth() &&
                      createdAt.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-full">
              <DollarSign className="text-orange-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">
                {currencySymbol}
                {patients
                  .reduce((sum, p) => sum + (p.totalAmount || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white w-full border rounded-lg text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll doctorlist-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px] flex-col">
            <ProgressBar progress={loadingProgress} />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex justify-center items-center min-h-[200px] flex-col text-gray-500">
            <User size={48} className="mb-4" />
            <p className="text-lg">
              {searchTerm
                ? "No patients found matching your search."
                : "No patients found."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_1.5fr_1fr_1fr] grid-flow-col py-3.5 px-6 border-b uppercase font-medium bg-white sticky top-0">
              <p>#</p>
              <p>Patient</p>
              <p>Age</p>
              <p>Phone</p>
              <p>Latest Appointment</p>
              <p>Total Visits</p>
              <p>Actions</p>
            </div>

            {filteredPatients.map((patient, index) => (
              <motion.div
                className="max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_1.5fr_1fr_1fr] items-center text-gray-600 sm:text-gray-500 py-3 px-6 border-b hover:bg-gray-50 cursor-pointer"
                key={patient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, delay: index * 0.05 }}
                onClick={() => setSelectedPatient(patient)}
              >
                <p className="max-sm:hidden">{index + 1}</p>

                <div className="flex items-center gap-2">
                  <img
                    className="size-8 aspect-square object-cover rounded-[5px] border cursor-pointer hover:opacity-80 select-none"
                    draggable="false"
                    src={patient.image || "/default-avatar.png"}
                    alt="patient image"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(patient.image);
                    }}
                  />
                  <div>
                    <p className="capitalize font-medium">{patient.name}</p>
                    <p className="text-xs text-gray-400">{patient.email}</p>
                  </div>
                </div>

                {!isNaN(Date.parse(patient.dob)) ? (
                  <p className="max-sm:hidden">{calculateAge(patient.dob)}</p>
                ) : (
                  <p className="max-sm:hidden text-rose-300">NA</p>
                )}

                <p className="max-sm:hidden">{patient.phone}</p>

                <div className="max-sm:hidden">
                  {patient.latestAppointment ? (
                    <div>
                      <p className="text-xs">
                        {slotDateFormat(patient.latestAppointment.date)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {patient.latestAppointment.time}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(
                          patient.latestAppointment.status
                        )}`}
                      >
                        {getStatusIcon(patient.latestAppointment.status)}
                        {patient.latestAppointment.status}
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">No appointments</p>
                  )}
                </div>

                <div className="max-sm:hidden">
                  <p className="font-medium">{patient.totalAppointments}</p>
                  <p className="text-xs text-gray-400">
                    {patient.completedAppointments} completed
                  </p>
                </div>

                <div className="max-sm:hidden">
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-primary">
                  Patient Details
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      className="size-16 aspect-square object-cover rounded-full border"
                      src={selectedPatient.image || "/default-avatar.png"}
                      alt="patient image"
                    />
                    <div>
                      <h3 className="text-xl font-semibold capitalize">
                        {selectedPatient.name}
                      </h3>
                      <p className="text-gray-600">{selectedPatient.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-gray-500" />
                      <span>{selectedPatient.phone}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-gray-500" />
                      <span>{selectedPatient.email}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <User size={18} className="text-gray-500" />
                      <span className="capitalize">
                        {selectedPatient.gender}
                      </span>
                    </div>

                    {!isNaN(Date.parse(selectedPatient.dob)) && (
                      <div className="flex items-center gap-3">
                        <CalendarDays size={18} className="text-gray-500" />
                        <span>
                          {calculateAge(selectedPatient.dob)} years old
                        </span>
                      </div>
                    )}

                    {selectedPatient.address && (
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-gray-500 mt-1" />
                        <div>
                          <p>{selectedPatient.address.line1}</p>
                          {selectedPatient.address.line2 && (
                            <p>{selectedPatient.address.line2}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-gray-500" />
                      <span>
                        Joined: {formatDate(selectedPatient.joinedDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Appointment Statistics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary">
                    Appointment Statistics
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays size={20} className="text-blue-600" />
                        <span className="font-semibold text-blue-600">
                          Total
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {selectedPatient.totalAppointments}
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={20} className="text-green-600" />
                        <span className="font-semibold text-green-600">
                          Completed
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {selectedPatient.completedAppointments}
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={20} className="text-yellow-600" />
                        <span className="font-semibold text-yellow-600">
                          Pending
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-700">
                        {selectedPatient.pendingAppointments}
                      </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle size={20} className="text-red-600" />
                        <span className="font-semibold text-red-600">
                          Cancelled
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-red-700">
                        {selectedPatient.cancelledAppointments}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={20} className="text-gray-600" />
                      <span className="font-semibold text-gray-600">
                        Total Amount
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-700">
                      {currencySymbol}
                      {selectedPatient.totalAmount}
                    </p>
                  </div>

                  {selectedPatient.latestAppointment && (
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <h5 className="font-semibold text-primary mb-2">
                        Latest Appointment
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {slotDateFormat(
                            selectedPatient.latestAppointment.date
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {selectedPatient.latestAppointment.time}
                        </p>
                        <p>
                          <span className="font-medium">Doctor:</span>{" "}
                          {selectedPatient.latestAppointment.doctorName}
                        </p>
                        <p>
                          <span className="font-medium">Amount:</span>{" "}
                          {currencySymbol}
                          {selectedPatient.latestAppointment.amount}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Status:</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(
                              selectedPatient.latestAppointment.status
                            )}`}
                          >
                            {getStatusIcon(
                              selectedPatient.latestAppointment.status
                            )}
                            {selectedPatient.latestAppointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
