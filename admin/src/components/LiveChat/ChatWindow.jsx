import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaComments, FaUserCircle, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

const ChatWindow = ({ chat, doctorToken, onBack, onChatUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Fetch chat messages for real-time updates
  const fetchChatMessages = async () => {
    try {
      const userId = chat.userId?._id || chat.userId;
      if (!userId) return;

      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/doctor/chat/${userId}`,
        {
          headers: { Authorization: `Bearer ${doctorToken}` },
        }
      );

      if (data.success) {
        const newMessages = data.chat.messages || [];
        // Only update if messages actually changed to prevent unnecessary re-renders
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages);
          
          // Notify parent component to update chat list
          if (onChatUpdate) {
            onChatUpdate();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  useEffect(() => {
    if (chat) {
      setMessages(chat.messages || []);
      // Mark messages as read
      markMessagesAsRead();
      
      // Set up polling for real-time updates
      const pollingInterval = setInterval(fetchChatMessages, 500); // Poll every 500ms for near real-time
      
      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [chat]);

  useEffect(() => {
    // Scroll to bottom whenever messages change or new messages arrive
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM is updated
    
    return () => clearTimeout(timeout);
  }, [messages, previousMessageCount]); // Trigger on messages and count change

  // Update previous message count when messages change
  useEffect(() => {
    if (messages.length !== previousMessageCount) {
      setPreviousMessageCount(messages.length);
    }
  }, [messages.length]);

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

  const markMessagesAsRead = async () => {
    try {
      const userId = chat.userId?._id || chat.userId;
      if (!userId) {
        console.error('No user ID found for chat');
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/doctor/chat/${userId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${doctorToken}` },
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Add message to UI immediately
    const doctorMessage = {
      _id: Date.now().toString(),
      sender: 'doctor',
      message: messageContent,
      timestamp: new Date(),
      read: true
    };

    setMessages(prev => [...prev, doctorMessage]);

    try {
      const userId = chat.userId?._id || chat.userId;
      if (!userId) {
        throw new Error('No user ID found for chat');
      }

      // Send to backend
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/live-chat/doctor/chat/${userId}/send`,
        { message: messageContent },
        {
          headers: { Authorization: `Bearer ${doctorToken}` },
        }
      );
      
      // Notify parent component to update chat list
      if (onChatUpdate) {
        onChatUpdate();
      }

      // Refetch messages to get the latest state
      await fetchChatMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the message if it failed to send
      setMessages(prev => prev.filter(msg => msg._id !== doctorMessage._id));
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
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

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <FaComments className="text-4xl mb-3 text-gray-300" />
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white transition-colors p-2"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          
          <div className="flex items-center gap-3 flex-1">
            {chat.userId?.image ? (
              <img
                src={chat.userId.image}
                alt={chat.userId.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-2xl" />
            )}
            <div>
              <h3 className="font-semibold">{chat.userId?.name || 'Unknown Patient'}</h3>
              <p className="text-sm opacity-90">{chat.userId?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FaComments className="text-3xl mb-2 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="text-center text-xs text-gray-500 font-medium mb-3">
                  {formatDate(new Date(date))}
                </div>
                {dateMessages.map((message) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        message.sender === 'doctor'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'doctor' ? 'text-blue-200' : 'text-gray-500'
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
        
        {sendingMessage && (
          <div className="flex justify-end">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sendingMessage}
          />
          <button
            onClick={handleSendMessage}
            disabled={sendingMessage || !newMessage.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingMessage ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
