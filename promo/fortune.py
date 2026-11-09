"""오늘의 띠별 운세 계산 (규칙 기반, 문장은 자체 작성)

그날의 일진(日辰: 일간·일지)과 12띠 지지의 관계로 점수를 매겨요.
- 일지와 띠: 육합 > 삼합 > 같은 띠 > 보통 > 형·해 > 충
- 일간 오행과 띠 오행: 생해 주면 +, 극하면 -
"""
import datetime
import hashlib

STEMS = "甲乙丙丁戊己庚辛壬癸"
STEMS_KO = "갑을병정무기경신임계"
BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
BRANCHES_KO = "자축인묘진사오미신유술해"
ANIMALS = [
    ("쥐", "🐭"), ("소", "🐮"), ("호랑이", "🐯"), ("토끼", "🐰"),
    ("용", "🐲"), ("뱀", "🐍"), ("말", "🐴"), ("양", "🐑"),
    ("원숭이", "🐵"), ("닭", "🐔"), ("개", "🐶"), ("돼지", "🐷"),
]
WEEKDAYS = "월화수목금토일"

# 오행: 0목 1화 2토 3금 4수
STEM_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
BR_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]
EL_COLOR = ["초록", "빨강", "노랑", "흰색", "파랑"]
EL_COLOR_HEX = ["#7fdcc0", "#ff8f8f", "#ffd66b", "#f4f0ff", "#8cc8ff"]

LIUHE = {frozenset(p) for p in [(0, 1), (2, 11), (3, 10), (4, 9), (5, 8), (6, 7)]}
SANHE = [(8, 0, 4), (2, 6, 10), (5, 9, 1), (11, 3, 7)]
HYEONG = {frozenset(p) for p in [(2, 5), (5, 8), (2, 8), (1, 10), (10, 7), (1, 7), (0, 3)]}
HAE = {frozenset(p) for p in [(0, 7), (1, 6), (2, 5), (3, 4), (8, 11), (9, 10)]}

MESSAGES = {
    "liuhe": [
        "찰떡궁합인 날! 원하는 걸 먼저 말해 보세요",
        "귀인이 먼저 손 내미는 하루예요",
        "미뤄 둔 연락, 오늘 하면 술술 풀려요",
        "좋은 소식이 문 앞까지 와 있어요",
        "함께하면 두 배로 잘되는 날이에요",
        "고백도 제안도 오늘이 타이밍!",
    ],
    "sanhe": [
        "한 팀처럼 일이 착착 맞아떨어져요",
        "작은 노력이 큰 결과로 돌아와요",
        "주변의 응원이 든든한 하루예요",
        "새로 시작하기 딱 좋은 날이에요",
        "생각보다 일이 빨리 끝나요",
        "웃을 일이 하나 더 생겨요",
    ],
    "same": [
        "내 페이스대로 가면 다 잘돼요",
        "비슷한 사람과 마음이 잘 통해요",
        "고집을 살짝 내려놓으면 더 좋아요",
        "자신감이 쑥쑥 오르는 하루예요",
        "친구와의 수다가 행운을 불러요",
    ],
    "normal": [
        "무난하고 편안한 하루예요",
        "작은 루틴이 행운을 지켜 줘요",
        "급할수록 한 번 더 확인해요",
        "따뜻한 음료 한 잔이 오늘의 행운템!",
        "평소처럼만 해도 충분히 좋아요",
        "소소한 즐거움을 찾는 날이에요",
    ],
    "mild": [
        "말 한마디, 두 번 생각하고 해요",
        "서류와 약속 시간은 꼭 다시 확인!",
        "오해는 바로 풀면 금방 괜찮아져요",
        "무리한 부탁은 부드럽게 거절해요",
        "피곤하면 일찍 쉬는 게 이득이에요",
    ],
    "chong": [
        "변화가 많은 날, 플랜 B를 챙겨요",
        "이동과 운전은 여유 있게 천천히!",
        "큰 결정은 하루만 미뤄 봐요",
        "감정 소비를 줄이면 운이 지켜져요",
        "지갑과 물건, 잃어버리지 않게 조심!",
    ],
}
BASE = {"liuhe": 4.5, "sanhe": 4.0, "same": 3.5, "normal": 3.0, "mild": 2.5, "chong": 2.0}

