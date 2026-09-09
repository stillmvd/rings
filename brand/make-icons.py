"""Генерация иконок Trail из знака-спирали.

Растеризует Inkscape: геометрия знака живёт в brand/logo/generate.py, дублировать
её кодом на Pillow больше незачем. Pillow остаётся только для сборки .ico.

Две вещи, ради которых скрипт существует:
  * гибрид — до 32 px берётся mark-small.svg (виток короче и толще), выше
    основной mark.svg: полная спираль на 24 px слипается в пятно;
  * полный набор размеров в .ico, включая 30/36/40 под 125% и 150% DPI,
    иначе панель задач пересчитывает 32 px и мылит.

Запуск: python brand/make-icons.py
"""

import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "brand/logo"
ICONS = ROOT / "desktop/src-tauri/icons"

INKSCAPE = Path(r"C:\Program Files\Inkscape\bin\inkscape.com")

# До 32 px полная спираль не читается: виток и просвет между витками
# укладываются в один-два пикселя.
SMALL_MAX = 32

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


def source_for(size: int) -> Path:
    return LOGO / ("mark-small.svg" if size <= SMALL_MAX else "mark.svg")


def render(size: int, out: Path) -> None:
    subprocess.run(
        [str(INKSCAPE), str(source_for(size)),
         f"--actions=export-filename:{out};export-width:{size};export-height:{size};export-do"],
        check=True, capture_output=True, timeout=180)


def main() -> None:
    if not INKSCAPE.exists():
        sys.exit(f"Inkscape не найден: {INKSCAPE}")
    ICONS.mkdir(parents=True, exist_ok=True)

    for name, size in PNG_TARGETS.items():
        render(size, ICONS / name)

    tmp = ICONS / "_ico"
    tmp.mkdir(exist_ok=True)
    frames = []
    for size in ICO_SIZES:
        path = tmp / f"{size}.png"
        render(size, path)
        frames.append(Image.open(path).convert("RGBA"))

    frames[-1].save(ICONS / "icon.ico", format="ICO",
                    sizes=[(s, s) for s in ICO_SIZES], append_images=frames[:-1])
    for f in frames:
        f.close()
    for path in tmp.glob("*.png"):
        path.unlink()
    tmp.rmdir()

    print(f"PNG: {len(PNG_TARGETS)}, ICO: {len(ICO_SIZES)} размеров -> {ICONS}")


if __name__ == "__main__":
    main()
