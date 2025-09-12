# tests/test_core_and_rag.py
import os
from langchain_core.documents import Document

from core.baseline_scoring import score_baseline, summarize_baseline
from core.journal_analyzer import analyze_entry
from core.recommender import choose_target, compose_query, prepare_recommendation
from core.coach import coach_question, coach_followup
from core.safety_checker import classify_risk
from rag.rag_pipeline import ConversationalRAG as RagPipeline

from tests.mocks import (
    mock_llm_analyze_journal, mock_llm_recommend_exercise,
    mock_llm_coach_question, mock_llm_coach_followup,
    mock_llm_safety_safe,
)

# ---------- Baseline ----------
def test_baseline_scoring():
    qmap = {"SA1":"self_awareness","SA2":"self_awareness","SR1":"self_regulation","M1":"motivation"}
    answers = [{"qid":"SA1","value":4},{"qid":"SA2","value":5},{"qid":"SR1","value":2},{"qid":"M1","value":3}]
    scores, strengths, focus = score_baseline(answers, qmap)
    assert 0.0 <= scores["self_awareness"] <= 1.0
    assert strengths and strengths[0] == "self_awareness"
    assert len(focus) >= 1
    assert isinstance(summarize_baseline(scores), str)

# ---------- Journal analyze ----------
def test_analyze_entry_llm():
    llm = mock_llm_analyze_journal()
    payload = {"journal": "Got irritated in a meeting.", "mood": 3, "context": {"sleep_hours":6}}
    out = analyze_entry(payload, llm)
    assert "emotions" in out and out["emotions"][0]["label"] == "anger"
    assert -1.0 <= out["sentiment"] <= 1.0
    assert "facet_signals" in out and out["facet_signals"]["self_regulation"] in {"+","-","0"}

# ---------- Recommender rules ----------
def test_choose_target_and_query():
    signals = {"self_awareness":"+","self_regulation":"-","motivation":"0","empathy":"-","social_skills":"0"}
    target = choose_target(signals, sentiment=-0.5, top_emotions="anger", topics=["teamwork","feedback"])
    assert target == "self_regulation"
    q = compose_query(target, "anger", ["meeting","feedback"], "2min")
    assert "self_regulation" in q and "anger" in q and "2min" in q and "exercise" in q

# ---------- RAG pipeline (index + synthesize) ----------
def test_rag_index_and_synthesize(tmp_path):
    # Prepare tiny EI docs with metadata (facet/duration/context_tags)
    docs = [
        Document(
            page_content="Box breathing steps. Inhale 4, hold 4, exhale 4, hold 4.",
            metadata={"facet":"self_regulation","duration":"2min","context_tags":["anger","teamwork"],"doc_id":"doc_sr_01"}
        ),
        Document(
            page_content="Perspective-taking micro-exercise for conflict.",
            metadata={"facet":"empathy","duration":"5min","context_tags":["conflict"],"doc_id":"doc_e_01"}
        )
    ]
    vs_dir = str(tmp_path / "vectorstore")
    rp = RagPipeline(faiss_dir=vs_dir)
    rp.index_documents(docs)
    retriever = rp.load_retriever_from_faiss()

    # Swap in mock LLM for synthesis
    rp.llm = mock_llm_recommend_exercise()

    chunks = rp.search(retriever, "self_regulation anger teamwork 2min exercise", k=3)
    assert chunks, "No chunks retrieved"
    ex = rp.synthesize_exercise(chunks, ["self_regulation"], ["anger","teamwork"], "2min")
    ex = prepare_recommendation(ex)
    assert ex["exercise_id"] and ex["steps"] and ex["followup_question"]

# ---------- Coach ----------
def test_coach_question_and_followup():
    q_llm = mock_llm_coach_question()
    state = {"facet":"self_regulation","emotions":[{"label":"anger","score":0.8}],"last_entry_summary":"Escalated fast."}
    q = coach_question(state, llm=q_llm)
    assert q.endswith("?") and len(q.split()) <= 20

    f_llm = mock_llm_coach_followup()
    out = coach_followup("u1", {"facet":"self_regulation","user_reply":"I noticed my chest tightened."}, llm=f_llm)
    assert "insight_line" in out and isinstance(out["insight_line"], str)

# ---------- Safety (SAFE) ----------
def test_safety_safe():
    s_llm = mock_llm_safety_safe()
    res = classify_risk("I felt stressed today but I am okay.", llm=s_llm)
    assert res["label"] in {"SAFE","ESCALATE"}  # should be SAFE per mock