# 일간 오행 → 띠 오행 관계에 따른 태그
TAGS = {
    "insung": "📚 도움운",   # 일간이 나를 생함
    "bigyeon": "🤝 친구운",  # 같은 오행
    "siksang": "💡 아이디어",  # 내가 일간을 생함
    "jae": "💰 금전운",      # 내가 일간을 극함
    "gwan": "🧘 신중하게",   # 일간이 나를 극함
}
ADJ = {"insung": 0.5, "bigyeon": 0.25, "siksang": 0.0, "jae": 0.25, "gwan": -0.5}


def day_ganzhi(d: datetime.date):
    jdn = d.toordinal() + 1721425
    idx = (jdn + 49) % 60
    return idx % 10, idx % 12


def relation(day_br: int, b: int) -> str:
    if b == day_br:
        return "same"
    pair = frozenset((day_br, b))
    if (day_br + 6) % 12 == b:
        return "chong"
    if pair in LIUHE:
        return "liuhe"
    if any(day_br in g and b in g for g in SANHE):
        return "sanhe"
    if pair in HYEONG or pair in HAE:
        return "mild"
    return "normal"


def el_relation(stem_el: int, b_el: int) -> str:
    if stem_el == b_el:
        return "bigyeon"
    if (stem_el + 1) % 5 == b_el:
        return "insung"
    if (b_el + 1) % 5 == stem_el:
        return "siksang"
    if (b_el + 2) % 5 == stem_el:
        return "jae"
    return "gwan"


def birth_years(b: int, today: datetime.date):
    ys = [y for y in range(today.year - 75, today.year - 9) if (y - 4) % 12 == b]
    return ys[-5:]


def _pick(seq, *keys):
    h = hashlib.sha256("|".join(map(str, keys)).encode()).digest()
    return seq[h[0] % len(seq)]


def daily(d: datetime.date):
    st, br = day_ganzhi(d)
    # 같은 날 같은 문장이 겹치지 않게 범주별로 섞어서 차례로 써요
    pools = {}
    for k, v in MESSAGES.items():
        pools[k] = sorted(v, key=lambda m: hashlib.sha256(f"{d}|{m}".encode()).digest())
    used = {k: 0 for k in MESSAGES}
    items = []
    for b, (name, emoji) in enumerate(ANIMALS):
        rel = relation(br, b)
        er = el_relation(STEM_EL[st], BR_EL[b])
        score = max(1.5, min(5.0, BASE[rel] + ADJ[er]))
        stars = round(score * 2) / 2
        used[rel] += 1
        tie = hashlib.sha256(f"{d}|{b}".encode()).digest()[0] / 1000
        items.append({
            "idx": b,
            "name": name + "띠",
            "emoji": emoji,
            "branch": BRANCHES[b],
            "rel": rel,
            "stars": stars,
            "score": score + tie,
            "msg": pools[rel][used[rel] % len(pools[rel])],
            "tag": TAGS[er],
            "years": birth_years(b, d),
            "lucky_color": EL_COLOR[(BR_EL[b] - 1) % 5],
            "lucky_hex": EL_COLOR_HEX[(BR_EL[b] - 1) % 5],
        })
    best = max(items, key=lambda x: x["score"])
    return {
        "date": d,
        "weekday": WEEKDAYS[d.weekday()],
        "ganzhi": STEMS[st] + BRANCHES[br],
        "ganzhi_ko": STEMS_KO[st] + BRANCHES_KO[br],
        "items": items,
        "best": best,
    }


if __name__ == "__main__":
    import sys
    d = datetime.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else datetime.date.today()
    r = daily(d)
    print(d, r["ganzhi"], r["ganzhi_ko"] + "일", "1등:", r["best"]["name"])
    for it in r["items"]:
        print(f'{it["emoji"]} {it["name"]:5} {it["stars"]:.1f} {it["rel"]:6} {it["tag"]:8} {it["msg"]}')
