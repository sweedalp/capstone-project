import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import LearnerSidebar from '../../components/LearnerSidebar';
import apiClient from '../../services/api';
import AIVideoSocket, {
  base64ToBlobUrl,
  downloadBlobUrl,
  downloadCompiledVideo,
  checkVideoAgentHealth,
} from '../../services/aiVideoWebSocket';
import '../../index.css';

const VIDEO_AGENT_BASE =
  import.meta.env.VITE_AI_VIDEO_API_URL || 'http://localhost:8002';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'tu', name: 'Tulu', native: 'ತುಳು', flag: '🇮🇳' },
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', icon: 'school', color: 'text-green-600 bg-green-100' },
  { value: 'intermediate', label: 'Intermediate', icon: 'psychology', color: 'text-blue-600 bg-blue-100' },
  { value: 'advanced', label: 'Advanced', icon: 'rocket_launch', color: 'text-purple-600 bg-purple-100' },
];

const AILearningHub = () => {
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';
  const firstName = userName.split(' ')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [streak, setStreak] = useState(0);
  const [revision, setRevision] = useState(null);
  const [videoLessons, setVideoLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExplainer, setShowExplainer] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [currentResponseId, setCurrentResponseId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const videoFullscreenRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const difficultyDropdownRef = useRef(null);
  const blobUrlsRef = useRef([]);
  const currentResponseIdRef = useRef(null);

  const notifications = [
    { id: 1, icon: 'schedule', iconColor: 'text-rose-600', iconBg: 'bg-rose-100', title: 'Quiz Due Soon', message: 'Deadline tomorrow at 11:59 PM', time: '2 hours ago', unread: true },
    { id: 2, icon: 'military_tech', iconColor: 'text-amber-600', iconBg: 'bg-amber-100', title: 'New Badge Earned!', message: 'You earned "Python Master" badge', time: '5 hours ago', unread: true },
    { id: 3, icon: 'psychology', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'AI Summary Ready', message: 'Study session recap available', time: 'Yesterday', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const fetchHub = async () => {
      try {
        const res = await apiClient.get('/api/v1/ai-hub/');
        setStreak(res.data.daily_streak || 0);
        setRevision(res.data.revision_assistant || null);
        setVideoLessons(res.data.video_lessons || []);
        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error('AI Hub load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHub();
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target)) {
        setShowLanguageDropdown(false);
      }
      if (difficultyDropdownRef.current && !difficultyDropdownRef.current.contains(e.target)) {
        setShowDifficultyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isGenerating, statusText]);

  useEffect(() => {
    currentResponseIdRef.current = currentResponseId;
  }, [currentResponseId]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      socketRef.current?.disconnect();
    };
  }, []);

  const trackBlobUrl = useCallback((url) => {
    if (url) blobUrlsRef.current.push(url);
  }, []);

  const handleWsText = useCallback((content) => {
    const rid = currentResponseIdRef.current;
    if (!rid) return;
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === rid ? { ...m, text: (m.text || '') + content } : m
      )
    );
  }, []);

  const handleWsScene = useCallback((sceneData) => {
    const rid = currentResponseIdRef.current;
    if (!rid) return;
    const videoUrl = base64ToBlobUrl(sceneData.video_base64);
    trackBlobUrl(videoUrl);
    const scene = {
      sceneNumber: sceneData.scene_number,
      totalScenes: sceneData.total_scenes,
      title: sceneData.title || '',
      narration: sceneData.narration || '',
      duration: sceneData.duration,
      sizeKb: sceneData.size_kb,
      sceneType: sceneData.scene_type || '',
      animationType: sceneData.animation_type || '',
      videoUrl,
    };
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === rid ? { ...m, scenes: [...(m.scenes || []), scene] } : m
      )
    );
  }, [trackBlobUrl]);

  const handleWsStatus = useCallback((data) => {
    setStatusText(data.message || data.stage || 'Processing...');
  }, []);

  const handleWsComplete = useCallback((data) => {
    const rid = currentResponseIdRef.current;
    setIsGenerating(false);
    setStatusText('');
    if (rid) {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === rid
            ? {
                ...m,
                status: 'complete',
                downloadUrl: data.download_url || null,
                compiledVideoUrl: data.video_url ? `${VIDEO_AGENT_BASE}${data.video_url}` : null,
                totalDuration: data.total_duration,
                processingTime: data.processing_time,
                totalScenes: data.total_scenes,
                interactiveElements: data.interactive_elements || [],
                practice: data.practice || null,
              }
            : m
        )
      );
    }
    setCurrentResponseId(null);
  }, []);

  const handleWsError = useCallback((data) => {
    const errorMsg = data?.message || data?.toString?.() || 'Unknown error';
    setIsGenerating(false);
    setStatusText('');
    const rid = currentResponseIdRef.current;
    if (rid) {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === rid ? { ...m, status: 'error', text: errorMsg } : m
        )
      );
      setCurrentResponseId(null);
    } else {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          role: 'system',
          text: errorMsg,
          status: 'error',
          timestamp: new Date(),
        },
      ]);
    }
  }, []);
  const handleStartSession = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const health = await checkVideoAgentHealth();
      if (health.status === 'unreachable') {
        throw new Error('AI Video Agent is not running. Start it on port 8002.');
      }
      const socket = new AIVideoSocket();
      socketRef.current = socket;
      await socket.connect({
        onConnected: () => {
          setIsConnected(true);
          setIsConnecting(false);
          setChatMessages([
            {
              id: `welcome_${Date.now()}`,
              role: 'assistant',
              text: getWelcomeMessage(selectedLanguage),
              scenes: [],
              status: 'complete',
              timestamp: new Date(),
            },
          ]);
          setTimeout(() => chatInputRef.current?.focus(), 200);
        },
        onClose: () => {
          setIsConnected(false);
          setIsGenerating(false);
          setStatusText('');
          setChatMessages((prev) => [
            ...prev,
            {
              id: `sys_${Date.now()}`,
              role: 'system',
              text: 'Connection closed.',
              status: 'complete',
              timestamp: new Date(),
            },
          ]);
        },
        onError: (err) => handleWsError(err),
        onText: (content) => handleWsText(content),
        onScene: (data) => handleWsScene(data),
        onStatus: (data) => handleWsStatus(data),
        onComplete: (data) => handleWsComplete(data),
        onCleared: () => {
          setChatMessages([
            {
              id: `sys_${Date.now()}`,
              role: 'system',
              text: 'Chat cleared!',
              status: 'complete',
              timestamp: new Date(),
            },
          ]);
        },
        onDifficultyChanged: (data) => {
          setDifficulty(data.difficulty);
          setChatMessages((prev) => [
            ...prev,
            {
              id: `sys_${Date.now()}`,
              role: 'system',
              text: data.message,
              status: 'complete',
              timestamp: new Date(),
            },
          ]);
        },
      });
    } catch (err) {
      setIsConnecting(false);
      setConnectionError(err.message || 'Failed to connect');
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'system',
          text: err.message || 'Connection failed.',
          status: 'error',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleEndSession = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
    setIsGenerating(false);
    setStatusText('');
    setCurrentResponseId(null);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text || !isConnected || isGenerating) return;
    const userMsgId = `user_${Date.now()}`;
    setChatMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        text,
        timestamp: new Date(),
        status: 'complete',
      },
    ]);
    const assistantId = `asst_${Date.now()}`;
    setCurrentResponseId(assistantId);
    setChatMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        text: '',
        scenes: [],
        status: 'streaming',
        timestamp: new Date(),
        downloadUrl: null,
        compiledVideoUrl: null,
        interactiveElements: [],
        practice: null,
      },
    ]);
    setChatInput('');
    setIsGenerating(true);
    setStatusText('Sending to AI agent...');
    const sent = socketRef.current?.sendMessage(text, selectedLanguage, difficulty);
    if (!sent) {
      setIsGenerating(false);
      setStatusText('');
      handleWsError({ message: 'WebSocket not connected' });
    }
  };

  const handleInteractiveClick = (sceneNumber, elementId) => {
    if (!isConnected || isGenerating) return;
    const assistantId = `asst_ic_${Date.now()}`;
    setCurrentResponseId(assistantId);
    setChatMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        text: '',
        scenes: [],
        status: 'streaming',
        timestamp: new Date(),
      },
    ]);
    setIsGenerating(true);
    setStatusText('Processing interaction...');
    socketRef.current?.sendInteractiveClick(sceneNumber, elementId, selectedLanguage);
  };

  const handleDifficultyChange = (level) => {
    setDifficulty(level);
    setShowDifficultyDropdown(false);
    if (isConnected) {
      socketRef.current?.setDifficulty(level);
    }
  };

  const handleClearChat = () => {
    if (isConnected) {
      socketRef.current?.clearChat();
    }
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];
    setChatMessages([]);
    setPracticeAnswers({});
  };

  const openFullscreen = (videoUrl, title) => {
    setFullscreenVideo({ url: videoUrl, title: title || 'AI Video' });
  };

  const closeFullscreen = () => setFullscreenVideo(null);

  const enterNativeFullscreen = () => {
    const el = videoFullscreenRef.current;
    if (el?.requestFullscreen) el.requestFullscreen();
    else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const handleDownloadScene = (videoUrl, title, sceneNum) => {
    downloadBlobUrl(
      videoUrl,
      `${(title || 'scene').replace(/[^a-zA-Z0-9]/g, '_')}_scene${sceneNum}_${selectedLanguage}.mp4`
    );
  };

  const handleDownloadFull = (downloadPath) => {
    downloadCompiledVideo(downloadPath, `explainer_${selectedLanguage}.mp4`);
  };

  const handlePracticeSelect = (messageId, option) => {
    setPracticeAnswers((prev) => ({ ...prev, [messageId]: option }));
  };

  const getPracticeSelected = (messageId) => practiceAnswers[messageId];

  const getWelcomeMessage = (langCode) => {
    const msgs = {
      en: `Hi ${firstName}! 👋 I'm your AI Video Explainer. Ask me anything and I'll create an animated video explanation.\n\nTry: "Explain how Python lists work"`,
      ta: `வணக்கம் ${firstName}! 👋 நான் உங்கள் AI விளையாட்டு விவரிப்பாளர். எதையும் கேளுங்கள்!`,
      te: `నమస్కారం ${firstName}! 👋 నేను మీ AI వీడియో వివరణకర్త. ఏదైనా అడగండి!`,
      kn: `ನಮಸ್ಕಾರ ${firstName}! 👋 ನಾನು ನಿಮ್ಮ AI ವೀಡಿಯೋ ವಿವರಕಾರ. ಏನಾದರೂ ಕೇಳಿ!`,
      ml: `നമസ്കാരം ${firstName}! 👋 ഞാൻ നിങ്ങളുടെ AI വീഡിയോ വിശദീകരിക്കുന്നയാളാണ്.`,
      tu: `ನಮಸ್ಕಾರ ${firstName}! 👋 ನಾನು ನಿಮ್ಮ AI ವೀಡಿಯೋ ವಿವರಕಾರ.`,
    };
    return msgs[langCode] || msgs.en;
  };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage);
  const currentDiff = DIFFICULTY_LEVELS.find((d) => d.value === difficulty);
  const currentDiffTextColor = currentDiff?.color?.split(' ')[0] || 'text-blue-600';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/learner/search', { state: { query: searchQuery } });
    }
  };

  const handleStartReviewSession = () => {
    if (revision?.has_data) {
      navigate('/learner/revision', {
        state: {
          topic: revision.topic,
          quizScore: revision.score,
          lessonId: revision.focus_lesson?.lesson_id,
        },
      });
    }
  };

  const getLessonTypeIcon = (t) => {
    if (t === 'video') return 'play_circle';
    if (t === 'audio') return 'headphones';
    if (t === 'quiz') return 'quiz';
    return 'article';
  };

  const getLessonTypeBg = (t) => {
    if (t === 'video') return 'bg-blue-100 text-blue-600';
    if (t === 'audio') return 'bg-purple-100 text-purple-600';
    if (t === 'quiz') return 'bg-green-100 text-green-600';
    return 'bg-slate-100 text-slate-600';
  };
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <LearnerSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full group">
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 z-10">search</button>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm"
                placeholder="Search courses, concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <button
              onClick={() => setShowExplainer(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-[18px]">movie</span>
              <span>AI Video</span>
            </button>
            {/* < button
              onClick={() => navigate('/learner/ai-hub', { state: { openChat: true } })}
              className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Ask AI</span>
            </button> */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-[9999] max-h-[500px] flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Notifications</h3>
                      {unreadCount > 0 && <p className="text-xs text-slate-500">{unreadCount} unread</p>}
                    </div>
                    <button onClick={() => setShowNotifications(false)}>
                      <span className="material-symbols-outlined text-lg text-slate-400">close</span>
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 ${n.unread ? 'bg-blue-50/50' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 ${n.iconBg} rounded-full flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-lg ${n.iconColor}`}>{n.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-1">{n.title}</p>
                            <p className="text-xs text-slate-600 line-clamp-1">{n.message}</p>
                            <p className="text-xs text-slate-400">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{userName}</p>
                <p className="text-[10px] text-slate-500 uppercase">Pro {userRole}</p>
              </div>
              <ProfileDropdown userName={userName} userEmail={userEmail} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 px-10 py-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h1 className="text-slate-900 text-4xl font-black tracking-tight mb-2">Welcome back, {firstName}</h1>
              <p className="text-slate-500 text-lg">Your personalized learning path for today is ready.</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Streak</span>
              <span className="text-xl font-bold text-slate-900 flex items-center gap-1">
                {loading ? '...' : `${streak} Days`}
                <span className="material-symbols-outlined text-orange-500 text-[20px]">local_fire_department</span>
              </span>
            </div>
          </div>

          <div className="mb-12">
            <div
              onClick={() => setShowExplainer(true)}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 cursor-pointer group hover:shadow-2xl hover:shadow-purple-600/20 transition-all"
            >
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">movie</span>
                  </div>
                  <div>
                    <h2 className="text-white text-2xl font-black mb-1">AI Video Explainer</h2>
                    <p className="text-white/80 text-sm max-w-md">Ask any question and get an AI-generated animated video explanation.</p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-slate-900 text-xl font-bold mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">psychology</span>
              Personalized Revision Assistant
            </h2>
            {loading ? (
              <div className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
            ) : revision?.has_data ? (
              <div className="relative overflow-hidden rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col md:flex-row items-stretch bg-gradient-to-r from-white to-blue-600/5 rounded-lg overflow-hidden">
                  <div className="flex-[1.5] p-8 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold mb-4 w-fit">
                      <span className="material-symbols-outlined text-xs">bolt</span>
                      AI RECOMMENDATION
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-3">Mastering {revision.topic}</h3>
                    <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                      Based on your recent quiz score ({Math.round(revision.score)}%), we've identified gaps. Let's fix that.
                    </p>
                    <div className="flex gap-4 flex-wrap">
                      <button
                        onClick={handleStartReviewSession}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all"
                      >
                        <span className="material-symbols-outlined">auto_fix_high</span>
                        Start Review Session
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center min-h-[200px]">
                    <span className="material-symbols-outlined text-blue-300 text-[100px]">psychology</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">quiz</span>
                <p className="text-slate-500 font-medium">Complete a quiz to get personalized revision recommendations.</p>
                <button
                  onClick={() => navigate('/learner/courses')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">play_circle</span>
                Video Explainers
              </h2>
              <button onClick={() => navigate('/learner/courses')} className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                View All
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
            {loading ? (
              <div className="flex gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-none w-72 h-48 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
                ))}
              </div>
            ) : videoLessons.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
                {videoLessons.map((video) => (
                  <div key={video.lesson_id} className="flex-none w-72 snap-start group">
                    <div
                      onClick={() => navigate(video.url)}
                      className="relative aspect-video rounded-xl overflow-hidden mb-3 cursor-pointer bg-gradient-to-br from-blue-100 to-blue-200"
                    >
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur rounded-full size-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                          <span className="material-symbols-outlined text-blue-600">play_arrow</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-300 text-[60px]">play_circle</span>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded">{video.duration_minutes}m</div>
                    </div>
                    <h4 onClick={() => navigate(video.url)} className="font-bold text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors cursor-pointer">{video.title}</h4>
                    <p className="text-slate-500 text-xs">{video.course_title} • {video.module_title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">play_circle</span>
                <p className="text-slate-500">Enroll in courses with video lessons to see them here.</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {showExplainer && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-lg">movie</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">AI Video Explainer</h2>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    <span className="text-[11px] text-slate-500">
                      {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative" ref={languageDropdownRef}>
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:border-blue-400 transition-colors disabled:opacity-50"
                  >
                    <span className="text-base">{currentLang?.flag}</span>
                    <span className="text-slate-700 hidden sm:inline">{currentLang?.name}</span>
                    <span className="material-symbols-outlined text-slate-400 text-[14px]">expand_more</span>
                  </button>
                  {showLanguageDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1">
                      <div className="px-3 py-1.5 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Language</p>
                      </div>
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setSelectedLanguage(lang.code); setShowLanguageDropdown(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-blue-50 ${selectedLanguage === lang.code ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <p className="font-semibold">{lang.name}</p>
                            <p className="text-[10px] text-slate-400">{lang.native}</p>
                          </div>
                          {selectedLanguage === lang.code && (
                            <span className="material-symbols-outlined text-blue-600 text-[16px]">check_circle</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative" ref={difficultyDropdownRef}>
                  <button
                    onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
                    disabled={isGenerating}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 transition-colors disabled:opacity-50 ${currentDiff?.color}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{currentDiff?.icon}</span>
                    <span className="hidden sm:inline">{currentDiff?.label}</span>
                  </button>
                  {showDifficultyDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1">
                      {DIFFICULTY_LEVELS.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => handleDifficultyChange(d.value)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${difficulty === d.value ? 'bg-blue-50' : ''}`}
                        >
                          <span className={`material-symbols-outlined text-[18px] ${d.color.split(' ')[0]}`}>{d.icon}</span>
                          <span className="font-medium">{d.label}</span>
                          {difficulty === d.value && (
                            <span className="material-symbols-outlined text-blue-600 text-[16px] ml-auto">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isConnected && (
                  <button
                    onClick={handleClearChat}
                    disabled={isGenerating}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    title="Clear chat"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                  </button>
                )}
                {!isConnected ? (
                  <button
                    onClick={handleStartSession}
                    disabled={isConnecting}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-green-600/20 disabled:shadow-none"
                  >
                    {isConnecting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
                        Start
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleEndSession}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-bold text-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                    End
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isConnected) {
                      if (window.confirm('End session and close?')) {
                        handleEndSession();
                        setShowExplainer(false);
                      }
                    } else {
                      setShowExplainer(false);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
              {chatMessages.length === 0 && !isConnected ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-purple-500 text-4xl">movie</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">AI Video Explainer</h3>
                  <p className="text-slate-500 max-w-md mb-6 text-sm">Ask any question and get a personalized animated video explanation.</p>
                  {connectionError && (
                    <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      {connectionError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                    {[
                      'Explain how Python lists work',
                      'What is machine learning?',
                      'How does the internet work?',
                      'Explain recursion simply',
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => { setChatInput(example); if (!isConnected) handleStartSession(); }}
                        className="text-left p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-purple-300 hover:bg-purple-50 transition-all"
                      >
                        <span className="material-symbols-outlined text-purple-400 text-[14px] mr-1">arrow_forward</span>
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5 max-w-3xl mx-auto">
                  {chatMessages.map((msg) => (
                    <div key={msg.id}>
                      {msg.role === 'system' && (
                        <div className="flex justify-center">
                          <span className={`text-xs px-4 py-1.5 rounded-full font-medium ${msg.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
                            {msg.text}
                          </span>
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <div className="flex justify-end">
                          <div className="max-w-[75%]">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-2xl rounded-br-md shadow-lg">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                          </div>
                        </div>
                      )}
                      {msg.role === 'assistant' && (
                        <div className="flex justify-start">
                          <div className="max-w-[90%] w-full">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                {msg.text && (
                                  <div className={`bg-white px-5 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-200 mb-3 ${msg.status === 'error' ? 'border-red-200 bg-red-50' : ''}`}>
                                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.status === 'error' ? 'text-red-600' : 'text-slate-700'}`}>{msg.text}</p>
                                  </div>
                                )}
                                {msg.status === 'streaming' && !msg.text && (
                                  <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-200 mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                      </div>
                                      <span className="text-xs text-slate-400">Thinking...</span>
                                    </div>
                                  </div>
                                )}
                                {msg.compiledVideoUrl ? (
                                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-purple-600 text-[16px]">movie</span>
                                        <span className="text-xs font-bold text-slate-700">Final AI Video</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                        {msg.totalScenes && <span>{msg.totalScenes} scenes</span>}
                                        {msg.totalDuration && <span>• {Number(msg.totalDuration).toFixed(1)}s</span>}
                                      </div>
                                    </div>
                                    <div className="relative bg-black aspect-video">
                                      <video src={msg.compiledVideoUrl} className="w-full h-full object-contain" controls preload="metadata" />
                                    </div>
                                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-1">
                                      <button onClick={() => openFullscreen(msg.compiledVideoUrl, 'Final AI Video')} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Fullscreen">
                                        <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                                      </button>
                                      {msg.downloadUrl && (
                                        <button onClick={() => handleDownloadFull(msg.downloadUrl)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                                          <span className="material-symbols-outlined text-[18px]">download</span>
                                        </button>
                                      )}
                                    </div>
                                    {msg.scenes?.length > 0 && (
                                      <details className="border-t border-slate-100">
                                        <summary className="px-4 py-3 text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-50">View individual scenes</summary>
                                        <div className="p-3 space-y-3 bg-slate-50">
                                          {msg.scenes.map((scene, idx) => (
                                            <div key={idx} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                              <div className="px-3 py-2 text-xs font-bold text-slate-600 border-b border-slate-100">Scene {scene.sceneNumber}</div>
                                              <video src={scene.videoUrl} className="w-full" controls />
                                            </div>
                                          ))}
                                        </div>
                                      </details>
                                    )}
                                  </div>
                                ) : msg.scenes?.length > 0 ? (
                                  <div className="space-y-3">
                                    {msg.scenes.map((scene, idx) => (
                                      <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-purple-600 text-[16px]">movie</span>
                                            <span className="text-xs font-bold text-slate-700">
                                              Scene {scene.sceneNumber}{scene.totalScenes > 1 ? ` / ${scene.totalScenes}` : ''}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="relative bg-black aspect-video">
                                          <video src={scene.videoUrl} className="w-full h-full object-contain" controls preload="metadata" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                                {msg.interactiveElements?.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Click to explore:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {msg.interactiveElements.map((el, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => handleInteractiveClick(el.scene_number || 1, el.id || el.element_id || `el_${idx}`)}
                                          disabled={isGenerating || !isConnected}
                                          className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium hover:bg-purple-100 disabled:opacity-40"
                                        >
                                          <span className="material-symbols-outlined text-[14px] mr-1 align-middle">touch_app</span>
                                          {el.label || el.text || el.id}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {msg.practice && (
                                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="material-symbols-outlined text-amber-600 text-[18px]">quiz</span>
                                      <span className="text-sm font-bold text-amber-800">Practice Question</span>
                                    </div>
                                    <p className="text-sm text-amber-900 mb-3">{msg.practice.question}</p>
                                    {msg.practice.options && (
                                      <div className="space-y-2">
                                        {msg.practice.options.map((opt, idx) => {
                                          const selected = getPracticeSelected(msg.id) === opt;
                                          return (
                                            <button
                                              key={idx}
                                              onClick={() => handlePracticeSelect(msg.id, opt)}
                                              className={`w-full text-left px-3 py-2 border rounded-lg text-sm transition-colors ${selected ? 'bg-amber-200 border-amber-400 text-amber-900' : 'bg-white border-amber-200 hover:bg-amber-100'}`}
                                            >
                                              {opt}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {getPracticeSelected(msg.id) && (
                                      <p className="text-xs text-amber-700 mt-3">
                                        Selected: <span className="font-bold">{getPracticeSelected(msg.id)}</span>
                                      </p>
                                    )}
                                  </div>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1">{formatTime(msg.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isGenerating && statusText && (
                    <div className="flex justify-start">
                      <div className="max-w-[90%]">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                            <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
                          </div>
                          <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex gap-1">
                                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                              </div>
                              <span className="text-sm text-slate-500 font-medium">{statusText}</span>
                            </div>
                            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse w-2/3"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-white flex-shrink-0">
              {!isConnected && chatMessages.length > 0 ? (
                <div className="flex items-center justify-center gap-4 py-1">
                  <p className="text-sm text-slate-500">Session ended.</p>
                  <button
                    onClick={() => { setChatMessages([]); handleStartSession(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    New Session
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSendMessage}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-3 relative z-20"
                >
                  <div className="flex-1">
                    <textarea
                      ref={chatInputRef}
                      autoFocus
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!isGenerating && chatInput.trim()) {
                            handleSendMessage(e);
                          }
                        }
                      }}
                      placeholder={
                        isConnected
                          ? isGenerating
                            ? `You can keep typing in ${currentLang?.name} while AI generates...`
                            : `Ask anything in ${currentLang?.name}...`
                          : 'Click Start to connect...'
                      }
                      readOnly={!isConnected}
                      rows={2}
                      className="w-full resize-none px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      style={{ minHeight: '56px', maxHeight: '140px', pointerEvents: 'auto', userSelect: 'text', WebkitUserSelect: 'text' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isConnected || isGenerating || !chatInput.trim()}
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/20 disabled:shadow-none flex-shrink-0 self-end"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>
              )}
              {isConnected && (
                <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                  {currentLang?.flag}{' '}
                  <span className="font-bold text-purple-600">{currentLang?.name}</span> •{' '}
                  <span className={`font-bold ${currentDiffTextColor}`}>{currentDiff?.label}</span> • Enter to send
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {fullscreenVideo && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
            <h3 className="text-white font-bold text-sm">{fullscreenVideo.title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadScene(fullscreenVideo.url, fullscreenVideo.title, 1)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium backdrop-blur"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download
              </button>
              <button onClick={enterNativeFullscreen} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur" title="Native fullscreen">
                <span className="material-symbols-outlined text-[18px]">open_in_full</span>
              </button>
              <button onClick={closeFullscreen} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <video ref={videoFullscreenRef} src={fullscreenVideo.url} className="max-w-full max-h-full" controls autoPlay />
          </div>
        </div>
      )}
    </div>
  );
};

export default AILearningHub;