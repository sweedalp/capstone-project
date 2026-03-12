"""
main.py
Entry point for the AI Video Chat Agent
Supports: web server, CLI chat, single question mode
"""

import argparse
import sys


def main():
    parser = argparse.ArgumentParser(
        description="🎬 AI Video Chat Agent - Animated explainer video generator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --api                        Start web server
  python main.py --api --quality cinematic    High quality mode
  python main.py -q "What is MCP?" -l en      Single question
  python main.py                              Interactive CLI chat

Quality options: fast, medium, high, cinematic
        """,
    )

    parser.add_argument(
        "--api", action="store_true",
        help="Start the web chat server",
    )
    parser.add_argument(
        "--question", "-q", type=str,
        help="Single question to answer",
    )
    parser.add_argument(
        "--language", "-l", default="en",
        help="Language code (en, hi, es, fr, ta, de, ja, etc.)",
    )
    parser.add_argument(
        "--quality", default="medium",
        choices=["fast", "medium", "high", "cinematic"],
        help="Video quality preset",
    )
    parser.add_argument(
        "--difficulty", "-d", default="intermediate",
        choices=["beginner", "intermediate", "advanced"],
        help="Explanation difficulty level",
    )
    parser.add_argument(
        "--port", type=int, default=8002,
        help="Server port (default: 8002)",
    )
    parser.add_argument(
        "--host", default="0.0.0.0",
        help="Server host (default: 0.0.0.0)",
    )

    args = parser.parse_args()

    if args.api:
        _start_server(args)
    elif args.question:
        _single_question(args)
    else:
        _interactive_cli(args)


def _start_server(args):
    """Start the FastAPI web server."""
    import uvicorn

    banner = f"""
╔══════════════════════════════════════════════════════╗
║          🎬  AI VIDEO CHAT AGENT  v2.0              ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  🌐  URL:    http://localhost:{args.port:<24}║
║  📊  Quality: {args.quality:<37}║
║  🎯  Difficulty: {args.difficulty:<33}║
║                                                      ║
║  💬  Chat → Get animated video explanations!         ║
║  🔄  Follow-ups work — AI remembers context!         ║
║  🎯  Practice exercises auto-generated!              ║
║  🖱️   Click scenes for interactive deep-dives!       ║
║                                                      ║
║  Features:                                           ║
║  • 🎨  Cinematic animations & 3D effects             ║
║  • 🧑‍🏫  Animated avatar presenter                     ║
║  • ✨  Particle effects & smooth transitions          ║
║  • 🌍  Multilingual voice (text stays English)       ║
║  • 🚗  Creative metaphors (car, tree, brain...)      ║
║  • 📝  Auto practice quiz generation                 ║
║  • 🎵  Background music support                      ║
║  • 🟢🟡🔴  Difficulty levels                          ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
"""
    print(banner)

    uvicorn.run(
        "api_chat:app",
        host=args.host,
        port=args.port,
        reload=True,
        log_level="info",
    )


def _single_question(args):
    """Answer a single question and generate video."""
    from agents.orchestrator_chat import ChatOrchestrator

    orch = ChatOrchestrator(quality=args.quality)
    orch.set_difficulty("cli", args.difficulty)

    print(f"\n🎬 Generating video for: {args.question}")
    print(f"   Language: {args.language} | Quality: {args.quality} | "
          f"Difficulty: {args.difficulty}\n")

    result = orch.handle_message(
        "cli",
        args.question,
        args.language,
        difficulty=args.difficulty,
        on_scene_ready=lambda d: print(
            f"  ▶ Scene {d['scene_number']}/{d.get('total_scenes', '?')}: "
            f"{d.get('title', '')}"
        ),
        on_status=lambda d: print(f"  📋 {d.get('message', '')}"),
        on_text_response=lambda t: print(f"\n🤖 {t}\n"),
    )

    print(f"\n{'━' * 50}")
    print(f"🎬 Video saved: {result['video_path']}")
    print(f"📊 {result['total_scenes']} scenes, "
          f"{result['total_duration']:.0f}s duration")
    print(f"⏱  {result['processing_time']:.1f}s processing time")

    if result.get("practice"):
        practice = result["practice"]
        print(f"\n🎯 Practice Exercise:")
        print(f"   Type: {practice.get('type', 'exercise')}")
        print(f"   Q: {practice.get('question', '')}")
        options = practice.get("options", [])
        for opt in options:
            print(f"     {opt}")
        print(f"   Answer: {practice.get('correct_answer', '')}")

    print(f"{'━' * 50}\n")


def _interactive_cli(args):
    """Interactive CLI chat mode."""
    from agents.orchestrator_chat import ChatOrchestrator

    orch = ChatOrchestrator(quality=args.quality)
    sid = "cli"
    orch.set_difficulty(sid, args.difficulty)

    print(f"""
╔══════════════════════════════════════════════════════╗
║       🎬  AI Video Chat - Interactive CLI            ║
╠══════════════════════════════════════════════════════╣
║  Commands:                                           ║
║    quit/exit  - Exit the chat                        ║
║    clear      - Reset conversation                   ║
║    beginner   - Set beginner difficulty               ║
║    intermediate - Set intermediate difficulty         ║
║    advanced   - Set advanced difficulty               ║
║    progress   - Show learning progress               ║
║    practice   - Request a practice exercise          ║
║                                                      ║
║  Quality: {args.quality:<42}║
║  Difficulty: {args.difficulty:<39}║
╚══════════════════════════════════════════════════════╝
""")

    while True:
        try:
            question = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n👋 Goodbye!")
            break

        if not question:
            continue

        lower = question.lower()

        if lower in ("quit", "exit", "q"):
            print("👋 Goodbye!")
            break

        if lower == "clear":
            orch.clear_session(sid)
            print("🤖 Chat cleared! Ask a new question.\n")
            continue

        if lower in ("beginner", "intermediate", "advanced"):
            orch.set_difficulty(sid, lower)
            print(f"🎯 Difficulty set to {lower}\n")
            continue

        if lower == "progress":
            prog = orch.get_progress(sid)
            print(f"\n📊 Learning Progress:")
            print(f"   Topics covered: {prog.get('topics_covered', 0)}")
            print(f"   Code examples: {prog.get('code_examples', 0)}")
            print(f"   Diagrams seen: {prog.get('diagrams_seen', 0)}")
            print(f"   Practices done: {prog.get('practices_done', 0)}")
            print(f"   Interactions: {prog.get('interactions', 0)}")
            print(f"   Difficulty: {prog.get('difficulty', 'intermediate')}\n")
            continue

        if lower == "practice":
            question = "Give me a practice exercise about what we just discussed"

        print()

        result = orch.handle_message(
            sid, question, args.language,
            on_scene_ready=lambda d: print(
                f"  ▶ Scene {d['scene_number']}/{d.get('total_scenes', '?')}: "
                f"{d.get('title', '')}"
            ),
            on_status=lambda d: print(f"  📋 {d.get('message', '')}"),
            on_text_response=lambda t: print(f"🤖 {t}"),
        )

        print(f"\n  🎬 Video: {result['video_path']}")
        print(f"  📊 {result['total_scenes']} scenes, "
              f"{result['total_duration']:.0f}s")

        if result.get("practice"):
            p = result["practice"]
            print(f"\n  🎯 Practice: {p.get('question', '')}")
            for opt in p.get("options", []):
                print(f"     {opt}")
            print(f"  💡 Hint: {p.get('hint', '')}")

        print()


if __name__ == "__main__":
    main()