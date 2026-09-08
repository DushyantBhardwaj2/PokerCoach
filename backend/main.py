"""FastAPI backend application for Poker Coach & PokerSense AI.

Built per conv.md:
- Pure Python Texas Hold'em game engine
- 70/30 Hybrid RAG Retriever (ChromaDB + BM25 across canonical poker books)
- One natural coaching paragraph synthesized by Gemini, grounded in the hand
  math and the retrieved book+chapter citations (deterministic fallback offline)
- Zero external legacy ML models

The RAG core (config, ingestion, hybrid retriever) lives in `src/` and is
shared with the CLI pipeline. This module is purely the API layer.
"""

import sys
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from src.config import settings, DEMO_USERS
from src.retriever import HybridRetriever, SearchResult
from backend.poker.models import (
    Card,
    GameStreet,
    OpponentProfile as RagOpponent,
    AdviceRequest,
    AdviceResponse,
    RetrievedBookKnowledge,
)
from backend.poker.equity import simulate_equity, calculate_math
from backend.poker.profiling import classify_archetype
from backend.poker.game import (
    PokerEngine,
    GameStateModel,
    ActionRequest,
    PlayerState,
)
from backend.db.session import init_db, get_db
from backend.db.models import User
from backend.db.stats_repo import StatsRepo
from backend.db.seed import seed_demo_data
from backend.rag.coach import get_coach_advice

# Windows console UTF-8 configuration
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

