import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "final10"
OUT.mkdir(exist_ok=True)

ACCENT = "#FFFF1E"
INKC = "#000000"
C = 32.0
W = 3.4


def spiral(r0, r1, turns, end_deg, steps=300):
    th1 = math.radians(end_deg)
    th0 = th1 + turns * 2 * math.pi
    return [(C + (r0 + (r1 - r0) * i / steps) * math.cos(th0 + (th1 - th0) * i / steps),
             C + (r0 + (r1 - r0) * i / steps) * math.sin(th0 + (th1 - th0) * i / steps))
            for i in range(steps + 1)]


def extend(pts, length, bend=0.0, steps=40):
    (ax, ay), (bx, by) = pts[-6], pts[-1]
    ang = math.atan2(by - ay, bx - ax)
    return pts + [(bx + math.cos(ang + math.radians(bend) * i / steps) * length * i / steps,
                   by + math.sin(ang + math.radians(bend) * i / steps) * length * i / steps)
                  for i in range(1, steps + 1)]


def d_of(pts):
    return "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in pts)


def build(fit_r, w=W, dot_k=1.35, disc=True):
    pts = extend(spiral(4.4, 14.5, 1.35, -60), 7.5, bend=-6)
    dot_r = w * dot_k
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    pad = max(w / 2, dot_r)
    x0, x1 = min(xs) - pad, max(xs) + pad
    y0, y1 = min(ys) - pad, max(ys) + pad
    s = (fit_r * 2) / max(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    tf = f'translate({C - cx*s:.3f} {C - cy*s:.3f}) scale({s:.4f})'
    disc_el = f'<circle cx="32" cy="32" r="32" fill="{ACCENT}"/>' if disc else ""
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'{disc_el}<g transform="{tf}">'
            f'<g fill="none" stroke="{INKC}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="{d_of(pts)}"/></g>'
            f'<circle cx="{pts[-1][0]:.2f}" cy="{pts[-1][1]:.2f}" r="{dot_r}" fill="{INKC}"/>'
            f'</g></svg>')


VARIANTS = {
    "Y1-fit21": build(21.0),
    "Y2-fit23": build(23.0),
    "Y3-fit25": build(25.0),
    "Y4-fit27": build(27.0),
    "Y5-fit25-thin": build(25.0, w=3.0, dot_k=1.5),
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
