const boot=require('./boot.inc.js');(async()=>{const {b,p}=await boot();
const r=await p.evaluate(()=>{const use={},gr={};let maps=0;for(const [m,M] of Object.entries(TMAPS)){const B=M&&M.baked;if(!B)continue;maps++;if(B.ground)(gr[B.ground]=gr[B.ground]||[]).push(m);for(const o of B.objs||[]){if(!o.img)continue;const u=use[o.img]=use[o.img]||{id:o.id,maps:new Set(),w:o.w,h:o.h};u.maps.add(m);}}
const out=Object.entries(use).map(([k,u])=>({k,id:u.id,w:Math.round(u.w),h:Math.round(u.h),maps:[...u.maps],src:IMG[k]&&IMG[k].src?String(IMG[k].src).slice(0,120):(IMG[k]?'canvas':null)}));
return {maps,n:out.length,ground:Object.keys(gr).length,out,gr,loaded:out.filter(o=>o.src).length};});
require('fs').writeFileSync('catalog.json',JSON.stringify(r));console.log(r.maps,r.n,r.ground,r.loaded);console.log(r.out.slice(0,5));await b.close();})();
