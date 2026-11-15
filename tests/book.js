// 「기문둔갑 원칙」 PDF 그림 속 예시 명국과 책의 결론을 앱이 따르는지: node tests/book.js
const { calc, Haeseok: H } = require('./load');
const C = require('./book-cases.json');
let ok = 0, n = 0; const fail = [];
const chk = (c, name, cond, got) => { n++; if (cond) ok++; else fail.push(c.id + ' · ' + name + ' (지금: ' + got + ') — 책: ' + (c.book || '')); };
for (const c of C) {
  const r = calc(c.y, c.m, c.d, c.h, c.mi); r.input = { y: c.y, m: c.m, d: c.d, h: c.h, mi: c.mi, sex: c.sex };
  if (c.ju) chk(c, '국', (r.yang ? '陽' : '陰') + r.ju === c.ju && r.jq === c.jq, r.jq + (r.yang ? '陽' : '陰') + r.ju);
  if (c.earth) { const e = [4, 9, 2, 3, 5, 7, 8, 1, 6].map(p => r.earthN[p]).join(','); chk(c, '지반 홍국수', e === c.earth, e); }
  const age = c.runAge || 40, x = H.interpret(r, c.sex, age);
  if (c.strong) chk(c, '世 강약', x.strong === c.strong, x.strong);
  if (c.yong) chk(c, '용신', x.yong === c.yong, x.yong);
  if (c.jin) { const j = H.jinyong(r, x.yong === '鬼' ? '官' : x.yong); chk(c, '진용', j.cand[0] && j.cand[0].n === c.jin, j.cand.map(q => q.n).join(',')); if (c.gaeun) chk(c, '개운 궁', j.cand[0] && j.cand[0].pals.includes(c.gaeun), j.cand[0] && j.cand[0].pals); }
  if (c.runAge) { const u = x.runs.find(q => q.from <= age && q.to >= age);
    if (c.runBad) chk(c, '대운 흉', u && u.g < 0, u && u.g.toFixed(1));
    if (c.runMark) chk(c, '대운 살성 ' + c.runMark, u && u.marks.some(m => m.includes(c.runMark)), u && u.marks.join(' ')); }
}
console.log((fail.length ? '⚠️' : '✅') + ' 책 예시 대조: ' + ok + '/' + n + ' 일치');
for (const f of fail) console.log('  ✗ ' + f);
process.exit(0);
