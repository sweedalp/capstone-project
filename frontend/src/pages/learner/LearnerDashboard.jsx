import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user info from localStorage
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';
  
  // Extract first name for welcome message
  const firstName = userName.split(' ')[0];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Handle smart navigation for course cards
  const handleContinueCourse = (course) => {
    // If there's a current lesson (user was in middle of learning), go directly to that lesson
    if (course.currentLessonId) {
      navigate(`/learner/courses/${course.id}/lessons/${course.currentLessonId}`);
    } else {
      // Otherwise, go to course overview
      navigate(`/learner/courses/${course.id}`);
    }
  };

  const learningProgressCourses = [
    {
      id: 1,
      category: 'Data Science',
      categoryColor: 'text-blue-600',
      title: 'Advanced Neural Networks',
      progress: 80,
      progressColor: 'bg-blue-600',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEwCakavR3A6U55aIk20ecNCSiHfO5-8XkHl7owlqewa-s_YC2HvlP4Yj9YcLmbvZcsxllvuZ1OFu655TVftAvhdyIewOeUeIiADmmSTJW8TAGPuZxtjPmfS1PuQ7y4EjMa6ULSAAi8PPocjemGCLhIA_qtmaZP2-GeObETmtdcFb0x-1GDFMDNhm98bTASVFeXY6LpfAOiAR_Igmk4Y1gHXscZSd3wfd2cKevnV9rGdss-oxqbPMZmYJzColbgPhgTdK0y7A6tu4',
      badges: ['headphones', 'movie'],
      currentLessonId: 6 // User is in middle of lesson 6 (Recurrent Neural Networks)
    },
    {
      id: 2,
      category: 'Design',
      categoryColor: 'text-emerald-500',
      title: 'UI/UX Interaction Principles',
      progress: 45,
      progressColor: 'bg-emerald-500',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZGqjGEsJtIJdLpr2eHWtA_mxTA8JjXKD0oAC8TNRtZ2iLTiAVYxVYboHriKP-kP3KCVtmdxSd_IbzcBrk3QXfD_RZ5nrv_H8kogpeoFDqliYPns4c6lHxUNRwkBXeeJWbiKGArqcNw-dwxEXfZ1Pni3p2pQ29wXzEGJ6LBqOZ4eaYmzzr3guWnv1-hGbwcb-JRiSs9kv3DU4HnNPdBXZevNwD3LXJZNwUA9QVLGED-I20ADhoVLOi8pWpBKQxyxYiKdYi_0AuwJ8',
      badges: ['interactive_space'],
      currentLessonId: 3 // User is in middle of lesson 3 (User Flows)
    },
    {
      id: 3,
      category: 'Engineering',
      categoryColor: 'text-purple-500',
      title: 'Introduction to Machine Learning',
      progress: 10,
      progressColor: 'bg-purple-500',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaLYiP9VaOCz7WiGtgrKkPS2TG0llmLr17e_euYME5mtBkCC6d6Qr6Zv1XF2R6WOYlwtO4I0Le0UPWkxhZ0wqJ3y4KonX1eX9svaBtmTbBWfqJW_VKypsOR6E9jSvgM5Tk_732Vnh6UNdMB_8dCmu0xBtQIUcTCCpq88gKxFi8av9B35STgv89YG_cn4RGR9BS3qsz_D69Fjo-l6hkz552ZipegTU2HAkRP9GWBhBP01vgQWxZEWzjddXktlykpI4sg7MOT2Rr5X0',
      badges: ['clinical_notes'],
      currentLessonId: null // No current lesson, will go to overview
    }
  ];

  const upcomingDeadlines = [
    {
      day: '24',
      month: 'SEP',
      title: 'Neural Nets Quiz',
      subtitle: '11:59 PM • Grade Weight 15%',
      color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
    },
    {
      day: '26',
      month: 'SEP',
      title: 'UI Case Study Submission',
      subtitle: '2 days left • Final Project',
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-600'
    }
  ];

  const recentActivities = [
    {
      icon: 'check_circle',
      iconColor: 'text-blue-600',
      text: 'Completed',
      boldText: 'Module 3: Optimization',
      time: '2 hours ago'
    },
    {
      icon: 'summarize',
      iconColor: 'text-amber-500',
      text: 'Generated AI notes for',
      boldText: 'Backpropagation',
      time: 'Yesterday, 4:15 PM'
    },
    {
      icon: 'forum',
      iconColor: 'text-purple-500',
      text: 'Started discussion in',
      boldText: 'Data Science 101',
      time: 'Sep 21, 10:30 AM'
    }
  ];

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
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">book_5</span>
            <span>My Courses</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">psychology</span>
            <span>AI Learning Hub</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">monitoring</span>
            <span>Analytics</span>
          </a>
          
          <div className="pt-8 pb-2 px-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal</p>
          </div>
          
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">bookmark</span>
            <span>Saved Resources</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase">Storage Used</p>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[65%]"></div>
            </div>
            <p className="text-[10px] mt-2 text-slate-400">1.3GB of 2GB cloud sync used</p>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
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
            <button className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Ask AI</span>
            </button>
            
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{userName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro {userRole}</p>
              </div>
              <img
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-600/20 cursor-pointer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3sIvMh27FT-1-5l63OFnJ96JCK02FnDfa-Jh7VCVLJtChF_DbUbjPXcSJaFL0xsMOdZ_3WrctqFTyQ76LwNYfnyTRGJSgp7x8gfEpZOUSmcrcomqGrkI1HzLgZ5wwtFpSPV3juSlq0S4dMI3hWsqpx9YrQl6r0VTM3rC4a9sICjU7H0jDrmFU5vn4_N7KYqAoCjCli95Dxc_2wpaC-KfhtkpGZwjOM8rriR-jihG9Fcgde5s5BVY-bI6q47y5U5MtXghVwNGiYM"
                alt={`Profile picture of ${userName}`}
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back, {firstName}! 👋</h1>
            <p className="text-slate-500 dark:text-slate-400">
              You've completed <span className="text-blue-600 font-bold">75%</span> of your weekly goal. 4 more modules to go!
            </p>
          </div>

          {/* Section 1: My Learning Progress Carousel */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">rocket_launch</span>
                My Learning Progress
              </h2>
              <button 
                className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate('/learner/courses')}
              >
                View All →
              </button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
              {learningProgressCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="flex-shrink-0 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleContinueCourse(course)}
                >
                  <div className="relative h-36">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={course.image}
                      alt={course.title}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {course.badges.map((badge, idx) => (
                        <div key={idx} className="bg-black/50 backdrop-blur-md text-white p-1 rounded-md" title={`AI ${badge} Available`}>
                          <span className="material-symbols-outlined text-[16px]">{badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className={`text-xs font-bold ${course.categoryColor} uppercase mb-1`}>{course.category}</p>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 line-clamp-1">{course.title}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>Progress</span>
                        <span className={course.categoryColor}>{course.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                        <div className={`${course.progressColor} h-full rounded-full`} style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Personalized For You */}
          <div className="mb-10">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white relative overflow-hidden">
              {/* Decorative Shapes */}
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-30px] left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-lg">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    Personalized Recap
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Your Daily Learning Brief is Ready</h2>
                  <p className="text-blue-50 text-opacity-90 mb-6">
                    AI generated a 2-minute recap video and summary points from your study session yesterday. Focus on 'Backpropagation' — it's where you slowed down.
                  </p>
                  <div className="flex gap-3">
                    <button className="bg-white text-blue-600 font-bold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                      Watch Recap
                    </button>
                    <button className="bg-transparent border border-white/30 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      Read Summary
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-48 h-32 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center group cursor-pointer">
                  <span className="material-symbols-outlined text-5xl text-white/50 group-hover:scale-110 transition-transform">play_circle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: AI Hub Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <h3 className="text-lg font-bold mb-2">AI Learning Hub</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Access all neural-enhanced tools and custom GPT models tailored to your curriculum.
              </p>
              <div className="flex items-center text-sm font-bold text-blue-600 gap-1">
                Explore Tools <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">key_visualizer</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Quick Concept Search</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Semantic search that finds specific concepts across video transcripts and PDFs instantly.
              </p>
              <div className="flex items-center text-sm font-bold text-amber-600 gap-1">
                Start Searching <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 mb-4 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">assignment_turned_in</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Revision Assistant</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Let AI generate interactive quizzes based on areas where your performance is dipping.
              </p>
              <div className="flex items-center text-sm font-bold text-rose-600 gap-1">
                Practice Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Right Activity Sidebar */}
      <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 hidden lg:flex flex-col p-6 overflow-y-auto">
        {/* Upcoming Deadlines */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Upcoming Deadlines</h3>
            <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
          </div>
          
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline, idx) => (
              <div key={idx} className="flex gap-4 items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                <div className={`flex-shrink-0 w-10 h-10 ${deadline.color} rounded-lg flex flex-col items-center justify-center font-bold text-[10px]`}>
                  <span className="text-sm">{deadline.day}</span>
                  <span>{deadline.month}</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{deadline.title}</p>
                  <p className="text-xs text-slate-500">{deadline.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Recent Activity</h3>
          <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="relative flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-800 rounded-full flex items-center justify-center z-10">
                  <span className={`material-symbols-outlined ${activity.iconColor} text-[18px]`}>{activity.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    {activity.text} <span className="font-bold">{activity.boldText}</span>
                  </p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Pro Tip */}
        <div className="mt-auto p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
            <span className="material-symbols-outlined text-lg">lightbulb</span>
            AI Pro Tip
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Try the "Deep Dive" mode on any video to get interactive code snippets generated in real-time.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default LearnerDashboard;
