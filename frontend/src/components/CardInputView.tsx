import React from 'react';
import type { Card, Rank, Suit } from '../lib/api';
import { CardComponent } from './CardComponent';
import { RotateCcw, CheckCircle2, LayoutGrid } from 'lucide-react';

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

interface CardInputViewProps {
  pickingFor: 'hole' | 'community';
  selectedCards: Card[];
  onCardSelect: (card: Card) => void;
  onConfirm: () => void;
  onReset: () => void;
  round?: string;
  takenCards?: Card[];
}

export const CardInputView: React.FC<CardInputViewProps> = ({
  pickingFor,
  selectedCards,
  onCardSelect,
  onConfirm,
  onReset,
  round,
  takenCards = []
}) => {
  const getRequiredCount = () => {
    if (pickingFor === 'hole') return 2;
    if (round === 'flop') return 3;
    if (round === 'turn') return 4;
    if (round === 'river') return 5;
    return 0;
  };

  const reqCount = getRequiredCount();
  const isConfirmDisabled = selectedCards.length !== reqCount;
  const isAtLimit = selectedCards.length >= reqCount;

  const getTitle = () => {
    if (pickingFor === 'hole') return 'Identify Your Hand';
    if (round === 'flop') return 'Select the Flop';
    if (round === 'turn') return 'Select the Turn';
    if (round === 'river') return 'Select the River';
    return 'Community Cards';
  };

  const getSubTitle = () => {
    if (pickingFor === 'hole') return 'Select 2 hole cards';
    if (round === 'flop') return 'Select 3 community cards';
    if (round === 'turn') return 'Add the 4th community card';
    if (round === 'river') return 'Add the final community card';
    return 'Input public cards';
  };

  return (
    <div className="max-w-4xl w-full p-8 bg-charcoal rounded-3xl border border-gold/10 shadow-gold-strong animate-fade-in relative overflow-hidden">
      {/* Decorative background symbols */}
      <div className="absolute top-10 right-10 text-gold/5 pointer-events-none select-none">
        <LayoutGrid size={200} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-gold/10 pb-8 relative z-10">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {getTitle()}
          </h2>
          <p className="text-gold/60 text-sm font-medium tracking-[0.1em] uppercase mt-1">
            {getSubTitle()}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4 glass-dark p-4 rounded-2xl border border-gold/20 min-w-[200px] justify-center items-center h-32 shadow-inner">
            {selectedCards.length > 0 ? (
              <div className="flex gap-3 animate-scale-in">
                {selectedCards.map((c, i) => (
                  <CardComponent key={`${c.rank}${c.suit}-${i}`} card={c} size="md" />
                ))}
              </div>
            ) : (
              <div className="text-gold/20 text-xs font-black uppercase tracking-[0.2em] italic text-center">
                Awaiting selection...
              </div>
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gold/40">
            {selectedCards.length} / {reqCount} Selected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 relative z-10">
        {SUITS.map((s, si) => (
          <div key={s} className={`space-y-4 bg-charcoal-dark/50 p-5 rounded-2xl border border-gold/5 animate-slide-up stagger-${si+1}`}>
            <div className="flex justify-center pb-2 border-b border-gold/5">
              <span className={`text-3xl ${
                s === 'h' ? 'text-red-500' : s === 'd' ? 'text-blue-500' : 'text-gold/80'
              }`}>
                {s === 's' ? '♠' : s === 'h' ? '♥' : s === 'd' ? '♦' : '♣'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {RANKS.map(r => {
                const isSelected = selectedCards.some(c => c.rank === r && c.suit === s);
                const isTaken = takenCards.some(c => c.rank === r && c.suit === s);
                const isDisabled = !isSelected && (isAtLimit || isTaken);

                return (
                  <button 
                    key={r}
                    onClick={() => onCardSelect({ rank: r, suit: s })}
                    disabled={isDisabled}
                    className={`
                      py-2.5 rounded-xl border text-sm font-bold transition-all duration-300
                      ${isSelected 
                        ? 'bg-gold border-gold text-charcoal-dark shadow-gold scale-105 z-10' 
                        : isTaken
                          ? 'bg-charcoal-dark border-gold/5 text-gold/5 cursor-not-allowed opacity-20'
                          : isAtLimit
                            ? 'bg-charcoal border-gold/5 text-cream/10 cursor-not-allowed'
                            : 'bg-charcoal border-gold/10 text-cream/40 hover:border-gold/40 hover:text-cream hover:scale-105'
                      }
                    `}
                  >
                    {r === 'T' ? '10' : r}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-10 relative z-10">
        <button 
          onClick={onReset}
          className="flex-1 py-4 bg-charcoal-light/30 hover:bg-charcoal-light/50 text-cream/60 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-gold/5 active:scale-[0.98]"
        >
          <RotateCcw size={18} /> CLEAR ALL
        </button>
        <button 
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          className="flex-[2] btn-tactical py-4 bg-gradient-to-r from-gold-dark to-gold text-charcoal-dark rounded-xl font-black text-base sm:text-lg flex items-center justify-center gap-2 transition-all shadow-gold disabled:opacity-30 active:scale-[0.98]"
        >
          <CheckCircle2 size={20} /> CONFIRM {pickingFor === 'community' && round ? round.toUpperCase() : 'SELECTION'}
        </button>
      </div>
    </div>
  );
};
