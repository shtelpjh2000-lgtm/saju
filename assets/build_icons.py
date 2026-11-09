"""dragon.py로 앱 아이콘·시작 화면·스토어 이미지를 한 번에 만들어요 (Playwright 필요).
사용: python build_icons.py
"""
import os, re, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE); import dragon
PR = os.path.join(ROOT, 'promo'); ST = os.path.join(ROOT, 'store'); TMP = tempfile.mkdtemp()
J = lambda s: ImageFont.truetype(os.path.join(PR, 'fonts', 'Jua-Regular.ttf'), s)
G = lambda s: ImageFont.truetype(os.path.join(PR, 'fonts', 'GowunDodum-Regular.ttf'), s)

def render(svg, dst, size, transparent=False):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': size, 'height': size})
        svg = svg.replace('width="1024" height="1024"', f'width="{size}" height="{size}"', 1)
        pg.set_content('<html><body style="margin:0;background:transparent">' + svg + '</body></html>')
        pg.screenshot(path=dst, omit_background=transparent, clip={'x': 0, 'y': 0, 'width': size, 'height': size}); b.close()

def darkbg(w, h):
    y = np.linspace(-1, 1, h)[:, None]; x = np.linspace(-1, 1, w)[None, :]
    t = np.clip(np.sqrt(x ** 2 + y ** 2) / 1.3, 0, 1)[..., None]
    c = np.array([59, 20, 80]) * (1 - t) + np.array([11, 6, 20]) * t
    return Image.fromarray(c.astype(np.uint8), 'RGB').convert('RGBA')

render(dragon.build(True, 0.95), os.path.join(HERE, 'icon-only.png'), 1024)
render(dragon.build(bg_only=True), os.path.join(HERE, 'icon-background.png'), 1024)
render(dragon.build(False, 0.68), os.path.join(HERE, 'icon-foreground.png'), 1024, True)
full = os.path.join(TMP, 'fg.png'); render(dragon.build(False, 1.0), full, 1024, True)
fg = Image.open(full).convert('RGBA')
for name in ['splash.png', 'splash-dark.png']:
    sp = darkbg(2732, 2732); sp.alpha_composite(fg.resize((1150, 1150), Image.LANCZOS), ((2732 - 1150) // 2, (2732 - 1150) // 2 - 180))
    d = ImageDraw.Draw(sp); d.text((1366, 1886), '귀문 명국', font=J(170), fill=(255, 211, 107), anchor='mm')
    d.text((1366, 2046), '기문둔갑으로 보는 내 운명 지도', font=J(70), fill=(214, 190, 240), anchor='mm')
    sp.convert('RGB').save(os.path.join(HERE, name), optimize=True)
ic = Image.open(os.path.join(HERE, 'icon-only.png')).convert('RGB'); ic.save(os.path.join(HERE, 'icon-only.png'), optimize=True)
Image.open(os.path.join(HERE, 'icon-background.png')).convert('RGB').save(os.path.join(HERE, 'icon-background.png'), optimize=True)
ic.resize((512, 512), Image.LANCZOS).save(os.path.join(ST, 'icon_512.png'))
b = ic.resize((600, 600), Image.LANCZOS).convert('RGBA'); m = Image.new('L', (600, 600), 0); ImageDraw.Draw(m).ellipse([0, 0, 599, 599], fill=255); b.putalpha(m)
b.save(os.path.join(PR, 'dragon_badge.png'))
g = darkbg(1024, 500); g.alpha_composite(fg.resize((480, 480), Image.LANCZOS), (10, 10)); d = ImageDraw.Draw(g)
d.text((500, 175), '귀문 명국', font=J(112), fill=(255, 211, 107), anchor='lm')
d.text((505, 280), '기문둔갑으로 보는 내 운명 지도', font=J(42), fill=(255, 150, 180), anchor='lm')
d.text((505, 345), '명국 · 신수 · 매일 일진 알림', font=G(34), fill=(214, 190, 240), anchor='lm')
g.convert('RGB').save(os.path.join(ST, 'feature_graphic.png'))
# 앱 머리 로고 (index.html 안의 svg.logo 바꾸기)
p = os.path.join(ROOT, 'www', 'index.html'); s = open(p, encoding='utf-8').read()
i = s.index('<svg class="logo"'); j = s.index('</svg>', i) + len('</svg>')
svg = dragon.build(True, 0.95, 'hd', size=74).replace('<svg xmlns="http://www.w3.org/2000/svg"', '<svg class="logo" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"', 1)
svg = re.sub(r'(\d+\.\d)\d+', r'\1', svg)
open(p, 'w', encoding='utf-8').write(s[:i] + svg + s[j:])
print('icons ok')
