import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Bot,
  User,
  Loader2,
  Heart,
  Sparkles,
  MoreVertical,
  Trash2,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import SubscriptionModal from "../SubscriptionModal";
import {
  fetchChatHistory,
  saveChatMessages,
  sendMessage as apiSendMessage,
  deleteChatHistory,
} from "../../services/chatService";
import { useAuth } from "../../context/AppContext";
import { Link } from "react-router-dom";
import { useVoiceAssistant } from "../../hooks/useVoiceAssistant";

export const ChatModal = ({ isOpen, onClose }) => {
  const { token, userData } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  // Voice assistant hook
  const {
    isListening,
    isSpeaking,
    isLoadingAudio,
    transcript,
    error: voiceError,
    creditError,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoiceAssistant();
  
  // Removed session-based code - now using single conversation per user
  const [messages, setMessages] = useState([
    {
      id: "1",
      content: "Hi, I am Raska your Mental Wellness Assistant",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  // Load chat history from backend or localStorage when modal opens
  useEffect(() => {
    const defaultGreeting = {
      id: "1",
      content: "Hi, I am Raska your Mental Wellness Assistant",
      sender: "bot",
      timestamp: new Date(),
    };

    const loadHistory = async () => {
      if (!isOpen) return;

      // Reset initial load flag when modal opens
      isInitialLoadRef.current = true;

      try {
        // Fetch history based on authentication status
        const history = await fetchChatHistory(userData?._id);
        if (history.length > 0) {
          // Check if the first message is already the greeting
          const firstMsg = history[0];
          if (
            firstMsg.content === defaultGreeting.content &&
            firstMsg.sender === "bot"
          ) {
            // If it is, just use the history as is
            setMessages(
              history.map((msg, idx) => ({
                id: String(idx + 1),
                ...msg,
                timestamp: new Date(msg.timestamp),
              }))
            );
          } else {
            // If not, add the greeting at the beginning
            setMessages([
              defaultGreeting,
              ...history.map((msg, idx) => ({
                id: String(idx + 2),
                ...msg,
                timestamp: new Date(msg.timestamp),
              })),
            ]);
          }
        } else {
          // No history, just show the default greeting
          setMessages([defaultGreeting]);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
        // On error, at least show the default greeting
        setMessages([defaultGreeting]);
      }
    };

    loadHistory();
  }, [isOpen, token, userData?._id]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isLoading) {
      setInput(transcript);
      // Auto-send the voice message
      setTimeout(() => {
        sendMessage(transcript);
      }, 100);
    }
  }, [transcript]);

  // Handle credit errors - show subscription modal
  useEffect(() => {
    if (creditError) {
      setShowSubscriptionModal(true);
    }
  }, [creditError]);

  // Speak bot responses if voice is enabled (only for new messages)
  useEffect(() => {
    // Skip speaking on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (voiceEnabled && messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1];
      
      // Only speak if this is a new message (not from chat history load)
      if (lastMessage.sender === 'bot' && lastMessage.id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = lastMessage.id;
        
        // Remove markdown formatting for better speech
        const cleanText = lastMessage.content
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/#{1,6}\s/g, '');
        speak(cleanText);
      }
    }
  }, [messages, voiceEnabled, isLoading]);

  // Cleanup voice on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
      if (isSpeaking) {
        stopSpeaking();
      }
    };
  }, []);

  // Stop voice when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (isListening) {
        stopListening();
      }
      if (isSpeaking) {
        stopSpeaking();
      }
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle viewport height changes for mobile keyboards
  useEffect(() => {
    const handleViewportChange = () => {
      // Set CSS custom property for viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    handleViewportChange();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("orientationchange", handleViewportChange);
    };
  }, []);

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [isOpen]);

  const sendMessage = async (messageText) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: textToSend,
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Send message to backend - pass userId for logged-in users
      const resp = await apiSendMessage(textToSend, userData?._id);
      if (resp?.success) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          content: resp.reply,
          sender: "bot",
          timestamp: new Date(),
        };
        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);

        // Save messages to appropriate storage
        await saveChatMessages(finalMessages, userData?._id);
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          content:
            resp?.message ||
            "I'm sorry, I'm experiencing some technical difficulties right now. Please try again in a moment.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, I'm experiencing some technical difficulties right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      // If currently listening, stop
      stopListening();
    } else if (isSpeaking) {
      // If currently speaking, stop
      stopSpeaking();
    } else {
      // If idle, toggle voice mode and start listening if enabled
      if (!voiceEnabled) {
        setVoiceEnabled(true);
      }
      startListening();
    }
  };

  const handleReplayMessage = (messageContent) => {
    // Remove markdown formatting for better speech
    const cleanText = messageContent
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/#{1,6}\s/g, '');
    speak(cleanText);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  if (!isOpen) return null;

  const handleDeleteConfirm = async () => {
    try {
      await deleteChatHistory(userData?._id);
      setMessages([
        {
          id: "1",
          content: "Hi, I am Raska your Mental Wellness Assistant",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Error deleting chat history:", error);
      // We'll show the error in the modal itself instead of an alert
      setShowDeleteConfirmation(false);
      // You might want to show a toast notification here instead
    }
  };

  return (
    <React.Fragment>
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Chat History"
        message="Would you like to save your chat history before deleting? You can export it as a PDF file to keep or share."
        messages={messages}
      />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        creditsNeeded={creditError?.creditsNeeded || 0}
        currentCredits={creditError?.currentCredits || 0}
        onCloseChatModal={onClose}
      />
      <style>{`
        .modal-viewport {
          height: 100vh;
          height: calc(var(--vh, 1vh) * 100);
        }
        @media (min-width: 640px) {
          .modal-container {
            height: 420px !important;
            max-height: 420px !important;
          }
        }
        @media (max-width: 639px) {
          .modal-viewport {
            align-items: stretch;
            padding-bottom: env(safe-area-inset-bottom, 0px);
            min-height: -webkit-fill-available;
          }
          .modal-viewport > div {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            height: 100vh;
            height: -webkit-fill-available;
            max-height: -webkit-fill-available;
          }
        }
        .maximized-modal {
          position: fixed;
          top: 1rem;
          right: 1rem;
          bottom: 1rem;
          left: 1rem;
          height: calc(100vh - 2rem) !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex ${
          isMaximized
            ? "sm:items-center sm:justify-center sm:p-2"
            : "sm:items-end sm:justify-end sm:p-6"
        } items-stretch justify-center p-0 modal-viewport`}
      >
        <div
          className={`bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full flex flex-col animate-slide-up border border-purple-100 transition-all duration-300 ease-in-out ${
            isMaximized
              ? "sm:w-[98%] sm:h-[95vh] fixed sm:inset-4"
              : "sm:w-full sm:max-w-sm modal-container h-screen max-h-screen sm:h-auto"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 sm:p-5 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 sm:w-9 sm:h-9 bg-white bg-opacity-20 rounded-full overflow-hidden">
                  <img
                    src="/raskabot.jpg"
                    alt="Raska Bot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-lg">Raska</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-sm sm:text-sm text-purple-100">
                      Here to support you
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Maximize button - hidden on mobile, visible on desktop */}
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="hidden sm:flex text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  title={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-purple-100">
                      <button
                        onClick={() => {
                          setShowDeleteConfirmation(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2 text-pink-500" />
                        Delete Chat History
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-4 bg-gradient-to-b from-purple-25 to-pink-25 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-3 sm:space-x-3 max-w-[85%] ${
                    isMaximized ? "sm:max-w-2xl" : "sm:max-w-xs"
                  } ${
                    message.sender === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 ml-1 ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                        : "bg-white ring-1 ring-purple-100"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img
                          src="/raskabot.jpg"
                          alt="Raska Bot"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 sm:px-4 sm:py-3 rounded-2xl shadow-sm ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                        : "bg-white text-gray-900 border border-purple-100"
                    }`}
                  >
                    <div className="text-sm sm:text-sm leading-relaxed">
                      {message.sender === "bot" ? (
                        <ReactMarkdown
                          components={{
                            a: ({ href, children, ...props }) => {
                              // Only replace internal links starting with "/appointment/"
                              if (href.startsWith("/appointment/")) {
                                return (
                                  <Link to={href} passHref>
                                    <a
                                      style={{
                                        color: "blue",
                                        textDecoration: "underline",
                                      }}
                                      onClick={onClose}
                                    >
                                      {children}
                                    </a>
                                  </Link>
                                );
                              }
                              // For external links, render normally
                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              );
                            },
                          }}
                          remarkPlugins={[remarkGfm]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <span>{message.content}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 sm:mt-2">
                      <p
                        className={`text-xs ${
                          message.sender === "user"
                            ? "text-purple-100"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {/* Replay button for bot messages */}
                      {message.sender === "bot" && isSupported && token && (
                        <button
                          onClick={() => {
                            if (isSpeaking || isLoadingAudio) {
                              stopSpeaking();
                            } else {
                              handleReplayMessage(message.content);
                            }
                          }}
                          className={`ml-2 p-1 rounded-full transition-colors group ${
                            isSpeaking || isLoadingAudio
                              ? 'bg-purple-100 hover:bg-purple-200' 
                              : 'hover:bg-purple-100'
                          }`}
                          title={isSpeaking ? "Stop audio" : isLoadingAudio ? "Loading audio..." : "Play audio"}
                          disabled={isLoading}
                        >
                          {isLoadingAudio ? (
                            <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                          ) : isSpeaking ? (
                            <Square className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className={`flex items-start space-x-3 sm:space-x-3 max-w-[85%] ${
                    isMaximized ? "sm:max-w-2xl" : "sm:max-w-xs"
                  }`}
                >
                  <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 bg-white ring-1 ring-purple-100">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img
                        src="/raskabot.jpg"
                        alt="Raska Bot"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-3 sm:px-4 sm:py-3 rounded-2xl border border-purple-100 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 sm:w-4 sm:h-4 text-purple-500 animate-spin" />
                      <Sparkles className="w-4 h-4 sm:w-4 sm:h-4 text-pink-500 animate-pulse" />
                      <span className="text-sm sm:text-sm text-gray-500">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 sm:p-5 border-t border-purple-100 bg-gradient-to-r from-purple-25 to-pink-25 flex-shrink-0">
            <div className="flex space-x-2 sm:space-x-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Share what's on your mind..."}
                className="flex-1 px-4 py-3 sm:px-4 sm:py-3 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm text-sm sm:text-sm resize-none min-h-[44px] max-h-[120px] overflow-y-auto no-scrollbar"
                disabled={isLoading || isListening}
                rows={1}
              />
              
              {/* Voice Assistant Button */}
              {isSupported && token && (
                <button
                  onClick={handleVoiceToggle}
                  disabled={isLoading || isLoadingAudio}
                  className={`relative p-3 sm:p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-300'
                      : isSpeaking
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : isLoadingAudio
                      ? 'bg-purple-400 text-white shadow-md'
                      : voiceEnabled
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-white border-2 border-purple-200 text-purple-600 hover:border-purple-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={
                    isListening 
                      ? 'Click to stop listening' 
                      : isSpeaking 
                      ? 'Click to stop speaking'
                      : isLoadingAudio
                      ? 'Loading audio...'
                      : voiceEnabled 
                      ? 'Voice mode ON - Click to speak' 
                      : 'Click to start voice chat'
                  }
                >
                  {isListening ? (
                    <>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                      <Mic className="w-5 h-5 sm:w-5 sm:h-5" />
                    </>
                  ) : isLoadingAudio ? (
                    <Loader2 className="w-5 h-5 sm:w-5 sm:h-5 animate-spin" />
                  ) : isSpeaking ? (
                    <div className="relative flex items-center justify-center">
                      <Volume2 className="w-5 h-5 sm:w-5 sm:h-5 animate-pulse" />
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" strokeDasharray="4 2" className="animate-spin" style={{ animationDuration: '3s' }} />
                      </svg>
                    </div>
                  ) : (
                    <Mic className="w-5 h-5 sm:w-5 sm:h-5" />
                  )}
                  {voiceEnabled && !isListening && !isSpeaking && !isLoadingAudio && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                  )}
                </button>
              )}

              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 sm:p-3 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md"
              >
                <Send className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-center mt-3 sm:mt-3 space-x-2">
              <Heart className="w-4 h-4 sm:w-4 sm:h-4 text-pink-400" />
              <span className="text-sm text-gray-500">
                {isListening 
                  ? "🎤 Listening to your voice..." 
                  : isLoadingAudio
                  ? "⏳ Generating audio..."
                  : isSpeaking 
                  ? "🔊 AI is responding..." 
                  : "Your conversations are private and secure"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
