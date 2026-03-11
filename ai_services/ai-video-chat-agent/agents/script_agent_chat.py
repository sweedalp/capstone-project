"""
agents/script_agent_chat.py
FAST MULTI-SCENE VERSION: more scenes, short narration, simple visuals
"""

import json
from config.settings import (
    get_llm_client,
    LLM_MODEL,
    DIFFICULTY_PRESETS,
)
from agents.conversation_manager import ConversationManager


class ChatScriptAgent:
    """Generates structured scripts for fast multi-scene video rendering."""

    def __init__(self):
        self.client = get_llm_client()

    def generate(
        self,
        user_message: str,
        intent: dict,
        conversation: ConversationManager,
        language: str = "en",
    ) -> dict:
        history = conversation.get_chat_history_for_llm(3)
        ctx = conversation.get_context_summary()

        response_type = intent.get("response_type", "full_explainer")
        requested_scenes = intent.get("estimated_scenes", 5)
        title = intent.get("title", "Explanation")
        focus = intent.get("key_focus", user_message)
        difficulty = conversation.difficulty
        camera = intent.get("camera_style", "zoom_in")
        mood = intent.get("mood", "calm")

        diff = DIFFICULTY_PRESETS.get(
            difficulty,
            DIFFICULTY_PRESETS["intermediate"],
        )

        # allow more scenes, but keep each scene short
        if response_type in ["follow_up", "quick_answer", "clarification"]:
            scene_count = min(max(requested_scenes, 2), 4)
        else:
            scene_count = min(max(requested_scenes, 4), 6)

        short_context = ctx[:700] if isinstance(ctx, str) else ""

        prompt = f"""
Create a short multi-scene educational video script in JSON.

TOPIC: {title}
FOCUS: {focus}
LANGUAGE: {language}
DIFFICULTY: {difficulty}
STYLE: {diff.get('narration_style', 'clear and simple')}
CAMERA: {camera}
MOOD: {mood}
SCENES: {scene_count}
CONTEXT: {short_context}

Return ONLY valid JSON in this format:
{{
  "title": "{title}",
  "topic": "slug",
  "total_scenes": {scene_count},
  "difficulty": "{difficulty}",
  "summary": "1 short summary sentence",
  "topics_covered": ["topic1", "topic2"],
  "code_blocks": [],
  "diagrams": [],
  "practice": null,
  "scenes": [
    {{
      "scene_number": 1,
      "scene_type": "introduction|concept|example|summary",
      "title": "short title",
      "duration_seconds": 8,
      "narration": "1 or 2 short sentences only.",
      "key_points": ["point 1", "point 2"],
      "animation_type": "title_intro|bullet_points|concept_visual|summary_card|code_block",
      "visual_elements": {{
        "type": "simple",
        "code_lines": [],
        "components": [],
        "connections": []
      }},
      "camera": "{camera}",
      "transition": "cross_dissolve",
      "avatar_state": "talking"
    }}
  ]
}}

Rules:
1. Generate exactly {scene_count} scenes.
2. Keep every scene short and focused.
3. Narration must be very concise.
4. Prefer simple animation types only.
5. Avoid heavy diagrams, mind maps, architecture, timelines, and 3D.
6. If coding topic, include at most one simple code scene.
7. Last scene must be a summary scene.
8. Each scene should explain only one sub-point.
9. Use easy, visual explanations.
"""

        messages = [{"role": "system", "content": prompt}]

        for m in history[-2:]:
            messages.append(m)

        messages.append({
            "role": "user",
            "content": f'Create a fast educational video for: "{user_message}"',
        })

        print(f"  📝 Fast multi-scene script generation ({scene_count} scenes, {difficulty})...")

        try:
            response = self.client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages,
                response_format={"type": "json_object"},
                max_tokens=2800,
                temperature=0.4,
            )
            script = json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"  ⚠️ Script generation failed: {e}")
            script = self._fallback_script(title, user_message, difficulty, camera, scene_count)

        script.setdefault("title", title)
        script.setdefault("topic", title.lower().replace(" ", "_"))
        script.setdefault("difficulty", difficulty)
        script.setdefault("summary", "")
        script.setdefault("topics_covered", [title])
        script.setdefault("code_blocks", [])
        script.setdefault("diagrams", [])
        script.setdefault("practice", None)
        script.setdefault("scenes", [])

        script["scenes"] = script["scenes"][:scene_count]

        for i, scene in enumerate(script["scenes"]):
            scene.setdefault("scene_number", i + 1)
            scene.setdefault("scene_type", "concept")
            scene.setdefault("title", f"Scene {i + 1}")

            narration = scene.get("narration", "")
            if isinstance(narration, str) and len(narration) > 140:
                narration = narration[:140].rsplit(" ", 1)[0] + "..."
            scene["narration"] = narration or f"Let us understand {title}."

            scene.setdefault("key_points", [])
            scene.setdefault("animation_type", "bullet_points")
            scene.setdefault("visual_elements", {})
            scene.setdefault("camera", camera)
            scene.setdefault("transition", "cross_dissolve")
            scene.setdefault("avatar_state", "talking")

            try:
                duration = int(scene.get("duration_seconds", 8))
            except Exception:
                duration = 8
            scene["duration_seconds"] = max(6, min(duration, 10))

            if scene["animation_type"] not in [
                "title_intro",
                "bullet_points",
                "concept_visual",
                "summary_card",
                "code_block",
            ]:
                scene["animation_type"] = "concept_visual"

            ve = scene["visual_elements"]
            if not isinstance(ve, dict):
                ve = {}
            ve.setdefault("type", "simple")
            ve.setdefault("code_lines", [])
            ve.setdefault("components", [])
            ve.setdefault("connections", [])
            scene["visual_elements"] = ve

        # ensure exact count
        if len(script["scenes"]) < scene_count:
            missing = scene_count - len(script["scenes"])
            start_idx = len(script["scenes"]) + 1
            for j in range(missing):
                idx = start_idx + j
                script["scenes"].append({
                    "scene_number": idx,
                    "scene_type": "concept" if idx < scene_count else "summary",
                    "title": f"Scene {idx}" if idx < scene_count else "Summary",
                    "narration": f"This is key point {idx} about {title}." if idx < scene_count else f"In summary, {title} can be understood through these main points.",
                    "key_points": [f"Point {idx}"],
                    "animation_type": "bullet_points" if idx < scene_count else "summary_card",
                    "visual_elements": {
                        "type": "simple",
                        "code_lines": [],
                        "components": [],
                        "connections": [],
                    },
                    "camera": camera,
                    "transition": "cross_dissolve",
                    "avatar_state": "talking",
                    "duration_seconds": 8,
                })

        script["total_scenes"] = len(script["scenes"])

        print(f"  ✅ Script: {len(script['scenes'])} fast scenes generated")
        return script

    def _fallback_script(
        self,
        title: str,
        question: str,
        difficulty: str,
        camera: str,
        scene_count: int,
    ) -> dict:
        scenes = []

        for idx in range(1, scene_count + 1):
            is_last = idx == scene_count
            scenes.append({
                "scene_number": idx,
                "scene_type": "summary" if is_last else ("introduction" if idx == 1 else "concept"),
                "title": "Summary" if is_last else (title if idx == 1 else f"Key Idea {idx - 1}"),
                "narration": (
                    f"Let us begin with {title}. {question[:90]}"
                    if idx == 1
                    else f"This is an important idea related to {title}."
                    if not is_last
                    else f"In summary, {title} becomes easier when broken into small parts."
                ),
                "key_points": [title, f"Part {idx}"] if not is_last else ["Short recap", "Ask a follow-up"],
                "animation_type": "title_intro" if idx == 1 else ("summary_card" if is_last else "bullet_points"),
                "visual_elements": {
                    "type": "simple",
                    "code_lines": [],
                    "components": [],
                    "connections": [],
                },
                "camera": camera if idx == 1 else "static",
                "transition": "cross_dissolve",
                "avatar_state": "talking" if not is_last else "celebrating",
                "duration_seconds": 8,
            })

        return {
            "title": title,
            "topic": title.lower().replace(" ", "_"),
            "total_scenes": scene_count,
            "difficulty": difficulty,
            "summary": f"Short explanation of {title}",
            "topics_covered": [title],
            "code_blocks": [],
            "diagrams": [],
            "practice": None,
            "scenes": scenes,
        }