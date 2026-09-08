import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  startGame,
  processAction,
  showdown,
  analyzeFull,
  getAllStats,
  updatePlayerStats,
  resetSessionStats,
  recordHandResult,
  type GameState,
  type ActionType,
  type Card,
  type FullAnalysisResponse,
} from '../lib/api';
import { usePokerStore } from '../stores/usePokerStore';
import { SetupView } from './SetupView';
import { CardInputView } from './CardInputView';
import { CommunityCardsInput } from './CommunityCardsInput';
import { ActionTracker } from './ActionTracker';
import { AIDashboard } from './AIDashboard';
import { ShowdownLogicView } from './ShowdownLogicView';
import { HandSetupView } from './HandSetupView';
import { ShowdownLoadingView } from './ShowdownLoadingView';
import { ShowdownResultScreen } from './ShowdownResultScreen';

type GameView = 'setup' | 'cards' | 'tracker' | 'hand-setup' | 'evaluating-hand' | 'showdown-result';

export default function PokerTable() {
  const store = usePokerStore();
  const [gameView, setGameView] = useState<GameView>('setup');
  const [theoryMode, setTheoryMode] = useState(true);
  const [playerStats, setPlayerStats] = useState<Record<string, any>>({});
  
  // Setup State
  const [playerNames, setPlayerNames] = useState<string[]>(['You', 'Player 2', 'Player 3']);
  const [initialStack, setInitialStack] = useState(1000);
  const [bigBlind, setBigBlind] = useState(20);

  // Hand Setup State
  const [handSetupPlayers, setHandSetupPlayers] = useState<{name: string, stack: number}[]>([]);
  const [manualDealer, setManualDealer] = useState(0);
  const [manualSB, setManualSB] = useState(1);
  const [manualBB, setManualBB] = useState(2);

  // Card Selection State
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [pickingFor, setPickingFor] = useState<'hole' | 'community'>('hole');

  // AI State
  const [fullAnalysis, setFullAnalysis] = useState<FullAnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Showdown State
  const [showdownResult, setShowdownResult] = useState<any>(null);
  const [pickingWinner, setPickingWinner] = useState(false);

  useEffect(() => {
    // Initial sync
    const savedMode = localStorage.getItem('poker_theory_mode');
    if (savedMode !== null) {
      setTheoryMode(savedMode === 'true');
    }

    // Listen for changes from Sidebar
    const handleTheoryChange = (e: any) => {
      setTheoryMode(e.detail.theoryMode);
    };
    window.addEventListener('poker_theory_mode_change', handleTheoryChange as EventListener);
    return () => window.removeEventListener('poker_theory_mode_change', handleTheoryChange as EventListener);
  }, []);

  // Fetch opponent stats - filtered to current session players only
  const fetchStats = async () => {
    try {
      const allStats = await getAllStats();

      // Get current session player names (from Session Tracker)
      const sessionPlayerNames = playerNames.map(n => n.trim().toLowerCase());

      console.log('[PokerTable] fetchStats → session players:', sessionPlayerNames);
      console.log('[PokerTable] fetchStats → available stats:', Object.keys(allStats));

      // Filter stats to ONLY show players in current session
      const filteredStats: Record<string, any> = {};
      for (const [name, data] of Object.entries(allStats)) {
        if (sessionPlayerNames.includes(name.toLowerCase())) {
          filteredStats[name] = data;
        }
      }

      console.log('[PokerTable] fetchStats → filtered to session:', Object.keys(filteredStats));
      setPlayerStats(filteredStats);
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  };

  useEffect(() => { 
    fetchStats(); 
  }, []);

  // Reset AI when turn/round changes
  useEffect(() => {
    setFullAnalysis(null);
  }, [store.current_player_index, store.round]);

  // Auto-prompt community cards when round advances
  useEffect(() => {
    const round = store.round;
    const cardsCount = store.community_cards.length;

    if (round === 'flop' && cardsCount < 3) {
      setPickingFor('community');
      setSelectedCards(store.community_cards);
      setGameView('cards');
    } else if (round === 'turn' && cardsCount < 4) {
      setPickingFor('community');
      setSelectedCards(store.community_cards);
      setGameView('cards');
    } else if (round === 'river' && cardsCount < 5) {
      setPickingFor('community');
      setSelectedCards(store.community_cards);
      setGameView('cards');
    }
  }, [store.round]);

  // Auto-run AI on User's Turn
  useEffect(() => {
    if (gameView === 'tracker' && store.players.length > 0 && store.current_player_index === 0 && !aiLoading) {
      if (!fullAnalysis) {
        askAi();
      }
    }
  }, [store.current_player_index, store.round, gameView]);

  const initGame = async (isNextHand = false) => {
    store.setProcessing(true);
    store.setError(null);
    setShowdownResult(null);

    // Reset session stats for baseline comparison on new session
    if (!isNextHand && !store.sessionId) {
      try {
        await resetSessionStats();
      } catch (e) {
        console.log("Session reset skipped (expected if not authenticated)");
      }
    }

    try {
      // Session Tracker players = single source of truth
      const names = playerNames.map(n => n.trim() || 'Unknown');
      const stacks = Array.from({ length: names.length }, () => initialStack);

      console.log('[PokerTable] initGame → players from Session Tracker:', names);
      console.log('[PokerTable] initGame → stacks:', stacks);

      const state = await startGame(names, stacks, bigBlind / 2, bigBlind, 0);

      console.log('[PokerTable] initGame → game state received:', state.players?.map(p => p.name));

      // Store is the single source of truth for game state
      store.setSession(state.sessionId || 'local');
      store.setPlayers(state.players);
      store.updateBoardCards(state.community_cards);
      store.advanceStreet(state.round);

      usePokerStore.setState({
        pot: state.pot,
        current_bet: state.current_bet,
        last_raise_amount: state.last_raise_amount,
        current_player_index: state.current_player_index,
        dealer_index: state.dealer_index,
        small_blind: state.small_blind,
        big_blind: state.big_blind,
        round: state.round,
        community_cards: state.community_cards,
        pots: state.pots,
        actionHistory: []
      });

      // Initialize hand setup from Session Tracker players
      const setupPlayers = names.map((name) => ({ name, stack: initialStack }));
      setHandSetupPlayers(setupPlayers);

      // Set default roles
      const num = names.length;
      setManualDealer(0);
      setManualSB(num > 1 ? 1 : 0);
      setManualBB(num > 2 ? 2 : (num > 1 ? 1 : 0));

      // Go to card input
      setPickingFor('hole');
      setSelectedCards([]);
      setGameView('cards');

      // Fetch ALL opponent stats INCLUDING newly added players
      setTimeout(() => {
        console.log('[PokerTable] Fetching opponent stats after session start');
        fetchStats();
      }, 500);
    } catch (err: any) {
      store.setError(err.message || "Failed to start session.");
    } finally {
      store.setProcessing(false);
    }
  };

  const confirmHandSetup = async () => {
    store.setProcessing(true);
    store.setError(null);
    try {
      const names = handSetupPlayers.map(p => p.name);
      const stacks = handSetupPlayers.map(p => p.stack);

      console.log('[PokerTable] confirmHandSetup → players:', names, 'handSetupPlayers:', handSetupPlayers);

      // Fetch ALL opponent stats BEFORE starting new hand
      setTimeout(() => fetchStats(), 300);

      const state = await startGame(
        names, 
        stacks, 
        bigBlind / 2, 
        bigBlind, 
        manualDealer,
        manualSB,
        manualBB
      );
      
      // Sync store
      usePokerStore.setState({
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
        actionHistory: []
      });

      setPickingFor('hole');
      setSelectedCards([]);
      setGameView('cards');

      // Fetch opponent stats for ALL players
      setTimeout(() => fetchStats(), 500);
    } catch (err: any) {
      store.setError(err.message || "Failed to start hand.");
    } finally {
      store.setProcessing(false);
    }
  };

  const handleSwapPlayers = (idx1: number, idx2: number) => {
    const newPlayers = [...handSetupPlayers];
    [newPlayers[idx1], newPlayers[idx2]] = [newPlayers[idx2], newPlayers[idx1]];
    setHandSetupPlayers(newPlayers);
    
    if (manualDealer === idx1) setManualDealer(idx2);
    else if (manualDealer === idx2) setManualDealer(idx1);
    
    if (manualSB === idx1) setManualSB(idx2);
    else if (manualSB === idx2) setManualSB(idx1);
    
    if (manualBB === idx1) setManualBB(idx2);
    else if (manualBB === idx2) setManualBB(idx1);
  };

  const handleCardSelect = (card: Card) => {
    if (selectedCards.some(c => c.rank === card.rank && c.suit === card.suit)) {
      setSelectedCards(selectedCards.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
      return;
    }

    if (pickingFor === 'hole' && selectedCards.length < 2) {
      setSelectedCards([...selectedCards, card]);
    } else if (pickingFor === 'community') {
      const round = store.round;
      let maxAllowed = 0;
      
      if (round === 'flop') maxAllowed = 3;
      else if (round === 'turn') maxAllowed = 4;
      else if (round === 'river') maxAllowed = 5;

      if (selectedCards.length < maxAllowed) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const confirmCards = () => {
    if (pickingFor === 'hole') {
      if (selectedCards.length !== 2) return;
      const updatedPlayers = [...store.players];
      updatedPlayers[0].hole_cards = selectedCards;
      store.setPlayers(updatedPlayers);
      setSelectedCards([]);
      setGameView('tracker');
    } else {
      const round = store.round;
      const count = selectedCards.length;
      
      if (round === 'flop' && count !== 3) return;
      if (round === 'turn' && count !== 4) return;
      if (round === 'river' && count !== 5) return;

      store.updateBoardCards(selectedCards);
      setGameView('tracker');
    }
  };

  const handleAction = async (type: ActionType, amount: number = 0) => {
    store.setProcessing(true);
    store.setError(null);
    try {
      const actingPlayer = store.players[store.current_player_index];

      // Snapshot pre-action state for the API call (optimistic update below must not corrupt the request)
      const preActionPlayers = store.players.map(p => ({ ...p }));
      const preActionState = {
        players: preActionPlayers,
        community_cards: store.community_cards,
        pots: store.pots,
        pot: store.pot,
        current_bet: store.current_bet,
        last_raise_amount: store.last_raise_amount,
        current_player_index: store.current_player_index,
        dealer_index: store.dealer_index,
        round: store.round,
        small_blind: store.small_blind,
        big_blind: store.big_blind
      };

      // Optimistic update (immediate UI feedback)
      store.updatePlayerAction(actingPlayer.name, type, amount);

      const newState = await processAction(preActionState, {
        player_index: store.current_player_index,
        action_type: type,
        amount
      });

      // Record this action in history (used to pick the relevant opponent for coaching)
      const actualAmount = type === 'call'
        ? Math.max(0, store.current_bet - actingPlayer.current_bet)
        : type === 'all-in'
          ? actingPlayer.stack
          : amount;
      store.recordAction({
        player_name: actingPlayer.name,
        action_type: type,
        amount: actualAmount,
        street: store.round
      });
      
      // Sync store with actual server state
      usePokerStore.setState({
        players: newState.players,
        community_cards: newState.community_cards,
        pots: newState.pots,
        pot: newState.pot,
        current_bet: newState.current_bet,
        last_raise_amount: newState.last_raise_amount,
        current_player_index: newState.current_player_index,
        dealer_index: newState.dealer_index,
        round: newState.round,
        small_blind: newState.small_blind,
        big_blind: newState.big_blind
      });
      
      const activePlayers = newState.players.filter(p => p.status !== 'folded');
      if (newState.round === 'showdown') {
        if (activePlayers.length === 1) {
          handleShowdown([]);
        } else {
          setPickingWinner(true);
        }
      }
    } catch (err: any) {
      console.error("Action failed:", err);
      store.setError(err.message || "Action rejected. Rolling back state.");
      store.undoAction(); // Rollback to match database reality
    } finally {
      store.setProcessing(false);
    }
  };

  const handleShowdown = async (playerHands: { playerIndex: number; cards: Card[] }[], muckedIndices: number[] = []) => {
    store.setProcessing(true);
    setGameView('evaluating-hand');
    try {
      const stateWithReveals = {
        players: store.players.map((p, i) => {
            if (muckedIndices.includes(i)) {
              // A mucked player concedes the pot: fold them so they cannot
              // win by "playing the board" with empty hole cards.
              return { ...p, is_folded: true, status: 'folded' as const, hole_cards: [] as Card[] };
            }
            const ph = playerHands.find(h => h.playerIndex === i);
            return ph ? { ...p, hole_cards: ph.cards } : p;
        }),
        community_cards: store.community_cards,
        pots: store.pots,
        pot: store.pot,
        current_bet: store.current_bet,
        last_raise_amount: store.last_raise_amount,
        current_player_index: store.current_player_index,
        dealer_index: store.dealer_index,
        round: store.round,
        small_blind: store.small_blind,
        big_blind: store.big_blind
      };

      const res = await showdown(stateWithReveals);

      // Backend contract: { winners: string[], payouts: {name: amount},
      // pots_summary: [{amount, winner}], hand_rankings: {name: rank} }
      const result = (res as any).result;
      const winnersMap = new Map<string, number>();
      if (Array.isArray(result?.winners) && result?.payouts) {
        (result.winners as string[]).forEach((name: string) => {
          winnersMap.set(name, result.payouts[name] ?? 0);
        });
      }

      const mappedWinners = Array.from(winnersMap.entries()).map(([name, amount]) => ({ name, amount }));

      const manualResult = {
        winners: mappedWinners,
        pots_results: (Array.isArray(result?.pots_summary) ? result.pots_summary : []).map(
          (ps: any) => ({ amount: ps.amount, winners: [ps.winner] })
        ),
      };

      // Record hand result for session analytics
      try {
        const userName = playerNames[0];
        const userWin = mappedWinners.find(w => w.name === userName);
        const userContributed = store.players[0].total_contributed || 0;
        const netWinnings = (userWin ? userWin.amount : 0) - userContributed;
        
        let outcome: 'win' | 'loss' | 'tie' = 'loss';
        if (userWin) {
          outcome = netWinnings > 0 ? 'win' : (netWinnings === 0 ? 'tie' : 'loss');
        }

        await recordHandResult({
          session_id: store.sessionId && store.sessionId !== 'local' ? store.sessionId : undefined,
          result: outcome,
          amount_won: netWinnings,
          street: store.round,
          pot_size: store.pot,
          your_cards: store.players[0].hole_cards,
          community_cards: store.community_cards,
          action_count: 0, 
          duration_seconds: 0,
          tactical_data: fullAnalysis?.advice ? {
            verdict: fullAnalysis.advice.action,
            win_probability: fullAnalysis.advice.win_probability,
            pot_odds: fullAnalysis.advice.pot_odds,
            ev: fullAnalysis.advice.ev,
            confidence: fullAnalysis.advice.confidence,
          } : undefined
        });
      } catch (analyticsErr) {
        console.error("Failed to record hand analytics:", analyticsErr);
      }

      // Update opponent stats
      try {
        for (const player of store.players) {
          if (player.name === "You") continue;
          await updatePlayerStats({
            player_name: player.name,
            vpip_this_hand: player.vpip_this_hand || false,
            pfr_this_hand: player.pfr_this_hand || false,
            called_showdown: player.hole_cards.length === 2 && player.status !== 'folded',
            won_showdown: mappedWinners.some(w => w.name === player.name),
            bet_amount: player.total_contributed || 0,
            call_amount: player.current_bet || 0
          });
        }
      } catch (statsErr) {
        console.error("Failed to update player stats:", statsErr);
      }

      setShowdownResult(manualResult);
      
      // Sync store with new state
      usePokerStore.setState({
        players: res.new_state.players,
        community_cards: res.new_state.community_cards,
        pots: res.new_state.pots,
        pot: res.new_state.pot,
        current_bet: res.new_state.current_bet,
        last_raise_amount: res.new_state.last_raise_amount,
        current_player_index: res.new_state.current_player_index,
        dealer_index: res.new_state.dealer_index,
        round: res.new_state.round,
        small_blind: res.new_state.small_blind,
        big_blind: res.new_state.big_blind
      });

      setPickingWinner(false);
      setGameView('showdown-result');
      fetchStats();
    } catch (err: any) {
      store.setError("Failed to finalize hand: " + err.message);
    } finally {
      store.setProcessing(false);
    }
  };

  const askAi = async () => {
    if (store.players.length === 0) return;
    const me = store.players[0];
    if (me.hole_cards.length !== 2) return;

    setAiLoading(true);
    store.setError(null);
    try {
      // Pick the opponent: last aggressive opponent in history, fallback to first non-hero
      const opponentName = (() => {
        const heroName = store.players[0]?.name;
        const reversed = [...store.actionHistory].reverse();
        const aggressiveLast = reversed.find(a =>
          a.player_name !== heroName && (a.action_type === 'raise' || a.action_type === 'all-in')
        );
        if (aggressiveLast) return aggressiveLast.player_name;
        const callLast = reversed.find(a =>
          a.player_name !== heroName && a.action_type === 'call'
        );
        if (callLast) return callLast.player_name;
        return store.players.length > 1 ? store.players[1].name : "Unknown";
      })();

      const analysis = await analyzeFull(
        {
            players: store.players,
            community_cards: store.community_cards,
            pots: store.pots,
            pot: store.pot,
            current_bet: store.current_bet,
            last_raise_amount: store.last_raise_amount,
            current_player_index: store.current_player_index,
            dealer_index: store.dealer_index,
            round: store.round,
            small_blind: store.small_blind,
            big_blind: store.big_blind
        },
        store.actionHistory,
        opponentName,
        me.hole_cards,
        1000
      );
      
      setFullAnalysis(analysis);
    } catch (err: any) {
      store.setError("AI Engine Error: " + (err.message || "Processing failure"));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in flex flex-col items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {store.error && (
        <div className="max-w-md w-full mb-8 glass-dark border border-red-500/20 text-red-400 p-5 rounded-2xl flex items-start gap-4 animate-slide-up relative z-[100] shadow-lg shadow-red-500/10">
          <AlertCircle size={24} className="mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-red-500/80">System Alert</h4>
            <p className="text-sm font-medium leading-relaxed">{store.error}</p>
            <button 
              onClick={() => store.setError(null)} 
              className="mt-3 text-[10px] font-black uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/20 transition-all active:scale-95"
            >
              Dismiss Alert
            </button>
          </div>
        </div>
      )}

      {pickingWinner && store.players.length > 0 ? (
        <div className="flex justify-center w-full">
          <ShowdownLogicView gameState={store as unknown as GameState} onFinalize={handleShowdown} />
        </div>
      ) : (
        <>
          {gameView === 'setup' && (
            <SetupView 
              playerNames={playerNames} setPlayerNames={setPlayerNames}
              initialStack={initialStack} setInitialStack={setInitialStack}
              bigBlind={bigBlind} setBigBlind={setBigBlind}
              loading={store.isProcessing} onStart={initGame}
            />
          )}

          {gameView === 'hand-setup' && (
            <HandSetupView 
              players={handSetupPlayers}
              dealerIndex={manualDealer}
              smallBlindIndex={manualSB}
              bigBlindIndex={manualBB}
              onUpdateDealer={setManualDealer}
              onUpdateSB={setManualSB}
              onUpdateBB={setManualBB}
              onSwapPlayers={handleSwapPlayers}
              onConfirm={confirmHandSetup}
              onCancel={() => setGameView('tracker')}
            />
          )}

          {gameView === 'cards' && (
            pickingFor === 'community' ? (
              <CommunityCardsInput 
                round={store.round}
                existingCards={store.community_cards}
                holeCards={store.players[0]?.hole_cards || []}
                onConfirm={(cards) => {
                  store.updateBoardCards(cards);
                  setGameView('tracker');
                }}
              />
            ) : (
              <CardInputView 
                pickingFor={pickingFor} selectedCards={selectedCards}
                onCardSelect={handleCardSelect} onConfirm={confirmCards}
                onReset={() => setSelectedCards([])} round={store.round}
                takenCards={store.community_cards}
              />
            )
          )}

          {(gameView === 'tracker' || gameView === 'evaluating-hand' || gameView === 'showdown-result') && store.players.length > 0 && (
            <div className="w-full flex flex-col xl:flex-row gap-4">
              {/* Left Sidebar - AI Advisor */}
              <div className="xl:w-72 flex-shrink-0 order-2 xl:order-1">
                <AIDashboard
                  fullAnalysis={fullAnalysis} loading={aiLoading}
                  onRunAnalysis={askAi}
                  showdownResult={showdownResult} playerStats={playerStats}
                  onNewHand={initGame} theoryMode={theoryMode}
                  userName={playerNames[0]}
                  isPlayerTurn={store.current_player_index === 0}
                  hasCards={store.players[0]?.hole_cards.length === 2}
                />
              </div>
              {/* Center - Table + Action Bar */}
              <div className="flex-1 order-1 xl:order-2 flex flex-col">
                {gameView === 'evaluating-hand' && <ShowdownLoadingView />}
                {gameView === 'showdown-result' && (
                  <ShowdownResultScreen 
                    showdownResult={showdownResult}
                    players={store.players}
                    communityCards={store.community_cards}
                    onNextHand={() => {
                      setShowdownResult(null);
                      setGameView('hand-setup');
                    }}
                  />
                )}
                {gameView === 'tracker' && (
                  <ActionTracker
                  gameState={store as unknown as GameState}
                  onAction={handleAction}
                  onRefillStack={store.updatePlayerStack}
                  onOpenCardInput={() => {
                    setPickingFor('community');
                    setSelectedCards(store.community_cards);
                    setGameView('cards');
                  }}
                  onUpdatePlayerStatus={store.toggleSitOut}
                  onRemovePlayer={store.removePlayer}
                  onUpdateStack={store.updatePlayerStack}
                  onReorderPlayers={store.reorderPlayers}
                  onRotateDealer={store.rotateDealer}
                  onUndo={store.undoAction}
                  hasUndo={store.undoStack.length > 0}
                />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
