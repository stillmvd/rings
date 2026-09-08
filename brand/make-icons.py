"""Генерация иконок Trail из знака Steps.

Знак рисуется программно, а не растеризуется из SVG: фигуры простые, а
суперсэмплинг даёт более чистый край на мелких размерах.

Три вещи, ради которых скрипт существует:
  * фаска — объём знака держится на кольце-скосе по краю диска и по краю
    каждой плитки: свет сверху-слева, тень снизу-справа;
  * ниже 32 px фаска плиток не помещается в пиксели, там остаётся только
    фаска диска, а глиф рисуется плоским по целой сетке;
  * полный набор размеров в .ico, включая 30/36/40 под 125% и 150% DPI,
    иначе панель задач пересчитывает 32 px и мылит.

Запуск: python brand/make-icons.py
"""

from PIL import Image, ImageDraw
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "desktop/src-tauri/icons"

ACCENT = (255, 255, 30)
GLYPH = (10, 10, 9)

# Стопы фаски: та же светотень, что в brand/logo/mark.svg.
DISC_BEVEL = [(0.0, (255, 255, 209)), (0.45, (255, 255, 60)), (1.0, (143, 141, 0))]
TILE_BEVEL = [(0.0, (106, 106, 96)), (0.5, (26, 26, 22)), (1.0, (0, 0, 0))]

DISC_BEVEL_W = 3.0
TILE_BEVEL_W = 1.15
TILE_INNER_RADIUS = 2.8

# Координаты знака в системе 64×64 (как в brand/logo/mark.svg).
STEPS = [(15.5, 35.0), (26.0, 26.0), (36.5, 17.0)]
STEP_SIDE = 12.0
STEP_RADIUS = 3.75

GRAD_RES = 128

# Панель задач Windows 11 берёт "малую" иконку (16 px) и растягивает её до 24 —
# получается мыло. Без записей мельче 24 системе приходится брать 24 и ниже
# масштабировать её, что заметно чище.
ICO_SIZES = [24, 30, 32, 36, 40, 48, 60, 64, 72, 96, 128, 256]

PNG_TARGETS = {
    "32x32.png": 32,
    "64x64.png": 64,
    "128x128.png": 128,
    "128x128@2x.png": 256,
    "icon.png": 512,
    "tray.png": 32,
    "Square30x30Logo.png": 30,
    "Square44x44Logo.png": 44,
    "Square71x71Logo.png": 71,
    "Square89x89Logo.png": 89,
    "Square107x107Logo.png": 107,
    "Square142x142Logo.png": 142,
    "Square150x150Logo.png": 150,
    "Square284x284Logo.png": 284,
    "Square310x310Logo.png": 310,
    "StoreLogo.png": 50,
}

# До 32 px сторона плитки — 4-5 px: фаска съела бы половину глифа.
HINTED_MAX = 32


