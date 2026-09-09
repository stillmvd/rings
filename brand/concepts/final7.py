import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "final7"
OUT.mkdir(exist_ok=True)

ACCENT = "#FFFF1E"
INKC = "#000000"
C = 32.0
FIT_R = 21.5


def path_points(r0, r1, turns, end_deg, straighten, steps=360, ease=2.0):
    th1 = math.radians(end_deg)
    th0 = th1 + turns * 2 * math.pi
    ks = [1.0 if i / steps < 1 - straighten else
          max(0.0, 1 - (i / steps - (1 - straighten)) / straighten) ** ease for i in range(steps)]
    dth = (th1 - th0) / (sum(ks) or 1.0)
    rw = [1 + (1 - k) * 1.5 for k in ks]
    dr = (r1 - r0) / (sum(rw) or 1.0)
    th, r = th0, r0
    pts = [(C + r * math.cos(th), C + r * math.sin(th))]
    for k, w in zip(ks, rw):
        th += dth * k
        r += dr * w
        pts.append((C + r * math.cos(th), C + r * math.sin(th)))
    return pts


def direction(pts, frac=0.09):
    n = max(2, int(len(pts) * frac))
    (ax, ay), (bx, by) = pts[-n], pts[-1]
    return math.atan2(by - ay, bx - ax)


def trim(pts, length):
    """Убирает хвост заданной длины — под основание наконечника."""
    acc = 0.0
    out = list(pts)
    while len(out) > 2:
        x1, y1 = out[-1]
        x0, y0 = out[-2]
        seg = math.hypot(x1 - x0, y1 - y0)
        if acc + seg >= length:
            t = (length - acc) / seg
            out[-1] = (x1 + (x0 - x1) * t, y1 + (y0 - y1) * t)
            break
        acc += seg
        out.pop()
    return out


def build(pts, w, half, length, core=None, taper=None):
    ang = direction(pts)
    tipx, tipy = pts[-1]
    nx, ny = -math.sin(ang), math.cos(ang)
    bx, by = tipx - length * math.cos(ang), tipy - length * math.sin(ang)
    shaft = trim(pts, length * 0.62)
    tri = [(tipx, tipy), (bx + nx * half, by + ny * half), (bx - nx * half, by - ny * half)]
    return shaft, tri, core


def bounds(shaft, tri, w, core_r):
    xs = [x for x, _ in shaft] + [x for x, _ in tri]
    ys = [y for _, y in shaft] + [y for _, y in tri]
    pad = w / 2
    return min(xs) - pad, min(ys) - pad, max(xs) + pad, max(ys) + pad


def render(shaft, tri, w, core_r, taper=None):
    x0, y0, x1, y1 = bounds(shaft, tri, w, core_r)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    scale = (FIT_R * 2) / max(x1 - x0, y1 - y0)
    dx, dy = C - cx * scale, C - cy * scale
    tf = f'translate({dx:.3f} {dy:.3f}) scale({scale:.4f})'

    if taper:
        w0, w1, segs = taper
        n, parts = len(shaft), []
        for i in range(segs):
            a, b = int(n * i / segs), int(n * (i + 1) / segs) + 1
            d = "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in shaft[a:min(b, n)])
            parts.append(f'<path d="{d}" stroke-width="{w0 + (w1-w0)*(i+.5)/segs:.2f}"/>')
        line = "".join(parts)
    else:
        d = "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in shaft)
        line = f'<path d="{d}" stroke-width="{w}"/>'

    core = f'<circle cx="{shaft[0][0]:.2f}" cy="{shaft[0][1]:.2f}" r="{core_r}" fill="{INKC}" stroke="none"/>' if core_r else ""
    tri_d = "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in tri) + "Z"
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'<circle cx="32" cy="32" r="32" fill="{ACCENT}"/>'
            f'<g transform="{tf}">'
            f'<g fill="none" stroke="{INKC}" stroke-linecap="round" stroke-linejoin="round">{line}</g>'
            f'<path d="{tri_d}" fill="{INKC}"/>{core}</g></svg>')


def make(w=3.6, half=4.8, length=8.0, core_r=0, taper=None, **kw):
    pts = path_points(**kw)
    shaft, tri, _ = build(pts, w, half, length)
    return render(shaft, tri, w, core_r, taper)


VARIANTS = {
    "V1-uncoil": make(r0=4.6, r1=19.5, turns=1.45, end_deg=-52, straighten=0.26),
    "V2-core": make(r0=7.4, r1=19.5, turns=1.20, end_deg=-52, straighten=0.26, core_r=3.0),
    "V3-taper": make(r0=4.6, r1=19.5, turns=1.45, end_deg=-52, straighten=0.26,
                     w=3.6, half=5.2, length=8.6, taper=(2.2, 4.4, 16)),
    "V4-steep": make(r0=4.6, r1=20.0, turns=1.5, end_deg=-72, straighten=0.30),
    "V5-simple": make(r0=6.4, r1=18.5, turns=1.05, end_deg=-50, straighten=0.28,
                      w=4.8, half=6.2, length=9.6),
}


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
