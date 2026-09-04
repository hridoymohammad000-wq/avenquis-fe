import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, UserCheck } from 'lucide-react';
import { AuthMode, AuthFormData } from '../types';
import { authApi } from '../lib/api';

interface AuthCardProps {
  onSuccess?: (userData: { email: string; name?: string; mode: AuthMode }) => void;
  onForgotPasswordClick?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onSuccess,
  onForgotPasswordClick,
}) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successState, setSuccessState] = useState<string | null>(null);

  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true,
    role: 'Workspace Administrator',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AuthFormData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name as keyof AuthFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof AuthFormData, string>> = {};

    if (!formData.email) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter your password.';
    } else if (formData.password.length < 6 && formData.password !== '••••••••••••') {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (mode === 'signup' && !formData.name) {
      newErrors.name = 'Please provide your full name.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = mode === 'signup'
        ? await authApi.register(formData.email, formData.password, formData.name || '')
        : await authApi.login(formData.email, formData.password);
      setIsLoading(false);
      const greetingName = formData.name || formData.email.split('@')[0];
      setSuccessState(mode === 'signin' ? `Welcome back, ${greetingName}!` : `Account created for ${greetingName}!`);
      onSuccess?.({
        email: formData.email,
        name: formData.name,
        mode,
      });
      void result;
    } catch {
      setIsLoading(false);
      setErrors({ email: 'Unable to authenticate with the server.' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0">
      {/* Main Elevated Auth Card matching Natural Tones styling */}
      <div className="bg-white/95 w-full rounded-[2rem] p-8 sm:p-9 border border-[#EBE6DD] shadow-[0_20px_50px_rgba(28,31,30,0.08)] backdrop-blur-md text-left transition-all">
        
        {/* Card Header */}
        <div className="mb-7">
          <h2 className="text-2xl sm:text-[26px] font-serif mb-1 text-[#1C1F1E] font-bold">
            {mode === 'signin' ? 'Welcome Back' : 'Request Access'}
          </h2>
          <p className="text-xs text-[#66706B] font-normal">
            {mode === 'signin'
              ? 'Sign in to continue to your workspace.'
              : 'Request access for your practice or enterprise team.'}
          </p>
        </div>

        {/* Success Alert Banner if submitted */}
        {successState ? (
          <div className="py-8 px-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#E1F3EE] text-[#1F5946] border border-[#C8E9DE] mx-auto flex items-center justify-center animate-bounce">
              <Check className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1C1F1E] font-serif">{successState}</h3>
              <p className="text-xs text-[#66706B] mt-1">
                Authenticating credentials and loading your organization dashboard...
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSuccessState(null);
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  rememberMe: true,
                  role: 'Workspace Administrator',
                });
              }}
              className="text-xs font-semibold text-[#113227] underline hover:text-[#174234] pt-2 cursor-pointer"
            >
              Sign in with another account
            </button>
          </div>
        ) : (
          /* Form Elements */
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Full Name field (for sign up mode) */}
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="signup-name-input"
                  className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-name-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Eleanor Vance"
                    className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${
                      errors.name ? 'border-red-400 focus:border-red-500' : 'border-stone-100 focus:border-stone-300'
                    } rounded-xl text-sm transition-colors placeholder:text-stone-300 text-[#1C1F1E] focus:outline-none`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 font-medium mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email Address Input */}
            <div>
              <label
                htmlFor="auth-email-input"
                className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@avenquis.com"
                  className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${
                    errors.email ? 'border-red-400 focus:border-red-500' : 'border-stone-100 focus:border-stone-300'
                  } rounded-xl text-sm transition-colors placeholder:text-stone-300 text-[#1C1F1E] focus:outline-none`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password-input"
                  className="block text-[10px] font-bold uppercase tracking-wider text-stone-500"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-11 py-3 bg-stone-50 border ${
                    errors.password ? 'border-red-400 focus:border-red-500' : 'border-stone-100 focus:border-stone-300'
                  } rounded-xl text-sm transition-colors placeholder:text-stone-300 text-[#1C1F1E] focus:outline-none`}
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.password}</p>
              )}
            </div>

            {/* Controls: Remember me checkbox + Forgot password link */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  id="auth-remember-checkbox"
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-[#113227] accent-[#113227] focus:ring-[#113227] border-stone-300"
                />
                <span className="text-xs text-stone-500">Remember me</span>
              </label>

              {mode === 'signin' && (
                <button
                  type="button"
                  id="forgot-password-link"
                  onClick={onForgotPasswordClick}
                  className="text-xs font-semibold hover:underline transition-colors focus:outline-none cursor-pointer"
                  style={{ color: 'var(--gold)' }}
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Main Action Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#113227] hover:bg-[#174234] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/10 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating credentials...</span>
                </div>
              ) : (
                <>
                  <span className="whitespace-nowrap">{mode === 'signin' ? 'Sign In' : 'Request Access'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Card Footer: Toggle between Sign In & Sign Up */}
            <div className="text-center mt-6 text-xs text-[#66706B]">
              {mode === 'signin' ? (
                <>
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    id="toggle-signup-mode-btn"
                    onClick={() => setMode('signup')}
                    className="font-bold hover:underline transition-colors cursor-pointer"
                    style={{ color: 'var(--gold)' }}
                  >
                    Request access
                  </button>
                </>
              ) : (
                <>
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    id="toggle-signin-mode-btn"
                    onClick={() => setMode('signin')}
                    className="font-bold hover:underline transition-colors cursor-pointer"
                    style={{ color: 'var(--gold)' }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
