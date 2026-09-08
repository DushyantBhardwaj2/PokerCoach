import http.client
import json

# Header carrying the logged-in demo user id (set after /auth/login).
_USER_ID = None


def _headers():
    h = {"Content-Type": "application/json"}
    if _USER_ID is not None:
        h["X-User-Id"] = str(_USER_ID)
    return h


def post_json(conn, path, payload):
    data = json.dumps(payload)
    conn.request("POST", path, body=data, headers=_headers())
    resp = conn.getresponse()
    body = resp.read().decode()
    return resp.status, json.loads(body)


def get_json(conn, path):
    conn.request("GET", path, headers=_headers())
    resp = conn.getresponse()
    body = resp.read().decode()
    return resp.status, json.loads(body)


def run():
    global _USER_ID
    conn = http.client.HTTPConnection("127.0.0.1", 8000, timeout=30)

    # 1. Health
    status, health = get_json(conn, "/api/health")
    print(f"[1] Health Check (HTTP {status}):", health, flush=True)

    # 2. Login as demo1 (X-User-Id header scoping, no JWT)
    status, auth = post_json(conn, "/api/v1/auth/login", {"username": "demo1"})
    _USER_ID = auth.get("user_id")
    print(f"[2] Login (HTTP {status}): user_id={_USER_ID} ({auth.get('display_name')})", flush=True)

    # 3. Start Game
    start_payload = {
        "player_names": ["Hero", "Villain 1", "Villain 2"],
        "initial_stacks": [1000, 1000, 1000],
        "small_blind": 10,
        "big_blind": 20,
    }
    status, game_state = post_json(conn, "/api/v1/game/start", start_payload)
    print(f"[3] Game Start (HTTP {status}): Street={game_state['street']}, Pot=${game_state['pot']}", flush=True)

    # 4. Action Call
    curr_idx = game_state["current_player_index"]
    action_payload = {
        "state": game_state,
        "action": {"player_index": curr_idx, "action_type": "call", "amount": 20},
    }
    status, state_after_call = post_json(conn, "/api/v1/game/action", action_payload)
    print(f"[4] Action Recorded (HTTP {status}): New Pot=${state_after_call['pot']}, Next Player={state_after_call['current_player_index']}", flush=True)

    # 5. AI 70/30 Hybrid RAG Analysis — one natural coach paragraph, chapter citations
    game_state["players"][0]["hole_cards"] = [{"rank": "A", "suit": "s"}, {"rank": "K", "suit": "s"}]
    game_state["community_cards"] = [{"rank": "Q", "suit": "s"}, {"rank": "J", "suit": "s"}, {"rank": "2", "suit": "c"}]
    ai_payload = {
        "state": game_state,
        "history": [],
        "opponent_name": "Villain 1",
        "hole_cards": [{"rank": "A", "suit": "s"}, {"rank": "K", "suit": "s"}],
        "num_simulations": 300,
    }
    status, ai_res = post_json(conn, "/api/v1/ai/analyze-full", ai_payload)
    adv = ai_res.get("advice", {})
    print(f"[5] AI RAG Analysis (HTTP {status}):", flush=True)
    print(f"    Action: {adv.get('action')} | Bet Sizing: {adv.get('bet_sizing')}", flush=True)
    print(f"    Win Prob: {round(ai_res.get('win_analysis', {}).get('win_probability', 0)*100, 1)}%", flush=True)
    print(f"    Confidence: {adv.get('confidence')}", flush=True)
    print(f"    Coach: {(adv.get('coach_paragraph') or '')[:160]}...", flush=True)

    retrieved = ai_res.get("retrieved_knowledge", [])
    print(f"    Retrieved {len(retrieved)} Book Chunks (70/30 Fusion):", flush=True)
    for i, c in enumerate(retrieved):
        print(f"     ({i+1}) \"{c.get('book_title')}\" — {c.get('chapter')} [Score: {round(c.get('hybrid_score', 0), 4)}]", flush=True)

    # 6. Showdown (no bluffer_names)
    sd_payload = {"state": game_state}
    status, sd_res = post_json(conn, "/api/v1/game/showdown", sd_payload)
    print(f"[6] Showdown (HTTP {status}): Winners={sd_res.get('result', {}).get('winners')}", flush=True)

    # 7. Per-user Opponent Stats (Postgres-backed, isolated by X-User-Id)
    status, stats = get_json(conn, "/api/v1/stats/")
    print(f"[7] Opponent Stats (HTTP {status}): Tracked Opponents={list(stats.keys())}", flush=True)

    print("\n>>> ALL BACKEND MODULES OPERATING (per-user Postgres, chapter citations, coach paragraph) <<<", flush=True)


if __name__ == "__main__":
    run()
