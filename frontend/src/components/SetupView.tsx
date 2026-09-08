import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, Users, Database, Coins, Trophy, Trash2, AlertCircle } from 'lucide-react';

interface SetupViewProps {
  playerNames: string[];
  setPlayerNames: (names: string[]) => void;
  initialStack: number;
  setInitialStack: (s: number) => void;
  bigBlind: number;
  setBigBlind: (b: number) => void;
  loading: boolean;
  onStart: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  playerNames,
  setPlayerNames,
  initialStack,
  setInitialStack,
  bigBlind,
  setBigBlind,
  loading,
  onStart
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check for duplicate names
  const checkDuplicate = (name: string): boolean => {
    const normalizedName = name.trim().toLowerCase();
    return playerNames.some(n => n.trim().toLowerCase() === normalizedName);
  };

  const addPlayer = () => {
    // Validate
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) {
      setNewPlayerName('');
      inputRef.current?.focus();
      return;
    }

    // Check for duplicate
    if (checkDuplicate(trimmedName)) {
      setDuplicateError(`"${trimmedName}" already exists`);
      return;
    }

    setDuplicateError(null);

    // Add the new player
    if (playerNames.length < 10) {
      setPlayerNames([...playerNames, trimmedName]);
      setNewPlayerName('');

      // Auto-focus input after adding
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newPlayerName.trim()) {
        addPlayer();
      } else {
        // If input is empty and Enter pressed, start the game
        onStart();
      }
    }
  };

  const removePlayer = (index: number) => {
    // Can remove if this isn't the last remaining player after us (need at least 2 total)
    if (playerNames.length > 2) {
      const newNames = [...playerNames];
      newNames.splice(index, 1);
      setPlayerNames(newNames);
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    // Clear duplicate error when user starts typing
    if (duplicateError) setDuplicateError(null);

    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  // Determine if we can remove a player at given index
  // Keep index 0 (You) always, can remove others if we have more than 2 total
  const canRemove = (index: number) => index > 0 && playerNames.length > 2;

  return (
    <div className="max-w-md w-full p-1 bg-gradient-to-b from-gold/30 to-transparent rounded-3xl animate-scale-in">
      <div className="space-y-8 p-8 bg-charcoal rounded-[1.4rem] border border-gold/10 shadow-gold-strong relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl"></div>
        
        <div className="text-center space-y-3 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 mb-2">
            <Trophy className="text-gold" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            PokerSense <span className="text-gold">AI</span>
          </h1>
          <p className="text-cream/60 text-sm font-medium tracking-wide">TACTICAL SESSION TRACKER</p>
        </div>

        <div className="space-y-6 relative">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gold/80 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users size={14} /> Operators
              </span>
              <span className="text-[10px] text-cream/30">{playerNames.length}/10</span>
            </div>

            {/* Existing Players List */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
              {playerNames.map((name, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updatePlayerName(i, e.target.value)}
                    placeholder={i === 0 ? "You" : `Player ${i + 1}`}
                    className="flex-1 bg-charcoal-dark border border-gold/10 rounded-xl px-4 py-2 text-cream outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-mono text-sm"
                  />
                  {canRemove(i) && (
                    <button
                      onClick={() => removePlayer(i)}
                      className="p-2 text-cream/40 hover:text-red-400 bg-charcoal-dark border border-gold/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Add New Player Input */}
            <AnimatePresence>
              {playerNames.length < 10 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => {
                      setNewPlayerName(e.target.value);
                      if (duplicateError) setDuplicateError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type name + Enter to add..."
                    className={`w-full bg-charcoal-dark border rounded-xl px-4 py-2 text-cream outline-none transition-all font-mono text-sm ${
                      duplicateError
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-gold/10 focus:border-gold/50 focus:ring-1 focus:ring-gold/20'
                    }`}
                  />
                  {duplicateError && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-red-400">
                      <AlertCircle size={10} />
                      {duplicateError}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 animate-fade-in stagger-3">
              <label htmlFor="initialStack" className="text-xs font-bold text-gold/80 uppercase tracking-[0.2em] flex items-center gap-2">
                <Database size={14} /> Starting Chips
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-bold">$</span>
                <input 
                  id="initialStack"
                  name="initialStack"
                  type="number" 
                  value={initialStack}
                  onChange={e => setInitialStack(Number(e.target.value))}
                  className="w-full bg-charcoal-dark border border-gold/10 rounded-xl py-3.5 pl-9 pr-4 text-cream outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-mono text-lg"
                />
              </div>
            </div>
            <div className="space-y-3 animate-fade-in stagger-4">
              <label htmlFor="bigBlind" className="text-xs font-bold text-gold/80 uppercase tracking-[0.2em] flex items-center gap-2">
                <Coins size={14} /> Big Blind
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-bold">$</span>
                <input 
                  id="bigBlind"
                  name="bigBlind"
                  type="number" 
                  value={bigBlind}
                  onChange={e => setBigBlind(Number(e.target.value))}
                  className="w-full bg-charcoal-dark border border-gold/10 rounded-xl py-3.5 pl-9 pr-4 text-cream outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-mono text-lg"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={onStart}
            disabled={loading || playerNames.some(n => !n.trim())}
            className="btn-tactical w-full py-5 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-charcoal-dark rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-gold active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Play size={22} fill="currentColor" />}
            INITIATE SESSION
          </button>
        </div>
      </div>
    </div>
  );
};
