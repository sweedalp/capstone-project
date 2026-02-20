import { useState, useEffect, useRef } from 'react';
import useVoiceChat from '../hooks/useVoiceChat';

/**
 * VoiceAIWidget - Floating voice AI assistant for learner pages
 * 
 * Features:
 * - Real-time voice interaction via WebSocket
 * - Speech-to-text (Whisper)
 * - AI responses (Ollama/Llama)
 * - Text-to-speech (Coqui TTS)
 * - Context-aware based on current course/lesson
 * 
 * User Stories: Learner #6, #7
 */
const VoiceAIWidget = ({ courseContext = null, userProfile = null, language = 'en' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [micPermission, setMicPermission] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);

  const {
    isConnected,
    isListening,
    isProcessing,
    isSpeaking,
    transcription,
    aiResponse,
    error,
    latency,
    startListening,
    stopListening,
    resetError
  } = useVoiceChat({
    wsUrl: 'wss://localhost:8000/api/voice',
    context: {
      courseId: courseContext?.courseId,
      lessonId: courseContext?.lessonId,
      language
    }
  });

  // Request microphone permission on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setMicPermission('granted'))
      .catch(() => setMicPermission('denied'));
  }, []);

  // Save queries to history
  useEffect(() => {
    if (transcription && !recentQueries.includes(transcription)) {
      setRecentQueries(prev => [transcription, ...prev].slice(0, 3));
    }
  }, [transcription]);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      if (micPermission !== 'granted') {
        requestMicPermission();
      } else {
        startListening();
      }
    }
  };

  const requestMicPermission = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setMicPermission('granted');
        startListening();
      })
      .catch(() => {
        setMicPermission('denied');
        alert('Microphone access is required for voice features. Please enable it in your browser settings.');
      });
  };

  const getStatusIcon = () => {
    if (!isConnected) return '⚠️';
    if (isListening) return '🔴';
    if (isProcessing) return '⏳';
    if (isSpeaking) return '🔊';
    return '🎤';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Connection lost';
    if (isListening) return 'Listening...';
    if (isProcessing) return 'Thinking...';
    if (isSpeaking) return 'Speaking...';
    return 'Ask me anything';
  };

  if (!isExpanded) {
    // Collapsed floating button
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
          aria-label="Open Voice AI Assistant"
        >
          <span className="text-2xl">{getStatusIcon()}</span>
        </button>
        {(isListening || isSpeaking) && (
          <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 animate-pulse"></div>
        )}
      </div>
    );
  }

  // Expanded widget
  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getStatusIcon()}</span>
          <div>
            <h3 className="font-semibold">Voice AI Assistant</h3>
            <p className="text-xs opacity-90">
              {isConnected ? (
                <>
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  Connected ({latency}ms)
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                  Disconnected
                </>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="hover:bg-blue-700 rounded p-1"
          aria-label="Minimize"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 h-80 overflow-y-auto">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-red-500">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-xs text-red-600">{error}</p>
                <button
                  onClick={resetError}
                  className="text-xs text-red-700 underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {micPermission === 'denied' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              🎤 Microphone access is required for voice features.
            </p>
            <button
              onClick={requestMicPermission}
              className="text-xs text-yellow-700 underline mt-1"
            >
              Grant permission
            </button>
          </div>
        )}

        {/* Conversation */}
        {transcription && (
          <div className="mb-3">
            <div className="bg-blue-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500 mb-1">You asked:</p>
              <p className="text-sm text-gray-800">{transcription}</p>
            </div>
          </div>
        )}

        {aiResponse && (
          <div className="mb-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                🤖 AI Response:
                {isSpeaking && <span className="text-blue-600 animate-pulse">🔊 Speaking...</span>}
              </p>
              <p className="text-sm text-gray-800">{aiResponse}</p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Recent queries */}
        {recentQueries.length > 0 && !transcription && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Recent queries:</p>
            <div className="space-y-1">
              {recentQueries.map((query, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1"
                >
                  • {query}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instruction */}
        {!transcription && !isListening && (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm text-gray-600 mb-1">Ask me anything about your courses...</p>
            <p className="text-xs text-gray-400">Press the microphone or type your question</p>
          </div>
        )}

        {/* Waveform animation when listening */}
        {isListening && (
          <div className="flex items-center justify-center gap-1 py-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-600 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 40 + 10}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Input controls */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <button
            onClick={handleVoiceInput}
            disabled={!isConnected || micPermission === 'denied'}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">{isListening ? '⏹️' : '🎤'}</span>
              <span>{isListening ? 'Stop' : 'Press to speak'}</span>
            </span>
          </button>
          <button
            className="py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg"
            aria-label="Type question instead"
            title="Type question (coming soon)"
          >
            <span className="text-xl">⌨️</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Powered by Whisper + Llama + Coqui TTS
        </p>
      </div>
    </div>
  );
};

export default VoiceAIWidget;
