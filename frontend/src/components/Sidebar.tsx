import React, { useEffect, useState } from 'react';
import { Home, Play, BookOpen, GraduationCap, Menu, X, ChevronLeft, ChevronRight, TrendingUp, HelpCircle } from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  currentPath = '',
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState(currentPath);
  const [theoryMode, setTheoryMode] = useState(true);

  useEffect(() => {
    // Sync theoryMode with localStorage
    const savedMode = localStorage.getItem('poker_theory_mode');
    if (savedMode !== null) {
      setTheoryMode(savedMode === 'true');
    }
  }, []);

  // Update activePath when currentPath prop changes
  useEffect(() => {
    if (currentPath) {
      setActivePath(currentPath);
    }
  }, [currentPath]);

  const toggleTheoryMode = () => {
    const newMode = !theoryMode;
    setTheoryMode(newMode);
    localStorage.setItem('poker_theory_mode', String(newMode));
    // Dispatch custom event so other components (like PokerTable) can react
    window.dispatchEvent(new CustomEvent('poker_theory_mode_change', { detail: { theoryMode: newMode } }));
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'play', label: 'Play Game', icon: Play, href: '/play' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/analytics' },
    { id: 'howtouse', label: 'How to Use', icon: HelpCircle, href: '/how-to-use' },
    { id: 'learn', label: 'Learn Poker', icon: GraduationCap, href: '/theory' },
    { id: 'guide', label: 'Guide & Rules', icon: BookOpen, href: '/guide' },
  ];

  const isActive = (href: string) => {
    if (href === '/' && activePath === '/') return true;
    if (href !== '/' && activePath.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-[60] bg-gold p-3 rounded-full text-charcoal shadow-gold active:scale-90 transition-transform"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-charcoal-dark/95 border-r border-white/5 transform transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        {/* Collapse Toggle Desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-4 top-10 w-8 h-8 bg-charcoal border border-gold/20 rounded-full items-center justify-center text-gold shadow-gold hover:bg-gold/10 transition-all z-[60]"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`flex flex-col h-full ${isCollapsed ? 'p-4' : 'p-6'} transition-all duration-500 overflow-hidden`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'mb-8 justify-center' : 'mb-10'}`}>
            <a
              href="/"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/');
                }
              }}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 bg-gold/90 rounded-lg flex items-center justify-center shadow-gold-subtle transition-transform group-hover:scale-105 shrink-0">
                <span className="text-charcoal font-black text-lg">P</span>
              </div>
              {!isCollapsed && (
                <div className="animate-fade-in whitespace-nowrap">
                  <h1 className="text-lg font-bold text-cream/80 tracking-wide">PokerSense</h1>
                </div>
              )}
            </a>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate(item.href);
                    }
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 rounded-xl transition-all duration-300 group cursor-pointer
                    ${isCollapsed ? 'justify-center p-3' : 'px-5 py-3.5'}
                    ${active
                      ? 'bg-gold/5 text-gold border border-gold/10'
                      : 'text-cream/50 hover:text-cream/80 hover:bg-white/5 border border-transparent'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={18} className={`${active ? 'text-gold' : 'text-cream/40 group-hover:text-gold'} shrink-0`} />
                  {!isCollapsed && (
                    <span className="font-bold tracking-widest text-xs uppercase animate-fade-in whitespace-nowrap">{item.label}</span>
                  )}
                </a>
              );
            })}
          </nav>

          {!isCollapsed && (
            <div className="mt-auto pt-8 border-t border-gold/5 animate-fade-in">
              <div className={`rounded-2xl p-6 border transition-all duration-500 ${theoryMode ? 'bg-gold/5 border-gold/20' : 'bg-white/2 border-white/5'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${theoryMode ? 'text-gold' : 'text-cream/20'}`}>Learning Mode</h4>
                  <button
                    onClick={toggleTheoryMode}
                    className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${theoryMode ? 'bg-gold' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-charcoal transition-all duration-300 ${theoryMode ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <p className={`text-[9px] leading-relaxed transition-colors duration-300 ${theoryMode ? 'text-cream/40' : 'text-cream/10'}`}>
                  {theoryMode
                    ? 'Theory-assisted insights enabled. Every decision explained through "The Theory of Poker" lens.'
                    : 'Standard simulation mode. Theoretical reasoning hidden.'}
                </p>
                {theoryMode && (
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                    <div className="w-3/4 h-full bg-gold shadow-gold animate-pulse-gold"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mt-auto pt-8 border-t border-gold/5 flex justify-center">
              <button
                onClick={toggleTheoryMode}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${theoryMode ? 'bg-gold text-charcoal shadow-gold' : 'bg-white/5 text-white/20'}`}
                title="Toggle Theory Mode"
              >
                <GraduationCap size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
