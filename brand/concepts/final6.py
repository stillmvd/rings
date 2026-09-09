import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "final6"
OUT.mkdir(exist_ok=True)

ACCENT = "#FFFF1E"
INKC = "#000000"
C = 32.0


def path_points(r0, r1, turns, end_deg, straighten, steps=320, ease=2.0):
    """Спираль от ядра наружу; последние `straighten` пути виток разгибается в прямую.

    Приращения угла нормированы, иначе гашение не даёт линии дойти до end_deg.
    """
    th1 = math.radians(end_deg)
    th0 = th1 + turns * 2 * math.pi
    ks = []
    for i in range(steps):
        t = i / steps
        ks.append(1.0 if t < 1 - straighten else max(0.0, 1 - (t - (1 - straighten)) / straighten) ** ease)
    ksum = sum(ks) or 1.0
    dth = (th1 - th0) / ksum
    rw = [1 + (1 - k) * 1.5 for k in ks]
    dr = (r1 - r0) / (sum(rw) or 1.0)

    th, r = th0, r0
    pts = [(C + r * math.cos(th), C + r * math.sin(th))]
    for k, w in zip(ks, rw):
        th += dth * k
        r += dr * w
        pts.append((C + r * math.cos(th), C + r * math.sin(th)))
    return pts


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


P = dict(r0=4.6, r1=19.5, turns=1.45, end_deg=-48, straighten=0.24)

p1 = path_points(**P)
U1 = wrap(stroke(p1, 3.6) + head(p1, 4.8, 7.6))

p2 = path_points(r0=7.2, r1=19.5, turns=1.22, end_deg=-48, straighten=0.24)
U2 = wrap(f'<circle cx="{C}" cy="{C}" r="3.0" fill="{INKC}"/>' + stroke(p2, 3.6, "butt") + head(p2, 4.8, 7.6))

p3 = path_points(**P)
U3 = wrap(tapered(p3, 2.2, 4.4) + head(p3, 5.2, 8.2))

p4 = path_points(r0=4.6, r1=20.5, turns=1.62, end_deg=-52, straighten=0.34)
U4 = wrap(stroke(p4, 3.4) + head(p4, 4.6, 7.4))

p5 = path_points(r0=6.4, r1=18.5, turns=1.05, end_deg=-46, straighten=0.28)
U5 = wrap(stroke(p5, 4.8) + head(p5, 6.2, 9.4))

VARIANTS = {"U1-uncoil": U1, "U2-core": U2, "U3-taper": U3, "U4-two-turns": U4, "U5-simple": U5}


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
