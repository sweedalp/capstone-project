"""
agents/conversation_manager.py
Manages conversation history, code memory, diagram memory, and context
"""

import json
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ChatMessage:
    """Single message in the conversation."""
    role: str
    content: str
    timestamp: str = ""
    video_id: str = ""
    scenes: list = field(default_factory=list)
    code_blocks: list = field(default_factory=list)
    diagrams: list = field(default_factory=list)
    topics: list = field(default_factory=list)
    difficulty: str = "intermediate"
    practice: dict = field(default_factory=dict)
    interactive_elements: list = field(default_factory=list)


class ConversationManager:
    """
    Tracks full conversation state including:
    - Message history
    - Code snippets shown
    - Diagrams rendered
    - Topics covered
    - Practice exercises generated
    - Difficulty preferences
    """

    def __init__(self):
        self.messages: List[ChatMessage] = []
        self.code_memory: Dict[str, dict] = {}
        self.diagram_memory: Dict[str, dict] = {}
        self.topic_history: List[str] = []
        self.practice_history: List[dict] = []
        self.difficulty: str = "intermediate"
        self.interaction_count: int = 0
        self.session_start: str = datetime.now().isoformat()

    def add_user_message(self, content: str) -> ChatMessage:
        """Record a user message."""
        msg = ChatMessage(
            role="user",
            content=content,
            timestamp=datetime.now().isoformat(),
            difficulty=self.difficulty,
        )
        self.messages.append(msg)
        self.interaction_count += 1
        return msg

    def add_assistant_message(
        self,
        content: str,
        video_id: str = "",
        scenes: list = None,
        code_blocks: list = None,
        diagrams: list = None,
        topics: list = None,
        practice: dict = None,
        interactive_elements: list = None,
    ) -> ChatMessage:
        """Record an assistant response with metadata."""
        msg = ChatMessage(
            role="assistant",
            content=content,
            timestamp=datetime.now().isoformat(),
            video_id=video_id,
            scenes=scenes or [],
            code_blocks=code_blocks or [],
            diagrams=diagrams or [],
            topics=topics or [],
            difficulty=self.difficulty,
            practice=practice or {},
            interactive_elements=interactive_elements or [],
        )
        self.messages.append(msg)

        # Update memory stores
        for cb in (code_blocks or []):
            key = f"code_{len(self.code_memory) + 1}"
            self.code_memory[key] = cb

        for dg in (diagrams or []):
            key = f"diag_{len(self.diagram_memory) + 1}"
            self.diagram_memory[key] = dg

        for t in (topics or []):
            if t not in self.topic_history:
                self.topic_history.append(t)

        if practice:
            self.practice_history.append(practice)

        return msg

    def get_chat_history_for_llm(self, max_messages: int = 15) -> list:
        """Build message list for LLM context window."""
        history = []
        for msg in self.messages[-max_messages:]:
            content = msg.content

            if msg.role == "assistant" and msg.scenes:
                scene_summary = "\n".join(
                    f"- Scene {s.get('scene_number', '?')}: "
                    f"{s.get('title', '')} [{s.get('animation_type', '')}]"
                    for s in msg.scenes[:8]
                )
                content += f"\n[Video scenes created:\n{scene_summary}]"

            if msg.role == "assistant" and msg.code_blocks:
                for cb in msg.code_blocks[:3]:
                    if isinstance(cb, dict):
                        code_preview = "\n".join(cb.get("lines", [])[:8])
                        lang = cb.get("language", "python")
                    else:
                        code_preview = str(cb)[:200]
                        lang = "code"
                    content += f"\n[Code shown ({lang}):\n```\n{code_preview}\n```]"

            if msg.role == "assistant" and msg.diagrams:
                for dg in msg.diagrams[:2]:
                    if isinstance(dg, dict):
                        dtype = dg.get("type", "diagram")
                        comps = [c.get("name", "") if isinstance(c, dict) else str(c) for c in
                                 dg.get("components", [])[:5]]
                    else:
                        dtype = "diagram"
                        comps = []
                    content += f"\n[Diagram ({dtype}): {', '.join(comps)}]"

            if msg.role == "assistant" and msg.practice:
                ptype = msg.practice.get("type", "exercise") if isinstance(msg.practice, dict) else "exercise"
                content += f"\n[Practice exercise generated: {ptype}]"

            history.append({"role": msg.role, "content": content})

        return history

    def get_context_summary(self) -> str:
        """Build a concise context summary for the LLM."""
        parts = []

        if self.topic_history:
            parts.append(f"Topics discussed: {', '.join(self.topic_history[-10:])}")

        if self.code_memory:
            code_summaries = []
            for cid, c in list(self.code_memory.items())[-5:]:
                if isinstance(c, dict):
                    preview = (c.get("lines", [""])[0] if c.get("lines") else "")[:60]
                    lang = c.get("language", "")
                else:
                    preview = str(c)[:60]
                    lang = ""
                code_summaries.append(f"{cid} ({lang}): {preview}...")
            parts.append("Code shown:\n" + "\n".join(code_summaries))

        if self.diagram_memory:
            diag_summaries = []
            for did, d in list(self.diagram_memory.items())[-3:]:
                dtype = d.get("type", "diagram") if isinstance(d, dict) else "diagram"
                diag_summaries.append(f"{did}: {dtype}")
            parts.append("Diagrams: " + ", ".join(diag_summaries))

        if self.practice_history:
            parts.append(
                f"Practice exercises given: {len(self.practice_history)}"
            )

        parts.append(f"Difficulty: {self.difficulty}")
        parts.append(f"Interactions: {self.interaction_count}")

        return "\n".join(parts) if parts else "New conversation, no context yet."

    def get_last_code(self) -> Optional[dict]:
        """Get the most recently shown code block."""
        if self.code_memory:
            return list(self.code_memory.values())[-1]
        return None

    def get_last_diagram(self) -> Optional[dict]:
        """Get the most recently shown diagram."""
        if self.diagram_memory:
            return list(self.diagram_memory.values())[-1]
        return None

    def set_difficulty(self, level: str):
        """Set the difficulty level."""
        if level in ("beginner", "intermediate", "advanced"):
            self.difficulty = level

    def get_learning_progress(self) -> dict:
        """Get a summary of learning progress."""
        return {
            "topics_covered": len(self.topic_history),
            "code_examples": len(self.code_memory),
            "diagrams_seen": len(self.diagram_memory),
            "practices_done": len(self.practice_history),
            "interactions": self.interaction_count,
            "difficulty": self.difficulty,
            "session_duration": self.session_start,
        }

    def clear(self):
        """Reset all conversation state."""
        self.messages.clear()
        self.code_memory.clear()
        self.diagram_memory.clear()
        self.topic_history.clear()
        self.practice_history.clear()
        self.interaction_count = 0