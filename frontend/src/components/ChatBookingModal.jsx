import React, { useState, useEffect } from 'react';
import { X, Clock, CreditCard, Wallet, Coins, ChevronRight, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ChatBookingModal = ({ isOpen, onClose, doctorId, doctorPricing, onBookingSuccess }) => {
  const [step, setStep] = useState(1); // 1: Duration, 2: Payment Method, 3: Confirmation
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [paymentMethod, setPaymentMethod] = useState('credits'); // 'credits', 'razorpay', 'mixed'
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  const token = localStorage.getItem('token');

  // Calculate costs
  const estimatedCost = Math.max(
    (doctorPricing?.minimumCharge || 0) * 100,
    (doctorPricing?.pricePerMinute || 0) * selectedMinutes * 100
  ); // in paise

  const creditsNeeded = estimatedCost / 100;
  const creditsAvailable = userCredits;
  const creditsShortfall = Math.max(0, creditsNeeded - creditsAvailable);
  const razorpayAmount = creditsShortfall * 100; // in paise

  useEffect(() => {
    if (isOpen) {
      fetchUserCredits();
      // Reset state
      setStep(1);
      setSelectedMinutes(15);
      setPaymentMethod('credits');
      setError(null);
    }
  }, [isOpen]);

  const fetchUserCredits = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/credits/balance`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserCredits(response.data.credits || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleBookSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine actual payment method
      let actualPaymentMethod = paymentMethod;
      if (paymentMethod === 'credits' && creditsAvailable < creditsNeeded) {
        actualPaymentMethod = 'mixed';
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/paid-chat/book`,
        {
          doctorId,
          estimatedMinutes: selectedMinutes,
          paymentMethod: actualPaymentMethod
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setBookingData(response.data);

        // Handle Razorpay payment if needed
        if (response.data.razorpayOrder) {
          await handleRazorpayPayment(response.data.razorpayOrder, response.data.session.sessionId);
        } else {
          // Credit-only payment, session starts immediately
          await startSession(response.data.session.sessionId);
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (order, sessionId) => {
    // Razorpay is already loaded via script tag in index.html
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'MoodMantra Chat',
      description: `Chat Session - ${selectedMinutes} minutes`,
      order_id: order.id,
      handler: async (response) => {
        try {
          const verifyRes = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/paid-chat/verify-payment`,
            {
              sessionId,
              razorpayOrderId: order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (verifyRes.data.success) {
            onBookingSuccess(verifyRes.data.session);
            onClose();
          }
        } catch (error) {
          setError('Payment verification failed');
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#9333ea'
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const startSession = async (sessionId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/paid-chat/start`,
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onBookingSuccess(response.data.session);
        onClose();
      }
    } catch (error) {
      setError('Failed to start session');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Book Chat Session</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Step 1: Select Duration */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Duration
              </label>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[10, 15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setSelectedMinutes(mins)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedMinutes === mins
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold">{mins} min</div>
                    <div className="text-xs text-gray-500">
                      ₹{(doctorPricing?.pricePerMinute || 0) * mins}
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Rate per minute</span>
                  <span className="font-medium">₹{doctorPricing?.pricePerMinute || 0}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{selectedMinutes} minutes</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">Total Cost</span>
                    <span className="font-bold text-xl text-purple-600">
                      ₹{creditsNeeded.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Payment Method
              </label>

              <div className="space-y-3 mb-6">
                {/* Credits Option */}
                <button
                  onClick={() => setPaymentMethod('credits')}
                  disabled={creditsAvailable < creditsNeeded}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === 'credits'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  } ${creditsAvailable < creditsNeeded ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Coins className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Use Credits</div>
                        <div className="text-sm text-gray-500">
                          Available: ₹{creditsAvailable.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'credits' && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  {creditsAvailable < creditsNeeded && (
                    <div className="mt-2 text-sm text-red-600">
                      Insufficient credits (Need ₹{creditsNeeded.toFixed(2)})
                    </div>
                  )}
                </button>

                {/* Razorpay Option */}
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Pay with Razorpay</div>
                        <div className="text-sm text-gray-500">
                          Card, UPI, Net Banking
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'razorpay' && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </button>

                {/* Mixed Payment (Credits + Razorpay) */}
                {creditsAvailable > 0 && creditsAvailable < creditsNeeded && (
                  <button
                    onClick={() => setPaymentMethod('mixed')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === 'mixed'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">Mixed Payment</div>
                          <div className="text-sm text-gray-500">
                            Credits ₹{creditsAvailable.toFixed(2)} + Razorpay ₹{creditsShortfall.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      {paymentMethod === 'mixed' && (
                        <Check className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleBookSession}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{(paymentMethod === 'credits' ? 0 : paymentMethod === 'mixed' ? creditsShortfall : creditsNeeded).toFixed(2)}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBookingModal;
