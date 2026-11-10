"""도깨비 사주 엠블럼 SVG 만들기 — 귀면와(鬼面瓦) 스타일

옛 기와에 새긴 도깨비 얼굴처럼: 연주문(구슬 테두리)을 두른 아치형 기와 판,
부릅뜬 눈, 불꽃 눈썹, 넓적한 코, 송곳니를 드러낸 입, 소용돌이 갈기와 작은 뿔.
사용: python dokkaebi.py  → dokkaebi.svg (배경 포함), dokkaebi_fg.svg (배경 없음)
"""
import math

S = 1024


def _curl(cx, cy, r, ang, flip=1):
    """작은 소용돌이(구름·갈기 무늬) 하나"""
    pts = []
    for k in range(0, 46):
        t = k / 45
        a = ang + flip * t * math.pi * 2.2
        rr = r * (1 - t * 0.78)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)


def build(with_bg=True, scale=1.0, prefix="dk", bg_only=False, size=None):
    W_ = size or S
    L = '#2b120c'
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{W_}" height="{W_}">']
    o.append("""<defs>
<radialGradient id="bg" cx="50%" cy="46%" r="70%"><stop offset="0" stop-color="#3b1450"/><stop offset=".55" stop-color="#1c0b2e"/><stop offset="1" stop-color="#0b0614"/></radialGradient>
<linearGradient id="tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3a2a"/><stop offset="1" stop-color="#4a2018"/></linearGradient>
<radialGradient id="clay" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#f3a06e"/><stop offset=".55" stop-color="#d4673f"/><stop offset="1" stop-color="#9c3a22"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".4" stop-color="#ffc93c"/><stop offset=".8" stop-color="#e08a00"/><stop offset="1" stop-color="#9a5200"/></linearGradient>
<radialGradient id="eye" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe9b8"/></radialGradient>
</defs>""")
    if with_bg:
        o.append(f'<rect width="{S}" height="{S}" fill="url(#bg)"/>')
        g0, gs = 512 - 330, 220
        for i in range(4):
            o.append(f'<line x1="{g0}" y1="{g0 + 36 + i * gs}" x2="{g0 + 3 * gs}" y2="{g0 + 36 + i * gs}" stroke="#ffd36b" stroke-opacity=".07" stroke-width="3"/>')
            o.append(f'<line x1="{g0 + i * gs}" y1="{g0 + 36}" x2="{g0 + i * gs}" y2="{g0 + 36 + 3 * gs}" stroke="#ffd36b" stroke-opacity=".07" stroke-width="3"/>')
        o.append('<circle cx="512" cy="512" r="470" fill="none" stroke="#ffd36b" stroke-opacity=".18" stroke-width="6"/>')
    if bg_only:
        o.append('</svg>')
        return _ids('\n'.join(o), prefix)
    o.append(f'<g transform="translate(512 512) scale({scale}) translate(-512 -512)">')
    # ── 기와 판(아치형) + 연주문 ──
    tile = 'M170,930 L170,420 A342,330 0 0 1 854,420 L854,930 Z'
    o.append(f'<path d="{tile}" fill="url(#tile)" stroke="{L}" stroke-width="12" stroke-linejoin="round"/>')
    inner = 'M214,892 L214,428 A298,288 0 0 1 810,428 L810,892 Z'
    o.append(f'<path d="{inner}" fill="none" stroke="#e8b25a" stroke-width="6" opacity=".9"/>')
    beads = []
    for k in range(27):
        a = math.pi + k * math.pi / 26
        beads.append((512 + 320 * math.cos(a), 424 + 309 * math.sin(a)))
    for y in range(470, 900, 46):
        beads += [(192, y), (832, y)]
    for x in range(236, 800, 46):
        beads.append((x, 911))
    for x, y in beads:
        o.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="10" fill="url(#gold)" stroke="{L}" stroke-width="3"/>')
    # ── 갈기(불꽃 소용돌이) ──
    for k in range(16):
        a = math.pi * (0.92 + k * 1.16 / 15)
        cx, cy = 512 + 248 * math.cos(a), 560 + 235 * math.sin(a)
        if cy > 800:
            continue
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="52" fill="#b5492b" stroke="{L}" stroke-width="7"/>')
        o.append(f'<path d="{_curl(cx, cy, 34, a + 1.2, 1 if math.cos(a) < 0 else -1)}" fill="none" stroke="#f0a060" stroke-width="7" stroke-linecap="round"/>')
    # ── 작은 뿔 ──
    for d in ['M420,330 Q388,250 432,196 Q450,258 470,312 Z', 'M604,330 Q636,250 592,196 Q574,258 554,312 Z']:
        o.append(f'<path d="{d}" fill="url(#gold)" stroke="{L}" stroke-width="9" stroke-linejoin="round"/>')
    # ── 얼굴 ──
    o.append(f'<path d="M300,470 Q300,320 512,316 Q724,320 724,470 L724,640 Q712,790 512,800 Q312,790 300,640 Z" fill="url(#clay)" stroke="{L}" stroke-width="11" stroke-linejoin="round"/>')
    o.append(f'<path d="M420,372 Q512,344 604,372" fill="none" stroke="#8c3420" stroke-width="7" stroke-linecap="round"/>')
    o.append(f'<circle cx="512" cy="392" r="18" fill="url(#gold)" stroke="{L}" stroke-width="5"/>')
    # 불꽃 눈썹
    for sx in (1, -1):
        bx = 512 - sx * 106
        d = (f'M{512 - sx * 34},{462} Q{bx},{388} {512 - sx * 196},{430} '
             f'Q{512 - sx * 232},{396} {512 - sx * 214},{360} Q{512 - sx * 186},{404} {512 - sx * 150},{404} '
             f'Q{512 - sx * 168},{372} {512 - sx * 140},{350} Q{512 - sx * 128},{392} {512 - sx * 96},{402} '
             f'Q{bx},{430} {512 - sx * 34},{462} Z')
        o.append(f'<path d="{d}" fill="#3b1a12" stroke="{L}" stroke-width="6" stroke-linejoin="round"/>')
    # 부릅뜬 눈
    for sx in (1, -1):
        cx = 512 - sx * 110
        o.append(f'<circle cx="{cx}" cy="500" r="64" fill="#c23a2c" stroke="{L}" stroke-width="9"/>')
        o.append(f'<circle cx="{cx}" cy="500" r="50" fill="url(#eye)" stroke="{L}" stroke-width="6"/>')
        o.append(f'<circle cx="{cx - sx * 6}" cy="504" r="27" fill="{L}"/>')
        o.append(f'<circle cx="{cx - sx * 6 + 9}" cy="494" r="9" fill="#fff"/>')
    # 볼 소용돌이
    for sx in (1, -1):
        cx = 512 - sx * 158
        o.append(f'<path d="{_curl(cx, 610, 38, 0, sx)}" fill="none" stroke="#8c3420" stroke-width="8" stroke-linecap="round"/>')
    # 넓적한 코
    o.append(f'<path d="M470,516 Q512,500 554,516 L566,580 Q596,582 600,612 Q596,640 560,636 Q540,652 512,650 Q484,652 464,636 Q428,640 424,612 Q428,582 458,580 Z" fill="#c4552f" stroke="{L}" stroke-width="9" stroke-linejoin="round"/>')
    for sx in (1, -1):
        o.append(f'<ellipse cx="{512 - sx * 34}" cy="620" rx="15" ry="11" fill="{L}"/>')
    o.append(f'<path d="M490,530 Q512,524 534,530" fill="none" stroke="#f5b07a" stroke-width="6" stroke-linecap="round"/>')
    # 크게 벌린 입
    o.append(f'<path d="M372,672 Q512,652 652,672 Q640,770 512,778 Q384,770 372,672 Z" fill="#5a0f14" stroke="{L}" stroke-width="10" stroke-linejoin="round"/>')
    o.append('<path d="M440,742 Q512,712 584,742 Q560,770 512,772 Q464,770 440,742 Z" fill="#e0505a"/>')
    for k in range(6):
        x = 420 + k * 31
        o.append(f'<rect x="{x}" y="666" width="29" height="24" rx="5" fill="#fff6e0" stroke="{L}" stroke-width="4"/>')
    for sx in (1, -1):
        x = 512 - sx * 118
        o.append(f'<path d="M{x - 15},668 L{x + 15},668 L{x},{724} Z" fill="#fff6e0" stroke="{L}" stroke-width="5" stroke-linejoin="round"/>')
        x2 = 512 - sx * 78
        o.append(f'<path d="M{x2 - 13},770 L{x2 + 13},770 L{x2},{730} Z" fill="#fff6e0" stroke="{L}" stroke-width="5" stroke-linejoin="round"/>')
    # 수염 소용돌이 (턱 아래)
    for sx, cx in [(1, 400), (1, 470), (-1, 554), (-1, 624)]:
        o.append(f'<path d="{_curl(cx, 836, 34, -math.pi / 2, sx)}" fill="none" stroke="#e8b25a" stroke-width="9" stroke-linecap="round"/>')
    o.append('</g></svg>')
    return _ids('\n'.join(o), prefix)


def _ids(svg, prefix):
    for name in ["bg", "tile", "clay", "gold", "eye"]:
        svg = svg.replace(f'id="{name}"', f'id="{prefix}-{name}"').replace(f'url(#{name})', f'url(#{prefix}-{name})')
    return svg


if __name__ == "__main__":
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "dokkaebi.svg"), "w") as f:
        f.write(build(True))
    with open(os.path.join(here, "dokkaebi_fg.svg"), "w") as f:
        f.write(build(False))
