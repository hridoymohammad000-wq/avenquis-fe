import React, { useEffect, useState } from 'react';
import { Check, Info, X } from 'lucide-react';
import { authApi, tenantApi, BackendTenant, setSessionExpiredHandler, clearCsrfToken } from './lib/api';
import { UserSession, WorkspaceTab } from './types';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { LandingNavbar } from './components/landing/LandingNavbar';
import { EditorialHero } from './components/landing/EditorialHero';
import { TrustMetricStrip } from './components/landing/TrustMetricStrip';
import { BentoModulesGrid } from './components/landing/BentoModulesGrid';
import { ArchitectureSection } from './components/landing/ArchitectureSection';
import { FaqSection } from './components/landing/FaqSection';
import { BackgroundAccents } from './components/BackgroundAccents';
import { SignInPage as DedicatedSignInPage } from './components/auth/SignInPage';
import { DemoWorkspace } from './components/demo/DemoWorkspace';

const PLANS = ['Single Article Student — 1 student login', 'Individual Proprietor / Firm Owner — 1 proprietor login', 'Proprietor Firm with 5 Student Login — 1 proprietor + up to 5 students', 'Partnership Firm — 4 partners + 10 students'];
type Toast = { message: string; type: 'success' | 'info' } | null;

export default function App() {
  const [path, setPath] = useState(window.location.pathname || '/');
  const [session, setSession] = useState<UserSession | null>(null); const [tenants, setTenants] = useState<Array<{ id: string; name: string; location: string; activeEngagements: number }>>([]); const [booting, setBooting] = useState(true); const [toast, setToast] = useState<Toast>(null); const [initialTab] = useState<WorkspaceTab>('dashboard');
  const navigate = (href: string) => { window.history.pushState({}, '', href); setPath(href); window.scrollTo(0, 0); };
  const showToast = (message: string, type: 'success' | 'info' = 'success') => { setToast({ message, type }); window.setTimeout(() => setToast(null), 4000); };
  const enterWorkspace = async (email: string, name?: string, role?: string) => { try { const [me, memberships] = await Promise.all([authApi.me(), tenantApi.list()]); if (!memberships.length) throw new Error('Your account is not assigned to an active practice.'); const first = memberships[0]; const context = await tenantApi.current(first.tenantId); setSession({ id: me.user.id, name: me.user.fullName || name || email.split('@')[0], email: me.user.email, role: role || 'Member', tenant: context.tenant.name, initials: (me.user.fullName || 'A').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), avatarColor: '#113227', tenantId: first.tenantId, membershipId: context.membership.id, permissions: context.permissions, mfaEnabled: me.user.mfaEnabled }); setTenants(memberships.map((tenant: BackendTenant) => ({ id: tenant.tenantId, name: tenant.tenantName, location: '—', activeEngagements: 0 }))); showToast('Secure workspace loaded.'); } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to load your workspace.', 'info'); } };
  useEffect(() => { const onPop = () => setPath(window.location.pathname || '/'); const onExpired = () => { setSession(null); setPath('/sign-in'); window.history.replaceState({}, '', '/sign-in'); }; setSessionExpiredHandler(onExpired); window.addEventListener('popstate', onPop); authApi.me().then((me) => enterWorkspace(me.user.email, me.user.fullName)).catch(() => undefined).finally(() => setBooting(false)); return () => { setSessionExpiredHandler(null); window.removeEventListener('popstate', onPop); }; }, []);
  if (booting) return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-sm text-[#66706B]">Loading secure session…</div>;
  if (session) return <WorkspaceLayout initialTab={initialTab} initialUser={session} initialTenants={tenants} onSignOut={async () => { try { await authApi.logout(); } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to sign out from the server.', 'info'); return; } clearCsrfToken(); setSession(null); navigate('/'); showToast('Signed out of Firm OS.', 'info'); }} showToast={showToast} />;
  const publicPath = ['/', '/platform', '/security', '/pricing', '/demo'].includes(path);
  return <>{publicPath ? <PublicPage path={path} navigate={navigate} /> : <AuthPage path={path} navigate={navigate} onSignIn={enterWorkspace} />}{toast && <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#113227] text-white rounded-2xl shadow-xl border border-[#235846] text-xs font-medium"><span className="w-5 h-5 rounded-full bg-[#1F5946] flex items-center justify-center shrink-0">{toast.type === 'success' ? <Check className="w-3.5 h-3.5 text-[#E1F3EE]" /> : <Info className="w-3.5 h-3.5 text-[#FCEFD9]" />}</span>{toast.message}<button onClick={() => setToast(null)} aria-label="Dismiss notification"><X className="w-3.5 h-3.5" /></button></div>}</>;
}

function PublicPage({ path, navigate }: { path: string; navigate: (href: string) => void }) { 
  if (path === '/demo') return <DemoWorkspace onExit={() => navigate('/')} />; 
  const home = path === '/'; 
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1F1E] relative overflow-x-hidden">
      <BackgroundAccents />
      <LandingNavbar currentPath={path} navigate={navigate} />
      <main className="relative z-10">
        {home && (
          <>
            <EditorialHero onStartTesting={() => navigate('/request-demo')} onExploreArchitecture={() => navigate('/demo')} onLaunchWorkspace={() => navigate('/sign-in')} />
            <TrustMetricStrip />
            <BentoModulesGrid onLaunchWorkspaceModule={() => navigate('/sign-in')} />
            <ArchitectureSection />
            <FaqSection />
          </>
        )}
        {path === '/platform' && (
          <>
            <PageIntro eyebrow="The platform" title="One operating system for the modern practice" copy="Bring people, engagements, working papers, billing, and controlled intelligence into one governed workspace." />
            <BentoModulesGrid onLaunchWorkspaceModule={() => navigate('/sign-in')} />
          </>
        )}
        {path === '/security' && (
          <>
            <PageIntro eyebrow="Security & compliance" title="Governance designed into every workflow" copy="AVENQUIS helps professional firms preserve evidence, isolate tenants, and keep final decisions with authorized humans." />
            <TrustMetricStrip />
            <ArchitectureSection />
            <FaqSection />
          </>
        )}
        {path === '/pricing' && (
          <>
            <PageIntro eyebrow="Pricing" title="A considered path into your firm" copy="Choose the practice shape that matches your team. Every deployment begins with a review so access is provisioned deliberately." />
            <PlanCards navigate={navigate} />
          </>
        )}
      </main>
      <footer className="bg-[#1C1F1E] text-[#A6B2AC] px-6 sm:px-12 py-16 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div>
            <p className="text-white font-serif text-2xl font-bold tracking-[0.16em]">AVEN<span className="text-[#C58A3E]">—</span>QUIS</p>
            <p className="text-sm mt-3 max-w-sm leading-relaxed">Firm Operating System for professional practices.</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium">
            <button onClick={() => navigate('/request-access')} className="hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3E] rounded-sm">Request Access</button>
            <button onClick={() => navigate('/request-demo')} className="hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3E] rounded-sm">Request Demo</button>
            <button onClick={() => navigate('/demo')} className="hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3E] rounded-sm">Explore Demo</button>
            <button onClick={() => navigate('/sign-in')} className="hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3E] rounded-sm">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  ); 
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { 
  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-12 pt-24 pb-16">
      <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#8A5A18] mb-6">{eyebrow}</p>
      <h1 className="max-w-4xl text-5xl sm:text-6xl md:text-7xl font-serif font-bold leading-[1.05] text-[#113227] tracking-tight">{title}</h1>
      <p className="max-w-2xl mt-8 text-lg md:text-xl text-[#66706B] leading-relaxed">{copy}</p>
    </section>
  ); 
}

function PlanCards({ navigate }: { navigate: (href: string) => void }) { 
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-12 py-12 pb-24">
      <div className="grid md:grid-cols-2 gap-6">
        {PLANS.map((plan, index) => (
          <article key={plan} className="p-8 md:p-10 rounded-3xl bg-white border border-[#EBE6DD] motion-card shadow-sm hover:shadow-xl hover:border-[#DCD5C7] flex flex-col justify-between">
            <div>
              <p className="text-xs text-[#8A5A18] font-bold uppercase tracking-[0.2em]">Plan 0{index + 1}</p>
              <h2 className="mt-4 text-2xl font-serif font-bold text-[#113227]">{plan.split(' — ')[0]}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#66706B] font-medium">{plan.split(' — ')[1]}</p>
            </div>
            <button type="button" onClick={() => navigate('/request-access')} className="mt-10 self-start px-6 py-3 rounded-full border border-[#DCD5C7] text-sm font-bold text-[#113227] hover:bg-[#FAF7F2] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#113227]">
              Request access
            </button>
          </article>
        ))}
      </div>
    </section>
  ); 
}

function AuthPage({ path, navigate, onSignIn }: { path: string; navigate: (href: string) => void; onSignIn: (email: string, name?: string, role?: string) => Promise<void> }) { 
  if (path === '/sign-in') return <DedicatedSignInPage navigate={navigate} onSignIn={onSignIn} />; 
  if (path === '/forgot-password') return <ForgotPasswordPage navigate={navigate} />; 
  if (path === '/request-access') return <RequestForm title="Request practice access" description="Tell us about your firm. Access is provisioned after review; there is no self-service tenant creation." fields={['Full Name', 'Work Email', 'Mobile (optional)', 'Firm / Practice', 'Role', 'Intended Plan', 'Optional message']} submit="Submit access request" navigate={navigate} selectPlans />; 
  if (path === '/request-demo') return <RequestForm title="Request a private demo" description="Explore AVENQUIS with a guided conversation for your practice." fields={['Name', 'Work Email', 'Firm', 'Role', 'What they want to explore']} submit="Request demo" navigate={navigate} />; 
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 relative">
      <div className="luxury-gradient" />
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-serif text-[#113227] font-bold">Page not found</h1>
        <button onClick={() => navigate('/')} className="mt-5 text-sm font-bold text-[#113227] hover:text-[#C58A3E] underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#113227] rounded-sm">Return home</button>
      </div>
    </div>
  ); 
}

function ForgotPasswordPage({ navigate }: { navigate: (href: string) => void }) { 
  const [email, setEmail] = useState(''); 
  const [notice, setNotice] = useState(''); 
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 relative">
      <div className="luxury-gradient" />
      <div className="dot-grid" />
      <form onSubmit={(event) => { event.preventDefault(); setNotice('No reset has been issued. Please contact your firm administrator to verify recovery eligibility.'); }} className="relative z-10 w-full max-w-md bg-white border border-[#EBE6DD] rounded-3xl p-8 sm:p-12 shadow-xl motion-dialog">
        <button type="button" onClick={() => navigate('/sign-in')} className="text-xl font-serif font-bold tracking-[0.16em] text-[#113227] outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3E] rounded-sm">AVEN<span className="text-[#C58A3E]">—</span>QUIS</button>
        <p className="mt-10 text-xs uppercase tracking-widest font-bold text-[#8A5A18]">Account recovery</p>
        <h1 className="mt-3 text-3xl font-serif font-bold text-[#113227]">Forgot password?</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#66706B]">Enter your work email. Recovery is controlled by your practice administrator; this page never creates an account or reports a false reset.</p>
        
        <label className="block mt-8 text-xs font-bold uppercase tracking-wider text-stone-500">
          Work email
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#EBE6DD] bg-[#FAF7F2] px-4 py-3.5 focus:border-[#C58A3E] focus:bg-white transition-colors outline-none" />
        </label>
        
        <button className="mt-6 w-full rounded-xl bg-[#113227] hover:bg-[#1A4537] py-3.5 text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-950/10 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#113227]">Contact administrator</button>
        
        {notice && (
          <div role="status" className="mt-6 rounded-xl bg-[#FCEFD9] border border-[#FAD0C9] px-4 py-3.5 text-sm text-[#8A5A18] font-medium flex gap-2 animate-fadeIn">
            <Info className="w-5 h-5 shrink-0" />
            <p>{notice}</p>
          </div>
        )}
        
        <button type="button" onClick={() => navigate('/sign-in')} className="mt-6 w-full text-center text-xs font-bold text-[#113227] hover:text-[#C58A3E] underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#113227] rounded-sm">Back to Sign In</button>
      </form>
    </div>
  ); 
}

