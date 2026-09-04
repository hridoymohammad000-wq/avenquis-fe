import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  UserCheck,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { AuthMode, AuthFormData } from '../../types';
import { authApi } from '../../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { email: string; name?: string; role?: string; mode: AuthMode }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [authError, setAuthError] = useState('');

  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true,
    role: 'Managing Partner',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AuthFormData, string>>>({});

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof AuthFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof AuthFormData, string>> = {};

    if (!formData.email) {
      newErrors.email = 'Please enter your practice email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter your password.';
    }

    if (mode === 'signup' && !formData.name) {
      newErrors.name = 'Please provide your full name.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setAuthError('');
    const request = mode === 'signup'
      ? authApi.register(formData.email, formData.password, formData.name || '')
      : authApi.login(formData.email, formData.password);
    request.then((result) => {
      if (mode === 'signin' && 'requireMfa' in result && result.requireMfa) {
        setMfaPending(true);
        return;
      }
      onSuccess({
        email: result.user.email,
        name: result.user.fullName,
        mode,
      });
      onClose();
    }).catch((error: Error) => {
      setAuthError(error.message || 'Unable to authenticate.');
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(mfaCode)) {
      setAuthError('Enter the six-digit code from your authenticator app.');
      return;
    }
    setIsLoading(true);
    setAuthError('');
    authApi.challengeMfa(mfaCode).then(() => {
        onSuccess({
          email: formData.email,
          name: formData.name,
          mode: 'signin',
        });
      onClose();
    }).catch((error: Error) => setAuthError(error.message || 'Invalid MFA code.')).finally(() => setIsLoading(false));
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#113227]/50 backdrop-blur-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <motion.div
        className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EBE6DD] shadow-2xl p-6 sm:p-9 z-10 max-h-[95vh] overflow-y-auto text-left"
        initial={{ opacity: 0, y: 10, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, delay: 0.03, ease: [0.16, 1, 0.3, 1] }}
      >
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E6E0D4] flex items-center justify-center text-[#66706B] hover:text-[#1C1F1E] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-[#113227] text-white flex items-center justify-center font-serif font-bold text-sm border border-[#235846]">
            A
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-base font-serif font-black tracking-[0.16em] text-[#113227] uppercase">
                AVEN<span className="text-[#C58A3E] font-sans font-light tracking-normal mx-0.5">—</span>QUIS
              </span>
            </div>
            <span className="text-[8px] uppercase tracking-widest font-bold text-[#8A5A18]">
              Firm Operating System
            </span>
          </div>
        </div>

        {/* Modal Title */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-serif font-bold text-[#1C1F1E]">
            {mode === 'signin' ? 'Sign In to Firm Workspace' : 'Request Practice Workspace Access'}
          </h2>
          <p className="text-xs text-[#66706B] mt-1">
            {mode === 'signin'
              ? 'Access engagement working papers, timesheets, and financial billing ledgers.'
              : 'Submit a request to provision a new isolated practice workspace.'}
          </p>
        </motion.div>

        {authError && <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{authError}</p>}

        {mfaPending ? (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <p className="text-sm text-[#66706B]">Multi-factor authentication is required for this account.</p>
            <input aria-label="MFA code" inputMode="numeric" maxLength={6} value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-[#E0D8CA] bg-[#FAF7F2] px-4 py-3 text-center font-mono text-lg tracking-widest focus:outline-none" placeholder="000000" />
            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#113227] py-3.5 text-sm font-bold text-white disabled:opacity-70">{isLoading ? 'Verifying…' : 'Verify MFA & Continue'}</button>
          </form>
        ) : (

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Full Name &amp; Designation
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Masud Rahman, FCA"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm focus:outline-none focus:border-[#113227] ${errors.name ? 'border-red-400' : 'border-[#E0D8CA]'}`}
                />
              </div>
              <AnimatePresence initial={false}>{errors.name && <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.16 }} className="text-xs text-red-600 mt-1">{errors.name}</motion.p>}</AnimatePresence>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Practice Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@rahman-ca.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm focus:outline-none focus:border-[#113227] ${errors.email ? 'border-red-400' : 'border-[#E0D8CA]'}`}
              />
            </div>
            <AnimatePresence initial={false}>{errors.email && <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.16 }} className="text-xs text-red-600 mt-1">{errors.email}</motion.p>}</AnimatePresence>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm focus:outline-none focus:border-[#113227] ${errors.password ? 'border-red-400' : 'border-[#E0D8CA]'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={showPassword ? 'hidden' : 'visible'} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.14 }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
            <AnimatePresence initial={false}>{errors.password && <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.16 }} className="text-xs text-red-600 mt-1">{errors.password}</motion.p>}</AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#113227] hover:bg-[#1A4537] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating credentials...</span>
              </div>
            ) : (
              <>
                <span className="whitespace-nowrap">{mode === 'signin' ? 'Sign In to Workspace' : 'Request Access'}</span>
                <ArrowRight className="w-4 h-4 text-[#C58A3E]" />
              </>
            )}
          </button>
        </motion.form>
        )}

        {/* Toggle Mode */}
        <div className="text-center mt-5 text-xs text-[#66706B]">
          {mode === 'signin' ? (
            <>
              <span>New practice onboarding? </span>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#113227] hover:underline cursor-pointer"
              >
                Request Access
              </button>
            </>
          ) : (
            <>
              <span>Already registered? </span>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-[#113227] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
};
