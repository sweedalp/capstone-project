"""
animations/diagram_renderer.py
Architecture diagrams, mind maps, and network visualizations
"""

import math
from PIL import ImageDraw
from utils.colors import hex_to_rgb, cycle_colors
from animations.effects import (
    ease_out_cubic, ease_out_elastic, draw_glow_circle,
    draw_animated_arrow, draw_rounded_box, centered_text,
    wrap_text, draw_glow_line, draw_dashed_line,
    draw_icon_circle, pulse_value, wave_offset,
)


def render_architecture(draw, scene, progress, fonts, theme, w, h,
                        particles=None):
    """Render architecture diagram with animated components and connections."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    # ── Title with animated underline
    title_p = ease_out_cubic(min(1.0, progress * 4))
    if title_p > 0.1:
        draw.text((70, 40), scene.get("title", "Architecture"),
                  fill=pc, font=fonts["heading"])
        line_w = int(500 * title_p)
        draw.line([(70, 100), (70 + line_w, 100)], fill=pc, width=3)

        # Subtitle badge
        scene_type = scene.get("scene_type", "")
        if scene_type and title_p > 0.5:
            draw.rounded_rectangle([70, 108, 220, 128], radius=8,
                                   fill=hex_to_rgb(theme["card_bg"]),
                                   outline=pc, width=1)
            draw.text((80, 110), f"📐 {scene_type}",
                      fill=hex_to_rgb(theme["text_muted"]),
                      font=fonts["tiny"])

    visual = scene.get("visual_elements", {})
    components = visual.get("components", [])
    connections = visual.get("connections", [])

    # Build components from key_points if empty
    if not components:
        kp = scene.get("key_points", [])
        if len(kp) >= 2:
            positions_list = ["left", "center", "right", "top", "bottom"]
            components = [
                {"name": kp[i], "position": positions_list[i % len(positions_list)]}
                for i in range(len(kp))
            ]
            for i in range(len(kp) - 1):
                connections.append({
                    "from": kp[i], "to": kp[i + 1], "label": ""
                })

    # ── Calculate positions
    cx, cy = w // 2, h // 2 + 40
    spacing = min(320, (w - 200) // 3)
    pos_map = {
        "left": (-spacing, 0),
        "right": (spacing, 0),
        "center": (0, 0),
        "top": (0, -180),
        "bottom": (0, 180),
        "top_left": (-spacing, -150),
        "top_right": (spacing, -150),
        "bottom_left": (-spacing, 150),
        "bottom_right": (spacing, 150),
    }

    positions = {}
    for i, comp in enumerate(components):
        p = comp.get("position", "center")
        if p in pos_map:
            dx, dy = pos_map[p]
        else:
            angle = (2 * math.pi * i / max(len(components), 1)) - math.pi / 2
            radius = min(280, spacing)
            dx = int(radius * math.cos(angle))
            dy = int(radius * math.sin(angle))
        positions[comp["name"]] = (cx + dx, cy + dy)

    # ── Draw connections
    if progress > 0.25:
        cp = min(1.0, (progress - 0.25) * 2.5)
        for conn in connections:
            fn = conn.get("from", "")
            tn = conn.get("to", "")
            if fn in positions and tn in positions:
                x1, y1 = positions[fn]
                x2, y2 = positions[tn]

                conn_type = conn.get("type", "arrow")
                accent_c = hex_to_rgb(theme["accent"])

                if conn_type == "dashed":
                    if cp > 0.3:
                        draw_dashed_line(draw, x1, y1, x2, y2, accent_c)
                else:
                    draw_animated_arrow(draw, x1, y1, x2, y2, accent_c, cp)

                # Connection label
                if cp > 0.7 and conn.get("label"):
                    mx = (x1 + x2) // 2
                    my = (y1 + y2) // 2 - 22
                    # Label background
                    label = conn["label"][:20]
                    lw = len(label) * 7
                    draw.rounded_rectangle(
                        [mx - lw // 2 - 4, my - 10, mx + lw // 2 + 4, my + 12],
                        radius=6, fill=hex_to_rgb(theme["card_bg"]),
                        outline=hex_to_rgb(theme["border"]), width=1,
                    )
                    centered_text(draw, label, mx, my,
                                  fonts["tiny"],
                                  hex_to_rgb(theme["text_muted"]))

                # Particle effects on connections
                if particles and cp > 0.5:
                    particles.emit_connection_particles(
                        x1, y1, x2, y2, count=2,
                        color=theme["accent"]
                    )

    # ── Draw component boxes
    colors = cycle_colors(theme, len(components))

    for i, comp in enumerate(components):
        delay = 0.08 + i * 0.1
        cp = max(0, min(1.0, (progress - delay) * 3))
        if cp <= 0:
            continue

        ease = ease_out_cubic(cp)
        name = comp["name"]
        if name not in positions:
            continue

        x, y = positions[name]
        bw, bh = 200, 78
        box_c = hex_to_rgb(colors[i % len(colors)])
        card_c = hex_to_rgb(theme["card_bg"])

        # Scale animation
        cur_bw = int(bw * ease)
        cur_bh = int(bh * ease)

        # Glow effect
        draw_glow_circle(draw, x, y, 55, colors[i % len(colors)], rings=2)

        # Shadow
        draw.rounded_rectangle(
            [x - cur_bw // 2 + 3, y - cur_bh // 2 + 3,
             x + cur_bw // 2 + 3, y + cur_bh // 2 + 3],
            radius=14, fill=(0, 0, 0),
        )

        # Main box
        draw_rounded_box(
            draw,
            x - cur_bw // 2, y - cur_bh // 2,
            x + cur_bw // 2, y + cur_bh // 2,
            fill=card_c, outline=box_c, radius=14, width=3,
        )

        # Accent stripe on left
        draw.rounded_rectangle(
            [x - cur_bw // 2, y - cur_bh // 2,
             x - cur_bw // 2 + 6, y + cur_bh // 2],
            radius=3, fill=box_c,
        )

        # Icon circle
        icon_r = 16
        ix = x - cur_bw // 2 + 30
        iy = y - 4
        draw.ellipse(
            [ix - icon_r, iy - icon_r, ix + icon_r, iy + icon_r],
            fill=box_c,
        )
        centered_text(draw, str(i + 1), ix, iy, fonts["small"], (255, 255, 255))

        # Component name
        if ease > 0.5:
            display_name = name[:24]
            draw.text(
                (x - cur_bw // 2 + 55, y - 12),
                display_name, fill=tc, font=fonts["small"],
            )

            # Component type subtitle
            comp_type = comp.get("type", "")
            if comp_type:
                draw.text(
                    (x - cur_bw // 2 + 55, y + 10),
                    comp_type[:20],
                    fill=hex_to_rgb(theme["text_muted"]),
                    font=fonts["tiny"],
                )

        # Pulse animation on active component
        if ease > 0.9:
            pulse = pulse_value(progress, speed=3, min_val=0.95, max_val=1.05)
            pr = int(cur_bw // 2 * pulse)
            draw.rounded_rectangle(
                [x - pr, y - int(cur_bh // 2 * pulse),
                 x + pr, y + int(cur_bh // 2 * pulse)],
                radius=14, outline=box_c, width=1,
            )

    # ── Narration text at bottom
    if progress > 0.6:
        narr = scene.get("narration", "")
        lines = wrap_text(narr, 70)
        narr_y = h - 120
        # Background for narration
        if lines:
            draw.rounded_rectangle(
                [50, narr_y - 10, w - 50, narr_y + len(lines[:2]) * 28 + 10],
                radius=10, fill=hex_to_rgb(theme["card_bg"]),
                outline=hex_to_rgb(theme["border"]), width=1,
            )
        for i, line in enumerate(lines[:2]):
            draw.text(
                (70, narr_y + i * 28),
                line, fill=hex_to_rgb(theme["text_muted"]),
                font=fonts["label"],
            )


def render_mind_map(draw, scene, progress, fonts, theme, w, h,
                    particles=None):
    """Render mind map with central node and branches."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    # Title
    draw.text((70, 40), scene.get("title", ""), fill=pc, font=fonts["heading"])

    cx, cy = w // 2, h // 2 + 30
    kp = scene.get("key_points", [])
    n = len(kp)
    colors = cycle_colors(theme, max(n, 5))

    # ── Central node
    cp = min(1.0, progress * 3)
    if cp > 0.1:
        ease = ease_out_cubic(cp)
        r = int(90 * ease)
        pulse = pulse_value(progress, speed=3, min_val=0.97, max_val=1.03)
        r = int(r * pulse)

        # Glow rings
        draw_glow_circle(draw, cx, cy, r + 10, theme["primary"], rings=3)

        # Shadow
        draw.ellipse(
            [cx - r + 3, cy - r + 3, cx + r + 3, cy + r + 3],
            fill=(0, 0, 0),
        )

        # Main circle
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=hex_to_rgb(theme["card_bg"]),
            outline=pc, width=4,
        )

        # Center text
        title = scene.get("title", "Topic")[:16]
        centered_text(draw, title, cx, cy, fonts["body"], tc)

    # ── Branch nodes
    for i, pt in enumerate(kp[:10]):
        delay = 0.2 + i * 0.07
        np_ = max(0, min(1.0, (progress - delay) * 2.5))
        if np_ <= 0:
            continue

        ease = ease_out_cubic(np_)
        angle = (2 * math.pi * i / max(n, 1)) - math.pi / 2
        dist = min(260, (min(w, h) - 200) // 2) * ease
        nx = int(cx + dist * math.cos(angle))
        ny = int(cy + dist * math.sin(angle))
        nc = hex_to_rgb(colors[i % len(colors)])

        # Curved branch line
        mid_dist = dist * 0.5
        mid_x = int(cx + mid_dist * math.cos(angle + 0.15))
        mid_y = int(cy + mid_dist * math.sin(angle + 0.15))

        # Branch line with glow
        draw_glow_line(draw, cx, cy, nx, ny, colors[i % len(colors)],
                       width=2, glow_width=1)

        # Sub-branches (decorative)
        if ease > 0.7:
            sub_angle1 = angle - 0.4
            sub_angle2 = angle + 0.4
            sub_dist = 45
            sx1 = nx + int(sub_dist * math.cos(sub_angle1))
            sy1 = ny + int(sub_dist * math.sin(sub_angle1))
            sx2 = nx + int(sub_dist * math.cos(sub_angle2))
            sy2 = ny + int(sub_dist * math.sin(sub_angle2))
            draw.line([(nx, ny), (sx1, sy1)], fill=nc, width=1)
            draw.line([(nx, ny), (sx2, sy2)], fill=nc, width=1)
            draw.ellipse([sx1 - 4, sy1 - 4, sx1 + 4, sy1 + 4], fill=nc)
            draw.ellipse([sx2 - 4, sy2 - 4, sx2 + 4, sy2 + 4], fill=nc)

        # Node box
        node_w, node_h = 150, 50
        draw.rounded_rectangle(
            [nx - node_w // 2, ny - node_h // 2,
             nx + node_w // 2, ny + node_h // 2],
            radius=node_h // 2,
            fill=hex_to_rgb(theme["card_bg"]),
            outline=nc, width=2,
        )

        # Node text
        centered_text(draw, pt[:20], nx, ny, fonts["label"], tc)

        # Node index dot
        dot_x = nx - node_w // 2 - 12
        draw.ellipse(
            [dot_x - 8, ny - 8, dot_x + 8, ny + 8],
            fill=nc,
        )
        centered_text(draw, str(i + 1), dot_x, ny, fonts["tiny"],
                      (255, 255, 255))

        # Emit particles at nodes
        if particles and ease > 0.8:
            particles.emit_sparkle(nx, ny, count=2,
                                   color=colors[i % len(colors)])


def render_network(draw, scene, progress, fonts, theme, w, h,
                   particles=None):
    """Render network graph visualization."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    draw.text((70, 40), scene.get("title", "Network"),
              fill=pc, font=fonts["heading"])

    kp = scene.get("key_points", [])
    n = len(kp)
    if n == 0:
        return

    cx, cy = w // 2, h // 2 + 30
    colors = cycle_colors(theme, n)

    # Calculate positions in a force-directed-like layout
    positions = []
    for i in range(n):
        angle = (2 * math.pi * i / n) - math.pi / 2
        r = min(220, (min(w, h) - 300) // 2)
        if n <= 3:
            r = 160
        px = cx + int(r * math.cos(angle))
        py = cy + int(r * math.sin(angle))
        positions.append((px, py))

    # Draw edges (connect all nodes for dense graph look)
    if progress > 0.15:
        ep = min(1.0, (progress - 0.15) * 2)
        for i in range(n):
            for j in range(i + 1, n):
                if ep > 0.3:
                    x1, y1 = positions[i]
                    x2, y2 = positions[j]
                    dist = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
                    if dist < 500:
                        alpha = max(30, int(100 * (1 - dist / 500)))
                        ec = hex_to_rgb(theme["border"])
                        draw.line([(x1, y1), (x2, y2)], fill=ec, width=1)

    # Draw nodes
    for i, (pt, (px, py)) in enumerate(zip(kp, positions)):
        delay = 0.1 + i * 0.08
        np_ = max(0, min(1.0, (progress - delay) * 3))
        if np_ <= 0:
            continue

        ease = ease_out_elastic(min(1.0, np_ * 1.2))
        r = int(35 * ease)
        nc = hex_to_rgb(colors[i])

        draw_glow_circle(draw, px, py, r, colors[i], rings=2)
        draw.ellipse([px - r, py - r, px + r, py + r], fill=nc)
        centered_text(draw, str(i + 1), px, py, fonts["body"],
                      (255, 255, 255))
        centered_text(draw, pt[:18], px, py + r + 18, fonts["label"], tc)