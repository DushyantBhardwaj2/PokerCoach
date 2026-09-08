import { create } from 'zustand';
import type { GameState, Player, ActionType, GameRound, Card, ActionRecord } from '../lib/api';

type PokerSnapshot = GameState & { actionHistory: ActionRecord[] };

interface PokerStore extends GameState {
  // Metadata
  sessionId: string | null;
  isProcessing: boolean;
  error: string | null;
  undoStack: PokerSnapshot[];
  actionHistory: ActionRecord[];

  // Phase 5: Mode transition
  viewMode: 'strategic' | 'tactical';
  isTransitioning: boolean;

  // Actions
  setSession: (id: string) => void;
  recordAction: (record: ActionRecord) => void;
  setPlayers: (players: Player[]) => void;
  updatePlayerAction: (name: string, action: ActionType, amount?: number) => void;
  advanceStreet: (street: GameRound, cards?: Card[]) => void;
  setError: (msg: string | null) => void;
  setProcessing: (isProcessing: boolean) => void;
  nextPlayer: () => void;
  resetGame: () => void;
  updateBoardCards: (cards: Card[]) => void;

  // Phase 4 Actions
  undoAction: () => void;
  updatePlayerStack: (index: number, amount: number) => void;
  removePlayer: (index: number) => void;
  addPlayer: (player: Player) => void;
  toggleSitOut: (index: number) => void;
  reorderPlayers: (fromIndex: number, toIndex: number) => void;
  rotateDealer: (direction: 'cw' | 'ccw') => void;
  saveState: () => void;

  // Phase 5 Actions
  setViewMode: (mode: 'strategic' | 'tactical') => void;
  setTransitioning: (isTransitioning: boolean) => void;
}

const initialState = {
  players: [],
  community_cards: [],
  pots: [],
  pot: 0,
  current_bet: 0,
  last_raise_amount: 0,
  current_player_index: 0,
  dealer_index: 0,
  round: 'pre-flop' as GameRound,
  small_blind: 0,
  big_blind: 0,

  // Metadata
  sessionId: null,
  isProcessing: false,
  error: null,
  undoStack: [],
  actionHistory: [],

  // Phase 5: Mode transition
  viewMode: 'strategic' as const,
  isTransitioning: false,
};

