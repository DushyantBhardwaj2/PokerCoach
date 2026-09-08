import React from 'react';
import type { Chapter } from './types';
import { ChapterSection } from './ChapterSection';
import { ArrowRight, Crosshair, Terminal, Target, AlertTriangle, Lightbulb, Link2, BookOpen } from 'lucide-react';

interface ContentDisplayProps {
  chapter: Chapter;
  nextChapterId: string | null;
}

export const ContentDisplay: React.FC<ContentDisplayProps> = ({ chapter, nextChapterId }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar scroll-smooth z-10">
      <div className="max-w-4xl mx-auto px-8 py-12 lg:px-16 lg:py-20">
        <header className="mb-20 relative">
          {/* Decorative Corner */}
          <div className="absolute -top-10 -left-10 w-20 h-20 border-t border-l border-gold/30 pointer-events-none" />
          
          <div className="flex items-center gap-3 text-gold font-mono text-[10px] mb-6 uppercase tracking-[0.4em] animate-pulse">
            <Crosshair className="w-4 h-4" />
            Theory_Analytical_Unit
          </div>
          
          <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-8 uppercase italic font-display">
            {chapter.title.split(': ')[1] || chapter.title}
          </h1>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
              <Terminal className="w-3 h-3 text-gold" />
              <span className="text-[10px] font-mono text-gold uppercase tracking-widest">Logic_Core: Sklansky</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal border border-white/5">
              <BookOpen className="w-3 h-3 text-cream/40" />
              <span className="text-[10px] font-mono text-cream/40 uppercase tracking-widest">Subject: {chapter.id.replace('-', '_')}</span>
            </div>
          </div>
        </header>

        <article className="relative space-y-24">
          {/* Subtle Vertical Line */}
          <div className="absolute left-[-2rem] top-0 bottom-0 w-[1px] bg-gradient-to-bottom from-gold/20 via-transparent to-transparent hidden lg:block" />
          
          {/* Overview Section */}
          <section className="animate-[fadeIn_0.8s_ease-out]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-gold/50" />
              <h2 className="text-gold font-mono text-xs uppercase tracking-[0.3em]">01_Concept_Overview</h2>
            </div>
            <p className="text-2xl lg:text-3xl font-medium text-cream/90 leading-tight tracking-tight italic border-l-4 border-gold/40 pl-6">
              {chapter.overview}
            </p>
          </section>

          {/* Key Ideas Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-gold/50" />
              <h2 className="text-gold font-mono text-xs uppercase tracking-[0.3em]">02_Key_Objectives</h2>
            </div>
            <div className="grid gap-4">
              {chapter.keyIdeas.map((idea, i) => (
                <div key={i} className="group relative p-6 bg-charcoal/50 border border-white/5 rounded-2xl hover:border-gold/30 transition-all">
                  <div className="flex gap-4">
                    <Target className="w-5 h-5 text-gold shrink-0 mt-1" />
                    <div className="text-cream/70 text-lg">
                      <ChapterSection content={idea} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Detailed Explanation Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-gold/50" />
              <h2 className="text-gold font-mono text-xs uppercase tracking-[0.3em]">03_Deep_Analysis</h2>
            </div>
            <div className="prose prose-invert prose-gold max-w-none">
              {chapter.detailedExplanation.split('\n\n').map((para, i) => (
                <p key={i} className="text-xl text-cream/60 leading-relaxed mb-6 font-medium tracking-tight">
                  {para}
                </p>
              ))}
            </div>
          </section>

          {/* Case Studies Section */}
          <section className="space-y-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-gold/50" />
              <h2 className="text-gold font-mono text-xs uppercase tracking-[0.3em]">04_Tactical_Simulations</h2>
            </div>
            <div className="space-y-16">
              {chapter.caseStudies.map((study, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gold/20 group-hover:bg-gold/50 transition-colors" />
                  <h3 className="text-2xl font-black text-white uppercase italic mb-6 tracking-tighter">
                    {study.title}
                  </h3>
                  <div className="grid gap-6">
                    <div className="p-6 bg-charcoal/30 rounded-2xl border border-white/5">
                      <div className="text-gold font-mono text-[10px] uppercase tracking-widest mb-2 opacity-50">Situation_Parameters</div>
                      <p className="text-cream/80 text-lg leading-snug">{study.situation}</p>
                    </div>
                    <div className="p-6 bg-gold/5 rounded-2xl border border-gold/20">
                      <div className="text-gold font-mono text-[10px] uppercase tracking-widest mb-2">Optimal_Action</div>
                      <p className="text-white text-xl font-bold italic tracking-tight uppercase">{study.decision}</p>
                    </div>
                    <div className="p-6">
                      <div className="text-gold font-mono text-[10px] uppercase tracking-widest mb-2 opacity-50">Strategic_Rationale</div>
                      <p className="text-cream/60 text-lg leading-relaxed">{study.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mistakes & Tips Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-500/70" />
                <h2 className="text-red-500/70 font-mono text-xs uppercase tracking-[0.3em]">05_Critical_Leaks</h2>
              </div>
              <div className="space-y-4">
                {chapter.commonMistakes.map((mistake, i) => (
                  <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-cream/50 hover:text-cream/80 transition-colors">
                    <ChapterSection content={mistake} />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-4 h-4 text-gold/70" />
                <h2 className="text-gold/70 font-mono text-xs uppercase tracking-[0.3em]">06_Pro_Insights</h2>
              </div>
              <div className="space-y-4">
                {chapter.proTips.map((tip, i) => (
                  <div key={i} className="p-4 bg-gold/5 border border-gold/10 rounded-xl text-cream/50 hover:text-cream/80 transition-colors">
                    <ChapterSection content={tip} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Connections Section */}
          <section className="pt-12 border-t border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <Link2 className="w-4 h-4 text-gold/50" />
              <h2 className="text-gold/50 font-mono text-xs uppercase tracking-[0.3em]">07_Neural_Links</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {chapter.connections.map((conn, i) => (
                <div key={i} className="px-4 py-2 bg-charcoal rounded-lg border border-white/5 text-cream/40 text-sm font-mono tracking-tight hover:text-gold hover:border-gold/30 cursor-pointer transition-all">
                   <ChapterSection content={conn} />
                </div>
              ))}
            </div>
          </section>
        </article>

        <footer className="mt-24 pt-12 border-t border-white/5">
          {nextChapterId ? (
            <a 
              href={`/theory/${nextChapterId}`}
              className="group relative p-8 rounded-3xl bg-charcoal/30 border border-white/5 overflow-hidden block cursor-pointer transition-all hover:border-gold/40"
            >
              <div className="absolute inset-0 bg-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-gold text-[10px] uppercase font-mono mb-2 tracking-widest">Protocol: Sequential_Study</p>
                  <h4 className="text-2xl font-black text-white group-hover:text-gold transition-colors uppercase italic tracking-tight font-display">
                    Proceed to Next Lesson
                  </h4>
                </div>
                <div className="p-4 rounded-2xl bg-charcoal border border-white/5 group-hover:bg-gold group-hover:border-gold-light transition-all duration-300 shadow-gold">
                  <ArrowRight className="w-6 h-6 text-cream/40 group-hover:text-charcoal-dark transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </a>
          ) : (
            <div className="p-8 rounded-3xl bg-charcoal/30 border border-white/5 text-center">
              <p className="text-gold text-[10px] uppercase font-mono mb-2 tracking-widest">Protocol: Course_Complete</p>
              <h4 className="text-2xl font-black text-white uppercase italic tracking-tight font-display">
                Theory Mastery Achieved
              </h4>
              <a 
                href="/play" 
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gold text-charcoal-dark rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-light transition-colors"
              >
                Apply Knowledge in Game
                <Target size={14} />
              </a>
            </div>
          )}
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
          border: 2px solid #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #27272a;
        }
      `}</style>
    </div>
  );
};
