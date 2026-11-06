/* R133 · 纳月降临「万点归月」大光点吸收 · 整圈月光修正版（Codex 11-07 交付 source/nayue-fx.js 原样收录）。纯绘制，不读写战斗状态。 */
/* R133: large discrete light motes, compact moon. All drawing is seekable.
 * The Peak Master intervenes for Luochen; Ye Guxing heals only in the aftermath.
 * No ribbons, curtains, spiral textures, tapered beams, or realistic moon surface.
 */
(function(g){
'use strict';
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,t)=>{const u=clamp((t-a)/(b-a));return u*u*(3-2*u)};
const env=(t,a,b,c,d)=>smooth(a,b,t)*(1-smooth(c,d,t));
const rnd=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
const variants={A:{name:'万点归月',subtitle:'大颗灵力光点 · 密集吸入 · 静夜神威',x:520,y:204,r:180}};
const phases=[['凝时',0,.55],['护住洛尘',.55,1.9],['明月下降',1.9,3.65],['万点归月',3.65,6.9],['寂静',6.9,7.35],['月华爆发',7.35,8.2],['清辉回落',8.2,10]];
function state(t,key='A'){
 t=clamp(t,0,10);const v=variants.A,land=smooth(1.9,3.65,t),end=1-smooth(8.2,9.9,t),held=t>=6.9&&t<7.35;
 return {t,rt:held?6.9:t,key:'A',phase:phases.find(p=>t>=p[1]&&t<p[2])?.[0]||'时间恢复',
  night:(smooth(0,.52,t)*.83+smooth(5.85,6.9,t)*.08)*end,
  charge:smooth(6.42,6.9,t),landing:env(t,3.44,3.63,3.72,4.12),
  protection:env(t,.55,1.65,8.45,9.75),moon:env(t,1.9,2.45,7.35,8.15),
  mx:v.x,my:lerp(-220,v.y,1-Math.pow(1-land,1.6)),mr:v.r*(1-smooth(6.52,6.9,t)*.11),
  drain:env(t,3.65,4.15,6.65,6.9),loss:smooth(3.65,6.85,t),held,
  dead:t>=7.46,healed:t>=8.52,enemyAlpha:1-smooth(7.46,7.86,t),flash:env(t,7.35,7.46,7.65,8.12),recovery:env(t,8.2,8.55,9.25,10),end};
}
function create(images={}){
 function radial(stops,size=128){const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d'),gr=x.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);for(const [p,col]of stops)gr.addColorStop(p,col);x.fillStyle=gr;x.fillRect(0,0,size,size);return c}
 const soft=radial([[0,'rgba(225,240,255,1)'],[.15,'rgba(198,225,255,.55)'],[.45,'rgba(155,203,255,.12)'],[1,'rgba(130,184,255,0)']]);
 // A substantial round white core, not a tiny pin at the middle of a large glow.
 const mote=radial([[0,'rgba(255,255,255,1)'],[.23,'rgba(251,254,255,1)'],[.31,'rgba(237,248,255,.96)'],[.40,'rgba(191,222,255,.27)'],[.68,'rgba(132,189,255,.045)'],[1,'rgba(132,189,255,0)']]);
 const farMote=radial([[0,'rgba(225,245,255,.96)'],[.24,'rgba(189,226,255,.82)'],[.41,'rgba(117,184,255,.32)'],[.72,'rgba(95,154,234,.055)'],[1,'rgba(95,154,234,0)']]);
 const middleMote=radial([[0,'rgba(254,255,255,1)'],[.21,'rgba(241,250,255,1)'],[.31,'rgba(218,241,255,.88)'],[.46,'rgba(144,201,255,.22)'],[.74,'rgba(117,178,255,.035)'],[1,'rgba(117,178,255,0)']]);
 function glow(c,x,y,r,a=1,sy=1){if(a<=0)return;c.save();c.globalAlpha*=a;c.drawImage(soft,x-r,y-r*sy,r*2,r*2*sy);c.restore()}
 function dot(c,x,y,r,a=1,far=false){if(a<=0)return;c.save();c.globalAlpha*=a;const texture=far===true?farMote:far==='middle'?middleMote:mote;c.drawImage(texture,x-r,y-r,r*2,r*2);c.restore()}
 // Finite emission simulation with deterministic birth times and no endless loop.
 // Each light point starts in the enemy field and disappears only after entering the moon.
 const motes=Array.from({length:960},(_,i)=>{
  const cluster=i%3,wide=rnd(i+613)<.39;
  const birth=3.65+Math.pow(rnd(i+997),.90)*2.75;
  const duration=Math.min(1.05+rnd(i+118)*.85,6.88-birth);
  const sizeRoll=rnd(i+271),radius=sizeRoll>.92?34+rnd(i+81)*8:sizeRoll>.35?20+rnd(i+82)*10:13+rnd(i+83)*7;
  return {i,cluster,wide,birth,duration,radius,depth:sizeRoll,
   dx:(rnd(i+451)-.5)*(wide?480:160),dy:(rnd(i+441)-.5)*(wide?330:210),
   drift:(rnd(i+511)-.5)*190,lift:75+rnd(i+881)*180,
   arrival:(rnd(i+641)-.5)*1.1,brightness:.72+rnd(i+521)*.27};
 }).sort((a,b)=>a.depth-b.depth);
 function pointAt(p,u,s,anchors){
  const e=anchors.enemies[p.cluster%anchors.enemies.length];
  const sx=clamp(e.x+p.dx,12,695),sy=clamp(e.y+p.dy,315,675);
  // The first portion visibly detaches. Later movement accelerates toward the moon.
  const pull=.14*u+.86*Math.pow(u,2.10),lift=Math.sin(Math.PI*u);
  const targetX=s.mx+Math.sin(p.arrival)*s.mr*.22,targetY=s.my+Math.cos(p.arrival)*s.mr*.1;
  return {x:lerp(sx,targetX,pull)+p.drift*lift*.85,y:lerp(sy,targetY,pull)-p.lift*lift*.28};
 }
 function particles(c,s,anchors,layer='front'){
  if(s.rt<3.65||s.rt>=6.9)return 0;let count=0;c.save();
  // Source-over keeps separate round motes readable instead of merging into a white sheet.
  c.globalCompositeOperation='source-over';
  for(const p of motes){
   const behind=p.depth<.29;if((layer==='back')!==behind)continue;
   const age=s.rt-p.birth;if(age<0||age>=p.duration)continue;
   const u=age/p.duration,v=pointAt(p,u,s,anchors),dist=Math.hypot(v.x-s.mx,v.y-s.my);
   if(dist<s.mr*.77)continue;
   const sparkle=.94+.06*Math.sin(s.rt*4.5+p.i*2.4);
   const depthAlpha=behind?.56:p.depth<.73?.79:1;
   const fade=smooth(0,.13,age)*p.brightness*depthAlpha*sparkle;
   // A short, soft afterglow indicates accelerating motion. The head remains
   // a large ROUND mote; the afterglow never grows into a line or ribbon.
   if(!behind&&u>.32&&p.depth>.62){
    const prior=pointAt(p,Math.max(0,u-.028),s,anchors),dx=v.x-prior.x,dy=v.y-prior.y,len=Math.hypot(dx,dy);
    if(len>1){const length=Math.min(18,len);c.save();c.translate(v.x,v.y);c.rotate(Math.atan2(dy,dx));c.globalAlpha=fade*.20*smooth(.32,.68,u);c.drawImage(soft,-length-p.radius*.50,-p.radius*.33,length+p.radius*.75,p.radius*.66);c.restore()}
   }
   // Big points remain big until the moon occludes them. No shrinking into pinpricks.
   dot(c,v.x,v.y,p.radius*(1+Math.sin(u*Math.PI)*.06),fade,behind?true:p.depth<.73?'middle':false);count++;
  }c.restore();return count;
 }
 function guardian(c,s,a,front=false){
  if(s.protection<=0)return;const x=a.luochen.eyeX,y=a.luochen.eyeY,alpha=s.protection;c.save();c.globalCompositeOperation='lighter';
  if(!front){glow(c,x,y+68,194,alpha*.32,1.12);glow(c,a.luochen.x,640,122,alpha*.36,.16)}
  else{glow(c,x,y,58,alpha*.90,.62);glow(c,x,y,22,alpha,.52);for(const dx of [-5,5]){dot(c,x+dx,y,8,alpha);c.fillStyle=`rgba(255,255,255,${alpha})`;c.beginPath();c.ellipse(x+dx,y,3.7,1.5,0,0,TAU);c.fill()}}
  c.restore();
 }
 function moon(c,s){
  if(s.moon<=0)return;const r=s.mr,x=s.mx,y=s.my;c.save();c.globalAlpha=s.moon;
  // Keep the original additive code-light character, with concentric layers
  // so the left edge has the same luminous falloff as the right edge.
  c.globalCompositeOperation='lighter';
  const charge=s.charge||0,spread=lerp(2.4,1.78,charge),pulse=1+(s.landing||0)*.16;
  const bloom=c.createRadialGradient(x,y,0,x,y,r*spread);
  bloom.addColorStop(0,`rgba(200,220,255,${.45*pulse})`);bloom.addColorStop(1,'rgba(200,220,255,0)');
  c.fillStyle=bloom;c.fillRect(x-r*spread,y-r*spread,r*spread*2,r*spread*2);
  const haloRadius=r*lerp(1.5,1.3,charge);
  const halo=c.createRadialGradient(x,y,r*.65,x,y,haloRadius);
  halo.addColorStop(0,'rgba(191,222,255,.25)');
  halo.addColorStop(.4,'rgba(191,222,255,.16)');
  halo.addColorStop(1,'rgba(191,222,255,0)');
  c.fillStyle=halo;c.fillRect(x-haloRadius,y-haloRadius,haloRadius*2,haloRadius*2);
  const light=c.createRadialGradient(x,y,r*.1,x,y,r);
  light.addColorStop(0,'rgba(255,255,255,.95)');
  light.addColorStop(.6,'rgba(215,228,255,.85)');
  light.addColorStop(1,'rgba(150,175,230,0)');
  c.fillStyle=light;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
  c.restore();
 }
 function back(c,t,key,anchors){
  const s=state(t);c.save();c.fillStyle=`rgba(2,6,18,${s.night})`;c.fillRect(0,0,1280,720);
  if(s.night){const v=c.createRadialGradient(500,330,180,520,330,820);v.addColorStop(0,'rgba(0,3,12,0)');v.addColorStop(1,`rgba(0,2,9,${s.night*.67})`);c.fillStyle=v;c.fillRect(0,0,1280,720)}
  guardian(c,s,anchors,false);
  // Light touches the ground before the actors, establishing spatial depth.
  c.save();c.globalCompositeOperation='lighter';
  glow(c,s.mx+26,584,285,s.moon*.12*(1-(s.charge||0)*.85),.17);
  if(s.landing)glow(c,s.mx,590,180+smooth(3.44,4.12,t)*470,s.landing*.20,.075);
  c.restore();particles(c,s,anchors,'back');
  const q=(t-.08)/.62;if(q>0&&q<1){c.globalCompositeOperation='lighter';c.strokeStyle=`rgba(207,233,255,${(1-q)*.22})`;c.lineWidth=4+q*18;c.beginPath();c.ellipse(anchors.luochen.x,520,lerp(40,1450,q),lerp(20,700,q),0,0,TAU);c.stroke()}
  c.restore();return s;
 }
 function front(c,t,key,anchors,{lowFlash=false}={}){
  const s=state(t);c.save();particles(c,s,anchors,'front');moon(c,s);
  // Subtle reflected moonlight over the existing sprites. No sprite copies,
  // material recoloring or silhouette duplicates are involved.
  c.save();c.globalCompositeOperation='lighter';
  const reflected=s.moon*(1-(s.charge||0)*.80);
  glow(c,anchors.yeguxing.x-52,anchors.yeguxing.y-158,125,reflected*.07,1.1);
  glow(c,anchors.luochen.eyeX-32,anchors.luochen.eyeY+100,96,s.protection*.085,1.1);
  for(const e of anchors.enemies)glow(c,e.x+22,e.y-34,78,s.drain*.085,1.15);
  c.restore();guardian(c,s,anchors,true);
  if(t>=7.35&&t<8.35){const p=clamp((t-7.35)/.9);c.save();c.globalCompositeOperation='lighter';glow(c,s.mx,s.my,s.mr*1.1+p*1300,(1-p)*.80);c.lineWidth=25*(1-p)+3;c.strokeStyle=`rgba(217,241,255,${(1-p)*.43})`;c.beginPath();c.arc(s.mx,s.my,s.mr+p*1450,0,TAU);c.stroke();c.restore()}
  if(t>=7.46&&t<8.65){const u=(t-7.46)/1.19;c.save();c.globalCompositeOperation='lighter';for(const [j,e]of anchors.enemies.entries())for(let i=0;i<42;i++){const ang=rnd(i+j*111)*TAU,sp=30+rnd(i+98)*170;const x=e.x+(rnd(i+42)-.5)*100+Math.cos(ang)*sp*u,y=e.y+(rnd(i+72)-.5)*120+Math.sin(ang)*sp*u-u*80;dot(c,x,y,5+rnd(i+79)*7,(1-u)*.65,true)}c.restore()}
  if(s.recovery){c.save();c.globalCompositeOperation='lighter';const a=s.recovery;glow(c,anchors.yeguxing.x,520,155,a*.32,1.1);glow(c,anchors.yeguxing.x,620,125,a*.47,.15);for(let i=0;i<19;i++){const u=(t-8.2)*.5+rnd(i+7),v=u-Math.floor(u);dot(c,anchors.yeguxing.x+(rnd(i+33)-.5)*126,610-v*205,8,a*Math.sin(v*Math.PI)*.55,true)}c.restore()}
  if(s.flash){c.fillStyle=`rgba(247,252,255,${s.flash*(lowFlash?.50:.98)})`;c.fillRect(0,0,1280,720)}
  c.restore();return s;
 }
 function metrics(t,anchors){const s=state(t);let active=0;for(const p of motes){const age=s.rt-p.birth;if(age<0||age>=p.duration)continue;const v=pointAt(p,age/p.duration,s,anchors);if(Math.hypot(v.x-s.mx,v.y-s.my)>=s.mr*.77)active++}return{emittedTotal:motes.length,active,moonDiameter:2*s.mr,radiusRange:[13,42]};}
 function exportTextures(){const makeMoon=(mr,charge)=>{const mc=document.createElement('canvas');mc.width=mc.height=1024;moon(mc.getContext('2d'),{moon:1,mr,charge,mx:512,my:512});return mc};return{moon:makeMoon(180,0),moon_charged:makeMoon(160.2,1),point:mote,point_mid:middleMote,point_far:farMote,glow:soft}}
 return {back,front,state,glow,metrics,exportTextures};
}
g.NayueRedesign={variants,phases,state,create,duration:10,impactAt:7.46,healAt:8.52};
})(typeof window!=='undefined'?window:globalThis);