export const usePokerStore = create<PokerStore>((set, get) => ({
  ...initialState,

  saveState: () => {
    const state = get();
    // Keep only last 10 states for memory efficiency
    const newStack = [...state.undoStack, {
      players: JSON.parse(JSON.stringify(state.players)),
      community_cards: [...state.community_cards],
      pots: JSON.parse(JSON.stringify(state.pots)),
      pot: state.pot,
      current_bet: state.current_bet,
      last_raise_amount: state.last_raise_amount,
      current_player_index: state.current_player_index,
      dealer_index: state.dealer_index,
      round: state.round,
      small_blind: state.small_blind,
      big_blind: state.big_blind,
      actionHistory: JSON.parse(JSON.stringify(state.actionHistory)),
    }].slice(-10);
    
    set({ undoStack: newStack });
    
    // Auto-save to localStorage
    if (typeof window !== 'undefined') {
        const persistState = {
            players: state.players,
            community_cards: state.community_cards,
            pots: state.pots,
            pot: state.pot,
            current_bet: state.current_bet,
            last_raise_amount: state.last_raise_amount,
            current_player_index: state.current_player_index,
            dealer_index: state.dealer_index,
            round: state.round,
            small_blind: state.small_blind,
            big_blind: state.big_blind,
            sessionId: state.sessionId,
            actionHistory: state.actionHistory
        };
        localStorage.setItem('poker_session_backup', JSON.stringify(persistState));
    }
  },

  recordAction: (record) => set((state) => ({
    actionHistory: [...state.actionHistory, record]
  })),

  undoAction: () => set((state) => {
    if (state.undoStack.length === 0) return state;
    const previousState = state.undoStack[state.undoStack.length - 1];
    const newStack = state.undoStack.slice(0, -1);
    return { ...previousState, undoStack: newStack };
  }),

  setSession: (id) => set({ sessionId: id }),
  
  setPlayers: (players) => set({ players }),

  updatePlayerAction: (name, action, amount = 0) => {
    get().saveState();
    set((state) => {
      // Optimistic UI updates
      const updatedPlayers = state.players.map(p => {
        if (p.name === name) {
          let newStack = p.stack;
          let newBet = p.current_bet || 0;
          let newStatus = p.status;

          if (action === 'fold') {
            newStatus = 'folded';
          } else if (action === 'call' || action === 'raise' || action === 'all-in') {
            const deduct = Math.min(newStack, amount);
            newStack -= deduct;
            newBet += deduct;
            if (newStack === 0) newStatus = 'all-in';
          }

          return { ...p, stack: newStack, current_bet: newBet, status: newStatus };
        }
        return p;
      });

      return { 
        players: updatedPlayers,
        pot: state.pot + amount 
      };
    });
  },

  advanceStreet: (street, cards = []) => {
    get().saveState();
    set((state) => ({ 
      round: street, 
      community_cards: [...state.community_cards, ...cards],
      // Reset bets for the new street
      players: state.players.map(p => ({ ...p, current_bet: 0 }))
    }));
  },

  updateBoardCards: (cards) => set({ community_cards: cards }),

  setError: (msg) => set({ error: msg }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  nextPlayer: () => set((state) => {
    // Find next active player
    let nextIndex = (state.current_player_index + 1) % state.players.length;
    let loopCount = 0;
    while (
      state.players[nextIndex].status === 'folded' || 
      state.players[nextIndex].status === 'all-in' ||
      state.players[nextIndex].status === 'sitting-out'
    ) {
      nextIndex = (nextIndex + 1) % state.players.length;
      loopCount++;
      if (loopCount > state.players.length) break; // Infinite loop prevention
    }
    return { current_player_index: nextIndex };
  }),

  resetGame: () => set({ ...initialState }),

  // Phase 4 Actions
  updatePlayerStack: (index, amount) => {
    get().saveState();
    set((state) => {
      const updatedPlayers = [...state.players];
      if (updatedPlayers[index]) {
        updatedPlayers[index] = { ...updatedPlayers[index], stack: amount };
      }
      return { players: updatedPlayers };
    });
  },

  removePlayer: (index) => {
    get().saveState();
    set((state) => {
      const updatedPlayers = state.players.filter((_, i) => i !== index);
      // Adjust dealer/current indices if needed
      let newDealer = state.dealer_index;
      if (newDealer >= updatedPlayers.length) newDealer = 0;
      let newCurrent = state.current_player_index;
      if (newCurrent >= updatedPlayers.length) newCurrent = 0;
      
      return { 
        players: updatedPlayers,
        dealer_index: newDealer,
        current_player_index: newCurrent
      };
    });
  },

  addPlayer: (player) => {
    get().saveState();
    set((state) => ({
      players: [...state.players, player]
    }));
  },

  toggleSitOut: (index) => {
    get().saveState();
    set((state) => {
      const updatedPlayers = [...state.players];
      if (updatedPlayers[index]) {
        const currentStatus = updatedPlayers[index].status;
        updatedPlayers[index] = { 
          ...updatedPlayers[index], 
          status: currentStatus === 'sitting-out' ? 'active' : 'sitting-out' 
        };
      }
      return { players: updatedPlayers };
    });
  },

  reorderPlayers: (fromIndex, toIndex) => {
    get().saveState();
    set((state) => {
      const updatedPlayers = [...state.players];
      const [removed] = updatedPlayers.splice(fromIndex, 1);
      updatedPlayers.splice(toIndex, 0, removed);
      return { players: updatedPlayers };
    });
  },

  rotateDealer: (direction) => {
    get().saveState();
    set((state) => {
      const offset = direction === 'cw' ? 1 : -1;
      let newDealer = (state.dealer_index + offset + state.players.length) % state.players.length;
      return { dealer_index: newDealer };
    });
  },

  // Phase 5: Mode transition actions
  setViewMode: (mode) => set({ viewMode: mode }),

  setTransitioning: (isTransitioning) => set({ isTransitioning: isTransitioning }),
}));
