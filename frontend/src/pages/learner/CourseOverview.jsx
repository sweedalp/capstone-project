import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

const CourseOverview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [expandedChapter, setExpandedChapter] = useState(2);
  const [objectives, setObjectives] = useState([
    { id: 1, text: 'Understand Variables & Types', completed: true },
    { id: 2, text: 'Implement Basic Error Handling', completed: true },
    { id: 3, text: 'Design Efficient For-Loops', completed: false },
    { id: 4, text: 'Work with Dictionary Data Types', completed: false },
    { id: 5, text: 'Optimize scripts with AI Co-pilot', completed: false },
  ]);

  const toggleChapter = (chapterId) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const toggleObjective = (id) => {
    setObjectives(objectives.map(obj => 
      obj.id === id ? { ...obj, completed: !obj.completed } : obj
    ));
  };

  const chapters = [
    {
      id: 1,
      title: 'Chapter 1: Python Fundamentals',
      status: 'completed',
      lessons: 4,
      duration: '45 mins',
      icon: 'check',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      bgColor: 'bg-slate-50/50 dark:bg-slate-800/30',
      lessons_list: []
    },
    {
      id: 2,
      title: 'Chapter 2: Control Flow & Logic',
      status: 'current',
      subtitle: 'Current Chapter • 3 lessons remaining',
      icon: 'play_arrow',
      iconColor: 'text-white',
      iconBg: 'bg-primary',
      bgColor: 'bg-primary/5',
      lessons_list: [
        { id: '2.1', title: '2.1 Conditional Statements (if/else)', type: 'Video', duration: '12:45', icon: 'movie' },
        { id: '2.2', title: '2.2 Loop Logic Explained', type: 'Audio Guide', duration: '08:20', icon: 'mic' },
        { id: '2.3', title: '2.3 Interactive Logic Flowchart', type: 'Interactive Lab', duration: '15:00', icon: 'explore' },
      ]
    },
    {
      id: 3,
      title: 'Chapter 3: Advanced Data Structures',
      status: 'locked',
      subtitle: 'Prerequisite: Complete Chapter 2',
      icon: 'lock',
      iconColor: 'text-slate-500',
      iconBg: 'bg-slate-200 dark:bg-slate-700',
    }
  ];

  const progressPercentage = 80;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-3xl font-bold">school</span>
                <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">AI Learning Hub</h2>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" href="#">My Courses</a>
                <a className="text-sm font-medium text-primary cursor-pointer" href="#">Explore</a>
                <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" href="#">Community</a>
                <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" href="#">Settings</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input 
                  className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/50 transition-all" 
                  placeholder="Search courses..." 
                  type="text"
                />
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
                <img className="w-full h-full object-cover" alt="Student profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJM0PQxl6wj-PufwBF99_5Pxk0wS9O3TzDV1V0qvTYlzRnSHehIUxfq-bi5wDDS8Na6WgXaM0DnBGNpmTx4ZG4xU2RccPCalIfzLctxvBCvH8d6vz0RsCKC7giMO4SVAFvqbwZt48-8xIFRVB9jjCBy1wt5FetTtmY-pmQ52AIA4_2B3e_S5MDYneeSu1y04BokCStrTBh9fMdquqD-mPZrnTUNvJELq-HuJKIKp3ygCCSLrsKDl3J_k-9L_e3xi_MJWJvr1h4leM" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
          <a className="hover:text-primary transition-colors cursor-pointer" href="#">Home</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <a className="hover:text-primary transition-colors cursor-pointer" href="#">Python Development</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900 dark:text-slate-200 font-medium">Introduction to Python</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Course Banner/Avatar */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-6xl">terminal</span>
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Introduction to Python</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                <div className="flex items-center gap-1.5">
                  <img className="w-6 h-6 rounded-full" alt="Instructor portrait Sarah Jenkins" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWVqHLGE20FLE7DhWuFWau1WAnytMXwtU6hIm0LYP9y-RyQtwnGzc5NJeSvCGDz-Hk7DKa8phqati5904V3hw7_BvgkpOk2_Lq-QSydFwyrkPn30gS3umGent09AyvsSNy5AvBfNWTD9jhRBUCyTtnjKkDbW7GqI7KF9mDilNteTNh7EvV-XwcZNrs-FO0fIKBoVFlV_IaYY34tTdImH1yufYokouUmI41gaN6VQyAhGcqKVmSbI8NMyzbj0OSMBG7JZ25Eni0u8g" />
                  <span>Dr. Sarah Jenkins</span>
                </div>
                <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  <span>Updated Oct 2023</span>
                </div>
                <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">language</span>
                  <span>English</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <button 
                  onClick={() => navigate('/learner/courses/1/lessons/2.1')}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Continue Learning
                </button>
                <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">share</span>
                  Share
                </button>
              </div>
            </div>

            {/* Progress Ring */}
            <div className="shrink-0 flex flex-col items-center gap-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle 
                    className="text-slate-200 dark:text-slate-700" 
                    cx="48" 
                    cy="48" 
                    fill="transparent" 
                    r="40" 
                    stroke="currentColor" 
                    strokeWidth="8"
                  />
                  <circle 
                    className="text-primary transition-all duration-700 ease-out" 
                    cx="48" 
                    cy="48" 
                    fill="transparent" 
                    r="40" 
                    stroke="currentColor" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round" 
                    strokeWidth="8"
                  />
                </svg>
                <span className="absolute text-xl font-bold text-slate-900 dark:text-white">{progressPercentage}%</span>
              </div>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Overall Progress</span>
            </div>
          </div>
        </div>

        {/* Main Layout: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Body (Left 8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabbed Layout Header */}
            <div className="border-b border-slate-200 dark:border-slate-800">
              <nav className="flex gap-8 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                    activeTab === 'overview' 
                      ? 'text-primary border-b-2 border-primary font-bold' 
                      : 'text-slate-500 hover:text-primary'
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`pb-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                    activeTab === 'content' 
                      ? 'text-primary border-b-2 border-primary font-bold' 
                      : 'text-slate-500 hover:text-primary'
                  }`}
                >
                  Content
                </button>
                <button 
                  onClick={() => setActiveTab('ai-hub')}
                  className={`pb-4 text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'ai-hub' 
                      ? 'text-primary border-b-2 border-primary font-bold' 
                      : 'text-slate-500 hover:text-primary'
                  }`}
                >
                  AI Hub
                  <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">Smart</span>
                </button>
                <button 
                  onClick={() => setActiveTab('resources')}
                  className={`pb-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                    activeTab === 'resources' 
                      ? 'text-primary border-b-2 border-primary font-bold' 
                      : 'text-slate-500 hover:text-primary'
                  }`}
                >
                  Resources
                </button>
              </nav>
            </div>

            {/* Accordion Syllabus */}
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div 
                  key={chapter.id}
                  className={`
                    bg-white dark:bg-slate-900 rounded-xl overflow-hidden transition-all duration-300
                    ${chapter.status === 'completed' ? 'border border-slate-200 dark:border-slate-800 opacity-75' : ''}
                    ${chapter.status === 'current' ? 'border-2 border-primary shadow-md' : ''}
                    ${chapter.status === 'locked' ? 'bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed' : ''}
                  `}
                >
                  <div 
                    className={`
                      p-4 flex items-center justify-between cursor-pointer transition-colors
                      ${chapter.status === 'completed' ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}
                      ${chapter.status === 'current' ? 'bg-primary/5 hover:bg-primary/10' : ''}
                      ${chapter.status === 'locked' ? 'grayscale opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => chapter.status !== 'locked' && toggleChapter(chapter.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${chapter.iconBg} ${chapter.iconColor} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-lg ${chapter.id === 2 ? '' : 'font-bold'}`}>{chapter.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{chapter.title}</h3>
                        <p className={`text-xs ${chapter.status === 'current' ? 'text-primary font-medium' : 'text-slate-500'} ${chapter.status === 'locked' ? 'italic' : ''}`}>
                          {chapter.subtitle || `${chapter.lessons} lessons • ${chapter.duration} total`}
                        </p>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined ${
                      chapter.status === 'locked' ? 'text-slate-400' : 
                      chapter.status === 'current' ? 'text-primary' : 'text-slate-400'
                    }`}>
                      {chapter.status === 'locked' ? 'lock' : expandedChapter === chapter.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>

                  {/* Expanded Lessons */}
                  {expandedChapter === chapter.id && chapter.lessons_list && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {chapter.lessons_list.map((lesson) => (
                        <div 
                          key={lesson.id}
                          onClick={() => navigate('/learner/courses/1/lessons/' + lesson.id)}
                          className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg transition-transform group-hover:scale-110">
                              {lesson.icon}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">{lesson.title}</p>
                              <p className="text-xs text-slate-500">{lesson.type} • {lesson.duration}</p>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1">
                            arrow_forward
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar (Right 4 columns) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Key Takeaways Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Key Takeaways</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span>
                  Master Pythonic syntax and core programming paradigms.
                </li>
                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span>
                  Build functional scripts for automation and data analysis.
                </li>
                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span>
                  Integrate AI tools to optimize code quality and speed.
                </li>
              </ul>
            </div>

            {/* Learning Objectives Checklist */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">checklist_rtl</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Learning Objectives</h2>
              </div>
              <div className="space-y-3">
                {objectives.map((objective) => (
                  <label 
                    key={objective.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <input 
                      checked={objective.completed}
                      onChange={() => toggleObjective(objective.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary bg-white dark:bg-slate-800 cursor-pointer transition-all" 
                      type="checkbox"
                    />
                    <span className={`text-sm transition-all ${
                      objective.completed 
                        ? 'text-slate-600 dark:text-slate-400 line-through' 
                        : 'text-slate-900 dark:text-slate-200'
                    }`}>
                      {objective.text}
                    </span>
                  </label>
                ))}
              </div>

              {/* Milestone Badge */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span>Milestone Badge</span>
                  <span>Locked</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 flex items-center gap-3 grayscale opacity-60">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-600">military_tech</span>
                  </div>
                  <div className="text-[11px] leading-tight">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Logic Master</p>
                    <p className="text-slate-500">Complete Chapter 2 to earn</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
        <p>© 2023 AI Learning Hub • Powered by Nexa Learning Engine</p>
      </footer>
    </div>
  );
};

export default CourseOverview;
