import React, { useState, useEffect } from 'react';
import { Coins, CreditCard } from 'lucide-react';
import axios from 'axios';

const CreditsDisplay = () => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full">
      <Coins className="w-5 h-5" />
      <span className="font-semibold">{credits}</span>
      <span className="text-sm">Credits</span>
    </div>
  );
};

export default CreditsDisplay;
