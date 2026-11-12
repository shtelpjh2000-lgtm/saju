// ── 쉬운 보기의 명국: 질문 목록만 보이고, 누르면 그 자리에서 답이 펼쳐져요 ──
(function(){
  const B=document.body,out=$('out');
  const who=document.createElement('div');who.className='card';who.id='whoBar';
  who.innerHTML='<span><b></b><small></small></span><button type="button">✏️ 다시 입력</button>';
  out.insertBefore(who,out.firstChild);
  who.querySelector('button').addEventListener('click',()=>{B.classList.add('formOpen');$('form').scrollIntoView({behavior:'smooth',block:'start'});});
  $('go').addEventListener('click',()=>setTimeout(()=>{if(base)B.classList.remove('formOpen');},0));
  const card=document.createElement('div');card.className='card';card.id='qaCard';
  card.innerHTML='<h2 class="qaH">👹 무엇이 궁금한가?</h2><p class="qaSub">궁금한 걸 누르면 바로 아래에 풀어 주겠네. 다시 누르면 닫혀.</p><div id="qaList"></div>';
  $('ctl').insertAdjacentElement('afterend',card);
  const sec=k=>[...$('reading').querySelectorAll('[data-sec="'+k+'"]')].filter(e=>!e.matches('p.note'));
  const copy=els=>els.filter(Boolean).map(e=>{const c=e.cloneNode(true);c.removeAttribute('id');return c;});
  const Q=[
    {k:'sum',e:'👹',q:'나는 한마디로 어떤 사람이야?',get:()=>copy(sec('sum')).map(c=>{c.querySelectorAll('p.note').forEach(n=>n.remove());return c;})},
    {k:'char',e:'🙂',q:'내 성격은 어때?',get:()=>copy([$('typecard'),...sec('char')])},
    {k:'money',e:'💰',q:'돈은 언제, 어떻게 들어와?',get:()=>copy(sec('money'))},
    {k:'job',e:'💼',q:'나한테 맞는 일은 뭐야?',get:()=>copy(sec('job'))},
    {k:'love',e:'💕',q:'내 짝과 자녀 운은?',get:()=>copy([...sec('spouse'),...sec('child')])},
    {k:'health',e:'🏥',q:'건강은 뭘 조심해야 해?',get:()=>copy(sec('health'))},
    {k:'lucky',e:'🍀',q:'운을 좋게 하려면 어떻게 해?',get:()=>copy(sec('lucky'))},
    {k:'today',e:'☀️',q:'오늘 나는 어때?',move:'todayOut'},
    {k:'ask',e:'🙋',q:'도깨비 영감한테 직접 물어볼래',move:'askCard'},
    {k:'alarm',e:'🔔',q:'매일 아침 운세 알림 받을래',move:'alarmCard'},
  ];
  const list=card.querySelector('#qaList'),ph={};
  list.innerHTML=Q.map(x=>'<div class="qaI" data-k="'+x.k+'"><button type="button" class="qaQ"><span class="e">'+x.e+'</span><span class="t">'+x.q+'</span><span class="ar">▶</span></button><div class="qaA"></div></div>').join('');
  let open=null;
  function restore(){Object.keys(ph).forEach(id=>{const el=$(id);if(el&&ph[id].parentNode)ph[id].after(el);});}
  function fill(k){
    const x=Q.find(q=>q.k===k),A=list.querySelector('.qaI[data-k="'+k+'"] .qaA');A.innerHTML='';
    if(x.move){const el=$(x.move);if(!el)return;if(!ph[x.move]){ph[x.move]=document.createComment(x.move);el.before(ph[x.move]);}A.appendChild(el);}
    else{const n=x.get();if(n.length)n.forEach(c=>A.appendChild(c));else A.innerHTML='<p class="note">이 명국에서는 따로 풀 내용이 없네.</p>';}
  }
  function setOpen(k){
    restore();list.querySelectorAll('.qaI').forEach(i=>{i.classList.remove('open');i.querySelector('.qaA').innerHTML='';});
    open=k;if(!k)return;
    const it=list.querySelector('.qaI[data-k="'+k+'"]');it.classList.add('open');fill(k);
    setTimeout(()=>it.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }
  list.addEventListener('click',e=>{const b=e.target.closest('.qaQ');if(!b)return;const k=b.parentNode.dataset.k;setOpen(open===k?null:k);});
  function apply(){
    const on=!!base&&!B.classList.contains('pro')&&mode==='won';
    B.classList.toggle('hasBase',!!base);
    if(base){const I=base.input,p=v=>String(v).padStart(2,'0');
      const T=I.typed||{cal:'S',y:I.y,m:I.m,d:I.d,t:''},lunar=T.cal!=='S';
      const tm=/시/.test(T.t)?T.t.replace(/^[^\p{Script=Han}\p{Script=Hangul}]+/u,'').replace(/^(\p{Script=Han})\p{Script=Hangul}시/u,'$1時')+'':p(I.h)+':'+p(I.mi);
      const ex=/입력\s*(\d{1,2}:\d{2})/.exec(T.t),tm2=ex?ex[1]+' ('+tm.split(' ')[0]+')':tm;
      who.querySelector('b').textContent=(I.name?I.name+' · ':'')+(lunar?(T.cal==='LL'?'음력 윤':'음력 '):'양력 ')+T.y+'년 '+T.m+'월 '+T.d+'일 '+tm2;
      who.querySelector('small').textContent=(I.sex==='M'?'남자':'여자')+(lunar?' · 양력으로 '+I.y+'년 '+I.m+'월 '+I.d+'일':'');}
    if(!on&&B.classList.contains('qaOn')){setOpen(null);}
    B.classList.toggle('qaOn',on);
    const pb=document.querySelector('.proBar');if(pb){const dst=on?card:$('menuCard');if(pb.parentNode!==dst)dst.appendChild(pb);}
    if(on&&open){const k=open;restore();fill(k);}
  }
  const _sh=show;show=function(){const r=_sh.apply(this,arguments);try{apply();}catch(e){console.error(e);}return r;};
  $('mode').addEventListener('click',()=>setTimeout(apply,0));
  document.querySelector('.proBar button').addEventListener('click',()=>setTimeout(apply,0));
  apply();
})();
