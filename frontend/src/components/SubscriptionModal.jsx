import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Zap, TrendingUp, AlertCircle } from "lucide-react";

const SubscriptionModal = ({ isOpen, onClose, creditsNeeded, currentCredits, onCloseChatModal }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    if (onCloseChatModal) {
      onCloseChatModal();
    }
    navigate("/pricing");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up border border-purple-100 relative z-[61]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Insufficient Credits</h3>
              <p className="text-sm text-purple-100">Upgrade to continue using voice features</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Credits Info */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Current Credits</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentCredits}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Credits Required</span>
              <span className="text-2xl font-bold text-gray-900">
                {creditsNeeded}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Short by</span>
                <span className="text-xl font-bold text-red-500">
                  {creditsNeeded - currentCredits}
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 font-medium">Upgrade benefits:</p>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm text-gray-700">Enhanced voice assistant interactions</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm text-gray-700">Advanced AI mood analysis and insights</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm text-gray-700">Priority support and exclusive features</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Upgrade Now
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
