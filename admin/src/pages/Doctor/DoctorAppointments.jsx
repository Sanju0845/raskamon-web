import { AppContext } from "@/context/AppContext";
import { DoctorContext } from "@/context/DoctorContext";
import React, { useContext, useEffect, useState } from "react";
import {
  Check,
  X,
  User,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Video,
  Phone,
  MapPin,
  MessageSquare,
  ReceiptText,
  Pill,
  Upload,
  Loader2,
} from "lucide-react";
import ChatSummaryRenderer from "@/components/ChatSummaryRenderer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProgressBar from "@/components/ProgressBar";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currencySymbol } =
    useContext(AppContext);
  const [showImage, setShowImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const prescriptionInputRef = React.useRef(null);

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

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const progressInterval = simulateProgress();

      await getAppointments();

      setLoadingProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  const handleMedicationChange = (index, value) => {
    setSelectedAppointment((prev) => {
      const updatedReports = [...(prev?.uploadedReports || [])];
      updatedReports[index] = { ...updatedReports[index], medication: value };
      return { ...prev, uploadedReports: updatedReports };
    });
  };
  const handleSubmit = async () => {
    try {
      const payload = {
        appointmentId: selectedAppointment._id, // Appointment document ID
        docId: selectedAppointment.docId, // Doctor's ID
        userId: selectedAppointment.userId, // Patient/User ID
        uploadedReports: selectedAppointment.uploadedReports, // Updated reports array
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/update-medication`,
        payload,
        // {
        //   withCredentials: true,
        // },
      );
      alert("Medication updated successfully!");
    } catch (error) {
      console.error(" Error updating medication:", error);
      alert("Failed to update medication. Please try again.");
    }
  };

  // Handle prescription file upload
  const handlePrescriptionUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedReports = [...(selectedAppointment.uploadedReports || [])];

      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        // Upload to Cloudinary via backend
        const uploadRes = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload/prescription`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              dtoken: dToken,
            },
          },
        );

        if (uploadRes.data.success) {
          uploadedReports.push({
            filename: file.name,
            fileUrl: uploadRes.data.data.imageUrl,
            fileType: file.type,
            medication: "",
            uploadedAt: new Date().toISOString(),
          });
        }
      }

      // Update the appointment with new prescription
      const payload = {
        appointmentId: selectedAppointment._id,
        docId: selectedAppointment.docId,
        userId: selectedAppointment.userId,
        uploadedReports: uploadedReports,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/update-medication`,
        payload,
      );

      // Update local state
      setSelectedAppointment((prev) => ({
        ...prev,
        uploadedReports: uploadedReports,
      }));

      // Refresh appointments list
      await getAppointments();
      alert("Prescription uploaded successfully!");
    } catch (error) {
      console.error("Error uploading prescription:", error);
      alert("Failed to upload prescription. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (prescriptionInputRef.current) {
        prescriptionInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (dToken) {
      fetchAppointments();
    }
  }, [dToken]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Profile Image Popup view */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            draggable="false"
            className="max-w-[90vw] max-h-[90vh] object-cover rounded-2xl border-4 border-white shadow-2xl select-none motion-preset-expand motion-duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          All Appointments
        </h1>
        <p className="text-gray-600">
          Manage and track all your patient appointments
        </p>
      </div>

      {/* Appointments Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px] flex-col p-8">
            <ProgressBar progress={loadingProgress} />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px] flex-col p-8">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Appointments Found
              </h3>
              <p className="text-gray-500">
                You don't have any appointments scheduled at the moment.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Header */}
            <div className="hidden lg:grid grid-cols-[0.5fr_2fr_1fr_1.5fr_2fr_1fr_1.5fr] gap-4 py-4 px-6 border-b bg-gray-50 sticky top-0 z-10">
              <p className="font-semibold text-gray-700">#</p>
              <p className="font-semibold text-gray-700">Patient</p>
              <p className="font-semibold text-gray-700">Age</p>
              <p className="font-semibold text-gray-700">Payment</p>
              <p className="font-semibold text-gray-700">Date & Time</p>
              <p className="font-semibold text-gray-700">Fees</p>
              <p className="font-semibold text-gray-700">Actions</p>
            </div>

            {/* Appointments List */}
            <div className="max-h-[70vh] overflow-y-auto doctorlist-scrollbar">
              {appointments
                .slice(0)
                .reverse()
                .map((item, index) => (
                  <motion.div
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {/* Desktop Layout */}
                    <div className="hidden lg:grid grid-cols-[0.5fr_2fr_1fr_1.5fr_2fr_1fr_1.5fr] gap-4 items-center py-4 px-6">
                      <p className="text-gray-600 font-medium">{index + 1}</p>

                      <div className="flex items-center gap-3">
                        <img
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          draggable="false"
                          src={item.userData.image}
                          alt="user image"
                          onClick={() => setSelectedImage(item.userData.image)}
                        />
                        <div>
                          <p className="font-medium text-gray-800 capitalize">
                            {item.userData.name}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600">
                        {!isNaN(Date.parse(item.userData.dob))
                          ? `${calculateAge(item.userData.dob)} years`
                          : "N/A"}
                      </p>

                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.payment
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {item.payment ? "Paid" : "Not Paid"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {slotDateFormat(item.slotDate)}
                        </span>
                        <Clock className="w-4 h-4 text-gray-400 ml-2" />
                        <span className="text-gray-600">{item.slotTime}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-800">
                          {currencySymbol}
                          {item.amount}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.cancelled ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        ) : item.isCompleted ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <>
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() => cancelAppointment(item._id)}
                                    className="p-2 rounded-lg text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                  >
                                    <X size={16} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white px-2 py-1 text-xs">
                                  Cancel Appointment
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() =>
                                      completeAppointment(item._id)
                                    }
                                    className="p-2 rounded-lg text-green-500 border border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                  >
                                    <Check size={16} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white px-2 py-1 text-xs">
                                  Mark as Completed
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() => {
                                      setSelectedAppointment(item);
                                      setShowDetailsModal(true);
                                    }}
                                    className="p-2 rounded-lg text-blue-500 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                  >
                                    <FileText size={16} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white px-2 py-1 text-xs">
                                  View Appointment Details
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          draggable="false"
                          src={item.userData.image}
                          alt="user image"
                          onClick={() => setSelectedImage(item.userData.image)}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 capitalize mb-1">
                            {item.userData.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Age:{" "}
                              {!isNaN(Date.parse(item.userData.dob))
                                ? `${calculateAge(item.userData.dob)} years`
                                : "N/A"}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${item.payment
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {item.payment ? "Paid" : "Not Paid"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {slotDateFormat(item.slotDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{item.slotTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-800">
                            {currencySymbol}
                            {item.amount}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.cancelled ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Cancelled
                            </span>
                          ) : item.isCompleted ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <>
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <button
                                      onClick={() =>
                                        cancelAppointment(item._id)
                                      }
                                      className="p-2 rounded-lg text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                    >
                                      <X size={16} />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 text-white px-2 py-1 text-xs">
                                    Cancel
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <button
                                      onClick={() =>
                                        completeAppointment(item._id)
                                      }
                                      className="p-2 rounded-lg text-green-500 border border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                    >
                                      <Check size={16} />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 text-white px-2 py-1 text-xs">
                                    Complete
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <button
                                      onClick={() => {
                                        setSelectedAppointment(item);
                                        setShowDetailsModal(true);
                                      }}
                                      className="p-2 rounded-lg text-blue-500 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                    >
                                      <FileText size={16} />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 text-white px-2 py-1 text-xs">
                                    Details
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex-shrink-0 bg-white rounded-t-3xl p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Appointment Details
                    </h2>
                    <p className="text-gray-600">
                      Complete information about this appointment
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="text-blue-600" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={selectedAppointment.userData.name || ""}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={selectedAppointment.userData.email || ""}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={
                          selectedAppointment.userData.phone || "Not provided"
                        }
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="text"
                        value={
                          !isNaN(Date.parse(selectedAppointment.userData.dob))
                            ? `${calculateAge(
                              selectedAppointment.userData.dob,
                            )} years`
                            : "N/A"
                        }
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="text-green-600" />
                    Appointment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="text"
                        value={slotDateFormat(selectedAppointment.slotDate)}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="text"
                        value={selectedAppointment.slotTime}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Status
                      </label>
                      <input
                        type="text"
                        value={
                          selectedAppointment.payment ? "Paid" : "Not Paid"
                        }
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <input
                        type="text"
                        value={`${currencySymbol}${selectedAppointment.amount}`}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                {selectedAppointment.reasonForVisit && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="text-purple-600" />
                      Appointment Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Visit
                        </label>
                        <input
                          type="text"
                          value={selectedAppointment.reasonForVisit}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Type
                        </label>
                        <div className="flex items-center gap-2">
                          {selectedAppointment.sessionType === "Online" ? (
                            <Video className="text-blue-600" />
                          ) : (
                            <MapPin className="text-green-600" />
                          )}
                          <input
                            type="text"
                            value={selectedAppointment.sessionType}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                          />
                        </div>
                      </div>

                      {selectedAppointment.sessionType === "Online" &&
                        selectedAppointment.communicationMethod && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Communication Method
                            </label>
                            <input
                              type="text"
                              value={selectedAppointment.communicationMethod}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                            />
                          </div>
                        )}

                      {selectedAppointment.briefNotes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brief Notes
                          </label>
                          <textarea
                            value={selectedAppointment.briefNotes}
                            disabled
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {selectedAppointment.emergencyContact &&
                  selectedAppointment.emergencyContact.name && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Phone className="text-red-600" />
                        Emergency Contact
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={selectedAppointment.emergencyContact.name}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={selectedAppointment.emergencyContact.phone}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship
                          </label>
                          <input
                            type="text"
                            value={
                              selectedAppointment.emergencyContact.relationship
                            }
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                {/* Status Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Check className="text-blue-600" />
                    Status Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="flex items-center gap-2">
                        {selectedAppointment.cancelled ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        ) : selectedAppointment.isCompleted ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consent Given
                      </label>
                      <div className="flex items-center gap-2">
                        {selectedAppointment.consentGiven ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            No
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Summary */}
                {selectedAppointment.chatSummary && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="text-indigo-600" />
                      Chat Summary
                    </h3>
                    <ChatSummaryRenderer
                      summary={selectedAppointment.chatSummary}
                    />
                  </div>
                )}

                <>
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ReceiptText className="text-indigo-600" />
                        Prescription
                      </h3>
                      {/* Upload Prescription Button */}
                      <div>
                        <input
                          type="file"
                          ref={prescriptionInputRef}
                          onChange={handlePrescriptionUpload}
                          accept="image/*,.pdf"
                          multiple
                          className="hidden"
                          id="prescription-upload"
                        />
                        <button
                          onClick={() => prescriptionInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Upload Prescription
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {selectedAppointment.uploadedReports?.length > 0 ? selectedAppointment.uploadedReports.map(
                      (report, index) => (
                        <div key={report._id || index} className="">
                          <div className="relative w-full max-w-xs group overflow-hidden rounded-lg">
                            {report.fileType === "application/pdf" ||
                              report.filename?.endsWith(".pdf") ? (
                              <div className="flex flex-col items-center justify-center h-48 bg-gray-50 border border-gray-200 w-full">
                                <FileText className="w-12 h-12 text-red-500 mb-2" />
                                <p className="text-xs text-gray-600 font-medium px-2 text-center truncate w-full max-w-[200px]">
                                  {report.filename || "Prescription PDF"}
                                </p>
                              </div>
                            ) : (
                              <img
                                src={
                                  report.fileUrl?.startsWith("http")
                                    ? report.fileUrl
                                    : `${import.meta.env.VITE_BACKEND_URL}${report.fileUrl
                                    }`
                                }
                                alt={report.filename || "Prescription image"}
                                className="w-full h-auto object-cover min-h-[150px]"
                              />
                            )}

                            {/* Overlay Button */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 transition-opacity">
                              {report.fileType === "application/pdf" ||
                                report.filename?.endsWith(".pdf") ? (
                                <a
                                  href={
                                    report.fileUrl?.startsWith("http")
                                      ? report.fileUrl
                                      : `${import.meta.env.VITE_BACKEND_URL}${report.fileUrl
                                      }`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg"
                                >
                                  Download
                                </a>
                              ) : (
                                <button
                                  onClick={() =>
                                    setShowImage(
                                      report.fileUrl?.startsWith("http")
                                        ? report.fileUrl
                                        : `${import.meta.env.VITE_BACKEND_URL
                                        }${report.fileUrl}`,
                                    )
                                  }
                                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg"
                                >
                                  View
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 💊 Medication Section */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Pill className="text-indigo-600" />
                              Medication
                            </h3>
                            <textarea
                              id={`message-${index}`}
                              name={`message-${index}`}
                              value={report.medication || ""}
                              rows={4}
                              onChange={(e) =>
                                handleMedicationChange(index, e.target.value)
                              }
                              placeholder="Write your medication..."
                              className="w-full p-3 border-2 border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 transition-all bg-white"
                            />
                            <div className="flex w-full justify-end items-end">
                              <button
                                onClick={() => handleSubmit()}
                                className="w-full px-6 py-3 bg-blue-100 text-gray-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      ),
                    ) : (
                      <p className="text-gray-500 text-sm italic">No prescriptions uploaded yet. Click the button above to upload.</p>
                    )}
                  </div>

                  {/* 🖼 Modal Overlay for Viewing Image */}
                  {showImage && (
                    <div
                      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                      onClick={() => setShowImage(null)}
                    >
                      <div
                        className="relative rounded-xl shadow-lg p-4 max-w-3xl w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={showImage}
                          alt="Full Prescription"
                          className="rounded-lg w-full max-h-[80vh] object-contain"
                        />
                      </div>
                    </div>
                  )}
                </>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorAppointments;
