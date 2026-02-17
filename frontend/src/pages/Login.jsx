import React, { useState } from 'react';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
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
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      
      // TODO: Replace with actual API call
      console.log('Login submitted:', formData);
      
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Redirect to dashboard based on user role
      // window.location.href = '/dashboard';
      
      alert('Login successful! (This is a demo)');
    } catch (error) {
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = (provider) => {
    // TODO: Implement actual SSO authentication
    console.log(`${provider} SSO login clicked`);
    alert(`${provider} login will be implemented with OAuth`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="login-container">
      <div className="flex h-screen w-full overflow-hidden">
        {/* Left Side: Visual/Hero Section (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 ai-pattern opacity-30"></div>
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
          
          <div className="relative z-10 text-white max-w-md">
            <div className="mb-8 flex items-center gap-3 animate-fade-in">
              <div className="bg-white p-2 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <svg 
                  className="w-8 h-8 text-primary" 
                  fill="none" 
                  viewBox="0 0 48 48" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" 
                    fill="currentColor"
                  />
                  <path 
                    clipRule="evenodd" 
                    d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" 
                    fill="currentColor" 
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">AI LMS Intelligence</span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight mb-6 animate-fade-in animation-delay-200">
              Knowledge transformation powered by AI.
            </h1>
            
            <p className="text-blue-100 text-lg leading-relaxed mb-10 animate-fade-in animation-delay-400">
              Experience the future of enterprise learning with our intelligent management system. Tailored pathways for every professional.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 animate-slide-in animation-delay-600 hover:translate-x-2 transition-transform duration-300">
                <span className="material-symbols-outlined text-blue-200">check_circle</span>
                <span>Personalized Learning Copilot</span>
              </div>
              <div className="flex items-center gap-3 animate-slide-in animation-delay-800 hover:translate-x-2 transition-transform duration-300">
                <span className="material-symbols-outlined text-blue-200">check_circle</span>
                <span>Automated Knowledge Extraction</span>
              </div>
              <div className="flex items-center gap-3 animate-slide-in animation-delay-1000 hover:translate-x-2 transition-transform duration-300">
                <span className="material-symbols-outlined text-blue-200">check_circle</span>
                <span>Real-time Skill Gap Analysis</span>
              </div>
            </div>
          </div>

          {/* Abstract Image Element */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary to-transparent z-0"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-background-dark justify-center px-8 sm:px-16 lg:px-24 xl:px-32">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="animate-fade-in animation-delay-200">
                <label 
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" 
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-xl">mail</span>
                  </div>
                  <input
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20 focus:border-primary'
                    } rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm`}
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="animate-fade-in animation-delay-400">
                <div className="flex items-center justify-between mb-2">
                  <label 
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300" 
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a 
                    className="text-sm font-medium text-primary hover:text-blue-700 transition-colors cursor-pointer" 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset functionality will be implemented');
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-xl">lock</span>
                  </div>
                  <input
                    className={`block w-full pl-10 pr-12 py-3 border ${
                      errors.password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20 focus:border-primary'
                    } rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm`}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center animate-fade-in animation-delay-600">
                <input
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label 
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer" 
                  htmlFor="remember-me"
                >
                  Keep me logged in
                </label>
              </div>

              {/* Error message */}
              {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in animation-delay-800"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-background-dark text-gray-500 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                  type="button"
                  onClick={() => handleSSOLogin('Google')}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>

                <button
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                  type="button"
                  onClick={() => handleSSOLogin('Microsoft')}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path d="M0 0h23v23H0z" fill="#f3f3f3" />
                    <path d="M1 1h10v10H1z" fill="#f35325" />
                    <path d="M12 1h10v10H12z" fill="#81bc06" />
                    <path d="M1 12h10v10H1z" fill="#05a6f0" />
                    <path d="M12 12h10v10H12z" fill="#ffba08" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </div>

            <div className="mt-10 text-center animate-fade-in animation-delay-1000">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account yet?
                <a 
                  className="font-bold text-primary hover:text-blue-700 transition-colors ml-1 cursor-pointer" 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Request access functionality will be implemented');
                  }}
                >
                  Request Access
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto py-8 text-center text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">
            © 2024 AI LMS Knowledge Intelligence. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
