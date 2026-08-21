import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { AlertCircle } from 'lucide-react';
import {login, register, logout} from '../api/client';

const Authentication = () => {
  const navigate = useNavigate();
  

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabSwitch = (signUpMode) => {
    setIsSignUp(signUpMode);
    setErrorMessage('');
  };

  const { setCurrentUser } = useProjectContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    // Username length validation
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    // Password validation
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Sign Up specific validations
    if (isSignUp) {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify and try again.');
        return;
      }
    }

    try{
      setLoading(true);
      let data;

      if (isSignUp) {
        data = await register(username, email, password, confirmPassword);
      } else {
        data = await login(username, password);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      navigate('/projects');
    } catch (err) {
        const serverMessage = err.response?.data?.message;
          if (Array.isArray(serverMessage)) {
            setErrorMessage(serverMessage.join(' '));
          } else if (typeof serverMessage === 'string') {
            setErrorMessage(serverMessage);
          } else {
            setErrorMessage('Authentication failed. Please check your credentials.');
          }
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="min-h-screen w-full bg-[#08100d] flex flex-col items-center justify-center p-4 select-none">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#10b981] flex items-center justify-center font-bold text-black text-xl shadow-lg mb-3">
          TF
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">TeamFlow</h1>
        <p className="text-xs text-[#7e998e] mt-1 font-medium">
          Where teams see who's doing what
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-[#0f1b16] border border-[#1b2f27] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Dual Segmented Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#09120f] border border-[#162922] rounded-xl">
          <button
            type="button"
            onClick={() => handleTabSwitch(false)}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              !isSignUp
                ? 'bg-[#162721] text-white shadow-xs border border-[#233f34]'
                : 'text-[#6e8a7e] hover:text-white'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch(true)}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              isSignUp
                ? 'bg-[#162721] text-white shadow-xs border border-[#233f34]'
                : 'text-[#6e8a7e] hover:text-white'
            }`}
          >
            Create account
          </button>
        </div>

        {/* Error Feedback Banner */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="text-xs font-medium text-[#8da69b] block mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. williams.k"
              className="w-full bg-[#0a1310] border border-[#1b2f28] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#4e685e] outline-none transition-all"
            />
          </div>

          {/* Email Field (Only in Sign Up mode) */}
          {isSignUp && (
            <div className="animate-in fade-in duration-150">
              <label className="text-xs font-medium text-[#8da69b] block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="williams@teamflow.app"
                className="w-full bg-[#0a1310] border border-[#1b2f28] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#4e685e] outline-none transition-all"
              />
            </div>
          )}

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#8da69b]">
                Password
              </label>
              {!isSignUp && (
                <span className="text-xs text-[#34d399] cursor-pointer hover:underline">
                  Forgot password
                </span>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0a1310] border border-[#1b2f28] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#4e685e] outline-none transition-all tracking-wider"
            />
          </div>

          {/* Confirm Password Field (Only in Sign Up mode) */}
          {isSignUp && (
            <div className="animate-in fade-in duration-150">
              <label className="text-xs font-medium text-[#8da69b] block mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a1310] border border-[#1b2f28] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#4e685e] outline-none transition-all tracking-wider"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-black font-semibold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create account' : 'Sign in')}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className="text-center pt-2">
          {isSignUp ? (
            <p className="text-xs text-[#7e998e]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch(false)}
                className="text-[#34d399] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#7e998e]">
              New to TeamFlow?{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch(true)}
                className="text-[#34d399] hover:underline font-medium"
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Version Footer */}
      <footer className="mt-8 text-center">
        <span className="text-[11px] font-mono tracking-widest text-[#4d665b] uppercase">
          TEAMFLOW v0.4 · DISPATCH FOR TEAMS
        </span>
      </footer>
    </div>
  );
};

export default Authentication;