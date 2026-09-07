import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Lock, Users, BarChart3, Clock, AlertTriangle } from 'lucide-react';

const tabs = ['Overview', 'Working papers', 'People'];

export function DemoWorkspace({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState('Overview');
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1F1E] flex flex-col md:flex-row overflow-hidden relative">
      <div className="luxury-gradient" />
      
      {/* Demo Warning Banner */}
      <div className="absolute top-0 left-0 w-full bg-[#113227] text-[#C5D1CA] text-xs font-bold py-1.5 flex justify-center items-center gap-2 z-50">
        <AlertTriangle className="w-3.5 h-3.5 text-[#C58A3E]" />
        THIS IS A SANDBOX PREVIEW. NO REAL DATA IS STORED. EXTERNAL ACTIONS ARE DISABLED.
      </div>
      
      {/* Fake Sidebar */}
      <aside className="w-full md:w-64 border-r border-[#EBE6DD] bg-white pt-10 flex flex-col z-10 shrink-0">
        <div className="px-6 py-4 border-b border-[#EBE6DD]">
          <h1 className="text-xl font-serif font-bold text-[#113227]">Northstar & Co.</h1>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#8A5A18] mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#27C93F] animate-pulse" />
            READ-ONLY DEMO
          </p>
        </div>
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            {tabs.map((item) => (
              <button 
                type="button" 
                key={item} 
                onClick={() => setTab(item)} 
                className={`w-full text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#113227] ${tab === item ? 'bg-[#113227] text-white shadow-md shadow-emerald-950/10' : 'text-[#66706B] hover:bg-[#FAF7F2] hover:text-[#113227]'}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#EBE6DD]">
          <button 
            type="button" 
            onClick={onExit} 
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-[#EBE6DD] hover:bg-[#FAF7F2] px-4 py-3 text-xs font-bold text-[#113227] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#113227] shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Exit sandbox
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto z-10 pt-8">
        <div className="p-6 sm:p-10 max-w-6xl w-full mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#113227]">{tab}</h2>
              <p className="mt-2 text-sm text-[#66706B]">Fictional data only • No regulator submissions • Safe mode</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1F5946] bg-[#E1F3EE] border border-[#C8E9DE] px-3 py-1.5 rounded-full">
              <Lock className="h-3.5 w-3.5" /> Isolated tenant
            </span>
          </div>

          <div className="rounded-3xl border border-[#EBE6DD] bg-white shadow-xl p-6 sm:p-10 motion-dialog">
            {tab === 'Overview' && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DemoCard icon={<Users />} title="Practice Members" value="4 active accounts" />
                <DemoCard icon={<FileText />} title="Working papers" value="12 mock files" />
                <DemoCard icon={<BarChart3 />} title="Avg Engagement" value="84% Completion" />
                <DemoCard icon={<Clock />} title="Timesheets" value="42.5 hrs logged" />
                <DemoCard icon={<CheckCircle2 />} title="Actions" value="Disabled in demo" />
              </div>
            )}
            
            {tab === 'Working papers' && (
              <div className="space-y-4">
                <DemoRow title="WP-REV-01 • Revenue review (ISA 500)" status="Illustrative draft" user="T. Hasan" />
                <DemoRow title="WP-CASH-02 • Cash & bank reconciliation" status="Preview only" user="M. Ahmed" />
                <DemoRow title="WP-PLAN-01 • Overall Strategy" status="Signed (Mock)" user="System" />
                <div className="mt-8 p-5 bg-[#FAF7F2] border border-[#EBE6DD] rounded-2xl flex gap-3 text-xs text-[#66706B] font-medium items-start">
                  <Lock className="w-4 h-4 text-[#C58A3E] shrink-0 mt-0.5" />
                  <p>Checkouts, external sharing, and regulator submissions are intentionally unavailable in this interactive preview environment.</p>
                </div>
              </div>
            )}
            
            {tab === 'People' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <DemoUser name="Mira Ahmed" role="Engagement Partner" initials="MA" />
                <DemoUser name="Rafi Khan" role="Audit Manager" initials="RK" />
                <DemoUser name="Nadia Islam" role="Articled Student" initials="NI" />
                <DemoUser name="Omar Chowdhury" role="Tax Associate" initials="OC" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DemoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) { 
  return (
    <div className="rounded-2xl border border-[#EBE6DD] bg-[#FAF7F2] p-6 motion-card">
      <div className="flex items-center gap-2 text-[#8A5A18]">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-4 w-4' })}
        <span className="text-xs font-bold uppercase tracking-[0.15em]">{title}</span>
      </div>
      <p className="mt-6 text-xl font-serif font-bold text-[#113227]">{value}</p>
    </div>
  ); 
}

function DemoRow({ title, status, user }: { title: string; status: string; user: string }) { 
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#EBE6DD] hover:border-[#DCD5C7] bg-[#FAF7F2] p-5 transition-colors">
      <span className="text-[15px] font-semibold text-[#113227]">{title}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-[#66706B]">{user}</span>
        <span className="rounded-full bg-[#FCEFD9] border border-[#FAD0C9] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A5A18]">
          {status}
        </span>
      </div>
    </div>
  ); 
}

function DemoUser({ name, role, initials }: { name: string; role: string; initials: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#EBE6DD] bg-[#FAF7F2] p-5">
      <div className="w-10 h-10 rounded-full bg-[#113227] text-white flex items-center justify-center text-xs font-bold font-serif shadow-sm">
        {initials}
      </div>
      <div>
        <p className="font-semibold text-[#113227] text-[15px]">{name}</p>
        <p className="text-xs font-medium text-[#66706B] mt-0.5">{role}</p>
      </div>
    </div>
  );
}
