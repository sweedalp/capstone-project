import { useState, useEffect, useRef } from 'react';
import useVoiceChat from '../hooks/useVoiceChat';

/**
 * VoiceChatModal - Full-screen voice conversation interface
 * 
 * Features:
 * - Real-time voice conversations
 * - Conversation history display
 * - Text input fallback
 * - Transcript export
 * - Windowed or fullscreen mode
 * 
 * Location: AI Learning Hub (PAGE 8)
 * User Stories: Learner #6, #7
 */
const VoiceChatModal = ({ 
  isOpen, 
  onClose, 
  courseContext = null,
  isFullscreen = false 
}) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [mode, setMode] = useState('voice'); // 'voice' or 'text'
  const conversationEndRef = useRef(null);

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
    sendTextMessage,
    resetError
  } = useVoiceChat({
    wsUrl: 'wss://localhost:8000/api/voice',
    context: {
      courseId: courseContext?.courseId,
      lessonId: courseContext?.lessonId,
      language: courseContext?.language || 'en'
    }
  });

  // Add messages to conversation history
  useEffect(() => {
    if (transcription) {
      setConversationHistory(prev => [...prev, {
        type: 'user',
        text: transcription,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [transcription]);

  useEffect(() => {
    if (aiResponse) {
      setConversationHistory(prev => [...prev, {
        type: 'ai',
        text: aiResponse,
        timestamp: new Date().toISOString(),
        isSpeaking
      }]);
    }
  }, [aiResponse]);

  // Auto-scroll to bottom
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, isProcessing]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  const handleExportTranscript = () => {
    const transcript = conversationHistory
      .map(msg => `${msg.type === 'user' ? 'You' : 'AI'}: ${msg.text}`)
      .join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (confirm('Clear conversation history?')) {
      setConversationHistory([]);
    }
  };

  if (!isOpen) return null;

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-50'
    : 'fixed inset-4 md:inset-20 z-50';

  return (
    <div className={containerClass}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full h-full bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎤</span>
            <div>
              <h2 className="text-lg font-bold">Voice AI Chat</h2>
              <p className="text-xs opacity-90 flex items-center gap-2">
                {isConnected ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Connected • {latency}ms latency
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 bg-red-400 rounded-full"></span>
                    Disconnected
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export button */}
            <button
              onClick={handleExportTranscript}
              disabled={conversationHistory.length === 0}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded disabled:opacity-50"
              title="Export transcript"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            {/* Clear history */}
            <button
              onClick={handleClearHistory}
              disabled={conversationHistory.length === 0}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded disabled:opacity-50"
              title="Clear history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {error && (
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
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {conversationHistory.length === 0 && !isListening && !isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Start a Voice Conversation
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Ask questions about your course, get explanations, or request study recommendations.
                Press and hold the microphone button to speak.
              </p>
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Real-time responses
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Context-aware
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Multi-language
                </div>
              </div>
            </div>
          ) : (
            <>
              {conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-xl">
                        {message.type === 'user' ? '👤' : '🤖'}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                          {message.text}
                        </p>
                        <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                          {message.type === 'ai' && message.isSpeaking && (
                            <span className="ml-2 text-blue-600">🔊 Speaking...</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={conversationEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4 rounded-b-lg">
          {/* Mode toggle */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setMode('voice')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'voice'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🎤 Voice
              </button>
              <button
                onClick={() => setMode('text')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ⌨️ Text
              </button>
            </div>
          </div>

          {mode === 'voice' ? (
            // Voice input mode
            <div className="flex flex-col items-center">
              {isListening && (
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-red-600 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 40 + 20}px`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    ></div>
                  ))}
                </div>
              )}
              <button
                onClick={handleVoiceToggle}
                disabled={!isConnected}
                className={`px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{isListening ? '⏹️' : '🎤'}</span>
                  <span>{isListening ? 'Stop Recording' : 'Press & Hold to Speak'}</span>
                </span>
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Powered by Whisper + Llama 3.1 + Coqui TTS
              </p>
            </div>
          ) : (
            // Text input mode
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!isConnected || !textInput.trim() || isProcessing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChatModal;
