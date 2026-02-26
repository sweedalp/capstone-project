import { useState, useEffect, useRef } from 'react';
import useVoiceChat from '../hooks/useVoiceChat';

/**
 * VoiceAIDrawer - Header-triggered voice AI assistant drawer
 * 
 * Opens from the header navigation (🎤 button)
 * Matches the exact design specification with:
 * - Listening state indicator
 * - "You said" section
 * - AI response with audio playback
 * - Related content suggestions
 * - Text mode fallback
 * 
 * User Stories: Learner #6, #7
 */
const VoiceAIDrawer = ({ isOpen, onClose, courseContext = null, userProfile = null }) => {
  const [textInput, setTextInput] = useState('');
  const [textMode, setTextMode] = useState(false);
  const [relatedContent, setRelatedContent] = useState([]);
  const drawerRef = useRef(null);

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
    resetError,
    audioElementRef
  } = useVoiceChat({
    wsUrl: 'wss://localhost:8000/api/voice',
    context: {
      courseId: courseContext?.courseId,
      lessonId: courseContext?.lessonId,
      language: 'en'
    }
  });

  // Mock related content based on query
  useEffect(() => {
    if (transcription) {
      // Simulate related content retrieval
      const mockContent = [
        {
          title: 'Functions Tutorial',
          type: 'Lesson',
          course: 'Python 101',
          icon: '📚'
        },
        {
          title: 'Video Explainer: Functions',
          type: 'Video',
          duration: '8:30',
          icon: '🎬'
        },
        {
          title: 'Interactive Walkthrough',
          type: 'Guide',
          steps: '12 steps',
          icon: '🧭'
        }
      ];
      setRelatedContent(mockContent);
    }
  }, [transcription]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setTextMode(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  const handlePlayAudio = () => {
    if (audioElementRef.current) {
      if (audioElementRef.current.paused) {
        audioElementRef.current.play();
      } else {
        audioElementRef.current.pause();
      }
    }
  };

  const handleEndSession = () => {
    if (isListening) {
      stopListening();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎤</span>
              <h2 className="text-xl font-bold">AI Learning Assistant</h2>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Connected • {latency}ms</span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 bg-red-400 rounded-full"></span>
                <span>Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <button
                    onClick={resetError}
                    className="text-sm text-red-700 underline mt-2"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Listening State */}
          {isListening && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-lg font-bold text-red-700">Listening...</span>
              </div>
              <button 
                onClick={handleVoiceToggle}
                className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg transition-all transform hover:scale-105"
                aria-label="Stop listening"
              >
                ●
              </button>
              <p className="text-sm text-gray-600 mt-4">Press to stop</p>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm font-semibold text-blue-800">AI is responding... 🤖</p>
            </div>
          )}

          {/* You Said Section */}
          {transcription && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">You said:</p>
              <p className="text-base text-gray-800">&ldquo;{transcription}&rdquo;</p>
            </div>
          )}

          {/* AI Response Section */}
          {aiResponse && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  💬 Response:
                  {isSpeaking && (
                    <span className="inline-flex items-center gap-1 text-green-600 animate-pulse">
                      🔊 Speaking...
                    </span>
                  )}
                </p>
                <p className="text-base text-gray-800 leading-relaxed mb-4">
                  {aiResponse}
                </p>

                {/* Audio Controls */}
                <div className="flex gap-3">
                  <button
                    onClick={handlePlayAudio}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {isSpeaking ? (
                      <>
                        <span>⏸</span>
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <span>▶</span>
                        <span>Play Audio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Related Content Section */}
              {relatedContent.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">📚 Related Content:</p>
                  <div className="space-y-2">
                    {relatedContent.map((content, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{content.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                              {content.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {content.type} • {content.course || content.duration || content.steps}
                            </p>
                          </div>
                          <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!transcription && !isListening && !isProcessing && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎤</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Ask me anything about your courses
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Press the microphone button and speak your question
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
                <span className="px-3 py-1 bg-gray-100 rounded-full">Real-time responses</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">Context-aware</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">Multi-language</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Input Controls */}
        <div className="border-t bg-white p-6 sticky bottom-0">
          {textMode ? (
            // Text Input Mode
            <form onSubmit={handleTextSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected || isProcessing}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!isConnected || !textInput.trim() || isProcessing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          ) : (
            // Voice Input Mode
            <div className="space-y-3">
              <button
                onClick={handleVoiceToggle}
                disabled={!isConnected}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <span className="text-2xl">{isListening ? '⏹' : '●'}</span>
                <span>{isListening ? 'Stop Recording' : 'Press to speak'}</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setTextMode(!textMode)}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {textMode ? '🎤 Switch to Voice' : '⌨️ Switch to Text'}
            </button>
            <button
              onClick={handleEndSession}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              End Session
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            Powered by Whisper + Llama + Coqui TTS
          </p>
        </div>
      </div>
    </>
  );
};

export default VoiceAIDrawer;
