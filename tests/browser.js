// 실제 화면 확인: node tests/browser.js  (Playwright 필요) — 입력·명국·질문 열기·운세 탭·전문가 보기에서 오류가 없는지
const { chromium } = require('playwright');
const url = 'file://' + require('path').resolve(__dirname, '../www/index.html');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.addInitScript(() => { window.__noTtak = true; }); // 방망이 뚝딱 화면은 따로 확인
  await pg.goto(url); await pg.waitForTimeout(1200);
  await pg.click('#cal button[data-v=L]'); await pg.selectOption('#dy', '1975'); await pg.selectOption('#dm', '9'); await pg.selectOption('#dd', '6');
  await pg.evaluate(() => { document.getElementById('t').value = '11:00'; });
  await pg.click('#go'); await pg.waitForTimeout(1500);
  const who = await pg.evaluate(() => document.querySelector('#whoBar b').textContent);
  // 첫 화면 한 장면 카드(올해 자네는 OO) · 예고 · 공유 버튼
  if (!(await pg.evaluate(() => { const h = document.querySelector('#heroCard'); return h && h.querySelector('.hTitle b') && h.querySelector('.heroShare') && getComputedStyle(h).display !== 'none'; }))) errs.push('첫 화면 카드 없음');
  // 사람 끌기: 지난 일 맞히기·오늘의 방망이·부적·가족 서열·궁합 링크
  for (const c of ['.hPast', '.bokGo', '.bjGo', '.famWrap', '.withGo']) if (!(await pg.$('#heroCard ' + c))) errs.push('첫 화면 카드에 없음: ' + c);
  await pg.click('#heroCard .hPast button[data-pa=y]'); await pg.click('#heroCard .bokGo'); await pg.waitForTimeout(700); if (!(await pg.$('#heroCard .bokRes'))) errs.push('오늘의 방망이 결과 안 나옴');
  await pg.click('#heroCard .bjGo'); for (let i = 0; i < 16 && !(await pg.$('#heroCard .bjImg')); i++) await pg.waitForTimeout(500); if (!(await pg.$('#heroCard .bjImg'))) errs.push('부적 그림 안 나옴');
  // 방망이 뚝딱 화면: 세 번 두드리면 닫힘
  await pg.evaluate(() => { window.__noTtak = false; document.body.classList.add('formOpen'); }); await pg.fill('#nm', '뚝딱'); await pg.click('#go'); await pg.waitForTimeout(400);
  if (!(await pg.$('#ttak'))) errs.push('방망이 뚝딱 화면 안 나옴'); else { for (let i = 0; i < 3; i++) { await pg.click('.tkBtn'); await pg.waitForTimeout(200); } await pg.waitForTimeout(1800); if (await pg.$('#ttak')) errs.push('세 번 두드려도 안 닫힘'); }
  await pg.evaluate(() => { window.__noTtak = true; });
  // 결혼 시기·상대 바람기(도화·홍염)
  { await pg.click('.qaI[data-k=marry] .qaQ'); await pg.waitForTimeout(300); const m = await pg.evaluate(() => document.querySelector('.qaI[data-k=marry] .qaA').innerText); if (!/결혼|부부/.test(m) || !/도화/.test(m)) errs.push('결혼 시기 대답 이상: ' + m.slice(0, 50));
    await pg.click('.qaI[data-k=cheat] .qaQ'); await pg.waitForTimeout(300); const C = '.qaI[data-k=cheat] .qaA ';
    if (await pg.$(C + '.pfSave')) { await pg.selectOption(C + '.pfY', '1990'); await pg.selectOption(C + '.pfM', '5'); await pg.selectOption(C + '.pfD', '5'); await pg.click(C + '.pfSave'); await pg.waitForTimeout(300); }
    const c = await pg.evaluate(() => document.querySelector('.qaI[data-k=cheat] .qaA').innerText); if (!/도화|홍염/.test(c) || !/유혹|한눈/.test(c)) errs.push('바람기 대답 이상: ' + c.slice(0, 50)); }
  for (const k of ['sum', 'char', 'money', 'job', 'love', 'health', 'lucky', 'today', 'ask']) { await pg.click('.qaI[data-k=' + k + '] .qaQ'); await pg.waitForTimeout(300); }
  // 도깨비 대화: 질문 뜻을 제대로 알아듣는지
  await pg.evaluate(() => { const i = document.querySelector('.qaI[data-k=ask]'); if (!i.classList.contains('open')) i.querySelector('.qaQ').click(); }); await pg.waitForTimeout(300);
  const askT = async q => { await pg.fill('#askQ', q); await pg.click('#askGo'); await pg.waitForTimeout(800); return pg.evaluate(() => { const d = document.querySelector('#askOut .cur .bub.dk').cloneNode(true); d.querySelectorAll('.dkOpen').forEach(x => x.remove()); return d.innerText; }); };
  for (const [q, want, not] of [['부동산투자 한게있는데 이자만나가고 매매도 안되는데 언제 팔릴까요?', '매도', '주식'], ['주식 투자 해도 될까요?', '투자', '부동산'], ['이사 가려는데 어느 쪽이 좋아요?', '쪽이 좋네', '두 갈래'], ['땅 투자 어때요?', '매물', '주식'], ['갭투자 해도 될까요', '매물', '코인'], ['집 언제 팔릴까요?', '매도', '그 일']]) {
    const a = await askT(q); if (!a.includes(want) || a.includes(not)) errs.push('대화 오답: ' + q + ' → ' + a.slice(0, 80)); }
  // 질문 두 개를 한 번에 물으면 '두 갈래 길'로 견주지 말고 하나씩 답해야 함
  { await askT('금전이 들어오는 시기는 언제일까? 서울로 가서 부동산을 하면 잘될까?'); const all = await pg.evaluate(() => document.getElementById('askOut').innerText); if (/두 갈래/.test(all) || !/두 번째 물음/.test(all)) errs.push('질문 두 개를 하나씩 못 알아들음'); }
  // 이사 물음에 '아까 부동산 매매' 같은 엉뚱한 되짚기가 없어야 하고, 가려는 곳은 좋게 말해 줘야 함
  { await askT('우리식구 이사운은 언제일까요? 서울쪽으로 갈건데 방향은 어디가?'); const all = await pg.evaluate(() => document.getElementById('askOut').innerText); if (/아까 .*얘기에 이어서/.test(all)) errs.push('이전 대화를 엉뚱하게 되짚음'); if (!/서울 쪽으로 마음먹었다면|지금 사는 곳|서울은 /.test(all)) errs.push('가려는 곳(서울)에 대한 말이 없음'); }
  { await pg.selectOption('#homeCity', '대전'); const a = await askT('부산으로 이사 가려는데 어때?'); if (!/대전에서 부산은 남동쪽/.test(a)) errs.push('사는 곳 기준 방향 틀림: ' + a.slice(0, 60)); await pg.selectOption('#homeCity', ''); }
  // 제일 좋은 달과 짚어 준 날짜가 같은 달이어야 함(내년 7월이라면서 11월 날짜를 주면 안 됨)
  for (const q of ['부동산 언제 팔릴까요?', '이직 언제 하면 좋을까요?']) { const a = await askT(q); const m1 = /(?:는|이) (?:내년 |\d{4}년 )?(?:이번 달\()?(\d{1,2})월/.exec(a), m2 = /그 달[^\d]{0,12}(\d{1,2})월 \d{1,2}일/.exec(a); if (m1 && m2 && m1[1] !== m2[1]) errs.push('좋은 달·날짜 엇갈림: ' + q + ' → ' + m1[1] + '월 / ' + m2[1] + '월'); }
  // 질문에 적은 연도로 답해야 함(2027년을 물으면 2027년 얘기)
  { const Y2 = new Date().getFullYear() + 1; const a = await askT(Y2 + '년 재물운 봐주세요'); if (!a.includes(Y2 + '년')) errs.push('연도 오답: ' + Y2 + '년 → ' + a.slice(0, 60)); const a2 = await askT(String(Y2 + 1).slice(2) + '년 이사 운은?'); if (!a2.includes((Y2 + 1) + '년')) errs.push('두 자리 연도 오답: ' + a2.slice(0, 60)); }
  for (const v of ['sin', 'gh', 'jm', 'dm', 'won']) { await pg.click('#mode button[data-v=' + v + ']'); await pg.waitForTimeout(800);
    if (v === 'jm') { if (!(await pg.$('#jmIntroOv #jmStart'))) errs.push('작명 설명 화면 안 나옴'); else { await pg.click('#jmStart'); await pg.waitForTimeout(300); if (await pg.$('#jmIntroOv')) errs.push('작명 설명 화면이 안 닫힘'); } } }
  // 언제나 보이는 '처음으로' 단추와 '시 모름' 단추
  if (!(await pg.evaluate(() => { const h = document.getElementById('homeBtn'), n = document.getElementById('tUnknown'); return h && getComputedStyle(h).display !== 'none' && n; }))) errs.push('처음으로·시 모름 단추 없음');
  // 전문가 보기는 없앴으므로 늘 쉬운 보기: 스위치가 안 보여야 함
  if (await pg.evaluate(() => { const b = document.querySelector('.proBar'); return b && getComputedStyle(b).display !== 'none'; })) errs.push('전문가 보기 스위치가 보임');
  for (const k of ['deep', 'map', 'wonbi', 'four']) { await pg.evaluate(k => document.querySelector('#mnGrid button[data-k=' + k + ']').click(), k); await pg.waitForTimeout(400); }
  // 다시 켰을 때 첫 화면(오늘 카드)에는 그림이 없어야 함 — 그림은 사주 넣고 풀이한 뒤에만
  await pg.reload(); await pg.waitForTimeout(1200);
  if (await pg.evaluate(() => { const t = document.getElementById('todayTop'); return t && t.style.display !== 'none'; })) errs.push('사주 넣기 전인데 시작 화면에 운세가 나옴');
  console.log('시작 화면 오늘 카드:', await pg.evaluate(() => { const t = document.getElementById('todayTop'); return t && t.style.display !== 'none' ? '보임(그림 ' + t.querySelectorAll('figure').length + '개)' : '없음'; }));
  console.log('맨 위 줄:', who);
  console.log(errs.length ? '❌ 화면 오류:\n' + errs.join('\n') : '✅ 화면 오류 없음');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
