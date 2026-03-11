import os
import json
import re
from pathlib import Path
from typing import Any, List, Dict, Tuple

from dotenv import load_dotenv
from openai import OpenAI, AzureOpenAI

CURRENT_DIR = Path(__file__).resolve().parent
SERVICE_ROOT = CURRENT_DIR.parent
PROJECT_ROOT = SERVICE_ROOT.parent.parent

load_dotenv(SERVICE_ROOT / ".env", override=False)
load_dotenv(PROJECT_ROOT / ".env", override=False)
load_dotenv(".env", override=False)

def _clean_env(value: str | None) -> str:
    if not value:
        return ""
    return value.strip().strip('"').strip("'")


def _get_client_and_model():
    from openai import OpenAI, AzureOpenAI

    azure_api_key = _clean_env(os.getenv("AZURE_OPENAI_API_KEY"))
    azure_endpoint = _clean_env(os.getenv("AZURE_OPENAI_ENDPOINT"))
    azure_deployment = _clean_env(os.getenv("AZURE_OPENAI_DEPLOYMENT"))
    azure_api_version = _clean_env(os.getenv("AZURE_OPENAI_API_VERSION") or "2024-02-01")

    print("DEBUG AZURE_OPENAI_API_KEY:", bool(azure_api_key))
    print("DEBUG AZURE_OPENAI_ENDPOINT:", azure_endpoint)
    print("DEBUG AZURE_OPENAI_DEPLOYMENT:", azure_deployment)
    print("DEBUG AZURE_OPENAI_API_VERSION:", azure_api_version)

    if azure_api_key and azure_endpoint and azure_deployment:
        client = AzureOpenAI(
            api_key=azure_api_key,
            api_version=azure_api_version,
            azure_endpoint=azure_endpoint,
        )
        return client, azure_deployment

    openai_api_key = _clean_env(os.getenv("OPENAI_API_KEY"))
    openai_model = _clean_env(os.getenv("OPENAI_MODEL") or "gpt-4o-mini")

    if openai_api_key:
        client = OpenAI(api_key=openai_api_key)
        return client, openai_model

    raise RuntimeError(
        "No AI provider configured.\n"
        "Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT\n"
        "or OPENAI_API_KEY"
    )

def _chat(system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str:
    client, model_name = _get_client_and_model()

    response = client.chat.completions.create(
        model=model_name,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content.strip()


def _extract_json(text: str) -> Any:
    if not text:
        return None

    cleaned = text.strip()
    cleaned = re.sub(r"^```json", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"^```", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    array_match = re.search(r"\[[\s\S]*\]", cleaned)
    if array_match:
        try:
            return json.loads(array_match.group(0))
        except Exception:
            pass

    object_match = re.search(r"\{[\s\S]*\}", cleaned)
    if object_match:
        try:
            return json.loads(object_match.group(0))
        except Exception:
            pass

    return None


def _clean_text(text: str, limit: int = 12000) -> str:
    text = (text or "").strip()
    text = re.sub(r"\s+", " ", text)
    return text[:limit]


def generate_summary(transcript: str) -> str:
    transcript = _clean_text(transcript, 15000)

    system_prompt = (
        "You are an educational summarizer. "
        "Create clear study notes from the transcript. "
        "Use short headings and concise explanations. "
        "Do not output JSON."
    )

    user_prompt = f"""
Create a high-quality study summary from this lesson transcript.

Requirements:
- Start with a short overview
- Then list key concepts
- Then important details
- Then a short recap
- Keep it easy for learners

Transcript:
{transcript}
"""
    return _chat(system_prompt, user_prompt, temperature=0.3)


def generate_quiz(transcript: str) -> List[Dict[str, Any]]:
    transcript = _clean_text(transcript, 12000)

    system_prompt = (
        "You generate multiple-choice quizzes from lesson transcripts. "
        "Return ONLY valid JSON. No markdown. No explanation outside JSON."
    )

    user_prompt = f"""
Create 5 multiple-choice quiz questions from this transcript.

Return ONLY a JSON array in this exact format:
[
  {{
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "one of the options exactly",
    "explanation": "short explanation"
  }}
]

Rules:
- Exactly 5 questions
- Exactly 4 options each
- One correct answer
- Questions must come from the transcript only
- Keep wording clear and learner-friendly

Transcript:
{transcript}
"""

    raw = _chat(system_prompt, user_prompt, temperature=0.2)
    parsed = _extract_json(raw)

    if isinstance(parsed, dict):
        parsed = parsed.get("questions") or parsed.get("quiz") or []

    if not isinstance(parsed, list):
        return []

    normalized = []
    for item in parsed:
        if not isinstance(item, dict):
            continue

        question = str(item.get("question", "")).strip()
        options = item.get("options", [])
        correct_answer = str(item.get("correct_answer", "")).strip()
        explanation = str(item.get("explanation", "")).strip()

        if not question or not isinstance(options, list):
            continue

        options = [str(opt).strip() for opt in options if str(opt).strip()]
        if len(options) < 2:
            continue

        if correct_answer and correct_answer not in options:
            correct_answer = options[0]

        normalized.append({
            "question": question,
            "options": options[:4],
            "correct_answer": correct_answer if correct_answer else options[0],
            "explanation": explanation,
        })

    return normalized


def generate_flashcards(transcript: str) -> List[Dict[str, str]]:
    transcript = _clean_text(transcript, 12000)

    system_prompt = (
        "You generate study flashcards from lesson transcripts. "
        "Return ONLY valid JSON. No markdown. No extra text."
    )

    user_prompt = f"""
Create 6 study flashcards from this transcript.

Return ONLY a JSON array in this exact format:
[
  {{
    "front": "term or question",
    "back": "definition or answer"
  }}
]

Rules:
- Exactly 6 flashcards
- Front should be short
- Back should be clear and useful
- Use only transcript content

Transcript:
{transcript}
"""

    raw = _chat(system_prompt, user_prompt, temperature=0.2)
    parsed = _extract_json(raw)

    if isinstance(parsed, dict):
        parsed = parsed.get("flashcards") or parsed.get("cards") or []

    if not isinstance(parsed, list):
        return []

    normalized = []
    for item in parsed:
        if not isinstance(item, dict):
            continue

        front = str(item.get("front", "")).strip()
        back = str(item.get("back", "")).strip()

        if front or back:
            normalized.append({
                "front": front,
                "back": back,
            })

    return normalized