"""
agents/orchestrator_chat.py
PARALLEL VERSION: generate scene audio + animation in parallel,
stream scenes as they finish, compile full video once at the end.
"""

import os
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Callable, Optional

from config.settings import (
    FRAMES_DIR,
    DEFAULT_DIFFICULTY,
)
from agents.conversation_manager import ConversationManager
from agents.intent_analyzer import IntentAnalyzer
from agents.script_agent_chat import ChatScriptAgent
from agents.smart_voice_agent import SmartVoiceAgent
from agents.translation_agent import TranslationAgent
from agents.animation_agent_enhanced import EnhancedAnimationAgent
from agents.video_compiler import VideoCompiler
from pipeline.scene_streamer import SceneStreamer


class ChatOrchestrator:
    def __init__(self, quality: str = "low"):
        self.intent_analyzer = IntentAnalyzer()
        self.script_agent = ChatScriptAgent()
        self.voice_agent = SmartVoiceAgent()
        self.translation_agent = TranslationAgent()
        self.animation_agent = EnhancedAnimationAgent(
            theme="dark_tech",
            quality=quality,
        )
        self.compiler = VideoCompiler()
        self.streamer = SceneStreamer()
        self.sessions = {}
        self.quality = quality

    def get_conversation(self, session_id: str) -> ConversationManager:
        if session_id not in self.sessions:
            conv = ConversationManager()
            conv.set_difficulty(DEFAULT_DIFFICULTY)
            self.sessions[session_id] = conv
        return self.sessions[session_id]

    def _optimize_scenes_for_speed(self, scenes):
        """
        Keep more scenes than before, but make each one lighter.
        """
        if not scenes:
            return []

        # allow more scenes, but cap at 6 for performance
        scenes = scenes[:6]

        heavy_animation_types = {
            "architecture",
            "mind_map",
            "flowchart",
            "comparison",
            "three_d",
            "network",
            "data_chart",
            "timeline",
        }

        for idx, scene in enumerate(scenes, start=1):
            scene["scene_number"] = idx

            narration = scene.get("narration", "")
            if isinstance(narration, str) and len(narration) > 220:
                scene["narration"] = narration[:220].rsplit(" ", 1)[0] + "..."

            try:
                dur = int(scene.get("duration_seconds", 12))
            except Exception:
                dur = 12
            scene["duration_seconds"] = max(8, min(dur, 15))

            if scene.get("animation_type") in heavy_animation_types:
                scene["animation_type"] = "concept_visual"

            scene.setdefault("title", f"Scene {idx}")
            scene.setdefault("scene_type", "explanation")
            scene.setdefault("key_points", [])
            scene.setdefault("visual_elements", {})
            scene.setdefault("camera", "zoom_in")
            scene.setdefault("transition", "cross_dissolve")
            scene.setdefault("avatar_state", "talking")

        return scenes

    def _process_single_scene(
        self,
        scene: dict,
        language: str,
        mood: str,
        total_scenes: int,
        job_id: str,
        on_status: Optional[Callable] = None,
    ) -> dict:
        """
        Process one scene fully inside a worker thread.
        """
        sn = scene["scene_number"]

        self._emit(
            on_status,
            f"scene_{sn}",
            "audio",
            f"🎙 Scene {sn}/{total_scenes}: Generating voice...",
        )
        audio = self.voice_agent.generate_scene_audio(scene, language, mood=mood)

        self._emit(
            on_status,
            f"scene_{sn}",
            "animate",
            f"🎨 Scene {sn}/{total_scenes}: Rendering animation...",
        )
        frame = self.animation_agent.render_scene(scene, audio, language)

        self._emit(
            on_status,
            f"scene_{sn}",
            "building",
            f"🔧 Scene {sn}/{total_scenes}: Building clip...",
        )
        clip = self.streamer.build_scene_clip(
            sn,
            frame["frames_dir"],
            audio["audio_path"],
            audio["duration"],
            job_id,
        )

        clip["narration"] = scene.get("narration", "")
        clip["title"] = scene.get("title", f"Scene {sn}")
        clip["total_scenes"] = total_scenes
        clip["scene_type"] = scene.get("scene_type", "")
        clip["animation_type"] = scene.get("animation_type", "")

        return {
            "scene_number": sn,
            "scene": scene,
            "audio": audio,
            "frame": frame,
            "clip": clip,
        }

    def handle_message(
        self,
        session_id: str,
        user_message: str,
        language: str = "en",
        difficulty: str = None,
        on_scene_ready: Optional[Callable] = None,
        on_status: Optional[Callable] = None,
        on_text_response: Optional[Callable] = None,
    ) -> dict:
        start_time = time.time()
        conv = self.get_conversation(session_id)
        job_id = f"{session_id}_{uuid.uuid4().hex[:6]}"

        if difficulty:
            conv.set_difficulty(difficulty)

        print(f"\n{'=' * 60}")
        print(f"💬 User: {user_message}")
        print(f"📚 History: {len(conv.messages)} msgs | Difficulty: {conv.difficulty}")
        print(f"{'=' * 60}")

        conv.add_user_message(user_message)

        # Step 1: intent
        self._emit(on_status, "intent", "working", "🧠 Understanding your question...")
        intent = self.intent_analyzer.analyze(user_message, conv)

        text_response = intent.get("text_response", "Let me explain...")
        if on_text_response:
            on_text_response(text_response)

        mood = intent.get("mood", "calm")

        # Step 2: script
        self._emit(on_status, "script", "working", "📝 Writing the script...")
        script = self.script_agent.generate(user_message, intent, conv, language)

        # keep more scenes, but optimize them
        script["scenes"] = self._optimize_scenes_for_speed(script.get("scenes", []))

        # Step 3: translation
        self._emit(on_status, "translate", "working", "🌍 Preparing voice...")
        script = self.translation_agent.translate_for_voice(script, language)

        total = len(script["scenes"])
        for s in script["scenes"]:
            s["total_scenes"] = total
            s["difficulty"] = conv.difficulty

        if total == 0:
            raise ValueError("No scenes generated")

        scene_results = {}

        # Step 4-6 in parallel
        self._emit(
            on_status,
            "parallel",
            "working",
            f"⚡ Processing {total} scenes in parallel...",
        )

        max_workers = min(4, max(1, total))
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(
                    self._process_single_scene,
                    scene,
                    language,
                    mood,
                    total,
                    job_id,
                    on_status,
                ): scene["scene_number"]
                for scene in script["scenes"]
            }

            next_scene_to_emit = 1

            for future in as_completed(futures):
                result = future.result()
                sn = result["scene_number"]
                scene_results[sn] = result

                # Emit only in correct order
                while next_scene_to_emit in scene_results:
                    ordered_result = scene_results[next_scene_to_emit]

                    if on_scene_ready:
                        on_scene_ready(ordered_result["clip"])

                    print(
                        f"  ✅ Scene {next_scene_to_emit}/{total} "
                        f"({ordered_result['clip']['duration']:.1f}s, "
                        f"{ordered_result['clip']['size_kb']:.0f}KB)"
                    )

                    next_scene_to_emit += 1

        # restore original order for final compilation
        ordered_scene_numbers = sorted(scene_results.keys())
        frames = [scene_results[i]["frame"] for i in ordered_scene_numbers]
        audios = [scene_results[i]["audio"] for i in ordered_scene_numbers]
        clips = [scene_results[i]["clip"] for i in ordered_scene_numbers]

        # Step 7: compile once
        self._emit(on_status, "compile", "working", "🎬 Compiling full video...")
        full_video = self.compiler.compile(script, clips, language)

        conv.add_assistant_message(
            content=text_response,
            video_id=job_id,
            scenes=script["scenes"],
            code_blocks=script.get("code_blocks", []),
            diagrams=script.get("diagrams", []),
            topics=script.get("topics_covered", []),
            practice=script.get("practice"),
            interactive_elements=[
                {
                    "scene": s.get("scene_number"),
                    "type": s.get("animation_type"),
                }
                for s in script["scenes"]
            ],
        )

        self._cleanup_frames()

        elapsed = time.time() - start_time
        total_duration = sum(c["duration"] for c in clips)

        result = {
            "video_path": full_video,
            "total_scenes": total,
            "total_duration": total_duration,
            "processing_time": elapsed,
            "first_scene_time": clips[0]["build_time"] if clips else 0,
            "intent": intent.get("intent", ""),
            "response_type": intent.get("response_type", ""),
            "message_count": len(conv.messages),
            "difficulty": conv.difficulty,
            "practice": script.get("practice"),
            "interactive_elements": [
                {
                    "scene": s.get("scene_number"),
                    "type": s.get("animation_type"),
                }
                for s in script["scenes"]
            ],
        }

        self._emit(
            on_status,
            "complete",
            "done",
            f"✅ Done! {total} scenes, {total_duration:.0f}s video",
            extra={
                "video_path": full_video,
                "download_url": f"/api/download/{session_id}/{job_id}",
                "practice": script.get("practice"),
                "difficulty": conv.difficulty,
                "total_duration": total_duration,
                "total_scenes": total,
            },
        )

        print(
            f"\n  🎬 Complete: {total} scenes, "
            f"{total_duration:.0f}s, {elapsed:.1f}s processing"
        )

        return result

    def handle_interactive_click(
        self,
        session_id: str,
        scene_number: int,
        element_id: str,
        language: str = "en",
        on_scene_ready: Optional[Callable] = None,
        on_status: Optional[Callable] = None,
        on_text_response: Optional[Callable] = None,
    ) -> dict:
        conv = self.get_conversation(session_id)

        clicked_scene = None
        for msg in reversed(conv.messages):
            if msg.role == "assistant":
                for s in msg.scenes:
                    if s.get("scene_number") == scene_number:
                        clicked_scene = s
                        break
                if clicked_scene:
                    break

        if not clicked_scene:
            return {"error": "Scene not found"}

        element_name = element_id or clicked_scene.get("title", "")
        detail_message = (
            f"Explain in detail: {element_name} "
            f"(from scene '{clicked_scene.get('title', '')}')"
        )

        return self.handle_message(
            session_id,
            detail_message,
            language,
            on_scene_ready=on_scene_ready,
            on_status=on_status,
            on_text_response=on_text_response,
        )

    def set_difficulty(self, session_id: str, level: str):
        conv = self.get_conversation(session_id)
        conv.set_difficulty(level)
        return {"difficulty": conv.difficulty}

    def get_progress(self, session_id: str) -> dict:
        conv = self.get_conversation(session_id)
        return conv.get_learning_progress()

    def clear_session(self, session_id: str):
        if session_id in self.sessions:
            self.sessions[session_id].clear()

    def _emit(self, callback, stage, status, message, extra=None):
        if callback:
            data = {
                "stage": stage,
                "status": status,
                "message": message,
                "timestamp": time.time(),
            }
            if extra:
                data.update(extra)
            callback(data)

    def _cleanup_frames(self):
        try:
            for item in os.listdir(str(FRAMES_DIR)):
                item_path = FRAMES_DIR / item
                if item_path.is_dir():
                    import shutil
                    shutil.rmtree(str(item_path), ignore_errors=True)
        except Exception:
            pass