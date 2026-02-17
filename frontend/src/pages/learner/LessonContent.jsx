import React, { useState } from 'react';
import '../../index.css';

const LessonContent = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcriptExpanded, setTranscriptExpanded] = useState(true);
  const [autoFollowEnabled, setAutoFollowEnabled] = useState(true);
  const [knowledgeLevel, setKnowledgeLevel] = useState('beginner');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const lessons = [
    { id: 1, title: 'Introduction to Code', status: 'completed', icon: 'check_circle' },
    { id: 2, title: 'Variables Explained', status: 'current', icon: 'play_circle' },
    { id: 3, title: 'Data Types & Storage', status: 'locked', icon: 'circle' },
  ];

  const lockedLessons = [
    { id: 4, title: 'If-Else Statements', status: 'locked', icon: 'lock' },
    { id: 5, title: 'Loops & Iteration', status: 'locked', icon: 'lock' },
  ];

  const aiEnhancements = [
    { icon: 'mic', title: 'Audio Summary', subtitle: 'Listen to 2-min recap', color: 'indigo' },
    { icon: 'movie', title: 'Video Explainer', subtitle: 'Simplified visual recap', color: 'amber' },
    { icon: 'explore', title: 'Walkthrough', subtitle: 'Step-by-step guide', color: 'emerald' },
  ];

  const transcriptLines = [
    { time: '00:15', text: '"Imagine a variable as a labeled box. You can put things into the box, take them out, or replace them. In programming, we call this storing and retrieving data."', highlighted: false },
    { time: '00:45', text: '"When you define a variable, like \'let age = 25\', the computer reserves a small space in its memory for that specific value."', highlighted: true },
    { time: '01:12', text: '"The name of the variable is called an identifier. It\'s important to use names that make sense, such as \'userName\' instead of just \'x\'."', highlighted: false },
    { time: '01:45', text: '"There are different ways to declare variables depending on the language—some use \'let\', some use \'var\', and some use \'const\'."', highlighted: false },
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log('Message sent:', chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0 z-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">AI Learning LMS</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" href="#">Dashboard</a>
              <a className="text-sm font-medium text-primary cursor-pointer" href="#">My Courses</a>
              <a className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" href="#">Library</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input 
                className="w-64 bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all" 
                placeholder="Search lessons..." 
                type="text"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
              <img className="h-full w-full object-cover" alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWSwTCxXmo9-87KXxwr34nIZpiCGSOjO_vUxOhiwUbmkLnrkcBq6YJudRoXFwDf46T1gm-V9dxKDaYVlOl2nJRkN9p3jvxiU3e7uS4Ulhd9ddCCQ76_P_PR-bftWgkzC1_VdjKyQUw-mONh8MyYlzndRekRs9M8o2GYpp5ySk13-6rYGUt7d40gx71sjDUd3NO7ETq0TFguKSgt29fcYKqp9tkVWVEgUWQGsxRf22mZSIzpX-NnC7On8ADhXZuXZScWCIP6aJap8I" />
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Course Tree */}
          <aside className={`${sidebarCollapsed ? 'w-0' : 'w-72'} border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 transition-all duration-300 overflow-hidden`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Intro to Programming</h3>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">65%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[65%] transition-all duration-500"></div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Module 2: Basics</div>
              
              {lessons.map((lesson) => (
                <a 
                  key={lesson.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                    lesson.status === 'completed' 
                      ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800' 
                      : lesson.status === 'current'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`} 
                  href="#"
                >
                  <span className={`material-symbols-outlined text-xl ${
                    lesson.status === 'completed' ? 'text-green-500 font-bold' : ''
                  }`}>
                    {lesson.icon}
                  </span>
                  <span className={`text-sm ${lesson.status === 'current' ? 'font-bold' : 'font-medium'}`}>
                    {lesson.title}
                  </span>
                </a>
              ))}

              <div className="px-3 py-4 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800">
                Module 3: Logic
              </div>
              
              {lockedLessons.map((lesson) => (
                <a 
                  key={lesson.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" 
                  href="#"
                >
                  <span className="material-symbols-outlined text-xl">{lesson.icon}</span>
                  <span className="text-sm font-medium">{lesson.title}</span>
                </a>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setSidebarCollapsed(true)}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">first_page</span>
                Collapse Menu
              </button>
            </div>
          </aside>

          {/* Main Content: Video & Transcript */}
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-background-dark">
            <div className="max-w-5xl mx-auto p-6 md:p-8">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
                <span className="hover:text-primary cursor-pointer transition-colors">Intro to Programming</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="hover:text-primary cursor-pointer transition-colors">Module 2</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-primary">Variables Explained</span>
              </div>

              {/* Video Section */}
              <div className="relative group rounded-xl overflow-hidden bg-black aspect-video mb-8 shadow-2xl shadow-primary/5">
                <img 
                  className="w-full h-full object-cover opacity-60" 
                  alt="Abstract coding screen background" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-PCcw5qCgzh9KiGApEO48B2H0KjEdbhC_oZPkPvvoQ6O7MvtyGtX75lG2PskSC9jiFF2bm57CMc_l587SS4ZIhU6DZrscPz4C6FgBRTZK1VgNsuZyS6oIO5AV0xjYJSw5agqHnGosDYntufZUEkg2UylYd09RIkrfu312UimZIV9ID1aAjNN0hUDuQIZipoghMmYzg0sJdO1IxnrR3nxsC-8onVwS2z031D00JHh0jPDUOaCFvyBIpM-nhTHqcQyzYXwOgzqGPh8" 
                />
                
                {/* Overlay Controls */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all cursor-pointer"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-5xl translate-x-1">play_arrow</span>
                  </div>
                </div>

                {/* Video UI */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex flex-col gap-2">
                    <div className="h-1.5 w-full bg-white/20 rounded-full cursor-pointer relative group/progress">
                      <div className="absolute h-full w-[45%] bg-primary rounded-full transition-all"></div>
                      <div className="absolute h-4 w-4 bg-white rounded-full -top-1.5 left-[45%] shadow-lg shadow-black/50 opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="flex items-center justify-between text-white text-xs font-medium">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">
                          {isPlaying ? 'pause_circle' : 'play_circle'}
                        </span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">volume_up</span>
                        <span>04:12 / 09:45</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">closed_caption</span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">settings</span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">fullscreen</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson Header & Transcript */}
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Variables Explained</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                      In this lesson, we break down how computers store data using variables. You'll learn about declaration, assignment, and naming conventions.
                    </p>
                  </div>
                  <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-lg">bookmark</span>
                    Save
                  </button>
                </div>

                {/* Transcript Section */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
                  <button 
                    onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                    className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <span className="font-bold">Clean Lesson Transcript</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium">Auto-follow enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          checked={autoFollowEnabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            setAutoFollowEnabled(!autoFollowEnabled);
                          }}
                          className="sr-only peer" 
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </button>
                  
                  {transcriptExpanded && (
                    <div className="p-6 max-h-[300px] overflow-y-auto custom-scrollbar text-slate-600 dark:text-slate-400 text-base leading-loose space-y-4">
                      {transcriptLines.map((line, idx) => (
                        <p 
                          key={idx}
                          className={`${line.highlighted ? 'bg-primary/5 dark:bg-primary/10 rounded p-2 border-l-4 border-primary' : ''}`}
                        >
                          <span className="text-primary font-bold mr-2">{line.time}</span> 
                          {line.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-8">
              <button className="flex items-center gap-3 group px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <span className="material-symbols-outlined text-slate-400 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Previous</p>
                  <p className="text-sm font-semibold">What is Code?</p>
                </div>
              </button>
              
              <button className="flex items-center gap-3 group px-4 py-2 rounded-lg bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-white/70">Next Lesson</p>
                  <p className="text-sm font-semibold">Constant Variables</p>
                </div>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </main>

          {/* Right Sidebar: AI Learning Enhancements */}
          <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col shrink-0 overflow-hidden">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <h3 className="font-bold text-sm tracking-wide uppercase">AI Enhancements</h3>
              </div>

              {/* AI Tool Grid */}
              <div className="grid grid-cols-1 gap-3">
                {aiEnhancements.map((tool, idx) => (
                  <button 
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-all text-left group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${tool.color}-100 dark:bg-${tool.color}-900/30 text-${tool.color}-600 dark:text-${tool.color}-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined">{tool.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">{tool.title}</p>
                      <p className="text-[10px] text-slate-500">{tool.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selectors */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Knowledge Level</label>
                  <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <button 
                      onClick={() => setKnowledgeLevel('beginner')}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
                        knowledgeLevel === 'beginner' 
                          ? 'bg-white dark:bg-slate-700 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      Beginner
                    </button>
                    <button 
                      onClick={() => setKnowledgeLevel('advanced')}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
                        knowledgeLevel === 'advanced' 
                          ? 'bg-white dark:bg-slate-700 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      Advanced
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Language</label>
                  <button className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">language</span>
                      <span>English (US)</span>
                    </div>
                    <span className="material-symbols-outlined text-base text-slate-400">expand_more</span>
                  </button>
                </div>
              </div>

              {/* AI Q&A Chat */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                  AI Q&A Assistant
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </label>
                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 mb-3 border border-primary/10">
                  <p className="text-[11px] text-primary/80 leading-relaxed italic">
                    "Hi there! I can help you understand variables better. Feel free to ask anything about this lesson."
                  </p>
                </div>
                <div className="relative">
                  <input 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-10 text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    placeholder="Ask a question..." 
                    type="text"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:bg-primary/10 p-1 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Quick Stat */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-2">
                <span>AI PROCESSING UNITS</span>
                <span>420 / 1000</span>
              </div>
              <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-[42%] bg-primary rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </aside>
        </div>

        {/* Collapsed Sidebar Button */}
        {sidebarCollapsed && (
          <button 
            onClick={() => setSidebarCollapsed(false)}
            className="fixed left-0 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-r-lg shadow-lg hover:px-3 transition-all z-30"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonContent;

