const s=require('fs').readFileSync(__dirname+'/browser.js','utf8');
eval(s.slice(0,s.indexOf('  for (const [q, want, not]'))+`
const age=await pg.evaluate(()=>ageNow(base));console.log('age',age);
const hits=new Set();const scan=(where,t)=>{for(const line of t.split('\\n')){for(const m of line.matchAll(/(\\d{1,2})(?:~(\\d{1,2}))?세/g)){const to=+(m[2]||m[1]);if(to<age)hits.add(where+': '+line.trim().slice(0,110));}}};
scan('hero',await pg.evaluate(()=>document.getElementById('heroCard').innerText));
for(const k of ['sum','char','money','job','love','health','lucky','today']){await pg.evaluate(k=>{const i=document.querySelector('.qaI[data-k='+k+']');if(!i.classList.contains('open'))i.querySelector('.qaQ').click();},k);await pg.waitForTimeout(250);
  scan(k,await pg.evaluate(k=>{const a=document.querySelector('.qaI[data-k='+k+'] .qaA');return [...a.querySelectorAll('p,td,b,span,div')].filter(e=>e.offsetParent!==null&&!e.children.length).map(e=>e.innerText).join('\\n');},k));}
await pg.evaluate(()=>{const i=document.querySelector('.qaI[data-k=ask]');if(!i.classList.contains('open'))i.querySelector('.qaQ').click();});await pg.waitForTimeout(400);for(const q of ['돈 언제 들어와요?','결혼운 어때요?','건강은요?']){await askT(q);scan('ask '+q,await pg.evaluate(()=>{const d=document.querySelector('#askOut .cur .askMore');d.open=true;return document.querySelector('#askOut .cur').innerText;}));}
await pg.click('#mode button[data-v=sin]');await pg.waitForTimeout(800);scan('운세',await pg.evaluate(()=>document.getElementById('reading').innerText));
await pg.click('#mode button[data-v=won]');await pg.waitForTimeout(600);
for(const p of [1,3,5,7,9]){await pg.evaluate(p=>{const c=document.querySelector('#sboard [data-p="'+p+'"]')||document.querySelectorAll('#sboard .sc')[p-1];if(c)c.click();},p);await pg.waitForTimeout(200);scan('칸'+p,await pg.evaluate(()=>document.getElementById('detail').innerText));}
console.log([...hits].join('\\n')||'지난 나이 없음');
await b.close(); process.exit(0); })();`);
