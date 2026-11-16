// 실제 화면 확인: node tests/browser.js  (Playwright 필요) — 입력·명국·질문 열기·운세 탭·전문가 보기에서 오류가 없는지
const { chromium } = require('playwright');
const url = 'file://' + require('path').resolve(__dirname, '../www/index.html');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(url); await pg.waitForTimeout(1200);
  await pg.click('#cal button[data-v=L]'); await pg.selectOption('#dy', '1975'); await pg.selectOption('#dm', '9'); await pg.selectOption('#dd', '6');
  await pg.evaluate(() => { document.getElementById('t').value = '11:00'; });
  await pg.click('#go'); await pg.waitForTimeout(1500);
  const who = await pg.evaluate(() => document.querySelector('#whoBar b').textContent);
  for (const k of ['sum', 'char', 'money', 'job', 'love', 'health', 'lucky', 'today', 'ask']) { await pg.click('.qaI[data-k=' + k + '] .qaQ'); await pg.waitForTimeout(300); }
  // 도깨비 대화: 질문 뜻을 제대로 알아듣는지
  await pg.evaluate(() => { const i = document.querySelector('.qaI[data-k=ask]'); if (!i.classList.contains('open')) i.querySelector('.qaQ').click(); }); await pg.waitForTimeout(300);
  const askT = async q => { await pg.fill('#askQ', q); await pg.click('#askGo'); await pg.waitForTimeout(800); return pg.evaluate(() => document.querySelector('#askOut .cur .bub.dk').innerText); };
  for (const [q, want, not] of [['부동산투자 한게있는데 이자만나가고 매매도 안되는데 언제 팔릴까요?', '매도', '주식'], ['주식 투자 해도 될까요?', '투자', '부동산'], ['이사 가려는데 어느 쪽이 좋아요?', '쪽이 좋네', '두 갈래']]) {
    const a = await askT(q); if (!a.includes(want) || a.includes(not)) errs.push('대화 오답: ' + q + ' → ' + a.slice(0, 80)); }
  for (const v of ['sin', 'gh', 'jm', 'dm', 'won']) { await pg.click('#mode button[data-v=' + v + ']'); await pg.waitForTimeout(800); }
  await pg.evaluate(() => document.querySelector('.proBar button').click()); await pg.waitForTimeout(1000);
  for (const k of ['deep', 'map', 'wonbi', 'four']) { await pg.evaluate(k => document.querySelector('#mnGrid button[data-k=' + k + ']').click(), k); await pg.waitForTimeout(400); }
  await pg.evaluate(() => document.querySelector('.proBar button').click()); await pg.waitForTimeout(500);
  console.log('맨 위 줄:', who);
  console.log(errs.length ? '❌ 화면 오류:\n' + errs.join('\n') : '✅ 화면 오류 없음');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
