/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { WorkspaceTab, AuthMode } from './types';
import { Check, Info, X } from 'lucide-react';
import { authApi, tenantApi, BackendTenant } from './lib/api';
import { UserSession } from './types';

export default function App() {
  // Default homepage route is the public SaaS Marketing Landing Page
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [initialWorkspaceTab, setInitialWorkspaceTab] = useState<WorkspaceTab>('dashboard');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string; location: string; activeEngagements: number }>>([]);
  const [isBooting, setIsBooting] = useState(true);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const enterWorkspace = async (user: { email: string; name?: string; role?: string; mode: AuthMode }) => {
    try {
      const [me, memberships] = await Promise.all([authApi.me(), tenantApi.list()]);
      if (memberships.length === 0) throw new Error('Your account is not assigned to an active practice.');
      const first = memberships[0];
      const context = await tenantApi.current(first.tenantId);
      const mappedTenants = memberships.map((tenant: BackendTenant) => ({ id: tenant.tenantId, name: tenant.tenantName, location: '—', activeEngagements: 0 }));
      const current: UserSession = { id: me.user.id, name: me.user.fullName || user.name || user.email.split('@')[0], email: me.user.email, role: user.role || 'Member', tenant: context.tenant.name, initials: (me.user.fullName || 'A').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), avatarColor: '#113227', tenantId: first.tenantId, membershipId: context.membership.id, permissions: context.permissions, mfaEnabled: me.user.mfaEnabled };
      setSession(current);
      setTenants(mappedTenants);
      setIsAuthenticated(true);
      setInitialWorkspaceTab('dashboard');
      showToast(`Signed in as ${current.name}. Practice database synchronized.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to load your workspace.', 'info');
      try {
        await authApi.logout();
      } catch {
        showToast('Unable to end the server session. Please try again.', 'info');
      }
    }
  };

  const handleDirectLaunchWorkspace = (tab: WorkspaceTab = 'dashboard') => {
    setInitialWorkspaceTab(tab);
    showToast('Please sign in before opening workspace modules.', 'info');
  };

  useEffect(() => {
    authApi.me().then((me) => enterWorkspace({ email: me.user.email, name: me.user.fullName, mode: 'signin' })).catch(() => undefined).finally(() => setIsBooting(false));
  }, []);

  if (isBooting) return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-sm text-[#66706B]">Loading secure session…</div>;

  // If authenticated, render the complete multi-page Firm Operating System
  if (isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-[#FAF7F2] text-[#1C1F1E] font-sans selection:bg-[#E1F3EE] selection:text-[#113227]">
        <WorkspaceLayout
          initialTab={initialWorkspaceTab}
          initialUser={session || undefined}
          initialTenants={tenants}
          onSignOut={async () => {
            try {
              await authApi.logout();
            } catch {
              showToast('Unable to sign out from the server. Please try again.', 'info');
              return;
            }
            setSession(null);
            setIsAuthenticated(false);
            showToast('Signed out of Firm OS. Returned to public landing portal.', 'info');
          }}
          showToast={showToast}
        />

        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#113227] text-white rounded-2xl shadow-xl border border-[#235846] text-xs font-medium animate-fadeIn">
            {toast.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-[#1F5946] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-[#E1F3EE]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#345B4D] flex items-center justify-center shrink-0">
                <Info className="w-3.5 h-3.5 text-[#FCEFD9]" />
              </div>
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-stone-400 hover:text-white cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Otherwise, render the comprehensive, luxury editorial SaaS Marketing Landing Page
  return (
    <>
      <LandingPage
        onSignInSuccess={enterWorkspace}
        onDirectLaunchWorkspace={handleDirectLaunchWorkspace}
      />

      {/* Floating Interactive Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#113227] text-white rounded-2xl shadow-xl border border-[#235846] text-xs font-medium animate-fadeIn">
          {toast.type === 'success' ? (
            <div className="w-5 h-5 rounded-full bg-[#1F5946] flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 text-[#E1F3EE]" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#345B4D] flex items-center justify-center shrink-0">
              <Info className="w-3.5 h-3.5 text-[#FCEFD9]" />
            </div>
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-stone-400 hover:text-white cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
