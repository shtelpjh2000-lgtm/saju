"""천기 용 엠블럼 SVG 만들기

여의주를 감싸고 도는 금빛 용. 몸통·비늘·등지느러미·머리를 계산으로 그려요.
사용: python dragon.py  → dragon.svg (배경 포함), dragon_fg.svg (배경 없음)
"""
import math

S = 1024
C = (512.0, 560.0)  # 몸 중심(참고용)
P = (300.0, 200.0)  # 여의주 중심 (위쪽, 용이 올려다봐요)


def body_point(t):
    """t: 0(꼬리) → 1(목). 여의주를 1바퀴 남짓 감는 나선"""
    # 아래 구름에서 위로 솟구치는 S자
    y = 940 - 560 * t
    amp = 200 * (1 - 0.35 * t)
    x = 540 + amp * math.sin(t * math.pi * 2.7 + 0.2) + 40 * t
    return x, y


def width(t):
    return 12 + 88 * math.sin(min(1.0, t * 1.1) * math.pi * 0.5) ** 0.75


def unit(dx, dy):
    L = math.hypot(dx, dy) or 1
    return dx / L, dy / L


def build(with_bg=True, scale=1.0, prefix="dg", bg_only=False, size=None):
    N = 220
    pts = [body_point(i / N) for i in range(N + 1)]
    left, right, normals = [], [], []
    for i, (x, y) in enumerate(pts):
        x0, y0 = pts[max(0, i - 1)]
        x1, y1 = pts[min(N, i + 1)]
        tx, ty = unit(x1 - x0, y1 - y0)
        nx, ny = -ty, tx
        normals.append((nx, ny, tx, ty))
        w = width(i / N) / 2
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    # 바깥쪽(여의주에서 먼 쪽)을 찾아요
    mx, my = pts[N // 2]
    lx, ly = left[N // 2]
    outer_is_left = False
    outer, inner = (left, right) if outer_is_left else (right, left)
    sgn = 1 if outer_is_left else -1

    def poly(points):
        return " ".join(f"{x:.1f},{y:.1f}" for x, y in points)

    out = []
    W_ = size or S
    out.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{W_}" height="{W_}">')
    out.append("""<defs>
<radialGradient id="bg" cx="50%" cy="46%" r="70%"><stop offset="0" stop-color="#3b1450"/><stop offset=".55" stop-color="#1c0b2e"/><stop offset="1" stop-color="#0b0614"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".35" stop-color="#ffc93c"/><stop offset=".7" stop-color="#e08a00"/><stop offset="1" stop-color="#8f4a00"/></linearGradient>
<linearGradient id="belly" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff8d6"/><stop offset="1" stop-color="#ffd27a"/></linearGradient>
<radialGradient id="pearl" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#fff2a6"/><stop offset=".6" stop-color="#ff8a2a"/><stop offset="1" stop-color="#d81e3a"/></radialGradient>
<radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".85"/><stop offset=".6" stop-color="#ff3d5a" stop-opacity=".25"/><stop offset="1" stop-color="#ff3d5a" stop-opacity="0"/></radialGradient>
<linearGradient id="fin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5470"/><stop offset="1" stop-color="#a5102e"/></linearGradient>
</defs>""")
    if with_bg:
        out.append(f'<rect width="{S}" height="{S}" fill="url(#bg)"/>')
        # 구궁(3x3) 무늬를 은은하게
        g0, gs = 512 - 330, 220
        for i in range(4):
            out.append(f'<line x1="{g0}" y1="{g0 + 36 + i * gs}" x2="{g0 + 3 * gs}" y2="{g0 + 36 + i * gs}" stroke="#ffd36b" stroke-opacity=".07" stroke-width="3"/>')
            out.append(f'<line x1="{g0 + i * gs}" y1="{g0 + 36}" x2="{g0 + i * gs}" y2="{g0 + 36 + 3 * gs}" stroke="#ffd36b" stroke-opacity=".07" stroke-width="3"/>')
        out.append(f'<circle cx="512" cy="512" r="470" fill="none" stroke="#ffd36b" stroke-opacity=".18" stroke-width="6"/>')
    if bg_only:
        out.append("</svg>")
        return _ids("\n".join(out), prefix)
    dx, dy = 40, 10
    out.append(f'<g transform="translate(512 512) scale({scale}) translate({-512 + dx} {-512 + dy})">')
    # 위에서 내려오는 빛줄기
    rays = []
    for k_ in range(9):
        a_ = math.radians(-90 + (k_ - 4) * 13)
        x2, y2 = P[0] + 900 * math.cos(a_ + math.pi), P[1] + 900 * math.sin(a_ + math.pi)
        rays.append(f'<polygon points="{P[0]:.0f},{P[1]:.0f} {x2 - 40:.0f},{y2:.0f} {x2 + 40:.0f},{y2:.0f}" fill="#ffd36b" opacity=".05"/>')
    clouds = []
    for cx_, cy_, rr_ in [(230, 890, 80), (360, 915, 95), (520, 890, 105), (680, 920, 95), (810, 890, 80), (130, 930, 60), (930, 930, 60)]:
        clouds.append(f'<circle cx="{cx_}" cy="{cy_}" r="{rr_}" fill="#efe6ff" stroke="#2a1840" stroke-width="7"/>')
    for cx_, cy_, rr_ in [(230, 890, 80), (360, 915, 95), (520, 890, 105), (680, 920, 95), (810, 890, 80), (130, 930, 60), (930, 930, 60)]:
        clouds.append(f'<circle cx="{cx_}" cy="{cy_}" r="{rr_ - 4}" fill="#efe6ff"/>')
        clouds.append(f'<path d="M{cx_ - rr_ * .5:.0f},{cy_ - rr_ * .1:.0f} q{rr_ * .5:.0f},{-rr_ * .45:.0f} {rr_:.0f},0" fill="none" stroke="#b9a8ff" stroke-width="6" stroke-linecap="round"/>')
    # 꼬리 끝 불꽃
    tx0, ty0 = pts[0]
    _, _, ttx, tty = normals[0]
    tf = []
    for k_, (a_, L_) in enumerate([(-50, 90), (-20, 120), (10, 100), (40, 80)]):
        ca, sa = math.cos(math.radians(a_)), math.sin(math.radians(a_))
        dx_, dy_ = -(ttx * ca - tty * sa), -(ttx * sa + tty * ca)
        tf.append(f'<path d="M{tx0:.1f},{ty0:.1f} Q{tx0 + dx_ * L_ * .5 - dy_ * 18:.1f},{ty0 + dy_ * L_ * .5 + dx_ * 18:.1f} {tx0 + dx_ * L_:.1f},{ty0 + dy_ * L_:.1f} Q{tx0 + dx_ * L_ * .45 + dy_ * 10:.1f},{ty0 + dy_ * L_ * .45 - dx_ * 10:.1f} {tx0:.1f},{ty0:.1f}Z" fill="url(#fin)" stroke="#3a0a14" stroke-width="4" stroke-linejoin="round"/>')
    tail_fl = tf
    # 여의주 빛
    out.append(f'<circle cx="{P[0]}" cy="{P[1]}" r="210" fill="url(#glow)"/>')
    # 등지느러미(바깥쪽 불꽃 가시)
    fins = []
    for k in range(10, N - 6, 9):
        t = k / N
        x, y = pts[k]
        nx, ny, tx, ty = normals[k]
        w = width(t) / 2
        h = 22 + 34 * math.sin(t * math.pi) + 10
        bx, by = x + sgn * nx * w * 0.85, y + sgn * ny * w * 0.85
        p1 = (bx - tx * 16, by - ty * 16)
        p2 = (bx + tx * 14, by + ty * 14)
        tip = (bx + sgn * nx * h - tx * 18, by + sgn * ny * h - ty * 18)
        fins.append(f'<polygon points="{poly([p1, tip, p2])}" fill="url(#fin)" stroke="#3a0a14" stroke-width="4" stroke-linejoin="round"/>')
    out += rays
    out += fins
    out += tail_fl
    # 몸통
    body = left + right[::-1]
    out.append(f'<polygon points="{poly(body)}" fill="url(#gold)" stroke="#3a1a00" stroke-width="7" stroke-linejoin="round"/>')
    # 배 비늘(안쪽 띠)
    belly = []
    for i in range(N + 1):
        t = i / N
        x, y = pts[i]
        nx, ny, _, _ = normals[i]
        w = width(t) / 2
        belly.append((x - sgn * nx * w * 0.15, y - sgn * ny * w * 0.15))
    belly_band = belly + inner[::-1]
    out.append(f'<polygon points="{poly(belly_band)}" fill="url(#belly)" stroke="none" opacity=".9"/>')
    for k in range(6, N - 2, 6):
        t = k / N
        x, y = pts[k]
        nx, ny, tx, ty = normals[k]
        w = width(t) / 2
        a = (x - sgn * nx * w * 0.15, y - sgn * ny * w * 0.15)
        b = (x - sgn * nx * w * 0.95, y - sgn * ny * w * 0.95)
        out.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#c07a10" stroke-width="3" stroke-linecap="round" opacity=".8"/>')
    # 등 비늘(작은 호)
    for k in range(8, N - 4, 5):
        t = k / N
        x, y = pts[k]
        nx, ny, tx, ty = normals[k]
        w = width(t) / 2
        for f in (0.35, 0.7):
            cx, cy = x + sgn * nx * w * f, y + sgn * ny * w * f
            r = max(4, w * 0.22)
            out.append(f'<path d="M{cx - tx * r:.1f},{cy - ty * r:.1f} Q{cx + sgn * nx * r * 0.9:.1f},{cy + sgn * ny * r * 0.9:.1f} {cx + tx * r:.1f},{cy + ty * r:.1f}" fill="none" stroke="#8f4a00" stroke-width="3" opacity=".55"/>')
    # 몸 외곽선 한 번 더
    out.append(f'<polygon points="{poly(body)}" fill="none" stroke="#2a1200" stroke-width="7" stroke-linejoin="round"/>')
    # 여의주
    out.append(f'<circle cx="{P[0]}" cy="{P[1]}" r="78" fill="url(#pearl)" stroke="#5a0614" stroke-width="7"/>')
    # 여의주 안 구궁 점 3x3
    for i in range(3):
        for j in range(3):
            out.append(f'<circle cx="{P[0] - 30 + j * 30}" cy="{P[1] - 22 + i * 30}" r="{9 if (i, j) == (1, 1) else 6}" fill="#7a0a20" opacity="{.75 if (i, j) == (1, 1) else .45}"/>')
    out.append(f'<ellipse cx="{P[0] - 34}" cy="{P[1] - 44}" rx="22" ry="12" fill="#fff" opacity=".7" transform="rotate(-30 {P[0] - 34} {P[1] - 44})"/>')

    out += clouds
    # 머리: 목 끝에서 여의주를 내려다보게
    hx, hy = pts[N]
    _, _, tx, ty = normals[N]
    # 머리 방향: 목 방향과 여의주 방향 사이
    px_, py_ = unit(P[0] - hx, P[1] - hy)
    fx, fy = unit(tx * 0.3 + px_ * 0.7, ty * 0.3 + py_ * 0.7)
    ang = math.degrees(math.atan2(fy, fx))
    # 머리 모양(옆모습, +x가 주둥이 쪽). 머리 위쪽이 여의주 반대편이 되게 뒤집어요
    flip = 1
    cross = tx * py_ - ty * px_
    if cross < 0:
        flip = -1
    sc = 1.75
    head = []
    head.append(f'<g transform="translate({hx:.1f},{hy:.1f}) rotate({ang:.1f}) scale({sc},{sc * flip})">')
    # 뿔 두 개
    head.append('<path d="M10,-38 C-20,-70 -70,-80 -110,-70 C-74,-60 -40,-46 -14,-26Z" fill="#fff0c2" stroke="#2a1200" stroke-width="4" stroke-linejoin="round"/>')
    head.append('<path d="M30,-36 C10,-80 -30,-104 -70,-108 C-38,-90 -12,-66 6,-30Z" fill="#ffe08a" stroke="#2a1200" stroke-width="4" stroke-linejoin="round"/>')
    # 갈기 불꽃
    head.append('<path d="M-8,-30 L-58,-40 L-30,-14 L-78,-6 L-34,10 L-70,30 L-20,28 L-40,52 L4,36Z" fill="url(#fin)" stroke="#3a0a14" stroke-width="4" stroke-linejoin="round"/>')
    # 머리
    head.append('<path d="M-6,-34 C14,-46 44,-48 66,-36 C80,-30 96,-30 112,-24 C124,-20 130,-12 128,-4 L96,0 L122,10 C116,20 100,26 80,26 C56,30 30,34 2,34 C-14,20 -16,-18 -6,-34Z" fill="url(#gold)" stroke="#2a1200" stroke-width="5" stroke-linejoin="round"/>')
    # 입 안과 이빨
    head.append('<path d="M128,-4 L96,0 L122,10Z" fill="#7a0a20"/>')
    head.append('<path d="M104,-2 l4,7 l4,-7 M114,-3 l3,6 l3,-6" stroke="#fff" stroke-width="2.5" fill="#fff"/>')
    # 코와 콧수염
    head.append('<circle cx="116" cy="-18" r="4" fill="#2a1200"/>')
    head.append('<path d="M118,-14 C150,-30 170,-6 196,-34" fill="none" stroke="#ffd36b" stroke-width="5" stroke-linecap="round"/>')
    head.append('<path d="M110,18 C140,40 160,30 190,52" fill="none" stroke="#ffd36b" stroke-width="5" stroke-linecap="round"/>')
    # 눈썹과 눈
    head.append('<path d="M40,-40 C56,-50 74,-44 84,-32" fill="none" stroke="#2a1200" stroke-width="6" stroke-linecap="round"/>')
    head.append('<ellipse cx="64" cy="-24" rx="12" ry="8" fill="#ff2a3c" stroke="#2a1200" stroke-width="4"/>')
    head.append('<ellipse cx="66" cy="-24" rx="3" ry="6" fill="#1a0006"/>')
    head.append('<circle cx="61" cy="-27" r="2.4" fill="#fff"/>')
    # 볼 비늘
    head.append('<path d="M20,4 q10,-8 20,0 M34,14 q10,-8 20,0 M48,2 q10,-8 20,0" fill="none" stroke="#8f4a00" stroke-width="3" opacity=".7"/>')
    head.append('</g>')
    out += head
    out.append("</g>")
    out.append("</svg>")
    return _ids("\n".join(out), prefix)


def _ids(svg, prefix):
    for name in ["bg", "gold", "belly", "pearl", "glow", "fin"]:
        svg = svg.replace(f'id="{name}"', f'id="{prefix}-{name}"').replace(f'url(#{name})', f'url(#{prefix}-{name})')
    return svg


if __name__ == "__main__":
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "dragon.svg"), "w") as f:
        f.write(build(True))
    with open(os.path.join(here, "dragon_fg.svg"), "w") as f:
        f.write(build(False))
    print("ok")