function RequestForm({ title, description, fields, submit, navigate, selectPlans = false }: { title: string; description: string; fields: string[]; submit: string; navigate: (href: string) => void; selectPlans?: boolean }) { 
  const [submitted, setSubmitted] = useState(false); 
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1F1E] relative">
      <div className="luxury-gradient" />
      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <button onClick={() => navigate('/')} className="text-xl font-serif font-bold tracking-[0.16em] text-[#113227] outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3E] rounded-sm">AVEN<span className="text-[#C58A3E]">—</span>QUIS</button>
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20 items-start py-12 lg:py-20">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8A5A18] font-bold">Private onboarding</p>
            <h1 className="mt-4 text-4xl lg:text-5xl font-serif font-bold leading-tight text-[#113227]">{title}</h1>
            <p className="mt-6 text-[#66706B] leading-relaxed text-base">{description}</p>
            <button onClick={() => navigate('/sign-in')} className="mt-8 text-sm font-bold underline text-[#113227] hover:text-[#C58A3E] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#113227] rounded-sm">Already have access? Sign In</button>
          </div>
          {submitted ? (
            <div className="bg-white border border-[#C8E9DE] rounded-3xl p-8 sm:p-12 shadow-lg motion-dialog">
              <h2 className="text-2xl font-serif font-bold text-[#113227]">Request form complete</h2>
              <p className="mt-3 text-sm text-[#66706B] leading-relaxed">Nothing was submitted because the backend has no approved public request endpoint yet. No account or tenant has been created.</p>
              <button onClick={() => navigate('/')} className="mt-8 rounded-xl bg-[#113227] hover:bg-[#1A4537] px-6 py-3.5 text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-950/10 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#113227]">Return home</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="bg-white border border-[#EBE6DD] rounded-3xl p-7 sm:p-12 shadow-xl space-y-5 motion-dialog">
              {fields.map((field) => (
                <label key={field} className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                  {field}
                  {selectPlans && field === 'Intended Plan' ? (
                    <select required className="mt-2 w-full rounded-xl border border-[#EBE6DD] bg-[#FAF7F2] px-4 py-3.5 focus:border-[#C58A3E] focus:bg-white transition-colors outline-none">
                      <option value="">Select a plan</option>
                      {PLANS.map((plan) => <option key={plan}>{plan}</option>)}
                    </select>
                  ) : field.includes('message') || field.includes('explore') ? (
                    <textarea required={!field.includes('Optional')} className="mt-2 w-full rounded-xl border border-[#EBE6DD] bg-[#FAF7F2] px-4 py-3.5 focus:border-[#C58A3E] focus:bg-white transition-colors outline-none resize-none" rows={4} />
                  ) : (
                    <input required={!field.includes('optional')} type={field.includes('Email') ? 'email' : 'text'} className="mt-2 w-full rounded-xl border border-[#EBE6DD] bg-[#FAF7F2] px-4 py-3.5 focus:border-[#C58A3E] focus:bg-white transition-colors outline-none" />
                  )}
                </label>
              ))}
              <button className="w-full mt-6 rounded-xl bg-[#113227] hover:bg-[#1A4537] py-4 text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-950/10 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#113227]">{submit}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  ); 
}
