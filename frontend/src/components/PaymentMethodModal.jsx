import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaCoins, FaCreditCard, FaTimes, FaCheckCircle } from "react-icons/fa";

const PaymentMethodModal = ({
  isOpen,
  onClose,
  onPaymentMethodSelected,
  appointmentData,
  docInfo,
  backendUrl,
  token,
}) => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchCredits();
    }
  }, [isOpen]);

  const fetchCredits = async () => {
    try {
      setCreditsLoading(true);
      const response = await axios.get(`${backendUrl}/api/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCredits(response.data.credits);
    } catch (error) {
      console.error("Error fetching credits:", error);
      toast.error("Failed to fetch credits balance");
    } finally {
      setCreditsLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleConfirm = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (selectedMethod === "credits") {
      if (credits < docInfo.fees) {
        toast.error(`Insufficient credits. You have ${credits} credits but need ${docInfo.fees} credits.`);
        return;
      }
    }

    setLoading(true);
    try {
      await onPaymentMethodSelected(selectedMethod, appointmentData);
      // Only close if not using credits (credits will handle their own closing)
      if (selectedMethod !== "credits") {
        onClose();
      }
    } catch (error) {
      console.error("Payment processing error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white rounded-t-3xl p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Select Payment Method
                </h2>
                <p className="text-gray-600">
                  Choose how you'd like to pay for this appointment
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
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Consultation Fee</span>
                <span className="text-lg font-bold text-purple-600">{docInfo.fees} credits</span>
              </div>
              <div className="text-sm text-gray-500">
                Dr. {docInfo.name} - {docInfo.speciality}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="p-6 space-y-4 flex-1">
            {/* Credits Option */}
            <div
              className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                selectedMethod === "credits"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
              onClick={() => handlePaymentMethodSelect("credits")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === "credits" ? "bg-purple-500" : "bg-gray-100"
                  }`}>
                    <FaCoins className={`text-xl ${selectedMethod === "credits" ? "text-white" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Pay with Credits</div>
                    <div className="text-sm text-gray-500">
                      {creditsLoading ? (
                        <span className="animate-pulse">Loading balance...</span>
                      ) : (
                        <>
                          Available: <span className="font-medium text-purple-600">{credits} credits</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "credits" ? "border-purple-500 bg-purple-500" : "border-gray-300"
                }`}>
                  {selectedMethod === "credits" && <FaCheckCircle className="text-white text-sm" />}
                </div>
              </div>
              
              {!creditsLoading && credits < docInfo.fees && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    Insufficient credits. You need {docInfo.fees - credits} more credits.
                  </p>
                </div>
              )}
            </div>

            {/* Razorpay Option */}
            <div
              className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                selectedMethod === "razorpay"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
              onClick={() => handlePaymentMethodSelect("razorpay")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === "razorpay" ? "bg-purple-500" : "bg-gray-100"
                  }`}>
                    <FaCreditCard className={`text-xl ${selectedMethod === "razorpay" ? "text-white" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Pay with Razorpay</div>
                    <div className="text-sm text-gray-500">Secure online payment via card, UPI, etc.</div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "razorpay" ? "border-purple-500 bg-purple-500" : "border-gray-300"
                }`}>
                  {selectedMethod === "razorpay" && <FaCheckCircle className="text-white text-sm" />}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 p-6 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || !selectedMethod || (selectedMethod === "credits" && credits < docInfo.fees)}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                loading || !selectedMethod || (selectedMethod === "credits" && credits < docInfo.fees)
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentMethodModal;
