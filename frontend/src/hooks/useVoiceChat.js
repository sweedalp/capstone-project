import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useVoiceChat - Custom hook for real-time voice interaction
 * 
 * Manages WebSocket connection to voice AI backend
 * Handles audio recording, streaming, and playback
 * 
 * Backend Pipeline:
 * 1. Audio chunks → Whisper (Speech-to-Text)
 * 2. Transcription → Ollama/Llama (LLM Response)
 * 3. Text response → Coqui TTS (Text-to-Speech)
 * 4. Audio response → Frontend playback
 * 
 * @param {Object} config - Configuration options
 * @param {string} config.wsUrl - WebSocket URL (e.g., 'wss://localhost:8000/api/voice')
 * @param {Object} config.context - Context object (courseId, lessonId, language)
 * @param {string} config.authToken - User authentication token
 */
const useVoiceChat = ({ wsUrl, context = {}, authToken = null }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(0);

  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const audioElementRef = useRef(null);
  const requestTimestampRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    let reconnectTimeout;

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[VoiceChat] WebSocket connected');
          setIsConnected(true);
          setError(null);

          // Send initialization message with context
          ws.send(JSON.stringify({
            type: 'init',
            token: authToken,
            context: {
              courseId: context.courseId || null,
              lessonId: context.lessonId || null,
              language: context.language || 'en',
              timestamp: Date.now()
            }
          }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (err) {
            console.error('[VoiceChat] Failed to parse message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('[VoiceChat] WebSocket error:', error);
          setError('Connection error. Retrying...');
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log('[VoiceChat] WebSocket closed');
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (err) {
        console.error('[VoiceChat] Connection failed:', err);
        setError('Failed to connect to voice service');
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, [wsUrl, authToken, context.courseId, context.lessonId, context.language]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message) => {
    switch (message.type) {
      case 'transcription':
        console.log('[VoiceChat] Transcription:', message.text);
        setTranscription(message.text);
        setIsListening(false);
        setIsProcessing(true);
        break;

      case 'ai_response':
        console.log('[VoiceChat] AI Response:', message.text);
        setAiResponse(message.text);
        setIsProcessing(false);

        // Calculate latency
        if (requestTimestampRef.current) {
          const responseLatency = Date.now() - requestTimestampRef.current;
          setLatency(responseLatency);
        }

        // Play TTS audio if available
        if (message.audio_url) {
          playAudioResponse(message.audio_url);
        }
        break;

      case 'audio_chunk':
        // Handle streamed TTS audio chunks
        if (message.data) {
          playAudioChunk(message.data);
        }
        break;

      case 'error':
        console.error('[VoiceChat] Server error:', message.message);
        setError(message.message || 'An error occurred');
        setIsListening(false);
        setIsProcessing(false);
        setIsSpeaking(false);
        break;

      case 'status':
        console.log('[VoiceChat] Status:', message.message);
        break;

      default:
        console.warn('[VoiceChat] Unknown message type:', message.type);
    }
  }, []);

  // Start voice recording
  const startListening = useCallback(async () => {
    try {
      setError(null);
      setTranscription('');
      setAiResponse('');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000 // Optimal for Whisper
        } 
      });
      
      streamRef.current = stream;

      // Initialize AudioContext for audio processing
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });
      
      mediaRecorderRef.current = mediaRecorder;

      // Handle audio data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert blob to base64 and send to server
          const reader = new FileReader();
          reader.readAsDataURL(event.data);
          reader.onloadend = () => {
            const base64Audio = reader.result.split(',')[1];
            wsRef.current.send(JSON.stringify({
              type: 'audio_chunk',
              data: base64Audio,
              timestamp: Date.now()
            }));
          };
        }
      };

      // Start recording
      mediaRecorder.start(250); // Send chunks every 250ms for real-time streaming
      setIsListening(true);
      requestTimestampRef.current = Date.now();

      console.log('[VoiceChat] Started listening');
    } catch (err) {
      console.error('[VoiceChat] Failed to start listening:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  }, []);

  // Stop voice recording
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('[VoiceChat] Stopped listening');
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);

    // Notify server that recording has stopped
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'audio_end',
        timestamp: Date.now()
      }));
    }
  }, []);

  // Play TTS audio response
  const playAudioResponse = useCallback((audioUrl) => {
    try {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        console.log('[VoiceChat] Started speaking');
      };

      audio.onended = () => {
        setIsSpeaking(false);
        console.log('[VoiceChat] Finished speaking');
      };

      audio.onerror = (err) => {
        console.error('[VoiceChat] Audio playback error:', err);
        setIsSpeaking(false);
        setError('Failed to play audio response');
      };

      audio.play();
    } catch (err) {
      console.error('[VoiceChat] Failed to play audio:', err);
      setError('Audio playback failed');
    }
  }, []);

  // Play streamed audio chunks
  const playAudioChunk = useCallback((base64Audio) => {
    // TODO: Implement streaming audio playback
    // This requires using Web Audio API for buffering and playing chunks
    console.log('[VoiceChat] Received audio chunk');
  }, []);

  // Reset error state
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Send text message (fallback mode)
  const sendTextMessage = useCallback((text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setTranscription(text);
      setIsProcessing(true);
      requestTimestampRef.current = Date.now();

      wsRef.current.send(JSON.stringify({
        type: 'text_message',
        text,
        timestamp: Date.now()
      }));
    } else {
      setError('Not connected to voice service');
    }
  }, []);

  return {
    // State
    isConnected,
    isListening,
    isProcessing,
    isSpeaking,
    transcription,
    aiResponse,
    error,
    latency,

    // Actions
    startListening,
    stopListening,
    sendTextMessage,
    resetError,

    // Refs (for advanced usage)
    wsRef,
    audioElementRef
  };
};

export default useVoiceChat;
