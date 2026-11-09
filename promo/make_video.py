"""오늘의 띠별 운세 세로 영상(1080x1920) 만들기

사용: python make_video.py [YYYY-MM-DD] [출력폴더]
결과: shorts.mp4, thumb.jpg, title.txt, caption.txt
"""
import datetime
import glob
import json
import math
import os
import subprocess
import sys
import wave
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import fortune

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
INTRO, PAGE, OUTRO = 3.2, 8.0, 5.5
TOTAL = INTRO + PAGE * 3 + OUTRO

INK = (58, 46, 77)
MUTE = (140, 126, 165)
PINK = (255, 120, 165)
LAV = (155, 123, 255)
WHITE = (255, 255, 255)

CFG = {}
cfg_path = os.path.join(HERE, "config.json")
if os.path.exists(cfg_path):
    with open(cfg_path, encoding="utf-8") as f:
        CFG = json.load(f)
APP_NAME = CFG.get("app_name", "천기")


# ── 글꼴 ──
def _find(patterns):
    for p in patterns:
        hits = sorted(glob.glob(p))
        if hits:
            return hits[0]
    raise FileNotFoundError(patterns)


F_JUA = os.path.join(HERE, "fonts", "Jua-Regular.ttf")
F_GOWUN = os.path.join(HERE, "fonts", "GowunDodum-Regular.ttf")
F_HANJA = _find(["/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc",
                 "/usr/share/fonts/**/NotoSerifCJK-Bold.ttc",
                 "/usr/share/fonts/**/NotoSansCJK-Bold.ttc"])
F_EMOJI = _find(["/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",
                 "/usr/share/fonts/**/NotoColorEmoji.ttf"])


@lru_cache(None)
def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)


def jua(s):
    return font(F_JUA, s)


def gowun(s):
    return font(F_GOWUN, s)


def hanja(s):
    return font(F_HANJA, s, 1)


@lru_cache(None)
def emoji_img(ch, size):
    f = font(F_EMOJI, 109)
    im = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((80, 80), ch, font=f, embedded_color=True, anchor="mm")
    bb = im.getbbox() or (0, 0, 160, 160)
    im = im.crop(bb)
    r = size / max(im.size)
    return im.resize((max(1, round(im.width * r)), max(1, round(im.height * r))), Image.LANCZOS)


# ── 그리기 도구 ──
def text_w(f, s):
    return f.getlength(s)


def wrap(s, f, maxw):
    lines, cur = [], ""
    for word in s.split(" "):
        t = (cur + " " + word).strip()
        if text_w(f, t) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def star_poly(cx, cy, r):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return pts


def draw_stars(d, x, y, n, r=17, gap=40):
    for i in range(5):
        cx = x + r + i * gap
        d.polygon(star_poly(cx, y, r), fill=(236, 226, 246))
        if n >= i + 1:
            d.polygon(star_poly(cx, y, r), fill=(255, 196, 61))
        elif n >= i + 0.5:
            half = Image.new("L", (int(r * 2 + 4), int(r * 2 + 4)), 0)
            ImageDraw.Draw(half).polygon(star_poly(r + 2, r + 2, r), fill=255)
            ImageDraw.Draw(half).rectangle([r + 2, 0, r * 2 + 4, r * 2 + 4], fill=0)
            d.bitmap((cx - r - 2, y - r - 2), half, fill=(255, 196, 61))


def gradient_bg():
    y = np.linspace(0, 1, H)[:, None]
    x = np.linspace(0, 1, W)[None, :]
    c1 = np.array([255, 241, 246])
    c2 = np.array([238, 230, 255])
    c3 = np.array([255, 247, 232])
    t = np.clip(y * 0.85 + x * 0.15, 0, 1)[..., None]
    img = c1 * (1 - t) + c2 * t
    blob = np.exp(-(((x - 0.85) ** 2) / 0.05 + ((y - 0.15) ** 2) / 0.02))[..., None]
    img = img * (1 - blob * 0.6) + c3 * blob * 0.6
    blob2 = np.exp(-(((x - 0.1) ** 2) / 0.06 + ((y - 0.8) ** 2) / 0.03))[..., None]
    img = img * (1 - blob2 * 0.5) + np.array([255, 222, 236]) * blob2 * 0.5
    return Image.fromarray(img.astype(np.uint8), "RGB")


