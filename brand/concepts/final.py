import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "final"
OUT.mkdir(exist_ok=True)

ACCENT = "#FFFF1E"
INKC = "#000000"
C = 32.0


def dist_to_seg(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    dd = dx * dx + dy * dy
    t = 0.0 if dd == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / dd))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def ring_paths(radii, seg, clearance, cx=C, cy=C, step=1.6):
    out = []
    for r in radii:
        n = int(360 / step)
        pts = [(cx + r * math.cos(math.radians(i * step)), cy + r * math.sin(math.radians(i * step)))
               for i in range(n + 1)]
        runs, cur = [], []
        for x, y in pts:
            if dist_to_seg(x, y, *seg) > clearance:
                cur.append((x, y))
            elif cur:
                runs.append(cur); cur = []
        if cur:
            runs.append(cur)
        # замкнуть разрыв на стыке 0°/360°, если кольцо цело в этой точке
        if len(runs) > 1 and runs[0][0] == pts[0] and runs[-1][-1] == pts[-1]:
            runs[0] = runs[-1] + runs[0]
            runs.pop()
        out += ["M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in r) for r in runs if len(r) > 1]
    return out


def arrow(x0, y0, x1, y1, w, half, length):
    ang = math.atan2(y1 - y0, x1 - x0)
    sx, sy = x1 - length * 0.8 * math.cos(ang), y1 - length * 0.8 * math.sin(ang)
    nx, ny = -math.sin(ang), math.cos(ang)
    bx, by = x1 - length * math.cos(ang), y1 - length * math.sin(ang)
    return (f'<path d="M{x0:.2f} {y0:.2f}L{sx:.2f} {sy:.2f}" fill="none" stroke="{INKC}" '
            f'stroke-width="{w}" stroke-linecap="round"/>'
            f'<path d="M{x1:.2f} {y1:.2f}L{bx+nx*half:.2f} {by+ny*half:.2f}'
            f'L{bx-nx*half:.2f} {by-ny*half:.2f}Z" fill="{INKC}"/>')


def mark(radii, seg, w, aw, half, length, cx=C, cy=C, disc=True):
    rings = ring_paths(radii, seg, aw / 2 + 2.5, cx, cy)
    body = "".join(f'<path d="{d}"/>' for d in rings)
    disc_el = f'<circle cx="32" cy="32" r="32" fill="{ACCENT}"/>' if disc else ""
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'{disc_el}'
            f'<g fill="none" stroke="{INKC}" stroke-width="{w}" stroke-linecap="round">{body}</g>'
            f'{arrow(*seg, aw, half, length)}</svg>')


SEG_IN = (14.5, 49.5, 49.0, 15.0)
SEG_OUT = (11.0, 53.0, 53.0, 11.0)

VARIANTS = {
    "F1-three-rings": mark([21, 14.5, 8], SEG_IN, 3.4, 3.6, 4.6, 7.4),
    "F2-four-rings": mark([24, 18, 12, 6], SEG_IN, 3.0, 3.2, 4.2, 6.8),
    "F3-bold-arrow": mark([21, 14.5, 8], SEG_OUT, 3.2, 4.4, 5.4, 8.6),
    "F4-offset-core": mark([20, 13.5, 7], SEG_IN, 3.4, 3.6, 4.6, 7.4, cx=29.5, cy=34.5),
    "F5-small": mark([19, 11], SEG_IN, 4.2, 4.4, 5.4, 8.0),
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
