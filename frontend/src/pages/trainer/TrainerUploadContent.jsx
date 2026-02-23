import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerProfileDropdown from './TrainerProfileDropdown';

// ─── Icon helper ─────────────────────────────────────────────────────────────
const Icon = ({ name, className = '' }) => (
  <span
    className={`material-symbols-outlined select-none leading-none ${className}`}
    style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24" }}
  >
    {name}
  </span>
);

// ─── AI option card ───────────────────────────────────────────────────────────
const AIOptionCard = ({ icon, label, description, checked, onChange }) => (
  <label className="relative flex cursor-pointer rounded-xl border border-gray-200 p-4 hover:border-primary/50 transition-all has-[:checked]:bg-primary/5 has-[:checked]:border-primary">
    <input
      type="checkbox"
      className="peer sr-only"
      checked={checked}
      onChange={onChange}
    />
    <div className="flex flex-1 items-start gap-4">
      <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
        <Icon name={icon} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900">{label}</span>
        <span className="text-xs text-gray-500 leading-relaxed">{description}</span>
      </div>
    </div>
    <Icon name="check_circle" className="text-primary opacity-0 peer-checked:opacity-100 transition-opacity self-start" />
  </label>
);

// ─── Upload drop zone ─────────────────────────────────────────────────────────
const UploadZone = ({ icon, label, hint, onSelect }) => (
  <div className="group border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary transition-all bg-gray-50/30 hover:bg-primary/5 cursor-pointer"
       onClick={onSelect}>
    <Icon name={icon} className="text-4xl text-gray-400 group-hover:text-primary mb-3 transition-colors" />
    <p className="font-bold text-sm mb-1 text-gray-700">{label}</p>
    <p className="text-xs text-gray-500 mb-4 italic">{hint}</p>
    <button
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      className="text-xs font-bold text-primary px-3 py-1.5 rounded bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all"
    >
      Select File
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TrainerUploadContent() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const isEdit = searchParams.get('edit') === 'true';

  const [lessonTitle, setLessonTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aiOptions, setAiOptions] = useState({
    audio: true,
    walkthrough: true,
    assessment: false,
    subtitles: true,
  });
  const [uploadedFiles, setUploadedFiles] = useState({ video: null, slides: null, notes: null });
  const [saving, setSaving] = useState(false);

  const toggleAI = (key) => setAiOptions(p => ({ ...p, [key]: !p[key] }));

  const handleSaveDraft = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  // NAV FLOW: Upload → AI Content Studio (Page 16) to monitor generation
  const handleUpload = () => {
    navigate('/trainer/ai-studio');
  };

  // NAV FLOW: Cancel → Course Management (Page 14)
  const handleCancel = () => {
    navigate(`/trainer/courses/${courseId || 'course1'}`);
  };

  // NAV FLOW: Auto-generate from video → modal, then optionally AI Studio (Page 16)
  const handleAutoGenerate = () => {
    navigate('/trainer/ai-studio?tool=transcript');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
        *,*::before,*::after { box-sizing: border-box; }
        body { font-family: 'Lexend', sans-serif; }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-background-light text-[#0d141b]" style={{ fontFamily: "'Lexend', sans-serif" }}>
        {/* ── Sidebar ── */}
        <TrainerSidebar courseId={courseId} />

        {/* ── Content area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary/10 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Icon name="upload_file" className="text-xl" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">
                {isEdit ? 'Edit Content' : 'Upload Content'}
              </h1>
            </div>

            {/* Top nav links */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => navigate('/dashboard/trainer')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >Dashboard</button>
              <button
                onClick={() => navigate(`/trainer/courses/${courseId || 'course1'}`)}
                className="text-sm font-medium hover:text-primary transition-colors"
              >Courses</button>
              <span className="text-sm font-medium text-primary">Content Studio</span>
              <button
                onClick={() => navigate(courseId ? `/trainer/courses/${courseId}/analytics` : '/trainer/analytics')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >Analytics</button>
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-primary/10 transition-colors cursor-pointer">
                <Icon name="notifications" className="text-gray-600" />
              </button>
              <TrainerProfileDropdown name="Dr. Smith" role="Lead Trainer" />
            </div>
          </header>

          {/* ── Scrollable main ── */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[900px] mx-auto w-full px-6 py-10">

              {/* Progress Stepper */}
              <div className="mb-10 flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-xs font-medium text-primary">Setup</span>
                </div>
                <div className="h-[2px] flex-1 bg-primary mx-4" />
                <div className="flex flex-col items-center gap-2">
                  <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-xs font-bold text-primary">Content &amp; AI</span>
                </div>
                <div className="h-[2px] flex-1 bg-gray-200 mx-4" />
                <div className="flex flex-col items-center gap-2">
                  <div className="size-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-xs font-medium text-gray-500">Review</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight mb-2">Content Upload &amp; AI Studio Config</h2>
                <p className="text-gray-500 text-lg">Enhance your learning materials with automated AI features.</p>
              </div>

              {/* Section 1: Lesson Details */}
              <section className="bg-white border border-primary/10 rounded-xl p-8 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Icon name="description" className="text-primary" />
                  <h3 className="text-xl font-bold">Section 1: Lesson Details</h3>
                </div>
                <div className="grid gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Lesson Title</label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={e => setLessonTitle(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-4 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      placeholder="e.g. Advanced Principles of Deep Learning"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Description / Learning Objectives</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-4 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                      placeholder="What will the students achieve after this lesson?"
                      rows={4}
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Upload Materials */}
              <section className="bg-white border border-primary/10 rounded-xl p-8 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Icon name="upload_file" className="text-primary" />
                    <h3 className="text-xl font-bold">Section 2: Upload Materials</h3>
                  </div>
                  {/* NAV FLOW: Auto-generate from video → AI Studio (Page 16) or processing modal */}
                  <button
                    onClick={handleAutoGenerate}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full cursor-pointer hover:bg-primary/20 transition-all"
                  >
                    <Icon name="magic_button" className="text-sm" />
                    <span className="text-sm font-bold">✨ Auto-generate from video</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <UploadZone
                    icon="video_library"
                    label="Class Recording"
                    hint="MP4, MOV up to 2GB"
                    onSelect={() => setUploadedFiles(p => ({ ...p, video: 'video.mp4' }))}
                  />
                  <UploadZone
                    icon="present_to_all"
                    label="Slides Deck"
                    hint="PDF, PPTX up to 50MB"
                    onSelect={() => setUploadedFiles(p => ({ ...p, slides: 'slides.pdf' }))}
                  />
                  <UploadZone
                    icon="article"
                    label="Lesson Notes"
                    hint="PDF, DOCX, TXT"
                    onSelect={() => setUploadedFiles(p => ({ ...p, notes: 'notes.pdf' }))}
                  />
                </div>

                {/* Uploaded file indicators */}
                {Object.entries(uploadedFiles).some(([,v]) => v) && (
                  <div className="mt-4 flex gap-3 flex-wrap">
                    {Object.entries(uploadedFiles).map(([key, val]) => val && (
                      <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700">
                        <Icon name="check_circle" className="text-green-500 text-sm" />
                        {val}
                        <button
                          onClick={() => setUploadedFiles(p => ({ ...p, [key]: null }))}
                          className="ml-1 text-green-400 hover:text-green-700"
                        >
                          <Icon name="close" className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 3: AI Enhancement Options */}
              <section className="bg-white border border-primary/10 rounded-xl p-8 mb-24 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Icon name="psychology_alt" className="text-primary" />
                  <h3 className="text-xl font-bold">Section 3: AI Enhancement Options</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AIOptionCard
                    icon="summarize"
                    label="Audio Summary"
                    description="Generates a concise 5-minute audio overview of the key lecture concepts."
                    checked={aiOptions.audio}
                    onChange={() => toggleAI('audio')}
                  />
                  <AIOptionCard
                    icon="interactive_space"
                    label="Interactive Walkthrough"
                    description="Creates a guided AI tour of your slides with embedded hotspots."
                    checked={aiOptions.walkthrough}
                    onChange={() => toggleAI('walkthrough')}
                  />
                  <AIOptionCard
                    icon="quiz"
                    label="Assessment Questions"
                    description="AI analyzes content to generate 10 unique quiz questions with explanations."
                    checked={aiOptions.assessment}
                    onChange={() => toggleAI('assessment')}
                  />
                  <AIOptionCard
                    icon="translate"
                    label="Multi-language Subtitles"
                    description="Automatic translation of transcripts into Spanish, French, and Mandarin."
                    checked={aiOptions.subtitles}
                    onChange={() => toggleAI('subtitles')}
                  />
                </div>
              </section>

            </div>
          </main>

          {/* ── Sticky Bottom Action Bar ── */}
          <footer className="shrink-0 bg-white/95 backdrop-blur border-t border-gray-200 px-6 py-4 z-50 shadow-2xl">
            <div className="max-w-[900px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Icon name="info" className="text-sm" />
                <span className="text-sm font-medium">
                  {saving ? 'Saving draft...' : 'Auto-saving as draft...'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* NAV FLOW: Cancel → Course Management (Page 14) */}
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                {/* NAV FLOW: Save Draft → stays on page 15 */}
                <button
                  onClick={handleSaveDraft}
                  className="px-6 py-2.5 rounded-lg border border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  Save Draft
                </button>
                {/* NAV FLOW: Upload → AI Content Studio (Page 16) */}
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 cursor-pointer"
                >
                  <span>Upload &amp; Process</span>
                  <Icon name="rocket_launch" className="text-sm" />
                </button>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
