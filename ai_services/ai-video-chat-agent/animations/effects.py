"""
animations/effects.py
Core animation effects, easing functions, and drawing primitives
"""

import math
from PIL import ImageDraw, ImageFilter, Image
from utils.colors import hex_to_rgb


# ─── Easing Functions ────────────────────────────────────────────

def ease_out_cubic(t):
    """Smooth deceleration."""
    return 1 - (1 - t) ** 3


def ease_in_cubic(t):
    """Smooth acceleration."""
    return t ** 3


def ease_in_out(t):
    """Smooth acceleration then deceleration."""
    if t < 0.5:
        return 4 * t * t * t
    return 1 - (-2 * t + 2) ** 3 / 2


def ease_out_bounce(t):
    """Bouncy deceleration."""
    if t < 1 / 2.75:
        return 7.5625 * t * t
    elif t < 2 / 2.75:
        t -= 1.5 / 2.75
        return 7.5625 * t * t + 0.75
    elif t < 2.5 / 2.75:
        t -= 2.25 / 2.75
        return 7.5625 * t * t + 0.9375
    else:
        t -= 2.625 / 2.75
        return 7.5625 * t * t + 0.984375


def ease_out_elastic(t):
    """Elastic snap effect."""
    if t == 0 or t == 1:
        return t
    return 2 ** (-10 * t) * math.sin((t * 10 - 0.75) * (2 * math.pi) / 3) + 1


def ease_out_back(t):
    """Overshoot then settle."""
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


def spring(t, damping=0.5, frequency=4):
    """Spring physics easing."""
    return 1 - math.exp(-damping * t * 10) * math.cos(frequency * t * math.pi * 2)


# ─── Drawing Primitives ──────────────────────────────────────────

def draw_glow_circle(draw, cx, cy, radius, color_hex, rings=3, intensity=1.0):
    """Draw a glowing circle with outer rings."""
    c = hex_to_rgb(color_hex) if isinstance(color_hex, str) else color_hex
    for i in range(rings, 0, -1):
        r = radius + i * 6
        alpha = max(10, int(60 * intensity / i))
        glow_c = (min(255, c[0]), min(255, c[1]), min(255, c[2]))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                     outline=glow_c, width=max(1, 3 - i))


def draw_glow_line(draw, x1, y1, x2, y2, color_hex, width=3, glow_width=2):
    """Draw a line with glow effect."""
    c = hex_to_rgb(color_hex) if isinstance(color_hex, str) else color_hex
    dim = tuple(max(0, v // 3) for v in c)
    for i in range(glow_width, 0, -1):
        draw.line([(x1, y1), (x2, y2)], fill=dim, width=width + i * 2)
    draw.line([(x1, y1), (x2, y2)], fill=c, width=width)


def draw_animated_arrow(draw, x1, y1, x2, y2, color, progress, width=3):
    """Draw an arrow that animates along its path with a flowing dot."""
    if isinstance(color, str):
        color = hex_to_rgb(color)

    cur_x = int(x1 + (x2 - x1) * progress)
    cur_y = int(y1 + (y2 - y1) * progress)
    draw.line([(x1, y1), (cur_x, cur_y)], fill=color, width=width)

    if progress > 0.8:
        angle = math.atan2(cur_y - y1, cur_x - x1)
        al = 14
        ax1 = cur_x - al * math.cos(angle - math.pi / 6)
        ay1 = cur_y - al * math.sin(angle - math.pi / 6)
        ax2 = cur_x - al * math.cos(angle + math.pi / 6)
        ay2 = cur_y - al * math.sin(angle + math.pi / 6)
        draw.polygon(
            [(cur_x, cur_y), (int(ax1), int(ay1)), (int(ax2), int(ay2))],
            fill=color,
        )

    # Flowing dot
    dot_t = (progress * 4) % 1.0
    dx = int(x1 + (cur_x - x1) * dot_t)
    dy = int(y1 + (cur_y - y1) * dot_t)
    draw.ellipse([dx - 5, dy - 5, dx + 5, dy + 5], fill=color)


def draw_dashed_line(draw, x1, y1, x2, y2, color, width=2, dash_len=10, gap_len=6):
    """Draw a dashed line."""
    if isinstance(color, str):
        color = hex_to_rgb(color)
    dist = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    if dist == 0:
        return
    dx = (x2 - x1) / dist
    dy = (y2 - y1) / dist
    pos = 0
    drawing = True
    while pos < dist:
        seg_len = dash_len if drawing else gap_len
        end_pos = min(pos + seg_len, dist)
        if drawing:
            sx = int(x1 + dx * pos)
            sy = int(y1 + dy * pos)
            ex = int(x1 + dx * end_pos)
            ey = int(y1 + dy * end_pos)
            draw.line([(sx, sy), (ex, ey)], fill=color, width=width)
        pos = end_pos
        drawing = not drawing


def draw_rounded_box(draw, x1, y1, x2, y2, fill, outline, radius=12,
                     width=2, shadow=False, shadow_offset=4):
    """Draw a rounded rectangle with optional shadow."""
    if shadow:
        shadow_color = (0, 0, 0)
        draw.rounded_rectangle(
            [x1 + shadow_offset, y1 + shadow_offset,
             x2 + shadow_offset, y2 + shadow_offset],
            radius=radius, fill=shadow_color
        )
    if isinstance(fill, str):
        fill = hex_to_rgb(fill)
    if isinstance(outline, str):
        outline = hex_to_rgb(outline)
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius,
                           fill=fill, outline=outline, width=width)


def draw_gradient_box(img, x1, y1, x2, y2, color_top, color_bottom, radius=12):
    """Draw a box with vertical gradient fill."""
    if isinstance(color_top, str):
        color_top = hex_to_rgb(color_top)
    if isinstance(color_bottom, str):
        color_bottom = hex_to_rgb(color_bottom)

    overlay = Image.new("RGB", img.size, (0, 0, 0))
    od = ImageDraw.Draw(overlay)
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=255)

    for y in range(y1, y2):
        t = (y - y1) / max(1, y2 - y1)
        c = tuple(int(color_top[i] + (color_bottom[i] - color_top[i]) * t)
                  for i in range(3))
        od.line([(x1, y), (x2, y)], fill=c)

    img.paste(overlay, (0, 0), mask)


