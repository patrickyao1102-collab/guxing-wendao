/* 太阳剑阵 v13 — approved v2 image assets and Luochen impact sequences; v4 array geometry retained by user request, with layered material and image-flow overlays.
   Only the original game's backdrop, fixed player artwork and beasts are used. */
(function(){'use strict';
const C=x=>Math.max(0,Math.min(1,x)),TAU=Math.PI*2,
 E=(t,a,b)=>{let q=C((t-a)/(b-a));return q*q*(3-2*q)},L=(a,b,q)=>a+(b-a)*q,
 R=i=>{let x=Math.sin(i*127.1+49.3)*43758.5453;return x-Math.floor(x)};
const main=ctx;let c=main;const impact=8.0,duration=6.0,damageTimes=[...Array.from({length:27},(_,i)=>3.9+i*.10),8.0],layout=BATTLE_LAYOUT;
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
const DIANXING_ALIGNMENT=[{"frame": 0, "center": [226, 251], "radius": 132, "score": 149.58486764705884}, {"frame": 1, "center": [225, 251], "radius": 132, "score": 138.78976429738566}, {"frame": 2, "center": [224, 251], "radius": 132, "score": 142.39006576797385}, {"frame": 3, "center": [222, 251], "radius": 132, "score": 139.2821866830065}, {"frame": 4, "center": [225, 250], "radius": 132, "score": 140.918658496732}, {"frame": 5, "center": [224, 250], "radius": 132, "score": 141.30993137254904}, {"frame": 6, "center": [224, 250], "radius": 132, "score": 133.93403839869285}, {"frame": 7, "center": [225, 250], "radius": 132, "score": 148.5017283496732}];
async function preload(){
 const files=[['sky_atlas','sky4.webp'],['clean_seal','seal_master.webp'],['sweep_atlas','sweep6.webp'],['seal_atlas','seal4.webp'],['imperial_atlas','imperial6.webp'],['star_atlas','star4.webp'],['radiance_atlas','radiance6.webp'],['arc_atlas','arc6.webp'],['impact_atlas','impact6.webp']];
 return Promise.all(files.map(([key,file])=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>{A['sx_'+key]=im;ok();};im.onerror=no;im.src='sx_assets/'+file;}))).then(()=>{
  for(const kind of ['star','impact','radiance','arc','imperial']){const im=A['sx_'+kind+'_atlas'],cols=2,rows=kind==='star'?2:3,w=Math.floor(im.width/cols),h=Math.floor(im.height/rows),anchors=kind==='imperial'?[[.071,.586],[.056,.586],[.071,.54],[.021,.54],[.071,.507],[.067,.507]]:kind==='impact'?[[.503,.643],[.503,.617],[.506,.523],[.496,.822],[.496,.77],[.496,.773]]:kind==='arc'?[[.285,.488],[.211,.488],[.166,.484],[.195,.484],[.25,.461],[.191,.50]]:[[.209,.525],[.025,.527],[.018,.484],[.064,.474],[.033,.418],[.05,.441]];
   for(let j=0;j<cols*rows;j++){const cv=mk(w,h),g=cv.getContext('2d');g.drawImage(im,j%cols*w,Math.floor(j/cols)*h,w,h,0,0,w,h);const p=g.getImageData(0,0,w,h),d=p.data;let sx=0,sy=0,ss=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4,l=(d[k]*.2126+d[k+1]*.7152+d[k+2]*.0722)/255,edge=C(Math.min(x,y,w-1-x,h-1-y)/12),energy=kind==='imperial'?.45+.55*Math.pow(l,1.3):(kind==='radiance'||kind==='arc')?.14+.86*Math.pow(C((l-.06)/.94),1.5):kind==='star'?.28+.72*Math.pow(C((l-.035)/.965),1.3):.12+.88*Math.pow(l,1.05);d[k+3]*=energy*edge*(kind==='radiance'?Math.pow(C((w-1-x)/(w*.30)),1.35):1);const z=Math.pow(Math.min(d[k],d[k+1],d[k+2])/255,9)*d[k+3]/255;if(kind==='star'&&x>w*.24&&x<w*.76&&y>h*.24&&y<h*.76){sx+=x*z;sy+=y*z;ss+=z;}}
    g.putImageData(p,0,0);const out=mk(w,h),o=out.getContext('2d'),an=kind==='star'?[sx/ss/w||.5,sy/ss/h||.5]:anchors[j];o.drawImage(cv,w*((kind==='radiance'||kind==='imperial')?.06:kind==='arc'?.22:.5)-an[0]*w,h*(kind==='impact'?.68:.5)-an[1]*h);A['sx_'+kind+j]=out;
   }
  }
  preloadSweepTextures();preloadSummonedSword();assetsReady=true;return Promise.all([preloadForgeMaterials()]);
 });
}

const fx=mk(W,H),fxc=fx.getContext('2d'),small4=mk(W/4,H/4),blur4=mk(W/4,H/4),small8=mk(W/8,H/8),blur8=mk(W/8,H/8),litCache=new WeakMap();
let debugMode='normal';const solid=mk(W*2,H*2),solidc=solid.getContext('2d');
function prepareLightAssets(){for(const key of Object.keys(A)){const im=A[key],isSword=key==='sword',w=im.width,h=isSword?Math.min(1125,im.height):im.height,cv=mk(w,h),g=cv.getContext('2d');g.drawImage(im,0,0);const data=g.getImageData(0,0,w,h),d=data.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let i=(y*w+x)*4,L=(d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722)/255,em=Math.pow(C((L-.055)/.945),1.25),fade=1;
  if(isSword){const yy=y/h,xx=(x-w*.5)/w,spread=yy<.70?.17:yy<.90?.48:.19;fade=Math.exp(-Math.pow(Math.abs(xx)/spread,4));em=Math.pow(C((L-.16)/.84),1.25)*.68;const core=Math.exp(-Math.pow(xx/.025,2))*E(yy,.015,.055)*(1-E(yy,.64,.72));em=Math.max(em,core*(.74+.22*L));}
  d[i]=255;d[i+1]=Math.round(238+15*L);d[i+2]=Math.round(196+50*L);d[i+3]=Math.round(d[i+3]*em*fade);
 }g.putImageData(data,0,0);A[key]=cv;}}
