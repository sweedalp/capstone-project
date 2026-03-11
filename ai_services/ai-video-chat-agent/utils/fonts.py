"""
utils/fonts.py
Font management - Indian regional scripts support
"""

from PIL import ImageFont
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FONTS_DIR = BASE_DIR / "fonts"

LANG_FONTS = {
    "en": "NotoSans-Regular.ttf",
    "hi": "NotoSansDevanagari-Regular.ttf",
    "ta": "NotoSansTamil-Regular.ttf",
    "te": "NotoSansTelugu-Regular.ttf",
    "kn": "NotoSansKannada-Regular.ttf",
    "ml": "NotoSansMalayalam-Regular.ttf",
    "bn": "NotoSansBengali-Regular.ttf",
    "mr": "NotoSansDevanagari-Regular.ttf",
    "gu": "NotoSansGujarati-Regular.ttf",
    "pa": "NotoSansGurmukhi-Regular.ttf",
    "or": "NotoSansOriya-Regular.ttf",
    "as": "NotoSansBengali-Regular.ttf",
    "ur": "NotoNastaliqUrdu-Regular.ttf",
}


class FontManager:
    """Manages font loading with caching and intelligent fallbacks."""
    _cache = {}

    @classmethod
    def get_font(cls, language="en", size=40, bold=False):
        key = f"{language}_{size}_{bold}"
        if key in cls._cache:
            return cls._cache[key]
        font = cls._load(language, size, bold)
        cls._cache[key] = font
        return font

    @classmethod
    def _load(cls, language, size, bold):
        font_file = LANG_FONTS.get(language, "NotoSans-Regular.ttf")
        if bold:
            font_file = font_file.replace("-Regular", "-Bold")

        paths = [
            FONTS_DIR / font_file,
            FONTS_DIR / "NotoSans-Regular.ttf",
            FONTS_DIR / "NotoSansDevanagari-Regular.ttf",
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
            Path("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"),
            Path("/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"),
            Path("/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf"),
            Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
            Path("/System/Library/Fonts/Helvetica.ttc"),
            Path("/Library/Fonts/Arial.ttf"),
            Path("C:/Windows/Fonts/arial.ttf"),
            Path("C:/Windows/Fonts/segoeui.ttf"),
            Path("C:/Windows/Fonts/mangal.ttf"),
        ]
        for p in paths:
            if p.exists():
                try:
                    return ImageFont.truetype(str(p), size)
                except (IOError, OSError):
                    continue
        return ImageFont.load_default()

    @classmethod
    def get_font_set(cls, language="en"):
        """Get a complete set of fonts for rendering."""
        return {
            "title": cls.get_font(language, 56, True),
            "heading": cls.get_font(language, 42, True),
            "body": cls.get_font(language, 28),
            "small": cls.get_font(language, 22),
            "tiny": cls.get_font(language, 16),
            "code": cls.get_font("en", 18),
            "code_large": cls.get_font("en", 22),
            "label": cls.get_font(language, 17),
            "subtitle": cls.get_font(language, 34),
            "huge": cls.get_font(language, 72, True),
        }