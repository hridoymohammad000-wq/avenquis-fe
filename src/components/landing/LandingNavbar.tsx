import React, { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Platform', href: '/platform' },
  { label: 'Security & Compliance', href: '/security' },
  { label: 'Pricing', href: '/pricing' }
];

export const LandingNavbar: React.FC<{ currentPath: string; navigate: (href: string) => void }> = ({ currentPath, navigate }) => {
  const [scrolled, setScrolled] = useState(false); 
  const [open, setOpen] = useState(false);
  
  useEffect(() => { 
    const onScroll = () => setScrolled(window.scrollY > 20); 
    window.addEventListener('scroll', onScroll); 
    return () => window.removeEventListener('scroll', onScroll); 
  }, []);
  
  const go = (href: string) => { setOpen(false); navigate(href); };
  
  return (
    <header className={`sticky top-0 z-40 w-full transition-all ${scrolled ? 'backdrop-blur-xl bg-[#FAF7F2]/85 border-b border-[#EBE6DD] py-3.5 shadow-sm' : 'bg-[#FAF7F2]/90 border-b border-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
        <button 
          type="button" 
          onClick={() => go('/')} 
          className="flex items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3E] focus-visible:ring-offset-2 rounded-sm" 
          aria-label="AVENQUIS home"
        >
          <span className="w-10 h-10 rounded-xl bg-[#113227] text-white flex items-center justify-center font-serif font-bold text-xl shadow-md border border-[#174234]">A</span>
          <span>
            <span className="block text-xl sm:text-2xl font-serif font-black tracking-[0.16em] text-[#113227] uppercase leading-none">
              AVEN<span className="text-[#C58A3E] font-sans font-light tracking-normal mx-0.5">—</span>QUIS
            </span>
            <span className="block text-[9px] uppercase tracking-[0.24em] font-bold text-[#8A5A18] mt-1">Firm Operating System</span>
          </span>
        </button>
        
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.1em]" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <button 
              key={link.href} 
              type="button" 
              onClick={() => go(link.href)} 
              aria-current={currentPath === link.href ? 'page' : undefined} 
              className={`py-1 relative group outline-none focus-visible:ring-2 focus-visible:ring-[#113227] rounded-sm transition-colors ${currentPath === link.href ? 'text-[#113227]' : 'text-[#66706B] hover:text-[#113227]'}`}
            >
              {link.label}
              <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-[#C58A3E] transition-all ${currentPath === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => go('/sign-in')} 
            className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#113227] hover:bg-[#1A4537] shadow-md shadow-emerald-950/10 border border-[#174234] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#113227] focus-visible:ring-offset-2"
          >
            Sign In
          </button>
          <button 
            type="button" 
            onClick={() => setOpen(!open)} 
            aria-expanded={open} 
            aria-controls="mobile-nav" 
            aria-label={open ? 'Close navigation' : 'Open navigation'} 
            className="md:hidden p-2 text-[#113227] rounded-lg hover:bg-[#EBE6DD] outline-none focus-visible:ring-2 focus-visible:ring-[#113227]"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {open && (
        <nav id="mobile-nav" className="md:hidden border-b border-[#EBE6DD] bg-white px-6 pt-4 pb-8 space-y-2 shadow-2xl absolute w-full left-0 top-full" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <button 
              key={link.href} 
              type="button" 
              onClick={() => go(link.href)} 
              className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-colors ${currentPath === link.href ? 'bg-[#FAF7F2] text-[#113227]' : 'text-[#66706B] hover:bg-[#FAF7F2] hover:text-[#113227]'}`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 mt-2 border-t border-[#EBE6DD]">
            <button 
              type="button" 
              onClick={() => go('/sign-in')} 
              className="w-full py-3.5 rounded-xl bg-[#113227] hover:bg-[#1A4537] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              Sign In <ArrowRight className="w-4 h-4 text-[#C58A3E]" />
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
