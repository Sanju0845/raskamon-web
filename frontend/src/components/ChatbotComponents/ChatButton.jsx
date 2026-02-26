import { MessageCircle, X, Heart, Sparkles } from 'lucide-react';

export const ChatButton= ({ isOpen, onClick }) => {
  return (
    <div className="fixed bottom-[45%] left-4 sm:left-auto sm:right-2 z-40">
      {!isOpen && (
        <div className="mb-3 animate-bounce">
          <div className="bg-white text-gray-800 px-3 py-2 rounded-2xl shadow-lg border border-purple-100 relative">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-sm font-medium">Chat</span>
            </div>
            {/* Speech bubble arrow */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-3 bg-white border-b border-r border-purple-100 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={onClick}
        className="w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 overflow-hidden border-2 border-purple-200 relative"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <img 
          src="/raskabot.jpg" 
          alt="Raska Bot" 
          className="w-full h-full object-cover"
        />
        {isOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <X className="w-8 h-8 text-white" />
          </div>
        )}
      </button>
    </div>
  );
};