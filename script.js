const SKEY='lg_balance_v4';
let balance=Number(localStorage.getItem(SKEY)); if(!Number.isFinite(balance)||balance<0) balance=5000;
let rouletteBet=100, chosenColor=null, chosenNumber=null, history=[];
let sweetBet=20, sweetLines=3, sweetSpinning=false, autoTimer=null, turbo=false, sound=true, freeSpins=0, bonusMultiplier=1;
let crashBet=100, crashTimer=null, crashRunning=false, crashMult=1, crashTarget=0;
const RED=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const PAY={heart:[20,50,100],apple:[2,5,15],diamond:[.5,1,5],plum:[10,25,50],grape:[1.5,2,12],square:[.4,.9,4],watermelon:[2.5,10,25],star:[.8,1.5,8],rect:[.25,.75,2]};
const SYMBOLS=[
 {id:'heart',e:'♥',c:'heart'}, {id:'apple',e:'●',c:'apple'}, {id:'diamond',e:'◆',c:'diamond'},
 {id:'plum',e:'●',c:'plum'}, {id:'grape',e:'●',c:'grape'}, {id:'square',e:'■',c:'square'},
 {id:'watermelon',e:'◉',c:'watermelon'}, {id:'star',e:'★',c:'star'}, {id:'rect',e:'▬',c:'rect'}, {id:'scatter',e:'S',c:'scatter'}
];
function fmt(n){return Number(n).toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2})}
function save(){localStorage.setItem(SKEY,String(balance)); document.getElementById('balance').textContent=fmt(balance); if(document.getElementById('sweetBalance'))document.getElementById('sweetBalance').textContent=fmt(balance)}
function syncHomeBalance(){const e=document.getElementById('homeBalance');if(e)e.textContent=formatNumber(balance);}

