"""
animations/flow_renderer.py
Flowcharts, timelines, and process flow visualizations
"""

import math
from utils.colors import hex_to_rgb, cycle_colors
from animations.effects import (
    ease_out_cubic, ease_out_back, draw_rounded_box,
    centered_text, wrap_text, draw_glow_line, pulse_value,
    draw_progress_bar, draw_circular_progress,
)


def render_flowchart(draw, scene, progress, fonts, theme, w, h,
                     particles=None):
    """Render vertical flowchart with animated steps and connectors."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    # Title
    tp = ease_out_cubic(min(1.0, progress * 4))
    draw.text((70, 35), scene.get("title", "Process"), fill=pc,
              font=fonts["heading"])
    draw.line([(70, 90), (70 + int(400 * tp), 90)], fill=pc, width=2)

    visual = scene.get("visual_elements", {})
    steps = visual.get("steps", [])
    if not steps:
        steps = [
            {"step": i + 1, "title": pt}
            for i, pt in enumerate(scene.get("key_points", []))
        ]

    n = len(steps)
    if n == 0:
        return

    cx = w // 2
    bw, bh = min(520, w - 160), 68

    # Calculate vertical spacing
    available_h = h - 240
    gap = min(110, available_h // max(n, 1))
    start_y = 150

    colors = cycle_colors(theme, n)

    # ── Draw connector line (backbone)
    if progress > 0.05:
        backbone_p = min(1.0, progress * 2)
        total_h = (n - 1) * gap
        drawn_h = int(total_h * backbone_p)
        backbone_x = cx - bw // 2 + 30
        draw.line(
            [(backbone_x, start_y), (backbone_x, start_y + drawn_h)],
            fill=hex_to_rgb(theme["border"]), width=2,
        )

    for i, step in enumerate(steps[:10]):
        delay = 0.08 + i * 0.08
        sp = max(0, min(1.0, (progress - delay) * 3.5))
        if sp <= 0:
            continue

        ease = ease_out_cubic(sp)
        y = start_y + i * gap
        yo = int((1 - ease) * 30)
        bc = hex_to_rgb(colors[i % len(colors)])
        cc = hex_to_rgb(theme["card_bg"])

        # Active step highlight
        is_active = (i == int(progress * n) % n) and progress > 0.5

        # Shadow
        draw.rounded_rectangle(
            [cx - bw // 2 + 4, y - bh // 2 + yo + 4,
             cx + bw // 2 + 4, y + bh // 2 + yo + 4],
            radius=14, fill=(0, 0, 0),
        )

        # Step card
        outline_width = 3 if is_active else 2
        draw_rounded_box(
            draw,
            cx - bw // 2, y - bh // 2 + yo,
            cx + bw // 2, y + bh // 2 + yo,
            fill=cc, outline=bc, radius=14, width=outline_width,
        )

        # Left accent stripe
        draw.rounded_rectangle(
            [cx - bw // 2, y - bh // 2 + yo,
             cx - bw // 2 + 5, y + bh // 2 + yo],
            radius=3, fill=bc,
        )

        # Step number circle
        circle_x = cx - bw // 2 + 40
        circle_y = y + yo
        cr = 20
        draw.ellipse(
            [circle_x - cr, circle_y - cr,
             circle_x + cr, circle_y + cr],
            fill=bc,
        )
        centered_text(draw, str(i + 1), circle_x, circle_y,
                      fonts["body"], (255, 255, 255))

        # Step title
        title = step.get("title", f"Step {i + 1}")
        draw.text(
            (cx - bw // 2 + 75, y + yo - 14),
            title[:45], fill=tc, font=fonts["body"],
        )

        # Step description (if available)
        desc = step.get("description", "")
        if desc and ease > 0.7:
            draw.text(
                (cx - bw // 2 + 75, y + yo + 12),
                desc[:50],
                fill=hex_to_rgb(theme["text_muted"]),
                font=fonts["tiny"],
            )

        # ── Animated connector arrow
        if i < n - 1 and sp > 0.5:
            ap = min(1.0, (sp - 0.5) * 4)
            ay1 = y + bh // 2 + yo + 4
            ay2 = y + gap - bh // 2 - 4

            # Animated line drawing
            ae = int(ay1 + (ay2 - ay1) * ap)
            draw.line(
                [(cx, ay1), (cx, ae)],
                fill=hex_to_rgb(theme["text_muted"]), width=2,
            )

            # Arrow head
            if ap > 0.85:
                draw.polygon(
                    [(cx, ae + 8), (cx - 8, ae - 4), (cx + 8, ae - 4)],
                    fill=hex_to_rgb(theme["text_muted"]),
                )

            # Flowing dot on connector
            dot_y = int(ay1 + (ae - ay1) * ((progress * 5) % 1.0))
            draw.ellipse(
                [cx - 4, dot_y - 4, cx + 4, dot_y + 4],
                fill=bc,
            )

    # ── Progress indicator
    if progress > 0.3 and n > 1:
        active_step = min(n - 1, int(progress * n * 0.8))
        draw_progress_bar(
            draw, 70, h - 50, w - 140, 8,
            (active_step + 1) / n,
            hex_to_rgb(theme["border"]),
            hex_to_rgb(theme["primary"]),
            glow=True,
        )


def render_timeline(draw, scene, progress, fonts, theme, w, h,
                    particles=None):
    """Render horizontal timeline visualization."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    # Title
    tp = ease_out_cubic(min(1.0, progress * 4))
    draw.text((70, 35), scene.get("title", "Timeline"),
              fill=pc, font=fonts["heading"])

    visual = scene.get("visual_elements", {})
    steps = visual.get("steps", [])
    if not steps:
        steps = [
            {"step": i + 1, "title": pt}
            for i, pt in enumerate(scene.get("key_points", []))
        ]

    n = len(steps)
    if n == 0:
        return

    # Timeline parameters
    tl_y = h // 2 + 20
    margin = 120
    tl_w = w - margin * 2

    # ── Draw timeline backbone
    if progress > 0.05:
        bp = min(1.0, progress * 2.5)
        drawn_w = int(tl_w * bp)
        draw.line(
            [(margin, tl_y), (margin + drawn_w, tl_y)],
            fill=hex_to_rgb(theme["border"]), width=4,
        )
        # Active portion
        active_w = int(drawn_w * min(1.0, progress * 1.2))
        draw.line(
            [(margin, tl_y), (margin + active_w, tl_y)],
            fill=pc, width=4,
        )

    colors = cycle_colors(theme, n)

    for i, step in enumerate(steps[:8]):
        delay = 0.12 + i * 0.1
        sp = max(0, min(1.0, (progress - delay) * 3))
        if sp <= 0:
            continue

        ease = ease_out_back(min(1.0, sp * 1.1))
        x = margin + int(tl_w * (i / max(n - 1, 1)))
        bc = hex_to_rgb(colors[i])

        # Timeline dot
        dot_r = int(12 * ease)
        draw.ellipse(
            [x - dot_r, tl_y - dot_r, x + dot_r, tl_y + dot_r],
            fill=bc,
        )

        # Connector line
        above = i % 2 == 0
        line_len = int(60 * ease)

        if above:
            ly = tl_y - line_len
            draw.line([(x, tl_y - dot_r), (x, ly)], fill=bc, width=2)
            # Content card
            card_w, card_h = 140, 55
            draw_rounded_box(
                draw,
                x - card_w // 2, ly - card_h,
                x + card_w // 2, ly - 5,
                fill=hex_to_rgb(theme["card_bg"]),
                outline=bc, radius=10, width=2,
            )
            centered_text(
                draw, step.get("title", f"Step {i + 1}")[:18],
                x, ly - card_h // 2 - 2,
                fonts["label"], tc,
            )
        else:
            ly = tl_y + line_len
            draw.line([(x, tl_y + dot_r), (x, ly)], fill=bc, width=2)
            card_w, card_h = 140, 55
            draw_rounded_box(
                draw,
                x - card_w // 2, ly + 5,
                x + card_w // 2, ly + card_h,
                fill=hex_to_rgb(theme["card_bg"]),
                outline=bc, radius=10, width=2,
            )
            centered_text(
                draw, step.get("title", f"Step {i + 1}")[:18],
                x, ly + card_h // 2 + 2,
                fonts["label"], tc,
            )

        # Step number
        centered_text(draw, str(i + 1), x, tl_y,
                      fonts["tiny"], (255, 255, 255))


