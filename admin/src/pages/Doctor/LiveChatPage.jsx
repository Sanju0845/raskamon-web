import React from 'react';
import LiveChat from '@/components/LiveChat/LiveChat';
import { DoctorContext } from '@/context/DoctorContext';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LiveChatPage = () => {
  const { dToken } = React.useContext(DoctorContext);
  const navigate = useNavigate();

  if (!dToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please login to access chat</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/doctor-dashboard')}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900">Patient Messages</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-120px)]">
          <LiveChat doctorToken={dToken} />
        </div>
      </div>
    </div>
  );
};

export default LiveChatPage;