function spend(n){if(balance<n){toast('Недостаточно виртуальных монет');return false}balance-=n;save();return true}
function win(n){balance+=n;save()}
function toast(t){const x=document.getElementById('toast');x.textContent=t;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),1800)}
function openPage(id){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);if(id==='sweet')renderGrid(randomGrid());if(id==='bonus')resetBonusVisual()}
function daily(){const d=new Date().toISOString().slice(0,10);if(localStorage.getItem('lg_daily')===d)return toast('Бонус уже получен');localStorage.setItem('lg_daily',d);win(1000);toast('+1 000 виртуальных монет')}
function promo(){const c=document.getElementById('code').value.trim().toUpperCase();const p=document.getElementById('promoMsg');if(localStorage.getItem('lg_promo')){p.textContent='Промокод уже использован';return}const n=c==='LUCKY1000'?1000:c==='DEMO500'?500:0;if(!n){p.textContent='Неверный промокод';return}localStorage.setItem('lg_promo','1');win(n);p.textContent='Активировано: +'+fmt(n)}
// Roulette
function buildWheel(){const e=document.getElementById('wheelNumbers'),n=document.getElementById('numbers');e.innerHTML='';n.innerHTML='';for(let i=0;i<37;i++){const s=document.createElement('span');s.textContent=i;s.style.transform=`rotate(${i*9.73-90}deg) translateX(101px) rotate(${90-i*9.73}deg)`;e.appendChild(s);const b=document.createElement('button');b.textContent=i;b.dataset.n=i;b.onclick=()=>pickNumber(i,b);n.appendChild(b)}}
function pickNumber(n,b){chosenNumber=n;document.querySelectorAll('.numbers button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');showSelected()}
function setColor(c){chosenColor=chosenColor===c?null:c;document.querySelectorAll('.bettypes button').forEach(x=>x.classList.toggle('selected',x.dataset.color===chosenColor));showSelected()}
function showSelected(){let a=[];if(chosenColor)a.push(chosenColor==='red'?'красное':chosenColor==='black'?'чёрное':'0');if(chosenNumber!==null)a.push('число '+chosenNumber);document.getElementById('selected').textContent=a.length?'Ставка: '+a.join(' + '):'Ставка: не выбрана'}
function adjustRouletteBet(v){rouletteBet=Math.max(10,Math.min(5000,rouletteBet+v));document.getElementById('rbet').textContent=fmt(rouletteBet)}
function spinRoulette(){if(chosenColor===null&&chosenNumber===null)return toast('Выберите цвет или число');if(!spend(rouletteBet))return;const wrap=document.querySelector('.rouletteWrap');const wheel=document.getElementById('rouletteWheel');wrap.classList.remove('spinning');void wrap.offsetWidth;const n=Math.floor(Math.random()*37);const color=n===0?'green':RED.includes(n)?'red':'black';const angle=1440+(360-(n/37)*360)+Math.random()*8;wheel.style.setProperty('--stop',angle+'deg');wrap.classList.add('spinning');document.getElementById('rouletteMsg').textContent='Рулетка вращается…';setTimeout(()=>{document.getElementById('wheelResult').textContent=n;let w=0;if(chosenNumber===n)w+=rouletteBet*35;if(chosenColor===color)w+=rouletteBet*(color==='green'?14:2);if(w){win(w);document.getElementById('rouletteMsg').textContent='🎉 '+n+' • '+color+' • выигрыш '+fmt(w)}else document.getElementById('rouletteMsg').textContent='Выпало '+n+' • '+color+' • ставка проиграла';history.unshift(n);history=history.slice(0,8);document.getElementById('history').textContent='Последние: '+history.join(' • ');wrap.classList.remove('spinning')},3900)}
// Candy slot
function symbolById(id){return SYMBOLS.find(s=>s.id===id)}
function randomSymbol(){const r=Math.random(); if(r<.015)return 'scatter'; if(r<.12)return 'heart'; if(r<.23)return 'plum'; if(r<.34)return 'watermelon'; if(r<.45)return 'apple'; if(r<.56)return 'grape'; if(r<.68)return 'diamond'; if(r<.79)return 'star'; if(r<.9)return 'square'; return 'rect'}
function randomGrid(){return Array.from({length:30},randomSymbol)}
function renderGrid(grid,highlight=[]){const el=document.getElementById('slotGrid');el.innerHTML='';grid.forEach((id,i)=>{const s=symbolById(id);const d=document.createElement('div');d.className='cell '+s.c+(highlight.includes(i)?' win':'');d.innerHTML=`<span>${s.e}</span>`+(id==='scatter'?'<small>SCATTER</small>':'');el.appendChild(d)})}
function setSweetLines(n){sweetLines=n;document.querySelectorAll('.lineBtn').forEach(b=>b.classList.toggle('active',+b.dataset.lines===n));updateSweetLabels()}
document.querySelectorAll('.lineBtn').forEach(b=>b.onclick=()=>setSweetLines(+b.dataset.lines));
function updateSweetLabels(){document.getElementById('sweetBet').textContent=fmt(sweetBet);document.getElementById('sweetBetLabel').textContent=fmt(sweetBet);document.getElementById('sweetBalance').textContent=fmt(balance)}
function adjustSweetBet(v){sweetBet=Math.max(1,Math.min(500,+(sweetBet+v).toFixed(2)));updateSweetLabels()}
function adjustCrashBet(v){crashBet=Math.max(10,Math.min(5000,crashBet+v));document.getElementById('cb').textContent=fmt(crashBet)}
function spinSweet(){if(sweetSpinning)return;const cost=sweetBet;if(!spend(cost))return;sweetSpinning=true;document.getElementById('sweetSpin').disabled=true;document.getElementById('sweetMsg').textContent=freeSpins?'FREE SPIN • '+freeSpins+' осталось':'Вращение…';if(freeSpins>0)freeSpins--;let grid=randomGrid();let ticks=turbo?7:15;let i=0;const iv=setInterval(()=>{renderGrid(randomGrid());if(++i>=ticks){clearInterval(iv);resolveSweet(grid,cost)}},turbo?45:85)}
function resolveSweet(grid,cost){renderGrid(grid);let counts={};grid.forEach((id,i)=>{if(id!=='scatter'){counts[id]??=[];counts[id].push(i)}});let best=null;Object.entries(counts).forEach(([id,idx])=>{if(idx.length>=8 && (!best||idx.length>best.idx.length))best={id,idx}});let scatter=grid.filter(x=>x==='scatter').length;let payout=0;if(best){const tier=best.idx.length>=12?2:best.idx.length>=10?1:0;const mult=PAY[best.id][tier];payout=cost*mult;win(payout);renderGrid(grid,best.idx);document.getElementById('sweetMsg').textContent=`🍭 ${symbolById(best.id).e} • ${best.idx.length} символов • +${fmt(payout)}`;document.getElementById('sweetWin').textContent=fmt(payout);document.getElementById('winFlash').classList.add('show');setTimeout(()=>document.getElementById('winFlash').classList.remove('show'),450)}else{document.getElementById('sweetMsg').textContent='Нет выигрышной комбинации';document.getElementById('sweetWin').textContent='0.00'}
if(scatter>=4){freeSpins+=10;const scMult=scatter===4?3:scatter===5?5:100;document.getElementById('sweetMsg').textContent+=` • 🎁 ${scatter} Scatter: 10 фриспинов (${scMult}×)`;if(scatter>=4)startFreeSpins(scMult)}sweetSpinning=false;document.getElementById('sweetSpin').disabled=false;updateSweetLabels();if(autoTimer)setTimeout(()=>{if(autoTimer)spinSweet()},turbo?250:700)}
function startFreeSpins(scMult){bonusMultiplier=scMult;toast(`🎁 Бонус: 10 фриспинов • ${scMult}×`)}
function toggleSound(){sound=!sound;document.getElementById('soundBtn').textContent=sound?'🔊 ЗВУК ВКЛ':'🔇 ЗВУК ВЫКЛ'}
function toggleTurbo(){turbo=!turbo;document.getElementById('turboBtn').textContent=turbo?'⚡ ТУРБО ВКЛ':'⚡ ТУРБО ВЫКЛ'}
function toggleAuto(){if(autoTimer){clearTimeout(autoTimer);autoTimer=null;document.getElementById('autoBtn').textContent='↻ АВТО';toast('Авто выключено');return}document.getElementById('autoBtn').textContent='⏹ СТОП';spinSweet()}
// Bonus game — рискованный демо-режим: результат может быть положительным или отрицательным.
let bonusBet=100, bonusRisk='normal', gemsOpened=0, gemTotal=0, bonusActive=false, bonusValues=[];
function resetBonusVisual(){
  const f=document.getElementById('gemField'); if(!f)return;
  f.innerHTML=''; gemsOpened=0; gemTotal=0; bonusActive=false;
  document.getElementById('bonusMultiplier').textContent='+0.00';
  document.getElementById('bonusWin').textContent='0.00';
  document.getElementById('bonusProgress').textContent='0 / 8';
  document.getElementById('bonusStart').disabled=false;
  document.getElementById('bonusHint').textContent='Некоторые камни могут уменьшить баланс';
}
function adjustBonusBet(v){bonusBet=Math.max(25,Math.min(2500,bonusBet+v));document.getElementById('bonusBet').textContent=fmt(bonusBet)}
function setBonusRisk(r){bonusRisk=r;document.querySelectorAll('.bonusMode').forEach(b=>b.classList.toggle('active',b.dataset.risk===r));
  const hints={normal:'Сбалансированный режим',risky:'Выше шанс крупного плюса и крупного минуса',safe:'Меньше риск, но и меньше возможный выигрыш'};
  document.getElementById('bonusHint').textContent=hints[r];
}
function makeBonusValue(){
  const u=Math.random();
  if(bonusRisk==='safe'){
    if(u<.55)return +(0.15+Math.random()*0.85).toFixed(2);
    if(u<.9)return +(1+Math.random()*1.5).toFixed(2);
    return +(-0.15-Math.random()*0.35).toFixed(2);
  }
  if(bonusRisk==='risky'){
    if(u<.30)return +(-0.2-Math.random()*1.8).toFixed(2);
    if(u<.72)return +(0.25+Math.random()*1.75).toFixed(2);
    if(u<.96)return +(2+Math.random()*6).toFixed(2);
    return +(8+Math.random()*32).toFixed(2);
  }
  if(u<.30)return +(-0.2-Math.random()*1.3).toFixed(2);
  if(u<.78)return +(0.2+Math.random()*1.5).toFixed(2);
  if(u<.98)return +(1.8+Math.random()*4).toFixed(2);
  return +(5+Math.random()*20).toFixed(2);
}
function startBonusGame(){
  if(bonusActive)return;
  if(!spend(bonusBet))return;
  resetBonusVisual(); bonusActive=true;
  const f=document.getElementById('gemField'); bonusValues=Array.from({length:8},makeBonusValue);
  bonusValues.sort(()=>Math.random()-.5);
  for(let i=0;i<8;i++){
    const b=document.createElement('button'); b.className='gem sealed'; b.innerHTML='<span>◆</span><small>?</small>'; b.dataset.v=bonusValues[i]; b.onclick=()=>openGem(b); f.appendChild(b);
  }
  document.getElementById('bonusStart').disabled=true;
  document.getElementById('bonusText').textContent='Бонус запущен. Открывай камни — итог рассчитывается по каждому выбору.';
}
function openGem(b){
  if(!bonusActive||b.classList.contains('opened'))return;
  b.classList.add('opened'); const v=+b.dataset.v; gemTotal+=v; gemsOpened++;
  const positive=v>=0; b.classList.add(positive?'plus':'minus');
  b.innerHTML=`<span>${positive?'💎':'💥'}</span><small>${positive?'+':''}${v.toFixed(2)}×</small>`;
  document.getElementById('bonusProgress').textContent=`${gemsOpened} / 8`;
  const sign=gemTotal>=0?'+':''; document.getElementById('bonusMultiplier').textContent=sign+gemTotal.toFixed(2)+'×';
  const live=bonusBet*gemTotal; document.getElementById('bonusWin').textContent=(live>=0?'+':'')+fmt(live);
  document.getElementById('bonusText').textContent=positive?`💎 Камень дал +${v.toFixed(2)}×`:`💥 Камень забрал ${Math.abs(v).toFixed(2)}×`;
  if(gemsOpened>=8){
    const net=bonusBet*gemTotal;
    if(net>=0)win(net); else balance=Math.max(0,balance+net),save();
    document.getElementById('bonusWin').textContent=(net>=0?'+':'')+fmt(net);
    document.getElementById('bonusText').textContent=net>=0?`🏆 Бонус завершён: +${fmt(net)} виртуальных монет`:`💥 Бонус завершён: −${fmt(Math.abs(net))} виртуальных монет`;
    document.getElementById('bonusHint').textContent=net>=0?'Сегодня удача на твоей стороне':'Не повезло. Можно попробовать снова';
    document.getElementById('bonusStart').disabled=false; bonusActive=false;
  }
}

