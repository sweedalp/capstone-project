"""
animations/metaphor_renderer.py
Creative metaphor visualizations - cars, trees, animals, brains, roads
"""

import math
from PIL import ImageDraw
from utils.colors import hex_to_rgb, cycle_colors
from animations.effects import (
    ease_out_cubic, ease_out_elastic, centered_text, wrap_text,
    draw_rounded_box, draw_glow_circle, pulse_value,
)


def render_metaphor(draw, scene, progress, fonts, theme, w, h,
                    particles=None):
    """Route to specific metaphor renderer based on visual_elements."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    draw.text((70, 40), scene.get("title", ""), fill=pc,
              font=fonts["heading"])

    visual = scene.get("visual_elements", {})
    metaphor = visual.get("metaphor", "car")

    renderers = {
        "car": _render_car_metaphor,
        "tree": _render_tree_metaphor,
        "animal": _render_animal_metaphor,
        "brain": _render_brain_metaphor,
        "road": _render_road_metaphor,
        "factory": _render_factory_metaphor,
        "building": _render_building_metaphor,
        "ocean": _render_ocean_metaphor,
    }

    renderer = renderers.get(metaphor, _render_car_metaphor)
    renderer(draw, scene, progress, fonts, theme, w, h, particles)


def _render_car_metaphor(draw, scene, progress, fonts, theme, w, h,
                         particles=None):
    """Car = System with engine, wheels, body as components."""
    tc = hex_to_rgb(theme["text"])
    cx, cy = w // 2, h // 2 + 40
    kp = scene.get("key_points", [])

    ep = ease_out_cubic(min(1.0, progress * 2))

    # ── Road
    road_y = cy + 100
    draw.rectangle([0, road_y, w, road_y + 60], fill=(40, 40, 50))
    draw.rectangle([0, road_y, w, road_y + 3], fill=(255, 255, 255))

    # Road dashes
    dash_offset = int(progress * 200) % 60
    for dx in range(-60, w + 60, 60):
        draw.rectangle(
            [dx + dash_offset, road_y + 28, dx + 30 + dash_offset, road_y + 34],
            fill=(255, 255, 255),
        )

    # ── Car body animation
    car_x = int(-200 + (cx - 100) * ease_out_cubic(min(1.0, progress * 1.5)))

    if ep > 0.2:
        # Car body
        body_color = hex_to_rgb(theme["primary"])
        draw.rounded_rectangle(
            [car_x, cy + 20, car_x + 300, cy + 90],
            radius=15, fill=body_color,
        )

        # Car roof
        draw.polygon(
            [(car_x + 60, cy + 20),
             (car_x + 100, cy - 30),
             (car_x + 220, cy - 30),
             (car_x + 260, cy + 20)],
            fill=body_color,
        )

        # Windows
        window_c = (30, 30, 60)
        draw.polygon(
            [(car_x + 108, cy + 16),
             (car_x + 115, cy - 22),
             (car_x + 155, cy - 22),
             (car_x + 155, cy + 16)],
            fill=window_c,
        )
        draw.polygon(
            [(car_x + 165, cy + 16),
             (car_x + 165, cy - 22),
             (car_x + 210, cy - 22),
             (car_x + 245, cy + 16)],
            fill=window_c,
        )

        # Headlight
        draw.ellipse(
            [car_x + 280, cy + 40, car_x + 305, cy + 60],
            fill=(255, 255, 180),
        )

        # Taillight
        draw.ellipse(
            [car_x - 5, cy + 50, car_x + 15, cy + 65],
            fill=hex_to_rgb(theme["danger"]),
        )

        # Wheels with rotation
        wheel_angle = progress * math.pi * 8
        for wx in [car_x + 60, car_x + 240]:
            wy = cy + 90
            # Tire
            draw.ellipse([wx - 25, wy - 25, wx + 25, wy + 25],
                         fill=(30, 30, 30))
            # Hub
            draw.ellipse([wx - 10, wy - 10, wx + 10, wy + 10],
                         fill=(150, 150, 150))
            # Spoke (animated)
            sx = wx + int(8 * math.cos(wheel_angle))
            sy = wy + int(8 * math.sin(wheel_angle))
            draw.line([(wx, wy), (sx, sy)], fill=(200, 200, 200), width=2)

        # ── Exhaust particles
        if particles and progress > 0.3:
            particles.emit_sparkle(car_x - 10, cy + 70, count=1,
                                   color=theme["text_muted"])

    # ── Labels pointing to car parts
    labels = {
        "Engine": (car_x + 250, cy + 50),
        "Wheels": (car_x + 60, cy + 110),
        "Body": (car_x + 150, cy + 55),
        "Windows": (car_x + 160, cy - 5),
    }

    if len(kp) > 0:
        label_items = list(labels.items())[:len(kp)]
        for i, ((label, (lx, ly)), kpt) in enumerate(
                zip(label_items, kp)):
            delay = 0.4 + i * 0.12
            lp = max(0, min(1.0, (progress - delay) * 3))
            if lp > 0.3:
                # Label box
                bx = lx + 40
                by = ly - 60
                draw.line([(lx, ly), (bx, by)],
                          fill=hex_to_rgb(theme["accent"]), width=2)
                draw_rounded_box(
                    draw, bx - 5, by - 20, bx + 180, by + 20,
                    fill=hex_to_rgb(theme["card_bg"]),
                    outline=hex_to_rgb(theme["accent"]),
                    radius=8, width=1,
                )
                draw.text((bx + 5, by - 14), f"{label}: {kpt[:18]}",
                          fill=tc, font=fonts["label"])


def _render_tree_metaphor(draw, scene, progress, fonts, theme, w, h,
                          particles=None):
    """Tree = hierarchical system with root, trunk, branches, leaves."""
    tc = hex_to_rgb(theme["text"])
    cx, cy = w // 2, h // 2 + 60
    kp = scene.get("key_points", [])

    ep = ease_out_cubic(min(1.0, progress * 2))

    # ── Ground
    draw.rounded_rectangle(
        [0, cy + 120, w, h],
        radius=0, fill=(30, 50, 30),
    )

    # ── Trunk
    if ep > 0.1:
        trunk_h = int(220 * ep)
        trunk_w = 35
        trunk_c = (120, 80, 40)

        draw.rounded_rectangle(
            [cx - trunk_w // 2, cy + 120 - trunk_h,
             cx + trunk_w // 2, cy + 120],
            radius=8, fill=trunk_c,
        )

        # Bark texture
        for ty in range(cy + 120 - trunk_h, cy + 120, 25):
            draw.arc(
                [cx - trunk_w // 2 - 2, ty,
                 cx + trunk_w // 2 + 2, ty + 15],
                0, 180, fill=(90, 60, 30), width=1,
            )

    # ── Root label
    if ep > 0.3:
        draw_rounded_box(
            draw, cx - 60, cy + 125, cx + 60, cy + 155,
            fill=hex_to_rgb(theme["card_bg"]),
            outline=hex_to_rgb(theme["accent"]),
            radius=8, width=2,
        )
        centered_text(draw, "Root", cx, cy + 140, fonts["small"], tc)

    # ── Canopy / branches
    if ep > 0.3:
        canopy_p = min(1.0, (progress - 0.3) * 2.5)
        ease_c = ease_out_elastic(min(1.0, canopy_p * 0.9))

        # Main canopy
        canopy_r = int(180 * ease_c)
        canopy_y = cy + 120 - int(220 * ep) - 40
        green = hex_to_rgb(theme["accent"])
        dark_green = (20, 120, 60)

        draw.ellipse(
            [cx - canopy_r, canopy_y - canopy_r + 30,
             cx + canopy_r, canopy_y + canopy_r + 30],
            fill=dark_green,
        )
        draw.ellipse(
            [cx - canopy_r + 30, canopy_y - canopy_r,
             cx + canopy_r - 30, canopy_y + canopy_r - 20],
            fill=green,
        )
        draw.ellipse(
            [cx - canopy_r + 60, canopy_y - canopy_r + 50,
             cx + canopy_r - 60, canopy_y + canopy_r - 40],
            fill=(40, 200, 100),
        )

    # ── Branch labels (key points as branches)
    n = len(kp)
    for i, pt in enumerate(kp[:6]):
        delay = 0.45 + i * 0.1
        bp = max(0, min(1.0, (progress - delay) * 3))
        if bp <= 0:
            continue

        ease = ease_out_cubic(bp)
        angle = -math.pi / 2 + (i - n / 2 + 0.5) * 0.6
        branch_len = int(160 * ease)
        bx = cx + int(branch_len * math.cos(angle))
        by = (cy - 80) + int(branch_len * math.sin(angle))

        # Branch line
        draw.line([(cx, cy - 80), (bx, by)],
                  fill=(120, 80, 40), width=3)

        # Leaf node
        leaf_r = 12
        leaf_c = hex_to_rgb(theme["success"])
        draw.ellipse(
            [bx - leaf_r, by - leaf_r, bx + leaf_r, by + leaf_r],
            fill=leaf_c,
        )

        # Label
        label_x = bx + (25 if math.cos(angle) > 0 else -100)
        draw_rounded_box(
            draw, label_x, by - 12, label_x + 100, by + 12,
            fill=hex_to_rgb(theme["card_bg"]),
            outline=leaf_c, radius=6, width=1,
        )
        draw.text((label_x + 6, by - 8), pt[:14],
                  fill=tc, font=fonts["tiny"])


def _render_animal_metaphor(draw, scene, progress, fonts, theme, w, h,
                            particles=None):
    """Animals as system helpers - each animal represents a tool/service."""
    tc = hex_to_rgb(theme["text"])
    kp = scene.get("key_points", [])
    cx, cy = w // 2, h // 2 + 40

    # Background grass
    draw.rectangle([0, cy + 80, w, h], fill=(25, 60, 25))

    # Sky gradient hint
    for sy in range(100, cy + 80):
        t = (sy - 100) / max(1, cy + 80 - 100)
        c = (8 + int(10 * t), 8 + int(15 * t), 26 + int(20 * t))
        draw.line([(0, sy), (w, sy)], fill=c)

    animals = ["🐕", "🐈", "🦊", "🐻", "🦉", "🐝"]
    colors = cycle_colors(theme, len(kp))

    n = len(kp)
    spacing = min(240, (w - 200) // max(n, 1))

    for i, pt in enumerate(kp[:6]):
        delay = 0.1 + i * 0.12
        ap = max(0, min(1.0, (progress - delay) * 3))
        if ap <= 0:
            continue

        ease = ease_out_elastic(min(1.0, ap * 0.85))
        x = w // 2 - (n - 1) * spacing // 2 + i * spacing
        y = cy + int(20 * (1 - ease))

        # Animal circle
        ar = int(40 * ease)
        ac = hex_to_rgb(colors[i])
        draw_glow_circle(draw, x, y, ar, colors[i], rings=2)
        draw.ellipse([x - ar, y - ar, x + ar, y + ar], fill=ac)

        # Animal emoji
        if ease > 0.5:
            emoji = animals[i % len(animals)]
            centered_text(draw, emoji, x, y, fonts["heading"], (255, 255, 255))

        # Label
        if ease > 0.7:
            draw_rounded_box(
                draw, x - 65, y + ar + 10, x + 65, y + ar + 40,
                fill=hex_to_rgb(theme["card_bg"]),
                outline=ac, radius=8, width=1,
            )
            centered_text(draw, pt[:14], x, y + ar + 25,
                          fonts["label"], tc)

    # Narration
    if progress > 0.6:
        narr = scene.get("narration", "")
        lines = wrap_text(narr, 65)
        for i, ln in enumerate(lines[:2]):
            draw.text((70, h - 100 + i * 26), ln,
                      fill=hex_to_rgb(theme["text_muted"]),
                      font=fonts["label"])


def _render_brain_metaphor(draw, scene, progress, fonts, theme, w, h,
                           particles=None):
    """Brain with neural connections representing system thinking."""
    tc = hex_to_rgb(theme["text"])
    cx, cy = w // 2, h // 2 + 20
    kp = scene.get("key_points", [])

    ep = ease_out_cubic(min(1.0, progress * 2))

    # ── Brain outline (simplified oval)
    if ep > 0.1:
        br_w = int(200 * ep)
        br_h = int(160 * ep)

        # Brain shadow
        draw.ellipse(
            [cx - br_w + 4, cy - br_h + 4, cx + br_w + 4, cy + br_h + 4],
            fill=(0, 0, 0),
        )

        # Brain body
        brain_c = hex_to_rgb(theme["secondary"])
        draw.ellipse(
            [cx - br_w, cy - br_h, cx + br_w, cy + br_h],
            fill=brain_c, outline=hex_to_rgb(theme["primary"]), width=3,
        )

        # Brain hemisphere line
        draw.arc(
            [cx - 10, cy - br_h, cx + 10, cy + br_h],
            -90, 90, fill=hex_to_rgb(theme["primary"]), width=2,
        )

        # Neural wrinkles
        for angle in [0.3, 0.8, 1.3, 1.8, 2.3, 2.8]:
            wr = int(br_w * 0.6)
            wx = cx + int(wr * math.cos(angle))
            wy = cy + int(br_h * 0.5 * math.sin(angle))
            draw.arc(
                [wx - 30, wy - 20, wx + 30, wy + 20],
                0, 180, fill=hex_to_rgb(theme["primary"]), width=1,
            )

    # ── Neural connection nodes (key points)
    n = len(kp)
    colors = cycle_colors(theme, n)

    for i, pt in enumerate(kp[:8]):
        delay = 0.3 + i * 0.08
        np_ = max(0, min(1.0, (progress - delay) * 3))
        if np_ <= 0:
            continue

        ease = ease_out_cubic(np_)
        angle = (2 * math.pi * i / max(n, 1)) - math.pi / 2
        dist = int(250 * ease)
        nx = cx + int(dist * math.cos(angle))
        ny = cy + int(dist * math.sin(angle))
        nc = hex_to_rgb(colors[i])

        # Neural synapse line
        draw.line([(cx, cy), (nx, ny)], fill=nc, width=2)

        # Synapse pulse dots
        pulse_pos = (progress * 6 + i * 0.3) % 1.0
        px = int(cx + (nx - cx) * pulse_pos)
        py = int(cy + (ny - cy) * pulse_pos)
        draw.ellipse([px - 4, py - 4, px + 4, py + 4], fill=nc)

        # Node
        nr = 8
        draw.ellipse([nx - nr, ny - nr, nx + nr, ny + nr], fill=nc)

        # Label
        label_offset = 20 if math.cos(angle) > 0 else -120
        draw.text((nx + label_offset, ny - 8), pt[:16],
                  fill=tc, font=fonts["label"])


def _render_road_metaphor(draw, scene, progress, fonts, theme, w, h,
                          particles=None):
    """Road/highway representing journey or pipeline."""
    tc = hex_to_rgb(theme["text"])
    kp = scene.get("key_points", [])

    # ── Road surface
    road_y = h // 2 + 50
    draw.rectangle([0, road_y - 40, w, road_y + 40], fill=(50, 50, 60))
    draw.rectangle([0, road_y - 2, w, road_y + 2], fill=(200, 200, 50))

    # Road edges
    draw.rectangle([0, road_y - 40, w, road_y - 37], fill=(255, 255, 255))
    draw.rectangle([0, road_y + 37, w, road_y + 40], fill=(255, 255, 255))

    # Moving dashes
    offset = int(progress * 300) % 60
    for dx in range(-60, w + 60, 60):
        draw.rectangle(
            [dx + offset, road_y - 2, dx + 25 + offset, road_y + 2],
            fill=(255, 255, 200),
        )

    # ── Milestones along the road
    n = len(kp)
    colors = cycle_colors(theme, n)

    for i, pt in enumerate(kp[:6]):
        delay = 0.1 + i * 0.15
        mp = max(0, min(1.0, (progress - delay) * 2.5))
        if mp <= 0:
            continue

        ease = ease_out_cubic(mp)
        x = 120 + i * ((w - 240) // max(n - 1, 1))
        mc = hex_to_rgb(colors[i])

        # Milestone post
        post_h = int(80 * ease)
        draw.rectangle(
            [x - 3, road_y - 40 - post_h, x + 3, road_y - 40],
            fill=mc,
        )

        # Sign
        sign_w, sign_h = 120, 40
        sign_y = road_y - 40 - post_h - sign_h
        draw_rounded_box(
            draw,
            x - sign_w // 2, sign_y,
            x + sign_w // 2, sign_y + sign_h,
            fill=hex_to_rgb(theme["card_bg"]),
            outline=mc, radius=8, width=2,
        )
        centered_text(draw, pt[:14], x, sign_y + sign_h // 2,
                      fonts["label"], tc)

        # Distance marker
        centered_text(
            draw, f"• {i + 1}", x, road_y + 55,
            fonts["tiny"], hex_to_rgb(theme["text_muted"]),
        )


def _render_factory_metaphor(draw, scene, progress, fonts, theme, w, h,
                             particles=None):
    """Factory pipeline with input, processing, output."""
    _render_road_metaphor(draw, scene, progress, fonts, theme, w, h, particles)


def _render_building_metaphor(draw, scene, progress, fonts, theme, w, h,
                              particles=None):
    """Building with floors representing layers."""
    tc = hex_to_rgb(theme["text"])
    kp = scene.get("key_points", [])
    cx = w // 2
    colors = cycle_colors(theme, len(kp))

    n = len(kp)
    floor_h = min(70, (h - 250) // max(n, 1))
    building_w = 400
    base_y = h - 100

    for i, pt in enumerate(kp[:8]):
        delay = 0.05 + i * 0.1
        fp = max(0, min(1.0, (progress - delay) * 3))
        if fp <= 0:
            continue

        ease = ease_out_cubic(fp)
        y = base_y - (i + 1) * floor_h
        fw = int(building_w * ease)
        fc = hex_to_rgb(colors[i])
        cc = hex_to_rgb(theme["card_bg"])

        draw_rounded_box(
            draw,
            cx - fw // 2, y,
            cx + fw // 2, y + floor_h - 5,
            fill=cc, outline=fc, radius=6, width=2,
        )
        centered_text(draw, f"L{i + 1}: {pt[:20]}", cx, y + floor_h // 2 - 3,
                      fonts["small"], tc)


def _render_ocean_metaphor(draw, scene, progress, fonts, theme, w, h,
                           particles=None):
    """Ocean layers representing depth of understanding."""
    _render_building_metaphor(draw, scene, progress, fonts, theme, w, h,
                              particles)