import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import PokerTable from './components/PokerTable';
import { HomeView } from './components/HomeView';
import { AnalyticsView } from './components/AnalyticsView';
import { HowToUseView } from './components/HowToUseView';
import { LearnView } from './components/LearnView';
import { GuideView } from './components/GuideView';
import { TheoryPage } from './components/theory/TheoryPage';
import { LoginView } from './components/LoginView';
import { getStoredUserId, getStoredDisplayName, logout } from './lib/api';
import {
  Play,
  Home,
  TrendingUp,
  HelpCircle,
  GraduationCap,
  BookOpen,
  Terminal,
  Sparkles,
  LogOut,
  User
} from 'lucide-react';

const TOP_NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/play', label: 'Live Table', icon: Play },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/how-to-use', label: 'How to Use', icon: HelpCircle },
  { path: '/theory', label: 'Theory', icon: GraduationCap },
  { path: '/guide', label: 'Rules & Guide', icon: BookOpen },
];

const KNOWN_ROUTES = ['/play', '/analytics', '/how-to-use', '/theory', '/guide'];

const resolveRoute = (path: string): string => {
  if (KNOWN_ROUTES.some((r) => path === r || path.startsWith(r + '/'))) {
    return path;
  }
  return path === '/' ? '/' : '/play';
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname) {
      return resolveRoute(window.location.pathname);
    }
    return '/play'; // Default to the live poker table for immediate coaching
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userId, setUserId] = useState<string | null>(() => getStoredUserId());
  const [displayName, setDisplayName] = useState<string | null>(() => getStoredDisplayName());

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }

    const handlePopState = () => {
      setCurrentPath(resolveRoute(window.location.pathname || '/play'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(resolveRoute(path));
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  };

  const handleLoggedIn = () => {
    setUserId(getStoredUserId());
    setDisplayName(getStoredDisplayName());
  };

  const handleLogout = () => {
    logout();
    setUserId(null);
    setDisplayName(null);
    navigateTo('/');
  };

  // Intercept anchor link clicks across all children (e.g. "Start Playing" in HomeView)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        navigateTo(href);
      }
    }
  };

  const theoryChapterMatch = currentPath.match(/^\/theory\/(chapter-\d+)$/);

  // Auth gate: no stored user id → show the demo login screen.
  if (!userId) {
    return <LoginView onLoggedIn={handleLoggedIn} />;
  }

  return (
    <div
      onClick={handleContainerClick}
      className="min-h-screen bg-charcoal-dark text-cream font-sans relative overflow-x-hidden selection:bg-gold/30 flex"
    >
        {/* Left Sidebar from Poker_AI */}
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          currentPath={currentPath}
          onNavigate={navigateTo}
        />

        {/* Main Content Area */}
        <main 
          className={`flex-1 ${
            isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          } flex flex-col items-center py-6 px-3 sm:px-6 lg:px-8 overflow-y-auto transition-all duration-300 min-h-screen`}
        >
          {/* Top Header & Fast Switcher */}
          <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-gold-subtle">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-white uppercase tracking-wider">
                    PokerSense <span className="text-gold">AI</span>
                  </h1>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                    AI Coach
                  </span>
                </div>
                <p className="text-[11px] text-cream/40">
                  Grounded in the game's essential strategy books
                </p>
              </div>
            </div>

            {/* Quick Navigation Pills + Account */}
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded-2xl overflow-x-auto max-w-full">
                {TOP_NAV_ITEMS.map((tab) => {
                  const isActive = currentPath === tab.path || (tab.path !== '/' && currentPath.startsWith(tab.path));
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.path}
                      onClick={() => navigateTo(tab.path)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-gold text-charcoal-dark shadow-gold font-black'
                          : 'text-cream/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-charcoal-dark' : 'text-gold'} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 pl-3 border-l border-white/5">
                <div className="hidden sm:flex items-center gap-2 text-cream/60" title={displayName || ''}>
                  <div className="w-7 h-7 rounded-full bg-charcoal-light border border-gold/20 flex items-center justify-center text-gold">
                    <User size={14} />
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap max-w-[120px] truncate">{displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cream/50 hover:text-red-400 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 transition-all cursor-pointer"
                  title="Log out"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active View Container */}
          <div className="w-full max-w-7xl relative z-10 flex-1 flex flex-col">
            {currentPath === '/play' && <PokerTable />}
            {currentPath === '/' && <HomeView />}
            {currentPath === '/analytics' && <AnalyticsView />}
            {currentPath === '/how-to-use' && <HowToUseView />}
            {currentPath === '/theory' && <LearnView />}
            {theoryChapterMatch && <TheoryPage chapterId={theoryChapterMatch[1]} />}
            {currentPath === '/guide' && <GuideView />}
          </div>

          {/* Authentic PokerSense Footer */}
          <footer className="mt-16 pt-10 border-t border-white/5 w-full text-gold/30 text-[10px] font-black uppercase tracking-[0.3em] flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Terminal size={12} className="text-gold" />
              <span>PokerSense OS v2.4 // THEORY DRIVEN COACH</span>
              <span className="w-1.5 h-1.5 bg-gold/20 rounded-full"></span>
              <span>Strategic Support Active</span>
            </div>
            <div className="text-[9px] opacity-40 italic font-medium">
              "IF YOU MAKE THE BEST DECISIONS, THE MONEY WILL FOLLOW"
            </div>
          </footer>
        </main>
      </div>
  );
}
