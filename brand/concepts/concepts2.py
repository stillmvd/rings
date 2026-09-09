import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "wave2"
OUT.mkdir(exist_ok=True)

C = 32.0
W = 3.2
GAP = 1.6


def head(x, y, ang, half, length):
    d = math.radians(ang)
    nx, ny = -math.sin(d), math.cos(d)
    bx, by = x - length * math.cos(d), y - length * math.sin(d)
    return (f'<path d="M{x:.2f} {y:.2f}L{bx + nx*half:.2f} {by + ny*half:.2f}'
            f'L{bx - nx*half:.2f} {by - ny*half:.2f}Z"/>')


def arrow(x0, y0, x1, y1, w=4.0, half=5.0, length=8.2):
    ang = math.degrees(math.atan2(y1 - y0, x1 - x0))
    d = math.radians(ang)
    sx, sy = x1 - length * 0.82 * math.cos(d), y1 - length * 0.82 * math.sin(d)
    shaft = f'<path d="M{x0:.2f} {y0:.2f}L{sx:.2f} {sy:.2f}" stroke-width="{w}" stroke-linecap="round" fill="none" stroke="#111111"/>'
    tip = f'<g fill="#111111" stroke="none">{head(x1, y1, ang, half, length)}</g>'
    mask = (f'<g id="channel" fill="#111111" stroke="#111111" stroke-width="{w + GAP*2}" stroke-linejoin="round" stroke-linecap="round">'
            f'<path d="M{x0:.2f} {y0:.2f}L{sx:.2f} {sy:.2f}" fill="none"/>'
            f'{head(x1, y1, ang, half + GAP, length + GAP)}</g>')
    return f'<g id="arrow">{shaft}{tip}</g>', mask


def arc(r, a0, a1, cx=C, cy=C, w=None):
    x0, y0 = cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0))
    x1, y1 = cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1))
    large = 1 if (a1 - a0) % 360 > 180 else 0
    sw = "" if w is None else f' stroke-width="{w}"'
    return f'<path d="M{x0:.2f} {y0:.2f}A{r} {r} 0 {large} 1 {x1:.2f} {y1:.2f}"{sw}/>'


def spiral(r0, r1, turns, a0=0.0, steps=260, cx=C, cy=C):
    pts = []
    total = turns * 2 * math.pi
    for i in range(steps + 1):
        t = i / steps
        th = a0 + total * t
        r = r0 + (r1 - r0) * t
        pts.append(f"{cx + r*math.cos(th):.2f} {cy + r*math.sin(th):.2f}")
    return '<path d="M' + "L".join(pts) + '"/>'


def wrap(coil, extra="", channel=""):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'<g id="coil" fill="none" stroke="#111111" stroke-width="{W}" stroke-linecap="round">{coil}</g>'
            f'{channel}{extra}</svg>')


def dot(r=2.6, cx=C, cy=C):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#111111" stroke="none"/>'


# --- Направление A: траектория ---
a1_arrow, a1_mask = arrow(13.5, 50.5, 53.5, 10.5)
A1 = wrap(spiral(5.5, 23.5, 2.0, math.radians(140)), a1_arrow, a1_mask)

a2_arrow, a2_mask = arrow(15.0, 49.0, 54.0, 10.0)
A2 = wrap(arc(25, 118, 42) + arc(19.5, 128, 32) + arc(14, 140, 20) + arc(8.5, 155, 5),
          a2_arrow, a2_mask)

# A3 — спираль сама переходит в стрелку, канал не нужен
a3_tip_ang = -45.0
A3 = wrap(
    spiral(5.5, 23.0, 1.62, math.radians(150)) +
    '<path d="M45.6 21.2C49 17.8 51.5 15.2 54.6 12.2"/>',
    f'<g fill="#111111" stroke="none">{head(56.5, 10.3, a3_tip_ang, 5.0, 8.2)}</g>')

# --- Направление B: отпечаток ---
B1 = wrap(
    arc(26.5, 0, 359.9, w=4.0)
    + arc(20.5, 196, 344) + arc(20.5, 24, 156)
    + arc(15.5, 186, 354) + arc(15.5, 34, 146)
    + arc(10.5, 200, 340) + arc(10.5, 44, 136),
    dot(2.5))

B2 = wrap(
    arc(26.5, 48, 352, w=4.0)
    + arc(20.5, 196, 340) + arc(20.5, 24, 152)
    + arc(15.5, 186, 350) + arc(15.5, 34, 142)
    + arc(10.5, 200, 336)
    + '<path d="M44.8 22.6C48.6 18.4 52.4 15.4 57.2 13.4"/>',
    dot(2.5) + dot(2.2, 58.4, 12.9))

B3 = wrap(
    arc(26.5, 0, 359.9, w=4.0)
    + arc(20.0, 205, 330, cy=30.5) + arc(20.0, 20, 160, cy=30.5)
    + arc(14.5, 195, 345, cy=30.0) + arc(14.5, 35, 145, cy=30.0)
    + arc(9.0, 210, 330, cy=29.5),
    dot(2.4, C, 29.5))

CONCEPTS = {
    "A1-spiral-arrow": (A1, True),
    "A2-radar-arrow": (A2, True),
    "A3-spiral-becomes-arrow": (A3, False),
    "B1-fingerprint": (B1, False),
    "B2-fingerprint-exit": (B2, False),
    "B3-fingerprint-offset": (B3, False),
}


def run(path, actions):
    subprocess.run([INK, str(path), f"--actions={actions}"], check=True, capture_output=True, timeout=180)


for name, (markup, has_channel) in CONCEPTS.items():
    raw = OUT / f"{name}.svg"
    raw.write_text(markup, encoding="utf-8")
    flat = OUT / f"{name}-flat.svg"

    if has_channel:
        acts = ("select-by-id:coil;object-stroke-to-path;path-union;"
                "select-by-id:channel;object-stroke-to-path;path-union;"
                "select-by-id:coil,channel;path-difference;"
                "select-all;object-to-path;object-stroke-to-path;path-union;"
                f"export-filename:{flat};export-plain-svg;export-do")
    else:
        acts = ("select-all;object-to-path;object-stroke-to-path;path-union;"
                f"export-filename:{flat};export-plain-svg;export-do")
    run(raw, acts)
    run(flat, f"export-filename:{OUT / (name + '.png')};export-width:300;export-height:300;export-do")
    print("ok", name)