function glow(g,x,y,rx,ry,strength,col='255,244,214'){if(strength<=0)return;g.save();g.translate(x,y);g.scale(rx,ry);g.globalCompositeOperation='screen';const q=g.createRadialGradient(0,0,0,0,0,1);q.addColorStop(0,'rgba('+col+','+strength+')');q.addColorStop(.28,'rgba('+col+','+(strength*.75)+')');q.addColorStop(.65,'rgba('+col+','+(strength*.24)+')');q.addColorStop(1,'rgba('+col+',0)');g.fillStyle=q;g.fillRect(-1,-1,2,2);g.restore();}
function lightLevel(){return Math.max(dxCharge()*.65,dxBurst());}
function lightLevelV8(){if(t<2.2)return .86*E(t,.65,1.7);if(t<3.2)return L(.86,.58,sunMorph());if(t<6.6)return .52+.12*Math.pow(.5+.5*Math.cos((t-3.2)*TAU),6);if(t<7.4)return .58*(1-E(t,7.2,7.4));if(t<7.7)return .015;if(t<8)return .12+.8*E(t,7.7,8);return (1-E(impactAge(),.2,1.65))*.9;}
function environmentLight(){const a=forgePose(),p=sxSwordPose(),h=dxCaster(),u=dxTarget(),b=dxBurst();glow(c,a.x,a.y,340,190,a.alpha*.18,'255,220,208');glow(c,p.center.x,p.center.y,320,175,p.alpha*.22,'255,214,204');glow(c,h.x,h.y,95,22,dxCharge()*.10,'255,212,198');glow(c,u.x,u.y,130,28,b*.38,'255,230,215');glow(c,u.x,u.y-u.h*.62,175,195,b*.45,'255,235,223');}
function environmentLightV8(){
 const h=solarHeatState();if(!h.active||h.intensity<=0){environmentLightV8CoolBase();return;}
 const a=C(h.intensity);c.save();c.globalAlpha*=1-a;environmentLightV8CoolBase();c.restore();
 radiantEnvironment({...h,intensity:a});
}
function illuminate(im,bounds){if(litCache.has(im))return litCache.get(im);const w=im.width,h=im.height,fill=mk(w,h),rim=mk(w,h),g=fill.getContext('2d'),r=rim.getContext('2d'),top=bounds?.[1]||0,bottom=bounds?.[3]||h;
 g.drawImage(im,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff9e8';g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-in';const grad=g.createLinearGradient(0,top,0,bottom);grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(.5,'rgba(255,255,255,.60)');grad.addColorStop(1,'rgba(255,255,255,.09)');g.fillStyle=grad;g.fillRect(0,0,w,h);
 r.drawImage(fill,-2,-6);r.globalCompositeOperation='destination-out';r.drawImage(im,0,0);litCache.set(im,{fill,rim});return{fill,rim};}
function bloomComposite(){
 for(const[small,blur,scale,radius]of[[small4,blur4,4,12],[small8,blur8,8,36]]){const g=small.getContext('2d'),b=blur.getContext('2d');g.clearRect(0,0,small.width,small.height);g.drawImage(fx,0,0,small.width,small.height);b.clearRect(0,0,blur.width,blur.height);b.filter='blur('+radius/scale+'px)';b.drawImage(small,0,0);b.filter='none';}
 main.save();main.globalCompositeOperation='screen';main.globalAlpha=1;main.drawImage(fx,0,0,W,H);main.globalCompositeOperation='lighter';main.globalAlpha=.23;main.drawImage(blur4,0,0,W,H);main.globalAlpha=.11;main.drawImage(blur8,0,0,W,H);main.restore();
}
function bloomCompositeV8(){for(const [small,blur,scale,radius]of[[small4,blur4,4,12],[small8,blur8,8,40]]){const g=small.getContext('2d'),b=blur.getContext('2d');g.clearRect(0,0,small.width,small.height);g.drawImage(fx,0,0,small.width,small.height);b.clearRect(0,0,blur.width,blur.height);b.filter='blur('+radius/scale+'px)';b.drawImage(small,0,0);b.filter='none';b.globalCompositeOperation='source-in';b.fillStyle=scale===4?'#fff2d7':'#ffe9c1';b.fillRect(0,0,b.canvas.width,b.canvas.height);b.globalCompositeOperation='source-over';}
 main.save();main.globalCompositeOperation='screen';main.globalAlpha=.94;main.drawImage(fx,0,0,W,H);main.globalCompositeOperation='lighter';main.globalAlpha=(.40-.34*(E(wall,.8,1.15)*(1-E(wall,2.55,3.2))+E(wall,7.04,7.35)*(1-E(wall,9.1,9.4))));main.drawImage(blur4,0,0,W,H);main.globalAlpha=(.40-.37*(E(wall,.8,1.15)*(1-E(wall,2.55,3.2))+E(wall,7.04,7.35)*(1-E(wall,9.1,9.4))));main.drawImage(blur8,0,0,W,H);main.restore();}
function tex(k,x,y,w,h,a=1,rot=0,blend='screen',ax=.5,ay=.5,filter='none'){if(a<=0||!A[k])return;c.save();c.translate(x,y);c.rotate(rot);c.globalCompositeOperation='screen';c.globalAlpha=C(a);c.filter=filter;c.drawImage(A[k],-w*ax,-h*ay,w,h);c.restore();}
function seq(prefix,q,x,y,w,h,a=1,rot=0,ax=.5,ay=.5){const f=((q%1+1)%1)*8,i=Math.floor(f),u=E(f-i,0,1);tex(prefix+i,x,y,w,h,a*(1-u),rot,'screen',ax,ay);tex(prefix+(i+1)%8,x,y,w,h,a*u,rot,'screen',ax,ay);}
function impactSeq(prefix,age,x,y,w,h,a=1){const f=Math.min(7,3+age*12),i=Math.floor(f),q=E(f-i,0,1);tex(prefix+i,x,y,w,h,a*(1-q),0,'screen',.5,.80,'none');tex(prefix+Math.min(7,i+1),x,y,w,h,a*q,0,'screen',.5,.80,'none');}
function sunPower(){return lightLevel();}
function pulse(x,w){return Math.exp(-Math.pow((t-x)/w,2));}
// v8: an enemy-side sun continuously unfolds into the existing array geometry.



function sword(x,y,h,a,seed=0,angle=0,depth=1){if(a<=0||h<=0)return;const tip=y+h*.49,w=h*A.solid.width/A.solid.height*(h>600?3.5:1.2),g=solidc,m=c.getTransform();g.save();g.setTransform(m.a*2,m.b*2,m.c*2,m.d*2,m.e*2,m.f*2);g.translate(x,tip);g.rotate(angle);g.globalCompositeOperation='source-over';g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.globalAlpha=C(a)*.9;g.filter='brightness('+(depth<.45?.53:depth<.75?.79:1)+')';const edge=h>600?2:Math.min(1.05,h*.011);for(const dx of [-edge,edge])g.drawImage(A.solidEdge,-w*.5+dx,-h,w,h);g.drawImage(A.solid,-w*.5,-h,w,h);g.restore();c.save();c.translate(x,tip);c.rotate(angle);c.globalCompositeOperation='screen';c.globalAlpha=a*.12;c.filter='blur(1px)';c.drawImage(A.solidEdge,-w*.5,-h,w,h);c.restore();}
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




function phaseName(){return raw<.45?'万光归阵':raw<1.45?'八剑天阵成型':raw<2.85?'阵心铸出巨剑':raw<101/30?'法阵收锋压蓄':raw<104/30?'三帧破空':raw<4.5?'杀星重击轰退':'阵散光归';}
function arrayPlane(isGround){if(wall<6.6)return arrayPlaneV8(isGround);if(wall>=8.8)return;const q=E(wall,7,8.8),clock=6.6+Math.max(0,wall-7),u=Math.max(0,wall-7),angle=(6.6-3.2)*(isGround?TAU/15:-TAU/13.5)+(isGround?1:-1)*TAU*(.05*u+.30*u*u),x=isGround?ground.x:L(sky.x,430,q),y=isGround?ground.y:L(sky.y,180,q),rx=(isGround?ground.rx:sky.rx)*(1-.95*q),ry=(isGround?ground.ry:sky.ry)*(1-.86*q),alpha=(isGround?.58:1)*(1-E(wall,8.25,8.8));c.save();c.translate(x,y);c.scale(rx/420,ry/132);c.translate(-435,-205);SUN_ARRAY_V8.render(c,A,clock,{a:alpha,grow:1,reveal:1,morph:1,angle,dust:false},'new');c.restore();}
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
function prepareSolidSword(im){const cv=mk(424,1507),g=cv.getContext('2d');g.drawImage(im,300,10,424,1507,0,0,424,1507);const d=g.getImageData(0,0,424,1507);for(let i=3;i<d.data.length;i+=4)d.data[i]=Math.round(C((d.data[i]/255-.65)/.35)*255);g.putImageData(d,0,0);A.solid=cv;const edge=mk(424,1507),e=edge.getContext('2d');e.drawImage(cv,0,0);e.globalCompositeOperation='source-in';e.fillStyle='#efd9ad';e.fillRect(0,0,424,1507);A.solidEdge=edge;}
function beginFx(){fxc.setTransform(1,0,0,1,0,0);fxc.clearRect(0,0,W,H);solidc.setTransform(1,0,0,1,0,0);solidc.clearRect(0,0,W*2,H*2);c=fxc;}
function finishFx(){c=main;bloomComposite();main.save();main.imageSmoothingEnabled=true;main.imageSmoothingQuality='high';main.globalCompositeOperation='source-over';main.globalAlpha=1;main.drawImage(solid,0,0,W,H);main.restore();}
function rainItems(){if(rainItems.cache)return rainItems.cache;const list=[],acc=100/6.8;for(let i=0;i<238;i++){const u=(-20+Math.sqrt(400+4*acc*(i+.5)))/(2*acc),birth=3.2+u,seed=4000+i*17,k=i%10<3?0:i%10<7?1:2,ring=[.56,.705,.84,.971][i%4],an=i*2.399-(birth-3.2)*TAU/13.5,ox=sky.x+Math.cos(an)*sky.rx*ring,oy=sky.y+Math.sin(an)*sky.ry*ring,grow=.09+R(seed+10)*.055,angle=(ox<180||ox>850?-1:1)*(10+R(seed+5)*10)*Math.PI/180,y=k===0?335+R(seed+3)*95:k===1?495+R(seed+3)*120:625+R(seed+3)*85,x=ox-(y-oy)*Math.tan(angle),size=k===0?70+R(seed+4)*12:k===1?86+R(seed+4)*22:111+R(seed+4)*19,flight=k===0?.46+R(seed+6)*.12:k===1?.35+R(seed+6)*.14:.30+R(seed+6)*.12,hit=birth+grow+flight;list.push({id:i,seed,k,ring,an,ox,oy,x,y,size,angle,birth,grow,flight,hit,depth:[.3,.65,.95][k]});}return rainItems.cache=list;}
function renderRain(layer){if(t<3.2||t>=6.6)return;for(const p of rainItems()){if((layer==='far')!==(p.k===0))continue;const pose=rainPose(p,t);if(!pose)continue;const age=t-p.hit;if(age<0&&!pose.growing){for(let j=2;j>=1;j--){const prev=rainPose(p,t-j*.035);if(prev)sword(prev.x,prev.y,prev.h,.11/j,p.seed,prev.angle,p.depth);}}sword(pose.x,pose.y,pose.h,1,p.seed,pose.angle,p.depth);if(pose.growing)tex('hit',p.ox,p.oy,28,16,.48);if(age>=0){const pop=1-E(age,.015,.14);tex('hit',p.x,p.y,16+p.size*.15,16+p.size*.15,pop*(p.k===0?.3:.7));tex('shock',p.x,p.y,21+p.size*.13,5+p.size*.02,(1-E(age,.08,.28))*.32);if(p.k>0){crack(p.x,p.y,15+p.size*.08,p.seed,(1-E(age,.1,.55))*.30);for(let j=0;j<4;j++){const an=R(p.seed+j)*TAU,px=p.x+Math.cos(an)*age*(65+R(j+p.id)*90),py=p.y-90*age+180*age*age+Math.sin(an)*age*40;star(px,py,1.1+R(j+p.id)*1.3,(1-E(age,.08,.24))*.7);}}}}}
function renderArrayDetail(){c=main;main.fillStyle='#071225';main.fillRect(0,0,W,H);beginFx();c.save();c.translate(640,350);c.scale(1.05,1.42);c.translate(-435,-205);SUN_ARRAY_V8.render(c,A,4.1,{a:1,grow:1,reveal:1,morph:1,angle:.18,dust:false},'new');c.restore();finishFx();main.fillStyle='#fff7e9';main.font='600 25px '+FONT;main.fillText('v12 · 保留原法阵',32,48);}
function sunMorph(){return E(t,2.2,3.2);}
function sunGeometry(){const m=sunMorph(),q=E(t,.8,1.9),closing=E(t,6.6,7.4);return{x:L(L(430,sky.x,m),430,closing),y:L(sky.y,180,closing),rx:L(L(7,144,q),sky.rx,m)*(1-.69*closing),ry:L(L(7,144,q),sky.ry,m)*(1-.03*closing),morph:m*(1-closing),alpha:E(t,.8,1.05)*(1-E(t,8,8.3)),closing};}
function impactAge(){return raw<8.2?0:raw-8.2;}
function finalSun(){const q=E(t,6.6,7.4),f=C((t-7.7)/.3),fall=f*f;return{x:L(430,340,fall),y:L(180,440,fall),r:L(104,160,fall),q,fall,age:impactAge()};}
function shadows(){const power=lightLevel();if(power<=0)return;for(const u of battle.units){const f=units.get(u),rr=reaction(u);c.save();c.translate(u.x+rr.dx,u.y);const dx=(u.x-430)/500;c.transform(1,0,dx*.65,-.16-.36*power,0,0);c.scale(f.scale,f.scale);c.globalAlpha=.12+power*.17;c.filter='blur(3px)';c.drawImage(tinted(f.im,'#020714'),-f.footX,-f.footY);c.restore();}}
function orbSkin(x,y,rx,ry,m,alpha,late=false){drawSolarMaterial(x,y,rx,ry,m,alpha,sunLoopClock===null?flowTime()-.8:sunLoopClock,0);}
function rainPose(p,clock){if(clock<p.birth)return null;const g=C((clock-p.birth)/p.grow);if(g<1)return{x:p.ox,y:p.oy+p.size*g*.45,h:p.size*g,angle:p.angle,growing:true};const q=C((clock-p.birth-p.grow)/p.flight),v=.4*q+.6*q*q;return{x:L(p.ox,p.x,v),y:L(p.oy+p.size*.45,p.y-p.size*.49,v),h:p.size,angle:p.angle,growing:false};}
function recallPose(p,clock){
 const plan=recallPlan(p),{start,pull,launch,arrival,initialAngle}=plan,brightness0=p.depth<.45?.53:p.depth<.75?.79:1;
 if(clock<launch){const lifted=E(clock,pull,launch),turn=E(clock,pull+.065,launch),tremble=plan.grounded&&clock>pull-.09&&clock<pull?Math.sin((clock-pull)*77+p.seed)*.38*Math.sin(E(clock,pull-.09,pull)*Math.PI):0;
 return{...start,x:L(start.x,plan.p0.x,lifted)+(start.x>740?-Math.abs(tremble):tremble),y:start.y-plan.lift*lifted,angle:shortAngle(start.angle,initialAngle,turn),alpha:1,depth:p.depth,brightness:brightness0+(plan.hero>=0?.04*lifted:0),q:0,phase:clock<pull?'held':'drawing',hero:plan.hero};}
 const u=C((clock-launch)/(arrival-launch)),v=recallCurve(plan,u),depth=L(p.depth,plan.depth,Math.sin(u*Math.PI));
 return{...v,h:start.h,alpha:clock<arrival+.035?1:0,depth,brightness:brightness0+(plan.hero>=0?.04:0),phase:clock<arrival?'flying':'inside',hero:plan.hero,arrival};
}
function recallSwords(){
 if(wall<6.6||wall>=8.8)return;const core=imperialState(),rows=rainItems().map(p=>({p,v:recallPose(p,wall)})).sort((a,b)=>a.v.depth-b.v.depth);
 for(const{p,v}of rows){if(v.alpha<=0)continue;const plan=recallPlan(p);
  // Short, detached afterimages preserve readable blades; there are no continuous curve strokes.
  if(v.phase==='flying'&&wall>plan.launch+.07&&(p.id%4===0||plan.hero>=0)){const prev=recallPose(p,wall-.023);recallBlade(p,prev,plan.hero>=0?.16:.09,core);}
  recallBlade(p,v,1,core);
  if(v.phase==='drawing'&&plan.grounded){const age=wall-plan.pull,flash=(1-E(age,.025,.11))*.22;tex('hit',p.x,p.y,18,10,flash);}
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
 if(alpha<=0||rx<=0||!sunPixels.length)return;buildSolarTexture(clock,m,pulse);const g=solidc,mat=c.getTransform(),w=m>0?L(144*9.92,rx*2.314666667,m):rx*9.92,h=m>0?L(144*9.92,ry*2.314666667,m):ry*9.92,cw=rx*2.314666667,ch=ry*2.314666667,rayAlpha=alpha*(1-E(m,.10,.86))*(1+.08*pulse),bodyAlpha=alpha*(1-E(m,.74,1));
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=rayAlpha;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(sunWarp,x-w/2,y-h/2,w,h);c.globalAlpha=rayAlpha*.18;c.filter='blur(5px)';c.drawImage(sunWarp,x-w/2,y-h/2,w,h);c.globalAlpha=bodyAlpha*.25;c.filter='blur(7px)';c.drawImage(sunBody,x-cw/2,y-ch/2,cw,ch);c.restore();
 glow(c,x,y,rx*1.25,ry*1.25,bodyAlpha*.11,'255,244,214');
 g.save();g.setTransform(mat.a*2,mat.b*2,mat.c*2,mat.d*2,mat.e*2,mat.f*2);g.globalCompositeOperation='source-over';g.globalAlpha=bodyAlpha*.97;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(sunBody,x-cw/2,y-ch/2,cw,ch);g.restore();
}
function renderSunLoop(z){sunLoopClock=z;render(2.18);sunLoopClock=null;}
function recallPlan(p){
 if(recallPlan.cache?.has(p.id))return recallPlan.cache.get(p.id);
 if(!recallPlan.cache){recallPlan.cache=new Map();const heroic=rainItems().filter(v=>v.k===2).sort((a,b)=>b.size-a.size).slice(0,6).map(v=>v.id);recallPlan.heroes=heroic;}
 const start=frozenSword(p),seed=p.seed,hero=recallPlan.heroes.indexOf(p.id),grounded=p.hit<=6.6;
 // Depth orders the release, not the path. No equal-angle groups or shared spiral rail.
 const pull=hero>=0?7.30+hero*.023:6.76+p.k*.145+R(seed+117)*.10;
 const launch=pull+(grounded?.235:.18),arrival=hero>=0?8.63+hero*.027:[7.50,7.85,8.20][p.k]+R(seed+119)*[.30,.40,.45][p.k];
 const lift=(grounded?27+R(seed+120)*25:12+R(seed+120)*14)*(p.k===0?.78:1),inward=Math.min(180,Math.max(0,start.x-740))*.55,p0={x:start.x-inward,y:start.y-lift},end=riverCenter(arrival);
 let approach=Math.atan2(p0.y-end.y,p0.x-end.x)+(R(seed+121)-.5)*1.5;
 if(p.id%9===0)approach=-.35-R(seed+123)*2.40;
 const reach=125+R(seed+124)*135,side=(p0.x<end.x?-1:1)*(R(seed+125)<.18?-1:1);
 const p1={x:p0.x>740?Math.min(700,p0.x-90-R(seed+126)*100):Math.min(730,p0.x+side*(35+R(seed+126)*115)),y:p0.y-(p.k===0?80+R(seed+127)*100:95+R(seed+127)*150)};
 const p2={x:end.x+Math.cos(approach)*reach,y:Math.max(48,end.y+Math.sin(approach)*reach*.86)};
 const initialAngle=Math.atan2(-(p1.x-p0.x),p1.y-p0.y),depth=.54+R(seed+129)*.46;
 const value={start,pull,launch,arrival,lift,p0,p1,p2,end,initialAngle,depth,hero,grounded};recallPlan.cache.set(p.id,value);return value;
}
function recallCurve(plan,u){
 const q=u*u*(1.8-.8*u),z=1-q,{p0,p1,p2,end:p3}=plan;
 const x=z*z*z*p0.x+3*z*z*q*p1.x+3*z*q*q*p2.x+q*q*q*p3.x,y=z*z*z*p0.y+3*z*z*q*p1.y+3*z*q*q*p2.y+q*q*q*p3.y;
 const vx=3*z*z*(p1.x-p0.x)+6*z*q*(p2.x-p1.x)+3*q*q*(p3.x-p2.x),vy=3*z*z*(p1.y-p0.y)+6*z*q*(p2.y-p1.y)+3*q*q*(p3.y-p2.y);
 return{x,y,angle:Math.atan2(-vx,vy),q};
}
function recallCoreState(clock){
 const center=riverCenter(clock);let swallowed=0,pulse=0;
 for(const p of rainItems()){const plan=recallPlan(p);swallowed+=E(clock,plan.arrival-.15,plan.arrival+.015);}
 // Broad overlapping impacts make surface waves, not a metronomic whole-sphere flash.
 for(const [at,amp]of[[7.62,.40],[7.94,.48],[8.17,.58],[8.44,.65],[8.70,.85]])pulse+=amp*Math.exp(-Math.pow((clock-at)/.065,2));
 const q=swallowed/238,r=22+34*E(clock,7.04,7.50)+48*Math.pow(q,.65);
 return{x:center.x,y:center.y,r,alpha:E(clock,7.04,7.32),pulse:Math.min(1,pulse)*(1-E(clock,8.77,8.8)),swallowed,swallowFraction:q,maskRadius:sunCoreRadius(r)};
}
function recallBlade(p,v,strength,core){
 if(v.alpha<=0||strength<=0)return;const h=v.h,w=h*A.solid.width/A.solid.height*1.2,m=c.getTransform(),g=solidc,clip=core.alpha>.7,edge=Math.min(1.05,h*.011);
 // Clip only this blade and its local glow. Existing array and previously drawn pixels are untouched.
 function outside(ctx,twice){ctx.setTransform(m.a*twice,m.b*twice,m.c*twice,m.d*twice,m.e*twice,m.f*twice);if(clip){ctx.beginPath();ctx.rect(-1000,-1000,W+2000,H+2000);ctx.moveTo(core.x+core.maskRadius,core.y);ctx.arc(core.x,core.y,core.maskRadius,0,TAU);ctx.clip('evenodd');}}
 g.save();outside(g,2);g.translate(v.x,v.y);g.rotate(v.angle);g.globalCompositeOperation='source-over';g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.globalAlpha=v.alpha*.9*strength;g.filter='brightness('+v.brightness+')';for(const dx of[-edge,edge])g.drawImage(A.solidEdge,-w*.5+dx,-h*.5,w,h);g.drawImage(A.solid,-w*.5,-h*.5,w,h);g.restore();
 c.save();outside(c,1);c.translate(v.x,v.y);c.rotate(v.angle);c.globalCompositeOperation='screen';c.globalAlpha=v.alpha*.12*strength;c.filter='blur(1px)';c.drawImage(A.solidEdge,-w*.5,-h*.5,w,h);
 if(v.phase==='flying'){c.globalAlpha=v.alpha*.16*strength;c.filter='blur(.5px)';c.drawImage(A.v10swordLight,-w*.5,-h*.5,w,h);}c.restore();
}
function auditRecall(){
 let maxStartPositionError=0,maxStartAngleError=0,maxLaunchPositionError=0,maxLaunchAngleError=0,maxHeightChange=0,minEndOcclusionMargin=Infinity,maxFrameTravel=0,maxAdditionalAllywardTravel=0;const items=rainItems();
 for(const p of items){const start=frozenSword(p),a=recallPose(p,6.6),plan=recallPlan(p),before=recallPose(p,plan.launch-1e-7),after=recallPose(p,plan.launch+1e-7),core=recallCoreState(plan.arrival+.02),end=recallPose(p,plan.arrival+.02);
 maxStartPositionError=Math.max(maxStartPositionError,Math.hypot(start.x-a.x,start.y-a.y));maxStartAngleError=Math.max(maxStartAngleError,Math.abs(start.angle-a.angle));maxLaunchPositionError=Math.max(maxLaunchPositionError,Math.hypot(before.x-after.x,before.y-after.y));maxLaunchAngleError=Math.max(maxLaunchAngleError,Math.abs(Math.atan2(Math.sin(after.angle-before.angle),Math.cos(after.angle-before.angle))));
 minEndOcclusionMargin=Math.min(minEndOcclusionMargin,core.maskRadius-Math.hypot(end.x-core.x,end.y-core.y)-start.h*.52);
 for(let j=0;j<=66;j++){const v=recallPose(p,6.6+j/30),prior=recallPose(p,6.6+Math.max(0,j-1)/30);maxHeightChange=Math.max(maxHeightChange,Math.abs(v.h-start.h));if(start.x>740)maxAdditionalAllywardTravel=Math.max(maxAdditionalAllywardTravel,v.x-start.x);maxFrameTravel=Math.max(maxFrameTravel,Math.hypot(v.x-prior.x,v.y-prior.y));}}
 return{style:'individual staggered extraction, crossing curved pursuit, tip-first core occlusion',swords:items.length,sharedSpiralTracks:0,continuousTrailStrokes:0,maxStartPositionError,maxStartAngleError,maxLaunchPositionError,maxLaunchAngleError,maxHeightChange,minEndOcclusionMargin,maxFrameTravel,maxAdditionalAllywardTravel,largeLastSwords:recallPlan.heroes.map(id=>({id,launch:recallPlan(items.find(p=>p.id===id)).launch,arrival:recallPlan(items.find(p=>p.id===id)).arrival})),depthTiming:[0,1,2].map(k=>{const rows=items.filter(p=>p.k===k).map(recallPlan);return{depth:k,launch:[Math.min(...rows.map(p=>p.launch)),Math.max(...rows.map(p=>p.launch))],arrival:[Math.min(...rows.map(p=>p.arrival)),Math.max(...rows.map(p=>p.arrival))]};})};
}
function environmentLightV8CoolBase(){const q=lightLevel(),solar=E(t,.8,1.5)*(1-E(t,2.2,3.2));glow(c,430,220,640,390,solar*.32);glow(c,355,485,535,365,q*.34);glow(c,340,600,460,104,q*.44);glow(c,340,600,290,47,q*.18);const f=finger();glow(c,f.x,f.y,150,140,clampPulse(t,.05,1.25)*.18);if(t>=3.2&&t<6.6)for(const p of rainItems()){const age=t-p.hit;if(age>=0&&age<.22)glow(c,p.x,p.y+2,23,6,(1-E(age,.02,.22))*.18);}if(t>=7.7)glow(c,340,500,760,320,(1-E(impactAge(),.05,1.2))*.35);}
function environmentLightCoolBase(){if(wall<6.6)return environmentLightV8();const q=lightLevel();glow(c,430,280,660,420,q*.30);glow(c,340,600,530,120,q*.36);if(wall>=9.4){glow(c,340,520,550,280,(1-E(impactAge(),.20,1.5))*.21);}}
function drawUnit5CoolBase(u){const f=units.get(u),rr=reaction(u),sunLit=sunPower(),isHero=u===battle.P;c.save();c.translate(u.x+rr.dx,u.y-rr.lift);c.rotate(rr.angle);c.scale(f.scale,f.scale*rr.sy);c.translate(-f.footX,-f.footY);c.globalAlpha=1;c.filter='brightness('+(1-night()*.50+sunLit*.09)+')';
 function body(im){c.save();c.globalAlpha*=1;c.drawImage(im,0,0);c.restore();if(debugMode!=='unlit'){const lit=illuminate(im,f.bounds),q=lightLevel()*(u.side==='enemy'?.48:.12);c.save();c.filter='none';c.globalCompositeOperation='screen';c.globalAlpha=q;c.drawImage(lit.fill,0,0);c.globalAlpha=q*1.40;c.filter='blur(1px)';c.drawImage(lit.rim,0,0);c.restore();}if(rr.tint){c.save();c.filter='none';c.globalAlpha=.30;c.drawImage(tinted(im,rr.tint),0,0);c.restore();}}
 if(isHero){let idle=E(t,9.45,9.98);c.save();c.globalAlpha=1-idle;body(heroParts.body);c.save();c.translate(224,116);c.rotate(armAngle());c.translate(-224,-116);body(heroParts.arm);c.restore();c.restore();if(idle>0){c.save();c.globalAlpha=idle;const im=IMG.b_yegx;c.drawImage(im,f.footX-im.width/2,f.footY-im.height,im.width,im.height);c.restore();}}else body(f.im);c.restore();
 c.save();c.globalAlpha=1;c.fillStyle='#081015';c.fillRect(u.x-39+rr.dx,u.y-u.h-16-rr.lift,78,6);c.fillStyle=u.side==='hero'?'#4cda7f':'#ec6a37';c.fillRect(u.x-38+rr.dx,u.y-u.h-15-rr.lift,76*u.hp/u.maxhp,4);c.restore();}
function airRefractionCoolBase(cam){const strength=E(t,.85,1.5)*(1-E(t,2.4,3.2));if(strength<=0)return;const cv=airRefraction.cache||(airRefraction.cache=mk(W,H)),g=cv.getContext('2d');g.clearRect(0,0,W,H);g.drawImage(main.canvas,0,0,W,H);const m=main.getTransform(),cx=W*.5+(L(430,sky.x,sunMorph())-W*.5)*cam.zoom,cy=H*.53+(sky.y-H*.53)*cam.zoom,rr=185*cam.zoom;main.save();main.setTransform(m.a/cam.zoom,0,0,m.d/cam.zoom,0,0);main.beginPath();main.arc(cx,cy,rr,0,TAU);main.clip();for(let y=Math.max(0,Math.floor(cy-rr));y<Math.min(H,cy+rr);y+=4){const shift=Math.sin(y*.075-t*2.7)*.8*strength;main.drawImage(cv,0,y,W,4,shift,y,W,4);}main.restore();}
function solarHeatState(){return{active:false,intensity:0};}
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
function preloadDirectionImages(){return Promise.all(['core','rays'].flatMap(k=>Array.from({length:4},(_,i)=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>{A[k+i]=im;ok()};im.onerror=no;im.src='solar15_assets/'+k+i+'.png';}))));}
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
 let ground=0;for(const u of battle.enemies){const rx=80+u.h*.24,ry=20+u.h*.025,dx=(x-u.x)/rx,dy=(y-u.y-4)/ry;ground+=Math.pow(C(1-dx*dx-dy*dy),1.7)*(u.key==='e_leopard'?.24:u.key==='e_wolf2'?.30:.34);}
 return Math.min(.38,near+under+ground);
}
function radiantBackdrop(h){
 const im=IMG[battle.cfg.bg];if(!im)return null;const signature=[battle.cfg.bg,h.x.toFixed(2),h.y.toFixed(2),h.r.toFixed(2),...battle.enemies.flatMap(u=>[u.x,u.y,u.h])].join(':');
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
function night(){return Math.min(.95,(.72*E(raw,0,.38)+.11*E(raw,2.85,3.17)*(1-E(raw,3.45,3.60))+.10*E(raw,3.15,3.28)*(1-E(raw,3.45,104/30)))*(1-E(raw,4.95,5.95)));}
function radiantEnvironment(h){
 // Keep the approved local exposure and three textured ground pools; weight them by the actual sun envelope.
 const exposed=radiantBackdrop(h);if(exposed){c.save();c.globalCompositeOperation='screen';c.globalAlpha=h.intensity;c.drawImage(exposed,0,0,W,H);c.restore();}
 glow(c,h.x,h.y,Math.max(150,h.r*1.62),Math.max(140,h.r*1.50),h.intensity*.07,'255,246,216');
 glow(c,h.x,h.y,Math.max(230,h.r*2.10),Math.max(210,h.r*1.95),h.intensity*.025,'255,225,156');
 for(const u of battle.enemies){glow(c,u.x,u.y+3,75+u.h*.20,13+u.h*.015,h.intensity*.035,'255,247,218');}
}
function dxCaster(){return window.SX_P||battle.heroes.find(u=>u.key===(window.DX_CASTER||'b_yunting'));}
function setCaster(key){
 if(!['b_yunting','b_linxue'].includes(key))throw new Error('Unsupported Dianxing caster');
 window.DX_CASTER=key;battle.active=dxCaster();
 const casterIndex=battle.heroes.indexOf(dxCaster());
 for(let i=0;i<battle.heroes.length;i++){const slot=i===0?casterIndex:i===casterIndex?0:i,d=layout.heroes[slot],u=battle.heroes[i];u.x=d.x*W;u.y=(layout.FOOT_Y-d.depth)*H;}
 units.clear();tintCache.clear();
 for(const u of battle.units)units.set(u,cacheUnit(u));
 layoutAudit=battle.units.map(u=>({name:u.name,side:u.side,x:u.x,y:u.y,visibleHeight:units.get(u).visibleHeight,ratioToScreen:units.get(u).visibleHeight/H,sourceBounds:units.get(u).bounds}));
}
function preloadDianxing(){
 return Promise.all([0,1].map(i=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>{A['dx_atlas'+i]=im;ok();};im.onerror=no;im.src='sx_assets/dx_atlas'+i+'.webp';}))).then(()=>{
  for(const[k,cols,rows]of [[0,2,2],[1,3,2]]){const im=A['dx_atlas'+k],w=im.width/cols,h=im.height/rows;
   for(let i=0;i<cols*rows;i++){const cv=mk(w,h),g=cv.getContext('2d');g.drawImage(im,(i%cols)*w,Math.floor(i/cols)*h,w,h,0,0,w,h);
    g.globalCompositeOperation='destination-in';for(const vertical of [false,true]){const size=vertical?h:w,gr=g.createLinearGradient(0,0,vertical?0:w,vertical?h:0);gr.addColorStop(0,'transparent');gr.addColorStop(14/size,'white');gr.addColorStop(1-14/size,'white');gr.addColorStop(1,'transparent');g.fillStyle=gr;g.fillRect(0,0,w,h);}A[(k?'dx_burst':'dx_meteor')+i]=cv;
   }
  }
 });
}
function dxTarget(){return window.SX_T||battle.enemies.find(u=>u.key==='e_rhino')||battle.enemies[0];}
function dxAim(){const u=dxTarget();return{x:u.x,y:u.y};}
function dxCharge(){return E(t,.05,.38)*(1-E(t,3.27,3.65));}
function dxBurst(){return E(raw,104/30,104/30+.02)*(1-E(raw,3.90,4.65));}
function dxEffects(){sxConsecration();sxDrawSword();sxImpact();}
function inspectDianxing(){return{caster:dxCaster().key,casterName:dxCaster().name,casterSprite:dxCaster().key+'_atk',time:t,phase:phaseName(),duration:3,fps:30,scope:'three design keyframes, not final animation',target:dxTarget().key,impactAt:1.06,damageDisplaySample:32680,damageEvents:hitIndex,camera:camera(),heroArmAngle:armAngle(),nightOpacity:night(),finger:finger(),aim:dxAim(),layout:layoutAudit,units:battle.units.map(u=>({name:u.name,key:u.key,side:u.side,x:u.x,y:u.y,h:u.h,hp:u.hp,maxhp:u.maxhp,reaction:reaction(u)}))};}
function sxStarPose(){const p=forgePose();return{x:p.x,y:p.y,size:90,a:E(t,.16,.4)*(1-E(t,1.15,1.55)),squeeze:E(t,2.85,3.15)};}
function sxCore(x,y,size,a,clock=t,rot=0){if(a<=0)return;tex('sx_star0',x,y,size,size,a,rot+Math.sin(clock*2.1)*.05);}
function sxGround(){}
function inspectShaxing(){const model=battlePoseInspect();return{caster:dxCaster().key,casterName:dxCaster().name,casterSprite:model.casterSprite,battleModel:model,time:raw,effectTime:t,phase:phaseName(),duration:6,fps:30,scope:'v11: completed array forging preserved; three-frame rush, immediate hit pose, directional burst and recoil',singleTarget:true,damageTargets:[dxTarget().key],target:dxTarget().key,impactAt:104/30,splashAt:null,damageMain:68880,damageSplash:0,damageEvents:hitIndex,damageNumberCount:raw>=104/30&&raw<104/30+1.1?1:0,camera:camera(),heroArmAngle:armAngle(),nightOpacity:night(),finger:finger(),star:sxStarPose(),giantSword:sxSwordPose(),forgeArray:forgePose(),noPlantedSword:true,whiteFlash:raw>=104/30&&raw<106/30-1e-8,hitstop:raw>=104/30&&raw<108/30-1e-8,layout:layoutAudit,units:battle.units.map(u=>({name:u.name,key:u.key,side:u.side,x:u.x,y:u.y,h:u.h,hp:u.hp,maxhp:u.maxhp,reaction:reaction(u)}))};}
function sxSwordPose(){const p=skyMotion(t),f=battleModelPoint('cast','castFinger');return{...p,x:p.center.x,y:p.center.y,root:p.hilt,angle:p.theta+Math.PI/2,radius:320,length:640,width:288,height:682,phase:0,alpha:E(t,1.43,1.65)*(1-E(t,3.53,3.90)),reveal:E(t,1.45,2.85),dissolve:E(t,3.53,3.90),gem:{x:p.center.x-Math.cos(p.theta)*150,y:p.center.y-Math.sin(p.theta)*150},release:p.rushProgress,material:'one continuous luminous sword field forged by the array, three-frame launch and directional impact erosion',continuousMaterial:true,materialPhaseBlend:false,angularSweep:false,linearRush:true,pivotLocked:false,arcTrail:false,clearSwordSilhouette:true,connectedToCaster:false,summonedInSky:true,forgedByArray:true,casterAnchorDistance:Math.hypot(p.center.x-f.x,p.center.y-f.y),hiltToCaster:Math.hypot(p.hilt.x-f.x,p.hilt.y-f.y)};}
function sxSwordMaterial(p){const cv=A.sx_sword_frame,g=cv.getContext('2d'),w=cv.width,h=cv.height;g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);g.drawImage(A.sx_greatsword,0,0);
 // Moving texture highlights are clipped to the original painted sword alpha.
 g.globalCompositeOperation='source-atop';g.globalAlpha=.24;for(let j=0;j<4;j++){const phase=((t*.72+j*.27)%1+1)%1,y=h*(.26+.72*phase);g.drawImage(A['sx_star'+j],w*.36,y-110,w*.28,220);}g.globalAlpha=1;
 const top=.252-.25*p.reveal,bottom=Math.min(.252+.745*p.reveal,1-p.dissolve*.99),soft=.035,mask=g.createLinearGradient(0,0,0,h);const a=C(top-soft),b=C(top+soft),d=C(bottom-soft),e=C(bottom+soft);
 mask.addColorStop(0,'transparent');mask.addColorStop(a,'transparent');mask.addColorStop(Math.min(b,d),'white');mask.addColorStop(Math.max(b,d),'white');mask.addColorStop(e,'transparent');mask.addColorStop(1,'transparent');g.globalCompositeOperation='destination-in';g.fillStyle=mask;g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';return cv;}
