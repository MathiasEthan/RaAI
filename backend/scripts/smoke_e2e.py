# scripts/smoke_e2e.py
from langchain_core.documents import Document
from tests.mocks import mock_llm_analyze_journal, mock_llm_recommend_exercise, mock_llm_coach_question

from core.journal_analyzer import analyze_entry
from core.recommender import choose_target, compose_query
from core.coach import coach_question
from rag.rag_pipeline import ConversationalRAG as RagPipeline

def main():
    # 1) Build a tiny index
    docs = [
        Document(
            page_content="Box breathing steps: Inhale 4, hold 4, exhale 4, hold 4. Helps lower arousal.",
            metadata={"facet":"self_regulation","duration":"2min","context_tags":["anger","teamwork"],"doc_id":"doc_sr_01"}
        )
    ]
    rp = RagPipeline(faiss_dir="rag/vectorstore")
    rp.index_documents(docs)
    retriever = rp.load_retriever_from_faiss()

    # 2) Analyze a journal entry (mock LLM)
    analysis = analyze_entry(
        {"journal":"I snapped in the meeting when I felt criticized.","mood":3,"context":{"sleep":6}},
        llm=mock_llm_analyze_journal()
    )
    print("Analysis:", analysis)

    # 3) Choose target & build query
    emotions = analysis["emotions"]
    top_emotion = emotions[0]["label"] if emotions else None
    target = choose_target(
        signals=analysis["facet_signals"],
        sentiment=analysis["sentiment"],
        top_emotions=top_emotion,
        topics=analysis["topics"]
    )
    query = compose_query(target, top_emotion, analysis["topics"], "2min")
    print("Target:", target, "| Query:", query)

    # 4) Recommend exercise via RAG (mock synthesis LLM)
    rp.llm = mock_llm_recommend_exercise()
    chunks = rp.search(retriever, query, k=3)
    ex = rp.synthesize_exercise(chunks, [target], [top_emotion] + analysis["topics"][:2], "2min")
    print("Exercise:", ex)

    # 5) Coach question (mock LLM)
    q = coach_question(
        {"facet":target, "emotions":analysis["emotions"], "last_entry_summary":analysis["one_line_insight"]},
        llm=mock_llm_coach_question()
    )
    print("Coach Q:", q)

if __name__ == "__main__":
    main()
