"""
animations/avatar_renderer.py
Animated avatar presenter that appears in scenes
"""

import math
from PIL import ImageDraw
from utils.colors import hex_to_rgb
from animations.effects import ease_out_cubic, pulse_value


class AvatarRenderer:
    """Draws an animated avatar character."""

    def __init__(self, theme):
        self.theme = theme
        self.skin_c = hex_to_rgb(theme.get("avatar_skin", "#fbbf24"))
        self.body_c = hex_to_rgb(theme.get("avatar_body", "#3b82f6"))

    def draw_avatar(self, draw, x, y, scale=1.0, progress=0.0,
                    state="talking", facing="right"):
        """
        Draw avatar at position (x, y).
        States: idle, talking, pointing, thinking, celebrating
        """
        s = scale
        flip = -1 if facing == "left" else 1

        # Breathing animation
        breath = math.sin(progress * math.pi * 2) * 2 * s

        # ── Body (torso)
        body_w = int(40 * s)
        body_h = int(55 * s)
        draw.rounded_rectangle(
            [x - body_w // 2, y + int(25 * s),
             x + body_w // 2, y + int(25 * s) + body_h],
            radius=int(12 * s), fill=self.body_c,
        )

        # Collar detail
        draw.polygon(
            [(x, y + int(25 * s)),
             (x - int(12 * s), y + int(38 * s)),
             (x + int(12 * s), y + int(38 * s))],
            fill=self._darken(self.body_c, 0.8),
        )

        # ── Arms
        arm_angle = 0
        if state == "talking":
            arm_angle = math.sin(progress * math.pi * 6) * 0.15
        elif state == "pointing":
            arm_angle = -0.5 * flip
        elif state == "celebrating":
            arm_angle = -math.pi / 3 + math.sin(progress * math.pi * 4) * 0.2
        elif state == "thinking":
            arm_angle = 0.3

        # Left arm
        la_x = x - int(25 * s)
        la_y = y + int(35 * s)
        la_end_x = la_x + int(30 * s * math.cos(math.pi / 4 + arm_angle))
        la_end_y = la_y + int(30 * s * math.sin(math.pi / 4 + arm_angle))
        draw.line([(la_x, la_y), (la_end_x, la_end_y)],
                  fill=self.body_c, width=int(8 * s))
        # Hand
        draw.ellipse(
            [la_end_x - int(6 * s), la_end_y - int(6 * s),
             la_end_x + int(6 * s), la_end_y + int(6 * s)],
            fill=self.skin_c,
        )

        # Right arm
        ra_x = x + int(25 * s)
        ra_y = y + int(35 * s)
        if state == "pointing":
            ra_end_x = ra_x + int(45 * s * flip)
            ra_end_y = ra_y - int(15 * s)
        elif state == "celebrating":
            ra_end_x = ra_x + int(25 * s)
            ra_end_y = ra_y - int(35 * s) + int(
                math.sin(progress * math.pi * 4) * 8)
        else:
            ra_end_x = ra_x + int(30 * s * math.cos(-math.pi / 4 - arm_angle))
            ra_end_y = ra_y + int(30 * s * math.sin(-math.pi / 4 + arm_angle))

        draw.line([(ra_x, ra_y), (ra_end_x, ra_end_y)],
                  fill=self.body_c, width=int(8 * s))
        draw.ellipse(
            [ra_end_x - int(6 * s), ra_end_y - int(6 * s),
             ra_end_x + int(6 * s), ra_end_y + int(6 * s)],
            fill=self.skin_c,
        )

        # ── Head
        head_r = int(22 * s)
        head_y = y + int(breath)
        draw.ellipse(
            [x - head_r, head_y - head_r,
             x + head_r, head_y + head_r],
            fill=self.skin_c,
        )

        # Hair
        hair_c = (60, 40, 20)
        draw.arc(
            [x - head_r - 2, head_y - head_r - 5,
             x + head_r + 2, head_y + int(5 * s)],
            180, 0, fill=hair_c, width=int(6 * s),
        )

        # ── Face
        eye_y = head_y - int(4 * s)
        eye_spacing = int(8 * s)
        eye_r = int(3 * s)

        # Eyes
        draw.ellipse(
            [x - eye_spacing - eye_r, eye_y - eye_r,
             x - eye_spacing + eye_r, eye_y + eye_r],
            fill=(20, 20, 40),
        )
        draw.ellipse(
            [x + eye_spacing - eye_r, eye_y - eye_r,
             x + eye_spacing + eye_r, eye_y + eye_r],
            fill=(20, 20, 40),
        )

        # Eye shine
        shine_r = int(1.5 * s)
        draw.ellipse(
            [x - eye_spacing - shine_r + 1, eye_y - shine_r - 1,
             x - eye_spacing + shine_r + 1, eye_y + shine_r - 1],
            fill=(255, 255, 255),
        )
        draw.ellipse(
            [x + eye_spacing - shine_r + 1, eye_y - shine_r - 1,
             x + eye_spacing + shine_r + 1, eye_y + shine_r - 1],
            fill=(255, 255, 255),
        )

        # ── Mouth
        mouth_y = head_y + int(8 * s)
        if state == "talking":
            # Animated talking mouth
            mouth_open = abs(math.sin(progress * math.pi * 8))
            mouth_h = int(4 * s * mouth_open)
            draw.ellipse(
                [x - int(5 * s), mouth_y - mouth_h,
                 x + int(5 * s), mouth_y + mouth_h + 1],
                fill=(180, 60, 60),
            )
        elif state == "celebrating":
            draw.arc(
                [x - int(8 * s), mouth_y - int(5 * s),
                 x + int(8 * s), mouth_y + int(8 * s)],
                0, 180, fill=(180, 60, 60), width=int(2 * s),
            )
        elif state == "thinking":
            # Slight frown
            draw.arc(
                [x - int(5 * s), mouth_y,
                 x + int(5 * s), mouth_y + int(5 * s)],
                0, 180, fill=(150, 80, 80), width=int(2 * s),
            )
        else:
            # Slight smile
            draw.arc(
                [x - int(6 * s), mouth_y - int(3 * s),
                 x + int(6 * s), mouth_y + int(5 * s)],
                0, 180, fill=(180, 60, 60), width=int(2 * s),
            )

        # ── Thought/speech bubble (for thinking state)
        if state == "thinking":
            bx = x + int(30 * s * flip)
            by = head_y - int(35 * s)
            draw.ellipse([bx - 4, by + 12, bx + 4, by + 20],
                         fill=(200, 200, 220))
            draw.ellipse([bx - 2 + 8 * flip, by + 4, bx + 6 + 8 * flip,
                          by + 12], fill=(200, 200, 220))
            draw.ellipse(
                [bx - 20 + 15 * flip, by - 25,
                 bx + 20 + 15 * flip, by + 5],
                fill=(200, 200, 220),
            )
            draw.text(
                (bx - 8 + 15 * flip, by - 18), "?",
                fill=(60, 60, 80),
            )

        # ── Legs
        leg_w = int(8 * s)
        leg_y_start = y + int(25 * s) + body_h
        leg_h = int(35 * s)

        draw.rectangle(
            [x - int(12 * s), leg_y_start,
             x - int(12 * s) + leg_w, leg_y_start + leg_h],
            fill=self._darken(self.body_c, 0.7),
        )
        draw.rectangle(
            [x + int(4 * s), leg_y_start,
             x + int(4 * s) + leg_w, leg_y_start + leg_h],
            fill=self._darken(self.body_c, 0.7),
        )

        # Shoes
        shoe_c = (40, 40, 50)
        draw.rounded_rectangle(
            [x - int(15 * s), leg_y_start + leg_h - 3,
             x - int(3 * s), leg_y_start + leg_h + int(6 * s)],
            radius=3, fill=shoe_c,
        )
        draw.rounded_rectangle(
            [x + int(3 * s), leg_y_start + leg_h - 3,
             x + int(15 * s), leg_y_start + leg_h + int(6 * s)],
            radius=3, fill=shoe_c,
        )

    def draw_speech_bubble(self, draw, x, y, text, font, theme,
                           max_width=250, facing="right"):
        """Draw a speech bubble with text."""
        tc = hex_to_rgb(theme["text"])
        lines = []
        words = text.split()
        current = ""
        for w in words:
            if len(current) + len(w) + 1 <= 30:
                current += (" " if current else "") + w
            else:
                if current:
                    lines.append(current)
                current = w
        if current:
            lines.append(current)

        line_h = 22
        bw = max_width
        bh = len(lines[:4]) * line_h + 20

        flip = 1 if facing == "right" else -1
        bx = x + 50 * flip
        by = y - bh - 20

        # Bubble
        draw.rounded_rectangle(
            [bx, by, bx + bw, by + bh],
            radius=12,
            fill=hex_to_rgb(theme["card_bg"]),
            outline=hex_to_rgb(theme["primary"]), width=2,
        )

        # Tail
        tx = bx + 20 if flip > 0 else bx + bw - 20
        draw.polygon(
            [(tx, by + bh), (tx + 10, by + bh + 12), (tx + 20, by + bh)],
            fill=hex_to_rgb(theme["card_bg"]),
        )

        # Text
        for i, ln in enumerate(lines[:4]):
            draw.text((bx + 10, by + 10 + i * line_h), ln,
                      fill=tc, font=font)

    @staticmethod
    def _darken(color, factor):
        return tuple(max(0, int(c * factor)) for c in color)


def get_avatar_state(scene_type):
    """Map scene type to avatar state."""
    state_map = {
        "hook": "celebrating",
        "introduction": "talking",
        "concept_intro": "pointing",
        "explanation": "talking",
        "deep_dive": "thinking",
        "code_walkthrough": "pointing",
        "line_detail": "pointing",
        "example": "talking",
        "comparison": "thinking",
        "why_explanation": "thinking",
        "summary": "celebrating",
        "process_flow": "pointing",
        "practice": "pointing",
    }
    return state_map.get(scene_type, "talking")