import json
import os
from pathlib import Path
from typing import List, Optional
from datetime import datetime, date
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from model.models import *
from core import baseline_scoring as baseline_core
from core import journal_analyzer as journal_core
from core import recommender as rec_core
from core import coach as coach_core
from core import safety_checker as safety_core
from core import analytics as analytics_core
from core import challenges as challenges_core
from core import matchmaking as matchmaking_core
from rag.rag_pipeline import ConversationalRAG, SingleDocumentIngestor
from auth import (
    login_redirect, google_callback, get_current_user_info,
    get_current_user, ensure_role, coordinator_required
)
from db import (
    init_db, close_db, Collections, upsert_checkin, get_user_checkins,
    get_team_participation_stats)
# ) validate_team_access

VECTORSTORE_DIR = os.getenv("VECTORSTORE_DIR", "rag/vectorstore")
DOCS_DIR = os.getenv("DOCS_DIR", "rag/documents")
QUESTIONS_PATH = os.getenv("QUESTIONS_PATH", "core/questions/baseline_questions.json")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

rag_pipe: Optional[ConversationalRAG] = None
retriever = None  # will be set after ingest or load

# Lifespan context for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    global rag_pipe, retriever

    # Startup
    rag_pipe = ConversationalRAG(faiss_dir=VECTORSTORE_DIR)
    vs_path = Path(VECTORSTORE_DIR)
    if vs_path.exists() and any(vs_path.iterdir()):
        try:
            retriever = rag_pipe.load_retriever_from_faiss()
        except Exception as e:
            print(f"[lifespan startup] Could not load retriever: {e}")
    
    # Initialize database
    try:
        await init_db()
    except Exception as e:
        print(f"[lifespan startup] Could not initialize database: {e}")
    
    print("App startup complete")
    yield
    
    # Shutdown
    await close_db()
    print("Shutting down app...")

app = FastAPI(title="RaAI API", version="0.1.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "*"],      
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Health -----------------
@app.get("/health")
async def health():
    return {"status": "ok", "retriever_ready": retriever is not None}

# ----------------- Authentication -----------------
@app.get("/auth/login")
async def login(request: Request):
    """Redirect to Google OAuth login"""
    return await login_redirect(request)

@app.get("/auth/google/callback")
async def google_oauth_callback(request: Request):
    """Handle Google OAuth callback"""
    return await google_callback(request)

@app.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user_info)):
    """Get current user information"""
    return current_user

# ----------------- Mood Tracking Analytics -----------------
@app.get("/analytics/checkin/questions")
async def get_checkin_questions():
    """Get daily Likert questions"""
    questions = analytics_core.likert_questions()
    return {"questions": questions}

@app.post("/analytics/checkin")
async def submit_checkin(request: Request):
    """Submit daily mood checkin"""
    payload = await request.json()
    
    # Set date to today if not provided
    if "date" not in payload:
        payload["date"] = date.today().isoformat()
    
    # Score the checkin
    scored_checkin = analytics_core.score_checkin(payload)
    
    # Get user's recent checkins for trend analysis
    user_id = payload.get("user_id")
    if user_id:
        recent_checkins = await get_user_checkins(user_id, days=14)
        mood_indices = [c.get("mood_index", 0) for c in recent_checkins]
        mood_indices.append(scored_checkin["mood_index"])
        
        # Compute analytics
        stats = analytics_core.compute_series_stats(mood_indices)
        scored_checkin.update(stats)
    
    # Save to database
    saved_checkin = await upsert_checkin(scored_checkin)
    
    return saved_checkin

@app.get("/analytics/series")
async def get_mood_series(user_id: str, days: int = 30):
    """Get user's mood series data"""
    checkins = await get_user_checkins(user_id, days)
    
    series_data = []
    for checkin in reversed(checkins):  # Chronological order
        series_data.append({
            "date": checkin.get("date"),
            "mood_index": checkin.get("mood_index", 0),
            "ema7": checkin.get("ema7", 0),
            "ema14": checkin.get("ema14", 0),
            "flag": checkin.get("flag", "SAFE")
        })
    
    return {"series": series_data}

