import React, { useState } from 'react';
import { User, Coins, Target, UserPlus, UserMinus, XCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '../lib/api';
import { CardComponent, CardBack } from './CardComponent';

// --- Polished Slot-Based Spatial Layout ---
// Pre-calculated slots for maximum aesthetic balance.
// Index 0 is always bottom center (the Hero).
const getSlotPosition = (index: number, total: number) => {
  const slots = [
    { top: '88%', left: '50%' }, // 0: Bottom Center (Hero)
    { top: '70%', left: '12%' }, // 1: Bottom Left
    { top: '35%', left: '8%' },  // 2: Mid Left
    { top: '10%', left: '25%' }, // 3: Top Left
    { top: '5%', left: '50%' },  // 4: Top Center
    { top: '10%', left: '75%' }, // 5: Top Right
    { top: '35%', left: '92%' }, // 6: Mid Right
    { top: '70%', left: '88%' }, // 7: Bottom Right
  ];

  if (total === 2) return index === 0 ? slots[0] : slots[4];
  if (total === 3) return index === 0 ? slots[0] : index === 1 ? slots[2] : slots[6];
  if (total === 4) return index === 0 ? slots[0] : index === 1 ? slots[2] : index === 2 ? slots[4] : slots[6];
  if (total === 5) return [slots[0], slots[1], slots[3], slots[5], slots[7]][index];
  if (total === 6) return [slots[0], slots[1], slots[2], slots[4], slots[6], slots[7]][index];
  if (total === 7) return [slots[0], slots[1], slots[2], slots[3], slots[4], slots[5], slots[6]][index];
  if (total === 8) return slots[index];

  // Fallback for > 8 players: graceful ellipse
  const rx = 45;
  const ry = 42;
  const angle = (index * (360 / total) - 90) * (Math.PI / 180);
  return {
    left: `${50 + Math.cos(angle) * rx}%`,
    top: `${50 + Math.sin(angle) * ry}%`
  };
};

interface PlayerPodProps {
  player: Player;
  index: number;
  numPlayers: number;
  isActive: boolean;
  isDealer: boolean;
  onSitOut?: (idx: number) => void;
  onLeave?: (idx: number) => void;
  onUpdateStack?: (idx: number, amount: number) => void;
  position: { top: string; left: string };
}

const PlayerPod: React.FC<PlayerPodProps> = ({
  player, index, isActive, isDealer, onSitOut, onLeave, onUpdateStack, position
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingStack, setIsEditingStack] = useState(false);
  const [tempStack, setTempStack] = useState(player.stack.toString());

  const handleStackSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const amount = parseInt(tempStack);
    if (!isNaN(amount)) onUpdateStack?.(index, amount);
    setIsEditingStack(false);
  };

  const isHero = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, top: position.top, left: position.left }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
    >
      <div
        className={`relative group transition-all duration-500 ease-out flex flex-col items-center
          ${isActive ? 'scale-110 z-30' : 'scale-100 hover:scale-105 z-10'}
          ${player.status === 'folded' ? 'opacity-40 grayscale-[0.8]' : ''}
          ${player.status === 'sitting-out' ? 'opacity-20 grayscale' : ''}
        `}
      >
        {/* Active Player Glow Aura */}
        {isActive && (
          <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full scale-150 animate-pulse pointer-events-none" />
        )}

        {/* Dealer Button */}
        {isDealer && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] flex items-center justify-center font-black text-[9px] z-40 border-2 border-charcoal-dark">
            D
          </div>
        )}

        {/* Main Avatar Pod - High-End Minimalist */}
        <div
          onClick={() => setShowMenu(!showMenu)}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer overflow-hidden backdrop-blur-md
            ${isActive
              ? 'bg-gradient-to-b from-gold/20 to-gold/5 border-2 border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
              : 'bg-charcoal-light/80 border border-white/10 hover:border-white/30'}`}
        >
          {isHero ? <Target size={22} className={isActive ? 'text-gold' : 'text-white/60'} /> : <User size={22} className={isActive ? 'text-gold' : 'text-white/40'} />}

          {/* Subtle inner ring */}
          <div className="absolute inset-1 rounded-full border border-white/5 pointer-events-none" />
        </div>

        {/* Info Panel - Floating strictly below */}
        <div className="mt-2 flex flex-col items-center bg-charcoal-dark/90 backdrop-blur-xl border border-white/10 rounded-lg px-2.5 py-1 shadow-2xl relative z-20 min-w-[80px]">
           <span className="text-[11px] font-bold text-white uppercase tracking-wider truncate max-w-[75px] text-center">
             {player.name}
           </span>
           {isEditingStack ? (
             <form onSubmit={handleStackSubmit} className="mt-0.5" onClick={e => e.stopPropagation()}>
               <input
                 autoFocus
                 type="number"
                 value={tempStack}
                 onChange={e => setTempStack(e.target.value)}
                 onBlur={() => handleStackSubmit()}
                 className="w-14 bg-black/50 border border-gold/40 rounded px-1 py-0.5 text-[10px] text-gold font-mono outline-none text-center"
               />
             </form>
           ) : (
             <span
               onClick={(e) => { e.stopPropagation(); setIsEditingStack(true); }}
               className="text-[10px] font-mono text-gold/70 mt-0.5 flex items-center gap-1 hover:text-gold cursor-pointer transition-colors"
             >
               <Coins size={9} /> ${player.stack.toLocaleString()}
             </span>
           )}
        </div>

        {/* Current Bet Floating Chip */}
        <AnimatePresence>
          {player.current_bet > 0 && (
            <motion.div
              initial={{ y: 0, opacity: 0, scale: 0 }}
              animate={{ y: -65, opacity: 1, scale: 1 }}
              exit={{ y: 0, opacity: 0, scale: 0 }}
              className="absolute bg-charcoal-dark/95 border border-gold/30 text-gold px-2.5 py-1 rounded-full font-mono text-xs font-bold shadow-[0_5px_15px_rgba(212,175,55,0.2)] z-10 flex items-center gap-1.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              ${player.current_bet.toLocaleString()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards Presentation */}
        {player.hole_cards.length === 2 && player.status === 'active' && (
          <div className="absolute -bottom-14 flex gap-1 z-30 scale-70 transform origin-top hover:scale-90 transition-transform duration-300">
            {isHero ? (
              player.hole_cards.map((c, ci) => (
                <motion.div key={ci} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: ci * 0.1 }}>
                  <CardComponent card={c} size="sm" />
                </motion.div>
              ))
            ) : (
              <>
                <CardBack size="sm" />
                <CardBack size="sm" />
              </>
            )}
          </div>
        )}

        {/* Context Menu Overlay */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-full mt-11 bg-charcoal-dark/95 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl flex gap-1.5 z-50 shadow-2xl"
              onClick={e => { e.stopPropagation(); setShowMenu(false); }}
            >
              <button onClick={() => onSitOut?.(index)} className="p-2 bg-white/5 hover:bg-amber-warm/20 text-white/60 hover:text-amber-warm rounded-lg transition-colors" title="Sit Out/In">
                 {player.status === 'sitting-out' ? <UserPlus size={14} /> : <UserMinus size={14} />}
              </button>
              <button onClick={() => onLeave?.(index)} className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-500 rounded-lg transition-colors" title="Remove Player">
                 <XCircle size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};

// --- Main Virtual Table ---
export const VirtualTable: React.FC<any> = ({
  gameState, onOpenCardInput, onUpdatePlayerStatus, onRemovePlayer, onUpdateStack, onRotateDealer, onUndo, hasUndo
}) => {
  const numPlayers = gameState.players.length;

  return (
    <div className="w-full aspect-square md:aspect-[4/3] lg:aspect-[16/9] relative mb-8 overflow-visible select-none rounded-[40px]">

      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Left Controls */}
      <div className="absolute top-2 left-2 flex gap-1.5 z-40">
        {hasUndo && (
          <button onClick={onUndo} className="px-2.5 py-1 bg-charcoal-dark/80 backdrop-blur-md border border-white/10 hover:border-gold/30 text-white/60 hover:text-gold rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all">
            Undo
          </button>
        )}
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-2 right-2 flex gap-1.5 z-40">
        <button onClick={() => onRotateDealer?.('ccw')} className="p-1 bg-charcoal-dark/80 backdrop-blur-md border border-white/10 hover:border-gold/30 text-white/60 hover:text-gold rounded-lg transition-all">
          <Target size={12} className="-scale-x-100" />
        </button>
        <button onClick={() => onRotateDealer?.('cw')} className="p-1 bg-charcoal-dark/80 backdrop-blur-md border border-white/10 hover:border-gold/30 text-white/60 hover:text-gold rounded-lg transition-all">
          <Target size={12} />
        </button>
      </div>

      {/* Center Arena (The Felt) */}
      <div className="absolute inset-6 md:inset-12 lg:inset-20 bg-gradient-to-b from-charcoal-dark/60 to-charcoal-dark border border-white/5 rounded-full shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] flex items-center justify-center">

        {/* Inner glowing ring */}
        <div className="absolute inset-4 rounded-full border border-gold/5 shadow-[0_0_40px_rgba(212,175,55,0.05)] pointer-events-none" />

        <div className="flex flex-col items-center justify-center gap-4 relative z-10 w-full">

          {/* Pot Display */}
          <div className="text-center relative">
            <div className="absolute -inset-6 bg-gold/5 blur-2xl rounded-full pointer-events-none" />
            <span className="text-[9px] font-bold text-gold/50 uppercase tracking-[0.25em] mb-0.5 block">Total Pot</span>
            <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter drop-shadow-gold">
              ${gameState.pot.toLocaleString()}
            </div>

            {/* Side Pots */}
            <AnimatePresence>
              {gameState.pots.length > 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 justify-center mt-1.5">
                  {gameState.pots.map((p: any, i: number) => (
                    <span key={i} className="text-[10px] bg-black/40 border border-white/10 px-1.5 py-0.5 rounded text-gold/70 font-mono">
                      {i === 0 ? 'Main' : `Side ${i}`}: ${p.amount.toLocaleString()}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Community Cards Pod */}
          <div className="relative group">
            <div className="flex gap-1.5 bg-charcoal-dark/80 p-3 rounded-xl border border-white/10 backdrop-blur-xl min-w-[240px] min-h-[100px] justify-center items-center shadow-2xl">
              <AnimatePresence mode="popLayout">
                {gameState.community_cards.length > 0 ? (
                  gameState.community_cards.map((c: any, i: number) => (
                    <motion.div
                      key={`${c.rank}-${c.suit}-${i}`}
                      initial={{ scale: 0.5, y: -20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 20, delay: i * 0.1 }}
                    >
                      <CardComponent card={c} size="lg" />
                    </motion.div>
                  ))
                ) : (
                  <span className="text-xs font-bold text-white/20 uppercase tracking-[0.3em]">Awaiting Flop</span>
                )}
              </AnimatePresence>
            </div>

            {/* Edit Cards Button */}
            <button
              onClick={onOpenCardInput}
              className="absolute -right-2 -top-2 w-8 h-8 bg-charcoal-light hover:bg-gold text-white/50 hover:text-charcoal-dark rounded-full flex items-center justify-center border border-white/10 hover:border-gold shadow-xl transition-all z-30"
            >
              <Eye size={14} />
            </button>

            {/* Street Indicator */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gold text-charcoal-dark px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] tracking-widest shadow-gold">
              {gameState.round}
            </div>
          </div>

        </div>
      </div>

      {/* Players */}
      {gameState.players.map((p: any, i: number) => (
        <PlayerPod
          key={p.name}
          player={p}
          index={i}
          numPlayers={numPlayers}
          isActive={gameState.current_player_index === i}
          isDealer={gameState.dealer_index === i}
          position={getSlotPosition(i, numPlayers)}
          onSitOut={onUpdatePlayerStatus}
          onLeave={onRemovePlayer}
          onUpdateStack={onUpdateStack}
        />
      ))}
    </div>
  );
};
