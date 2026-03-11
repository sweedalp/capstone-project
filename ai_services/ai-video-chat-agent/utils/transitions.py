"""
utils/transitions.py
Smooth scene transition effects
"""

import math
from PIL import Image, ImageDraw, ImageFilter
from utils.colors import hex_to_rgb


def ease_in_out_cubic(t):
    """Smooth ease in-out curve."""
    if t < 0.5:
        return 4 * t * t * t
    return 1 - (-2 * t + 2) ** 3 / 2


def ease_out_expo(t):
    """Exponential ease out."""
    return 1 if t == 1 else 1 - 2 ** (-10 * t)


class TransitionEngine:
    """Creates smooth transitions between scenes."""

    def __init__(self, width, height, fps=24):
        self.w = width
        self.h = height
        self.fps = fps
        self.transition_duration = 0.5  # seconds

    def get_transition_frames(self):
        """Number of frames for a transition."""
        return int(self.transition_duration * self.fps)

    def fade_through_black(self, frame_from, frame_to, progress):
        """Fade out to black, then fade in from black."""
        if progress < 0.5:
            # Fade out
            t = progress * 2
            alpha = int(255 * (1 - t))
            overlay = Image.new("RGB", (self.w, self.h), (0, 0, 0))
            return Image.blend(frame_from, overlay, t)
        else:
            # Fade in
            t = (progress - 0.5) * 2
            overlay = Image.new("RGB", (self.w, self.h), (0, 0, 0))
            return Image.blend(overlay, frame_to, t)

    def cross_dissolve(self, frame_from, frame_to, progress):
        """Smooth crossfade between frames."""
        t = ease_in_out_cubic(progress)
        return Image.blend(frame_from, frame_to, t)

    def slide_left(self, frame_from, frame_to, progress):
        """Slide new frame in from right."""
        t = ease_in_out_cubic(progress)
        offset = int(self.w * (1 - t))
        result = frame_from.copy()
        result.paste(frame_to, (offset, 0))
        return result

    def slide_up(self, frame_from, frame_to, progress):
        """Slide new frame in from bottom."""
        t = ease_in_out_cubic(progress)
        offset = int(self.h * (1 - t))
        result = frame_from.copy()
        result.paste(frame_to, (0, offset))
        return result

    def zoom_in(self, frame_from, frame_to, progress):
        """Zoom into center then reveal new frame."""
        t = ease_in_out_cubic(progress)
        if t < 0.5:
            # Zoom in on current frame
            scale = 1 + t * 2
            sw = int(self.w / scale)
            sh = int(self.h / scale)
            cx, cy = self.w // 2, self.h // 2
            crop = frame_from.crop((
                cx - sw // 2, cy - sh // 2,
                cx + sw // 2, cy + sh // 2
            ))
            return crop.resize((self.w, self.h), Image.LANCZOS)
        else:
            # Zoom out from new frame
            scale = 1 + (1 - t) * 2
            sw = int(self.w / scale)
            sh = int(self.h / scale)
            cx, cy = self.w // 2, self.h // 2
            crop = frame_to.crop((
                max(0, cx - sw // 2), max(0, cy - sh // 2),
                min(self.w, cx + sw // 2), min(self.h, cy + sh // 2)
            ))
            return crop.resize((self.w, self.h), Image.LANCZOS)

    def wipe_circle(self, frame_from, frame_to, progress):
        """Circular wipe reveal."""
        t = ease_out_expo(progress)
        max_radius = int(math.sqrt(self.w ** 2 + self.h ** 2) / 2)
        radius = int(max_radius * t)

        mask = Image.new("L", (self.w, self.h), 0)
        mask_draw = ImageDraw.Draw(mask)
        cx, cy = self.w // 2, self.h // 2
        mask_draw.ellipse([
            cx - radius, cy - radius,
            cx + radius, cy + radius
        ], fill=255)

        result = frame_from.copy()
        result.paste(frame_to, (0, 0), mask)
        return result

    def glitch_transition(self, frame_from, frame_to, progress):
        """Digital glitch effect."""
        t = ease_in_out_cubic(progress)
        result = frame_from.copy() if t < 0.5 else frame_to.copy()

        if 0.2 < t < 0.8:
            # Add RGB shift glitch
            import random
            num_slices = random.randint(3, 8)
            for _ in range(num_slices):
                y = random.randint(0, self.h - 20)
                h = random.randint(5, 30)
                offset = random.randint(-30, 30)

                strip = result.crop((0, y, self.w, min(y + h, self.h)))
                result.paste(strip, (offset, y))

        if t > 0.5:
            return Image.blend(result, frame_to, min(1.0, (t - 0.5) * 3))
        return result

    def blur_transition(self, frame_from, frame_to, progress):
        """Blur out, then sharpen in."""
        t = ease_in_out_cubic(progress)
        if t < 0.5:
            blur_amount = int(t * 20)
            if blur_amount > 0:
                return frame_from.filter(ImageFilter.GaussianBlur(blur_amount))
            return frame_from
        else:
            blur_amount = int((1 - t) * 20)
            if blur_amount > 0:
                return frame_to.filter(ImageFilter.GaussianBlur(blur_amount))
            return frame_to

    def get_transition(self, transition_type="cross_dissolve"):
        """Get transition function by name."""
        transitions = {
            "fade_black": self.fade_through_black,
            "cross_dissolve": self.cross_dissolve,
            "slide_left": self.slide_left,
            "slide_up": self.slide_up,
            "zoom_in": self.zoom_in,
            "wipe_circle": self.wipe_circle,
            "glitch": self.glitch_transition,
            "blur": self.blur_transition,
        }
        return transitions.get(transition_type, self.cross_dissolve)

    def apply_transition(self, frame_from, frame_to, progress,
                         transition_type="cross_dissolve"):
        """Apply a named transition between two frames."""
        func = self.get_transition(transition_type)
        try:
            return func(frame_from, frame_to, progress)
        except Exception:
            return self.cross_dissolve(frame_from, frame_to, progress)


# ─── Cinematic Camera Effects ────────────────────────────────────

class CinematicCamera:
    """Simulates camera movements on frames."""

    def __init__(self, width, height):
        self.w = width
        self.h = height

    def pan_right(self, frame, progress, amount=100):
        """Slow pan to the right."""
        t = ease_in_out_cubic(progress)
        offset = int(amount * t)
        # Render at larger size, then crop
        result = Image.new("RGB", (self.w, self.h))
        result.paste(frame, (-offset, 0))
        return result

    def pan_left(self, frame, progress, amount=100):
        """Slow pan to the left."""
        t = ease_in_out_cubic(progress)
        offset = int(amount * t)
        result = Image.new("RGB", (self.w, self.h))
        result.paste(frame, (offset, 0))
        return result

    def slow_zoom_in(self, frame, progress, max_zoom=1.15):
        """Slow cinematic zoom in (Ken Burns effect)."""
        t = ease_in_out_cubic(progress)
        scale = 1 + (max_zoom - 1) * t
        new_w = int(self.w * scale)
        new_h = int(self.h * scale)
        zoomed = frame.resize((new_w, new_h), Image.LANCZOS)
        cx = (new_w - self.w) // 2
        cy = (new_h - self.h) // 2
        return zoomed.crop((cx, cy, cx + self.w, cy + self.h))

    def slow_zoom_out(self, frame, progress, max_zoom=1.15):
        """Slow cinematic zoom out."""
        return self.slow_zoom_in(frame, 1.0 - progress, max_zoom)

    def dolly_zoom(self, frame, progress):
        """Vertigo/dolly zoom effect."""
        t = math.sin(progress * math.pi)
        scale = 1 + 0.1 * t
        new_w = int(self.w * scale)
        new_h = int(self.h * scale)
        zoomed = frame.resize((new_w, new_h), Image.LANCZOS)
        cx = (new_w - self.w) // 2
        cy = (new_h - self.h) // 2
        return zoomed.crop((cx, cy, cx + self.w, cy + self.h))

    def shake(self, frame, progress, intensity=5):
        """Camera shake effect."""
        import random
        dx = int(random.uniform(-intensity, intensity) * math.sin(progress * 20))
        dy = int(random.uniform(-intensity, intensity) * math.cos(progress * 15))
        result = Image.new("RGB", (self.w, self.h))
        result.paste(frame, (dx, dy))
        return result

    def apply_camera(self, frame, camera_type, progress):
        """Apply a camera effect."""
        cameras = {
            "pan_right": self.pan_right,
            "pan_left": self.pan_left,
            "zoom_in": self.slow_zoom_in,
            "zoom_out": self.slow_zoom_out,
            "dolly": self.dolly_zoom,
            "shake": self.shake,
            "static": lambda f, p: f,
        }
        func = cameras.get(camera_type, lambda f, p: f)
        try:
            return func(frame, progress)
        except Exception:
            return frame