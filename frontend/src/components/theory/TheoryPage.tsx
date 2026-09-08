import React, { useMemo, useState } from 'react';
import { SidebarNav } from './SidebarNav';
import { ContentDisplay } from './ContentDisplay';
import { theoryData } from './data';
import { Menu, X } from 'lucide-react';

interface TheoryPageProps {
  chapterId: string;
}

export const TheoryPage: React.FC<TheoryPageProps> = ({ chapterId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeChapter = useMemo(() => {
    for (const part of theoryData.parts) {
      const chapter = part.chapters.find((c) => c.id === chapterId);
      if (chapter) return chapter;
    }
    return theoryData.parts[0].chapters[0];
  }, [chapterId]);

  const nextChapterId = useMemo(() => {
    const allChapters = theoryData.parts.flatMap(p => p.chapters);
    const currentIndex = allChapters.findIndex(c => c.id === chapterId);
    if (currentIndex !== -1 && currentIndex < allChapters.length - 1) {
      return allChapters[currentIndex + 1].id;
    }
    return null;
  }, [chapterId]);

  return (
    <div className="flex w-full min-h-[calc(100vh-120px)] font-sans text-cream overflow-hidden relative glass-dark rounded-3xl md:rounded-[40px] border border-white/5 flex-col md:flex-row">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gold/10 bg-charcoal/40 backdrop-blur-md sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
            <span className="text-charcoal font-black text-sm">T</span>
          </div>
          <span className="text-sm font-black text-white uppercase tracking-widest italic">Theory Mastery</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-gold/10 rounded-lg text-gold border border-gold/20"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Tactical HUD Overlays - Subtle version for nested view */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden hidden md:block">
        {/* Corner Brackets */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold/10" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold/10" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold/10" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold/10" />
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:inset-auto md:z-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Overlay for mobile */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
        
        <div className="relative w-80 h-full max-w-[85vw]">
          <SidebarNav 
            data={theoryData} 
            activeChapterId={chapterId} 
            onSelectChapter={() => setIsSidebarOpen(false)} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative min-h-full overflow-y-auto">
        {/* Subtle background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-gold/5 blur-[100px] rounded-full animate-pulse" />
        </div>

        {/* Content Render */}
        <ContentDisplay chapter={activeChapter} nextChapterId={nextChapterId} />
      </main>
    </div>
  );
};


