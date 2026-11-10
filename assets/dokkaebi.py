"""도깨비 사주 엠블럼 SVG 만들기

금 방망이를 든 귀여운 도깨비. 동그란 얼굴, 금빛 뿔 두 개, 곱슬머리, 큰 눈과 송곳니 미소.
사용: python dokkaebi.py  → dokkaebi.svg (배경 포함), dokkaebi_fg.svg (배경 없음)
"""
S = 1024


def build(with_bg=True, scale=1.0, prefix="dk", bg_only=False, size=None):
    W_ = size or S
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{W_}" height="{W_}">']
    o.append("""<defs>
<radialGradient id="bg" cx="50%" cy="46%" r="70%"><stop offset="0" stop-color="#3b1450"/><stop offset=".55" stop-color="#1c0b2e"/><stop offset="1" stop-color="#0b0614"/></radialGradient>
<radialGradient id="skin" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#ffb08a"/><stop offset=".55" stop-color="#ff6f5a"/><stop offset="1" stop-color="#d9364a"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".4" stop-color="#ffc93c"/><stop offset=".8" stop-color="#e08a00"/><stop offset="1" stop-color="#9a5200"/></linearGradient>
<linearGradient id="wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8743a"/><stop offset=".5" stop-color="#e3a660"/><stop offset="1" stop-color="#8a4f22"/></linearGradient>
<radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd36b" stop-opacity=".75"/><stop offset=".6" stop-color="#ff8fb3" stop-opacity=".18"/><stop offset="1" stop-color="#ff8fb3" stop-opacity="0"/></radialGradient>
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
    L = '#2a1020'
    o.append(f'<g transform="translate(512 512) scale({scale}) translate(-512 -512)">')
    o.append('<circle cx="860" cy="260" r="240" fill="url(#glow)"/>')
    # 반짝이(금 나와라 뚝딱)
    for x, y, r in [(870, 140, 34), (640, 120, 22), (920, 330, 20), (130, 260, 18), (170, 720, 14)]:
        o.append(f'<path d="M{x},{y - r} Q{x + r * .18},{y - r * .18} {x + r},{y} Q{x + r * .18},{y + r * .18} {x},{y + r} Q{x - r * .18},{y + r * .18} {x - r},{y} Q{x - r * .18},{y - r * .18} {x},{y - r}Z" fill="#ffe27a"/>')
    # 엽전
    for x, y, r in [(190, 470, 40), (150, 560, 30)]:
        o.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="url(#gold)" stroke="{L}" stroke-width="7"/><rect x="{x - r * .3:.0f}" y="{y - r * .3:.0f}" width="{r * .6:.0f}" height="{r * .6:.0f}" fill="#7a3d00" stroke="{L}" stroke-width="4"/>')
    # 몸통
    o.append(f'<path d="M300,960 Q300,760 512,740 Q724,760 724,960 Z" fill="#3f7be0" stroke="{L}" stroke-width="10"/>')
    o.append(f'<path d="M330,820 L694,820 L700,860 L324,860 Z" fill="#ffd36b" stroke="{L}" stroke-width="7"/>')
    for x in range(352, 690, 56):
        o.append(f'<path d="M{x},822 l18,0 l-9,36 z" fill="#2a2a2a" opacity=".55"/>')
    # 뿔 두 개
    for d in [f'M380,250 Q350,150 395,90 Q425,170 452,232 Z', f'M644,250 Q674,150 629,90 Q599,170 572,232 Z']:
        o.append(f'<path d="{d}" fill="url(#gold)" stroke="{L}" stroke-width="10" stroke-linejoin="round"/>')
    o.append(f'<path d="M392,120 Q410,170 430,215" fill="none" stroke="#fff4c2" stroke-width="8" stroke-linecap="round" opacity=".8"/>')
    # 귀
    for cx in (262, 762):
        o.append(f'<ellipse cx="{cx}" cy="490" rx="52" ry="66" fill="url(#skin)" stroke="{L}" stroke-width="10"/>')
    # 얼굴
    o.append(f'<ellipse cx="512" cy="500" rx="262" ry="250" fill="url(#skin)" stroke="{L}" stroke-width="11"/>')
    # 곱슬머리
    hair = 'M300,380 Q290,250 380,240 Q400,180 470,200 Q512,150 556,200 Q624,180 644,240 Q734,250 724,380 Q690,320 640,330 Q610,290 560,312 Q512,270 464,312 Q414,290 384,330 Q334,320 300,380 Z'
    o.append(f'<path d="{hair}" fill="#3a1638" stroke="{L}" stroke-width="10" stroke-linejoin="round"/>')
    for x, y in [(400, 280), (512, 240), (622, 280)]:
        o.append(f'<path d="M{x - 26},{y + 10} q26,-34 52,0" fill="none" stroke="#7a3b74" stroke-width="9" stroke-linecap="round"/>')
    # 눈썹
    o.append(f'<path d="M370,392 Q412,362 456,384" fill="none" stroke="{L}" stroke-width="16" stroke-linecap="round"/>')
    o.append(f'<path d="M568,384 Q612,362 654,392" fill="none" stroke="{L}" stroke-width="16" stroke-linecap="round"/>')
    # 눈
    for cx in (414, 610):
        o.append(f'<ellipse cx="{cx}" cy="470" rx="54" ry="60" fill="#fff" stroke="{L}" stroke-width="9"/>')
        o.append(f'<circle cx="{cx + 6}" cy="478" r="32" fill="{L}"/>')
        o.append(f'<circle cx="{cx + 18}" cy="462" r="12" fill="#fff"/><circle cx="{cx - 4}" cy="494" r="6" fill="#fff"/>')
    # 볼터치
    for cx in (350, 674):
        o.append(f'<ellipse cx="{cx}" cy="566" rx="44" ry="26" fill="#ff3d6e" opacity=".45"/>')
    # 코
    o.append(f'<path d="M490,530 Q512,560 534,530" fill="none" stroke="{L}" stroke-width="9" stroke-linecap="round"/>')
    # 입 (활짝 웃음 + 송곳니)
    o.append(f'<path d="M398,590 Q512,700 626,590 Q512,640 398,590 Z" fill="#7a1530" stroke="{L}" stroke-width="10" stroke-linejoin="round"/>')
    o.append('<path d="M450,640 Q512,676 574,640 Q512,660 450,640 Z" fill="#ff7a9a"/>')
    o.append(f'<path d="M430,606 L452,606 L441,640 Z" fill="#fff" stroke="{L}" stroke-width="5" stroke-linejoin="round"/>')
    o.append(f'<path d="M572,606 L594,606 L583,640 Z" fill="#fff" stroke="{L}" stroke-width="5" stroke-linejoin="round"/>')
    # 방망이 (오른손에 쥐고 위로) — 얼굴 앞에 그려요
    o.append(f'<g transform="rotate(24 760 660)"><rect x="738" y="440" width="44" height="250" rx="20" fill="url(#wood)" stroke="{L}" stroke-width="8"/>'
             f'<path d="M700,250 Q760,170 820,250 L816,450 Q760,490 704,450 Z" fill="url(#gold)" stroke="{L}" stroke-width="9" stroke-linejoin="round"/>')
    for x, y in [(730, 300), (790, 300), (760, 352), (730, 404), (790, 404)]:
        o.append(f'<circle cx="{x}" cy="{y}" r="15" fill="#fff4c2" stroke="{L}" stroke-width="5"/>')
    o.append('</g>')
    o.append(f'<path d="M660,800 Q735,760 760,668" fill="none" stroke="{L}" stroke-width="64" stroke-linecap="round"/>')
    o.append('<path d="M660,800 Q735,760 760,668" fill="none" stroke="#ff7a5f" stroke-width="46" stroke-linecap="round"/>')
    o.append(f'<circle cx="762" cy="660" r="42" fill="url(#skin)" stroke="{L}" stroke-width="9"/>')
    o.append(f'<path d="M738,650 q24,-10 48,0 M736,672 q26,-8 52,2" fill="none" stroke="{L}" stroke-width="6" stroke-linecap="round"/>')
    o.append('</g></svg>')
    return _ids('\n'.join(o), prefix)


def _ids(svg, prefix):
    for name in ["bg", "skin", "gold", "wood", "glow"]:
        svg = svg.replace(f'id="{name}"', f'id="{prefix}-{name}"').replace(f'url(#{name})', f'url(#{prefix}-{name})')
    return svg


if __name__ == "__main__":
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "dokkaebi.svg"), "w") as f:
        f.write(build(True))
    with open(os.path.join(here, "dokkaebi_fg.svg"), "w") as f:
        f.write(build(False))
