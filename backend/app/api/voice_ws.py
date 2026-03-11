import os
import asyncio
from pathlib import Path
from typing import List, Dict, Any
import httpx
from dotenv import load_dotenv
from fastapi import WebSocket, WebSocketDisconnect
from openai import OpenAI, AzureOpenAI

CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parents[2]
PROJECT_ROOT = CURRENT_FILE.parents[3]

load_dotenv(BACKEND_DIR / ".env", override=True)
load_dotenv(PROJECT_ROOT / ".env", override=True)
load_dotenv(override=True)

VOICE_CONTEXT_API_URL = os.getenv("VOICE_CONTEXT_API_URL", "http://localhost:8003")

def _clean(value: str | None) -> str:
    if not value:
        return ""
    return value.strip().strip('"').strip("'")

def get_ai_client_and_model():
    azure_api_key = _clean(os.getenv("AZURE_OPENAI_API_KEY"))
    azure_endpoint = _clean(os.getenv("AZURE_OPENAI_ENDPOINT"))
    azure_deployment = _clean(
        os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT")
        or os.getenv("AZURE_OPENAI_DEPLOYMENT")
        or os.getenv("AZURE_OPENAI_MODEL")
    )
    azure_api_version = _clean(
        os.getenv("AZURE_OPENAI_API_VERSION") or "2024-02-15-preview"
    )

    if azure_api_key and azure_endpoint and azure_deployment:
        client = AzureOpenAI(
            api_key=azure_api_key,
            azure_endpoint=azure_endpoint,
            api_version=azure_api_version,
        )
        return client, azure_deployment

    openai_api_key = _clean(os.getenv("OPENAI_API_KEY"))
    openai_model = _clean(os.getenv("OPENAI_MODEL") or "gpt-4o-mini")

    if openai_api_key:
        client = OpenAI(api_key=openai_api_key)
        return client, openai_model

    raise RuntimeError(
        "No AI provider configured for voice chat. "
        "Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_CHAT_DEPLOYMENT."
    )

async def fetch_voice_context_instructions() -> str:
    default_instructions = (
        "You are a helpful AI assistant. "
        "Respond briefly and naturally. "
        "Detect the user's language and respond in the same language."
    )
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(f"{VOICE_CONTEXT_API_URL}/instructions")
            res.raise_for_status()
            data = res.json()
            return data.get("instructions", default_instructions)
    except Exception:
        return default_instructions

def generate_chat_answer(
    instructions: str,
    history: List[Dict[str, str]],
    user_text: str,
) -> str:
    client, model_name = get_ai_client_and_model()
    messages: List[Dict[str, Any]] = [{"role": "system", "content": instructions}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_text})
    response = client.chat.completions.create(
        model=model_name,
        messages=messages,
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()

async def safe_send_json(websocket: WebSocket, payload: dict) -> bool:
    try:
        await websocket.send_json(payload)
        return True
    except Exception:
        return False

async def voice_chat_ws(websocket: WebSocket):
    await websocket.accept()
    history: List[Dict[str, str]] = []

    sent = await safe_send_json(
        websocket,
        {
            "type": "connected",
            "message": "Voice chat connected",
        },
    )
    if not sent:
        return

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "ping":
                ok = await safe_send_json(websocket, {"type": "pong"})
                if not ok:
                    break
                continue

            if msg_type == "clear":
                history = []
                ok = await safe_send_json(
                    websocket,
                    {
                        "type": "cleared",
                        "message": "Conversation cleared",
                    },
                )
                if not ok:
                    break
                continue

            if msg_type != "message":
                ok = await safe_send_json(
                    websocket,
                    {
                        "type": "error",
                        "message": "Unsupported message type",
                    },
                )
                if not ok:
                    break
                continue

            user_text = (data.get("text") or "").strip()
            if not user_text:
                ok = await safe_send_json(
                    websocket,
                    {
                        "type": "error",
                        "message": "Empty message",
                    },
                )
                if not ok:
                    break
                continue

            ok = await safe_send_json(
                websocket,
                {
                    "type": "thinking",
                    "message": "Thinking...",
                },
            )
            if not ok:
                break

            instructions = await fetch_voice_context_instructions()

            try:
                answer = await asyncio.to_thread(
                    generate_chat_answer,
                    instructions,
                    history,
                    user_text,
                )
            except Exception as e:
                ok = await safe_send_json(
                    websocket,
                    {
                        "type": "error",
                        "message": str(e),
                    },
                )
                if not ok:
                    break
                continue

            history.append({"role": "user", "content": user_text})
            history.append({"role": "assistant", "content": answer})

            ok = await safe_send_json(
                websocket,
                {
                    "type": "response",
                    "text": answer,
                },
            )
            if not ok:
                break

    except WebSocketDisconnect:
        pass
    except Exception:
        pass