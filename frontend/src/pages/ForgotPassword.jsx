import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // if token in URL → show reset form

  // Forgot password form state
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Reset password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // ---- STEP 1: Send reset email ----
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setEmailError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email'); return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(`/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setEmailSent(true);
    } catch {
      // Still show success to prevent user enumeration
      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- STEP 2: Submit new password ----
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setResetError('Password must be at least 8 characters'); return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match'); return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(
        `/api/auth/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(newPassword)}`
      );
      setResetSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setResetError(
        error.response?.status === 400
          ? 'Reset link is invalid or has expired. Please request a new one.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI LMS Intelligence</h1>
        </div>

        {/* ---- TOKEN IN URL = Show Reset Password Form ---- */}
        {token ? (
          <>
            {resetSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Redirecting you to login in 3 seconds...
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Set New Password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Must be at least 8 characters.
                </p>

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setResetError(''); }}
                      disabled={isLoading}
                      className="block w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setResetError(''); }}
                      disabled={isLoading}
                      className="block w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                    />
                  </div>

                  {resetError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{resetError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </>
        ) : (
        /* ---- NO TOKEN = Show Forgot Password Form ---- */
          <>
            {emailSent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  If <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span> is
                  registered, you'll receive a reset link shortly. Check your spam folder too.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Forgot Password?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  No worries. Enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      disabled={isLoading}
                      className={`block w-full px-3 py-2.5 border ${
                        emailError
                          ? 'border-red-500 focus:ring-red-500/20'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20 focus:border-primary'
                      } rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm`}
                    />
                    {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-medium text-primary hover:text-blue-700 transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;