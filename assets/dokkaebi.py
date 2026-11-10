"""도깨비 사주 엠블럼 SVG 만들기 — 녹유 귀면와(綠釉鬼面瓦) 스타일

옛 기와의 도깨비 얼굴처럼: 위는 평평하고 아래는 아치로 뚫린 기와 판, 구슬 테두리(연주문),
녹청동 유약 빛깔에 돋을새김(빛 받은 입체감). 위로 휜 뿔, 찌푸린 눈썹, 부리부리한 눈,
둥근 주먹코, 이빨과 긴 송곳니, 옆으로 휘날리는 수염·갈기.
사용: python dokkaebi.py  → dokkaebi.svg (배경 포함), dokkaebi_fg.svg (배경 없음)
"""
import math

S = 1024


def _spiral(cx, cy, r, ang, turns=1.6, flip=1, shrink=0.8):
    pts = []
    n = 50
    for k in range(n + 1):
        t = k / n
        a = ang + flip * t * math.pi * 2 * turns
        rr = r * (1 - t * shrink)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)


def _mirror(d):
    """x → 1024 - x 로 좌우 뒤집은 path"""
    out = []
    for tok in d.replace(',', ' , ').split():
        out.append(tok)
    res, i, expect_x = [], 0, True
    nums = []
    # 간단 변환: 'M x,y Q x,y x,y ...' 형식만 써요
    parts = d.split(' ')
    for p in parts:
        if not p:
            continue
        cmd = ''
        while p and p[0].isalpha():
            cmd += p[0]
            p = p[1:]
        if p:
            x, y = p.split(',')
            res.append(f'{cmd}{1024 - float(x):.1f},{y}')
        else:
            res.append(cmd)
    return ' '.join(res)


