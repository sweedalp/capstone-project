"""
debug.py - Run this to find import errors
"""

import sys
import traceback

print("Python:", sys.version)
print("Working dir:", __import__('os').getcwd())
print()

modules = [
    ("dotenv", "from dotenv import load_dotenv"),
    ("config.settings", "from config.settings import STATIC_DIR, VIDEOS_DIR, BASE_DIR"),
    ("utils.fonts", "from utils.fonts import FontManager"),
    ("utils.colors", "from utils.colors import THEMES"),
    ("utils.knowledge", "from utils.knowledge import fetch_wikipedia_summary"),
    ("utils.particles", "from utils.particles import ParticleSystem"),
    ("utils.transitions", "from utils.transitions import TransitionEngine"),
    ("PIL", "from PIL import Image, ImageDraw, ImageFont"),
    ("animations.effects", "from animations.effects import ease_out_cubic"),
    ("animations.diagram_renderer", "from animations.diagram_renderer import render_architecture"),
    ("animations.flow_renderer", "from animations.flow_renderer import render_flowchart"),
    ("animations.connection_renderer", "from animations.connection_renderer import render_code_block"),
    ("animations.metaphor_renderer", "from animations.metaphor_renderer import render_metaphor"),
    ("animations.avatar_renderer", "from animations.avatar_renderer import AvatarRenderer"),
    ("animations.cinematic", "from animations.cinematic import CinematicPipeline"),
    ("animations.three_d_effects", "from animations.three_d_effects import DepthRenderer"),
    ("agents.conversation_manager", "from agents.conversation_manager import ConversationManager"),
    ("agents.intent_analyzer", "from agents.intent_analyzer import IntentAnalyzer"),
    ("agents.script_agent_chat", "from agents.script_agent_chat import ChatScriptAgent"),
    ("agents.smart_voice_agent", "from agents.smart_voice_agent import SmartVoiceAgent"),
    ("agents.translation_agent", "from agents.translation_agent import TranslationAgent"),
    ("agents.animation_agent_enhanced", "from agents.animation_agent_enhanced import EnhancedAnimationAgent"),
    ("agents.video_compiler", "from agents.video_compiler import VideoCompiler"),
    ("pipeline.scene_streamer", "from pipeline.scene_streamer import SceneStreamer"),
    ("agents.orchestrator_chat", "from agents.orchestrator_chat import ChatOrchestrator"),
    ("api_chat", "from api_chat import app"),
]

for name, import_stmt in modules:
    try:
        exec(import_stmt)
        print(f"  ✅ {name}")
    except Exception as e:
        print(f"  ❌ {name}: {e}")
        traceback.print_exc()
        print()
        print(f"  ⛔ Fix {name} first, then re-run this script.")
        break

print("\n✅ If all green, run: python main.py --api")