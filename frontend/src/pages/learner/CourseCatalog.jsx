import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Programming']);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [aiFeatures, setAiFeatures] = useState({
    audioSummary: true,
    videoTranscripts: false,
    walkthroughs: true,
    aiTutor: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState({});

  // Get user info from localStorage
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'Learner';

  // Mock courses data
  const allCourses = [
    {
      id: 1,
      title: 'Advanced Python: AI & ML Integration',
      instructor: 'Dr. Sarah Jenkins',
      duration: '14h 30m',
      level: 'Intermediate',
      levelColor: 'bg-blue-600',
      progress: 65,
      currentModule: 'Neural Nets',
      enrolled: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNgRj7-iSjM8qBSakYeDqNT0IVEKU9D-zNP5wEcho_qSWkn_JjpQ1eqnNh4gKQ4Pb0d148TpkLf1_uPiBdBqrPRKdn0UmX9TOvspv-Q9KIpm7T7w0U4x0BdisiWQPiFkk7SEMjqCf492u2cFdIDon1pzmPrTTCpQlRnvVxVERO4OuALPqoewGLrHdPGpSK6WLdCb3LdaQW9EYNEGEF3_XjbZ2q9-6Te3tYbfWYqsRqg9PVeF1aNPGvo3s5GOVmZYn883Fvz6j5Dmg',
      aiFeatures: ['Audio Summary', 'Video', 'AI Tutor'],
      aiIcons: ['mic', 'smart_display', 'psychology'],
      category: 'Programming'
    },
    {
      id: 2,
      title: 'Data Visualization Mastery with AI',
      instructor: 'Marcus Aurelio',
      duration: '8h 15m',
      level: 'Beginner',
      levelColor: 'bg-amber-500',
      progress: 0,
      enrolled: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5K3KDcXrGLeO4WR4K9hhmtNXR9Ln32k0OgPqPmV4_ECzi3SccqcnbWZD1QzUFJLeaqgGkF_isM03vnPce49QLIp_g5ZG9aRqi2hcyD8EhtSXoeLKivzNV9V37bN2WWK5u1uW9I9KA341jTW1rYe1aWWLi9X7S-bKq-6NIcinEZQUbjaOhaqXfAghEkX2520_MFCfwWb-e69PPG5A6Irc6BJz81Iu1e4C4h_2Z_vW3HPbDXNSMs8cx4MQIAqjSDS15drV5xNNRS8',
      description: 'Learn to build stunning interactive dashboards and use AI to automatically generate data stories and insights for stakeholders.',
      aiFeatures: ['Walkthrough', 'Video'],
      aiIcons: ['explore', 'smart_display'],
      category: 'Data Science'
    },
    {
      id: 3,
      title: 'Generative UI/UX Systems',
      instructor: 'Alex Rivera',
      duration: '22h 45m',
      level: 'Expert',
      levelColor: 'bg-emerald-500',
      progress: 0,
      enrolled: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsQk6Wgf0jKKjXi2EOQc2QP5gjuecZYbsMPpehBDu2NowIdySzlm2xRpq-M1yP1t0kI2ulDxLoaXBxUZr1xMew6UI6FGQatzjwuKTzjcEBr5A66_LqKjJ1y6PjHTQnLBeIztH7f_-ETOs41PaFuJsjlVSzyyW5YRMfM0V-MgIC7HiIYTclaKPnnNjlkhXoUhoCgKcfoBS3YqQQPMRxECK3Dk9ElSb-SxhjNP9OGyh5a878lgZnnhL1rDCiQQAMlp2R5FAK3gQmVrs',
      description: 'Explore the cutting edge of design systems that adapt in real-time using user behavior patterns and AI-driven layout generation.',
      aiFeatures: ['AI Labs', 'Video', 'Interactive'],
      aiIcons: ['psychology', 'smart_display', 'explore'],
      category: 'UI/UX Design'
    }
  ];

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleAiFeature = (feature) => {
    setAiFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const toggleFavorite = (courseId) => {
    setFavorites(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3 lg:px-12">
        <div className="flex items-center gap-10">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/dashboard/learner')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">AI LMS</h2>
          </div>
          <div className="hidden md:flex flex-1 min-w-[320px]">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="block w-full rounded-lg border-0 bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50"
                placeholder="Search courses, skills, or instructors..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-8">
          <button className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            <span>Ask AI</span>
          </button>
          
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          
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

      <div className="flex flex-1 px-6 lg:px-12 py-8 gap-8">
        {/* Sidebar Filter Panel */}
        <aside className="hidden lg:flex w-72 flex-col gap-8 shrink-0">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Categories
            </h3>
            <div className="space-y-2">
              {['Programming', 'Data Science', 'UI/UX Design', 'Business Intelligence'].map((category) => (
                <label key={category} className="flex items-center gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Level
            </h3>
            <div className="space-y-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <label key={level} className="flex items-center gap-3 group cursor-pointer">
                  <input
                    type="radio"
                    name="level"
                    checked={selectedLevel === level}
                    onChange={() => setSelectedLevel(level)}
                    className="h-5 w-5 border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div className="rounded-xl bg-blue-600/5 p-6 border border-blue-600/10">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-600 mb-4">
              <span className="material-symbols-outlined text-sm">bolt</span>
              AI Features
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-blue-600/70">mic</span>
                  <span className="text-sm font-medium">Audio Summary</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiFeatures.audioSummary}
                  onChange={() => toggleAiFeature('audioSummary')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-blue-600/70">smart_display</span>
                  <span className="text-sm font-medium">AI Video Transcripts</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiFeatures.videoTranscripts}
                  onChange={() => toggleAiFeature('videoTranscripts')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-blue-600/70">explore</span>
                  <span className="text-sm font-medium">Walkthroughs</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiFeatures.walkthroughs}
                  onChange={() => toggleAiFeature('walkthroughs')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-blue-600/70">psychology</span>
                  <span className="text-sm font-medium">Interactive AI Tutor</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiFeatures.aiTutor}
                  onChange={() => toggleAiFeature('aiTutor')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Tab Navigation */}
          <div className="mb-8 border-b border-slate-200">
            <nav className="flex gap-10">
              <button
                onClick={() => setActiveTab('all')}
                className={`relative pb-4 text-sm font-bold transition-colors ${
                  activeTab === 'all' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Courses
                {activeTab === 'all' && (
                  <span className="absolute bottom-0 left-0 h-1 w-full rounded-t bg-blue-600"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('inProgress')}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === 'inProgress' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === 'completed' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === 'wishlist' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Wishlist
              </button>
            </nav>
          </div>

          {/* Course Cards */}
          <div className="flex flex-col gap-6">
            {allCourses.map((course) => (
              <div
                key={course.id}
                className="group relative flex flex-col md:flex-row gap-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/learner/courses/${course.id}`)}
              >
                {/* Course Image */}
                <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl md:w-64">
                  <img
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={course.title}
                    src={course.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className={`rounded ${course.levelColor} px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white`}>
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(course.id);
                        }}
                        className={`text-slate-400 hover:text-rose-500 transition-colors ${
                          favorites[course.id] ? 'text-rose-500' : ''
                        }`}
                      >
                        <span
                          className="material-symbols-outlined leading-none"
                          style={{ fontVariationSettings: favorites[course.id] ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <span className="material-symbols-outlined text-base">person</span>
                        {course.instructor}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {course.duration}
                      </span>
                    </div>

                    {/* Progress Bar for Enrolled Courses */}
                    {course.enrolled && course.progress > 0 && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-blue-600">{course.progress}% Completed</span>
                          <span className="text-slate-400">Current Module: {course.currentModule}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-1000"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Description for Non-Enrolled Courses */}
                    {!course.enrolled && course.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* AI Features and Action Button */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {course.aiFeatures.map((feature, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1.5 rounded-full bg-blue-600/10 px-3 py-1 text-[11px] font-semibold text-blue-600"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {course.aiIcons[idx]}
                          </span>
                          {feature}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (course.enrolled) {
                          navigate(`/learner/courses/${course.id}`);
                        } else {
                          console.log('Enroll in course:', course.id);
                        }
                      }}
                      className={`whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-bold transition-all active:scale-95 ${
                        course.enrolled
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-600/90'
                          : 'border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-600/5'
                      }`}
                    >
                      {course.enrolled ? 'Continue Learning' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">Showing 3 of 124 courses</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  currentPage === 1
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100'
                }`}
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 2
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100'
                }`}
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 3
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100'
                }`}
              >
                3
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                disabled={currentPage === 3}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseCatalog;
