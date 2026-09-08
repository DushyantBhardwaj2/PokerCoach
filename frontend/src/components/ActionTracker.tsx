import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XCircle, Coins, Wallet, Shield } from 'lucide-react';
import type { GameState, ActionType, PlayerStatus } from '../lib/api';
import { VirtualTable } from './VirtualTable';

interface ActionTrackerProps {
  gameState: GameState;
  onAction: (type: ActionType, amount?: number) => void;
  onOpenCardInput: () => void;
  onRefillStack: (playerIndex: number, amount: number) => void;
  onUpdatePlayerStatus: (index: number, status: PlayerStatus) => void;
  onRemovePlayer: (index: number) => void;
  onUpdateStack?: (index: number, amount: number) => void;
  onReorderPlayers?: (from: number, to: number) => void;
  onRotateDealer?: (dir: 'cw' | 'ccw') => void;
  onUndo?: () => void;
  hasUndo?: boolean;
}

export const ActionTracker: React.FC<ActionTrackerProps> = ({
  gameState,
  onAction,
  onOpenCardInput,
  onRefillStack,
  onUpdatePlayerStatus,
  onRemovePlayer,
  onUpdateStack,
  onReorderPlayers,
  onRotateDealer,
  onUndo,
  hasUndo
}) => {
  const [raisingPlayerIdx, setRaisingPlayerIdx] = useState<number | null>(null);
  const [raiseAmount, setRaiseAmount] = useState<string>("");
  const [refillingPlayerIdx, setRefillingPlayerIdx] = useState<number | null>(null);
  const [refillAmount, setRefillAmount] = useState<string>("1000");

  const activePlayer = gameState.players[gameState.current_player_index];

  return (
    <div className="flex-1 space-y-4 animate-fade-in relative min-h-[600px]">
      {/* 1. Spatial Virtual Table */}
      <VirtualTable
        gameState={gameState}
        onAction={onAction}
        onOpenCardInput={onOpenCardInput}
        onRefillStack={onRefillStack}
        onUpdatePlayerStatus={onUpdatePlayerStatus}
        onRemovePlayer={onRemovePlayer}
        onUpdateStack={onUpdateStack}
        onReorderPlayers={onReorderPlayers}
        onRotateDealer={onRotateDealer}
        onUndo={onUndo}
        hasUndo={hasUndo}
      />

      {/* 2. Floating Action Panel (Anchored to bottom center) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
        <div className="glass-dark border border-white/10 rounded-2xl p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle background for active player */}
          <div className="absolute inset-0 bg-gold/[0.02] pointer-events-none" />

          <div className="flex flex-col gap-3 relative z-10">
            {/* Active Player Info Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold text-charcoal-dark flex items-center justify-center font-black text-sm shadow-gold">
                  {gameState.current_player_index === 0 ? 'U' : gameState.current_player_index + 1}
                </div>
                <div>
                   <h3 className="text-base font-black text-white uppercase tracking-tight">{activePlayer.name}'s Turn</h3>
                   <div className="flex items-center gap-1.5 text-[9px] font-bold text-gold/60 uppercase tracking-widest">
                     <Coins size={9} /> ${activePlayer.stack.toLocaleString()} available
                   </div>
                </div>
              </div>

              {/* Quick Refill Access */}
              <button
                onClick={() => setRefillingPlayerIdx(gameState.current_player_index)}
                className="p-1.5 bg-white/5 hover:bg-gold/10 text-gold rounded-lg border border-white/10 hover:border-gold/20 transition-all"
                title="Quick Refill"
              >
                <Wallet size={16} />
              </button>
            </div>

            {/* Main Action Group */}
            <div className="flex gap-2">
              {raisingPlayerIdx !== null ? (
                <div className="w-full flex flex-col gap-3 animate-scale-in">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold font-black text-xl">$</span>
                      <input
                        type="number"
                        value={raiseAmount}
                        onChange={e => setRaiseAmount(e.target.value)}
                        className="w-full bg-charcoal-dark border-2 border-gold/30 rounded-xl py-2 pl-8 pr-3 text-cream outline-none focus:border-gold font-mono text-xl shadow-inner"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => setRaisingPlayerIdx(null)}
                      className="px-4 py-3 bg-charcoal-light text-white/50 rounded-xl border border-white/10 font-black uppercase text-xs tracking-widest hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Min', val: gameState.current_bet + gameState.big_blind },
                      { label: '1/2 Pot', val: Math.round(gameState.pot / 2 + gameState.current_bet) },
                      { label: 'Pot', val: Math.round(gameState.pot + gameState.current_bet) },
                      { label: 'Max', val: activePlayer.stack + activePlayer.current_bet }
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={() => setRaiseAmount(btn.val.toString())}
                        className="py-1.5 bg-white/5 hover:bg-gold/10 text-gold/60 hover:text-gold border border-white/5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (raiseAmount && Number(raiseAmount) > 0) onAction('raise', Number(raiseAmount));
                      setRaisingPlayerIdx(null);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-charcoal-dark rounded-xl font-black text-sm uppercase shadow-gold-strong transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Confirm Raise
                  </button>
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAction('fold')}
                    className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl border border-red-500/20 transition-all active:scale-95 group"
                  >
                    <XCircle size={24} className="group-hover:scale-110 transition-transform" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    onClick={() => onAction(gameState.current_bet > activePlayer.current_bet ? 'call' : 'check')}
                    className="flex-1 py-3 bg-gold text-charcoal-dark rounded-xl font-black text-sm uppercase tracking-widest shadow-gold transition-all active:scale-95"
                  >
                    {gameState.current_bet > activePlayer.current_bet ? 'Call' : 'Check'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setRaiseAmount((gameState.current_bet + gameState.big_blind).toString());
                      setRaisingPlayerIdx(gameState.current_player_index);
                    }}
                    className="px-6 py-3 bg-charcoal-light hover:bg-gold/10 text-gold hover:text-white rounded-xl border border-gold/20 font-black text-sm uppercase tracking-widest transition-all active:scale-95"
                  >
                    Raise
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                        boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 15px rgba(212,175,55,0.4)", "0 0 0px rgba(212,175,55,0)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    onClick={() => onAction('all-in')}
                    className="p-3 bg-amber-warm/10 hover:bg-amber-warm text-amber-warm hover:text-charcoal-dark rounded-2xl border border-amber-warm/30 transition-all active:scale-95 group shadow-gold-subtle"
                    title="All-In"
                  >
                    <Coins size={24} className="group-hover:rotate-12 transition-transform" />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refill Overlay */}
      {refillingPlayerIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="max-w-sm w-full glass-dark border border-gold/30 p-5 rounded-3xl shadow-2xl animate-scale-in">
             <div className="text-center space-y-3 mb-6">
               <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold mx-auto border border-gold/20">
                 <Wallet size={24} />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Refill Stack</h3>
               <p className="text-gold/60 text-xs uppercase font-bold tracking-widest">Adjusting: {gameState.players[refillingPlayerIdx].name}</p>
             </div>

             <div className="space-y-6">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-black text-2xl">$</span>
                  <input 
                    type="number" 
                    value={refillAmount}
                    onChange={e => setRefillAmount(e.target.value)}
                    className="w-full bg-charcoal-dark border-2 border-gold/20 rounded-2xl py-4 pl-10 pr-4 text-cream outline-none focus:border-gold font-mono text-2xl text-center"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setRefillAmount("500")} className="py-3 bg-white/5 hover:bg-white/10 text-cream/80 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">+$500</button>
                  <button onClick={() => setRefillAmount("1000")} className="py-3 bg-white/5 hover:bg-white/10 text-cream/80 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">+$1000</button>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setRefillingPlayerIdx(null)}
                    className="flex-1 py-4 bg-charcoal-light text-white/40 rounded-2xl font-black uppercase text-xs tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (refillAmount && Number(refillAmount) > 0) onRefillStack(refillingPlayerIdx!, Number(refillAmount));
                      setRefillingPlayerIdx(null);
                    }}
                    className="flex-[2] py-4 bg-gold text-charcoal-dark rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-gold transition-all"
                  >
                    Apply Refill
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Street Notification Footnote - strategic language */}
      {gameState.round === 'pre-flop' && (
        <div className="glass-light border border-white/5 p-3.5 rounded-2xl flex items-center gap-3 text-cream/40 text-xs animate-fade-in mx-auto max-w-md">
          <Shield size={14} className="text-gold/30" />
          <p className="font-medium tracking-wide">Reading opponent from current hand.</p>
        </div>
      )}
    </div>
  );
};