// Crash
function startCrash(){if(crashRunning)return;if(!spend(crashBet))return;crashRunning=true;crashMult=1;crashTarget=+(1.02+Math.pow(Math.random(),1.55)*7.98).toFixed(2);document.getElementById('mult').textContent='1.00x';document.getElementById('crashState').textContent='Самолёт летит…';document.getElementById('start').disabled=true;document.getElementById('take').disabled=false;document.getElementById('plane').classList.add('flying');crashTimer=setInterval(()=>{crashMult=+(crashMult+.015+crashMult*.006).toFixed(2);document.getElementById('mult').textContent=crashMult.toFixed(2)+'x';if(crashMult>=crashTarget)endCrash(false)},70)}
function takeCrash(){if(!crashRunning)return;const w=crashBet*crashMult;win(w);toast('✈️ Забрано '+fmt(w));endCrash(true)}
function endCrash(winFlag){clearInterval(crashTimer);crashRunning=false;document.getElementById('start').disabled=false;document.getElementById('take').disabled=true;document.getElementById('plane').classList.remove('flying');document.getElementById('crashState').textContent=winFlag?'Выигрыш забран':'💥 Краш на '+crashMult.toFixed(2)+'x'}
function openInfo(){document.getElementById('infoModal').classList.add('show');document.getElementById('paytable').innerHTML=Object.entries(PAY).map(([k,v])=>`<div><span>${symbolById(k).e} ${k}</span><b>${v.join('× / ')}×</b></div>`).join('')}
function closeInfo(){document.getElementById('infoModal').classList.remove('show')}
buildWheel();save();renderGrid(randomGrid());updateSweetLabels();document.getElementById('cb').textContent=fmt(crashBet);


(function(){
  const updateGreeting=()=>{const e=document.getElementById('homeGreeting');if(!e)return;const h=new Date().getHours();e.textContent=h<6?'ДОБРОЙ НОЧИ':h<12?'ДОБРОЕ УТРО':h<18?'ДОБРЫЙ ДЕНЬ':'ДОБРЫЙ ВЕЧЕР';syncHomeBalance();};
  updateGreeting(); setInterval(updateGreeting,30000);
  const oldOpen=window.openPage;
  if(oldOpen) window.openPage=function(id){oldOpen(id);syncHomeBalance();window.scrollTo({top:0,behavior:'auto'});};
})();
