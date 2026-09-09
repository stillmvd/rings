import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "final4"
OUT.mkdir(exist_ok=True)

ACCENT = "#FFFF1E"
INKC = "#000000"
C = 32.0


def path_points(r0, r1, turns, end_deg, straighten, steps=320, ease=2.0):
    """Спираль, у которой хвост разгибается в прямую: приращение угла гаснет."""
    th1 = math.radians(end_deg)
    th0 = th1 - turns * 2 * math.pi
    pts, th, r = [], th0, r0
    dth = (th1 - th0) / steps
    dr = (r1 - r0) / steps
    x, y = C + r * math.cos(th), C + r * math.sin(th)
    pts.append((x, y))
    for i in range(steps):
        t = i / steps
        k = 1.0 if t < 1 - straighten else max(0.0, (1 - (t - (1 - straighten)) / straighten)) ** ease
        th += dth * k
        r += dr * (1 + (1 - k) * 1.35)
        pts.append((C + r * math.cos(th), C + r * math.sin(th)))
    return pts


def clip_to_disc(pts, limit):
    return [(x, y) for x, y in pts if math.hypot(x - C, y - C) <= limit]


def head(pts, half, length, back=8):
    x1, y1 = pts[-1]
    px, py = pts[-1 - back]
    ang = math.atan2(y1 - py, x1 - px)
    tx, ty = x1 + math.cos(ang) * length * 0.5, y1 + math.sin(ang) * length * 0.5
    nx, ny = -math.sin(ang), math.cos(ang)
    bx, by = tx - length * math.cos(ang), ty - length * math.sin(ang)
    return (f'<path d="M{tx:.2f} {ty:.2f}L{bx+nx*half:.2f} {by+ny*half:.2f}'
            f'L{bx-nx*half:.2f} {by-ny*half:.2f}Z" fill="{INKC}"/>')


def stroke(pts, w, cap="round"):
    d = "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in pts)
    return (f'<path d="{d}" fill="none" stroke="{INKC}" stroke-width="{w}" '
            f'stroke-linecap="{cap}" stroke-linejoin="round"/>')


def tapered(pts, w0, w1, segs=16):
    n, out = len(pts), []
    for i in range(segs):
        a, b = int(n * i / segs), int(n * (i + 1) / segs) + 1
        out.append(stroke(pts[a:min(b, n)], round(w0 + (w1 - w0) * (i + .5) / segs, 2)))
    return "".join(out)


def wrap(body):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'<circle cx="32" cy="32" r="32" fill="{ACCENT}"/>{body}</svg>')


# T1 — разгибание хвоста, ровная толщина
p1 = clip_to_disc(path_points(4.5, 19.0, 1.55, -60, 0.30), 24.5)
T1 = wrap(stroke(p1, 3.6) + head(p1, 4.8, 7.6))

# T2 — то же с ядром-точкой в центре
p2 = clip_to_disc(path_points(7.0, 19.0, 1.35, -60, 0.30), 24.5)
T2 = wrap(f'<circle cx="{C}" cy="{C}" r="3.0" fill="{INKC}"/>' + stroke(p2, 3.6, "butt") + head(p2, 4.8, 7.6))

# T3 — линия набирает толщину к выходу
p3 = clip_to_disc(path_points(4.5, 19.0, 1.55, -60, 0.30), 24.5)
T3 = wrap(tapered(p3, 2.2, 4.4) + head(p3, 5.2, 8.2))

# T4 — длиннее прямой участок, круче выход
p4 = clip_to_disc(path_points(4.5, 17.5, 1.4, -55, 0.42), 25.0)
T4 = wrap(stroke(p4, 3.8) + head(p4, 5.0, 8.0))

# T5 — упрощение под мелкие размеры
p5 = clip_to_disc(path_points(6.0, 17.0, 1.05, -58, 0.38), 24.0)
T5 = wrap(stroke(p5, 4.8) + head(p5, 6.2, 9.4))

VARIANTS = {"T1-uncoil": T1, "T2-uncoil-core": T2, "T3-uncoil-taper": T3,
            "T4-long-exit": T4, "T5-simple": T5}


def run(path, actions):
    subprocess.run([INK, str(path), f"--actions={actions}"], check=True, capture_output=True, timeout=180)


for name, markup in VARIANTS.items():
    raw = OUT / f"{name}.svg"
    raw.write_text(markup, encoding="utf-8")
    flat = OUT / f"{name}-flat.svg"
    run(raw, "select-all;object-to-path;object-stroke-to-path;"
             f"export-filename:{flat};export-plain-svg;export-do")
    for px in (300, 48, 32, 24):
        run(flat, f"export-filename:{OUT / f'{name}-{px}.png'};export-width:{px};export-height:{px};export-do")
    print("ok", name)
