import { useCallback, useEffect, useRef, useState } from 'react';

const getVoiceWsUrl = () => {
  const envUrl = import.meta.env.VITE_VOICE_WS_URL;
  if (envUrl) return envUrl;
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  if (isLocal) return 'ws://localhost:8000/api/voice';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/voice`;
};

const detectSpeechLang = (text) => {
  if (!text) return 'en-US';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  return 'en-US';
};

const pickBestVoice = (voices, lang) => {
  if (!voices?.length) return null;
  const exact = voices.find(
    (v) => (v.lang || '').toLowerCase() === lang.toLowerCase()
  );
  if (exact) return exact;
  const prefix = lang.split('-')[0].toLowerCase();
  const partial = voices.find(
    (v) => (v.lang || '').toLowerCase().startsWith(prefix)
  );
  if (partial) return partial;
  const english = voices.find(
    (v) => (v.lang || '').toLowerCase().startsWith('en')
  );
  return english || voices[0] || null;
};

export default function useVoiceChat(isOpen) {
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);
  const mountedRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      if (!window.speechSynthesis) return;
      voicesRef.current = window.speechSynthesis.getVoices() || [];
    };
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speakText = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    const lang = detectSpeechLang(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    const voice = pickBestVoice(voicesRef.current, lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || lang;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) return;

    const wsUrl = getVoiceWsUrl();
    console.log('[VoiceChat] Connecting to', wsUrl);
    setConnecting(true);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      console.log('[VoiceChat] WebSocket opened');
      setConnected(true);
      setConnecting(false);
    };

    ws.onerror = (event) => {
      if (!mountedRef.current) return;
      console.error('[VoiceChat] WebSocket error:', event);
      setConnected(false);
      setConnecting(false);
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      console.log('[VoiceChat] WebSocket closed');
      setConnected(false);
      setConnecting(false);
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') return;
        if (data.type === 'pong') return;
        if (data.type === 'thinking') {
          setThinking(true);
          return;
        }
        if (data.type === 'cleared') {
          setMessages([]);
          setThinking(false);
          return;
        }
        if (data.type === 'response') {
          setThinking(false);
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', text: data.text || '' },
          ]);
          speakText(data.text || '');
          return;
        }
        if (data.type === 'error') {
          setThinking(false);
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: data.message || 'Voice chat error' },
          ]);
        }
      } catch (err) {
        console.error('[VoiceChat] Failed to parse message', err);
      }
    };
  }, [speakText]);

  const disconnect = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setConnected(false);
    setListening(false);
    setThinking(false);
    setTranscript('');
  }, []);

  const sendMessage = useCallback((text) => {
    const clean = (text || '').trim();
    if (!clean) return false;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'Voice chat is not connected.' },
      ]);
      return false;
    }
    setMessages((prev) => [...prev, { role: 'user', text: clean }]);
    wsRef.current.send(
      JSON.stringify({
        type: 'message',
        text: clean,
      })
    );
    return true;
  }, []);

  const clearConversation = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'clear' }));
    }
    setMessages([]);
    setTranscript('');
    setThinking(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser');
      return;
    }
    if (!connected) {
      alert('Voice chat is not connected');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }
      setTranscript(finalText || interimText);
      if (finalText.trim()) {
        sendMessage(finalText.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('[VoiceChat] Speech recognition error:', event);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [connected, sendMessage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setListening(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [isOpen, connect, disconnect]);

  return {
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
  };
}