@app.get("/analytics/team")
async def get_team_analytics(
    team_id: str,
    current_user: dict = Depends(coordinator_required)
):
    """Get team analytics (coordinators only, k-anonymity protected)"""
    # Validate team access
    if not validate_team_access(current_user, team_id):
        raise HTTPException(status_code=403, detail="Access denied to team data")
    
    stats = await get_team_participation_stats(team_id, min_users=5)
    if stats is None:
        raise HTTPException(
            status_code=403, 
            detail="Insufficient team size for analytics (minimum 5 users required)"
        )
    
    return stats

# ----------------- Wellness Challenges -----------------
@app.post("/challenges/create")
async def create_challenge(
    request: Request,
    current_user: dict = Depends(coordinator_required)
):
    """Create a new wellness challenge (coordinators only)"""
    payload = await request.json()
    
    # Get or generate challenge template
    target_facets = payload.get("target_facets", [])
    team_context = payload.get("team_context", "")
    
    if payload.get("use_template", True):
        challenge_template = challenges_core.pick_challenge(target_facets, team_context)
    else:
        challenge_template = payload.get("challenge_data", {})
    
    # Create challenge document
    challenges_coll = await Collections.challenges()
    challenge_doc = {
        "team_id": payload.get("team_id") or current_user.get("team_id"),
        "title": challenge_template.get("title", "Custom Challenge"),
        "description": challenge_template.get("description", ""),
        "daily_tasks": challenge_template.get("daily_tasks", []),
        "target_facets": target_facets,
        "start_date": payload.get("start_date", date.today().isoformat()),
        "end_date": payload.get("end_date"),
        "created_by": str(current_user["_id"]),
        "created_at": datetime.utcnow()
    }
    
    result = await challenges_coll.insert_one(challenge_doc)
    challenge_doc["_id"] = str(result.inserted_id)
    
    return challenge_doc

