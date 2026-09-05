import React, { useState } from 'react';
import { authApi } from '../../lib/api';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export function SignInPage({ navigate, onSignIn }: { navigate: (href: string) => void; onSignIn: (email: string, name?: string, role?: string) => Promise<void> }) {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [mfaCode, setMfaCode] = useState(''); 
  const [mfaPending, setMfaPending] = useState(false); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => { 
    event.preventDefault(); 
    setError(''); 
    setLoading(true); 
    try { 
      const result = await authApi.login(email, password); 
      if (result.requireMfa) { 
        setMfaPending(true); 
        return; 
      } 
      await onSignIn(result.user.email, result.user.fullName); 
    } catch (e) { 
      setError(e instanceof Error ? e.message : 'Unable to authenticate.'); 
    } finally { 
      setLoading(false); 
    } 
  };

  const challenge = async (event: React.FormEvent) => { 
    event.preventDefault(); 
    setError(''); 
    setLoading(true); 
    try { 
      await authApi.challengeMfa(mfaCode); 
      await onSignIn(email); 
    } catch (e) { 
      setError(e instanceof Error ? e.message : 'MFA challenge failed.'); 
    } finally { 
      setLoading(false); 
    } 
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative flex flex-col justify-center items-center p-6 sm:p-12">
      <div className="luxury-gradient" />
      <div className="dot-grid" />
      
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] bg-white rounded-3xl shadow-2xl border border-[#EBE6DD] overflow-hidden relative z-10 motion-dialog">
        
        {/* Branding Side - Contained Green Section */}
        <section className="bg-[#113227] p-10 sm:p-14 text-[#FAF7F2] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,_#C58A3E_0%,_transparent_60%)]" />
          
          <div className="relative z-10">
            <button onClick={() => navigate('/')} className="text-xl font-serif font-bold tracking-[0.16em] outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3E] focus-visible:ring-offset-4 focus-visible:ring-offset-[#113227] rounded-sm">
              AVEN<span className="text-[#C58A3E]">—</span>QUIS
            </button>
            <div className="mt-16">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#D9B36A] font-bold">Firm Operating System</p>
              <h1 className="mt-4 text-4xl sm:text-5xl font-serif font-bold leading-[1.1] text-white">
                Clarity for the work that carries your name.
              </h1>
              <p className="mt-6 text-sm text-[#C5D1CA] leading-relaxed max-w-md">
                A governed workspace for audit, tax, advisory, and the people behind every engagement.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 mt-16 pt-8 border-t border-[#1F5946] flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C58A3E]" />
            <p className="text-xs text-[#8FA29A] font-medium">Private access for verified practices.</p>
          </div>
        </section>

        {/* Auth Form Side */}
        <section className="p-10 sm:p-14 flex flex-col justify-center bg-white relative">
          <form onSubmit={mfaPending ? challenge : submit} className="w-full max-w-sm mx-auto">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#8A5A18]">
              {mfaPending ? 'Verify identity' : 'Secure Workspace'}
            </p>
            <h2 className="mt-2 text-3xl font-serif font-bold text-[#113227]">
              {mfaPending ? 'Enter MFA code' : 'Welcome back'}
            </h2>
            
            {error && (
              <div role="alert" className="mt-6 p-4 rounded-xl bg-[#FDE6E2] text-[#8E362C] text-xs font-bold border border-[#FAD0C9] flex items-start gap-2 animate-fadeIn">
                <span className="shrink-0 mt-0.5">⚠</span>
                <p>{error}</p>
              </div>
            )}
            
            <div className="mt-8 space-y-5">
              {mfaPending ? (
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Authenticator or backup code
                  <input 
                    required 
                    autoFocus 
                    inputMode="numeric" 
                    value={mfaCode} 
                    onChange={(event) => setMfaCode(event.target.value)} 
                    className="mt-2 w-full rounded-xl border border-[#EBE6DD] bg-[#FAF7F2] px-4 py-3.5 tracking-widest text-lg font-mono focus:border-[#C58A3E] focus:bg-white transition-colors outline-none" 
                  />
                </label>
              ) : (
                <>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                    Work email
                    <input 
                      required 
                      type="email" 
                      value={email} 
                      onChange={(event) => setEmail(event.target.value)} 
                      className="mt-2 w-full rounded-xl border border-[#EBE6DD] bg-[#FAF7F2] px-4 py-3.5 focus:border-[#C58A3E] focus:bg-white transition-colors outline-none" 
                      placeholder="name@firm.com"
                    />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                    <div className="flex items-center justify-between">
                      <span>Password</span>
                      <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] text-[#8A5A18] hover:text-[#C58A3E] underline normal-case tracking-normal outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3E] rounded-sm">Forgot?</button>
                    </div>
                    <input 
                      required 
                      type="password" 
                      value={password} 
                      onChange={(event) => setPassword(event.target.value)} 
                      className="mt-2 w-full rounded-xl border border-[#EBE6DD] bg-[#FAF7F2] px-4 py-3.5 focus:border-[#C58A3E] focus:bg-white transition-colors outline-none" 
                    />
                  </label>
                </>
              )}
            </div>

            <button 
              disabled={loading} 
              className="mt-8 w-full rounded-xl bg-[#113227] hover:bg-[#1A4537] py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#113227]"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
              ) : (
                <>{mfaPending ? 'Continue securely' : 'Sign in securely'} {!mfaPending && <ArrowRight className="w-4 h-4 text-[#C58A3E] group-hover:translate-x-0.5 transition-transform" />}</>
              )}
            </button>
            
            {!mfaPending && (
              <div className="mt-8 pt-8 border-t border-[#EBE6DD] flex flex-col gap-3">
                <p className="text-center text-xs text-[#66706B]">
                  New firm or user? <button type="button" onClick={() => navigate('/request-access')} className="font-bold text-[#113227] hover:text-[#1A4537] underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#113227] rounded-sm">Request Access</button>
                </p>
                <p className="text-center text-xs text-[#66706B]">
                  Exploring AVENQUIS? <button type="button" onClick={() => navigate('/request-demo')} className="font-bold text-[#113227] hover:text-[#1A4537] underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#113227] rounded-sm">Request a Demo</button>
                </p>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
