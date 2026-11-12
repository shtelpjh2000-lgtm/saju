// 브라우저 없이 node에서 앱의 계산·풀이 코드를 불러와요: const { Solar, Gimun, Haeseok, calc } = require('./tests/load')
const path = require('path');
const js = f => path.join(__dirname, '..', 'www', 'js', f);
const { Solar, Lunar } = require(js('01-lunar.js'));
global.Solar = Solar; global.Lunar = Lunar;
const Gimun = require(js('02-gimun.js'));
const Haeseok = require(js('03-haeseok.js'));
// 앱과 같은 시간 보정(표준시 −30분, 1954.3.21~1961.8.10 제외, 서머타임 −60분)을 쓰려면 adjust를 직접 넘겨요. 화면 대조는 −30분 기준.
const calc = (y, m, d, h, mi, opt) => Gimun.calc(Solar, y, m, d, h, mi, Object.assign({ adjust: -30 }, opt || {}));
module.exports = { Solar, Lunar, Gimun, Haeseok, calc };
