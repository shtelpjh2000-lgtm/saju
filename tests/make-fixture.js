// 운곡 프로그램 화면과 대조를 마친 명국 값을 tests/screens.json에 저장해요(계산을 일부러 바꿀 때만 다시 실행).
const { calc } = require('./load');
const SCREENS = require('./screens-input.json');
const out = SCREENS.map(s => {
  const r = calc(s.y, s.m, s.d, s.h, s.mi);
  const P = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const pick = o => Object.fromEntries(P.map(p => [p, o[p] === undefined ? null : o[p]]));
  return Object.assign({}, s, { expect: {
    pillars: r.pillars, ju: (r.yang ? '陽' : '陰') + r.ju, jq: r.jqHanja, yuan: r.yuanName,
    earthN: pick(r.earthN), heavN: pick(r.heavN), earthS: pick(r.earthS), heavS: pick(r.heavS),
    door: pick(r.door), star: pick(r.star), god: pick(r.god), taiyi: pick(r.taiyi), gua: pick(r.gua),
    lqE: pick(r.lqE), lqH: pick(r.lqH), ageE: pick(r.ageE), ageH: pick(r.ageH), unseong: pick(r.unseong), sePal: r.sePal
  } });
});
require('fs').writeFileSync(__dirname + '/screens.json', JSON.stringify(out, null, 1));
console.log('저장:', out.length, '개');
