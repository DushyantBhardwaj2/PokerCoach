import React, { useState, useMemo } from 'react';
import type { Card, Rank, Suit } from '../lib/api';
import { CardComponent } from './CardComponent';
import { RotateCcw, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

interface CommunityCardsInputProps {
  round: string;
  existingCards: Card[];
  holeCards: Card[];
  onConfirm: (cards: Card[]) => void;
  onCancel?: () => void;
}

export const CommunityCardsInput: React.FC<CommunityCardsInputProps> = ({
  round,
  existingCards,
  holeCards,
  onConfirm,
}) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const totalNeeded = useMemo(() => {
    if (round === 'flop') return 3;
    if (round === 'turn') return 4;
    if (round === 'river') return 5;
    return 0;
  }, [round]);

  const requiredCount = Math.max(0, totalNeeded - existingCards.length);

  const isAtLimit = selectedCards.length >= requiredCount;
  const isConfirmDisabled = selectedCards.length !== requiredCount;

  const handleCardSelect = (rank: Rank, suit: Suit) => {
    const isSelected = selectedCards.some(c => c.rank === rank && c.suit === suit);
    if (isSelected) {
      setSelectedCards(selectedCards.filter(c => !(c.rank === rank && c.suit === suit)));
    } else if (!isAtLimit) {
      setSelectedCards([...selectedCards, { rank, suit }]);
    }
  };

  const getPhaseName = () => {
    if (round === 'flop') return 'THE FLOP';
    if (round === 'turn') return 'THE TURN';
    if (round === 'river') return 'THE RIVER';
    return 'COMMUNITY CARDS';
  };

  const getInstruction = () => {
    return `Input ${requiredCount} missing card${requiredCount === 1 ? '' : 's'}`;
  };

  const takenCards = [...existingCards, ...holeCards];

  return (
    <div className="max-w-4xl w-full p-8 bg-charcoal-dark border-2 border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)] rounded-3xl animate-fade-in relative overflow-hidden">
      {/* Tactical HUD accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/40 rounded-tl-3xl"></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold/40 rounded-tr-3xl"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold/40 rounded-bl-3xl"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/40 rounded-br-3xl"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gold/10 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <Layers className="text-gold" size={28} />
            <h2 className="text-4xl font-display font-black text-white tracking-widest uppercase text-shadow-sm">
              {getPhaseName()}
            </h2>
          </div>
          <p className="text-gold/60 font-mono text-sm tracking-[0.2em] uppercase mt-2 pl-10 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-warm/80" /> {getInstruction()}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 bg-black/40 p-4 rounded-xl border border-white/5 min-w-[240px]">
          <div className="flex gap-2 justify-end min-h-[80px] items-center">
            {selectedCards.length > 0 ? (
              selectedCards.map((c, i) => (
                <div key={i} className="animate-scale-in">
                  <CardComponent card={c} size="md" />
                </div>
              ))
            ) : (
              <div className="text-gold/20 font-mono text-xs uppercase tracking-[0.2em] w-full text-center">
                Awaiting input...
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold/50 w-full text-right mt-2 border-t border-white/10 pt-2">
            Selected: <span className={selectedCards.length === requiredCount ? 'text-green-400' : 'text-amber-warm'}>{selectedCards.length}</span> / {requiredCount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 relative z-10">
        {SUITS.map((s, si) => (
          <div key={s} className={`space-y-3 bg-charcoal/80 p-4 rounded-2xl border border-gold/5 animate-slide-up`} style={{ animationDelay: `${si * 100}ms` }}>
            <div className="flex justify-center pb-2 border-b border-gold/10">
              <span className={`text-2xl drop-shadow-md ${
                s === 'h' ? 'text-red-500' : s === 'd' ? 'text-blue-500' : 'text-gold/80'
              }`}>
                {s === 's' ? '♠' : s === 'h' ? '♥' : s === 'd' ? '♦' : '♣'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {RANKS.map(r => {
                const isSelected = selectedCards.some(c => c.rank === r && c.suit === s);
                const isTaken = takenCards.some(c => c.rank === r && c.suit === s);
                const isDisabled = !isSelected && (isAtLimit || isTaken);

                return (
                  <button 
                    key={r}
                    onClick={() => handleCardSelect(r, s)}
                    disabled={isDisabled}
                    className={`
                      py-2 rounded-lg font-mono text-sm font-bold transition-all duration-150
                      ${isSelected 
                        ? 'bg-gold border border-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105 z-10' 
                        : isTaken
                          ? 'bg-black/50 border border-white/5 text-white/10 cursor-not-allowed opacity-40'
                          : isAtLimit
                            ? 'bg-charcoal-light border border-white/5 text-white/20 cursor-not-allowed'
                            : 'bg-charcoal-light border border-white/10 text-white/60 hover:border-gold/50 hover:text-white hover:bg-white/5 active:scale-95'
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

      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 relative z-10">
        <button 
          onClick={() => setSelectedCards([])}
          className="px-6 py-4 bg-black/40 hover:bg-black/60 text-white/50 hover:text-white/80 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-[0.98]"
        >
          <RotateCcw size={16} /> RESET
        </button>
        <button 
          onClick={() => onConfirm([...existingCards, ...selectedCards])}
          disabled={isConfirmDisabled}
          className="flex-1 max-w-sm py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black rounded-xl font-display font-black text-lg tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-20 disabled:grayscale disabled:shadow-none active:scale-[0.98] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
        >
          <CheckCircle2 size={22} /> INJECT {getPhaseName()}
        </button>
      </div>
    </div>
  );
};
