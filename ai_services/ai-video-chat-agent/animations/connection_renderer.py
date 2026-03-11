"""
animations/connection_renderer.py
Code blocks, comparison views, and data visualizations
"""

import math
from utils.colors import hex_to_rgb, cycle_colors
from animations.effects import (
    ease_out_cubic, draw_rounded_box, centered_text, wrap_text,
    typewriter_text, pulse_value, draw_progress_bar,
)


def render_code_block(draw, scene, progress, fonts, theme, w, h,
                      particles=None):
    """Render animated code block with syntax highlighting."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    draw.text((70, 35), scene.get("title", "Code"), fill=pc,
              font=fonts["heading"])

    # ── Code window
    cx, cy = 80, 110
    cw, ch = w - 160, h - 230

    # Shadow
    draw.rounded_rectangle(
        [cx + 4, cy + 4, cx + cw + 4, cy + ch + 4],
        radius=14, fill=(0, 0, 0),
    )

    # Window body
    draw.rounded_rectangle(
        [cx, cy, cx + cw, cy + ch],
        radius=14,
        fill=hex_to_rgb(theme.get("code_bg", "#0d1117")),
        outline=hex_to_rgb(theme["border"]), width=2,
    )

    # ── Title bar
    draw.rounded_rectangle([cx, cy, cx + cw, cy + 36], radius=14,
                           fill=(28, 28, 48))
    draw.rectangle([cx, cy + 20, cx + cw, cy + 36], fill=(28, 28, 48))

    # Traffic light dots
    for j, color in enumerate([(255, 95, 87), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse(
            [cx + 14 + j * 22, cy + 10, cx + 26 + j * 22, cy + 22],
            fill=color,
        )

    # Filename
    visual = scene.get("visual_elements", {})
    filename = visual.get("filename", "code.py")
    draw.text((cx + 95, cy + 7), filename,
              fill=hex_to_rgb(theme["text_muted"]), font=fonts["label"])

    # Language badge
    lang = visual.get("language", "python")
    lang_colors = {
        "python": "#3572A5", "javascript": "#f1e05a",
        "typescript": "#2b7489", "rust": "#dea584",
        "go": "#00ADD8", "java": "#b07219",
    }
    badge_c = lang_colors.get(lang, theme["primary"])
    bx = cx + cw - 80
    draw.rounded_rectangle(
        [bx, cy + 6, bx + 65, cy + 24],
        radius=8, fill=hex_to_rgb(badge_c),
    )
    centered_text(draw, lang[:8], bx + 32, cy + 15, fonts["tiny"],
                  (255, 255, 255))

    # ── Code lines
    code_lines = visual.get("code_lines",
                            scene.get("key_points", ["# Code here"]))
    highlight = visual.get("highlight_lines", [])

    # Syntax highlighting map
    syntax_colors = {
        "#": "#6a9955",
        "def ": "#dcdcaa",
        "class ": "#4ec9b0",
        "import ": "#c586c0",
        "from ": "#c586c0",
        "return ": "#c586c0",
        "if ": "#c586c0",
        "for ": "#c586c0",
        "while ": "#c586c0",
        "else:": "#c586c0",
        "elif ": "#c586c0",
        "try:": "#c586c0",
        "except ": "#c586c0",
        "with ": "#c586c0",
        "as ": "#c586c0",
        "yield ": "#c586c0",
        "async ": "#c586c0",
        "await ": "#c586c0",
        "'": "#ce9178",
        '"': "#ce9178",
        "True": "#569cd6",
        "False": "#569cd6",
        "None": "#569cd6",
        "self": "#569cd6",
        "print(": "#dcdcaa",
        "len(": "#dcdcaa",
        "range(": "#dcdcaa",
        "str(": "#dcdcaa",
        "int(": "#dcdcaa",
        "list(": "#dcdcaa",
        "dict(": "#dcdcaa",
        "=": "#d4d4d4",
        "->": "#d4d4d4",
        "@": "#dcdcaa",
    }

    lh = 26
    sy = cy + 48
    max_lines = min(len(code_lines), (ch - 60) // lh)

    for i, line in enumerate(code_lines[:max_lines]):
        delay = 0.03 + i * 0.035
        lp = max(0, min(1.0, (progress - delay) * 4))
        if lp <= 0:
            continue

        y = sy + i * lh

        # Line number
        line_num_color = hex_to_rgb(theme["text_muted"])
        draw.text((cx + 16, y), f"{i + 1:3d}",
                  fill=line_num_color, font=fonts["code"])

        # Separator
        draw.line(
            [(cx + 50, y), (cx + 50, y + lh - 4)],
            fill=hex_to_rgb(theme["border"]), width=1,
        )

        # Highlight background
        if (i + 1) in highlight:
            draw.rectangle(
                [cx + 54, y - 2, cx + cw - 16, y + lh - 3],
                fill=hex_to_rgb(theme.get("highlight", "#1c3a5f")),
            )
            # Highlight indicator
            draw.rectangle(
                [cx + 52, y - 2, cx + 55, y + lh - 3],
                fill=hex_to_rgb(theme["warning"]),
            )

        # Visible text with typewriter
        vis = int(len(line) * lp)
        visible = line[:vis]

        # Determine syntax color
        text_color = hex_to_rgb(theme["text"])
        stripped = line.lstrip()
        for kw, color in syntax_colors.items():
            if stripped.startswith(kw) or kw in stripped:
                text_color = hex_to_rgb(color)
                break

        # Indentation visualization
        indent = len(line) - len(line.lstrip())
        if indent > 0:
            for ind_i in range(indent // 4):
                ix = cx + 62 + ind_i * 16
                draw.line([(ix, y), (ix, y + lh - 4)],
                          fill=hex_to_rgb(theme["border"]), width=1)

        draw.text((cx + 62, y), visible, fill=text_color, font=fonts["code"])

        # Cursor
        if lp < 1.0 and int(progress * 20) % 2 == 0:
            try:
                cur_x = cx + 62 + draw.textlength(visible, font=fonts["code"])
            except Exception:
                cur_x = cx + 62 + len(visible) * 9
            draw.rectangle(
                [int(cur_x), y, int(cur_x) + 2, y + 18],
                fill=pc,
            )

    # ── Output preview panel (if present)
    output = visual.get("output", "")
    if output and progress > 0.7:
        op = min(1.0, (progress - 0.7) * 4)
        oy = cy + ch + 10
        draw.rounded_rectangle(
            [cx, oy, cx + cw, oy + 50],
            radius=8,
            fill=hex_to_rgb(theme["card_bg"]),
            outline=hex_to_rgb(theme["accent"]), width=1,
        )
        draw.text((cx + 12, oy + 5), "▶ Output:",
                  fill=hex_to_rgb(theme["accent"]), font=fonts["tiny"])
        draw.text((cx + 12, oy + 24), output[:60],
                  fill=hex_to_rgb(theme["text"]), font=fonts["code"])


def render_comparison(draw, scene, progress, fonts, theme, w, h,
                      particles=None):
    """Render side-by-side comparison view."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    draw.text((70, 35), scene.get("title", "Comparison"),
              fill=pc, font=fonts["heading"])

    visual = scene.get("visual_elements", {})
    lt = visual.get("left_title", "Before")
    rt = visual.get("right_title", "After")
    comps = visual.get("comparisons", [])

    if not comps:
        kp = scene.get("key_points", [])
        comps = [{"aspect": p, "left": "❌", "right": "✓"} for p in kp]

    mid = w // 2
    col_w = mid - 100

    # ── Column headers
    hp = ease_out_cubic(min(1.0, progress * 3))
    if hp > 0.1:
        # Left header (red tint)
        lh_w = int(col_w * hp)
        draw.rounded_rectangle(
            [70, 110, 70 + lh_w, 158],
            radius=10,
            fill=(70, 25, 25),
            outline=hex_to_rgb(theme["danger"]), width=2,
        )

        # Right header (green tint)
        rh_w = int(col_w * hp)
        draw.rounded_rectangle(
            [mid + 30, 110, mid + 30 + rh_w, 158],
            radius=10,
            fill=(25, 70, 45),
            outline=hex_to_rgb(theme["success"]), width=2,
        )

        if hp > 0.5:
            # Left icon
            draw.text((85, 122), "❌", fill=hex_to_rgb(theme["danger"]),
                      font=fonts["body"])
            draw.text((115, 124), lt[:20], fill=tc, font=fonts["body"])

            # Right icon
            draw.text((mid + 45, 122), "✅",
                      fill=hex_to_rgb(theme["success"]), font=fonts["body"])
            draw.text((mid + 75, 124), rt[:20], fill=tc, font=fonts["body"])

    # ── Divider line
    if progress > 0.15:
        dp = min(1.0, (progress - 0.15) * 2.5)
        line_h = int((h - 260) * dp)
        draw.line(
            [(mid, 175), (mid, 175 + line_h)],
            fill=hex_to_rgb(theme["border"]), width=3,
        )

        # VS badge
        if dp > 0.5:
            vs_y = 175 + line_h // 2
            draw.ellipse(
                [mid - 18, vs_y - 18, mid + 18, vs_y + 18],
                fill=hex_to_rgb(theme["card_bg"]),
                outline=hex_to_rgb(theme["secondary"]), width=2,
            )
            centered_text(draw, "VS", mid, vs_y, fonts["tiny"],
                          hex_to_rgb(theme["secondary"]))

    # ── Comparison rows
    rh = 75
    sy = 185

    for i, comp in enumerate(comps[:6]):
        delay = 0.25 + i * 0.1
        rp = max(0, min(1.0, (progress - delay) * 3))
        if rp <= 0:
            continue

        ease = ease_out_cubic(rp)
        y = sy + i * rh

        # Aspect label (centered)
        if ease > 0.3:
            centered_text(
                draw, comp.get("aspect", "")[:25], mid, y + 10,
                fonts["small"], hex_to_rgb(theme["text_muted"]),
            )

        # Left value
        lv = comp.get("left", "")
        lx_offset = int((1 - ease) * 50)
        draw.rounded_rectangle(
            [85 + lx_offset, y + 28, col_w + 50, y + 58],
            radius=7,
            fill=hex_to_rgb(theme["card_bg"]),
            outline=(90, 40, 40), width=1,
        )
        centered_text(
            draw, lv[:28],
            85 + lx_offset + (col_w - 35) // 2, y + 43,
            fonts["label"], (255, 140, 140),
        )

        # Right value
        rv = comp.get("right", "")
        rx_offset = int((1 - ease) * 50)
        draw.rounded_rectangle(
            [mid + 45, y + 28, mid + col_w + 10 - rx_offset, y + 58],
            radius=7,
            fill=hex_to_rgb(theme["card_bg"]),
            outline=(40, 90, 60), width=1,
        )
        centered_text(
            draw, rv[:28],
            mid + 45 + (col_w - 35) // 2, y + 43,
            fonts["label"], (140, 255, 170),
        )