def mascot(size):
    """앱 로고와 같은 별 친구 캐릭터"""
    S = 4
    s = size * S
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    k = s / 120
    # 몸통 그라데이션 원
    body = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    g = np.zeros((s, s, 4), np.uint8)
    yy, xx = np.mgrid[0:s, 0:s] / s
    t = np.clip((xx + yy) / 2, 0, 1)[..., None]
    col = np.array([255, 194, 214]) * (1 - t) + np.array([201, 187, 255]) * t
    g[..., :3] = col.astype(np.uint8)
    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).ellipse([(60 - 44) * k, (66 - 44) * k, (60 + 44) * k, (66 + 44) * k], fill=255)
    g[..., 3] = np.array(mask)
    body = Image.fromarray(g, "RGBA")
    im.alpha_composite(body)
    d = ImageDraw.Draw(im)
    star = [(60 + 13 * math.cos(-math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else .45),
             40 + 13 * math.sin(-math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else .45)) for i in range(10)]
    d.polygon([(x * k, y * k) for x, y in star], fill=(255, 226, 122))
    for ex in (46, 74):
        d.ellipse([(ex - 4.5) * k, (68 - 6) * k, (ex + 4.5) * k, (68 + 6) * k], fill=INK)
        d.ellipse([(ex + 1.5 - 1.6) * k, (66 - 1.6) * k, (ex + 1.5 + 1.6) * k, (66 + 1.6) * k], fill=WHITE)
    for bx in (36, 84):
        d.ellipse([(bx - 7) * k, (80 - 4) * k, (bx + 7) * k, (80 + 4) * k], fill=(255, 143, 179, 150))
    d.arc([53 * k, 74 * k, 67 * k, 86 * k], 20, 160, fill=INK, width=int(3 * k))
    return im.resize((size, size), Image.LANCZOS)


def rounded_card(w, h, r=44, fill=(255, 255, 255, 236), shadow=True):
    pad = 30
    im = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    if shadow:
        sh = Image.new("RGBA", im.size, (186, 140, 190, 0))
        ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 10, pad + w, pad + h + 10], r, fill=(186, 140, 190, 70))
        sh = sh.filter(ImageFilter.GaussianBlur(14))
        im.alpha_composite(sh)
    ImageDraw.Draw(im).rounded_rectangle([pad, pad, pad + w, pad + h], r, fill=fill)
    return im, pad


