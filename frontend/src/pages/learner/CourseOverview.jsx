import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import '../../index.css';

const CourseOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  
  // Get user info from localStorage
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';
  const [activeTab, setActiveTab] = useState('content');
  const [expandedChapter, setExpandedChapter] = useState(2);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [selectedLockedLesson, setSelectedLockedLesson] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Handle navigation state for activeTab and enrollment modal
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.showEnrollModal) {
      setShowEnrollModal(true);
    }
  }, [location.state]);

  // Handle Ask AI button click
  const handleAskAI = () => {
    navigate('/learner/ai-hub', {
      state: { openChat: true }
    });
  };

  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'deadline',
      icon: 'schedule',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-100',
      title: 'Neural Nets Quiz Due Soon',
      message: 'Quiz deadline is tomorrow at 11:59 PM',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      type: 'achievement',
      icon: 'military_tech',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'New Badge Earned!',
      message: 'You earned "Python Master" badge',
      time: '5 hours ago',
      unread: true
    },
    {
      id: 3,
      type: 'ai',
      icon: 'psychology',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'AI Generated Summary Ready',
      message: 'Your study session recap is available',
      time: 'Yesterday',
      unread: false
    },
    {
      id: 4,
      type: 'course',
      icon: 'auto_stories',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'New Lesson Available',
      message: 'Module 4: Deep Learning has been released',
      time: '2 days ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/learner/search', {
        state: { query: searchQuery }
      });
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Dynamic course data based on courseId
  const coursesData = {
    '1': {
      title: 'Introduction to Python',
      category: 'Data Science',
      icon: 'terminal',
      iconGradient: 'from-primary to-blue-600',
      instructor: 'Dr. Sarah Jenkins',
      instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWVqHLGE20FLE7DhWuFWau1WAnytMXwtU6hIm0LYP9y-RyQtwnGzc5NJeSvCGDz-Hk7DKa8phqati5904V3hw7_BvgkpOk2_Lq-QSydFwyrkPn30gS3umGent09AyvsSNy5AvBfNWTD9jhRBUCyTtnjKkDbW7GqI7KF9mDilNteTNh7EvV-XwcZNrs-FO0fIKBoVFlV_IaYY34tTdImH1yufYokouUmI41gaN6VQyAhGcqKVmSbI8NMyzbj0OSMBG7JZ25Eni0u8g',
      updated: 'Updated Oct 2023',
      progress: 80,
      currentLessonId: '2.1',
      description: 'This comprehensive Python course takes you from beginner to confident programmer. Learn the fundamentals of Python programming, including variables, data types, control flow, and data structures. Through hands-on projects and AI-enhanced learning materials, you\'ll build practical skills that apply to real-world scenarios.',
      whatYouLearn: [
        'Master Python syntax and programming fundamentals',
        'Understand control flow with conditionals and loops',
        'Work with data structures like lists, tuples, and dictionaries',
        'Build functional programs with AI-assisted learning'
      ],
      prerequisites: 'No prior programming experience required. Just bring your curiosity and willingness to learn!',
      keyTakeaways: [
        'Master Pythonic syntax and core programming paradigms.',
        'Build functional scripts for automation and data analysis.',
        'Integrate AI tools to optimize code quality and speed.'
      ],
      resources: [
        { name: 'Python Cheat Sheet', type: 'PDF', size: '2.4 MB', icon: 'picture_as_pdf', color: 'text-red-600' },
        { name: 'Practice Exercises', type: 'ZIP', size: '1.8 MB', icon: 'code', color: 'text-blue-600' },
        { name: 'Course Slides', type: 'PDF', size: '5.1 MB', icon: 'description', color: 'text-green-600' }
      ],
      aiHubContent: {
        audioSummaries: [
          { title: 'Control Flow Explained', duration: '8:30', chapter: 'Chapter 2' },
          { title: 'Loop Fundamentals', duration: '6:15', chapter: 'Chapter 2' }
        ],
        videoTopics: ['Conditionals', 'Loops', 'Functions', 'Data Types'],
        walkthroughs: [
          { title: 'Build Your First Conditional', duration: '15 min', lessonId: '2.1' },
          { title: 'Loop Through Lists', duration: '12 min', lessonId: '2.2' }
        ]
      },
      objectives: [
        { id: 1, text: 'Understand Variables & Types', completed: true },
        { id: 2, text: 'Implement Basic Error Handling', completed: true },
        { id: 3, text: 'Design Efficient For-Loops', completed: false },
        { id: 4, text: 'Work with Dictionary Data Types', completed: false },
        { id: 5, text: 'Optimize scripts with AI Co-pilot', completed: false },
      ],
      chapters: [
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
          lessons_list: [
            { id: '1.1', title: '1.1 Introduction to Python', type: 'Video', duration: '10:30', icon: 'movie', status: 'completed', aiFeatures: ['video', 'mic'] },
            { id: '1.2', title: '1.2 Variables & Types', type: 'Interactive', duration: '15:00', icon: 'explore', status: 'completed', aiFeatures: ['video', 'mic', 'explore'] },
          ]
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
            { id: '2.1', title: '2.1 Conditional Statements (if/else)', type: 'Video', duration: '12:45', icon: 'movie', status: 'in-progress', aiFeatures: ['video', 'mic', 'explore'] },
            { id: '2.2', title: '2.2 Loop Logic Explained', type: 'Audio Guide', duration: '08:20', icon: 'mic', status: 'not-started', aiFeatures: ['video', 'mic'] },
            { id: '2.3', title: '2.3 Interactive Logic Flowchart', type: 'Interactive Lab', duration: '15:00', icon: 'explore', status: 'not-started', aiFeatures: ['explore', 'smart_toy'] },
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
          lessons_list: [
            { id: '3.1', title: '3.1 Lists & Tuples', type: 'Video', duration: '14:00', icon: 'movie', status: 'locked', prerequisite: 'Complete Chapter 2: Control Flow & Logic', aiFeatures: ['video', 'mic', 'explore', 'smart_toy'] },
            { id: '3.2', title: '3.2 Dictionaries', type: 'Interactive', duration: '18:30', icon: 'explore', status: 'locked', prerequisite: 'Complete Chapter 2: Control Flow & Logic', aiFeatures: ['video', 'mic'] },
          ]
        }
      ]
    },
    '2': {
      title: 'Advanced Neural Networks',
      category: 'Data Science',
      icon: 'psychology',
      iconGradient: 'from-blue-600 to-indigo-600',
      instructor: 'Dr. Michael Chen',
      instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJM0PQxl6wj-PufwBF99_5Pxk0wS9O3TzDV1V0qvTYlzRnSHehIUxfq-bi5wDDS8Na6WgXaM0DnBGNpmTx4ZG4xU2RccPCalIfzLctxvBCvH8d6vz0RsCKC7giMO4SVAFvqbwZt48-8xIFRVB9jjCBy1wt5FetTtmY-pmQ52AIA4_2B3e_S5MDYneeSu1y04BokCStrTBh9fMdquqD-mPZrnTUNvJELq-HuJKIKp3ygCCSLrsKDl3J_k-9L_e3xi_MJWJvr1h4leM',
      updated: 'Updated Jan 2024',
      progress: 60,
      currentLessonId: '2.2',
      description: 'Dive deep into the world of neural networks and deep learning. This advanced course covers cutting-edge architectures, backpropagation algorithms, and optimization techniques. Perfect for those who want to master AI/ML concepts and build production-ready neural network models.',
      whatYouLearn: [
        'Understand neural network architectures and deep learning theory',
        'Implement backpropagation and gradient descent from scratch',
        'Master activation functions and loss optimization',
        'Deploy neural networks in production environments'
      ],
      prerequisites: 'Basic Python knowledge and linear algebra fundamentals. Familiarity with NumPy and TensorFlow is helpful but not required.',
      keyTakeaways: [
        'Build production-ready neural networks with modern frameworks.',
        'Optimize model performance using advanced techniques.',
        'Understand mathematical foundations of deep learning.'
      ],
      resources: [
        { name: 'Neural Networks Guide', type: 'PDF', size: '4.2 MB', icon: 'picture_as_pdf', color: 'text-red-600' },
        { name: 'Training Notebooks', type: 'ZIP', size: '3.5 MB', icon: 'code', color: 'text-blue-600' },
        { name: 'Architecture Diagrams', type: 'PDF', size: '2.8 MB', icon: 'description', color: 'text-green-600' }
      ],
      aiHubContent: {
        audioSummaries: [
          { title: 'Backpropagation Demystified', duration: '10:45', chapter: 'Chapter 2' },
          { title: 'Activation Functions Guide', duration: '7:20', chapter: 'Chapter 2' }
        ],
        videoTopics: ['Perceptrons', 'Backprop', 'CNNs', 'RNNs'],
        walkthroughs: [
          { title: 'Build a Simple Neural Net', duration: '18 min', lessonId: '2.1' },
          { title: 'Optimize with Gradient Descent', duration: '15 min', lessonId: '2.2' }
        ]
      },
      objectives: [
        { id: 1, text: 'Understand Neural Network Architecture', completed: true },
        { id: 2, text: 'Implement Backpropagation', completed: true },
        { id: 3, text: 'Master Activation Functions', completed: false },
        { id: 4, text: 'Optimize Deep Learning Models', completed: false },
        { id: 5, text: 'Deploy Neural Networks in Production', completed: false },
      ],
      chapters: [
        {
          id: 1,
          title: 'Chapter 1: Neural Network Basics',
          status: 'completed',
          lessons: 4,
          duration: '55 mins',
          icon: 'check',
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          bgColor: 'bg-slate-50/50 dark:bg-slate-800/30',
          lessons_list: [
            { id: '1.1', title: '1.1 Introduction to Neural Networks', type: 'Video', duration: '14:00', icon: 'movie', status: 'completed', aiFeatures: ['video', 'mic'] },
            { id: '1.2', title: '1.2 Perceptrons & Layers', type: 'Interactive', duration: '20:00', icon: 'explore', status: 'completed', aiFeatures: ['video', 'explore', 'smart_toy'] },
          ]
        },
        {
          id: 2,
          title: 'Chapter 2: Deep Learning Fundamentals',
          status: 'current',
          subtitle: 'Current Chapter • 2 lessons remaining',
          icon: 'play_arrow',
          iconColor: 'text-white',
          iconBg: 'bg-primary',
          bgColor: 'bg-primary/5',
          lessons_list: [
            { id: '2.1', title: '2.1 Backpropagation Algorithm', type: 'Video', duration: '18:30', icon: 'movie', status: 'completed', aiFeatures: ['video', 'mic'] },
            { id: '2.2', title: '2.2 Gradient Descent Optimization', type: 'Interactive Lab', duration: '22:00', icon: 'explore', status: 'in-progress', aiFeatures: ['explore', 'smart_toy'] },
            { id: '2.3', title: '2.3 Loss Functions Explained', type: 'Audio Guide', duration: '12:15', icon: 'mic', status: 'not-started', aiFeatures: ['mic', 'video'] },
          ]
        },
        {
          id: 3,
          title: 'Chapter 3: Advanced Architectures',
          status: 'locked',
          subtitle: 'Prerequisite: Complete Chapter 2',
          icon: 'lock',
          iconColor: 'text-slate-500',
          iconBg: 'bg-slate-200 dark:bg-slate-700',
          lessons_list: [
            { id: '3.1', title: '3.1 Convolutional Neural Networks', type: 'Video', duration: '25:00', icon: 'movie', status: 'locked', prerequisite: 'Complete Chapter 2: Deep Learning Fundamentals', aiFeatures: ['video', 'smart_toy'] },
            { id: '3.2', title: '3.2 Recurrent Neural Networks', type: 'Interactive', duration: '28:00', icon: 'explore', status: 'locked', prerequisite: 'Complete Chapter 2: Deep Learning Fundamentals', aiFeatures: ['explore', 'mic'] },
          ]
        }
      ]
    },
    '3': {
      title: 'UI/UX Design Principles',
      category: 'Design',
      icon: 'palette',
      iconGradient: 'from-emerald-500 to-teal-600',
      instructor: 'Prof. Emily Rodriguez',
      instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN3sIvMh27FT-1-5l63OFnJ96JCK02FnDfa-Jh7VCVLJtChF_DbUbjPXcSJaFL0xsMOdZ_3WrctqFTyQ76LwNYfnyTRGJSgp7x8gfEpZOUSmcrcomqGrkI1HzLgZ5wwtFpSPV3juSlq0S4dMI3hWsqpx9YrQl6r0VTM3rC4a9sICjU7H0jDrmFU5vn4_N7KYqAoCjCli95Dxc_2wpaC-KfhtkpGZwjOM8rriR-jihG9Fcgde5s5BVY-bI6q47y5U5MtXghVwNGiYM',
      updated: 'Updated Nov 2023',
      progress: 35,
      currentLessonId: '2.1',
      description: 'Master the art and science of creating exceptional user experiences. This course covers design fundamentals, user research methodologies, wireframing, prototyping, and usability testing. Learn to create user-centered designs that delight and convert.',
      whatYouLearn: [
        'Apply color theory and typography principles effectively',
        'Conduct user research and create detailed personas',
        'Design wireframes and high-fidelity prototypes',
        'Perform usability testing and iterate on feedback'
      ],
      prerequisites: 'No prior design experience required. Access to Figma or Adobe XD recommended for practical exercises.',
      keyTakeaways: [
        'Design user-centered interfaces that drive engagement.',
        'Conduct effective user research and testing sessions.',
        'Create professional wireframes and interactive prototypes.'
      ],
      resources: [
        { name: 'Design System Guide', type: 'PDF', size: '3.6 MB', icon: 'picture_as_pdf', color: 'text-red-600' },
        { name: 'Figma Templates', type: 'ZIP', size: '2.1 MB', icon: 'code', color: 'text-blue-600' },
        { name: 'UX Research Toolkit', type: 'PDF', size: '4.3 MB', icon: 'description', color: 'text-green-600' }
      ],
      aiHubContent: {
        audioSummaries: [
          { title: 'Color Theory Essentials', duration: '9:15', chapter: 'Chapter 1' },
          { title: 'User Persona Creation', duration: '8:40', chapter: 'Chapter 2' }
        ],
        videoTopics: ['Typography', 'Layouts', 'Wireframes', 'Prototypes'],
        walkthroughs: [
          { title: 'Design Your First Mockup', duration: '20 min', lessonId: '2.1' },
          { title: 'Create User Journey Maps', duration: '16 min', lessonId: '2.2' }
        ]
      },
      objectives: [
        { id: 1, text: 'Master Color Theory & Typography', completed: true },
        { id: 2, text: 'Create User Personas', completed: false },
        { id: 3, text: 'Design Wireframes & Prototypes', completed: false },
        { id: 4, text: 'Conduct Usability Testing', completed: false },
        { id: 5, text: 'Build Interactive Components', completed: false },
      ],
      chapters: [
        {
          id: 1,
          title: 'Chapter 1: Design Fundamentals',
          status: 'completed',
          lessons: 4,
          duration: '50 mins',
          icon: 'check',
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          bgColor: 'bg-slate-50/50 dark:bg-slate-800/30',
          lessons_list: [
            { id: '1.1', title: '1.1 Introduction to UI/UX', type: 'Video', duration: '12:00', icon: 'movie', status: 'completed', aiFeatures: ['video', 'mic'] },
            { id: '1.2', title: '1.2 Color Theory Basics', type: 'Interactive', duration: '18:00', icon: 'explore', status: 'completed', aiFeatures: ['video', 'explore'] },
          ]
        },
        {
          id: 2,
          title: 'Chapter 2: User Research & Personas',
          status: 'current',
          subtitle: 'Current Chapter • 3 lessons remaining',
          icon: 'play_arrow',
          iconColor: 'text-white',
          iconBg: 'bg-primary',
          bgColor: 'bg-primary/5',
          lessons_list: [
            { id: '2.1', title: '2.1 User Research Methods', type: 'Video', duration: '15:30', icon: 'movie', status: 'in-progress', aiFeatures: ['video', 'mic'] },
            { id: '2.2', title: '2.2 Creating User Personas', type: 'Interactive Lab', duration: '20:00', icon: 'explore', status: 'not-started', aiFeatures: ['explore', 'smart_toy'] },
            { id: '2.3', title: '2.3 User Journey Mapping', type: 'Audio Guide', duration: '10:15', icon: 'mic', status: 'not-started', aiFeatures: ['mic', 'video'] },
          ]
        },
        {
          id: 3,
          title: 'Chapter 3: Wireframing & Prototyping',
          status: 'locked',
          subtitle: 'Prerequisite: Complete Chapter 2',
          icon: 'lock',
          iconColor: 'text-slate-500',
          iconBg: 'bg-slate-200 dark:bg-slate-700',
          lessons_list: [
            { id: '3.1', title: '3.1 Low-Fidelity Wireframes', type: 'Interactive', duration: '25:00', icon: 'explore', status: 'locked', prerequisite: 'Complete Chapter 2: User Research', aiFeatures: ['explore', 'smart_toy'] },
            { id: '3.2', title: '3.2 High-Fidelity Prototypes', type: 'Video', duration: '30:00', icon: 'movie', status: 'locked', prerequisite: 'Complete Chapter 2: User Research', aiFeatures: ['video', 'mic', 'explore'] },
          ]
        }
      ]
    }
  };

  // Get current course data or default to course 1
  const currentCourse = coursesData[courseId] || coursesData['1'];
  
  const [objectives, setObjectives] = useState(currentCourse.objectives);
  const chapters = currentCourse.chapters;
  const progressPercentage = currentCourse.progress;

  // Update objectives when courseId changes
  useEffect(() => {
    setObjectives(currentCourse.objectives);
  }, [courseId]);

  const toggleChapter = (chapterId) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const toggleObjective = (id) => {
    setObjectives(objectives.map(obj => 
      obj.id === id ? { ...obj, completed: !obj.completed } : obj
    ));
  };

  const aiFeatureIcons = {
    'video': 'movie',
    'mic': 'mic',
    'explore': 'explore',
    'smart_toy': 'smart_toy'
  };

  const aiFeatureLabels = {
    'video': 'Video',
    'mic': 'Audio',
    'explore': 'Walkthrough',
    'smart_toy': 'AI Tutor'
  };

  const handleLockedLessonClick = (lesson) => {
    setSelectedLockedLesson(lesson);
    setShowPrerequisiteModal(true);
  };

  const handleAIBadgeClick = (e, lessonId, aiFeature) => {
    e.stopPropagation();
    navigate(`/learner/courses/${courseId}/lessons/${lessonId}`, {
      state: { aiFeature: aiFeature }
    });
  };
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-blue-600">AI LMS</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => navigate('/learner/dashboard')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => navigate('/learner/courses')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">book_5</span>
            <span>My Courses</span>
          </button>
          <button 
            onClick={() => navigate('/learner/ai-hub')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">psychology</span>
            <span>AI Learning Hub</span>
          </button>
          <button 
            onClick={() => navigate('/learner/analytics')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span>Analytics</span>
          </button>
          
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
        <div className="flex items-center flex-1 max-w-xl">
          <form onSubmit={handleSearch} className="relative w-full group">
            <button
              type="submit"
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 hover:text-blue-600 cursor-pointer z-10"
            >
              search
            </button>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-600/20 text-sm placeholder:text-slate-400"
              placeholder="Search courses, concepts, or files..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
          </form>
        </div>
        
        <div className="flex items-center gap-4 ml-8">
         
          
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={handleNotificationsToggle}
              className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[500px] flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors ${
                        notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 ${notification.iconBg} dark:${notification.iconBg.replace('100', '900/30')} rounded-full flex items-center justify-center`}>
                          <span className={`material-symbols-outlined text-lg ${notification.iconColor}`}>
                            {notification.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                              {notification.title}
                            </p>
                            {notification.unread && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      // Navigate to notifications page if you have one
                    }}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 w-full text-center"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{userName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro {userRole}</p>
            </div>
            <ProfileDropdown
              userName={userName}
              userEmail={userEmail}
              profileImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3sIvMh27FT-1-5l63OFnJ96JCK02FnDfa-Jh7VCVLJtChF_DbUbjPXcSJaFL0xsMOdZ_3WrctqFTyQ76LwNYfnyTRGJSgp7x8gfEpZOUSmcrcomqGrkI1HzLgZ5wwtFpSPV3juSlq0S4dMI3hWsqpx9YrQl6r0VTM3rC4a9sICjU7H0jDrmFU5vn4_N7KYqAoCjCli95Dxc_2wpaC-KfhtkpGZwjOM8rriR-jihG9Fcgde5s5BVY-bI6q47y5U5MtXghVwNGiYM"
            />
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8">
          {/* Back to Catalog Button */}
          <button 
            onClick={() => navigate('/learner/courses')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 group"
          >
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="font-semibold">Back to Catalog</span>
          </button>

          {/* Hero Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Course Banner/Avatar */}
            <div className="relative shrink-0">
              <div className={`w-32 h-32 rounded-xl bg-gradient-to-br ${currentCourse.iconGradient} flex items-center justify-center text-white shadow-lg`}>
                <span className="material-symbols-outlined text-6xl">{currentCourse.icon}</span>
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{currentCourse.title}</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                <div className="flex items-center gap-1.5">
                  <img className="w-6 h-6 rounded-full" alt={`Instructor portrait ${currentCourse.instructor}`} src={currentCourse.instructorImage} />
                  <span>{currentCourse.instructor}</span>
                </div>
                <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  <span>{currentCourse.updated}</span>
                </div>
                <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">language</span>
                  <span>English</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <button 
                  onClick={() => navigate(`/learner/courses/${courseId}/lessons/${currentCourse.currentLessonId}`)}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Continue Where You Left Off
                </button>
                <button 
                  onClick={() => navigate(`/learner/courses/${courseId}/assessments/ch2-quiz`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">quiz</span>
                  Take Assessment
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

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Course Description</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {currentCourse.description}
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">What You'll Learn</h3>
                <ul className="space-y-3 mb-6">
                  {currentCourse.whatYouLearn.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Prerequisites</h3>
                <p className="text-slate-600 dark:text-slate-400">{currentCourse.prerequisites}</p>
              </div>
            )}

            {activeTab === 'ai-hub' && (
              <div className="space-y-6">
                {/* Audio Summaries Section */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-2xl">mic</span>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audio Summaries</h2>
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-semibold">
                        {currentCourse.aiHubContent.audioSummaries.length * 6} available
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate('/learner/ai-hub', { state: { filter: 'audio', courseId } })}
                      className="text-sm text-primary hover:text-primary/80 font-semibold"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCourse.aiHubContent.audioSummaries.map((audio, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setSelectedMedia({
                            type: 'audio',
                            title: audio.title,
                            duration: audio.duration,
                            chapter: audio.chapter,
                            description: `Listen to an audio summary explaining ${audio.title.toLowerCase()} concepts.`
                          });
                          setShowMediaModal(true);
                        }}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white mb-2">🎤 {audio.title}</p>
                        <p className="text-xs text-slate-500 mb-3">{audio.duration} • {audio.chapter}</p>
                        <button className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                          Play Audio
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Explainers Section */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-2xl">movie</span>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Video Explainers</h2>
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-semibold">
                        {currentCourse.aiHubContent.videoTopics.length * 2} available
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate('/learner/ai-hub', { state: { filter: 'video', courseId } })}
                      className="text-sm text-primary hover:text-primary/80 font-semibold"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentCourse.aiHubContent.videoTopics.map((topic, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setSelectedMedia({
                            type: 'video',
                            title: `${topic} Video Explainer`,
                            duration: '5:30',
                            chapter: 'Chapter 2',
                            description: `Watch a comprehensive video explanation of ${topic.toLowerCase()} concepts with visual examples.`
                          });
                          setShowMediaModal(true);
                        }}
                        className="relative group cursor-pointer"
                      >
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-primary">play_circle</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-2">{topic}</p>
                        <p className="text-xs text-slate-500">5:30</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Walkthroughs Section */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-2xl">explore</span>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Interactive Walkthroughs</h2>
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-semibold">
                        {currentCourse.aiHubContent.walkthroughs.length * 3} available
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {currentCourse.aiHubContent.walkthroughs.map((walkthrough, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">🧭 {walkthrough.title}</p>
                          <p className="text-xs text-slate-500">Step-by-step guide • {walkthrough.duration}</p>
                        </div>
                        <button 
                          onClick={() => navigate(`/learner/courses/${courseId}/lessons/${walkthrough.lessonId}`, { 
                            state: { aiFeature: 'walkthrough', walkthroughId: walkthrough.title.toLowerCase().replace(/\s+/g, '-'), autoStart: true } 
                          })}
                          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Course Resources</h2>
                <div className="space-y-3">
                  {currentCourse.resources.map((resource, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                      <span className={`material-symbols-outlined ${resource.color} text-2xl`}>{resource.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{resource.name}</p>
                        <p className="text-xs text-slate-500">{resource.type} • {resource.size}</p>
                      </div>
                      <button className="text-primary hover:text-primary/80">
                        <span className="material-symbols-outlined">download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accordion Syllabus (shown for 'content' tab) */}
            {activeTab === 'content' && (
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
                  {expandedChapter === chapter.id && chapter.lessons_list && chapter.lessons_list.length > 0 && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {chapter.lessons_list.map((lesson) => (
                        <div 
                          key={lesson.id}
                          onClick={() => {
                            if (lesson.status === 'locked') {
                              handleLockedLessonClick(lesson);
                            } else {
                              navigate(`/learner/courses/${courseId}/lessons/${lesson.id}`);
                            }
                          }}
                          className={`p-4 transition-colors flex items-center justify-between group ${
                            lesson.status === 'locked' 
                              ? 'cursor-not-allowed opacity-60' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="relative">
                              <span className={`material-symbols-outlined bg-primary/10 p-2 rounded-lg transition-transform ${
                                lesson.status === 'locked' ? 'text-slate-400' : 'text-primary group-hover:scale-110'
                              }`}>
                                {lesson.icon}
                              </span>
                              {lesson.status === 'completed' && (
                                <span className="absolute -top-1 -right-1 material-symbols-outlined text-green-600 text-lg bg-white dark:bg-slate-900 rounded-full">
                                  check_circle
                                </span>
                              )}
                              {lesson.status === 'locked' && (
                                <span className="absolute -top-1 -right-1 material-symbols-outlined text-slate-500 text-lg bg-white dark:bg-slate-900 rounded-full">
                                  lock
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm font-medium transition-colors ${
                                  lesson.status === 'locked'
                                    ? 'text-slate-500 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-white group-hover:text-primary'
                                }`}>{lesson.title}</p>
                              </div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <p className="text-xs text-slate-500">{lesson.type} • {lesson.duration}</p>
                                {lesson.aiFeatures && lesson.aiFeatures.length > 0 && lesson.status !== 'locked' && (
                                  <div className="flex items-center gap-1.5">
                                    {lesson.aiFeatures.map((feature, idx) => (
                                      <button
                                        key={idx}
                                        onClick={(e) => handleAIBadgeClick(e, lesson.id, feature)}
                                        className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors"
                                        title={aiFeatureLabels[feature]}
                                      >
                                        <span className="material-symbols-outlined text-xs">{aiFeatureIcons[feature]}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {lesson.status !== 'locked' && (
                            <span className="material-symbols-outlined text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1">
                              arrow_forward
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
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
                {currentCourse.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span>
                    {takeaway}
                  </li>
                ))}
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

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
          <p>© 2023 AI Learning Hub • Powered by Nexa Learning Engine</p>
        </footer>
        </div>
      </main>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEnrollModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Enroll in Course</h2>
                <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Join thousands of learners mastering Python with AI-enhanced learning!</p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Flexible Schedule</p>
                    <p className="text-xs text-slate-500">Learn at your own pace</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Learning Tools</p>
                    <p className="text-xs text-slate-500">Video, audio & interactive guides</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <span className="material-symbols-outlined text-primary">workspace_premium</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Certificate</p>
                    <p className="text-xs text-slate-500">Earn upon completion</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                >
                  Maybe Later
                </button>
                <button 
                  onClick={() => {
                    setShowEnrollModal(false);
                    // Here you would handle enrollment logic
                  }}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prerequisite Modal */}
      {showPrerequisiteModal && selectedLockedLesson && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPrerequisiteModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 text-2xl">lock</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lesson Locked</h2>
                  <p className="text-sm text-slate-500">Complete prerequisites first</p>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{selectedLockedLesson.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  To unlock this lesson, you need to:
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg mb-6">
                <span className="material-symbols-outlined text-primary mt-0.5">arrow_forward</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Prerequisite</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedLockedLesson.prerequisite}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPrerequisiteModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                >
                  Got It
                </button>
                <button 
                  onClick={() => {
                    setShowPrerequisiteModal(false);
                    setExpandedChapter(2); // Expand the prerequisite chapter
                  }}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  Start Prerequisites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Player Modal (Audio/Video) */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMediaModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${selectedMedia.type === 'audio' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${selectedMedia.type === 'audio' ? 'text-purple-600' : 'text-blue-600'} text-2xl`}>
                      {selectedMedia.type === 'audio' ? 'mic' : 'movie'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedMedia.title}</h2>
                    <p className="text-sm text-slate-500">{selectedMedia.duration} • {selectedMedia.chapter}</p>
                  </div>
                </div>
                <button onClick={() => setShowMediaModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 mb-6">{selectedMedia.description}</p>

              {/* Media Player UI */}
              <div className={`${selectedMedia.type === 'video' ? 'aspect-video' : 'aspect-[3/1]'} bg-gradient-to-br ${selectedMedia.type === 'audio' ? 'from-purple-500/20 to-blue-500/20' : 'from-blue-500/20 to-primary/20'} rounded-lg flex items-center justify-center mb-6 relative`}>
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-primary mb-2">
                    {selectedMedia.type === 'audio' ? 'graphic_eq' : 'play_circle'}
                  </span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedMedia.type === 'audio' ? 'Audio Player' : 'Video Player'}
                  </p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500">0:00</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full"></div>
                  </div>
                  <span className="text-xs text-slate-500">{selectedMedia.duration}</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">replay_10</span>
                  </button>
                  <button className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors shadow-lg">
                    <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">forward_10</span>
                  </button>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-xl">speed</span>
                  </button>
                  <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-xl">volume_up</span>
                  </button>
                  <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-xl">closed_caption</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowMediaModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
                <button 
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">bookmark</span>
                  Save to Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseOverview;
