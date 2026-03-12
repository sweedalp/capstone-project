"""
agents/animation_agent_enhanced.py
FIXED: Smooth animation, no flickering, proper frame count
"""

import math
import shutil
from PIL import Image, ImageDraw

from config.settings import (
    VIDEO_WIDTH, VIDEO_HEIGHT, FPS, FRAMES_DIR,
    ENABLE_PARTICLES, ENABLE_AVATAR, ENABLE_3D_EFFECTS,
)
from utils.fonts import FontManager
from utils.colors import THEMES, hex_to_rgb
from animations.effects import (
    ease_out_cubic, centered_text, wrap_text,
    draw_rounded_box, pulse_value,
)
from animations.diagram_renderer import render_architecture, render_mind_map, render_network
from animations.flow_renderer import render_flowchart, render_timeline, render_process_flow
from animations.connection_renderer import render_code_block, render_comparison, render_data_chart
from animations.metaphor_renderer import render_metaphor
from animations.avatar_renderer import AvatarRenderer, get_avatar_state


class EnhancedAnimationAgent:
    """Renders frames with smooth animation - no flickering."""

    def __init__(self, theme="dark_tech", quality="fast"):
        self.theme = THEMES.get(theme, THEMES["dark_tech"])

        quality_map = {
            "fast": (1280, 720, 15),
            "medium": (1280, 720, 20),
            "high": (1920, 1080, 24),
            "cinematic": (1920, 1080, 30),
        }
        self.w, self.h, self.fps = quality_map.get(quality, (1280, 720, 15))
        self.quality = quality
        self._bg_cache = None

        self.avatar = AvatarRenderer(self.theme) if ENABLE_AVATAR else None

        # Particles disabled to prevent flicker
        # Particles use random positions each frame = visual noise
        self.particles = None

    def render_scene(self, scene, audio_info, language="en"):
        """Render all frames for a scene - SMOOTH, no flicker."""
        sn = scene["scene_number"]
        duration = audio_info["duration"]

        scene_dir = FRAMES_DIR / f"scene_{sn}_{language}"

        # CRITICAL FIX 1: Clean old frames before rendering
        if scene_dir.exists():
            shutil.rmtree(str(scene_dir), ignore_errors=True)
        scene_dir.mkdir(parents=True, exist_ok=True)

        # CRITICAL FIX 2: Proper frame count
        # At least fps * duration frames for smooth playback
        # Minimum 30 frames per scene to avoid slideshow effect
        total_frames = max(30, int(duration * self.fps))

        bg = self._get_background()

        for fi in range(total_frames):
            # CRITICAL FIX 3: Monotonically increasing progress
            # This ensures animation only moves forward, never backward
            progress = fi / max(total_frames - 1, 1)

            frame = self._render_frame(bg, scene, progress, language)

            # CRITICAL FIX 4: Force exact size on EVERY frame
            if frame.size != (self.w, self.h):
                frame = frame.resize((self.w, self.h), Image.LANCZOS)

            frame_path = scene_dir / f"frame_{fi:05d}.png"
            frame.save(str(frame_path), "PNG", optimize=False)

        return {
            "scene_number": sn,
            "frames_dir": str(scene_dir),
            "frame_count": total_frames,
            "duration": duration,
        }

    def _get_background(self):
        if not self._bg_cache:
            self._bg_cache = self._create_gradient_bg()
        return self._bg_cache

    def _create_gradient_bg(self):
        """Create gradient background at exact dimensions."""
        img = Image.new("RGB", (self.w, self.h))
        draw = ImageDraw.Draw(img)
        top = hex_to_rgb(self.theme["bg"])
        bot = hex_to_rgb(self.theme["card_bg"])
        for y in range(self.h):
            t = y / self.h
            c = tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3))
            draw.line([(0, y), (self.w, y)], fill=c)
        return img

    def _render_frame(self, bg, scene, progress, language):
        """Render single frame. DETERMINISTIC - same progress = same output."""
        frame = bg.copy()
        draw = ImageDraw.Draw(frame)
        fonts = FontManager.get_font_set(language)

        # Draw subtle grid dots (static, no randomness)
        self._draw_static_bg_dots(draw, progress)

        # Main content - all renderers use progress monotonically
        anim_type = scene.get("animation_type", "bullet_points")
        renderer = self._get_renderer(anim_type)
        try:
            renderer(draw, scene, progress, fonts)
        except Exception as e:
            print(f"    ⚠️ Renderer {anim_type} failed: {e}, using bullets")
            self._render_bullets(draw, scene, progress, fonts)

        # Avatar
        if self.avatar and ENABLE_AVATAR:
            try:
                self._render_avatar(draw, scene, progress, fonts)
            except Exception:
                pass

        # Bottom bar
        self._render_bottom_bar(draw, scene, progress, fonts["label"])

        return frame

    def _draw_static_bg_dots(self, draw, progress):
        """Draw deterministic background dots - no randomness."""
        dot_color = hex_to_rgb(self.theme.get("border", "#1e293b"))
        dim_dot = tuple(max(0, c // 3) for c in dot_color)

        # Fixed grid of subtle dots
        spacing = 80
        for gx in range(spacing // 2, self.w, spacing):
            for gy in range(spacing // 2, self.h, spacing):
                # Gentle pulse based on progress - deterministic
                pulse = 0.3 + 0.2 * math.sin(progress * math.pi * 2 + gx * 0.01 + gy * 0.01)
                if pulse > 0.35:
                    r = 1
                    draw.ellipse([gx - r, gy - r, gx + r, gy + r], fill=dim_dot)

    def _get_renderer(self, anim_type):
        renderers = {
            "title_intro": self._render_title,
            "bullet_points": self._render_bullets,
            "architecture": lambda d, s, p, f: render_architecture(d, s, p, f, self.theme, self.w, self.h, None),
            "flowchart": lambda d, s, p, f: render_flowchart(d, s, p, f, self.theme, self.w, self.h, None),
            "code_block": lambda d, s, p, f: render_code_block(d, s, p, f, self.theme, self.w, self.h, None),
            "comparison": lambda d, s, p, f: render_comparison(d, s, p, f, self.theme, self.w, self.h, None),
            "center_reveal": lambda d, s, p, f: render_mind_map(d, s, p, f, self.theme, self.w, self.h, None),
            "mind_map": lambda d, s, p, f: render_mind_map(d, s, p, f, self.theme, self.w, self.h, None),
            "timeline": lambda d, s, p, f: render_timeline(d, s, p, f, self.theme, self.w, self.h, None),
            "process_flow": lambda d, s, p, f: render_process_flow(d, s, p, f, self.theme, self.w, self.h, None),
            "network": lambda d, s, p, f: render_network(d, s, p, f, self.theme, self.w, self.h, None),
            "data_chart": lambda d, s, p, f: render_data_chart(d, s, p, f, self.theme, self.w, self.h, None),
            "metaphor_visual": lambda d, s, p, f: render_metaphor(d, s, p, f, self.theme, self.w, self.h, None),
            "three_d": self._render_bullets,
            "icon_grid": self._render_icon_grid,
            "summary_card": self._render_summary,
            "practice_quiz": self._render_practice,
            "zoom_detail": self._render_bullets,
            "carousel": self._render_icon_grid,
            "example_walkthrough": self._render_bullets,
            "problem_visual": self._render_bullets,
            "why_explanation": self._render_bullets,
            "line_detail": lambda d, s, p, f: render_code_block(d, s, p, f, self.theme, self.w, self.h, None),
        }
        return renderers.get(anim_type, self._render_bullets)

    # ─── Renderers (all use monotonic progress) ─────────────────

    def _render_title(self, draw, scene, progress, fonts):
        tc = hex_to_rgb(self.theme["text"])
        pc = hex_to_rgb(self.theme["primary"])
        sc = hex_to_rgb(self.theme["secondary"])
        cx = self.w // 2
        cy = self.h // 2

        # Smooth ease - only moves forward
        ap = ease_out_cubic(min(1.0, progress * 2.5))

        # Decorative lines
        lw = int(400 * ap)
        draw.line([(cx - lw // 2, cy - 40), (cx + lw // 2, cy - 40)], fill=pc, width=3)

        if ap > 0.1:
            centered_text(draw, scene.get("title", ""), cx, cy + 10, fonts["title"], tc)

        if ap > 0.3:
            lw2 = int(250 * min(1.0, (progress - 0.3) * 3))
            draw.line([(cx - lw2 // 2, cy + 55), (cx + lw2 // 2, cy + 55)], fill=sc, width=2)

        # Narration text - appears and stays
        if progress > 0.35:
            narr = scene.get("narration", "")
            lines = wrap_text(narr, 55)
            for i, line in enumerate(lines[:3]):
                line_progress = min(1.0, (progress - 0.35 - i * 0.05) * 3)
                if line_progress > 0:
                    alpha_ease = ease_out_cubic(line_progress)
                    # Text slides up and stays
                    y_offset = int((1 - alpha_ease) * 15)
                    centered_text(draw, line, cx, cy + 90 + i * 38 + y_offset,
                                  fonts["small"], hex_to_rgb(self.theme["text_muted"]))

    def _render_bullets(self, draw, scene, progress, fonts):
        tc = hex_to_rgb(self.theme["text"])
        pc = hex_to_rgb(self.theme["primary"])

        # Title animates in and STAYS
        tp = ease_out_cubic(min(1.0, progress * 4))
        draw.text((70, 45), scene.get("title", ""), fill=pc, font=fonts["heading"])
        draw.line([(70, 100), (70 + int(450 * tp), 100)], fill=pc, width=3)

        kp = scene.get("key_points", [])
        colors = [self.theme["primary"], self.theme["secondary"],
                  self.theme["accent"], self.theme["success"], self.theme["warning"]]

        max_w = self.w - 80
        if self.avatar and ENABLE_AVATAR:
            max_w = self.w - 200

        for i, pt in enumerate(kp[:6]):
            # Each bullet appears one by one and STAYS visible
            delay = 0.08 + i * 0.12
            pp = max(0, min(1.0, (progress - delay) * 3.0))
            if pp <= 0:
                continue

            # Smooth ease that settles - no oscillation
            ease = ease_out_cubic(pp)
            x_offset = int((1 - ease) * 40)
            y = 140 + i * 90
            cc = hex_to_rgb(self.theme["card_bg"])
            ac = hex_to_rgb(colors[i % len(colors)])

            # Card background
            draw_rounded_box(draw, 70 + x_offset, y, max_w, y + 75,
                             fill=cc, outline=hex_to_rgb(self.theme["border"]), radius=14)

            # Left accent bar
            draw.rounded_rectangle([70 + x_offset, y, 82 + x_offset, y + 75],
                                   radius=6, fill=ac)

            # Number circle
            draw.ellipse([100 + x_offset, y + 18, 138 + x_offset, y + 56], fill=ac)
            centered_text(draw, str(i + 1), 119 + x_offset, y + 37,
                          fonts["body"], (255, 255, 255))

            # Bullet text
            draw.text((155 + x_offset, y + 22), pt[:48], fill=tc, font=fonts["body"])

        # Narration at bottom - fades in once and stays
        if progress > 0.5:
            narr_alpha = min(1.0, (progress - 0.5) * 3)
            if narr_alpha > 0.1:
                narr = scene.get("narration", "")
                lines = wrap_text(narr, 65)
                for i, ln in enumerate(lines[:2]):
                    draw.text((70, self.h - 110 + i * 28), ln,
                              fill=hex_to_rgb(self.theme["text_muted"]),
                              font=fonts["label"])

    def _render_icon_grid(self, draw, scene, progress, fonts):
        tc = hex_to_rgb(self.theme["text"])
        pc = hex_to_rgb(self.theme["primary"])
        draw.text((70, 40), scene.get("title", ""), fill=pc, font=fonts["heading"])

        kp = scene.get("key_points", [])
        cols = 2 if len(kp) <= 4 else 3
        rows = math.ceil(len(kp) / cols)
        cw = (self.w - 180) // cols
        ch = (self.h - 220) // max(rows, 1)
        colors = [self.theme["primary"], self.theme["secondary"],
                  self.theme["accent"], self.theme["success"]]

        for i, pt in enumerate(kp[:9]):
            col, row = i % cols, i // cols
            delay = 0.06 + i * 0.08
            cp = max(0, min(1.0, (progress - delay) * 2.5))
            if cp <= 0:
                continue
            ease = ease_out_cubic(cp)
            cx_pos = 130 + col * cw + cw // 2
            cy_pos = 160 + row * ch + ch // 2

            # Scale in smoothly
            r = int(38 * ease)
            c = hex_to_rgb(colors[i % len(colors)])
            draw.ellipse([cx_pos - r, cy_pos - r - 18,
                          cx_pos + r, cy_pos + r - 18], fill=c)
            if ease > 0.3:
                centered_text(draw, str(i + 1), cx_pos, cy_pos - 18,
                              fonts["body"], (255, 255, 255))
            if ease > 0.5:
                centered_text(draw, pt[:24], cx_pos, cy_pos + 35,
                              fonts["small"], tc)

    def _render_summary(self, draw, scene, progress, fonts):
        tc = hex_to_rgb(self.theme["text"])
        pc = hex_to_rgb(self.theme["primary"])
        ac = hex_to_rgb(self.theme["accent"])
        cx, cy = self.w // 2, self.h // 2 + 20

        centered_text(draw, "📋 " + scene.get("title", "Summary"),
                      cx, 70, fonts["heading"], pc)

        if progress > 0.1:
            cp = ease_out_cubic(min(1.0, (progress - 0.1) * 2))
            cw = int(640 * cp)

            draw_rounded_box(draw, cx - cw // 2, cy - 180,
                             cx + cw // 2, cy + 180,
                             fill=hex_to_rgb(self.theme["card_bg"]),
                             outline=pc, radius=18, width=3)

            kp = scene.get("key_points", [])
            for i, pt in enumerate(kp[:6]):
                delay = 0.2 + i * 0.1
                ip = max(0, min(1.0, (progress - delay) * 3))
                if ip > 0:
                    ease = ease_out_cubic(ip)
                    x = cx - cw // 2 + 40
                    y = cy - 120 + i * 55
                    draw.text((x, y), "✓", fill=ac, font=fonts["heading"])
                    xo = int((1 - ease) * 20)
                    draw.text((x + 50 + xo, y + 6), pt[:40],
                              fill=tc, font=fonts["body"])

    def _render_practice(self, draw, scene, progress, fonts):
        tc = hex_to_rgb(self.theme["text"])
        wc = hex_to_rgb(self.theme["warning"])

        centered_text(draw, "🎯 Practice Time!",
                      self.w // 2, 60, fonts["heading"], wc)

        visual = scene.get("visual_elements", {})
        question = visual.get("question", scene.get("narration", "Try this!"))
        options = visual.get("options", scene.get("key_points", []))

        if progress > 0.1:
            qp = ease_out_cubic(min(1.0, (progress - 0.1) * 3))
            qw = int(700 * qp)
            draw_rounded_box(draw, self.w // 2 - qw // 2, 110,
                             self.w // 2 + qw // 2, 210,
                             fill=hex_to_rgb(self.theme["card_bg"]),
                             outline=wc, radius=14, width=2)
            if qp > 0.4:
                lines = wrap_text(question, 60)
                for i, ln in enumerate(lines[:3]):
                    draw.text((self.w // 2 - qw // 2 + 20, 125 + i * 28),
                              ln, fill=tc, font=fonts["body"])

        colors_opt = [self.theme["primary"], self.theme["secondary"],
                      self.theme["accent"], self.theme["success"]]
        for i, opt in enumerate(options[:4]):
            delay = 0.3 + i * 0.1
            op = max(0, min(1.0, (progress - delay) * 2.5))
            if op <= 0:
                continue
            ease = ease_out_cubic(op)
            y = 240 + i * 80
            ow = 600
            ox = self.w // 2 - ow // 2
            xo = int((1 - ease) * 40)
            oc = hex_to_rgb(colors_opt[i % len(colors_opt)])
            draw_rounded_box(draw, ox + xo, y, ox + ow, y + 60,
                             fill=hex_to_rgb(self.theme["card_bg"]),
                             outline=oc, radius=12, width=2)
            label = chr(65 + i)
            draw.ellipse([ox + xo + 15, y + 15, ox + xo + 45, y + 45], fill=oc)
            centered_text(draw, label, ox + xo + 30, y + 30,
                          fonts["body"], (255, 255, 255))
            draw.text((ox + xo + 60, y + 16), opt[:50], fill=tc, font=fonts["body"])

    # ─── Avatar ───────────────────────────────────────────

    def _render_avatar(self, draw, scene, progress, fonts):
        if not self.avatar:
            return
        avatar_state = scene.get("avatar_state",
                                 get_avatar_state(scene.get("scene_type", "explanation")))
        ax = self.w - 100
        ay = self.h - 240
        scale = 0.8

        # Smooth entrance - only at start
        if progress < 0.15:
            ep = ease_out_cubic(progress / 0.15)
            ay = ay + int((1 - ep) * 80)
            scale = scale * max(0.1, ep)

        try:
            self.avatar.draw_avatar(draw, ax, ay, scale=scale,
                                    progress=progress, state=avatar_state,
                                    facing="left")
        except Exception:
            pass

    # ─── Bottom Bar ───────────────────────────────────────

    def _render_bottom_bar(self, draw, scene, progress, font):
        sn = scene.get("scene_number", 1)
        total = scene.get("total_scenes", sn)
        mc = hex_to_rgb(self.theme["text_muted"])
        pc = hex_to_rgb(self.theme["primary"])
        bc = hex_to_rgb(self.theme["border"])

        draw.text((self.w - 170, self.h - 38),
                  f"Scene {sn}/{total}", fill=mc, font=font)

        # Scene progress bar
        bar_h = 4
        draw.rectangle([(0, self.h - bar_h), (self.w, self.h)], fill=bc)
        sp = sn / max(total, 1)
        draw.rectangle([(0, self.h - bar_h),
                        (int(self.w * sp), self.h)], fill=pc)

        # Within-scene progress dot (smooth)
        dot_x = int(self.w * ((sn - 1 + progress) / max(total, 1)))
        dot_x = max(4, min(self.w - 4, dot_x))
        draw.ellipse([dot_x - 4, self.h - bar_h - 3,
                      dot_x + 4, self.h + 1], fill=pc)