def chip(text, f, fg, bg, padx=18, pady=8):
    tw = int(text_w(f, text.split(" ", 1)[-1]))
    em = text.split(" ", 1)[0] if " " in text else ""
    ew = f.size + 6 if em else 0
    w, h = tw + ew + padx * 2, f.size + pady * 2 + 4
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], h // 2, fill=bg)
    x = padx
    if em:
        e = emoji_img(em, f.size)
        im.alpha_composite(e, (x, (h - e.height) // 2))
        x += ew
    d.text((x, h // 2), text.split(" ", 1)[-1], font=f, fill=fg, anchor="lm")
    return im


# ── 장면 만들기 ──
CARD_W, CARD_H, CARD_GAP, CARD_X, CARD_Y0 = 900, 262, 22, 50, 404


def make_card(it):
    im, pad = rounded_card(CARD_W, CARD_H)
    d = ImageDraw.Draw(im)
    # 왼쪽 동물
    circ = 180
    cx, cy = pad + 30 + circ // 2, pad + CARD_H // 2
    d.ellipse([cx - circ // 2, cy - circ // 2, cx + circ // 2, cy + circ // 2], fill=(255, 238, 245))
    e = emoji_img(it["emoji"], 128)
    im.alpha_composite(e, (cx - e.width // 2, cy - e.height // 2))
    hx = cx + circ // 2 - 46
    d.ellipse([hx, cy + 34, hx + 56, cy + 90], fill=WHITE)
    d.text((hx + 28, cy + 63), it["branch"], font=hanja(36), fill=PINK, anchor="mm")
    # 오른쪽 글자
    x0 = pad + 30 + circ + 34
    y = pad + 30
    d.text((x0, y), it["name"], font=jua(58), fill=INK, anchor="lt")
    nw = text_w(jua(58), it["name"])
    c = chip(it["tag"], jua(28), INK, (255, 243, 204))
    im.alpha_composite(c, (int(x0 + nw + 16), y + 6))
    y += 74
    draw_stars(d, x0, y + 16, it["stars"])
    yrs = "·".join(str(v % 100).zfill(2) for v in it["years"]) + "년생"
    d.text((x0 + 214, y + 16), yrs, font=gowun(28), fill=MUTE, anchor="lm")
    y += 46
    lines = wrap(it["msg"], jua(40), CARD_W - (x0 - pad) - 30)[:2]
    for ln in lines:
        d.text((x0, y), ln, font=jua(40), fill=(92, 72, 120), anchor="lt")
        y += 50
    return im, pad


def header(d, data, page=None):
    date = data["date"]
    title = f'{date.month}월 {date.day}일 ({data["weekday"]})'
    d.text((W // 2, 214), title, font=jua(56), fill=INK, anchor="mm")
    gz = data["ganzhi"]
    sub = f'{data["ganzhi_ko"]}일 띠별 오늘의 운세'
    sw = text_w(hanja(40), gz) + 16 + text_w(jua(40), sub)
    x = W // 2 - sw / 2
    d.text((x, 290), gz, font=hanja(40), fill=PINK, anchor="lm")
    d.text((x + text_w(hanja(40), gz) + 16, 290), sub, font=jua(40), fill=MUTE, anchor="lm")
    if page is not None:
        for i in range(3):
            cx = W // 2 - 40 + i * 40
            r = 9 if i == page else 7
            d.ellipse([cx - r, 345 - r, cx + r, 345 + r], fill=PINK if i == page else (230, 214, 236))


def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def ease_in(t):
    t = max(0.0, min(1.0, t))
    return t ** 3


SPARKS = [(np.random.RandomState(i).rand(4)) for i in range(26)]


def sparkles(d, t):
    for i, (a, b, c, e) in enumerate(SPARKS):
        x = (a * W + math.sin(t * 0.6 + i) * 30) % W
        y = (b * H - t * (20 + c * 40)) % H
        r = 3 + c * 7
        alpha = 0.45 + 0.55 * (0.5 + 0.5 * math.sin(t * 2.4 + i * 1.7))
        col = [(255, 214, 107), (127, 220, 192), (255, 143, 179), (185, 168, 255)][i % 4]
        col = tuple(int(255 - (255 - v) * alpha) for v in col)
        if i % 3 == 0:
            d.polygon(star_poly(x, y, r * 1.8), fill=col)
        else:
            d.ellipse([x - r, y - r, x + r, y + r], fill=col)


def paste(base, im, x, y, alpha=1.0):
    if alpha <= 0:
        return
    if alpha < 1:
        im = im.copy()
        a = im.getchannel("A").point(lambda v: int(v * alpha))
        im.putalpha(a)
    base.alpha_composite(im, (int(x), int(y)))


class Video:
    def __init__(self, data):
        self.data = data
        self.bg = gradient_bg().convert("RGBA")
        self.cards = [make_card(it) for it in data["items"]]
        badge = os.path.join(HERE, "dragon_badge.png")
        if os.path.exists(badge):
            bimg = Image.open(badge).convert("RGBA")
            self.mascot = bimg.resize((300, 300), Image.LANCZOS)
            self.mascot_s = bimg.resize((150, 150), Image.LANCZOS)
        else:
            self.mascot = mascot(300)
            self.mascot_s = mascot(150)
        best = data["best"]
        self.best_emoji = emoji_img(best["emoji"], 300)
        self.trophy = emoji_img("🏆", 90)
        self.eyes = emoji_img("👀", 64)
        self.sparkle = emoji_img("✨", 56)

    def frame(self, t):
        im = self.bg.copy()
        d = ImageDraw.Draw(im)
        sparkles(d, t)
        if t < INTRO:
            self.intro(im, t)
        elif t < INTRO + PAGE * 3:
            p = int((t - INTRO) // PAGE)
            self.page(im, p, t - INTRO - p * PAGE)
        else:
            self.outro(im, t - INTRO - PAGE * 3)
        return im.convert("RGB")

    def intro(self, im, t):
        d = ImageDraw.Draw(im)
        date = self.data["date"]
        bounce = math.sin(min(t, 1.2) / 1.2 * math.pi) * 40 * (1 - min(t, 1.2) / 1.2) + math.sin(t * 3) * 8
        s = ease_out(t / 0.6)
        m = self.mascot
        if s < 1:
            m = m.resize((max(1, int(300 * s)), max(1, int(300 * s))))
        paste(im, m, W // 2 - m.width // 2, 470 - m.height // 2 - bounce)
        a = ease_out((t - 0.05) / 0.4)
        d.text((W // 2, 790 + (1 - a) * 40), f'{date.month}월 {date.day}일 ({self.data["weekday"]})',
               font=jua(64), fill=tuple(int(255 - (255 - v) * a) for v in MUTE), anchor="mm")
        a2 = ease_out((t - 0.15) / 0.45)
        for i, ln in enumerate(["오늘의", "띠별 운세"]):
            col = INK if i == 0 else PINK
            d.text((W // 2, 930 + i * 160 + (1 - a2) * 60), ln, font=jua(150),
                   fill=tuple(int(255 - (255 - v) * a2) for v in col), anchor="mm")
        a3 = ease_out((t - 0.7) / 0.5)
        if a3 > 0:
            card, pad = rounded_card(720, 130, r=65, fill=(255, 255, 255, 240))
            paste(im, card, W // 2 - 360 - pad, 1300 - pad + (1 - a3) * 40, a3)
            d = ImageDraw.Draw(im)
            txt = "오늘 1등 띠는 누구?"
            tw = text_w(jua(58), txt)
            x = W // 2 - (tw + 74) / 2
            yy = 1365 + (1 - a3) * 40
            d.text((x, yy), txt, font=jua(58), fill=INK, anchor="lm")
            paste(im, self.eyes, x + tw + 10, yy - 32, a3)
        gz = self.data["ganzhi"] + "日"
        a4 = ease_out((t - 0.9) / 0.5)
        d = ImageDraw.Draw(im)
        d.text((W // 2, 1520), gz, font=hanja(54),
               fill=tuple(int(255 - (255 - v) * a4) for v in (205, 170, 215)), anchor="mm")

    def page(self, im, p, lt):
        d = ImageDraw.Draw(im)
        header(d, self.data, p)
        for k in range(4):
            idx = p * 4 + k
            card, pad = self.cards[idx]
            tin = ease_out((lt - k * 0.14) / 0.55)
            tout = ease_in((lt - (PAGE - 0.45) - k * 0.05) / 0.4)
            x = CARD_X - pad + (1 - tin) * W - tout * W
            y = CARD_Y0 - pad + k * (CARD_H + CARD_GAP)
            paste(im, card, x, y, min(1, tin * 1.5))
        d = ImageDraw.Draw(im)
        d.text((W // 2, 1590), "※ 재미로 보는 운세예요", font=gowun(30), fill=(170, 155, 190), anchor="mm")

    def outro(self, im, lt):
        d = ImageDraw.Draw(im)
        best = self.data["best"]
        a = ease_out(lt / 0.5)
        paste(im, self.trophy, W // 2 - 260, 250, a)
        d.text((W // 2 + 40, 300), "오늘의 1등", font=jua(84), fill=INK, anchor="mm")
        pop = 1 + 0.18 * math.sin(min(lt, 0.6) / 0.6 * math.pi)
        s = ease_out(lt / 0.45) * pop
        e = self.best_emoji
        if s != 1:
            e = e.resize((max(1, int(e.width * s)), max(1, int(e.height * s))))
        glow = Image.new("RGBA", (460, 460), (255, 255, 255, 0))
        ImageDraw.Draw(glow).ellipse([30, 30, 430, 430], fill=(255, 255, 255, 200))
        paste(im, glow.filter(ImageFilter.GaussianBlur(20)), W // 2 - 230, 600 - 230, a)
        paste(im, e, W // 2 - e.width // 2, 600 - e.height // 2 + math.sin(lt * 3) * 10)
        d = ImageDraw.Draw(im)
        d.text((W // 2, 840), best["name"], font=jua(110), fill=PINK, anchor="mm")
        draw_stars(d, W // 2 - 100, 935, best["stars"], r=20, gap=46)
        lc = f'행운의 색: {best["lucky_color"]}'
        tw = text_w(jua(44), lc)
        cx0 = W // 2 - (tw + 56) / 2
        d.ellipse([cx0, 1010 - 20, cx0 + 40, 1010 + 20], fill=best["lucky_hex"], outline=(220, 205, 230), width=3)
        d.text((cx0 + 56, 1010), lc, font=jua(44), fill=MUTE, anchor="lm")
        a2 = ease_out((lt - 0.9) / 0.6)
        if a2 > 0:
            card, pad = rounded_card(900, 400, r=56, fill=(255, 255, 255, 245))
            paste(im, card, W // 2 - 450 - pad, 1110 - pad + (1 - a2) * 60, a2)
            d = ImageDraw.Draw(im)
            yy = 1110 + (1 - a2) * 60
            paste(im, self.mascot_s, 110, yy + 30, a2)
            d.text((300, yy + 70), "내 생일로 보는 진짜 일진은?", font=jua(48), fill=INK, anchor="lm")
            d.text((300, yy + 150), f"{APP_NAME} 앱에서", font=jua(64), fill=PINK, anchor="lm")
            d.text((300, yy + 222), "오늘의 천기누설 · 매일 아침 일진 알림", font=gowun(34), fill=MUTE, anchor="lm")
            btn_w = 700
            d.rounded_rectangle([W // 2 - btn_w // 2, yy + 280, W // 2 + btn_w // 2, yy + 365], 42, fill=PINK)
            d.text((W // 2 + 20, yy + 323), "프로필 링크에서 받기", font=jua(48), fill=WHITE, anchor="mm")
            paste(im, self.sparkle, W // 2 - 250, yy + 295, a2)


# ── 배경 음악 (직접 합성, 저작권 걱정 없음) ──
def make_music(path, dur):
    sr = 44100
    n = int(sr * (dur + 0.5))
    out = np.zeros(n)
    bpm = 100
    beat = 60 / bpm
    notes = {"C4": 261.63, "D4": 293.66, "E4": 329.63, "G4": 392.0, "A4": 440.0, "C5": 523.25,
             "D5": 587.33, "E5": 659.25, "G5": 783.99, "A3": 220.0, "F3": 174.61, "G3": 196.0, "C3": 130.81,
             "F4": 349.23, "B4": 493.88}
    prog = [("C3", ["C4", "E4", "G4", "C5"]), ("A3", ["C4", "E4", "A4", "C5"]),
            ("F3", ["C4", "F4", "A4", "C5"]), ("G3", ["D4", "G4", "B4", "D5"])]
    bar = beat * 4
    t_all = np.arange(n) / sr

    def tone(f, start, length, vol, kind="bell"):
        s0 = int(start * sr)
        ln = int(length * sr)
        if s0 >= n:
            return
        ln = min(ln, n - s0)
        t = np.arange(ln) / sr
        if kind == "bell":
            w = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6)
            env = np.exp(-t * 3.2) * np.minimum(1, t * 200)
        else:
            w = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * f * 2.003 * t)
            env = np.minimum(1, t * 3) * np.minimum(1, (length - t) * 3)
        out[s0:s0 + ln] += w * env * vol

    t = 0.0
    i = 0
    while t < dur:
        root, arp = prog[i % 4]
        tone(notes[root], t, bar, 0.10, "pad")
        tone(notes[root] * 2, t, bar, 0.05, "pad")
        pattern = [0, 1, 2, 3, 2, 1, 2, 3]
        for k, pi in enumerate(pattern):
            tone(notes[arp[pi]] * (2 if i % 2 and k in (3, 7) else 1), t + k * beat / 2, beat * 1.5, 0.12)
        t += bar
        i += 1
    # 장면 전환마다 반짝 소리
    for ts in [INTRO + PAGE * k for k in range(4)]:
        for j, f in enumerate([1567.98, 2093.0, 2637.0]):
            tone(f, ts - 0.1 + j * 0.06, 0.6, 0.05)
    # 간단한 메아리
    d = int(0.28 * sr)
    out[d:] += out[:-d] * 0.25
    fade = np.minimum(1, np.minimum(t_all / 0.3, (dur - t_all) / 1.2).clip(0, 1))
    out *= fade
    out = out / max(1e-6, np.abs(out).max()) * 0.5
    pcm = (out * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def texts(data):
    d = data["date"]
    best = data["best"]
    title = f'{d.month}월 {d.day}일 띠별 오늘의 운세 {best["emoji"]} 1등은 {best["name"]}! #shorts'
    lines = [f'🔮 {d.month}월 {d.day}일 ({data["weekday"]}) {data["ganzhi_ko"]}일 띠별 오늘의 운세',
             f'🏆 오늘의 1등: {best["emoji"]} {best["name"]} (행운의 색: {best["lucky_color"]})', ""]
    for it in data["items"]:
        lines.append(f'{it["emoji"]} {it["name"]} {"★" * int(it["stars"])}{"½" if it["stars"] % 1 else ""} {it["msg"]}')
    lines += ["", f'✨ 내 생일로 보는 진짜 일진·신수는 「{APP_NAME}」 앱에서!']
    if CFG.get("app_link"):
        lines.append(f'👉 {CFG["app_link"]}')
    else:
        lines.append("👉 프로필 링크에서 받아 보세요")
    lines += ["※ 재미로 보는 운세예요", "",
              "#오늘의운세 #띠별운세 #운세 #사주 #일진 #" + best["name"] + " #천기 #천기누설 #shorts"]
    return title, "\n".join(lines)


def render(day, outdir):
    os.makedirs(outdir, exist_ok=True)
    data = fortune.daily(day)
    v = Video(data)
    wav = os.path.join(outdir, "music.wav")
    make_music(wav, TOTAL)
    mp4 = os.path.join(outdir, "shorts.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", wav, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", mp4]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    nframes = int(TOTAL * FPS)
    for i in range(nframes):
        t = i / FPS
        fr = v.frame(t)
        p.stdin.write(fr.tobytes())
        if abs(t - (INTRO + PAGE * 3 + 3.0)) < 0.5 / FPS:
            fr.save(os.path.join(outdir, "thumb.jpg"), quality=90)
    p.stdin.close()
    if p.wait() != 0:
        raise SystemExit("ffmpeg 실패")
    os.remove(wav)
    title, caption = texts(data)
    with open(os.path.join(outdir, "title.txt"), "w", encoding="utf-8") as f:
        f.write(title)
    with open(os.path.join(outdir, "caption.txt"), "w", encoding="utf-8") as f:
        f.write(caption)
    print("완성:", mp4, "|", title)
    return mp4


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] not in ("", "today"):
        day = datetime.date.fromisoformat(sys.argv[1])
    else:
        day = (datetime.datetime.utcnow() + datetime.timedelta(hours=9)).date()
    render(day, sys.argv[2] if len(sys.argv) > 2 else "out")
