import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'learner',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and privacy policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user info
      localStorage.setItem('userRole', formData.role);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', formData.fullName);
      
      // Navigate to role-specific dashboard
      const dashboardRoutes = {
        'learner': '/dashboard/learner',
        'trainer': '/dashboard/trainer',
        'admin': '/dashboard/admin',
        'leadership': '/dashboard/leadership'
      };
      
      const dashboardRoute = dashboardRoutes[formData.role] || '/dashboard/learner';
      navigate(dashboardRoute);
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = (provider) => {
    // TODO: Implement actual SSO authentication
    console.log(`${provider} SSO registration clicked`);
    alert(`${provider} registration will be implemented with OAuth`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  return (
    <main className="w-full h-screen flex flex-col md:flex-row bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Left Section: Visual/Branding */}
      <section className="relative w-full md:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-16 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        {/* Gradient Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
           <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <span className="text-xl font-bold tracking-tight">LTC Platform</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight text-slate-900 dark:text-white">
            Next-gen <br/>
            <span className="text-blue-600">Knowledge Intelligence.</span>
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-md">
            A unified learning ecosystem powered by AI to empower learners, trainers, and executive leadership.
          </p>
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Now with GPT-4 Core Integration</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">99%</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">24/7</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Insights</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">500+</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Partners</div>
          </div>
        </div>
      </section>

      {/* Right Section: Sign Up Form */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-white dark:bg-slate-900 overflow-y-auto pb-10">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-5 lg:p-7 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-700/50">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Join the next generation of AI-driven learning.</p>
          </div>

          <form className="space-y-2.5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" htmlFor="fullName">Full Name</label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">person</span>
                <input 
                  className={`w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none ${errors.fullName ? 'ring-2 ring-red-500/20 bg-red-50/50' : ''}`} 
                  id="fullName" 
                  name="fullName"
                  placeholder="John Doe" 
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">mail</span>
                <input 
                  className={`w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none ${errors.email ? 'ring-2 ring-red-500/20 bg-red-50/50' : ''}`} 
                  id="email" 
                  name="email"
                  placeholder="jane.doe@company.com" 
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.email}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" htmlFor="role">Select Your Role</label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">groups</span>
                <select 
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none appearance-none bg-none cursor-pointer" 
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="learner">Learner</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                  <option value="leadership">Executive Leadership</option>
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-lg">expand_more</span>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" htmlFor="password">Password</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">lock</span>
                  <input 
                    className={`w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none ${errors.password ? 'ring-2 ring-red-500/20 bg-red-50/50' : ''}`} 
                    id="password" 
                    name="password"
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" htmlFor="confirm">Confirm</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">lock</span>
                  <input 
                    className={`w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none ${errors.confirmPassword ? 'ring-2 ring-red-500/20 bg-red-50/50' : ''}`} 
                    id="confirm" 
                    name="confirmPassword"
                    placeholder="••••••••" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none"
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2.5 pt-0.5">
              <input 
                className={`mt-0.5 h-3.5 w-3.5 rounded text-blue-600 focus:ring-offset-0 focus:ring-blue-600/20 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 transition-colors cursor-pointer ${errors.agreeToTerms ? 'border-red-500 ring-1 ring-red-500/20' : ''}`} 
                id="terms" 
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight" htmlFor="terms">
                I agree to the <a className="text-blue-600 hover:underline font-semibold" href="#">Terms</a> and <a className="text-blue-600 hover:underline font-semibold" href="#">Privacy Policy</a>.
              </label>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1.5" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center">
              <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
              <span className="mx-3 text-[8px] uppercase tracking-widest font-bold text-slate-400">Or</span>
              <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-[12px] font-semibold text-slate-700 dark:text-slate-300"
                type="button"
                onClick={() => handleSSOLogin('Google')}
                disabled={isLoading}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-[12px] font-semibold text-slate-700 dark:text-slate-300"
                type="button"
                onClick={() => handleSSOLogin('SSO')}
                disabled={isLoading}
              >
                <span className="material-symbols-outlined text-[16px]">key</span>
                SSO
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Already have an account? 
              <button 
                className="text-blue-600 font-bold hover:underline bg-transparent border-0 ml-1" 
                onClick={() => navigate('/login')}
                type="button"
              >
                Sign In
              </button>
            </p>
            
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <a className="text-[9px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">Terms</a>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <a className="text-[9px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">Privacy</a>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <a className="text-[9px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">Support</a>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 opacity-30 grayscale group hover:opacity-70 transition-all duration-300 cursor-default">
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-slate-400">Powered by</span>
              <span className="material-symbols-outlined text-[10px]">lightbulb</span>
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-slate-400">LTC Platform</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignUp;
