import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import '../../index.css';
import apiClient from '../../services/api';

const Assessment = () => {
  const navigate = useNavigate();
  const { courseId, assessmentId } = useParams();

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState([]);

  // ── Fetch assessment ──────────────────────────────────────────
  useEffect(() => {
  const fetchAssessment = async () => {
    try {
      // assessmentId is actually the lesson ID
      const lessonId = parseInt(assessmentId);

      if (isNaN(lessonId)) {
        setError('Invalid assessment. Please go back and try again.');
        setLoading(false);
        return;
      }

      const res = await apiClient.get(`/api/v1/assessments/${lessonId}`);
      setAssessment(res.data);
    } catch (err) {
      setError('Failed to load assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  fetchAssessment();
}, [assessmentId]);
  // ── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalQuestions = assessment?.questions?.length || 0;
  const currentQ = assessment?.questions?.[currentQuestion];
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  const handleSelectAnswer = (value) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      if (!completedQuestions.includes(currentQuestion)) {
        setCompletedQuestions(prev => [...prev, currentQuestion]);
      }
      setCurrentQuestion(q => q + 1);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(q => q - 1);
      setShowHint(false);
    }
  };

  const handleSubmit = async () => {
  setSubmitting(true);
  const lessonId = parseInt(assessmentId);
  try {
    const answersPayload = {};
    Object.entries(selectedAnswers).forEach(([qId, val]) => {
      answersPayload[String(qId)] = val;
    });

    await apiClient.post(`/api/v1/assessments/${lessonId}/submit`, {
      answers: answersPayload,
      time_spent_seconds: timeElapsed,
    });

    navigate(`/learner/courses/${courseId}/assessments/${lessonId}/results`);
  } catch (err) {
    alert('Submission failed. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading assessment...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-slate-200 max-w-md">
        <span className="material-symbols-outlined text-red-500 text-5xl mb-4 block">error</span>
        <p className="text-slate-700 font-medium mb-4">{error}</p>
        <button onClick={() => navigate(`/learner/courses/${courseId}`)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          Back to Course
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/10 p-2 rounded-lg text-blue-600">
                <span className="material-symbols-outlined block">quiz</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{assessment?.title}</h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{assessment?.module_title}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-slate-500 font-medium">Progress</span>
                <span className="text-sm font-bold text-slate-900">{currentQuestion + 1} of {totalQuestions} Questions</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <span className="material-symbols-outlined text-blue-600 text-xl">timer</span>
                <span className="text-lg font-bold tabular-nums text-slate-900">{formatTime(timeElapsed)}</span>
              </div>
              <button onClick={() => navigate(`/learner/courses/${courseId}`)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm">
                Save & Exit
              </button>
              <ProfileDropdown userName={userName} userEmail={userEmail} />
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-12 flex gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Question {currentQuestion + 1}</h2>
            <button onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-blue-600 bg-blue-600/10 hover:bg-blue-600/20 px-4 py-2 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          </div>

          {/* Hint */}
          {showHint && currentQ?.hint && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-xl">info</span>
              <div>
                <p className="font-semibold text-amber-900 mb-1">Hint</p>
                <p className="text-sm text-amber-800" dangerouslySetInnerHTML={{ __html: currentQ.hint }}></p>
              </div>
            </div>
          )}

          {/* Question */}
          {currentQ && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-8">
                <p className="text-lg leading-relaxed mb-6 text-slate-900">{currentQ.text}</p>
                {currentQ.code && (
                  <div className="bg-slate-900 p-6 rounded-lg mb-8 relative group">
                    <pre className="text-sm leading-relaxed text-slate-200"><code>{currentQ.code}</code></pre>
                    <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200">
                      <span className="material-symbols-outlined">content_copy</span>
                    </button>
                  </div>
                )}
                <div className="space-y-4">
                  {currentQ.answers?.map((answer, idx) => (
                    <label key={idx} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedAnswers[currentQ.id] === answer.value
                        ? 'border-blue-600 bg-blue-600/5'
                        : 'border-slate-100 hover:border-blue-600/50'
                    }`}>
                      <input type="radio" name={`q-${currentQ.id}`} className="w-5 h-5 text-blue-600"
                        checked={selectedAnswers[currentQ.id] === answer.value}
                        onChange={() => handleSelectAnswer(answer.value)} />
                      <span className={`ml-4 ${selectedAnswers[currentQ.id] === answer.value ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {answer.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 flex-wrap gap-4">
            <button onClick={handlePrevious} disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined">arrow_back</span>Previous
            </button>

            {/* Question dots */}
            <div className="hidden md:flex items-center gap-2">
              {assessment?.questions?.map((_, idx) => (
                <button key={idx} onClick={() => { setCurrentQuestion(idx); setShowHint(false); }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${
                    idx === currentQuestion ? 'border-blue-600 bg-blue-600/10 text-blue-600' :
                    completedQuestions.includes(idx) ? 'border-blue-600 bg-blue-600 text-white' :
                    selectedAnswers[assessment.questions[idx]?.id] ? 'border-green-500 bg-green-50 text-green-700' :
                    'border-slate-200 text-slate-400 hover:border-blue-600'
                  }`}>
                  {completedQuestions.includes(idx) && idx !== currentQuestion
                    ? <span className="material-symbols-outlined text-sm">check</span>
                    : idx + 1}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {currentQuestion < totalQuestions - 1 ? (
                <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg transition-all">
                  Next Question<span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-60">
                  {submitting
                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Submitting...</>
                    : <><span className="material-symbols-outlined">check_circle</span>Submit Quiz</>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 hidden xl:block">
          <div className="sticky top-32 space-y-6">
            {/* AI Tutor Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-xl shadow-blue-600/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <h3 className="font-bold">AI Tutor</h3>
              </div>
              <p className="text-sm text-blue-50 leading-relaxed mb-6">
                {assessment?.ai_tutor_prompt || "Need help? Ask me to explain any concept without giving away the answer!"}
              </p>
              <button onClick={() => setShowAIDrawer(true)}
                className="w-full bg-white text-blue-600 py-3 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">chat_bubble</span>Ask AI Assistant
              </button>
            </div>

            {/* Quick Tip */}
            {assessment?.quick_tip && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-900">
                  <span className="material-symbols-outlined text-blue-600">info</span>Quick Tip
                </h4>
                <p className="text-sm text-slate-600 italic">{assessment.quick_tip}</p>
              </div>
            )}

            {/* Progress visual */}
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 relative mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-slate-200" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-blue-600" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (Object.keys(selectedAnswers).length / Math.max(totalQuestions, 1)))}
                    strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-slate-900">
                  {totalQuestions > 0 ? Math.round((Object.keys(selectedAnswers).length / totalQuestions) * 100) : 0}%
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">Answered</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 xl:hidden z-40">
        <button onClick={() => setShowAIDrawer(true)} className="bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
          <span className="material-symbols-outlined">smart_toy</span>
        </button>
      </div>

      {/* AI Drawer */}
      {showAIDrawer && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 xl:hidden" onClick={() => setShowAIDrawer(false)}></div>
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 z-[60] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600">smart_toy</span>
                <h3 className="font-bold text-slate-900">AI Learning Assistant</h3>
              </div>
              <button onClick={() => setShowAIDrawer(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="bg-slate-100 p-4 rounded-lg text-sm max-w-[80%] text-slate-900">
                How can I help you understand this question?
              </div>
              <div className="bg-blue-600 text-white p-4 rounded-lg text-sm max-w-[80%] ml-auto">
                Can you explain this concept without giving the answer?
              </div>
              <div className="bg-slate-100 p-4 rounded-lg text-sm max-w-[80%] text-slate-900">
                AI chat integration coming soon — this will connect to a real LLM to help explain concepts without revealing answers.
              </div>
            </div>
            <div className="p-6 border-t border-slate-200">
              <div className="relative">
                <input className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
                  placeholder="Ask a question..." type="text" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Assessment;