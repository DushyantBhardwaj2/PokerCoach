import React from 'react';
import type { TheoryData } from './types';
import { Shield, Cpu, Activity } from 'lucide-react';

interface SidebarNavProps {
  data: TheoryData;
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ data, activeChapterId, onSelectChapter }) => {
  return (
    <nav className="w-full md:w-80 h-full bg-charcoal-dark border-r border-gold/10 flex flex-col overflow-hidden z-20">
      <div className="p-6 border-b border-gold/10 bg-charcoal/40 backdrop-blur-md relative overflow-hidden group hidden md:block">
        {/* Animated Background Pulse */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gold/10 rounded-lg border border-gold/20">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">
              Theory<span className="text-gold font-display">Mastery</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="px-1.5 py-0.5 rounded bg-charcoal-light border border-white/5">
              <span className="text-[10px] text-gold font-mono font-bold tracking-widest uppercase">Deep_Analysis</span>
            </div>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-8 py-8">
        {data.parts.map((part, partIndex) => (
          <div key={partIndex} className="relative">
            <div className="flex items-center gap-3 mb-6 px-2">
              <h3 className="text-[11px] font-black text-gold/60 uppercase tracking-[0.3em] font-mono">
                {part.title.split(':')[0]}
              </h3>
              <div className="flex-1 h-[1px] bg-gold/10" />
            </div>

            <div className="space-y-1.5">
              {part.chapters.map((chapter, i) => (
                <a
                  key={chapter.id}
                  href={`/theory/${chapter.id}`}
                  onClick={() => onSelectChapter(chapter.id)}
                  className={`w-full group relative flex flex-col p-3 rounded-xl transition-all duration-300 border ${
                    activeChapterId === chapter.id
                      ? 'bg-gold/5 border-gold/30 text-gold'
                      : 'border-transparent text-cream/40 hover:text-white hover:bg-charcoal/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono opacity-50">0{partIndex + 1}.0{i + 1}</span>
                    {activeChapterId === chapter.id && (
                      <Activity className="w-3 h-3 animate-pulse text-gold" />
                    )}
                  </div>
                  <span className="text-sm font-bold tracking-tight leading-tight group-hover:translate-x-1 transition-transform">
                    {chapter.title.split(': ')[1]}
                  </span>
                  
                  {activeChapterId === chapter.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-gold rounded-r-full shadow-gold" />
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-charcoal/50 border-t border-gold/10">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-gold" />
            <span className="text-[9px] text-cream/40 font-mono uppercase tracking-widest">Decision Engine</span>
          </div>
          <span className="text-[9px] text-gold font-mono animate-pulse">ACTIVE</span>
        </div>
        <div className="grid grid-cols-5 gap-1 h-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`rounded-full ${i < 3 ? 'bg-gold' : 'bg-charcoal-light'}`} />
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </nav>
  );
};
