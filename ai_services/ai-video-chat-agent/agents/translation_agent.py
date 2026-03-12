"""
agents/translation_agent.py
Translates ONLY voice narration, keeps on-screen text in English
"""

import json
from deep_translator import GoogleTranslator
from config.settings import LANGUAGES, SCRIPTS_DIR


class TranslationAgent:
    """
    Translates narration for voice-over only.
    On-screen text (titles, key_points, code) stays in English.
    """

    def __init__(self):
        pass

    def translate_for_voice(self, script: dict, target_lang: str) -> dict:
        """
        Translate only the narration fields for voice generation.
        Sets 'voice_narration' field on each scene.
        On-screen text remains English.
        """
        if target_lang == "en":
            for scene in script.get("scenes", []):
                scene["voice_narration"] = scene.get("narration", "")
            return script

        lang_name = LANGUAGES.get(target_lang, {}).get("name", target_lang)
        print(f"  🌍 Translating narration to {lang_name}...")

        for scene in script.get("scenes", []):
            original = scene.get("narration", "")
            if original:
                translated = self._translate_text(original, target_lang)
                scene["voice_narration"] = translated
            else:
                scene["voice_narration"] = ""

        # Translate summary for voice
        summary = script.get("summary", "")
        if summary:
            script["voice_summary"] = self._translate_text(summary, target_lang)

        return script

    def translate_full_script(self, script: dict, target_lang: str) -> dict:
        """
        Full translation of everything (for subtitle mode if needed).
        Usually NOT called — use translate_for_voice instead.
        """
        if target_lang == "en":
            return script

        lang_name = LANGUAGES.get(target_lang, {}).get("name", target_lang)
        print(f"  🌍 Full translation to {lang_name}...")

        translated = json.loads(json.dumps(script))
        translated["language"] = target_lang
        translated["title"] = self._translate_text(script["title"], target_lang)
        translated["summary"] = self._translate_text(
            script.get("summary", ""), target_lang
        )

        for i, scene in enumerate(translated["scenes"]):
            original = script["scenes"][i]
            scene["title"] = self._translate_text(original["title"], target_lang)
            scene["narration"] = self._translate_text(
                original["narration"], target_lang
            )
            scene["voice_narration"] = scene["narration"]
            scene["key_points"] = [
                self._translate_text(p, target_lang)
                for p in original.get("key_points", [])
            ]

        return translated

    def _translate_text(self, text: str, lang: str) -> str:
        """Translate a single text string."""
        if not text or not text.strip():
            return text
        try:
            target_code = LANGUAGES.get(lang, {}).get("gtts", lang)
            # GoogleTranslator uses 2-letter codes
            target_code = target_code.split("-")[0]
            result = GoogleTranslator(
                source="en", target=target_code
            ).translate(text)
            return result or text
        except Exception as e:
            print(f"  ⚠️ Translation failed: {e}")
            return text