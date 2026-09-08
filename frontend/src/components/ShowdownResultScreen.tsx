import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Play, DollarSign } from 'lucide-react';
import { CardComponent } from './CardComponent';
import type { Card } from '../lib/api';

interface ShowdownResultScreenProps {
  showdownResult: {
    winners: { name: string; amount: number }[];
    pots_results: any[];
  };
  players: any[]; // The updated players from the store
  communityCards: Card[];
  onNextHand: () => void;
}

export const ShowdownResultScreen: React.FC<ShowdownResultScreenProps> = ({ 
  showdownResult, 
  players, 
  communityCards,
  onNextHand 
}) => {
  const isSplitPot = showdownResult.winners.length > 1;
  const totalWon = showdownResult.winners.reduce((acc, w) => acc + w.amount, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full min-h-[600px] bg-charcoal border border-gold/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between"
    >
      {/* Background glow behind winners */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4 pt-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gold-dark to-charcoal-dark border-4 border-gold rounded-full shadow-[0_0_40px_rgba(212,175,55,0.5)]"
          >
            <Trophy size={48} className="text-gold-light" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl font-display font-black text-white uppercase tracking-[0.15em] drop-shadow-lg">
              {isSplitPot ? 'Split Pot' : 'Winner Declared'}
            </h1>
            <p className="text-gold font-mono uppercase tracking-[0.3em] text-sm mt-3">
              Total Pot Distributed: <span className="font-bold text-white">${totalWon.toFixed(2)}</span>
            </p>
          </motion.div>
        </div>

        {/* Board Cards */}
        {communityCards.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-col items-center space-y-3 bg-black/30 p-6 rounded-2xl border border-white/5"
          >
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Final Board</span>
            <div className="flex gap-2">
              {communityCards.map((c, i) => (
                <CardComponent key={i} card={c} size="md" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Winners List */}
        <div className="flex flex-wrap justify-center gap-6">
          {showdownResult.winners.map((winner, idx) => {
            const playerDetails = players.find(p => p.name === winner.name);
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (idx * 0.1) }}
                className="bg-charcoal-dark border-2 border-gold/50 rounded-2xl p-6 min-w-[280px] shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col items-center text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors"></div>
                
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-wider relative z-10">{winner.name}</h3>
                
                <div className="flex items-center gap-1 text-gold my-3 relative z-10">
                  <DollarSign size={20} />
                  <span className="text-3xl font-black">{winner.amount.toFixed(2)}</span>
                </div>

                {playerDetails && playerDetails.hole_cards && playerDetails.hole_cards.length === 2 && (
                  <div className="flex gap-2 mt-4 relative z-10">
                    <CardComponent card={playerDetails.hole_cards[0]} size="sm" isRevealing={true} />
                    <CardComponent card={playerDetails.hole_cards[1]} size="sm" isRevealing={true} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Action Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex justify-center mt-12 relative z-10 border-t border-white/5 pt-8"
      >
        <button 
          onClick={onNextHand}
          className="group relative px-10 py-5 bg-charcoal-dark border border-gold hover:border-gold-light rounded-2xl font-display font-black text-xl uppercase tracking-widest text-gold hover:text-charcoal-dark overflow-hidden transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gold-dark via-gold to-gold-light opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center gap-3">
            <Play size={24} className="fill-current" />
            Proceed to Next Hand <ArrowRight size={24} />
          </div>
        </button>
      </motion.div>

    </motion.div>
  );
};
