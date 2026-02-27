import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerProfileDropdown from './TrainerProfileDropdown';
import apiClient from '../../services/api';

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

const Toggle = ({ checked, onChange }) => (
  <label className="inline-flex relative items-center cursor-pointer flex-shrink-0">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer
      peer-checked:after:translate-x-full peer-checked:after:border-white
      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
      after:bg-white after:border-gray-300 after:border after:rounded-full
      after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
  </label>
);

const AIOutputCard = ({ icon, label, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-blue-600/5 border border-blue-600/10 rounded-xl">
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon name={icon} className="text-blue-600 text-xl" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">{label} ✨</p>
        <p className="text-[10px] text-gray-500">Auto-generate from content</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const AIOptionCard = ({ icon, label, description, checked, onChange }) => (
  <label className="relative flex cursor-pointer rounded-xl border border-gray-200 p-4 hover:border-blue-600/50 transition-all">
    <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
    <div className="flex flex-1 items-start gap-4">
      <div className="p-2 bg-blue-600/10 rounded-lg text-blue-600 flex-shrink-0">
        <Icon name={icon} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900">{label}</span>
        <span className="text-xs text-gray-500 leading-relaxed">{description}</span>
      </div>
    </div>
    <Icon name="check_circle"
      className={`text-blue-600 transition-opacity self-start flex-shrink-0 ${checked ? 'opacity-100' : 'opacity-0'}`} />
  </label>
);

export default function TrainerUploadContent() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const userName = localStorage.getItem('userName') || 'Trainer';
  const userEmail = localStorage.getItem('userEmail') || '';

  // ── Form state ────────────────────────────────────────────────
  const [lessonTitle, setLessonTitle]       = useState('');
  const [description, setDescription]       = useState('');
  const [lessonType, setLessonType]         = useState('video');
  const [duration, setDuration]             = useState(0);
  const [videoUrl, setVideoUrl]             = useState('');
  // ✅ Fixed: separate state for text content (was accidentally bound to videoUrl)
  const [textContent, setTextContent]       = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');

  // ── File upload state ─────────────────────────────────────────
  const [videoFile, setVideoFile]   = useState(null);
  const [pdfFile, setPdfFile]       = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' | 'file'

  // ── Modules from backend ──────────────────────────────────────
  const [modules, setModules]               = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // ── UI state ──────────────────────────────────────────────────
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess]               = useState(false);
  const [error, setError]                   = useState(null);

  const videoInputRef = useRef(null);
  const pdfInputRef   = useRef(null);

  const [aiOutputs, setAiOutputs] = useState({ transcript: true, notes: true, qa: true });
  const toggleOutput = (key) => setAiOutputs(p => ({ ...p, [key]: !p[key] }));

  const [aiOptions, setAiOptions] = useState({ audio: true, walkthrough: true, assessment: false });
  const toggleAI = (key) => setAiOptions(p => ({ ...p, [key]: !p[key] }));

  // ── Load modules for course ───────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    apiClient.get(`/api/v1/trainer/courses/${courseId}/modules`)
      .then(res => {
        const mods = res.data || [];
        setModules(mods);
        // ✅ Auto-select first module
        if (mods.length > 0) setSelectedModuleId(String(mods[0].id));
        setLoadingModules(false);
      })
      .catch(() => setLoadingModules(false));
  }, [courseId]);

  // ── Main upload handler ───────────────────────────────────────
  const handleUpload = async () => {
    if (!lessonTitle.trim()) return setError('Lesson title is required');
    if (!selectedModuleId)   return setError('Please select a module/chapter');
    if (uploadMode === 'url'  && lessonType === 'video' && !videoUrl.trim())  return setError('Video URL is required');
    if (uploadMode === 'file' && lessonType === 'video' && !videoFile)         return setError('Please select a video file');
    if (lessonType === 'text' && !textContent.trim())                          return setError('Text content is required');

    setUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      // Step 1 — Create lesson with optional inline content
      const lessonPayload = {
        title: lessonTitle,
        lesson_type: lessonType,
        duration_minutes: parseInt(duration) || 0,
      };

      if (lessonType === 'video' && uploadMode === 'url' && videoUrl.trim()) {
        lessonPayload.content      = videoUrl;
        lessonPayload.content_type = 'video_url';
      } else if (lessonType === 'text' && textContent.trim()) {
        // ✅ Fixed: was using videoUrl instead of textContent
        lessonPayload.content      = textContent;
        lessonPayload.content_type = 'text_body';
      }

      const lessonRes = await apiClient.post(
        `/api/v1/trainer/modules/${selectedModuleId}/lessons`,
        lessonPayload
      );
      const newLessonId = lessonRes.data.id;
      setUploadProgress(40);

      // Step 2 — Upload video file if file mode
      if (uploadMode === 'file' && videoFile) {
        const formData = new FormData();
        formData.append('file', videoFile);
        await apiClient.post(
          `/api/v1/trainer/lessons/${newLessonId}/upload-video`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setUploadProgress(70);
      }

      // Step 3 — Upload PDF if provided
      if (pdfFile) {
        const pdfForm = new FormData();
        pdfForm.append('file', pdfFile);
        await apiClient.post(
          `/api/v1/trainer/lessons/${newLessonId}/upload-pdf`,
          pdfForm,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setUploadProgress(90);
      }

      setUploadProgress(100);
      setSuccess(true);

      // Navigate back to course after 1.5s
      setTimeout(() => navigate(`/trainer/courses/${courseId}`), 1500);

    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Save draft — creates lesson without content ───────────────
  const handleSaveDraft = async () => {
    if (!lessonTitle.trim())  return setError('Lesson title is required');
    if (!selectedModuleId)    return setError('Please select a module');
    try {
      await apiClient.post(`/api/v1/trainer/modules/${selectedModuleId}/lessons`, {
        title: lessonTitle,
        lesson_type: lessonType,
        duration_minutes: parseInt(duration) || 0,
      });
      navigate(`/trainer/courses/${courseId}`);
    } catch {
      setError('Failed to save draft');
    }
  };

  if (success) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="check_circle" className="text-green-600 text-4xl" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Content Uploaded!</h2>
        <p className="text-slate-500">Redirecting to course...</p>
      </div>
    </div>
  );

  // Footer status label
  const footerStatus = videoFile
    ? `📁 ${videoFile.name}`
    : videoUrl
      ? `🔗 URL provided`
      : textContent
        ? `📝 Text content ready`
        : 'No content selected yet';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* ✅ Pass courseId so sidebar highlights correct item */}
      <TrainerSidebar courseId={courseId} />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* ✅ Breadcrumb back to course management */}
            <button onClick={() => navigate(`/trainer/courses/${courseId}`)}
              className="text-slate-400 hover:text-blue-600 transition-colors">
              <Icon name="arrow_back" />
            </button>
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Icon name="upload_file" className="text-xl" />
            </div>
            <h1 className="text-lg font-bold">Upload Content</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <Icon name="notifications" className="text-slate-600" />
            </button>
            <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

            {/* Progress Steps */}
            <div className="flex items-center justify-between max-w-md mx-auto mb-4">
              {['Details', 'Content', 'Review'].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {i + 1}
                    </div>
                    <span className={`text-xs font-medium ${i < 2 ? 'text-blue-600' : 'text-slate-400'}`}>{step}</span>
                  </div>
                  {i < 2 && <div className={`h-0.5 flex-1 mx-2 ${i < 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <Icon name="error" className="text-red-500" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                  <Icon name="close" />
                </button>
              </div>
            )}

            {/* Section 1 — Lesson Details */}
            <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="description" className="text-blue-600" />
                <h3 className="text-xl font-bold">Section 1: Lesson Details</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Lesson Title *</label>
                  <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-base outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. Introduction to Python Variables" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-base outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                    placeholder="What will students learn in this lesson?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Lesson Type</label>
                    <select value={lessonType} onChange={e => setLessonType(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-600">
                      <option value="video">Video</option>
                      <option value="text">Text</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Duration (minutes)</label>
                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-600"
                      placeholder="15" min="0" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Add to Chapter *</label>
                  {loadingModules ? (
                    <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                  ) : modules.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                      No chapters yet.{' '}
                      <button onClick={() => navigate(`/trainer/courses/${courseId}`)}
                        className="underline font-semibold">Create a chapter first →</button>
                    </div>
                  ) : (
                    <select value={selectedModuleId} onChange={e => setSelectedModuleId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-600">
                      {modules.map(m => (
                        <option key={m.id} value={String(m.id)}>{m.title}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2 — Content Upload */}
            <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="upload_file" className="text-blue-600" />
                <h3 className="text-xl font-bold">Section 2: Content</h3>
              </div>

              {/* Video */}
              {lessonType === 'video' && (
                <>
                  <div className="flex gap-3 mb-6">
                    {['url', 'file'].map(mode => (
                      <button key={mode} onClick={() => setUploadMode(mode)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${uploadMode === mode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-600'}`}>
                        {mode === 'url' ? '🔗 Paste Video URL' : '📁 Upload Video File'}
                      </button>
                    ))}
                  </div>

                  {uploadMode === 'url' ? (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Video URL *</label>
                      <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-600"
                        placeholder="https://youtube.com/watch?v=... or Google Drive URL" />
                      <p className="text-xs text-slate-400 mt-2">Supports: YouTube, Vimeo, Google Drive, Loom, direct .mp4 URLs</p>
                    </div>
                  ) : (
                    <div>
                      <input ref={videoInputRef} type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        className="hidden" onChange={e => setVideoFile(e.target.files[0])} />
                      <div onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-blue-600 hover:bg-blue-600/5 transition-all">
                        {videoFile ? (
                          <>
                            <Icon name="check_circle" className="text-green-600 text-4xl mb-2" />
                            <p className="font-bold text-green-700 text-sm">{videoFile.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                            <button onClick={e => { e.stopPropagation(); setVideoFile(null); }}
                              className="text-xs text-red-500 mt-2 underline">Remove</button>
                          </>
                        ) : (
                          <>
                            <Icon name="video_library" className="text-4xl text-slate-300 mb-3" />
                            <p className="font-bold text-sm text-slate-600 mb-1">Click to select video file</p>
                            <p className="text-xs text-slate-400">MP4, MOV, WebM — max 100MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Text */}
              {lessonType === 'text' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Text Content *</label>
                  {/* ✅ Fixed: was binding to videoUrl — now uses textContent */}
                  <textarea value={textContent} onChange={e => setTextContent(e.target.value)} rows={8}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-600 resize-none"
                    placeholder="Enter lesson content here. You can use HTML tags for formatting." />
                </div>
              )}

              {/* Quiz */}
              {lessonType === 'quiz' && (
                <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                  <Icon name="quiz" className="text-4xl text-slate-300 mb-3 block" />
                  <p className="font-bold text-slate-600 mb-2">Quiz Builder</p>
                  <p className="text-sm text-slate-400">
                    Create the lesson first, then add quiz questions from the course management page.
                  </p>
                </div>
              )}

              {/* PDF Upload */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">PDF / Slides (optional)</label>
                <input ref={pdfInputRef} type="file" accept="application/pdf"
                  className="hidden" onChange={e => setPdfFile(e.target.files[0])} />
                <div onClick={() => pdfInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:border-blue-600 hover:bg-blue-600/5 transition-all">
                  {pdfFile ? (
                    <>
                      <Icon name="check_circle" className="text-green-600 text-3xl mb-2" />
                      <p className="font-bold text-green-700 text-sm">{pdfFile.name}</p>
                      <button onClick={e => { e.stopPropagation(); setPdfFile(null); }}
                        className="text-xs text-red-500 mt-2 underline">Remove</button>
                    </>
                  ) : (
                    <>
                      <Icon name="picture_as_pdf" className="text-3xl text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">Click to upload PDF or slides</p>
                    </>
                  )}
                </div>
              </div>

              {/* AI Outputs */}
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI-Automated Outputs</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AIOutputCard icon="segment"  label="Transcript"   checked={aiOutputs.transcript} onChange={() => toggleOutput('transcript')} />
                  <AIOutputCard icon="article"  label="Lesson Notes" checked={aiOutputs.notes}      onChange={() => toggleOutput('notes')} />
                  <AIOutputCard icon="forum"    label="Q&A Topics"   checked={aiOutputs.qa}         onChange={() => toggleOutput('qa')} />
                </div>
              </div>
            </section>

            {/* Section 3 — AI Enhancements */}
            <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="auto_awesome" className="text-blue-600" />
                <h3 className="text-xl font-bold">Section 3: AI Enhancements</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AIOptionCard icon="summarize" label="Audio Summary"
                  description="Generate a 5-minute audio overview."
                  checked={aiOptions.audio} onChange={() => toggleAI('audio')} />
                <AIOptionCard icon="route" label="Interactive Walkthrough"
                  description="Guided AI tour of lesson content."
                  checked={aiOptions.walkthrough} onChange={() => toggleAI('walkthrough')} />
                <AIOptionCard icon="quiz" label="Assessment Questions"
                  description="AI generates quiz questions from content."
                  checked={aiOptions.assessment} onChange={() => toggleAI('assessment')} />
              </div>
            </section>

            <div className="h-8" />
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 bg-white border-t border-slate-200 px-6 py-4 z-50">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <p className="text-sm text-slate-400">{footerStatus}</p>
            <div className="flex items-center gap-4">
              <button onClick={handleSaveDraft}
                className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors">
                Save Draft
              </button>
              <button onClick={handleUpload} disabled={uploading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-60">
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <><span>Upload & Process ✨</span><Icon name="rocket_launch" className="text-sm" /></>
                )}
              </button>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}