def render_process_flow(draw, scene, progress, fonts, theme, w, h,
                        particles=None):
    """Render horizontal process flow with arrows."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    draw.text((70, 35), scene.get("title", "Process Flow"),
              fill=pc, font=fonts["heading"])

    kp = scene.get("key_points", [])
    n = len(kp)
    if n == 0:
        return

    cy = h // 2 + 20
    margin = 100
    avail_w = w - margin * 2
    box_w = min(180, (avail_w - 50 * (n - 1)) // max(n, 1))
    box_h = 80
    gap = (avail_w - box_w * n) // max(n - 1, 1) if n > 1 else 0
    colors = cycle_colors(theme, n)

    for i, pt in enumerate(kp[:6]):
        delay = 0.05 + i * 0.12
        sp = max(0, min(1.0, (progress - delay) * 3))
        if sp <= 0:
            continue

        ease = ease_out_cubic(sp)
        x = margin + i * (box_w + gap)
        bc = hex_to_rgb(colors[i])
        cc = hex_to_rgb(theme["card_bg"])

        # Scale in
        cur_w = int(box_w * ease)
        cur_h = int(box_h * ease)

        draw_rounded_box(
            draw,
            x + (box_w - cur_w) // 2,
            cy - cur_h // 2,
            x + (box_w + cur_w) // 2,
            cy + cur_h // 2,
            fill=cc, outline=bc, radius=12, width=2,
            shadow=True,
        )

        if ease > 0.5:
            centered_text(
                draw, pt[:16],
                x + box_w // 2, cy,
                fonts["small"], tc,
            )

        # Arrow between boxes
        if i < n - 1 and sp > 0.6:
            ap = min(1.0, (sp - 0.6) * 4)
            ax1 = x + box_w + 4
            ax2 = x + box_w + gap - 4
            amx = int(ax1 + (ax2 - ax1) * ap)
            draw.line([(ax1, cy), (amx, cy)], fill=bc, width=3)
            if ap > 0.8:
                draw.polygon(
                    [(amx + 8, cy), (amx - 4, cy - 7), (amx - 4, cy + 7)],
                    fill=bc,
                )