import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaComments, FaUserCircle, FaClock, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const ChatInbox = ({ doctorToken, onChatSelect, selectedChatId, refreshTrigger }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const fetchDoctorChats = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/doctor/chats`,
        {
          headers: { Authorization: `Bearer ${doctorToken}` },
        }
      );

      if (data.success) {
        setChats(data.chats || []);
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error('Error fetching doctor chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Force refresh function
  const forceRefresh = () => {
    fetchDoctorChats();
    fetchUnreadCount();
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/doctor/unread-count`,
        {
          headers: { Authorization: `Bearer ${doctorToken}` },
        }
      );
      
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchDoctorChats();
    fetchUnreadCount();
    
    // Set up polling for real-time updates (more frequent for better UX)
    const chatsInterval = setInterval(fetchDoctorChats, 2000); // Every 2 seconds
    const unreadInterval = setInterval(fetchUnreadCount, 3000); // Every 3 seconds
    
    return () => {
      clearInterval(chatsInterval);
      clearInterval(unreadInterval);
    };
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  const filteredChats = chats.filter(chat =>
    (chat.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chat.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getUnreadCount = (chat) => {
    return chat.messages?.filter(msg => msg.sender === 'user' && !msg.read).length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Messages</h3>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </div>
          )}
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FaComments className="text-4xl mb-3 text-gray-300" />
            <p className="text-center">
              {searchTerm ? 'No patients found' : 'No messages yet'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try a different search term' : 'Patients will appear here when they send messages'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const unreadCount = getUnreadCount(chat);
              const isSelected = selectedChatId === chat.userId._id;
              
              return (
                <motion.div
                  key={chat._id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onChatSelect(chat)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {chat.userId?.image ? (
                        <img
                          src={chat.userId.image}
                          alt={chat.userId.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUserCircle className="text-2xl text-gray-400" />
                        </div>
                      )}
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {chat.userId?.name || 'Unknown Patient'}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {chat.userId?.email}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700 truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                        {chat.lastMessageSender && (
                          <div className={`text-xs px-2 py-1 rounded ${
                            chat.lastMessageSender === 'user' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {chat.lastMessageSender === 'user' ? 'Patient' : 'You'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInbox;
