/* 도깨비 사주 종합 풀이 (규칙 기반, 문장은 자체 작성)
 * 입력: engine.calc() 결과 r, sex('M'|'F'), age(세는나이)
 * 홍국수는 지지로 읽어요: 1子 2巳 3寅 4酉 5辰戌 6亥 7午 8卯 9申 10丑未
 */
(function (root) {
  const EL = n => ['水', '火', '木', '金', '土'][(n - 1) % 5];
  const ELKO = { 水: '수', 火: '화', 木: '목', 金: '금', 土: '토' };
  const SHENG = { 水: '木', 木: '火', 火: '土', 土: '金', 金: '水' };
  const KE = { 水: '火', 火: '金', 金: '木', 木: '土', 土: '水' };
  const NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  const PK = { 1: '감궁(북)', 2: '곤궁(남서)', 3: '진궁(동)', 4: '손궁(남동)', 5: '중궁', 6: '건궁(북서)', 7: '태궁(서)', 8: '간궁(북동)', 9: '이궁(남)' };
  const HE6 = [[1, 10], [3, 6], [8, 5], [5, 4], [2, 9], [7, 10]];          // 육합
  const CHONG = [[1, 7], [8, 4], [3, 9], [2, 6], [5, 5], [10, 10]];         // 충
  const SAN = [[9, 1, 5, '水'], [3, 7, 5, '火'], [2, 4, 10, '金'], [6, 8, 10, '木']]; // 삼합
  const bat = w => { const c = w.charCodeAt(w.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; };
  const ira = w => w + (bat(w) ? '이라' : '라'), ieyo = w => w + (bat(w) ? '이에요' : '예요'), ro = w => w + (bat(w) && (w.charCodeAt(w.length-1)-0xAC00)%28!==8 ? '으로' : '로');
  const LQKO = { 兄: '비겁', 父: '인성', 孫: '식상', 財: '재성', 官: '관성', 鬼: '편관' };
  const pairIn = (L, a, b) => L.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const SEASON = { 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水', 子: '水', 丑: '土' };
  const NATURE = {
    水: '생각이 깊고 융통성이 있어 상황에 맞춰 흐르듯 움직여요. 지혜롭지만 속마음을 잘 드러내지 않아요.',
    火: '밝고 표현이 분명하며 열정적이에요. 예의와 체면을 중시하고, 성급해질 때가 있어요.',
    木: '곧고 자라려는 기운이 강해 추진력과 인정이 있어요. 고집이 세다는 말을 들을 수 있어요.',
    金: '결단력과 의리가 있고 맺고 끊음이 분명해요. 원칙적이라 차갑게 보일 때가 있어요.',
    土: '믿음직하고 포용력이 있어 중재를 잘해요. 신중한 대신 변화에 느릴 수 있어요.'
  };
  const PALACE = {
    1: '감궁은 물의 자리라 속이 깊고 생각이 많으며, 어려움을 견디는 힘이 있어요.',
    2: '곤궁은 어머니의 자리라 남을 보살피고 품는 마음이 크며, 실속을 챙겨요.',
    3: '진궁은 우레의 자리라 행동이 빠르고 앞장서며, 화를 낼 때도 번개처럼 왔다 가요.',
    4: '손궁은 바람의 자리라 부드럽고 사교적이며, 이리저리 움직이며 기회를 찾아요.',
    6: '건궁은 아버지의 자리라 위엄과 고집이 있고, 남의 지시를 받기보다 이끄는 쪽이 편해요.',
    7: '태궁은 연못의 자리라 말솜씨와 웃음이 있고, 사람을 기쁘게 하는 재주가 있어요.',
    8: '간궁은 산의 자리라 묵묵하고 듬직하며, 한 번 정하면 쉽게 움직이지 않아요.',
    9: '이궁은 불의 자리라 밝고 화려하며 드러나는 일을 좋아하고, 감정이 얼굴에 잘 나타나요.'
  };
  const JOB = {
    水: '무역·유통·물류, 수산·음료, 여행·운송, 연구·기획, 상담',
    火: '교육·강의, 방송·광고·디자인, 전기·전자, 요식업, 문화·예술',
    木: '교육·출판, 의료·복지, 섬유·목재·농림, 기획·창업, 인테리어',
    金: '금융·회계, 법률·군경, 기계·금속·자동차, 의료(외과)·IT 하드웨어',
    土: '부동산·건설, 농업, 공무·행정, 중개·컨설팅, 종교·철학'
  };
  const ROLE = {
    父: '문서와 자격을 쓰는 일 — 공무원, 교사, 연구직, 부동산·계약·인허가 관련 일',
    官: '조직과 명예를 따르는 일 — 직장 생활, 관리직, 공공기관, 군·경·법조',
    鬼: '긴장 속에서 힘을 쓰는 일 — 위험·사고·질병을 다루는 일(의료, 보안, 소방, 법무)',
    財: '돈을 직접 굴리는 일 — 사업, 장사, 영업, 재무·투자',
    孫: '재능과 기술로 버는 일 — 기술직, 예술·창작, 서비스업, 교육·돌봄',
    兄: '사람과 함께하는 일 — 동업, 프리랜서, 경쟁이 있는 영업·스포츠'
  };
  const ORGAN = { 水: '신장·방광·생식기, 혈액순환', 火: '심장·혈압·눈, 소장', 木: '간·담, 신경·근육', 金: '폐·대장·기관지, 피부·뼈', 土: '위장·소화기, 비장' };

  function interpret(r, sex, age) {
    const se = r.se, seE = EL(se), sp = r.sePal, shp = r.seHeavPal;
    const rel = n => { const a = EL(n); if (a === seE) return '兄'; if (SHENG[a] === seE) return '父'; if (SHENG[seE] === a) return '孫'; if (KE[seE] === a) return '財'; return (n % 2) !== (se % 2) ? '官' : '鬼'; };
    // 世 왕쇠 (책 기준): 거왕(궁 고유 오행)·승왕(월령)·수생/겸왕(世궁 천반) 중 둘 이상이면 왕.
    // 거왕 하나여도 중궁·동처의 수가 世를 생하면 왕. 간궁(艮巽坤乾)의 五·十土는 무조건 거왕. 일간이 世궁에 있거나 일간 자리가 비겁이면 약하지 않음.
    const PAL_EL = { 1: '水', 2: '金', 3: '木', 4: '火', 5: '土', 6: '水', 7: '金', 8: '木', 9: '火' };
    const helps = e => e === seE || SHENG[e] === seE;
    const why = [];
    const geo = ((se === 5 || se === 10) && [2, 4, 6, 8].includes(sp)) || helps(PAL_EL[sp]);
    why.push(geo ? 'Pal의 자리 오행이 世를 받쳐 거왕(居旺)이에요'.replace('Pal', PK[sp]) : PK[sp] + '의 자리 오행(' + ELKO[PAL_EL[sp]] + ')이 世의 힘을 빼 거쇠(居衰)예요');
    const mon = SEASON[r.pillars[1][1]];
    const seung = helps(mon);
    why.push('태어난 달의 기운(' + ELKO[mon] + ')' + (seung ? '이 世와 같거나 생해 승왕(乘旺)이에요' : '이 世를 설기하거나 극해 승쇠(乘衰)예요'));
    const topRel = rel(r.heavN[sp]);
    const susaeng = topRel === '兄' || topRel === '父';
    if (topRel === '兄') why.push('世궁 천반이 같은 오행이라 겸왕(兼旺)이에요');
    else if (topRel === '父') why.push('世궁 천반이 世를 생해 수생(受生)이에요');
    else why.push('世궁 천반이 ' + ira(LQKO[topRel]) + ' 世를 돕지 못해요');
    let score = (geo ? 1 : 0) + (seung ? 1 : 0) + (susaeng ? 1 : 0);
    let strong = score >= 2 ? 'strong' : 'weak';
    if (strong === 'weak' && geo) {
      const dongP = new Set([...Object.keys(r.tagE || {}).map(Number), 5]);
      const gen = [...dongP].some(p => p !== sp && [r.earthN[p], p === 5 ? r.heavN[5] : null].some(n => n && SHENG[EL(n)] === seE));
      if (gen) { strong = 'strong'; why.push('거왕에 중궁·동처의 수가 世를 생해 줘 왕하게 작용해요'); }
    }
    if (strong === 'weak') {
      const igp = Object.keys(r.tagE || {}).map(Number).find(p => (r.tagE[p] || []).includes('日干'));
      if (igp === sp) { strong = 'strong'; why.push('일간이 世궁에 함께 있어 약하지 않아요'); }
      else if (igp && rel(r.earthN[igp]) === '兄') { strong = 'strong'; why.push('일간 자리가 비겁이라 약하지 않아요'); }
    }
    if (r.kong.has(sp)) why.push('世궁이 공망이에요' + (strong === 'strong' ? '(왕하면 공망은 덜 작용해요)' : ''));
    const strongKo = { strong: '世가 왕(旺)한 편', weak: '世가 약(弱)한 편' }[strong];

    // 육친 집계
    const cnt = { 兄: 0, 父: 0, 孫: 0, 財: 0, 官: 0, 鬼: 0 }, where = { 兄: [], 父: [], 孫: [], 財: [], 官: [], 鬼: [] };
    // 책: 해단은 동처(사지·사간·世·중궁 + 준동, 사지·사간은 천반의 같은 수에도 등극)로 해요 — 판 전체 수를 세지 않아요
    const DP = dongPos(r);
    for (const { p, n, lv } of DP) {
      if ((p === sp && lv === '지반') || (p === shp && lv === '천반') || n === se) continue;
      const k = rel(n); cnt[k]++; if (!where[k].includes(p)) where[k].push(p);
    }
    const grp = { 인성: cnt.父, 비겁: cnt.兄, 식상: cnt.孫, 재성: cnt.財, 관성: cnt.官 + cnt.鬼 };
    const dongPal = new Set([...Object.keys(r.tagE).map(Number), 5]);
    const relWith = (a, b) => {
      const o = [];
      if (pairIn(HE6, a, b)) o.push('육합');
      if (pairIn(CHONG, a, b)) o.push('충');
      const ea = EL(a), eb = EL(b);
      if (SHENG[ea] === eb) o.push('생'); else if (SHENG[eb] === ea) o.push('생받음');
      else if (KE[ea] === eb) o.push('극'); else if (KE[eb] === ea) o.push('극받음');
      return o;
    };
    // 삼합
    const nums = new Set(); for (const p of ALL) { nums.add(r.earthN[p]); }
    const DN = dongNums(r);
    const sanhe = SAN.filter(([a, b, c]) => [a, b, c].every(x => DN.has(x)) && sanOk(r, b));
    const LQ_EL = { 兄: seE, 父: Object.keys(SHENG).find(e => SHENG[e] === seE), 孫: SHENG[seE], 財: KE[seE], 官: Object.keys(KE).find(e => KE[e] === seE) }; LQ_EL.鬼 = LQ_EL.官;
    // 삼살성(같은 궁 천지반 五五·七七·九九)
    const sal = []; for (const p of ALL) { const e = r.earthN[p], h = r.heavN[p]; if (e === h && [5, 7, 9].includes(e)) sal.push([p, { 5: '천강살(五五)', 7: '형혹성(七七)', 9: '태백성(九九)' }[e]]); }

    // ── 대운 (먼저 계산해서 각 항목에서 시기를 짚어 줘요) ──
    const runs = [];
    for (const p of ALL) {
      for (const [lv, rng, n] of [['지반', r.ageE[p], r.earthN[p]], ['천반', r.ageH[p], r.heavN[p]]]) {
        const k = rel(n), rw = relWith(n, se);
        // 책: 대운 수는 동처와의 삼합→반합→육합→생→충극 순열로 풀고, 길문괘·살성을 더해요
        const jj = judge(r, n, pickFor(relations(r, n), 'all'), strong);
        let g = jj.s;
        if (r.kong.has(p) && !kongFree(r, p, n)) g -= 0.5;
        // 대운의 괘문: 45세까지는 그 궁, 46세부터는 그 천반 수가 지반에 있는 궁의 문·괘를 봐요(길문괘가 대운 길흉의 중심)
        const gp = lv === '지반' ? p : (ALL.find(q => q !== 5 && r.earthN[q] === n) || p);
        const dr = r.door && r.door[gp], gu = r.gua && r.gua[gp];
        g += ({ 休門: 0.5, 生門: 0.5, 開門: 0.5, 死門: -0.5, 傷門: -0.5, 驚門: -0.5 })[dr] || 0;
        g += ({ 生氣: 0.5, 天宜: 0.5, 福德: 0.5, 絶命: -0.5, 禍害: -0.5, 絶體: -0.5 })[gu] || 0;
        const theme = { 父: '문서·학업·집·계약', 兄: '사람·경쟁·동업', 孫: '자녀·재능·새 일', 財: '재물·사업' + (sex === 'M' ? '·연애' : ''), 官: '직장·승진·명예' + (sex === 'F' ? '·연애' : ''), 鬼: '압박·관재·건강 주의' }[k];
        runs.push({ p, gp, door: dr, gua: gu, lv, from: rng[0], to: rng[1], n, k, theme, g, why: jj.txt, rw: rw.filter(x => x === '육합' || x === '충') });
      }
    }
    runs.sort((a, b) => a.from - b.from);
    const curRun = runs.find(x => age >= x.from && age <= x.to);
    const ageTxt = u => u.from + (u.to > u.from ? '~' + u.to : '') + '세';
    const pickRun = (ks, min, lo, hi) => runs.filter(u => ks.includes(u.k) && u.g >= min && u.to >= (lo || 20) && u.from <= (hi || 75)).sort((a, b) => b.g - a.g || a.from - b.from)[0];
    const clamp = v => Math.max(1, Math.min(5, Math.round(v)));
    const S = {}, HL = {}, SC = {};

    // ── 성격 ──
    const TYPE = {
      水: ['깊은 물 같은 전략가', '💧', '겉으로는 조용해 보여도 머릿속은 늘 세 수 앞을 계산하고 있어요. 상대가 말하지 않은 속마음까지 귀신같이 읽어 내는 눈치가 당신의 가장 큰 무기예요.', '속을 너무 안 보여서 "무슨 생각하는지 모르겠다"는 말을 듣고, 걱정을 혼자 끌어안다 밤잠을 설쳐요. 털어놓을 사람 한 명이 운을 살려요.'],
      火: ['무대 위의 불꽃', '🔥', '들어서는 순간 분위기를 바꾸는 사람이에요. 좋고 싫음이 얼굴에 그대로 드러나고, 한 번 꽂히면 밤을 새워서라도 해내는 폭발력이 있어요.', '불같이 타오른 만큼 식는 것도 빨라요. 욱해서 던진 한마디가 몇 달 쌓은 신뢰를 태워 버릴 수 있으니, 화가 나면 세 번 숨 쉬고 말하세요.'],
      木: ['꺾이지 않는 개척자', '🌳', '남들이 안 된다고 할수록 더 뻗어 나가는 사람이에요. 정이 많아 내 사람은 끝까지 챙기고, 일을 시작하는 힘만큼은 누구에게도 지지 않아요.', '고집이 대나무처럼 곧아서 한 번 정하면 누가 말려도 안 들어요. 휘어질 줄 알아야 부러지지 않아요.'],
      金: ['칼끝 같은 결단가', '⚔️', '맺고 끊음이 칼같고, 아닌 건 아니라고 말하는 사람이에요. 의리 하나는 확실해서 한 번 믿은 사람은 끝까지 지켜요.', '말에 날이 서 있어 본의 아니게 상처를 줘요. 차갑다는 오해를 받기 쉬우니 지적보다 칭찬을 한 박자 먼저 꺼내세요.'],
      土: ['흔들리지 않는 큰 산', '⛰️', '어떤 폭풍이 와도 자리를 지키는 사람이에요. 결국 사람들이 마지막에 찾아와 기대는 존재, 그게 바로 당신이에요.', '너무 신중해서 기회가 문 앞까지 와도 한 번 더 재다가 놓쳐요. 70% 확신이 서면 움직이세요.']
    }[seE];
    const STR = { strong: ['기운이 꽉 찬', '世가 강해 남에게 휘둘리지 않고 스스로 판을 짜는 사주예요. 리더 자리에 서야 오히려 편하고, 남 밑에서 시키는 일만 하면 답답해 병이 나요.'],
      weak: ['감수성이 예민한', '世가 약해 주변 기운을 스펀지처럼 빨아들이는 사주예요. 그래서 누구 곁에 있느냐가 운을 좌우해요. 좋은 스승과 든든한 내 편을 만나는 순간 인생이 확 달라져요.'],
      mid: ['균형 잡힌', '世가 한쪽으로 치우치지 않아 어디서든 적응하는 사주예요. 극단으로 가지 않는 대신, 확실한 한 방을 위해 "이것만은 내가 최고"라는 무기 하나를 만들어야 해요.'] }[strong];
    const door = r.door[sp], god = r.god[sp];
    const GODK = { 直符: '직부', 螣蛇: '등사', 太陰: '태음', 六合: '육합', 勾陳: '구진', 朱雀: '주작', 白虎: '백호', 玄武: '현무', 九地: '구지', 九天: '구천' };
    const NUMK = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];
    const GODJ = { 直符: '는', 螣蛇: '는', 太陰: '은', 六合: '은', 勾陳: '은', 朱雀: '은', 白虎: '는', 玄武: '는', 九地: '는', 九天: '은' };
    const DOORC = { 休門: '여유롭고 느긋한', 生門: '실속을 챙기는', 傷門: '승부욕 강하고 직설적인', 杜門: '속을 감추고 신중한', 景門: '드러내고 인정받고 싶은', 死門: '한 번 문 건 놓지 않는', 驚門: '예민하고 말발 좋은', 開門: '시원시원하고 활동적인' };
    const GODC = { 直符: '남들 위에 서야 직성이 풀리는 기질', 螣蛇: '상상력이 넘치지만 걱정도 많은 기질', 太陰: '조용히 판을 짜는 책사 기질', 六合: '누구와도 금방 친해지는 마당발 기질', 勾陳: '우직하게 밀고 가는 뚝심 기질', 朱雀: '말과 글로 사람을 움직이는 기질', 白虎: '거칠어도 위기에 강한 승부사 기질', 玄武: '꾀가 많고 비밀을 잘 지키는 기질', 九地: '참고 버티다 결국 이기는 기질', 九天: '높이 날아오르려는 야망가 기질' };
    HL.char = TYPE[1] + ' ' + STR[0] + ' 「' + TYPE[0] + '」형';
    S.char = [TYPE[2], STR[1], '世궁의 ' + door + '·' + (GODK[god] || god) + (GODJ[god] || '은') + ' ' + (DOORC[door] || '') + ' 성향에 ' + (GODC[god] || '') + '을 더해 줘요. ' + (PALACE[sp] || ''), '⚠️ 약점: ' + TYPE[3]];
    SC.char = 0;

    // ── 총평 ──
    const top2 = Object.entries(grp).sort((a, b) => b[1] - a[1]).slice(0, 2);
    const miss = Object.entries(grp).filter(([, v]) => v === 0).map(([k]) => k);
    const GRPW = { 인성: '배움·문서·도움', 비겁: '사람·경쟁·자존심', 식상: '재능·표현·자녀', 재성: '돈·현실 감각', 관성: '직장·명예·책임' };
    const adult = runs.filter(u => u.to >= 20 && u.from <= 80);
    const bestAll = adult.slice().sort((a, b) => b.g - a.g || a.from - b.from)[0];
    const worstAll = adult.slice().sort((a, b) => a.g - b.g || a.from - b.from)[0];
    const gwa = w => { const c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c % 28 ? '과' : '와'; };
    HL.total = TYPE[1] + ' 한마디로, ' + STR[0] + ' 「' + TYPE[0] + '」형 명국';
    S.total = [
      '당신 인생을 움직이는 두 개의 엔진은 <b>' + GRPW[top2[0][0]] + '</b>' + gwa(GRPW[top2[0][0]]) + ' <b>' + GRPW[top2[1][0]] + '</b>' + (bat(GRPW[top2[1][0]]) ? '이에요. ' : '예요. ') + (miss.length ? '반대로 <b>' + miss.map(k => GRPW[k]).join('·') + '</b>' + (bat(GRPW[miss[miss.length - 1]]) ? '은' : '는') + ' 판에 없어서, 이 부분은 평생 의식적으로 채워야 할 숙제예요.' : '빠진 기운 없이 고루 갖춰 어떤 길을 가도 기본은 해내요.'),
      '인생 최고의 시기는 <b>' + ageTxt(bestAll) + '</b>(' + bestAll.theme + '), 가장 몸을 낮춰야 할 시기는 <b>' + ageTxt(worstAll) + '</b>(' + worstAll.theme + ')예요.',
      sanhe.length ? '판에 ' + sanhe.map(s => NUMK[s[0]] + '·' + NUMK[s[1]] + '·' + NUMK[s[2]] + ' 삼합(' + ELKO[s[3]] + '국)').join(', ') + '이 맺혀 있어 한 번 운이 붙으면 몰아서 크게 터지는 사주예요.' : '',
      '📌 근거: 日柱 ' + r.pillars[2] + ', 世는 ' + PK[sp] + '의 ' + NUM[se] + '(' + ELKO[seE] + '), ' + strongKo + ' — ' + why.join(', ') + '.'
    ].filter(Boolean);
    SC.total = 0;

    // ── 재물 ──
    const F = [];
    let ms = 3, mType;
    if (cnt.財 === 0) { ms = 2.5; mType = '기술형 — 손에 쥔 기술이 곧 돈'; F.push('판에 재성이 드러나지 않아 돈을 쫓아가면 돈이 도망가는 사주예요. 대신 ' + (cnt.孫 ? '재능과 기술(孫)' : '자격과 문서(父)') + '을 갈고닦으면 돈이 알아서 따라와요. 투기·코인·한 방은 당신 몫이 아니에요.'); }
    else if (strong === 'strong') { ms = 4.5; mType = '굴리는 형 — 크게 벌고 크게 굴리는 사업가 체질'; F.push('世가 강하고 재성이 ' + cnt.財 + '곳에 깔려 있어 돈을 감당하는 그릇이 커요. 월급만 받고 살기엔 아까운 사주예요. 부업이든 투자든 내 이름으로 굴리는 돈이 있어야 재물운이 깨어나요.'); }
    else if (strong === 'weak' && cnt.財 >= 3) { ms = 2.5; mType = '지키는 형 — 버는 것보다 새는 걸 막는 게 관건'; F.push('돈은 많이 보이는데 世가 약한 「재다신약(財多身弱)」이에요. 돈 냄새는 잘 맡지만 덥석 잡으면 몸이 상하거나 사람에게 뺏겨요. 혼자 크게 벌이지 말고, 계약서와 믿을 만한 파트너로 반드시 안전장치를 거세요.'); }
    else { ms = 3.5; mType = '모으는 형 — 티끌 모아 태산을 만드는 체질'; F.push('재성이 ' + cnt.財 + '곳에 있어 재물 복이 평균 이상이에요. 한 방보다 꾸준함이 무기라, 자동이체 적금처럼 "모르는 사이에 쌓이는 구조"를 만들면 중년 이후 확실히 차이가 나요.'); }
    if (cnt.孫 && cnt.財) { ms += 0.5; F.push('재능(孫)이 돈(財)으로 바로 연결되는 흐름이 있어요. 좋아하는 일을 돈 되는 일로 바꾸는 순간 수입이 뛰어요.'); }
    if (cnt.兄 >= 3) { ms -= 1; F.push('⚠️ 동처에 비겁이 ' + cnt.兄 + '곳이라 내 돈을 노리는 사람이 꼬여요. 보증, 동업, 지인 돈거래는 "절대 안 된다"고 정해 두세요.'); }
    // 책: 삼합이 인성이면 재물에 귀격, 삼합의 오행이 世가 되면 대길 / 世약에 재성 삼합은 돈·여자로 괴로움 / 삼합 중 둘만 있으면 빠진 하나를 취하면 재물이 편해요
    for (const s of sanhe) {
      const e = s[3];
      if (e === LQ_EL.父) { ms += 1; F.push('🏆 ' + NUMK[s[0]] + '·' + NUMK[s[1]] + '·' + NUMK[s[2]] + ' 삼합이 인성(문서)으로 맺혀 재물에 귀격이에요. 집·땅·문서로 재산이 불어나요.'); }
      else if (e === seE) { ms += 1; F.push('🏆 ' + NUMK[s[0]] + '·' + NUMK[s[1]] + '·' + NUMK[s[2]] + ' 삼합이 世의 기운으로 모여 재물에 크게 길해요.'); }
      else if (e === LQ_EL.財 && strong === 'weak') { ms -= 1; F.push('⚠️ 재성이 삼합으로 왕성한데 世가 약해 돈' + (sex === 'M' ? '과 여자' : '') + '가 들어오면 오히려 괴로움이 돼요. 큰돈은 나눠서 지키세요.'); }
    }
    if (!sanhe.length) for (const [a, b, c, e] of SAN) { const have = [a, b, c].filter(x => DN.has(x)); if (have.length === 2) { const m0 = [a, b, c].find(x => !DN.has(x)), mk = rel(m0); if (['父', '財', '孫', '官'].includes(mk) && (e === seE || e === LQ_EL.父 || e === LQ_EL.財)) { F.push('💡 삼합(' + NUMK[a] + '·' + NUMK[b] + '·' + NUMK[c] + ') 가운데 ' + NUMK[m0] + '만 빠져 있어요. 빠진 ' + LQKO[mk] + '(' + { 父: '문서·자격', 財: '돈·사업', 孫: '사업·장사·기술', 官: '직장·관직' }[mk] + ')을 취해 쓰면 재물이 어렵지 않아요.'); break; } } }
    const finSet = new Set(where.財);
    if (finSet.size && [...finSet].every(p => r.kong.has(p))) { ms -= 0.5; F.push('재성이 공망에 걸려 들어온 돈이 손에 오래 머물지 않아요. 수입이 생기면 바로 묶어 두는 습관이 필요해요.'); }
    const moneyRun = pickRun(strong === 'weak' ? ['父', '兄', '財'] : ['財', '孫'], 1);
    if (moneyRun) F.push('💰 재물운 전성기: <b>' + ageTxt(moneyRun) + '</b> — 이 시기에 종잣돈을 키우세요.');
    const leakRun = runs.filter(u => (u.k === '兄' || u.k === '鬼') && u.g <= 0 && u.from >= 20 && u.from <= 80).sort((a, b) => a.g - b.g)[0];
    if (leakRun) F.push('💸 돈이 새기 쉬운 때: <b>' + ageTxt(leakRun) + '</b> — 큰 투자와 빌려주는 돈은 피하세요.');
    HL.money = mType; SC.money = clamp(ms); S.money = F;

    // ── 직업(용신) ──
    // 책: 世약이면 인성(父)이 용신, 世왕이면 동한 재·관귀·손 가운데 왕성한 것이 용신
    let yong, yongN = null;
    if (strong === 'weak') yong = '父';
    else {
      const c = DP.filter(x => x.n !== se && ['財', '官', '鬼', '孫'].includes(rel(x.n))).map(x => ({ k: rel(x.n), n: x.n, pw: numPower(r, x.n, x.p) + (x.p === 5 ? 0.5 : 0) }));
      c.sort((a, b) => b.pw - a.pw);
      if (c.length) { yong = c[0].k; yongN = c[0].n; } else yong = '孫';
    }
    const yongE = yongN ? EL(yongN) : LQ_EL[yong];
    const yongMiss = !DP.some(x => x.n !== se && rel(x.n) === yong);
    const JY = jinyong(r, yong === '鬼' ? '官' : yong);
    const jy = JY.cand[0] || null;
    const JOBHL = { 父: '자격증과 문서가 밥 먹여 주는 전문가형', 官: '조직에서 자리로 승부하는 관리자형', 鬼: '위기에서 빛나는 해결사형', 財: '숫자와 돈을 직접 굴리는 사업가형', 孫: '재능과 기술로 이름을 남기는 장인형', 兄: '사람을 모아 판을 키우는 네트워크형' };
    const AVOID = { 父: '실적 압박만 있고 배울 게 없는 영업직', 官: '혼자 책임지는 불안정한 자영업', 鬼: '변화 없는 반복 사무직', 財: '정해진 월급만 받는 단순 반복 업무', 孫: '창의성을 막는 딱딱한 위계 조직', 兄: '혼자 고립돼 일하는 자리' };
    const jyK = jy ? (jy.k === '世' ? '兄' : jy.k) : null;
    S.job = [
      '용신은 <b>' + LQKO[yong] + '(' + yong + ')</b>이에요' + (strong === 'weak' ? '(世가 약해 나를 생해 주는 인성을 써요)' : '(世가 왕해 동한 재·관·손 가운데 가장 왕성한 것을 써요)') + '. ' + ROLE[yong] + (yongMiss ? ' — 다만 동처에 직접 드러나지 않아 운에서 들어올 때 힘을 써요.' : ' — 이 길로 가면 노력의 두 배를 돌려받아요.'),
      jy ? '🔑 <b>진용(眞用)</b>은 ' + NUM[jy.n] + '(' + LQKO[jyK] + ')' + ' — ' + jy.q.type + '으로 용신의 ' + ELKO[JY.yE] + ' 기운을 더 왕성하게 해 줘요. 실제 직업과 개운은 이 쪽을 취할 때 더 잘 풀려요: ' + ROLE[jyK] + '.' : '',
      '용신 오행이 ' + ira(ELKO[yongE]) + '서 <b>' + JOB[yongE] + '</b> 분야가 당신 무대예요.',
      sals(r).some(s => s.name.includes('삼형') && !s.light) && strong === 'strong' ? '三二九 삼형살이 있는데 世가 왕해 도리어 권세를 잡는 쪽으로 써요 — 결단·통솔이 필요한 자리에서 빛나요.' : '',
      '🚫 피해야 할 자리: ' + AVOID[yong] + '. 이런 곳에선 능력의 절반도 못 써요.',
      cnt.官 + cnt.鬼 && strong !== 'weak' ? '관성이 받쳐 줘 조직 안에서 직함과 명예를 얻는 사주예요. 승진 기회가 오면 사양하지 마세요.' : ''
    ].filter(Boolean);
    const jobRun = pickRun(strong === 'weak' ? ['父', '官'] : ['官', '財', '孫'], 1, 20);
    if (jobRun) S.job.push('🚀 일에서 크게 뜨는 시기: <b>' + ageTxt(jobRun) + '</b> — 이직·창업·승진 도전은 이때 하세요.');
    HL.job = JOBHL[yong]; SC.job = clamp((strong === 'weak' ? 3 : 4) + (cnt.官 + cnt.鬼 && strong !== 'weak' ? 0.5 : 0) + (jobRun && jobRun.g >= 2 ? 0.5 : 0));

    // ── 배우자 ──
    const spK = sex === 'F' ? ['官', '鬼'] : ['財'];
    const spWord = sex === 'F' ? '남편 자리(官·鬼)' : '아내 자리(財)';
    const SPT = { 水: '속 깊고 눈치 빠른, 말없이 챙겨 주는 사람', 火: '밝고 표현이 확실한, 함께 있으면 웃게 되는 사람', 木: '곧고 정 많은, 미래를 같이 그려 가는 사람', 金: '똑 부러지고 책임감 강한, 약속은 꼭 지키는 사람', 土: '듬직하고 한결같은, 기댈 수 있는 사람' };
    const spPals = DP.filter(x => x.n !== se && spK.includes(rel(x.n)) && !((x.p === sp && x.lv === '지반') || (x.p === shp && x.lv === '천반'))).map(x => [x.p, x.n, x.lv === '지반' ? '지' : '천']);
    const M = []; let ss = 3, spHL;
    if (!spPals.length) { ss = 2; spHL = '인연은 늦게, 그러나 운에서 확실히 들어와요'; M.push(spWord + '가 판에 드러나지 않아 연애가 쉽게 풀리지 않는 사주예요. 대신 운에서 배우자 기운이 들어오는 시기에 만나면 오래가요. 그 시기를 놓치지 마세요.'); }
    else {
      const main = spPals.find(([p]) => p === sp) || spPals.find(([p]) => p === 5) || spPals[0];
      const rw = relWith(main[1], se);
      spHL = '잘 맞는 사람: ' + SPT[EL(main[1])];
      M.push('당신의 짝은 <b>' + SPT[EL(main[1])] + '</b>이에요. (' + (sex === 'F' ? '남편' : '아내') + ' 수: ' + PK[main[0]] + ' ' + NUM[main[1]] + ', ' + ELKO[EL(main[1])] + ' 기운)');
      // 책: 배우자 수가 世와 합(삼합·반합·육합)하면 사이가 좋고, 생하면 덕을 보고, 충극하면 부딪혀요
      const spRel = relations(r, main[1]).find(q => q.with.includes(se));
      if (spRel && spRel.type !== '생' && spRel.type !== '충극') { ss += 1; M.push('💞 배우자 수가 世와 ' + spRel.type + ' — 사이가 좋고 떨어져 살지 않는 금실이에요.'); }
      else if (spRel && spRel.type === '생') { ss += 0.5; M.push('배우자 수가 世를 생해 배우자의 덕을 보는 인연이에요.'); }
      else if (rw.includes('충') || (spRel && spRel.type === '충극')) { ss -= 1; M.push('⚡ 배우자 수가 世와 ' + (rw.includes('충') ? '충' : '충극') + ' — 불꽃 튀게 사랑하고 불꽃 튀게 싸우는 사이예요. 각자의 공간과 시간을 인정해 주는 게 오래가는 비결이에요.'); }
      const HG4 = [[7, 9], [2, 9], [7, 4], [2, 4]], hg = q => HG4.some(([x, y]) => (r.earthN[q] === x && r.heavN[q] === y) || (r.earthN[q] === y && r.heavN[q] === x));
      if (hg(sp) && spPals.some(([q]) => hg(q))) { ss -= 1.5; M.push('⚠️ 世궁과 배우자 자리의 천지반이 모두 화금상전이에요. 책에서는 해로하기 어려운 배치로 봐요 — 떨어져 지내는 시간을 일부러 만들고, 다툼은 그날 풀어야 해요.'); }
      if (spPals.some(([, n]) => n === 3) && [3, 2, 9].every(x => DN.has(x))) { ss -= 1; M.push('⚠️ 배우자 수가 三인데 三二九 삼형살이 이뤄져 배우자 쪽이 충극을 받아요. 배우자의 건강·사고를 함께 챙기세요.'); }
      if (sex === 'F' && spPals.some(x => rel(x[1]) === '鬼') && spPals.some(x => rel(x[1]) === '官')) { ss -= 0.5; M.push('官과 鬼가 함께 있어 남자 인연이 겹치기 쉬워요. 끌리는 사람과 좋은 사람을 구분하는 눈이 필요해요.'); }
      if (sex === 'M' && spPals.length >= 4) M.push('재성이 많아 이성에게 인기가 많은 사주예요. 인연이 많은 만큼 한 사람에게 집중할 때 복이 커져요.');
      if (spPals.every(([p, n]) => r.kong.has(p) && !kongFree(r, p, n))) { ss -= 1; M.push('배우자 자리가 공망이라 서로 바빠 함께하는 시간이 줄기 쉬워요. 일부러라도 둘만의 시간을 정해 두세요.'); }
      if (spPals.some(([p]) => p === sp)) M.push('배우자 수가 世궁에 함께 있어 결혼 후 배우자가 인생의 중심이 되는 사주예요.');
      if (rel(r.heavN[sp]) === (sex === 'F' ? '官' : '財')) { ss += 1; M.push('世궁 천반이 배우자라 결혼하면 배우자 덕에 한 단계 올라서요.'); }
    }
    if (sal.some(([p]) => p === sp)) { ss -= 1; M.push('⚠️ 世궁에 ' + sal.find(([p]) => p === sp)[1] + '이 있어 가정에 풍파가 일 수 있어요. 큰 결정은 반드시 배우자와 상의하세요.'); }
    const loveRun = pickRun(spK, 0.5, 20, 45);
    if (loveRun) M.push('💍 인연·결혼운이 강한 시기: <b>' + ageTxt(loveRun) + '</b>');
    HL.spouse = spHL; SC.spouse = clamp(ss); S.spouse = M;

    // ── 자녀 ──
    const C = []; let cs = 3, chHL;
    if (cnt.孫 === 0) { cs = 2; chHL = '자녀 인연은 늦지만 귀하게 와요'; C.push('孫이 판에 드러나지 않아 자녀 인연이 늦거나 적을 수 있어요. 대신 한 명을 낳아도 귀하게 키우는 사주예요.'); }
    else {
      cs = cnt.孫 >= 3 ? 4.5 : 3.5; chHL = cnt.孫 >= 3 ? '자녀가 복덩이 — 자식 덕을 보는 사주' : '자녀와 인연이 이어지는 사주';
      C.push('孫이 ' + cnt.孫 + '곳에 있어 ' + (cnt.孫 >= 3 ? '자녀 복이 많고, 나이 들수록 자식 덕을 톡톡히 봐요.' : '자녀 인연이 분명하고 자녀를 통해 기쁨을 얻어요.'));
      if (where.孫.every(p => r.kong.has(p) && !kongFree(r, p))) { cs -= 1; C.push('孫이 모두 공망이라 자녀와 떨어져 지내거나 생각이 엇갈리기 쉬워요. 간섭보다 응원이 통해요.'); }
      if (cnt.父 >= 4) { cs -= 0.5; C.push('인성이 많아 자녀를 누르기 쉬워요. 잔소리를 반으로 줄이면 아이가 두 배로 자라요.'); }
      if (where.孫.includes(5)) { cs += 0.5; C.push('중궁에 孫이 있어 자녀가 집안의 기둥이 돼요.'); }
    }
    // 책: 時干은 맏이, 時支는 그다음 자녀 — 그 수가 충극·삼형을 받으면 그 자녀가 힘들어요
    { const tg = DP.find(x => x.lv === '지반' && (r.tagE[x.p] || []).includes('時干')), tz = DP.find(x => x.lv === '지반' && (r.tagE[x.p] || []).includes('時支'));
      for (const [x, who] of [[tg, '맏이'], [tz, '둘째 이후 자녀']]) { if (!x) continue; const hit = sals(r).find(s => !s.light && s.bad && s.txt.includes(NUM[x.n] + '(')); if (hit) { cs -= 0.5; C.push('⚠️ ' + who + ' 자리(' + NUM[x.n] + ')가 ' + hit.name + '에 걸려 있어 그 자녀의 건강·사고를 챙기세요.'); } } }
    HL.child = chHL; SC.child = clamp(cs); S.child = C;

    // ── 건강 ──
    const HB = { 水: '찬 음료를 줄이고 허리·하체를 따뜻하게 하세요. 물은 미지근하게, 밤샘은 금물이에요.', 火: '수면 시간을 지키고 짜고 매운 음식을 줄이세요. 혈압은 1년에 두 번 꼭 재세요.', 木: '눈과 목·어깨를 자주 풀어 주고 술자리를 줄이세요. 화를 참으면 간이 먼저 상해요.', 金: '건조한 공기를 피하고 피부·호흡기를 촉촉하게 지키세요. 환절기 감기를 가볍게 넘기지 마세요.', 土: '정해진 시간에 먹고 야식·과식을 끊으세요. 걱정이 많으면 위가 먼저 반응해요.' };
    const H = []; let hs = 4;
    H.push('世가 ' + ira(ELKO[seE]) + ' <b>' + ORGAN[seE] + '</b> 쪽이 가장 먼저 신호를 보내요. ' + HB[seE]);
    const guiE = (() => { for (const p of ALL) for (const n of [r.earthN[p], r.heavN[p]]) if (rel(n) === '鬼') return EL(n); return KE[KE[KE[KE[seE]]]]; })();
    if (cnt.鬼 + cnt.官 >= 3 && strong !== 'strong') { hs -= 1; H.push('⚠️ 관귀가 많고 世가 약해 스트레스가 바로 몸으로 와요(' + ORGAN[guiE] + '). 일을 줄이는 게 최고의 보약이에요.'); }
    if (['絶體', '絶命'].includes(r.gua[sp])) { hs -= 1; H.push('世궁에 ' + r.gua[sp] + '이 있어 체력이 갑자기 떨어지는 때가 있어요. 정기 검진은 미루지 마세요.'); }
    if (sal.length) { const nearSe = sal.some(([p]) => p === sp || p === 5 || (r.tagE[p] || []).includes('年支')); hs -= nearSe ? 1 : 0.5; H.push(sal.map(([p, n]) => PK[p] + '의 ' + n).join(', ') + (nearSe ? '이 世·중궁·년지 자리에 있어 사고·수술을 특히 조심해야 해요.' : '이 있어 운전·운동 중 다치지 않게 조심하세요.')); }
    { const hitSe = sals(r).filter(s => s.bad && !s.light && s.txt.includes('(세)') && /삼살|삼형|천강|형혹|태백/.test(s.name)); if (hitSe.length) { hs -= strong === 'strong' ? 0.5 : 1.5; H.push('⚠️ ' + hitSe.map(s => s.name).join('·') + '이 世(나) 자신을 치는 배치예요. ' + (strong === 'strong' ? '世가 왕해 큰 탈로 번지진 않지만, 그 운이 올 때 사고·수술·과로를 조심하세요.' : '世가 약해 그 운이 올 때 사고·수술·질병을 특히 조심해야 해요.')); } }
    { const HG4 = [[7, 9], [2, 9], [7, 4], [2, 4]]; if (HG4.some(([x, y]) => (r.earthN[sp] === x && r.heavN[sp] === y) || (r.earthN[sp] === y && r.heavN[sp] === x))) { hs -= 1; H.push('⚠️ 世궁 천지반이 화금상전(불과 쇠의 싸움)이라 몸이 상하는 일을 조심해야 해요.'); } }
    if ([r.earthN[sp], r.heavN[sp]].some(v => v === 5 || v === 10)) H.push('世궁에 토(五·十)가 있어 소화기와 만성 피로를 살피세요.');
    const hRun = runs.filter(u => u.k === '鬼' && u.g <= -1 && u.to >= 20).sort((a, b) => a.g - b.g)[0];
    if (hRun) H.push('🩺 건강을 특히 챙길 시기: <b>' + ageTxt(hRun) + '</b>');
    HL.health = hs >= 4 ? '타고난 체력은 좋은 편, 한 곳만 지키면 돼요' : hs >= 3 ? '무리하면 바로 티가 나는 체질' : '몸이 보내는 신호를 절대 무시하면 안 되는 사주';
    SC.health = clamp(hs); S.health = H;

    // ── 대운 흐름 ──
    const D = [];
    if (curRun) {
      const gv = curRun.g;
      HL.luck = gv >= 2 ? '지금이 바로 치고 나갈 때' : gv >= 1 ? '지금은 차곡차곡 쌓아 올릴 때' : gv <= -1 ? '지금은 몸을 낮추고 버틸 때' : '지금은 판을 보며 기회를 고를 때';
      SC.luck = clamp(gv >= 2 ? 5 : gv >= 1 ? 4 : gv <= -1 ? 2 : 3);
      D.push('지금 ' + age + '세는 <b>' + curRun.k + '(' + LQKO[curRun.k] + ') 대운</b>(' + ageTxt(curRun) + ', ' + PK[curRun.p] + ' ' + curRun.lv + ' ' + NUM[curRun.n] + ')이에요. ' + curRun.theme + '의 일이 인생의 중심에 서요.');
      D.push(gv >= 2 ? '世를 밀어 주는 바람이 부는 시기예요. 미뤄 둔 계획이 있다면 지금 시작하세요. 이 바람은 영원히 불지 않아요.' : gv >= 1 ? '큰 파도는 없지만 쌓는 만큼 남는 시기예요. 자격증, 저축, 인맥 — 다음 대운의 밑천을 지금 만드세요.' : gv <= -1 ? '世를 누르는 바람이 부는 시기예요. 확장·투자·이직은 한 템포 늦추고, 지키는 사람이 결국 이겨요.' : '좋고 나쁨이 섞인 시기예요. 다 잡으려 하지 말고 확실한 것 하나만 고르세요.');
      if (curRun.rw.length) D.push('대운 수가 世와 ' + curRun.rw.join('·') + ' — ' + (curRun.rw.includes('육합') ? '귀인과 좋은 인연이 먼저 손을 내밀어요.' : '이사·이직·관계 변화 같은 큰 변동이 찾아와요.'));
    }
    const next = runs.find(x => x.from > age);
    if (next) D.push('⏭️ 다음 대운은 <b>' + next.from + '세</b>부터 ' + next.k + ' 대운 — ' + next.theme + (next.g >= 1 ? ', 기다릴 만한 좋은 흐름이에요.' : next.g <= -1 ? ', 미리 대비해 두면 충격이 반으로 줄어요.' : '의 일이 중심이 돼요.'));
    const bestNext = runs.filter(u => u.to >= age && u.to >= 20 && u.from <= 85).sort((a, b) => b.g - a.g || a.from - b.from)[0];
    if (bestNext && bestNext !== curRun) D.push('🌟 앞으로 남은 인생의 황금기: <b>' + ageTxt(bestNext) + '</b> (' + bestNext.theme + ')');
    S.luck = D;

    // ── 행운 처방 (용신 오행 + 용신이 앉은 궁) ──
    const LK = {
      木: { c: ['초록', '청록', '연두'], hex: ['#3fae5b', '#1f9e8f', '#9bd36a'], a: ['호랑이', '토끼'], ae: '🐯🐰', n: '3 · 8', it: '초록 화분, 나무 소품, 원목 가구', sea: '봄', d: '동쪽' },
      火: { c: ['빨강', '분홍', '보라'], hex: ['#e53935', '#ff7fa8', '#9c5fd6'], a: ['말', '뱀'], ae: '🐴🐍', n: '2 · 7', it: '캔들·조명, 빨간 지갑, 햇빛 드는 자리', sea: '여름', d: '남쪽' },
      土: { c: ['노랑', '베이지', '황토'], hex: ['#f2c14e', '#e8d5b0', '#c58b4c'], a: ['소', '용'], ae: '🐮🐲', n: '5 · 10', it: '도자기, 황토·돌 소품, 네모난 물건', sea: '환절기', d: '가운데(남서·북동)' },
      金: { c: ['흰색', '금색', '은색'], hex: ['#ffffff', '#d4af37', '#b8c0c8'], a: ['원숭이', '닭'], ae: '🐵🐔', n: '4 · 9', it: '금속 시계, 금·은 액세서리, 동그란 물건', sea: '가을', d: '서쪽' },
      水: { c: ['검정', '남색', '파랑'], hex: ['#2b2b2b', '#283f8f', '#3b82f6'], a: ['쥐', '돼지'], ae: '🐭🐷', n: '1 · 6', it: '수족관·물병, 유리 소품, 물결무늬 물건', sea: '겨울', d: '북쪽' }
    };
    const L0 = LK[yongE];
    const yPal = (jy && jy.pals && jy.pals.find(p => p !== 5)) || (where[yong] || []).find(p => p !== 5) || 0;
    const pDir = yPal ? /\((.+)\)/.exec(PK[yPal])[1] + '쪽' : L0.d;
    const badE = KE[KE[KE[KE[seE]]]] === undefined ? null : Object.keys(KE).find(k => KE[k] === seE);
    const L1 = badE && badE !== yongE ? LK[badE] : null;
    const tile = (ic, t, v, sub) => '<div class="lkT"><span class="lkI">' + ic + '</span><b>' + t + '</b><em>' + v + '</em>' + (sub ? '<small>' + sub + '</small>' : '') + '</div>';
    const sw = L0.hex.map(h => '<i style="background:' + h + '"></i>').join('');
    HL.lucky = '당신을 살리는 기운은 「' + ELKO[yongE] + '(' + yongE + ')」 — 곁에 둘수록 운이 붙어요';
    SC.lucky = 0;
    S.lucky = [
      '<div class="lkG">' +
        tile('<span class="lkSw">' + sw + '</span>', '행운 색깔', L0.c.join(' · '), '지갑·폰 케이스·옷에') +
        tile(L0.ae, '귀인 동물', L0.a.join(' · ') + '띠', '이 띠를 가진 사람이 귀인') +
        tile('🧭', '행운 방위', pDir, '책상·침대 머리·이사 방향') +
        tile('🔢', '행운 숫자', L0.n, '비밀번호·날짜·번호 고를 때') +
        tile('🎁', '행운 아이템', L0.it, '') +
        tile('🗓️', '힘이 나는 계절', L0.sea, '중요한 일은 이때 시작') +
      '</div>',
      '🔑 <b>쓰는 법:</b> 중요한 날(면접·계약·고백·시험)에는 <b>' + L0.c[0] + '</b> 계열 옷이나 소품을 하나 걸치고, 자리는 <b>' + pDir + '</b>을 향해 앉으세요. ' + L0.a[0] + '띠·' + L0.a[1] + '띠인 사람이 도움을 주면 그 손을 꼭 잡으세요.',
      L1 ? '🚫 <b>피해야 할 색:</b> ' + L1.c.slice(0, 2).join('·') + ' — 世(' + ELKO[seE] + ')를 누르는 ' + ELKO[badE] + ' 기운이라, 큰일을 앞두고는 이 색을 몸에 지니지 마세요.' : ''
    ].filter(Boolean);

    return { strong, strongKo, score: Math.round(score * 10) / 10, wang: { geo, seung, susaeng }, yong, cnt, where, S, HL, SC, runs, curRun };
  }


  // ── 운곡 원리: 삼합 → 반합 → 육합 → 생 → 충극 순열 ──
  // 홍국수↔지지: 一子 二巳 三寅 四酉 五辰戌 六亥 七午 八卯 九申 十丑未
  const HE6EL = { '1-10': '土', '3-6': '木', '5-8': '火', '4-5': '金', '2-9': '水', '7-10': '火' };
  const he6Key = (a, b) => Math.min(a, b) + '-' + Math.max(a, b);
  function relOf(r) { const se = r.se, seE = EL(se); return n => { if (n === se) return '世'; const a = EL(n); if (a === seE) return '兄'; if (SHENG[a] === seE) return '父'; if (SHENG[seE] === a) return '孫'; if (KE[seE] === a) return '財'; return (n % 2) !== (se % 2) ? '官' : '鬼'; }; }
  // 판에 있는 수의 위치와 사주 표시
  function where(r, n) {
    const o = [];
    for (const p of ALL) { if (r.earthN[p] === n) o.push({ p, lv: '지반', tags: (r.tagE && r.tagE[p]) || [] }); if (r.heavN[p] === n) o.push({ p, lv: '천반', tags: (r.tagH && r.tagH[p]) || [] }); }
    return o;
  }
  // 짝이 되는 수는 동처(사주 지지·천간이 놓인 궁, 世궁, 중궁)의 수만 봐요. 사간·사지의 지반 수는 천반의 같은 수로도 올라가요(천반 등극)
  // 준동: 사지·중궁이 아닌 외궁의 수가 겸왕(천지반 같은 오행)이면서 자리에서 왕하거나(거왕) 월령의 생조를 받으면 동한 것으로 봐요
  const PAL_EL0 = { 1: '水', 2: '金', 3: '木', 4: '火', 5: '土', 6: '水', 7: '金', 8: '木', 9: '火' };
  function junDong(r) {
    if (r._jun) return r._jun;
    const mon = SEASON[r.pillars[1][1]], sup = (e, t) => e === t || SHENG[e] === t;
    const saji = new Set([r.sePal, ...Object.keys(r.tagE || {}).map(Number).filter(p => (r.tagE[p] || []).some(t => t.endsWith('支')))]);
    const out = [];
    for (const p of ALL) { if (p === 5 || saji.has(p)) continue; const a = r.earthN[p], b = r.heavN[p], e = EL(a);
      if (EL(b) !== e) continue;
      const geo = sup(PAL_EL0[p], e) || ((a === 5 || a === 10) && [2, 4, 6, 8].includes(p)), seung = sup(mon, e);
      if (geo || seung) out.push({ p, n: a, h: b, why: geo && seung ? '자리·월령 모두' : geo ? '자리에서 왕' : '월령의 생조' }); }
    return (r._jun = out);
  }
  // 동처 자리 목록: 지반(사주가 놓인 궁·世궁·중궁·준동) + 천반(사지·사간 등극·世 천반·중궁·준동) + 중궁 투출
  function dongPos(r) {
    if (r._dp) return r._dp;
    const o = [], seen = new Set(), add = (p, n, lv) => { const k = p + lv; if (!seen.has(k)) { seen.add(k); o.push({ p, n, lv }); } };
    const J = junDong(r).map(j => j.p);
    for (const p of new Set([5, r.sePal, ...Object.keys(r.tagE || {}).map(Number), ...J])) add(p, r.earthN[p], '지반');
    for (const p of new Set([5, r.seHeavPal, ...Object.keys(r.tagH || {}).map(Number), ...J])) add(p, r.heavN[p], '천반');
    for (const x of touchul(r)) add(5, x.to, '투출');
    return (r._dp = o);
  }
  // 홍국수의 힘: 거왕(자리)·승왕(월령)·겸왕/수생(같은 궁 반대 판) 가운데 몇 개인지
  function numPower(r, n, p) {
    const e = EL(n), sup = x => x === e || SHENG[x] === e, mon = SEASON[r.pillars[1][1]];
    const other = r.earthN[p] === n ? r.heavN[p] : r.earthN[p];
    return (sup(PAL_EL0[p]) || ((n === 5 || n === 10) && [2, 4, 6, 8].includes(p)) ? 1 : 0) + (sup(mon) ? 1 : 0) + (sup(EL(other)) ? 1 : 0);
  }
  // 공망을 논하지 않는 경우(책): 그 자리에 일간이 있거나, 태왕(자리·월령·겸왕/수생 모두)할 때
  function kongFree(r, p, n) { if ((r.tagE[p] || []).includes('日干') || (r.tagH[p] || []).includes('日干')) return true; return numPower(r, n == null ? r.earthN[p] : n, p) >= 3; }
  // 七五九 삼살이 六을 생하는지 三을 충극하는지(책의 성립·생성 규칙 요약). made: 'set'(명국에 이미 성립) | 'new'(운에서 생성)
  const RING8 = [1, 8, 3, 4, 9, 2, 7, 6];
  function samsal(r, made) {
    const DP0 = dongPos(r), rel = relOf(r), at = n => DP0.filter(x => x.n === n).map(x => x.p);
    const p3 = at(3), p6 = at(6), p9 = at(9), ilP = new Set([...Object.keys(r.tagE || {}).filter(q => (r.tagE[q] || []).includes('日干')), ...Object.keys(r.tagH || {}).filter(q => (r.tagH[q] || []).includes('日干'))].map(Number));
    const near = (a, b) => a.some(x => b.some(y => x === y || Math.abs(RING8.indexOf(x) - RING8.indexOf(y)) % 6 === 1 || Math.abs(RING8.indexOf(x) - RING8.indexOf(y)) === 7));
    const il = ps => ps.some(q => ilP.has(q));
    if (!p3.length && !p6.length) return { t: 0, why: '三도 六도 없어 삼살 자체가 살성으로 작용' };
    if (!p3.length) return { t: 6, why: '삼살이 내 자식 六을 생(탐생망극)' };
    if (!p6.length) { if (rel(9) === '父' && subLq(9, r.se) === '편인' && r.se === 1) return { t: 'se', why: '三·六이 없어 편인 九가 世(一)를 생' }; return { t: 3, why: '六이 없어 삼살이 三을 충극' }; }
    if (rel(9) === '父' && subLq(9, r.se) === '정인' && r.se === 6) return { t: 6, why: '삼살 九가 정인이라 世(六)를 생' };
    if (il(p9)) return { t: 6, why: '삼살 九에 일간이 있어 충극보다 六 생을 택함' };
    const mid3 = p3.includes(5), mid6 = p6.includes(5);
    if (made === 'set') {
      if (mid3 && !mid6) return { t: 3, why: '중궁 三이 동처 六을 앗아가 삼살이 三을 충극' };
      if (il(p6) && !il(p3)) return { t: 6, why: '六에 일간이 있어 삼살이 六을 먼저 생' };
      if (il(p3) && near(p3, p6)) return { t: 3, why: '六 옆의 三이 일간이라 삼살이 三을 충극' };
      return near(p3, p6) ? { t: 3, why: '三과 六이 붙어 있어 삼살이 六을 앗아간 三을 충극' } : { t: 6, why: '三과 六이 떨어져 있어 삼살이 六을 생' };
    }
    if (mid3) return il([5]) ? { t: 3, why: '중궁 三에 일간이 있어 생성된 삼살이 三을 충극' } : { t: 6, why: '중궁 三이고 六이 동해 생성된 삼살이 六을 생' };
    if (near(p3, p6) && (il(p3) || il(p6))) return { t: 3, why: '三과 六이 붙어 있고 일간이 있어 생성된 삼살이 三을 충극' };
    return { t: 6, why: '생성된 삼살은 내 자식 六을 먼저 생' };
  }
  function dongNums(r) { if (r._dong) return r._dong; const S = new Set([r.earthN[5], r.heavN[5], r.earthN[r.sePal]]); for (const p of Object.keys(r.tagE || {})) S.add(r.earthN[p]); for (const j of junDong(r)) S.add(j.n); for (const t of touchul(r)) S.add(t.to); return (r._dong = S); }
  // 중궁 투출: 중궁 천지반에 二가 있으면 七, 四가 있으면 九가 투출(단 二六·四八로 충이면 투출 안 함)
  function touchul(r) { const a = r.earthN[5], b = r.heavN[5], o = []; if ((a === 2 || b === 2) && !((a === 2 && b === 6) || (a === 6 && b === 2))) o.push({ from: 2, to: 7 }); if ((a === 4 || b === 4) && !((a === 4 && b === 8) || (a === 8 && b === 4))) o.push({ from: 4, to: 9 }); return o; }
  const present = (r, n) => dongNums(r).has(n);
  // 삼합 성립: 세 수가 판에 있고, 종결수(왕지)가 모두 공망이면 불성립(그 자리에 日干이 있으면 성립)
  function sanOk(r, wang) { const w = where(r, wang); if (!w.length) return false; if (w.every(x => r.kong.has(x.p))) return w.some(x => x.tags.includes('日干')); return true; }
  function relations(r, X) {
    const out = [];
    for (const [a, b, c, el] of SAN) if ([a, b, c].includes(X)) { const o = [a, b, c].filter(n => n !== X); if (o.every(n => present(r, n)) && sanOk(r, b)) out.push({ type: '삼합', with: o, el, wang: b }); }
    for (const [a, b, c, el] of SAN) if ((X === a || X === b) && !out.some(q => q.type === '삼합' && q.wang === b)) { const o = X === a ? b : a; if (present(r, o)) out.push({ type: '반합', with: [o], el }); }
    for (const [a, b] of HE6) if (a === X || b === X) { const o = a === X ? b : a; if (o !== X && present(r, o)) out.push({ type: '육합', with: [o], el: HE6EL[he6Key(a, b)] }); }
    const sg = []; for (let n = 1; n <= 10; n++) if (n !== X && SHENG[EL(X)] === EL(n) && present(r, n)) sg.push(n); if (sg.length) out.push({ type: '생', with: sg, el: EL(sg[0]) });
    const kg = []; for (let n = 1; n <= 10; n++) if (n !== X && KE[EL(X)] === EL(n) && present(r, n)) kg.push(n); if (kg.length) out.push({ type: '충극', with: kg, el: EL(kg[0]) });
    return out;
  }
  // 선달: 합(삼합·반합·육합)을 먼저, 합이 없으면 생 / 후달: 선달 다음 순열(생, 생이 없으면 충극)
  function pickFor(rels, which) {
    const hap = rels.find(q => q.type !== '생' && q.type !== '충극'), sg = rels.find(q => q.type === '생'), kg = rels.find(q => q.type === '충극');
    if (which === 'first') return hap || sg || kg || null;
    if (which === 'second') { if (hap) return sg || kg || hap; return kg || sg || null; }
    return rels[0] || null;
  }
  // 한 수(달·나이)의 작용을 世 기준으로 판단: 점수(참고용)와 쉬운 설명
  const THEMEK = { 世: '나 자신', 父: '문서·도움·집', 兄: '사람·경쟁·지출', 孫: '자녀·재능·새 일', 財: '재물·사업', 官: '직장·명예', 鬼: '압박·관재·건강' };
  function judge(r, X, q, strong) {
    const rel = relOf(r), k = rel(X), good = kk => kk === '世' ? 1 : (strong === 'strong' ? { 父: 0, 兄: -1, 孫: 1, 財: 2, 官: 1, 鬼: -1 } : { 父: 2, 兄: 1, 孫: 0, 財: 0, 官: 0, 鬼: -2 })[kk];
    let s = good(k) * 0.5, txt = NUM[X] + '(' + (k === '世' ? '세기' : k) + ')';
    if (!q) { const ad = salAdj(r, X); return { s: s + (ad ? ad.s : 0), k, txt: txt + ' · 동처에 합·생·극할 짝이 없어 이 수 자체의 기운으로 봐요' + (ad ? ad.t : ''), rel: null }; }
    const ws = q.with.map(n => ({ n, k: rel(n) }));
    const hasSe = ws.some(w => w.k === '世');
    const wtxt = ws.map(w => NUM[w.n] + '(' + (w.k === '世' ? '세' : w.k) + ')').join('·');
    if (q.type === '충극') {
      if (hasSe) { s -= 2; txt += '가 ' + wtxt + '를 극 → 내가 눌리는 때'; }
      else { const w = ws[0]; s += w.k === '鬼' ? 0.5 : -0.5 - 0.3 * Math.max(0, good(w.k)); txt += '가 ' + wtxt + '를 극 → ' + THEMEK[w.k] + ' 일이 꺾이기 쉬움' + (w.k === '鬼' ? '(흉한 기운이 눌려 오히려 덜어짐)' : ''); }
    } else if (q.type === '생') {
      if (hasSe) { s += 1.5; txt += '가 ' + wtxt + '를 생 → 나를 도와주는 때'; }
      else { const w = ws[0]; s += 0.3 + 0.5 * good(w.k); txt += '가 ' + wtxt + '를 생 → ' + THEMEK[w.k] + ' 일이 힘을 받음'; }
    } else {
      if (hasSe || k === '世') { s += 2; txt += '가 ' + wtxt + jo3(wtxt) + ' ' + q.type + '(' + ELKO[q.el] + ') → 내가 ' + THEMEK[k === '世' ? ws[0].k : k] + ' 일과 맞물리는 때'; }
      else { const w = ws[0]; s += 0.3 + 0.5 * good(w.k); txt += '가 ' + wtxt + jo3(wtxt) + ' ' + q.type + '(' + ELKO[q.el] + ') → ' + THEMEK[k] + '·' + THEMEK[w.k] + ' 일이 엮임'; }
    }
    const ad = salAdj(r, X); if (ad) { s += ad.s; txt += ad.t; }
    return { s, k, txt, rel: q };
  }
  const jo3 = w => { const c = String(w).replace(/[^가-힣一-十]/g, '').slice(-1); return '와'; };
  const gradeOf = s => s >= 1.5 ? 2 : s >= 0.5 ? 1 : s <= -1 ? -1 : 0;
  // ── 살(七五九 삼살·三二九 삼형살·화금상전·자형·육파)과 살성 궁(도화·겁살·망신·역마) ──
  const BR_NUM = { 子: 1, 丑: 10, 寅: 3, 卯: 8, 辰: 5, 巳: 2, 午: 7, 未: 10, 申: 9, 酉: 4, 戌: 5, 亥: 6 };
  const SAL12 = { 申: 0, 子: 0, 辰: 0, 寅: 1, 午: 1, 戌: 1, 巳: 2, 酉: 2, 丑: 2, 亥: 3, 卯: 3, 未: 3 };
  const SAL12T = { 도화: ['酉', '卯', '午', '子'], 역마: ['寅', '申', '亥', '巳'], 겁살: ['巳', '亥', '寅', '申'], 망신: ['亥', '巳', '申', '寅'] };
  const SALMEAN = { 도화: '인기·이성·흥. 닿은 육친이 사람을 끌고 이성 인연이 많아요', 역마: '세마(년지 기준)는 먼 곳 이동·이사·여행, 일마(일지 기준)는 집 가까운 곳에서 분주함, 둘이 겹친 쌍역마는 매우 바쁨. 역마가 앉은 궁이 마궁(=천마)으로 해외·이민·유학·섬↔육지 이동을 뜻해요', 겁살: '성급함·구설·상처·수술. 길한 운에서는 약하게 지나가요', 망신: '망신·손실·갈등·근심. 겹치면 더 강해요' };
  function sals(r) {
    const D = dongNums(r), rel = relOf(r), out = [];
    const nk = n => NUM[n] + '(' + (rel(n) === '世' ? '세' : rel(n)) + ')';
    if ([7, 5, 9].every(n => D.has(n))) { const z = samsal(r, 'set'); out.push({ name: '七五九 삼살', bad: z.t !== 6 && z.t !== 'se', txt: z.why + (z.t === 6 ? ' → ' + nk(6) + ' 육친이 왕성해져요' : z.t === 3 ? ' → ' + nk(3) + ' 육친이 흉해요' : z.t === 'se' ? ' → 내가 힘을 얻어요' : ' → 대운·신수·달에서 재물·직장·건강을 조심해요. 격이 좋으면 약이 되기도 해요') }); }
    if ([3, 2, 9].every(n => D.has(n))) out.push({ name: '三二九 삼형살', bad: true, txt: nk(3) + ' 육친이 충극받아 흉해요. 世가 약하면 해가 되고, 왕하거나 격이 좋으면 도리어 권세·재물을 잡아요' });
    const HG = [[7, 9], [2, 9], [7, 4], [2, 4]];
    for (const p of ALL) { const a = r.earthN[p], b = r.heavN[p]; const h = HG.find(([x, y]) => (a === x && b === y) || (a === y && b === x)); if (h) { const metal = [a, b].find(n => n === 4 || n === 9); out.push({ name: '화금상전(' + NUM[h[0]] + NUM[h[1]] + ')', bad: true, txt: PK[p] + '의 천지반에서 불과 쇠가 싸워 ' + nk(metal) + ' 육친이 특히 흉해요(재물·이별·몸 상함)' }); } }
    for (const p of ALL) { const a = r.earthN[p], b = r.heavN[p]; if (a === b && [4, 6].includes(a)) out.push({ name: '자형살(' + NUM[a] + NUM[a] + ')', bad: true, txt: PK[p] + '의 ' + nk(a) + ' 육친에 시비·불화·상심이 생기기 쉬워요' }); }
    if (D.has(1) && D.has(8)) out.push({ name: '자형살(一八)', bad: true, txt: nk(1) + '과 ' + nk(8) + ' 사이에 시비·불화가 생기기 쉬워요' });
    for (const [a, b] of [[1, 4], [3, 6], [8, 7], [2, 9], [10, 5]]) if (D.has(a) && D.has(b)) out.push({ name: '육파살(' + NUM[a] + NUM[b] + ')', bad: true, light: true, txt: nk(a) + '·' + nk(b) + ' 사이에 어긋남과 불안정이 있어요' });
    for (const p of ALL) { const a = r.earthN[p]; if (a === r.heavN[p] && [5, 7, 9].includes(a)) out.push({ name: { 5: '천강살(五五)', 7: '형혹성(七七)', 9: '태백성(九九)' }[a], bad: true, txt: PK[p] + '의 ' + nk(a) + ' 육친에 ' + { 5: '불성취·나약·곤궁', 7: '구설·시끄러움·미혹', 9: '사고·수술·도난·풍파' }[a] + '이 따르기 쉬워요. 격이 좋으면 큰 권세·재물이 되기도 해요' }); }
    return out;
  }
  function salsung(r) {
    const rel = relOf(r), out = [];
    for (const [base, lab] of [[r.pillars[0][1], '년지'], [r.pillars[2][1], '일지']]) {
      const g = SAL12[base];
      for (const nm of ['도화', '역마', '겁살', '망신']) {
        const br = SAL12T[nm][g], n = BR_NUM[br], p = ({ 子: 1, 丑: 8, 寅: 8, 卯: 3, 辰: 4, 巳: 4, 午: 9, 未: 2, 申: 2, 酉: 7, 戌: 6, 亥: 6 })[br];
        const onE = ALL.filter(q => r.earthN[q] === n), onT = ALL.filter(q => (r.tagE[q] || []).length && r.earthN[q] === n);
        out.push({ nm: nm === '역마' ? (lab === '년지' ? '세마' : '일마') : nm, base: nm, lab, br, pal: p, n, k: rel(n), tags: onT.flatMap(q => r.tagE[q]), mean: SALMEAN[nm] });
      }
    }
    return out;
  }
  // 동처 기준 없는 육신: 없는 육신은 그 육신을 생하는 육신이 대신해요(연쇄)
  function missingLq(r) {
    const rel = relOf(r), D = dongNums(r), has = new Set();
    for (const n of D) { const k = rel(n); if (k === '世') continue; has.add(k === '鬼' ? '官' : k); }
    const ORD = ['父', '兄', '孫', '財', '官'], GEN = { 父: '官', 官: '財', 財: '孫', 孫: '兄', 兄: '父' }, KO = { 父: '인성', 兄: '비겁', 孫: '식상', 財: '재성', 官: '관귀' };
    const out = [];
    for (const k of ORD) if (!has.has(k)) { let s = GEN[k], g = 0; while (!has.has(s) && g++ < 5) s = GEN[s]; out.push({ k, ko: KO[k], sub: has.has(s) ? s : null, subKo: KO[s] }); }
    return out;
  }
  // 진용 후보: 동처의 수 가운데 삼합·반합·육합으로 용신의 오행을 더 왕성하게 하는 것(삼형살로 충극받는 三은 쓰지 않음)
  function jinyong(r, yong) {
    const rel = relOf(r), D = dongNums(r);
    const yN = [...D].filter(n => { const k = rel(n); return k === yong || (yong === '官' && k === '鬼'); });
    const yE = yN.length ? EL(yN[0]) : null; if (!yE) return { yE: null, cand: [] };
    const san3 = [3, 2, 9].every(n => D.has(n));
    const cand = [];
    for (const n of D) { if ((n === 3 && san3) || n === r.se) continue;
      for (const q of relations(r, n)) if ((q.type === '삼합' || q.type === '반합' || q.type === '육합') && q.el === yE && !yN.includes(n)) { cand.push({ n, k: rel(n), q }); break; } }
    if (yE === '水' && [7, 5, 9].every(n => D.has(n)) && !cand.some(c => c.n === 9)) cand.push({ n: 9, k: rel(9), q: { type: '七五九 삼살', with: [7, 5], el: '水' } });
    const pals = n => ALL.filter(p => r.earthN[p] === n && ((r.tagE[p] || []).length || p === 5 || p === r.sePal));
    return { yE, yN, cand: cand.map(c => Object.assign(c, { pals: pals(c.n).sort((a, b) => (a === 5) - (b === 5)) })) };
  }
  // 세부 육친: 음양이 같고 다름으로 비견/겁재, 편인/정인, 식신/상관, 편재/정재, 편관/정관
  function subLq(n, se) { const k = relOf({ se })(n); if (k === '世') return '세기'; const same = (n % 2) === (se % 2); return ({ 兄: same ? '비견' : '겁재', 父: same ? '편인' : '정인', 孫: same ? '식신' : '상관', 財: same ? '편재' : '정재', 官: '정관', 鬼: '편관' })[k]; }
  // 흐르는 수(나이·달)가 동처와 七五九 삼살·三二九 삼형살을 완성하면 그 작용을 더해요
  function salAdj(r, X) {
    const D = dongNums(r), rel = relOf(r), nk = n => NUM[n] + '(' + rel(n) + ')';
    const done = (set) => set.includes(X) && set.filter(n => n !== X).every(n => D.has(n));
    if (done([3, 2, 9])) return { s: -1.5, t: ' · 三二九 삼형살이 이뤄져 ' + nk(3) + ' 육친이 흉' };
    if (done([7, 5, 9])) { const z = samsal(r, 'new'); return z.t === 6 ? { s: 0.5, t: ' · 七五九 삼살 — ' + z.why + ', ' + nk(6) + ' 육친이 힘을 얻음' } : z.t === 3 ? { s: -1, t: ' · 七五九 삼살 — ' + z.why + ', ' + nk(3) + ' 육친이 흉' } : z.t === 'se' ? { s: 0.5, t: ' · 七五九 삼살 — ' + z.why } : { s: -1, t: ' · 七五九 삼살(살성) — 재물·건강 조심' }; }
    return null;
  }
  // 원국비기: 나이 → 홍국수(끝자리, 十은 0), 45세까지 지반·46세부터 천반 / 달: 그 수부터 1월, 지반은 순행(수+1), 천반은 역행(수−1), 11·12월은 1·2월 자리
  function wonbi(r, age, strong) {
    const dong = [...dongNums(r)].sort((a, b) => a - b);
    const X = age % 10 === 0 ? 10 : age % 10, heav = age >= 46, plate = heav ? r.heavN : r.earthN;
    const pals = ALL.filter(p => plate[p] === X);
    const rels = relations(r, X), q = pickFor(rels, 'all'), j = judge(r, X, q, strong);
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const step = m <= 10 ? m - 1 : m - 11;
      const n = w10(heav ? X - step : X + step);
      const which = (m === 1 || m === 2) ? 'first' : (m === 11 || m === 12) ? 'second' : 'all';
      const rl = relations(r, n), qq = pickFor(rl, which), jj = judge(r, n, qq, strong);
      months.push({ m, n, which, k: jj.k, txt: jj.txt, g: gradeOf(jj.s), s: jj.s });
    }
    return { age, X, heav, pals, rels, j, g: gradeOf(j.s), months, dong };
  }
  const w10 = n => ((n - 1) % 10 + 10) % 10 + 1;
  // 원국비기 일운: 그 달(절기 기준 寅월=1월)의 절입일을 그 달의 수로 두고, 지반(45세까지)은 하루에 수 +1(순행), 천반(46세부터)은 −1(역행)
  function wonbiDay(r, y, m, d, strong) {
    const SL = (typeof Solar !== 'undefined' ? Solar : root.Solar);
    const sol = SL.fromYmd(y, m, d), l = sol.getLunar();
    const idx = '寅卯辰巳午未申酉戌亥子丑'.indexOf(l.getMonthZhiExact()) + 1;
    const yy = (m <= 2 && idx >= 11) ? y - 1 : y, age = yy - r.input.y + 1;
    const w = wonbi(r, Math.max(1, age), strong), mn = w.months[idx - 1].n;
    const jq = l.getPrevJie(), js = jq.getSolar();
    const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(js.getYear(), js.getMonth() - 1, js.getDay())) / 86400000);
    const n = w10(w.heav ? mn - days : mn + days);
    const jj = judge(r, n, pickFor(relations(r, n), 'all'), strong);
    return { age, idx, mn, jie: jq.getName(), jieYmd: js.toYmd(), days, n, k: jj.k, txt: jj.txt, g: gradeOf(jj.s), heav: w.heav };
  }
  // ── 신수(한 해) 풀이 ── rs: 신수국(년주=당년 태세), age: 그해 세는나이
  const MONTH_PAL = { 1: 8, 2: 3, 3: 4, 4: 4, 5: 9, 6: 2, 7: 2, 8: 7, 9: 6, 10: 6, 11: 1, 12: 8 };
  function yearly(rs, sex, age) {
    const base = interpret(rs, sex, age);
    const se = rs.se, seE = EL(se), sp = rs.sePal;
    const rel = n => { const a = EL(n); if (a === seE) return '兄'; if (SHENG[a] === seE) return '父'; if (SHENG[seE] === a) return '孫'; if (KE[seE] === a) return '財'; return (n % 2) !== (se % 2) ? '官' : '鬼'; };
    const relWith = (a, b) => { const o = []; if (pairIn(HE6, a, b)) o.push('육합'); if (pairIn(CHONG, a, b)) o.push('충'); return o; };
    const strong = base.strong;
    const good = k => strong === 'strong' ? { 父: 0, 兄: -1, 孫: 1, 財: 2, 官: 1, 鬼: -1 }[k] : { 父: 2, 兄: 1, 孫: 0, 財: 0, 官: 0, 鬼: -2 }[k];
    const THEME = { 父: '문서·계약·이사·시험', 兄: '사람·경쟁·지출', 孫: '자녀·새 일·재능 발휘', 財: '재물·사업' + (sex === 'M' ? '·이성' : ''), 官: '직장·승진·명예' + (sex === 'F' ? '·이성' : ''), 鬼: '압박·구설·건강' };
    const out = { total: [], field: [], hang: [], months: [] };
    const top = rel(rs.heavN[sp]), mid = rel(rs.heavN[5]), midE = rel(rs.earthN[5]);
    const topTxt = { 兄: '世궁 천반이 같은 기운이라 한 해 동안 내 힘이 받쳐 줘요(겸왕).', 父: '世궁 천반이 世를 생해 도움과 보호를 받는 해예요(수생).', 孫: '世궁 천반이 孫이라 힘을 밖으로 쓰는 해예요. 새 일과 표현이 늘지만 지치기 쉬워요.', 財: '世궁 천반이 財라 돈과 실속을 쫓아 움직이는 해예요.', 官: '世궁 천반이 官이라 책임과 일이 늘어나는 해예요.', 鬼: '世궁 천반이 鬼라 압박과 신경 쓸 일이 생기기 쉬운 해예요.' };
    out.total.push(rs.pillars[0] + '년 신수는 ' + base.strongKo + '이에요. ' + topTxt[top]);
    out.total.push('중궁(그해의 중심 기운)은 지반 ' + LQKO[midE] + ', 천반 ' + ira(LQKO[mid]) + '서 ' + THEME[midE] + ' 쪽 일이 한 해의 중심이 돼요.');
    if (rs.kong.has(sp)) out.total.push('世궁이 공망이라 계획이 헛돌기 쉬워요. 큰 결정은 서두르지 마세요.');
    const g = base.cnt;
    // 분야별
    const near = k => [rs.heavN[sp], rs.earthN[5], rs.heavN[5]].some(n => rel(n) === k);
    if (near('財')) out.field.push('재물 · 世궁과 중궁에 財가 닿아 돈이 들어오는 기회가 있어요.' + (strong === 'weak' ? ' 다만 世가 약해 무리한 투자는 피하세요.' : ''));
    else if (g.兄 >= 4) out.field.push('재물 · 兄이 많아 나가는 돈이 많은 해예요. 보증·빌려주는 돈은 피하세요.');
    else out.field.push('재물 · 큰 변동 없이 들어온 만큼 쓰는 해예요. 아껴 모으면 남아요.');
    if (near('官')) out.field.push('직장 · 官이 世 가까이에 있어 승진·이직·자리 이동의 기회가 있어요.');
    else if (near('鬼')) out.field.push('직장 · 鬼가 가까워 윗사람·조직과의 마찰, 업무 압박을 조심하세요.');
    else out.field.push('직장 · 자리에서 큰 변동은 적은 편이에요.');
    if (near('父')) out.field.push('문서 · 계약·이사·시험·자격 같은 문서 일이 생기고 잘 풀려요.');
    const spK = sex === 'F' ? ['官', '鬼'] : ['財'];
    const spHe = [1, 2, 3, 4, 5, 6, 7, 8, 9].some(p => [rs.earthN[p], rs.heavN[p]].some(n => spK.includes(rel(n)) && relWith(n, se).includes('육합')));
    if (spHe) out.field.push('이성 · 배우자를 뜻하는 수가 世와 합이라 인연이 생기거나 부부 사이가 가까워지는 해예요.');
    const sal = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(p => rs.earthN[p] === rs.heavN[p] && [5, 7, 9].includes(rs.earthN[p]));
    if (near('鬼') || sal.includes(sp) || sal.includes(5)) out.field.push('건강 · ' + (sal.length ? '삼살성(' + sal.map(p => NUM[rs.earthN[p]] + NUM[rs.earthN[p]]).join('·') + ')이 있어 ' : '') + '사고·수술·과로를 조심하세요. ' + ORGAN[seE] + ' 쪽을 챙기세요.');
    else out.field.push('건강 · 큰 걱정은 적어요. ' + ORGAN[seE] + ' 쪽만 평소처럼 챙기세요.');
    // 행년: 나이 끝자리 수(十은 10)를 45세까지 지반, 46세부터 천반에서 찾고, 그 궁의 천반 수로 봐요
    const tn = age % 10 === 0 ? 10 : age % 10, src = age <= 45 ? rs.earthN : rs.heavN;
    let hp = [1, 2, 3, 4, 6, 7, 8, 9, 5].find(p => src[p] === tn);
    if (!hp) hp = [1, 2, 3, 4, 6, 7, 8, 9, 5].find(p => src[p] === (tn > 5 ? tn - 5 : tn + 5)) || 5;
    const hn = rs.heavN[hp], hk = rel(hn), hr = relWith(hn, se);
    out.hangPal = hp;
    out.hang.push(age + '세 행년궁은 ' + PK[hp] + '이고, 그 천반 수는 ' + NUM[hn] + '(' + hk + ')예요. 올해 큰일은 ' + THEME[hk] + ' 쪽에서 일어나기 쉬워요.' + (hr.length ? ' 世와 ' + hr.join('·') + (hr.includes('육합') ? '이라 좋은 쪽으로 풀려요.' : '이라 부딪힘이 있어요.') : ''));
    // 월운
    for (let m = 1; m <= 12; m++) {
      const p = MONTH_PAL[m], n = rs.heavN[p], k = rel(n), rw = relWith(n, se);
      // 운곡 신수비기: 천반 수로 보고, 한 궁을 쓰는 두 달은 앞 달(12·3·6·9월)=합(없으면 생), 뒤 달(1·4·7·10월)=그다음 순서(생, 없으면 충극)
      const which = [12, 3, 6, 9].includes(m) ? 'first' : [1, 4, 7, 10].includes(m) ? 'second' : 'all';
      const jj = judge(rs, n, pickFor(relations(rs, n), which), strong);
      const gr = gradeOf(jj.s - (rs.kong.has(p) ? 0.5 : 0));
      out.months.push({ m, p, n, k: n === se ? '世' : k, theme: n === se ? '나 자신·건강·독립' : THEME[k], rw, g: gr, which, rtxt: jj.txt });
    }
    const best = out.months.filter(x => x.g >= 2).map(x => x.m + '월'), worst = out.months.filter(x => x.g <= -1).map(x => x.m + '월');
    if (best.length) out.total.push('좋은 달은 음력 ' + best.join('·') + '이에요.');
    if (worst.length) out.total.push('조심할 달은 음력 ' + worst.join('·') + '이에요.');
    return { base, out };
  }

  // ── 일진 ── rs: 그날이 속한 해의 신수국, gz: 그날 일진(예: '丙午'), r0: 원명국
  const ZN = { 子: 1, 丑: 10, 寅: 3, 卯: 8, 辰: 5, 巳: 2, 午: 7, 未: 10, 申: 9, 酉: 4, 戌: 5, 亥: 6 };
  const GNUM = { 甲: 3, 乙: 8, 丙: 7, 丁: 2, 戊: 5, 己: 10, 庚: 9, 辛: 4, 壬: 1, 癸: 6 };
  const BPAL = { 子: 1, 丑: 8, 寅: 8, 卯: 3, 辰: 4, 巳: 4, 午: 9, 未: 2, 申: 2, 酉: 7, 戌: 6, 亥: 6 };
  const DIRK = { 1: '북', 2: '남서', 3: '동', 4: '남동', 6: '북서', 7: '서', 8: '북동', 9: '남' };
  const ZKO = { 子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사', 午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해' };
  const NKO = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];
  const eun = w => w + (bat(w) ? '은' : '는');
  function daily(rs, r0, gz, sex, strongHint) {
    const se = rs.se, seE = EL(se);
    const rel = n => { const a = EL(n); if (a === seE) return '兄'; if (SHENG[a] === seE) return '父'; if (SHENG[seE] === a) return '孫'; if (KE[seE] === a) return '財'; return (n % 2) !== (se % 2) ? '官' : '鬼'; };
    const strong = strongHint || 'mid';
    const good = k => strong === 'strong' ? { 父: 0, 兄: -1, 孫: 1, 財: 2, 官: 1, 鬼: -1 }[k] : strong === 'weak' ? { 父: 2, 兄: 1, 孫: 0, 財: 0, 官: 0, 鬼: -2 }[k] : { 父: 1, 兄: 0, 孫: 1, 財: 1, 官: 1, 鬼: -1 }[k];
    const bn = ZN[gz[1]], gn = GNUM[gz[0]], k = rel(bn), kg = rel(gn);
    const p = BPAL[gz[1]], hn = rs.heavN[p], kh = rel(hn);
    const rw = []; if (pairIn(HE6, bn, se)) rw.push('육합'); if (pairIn(CHONG, bn, se)) rw.push('충');
    const dayZhi0 = r0.pillars[2][1], zchong = ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'].some(x => x.includes(dayZhi0) && x.includes(gz[1]) && dayZhi0 !== gz[1]);
    let g = good(k) + good(kh) * 0.5; if (rw.includes('육합')) g += 1; if (rw.includes('충')) g -= 1; if (zchong) g -= 0.5; if (rs.kong.has(p)) g -= 0.5;
    const DAY = {
      父: '도움과 문서의 날. 계약·서류·공부·윗사람 부탁이 잘 풀려요.',
      兄: '사람의 날. 친구·동료와 어울리기 좋지만 돈은 나가기 쉬워요.',
      孫: '표현과 실행의 날. 새 일을 시작하거나 재능을 보여 주기 좋아요.',
      財: '실속의 날. 돈 거래·장보기·영업에 좋아요' + (sex === 'M' ? ', 이성 인연도 생겨요.' : '.'),
      官: '책임의 날. 일이 몰리지만 인정받을 기회가 있어요' + (sex === 'F' ? ', 이성 인연도 생겨요.' : '.'),
      鬼: '조심의 날. 구설·다툼·사고에 주의하고 무리하지 마세요.'
    };
    const lines = [gz + '일이에요. 일진 지지 ' + gz[1] + '(' + ZKO[gz[1]] + ')를 홍국수로 바꾸면 ' + NUM[bn] + '이고, 世(' + NUM[se] + ')에게는 ' + k + '(' + LQKO[k] + ')에 해당해요. ' + DAY[k]];
    lines.push('일진 천간 ' + gz[0] + '의 수는 ' + NUM[gn] + ', ' + kg + '(' + LQKO[kg] + ')의 기운을 더해요.');
    lines.push(gz[1] + '의 자리인 ' + PK[p] + ' 천반은 ' + NUM[hn] + ', ' + kh + '(' + LQKO[kh] + ')에 해당해서 그날 ' + { 父: '문서·도움', 兄: '사람·경쟁', 孫: '새 일·자녀', 財: '돈·실속', 官: '일·직장', 鬼: '걱정거리' }[kh] + ' 쪽 일이 눈에 띄어요.');
    if (rw.includes('육합')) lines.push('일진이 世와 육합이라 사람과 일이 순하게 맞아떨어져요.');
    if (rw.includes('충')) lines.push('일진이 世와 충이라 계획이 틀어지거나 부딪힘이 생기기 쉬워요.');
    if (zchong) lines.push('태어난 날의 지지(' + dayZhi0 + ')와 충하는 날이라 이동·변동이 생기기 쉬워요.');
    if (rs.kong.has(p)) lines.push('그날 자리가 공망이라 기대한 만큼 결과가 남지 않을 수 있어요.');
    // 길한 방위: 世를 돕는 수(약하면 父·兄, 강하면 財·孫)가 천반에 있는 궁
    const want = strong === 'weak' ? ['父', '兄'] : strong === 'strong' ? ['財', '孫', '官'] : ['父', '財', '孫'];
    const dirs = [1, 2, 3, 4, 6, 7, 8, 9].filter(q => want.includes(rel(rs.heavN[q])) && !rs.kong.has(q)).map(q => DIRK[q]);
    if (dirs.length) lines.push('도움 되는 방향은 ' + dirs.slice(0, 3).join('·') + '쪽이에요.');
    return { gz, g, k, p, lines, summary: DAY[k] };
  }

  const api = { interpret, yearly, daily, relations, pickFor, judge, wonbi, gradeOf, sals, salsung, missingLq, jinyong, subLq, dongNums, junDong, wonbiDay, touchul };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Haeseok = api;
})(typeof window !== 'undefined' ? window : globalThis);
