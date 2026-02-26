import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { createPortal } from "react-dom";
import PaymentMethodModal from "./PaymentMethodModal";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaUserMd,
  FaShieldAlt,
  FaCheckCircle,
  FaTimes,
  FaFileMedical,
  FaExclamationTriangle,
} from "react-icons/fa";

const AppointmentForm = ({
  isOpen,
  onClose,
  docInfo,
  selectedDate,
  selectedTime,
  onSuccess,
}) => {
  const { token, userData, backendUrl } = useContext(AppContext);

  const [formData, setFormData] = useState({
    reasonForVisit: "",
    sessionType: "Online",
    communicationMethod: "Google Meet",
    briefNotes: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    prescriptionFile: [],
    consentGiven: false,
    chatSummary: "", // Added chatSummary field
  });

  const [loading, setLoading] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tempReservationId, setTempReservationId] = useState(null);
  const [appointmentFormData, setAppointmentFormData] = useState(null);

  const reasonsForVisit = [
    "Anxiety",
    "Depression",
    "Relationship Issues",
    "Stress Management",
    "Trauma/PTSD",
    "Other",
  ];

  const communicationMethods = ["Google Meet", "Phone Call"];

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  // 🔹 Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    // Check file types
    const hasPDF = selectedFiles.some((f) => f.type === "application/pdf");
    const hasImage = selectedFiles.some((f) => f.type.startsWith("image/"));

    if (hasPDF && hasImage) {
      setMessage("You cannot upload both PDF and Images. Please choose one type.");
      setFiles([]);
      return;
    }

    if (hasPDF) {
      if (selectedFiles.length > 1) {
        setMessage("Only one PDF file is allowed per appointment.");
        setFiles([]);
        return;
      }
      if (selectedFiles[0].type !== "application/pdf") {
        // Should be caught by hasPDF logic, but double check
      }
    }

    // Validate types for all files
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    const invalidFile = selectedFiles.find(f => !validTypes.includes(f.type));
    if (invalidFile) {
      setMessage("Only PDF or image files are allowed.");
      setFiles([]);
      return;
    }

    setFiles(selectedFiles);
    setMessage("");
  };

  const handlePaymentMethodSelected = async (paymentMethod, appointmentData) => {
    if (paymentMethod === "credits") {
      await handleCreditsPayment(appointmentData);
    } else if (paymentMethod === "razorpay") {
      await handleRazorpayPayment(tempReservationId);
    }
  };

  const handleCreditsPayment = async (appointmentData) => {
    try {
      const formToSend = new FormData();
      
      // Add all appointment data
      Object.keys(appointmentData).forEach(key => {
        if (key === "emergencyContact") {
          formToSend.append("emergencyContact[name]", appointmentData.emergencyContact.name);
          formToSend.append("emergencyContact[phone]", appointmentData.emergencyContact.phone);
          formToSend.append("emergencyContact[relationship]", appointmentData.emergencyContact.relationship);
        } else if (key === "uploadedReports" && files.length > 0) {
          files.forEach((file) => {
            formToSend.append("file", file);
          });
        } else {
          formToSend.append(key, appointmentData[key]);
        }
      });

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment-credits`,
        formToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Credits payment error:", error);
      toast.error(error.response?.data?.message || "Failed to book appointment with credits");
    }
  };

  const handleRazorpayPayment = async (reservationId) => {
    try {
      const paymentResponse = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        { tempReservationId: reservationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (paymentResponse.data.success) {
        // Initialize Razorpay payment
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: paymentResponse.data.order.amount,
          currency: paymentResponse.data.order.currency,
          name: "Appointment Payment",
          description: "Appointment Payment",
          order_id: paymentResponse.data.order.id,
          receipt: paymentResponse.data.order.receipt,
          handler: async (response) => {
            try {
              const verifyResponse = await axios.post(
                `${backendUrl}/api/user/verify-razorpay`,
                response,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
              if (verifyResponse.data.success) {
                toast.success(verifyResponse.data.message);
                onSuccess();
              }
            } catch (error) {
              console.log(error);
              toast.error(
                error.response?.data?.message ||
                "Payment verification failed",
              );
            }
          },
          modal: {
            ondismiss: function () {
              toast.info("Payment cancelled");
              // Clean up the temporary reservation on payment cancellation
              axios
                .post(
                  `${backendUrl}/api/user/cancel-payment`,
                  { tempReservationId: reservationId },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                )
                .catch((error) => {
                  console.log("Error cleaning up reservation:", error);
                });
            },
          },
          prefill: {
            name: userData?.name || "Patient Name",
            email: userData?.email || "patient@example.com",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          toast.error("Payment failed");
          // Clean up the temporary reservation on payment failure
          axios
            .post(
              `${backendUrl}/api/user/cancel-payment`,
              { tempReservationId: reservationId },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )
            .catch((error) => {
              console.log("Error cleaning up reservation:", error);
            });
        });
        rzp.open();
      }
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.consentGiven) {
      toast.error(
        "Please agree to the cancellation policy and consent to telehealth",
      );
      return;
    }

    if (!formData.reasonForVisit) {
      toast.error("Please select a reason for visit");
      return;
    }

    if (formData.sessionType === "Online" && !formData.communicationMethod) {
      toast.error("Please select a communication method for online sessions");
      return;
    }

    setLoading(true);

    try {
      const date = selectedDate;
      let day = date.getDate().toString().padStart(2, "0");
      let month = (date.getMonth() + 1).toString().padStart(2, "0");
      let year = date.getFullYear();
      const slotDate = day + "/" + month + "/" + year;

      const userAssessments = localStorage.getItem("userAssessments")
        ? JSON.parse(localStorage.getItem("userAssessments"))
        : null;

      const summaryData = await axios.post(
        `${backendUrl}/api/chat/chat-summary`,
        { userAssessments },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Create appointment data for later use
      const appointmentData = {
        docId: docInfo._id,
        slotDate: slotDate,
        slotTime: selectedTime,
        reasonForVisit: formData.reasonForVisit === "Other"
          ? otherReason
          : formData.reasonForVisit,
        sessionType: formData.sessionType,
        communicationMethod: formData.communicationMethod,
        briefNotes: formData.briefNotes,
        consentGiven: formData.consentGiven,
        chatSummary: summaryData.data.summary || "No summary available",
        emergencyContact: formData.emergencyContact,
        uploadedReports: files,
      };

      // First create a temporary reservation
      const formToSend = new FormData();
      formToSend.append("docId", docInfo._id);
      formToSend.append("slotDate", slotDate);
      formToSend.append("slotTime", selectedTime);
      formToSend.append(
        "reasonForVisit",
        formData.reasonForVisit === "Other"
          ? otherReason
          : formData.reasonForVisit,
      );
      formToSend.append("sessionType", formData.sessionType);

      if (formData.sessionType === "Online") {
        formToSend.append("communicationMethod", formData.communicationMethod);
      }

      formToSend.append("briefNotes", formData.briefNotes);
      formToSend.append("consentGiven", formData.consentGiven);
      formToSend.append(
        "chatSummary",
        summaryData.data.summary || "No summary available",
      );

      formToSend.append(
        "emergencyContact[name]",
        formData.emergencyContact.name,
      );
      formToSend.append(
        "emergencyContact[phone]",
        formData.emergencyContact.phone,
      );
      formToSend.append(
        "emergencyContact[relationship]",
        formData.emergencyContact.relationship,
      );

      // Append files
      if (files && files.length > 0) {
        files.forEach((file) => {
          formToSend.append("file", file);
        });
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        formToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);
        setTempReservationId(data.tempReservationId);
        setAppointmentFormData(appointmentData);
        setShowPaymentModal(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      >
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
                  Please provide additional information for your appointment
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Appointment Summary */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <FaUserMd className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {docInfo.name}
                  </h3>
                  <p className="text-gray-600">{docInfo.speciality}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-purple-600" />
                  <span className="text-gray-700">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-purple-600" />
                  <span className="text-gray-700">{selectedTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 overflow-y-auto flex-1"
          >
            {/* Personal Details (Auto-filled) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-purple-600" />
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userData?.name || ""}
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
                    value={userData?.email || ""}
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
                    value={userData?.phone || "Not provided"}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <input
                    type="text"
                    value={userData?.gender || "Not selected"}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Reason for Visit <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reasonForVisit}
                onChange={(e) =>
                  handleInputChange("reasonForVisit", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select a reason</option>
                {reasonsForVisit.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>

              {formData.reasonForVisit === "Other" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify
                  </label>
                  <input
                    type="text"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please describe your reason for visit"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Session Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="sessionType"
                    value="Online"
                    checked={formData.sessionType === "Online"}
                    onChange={(e) =>
                      handleInputChange("sessionType", e.target.value)
                    }
                    className="mr-3 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-3">
                    <FaVideo className="text-purple-600 text-xl" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Online (Video Call)
                      </div>
                      <div className="text-sm text-gray-500">
                        Secure video consultation
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="sessionType"
                    value="In-Person"
                    checked={formData.sessionType === "In-Person"}
                    onChange={(e) =>
                      handleInputChange("sessionType", e.target.value)
                    }
                    className="mr-3 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-3">
                    <FaUserMd className="text-purple-600 text-xl" />
                    <div>
                      <div className="font-medium text-gray-900">In-Person</div>
                      <div className="text-sm text-gray-500">
                        Face-to-face consultation
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Communication Method (if Online) */}
            {formData.sessionType === "Online" && (
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Preferred Communication Method{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {communicationMethods.map((method) => (
                    <label
                      key={method}
                      className="flex items-center p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="communicationMethod"
                        value={method}
                        checked={formData.communicationMethod === method}
                        onChange={(e) =>
                          handleInputChange(
                            "communicationMethod",
                            e.target.value,
                          )
                        }
                        className="mr-3 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="font-medium text-gray-900">{method}</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Summary */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Previous Chat Summary
              </label>
              <textarea
                value={formData.chatSummary}
                onChange={(e) =>
                  handleInputChange("chatSummary", e.target.value)
                }
                placeholder="Chat summary will appear here if available"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-gray-50"
                readOnly
              />
            </div>

            {/* Brief Notes */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Brief Notes (Optional)
              </label>
              <textarea
                value={formData.briefNotes}
                onChange={(e) =>
                  handleInputChange("briefNotes", e.target.value)
                }
                placeholder="Anything you'd like the therapist to know beforehand?"
                maxLength={200}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="text-sm text-gray-500 mt-2 text-right">
                {formData.briefNotes.length}/200 characters
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Emergency Contact (Optional but recommended)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) =>
                      handleInputChange("emergencyContact.name", e.target.value)
                    }
                    placeholder="Emergency contact name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContact.phone",
                        e.target.value,
                      )
                    }
                    placeholder="Emergency contact phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContact.relationship",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., Spouse, Parent"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            {/* Upload Prescription */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Upload Your Prescription (Optional)
              </label>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <input
                  type="file"
                  // accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                  // onChange={(e) =>
                  //   handleInputChange("prescriptionFile", e.target.files[0])
                  // }
                  accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-xl cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  multiple
                />
                {files && files.length > 0 && (
                  <div className="flex flex-col gap-1 text-sm text-gray-600">
                    {files.map((f, i) => (
                      <div key={i}>
                        <FaFileMedical className="inline text-purple-600 mr-1" />
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Accepted formats: Images (JPG, PNG) or PDF. Max size: 10MB.
                Single PDF or Multiple Images allowed.
              </p>
            </div>
            {/* Consent */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consentGiven}
                  onChange={(e) =>
                    handleInputChange("consentGiven", e.target.checked)
                  }
                  className="mt-1 text-purple-600 focus:ring-purple-500"
                  required
                />
                <div className="text-sm text-gray-700">
                  <span className="font-medium">I agree to the </span>
                  <a
                    href="/cancellation-policy"
                    target="_blank"
                    className="text-purple-600 hover:underline font-medium"
                  >
                    cancellation policy
                  </a>
                  <span className="font-medium">
                    {" "}
                    and consent to telehealth if applicable.
                  </span>
                  <span className="text-red-500"> *</span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.consentGiven}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${loading || !formData.consentGiven
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg"
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Confirm Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentMethodSelected={handlePaymentMethodSelected}
        appointmentData={appointmentFormData}
        docInfo={docInfo}
        backendUrl={backendUrl}
        token={token}
      />
    </>
  );
};

export default AppointmentForm;