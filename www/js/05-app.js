const $=id=>document.getElementById(id);
const NUM=['','一','二','三','四','五','六','七','八','九','十'];
const PN={1:'坎',2:'坤',3:'震',4:'巽',5:'中',6:'乾',7:'兌',8:'艮',9:'離'};
const PK={1:'감궁(북)',2:'곤궁(남서)',3:'진궁(동)',4:'손궁(남동)',5:'중궁',6:'건궁(북서)',7:'태궁(서)',8:'간궁(북동)',9:'이궁(남)'};
const FAM={1:'중남(가운데 아들)',2:'어머니',3:'장남',4:'장녀',6:'아버지',7:'소녀(막내딸)',8:'소남(막내아들)',9:'중녀(가운데 딸)',5:'중심'};
const LQ={世:'나 자신, 가정의 자리예요.',兄:'형제·친구·동료, 경쟁자를 뜻해요. 많으면 재물이 나뉘기 쉬워요.',父:'부모·문서·학업·자격증·집을 뜻해요.',孫:'자녀·아랫사람·재능과 표현, 의식주의 넉넉함을 뜻해요.',財:'재물·사업, 남자에게는 아내·여자를 뜻해요.',官:'직장·명예·관직, 여자에게는 남편을 뜻해요.',鬼:'나를 누르는 힘으로 질병·관재·압박, 여자에게는 남자를 뜻해요.'};
const DM={休門:'쉼과 회복, 귀인의 도움.',生門:'생산과 재물, 일이 자라나는 문.',傷門:'다툼과 상처, 경쟁.',杜門:'막힘과 숨김, 보안과 은둔.',景門:'드러남과 문서, 명예와 구설.',死門:'끝맺음과 정지, 조문·장례.',驚門:'놀람과 송사, 말로 인한 소란.',開門:'열림과 출발, 직장과 개업.'};
const GU={生氣:'기운이 살아나는 길한 자리.',天宜:'하늘의 도움, 의료·치유와 인연.',絶體:'몸이 끊기는 흉한 자리, 건강 주의.',遊魂:'떠도는 기운, 이동·여행·변동.',禍害:'해로움과 구설이 생기기 쉬운 자리.',福德:'복과 덕이 모이는 길한 자리.',絶命:'가장 흉한 자리, 큰 일은 피하는 게 좋아요.',歸魂:'제자리로 돌아오는 기운, 본궁.'};
const EL_KO={水:'수',火:'화',木:'목',金:'금',土:'토'};
let sex='M',cal='S',cur=null,base=null,mode='won',yearSel=new Date().getFullYear(),yInfo=null,dInfo=null;
let LEG0='';
const MPAL={1:8,2:3,3:4,4:4,5:9,6:2,7:2,8:7,9:6,10:6,11:1,12:8};

// 한국 표준시(동경 135°) 보정 -30분, 서머타임 -60분
const DST=[[1948,'06-01','09-13'],[1949,'04-03','09-11'],[1950,'04-01','09-10'],[1951,'05-06','09-09'],[1955,'05-05','09-09'],[1956,'05-20','09-30'],[1957,'05-05','09-22'],[1958,'05-04','09-21'],[1959,'05-03','09-20'],[1960,'05-01','09-18'],[1987,'05-10','10-11'],[1988,'05-08','10-09']];
function autoAdjust(y,m,d){
  const k=y*10000+m*100+d;let a=0,why=[];
  if(k<19540321||k>=19610810){a-=30;why.push('표준시 −30분');}
  const md=String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
  for(const [yy,s,e] of DST) if(yy===y&&md>=s&&md<e){a-=60;why.push('서머타임 −60분');}
  return {a,why};
}
function seg(id,cb){$(id).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;[...$(id).children].forEach(x=>x.classList.toggle('on',x===b));cb(b.dataset.v);});}
seg('sex',v=>sex=v);seg('cal',v=>cal=v);
seg('mode',v=>{mode=v;$('yrWrap').style.display=v==='sin'?'block':'none';$('ilWrap').style.display=v==='il'?'block':'none';if(base)show();});
$('ild').addEventListener('change',()=>{if(base&&$('ild').value)show();});
$('yr').addEventListener('change',()=>{const v=+$('yr').value;if(v>=1900&&v<=2100){yearSel=v;if(base)show();}});

function compute(){
  const dv=$('d').value,tv=$('t').value;
  if(!dv||!tv)throw new Error('생년월일과 시각을 입력해 주세요.');
  let [y,m,d]=dv.split('-').map(Number);const [h,mi]=tv.split(':').map(Number);
  if(y<1900||y>2100)throw new Error('1900~2100년 사이로 입력해 주세요.');
  const typed={cal,y,m,d,t:($('tSel')?$('tSel').textContent:'').trim()};
  if(cal!=='S'){
    try{const s=Lunar.fromYmd(y,cal==='LL'?-m:m,d).getSolar();y=s.getYear();m=s.getMonth();d=s.getDay();}
    catch(e){throw new Error('그 음력 날짜를 찾지 못했어요. 윤달 여부를 확인해 주세요.');}
  }
  const ad=$('adj').checked?autoAdjust(y,m,d):{a:0,why:[]};
  const r=Gimun.calc(Solar,y,m,d,h,mi,{adjust:ad.a});
  r.input={y,m,d,h,mi,name:$('nm').value.trim(),sex,adj:ad,typed};
  return r;
}

function ageNow(r){return (mode==='sin'?yearSel:new Date().getFullYear())-r.input.y+1;}
function yearGZ(y){return Lunar.fromYmd(y,6,1).getYearInGanZhi();}
function sinsu(gzY){const I=base.input;const rs=Gimun.calc(Solar,I.y,I.m,I.d,I.h,I.mi,{adjust:I.adj.a,yearGZ:gzY});rs.input=I;return rs;}
function dayInfo(y,m,d,cache){const l=Solar.fromYmd(y,m,d).getLunar();const gzY=l.getYearInGanZhiByLiChun();
  if(!cache[gzY]){const rs=sinsu(gzY);const yy=Solar.fromYmd(y,m,d).getYear()-(l.getMonth()===12||l.getMonth()===11&&m<3?0:0);cache[gzY]={rs,yi:Haeseok.yearly(rs,base.input.sex,ageAt(gzY))};}
  const c=cache[gzY];return {rs:c.rs,yi:c.yi,d:Haeseok.daily(c.rs,base,l.getDayInGanZhi(),base.input.sex,c.yi.base.strong),lunar:l};}
function ageAt(gzY){/* 그 태세 해의 세는나이 */const by=base.input.y;for(let y=by;y<by+130;y++){if(Lunar.fromYmd(y,6,1).getYearInGanZhi()===gzY&&y>=by)return y-by+1;}return 1;}
function show(){
  if(mode==='gh'){yInfo=null;dInfo=null;render(base);renderGung();return;}
  if(mode==='jm'){yInfo=null;dInfo=null;render(base);renderJm();return;}
  if(mode==='dm'){yInfo=null;dInfo=null;render(base);renderDream();return;}
  if(mode==='won'){yInfo=null;dInfo=null;render(base);return;}
  if(mode==='il'){
    if(!$('ild').value){const n=new Date(),p=v=>String(v).padStart(2,'0');$('ild').value=n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate());}
    const [y,m,d]=$('ild').value.split('-').map(Number);const cache={};const x=dayInfo(y,m,d,cache);
    yearSel=x.lunar.getYear();$('yr').value=yearSel;yInfo=x.yi;dInfo={x,y,m,d,cache};render(x.rs);return;
  }
  dInfo=null;
  const I=base.input;
  const rs=Gimun.calc(Solar,I.y,I.m,I.d,I.h,I.mi,{adjust:I.adj.a,yearGZ:yearGZ(yearSel)});rs.input=I;
  yInfo=Haeseok.yearly(rs,I.sex,ageNow(base));render(rs);
}

function render(r){
  cur=r;const I=r.input,age=ageNow(r);
  $('head').textContent=(I.name?I.name+' · ':'')+(dInfo?'日辰 '+dInfo.x.d.gz+'日 · 身數局('+r.pillars[0]+') , ':yInfo?'身數局 '+yearSel+'年('+r.pillars[0]+') , ':'元命局 , ')+r.jqHanja+' '+r.yuanName+' '+(r.yang?'陽':'陰')+' '+NUM[r.ju]+'局';
  $('saju').innerHTML=['時','日','月','年'].map((k,i)=>{const c=r.pillars[3-i];return '<div><div class="k">'+k+'柱</div><div class="g">'+c[0]+'<br>'+c[1]+'</div></div>';}).join('');
  const p2=v=>String(v).padStart(2,'0');
  $('meta').innerHTML='양력 '+I.y+'.'+I.m+'.'+I.d+' '+p2(I.h)+':'+p2(I.mi)+(I.adj.why.length?' ('+I.adj.why.join(', ')+' 적용)':'')+' · '+(I.sex==='M'?'남':'여')+' · '+(yInfo?yearSel+'년 ':'올해 ')+age+'세<br>'+'음력 '+r.lunarYmd[0]+'.'+(r.lunarYmd[1]<0?'윤'+(-r.lunarYmd[1]):r.lunarYmd[1])+'.'+r.lunarYmd[2]+' · 순수 '+r.xun+' · 공망 '+r.kongZ.join('');
  let html='';
  for(const p of [4,9,2,3,5,7,8,1,6]){
    const tE=r.tagE[p]||[],tH=r.tagH[p]||[];
    const zhiE=tE.some(t=>t.endsWith('支'))||p===r.sePal, zhiH=tH.some(t=>t.endsWith('支'))||p===r.seHeavPal;
    const dong=zhiE||(p===5&&zhiH);
    const tagStr=a=>{const g=[...new Set(a.map(t=>t[1]))];return g.map(k=>a.filter(t=>t[1]===k).map(t=>t[0]).join('')+k).join(' ');};
    const sal=(r.kong.has(p)?'<span class="kong">空亡</span>':'');
    html+='<div class="cell p'+p+(dong?' dong':'')+(p===5?' center':'')+(yInfo&&!dInfo&&yInfo.out.hangPal===p?' hang':'')+(dInfo&&dInfo.x.d.p===p?' today':'')+'" data-p="'+p+'">';
    html+='<div class="tags"><span>'+(tE.length?'<span class="tag">'+tagStr(tE)+'</span>':'')+'</span><span class="sal">'+sal+'</span><span>'+(r.zhifuPal===p&&p!==5?'':'')+'</span></div>';
    html+='<div class="box">'+(tH.length?'<span class="ht">'+tagStr(tH)+'</span>':'');
    const hidH=p===5?'<span class="hid">'+NUM[r.heavN[5]>5?r.heavN[5]-5:r.heavN[5]+5]+'</span>':'';
    const hidE=p===5?'<span class="hid">'+NUM[r.earthN[5]>5?r.earthN[5]-5:r.earthN[5]+5]+'</span>':'';
    html+='<div class="ln'+(zhiH&&p!==5?' hbar':'')+'"><span class="st">'+(p===5?'':r.heavS[p])+'</span><span class="nm">'+NUM[r.heavN[p]]+(p===5?Haeseok.touchul(r).filter(t=>t.from===r.heavN[5]).map(t=>'<small class="tc">'+NUM[t.to]+'</small>').join(''):'')+'</span>'+hidH+'<span class="lq'+(r.lqH[p]==='世'?' se':'')+'">'+r.lqH[p]+'</span></div>';
    html+='<div class="ln"><span class="st">'+r.earthS[p]+'</span><span class="nm e">'+NUM[r.earthN[p]]+(p===5?Haeseok.touchul(r).filter(t=>t.from===r.earthN[5]).map(t=>'<small class="tc">'+NUM[t.to]+'</small>').join(''):'')+'</span>'+hidE+'<span class="lq e'+(r.lqE[p]==='世'?' se':'')+'">'+r.lqE[p]+'</span></div>';
    if(p===5){html+='<div class="gm"><span>'+r.taiyi[5][0]+'<br>'+r.taiyi[5][1]+'</span></div>';}
    else{
      const w=[r.door[p],r.star[p],r.god[p],r.taiyi[p],r.gua[p]];
      html+='<div class="gm">'+w.map(x=>'<span>'+x[0]+'<br>'+x[1]+'</span>').join('')+'</div>';
    }
    html+='</div>';
    const [h0,h1]=r.ageH[p],[e0,e1]=r.ageE[p];
    const on=(a,b)=>age>=a&&age<=b?' class="on"':'';
    if(yInfo){const ms=Object.keys(MPAL).filter(m=>MPAL[m]===p);html+='<div class="ages"><span class="mo">'+(yInfo.out.hangPal===p?'행년 ':'')+'</span><span class="mo">'+(ms.length?'음 '+ms.join('·')+'월':'')+'</span></div>';}
    else html+='<div class="ages"><span class="un">'+(r.unseong[p]||[]).map(u=>'<span>'+u+'</span>').join('')+'</span><span class="col"><span'+on(h0,h1)+'>('+h0+'~'+h1+')</span><span'+on(e0,e1)+'>('+e0+'~'+e1+')</span></span></div>';
    html+='</div>';
  }
  $('board').innerHTML=html;
  $('out').style.display='block';
  const curPal=[1,2,3,4,5,6,7,8,9].find(p=>{const [a,b]=age<=45?r.ageE[p]:r.ageH[p];return age>=a&&age<=b;});
  $('legend').textContent=dInfo?'⭐ = 사주 지지(동처)가 든 궁 · 주황 테두리 = 그날 일진 지지의 궁 · 칸 아래는 그 궁으로 보는 음력 달이에요. 칸을 누르면 풀이가 나와요.':yInfo?'⭐ = 사주 지지(동처)가 든 궁 · 하얀 표 = 사주 글자 위치 · 보라 테두리 = 올해 행년궁 · 칸 아래는 그 궁으로 보는 음력 달이에요. 칸을 누르면 풀이가 나와요.':LEG0;
  if(dInfo)renderDay();else if(yInfo)renderYear(r);else renderReading(r);
  renderType(r);
  showDetail(dInfo?dInfo.x.d.p:r.sePal,yInfo?null:curPal);
}



// 해요체 → 하게체(할아버지 도깨비 말투)
const hage=(function(){
  const H=0xAC00,cp=c=>c.charCodeAt(0)-H,isH=c=>c&&cp(c)>=0&&cp(c)<11172;
  const dec=c=>{const x=cp(c);return [Math.floor(x/588),Math.floor(x%588/28),x%28];};
  const com=(i,v,t)=>String.fromCharCode(H+i*588+v*28+t);
  const end='(?=[.!?…~,)"”’\\s<]|$)';
  const R=[
    [/하지 마세요/g,'하지 말게'],[/마세요/g,'말게'],
    [/아니에요/g,'아닐세'],[/거예요/g,'걸세'],[/(?:이에요|예요)(?=[.!?…~,)\s<]|$)/g,'일세'],
    [/잖아요/g,'잖나'],[/어때요\?/g,'어떤가?'],[/까요\?/g,'까?'],
  ];
  function verb(w){ // w = 한 낱말의 '…요' 직전 부분
    const a=[...w];const L=a.length;if(!L)return w+'네';const c=a[L-1];if(!isH(c))return w+'네';
    const [i,v,t]=dec(c);const p=a[L-2];
    if(c==='해')return a.slice(0,-1).join('')+'하네';
    if((c==='어'||c==='아')&&L>=2&&isH(p)&&dec(p)[2]){return a.slice(0,-1).join('')+'네';}
    if(t)return w+'네';
    if(c==='워'&&L>=2&&isH(p)){const q=dec(p);if('키세채배비지피싸깨태데메새'.includes(p))return a.slice(0,-1).join('')+'우네';if(!q[2])return a.slice(0,-2).join('')+com(q[0],q[1],17)+'네';}
    if((c==='라'||c==='러')&&L>=2&&isH(p)&&dec(p)[2]===8){const q=dec(p);return a.slice(0,-2).join('')+com(q[0],q[1],0)+'르네';}
    if(v===6)return a.slice(0,-1).join('')+com(i,20,0)+'네';            // ㅕ→ㅣ (생겨→생기, 보여→보이)
    if(v===9)return a.slice(0,-1).join('')+com(i,8,0)+'네';             // ㅘ→ㅗ (와→오, 봐→보)
    if(v===14)return a.slice(0,-1).join('')+com(i,13,0)+'네';           // ㅝ→ㅜ (줘→주)
    if(v===10)return a.slice(0,-1).join('')+com(i,11,0)+'네';           // ㅙ→ㅚ (돼→되)
    if(v===4&&[15,10,4,1,16,17,8].includes(i))return a.slice(0,-1).join('')+com(i,18,0)+'네'; // 커써떠꺼터퍼뻐→ㅡ
    return w+'네';
  }
  return function(s){
    if(!s)return s;
    for(const [re,to] of R)s=s.replace(re,to);
    s=s.replace(/([가-힣]+)세요(?=[.!?…~,)"”\s<]|$)/g,(m,w)=>{const a=[...w];if(a.length>=2&&a[a.length-1]==='으'&&dec(a[a.length-2])[2])return a.slice(0,-1).join('')+'게';return w+'게';});
    s=s.replace(/([가-힣]+)요(?=[.!?…~,)"”’\s<]|$)/g,(m,w)=>{
      if(/(필|중|주|수|개|강|동|소|목)$/.test(w)&&w.length<=2)return m;
      const a=[...w];const L=a.length;const p=a[L-1];
      if(isH(p)&&dec(p)[2]===8&&false)return m;
      if(/[가-힣]게$/.test(w)&&L>=2){const q=dec(a[L-2]);if(q[2]===8)return a.slice(0,-2).join('')+com(q[0],q[1],0)+'겠네';}
      return verb(w);});
    return s;
  };
})();

// ── 항목별 평생 나이 흐름 ──
function lifeHtml(x,k,sex,age){
  const W=x.strong==='weak',SPK=sex==='F'?['官','鬼']:['財'];
  // 좋은 육친·나쁜 육친은 종합 풀이의 전성기·조심할 때 고르는 기준(pickRun)과 같게 맞춰요
  const CFG={
    total:{n:'인생',from:1,good:[],bad:[],t:['인생의 황금기 — 큰일을 벌이고 크게 얻어요','잘 풀리는 때 — 계획한 일이 순조로워요','평범한 때 — 꾸준히 쌓아 가요','몸을 낮출 때 — 무리하지 말고 지켜요']},
    luck:{n:'운',from:1,good:[],bad:[],t:['인생의 황금기 — 큰일을 벌이고 크게 얻어요','잘 풀리는 때 — 계획한 일이 순조로워요','평범한 때 — 꾸준히 쌓아 가요','몸을 낮출 때 — 무리하지 말고 지켜요']},
    money:{n:'재물운',from:15,good:W?['父','兄','財']:['財','孫'],bad:W?['鬼']:['兄','鬼'],t:['돈이 크게 붙는 때 — 종잣돈을 키우고 굴리세요','수입이 늘어요 — 저축·투자에 좋아요','들어오는 만큼 나가요 — 지출 관리가 중요해요','돈이 새기 쉬워요 — 보증·빌려주기·큰 투자 금지']},
    job:{n:'직업운',from:15,good:W?['父','官']:['官','財','孫'],bad:['鬼'],t:['일로 이름을 날리는 때 — 승진·이직·창업 모두 좋아요','인정받는 때 — 성과가 눈에 보여요','제자리를 다지는 때 — 실력을 쌓아요','일이 꼬이기 쉬워요 — 큰 이동은 미루세요']},
    spouse:{n:'애정운',from:18,good:SPK,bad:sex==='F'?['孫']:['兄'],t:['인연이 활짝 피는 때 — 결혼·연애에 가장 좋아요','좋은 사람을 만나기 쉬워요','잔잔한 때 — 지금 관계를 가꿔요','다투거나 멀어지기 쉬워요 — 말을 아끼세요']},
    child:{n:'자녀운',from:20,good:['孫'],bad:['父'],t:['자녀 복이 크게 들어오는 때 — 임신·출산·자녀 경사','자녀와 사이가 좋고 기쁜 일이 생겨요','무난한 때 — 아이와 시간을 늘려요','자녀 일로 마음 쓸 때 — 다그치기보다 들어 주세요']},
    health:{n:'건강운',from:1,good:[],bad:['鬼'],t:['몸이 가볍고 힘이 넘치는 때','건강한 편 — 운동 시작하기 좋아요','무리하면 티가 나요 — 잠과 식사를 챙기세요','몸을 특히 지킬 때 — 검진·안전 꼭 챙기세요']}
  };
  const C=CFG[k];if(!C||!x.runs||!x.runs.length)return '';
  const TH={父:'문서·도움',兄:'사람·경쟁',孫:'재능·새 일',財:'재물',官:'직장·명예',鬼:'압박·시련'};
  const cls=v=>v>=3?0:v>=1.5?1:v>-0.5?2:3;
  const segs=[];
  for(const u of x.runs){if(u.to<C.from)continue;const from=Math.max(u.from,C.from);
    const v=u.g+(C.good.includes(u.k)?1:0)-(C.bad.includes(u.k)?1:0);const c=cls(v);const L=segs[segs.length-1];
    if(L&&L.c===c&&L.to+1>=from){L.to=u.to;if(!L.th.includes(TH[u.k]))L.th.push(TH[u.k]);}
    else segs.push({from,to:u.to,c,th:[TH[u.k]]});}
  if(!segs.length)return '';
  const GL=[['아주 좋음','lv0'],['좋음','lv1'],['보통','lv2'],['조심','lv3']];
  const span=segs[segs.length-1].to-segs[0].from+1;
  const rg=u=>u.from+(u.to>u.from?'~'+u.to:'')+'세';
  const now=u=>age>=u.from&&age<=u.to;
  let h='<div class="life"><p class="lifeH">🗓️ 평생 '+C.n+' 흐름 <span>(나이별)</span></p><div class="lifeBar">'+segs.map(u=>'<i class="'+GL[u.c][1]+(now(u)?' nw':'')+'" style="flex:'+(u.to-u.from+1)+'" title="'+rg(u)+'"></i>').join('')+'</div>';
  h+='<div class="lifeAx"><span>'+segs[0].from+'세</span><span>'+Math.round(segs[0].from+span/2)+'세</span><span>'+segs[segs.length-1].to+'세</span></div>';
  h+='<div class="lifeL">'+segs.map(u=>'<div class="lifeR'+(now(u)?' nw':'')+'"><b>'+rg(u)+(now(u)?' <em>지금</em>':'')+'</b><span class="lp '+GL[u.c][1]+'">'+GL[u.c][0]+'</span><p>'+C.t[u.c]+'<small> · '+u.th.slice(0,2).join('·')+' 기운</small></p></div>').join('')+'</div>';
  const best=segs.filter(u=>u.c===0).map(rg),bad=segs.filter(u=>u.c===3).map(rg);
  h+='<p class="note" style="margin:6px 0 0">대운(나이별 궁의 수)과 이 항목에 맞는 육친으로 계산한 참고용 흐름이에요.</p><p class="lifeSum">'+(best.length?'🌟 <b>가장 좋은 때</b> '+best.join(', '):'🌟 크게 튀는 때 없이 고른 편이에요')+(bad.length?'<br>⚠️ <b>조심할 때</b> '+bad.join(', '):'<br>⚠️ 크게 조심할 때는 없어요')+'</p></div>';
  return h;
}
function wbHtml(r,x,age){
  const w=Haeseok.wonbi(r,age,x.strong);const GL={2:['좋음','g2'],1:['무난·좋음','g1'],0:['보통','g0'],'-1':['주의','gm1']};const lab=g=>GL[g]||GL[0];
  const dir=p=>{const m=/\((.+)\)/.exec(PK[p]);return m?m[1]:'가운데';};
  let h='<p class="wbHead"><b>'+age+'세</b>는 홍국수 <b>'+NUM[w.X]+'</b>의 나이예요. '+(w.heav?'46세부터는 <b>천반</b>':'45세까지는 <b>지반</b>')+'에서 찾아요.</p>';
  h+='<p>'+(w.pals.length?'자리: '+w.pals.map(p=>PK[p]).join(', '):'⚠️ 이 판의 '+(w.heav?'천반':'지반')+'에 '+NUM[w.X]+'이(가) 없어요. 책의 "없는 육신 보는 법"은 아직 앱에 넣지 않아, 수의 기운만으로 봤어요.')+'</p>';
  const c=lab(w.g);h+='<p><span class="lp '+c[1]+'">'+c[0]+'</span> '+w.j.txt+'</p>';
  if(w.rels.length)h+='<p class="wbRel">작용 순서 (삼합 → 반합 → 육합 → 생 → 충극): '+w.rels.map(q=>q.type+' '+q.with.map(n=>NUM[n]).join('·')).join(' → ')+'</p>';
  h+='<table class="runs wbT"><tr><th>달</th><th>수</th><th>작용</th><th>흐름</th></tr>'+w.months.map(m=>{const c=lab(m.g);return '<tr><td>'+m.m+'월'+(m.which==='first'?'<small>선</small>':m.which==='second'?'<small>후</small>':'')+'</td><td>'+NUM[m.n]+'</td><td>'+m.txt.replace(/^\S+\s*/,'')+'</td><td class="'+c[1]+'">'+c[0]+'</td></tr>';}).join('')+'</table>';
  h+='<p class="note">원국비기 방식: 나이 끝자리 수(十은 0)를 45세까지 지반, 46세부터 천반에서 찾아요. 달은 그 수를 음력 1월로 두고 '+(w.heav?'수를 하나씩 줄여 가며(역행)':'수를 하나씩 늘려 가며(순행)')+' 붙이고, 11·12월은 1·2월과 같은 수예요. 같은 수의 두 달은 앞선 달(1·2월)이 합(없으면 생), 뒤 달(11·12월)이 그다음 순서(생, 없으면 충극)로 갈려요. 짝이 되는 수는 동처(사주가 놓인 궁·世궁·중궁)의 수 '+w.dong.map(n=>NUM[n]).join('·')+'예요. 46세 이후 역행을 "수가 줄어드는 방향"으로 본 것과 좋음·주의 판정 점수는 앱의 해석이에요.</p>';
  return h;
}
function wbDayHtml(r,x,ds){
  try{const [y,m,d]=ds.split('-').map(Number);const o=Haeseok.wonbiDay(r,y,m,d,x.strong);const GL={2:['좋음','g2'],1:['무난·좋음','g1'],0:['보통','g0'],'-1':['주의','gm1']};const c=GL[o.g]||GL[0];
    const JQK={立春:'입춘',惊蛰:'경칩',清明:'청명',立夏:'입하',芒种:'망종',小暑:'소서',立秋:'입추',白露:'백로',寒露:'한로',立冬:'입동',大雪:'대설',小寒:'소한'};
    return '<p><span class="lp '+c[1]+'">'+c[0]+'</span> <b>'+m+'월 '+d+'일</b>은 '+o.age+'세, 절기로 '+o.idx+'월('+(JQK[o.jie]||o.jie)+' '+o.jieYmd.slice(5).replace('-','/')+'부터 '+(o.days+1)+'일째)이라 그 달의 수 '+NUM[o.mn]+'에서 '+(o.heav?'하루씩 줄여':'하루씩 늘려')+' 이날의 수는 <b>'+NUM[o.n]+'</b>. '+o.txt+'</p>';}
  catch(e){return '<p class="note">이 날짜는 계산할 수 없어요.</p>';}
}
function deepHtml(r,x){
  const H=Haeseok,EK={水:'수',火:'화',木:'목',金:'금',土:'토'},COL={水:'검정·파랑',木:'초록',火:'빨강·분홍',土:'노랑·황토',金:'흰색·은색'};
  const PALC={1:'중남(가운데 자식) 자리 — 소통·조율·끈기',9:'중녀 자리 — 소통·조율·끈기',3:'장남 자리 — 추진력·리더십',4:'장녀 자리 — 추진력·리더십',8:'소남 자리 — 천진함·순수함',7:'소녀 자리 — 천진함·순수함',6:'부친 자리 — 근엄·강직·책임',2:'모친 자리 — 보살핌·포용',5:'중궁 — 중심'};
  const ok=v=>v?'✅':'❌',w=x.wang||{};
  let h='<p><b>① 世의 왕쇠</b> · '+x.strongKo+'</p><p class="dpRow">'+ok(w.geo)+' 거왕(자리) '+ok(w.seung)+' 승왕(달) '+ok(w.susaeng)+' 수생·겸왕(천반) — 셋 중 둘 이상이면 왕이에요.</p>';
  const YK={父:'인성(父)',兄:'비겁(兄)',孫:'식상(孫)',財:'재성(財)',官:'관성(官)',鬼:'편관(鬼)'};
  h+='<p><b>② 용신·진용</b> · 용신은 <b>'+(YK[x.yong]||x.yong)+'</b>이에요('+(x.strong==='weak'?'世가 약하면 인성을 써요':'世가 왕하면 재·관·손 중 왕한 것을 써요')+').</p>';
  const J=H.jinyong(r,x.yong);
  if(J.cand.length){h+='<p>진용 후보: '+J.cand.map(c=>'<b>'+NUM[c.n]+'('+c.k+')</b> — '+c.q.type+(c.q.with?'('+c.q.with.map(n=>NUM[n]).join('·')+')':'')+'으로 용신 '+EK[J.yE]+' 기운을 왕성하게 해요').join('; ')+'</p>';
    const c=J.cand[0],pp=c.pals[0];if(pp)h+='<p>🍀 개운: <b>'+PK[pp]+'</b>을 취해요 — '+(pp===5?'집·가게의 한가운데를 밝고 단정하게':(PALC[pp]||'')+'의 태도로, 방향은 '+(/\((.+)\)/.exec(PK[pp])||['',''])[1]+'쪽')+', 색은 '+COL[EL4(c.n)]+'.</p>';}
  else h+='<p>동처에서 용신을 더 왕성하게 하는 합이 보이지 않아 진용 후보가 없어요. 용신 자체를 쓰면 돼요.</p>';
  const TC=H.touchul(r);if(TC.length)h+='<p><b>중궁 투출</b> · '+TC.map(t=>'중궁의 '+NUM[t.from]+'에서 '+NUM[t.to]+'이(가) 투출돼 동처로 함께 봐요').join(', ')+'</p>';
  const JD=H.junDong(r);h+='<p><b>준동</b> · '+(JD.length?JD.map(j=>PK[j.p]+'의 '+NUM[j.n]+'·'+NUM[j.h]+'(겸왕, '+j.why+')').join(', ')+' — 사지·중궁처럼 동한 것으로 함께 풀이해요.':'겸왕하면서 왕한 외궁 수가 없어 준동은 없어요.')+'</p>';
  const M=H.missingLq(r);
  h+='<p><b>③ 없는 육신</b> · '+(M.length?M.map(m=>m.ko+'이(가) 동처에 없어 '+(m.sub?'<b>'+m.subKo+'</b>이(가) 대신해요':'대신할 육신도 없어요')).join(' / '):'동처에 다섯 육신이 모두 있어요.')+'</p>';
  const SL=H.sals(r);
  h+='<p><b>④ 살</b> · '+(SL.length?'':'동처에 七五九 삼살, 三二九 삼형살, 화금상전, 자형·육파가 보이지 않아요.')+'</p>'+SL.map(q=>'<p class="dpRow">'+(q.bad?(q.light?'▫️':'⚠️'):'🌟')+' <b>'+q.name+'</b> · '+q.txt+'</p>').join('');
  const SS0=H.salsung(r),SS=[];SS0.forEach(q=>{const o=SS.find(z=>z.base===q.base&&z.br===q.br);if(o){o.lab='년지·일지';o.dbl=true;if(o.base==='역마')o.nm='역마';}else SS.push(Object.assign({},q));});
  h+='<p><b>⑤ 살성 궁</b> (년지·일지 기준)</p><table class="runs dpT"><tr><th>살</th><th>기준</th><th>궁</th><th>그 지지의 수(육친)</th></tr>'+SS.map(q=>'<tr><td>'+(q.dbl?'쌍':'')+q.nm+'</td><td>'+q.lab+'</td><td>'+PK[q.pal]+'</td><td>'+NUM[q.n]+'('+(q.k==='世'?'세':q.k)+')'+(q.tags.length?' · '+q.tags.join(','):'')+'</td></tr>').join('')+'</table>';
  h+='<p class="dpRow">🐎 <b>마궁(=천마)</b> · '+[...new Set(SS.filter(q=>q.base==='역마').map(q=>PK[q.pal]))].join(', ')+'</p>'+['도화','역마','겁살','망신'].map(n=>'<p class="dpRow"><b>'+n+'</b> · '+SS.find(q=>q.base===n).mean+'</p>').join('')+(SS.some(q=>q.dbl)?'<p class="dpRow">‘쌍’은 년지와 일지 기준이 겹친 것으로, 작용이 배가 돼요.</p>':'');
  h+='<p class="note">책의 원리로 본 부분이에요. 다만 동처를 사주가 놓인 궁·世궁·중궁·준동으로 잡은 것, 진용 후보를 합으로만 찾은 것, 살성을 년지·일지의 12신살로 계산한 것은 앱의 해석이에요. 준동은 책의 정의(외궁의 겸왕 + 자리 또는 월령의 생조)대로, 천마는 책에 적힌 대로 마궁과 같게 봤어요.</p>';
  return h;
}
const EL4=n=>['水','火','木','金','土'][(n-1)%5];
function renderReading(r){
  const x=Haeseok.interpret(r,r.input.sex,ageNow(r));
  try{const EK={水:'수',火:'화',木:'목',金:'금',土:'토'};const hp=r.seHeavPal;
    let t='🌀 <b>세기(世氣)</b> · 世는 '+PK[r.sePal]+'의 지반 '+NUM[r.se]+'이고, 천반의 같은 수 자리('+PK[hp]+')로 올라가 함께 나를 나타내요.';
    if(r.heavN[hp]!==r.se)t='🌀 <b>세기(世氣)</b> · 世는 '+PK[r.sePal]+'의 지반 '+NUM[r.se]+'이에요. 천반에 같은 수가 없어서 같은 오행의 '+NUM[r.heavN[hp]]+'('+PK[hp]+')를 세기 자리로 대신 봤어요. 이 대체 규칙은 책에 없는 앱의 규칙이에요.';
    const hs=Haeseok.relations(r,r.se).filter(q=>q.type==='삼합'||q.type==='육합');
    if(hs.length)t+=' 세궁 수가 동처의 '+hs.map(q=>q.with.map(n=>NUM[n]).join('·')+'와 '+q.type).join(', ')+'을 이뤄 세기가 <b>'+[...new Set(hs.map(q=>EK[q.el]))].join('·')+'</b> 기운으로 바뀌어 작용할 수 있어요(삼합이 먼저예요).';
    x.S.total.push(t);}catch(e){console.error(e);}
  const T={total:'총평',char:'성격',money:'재물',job:'직업·적성',spouse:'배우자',child:'자녀',health:'건강',luck:'대운 흐름',lucky:'🍀 행운 처방'};
  const star=n=>n?'<span class="rdStar">'+'★'.repeat(n)+'<i>'+'★'.repeat(5-n)+'</i></span>':'';
  let h='<h2>📜 종합 풀이</h2><span class="badge">'+x.strongKo+' · 용신 '+x.yong+'</span>';
  try{const HL=x.HL||{},cr=x.curRun,st=v=>String(v||'').replace(/^[^\s가-힣「]+\s*/,'');
    const bat=w=>{const c=String(w).replace(/[^가-힣]/g,'').slice(-1);return c&&((c.charCodeAt(0)-0xAC00)%28)?'이에요':'예요';};
    const L=[];if(HL.char)L.push('🙂 <b>자네는</b> · '+st(HL.char)+'일세');
    if(HL.money)L.push('💰 <b>돈</b> · '+st(HL.money));if(HL.job)L.push('💼 <b>일</b> · '+st(HL.job));
    if(cr)L.push('⏳ <b>지금('+cr.from+(cr.to>cr.from?'~'+cr.to:'')+'세)</b> · '+cr.theme+'의 시기고, 흐름은 <b>'+(cr.g>=2?'좋네':cr.g>=1?'괜찮은 편일세':cr.g<=-1?'조심할 때일세':'보통일세')+'</b>');
    if(HL.luck)L.push('🧭 <b>지금 할 일</b> · '+st(HL.luck));
    if(L.length)h+='<div data-sec="sum" class="bub dk rdTalk"><span class="av">👹</span><div><p class="ansV"><b>허허, 한마디로 정리해 주겠네.</b></p>'+L.map(t=>'<p>'+t+'</p>').join('')+'<p class="note">궁금한 게 있으면 위에서 이 영감한테 그냥 물어보게.</p></div></div>';}catch(e){console.error(e);}
  const sec=k=>'<div data-sec="'+k+'" class="rdSec'+(k==='total'?' top':k==='lucky'?' lucky':'')+'"><h4>'+T[k]+'</h4>'+star(x.SC&&x.SC[k])+(x.HL&&x.HL[k]?'<p class="rdHL">'+x.HL[k]+'</p>':'')+lifeHtml(x,k,r.input.sex,ageNow(r))+x.S[k].map(t=>'<p'+(/^📌/.test(t)?' class="note"':'')+'>'+t+'</p>').join('')+'</div>';
  for(const k of Object.keys(T)){if(k==='lucky'||!x.S[k]||!x.S[k].length)continue;h+=sec(k);}
  const gc=g=>g>=2?['g2','좋음']:g>=1?['g1','무난·좋음']:g<=-1?['gm1','주의']:['g0','보통'];
  h+='<div data-sec="deep" class="rdSec"><h4>🔎 원리 풀이</h4><p class="rdHL">왕쇠·용신·진용·없는 육신·살·살성을 근거와 함께</p>'+deepHtml(r,x)+'</div>';
  {const a0=ageNow(r);h+='<div data-sec="wonbi" class="rdSec"><h4>🗓️ 나이·달 보기</h4><p class="rdHL">원명국 수만으로 그 나이와 달의 일을 짚어 봐요</p><label class="wbSel">나이 <select id="wbAge">'+Array.from({length:90},(_,i)=>i+1).map(a=>'<option'+(a===a0?' selected':'')+'>'+a+'</option>').join('')+'</select> 세</label><div id="wbOut">'+wbHtml(r,x,a0)+'</div><h4 style="margin-top:14px">📆 하루 일운</h4><label class="wbSel">날짜 <input type="date" id="wbDay" value="'+(()=>{const t=new Date(),P=v=>String(v).padStart(2,'0');return t.getFullYear()+'-'+P(t.getMonth()+1)+'-'+P(t.getDate());})()+'"></label><div id="wbDayOut">'+wbDayHtml(r,x,(()=>{const t=new Date(),P=v=>String(v).padStart(2,'0');return t.getFullYear()+'-'+P(t.getMonth()+1)+'-'+P(t.getDate());})())+'</div><p class="note">하루 일운: 절기로 바뀌는 달의 첫날(절입일)을 그 달의 수로 두고, 45세까지는 하루에 수를 하나씩 늘리고(순행) 46세부터는 줄여요(역행). 판정은 그날 수의 합·생·충극 작용으로 봐요.</p></div>';}
  h+='<div data-sec="luck" class="rdRuns"><h4>대운표</h4><table class="runs"><tr><th>나이</th><th>궁</th><th>수·육친</th><th>중심 주제</th><th>흐름</th></tr>';
  const DKr={休門:'휴문',生門:'생문',傷門:'상문',杜門:'두문',景門:'경문',死門:'사문',驚門:'경문(驚)',開門:'개문'},GKr={生氣:'생기',天宜:'천의',絶體:'절체',遊魂:'유혼',禍害:'화해',福德:'복덕',絶命:'절명',歸魂:'귀혼'};
  const SSr=Haeseok.salsung(r),salAt=q=>[...new Set(SSr.filter(z=>z.pal===q).map(z=>z.base==='역마'?'마궁':z.base==='도화'?'도궁':z.base==='겁살'?'겁궁':'망궁'))];
  for(const u of x.runs){const c=gc(u.g);const sl=salAt(u.gp);h+='<tr'+(u===x.curRun?' class="now"':'')+'><td>'+u.from+(u.to>u.from?'~'+u.to:'')+'</td><td>'+PN[u.p]+(u.lv==='천반'?'(天)':'')+'</td><td>'+NUM[u.n]+' '+u.k+'</td><td>'+u.theme+'<small class="mRel">'+(DKr[u.door]||'')+(u.gua?'·'+GKr[u.gua]:'')+(u.gp!==u.p?' ('+PN[u.gp]+' 지반 기준)':'')+(sl.length?' · '+sl.join('·'):'')+'</small></td><td class="'+c[0]+'">'+c[1]+'</td></tr>';}
  h+='</table></div>'+(x.S.lucky&&x.S.lucky.length?sec('lucky'):'')+'<p class="note" data-sec="total">이 풀이는 홍국수의 생극·합충과 世의 강약을 규칙으로 판단해 자동으로 만든 참고용이에요. 실제 감정은 삼합·삼형·신살·동처 관계를 함께 봐야 해서 전문가 풀이와 다를 수 있어요.</p>';
  $('reading').innerHTML=h;
  {const sel=$('wbAge');if(sel)sel.addEventListener('change',()=>{$('wbOut').innerHTML=wbHtml(r,x,+sel.value);if(window.__hangulize)window.__hangulize($('wbOut'));});
   const dd=$('wbDay');if(dd)dd.addEventListener('change',()=>{if(!dd.value)return;$('wbDayOut').innerHTML=wbDayHtml(r,x,dd.value);if(window.__hangulize)window.__hangulize($('wbDayOut'));});}
  try{document.querySelectorAll('#mnGrid .ms').forEach(el=>{const k=el.dataset.s,n=x.SC&&x.SC[k];el.textContent=n?'★'.repeat(n)+'☆'.repeat(5-n):'';});}catch(e){}
}

function renderYear(r){
  const o=yInfo.out,b=yInfo.base;
  let h='<h2>🎊 '+yearSel+'년 신수</h2><span class="badge">'+r.pillars[0]+'년 · '+ageNow(base)+'세 · '+b.strongKo+'</span>';
  h+='<h4>한 해 총운</h4>'+o.total.map(t=>'<p>'+t+'</p>').join('');
  h+='<h4>분야별</h4>'+o.field.map(t=>{const i=t.indexOf(' · ');return '<p><b>'+t.slice(0,i)+'</b> · '+t.slice(i+3)+'</p>';}).join('');
  h+='<h4>행년 (그해의 큰일)</h4>'+o.hang.map(t=>'<p>'+t+'</p>').join('');
  const gc=g=>g>=2?['g2','좋음']:g>=1?['g1','무난·좋음']:g<=-1?['gm1','주의']:['g0','보통'];
  const nowM=(()=>{try{const l=Solar.fromDate(new Date()).getLunar();return l.getYear()===yearSel?Math.abs(l.getMonth()):0;}catch(e){return 0;}})();
  h+='<h4>월운 (음력)</h4><table class="runs"><tr><th>달</th><th>궁</th><th>천반수</th><th>중심 주제</th><th>흐름</th></tr>';
  for(const m of o.months){const c=gc(m.g);h+='<tr'+(m.m===nowM?' class="now"':'')+'><td>'+m.m+'월'+(m.which==='first'?'<small class="wbS">선</small>':m.which==='second'?'<small class="wbS">후</small>':'')+'</td><td>'+PN[m.p]+'</td><td>'+NUM[m.n]+' '+m.k+'</td><td>'+m.theme+(m.rtxt?'<small class="mRel">'+m.rtxt.replace(/^\S+\s*/,'')+'</small>':'')+'</td><td class="'+c[0]+'">'+c[1]+'</td></tr>';}
  h+='</table><p class="note">신수국은 년주를 그해 태세로 바꾸고 생월·생일·생시는 그대로 두어 세웠어요. 월운은 달마다 해당 궁(1월·12월 간궁, 2월 진궁, 3·4월 손궁, 5월 이궁, 6·7월 곤궁, 8월 태궁, 9·10월 건궁, 11월 감궁)의 천반 홍국수로 봐요. 한 궁을 함께 쓰는 두 달은 앞 달(12·3·6·9월, 선)을 삼합·반합·육합으로(합이 없으면 생), 뒤 달(1·4·7·10월, 후)을 그다음 순서인 생으로(생이 없으면 충극) 나눠 봐요. 짝이 되는 수는 동처(사주가 놓인 궁·世궁·중궁)의 수예요. 행년은 나이 끝자리 수가 있는 궁(45세까지 지반, 46세부터 천반)의 천반 수로 봐요. 자동 판단이라 참고용이에요.</p>';
  $('reading').innerHTML=h;
}

function renderDay(){
  const {x,y,m,d,cache}=dInfo;const gc=g=>g>=1.5?['g2','좋음']:g>=0.5?['g1','무난·좋음']:g<=-1?['gm1','주의']:['g0','보통'];
  const c=gc(x.d.g);const l=x.lunar;
  let h='<h2>☀️ '+y+'.'+m+'.'+d+' 일진</h2><span class="badge">'+x.d.gz+'일 · 음력 '+Math.abs(l.getMonth())+'.'+l.getDay()+' · '+c[1]+'</span>';
  h+=x.d.lines.map(t=>'<p>'+t+'</p>').join('');
  h+='<h4>'+y+'년 '+m+'월 일진 달력</h4><div class="cal">'+['일','월','화','수','목','금','토'].map(w=>'<div class="wd">'+w+'</div>').join('');
  const first=new Date(y,m-1,1).getDay(),last=new Date(y,m,0).getDate();
  for(let i=0;i<first;i++)h+='<div></div>';
  for(let dd=1;dd<=last;dd++){const z=dayInfo(y,m,dd,cache);const g=z.d.g;const cls=g>=1.5?'c2':g>=0.5?'c1':g<=-1?'cm':'';
    h+='<button class="'+cls+(dd===d?' sel':'')+'" data-d="'+dd+'">'+dd+'<small>'+z.d.gz+'</small></button>';}
  h+='</div><p class="note">진한 초록 = 좋음, 연한 초록 = 무난·좋음, 분홍 = 주의예요. 날짜를 누르면 그날 일진이 나와요. 일진은 그날 지지를 홍국수로 바꿔 그해 신수국의 世와 비교하고(육친·합·충), 그 지지가 놓인 궁의 천반 수를 함께 봐서 자동으로 판단한 참고용이에요. 9궁도의 주황 테두리가 그날 일진 지지의 궁이에요.</p>';
  $('reading').innerHTML=h;
  $('reading').querySelectorAll('.cal button').forEach(b=>b.addEventListener('click',()=>{const p=v=>String(v).padStart(2,'0');$('ild').value=y+'-'+p(m)+'-'+p(+b.dataset.d);show();}));
}

const GM_TYPES={
  ESTJ:['⛰️','큰 산 같은','지휘관형'],ESTP:['⚡','번개 같은','도전가형'],ESFJ:['🌞','햇살 같은','살림꾼형'],ESFP:['🎆','불꽃놀이 같은','분위기 메이커형'],
  ENTJ:['🔥','횃불 같은','리더형'],ENTP:['🌪️','회오리 같은','아이디어형'],ENFJ:['🌈','무지개 같은','이끄미형'],ENFP:['🌸','봄꽃 같은','자유영혼형'],
  ISTJ:['🪨','바위 같은','원칙주의형'],ISTP:['⚔️','칼날 같은','해결사형'],ISFJ:['🌾','논밭 같은','수호자형'],ISFP:['🍃','잎새 같은','예술가형'],
  INTJ:['🌙','달빛 같은','전략가형'],INTP:['💧','깊은 물 같은','탐구자형'],INFJ:['⭐','별빛 같은','선견자형'],INFP:['🫧','맑은 샘물 같은','이상가형']};
function renderType(r){
  if(yInfo||dInfo){$('typecard').style.display='none';$('fourcard').style.display='none';return;}
  $('typecard').style.display='';$('fourcard').style.display='';
  const t=Saju4.personality(r.pillars,r);
  const TY=GM_TYPES[t.code]||['🔮','나만의','유형'];
  let h='<h2>💖 사주로 본 나의 기질</h2><span class="badge">사주 여덟 글자로 본 타고난 기질</span>';
  h+='<div class="tp tp2"><span class="tyEm">'+TY[0]+'</span><span class="tyName"><small>'+TY[1]+'</small>'+TY[2]+'</span></div>';
  h+=t.axes.map(a=>{const l=a.side==='a';const w=a.pct;const A=a.a.replace(/^[A-Z] /,''),B=a.b.replace(/^[A-Z] /,'');return '<div class="ax"><span class="'+(l?'on':'')+'">'+A+'</span><span class="bar"><i style="'+(l?'left:0;width:'+w+'%':'right:0;width:'+w+'%')+'"></i></span><span class="'+(!l?'on':'')+'">'+B+'</span></div>';}).join('');
  h+='<h4>성격</h4><p>'+t.core+'</p>';
  h+='<h4>연애 스타일</h4><p>'+t.love+'</p>';
  h+='<h4>일하는 스타일</h4><p>'+t.work+'</p>';
  h+='<h4>잘 맞는 사람</h4><p>'+t.match.map(c=>GM_TYPES[c]?GM_TYPES[c][0]+' '+GM_TYPES[c][1]+' '+GM_TYPES[c][2]:c).join(', ')+'과 서로 부족한 점을 채워 줘요. '+t.matchEl+'</p>';
  h+='<h4>한마디 조언</h4><p>'+t.advice+'</p>';
  h+='<p class="note">심리 검사 결과가 아니라, '+t.whyEl+'의 분포와 십신(비겁·식상·재성·관성·인성)을 네 가지 성향으로 바꿔 풀어 본 도깨비 사주만의 기질 유형이에요. 참고로 비슷한 성격 유형 코드는 '+t.code+'예요.</p>';
  $('typecard').innerHTML=h;
  const F=Saju4.fourPillars(r.pillars);
  let f='<h2>🏛️ 4주 풀이</h2><span class="badge">년주 · 월주 · 일주 · 시주</span>';
  for(const x of F){f+='<div class="pl"><div class="t"><span class="gz">'+x.gz+'</span><b>'+x.name+'</b><span class="rl">'+x.ko+' · '+x.role+'</span></div>';
    f+='<div class="chips">천간 '+x.sg+' · 지지 '+x.sz+' · 12운성 '+x.un+'</div>'+x.lines.filter(Boolean).map(t=>'<p>'+t+'</p>').join('')+'</div>';}
  f+='<p class="note">십신은 일간(태어난 날의 천간)을 기준으로, 지지는 본기(대표 천간)로 봤어요.</p>';
  $('fourcard').innerHTML=f;
}

function showDetail(p,curPal){
  const r=cur;if(!r)return;
  document.querySelectorAll('.cell').forEach(c=>c.classList.toggle('sel',+c.dataset.p===p));
  const el=n=>EL_KO[Gimun.EL(n)];
  let h='<h3>'+PN[p]+' · '+PK[p]+'</h3>';
  {const PI={4:['화궁','손위풍(巽爲風)','유순·공손·장녀','辰巳월 · 음력 3·4월 · 청명·입하','동남'],9:['화궁','이위화(離爲火)','떼어 놓다·가르다·끊다·나누다·헤어짐·물러남·떠나감·배반·반작용·중녀','午월 · 음력 5월 · 망종(하지)','남'],2:['금궁','곤위지(坤爲地)','땅·대지·포용·흡수·모친','未申월 · 음력 6·7월 · 소서·입추','서남'],3:['목궁','진위뢰(震爲雷)','벼락·천둥·떨다·움직임·놀람·두려움·성냄·지진·장남','卯월 · 음력 2월 · 경칩','동'],5:['토궁','중궁(中宮)','가운데·중심','',''],7:['금궁','태위택(兌爲澤)','빛남·기름지다·바꾸다·기쁨·지름길·소녀','酉월 · 음력 8월 · 백로','서'],8:['목궁','간위산(艮爲山)','어긋남·거스르다·그침·어려워하다·소남','寅丑월 · 음력 1·12월 · 소한·입춘','동북'],1:['수궁','감위수(坎爲水)','구덩이·험난·험하다·중남','子월 · 음력 11월 · 동지','북'],6:['수궁','건위천(乾爲天)','하늘·임금·부친','戌亥월 · 음력 9·10월 · 한로·입동','서북']}[p];
   if(PI)h+='<p class="tagline">'+PI[0]+' · '+PI[1]+' · '+PI[2]+(PI[3]?' · '+PI[3]:'')+(PI[4]?' · '+PI[4]:'')+'</p>';}
  h+='<p class="tagline">천반 '+(p===5?'':r.heavS[p]+' ')+NUM[r.heavN[p]]+'('+el(r.heavN[p])+') '+r.lqH[p]+' · 지반 '+r.earthS[p]+' '+NUM[r.earthN[p]]+'('+el(r.earthN[p])+') '+r.lqE[p]+'</p><p class="tagline">세부 육친 · 천반 '+Haeseok.subLq(r.heavN[p],r.se)+' · 지반 '+Haeseok.subLq(r.earthN[p],r.se)+'</p>';
  const tags=[...(r.tagE[p]||[]).map(t=>t+'(지반)'),...(r.tagH[p]||[]).map(t=>t+'(천반)')];
  if(tags.length)h+='<p><b>사주 글자</b> · '+tags.join(', ')+'</p>';
  if(p===r.sePal)h+='<p><b>世궁(나의 자리)</b> · '+PK[p]+'은 가족으로 치면 '+FAM[p]+'의 자리예요. 世의 홍국수는 '+NUM[r.se]+'('+el(r.se)+')예요.</p>';
  h+='<p><b>천반 '+r.lqH[p]+'</b> · '+LQ[r.lqH[p]]+'</p>';
  if(r.lqE[p]!==r.lqH[p])h+='<p><b>지반 '+r.lqE[p]+'</b> · '+LQ[r.lqE[p]]+'</p>';
  if(p!==5){
    h+='<p><b>'+r.door[p]+'</b> · '+DM[r.door[p]]+'</p>';
    h+='<p><b>'+r.gua[p]+'</b> · '+GU[r.gua[p]]+'</p>';
    h+='<p class="tagline">'+r.star[p]+' · '+r.god[p]+' · '+r.taiyi[p]+'</p>';
  }
  if(r.kong.has(p))h+='<p><b>공망</b> · 이 궁의 육친은 힘을 제대로 쓰지 못하는 것으로 봐요(왕하면 면공).</p>';
  const [e0,e1]=r.ageE[p],[h0,h1]=r.ageH[p];
  if(yInfo){const ms=Object.keys(MPAL).filter(m=>MPAL[m]===p);if(ms.length)h+='<p><b>월운</b> · 음력 '+ms.join('·')+'월은 이 궁의 천반 '+NUM[r.heavN[p]]+'('+r.lqH[p]+')로 봐요.</p>';if(yInfo.out.hangPal===p)h+='<p><b>행년궁</b> · 올해 큰일이 이 궁에서 드러나요.</p>';}
  else h+='<p><b>대운</b> · '+e0+'~'+e1+'세(지반), '+h0+'~'+h1+'세(천반)</p>';
  if(curPal&&curPal!==p)h+='<p class="tagline">올해 '+ageNow(r)+'세 대운은 '+PN[curPal]+'궁이에요. 그 칸을 눌러 보세요.</p>';
  $('detail').innerHTML=h;
}

$('board').addEventListener('click',e=>{const c=e.target.closest('.cell');if(c)showDetail(+c.dataset.p);});

function go(){
  const e=$('err');e.style.display='none';
  try{if(typeof Solar==='undefined')throw new Error('만세력 라이브러리를 불러오지 못했어요.');base=compute();show();$('out').scrollIntoView({behavior:'smooth'});}
  catch(err){e.textContent=err.message;e.style.display='block';}
}
$('go').addEventListener('click',go);
$('edit').addEventListener('click',()=>$('form').scrollIntoView({behavior:'smooth'}));
$('now').addEventListener('click',()=>{const n=new Date(),p=v=>String(v).padStart(2,'0');$('d').value=n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate());$('t').value=p(n.getHours())+':'+p(n.getMinutes());[...$('cal').children].forEach((x,i)=>x.classList.toggle('on',i===0));cal='S';go();});

// 저장
const KEY='hongmyeongguk.saved';
function loadSaved(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch(e){return [];}}
function drawSaved(){
  const list=loadSaved();$('savedWrap').style.display=list.length?'block':'none';
  $('saved').innerHTML=list.map((s,i)=>'<button data-i="'+i+'">'+(s.name||'이름 없음')+' '+s.d.slice(2)+'</button>').join('');
}
$('saved').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const s=loadSaved()[+b.dataset.i];
  $('nm').value=s.name;$('d').value=s.d;$('t').value=s.t;sex=s.sex;cal='S';$('adj').checked=s.adj!==false;
  [...$('sex').children].forEach(x=>x.classList.toggle('on',x.dataset.v===sex));[...$('cal').children].forEach((x,i)=>x.classList.toggle('on',i===0));go();});
$('save').addEventListener('click',()=>{if(!cur)return;const I=cur.input,p=v=>String(v).padStart(2,'0');
  const item={name:I.name,d:I.y+'-'+p(I.m)+'-'+p(I.d),t:p(I.h)+':'+p(I.mi),sex:I.sex,adj:$('adj').checked};
  const list=loadSaved().filter(s=>!(s.d===item.d&&s.t===item.t&&s.name===item.name));list.unshift(item);
  try{localStorage.setItem(KEY,JSON.stringify(list.slice(0,30)));$('save').textContent='저장했어요';setTimeout(()=>$('save').textContent='이 명국 저장',1500);}catch(e){$('save').textContent='저장할 수 없어요';}
  drawSaved();});

// ── 매일 일진 알림 (앱으로 설치했을 때 동작) ──
const AL_KEY='hongmyeongguk.alarm';
const LN=(()=>{try{const C=window.Capacitor;if(!C||!(C.isNativePlatform&&C.isNativePlatform()))return null;return (C.Plugins&&C.Plugins.LocalNotifications)||(C.registerPlugin&&C.registerPlugin('LocalNotifications'))||null;}catch(e){return null;}})();
function alLoad(){try{return JSON.parse(localStorage.getItem(AL_KEY)||'null');}catch(e){return null;}}
function alStore(v){try{localStorage.setItem(AL_KEY,JSON.stringify(v));return true;}catch(e){return false;}}
function profileOf(I){const p=v=>String(v).padStart(2,'0');return {name:I.name,d:I.y+'-'+p(I.m)+'-'+p(I.d),t:p(I.h)+':'+p(I.mi),sex:I.sex,adj:I.adj.a!==0||I.adj.why.length>0};}
function baseFromProfile(pr){const [y,m,d]=pr.d.split('-').map(Number),[h,mi]=pr.t.split(':').map(Number);const ad=pr.adj?autoAdjust(y,m,d):{a:0,why:[]};const r=Gimun.calc(Solar,y,m,d,h,mi,{adjust:ad.a});r.input={y,m,d,h,mi,name:pr.name,sex:pr.sex,adj:ad};return r;}
function buildNotifications(al,days){
  const keep=base;base=baseFromProfile(al.profile);const cache={},out=[];
  const [hh,mm]=al.time.split(':').map(Number),now=new Date();
  try{
    for(let i=0;i<days;i++){
      const at=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i,hh,mm,0);
      if(at<=now)continue;
      const y=at.getFullYear(),m=at.getMonth()+1,d=at.getDate(),x=dayInfo(y,m,d,cache);
      const g=x.d.g,grade=g>=1.5?'좋음':g>=0.5?'무난·좋음':g<=-1?'주의':'보통';
      const p=v=>String(v).padStart(2,'0');
      out.push({id:1000+i,title:(al.profile.name?al.profile.name+'님 ':'')+'오늘의 일진 · '+m+'월 '+d+'일 '+x.d.gz+'일 ('+grade+')',body:x.d.summary,largeBody:x.d.summary,schedule:{at,allowWhileIdle:true},isExactNotification:false,extra:{date:y+'-'+p(m)+'-'+p(d)}});
    }
  }finally{base=keep;}
  return out;
}
async function alSchedule(al){
  if(!LN){return '휴대폰에 앱으로 설치하면 이 설정대로 매일 알림이 와요. (지금 화면은 웹 미리보기라 알림이 오지 않아요.)';}
  let perm=await LN.checkPermissions();if(perm.display!=='granted')perm=await LN.requestPermissions();
  if(perm.display!=='granted')return '알림 권한이 꺼져 있어요. 휴대폰 설정 → 앱 → 도깨비 사주 → 알림을 켜 주세요.';
  const pend=await LN.getPending();if(pend.notifications&&pend.notifications.length)await LN.cancel({notifications:pend.notifications.map(n=>({id:n.id}))});
  if(!al||!al.on)return '알림을 껐어요.';
  const list=buildNotifications(al,60);await LN.schedule({notifications:list});
  return '매일 '+al.time+'에 '+(al.profile.name||'이 명국')+'의 일진 알림이 와요. 앱을 열 때마다 앞으로 60일치가 새로 예약돼요.';
}
function alDraw(){const al=alLoad();$('alOn').checked=!!(al&&al.on);if(al&&al.time)$('alTime').value=al.time;
  $('alMsg').textContent=al&&al.on?('설정된 명국: '+(al.profile.name||'이름 없음')+' '+al.profile.d+' · 매일 '+al.time+(LN?'':' (앱으로 설치하면 알림이 와요)')):'켜면 지금 보고 있는 명국으로 매일 아침 그날 일진을 알려 드려요.';}
async function alApply(){
  if(!base){$('alMsg').textContent='먼저 명국을 세워 주세요.';return;}
  const al={on:$('alOn').checked,time:$('alTime').value||'09:00',profile:profileOf(base.input)};
  alStore(al);
  try{$('alMsg').textContent=await alSchedule(al);}catch(e){$('alMsg').textContent='알림 예약 중 문제가 생겼어요: '+e.message;}
}
$('alSave').addEventListener('click',alApply);
$('alOn').addEventListener('change',alApply);
function openDay(date){
  const al=alLoad();if(!al)return;const pr=al.profile;
  $('nm').value=pr.name||'';$('d').value=pr.d;$('t').value=pr.t;sex=pr.sex;cal='S';$('adj').checked=pr.adj!==false;
  [...$('sex').children].forEach(x=>x.classList.toggle('on',x.dataset.v===sex));[...$('cal').children].forEach((x,i)=>x.classList.toggle('on',i===0));
  base=compute();mode='il';[...$('mode').children].forEach(x=>x.classList.toggle('on',x.dataset.v==='il'));
  $('yrWrap').style.display='none';$('ilWrap').style.display='block';$('ild').value=date;show();$('out').scrollIntoView();
}
if(LN){
  try{LN.addListener('localNotificationActionPerformed',e=>{const d=e&&e.notification&&e.notification.extra&&e.notification.extra.date;if(d)openDay(d);});}catch(e){}
  const al=alLoad();if(al&&al.on)alSchedule(al).catch(()=>{});
}
alDraw();

// ── 생년월일 고르기 + 12지 시 고르기 ──
(function(){
  const ZHI=[['子','자','🐭'],['丑','축','🐮'],['寅','인','🐯'],['卯','묘','🐰'],['辰','진','🐲'],['巳','사','🐍'],['午','오','🐴'],['未','미','🐑'],['申','신','🐵'],['酉','유','🐔'],['戌','술','🐶'],['亥','해','🐷']];
  const P=v=>String(v).padStart(2,'0');
  const dy=$('dy'),dm=$('dm'),dd=$('dd'),tx=$('tx');
  const thisY=new Date().getFullYear();
  let h='<option value="">년</option>';
  for(let y=2100;y>=1900;y--)h+='<option value="'+y+'"'+(y===1990?' data-def="1"':'')+'>'+y+'년</option>';
  dy.innerHTML=h;
  h='<option value="">월</option>';for(let m=1;m<=12;m++)h+='<option value="'+m+'">'+m+'월</option>';dm.innerHTML=h;
  function fillDays(){
    const y=+dy.value,m=+dm.value,keep=+dd.value;
    let n=31;
    if(m){n=(typeof cal!=='undefined'&&cal!=='S')?30:new Date(y||2000,m,0).getDate();}
    let o='<option value="">일</option>';for(let d=1;d<=n;d++)o+='<option value="'+d+'">'+d+'일</option>';
    dd.innerHTML=o;if(keep&&keep<=n)dd.value=String(keep);
  }
  fillDays();
  // 년도를 처음 열 때 1990년 근처가 보이게
  dy.addEventListener('focus',()=>{if(!dy.value){dy.value='1990';dy.dataset.tmp='1';}});
  dy.addEventListener('blur',()=>{if(dy.dataset.tmp){delete dy.dataset.tmp;}});
  const dEl=$('d');
  Object.defineProperty(dEl,'value',{configurable:true,
    get(){return (dy.value&&dm.value&&dd.value)?dy.value+'-'+P(dm.value)+'-'+P(dd.value):'';},
    set(v){const m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v||'');if(!m){dy.value='';dm.value='';dd.value='';fillDays();refresh();return;}
      dy.value=String(+m[1]);dm.value=String(+m[2]);fillDays();dd.value=String(+m[3]);refresh();}});
  [dy,dm].forEach(e=>e.addEventListener('change',()=>{delete dy.dataset.tmp;fillDays();refresh();}));
  dd.addEventListener('change',refresh);

  // 보정값(분): 앱의 '한국 표준시·서머타임 자동 보정'과 똑같이 계산
  function adjMin(){
    if(!$('adj').checked)return 0;
    let y=+dy.value,m=+dm.value,d=+dd.value;
    if(!(y&&m&&d))return -30;
    try{
      if(typeof cal!=='undefined'&&cal!=='S'){const s=Lunar.fromYmd(y,cal==='LL'?-m:m,d).getSolar();y=s.getYear();m=s.getMonth();d=s.getDay();}
      return autoAdjust(y,m,d).a;
    }catch(e){return -30;}
  }
  const fmt=mins=>{mins=((mins%1440)+1440)%1440;return P(Math.floor(mins/60))+':'+P(mins%60);};
  function range(i,a){const st=(i*120-60)-a,en=(i*120+60)-a;return [fmt(st),fmt(en)];}
  function zhiOf(tv,a){if(!/^\d{1,2}:\d{2}$/.test(tv||''))return -1;const [hh,mm]=tv.split(':').map(Number);const adj=hh*60+mm+a;return Math.floor((((adj+60)%1440)+1440)%1440/120);}
  let tVal='',exact=false;
  const zw=$('zhi');
  zw.innerHTML=ZHI.map((z,i)=>'<button type="button" data-i="'+i+'"><span class="e">'+z[2]+'</span><span class="n"><b>'+z[0]+'</b>'+z[1]+'시</span><span class="r"></span></button>').join('');
  function refresh(){
    const a=adjMin();
    [...zw.children].forEach((b,i)=>{const r=range(i,a);b.querySelector('.r').textContent=r[0]+'~'+r[1];});
    const k=zhiOf(tVal,a);
    [...zw.children].forEach((b,i)=>b.classList.toggle('on',i===k));
    if(k<0){$('tSel').textContent='태어난 시를 골라 주세요';}
    else{const r=range(k,a);$('tSel').innerHTML='<b>'+ZHI[k][2]+' '+ZHI[k][0]+ZHI[k][1]+'시</b> '+r[0]+'~'+r[1]+(exact?' · 입력 '+tVal:'');}
    const z=range(0,a);
    $('tHint').textContent=a===0?'시간대는 입력한 시각 그대로 나눠요. (보정 꺼짐)':
      ((a<=-90?'그해는 서머타임 기간이라 시간대가 1시간 늦춰져 있어요. ':'')+'밤 '+z[0]+'~자정 사이에 태어났다면 \'정확한 시각 입력\'으로 넣어 주세요.');
  }
  const tEl=$('t');
  Object.defineProperty(tEl,'value',{configurable:true,
    get(){return tVal;},
    set(v){tVal=/^\d{1,2}:\d{2}$/.test(v||'')?P(+v.split(':')[0])+':'+v.split(':')[1]:'';tx.value=tVal;refresh();}});
  zw.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const i=+b.dataset.i,a=adjMin();
    // 그 시의 가운데 시각으로 넣어요 (자시는 자정 이후 쪽)
    const mid=(i===0?30:i*120)-a;exact=false;tx.style.display='none';$('tExact').textContent='⌚ 정확한 시각 입력';
    tEl.value=fmt(mid);});
  $('tExact').addEventListener('click',()=>{exact=tx.style.display==='none';tx.style.display=exact?'block':'none';$('tExact').textContent=exact?'12지로 고르기':'⌚ 정확한 시각 입력';if(exact){tx.value=tVal;try{tx.focus();tx.showPicker&&tx.showPicker();}catch(e){}}refresh();});
  tx.addEventListener('change',()=>{if(tx.value){exact=true;tEl.value=tx.value;}});
  tx.addEventListener('input',()=>{if(tx.value){exact=true;tEl.value=tx.value;}});
  $('adj').addEventListener('change',refresh);
  $('cal').addEventListener('click',()=>setTimeout(()=>{fillDays();refresh();},0));
  refresh();
})();
// ── 명국·신수·일진 쉬운 설명 ──
(function(){
  const EXP={
    won:'🔮 <span><b>명국</b>은 태어난 날과 시로 그린 <b>나만의 운명 지도</b>예요. 타고난 성격, 잘 맞는 일, 평생의 큰 흐름을 보여 줘요. 9칸 중 한 칸을 누르면 그 칸의 뜻이 나와요.</span>',
    sin:'🎊 <span><b>신수</b>는 고른 해 <b>1년 동안의 운세</b>예요. 그해에 잘 풀리는 일, 조심할 일, 좋은 기회를 알려 줘요. 위 연도 칸에서 다른 해도 볼 수 있어요.</span>',
    gh:'💞 <span><b>궁합</b>은 두 사람의 사주를 나란히 놓고 <b>마음·생활·띠·오행</b>이 얼마나 잘 맞는지 보는 거예요. 위 칸에 상대방 생일을 넣고 궁합 보기를 눌러 주세요.</span>',
    jm:'✍️ <span><b>작명</b>은 위에 넣은 생년월일시의 사주에 맞춰 <b>81수리 원형이정</b>이 모두 좋은 이름을 골라 드려요. 마음에 드는 이름은 <b>도깨비작명연구소 작명증서</b>로 만들 수 있어요.</span>',
    dm:'🌙 <span><b>꿈해몽</b>은 간밤에 꾼 꿈이 무슨 뜻인지 풀어 드려요. 집·사람·손님 꿈까지 대표적인 꿈 41가지 중에 고르거나 꿈 내용을 써서 찾아보세요.</span>',
    il:'☀️ <span><b>일진</b>은 고른 날 <b>하루의 운세</b>예요. 그날 기분, 일, 사람 관계, 돈 흐름이 어떨지 가볍게 볼 수 있어요. 위 날짜 칸에서 다른 날도 볼 수 있어요.</span>'
  };
  const upd=()=>{const e=$('modeExp');if(e)e.innerHTML=EXP[mode]||'';};
  const _show=show;show=function(){const r=_show.apply(this,arguments);upd();return r;};
  $('mode').addEventListener('click',()=>setTimeout(upd,0));
  upd();
})();
// ── 오늘 나의 운세 한 줄 요약 ──
(function(){
  const LAST='hongmyeongguk.last';
  const P=v=>String(v).padStart(2,'0');
  const loadLast=()=>{try{return JSON.parse(localStorage.getItem(LAST)||'null');}catch(e){return null;}};
  function todayInfo(b){
    const keep=base;base=b;
    try{const n=new Date();const x=dayInfo(n.getFullYear(),n.getMonth()+1,n.getDate(),{});return {n,x};}
    finally{base=keep;}
  }
  function grade(g){
    if(g>=1.5)return {t:'좋음',c:'g3',e:'😆',w:'기분 좋은 일이 생기는 날'};
    if(g>=0.5)return {t:'무난·좋음',c:'g2',e:'🙂',w:'술술 풀리는 편안한 날'};
    if(g<=-1)return {t:'주의',c:'g0',e:'🧐',w:'한 번 더 조심하면 괜찮은 날'};
    return {t:'보통',c:'g1',e:'😌',w:'평소처럼 지내면 좋은 날'};
  }
  function html(b,who,top){
    const {n,x}=todayInfo(b);const G=grade(x.d.g);
    const pct=Math.max(8,Math.min(100,Math.round((x.d.g+2.5)/5*100)));
    const nm=who?who+'님의 ':'나의 ';
    return '<div class="tdHead"><span class="tdDate">'+(n.getMonth()+1)+'월 '+n.getDate()+'일 ('+'일월화수목금토'[n.getDay()]+') · '+x.d.gz+'일</span><span class="tdBadge '+G.c+'">오늘 '+G.t+'</span></div>'+
      '<div class="tdMain"><div class="tdEmoji">'+G.e+'</div><div><p class="tdTitle">'+nm+'오늘: '+G.w+'</p><p class="tdSum">'+x.d.summary+'</p></div></div>'+
      '<div class="tdMeter"><i style="width:'+pct+'%"></i></div>'+
      '<div class="tdBtns">'+(top?'<button type="button" data-a="open">🔮 내 명국 열기</button><button type="button" class="sec" data-a="new">✏️ 다른 생일 보기</button>':'<button type="button" data-a="il">☀️ 오늘 일진 자세히 보기</button>')+'</div>';
  }
  function drawOut(){
    const el=$('todayOut');if(!el)return;
    if(!base||mode==='il'||mode==='gh'||mode==='jm'||mode==='dm'){el.style.display='none';return;}
    try{el.innerHTML=html(base,base.input.name,false);el.style.display='block';}catch(e){el.style.display='none';}
  }
  function drawTop(){
    const el=$('todayTop');const pr=loadLast()||(typeof alLoad==='function'&&alLoad()&&alLoad().profile);
    if(!pr){el.style.display='none';return;}
    try{el.innerHTML=html(baseFromProfile(pr),pr.name,true);el.style.display='block';el._pr=pr;}catch(e){el.style.display='none';}
  }
  function openDayToday(){
    const n=new Date();$('ild').value=n.getFullYear()+'-'+P(n.getMonth()+1)+'-'+P(n.getDate());
    const b=$('mode').querySelector('button[data-v="il"]');if(b)b.click();
    $('out').scrollIntoView({behavior:'smooth'});
  }
  $('todayOut').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.a==='il')openDayToday();});
  $('todayTop').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const pr=$('todayTop')._pr;
    if(b.dataset.a==='new'){$('nm').value='';$('form').scrollIntoView({behavior:'smooth'});return;}
    if(b.dataset.a==='open'&&pr){$('nm').value=pr.name||'';$('d').value=pr.d;$('t').value=pr.t;sex=pr.sex;cal='S';$('adj').checked=pr.adj!==false;
      [...$('sex').children].forEach(x=>x.classList.toggle('on',x.dataset.v===sex));[...$('cal').children].forEach((x,i)=>x.classList.toggle('on',i===0));go();}});
  // 명국을 세우면 다음에 앱을 열 때 바로 보이게 기억해 둬요
  $('go').addEventListener('click',()=>{if(base&&$('err').style.display==='none'){try{localStorage.setItem(LAST,JSON.stringify(profileOf(base.input)));}catch(e){}drawTop();}});
  const _show=show;show=function(){const r=_show.apply(this,arguments);drawOut();return r;};
  drawTop();
})();
// ── 쉬운 9칸 지도 + 누르면 바로 뜨는 풀이 창 + 한자 줄이기 ──
(function(){
  const HZ={'甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계',
    '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해',
    '木':'목','火':'화','土':'토','金':'금','水':'수','財':'재','官':'관','鬼':'귀','孫':'손','父':'부','兄':'형','世':'세',
    '休':'휴','生':'생','傷':'상','杜':'두','景':'경','死':'사','驚':'경','開':'개','門':'문','日':'일','月':'월','年':'년','時':'시','柱':'주',
    '局':'국','空':'공','亡':'망','天':'천','地':'지','陰':'음','陽':'양','命':'명','元':'원','數':'수','身':'신','中':'중','宮':'궁',
    '乾':'건','坤':'곤','艮':'간','巽':'손','坎':'감','離':'리','震':'진','兌':'태','氣':'기','宜':'의','絶':'절','體':'체','遊':'유',
    '魂':'혼','禍':'화','害':'해','福':'복','德':'덕','歸':'귀','合':'합','冲':'충','沖':'충','刑':'형','破':'파','支':'지','干':'간',
    '辰':'진','和':'화','弱':'약','多':'다','強':'강','强':'강','旺':'왕','衰':'쇠','用':'용','神':'신','喜':'희','忌':'기','吉':'길','凶':'흉','大':'대','運':'운','歲':'세','正':'정','偏':'편','印':'인','比':'비','劫':'겁','食':'식','殺':'살','星':'성','太':'태','小':'소','人':'인','少':'소','老':'노','虛':'허','實':'실','一':'1','二':'2','三':'3','四':'4','五':'5','六':'6','七':'7','八':'8','九':'9','十':'10'};
  const HZRE=new RegExp('['+Object.keys(HZ).join('')+']','g');
  function hangulize(root){
    if(!root)return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
    while((n=w.nextNode())){const v=n.nodeValue;let t=v.replace(HZRE,c=>HZ[c]);if(t!==v){t=t.replace(/([가-힣]+)\(\1\)/g,'$1');n.nodeValue=t;}}
  }
  const KW={世:['🙋','나의 자리'],財:['💰','재물·사업'],官:['🏢','직장·명예'],鬼:['⚡','시련·압박'],孫:['🌱','자녀·재능'],父:['📜','문서·도움'],兄:['🤝','친구·경쟁']};
  const DOOR={休門:'🍀 좋은 문',生門:'🍀 좋은 문',開門:'🍀 좋은 문',景門:'✨ 드러나는 문',傷門:'⚠️ 조심',杜門:'⚠️ 조심',驚門:'⚠️ 조심',死門:'⚠️ 조심'};
  const dirOf=p=>{const m=/\((.+)\)/.exec(PK[p]);return m?m[1]+'쪽':'가운데';};
  const kw=r=>p=>KW[r.lqH[p]]||['🔮',r.lqH[p]];
  function curPalOf(r){const age=ageNow(r);return [1,2,3,4,5,6,7,8,9].find(p=>{const [a,b]=age<=45?r.ageE[p]:r.ageH[p];return age>=a&&age<=b;});}
  function drawSimple(){
    const r=cur;if(!r)return;const K=kw(r);const age=ageNow(r);const cp=curPalOf(r);
    let h='';
    for(const p of [4,9,2,3,5,7,8,1,6]){
      const [em,word]=K(p);
      const tE=r.tagE[p]||[],tH=r.tagH[p]||[];
      const star=tE.some(t=>t.endsWith('支'))||p===r.sePal||(p===5&&tH.some(t=>t.endsWith('支')));
      let badge='',ag='',now=false;
      if(dInfo){if(dInfo.x.d.p===p){badge='오늘의 칸';now=true;}ag='';}
      else if(yInfo){const ms=Object.keys(MPAL).filter(m=>MPAL[m]===p);if(yInfo.out.hangPal===p){badge='올해 큰일';now=true;}ag=ms.length?'음력 '+ms.join('·')+'월':'';}
      else{const [e0,e1]=r.ageE[p],[h0,h1]=r.ageH[p];ag=e0+'~'+e1+'세 · '+h0+'~'+h1+'세';if(p===cp){badge='지금 내 운';now=true;}}
      h+='<div class="sc p'+p+(now?' now':'')+'" data-p="'+p+'" role="button" tabindex="0" aria-label="'+dirOf(p)+' 칸, '+word+'">'+
        (badge?'<span class="bd">'+badge+'</span>':'')+(star?'<span class="st" title="내 사주의 중심 기운이 있는 칸">⭐</span>':'')+
        '<span class="dir">'+dirOf(p)+'</span><span class="em">'+em+'</span><span class="kw">'+word+'</span>'+
        (p!==5&&DOOR[r.door[p]]?'<span class="dm">'+DOOR[r.door[p]]+'</span>':'')+(ag?'<span class="ag">'+ag+'</span>':'')+'</div>';
    }
    $('sboard').innerHTML=h;
    const I=r.input,p2=v=>String(v).padStart(2,'0');
    $('mapInfo').textContent=(I.name?I.name+' · ':'')+I.y+'.'+I.m+'.'+I.d+' '+p2(I.h)+':'+p2(I.mi)+' · '+(I.sex==='M'?'남':'여')+' · '+(yInfo?yearSel+'년 ':'올해 ')+age+'세';
    $('sleg').textContent=dInfo?'⭐ 내 사주의 중심 기운이 있는 칸 · 분홍 테두리는 그날 운이 드러나는 칸이에요.':
      yInfo?'⭐ 내 사주의 중심 기운이 있는 칸 · 분홍 테두리는 올해 큰일이 생기는 칸, 칸 아래는 그 칸으로 보는 음력 달이에요.':
      '⭐ 내 사주의 중심 기운이 있는 칸 · 분홍 테두리는 지금 나이의 운이 흐르는 칸이에요. 칸 아래 나이는 그 칸의 운이 오는 시기예요.';
  }
  const sheet=$('sheet');
  function openCell(p){
    const r=cur;if(!r)return;
    showDetail(p,yInfo||dInfo?null:curPalOf(r));
    const [em,word]=kw(r)(p);
    let sub=dirOf(p)+' 칸';
    if(!yInfo&&!dInfo){const [e0,e1]=r.ageE[p],[h0,h1]=r.ageH[p];sub+=' · '+e0+'~'+e1+'세, '+h0+'~'+h1+'세의 운';}
    $('shHead').innerHTML='<span class="em">'+em+'</span><div><b>'+word+'의 칸</b><small>'+sub+'</small></div>';
    hangulize($('detail'));
    if(!sheet.classList.contains('pro')){const w=document.createTreeWalker($('detail'),NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){n.nodeValue=n.nodeValue.replace(/\(지반\)/g,'(속)').replace(/\(천반\)/g,'(겉)').replace(/천반 /g,'겉으로 드러난 운 ').replace(/지반 /g,'바탕이 되는 운 ').replace(/(드러난 운|되는 운) ([세재관귀손부형])$/,(m,x,y)=>x+' · '+({세:'나',재:'재물',관:'직장',귀:'압박',손:'자녀',부:'문서',형:'친구'})[y]).replace(/([년월일시])[간지]/g,(m,x)=>'태어난 '+({년:'해',월:'달',일:'날',시:'시'})[x]);}}
    document.querySelectorAll('.sc').forEach(c=>c.classList.toggle('sel',+c.dataset.p===p));
    sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');
    sheet.querySelector('.sheetPanel').scrollTop=0;
  }
  function closeSheet(){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');}
  $('sboard').addEventListener('click',e=>{const c=e.target.closest('.sc');if(c)openCell(+c.dataset.p);});
  $('sboard').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const c=e.target.closest('.sc');if(c){e.preventDefault();openCell(+c.dataset.p);}}});
  $('board').addEventListener('click',e=>{const c=e.target.closest('.cell');if(c)openCell(+c.dataset.p);});
  $('sheetBg').addEventListener('click',closeSheet);$('sheetX').addEventListener('click',closeSheet);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet();});
  $('viewSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const easy=b.dataset.v==='easy';
    [...$('viewSeg').children].forEach(x=>x.classList.toggle('on',x===b));
    $('easyView').style.display=easy?'block':'none';$('expert').style.display=easy?'none':'block';
    $('mapCard').querySelector('.mapH').textContent=easy?'🗺️ 9칸 운명 지도':'🔮 구궁도';});
  const _render=render;render=function(){const out=_render.apply(this,arguments);
    try{drawSimple();['todayOut','reading','typecard','fourcard'].forEach(id=>hangulize($(id)));}catch(e){console.error(e);}return out;};
  // 탭을 누르면 풀이가 바로 보이게
  $('mode').addEventListener('click',e=>{if(e.target.closest('button'))setTimeout(()=>{$('ctl').scrollIntoView({behavior:'smooth',block:'start'});},50);});
  const _show2=show;show=function(){const r=_show2.apply(this,arguments);try{hangulize($('todayOut'));hangulize($('todayTop'));}catch(e){}return r;};
  $('go').addEventListener('click',()=>setTimeout(()=>hangulize($('todayTop')),0));
  hangulize($('todayTop'));
  window.__hangulize=hangulize;
})();
// ── 명국·신수·일진을 더 쉽게 고르기: 큰 버튼, 앞뒤 넘기기, 아래 고정 메뉴 ──
(function(){
  const P=v=>String(v).padStart(2,'0');
  const fire=el=>el.dispatchEvent(new Event('change',{bubbles:true}));
  function stepper(input,btns){
    const w=document.createElement('div');w.className='step';input.parentNode.insertBefore(w,input);
    const mk=(t,cls,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=t;if(cls)b.className=cls;b.addEventListener('click',fn);return b;};
    w.appendChild(mk(btns[0].t,'',btns[0].f));w.appendChild(input);btns.slice(1).forEach(x=>w.appendChild(mk(x.t,x.c||'',x.f)));
  }
  const yr=$('yr'),ild=$('ild');
  stepper(yr,[{t:'‹',f:()=>{yr.value=(+yr.value||new Date().getFullYear())-1;fire(yr);}},{t:'›',f:()=>{yr.value=(+yr.value||new Date().getFullYear())+1;fire(yr);}},{t:'올해',c:'tx',f:()=>{yr.value=new Date().getFullYear();fire(yr);}}]);
  const shift=n=>{const v=ild.value?new Date(ild.value+'T12:00:00'):new Date();v.setDate(v.getDate()+n);ild.value=v.getFullYear()+'-'+P(v.getMonth()+1)+'-'+P(v.getDate());fire(ild);};
  stepper(ild,[{t:'‹',f:()=>shift(-1)},{t:'›',f:()=>shift(1)},{t:'오늘',c:'tx',f:()=>{const n=new Date();ild.value=n.getFullYear()+'-'+P(n.getMonth()+1)+'-'+P(n.getDate());fire(ild);}}]);
  $('yrWrap').querySelector('label').textContent='🎊 몇 년 운세를 볼까요?';
  $('ilWrap').querySelector('label').textContent='📅 어느 날 운세를 볼까요?';
  // 아래 고정 메뉴
  const nav=document.createElement('nav');nav.className='bnav';nav.setAttribute('aria-label','운세 종류');
  nav.innerHTML='<div class="in"><button type="button" data-v="won">🔮 명국</button><button type="button" data-v="sin">🎊 신수</button><button type="button" data-v="il">☀️ 일진</button><button type="button" data-v="gh">💞 궁합</button><button type="button" data-v="jm">✍️ 작명</button><button type="button" data-v="dm">🌙 해몽</button></div>';nav.classList.add('six');
  document.body.appendChild(nav);
  const sync=()=>{[...nav.querySelectorAll('button')].forEach(b=>b.classList.toggle('on',b.dataset.v===mode));[...$('mode').children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===mode?'true':'false'));};
  nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=$('mode').querySelector('button[data-v="'+b.dataset.v+'"]');if(t)t.click();});
  $('mode').addEventListener('click',()=>setTimeout(sync,0));
  let ctlVisible=true;
  const upd=()=>{const on=$('out').style.display!=='none'&&!ctlVisible;nav.classList.toggle('show',on);document.body.classList.toggle('hasnav',$('out').style.display!=='none');};
  if('IntersectionObserver' in window){new IntersectionObserver(es=>{ctlVisible=es[0].isIntersecting;upd();},{threshold:0}).observe($('ctl'));}
  const _show3=show;show=function(){const r=_show3.apply(this,arguments);sync();upd();return r;};
  sync();
})();
// ── 궁합 ──
(function(){
  const ST='甲乙丙丁戊己庚辛壬癸',BR='子丑寅卯辰巳午未申酉戌亥';
  const ELN=['목','화','토','금','수'];
  const sEl=g=>Math.floor(ST.indexOf(g)/2);const bEl=z=>[4,2,0,0,2,1,1,2,3,3,2,4][BR.indexOf(z)];
  const pairIn=(L,a,b)=>L.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
  const GANHAP=[[0,5],[1,6],[2,7],[3,8],[4,9]];
  const LIUHE=[[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
  const SANHE=[[8,0,4],[2,6,10],[5,9,1],[11,3,7]];
  const WONJIN=[[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];
  const HYEONG=[[2,5],[5,8],[2,8],[1,10],[10,7],[1,7],[0,3]];
  const HAE=[[1,6],[2,5],[3,4],[8,11],[9,10]];
  const ANI=['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
  function brRel(a,b){const i=BR.indexOf(a),j=BR.indexOf(b);
    if(i===j)return 'same';if((i+6)%12===j)return 'chong';if(pairIn(LIUHE,i,j))return 'liuhe';
    if(SANHE.some(g=>g.includes(i)&&g.includes(j)))return 'sanhe';if(pairIn(WONJIN,i,j))return 'wonjin';
    if(pairIn(HYEONG,i,j))return 'hyeong';if(pairIn(HAE,i,j))return 'hae';return 'normal';}
  function elCount(r,hasTime){const c=[0,0,0,0,0];r.pillars.forEach((p,k)=>{if(k===3&&!hasTime)return;c[sEl(p[0])]++;c[bEl(p[1])]++;});return c;}
  const P=v=>String(v).padStart(2,'0');
  // 상대방 입력칸 채우기
  const gy=$('ghY'),gm=$('ghM'),gd=$('ghD');let gcal='S',gsex='F';
  let h='<option value="">년</option>';for(let y=2100;y>=1900;y--)h+='<option value="'+y+'">'+y+'년</option>';gy.innerHTML=h;
  h='<option value="">월</option>';for(let m=1;m<=12;m++)h+='<option value="'+m+'">'+m+'월</option>';gm.innerHTML=h;
  function days(){const y=+gy.value,m=+gm.value,k=+gd.value;let n=31;if(m)n=gcal!=='S'?30:new Date(y||2000,m,0).getDate();
    let o='<option value="">일</option>';for(let d=1;d<=n;d++)o+='<option value="'+d+'">'+d+'일</option>';gd.innerHTML=o;if(k&&k<=n)gd.value=String(k);}
  days();[gy,gm].forEach(e=>e.addEventListener('change',days));
  gy.addEventListener('focus',()=>{if(!gy.value)gy.value='1990';});
  const segSel=(id,fn)=>$(id).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;[...$(id).children].forEach(x=>x.classList.toggle('on',x===b));fn(b.dataset.v);});
  segSel('ghSex',v=>gsex=v);segSel('ghCal',v=>{gcal=v;days();});
  const KEY='hongmyeongguk.partner';
  function loadP(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
  function setForm(p){if(!p)return;$('ghName').value=p.name||'';gcal=p.cal||'S';[...$('ghCal').children].forEach(x=>x.classList.toggle('on',x.dataset.v===gcal));
    gy.value=String(p.y);gm.value=String(p.m);days();gd.value=String(p.d);$('ghT').value=p.t||'';gsex=p.sex||'F';[...$('ghSex').children].forEach(x=>x.classList.toggle('on',x.dataset.v===gsex));}
  function partnerFromForm(){
    const y=+gy.value,m=+gm.value,d=+gd.value;if(!(y&&m&&d))throw new Error('상대방 생년월일을 골라 주세요.');
    return {name:$('ghName').value.trim(),y,m,d,cal:gcal,t:$('ghT').value,sex:gsex};
  }
  function calcPartner(p){
    let y=p.y,m=p.m,d=p.d;
    if(p.cal!=='S'){try{const s=Lunar.fromYmd(y,p.cal==='LL'?-m:m,d).getSolar();y=s.getYear();m=s.getMonth();d=s.getDay();}catch(e){throw new Error('상대방 음력 날짜를 찾지 못했어요. 윤달 여부를 확인해 주세요.');}}
    const [hh,mi]=(p.t||'12:00').split(':').map(Number);const ad=autoAdjust(y,m,d);
    const r=Gimun.calc(Solar,y,m,d,hh,mi,{adjust:ad.a});r.input={y,m,d,h:hh,mi,name:p.name,sex:p.sex,adj:ad};r.hasTime=!!p.t;return r;
  }
  let partner=null;
  $('ghGo').addEventListener('click',()=>{const e=$('ghErr');e.style.display='none';
    try{const p=partnerFromForm();partner=calcPartner(p);try{localStorage.setItem(KEY,JSON.stringify(p));}catch(_){ }show();$('reading').scrollIntoView({behavior:'smooth'});}
    catch(err){e.textContent=err.message;e.style.display='block';}});
  // 탭 바뀔 때 입력칸 보이기
  $('mode').addEventListener('click',()=>setTimeout(()=>{$('ghWrap').style.display=mode==='gh'?'block':'none';
    if(mode==='gh'&&base){if(!gsex||!$('ghWrap').dataset.init){gsex=base.input.sex==='M'?'F':'M';[...$('ghSex').children].forEach(x=>x.classList.toggle('on',x.dataset.v===gsex));const p=loadP();if(p){setForm(p);try{partner=calcPartner(p);show();}catch(_){}}$('ghWrap').dataset.init='1';}}},0));
  const pill=g=>g>=2?['g3','아주 좋아요']:g>=1?['g2','좋아요']:g<=-1?['g0','노력이 필요해요']:['g1','무난해요'];
  window.renderGung=function(){
    $('typecard').style.display='none';$('fourcard').style.display='none';
    const R=$('reading');
    if(!partner){R.innerHTML='<h2>💞 궁합</h2><p>위에 <b>상대방 생년월일</b>을 고르고 <b>궁합 보기</b>를 눌러 주세요. 태어난 시를 몰라도 볼 수 있어요.</p>';return;}
    const A=base,B=partner;const hon=(n,d)=>n?(n.endsWith('님')?n:n+'님'):d;const an=hon(A.input.name,'나'),bn=hon(B.input.name,'상대방');const anS=A.input.name||'나',bnS=B.input.name||'상대방';
    const aSt=A.pillars[2][0],bSt=B.pillars[2][0],aBr=A.pillars[2][1],bBr=B.pillars[2][1],aY=A.pillars[0][1],bY=B.pillars[0][1];
    const ea=sEl(aSt),eb=sEl(bSt);let score=52;const parts=[];
    // 1. 마음(일간)
    let g1,t1;const ia=ST.indexOf(aSt),ib=ST.indexOf(bSt);
    if(pairIn(GANHAP,ia,ib)){g1=2;score+=22;t1='두 사람의 일간이 서로 <b>합</b>을 이뤄요. 처음 만나도 오래 알던 사람처럼 마음이 끌리고, 서로에게 자연스럽게 기대게 되는 인연이에요.';}
    else if((ea+1)%5===eb){g1=1;score+=14;t1=an+'의 '+ELN[ea]+' 기운이 '+bn+'의 '+ELN[eb]+' 기운을 북돋아 줘요. '+an+'이 먼저 챙기고 베푸는 사이가 되기 쉬워요. 고마움을 말로 표현해 주면 더 오래가요.';}
    else if((eb+1)%5===ea){g1=1;score+=14;t1=bn+'의 '+ELN[eb]+' 기운이 '+an+'의 '+ELN[ea]+' 기운을 북돋아 줘요. '+bn+' 곁에 있으면 힘이 나고 든든해요. 받은 만큼 마음을 표현해 주세요.';}
    else if(ea===eb){g1=aSt===bSt?0:1;score+=aSt===bSt?6:8;t1='두 사람 모두 '+ELN[ea]+' 기운의 일간이라 생각하는 방식과 속도가 비슷해요. 친구처럼 편하지만, 둘 다 고집을 부리면 부딪힐 수 있어요.';}
    else if((ea+2)%5===eb){g1=-1;score-=6;t1=an+'의 기운이 '+bn+'의 기운을 누르는 관계예요. 이끌어 주는 힘이 되기도 하지만, 상대가 답답하지 않게 의견을 먼저 물어봐 주세요.';}
    else{g1=-1;score-=6;t1=bn+'의 기운이 '+an+'의 기운을 누르는 관계예요. 배울 점이 많은 사이지만, 서운한 마음이 들면 참지 말고 부드럽게 말해 주세요.';}
    parts.push(['💗 마음 궁합','두 사람의 타고난 성품(일간)',g1,t1]);
    // 2. 생활(일지)
    const r2=brRel(aBr,bBr);const T2={liuhe:[2,14,'생활 궁합이 아주 좋아요. 집에서의 습관과 하루 리듬이 잘 맞아 함께 있을수록 편안해요.'],
      sanhe:[2,10,'생활 속에서 같은 방향을 바라보는 사이예요. 함께 목표를 세우면 힘이 크게 붙어요.'],
      same:[1,4,'생활 방식이 비슷해서 편해요. 서로의 혼자 있는 시간도 존중해 주면 더 좋아요.'],
      normal:[0,0,'생활 궁합은 무난해요. 서로 맞춰 가는 만큼 좋아지는 사이예요.'],
      hae:[0,-4,'작은 오해가 생기기 쉬운 사이예요. 말투에 조금만 신경 쓰면 금방 좋아져요.'],
      hyeong:[-1,-6,'서로 바로잡으려다 부딪히기 쉬워요. 잔소리보다 칭찬을 먼저 해 보세요.'],
      wonjin:[-1,-10,'가까울수록 사소한 일로 서운해지기 쉬운 원진 관계예요. 섭섭한 마음은 쌓아 두지 말고 그때그때 부드럽게 말해 주세요.'],
      chong:[-1,-12,'생활 리듬이 정반대예요. 다른 점이 끌림이 되기도 하지만, 다투면 그날 안에 풀고 넘어가는 약속을 해 두세요.']}[r2];
    score+=T2[1];parts.push(['🏠 생활 궁합','함께 지낼 때의 습관과 리듬(일지)',T2[0],T2[2]]);
    // 3. 띠
    const r3=brRel(aY,bY);const ay=ANI[BR.indexOf(aY)],by=ANI[BR.indexOf(bY)];
    const T3={liuhe:[2,6,ay+'띠와 '+by+'띠는 서로 끌어당기는 육합이에요. 첫인상부터 호감이 가는 사이예요.'],sanhe:[2,6,ay+'띠와 '+by+'띠는 삼합으로 한 팀처럼 잘 맞아요.'],
      same:[1,2,'같은 '+ay+'띠라 공감대가 커요.'],normal:[0,0,ay+'띠와 '+by+'띠는 무난한 사이예요.'],hae:[0,-2,ay+'띠와 '+by+'띠는 가끔 엇갈리기 쉬워요. 약속을 분명히 해 두세요.'],
      hyeong:[0,-3,ay+'띠와 '+by+'띠는 서로 고치려 들기 쉬워요. 있는 그대로 봐 주세요.'],wonjin:[-1,-4,ay+'띠와 '+by+'띠는 원진이라 서운함이 쌓이기 쉬워요. 작은 표현이 큰 힘이 돼요.'],
      chong:[-1,-5,ay+'띠와 '+by+'띠는 충이라 부딪힐 때가 있어요. 대신 서로를 크게 바꿔 주는 인연이기도 해요.']}[r3];
    score+=T3[1];parts.push(['🐾 띠 궁합',ay+'띠 · '+by+'띠',T3[0],T3[2]]);
    // 4. 오행 보완
    const ca=elCount(A,true),cb=elCount(B,!!B.hasTime);const fill=[];let g4=0;
    ca.forEach((v,i)=>{if(v===0&&cb[i]>=2){fill.push(an+'에게 없는 <b>'+ELN[i]+'</b> 기운을 '+bn+'이 채워 줘요.');score+=4;}});
    cb.forEach((v,i)=>{if(v===0&&ca[i]>=2){fill.push(bn+'에게 없는 <b>'+ELN[i]+'</b> 기운을 '+an+'이 채워 줘요.');score+=4;}});
    if(fill.length>=2)g4=2;else if(fill.length===1)g4=1;
    const t4=fill.length?fill.join(' ')+' 서로에게 꼭 필요한 사람이 되어 주는 사이예요.':'두 사람 모두 비슷한 기운을 많이 가지고 있어요. 서로 채워 주기보다는 같은 마음으로 공감하는 사이예요.';
    parts.push(['☯️ 오행 보완','서로 부족한 기운을 채워 주는지',g4,t4]);
    // 6. 기문 겉궁합·속궁합: 겉은 세기 오행이 같을 때(一六水=五土, 二七火=十土로 같게 봄), 속은 일간끼리 상생 > 합
    {const GE=n=>({1:'水',6:'水',5:'水',2:'火',7:'火',10:'火',3:'木',8:'木',4:'金',9:'金'})[n];const EK={水:'수',火:'화',木:'목',金:'금'};
     const igN=r=>{const p=Object.keys(r.tagE||{}).map(Number).find(q=>(r.tagE[q]||[]).includes('日干'));return p?r.earthN[p]:null;};
     const SG={水:'木',木:'火',火:'土',土:'金',金:'水'},EL5=n=>['水','火','木','金','土'][(n-1)%5];
     const outer=GE(A.se)===GE(B.se);let tO=outer?'두 사람의 세기가 같은 '+EK[GE(A.se)]+' 기운이라 생각과 가치관, 세상을 보는 눈이 비슷해요. 남 보기에도 잘 어울리는 겉궁합이에요.':'세기가 '+EK[GE(A.se)]+'·'+EK[GE(B.se)]+(['목','금'].includes(EK[GE(B.se)])?'으로':'로')+' 달라 생각하는 방식이 달라요. 서로의 관점을 존중하면 오히려 넓어져요.';
     const ia=igN(A),ib=igN(B);let gI=0,tI='일간 자리를 찾지 못했어요.';
     if(ia&&ib){const ea2=EL5(ia),eb2=EL5(ib);const he=[[1,10],[3,6],[8,5],[5,4],[2,9],[7,10]].some(([x,y])=>(x===ia&&y===ib)||(x===ib&&y===ia))||[[9,1,5],[3,7,5],[2,4,10],[6,8,10]].some(g=>g.includes(ia)&&g.includes(ib)&&ia!==ib);
       if(SG[ea2]===eb2||SG[eb2]===ea2){gI=2;tI='두 사람의 일간('+NUM[ia]+'·'+NUM[ib]+')이 서로 생해 줘요. 애정이 식지 않고 가정에 생기를 주는 속궁합이에요(합보다 더 길해요).';}
       else if(he){gI=1;tI='두 사람의 일간('+NUM[ia]+'·'+NUM[ib]+')이 합을 이뤄요. 서로 끌리고 잘 어울리는 속궁합이에요.';}
       else if(ea2===eb2){gI=0;tI='두 사람의 일간이 같은 오행이라 친구처럼 편하지만 설렘은 노력으로 지켜야 해요.';}
       else{gI=-1;tI='두 사람의 일간이 서로 극하는 관계라 애정 표현이 엇갈리기 쉬워요. 작은 표현을 자주 해 주세요.';}}
     score+=(outer?6:0)+[-4,0,4,8][gI+1];
     parts.push(['🔮 기문 겉궁합','세기(世氣) 오행이 같은지',outer?2:0,tO]);
     parts.push(['❤️‍🔥 기문 속궁합','일간끼리 상생·합하는지',gI,tI+(outer&&gI===2?' 세기도 같아 더욱 길한 짝이에요.':'')+' (괘상으로 보는 궁합은 책에서 공개하지 않아 넣지 못했어요.)']);}
    // 5. 기질
    const ta=Saju4.personality(A.pillars,A),tb=Saju4.personality(B.pillars,B);const TY=typeof GM_TYPES!=='undefined'?GM_TYPES:{};
    const nm=t=>(TY[t.code]?TY[t.code][0]+' '+TY[t.code][1]+' '+TY[t.code][2]:t.nick);
    let g5=0,t5;if(ta.code===tb.code){g5=1;score+=3;t5='두 사람의 기질이 같아요. 말하지 않아도 통하는 게 많지만, 둘 다 약한 부분도 같으니 서로 챙겨 주세요.';}
    else if(ta.match.includes(tb.code)||tb.match.includes(ta.code)){g5=2;score+=6;t5='서로 부족한 점을 채워 주는 기질 조합이에요. 함께 있으면 서로 성장하는 사이예요.';}
    else{t5='기질이 달라서 서로에게 새로운 면을 보여 줄 수 있어요. 다른 점을 재미있게 받아들이면 좋은 짝이 돼요.';}
    score=Math.max(28,Math.min(98,Math.round(score)));
    const grade=score>=88?['천생연분','💘']:score>=75?['찰떡궁합','💞']:score>=62?['좋은 인연','💗']:score>=48?['노력하면 좋은 사이','🤝']:['서로 배려가 필요한 사이','🌱'];
    let html='<h2>💞 '+anS+' · '+bnS+' 궁합</h2>';
    html+='<div class="ghScore"><span class="num">'+score+'<small>점</small></span><div><div class="gr">'+grade[1]+' '+grade[0]+'</div><div class="who">'+an+'('+aSt+aBr+'일) · '+bn+'('+bSt+bBr+'일)</div></div></div>';
    html+='<div class="ghBar"><i style="width:'+score+'%"></i></div>';
    parts.forEach(([t,sub,g,txt])=>{const pl=pill(g);html+='<div class="ghRow"><h4>'+t+'</h4><span class="ghPill '+pl[0]+'">'+pl[1]+'</span></div><p class="note" style="margin:0 0 2px">'+sub+'</p><p>'+txt+'</p>';});
    html+='<div class="ghRow"><h4>💖 두 사람의 기질</h4><span class="ghPill '+pill(g5)[0]+'">'+pill(g5)[1]+'</span></div>';
    html+='<div class="ghPair"><div class="p"><b>'+an+'</b><span>'+nm(ta)+'</span></div><div class="h">💞</div><div class="p"><b>'+bn+'</b><span>'+nm(tb)+'</span></div></div><p>'+t5+'</p>';
    const tips=[];const low=parts.map((p,i)=>[p[2],i]).sort((a,b)=>a[0]-b[0]);
    const TIP=['서로의 다른 성격을 탓하기보다 "그럴 수 있지"라고 먼저 말해 보세요.','생활 습관은 대화로 규칙을 정해 두면 다툼이 크게 줄어요.','처음의 설렘을 기억할 수 있게 작은 기념일을 챙겨 보세요.','서로에게 없는 기운을 가진 만큼, 상대의 강점을 칭찬해 주세요.'];
    low.slice(0,2).forEach(([g,i])=>tips.push(TIP[Math.min(i,3)]));tips.push('고마운 일은 그날 바로 말로 표현하는 게 가장 좋은 궁합 비결이에요.');
    html+='<h4>💌 잘 지내는 팁</h4>'+[...new Set(tips)].map(t=>'<p>· '+t+'</p>').join('');
    if(!B.hasTime)html+='<p class="note">상대방 태어난 시를 몰라서 시주를 빼고 봤어요. 시를 알면 더 정확해져요.</p>';
    html+='<p class="note">궁합은 두 사람의 일간·일지·띠·오행·기질과 기문 겉궁합(세기)·속궁합(일간)을 전통 역학 원리로 비교한 참고용 풀이예요. 좋은 관계는 결국 두 사람의 마음과 노력으로 만들어져요.</p>';
    R.innerHTML=html;
    if(window.__hangulize)window.__hangulize(R);
  };
})();
// ── 작명 (도깨비작명연구소) ──
(function(){
  const JMD={"bysur":{"姜":["勝之","叡晳","寶升","導憲","怡化","曉燃","柄朱","渽奕","渽雄","頭顯"],"金":["代勳","伸蹊","値佑","受志","受胤","周炫","址娟","垂永","太炫","姝美","娜昀","導熹","導緣","憺憘","抒演","抒進","旻煐","旼徐","明儁","明震","晁顯","河延","渽憲","炫抒","熹練","玄徐","珍熙","甫運","補定","補炅","詵旿","赴昇","逵唎","逵盡","采原","錦美","除勳","除憲","除熹","預玹","頭暎","首賢"],"具":["垂永","導煥","導緣","徒麾","抒進","旼徐","昇賢","明儁","覩煜","赴昇","采原"],"權":["世頂","乘熙","尹志","志叡","玄徐","竪玹","素筵"],"南":["厦連","叡林","叡潾","炫抒","茶然"],"盧":["俊怜","俊性","受志","熹練","輝性","預玹"],"柳":["厚成","叡晳","周炫","炫抒","頭現"],"樑":["佶京","垂映","徒熀","扶旼","昇炫","致羽"],"文":["怡化","舒煐","解林"],"朴":["在泓","夏蓮","彩原","志玹","昶炫","昶薰","智船","曙彬","材鴻","泫曙","炫曙","炫舒","營慧","祗輪","祚永","線優","舒彬","貞玟"],"裵":["孚升","明震","珤震"],"徐":["亞見","例嬋","侑正","在希","垂志","如敏","岫忍","岫賢","曉忍","曉賢","進周"],"石":["旼書","舒軫","雅然"],"成":["倫亞","印偕","字玹","抒河","曉燕","殷綵","洗靜","炫周","營慧","珉至"],"申":["例熹","註嵋"],"孫":["亞見","例嬋","垂志","彰隨","氶再","詣勳","誾呼"],"卞":["尹志","渽雄","炫舒","理綏","舒晛","舒炫"],"李":["例周","例炫","僖盡","受顯","叡勳","周炫","員熺","在耿","埈西","導員","度緣","彩原","彩銀","承禧","抒和","抒河","曉燃","營盡","玹收","珠銀","睿原","知昇","祐珍","至敏","采原","靜受","靜玟"],"吳":["引領","炫亞","蕁僖"],"梁":["曳住","陞現"],"全":["夏蓮","庶言","至現","輝營"],"鄭":["勝之","叡援","懸暎","曉燃","曉鉉","璿財","補頻"],"崔":["峴瑛","忍領","曳住","生愛","眞宇","眞彛","祐在","解圓","高愿"],"韓":["僖珍","叡林","曉賢","理首","茶尹"],"張":["允雅","有拿"],"房":["周炫","抒進","渽憲","玄徐"],"禹":["堵允","導潤"],"蔡":["叡林","曉賢","茶尹"],"宣":["兌沿","怡化","曉燃"],"沈":["抒進","玄徐","預玹"],"宋":["丞栽","彩原","曉燃","柄受","柔弦","玹收"],"方":["怡化","柳璨","舒晛"],"林":["抒進","玄徐","采原"],"白":["旼書","舒軫","雅然"],"尹":["怡化","渽雄","炫舒","理綏","舒煐","解林"],"表":["優周","徐進","明儁"]},"suri":[["태초격","두령운","太初格·頭領運",2,"모든 수 가운데 기본이 되며 우주 본원의 으뜸에 해당하는 수이다. 만물의 시작 또는 출발을 나타내는 수로써 성공을 암시하는 길한 수이다. 시작과 창조의 수이다. 무에서 유를 창조해 낸다는 의미이다. 투자와 노력이 요구되고 또 그 만큼 발전의 이득과 영예를 누리게 된다는 뜻이다."],["분산격","재액운","分散格·災厄運",0,"삶을 영위함에 고달픈 일이 계속되며 장래성이 없어 앞일이 막막한 수이다. 음양이 상합되지 못하고 둘로 쪼개지는 수리이다. 따라서 2수의 의미는 모든 것이 분리분산과 불화대립의 흉수이다. 매사가 헛수고요 공로가 없으며 안정되지 못한 형상으로 몸의 손상, 재물 분탈, 자립의 의지가 없으며 뜻한 일은 어렵고 우유부단, 불화, 고독하다."],["명예격","복록운","名譽格·福祿運",2,"남달리 지혜와 용기가 뛰어남은 물론 큰일을 처리함에 있어 과감한 결단력으로 만인의 우상이 되는 수이다. 음양이 처음으로 형상을 이루는 정족수로서 안정된 수라고 한다. 3수는 어느 쪽으로도 기울어지지 않는다는 의미로 기반이 단단하다는 뜻이 내포되어 있다."],["부정격","파괴운","否定格·破壞運",0,"의지가 약하고 결단을 내림에 있어 불분명한 성격이라 처세술(處世術)이 뛰어나지 못해 대인관계에서 실패가 잦을 수이다. 4는 2의 배수로서 음으로만 구성된 수이다. 2가 둘로 나누어진 분리의 의미라면 4는 아예 사방으로 흩어지는 4산(四散)의 의미를 담고 있다. 동서남북에서 풍파가 겹친다."],["통어격","명재운","通御格·名財運",2,"성품이 어질고 덕(德)과 지혜를 갖추고 있으니 직장인이나 공직에 종사하는 이는 상사로부터 늘 칭송을 받게 되는 수이다. 음양이 화합하는 길한 수리이므로 가정의 화합을 이루고 성격도 원만하며 매사를 주도 면밀하게 주관하므로 주위로부터 두터운 신망과 인정을 받는다. 아울러 어떤 곳에서나 중심적 위치에서 군림하여 단체나 집단의 지도자로서 탁월한 리더십을 발휘한다."],["계승격","덕후운","繼承格·德厚運",2,"온후 독실한 성격을 지니고 있어 만인과 우애를 돈독하게 지내는 수이다. 6수는 생수(生數) 1에 5를 더하여 만들어진 성수(成數)로서 1의 수를 계승한 수이다. 그러므로 가업을 물려받거나 부모에게 유산상속을 받아 착실히 발전시키거나 직위를 계승하며 명예를 확장해 나갈 암시가 있는 수리이다. 6은 횡재나 투기로 성공할 확률이 높은 수리이기도 하다. 귀인의 도움으로 집안이 일어나고 지덕을 겸비하여 만인이 따르니 대업을 성취할 수 있다."],["강성격","발전운","剛成格·發展運",2,"정신력이 아주 강하고 독립심이 뛰어나 빠른 시기에 성공을 거두고 막강한 권위를 누리게 되는 수이다. 굳세고 강직한 성품으로 추진력과 박력이 있어 만난을 극복하여 성공한다. 독립심이 강하기 때문에 동업 또는 종속된 사업은 피하는 것이 좋다. 여성의 경우 직업 부인형으로 가정과 사회에 큰 몫을 할 것이다. 7수는 독단적인 권위와 힘 그리고 고집도 겸하고 있어서 친화력이 다소 모자라서 주위와 화합하는 지혜를 길러야 한다. 다만, 이상과 현실의 괴리로 인하여 정신적인 고통에 시달릴 소지가 많으며 반드시 노력이 따라야 결실을 볼 수 있다."],["발달격","전진운","發達格·前進運",2,"성품이 곧고 자신에게 철저한 성격이라 강한 의지와 끈질긴 인내력, 그리고 추진력을 겸비하여 끝까지 자신의 목표를 달성하여 수명과 복덕을 겸하여 누릴 수 있는 운이다. 17획 명망사해가 외유내강형의 고집으로 일면 타협과 설득이 가능한데 비하여 8획 壽福겸전은 무조건적인 고집이므로 설득이 쉽지 않다."],["종국격","시휴운","終局格·時虧運",0,"큰 뜻을 품었으나 주변에서 알아주지 않으니 이를 펼쳐 보일 기회조차 주어지지 않는 쓸모없는 재목이 되어버린다. 내실보다 겉치레가 많고 행동에 비하여 실속이 없다. 부모덕이 없어 단신 객지에 나가 설령 일시적으로 성공하더라도 오래가지 못한다. 남이 보기에는 크게 이룬 듯 보이나 내용은 빈약하다. 스스로 아직 완성되지 못한 재목임을 알고 부단히 노력하여 실력 양성에 힘쓴 후에 때를 기다려야 한다. 자신은 대재(큰 그릇)이라 생각하고 있으므로 작은 것들은 시시해 보이고 무엇을 해도 이룰 수 있을 것 같은 착각에 빠져 있는데 현실에서는 계속 실패를 거듭하게 되어 답답한 세월을 보내게 된다. 다만, 부단히 노력하고 실력양성에 힘쓰면 다음 운에서 결실을 맺는 경우가 많다."],["귀공격","공허운","歸空格·空虛運",0,"포부가 남달리 크고 재주가 뛰어나 매사에 알차고 계획성 있는 삶을 추구해 나가나, 세월이 갈수록 일관성 없는 추진력으로 공허한 결과를 맞이하게 되는 수이다. 10이나 20수는 마감을 짓고 있는 수로서 텅 비어 있다는 뜻과 함께 무엇도 없다는 것으로 만사허망운, 공허운 이라 한다. 이 수리는 이상하게도 잘 나가다가도 결정적인 순간에 실수를 하여 상심을 겪는 일이 있다. 하는 일마다 헛수고요 공로가 없다. 모든 것이 암흑지경으로 변해 허공을 헤매듯 끝이 보이지 않는 형국이다. 정신적으로 물질적으로 허망한 일을 당해 마음의 상처가 되는 경우가 많다."],["갱신격","재흥운","更新格·再興運",2,"천성이 성실, 근면하고 대인관계 또한 원만하니 타인들로부터 많은 인정을 받게 된다. 11수는 극에서 다시 시작하여 번영하는 의미를 지닌다. 마치 초목이 새봄을 맞아 새 잎과 새 가지가 돋아나는 것과 같다. 굳은 의지와 성실한 사고로 사람들의 관심과 사랑을 한 몸에 받고 그들이 나를 좋아하고 우러러 보면서 내 주위에 모여 들으니 인기가 있다. 정치인, 연예인, 영업사원들에게 좋은 수리이다."],["유약격","고수운","柔弱格·孤愁運",0,"남 다른 능력은 갖추어 일시적으로 성공했다고 해도 멀지않은 시기에 의외의 일이 벌어져 실패 수가 뒤따르게 된다. 12수리는 2수의 연장이다. 매사가 흩어지고 분리되며 힘도 나누어져 약하고 의지도 박약해지기 때문에 박복 운이라서 사람들한테 실컷 잘해놓고도 욕을 먹는 일이 많다. 해당하는 운(원격, 형격, 이격, 정격)에 인생의 시련이나 건강불안을 겪기 쉽다. 일반적으로 미남미녀가 많고 바람둥이 기질을 가지며 특히 남자일 경우에 더욱 바람 끼가 많으므로 이로 인해 가정 불안이 조성되기 쉽다."],["총명격","지달운","聰明格·智達運",2,"탁월한 두뇌와 지혜로 사물의 이치에 통달하여 미래를 내다보는 판단력으로 세상의 흐름과 대세를 정확히 간파하고 그 정확함으로 추진하는 일들이 성공하여 출세의 길로 나아간다. 총운에 있을 경우에는 거의 천재형이며 특유의 카리스마를 보유하여 강력한 리더쉽으로 집단에서 우두머리 역할을 잘 맡는다."],["이산격","파괴운","離散格·破壞運",0,"의협심이 강하여 남의 어려움을 자신의 일처럼 도맡아 하지만, 액운이 따라 심신이 고달프게 된다. 부침파재(浮沈破財)의 운수에 해당하므로 노력을 기울여도 결실이 풍요롭지 않은 수이다. 육친과의 생리사별 후 가정적 파탄을 일으켜 매우 고독하고 괴로운 번뇌의 인생살이를 산다. 20대에 결혼을 하였으면 부부 싸움이 잦고 별거내지는 이혼도 할 수 있다. 이씨나 고씨의 경우에는 총운에서 나올 가능성이 있고 나머지 성씨에서는 주로 세운에서 나온다."],["통솔격","복수운","統率格·福壽運",2,"음양이 화합하는 운이니 타고난 재능과 인덕 그리고 지혜를 겸비하였다. 수많은 닭 가운데 학과 같은 존재라 남보다 눈에 띨 만큼 준수한 용모와 뛰어난 재능을 발휘하는 등 두각을 나타내어 뭇 사람들로 부터 추앙과 신뢰를 한 몸에 받아 사람들의 으뜸이 되며 성공, 발전하여 부귀영화를 누리며 빛나는 인생을 산다. 다만, 자신만 잘났다고 교만한 생각을 품는 경우가 많다."],["덕망격","유재운","德望格·裕財運",2,"마음이 어질고 너그러워 어려운 환경에 있는 사람들을 직접 찾아 다니며 돌보아주고 선을 베푸는 기질을 갖추고 있어서 다른 사람들로 부터 호인 또는 착한 사람이라는 말을 많이 듣는다. 또한 사람이 좋아서 남의 부탁을 들으면 겉으로는 거절하면서도 결국 남을 도와준다. 이 수리는 여성에게 아주 좋은 수리이다. 이 수리는 무해무덕하고 무덤덤하고 착한 사람으로 사업보다는 직장생활에 잘 맞으며 융화를 잘한다. 실속은 없더라도 남에게 베풀어주는 착한 사람이므로 다른 사람들과의 융화력은 뛰어나지만 사업가로 나서기에는 문제가 있다."],["용진격","창달운","勇進格·暢達運",2,"의지가 굳세고 박력이 넘치며 적극적이고 출세를 위해 매진하게 되므로 대업을 성취하여 많은 사람들로부터 존경을 받게 된다. 강한성품으로 어려움을 극복하고 초지일관하여 모든 일을 성사시켜 대업을 이룬다. 자립으로 대성하여 이름을 천하에 떨치고 여러 사람의 추앙을 받는다. 활동적이며 의지가 굳어 한번 품은 뜻은 어떠한 어려움이 닥치더라도 불굴의 노력과 인내로 끝내 관철시켜 목적을 달성한다. 불굴의 의지로 자신의 주장과 목표를 끝까지 관철시키는 강한 수리이므로 여자가 감당하기에는 부담스러운 경우이다. 자기주장과 고집이 강하므로 타인의 말을 들어주는 척만 할뿐 결코 타인의 조언을 쉽게 받아들이지 않는다. 또한 신경이 예민하고 자존심이 강하므로 마음의 상처도 받기 쉬운 유형이다. 외국에 나가 성공한 사례가 많다."],["발전격","융창운","發展格·隆昌運",2,"확고한 신념과 뛰어난 지모로 점차 자신의 일을 발전시켜 그 명성을 널리 떨치고 자신이 하는 분야에서 최고의 자리에 올라 부귀영달하는 운이다. 예체능에 재능이 있는 기운이나 손재주가 많고 세심하고 민감하며 감수성이 풍부하다. 이 수리는 풍부한 감수성, 탁월한 예술감각, 타인에 대한 배려심을 갖춘 마음이 따듯한 사람으로 여성에게 가장 적합한 수리이다."],["성패격","병악운","成敗格·病惡運",0,"명석한 두뇌와 남다른 실천력을 바탕으로 부단한 노력을 기울이기는 하지만 이상하게도 운이 따라주지 않으니 예기치 못한 고난이 닥쳐와 중도에 좌절해 버리고 마는 안타까운 수리다. 일시적인 성공이 오는가 싶어도 의외의 일이 발생하여 그간의 수고도 수포로 돌아가므로 인생이 고난뿐이라 생각할 때가 많다. 비극적 환경속에서 외롭다는 말을 입에 달고 살 팔자이며 혼자 생각하는 시간이 많은 기운이다."],["공허격","허망운","空虛格·虛妄運",0,"이 수리는 흉한 수리로 성명학상으로 가장 꺼려하는 수리이다. 20수리는 음끼리 만난 수이므로 남녀간의 인연이 어긋나고 길함은 적고 흉사만 많은 수이다. 19수리와 마찬가지로 아무리해도 이루어지지 않는 운이다. 탁월한 아이디어를 가진 똑똑한 사람이지만 돈을 추구하면 반드시 망한다. 창의력을 바탕으로 사업성을 시도하지만 끊임없이 성공과 몰락을 반복하다가 결국은 망한다. 다만, 자선이나 베푸는 일(성직자, 자선사업가)또는 법률가, 군인, 의사, 교사(타고난 칼의 기운을 활용하는 등의 직업)등으로 활용하면 흉을 면할 수 있다.(다만 건강불안은 항상 주의하여야 한다). 일반적으로 자아가 강하고 고집이 세며 교만하여 타인에게 쉽게 설득되지 않는다."],["자립격","두령운","自立格·頭領運",2,"솔직한 태도와 매사에 적극적인 사고방식으로 능력을 발휘하니 부귀공명을 힘들지 않고도 얻음은 물론 사회적 국가적으로도 매우 중요한 위치에 오르게 된다. 뛰어난 지모와 덕성, 성실성은 뭇 사람들의 선망의 대상이 되어 존경심을 한 몸에 받으며 지도자로 추대되는 두령운의 기운을 갖는 수리이다. 이와같이 만인의 추대를 받은 지도자로서 높은 위치에서 많은 사람들을 거느리고 자신의 역량을 남김없이 발휘한다. 대장의 기운이니 무리 속에서 언제나 높은 자리에서 살아가며 부귀영화를 누린다. 여성의 경우 전업주부 보다 사회활동을 하는 것이 좋다."],["중절격","박약운","中折格·薄弱運",0,"외모가 수려하고 재능과 지혜 또한 탁월하여 맡은 임무를 처리해 나감에 있어 남보다 빠른 추진력을 보이기는 하나, 항상 결실이 풍요롭지 않은 수이다. 비상한 재주를 가졌으나 때를 만나지 못해 재주를 펼 수 없으므로 세상에 대한 비관과 근심 걱정, 원망만 가득한 삶이 된다. 모든 일이 뜻대로 되지 않아 말짱 헛수고로 돌아가고 뜻하여 바란 일은 중도에서 좌절과 실패를 맞게 된다. 도모하는 일마다 거의 이룰 수 없다. 꿈은 크고 허세가 심하며 칭찬에 인색하고 남의 결점에 민감하다. 아웃사이더 기질이 강하여 비판적 성향을 띤다. 사주명리학에서 원진살과 유사한 성질이다."],["혁신격","왕성운","革新格·旺盛運",2,"명석(明晳)한 두뇌와 끈기 있는 적극적인 행동이 젊은 나이에 입신양명(立身揚名)의 길에 들어서게 한다. 하늘 중간에 해가 높이 떠있는 형상으로 일약 출세의 기운으로 많은 사람들의 중심이 되어 그들을 통솔하고 즉 영도자의 역할을 하면서 태양처럼 크게 빛나며 성공한다. 좌절하더라도 반드시 극복하는 강한 의지력을 가졌다. 여자의 경우에는 강한 기질이긴 하지만 의지가 굳고 생활력이 강하여 직업 전선에 나서면 다른 사람들에게 뒤지지 않고 열심히 살아가는 장점도 있으며여자라도 생활력이 매우 강하다."],["출세격","축재운","出世格·蓄財運",2,"무에서 유를 창조하는 수리다. 따라서 맨손으로 시작해서 꾸준히 노력하여 재산을 모아 큰 부를 축적하고 성공해서 이름을 널리 날린다. 자수성가로 부자가 되는 수다. 상황을 헤아려 꾀를 내는 계교능력이 탁월하여 여러 가지 어려운 일을 잘 헤쳐나간다. 여자는 현모양처나 또순이 기질이 있다. 재물운과 여복을 의미하므로 주로 한자 획수에서 초년에 오면 부자집에서 태어나거나 당사자를 낳고 나서 집이 부자가 되는 경우가 많고 총획에서 오면 자수성가로 부를 축적하는 경우가 많다. 31획 자수성가 보다는 자수성가의 의미(힘든 정도)가 수월하다."],["안강격","재록운","安康格·財祿運",2,"지모 출중격으로 지략이 뛰어난 수리다. 이겨놓고 싸우는 수리라 지모로 성공한다. 싸움도 꼭 이기는 싸움을 하는 운이다. 아무리 어려운 일도 능히 잘해 나가면서 처신을 한다. 자기가 꾸민 일은 거의 성공한다. 영리한 계교로 모든 일을 계획대로 순풍에 돛단 듯이 순조롭게 성공시킨다. 언제나 주변의 어려움을 기지로 잘 해결한다. 머리가 뛰어난 지략가의 수리로 이순신(李舜臣) 장군의 총운이다. 남녀공히 가정을 중시하는 수리이기 때문에 여자들은 현모양처이며 남자들도 가정을 소중히 여기는 가정제일주의자이다."],["만달격","영웅운","晩達格·英雄運",2,"의협심이 강하고 용맹하여 보스기질이 강하여 자기 몸을 돌보지 않고 희생하더라도 앞장서기를 잘한다. 큰일을 도모하고 실천하기를 좋아하여 승승장구하여 영웅호걸의 지위에 까지 오르게 되지만 평탄한 일상을 추구하는 순탄한 삶을 일구어 나간다."],["대인격","중절운","大人格·中折運",1,"대인의 풍모를 지니고 영리하고 비범한 자질에 강한 자아심과 지도력을 겸비하여 큰 야망을 가지고 대업을 이루고 출세하여 부귀영달 한다. 대인의 형상이니 야망이 커서 스케일이 크다. 따라서 사소한 일에 신경도 쓰지 않고 흔들리지도 않는다. 대인격이라 해당 분야에서 최고의 명망을 유지 할 수 있다. (※ 영리, 비범, 대범, 야망, 지도력, 인기 → 운동이나 예능분야에 재능)"],["풍파격","파란운","風波格·波瀾運",0,"만경창파에 일엽편주가 떠 있어 큰 파도를 만난 형상이니 모든 것이 쓸려나갈 수 있다. 좋은 기회를 타고 일약 천하에 이름을 떨치는 호걸이나 풍운아 격으로 인생에 파란곡절이 있다."],["성공격","향복운","成功格·享福運",2,"권력의 수리다. 포부가 원대하고 지모와 활동력이 탁월하여 중단 없이 발전을 이룩해 대업을 성취하게 되고 부귀장수하기 때문에 더 할 나위 없는 길한 수리이다. 권력의 수리이며 강한 권력욕을 가진다. (※ 대표적인 재물수리 → 24획 부귀영화, 대표적인 권력수리 → 29획 권력재물 ⇒ 24획+29획 = 부와 권력을 동시에 갖음.)"],["불측격","불안운","不測格·不安運",1,"길과 흉의 양극단을 달리는 운명이다. 특이한 발상과 권모술수로 큰 일을 성취하여 한 때 성공의 가도를 달리는가 싶다가도 재난과 악운이 일시에 겹쳐 온갖 어려움을 겪게되며 또 얼마 안가서 어려움을 딛고 성공의 기회를 잡는다.(※ 초반이 좋으면 후반이 않좋고 초반이 않좋으면 후반이 좋다. 마음이 따듯한 사람들이다.)"],["세찰격","흥가운","世察格·興家運",2,"부모의 도움을 받기 보다는 자수성가하는 수리이다. 즉 지혜와 용기 그리고 굳건한 의지와 불굴의 정신을 바탕으로 자신의 힘으로 어려움을 극복하고 최선을 다하여 자립 대성하여 부귀안락하고 공명을 떨치며 수복강령하는 운이다. 도움없이 성공하는 대표적인 수리이다.(※ 성공의 규모는 주역괘에 영향을 받음(산천대축 - 대흥, 풍천소축 - 소흥)"],["순풍격","왕성운","順風格·旺盛運",2,"뜻밖의 행운으로 인생을 성공의 길로 바꿔놓는 귀인을 만나거나 승진을 하고 생각지도 않은 곳에서 재물이 들어오거나 뜻밖의 성공의 기회를 얻는 등 재물과 명예를 얻고 상하의 신망과 존경을 받는다.(※ 기회포착에 민첩하다. 정주영 회장에 있는 수리)"],["등용격","융성운","登龍格·隆盛運",2,"권위가 하늘을 찌를 지경의 수리이고 타고난 머리에 호탕한 기질을 가지고 권위 있는 자리에 올라 이름을 널리 알린다. 재주와 덕성을 겸비하고 용기와 결단성 그리고 추진력을갖추고 있다. 어떤 난관이 있더라도 능히 돌파하고 타개하여 마침내 큰 뜻을 이루어 그 명성과 위세가 온 세상에 진동하는 운수다. 여성이 이 수리를 가지면 사회적으로 우두머리가 되고 남자의 능력에 버금가는 그릇이 큰 여성이긴 하지만 수리가 너무 강하여 남편을 이길 수 있으니 그것이 흠이다. 남자에게는 매우 길한 수리이지만 여자에게 가장 부담스러운 수리로 여자의 경우에는 독신의 기운이 강하다.여자가 독신으로 산다면 큰 무리는 없다."],["변란격","파멸운","變亂格·破滅運",0,"4나 14수리와 마찬가지로 분리, 파산의 흉한 작용이 미치고 있으므로 가족 간의 이합집산, 반목과 불화, 패가, 직업상의 잦은 변동과 좌천, 실직, 병고, 등이 발생한다. 부모형제 및 처자와의 이별로 외롭고 고독할 수이다. 주관적이기 보다는 객관적이고 타인의 조언도 귀담아 들을 줄 아는 열린 마음이 필요하다."],["태평격","안강운","泰平格·安康運",2,"이 수리는 일을 처리하는데 엄격함과 신중함이 있어 주어진 직분에 대해 평생을 통해 성실히 종사하는 유형의 사람에게서 많다. 학문과 지혜를 겸비하였으니 비록 영웅호걸은 안 될 지언정 행복하고 편안한 일생을 영위하게 된다. 남자에게는 박력이 부족하고 잔소리가 많은 것이 흠이다. 여자가 이수리가 있으면 매력을 발산하여 주위의 많은 남성들이 따르게 되며 결혼 후에도 현모양처로서 내조를 잘하며 가정의 화목을 위하여 최선을 다하므로 여성으로서는 가장 안전되고 편안한 좋은 수리이다. 성실하고 온유하므로 전형적인 여성의 수리이고 남자일 경우에는 잔소리가 많고 좀생이 기질이 있으며 여성적인 직업(디자이너, 요리사, 미용사 등)에 종사하는 경우가 많다.(※ 말을 많이 필요로 하고 따듯함을 필요로 하는 정신과 의사나 카운셀러 등에 종사하면 좋고 꼼꼼함을 요구하는 회계사나 연구직도 좋다.)"],["영웅격","파란운","英雄格·波瀾運",0,"타인을 위한 희생정신이나 의협심이 있는 영웅적 기질이므로 타인을 위해 사는 이타적인 삶으로 동분서주하는 생활로 분주하게 움직이지만 바쁜 만큼의 실속이 없고 고난이 따르며 승패의 운이 자주 바뀌고 희비의 쌍곡선이 돌고 도는 무상한 운수다.종교, 철학이나 사회사업에 적합하다."],["정치격","출세운","政治格·出世運",2,"자기 분야에서는 권위가 대단하고 매우 충실하여 큰 성공을 거두는 형상으로 비할 바가 없이 좋은 운수이다. 만 가지 어려움을 돌파하고 큰 업적을 이룰 뿐만 아니라 남을 배려하는 넓은 마음의 소유자이며 자상하고 인정이 많고 덕망과 자비, 포용력이 있어서 많은 사람들이 훌륭한 사람이라고 칭송한다."],["문예격","학사운","文藝格·學士運",2,"온화한 성격을 가지고 있으며 재주가 뛰어나고 총명할 뿐만 아니라 섬세한 감수성을 가지고 있어 자신과의 싸움으로 명성을 얻는 문학, 예술, 창작, 과학, 기술, 서예 등으로 나아가면 큰 업적을 남겨 명성을 날리게 된다."],["장성격","지휘운","將星格·指揮運",2,"장군의 풍모로서 재주와 계략이 탁월하고 발군이라 만난을 극복하고 기회를 얻으면 파죽시세로 일약 성공을 거두어 위세와 명성을 천하에 떨쳐 세인의 존경을 한 몸에 받는다. 구름이 걷히고 달이 나타난 형상이다."],["변화격","공허운","變化格·空虛運",0,"운기가 공허하고 변화무쌍하다. 한번 길운이 오면 뒤이어 쇠운이 오므로 한때의 성공도 오래가지 못한다. 더구나 투기적 욕심도 있어서 일확천금을 꿈꾸다가 패가망신하는 일도 있게 된다."],["고명격","제중운","高名格·濟衆運",2,"앞날을 예측하는 능력과 세상의 만사를 통찰하는 안목이 깊고 선견지명이 있어 지도자적 자질이 뛰어난 수리이다. 용기, 지혜, 덕망을 모두 겸비했으니 명성이 천하에 떨쳐서 수명장수하고 부귀영화를 누리면서 가문이 날로 번창한다. 신중한 처세와 큰 일을 도모하는 대담함으로 후세에 까지 그 이름을 떨치고 자식이 잘되는 수이다. 41획 선견고명, 45획 통달사해, 48획 배후조정은 교육자나 정치가 등에 적합한 지도자적 수리로서 유사성을 갖는다. 자식들이 잘되는 수리이기도 하다."],["신고격","수난운","辛苦格·受難運",0,"타고난 재주가 많아 다방면으로 박학다식 하다보니 의욕이 넘쳐서 여러가지 일에 손을 대지만 결과적으로는 한 가지 일도 마무리가 되지 못해서 좌절감만 커진다. (※ 초지일관이 필요한 수리이다.)"],["성쇠격","산재운","盛衰格·散財運",0,"외화내빈이라고 겉으로는 화려하고 그럴싸해 보이지만 안으로는 내면의 근심이 많고 재액이 겹치므로 삶에 대한 회의를 많이 느끼게 된다. 더구나 의지까지 박약하여 파란과 조난으로 어려움에 닥칠때 자포자기하게 되며 허황된 유혹에 쉽게 빠진다. 43획 패가망신이나 44획 백전백패는 20획 백사실패와 유사하다."],["침마격","파멸운","侵魔格·破滅運",0,"인생을 통해 겪을 수 있는 모든 고난을 겪는 수이다. 하는 일마다 마가 끼어 잘되던 일도 뜻밖으로 실패로 끝나게 되고 설령 물려받은 유산이 있다해도 추풍낙엽 처럼 흔적도 없이 흩어져 버려서 생활고를 면할 수 없게 된다."],["대각격","현달운","大覺格·顯達運",2,"지혜가 출중하고 의지가 확고하여 부귀영화를 누린다. 세상의 이치를 꿰뚫는 선견지명과 천재적인 재능으로 만민의 우두머리로서 대업을 성취하여 이름을 사해에 떨치게 된다."],["미운격","비수운","未運格·悲愁運",0,"비록 천재적인 발상과 재능이 있어도 때를 만나지 못한 체 암흑에 갖혀 이리저리 방황만 하고 있는 형상이 되므로 비관과 근심만 가득한 나날을 보내게 된다. 소극적이고 비사교적인 성품으로 인해 사회적으로도 출세 운과는 거리가 멀다. 다만 내면의 심리를 탐구하거나 발명 등의 독자적인 창작분야 등의 일에서는 특유의 성품과 재능을 이용하여 적지 않은 성취감을 가질 수 있다."],["출세격","득시운","出世格·得時運",2,"물고기가 대해를 만난 격이니 만물이 소생하는 봄기운과 같은 소생과 활력의 기운이 넘치게 된다. 귀인의 도움이 있어서 큰 실패를 모르고 문제를 해결하게 되며 도모하는 일마다 순풍에 돛단 듯 순조롭게 진행되어 대부대길(大富大吉)한 수이다. (※ 대인관계를 중시하는 업종에 적합하다.(사업가, 카운슬러))"],["제중격","영달운","濟衆格·榮達運",2,"성품이 원만하고 정직하여 다른 사람들의 모범이 되므로 추앙과 신망을 잃지 않는다. 무슨 일이든 너그럽게 받아들이고 포용하는 성질이 있어 남을 선도하는 상담역이나 고문, 지도자, 스승의 역할을 하면 좋다."],["변화격","성패운","變化格·盛敗運",0,"행운과 불운이 동시에 존재하는 운수로서 조건의 여하에 따라 행운이 될 수도 있고 불운이 될 수도 있다. 어느 정도의 성공을 이루면 반드시 실패가 따르는 수리이며 변화무쌍한 기운을 의미하기 때문에 정치가나 투기꾼들에게 많은 수리이다."],["상반격","길흉운","相半格·吉凶運",0,"한 번은 크게 성공하나 그 후에는 실패가 많아 패가망신하는 수이다. 갈수록 형편이 나빠지는 대흉의 수리이다."],["길흉격","성패운","吉凶格·盛敗運",1,"파란변동이 많고 행, 불행의 기복이 심한 수리이다."],["승룡격","시승운","昇龍格·時乘運",2,"무에서 유를 이끌어내듯이 뛰어난 지략과 선견지명으로 큰 일을 성취한다. 세상의 흐름을 간파하는 통찰력과 식견이 밝고 일을 도모하는 능력이 탁월하여 기회가 주어지면 놓치지 않고 상승과 발전의 발판으로 삼아 승승장구하면서 권위와 명예를 얻는다. 이름에서는 나오기 어렵지만 호와 함께하면 가능한 수리이다. (※ 통찰력과 식견 → 교육자, 학자, 타고난 재능 → 예술가 등에 적합하다.)"],["내허격","반길운","內虛格·半吉運",0,"겉으로는 화려하고 크게 성공한 듯 보이지만 실제로는 금방 실패하여 안으로는 근심과 걱정만 가득차서 어떤 즐거움도 없는 형상이다."],["무공격","패가운","無功格·敗家運",0,"인간이 감내 할 수 있는 고통의 한계를 넘어서 재난이 닥쳐오는 수리이다. 역마살이 끼어 고향을 떠나 타향에서 분주히 노력하는데도 성공의 운이 없고 매사에 실패만 거듭한다."],["미달격","불안운","未達格·不安運",1,"대길수인 5와 대흉수인 50이 합친 운수로 길흉이 반반이다. 자칫 잘못하다가는 신기루만 쫓다가 일생을 허비 할 수도 있다."],["한탄격","패망운","恨歎格·敗亡運",0,"의지가 약하고 인내력도 부족한데다가 주변으로부터의 도움도 받기 힘들어져 매사가 좌절감만 커지게 되고 현실적으로는 곤궁한 생활을 면치 못한다."],["봉시격","강성운","逢時格·强盛運",2,"비록 벗어나기 힘든 시련이라도 어느 정도 시간이 흐르고 때가 되면 운세가 전환되어 매사가 순조롭게 풀려 나간다. 일확천금을 꿈꾸는 체질이 아니라 처음부터 한 발짝 씩만 나가는 노력형이다. 근면하기 때문에 지위를 더하고 재물을 불려 나간다."],["선곤격","후복운","先困格·後福運",1,"길흉이 반반인 수리이지만 시작보다 결과가 좋게 되므로 인생의 말년으로 갈수록 노력한 만큼의 성취감을 맛보게 된다."],["재화격","불성운","災禍格·不成運",0,"의지가 박약하고 인내력이 부족하여 모든 일이 이루어지지 않고 재화가 속출해서 역경에 빠지며 가산을 탕진하는 비운의 수리다."],["동요격","재난운","動搖格·災難運",0,"동서남북을 돌아다녀도 성사되는 것보다 실패되는 것이 많다."],["이지격","재리운","理智格·財利運",2,"지혜가 출중하고 지략이 있어서 재물운과 영예운을 겸비한 부귀영화격의 매우 길한 수리이다.(※호를 넣어 지을때 선택하는 수리(52획 비룡승천 또는 61획 부귀영달))"],["화락격","쇠퇴운","花落格·衰退運",0,"한 마디로 쇠퇴와 실패의 운세를 암시한다. 사회적으로는 신망을 잃게되고 고난과 번민으로 인해 사업장으로는 발전하기 어려워지므로 기력이 노쇠한 가운데 횡액이 가중되어 일신상으로는 고독하게 될 수리이다. 여자는 구설수를 조심하여야 한다. 종교, 철학, 단순연구직에 적합하다."],["순성격","발전운","順成格·發展運",2,"만물을 변화시키고 생육시키는 번영의 형상이므로 뜻하는 모든 것이 순조롭게 발전해 간다. 행복을 누리는 행운의 길수이다."],["봉상격","쇠멸운","逢霜格·衰滅運",0,"침체와 파멸이 중첩될 수이므로 가장 흉한 수리중의 하나이다. 의욕이 앞서다보니 생각이 수시로 바뀌어 일의 처음은 있어도 끝은 없다."],["휘양격","흥가운","輝陽格·興家運",2,"원만한 성품과 성실한 자세로 인해 주변의 신뢰와 존경을 받으면서 젊어서부터 성공과 출세의 길로 들어서게 되며 중년 이후에는 사회적인 명사로서 이름을 널리 떨치게 된다."],["암야격","실등운","暗夜格·失登運",0,"우둔하고 계획성이 없는 천성으로 인해 빈곤과 역경이 계속되며 재난이 겹쳐서 진퇴양난의 현상이 오래 지속된다."],["천복격","영달운","天福格·榮達運",2,"만사가 의지대로 되므로 하늘로부터 복을 타고난 것처럼 이름을 사해에 떨치게 된다."],["명지격","발명운","明智格·發明運",2,"생각이 깊고 주도면밀한 계획을 세워서 일을 진행하므로 좋은 기회가 왔을 때 그 기회를 놓치지 않고 성공과 재물축적의 발판으로 연결시킨다."],["종말격","정지운","終末格·停止運",0,"의지가 견고하지 못해 마음은 항상 불안과 근심으로 흔들리고 우유부단한 성격 탓에 주관없이 일을 처리하다가 타인의 유혹이나 함정에 빠져 곤란을 면하기 어렵게 된다."],["공허격","암야운","空虛格·暗夜運",0,"도모하는 일마다 참담한 결과를 가져올 뿐이다. 하나의 재난을 피해 돌아서면 생각지도 않은 재난이 다시 버티고 서 있는 형국이라서 극도의 인내와 노력으로 삶을 개척하려 하여도 만사가 여의치 않고 처자와도 생리사별하게 되어 고향을 떠나 먼 적막강산의 객지에서 홀로 외로울 수리이다."],["현룡격","발전운","見龍格·發展運",1,"길흉이 반반인 격으로 난관을 헤쳐 나가는 의지와 용기로 인생의 험준한 봉우리들을 넘다보면 반드시 중년 이후에 노력한 만큼의 성공을 거둬서 부귀영화를 누리게 된다."],["상반격","후곤운","相半格·後困運",0,"길흉이 함께 섞여 있으니 인생의 희비가 교차한다. 겉으로는 길하나 속으로는 불안하며 길흉이 상반이라 처음에는 행복하나 후반에는 불행한 운이다."],["평길격","안과운","平吉格·安過運",2,"인생의 초반에는 다소 운세가 약하여 심리적인 어려움이 크지만 후반부로 갈수록 운세가 순조롭고 호운이 계속되므로 입지전적인 인물은 못되더라도 평범함 속에서 만족을 느낄 수 있는 안라과 작은 행복이 보장된 삶을 영위한다."],["우매격","불우운","愚昧格·不遇運",0,"지혜가 없는 가운데 매사를 무계획과 무위도식으로 일관하므로 곤궁한 생활을 면하지 못한다."],["적시격","평화운","適時格·平和運",1,"강한 운세가 이어지다가도 그 속에 흉운이 되어 재난이 닥칠수 있으나 늘 분수를 지키고 신중한 자세로 내일을 계획한다면 심신 모두 안정과 건강을 유지할 수 있게 된다."],["선곤격","후성운","先困格·後盛運",1,"중년까지는 곤경이 계속되나 이에 좌절하지 않고 모든 흉사를 견뎌낸 사람에게는 중년 이후부터 서서히 운이 열리기 시작하여 후반 인생은 평범한 복을 누린다."],["전후격","길흉운","前後格·吉凶運",0,"의지가 박약하고 세상풍파와는 거리가 먼 귀공자격의 성품이라서 의존적이고 실속이 없는 생활을 하게 된다."],["선길격","평복운","先吉格·平福運",1,"타고난 재능과 노력으로 중년 이전에는 성공의 기쁨을 만끽하며 부귀영화를 누린다."],["종극격","종말운","終極格·終末運",0,"희망의 서광이 비춰주지 않으므로 아무리 노력을 해도 성취한 결과는 너무나 가볍고 미미한 것이어서 기력만 소진한 채 삶의 의욕마저 상실하게 된다."],["종결격","은둔운","終結格·隱遁運",0,"수리의 끝으로 만사가 종결된다는 뜻이다."],["환원격","성대운","還元格·盛大運",2,"이 81 수리는 다시 1로 환원하는 수이다. 9의 9승으로 최극수이다. 따라서 81 수가 암시하는 의미는 1이 의미한 바와 대동소이하여 소생과 창조의 기운을 나타낸다. 즉 사업을 다시 일으킨다거나 잃었던 명예와 재산을 되찾는 데에 가장 알맞은 수리이다. 한마디로 1과 맞먹는 강한 운세를 암시하는데 대길수이다. 80이 지나면 다시 새로운 운이 되돌아오게 된다. 양기가 다시 돌아와 메마른 초목에 춘풍이 일고 봄비가 내려 다시 서서히 풀리기 시작하고 신용이 회복되어 뜻한 바 소원을 성취한다."]],"hj":{"導":[16,"이끌","도"],"頭":[16,"머리","두"],"寶":[20,"보배","보"],"柄":[9,"자루","병"],"憲":[16,"법","헌"],"顯":[23,"나타날","현"],"升":[4,"되","승"],"朱":[6,"붉을","주"],"采":[8,"캘","채"],"垂":[8,"드리울","수"],"抒":[8,"풀","서"],"河":[9,"물","하"],"玄":[5,"검을","현"],"原":[10,"근원","원"],"永":[5,"길","영"],"進":[15,"나아갈","진"],"延":[7,"끌","연"],"徐":[10,"천천할","서"],"赴":[9,"나아갈","부"],"明":[8,"밝을","명"],"補":[13,"도울","보"],"憺":[17,"편안할","담"],"昇":[8,"오를","승"],"儁":[15,"준걸","준"],"緣":[15,"인연","연"],"定":[8,"정할","정"],"憘":[16,"기뻐할","희"],"旼":[8,"화할","민"],"珍":[10,"보배","진"],"代":[5,"대신","대"],"炅":[8,"빛날","경"],"熙":[13,"빛날","희"],"勳":[16,"공","훈"],"暎":[13,"비칠","영"],"震":[15,"진동할","진"],"首":[9,"머리","수"],"値":[10,"값","치"],"詵":[13,"많을","선"],"晁":[10,"아침","조"],"演":[15,"통할","연"],"賢":[15,"어질","현"],"佑":[7,"도울","우"],"旿":[8,"밝을","오"],"逵":[15,"한길","규"],"除":[15,"덜","제"],"姝":[9,"예쁠","주"],"錦":[16,"비단","금"],"盡":[14,"다될","진"],"美":[9,"아름다울","미"],"唎":[10,"가는소리","리"],"熹":[16,"성할","희"],"例":[8,"법식","예"],"渽":[13,"맑을","재"],"旻":[8,"하늘","민"],"煐":[13,"빛날","영"],"覩":[16,"볼","도"],"徒":[10,"무리","도"],"煥":[13,"밝을","환"],"煜":[13,"빛날","욱"],"麾":[15,"지휘할","휘"],"世":[5,"인간","세"],"尹":[4,"다스릴","윤"],"竪":[13,"세울","수"],"素":[10,"흴","소"],"乘":[10,"탈","승"],"志":[7,"뜻","지"],"頂":[11,"정수리","정"],"玹":[10,"옥돌","현"],"筵":[13,"장소","연"],"娟":[10,"예쁠","연"],"叡":[16,"밝을","예"],"炫":[9,"빛날","현"],"茶":[12,"차","다"],"然":[12,"그러할","연"],"林":[8,"수풀","림"],"厦":[12,"큰집","하"],"連":[14,"이을","연"],"卿":[12,"벼슬","경"],"潾":[16,"맑을","린"],"預":[13,"미리","예"],"受":[8,"받을","수"],"練":[15,"익힐","연"],"柳":[9,"버들","유"],"周":[8,"두루","주"],"厚":[9,"두터울","후"],"現":[12,"나타날","현"],"晳":[12,"밝을","석"],"成":[7,"이룰","성"],"佶":[8,"바를","길"],"致":[10,"이를","치"],"扶":[8,"도울","부"],"京":[8,"서울","경"],"熀":[14,"환히빛날","엽"],"映":[9,"비칠","영"],"羽":[6,"깃","우"],"怡":[9,"기쁠","이"],"解":[13,"풀","해"],"舒":[12,"펼","서"],"化":[4,"될","화"],"彩":[11,"채색","채"],"營":[17,"경영할","영"],"智":[12,"지혜","지"],"曙":[18,"새벽","서"],"線":[15,"줄","선"],"祚":[10,"복","조"],"慧":[15,"지혜","혜"],"船":[11,"배","선"],"彬":[11,"빛날","빈"],"優":[17,"넉넉할","우"],"孚":[7,"미쁠","부"],"珤":[11,"보배","보"],"岫":[8,"산굴","수"],"侑":[8,"너그러울","유"],"忍":[7,"참을","인"],"正":[5,"바를","정"],"如":[6,"같을","여"],"在":[6,"있을","재"],"敏":[11,"민첩할","민"],"希":[7,"바랄","희"],"亞":[8,"버금","아"],"見":[7,"뵈올","현"],"嬋":[15,"고울","선"],"曉":[16,"새벽","효"],"雅":[12,"맑을","아"],"書":[10,"글","서"],"軫":[12,"수레","진"],"倫":[10,"인륜","윤"],"字":[6,"글자","자"],"璉":[16,"호연","연"],"印":[6,"도장","인"],"珉":[10,"옥돌","민"],"洗":[10,"씻을","세"],"殷":[10,"성할","은"],"偕":[11,"함께","해"],"燕":[16,"제비","연"],"至":[6,"이를","지"],"靜":[16,"고요할","정"],"綵":[14,"비단","채"],"註":[12,"주낼","주"],"嵋":[12,"산이름","미"],"氶":[5,"도울","승"],"彰":[14,"밝을","창"],"詣":[13,"이를","예"],"誾":[15,"화평할","은"],"再":[6,"거듭","재"],"隨":[21,"따를","수"],"準":[14,"법도","준"],"呼":[8,"부를","호"],"理":[12,"다스릴","이"],"綏":[13,"편안할","수"],"雄":[12,"수컷","웅"],"沇":[8,"물이름","연"],"西":[6,"서녘","서"],"淨":[12,"맑을","정"],"沚":[8,"물가","지"],"燃":[16,"불탈","연"],"埈":[10,"높을","준"],"收":[6,"거둘","수"],"祐":[10,"도울","우"],"僖":[14,"기쁠","희"],"引":[4,"이끌","인"],"蕁":[18,"지모","담"],"領":[14,"거느릴","영"],"曳":[6,"끌","예"],"住":[7,"살","주"],"陞":[15,"오를","승"],"輝":[15,"빛날","휘"],"夏":[10,"여름","하"],"庶":[11,"여러","서"],"蓮":[17,"연꽃","연"],"言":[7,"말씀","언"],"懸":[20,"달릴","현"],"璿":[19,"아름다운옥","선"],"勝":[12,"이길","승"],"援":[13,"당길","원"],"頻":[16,"자주","빈"],"財":[10,"있을","재"],"之":[4,"갈","지"],"峴":[10,"고개","현"],"瑛":[14,"옥빛","영"],"眞":[10,"참","진"],"生":[5,"날","생"],"高":[10,"높을","고"],"彛":[16,"떳떳할","이"],"愛":[13,"사랑","애"],"愿":[14,"삼갈","원"],"晟":[11,"밝을","성"],"度":[9,"법도","도"],"知":[8,"알","지"],"珠":[11,"구슬","주"],"睿":[14,"슬기","예"],"銀":[14,"은","은"],"善":[12,"착할","선"],"仁":[4,"어질","인"],"和":[8,"화할","화"],"秀":[7,"빼어날","수"],"自":[6,"스스로","자"],"松":[8,"소나무","송"],"岸":[8,"언덕","안"],"多":[6,"많을","다"],"民":[5,"백성","민"],"慈":[13,"사랑","자"],"昭":[9,"밝을","소"],"有":[6,"있을","유"],"允":[4,"진실로","윤"],"拿":[10,"잡을","나"],"俊":[9,"준걸","준"],"性":[8,"성품","성"],"承":[8,"이을","승"],"禧":[17,"복","희"],"耿":[10,"빛날","경"],"員":[10,"둥글","원"],"堵":[12,"담","도"],"潤":[16,"윤택할","윤"],"娜":[10,"아리따울","나"],"昀":[8,"햇빛","윤"],"宣":[9,"","선"],"兌":[7,"빛날","태"],"沿":[9,"따를","연"],"熺":[16,"성할","희"],"奕":[9,"클","혁"],"柔":[9,"부드러울","유"],"圓":[13,"둥글","원"],"玟":[9,"옥돌","민"],"材":[10,"재물","재"],"鴻":[17,"큰기르기","홍"],"泓":[9,"깊을","홍"],"晛":[11,"햇살","현"],"鉉":[13,"솥귀","현"],"璨":[18,"빛날","찬"],"宇":[6,"집","우"],"紫":[11,"자줏빛","자"],"泫":[9,"빛날","현"],"貞":[9,"곧을","정"],"怜":[8,"영리할","영"],"甫":[7,"클","보"],"運":[16,"돌","운"],"昶":[9,"밝을","창"],"祗":[10,"공경할","지"],"輪":[15,"바퀴","윤"],"拏":[9,"잡을","나"],"丞":[6,"도울","승"],"栽":[10,"심을","재"],"弦":[7,"활시위","현"],"太":[4,"클","태"],"胤":[11,"이을","윤"],"薰":[20,"향기","훈"],"伸":[7,"펼","신"],"址":[7,"터","지"],"蹊":[17,"기름길","혜"],"珢":[11,"옥돌","은"],"元":[4,"으뜸","원"],"澄":[16,"맑을","징"],"煇":[13,"빛날","휘"],"國":[11,"나라","국"],"值":[10,"값","치"]},"sur":[["김","金",8],["이","李",7],["박","朴",6],["최","崔",11],["정","鄭",19],["정","丁",2],["강","姜",9],["강","康",11],["조","趙",14],["조","曺",11],["윤","尹",4],["장","張",11],["장","蔣",17],["임","林",8],["임","任",6],["한","韓",17],["오","吳",7],["서","徐",10],["신","申",5],["신","辛",7],["신","愼",14],["권","權",22],["황","黃",12],["안","安",6],["송","宋",7],["류","柳",9],["유","兪",9],["유","劉",15],["전","全",6],["전","田",5],["홍","洪",10],["고","高",10],["문","文",4],["양","梁",11],["양","楊",13],["손","孫",10],["배","裵",14],["백","白",5],["허","許",11],["남","南",9],["심","沈",8],["노","盧",16],["하","河",9],["곽","郭",15],["성","成",7],["차","車",7],["주","朱",6],["주","周",8],["우","禹",9],["구","具",8],["민","閔",12],["진","陳",16],["진","秦",10],["나","羅",20],["지","池",7],["엄","嚴",20],["채","蔡",17],["원","元",4],["천","千",3],["방","方",4],["방","房",8],["공","孔",4],["현","玄",5],["함","咸",9],["변","卞",4],["염","廉",13],["여","呂",7],["추","秋",9],["도","都",16],["소","蘇",22],["석","石",5],["선","宣",9],["설","薛",19],["마","馬",10],["길","吉",6],["연","延",7],["위","魏",18],["표","表",8],["명","明",8],["기","奇",8],["반","潘",16],["왕","王",5],["금","琴",13],["옥","玉",5],["육","陸",16],["인","印",6],["맹","孟",8],["제","諸",16],["탁","卓",8],["모","牟",6],["국","鞠",17],["은","殷",10],["편","片",4],["용","龍",16],["경","慶",15],["봉","奉",8],["사","史",5],["예","芮",10],["경","景",12],["어","魚",11],["여","余",7],["하","夏",10]],"names":[["導","憲","도헌","d"],["頭","顯","두현","d"],["寶","升","보승","d"],["柄","朱","병주","d"],["采","原","채원","d"],["垂","永","수영","d"],["抒","進","서진","d"],["河","延","하연","d"],["玄","徐","현서","d"],["赴","昇","부승","d"],["明","儁","명준","d"],["導","緣","도연","d"],["補","定","보정","d"],["憺","憘","담희","d"],["補","炅","보경","d"],["旼","徐","민서","d"],["珍","熙","진희","d"],["代","勳","대훈","d"],["頭","暎","두영","d"],["明","震","명진","d"],["抒","演","서연","d"],["首","賢","수현","d"],["値","佑","치우","d"],["詵","旿","선오","d"],["晁","顯","조현","d"],["逵","盡","규진","d"],["除","勳","제훈","d"],["姝","美","주미","d"],["除","憲","제헌","d"],["渽","憲","재헌","d"],["旻","煐","민영","d"],["導","煥","도환","d"],["覩","煜","도욱","d"],["徒","麾","도휘","d"],["昇","賢","승현","d"],["世","頂","세정","d"],["尹","志","윤지","d"],["竪","玹","수현","d"],["素","筵","소연","d"],["乘","熙","승희","d"],["志","叡","지예","d"],["炫","抒","현서","d"],["茶","然","다연","d"],["叡","林","예림","d"],["厦","連","하연","d"],["叡","潾","예린","d"],["預","玹","예현","d"],["熹","練","희연","d"],["受","志","수지","d"],["周","炫","주현","d"],["頭","現","두현","d"],["叡","晳","예석","d"],["厚","成","후성","d"],["佶","京","길경","d"],["徒","熀","도엽","d"],["垂","映","수영","d"],["昇","炫","승현","d"],["致","羽","치우","d"],["扶","旼","부민","d"],["怡","化","이화","d"],["解","林","해림","d"],["舒","煐","서영","d"],["彩","原","채원","d"],["營","慧","영혜","d"],["炫","舒","현서","d"],["智","船","지선","d"],["曙","彬","서빈","d"],["線","優","선우","d"],["祚","永","조영","d"],["孚","升","부승","d"],["珤","震","보진","d"],["岫","忍","수인","d"],["垂","志","수지","d"],["侑","正","유정","d"],["進","周","진주","d"],["如","敏","여민","d"],["在","希","재희","d"],["亞","見","아현","d"],["例","嬋","예선","d"],["曉","賢","효현","d"],["雅","然","아연","d"],["旼","書","민서","d"],["舒","軫","서진","d"],["抒","河","서하","d"],["炫","周","현주","d"],["倫","亞","윤아","d"],["字","玹","자현","d"],["印","偕","인해","d"],["曉","燕","효연","d"],["珉","至","민지","d"],["洗","靜","세정","d"],["殷","綵","은채","d"],["例","熹","예희","d"],["註","嵋","주미","d"],["氶","再","승재","d"],["彰","隨","창수","d"],["詣","勳","예훈","d"],["誾","呼","은호","d"],["理","綏","이수","d"],["舒","炫","서현","d"],["渽","雄","재웅","d"],["曉","燃","효연","d"],["例","周","예주","d"],["例","炫","예현","d"],["叡","勳","예훈","d"],["玹","收","현수","d"],["埈","西","준서","d"],["靜","受","정수","d"],["祐","珍","우진","d"],["僖","盡","희진","d"],["至","敏","지민","d"],["營","盡","영진","d"],["引","領","인영","d"],["蕁","僖","담희","d"],["炫","亞","현아","d"],["曳","住","예주","d"],["陞","現","승현","d"],["至","現","지현","d"],["輝","營","휘영","d"],["夏","蓮","하연","d"],["庶","言","서언","d"],["叡","援","예원","d"],["補","頻","보빈","d"],["懸","暎","현영","d"],["璿","財","선재","d"],["勝","之","승지","d"],["忍","領","인영","d"],["峴","瑛","현영","d"],["眞","彛","진이","d"],["生","愛","생애","d"],["高","愿","고원","d"],["僖","珍","희진","d"],["茶","尹","다윤","d"],["理","首","이수","d"],["受","顯","수현","d"],["度","緣","도연","d"],["知","昇","지승","d"],["珠","銀","주은","d"],["彩","銀","채은","d"],["睿","原","예원","d"],["有","拿","유나","d"],["允","雅","윤아","d"],["俊","性","준성","d"],["岫","賢","수현","d"],["曉","忍","효인","d"],["承","禧","승희","d"],["在","耿","재경","d"],["導","員","도원","d"],["導","潤","도윤","d"],["堵","允","도윤","d"],["娜","昀","나윤","d"],["兌","沿","태연","c"],["抒","和","서화","c"],["員","熺","원희","c"],["渽","奕","재혁","c"],["解","圓","해원","c"],["靜","玟","정민","c"],["材","鴻","재홍","c"],["在","泓","재홍","c"],["舒","晛","서현","c"],["曉","鉉","효현","c"],["柳","璨","유찬","c"],["祐","在","우재","c"],["眞","宇","진우","c"],["志","玹","지현","c"],["泫","曙","현서","c"],["俊","怜","준영","c"],["輝","性","휘성","c"],["甫","運","보운","c"],["昶","炫","창현","c"],["炫","曙","현서","c"],["貞","玟","정민","c"],["祗","輪","지윤","c"],["舒","彬","서빈","c"],["柄","受","병수","c"],["丞","栽","승재","c"],["柔","弦","유현","c"],["太","炫","태현","c"],["受","胤","수윤","c"],["昶","薰","창훈","c"],["逵","唎","규리","c"],["除","熹","제희","c"],["導","熹","도희","c"],["伸","蹊","신혜","c"],["址","娟","지연","c"],["錦","美","금미","c"],["優","周","우주","c"],["徐","進","서진","c"],["素","珢","소은","d"],["多","珉","다민","d"],["厚","連","후연","d"]],"interp":{"효연":"‘모든 인연에서 기쁨이 찾아온다.’는 뜻으로 속뜻은 향상한 발전으로 나아감을 말합니다. 앞으로 큰 축복이 다가오길 기원하는 이름입니다.","이화":"‘기쁨을 향해 나간다는.’뜻으로 재물과 명예가 크고 길게 부족함 없이 들어옴을 의미합니다. 행운이 계속되길 바라는 대길한 이름입니다.","태연":"크게 이끈다는 뜻으로 나와 가정에 화목과 평온은 물론 많은 이들을 따르게 하는 덕망을 갖춘 이름에서 향후 일상의 안락이 늘 함께한다는 대길명의 이름입니다.","승지":"‘인생을 윤택하게 이끈다는’는 뜻으로 속뜻은 성실로 윤택한 삶을 더해 나감을 말합니다. 가치 있는 인생으로 나아가길 바라는 대길격의 이름입니다.","재혁":"크게 맑힌다는 뜻으로 나와 가정에 화목과 평온을 의미함에서 향후 일상의 안락이 찾아오길 기원하는 대길명의 이름입니다.","재웅":"어둠을 몰아낸다는 뜻으로 나와 가정에 화목과 평온을 의미함에서 향후 일상의 안락이 찾아오길 기원하는 대길명의 이름입니다.","서진":"한자의 의미는‘진취적 삶으로 나아감의’뜻으로 그 의미에‘꼭 필요한 존재’라는 의미가 내포되어 있습니다. 화목과 안락을 꾸민다는 깊은 뜻이 담긴 길명입니다.","예현":"한자의 의미는‘세상의 빛이라는’뜻으로 그 의미에‘풍족한 광명’이라는 의미가 내포되어 있습니다. 화목과 안락을 꾸민다는 깊은 뜻이 담긴 길명입니다.","현서":"‘화평을 이룬다’는 뜻으로 속뜻은 신뢰로 인해 세상의 신망을 받는다는 것을 말합니다. 가치 있는 인생으로 나아가길 바라는 대길격의 이름입니다.","수현":"모든 일들이 스스로 조복되어 참되게 나아간다는 길명으로, 행복과 장수를 부른다는 뜻으로 나와 가정에 화목과 평온을 더한다는 대길명의 이름입니다.","해원":"어려운 고비마다 행운을 부르는 길명으로, 가정의 안락과 만인의 존경을 받는다는 대길격의 수리로 풍족한 인생으로 나아가게 하는 최상격의 이름입니다.","다윤":"한자의 의미는‘대중의 리더가 된다는’뜻으로 그 의미는‘풍족과 만족’함이 내포되어 있음에서 건강과 수명, 재복을 두루 갖춘 대길명입니다.","예림":"‘가치 있는 삶으로의 행복’이라는 뜻으로 그 속뜻은 인연의 길함으로 삶의 안정을 꾀한다는 대길격의 수리로 발전 삶을 도모해 간다는 길명입니다.","효현":"한자의 의미는‘존경의 대상이 된다는’뜻으로 그 의미는‘화평한 인생’라는 의미가 내포되어 있습니다. 가정의 화목과 안정된 삶을 이어간다는 뜻이 담긴 길명입니다.","예원":"한자의 의미는‘세상의 리더가 된다는’뜻으로 그 의미는‘풍족과 만족’함이 내포되어 있음에서 건강과 수명, 재복을 두루 갖춘 대길명입니다.","보빈":"‘좋은 인연들의 만남’이라는 뜻으로 그 속뜻은 인연의 길함으로 삶의 안정을 꾀한다는 대길격의 수리로 발전 삶을 도모해 간다는 길명입니다.","지현":"한자의 의미는‘뜻하는 바를 들어낸다는’뜻으로 그 의미에‘꼭 필요한 존재’라는 의미가 내포되어 있습니다. 화목과 안락을 꾸민다는 깊은 뜻이 담긴 길명입니다.","자운":"‘자줏빛 인연들의 만남’이라는 뜻으로 속뜻은 인덕의 복덕이 쌓임에서 이르는 곳마다 안락을 얻는다는 것을 말합니다. 삶을 아름답게 꾸민다는 길명으로 인생여정의 족함을 기원하는 이름입니다.","진이":"참된 것으로 드러남을 말함에서 인기와 명성을 얻는다는 대길격의 수리이다. 향후 삶의 평탄을 기원하는 길명입니다.","생애":"살아있는 사랑에서, 사랑 받음이 식지 않음의 항상 함으로의 인기와 명성 얻음의 길명이다. 건강과 인기를 염원하는 대길격의 수리를 더한 삶을 이끄는 성취자로 나아가는 명호입니다.","고원":"뜻하는 바의 지향함을 얻을 수 있다는 성취와 성공의 대길명이 됩니다. 하는 일의 선두와 정상을 지향하게 하는 길명입니다.","재헌":"‘세상의 밝힘’이라는 뜻으로 속뜻은 인덕의 복덕이 쌓임에서 이르는 곳마다 존경과 명성을 얻는다는 것을 말합니다. 삶을 아름답게 꾸민다는 길명으로 인생여정의 족함을 기원하는 이름입니다.","수인":"한자의 의미는‘세상의 빛이라는’뜻으로 그 의미에‘꼭 필요한 존재’라는 의미가 내포되어 있습니다. 화목과 안락을 꾸민다는 깊은 뜻이 담긴 길명입니다.","유정":"‘화평을 이룬다’는 뜻으로 속뜻은 신뢰로 인해 세상의 신망을 받는다는 것을 말합니다. 가치 있는 인생으로 나아가길 바라는 대길격의 이름입니다.","아현":"언제 어디서나 ‘자신의 존재를 드러낸다는’뜻으로 그 의미에‘존재의 성취’라는 의미가 내포되어 있습니다. 만족에서의 평온한 삶으로 나아가길 바라는 뜻이 담긴 길명입니다.","예선":"순리를 따르는 삶으로 큰 고난 없음을 말하는 것으로 속뜻은 건강에 안락을 더하는 삶의 순탄을 이끌게 하다는 대길명이다. 하는 일 마다 곧고 바름으로 나아감에서 가정의 화목과 재물을 기원하는 이름입니다.","여민":"지혜롭게 인생을 꾸며 나가는다는 뜻으로 정신적 안정과 물질적 충족을 조화롭게 이끈다는 길명으로 보다 진취적 삶으로 나아가길 바란다는 나와 이웃에 이롭게 하는 대길성의 이름입니다.","준영":"뛰어난 재주에 영리함을 더한 길명으로 그 의미는‘존경과 신망이 내포된 것으로’밖으로 통솔과 안으로 평온을 이어준다는 대길격의 수리입니다.","휘성":"더 높은 명성을 드러낸다는 대길격의 수리로 의미에 담긴 속뜻은‘참 된 인격자로서의 평온한 삶’의 향유가 됩니다. 보다 진취적인 삶으로 이끈다는 대길명입니다.","채원":"한자의 의미는‘족함을 드러낸다는’뜻으로 그 의미에‘훤칠한 행복’이라는 의미가 내포되어 있습니다. 크게 행복하길 바라는 뜻을 담은 길명입니다.","보운":"세상에 이름을 새기는 길명으로 부귀와 장수는 물론 많은 무리들을 이끄는 대길격의 수리입니다. 행복을 지향하는 명호입니다.","수윤":"사회에 덕망을 얻는 다는 길명으로 장수와 안락한 생활을 영위하는 부모덕이 있는 명호로 집안을 부흥시키 대길격의 수리입니다.","인영":"모든 일들이 스스로 조복되어 참되게 나아간다는 길명으로, 행복과 장수를 부른다는 뜻으로 나와 가정에 화목과 평온을 더한다는 대길명의 이름입니다.","현영":"어려운 고비마다 행운을 부르는 길명으로, 가정의 안락과 만인의 존경을 받는다는 대길격의 수리로 풍족한 인생으로 나아가게 하는 최상격의 이름입니다.","예주":"많은 식솔을 거느린다는 길명으로 삶을 윤택하게 꾸민다는 대길격의 수리이다.","서하":"강물이 흐르듯 근심은 풀리고, 수명은 장수하는 대길격의 수리로 안녕과 복록이 열린다는 대길명이다","주현":"‘두루 한 밝음이라’는 뜻으로 어두운 기운을 몰아내고 점진적 밝음으로 나아간다는 대길격의 수리로 가정의 안녕과 행운을 부른다는 이름입니다.","우주":"삶의 여정에서 언제나 빛나는 윤택함을 취한다는 길명으로, 풍족한 재리에 가정의 화목을 꾀한다는 대길격의 수리이다.","명준":"조상의 덕과 스스로의 노력으로 성공 출세한다는 길명으로, 하는 일마다 성공하고 출세한다는 대길격의 수리이다.","서빈":"천우신조의 보살핌으로 난관을 극복해 나가는 길명으로 삶의 윤택과 안락을 꾀한다는 길격이다.","하연":"여름에 무성한 연꽃처럼 삶의 청정한 성취와 무병으로 인생을 아름답게 꾸며 나간다는 대길격의 수리이다.","제헌":"인생평탄의 길을 암시하는 뜻과 막힘없는 대길격의 수리로","서연":"원하는 바의 뜻을 이룬다는 길명으로 성공과 출세에 막힘이 없는 대길격의 수리이다.","치우":"인생의 흐름에서 인기와 덕망이 차오른다는 길명으로 삶을 보다 풍족하게 이끈다는 대길격의 수리이다.","선오":"조상의 음덕으로 윤택한 삶을 이어간다는 길명으로 복락과 장수를 누린다는 대길격의 수리이다.","조현":"아침의 밝은 햇살처럼 근심을 물리치는 길명으로 화목과 안락을 꾀한다는 대길격의 수리이다.","부승":"부족함 없는 삶의 여정을 살아가게 하는 대길명의 수리로 주변에 호응을 얻어 성취한다는 대길격의 수리이다.","수영":"건강과 행복이 장구히 깃들고, 부족함 없는 삶의 여정을 살아가게 하는 대길명의 수리이다.","두성":"사람들을 이끄는 리더로서 명성과 재복을 취한다는 대길격의 수리로 주변인들을 윤택하게 한다는 대길명이다.","도연":"삶에 두루 한 인연들이 모여 들여 인생을 풍족하게 꾸민다는 대길격의 수리로 복과 장수를 누리는 대길명이다.","보정":"인덕이 많아 뜻을 이루고 성취하는 윤택함을 이루는 대길격의 수리로, 가정 또한 안락함을 가꾼다는 선길명이다.","담희":"안팎으로 심신의 평온과 만족함으로 인생을 진락하는 대길격의 수리로, 안정과 발전을 꾀하는 대길명이다.","보경":"주변인들의 도움이 따르고, 하는 일마다 성취를 얻는다는 대길격의 수리로, 가정의 안락과 화목을 더하는 길명이다.","민서":"삶의 평탄을 이루는 길명으로, 안팎의 화락과 평온을 가져다준다는 대길격의 수리이다.","진희":"재물의 성취와 안정으로 삶의 풍족함이 따른다는 길명으로, 나날이 행복을 더한다는 대길격의 수리이다.","세정":"삶의 굴곡에서 평정과 안정을 꾀한다는 吉名으로, 무리의 중심에서 언제나 신망을 받고 부귀와 권세를 누린다는 대길격이다.","윤지":"지향한바 뜻을 이루고 나와 세상을 다스린다는 대길격의 수리로 나날이 덕과 복이 쌓인다는 大吉名이다.","두현":"머리가 총명하여 두루 밝지 않음이 없고, 많은 이들의 존경과 신망을 받아 마침내 뜻을 성취한다는 대길격의 수리명이다.","예석":"가정과 사회에 두루 한 밝음으로 행복한 일생을 꾸민다는 대길격의 수리로 재물과 장수를 뜻하는 길명이다.","후성":"사회에 신망을 얻고, 가정의 안락과 뜻을 이룬다는 대성취의 길명으로 많은 사람들의 존경을 받고 수명 또한 길어 장수다는 길수이다.","서영":"삶의 질액을 파하는 길명으로, 난관을 극복하여 마침내 뜻을 이룬다는 대길격의 수리이다.","해림":"재물은 쌓이고, 고충은 풀리는 대길명으로 가정의 화목을 꾀한다는 대길격의 수리이다.","영혜":"모든 경영하는 일에서 뜻을 이루고 지혜로 모든 난관을 극복하여 마침내 부귀와 영달을 이루는 대길성이다","지선":"어떤 경에도 지혜롭게 대처한다는 길명으로 부귀와 영달을 이룬다는 대길격의 수리이다.","수지":"모든 경영하는 일에서 뜻을 이루고 지혜로 모든 난관을 극복하여 마침내 부귀와 영달을 이루는 대길성이다","아연":"곧고 바름에서 뜻의 성취를 이룬다는 길격의 수리로, 삶을 풍족하게 꾸민다는 대길명이다.","예희":"뜻하는 일에서 성취를 이룬다는 대길격의 수리로, 안팎에 두루 행운을 부른다는 길명이다.","주미":"존경과 풍족함이 견고한 태산처럼 무너지지 않는다는 대길격의 수리이다.","채영":"세상사 일들이 옥빛처럼 투명한 맑음이 되라는 길수로 신심의 평안과 장수를 누리게 하는 대길명이다.","이수":"어려운 난제를 극복한다는 길수로 삶의 안락과 영달을 이루고 순탄의 생을 꾸민다는 대길명이다.","우진":"삶의 여정에서 많은 사람들의 도움으로 뜻을 이루고, 삶을 윤택하게 한다는 대길격의 수리로 가정의 화목을 이루는 吉名이다.","희진":"삶의 풍족함과 기쁨을 연다는 길수로, 안팎의 조화로 상하가 화합한다는 대길명의 수리이다.","지민":"행운과 기쁨이 깃들게 하는 길명으로, 화목과 안락을 꾀하는 대길격의 수리이다","영진":"하는 일마다 일의 성취를 이룬다는 길명으로 가정의 화목과 성취를 이루는 대길격의 수리이다.","승현":"뜻의 성취를 이룬다는 길명으로","연화":"뭇사람들을 이끌어 꽃피게 한다는 길명으로 안팎에 두루 한 행복과 행운이 깃든다는 대길명이다.","휘영":"모든 경영하는 일에서 뜻을 이루고 지혜로 모든 난관을 극복하여 마침내 부귀와 영달을 이루는 대길성이다","서언":"말로 많은 사람들을 교화하는 보응의 삶으로 존경과 신뢰를 받고, 삶을 윤택하게 꾸민다는 대길명이다.","소은":"스스로의 밝음의 맑음에서 주변까지 맑고 밝히니,","다민":"인연을 밝힌다는 길명으로 기쁨을 안긴다는 여의주의 대명호이다.","천예":"활기찬 튼실함으로 건강","후연":"만사의 길함에서 건강과 일상에 기쁨을 이어가는 대길호.","유나":"한자의 의미는‘자신의 재능발휘라는 ’뜻으로","윤아":"인생의 안팎에서 보다 나은 삶으로의 영위를 의미하는"},"strong":{"光":"부모형제 복이 없고, 배우자복이 박하다","九":"수의 종말을 고하는 수로서 대재가 무용격이요 조난을 당하기 쉽다","貴":"변덕이 심하고 재산손실이 따른다","龜":"단명할 수가 있다","極":"부모덕이 없고 빈천해지기 쉽다","吉":"천한 격이며 인품이 고결하지 못하다","男":"배우자 덕이 없고 가정불화가 잦다","乭":"천한 인상을 준다","童":"인품이 천하다","了":"사물의 종말격이다","龍":"태몽에 용이 오르는 형상을 본 경우 외에는 불길하며, 특히 진·해생(辰亥生)은 쓰지 않는다","六":"불용한자","馬":"빈천격이다","滿":"달이 차면 기운다는 뜻으로 선부후빈격이다","末":"사물의 종말격이다","梅":"예부터 꺼려 온 글자다","福":"천명에 복성이 왕하지 않으면 오히려 복을 깨뜨린다","分":"분리의 뜻이 있어 꺼린다","粉":"분리의 뜻이 있어 꺼린다","四":"단명, 조난 등의 흉운을 당하기 쉽다","星":"단명한 자가 많다","壽":"단명과 천함을 암시한다","順":"눈물격으로 부부지간 이별 수가 많다","玉":"일시적으로 대성할 수 있으나 오래가기 어렵다","蕓":"동기간에 우애가 없고 재물의 집산이 많다(아호·상호에는 길하다)","寅":"선천명에 寅이 필요한 경우 외에는 성격이 불순해지며 특히 신·유생(申酉生)에 불길하다","子":"오·미생(午未生)의 이름에 함부로 쓰지 않는다","天":"부모 덕이 없고 빈천해지기 쉽다","春":"일시적으로 대성할 수 있으나 허영심이 많아 실패한다","風":"재산손실이 크게 발생한다","豊":"재산이 일시에 사라진다","海":"인생행로에 파란이 많다","虎":"성격이 불손해지며 특히 신·유생(申酉生)에 불길하다","華":"부부운이 불길하다"},"weak":{"花":"예부터 천직에 많이 쓰던 글자라 꺼린다","冬":"종말의 뜻이 있어 꺼린다","命":"좋은 뜻이지만 반대로 작용한다고 하여 꺼린다","孝":"좋은 뜻이지만 반대로 작용한다고 하여 꺼린다","喜":"좋은 뜻이지만 반대로 작용한다고 하여 꺼린다","二":"흉한 수리를 상징하는 숫자다","十":"흉한 수리를 상징하는 숫자다","一":"숫자를 상징하는 글자다","狗":"짐승을 나타내는 글자다","地":"자연과 관계된 글자라 꺼린다","水":"자연과 관계된 글자라 꺼린다","火":"자연과 관계된 글자라 꺼린다","雲":"자연과 관계된 글자라 꺼린다","秋":"예부터 천직에 많이 쓰던 글자라 꺼린다","月":"예부터 천직에 많이 쓰던 글자라 꺼린다","死":"뜻이 흉하다","亡":"뜻이 흉하다","滅":"뜻이 흉하다","萬":"전통적으로 꺼리는 글자다","千":"숫자를 상징하는 글자다"},"eldest":["元","大","長"]};
  const H=JMD.hj,SURI=JMD.suri,IT=JMD.interp;
  const ST='甲乙丙丁戊己庚辛壬癸',BR='子丑寅卯辰巳午未申酉戌亥';
  const ELN=['목','화','토','금','수'],ELH=['木','火','土','金','水'];
  const sEl=g=>Math.floor(ST.indexOf(g)/2);const bEl=z=>[4,2,0,0,2,1,1,2,3,3,2,4][BR.indexOf(z)];
  const GR=['흉','반길','길'],GC=['g0','g1','g3'];
  const norm=n=>{while(n>81)n-=80;return n;};
  const suri=n=>{n=norm(n);const s=SURI[n-1];return {n,gy:s[0],un:s[1],hj:s[2],g:s[3],t:s[4]};};
  const four=(s,a,b)=>[['원격','초년운 (0~20세)',norm(a+b)],['형격','청년운 (20~40세)',norm(s+a)],['이격','중년운 (40~60세)',norm(s+b)],['정격','말년운·평생 총운',norm(s+a+b)]];
  // 발음오행 (소리 오행)
  const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const SND={'ㄱ':0,'ㄲ':0,'ㅋ':0,'ㄴ':1,'ㄷ':1,'ㄸ':1,'ㄹ':1,'ㅌ':1,'ㅇ':2,'ㅎ':2,'ㅅ':3,'ㅆ':3,'ㅈ':3,'ㅉ':3,'ㅊ':3,'ㅁ':4,'ㅂ':4,'ㅃ':4,'ㅍ':4};
  const sndOf=ch=>{const c=ch.charCodeAt(0)-0xAC00;if(c<0||c>11171)return -1;const v=SND[CHO[Math.floor(c/588)]];return v===undefined?-1:v;};
  // 이름 성별 (자료에서 쓰인 쓰임 기준, 나머지는 함께 써요)
  const MALE=new Set('규진 대훈 도헌 도환 도휘 도욱 도원 도윤 도엽 두영 두현 명준 명진 병수 병주 보승 보운 보진 부민 부승 선오 선재 승재 승현 예석 예훈 우재 우진 은호 재경 재웅 재헌 재혁 재홍 제헌 제훈 정수 조현 준서 준성 준영 진우 창수 창현 창훈 치우 태현 현수 후성 휘성 휘영 길경 영진 지승 유찬 고원'.split(' '));
  const FEMALE=new Set('규리 금미 나경 나윤 다민 다연 다윤 담희 도희 도연 민서 민영 민지 보경 보빈 보정 서빈 서연 서영 서하 서현 서화 세정 소연 소은 수영 수인 수지 승희 승지 신혜 아연 아현 여민 영혜 예린 예림 예선 예원 예주 예현 예희 원희 유나 유정 유현 윤아 윤지 은채 이수 이화 인해 인영 자현 정민 제희 조영 주미 주은 주현 지선 지연 지예 지윤 지현 진이 진주 진희 채원 채은 태연 하연 해림 해원 현서 현아 현영 현주 효연 효인 효현 후연 희연 희진 생애'.split(' '));
  const sexOf=k=>MALE.has(k)?'M':FEMALE.has(k)?'F':'U';
  const STRONG=JMD.strong,WEAK=JMD.weak,ELDEST=new Set(JMD.eldest);
  const P2=v=>String(v).padStart(2,'0');
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const SURS=JMD.sur;
  let jsex='M',jtab='rec',picked=[],lastList=[],showN=3,chkRes=null;
  const KEY='hongmyeongguk.jakmyeong';

  // ── 사주 오행 ──
  function elCount(r){const c=[0,0,0,0,0];r.pillars.forEach(p=>{c[sEl(p[0])]++;c[bEl(p[1])]++;});return c;}
  function weakEls(r){const c=elCount(r);const mn=Math.min(...c);return c.map((v,i)=>v===mn?i:-1).filter(i=>i>=0);}
  // ── 이름 평가 ──
  function evalName(sur,a,b,weak){
    const s=sur[2],ha=H[a],hb=H[b];if(!ha||!hb)return null;
    const f=four(s,ha[0],hb[0]).map(([n,d,v])=>({n,d,v,s:suri(v)}));
    const k=ha[2]+hb[2];
    const warn=[];[a,b].forEach(c=>{if(STRONG[c])warn.push([c,STRONG[c],2]);else if(WEAK[c])warn.push([c,WEAK[c],1]);if(ELDEST.has(c))warn.push([c,'장남·장녀에게는 써도 되지만 둘째부터는 쓰지 않는 글자예요',1]);});
    const odd=[s,ha[0],hb[0]].map(v=>v%2);const yy=!(odd[0]===odd[1]&&odd[1]===odd[2]);
    const snd=[sndOf(k[0]),sndOf(k[1])];const comp=(weak||[]).filter(e=>snd.includes(e));
    const score=f.reduce((t,x)=>t+x.s.g,0);
    return {sur,a,b,k,ha,hb,f,warn,yy,comp,score,bad:f.some(x=>x.s.g===0)||warn.some(w=>w[2]===2),it:IT[k]||''};
  }
  function candidates(sur,sex,weak){
    const byRead={};JMD.names.forEach(([a,b,k,src])=>{(byRead[k]=byRead[k]||[]).push([a,b,src]);});
    const HB={};for(const c in H)(HB[H[c][2]]=HB[H[c][2]]||[]).push(c);
    const docSur=new Set(JMD.bysur[sur[1]]||[]);
    const out=[];
    for(const k in byRead){
      if(k[0]===sur[0])continue;
      const sx=sexOf(k);if((sex==='M'&&sx==='F')||(sex==='F'&&sx==='M'))continue;
      const m=new Map();byRead[k].forEach(([a,b,src])=>m.set(a+b,src));
      (HB[k[0]]||[]).forEach(a=>(HB[k[1]]||[]).forEach(b=>{if(!m.has(a+b))m.set(a+b,'x');}));
      let best=null;const alts=[];
      m.forEach((src,ab)=>{const a=ab[0],b=ab[1];if(a===b)return;const e=evalName(sur,a,b,weak);if(!e||e.bad)return;
        e.src=src;e.docSur=docSur.has(ab);
        e.sc=e.score*2+(src==='x'?0:3)+(e.docSur?4:0)+(e.yy?1:0)+(e.comp.length?1:0)+(e.it?1:0)-e.warn.length*2;
        alts.push(e);if(!best||e.sc>best.sc)best=e;});
      if(best){best.alts=alts.sort((x,y)=>y.sc-x.sc);out.push(best);}
    }
    return out.sort((x,y)=>y.sc-x.sc||x.k.localeCompare(y.k));
  }
  // ── 풀이 글 ──
  function nameText(e){
    if(e.it)return e.it;
    const tot=e.f[3].s,good=e.f.every(x=>x.s.g>0);
    const jo=w=>{const c=w.charCodeAt(w.length-1)-0xAC00;return c>=0&&c%28?'과':'와';};
    return e.ha[1]+' '+e.ha[2]+'('+e.a+')'+jo(e.ha[2])+' '+e.hb[1]+' '+e.hb[2]+'('+e.b+')의 뜻을 담은 이름이에요. 평생 총운은 '+tot.gy+'·'+tot.un+'으로, '+firstSent(tot.t)+(good?' 원형이정 네 격이 모두 흉한 수리 없이 짜인 길명이에요.':'');
  }
  function firstSent(t){const m=/^(.+?[다요]\.)/.exec(t||'');return m?m[1]:t;}
  function myeongguk(names){
    try{
      const x=Haeseok.interpret(base,base.input.sex,1);
      const PS={1:'감',2:'곤',3:'진',4:'손',5:'중',6:'건',7:'태',8:'간',9:'이'};
      const YK={官:'관',鬼:'귀',財:'재',父:'인',兄:'형',孫:'손'};
      const yp=(x.where&&x.where[x.yong]&&x.where[x.yong][0])||base.sePal;
      const PUR={官:'명예와 신심',鬼:'명예와 신심',財:'재물과 신심',父:'신심',兄:'신심',孫:'재물과 신심'};
      const lbl=(PS[yp]||'')+(YK[x.yong]||'')+'용';
      const st=x.strong==='weak'?'사주의 기운이 약한 가운데 '+(PS[yp]||'')+(YK[x.yong]||'')+'을 용함으로써 ':x.strong==='strong'?'사주의 기운이 왕성한 가운데 '+(PS[yp]||'')+(YK[x.yong]||'')+'을 용함으로써 ':'사주의 기운이 중화를 이룬 가운데 '+(PS[yp]||'')+(YK[x.yong]||'')+'을 용함으로써 ';
      const cs=[...new Set((names||[]).flatMap(e=>e.comp||[]))];const w=cs.map(i=>ELN[i]).join('·');
      return {lbl,text:'귀하의 명국은 '+lbl+' 사주입니다. '+st+(PUR[x.yong]||'신심')+'의 안정을 꾀하는 명국이 되고, '+(w?'사주에 부족한 '+w+' 기운을 이름 소리로 보하여 ':'')+'가정과 사회의 부조화를 해소하고 삶을 진취적으로 이끌 수 있도록 조화를 이루는 음양오행의 작명법을 따라 지어진 대길격의 수리로, 향후 운세의 흐름을 순조롭게 다져 나아가게 하는 매우 좋은 이름입니다.'};
    }catch(err){return {lbl:'',text:'음양오행의 조화를 이루는 작명법을 따라 지어진 대길격의 수리로, 향후 운세의 흐름을 순조롭게 다져 나아가게 하는 매우 좋은 이름입니다.'};}
  }

  // ── 입력칸 ──
  const sel=$('jmSur');
  sel.innerHTML=SURS.map((s,i)=>'<option value="'+i+'">'+s[0]+' '+s[1]+' ('+s[2]+'획)</option>').join('');
  function loadPref(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
  function savePref(){try{localStorage.setItem(KEY,JSON.stringify({sur:+sel.value,sex:jsex}));}catch(e){}}
  function setSex(v){jsex=v;[...$('jmSex').children].forEach(x=>x.classList.toggle('on',x.dataset.v===v));}
  function guessSur(){const p=loadPref();if(p&&SURS[p.sur]){sel.value=String(p.sur);setSex(p.sex||'M');return;}
    const nm=(base&&base.input.name||'').trim();const i=nm?SURS.findIndex(s=>s[0]===nm[0]):-1;sel.value=String(i>=0?i:0);setSex(base&&base.input.sex==='F'?'F':'M');}
  const segOn=(id,fn)=>$(id).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;[...$(id).children].forEach(x=>x.classList.toggle('on',x===b));fn(b.dataset.v);});
  segOn('jmSex',v=>{jsex=v;savePref();if(jtab==='rec'&&lastList.length)run();});
  segOn('jmTab',v=>{jtab=v;$('jmChkBox').style.display=v==='chk'?'block':'none';$('jmGo').textContent=v==='chk'?'🔍 이 이름 풀어 보기':'🌟 좋은 이름 찾기';$('jmSexRow').style.display=v==='chk'?'none':'';chkRes=null;if(mode==='jm')show();});
  sel.addEventListener('change',()=>{savePref();picked=[];if(mode==='jm'&&(lastList.length||chkRes))run();});
  // 이름 풀이: 글자마다 한자 고르기
  function drawPick(){
    const v=$('jmName').value.replace(/[^가-힣]/g,'').slice(0,2);const box=$('jmPick');
    if(v.length<2){box.innerHTML=v?'<p class="note">이름 두 글자를 넣어 주세요.</p>':'';return;}
    box.innerHTML=[...v].map((ch,i)=>{const opts=Object.keys(H).filter(c=>H[c][2]===ch).sort((x,y)=>H[x][0]-H[y][0]);
      return '<div class="jmPk"><span class="jmCh">'+ch+'</span><select data-i="'+i+'">'+opts.map(c=>'<option value="'+c+'">'+c+' · '+esc(H[c][1])+' '+ch+' ('+H[c][0]+'획)'+(STRONG[c]||WEAK[c]?' ⚠️':'')+'</option>').join('')+'<option value="">✏️ 직접 입력</option></select>'+
      '<div class="jmMan" style="display:'+(opts.length?'none':'flex')+'"><input maxlength="1" placeholder="한자" aria-label="'+ch+' 한자"><input type="number" min="1" max="40" placeholder="획수" aria-label="'+ch+' 획수"></div></div>';}).join('');
    box.querySelectorAll('select').forEach(s=>{if(!s.options.length||s.value==='')s.nextElementSibling.style.display='flex';s.addEventListener('change',()=>{s.nextElementSibling.style.display=s.value?'none':'flex';});});
  }
  $('jmName').addEventListener('input',drawPick);
  function readPick(){
    const box=$('jmPick');const v=$('jmName').value.replace(/[^가-힣]/g,'').slice(0,2);
    if(v.length<2)throw new Error('풀어 볼 이름 두 글자를 넣어 주세요. (성은 위에서 골라요)');
    return [...box.querySelectorAll('.jmPk')].map((d,i)=>{const s=d.querySelector('select');
      if(s.value)return s.value;
      const [c,n]=d.querySelectorAll('.jmMan input');const ch=(c.value||'').trim(),st=+n.value;
      if(!ch||!(st>0))throw new Error((i+1)+'번째 글자 "'+v[i]+'"의 한자와 획수를 넣어 주세요. 획수는 부수를 원래 모양으로 세는 원획법이에요.');
      if(!H[ch])H[ch]=[st,'',v[i]];else if(H[ch][2]!==v[i])H[ch]=[st,H[ch][1],v[i]];
      return ch;});
  }
  function run(){
    const e=$('jmErr');e.style.display='none';
    try{
      if(!base)throw new Error('먼저 위에서 생년월일을 넣고 명국을 열어 주세요.');
      const sur=SURS[+sel.value];
      if(jtab==='chk'){const [a,b]=readPick();chkRes=evalName(sur,a,b,weakEls(base));}
      else{lastList=candidates(sur,jsex,weakEls(base)).slice(0,3);showN=3;picked=[];}
      show();$('reading').scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){e.textContent=err.message;e.style.display='block';}
  }
  $('jmGo').addEventListener('click',run);
  $('mode').addEventListener('click',()=>setTimeout(()=>{$('jmWrap').style.display=mode==='jm'?'block':'none';
    if(mode==='jm'&&!$('jmWrap').dataset.init){guessSur();$('jmWrap').dataset.init='1';}},0));

  // ── 결과 그리기 ──
  const pill=s=>'<i class="jmG '+GC[s.g]+'">'+GR[s.g]+'</i>';
  function gyLine(e){return '<div class="jmGy">'+e.f.map(x=>'<span><b>'+x.n+'</b> '+x.v+pill(x.s)+'</span>').join('')+'</div>';}
  function badges(e){const b=[];if(e.docSur)b.push('📜 작명 자료에서 이 성씨에 쓴 이름');else if(e.src&&e.src!=='x')b.push('📜 작명 자료 추천 이름');
    if(e.comp.length)b.push('🌿 사주 보완 ('+e.comp.map(i=>ELN[i]).join('·')+')');if(e.yy)b.push('☯️ 음양 조화');
    return b.length?'<div class="jmBd">'+b.map(x=>'<span>'+x+'</span>').join('')+'</div>':'';}
  function detail(e){return e.f.map(x=>'<h4>'+x.n+' '+x.v+'수 · '+x.s.gy+', '+x.s.un+' <small>'+x.s.hj+'</small> '+pill(x.s)+'</h4><p class="jmD">'+x.d+'</p><p>'+esc(x.s.t)+'</p>').join('');}
  function card(e,i,withPick){
    const key=e.a+e.b,on=picked.some(p=>p.a+p.b===key);
    return '<div class="jmItem'+(on?' on':'')+'" data-i="'+i+'">'+
      '<div class="jmTop"><div class="jmNm"><b>'+e.sur[0]+' '+e.k[0]+' '+e.k[1]+'</b><span>'+e.sur[1]+' '+e.a+' '+e.b+'</span></div>'+
      (withPick?'<button type="button" class="jmPkBtn'+(on?' on':'')+'" data-k="'+key+'">'+(on?'✅ 증서에 넣음':'📜 증서에 넣기')+'</button>':'')+'</div>'+
      '<p class="jmHun">'+esc(e.ha[1])+' '+e.ha[2]+' <small>'+e.ha[0]+'획</small> · '+esc(e.hb[1])+' '+e.hb[2]+' <small>'+e.hb[0]+'획</small></p>'+
      gyLine(e)+badges(e)+'<p class="jmTx">'+esc(nameText(e))+'</p>'+
      (e.warn.length?'<p class="jmWarn">'+e.warn.map(w=>'⚠️ '+w[0]+': '+esc(w[1])).join('<br>')+'</p>':'')+
      (e.alts&&e.alts.length>1?'<p class="jmAlt">같은 소리 다른 한자: '+e.alts.slice(1,5).map(x=>'<button type="button" class="jmAltB" data-i="'+i+'" data-ab="'+x.a+x.b+'">'+x.a+x.b+'</button>').join(' ')+'</p>':'')+
      '<details><summary>수리 풀이 자세히 보기</summary>'+detail(e)+'</details></div>';
  }
  function elLine(){const c=elCount(base);const w=weakEls(base);
    return '<div class="jmEl">'+c.map((v,i)=>'<span class="'+(w.includes(i)?'lo':'')+'">'+ELH[i]+' '+ELN[i]+' <b>'+v+'</b></span>').join('')+'</div><p class="note">사주 여덟 글자의 오행이에요. 부족한 <b>'+w.map(i=>ELN[i]).join('·')+'</b> 기운을 이름 소리(발음오행)로 보하면 <b>🌿 사주 보완</b> 표시가 붙어요.</p>';}
  function certBar(){return '<div class="jmCert"><button type="button" id="jmMake">📜 작명증서 출력</button><p class="note">위 이름 3개가 도깨비작명연구소 작명증서 1장과 해석 1장에 자동으로 들어가 PDF 파일로 나와요.</p></div>';}
  window.renderJm=function(){
    ['typecard','fourcard','mapCard'].forEach(id=>{const el=$(id);if(el)el.style.display='none';});
    const R=$('reading');const sur=SURS[+sel.value];
    let h='<h2>✍️ 도깨비작명연구소</h2>';
    if(jtab==='chk'){
      if(!chkRes){R.innerHTML=h+'<p>위에서 <b>성</b>을 고르고 <b>이름 두 글자</b>와 한자를 넣은 다음 <b>이 이름 풀어 보기</b>를 눌러 주세요.</p>'+elLine();return;}
      const e=chkRes;const nG=e.f.filter(x=>x.s.g===2).length,nB=e.f.filter(x=>x.s.g===0).length;
      const v=nB===0&&!e.warn.some(w=>w[2]===2)?(nG>=3?['🌟','대길한 이름이에요','원형이정 네 격이 모두 좋은 수리로 짜여 있어요.']:['👍','좋은 이름이에요','흉한 수리 없이 무난하게 짜여 있어요.']):nB>=2?['🌱','보완이 필요해요','흉한 수리가 '+nB+'곳 있어요. 개명을 생각한다면 아래 추천 이름도 살펴보세요.']:['🤔','아쉬운 점이 있어요','흉한 수리나 꺼리는 글자가 있어요. 어느 시기 운인지 아래 풀이를 확인해 보세요.'];
      h+='<div class="jmVerdict"><span>'+v[0]+'</span><div><b>'+v[1]+'</b><p>'+v[2]+'</p></div></div>';
      h+=card(e,0,false)+elLine();
      h+='<p class="note">'+(e.yy?'☯️ 획수의 음양(홀수·짝수)이 고루 섞여 조화로워요.':'☯️ 성과 이름 획수가 모두 '+(e.f[0].v%2?'홀수':'짝수')+'라 음양이 한쪽으로 치우쳐 있어요.')+'</p>';
      h+='<div class="jmCert"><button type="button" id="jmMakeOne">📜 작명증서 출력</button></div>';
      R.innerHTML=h;
      $('jmMakeOne').addEventListener('click',()=>makeCert([e]));
      return;
    }
    if(!lastList.length){R.innerHTML=h+'<p>위에서 <b>성씨</b>와 <b>아들·딸</b>을 고르고 <b>좋은 이름 찾기</b>를 눌러 주세요. 명국에 넣은 생년월일시로 사주 오행까지 함께 봐 드려요.</p>'+elLine();return;}
    h+='<p class="jmSub"><b>'+sur[0]+'('+sur[1]+', '+sur[2]+'획)</b> 씨 '+(jsex==='M'?'아들':'딸')+' 이름 · 원형이정 네 격에 흉한 수리가 없는 이름 중 <b>가장 좋은 3개</b>를 골랐어요. 다시 누르면 같은 결과가 나오고, 한자는 <b>같은 소리 다른 한자</b>에서 바꿀 수 있어요.</p>'+elLine();
    h+=lastList.slice(0,showN).map((e,i)=>card(e,i,false)).join('');
    h+=certBar()+'<p class="note">수리 풀이는 81수리 길흉, 이름 자료와 획수는 도깨비작명연구소 작명 자료(원획법)를 따랐어요. 이름은 평생 쓰는 것이니 가족과 충분히 상의해 정해 주세요.</p>';
    R.innerHTML=h;
    R.querySelectorAll('.jmPkBtn').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.k;const i=picked.findIndex(p=>p.a+p.b===k);
      if(i>=0)picked.splice(i,1);else{if(picked.length>=3){alert('증서에는 이름을 3개까지 넣을 수 있어요.');return;}const e=lastList.find(x=>x.a+x.b===k);if(e)picked.push(e);}
      const y=window.scrollY;renderJm();window.scrollTo(0,y);}));
    R.querySelectorAll('.jmAltB').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i;const cur=lastList[i];const alt=cur.alts.find(x=>x.a+x.b===b.dataset.ab);if(!alt)return;
      alt.alts=cur.alts;lastList[i]=alt;const p=picked.findIndex(x=>x.a+x.b===cur.a+cur.b);if(p>=0)picked[p]=alt;const y=window.scrollY;renderJm();window.scrollTo(0,y);}));
    R.querySelectorAll('#jmMake').forEach(b=>b.addEventListener('click',()=>makeCert(lastList.slice(0,3))));
  };
  const _showJ=show;show=function(){const r=_showJ.apply(this,arguments);if(mode!=='jm'){const m=$('mapCard');if(m)m.style.display='';}return r;};

  // ── 작명증서 그리기 (A4, 200dpi) ──
  const W=1654,PH=2339,RED='#a3171d',INK='#2a1d14',GOLD='#b08a3e';
  const SERIF='"Noto Serif KR","Noto Serif CJK KR","Nanum Myeongjo","NanumMyeongjo","Batang","AppleMyungjo",serif';
  const f=(px,w)=>(w||'')+' '+px+'px '+SERIF;
  function page(){const c=document.createElement('canvas');c.width=W;c.height=PH;const x=c.getContext('2d');
    x.fillStyle='#fffdf6';x.fillRect(0,0,W,PH);
    x.strokeStyle=RED;x.lineWidth=10;x.strokeRect(60,60,W-120,PH-120);
    x.lineWidth=3;x.strokeRect(84,84,W-168,PH-168);
    x.strokeStyle=GOLD;x.lineWidth=2;x.strokeRect(98,98,W-196,PH-196);
    // 모서리 무늬
    x.strokeStyle=RED;x.lineWidth=4;
    [[98,98,1,1],[W-98,98,-1,1],[98,PH-98,1,-1],[W-98,PH-98,-1,-1]].forEach(([px,py,sx,sy])=>{
      x.beginPath();x.moveTo(px+sx*18,py+sy*70);x.lineTo(px+sx*18,py+sy*18);x.lineTo(px+sx*70,py+sy*18);x.stroke();
      x.beginPath();x.moveTo(px+sx*34,py+sy*52);x.lineTo(px+sx*34,py+sy*34);x.lineTo(px+sx*52,py+sy*34);x.stroke();});
    x.textBaseline='alphabetic';x.fillStyle=INK;return [c,x];}
  function ctext(x,t,cx,y,font,color,sp){x.font=font;x.fillStyle=color||INK;
    if(!sp){x.textAlign='center';x.fillText(t,cx,y);return;}
    const ch=[...t];const ws=ch.map(c=>x.measureText(c).width);const tot=ws.reduce((a,b)=>a+b,0)+sp*(ch.length-1);let px=cx-tot/2;x.textAlign='left';
    ch.forEach((c,i)=>{x.fillText(c,px,y);px+=ws[i]+sp;});x.textAlign='center';}
  function wrap(x,t,X,y,maxW,lh,font,color){x.font=font;x.fillStyle=color||INK;x.textAlign='left';
    const words=t.split(/\s+/);let line='';const lines=[];
    words.forEach(w=>{const tryL=line?line+' '+w:w;if(x.measureText(tryL).width<=maxW){line=tryL;return;}
      if(line)lines.push(line);line='';
      if(x.measureText(w).width>maxW){let part='';[...w].forEach(c=>{if(x.measureText(part+c).width>maxW){lines.push(part);part=c;}else part+=c;});line=part;}else line=w;});
    if(line)lines.push(line);lines.forEach((l,i)=>x.fillText(l,X,y+i*lh));x.textAlign='center';return y+lines.length*lh;}
  function seal(x,cx,cy,sz){
    x.save();x.globalAlpha=.88;x.strokeStyle=RED;x.fillStyle=RED;x.lineWidth=sz*.06;
    const r=sz*.08,h=sz/2;x.beginPath();x.moveTo(cx-h+r,cy-h);x.arcTo(cx+h,cy-h,cx+h,cy+h,r);x.arcTo(cx+h,cy+h,cx-h,cy+h,r);x.arcTo(cx-h,cy+h,cx-h,cy-h,r);x.arcTo(cx-h,cy-h,cx+h,cy-h,r);x.closePath();x.stroke();
    const cols=['도깨비','작명연','구소인'];const cw=sz*.82/3;x.font=f(Math.round(cw*.86),'900');x.textAlign='center';x.textBaseline='middle';
    cols.forEach((col,ci)=>{const colX=cx+sz*.41-cw*(ci+.5);[...col].forEach((c,ri)=>x.fillText(c,colX,cy-sz*.41+cw*(ri+.5)));});
    x.restore();x.textBaseline='alphabetic';}
  function footer(x){
    ctext(x,'도깨비작명연구소',W/2,PH-250,f(60,'700'),INK,14);
    ctext(x,'도깨비 사주',W/2,PH-190,f(30),'#6b5a4a',10);
    seal(x,W/2+430,PH-240,170);}
  function cell(x,X,Y,w,h){x.strokeRect(X,Y,w,h);}
  function drawCert(names){
    const [c,x]=page();const I=base.input,r=base,now=new Date();
    ctext(x,'作名證書',W/2,330,f(118,'900'),INK,46);
    x.strokeStyle=GOLD;x.lineWidth=2;x.beginPath();x.moveTo(W/2-330,375);x.lineTo(W/2+330,375);x.stroke();
    ctext(x,'下記 성명은 도깨비작명연구소 작명법에 따라 작명하였음을 증명합니다.',W/2,470,f(38));
    ctext(x,now.getFullYear()+'년 '+(now.getMonth()+1)+'월 '+now.getDate()+'일',W/2,540,f(36));
    const zhi=r.pillars[3][1];
    ctext(x,'【 생년월일시  陽 ('+(I.sex==='M'?'男':'女')+')  '+I.y+'年 '+I.m+'月 '+I.d+'日 '+zhi+'時 】',W/2,630,f(38,'700'));
    const lun=r.lunarYmd;ctext(x,'(음력 '+lun[0]+'년 '+(lun[1]<0?'윤'+(-lun[1]):lun[1])+'월 '+lun[2]+'일)',W/2,680,f(28),'#6b5a4a');
    // 사주표
    ctext(x,'四  柱',W/2,780,f(46,'700'),RED,8);
    const tx=W/2-520,ty=810,cw=208,lw=208;x.strokeStyle=INK;x.lineWidth=2.5;
    const heads=['時柱','日柱','月柱','年柱'];
    cell(x,tx,ty,lw,60+150*2);ctext(x,I.sex==='M'?'乾':'坤',tx+lw/2,ty+250,f(96,'900'),RED);ctext(x,I.sex==='M'?'(男命)':'(女命)',tx+lw/2,ty+310,f(26),'#6b5a4a');
    heads.forEach((hd,i)=>{const X=tx+lw+i*cw;cell(x,X,ty,cw,60);ctext(x,hd,X+cw/2,ty+43,f(30,'700'));
      const p=r.pillars[3-i];cell(x,X,ty+60,cw,150);cell(x,X,ty+210,cw,150);
      ctext(x,p[0],X+cw/2,ty+60+108,f(92,'900'));ctext(x,p[1],X+cw/2,ty+210+108,f(92,'900'));});
    // 이름표
    const n=names.length;ctext(x,'作  名',W/2,1290,f(46,'700'),RED,8);
    const nw=Math.min(380,1040/n),nx=W/2-nw*n/2,ny=1320,rh=170;
    names.forEach((e,i)=>{const X=nx+i*nw;
      [[e.sur[1],e.sur[2],'',e.sur[0]],[e.a,e.ha[0],e.ha[1],e.ha[2]],[e.b,e.hb[0],e.hb[1],e.hb[2]]].forEach((ch,k)=>{const Y=ny+k*rh;cell(x,X,Y,nw,rh);
        ctext(x,ch[0],X+nw/2-20,Y+112,f(96,'900'));x.font=f(30,'700');x.fillStyle=RED;x.textAlign='left';x.fillText(String(ch[1]),X+nw/2+42,Y+58);x.textAlign='center';
        ctext(x,(ch[2]?ch[2]+' ':'')+ch[3],X+nw/2,Y+152,f(30),'#4a3b2e');});
      const Y=ny+3*rh;cell(x,X,Y,nw,120);
      ctext(x,'총 '+e.f[3].v+'획',X+nw/2,Y+52,f(38,'700'));
      ctext(x,'원'+e.f[0].v+' 형'+e.f[1].v+' 이'+e.f[2].v+' 정'+e.f[3].v,X+nw/2,Y+98,f(25),'#6b5a4a');});
    footer(x);return c;
  }
  function drawRead(names){
    const [c,x]=page();const mg=myeongguk(names);
    ctext(x,'해  석',W/2,300,f(104,'900'),INK,40);
    x.strokeStyle=GOLD;x.lineWidth=2;x.beginPath();x.moveTo(W/2-260,345);x.lineTo(W/2+260,345);x.stroke();
    let y=wrap(x,mg.text,190,450,W-380,62,f(36))+40;
    const gap=names.length>2?40:70;
    names.forEach(e=>{
      y+=gap;ctext(x,e.sur[0]+e.k,W/2,y+40,f(64,'900'),INK,46);
      ctext(x,e.sur[1]+' '+e.a+' '+e.b,W/2,y+92,f(30),'#6b5a4a',14);
      y=wrap(x,nameText(e),210,y+160,W-420,56,f(34))+6;
      y=wrap(x,e.f.map(t=>t.n+' '+t.v+' '+t.s.gy+'('+GR[t.s.g]+')').join(' · '),210,y+10,W-420,44,f(26),'#7a2a20');});
    footer(x);return c;
  }
  // ── PDF (JPEG 2장) ──
  function b64ToBytes(b){const s=atob(b);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u;}
  function bytesToB64(u){let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}
  function makePdf(canvases){
    const enc=new TextEncoder();const parts=[];let len=0;const off=[];
    const push=d=>{const u=typeof d==='string'?enc.encode(d):d;parts.push(u);len+=u.length;};
    const obj=(id,body)=>{off[id]=len;push(id+' 0 obj\n');body.forEach(push);push('\nendobj\n');};
    push('%PDF-1.4\n');push(new Uint8Array([37,226,227,207,211,10]));
    const n=canvases.length,PW=595.28,PHt=841.89;
    const kids=canvases.map((_,i)=>(3+i*3)+' 0 R').join(' ');
    obj(1,['<< /Type /Catalog /Pages 2 0 R >>']);
    obj(2,['<< /Type /Pages /Kids ['+kids+'] /Count '+n+' >>']);
    canvases.forEach((cv,i)=>{const pid=3+i*3,cid=pid+1,iid=pid+2;
      const jpg=b64ToBytes(cv.toDataURL('image/jpeg',.9).split(',')[1]);
      obj(pid,['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW+' '+PHt+'] /Resources << /XObject << /Im'+i+' '+iid+' 0 R >> >> /Contents '+cid+' 0 R >>']);
      const cs='q '+PW+' 0 0 '+PHt+' 0 0 cm /Im'+i+' Do Q';
      obj(cid,['<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream']);
      obj(iid,['<< /Type /XObject /Subtype /Image /Width '+cv.width+' /Height '+cv.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n',jpg,'\nendstream']);});
    const total=3+n*3;const xref=len;
    let xr='xref\n0 '+total+'\n0000000000 65535 f \n';for(let i=1;i<total;i++)xr+=String(off[i]).padStart(10,'0')+' 00000 n \n';
    push(xr+'trailer\n<< /Size '+total+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');
    const out=new Uint8Array(len);let p=0;parts.forEach(u=>{out.set(u,p);p+=u.length;});return out;
  }
  async function saveFile(bytes,name){
    const C=window.Capacitor;
    if(C&&C.isNativePlatform&&C.isNativePlatform()){
      const FS=(C.Plugins&&C.Plugins.Filesystem)||C.registerPlugin('Filesystem');const SH=(C.Plugins&&C.Plugins.Share)||C.registerPlugin('Share');
      const w=await FS.writeFile({path:name,data:bytesToB64(bytes),directory:'CACHE'});
      await SH.share({title:name,text:'도깨비작명연구소 작명증서',files:[w.uri],dialogTitle:'작명증서 저장·보내기'});
      return 'share';
    }
    const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    return 'download';
  }
  let lastPdf=null;
  async function makeCert(names){
    if(!names.length)return;
    const ov=$('jmOv');ov.classList.add('open');$('jmOvBody').innerHTML='<p style="text-align:center;padding:40px 0">📜 증서를 만들고 있어요…</p>';
    await new Promise(r=>setTimeout(r,30));
    try{
      if(document.fonts&&document.fonts.ready)await document.fonts.ready;
      const p1=drawCert(names),p2=drawRead(names);
      const nm=(names[0].sur[0]+names[0].k);
      lastPdf={bytes:makePdf([p1,p2]),name:'도깨비작명증서_'+nm+(names.length>1?'_외'+(names.length-1):'')+'.pdf'};
      $('jmOvBody').innerHTML='<p class="jmOvT">📜 작명증서 · 해석 미리보기</p><img src="'+p1.toDataURL('image/jpeg',.8)+'" alt="작명증서"><img src="'+p2.toDataURL('image/jpeg',.8)+'" alt="해석">';
    }catch(err){console.error(err);$('jmOvBody').innerHTML='<p class="err" style="display:block">증서를 만들지 못했어요: '+esc(err.message)+'</p>';}
  }
  $('jmOvSave').addEventListener('click',async()=>{if(!lastPdf)return;const b=$('jmOvSave');b.disabled=true;
    try{const how=await saveFile(lastPdf.bytes,lastPdf.name);$('jmOvMsg').textContent=how==='share'?'저장하거나 보낼 곳을 골라 주세요. (내 파일·드라이브·카카오톡 등)':'PDF 파일을 내려받았어요.';}
    catch(err){if(!/cancel/i.test(err&&err.message||''))$('jmOvMsg').textContent='저장하지 못했어요: '+(err&&err.message||err);}
    finally{b.disabled=false;}});
  const closeOv=()=>{$('jmOv').classList.remove('open');$('jmOvMsg').textContent='';};
  $('jmOvX').addEventListener('click',closeOv);$('jmOvBg').addEventListener('click',closeOv);
  window.__jm={candidates,evalName,makePdf,drawCert,drawRead,SURS,weakEls};
})();
// ── 꿈해몽 ──
(function(){
  const D=[
    {e:'🐷',n:'돼지 꿈',g:2,kw:['돼지','멧돼지','새끼돼지'],t:'돼지는 예부터 재물과 복을 뜻해요. 돼지가 집으로 들어오거나 품에 안기면 뜻밖의 돈이 들어오거나 일이 잘 풀리는 대표적인 길몽이에요. 새끼를 많이 낳는 돼지는 재물이 불어나는 꿈이에요.',v:'돼지가 집 밖으로 나가거나 놓치면 들어올 재물이 새어 나갈 수 있으니 지출을 조심하세요.',tip:'이런 꿈을 꾼 날은 미뤄 둔 계약이나 거래를 진행해 보기 좋아요.'},
    {e:'🐉',n:'용 꿈',g:2,kw:['용','이무기','승천'],t:'용은 가장 큰 길몽 중 하나로 출세, 승진, 큰 성공을 뜻해요. 용이 하늘로 오르는 꿈은 오래 준비한 일이 크게 이루어지는 꿈이고, 태몽으로는 크게 될 아이를 뜻해요.',v:'용이 땅에 떨어지거나 다치면 기대했던 일이 늦어질 수 있어요. 서두르지 말고 때를 기다리세요.',tip:'시험, 승진, 면접을 앞두고 꾸면 좋은 소식을 기대해도 돼요.'},
    {e:'🐍',n:'뱀 꿈',g:2,kw:['뱀','구렁이','독사'],t:'뱀, 특히 큰 구렁이는 재물과 태몽을 뜻하는 길몽이에요. 뱀이 몸을 감거나 집으로 들어오면 재물이나 좋은 인연이 찾아와요. 태몽으로는 지혜롭고 재주 많은 아이를 뜻해요.',v:'뱀에게 물려 아프기만 하거나 뱀을 피해 도망치면 주변 사람과의 갈등, 구설을 조심하세요.',tip:'새로 들어오는 제안을 너무 빨리 거절하지 말고 한 번 더 살펴보세요.'},
    {e:'💩',n:'똥 꿈',g:2,kw:['똥','대변','변기','배설'],t:'더러워 보이지만 똥은 대표적인 재물 꿈이에요. 똥을 밟거나 몸에 묻거나 많이 쌓여 있으면 돈이 들어오는 꿈이에요. 양이 많을수록 재물도 크다고 봐요.',v:'똥을 깨끗이 씻어 내거나 화장실을 찾지 못해 헤매면 재물이 잠시 머물다 나갈 수 있어요.',tip:'복권보다는 일한 만큼 들어오는 돈, 받을 돈이 들어올 때가 많아요.'},
    {e:'🔥',n:'불 꿈',g:2,kw:['불','화재','불길','불타'],t:'불이 활활 타오르는 꿈은 사업 번창과 운이 크게 일어나는 길몽이에요. 내 집이 타는데 다치지 않았다면 집안이 일어나고 재물이 늘어나요.',v:'불이 꺼지거나 연기만 자욱하면 일이 지지부진해지거나 오해가 생길 수 있어요.',tip:'새로운 일을 시작하거나 홍보를 하기에 좋은 기운이에요.'},
    {e:'💧',n:'맑은 물 꿈',g:2,kw:['물','강','바다','샘','맑은'],t:'맑고 깨끗한 물은 재물, 건강, 마음의 평화를 뜻해요. 맑은 물을 마시거나 물이 넘치도록 차오르면 재물과 행운이 들어와요.',v:'흙탕물이나 더러운 물은 걱정거리나 몸의 피로를 뜻하니 건강을 챙기세요.',tip:'물을 맑게 본 날은 관계를 회복하거나 화해하기에 좋아요.'},
    {e:'🦷',n:'이가 빠지는 꿈',g:0,kw:['이빨','치아','이가 빠','이빨 빠','이가 흔들','앞니','어금니'],t:'이가 빠지는 꿈은 가까운 사람이나 가족에게 걱정거리가 생기거나 내가 지키던 것을 잃을까 불안한 마음을 뜻해요. 윗니는 윗사람, 아랫니는 아랫사람으로 봐요.',v:'빠진 이가 아프지 않고 새 이가 나면 오히려 낡은 것을 정리하고 새 출발을 하는 꿈이에요.',tip:'부모님이나 가족에게 안부 연락을 한 번 드려 보세요.'},
    {e:'⚰️',n:'내가 죽는 꿈',g:2,kw:['죽는','죽음','죽었','장례','관'],t:'놀랍지만 내가 죽는 꿈은 길몽이에요. 지금까지의 어려움이 끝나고 새롭게 다시 태어나는 것, 즉 큰 변화와 새 출발을 뜻해요. 장례를 치르는 꿈도 일이 잘 마무리된다는 뜻이에요.',v:'죽기 직전에 너무 무섭고 괴로웠다면 요즘 스트레스가 많다는 신호일 수 있어요.',tip:'이직, 이사, 새 공부처럼 바꾸고 싶던 일을 시작하기 좋은 때예요.'},
    {e:'👴',n:'돌아가신 조상님 꿈',g:1,kw:['조상','돌아가신','할아버지','할머니','부모님','죽은 사람'],t:'조상님이 밝은 얼굴로 나타나 무언가를 주거나 웃어 주면 도움과 복이 들어오는 길몽이에요. 중요한 일을 앞두고 꾸면 일이 잘 풀린다는 뜻이에요.',v:'조상님이 화를 내거나 슬퍼하거나 나를 데려가려 하면 건강과 안전을 조심하라는 경고로 봐요.',tip:'조상님이 하신 말씀이 기억나면 적어 두세요. 의외로 힌트가 될 때가 많아요.'},
    {e:'🏃',n:'쫓기는 꿈',g:0,kw:['쫓기','쫓겨','도망','추격'],t:'누군가에게 쫓기는 꿈은 마음속 부담, 마감, 피하고 싶은 문제가 있다는 뜻이에요. 쫓아오는 존재가 바로 내가 마주하기 싫은 일인 경우가 많아요.',v:'끝까지 도망쳐 숨거나 맞서서 이기면 그 문제를 곧 해결하게 된다는 좋은 꿈이에요.',tip:'미뤄 둔 일 하나를 오늘 끝내면 마음이 한결 가벼워져요.'},
    {e:'🕳️',n:'떨어지는 꿈',g:0,kw:['떨어지','추락','낭떠러지','절벽','높은 곳'],t:'높은 곳에서 떨어지는 꿈은 자신감이 떨어졌거나 지금 자리가 불안하다는 마음을 뜻해요. 몸이 많이 피곤할 때도 자주 꿔요.',v:'떨어졌는데 다치지 않고 사뿐히 내려앉으면 걱정하던 일이 무사히 지나가요.',tip:'무리한 투자나 큰 결정은 며칠 미루고 충분히 쉬세요.'},
    {e:'🕊️',n:'하늘을 나는 꿈',g:2,kw:['날아','하늘','나는 꿈','비행'],t:'하늘을 자유롭게 나는 꿈은 소원 성취, 승진, 자유를 뜻하는 길몽이에요. 높이 날수록 뜻하는 바가 크게 이루어져요.',v:'날다가 떨어지거나 잘 날지 못하면 욕심을 조금 줄이고 차근차근 가라는 뜻이에요.',tip:'큰 목표를 세우거나 새 계획을 발표하기에 좋은 기운이에요.'},
    {e:'🩸',n:'피 꿈',g:2,kw:['피','출혈','코피'],t:'꿈에서 피는 재물과 생명력을 뜻해요. 피를 많이 흘리거나 피가 옷에 묻으면 재물이 들어오거나 막혔던 일이 시원하게 풀리는 꿈이에요.',v:'피가 검거나 상처가 아파서 괴로웠다면 몸의 피로나 건강을 살펴보세요.',tip:'받지 못한 돈이나 결과를 기다리던 일에 좋은 소식이 올 수 있어요.'},
    {e:'💰',n:'돈 줍는 꿈',g:1,kw:['돈','지폐','동전','줍','금','보석'],t:'지폐나 금, 보석을 줍는 꿈은 뜻밖의 행운과 기회를 뜻해요. 특히 지폐를 많이 주우면 좋은 일이 생겨요.',v:'동전만 잔뜩 줍는 꿈은 오히려 자잘한 지출이나 잔걱정이 늘어나는 것으로 보기도 해요.',tip:'좋은 기회가 와도 꼼꼼히 확인하고 잡으세요.'},
    {e:'📝',n:'시험 보는 꿈',g:1,kw:['시험','시험지','수능','문제','답안'],t:'시험 보는 꿈은 지금 평가받거나 결과를 기다리는 일이 있다는 뜻이에요. 문제를 술술 풀었다면 실제로도 좋은 결과가 나와요.',v:'답을 못 쓰거나 늦어서 시험을 못 보면 준비가 부족하다고 느끼는 불안이에요. 실제 결과와는 다를 때가 많아요.',tip:'준비물이나 일정, 서류를 한 번 더 점검해 보세요.'},
    {e:'💍',n:'결혼하는 꿈',g:1,kw:['결혼','웨딩','신부','신랑','결혼식'],t:'결혼은 새로운 결합, 계약, 동업을 뜻해요. 기쁜 마음으로 결혼식을 올리면 새 일이나 좋은 인연이 잘 맺어져요.',v:'원치 않는 결혼이나 결혼식이 엉망이면 억지로 하는 약속이나 계약을 조심하세요.',tip:'함께할 사람이나 회사를 고를 때 마음이 편한 쪽을 택하세요.'},
    {e:'👶',n:'아기 꿈',g:1,kw:['아기','아이','갓난','출산','임신'],t:'건강하고 웃는 아기는 새로운 시작, 새 계획, 기쁜 소식을 뜻해요. 임신이나 출산 꿈은 새 일이 생기고 그것이 결실을 맺는 꿈이에요.',v:'아기가 울며 보채면 신경 쓸 일이나 돌봐야 할 일이 늘어날 수 있어요.',tip:'새로 시작한 일은 정성을 들인 만큼 자라요. 꾸준히 챙겨 주세요.'},
    {e:'🐯',n:'호랑이 꿈',g:2,kw:['호랑이','범','사자'],t:'호랑이는 권력, 명예, 귀인을 뜻해요. 호랑이가 나를 따르거나 집에 들어오면 높은 자리에 오르거나 힘 있는 사람의 도움을 받아요. 태몽으로는 씩씩하고 리더십 있는 아이예요.',v:'호랑이에게 물리거나 쫓기면 윗사람과의 마찰이나 경쟁자를 조심하세요.',tip:'윗사람에게 의견을 내거나 도움을 청하기 좋은 때예요.'},
    {e:'🐟',n:'물고기 꿈',g:2,kw:['물고기','잉어','붕어','생선','낚시'],t:'크고 싱싱한 물고기, 특히 잉어를 잡거나 품에 안는 꿈은 재물과 태몽을 뜻하는 길몽이에요. 물고기가 많을수록 복도 커요.',v:'죽은 물고기나 놓친 물고기는 기회를 놓치거나 기대가 어긋날 수 있다는 뜻이에요.',tip:'좋은 기회가 오면 망설이지 말고 잡아 보세요.'},
    {e:'👟',n:'신발 잃어버리는 꿈',g:0,kw:['신발','구두','운동화','잃어버'],t:'신발은 나의 자리, 직장, 배우자나 동반자를 뜻해요. 신발을 잃어버리면 지금 자리가 흔들리거나 가까운 사람과 멀어질까 걱정하는 마음이에요.',v:'새 신발을 얻거나 잘 맞는 신발을 신으면 새 직장, 새 인연을 만나는 좋은 꿈이에요.',tip:'가까운 사람과 오해가 없도록 먼저 연락해 보세요.'},
    // ── 집 꿈 ──
    {c:1,e:'🏠',n:'새 집으로 이사 가는 꿈',g:2,kw:['새 집','새집','이사','집을 사','집 구경','넓은 집','큰 집'],t:'새 집은 새로운 환경, 새 자리, 형편이 나아지는 것을 뜻해요. 넓고 밝은 집으로 이사 가면 승진, 이직, 재물 증가처럼 삶의 그릇이 커지는 길몽이에요. 집을 사는 꿈은 재산이 늘어나는 꿈으로 봐요.',v:'새 집이 어둡고 좁거나 낡아서 마음이 불편했다면 바뀌는 환경에 적응하느라 힘들 수 있다는 뜻이에요.',tip:'미뤄 두던 이사, 이직, 새 계획을 구체적으로 알아보기 좋은 때예요.'},
    {c:1,e:'🏚️',n:'집이 무너지는 꿈',g:0,kw:['무너지','무너진','무너져','무너졌','붕괴','집이 부서','지붕','금이 가'],t:'집은 나 자신과 가정을 뜻해요. 집이 무너지거나 벽에 금이 가는 꿈은 가정, 건강, 직장 같은 생활의 바탕이 흔들릴까 걱정하는 마음이에요. 몸이 많이 지쳤을 때도 자주 꿔요.',v:'무너진 집에서 무사히 빠져나오거나 그 자리에 새 집을 지으면 낡은 것을 정리하고 새로 시작하는 좋은 꿈이에요.',tip:'가족 건강과 집안 시설(가스, 전기, 누수)을 한 번 점검해 보세요.'},
    {c:1,e:'🧹',n:'집 청소하는 꿈',g:1,kw:['청소','쓸고','쓸었','닦','빗자루','걸레','대청소'],t:'집을 깨끗이 청소하는 꿈은 묵은 걱정과 나쁜 기운을 털어내고 새 운을 맞을 준비를 한다는 뜻이에요. 청소 뒤 집이 환해지면 막혔던 일이 풀리고 좋은 소식이 들어와요.',v:'아무리 치워도 더러워지거나 쓰레기가 계속 쌓이면 해결하지 못한 문제가 마음에 남아 있다는 뜻이에요.',tip:'실제로 방 한 칸, 서랍 하나만 정리해도 기분과 운이 함께 가벼워져요.'},
    {c:1,e:'🌊',n:'집에 물이 차는 꿈',g:1,kw:['물이 차','물이 새','물이 들어','홍수','침수','물바다','누수'],t:'집 안에 맑은 물이 가득 차오르는 꿈은 재물이 집으로 밀려드는 길몽이에요. 물이 많을수록 들어오는 복도 크다고 봐요.',v:'흙탕물이 들어오거나 천장에서 물이 새면 돈이 새어 나가거나 집안에 걱정거리가 생길 수 있으니 조심하세요.',tip:'물이 맑았다면 저축이나 재테크를 시작하기 좋고, 탁했다면 지출을 줄이세요.'},
    {c:1,e:'🗝️',n:'문이 열리는 꿈',g:1,kw:['문이 열','문을 열','대문','현관','문이 잠','열쇠','문을 잠'],t:'문은 기회와 새 길을 뜻해요. 대문이나 현관문이 활짝 열리면 막혔던 일이 풀리고 새 기회가 찾아와요. 열쇠를 얻는 꿈은 문제를 풀 방법을 찾게 된다는 뜻이에요.',v:'문이 잠겨 열리지 않거나 열쇠를 잃어버리면 지금은 때가 아니니 조금 기다리라는 뜻이에요.',tip:'새로 들어온 제안이나 연락이 있으면 한 번 문을 열어 보세요.'},
    {c:1,e:'🦹',n:'집에 도둑이 드는 꿈',g:0,kw:['도둑','강도','훔쳐','훔쳤','도난','털렸'],t:'도둑이 들어 물건을 가져가는 꿈은 내 시간, 돈, 마음을 빼앗기고 있다는 느낌을 뜻해요. 손해 볼 일이나 남에게 이용당할 일을 조심하라는 꿈이에요.',v:'도둑을 잡거나 쫓아내면 손해를 막고 오히려 이익을 보는 꿈이에요. 도둑이 아무것도 못 가져가도 좋은 뜻이에요.',tip:'보증, 돈 빌려주기, 급한 계약은 며칠 미루고 꼼꼼히 확인하세요.'},
    {c:1,e:'🏡',n:'예전에 살던 집 꿈',g:1,kw:['옛날 집','예전 집','예전에 살던','어릴 때 살던','살던 집','고향','시골집'],t:'어릴 때 살던 집이나 고향 집 꿈은 마음이 지쳐 편안했던 때로 돌아가고 싶다는 뜻이에요. 집이 따뜻하고 반가웠다면 가족이나 옛 인연에게서 도움과 위로를 받아요.',v:'옛집이 폐허가 되었거나 들어가지 못하면 지나간 일에 너무 얽매여 있다는 뜻이니 앞을 보세요.',tip:'오랜만에 가족이나 옛 친구에게 안부를 전해 보세요.'},
    {c:1,e:'🚪',n:'몰랐던 방을 찾는 꿈',g:2,kw:['숨은 방','숨겨진 방','새로운 방','몰랐던 방','방이 생기','방을 발견','비밀 방'],t:'우리 집에 몰랐던 방이 있는 꿈은 아직 쓰지 않은 내 재능, 새 기회, 숨은 재물을 발견한다는 길몽이에요. 방이 넓고 깨끗할수록 좋아요.',v:'그 방이 어둡고 무서웠다면 외면하던 걱정거리를 마주할 때가 왔다는 뜻이에요.',tip:'새 취미나 공부, 부업처럼 해 보고 싶던 일을 시작해 보세요.'},
    // ── 사람 꿈 ──
    {c:2,e:'💔',n:'헤어진 연인 꿈',g:1,kw:['전 애인','전애인','전남친','전여친','헤어진','옛 애인','첫사랑','전 남자친구','전 여자친구'],t:'헤어진 연인 꿈은 그 사람이 그리워서라기보다, 그때의 내 마음이나 풀지 못한 감정이 남아 있다는 뜻이 많아요. 새로운 연애가 시작될 때도 자주 꿔요.',v:'다시 만나 웃고 화해하면 마음속 앙금이 풀리고 새 인연을 맞을 준비가 되었다는 좋은 꿈이에요.',tip:'지난 일은 정리하고 지금 곁에 있는 사람에게 마음을 써 보세요.'},
    {c:2,e:'🌟',n:'연예인·유명인 만나는 꿈',g:2,kw:['연예인','유명인','대통령','아이돌','영화배우','배우를','배우가','가수','스타'],t:'연예인이나 대통령 같은 유명한 사람을 만나는 꿈은 귀인을 만나거나 인기, 명예가 높아지는 길몽이에요. 함께 웃고 이야기하거나 무언가를 받으면 좋은 기회가 와요.',v:'유명인이 나를 무시하거나 화를 내면 기대가 너무 커서 실망할 수 있다는 뜻이에요.',tip:'모임이나 발표 자리에 적극적으로 나가 보세요. 나를 알릴 기회예요.'},
    {c:2,e:'⚔️',n:'누군가와 싸우는 꿈',g:1,kw:['싸우','싸움','싸웠','다투','다퉜','때리','때렸','얻어맞','욕하'],t:'꿈에서 싸우는 것은 실제 다툼이 아니라 마음속 경쟁과 갈등을 뜻해요. 싸워서 이기면 경쟁에서 앞서고 원하는 것을 얻는 길몽이에요.',v:'싸워서 지거나 크게 맞으면 자신감이 떨어지거나 실제로 말다툼, 구설이 생길 수 있으니 말을 아끼세요.',tip:'오늘은 감정을 앞세우기보다 한 템포 쉬고 대답하세요.'},
    {c:2,e:'🧑‍🤝‍🧑',n:'친구 꿈',g:1,kw:['친구','동창','동료','옛 친구','학교 친구'],t:'친구 꿈은 인간관계와 도움을 뜻해요. 친구와 즐겁게 놀거나 밥을 먹으면 주변 사람의 도움을 받고 모임에서 좋은 일이 생겨요. 오래 못 본 친구가 나오면 반가운 연락이 올 수 있어요.',v:'친구와 다투거나 친구가 등을 돌리면 가까운 사이에 오해가 생길 수 있으니 말과 약속을 조심하세요.',tip:'꿈에 나온 친구에게 가볍게 안부 문자를 보내 보세요.'},
    {c:2,e:'🕯️',n:'가족이 아프거나 죽는 꿈',g:1,kw:['가족이 죽','엄마가 죽','아빠가 죽','부모님이 죽','남편이 죽','아내가 죽','가족이 아프','가족이 다치'],t:'놀랍지만 가족이 죽는 꿈은 전통 해몽에서 그 사람이 오래 살고 걱정이 끝난다는 길몽으로 봐요. 가족에 대한 사랑과 걱정이 크다는 뜻이기도 해요.',v:'꿈속 가족이 많이 아파하거나 다쳐서 괴로웠다면 실제로 그 사람의 건강을 한 번 챙겨 보라는 신호로 봐요.',tip:'꿈에 나온 가족에게 전화 한 통 드려 보세요. 서로 마음이 편해져요.'},
    {c:2,e:'💋',n:'모르는 사람과 연애하는 꿈',g:1,kw:['키스','뽀뽀','고백','연애','사귀','모르는 사람','애인이 생'],t:'모르는 사람과 사귀거나 키스하는 꿈은 새로운 인연, 새 일, 새 기회와 손을 잡게 된다는 뜻이에요. 기분이 좋았다면 연애운과 대인운이 올라가요.',v:'상대가 무섭거나 억지로 끌려갔다면 원치 않는 일에 휘말릴 수 있으니 거절할 땐 분명히 하세요.',tip:'새로운 사람을 만나는 자리에 나가 보면 좋은 인연이 생길 수 있어요.'},
    {c:2,e:'🧙',n:'하얀 옷 입은 노인 꿈',g:2,kw:['노인','백발','산신령','도사','스님','신선','하얀 옷'],t:'흰옷 입은 노인이나 산신령, 스님이 나타나 말을 걸거나 무언가를 주는 꿈은 귀인의 도움과 큰 복을 뜻하는 길몽이에요. 고민하던 일에 해답이 생겨요.',v:'노인이 꾸짖거나 아무 말 없이 돌아서면 지금 하는 일을 한 번 돌아보라는 경고로 봐요.',tip:'노인이 해 준 말이나 준 물건이 기억나면 꼭 적어 두세요.'},
    // ── 손님 꿈 ──
    {c:3,e:'🛎️',n:'손님이 찾아오는 꿈',g:2,kw:['손님','방문','찾아오','찾아왔','초대','놀러 왔','놀러 오'],t:'반가운 손님이 집에 찾아오는 꿈은 좋은 소식, 새 인연, 재물이 들어오는 길몽이에요. 손님이 귀하고 점잖을수록 들어오는 복도 커요.',v:'손님을 맞을 준비가 안 돼 당황했다면 갑자기 생기는 일이나 지출에 대비하라는 뜻이에요.',tip:'오늘 들어오는 연락이나 만남 제안은 반갑게 받아 보세요.'},
    {c:3,e:'🍚',n:'손님에게 음식 대접하는 꿈',g:1,kw:['대접','음식을 차','밥을 차','상을 차','음식 대접','밥을 해','요리해'],t:'손님에게 정성껏 음식을 대접하는 꿈은 덕을 베풀어 인복이 쌓이는 꿈이에요. 손님이 맛있게 먹으면 내가 한 일을 인정받고 도움이 되돌아와요.',v:'음식이 모자라거나 손님이 먹지 않고 가면 애쓴 만큼 알아주지 않아 서운할 수 있어요. 너무 퍼주지는 마세요.',tip:'고마운 사람에게 밥 한 끼 사면 좋은 인연이 더 단단해져요.'},
    {c:3,e:'🎁',n:'손님이 선물을 주는 꿈',g:2,kw:['선물','가져왔','들고 왔','들고 온','받았어','상자'],t:'손님이나 누군가가 선물을 들고 오는 꿈은 뜻밖의 행운, 좋은 소식, 도움이 찾아오는 길몽이에요. 선물이 크고 무거울수록 복도 커요.',v:'선물 상자가 비어 있거나 받기 싫은 물건이면 겉만 그럴듯한 제안을 조심하세요.',tip:'기다리던 소식이나 결과가 있다면 좋은 답이 올 수 있어요.'},
    {c:3,e:'🎉',n:'집에 손님이 많이 모이는 꿈',g:2,kw:['잔치','파티','손님이 많','사람이 많','북적','모여','생일상'],t:'집에 손님이 많이 모여 북적이고 웃음소리가 나는 꿈은 집안이 번창하고 경사가 생기는 길몽이에요. 사업하는 사람에게는 손님이 늘어나는 꿈이에요.',v:'사람은 많은데 시끄럽게 다투거나 내가 외로웠다면 구설이나 신경 쓸 일이 늘어날 수 있어요.',tip:'모임이나 행사를 열거나 가게를 홍보하기 좋은 때예요.'},
    {c:3,e:'👤',n:'낯선 사람이 집에 들어오는 꿈',g:0,kw:['낯선 사람','낯선 남자','낯선 여자','침입','쳐들어','불청객','모르는 사람이 집'],t:'반갑지 않은 낯선 사람이 집에 함부로 들어오는 꿈은 내 영역이 침범당하는 느낌, 원치 않는 간섭이나 일이 생길 수 있다는 뜻이에요.',v:'그 사람을 정중히 돌려보내거나 알고 보니 반가운 사람이었다면 걱정하던 일이 오히려 도움으로 바뀌어요.',tip:'모르는 번호, 급한 돈 요구, 낯선 제안은 한 번 더 확인하세요.'},
    {c:3,e:'👋',n:'손님을 배웅하는 꿈',g:1,kw:['배웅','손님이 떠나','손님이 가','손님을 보내','작별','떠나보내'],t:'손님을 웃으며 배웅하는 꿈은 걱정거리나 묵은 일이 깨끗이 정리되고 마무리된다는 뜻이에요. 문 앞까지 잘 보내 드리면 좋은 인연이 계속 이어져요.',v:'손님이 화를 내며 떠나거나 붙잡아도 가 버리면 아쉬운 이별이나 기회를 놓치는 일이 생길 수 있어요.',tip:'끝내야 할 일, 정리할 관계가 있다면 지금 깔끔하게 마무리하세요.'}
  ];
  const CAT=['⭐ 많이 꾸는 꿈','🏠 집 꿈','👥 사람 꿈','🛎️ 손님 꿈'];
  const G=[['🌧️ 조심하면 좋은 꿈','g0'],['🌤️ 상황에 따라 다른 꿈','g1'],['🌈 길몽','g3']];
  let cur=-1,q='';
  function find(text){const t=text.replace(/\s+/g,' ').trim();if(!t)return [];
    return D.map((d,i)=>[i,d.kw.reduce((s,k)=>s+(t.includes(k)?k.length:0),0)+(t.includes(d.n.replace(/ 꿈$/,''))?1:0)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);}
  function view(d){return '<div class="dmRes"><div class="dmHead"><span>'+d.e+'</span><div><b>'+d.n+'</b><i class="jmG '+G[d.g][1]+'">'+G[d.g][0]+'</i></div></div>'+
    '<p>'+d.t+'</p><h4>🔄 이럴 땐 반대로 봐요</h4><p>'+d.v+'</p><h4>💡 오늘의 한 가지</h4><p>'+d.tip+'</p></div>';}
  window.renderDream=function(){
    ['typecard','fourcard','mapCard'].forEach(id=>{const el=$(id);if(el)el.style.display='none';});
    const R=$('reading');
    let h='<h2>🌙 꿈해몽</h2><p class="jmSub">많이 꾸는 꿈과 집·사람·손님 꿈 '+D.length+'가지예요. 누르면 바로 풀이가 나와요.</p>';
    h+='<div class="askFree"><input id="dmQ" placeholder="꿈 내용 쓰기 · 예: 돼지가 집에 들어왔어요" aria-label="꿈 내용" value="'+q.replace(/"/g,'&quot;')+'"><button type="button" id="dmGo">찾기</button></div>';
    h+=CAT.map((c,ci)=>'<p class="dmCat">'+c+'</p><div class="dmGrid">'+D.map((d,i)=>[d,i]).filter(([d])=>(d.c||0)===ci).map(([d,i])=>'<button type="button" class="dmChip'+(i===cur?' on':'')+'" data-i="'+i+'"><span>'+d.e+'</span>'+d.n.replace(/ 꿈$/,'')+'</button>').join('')+'</div>').join('');
    h+='<div id="dmOut">';
    if(q&&cur<0)h+='<p class="note">"'+q.replace(/</g,'&lt;')+'"에 맞는 꿈을 찾지 못했어요. 꿈에 나온 동물이나 물건, 행동을 한 단어로 써 보세요. (예: 뱀, 불, 떨어지는)</p>';
    if(cur>=0)h+=view(D[cur]);
    h+='</div><p class="note">꿈해몽은 전통 해몽을 바탕으로 한 참고용 풀이예요. 같은 꿈이라도 꿈속 기분이 좋았으면 좋은 쪽으로, 무섭고 불쾌했으면 조심하는 쪽으로 보면 돼요.</p>';
    R.innerHTML=h;
    R.querySelectorAll('.dmChip').forEach(b=>b.addEventListener('click',()=>{cur=+b.dataset.i;q='';renderDream();setTimeout(()=>$('dmOut').scrollIntoView({behavior:'smooth',block:'start'}),40);}));
    const go=()=>{q=$('dmQ').value.trim();const r=find(q);cur=r.length?r[0]:-1;renderDream();setTimeout(()=>$('dmOut').scrollIntoView({behavior:'smooth',block:'start'}),40);};
    $('dmGo').addEventListener('click',go);$('dmQ').addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  };
  const _showD=show;show=function(){const r=_showD.apply(this,arguments);if(mode==='dm'){['typecard','fourcard','mapCard'].forEach(id=>{const el=$(id);if(el)el.style.display='none';});}return r;};
})();
// ── 카톡·인스타 공유 (결과를 이미지 카드로 만들어 공유) ──
(function(){
  const APP_URL='https://shtelpjh2000-lgtm.github.io/saju/';
  const clean=t=>(t||'').replace(/\s+/g,' ').trim();
  function collect(root){
    const h2=[...root.querySelectorAll('h2, [data-sec] h4')].find(e=>e.getClientRects().length);let title=clean(h2&&h2.textContent);if(h2&&h2.tagName==='H4')title='👹 '+title;
    const sub=[];const bd=root.querySelector('.badge');if(bd)sub.push(clean(bd.textContent));
    const dh=root.querySelector('.dmHead');if(dh){title='🌙 '+clean(dh.querySelector('b').textContent);const g=dh.querySelector('i');if(g)sub.push(clean(g.textContent));}
    const lines=[];
    const core=t=>t.replace(/^[^\s가-힣A-Za-z0-9]+\s*/,'').replace(/^한마디로,\s*/,'');
    root.querySelectorAll(root.querySelector('.dmRes')?'.dmRes > p':'.rdHL, .rdSec p, p, li, td').forEach(el=>{
      if(lines.length>=5||el.closest('.shareBar')||el.closest('table'))return;
      if(!el.getClientRects().length)return;
      if(el.classList.contains('note')||el.classList.contains('jmSub')||el.classList.contains('dmCat')||el.classList.contains('err'))return;
      const t=clean(el.textContent);if(t.length<8||lines.some(l=>core(l).includes(core(t))||core(t).includes(core(l))))return;lines.push(t);
    });
    if(!title){const t=root.querySelector('b,strong,h3,h4');title=clean(t&&t.textContent)||'👹 도깨비 사주';}
    return {title,sub:sub.join(' · '),lines};
  }
  function wrap(ctx,text,maxW){const out=[];let line='';
    for(const ch of [...text]){const t=line+ch;if(ctx.measureText(t).width>maxW&&line){
      const sp=line.lastIndexOf(' ');if(sp>line.length*0.6){out.push(line.slice(0,sp));line=line.slice(sp+1)+ch;}else{out.push(line);line=ch;}}else line=t;}
    if(line)out.push(line);return out;}
  function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function draw(d){
    const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
    const F='"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
    const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ffe3ee');g.addColorStop(.55,'#efe8ff');g.addColorStop(1,'#dff4ff');c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle='rgba(255,255,255,.55)';[[120,140,90],[960,260,60],[930,1180,110],[90,1150,50]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,7);c.fill();});
    c.textAlign='center';c.fillStyle='#3a2e4d';c.font='96px '+F;c.fillText('👹',W/2,150);
    c.font='800 40px '+F;c.fillStyle='#ff6b9a';c.fillText('도깨비 사주',W/2,215);
    c.fillStyle='#ffffff';c.shadowColor='rgba(186,140,190,.35)';c.shadowBlur=30;rr(c,70,260,W-140,H-420,44);c.fill();c.shadowBlur=0;
    let y=350;c.fillStyle='#3a2e4d';c.font='800 58px '+F;
    for(const l of wrap(c,d.title,W-240).slice(0,2)){c.fillText(l,W/2,y);y+=70;}
    if(d.sub){c.font='600 34px '+F;c.fillStyle='#9b7bff';for(const l of wrap(c,d.sub,W-260).slice(0,2)){c.fillText(l,W/2,y);y+=46;}}
    y+=20;c.strokeStyle='#f0e3ee';c.lineWidth=4;c.beginPath();c.moveTo(160,y);c.lineTo(W-160,y);c.stroke();y+=70;
    c.textAlign='left';c.font='500 38px '+F;c.fillStyle='#3a2e4d';const maxY=H-230;
    outer:for(const t of d.lines){for(const l of wrap(c,t,W-260)){if(y>maxY){break outer;}c.fillText(l,130,y);y+=56;}y+=22;}
    c.textAlign='center';c.font='600 30px '+F;c.fillStyle='#9a8fae';c.fillText('나도 보러 가기 👉 도깨비 사주에서 검색',W/2,H-90);
    return cv;
  }
  function b64(cv){return cv.toDataURL('image/png').split(',')[1];}
  async function share(root,btn){
    const d=collect(root);const cv=draw(d);const text=d.title+'\n'+(d.lines[0]||'')+'\n\n👹 도깨비 사주에서 내 운세 보기\n'+APP_URL;
    const name='도깨비사주_'+Date.now()+'.png';const msg=root.querySelector('.shareMsg');const say=t=>{if(msg)msg.textContent=t;};
    const C=window.Capacitor;
    if(C&&C.isNativePlatform&&C.isNativePlatform()){
      const FS=(C.Plugins&&C.Plugins.Filesystem)||C.registerPlugin('Filesystem');const SH=(C.Plugins&&C.Plugins.Share)||C.registerPlugin('Share');
      const w=await FS.writeFile({path:name,data:b64(cv),directory:'CACHE'});
      await SH.share({title:d.title,text,files:[w.uri],dialogTitle:'카카오톡·인스타그램으로 공유'});
      say('카카오톡이나 인스타그램을 골라 보내 주세요.');return;
    }
    const blob=await new Promise(r=>cv.toBlob(r,'image/png'));const file=new File([blob],name,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:d.title,text});say('카카오톡이나 인스타그램을 골라 보내 주세요.');return;}
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    try{await navigator.clipboard.writeText(text);}catch(e){}
    say('이미지를 저장하고 소개 글을 복사했어요. 카카오톡이나 인스타그램에 이미지를 올리고 글을 붙여 넣으세요.');
  }
  function attach(root){
    if(!root||!clean(root.textContent))return;const old=root.querySelector(':scope > .shareBar');
    if(root.querySelector('.dmGrid')&&!root.querySelector('.dmRes')){if(old)old.remove();return;}
    if(old)return;
    const bar=document.createElement('div');bar.className='shareBar';
    bar.innerHTML='<button type="button" class="shK">💬 카카오톡 공유</button><button type="button" class="shI">📸 인스타그램 공유</button><p class="shareMsg"></p>';
    bar.querySelectorAll('button').forEach(b=>b.addEventListener('click',async()=>{b.disabled=true;
      try{await share(root,b);}catch(e){if(!/cancel|abort/i.test(e&&(e.name+e.message)||''))root.querySelector('.shareMsg').textContent='공유하지 못했어요: '+(e&&e.message||e);}
      finally{b.disabled=false;}}));
    root.appendChild(bar);
  }
  ['reading','todayOut'].forEach(id=>{const el=$(id);if(!el)return;new MutationObserver(()=>attach(el)).observe(el,{childList:true});attach(el);});
  window.__share={collect,draw};
})();
// ── 점신식 메뉴: 누른 것만 보여 주기 (명국) ──
(function(){
  const B=document.body;let sel='sum';
  const ext={type:'typecard',four:'fourcard',map:'mapCard'};
  function apply(){B.classList.toggle('mnWon',mode==='won');B.dataset.mn=sel;
    document.querySelectorAll('#mnGrid button').forEach(b=>b.classList.toggle('on',b.dataset.k===sel));}
  $('mnGrid').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.k==='sin'){const m=$('mode').querySelector('button[data-v="sin"]');if(m)m.click();return;}
    if(b.dataset.k==='ask'){$('askCard').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>$('askQ').focus({preventScroll:true}),400);return;}
    sel=b.dataset.k;apply();
    const el=$(ext[sel]||'reading');setTimeout(()=>{const t=ext[sel]?el:(el.querySelector('[data-sec="'+sel+'"]')||el);(t.closest('.card')||t).scrollIntoView({behavior:'smooth',block:'start'});},40);});
  const _sh=show;show=function(){const r=_sh.apply(this,arguments);apply();return r;};
  $('mode').addEventListener('click',()=>setTimeout(apply,0));
  window.__mn={set:k=>{sel=k;apply();}};
})();
// ── 궁금한 것 물어보기 (시험·승진·이직·이사 방위 등) ──
(function(){
  const LQK={父:'문서·도움(부모)',官:'직장·명예(관)',財:'재물(재)',孫:'자녀·재능(손)',兄:'친구·경쟁(형)',鬼:'압박·시련(귀)',世:'나 자신(세)'};
  const DK={休門:'휴문',生門:'생문',傷門:'상문',杜門:'두문',景門:'경문',死門:'사문',驚門:'경문(놀람)',開門:'개문'};
  const GK={生氣:'생기',天宜:'천의',絶體:'절체',遊魂:'유혼',禍害:'화해',福德:'복덕',絶命:'절명',歸魂:'귀혼'};
  const DOOR0={休門:0.5,生門:0.6,開門:0.6,景門:0,杜門:-0.5,傷門:-1,驚門:-1,死門:-1.2};
  const GUA0={生氣:1,天宜:0.7,福德:1,歸魂:0.3,遊魂:0,禍害:-0.8,絶體:-0.8,絶命:-1.3};
  const T={
    exam:{g:'work',n:'시험·학업',e:'📚',lq:['父','官'],bad:['財'],door:{景門:1.5,開門:1,休門:0.6},dir:true,
      kw:['시험','합격','수능','공무원','자격증','면접','입시','고시','토익','공부','성적','대학','학교','학업'],
      why:'시험과 공부는 문서·학업을 뜻하는 <b>부(父, 인성)</b>와 합격·명예를 뜻하는 <b>관(官)</b>으로 보고, 시험과 문서의 문인 <b>경문(景門)</b>이 어디 있는지 함께 봐요. 재물(財)이 강하면 공부보다 다른 일에 마음이 가기 쉬워요.',
      v:['시험운이 아주 강해요. 준비한 만큼, 아니 그 이상으로 결과가 나오는 때예요. 원하는 곳에 과감하게 도전해 보세요.','합격 가능성이 좋은 편이에요. 마지막까지 꾸준히 하면 좋은 소식을 들을 수 있어요.','실력만큼 나오는 때예요. 약한 과목이나 면접 준비를 한 번 더 다지면 충분히 해볼 만해요.','변수가 많은 때예요. 한 번에 모든 걸 걸기보다, 다음 기회까지 넉넉히 준비하는 전략이 좋아요.'],
      tips:['시험 날짜와 접수 마감, 서류는 두 번씩 확인하세요. 문서운이 결과를 좌우해요.','공부 책상은 위의 <b>좋은 방위</b> 쪽을 향하게 두면 집중이 잘돼요.','시험 전날은 무리하지 말고 일찍 쉬세요. 휴문(쉼)의 기운이 실력을 지켜 줘요.']},
    jobget:{g:'work',n:'취업',e:'🎓',lq:['官','父'],bad:['孫'],door:{開門:1.5,景門:0.8,生門:0.8},dir:true,
      kw:['취업','구직','입사','첫 직장','신입','채용','합격 통보','서류 합격','알바','아르바이트'],
      why:'취업은 들어갈 직장을 뜻하는 <b>관(官)</b>과 이력서·서류를 뜻하는 <b>부(父)</b>로 보고, 직장의 문인 <b>개문(開門)</b>과 서류의 문인 <b>경문(景門)</b>을 함께 봐요. 손(孫)이 강하면 조건을 너무 따지다 기회를 놓치기 쉬워요.',
      v:['취업운이 아주 좋아요. 원하던 곳에서 연락이 오거나, 생각보다 좋은 조건으로 붙을 수 있어요.','붙을 가능성이 좋아요. 지원을 넓게 하면 좋은 곳에 자리를 잡아요.','조금 시간이 걸리는 흐름이에요. 자격증이나 경력을 하나 더 쌓으면 길이 열려요.','눈높이와 현실이 엇갈리기 쉬운 때예요. 가까운 기회부터 잡고 경력을 쌓아 가세요.'],
      tips:['이력서는 지원하는 곳마다 그 회사에 맞게 고쳐 쓰세요. 문서운이 핵심이에요.','면접은 위의 <b>좋은 날</b>로 잡을 수 있으면 잡아 보세요.','집에서 <b>좋은 방위</b> 쪽에 있는 회사를 먼저 살펴보세요.']},
    jobmove:{g:'work',n:'이직·퇴사',e:'💼',lq:['官','財'],bad:['兄'],door:{開門:1.5,生門:1,休門:0.6},gua:{遊魂:0.6},dir:true,
      kw:['이직','퇴사','직장 옮','회사 옮','전직','그만둘','그만 둘','사표','옮길','옮겨'],
      why:'이직은 새 직장을 뜻하는 <b>관(官)</b>과 그곳에서 받을 대가를 뜻하는 <b>재(財)</b>로 보고, 새 출발의 문인 <b>개문(開門)</b>과 움직임의 자리인 <b>유혼</b>을 함께 봐요.',
      v:['새 자리로 옮기기 아주 좋은 때예요. 조건이 좋은 제안이 들어오거나, 원하는 곳에 붙을 가능성이 커요.','움직여 볼 만한 때예요. 여러 곳에 지원해 보면 좋은 기회를 잡을 수 있어요.','서두르지 않는 게 좋아요. 지금 자리에서 경력을 쌓으며 좋은 조건이 올 때 옮기세요.','지금 그만두는 건 조심하세요. 새 자리를 확실히 정한 뒤에 움직이는 게 안전해요.'],
      tips:['퇴사는 새 직장 합격 통보와 계약서를 받은 뒤에 하세요.','면접은 위의 <b>좋은 날</b>로 잡으면 마음이 편하고 말이 잘 나와요.','출퇴근 방향이 <b>좋은 방위</b>인 회사라면 더 좋아요.']},
    promo:{g:'work',n:'승진',e:'🏢',lq:['官','父'],bad:['孫'],door:{開門:1.5,生門:1,休門:0.6},
      kw:['승진','진급','발령','인사','평가','직급','부장','과장','팀장','임원'],
      why:'승진은 직장·지위를 뜻하는 <b>관(官)</b>과 인사 서류·윗사람의 도움을 뜻하는 <b>부(父)</b>로 보고, 직장과 출세의 문인 <b>개문(開門)</b>을 함께 봐요. 손(孫)이 강하면 윗사람과 부딪히기 쉬워요.',
      v:['승진운이 아주 좋아요. 그동안 해 온 일이 인정받고 자리가 올라가는 때예요.','윗사람 눈에 띄기 좋은 때예요. 성과를 숫자로 정리해 보여 주면 승진에 가까워져요.','무난한 흐름이에요. 이번엔 평가를 다지고, 다음 기회를 노리는 것도 좋은 전략이에요.','지금은 자리를 지키는 게 먼저예요. 윗사람과의 마찰을 피하고 실수를 줄이면 다음 기회가 와요.'],
      tips:['보고는 짧고 분명하게, 성과는 숫자로 남겨 두세요.','윗사람에게 대드는 말은 아끼세요. 손(孫)의 기운이 관(官)을 다치게 할 수 있어요.','인사 시즌 전, 위의 <b>좋은 달</b>에 면담이나 지원을 해 보세요.']},
    career:{g:'work',n:'적성·진로',e:'🧭',lq:['孫','官'],bad:[],door:{開門:1,生門:1,景門:0.6},special:'career',
      kw:['적성','진로','무슨 일','어떤 일','직업','전공','맞는 일','뭐 하면','무엇을 하면','천직'],
      why:'적성은 내 사주에서 <b>가장 힘이 센 기운</b>과 <b>일간의 오행</b>, 그리고 재능을 뜻하는 <b>손(孫)</b>과 조직을 뜻하는 <b>관(官)</b>이 어디서 힘을 받는지로 봐요. 여기에 나의 기질 유형을 더해 맞는 일을 골라요.',
      v:['지금 하는 방향과 타고난 재능이 잘 맞아요. 한 우물을 깊게 파면 크게 인정받아요.','재능을 살릴 길이 잘 보이는 때예요. 아래 맞는 분야 중 끌리는 것을 시작해 보세요.','재능은 있지만 아직 방향이 흩어져 있어요. 한두 가지로 좁혀 꾸준히 해 보세요.','지금은 이것저것 경험해 보며 나를 알아 가는 때예요. 서두르지 말고 작게 시도해 보세요.'],
      tips:['아래 맞는 분야 중 하나를 골라 3개월만 꾸준히 해 보세요. 몸이 먼저 답을 알려 줘요.','잘하는 일과 좋아하는 일이 겹치는 곳을 찾아보세요.','진로 상담이나 직업 체험처럼 실제로 겪어 보는 기회를 만들어 보세요.']},
    money:{g:'money',n:'재물운',e:'💰',lq:['財','孫'],bad:['兄'],door:{生門:1.5,開門:0.6,休門:0.5},
      kw:['돈','재물','부자','재테크','월급','수입','금전','돈복','재복'],
      why:'재물은 돈 그 자체인 <b>재(財)</b>와 돈을 만들어 내는 재능·활동인 <b>손(孫)</b>으로 보고, 재물이 자라는 문인 <b>생문(生門)</b>을 함께 봐요. 형(兄)이 강하면 돈이 나뉘거나 새기 쉬워요.',
      v:['재물운이 아주 좋아요. 들어오는 돈이 늘고, 그동안 해 둔 노력이 결실을 맺어요.','돈이 들어오는 흐름이 좋아요. 다만 크게 걸기보다 나눠서 하는 게 안전해요.','들어오는 만큼 나가는 흐름이에요. 새 투자보다 지출 관리가 먼저예요.','돈이 새기 쉬운 때예요. 보증, 빌려주기, 큰 지출은 피하고 지키는 데 집중하세요.'],
      tips:['보증이나 돈 빌려주기는 피하세요. 형(兄)의 기운이 재물을 나눠 가져가요.','큰돈이 드는 결정은 위의 <b>좋은 달</b>에 하세요.','수입의 일부를 먼저 떼어 저축하는 습관이 재물운을 지켜 줘요.']},
    invest:{g:'money',n:'주식·코인·투자',e:'📈',lq:['財','孫'],bad:['兄','鬼'],door:{生門:1.5,開門:0.5},doorX:{驚門:-1.5,傷門:-1.5,杜門:-1},
      kw:['주식','코인','비트코인','투자','펀드','선물','가상화폐','etf','ETF','배당','로또','복권'],
      why:'투자는 돈인 <b>재(財)</b>와 돈을 불리는 활동인 <b>손(孫)</b>으로 보되, 손실과 경쟁을 뜻하는 <b>형(兄)</b>·<b>귀(鬼)</b>와 놀람·손해의 문인 <b>경문(驚門)·상문(傷門)</b>을 특히 조심해서 봐요.',
      v:['투자운이 좋은 편이에요. 공부한 종목이나 꾸준히 모아 온 투자에서 결실을 볼 수 있어요. 그래도 한 번에 다 걸지는 마세요.','수익을 낼 수 있는 흐름이에요. 나눠서 사고, 목표 수익에 닿으면 일부를 챙기세요.','오르내림이 커서 얻는 만큼 잃기도 쉬워요. 새로 큰돈을 넣기보다 지켜보는 게 좋아요.','손실을 조심해야 하는 때예요. 빚내서 하는 투자, 남의 말만 믿는 투자는 꼭 피하세요.'],
      tips:['이 풀이는 투자 권유가 아니에요. 투자는 꼭 스스로 판단하고, 잃어도 되는 돈으로만 하세요.','빚을 내서 하는 투자는 피하세요. 형(兄)·귀(鬼)의 기운이 손실을 키워요.','사고팔 때는 위의 <b>좋은 날</b>을 참고하고, 조심할 달에는 쉬어 가세요.']},
    estate:{g:'money',n:'부동산·집 매매',e:'🏘️',lq:['父','財'],bad:['兄'],door:{生門:1.5,休門:1,開門:0.8},dir:true,
      kw:['부동산','집 사','집을 사','매매','아파트','청약','분양','땅','건물','집 팔','상가','전세','월세','계약금'],
      why:'부동산은 집·계약서를 뜻하는 <b>부(父)</b>와 돈인 <b>재(財)</b>로 보고, 재산이 자라는 <b>생문</b>과 편안히 머무는 <b>휴문</b>이 있는 방향을 함께 봐요. 형(兄)이 강하면 경쟁자가 많거나 돈이 나뉘기 쉬워요.',
      v:['집이나 땅을 사고팔기 아주 좋은 때예요. 문서운과 재물운이 함께 들어와요.','좋은 매물을 만날 수 있는 흐름이에요. 아래 좋은 방위와 좋은 달을 참고하세요.','서두를 필요는 없어요. 여러 곳을 비교하고 조건이 맞을 때 결정하세요.','계약에서 손해를 보기 쉬운 때예요. 큰 매매는 미루거나, 서류를 아주 꼼꼼히 확인하세요.'],
      tips:['계약 전에 등기부등본, 대출, 특약을 꼭 확인하세요. 문서(父)가 핵심이에요.','계약일은 위의 <b>좋은 날</b>에서 고르세요.','위의 <b>좋은 방위</b> 쪽 지역을 먼저 살펴보세요.']},
    biz:{g:'money',n:'사업·개업',e:'🏪',lq:['財','孫'],bad:['兄','鬼'],door:{生門:1.5,開門:1.5},dir:true,
      kw:['사업','개업','창업','가게','장사','매장','쇼핑몰','오픈','자영업','스마트스토어'],
      why:'사업과 개업은 돈을 뜻하는 <b>재(財)</b>와 상품·아이디어를 뜻하는 <b>손(孫)</b>으로 보고, 재물의 문인 <b>생문</b>과 개업의 문인 <b>개문</b>이 어디 있는지 함께 봐요. 형(兄)과 귀(鬼)가 강하면 경쟁과 손실을 조심해요.',
      v:['사업운이 아주 좋아요. 시작하거나 넓히기에 좋은 때예요.','해볼 만한 때예요. 작게 시작해서 반응을 보며 키우세요.','준비가 더 필요해요. 시장 조사와 자금 계획을 한 번 더 점검하세요.','지금은 크게 벌이기보다 지키는 때예요. 큰 대출과 무리한 확장은 특히 조심하세요.'],
      tips:['자금은 6개월 버틸 만큼 준비한 뒤 시작하세요.','개업일과 계약일은 위의 <b>좋은 날</b>에서 고르세요.','가게 입구나 사무실 책상은 <b>좋은 방위</b> 쪽으로 두면 좋아요.']},
    partner:{g:'money',n:'동업·계약',e:'🤝',lq:['兄','父'],bad:['鬼'],door:{開門:1.2,生門:1.2,休門:0.8},doorX:{驚門:-1.5,杜門:-1},
      kw:['동업','계약','파트너','같이 사업','협업','투자자','계약서'],
      why:'동업은 함께하는 사람을 뜻하는 <b>형(兄)</b>이 좋은 자리에 있는지, 계약서인 <b>부(父)</b>가 힘이 있는지로 보고, 나를 누르는 <b>귀(鬼)</b>와 다툼의 문인 <b>경문(驚門)</b>, 숨김의 문인 <b>두문</b>을 조심해서 봐요.',
      v:['함께하면 두 배로 잘되는 때예요. 믿을 만한 사람과의 동업이나 계약이 좋은 결과를 내요.','동업해 볼 만해요. 다만 역할과 돈 나누는 법을 분명히 정해 두세요.','좋은 점과 걱정되는 점이 반반이에요. 작은 일부터 같이 해 보며 서로를 확인하세요.','지금은 혼자 가는 게 안전해요. 동업이나 큰 계약은 서두르지 마세요.'],
      tips:['역할, 돈 나누는 방법, 헤어질 때의 정리 방법을 꼭 글로 남기세요.','계약서는 집에 가져와 하루 더 읽어 보고 도장을 찍으세요.','중요한 계약은 위의 <b>좋은 날</b>에 하세요.']},
    loan:{g:'money',n:'돈 빌려주기·빚',e:'🧾',lq:['財','父'],bad:['兄','鬼'],door:{生門:1,休門:0.8,開門:0.6},doorX:{死門:-1.5,杜門:-1.2},
      kw:['빌려','빚','대출','보증','갚','못 받','떼인','돈 받','차용','이자'],
      why:'돈을 빌려주거나 빚을 정리하는 일은 내 돈인 <b>재(財)</b>와 차용증·약속인 <b>부(父)</b>가 힘이 있는지, 돈을 나눠 가는 <b>형(兄)</b>과 손실의 <b>귀(鬼)</b>가 강한지로 봐요. <b>사문·두문</b>에 재물이 있으면 돈이 묶이기 쉬워요.',
      v:['돈 문제를 풀기 좋은 때예요. 받을 돈은 받고, 빚도 정리할 수 있어요.','약속을 분명히 하면 무난해요. 차용증과 갚는 날짜를 꼭 정해 두세요.','돈이 묶이기 쉬운 흐름이에요. 빌려줄 때는 못 받아도 괜찮은 만큼만 하세요.','돈을 빌려주거나 보증을 서는 건 피하세요. 지금은 지키는 게 가장 좋아요.'],
      tips:['빌려줄 때는 꼭 차용증을 쓰고, 계좌로 보내 기록을 남기세요.','보증은 거절해도 괜찮아요. 형(兄)의 기운이 강한 때는 특히 조심하세요.','받을 돈 이야기는 위의 <b>좋은 날</b>에 부드럽게 꺼내 보세요.']},
    love:{g:'love',n:'연애·새 인연',e:'💕',lqM:['財','孫'],lqF:['官','鬼'],badM:['兄'],badF:['孫'],door:{休門:1,景門:0.8,開門:0.5,生門:0.5},gua:{天宜:0.5,福德:0.5},
      kw:['연애','남자친구','여자친구','애인','만남','소개팅','썸','짝','인연','남친','여친','솔로','고백'],
      why:'연애는 남자는 <b>재(財)</b>, 여자는 <b>관(官)</b>을 이성의 자리로 보고, 만남과 설렘을 뜻하는 <b>손(孫)</b>, 마음이 편해지는 <b>휴문</b>과 드러나는 <b>경문</b>을 함께 봐요.',
      v:['인연운이 아주 좋아요. 좋은 사람을 만나거나, 지금 관계가 한 단계 깊어지는 때예요.','만남의 기회가 많아요. 소개나 모임에 적극적으로 나가 보세요.','잔잔한 흐름이에요. 서두르기보다 지금 사람을 더 알아 가는 시간이 좋아요.','서운한 일이나 오해가 생기기 쉬워요. 큰 결정보다 대화를 먼저 하세요.'],
      tips:['마음이 있다면 위의 <b>좋은 날</b>에 먼저 연락해 보세요.','상대의 말을 끝까지 들어 주는 것만으로도 인연운이 올라가요.','새로운 모임이나 취미 활동에서 인연을 만나기 쉬워요.']},
    marry:{g:'love',n:'결혼 시기',e:'💍',lqM:['財','父'],lqF:['官','父'],badM:['兄'],badF:['孫'],door:{休門:1,生門:1,開門:0.8,景門:0.5},gua:{福德:0.8,生氣:0.5,天宜:0.5},special:'years',
      kw:['결혼','언제 결혼','결혼 시기','결혼할','배우자','혼인','결혼운','시집','장가','상견례','웨딩'],
      why:'결혼은 배우자의 자리(남자는 <b>재(財)</b>, 여자는 <b>관(官)</b>)와 혼인 신고·가정이라는 문서인 <b>부(父)</b>가 힘을 받는 해를 찾아요. 그래서 올해만 보지 않고 <b>앞으로 10년의 신수</b>를 하나씩 비교해 좋은 해를 골라요.',
      v:['결혼운이 아주 강한 때예요. 마음에 둔 사람이 있다면 결혼 이야기를 꺼내기 좋아요.','결혼으로 이어질 가능성이 좋은 흐름이에요. 아래 좋은 해를 참고해 계획을 세워 보세요.','올해보다는 아래 좋은 해에 힘이 더 실려요. 지금은 관계를 단단히 다지는 시간으로 쓰세요.','올해는 결혼보다 나를 다지는 해예요. 서두르기보다 아래 좋은 해를 기다려 보세요.'],
      tips:['결혼 날짜는 위의 <b>좋은 해</b>와 <b>좋은 달</b> 안에서 고르면 좋아요.','상견례나 중요한 이야기는 위의 <b>좋은 날</b>에 해 보세요.','두 사람의 궁합도 궁합 탭에서 함께 확인해 보세요.']},
    reunion:{g:'love',n:'재회',e:'🔁',lqM:['財'],lqF:['官','鬼'],badM:['兄'],badF:['孫'],door:{休門:1.2,開門:0.8,景門:0.6},gua:{歸魂:1.8,遊魂:-0.8,絶命:-0.6},
      kw:['재회','다시 만날','다시 연락','헤어진','전 남친','전 여친','전남친','전여친','돌아올','붙잡','다시 사귈'],
      why:'재회는 그 사람의 자리(남자는 <b>재(財)</b>, 여자는 <b>관(官)</b>)가 <b>제자리로 돌아오는 기운인 귀혼(歸魂)</b>에 있는지, 멀어지는 기운인 <b>유혼(遊魂)</b>에 있는지를 가장 중요하게 봐요. 마음을 여는 <b>휴문</b>도 함께 봐요.',
      v:['돌아오는 기운이 강해요. 먼저 가볍게 안부를 건네면 다시 이어질 가능성이 있어요.','다시 연락이 닿을 수 있는 흐름이에요. 예전 문제를 어떻게 바꿀지 먼저 생각해 두세요.','마음은 남아 있지만 시간이 더 필요해요. 재촉하지 말고 나를 먼저 돌보세요.','멀어지는 기운이 더 강해요. 붙잡기보다 나를 위한 새 시작을 준비하는 게 좋아요.'],
      tips:['연락한다면 위의 <b>좋은 날</b>에, 짧고 가볍게 안부부터 건네세요.','헤어진 이유를 내가 어떻게 바꿀 수 있는지 먼저 정리해 보세요.','답이 없다면 더 재촉하지 마세요. 그것도 하나의 답이에요.']},
    couple:{g:'love',n:'부부·이혼',e:'🏡',lqM:['財','世'],lqF:['官','世'],badM:['兄'],badF:['孫'],door:{休門:1.2,生門:1,開門:0.6},gua:{福德:1,天宜:0.8,禍害:-1,絶命:-1.2},
      kw:['부부','남편','아내','이혼','별거','부부싸움','배우자랑','시댁','처가','와이프'],
      why:'부부 관계는 배우자의 자리(남자는 <b>재(財)</b>, 여자는 <b>관(官)</b>)와 나의 자리인 <b>세(世)</b>가 좋은 문과 자리에 있는지로 봐요. <b>화해·절명</b> 자리는 다툼을, <b>복덕·천의</b> 자리는 화합을 뜻해요.',
      v:['부부 사이에 따뜻한 기운이 들어와요. 함께 계획을 세우거나 여행을 가기 좋은 때예요.','작은 다툼은 있어도 금방 풀리는 흐름이에요. 고마움을 자주 표현하세요.','서로 지치기 쉬운 때예요. 각자의 시간과 쉼을 존중해 주면 관계가 회복돼요.','갈등이 커지기 쉬운 때예요. 큰 결정은 서두르지 말고, 상담처럼 도움을 받을 길을 찾아보세요.'],
      tips:['중요한 이야기는 피곤한 밤보다 위의 <b>좋은 날</b> 낮에 하세요.','"당신은 왜"보다 "나는 이렇게 느꼈어"로 말해 보세요.','관계가 많이 힘들다면 부부 상담처럼 전문가의 도움을 받는 것도 좋은 방법이에요.']},
    child:{g:'love',n:'자녀·임신',e:'👶',lq:['孫'],bad:['父'],door:{生門:1.5,休門:1},gua:{天宜:1,生氣:1,福德:0.5},
      kw:['자녀','임신','아기','출산','아이','자식','태몽','난임','육아'],
      why:'자녀는 <b>손(孫)</b>으로 보고, 생명이 자라는 <b>생문</b>과 <b>생기·천의</b> 자리를 함께 봐요. 손(孫)을 누르는 <b>부(父)</b>가 너무 강하면 기다림이 길어질 수 있어요.',
      v:['자녀운이 아주 좋아요. 기다리던 좋은 소식이 들리거나, 아이와의 관계가 한층 가까워지는 때예요.','자녀와 관련해 좋은 흐름이에요. 몸과 마음을 편하게 하는 게 가장 좋아요.','조금 기다림이 필요한 흐름이에요. 조급해하지 말고 생활 리듬을 챙기세요.','마음 쓸 일이 생기기 쉬워요. 걱정은 혼자 안지 말고 가족과 나누세요.'],
      tips:['임신과 건강은 꼭 병원과 상의하세요. 이 풀이는 의학적 판단을 대신하지 않아요.','몸과 마음의 쉼이 자녀운을 지켜 줘요. 잠을 충분히 자세요.','아이와는 위의 <b>좋은 날</b>에 함께하는 시간을 만들어 보세요.']},
    health:{g:'life',n:'건강',e:'🏥',lq:['孫','父'],bad:['鬼'],door:{休門:1.5,生門:1},gua:{天宜:1.5,生氣:0.5},
      kw:['건강','병','수술','몸','아파','병원','다이어트','치료','허리','스트레스','잠'],
      why:'건강은 나를 누르는 힘인 <b>귀(鬼)</b>가 어디서 강해지는지, 그것을 막아 주는 <b>손(孫)</b>과 회복을 돕는 <b>부(父)</b>가 힘이 있는지로 보고, 치유의 자리인 <b>천의</b>와 쉼의 문인 <b>휴문</b>을 함께 봐요.',
      v:['건강 흐름이 좋아요. 몸이 가볍고 회복도 빨라요. 운동을 시작하기 좋은 때예요.','대체로 괜찮아요. 무리만 하지 않으면 건강하게 지낼 수 있어요.','피로가 쌓이기 쉬워요. 잠과 식사를 규칙적으로 챙기세요.','몸이 보내는 신호를 잘 들어야 하는 때예요. 미루던 검진을 받아 보세요.'],
      tips:['이 앱은 건강 상태를 진단하지 않아요. 아픈 곳이 있으면 꼭 병원에서 확인하세요.','잠은 충분히, 휴문(쉼)의 기운을 챙기는 게 가장 좋은 보약이에요.','검진이나 치료 시작은 위의 <b>좋은 날</b>로 잡아 보세요.']},
    move:{g:'life',n:'이사·방위',e:'🏠',lq:['父'],bad:['鬼'],door:{生門:1.5,休門:1,開門:1},gua:{遊魂:0.5,生氣:0.5},dir:true,
      kw:['이사','방위','방향','이전','입주','이삿날','이사 갈','이사갈'],
      why:'이사는 집·문서·계약을 뜻하는 <b>부(父)</b>로 보고, 그해 각 방향의 문과 괘를 비교해 <b>좋은 방위</b>를 골라요. 생문·휴문·개문에 생기·천의·복덕이 겹치는 방향이 가장 좋아요.',
      v:['이사하기 아주 좋은 때예요. 새집에서 일이 잘 풀리고 집안에 좋은 기운이 들어와요.','이사해도 좋은 때예요. 아래 좋은 방위와 좋은 날을 고르면 더 좋아요.','큰 문제는 없지만 서두를 필요는 없어요. 방위와 날짜를 잘 고르면 무난해요.','큰 이사보다 집 안 정리나 수리로 기운을 바꾸는 게 좋은 때예요. 꼭 옮겨야 하면 좋은 방위를 꼭 지키세요.'],
      tips:['계약서는 도장 찍기 전에 등기와 특약을 꼭 확인하세요. 문서(父)가 이사운의 중심이에요.','이삿날은 위의 <b>좋은 날</b> 중에서 고르세요.','새집에 들어가면 창문을 열어 환기부터 하고, 현관을 밝게 해 두세요.']},
    travel:{g:'life',n:'해외·유학·여행',e:'✈️',lq:['孫','父'],bad:['鬼'],door:{開門:1,休門:1,生門:0.6},gua:{遊魂:1},dir:true,
      kw:['여행','출장','해외','유학','이민','휴가','비행기','워홀','워킹홀리데이','어학연수'],
      why:'해외와 여행은 바깥 활동과 즐거움인 <b>손(孫)</b>, 비자·서류·공부인 <b>부(父)</b>로 보고, 움직임의 자리인 <b>유혼</b>과 길이 열리는 <b>개문</b>이 있는 방향을 좋은 방위로 봐요.',
      v:['떠나기 아주 좋은 때예요. 여행·유학·출장에서 좋은 인연과 기회를 만나요.','즐겁게 다녀올 수 있어요. 유학이나 해외 일도 준비한 만큼 잘 풀려요.','무난해요. 일정과 서류는 넉넉하게 준비하세요.','이동 중 변수가 생기기 쉬워요. 일정과 서류, 보험을 꼼꼼히 챙기세요.'],
      tips:['여권, 비자, 보험은 출발 전에 두 번 확인하세요.','위의 <b>좋은 방위</b> 쪽 나라나 지역이 더 잘 맞아요.','출발이나 서류 제출은 <b>좋은 날</b>로 잡아 보세요.']},
    people:{g:'life',n:'대인관계·귀인',e:'🫂',lq:['父','兄'],bad:['鬼'],door:{休門:1.5,開門:0.8,生門:0.6},gua:{天宜:0.8,福德:0.8},special:'people',dir:true,
      kw:['귀인','대인관계','인간관계','사람 관계','동료','상사','인복','도와줄','은인','사람 복','친구 관계','왕따','사람들이'],
      why:'대인관계는 나를 도와주는 윗사람·귀인을 뜻하는 <b>부(父)</b>와 친구·동료를 뜻하는 <b>형(兄)</b>이 좋은 자리에 있는지로 보고, 귀인의 도움을 뜻하는 <b>휴문</b>과 <b>천의·복덕</b> 자리를 함께 봐요. 여기에 태어난 날로 정해지는 <b>천을귀인</b>의 띠를 더해 나를 도울 사람을 찾아요.',
      v:['인복이 아주 좋은 때예요. 먼저 손 내미는 사람이 많고, 귀인의 도움으로 일이 쉽게 풀려요.','좋은 사람을 만나기 쉬운 때예요. 모임이나 소개 자리에 적극적으로 나가 보세요.','관계는 무난해요. 먼저 연락하고 챙기는 만큼 인복이 커져요.','오해나 서운함이 생기기 쉬운 때예요. 말을 아끼고, 믿을 만한 몇 사람에게 마음을 모으세요.'],
      tips:['위의 <b>귀인 띠</b>인 사람에게 고민을 털어놓아 보세요. 뜻밖의 도움을 받을 수 있어요.','조심할 띠인 사람과는 돈 거래나 큰 약속을 피하고, 거리를 적당히 두세요.','감사 인사는 그날 바로, 짧게라도 전하세요. 그게 가장 좋은 인복을 만드는 습관이에요.']},
    samjae:{g:'flow',n:'삼재',e:'🌀',lq:['世'],bad:['鬼'],special:'samjae',
      kw:['삼재','들삼재','눌삼재','날삼재','복삼재'],
      why:'<b>삼재</b>는 12년마다 돌아오는 <b>3년 동안의 조심할 때</b>예요. 태어난 해의 띠로 정해지고, 들어오는 해(들삼재), 머무는 해(눌삼재), 나가는 해(날삼재)로 나눠요. 같은 삼재라도 그해 신수가 좋으면 오히려 복이 되는 <b>복삼재</b>로 봐요.',
      v:['삼재가 아니고, 그해 흐름도 좋아요. 마음 놓고 계획한 일을 펼쳐도 되는 해예요.','삼재가 아니에요. 큰 걱정 없이 지내도 되는 해예요.','삼재가 드는 해예요. 겁먹을 필요는 없지만, 큰 결정과 안전에는 평소보다 신경 쓰세요.','삼재 중에서도 조심할 일이 많은 해예요. 큰 투자·계약·이동은 신중하게, 건강과 안전을 먼저 챙기세요.'],
      tips:['삼재는 "무조건 나쁜 해"가 아니라 "한 번 더 확인하는 해"예요. 서두르지만 않으면 괜찮아요.','큰 계약이나 투자는 서류를 두 번 확인하고, 운전과 안전에 신경 쓰세요.','건강 검진을 받고, 무리한 일정은 줄이세요.']},
    caution:{g:'flow',n:'올해 조심할 것',e:'⚠️',lq:['世'],bad:['鬼','兄'],special:'caution',
      kw:['조심','주의','올해 운','안 좋은','액운','피해야','나쁜 일','신수','올해 어때','내년 어때','한 해 운','올해 운세'],
      why:'그해 <b>신수국</b>에서 나를 누르는 <b>귀(鬼)</b>, 돈을 나눠 가는 <b>형(兄)</b>, 힘이 빠지는 <b>공망</b>, 한 해의 큰일이 일어나는 <b>행년궁</b>의 문과 자리를 살펴 위험 신호를 모아요. 그해의 띠와 내 사주가 부딪히는지(세운 충)와 <b>삼재</b>도 함께 봐요.',
      v:['큰 위험 신호가 거의 없는 해예요. 계획한 일을 자신 있게 밀고 나가세요.','조심할 것이 한두 가지 있어요. 아래 내용만 챙기면 무난하게 보낼 수 있어요.','조심할 것이 몇 가지 겹치는 해예요. 아래 항목을 미리 알고 대비하면 충분히 피할 수 있어요.','신경 쓸 일이 많은 해예요. 큰 결정은 천천히, 아래 항목을 하나씩 점검하며 지내세요.'],
      tips:['조심할 달에는 큰 계약·투자·이사를 피하고, 좋은 달로 미루세요.','피할 방위로의 이사나 장거리 이동은 가능하면 미루세요.','건강·안전·돈 문제는 미리 점검하면 대부분 피할 수 있어요. 겁먹기보다 준비하세요.']},
    law:{g:'life',n:'다툼·소송',e:'⚖️',lq:['官','父'],bad:['鬼','兄'],door:{開門:1,休門:1},doorX:{驚門:-1.5,傷門:-1},
      kw:['소송','재판','다툼','분쟁','고소','합의','법','변호사','싸움','관재','경찰'],
      why:'다툼과 소송은 판단하는 쪽인 <b>관(官)</b>과 서류·증거인 <b>부(父)</b>가 내 편인지, 나를 누르는 <b>귀(鬼)</b>와 경쟁자인 <b>형(兄)</b>이 강한지로 보고, 송사의 문인 <b>경문(驚門)</b>을 조심해서 봐요.',
      v:['유리한 흐름이에요. 증거와 서류를 잘 갖추면 원하는 결과를 얻기 쉬워요.','해볼 만해요. 다만 감정보다 서류와 사실로 대응하세요.','결과가 반반이에요. 끝까지 가기보다 합의를 함께 생각해 보세요.','불리할 수 있는 흐름이에요. 맞서기보다 합의나 조정으로 피해를 줄이는 게 좋아요.'],
      tips:['말보다 기록이 힘이에요. 문자, 계약서, 영수증을 모아 두세요.','중요한 판단은 꼭 변호사 같은 전문가와 상의하세요.','감정이 올라올 때는 바로 답하지 말고 하루 뒤에 답하세요.']},
    gen:{g:'none',n:'그 일',e:'🔮',lq:['世'],bad:['鬼'],door:{生門:1,開門:1,休門:0.8,景門:0.5},gua:{生氣:0.5,福德:0.5,天宜:0.5},kw:[],
      why:'딱 맞는 주제가 없는 질문은 <b>나 자신의 자리(세, 世)</b>가 그해 어떤 문과 자리에 있는지, 나를 누르는 <b>귀(鬼)</b>가 강한지로 큰 흐름을 봐요.',
      v:['지금 내 기운이 아주 좋아요. 마음먹은 일을 밀고 나가도 되는 때예요.','내 기운이 좋은 편이에요. 준비한 만큼 결과가 따라와요.','내 기운이 반반이에요. 서두르지 말고 한 번 더 따져 보세요.','지금은 내 기운이 눌려 있어요. 큰 결정은 미루고 힘을 모으세요.'],
      tips:['결정은 좋은 날 낮에, 마음이 편할 때 하세요.','믿을 만한 사람 한 명에게 먼저 의견을 물어보세요.','결정 전에 최악의 경우를 한 번 적어 보세요. 감당할 수 있으면 해도 돼요.']}
  };
  const GROUPS=[['work','📚 공부·일'],['money','💰 돈'],['love','💕 사랑·가족'],['life','🌿 생활'],['flow','🔮 한 해 운']];

  const BRS='子丑寅卯辰巳午未申酉戌亥',ANI=['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
  const SAMJAE=[[[8,0,4],[2,3,4]],[[2,6,10],[8,9,10]],[[5,9,1],[11,0,1]],[[11,3,7],[5,6,7]]];
  const STG=['들삼재','눌삼재','날삼재'];
  const Y0now=()=>new Date().getFullYear();
  function samjaeOf(yb,Y){const g=SAMJAE.find(x=>x[0].includes(yb));const zb=BRS.indexOf(yearGZ(Y)[1]);const k=g[1].indexOf(zb);return k;}
  const TIANYI={甲:[1,7],戊:[1,7],庚:[1,7],乙:[0,8],己:[0,8],丙:[11,9],丁:[11,9],辛:[2,6],壬:[3,5],癸:[3,5]};
  const LIUHE2=[[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]],WONJIN2=[[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];
  const pin=(L,a,c)=>L.some(([x,y])=>(x===a&&y===c)||(x===c&&y===a));
  const ORDER=Object.keys(T);
  // 직접 입력 낱말 찾기: 더 구체적인 주제부터
  const MATCH=['samjae','reunion','couple','marry','child','invest','estate','loan','partner','jobget','jobmove','promo','career','exam','biz','money','love','health','move','travel','law','people','caution'];
  const jo=(w,a,c)=>{const ch=String(w).replace(/[^가-힣]/g,'').slice(-1);if(!ch)return c;return ((ch.charCodeAt(0)-0xAC00)%28)?a:c;};
  const dirOf=p=>{const m=/\((.+)\)/.exec(PK[p]);return m?m[1]+'쪽':'가운데';};
  const P2=v=>String(v).padStart(2,'0');
  function topicLq(t){const D=T[t];if(D.lqM){const m=base.input.sex==='M';return [m?D.lqM:D.lqF,(m?D.badM:D.badF)||[]];}return [D.lq,D.bad||[]];}
  function pScore(r,p,t){
    if(p===5)return 0;const D=T[t];let s=0;const d=r.door[p],g=r.gua[p];
    s+=(D.door&&D.door[d]!=null)?D.door[d]:(D.doorX&&D.doorX[d]!=null?D.doorX[d]:(DOOR0[d]||0));
    s+=(D.gua&&D.gua[g]!=null)?D.gua[g]+(GUA0[g]||0)*0.5:(GUA0[g]||0);
    if(r.kong.has(p))s-=1.2;
    return s;
  }
  function chartScore(r,t){
    const [lq,bad]=topicLq(t);let S=0,W=0;const hits=[];
    for(let p=1;p<=9;p++){
      lq.forEach((q,i)=>{const w=i===0?1:0.7;
        if(r.lqH[p]===q){S+=w*(1+pScore(r,p,t));W+=w;hits.push({p,q,layer:'겉',w,ps:pScore(r,p,t)});}
        if(r.lqE[p]===q){S+=0.6*w*(1+pScore(r,p,t));W+=0.6*w;hits.push({p,q,layer:'속',w:0.6*w,ps:pScore(r,p,t)});}
      });
      if(bad.includes(r.lqH[p])){const ps=pScore(r,p,t);if(ps>0)S-=0.35*ps;}
    }
    const se=[r.sePal,r.seHeavPal];hits.forEach(h=>{if(se.includes(h.p))S+=0.3;});
    return {s:W?S/W:0,hits:hits.sort((a,b)=>(b.w*(1+b.ps))-(a.w*(1+a.ps)))};
  }
  const grade=s=>s>=1.42?0:s>=0.95?1:s>=0.37?2:3;
  const GR=[['아주 좋아요','g3'],['좋아요','g2'],['보통이에요','g1'],['조심할 때예요','g0']];
  function palaceLine(r,h,t){
    const p=h.p,d=r.door[p],g=r.gua[p];
    let s='<b>'+LQK[h.q]+'</b>의 기운이 <b>'+dirOf(p)+' 칸</b>에 '+(h.layer==='겉'?'겉으로 드러나':'바탕에 깔려')+' 있어요.';
    if(p!==5){s+=' 이 칸의 문은 <b>'+DK[d]+'</b>('+DM[d].replace(/\.$/,'')+'), 자리는 <b>'+GK[g]+'</b>('+GU[g].replace(/\.$/,'')+')'+jo(GK[g],'이에요','예요')+'.';}
    if(r.kong.has(p))s+=' 다만 공망이라 힘이 덜 실려요. 기대를 조금 낮추고 차근차근 가세요.';
    return s;
  }
  let curT=null,yrOff=0,lastQ='',abQ=null,hist=[],curHtml='',histBase=null;
  // ── 대화형 답변: 기와 도깨비 영감 말투(하게체), 결론 먼저 ──
  const escH=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const PLQ={父:'문서·도움',官:'직장·명예',財:'돈',孫:'재능·즐거움',兄:'경쟁·친구',鬼:'압박',世:'자네'};
  const PDOOR={休門:['쉬면서 도움을 받는 문',1],生門:['돈과 일이 자라는 문',1],開門:['새 길이 열리는 문',1],景門:['이름이 드러나는 문',0.5],杜門:['꽉 막힌 문',-1],傷門:['다툼이 생기는 문',-1],驚門:['놀랄 일이 생기는 문',-1],死門:['멈춰 서는 문',-1]};
  const ACT={exam:'시험 도전',jobget:'지원',jobmove:'옮기는 것',promo:'승진 도전',invest:'투자',estate:'사고파는 것',biz:'시작하는 것',partner:'동업·계약',loan:'돈 빌려주는 것',love:'다가가는 것',marry:'결혼 이야기',reunion:'다시 연락하는 것',move:'이사',travel:'떠나는 것',law:'맞서는 것',gen:'그 일',child:'아이 계획',health:'치료·운동 시작'};
  const EMO=/힘들|힘드|지쳐|지친|지치|우울|속상|외로|외롭|불안|걱정|답답|짜증|슬퍼|슬프|무서|괴로|눈물|화나|화가|미치겠|막막|서러|서럽|후회/;
  function qkind(q){q=q||'';
    if(/vs|VS|아니면|또는|말까|중에 ?뭐|중 ?어느|어느 ?쪽이|뭐가 ?나을/.test(q)||(q.match(/까(?=[\s?？,.!~]|$)/g)||[]).length>=2)return 'ab';
    if(/언제|몇 ?월|며칠|시기|때가|날짜/.test(q))return 'when';
    if(/될까|할까|해도|괜찮|좋을까|맞을까|갈까|살까|팔까|붙을까|풀릴까|되나요|돼요\?|할 수 있|가능/.test(q))return 'yn';
    return 'gen';}
  function opener(q,kind){
    if(/안녕|반가|하이/.test(q))return '허허, 반갑네. 이 늙은이를 찾아 줬구먼.';
    if(EMO.test(q))return '에구, 그랬는가. 속이 많이 상했겠구먼. 이리 와 앉아 보게.';
    if(/싸웠|싸워|다퉜|다투|헤어졌|헤어지/.test(q))return '저런, 마음이 편치 않겠구먼. 어디 한번 보세.';
    if(kind==='ab')return '허허, 두 갈래 길이라… 어디 한번 견줘 보세.';
    if(kind==='when')return '때를 묻는구먼. 어디 보자…';
    return '어디 보자… 자네 사주를 펴 놓고 보니,';}
  const UN={couple:'부부운',people:'인복',career:'진로운',law:'송사운',travel:'여행·이동운',move:'이사운',child:'자녀운',health:'건강운',money:'재물운',invest:'투자운',estate:'부동산운',biz:'사업운',partner:'동업운',loan:'돈거래운',love:'연애운',marry:'결혼운',reunion:'재회운',exam:'시험운',jobget:'취업운',jobmove:'이직운',promo:'직장운'};
  const unOf=D=>{const k=Object.keys(T).find(x=>T[x]===D);return UN[k]||(/운$|시기$|것$|삼재$/.test(D.n)?D.n:D.n+'운');};
  const nmOf=D=>D.special==='caution'?'조심할 것':D.n;
  const plainTip=s=>s.replace(/위의 /g,'').replace(/아래 /g,'').replace(/<b>좋은 (날|달|방위|해)<\/b>/g,'좋은 $1');
  const md=([dt])=>(dt.getMonth()+1)+'월 '+dt.getDate()+'일('+'일월화수목금토'[dt.getDay()]+')';
  function reasonOf(K,gi,D){const lqn=q=>D&&D.g==='love'&&(q==='財'||q==='官')?'인연·배우자':PLQ[q];
    const n=K.nat.s;let s=n>=0.95?'자네는 타고나기를 이쪽 복이 있는 사람이고, ':n<0.37?'타고난 복보다는 제 손으로 만들어 가는 운이라, ':'';
    const hs=K.yr.hits.filter(x=>x.p!==5);const dv=x=>(PDOOR[K.rs.door[x.p]]||['',0])[1]-(K.rs.kong.has(x.p)?1:0);
    const h=gi<=1?hs.slice().sort((a,b)=>dv(b)-dv(a))[0]:hs.slice().sort((a,b)=>dv(a)-dv(b))[0];
    if(h){const d=PDOOR[K.rs.door[h.p]]||['',0];
      s+=K.Y+'년에는 <b>'+lqn(h.q)+' 기운</b>이 <b>‘'+d[0]+'’</b>에 들어앉아 있어서 '+(d[1]>0?'일이 술술 풀리는 쪽일세.':d[1]<0?'애쓴 만큼 안 나올 수 있네.':'드러나긴 하는데 힘은 보통일세.');
      if(K.rs.kong.has(h.p))s+=(d[1]<0?' 게다가':' 다만')+' 그 자리가 비어 있어서 기대보다 작게 올 수 있네.';
      if(gi>=2&&d[1]>0&&!K.rs.kong.has(h.p))s+=' 좋은 낌새는 있네만, 통틀어 보면 아직 힘이 모자라네.';
      if(gi<=1&&d[1]<0)s+=' 그래도 다른 자리에서 받쳐 주는 힘이 더 크다네.';}
    else s+=K.Y+'년에는 이 일의 기운이 뚜렷하지 않네. 운보다 자네 준비가 결과를 정할 걸세.';
    return '🔍 <b>왜 그러냐면</b> · '+s;}
  function whenOf(K){
    let s='';if(K.good&&K.good.length)s+='음력 <b>'+K.good.join('·')+'월</b>이 제일 좋네.';else s+='딱히 센 달은 없네. 꾸준한 게 답일세.';
    if(K.days&&K.days.length)s+=' 가까운 날로는 <b>'+K.days.slice(0,3).map(md).join(', ')+'</b>이 좋고.';
    if(K.badm&&K.badm.length)s+=' 음력 '+K.badm.join('·')+'월은 피하게.';
    if(K.best)s+=' 앞으로 10년 중에는 <b>'+K.best.join('·')+'년</b>이 가장 좋다네.';
    return '📅 <b>언제가 좋으냐면</b> · '+s;}
  const SCEN=['지금 움직이면 1년 뒤에 “그때 하길 참 잘했다” 할 걸세.','준비한 만큼 1년 뒤 손에 쥐는 게 있을 걸세.','서두르면 반쯤 만족이고, 석 달만 더 다지고 하면 훨씬 낫네.','지금 밀어붙이면 1년 뒤에 후회가 남기 쉽네. 대신 지금 준비해 두면 다음 좋은 때에 크게 쓰일 걸세.'];
  function talk(t,D,gi,K){
    const kind=qkind(lastQ),act=ACT[t],sp=D.special==='caution'||D.special==='samjae',emo=EMO.test(lastQ||'');
    let v;
    if(sp)v=D.e+' '+hage(D.v[gi]);
    else if(emo&&t==='gen')v=gi<=1?'💛 <b>그래도 올해 자네 기운은 나쁘지 않네.</b> 지금 힘든 건 지나가는 바람일세. 조금만 숨 고르면 다시 일어설 수 있네.':'💛 <b>올해가 자네한테 좀 무거운 해라 그렇다네.</b> 자네가 못나서가 아닐세. 이럴 땐 큰일 벌이지 말고, 잘 먹고 잘 자는 게 제일일세.';
    else if(kind==='yn'||(act&&kind!=='when')){const a=act||D.n;
      v=[['👍','해 보게! 지금이 딱 그때일세.',' 올해는 '+a+'에 기운이 실리는 해일세.'],['🙆','해 볼 만하네.',' 준비만 단단히 하면 결과가 따라올 걸세.'],['🤔','반반일세.',' 서두르지 말고 한 번만 더 따져 보게.'],['✋','지금은 말리고 싶네.',' '+a+jo(a,'은','는')+' 조금 미뤄 두게.']][gi];
      v=v[0]+' <b>'+v[1]+'</b>'+v[2];}
    else v=D.e+' <b>'+K.Y+'년 '+(t==='gen'?'자네 운':unOf(D))+jo(t==='gen'?'운':unOf(D),'은','는')+' '+['아주 좋네','좋네','그저 그렇네','조심할 때일세'][gi]+'.</b> '+hage(D.v[gi].replace(/아래 /g,''));
    let h='<p class="dkOpen">'+opener(lastQ||'',kind)+'</p><p class="ansV">'+v+'</p>';
    const W=whenOf(K);
    if(kind==='when'&&!sp)h='<p class="dkOpen">'+opener(lastQ||'',kind)+'</p><p class="ansV">'+D.e+' <b>'+D.n+jo(D.n,'이라','라')+'… 이때가 좋다네.</b></p><p>'+W+'</p><p>'+v+'</p>';
    if(!sp)h+='<p>'+reasonOf(K,gi,D)+'</p>';
    if(kind!=='when'||sp)h+='<p>'+W+'</p>';
    if(K.dir&&K.dir.length&&!sp)h+='<p>🧭 <b>어느 쪽이냐면</b> · <b>'+K.dir.join(', ')+'</b>이 좋네.'+(K.badDir&&K.badDir.length?' '+K.badDir.join(', ')+'은 피하게.':'')+'</p>';
    if(act&&!sp&&!(emo&&t==='gen'))h+='<p>🔮 <b>1년 뒤엔</b> · '+SCEN[gi]+'</p>';
    if(sp)h+='<p>🔎 조심할 것이랑 좋은 날은 아래 <b>자세한 풀이</b>에 적어 뒀네.</p>';
    h+='<p>💡 <b>이렇게 하게</b> · '+(emo&&t==='gen'?'오늘은 따뜻한 밥 한 끼 먹고 일찍 자게. 그리고 믿는 사람 한 명한테 털어놓게. 그게 제일 큰 부적일세. 많이 힘들면 혼자 참지 말고 꼭 도움을 청하게.':hage(plainTip(D.tips[0])))+'</p>';
    return h;}
  function labelOf(p){p=p.replace(/[?？!.~]+$/,'').trim();if(/^(그냥 )?말까|^안 ?할까|^말기/.test(p)||!p)return '안 하기';return p;}
  function decide(q,K){
    let parts=q.split(/\s*(?:vs\.?|VS|아니면|또는|\/)\s*/).map(s=>s.trim()).filter(Boolean);
    if(parts.length<2){const m=q.match(/^(.*?(?:까요|까))\s*(.+)$/);if(m&&m[2])parts=[m[1],m[2]];}
    if(parts.length<2)parts=[q,'안 하기'];
    parts=parts.slice(0,2);
    const opts=parts.map(p=>{const tp=MATCH.find(k=>T[k].kw.some(w=>p.includes(w)));return {lab:labelOf(p),t:tp||null};});
    if(!opts[0].t&&!opts[1].t)opts[0].t=curT;
    opts.forEach(o=>{o.s=o.t?scoreOf(o.t,K.Y):null;});
    const a=opts.find(o=>o.t),other=opts.find(o=>o!==a);
    if(!other.t||other.t===a.t){other.stay=true;other.t=null;other.s=0.95;}
    const win=opts[0].s>=opts[1].s?0:1;
    const actG=grade(a.s);
    const card=(o,i)=>{const g=o.stay?null:grade(o.s);
      const pct=Math.max(8,Math.min(100,Math.round((o.s+1.5)/4.2*100)));
      let gain,loss,yr;
      if(o.stay){if(actG<=1){gain='지금 가진 걸 안전하게 지키네.';loss='좋은 때를 놓쳐 아쉬움이 남을 수 있네.';yr='“그때 해 볼걸” 하는 마음이 남기 쉽네.';}
        else{gain='힘을 아끼고 실력을 쌓을 수 있네.';loss='당장은 좀 답답할 걸세.';yr='준비한 만큼 다음 좋은 때에 더 크게 움직일 수 있네.';}}
      else{gain=g<=1?'운이 받쳐 줘서 일이 빨리 풀리고, 새 기회와 사람이 따라오네.':'새로운 경험과 배움은 남네.';
        loss=g<=1?'처음 몇 달은 정신없이 바쁠 걸세.':'준비 없이 하면 돈과 시간이 새기 쉽네.';yr=SCEN[g];}
      return '<div class="abOpt'+(i===win?' win':'')+'"><b>'+(i===win?'✅ ':'')+'「'+escH(o.lab)+'」</b><div class="ghBar"><i style="width:'+pct+'%"></i></div>'+
        '<p>➕ <b>얻는 것</b> · '+gain+'</p><p>➖ <b>잃는 것</b> · '+loss+'</p><p>🔮 <b>1년 뒤</b> · '+yr+'</p></div>';};
    const w=opts[win];
    let h='<p class="dkOpen">'+opener(q,'ab')+'</p><p class="ansV">⚖️ <b>나 같으면 「'+escH(w.lab)+'」 쪽이네.</b> '+(Math.abs(opts[0].s-opts[1].s)<0.25?'두 길이 크게 다르지 않으니, 마음 편한 쪽을 골라도 괜찮네.':'두 길 중에 운이 더 받쳐 주는 쪽일세.')+'</p>';
    h+=opts.map(card).join('');
    if(!w.stay)h+='<p>'+whenOf(K)+'</p>';
    h+='<p>💡 <b>이렇게 하게</b> · 정하기 전에 “제일 나쁜 경우”를 한 줄 적어 보게. 감당할 만하면 해도 되고, 아니면 한 번 더 기다리게.</p>';
    return h;}
  function scoreOf(t,Y){const r=base;const rs=sinsu(yearGZ(Y));const yi=Haeseok.yearly(rs,r.input.sex,Y-r.input.y+1);
    const [lq]=topicLq(t);let ys=chartScore(rs,t).s;if(yi.out.hangPal&&lq.includes(rs.lqH[yi.out.hangPal]))ys+=0.6;return chartScore(r,t).s*0.35+ys*0.65;}
  function follow(t,D){const b=[];
    if(!abQ&&D.special!=='caution'&&D.special!=='samjae')b.push(['when','📅 언제가 제일 좋아요?']);
    b.push(yrOff===0?['next','⏭️ 내년은요?']:['now','⏮️ 올해는요?']);
    if(t!=='caution')b.push(['caution','⚠️ 올해 조심할 건요?']);
    if(!abQ&&ACT[t]&&!(t==='gen'&&EMO.test(lastQ||'')))b.push(['ab','⚖️ 할까, 말까?']);
    b.push(['home','💬 다른 얘기 할래요']);
    return '<div class="askFollow">'+b.map(([k,l])=>'<button type="button" data-f="'+k+'">'+l+'</button>').join('')+'</div>';}
  const QUICK=[['money','💰 돈 얘기','요즘 돈 문제가 궁금해요'],['love','💕 사람·인연 얘기','사람·인연 운은 어때요?'],['promo','💼 일 얘기','일은 잘 풀릴까요?'],['health','🏥 몸 얘기','건강은 괜찮을까요?'],['caution','⚠️ 올해 조심할 것','올해 조심할 건 뭐예요?'],['ab','⚖️ 고민 골라 주게',''],['talk','🙋 그냥 털어놓기','']];
  function greetHtml(){
    const age=ageNow(base);let L=['어이, 왔는가. 나는 이 집 기와 위에서 오백 년을 산 도깨비 영감일세. 자네 사주를 슬쩍 들여다봤네.'];
    try{const x=Haeseok.interpret(base,base.input.sex,age),cr=x.curRun;
      if(cr){if(cr.g>=1.5)L.push('요즘 <b>'+cr.theme+'</b> 쪽으로 기운이 차오르는 때라, 해 보고 싶은 게 많을 걸세. 이럴 땐 망설이지 말고 한 발 내디뎌 보게.');
        else if(cr.g>=0.5)L.push('요즘은 <b>'+cr.theme+'</b> 쪽으로 슬슬 바람이 부는 때일세. 차근차근 가면 손에 쥐는 게 있을 걸세.');
        else if(cr.g>-1)L.push('요즘은 <b>'+cr.theme+'</b> 쪽 일이 마음을 차지하는 때일세. 크게 좋지도 나쁘지도 않으니, 너무 애태우지 말고 차근차근 가게.');
        else{const nx=x.runs.find(u=>u.from>age&&u.g>=1);L.push('요즘 많이 지쳤지? 지금은 <b>'+cr.theme+'</b> 쪽 일로 짐이 무거운 때라네. 몸을 낮추고 조금만 버티게.'+(nx?' 이 고비만 넘기면 <b>'+nx.from+'세</b>부터 숨통이 트일 걸세.':''));}}}catch(e){}
    L.push('무엇이 궁금한가? 돈 얘기든 사람 얘기든, 편하게 털어놓게.');
    return '<div class="bub dk"><span class="av">👹</span><div>'+L.map((t,i)=>'<p'+(i===0?' class="dkOpen"':'')+'>'+t+'</p>').join('')+'<div class="dkQuick">'+QUICK.map(([k,l])=>'<button type="button" data-qk="'+k+'">'+l+'</button>').join('')+'</div></div></div>';}

  function render(){
    const out=$('askOut');if(!base){out.innerHTML='';return;}
    if(histBase!==base){hist=[];histBase=base;curT=null;abQ=null;}
    const showAll=()=>{out.innerHTML=hist.map(x=>'<div class="old">'+x+'</div>').join('')+'<div class="cur">'+curHtml+'</div>';out.querySelectorAll('.old .askFollow,.old .dkQuick').forEach(x=>x.remove());if(window.__hangulize)window.__hangulize(out);};
    if(!curT){curHtml=greetHtml();showAll();return;}
    const t=curT,D=T[t],r=base;const Y=new Date().getFullYear()+yrOff;
    const rs=sinsu(yearGZ(Y));const yi=Haeseok.yearly(rs,r.input.sex,Y-r.input.y+1);
    const nat=chartScore(r,t),yr=chartScore(rs,t);const K={nat,yr,rs,Y};
    const [lq]=topicLq(t);
    let ys=yr.s;if(yi.out.hangPal&&(lq.includes(rs.lqH[yi.out.hangPal])))ys+=0.6;
    let total=nat.s*0.35+ys*0.65;let gi=grade(total);let special='';
    if(D.special==='samjae'){
      const yb=BRS.indexOf(r.pillars[0][1]);const k=samjaeOf(yb,Y);const sg=pScore(rs,rs.sePal,t)+pScore(rs,rs.seHeavPal,t)*0.5;
      if(k<0){gi=sg>0.6?0:1;}else{gi=sg>0.6?2:(k===1?3:2);}
      if(k>=0&&sg>0.6)total=Math.max(total,0.7);
      const ani=ANI[yb];
      special+='<h4>🐾 나의 삼재</h4><p><b>'+ani+'띠</b>는 <b>'+SAMJAE.find(x=>x[0].includes(yb))[1].map(z=>ANI[z]).join('·')+'띠 해</b>에 삼재가 들어요.</p>';
      if(k>=0)special+='<p><b>'+Y+'년은 '+STG[k]+'</b>예요. '+['삼재가 들어오는 해라 새로 벌이는 일에 변수가 생기기 쉬워요.','삼재가 가장 깊이 머무는 해라 건강과 안전, 큰돈 문제를 특히 조심해요.','삼재가 나가는 해라 마무리를 잘하면 다음 해부터 운이 풀려요.'][k]+(sg>0.6?' 다만 그해 나의 자리(세궁)의 문과 자리가 좋아서 <b>복삼재</b>로 볼 수 있어요. 조심하되 기회도 잡을 수 있는 해예요.':'')+'</p>';
      else special+='<p><b>'+Y+'년은 삼재가 아니에요.</b></p>';
      let ns=null;for(let yy=Y0now();yy<Y0now()+13;yy++){const kk=samjaeOf(yb,yy);if(kk===0){ns=yy;break;}}
      if(k>=0)special+='<p>이번 삼재: <b>'+(Y-k)+'~'+(Y-k+2)+'년</b> ('+(Y-k)+' 들삼재 · '+(Y-k+1)+' 눌삼재 · '+(Y-k+2)+' 날삼재)</p>';
      if(ns)special+='<p>다음 삼재: <b>'+ns+'~'+(ns+2)+'년</b> ('+ns+' 들삼재 · '+(ns+1)+' 눌삼재 · '+(ns+2)+' 날삼재)</p>';
    }
    if(D.special==='caution'){
      const risks=[];const dk=p=>DK[rs.door[p]]||'';const bad=d=>['傷門','驚門','死門','杜門'].includes(d);const badg=g=>['絶命','禍害','絶體'].includes(g);
      for(let p=1;p<=9;p++){
        if(rs.lqH[p]==='鬼'&&p!==5)risks.push(['🏥','건강·압박',dirOf(p)+' 칸에 나를 누르는 귀(鬼)가 '+(bad(rs.door[p])||badg(rs.gua[p])?'<b>'+dk(p)+'·'+GK[rs.gua[p]]+'</b>'+jo(GK[rs.gua[p]],'과','와')+' 함께 있어요. 과로, 사고, 윗사람·관공서와의 마찰을 조심하세요.':'있어요. 무리하면 몸과 마음이 지치기 쉬우니 쉼을 챙기세요.'),bad(rs.door[p])||badg(rs.gua[p])?2:1]);
        if(rs.lqH[p]==='兄'&&p!==5&&(pScore(rs,p,t)>0.3||rs.lqE[p]==='兄'))risks.push(['💸','돈 나감',dirOf(p)+' 칸에 형(兄)의 힘이 커요. 지출, 보증, 돈 빌려주기, 경쟁자에게 돈이 새기 쉬워요.',1]);
        if(rs.kong.has(p)&&['財','官'].includes(rs.lqH[p]))risks.push(['🫥','헛된 기대',dirOf(p)+' 칸의 '+LQK[rs.lqH[p]]+' 기운이 공망이에요. 크게 기대한 '+(rs.lqH[p]==='財'?'돈':'자리')+'이 생각보다 작을 수 있으니 계획을 넉넉히 잡으세요.',1]);
      }
      const hp=yi.out.hangPal;if(hp&&hp!==5&&(bad(rs.door[hp])||badg(rs.gua[hp])))risks.push(['🌀','한 해의 큰일',Y+'년의 큰일이 드러나는 '+dirOf(hp)+' 칸이 <b>'+dk(hp)+'·'+GK[rs.gua[hp]]+'</b> 자리예요. 큰 변화가 생기면 서두르지 말고 한 번 더 확인하세요.',2]);
      const yzb=BRS.indexOf(yearGZ(Y)[1]),db=BRS.indexOf(r.pillars[2][1]),ybb=BRS.indexOf(r.pillars[0][1]);
      if((yzb+6)%12===db)risks.push(['🔄','생활 변동',Y+'년의 띠가 내 생활의 자리(일지)와 부딪혀요(세운 충). 이사, 이직, 이별처럼 생활이 흔들리는 일이 생기기 쉬워요.',2]);
      if((yzb+6)%12===ybb)risks.push(['👪','가족·윗사람',Y+'년의 띠가 내 띠와 부딪혀요. 부모님이나 윗사람의 일로 마음 쓸 일이 생기기 쉬워요.',1]);
      const k=samjaeOf(ybb,Y);if(k>=0)risks.push(['🐾','삼재',Y+'년은 '+STG[k]+'예요. 큰 결정과 안전에 평소보다 신경 쓰세요.',k===1?2:1]);
      const w=risks.reduce((a,x)=>a+x[3],0);gi=w===0?0:w<=2?1:w<=5?2:3;
      total=[1.6,1.1,0.6,0][gi];
      special+='<h4>⚠️ '+Y+'년 조심할 것</h4>'+(risks.length?risks.map((x,i2)=>'<p>'+(i2+1)+'. '+x[0]+' <b>'+x[1]+'</b> · '+x[2]+'</p>').join(''):'<p>뚜렷한 위험 신호가 없어요. 평소처럼 성실하게 지내면 충분해요.</p>');
    }
    if(D.special==='people'){
      const dg=r.pillars[2][0];const ty=TIANYI[dg].map(z=>ANI[z]+'띠');const db=BRS.indexOf(r.pillars[2][1]);
      const hap=[];for(let z=0;z<12;z++)if(pin(LIUHE2,db,z))hap.push(ANI[z]+'띠');
      let ch=[ANI[(db+6)%12]+'띠'];for(let z=0;z<12;z++)if(pin(WONJIN2,db,z))ch.push(ANI[z]+'띠');ch=ch.filter(x=>!ty.includes(x));
      special+='<h4>🌟 나의 귀인</h4><p><b>귀인 띠: '+ty.join(', ')+'</b> · 태어난 날의 천간으로 정해지는 <b>천을귀인</b>이에요. 어려울 때 결정적으로 도와주는 사람이 이 띠에서 나오기 쉬워요.</p>';
      special+='<p><b>마음이 잘 맞는 띠: '+hap.join(', ')+'</b> · 내 생활의 자리(일지)와 합을 이뤄 함께 있으면 편한 사람이에요.</p>';
      if(ch.length)special+='<p>조심할 띠: <b>'+ch.join(', ')+'</b> · 부딪히거나(충) 서운함이 쌓이기 쉬운(원진) 관계예요. 나쁜 사람이라는 뜻이 아니라, 돈 거래나 큰 약속만 조심하면 돼요.</p>';
    }
    const pct=Math.max(8,Math.min(100,Math.round((total+1.5)/4.2*100)));
    let h='';
    h+='<div class="askHead" data-s="'+total.toFixed(2)+'"><span class="em">'+D.e+'</span><div><b>'+Y+'년 '+(D.special==='caution'?'조심할 것':D.special==='samjae'?'삼재':D.n+' 운')+'</b><span class="ghPill '+GR[gi][1]+'">'+GR[gi][0]+'</span></div></div>';
    h+='<div class="ghBar"><i style="width:'+pct+'%"></i></div>';
    h+='<p class="askV">'+D.v[gi]+'</p>';
    h+='<h4>🔍 이렇게 봤어요</h4><p>'+D.why+'</p>';
    h+=special;
    const skipNat=D.special==='samjae'||D.special==='caution';
    // 타고난 운
    if(!skipNat){h+='<h4>🌱 타고난 '+D.n+' 운</h4>';
    const nh=nat.hits.slice(0,2);
    if(!nh.length)h+='<p>원명국에서 이 주제의 기운이 뚜렷하게 드러나지 않아요. 타고난 힘보다 그해의 운과 노력이 더 크게 작용하는 편이에요.</p>';
    nh.forEach(x=>{h+='<p>'+palaceLine(r,x,t)+'</p>';});
    if(nh[0]){const p=nh[0].p,[e0,e1]=r.ageE[p],[h0,h1]=r.ageH[p],age=Y-r.input.y+1;
      const rg=(a,c)=>a===c?a+'세':a+'~'+c+'세';h+='<p>이 칸의 운이 힘을 받는 나이는 <b>'+rg(e0,e1)+'</b>, <b>'+rg(h0,h1)+'</b>예요.'+((age>=e0&&age<=e1)||(age>=h0&&age<=h1)?' <b>바로 지금이 그 시기예요.</b>':'')+'</p>';}
    }
    // 그해 흐름
    if(!skipNat){
    h+='<h4>📅 '+Y+'년 흐름</h4>';
    const yh=yr.hits.slice(0,2);
    if(!yh.length)h+='<p>'+Y+'년 신수에서는 이 주제의 기운이 약하게 들어와요. 큰 변화보다 준비하는 해로 쓰면 좋아요.</p>';
    yh.forEach(x=>{h+='<p>'+palaceLine(rs,x,t)+'</p>';});
    if(yi.out.hangPal){const hp=yi.out.hangPal;h+='<p>'+Y+'년의 큰일은 <b>'+dirOf(hp)+' 칸</b>에서 드러나요'+(lq.includes(rs.lqH[hp])?'. 바로 <b>'+D.n+'</b>'+jo(D.n,'과','와')+' 관련된 자리라, 올해 이 일이 한 해의 중심이 돼요.':'. '+D.n+jo(D.n,'은','는')+' 한 해의 중심 사건보다는 곁가지로 흘러가요.')+'</p>';}
    }
    if(D.special==='years'){
      const Y0=new Date().getFullYear();const ys2=[];
      for(let yy=Y0;yy<Y0+10;yy++){try{const rsx=sinsu(yearGZ(yy));const yix=Haeseok.yearly(rsx,r.input.sex,yy-r.input.y+1);let sc=chartScore(rsx,t).s;if(yix.out.hangPal&&lq.includes(rsx.lqH[yix.out.hangPal]))sc+=0.6;ys2.push([yy,sc,yearGZ(yy)]);}catch(e){}}
      const best=ys2.slice().sort((a,b2)=>b2[1]-a[1]).slice(0,3).sort((a,b2)=>a[0]-b2[0]);K.best=best.map(x=>x[0]);const worst=ys2.slice().sort((a,b2)=>a[1]-b2[1]).slice(0,2).sort((a,b2)=>a[0]-b2[0]);
      h+='<h4>💒 앞으로 10년 중 좋은 해</h4><p>'+best.map(([yy,sc,gz])=>'<b>'+yy+'년('+gz+'년, '+(yy-r.input.y+1)+'세)</b>').join(', ')+'</p>';
      h+='<p>이 해에는 배우자의 자리와 가정의 문서가 함께 힘을 받아요. 결혼이나 약혼, 상견례 같은 큰일을 이때로 잡아 보세요.</p>';
      h+='<p class="note">조금 천천히 가도 좋은 해: '+worst.map(([yy])=>yy+'년').join(', ')+'</p>';
    }
    if(D.special==='career'){
      const W={};for(let p=1;p<=9;p++){[[r.lqH[p],1],[r.lqE[p],0.6]].forEach(([q,w])=>{if(q&&q!=='世')W[q]=(W[q]||0)+w*(1+Math.max(0,pScore(r,p,t))*0.5);});}
      const top=Object.entries(W).sort((a,b2)=>b2[1]-a[1]).slice(0,2).map(x=>x[0]);
      const F={官:'공무원, 공공기관, 대기업 관리직, 경찰·군인, 법무처럼 조직과 규칙 속에서 인정받는 일',財:'사업, 영업, 금융·회계, 유통·무역처럼 돈의 흐름을 다루고 성과가 숫자로 보이는 일',孫:'예술·디자인, 콘텐츠·방송, 요리, 기술·개발, 교육·서비스처럼 재능과 표현을 살리는 일',父:'연구, 교육, 출판·기록, 부동산·자격증 전문직처럼 지식과 문서를 다루는 일',兄:'프리랜서, 스포츠, 협업 프로젝트, 중개처럼 사람들과 어울려 함께 해내는 일',鬼:'의료·보건, 보안·안전, 위기 관리처럼 어려움을 다루고 사람을 지키는 일'};
      const E={甲:'목',乙:'목',丙:'화',丁:'화',戊:'토',己:'토',庚:'금',辛:'금',壬:'수',癸:'수'};
      const EF={목:'교육·출판·디자인·환경처럼 기르고 키우는 분야',화:'방송·광고·IT·공연처럼 드러내고 알리는 분야',토:'부동산·건설·상담·중개처럼 사람과 터전을 잇는 분야',금:'금융·법·기계·의료 기술처럼 정확함과 결단이 필요한 분야',수:'무역·유통·연구·기획처럼 흐름을 읽고 생각하는 분야'};
      const el=E[r.pillars[2][0]];
      h+='<h4>🛠️ 잘 맞는 분야</h4>';
      top.forEach(q=>{h+='<p><b>'+LQK[q]+'</b>의 힘이 커요 → '+F[q]+'</p>';});
      h+='<p><b>일간 '+el+'</b>의 기운 → '+EF[el]+'</p>';
      try{const tt=Saju4.personality(r.pillars,r);const TY=typeof GM_TYPES!=='undefined'?GM_TYPES[tt.code]:null;h+='<p><b>'+(TY?TY[0]+' '+TY[1]+' '+TY[2]:'나의 기질')+'</b> · '+tt.work+'</p>';}catch(e){}
    }
    // 좋은 달
    const ms=[];for(let m=1;m<=12;m++){const p=MPAL[m];let v=(lq.includes(rs.lqH[p])?1.2:lq.includes(rs.lqE[p])?0.6:0)+pScore(rs,p,t)*0.6;if(topicLq(t)[1].includes(rs.lqH[p]))v-=0.8;ms.push([m,v]);}
    const good=ms.filter(x=>x[1]>=0.8).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]).sort((a,b)=>a-b);
    const badm=ms.filter(x=>x[1]<=-0.4).sort((a,b)=>a[1]-b[1]).slice(0,2).map(x=>x[0]).sort((a,b)=>a-b);K.good=good;K.badm=badm;
    h+='<h4>🗓️ 좋은 달 · 조심할 달 (음력)</h4><p>'+(good.length?'<b>좋은 달: 음력 '+good.join('·')+'월</b>. 중요한 일을 이때 시작하거나 결정하세요.':'특별히 강한 달은 없어요. 아래 좋은 날을 활용하세요.')+(badm.length?' 조심할 달: 음력 '+badm.join('·')+'월. 이때는 큰 결정을 미루는 게 좋아요.':'')+'</p>';
    // 좋은 날 (올해일 때만, 앞으로 60일)
    if(yrOff===0){
      const now=new Date();const cache={};const days=[];
      for(let i=1;i<=60;i++){const dt=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);
        try{const x=dayInfo(dt.getFullYear(),dt.getMonth()+1,dt.getDate(),cache);const dp=x.d.p;let v=x.d.g+(lq.includes(x.rs.lqH[dp])?1:0)+pScore(x.rs,dp,t)*0.3;days.push([dt,v,x.d.gz]);}catch(e){}}
      const top=days.sort((a,b)=>b[1]-a[1]).slice(0,5).sort((a,b)=>a[0]-b[0]);K.days=top;
      if(D.special==='caution'){const low=days.slice().sort((a,c)=>a[1]-c[1]).slice(0,3).sort((a,c)=>a[0]-c[0]);h+='<h4>🚧 앞으로 60일 중 조심할 날</h4><p>'+low.map(([dt])=>'<b>'+(dt.getMonth()+1)+'월 '+dt.getDate()+'일('+'일월화수목금토'[dt.getDay()]+')</b>').join(', ')+'</p>';}
      h+='<h4>✨ 앞으로 60일 중 좋은 날</h4><p>'+top.map(([dt,v,gz])=>'<b>'+(dt.getMonth()+1)+'월 '+dt.getDate()+'일('+'일월화수목금토'[dt.getDay()]+')</b>').join(', ')+'</p><p class="note">'+(D.special==='caution'||D.special==='samjae'?'일진과 그날 운이 드러나는 칸의 문·자리를 따져 고른 날이에요.':'일진과 그날 운이 드러나는 칸에 '+D.n+' 기운이 있는지를 함께 따져 고른 날이에요.')+'</p>';
    }
    // 방위
    if(D.dir||t==='move'||D.special==='caution'){
      const ps=[1,2,3,4,6,7,8,9].map(p=>[p,pScore(rs,p,t)+(lq.includes(rs.lqH[p])?0.5:0)]).sort((a,b)=>b[1]-a[1]);
      const gd=ps.filter(x=>x[1]>0.5).slice(0,2),bd=ps.slice().reverse().filter(x=>x[1]<0).slice(0,2);K.dir=gd.map(([p])=>dirOf(p));K.badDir=bd.map(([p])=>dirOf(p));
      h+='<h4>🧭 '+Y+'년 좋은 방위</h4>';
      h+=gd.length?gd.map(([p])=>'<p><b>'+dirOf(p)+'</b> · '+DK[rs.door[p]]+'('+DM[rs.door[p]].replace(/\.$/,'')+')과 '+GK[rs.gua[p]]+'('+GU[rs.gua[p]].replace(/\.$/,'')+')'+jo(GK[rs.gua[p]],'이','가')+' 함께 있는 방향이에요.</p>').join(''):'<p>올해는 특별히 좋은 방향이 두드러지지 않아요. 피할 방위만 조심하세요.</p>';
      if(bd.length)h+='<p>피할 방위: '+bd.map(([p])=>'<b>'+dirOf(p)+'</b>('+DK[rs.door[p]]+'·'+GK[rs.gua[p]]+(rs.kong.has(p)?'·공망':'')+')').join(', ')+'</p>';
      h+='<p class="note">방위는 지금 사는 곳(또는 집·회사)을 가운데로 놓고 본 방향이에요.</p>';
    }
    h+='<h4>💡 이렇게 해 보세요</h4>'+D.tips.map(x=>'<p>· '+x+'</p>').join('');
    h+='<p class="note">기문둔갑 원명국과 '+Y+'년 신수국의 육친·문·괘로 계산한 참고용 풀이예요. 점수, 좋은 날·달, 방위는 앱이 정한 참고용 규칙이라 전통 해단과 다를 수 있어요. 중요한 결정은 상황을 함께 살펴서 하세요.</p>';
    if(histBase!==base){hist=[];histBase=base;}
    const sp=D.special==='caution'||D.special==='samjae';
    const ans=abQ?decide(abQ,K):talk(t,D,gi,K);
    curHtml='<div class="bub me">'+escH(lastQ)+'</div><div class="bub dk"><span class="av">👹</span><div>'+ans+'<details class="askMore"'+(sp?' open':'')+'><summary>📜 자세한 풀이 보기</summary>'+h+'</details>'+follow(t,D)+'</div></div>';
    showAll();
  }
  // 화면
  const chips=$('askChips');chips.innerHTML=GROUPS.map(([g,l])=>'<p class="askG">'+l+'</p><div class="askChips3">'+ORDER.filter(k=>T[k].g===g).map(k=>'<button type="button" data-t="'+k+'">'+T[k].e+' '+T[k].n+'</button>').join('')+'</div>').join('');
  const allChips=()=>[...chips.querySelectorAll('button')];
  function autoQ(t){const D=T[t],Y=new Date().getFullYear()+yrOff;return D.special==='caution'?Y+'년에 조심할 건 뭐예요?':D.special==='samjae'?Y+'년 삼재가 들었나요?':ACT[t]?Y+'년에 '+D.n+', 해도 될까요?':Y+'년 '+D.n+'운 어때요?';}
  function pick(t,q,ab){if(curHtml&&base===histBase){hist.push(curHtml);hist=hist.slice(-2);}curHtml='';abQ=ab||null;curT=t;lastQ=q||autoQ(t);allChips().forEach(x=>x.classList.toggle('on',x.dataset.t===t));render();setTimeout(()=>{const c=$('askOut').querySelector('.cur');(c||$('askOut')).scrollIntoView({behavior:'smooth',block:'start'});},60);}
  chips.addEventListener('click',e=>{const b=e.target.closest('button');if(b)pick(b.dataset.t,'');});
  const setYr=v=>{yrOff=v;[...$('askYr').children].forEach(b=>b.classList.toggle('on',+b.dataset.v===yrOff));};
  function ask(){const q=$('askQ').value.trim();if(!q)return;
    setYr(/내년|다음 ?해/.test(q)?1:0);
    const hit=MATCH.find(k=>T[k].kw.some(w=>q.includes(w)))||'gen';
    pick(hit,q,qkind(q)==='ab'?q:null);$('askQ').value='';}
  $('askOut').addEventListener('click',e=>{const b=e.target.closest('button[data-f]');if(!b||!curT)return;const D=T[curT],f=b.dataset.f;
    if(f==='when')pick(curT,D.n+', 언제가 제일 좋아요?');
    else if(f==='next'){setYr(1);pick(curT,'내년('+(new Date().getFullYear()+1)+') '+nmOf(D)+jo(nmOf(D),'은','는')+'요?',abQ);}
    else if(f==='now'){setYr(0);pick(curT,'올해 '+nmOf(D)+jo(nmOf(D),'은','는')+'요?',abQ);}
    else if(f==='caution')pick('caution',(yrOff?'내년에':'올해')+' 조심할 건요?');
    else if(f==='ab'){const q=D.n+' 할까, 말까?';pick(curT,q,q);}
    else if(f==='home'){if(curHtml){hist.push(curHtml);hist=hist.slice(-2);}curT=null;abQ=null;render();setTimeout(()=>{const c=$('askOut').querySelector('.cur');if(c)c.scrollIntoView({behavior:'smooth',block:'start'});},60);}});
  $('askOut').addEventListener('click',e=>{const b=e.target.closest('button[data-qk]');if(!b)return;const k=b.dataset.qk,Q=QUICK.find(x=>x[0]===k);
    if(k==='ab'||k==='talk'){const i=$('askQ');i.placeholder=k==='ab'?'예: 이직할까 그냥 다닐까? · 주식 vs 부동산':'예: 요즘 너무 지쳐요 · 남편이랑 자꾸 싸워요';i.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>i.focus({preventScroll:true}),300);return;}
    setYr(0);pick(k,Q[2]);});
  $('askTog').addEventListener('click',()=>{const c=$('askChips'),o=c.style.display==='none';c.style.display=o?'':'none';$('askTog').textContent=o?'📋 주제 목록 접기 ▴':'📋 주제 목록에서 고르기 ▾';});
  chips.addEventListener('click',e=>{if(e.target.closest('button')){chips.style.display='none';$('askTog').textContent='📋 주제 목록에서 고르기 ▾';}});
  $('askGo').addEventListener('click',ask);$('askQ').addEventListener('keydown',e=>{if(e.key==='Enter')ask();});
  $('askYr').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;yrOff=+b.dataset.v;[...$('askYr').children].forEach(x=>x.classList.toggle('on',x===b));render();});
  const yb=$('askYr').children;yb[0].textContent='올해 ('+new Date().getFullYear()+')';yb[1].textContent='내년 ('+(new Date().getFullYear()+1)+')';
  const _show4=show;show=function(){const res=_show4.apply(this,arguments);$('askCard').style.display=(mode==='gh'||mode==='jm'||mode==='dm')?'none':'';try{render();}catch(e){console.error(e);}return res;};
})();
drawSaved();
LEG0=$('legend').textContent;
// 예시: 처음 열면 1984-05-22 20:00
$('d').value='1984-05-22';$('t').value='20:00';$('yr').value=yearSel;