@app.post("/challenges/join")
async def join_challenge(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Join a wellness challenge"""
    payload = await request.json()
    challenge_id = payload.get("challenge_id")
    user_id = str(current_user["_id"])
    
    # Check if already participating
    participation_coll = await Collections.participation()
    existing = await participation_coll.find_one({
        "challenge_id": challenge_id,
        "user_id": user_id
    })
    
    if existing:
        return existing
    
    # Create participation record
    participation_doc = {
        "challenge_id": challenge_id,
        "user_id": user_id,
        "streak": 0,
        "days_completed": [],
        "last_completed": None,
        "joined_at": datetime.utcnow()
    }
    
    result = await participation_coll.insert_one(participation_doc)
    participation_doc["_id"] = str(result.inserted_id)
    
    return participation_doc

@app.post("/challenges/complete")
async def complete_challenge_day(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Mark challenge day as completed"""
    payload = await request.json()
    challenge_id = payload.get("challenge_id")
    user_id = str(current_user["_id"])
    
    participation_coll = await Collections.participation()
    
    # Get current participation state
    participation = await participation_coll.find_one({
        "challenge_id": challenge_id,
        "user_id": user_id
    })
    
    if not participation:
        raise HTTPException(status_code=404, detail="Participation not found")
    
    # Update streak
    prev_state = {
        "streak": participation.get("streak", 0),
        "days_completed": participation.get("days_completed", []),
        "last_completed": participation.get("last_completed")
    }
    
    updated_state = challenges_core.update_streak(prev_state, completed_today=True)
    
    # Save updated state
    await participation_coll.update_one(
        {"_id": participation["_id"]},
        {"$set": {
            "streak": updated_state["streak"],
            "days_completed": updated_state["days_completed"],
            "last_completed": updated_state["last_completed"],
            "updated_at": datetime.utcnow()
        }}
    )
    
    return updated_state

@app.get("/challenges/leaderboard")
async def get_challenge_leaderboard(challenge_id: str):
    """Get challenge leaderboard (safe data only)"""
    participation_coll = await Collections.participation()
    cursor = participation_coll.find({"challenge_id": challenge_id})
    participations = await cursor.to_list(length=None)
    
    # Get leaderboard data (no sensitive info)
    leaderboard = challenges_core.get_leaderboard_data(participations)
    
    return {"leaderboard": leaderboard}

# ----------------- Peer Mentorship Matching -----------------
@app.post("/mentors/match")
async def find_mentor_matches(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Find mentor matches for current user"""
    payload = await request.json()
    
    # Validate consent
    if not matchmaking_core.validate_mentorship_consent(current_user):
        raise HTTPException(
            status_code=403,
            detail="Mentorship matching consent required"
        )
    
    # Get potential mentors
    users_coll = await Collections.users()
    mentors_cursor = users_coll.find({
        "role": {"$in": ["mentor", "counselor"]},
        "_id": {"$ne": current_user["_id"]}
    })
    mentors = await mentors_cursor.to_list(length=None)
    
    # Find top matches
    k = payload.get("k", 5)
    matches = matchmaking_core.topk_matches(current_user, mentors, k)
    
    # Store match proposals
    matches_coll = await Collections.matches()
    for match in matches:
        proposal = matchmaking_core.create_match_proposal(
            str(current_user["_id"]),
            match["mentor_id"],
            match["score"]
        )
        await matches_coll.replace_one(
            {"mentee_id": proposal["mentee_id"], "mentor_id": proposal["mentor_id"]},
            proposal,
            upsert=True
        )
    
    return {"matches": matches}

@app.post("/mentors/accept")
async def accept_mentor_match(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Accept a mentor match proposal"""
    payload = await request.json()
    mentor_id = payload.get("mentor_id")
    mentee_id = str(current_user["_id"])
    
    matches_coll = await Collections.matches()
    
    # Update match status
    result = await matches_coll.update_one(
        {"mentee_id": mentee_id, "mentor_id": mentor_id, "status": "proposed"},
        {"$set": {
            "status": "accepted",
            "accepted_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Match proposal not found")
    
    return {"status": "accepted", "mentor_id": mentor_id}

# ----------------- Team Collaboration Tools -----------------
@app.post("/collab/rewrite")
async def rewrite_message(request: Request):
    """Rewrite message to be more assertive and kind"""
    payload = await request.json()
    text = payload.get("text", "")
    intent = payload.get("intent", "assertive_kind")
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    
    result = coach_core.rewrite_message(text, intent, llm=None)
    return result

@app.post("/collab/debrief")
async def meeting_debrief(request: Request):
    """Structure meeting notes into actionable format"""
    payload = await request.json()
    notes = payload.get("notes", "")
    
    if not notes.strip():
        raise HTTPException(status_code=400, detail="Meeting notes are required")
    
    result = coach_core.meeting_debrief(notes, llm=None)
    return result

# ----------------- Crisis Support Resources -----------------
@app.get("/crisis/resources")
async def get_crisis_resources(locale: str = "en", topic: Optional[str] = None):
    """Get crisis support resources by locale and topic"""
    resources_path = Path(f"data/crisis_resources.{locale}.json")
    if not resources_path.exists():
        resources_path = Path("data/crisis_resources.en.json")
    
    if not resources_path.exists():
        # Fallback resources
        return {
            "emergency": {
                "title": "Emergency Services",
                "resources": [
                    {
                        "name": "Emergency Services",
                        "phone": "911",
                        "description": "Immediate life-threatening emergencies",
                        "availability": "24/7"
                    }
                ]
            },
            "crisis_hotlines": {
                "title": "Crisis Support",
                "resources": [
                    {
                        "name": "988 Suicide & Crisis Lifeline",
                        "phone": "988",
                        "description": "24/7 crisis support",
                        "availability": "24/7"
                    }
                ]
            }
        }
    
    try:
        with resources_path.open("r", encoding="utf-8") as f:
            all_resources = json.load(f)
        
        # Filter by topic if specified
        if topic and topic.lower() in all_resources:
            return {topic.lower(): all_resources[topic.lower()]}
        
        return all_resources
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading resources: {e}")

# ----------------- Enhanced Safety Check -----------------
@app.post("/ai/safety-check", response_model=SafetyCheckResponse)
def safety_check_enhanced(req: SafetyCheckRequest):
    """Enhanced safety check with trend integration"""
    result = safety_core.classify_risk(req.text, llm=None)
    label = result.get("label", SafetyLabel.SAFE.value)
    message = None
    
    if label == SafetyLabel.ESCALATE.value:
        message = safety_core.escalation_message(locale="en")
    
    return SafetyCheckResponse(label=SafetyLabel(label), message=message)

# ----------------- RAG Endpoints (Existing) -----------------
@app.post("/rag/ingest")
async def rag_ingest(files: List[UploadFile] = File(...)):
    global rag_pipe, retriever
    if rag_pipe is None:
        rag_pipe = ConversationalRAG(faiss_dir=VECTORSTORE_DIR)

    ingestor = SingleDocumentIngestor(
        data_dir="data/single_document_chat",
        faiss_dir=VECTORSTORE_DIR
    )
    try:
        uploaded_retriever = ingestor.ingest_files(files)
        retriever = uploaded_retriever
        return {"message": "Ingestion complete", "vectorstore_dir": VECTORSTORE_DIR}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")

@app.get("/rag/status")
def rag_status():
    return {"retriever_ready": retriever is not None, "vectorstore_dir": VECTORSTORE_DIR}

# ----------------- Baseline Questions (Existing) -----------------
@app.get("/ai/get-baseline-questions")
def get_baseline_questions():
    path = Path(QUESTIONS_PATH)
    if not path.exists():
        fallback = [
            {"qid": "SA1", "facet": "self_awareness", "text": "I can recognize my emotions as they arise."},
            {"qid": "SR1", "facet": "self_regulation", "text": "I can stay calm under pressure."},
            {"qid": "M1",  "facet": "motivation", "text": "I persist even when tasks are difficult."},
            {"qid": "E1",  "facet": "empathy", "text": "I understand others' feelings even if unspoken."},
            {"qid": "SS1", "facet": "social_skills", "text": "I handle disagreements constructively."},
        ]
        return {"questions": fallback, "note": "Using fallback questions; provide core/questions/baseline_questions.json"}
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        return {"questions": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read questions: {e}")

@app.post("/ai/score-baseline", response_model=BaselineResponse)
def score_baseline(req: BaselineRequest):
    path = Path(QUESTIONS_PATH)
    qmap = {}
    if path.exists():
        try:
            with path.open("r", encoding="utf-8") as f:
                for item in json.load(f):
                    qid, facet = item.get("qid"), item.get("facet")
                    if qid and facet:
                        qmap[qid] = facet
        except Exception:
            pass

    if not qmap:
        def infer(qid: str) -> Optional[str]:
            qid_up = qid.upper()
            if qid_up.startswith("SA"): return "self_awareness"
            if qid_up.startswith("SR"): return "self_regulation"
            if qid_up.startswith("M"):  return "motivation"
            if qid_up.startswith("E"):  return "empathy"
            if qid_up.startswith("SS"): return "social_skills"
            return None
        for a in req.answers:
            facet = infer(a.qid)
            if facet:
                qmap[a.qid] = facet

    scores, strengths, focus = baseline_core.score_baseline(
        answers=[{"qid": a.qid, "value": a.value} for a in req.answers],
        qmap=qmap
    )
    summary = baseline_core.summarize_baseline(scores)
    return BaselineResponse(scores=scores, strengths=strengths, focus=focus, summary=summary)

# ----------------- Journal / Mood (Existing) -----------------
@app.post("/ai/analyze-entry")
def analyze_entry(req: JournalRequest):
    if retriever is None:
        raise HTTPException(status_code=400, detail="Retriever not ready. Ingest documents first.")

    safety = safety_core.classify_risk(req.journal, llm=None)
    if safety.get("label") == SafetyLabel.ESCALATE.value:
        return JSONResponse(
            status_code=200,
            content={
                "safety": safety,
                "message": safety_core.escalation_message(locale="en"),
                "analysis": None,
                "recommendation": None
            }
        )

    analysis: dict = journal_core.analyze_entry(
        payload={"journal": req.journal, "mood": req.mood, "context": req.context},
        llm=None
    )

    # Extract top emotion & sentiment
    emotions = analysis.get("emotions", [])
    top_emotion = (sorted(emotions, key=lambda e: e.get("score", 0), reverse=True)[0].get("label")
                   if emotions else None)
    sentiment = float(analysis.get("sentiment", 0))
    signals = analysis.get("facet_signals", {})
    topics = analysis.get("topics", [])

    target = rec_core.choose_target(signals=signals, sentiment=sentiment,
                                    top_emotions=top_emotion, topics=topics)

    duration_hint = "2min" if (sentiment <= -0.4 or (top_emotion or "").lower() in {"anger", "anxiety", "fear"}) else "5min"
    query = rec_core.compose_query(target_facet=target, top_emotion=top_emotion, topics=topics, duration_hint=duration_hint)

    chunks = rag_pipe.search(retriever=retriever, query=query, k=5)
    recommendation: ExerciseRecommendation = rag_pipe.synthesize_exercise(
        chunks=chunks,
        target_facets=[target],
        context_tags=[(top_emotion or "").lower()] + topics[:2],
        duration_hint=duration_hint,
    )

    return {
        "safety": {"label": SafetyLabel.SAFE.value},
        "analysis": analysis,
        "recommendation": recommendation
    }

# ----------------- Mood Score Endpoint (Existing) -----------------
@app.post("/ai/mood-score")
async def mood_score(request: Request):
    req = await request.json()
    text = req.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="No input text provided.")
    
    analysis = journal_core.analyze_entry(payload={"journal": text}, llm=None)
    sentiment = float(analysis.get("sentiment", 0))

    # Map sentiment [-1,1] -> score [1,10]
    score = ((sentiment + 1) / 2) * 9 + 1

    return {"score": score}

# ----------------- Other endpoints (coach, exercise) -----------------
@app.post("/ai/get-exercise", response_model=ExerciseResponse)
def get_exercise(req: ExerciseRequest):
    if retriever is None:
        raise HTTPException(status_code=400, detail="Retriever not ready. Ingest documents first.")
    recommendation = rag_pipe.get_exercise(
        retriever=retriever,
        target_facets=req.target_facets,
        context_tags=req.context_tags,
        duration_hint=req.duration_hint
    )
    return ExerciseResponse(exercise=recommendation)

@app.post("/ai/coach-question", response_model=CoachResponse)
def coach_question(req: CoachRequest):
    question = coach_core.coach_question(
        state={
            "facet": req.state.facet,
            "emotions": [e.dict() for e in req.state.emotions],
            "last_entry_summary": req.state.last_entry_summary or ""
        },
        llm=None
    )
    return CoachResponse(question=question)

@app.post("/ai/coach-reply", response_model=CoachResponse)
def coach_reply(req: CoachRequest):
    out = coach_core.coach_followup(
        user_id=req.user_id,
        last_exchange={"facet": req.state.facet, "user_reply": req.state.last_entry_summary or ""},
        llm=None
    )
    return CoachResponse(question="", insight_line=out.get("insight_line", ""))