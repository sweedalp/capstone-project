"""
animations/cinematic.py
Cinematic effects: vignette, lens flare, film grain, letterbox, glow
"""

import math
import random
from PIL import Image, ImageDraw, ImageFilter
from utils.colors import hex_to_rgb


def apply_vignette(img, intensity=0.4):
    """Apply dark vignette effect around edges."""
    w, h = img.size
    vignette = Image.new("L", (w, h), 255)
    vd = ImageDraw.Draw(vignette)

    cx, cy = w // 2, h // 2
    max_dist = math.sqrt(cx ** 2 + cy ** 2)

    steps = 20
    for i in range(steps):
        r = max_dist * (1 - i / steps)
        alpha = int(255 * (1 - intensity * (i / steps) ** 2))
        vd.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=alpha,
        )

    # Blur for smooth gradient
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=40))

    result = img.copy()
    black = Image.new("RGB", (w, h), (0, 0, 0))
    result = Image.composite(result, black, vignette)
    return result


def apply_letterbox(img, bar_height=50):
    """Add cinematic letterbox bars."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    draw.rectangle([0, 0, w, bar_height], fill=(0, 0, 0))
    draw.rectangle([0, h - bar_height, w, h], fill=(0, 0, 0))
    return img


def apply_film_grain(img, intensity=15, progress=0.0):
    """Add subtle film grain noise."""
    w, h = img.size
    result = img.copy()
    pixels = result.load()

    random.seed(int(progress * 1000))

    sample_rate = 4
    for y in range(0, h, sample_rate):
        for x in range(0, w, sample_rate):
            noise = random.randint(-intensity, intensity)
            try:
                r, g, b = pixels[x, y]
                pixels[x, y] = (
                    max(0, min(255, r + noise)),
                    max(0, min(255, g + noise)),
                    max(0, min(255, b + noise)),
                )
            except (IndexError, TypeError):
                pass

    return result


def apply_bloom(img, threshold=200, radius=8, intensity=0.3):
    """Apply bloom/glow effect on bright areas."""
    w, h = img.size

    # Extract bright areas
    bright = img.copy()
    bp = bright.load()
    for y in range(h):
        for x in range(w):
            try:
                r, g, b = bp[x, y]
                brightness = (r + g + b) / 3
                if brightness < threshold:
                    bp[x, y] = (0, 0, 0)
            except (IndexError, TypeError):
                pass

    # Blur bright areas
    bloom_layer = bright.filter(ImageFilter.GaussianBlur(radius=radius))

    # Blend
    return Image.blend(img, bloom_layer, intensity)


def draw_lens_flare(draw, x, y, radius, color_hex, progress):
    """Draw animated lens flare effect."""
    c = hex_to_rgb(color_hex) if isinstance(color_hex, str) else color_hex
    pulse = 0.7 + 0.3 * math.sin(progress * math.pi * 4)

    # Core
    core_r = int(radius * 0.3 * pulse)
    draw.ellipse(
        [x - core_r, y - core_r, x + core_r, y + core_r],
        fill=(255, 255, 255),
    )

    # Inner ring
    r1 = int(radius * 0.6 * pulse)
    draw.ellipse(
        [x - r1, y - r1, x + r1, y + r1],
        outline=c, width=2,
    )

    # Outer ring
    r2 = int(radius * pulse)
    dim = tuple(v // 2 for v in c)
    draw.ellipse(
        [x - r2, y - r2, x + r2, y + r2],
        outline=dim, width=1,
    )

    # Rays
    num_rays = 6
    for i in range(num_rays):
        angle = (2 * math.pi * i / num_rays) + progress * 0.5
        ray_len = int(radius * 1.5 * pulse)
        rx = x + int(ray_len * math.cos(angle))
        ry = y + int(ray_len * math.sin(angle))
        draw.line([(x, y), (rx, ry)], fill=dim, width=1)


def draw_spotlight(draw, cx, cy, radius, color_hex, intensity=0.5):
    """Draw a subtle spotlight effect."""
    c = hex_to_rgb(color_hex) if isinstance(color_hex, str) else color_hex
    for i in range(5):
        r = radius - i * (radius // 6)
        alpha_c = tuple(max(0, int(v * intensity * (1 - i / 5))) for v in c)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=alpha_c, width=2)


def apply_color_grade(img, tone="cool"):
    """Apply color grading to the frame."""
    result = img.copy()
    pixels = result.load()
    w, h = result.size

    sample = 3
    for y in range(0, h, sample):
        for x in range(0, w, sample):
            try:
                r, g, b = pixels[x, y]
                if tone == "cool":
                    r = max(0, r - 5)
                    b = min(255, b + 8)
                elif tone == "warm":
                    r = min(255, r + 8)
                    b = max(0, b - 5)
                elif tone == "cinematic":
                    r = int(r * 0.95)
                    g = int(g * 0.97)
                    b = min(255, int(b * 1.05))
                pixels[x, y] = (r, g, b)
            except (IndexError, TypeError):
                pass
    return result


class CinematicPipeline:
    """Apply a chain of cinematic effects to frames."""

    def __init__(self, enable_vignette=True, enable_grain=False,
                 enable_letterbox=False, enable_bloom=False,
                 color_grade="cinematic"):
        self.enable_vignette = enable_vignette
        self.enable_grain = enable_grain
        self.enable_letterbox = enable_letterbox
        self.enable_bloom = enable_bloom
        self.color_grade = color_grade

    def process(self, frame, progress=0.0):
        """Apply all enabled effects."""
        result = frame

        if self.enable_bloom:
            result = apply_bloom(result, threshold=200, radius=6,
                                 intensity=0.15)

        if self.enable_vignette:
            result = apply_vignette(result, intensity=0.3)

        if self.color_grade:
            result = apply_color_grade(result, tone=self.color_grade)

        if self.enable_grain:
            result = apply_film_grain(result, intensity=8,
                                      progress=progress)

        if self.enable_letterbox:
            result = apply_letterbox(result, bar_height=40)

        return result