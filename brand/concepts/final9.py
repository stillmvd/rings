import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "final9"
OUT.mkdir(exist_ok=True)

ACCENT = "#FFFF1E"
INKC = "#000000"
C = 32.0
FIT = 21.0


def spiral(r0, r1, turns, end_deg, steps=300):
    th1 = math.radians(end_deg)
    th0 = th1 + turns * 2 * math.pi
    pts = []
    for i in range(steps + 1):
        t = i / steps
        th = th0 + (th1 - th0) * t
        r = r0 + (r1 - r0) * t
        pts.append((C + r * math.cos(th), C + r * math.sin(th)))
    return pts


def extend(pts, length, bend=0.0, steps=40):
    """Прямой (или чуть изогнутый) выход по касательной последней точки."""
    (ax, ay), (bx, by) = pts[-6], pts[-1]
    ang = math.atan2(by - ay, bx - ax)
    out = []
    for i in range(1, steps + 1):
        t = i / steps
        a = ang + math.radians(bend) * t
        out.append((bx + math.cos(a) * length * t, by + math.sin(a) * length * t))
    return pts + out


def arrowhead(pts, w, mult=2.6):
    (ax, ay), (bx, by) = pts[-4], pts[-1]
    ang = math.atan2(by - ay, bx - ax)
    half, length = w * mult / 2, w * mult * 0.92
    nx, ny = -math.sin(ang), math.cos(ang)
    tx, ty = bx + math.cos(ang) * length * 0.34, by + math.sin(ang) * length * 0.34
    px, py = tx - length * math.cos(ang), ty - length * math.sin(ang)
    tri = [(tx, ty), (px + nx * half, py + ny * half), (px - nx * half, py - ny * half)]
    body = [p for p in pts]
    return body, tri


def fit_tf(groups, w):
    xs = [p[0] for g in groups for p in g]
    ys = [p[1] for g in groups for p in g]
    x0, x1 = min(xs) - w / 2, max(xs) + w / 2
    y0, y1 = min(ys) - w / 2, max(ys) + w / 2
    s = (FIT * 2) / max(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return f'translate({C - cx*s:.3f} {C - cy*s:.3f}) scale({s:.4f})'


def d_of(pts):
    return "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in pts)


def doc(body, tf):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'<circle cx="32" cy="32" r="32" fill="{ACCENT}"/><g transform="{tf}">{body}</g></svg>')


def line(pts, w, cap="round"):
    return (f'<g fill="none" stroke="{INKC}" stroke-width="{w}" stroke-linecap="{cap}" '
            f'stroke-linejoin="round"><path d="{d_of(pts)}"/></g>')


def tapered(pts, w0, w1, segs=18):
    n, out = len(pts), []
    for i in range(segs):
        a, b = int(n * i / segs), int(n * (i + 1) / segs) + 1
        out.append(f'<path d="{d_of(pts[a:min(b,n)])}" stroke-width="{w0 + (w1-w0)*(i+.5)/segs:.2f}"/>')
    return (f'<g fill="none" stroke="{INKC}" stroke-linecap="round" stroke-linejoin="round">'
            f'{"".join(out)}</g>')


def dot_at(p, r):
    return f'<circle cx="{p[0]:.2f}" cy="{p[1]:.2f}" r="{r}" fill="{INKC}" stroke="none"/>'


W = 3.4

# X1 — спираль, на конце точка «сейчас»
p1 = extend(spiral(4.4, 14.5, 1.35, -60), 7.5, bend=-6)
X1 = doc(line(p1, W) + dot_at(p1[-1], W * 1.35), fit_tf([p1], W * 2.7))

# X2 — то же, линия набирает толщину к «сейчас»
p2 = extend(spiral(4.4, 14.5, 1.35, -60), 7.5, bend=-6)
X2 = doc(tapered(p2, 2.0, 4.2) + dot_at(p2[-1], 4.2 * 1.3), fit_tf([p2], 4.2 * 2.6))

# X3 — компактная спираль с длинным прямым выходом и классической стрелкой
p3 = extend(spiral(4.4, 13.5, 1.3, -62), 10.5)
body3, tri3 = arrowhead(p3, W)
X3 = doc(line(body3, W) + f'<path d="{d_of(tri3)}Z" fill="{INKC}"/>', fit_tf([p3, tri3], W))

# X4 — два маркера: ядро (начало) и точка (сейчас)
p4 = extend(spiral(6.8, 14.5, 1.15, -60), 8.0, bend=-6)
X4 = doc(line(p4, W, "butt") + dot_at(p4[0], W * 1.15) + dot_at(p4[-1], W * 1.35),
         fit_tf([p4], W * 2.7))

# X5 — упрощение под мелкие размеры
p5 = extend(spiral(5.6, 13.0, 1.0, -58), 8.5, bend=-5)
X5 = doc(line(p5, 4.6) + dot_at(p5[-1], 5.8), fit_tf([p5], 11.6))

VARIANTS = {"X1-now-dot": X1, "X2-taper-dot": X2, "X3-long-arrow": X3,
            "X4-start-and-now": X4, "X5-simple": X5}


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
