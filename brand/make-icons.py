"""Генерация иконок Trail из знака Steps.

Знак рисуется программно, а не растеризуется из SVG: фигуры простые, а
суперсэмплинг даёт более чистый край на мелких размерах.

Две вещи, ради которых скрипт существует:
  * safe-зона — круг занимает не всю канву, иначе Windows срезает ему бока;
  * полный набор размеров в .ico, включая 30/36/40 под 125% и 150% DPI,
    иначе панель задач пересчитывает 32 px и мылит.

Запуск: python brand/make-icons.py
"""

from PIL import Image, ImageDraw
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "desktop/src-tauri/icons"

ACCENT = (255, 255, 30, 255)
GLYPH = (0, 0, 0, 255)

# Координаты знака в системе 64×64 (как в brand/logo/mark.svg).
STEPS = [(15.5, 35.0), (26.0, 26.0), (36.5, 17.0)]
STEP_SIDE = 12.0
STEP_RADIUS = 3.75

SS = 16  # кратность суперсэмплинга

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


def padding(size: int) -> int:
    """Поля нет: круг занимает весь бокс, как у Chrome.

    Знак и так круглый — Windows не добавляет к нему свою рамку, а поле
    только уменьшает фигуру относительно соседних иконок. Срез краёв, из-за
    которого поле вводилось, лечится не полем, а честным антиалиасингом:
    крайние пиксели должны иметь частичную альфу, а не 255.
    """
    return 0


# До 32 px стороны квадратов попадают между пикселями и глиф расплывается.
# Там он рисуется по целой сетке: те же пропорции, но границы на целых
# пикселях, а соседние квадраты перекрываются на 1 px — контакт углами,
# как в знаке, без разрыва лесенки.
HINTED_MAX = 32


def render_hinted(size: int) -> Image.Image:
    k = size / 64.0
    im = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    ImageDraw.Draw(im).ellipse((0, 0, size * SS - 1, size * SS - 1), fill=ACCENT)
    im = im.resize((size, size), Image.BOX)

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
            d.rounded_rectangle(box, radius=1, fill=GLYPH)
        else:
            d.rectangle(box, fill=GLYPH)
    return im


def render(size: int) -> Image.Image:
    if size <= HINTED_MAX:
        return render_hinted(size)
    pad = padding(size)
    big = size * SS
    pad_big = pad * SS
    diameter = big - pad_big * 2
    k = diameter / 64.0

    im = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((pad_big, pad_big, pad_big + diameter - 1, pad_big + diameter - 1), fill=ACCENT)

    for x, y in STEPS:
        left = pad_big + x * k
        top = pad_big + y * k
        d.rounded_rectangle(
            (left, top, left + STEP_SIDE * k - 1, top + STEP_SIDE * k - 1),
            radius=STEP_RADIUS * k,
            fill=GLYPH,
        )

    # BOX — честное усреднение покрытия: для одноцветной фигуры на контрастном
    # фоне даёт более плавный край, чем LANCZOS с его звоном.
    return im.resize((size, size), Image.BOX)


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
