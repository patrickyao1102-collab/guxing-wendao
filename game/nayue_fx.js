/* R133 · 纳月降临（Codex v2 朦胧灵月，原样收录；只把洛尘那句台词改成可由剧情传入 NAYUE_LINE）。纯绘制模块；不读写战斗状态。时间单位：秒；逻辑画布：1280×720。 */
(function(global){
'use strict';
const TAU=Math.PI*2, clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), mix=(a,b,k)=>a+(b-a)*k;
const ease=v=>{v=clamp(v);return v*v*(3-2*v)}, seg=(t,a,b)=>ease((t-a)/(b-a));
const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v)};
const windowed=(t,a,b,fade=.4)=>seg(t,a,a+fade)*(1-seg(t,b-fade,b));
const variants={A:{name:'天月镇世',moonR:184,night:.78,rings:2,count:108},B:{name:'峰主临尘',moonR:176,night:.80,rings:1,count:96},C:{name:'万流归月',moonR:180,night:.81,rings:2,count:168}};
const phases=[['时间凝固',0,.8],['银眸苏醒',.8,1.8],['天月降临',1.8,3.8],['万灵归月',3.8,6.6],['万籁归寂',6.6,7.3],['月华裁决',7.3,8.15],['清辉还生',8.15,10]];
function state(t,key='A'){
 t=clamp(t,0,10);const v=variants[key]||variants.A;const descent=seg(t,1.8,3.8),end=1-seg(t,8.2,9.8),collapse=seg(t,6.6,7.28);
 return {t,key,v,night:v.night*seg(t,0,.8)*(1-seg(t,8.5,10)),moon:{x:538,y:mix(-330,216,descent),r:v.moonR*(1-.055*collapse)},moonAlpha:seg(t,1.7,2.1)*end,eye:seg(t,.6,1.4)*(1-seg(t,8.15,9.2)),drain:windowed(t,3.8,7.15,.45),collapse,impact:seg(t,7.3,7.44),dead:t>=7.42,healed:t>=8.15,enemyAlpha:1-seg(t,7.42,8.1),phase:phases.find(p=>t>=p[1]&&t<p[2])?.[0]||'余韵归常'};
}
function create(images){
const img=images;
function sprite(ctx,key,x,y,w,h,a=1,angle=0,blend='lighter'){
 if(!img[key]||a<=.001||w<=0||h<=0)return;ctx.save();ctx.translate(x,y);if(angle)ctx.rotate(angle);ctx.globalAlpha=clamp(a);ctx.globalCompositeOperation=blend;ctx.drawImage(img[key],-w/2,-h/2,w,h);ctx.restore();
}
function ground(ctx,x,y,w,h,a,rotation){ctx.save();ctx.translate(x,y);ctx.scale(1,h/w);sprite(ctx,'halo',0,0,w,w,a,rotation);ctx.restore();}
function glow(ctx,x,y,r,a=1){sprite(ctx,'bloom',x,y,r*2,r*2,a)}
function line(ctx,points,width,alpha){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(204,231,255,${clamp(alpha)})`;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(points[0],points[1]);ctx.bezierCurveTo(...points.slice(2));ctx.stroke();ctx.restore()}
function bez(p,k){const q=1-k;return{x:q*q*q*p[0]+3*q*q*k*p[2]+3*q*k*k*p[4]+k*k*k*p[6],y:q*q*q*p[1]+3*q*q*k*p[3]+3*q*k*k*p[5]+k*k*k*p[7]}}
function label(ctx,text,x,y,size,alpha=1,color='#eaf5ff'){
 ctx.save();ctx.globalAlpha=clamp(alpha);ctx.textAlign='center';ctx.font=`${size}px "Songti SC","STSong",serif`;ctx.fillStyle=color;ctx.shadowBlur=12;ctx.shadowColor='#8ebfff';ctx.fillText(text,x,y);ctx.restore();
}
function back(ctx,t,key,anchors={}){
 const s=state(t,key),L=anchors.luochen||{x:1178,y:638,eyeX:1163,eyeY:432};
 ctx.fillStyle=`rgba(3,8,23,${s.night})`;ctx.fillRect(0,0,1280,720);
 // Spatial stillness: existing ambient motes stop moving between .35 and 8.3 seconds.
 const env=t<.35?t:t<8.3?.35:.35+(t-8.3);
 for(let i=0;i<55;i++){const x=hash(i)*1280,y=(hash(i+83)*720+env*(8+hash(i+100)*8))%720;glow(ctx,x,y,2+hash(i+48)*4,s.night*.5);}
 const early=windowed(t,.8,8.6,.8);
 if(key==='B'){
  sprite(ctx,'beam',L.x-92,355,300,690,early*.20);
  ctx.save();ctx.filter='blur(3px)';sprite(ctx,'avatar',L.x-83,376,370,510,windowed(t,1.45,8.2,1.1)*.19,0,'screen');ctx.restore();
  glow(ctx,L.x-104,191,115,early*.24);
 }
 if(key==='A'){
  for(let i=0;i<22;i++){const x=250+hash(i+777)*590;const a=windowed(t,2.5+i*.015,7.3,.7)*(.025+hash(i+5)*.04);ctx.save();ctx.globalCompositeOperation='lighter';const grad=ctx.createLinearGradient(0,0,0,610);grad.addColorStop(0,'rgba(159,207,255,0)');grad.addColorStop(.25,`rgba(159,207,255,${a})`);grad.addColorStop(.65,`rgba(159,207,255,${a*.4})`);grad.addColorStop(1,'rgba(159,207,255,0)');ctx.fillStyle=grad;ctx.fillRect(x,0,1+hash(i)*6,610);ctx.restore();}
 }
 sprite(ctx,'beam',L.x,L.y-242,170,580,early*.22);
 // Ground ring is below the caster and remains aligned with their feet.
 ground(ctx,L.x,L.y+2,240,73,s.eye*.28,-t*.07);
 glow(ctx,538,560,290,s.moonAlpha*.16);
 return s;
}
function front(ctx,t,key,anchors={},options={}){
 const s=state(t,key),m=s.moon,L=anchors.luochen||{x:1178,y:638,eyeX:1163,eyeY:432},Y=anchors.yeguxing||{x:980,y:615};
 const enemies=anchors.enemies||[{x:236,y:385,h:220},{x:103,y:568,h:190},{x:392,y:589,h:150}];
 // Thin silver eyes, separate from body aura: keep the face legible.
 glow(ctx,L.x,L.y-100,190,s.eye*.23);
 glow(ctx,L.eyeX,L.eyeY,66,s.eye*.93);glow(ctx,L.eyeX,L.eyeY,105,s.eye*.25);
 for(const dx of [-4,4]){glow(ctx,L.eyeX+dx,L.eyeY,13,s.eye*.93);sprite(ctx,'particle',L.eyeX+dx,L.eyeY,16,5,s.eye)}
 if(s.eye>.01){ctx.save();ctx.globalAlpha=s.eye*.6;ctx.strokeStyle='#f0faff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L.eyeX-26,L.eyeY);ctx.lineTo(L.eyeX+27,L.eyeY);ctx.stroke();ctx.restore()}
 // All paths originate at live enemy anchors, never the allied party.
 if(s.drain>.001){
  enemies.forEach((e,j)=>{
   const ex=e.x,ey=e.y;
   glow(ctx,ex,ey,64,s.drain*.27);
   const p=[ex,ey,ex-90-j*20,ey-160,m.x-240+j*160,m.y+160,m.x,m.y];
   line(ctx,p,key==='C'?24:16,s.drain*.012);line(ctx,p,5,s.drain*.025);
   const wisps=key==='C'?3:1;
   for(let z=0;z<wisps;z++){
    const pp=[ex,ey,ex-90-j*20+(z-wisps/2)*8,ey-160-(z-wisps/2)*11,m.x-240+j*160+(z-wisps/2)*16,m.y+160+(z-wisps/2)*8,m.x,m.y];
    line(ctx,pp,1.2,s.drain*(key==='C'?.045:.016));
   }
   const n=Math.floor(s.v.count/enemies.length);
   for(let i=0;i<n;i++){
    const seed=i+j*239,k=((t-3.8)*(.24+hash(seed+41)*.14)+hash(seed))%1;
    const pt=bez(p,k),wob=Math.sin(k*Math.PI)*(key==='C'?28:14);
    pt.x+=Math.sin(k*16+seed)*wob;pt.y+=Math.cos(k*12+seed)*wob;
    const a=s.drain*Math.sin(k*Math.PI)*(.5+hash(seed+2)*.5),r=5+hash(seed+5)*12;
    sprite(ctx,'particle',pt.x,pt.y,r*2,r*2,a);
    if(i%14===0){const tail=bez(p,Math.max(0,k-.035));ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(187,222,255,${a*.4})`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(pt.x,pt.y);ctx.stroke();ctx.restore()}
    if(key==='C'&&i%10===0)sprite(ctx,'feather',pt.x,pt.y,28,28,a*.67,-k*3+j);
   }
  });
 }
 // C has a foreground layer of feathers: drift, freeze, then turn inward.
 if(key==='C')for(let i=0;i<20;i++){
  const k=seg(t,4.1+hash(i)*.7,6.6+hash(i)*.35),a=windowed(t,1.3,7.1,.8)*(1-k);
  const x=mix(70+hash(i+9)*1090,m.x,k),y=mix(160+hash(i+48)*490,m.y,k)-Math.sin(k*Math.PI)*95;
  sprite(ctx,'feather',x,y,18+hash(i+10)*28,18+hash(i+10)*28,a*.45,i*.75-k*4);
 }
 // Moon of light: preserve the original white mystery, no astronomical surface.
 // Render after streams so incoming particles vanish inside its radiance.
 if(s.moonAlpha>.001){
  const a=s.moonAlpha*(1-seg(t,7.32,8.0));
  const breath=1+Math.sin(t*.85)*.012,rr=m.r*breath;
  glow(ctx,m.x,m.y,480,a*.52);glow(ctx,m.x,m.y,325,a*.56);
  sprite(ctx,'moon',m.x,m.y,rr*3.15,rr*3.15,a*.64,0,'lighter');
  // Smooth luminous core follows the author's original radial-gradient style.
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;
  const moonlight=ctx.createRadialGradient(m.x-rr*.12,m.y-rr*.13,rr*.05,m.x,m.y,rr*1.22);
  moonlight.addColorStop(0,'rgba(255,255,255,.98)');
  moonlight.addColorStop(.55,'rgba(249,252,255,.97)');
  moonlight.addColorStop(.72,'rgba(235,246,255,.94)');
  moonlight.addColorStop(.83,'rgba(199,227,255,.62)');
  moonlight.addColorStop(.94,'rgba(151,194,250,.16)');
  moonlight.addColorStop(1,'rgba(141,183,245,0)');
  ctx.fillStyle=moonlight;ctx.beginPath();ctx.arc(m.x,m.y,rr*1.22,0,TAU);ctx.fill();ctx.restore();
  // Only incomplete hazy arcs, with no dials, ticks, runes or solid rims.
  for(let j=0;j<s.v.rings;j++){
   ctx.save();ctx.translate(m.x,m.y);ctx.rotate(j*2.7+Math.min(t,6.9)*.03);ctx.globalCompositeOperation='lighter';
   ctx.filter='blur(5px)';ctx.lineWidth=5;ctx.strokeStyle=`rgba(194,225,255,${a*.07*(1-s.collapse)})`;
   ctx.beginPath();ctx.ellipse(0,0,rr+36+j*27,rr+31+j*24,0,.3,2.1);ctx.stroke();ctx.restore();
  }
  glow(ctx,m.x,m.y,rr*1.7,a*s.collapse*.28);
 }
 // 0.7 second squeeze then a single flash: intensity is a deliberate contrast beat.
 if(t>=6.6&&t<7.32){
  const p=seg(t,6.6,7.28);glow(ctx,m.x,m.y,200-130*p,p*.65);sprite(ctx,'shockwave',m.x,m.y,560-420*p,560-420*p,Math.sin(p*Math.PI)*.7);
  ctx.fillStyle=`rgba(0,3,12,${p*.20})`;ctx.fillRect(0,0,1280,720);
 }
 if(t>=7.3&&t<8.6){
  const p=clamp((t-7.3)/1.25);glow(ctx,m.x,m.y,180+p*1050,(1-p)*.95);
  for(let j=0;j<3;j++){const q=clamp((t-7.3-j*.08)/.78);sprite(ctx,'shockwave',m.x,m.y,50+q*2200,50+q*2200,(1-q)*.9);}
  enemies.forEach((e,j)=>{
   sprite(ctx,'beam',e.x,e.y-65,140,500,windowed(t,7.34+j*.025,8.05,.16)*.75);
   for(let i=0;i<20;i++){const q=clamp((t-7.42)/.8),a=(1-q)*seg(t,7.42,7.5),ang=hash(i+j*70)*TAU,r=q*(60+hash(i+9)*170);sprite(ctx,'particle',e.x+Math.cos(ang)*r,e.y+Math.sin(ang)*r-q*70,12,12,a*.8);}
   label(ctx,'必杀',e.x,e.y-120-35*seg(t,7.5,8.7),36,windowed(t,7.48,8.7,.18));
  });
 }
 // Restoration is explicitly focused on Ye Guxing.
 if(t>=8.0){
  const a=windowed(t,8,9.8,.35);sprite(ctx,'beam',Y.x,Y.y-120,190,420,a*.33);ground(ctx,Y.x,Y.y+3,260,68,a*.4,t*.08);
  for(let i=0;i<26;i++){const k=((t-8)*.65+hash(i))%1;glow(ctx,Y.x+(hash(i+23)-.5)*135,Y.y-k*235,4+hash(i+66)*5,a*Math.sin(k*Math.PI)*.7);}
  label(ctx,'气血回满',Y.x,Y.y-268-12*seg(t,8.2,9.6),26,windowed(t,8.15,9.8,.25),'#c2ffe5');
 }
 const titleA=windowed(t,.9,2.65,.35);
 if(titleA>.001){label(ctx,'纳 月 降 临',650,208,56,titleA);label(ctx,'纳月峰主 · 亲临',650,246,18,titleA*.85)}
 if(t>.45&&t<1.85)label(ctx,(global.NAYUE_LINE||'“……还不到你倒下的时候。”'),700,640,21,windowed(t,.45,1.85,.3));
 const flash=t<7.3?0:(seg(t,7.3,7.42)*(1-seg(t,7.43,7.83)));
 if(flash>0){ctx.fillStyle=`rgba(244,250,255,${flash*(options.lowFlash?.42:.97)})`;ctx.fillRect(0,0,1280,720);}
 return s;
}
return {back,front,state};
}
global.NayueFX={create,state,variants,phases,DURATION:10,IMPACT_AT:7.42,HEAL_AT:8.15};
})(typeof window!=='undefined'?window:globalThis);
