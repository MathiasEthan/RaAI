# tests/mocks.py
class _Resp:
    def __init__(self, content: str): self.content = content

class MockLLM:  # generic "returns what you set"
    def __init__(self, content: str): self._content = content
    def invoke(self, _messages): return _Resp(self._content)

# Contextual helpers for specific steps
def mock_llm_analyze_journal():
    return MockLLM(
        content=(
            '{'
            '"emotions":[{"label":"anger","score":0.82},{"label":"frustration","score":0.61}],'
            '"sentiment":-0.55,'
            '"cognitive_distortions":["mind_reading"],'
            '"topics":["teamwork","feedback"],'
            '"facet_signals":{"self_awareness":"+","self_regulation":"-","motivation":"0","empathy":"-","social_skills":"0"},'
            '"one_line_insight":"Trigger: perceived criticism; pattern: quick escalation."'
            '}'
        )
    )

def mock_llm_recommend_exercise():
    return MockLLM(
        content=(
            '{'
            '"exercise_id":"SR_box_breath_2min",'
            '"title":"Box Breathing (2 minutes)",'
            '"steps":["Inhale 4","Hold 4","Exhale 4","Hold 4","Repeat 8 cycles"],'
            '"expected_outcome":"Lower arousal to regain control.",'
            '"source_doc_id":"doc_sr_01",'
            '"followup_question":"What changed in your body after two rounds?"'
            '}'
        )
    )

def mock_llm_coach_question():
    return MockLLM("What was the first sign you noticed before anger rose?")

def mock_llm_coach_followup():
    return MockLLM("You noticed early physical cues before the emotion escalated.")

def mock_llm_safety_safe():
    return MockLLM('{"label":"SAFE"}')

def mock_llm_safety_escalate():
    return MockLLM('{"label":"ESCALATE"}')
