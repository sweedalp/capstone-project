import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerProfileDropdown from './TrainerProfileDropdown';

// ─── Icon helper ──────────────────────────────────────────────────────────────
const Icon = ({ name, className = '' }) => (
  <span
    className={`material-symbols-outlined select-none leading-none ${className}`}
    style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24" }}
  >
    {name}
  </span>
);

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <label className="inline-flex relative items-center cursor-pointer flex-shrink-0">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={onChange}
    />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer
      peer-checked:after:translate-x-full peer-checked:after:border-white
      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
      after:bg-white after:border-gray-300 after:border after:rounded-full
      after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
  </label>
);

// ─── AI Output Card ────────────────────────────────────────────────────────────
const AIOutputCard = ({ icon, label, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-xl"
       style={{ boxShadow: '0 0 15px rgba(19,127,236,0.05)' }}>
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon name={icon} className="text-primary text-xl" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
          {label} ✨
        </p>
        <p className="text-[10px] text-gray-500">Auto-generate from video</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

// ─── Upload Zone ───────────────────────────────────────────────────────────────
const UploadZone = ({ icon, label, hint, required, uploadedFile, onSelect, onRemove }) => (
  <div
    className="group border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-all bg-gray-50/30 hover:bg-primary/5 cursor-pointer"
    onClick={!uploadedFile ? onSelect : undefined}
  >
    {uploadedFile ? (
      <>
        <div className="size-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <Icon name="check_circle" className="text-green-600 text-2xl" />
        </div>
        <p className="font-bold text-sm text-green-700 mb-1 truncate max-w-full px-2">{uploadedFile}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="text-xs font-bold text-rose-500 px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 transition-all mt-2"
        >
          Remove
        </button>
      </>
    ) : (
      <>
        <Icon name={icon} className="text-4xl text-gray-400 group-hover:text-primary mb-3 transition-colors" />
        <p className="font-bold text-sm mb-1 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        <p className="text-xs text-gray-500 mb-4 italic">{hint}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="text-xs font-bold text-primary px-4 py-2 rounded bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all"
        >
          Select File
        </button>
      </>
    )}
  </div>
);

// ─── AI Enhancement Option Card ────────────────────────────────────────────────
const AIOptionCard = ({ icon, label, description, checked, onChange }) => (
  <label className="relative flex cursor-pointer rounded-xl border border-gray-200 p-4 hover:border-primary/50 transition-all has-[:checked]:bg-primary/5 has-[:checked]:border-primary">
    <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
    <div className="flex flex-1 items-start gap-4">
      <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
        <Icon name={icon} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900">{label}</span>
        <span className="text-xs text-gray-500 leading-relaxed">{description}</span>
      </div>
    </div>
    <Icon name="check_circle" className="text-primary opacity-0 peer-checked:opacity-100 transition-opacity self-start flex-shrink-0" />
  </label>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TrainerUploadContent() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('edit') === 'true';

  const [lessonTitle, setLessonTitle] = useState('');
  const [description, setDescription] = useState('');

  // Only 2 upload zones now — video + slides
  const [uploadedFiles, setUploadedFiles] = useState({ video: null, slides: null });

  // AI-Automated Outputs (Section 2 toggles)
  const [aiOutputs, setAiOutputs] = useState({
    transcript: true,
    notes: true,
    qa: true,
  });
  const toggleOutput = (key) => setAiOutputs(p => ({ ...p, [key]: !p[key] }));

  // AI Enhancement Options (Section 3 checkboxes)
  const [aiOptions, setAiOptions] = useState({
    audio: true,
    walkthrough: true,
    assessment: false,
    subtitles: true,
  });
  const toggleAI = (key) => setAiOptions(p => ({ ...p, [key]: !p[key] }));

  const [saving, setSaving] = useState(false);

  const handleSaveDraft = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  // NAV FLOW: Upload & Process → AI Content Studio (Page 16)
  const handleUpload = () => navigate('/trainer/ai-studio');

  // NAV FLOW: Cancel → Course Management (Page 14)
  const handleCancel = () => navigate(`/trainer/courses/${courseId || 'python-101'}`);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
        *,*::before,*::after { box-sizing: border-box; }
        body { font-family: 'Lexend', sans-serif; }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-[#f6f7f8] text-[#0d141b]" style={{ fontFamily: "'Lexend', sans-serif" }}>

        {/* ── Sidebar ── */}
        <TrainerSidebar courseId={courseId} />

        {/* ── Content area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary/10 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Icon name="auto_awesome" className="text-xl" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">AI Learning Studio</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/dashboard/trainer')} className="text-sm font-medium hover:text-primary transition-colors">Dashboard</button>
              <button onClick={() => navigate(`/trainer/courses/${courseId || 'python-101'}`)} className="text-sm font-medium hover:text-primary transition-colors">Courses</button>
              <span className="text-sm font-medium text-primary">Content Studio</span>
              <button onClick={() => navigate(courseId ? `/trainer/courses/${courseId}/analytics` : '/trainer/analytics')} className="text-sm font-medium hover:text-primary transition-colors">Analytics</button>
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
            <div className="max-w-[1000px] mx-auto w-full px-6 py-10">

              {/* ── Progress Stepper ── */}
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

              {/* ── Page heading ── */}
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight mb-2">
                  Content Upload &amp; AI Studio Config
                </h2>
                <p className="text-gray-500 text-lg">Enhance your learning materials with automated AI features.</p>
              </div>

              {/* ══ Section 1: Lesson Details ══ */}
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
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-4 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Advanced Principles of Deep Learning"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Description / Learning Objectives</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-4 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                      placeholder="What will the students achieve after this lesson?"
                      rows={4}
                    />
                  </div>
                </div>
              </section>

              {/* ══ Section 2: Material Selection (AI-First) ══ */}
              <section className="bg-white border border-primary/10 rounded-xl p-8 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Icon name="upload_file" className="text-primary" />
                    <h3 className="text-xl font-bold">Section 2: Material Selection</h3>
                  </div>
                  {/* AI pipeline active badge */}
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-md text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                    <Icon name="auto_awesome" className="text-xs" />
                    AI pipeline active
                  </div>
                </div>

                {/* ── 2 upload zones only: Video + Slides ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <UploadZone
                    icon="video_library"
                    label="Class Recording"
                    hint="Primary Source (MP4, MOV)"
                    required
                    uploadedFile={uploadedFiles.video}
                    onSelect={() => setUploadedFiles(p => ({ ...p, video: 'class-recording.mp4' }))}
                    onRemove={() => setUploadedFiles(p => ({ ...p, video: null }))}
                  />
                  <UploadZone
                    icon="present_to_all"
                    label="Slides Deck"
                    hint="Visual Reference (PDF, PPTX)"
                    required
                    uploadedFile={uploadedFiles.slides}
                    onSelect={() => setUploadedFiles(p => ({ ...p, slides: 'slides.pdf' }))}
                    onRemove={() => setUploadedFiles(p => ({ ...p, slides: null }))}
                  />
                </div>

                {/* ── AI-Automated Outputs (Transcript, Notes, Q&A) ── */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                    AI-Automated Outputs
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AIOutputCard
                      icon="segment"
                      label="Transcript"
                      checked={aiOutputs.transcript}
                      onChange={() => toggleOutput('transcript')}
                    />
                    <AIOutputCard
                      icon="article"
                      label="Lesson Notes"
                      checked={aiOutputs.notes}
                      onChange={() => toggleOutput('notes')}
                    />
                    <AIOutputCard
                      icon="forum"
                      label="Q&A Topics"
                      checked={aiOutputs.qa}
                      onChange={() => toggleOutput('qa')}
                    />
                  </div>
                </div>
              </section>

              {/* ══ Section 3: AI Enhancement Options ══ */}
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

          {/* ── Sticky Bottom Footer ── */}
          <footer className="shrink-0 bg-white/95 backdrop-blur border-t border-gray-200 px-6 py-4 z-50 shadow-2xl">
            <div className="max-w-[1000px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Icon name="info" className="text-sm" />
                <span className="text-sm font-medium">
                  Core media files required to proceed.
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* NAV FLOW: Save Draft → stays on Page 15 */}
                <button
                  onClick={handleSaveDraft}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                {/* NAV FLOW: Upload & Process → AI Content Studio (Page 16) */}
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 cursor-pointer"
                >
                  <span>Upload &amp; Process ✨</span>
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
