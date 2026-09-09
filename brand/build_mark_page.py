import base64
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
LOGO = ROOT / "logo"
ICONS = ROOT.parent / "desktop/src-tauri/icons"
OUT = ROOT / "mark-preview.html"


def svg(name, cls):
    s = (LOGO / name).read_text(encoding="utf-8")
    head_end = s.find(">", s.find("<svg")) + 1
    vb = "0 0 194.98 64" if "lockup" in name else "0 0 64 64"
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" class="{cls}" fill="none">' + s[head_end:]


def png_uri(path):
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode()


ICON_ROW = "".join(
    f'<figure><img src="{png_uri(ICONS / name)}" width="{px}" height="{px}" alt="{px} px"><figcaption>{px}</figcaption></figure>'
    for name, px in (("icon.png", 128), ("64x64.png", 64), ("Square44x44Logo.png", 44),
                     ("32x32.png", 32), ("Square30x30Logo.png", 30)))

CSS = """
:root{--ground:#0B0B0A;--surface:#141413;--line:#2B2B27;--text:#EDEDE8;--muted:#8C8C84;
  --accent:#FFFF1E;--paper:#F2F2EC}
:root[data-theme="light"]{--ground:#EFEFE9;--surface:#FFF;--line:#DCDCD3;--text:#16160F;--muted:#63635B;--paper:#F8F8F3}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){--ground:#EFEFE9;--surface:#FFF;
  --line:#DCDCD3;--text:#16160F;--muted:#63635B;--paper:#F8F8F3}}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--text);
  font-family:"Outfit",system-ui,-apple-system,"Segoe UI",sans-serif;font-size:15px;line-height:1.55}
.wrap{max-width:1080px;margin:0 auto;padding:52px 24px 76px;display:grid;gap:42px}
h1{margin:0;font-size:clamp(30px,4.6vw,46px);font-weight:800;letter-spacing:-.03em;line-height:1.04}
.lede{margin:14px 0 0;max-width:64ch;color:var(--muted);font-weight:300;font-size:16.5px}
h2{margin:0 0 14px;font-size:20px;font-weight:600;letter-spacing:-.015em}
.hero{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:22px;
  display:grid;gap:14px;justify-items:center}
.tile.paper{background:var(--paper)}
.tile .big{width:170px;height:170px}
.cap{color:var(--muted);font-size:13.5px;text-align:center}
:root[data-theme="light"] .tile.paper .cap,.tile.paper .cap{color:#5C5C55}
.mono{color:var(--text)}
.row{display:flex;align-items:flex-end;gap:22px;flex-wrap:wrap;background:var(--surface);
  border:1px solid var(--line);border-radius:18px;padding:22px}
.row.paper{background:var(--paper)}
figure{margin:0;display:grid;gap:8px;justify-items:center}
figcaption{color:var(--muted);font-size:12px}
.row.paper figcaption{color:#5C5C55}
.lock{width:100%;max-width:420px;height:auto}
.lockrow{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.dark{background:#101010;border:1px solid var(--line);border-radius:18px;padding:26px;display:grid;place-items:center}
.light{background:#F2F2EC;border:1px solid var(--line);border-radius:18px;padding:26px;display:grid;place-items:center}
footer{border-top:1px solid var(--line);padding-top:20px;color:var(--muted);font-size:14px;font-weight:300;display:grid;gap:8px}
code{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;background:var(--surface);
  border:1px solid var(--line);border-radius:6px;padding:1px 5px}
"""

HTML = f"""<title>Новый знак Trail</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;800&display=swap">
<style>{CSS}</style>
<div class="wrap">
  <header>
    <h1>Спираль вместо ступеней</h1>
    <p class="lede">Линия разворачивается из ядра наружу и заканчивается точкой «сейчас» — путь, пройденный
      до сегодняшнего дня. Глиф занимает 78 % диаметра круга. Геометрия живёт в одном файле
      <code>brand/logo/generate.py</code>, из него собираются все SVG и растровые иконки.</p>
  </header>

  <section>
    <h2>Знак</h2>
    <div class="hero">
      <div class="tile"><div class="big">{svg("mark.svg", "big")}</div><span class="cap">Основной</span></div>
      <div class="tile"><div class="big">{svg("mark-small.svg", "big")}</div><span class="cap">Упрощённый, идёт в размеры до 32 px</span></div>
      <div class="tile paper"><div class="big mono" style="color:#16160F">{svg("mark-mono.svg", "big")}</div><span class="cap">Одноцветный, наследует цвет текста</span></div>
    </div>
  </section>

  <section>
    <h2>Иконка приложения</h2>
    <div class="row">{ICON_ROW}</div>
    <div style="height:12px"></div>
    <div class="row paper">{ICON_ROW}</div>
  </section>

  <section>
    <h2>Локап</h2>
    <div class="lockrow">
      <div class="light">{svg("lockup.svg", "lock")}</div>
      <div class="dark">{svg("lockup-on-dark.svg", "lock")}</div>
    </div>
  </section>

  <footer>
    <p>Файлы: <code>brand/logo/</code> — mark, mark-small, mark-mono, favicon, app-icon, локапы.
       Иконки: <code>desktop/src-tauri/icons/</code>, 16 PNG плюс <code>.ico</code> на 12 размеров.</p>
    <p>В интерфейсе знак уже стоит в титлбаре и на заставке запуска.</p>
  </footer>
</div>
"""

OUT.write_text(HTML, encoding="utf-8")
print("written", OUT, len(HTML), "bytes")