function sxDrawSword(){
 const p=sxSwordPose();if(p.alpha>0){flowTrail();skySprite(0,p,p.alpha,true);flowHelix(p,p.alpha);}
 if(t>=3.53)for(const n of A.sx_flowSeeds){const born=3.53+(n.y+.5)*.16,age=t-born;if(age<0||age>.62)continue;const origin=flowWorld(skyMotion(born),n.x,n.y),an=p.theta+Math.sin(n.phase)*.75,v=120+R(n.id+17)*240,x=origin.x+Math.cos(an)*v*age,y=origin.y+Math.sin(an)*v*age+42*age*age;sxCore(x,y,n.size*(1-.60*C(age/.62)),Math.sin(age/.62*Math.PI)*.8,t);}
}
function sxImpact(){
 const age=t-104/30;if(age<0||age>1.03)return;const u=dxTarget(),p=skyMotion(104/30),rr=reaction(u),hit={x:u.x+rr.dx*.22,y:u.y-u.h*.62-rr.lift*.22};
 const contact=1-E(age,.025,.12);if(contact>0){tex('sx_impact0',hit.x,hit.y,245,245,contact,p.theta-Math.PI/2,'screen',.5,.68);sxCore(hit.x,hit.y,138,contact*.85,t,Math.PI/4);}
 const plume=(1-E(age,.12,.38)),drive=E(age,0,.20);if(plume>0){tex('sx_imperial3',hit.x,hit.y,280+180*drive,82+28*drive,plume*.92,p.theta,'screen',.06,.5);tex('sx_imperial3',hit.x,hit.y,145+100*drive,67,plume*.60,p.theta-Math.PI,'screen',.06,.5);}
 for(let j=0;j<130;j++){const an=p.theta+(R(j)-.5)*2.5,v=190+R(j+4)*420,life=.22+R(j+7)*.60,q=C(age/life);if(q>=1)continue;const x=hit.x+Math.cos(an)*v*age,y=hit.y+Math.sin(an)*v*age+180*age*age,a=(.35+.65*Math.sin(q*Math.PI))*(1-q)*.90;sxCore(x,y,3+R(j+2)*10,a,t);if(age<.34)tex('sx_flow_brush',x,y,15+v*.055,3+R(j+8)*2,a*.68,an);}
}
function sxPaintSequence(prefix,q,x,y,w,h,a,rot,ax,ay){q=C(q/5)*5;const i=Math.floor(q),k=E(q-i,0,1);for(const [idx,alpha]of[[i,1-k],[Math.min(5,i+1),k]])if(alpha*a>0)tex(prefix+idx,x,y,w,h,alpha*a,rot,'screen',ax,ay);}
function sxWeaponLight(){}
function battleModelSpecs(){return {"b_yunting":{"canvas":[1792,1536],"groundAnchor":[896,1496],"sourceHeight":1440,"displayHeight":247,"poses":{"idle":{"file":"b_yunting_idle.png","bounds":[536,56,1477,1496],"points":{"swordTip":[1272.7,133.8],"swordRoot":[1059.7,603.2],"castFinger":[734.6,770.2]},"source":"/Users/yaohan/Documents/孤星问道/立绘素材/星旋与云霆战斗/输出/云霆战斗/battle_yunting_idle.png","sha256":"0199233e550117db0b035b0eb1679d9322a5d6237b4cd25d4fde539c2aa6b7f7"},"cast":{"file":"b_yunting_cast.png","bounds":[543,56,1512,1496],"points":{"swordTip":[1480.4,1003.5],"swordRoot":[1138.2,773.1],"castFinger":[721.3,205.8]},"source":"/Users/yaohan/Documents/孤星问道/立绘素材/星旋与云霆战斗/输出/云霆战斗/battle_yunting_cast.png","sha256":"30c3b73379f1fed733a29ac71911f1038b03cee5ef9a444cc5f8cb86147e3564"},"atk":{"file":"b_yunting_atk.png","bounds":[13,56,1715,1496],"points":{"swordTip":[21.6,1176.3],"swordRoot":[404.7,856.6],"castFinger":[1021.0,473.6]},"source":"/Users/yaohan/Documents/孤星问道/立绘素材/星旋与云霆战斗/输出/云霆战斗/battle_yunting_attack.png","sha256":"b7d339a5223e586185ee6fb87fc359975d72c28e3683c58241a3fd4a4cfa3d7b"}}},"b_linxue":{"canvas":[2048,1536],"groundAnchor":[1024,1535],"sourceHeight":1440,"displayHeight":223,"poses":{"idle":{"file":"b_linxue_idle.webp","bounds":[720,95,1647,1535],"points":{"swordTip":[1643.0,1145.0],"swordRoot":[1292.6,789.0],"castFinger":[940.2,289.0]},"source":"/Users/yaohan/Documents/孤星问道/立绘素材/林雪战斗/输出/三姿势接入版/b_linxue.webp","sha256":"0dade0ce7d2daeac57394c0f513e040644b778e69ed8f956fa915413841cac01"},"cast":{"file":"b_linxue_cast.webp","bounds":[677,95,1919,1535],"points":{"swordTip":[1901.0,899.0],"swordRoot":[1485.0,719.0],"castFinger":[729.0,339.0]},"source":"/Users/yaohan/Documents/孤星问道/立绘素材/林雪战斗/输出/三姿势接入版/b_linxue_cast.webp","sha256":"aadb100e2d823cb016545315a598e0fe89b6628350b50ccc20c714a819b28a95"},"atk":{"file":"b_linxue_atk.webp","bounds":[133,95,1821,1535],"points":{"swordTip":[143.0,669.0],"swordRoot":[601.6,583.0],"castFinger":[1130.2,337.0]},"source":"/Users/yaohan/Documents/孤星问道/立绘素材/林雪战斗/输出/三姿势接入版/b_linxue_atk.webp","sha256":"21714cdfcac1039cb74dce946f322593a23d1416ae04d697a19d3600722bae83"}}}};}
function preloadBattlePoses(){
 const specs=battleModelSpecs();A.battlePoseSpecs=specs;
 return Promise.all(Object.entries(specs).flatMap(([key,actor])=>Object.entries(actor.poses).map(([pose,def])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{A['bm_'+key+'_'+pose]=im;resolve();};im.onerror=reject;im.src='shaxing_models/'+def.file;}))));
}
function battlePoseMix(){const enter=E(raw,.12,.28),settle=E(raw,4.85,5.2);return{idle:1-enter+settle,cast:enter*(1-settle),atk:0};}
function battleModelPoint(pose,kind='swordTip'){
 const u=dxCaster(),f=units.get(u);if(!f||!f.poses)return{x:u.x,y:u.y-(u.h||240)*.62,pose,kind};{}const _f=f,name=pose==='attack'?'atk':pose,def=f.poses?.[name];
 if(!def)throw new Error('Missing battle model point: '+u.key+' '+name);
 const p=def.points[kind]||def.points.swordTip;
 return{x:u.x+(p[0]-f.footX)*f.scale,y:u.y+(p[1]-f.footY)*f.scale,pose:name,kind,sourcePoint:p.slice(),sourceCanvas:[f.w,f.h],groundAnchor:[f.footX,f.footY]};
}
function battleModelLitLayers(f,def){
 if(def.litLayers)return def.litLayers;
 const im=def.im,w=im.width,h=im.height,fill=mk(w,h),rim=mk(w,h),g=fill.getContext('2d'),r=rim.getContext('2d'),top=def.bounds[1],bottom=def.bounds[3];
 g.drawImage(im,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#ffb5aa';g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-in';const gr=g.createLinearGradient(0,top,0,bottom);gr.addColorStop(0,'white');gr.addColorStop(.55,'rgba(255,255,255,.58)');gr.addColorStop(1,'rgba(255,255,255,.08)');g.fillStyle=gr;g.fillRect(0,0,w,h);
 const edge=1.35/f.scale;r.drawImage(im,-edge,-edge*1.5);r.globalCompositeOperation='destination-out';r.drawImage(im,0,0);r.globalCompositeOperation='source-in';r.fillStyle='#fff0df';r.fillRect(0,0,w,h);def.litLayers={fill,rim};return def.litLayers;
}
function battlePoseImage(f,mix){
 const list=Object.entries(mix).filter(([,w])=>w>1e-7);if(list.length===1)return f.poses[list[0][0]].im;
 if(!f.poseMixCanvas)f.poseMixCanvas=mk(f.w,f.h);const cv=f.poseMixCanvas,g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,cv.width,cv.height);
 // Add premultiplied RGBA pose weights so the overlap stays opaque during the short transitions.
 g.globalCompositeOperation='lighter';for(const [pose,w]of list){g.globalAlpha=w;g.drawImage(f.poses[pose].im,0,0);}g.globalAlpha=1;g.globalCompositeOperation='source-over';return cv;
}
function battlePoseInspect(){
 const u=dxCaster(),f=units.get(u),mix=battlePoseMix(),dominant=Object.entries(mix).sort((a,b)=>b[1]-a[1])[0][0];
 return{caster:u.key,weights:mix,dominant,renderer:'fixed original full-canvas ground anchor; no body translation or rotation',casterSprite:u.key+(dominant==='idle'?'':'_'+dominant),groundWorld:{x:u.x,y:u.y},groundAnchor:[f.footX,f.footY],canvas:[f.w,f.h],sourceVisibleHeight:f.sourceHeight,displayVisibleHeight:f.visibleHeight,scale:f.scale,currentLightAnchor:finger(),anchors:Object.fromEntries(['idle','cast','atk'].map(pose=>[pose,Object.fromEntries(['castFinger','swordTip','swordRoot'].map(kind=>[kind,battleModelPoint(pose,kind)]))])),sourceFiles:Object.fromEntries(Object.entries(f.poses).map(([pose,def])=>[pose,{file:def.file,original:def.source,sha256:def.sha256}]))};
}
function preloadSweepTextures(){
 for(const kind of ['sweep','seal']){const im=A['sx_'+kind+'_atlas'],cols=kind==='sweep'?3:2,rows=2,w=Math.floor(im.width/cols),h=Math.floor(im.height/rows);
  for(let j=0;j<cols*rows;j++){const cv=mk(w,h),g=cv.getContext('2d');g.drawImage(im,j%cols*w,Math.floor(j/cols)*h,w,h,0,0,w,h);const p=g.getImageData(0,0,w,h),d=p.data;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4,l=(d[k]*.2126+d[k+1]*.7152+d[k+2]*.0722)/255,edge=C(Math.min(x,y,w-1-x,h-1-y)/14);d[k+3]*=edge*(kind==='seal'?Math.pow(C((l-.31)/.69),1.45):Math.pow(C((l-.08)/.92),1.1));}
   g.putImageData(p,0,0);A['sx_'+kind+j]=cv;
  }
 }
}
function sxPivot(){const a=battleModelPoint('cast','swordRoot'),b=battleModelPoint('atk','swordRoot'),k=E(t,2.18,2.30);return{x:L(a.x,b.x,k),y:L(a.y,b.y,k)};}
function sxSweepTheta(z){
 const p=battleModelPoint('atk','swordRoot'),u=dxTarget(),hit={x:u.x,y:u.y-u.h*.62},aim=(Math.atan2(hit.y-p.y,hit.x-p.x)+TAU)%TAU,start=3.98,end=dxCaster().key==='b_yunting'?2.48:2.92;
 if(z<2.30)return L(3.47,start,E(z,1.35,2.30));
 if(z<=2.60){const q=C((z-2.30)/.30);return L(start,aim,q*q);}
 return L(aim,end,1-Math.pow(1-C((z-2.60)/.27),2));
}
function sxSeal(q,x,y,w,h,a,rot=0){q=C(q/3)*3;const j=Math.floor(q),f=E(q-j,0,1);tex('sx_seal'+j,x,y,w,h,a*(1-f)*.16,rot);tex('sx_seal'+Math.min(3,j+1),x,y,w,h,a*f*.16,rot);const scale=L(.7,1,E(q,0,.8))*(1-.35*E(q,2.3,3));tex('sx_clean_seal',x,y,w*scale,h*scale,a*(1-E(q,2.5,3))*.88,rot);}
function sxConsecration(){const f=battleModelPoint('cast','castFinger'),a=E(t,.03,.28)*(1-E(t,3.25,3.45));sxCore(f.x,f.y,23,a*.8,t);forgeAmbient();forgeArray();forgeFeeds();}
function preloadSummonedSword(){
 const im=A.sx_sky_atlas,w=Math.floor(im.width/4),h=im.height,centers=[.5859,.5417,.4531,.4063];
 for(let j=0;j<4;j++){const cv=mk(w,h),g=cv.getContext('2d');g.drawImage(im,j*w,0,w,h,(.5-centers[j])*w,0,w,h);const p=g.getImageData(0,0,w,h),d=p.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4,l=(d[k]*.2126+d[k+1]*.7152+d[k+2]*.0722)/255,edge=C(Math.min(x,w-1-x,y,h-1-y)/16);d[k+3]*=edge*(.24+.76*Math.pow(C((l-.08)/.92),1.35));}
  g.putImageData(p,0,0);A['sx_sky'+j]=cv;
 }
 flowInit();
}
function skyBezier(a,b,d,e,q){const s=1-q;return{x:s*s*s*a.x+3*s*s*q*b.x+3*s*q*q*d.x+q*q*q*e.x,y:s*s*s*a.y+3*s*s*q*b.y+3*s*q*q*d.y+q*q*q*e.y};}
function skyMotion(z){
 const base={x:760,y:248},u=dxTarget(),hit={x:u.x,y:u.y-u.h*.62},theta=Math.atan2(hit.y-base.y,hit.x-base.x),d={x:Math.cos(theta),y:Math.sin(theta)},launchAt=101/30,impactAt=104/30,half=320,penetration=22;
 const recoil=50*E(z,2.85,3.15)+60*E(z,3.15,3.27),start={x:base.x-d.x*110,y:base.y-d.y*110},end={x:hit.x-d.x*(half-penetration),y:hit.y-d.y*(half-penetration)};
 let q=0,center={x:base.x-d.x*recoil,y:base.y-d.y*recoil};if(z>=launchAt){q=Math.pow(C((z-launchAt)/(impactAt-launchAt)),1.4);center={x:L(start.x,end.x,q),y:L(start.y,end.y,q)};}
 const followThrough=80*E(z,impactAt+.01,impactAt+.17);center.x+=d.x*followThrough;center.y+=d.y*followThrough;
 const tip={x:center.x+d.x*half,y:center.y+d.y*half},hilt={x:center.x-d.x*half,y:center.y-d.y*half};return{center,theta,tip,hilt,target:hit,direction:d,launchAt,impactAt,launchStart:start,launchEnd:end,rushProgress:q,rushDistance:Math.hypot(end.x-start.x,end.y-start.y),penetration,followThrough};
}
function skySprite(q,p,a,solidPass=true){if(a<=0)return;flowSwordTexture(t);tex('sx_flow',p.center.x,p.center.y,288,682,a,p.theta+Math.PI/2);tex('sx_flow',p.center.x,p.center.y,288,682,a*.16,p.theta+Math.PI/2,'screen',.5,.5,'blur(3px)');}
function flowInit(){
 const w=128,h=342,base=mk(w,h),g=base.getContext('2d');g.drawImage(A.sx_sky2,0,0,w,h);
 const src=g.getImageData(0,0,w,h),out=mk(w,h),og=out.getContext('2d'),pixels=og.createImageData(w,h);
 A.sx_flowState={w,h,src:src.data,out,og,pixels,last:null};A.sx_flow=out;
 const brush=mk(128,32),b=brush.getContext('2d');b.drawImage(A.sx_star0,A.sx_star0.width*.25,A.sx_star0.height*.25,A.sx_star0.width*.5,A.sx_star0.height*.5,0,0,128,32);A.sx_flow_brush=brush;
 const n=200,ib=mk(n,n),ig=ib.getContext('2d');ig.drawImage(A.sx_impact2,0,-n*.18,n,n);const io=mk(n,n),i=io.getContext('2d');A.sx_hitState={n,src:ig.getImageData(0,0,n,n).data,out:io,g:i,pixels:i.createImageData(n,n),last:null};A.sx_flow_hit=io;
 const seeds=[];for(let j=0;j<210;j++){const y=(30+R(j*5+9)*610)*h/684,xb=(128+(R(j*7+3)-.5)*65)*w/256,k=(Math.floor(y)*w+Math.floor(xb))*4;if(src.data[k+3]<24)continue;seeds.push({x:xb/w-.5,y:y/h-.5,born:.16+(1-y/h)*.95+R(j+4)*.18,phase:R(j+11)*TAU,spin:j%2?1:-1,size:3+R(j+8)*5,id:j});}A.sx_flowSeeds=seeds;
}
function flowSwordTexture(clock,probe=false){
 const s=A.sx_flowState,w=s.w,h=s.h,key=clock.toFixed(8)+(probe?'p':'n');if(s.last===key)return s.out;s.last=key;const src=s.src,d=s.pixels.data;
 for(let y=0;y<h;y++){const v=y/(h-1),shift=(Math.sin(v*35-clock*8.2)*1.8+Math.sin(v*87+clock*12.1)*.7)*.5;
  for(let x=0;x<w;x++){const k=(y*w+x)*4,a=src[k+3];if(a<2){d[k+3]=0;continue;}const u=(x-w*.5)/w,xx=Math.max(0,Math.min(w-1,Math.round(x+shift))),ks=(y*w+xx)*4;
   const cell=Math.sin(x*.36+y*.078)*.065+Math.sin(x*.142-y*.05)*.045,travel=v>.72?(v-.72)*1.8:(.72-v)*1.48,arrival=1.45+travel+cell*.45,form=probe?1:E(clock,arrival,arrival+.32),spine=probe?1:E(clock,1.44+travel*.94,1.72+travel*.94)*Math.exp(-u*u*1500),formed=Math.max(form,spine*.38),dissolve=probe?0:E(clock,3.53+v*.16+cell*.25,3.64+v*.16+cell*.25);
   const wave=.85+.18*Math.sin(v*49-clock*11+u*11)+.11*Math.sin(v*97+clock*17-u*21),pulse=Math.exp(-Math.pow(Math.sin(v*13-clock*3.4+u*8)*3.1,2)),gain=wave+.22*pulse+.04*E(clock,2.8,3.2)-.13*Math.exp(-Math.pow((v-.72)/.14,2));
   d[k]=Math.min(255,(src[k]*.80+src[ks]*.20)*gain+18*pulse);
   d[k+1]=Math.min(255,(src[k+1]*.80+src[ks+1]*.20)*gain+17*pulse);
   d[k+2]=Math.min(255,(src[k+2]*.80+src[ks+2]*.20)*gain+16*pulse);
   d[k+3]=a*formed*(1-dissolve)*(.86+.14*Math.sin(v*41-clock*8+u*9)**2);
  }
 }
 s.og.putImageData(s.pixels,0,0);return s.out;
}
function flowImpactTexture(age){
 const s=A.sx_hitState,n=s.n,key=age.toFixed(8);if(s.last===key)return s.out;s.last=key;const src=s.src,d=s.pixels.data,expand=.18+.94*(1-Math.exp(-age*10)),fade=1-E(age,.48,1.25);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=(y*n+x)*4,dx=(x-n*.5)/(n*.5),dy=(y-n*.5)/(n*.5),rad=Math.hypot(dx,dy),an=Math.atan2(dy,dx),twist=.09*Math.sin(rad*8-age*12)*E(age,0,.15),warp=expand*(1+.075*Math.sin(an*7+age*9)+.04*Math.sin(an*13-age*14));
  const rr=rad/Math.max(.01,warp),sx=Math.round(n*.5+Math.cos(an+twist)*rr*n*.5),sy=Math.round(n*.5+Math.sin(an+twist)*rr*n*.5);
  if(sx<0||sx>=n||sy<0||sy>=n){d[k+3]=0;continue;}const q=(sy*n+sx)*4,grain=.70+.30*Math.sin(an*11+rad*23-age*16)**2,gain=1+.24*Math.exp(-Math.pow(rad-expand*.68,2)/.02);
  d[k]=Math.min(255,src[q]*gain);d[k+1]=Math.min(255,src[q+1]*gain+10);d[k+2]=Math.min(255,src[q+2]*gain+10);d[k+3]=src[q+3]*fade*grain;
 }
 s.g.putImageData(s.pixels,0,0);return s.out;
}
function flowWorld(p,u,v){const x=u*288,y=v*682,an=p.theta+Math.PI/2;return{x:p.center.x+Math.cos(an)*x-Math.sin(an)*y,y:p.center.y+Math.sin(an)*x+Math.cos(an)*y};}
function flowTrail(){
 if(t<=101/30||t>=3.72)return;const p=skyMotion(t),age=t-101/30,a=E(age,0,.025)*(1-E(t,104/30+.06,3.72)),back=skyMotion(Math.max(101/30,t-.10)),len=Math.max(25,Math.hypot(p.hilt.x-back.hilt.x,p.hilt.y-back.hilt.y));
 tex('sx_imperial3',p.hilt.x,p.hilt.y,len*1.12+80,76,a*.8,p.theta-Math.PI,'screen',.06,.5);tex('sx_flow_brush',p.center.x-p.direction.x*130,p.center.y-p.direction.y*130,len+180,39,a*.38,p.theta);
}
function materialProbe(clock){return flowSwordTexture(clock,true);}
function renderFxOnly(z){update(z);main.save();main.setTransform(1,0,0,1,0,0);main.clearRect(0,0,W,H);main.restore();beginFx();dxEffects();finishFx();}
function flowHelix(p,alpha){
 for(let lane=0;lane<2;lane++){let prev=null;for(let j=0;j<=44;j++){const q=j/44,phase=q*TAU*1.5-t*4.2+lane*Math.PI,rad=(24+15*Math.sin(q*Math.PI))*(1-.22*E(t,2.85,3.15)),localX=Math.cos(phase)*rad/288,localY=-.44+q*.84,pt=flowWorld(p,localX,localY),depth=.28+.72*(Math.sin(phase)*.5+.5),formation=E(t,1.45+Math.abs(q-.786)*1.4,1.75+Math.abs(q-.786)*1.4);if(prev){const dx=pt.x-prev.x,dy=pt.y-prev.y,d=Math.hypot(dx,dy);tex('sx_flow_brush',(pt.x+prev.x)*.5,(pt.y+prev.y)*.5,d*1.7,7+depth*10,alpha*formation*depth*.48*(1-.26*Math.exp(-Math.pow((q-.786)/.12,2))),Math.atan2(dy,dx));}prev=pt;}}
}
function preloadForgeMaterials(){
 if(A.forge_outer&&A.forge_core&&A.forge_vortex)return Promise.resolve();
 const clamp=v=>Math.max(0,Math.min(1,v)),ease=(v,a,b)=>{const q=clamp((v-a)/(b-a));return q*q*(3-2*q);};
 const load=file=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('Forge material failed to load: '+file));im.src='sx_assets/'+file;});
 // Preserve painted detail and native alpha. Luminance controls energy, not a solid fill.
 function prepare(im,sx,sy,sw,sh,kind){
  const cell=mk(sw,sh),g=cell.getContext('2d');g.drawImage(im,sx,sy,sw,sh,0,0,sw,sh);
  const pixels=g.getImageData(0,0,sw,sh),d=pixels.data;let x0=sw,y0=sh,x1=-1,y1=-1;
  const floor=kind==='outer'?.26:.40,power=kind==='outer'?1.65:1.8;
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
   const k=(y*sw+x)*4,originalAlpha=d[k+3],lum=(d[k]*.2126+d[k+1]*.7152+d[k+2]*.0722)/255;
   const energy=Math.pow(clamp((lum-floor)/(1-floor)),power),edge=ease(Math.min(x,y,sw-1-x,sh-1-y),0,10);
   d[k]=255;d[k+1]=Math.round(239+16*energy);d[k+2]=Math.round(214+41*energy);
   d[k+3]=Math.round(originalAlpha*energy*edge);
   if(d[k+3]>45){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  }
  g.putImageData(pixels,0,0);
  const out=mk(768,768),o=out.getContext('2d');o.imageSmoothingEnabled=true;o.imageSmoothingQuality='high';
  if(kind==='outer')o.drawImage(cell,0,0,sw,sh,0,0,768,768);
  else if(x1>=x0&&y1>=y0){const cx=(x0+x1)/2,cy=(y0+y1)/2,r=Math.max(x1-x0,y1-y0)/2+12;o.drawImage(cell,cx-r,cy-r,r*2,r*2,0,0,768,768);}
  // A clear opening survives additive composition; do not cover the sky with an opaque disc.
  const cleaned=o.getImageData(0,0,768,768),v=cleaned.data;
  const opening=kind==='outer'?[.28,.38]:kind==='core'?[.12,.21]:[.32,.43];
  for(let y=0;y<768;y++)for(let x=0;x<768;x++){
   const k=(y*768+x)*4,r=Math.hypot(x-383.5,y-383.5)/384;
   v[k+3]=Math.round(v[k+3]*ease(r,opening[0],opening[1])*ease(Math.min(x,y,767-x,767-y),0,8));
  }
  o.putImageData(cleaned,0,0);return out;
 }
 return Promise.all([load('seal_master.webp'),load('array4.webp')]).then(([seal,atlas])=>{
  const cw=Math.floor(atlas.width/2),ch=Math.floor(atlas.height/2);
  A.forge_outer=prepare(seal,0,0,seal.width,seal.height,'outer');
  A.forge_core=prepare(atlas,0,ch,cw,ch,'core');
  A.forge_vortex=prepare(atlas,cw,ch,cw,ch,'vortex');
 });
}
function forgePose(){const open=E(t,.16,1.24),charge=E(t,2.80,3.17),release=E(t,101/30,104/30),squeeze=.14*E(t,3.15,3.27);return{center:{x:900,y:188},x:900,y:188,rx:248*(.22+.78*open)*(1-.09*charge+.19*release-squeeze),ry:145*(.22+.78*open)*(1-.09*charge+.19*release-squeeze),open,ready:t>=1.24,alpha:E(t,.12,.62)*(1-E(t,3.27,4.05)),charge,release,squeeze,swordBirthAt:1.45,angles:[t*TAU/16,-t*TAU/12,t*TAU/9],layerCount:3};}
function forgeLayer(key,p,r,alpha,angle,reveal=1){
 if(alpha<=0)return;c.save();c.translate(p.x,p.y);c.scale(p.rx*r,p.ry*r);c.rotate(angle);c.globalCompositeOperation='screen';
 const im=A[key];if(reveal>=.999){c.globalAlpha=C(alpha);c.drawImage(im,-1,-1,2,2);}else for(let j=0;j<48;j++){const a=E(reveal,j/60,j/60+.2);if(a<=0)continue;const an=j*TAU/48;c.save();c.beginPath();c.moveTo(0,0);c.arc(0,0,1.5,an,an+TAU/48+.004);c.closePath();c.clip();c.globalAlpha=C(alpha*a);c.drawImage(im,-1,-1,2,2);c.restore();}c.restore();
}
function forgeStroke(points,width,alpha){for(let j=1;j<points.length;j++){const a=points[j-1],b=points[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),q=j/points.length;tex('sx_flow_brush',(a.x+b.x)*.5,(a.y+b.y)*.5,d*1.65,width*(.45+.55*Math.sin(q*Math.PI)),alpha,Math.atan2(dy,dx));}}
function forgeAmbient(){
 const p=forgePose(),fade=E(t,.03,.22)*(1-E(t,2.2,2.85));if(fade<=0)return;
 for(let j=0;j<144;j++){const birth=.02+R(j+12)*1.5,life=.62+R(j+4)*.8,q=C((t-birth)/life);if(q<=0||q>=1)continue;const an=j*2.399+q*.75,r=(1-q)*(240+R(j+7)*330)+30,x=p.x+Math.cos(an)*r,y=p.y+Math.sin(an)*r*.55,tail={x:p.x+Math.cos(an-.06)*(r+16),y:p.y+Math.sin(an-.06)*(r+16)*.55},a=Math.sin(q*Math.PI)*fade;sxCore(x,y,4+R(j+9)*13,a*.85,t);tex('sx_flow_brush',(x+tail.x)*.5,(y+tail.y)*.5,24,4,a*.32,Math.atan2(y-tail.y,x-tail.x));}
}
function forgeArray(){
 const p=forgePose();if(p.alpha<=0)return;const pulse=.91+.09*Math.sin(t*3.7),r=1-.14*E(t,1.4,2.85),a=p.alpha;
 forgeLayer('forge_vortex',p,1.27,a*(.25+.13*p.charge),-t*.18,E(t,.12,.95));
 forgeLayer('forge_outer',p,1,a*(.76+.18*p.charge)*pulse,p.angles[0],E(t,.17,1.18));
 forgeLayer('forge_core',p,.63*r,a*(.65+.22*p.charge),p.angles[1],E(t,.45,1.24));
 forgeLayer('forge_outer',p,.34*r,a*.45*(1-E(t,2.4,3.15)),p.angles[2],E(t,.73,1.24));
 for(let j=0;j<8;j++){const an=j*TAU/8+p.angles[0],ignite=E(t,.20+j*.085,.40+j*.085),x=p.x+Math.cos(an)*p.rx*.89,y=p.y+Math.sin(an)*p.ry*.89,shine=.62+.38*Math.sin(t*2.6+j*.79)**2;sxCore(x,y,27+15*p.charge,a*ignite*shine*.86,t);}
 // A few distinct moving highlights trace the engraved rings without filling their dark gaps.
 for(let j=0;j<28;j++){const ring=j%2,rad=ring?.60:.96,an=j*2.399+t*(ring?-.52:.37),x=p.x+Math.cos(an)*p.rx*rad,y=p.y+Math.sin(an)*p.ry*rad;sxCore(x,y,4+R(j)*6,a*.45*E(t,.5,1.24),t);}
 const full=E(t,1.10,1.24)*(1-E(t,1.26,1.57));sxCore(p.x,p.y,115,full*.86,t);
}
function forgeFeeds(){
 const p=forgePose(),s=sxSwordPose(),a=E(t,1.43,1.65)*(1-E(t,3.25,3.40));if(a<=0)return;const grow=E(t,1.45,2.85),front=flowWorld(s,0,.22-grow*.67);
 for(let j=0;j<8;j++){const an=j*TAU/8+p.angles[0],start={x:p.x+Math.cos(an)*p.rx*.82,y:p.y+Math.sin(an)*p.ry*.82};
  const points=[];for(let k=0;k<21;k++){const q=k/20,swirl=Math.sin(q*Math.PI)*(.22+.09*Math.sin(t*2+j)),angle=an+swirl,rr=(1-q)**1.9;points.push({x:L(front.x,p.x+Math.cos(angle)*p.rx*.82,rr),y:L(front.y,p.y+Math.sin(angle)*p.ry*.82,rr)});}forgeStroke(points,4+p.charge*3,a*(.065+.035*Math.sin(t*6+j)**2));
  const flow=((t-1.45)*.95+j*.125)%1,q=Math.max(0,flow),idx=Math.min(19,Math.floor(q*20)),f=q*20-idx,pa=points[idx],pb=points[idx+1];sxCore(L(pa.x,pb.x,f),L(pa.y,pb.y,f),13+9*p.charge,a*Math.sin(q*Math.PI)*.8,t);
 }
 sxCore(front.x,front.y,62+30*(1-grow),a*(1-E(t,2.88,3.16))*.9,t);
}
function rtDraw(z){wall=raw=z;t=z-Math.min(Math.max(0,z-104/30),4/30);c=main;beginFx();dxEffects();finishFx();c=main;}
function armAngle(){return 0;}
function finger(){
 const mix=battlePoseMix();let x=0,y=0;for(const [pose,w]of Object.entries(mix)){if(w<=0)continue;const p=battleModelPoint(pose,pose==='cast'?'castFinger':'swordTip');x+=p.x*w;y+=p.y*w;}return{x,y};
}
function nightBase(){if(wall<6.6)return nightV8();return(.65-.15*(E(wall,8.2,8.8)-E(wall,9.1,9.4)))*(1-E(wall,10.5666666667,11.3666666667));}
function nightV8(){return .65*E(t,0,.55)*(1-E(t,9.15,10))+.33*(E(t,7.2,7.4)-E(t,7.7,7.9));}
function debris(x,y,age,seed,big=false){let life=big?1.1:.50;if(age<0||age>life)return;const fade=1-E(age,life*.5,life),n=big?106:7;c.save();for(let i=0;i<n;i++){let a=R(seed+i*7)*TAU,speed=(big?180:90)+R(seed+i*11)*(big?330:170),vx=Math.cos(a)*speed,vy=-(big?150:110)-R(seed+i*13)*(big?420:130),px=x+vx*age,py=y+vy*age+(big?430:330)*age*age,size=(big?3:1.5)+R(seed+i)*(big?8:3);c.globalAlpha=fade;if(i%3===0){c.save();c.translate(px,py);c.rotate(age*(R(i)*5-2.5)+R(i)*TAU);c.globalCompositeOperation='screen';c.drawImage(A.hit,-size,-size,size*2,size*2);c.restore();}else{c.globalCompositeOperation='screen';c.strokeStyle=i%2?'#fff5b9':'#fff1cc';c.lineWidth=big?1.8:1.3;c.beginPath();c.moveTo(px,py);c.lineTo(px-vx*.025,py-(vy+860*age)*.025);c.stroke();c.globalCompositeOperation='source-over';}}c.restore();}

