import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";;
const API_URL = `${BASE.replace(/\/$/, '')}/api/chat`;

const buildHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get or create a guest ID
const getGuestId = () => {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};

export const fetchChatHistory = async (userId) => {
  const headers = buildHeaders();
  
  // For guest users, get chat from localStorage
  if (!userId) {
    const guestChat = localStorage.getItem('guestChat');
    return guestChat ? JSON.parse(guestChat).messages : [];
  }

  // For logged in users, fetch from backend
  const res = await axios.get(`${API_URL}?userId=${userId}`, { headers });
  return res.data.chat?.messages || [];
};

export const saveChatMessages = async (messages, userId) => {
  // For guest users, save to localStorage
  if (!userId) {
    const guestChat = { messages };
    localStorage.setItem('guestChat', JSON.stringify(guestChat));
    return messages;
  }

  // For logged in users, save to backend
  const headers = buildHeaders();
  const res = await axios.post(API_URL, { messages }, { headers });
  return res.data.chat?.messages || [];
};

export const sendMessage = async (message, userId) => {
  const headers = buildHeaders();
  const url = `${API_URL}/send`;
  
  // Get doctors list from localStorage
  const doctors = localStorage.getItem('doctors') ? JSON.parse(localStorage.getItem('doctors')) : [];

  // Do NOT send userAssessments from frontend - backend will fetch fresh from DB
  const payload = userId 
    ? { message, userId, doctors }
    : { message };
  
  console.log('[chatService] POST', url, payload);
  const res = await axios.post(url, payload, { headers, timeout: 20000 });

  // For guest users, save chat to localStorage
  if (!userId && res.data.success) {
    const guestChat = localStorage.getItem('guestChat');
    const messages = guestChat ? JSON.parse(guestChat).messages : [];
    const updatedMessages = [...messages, 
      { sender: 'user', content: message, timestamp: new Date() },
      { sender: 'bot', content: res.data.reply, timestamp: new Date() }
    ].slice(-50); // Keep last 50 messages
    localStorage.setItem('guestChat', JSON.stringify({ messages: updatedMessages }));
  }

  return res.data; // { success, reply, chat }
};

export const deleteChatHistory = async (userId) => {
  // For guest users, clear from localStorage
  if (!userId) {
    localStorage.removeItem('guestChat');
    return { success: true };
  }

  // For logged in users, delete from backend
  const headers = buildHeaders();
  const res = await axios.delete(`${API_URL}`, {
    headers,
    data: { userId }
  });
  return res.data;
};

export const getChatSummary = async (userId) => {
  if (!userId) return null;

  try {
    const headers = buildHeaders();
    // Get user assessments from localStorage
    const userAssessments = JSON.parse(localStorage.getItem('userAssessments') || '[]');
    
    const res = await axios.get(`${API_URL}/summary`, {
      headers,
      params: { userId },
      data: { userAssessments }
    });
    return res.data;
  } catch (error) {
    console.error('Error getting chat summary:', error);
    throw error;
  }
};

export default { 
  fetchChatHistory, 
  saveChatMessages, 
  sendMessage, 
  deleteChatHistory,
  getChatSummary 
};
