// 悬崖医馆 v1 · 贪心策略机器人对照（会优先治疗/优先扩建的打法）
const fs=require("fs");
const html=fs.readFileSync("J:/aios/tenants/悬崖医馆/悬崖医馆_v1.html","utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const els={};
function el(id){if(!els[id])els[id]={textContent:"",innerHTML:"",disabled:false,
  classList:{toggle(){},contains(){return false},add(){},remove(){}}};return els[id]}
global.document={getElementById:el};

const BOT=`
;(function(){
  function greedyTurn(){
    // 1) 治最轻的病人（成功率最高，止损）
    if(S.ap>0&&S.herb>=2&&S.patients.length){
      let bi=0;for(let i=1;i<S.patients.length;i++)if(S.patients[i].sev<S.patients[bi].sev)bi=i;
      treat(bi);return true;
    }
    // 2) 关键建筑优先：草药架>绳降台>病房>栈道>药庐>叠楼
    if(S.ap>0){
      const order=['herbrack','ropestation','ward','walkway','pharmacy','tower'];
      for(const k of order){const b=B[k];
        if(b.once&&S.built[k])continue;
        if(k==='tower'&&S.layers>=7)continue;
        if(canPay(b.c)){build(k);return true}
      }
    }
    // 3) 草药不足先采药
    if(S.ap>0&&S.gas<1&&S.herb<4){act('herb');return true}
    // 4) 绳索够就搜救（补病人+物资）
    if(S.ap>0&&S.built.ropestation&&S.rope>0&&S.patients.length<S.beds+2){act('rescue');return true}
    // 5) 声望换物资
    if(S.ap>0&&S.rep>4){act('trade');return true}
    return false;
  }
  let wins=0,losses=0,errs=[],winDays=[],loseDays=[],maxCured=0,maxLayer=0;
  for(let g=0;g<200;g++){
    newGame();let guard=0;
    try{while(!S.over&&guard++<500){
      if(!greedyTurn()||S.ap<1)endDay();
    }}catch(e){errs.push("g"+g+" d"+S.day+": "+e.message);break}
    if(S.over==='win'){wins++;winDays.push(S.day)}else if(S.over==='lose')loseDays.push(S.day);
    if(S.cured>maxCured)maxCured=S.cured;if(S.layers>maxLayer)maxLayer=S.layers;
  }
  const med=a=>{if(!a.length)return"-";const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
  console.log(JSON.stringify({games:200,wins,losses,
    medianWinDay:med(winDays),medianLoseDay:med(loseDays),
    maxCured,maxLayer,errors:errs},null,1));
})();`;
try{eval(js+BOT)}catch(e){console.error("HARNESS ERROR:",e.message);process.exit(1)}