function reaction(u){if(u!==dxTarget())return{dx:0,lift:0,angle:0,sy:1,tint:''};const age=t-104/30;if(age<0)return{dx:0,lift:0,angle:0,sy:1,tint:''};const drive=E(age,0,.14),ret=1-E(age,.82,1.85);return{dx:-(34+71*drive)*ret,lift:(18+46*drive)*(1-E(age,.18,.60)),angle:-(.26+.16*drive)*(1-E(age,.22,.75)),sy:.83+.17*E(age,0,.18),tint:age<.1?'#fff6ec':age<.22?'#ff9089':''};}
function tight(im,h){const v=mk(im.width,im.height),g=v.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,v.width,v.height).data;let x0=v.width,y0=v.height,x1=0,y1=0;for(let y=0;y<v.height;y++)for(let x=0;x<v.width;x++)if(d[(y*v.width+x)*4+3]>32){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}return{im,w:im.width,h:im.height,footX:(x0+x1)/2,footY:y1,scale:h/(y1-y0),bounds:[x0,y0,x1,y1],visibleHeight:h};}
function cacheUnit(u){
 const spec=A.battlePoseSpecs?.[u.key];
 if(u.side==='hero'&&spec){
  const poses={};for(const [pose,def]of Object.entries(spec.poses)){const im=A['bm_'+u.key+'_'+pose];if(!im)throw new Error('Battle pose not loaded: '+u.key+' '+pose);poses[pose]={...def,im};}
  return{im:poses.idle.im,w:spec.canvas[0],h:spec.canvas[1],footX:spec.groundAnchor[0],footY:spec.groundAnchor[1],scale:u.h/spec.sourceHeight,bounds:poses.idle.bounds,visibleHeight:u.h,sourceHeight:spec.sourceHeight,poses,modelSpec:spec};
 }
 if(u.side==='hero')return tight(IMG[u.key],u.h);
 if(u.key==='e_leopard')return tight(IMG.e_leopard,u.h);
 const im=mk(1400,900);RIG.draw(im.getContext('2d'),RIG.RIGS[u.key==='e_wolf2'?'c5':'e4'],700,800,400,true,'idle',0,{trail:0});return tight(im,u.h);
}
function makeHeroParts(im){const body=mk(im.width,im.height),arm=mk(im.width,im.height),poly=[[0,44],[145,60],[226,91],[232,148],[218,181],[216,249],[173,255],[142,210],[105,183],[70,152],[0,140]];function clip(g){g.beginPath();poly.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();}let b=body.getContext('2d'),a=arm.getContext('2d');b.drawImage(im,0,0);b.globalCompositeOperation='destination-out';clip(b);b.fill();a.save();clip(a);a.clip();a.drawImage(im,0,0);a.restore();return{body,arm};}
function tinted(im,col){let key=im===heroParts?.body?'body':im===heroParts?.arm?'arm':null;let per=tintCache.get(im);if(!per){per=new Map();tintCache.set(im,per);}if(!per.has(col)){let v=mk(im.width,im.height),g=v.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,v.width,v.height);per.set(col,v);}return per.get(col);}
function drawUnit5(u){
 const f=units.get(u),rr=reaction(u),active=u===dxCaster(),mix=f.poses?(active?battlePoseMix():{idle:1,cast:0,atk:0}):null,im=mix?battlePoseImage(f,mix):f.im,lit=u===dxTarget()?Math.max(dxCharge()*.36,dxBurst()):active?Math.max(dxCharge()*.55,dxBurst()*.14):0;
 c.save();c.translate(u.x+rr.dx,u.y-rr.lift);c.rotate(rr.angle);c.scale(f.scale,f.scale*rr.sy);c.translate(-f.footX,-f.footY);c.globalAlpha=1;c.filter='brightness('+(1-night()*.5)+')';c.drawImage(im,0,0);c.filter='none';
 if(lit>0){c.save();c.globalCompositeOperation='screen';if(mix){for(const [pose,w]of Object.entries(mix)){if(w<=1e-7)continue;const v=battleModelLitLayers(f,f.poses[pose]);c.globalAlpha=lit*.12*w;c.drawImage(v.fill,0,0);c.globalAlpha=lit*.68*w;c.drawImage(v.rim,0,0);}}else{const v=illuminate(im,f.bounds);c.globalAlpha=lit*.12;c.drawImage(tinted(v.fill,'#ffb3a4'),0,0);c.globalAlpha=lit*.68;c.filter='blur(1px)';c.drawImage(tinted(v.rim,'#fff2df'),0,0);}c.restore();}
 if(rr.tint){c.globalAlpha=.26;c.drawImage(tinted(im,rr.tint),0,0);}c.restore();
 c.save();c.fillStyle='#081015';c.fillRect(u.x-39+rr.dx,u.y-u.h-16-rr.lift,78,6);c.fillStyle=u.side==='hero'?'#4cda7f':'#ec6a37';c.fillRect(u.x-38+rr.dx,u.y-u.h-15-rr.lift,76*u.hp/u.maxhp,4);c.restore();
}
function numbers(){const u=dxTarget(),age=raw-104/30;if(age<0||age>1.1)return;const rr=reaction(u),x=u.x+rr.dx+88,y=u.y-u.h-58-rr.lift-age*13,pop=1+.18*(1-E(age,0,.13));c.save();c.translate(x,y);c.scale(pop,pop);c.font='800 52px '+FONT;c.textAlign='center';c.textBaseline='middle';c.globalAlpha=1-E(age,.75,1.1);c.strokeStyle='#301016';c.lineWidth=3.5;c.fillStyle='#fff4df';c.shadowColor='#bb271d';c.shadowBlur=9;c.strokeText('68,880',0,0);c.fillText('68,880',0,0);c.restore();}
function camera(){const age=raw-104/30;if(age<0||age>=.38)return{x:0,y:0,zoom:1};const d=skyMotion(104/30).direction,k=(1-age/.38)**1.7,osc=Math.cos(age*68);return{x:d.x*20*k*osc,y:d.y*20*k*osc,zoom:1+.045*k};}
function foregroundFlash(){const alpha=raw>=8-1e-7&&raw<8+2/30-1e-7?.70:0;if(alpha){main.save();main.fillStyle='rgba(255,249,235,'+alpha+')';main.fillRect(0,0,W,H);main.restore();}}
function update(z){wall=raw=z;t=z-Math.min(Math.max(0,z-104/30),4/30);for(const u of battle.enemies)u.hp=u.maxhp-(u===dxTarget()&&z>=104/30?68880:0);hitIndex=z>=104/30?1:0;state.flash=state.shake=0;FX.length=0;}
function render(z){update(z);c=main;main.globalAlpha=1;main.globalCompositeOperation='source-over';main.filter='none';main.fillStyle='#07101b';main.fillRect(0,0,W,H);if(has(battle.cfg.bg))drawImageFit(IMG[battle.cfg.bg],0,0,W,H);main.fillStyle='rgba(4,7,22,'+night()+')';main.fillRect(0,0,W,H);main.save();const cam=camera();main.translate(cam.x,cam.y);if(cam.zoom!==1){const u=dxTarget(),cy=u.y-u.h*.62;main.translate(u.x,cy);main.scale(cam.zoom,cam.zoom);main.translate(-u.x,-cy);}if(has(battle.cfg.bg))drawImageFit(IMG[battle.cfg.bg],0,0,W,H);main.fillStyle='rgba(4,7,22,'+night()+')';main.fillRect(0,0,W,H);environmentLight();beginFx();sxGround();finishFx();for(const u of [...battle.units].sort((a,b)=>a.y-b.y))drawUnit5(u);beginFx();dxEffects();finishFx();numbers();main.restore();if(raw>=(104/30)&&raw<(104/30)+2/30-1e-8){main.save();main.globalAlpha=raw<(104/30)+1/30-1e-8?.52:.22;main.fillStyle='#fff7e8';main.fillRect(0,0,W,H);main.restore();}main.save();main.fillStyle='rgba(0,0,0,.36)';main.fillRect(0,0,W,42);main.font='600 22px '+FONT;main.fillStyle='#ffe8d5';main.textBaseline='middle';main.fillText(dxCaster().name+' · 天剑三式·杀星',24,23);main.restore();}
function fixture(s){state=s;s.started=true;s.overlay.length=0;s.fade=s.flash=s.shake=0;dialog=choice=sysPanel=null;FX.length=0;startBattle({title:'破军剑阵·太阳',bg:'bg_mountain',party:['yunting','linxue'],enemies:layout.enemies.map(e=>({name:e.name,key:e.key,h:layout.BASE_H*H*e.ratio,hp:900000,maxhp:900000}))});
 battle.heroes.forEach((u,i)=>{let d=layout.heroes[i];u.x=d.x*W;u.y=(layout.FOOT_Y-d.depth)*H;u.h=[240,247,223][i];u.gauge=[76,48,28][i];});battle.enemies.forEach((u,i)=>{let d=layout.enemies[i];u.x=d.x*W;u.y=(layout.FOOT_Y-d.depth)*H;u.h=BATTLE_SIZE[u.key];u.maxhp=u.hp=900000;u.gauge=[10,30,56][i];});battle.P=battle.heroes[0];battle.active=battle.P;battle.state='act';units.clear();tintCache.clear();for(let u of battle.units)units.set(u,cacheUnit(u));heroParts=makeHeroParts(IMG.b_yegx_cast);layoutAudit=battle.units.map(u=>({name:u.name,side:u.side,x:u.x,y:u.y,visibleHeight:units.get(u).visibleHeight,ratioToScreen:units.get(u).visibleHeight/H,sourceBounds:units.get(u).bounds}));
 if(!hud){hud=mk(W,H);c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,c.canvas.width,c.canvas.height);drawBattleHud();hud.getContext('2d').drawImage(c.canvas,0,0,W,H,0,0,W,H);c.clearRect(0,0,c.canvas.width,c.canvas.height);c.restore();}hitIndex=0;events.length=0;wall=raw=t=0;FX.length=0;s.scene=()=>render(wall);}
