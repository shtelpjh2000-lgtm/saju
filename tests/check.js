// 한 번에 검사: node tests/check.js
// 1) 운곡 화면 15개 명국 값이 그대로인지  2) 무작위 500명 풀이에 오류·깨진 글자가 없는지
const { calc, Haeseok } = require('./load');
const S = require('./screens.json');
let diff = 0, cells = 0;
for (const s of S) {
  const r = calc(s.y, s.m, s.d, s.h, s.mi), e = s.expect;
  const got = { pillars: r.pillars, ju: (r.yang ? '陽' : '陰') + r.ju, jq: r.jqHanja, yuan: r.yuanName, sePal: r.sePal };
  for (const k of Object.keys(e)) {
    if (typeof e[k] === 'object' && !Array.isArray(e[k])) {
      for (const p of Object.keys(e[k])) { cells++; const a = JSON.stringify(e[k][p]), b = JSON.stringify(r[k][p] === undefined ? null : r[k][p]); if (a !== b) { diff++; if (diff <= 10) console.log('✗', s.no + '번', s.y + '.' + s.m + '.' + s.d, k, p + '궁', '기대', a, '지금', b); } }
    } else { cells++; if (JSON.stringify(e[k]) !== JSON.stringify(got[k])) { diff++; console.log('✗', s.no + '번', k, '기대', e[k], '지금', got[k]); } }
  }
}
console.log((diff ? '❌' : '✅') + ' 운곡 화면 대조: ' + (cells - diff) + '/' + cells + ' 일치');
let bad = 0;
for (let i = 0; i < 500; i++) {
  const y = 1930 + (i * 37) % 90, m = 1 + (i * 7) % 12, d = 1 + (i * 11) % 28, h = (i * 5) % 24, mi = (i * 13) % 60, sex = i % 2 ? 'M' : 'F';
  try {
    const r = calc(y, m, d, h, mi); r.input = { y, m, d, h, mi, sex };
    const age = 2026 - y + 1, x = Haeseok.interpret(r, sex, age);
    const ry = calc(y, m, d, h, mi, { yearGZ: '丙午' }); ry.input = r.input;
    const yy = Haeseok.yearly(ry, sex, age); Haeseok.wonbi(r, age, x.strong); Haeseok.sals(r);
    const txt = JSON.stringify([x.S, x.HL, yy.out]);
    if (/undefined|NaN/.test(txt)) { bad++; if (bad <= 3) console.log('✗ 깨진 글자', y, m, d, h, txt.match(/.{40}(undefined|NaN).{10}/)[0]); }
  } catch (e) { bad++; if (bad <= 3) console.log('✗ 오류', y, m, d, h, e.message); }
}
console.log((bad ? '❌' : '✅') + ' 풀이 500명: 문제 ' + bad + '건');
process.exit(diff || bad ? 1 : 0);