app = FastAPI(
    title="Poker Coach RAG API",
    version="2.0.0",
    description="Live poker coach built from scratch using 70/30 ChromaDB + BM25 hybrid retrieval and Gemini prompt synthesis.",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy-load Hybrid Retriever singleton
_retriever = None


def get_retriever() -> HybridRetriever:
    global _retriever
    if _retriever is None:
        _retriever = HybridRetriever()
    return _retriever


@app.on_event("startup")
def on_startup():
    """Creates the schema and seeds the three demo users (idempotent)."""
    init_db()
    seed_demo_data()


# --- Auth: 3 preset demo logins, X-User-Id header scoping (no JWT) ---

def current_user(
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> User:
    """Resolves the acting user from the X-User-Id header. 401 on unknown ids."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header")
    try:
        uid = int(x_user_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid X-User-Id header")
    user = db.get(User, uid)
    if user is None:
        raise HTTPException(status_code=401, detail="Unknown user")
    return user


def to_book_knowledge(res: SearchResult) -> RetrievedBookKnowledge:
    """Maps the shared SearchResult model to the API response model."""
    return RetrievedBookKnowledge(
        chunk_id=res.chunk_id,
        book_title=res.book_title,
        author=res.author,
        chapter=res.chapter,
        hybrid_score=res.hybrid_score,
        vector_score=res.vector_score,
        bm25_score=res.bm25_score,
        snippet=res.text.strip(),
    )


# --- Health Endpoints ---

@app.get("/health")
@app.get("/api/health")
def health_check():
    """Returns system status and knowledge base statistics."""
    try:
        ret = get_retriever()
        count = ret.collection.count()
        has_bm25 = ret.bm25_data is not None
    except Exception:
        count = 0
        has_bm25 = False
    return {
        "status": "online",
        "chromadb_chunks": count,
        "bm25_indexed": has_bm25,
        "embedding_provider": settings.embedding_provider,
        "gemini_configured": bool(settings.gemini_api_key),
        "weights": {
            "vector": settings.vector_weight,
            "bm25": settings.bm25_weight,
        },
    }


@app.get("/api/v1/version")
def version_check():
    return {"version": "2.0.0", "engine": "RAG 70/30 Hybrid Coach (conv.md)"}


# --- Auth Endpoints (/api/v1/auth) ---

class LoginRequest(BaseModel):
    username: str


@app.get("/api/v1/auth/users")
def list_demo_users():
    """Public list of the selectable demo logins (for the login screen)."""
    return [{"username": u.username, "display_name": u.display_name} for u in DEMO_USERS]


@app.post("/api/v1/auth/login")
def login_endpoint(req: LoginRequest, db: Session = Depends(get_db)):
    """Validates against the 3 preset demo users and returns the user id."""
    username = req.username.strip().lower()
    match = next((u for u in DEMO_USERS if u.username == username), None)
    if match is None:
        raise HTTPException(status_code=401, detail="Unknown demo user")
    user = db.query(User).filter(User.username == match.username).first()
    if user is None:
        # Startup seeding should have created it; create defensively otherwise.
        user = User(username=match.username, display_name=match.display_name)
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"user_id": user.id, "username": user.username, "display_name": user.display_name}


@app.get("/api/v1/auth/me")
def me_endpoint(user: User = Depends(current_user)):
    return {"user_id": user.id, "username": user.username, "display_name": user.display_name}


# --- Game Engine Endpoints (/api/v1/game) ---

class StartGameRequest(BaseModel):
    player_names: List[str]
    initial_stacks: List[float]
    small_blind: float = 10.0
    big_blind: float = 20.0
    dealer_index: int = 0
    sb_index: int = -1
    bb_index: int = -1


@app.post("/api/v1/game/start")
def start_game_endpoint(req: StartGameRequest):
    try:
        state = PokerEngine.start_game(
            player_names=req.player_names,
            initial_stacks=req.initial_stacks,
            small_blind=req.small_blind,
            big_blind=req.big_blind,
            dealer_index=req.dealer_index,
            sb_index=req.sb_index,
            bb_index=req.bb_index,
        )
        return state
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class ProcessActionRequest(BaseModel):
    state: GameStateModel
    action: ActionRequest


@app.post("/api/v1/game/action")
def process_action_endpoint(req: ProcessActionRequest):
    try:
        updated_state = PokerEngine.process_action(req.state, req.action)
        return updated_state
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class ShowdownRequest(BaseModel):
    state: GameStateModel


@app.post("/api/v1/game/showdown")
def showdown_endpoint(req: ShowdownRequest):
    try:
        new_state, result = PokerEngine.evaluate_showdown(req.state)
        return {"new_state": new_state, "result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- AI Advisor & 70/30 RAG Endpoints (/api/v1/ai) ---

def parse_card_dict(c: Any) -> Card:
    if isinstance(c, Card):
        return c
    if isinstance(c, dict):
        return Card.from_str(f"{c.get('rank')}{c.get('suit')}")
    if isinstance(c, str):
        return Card.from_str(c)
    raise ValueError(f"Cannot parse card: {c}")


class AnalyzeFullRequest(BaseModel):
    state: GameStateModel
    history: List[Dict[str, Any]] = []
    opponent_name: str = "Player 2"
    hole_cards: List[Dict[str, str]] = []
    num_simulations: int = 1000


@app.post("/api/v1/ai/analyze-full")
def analyze_full_endpoint(
    req: AnalyzeFullRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """
    Executes the hybrid RAG coaching pipeline:
    1. Monte Carlo equity simulation (1000 rollouts)
    2. Pot odds, break-even required equity, and mathematical EV calculation
    3. Opponent profiling (VPIP/PFR archetype, pure heuristics, zero ML models)
    4. 70/30 Vector + BM25 score fusion retrieval from ChromaDB (top 5 book chunks)
    5. One natural coaching paragraph (Gemini or deterministic fallback), grounded
       in the hand math and the retrieved book+chapter citations
    """
    start_time = time.time()
    try:
        # Parse cards
        hole = [parse_card_dict(c) for c in req.hole_cards]
        if not hole and req.state.players and req.state.players[0].hole_cards:
            hole = [parse_card_dict(c) for c in req.state.players[0].hole_cards]

        board = [parse_card_dict(c) for c in req.state.community_cards]

        # Determine street
        board_len = len(board)
        if board_len == 0:
            street = GameStreet.PRE_FLOP
        elif board_len == 3:
            street = GameStreet.FLOP
        elif board_len == 4:
            street = GameStreet.TURN
        else:
            street = GameStreet.RIVER

        # Active player context
        hero = req.state.players[0] if req.state.players else PlayerState(name="You", stack=1000)
        call_amount = max(0.0, req.state.current_bet - hero.current_bet)
        pot_size = max(1.0, req.state.pot)
        num_opponents = max(1, len([p for p in req.state.players if not p.is_folded]) - 1)

        # 1. Monte Carlo Equity Simulation
        sim_res = simulate_equity(
            hole_cards=hole,
            community_cards=board,
            num_opponents=num_opponents,
            num_simulations=req.num_simulations,
        )
        win_prob = sim_res["win_probability"]

        # 2. Pot Odds & Mathematical EV
        math_res = calculate_math(
            win_probability=win_prob,
            pot_size=pot_size,
            call_amount=call_amount,
        )

        # 3. Opponent Profiling (Heuristic, zero ML models) — per user
        repo = StatsRepo(db)
        opp_stats = repo.get_or_create(user.id, req.opponent_name)
        vpip = round(opp_stats.vpip_count / max(1, opp_stats.hands_played), 2)
        pfr = round(opp_stats.pfr_count / max(1, opp_stats.hands_played), 2)
        archetype = classify_archetype(vpip, pfr)

        opp_model = RagOpponent(
            name=req.opponent_name,
            archetype=archetype,
            vpip=vpip,
            pfr=pfr,
        )

        # 4. 70/30 Hybrid Retrieval (ChromaDB + BM25)
        hole_desc = " ".join([c.display for c in hole]) if hole else "cards"
        board_desc = " ".join([c.display for c in board]) if board else "preflop"
        query_text = (
            f"{street.value} strategy holding {hole_desc} "
            f"board {board_desc} pot {pot_size} vs {archetype} sizing"
        )
        retrieved_results = get_retriever().search(query=query_text, top_k=settings.final_top_k)
        retrieved_chunks = [to_book_knowledge(r) for r in retrieved_results]

        # 5. Coach synthesis — one natural paragraph (Gemini or grounded fallback)
        coach_advice = get_coach_advice(
            hole_cards=hole,
            community_cards=board,
            street=street,
            pot_size=pot_size,
            call_amount=call_amount,
            player_stack=hero.stack,
            win_prob=win_prob,
            pot_odds_ratio=math_res["pot_odds_ratio"],
            pot_odds_pct=math_res["pot_odds_percentage"],
            required_equity=math_res["required_equity"],
            ev=math_res["expected_value"],
            opponent=opp_model,
            retrieved_chunks=retrieved_chunks,
        )

        act_lower = coach_advice.action.lower()
        if act_lower not in ["fold", "check", "call", "raise"]:
            act_lower = "call" if win_prob >= 0.4 else "fold"

        return {
            "win_analysis": {
                "win_probability": win_prob,
                "tie_probability": sim_res.get("tie_probability", 0.0),
                "equity": win_prob,
            },
            "advice": {
                "action": act_lower,
                "bet_sizing": coach_advice.bet_sizing,
                "confidence": coach_advice.confidence,
                "coach_paragraph": coach_advice.coach_paragraph,
                "win_probability": win_prob,
                "pot_odds": math_res["pot_odds_percentage"] / 100.0,
                "required_equity": math_res["required_equity"],
                "ev": math_res["expected_value"],
            },
            "opponent_profile": repo.get_profile(user.id, opp_stats.name),
            "retrieved_knowledge": [c.model_dump() for c in retrieved_chunks],
            "timing_ms": int((time.time() - start_time) * 1000),
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


class WinProbRequest(BaseModel):
    hole_cards: List[Dict[str, str]]
    community_cards: List[Dict[str, str]] = []
    num_opponents: int = 1
    num_simulations: int = 1000


@app.post("/api/v1/ai/win-probability")
def win_probability_endpoint(req: WinProbRequest):
    try:
        hole = [parse_card_dict(c) for c in req.hole_cards]
        board = [parse_card_dict(c) for c in req.community_cards]
        sim_res = simulate_equity(
            hole_cards=hole,
            community_cards=board,
            num_opponents=req.num_opponents,
            num_simulations=req.num_simulations,
        )
        return {
            "win_probability": sim_res["win_probability"],
            "tie_probability": sim_res["tie_probability"],
            "equity": sim_res["win_probability"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Opponent Stats & Analytics Endpoints (/api/v1/stats) ---

@app.get("/api/v1/stats/")
@app.get("/api/v1/stats")
def get_all_stats_endpoint(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return StatsRepo(db).get_all(user.id)


@app.get("/api/v1/stats/recent")
def get_recent_opponents_endpoint(limit: int = 10, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return StatsRepo(db).get_recent_opponents(user.id, limit=limit)


@app.get("/api/v1/stats/player/{name}")
def get_player_profile_endpoint(name: str, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return StatsRepo(db).get_profile(user.id, name)


class UpdateNotesRequest(BaseModel):
    player_name: str
    notes: str


@app.post("/api/v1/stats/notes")
def update_notes_endpoint(req: UpdateNotesRequest, user: User = Depends(current_user), db: Session = Depends(get_db)):
    StatsRepo(db).update_notes(user.id, name=req.player_name, notes=req.notes)
    return {"status": "success", "player_name": req.player_name}


class UpdateStatsRequest(BaseModel):
    player_name: str
    vpip_this_hand: bool = False
    pfr_this_hand: bool = False
    made_cbet: bool = False
    cbet_succeeded: bool = False
    made_three_bet: bool = False
    three_bet_succeeded: bool = False
    fold_to_river: bool = False
    called_showdown: bool = False
    won_showdown: Optional[bool] = None
    bet_amount: float = 0.0
    call_amount: float = 0.0


@app.post("/api/v1/stats/update_stats")
def update_stats_endpoint(req: UpdateStatsRequest, user: User = Depends(current_user), db: Session = Depends(get_db)):
    row = StatsRepo(db).update_hand(
        user.id,
        name=req.player_name,
        vpip=req.vpip_this_hand,
        pfr=req.pfr_this_hand,
        won_showdown=req.won_showdown,
        made_cbet=req.made_cbet,
        cbet_succeeded=req.cbet_succeeded,
        made_three_bet=req.made_three_bet,
        three_bet_succeeded=req.three_bet_succeeded,
        fold_to_river=req.fold_to_river,
        called_showdown=req.called_showdown,
    )
    return {"status": "success", "hands_played": row.hands_played}


class HandResultRequest(BaseModel):
    hand_id: Optional[str] = None
    session_id: Optional[str] = None
    result: str  # win | loss | tie
    amount_won: float
    street: str = "showdown"
    pot_size: float = 0.0
    your_cards: List[Dict[str, str]] = []
    community_cards: List[Dict[str, str]] = []
    action_count: int = 0
    duration_seconds: float = 0.0
    tactical_data: Optional[Dict[str, Any]] = None


@app.post("/api/v1/stats/hand_result")
def record_hand_result_endpoint(req: HandResultRequest, user: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        record = StatsRepo(db).record_hand(
            user.id,
            session_id=req.session_id,
            result=req.result,
            amount_won=req.amount_won,
            street=req.street,
            pot_size=req.pot_size,
            your_cards=req.your_cards,
            community_cards=req.community_cards,
            action_count=req.action_count,
            duration_seconds=req.duration_seconds,
            tactical_data=req.tactical_data,
        )
        return {"status": "success", "hand_id": record.hand_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/stats/history")
def get_hand_history_endpoint(limit: int = 50, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return StatsRepo(db).get_history(user.id, limit=limit)


@app.get("/api/v1/stats/session/latest/analytics")
def get_latest_session_analytics_endpoint(user: User = Depends(current_user), db: Session = Depends(get_db)):
    analytics = StatsRepo(db).get_session_analytics(user.id, session_id=None)
    if analytics is None:
        raise HTTPException(status_code=404, detail="No session data available. Play some hands first!")
    return analytics


@app.get("/api/v1/stats/session/{session_id}/analytics")
def get_session_analytics_endpoint(session_id: str, user: User = Depends(current_user), db: Session = Depends(get_db)):
    analytics = StatsRepo(db).get_session_analytics(user.id, session_id=session_id)
    if analytics is None:
        raise HTTPException(status_code=404, detail=f"No session data found for '{session_id}'.")
    return analytics


@app.post("/api/v1/stats/reset_session")
def reset_session_endpoint(user: User = Depends(current_user), db: Session = Depends(get_db)):
    StatsRepo(db).reset(user.id)
    return {"status": "success"}


# --- RAG Specific Endpoints (conv.md) ---

@app.post("/api/coach/advise", response_model=AdviceResponse)
def advise_hand_direct(req: AdviceRequest):
    """Direct RAG coaching endpoint returning one grounded coaching paragraph."""
    try:
        hole = [Card.from_str(c) for c in req.hole_cards]
        board = [Card.from_str(c) for c in req.community_cards]
        street = req.street or (
            GameStreet.PRE_FLOP if len(board) == 0 else
            GameStreet.FLOP if len(board) == 3 else
            GameStreet.TURN if len(board) == 4 else
            GameStreet.RIVER
        )
        opp = req.opponent or RagOpponent()
        opp.archetype = classify_archetype(opp.vpip, opp.pfr)

        sim_res = simulate_equity(hole_cards=hole, community_cards=board, num_opponents=req.num_opponents)
        win_prob = sim_res["win_probability"]
        math_res = calculate_math(win_probability=win_prob, pot_size=req.pot_size, call_amount=req.call_amount)

        hole_desc = " ".join([c.display for c in hole])
        board_desc = " ".join([c.display for c in board]) if board else "preflop"
        query_text = f"{street.value} strategy holding {hole_desc} board {board_desc} pot odds {math_res['pot_odds_percentage']}% vs {opp.archetype}"

        retrieved_results = get_retriever().search(query=query_text, top_k=settings.final_top_k)
        retrieved_chunks = [to_book_knowledge(r) for r in retrieved_results]

        advice = get_coach_advice(
            hole_cards=hole,
            community_cards=board,
            street=street,
            pot_size=req.pot_size,
            call_amount=req.call_amount,
            player_stack=req.player_stack,
            win_prob=win_prob,
            pot_odds_ratio=math_res["pot_odds_ratio"],
            pot_odds_pct=math_res["pot_odds_percentage"],
            required_equity=math_res["required_equity"],
            ev=math_res["expected_value"],
            opponent=opp,
            retrieved_chunks=retrieved_chunks,
        )
        return advice
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class EquityDirectRequest(BaseModel):
    hole_cards: List[str]
    community_cards: List[str] = []
    num_opponents: int = 1
    num_simulations: int = 1000


@app.post("/api/equity")
def calculate_equity_direct(req: EquityDirectRequest):
    try:
        hole = [Card.from_str(c) for c in req.hole_cards]
        board = [Card.from_str(c) for c in req.community_cards]
        return simulate_equity(hole_cards=hole, community_cards=board, num_opponents=req.num_opponents, num_simulations=req.num_simulations)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class RetrieveDirectRequest(BaseModel):
    query: str
    top_k: int = 5


@app.post("/api/retrieve", response_model=List[RetrievedBookKnowledge])
def retrieve_direct(req: RetrieveDirectRequest):
    results = get_retriever().search(query=req.query, top_k=req.top_k)
    return [to_book_knowledge(r) for r in results]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
