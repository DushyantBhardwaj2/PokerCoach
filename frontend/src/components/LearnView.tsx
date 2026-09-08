import React from 'react';
import { Target, Users, Layout, Repeat, GraduationCap, ChevronRight, Calculator, ArrowUpCircle, MousePointer2, Ghost, Combine, ZoomIn } from 'lucide-react';

export const LearnView: React.FC = () => {
  const lessons = [
    {
      chapter: 1,
      title: "Beyond Beginning Poker",
      icon: Combine,
      theory: "At its core, poker is a game of skill, specifically the skill of minimizing losses on bad hands and maximizing profits on good hands. You are constantly at war with luck.",
      key_point: "The goal is not to win individual pots, but to make money by consistently making decisions with positive mathematical expectation.",
      href: "/theory/chapter-1"
    },
    {
      chapter: 2,
      title: "Expectation and Hourly Rate",
      icon: Target,
      theory: "Mathematical expectation is the foundation of all gambling. It defines the average amount you stand to win or lose per bet over the long run.",
      key_point: "The sum of all your expectations forms your hourly rate. Focus on making +EV decisions and ignoring short-term results.",
      href: "/theory/chapter-2"
    },
    {
      chapter: 3,
      title: "The Fundamental Theorem of Poker",
      icon: Users,
      theory: "You profit whenever an opponent plays their hand differently from how they would have played it if they could see your cards. You lose when you do the same.",
      key_point: "The goal is to make decisions that are +EV against your opponent's range, forcing them into theoretical mistakes.",
      href: "/theory/chapter-3"
    },
    {
      chapter: 6,
      title: "Effective Odds",
      icon: Calculator,
      theory: "Immediate pot odds can be misleading when multiple betting rounds remain. Effective odds factor in the cost of all future bets you will have to call.",
      key_point: "Generally, future betting rounds reduce the appeal of drawing hands. Always consider the total price of seeing the river.",
      href: "/theory/chapter-6"
    },
    {
      chapter: 8,
      title: "The Value of Deception",
      icon: ZoomIn,
      theory: "Straightforward play allows observant opponents to play perfectly against you. Deception disguises your strength to force opponents into making mistakes.",
      key_point: "Weigh the cost of being outdrawn against the benefit of a future payoff. Use deception primarily against 'super readers'.",
      href: "/theory/chapter-8"
    },
    {
      chapter: 11,
      title: "The Semi-Bluff",
      icon: Repeat,
      theory: "A semi-bluff is a bet with a hand that is likely not the best right now but has a good chance of becoming the best. It combines fold equity and showdown equity.",
      key_point: "Two ways to win: everyone folds immediately, or you hit your draw and win at showdown.",
      href: "/theory/chapter-11"
    },
    {
      chapter: 13,
      title: "Raising",
      icon: ArrowUpCircle,
      theory: "Never raise 'just to see where you are.' Raise to: 1) Increase the pot (Value), 2) Drive out opponents (Protection), 3) Bluff, or 4) Get a free card.",
      key_point: "Every raise must have a clear strategic purpose beyond gathering information.",
      href: "/theory/chapter-13"
    },
    {
      chapter: 14,
      title: "Check-Raising",
      icon: MousePointer2,
      theory: "Check-raising is checking with the intention of raising after an opponent bets. It's a powerful tool to trap opponents or protect a hand when out of position.",
      key_point: "Use check-raising to exploit aggressive bettors and to make checking less of a sign of weakness.",
      href: "/theory/chapter-14"
    },
    {
      chapter: 15,
      title: "Slowplaying",
      icon: Ghost,
      theory: "Slowplaying is checking or just calling with a very strong hand to induce opponents to bet or to keep them in the pot when they might otherwise fold.",
      key_point: "Slow-play only when you have a monster, the board is 'dry', and you expect an aggressive opponent to bet for you.",
      href: "/theory/chapter-15"
    },
    {
      chapter: 17,
      title: "Position",
      icon: Layout,
      theory: "Position refers to where you sit relative to the dealer button. Being in late position allows you to see how everyone else acts before you make a decision.",
      key_point: "Acting last is the single greatest advantage in poker. Play more hands, more aggressively, when in position.",
      href: "/theory/chapter-17"
    }
  ];

  return (
    <div className="max-w-5xl w-full py-12 px-4 md:px-0 space-y-12 md:space-y-16 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Theory Mastery Course</h2>
        <p className="text-gold/60 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-xs">Based on David Sklansky's "The Theory of Poker"</p>
      </div>

      <div className="grid gap-6 md:gap-8">
        {lessons.map((lesson, i) => (
          <a 
            key={i} 
            href={lesson.href}
            className="group bg-charcoal-light/30 border border-white/5 rounded-3xl md:rounded-[40px] p-6 md:p-12 flex flex-col md:flex-row gap-6 md:gap-12 hover:border-gold/20 hover:bg-gold/5 transition-all cursor-pointer"
          >
            <div className="flex-shrink-0 flex items-center justify-center md:block">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gold rounded-2xl md:rounded-3xl flex items-center justify-center text-charcoal shadow-gold transition-transform group-hover:scale-110">
                <lesson.icon size={28} className="md:w-8 md:h-8" />
              </div>
            </div>
            
            <div className="space-y-4 md:space-y-6 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <span className="w-fit text-[10px] font-black uppercase tracking-widest bg-gold/10 text-gold px-3 py-1 rounded-full">Chapter {lesson.chapter}</span>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{lesson.title}</h3>
              </div>
              
              <p className="text-cream/60 leading-relaxed italic text-base md:text-lg">
                "{lesson.theory}"
              </p>

              <div className="bg-black/40 border border-white/5 p-4 md:p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-gold/20 p-2 rounded-lg mt-1 shrink-0">
                  <GraduationCap size={16} className="text-gold" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/60 mb-1">Practical Application</h4>
                  <p className="text-xs md:text-sm text-cream font-bold">{lesson.key_point}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end md:justify-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-cream/20 group-hover:text-gold group-hover:border-gold/40 transition-all">
                <ChevronRight size={20} className="md:w-6 md:h-6" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

