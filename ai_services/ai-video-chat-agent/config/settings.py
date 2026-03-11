"""
config/settings.py
Central configuration - Indian regional languages + English
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ─── Directory Paths ─────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "output"
SCRIPTS_DIR = OUTPUT_DIR / "scripts"
AUDIO_DIR = OUTPUT_DIR / "audio"
FRAMES_DIR = OUTPUT_DIR / "frames"
VIDEOS_DIR = OUTPUT_DIR / "videos"
CLIPS_DIR = VIDEOS_DIR / "clips"
FONTS_DIR = BASE_DIR / "fonts"
STATIC_DIR = BASE_DIR / "static"
MUSIC_DIR = BASE_DIR / "music"

for d in [SCRIPTS_DIR, AUDIO_DIR, FRAMES_DIR, VIDEOS_DIR, CLIPS_DIR,
          FONTS_DIR, STATIC_DIR, MUSIC_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ─── LLM Provider ────────────────────────────────────────────────
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-06-01")
AZURE_DEPLOYMENT_GPT4O = os.getenv("AZURE_DEPLOYMENT_GPT4O", "gpt-4o")
AZURE_DEPLOYMENT_GPT4O_MINI = os.getenv("AZURE_DEPLOYMENT_GPT4O_MINI", "gpt-4o-mini")

if LLM_PROVIDER == "azure":
    LLM_MODEL = AZURE_DEPLOYMENT_GPT4O
    LLM_MODEL_MINI = AZURE_DEPLOYMENT_GPT4O_MINI
    AUDIO_MODEL = os.getenv("AZURE_DEPLOYMENT_AUDIO", "gpt-audio-mini")
    TTS_MODEL = os.getenv("AZURE_DEPLOYMENT_TTS", "gpt-audio-mini")
else:
    LLM_MODEL = "gpt-4o"
    LLM_MODEL_MINI = "gpt-4o-mini"
    AUDIO_MODEL = "gpt-audio-mini"
    TTS_MODEL = "gpt-audio-mini"

# ─── TTS Configuration ───────────────────────────────────────────
TTS_USE_CHAT_API = "audio" in TTS_MODEL.lower() or "gpt" in TTS_MODEL.lower()

# ─── Video Quality Presets ────────────────────────────────────────
VIDEO_QUALITY = os.getenv("VIDEO_QUALITY", "fast")

QUALITY_PRESETS = {
    "fast": {
        "width": 1280, "height": 720, "fps": 15,
        "bitrate": "2500k", "preset": "ultrafast",
    },
    "medium": {
        "width": 1280, "height": 720, "fps": 20,
        "bitrate": "4000k", "preset": "fast",
    },
    "high": {
        "width": 1920, "height": 1080, "fps": 24,
        "bitrate": "6000k", "preset": "medium",
    },
    "cinematic": {
        "width": 1920, "height": 1080, "fps": 30,
        "bitrate": "10000k", "preset": "slow",
    },
}

_quality = QUALITY_PRESETS.get(VIDEO_QUALITY, QUALITY_PRESETS["fast"])
VIDEO_WIDTH = _quality["width"]
VIDEO_HEIGHT = _quality["height"]
FPS = _quality["fps"]
VIDEO_BITRATE = _quality["bitrate"]
VIDEO_PRESET = _quality["preset"]
SCENE_DURATION = 30

# ─── Feature Flags ────────────────────────────────────────────────
ENABLE_PARTICLES = os.getenv("ENABLE_PARTICLES", "true").lower() == "true"
ENABLE_TRANSITIONS = os.getenv("ENABLE_TRANSITIONS", "false").lower() == "true"
ENABLE_AVATAR = os.getenv("ENABLE_AVATAR", "true").lower() == "true"
ENABLE_BACKGROUND_MUSIC = os.getenv("ENABLE_BACKGROUND_MUSIC", "false").lower() == "true"
ENABLE_3D_EFFECTS = os.getenv("ENABLE_3D_EFFECTS", "false").lower() == "true"
ENABLE_PRACTICE_MODE = os.getenv("ENABLE_PRACTICE_MODE", "true").lower() == "true"
ENABLE_INTERACTIVE_MODE = os.getenv("ENABLE_INTERACTIVE_MODE", "true").lower() == "true"
ENABLE_WEB_SEARCH = os.getenv("ENABLE_WEB_SEARCH", "false").lower() == "true"
DEFAULT_DIFFICULTY = os.getenv("DEFAULT_DIFFICULTY", "intermediate")
DEFAULT_LANGUAGE = os.getenv("DEFAULT_LANGUAGE", "en")

# ─── Difficulty Settings ──────────────────────────────────────────
DIFFICULTY_PRESETS = {
    "beginner": {
        "label": "🟢 Beginner",
        "max_scenes": 8,
        "narration_style": "simple, friendly, uses everyday analogies, avoids jargon",
        "code_complexity": "basic examples only, well-commented",
        "explanation_depth": "surface level, focus on what and why",
        "animation_speed": "fast",
        "vocabulary": "simple words, short sentences",
    },
    "intermediate": {
        "label": "🟡 Intermediate",
        "max_scenes": 12,
        "narration_style": "clear, technical but accessible, uses some jargon with explanation",
        "code_complexity": "real-world examples, moderate complexity",
        "explanation_depth": "moderate depth, covers how and trade-offs",
        "animation_speed": "fast",
        "vocabulary": "technical terms explained inline",
    },
    "advanced": {
        "label": "🔴 Advanced",
        "max_scenes": 15,
        "narration_style": "technical, concise, assumes prior knowledge",
        "code_complexity": "production-level patterns, edge cases, optimizations",
        "explanation_depth": "deep dive, internals, performance, architecture decisions",
        "animation_speed": "fast",
        "vocabulary": "full technical vocabulary",
    },
}

# ─── Language Configuration (Indian Regional + English) ───────────
LANGUAGES = {
    "en": {"name": "English", "gtts": "en", "font": "NotoSans-Regular.ttf"},
    "hi": {"name": "Hindi", "gtts": "hi", "font": "NotoSansDevanagari-Regular.ttf"},
    "ta": {"name": "Tamil", "gtts": "ta", "font": "NotoSansTamil-Regular.ttf"},
    "te": {"name": "Telugu", "gtts": "te", "font": "NotoSansTelugu-Regular.ttf"},
    "kn": {"name": "Kannada", "gtts": "kn", "font": "NotoSansKannada-Regular.ttf"},
    "ml": {"name": "Malayalam", "gtts": "ml", "font": "NotoSansMalayalam-Regular.ttf"},
    "bn": {"name": "Bengali", "gtts": "bn", "font": "NotoSansBengali-Regular.ttf"},
    "mr": {"name": "Marathi", "gtts": "mr", "font": "NotoSansDevanagari-Regular.ttf"},
    "gu": {"name": "Gujarati", "gtts": "gu", "font": "NotoSansGujarati-Regular.ttf"},
    "pa": {"name": "Punjabi", "gtts": "pa", "font": "NotoSansGurmukhi-Regular.ttf"},
    "or": {"name": "Odia", "gtts": "or", "font": "NotoSansOriya-Regular.ttf"},
    "as": {"name": "Assamese", "gtts": "as", "font": "NotoSansBengali-Regular.ttf"},
    "ur": {"name": "Urdu", "gtts": "ur", "font": "NotoNastaliqUrdu-Regular.ttf"},
}

# ─── LLM Client Singleton ────────────────────────────────────────
_client = None


def get_llm_client():
    """Get or create OpenAI/Azure client singleton."""
    global _client
    if _client:
        return _client
    from openai import OpenAI, AzureOpenAI
    if LLM_PROVIDER == "azure":
        _client = AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_version=AZURE_OPENAI_API_VERSION,
        )
    else:
        _client = OpenAI(api_key=OPENAI_API_KEY)
    return _client