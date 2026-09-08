import React from 'react';
import { 
  User, 
  ArrowUp, 
  ArrowDown, 
  Play, 
  RotateCcw,
  Target
} from 'lucide-react';

interface HandSetupViewProps {
  players: { name: string; stack: number }[];
  dealerIndex: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  onUpdateDealer: (idx: number) => void;
  onUpdateSB: (idx: number) => void;
  onUpdateBB: (idx: number) => void;
  onSwapPlayers: (idx1: number, idx2: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const HandSetupView: React.FC<HandSetupViewProps> = ({
  players,
  dealerIndex,
  smallBlindIndex,
  bigBlindIndex,
  onUpdateDealer,
  onUpdateSB,
  onUpdateBB,
  onSwapPlayers,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="max-w-2xl w-full p-1 bg-gradient-to-b from-gold/30 to-transparent rounded-3xl animate-scale-in">
      <div className="space-y-6 p-8 bg-charcoal rounded-[1.4rem] border border-gold/10 shadow-gold-strong relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
              Hand <span className="text-gold">Configuration</span>
            </h2>
            <p className="text-cream/40 text-[10px] font-black tracking-[0.2em]">ASSIGN ROLES & SEATING</p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 text-cream/40 hover:text-white transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-gold/40 uppercase tracking-widest">
            <div className="col-span-1 text-center">Pos</div>
            <div className="col-span-5">Operator</div>
            <div className="col-span-6 text-right">Assign Role</div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            {players.map((player, i) => (
              <div 
                key={i} 
                className={`
                  grid grid-cols-12 gap-4 items-center p-3 rounded-xl border transition-all
                  ${dealerIndex === i || smallBlindIndex === i || bigBlindIndex === i 
                    ? 'bg-gold/5 border-gold/20' 
                    : 'bg-charcoal-dark/50 border-white/5'}
                `}
              >
                {/* Position & Move */}
                <div className="col-span-1 flex flex-col items-center gap-1">
                  <button 
                    onClick={() => i > 0 && onSwapPlayers(i, i - 1)}
                    disabled={i === 0}
                    className="text-gold/20 hover:text-gold disabled:opacity-0 transition-all"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <span className="text-xs font-mono text-cream/40">{i + 1}</span>
                  <button 
                    onClick={() => i < players.length - 1 && onSwapPlayers(i, i + 1)}
                    disabled={i === players.length - 1}
                    className="text-gold/20 hover:text-gold disabled:opacity-0 transition-all"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Player Name */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-gold text-charcoal' : 'bg-charcoal border border-white/10 text-gold/40'}`}>
                    {i === 0 ? <Target size={14} /> : <User size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase truncate">{player.name}</p>
                    <p className="text-[10px] font-mono text-gold/40">${player.stack}</p>
                  </div>
                </div>

                {/* Role Assignment */}
                <div className="col-span-6 flex justify-end gap-2">
                  <button 
                    onClick={() => onUpdateDealer(i)}
                    className={`
                      px-3 py-1.5 rounded-lg font-black text-[10px] tracking-widest transition-all border
                      ${dealerIndex === i 
                        ? 'bg-gold text-charcoal border-gold shadow-gold' 
                        : 'bg-charcoal-dark text-gold/40 border-gold/10 hover:border-gold/30'}
                    `}
                  >
                    DEALER
                  </button>
                  <button 
                    onClick={() => onUpdateSB(i)}
                    className={`
                      px-3 py-1.5 rounded-lg font-black text-[10px] tracking-widest transition-all border
                      ${smallBlindIndex === i 
                        ? 'bg-amber-warm text-charcoal border-amber-warm shadow-gold' 
                        : 'bg-charcoal-dark text-amber-warm/40 border-amber-warm/10 hover:border-amber-warm/30'}
                    `}
                  >
                    SB
                  </button>
                  <button 
                    onClick={() => onUpdateBB(i)}
                    className={`
                      px-3 py-1.5 rounded-lg font-black text-[10px] tracking-widest transition-all border
                      ${bigBlindIndex === i 
                        ? 'bg-red-500 text-white border-red-500 shadow-lg' 
                        : 'bg-charcoal-dark text-red-500/40 border-red-500/10 hover:border-red-500/30'}
                    `}
                  >
                    BB
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gold/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <p className="text-[9px] font-bold text-gold/60 uppercase tracking-widest">
              Standard rotation applied by default. Click to override.
            </p>
          </div>
          
          <button 
            onClick={onConfirm}
            className="btn-tactical w-full py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-charcoal-dark rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-gold active:scale-[0.98]"
          >
            <Play size={18} fill="currentColor" />
            COMMENCE HAND
          </button>
        </div>
      </div>
    </div>
  );
};
