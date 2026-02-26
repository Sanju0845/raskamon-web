import React, { useState, useEffect } from 'react';
import { X, Coins, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreditsPurchaseModal = ({ isOpen, onClose, onPurchaseSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingAmount, setLoadingAmount] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);

  // Quick purchase amounts
  const quickAmounts = [
    { amount: 100, description: 'Starter' },
    { amount: 500, description: 'Popular' },
    { amount: 1000, description: 'Best Value' }
  ];

  // Function to verify payment with retry mechanism
  const verifyPaymentWithRetry = async (paymentData, retries = 3) => {
    const token = localStorage.getItem('token');
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Payment verification attempt ${attempt}/${retries}`);
        
        const verifyResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/credits/verify-payment`,
          paymentData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (verifyResponse.data.success) {
          toast.success('Credits added successfully!');
          onPurchaseSuccess();
          setPendingPayment(null);
          return true;
        }
      } catch (error) {
        console.error(`Payment verification attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          // Final attempt failed
          if (error.response?.status === 400 && error.response?.data?.message?.includes('already processed')) {
            toast.success('Credits were already added to your account!');
            onPurchaseSuccess();
            setPendingPayment(null);
            return true;
          } else {
            toast.error('Payment verification failed. Credits will be added shortly. Please check your balance after a few minutes.');
            // Don't set pendingPayment to null here - webhook should handle it
          }
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }
    return false;
  };

  const handlePurchase = async (amount) => {
    setLoadingAmount(amount);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/credits/purchase-order`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "MoodMantra Credits",
        description: `${amount} Credits`,
        order_id: order.id,
        receipt: order.receipt,
        handler: async (response) => {
          setVerifyingPayment(true);
          await verifyPaymentWithRetry(response);
          setVerifyingPayment(false);
          setLoading(false);
          setLoadingAmount(null);
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled. If you completed the payment, credits will be added automatically.");
            setLoading(false);
            setLoadingAmount(null);
            setVerifyingPayment(false);
          },
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || ''
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed. If you were charged, please contact support.");
        setLoading(false);
        setLoadingAmount(null);
        setVerifyingPayment(false);
      });
      rzp.open();

    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase failed. Please try again.');
      setLoading(false);
      setLoadingAmount(null);
    }
  };

  // Manual retry function for pending payments
  const handleRetryVerification = () => {
    if (pendingPayment) {
      setVerifyingPayment(true);
      verifyPaymentWithRetry(pendingPayment).then(() => {
        setVerifyingPayment(false);
      });
    }
  };

  // Check for pending payments from server
  const handleCheckPendingPayments = async () => {
    setVerifyingPayment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/credits/check-pending-payments`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.creditsAdded) {
          onPurchaseSuccess();
        }
      } else {
        toast.info(response.data.message || 'No pending payments found');
      }
    } catch (error) {
      console.error('Error checking pending payments:', error);
      toast.error('Failed to check pending payments');
    } finally {
      setVerifyingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Purchase Credits</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={verifyingPayment}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status */}
        {verifyingPayment && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-sm font-medium text-blue-800">Verifying payment...</p>
                <p className="text-xs text-blue-600">Please wait while we confirm your payment</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Payment Retry */}
        {pendingPayment && !verifyingPayment && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Payment verification pending</p>
                <p className="text-xs text-yellow-600">Click retry if your payment was successful</p>
              </div>
              <button
                onClick={handleRetryVerification}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Quick Purchase Blocks */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickAmounts.map((item) => (
            <button
              key={item.amount}
              onClick={() => handlePurchase(item.amount)}
              disabled={loading || verifyingPayment}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                loadingAmount === item.amount
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              } ${verifyingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loadingAmount === item.amount && (
                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className="text-center">
                <Coins className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">₹{item.amount}</div>
                <div className="text-sm text-gray-600">{item.amount} Credits</div>
                <div className="text-xs text-purple-600 mt-1">{item.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or Enter Custom Amount (₹)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₹</span>
              </div>
              <input
                type="number"
                placeholder="Enter amount"
                min="1"
                max="10000"
                className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value >= 1) {
                    handlePurchase(parseInt(e.target.value));
                  }
                }}
              />
            </div>
            <button
              onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                const amount = parseInt(input.value);
                if (amount >= 1) {
                  handlePurchase(amount);
                } else {
                  toast.error('Minimum amount is ₹1');
                }
              }}
              disabled={loading || verifyingPayment}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              Buy
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">1 Credit = 1 Rupee • Min: ₹1 • Max: ₹10,000</p>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-600 mb-4">
          <p>Credits can be used for consultations and premium features</p>
          <p className="mt-1">No hidden fees • Instant delivery • Valid for 1 year</p>
        </div>

        {/* Pending Payment Check */}
        <div className="text-center">
          <button
            onClick={handleCheckPendingPayments}
            disabled={verifyingPayment}
            className="text-sm text-purple-600 hover:text-purple-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifyingPayment ? 'Checking...' : 'Check for pending payments'}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            If you paid but didn't receive credits, click here
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditsPurchaseModal;
