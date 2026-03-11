# test_pipeline.py - Save in ai-video-chat-agent/

import traceback

print("=" * 50)
print("🔍 Testing Pipeline Step by Step")
print("=" * 50)

# ── Test 1: Config
print("\n[1/8] Config...")
try:
    from config.settings import get_llm_client, LLM_MODEL, OPENAI_API_KEY
    print(f"  ✅ Provider loaded")
    print(f"  ✅ Model: {LLM_MODEL}")
    print(f"  ✅ API Key: {'SET (' + OPENAI_API_KEY[:12] + '...)' if OPENAI_API_KEY else '❌ EMPTY!'}")
    if not OPENAI_API_KEY or OPENAI_API_KEY == "sk-proj-your-key-here":
        print("\n  ⛔ PROBLEM: Set your real API key in .env file!")
        print("  Edit .env and change OPENAI_API_KEY=sk-proj-your-real-key")
        exit(1)
except Exception as e:
    print(f"  ❌ {e}")
    traceback.print_exc()
    exit(1)

# ── Test 2: OpenAI Connection
print("\n[2/8] Testing OpenAI connection...")
try:
    client = get_llm_client()
    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": "Say 'hello' in one word"}],
        max_tokens=10,
    )
    reply = response.choices[0].message.content
    print(f"  ✅ OpenAI works! Response: {reply}")
except Exception as e:
    print(f"  ❌ OpenAI failed: {e}")
    traceback.print_exc()
    print("\n  ⛔ PROBLEM: Check your API key and internet connection")
    exit(1)

# ── Test 3: Intent Analyzer
print("\n[3/8] Intent Analyzer...")
try:
    from agents.conversation_manager import ConversationManager
    from agents.intent_analyzer import IntentAnalyzer

    conv = ConversationManager()
    analyzer = IntentAnalyzer()
    intent = analyzer.analyze("What is Python?", conv)
    print(f"  ✅ Intent: {intent.get('intent')} → {intent.get('response_type')}")
    print(f"  ✅ Scenes: {intent.get('estimated_scenes')}")
except Exception as e:
    print(f"  ❌ Intent analysis failed: {e}")
    traceback.print_exc()
    exit(1)

# ── Test 4: Script Generation
print("\n[4/8] Script Generation...")
try:
    from agents.script_agent_chat import ChatScriptAgent

    script_agent = ChatScriptAgent()
    script = script_agent.generate("What is Python?", intent, conv, "en")
    num_scenes = len(script.get("scenes", []))
    print(f"  ✅ Script generated: {num_scenes} scenes")
    for s in script["scenes"][:3]:
        print(f"     Scene {s.get('scene_number')}: {s.get('title', '')[:40]}")
except Exception as e:
    print(f"  ❌ Script generation failed: {e}")
    traceback.print_exc()
    exit(1)

# ── Test 5: TTS Audio
print("\n[5/8] Voice Generation (1 scene)...")
try:
    from agents.smart_voice_agent import SmartVoiceAgent

    voice = SmartVoiceAgent()
    scene = script["scenes"][0]
    audio = voice.generate_scene_audio(scene, "en")
    print(f"  ✅ Audio: {audio['audio_path']}")
    print(f"  ✅ Duration: {audio['duration']:.1f}s")
except Exception as e:
    print(f"  ❌ Voice generation failed: {e}")
    traceback.print_exc()
    print("\n  💡 TIP: This might be a TTS model issue. Checking gTTS fallback...")
    try:
        from gtts import gTTS
        gTTS(text="test", lang="en").save("output/audio/test.mp3")
        print("  ✅ gTTS fallback works")
    except Exception as e2:
        print(f"  ❌ gTTS also failed: {e2}")
    exit(1)

# ── Test 6: Animation
print("\n[6/8] Animation Rendering (1 scene)...")
try:
    from agents.animation_agent_enhanced import EnhancedAnimationAgent

    animator = EnhancedAnimationAgent(theme="dark_tech", quality="fast")
    frame_data = animator.render_scene(scene, audio, "en")
    print(f"  ✅ Frames: {frame_data['frame_count']} frames in {frame_data['frames_dir']}")
except Exception as e:
    print(f"  ❌ Animation failed: {e}")
    traceback.print_exc()
    exit(1)

# ── Test 7: Video Compilation
print("\n[7/8] Building scene clip...")
try:
    from pipeline.scene_streamer import SceneStreamer

    streamer = SceneStreamer()
    clip = streamer.build_scene_clip(
        scene_num=1,
        frames_dir=frame_data["frames_dir"],
        audio_path=audio["audio_path"],
        duration=audio["duration"],
        job_id="test_001",
    )
    print(f"  ✅ Clip built: {clip['size_kb']:.0f} KB, {clip['duration']:.1f}s")
    print(f"  ✅ Build time: {clip['build_time']:.1f}s")
except Exception as e:
    print(f"  ❌ Clip building failed: {e}")
    traceback.print_exc()
    print("\n  💡 TIP: Make sure ffmpeg is installed: brew install ffmpeg")
    exit(1)

# ── Test 8: Full Pipeline
print("\n[8/8] Full Pipeline (single question)...")
try:
    from agents.orchestrator_chat import ChatOrchestrator

    orch = ChatOrchestrator(quality="fast")
    result = orch.handle_message(
        session_id="test",
        user_message="What is Python?",
        language="en",
        on_scene_ready=lambda d: print(
            f"     ▶ Scene {d['scene_number']}/{d.get('total_scenes', '?')}: "
            f"{d.get('title', '')[:30]}"
        ),
        on_status=lambda d: print(f"     📋 {d.get('message', '')}"),
        on_text_response=lambda t: print(f"     🤖 {t}"),
    )
    print(f"\n  ✅ Video: {result['video_path']}")
    print(f"  ✅ {result['total_scenes']} scenes, {result['total_duration']:.0f}s")
    print(f"  ✅ Processing time: {result['processing_time']:.1f}s")
except Exception as e:
    print(f"  ❌ Full pipeline failed: {e}")
    traceback.print_exc()
    exit(1)

print("\n" + "=" * 50)
print("🎉 ALL TESTS PASSED! Your pipeline works!")
print("=" * 50)
print("\nNow run: python main.py --api")
print("Then open: http://localhost:8000")