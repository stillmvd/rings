import pathlib, html

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "concepts-page.html"


def svg(path, cls):
    s = path.read_text(encoding="utf-8")
    s = s.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">',
                  f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="{cls}">')
    return s


SECTIONS = [
    ("Размер глифа в круге", "Выбранная форма — спираль с точкой «сейчас». Здесь одна и та же геометрия, вписанная в разную долю диаметра диска. Крайний правый — тот же размер, но линия тоньше.",
     "final10", ["Y1-fit21", "Y2-fit23", "Y3-fit25", "Y4-fit27", "Y5-fit25-thin"], "disc"),
    ("Волна 3 · два направления", "Монохром: сначала силуэт, цвет потом. Верхние три — «траектория» по первому референсу, нижние — «отпечаток» по второму.",
     "wave3", ["A1-spiral-pierced", "A2-rings-pierced", "A3-spiral-to-arrow",
               "B1-fingerprint", "B2-fingerprint-trail", "B3-fingerprint-offset"], "mono"),
    ("Кольца в фирменной палитре", "Выбранное направление — кольца со стрелкой. Здесь всплыло: концентрические кольца читаются как мишень, а диагональ через центр — как знак «запрещено».",
     "final2", ["G1-arrow-from-core", "G2-offset-tangent", "G3-spiral-out", "G4-orbit", "G5-simplified"], "disc"),
    ("Спираль · финалисты", "Уход от мишени: одна линия из ядра наружу. Компактный виток плюс длинный прямой выход — единственная конструкция, где стрелка перестала быть крючком.",
     "final9", ["X1-now-dot", "X2-taper-dot", "X3-long-arrow", "X4-start-and-now", "X5-simple"], "disc"),
]

LABELS = {
    "Y1-fit21": "66% диаметра",
    "Y2-fit23": "72% диаметра",
    "Y3-fit25": "78% диаметра",
    "Y4-fit27": "84% диаметра",
    "Y5-fit25-thin": "78%, линия тоньше",
    "A1-spiral-pierced": "Спираль, прошитая траекторией",
    "A2-rings-pierced": "Кольца, прошитые траекторией",
    "A3-spiral-to-arrow": "Спираль переходит в стрелку",
    "B1-fingerprint": "Отпечаток",
    "B2-fingerprint-trail": "Отпечаток с выходом тропы",
    "B3-fingerprint-offset": "Отпечаток со смещённым ядром",
    "G1-arrow-from-core": "Стрелка из ядра",
    "G2-offset-tangent": "Ядро смещено, касательная",
    "G3-spiral-out": "Спираль наружу",
    "G4-orbit": "Орбита вокруг ядра",
    "G5-simplified": "Упрощённая под мелкие",
    "X1-now-dot": "Точка «сейчас» на конце",
    "X2-taper-dot": "Линия набирает толщину",
    "X3-long-arrow": "Длинный выход + стрелка",
    "X4-start-and-now": "Начало и «сейчас»",
    "X5-simple": "Упрощённая под мелкие",
}

PICK = "Y3-fit25"

cards = []
for title, note, folder, names, kind in SECTIONS:
    items = []
    for n in names:
        p = ROOT / folder / f"{n}.svg"
        if not p.exists():
            continue
        big = svg(p, "big")
        smalls = "".join(f'<span class="s{px}">{svg(p, f"sz s{px}")}</span>' for px in (48, 32, 24))
        pick = " pick" if n == PICK else ""
        badge = '<span class="badge">финалист</span>' if n == PICK else ""
        items.append(f'<figure class="card {kind}{pick}">'
                     f'<div class="stage">{big}</div>'
                     f'<figcaption><span class="name">{html.escape(LABELS.get(n, n))}</span>{badge}</figcaption>'
                     f'<div class="sizes">{smalls}</div></figure>')
    cards.append(f'<section><h2>{html.escape(title)}</h2>'
                 f'<p class="note">{html.escape(note)}</p>'
                 f'<div class="grid">{"".join(items)}</div></section>')

CSS = """
:root {
  --ground:#0B0B0A; --surface:#141413; --line:#2B2B27; --text:#EDEDE8; --muted:#8C8C84;
  --accent:#FFFF1E; --mono-bg:#F2F2EC;
}
:root[data-theme="light"] {
  --ground:#EFEFE9; --surface:#FFFFFF; --line:#DCDCD3; --text:#16160F; --muted:#63635B;
  --mono-bg:#F6F6F0;
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --ground:#EFEFE9; --surface:#FFFFFF; --line:#DCDCD3; --text:#16160F; --muted:#63635B;
    --mono-bg:#F6F6F0;
  }
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--text);
  font-family:"Outfit",system-ui,-apple-system,"Segoe UI",sans-serif;font-size:15px;line-height:1.55}
.wrap{max-width:1120px;margin:0 auto;padding:48px 24px 72px;display:grid;gap:44px}
h1{margin:0;font-size:clamp(28px,4.4vw,42px);font-weight:800;letter-spacing:-.03em;line-height:1.05}
.lede{margin:14px 0 0;max-width:64ch;color:var(--muted);font-weight:300;font-size:16.5px}
h2{margin:0 0 4px;font-size:21px;font-weight:600;letter-spacing:-.015em}
.note{margin:0 0 18px;max-width:70ch;color:var(--muted);font-size:14.5px;font-weight:300}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.card{margin:0;background:var(--surface);border:1px solid var(--line);border-radius:16px;
  padding:16px;display:grid;gap:12px}
.card.pick{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.stage{border-radius:12px;display:grid;place-items:center;padding:14px}
.card.mono .stage{background:var(--mono-bg)}
.card.disc .stage{background:#1E1E1B}
:root[data-theme="light"] .card.disc .stage{background:#E6E6DF}
.big{width:150px;height:150px;display:block}
figcaption{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px}
.name{font-weight:500}
.badge{font-size:11px;letter-spacing:.06em;text-transform:uppercase;background:var(--accent);
  color:#12120A;border-radius:999px;padding:2px 8px;font-weight:600}
.sizes{display:flex;align-items:flex-end;gap:12px;padding:10px 12px;border-radius:10px;
  background:var(--mono-bg)}
.card.disc .sizes{background:#1E1E1B}
:root[data-theme="light"] .card.disc .sizes{background:#E6E6DF}
.sz{display:block}
.s48{width:48px;height:48px}.s32{width:32px;height:32px}.s24{width:24px;height:24px}
footer{border-top:1px solid var(--line);padding-top:20px;color:var(--muted);font-size:14px;
  display:grid;gap:8px;font-weight:300}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;
  background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:1px 5px}
"""

HTML = f"""<title>Знак Trail: поиск формы</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;800&display=swap">
<style>{CSS}</style>
<div class="wrap">
  <header>
    <h1>Знак Trail: спираль и её размер</h1>
    <p class="lede">Форма выбрана — спираль, заканчивающаяся точкой «сейчас». Первая секция про то,
      насколько крупно глиф сидит в жёлтом круге; ниже — история, как к этой форме пришли.
      Под каждым вариантом реальные 48 / 32 / 24 px, размеры иконки приложения.</p>
  </header>
  {"".join(cards)}
  <footer>
    <p>Исходники и генераторы — в <code>brand/concepts/</code>: <code>concepts3.py</code>, <code>final2.py</code>, <code>final9.py</code>.</p>
    <p>Каждый вариант лежит в двух видах: с обводками и в контурах (<code>-flat.svg</code>), плюс PNG на всех размерах.</p>
  </footer>
</div>
"""

OUT.write_text(HTML, encoding="utf-8")
print("written", OUT, len(HTML), "bytes")
