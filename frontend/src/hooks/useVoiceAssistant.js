import { useState, useEffect, useRef } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [creditError, setCreditError] = useState(null);
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      // Cancel any ongoing fetch request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Stop and cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
    }

    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Failed to start listening. Please try again.');
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
      setIsListening(false);
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  };

  const speak = async (text, voiceId = '79a125e8-cd45-4c13-8a67-188112f4dd22') => {
    try {
      setIsLoadingAudio(true);
      setError(null);
      setCreditError(null);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Cancel any previous ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/voice/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text, voice: voiceId }),
        signal: abortController.signal,
      });

      // If request was aborted, don't process the response
      if (abortController.signal.aborted) {
        return;
      }

      // Check for credit error (402 Payment Required)
      if (response.status === 402) {
        const errorData = await response.json();
        setIsLoadingAudio(false);
        setIsSpeaking(false);
        setCreditError({
          creditsNeeded: errorData.creditsNeeded,
          currentCredits: errorData.currentCredits,
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      
      // Check again if aborted while getting blob
      if (abortController.signal.aborted) {
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      setIsLoadingAudio(false);
      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        abortControllerRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setIsLoadingAudio(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        abortControllerRef.current = null;
      };

      await audio.play();
    } catch (err) {
      // Don't show error if request was intentionally aborted
      if (err.name === 'AbortError') {
        console.log('Audio request was cancelled');
        setIsLoadingAudio(false);
        setIsSpeaking(false);
        return;
      }
      
      console.error('Speech error:', err);
      setIsSpeaking(false);
      setIsLoadingAudio(false);
      setError('Failed to generate or play audio');
    }
  };

  const stopSpeaking = () => {
    // Cancel any ongoing fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  };

  return {
    isListening,
    isSpeaking,
    isLoadingAudio,
    transcript,
    error,
    creditError,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};
