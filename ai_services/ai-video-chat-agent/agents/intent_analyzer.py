"""
agents/intent_analyzer.py
Analyzes user intent and determines response strategy
"""

import json
from config.settings import (
    get_llm_client, LLM_MODEL, DIFFICULTY_PRESETS,
    ENABLE_PRACTICE_MODE, ENABLE_INTERACTIVE_MODE,
)
from agents.conversation_manager import ConversationManager


class IntentAnalyzer:
    """Analyzes user messages to determine intent and response type."""

    PROMPT = """You are an intent analyzer for an AI video teaching agent.
Analyze the student's message in conversation context and return JSON.

RESPONSE FORMAT:
{
    "intent": "new_topic|follow_up|code_explain|why_question|comparison|deep_dive|line_by_line|example_request|recap|practice_request|difficulty_change|interactive_click",
    "response_type": "full_explainer|code_walkthrough|concept_detail|comparison_video|quick_answer|line_detail|diagram_focus|practice_exercise|metaphor_explain",
    "estimated_scenes": 5,
    "title": "Clear video title",
    "context_needed": true,
    "references_previous": {
        "uses_previous_code": false,
        "uses_previous_diagram": false,
        "continues_topic": true,
        "references_practice": false
    },
    "key_focus": "What to focus the explanation on",
    "text_response": "Brief 1-2 sentence text response before video",
    "suggested_metaphor": "car|tree|brain|road|building|ocean|animal|factory|none",
    "camera_style": "static|zoom_in|pan_right|dolly|zoom_out",
    "mood": "energetic|calm|technical|curious|celebratory",
    "generate_practice": false,
    "difficulty_override": null
}

SCENE COUNT GUIDE:
- new_topic: 8-12 scenes
- follow_up: 3-6 scenes
- code_explain: 4-7 scenes
- why_question: 3-5 scenes
- comparison: 4-6 scenes
- line_by_line: 2-4 scenes
- quick_answer: 2-3 scenes
- practice_request: 3-5 scenes
- deep_dive: 8-15 scenes

METAPHOR GUIDE:
- Use "car" for systems with engines/components
- Use "tree" for hierarchical structures
- Use "brain" for AI/neural/thinking topics
- Use "road" for pipelines/journeys
- Use "building" for layered architecture
- Use "animal" for collaborative tools/agents
- Use "factory" for data processing
- Use "ocean" for depth/exploration topics
- Use "none" when diagrams/code are better

PRACTICE DETECTION:
- If user says "quiz me", "test me", "practice", "exercise" → practice_request
- If user says "easy/beginner/simple" → difficulty_override: "beginner"
- If user says "hard/advanced/expert" → difficulty_override: "advanced"
"""

    def __init__(self):
        self.client = get_llm_client()

    def analyze(self, user_message: str,
                conversation: ConversationManager) -> dict:
        """Analyze user message and return structured intent."""
        history = conversation.get_chat_history_for_llm(10)
        ctx = conversation.get_context_summary()
        difficulty = conversation.difficulty

        features_note = ""
        if ENABLE_PRACTICE_MODE:
            features_note += "\nPractice mode is ENABLED. Detect practice requests."
        if ENABLE_INTERACTIVE_MODE:
            features_note += "\nInteractive mode is ENABLED. Support click-based exploration."

        diff_info = DIFFICULTY_PRESETS.get(difficulty, {})
        diff_note = f"\nCurrent difficulty: {difficulty} ({diff_info.get('label', '')})"

        try:
            response = self.client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": self.PROMPT + features_note + diff_note},
                    {
                        "role": "user",
                        "content": (
                            f"CONTEXT:\n{ctx}\n\n"
                            f"HISTORY:\n{json.dumps(history[-6:])}\n\n"
                            f"DIFFICULTY: {difficulty}\n\n"
                            f'NEW MESSAGE: "{user_message}"'
                        ),
                    },
                ],
                response_format={"type": "json_object"},
                max_tokens=700,
                temperature=0.3,
            )

            result = json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"  ⚠️ Intent analysis failed: {e}")
            result = {}

        # Defaults
        result.setdefault("intent", "new_topic")
        result.setdefault("response_type", "full_explainer")
        result.setdefault("estimated_scenes", 5)
        result.setdefault("title", user_message[:50])
        result.setdefault("text_response", "Let me explain that for you...")
        result.setdefault("suggested_metaphor", "none")
        result.setdefault("camera_style", "zoom_in")
        result.setdefault("mood", "calm")
        result.setdefault("generate_practice", False)
        result.setdefault("difficulty_override", None)
        result.setdefault("references_previous", {})
        result.setdefault("key_focus", user_message)

        # Handle difficulty change
        if result.get("difficulty_override"):
            conversation.set_difficulty(result["difficulty_override"])

        # Auto-generate practice after deep explanations
        if (ENABLE_PRACTICE_MODE and
                result["intent"] in ("new_topic", "deep_dive") and
                conversation.interaction_count > 2 and
                not result["generate_practice"]):
            result["generate_practice"] = True

        print(
            f"  🧠 Intent: {result['intent']} → {result['response_type']} "
            f"({result['estimated_scenes']} scenes) "
            f"[metaphor: {result['suggested_metaphor']}, "
            f"camera: {result['camera_style']}]"
        )

        return result