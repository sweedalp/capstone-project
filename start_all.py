"""
start_all.py - Start all services for D:\\capstone-project
Run: python start_all.py
"""

import subprocess
import sys
import os
import time
import threading
from pathlib import Path

BASE = Path(__file__).resolve().parent

SERVICES = [
    {
        "name": "Backend        (8000)",
        "cwd": BASE / "backend",
        "cmd": [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
    },
    {
        "name": "Whisper Agent  (8001)",
        "cwd": BASE / "ai_services" / "video_learning_whispher",
        "cmd": [sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001", "--reload"],
    },
    {
        "name": "Video Agent    (8002)",
        "cwd": BASE / "ai_services" / "ai-video-chat-agent",
        "cmd": [
            str(BASE / "ai_services" / "ai-video-chat-agent" / "venv" / "Scripts" / "python.exe"),
            "-m", "uvicorn", "api_chat:app", "--host", "0.0.0.0", "--port", "8002", "--reload"
        ],
    },
    {
        "name": "Voice API      (8003)",
        "cwd": BASE / "ai_services" / "Voice-Live-Api-main",
        "cmd": [sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8003", "--reload"],
    },
]

processes = []

def stream_output(proc, prefix):
    """Stream output from a process with a prefix label."""
    for line in iter(proc.stdout.readline, b''):
        text = line.decode('utf-8', errors='replace').rstrip()
        if text:
            print(f"[{prefix}] {text}", flush=True)

def start_services():
    for svc in SERVICES:
        cwd = svc["cwd"]
        if not cwd.exists():
            print(f"[SKIP] {svc['name']} — folder not found: {cwd}")
            continue

        print(f"[START] {svc['name']}")
        try:
            proc = subprocess.Popen(
                svc["cmd"],
                cwd=str(cwd),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
            )
            processes.append((svc["name"], proc))

            # Stream logs in background thread
            prefix = svc["name"].split("(")[0].strip().replace(" ", "_")
            t = threading.Thread(
                target=stream_output,
                args=(proc, prefix),
                daemon=True
            )
            t.start()

            time.sleep(2)
        except Exception as e:
            print(f"[ERROR] {svc['name']}: {e}")

def stop_all():
    print("\n\nStopping all services...")
    for name, proc in processes:
        try:
            proc.terminate()
            print(f"[STOP] {name}")
        except Exception:
            pass

if __name__ == "__main__":
    print("=" * 55)
    print("   AI Learning LMS — Starting All Services")
    print("=" * 55)
    print()

    start_services()

    print()
    print("=" * 55)
    print("  All services running!")
    print()
    print("  Backend:      http://localhost:8000")
    print("  Whisper:      http://localhost:8001")
    print("  Video Agent:  http://localhost:8002")
    print("  Voice API:    http://localhost:8003")


    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_all()