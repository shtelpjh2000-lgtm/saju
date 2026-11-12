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
