// ── 쉬운 보기: 메뉴 7개, 신수·일진은 '운세' 하나로, 풀이는 결론·이유·할 일만 먼저 ──
(function(){
  const B=document.body,KEY='dkProView';
  const pro=false;try{localStorage.removeItem(KEY);}catch(e){} // 전문가 보기는 없앴어요(늘 쉬운 보기)
  const LBL={sum:['한마디로','한마디·총평'],char:['성격','성격·기질'],spouse:['배우자·연애','사랑·가족']};
  // 메뉴 아래 전문가 보기 스위치
  const bar=document.createElement('div');bar.className='proBar';
  bar.innerHTML='<span><b>🔧 전문가 보기</b><small>구궁도·대운표·원리 풀이·4주 풀이와 자세한 근거까지 모두 보여요</small></span><button type="button"></button>';
  $('menuCard').appendChild(bar);
  // 운세 안의 올해/오늘 고르기
  const fs=document.createElement('div');fs.className='seg fortSeg';
  fs.innerHTML='<button type="button" data-v="sin">🎊 올해 운세</button><button type="button" data-v="il">☀️ 오늘 운세</button>';
  $('mode').insertAdjacentElement('afterend',fs);
  fs.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const m=$('mode').querySelector('button[data-v="'+b.dataset.v+'"]');if(m)m.click();});
  function cut(root){
    if(pro||!root)return;
    root.querySelectorAll('.rdSec:not([data-cut])').forEach(sec=>{
      sec.dataset.cut='1';const k=sec.dataset.sec;if(['lucky','deep','wonbi'].includes(k))return;
      const shBox=sec.querySelector(':scope>.sh');
      if(shBox){const rest=[...sec.children].filter(c=>!(c.tagName==='H4'||c.classList.contains('rdStar')||c.classList.contains('rdHL')||c===shBox));
        if(rest.length){const d=document.createElement('details');d.className='more';d.innerHTML='<summary>근거 보기</summary>';rest.forEach(c=>d.appendChild(c));sec.appendChild(d);}return;}
      const ps=[...sec.children].filter(c=>c.tagName==='P'&&!c.classList.contains('rdHL'));
      const plain=ps.filter(p=>!p.classList.contains('note')&&!/^[📌🌀]/u.test(p.textContent.trim())&&p.textContent.trim());
      if(!plain.length)return;
      const keep=new Set([plain[0]]);
      const act=[...plain].reverse().find(p=>p!==plain[0]&&/^[^\p{Script=Hangul}\p{L}\d(]/u.test(p.textContent.trim()));
      keep.add(act||plain[1]);
      const rest=[...sec.children].filter(c=>!(c.tagName==='H4'||c.classList.contains('rdStar')||c.classList.contains('rdHL')||keep.has(c)));
      if(!rest.length)return;
      const d=document.createElement('details');d.className='more';d.innerHTML='<summary>더 자세히 보기</summary>';
      rest.forEach(c=>d.appendChild(c));sec.appendChild(d);
    });
  }
  function apply(){
    B.classList.toggle('pro',pro);
    bar.querySelector('button').textContent=pro?'켜짐 · 끄기':'꺼짐 · 켜기';
    document.querySelectorAll('#mnGrid button').forEach(b=>{const l=LBL[b.dataset.k];if(l)b.querySelector('b').textContent=l[pro?0:1];});
    const sinB=$('mode').querySelector('button[data-v="sin"]');
    if(sinB){sinB.querySelector('.tt').textContent=pro?'신수':'운세';sinB.querySelector('small').textContent=pro?'올해 1년 운세':'올해·오늘 운세';
      sinB.classList.toggle('on',mode==='sin'||(!pro&&mode==='il'));}
    B.classList.toggle('inFort',!pro&&(mode==='sin'||mode==='il'));
    const nb=document.querySelector('.bnav button[data-v="sin"]');if(nb){nb.textContent=pro?'🎊 신수':'🎊 운세';nb.classList.toggle('on',mode==='sin'||(!pro&&mode==='il'));}
    fs.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===mode));
    // 쉬운 보기에서 숨긴 메뉴를 보고 있었으면 한마디로
    const cur=B.dataset.mn;if(!pro&&['total','type','child','luck','wonbi','four','map','deep'].includes(cur)&&window.__mn)window.__mn.set(cur==='type'?'char':cur==='child'?'spouse':cur==='total'?'sum':'sum');
    // 쉬운 보기에서는 9칸 지도를 쉬운 그림으로
    if(!pro){const e=$('viewSeg').querySelector('button[data-v="easy"]');if(e&&!e.classList.contains('on'))e.click();}
    cut($('reading'));
  }
  bar.style.display='none';bar.querySelector('button').addEventListener('click',()=>{try{localStorage.setItem(KEY,'0');}catch(e){}
    if(base){try{show();}catch(e){console.error(e);}}apply();});
  new MutationObserver(()=>cut($('reading'))).observe($('reading'),{childList:true});
  $('mode').addEventListener('click',()=>setTimeout(apply,0));
  const _sh=show;show=function(){const r=_sh.apply(this,arguments);try{apply();}catch(e){console.error(e);}return r;};
  apply();
})();
// ── 쉬운 말: 화면의 어려운 역학 용어를 누구나 아는 말로 바꿔 보여 줘요(쉬운·전문가 보기 모두, 구궁도 판 안 한자만 그대로). 뒤의 조사는 바뀐 말의 받침에 맞춰 고쳐요 ──
(function(){
  const W=[
    ['왕(旺)한 편','기운이 센 편'],['약(弱)한 편','기운이 여린 편'],['거왕(居旺)','자리 힘'],['승왕(乘旺)','달 힘'],['겸왕(兼旺)','같은 기운 겹침'],['수생(受生)','도움받음'],['거쇠(居衰)','자리 힘 약함'],['승쇠(乘衰)','달 힘 약함'],['거왕','자리 힘'],['승왕','달 힘'],['겸왕','같은 기운 겹침'],['수생','도움받음'],['거쇠','자리 힘 약함'],['승쇠','달 힘 약함'],
    ['원명국','타고난 운'],['신수국','올해 운'],['명국','타고난 운'],['신수비기','달 운 보기'],['원국비기','나이·달 보기'],['신수','올해 운세'],['일진','하루 운'],['대운표','10년 운 표'],['대운','10년 운'],['행년궁','올해 큰일 칸'],['행년','올해 큰일 칸'],['월운','달별 운'],['일운','하루 운'],
    ['용신','살리는 기운'],['진용','진짜 길'],['개운','운 트기'],['世궁','내 칸'],['세궁','내 칸'],['세기','내 기운'],['중궁','가운데 칸'],['천반','겉 운'],['지반','속 운'],['홍국수','운 숫자'],['연국','시간 판'],['구궁도','운명 지도'],['구궁','아홉 칸'],
    ['정인','바른 도움'],['편인','치우친 도움'],['정재','바른 돈'],['편재','뜻밖의 돈'],['식신','먹을 복'],['상관','튀는 재주'],['비견','같은 편'],['겁재','뺏는 경쟁자'],['편관','압박 기운'],['정관','직장 기운'],['관귀','직장 기운'],
    ['재성','돈 기운'],['관성','직장 기운'],['인성','도움 기운'],['식상','재능 기운'],['비겁','경쟁 기운'],['육친','가족 인연'],['육신','기운'],['없는 육신','빠진 기운'],
    ['년간','아버지 자리'],['년지','어머니 자리'],['월간','윗형제 자리'],['월지','아랫형제 자리'],['시지','둘째 자녀 자리'],['일간','겉의 나'],['사지','네 기둥 자리'],['사간','네 기둥 위 자리'],
    ['공망','빈 칸'],['면공','빈 칸 아님'],['살성','살 기운'],['동처','움직이는 자리'],['준동','움직이는 자리'],['왕쇠','힘의 크기'],['투출','드러남'],['암장','숨은 수'],['설기','힘 빠짐'],
    ['삼합','세 기운의 합'],['반합','두 기운의 합'],['육합','짝 합'],['충극','부딪힘'],['삼형살','세 가지 부딪힘 살'],['삼살','세 가지 살'],['화금상전','불과 쇠의 다툼'],['자형살','스스로 부딪힘'],['육파살','어긋남 살'],['천강살','막힘 살'],['형혹성','시끄러움 살'],['태백성','다침 살'],
    ['쌍도화','겹친 인기살'],['도화','인기살'],['쌍겁살','겹친 사고살'],['겁살','사고살'],['쌍망신','겹친 망신살'],['망신','망신살'],['쌍역마','겹친 이동살'],['역마','이동살'],['천마','해외 이동살'],['세마','먼 이동살'],['일마','가까운 이동살'],
    ['도궁','인기 칸'],['겁궁','사고 칸'],['망궁','망신살 칸'],['마궁','이동 칸'],['천을귀인','귀인'],['홍염','연애살'],
    ['길문괘','좋은 문·자리'],['괘문성장','문·자리'],['괘문','문·자리'],['경문(驚)','놀람 문'],['휴문','쉼 문'],['생문','재물 문'],['상문','다툼 문'],['두문','막힘 문'],['경문','드러남 문'],['사문','멈춤 문'],['개문','새길 문'],
    ['귀혼','돌아오는 자리'],['유혼','떠도는 자리'],['절명','위험한 자리'],['절체','지치는 자리'],['화해','다툼 자리'],['생기','살아나는 자리'],['천의','도움받는 자리'],['복덕','복 받는 자리'],['생기복덕','운의 자리'],
    ['감궁','북쪽 칸'],['간궁','북동쪽 칸'],['진궁','동쪽 칸'],['손궁','남동쪽 칸'],['이궁','남쪽 칸'],['곤궁','남서쪽 칸'],['태궁','서쪽 칸'],['건궁','북서쪽 칸'],
    ['왕한 편','센 편'],['왕하면','세면'],['재·관·손','돈·직장·재능'],['월령의 생조','태어난 달의 도움'],['월령','태어난 달'],['동한 것','움직이는 것'],['12신살','12가지 살'],['순포','순서대로'],['역포','거꾸로'],
    ['상원','첫째 판'],['중원','둘째 판'],['하원','셋째 판'],['양둔','양의 흐름'],['음둔','음의 흐름'],['천간','하늘 글자'],['지지','땅 글자'],['오행','다섯 기운'],['괘','자리']
  ].sort((a,b)=>b[0].length-a[0].length);
  const esc=s=>s.replace(/[()]/g,'\\$&');
  const MAP=Object.fromEntries(W);
  const hasB=w=>{const c=w.charCodeAt(w.length-1)-0xAC00;return c>=0&&c<11172&&c%28!==0;},isL=w=>{const c=w.charCodeAt(w.length-1)-0xAC00;return c>=0&&c%28===8;};
  const fix=(r,p)=>{if(!p)return r;const b=hasB(r);
    if(p==='은'||p==='는')return r+(b?'은':'는');if(p==='이'||p==='가')return r+(b?'이':'가');if(p==='을'||p==='를')return r+(b?'을':'를');if(p==='과'||p==='와')return r+(b?'과':'와');
    if(p==='으로'||p==='로')return r+(b&&!isL(r)?'으로':'로');if(p==='이에요'||p==='예요')return r+(b?'이에요':'예요');if(p==='이라'||p==='라')return r+(b?'이라':'라');return r+p;};
  // 보통 말과 헷갈리는 낱말은 단어가 끝나는 자리(뒤가 한글이 아니거나 조사)에서만 바꿔요: '생기기 쉬워요', '상관없이', '20세기'는 그대로
  const BOUND=new Set(['이궁','진궁','태궁','생기','화해','상관','지지','괘','상원','중원','하원','일운','사문','개문','두문','상문','휴문','생문','경문','투출','설기','천의','복덕','절명','절체','유혼','귀혼','수생','사지','사간','정인','편인','정재','편재','식신','비견','겁재','월간','개운','세기','세마','일마','일간','암장','신수','명국','일진','진용','용신']);
  const END='(?=$|[^가-힣]|(?:이에요|예요|으로|이라|은|는|이|가|을|를|과|와|로|라|의|에|도|만)(?:[^가-힣]|$))';
  const pat=w=>(BOUND.has(w)?'(?<![0-9가-힣])':'')+esc(w)+(w==='망신'?'(?!살)':w==='생기'?'(?!는 |기 |고 |면 |지 |도 |겠)':'')+(BOUND.has(w)?END:'');
  const RE=new RegExp('('+W.map(x=>pat(x[0])).join('|')+')(이에요|예요|으로|이라|은|는|을|를|과|와|로|라|이(?=[\\s.,!?·)…—]|$)|가(?=[\\s.,!?·)…—]|$))?','g');
  const SE={가:'내가',는:'나는',를:'나를',와:'나와',의:'나의',도:'나도',에게:'나에게','':'나'};
  const plain=s=>s.replace(RE,(m,w,p)=>fix(MAP[w],p))
    .replace(/世(에게|가|는|를|와|의|도)?/g,(m,p)=>SE[p||''])
    .replace(/(^|[\s(·,])세(에게|가|는|를|와|의|도)(?=\s)/g,(m,a,p)=>a+SE[p])
    .replace(/([,·])시간(?=[^가-힣]|$)/g,'$1첫째 자녀 자리')
    .replace(/(쪽 칸)\((?:북|남|동|서|북동|북서|남동|남서)\)/g,'$1')
    .replace(/[一二三四五六七八九十]\(([^)]{2,})\)/g,'$1')
    .replace(/\s?\((?:財|官|鬼|孫|父|兄|世|재|관|귀|손|부|형|세)\)/g,'');
  const SKIP=new Set(['SCRIPT','STYLE','INPUT','TEXTAREA','SELECT','OPTION']);
  function run(root){
    const w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode&&!SKIP.has(n.parentNode.nodeName)&&!n.parentNode.closest('#board .box,#board .tags')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
    let n;while((n=w.nextNode())){const v=n.nodeValue;if(!v||!/[가-힣世一-十]/.test(v))continue;let t=plain(v);
      // <b>떠도는 자리</b>을 처럼 굵은 글씨 뒤에 붙은 조사도 맞춰요
      const pr=n.previousSibling;if(pr&&pr.nodeType===1&&/^(B|STRONG|EM|I)$/.test(pr.nodeName)){const e=(pr.textContent||'').trim();
        if(/[가-힣]$/.test(e))t=t.replace(/^(이에요|예요|으로|이라|은|는|을|를|과|와|로|라|이|가)(?=[^가-힣]|$)/,p=>fix(e,p).slice(e.length));}
      if(t!==v)n.nodeValue=t;}
  }
  let tm=null;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>run(),30);}).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.__plain={run,plain};run();
})();
