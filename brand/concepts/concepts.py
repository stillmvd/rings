import math, subprocess, pathlib

INK = r"C:\Program Files\Inkscape\bin\inkscape.com"
OUT = pathlib.Path(__file__).parent / "concepts"
OUT.mkdir(exist_ok=True)

C = 32.0
W = 3.4


def svg(body, extra=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'<g fill="none" stroke="#111111" stroke-width="{W}" stroke-linecap="round">{body}</g>{extra}</svg>')


def arc(r, a0, a1, cx=C, cy=C, w=None):
    x0, y0 = cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0))
    x1, y1 = cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1))
    large = 1 if (a1 - a0) % 360 > 180 else 0
    sw = "" if w is None else f' stroke-width="{w}"'
    return f'<path d="M{x0:.2f} {y0:.2f}A{r} {r} 0 {large} 1 {x1:.2f} {y1:.2f}"{sw}/>'


def spiral(r0, r1, turns, a0=0.0, steps=240, cx=C, cy=C):
    pts = []
    total = turns * 2 * math.pi
    for i in range(steps + 1):
        t = i / steps
        th = a0 + total * t
        r = r0 + (r1 - r0) * t
        pts.append(f"{cx + r * math.cos(th):.2f} {cy + r * math.sin(th):.2f}")
    return '<path d="M' + "L".join(pts) + '"/>'


def dot(r=2.8, cx=C, cy=C):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#111111" stroke="none"/>'


# 01 — отпечаток: вложенные дуги, разрывы книзу, кольцо снаружи
fingerprint = svg(
    arc(26, 0, 359.9, w=4.2)
    + arc(20.5, 200, 340) + arc(20.5, 20, 160)
    + arc(15.5, 190, 350) + arc(15.5, 30, 150)
    + arc(10.5, 205, 335)
    + arc(6, 25, 155),
    dot(2.6))

# 02 — отпечаток, из которого выходит тропа
fingerprint_exit = svg(
    arc(26, 40, 355, w=4.2)
    + arc(20.5, 200, 335) + arc(20.5, 25, 160)
    + arc(15.5, 190, 350)
    + arc(10.5, 40, 330)
    + '<path d="M45.5 24.5C51 19 55 16 59 14.5"/>',
    dot(2.6) + dot(2.2, 59.2, 14.2))

# 03 — спираль с каналом под стрелку
spiral_arrow = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
    f'<g id="coil" fill="none" stroke="#111111" stroke-width="{W}" stroke-linecap="round">'
    + spiral(5, 25, 2.05, math.radians(150)) + '</g>'
    '<path id="channel" d="M11 53L52 12" fill="none" stroke="#111111" stroke-width="9" stroke-linecap="round"/>'
    '<g id="arrow" fill="#111111">'
    '<path d="M14.4 49.6 L44 20 L48.4 24.4 L18.8 54 Z"/>'
    '<path d="M56 8 L57 22.5 L41.5 7 Z"/>'
    '</g></svg>')

# 04 — радар: разорванные кольца + стрелка
radar_arrow = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
    f'<g id="coil" fill="none" stroke="#111111" stroke-width="{W}" stroke-linecap="round">'
    + arc(26, 130, 30) + arc(20, 140, 20) + arc(14, 150, 10) + arc(8, 165, 355) + '</g>'
    '<path id="channel" d="M13 51L54 10" fill="none" stroke="#111111" stroke-width="9" stroke-linecap="round"/>'
    '<g id="arrow" fill="#111111">'
    '<path d="M15.6 48.4 L45 19 L49.4 23.4 L20 52.8 Z"/>'
    '<path d="M57 7 L58 21.5 L42.5 6 Z"/>'
    '</g></svg>')

# 05 — три ступени Trail, закрученные по спирали
steps = []
for i, (ang, rad, side) in enumerate(((205, 19, 9.5), (315, 13.5, 8.5), (65, 20, 10.5))):
    x = C + rad * math.cos(math.radians(ang)) - side / 2
    y = C + rad * math.sin(math.radians(ang)) - side / 2
    steps.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{side}" height="{side}" rx="{side*0.3:.2f}" fill="#111111" stroke="none"/>')
steps_spiral = svg(
    arc(26, 0, 359.9, w=3.0) + spiral(7, 21, 1.0, math.radians(200)),
    "".join(steps))

# 06 — тропа: одна линия, петля, точка финиша
trail_loop = svg(
    '<path d="M6 50C16 50 18 38 26 34C34 30 42 34 46 27C50 20 46 12 52 9"/>'
    + arc(26, 0, 359.9, w=2.2),
    dot(3.0, 52.4, 8.8) + dot(2.2, 6.2, 50.2))

CONCEPTS = {
    "01-fingerprint": (fingerprint, False),
    "02-fingerprint-exit": (fingerprint_exit, False),
    "03-spiral-arrow": (spiral_arrow, True),
    "04-radar-arrow": (radar_arrow, True),
    "05-steps-spiral": (steps_spiral, False),
    "06-trail-loop": (trail_loop, False),
}


def run(path, actions):
    subprocess.run([INK, str(path), f"--actions={actions}"], check=True,
                   capture_output=True, timeout=120)


for name, (markup, has_channel) in CONCEPTS.items():
    raw = OUT / f"{name}.svg"
    raw.write_text(markup, encoding="utf-8")
    flat = OUT / f"{name}-flat.svg"

    if has_channel:
        acts = ("select-by-id:coil;object-stroke-to-path;path-union;"
                "select-by-id:channel;object-stroke-to-path;"
                "select-by-id:coil,channel;path-difference;"
                "select-all;path-union;"
                f"export-filename:{flat};export-plain-svg;export-do")
    else:
        acts = ("select-all;object-to-path;object-stroke-to-path;path-union;"
                f"export-filename:{flat};export-plain-svg;export-do")
    run(raw, acts)

    png = OUT / f"{name}.png"
    run(flat, f"export-filename:{png};export-width:300;export-height:300;export-do")
    print("ok", name)
