import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "final3"
OUT.mkdir(exist_ok=True)

ACCENT = "#FFFF1E"
INKC = "#000000"
C = 32.0
END_ANGLE = -52.0


def spiral(r0, r1, turns, end_deg=END_ANGLE, steps=300):
    th1 = math.radians(end_deg)
    th0 = th1 - turns * 2 * math.pi
    pts = []
    for i in range(steps + 1):
        t = i / steps
        th = th0 + (th1 - th0) * t
        r = r0 + (r1 - r0) * t
        pts.append((C + r * math.cos(th), C + r * math.sin(th)))
    return pts


def d_of(pts):
    return "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in pts)


def arrow_head(pts, half, length, back=6):
    x1, y1 = pts[-1]
    px, py = pts[-1 - back]
    ang = math.atan2(y1 - py, x1 - px)
    tipx, tipy = x1 + math.cos(ang) * length * 0.55, y1 + math.sin(ang) * length * 0.55
    nx, ny = -math.sin(ang), math.cos(ang)
    bx, by = tipx - length * math.cos(ang), tipy - length * math.sin(ang)
    return (f'<path d="M{tipx:.2f} {tipy:.2f}L{bx+nx*half:.2f} {by+ny*half:.2f}'
            f'L{bx-nx*half:.2f} {by-ny*half:.2f}Z" fill="{INKC}"/>')


def stroke(pts, w, cap="round"):
    return (f'<path d="{d_of(pts)}" fill="none" stroke="{INKC}" stroke-width="{w}" '
            f'stroke-linecap="{cap}" stroke-linejoin="round"/>')


def tapered(pts, w0, w1, segs=14):
    n = len(pts)
    out = []
    for i in range(segs):
        a = int(n * i / segs)
        b = int(n * (i + 1) / segs) + 1
        w = w0 + (w1 - w0) * (i + 0.5) / segs
        out.append(stroke(pts[a:min(b, n)], round(w, 2)))
    return "".join(out)


def wrap(body):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'<circle cx="32" cy="32" r="32" fill="{ACCENT}"/>{body}</svg>')


# S1 — базовая: 1.6 витка, ровная толщина
p1 = spiral(4.5, 21.5, 1.6)
S1 = wrap(stroke(p1, 3.6) + arrow_head(p1, 4.8, 7.6))

# S2 — плотная: 2.15 витка, тоньше
p2 = spiral(3.6, 22.5, 2.15)
S2 = wrap(stroke(p2, 3.0) + arrow_head(p2, 4.2, 6.8))

# S3 — с ядром: спираль стартует от точки
p3 = spiral(6.5, 21.5, 1.45)
S3 = wrap(f'<circle cx="{C}" cy="{C}" r="3.0" fill="{INKC}"/>'
          + stroke(p3, 3.6, "butt") + arrow_head(p3, 4.8, 7.6))

# S4 — линия набирает толщину от центра наружу
p4 = spiral(4.5, 21.5, 1.6)
S4 = wrap(tapered(p4, 2.0, 4.4) + arrow_head(p4, 5.2, 8.2))

# S5 — упрощение под мелкие размеры
p5 = spiral(5.5, 20.5, 1.15)
S5 = wrap(stroke(p5, 4.6) + arrow_head(p5, 6.0, 9.0))

VARIANTS = {"S1-base": S1, "S2-dense": S2, "S3-core": S3, "S4-tapered": S4, "S5-simple": S5}


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
