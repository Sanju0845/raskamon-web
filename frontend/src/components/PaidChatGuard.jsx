import React, { useState, useEffect } from 'react';
import { Lock, Clock, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import axios from 'axios';
import ChatBookingModal from './ChatBookingModal';

const PaidChatGuard = ({ doctorId, children, onSessionStart }) => {
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [doctorPricing, setDoctorPricing] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  // Check for active session
  const checkActiveSession = async () => {
    try {
      setLoading(true);
      
      // Get user's active chat sessions
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/paid-chat/sessions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.sessions.length > 0) {
        // Find session for this doctor
        const session = response.data.sessions.find(
          s => s.doctor._id === doctorId && ['ongoing', 'booked', 'paused'].includes(s.status)
        );
        
        if (session) {
          setActiveSession(session);
          if (onSessionStart) onSessionStart(session);
        }
      }
    } catch (error) {
      console.error('Error checking active session:', error);
      setError('Failed to check session status');
    } finally {
      setLoading(false);
    }
  };

  // Get doctor pricing
  const getDoctorPricing = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/paid-chat/doctors`
      );

      if (response.data.success) {
        const pricing = response.data.doctors.find(d => d.doctorId === doctorId);
        setDoctorPricing(pricing);
      }
    } catch (error) {
      console.error('Error fetching doctor pricing:', error);
    }
  };

  useEffect(() => {
    if (token && doctorId) {
      checkActiveSession();
      getDoctorPricing();
    } else {
      setLoading(false);
    }
  }, [doctorId, token]);

  const handleBookingSuccess = (session) => {
    setActiveSession(session);
    setShowBookingModal(false);
    if (onSessionStart) onSessionStart(session);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If no active session, show paywall
  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Paid Chat Session
          </h2>
          
          <p className="text-gray-600 mb-6">
            Chat with this therapist requires payment. Book a session to start chatting.
          </p>

          {doctorPricing ? (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Rate per minute
                </span>
                <span className="font-semibold text-purple-600">
                  ₹{doctorPricing.pricePerMinute}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Minimum charge
                </span>
                <span className="font-semibold text-gray-800">
                  ₹{doctorPricing.minimumCharge}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Pay with
                </span>
                <span className="text-sm text-gray-500">
                  Credits or Razorpay
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="w-5 h-5" />
                <span>Doctor pricing not available</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            
            <button
              onClick={() => setShowBookingModal(true)}
              disabled={!doctorPricing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Book Session
            </button>
          </div>
        </div>

        {/* Booking Modal */}
        <ChatBookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          doctorId={doctorId}
          doctorPricing={doctorPricing}
          onBookingSuccess={handleBookingSuccess}
        />
      </div>
    );
  }

  // Active session exists, render children
  return (
    <div className="relative">
      {/* Session Status Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">
              Session Active • {activeSession.minutesUsed || 0} mins used
            </span>
          </div>
          <div className="text-sm">
            Balance: ₹{(activeSession.currentBalance || 0).toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Render chat component */}
      <div className="rounded-b-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default PaidChatGuard;
