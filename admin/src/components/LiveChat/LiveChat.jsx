import React, { useState } from 'react';
import ChatInbox from './ChatInbox';
import ChatWindow from './ChatWindow';

const LiveChat = ({ doctorToken }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleBackToInbox = () => {
    setSelectedChat(null);
  };

  const handleChatUpdate = () => {
    // Force refresh of chat list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="h-full flex bg-white rounded-lg overflow-hidden border border-gray-200">
      {/* Inbox Panel */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-gray-200`}>
        <ChatInbox 
          doctorToken={doctorToken} 
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChat?.userId?._id}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Chat Window */}
      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1`}>
        <ChatWindow 
          chat={selectedChat} 
          doctorToken={doctorToken}
          onBack={handleBackToInbox}
          onChatUpdate={handleChatUpdate}
        />
      </div>
    </div>
  );
};

export default LiveChat;