def render_data_chart(draw, scene, progress, fonts, theme, w, h,
                      particles=None):
    """Render simple bar chart visualization."""
    tc = hex_to_rgb(theme["text"])
    pc = hex_to_rgb(theme["primary"])

    draw.text((70, 35), scene.get("title", "Data"),
              fill=pc, font=fonts["heading"])

    kp = scene.get("key_points", [])
    n = len(kp)
    if n == 0:
        return

    colors = cycle_colors(theme, n)
    chart_x = 150
    chart_y = h - 120
    chart_w = w - 300
    chart_h = h - 280
    bar_w = min(80, (chart_w - 20 * n) // max(n, 1))

    # Axes
    if progress > 0.05:
        ap = min(1.0, progress * 3)
        draw.line(
            [(chart_x, chart_y), (chart_x, chart_y - int(chart_h * ap))],
            fill=hex_to_rgb(theme["border"]), width=2,
        )
        draw.line(
            [(chart_x, chart_y), (chart_x + int(chart_w * ap), chart_y)],
            fill=hex_to_rgb(theme["border"]), width=2,
        )

    for i, pt in enumerate(kp[:8]):
        delay = 0.15 + i * 0.1
        bp = max(0, min(1.0, (progress - delay) * 3))
        if bp <= 0:
            continue

        ease = ease_out_cubic(bp)
        x = chart_x + 30 + i * (bar_w + 20)
        bar_height = int((0.3 + 0.7 * ((i + 1) / n)) * chart_h * ease)

        bc = hex_to_rgb(colors[i])
        draw.rounded_rectangle(
            [x, chart_y - bar_height, x + bar_w, chart_y],
            radius=6, fill=bc,
        )

        # Value on top
        if ease > 0.7:
            val = f"{int(bar_height / chart_h * 100)}%"
            centered_text(draw, val, x + bar_w // 2,
                          chart_y - bar_height - 18,
                          fonts["tiny"], tc)

        # Label below
        if ease > 0.5:
            label = pt[:10]
            centered_text(draw, label, x + bar_w // 2,
                          chart_y + 18, fonts["tiny"],
                          hex_to_rgb(theme["text_muted"]))