window.SX_RT={rtDraw,preload,_prof(z){const o={};let a=performance.now();wall=raw=z;t=z-Math.min(Math.max(0,z-104/30),4/30);flowSwordTexture(t);o.sword=performance.now()-a;a=performance.now();if(z>=104/30)flowImpactTexture(t-104/30);o.imp=performance.now()-a;a=performance.now();c=main;beginFx();o.begin=performance.now()-a;a=performance.now();sxConsecration();o.cons=performance.now()-a;a=performance.now();sxDrawSword();o.sw=performance.now()-a;a=performance.now();sxImpact();o.im=performance.now()-a;a=performance.now();finishFx();o.fin=performance.now()-a;for(const k in o)o[k]=+o[k].toFixed(1);return o;},inspectShaxing,setCaster,materialProbe,renderFxOnly,preload,fixture,render,renderSunLoop,setDirection(key){solarDirection=key;sunPixels=sunSets[key];sunTextureKey=null;},auditRecall,setArrayReview(mode,hideHud=false){arrayMaterial=mode;closeup=hideHud;},setDebugMode(v){debugMode=v;},getLightLayer(){return fx;},renderArrayDetail,renderSunDetail,duration,events,layoutAudit:()=>layoutAudit,auditMotion(){let maxStartPositionError=0,maxStartAngleError=0,maxGrowthPositionError=0;for(const p of rainItems()){const a=frozenSword(p),v=recallPose(p,6.6);maxStartPositionError=Math.max(maxStartPositionError,Math.hypot(v.x-a.x,v.y-a.y));maxStartAngleError=Math.max(maxStartAngleError,Math.abs(v.angle-a.angle));const g=rainPose(p,p.birth+p.grow-1e-8),f=rainPose(p,p.birth+p.grow+1e-8);maxGrowthPositionError=Math.max(maxGrowthPositionError,Math.hypot(g.x-f.x,g.y-f.y));}return{maxStartPositionError,maxStartAngleError,maxGrowthPositionError,rainObjectCount:rainItems().length,riverGroups:0,recallTimes:[6.6,7,8.4,8.8],births:rainItems().map(p=>p.birth)};},inspect(){const items=rainItems();return{raw:wall,legacyRaw:raw,time:t,camera:camera(),phase:phaseName(),nightOpacity:night(),sceneBaseBrightness:1-night(),array:{...SUN_ARRAY_V8.inspect(t),sky,ground},heroArmAngle:armAngle(),requiredVfxImages:Object.keys(A).length,rain:{start:3.2,end:6.6,total:items.length,rate:t<3.2||t>=6.6?0:20+100*(t-3.2)/3.4,active:items.filter(p=>t>=p.birth&&t<6.6).length,airborne:items.filter(p=>t>=p.birth&&t<p.hit).length,planted:items.filter(p=>t>=p.hit&&t<6.6).length},recall:{active:wall>=6.6&&wall<8.8,groups:0,pause:[6.6,7],rivers:[7,8.4],insert:[8.4,8.8],sun:imperialState()},impact:{rayCount:224,seconds:9.4,extendComplete:10.0,fadeEnd:11.0},damageEvents:hitIndex,whiteFlash:raw>=8-1e-7&&raw<8+2/30-1e-7,hitstop:raw>=8+2/30-1e-7&&raw<8.2-1e-7,darkHold:raw>=7.4-1e-7&&raw<7.7-1e-7,reactions:battle.enemies.map(u=>({name:u.name,...reaction(u)})),layout:layoutAudit};}};
})();
