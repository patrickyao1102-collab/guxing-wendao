const boot=require('./boot.inc.js');const fs=require('fs');(async()=>{const {b,p}=await boot();
const gr=JSON.parse(fs.readFileSync('catalog.json')).gr;const gk=Object.keys(gr);
// 没加载的地面也补载：找 IMG 里没有的，按 baked 地图逐张进一下
const miss=await p.evaluate((gk)=>gk.filter(k=>!IMG[k]),gk);
for(const k of miss){const m=gr[k][0];try{await p.evaluate((m)=>{const s=TMAPS[m].start||[5,5];tileSetMap(m,s[0],s[1],'down');S.scene=drawMap;S.fade=0;},m);await p.waitForTimeout(1200);}catch(e){}}
for(const k of gk){const d=await p.evaluate((k)=>{const im=IMG[k];if(!im)return null;const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;if(!w)return null;const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0);return c.toDataURL('image/jpeg',.9)},k);
 if(d)fs.writeFileSync('/tmp/claude-0/cat/groundfull/'+k.replace(/[^\w\-]/g,'_')+'.jpg',Buffer.from(d.split(',')[1],'base64'));}
fs.writeFileSync('/tmp/claude-0/cat/groundmaps.json',JSON.stringify(gr));
console.log(miss.length, fs.readdirSync('/tmp/claude-0/cat/groundfull').length);await b.close();})();
