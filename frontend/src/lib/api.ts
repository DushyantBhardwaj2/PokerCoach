export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface Action {
  player_index: number;
  action_type: ActionType;
  amount: number;
}

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'sitting-out';

export interface Player {
  id?: string;
  name: string;
  stack: number;
  hole_cards: Card[];
  current_bet: number;
  total_contributed: number;
  is_folded: boolean;
  is_all_in: boolean;
  status: PlayerStatus;
  has_acted: boolean;
  vpip_this_hand?: boolean;
  pfr_this_hand?: boolean;
  vpip?: number;
  pfr?: number;
  bet?: number; // Added for compatibility with usePokerStore
}

export interface Pot {
  amount: number;
  eligible_player_indices: number[];
}

export type GameRound = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameState {
  players: Player[];
  community_cards: Card[];
  pots: Pot[];
  pot: number;
  current_bet: number;
  last_raise_amount: number;
  current_player_index: number;
  dealer_index: number;
  round: GameRound;
  small_blind: number;
  big_blind: number;
  sessionId?: string | null;  // Optional session ID for analytics
}

export interface ActionRecord {
  player_name: string;
  action_type: ActionType;
  amount: number;
  street: GameRound;
}

export interface WinAnalysis {
  win_probability: number;
  tie_probability: number;
  equity: number;
}

// RAG internals (hybrid/vector/bm25 scores) are deliberately NOT surfaced to the
// client — only the natural book + chapter citation is shown (conv.md Q80).
export interface RetrievedKnowledge {
  chunk_id: string;
  book_title: string;
  author: string;
  chapter: string;
  snippet: string;
}

// One natural coaching paragraph + the supporting hand math (no RAG internals,
// no bluff modelling). `coach_paragraph` is Gemini's prose or a grounded fallback.
export interface CoachAdvice {
  action: ActionType;
  bet_sizing: number | null;
  confidence: 'High' | 'Medium' | 'Low';
  coach_paragraph: string;
  win_probability: number;
  pot_odds: number;        // required pot odds as a fraction (0-1)
  required_equity: number; // break-even equity as a fraction (0-1)
  ev: number;
}

export interface OpponentProfile {
  total_hands: number;
  hands_played: number;  // Required for cold start check
  vpip: number;
  pfr: number;
  aggression: number;
  cbet_success_rate: number;
  three_bet_rate: number;
  wtsd: number;
  archetype: string;
  reliability: 'Low' | 'Medium' | 'High';
  notes: string;
  last_seen: string | null;
}

export interface OpponentProfileDetail extends OpponentProfile {
  cbet_rate: number;
  three_bet_rate: number;
  fold_to_river: number;
  session_vpip: number;
  is_shifting: boolean;
  shift_direction: 'more_passive' | 'more_aggressive' | 'stable';
}

export interface RecentOpponent {
  player_name: string;
  archetype: string;
  last_seen: string | null;
  hands_played: number;
}

export interface FullAnalysisResponse {
  win_analysis: WinAnalysis;
  advice: CoachAdvice;
  opponent_profile: OpponentProfile;
  retrieved_knowledge: RetrievedKnowledge[];
  timing_ms?: number;
  hands_played?: number;  // For cold start check
}

// Unified API URL Configuration
const getBaseUrl = () => {
  // 1. PUBLIC_API_URL is the primary source for both SSR and Client-side
  const envUrl = (import.meta as any).env?.PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // 2. Browser-aware fallback
  if (typeof window !== 'undefined') {
    // We prefer relative paths in the browser to leverage Vite proxy and avoid CORS
    return '/api/v1';
  }

  // 3. SSR fallback
  return 'http://localhost:8000/api/v1';
};

const API_URL = getBaseUrl();

// --- Auth (3 preset demo logins, X-User-Id header) ---

const USER_ID_KEY = 'poker_coach_user_id';
const USER_NAME_KEY = 'poker_coach_display_name';

export interface DemoUser {
  username: string;
  display_name: string;
}

export interface LoginResult {
  user_id: number;
  username: string;
  display_name: string;
}

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function getStoredDisplayName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_NAME_KEY);
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}

export async function listDemoUsers(): Promise<DemoUser[]> {
  const res = await fetch(`${API_URL}/auth/users`, { method: 'GET' });
  return handleResponse(res);
}