def build(with_bg=True, scale=1.0, prefix="dk", bg_only=False, size=None):
    W_ = size or S
    D = '#141a10'       # 깊은 홈
    G = '#3e4b32'       # 유약 기본색
    G2 = '#56663f'      # 도드라진 면
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{W_}" height="{W_}">']
    o.append("""<defs>
<radialGradient id="bg" cx="50%" cy="46%" r="70%"><stop offset="0" stop-color="#3b1450"/><stop offset=".55" stop-color="#1c0b2e"/><stop offset="1" stop-color="#0b0614"/></radialGradient>
<linearGradient id="glaze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5f6f45"/><stop offset=".45" stop-color="#3a4630"/><stop offset="1" stop-color="#1f261a"/></linearGradient>
<radialGradient id="face" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#6a7a4c"/><stop offset=".6" stop-color="#435134"/><stop offset="1" stop-color="#28311f"/></radialGradient>
<radialGradient id="eye" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#fff2a0"/><stop offset=".45" stop-color="#ffb21e"/><stop offset="1" stop-color="#b3400a"/></radialGradient>
<radialGradient id="nose" cx="42%" cy="35%" r="65%"><stop offset="0" stop-color="#b9c28a"/><stop offset=".5" stop-color="#6f7f50"/><stop offset="1" stop-color="#36422a"/></radialGradient>
<filter id="relief" x="-10%" y="-10%" width="120%" height="120%">
 <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b"/>
 <feSpecularLighting in="b" surfaceScale="7" specularConstant="1.05" specularExponent="26" lighting-color="#fff0c0" result="s"><feDistantLight azimuth="230" elevation="42"/></feSpecularLighting>
 <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
 <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".5" k4="0" result="lit"/>
 <feOffset in="SourceAlpha" dx="5" dy="8" result="o"/><feGaussianBlur in="o" stdDeviation="5" result="ob"/>
 <feColorMatrix in="ob" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .65 0" result="sh"/>
 <feMerge><feMergeNode in="sh"/><feMergeNode in="lit"/></feMerge>
</filter>
<radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb21e" stop-opacity=".55"/><stop offset="1" stop-color="#ffb21e" stop-opacity="0"/></radialGradient>
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
    # ── 기와 판: 위 평평, 아래 아치 ──
    tile = ('M236,112 L788,112 Q836,112 844,160 L860,940 L660,940 '
            'A148,150 0 0 0 364,940 L164,940 L180,160 Q188,112 236,112 Z')
    o.append(f'<g filter="url(#relief)"><path d="{tile}" fill="url(#glaze)" stroke="{D}" stroke-width="8"/>')
    # 연주문(구슬) — 위·양옆
    beads = [(x, 146) for x in range(250, 790, 46)]
    beads += [(206 - (y - 160) * 0.016, y) for y in range(196, 930, 46)]
    beads += [(818 + (y - 160) * 0.016, y) for y in range(196, 930, 46)]
    for x, y in beads:
        o.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="13" fill="{G2}" stroke="{D}" stroke-width="3"/>')
    o.append('</g>')
    # 안쪽 판(움푹)
    field = ('M262,184 L762,184 L780,920 L668,920 A156,158 0 0 0 356,920 L244,920 Z')
    o.append(f'<path d="{field}" fill="#2a3320" stroke="{D}" stroke-width="6"/>')
    o.append('<circle cx="512" cy="470" r="250" fill="url(#glow)" opacity=".35"/>')

    R = []  # 돋을새김 요소들
    # 위쪽 불꽃 갈기
    for k in range(9):
        x = 300 + k * 53
        R.append(f'<path d="M{x},300 Q{x - 30},250 {x + 4},200 Q{x + 14},250 {x + 34},298 Z" fill="{G}" stroke="{D}" stroke-width="5" stroke-linejoin="round"/>')
    # 옆 갈기 소용돌이 (위에서 아래로)
    for sx in (1, -1):
        for j, (cx, cy, r) in enumerate([(300, 330, 40), (282, 420, 44), (290, 520, 42), (300, 620, 40), (318, 712, 36)]):
            X = cx if sx == 1 else 1024 - cx
            R.append(f'<circle cx="{X}" cy="{cy}" r="{r + 8}" fill="{G}" stroke="{D}" stroke-width="5"/>')
            R.append(f'<path d="{_spiral(X, cy, r, 0.4 * j, 1.4, sx)}" fill="none" stroke="{D}" stroke-width="7" stroke-linecap="round"/>')
    # 뿔 (위로 휘며 바깥으로)
    for sx in (1, -1):
        d = f'M{512 - sx * 70},300 Q{512 - sx * 120},236 {512 - sx * 120},170 Q{512 - sx * 160},220 {512 - sx * 150},300 Q{512 - sx * 120},322 {512 - sx * 70},300 Z'
        R.append(f'<path d="{d}" fill="{G2}" stroke="{D}" stroke-width="7" stroke-linejoin="round"/>')
        for t in (0.35, 0.6):
            yy = 300 - 120 * t
            R.append(f'<path d="M{512 - sx * (86 + 40 * t)},{yy + 14:.0f} q{-sx * 24},-8 {-sx * 40},4" fill="none" stroke="{D}" stroke-width="4"/>')
    # 얼굴 판
    R.append(f'<path d="M352,330 Q512,286 672,330 Q722,420 708,560 Q690,690 512,760 Q334,690 316,560 Q302,420 352,330 Z" fill="url(#face)" stroke="{D}" stroke-width="8" stroke-linejoin="round"/>')
    # 이마 겹주름(보주 모양)
    for k, (w, y) in enumerate([(70, 300), (52, 324), (34, 346)]):
        R.append(f'<path d="M{512 - w},{y + 22} Q512,{y - 18} {512 + w},{y + 22}" fill="none" stroke="{D}" stroke-width="7" stroke-linecap="round"/>')
    R.append(f'<ellipse cx="512" cy="372" rx="26" ry="18" fill="{G2}" stroke="{D}" stroke-width="5"/>')
    # 찌푸린 눈썹 (가운데로 내리꽂히는 V)
    for sx in (1, -1):
        d = (f'M{512 - sx * 24},{430} Q{512 - sx * 90},{372} {512 - sx * 176},{378} '
             f'Q{512 - sx * 214},{360} {512 - sx * 220},{326} Q{512 - sx * 196},{350} {512 - sx * 168},{352} '
             f'Q{512 - sx * 100},{348} {512 - sx * 24},{430} Z')
        R.append(f'<path d="{d}" fill="#6d7d4c" stroke="{D}" stroke-width="8" stroke-linejoin="round"/>')
        for t in (0.3, 0.55, 0.8):
            x0 = 512 - sx * (40 + 150 * t)
            R.append(f'<path d="M{x0:.0f},{400 - 50 * t:.0f} q{-sx * 18},-14 {-sx * 30},-6" fill="none" stroke="{D}" stroke-width="4" stroke-linecap="round"/>')
    o.append('<g filter="url(#relief)">' + ''.join(R) + '</g>')
    # 눈 (깊은 눈두덩 + 노려보는 금빛 눈)
    E = []
    for sx in (1, -1):
        cx = 512 - sx * 102
        E.append(f'<ellipse cx="{cx}" cy="458" rx="62" ry="48" fill="{D}"/>')
        E.append(f'<ellipse cx="{cx}" cy="462" rx="46" ry="36" fill="url(#eye)" stroke="#3a1a05" stroke-width="5"/>')
        E.append(f'<ellipse cx="{cx + sx * 6}" cy="464" rx="13" ry="20" fill="#150a02"/>')
        E.append(f'<circle cx="{cx + sx * 6 - 6}" cy="454" r="5" fill="#fff6d0"/>')
        # 무거운 윗눈꺼풀
        E.append(f'<path d="M{cx - sx * 64},{410} L{cx - sx * 64},{432} Q{cx},{426} {cx + sx * 64},{470} L{cx + sx * 64},{410} Z" fill="{G2}" stroke="{D}" stroke-width="5" stroke-linejoin="round"/>')
        # 아래 눈 주름
        E.append(f'<path d="M{cx - 50},500 Q{cx},526 {cx + 50},500" fill="none" stroke="{D}" stroke-width="6" stroke-linecap="round"/>')
    o.append('<g filter="url(#relief)">' + ''.join(E) + '</g>')
    F = []
    # 볼 주름 (코 옆에서 입가로)
    for sx in (1, -1):
        F.append(f'<path d="M{512 - sx * 70},520 Q{512 - sx * 150},560 {512 - sx * 160},650" fill="none" stroke="{D}" stroke-width="9" stroke-linecap="round"/>')
        F.append(f'<path d="{_spiral(512 - sx * 186, 560, 30, 3.4, 1.3, -sx)}" fill="none" stroke="{D}" stroke-width="7" stroke-linecap="round"/>')
    # 콧방울 + 주먹코
    for sx in (1, -1):
        F.append(f'<ellipse cx="{512 - sx * 52}" cy="560" rx="36" ry="30" fill="{G2}" stroke="{D}" stroke-width="6"/>')
        F.append(f'<ellipse cx="{512 - sx * 40}" cy="574" rx="14" ry="10" fill="{D}"/>')
    F.append(f'<path d="M490,440 Q512,430 534,440 L540,500 Q512,490 484,500 Z" fill="{G2}" stroke="{D}" stroke-width="5"/>')
    F.append(f'<circle cx="512" cy="530" r="46" fill="url(#nose)" stroke="{D}" stroke-width="7"/>')
    # 입: 넓게 찡그린 입, 이빨과 송곳니
    F.append(f'<path d="M354,620 Q430,598 512,612 Q594,598 670,620 Q660,708 600,730 Q512,752 424,730 Q364,708 354,620 Z" fill="#0d0805" stroke="{D}" stroke-width="8" stroke-linejoin="round"/>')
    F.append(f'<path d="M346,612 Q430,584 512,600 Q594,584 678,612" fill="none" stroke="{G2}" stroke-width="16" stroke-linecap="round"/>')
    for k in range(8):
        x = 420 + k * 23.5
        F.append(f'<rect x="{x:.1f}" y="612" width="22" height="30" rx="4" fill="#e8e2c4" stroke="{D}" stroke-width="3"/>')
    for k in range(8):
        x = 420 + k * 23.5
        F.append(f'<rect x="{x:.1f}" y="690" width="22" height="26" rx="4" fill="#d9d2b0" stroke="{D}" stroke-width="3"/>')
    for sx in (1, -1):
        x = 512 - sx * 112
        F.append(f'<path d="M{x - 16},612 Q{x},622 {x + 16},612 L{x + sx * 4},718 Z" fill="#f2ecd0" stroke="{D}" stroke-width="4" stroke-linejoin="round"/>')
        x2 = 512 - sx * 136
        F.append(f'<path d="M{x2 - 13},718 L{x2 + 13},718 L{x2 - sx * 8},656 Z" fill="#e8e2c4" stroke="{D}" stroke-width="4" stroke-linejoin="round"/>')
    # 휘날리는 수염 (코밑에서 양옆 아래로)
    for sx in (1, -1):
        d = (f'M{512 - sx * 60},600 Q{512 - sx * 190},588 {512 - sx * 236},680 '
             f'Q{512 - sx * 256},760 {512 - sx * 200},800 Q{512 - sx * 230},740 {512 - sx * 206},700 '
             f'Q{512 - sx * 170},630 {512 - sx * 60},612 Z')
        F.append(f'<path d="{d}" fill="{G2}" stroke="{D}" stroke-width="6" stroke-linejoin="round"/>')
        F.append(f'<path d="{_spiral(512 - sx * 214, 800, 24, 0, 1.5, sx)}" fill="none" stroke="{D}" stroke-width="6" stroke-linecap="round"/>')
    # 턱 아래 불꽃 수염
    for k, x in enumerate([440, 476, 512, 548, 584]):
        h = 70 if k == 2 else 54
        F.append(f'<path d="M{x - 16},740 Q{x},{740 + h} {x + 4},{740 + h + 18} Q{x + 18},{740 + h * .6:.0f} {x + 16},740 Z" fill="{G}" stroke="{D}" stroke-width="4" stroke-linejoin="round"/>')
    o.append('<g filter="url(#relief)">' + ''.join(F) + '</g>')
    o.append('</g></svg>')
    return _ids('\n'.join(o), prefix)


def _ids(svg, prefix):
    for name in ["bg", "glaze", "face", "eye", "nose", "relief", "glow"]:
        svg = svg.replace(f'id="{name}"', f'id="{prefix}-{name}"').replace(f'url(#{name})', f'url(#{prefix}-{name})')
    return svg


if __name__ == "__main__":
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "dokkaebi.svg"), "w") as f:
        f.write(build(True))
    with open(os.path.join(here, "dokkaebi_fg.svg"), "w") as f:
        f.write(build(False))
