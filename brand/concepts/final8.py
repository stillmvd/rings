import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "final8"
OUT.mkdir(exist_ok=True)

ACCENT = "#FFFF1E"
INKC = "#000000"
C = 32.0
FIT_R = 21.0


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


def direction(pts, frac=0.07):
    n = max(2, int(len(pts) * frac))
    (ax, ay), (bx, by) = pts[-n], pts[-1]
    return math.atan2(by - ay, bx - ax)


def chevron(pts, size, spread=42.0):
    """Галочка на конце линии: две короткие ветви назад под углом."""
    ang = direction(pts)
    x, y = pts[-1]
    out = []
    for s in (+1, -1):
        a = ang + math.pi + math.radians(spread) * s
        out.append(f'<path d="M{x:.2f} {y:.2f}L{x + size*math.cos(a):.2f} {y + size*math.sin(a):.2f}"/>')
    return "".join(out)


def fit(elements_pts, w):
    xs, ys = [], []
    for pts in elements_pts:
        xs += [p[0] for p in pts]
        ys += [p[1] for p in pts]
    x0, x1 = min(xs) - w / 2, max(xs) + w / 2
    y0, y1 = min(ys) - w / 2, max(ys) + w / 2
    scale = (FIT_R * 2) / max(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return f'translate({C - cx*scale:.3f} {C - cy*scale:.3f}) scale({scale:.4f})'


def chevron_pts(pts, size, spread=42.0):
    ang = direction(pts)
    x, y = pts[-1]
    res = []
    for s in (+1, -1):
        a = ang + math.pi + math.radians(spread) * s
        res.append((x + size * math.cos(a), y + size * math.sin(a)))
    return res


def wrap(body, tf):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'<circle cx="32" cy="32" r="32" fill="{ACCENT}"/>'
            f'<g transform="{tf}">{body}</g></svg>')


def line_d(pts):
    return "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in pts)


def with_chevron(w=3.6, chev=7.2, core_r=0, **kw):
    pts = path_points(**kw)
    tf = fit([pts, chevron_pts(pts, chev)], w)
    core = (f'<circle cx="{pts[0][0]:.2f}" cy="{pts[0][1]:.2f}" r="{core_r}" fill="{INKC}" stroke="none"/>'
            if core_r else "")
    body = (f'<g fill="none" stroke="{INKC}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="{line_d(pts)}"/>{chevron(pts, chev)}</g>{core}')
    return wrap(body, tf)


def comet(w0=2.0, w1=4.6, segs=22, core_r=0, **kw):
    """Хвост, заострённый к выходу: толщина растёт, последний сегмент сходит в остриё."""
    pts = path_points(**kw)
    tf = fit([pts], w1)
    n, parts = len(pts), []
    for i in range(segs):
        a, b = int(n * i / segs), int(n * (i + 1) / segs) + 1
        t = (i + 0.5) / segs
        w = w0 + (w1 - w0) * min(1.0, t / 0.82) if t < 0.82 else w1 * max(0.06, (1 - (t - 0.82) / 0.18) ** 0.9)
        cap = "round" if i < segs - 1 else "butt"
        parts.append(f'<path d="{line_d(pts[a:min(b, n)])}" stroke-width="{w:.2f}" stroke-linecap="{cap}"/>')
    core = (f'<circle cx="{pts[0][0]:.2f}" cy="{pts[0][1]:.2f}" r="{core_r}" fill="{INKC}" stroke="none"/>'
            if core_r else "")
    return wrap(f'<g fill="none" stroke="{INKC}" stroke-linejoin="round">{"".join(parts)}</g>{core}', tf)


BASE = dict(r0=4.6, r1=19.5, turns=1.45, end_deg=-52, straighten=0.26)

VARIANTS = {
    "W1-chevron": with_chevron(**BASE),
    "W2-chevron-core": with_chevron(r0=7.4, r1=19.5, turns=1.20, end_deg=-52, straighten=0.26, core_r=3.0),
    "W3-comet": comet(**BASE),
    "W4-comet-core": comet(r0=7.4, r1=19.5, turns=1.20, end_deg=-52, straighten=0.26, core_r=3.2),
    "W5-chevron-simple": with_chevron(r0=6.4, r1=18.5, turns=1.05, end_deg=-50, straighten=0.28,
                                      w=4.8, chev=9.0),
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
