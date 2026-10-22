// 悬崖医馆 v1 · 200 局机器人冒烟（桩掉 DOM，直接跑游戏脚本本体）
const fs=require("fs");
const path="J:/aios/tenants/悬崖医馆/悬崖医馆_v1.html";
const html=fs.readFileSync(path,"utf8");
const m=html.match(/<script>([\s\S]*?)<\/script>/);
if(!m){console.error("NO SCRIPT FOUND");process.exit(1)}
const js=m[1];

// DOM 桩
const els={};
function el(id){
  if(!els[id])els[id]={textContent:"",innerHTML:"",disabled:false,
    classList:{toggle(){},contains(){return false},add(){},remove(){}}};
  return els[id];
}
global.document={getElementById:el};

const BOT=`
;(function(){
  let wins=0,losses=0,noend=0,errs=[],daySum=0,curedMax=0,layerMax=0,winCured=[],loseDays=[];
  for(let g=0;g<200;g++){
    newGame();
    let guard=0;
    try{
      while(!S.over&&guard++<500){
        const opts=[];
        if(S.ap>0){
          if(S.gas<1)opts.push(()=>act('herb'));
          if(S.rep>=2)opts.push(()=>act('trade'));
          if(S.built.ropestation&&S.rope>0&&S.patients.length<S.beds+2)opts.push(()=>act('rescue'));
          const keys=Object.keys(B).filter(k=>{const b=B[k];return !(b.once&&S.built[k])&&!(k==='tower'&&S.layers>=7)&&canPay(b.c)});
          if(keys.length)opts.push(()=>build(pick(keys)));
          if(S.patients.length&&S.herb>=2)opts.push(()=>treat(rnd(S.patients.length)));
        }
        if(opts.length&&S.ap>0)pick(opts)();else endDay();
      }
    }catch(e){errs.push("g"+g+" d"+S.day+": "+e.message);break}
    if(S.over==='win'){wins++;winCured.push(S.cured)}
    else if(S.over==='lose'){losses++;loseDays.push(S.day)}
    else noend++;
    daySum+=S.day;
    if(S.cured>curedMax)curedMax=S.cured;
    if(S.layers>layerMax)layerMax=S.layers;
  }
  const avgD=(daySum/200).toFixed(1);
  const med=a=>{if(!a.length)return "-";const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
  console.log(JSON.stringify({
    games:200, wins, losses, noend,
    avgDays:avgD, medianLoseDay:med(loseDays),
    maxCured:curedMax, maxLayer:layerMax,
    winCuredMin:winCured.length?Math.min(...winCured):null,
    errors:errs
  },null,1));
})();`;

try{ eval(js+BOT); }catch(e){ console.error("HARNESS ERROR:",e.message); process.exit(1); }
