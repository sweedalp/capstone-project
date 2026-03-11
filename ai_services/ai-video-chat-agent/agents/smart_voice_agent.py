"""
agents/smart_voice_agent.py
TTS with gpt-audio-mini support + Indian language voices
Falls back: gpt-audio-mini → tts-1 → gTTS
"""

import base64
from pathlib import Path
from config.settings import (
    get_llm_client, TTS_MODEL, AUDIO_MODEL,
    LANGUAGES, AUDIO_DIR, TTS_USE_CHAT_API,
)


class SmartVoiceAgent:
    """
    Generates voice narration using:
    1. gpt-audio-mini (Chat Completions with audio modality)
    2. tts-1 fallback (audio.speech.create)
    3. gTTS fallback (Google TTS - best for Indian languages)
    """

    # Voice mapping for Indian languages
    VOICES = {
        "en": "alloy",
        "hi": "nova",
        "ta": "shimmer",
        "te": "shimmer",
        "kn": "alloy",
        "ml": "shimmer",
        "bn": "nova",
        "mr": "nova",
        "gu": "nova",
        "pa": "nova",
        "or": "shimmer",
        "as": "shimmer",
        "ur": "echo",
    }

    TONE_INSTRUCTIONS = {
        "hook": "Speak with excitement and energy to grab attention.",
        "introduction": "Speak warmly and clearly to welcome the listener.",
        "concept_intro": "Speak with curiosity and clarity.",
        "explanation": "Speak at a natural, moderate pace like a patient teacher.",
        "deep_dive": "Speak methodically, emphasizing key technical terms.",
        "code_walkthrough": "Speak carefully, pausing at technical terms.",
        "line_detail": "Speak slowly and precisely.",
        "example": "Speak conversationally, like sharing a story.",
        "comparison": "Speak analytically, highlighting differences.",
        "why_explanation": "Speak with conviction, explaining reasoning.",
        "summary": "Speak warmly, wrapping up confidently.",
        "process_flow": "Speak step by step with clear transitions.",
        "practice": "Speak encouragingly, like a coach.",
    }

    def __init__(self):
        self.client = get_llm_client()

    def generate_scene_audio(self, scene, language="en", mood="calm"):
        """Generate audio for a scene. Tries multiple TTS methods."""
        sn = scene["scene_number"]
        narration = scene.get("voice_narration", scene.get("narration", ""))
        if not narration:
            narration = scene.get("title", f"Scene {sn}")

        voice = self.VOICES.get(language, "alloy")
        scene_type = scene.get("scene_type", "explanation")
        fname = f"scene_{sn}_{language}.mp3"
        audio_path = AUDIO_DIR / fname

        success = False

        # For Indian languages other than English, gTTS often works best
        # because OpenAI TTS has limited Indian language support
        is_indian_lang = language in (
            "hi", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa", "or", "as", "ur"
        )

        if is_indian_lang:
            success = self._gtts_generate(narration, audio_path, language)
            if not success and TTS_USE_CHAT_API:
                success = self._generate_with_chat_audio(
                    narration, audio_path, voice, scene_type
                )
            if not success:
                success = self._generate_with_tts1(narration, audio_path, voice)
        else:
            # English: Try gTTS first (most reliable), then OpenAI
            success = self._gtts_generate(narration, audio_path, language)
            if not success and TTS_USE_CHAT_API:
                success = self._generate_with_chat_audio(
                    narration, audio_path, voice, scene_type
                )
            if not success:
                success = self._generate_with_tts1(narration, audio_path, voice)
        # Final fallback
        if not success:
            self._create_silent_audio(audio_path)

        duration = self._get_duration(audio_path)

        # Speed up if audio is too long
        if duration > 25:
            duration = self._speed_up_audio(audio_path, 1.2)

        return {
            "scene_number": sn,
            "audio_path": str(audio_path),
            "language": language,
            "duration": duration,
        }

    def _generate_with_chat_audio(self, text, audio_path, voice, scene_type):
        """
        Generate audio using gpt-audio-mini via Chat Completions API.
        This model supports audio output modality.
        """
        tone = self.TONE_INSTRUCTIONS.get(scene_type, "Speak clearly and naturally.")

        try:
            response = self.client.chat.completions.create(
                model=TTS_MODEL,
                modalities=["text", "audio"],
                audio={
                    "voice": voice,
                    "format": "mp3",
                },
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"You are a professional narrator for educational videos. "
                            f"{tone} "
                            f"Read the following text naturally with good pacing. "
                            f"Do NOT add any extra words or commentary. "
                            f"Just read the exact text provided."
                        ),
                    },
                    {
                        "role": "user",
                        "content": text,
                    },
                ],
            )

            # Extract audio data from response
            audio_data = None
            msg = response.choices[0].message

            if hasattr(msg, 'audio') and msg.audio:
                audio_obj = msg.audio
                if hasattr(audio_obj, 'data') and audio_obj.data:
                    audio_data = audio_obj.data
                elif isinstance(audio_obj, dict) and 'data' in audio_obj:
                    audio_data = audio_obj['data']

            if audio_data:
                audio_bytes = base64.b64decode(audio_data)
                with open(str(audio_path), "wb") as f:
                    f.write(audio_bytes)
                print(f"    🔊 TTS: gpt-audio-mini ({voice})")
                return True
            else:
                print(f"    ⚠️ gpt-audio-mini: No audio data in response")
                return False

        except Exception as e:
            error_msg = str(e)
            if "404" in error_msg:
                print(f"    ⚠️ gpt-audio-mini model not found")
            elif "modalities" in error_msg.lower():
                print(f"    ⚠️ gpt-audio-mini: audio modality not supported")
            else:
                print(f"    ⚠️ gpt-audio-mini failed: {e}")
            return False

    def _generate_with_tts1(self, text, audio_path, voice):
        """Fallback to standard tts-1 model."""
        try:
            response = self.client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=text,
                response_format="mp3",
                speed=1.15,
            )
            response.stream_to_file(str(audio_path))
            print(f"    🔊 TTS: tts-1 ({voice})")
            return True
        except Exception as e:
            print(f"    ⚠️ tts-1 failed: {e}")
            return False

    def _gtts_generate(self, text, path, language):
        """Google TTS - works well for Indian languages."""
        try:
            from gtts import gTTS

            lang_code = LANGUAGES.get(language, {}).get("gtts", "en")
            tts = gTTS(text=text, lang=lang_code, slow=False)
            tts.save(str(path))
            print(f"    🔊 TTS: gTTS ({lang_code})")

            # Speed up gTTS output (it's naturally slow)
            self._speed_up_audio(path, 1.2)
            return True
        except Exception as e:
            print(f"    ⚠️ gTTS failed for {language}: {e}")
            return False

    def _speed_up_audio(self, path, speed_factor):
        """Speed up audio file using pydub."""
        try:
            from pydub import AudioSegment

            audio = AudioSegment.from_mp3(str(path))
            faster = audio._spawn(audio.raw_data, overrides={
                "frame_rate": int(audio.frame_rate * speed_factor)
            }).set_frame_rate(audio.frame_rate)
            faster.export(str(path), format="mp3")
            return len(faster) / 1000.0
        except Exception:
            return self._get_duration(path)

    def _create_silent_audio(self, path):
        """Create silent audio as last resort."""
        try:
            from pydub import AudioSegment
            silence = AudioSegment.silent(duration=3000)
            silence.export(str(path), format="mp3")
        except Exception:
            Path(path).write_bytes(b'\xff\xfb\x90\x00' * 500)

    def _get_duration(self, path):
        """Get audio duration in seconds."""
        try:
            from pydub import AudioSegment
            return len(AudioSegment.from_mp3(str(path))) / 1000.0
        except Exception:
            return 8.0

    def transcribe_voice_input(self, audio_path):
        """Transcribe audio using Whisper."""
        try:
            with open(audio_path, "rb") as f:
                result = self.client.audio.transcriptions.create(
                    model="whisper-1", file=f, response_format="text",
                )
            return result.strip() if isinstance(result, str) else str(result)
        except Exception:
            return ""