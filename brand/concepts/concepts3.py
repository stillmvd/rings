import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "wave3"
OUT.mkdir(exist_ok=True)

C = 32.0
W = 3.2
WA = 3.6
CLEAR = 2.6


def dist_to_seg(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    dd = dx * dx + dy * dy
    t = 0.0 if dd == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / dd))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def cut(points, seg, clearance):
    """Рвёт полилинию там, где она подходит к отрезку ближе clearance."""
    if seg is None:
        return ["M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in points)]
    runs, cur = [], []
    for x, y in points:
        if dist_to_seg(x, y, *seg) > clearance:
            cur.append((x, y))
        elif cur:
            runs.append(cur); cur = []
    if cur:
        runs.append(cur)
    return ["M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in r) for r in runs if len(r) > 1]


def arc_pts(r, a0, a1, cx=C, cy=C, step=2.0):
    n = max(2, int(abs(a1 - a0) / step))
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def spiral_pts(r0, r1, turns, a0=0.0, steps=280, cx=C, cy=C):
    out = []
    total = turns * 2 * math.pi
    for i in range(steps + 1):
        t = i / steps
        th, r = a0 + total * t, r0 + (r1 - r0) * t
        out.append((cx + r * math.cos(th), cy + r * math.sin(th)))
    return out


def paths(dlist, w=W):
    return "".join(f'<path d="{d}" stroke-width="{w}"/>' for d in dlist)


def arrow(x0, y0, x1, y1, w=WA, half=4.6, length=7.4):
    ang = math.atan2(y1 - y0, x1 - x0)
    sx, sy = x1 - length * 0.78 * math.cos(ang), y1 - length * 0.78 * math.sin(ang)
    nx, ny = -math.sin(ang), math.cos(ang)
    bx, by = x1 - length * math.cos(ang), y1 - length * math.sin(ang)
    return (f'<path d="M{x0:.2f} {y0:.2f}L{sx:.2f} {sy:.2f}" fill="none" stroke="#111111" '
            f'stroke-width="{w}" stroke-linecap="round"/>'
            f'<path d="M{x1:.2f} {y1:.2f}L{bx + nx*half:.2f} {by + ny*half:.2f}'
            f'L{bx - nx*half:.2f} {by - ny*half:.2f}Z" fill="#111111" stroke="none"/>')


def svg(coil_paths, extra=""):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'<g fill="none" stroke="#111111" stroke-width="{W}" stroke-linecap="round">{coil_paths}</g>'
            f'{extra}</svg>')


def dot(r=2.5, cx=C, cy=C):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#111111" stroke="none"/>'


SEG = (13.8, 50.2, 50.5, 13.5)
CLEARANCE = WA / 2 + CLEAR

# A1 — спираль, прошитая стрелкой
A1 = svg(paths(cut(spiral_pts(5.5, 23.5, 2.0, math.radians(135)), SEG, CLEARANCE)),
         arrow(11.5, 52.5, 54.5, 9.5))

# A2 — концентрические кольца, прошитые стрелкой
rings = []
for r in (25.5, 20.0, 14.5, 9.0):
    rings += cut(arc_pts(r, 0, 360), SEG, CLEARANCE)
A2 = svg(paths(rings), arrow(11.5, 52.5, 54.5, 9.5))

# A3 — спираль сама переходит в стрелку
sp = spiral_pts(5.5, 22.5, 1.55, math.radians(155))
tail = [(sp[-1][0] + i * 1.1, sp[-1][1] - i * 1.05) for i in range(1, 9)]
A3 = svg(paths([("M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in sp + tail))]),
         f'<g fill="#111111" stroke="none">'
         f'<path d="M{tail[-1][0]+3.4:.2f} {tail[-1][1]-3.2:.2f}'
         f'L{tail[-1][0]-2.2:.2f} {tail[-1][1]-2.6:.2f}'
         f'L{tail[-1][0]+2.6:.2f} {tail[-1][1]+2.4:.2f}Z"/></g>')

# B1 — отпечаток, симметричный ритм
B1 = svg(paths(cut(arc_pts(26.5, 0, 360), None, 0), w=4.0)
         + paths(cut(arc_pts(20.5, 196, 344), None, 0) + cut(arc_pts(20.5, 24, 156), None, 0))
         + paths(cut(arc_pts(15.5, 186, 354), None, 0) + cut(arc_pts(15.5, 34, 146), None, 0))
         + paths(cut(arc_pts(10.5, 200, 340), None, 0) + cut(arc_pts(10.5, 44, 136), None, 0)),
         dot(2.5))

# B2 — отпечаток, из которого выходит тропа со стрелкой
B2 = svg(paths(cut(arc_pts(26.5, 52, 348), None, 0), w=4.0)
         + paths(cut(arc_pts(20.5, 196, 340), None, 0) + cut(arc_pts(20.5, 24, 150), None, 0))
         + paths(cut(arc_pts(15.5, 186, 350), None, 0) + cut(arc_pts(15.5, 34, 140), None, 0))
         + paths(cut(arc_pts(10.5, 200, 336), None, 0))
         + '<path d="M43.5 23.5C47.5 19.5 50.5 16.8 53.4 14.6" stroke-width="3.2"/>',
         dot(2.5) + arrow(53.4, 14.6, 57.6, 10.6, 3.2, 3.9, 6.2))

# B3 — отпечаток со смещённым ядром
B3 = svg(paths(cut(arc_pts(26.5, 0, 360), None, 0), w=4.0)
         + paths(cut(arc_pts(20.0, 205, 332, cy=30.6), None, 0) + cut(arc_pts(20.0, 20, 158, cy=30.6), None, 0))
         + paths(cut(arc_pts(14.5, 196, 344, cy=30.0), None, 0) + cut(arc_pts(14.5, 34, 146, cy=30.0), None, 0))
         + paths(cut(arc_pts(9.0, 208, 332, cy=29.4), None, 0)),
         dot(2.4, C, 29.4))

CONCEPTS = {"A1-spiral-pierced": A1, "A2-rings-pierced": A2, "A3-spiral-to-arrow": A3,
            "B1-fingerprint": B1, "B2-fingerprint-trail": B2, "B3-fingerprint-offset": B3}


def run(path, actions):
    subprocess.run([INK, str(path), f"--actions={actions}"], check=True, capture_output=True, timeout=180)


for name, markup in CONCEPTS.items():
    raw = OUT / f"{name}.svg"
    raw.write_text(markup, encoding="utf-8")
    flat = OUT / f"{name}-flat.svg"
    run(raw, "select-all;object-to-path;object-stroke-to-path;path-union;"
             f"export-filename:{flat};export-plain-svg;export-do")
    run(flat, f"export-filename:{OUT / (name + '.png')};export-width:300;export-height:300;export-do")
    print("ok", name)
