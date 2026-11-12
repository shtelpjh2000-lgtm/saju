/* 홍연기문(洪烟奇門) 원명국 계산 엔진
 * 운곡 홍기문둔갑 프로그램 화면(1984-05-22 戊戌시, 1965-09-01 己未시)과 대조해 맞춘 규칙.
 * 브라우저: window.Gimun / Node: module.exports  — lunar-javascript(Solar) 필요
 */
(function (root) {
  const GAN = '甲乙丙丁戊己庚辛壬癸', ZHI = '子丑寅卯辰巳午未申酉戌亥';
  const ES = '戊己庚辛壬癸丁丙乙';
  const JU = {冬至:[1,7,4],小寒:[2,8,5],大寒:[3,9,6],立春:[8,5,2],雨水:[9,6,3],惊蛰:[1,7,4],春分:[3,9,6],清明:[4,1,7],谷雨:[5,2,8],立夏:[4,1,7],小满:[5,2,8],芒种:[6,3,9],夏至:[9,3,6],小暑:[8,2,5],大暑:[7,1,4],立秋:[2,5,8],处暑:[1,4,7],白露:[9,3,6],秋分:[7,1,4],寒露:[6,9,3],霜降:[5,8,2],立冬:[6,9,3],小雪:[5,8,2],大雪:[4,7,1]};
  const YANG = new Set(['冬至','小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种']);
  const ALIAS = {DONG_ZHI:'冬至',XIAO_HAN:'小寒',DA_HAN:'大寒',LI_CHUN:'立春',YU_SHUI:'雨水',JING_ZHE:'惊蛰',DA_XUE:'大雪','驚蟄':'惊蛰','穀雨':'谷雨','小滿':'小满','芒種':'芒种','處暑':'处暑'};
  const JQ_HANJA = {惊蛰:'驚蟄',谷雨:'穀雨',小满:'小滿',芒种:'芒種',处暑:'處暑'};
  const JQ_KO = {冬至:'동지',小寒:'소한',大寒:'대한',立春:'입춘',雨水:'우수',惊蛰:'경칩',春分:'춘분',清明:'청명',谷雨:'곡우',立夏:'입하',小满:'소만',芒种:'망종',夏至:'하지',小暑:'소서',大暑:'대서',立秋:'입추',处暑:'처서',白露:'백로',秋分:'추분',寒露:'한로',霜降:'상강',立冬:'입동',小雪:'소설',大雪:'대설'};
  const RING = [1, 8, 3, 4, 9, 2, 7, 6];            // 시계방향 8궁
  const STAR = {1:'蓬',2:'芮',3:'沖',4:'輔',5:'禽',6:'心',7:'柱',8:'任',9:'英'};
  const DOOR = {1:'休',2:'死',3:'傷',4:'杜',6:'開',7:'驚',8:'生',9:'景'};
  const GOD_Y = ['直符','螣蛇','太陰','六合','勾陳','朱雀','九地','九天'];
  const GOD_N = ['直符','螣蛇','太陰','六合','白虎','玄武','九地','九天'];
  const TAIYI = ['太乙','攝提','軒轅','招搖','天符','靑龍','咸池','太陰','天乙'];
  const GUA = ['生氣','天宜','絶體','遊魂','禍害','福德','絶命','歸魂'];
  const FLIP = [2, 1, 0, 1, 2, 1, 0, 1];             // 上中下中上中下中 (비트 index: 0=下 1=中 2=上)
  const TRI = {6:[1,1,1],7:[1,1,0],9:[1,0,1],3:[1,0,0],4:[0,1,1],1:[0,1,0],8:[0,0,1],2:[0,0,0]};
  const BR_PAL = {子:1,丑:8,寅:8,卯:3,辰:4,巳:4,午:9,未:2,申:2,酉:7,戌:6,亥:6};
  const XUN_DUN = {0:'戊',10:'己',8:'庚',6:'辛',4:'壬',2:'癸'};
  const EL = n => ['水','火','木','金','土'][(n - 1) % 5];   // 1,6水 2,7火 3,8木 4,9金 5,10土
  const SHENG = {水:'木',木:'火',火:'土',土:'金',金:'水'};
  const KE = {水:'火',火:'金',金:'木',木:'土',土:'水'};
  const md = (a, n) => ((a % n) + n) % n;
  const w10 = n => md(n - 1, 10) + 1;                // 1..10
  const w9 = n => md(n - 1, 9) + 1;                  // 1..9

  function liuqin(n, se) {
    if (n === se) return '世';
    const a = EL(n), b = EL(se);
    if (a === b) return '兄';
    if (SHENG[a] === b) return '父';
    if (SHENG[b] === a) return '孫';
    if (KE[b] === a) return '財';
    return (n % 2) !== (se % 2) ? '官' : '鬼';
  }

  // 시각 → 사주. opt.adjust: 분 단위 보정(한국 표준시 -30, 서머타임 -60 등)
  function pillars(Solar, y, m, d, h, mi, adjust) {
    const t = new Date(Date.UTC(y, m - 1, d, h, mi) + (adjust || 0) * 60000);
    const s = Solar.fromYmdHms(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), 0);
    const l = s.getLunar();
    return { solar: s, lunar: l, year: l.getYearInGanZhiByLiChun(), month: l.getMonthInGanZhiExact(), day: l.getDayInGanZhiExact(), hour: l.getTimeInGanZhi() };
  }

  // ── 치윤법(초신접기): 상원 부두(甲子·己卯·甲午·己酉일)로 시작하는 15일마다 절기를 하나씩 배정하고,
  //    부두가 절기보다 9일 이상 앞서면(초신) 망종·대설에서 윤국을 둬요. 운곡 프로그램의 국과 맞추기 위한 방식이에요.
  const JQ_CACHE = {};
  const dnum = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / 86400000);
  function termList(Solar, y) {
    const key = y; if (JQ_CACHE[key]) return JQ_CACHE[key];
    const seen = new Map();
    for (let yy = y - 12; yy <= y + 1; yy++) {
      const t = Solar.fromYmd(yy, 6, 1).getLunar().getJieQiTable();
      for (const k in t) { const nm = ALIAS[k] || k; if (!JU[nm]) continue; const so = t[k]; const dn = dnum(so.getYear(), so.getMonth(), so.getDay()); if (!seen.has(dn)) seen.set(dn, nm); }
    }
    const list = [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([dn, nm]) => ({ dn, nm }));
    return (JQ_CACHE[key] = list);
  }
  function zhirunTerm(Solar, P) {
    const so = P.solar, extra = P.lunar.getDayInGanZhiExact() !== P.lunar.getDayInGanZhi() ? 1 : 0;
    const D = dnum(so.getYear(), so.getMonth(), so.getDay()) + extra;
    const s0 = GAN.indexOf(P.day[0]), z0 = ZHI.indexOf(P.day[1]), gi = md(6 * s0 - 5 * z0, 60);
    const T = termList(Solar, so.getYear());
    let U = D - (gi % 15); while (U - 15 > T[0].dn + 20) U -= 15;   // 가장 이른 블록부터
    let j = T.findIndex(t => t.dn >= U - 5);
    while (U + 15 <= D) {
      const chao = T[j].dn - U;
      if ((T[j].nm === '芒种' || T[j].nm === '大雪') && chao >= 9) { /* 윤국: 같은 절기를 한 번 더 */ }
      else j++;
      U += 15;
    }
    return T[j].nm;
  }
  function calc(Solar, y, m, d, h, mi, opt) {
    opt = opt || {};
    const P = pillars(Solar, y, m, d, h, mi, opt.adjust);
    const cols = [opt.yearGZ || P.year, P.month, P.day, P.hour];
    const sN = cols.map(c => GAN.indexOf(c[0]) + 1), bN = cols.map(c => ZHI.indexOf(c[1]) + 1);
    // ── 홍국수 ──
    const X = w9(bN.reduce((a, b) => a + b, 0));    // 지반 중궁수 (五여도 그대로 궁번호+5 — 운곡 프로그램 1975.4.10·1975.10.10 화면 대조)
    const Y = w9(sN.reduce((a, b) => a + b, 0));    // 천반 중궁수
    const earthN = {5: X}, heavN = {5: Y};
    for (const p of [1, 2, 3, 4, 6, 7, 8, 9]) { earthN[p] = w10(X + p); heavN[p] = w10(Y - p); }
    // ── 연국(시가) ──
    let jq = zhirunTerm(Solar, P);
    if (!JU[jq]) throw new Error('절기 이름을 확인하지 못했어요: ' + jq);
    const ds = GAN.indexOf(P.day[0]), dz = ZHI.indexOf(P.day[1]);
    const hs = GAN.indexOf(P.hour[0]), hz = ZHI.indexOf(P.hour[1]);
    const fz = md(dz - ds % 5, 12), yuan = [0, 3, 6, 9].includes(fz) ? 0 : [2, 5, 8, 11].includes(fz) ? 1 : 2;
    const ju = JU[jq][yuan], yang = YANG.has(jq);
    const earthS = {};
    for (let i = 0; i < 9; i++) earthS[yang ? w9(ju + i) : w9(ju - i)] = ES[i];
    const palOf = c => +Object.keys(earthS).find(p => earthS[p] === c);
    const z0 = md(hz - hs, 12), dun = XUN_DUN[z0];
    const fp0 = palOf(dun), fp = fp0 === 5 ? 2 : fp0;
    const hp0 = palOf(hs === 0 ? dun : GAN[hs]), HP = hp0 === 5 ? 2 : hp0;
    const iR = p => RING.indexOf(p), sh = iR(HP) - iR(fp);
    const heavS = {}, star = {}, door = {}, god = {}, taiyi = {}, gua = {};
    RING.forEach((p, j) => {
      const o = RING[md(j - sh, 8)];
      heavS[p] = (o === 2 && fp0 === 5) ? earthS[5] : earthS[o];
      star[p] = '天' + STAR[o];
    });
    const L0 = yang ? w9(fp0 + hs) : w9(fp0 - hs), L = L0 === 5 ? 2 : L0, sd = iR(L) - iR(fp);
    RING.forEach((p, j) => { door[p] = DOOR[RING[md(j - sd, 8)]] + '門'; });
    (yang ? GOD_Y : GOD_N).forEach((g, k) => { god[RING[md(iR(HP) + (yang ? k : -k), 8)]] = g; });
    // 태을구성: 일진의 육십갑자 순번(g)으로 太乙 자리를 정해요 — 양둔 8+g 순행, 음둔 2−g 역행(운곡 프로그램 13개 화면과 대조)
    const gD = md(6 * ds - 5 * dz, 60), ts = yang ? w9(8 + gD) : w9(2 - gD);
    TAIYI.forEach((n, k) => { taiyi[yang ? w9(ts + k) : w9(ts - k)] = n; });
    // ── 世 · 육친 ──
    const sePal = BR_PAL[P.day[1]], se = earthN[sePal];
    const findHeav = n => {
      for (const p of [1, 2, 3, 4, 6, 7, 8, 9, 5]) if (heavN[p] === n) return p;
      for (const p of [1, 2, 3, 4, 6, 7, 8, 9, 5]) if (heavN[p] === w10(n + 5)) return p;
      return 5;
    };
    const seHeavPal = findHeav(se);
    const lqE = {}, lqH = {};
    for (let p = 1; p <= 9; p++) { lqE[p] = liuqin(earthN[p], se); lqH[p] = liuqin(heavN[p], se); }
    lqE[sePal] = '世'; lqH[seHeavPal] = '世';
    for (let p = 1; p <= 9; p++) { if (p !== sePal && lqE[p] === '世') lqE[p] = '兄'; if (p !== seHeavPal && lqH[p] === '世') lqH[p] = '兄'; }
    // ── 12운성: 世(지반) 홍국수의 오행을 양간식(土는 火와 같이)으로 12지지에 돌려요. 두 지지 궁은 [四生, 四庫] 순.
    //    운곡 프로그램 화면(世 二·三·七·十·一)과 대조
    const UN12 = '生浴帶祿旺衰病死墓絶胎養', UN_START = {水: 8, 木: 11, 火: 2, 土: 2, 金: 5};
    const PAL_BR = {1: ['子'], 2: ['申', '未'], 3: ['卯'], 4: ['巳', '辰'], 6: ['亥', '戌'], 7: ['酉'], 8: ['寅', '丑'], 9: ['午']};
    const unseong = {};
    for (const p in PAL_BR) unseong[p] = PAL_BR[p].map(z => UN12[md(ZHI.indexOf(z) - UN_START[EL(se)], 12)]);
    // ── 팔괘(생기복덕) ── 지반 중궁 홍국수 번호의 궁이 본괘(歸魂), 중궁수가 五면 손궁(운곡 프로그램 15개 화면과 대조)
    const gb = earthN[5] === 5 ? 4 : earthN[5];
    let bits = TRI[gb].slice();
    const triPal = b => +Object.keys(TRI).find(k => TRI[k].join() === b.join());
    FLIP.forEach((f, k) => { bits[f] ^= 1; gua[triPal(bits)] = GUA[k]; });
    // ── 사주 위치 표시(지반/천반) ──
    const tagE = {}, tagH = {};
    const add = (o, p, t) => { (o[p] = o[p] || []).push(t); };
    const names = ['年', '月', '日', '時'];
    cols.forEach((c, i) => {
      const sp = palOf(c[0] === '甲' ? XUN_DUN[ZHI.indexOf(c[1])] : c[0]);
      add(tagE, sp, names[i] + '干'); add(tagH, findHeav(earthN[sp]), names[i] + '干');
      if (i !== 2) { const bp = BR_PAL[c[1]]; add(tagE, bp, names[i] + '支'); add(tagH, findHeav(earthN[bp]), names[i] + '支'); }
    });
    // ── 공망(일주 旬空) ──
    const zd = md(dz - ds, 12), kongZ = [ZHI[md(zd + 10, 12)], ZHI[md(zd + 11, 12)]];
    const kong = new Set(kongZ.map(z => BR_PAL[z]));
    // ── 대운 나이 ── 1~45 지반 순행, 46~90 천반 역행, 世궁(지반)에서 시작. 十은 판에 없는 수만큼.
    const missing = o => { const v = new Set(Object.values(o)); for (let n = 1; n <= 9; n++) if (!v.has(n)) return n; return 1; };
    const mE = missing(earthN), mH = missing(heavN);
    const ageE = {}, ageH = {};
    let a = 1;
    for (let k = 0; k < 9; k++) { const p = w9(sePal + k), n = earthN[p] === 10 ? mE : earthN[p]; ageE[p] = [a, a + n - 1]; a += n; }
    a = 46;
    for (let k = 0; k < 9; k++) { const p = w9(sePal - k), n = heavN[p] === 10 ? mH : heavN[p]; ageH[p] = [a, a + n - 1]; a += n; }
    return {
      pillars: cols, solar: P.solar.toYmdHms ? P.solar.toYmdHms() : '', lunarText: P.lunar.toString(), lunarYmd: [P.lunar.getYear(), P.lunar.getMonth(), P.lunar.getDay()],
      jq, jqKo: JQ_KO[jq], jqHanja: JQ_HANJA[jq] || jq, yang, ju, yuan, yuanName: ['上元', '中元', '下元'][yuan],
      X, Y, earthN, heavN, earthS, heavS, star, door, god, taiyi, gua, lqE, lqH, unseong,
      sePal, seHeavPal, se, tagE, tagH, kong, kongZ, ageE, ageH, zhifuPal: HP, zhishiPal: L, xun: '甲' + ZHI[z0], dun
    };
  }

  const api = { calc, pillars, liuqin, EL, BR_PAL, JQ_KO };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Gimun = api;
})(typeof window !== 'undefined' ? window : globalThis);
