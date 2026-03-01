import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { FaArrowLeft, FaComments, FaUserMd, FaPaperPlane } from "react-icons/fa";
import axios from "axios";

const LiveChat = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AppContext);
  
  const [doctor, setDoctor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Fetch chat data
  const fetchChatData = async () => {
    try {
      if (hasError) return; // Stop polling if there was an error
      
      const { data: chatData } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/user/chat/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (chatData.success) {
        setDoctor(chatData.chat.doctorId);
        setChatMessages(chatData.chat.messages || []);
        setHasError(false); // Reset error state on success
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
      setHasError(true); // Set error state to stop polling
    }
  };

  // Silent fetch for polling (doesn't trigger loading states)
  const fetchChatDataSilent = async () => {
    try {
      if (hasError) return;
      
      const { data: chatData } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/user/chat/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (chatData.success) {
        setDoctor(chatData.chat.doctorId);
        const newMessages = chatData.chat.messages || [];
        
        // Only update if messages actually changed to prevent unnecessary re-renders
        if (JSON.stringify(newMessages) !== JSON.stringify(chatMessages)) {
          setChatMessages(newMessages);
          setHasError(false);
        }
      }
    } catch (error) {
      console.error("Error fetching chat data (silent):", error);
      setHasError(true);
    }
  };

  // Silent fetch for unread count
  const fetchUnreadCountSilent = async () => {
    try {
      if (hasError) return;
      
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/user/chat/${doctorId}/unread`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count (silent):", error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/user/chat/${doctorId}/unread`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/user/chat/${doctorId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setChatLoading(true);

    // Add message to UI immediately for better UX
    const tempMessage = {
      _id: Date.now().toString(),
      sender: "user",
      message: messageContent,
      timestamp: new Date(),
      read: false
    };

    setChatMessages(prev => [...prev, tempMessage]);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/user/chat/${doctorId}/send`,
        { message: messageContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        console.log("Message sent successfully");
        // Refetch chat messages to get the latest state
        await fetchChatData();
        // Force scroll to bottom after sending (faster)
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the temp message if it failed
      setChatMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      
      // Show error message
      const errorMessage = {
        _id: Date.now().toString(),
        sender: "doctor",
        message: "Sorry, I couldn't send your message right now. Please try again later.",
        timestamp: new Date(),
        read: false
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    try {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    } catch (error) {
      // Fallback for older browsers
      const chatContainer = messagesEndRef.current?.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  // Get date label
  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    if (doctorId && token) {
      // Initial fetch only
      const initialFetch = async () => {
        try {
          setLoading(true);
          
          const { data: chatData } = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/user/chat/${doctorId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (chatData.success) {
            setDoctor(chatData.chat.doctorId);
            setChatMessages(chatData.chat.messages || []);
            setHasError(false);
          }

          const { data: unreadData } = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/user/chat/${doctorId}/unread`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (unreadData.success) {
            setUnreadCount(unreadData.unreadCount);
          }
        } catch (error) {
          console.error("Error during initial fetch:", error);
          setHasError(true);
        } finally {
          setLoading(false);
          setInitialLoadComplete(true);
        }
      };
      
      initialFetch();
      
      // Set up polling only after initial load is complete
      let chatInterval, unreadInterval;
      
      const startPolling = () => {
        if (!hasError && initialLoadComplete) {
          chatInterval = setInterval(() => {
            if (!hasError && initialLoadComplete) fetchChatDataSilent();
          }, 500); // Every 500ms for near real-time
          
          unreadInterval = setInterval(() => {
            if (!hasError && initialLoadComplete) fetchUnreadCountSilent();
          }, 1000); // Every 1 second for unread count
        }
      };

      // Start polling after a short delay
      const pollingTimeout = setTimeout(startPolling, 1000);
      
      return () => {
        clearTimeout(pollingTimeout);
        if (chatInterval) clearInterval(chatInterval);
        if (unreadInterval) clearInterval(unreadInterval);
      };
    }
  }, [doctorId, token]);

  useEffect(() => {
    // Scroll to bottom whenever messages change or new messages arrive
    if (chatMessages.length > 0) {
      const timeout = setTimeout(() => {
        scrollToBottom();
      }, 50); // Reduced delay for faster scroll
      return () => clearTimeout(timeout);
    }
  }, [chatMessages, previousMessageCount]); // Trigger on messages and count change

  // Update previous message count when messages change
  useEffect(() => {
    if (chatMessages.length !== previousMessageCount) {
      setPreviousMessageCount(chatMessages.length);
      // Force immediate scroll when message count increases
      if (chatMessages.length > previousMessageCount) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    }
  }, [chatMessages.length]);

  useEffect(() => {
    if (unreadCount > 0) {
      markAsRead();
    }
  }, [unreadCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(chatMessages);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {doctor?.image ? (
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUserMd className="text-white text-xl" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Dr. {doctor?.name}</h1>
                  <p className="text-sm opacity-90">{doctor?.speciality}</p>
                  {unreadCount > 0 && (
                    <p className="text-xs opacity-75">{unreadCount} unread messages</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/appointment/${doctorId}`)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl h-[calc(100vh-200px)] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FaComments className="text-4xl mb-3 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                  <p className="text-sm text-gray-400 mt-2">Send a message to begin chatting with Dr. {doctor?.name}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(messageGroups).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="text-center text-xs text-gray-500 font-medium mb-3">
                      {getDateLabel(date)}
                    </div>
                    {dateMessages.map((message) => (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-3`}
                      >
                        <div
                          className={`max-w-[70%] p-4 rounded-2xl ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                              : "bg-white text-gray-800 border border-gray-200 shadow-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          <p className={`text-xs mt-2 ${
                            message.sender === "user" ? "text-purple-200" : "text-gray-500"
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                disabled={chatLoading}
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading || !newMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {chatLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaPaperPlane />
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
