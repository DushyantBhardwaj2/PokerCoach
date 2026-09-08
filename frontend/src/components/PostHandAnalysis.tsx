import React from 'react';
import { Award, TrendingUp, RefreshCw, BarChart, BookOpen, Skull, SplitSquareHorizontal } from 'lucide-react';

interface PostHandAnalysisProps {
  showdownResult: any;
  onNewHand: () => void;
  userName?: string;
}

export const PostHandAnalysis: React.FC<PostHandAnalysisProps> = ({ showdownResult, onNewHand, userName = 'You' }) => {
  if (!showdownResult) return null;

  const winners: { name: string; amount: number }[] = showdownResult.winners || [];
  const pots_results: any[] = showdownResult.pots_results || [];
  const isUserWinner = winners.some(w => w.name === userName);
  const isSplitPot = winners.length > 1;

  return (
    <div className="animate-scale-in glass-dark border border-gold/30 rounded-[32px] overflow-hidden shadow-gold-strong max-w-sm w-full flex flex-col h-full">
      <div className={`p-8 text-center space-y-4 ${isUserWinner ? 'bg-gold/10' : 'bg-red-500/5'}`}>
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full shadow-gold mb-2 ${isUserWinner ? 'bg-gold' : 'bg-red-900/20 border border-red-500/30'}`}>
          {isSplitPot && isUserWinner ? <SplitSquareHorizontal size={40} className="text-charcoal" /> : 
           isUserWinner ? <Award size={40} className="text-charcoal" /> : 
           <Skull size={40} className="text-red-500" />}
        </div>
        
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
          {isSplitPot ? (isUserWinner ? 'Split Victory!' : 'Split Pot') : (isUserWinner ? 'Victory!' : 'Hand Lost')}
        </h2>
        
        <div className="space-y-2">
          {pots_results.length > 1 ? (
            <div className="space-y-1.5 mt-2">
              <p className="text-[10px] text-gold/60 font-black uppercase tracking-[0.2em]">Pot Breakdown</p>
              {pots_results.map((pr, i) => (
                <div key={i} className="text-[11px] font-mono text-cream/80 flex justify-between gap-4 px-2">
                  <span>{i === 0 ? 'Main' : `Side ${i}`}: <span className="text-white">${pr.amount}</span></span>
                  <span className="text-gold truncate max-w-[120px]">{pr.winners.join(', ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {winners.map((winner, idx) => (
                <p key={idx} className="text-cream/60 font-bold uppercase tracking-widest text-xs">
                  {winner.name} collected <span className="text-gold font-black">${winner.amount.toFixed(2)}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gold/10 pb-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Post-Hand Review</h3>
            <BookOpen size={12} className="text-gold/30" />
          </div>
          
          <div className="space-y-3">
            <div className="bg-white/5 p-4 rounded-2xl flex items-start gap-4 border border-white/5 hover:border-gold/20 transition-colors group">
              <div className="bg-gold/10 p-2 rounded-lg group-hover:bg-gold/20 transition-colors">
                <TrendingUp className="text-gold" size={14} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-cream mb-1">Mistake Analysis</h4>
                <p className="text-[11px] text-cream/40 leading-relaxed font-medium">
                  {isUserWinner 
                    ? "You exploited an opponent mistake. According to the Fundamental Theorem, you gained because they played differently than they would have if they saw your hand." 
                    : "The opponent extracted value. Analyze if your call on the previous street was -EV given their likely range."}
                </p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl flex items-start gap-4 border border-white/5 hover:border-gold/20 transition-colors group">
              <div className="bg-gold/10 p-2 rounded-lg group-hover:bg-gold/20 transition-colors">
                <BarChart className="text-gold" size={14} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-cream mb-1">Theoretical EV</h4>
                <p className="text-[11px] text-cream/40 leading-relaxed font-medium">
                  {isUserWinner 
                    ? "Cumulative hand EV: POSITIVE. Your decisions aligned with mathematical expectation." 
                    : "Cumulative hand EV: NEUTRAL/NEGATIVE. Remember, the object of poker is to make the best decisions, not just win the most money."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onNewHand}
          className="w-full btn-tactical py-5 bg-gold text-charcoal-dark rounded-2xl font-black uppercase tracking-[0.2em] shadow-gold-strong flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
        >
          <RefreshCw size={18} /> New Hand
        </button>
      </div>
    </div>
  );
};
