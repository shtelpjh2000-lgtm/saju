// ── 쉬운 보기: 메뉴 7개, 신수·일진은 '운세' 하나로, 풀이는 결론·이유·할 일만 먼저 ──
(function(){
  const B=document.body,KEY='dkProView';
  let pro=false;try{pro=localStorage.getItem(KEY)==='1';}catch(e){}
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
  bar.querySelector('button').addEventListener('click',()=>{pro=!pro;try{localStorage.setItem(KEY,pro?'1':'0');}catch(e){}
    if(base){try{show();}catch(e){console.error(e);}}apply();});
  new MutationObserver(()=>cut($('reading'))).observe($('reading'),{childList:true});
  $('mode').addEventListener('click',()=>setTimeout(apply,0));
  const _sh=show;show=function(){const r=_sh.apply(this,arguments);try{apply();}catch(e){console.error(e);}return r;};
  apply();
})();
// ── 쉬운 말: 쉬운 보기에서는 어려운 역학 용어를 누구나 아는 말로 바꿔 보여 줘요(받침이 같은 말로 골라 조사가 어긋나지 않게) ──
(function(){
  const W=[
    ['월운','달별 운'],['왕(旺)한 편','기운이 센 편'],['약(弱)한 편','기운이 여린 편'],['거왕(居旺)','자리 힘'],['승왕(乘旺)','달 힘'],    ['원명국','타고난 운'],['신수국','올해 운'],['명국','타고난 운'],['신수','올해 운세'],['일진','하루 운'],['대운표','10년 운 표'],['대운','10년 운'],['행년궁','올해 큰일 칸'],['행년','올해 큰일 칸'],
    ['용신','살리는 기운'],['진용','진짜 길'],['世궁','내 칸'],['세궁','내 칸'],['세기','내 기운'],['중궁','가운데 칸'],['천반','겉 운'],['지반','속 운'],['홍국수','운 숫자'],
    ['재성','돈 기운'],['관성','직장 기운'],['정관','직장 기운'],['편관','압박 기운'],['관귀','직장 기운'],['인성','도움 기운'],['식상','재능 기운'],['비겁','경쟁 기운'],['육친','가족 인연'],['육신','기운'],
    ['공망','빈 칸'],['살성','살 기운'],['동처','움직이는 자리'],['준동','움직이는 자리'],['구궁도','운명 지도'],['원국비기','나이·달 보기'],['신수비기','달 운 보기'],
    ['귀혼','돌아오는 자리'],['유혼','떠도는 자리'],['절명','위험한 자리'],['절체','지치는 자리'],['화해','다툼 자리'],['생기','살아나는 자리'],['천의','도움받는 자리'],['복덕','복 받는 자리']
  ];
  const RE=new RegExp(W.map(x=>x[0].replace(/[()]/g,'\\$&')).join('|'),'g'),MAP=Object.fromEntries(W);
  const SE={가:'내가',는:'나는',를:'나를',와:'나와',의:'나의',도:'나도',에게:'나에게','':'나'};
  const plain=s=>s.replace(RE,w=>MAP[w])
    .replace(/世(에게|가|는|를|와|의|도)?/g,(m,p)=>SE[p||''])
    .replace(/[一二三四五六七八九十]\(([^)]{2,})\)/g,'$1')
    .replace(/\s?\((?:財|官|鬼|孫|父|兄|世|재|관|귀|손|부|형|세)\)/g,'');
  const SKIP=new Set(['SCRIPT','STYLE','INPUT','TEXTAREA','SELECT','OPTION']);
  function run(root){
    if(document.body.classList.contains('pro'))return;
    const w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode&&!SKIP.has(n.parentNode.nodeName)&&!n.parentNode.closest('#board,.proOnly')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
    let n;while((n=w.nextNode())){const v=n.nodeValue;if(!v||!/[가-힣世一-十]/.test(v))continue;const t=plain(v);if(t!==v)n.nodeValue=t;}
  }
  let tm=null;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>run(),30);}).observe(document.body,{childList:true,subtree:true});
  window.__plain={run,plain};run();
})();
