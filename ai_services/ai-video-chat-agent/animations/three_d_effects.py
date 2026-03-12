"""
animations/three_d_effects.py
3D-like depth effects: perspective, shadows, layers, parallax
"""

import math
from PIL import Image, ImageDraw
from utils.colors import hex_to_rgb
from animations.effects import (
    ease_out_cubic, draw_rounded_box, centered_text,
)


class DepthRenderer:
    """Creates 3D-like depth effects on 2D canvas."""

    def __init__(self, width, height, theme):
        self.w = width
        self.h = height
        self.theme = theme

    def draw_3d_box(self, draw, x, y, box_w, box_h, fill_color,
                    outline_color, depth=12, angle=0.7):
        """Draw a box with 3D perspective depth."""
        if isinstance(fill_color, str):
            fill_color = hex_to_rgb(fill_color)
        if isinstance(outline_color, str):
            outline_color = hex_to_rgb(outline_color)

        dx = int(depth * math.cos(angle))
        dy = int(-depth * math.sin(angle))

        # Depth face color (darker)
        depth_c = tuple(max(0, int(c * 0.6)) for c in fill_color)

        # Right depth face
        right_face = [
            (x + box_w, y),
            (x + box_w + dx, y + dy),
            (x + box_w + dx, y + box_h + dy),
            (x + box_w, y + box_h),
        ]
        draw.polygon(right_face, fill=depth_c)

        # Top depth face
        top_face = [
            (x, y),
            (x + dx, y + dy),
            (x + box_w + dx, y + dy),
            (x + box_w, y),
        ]
        top_c = tuple(max(0, int(c * 0.75)) for c in fill_color)
        draw.polygon(top_face, fill=top_c)

        # Front face
        draw.rounded_rectangle(
            [x, y, x + box_w, y + box_h],
            radius=8, fill=fill_color, outline=outline_color, width=2,
        )

    def draw_3d_circle(self, draw, cx, cy, radius, fill_color,
                       outline_color, depth=8):
        """Draw a circle with 3D depth shadow."""
        if isinstance(fill_color, str):
            fill_color = hex_to_rgb(fill_color)
        if isinstance(outline_color, str):
            outline_color = hex_to_rgb(outline_color)

        # Shadow
        shadow_c = tuple(max(0, int(c * 0.3)) for c in fill_color)
        draw.ellipse(
            [cx - radius + depth, cy - radius + depth,
             cx + radius + depth, cy + radius + depth],
            fill=shadow_c,
        )

        # Main circle
        draw.ellipse(
            [cx - radius, cy - radius, cx + radius, cy + radius],
            fill=fill_color, outline=outline_color, width=2,
        )

        # Highlight
        hr = radius // 3
        hx = cx - radius // 4
        hy = cy - radius // 4
        highlight = tuple(min(255, int(c * 1.4)) for c in fill_color)
        draw.ellipse(
            [hx - hr, hy - hr, hx + hr, hy + hr],
            fill=highlight,
        )

    def draw_floating_card(self, draw, img, x, y, card_w, card_h,
                           fill_color, outline_color, elevation=3,
                           progress=0.0):
        """Draw a card that appears to float with shadow."""
        if isinstance(fill_color, str):
            fill_color = hex_to_rgb(fill_color)
        if isinstance(outline_color, str):
            outline_color = hex_to_rgb(outline_color)

        # Floating animation
        float_y = int(math.sin(progress * math.pi * 2) * 5 * elevation)

        # Shadow (larger when higher)
        shadow_spread = 3 + elevation
        shadow_alpha = max(20, 80 - elevation * 10)
        draw.rounded_rectangle(
            [x + shadow_spread, y + shadow_spread + float_y + elevation * 2,
             x + card_w + shadow_spread, y + card_h + shadow_spread +
             float_y + elevation * 2],
            radius=12, fill=(0, 0, 0),
        )

        # Card
        draw.rounded_rectangle(
            [x, y + float_y, x + card_w, y + card_h + float_y],
            radius=12, fill=fill_color, outline=outline_color, width=2,
        )

        # Subtle gradient overlay (top highlight)
        highlight = tuple(min(255, c + 15) for c in fill_color)
        draw.rounded_rectangle(
            [x + 2, y + float_y + 2, x + card_w - 2, y + float_y + card_h // 3],
            radius=10, fill=highlight,
        )

        return float_y

    def draw_depth_layers(self, draw, layers, progress):
        """
        Draw multiple layers with parallax depth effect.
        layers: list of {"content": func, "depth": float, "y_offset": int}
        """
        for layer in sorted(layers, key=lambda l: l.get("depth", 0),
                            reverse=True):
            depth = layer.get("depth", 1.0)
            y_off = layer.get("y_offset", 0)

            # Parallax: deeper layers move slower
            parallax_x = int(math.sin(progress * math.pi) * 20 * depth)
            parallax_y = int(math.cos(progress * math.pi * 0.5) * 10 * depth)

            content_func = layer.get("content")
            if content_func:
                content_func(draw, parallax_x, parallax_y + y_off)

    def draw_perspective_grid(self, draw, progress, color=None):
        """Draw a perspective grid floor effect."""
        if color is None:
            color = hex_to_rgb(self.theme.get("border", "#1e293b"))

        vanishing_y = self.h // 3
        horizon_y = self.h * 2 // 3

        # Horizontal lines
        num_h = 12
        for i in range(num_h):
            t = i / num_h
            line_progress = min(1.0, progress * 2 - t * 0.3)
            if line_progress <= 0:
                continue

            y = horizon_y + int((self.h - horizon_y) * t * t)
            alpha = max(10, int(50 * (1 - t)))
            lc = tuple(min(c, alpha) for c in color)

            draw.line(
                [(0, y), (int(self.w * line_progress), y)],
                fill=lc, width=1,
            )

        # Converging vertical lines
        num_v = 10
        for i in range(num_v):
            t = (i - num_v // 2) / (num_v // 2)
            line_progress = min(1.0, progress * 2.5 - abs(t) * 0.2)
            if line_progress <= 0:
                continue

            top_x = self.w // 2 + int(t * 50)
            bottom_x = self.w // 2 + int(t * self.w * 0.6)
            alpha = max(10, int(40 * (1 - abs(t))))
            lc = tuple(min(c, alpha) for c in color)

            draw_y = horizon_y + int((self.h - horizon_y) * line_progress)
            draw.line(
                [(top_x, horizon_y), (bottom_x, draw_y)],
                fill=lc, width=1,
            )

    def draw_isometric_block(self, draw, x, y, size, color, progress=1.0):
        """Draw an isometric 3D block."""
        if isinstance(color, str):
            color = hex_to_rgb(color)

        s = int(size * ease_out_cubic(progress))
        if s < 5:
            return

        # Isometric angles
        dx = int(s * 0.866)  # cos(30°)
        dy = int(s * 0.5)    # sin(30°)

        top = [(x, y - s), (x + dx, y - s + dy),
               (x, y), (x - dx, y - s + dy)]
        right = [(x, y), (x + dx, y - s + dy),
                 (x + dx, y + dy), (x, y + s)]
        left = [(x, y), (x - dx, y - s + dy),
                (x - dx, y + dy), (x, y + s)]

        # Colors for each face
        top_c = tuple(min(255, int(c * 1.2)) for c in color)
        right_c = color
        left_c = tuple(max(0, int(c * 0.7)) for c in color)

        draw.polygon(left, fill=left_c)
        draw.polygon(right, fill=right_c)
        draw.polygon(top, fill=top_c)

        # Edges
        edge_c = tuple(min(255, c + 30) for c in color)
        draw.line([top[0], top[1]], fill=edge_c, width=1)
        draw.line([top[0], top[3]], fill=edge_c, width=1)
        draw.line([top[0], (x, y)], fill=edge_c, width=1)

    def render_3d_scene(self, draw, img, scene, progress, fonts):
        """Render a full scene with 3D depth effects."""
        tc = hex_to_rgb(self.theme["text"])
        pc = hex_to_rgb(self.theme["primary"])
        kp = scene.get("key_points", [])

        # Background perspective grid
        if progress > 0.05:
            self.draw_perspective_grid(draw, progress)

        # Title
        draw.text((70, 40), scene.get("title", "3D View"),
                  fill=pc, font=fonts["heading"])

        # Floating cards for key points
        n = len(kp)
        card_w = min(280, (self.w - 200) // max(min(n, 3), 1))
        card_h = 80
        cols = min(3, n)
        rows = math.ceil(n / cols)

        for i, pt in enumerate(kp[:9]):
            delay = 0.1 + i * 0.08
            cp = max(0, min(1.0, (progress - delay) * 3))
            if cp <= 0:
                continue

            col = i % cols
            row = i // cols
            x = 100 + col * (card_w + 30)
            y = 160 + row * (card_h + 50)
            elevation = 3 - row  # Higher cards have more elevation

            colors = [self.theme["primary"], self.theme["secondary"],
                      self.theme["accent"], self.theme["success"]]
            bc = hex_to_rgb(colors[i % len(colors)])
            cc = hex_to_rgb(self.theme["card_bg"])

            float_y = self.draw_floating_card(
                draw, img, x, y, card_w, card_h,
                cc, bc, elevation=max(1, elevation),
                progress=progress,
            )

            # Content
            if cp > 0.5:
                draw.text(
                    (x + 15, y + float_y + 10),
                    f"{i + 1}.",
                    fill=bc, font=fonts["body"],
                )
                draw.text(
                    (x + 45, y + float_y + 14),
                    pt[:28],
                    fill=tc, font=fonts["small"],
                )

        # Decorative isometric blocks in corner
        if progress > 0.4:
            bp = ease_out_cubic(min(1.0, (progress - 0.4) * 2))
            block_x = self.w - 150
            block_y = self.h - 150
            self.draw_isometric_block(
                draw, block_x, block_y, 30,
                self.theme["primary"], bp,
            )
            self.draw_isometric_block(
                draw, block_x + 40, block_y - 10, 25,
                self.theme["secondary"], bp * 0.8,
            )
            self.draw_isometric_block(
                draw, block_x - 20, block_y + 15, 20,
                self.theme["accent"], bp * 0.6,
            )