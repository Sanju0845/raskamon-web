import React, { useState, useEffect } from 'react';
import { X, Coins, CreditCard, Wallet } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AppointmentBookingModal = ({ isOpen, onClose, doctor, slotDate, slotTime, formData, otherReason, onSuccess }) => {
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const token = localStorage.getItem('token');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch user credits
  useEffect(() => {
    if (isOpen) {
      fetchUserCredits();
    }
  }, [isOpen]);

  const fetchUserCredits = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserCredits(response.data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  // Book with credits
  const handleCreditBooking = async () => {
    setLoading(true);
    try {
      const formToSend = new FormData();
      formToSend.append('docId', doctor._id);
      formToSend.append('slotDate', slotDate);
      formToSend.append('slotTime', slotTime);
      formToSend.append('paymentMode', 'credits');
      
      // Add form data
      const reason = formData.reasonForVisit === 'Other' ? otherReason : formData.reasonForVisit;
      formToSend.append('reasonForVisit', reason);
      formToSend.append('sessionType', formData.sessionType);
      formToSend.append('communicationMethod', formData.communicationMethod);
      formToSend.append('briefNotes', formData.briefNotes);
      formToSend.append('emergencyContact[name]', formData.emergencyContact.name);
      formToSend.append('emergencyContact[phone]', formData.emergencyContact.phone);
      formToSend.append('emergencyContact[relationship]', formData.emergencyContact.relationship);
      formToSend.append('consentGiven', formData.consentGiven);
      
      // Append files if any
      if (formData.prescriptionFile && formData.prescriptionFile.length > 0) {
        formData.prescriptionFile.forEach((file) => {
          formToSend.append('file', file);
        });
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment-credits`,
        formToSend,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (data.success) {
        toast.success('Appointment booked successfully using credits!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Credit booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Book with Razorpay
  const handleRazorpayBooking = async () => {
    setLoading(true);
    try {
      // First, create appointment with temp reservation including all form data
      const formToSend = new FormData();
      formToSend.append('docId', doctor._id);
      formToSend.append('slotDate', slotDate);
      formToSend.append('slotTime', slotTime);
      
      // Add form data
      const reason = formData?.reasonForVisit === 'Other' ? otherReason : formData?.reasonForVisit;
      formToSend.append('reasonForVisit', reason);
      formToSend.append('sessionType', formData?.sessionType);
      formToSend.append('communicationMethod', formData?.communicationMethod);
      formToSend.append('briefNotes', formData?.briefNotes);
      formToSend.append('emergencyContact[name]', formData?.emergencyContact?.name);
      formToSend.append('emergencyContact[phone]', formData?.emergencyContact?.phone);
      formToSend.append('emergencyContact[relationship]', formData?.emergencyContact?.relationship);
      formToSend.append('consentGiven', formData?.consentGiven);
      
      // Append files if any
      if (formData?.prescriptionFile && formData.prescriptionFile.length > 0) {
        formData.prescriptionFile.forEach((file) => {
          formToSend.append('file', file);
        });
      }

      // Create reservation with full data
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        formToSend,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (!data.success) {
        toast.error(data.message || 'Failed to create reservation');
        setLoading(false);
        return;
      }

      // Initialize Razorpay payment
      const paymentResponse = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        { tempReservationId: data.tempReservationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!paymentResponse.data.success) {
        toast.error('Failed to initialize payment');
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentResponse.data.order.amount,
        currency: paymentResponse.data.order.currency,
        name: "Appointment Payment",
        description: `Appointment with ${doctor.name}`,
        order_id: paymentResponse.data.order.id,
        receipt: paymentResponse.data.order.receipt,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${backendUrl}/api/user/verify-razorpay`,
              response,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (verifyResponse.data.success) {
              toast.success('Payment successful! Appointment booked.');
              onSuccess();
              onClose();
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled');
            setLoading(false);
          },
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || ''
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed');
        setLoading(false);
      });
      rzp.open();

    } catch (error) {
      console.error('Razorpay booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasEnoughCredits = userCredits >= doctor.fees;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Complete Booking</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            {doctor.name} • {slotDate} • {slotTime}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Your Credits Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Your Credits</p>
                  <p className="text-2xl font-bold text-gray-900">{userCredits}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Appointment Fee</p>
                <p className="text-2xl font-bold text-purple-600">₹{doctor.fees}</p>
              </div>
            </div>
          </div>

          {/* Booking Options */}
          <div className="space-y-3">
            <p className="text-gray-700 font-semibold text-center">Choose Payment Method</p>
            
            {/* Credits Option */}
            <button
              onClick={handleCreditBooking}
              disabled={!hasEnoughCredits || loading}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                hasEnoughCredits
                  ? 'border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  hasEnoughCredits ? 'bg-purple-500' : 'bg-gray-400'
                }`}>
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Pay with Credits</p>
                  <p className="text-sm text-gray-600">
                    {hasEnoughCredits 
                      ? `Use ${doctor.fees} credits` 
                      : `Need ${doctor.fees - userCredits} more credits`
                    }
                  </p>
                </div>
              </div>
              {hasEnoughCredits && <span className="text-purple-600 font-semibold">Available</span>}
            </button>

            {/* Razorpay Option */}
            <button
              onClick={handleRazorpayBooking}
              disabled={loading}
              className="w-full p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Pay with UPI/Card</p>
                  <p className="text-sm text-gray-600">Razorpay • ₹{doctor.fees}</p>
                </div>
              </div>
              <span className="text-blue-600 font-semibold">Pay Now</span>
            </button>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-gray-500">
            <p>1 Credit = 1 Rupee</p>
            <p className="mt-1">Secure payment • Instant confirmation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingModal;
