import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "final2"
OUT.mkdir(exist_ok=True)

ACCENT = "#FFFF1E"
INKC = "#000000"
C = 32.0


def dist_to_seg(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    dd = dx * dx + dy * dy
    t = 0.0 if dd == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / dd))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def ring_paths(radii, seg, clearance, cx=C, cy=C, step=1.2):
    out = []
    for r in radii:
        n = int(360 / step)
        pts = [(cx + r * math.cos(math.radians(i * step)),
                cy + r * math.sin(math.radians(i * step))) for i in range(n)]
        keep = [dist_to_seg(x, y, *seg) > clearance for x, y in pts]
        if all(keep):
            out.append("M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + "Z")
            continue
        if not any(keep):
            continue
        start = keep.index(False)
        runs, cur = [], []
        for i in range(n):
            j = (start + i) % n
            if keep[j]:
                cur.append(pts[j])
            elif cur:
                runs.append(cur); cur = []
        if cur:
            runs.append(cur)
        out += ["M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in r_) for r_ in runs if len(r_) > 1]
    return out


def arrow(x0, y0, x1, y1, w, half, length, tail_cap="round"):
    ang = math.atan2(y1 - y0, x1 - x0)
    sx, sy = x1 - length * 0.8 * math.cos(ang), y1 - length * 0.8 * math.sin(ang)
    nx, ny = -math.sin(ang), math.cos(ang)
    bx, by = x1 - length * math.cos(ang), y1 - length * math.sin(ang)
    return (f'<path d="M{x0:.2f} {y0:.2f}L{sx:.2f} {sy:.2f}" fill="none" stroke="{INKC}" '
            f'stroke-width="{w}" stroke-linecap="{tail_cap}"/>'
            f'<path d="M{x1:.2f} {y1:.2f}L{bx+nx*half:.2f} {by+ny*half:.2f}'
            f'L{bx-nx*half:.2f} {by-ny*half:.2f}Z" fill="{INKC}"/>')


def wrap(body, disc=True):
    disc_el = f'<circle cx="32" cy="32" r="32" fill="{ACCENT}"/>' if disc else ""
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'{disc_el}{body}</svg>')


def rings_group(paths, w):
    body = "".join(f'<path d="{d}"/>' for d in paths)
    return f'<g fill="none" stroke="{INKC}" stroke-width="{w}" stroke-linecap="round">{body}</g>'


# G1 — стрелка выходит из ядра наружу, кольца целые слева-снизу
seg1 = (C, C, 51.0, 13.0)
G1 = wrap(rings_group(ring_paths([21, 14.5, 8], seg1, 3.6 / 2 + 2.5), 3.4)
          + f'<circle cx="32" cy="32" r="3.0" fill="{INKC}"/>'
          + arrow(*seg1, 3.6, 4.6, 7.4, "butt"))

# G2 — ядро смещено, траектория проходит по касательной, центр не перечёркнут
seg2 = (20.0, 47.0, 52.0, 15.0)
G2 = wrap(rings_group(ring_paths([19, 13, 7], seg2, 3.6 / 2 + 2.5, cx=27.0, cy=37.0), 3.4)
          + arrow(*seg2, 3.6, 4.6, 7.4))

# G3 — спираль из ядра, разворачивается и уходит стрелкой
sp = []
for i in range(221):
    t = i / 220
    th = math.radians(200) + 1.72 * 2 * math.pi * t
    r = 4.0 + 17.0 * t
    sp.append((C + r * math.cos(th), C + r * math.sin(th)))
tip = sp[-1]
ang = math.atan2(tip[1] - sp[-6][1], tip[0] - sp[-6][0])
ext = [(tip[0] + math.cos(ang) * i * 1.2, tip[1] + math.sin(ang) * i * 1.2) for i in range(1, 7)]
end = ext[-1]
G3 = wrap(f'<g fill="none" stroke="{INKC}" stroke-width="3.6" stroke-linecap="round">'
          f'<path d="M' + "L".join(f"{x:.2f} {y:.2f}" for x, y in sp + ext[:-1]) + '"/></g>'
          + arrow(ext[-2][0], ext[-2][1], end[0] + math.cos(ang) * 2, end[1] + math.sin(ang) * 2,
                  3.6, 4.6, 7.2, "butt"))

# G4 — кольца целые, траектория огибает их снаружи дугой
orbit = []
for i in range(101):
    th = math.radians(212 - 150 * i / 100)
    orbit.append((C + 25.5 * math.cos(th), C + 25.5 * math.sin(th)))
o_end, o_prev = orbit[-1], orbit[-6]
oang = math.atan2(o_end[1] - o_prev[1], o_end[0] - o_prev[0])
G4 = wrap(rings_group(ring_paths([17, 11, 5.5], (999, 999, 999, 999), 0), 3.4)
          + f'<g fill="none" stroke="{INKC}" stroke-width="3.6" stroke-linecap="round">'
          + '<path d="M' + "L".join(f"{x:.2f} {y:.2f}" for x, y in orbit) + '"/></g>'
          + arrow(o_prev[0], o_prev[1], o_end[0] + math.cos(oang) * 3.5,
                  o_end[1] + math.sin(oang) * 3.5, 3.6, 4.6, 7.2, "butt"))

# G5 — упрощение G1 под мелкие размеры
seg5 = (C, C, 51.5, 12.5)
G5 = wrap(rings_group(ring_paths([20, 11.5], seg5, 4.4 / 2 + 2.8), 4.2)
          + f'<circle cx="32" cy="32" r="3.4" fill="{INKC}"/>'
          + arrow(*seg5, 4.4, 5.4, 8.4, "butt"))

VARIANTS = {"G1-arrow-from-core": G1, "G2-offset-tangent": G2, "G3-spiral-out": G3,
            "G4-orbit": G4, "G5-simplified": G5}


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