def draw_progress_bar(draw, x, y, w, h, progress, bg_color, fill_color,
                      glow=False):
    """Draw an animated progress bar."""
    if isinstance(bg_color, str):
        bg_color = hex_to_rgb(bg_color)
    if isinstance(fill_color, str):
        fill_color = hex_to_rgb(fill_color)

    draw.rounded_rectangle([x, y, x + w, y + h], radius=h // 2, fill=bg_color)
    if progress > 0:
        fill_w = max(h, int(w * progress))
        draw.rounded_rectangle([x, y, x + fill_w, y + h],
                               radius=h // 2, fill=fill_color)
        if glow:
            bright = tuple(min(255, c + 40) for c in fill_color)
            draw.rounded_rectangle([x, y, x + fill_w, y + h // 2],
                                   radius=h // 4, fill=bright)


def draw_circular_progress(draw, cx, cy, radius, progress, color, bg_color,
                           width=6):
    """Draw circular progress indicator."""
    if isinstance(color, str):
        color = hex_to_rgb(color)
    if isinstance(bg_color, str):
        bg_color = hex_to_rgb(bg_color)

    draw.arc([cx - radius, cy - radius, cx + radius, cy + radius],
             0, 360, fill=bg_color, width=width)
    if progress > 0:
        end_angle = int(360 * progress)
        draw.arc([cx - radius, cy - radius, cx + radius, cy + radius],
                 -90, -90 + end_angle, fill=color, width=width)


def centered_text(draw, text, x, y, font, color):
    """Draw text centered at (x, y)."""
    if isinstance(color, str):
        color = hex_to_rgb(color)
    try:
        bb = draw.textbbox((0, 0), text, font=font)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
    except Exception:
        tw, th = len(text) * 14, 24
    draw.text((x - tw // 2, y - th // 2), text, fill=color, font=font)


def text_width(draw, text, font):
    """Get the width of text."""
    try:
        bb = draw.textbbox((0, 0), text, font=font)
        return bb[2] - bb[0]
    except Exception:
        return len(text) * 12


def wrap_text(text, max_chars):
    """Wrap text to fit within max character width."""
    words = text.split()
    lines, current = [], ""
    for w in words:
        if len(current) + len(w) + 1 <= max_chars:
            current += (" " if current else "") + w
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines


def typewriter_text(draw, text, x, y, font, color, progress, cursor=True):
    """Render text with typewriter effect."""
    if isinstance(color, str):
        color = hex_to_rgb(color)
    visible_len = int(len(text) * progress)
    visible = text[:visible_len]
    draw.text((x, y), visible, fill=color, font=font)

    if cursor and progress < 1.0:
        try:
            cur_x = x + draw.textlength(visible, font=font)
        except Exception:
            cur_x = x + len(visible) * 10
        draw.rectangle([int(cur_x), y, int(cur_x) + 8, y + 20],
                       fill=color)


def pulse_value(progress, speed=4, min_val=0.85, max_val=1.0):
    """Generate a pulsing value between min and max."""
    t = 0.5 + 0.5 * math.sin(progress * math.pi * speed)
    return min_val + (max_val - min_val) * t


def wave_offset(index, progress, amplitude=8, frequency=2):
    """Get wave-based Y offset for staggered animations."""
    return int(amplitude * math.sin(progress * math.pi * frequency + index * 0.5))


# ─── Icon Drawing ─────────────────────────────────────────────────

def draw_icon_circle(draw, cx, cy, radius, icon_text, bg_color, text_color,
                     font, glow_color=None):
    """Draw a circular icon with text."""
    if isinstance(bg_color, str):
        bg_color = hex_to_rgb(bg_color)
    if isinstance(text_color, str):
        text_color = hex_to_rgb(text_color)

    if glow_color:
        draw_glow_circle(draw, cx, cy, radius, glow_color, rings=2)
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius],
                 fill=bg_color)
    centered_text(draw, icon_text, cx, cy, font, text_color)


def draw_badge(draw, x, y, text, bg_color, text_color, font, padding=6):
    """Draw a small badge/tag."""
    if isinstance(bg_color, str):
        bg_color = hex_to_rgb(bg_color)
    if isinstance(text_color, str):
        text_color = hex_to_rgb(text_color)
    tw = text_width(draw, text, font)
    draw.rounded_rectangle(
        [x, y, x + tw + padding * 2, y + 22],
        radius=11, fill=bg_color,
    )
    draw.text((x + padding, y + 2), text, fill=text_color, font=font)


def draw_connector_dot(draw, x, y, radius, color, filled=True):
    """Draw a connector point."""
    if isinstance(color, str):
        color = hex_to_rgb(color)
    if filled:
        draw.ellipse([x - radius, y - radius, x + radius, y + radius],
                     fill=color)
    else:
        draw.ellipse([x - radius, y - radius, x + radius, y + radius],
                     outline=color, width=2)