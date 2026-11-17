const boot=require('./boot.inc.js');const fs=require('fs');(async()=>{const {b,p}=await boot();
const keys=JSON.parse(fs.readFileSync('catalog.json')).out.map(o=>o.k);
// 没加载的先补载：按 cx2/ 的规则试一下
await p.evaluate(async(keys)=>{const miss=keys.filter(k=>!IMG[k]&&/^cx2_/.test(k));await Promise.all(miss.map(k=>new Promise(r=>{const im=new Image();im.onload=()=>{IMG[k]=im;r()};im.onerror=r;im.src='cx2/'+k.slice(4)+'.webp';})));},keys);
let n=0;
for(let i=0;i<keys.length;i+=60){const part=keys.slice(i,i+60);
 const r=await p.evaluate((ks)=>ks.map(k=>{const im=IMG[k];if(!im)return null;const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;if(!w||!h||w<4||h<4)return null;const c=document.createElement('canvas');c.width=w;c.height=h;try{c.getContext('2d').drawImage(im,0,0);return [k,c.toDataURL('image/png')]}catch(e){return null}}),part);
 for(const x of r){if(!x)continue;fs.writeFileSync('/tmp/claude-0/cat/raw/'+x[0].replace(/[^\w\-]/g,'_')+'.png',Buffer.from(x[1].split(',')[1],'base64'));n++;}}
// 地面底图缩略
const gr=JSON.parse(fs.readFileSync('catalog.json')).gr; fs.mkdirSync('/tmp/claude-0/cat/ground',{recursive:true});
const gk=Object.keys(gr);
await p.evaluate(async(gk)=>{},gk);
const g=await p.evaluate((gk)=>gk.map(k=>{const im=IMG[k];if(!im)return null;const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;if(!w)return null;const s=Math.min(1,900/w);const c=document.createElement('canvas');c.width=Math.round(w*s);c.height=Math.round(h*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return [k,c.toDataURL('image/jpeg',.8)]}),gk);
let gn=0;for(const x of g){if(!x)continue;fs.writeFileSync('/tmp/claude-0/cat/ground/'+x[0].replace(/[^\w\-]/g,'_')+'.jpg',Buffer.from(x[1].split(',')[1],'base64'));gn++;}
const titles=await p.evaluate(()=>{const t={};for(const [m,M] of Object.entries(TMAPS))t[m]=(M&&(M.title||M.name))||m;return t;});fs.writeFileSync('/tmp/claude-0/cat/titles.json',JSON.stringify(titles));
console.log('objs',n,'grounds',gn);await b.close();})();