export async function login(username: string): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  const result: LoginResult = await handleResponse(res);
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, String(result.user_id));
    localStorage.setItem(USER_NAME_KEY, result.display_name);
  }
  return result;
}

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const userId = getStoredUserId();
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  return headers;
};

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API Error: ${res.status}`);
  }
  return res.json();
}

// --- Stateless API (Functional) ---

export async function startGame(
  playerNames: string[],
  initialStacks: number[],
  smallBlind: number,
  bigBlind: number,
  dealerIndex: number = 0,
  sbIndex: number = -1,
  bbIndex: number = -1
): Promise<GameState> {
  const res = await fetch(`${API_URL}/game/start`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      player_names: playerNames,
      initial_stacks: initialStacks,
      small_blind: smallBlind,
      big_blind: bigBlind,
      dealer_index: dealerIndex,
      sb_index: sbIndex,
      bb_index: bbIndex
    }),
  });
  return handleResponse(res);
}

export async function processAction(state: GameState, action: Action): Promise<GameState> {
  const res = await fetch(`${API_URL}/game/action`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ state, action }),
  });
  return handleResponse(res);
}

export async function showdown(state: GameState): Promise<{ new_state: GameState; result: any }> {
  const res = await fetch(`${API_URL}/game/showdown`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ state }),
  });
  return handleResponse(res);
}

export async function analyzeFull(
  state: GameState,
  history: ActionRecord[],
  opponentName: string,
  holeCards: Card[],
  numSimulations = 500
): Promise<FullAnalysisResponse> {
  const res = await fetch(`${API_URL}/ai/analyze-full`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      state,
      history,
      opponent_name: opponentName,
      hole_cards: holeCards,
      num_simulations: numSimulations,
    }),
  });
  return handleResponse(res);
}

export async function getWinProbability(
  holeCards: Card[],
  communityCards: Card[],
  numOpponents: number,
  numSimulations = 500
): Promise<WinAnalysis> {
  const res = await fetch(`${API_URL}/ai/win-probability`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      hole_cards: holeCards,
      community_cards: communityCards,
      num_opponents: numOpponents,
      num_simulations: numSimulations,
    }),
  });
  return handleResponse(res);
}

export async function getAllStats(): Promise<Record<string, OpponentProfile>> {
  // Trailing slash is deliberate: the router registers this as @router.get("/"),
  // so requesting /stats earns a 307 to /stats/ and pays for a second preflight.
  const res = await fetch(`${API_URL}/stats/`, {
    method: 'GET',
    headers: await getHeaders(),
  });
  return handleResponse(res);
}

export async function getRecentOpponents(limit = 10): Promise<RecentOpponent[]> {
  const res = await fetch(`${API_URL}/stats/recent?limit=${limit}`, {
    method: 'GET',
    headers: await getHeaders(),
  });
  return handleResponse(res);
}

export async function getOpponentProfile(playerName: string): Promise<OpponentProfileDetail> {
  const res = await fetch(`${API_URL}/stats/player/${encodeURIComponent(playerName)}`, {
    method: 'GET',
    headers: await getHeaders(),
  });
  return handleResponse(res);
}

export async function updateOpponentNotes(playerName: string, notes: string): Promise<void> {
  const res = await fetch(`${API_URL}/stats/notes`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ player_name: playerName, notes }),
  });
  return handleResponse(res);
}

export interface UpdateStatsRequest {
  player_name: string;
  vpip_this_hand: boolean;
  pfr_this_hand: boolean;
  made_cbet?: boolean;
  cbet_succeeded?: boolean;
  made_three_bet?: boolean;
  three_bet_succeeded?: boolean;
  fold_to_river?: boolean;
  called_showdown?: boolean;
  won_showdown?: boolean;
  bet_amount?: number;
  call_amount?: number;
}

export async function updatePlayerStats(request: UpdateStatsRequest): Promise<{ status: string; hands_played: number }> {
  const res = await fetch(`${API_URL}/stats/update_stats`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse(res);
}

export async function resetSessionStats(): Promise<{ status: string }> {
  const res = await fetch(`${API_URL}/stats/reset_session`, {
    method: 'POST',
    headers: await getHeaders(),
  });
  return handleResponse(res);
}

// --- Session Analytics & Post-Game Review ---

export interface HandHistory {
  hand_id: string;
  street: GameRound;
  pot_size: number;
  your_cards: Card[];
  community_cards: Card[];
  result?: 'win' | 'loss' | 'tie';
  amount_won?: number;
  action_count: number;
  duration_seconds: number;
  tactical_data?: any;
  leak_detected?: boolean;
  leak_description?: string;
  timestamp: string;
}

export interface SessionSummary {
  session_id: string;
  start_time: string;
  end_time: string | null;
  total_hands: number;
  hands_played: number;
  vpip_hands: number;
  pfr_hands: number;
  total_winnings: number;
  biggest_pot: number;
  biggest_loss: number;
  showdown_wins: number;
  showdown_losses: number;
  folds: number;
  avg_position: number;
}

export interface SessionAnalytics {
  summary: SessionSummary;
  recent_hands: HandHistory[];
  vpip_percentage: number;
  pfr_percentage: number;
  win_rate: number;
  showdown_rate: number;
  avg_hand_duration: number;
  most_played_opponent: string | null;
}

export async function getAllHandHistory(limit = 50): Promise<HandHistory[]> {
  const res = await fetch(`${API_URL}/stats/history?limit=${limit}`, {
    method: 'GET',
    headers: await getHeaders(),
  });
  return handleResponse(res);
}

export async function getSessionAnalytics(sessionId?: string): Promise<SessionAnalytics> {
  if (sessionId === '') {
    throw new Error("Invalid session ID: Cannot be an empty string");
  }
  const url = sessionId
    ? `${API_URL}/stats/session/${sessionId}/analytics`
    : `${API_URL}/stats/session/latest/analytics`;

  const res = await fetch(url, {
    method: 'GET',
    headers: await getHeaders(),
  });
  return handleResponse(res);
}

export async function recordHandResult(request: {
  hand_id?: string;
  session_id?: string;
  result: 'win' | 'loss' | 'tie';
  amount_won: number;
  street: GameRound;
  action_count?: number;
  duration_seconds?: number;
  pot_size: number;
  your_cards?: Card[];
  community_cards?: Card[];
  tactical_data?: any;
}): Promise<{ status: string; hand_id: string }> {
  const res = await fetch(`${API_URL}/stats/hand_result`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse(res);
}

