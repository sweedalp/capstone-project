import React, { useEffect, useRef, useState } from 'react';
import useVoiceChat from '../hooks/useVoiceChat';

const VoiceChatModal = ({ isOpen, onClose }) => {
  const [textInput, setTextInput] = useState('');
  const inputRef = useRef(null);

  const {
    messages,
    connected,
    connecting,
    listening,
    thinking,
    transcript,
    sendMessage,
    clearConversation,
    startListening,
    stopListening,
  } = useVoiceChat(isOpen);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    const value = textInput.trim();
    if (!value) return;
    sendMessage(value);
    setTextInput('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Voice AI Tutor</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected
                    ? 'bg-green-500'
                    : connecting
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-400'
                }`}
              ></span>
              <span className="text-xs text-slate-500">
                {connected ? 'Connected' : connecting ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-indigo-600 text-3xl">graphic_eq</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Talk to your lesson</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Ask questions by voice or text. The AI will answer only from this lesson's summary and transcript.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : msg.role === 'assistant'
                      ? 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-md text-sm text-slate-500">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-white space-y-3">
          {transcript && listening && (
            <div className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
              Listening: {transcript}
            </div>
          )}

          <div className="flex items-center gap-2">
            {!listening ? (
              <button
                onClick={startListening}
                disabled={!connected}
                className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">mic</span>
                Start Talking
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">stop</span>
                Stop
              </button>
            )}
            <button
              onClick={clearConversation}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm"
            >
              Clear
            </button>
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend(e);
                }
              }}
              placeholder="Type your question..."
              autoFocus
              className="flex-1 px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              style={{ pointerEvents: 'auto' }}
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatModal;