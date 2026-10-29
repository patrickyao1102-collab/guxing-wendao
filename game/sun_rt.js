/* 太阳剑阵 v21 龙卷归剑（Codex）→ 实战版 SUN_RT（Claude 移植：素材走图集、按真实敌人计算、去掉演示用背景/HUD）。原注释：v13 — approved v2 image assets and Luochen impact sequences; v4 array geometry retained by user request, with layered material and image-flow overlays.
   Only the original game's backdrop, fixed player artwork and beasts are used. */
(function(){'use strict';window.SUN_WHEEL_BLOB=window.SUN_WHEEL_BLOB||'/_blob/f0155f0ec591c019b03251472f9077aa';
const SUN_MAP={"s5_beam": [0, 0, 0, 996, 1536], "s5_sword": [0, 998, 0, 318, 1536], "s7_solid_sword": [0, 1318, 0, 1024, 1536], "s5_array": [0, 2344, 0, 1254, 1252], "s5_beamseq5": [0, 3600, 0, 256, 640], "s5_beamseq2": [0, 0, 1538, 256, 640], "s5_flow3": [0, 258, 1538, 256, 640], "s5_beamseq1": [0, 516, 1538, 256, 640], "s5_beamseq3": [0, 774, 1538, 256, 640], "s5_beamseq4": [0, 1032, 1538, 256, 640], "s5_flow5": [0, 1290, 1538, 256, 640], "s5_flow2": [0, 1548, 1538, 256, 640], "s5_flow4": [0, 1806, 1538, 256, 640], "s5_flow6": [0, 2064, 1538, 256, 640], "s5_flow7": [0, 2322, 1538, 256, 640], "s5_flow1": [0, 2580, 1538, 256, 640], "s5_flow0": [0, 2838, 1538, 256, 640], "s5_beamseq6": [0, 3096, 1538, 256, 640], "s5_beamseq7": [0, 3354, 1538, 256, 640], "s5_beamseq0": [0, 3612, 1538, 256, 640], "s15_core1": [0, 0, 2180, 627, 627], "s15_core3": [0, 629, 2180, 627, 627], "s15_core0": [0, 1258, 2180, 627, 627], "s15_core2": [0, 1887, 2180, 627, 627], "s5_sun_rays": [0, 2516, 2180, 627, 621], "s15_rays3": [0, 3145, 2180, 637, 618], "s15_rays0": [0, 0, 2809, 636, 618], "s15_rays1": [0, 638, 2809, 637, 618], "s15_rays2": [0, 1277, 2809, 636, 618], "s5_sun_sphere": [0, 1915, 2809, 543, 594], "s5_hit": [0, 2460, 2809, 620, 593], "s5_cracks": [0, 3082, 2809, 627, 578], "s5_sun_corona": [0, 0, 3429, 620, 577], "s5_lc_hit1": [0, 622, 3429, 374, 502], "s5_lc_hit0": [0, 998, 3429, 374, 502], "s5_lc_land3": [0, 1374, 3429, 374, 502], "s5_lc_land6": [0, 1750, 3429, 374, 502], "s5_lc_hit7": [0, 2126, 3429, 374, 502], "s5_lc_land2": [0, 2502, 3429, 374, 502], "s5_lc_hit6": [0, 2878, 3429, 374, 502], "s5_lc_land7": [0, 3254, 3429, 374, 502], "s5_lc_hit4": [0, 3630, 3429, 374, 502], "s5_lc_land0": [1, 0, 0, 374, 502], "s5_lc_hit2": [1, 376, 0, 374, 502], "s5_lc_land1": [1, 752, 0, 374, 502], "s5_lc_land4": [1, 1128, 0, 374, 502], "s5_lc_hit3": [1, 1504, 0, 374, 502], "s5_lc_hit5": [1, 1880, 0, 374, 502], "s5_lc_land5": [1, 2256, 0, 374, 502], "s5_sun_core": [1, 2632, 0, 485, 485], "s5_shock": [1, 3119, 0, 627, 459], "s5_fire_sea": [1, 0, 504, 624, 412], "s5_arc5": [1, 626, 504, 384, 384], "s5_arc7": [1, 1012, 504, 384, 384], "s5_arc1": [1, 1398, 504, 384, 384], "s5_arc6": [1, 1784, 504, 384, 384], "s5_arc4": [1, 2170, 504, 384, 384], "s5_arc2": [1, 2556, 504, 384, 384], "s5_arc0": [1, 2942, 504, 384, 384], "s5_arc3": [1, 3328, 504, 384, 384], "s5_lc_beam10": [1, 0, 918, 502, 253], "s5_lc_beam9": [1, 504, 918, 502, 253], "s5_lc_beam11": [1, 1008, 918, 502, 253], "s5_lc_beam3": [1, 1512, 918, 502, 246], "s5_lc_beam4": [1, 2016, 918, 502, 246], "s5_lc_beam5": [1, 2520, 918, 502, 246], "s5_lc_beam6": [1, 3024, 918, 502, 244], "s5_lc_beam8": [1, 3528, 918, 502, 244], "s5_lc_beam7": [1, 0, 1173, 502, 244], "s5_lc_beam1": [1, 504, 1173, 502, 241], "s5_lc_beam2": [1, 1008, 1173, 502, 241], "s5_lc_beam0": [1, 1512, 1173, 502, 241]};let SUN_PG=null;const SUN_PAGES_F=()=>SUN_PG||(SUN_PG=['sun_assets/atlas0.webp','sun_assets/atlas1.webp'].map(src=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=src;})));
function SUN_IMG(k){const e=SUN_MAP[k];if(!e)return Promise.reject(new Error('sun asset '+k));return SUN_PAGES_F()[e[0]].then(pg=>{const c=document.createElement('canvas');c.width=e[3];c.height=e[4];c.getContext('2d').drawImage(pg,e[1],e[2],e[3],e[4],0,0,e[3],e[4]);return c;});}

const C=x=>Math.max(0,Math.min(1,x)),TAU=Math.PI*2,
 E=(t,a,b)=>{let q=C((t-a)/(b-a));return q*q*(3-2*q)},L=(a,b,q)=>a+(b-a)*q,
 R=i=>{let x=Math.sin(i*127.1+49.3)*43758.5453;return x-Math.floor(x)};
const main=ctx;let c=main;const impact=8.0,duration=11.4,damageTimes=[...Array.from({length:27},(_,i)=>3.9+i*.10),8.0],layout=BATTLE_LAYOUT;
const sun={x:W*.76,y:232},array={x:435,y:205,rx:420,ry:132};
let wall=0,t=0,raw=0,hitIndex=0,state=null,arrayMaterial='new',closeup=false;const events=[],units=new Map(),tintCache=new Map();let hud=null,heroParts=null,layoutAudit=[];
const mk=(w,h)=>{let v=document.createElement('canvas');v.width=w;v.height=h;return v};
const waves=[{id:0,hit:3.8,n:12,h:144,amount:36800},{id:1,hit:4.5,n:24,h:182,amount:78600},{id:2,hit:5.3,n:36,h:230,amount:168000}];
const sky={x:500,y:195,rx:460,ry:132},ground={x:340,y:600,rx:340,ry:83};
const rings=[{n:12,r:118,h:112,dir:1},{n:16,r:226,h:134,dir:-1},{n:20,r:330,h:155,dir:1}];
const clampPulse=(x,a,b)=>E(x,a,a+.10)*(1-E(x,b-.10,b));

const A={};let assetsReady=false;let sunPixels=[],sunWarp,sunWarpContext,sunWarpData,sunBody,sunBodyContext,sunBodyData,sunTextureKey=null,sunLoopClock=null;
let solarDirection='D',sunSets={},coreSets=[],raySets=[],radianceRays,radianceRaysContext,radianceRaysData;
const SOLAR16_ALIGNMENT={"core": [{"center": [326, 310], "radius": 231, "target": 240, "score": 101.17852175245096}, {"center": [302, 312], "radius": 231, "target": 240, "score": 103.57894454656864}, {"center": [328, 308], "radius": 228, "target": 240, "score": 106.99916513480392}, {"center": [298, 308], "radius": 228, "target": 240, "score": 108.56178462009802}], "rays": [{"center": [328, 320], "radius": 114, "target": 112, "score": 86.55313725490194}, {"center": [321, 324], "radius": 116, "target": 112, "score": 87.09147518382353}, {"center": [328, 300], "radius": 114, "target": 112, "score": 87.4194056372549}, {"center": [323, 302], "radius": 116, "target": 112, "score": 86.42831954656857}]};
const SUN21_ALIGNMENT=[{"frame": 0, "center": [226, 251], "radius": 132, "score": 149.58486764705884}, {"frame": 1, "center": [225, 251], "radius": 132, "score": 138.78976429738566}, {"frame": 2, "center": [224, 251], "radius": 132, "score": 142.39006576797385}, {"frame": 3, "center": [222, 251], "radius": 132, "score": 139.2821866830065}, {"frame": 4, "center": [225, 250], "radius": 132, "score": 140.918658496732}, {"frame": 5, "center": [224, 250], "radius": 132, "score": 141.30993137254904}, {"frame": 6, "center": [224, 250], "radius": 132, "score": 133.93403839869285}, {"frame": 7, "center": [225, 250], "radius": 132, "score": 148.5017283496732}];
async function preload(){const keys=['sword','array','beam','sun_core','sun_sphere','sun_corona','sun_rays','shock','cracks','fire_sea','hit'];for(let i=0;i<8;i++)for(let k of ['flow','arc','beamseq','lc_hit','lc_land'])keys.push(k+i);for(let i=0;i<12;i++)keys.push('lc_beam'+i);await Promise.all(keys.map(k=>new Promise((ok,no)=>{SUN_IMG('s5_'+k).then(im=>{A[k]=im;ok()},no)})));prepareLightAssets();await new Promise((ok,no)=>{SUN_IMG('s7_solid_sword').then(im=>{prepareSolidSword(im);ok()},no)});preparePlatinumLayers();await preloadWheelImages();assetsReady=true;}

const fx=mk(W,H),fxc=fx.getContext('2d'),small4=mk(W/4,H/4),blur4=mk(W/4,H/4),small8=mk(W/8,H/8),blur8=mk(W/8,H/8),litCache=new WeakMap();
let debugMode='normal';const SQ=1,solid=mk(W*SQ,H*SQ),solidc=solid.getContext('2d');
function prepareLightAssets(){for(const key of Object.keys(A)){const im=A[key],isSword=key==='sword',w=im.width,h=isSword?Math.min(1125,im.height):im.height,cv=mk(w,h),g=cv.getContext('2d');g.drawImage(im,0,0);const data=g.getImageData(0,0,w,h),d=data.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let i=(y*w+x)*4,L=(d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722)/255,em=Math.pow(C((L-.055)/.945),1.25),fade=1;
  if(isSword){const yy=y/h,xx=(x-w*.5)/w,spread=yy<.70?.17:yy<.90?.48:.19;fade=Math.exp(-Math.pow(Math.abs(xx)/spread,4));em=Math.pow(C((L-.16)/.84),1.25)*.68;const core=Math.exp(-Math.pow(xx/.025,2))*E(yy,.015,.055)*(1-E(yy,.64,.72));em=Math.max(em,core*(.74+.22*L));}
  d[i]=255;d[i+1]=Math.round(238+15*L);d[i+2]=Math.round(196+50*L);d[i+3]=Math.round(d[i+3]*em*fade);
 }g.putImageData(data,0,0);A[key]=cv;}}
function glow(g,x,y,rx,ry,strength,col='255,244,214'){if(strength<=0)return;g.save();g.translate(x,y);g.scale(rx,ry);g.globalCompositeOperation='screen';const q=g.createRadialGradient(0,0,0,0,0,1);q.addColorStop(0,'rgba('+col+','+strength+')');q.addColorStop(.28,'rgba('+col+','+(strength*.75)+')');q.addColorStop(.65,'rgba('+col+','+(strength*.24)+')');q.addColorStop(1,'rgba('+col+',0)');g.fillStyle=q;g.fillRect(-1,-1,2,2);g.restore();}
function lightLevel(){if(wall<6.6)return lightLevelV8();if(wall<8.8)return L(.55,.88,E(wall,7,8.8))+.08*imperialState().pulse;if(wall<9.4)return .88;return (1-E(impactAge(),.35,1.7))*.88;}
function lightLevelV8(){if(t<2.2)return .86*E(t,.65,1.7);if(t<3.2)return L(.86,.58,sunMorph());if(t<6.6)return .52+.12*Math.pow(.5+.5*Math.cos((t-3.2)*TAU),6);if(t<7.4)return .58*(1-E(t,7.2,7.4));if(t<7.7)return .015;if(t<8)return .12+.8*E(t,7.7,8);return (1-E(impactAge(),.2,1.65))*.9;}
function environmentLight(){
 // The late base delegates back to V8 before 6.6, so enter through V8 only once in that interval.
 if(wall<6.6)return environmentLightV8();
 const h=solarHeatState();if(!h.active||h.intensity<=0){environmentLightCoolBase();return;}
 const a=C(h.intensity);c.save();c.globalAlpha*=1-a;environmentLightCoolBase();c.restore();
 radiantEnvironment({...h,intensity:a});
}
function environmentLightV8(){
 const h=solarHeatState();if(!h.active||h.intensity<=0){environmentLightV8CoolBase();return;}
 const a=C(h.intensity);c.save();c.globalAlpha*=1-a;environmentLightV8CoolBase();c.restore();
 radiantEnvironment({...h,intensity:a});
}
function illuminate(im,bounds){if(litCache.has(im))return litCache.get(im);const w=im.width,h=im.height,fill=mk(w,h),rim=mk(w,h),g=fill.getContext('2d'),r=rim.getContext('2d'),top=bounds?.[1]||0,bottom=bounds?.[3]||h;
 g.drawImage(im,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff9e8';g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-in';const grad=g.createLinearGradient(0,top,0,bottom);grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(.5,'rgba(255,255,255,.60)');grad.addColorStop(1,'rgba(255,255,255,.09)');g.fillStyle=grad;g.fillRect(0,0,w,h);
 r.drawImage(fill,-2,-6);r.globalCompositeOperation='destination-out';r.drawImage(im,0,0);litCache.set(im,{fill,rim});return{fill,rim};}
function bloomComposite(){if(wall<9.4)return bloomCompositeV8();for(const[small,blur,scale,radius]of[[small4,blur4,4,12],[small8,blur8,8,40]]){const g=small.getContext('2d'),b=blur.getContext('2d');g.clearRect(0,0,small.width,small.height);g.drawImage(fx,0,0,small.width,small.height);b.clearRect(0,0,blur.width,blur.height);b.filter='blur('+radius/scale+'px)';b.drawImage(small,0,0);b.filter='none';}main.save();main.globalCompositeOperation='screen';main.globalAlpha=.98;main.drawImage(fx,0,0,W,H);main.globalCompositeOperation='lighter';main.globalAlpha=.12;main.drawImage(blur4,0,0,W,H);main.globalAlpha=.035;main.drawImage(blur8,0,0,W,H);main.restore();}
function bloomCompositeV8(){for(const [small,blur,scale,radius]of[[small4,blur4,4,12],[small8,blur8,8,40]]){const g=small.getContext('2d'),b=blur.getContext('2d');g.clearRect(0,0,small.width,small.height);g.drawImage(fx,0,0,small.width,small.height);b.clearRect(0,0,blur.width,blur.height);b.filter='blur('+radius/scale+'px)';b.drawImage(small,0,0);b.filter='none';b.globalCompositeOperation='source-in';b.fillStyle=scale===4?'#fff2d7':'#ffe9c1';b.fillRect(0,0,b.canvas.width,b.canvas.height);b.globalCompositeOperation='source-over';}
 main.save();main.globalCompositeOperation='screen';main.globalAlpha=.94;main.drawImage(fx,0,0,W,H);main.globalCompositeOperation='lighter';main.globalAlpha=(.40-.34*(E(wall,.8,1.15)*(1-E(wall,2.55,3.2))+E(wall,7.04,7.35)*(1-E(wall,9.1,9.4))));main.drawImage(blur4,0,0,W,H);main.globalAlpha=(.40-.37*(E(wall,.8,1.15)*(1-E(wall,2.55,3.2))+E(wall,7.04,7.35)*(1-E(wall,9.1,9.4))));main.drawImage(blur8,0,0,W,H);main.restore();}
function tex(k,x,y,w,h,a=1,rot=0,blend='screen',ax=.5,ay=.5,filter='none'){if(a<=0||!A[k])return;c.save();c.translate(x,y);c.rotate(rot);c.globalCompositeOperation='screen';c.globalAlpha=C(a);c.filter=filter;c.drawImage(A[k],-w*ax,-h*ay,w,h);c.restore();}
function seq(prefix,q,x,y,w,h,a=1,rot=0,ax=.5,ay=.5){const f=((q%1+1)%1)*8,i=Math.floor(f),u=E(f-i,0,1);tex(prefix+i,x,y,w,h,a*(1-u),rot,'screen',ax,ay);tex(prefix+(i+1)%8,x,y,w,h,a*u,rot,'screen',ax,ay);}
function impactSeq(prefix,age,x,y,w,h,a=1){const f=Math.min(7,3+age*12),i=Math.floor(f),q=E(f-i,0,1);tex(prefix+i,x,y,w,h,a*(1-q),0,'screen',.5,.80,'none');tex(prefix+Math.min(7,i+1),x,y,w,h,a*q,0,'screen',.5,.80,'none');}
function sunPower(){return lightLevel();}
function pulse(x,w){return Math.exp(-Math.pow((t-x)/w,2));}
// v8: an enemy-side sun continuously unfolds into the existing array geometry.



function sword(x,y,h,a,seed=0,angle=0,depth=1,energy=1){
 if(a<=0||h<=0)return;const tip=y+h*.49,w=h*424/1507*(h>600?3.5:1.2),m=c.getTransform(),g=swordFx();
 g.save();g.setTransform(m.a*SQ,m.b*SQ,m.c*SQ,m.d*SQ,m.e*SQ,m.f*SQ);g.translate(x,tip);g.rotate(angle);
 drawEnergySword(g,w,h,-h,a,energy*(depth<.45?.82:depth<.75?.92:1),seed);g.restore();
}
function star(x,y,r,a=1){tex('hit',x,y,r*3,r*3,a);}
function lightPath(draw,width,alpha=1){if(width>2.4)return;c.save();c.globalCompositeOperation='screen';c.lineCap='round';c.lineWidth=width;c.strokeStyle='#fff8e6';c.globalAlpha=alpha;c.beginPath();draw(c);c.stroke();c.restore();}
function shock(x,y,age,radius,life){if(age<0||age>life)return;const q=C(age/life),r=radius*Math.pow(q,.6);tex('shock',x,y,r*2,r*.66,(1-q)*.95);}
function crack(x,y,r,seed,a,big=false){tex('cracks',x,y,r*2,r*.57,a*(big?.83:.55),0);}
function beam(){if(sunLoopClock!==null)return;if(t<.18||t>2.2)return;const reach=E(t,.18,.8),alpha=1-E(t,1.65,2.2),f=finger(),ex=L(f.x,430,reach),ey=L(f.y,sky.y,reach),length=Math.hypot(ex-f.x,ey-f.y),angle=Math.atan2(ey-f.y,ex-f.x)-Math.PI/2,pulse=.94+.06*Math.sin(t*25);if(length<.01)return;c.save();c.translate(f.x,f.y);c.rotate(angle);c.globalCompositeOperation='screen';
 function taper(scale,a,blur){c.save();c.filter='blur('+blur+'px)';c.globalAlpha=alpha*a*pulse;const grad=c.createLinearGradient(0,0,0,length);grad.addColorStop(0,'#fffdfa');grad.addColorStop(.8,'#fffef8');grad.addColorStop(1,'#ffffff');c.fillStyle=grad;c.beginPath();c.moveTo(-3*scale,0);c.lineTo(-10*scale,length);c.lineTo(10*scale,length);c.lineTo(3*scale,0);c.closePath();c.fill();c.restore();}
 taper(1.9,.13,7);taper(1,.22,1.8);taper(.30,.83,.25);
 const phase=t*2,idx=Math.floor((phase%1)*8);c.save();c.globalAlpha=alpha*.37;c.drawImage(A['v10shaft'+idx],-12,0,24,length);c.restore();
 for(let j=0;j<7;j++){const flick=.32+.68*Math.pow(.5+.5*Math.sin(t*(35+j*3)+j*4.7),3);c.save();c.globalAlpha=alpha*flick*.62;c.lineWidth=.45+(j%3)*.28;c.strokeStyle=j%3?'#fffdf5':'#ead7ad';c.shadowColor='#fff9e5';c.shadowBlur=2;c.beginPath();for(let k=0;k<=80;k++){const u=k/80,rad=3+u*7,x=Math.sin(u*TAU*(2.2+j*.12)-t*20+j*1.7)*rad*.75+Math.sin(u*51+t*37+j)*.65;const y=u*length;k?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();c.restore();}
 c.restore();tex('hit',f.x,f.y,40,40,alpha*.7);tex('hit',ex,ey,46,46,alpha*.65);
 for(let j=0;j<20;j++){const life=((t*2.8+j*.137)%1+1)%1,u=R(j+22),x=L(f.x,ex,u)+(R(j+54)-.5)*life*32,y=L(f.y,ey,u)+life*life*48;star(x,y,.6+R(j)*1.1,alpha*Math.sin(Math.PI*life)*.7);}}
function originBurst(){const f=finger(),p=E(t,0,.45)*(1-E(t,1.1,1.55));if(p>0){glow(c,f.x,f.y,130,130,p*.35);tex('hit',f.x,f.y,108,108,p*.9);tex('hit',f.x,f.y,9,126,p*.6);tex('hit',f.x,f.y,126,9,p*.6);}if(t<.8)for(let i=0;i<28;i++){const q=C((t-R(i)*.25)/.55),an=i*2.399,dist=(1-q)*(100+R(i+100)*270);if(q>0&&q<1)star(f.x+Math.cos(an)*dist,f.y+Math.sin(an)*dist*.65,1.2+q*2,Math.sin(q*Math.PI)*.65);}}




function phaseName(){return wall<.8?'引光入空':wall<2.2?'白金日轮凝聚':wall<3.2?'日轮舒展结阵':wall<6.6?'法阵幻剑·连绵剑雨':wall<6.94?'群剑拔地':wall<8.1?'龙卷剑涡·盘旋上升':wall<8.8?'收窄汇流·凝聚日轮':wall<9.1?'白金日轮悬停':wall<9.4?'落日一击':wall<10.2?'万丈光芒':'余晖回流';}
function arrayPlane(isGround){if(!isGround&&wall>=2.0&&wall<3.2){solarArrayWeave();return;}if(wall<6.6)return arrayPlaneV8(isGround);if(wall>=8.8)return;const q=E(wall,7,8.8),clock=6.6+Math.max(0,wall-7),u=Math.max(0,wall-7),angle=(6.6-3.2)*(isGround?TAU/15:-TAU/13.5)+(isGround?1:-1)*TAU*(.05*u+.30*u*u),x=isGround?ground.x:L(sky.x,430,q),y=isGround?ground.y:L(sky.y,180,q),rx=(isGround?ground.rx:sky.rx)*(1-.95*q),ry=(isGround?ground.ry:sky.ry)*(1-.86*q),alpha=(isGround?.58:1)*(1-E(wall,8.25,8.8));c.save();c.translate(x,y);c.scale(rx/420,ry/132);c.translate(-435,-205);SUN_ARRAY_V8.render(c,A,clock,{a:alpha,grow:1,reveal:1,morph:1,angle,dust:false},'new');c.restore();}
function arrayPlaneV8(isGround){if(t<.8)return;const st=sunGeometry();if(!isGround&&t>=8)return;if(isGround&&t<2.2)return;let x=st.x,y=st.y,rx=st.rx,ry=st.ry,m=st.morph,alpha=st.alpha;
 if(!isGround&&t>=7.4){const f=finalSun();x=f.x;y=f.y;rx=f.r*1.26;ry=f.r*1.18;}
 if(isGround){x=ground.x;y=ground.y;rx=ground.rx*(.12+.88*E(t,2.2,3.2));ry=ground.ry*(.12+.88*E(t,2.2,3.2));m=1;alpha=E(t,2.2,2.45)*.58;if(t>=7.4&&t<8)alpha*=.06+.94*E(t,7.7,8);if(t>=8)alpha*=1-E(impactAge(),0,.16);}
 if(alpha<=0)return;const heartbeat=.88+.12*Math.pow(.5+.5*Math.cos((t-3.2)*TAU),6);alpha*=heartbeat;
 if(!isGround&&t<3.2)orbSkin(x,y,rx,ry,m,alpha);
 c.save();c.translate(x,y);c.scale(rx/420,ry/132);c.translate(-435,-205);SUN_ARRAY_V8.render(c,A,flowTime(),{a:alpha*(isGround?1:Math.pow(m,1.15)),grow:1,reveal:1,morph:m,angle:(flowTime()-3.2)*(isGround?TAU/15:-TAU/13.5),dust:false},'new');c.restore();
 if(!isGround&&t>=3.2&&t<6.6){for(let j=0;j<42;j++){const q=((t*.28+j*.173)%1+1)%1,an=j*2.399-t*TAU/13.5,rr=.6+R(j+2)*.40,xx=x+Math.cos(an)*rx*rr,yy=y+Math.sin(an)*ry*rr+q*145;star(xx,yy,1.0+R(j)*1.6,Math.sin(q*Math.PI)*.38);}}
}






function returnLights(){
 if(t<8.4)return;const tail=1-E(wall,11.1,11.35);if(tail<=0)return;
 const q=E(t,8.4,9.95),f=finger();
 for(let i=0;i<120;i++){const start=8.4+R(i)*.55,p=C((t-start)/(9.98-start));if(p<=0||p>=1)continue;const sx=340+(R(i+7)-.5)*1000,sy=140+R(i+11)*500,x=L(sx,f.x,p),y=L(sy,f.y,p)-Math.sin(p*Math.PI)*100;star(x,y,(1+R(i+4)*2.6)*(1-.3*p),Math.sin(p*Math.PI)*.75*tail);}
 for(let i=0;i<34;i++){const yy=240+R(i+200)*280+(t-8.4)*50;star(120+R(i+400)*850,yy,1.1+R(i)*1.7,(1-q)*.4*tail);}
 tex('hit',f.x,f.y,55*(1-q),55*(1-q),Math.sin(q*Math.PI)*.6*tail);
}
function prepareSolidSword(im){
 // The shared material is untouched: only the array ornaments use its RGB.
 const cv=mk(424,1507),g=cv.getContext('2d');g.drawImage(im,300,10,424,1507,0,0,424,1507);const d=g.getImageData(0,0,424,1507);
 for(let i=3;i<d.data.length;i+=4)d.data[i]=Math.round(C((d.data[i]/255-.65)/.35)*255);g.putImageData(d,0,0);A.solid=cv;
 const edge=mk(424,1507),e=edge.getContext('2d');e.drawImage(cv,0,0);e.globalCompositeOperation='source-in';e.fillStyle='#efd9ad';e.fillRect(0,0,424,1507);A.solidEdge=edge;
 prepareEnergySword();
}
function beginFx(){
 fxc.setTransform(1,0,0,1,0,0);fxc.clearRect(0,0,W,H);
 solidc.setTransform(1,0,0,1,0,0);solidc.clearRect(0,0,W*SQ,H*SQ);
 const g=swordFx();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W*SQ,H*SQ);swordFx.dirty=false;c=fxc;
}
function finishFx(){
 c=main;bloomComposite();main.save();main.imageSmoothingEnabled=true;main.imageSmoothingQuality='high';main.globalCompositeOperation='source-over';main.globalAlpha=1;main.drawImage(solid,0,0,W,H);
 if(swordFx.dirty){
  main.globalCompositeOperation='screen';main.drawImage(swordFx.layer,0,0,W,H);
  // 实战优化（Claude）：原版每帧对整层剑光做三次 filter 模糊（手机上很吃性能）。改成逐级缩小再放大——双线性放大本身就是柔光，观感接近，开销小一个数量级。
  if(!swordFx.bloom)swordFx.bloom=[{scale:4,gain:1.02},{scale:8,gain:.62},{scale:16,gain:.30}].map(v=>({...v,c:mk(Math.ceil(W/v.scale),Math.ceil(H/v.scale))}));
  let src=swordFx.layer;
  for(const b of swordFx.bloom){const g=b.c.getContext('2d');g.imageSmoothingEnabled=true;g.globalCompositeOperation='copy';g.drawImage(src,0,0,b.c.width,b.c.height);src=b.c;
   main.globalCompositeOperation='screen';main.globalAlpha=b.gain;main.drawImage(b.c,0,0,W,H);}
 }
 main.restore();
}
function rainItems(){
 if(rainItems.cache)return rainItems.cache;const list=[],acc=100/6.8;
 for(let i=0;i<238;i++){
  const u=(-20+Math.sqrt(400+4*acc*(i+.5)))/(2*acc),birth=3.2+u,seed=4000+i*17,k=i%10<3?0:i%10<7?1:2,ring=[.56,.705,.84,.971][i%4];
  let an=i*2.399-(birth-3.2)*TAU/13.5,ox=sky.x+Math.cos(an)*sky.rx*ring;
  // Reflect the ally-side spawn around the array's vertical axis: still exactly on its ring.
  if(ox>640){an=Math.PI-an;ox=sky.x+Math.cos(an)*sky.rx*ring;}
  const oy=sky.y+Math.sin(an)*sky.ry*ring,grow=.09+R(seed+10)*.055,y=k===0?335+R(seed+3)*95:k===1?495+R(seed+3)*120:625+R(seed+3)*85;
  const initial=(ox<180?-1:1)*(10+R(seed+5)*10)*Math.PI/180,x=Math.max(60,Math.min(610,ox-(y-oy)*Math.tan(initial))),angle=Math.atan2(ox-x,y-oy);
  const size=k===0?70+R(seed+4)*12:k===1?86+R(seed+4)*22:111+R(seed+4)*19,flight=k===0?.46+R(seed+6)*.12:k===1?.35+R(seed+6)*.14:.30+R(seed+6)*.12,hit=birth+grow+flight;
  list.push({id:i,seed,k,ring,an,ox,oy,x,y,size,angle,birth,grow,flight,hit,depth:[.3,.65,.95][k]});
 }
 return rainItems.cache=list;
}
function renderRain(layer){if(t<3.2||t>=6.6)return;for(const p of rainItems()){if((layer==='far')!==(p.k===0))continue;const pose=rainPose(p,t);if(!pose)continue;const age=t-p.hit;if(age<0&&!pose.growing){for(let j=2;j>=1;j--){const prev=rainPose(p,t-j*.035);if(prev)sword(prev.x,prev.y,prev.h,.25/j,p.seed,prev.angle,p.depth,.95);}}sword(pose.x,pose.y,pose.h,1,p.seed,pose.angle,p.depth,age<0?1.12:L(1.10,.55,E(age,.08,.55)));if(pose.growing)tex('hit',p.ox,p.oy,28,16,.48);if(age>=0){const pop=1-E(age,.015,.14);tex('hit',p.x,p.y,16+p.size*.15,16+p.size*.15,pop*(p.k===0?.3:.7));tex('shock',p.x,p.y,21+p.size*.13,5+p.size*.02,(1-E(age,.08,.28))*.32);if(p.k>0){crack(p.x,p.y,15+p.size*.08,p.seed,(1-E(age,.1,.55))*.30);for(let j=0;j<4;j++){const an=R(p.seed+j)*TAU,px=p.x+Math.cos(an)*age*(65+R(j+p.id)*90),py=p.y-90*age+180*age*age+Math.sin(an)*age*40;star(px,py,1.1+R(j+p.id)*1.3,(1-E(age,.08,.24))*.7);}}}}}
function renderArrayDetail(){c=main;main.fillStyle='#071225';main.fillRect(0,0,W,H);beginFx();c.save();c.translate(640,350);c.scale(1.05,1.42);c.translate(-435,-205);SUN_ARRAY_V8.render(c,A,4.1,{a:1,grow:1,reveal:1,morph:1,angle:.18,dust:false},'new');c.restore();finishFx();main.fillStyle='#fff7e9';main.font='600 25px '+FONT;main.fillText('v12 · 保留原法阵',32,48);}
function sunMorph(){return E(t,2.2,3.2);}
function sunGeometry(){const m=sunMorph(),q=E(t,.8,1.9),closing=E(t,6.6,7.4);return{x:L(L(430,sky.x,m),430,closing),y:L(sky.y,180,closing),rx:L(L(112,144,q),sky.rx,m)*(1-.69*closing),ry:L(L(112,144,q),sky.ry,m)*(1-.03*closing),morph:m*(1-closing),alpha:E(t,.78,1.42)*(1-E(t,8,8.3)),closing};}
function impactAge(){return raw<8.2?0:raw-8.2;}
function finalSun(){const q=E(t,6.6,7.4),f=C((t-7.7)/.3),fall=f*f;return{x:L(430,340,fall),y:L(180,440,fall),r:L(104,160,fall),q,fall,age:impactAge()};}
function shadows(){const power=lightLevel();if(power<=0)return;for(const u of battle.units){const f=units.get(u),rr=reaction(u);c.save();c.translate(u.x+rr.dx,u.y);const dx=(u.x-430)/500;c.transform(1,0,dx*.65,-.16-.36*power,0,0);c.scale(f.scale,f.scale);c.globalAlpha=.12+power*.17;c.filter='blur(3px)';c.drawImage(tinted(f.im,'#020714'),-f.footX,-f.footY);c.restore();}}
function orbSkin(x,y,rx,ry,m,alpha,late=false){drawSolarMaterial(x,y,rx,ry,m,alpha,sunLoopClock===null?flowTime()-.8:sunLoopClock,0);}
function rainPose(p,clock){if(clock<p.birth)return null;const g=C((clock-p.birth)/p.grow);if(g<1)return{x:p.ox,y:p.oy+p.size*g*.45,h:p.size*g,angle:p.angle,growing:true};const q=C((clock-p.birth-p.grow)/p.flight),v=.4*q+.6*q*q;return{x:L(p.ox,p.x,v),y:L(p.oy+p.size*.45,p.y-p.size*.49,v),h:p.size,angle:p.angle,growing:false};}
function recallPose(p,clock){
 const plan=recallPlan(p),{start,pull,launch,arrival,initialAngle}=plan;
 if(clock<launch){const lifted=E(clock,pull,launch),turn=E(clock,pull+.02,launch);
  return{...start,x:start.x,y:start.y-plan.lift*lifted,angle:shortAngle(start.angle,initialAngle,turn),alpha:1,depth:p.depth,brightness:1,q:0,phase:clock<pull?'held':'drawing',hero:plan.hero};}
 const u=C((clock-launch)/(arrival-launch)),v=recallCurve(plan,u),front=.5+.5*Math.sin(v.theta),orbitDepth=.32+.68*front;
 const depth=L(p.depth,orbitDepth,E(u,0,.18)*(1-E(u,.84,1)));
 const visibility=L(1,.35+.65*front,E(u,0,.18)*(1-E(u,.84,1)));
 return{...v,h:start.h,alpha:clock<arrival+.035?visibility:0,depth,brightness:1,phase:clock<arrival?'flying':'inside',hero:plan.hero,arrival};
}
function recallSwords(){
 if(wall<6.6||wall>=8.8)return;const core=imperialState(),rows=rainItems().map(p=>({p,v:recallPose(p,wall)})).sort((a,b)=>a.v.depth-b.v.depth);
 for(const{p,v}of rows){if(v.alpha<=0)continue;const plan=recallPlan(p);
  // Detached sword silhouettes follow the real helical path; no drawn spiral strings.
  if(v.phase==='flying'&&wall>plan.launch+.045){
   for(let j=2;j>=1;j--){const prev=recallPose(p,wall-j*.012);recallBlade(p,prev,(j===1?.10:.04)*(v.depth<.55?.18:1),core);}
  }
  recallBlade(p,v,1,core);
  if(v.phase==='drawing'&&plan.grounded){const age=wall-plan.pull,flash=(1-E(age,.015,.10))*.22;tex('hit',p.x,p.y,18,10,flash);}
 }
 if(core.alpha>0)imperialSun(core.x,core.y,core.r,core.alpha,core.pulse);
}
function sunset(){if(wall<8.8)return;const s=finalSun(),age=impactAge();if(t<8){if(wall>=9.1)for(let j=2;j>=1;j--){const q=C((wall-9.1-j*.025)/.3),fall=q*q;imperialSun(L(430,340,fall),L(180,440,fall),L(104,160,fall),.08/j);}imperialSun(s.x,s.y,s.r,1);return;}
 radiantRays();const fade=1-E(age,.45,1.5);c.save();c.beginPath();c.ellipse(340,600,220,160,0,Math.PI,TAU);c.lineTo(560,600);c.closePath();c.clip();glow(c,340,590,215,160,fade*.65,'255,255,255');impactSeq('lc_land',age,340,600,500,350,fade*.34);c.save();c.translate(340,600);c.scale(215,150);c.globalCompositeOperation='screen';const dome=c.createRadialGradient(0,.12,0,0,.12,1.03);dome.addColorStop(0,'rgba(255,255,255,'+(fade*.72)+')');dome.addColorStop(.62,'rgba(255,253,241,'+(fade*.44)+')');dome.addColorStop(.86,'rgba(255,245,215,'+(fade*.28)+')');dome.addColorStop(1,'transparent');c.fillStyle=dome;c.fillRect(-1,-1,2,1);c.restore();c.restore();tex('shock',340,600,350+E(age,0,.6)*1150,110+E(age,0,.6)*240,fade*.30);crack(340,600,530,812,(1-E(age,.60,1.7))*.65,true);debris(340,600,age,731,true);
 for(let j=0;j<96;j++){const an=j*2.399,rr=age*(100+R(j+9)*480);star(340+Math.cos(an)*rr,570+Math.sin(an)*rr*.6-age*100+age*age*75,1+R(j)*2.5,(1-E(age,.6,1.6))*.75);}}
function renderSunDetail(){render(1.95);}
function centerSword(x,y,h,a,seed,angle,depth){sword(x-Math.sin(angle)*h*.5,y-h*.49+Math.cos(angle)*h*.5,h,a,seed,angle,depth);}
function airRefraction(cam){
 const heat=solarHeatState();if(!heat.active||heat.intensity<=0){airRefractionCoolBase(cam);return;}
 // render() calls this before shadows, units and effects: only the existing backdrop is sampled.
 const cv=airRefraction.cache||(airRefraction.cache=mk(W,H)),g=cv.getContext('2d');g.clearRect(0,0,W,H);g.drawImage(main.canvas,0,0,W,H);const m=main.getTransform(),cx=W*.5+(heat.x-W*.5)*cam.zoom,cy=H*.53+(heat.y-H*.53)*cam.zoom,phase=heat.phase;
 main.save();main.setTransform(m.a/cam.zoom,0,0,m.d/cam.zoom,0,0);
 for(const region of[{x:cx,y:cy-heat.r*.45,rx:Math.max(200,heat.r*2.30)*cam.zoom,ry:Math.max(210,heat.r*2.65)*cam.zoom,power:2.8},{x:W*.5+(heat.groundX-W*.5)*cam.zoom,y:H*.53+(555-H*.53)*cam.zoom,rx:365*cam.zoom,ry:108*cam.zoom,power:1.0}]){
  const low=Math.max(0,Math.floor(region.y-region.ry)),high=Math.min(H,Math.ceil(region.y+region.ry));
  for(let yy=low;yy<high;yy+=2){const normalized=(yy-region.y)/region.ry,envelope=Math.max(0,1-normalized*normalized),half=region.rx*Math.sqrt(envelope),xx=Math.max(0,region.x-half),width=Math.min(W,region.x+half)-xx;if(width<1)continue;const shift=(Math.sin(yy*.060-phase*2)*.72+Math.sin(yy*.135+phase*3)*.28)*region.power*envelope*heat.intensity;main.globalAlpha=.68*envelope;main.drawImage(cv,xx,yy,width,2,xx+shift,yy,width,2);}
 }
 main.restore();
}
function flowTime(){return t-(t>=7.7?.3:0)-(t>=8.2?.2:0);}
function preparePlatinumLayers(){
 const core=mk(512,512),g=core.getContext('2d');g.drawImage(A.sun_core,0,0,512,512);g.globalCompositeOperation='destination-in';const m=g.createRadialGradient(256,256,30,256,256,242);m.addColorStop(0,'white');m.addColorStop(.5,'rgba(255,255,255,.8)');m.addColorStop(.8,'rgba(255,255,255,.18)');m.addColorStop(1,'transparent');g.fillStyle=m;g.fillRect(0,0,512,512);A.v10core=core;
 for(let i=0;i<8;i++){const im=A['beamseq'+i],v=mk(128,512),q=v.getContext('2d');q.drawImage(im,im.width*.23,im.height*.25,im.width*.54,im.height*.48,0,0,128,512);q.globalCompositeOperation='destination-in';const a=q.createLinearGradient(0,0,128,0);a.addColorStop(0,'transparent');a.addColorStop(.32,'white');a.addColorStop(.68,'white');a.addColorStop(1,'transparent');q.fillStyle=a;q.fillRect(0,0,128,512);A['v10shaft'+i]=v;}
 for(const [key,col]of[['v10swordLight','#fffdf4'],['v10swordShade','#77808d']]){const v=mk(A.solid.width,A.solid.height),q=v.getContext('2d');q.drawImage(A.solid,0,0);q.globalCompositeOperation='source-in';q.fillStyle=col;q.fillRect(0,0,v.width,v.height);A[key]=v;}
}
function riverCenter(clock){return{x:430,y:L(250,180,E(clock,7.9,8.8))};}
function frozenSword(p){const v=rainPose(p,6.6);return{x:v.x+Math.sin(v.angle)*v.h*.5,y:v.y+v.h*.49-Math.cos(v.angle)*v.h*.5,h:v.h,angle:v.angle};}
function shortAngle(a,b,q){return a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*q;}
function riverInfo(p){const start=frozenSword(p),group=p.id%5,rank=(Math.floor(p.id/5)+.3+R(p.seed+31)*.4)/48;return{start,group,rank};}
function riverPoint(group,s,clock){const u=C((clock-7)/1.4),q=u*u,center=riverCenter(clock),angle=group*TAU/5+TAU*(.03+.33*q)+1.35*s,radius=(72+430*s)*(1-.22*q),yy=center.y+Math.sin(angle)*radius*.48;
 return{x:center.x+Math.cos(angle)*radius,y:42+17*Math.log(1+Math.exp((yy-42)/17)),angle,radius};}
function riverRibbon(group){const clock=Math.min(wall,8.4),u=C((clock-7)/1.4),join=E(wall,7,7.38),fade=1-E(wall,8.4+group*.075,8.55+group*.05);if(join*fade<=0)return;const points=[];for(let j=0;j<=65;j++)points.push(riverPoint(group,(.10+.90*j/65)*(1-.57*u*u),clock));c.save();c.globalCompositeOperation='screen';c.lineCap='round';c.lineJoin='round';
 for(const[w,a,b]of[[24,.075,5],[8,.15,1.8],[1.8,.25,0]]){c.filter='blur('+b+'px)';c.lineWidth=w;c.strokeStyle='#fff9e8';c.globalAlpha=join*fade*a;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}c.filter='none';
 for(let j=0;j<50;j++){const s=((j/50+wall*.19)%1),p=riverPoint(group,(.10+.90*s)*(1-.57*u*u),clock);star(p.x+Math.sin(j*9)*3,p.y+Math.cos(j*5)*3,.7+R(j+group*31),join*fade*.35);}c.restore();}
function imperialState(){return recallCoreState(wall);}
function imperialSun(x,y,r,a=1,pulse=0){const clock=sunLoopClock!==null?sunLoopClock:wall<8.8?wall-7.04:wall<9.1?1.76:wall-7.34;drawSolarMaterial(x,y,r,r,0,a,clock,pulse);}
function radiantRays(){const age=impactAge(),expand=.12+.88*E(age,0,.4),fade=1-E(age,.4,1.4),x=340,y=565;if(fade<=0)return;for(let j=0;j<224;j++){const sector=j/224*TAU,angle=sector+(R(j+743)-.5)*.012+age*.065,dx=Math.cos(angle),dy=Math.sin(angle),edge=Math.min(dx>0?(W-x)/dx:dx<0?-x/dx:9999,dy>0?(H-y)/dy:dy<0?-y/dy:9999),len=edge*(j%7===0?1.15:.76+R(j+102)*.56)*expand,width=(j%7===0?32+R(j+25)*26:5+R(j+25)*13)*(1-.14*E(age,.6,1.4)),a=(j%7===0?.62:.14+R(j+86)*.20)*fade;tex('v10shaft'+(j%8),x+dx*(len*.5+16),y+dy*(len*.5+16),width,len,a,angle-Math.PI/2);}}
function prepareSunSequence(){
 coreSets=[];raySets=[];const size=768;
 for(let i=0;i<4;i++){
  const p=SOLAR16_ALIGNMENT.core[i],im=A['core'+i],v=mk(size,size),g=v.getContext('2d'),scale=288/p.radius;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,384-p.center[0]*scale,384-p.center[1]*scale,im.width*scale,im.height*scale);coreSets.push(g.getImageData(0,0,size,size).data);
  const rp=SOLAR16_ALIGNMENT.rays[i],rim=A['rays'+i],small=mk(640,640),sg=small.getContext('2d'),s=112/rp.radius;sg.imageSmoothingEnabled=true;sg.imageSmoothingQuality='high';sg.drawImage(rim,320-rp.center[0]*s,320-rp.center[1]*s,rim.width*s,rim.height*s);const src=sg.getImageData(0,0,640,640).data,out=new Uint8ClampedArray(1024*1024*4);
  for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){const dx=x-512,dy=y-512,rr=Math.hypot(dx,dy),dest=(y*1024+x)*4;if(rr<76||rr>512)continue;const sr=rr<90?rr*112/90:112+(rr-90)*208/422,xx=320+dx/rr*sr,yy=320+dy/rr*sr;if(xx<0||yy<0||xx>=639||yy>=639)continue;const ix=Math.floor(xx),iy=Math.floor(yy),fx=xx-ix,fy=yy-iy,k=(iy*640+ix)*4,ids=[k,k+4,k+2560,k+2564],weights=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy];let al=0;for(let j=0;j<4;j++)al+=src[ids[j]+3]*weights[j];if(al<1)continue;for(let ch=0;ch<3;ch++){let sum=0;for(let j=0;j<4;j++)sum+=src[ids[j]+ch]*src[ids[j]+3]*weights[j];out[dest+ch]=sum/al;}out[dest+3]=al*E(rr,76,92)*(1-E(rr,465,512));}
  raySets.push(out);
 }
 sunPixels=coreSets;sunSets.D=coreSets;sunWarp=mk(1024,1024);sunWarpContext=sunWarp.getContext('2d');sunWarpData=sunWarpContext.createImageData(1024,1024);sunBody=mk(768,768);sunBodyContext=sunBody.getContext('2d');sunBodyData=sunBodyContext.createImageData(768,768);
}
function sunCoreRadius(r){return r*.80;}
function buildSolarTexture(clock,m,pulse=0){
 const key=clock.toFixed(7)+':'+m.toFixed(7)+':'+pulse.toFixed(5);if(sunTextureKey===key)return;sunTextureKey=key;
 const phase=((clock*4/3)%4+4)%4,i=Math.floor(phase),f=E(phase-i,0,1);
 const ca=coreSets[i],cb=coreSets[(i+1)%4],p=sunBodyData.data;
 for(let k=0;k<p.length;k+=4){const aa=ca[k+3]/255,ab=cb[k+3]/255,al=L(aa,ab,f);if(al<.005){p[k+3]=0;continue;}let tone=.18;if(pulse>0){const pixel=k/4,rr=Math.hypot(pixel%768-384,Math.floor(pixel/768)-384)/288,an=Math.atan2(Math.floor(pixel/768)-384,pixel%768-384),wave=Math.pow(.5+.5*Math.sin(rr*12-clock*13+an*2),2);tone+=.07*pulse*wave*(1-E(rr,.8,1.2));}for(let ch=0;ch<3;ch++){const raw=((1-f)*ca[k+ch]*aa+f*cb[k+ch]*ab)/al;p[k+ch]=L(raw,255,tone);}p[k+3]=255*C((al-.012)/.988);}
 const a=raySets[i],b=raySets[(i+1)%4],d=sunWarpData.data;
 for(let k=0;k<d.length;k+=4){const aa=a[k+3]/255,ab=b[k+3]/255,al=L(aa,ab,f);if(al<.005){d[k+3]=0;continue;}const ix=k/4,dx=ix%1024-512,dy=Math.floor(ix/1024)-512,rad=Math.hypot(dx,dy),theta=Math.atan2(dy,dx);for(let ch=0;ch<3;ch++)d[k+ch]=((1-f)*a[k+ch]*aa+f*b[k+ch]*ab)/al;const lum=(d[k]*.2126+d[k+1]*.7152+d[k+2]*.0722)/255,energy=.02+.98*Math.pow(lum,5),gain=L(.92,.17,E(rad,112,480)),stream=.94+.06*Math.sin(rad*.030-clock*TAU*2+Math.sin(theta*7)*1.4);d[k+3]=255*al*energy*gain*stream;}
 if(m>0)unfoldSolarBody(p,m);sunWarpContext.putImageData(sunWarpData,0,0);sunBodyContext.putImageData(sunBodyData,0,0);
}
function drawSolarMaterial(x,y,rx,ry,m,alpha,clock,pulse=0){
 if(alpha<=0||rx<=0||!A.wheel0)return;const forming=wall<2?E(wall,.80,1.65):1,breath=.965+.025*Math.sin(clock*2.2)+pulse*.035;
 for(let i=0;i<4;i++)wheelTexture(i,clock,forming);
 c.save();c.translate(x,y);c.scale(1,ry/rx);c.globalCompositeOperation='screen';
 const rayA=alpha*(.17+.05*pulse)*(1-E(m,.15,.8));tex('wheel3',0,0,rx*4.35,rx*4.35,rayA,clock*.018);
 tex('wheel2',0,0,rx*3.04,rx*3.04,alpha*.44*breath,-clock*TAU/27-.23);
 tex('wheel1',0,0,rx*2.68,rx*2.68,alpha*.85*breath,clock*TAU/18);
 tex('wheel2',0,0,rx*2.30,rx*2.30,alpha*.21,clock*TAU/31+.55);
 tex('wheel0',0,0,rx*1.36,rx*1.36,alpha*(.78+.08*pulse),-clock*.12);
 glow(c,0,0,rx*1.33,rx*1.33,alpha*.045,'255,250,230');
 glow(c,0,0,rx*.42,rx*.42,alpha*.19,'255,253,244');
 c.restore();
}
function renderSunLoop(z){sunLoopClock=z;render(2.18);sunLoopClock=null;}
function recallPlan(p){
 if(recallPlan.cache?.has(p.id))return recallPlan.cache.get(p.id);
 if(!recallPlan.cache){recallPlan.cache=new Map();recallPlan.heroes=rainItems().filter(v=>v.k===2).sort((a,b)=>b.size-a.size).slice(0,6).map(v=>v.id);}
 const start=frozenSword(p),seed=p.seed,hero=recallPlan.heroes.indexOf(p.id),grounded=p.hit<=6.6;
 const pull=6.62+p.k*.045+R(seed+117)*.10,launch=pull+.12+R(seed+118)*.035;
 const arrival=8.32+p.k*.105+R(seed+119)*.21;
 const lift=(grounded?23+R(seed+120)*23:10+R(seed+120)*12),p0={x:start.x,y:start.y-lift},end=riverCenter(arrival);
 const radius=150+R(seed+122)*65,phase=p.id*2.399963229728653,turns=1.85+R(seed+123)*.40;
 const value={start,pull,launch,arrival,lift,p0,end,radius,phase,turns,hero,grounded,depth:p.depth};
 value.initialAngle=recallCurve(value,0).angle;recallPlan.cache.set(p.id,value);return value;
}
function recallCurve(plan,u){
 const v=vortexPoint(plan,u),angles=vortexHeadings(plan),f=C(u)*720,j=Math.min(719,Math.floor(f));
 return{...v,angle:L(angles[j],angles[j+1],f-j)};
}
function recallCoreState(clock){
 const center=riverCenter(clock);let swallowed=0,pulse=0;
 for(const p of rainItems()){const plan=recallPlan(p);swallowed+=E(clock,plan.arrival-.15,plan.arrival+.015);}
 for(const[at,amp]of[[8.34,.25],[8.47,.35],[8.60,.45],[8.72,.55]])pulse+=amp*Math.exp(-Math.pow((clock-at)/.065,2));
 const q=swallowed/238,r=22+34*E(clock,7.04,7.50)+48*Math.pow(q,.65);
 return{x:center.x,y:center.y,r,alpha:E(clock,7.04,7.32),pulse:Math.min(1,pulse)*(1-E(clock,8.77,8.8)),swallowed,swallowFraction:q,maskRadius:sunCoreRadius(r)};
}
function recallBlade(p,v,strength,core){
 if(v.alpha<=0||strength<=0)return;const h=v.h,w=h*424/1507*1.2,m=c.getTransform(),g=swordFx();
 g.save();g.setTransform(m.a*SQ,m.b*SQ,m.c*SQ,m.d*SQ,m.e*SQ,m.f*SQ);
 if(core.alpha>.7){g.beginPath();g.rect(-1000,-1000,W+2000,H+2000);g.moveTo(core.x+core.maskRadius,core.y);g.arc(core.x,core.y,core.maskRadius,0,TAU);g.clip('evenodd');}
 g.translate(v.x,v.y);g.rotate(v.angle);const near=E(Math.hypot(v.x-core.x,v.y-core.y),core.maskRadius+24,core.maskRadius+170),energy=v.phase==='flying'?L(.70,1.2,near):v.phase==='drawing'?1:.76;
 drawEnergySword(g,w,h,-h*.5,v.alpha*strength,energy*(v.depth<.45?.82:v.depth<.75?.92:1),p.seed);g.restore();
}
function auditRecall(){
 let maxStartPositionError=0,maxStartAngleError=0,maxLaunchPositionError=0,maxLaunchAngleError=0,maxHeightChange=0,minEndOcclusionMargin=Infinity,maxFrameTravel=0;const items=rainItems();
 for(const p of items){const start=frozenSword(p),a=recallPose(p,6.6),plan=recallPlan(p),before=recallPose(p,plan.launch-1e-7),after=recallPose(p,plan.launch+1e-7),core=recallCoreState(plan.arrival+.02),end=recallPose(p,plan.arrival+.02);
  maxStartPositionError=Math.max(maxStartPositionError,Math.hypot(start.x-a.x,start.y-a.y));maxStartAngleError=Math.max(maxStartAngleError,Math.abs(start.angle-a.angle));
  maxLaunchPositionError=Math.max(maxLaunchPositionError,Math.hypot(before.x-after.x,before.y-after.y));maxLaunchAngleError=Math.max(maxLaunchAngleError,Math.abs(Math.atan2(Math.sin(after.angle-before.angle),Math.cos(after.angle-before.angle))));
  minEndOcclusionMargin=Math.min(minEndOcclusionMargin,core.maskRadius-Math.hypot(end.x-core.x,end.y-core.y)-start.h*.52);
  for(let j=0;j<=96;j++){const v=recallPose(p,6.6+j/30*2.2/3.2),prior=recallPose(p,6.6+Math.max(0,j-1)/30*2.2/3.2);maxHeightChange=Math.max(maxHeightChange,Math.abs(v.h-start.h));maxFrameTravel=Math.max(maxFrameTravel,Math.hypot(v.x-prior.x,v.y-prior.y));}
 }
 return{style:'ground extraction, rising helical funnel, shrinking neck, tip-first core occlusion',swords:items.length,presentationRecall:[6.6,9.8],turnRange:[1.85,2.25],continuousTrailStrokes:0,maxStartPositionError,maxStartAngleError,maxLaunchPositionError,maxLaunchAngleError,maxHeightChange,minEndOcclusionMargin,maxFrameTravel};
}
function environmentLightV8CoolBase(){const q=lightLevel(),solar=E(t,.8,1.5)*(1-E(t,2.2,3.2));glow(c,430,220,640,390,solar*.32);glow(c,355,485,535,365,q*.34);glow(c,340,600,460,104,q*.44);glow(c,340,600,290,47,q*.18);const f=finger();glow(c,f.x,f.y,150,140,clampPulse(t,.05,1.25)*.18);if(t>=3.2&&t<6.6)for(const p of rainItems()){const age=t-p.hit;if(age>=0&&age<.22)glow(c,p.x,p.y+2,23,6,(1-E(age,.02,.22))*.18);}if(t>=7.7)glow(c,340,500,760,320,(1-E(impactAge(),.05,1.2))*.35);}
function environmentLightCoolBase(){if(wall<6.6)return environmentLightV8();const q=lightLevel();glow(c,430,280,660,420,q*.30);glow(c,340,600,530,120,q*.36);if(wall>=9.4){glow(c,340,520,550,280,(1-E(impactAge(),.20,1.5))*.21);}}
function drawUnit5CoolBase(u){const f=units.get(u),rr=reaction(u),sunLit=sunPower(),isHero=u===battle.P;c.save();c.translate(u.x+rr.dx,u.y-rr.lift);c.rotate(rr.angle);c.scale(f.scale,f.scale*rr.sy);c.translate(-f.footX,-f.footY);c.globalAlpha=1;c.filter='none';
 function body(im){c.save();c.globalAlpha*=1;c.drawImage(im,0,0);c.restore();if(debugMode!=='unlit'){const lit=illuminate(im,f.bounds),q=lightLevel()*(u.side==='enemy'?.48:.12);c.save();c.filter='none';c.globalCompositeOperation='screen';c.globalAlpha=q;c.drawImage(lit.fill,0,0);c.globalAlpha=q*1.40;c.filter='none';c.drawImage(lit.rim,0,0);c.restore();}if(rr.tint){c.save();c.filter='none';c.globalAlpha=.30;c.drawImage(tinted(im,rr.tint),0,0);c.restore();}}
 if(isHero){let idle=E(t,9.45,9.98);c.save();c.globalAlpha=1-idle;body(heroParts.body);c.save();c.translate(224,116);c.rotate(armAngle());c.translate(-224,-116);body(heroParts.arm);c.restore();c.restore();if(idle>0){c.save();c.globalAlpha=idle;const im=IMG.b_yegx;c.drawImage(im,f.footX-im.width/2,f.footY-im.height,im.width,im.height);c.restore();}}else body(f.im);c.restore();
 c.save();c.globalAlpha=1;c.fillStyle='#081015';c.fillRect(u.x-39+rr.dx,u.y-u.h-16-rr.lift,78,6);c.fillStyle=u.side==='hero'?'#4cda7f':'#ec6a37';c.fillRect(u.x-38+rr.dx,u.y-u.h-15-rr.lift,76*u.hp/u.maxhp,4);c.restore();}
function airRefractionCoolBase(cam){const strength=E(t,.85,1.5)*(1-E(t,2.4,3.2));if(strength<=0)return;const cv=airRefraction.cache||(airRefraction.cache=mk(W,H)),g=cv.getContext('2d');g.clearRect(0,0,W,H);g.drawImage(main.canvas,0,0,W,H);const m=main.getTransform(),cx=W*.5+(L(430,sky.x,sunMorph())-W*.5)*cam.zoom,cy=H*.53+(sky.y-H*.53)*cam.zoom,rr=185*cam.zoom;main.save();main.setTransform(m.a/cam.zoom,0,0,m.d/cam.zoom,0,0);main.beginPath();main.arc(cx,cy,rr,0,TAU);main.clip();for(let y=Math.max(0,Math.floor(cy-rr));y<Math.min(H,cy+rr);y+=4){const shift=Math.sin(y*.075-t*2.7)*.8*strength;main.drawImage(cv,0,y,W,4,shift,y,W,4);}main.restore();}
function solarHeatState(){
 const loop=sunLoopClock!==null,active=loop||(wall>=.50&&wall<3.2)||(wall>=7.04&&wall<9.4);
 if(!active)return{active:false,intensity:0,clock:wall,x:430,y:195,r:144};
 let clock=loop?sunLoopClock:wall,x=430,y=195,r=144,alpha=1;
 if(!loop&&wall<3.2){const s=sunGeometry();x=s.x;y=s.y;r=Math.min(144,L(s.rx,s.ry,.5));alpha=E(wall,.50,1.35)*(1-E(wall,2.25,3.2));}
 else if(!loop){if(wall<8.8){const s=imperialState();x=s.x;y=s.y;r=s.r;alpha=s.alpha;}else{const s=finalSun();x=s.x;y=s.y;r=s.r;}if(wall>=8.8&&wall<9.1)clock=8.8;}
 const phase=clock*TAU/3,breathe=.965+.025*Math.sin(phase)+.010*Math.sin(phase*3+.7);
 return{active:true,intensity:alpha*breathe,clock,phase,x,y,r,groundX:L(340,x,.6)};
}
function solarHeatEnvironment(h){
 if(h.intensity<=0)return;const a=h.intensity,rx=Math.max(170,h.r*2.55),ry=Math.max(160,h.r*2.30);
 // Warm air surrounds the source; the far sky keeps its original cool darkness.
 glow(c,h.x,h.y,rx*1.48,ry*1.30,a*.145,'255,169,57');
 glow(c,h.x,h.y,rx,ry,a*.225,'255,213,125');
 glow(c,h.x,h.y,rx*.67,ry*.67,a*.15,'255,243,197');
 glow(c,h.groundX,438,235,265,a*.075,'255,202,100');
 glow(c,h.groundX,602,445,95,a*.35,'255,219,143');
 glow(c,h.groundX,601,285,43,a*.245,'255,245,206');
 // Sparse convection motes rise from the heated ground, with zero alpha at each loop seam.
 for(let j=0;j<12;j++){const u=((h.clock/3+j*.61803398875)%1+1)%1,x=h.groundX+(R(j+912)-.5)*420+Math.sin(u*TAU+j)*12,y=605-u*(185+R(j+934)*155),q=Math.sin(u*Math.PI);tex('hit',x,y,2.6+R(j+965)*2.4,5+R(j+956)*4,a*q*.25);}
}
function heatedUnitLayers(im,bounds,dx,dy){
 if(!heatedUnitLayers.cache)heatedUnitLayers.cache=new WeakMap();let cache=heatedUnitLayers.cache.get(im);if(!cache){cache=new Map();heatedUnitLayers.cache.set(im,cache);}
 const angle=Math.atan2(dy,dx),bucket=Math.round(angle*24/TAU),key=String(bucket);if(cache.has(key))return cache.get(key);
 const theta=bucket*TAU/24,vx=Math.cos(theta),vy=Math.sin(theta),w=im.width,h=im.height,left=bounds?.[0]||0,top=bounds?.[1]||0,right=bounds?.[2]||w,bottom=bounds?.[3]||h,cx=(left+right)/2,cy=(top+bottom)/2,extent=Math.max(right-left,bottom-top)*.72;
 const fill=mk(w,h),rim=mk(w,h),outer=mk(w,h),f=fill.getContext('2d'),r=rim.getContext('2d'),o=outer.getContext('2d');
 f.drawImage(im,0,0);f.globalCompositeOperation='source-in';f.fillStyle='#ffe0a2';f.fillRect(0,0,w,h);f.globalCompositeOperation='destination-in';const grad=f.createLinearGradient(cx+vx*extent,cy+vy*extent,cx-vx*extent,cy-vy*extent);grad.addColorStop(0,'white');grad.addColorStop(.43,'rgba(255,255,255,.73)');grad.addColorStop(.73,'rgba(255,255,255,.19)');grad.addColorStop(1,'rgba(255,255,255,0)');f.fillStyle=grad;f.fillRect(0,0,w,h);
 const edge=Math.max(2.5,Math.min(8,(bottom-top)*.012));
 r.drawImage(fill,vx*edge*.48,vy*edge*.48);r.globalCompositeOperation='destination-out';r.drawImage(im,0,0);r.globalCompositeOperation='source-in';r.fillStyle='#fff7d0';r.fillRect(0,0,w,h);
 o.drawImage(fill,vx*edge,vy*edge);o.globalCompositeOperation='destination-out';o.drawImage(im,0,0);o.globalCompositeOperation='source-in';o.fillStyle='#ffc55f';o.fillRect(0,0,w,h);
 const value={fill,rim,outer};cache.set(key,value);return value;
}
function preloadDirectionImages(){return Promise.all(['core','rays'].flatMap(k=>Array.from({length:4},(_,i)=>new Promise((ok,no)=>{SUN_IMG('s15_'+k+i).then(im=>{A[k+i]=im;ok()},no);}))));}
function unfoldSolarBody(p,m){
 const source=p.slice(),inner=1.03686636*m,thickness=1-.88*m;
 for(let y=0;y<768;y++)for(let x=0;x<768;x++){const k=(y*768+x)*4,nx=(x-384)/288,ny=(y-384)/288,rr=Math.hypot(nx,ny),sr=(rr-inner)/thickness;
  if(sr<0||sr>1.333||rr<1e-7){p[k+3]=0;continue;}const xx=384+nx/rr*sr*288,yy=384+ny/rr*sr*288;
  if(xx<0||yy<0||xx>=767||yy>=767){p[k+3]=0;continue;}const ix=Math.floor(xx),iy=Math.floor(yy),fx=xx-ix,fy=yy-iy,base=(iy*768+ix)*4,ids=[base,base+4,base+3072,base+3076],weights=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy];let al=0;for(let j=0;j<4;j++)al+=source[ids[j]+3]*weights[j];if(al<.5){p[k+3]=0;continue;}for(let ch=0;ch<3;ch++){let sum=0;for(let j=0;j<4;j++)sum+=source[ids[j]+ch]*source[ids[j]+3]*weights[j];p[k+ch]=sum/al;}p[k+3]=al*(1-E(m,0,.08)+E(m,0,.08)*E(sr,0,.07));
 }
}
function radiantExposureField(x,y,h){
 // A single, stationary light field reveals existing backdrop colour instead of laying white paint over it.
 const skyRadius=Math.max(215,h.r*1.95),sx=(x-h.x)/skyRadius,sy=(y-h.y)/(skyRadius*.86),near=Math.pow(C(1-sx*sx-sy*sy),2)*.24;
 const px=(x-(h.x-20))/265,py=(y-430)/260,under=Math.pow(C(1-px*px-py*py),2)*.105;
 let ground=0;for(const u of QE()){const rx=80+u.h*.24,ry=20+u.h*.025,dx=(x-u.x)/rx,dy=(y-u.y-4)/ry;ground+=Math.pow(C(1-dx*dx-dy*dy),1.7)*(u.key==='e_leopard'?.24:u.key==='e_wolf2'?.30:.34);}
 return Math.min(.38,near+under+ground);
}
function radiantBackdrop(h){
 const im=IMG[battle.cfg.bg];if(!im)return null;const signature=[battle.cfg.bg,h.x.toFixed(2),h.y.toFixed(2),h.r.toFixed(2),...QE().flatMap(u=>[u.x,u.y,u.h])].join(':');
 if(radiantBackdrop.cache?.signature===signature&&radiantBackdrop.cache.im===im)return radiantBackdrop.cache.canvas;
 const cv=mk(W,H),g=cv.getContext('2d'),ir=im.width/im.height,ratio=W/H;let sw,sh,sx,sy;
 if(ir>ratio){sh=im.height;sw=sh*ratio;sx=(im.width-sw)/2;sy=0;}else{sw=im.width;sh=sw/ratio;sx=0;sy=(im.height-sh)/2;}
 g.drawImage(im,sx,sy,sw,sh,0,0,W,H);const pixels=g.getImageData(0,0,W,H),d=pixels.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=(y*W+x)*4,weight=radiantExposureField(x,y,h);d[k]=Math.min(255,d[k]*1.22);d[k+1]=Math.min(255,d[k+1]*1.08);d[k+2]=Math.min(255,d[k+2]*.84);d[k+3]=Math.round(d[k+3]*weight);}
 g.putImageData(pixels,0,0);radiantBackdrop.cache={signature,im,canvas:cv};return cv;
}
function radiantUnitSurface(im,bounds,dx,dy){
 if(!radiantUnitSurface.cache)radiantUnitSurface.cache=new WeakMap();let cache=radiantUnitSurface.cache.get(im);if(!cache){cache=new Map();radiantUnitSurface.cache.set(im,cache);}
 const bucket=Math.round(Math.atan2(dy,dx)*24/TAU),key=String(bucket);if(cache.has(key))return cache.get(key);const theta=bucket*TAU/24,vx=Math.cos(theta),vy=Math.sin(theta),w=im.width,h=im.height,left=bounds?.[0]||0,top=bounds?.[1]||0,right=bounds?.[2]||w,bottom=bounds?.[3]||h,bw=Math.max(1,right-left),bh=Math.max(1,bottom-top),cx=(left+right)*.5,cy=(top+bottom)*.5;
 const cv=mk(w,h),g=cv.getContext('2d');g.drawImage(im,0,0);const pixels=g.getImageData(0,0,w,h),d=pixels.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4;if(!d[k+3])continue;const nx=(x-cx)/(bw*.5),ny=(y-cy)/(bh*.5),up=(y-top)/bh,projected=(nx*vx+ny*vy)/Math.SQRT2,lit=E(projected,-.10,.72)*(1-E(up,.43,.91));
  d[k]=Math.min(255,d[k]*1.27+17);d[k+1]=Math.min(255,d[k+1]*1.13+12);d[k+2]=Math.min(255,d[k+2]*.89+8);d[k+3]=Math.round(d[k+3]*lit);
 }
 g.putImageData(pixels,0,0);cache.set(key,cv);return cv;
}
function night(){
 if(sunLoopClock!==null)return .58;
 const matureSun=E(wall,1.05,1.85)*(1-E(wall,2.2,3.2));
 return nightBase()-.07*matureSun;
}
function radiantEnvironment(h){
 const exposed=radiantBackdrop(h);if(exposed){c.save();c.globalCompositeOperation='screen';c.globalAlpha=h.intensity*.77;c.drawImage(exposed,0,0,W,H);c.restore();}
 glow(c,h.x,h.y,Math.max(180,h.r*1.9),Math.max(170,h.r*1.75),h.intensity*.055,'255,250,232');
 for(const u of QE())glow(c,u.x,u.y+3,75+u.h*.20,13+u.h*.015,h.intensity*.03,'255,249,232');
}
// v17: the intact sun feeds an engraved celestial mechanism. The final array
// is sampled from the approved renderer; no new array geometry is substituted.
function weaveState(){
 const q=E(wall,2.18,3.10),consume=E(wall,2.35,3.04),r=144*Math.pow(1-consume,.72);
 return{q,consume,r,x:L(430,sky.x,E(wall,2.18,3.02)),y:195,
  heartbeat:.88+.12*Math.pow(.5+.5*Math.cos((t-3.2)*TAU),6)};
}

function weavePlate(){
 const cache=weavePlate.cache||(weavePlate.cache={cv:mk(1280,1280),layers:Array.from({length:3},()=>mk(1280,1280)),mask:Array.from({length:3},()=>mk(1280,1280)),key:''});
 if(cache.key===wall)return cache;cache.key=wall;const g=cache.cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1280,1280);
 g.save();g.translate(640,640);g.scale(1,420/132);g.translate(-435,-205);
 SUN_ARRAY_V8.render(g,A,flowTime(),{a:1,grow:1,reveal:1,morph:1,angle:-(flowTime()-3.2)*TAU/13.5,dust:false},'new');g.restore();
 for(let layer=0;layer<3;layer++){
  const b=cache.layers[layer].getContext('2d'),m=cache.mask[layer].getContext('2d');
  b.setTransform(1,0,0,1,0,0);b.clearRect(0,0,1280,1280);b.globalCompositeOperation='source-over';b.drawImage(cache.cv,0,0);
  m.clearRect(0,0,1280,1280);m.globalCompositeOperation='source-over';m.save();m.translate(640,640);
  // Soft radial partitions sum to one and remain tied to the original design.
  const radial=m.createRadialGradient(0,0,0,0,0,550);
  const stops=layer===0?[[0,0],[.63,0],[.67,1],[1,1]]:layer===1?[[0,0],[.45,0],[.49,1],[.63,1],[.67,0],[1,0]]:[[0,1],[.45,1],[.49,0],[1,0]];
  for(const[p,a]of stops)radial.addColorStop(p,'rgba(255,255,255,'+a+')');m.fillStyle=radial;m.fillRect(-640,-640,1280,1280);
  m.globalCompositeOperation='destination-in';
  const progress=E(wall,2.12+layer*.065,2.86+layer*.08);
  // Eight opposed crests travel along each rail. Glyphs form locally behind
  // those crests instead of the whole disc fading in at once.
  const sweep=mk(1280,1280),s=sweep.getContext('2d');s.translate(640,640);
  for(let i=0;i<160;i++){
   const an=i/160*TAU,sector=(i%20)/20,rank=Math.floor(i/20),delay=(rank%4)*.018;
   const alpha=E(progress-delay,sector*.58-.04,sector*.58+.20);if(alpha<=0)continue;
   s.globalAlpha=alpha;s.fillStyle='white';s.beginPath();s.moveTo(0,0);s.arc(0,0,640,an-.006,an+TAU/160+.006);s.closePath();s.fill();
  }
  m.drawImage(sweep,-640,-640);m.restore();
  b.globalCompositeOperation='destination-in';b.drawImage(cache.mask[layer],0,0);b.globalCompositeOperation='source-over';
 }
 return cache;
}

function weaveBandPose(layer){
 const q=E(wall,2.18+layer*.07,3.04+layer*.025),bend=Math.sin(q*Math.PI);
 return{x:L(430,sky.x,q),y:195+[-17,13,0][layer]*bend,
  rx:L([154,147,137][layer],sky.rx,q),ry:L([148,125,100][layer],sky.ry,q),
  roll:[-.24,.20,-.12][layer]*bend,twist:[.34,-.27,.18][layer]*(1-q)};
}

function weaveBands(plate,amount){
 if(amount<=0)return;
 for(let layer=0;layer<3;layer++){
  const p=weaveBandPose(layer);c.save();c.translate(p.x,p.y);c.rotate(p.roll);c.scale(p.rx/420,p.ry/420);c.rotate(p.twist);
  c.globalCompositeOperation='screen';c.globalAlpha=amount;c.drawImage(plate.layers[layer],-640,-640);c.restore();
 }
}

function weaveStreamPoint(i,u,state){
 const layer=i%3,p=weaveBandPose(layer),an=i*TAU/8+.32,turn=.62*(i%2?-1:1),rr=[.99,.77,.54][layer];
 const a=an+turn*u*(1-u)*2,dist=L(Math.max(18,state.r*.86),p.rx*rr,u),aspect=L(1,p.ry/p.rx,u);
 const x=state.x+Math.cos(a)*dist,y=state.y+Math.sin(a)*dist*aspect;
 return{x,y};
}

function weaveStreams(state){
 for(let i=0;i<8;i++){
  const begin=2.18+i*.028,head=E(wall,begin,begin+.48),fade=1-E(wall,2.77+i*.018,3.09);
  if(head<=0||fade<=0)continue;const phase=((wall*1.6+i*.17)%1+1)%1,texture=A['v10shaft'+Math.floor(phase*8)];
  for(let j=0;j<25;j++){
   const u=j/25,v=(j+1)/25;if(u>head)break;const a=weaveStreamPoint(i,u,state),b=weaveStreamPoint(i,Math.min(v,head),state),length=Math.hypot(b.x-a.x,b.y-a.y),width=(4+11*Math.sin(u*Math.PI))*(.85+.15*Math.sin(wall*9+i));
   if(length<.01)continue;c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2);c.globalCompositeOperation='screen';c.globalAlpha=fade*.42*E(head-u,0,.16);
   const sy=((j*16+wall*170)%430);c.drawImage(texture,0,sy,128,Math.min(70,512-sy),-width/2,-1,width,length+2);c.restore();
  }
  const tip=weaveStreamPoint(i,head,state);tex('hit',tip.x,tip.y,24,18,fade*.55);
 }
}

function weaveSurfaceStars(state,plate){
 const a=E(wall,2.0,2.28)*(1-E(wall,2.50,2.96));if(a<=0||state.r<6)return;
 const transform=c.getTransform(),g=solidc;
 g.save();g.setTransform(transform.a*SQ,transform.b*SQ,transform.c*SQ,transform.d*SQ,transform.e*SQ,transform.f*SQ);
 g.translate(state.x,state.y);g.beginPath();g.arc(0,0,state.r*.81,0,TAU);g.clip();g.globalCompositeOperation='screen';g.globalAlpha=a*.62;
 const s=state.r/260;g.scale(s,s);g.drawImage(plate.layers[2],-640,-640);g.restore();
}

function solarArrayWeave(){
 const st=weaveState(),plate=weavePlate(),handoff=E(wall,3.00,3.16);
 weaveBands(plate,st.heartbeat*(1-handoff));
 if(handoff>0){c.save();c.translate(sky.x,sky.y);c.scale(sky.rx/420,sky.ry/132);c.translate(-435,-205);SUN_ARRAY_V8.render(c,A,flowTime(),{a:st.heartbeat*handoff,grow:1,reveal:1,morph:1,angle:-(flowTime()-3.2)*TAU/13.5,dust:false},'new');c.restore();}
 weaveStreams(st);
 if(st.r>.05){
  // Keep a full, round sun. It condenses as its energy leaves, never hollows
  // into a torus and never inherits the widening array's aspect ratio.
  const alpha=st.heartbeat*(1-E(wall,2.96,3.08));
  drawSolarMaterial(st.x,st.y,st.r,st.r,0,alpha,flowTime()-.8,0);
  weaveSurfaceStars(st,plate);
 }
 const seal=E(wall,2.86,2.98)*(1-E(wall,3.0,3.14));
 if(seal>0){tex('hit',sky.x,sky.y,92,19,seal*.24);tex('hit',sky.x,sky.y,24,52,seal*.19);}
}

function preloadWheelImages(){return new Promise((ok,no)=>{const im=new Image();im.onload=()=>{const half=im.width/2;A.wheelSource=im;for(let i=0;i<4;i++){const cv=mk(512,512),g=cv.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,(i%2)*half,Math.floor(i/2)*half,half,half,0,0,512,512);const src=g.getImageData(0,0,512,512),out=mk(512,512),og=out.getContext('2d'),data=og.createImageData(512,512),rad=new Float32Array(512*512),ang=new Float32Array(512*512);for(let y=0;y<512;y++)for(let x=0;x<512;x++){const n=y*512+x;rad[n]=Math.hypot(x-256,y-256);ang[n]=Math.atan2(y-256,x-256);}A['wheel'+i]=out;A['wheelState'+i]={src:src.data,og,data,rad,ang,last:''};}ok();};im.onerror=no;im.src=(window.FORCE_LOCAL||/^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname)||location.protocol==='file:')?'sun_assets/wheel_atlas.webp':(window.SUN_WHEEL_BLOB||'sun_assets/wheel_atlas.webp');});}
function wheelTexture(i,clock,reveal){const s=A['wheelState'+i],key=clock.toFixed(7)+':'+reveal.toFixed(7);if(s.last===key)return;s.last=key;const d=s.data.data,src=s.src;
 for(let n=0;n<512*512;n++){const k=n*4,a=src[k+3];if(a<3){d[k+3]=0;continue;}const r=s.rad[n],theta=s.ang[n],lum=(src[k]*.2126+src[k+1]*.7152+src[k+2]*.0722)/255,emission=.11+.89*E(lum,.61,.98),thread=.91+.11*Math.sin(theta*7+r*.052-clock*3.4+i)+.055*Math.sin(theta*13-r*.03+clock*5.1),sector=((theta/TAU*8)%1+1)%1,forming=i===0?E(reveal,0,.65):E(reveal,sector*.58-.18,sector*.58+.32),edge=1-E(r,238,256),brightness=thread*(.96+.04*E(r,30,140));
  d[k]=Math.min(255,(src[k]*.80+51)*brightness);d[k+1]=Math.min(255,(src[k+1]*.80+51)*brightness);d[k+2]=Math.min(255,(src[k+2]*.79+53)*brightness);d[k+3]=a*emission*forming*edge;
 }s.og.putImageData(s.data,0,0);
}
function swordFx(){
 if(!swordFx.layer){swordFx.layer=mk(W*SQ,H*SQ);swordFx.context=swordFx.layer.getContext('2d');swordFx.dirty=false;}
 return swordFx.context;
}
function swordRadiance(g,w,h,y,alpha,energy){
 if(alpha<=0||energy<=0)return;swordFx.dirty=true;
 g.save();g.globalCompositeOperation='screen';g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 // Broad halo stays weak; concentrated emission follows the original blade silhouette.
 // 实战优化（Claude）：原版每把剑每帧做两次 filter 模糊（238 把剑 × 2，手机会卡死）。光晕改为预先模糊好的贴图按剑的大小缩放，观感一致。
 const rc=swordRadiance.cache||(swordRadiance.cache=[9,3].map(r=>{const bh=128,bw=bh*424/1507,pad=r*3,cv=mk(Math.ceil(bw+pad*2),Math.ceil(bh+pad*2)),q=cv.getContext('2d');q.filter='blur('+r+'px)';q.drawImage(A.swordBrightEdge,pad,pad,bw,bh);q.filter='none';return{cv,pad,bh};}));
 for(const[k,a]of[[0,.16],[1,.52]]){const o=rc[k],sc=h/o.bh,pp=o.pad*sc;g.globalAlpha=C(alpha*energy*a);g.drawImage(o.cv,-w*.5-pp,y-pp,w+pp*2,h+pp*2);}
 g.globalAlpha=C(alpha*energy*.42);g.filter='none';g.drawImage(A.swordEmission,-w*.5,y,w,h);
 g.restore();
}
function getSwordMotionAudit(){
 let rows=[];
 if(wall>=3.2&&wall<6.6)rows=rainItems().map(p=>{const v=rainPose(p,t);return v?{id:p.id,phase:v.growing?'growing':t<p.hit?'falling':'planted',x:v.x+Math.sin(v.angle)*v.h*.5,y:v.y+v.h*.49-Math.cos(v.angle)*v.h*.5,h:v.h,angle:v.angle,depth:p.depth}:null;}).filter(Boolean);
 if(wall>=6.6&&wall<8.8)rows=rainItems().map(p=>{const v=recallPose(p,wall);return v.alpha>0?{id:p.id,phase:v.phase,x:v.x,y:v.y,h:v.h,angle:v.angle,depth:v.depth}:null;}).filter(Boolean);
 return{wall,time:t,camera:camera(),rows};
}
function prepareEnergySword(){
 const w=424,h=1507,mask=A.solid.getContext('2d').getImageData(0,0,w,h).data,outline=mk(w,h),g=outline.getContext('2d'),d=g.createImageData(w,h);
 const alpha=(x,y)=>x<0||x>=w||y<0||y>=h?0:mask[(y*w+x)*4+3]/255;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,a=alpha(x,y),edge=Math.max(0,a-Math.min(alpha(x-6,y),alpha(x+6,y),alpha(x,y-6),alpha(x,y+6))),v=y/h;
  const core=Math.exp(-Math.pow((x-212)/10,2))*E(v,.28,.34)*(1-E(v,.97,1));
  d.data[i]=255;d.data[i+1]=251;d.data[i+2]=233;d.data[i+3]=Math.round(255*(a*.065+edge*.19+core*a*.55));
 }
 g.putImageData(d,0,0);A.energyContour=outline;
 const indices=[4,5,6,7,8,9,10,9,8,7,6,5];A.energyFrames=[];
 for(const index of indices){
  const frame=mk(w,h),q=frame.getContext('2d'),im=A['lc_beam'+index];
  // Approved image sequence supplies the irregular plasma, including its narrow white core.
  q.save();q.translate(w*.5,h*.5);q.rotate(Math.PI*.5);q.drawImage(im,-h*.5,-145,h,290);q.restore();
  // The guard is also made of travelling light, never of the original metal RGB.
  q.globalCompositeOperation='screen';q.globalAlpha=.44;q.drawImage(im,18,290,388,155);
  q.save();q.translate(w,0);q.scale(-1,1);q.drawImage(im,18,290,388,155);q.restore();q.globalAlpha=1;
  q.globalCompositeOperation='destination-in';q.drawImage(A.solid,0,0);q.globalCompositeOperation='source-over';A.energyFrames.push(frame);
 }
}
function drawEnergySword(g,w,h,y,alpha,energy,seed){
 if(alpha<=0||h<=0)return;swordFx.dirty=true;g.save();g.globalCompositeOperation='screen';g.filter='none';g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 const phase=((wall*9+R(seed+209)*12)%12+12)%12,idx=Math.floor(phase),mix=phase-idx,power=C(alpha)*Math.min(1.35,energy);
 g.globalAlpha=C(power*.90);g.drawImage(A.energyContour,-w*.5,y,w,h);
 g.globalAlpha=C(power*.88*(1-mix));g.drawImage(A.energyFrames[idx],-w*.5,y,w,h);
 g.globalAlpha=C(power*.88*mix);g.drawImage(A.energyFrames[(idx+1)%12],-w*.5,y,w,h);
 g.restore();
}
function getEnemySwordAudit(){
 return{spawnMaxX:640,landingRange:[60,610],bodyMaxRight:740,glowSupportMargin:72,material:'screen-only light sequence; original sword alpha mask only',items:rainItems(),plans:rainItems().map(p=>({id:p.id,...recallPlan(p)}))};
}
function vortexPoint(plan,u){
 const q=C(u),join=E(q,0,.18),climb=E(q,.06,1),neck=1-E(q,.65,1);
 const theta=plan.phase+TAU*plan.turns*q,rad=plan.radius*(1-.40*climb)*neck;
 const cx=L(378,plan.end.x,climb),baseY=L(plan.p0.y,plan.end.y,climb);
 const x=L(plan.p0.x,cx+Math.cos(theta)*rad,join);
 const y=L(plan.p0.y,baseY+Math.sin(theta)*rad*.24,join);
 return{x,y,theta,rad,q};
}
function vortexHeadings(plan){
 if(plan.headings)return plan.headings;
 const out=[],dt=(plan.arrival-plan.launch)*3.2/2.2/720;
 let heading=0,omega=0;
 for(let j=0;j<=720;j++){
  const u=j/720,a=vortexPoint(plan,Math.max(0,u-.002)),b=vortexPoint(plan,Math.min(1,u+.002)),target=Math.atan2(-(b.x-a.x),b.y-a.y);
  if(j===0)heading=target;
  else{const delta=Math.atan2(Math.sin(target-heading),Math.cos(target-heading)),wanted=Math.max(-8,Math.min(8,delta/.065));omega=L(omega,wanted,1-Math.exp(-dt/.035));heading+=omega*dt;}
  out.push(heading);
 }
 plan.headings=out;return out;
}
function armAngle(){return 1.12*E(t,0,.7)-1.29*E(t,7.7,7.9)+.17*E(t,9.2,9.8);}
function QE(){const a=window.SUN_EN;return a&&a.length?a:battle.enemies}
function rtClock(z){const e=z<=6.6?z:z<9.8?6.6+(z-6.6)*2.2/3.2:z-1;wall=e;raw=e<6.6?e:e<8.8?6.6+(e-6.6)*.8/2.2:e-1.4;t=raw;if(raw>=7.4-1e-7&&raw<7.7-1e-7)t=7.4;if(raw>=8-1e-7&&raw<8.2-1e-7)t=8}
function rtBack(z){rtClock(z);c=main;beginFx();arrayPlane(true);renderRain('far');finishFx();c=main}
function rtFront(z){rtClock(z);c=main;beginFx();arrayPlane(false);beam();originBurst();renderRain('near');recallSwords();sunset();returnLights();finishFx();c=main;foregroundFlash()}
function finger(){const u=window.SUN_P||battle.P,f=units.get(u);if(!f)return{x:u.x-34,y:u.y-(u.h||240)*.7};const _q=0,a=armAngle(),x=38-224,y=100-116;return{x:u.x+(224+x*Math.cos(a)-y*Math.sin(a)-f.footX)*f.scale,y:u.y+(116+x*Math.sin(a)+y*Math.cos(a)-f.footY)*f.scale};}
function nightBase(){if(wall<6.6)return nightV8();return(.65-.15*(E(wall,8.2,8.8)-E(wall,9.1,9.4)))*(1-E(wall,10.5666666667,11.3666666667));}
function nightV8(){return .65*E(t,0,.55)*(1-E(t,9.15,10))+.33*(E(t,7.2,7.4)-E(t,7.7,7.9));}
function debris(x,y,age,seed,big=false){let life=big?1.1:.50;if(age<0||age>life)return;const fade=1-E(age,life*.5,life),n=big?106:7;c.save();for(let i=0;i<n;i++){let a=R(seed+i*7)*TAU,speed=(big?180:90)+R(seed+i*11)*(big?330:170),vx=Math.cos(a)*speed,vy=-(big?150:110)-R(seed+i*13)*(big?420:130),px=x+vx*age,py=y+vy*age+(big?430:330)*age*age,size=(big?3:1.5)+R(seed+i)*(big?8:3);c.globalAlpha=fade;if(i%3===0){c.save();c.translate(px,py);c.rotate(age*(R(i)*5-2.5)+R(i)*TAU);c.globalCompositeOperation='screen';c.drawImage(A.hit,-size,-size,size*2,size*2);c.restore();}else{c.globalCompositeOperation='screen';c.strokeStyle=i%2?'#fff5b9':'#fff1cc';c.lineWidth=big?1.8:1.3;c.beginPath();c.moveTo(px,py);c.lineTo(px-vx*.025,py-(vy+860*age)*.025);c.stroke();c.globalCompositeOperation='source-over';}}c.restore();}

function reaction(u){if(u.side==='hero')return{dx:0,lift:0,angle:0,sy:1,tint:''};let dx=-16*E(t,3.6,6.6),angle=0,sy=1,lift=0,tint='';if(t>=3.6&&t<6.6){const q=(t-3.6)%.46;angle=-.028*(1-E(q,.05,.18));sy-=.015*(1-E(q,.04,.16));if(q<1/30)tint='#fff8e8';}if(t>=8){const q=impactAge(),fly=Math.sin(Math.PI*C(q/.78));dx-=44*E(q,0,.42);lift=94*Math.max(0,fly);angle=-.27*(1-E(q,.35,.88));sy=1-.08*(1-E(q,0,.12));tint=q<2/30?'#fff8e8':'';}return{dx,lift,angle,sy,tint};}
function tight(im,h){const v=mk(im.width,im.height),g=v.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,v.width,v.height).data;let x0=v.width,y0=v.height,x1=0,y1=0;for(let y=0;y<v.height;y++)for(let x=0;x<v.width;x++)if(d[(y*v.width+x)*4+3]>32){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}return{im,w:im.width,h:im.height,footX:(x0+x1)/2,footY:y1,scale:h/(y1-y0),bounds:[x0,y0,x1,y1],visibleHeight:h};}
function cacheUnit(u){if(u.side==='hero')return tight(IMG[u===battle.P?'b_yegx_cast':u.key],u.h);if(u.key==='e_leopard')return tight(IMG.e_leopard,u.h);const im=mk(1400,900);RIG.draw(im.getContext('2d'),RIG.RIGS[u.key==='e_wolf2'?'c5':'e4'],700,800,400,true,'idle',0,{trail:0});return tight(im,u.h);}
function makeHeroParts(im){const body=mk(im.width,im.height),arm=mk(im.width,im.height),poly=[[0,44],[145,60],[226,91],[232,148],[218,181],[216,249],[173,255],[142,210],[105,183],[70,152],[0,140]];function clip(g){g.beginPath();poly.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();}let b=body.getContext('2d'),a=arm.getContext('2d');b.drawImage(im,0,0);b.globalCompositeOperation='destination-out';clip(b);b.fill();a.save();clip(a);a.clip();a.drawImage(im,0,0);a.restore();return{body,arm};}
function tinted(im,col){let key=im===heroParts?.body?'body':im===heroParts?.arm?'arm':null;let per=tintCache.get(im);if(!per){per=new Map();tintCache.set(im,per);}if(!per.has(col)){let v=mk(im.width,im.height),g=v.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,v.width,v.height);per.set(col,v);}return per.get(col);}
function drawUnit5(u){
 const heat=solarHeatState();if(!heat.active||heat.intensity<=0||debugMode==='unlit'){drawUnit5CoolBase(u);return;}
 const f=units.get(u),rr=reaction(u),sunLit=sunPower(),isHero=u===battle.P,dx=heat.x-u.x,dy=heat.y-(u.y-u.h*.50),distance=Math.hypot(dx,dy),facing=.46+.54*C(1-distance/1100),a=heat.intensity;
 c.save();c.translate(u.x+rr.dx,u.y-rr.lift);c.rotate(rr.angle);c.scale(f.scale,f.scale*rr.sy);c.translate(-f.footX,-f.footY);c.globalAlpha=1;c.filter='none';
 function body(im){
  c.save();c.drawImage(im,0,0);c.restore();const lit=illuminate(im,f.bounds),hot=heatedUnitLayers(im,f.bounds,dx,dy),surface=radiantUnitSurface(im,f.bounds,dx,dy),q=lightLevel()*(u.side==='enemy'?.48:.12);
  c.save();c.filter='none';c.globalCompositeOperation='screen';c.globalAlpha=q*(1-a);c.drawImage(lit.fill,0,0);c.globalAlpha=q*1.4*(1-a);c.filter='none';c.drawImage(lit.rim,0,0);
  c.filter='none';c.globalAlpha=a*facing*(u.side==='enemy'?.54:.38);c.drawImage(surface,0,0);
  c.globalAlpha=a*facing*.39;c.filter='none';c.drawImage(hot.outer,0,0);c.filter='none';c.globalAlpha=a*facing*.74;c.drawImage(hot.rim,0,0);c.restore();
  if(rr.tint){c.save();c.filter='none';c.globalAlpha=.30;c.drawImage(tinted(im,rr.tint),0,0);c.restore();}
 }
 if(isHero){let idle=E(t,9.45,9.98);c.save();c.globalAlpha=1-idle;body(heroParts.body);c.save();c.translate(224,116);c.rotate(armAngle());c.translate(-224,-116);body(heroParts.arm);c.restore();c.restore();if(idle>0){c.save();c.globalAlpha=idle;const im=IMG.b_yegx;c.drawImage(im,f.footX-im.width/2,f.footY-im.height,im.width,im.height);c.restore();}}else body(f.im);c.restore();
 c.save();c.globalAlpha=1;c.fillStyle='#081015';c.fillRect(u.x-39+rr.dx,u.y-u.h-16-rr.lift,78,6);c.fillStyle=u.side==='hero'?'#4cda7f':'#ec6a37';c.fillRect(u.x-38+rr.dx,u.y-u.h-15-rr.lift,76*u.hp/u.maxhp,4);c.restore();
}
function numbers(){for(let i=0;i<27;i++){const hit=3.9+i*.10,age=t-hit;if(age<0||age>.28)continue;const enemy=QE()[i%3];c.save();c.globalAlpha=1-E(age,.15,.28);c.font='700 16px '+FONT;c.textAlign='center';c.shadowBlur=3;c.shadowColor='#655745';c.fillStyle='#fffdf8';c.fillText(String(2400+Math.floor(R(i+350)*1600)),enemy.x-18+(R(i)-.5)*60,enemy.y-enemy.h*.50-age*55);c.restore();}if(t>=8&&raw<9.2){const age=impactAge(),pop=1+.10*(1-E(age,0,.13));c.save();c.translate(340,330-age*20);c.scale(pop,pop);c.globalAlpha=1-E(age,.65,1);c.textAlign='center';c.textBaseline='middle';c.font='900 57px '+FONT;c.lineJoin='round';c.lineWidth=4;c.strokeStyle='#32170a';c.strokeText('爆 688,888',0,0);c.shadowColor='#fff0cf';c.shadowBlur=13;c.fillStyle='#fff9e8';c.fillText('爆 688,888',0,0);c.restore();}}
function camera(){let zoom=1+.04*E(t,.8,2.2)+.015*E(t,3.2,6.6);zoom=L(zoom,1,E(raw,8.2,8.45));const age=raw-8.2;if(age<0||age>=.25)return{x:0,y:0,zoom};const q=(1-age/.25)**1.35;return{x:Math.cos(age*95)*6.6*q,y:Math.sin(age*113)*4.8*q,zoom};}
function foregroundFlash(){const alpha=raw>=8-1e-7&&raw<8+2/30-1e-7?.70:0;if(alpha){main.save();main.fillStyle='rgba(255,249,235,'+alpha+')';main.fillRect(0,0,W,H);main.restore();}}
function update(z){wall=z;raw=z<6.6?z:z<8.8?6.6+(z-6.6)*.8/2.2:z-1.4;t=raw;if(raw>=7.4-1e-7&&raw<7.7-1e-7)t=7.4;if(raw>=8-1e-7&&raw<8.2-1e-7)t=8;while(hitIndex<damageTimes.length&&raw+1e-7>=damageTimes[hitIndex]){const amount=hitIndex===damageTimes.length-1?688888:9000,save=floatText;floatText=()=>{};for(let u of QE())applyDamage(u,Math.floor(amount/3),false,{pierce:true});floatText=save;events.push({time:damageTimes[hitIndex]+(hitIndex===damageTimes.length-1?1.4:0),totalDemoDamage:amount,targets:QE().length});hitIndex++;}state.flash=state.shake=0;FX.length=0;}
function render(z){update(z);c=main;const cam=camera();if(has(battle.cfg.bg))drawImageFit(IMG[battle.cfg.bg],0,0,W,H);main.save();main.translate(W*.5+cam.x,H*.53+cam.y);main.scale(cam.zoom,cam.zoom);main.translate(-W*.5,-H*.53);if(has(battle.cfg.bg))drawImageFit(IMG[battle.cfg.bg],0,0,W,H);main.fillStyle='rgba(1,6,22,'+night()+')';main.fillRect(-12,-12,W+24,H+24);const pressure=E(t,2.2,3.2)*(1-E(t,6.6,7.4));main.save();main.translate(430,320);main.scale(650,290);const dim=main.createRadialGradient(0,-.28,.05,0,0,1);dim.addColorStop(0,'rgba(0,5,20,'+(pressure*.28)+')');dim.addColorStop(.55,'rgba(0,5,20,'+(pressure*.18)+')');dim.addColorStop(1,'rgba(0,5,20,0)');main.fillStyle=dim;main.fillRect(-1,-1,2,2);main.restore();airRefraction(cam);shadows();if(debugMode!=='unlit')environmentLight();
 if(debugMode==='normal'){beginFx();arrayPlane(true);renderRain('far');finishFx();}
 for(let u of [...battle.units].sort((a,b)=>a.y-b.y))drawUnit5(u);
 if(debugMode==='normal'){beginFx();arrayPlane(false);beam();originBurst();renderRain('near');recallSwords();sunset();returnLights();finishFx();numbers();}
 main.restore();if(hud&&!closeup)main.drawImage(hud,0,0,W,H);main.save();main.fillStyle='rgba(0,0,0,.36)';main.fillRect(0,0,W,42);main.font='600 22px '+FONT;main.fillStyle='#fff6dd';main.textBaseline='middle';main.fillText('叶孤星 · 破军剑阵·太阳',24,23);main.restore();if(debugMode==='normal')foregroundFlash();}
function fixture(s){state=s;s.started=true;s.overlay.length=0;s.fade=s.flash=s.shake=0;dialog=choice=sysPanel=null;FX.length=0;startBattle({title:'破军剑阵·太阳',bg:'bg_mountain',party:['yunting','linxue'],enemies:layout.enemies.map(e=>({name:e.name,key:e.key,h:layout.BASE_H*H*e.ratio,hp:900000,maxhp:900000}))});
 battle.heroes.forEach((u,i)=>{let d=layout.heroes[i];u.x=d.x*W;u.y=(layout.FOOT_Y-d.depth)*H;u.h=[240,247,223][i];u.gauge=[76,48,28][i];});QE().forEach((u,i)=>{let d=layout.enemies[i];u.x=d.x*W;u.y=(layout.FOOT_Y-d.depth)*H;u.h=BATTLE_SIZE[u.key];u.maxhp=u.hp=900000;u.gauge=[10,30,56][i];});battle.P=battle.heroes[0];battle.active=battle.P;battle.state='act';units.clear();tintCache.clear();for(let u of battle.units)units.set(u,cacheUnit(u));heroParts=makeHeroParts(IMG.b_yegx_cast);layoutAudit=battle.units.map(u=>({name:u.name,side:u.side,x:u.x,y:u.y,visibleHeight:units.get(u).visibleHeight,ratioToScreen:units.get(u).visibleHeight/H,sourceBounds:units.get(u).bounds}));
 if(!hud){hud=mk(W,H);c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,c.canvas.width,c.canvas.height);drawBattleHud();hud.getContext('2d').drawImage(c.canvas,0,0,W,H,0,0,W,H);c.clearRect(0,0,c.canvas.width,c.canvas.height);c.restore();}hitIndex=0;events.length=0;wall=raw=t=0;FX.length=0;s.scene=()=>render(wall);}
window.SUN_RT={rtBack,rtFront,duration:12.4,getEnemySwordAudit,getSwordMotionAudit,preload,fixture,render,renderSunLoop,setDirection(key){solarDirection=key;sunPixels=sunSets[key];sunTextureKey=null;},auditRecall,setArrayReview(mode,hideHud=false){arrayMaterial=mode;closeup=hideHud;},setDebugMode(v){debugMode=v;},getLightLayer(){return fx;},renderArrayDetail,renderSunDetail,duration,events,layoutAudit:()=>layoutAudit,auditMotion(){let maxStartPositionError=0,maxStartAngleError=0,maxGrowthPositionError=0;for(const p of rainItems()){const a=frozenSword(p),v=recallPose(p,6.6);maxStartPositionError=Math.max(maxStartPositionError,Math.hypot(v.x-a.x,v.y-a.y));maxStartAngleError=Math.max(maxStartAngleError,Math.abs(v.angle-a.angle));const g=rainPose(p,p.birth+p.grow-1e-8),f=rainPose(p,p.birth+p.grow+1e-8);maxGrowthPositionError=Math.max(maxGrowthPositionError,Math.hypot(g.x-f.x,g.y-f.y));}return{maxStartPositionError,maxStartAngleError,maxGrowthPositionError,rainObjectCount:rainItems().length,riverGroups:0,recallTimes:[6.6,7,8.4,8.8],births:rainItems().map(p=>p.birth)};},inspect(){const items=rainItems();return{wheel:{material:"four newly generated transparent layers",blend:"screen",sourceOverSun:false,phaseRates:[18,-27,31],formation:[.80,1.65],environmentPrelight:[.50,1.35]},battleUnits:battle.units.map(u=>({key:u.key,name:u.name,side:u.side,x:u.x,y:u.y,h:u.h,hp:u.hp,maxhp:u.maxhp})),damageEventLog:JSON.parse(JSON.stringify(events)),raw:wall,legacyRaw:raw,time:t,camera:camera(),phase:phaseName(),nightOpacity:night(),sceneBaseBrightness:1-night(),array:{...SUN_ARRAY_V8.inspect(t),sky,ground},heroArmAngle:armAngle(),requiredVfxImages:Object.keys(A).length,rain:{start:3.2,end:6.6,total:items.length,rate:t<3.2||t>=6.6?0:20+100*(t-3.2)/3.4,active:items.filter(p=>t>=p.birth&&t<6.6).length,airborne:items.filter(p=>t>=p.birth&&t<p.hit).length,planted:items.filter(p=>t>=p.hit&&t<6.6).length},recall:{active:wall>=6.6&&wall<8.8,groups:0,pause:[6.6,7],rivers:[7,8.4],insert:[8.4,8.8],sun:imperialState()},impact:{rayCount:224,seconds:9.4,extendComplete:10.0,fadeEnd:11.0},damageEvents:hitIndex,whiteFlash:raw>=8-1e-7&&raw<8+2/30-1e-7,hitstop:raw>=8+2/30-1e-7&&raw<8.2-1e-7,darkHold:raw>=7.4-1e-7&&raw<7.7-1e-7,reactions:QE().map(u=>({name:u.name,...reaction(u)})),layout:layoutAudit};}};
})();

// Only recall is lengthened. All preserved stages receive the original v20 clock.
(()=>{
 const api=window.SUN_RT,draw=api.render,inspect=api.inspect;let realClock=0;
 const toEffect=z=>z<=6.6?z:z<9.8?6.6+(z-6.6)*2.2/3.2:z-1;
 const toReal=z=>z<=6.6?z:z<8.8?6.6+(z-6.6)*3.2/2.2:z+1;
 api.render=z=>{realClock=z;return draw(toEffect(z));};
 api.inspect=()=>{const v=inspect();return{...v,raw:realClock,effectClock:v.raw,
  damageEventLog:v.damageEventLog.map(e=>({...e,time:toReal(e.time)})),
  recall:{...v.recall,active:realClock>=6.6&&realClock<9.8,groups:1,pause:[6.6,6.78],rivers:[6.78,9.15],insert:[9.15,9.8],style:'rising tapered helical sword vortex'},
  impact:{...v.impact,seconds:10.4,extendComplete:11,fadeEnd:12}};};
 api.duration=12.4;api.presentationToEffectTime=toEffect;api.effectToPresentationTime=toReal;
})();
