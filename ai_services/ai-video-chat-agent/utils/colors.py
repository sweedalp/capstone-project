"""
utils/colors.py
Color themes, utilities, and gradient generation
"""

import math

THEMES = {
    "dark_tech": {
        "bg": "#08081a",
        "card_bg": "#111130",
        "primary": "#00d4ff",
        "secondary": "#7c3aed",
        "accent": "#10b981",
        "success": "#22c55e",
        "warning": "#f59e0b",
        "danger": "#ef4444",
        "text": "#f1f5f9",
        "text_muted": "#94a3b8",
        "border": "#1e293b",
        "code_bg": "#0d1117",
        "highlight": "#1c3a5f",
        "glow": "#00d4ff",
        "particle": "#00d4ff",
        "avatar_skin": "#fbbf24",
        "avatar_body": "#3b82f6",
        "depth_shadow": "#000000",
        "depth_highlight": "#1e3a5f",
    },
    "midnight_blue": {
        "bg": "#0a0e27",
        "card_bg": "#141937",
        "primary": "#60a5fa",
        "secondary": "#a78bfa",
        "accent": "#34d399",
        "success": "#4ade80",
        "warning": "#fbbf24",
        "danger": "#f87171",
        "text": "#e2e8f0",
        "text_muted": "#94a3b8",
        "border": "#1e293b",
        "code_bg": "#0d1117",
        "highlight": "#1e3a5f",
        "glow": "#60a5fa",
        "particle": "#a78bfa",
        "avatar_skin": "#fbbf24",
        "avatar_body": "#6366f1",
        "depth_shadow": "#050820",
        "depth_highlight": "#1e3a5f",
    },
    "emerald_dark": {
        "bg": "#041010",
        "card_bg": "#0a1f1f",
        "primary": "#10b981",
        "secondary": "#06b6d4",
        "accent": "#f59e0b",
        "success": "#22c55e",
        "warning": "#f59e0b",
        "danger": "#ef4444",
        "text": "#ecfdf5",
        "text_muted": "#6ee7b7",
        "border": "#134e4a",
        "code_bg": "#0d1117",
        "highlight": "#064e3b",
        "glow": "#10b981",
        "particle": "#34d399",
        "avatar_skin": "#fbbf24",
        "avatar_body": "#059669",
        "depth_shadow": "#021010",
        "depth_highlight": "#064e3b",
    },
}


def hex_to_rgb(h):
    """Convert hex color to RGB tuple."""
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(r, g, b):
    """Convert RGB to hex string."""
    return f"#{r:02x}{g:02x}{b:02x}"


def interpolate_color(c1, c2, t):
    """Interpolate between two hex colors."""
    r1, g1, b1 = hex_to_rgb(c1) if isinstance(c1, str) else c1
    r2, g2, b2 = hex_to_rgb(c2) if isinstance(c2, str) else c2
    t = max(0.0, min(1.0, t))
    return (
        int(r1 + (r2 - r1) * t),
        int(g1 + (g2 - g1) * t),
        int(b1 + (b2 - b1) * t),
    )


def color_with_alpha(hex_color, alpha):
    """Return RGBA tuple from hex + alpha (0-255)."""
    r, g, b = hex_to_rgb(hex_color)
    return (r, g, b, int(alpha))


def brighten(hex_color, factor=1.3):
    """Brighten a color by a factor."""
    r, g, b = hex_to_rgb(hex_color)
    return (
        min(255, int(r * factor)),
        min(255, int(g * factor)),
        min(255, int(b * factor)),
    )


def darken(hex_color, factor=0.7):
    """Darken a color by a factor."""
    return brighten(hex_color, factor)


def get_gradient_colors(color1, color2, steps):
    """Generate a list of interpolated colors."""
    return [interpolate_color(color1, color2, i / max(steps - 1, 1)) for i in range(steps)]


def create_palette(theme_name="dark_tech"):
    """Get a named color palette."""
    theme = THEMES.get(theme_name, THEMES["dark_tech"])
    return {k: hex_to_rgb(v) for k, v in theme.items()}


def cycle_colors(theme, count):
    """Get cycling accent colors for items."""
    pool = [theme["primary"], theme["secondary"], theme["accent"],
            theme["success"], theme["warning"]]
    return [pool[i % len(pool)] for i in range(count)]