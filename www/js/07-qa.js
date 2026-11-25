// ── 쉬운 보기의 명국: 질문 목록만 보이고, 누르면 그 자리에서 답이 펼쳐져요 ──
(function(){
  const B=document.body,out=$('out');
  const who=document.createElement('div');who.className='card';who.id='whoBar';
  who.innerHTML='<span><b></b><small></small></span><button type="button">✏️ 다시 입력</button>';
  out.insertBefore(who,out.firstChild);
  who.querySelector('button').addEventListener('click',()=>{B.classList.add('formOpen');$('form').scrollIntoView({behavior:'smooth',block:'start'});});
  $('go').addEventListener('click',()=>setTimeout(()=>{if(base)B.classList.remove('formOpen');},0));
  const card=document.createElement('div');card.className='card';card.id='qaCard';
  card.innerHTML='<h2 class="qaH"><img class="dkIco" src="img/dokkaebi.svg" alt=""> 무엇이 궁금한가?</h2><p class="qaSub">궁금한 걸 누르면 바로 아래에 풀어 주겠네. 다시 누르면 닫혀.</p><div id="qaList"></div><p class="note qaNote">※ 전통 역학 원리로 본 재미·참고용 풀이예요. 건강·돈·법률 같은 중요한 결정은 꼭 전문가와 상의하세요.</p>';
  $('ctl').insertAdjacentElement('afterend',card);
  const hero=document.createElement('div');hero.className='card';hero.id='heroCard';who.insertAdjacentElement('afterend',hero);let heroOf=null;
  const sec=k=>[...$('reading').querySelectorAll('[data-sec="'+k+'"]')].filter(e=>!e.matches('p.note'));
  const copy=els=>els.filter(Boolean).map(e=>{const c=e.cloneNode(true);c.removeAttribute('id');return c;});
  const Q=[
    {k:'sum',e:'<img class="dkIco" src="img/dokkaebi.svg" alt="">',q:'나는 한마디로 어떤 사람이야?',get:()=>copy(sec('sum')).map(c=>{c.querySelectorAll('p.note').forEach(n=>n.remove());return c;})},
    {k:'char',e:'🙂',q:'내 성격은 어때?',get:()=>copy([$('typecard'),...sec('char')])},
    {k:'money',e:'💰',q:'돈은 언제, 어떻게 들어와?',get:()=>copy(sec('money'))},
    {k:'job',e:'💼',q:'나한테 맞는 일은 뭐야?',get:()=>copy(sec('job'))},
    {k:'love',e:'💕',q:'내 짝과 자녀 운은?',get:()=>copy([...sec('spouse'),...sec('child')])},
    {k:'mr',e:'📜',q:'사주 명리로도 한 번 더 봐 줘',html:()=>window.__mrHtml?window.__mrHtml():''},
    {k:'home',e:'🏡',q:'우리 집·터 운은?',html:()=>window.__homeHtml?window.__homeHtml():''},
    {k:'family',e:'👨‍👩‍👧',q:'가족 관계는 어때?',html:()=>window.__familyHtml?window.__familyHtml():''},
    {k:'marry',e:'💍',q:'나는 언제 결혼해?',html:()=>window.__marryHtml?window.__marryHtml():''},
    {k:'cheat',e:'💔',q:'상대 바람기, 언제 조심할까?',html:()=>window.__cheatHtml?window.__cheatHtml():''},
    {k:'health',e:'🏥',q:'건강은 뭘 조심해야 해?',get:()=>copy(sec('health'))},
    {k:'lucky',e:'🍀',q:'운을 좋게 하려면 어떻게 해?',get:()=>copy(sec('lucky'))},
    {k:'today',e:'☀️',q:'오늘 나는 어때?',move:'todayOut'},
    {k:'ask',e:'🙋',q:'방망이 도깨비한테 직접 물어볼래',move:'askCard'},
    {k:'alarm',e:'🔔',q:'매일 아침 운세 알림 받을래',move:'alarmCard'},
  ];
  const list=card.querySelector('#qaList'),ph={};
  list.innerHTML=Q.map(x=>'<div class="qaI" data-k="'+x.k+'"><button type="button" class="qaQ"><span class="e">'+x.e+'</span><span class="t">'+x.q+'</span><span class="ar">▶</span></button><div class="qaA"></div></div>').join('');
  let open=null;
  function restore(){Object.keys(ph).forEach(id=>{const el=$(id);if(el&&ph[id].parentNode)ph[id].after(el);});}
  function fill(k){
    const x=Q.find(q=>q.k===k),A=list.querySelector('.qaI[data-k="'+k+'"] .qaA');A.innerHTML='';
    if(x.html){A.innerHTML=x.html();return;}
    if(x.move){const el=$(x.move);if(!el)return;if(!ph[x.move]){ph[x.move]=document.createComment(x.move);el.before(ph[x.move]);}A.appendChild(el);}
    else{const n=x.get();if(!n.length){A.innerHTML='<p class="note">이 명국에서는 따로 풀 내용이 없네.</p>';}
      else if(k==='sum'){A.insertAdjacentHTML('beforeend','<div class="bub me">'+x.q+'</div>');n.forEach(c=>A.appendChild(c));if(window.__secArt){const f=window.__secArt(k);if(f)A.insertAdjacentHTML('beforeend',f);}}
      else{A.insertAdjacentHTML('beforeend',talkOf(k,x,n));const det=A.querySelector('details.qaMore');n.forEach(c=>det.appendChild(c));}}
  }
  // 질문을 누르면 도깨비가 대화로 답해요: 요약(쉬운 말) + 제일 좋은 때·쉬어 갈 때 + 그림, 자세한 풀이는 접어 두기
  const OPEN={char:'자네 성격 말인가. 내 보기엔 말일세,',money:'돈 얘기라… 어디 보자.',job:'일 얘기구먼. 자네한테 맞는 길을 짚어 보지.',love:'짝과 자식 얘기라… 잘 들어 보게.',health:'몸 얘기는 중요하지. 잘 듣게.',lucky:'운을 끌어오는 법 말인가. 방망이 비법을 일러 주지.'};
  function talkOf(k,x,nodes){const say=t=>{try{return toJane(hage(t));}catch(e){return t;}};const L=[];
    for(const nd of nodes){nd.querySelectorAll&&nd.querySelectorAll('.sh p').forEach(p=>{const t=p.innerHTML.trim();if(t&&!L.includes(t))L.push(t);});}
    if(!L.length)for(const nd of nodes){const h=nd.querySelector&&nd.querySelector('.rdHL');if(h)L.push(h.innerHTML);}
    if(k==='job'&&window.__jobLines){const JL=window.__jobLines();L.splice(Math.min(1,L.length),0,...JL);}
    {const TK={money:'money',job:'promo',love:'couple',health:'health'}[k];if(TK&&window.__scoreOf&&typeof sceneOf==='function'){const v=window.__scoreOf(TK,new Date().getFullYear());const sc=v!=null?sceneOf(TK,v>=0.37,k):'';if(sc)L.splice(Math.min(1,L.length),0,'🎬 <b>올해 이런 일 생기기 쉽네</b> '+sc);}}
    // 가까운 미래부터: 나이별 흐름 줄 중 앞으로 10년 안의 좋은 때(없으면 가장 가까운 무난한 때)
    let when='';{const age=base?ageNow(base):0;const rows=[];for(const nd of nodes){nd.querySelectorAll&&nd.querySelectorAll('.lifeR').forEach(r=>{const m=/(\d+)(?:~(\d+))?세/.exec(r.querySelector('b')?r.querySelector('b').textContent:'');const lp=r.querySelector('.lp');if(m&&lp)rows.push({from:+m[1],to:+(m[2]||m[1]),lv:+((/lv(\d)/.exec(lp.className)||[])[1]||2),t:m[0]});});}
      const near=rows.filter(x=>x.from<=age+10);const good=near.find(x=>x.lv<=1)||near.find(x=>x.lv===2);const rest=near.find(x=>x.lv===3);
      const ix=['char','money','job','love','health','lucky'].indexOf(k)%3,G=x=>'<b>'+x.t+'</b>';
      const NOW=['바로 지금('+(good?good.t:'')+')이 기회일세. 미루지 말게.','지금('+(good?good.t:'')+') 흐름이 좋으니 이때 움직이게.','지금('+(good?good.t:'')+')이 딱 좋은 때일세.'];
      const SOON=[' 가까이는 ',' 머지않아 ',' 조금 있으면 '][ix],REST=['엔 한 박자 쉬어 가게.','엔 숨 고르며 다지게.','엔 무리 말고 지키게.'][ix];
      if(good)when=(good.from<=age?NOW[ix].replace('('+good.t+')','(<b>'+good.t+'</b>)'):SOON.trim()+' '+G(good)+(good.lv<=1?'가 제일 좋네.':'가 무난하니 그때 차근차근 하게.'))+(rest&&rest!==good?' '+G(rest)+REST:'');}
    const art=window.__secArt?window.__secArt(k):'';
    return nameize('<div class="bub me">'+x.q+'</div><div class="bub dk"><span class="av"></span><div><p class="dkOpen">'+(o=>/^자네/.test(o)?o.replace(/^자네/,jane()):(myName()?jane()+', '+o:o))(OPEN[k]||'어디 보자.')+'</p>'+
      L.slice(0,k==='job'?8:4).map((t,i)=>'<p'+(i===0?' class="ansV"':'')+'>'+say(t)+'</p>').join('')+(when?'<p>'+when+'</p>':'')+art+
      '<details class="askMore qaMore"><summary>📜 자세한 풀이 보기</summary></details></div></div>');}
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
    // 운세(올해·오늘) 화면: 운세 풀이가 먼저, 도깨비와 이야기하는 칸은 그 아래
    {const ac=$('askCard');if(ac&&!on){if(mode==='sin'||mode==='il'){if(ac.previousElementSibling!==$('reading'))$('reading').after(ac);}else if(ac.nextElementSibling!==$('menuCard'))$('menuCard').before(ac);}}
    if(on&&base&&heroOf!==base&&window.__heroHtml){heroOf=base;hero.innerHTML=window.__heroHtml();}
    const pb=document.querySelector('.proBar');if(pb){const dst=on?card:$('menuCard');if(pb.parentNode!==dst)dst.appendChild(pb);}
    if(on&&open){const k=open;restore();fill(k);}
  }
  const _sh=show;show=function(){const r=_sh.apply(this,arguments);try{apply();}catch(e){console.error(e);}return r;};
  $('mode').addEventListener('click',()=>setTimeout(apply,0));
  document.querySelector('.proBar button').addEventListener('click',()=>setTimeout(apply,0));
  apply();
})();
