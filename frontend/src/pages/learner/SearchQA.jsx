import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

const SearchQA = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user info from localStorage
  const userName = localStorage.getItem('userName') || 'User';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-blue-600">AI LMS</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <a 
            onClick={() => navigate('/learner/dashboard')} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a 
            onClick={() => navigate('/learner/courses')} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">book_5</span>
            <span>My Courses</span>
          </a>
          <a 
            onClick={() => navigate('/learner/ai-hub')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">psychology</span>
            <span>AI Learning Hub</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer">
            <span className="material-symbols-outlined">search</span>
            <span>Search & Q&A</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-600/20 text-sm placeholder:text-slate-400"
                placeholder="Search courses, concepts, or files..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-8">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined">settings</span>
            </button>
            
            <img
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600/20 ring-offset-2 cursor-pointer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqO_6_u7XMZ8xyg2MCESbqW7N4lkMfYGgxzf60W9RcElwsN71iciwR-U9fplws_-tfiO1dr8G6ExQiCSU0onuwvPTSan2Z2d7kh7iua6CIwk-13mWybw5u7LM0FnBueMuaFStD078HOgYKzs58Xm6qmqzukZ2un8apvZLY6ZffbHKQ-KhbrGN0C3JFm2K6ACp-VftGnUI_H6911_R9n19hZjH7R5z6WuIuJX6NTgFZxWZXQeazUZtZ3Y3ECiHrr_q5oUhRI6NIhLc"
              alt={`Profile of ${userName}`}
            />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-6 py-8">
          <div className="w-full max-w-7xl mx-auto">
            {/* Search Section */}
            <div className="max-w-3xl mx-auto mb-12 text-center">
              <h2 className="text-4xl font-black mb-4 tracking-tight">AI Concept Search</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                Ask any question in natural language to get instant educational insights.
              </p>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-blue-600">search</span>
                </div>
                <input
                  className="w-full pl-12 pr-32 py-4 bg-white dark:bg-slate-800 border-2 border-blue-600/20 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-xl text-lg shadow-xl shadow-blue-600/5 transition-all outline-none"
                  placeholder="e.g., What is a Python function?"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-2 right-2 flex items-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content (AI Answer) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  {/* AI Brand Accent */}
                  <div className="absolute top-0 right-0 p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span> AI Verified
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                    Understanding Python Functions
                  </h3>
                  
                  <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                    <p>
                      A <span className="text-blue-600 font-bold">function</span> is a reusable block of code that performs a specific task. Think of it as a sub-program within your script that you can "call" whenever you need that task performed, instead of writing the same code over and over.
                    </p>
                    
                    <div className="bg-blue-600/5 border-l-4 border-blue-600 p-4 rounded-r-lg">
                      <h4 className="font-bold text-blue-600 mb-2">Key Components:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong className="text-slate-800 dark:text-slate-100">def keyword:</strong> Used to define the start of a function.</li>
                        <li><strong className="text-slate-800 dark:text-slate-100">Parameters:</strong> Variables inside the parentheses that receive data.</li>
                        <li><strong className="text-slate-800 dark:text-slate-100">Indentation:</strong> The code block belonging to the function must be indented.</li>
                        <li><strong className="text-slate-800 dark:text-slate-100">Return:</strong> Sends a value back to where the function was called.</li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-100 relative group">
                      <div className="absolute top-2 right-2 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="material-symbols-outlined text-lg p-1 hover:text-white">content_copy</button>
                      </div>
                      <div>
                        <span className="text-blue-400">def</span> <span className="text-yellow-400">greet</span>(name):<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">return</span> <span className="text-green-400">f"Hello, {'{name}'}!"</span><br/><br/>
                        <span className="text-slate-400"># Calling the function</span><br/>
                        message = <span className="text-yellow-400">greet</span>(<span className="text-green-400">"Student"</span>)<br/>
                        <span className="text-yellow-400">print</span>(message)
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Toolbar */}
                  <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 dark:border-slate-700 pt-6">
                    <button 
                      onClick={() => navigate('/learner/ai-hub')}
                      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                      <span className="material-symbols-outlined">play_circle</span>
                      Watch Video
                    </button>
                    <button 
                      onClick={() => navigate('/learner/ai-hub')}
                      className="flex items-center gap-2 bg-blue-600/10 text-blue-600 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-600/20 transition-colors"
                    >
                      <span className="material-symbols-outlined">headphones</span>
                      Listen to Audio
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600/10 text-blue-600 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-600/20 transition-colors">
                      <span className="material-symbols-outlined">school</span>
                      Start Tutorial
                    </button>
                    <div className="flex-grow"></div>
                    <button className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <span className="material-symbols-outlined">bookmark</span>
                    </button>
                  </div>
                </div>
                
                {/* Tags Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex flex-col gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Prerequisites</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium hover:bg-blue-600/10 hover:text-blue-600 cursor-pointer transition-colors">Variables & Types</span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium hover:bg-blue-600/10 hover:text-blue-600 cursor-pointer transition-colors">Indentation Rules</span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium hover:bg-blue-600/10 hover:text-blue-600 cursor-pointer transition-colors">Basic Math Operators</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Advanced Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium hover:bg-blue-600/10 hover:text-blue-600 cursor-pointer transition-colors">*args and **kwargs</span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium hover:bg-blue-600/10 hover:text-blue-600 cursor-pointer transition-colors">Lambda Functions</span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium hover:bg-blue-600/10 hover:text-blue-600 cursor-pointer transition-colors">Decorators</span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium hover:bg-blue-600/10 hover:text-blue-600 cursor-pointer transition-colors">Recursion</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                {/* Found in Courses */}
                <section>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">local_library</span>
                    Found in Courses
                  </h4>
                  <div className="space-y-4">
                    <div 
                      onClick={() => navigate('/learner/courses/1')}
                      className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                          <img
                            alt="Python Course"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUZPItmk0eXml2rSUlfzHBZqRV68m6_ko-VaJ6e0se2KKeRUSBLzS28EAoi0ass_pi909HVkTfRsvPTZnqtzGDxGovI7sQBhfl_rfLamsrXQ1R6XUpq1yxf7_GmwpWfWbTfJLt3rZbCLFFjFfRL8aL7sHqNLtDT2zPZTVAo7UlttTvlbSZ7KXRiu0GuSMNPzsEB8d7Og8Ahes-3nsSTC60yp8dCEX_MiOv7UGBuZeSQDpVpH1sciX66fa8e0My5oFJetODry4UnSQ"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold group-hover:text-blue-600 transition-colors truncate">Python Basics 101</p>
                          <p className="text-xs text-slate-500">Module 4: Reusing Code</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 flex-shrink-0">chevron_right</span>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => navigate('/learner/courses/2')}
                      className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                          <img
                            alt="Data Science"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkpuBWXu2NonPBjYUtGfRWBJXHQrA61afYl7kPBTwIpsiW1Z_ust8CB6C0-SNXcSqiWGzW9Cf6b3rddmJ-jJe1eDfEgCaj3mxb3_faM4geZr4wSv5RshjZtGmTYOBskCclR2ncF_uFXYGNDG3Ct9M8u8KaPOqRNhrKEY9wzRXUqoKm0rUn6xASXRn2sFYQ5sg7T75QjfSzIc_EKnMXVNqvuQHKV6vyQn11iY3eiwEvQVeCh_QyciJwmgNMDry9NJDElBqd95YnUBs"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold group-hover:text-blue-600 transition-colors truncate">Data Science Bootcamp</p>
                          <p className="text-xs text-slate-500">Preprocessing & Cleansing</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 flex-shrink-0">chevron_right</span>
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Related Content */}
                <section>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">dynamic_feed</span>
                    Related Content
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-600/50 transition-colors cursor-pointer">
                      <div className="bg-red-50 text-red-500 p-2 rounded-lg flex-shrink-0">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium hover:text-blue-600 transition-colors">Python Cheat Sheet.pdf</p>
                        <p className="text-xs text-slate-500">2.4 MB • 15k downloads</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-600/50 transition-colors cursor-pointer">
                      <div className="bg-blue-600/10 text-blue-600 p-2 rounded-lg flex-shrink-0">
                        <span className="material-symbols-outlined">forum</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium hover:text-blue-600 transition-colors">Community: Best practices for function naming?</p>
                        <p className="text-xs text-slate-500">42 comments • Active today</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-600/50 transition-colors cursor-pointer">
                      <div className="bg-green-50 text-green-500 p-2 rounded-lg flex-shrink-0">
                        <span className="material-symbols-outlined">integration_instructions</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium hover:text-blue-600 transition-colors">Lab: Write your first function</p>
                        <p className="text-xs text-slate-500">Interactive Code Environment</p>
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Feedback */}
                <div className="bg-blue-600/5 rounded-xl p-6 text-center border border-blue-600/10">
                  <p className="text-sm font-medium mb-3">Was this answer helpful?</p>
                  <div className="flex justify-center gap-4">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm border border-slate-100 dark:border-slate-700 hover:border-blue-600 transition-colors">
                      <span className="material-symbols-outlined text-blue-600 text-sm">thumb_up</span> Yes
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm border border-slate-100 dark:border-slate-700 hover:border-red-400 transition-colors">
                      <span className="material-symbols-outlined text-red-400 text-sm">thumb_down</span> No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchQA;
