"""Единственный источник геометрии знака Trail.

Знак — спираль, разворачивающаяся из ядра наружу и заканчивающаяся точкой
«сейчас». Все файлы бренда (mark/favicon/app-icon/mono/small) и растровые
иконки строятся отсюда, поэтому правку геометрии делать только здесь.

Запуск: python brand/logo/generate.py
"""

import math
import pathlib

HERE = pathlib.Path(__file__).resolve().parent

ACCENT = "#FFFF1E"
GLYPH = "#000000"

C = 32.0
FIT_R = 25.0        # 78 % диаметра диска
STROKE = 3.4
DOT_K = 1.35

# Мелкие размеры: виток короче и толще, иначе на 24 px спираль слипается.
SMALL = dict(fit_r=26.0, stroke=4.6, dot_k=1.30, turns=1.05, r1=13.0, tail=8.6)


def spiral(r0, r1, turns, end_deg, steps=300):
    th1 = math.radians(end_deg)
    th0 = th1 + turns * 2 * math.pi
    return [(C + (r0 + (r1 - r0) * i / steps) * math.cos(th0 + (th1 - th0) * i / steps),
             C + (r0 + (r1 - r0) * i / steps) * math.sin(th0 + (th1 - th0) * i / steps))
            for i in range(steps + 1)]


def extend(pts, length, bend=-6.0, steps=40):
    (ax, ay), (bx, by) = pts[-6], pts[-1]
    ang = math.atan2(by - ay, bx - ax)
    return pts + [(bx + math.cos(ang + math.radians(bend) * i / steps) * length * i / steps,
                   by + math.sin(ang + math.radians(bend) * i / steps) * length * i / steps)
                  for i in range(1, steps + 1)]


def geometry(fit_r=FIT_R, stroke=STROKE, dot_k=DOT_K, turns=1.35, r1=14.5, tail=7.5):
    pts = extend(spiral(4.4, r1, turns, -60), tail)
    dot_r = stroke * dot_k
    pad = max(stroke / 2, dot_r)
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, x1 = min(xs) - pad, max(xs) + pad
    y0, y1 = min(ys) - pad, max(ys) + pad
    scale = (fit_r * 2) / max(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    tf = f"translate({C - cx * scale:.3f} {C - cy * scale:.3f}) scale({scale:.4f})"
    d = "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in pts)
    return tf, d, pts[-1], dot_r, stroke


def glyph(color, tf, d, tip, dot_r, stroke):
    return (f'<g transform="{tf}">'
            f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{stroke}" '
            f'stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle cx="{tip[0]:.2f}" cy="{tip[1]:.2f}" r="{dot_r:.2f}" fill="{color}"/>'
            f'</g>')


def document(body, width=64, height=64):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" '
            f'width="{width}" height="{height}" fill="none">{body}</svg>')


def disc():
    return f'<circle cx="32" cy="32" r="32" fill="{ACCENT}"/>' 


def lockup(word_block: str) -> str:
    base = geometry()
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 194.98 64" '
            'width="194.98" height="64" fill="none">'
            + disc() + glyph(GLYPH, *base) + word_block + '</svg>')


def main() -> None:
    base = geometry()
    small = geometry(**SMALL)

    files = {
        "mark.svg": document(disc() + glyph(GLYPH, *base)),
        "favicon.svg": document(disc() + glyph(GLYPH, *base)),
        "app-icon.svg": document(disc() + glyph(GLYPH, *base), 1024, 1024),
        "mark-small.svg": document(disc() + glyph(GLYPH, *small)),
        "mark-mono.svg": document(glyph("currentColor", *base)),
    }
    for name, markup in files.items():
        (HERE / name).write_text(markup, encoding="utf-8")

    for name, block in (("lockup.svg", "_wordblock.txt"),
                        ("lockup-on-dark.svg", "_wordblock-dark.txt")):
        src = HERE / block
        if src.exists():
            (HERE / name).write_text(lockup(src.read_text(encoding="utf-8")), encoding="utf-8")

    print("SVG:", ", ".join(files), "+ lockups")


if __name__ == "__main__":
    main()