def supersample(size: int) -> int:
    return max(2, min(16, 2048 // size))


def sample(stops, t: float):
    for i in range(len(stops) - 1):
        o0, c0 = stops[i]
        o1, c1 = stops[i + 1]
        if t <= o1:
            f = 0.0 if o1 == o0 else (t - o0) / (o1 - o0)
            return tuple(round(a + (b - a) * f) for a, b in zip(c0, c1))
    return stops[-1][1]


def gradient(size: int, p0, p1, stops) -> Image.Image:
    """Линейный градиент, заданный вектором в системе 64×64."""
    x0, y0 = p0
    dx, dy = p1[0] - x0, p1[1] - y0
    dd = dx * dx + dy * dy
    g = Image.new("RGB", (GRAD_RES, GRAD_RES))
    px = g.load()
    for j in range(GRAD_RES):
        v = (j + 0.5) * 64.0 / GRAD_RES
        for i in range(GRAD_RES):
            u = (i + 0.5) * 64.0 / GRAD_RES
            t = ((u - x0) * dx + (v - y0) * dy) / dd
            px[i, j] = sample(stops, min(1.0, max(0.0, t)))
    return g.resize((size, size), Image.BILINEAR)


def mask(size: int, paint) -> Image.Image:
    """Маска фигуры: рисуется с суперсэмплингом, сжимается честным BOX."""
    ss = supersample(size)
    big = size * ss
    m = Image.new("L", (big, big), 0)
    paint(ImageDraw.Draw(m), big / 64.0)
    return m.resize((size, size), Image.BOX)


def solid(size: int, color) -> Image.Image:
    return Image.new("RGB", (size, size), color)


def disc(size: int) -> Image.Image:
    """Жёлтая шайба с фаской по краю."""
    bevel = max(1.0, DISC_BEVEL_W * size / 64.0) * 64.0 / size

    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    im.paste(
        gradient(size, (11.52, 0.0), (52.48, 64.0), DISC_BEVEL),
        (0, 0),
        mask(size, lambda d, k: d.ellipse((0, 0, 64 * k - 1, 64 * k - 1), fill=255)),
    )
    im.paste(
        solid(size, ACCENT),
        (0, 0),
        mask(size, lambda d, k: d.ellipse(
            (bevel * k, bevel * k, (64 - bevel) * k - 1, (64 - bevel) * k - 1), fill=255)),
    )
    return im


def render_hinted(size: int) -> Image.Image:
    """Мелкие размеры: фаска только у диска, глиф — по целой пиксельной сетке."""
    k = size / 64.0
    im = disc(size)

    # Пропорции знака округляются к сетке: сторона 12, шаг 10.5 и 9.
    # Сторона обязана быть больше шага — иначе округление обнуляет перекрытие
    # и лесенка распадается на три отдельные точки.
    step_x = max(1, round(10.5 * k))
    step_y = max(1, round(9.0 * k))
    side = max(2, round(STEP_SIDE * k), step_x + 1)
    span_x = side + step_x * 2
    span_y = side + step_y * 2
    left = round((size - span_x) / 2)
    top = round((size - span_y) / 2)

    d = ImageDraw.Draw(im)
    for i in range(3):
        x = left + step_x * i
        y = top + span_y - side - step_y * i
        box = (x, y, x + side - 1, y + side - 1)
        if side >= 4:
            d.rounded_rectangle(box, radius=1, fill=GLYPH + (255,))
        else:
            d.rectangle(box, fill=GLYPH + (255,))
    return im


def render(size: int) -> Image.Image:
    if size <= HINTED_MAX:
        return render_hinted(size)

    im = disc(size)
    inset = TILE_BEVEL_W
    for x, y in STEPS:
        im.paste(
            gradient(size, (x + 2.4, y), (x + 9.6, y + STEP_SIDE), TILE_BEVEL),
            (0, 0),
            mask(size, lambda d, k, x=x, y=y: d.rounded_rectangle(
                (x * k, y * k, (x + STEP_SIDE) * k - 1, (y + STEP_SIDE) * k - 1),
                radius=STEP_RADIUS * k, fill=255)),
        )
        im.paste(
            solid(size, GLYPH),
            (0, 0),
            mask(size, lambda d, k, x=x, y=y: d.rounded_rectangle(
                ((x + inset) * k, (y + inset) * k,
                 (x + STEP_SIDE - inset) * k - 1, (y + STEP_SIDE - inset) * k - 1),
                radius=TILE_INNER_RADIUS * k, fill=255)),
        )
    return im


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)

    for name, size in PNG_TARGETS.items():
        render(size).save(ICONS / name)

    frames = [render(s) for s in ICO_SIZES]
    frames[-1].save(
        ICONS / "icon.ico",
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
        append_images=frames[:-1],
    )

    print(f"PNG: {len(PNG_TARGETS)}, ICO: {len(ICO_SIZES)} размеров -> {ICONS}")


if __name__ == "__main__":
    main()
