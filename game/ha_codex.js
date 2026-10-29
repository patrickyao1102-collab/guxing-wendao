// ================= 洛尘 · 黑暗本源 —— Codex 原代码，实时运行 =================
// 由 haxb/build.py 从 Codex 交付的 battle-layer / impact / particles / dark-rain / majesty-fx / heian-core / dark-intro / heian 拼成
// ---------- 网格贴图的显卡版：Codex 原版每个小三角形用 clip + drawImage 画（上千次 / 帧），这里一次画完 ----------
(function () {
  const W = 1920, H = 1080;
  let gl = null, glc = null, prog, aP, aS, bP, bS;
  const tex = new WeakMap(), dyn = new WeakSet(), queue = [];
  function init() {
    if (gl) return true;
    glc = document.createElement('canvas'); glc.width = W; glc.height = H;
    gl = glc.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false, alpha: true, depth: false, stencil: false });
    if (!gl) return false;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;attribute vec2 s;varying vec2 uv;void main(){uv=s;gl_Position=vec4(p.x/' + W + '.0*2.0-1.0,1.0-p.y/' + H + '.0*2.0,0.0,1.0);}'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec2 uv;uniform sampler2D tx;void main(){gl_FragColor=texture2D(tx,uv);}'));
    gl.linkProgram(prog); gl.useProgram(prog);
    aP = gl.getAttribLocation(prog, 'p'); aS = gl.getAttribLocation(prog, 's'); bP = gl.createBuffer(); bS = gl.createBuffer();
    gl.enableVertexAttribArray(aP); gl.enableVertexAttribArray(aS);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.viewport(0, 0, W, H);
    return true;
  }
  function T(im, fresh) {
    let t = tex.get(im);
    if (!t) { t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); tex.set(im, t); fresh = true; }
    gl.bindTexture(gl.TEXTURE_2D, t);
    if (fresh) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    return t;
  }
  // 与原版 mesh(c, im, map, box, step) 同样的网格划分和映射
  function mesh(c, im, map, box = [0, 0, 768, 512], step = 16) {
    const [x0, y0, x1, y1] = box, nx = Math.ceil((x1 - x0) / step), ny = Math.ceil((y1 - y0) / step), mix = (a, b, q) => a + (b - a) * q;
    const rows = []; for (let j = 0; j <= ny; j++) { const row = []; for (let i = 0; i <= nx; i++) { const p = { x: mix(x0, x1, i / nx), y: mix(y0, y1, j / ny) }; row.push({ p, q: map(p) }); } rows.push(row); }
    const P = [], S = [], iw = im.width, ih = im.height;
    const put = v => { P.push(v.q.x, v.q.y); S.push(v.p.x / iw, v.p.y / ih); };
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = rows[j][i], b = rows[j][i + 1], d = rows[j + 1][i + 1], e = rows[j + 1][i]; put(a); put(b); put(d); put(a); put(d); put(e); }
    queue.push({ im, P: new Float32Array(P), S: new Float32Array(S) });
  }
  // 把排好的网格一次画进 GL 画布，再按 c 当前的透明度 / 混合 / 裁剪贴回去
  function flush(c) {
    if (!queue.length) return;
    if (!init()) { queue.length = 0; return; }
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    const up = new Set();
    for (const m of queue) {
      const fresh = dyn.has(m.im) && !up.has(m.im); if (fresh) up.add(m.im);
      T(m.im, fresh);
      gl.bindBuffer(gl.ARRAY_BUFFER, bP); gl.bufferData(gl.ARRAY_BUFFER, m.P, gl.STREAM_DRAW); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bS); gl.bufferData(gl.ARRAY_BUFFER, m.S, gl.STREAM_DRAW); gl.vertexAttribPointer(aS, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, m.P.length / 2);
    }
    queue.length = 0;
    c.drawImage(glc, 0, 0);
  }
  window.HA_GLM = { mesh, flush, markDynamic: im => dyn.add(im), ok: () => init() };
  globalThis.GMXT = c => c.__gmxM || new DOMMatrix();
})();

/* Original v8 battle artwork, separated for actual enemy recoil.
   Browser: HA_BATTLE.create(A); CommonJS: require(...).create(A).
   A keys are listed in manifest.json. Times are milliseconds, 1920 x 1080.
   draw(ctx, t, opts) honors the caller's transform, filter and global alpha.
   Caster is excluded from draw() by default: call drawCasterForeground() after
   the deity and impact. It reuses the original b_luochen_ult painting throughout
   the shot; no standing-pose return. The held sun is a separate approved asset. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HA_BATTLE=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const units=[{"id":"luochen","name":"洛尘","side":"ally","atlasRect":[1482,0,515,656],"footX":257.5,"footY":656,"naturalHeight":656,"x":1635,"y":705,"height":410,"alphaBounds":[99,55,384,601],"sourceSize":[515,656],"screenBounds":[1535.9375,329.375,240,375.625]},{"id":"rhino","name":"黑甲犀妖","side":"enemy","footX":407.5,"footY":374,"naturalHeight":329,"x":810,"y":720,"height":282,"flip":true,"alphaBounds":[56,43,539,330],"sourceSize":[650,434],"screenBounds":[649.2857142857143,436.2857142857143,462,282.85714285714283]},{"id":"leopard","name":"烈焰妖豹","side":"enemy","atlasRect":[0,0,507,270],"footX":202.59237536656892,"footY":264.4574780058651,"naturalHeight":264.4574780058651,"x":555,"y":855,"height":270,"flip":true,"alphaBounds":[91,19,354,247],"sourceSize":[507,270],"screenBounds":[307.5119760479042,604.3982035928144,361.4191616766467,252.17664670658684]},{"id":"yeguxing","name":"叶孤星","side":"ally","footX":233,"footY":500,"naturalHeight":500,"x":1395,"y":923,"height":375,"alphaBounds":[0,0,466,500],"sourceSize":[466,500],"screenBounds":[1220.25,548,349.5,375]},{"id":"wolf","name":"银纹妖狼","side":"enemy","footX":334,"footY":403,"naturalHeight":350,"x":840,"y":960,"height":300,"flip":true,"alphaBounds":[78,31,521,372],"sourceSize":[650,434],"screenBounds":[612.8571428571429,641.1428571428571,446.57142857142856,318.85714285714283]},{"id":"shenle","name":"神乐","side":"ally","atlasRect":[0,0,492,600],"footX":246,"footY":600,"naturalHeight":600,"x":1770,"y":975,"height":342,"alphaBounds":[78,0,394,600],"sourceSize":[492,600],"screenBounds":[1674.24,633,224.57999999999998,341.99999999999994]}];
const manifest={"battle_background":"assets/battle/background.webp","battle_luochen":"assets/battle/luochen.png","battle_rhino":"assets/battle/rhino.png","battle_rhino_lit":"assets/battle/rhino_lit.png","battle_leopard":"assets/battle/leopard.png","battle_leopard_lit":"assets/battle/leopard_lit.png","battle_yeguxing":"assets/battle/yeguxing.png","battle_wolf":"assets/battle/wolf.png","battle_wolf_lit":"assets/battle/wolf_lit.png","battle_shenle":"assets/battle/shenle.png","battle_luochen_tuotian":"assets/sun-caster/luochen_tuotian.png","battle_held_sun":"assets/sun-caster/sun_v6.png"};
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=(a,b,t)=>{const p=clamp((t-a)/(b-a));return p*p*(3-2*p)};
const CASTER={x:1600,y:1000,height:340,width:515,naturalHeight:656,footX:257.5,footY:656,palms:[[146,31],[390,20]],sunTextureSize:270,sunCoreRadius:80};
Object.assign(units[0],{x:CASTER.x,y:CASTER.y,height:CASTER.height,atlasRect:[3033,0,515,656],alphaBounds:[82,0,433,656],screenBounds:[CASTER.x+(82-CASTER.footX)*CASTER.height/656,CASTER.y-CASTER.height,433*CASTER.height/656,CASTER.height],pose:'ult'});
function casterState(t){
 const opacity=.8*ease(1000,2500,t)+.2*ease(2500,4500,t),scale=CASTER.height/CASTER.naturalHeight;
 const breath=1+.0028*Math.sin(t*.0021),sway=.0026*Math.sin(t*.0018+.7);
 const point=p=>({x:CASTER.x+((p[0]-CASTER.footX)+sway*(p[1]-CASTER.footY))*scale,y:CASTER.y+(p[1]-CASTER.footY)*scale*breath});
 const palms=CASTER.palms.map(point),sunPower=1-ease(11400,11850,t),sun={x:(palms[0].x+palms[1].x)/2,y:Math.min(palms[0].y,palms[1].y)-55,radius:CASTER.sunCoreRadius,textureSize:CASTER.sunTextureSize,power:sunPower};
 return{timeMs:t,pose:'双手托天',sourcePose:'b_luochen_ult',opacity,scale,breath,sway,foot:{x:CASTER.x,y:CASTER.y},height:CASTER.height,palms,sun,head:point([250,113]),endingPose:'双手托天',sunFadeMs:[11400,11850]};
}
function motion(u,t){
 if(u.side!=='enemy'||t<9400)return{x:0,y:0,angle:0,scaleX:1,scaleY:1,flash:0};
 const i=(u.idx||0)%3,d=t-9400,peak=[55,70,62][i];
 // The scene holds at 9433.3334 ms during impact; reach the recoil pose early.
 const kick=1-Math.pow(1-clamp(d/45),3),recover=ease(9630,11000,t),recoil=kick*(1-recover);
 const compression=ease(9400,9425,t)*(1-ease(9510,9710,t));
 // One brief white hit; paint detail remains underneath and returns by 9.5 s.
 const flash=.27*ease(9400,9425,t)*(1-ease(9450,9600,t));
 const x=-peak*recoil,y=-[8,14,10][i]*Math.sin(Math.PI*clamp(d/560));
 const angle=-[.105,.15,.12][i]*recoil;
 return{x,y,angle,scaleX:1-.05*compression,scaleY:1+.025*compression,flash};
}
// The deity's weight is expressed at the enemies' planted feet. Nothing changes
// their artwork or damage timing: a restrained crouch precedes a short inward
// ground collapse, then the existing recoil supplies the outward response.
function pressureMotion(u,t){
 if(u.side!=='enemy'||t<7000||t>=11000)return{x:0,y:0,angle:0,scaleX:1,scaleY:1};
 const i=(u.idx||0)%3;
 const charge=ease(7000,8900,t),release=1-ease(9460,10400,t),load=charge*release;
 const strain=Math.sin(t*.019+i*2.1)*.58+Math.sin(t*.031+i*.7)*.42;
 // Maximum height compression is 12.6%; width changes only 2.8%. Feet stay
 // fixed during the hold, while the torso struggles a little above them.
 const press=[.111,.121,.115][i],squeeze=load*(press+.005*strain);
 const collapse=ease(9300,9395,t)*(1-ease(9400,9550,t));
 const dx=735-u.x,dy=810-u.y,len=Math.max(1,Math.hypot(dx,dy)),pull=[14,18,16][i];
 const d=t-9400,kick=1-Math.pow(1-clamp(d/45),3),recoil=kick*(1-ease(9630,11000,t));
 return{x:load*(1.15*Math.sin(t*.024+i*1.7)+.40*Math.sin(t*.043+i))+dx/len*pull*collapse-[55,70,62][i]*.18*recoil,
  y:(10+dy/len*4)*collapse-[2,4,3][i]*Math.sin(Math.PI*clamp(d/560))*recoil,
  angle:load*(.0045*Math.sin(t*.017+i)+.003*Math.sin(t*.029+i*2))-[.018,.028,.022][i]*recoil,
  scaleX:1+.028*load,scaleY:1-squeeze};
}
function create(A,{canvasFactory}={}){
 let additionalMotion=null,additionalMotionDepth=0;const violetCache=new Map();
 function unitMotion(u,t){
  const base=motion(u,t),weight=pressureMotion(u,t);let extra=null;
  // Meteor reaction may initialize paths through enemyPositions(). During that
  // nested query use the same base + pressure transform, without recursing into
  // reaction again. Normal queries include the real meteor recoil coordinates.
  if(additionalMotion&&additionalMotionDepth===0){additionalMotionDepth++;try{extra=additionalMotion(u,t);}finally{additionalMotionDepth--;}}
  return{...base,x:base.x+weight.x+(extra?.x||0),y:base.y+weight.y+(extra?.y||0),angle:base.angle+weight.angle+(extra?.angle||0),
   scaleX:base.scaleX*weight.scaleX*(extra?.scaleX??1),scaleY:base.scaleY*weight.scaleY*(extra?.scaleY??1),darkFlash:extra?.flash||0};
 }
 function violetSprite(id){if(violetCache.has(id))return violetCache.get(id);const im=A['battle_'+id],v=canvasFactory(im.width,im.height),c=v.getContext('2d');c.drawImage(im,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#572480';c.fillRect(0,0,im.width,im.height);violetCache.set(id,v);return v;}
 function glow(c,x,y,r,a,color='255,219,133'){
  if(a<=0)return;c.save();c.globalCompositeOperation='screen';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+color+','+a+')');g.addColorStop(.35,'rgba('+color+','+(a*.45)+')');g.addColorStop(1,'rgba('+color+',0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
 }
 function drawCasterForeground(c,t,opts={}){
  const s=casterState(t),a=s.opacity*(opts.alpha===undefined?1:opts.alpha);if(a<=0)return s;
  c.save();c.filter='none';c.globalAlpha*=a;c.globalCompositeOperation='source-over';
  const pulse=.97+.03*Math.sin(t*.0037),power=s.sun.power;
  // The actual sun painting retains its fiery surface; only its surrounding
  // transparent light breathes. It is placed from the two visible palm anchors.
  if(power>0){
   glow(c,s.sun.x,s.sun.y,160,.14*power*pulse);
   c.save();c.globalAlpha*=power*pulse;c.drawImage(A.battle_held_sun,s.sun.x-s.sun.textureSize/2,s.sun.y-s.sun.textureSize/2,s.sun.textureSize,s.sun.textureSize);c.restore();
  }
  // Keep the original painted person readable in front of the divine mantle.
  // One small whole-sprite shear/breath preserves fingers, face and robe joins.
  c.save();c.translate(CASTER.x,CASTER.y);c.scale(s.scale,s.scale*s.breath);c.transform(1,0,s.sway,1,0,0);c.drawImage(A.battle_luochen_tuotian,-CASTER.footX,-CASTER.footY);c.restore();
  if(power>0){
   for(const palm of s.palms){
    const dx=palm.x-s.sun.x,edge={x:palm.x,y:s.sun.y+Math.sqrt(Math.max(0,s.sun.radius*s.sun.radius-dx*dx))};
    c.save();c.globalCompositeOperation='screen';c.lineCap='round';
    for(const [w,al]of [[17,.10],[8,.24],[2.5,.66]]){const g=c.createLinearGradient(palm.x,palm.y,edge.x,edge.y);g.addColorStop(0,'rgba(255,237,183,'+(al*power)+')');g.addColorStop(.65,'rgba(255,246,213,'+(al*power)+')');g.addColorStop(1,'rgba(255,255,244,0)');c.strokeStyle=g;c.lineWidth=w;c.beginPath();c.moveTo(palm.x,palm.y+3);c.quadraticCurveTo(palm.x+(s.sun.x-palm.x)*.05,(palm.y+edge.y)/2,edge.x,edge.y-4);c.stroke();}c.restore();
    glow(c,palm.x,palm.y,30,.31*power);glow(c,palm.x,palm.y,10,.40*power,'255,247,218');
   }
   // Local reflected sunlight catches the face/upper sleeves, with no panel.
   glow(c,s.head.x,s.head.y-15,61,.055*power);
  }
  c.restore();return s;
 }
 function drawUnit(c,u,t,opts={}){
  if(u.id!=='luochen')return;
  if(u.id==='luochen')return drawCasterForeground(c,t,opts);
  const p=unitMotion(u,t),x=u.x+p.x,y=u.y+p.y;
  if(opts.shadows!==false){
   c.save();c.translate(x,y-2);c.scale(1,.23);const rx=u.side==='ally'?90:125;
   const sh=c.createRadialGradient(0,0,2,0,0,rx);sh.addColorStop(0,'rgba(8,12,21,.34)');sh.addColorStop(.6,'rgba(8,12,21,.18)');sh.addColorStop(1,'rgba(8,12,21,0)');c.fillStyle=sh;c.fillRect(-rx,-rx,rx*2,rx*2);c.restore();
  }
  c.save();c.translate(x,y);c.rotate(p.angle);const scale=u.height/u.naturalHeight;c.scale((u.flip?-1:1)*scale*p.scaleX,scale*p.scaleY);c.drawImage(A['battle_'+u.id],-u.footX,-u.footY);
  const pulse=(.82+.18*Math.sin(t*.037)),light=ease(9300,9410,t)*(1-ease(10000,10400,t));
  if(u.side==='enemy'&&opts.enemyLight!==false&&light>0){
   c.save();c.filter='none';c.globalCompositeOperation='screen';c.globalAlpha*=.3*light*pulse;c.drawImage(A['battle_'+u.id+'_lit'],-u.footX,-u.footY);c.restore();
  }
  if(u.side==='enemy'&&opts.enemyFlash!==false&&p.flash>0){
   // Filtering the same alpha sprite avoids a rectangular flash or white field.
   c.save();c.filter='brightness(0) invert(1)';c.globalCompositeOperation='source-over';c.globalAlpha*=p.flash;c.drawImage(A['battle_'+u.id],-u.footX,-u.footY);c.restore();
  }
  if(u.side==='enemy'&&p.darkFlash>0){c.save();c.filter='none';c.globalCompositeOperation='source-over';c.globalAlpha*=p.darkFlash;c.drawImage(violetSprite(u.id),-u.footX,-u.footY);c.restore();}
  c.restore();
 }
 function draw(c,t,opts={}){
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(opts.background!==false){c.save();c.fillStyle=(globalThis.MATTE||'#000');c.fillRect(0,0,1920,1080);c.restore();}
  if(opts.caster===true&&(!opts.side||opts.side==='ally'))drawCasterForeground(c,t,opts);
  c.restore();
 }
 function enemyPositions(t){return units.filter(u=>u.side==='enemy').map(u=>{
  const p=unitMotion(u,t),x=u.x+p.x,y=u.y+p.y,b=u.screenBounds;
  const anchor=(px,py)=>{const dx=(px-u.x)*p.scaleX,dy=(py-u.y)*p.scaleY;return{x:x+dx*Math.cos(p.angle)-dy*Math.sin(p.angle),y:y+dx*Math.sin(p.angle)+dy*Math.cos(p.angle)}};
  const center=anchor(b[0]+b[2]/2,b[1]+b[3]/2),damage=anchor(b[0]+b[2]*.48,b[1]+b[3]*.22);
  return{...u,x,y,angle:p.angle,scaleX:p.scaleX,scaleY:p.scaleY,hitFlash:p.flash,centerX:center.x,centerY:center.y,damageX:damage.x,damageY:damage.y};
 })}
 return{draw,drawUnit,drawCasterForeground,casterState,units,get enemies(){return units.filter(u=>u.side==='enemy')},get allies(){return units.filter(u=>u.side==='ally')},enemyPositions,motion:unitMotion,setAdditionalMotion:fn=>{additionalMotion=fn}};
}
function setReal(conf){
 Object.assign(CASTER,{x:conf.caster.x,y:conf.caster.y,height:conf.caster.height});
 Object.assign(units[0],{x:CASTER.x,y:CASTER.y,height:CASTER.height,screenBounds:[CASTER.x+(82-CASTER.footX)*CASTER.height/656,CASTER.y-CASTER.height,433*CASTER.height/656,CASTER.height]});
 units.length=1;
 for(const a of conf.allies)units.push({id:a.id,name:a.name,side:'ally',x:a.x,y:a.y,height:a.h,img:a.img,footX:a.img.width/2,footY:a.img.height,naturalHeight:a.img.height,screenBounds:[a.x-a.w/2,a.y-a.h,a.w,a.h]});
 conf.enemies.forEach((e,i)=>units.push({id:'e'+i,idx:i,name:'e'+i,side:'enemy',x:e.x,y:e.y,height:e.h,img:e.img,footX:e.img.width/2,footY:e.img.height,naturalHeight:e.img.height,screenBounds:[e.x-e.w/2,e.y-e.h,e.w,e.h]}));
}
return{create,manifest,units,casterState,casterPlacement:CASTER,setReal,width:1920,height:1080};
});

/* Pure white-platinum columns. A broad continuous core carries the force;
   long axial light trails supply speed, with only sparse peripheral sparks.
   draw() receives scene time; camera()/flash() receive real time. */
(function(G){'use strict';
const TAU=Math.PI*2,LEAD=9150,START=9300,HIT=9400,RELEASE=10130,END=10500;
const TARGETS=[{x:810,y:720},{x:555,y:855},{x:840,y:960}],HIT_OFFSETS=[0,12,24],VISUAL_HIT_OFFSETS=[0,0,0],PILLAR_STARTS=[9316,9325,9334];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,q)=>a+(b-a)*q,frac=x=>x-Math.floor(x);
const ease=(a,b,t)=>{const q=clamp((t-a)/(b-a));return q*q*(3-2*q);};
const rand=(i,s=0)=>frac(Math.sin(i*127.1+s*311.7)*43758.5453123);
const PALETTE=['255,221,151','255,239,201','255,253,242'];
const COUNTS={main:12,pillar:5,mainCore:0,pillarCore:0,mainDust:0,pillarDust:0,hit:64,ground:18,group:24};
const spriteCache=new WeakMap(),volumeCache=new WeakMap();
function time(t){if(t<9333.333333)return t;if(t<9433.333333)return 9333.333333;if(t<10000)return t-100*(1-ease(9433.333333,10000,t));return t;}
function state(t,o={}){
 const palm=o.palm||{x:1050,y:480},end=o.end||{x:-100,y:620};
 const grow=Math.pow(clamp((t-START)/(HIT-START)),.58),fade=1-ease(RELEASE,END,t);
 const strength=t<START||t>=END?0:ease(START,START+18,t)*(1-ease(10380,END,t));
 const widthScale=(.045+.955*ease(START,START+50,t))*fade;
 return{palm,end,grow,fade,widthScale,strength,contraction:ease(LEAD,START,t)*(1-ease(START,START+50,t)),head:{x:mix(palm.x,end.x,grow),y:mix(palm.y,end.y,grow)}};
}
function canvasFor(c,w,h){
 return typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):typeof document!=='undefined'?Object.assign(document.createElement('canvas'),{width:w,height:h}):new c.canvas.constructor(w,h);
}
function sprites(c){
 if(spriteCache.has(c.canvas))return spriteCache.get(c.canvas);
 const result=PALETTE.map(color=>{
  const cv=canvasFor(c,24,24),x=cv.getContext('2d'),g=x.createRadialGradient(12,12,0,12,12,12);
  for(const[p,a]of[[0,1],[.20,.95],[.40,.50],[.70,.10],[1,0]])g.addColorStop(p,`rgba(${color},${a})`);
  x.fillStyle=g;x.fillRect(0,0,24,24);return cv;
 });spriteCache.set(c.canvas,result);return result;
}
function dot(c,pool,x,y,size,alpha,tone=1){
 if(alpha<=.003||size<=0)return;c.globalAlpha=clamp(alpha);const d=size*3.7;c.drawImage(pool[tone],x-d*.5,y-d*.5,d,d);
}
function axialSpeck(c,pool,x,y,size,alpha,tone,tail){
 if(tail>0&&alpha>.003){c.globalAlpha=clamp(alpha*.65);c.drawImage(pool[tone],x-tail,y-size*.78,tail+size,size*1.56);}
 dot(c,pool,x,y,size,alpha,tone);
}
function tinyHalo(c,x,y,r,alpha,tone=2){
 if(alpha<=.001)return;c.globalAlpha=1;
 const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${PALETTE[tone]},${alpha})`);g.addColorStop(.22,`rgba(${PALETTE[tone]},${alpha*.38})`);g.addColorStop(1,`rgba(${PALETTE[tone]},0)`);
 c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
}
function contraction(c,t,s){
 if(t<LEAD||t>START+55)return;
 const q=ease(LEAD,START,t),fall=1-ease(START,START+55,t),strength=(.15+.85*q)*fall,pool=sprites(c),radius=mix(154,23,q);
 c.save();c.translate(s.palm.x,s.palm.y);c.globalCompositeOperation='source-over';
 for(let i=0;i<230;i++){
  const u=frac((t-LEAD)*.0035+rand(i,31)),r=radius*(.16+u),angle=i*2.39996+t*.004;
  dot(c,pool,Math.cos(angle)*r,Math.sin(angle)*r*.78,.65+rand(i,32)*1.1,strength*(1-u)*(.24+.52*rand(i,33)),i%3);
 }c.restore();
}
// A continuous optical volume supplies the whole shaft. Its advancing front
// fades along the axis while the stable section keeps its full width.
function volumePath(c,full,len,half,scale,t,grow,branch,fraction=1){
 const points=Math.max(64,Math.ceil(len/10)),age=(t-START)*.001;
 const edge=(u,side)=>{
  const x=u*len,along=x/full,opening=branch?1:.13+.87*ease(0,.11,along);
  const front=grow<.999?Math.sqrt(clamp((len-x)/Math.min(90*scale,len*.25))):1;
  const roll=branch?1+.024*Math.sin(along*21-age*11):1+.036*Math.sin(along*17-age*13)+.018*Math.sin(along*37-age*19);
  return [x,side*half*fraction*scale*opening*front*roll];
 };
 c.beginPath();for(let i=0;i<=points;i++){const p=edge(i/points,-1);i?c.lineTo(...p):c.moveTo(...p);}
 for(let i=points;i>=0;i--){const p=edge(i/points,1);c.lineTo(...p);}c.closePath();
}
// Nearby vertical shafts retain their own bright ridges. Their shared fringe
// loses a little optical weight instead of accumulating into one white slab.
function separationAt(y,seams){
 let result=1;for(const offset of seams){const q=(y+offset*.5)/3.8;result=Math.min(result,1-.52*Math.exp(-q*q*.5));}return result;
}
function continuousVolume(c,t,full,len,grow,scale,strength,branch,seams){
 const half=branch?84:242,coreHalf=branch?24:56;
 // White-hot spine inside warm transparent optical layers, as reference ④.
 // Most of the perceived width comes from glass-like radiance, not white fill.
 const stops=[[0,0],[.07,.018],[.16,.065],[.25,.16],[.35,.34],[.43,.51],[.5,.60],[.57,.51],[.65,.34],[.75,.16],[.84,.065],[.93,.018],[1,0]];
 const addStops=(gradient,points,radius,color)=>{
  if(!seams.length){for(const[p,a]of points)gradient.addColorStop(p,`rgba(${color},${a})`);return;}
  for(let i=0;i<=128;i++){const u=i/128;let j=0;while(j<points.length-2&&points[j+1][0]<u)j++;
   const [a,aa]=points[j],[b,ab]=points[j+1],weight=mix(aa,ab,(u-a)/(b-a))*separationAt((u*2-1)*radius,seams);gradient.addColorStop(u,`rgba(${color},${weight})`);
  }
 };
 const paintSurface=(points,radius,color,feather)=>{
  const growing=grow<.999;let d=c,field;
  if(growing){
   field=volumeCache.get(c.canvas);const width=Math.ceil(full)+4,height=660;
   if(!field||field.canvas.width<width){const cv=canvasFor(c,width,height);field={canvas:cv,ctx:cv.getContext('2d'),pad:height*.5};volumeCache.set(c.canvas,field);}
   d=field.ctx;d.setTransform(1,0,0,1,0,0);d.globalAlpha=1;d.globalCompositeOperation='source-over';d.clearRect(0,0,field.canvas.width,field.canvas.height);d.save();d.translate(0,field.pad);
  }else d.save();
  d.globalCompositeOperation='source-over';d.globalAlpha=growing?1:strength;
  if(growing)d.filter='blur(6px)';
  const gradient=d.createLinearGradient(0,-radius*scale,0,radius*scale);addStops(gradient,points,radius*scale,color);
  d.fillStyle=gradient;volumePath(d,full,len,radius,scale,t,grow,branch);d.fill();d.restore();
  if(growing){
   // A longitudinal optical feather removes the capsule-like moving cap.
   // The glow dissolves before the mathematical propagation endpoint.
   d.globalCompositeOperation='destination-in';const edge=d.createLinearGradient(Math.max(0,len-feather*scale),0,len,0);
   edge.addColorStop(0,'rgba(255,255,255,1)');edge.addColorStop(.45,'rgba(255,255,255,.72)');edge.addColorStop(1,'rgba(255,255,255,0)');
   d.fillStyle=edge;d.fillRect(0,0,field.canvas.width,field.canvas.height);d.globalCompositeOperation='source-over';
   c.save();c.globalCompositeOperation='source-over';c.globalAlpha=strength;c.drawImage(field.canvas,0,-field.pad);c.restore();
  }
 };
 paintSurface(stops.map(([u,a])=>[u,a*.30]),half*1.26,'255,234,192',branch?140:180);
 paintSurface(stops.map(([u,a])=>[u,Math.min(.76,a*1.25)]),half,'255,230,178',branch?120:160);
 const coreStops=branch?[[0,0],[.12,.14],[.28,.80],[.42,1],[.58,1],[.72,.80],[.88,.14],[1,0]]:
  [[0,0],[.10,.58],[.23,.98],[.36,1],[.64,1],[.77,.98],[.90,.58],[1,0]];
 paintSurface(coreStops,coreHalf,'255,255,246',branch?75:110);
}
// Soft pressure packets travel within the continuous core, so brightness has
// moving structure without asking tiny specks to supply the column's volume.
function pressureCore(c,t,pool,full,len,grow,scale,strength,branch,birth,seams){
 const age=(t-birth)/1000,release=1-ease(RELEASE,END,t),count=branch?18:32;
 c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<count;i++){
  const layer=i%3,u=frac(rand(i,721)+age*(1750+layer*270+rand(i,722)*560)/full),x=u*full;if(x>len)continue;
  const front=grow<.999?1-ease(Math.max(0,grow-.09),grow,u):1,ends=ease(0,.04,u)*(1-ease(branch?.997:.97,1,u));
  const opening=branch?1:.075+.925*ease(0,.12,u),wave=Math.sin(u*22-age*10+layer*1.7);
  const yy=wave*(branch?1.6:5.8)*scale*opening,L=(140+rand(i,723)*150)*scale,height=(branch?(seams.length?20:28):68)*(1+.19*wave)*scale*opening;
  c.globalAlpha=strength*release*front*ends*(.20+.10*rand(i,724))*(branch?.45:.65);
  c.drawImage(pool[2],x-L*.67,yy-height*.5,L,height);
  if(i%2===0){c.globalAlpha=strength*release*front*ends*(branch?.16:.28);c.drawImage(pool[2],x-L*.38,yy-height*.19,L*.66,height*.38);}
 }
 c.restore();
}
// Soft elongated light trails have no sparkling heads. Their longitudinal
// stretch gives the continuous column motion blur without a sand-like texture.
function axialLight(c,pool,x,y,length,width,alpha,tone=2){
 if(alpha<.002||length<1)return;
 c.globalAlpha=alpha*.22;c.drawImage(pool[tone],x-length,y-width*2,length,width*4);
 c.globalAlpha=alpha;c.drawImage(pool[tone],x-length,y-width*.5,length,width);
}
function flowingGold(c,t,full,len,grow,scale,strength,branch,seams){
 const age=(t-START)/1000,half=(branch?84:242)*scale,count=branch?5:9;
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=strength;c.lineCap='round';c.lineJoin='round';
 for(let i=0;i<count;i++){
  const side=i%2?1:-1,lane=.29+.39*rand(i,902),phase=age*(9+rand(i,903)*3)+i*1.71;
  const path=()=>{c.beginPath();for(let j=0;j<=100;j++){const x=j*len/100,u=x/full,opening=branch?1:.09+.91*ease(0,.11,u);
   const wave=Math.sin(x/(branch?120:155)-phase)*half*.13+Math.sin(x/79-phase*.7+i)*half*.026;
   const y=(side*half*lane+wave)*opening;j?c.lineTo(x,y):c.moveTo(x,y);}};
  for(const [width,alpha,rgb]of [[30,.055,'255,222,157'],[13,.14,'255,229,172'],[4.5,.47,'255,235,190'],[1.5,.70,'255,246,217']]){
   const weight=separationAt(side*half*lane,seams),g=c.createLinearGradient(0,0,Math.max(1,len),0);
   g.addColorStop(0,`rgba(${rgb},0)`);g.addColorStop(.12,`rgba(${rgb},${alpha*weight*.75})`);g.addColorStop(.65,`rgba(${rgb},${alpha*weight})`);g.addColorStop(.92,`rgba(${rgb},${alpha*weight*.65})`);g.addColorStop(1,`rgba(${rgb},0)`);
   c.strokeStyle=g;c.lineWidth=width*scale*(branch?.55:1);path();c.stroke();
  }
 }
 c.restore();
}
function beamBody(c,t,from,to,strength,grow,branch=false,birth=START,seams=[]){
 if(strength<=.001||grow<=.001)return;
 const dx=to.x-from.x,dy=to.y-from.y,full=Math.hypot(dx,dy),len=full*grow,angle=Math.atan2(dy,dx);
 const release=1-ease(RELEASE,END,t),attack=branch?1:.045+.955*ease(START,START+50,t),scale=attack*release;
 if(scale<.001||full<1)return;
 const half=(branch?84:242)*scale,age=(t-birth)/1000,pool=sprites(c);
 c.save();c.translate(from.x,from.y);c.rotate(angle);c.globalCompositeOperation='source-over';
 continuousVolume(c,t,full,len,grow,scale,strength,branch,seams);
 pressureCore(c,t,pool,full,len,grow,scale,strength,branch,birth,seams);
 flowingGold(c,t,full,len,grow,scale,strength,branch,seams);
 c.globalCompositeOperation='screen';
 const trailCount=branch?8:18;
 for(let i=0;i<trailCount;i++){
  const u=frac(rand(i,810)+age*(1650+rand(i,811)*1900)/full),x=u*full;if(x>len)continue;
  const opening=branch?1:.13+.87*ease(0,.11,u),side=i%2?1:-1;
  const y=side*half*(.25+rand(i,812)*.57)*opening+Math.sin(u*13-age*8+i)*1.8*scale;
  const front=grow<.999?1-ease(Math.max(0,grow-.035),grow,u):1;
  const envelope=ease(0,.07,u)*(1-ease(.94,1,u)),length=Math.min(x,(170+rand(i,813)*250)*scale);
  const width=(branch?1.3:2.6)*(1+rand(i,814)*1.35)*scale;
  const alpha=(.12+.24*rand(i,815))*strength*release*front*envelope*separationAt(y,seams);
  axialLight(c,pool,x,y,length,width,alpha,1);
 }
 c.globalCompositeOperation='source-over';
 for(let i=0;i<(branch?COUNTS.pillar:COUNTS.main);i++){
  const u=frac(rand(i,850)+age*(1900+rand(i,851)*1200)/full),x=u*full;if(x>len)continue;
  const opening=branch?1:.13+.87*ease(0,.11,u),side=i%2?1:-1,y=side*half*opening*(.63+rand(i,852)*.27);
  const alpha=(.22+.28*rand(i,853))*strength*release*Math.sin(Math.PI*u)*separationAt(y,seams);
  axialSpeck(c,pool,x,y,.65+rand(i,854)*.65,alpha,2,8+rand(i,855)*18);
 }
 c.restore();
}
function palmMuzzle(c,t,s){
 const a=s.strength*(1-ease(RELEASE,END,t));if(a<=.001)return;
 const angle=Math.atan2(s.end.y-s.palm.y,s.end.x-s.palm.x),pool=sprites(c);
 c.save();c.translate(s.palm.x,s.palm.y);c.rotate(angle);c.globalCompositeOperation='source-over';
 const kick=Math.exp(-Math.max(0,t-START)/105);
 tinyHalo(c,0,0,92,.32*a*(.35+.65*kick),1);tinyHalo(c,0,0,28,.82*a*(.45+.55*kick));
 for(let i=0;i<8;i++){const angle=rand(i,431)*TAU,r=(12+rand(i,432)*55)*(.25+ease(START,START+95,t));dot(c,pool,Math.cos(angle)*r,Math.sin(angle)*r,1.3+rand(i,433)*2,a*kick*.75,2);}
 for(let i=0;i<16;i++){
  const u=frac((t-START)*.014+rand(i,410)),x=u*52,r=4+u*12,phase=rand(i,411)*TAU;
  axialSpeck(c,pool,x,Math.sin(phase)*r,.7+rand(i,412)*1.3,a*(1-u)*(.30+rand(i,413)*.50),i%3,i%6===0?7:0);
 }c.restore();
}
function pillarGeometry(p){return{from:{x:p.x,y:-90},to:{x:p.x,y:p.y+3},direction:'vertical-down'};}
function branches(c,t,targets){
 targets.forEach((p,i)=>{
  const birth=PILLAR_STARTS[i%3];if(t<birth)return;
  const geometry=pillarGeometry(p),grow=ease(birth,HIT,t),life=ease(birth,birth+18,t)*(1-ease(RELEASE,END,t));
  const seams=targets.filter((q,j)=>j!==i&&Math.abs(q.x-p.x)<80).map(q=>q.x-p.x);
  beamBody(c,t,geometry.from,geometry.to,life,grow,true,birth,seams);
 });
}
function shockRings(c,t,p,index){
 const age=t-HIT-VISUAL_HIT_OFFSETS[index%3];if(age<0||t>=END)return;const pool=sprites(c);
 c.save();c.translate(p.x,p.y);c.globalCompositeOperation='source-over';
 for(let j=0;j<2;j++){
  const q=(age-j*38)/(j?540:650);if(q<0||q>=1)continue;
  const r=38+Math.pow(q,.64)*(j?190:250),alpha=Math.pow(1-q,1.6)*(j?.46:.70);
  for(const [width,gain,tone] of [[18,.10,0],[8,.21,0],[3.2,.75,1],[1.1,.86,2]]){c.globalAlpha=alpha*gain;c.strokeStyle=`rgb(${['255,240,205','255,250,231','255,255,250'][tone]})`;c.lineWidth=width*(1-q)+.4;c.beginPath();c.ellipse(0,0,r,r*.28,0,0,TAU);c.stroke();}
  for(let i=0;i<16;i++){
   const ang=i*2.39996,rr=r+(rand(i,450+j)*4-2);
   dot(c,pool,Math.cos(ang)*rr,Math.sin(ang)*rr*.28,.55+rand(i,452+j)*.80,alpha*(.4+rand(i,455+j)*.6),i%3);
  }
 }c.restore();
}
function layeredBurst(c,t,p,index){
 const age=t-HIT-VISUAL_HIT_OFFSETS[index%3];if(age<0||age>780)return;
 const bright=Math.exp(-age/82),expand=ease(0,155,age),tail=1-ease(180,780,age),pool=sprites(c);
 c.save();c.globalCompositeOperation='screen';
 const x=p.x,y=p.y-45;
 // Three local impacts share the exact platinum-to-warm-gold beam palette.
 tinyHalo(c,x,y,130+expand*55,(.32*bright+.12*tail),1);
 tinyHalo(c,x,y,38+expand*17,.94*bright,2);
 c.save();c.translate(x,y);c.scale(1,.34);tinyHalo(c,0,0,145+expand*95,.26*tail,0);c.restore();
 for(let k=0;k<8;k++){
  const a=-Math.PI*(.09+.82*rand(k,950+index)),length=(22+rand(k,951+index)*110)*(1+.7*expand);
  c.save();c.translate(x,y);c.rotate(a);
  axialLight(c,pool,length,0,length,3+bright*5,(.28*bright+.18*tail),1);c.restore();
 }
 // Finite, curved light slivers expand and fade after the white impulse.
 for(let k=0;k<11;k++){
  const seconds=(age+18)/1000,theta=-Math.PI*(.04+.92*rand(k,962+index)),speed=120+rand(k,963+index)*380;
  const r=16+seconds*speed,xx=x+Math.cos(theta)*r,yy=y+Math.sin(theta)*r+115*seconds*seconds;
  const a=tail*(.18+.30*rand(k,964+index));
  c.strokeStyle=`rgba(255,235,183,${a})`;c.lineWidth=1+rand(k,965)*1.5;
  c.beginPath();c.moveTo(xx,yy);c.quadraticCurveTo(xx-Math.cos(theta)*25,yy-Math.sin(theta)*20-9,xx-Math.cos(theta)*48,yy-Math.sin(theta)*32);c.stroke();
 }
 c.restore();
}
function hitParticles(c,t,p,index){
 const age=t-HIT-VISUAL_HIT_OFFSETS[index%3];if(age<0||t>=END)return;
 const tail=1-ease(10000+index*30,END,t),pool=sprites(c),x=p.x,y=p.y-68;
 c.save();c.globalCompositeOperation='source-over';tinyHalo(c,x,y,78,.36*Math.exp(-age/145)*tail,1);tinyHalo(c,x,y,26,.72*Math.exp(-age/100)*tail,2);
 for(let i=0;i<COUNTS.hit;i++){
  // A finite initial radius makes the exact hit frame readable, with no pre-hit.
  const delay=i<108?0:rand(i,510+index)*115,seconds=(age+12-delay)/1000,life=.30+.46*rand(i,511+index);
  if(seconds<0||seconds>=life)continue;
  const angle=-Math.PI*(.025+.95*rand(i,512+index)),speed=170+710*rand(i,513+index),initial=i<108?6+17*rand(i,514+index):0;
  const vx=Math.cos(angle)*speed,vy=Math.sin(angle)*speed,xx=x+Math.cos(angle)*initial+vx*seconds,yy=y+Math.sin(angle)*initial+vy*seconds+230*seconds*seconds;
  const alpha=Math.pow(1-seconds/life,1.5)*tail*(.35+.54*rand(i,515+index)),size=.65+1.3*rand(i,516+index);
  if(i%7===0){c.save();c.translate(xx,yy);c.rotate(Math.atan2(vy+460*seconds,vx));axialSpeck(c,pool,0,0,size,alpha,i%3,5+11*rand(i,517));c.restore();}
  else dot(c,pool,xx,yy,size,alpha,i%3);
 }
 for(let i=0;i<COUNTS.ground;i++){
  const seconds=(age+8-rand(i,550+index)*70)/1000,life=.42+.3*rand(i,551+index);if(seconds<0||seconds>=life)continue;
  const angle=i*2.39996,r=12+seconds*(110+330*rand(i,552+index));
  dot(c,pool,p.x+Math.cos(angle)*r,p.y+Math.sin(angle)*r*.25-seconds*(8+42*rand(i,553+index)),.5+rand(i,554),(.12+.30*rand(i,555))*(1-seconds/life)*tail,i%3);
 }c.restore();
}
function groupParticles(c,t){
 const age=t-HIT;if(age<0||age>850)return;const pool=sprites(c);
 c.save();c.globalCompositeOperation='source-over';
 for(let i=0;i<COUNTS.group;i++){
  const seconds=(age+8-rand(i,610)*38)/1000,life=.38+.37*rand(i,611);if(seconds<0||seconds>=life)continue;
  const angle=-Math.PI*rand(i,612),speed=300+650*rand(i,613);
  dot(c,pool,600+Math.cos(angle)*speed*seconds,680+Math.sin(angle)*speed*seconds+150*seconds*seconds,.65+rand(i,614),(1-seconds/life)*(.20+.42*rand(i,615)),i%3);
 }c.restore();
}
function draw(c,t,o={}){
 if(t<LEAD||t>=END)return;const s=state(t,o),targets=o.targets||TARGETS;
 c.save();contraction(c,t,s);
 if(o.sequence){o.sequence.draw(c,t,{...o,targets});if(s.strength>0)palmMuzzle(c,t,s);c.restore();return;}
 // Enemy silhouettes are restored before all three foreground shafts.
 // Local lighting stays soft enough to retain their material and damage text.
 if(t>=HIT){
  if(typeof o.drawEnemyForeground==='function')o.drawEnemyForeground(c,t);
 }
 if(s.strength>0){
  c.save();c.globalCompositeOperation='screen';
  for(const p of targets){
   const local=s.strength*s.grow*(1-ease(RELEASE,END,t));
   tinyHalo(c,p.x,p.y-145,220,local*.14,1);
   c.save();c.translate(p.x,p.y+5);c.scale(1,.23);tinyHalo(c,0,0,250,local*.26,1);c.restore();
  }
  c.restore();
 }
 branches(c,t,targets);
 if(t>=HIT){
  targets.forEach((p,i)=>shockRings(c,t,p,i));
  targets.forEach((p,i)=>layeredBurst(c,t,p,i));
  targets.forEach((p,i)=>hitParticles(c,t,p,i));groupParticles(c,t);
 }
 if(s.strength>0){beamBody(c,t,s.palm,s.end,s.strength,s.grow);palmMuzzle(c,t,s);}
 c.restore();
}
function flash(t){return 0;}
function camera(t){
 if(t<LEAD||t>=END)return{x:0,y:0,scale:1};const age=t-HIT;
 if(age<0){const tension=ease(LEAD,HIT,t);return{x:Math.sin(t*.079)*tension*1.5,y:Math.cos(t*.087)*tension,scale:1+.006*ease(START,HIT,t)};}
 const fall=1-ease(10000,10400,t),kick=Math.exp(-age/175)*fall;
 return{x:(-10+2*Math.sin(age*.103))*kick,y:Math.cos(age*.137)*8*kick,scale:1+.045*kick};
}
function inspect(t,o={}){
 const s=state(t,o),targets=o.targets||TARGETS;
 return{timeMs:t,sceneTimeMs:t,timeInput:'scene-time; no second freeze',beamActive:s.strength>.001,
  contractionRangeMs:[LEAD,START],beamStartMs:START,beamFullWidthMs:START+50,hitMs:HIT,beamEndMs:END,beamGrow:s.grow,beamHead:s.head,beamOrigin:s.palm,beamEnd:s.end,beamOpacity:s.strength,beamWidthScale:s.widthScale,
  beamOuterWidthPx:{nominal:296,axisWander:0},beamWhiteCoreWidthPx:116,beamWhiteCoreWidthFraction:116/296,beamWhiteCoreConstruction:'pure continuous filled white-platinum core with a feathered pale-gold halo',denseParticleCoreWidthFraction:0,denseParticleCoreLayers:0,beamMaterial:'continuous white-platinum light with long axial motion-blurred streaks; no particle field',particlePalette:PALETTE,particleCounts:COUNTS,particleComposite:'source-over continuous volume, screen pressure packets and elongated light trails, sparse peripheral sparks only',particleAxialSpeedPxPerSecond:[1900,3100],particleNominalSizePx:[.65,1.3],axialLightTrails:{main:40,pillar:12,lengthPx:[170,420],speedPxPerSecond:[1650,3550],blurLayers:2},filledBeamSurfaces:2,softPressurePackets:{main:32,pillar:18},paintedBurstSheets:0,beamTextureOpacity:0,paintedGoldAtlasUsed:false,paintedWhiteAtlasUsed:false,thunderAtlasUsed:false,
  palmMuzzle:'localized white-platinum release flash with sparse sparks',impactLayers:['local white-platinum flare','two layered white-platinum shock rings','sparse ballistic sparks','three straight continuous white-platinum pillars'],staggeredTargetHitsMs:HIT_OFFSETS.map(x=>HIT+x),visualTargetHitsMs:VISUAL_HIT_OFFSETS.map(x=>HIT+x),exactHitOnsetVisible:true,
  pillars:targets.map((p,i)=>({...pillarGeometry(p),birthMs:PILLAR_STARTS[i%3],groundContactMs:HIT,grow:ease(PILLAR_STARTS[i%3],HIT,t),active:t>=PILLAR_STARTS[i%3]&&t<END})),pillarCenterlineWanderPx:0,pillarTiltDegrees:0,pillarNominalWidthPx:132,pillarWhiteCoreWidthPx:48,shockwaveCountPerTarget:2,shockRingWidthPx:{sharp:[1.1,3.6],softHalo:[8,18.4]},impactAgeMs:t-HIT,
  flashAlpha:flash(t),flashFramesAt30fps:0,flashPeakAlpha:0,impactExposure:'local white-platinum shafts and shockwaves; no full-screen overlay',cameraMaximumShakePx:12,cameraPeakScale:1.045,freezeRangeMs:[9466.6667,9533.3334],animation:'continuous optical volume with deterministic axial light advection and sparse ballistic sparks'};
}
const api={draw,time,flash,camera,inspect,targets:TARGETS};G.HA_IMPACT=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);

/* 1080P floating white light motes. Code-native particles, no bitmap edits. */
(function(root){
'use strict';
const TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,q)=>a+(b-a)*q;
const frac=x=>x-Math.floor(x);
const rnd=(i,k=0)=>frac(Math.sin(i*127.1+k*311.7+42.63)*43758.5453123);
const normal=(i,k)=>Math.sqrt(-2*Math.log(Math.max(.0001,rnd(i,k))))*Math.cos(TAU*rnd(i,k+1));
function create(opts={}){
 const point=opts.point;if(typeof point!=='function')throw new Error('HA_PARTICLES requires projected array point()');
 const angles=opts.angles||Array.from({length:6},(_,i)=>-Math.PI/2+i*TAU/6);
 const starRadius=opts.starRadius||620;
 // Unequal loose clouds with broad empty spaces. Only a very small collision
 // exclusion is used, never a blue-noise/Poisson grid that fills every gap.
 const clouds=[
  {x:245,y:265,sx:155,sy:105}, {x:850,y:235,sx:185,sy:95},
  {x:1515,y:300,sx:175,sy:135}, {x:460,y:785,sx:185,sy:130},
  {x:1250,y:795,sx:210,sy:125}, {x:1680,y:650,sx:100,sy:105}
 ];
 const ranks=Array.from({length:92},(_,id)=>({id,r:rnd(id,504)})).sort((a,b)=>a.r-b.r);
 const band=new Map(ranks.map(({id},r)=>[id,r<46?'small':r<74?'medium':'large']));
 const particles=[];
 function driftRaw(p,seconds){
  const a=seconds*TAU/p.swayPeriod+p.phase;
  return {
   x:p.sway*Math.sin(a)+p.eddy*Math.sin(a*1.71+p.eddyPhase),
   y:-p.rise*seconds+p.bob*Math.cos(a+.06*Math.sin(a*.63+p.eddyPhase))
      +p.eddy*.7*Math.sin(a*1.37+p.eddyPhase)
  };
 }
 function makeMotion(i){
  // A slow rising centre carries a gently curling, aperiodically modulated
  // trajectory. The vertical curl keeps motes moving when lateral sway turns.
  // Candidate trajectories are measured, not inferred, at 0.2 s intervals.
  for(let attempt=0;attempt<300;attempt++){
   const k=i*301+attempt;
   const p={phase:rnd(k,10)*TAU,sway:40+rnd(k,11)*20,
    swayPeriod:2.6+rnd(k,12)*.9,bob:43+rnd(k,13)*13,
    rise:10+rnd(k,14)*20,eddy:2+rnd(k,15)*2.5,eddyPhase:rnd(k,16)*TAU};
   let minimum=Infinity,maximum=0;
   for(let s=0;s<=5.4;s+=.025){
    const a=driftRaw(p,s),b=driftRaw(p,s+.2),d=Math.hypot(b.x-a.x,b.y-a.y);
    minimum=Math.min(minimum,d);maximum=Math.max(maximum,d);
   }
   if(minimum>=10.5&&maximum<=29.5)return{...p,driftMin200:minimum,driftMax200:maximum};
  }
  throw new Error('Unable to produce continuous 10–30px / 0.2s drift for mote '+i);
 }
 for(let id=0;id<92;id++){
  const sizeBand=band.get(id),diameter=sizeBand==='small'?5+rnd(id,1)*2:sizeBand==='medium'?9+rnd(id,1)*3:15+rnd(id,1)*5;
  let spot;
  for(let attempt=0;attempt<700;attempt++){
   const k=id*701+attempt,cluster=id<70;
   const c=clouds[Math.floor(rnd(k,41)*clouds.length)];
   const v=cluster?{x:c.x+normal(k,42)*c.sx,y:c.y+normal(k,44)*c.sy}:{x:100+rnd(k,46)*1720,y:105+rnd(k,47)*850};
   if(v.x<100||v.x>1820||v.y<110||v.y>970)continue;
   if(particles.every(p=>Math.hypot(p.anchorX-v.x,p.anchorY-v.y)>(p.diameter+diameter)*.65+8)){spot=v;break;}
  }
  if(!spot)throw new Error('Cluster placement failed');
  const motion=makeMotion(id),offsetAtAnchor=driftRaw(motion,2);
  particles.push({id,sizeBand,diameter,radius:diameter/2,haloRadius:diameter*3,
   strands:6+Math.floor(rnd(id,2)*3),onset:id<4?1000+id*55:1220+(id-4)*13.4,
   anchorX:spot.x,anchorY:spot.y,x:spot.x-offsetAtAnchor.x,y:spot.y-offsetAtAnchor.y,
   ...motion,breathPeriod:1+rnd(id,3)*1.5,breathPhase:rnd(id,4)*TAU,
   glowStrength:.75+rnd(id,5)*.25,hairPhase:rnd(id,6)*TAU,
   gather:-1,gatherStart:0,gatherDuration:0});
 }
 function drift(p,t){const v=driftRaw(p,t/1000);return{x:p.x+v.x,y:p.y+v.y};}
 const used=new Set();
 for(let node=0;node<6;node++){
  const target=point(angles[node],starRadius,2500);
  const candidates=particles.filter(p=>!used.has(p.id)).map(p=>{const v=drift(p,2500);return{p,d:Math.hypot(v.x-target.x,v.y-target.y)};}).sort((a,b)=>a.d-b.d);
  for(const [j,{p,d}]of candidates.slice(0,6).entries()){
   used.add(p.id);p.gather=node;p.gatherStart=2500+j*41+node*7;p.gatherDuration=650+Math.min(600,d*.72);
  }
 }
 function state(p,t){
  const breath=.6+.4*(.5+.5*Math.sin(t*.001*TAU/p.breathPeriod+p.breathPhase));
  let v=drift(p,t),appearance=smooth((t-p.onset)/150),alpha=appearance*breath,q=0;
  if(p.gather>=0&&t>=p.gatherStart){
   q=clamp((t-p.gatherStart)/p.gatherDuration);const e=smooth(q),from=drift(p,p.gatherStart),to=point(angles[p.gather],starRadius,t);
   const arch=(p.id%2?-1:1)*Math.sin(q*Math.PI)*(18+rnd(p.id,18)*26);
   v={x:mix(from.x,to.x,e)+arch*.35,y:mix(from.y,to.y,e)-arch};
   alpha*=1-smooth((q-.87)/.13);
  }
  return{...v,alpha,breath,appearance,gatherProgress:q};
 }
 function glow(c,x,y,r,alpha,inner=0){
  const g=c.createRadialGradient(x,y,inner,x,y,r);
  g.addColorStop(0,'rgba(181,111,255,'+alpha+')');g.addColorStop(.25,'rgba(181,111,255,'+alpha*.58+')');g.addColorStop(.62,'rgba(181,111,255,'+alpha*.16+')');g.addColorStop(1,'rgba(181,111,255,0)');
  c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
 }
 function drawOne(c,p,s,t){
  if(s.alpha<.004)return;
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=s.alpha;
  glow(c,s.x,s.y,p.haloRadius,.60*p.glowStrength,p.radius*.6);
  c.save();c.translate(s.x,s.y);c.rotate(p.hairPhase+t*.00019);
  c.lineWidth=p.sizeBand==='large'?.9:.65;c.strokeStyle='rgba(181,111,255,.23)';
  for(let j=0;j<p.strands;j++){
   const a=j*TAU/p.strands+rnd(p.id,j+55)*.3,L=p.haloRadius*(.52+rnd(p.id,j+71)*.27);
   c.beginPath();c.moveTo(Math.cos(a)*p.radius*.8,Math.sin(a)*p.radius*.8);
   c.quadraticCurveTo(Math.cos(a+.22)*L*.56,Math.sin(a+.22)*L*.56,Math.cos(a+.04)*L,Math.sin(a+.04)*L);c.stroke();
  }
  c.restore();
  if(p.sizeBand==='large'){
   // Near-camera nuclei have feathered edges while retaining a bright centre.
   glow(c,s.x,s.y,p.radius*1.65,.48,p.radius*.55);
   const g=c.createRadialGradient(s.x,s.y,p.radius*.5,s.x,s.y,p.radius*1.16);
   g.addColorStop(0,'#d3b2ff');g.addColorStop(.58,'rgba(181,111,255,.98)');g.addColorStop(1,'rgba(181,111,255,0)');
   c.fillStyle=g;c.beginPath();c.arc(s.x,s.y,p.radius*1.16,0,TAU);c.fill();
  }else{c.fillStyle='#c69cff';c.beginPath();c.arc(s.x,s.y,p.radius,0,TAU);c.fill();}
  c.restore();
 }
 function draw(c,t,override){
  // Smaller, distant nuclei first; nearby, defocused nuclei cover them naturally.
  for(const size of ['small','medium','large'])for(const p of particles)if(p.sizeBand===size){const s=override?override(p,state(p,t),t):state(p,t);if(s)drawOne(c,p,s,t);}
 }
 function inspect(t){return particles.map(p=>({id:p.id,...state(p,t),sizeBand:p.sizeBand,coreDiameter:p.diameter,haloRadius:p.haloRadius,filaments:p.strands,upwardCentreSpeed:p.rise,swayAmplitude:p.sway,swayPeriod:p.swayPeriod,breathPeriod:p.breathPeriod,gatherNode:p.gather,driftMin200:p.driftMin200,driftMax200:p.driftMax200}));}
 const metadata={count:92,sizeBands:{small:46,medium:28,large:18},coreDiameterBands:{small:[5,7],medium:[9,12],large:[15,20]},floatingDisplacement200ms:{min:Math.min(...particles.map(p=>p.driftMin200)),max:Math.max(...particles.map(p=>p.driftMax200))},gatherCount:used.size,design:'Irregular clustered layout; softly modulated rising eddies; no wrap, no grid, no teleport.'};
 return{draw,inspect,metadata,particles,drift,state};
}
root.HA_PARTICLES={create};if(typeof module!=='undefined')module.exports=root.HA_PARTICLES;
})(typeof window!=='undefined'?window:globalThis);

(function(root){'use strict';
// The exact Stage 1/12-second dissolve GM_PARTICLES instance is injected here.
// The mote nuclei stay original; meteor tails, painted impacts and burn responses are added.
const SETTINGS={startMs:10500,dissolveMs:400,rainMs:2200,floatFraction:.40,closeStartMs:2200,endMs:3700,healNumber:150,launchSpreadMs:400,numberLifeMs:1000,fallPower:3.5,tailMs:95,tailMaxPx:140,hitMs:340,burnMs:1500};
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,q)=>a+(b-a)*q;
const smooth=q=>{q=clamp(q);return q*q*(3-2*q);};
const ease=(a,b,t)=>smooth((t-a)/(b-a)),frac=x=>x-Math.floor(x),rand=(i,s)=>frac(Math.sin(i*127.1+s*311.7)*43758.5453123);
function closingTime(t){if(t<=10500)return t;return t<=12700?10500:t-2200;}
function deityTime(t){return t<=10500?t:10500+1500*clamp((t-10500)/SETTINGS.dissolveMs);}
function create(A,{canvasFactory:cf,battle,motes,originalState}){
 if(!motes||!motes.particles||!originalState)throw Error('Inject the original dissolve particle instance');
 const IDS=()=>battle.enemies.map(u=>u.id),bodySamples=new Map(),routes=new Map();
 function targets(t){const positions=battle.enemyPositions(t);return IDS().map(id=>{const u=battle.enemies.find(u=>u.id===id),v=positions.find(u=>u.id===id);if(!u)throw Error('Meteor target missing: '+id);return{id,name:u.name,unit:u,x:v.x,y:v.y,height:u.height,angle:v.angle,head:{x:v.damageX,y:v.damageY-25}};});}
 function samples(target){
  if(bodySamples.has(target.id))return bodySamples.get(target.id);if(typeof module==='undefined' && root.HD_BODY_SAMPLES && root.HD_BODY_SAMPLES[target.id])return root.HD_BODY_SAMPLES[target.id];const u=target.unit,im=(target.id==='luochen'?A.battle_luochen_tuotian:u.img)||A.tuotianH,cv=cf(im.width,im.height),c=cv.getContext('2d');c.drawImage(im,0,0);const d=c.getImageData(0,0,im.width,im.height).data,list=[];
  for(let y=im.height*.15|0;y<im.height*.96;y+=5)for(let x=0;x<im.width;x+=5)if(d[(y*im.width+x)*4+3]>200)list.push({x:(x-u.footX)/u.naturalHeight*(u.flip?-1:1),y:(y-u.footY)/u.naturalHeight});
  bodySamples.set(target.id,list);return list;
 }
 // Paths are sampled by arc length: even the upward/downward turn keeps moving.
 function bezier(a,b,c,d,q){const v=1-q;return{x:v*v*v*a.x+3*v*v*q*b.x+3*v*q*q*c.x+q*q*q*d.x,y:v*v*v*a.y+3*v*v*q*b.y+3*v*q*q*c.y+q*q*q*d.y};}
 function curve(a,b,c,d,p,amplitude){const points=[],lengths=[0];let length=0,old;
  for(let i=0;i<=160;i++){const q=i/160,v=bezier(a,b,c,d,q),w=amplitude*Math.sin(Math.PI*q)*Math.sin(q*TAU*1.25+p.phase);v.x+=w;
   if(old){length+=Math.hypot(v.x-old.x,v.y-old.y);lengths.push(length);}points.push(v);old=v;
  }return{points,lengths,length};
 }
 function along(curve,q){const d=clamp(q)*curve.length;let lo=0,hi=160;while(hi-lo>1){const m=(lo+hi)>>1;if(curve.lengths[m]<d)lo=m;else hi=m;}const f=(d-curve.lengths[lo])/Math.max(.001,curve.lengths[hi]-curve.lengths[lo]);return{x:mix(curve.points[lo].x,curve.points[hi].x,f),y:mix(curve.points[lo].y,curve.points[hi].y,f)};}
 function route(p){
  if(routes.has(p.id))return routes.get(p.id);
  const delay=SETTINGS.launchSpreadMs*rand(p.id,410),speedFactor=.7+.6*rand(p.id,411),life=Math.min(1750/speedFactor,2050+150*rand(p.id,412)-delay);
  const origin=originalState(p,10500+1500*rand(p.id,83)*.58),sign=rand(p.id,413)>.5?1:-1;
  const loftEnd={x:origin.x+sign*(24+rand(p.id,414)*18),y:origin.y+8+rand(p.id,415)*12};
  const loft=curve(origin,{x:origin.x+sign*10,y:origin.y-14-rand(p.id,416)*7},{x:loftEnd.x-sign*8,y:origin.y-8},loftEnd,p,3);
  const ts=targets(10500),first=p.id%ts.length;let chosen;
  for(let k=0;k<ts.length;k++){const target=ts[(first+k)%ts.length],valid=samples(target).filter(a=>target.y+a.y*target.height>loftEnd.y+65);if(!valid.length)continue;const local=valid[Math.floor(rand(p.id,422)*valid.length)];chosen={target:target.id,local};break;}
  if(!chosen){const tg=ts[first],sm=samples(tg);chosen={target:tg.id,local:sm[Math.floor(rand(p.id,422)*sm.length)]||{x:0,y:-.5}};}
  const r={...chosen,delay,speedFactor,life,arrival:delay+life,origin,loftEnd,loft,sign};routes.set(p.id,r);return r;
 }
 function fallCurve(p,r,target){const end={x:target.x+r.local.x*target.height,y:target.y+r.local.y*target.height};
  const key=end.x+','+end.y;if(r.fallKey!==key){r.fallKey=key;r.fall=curve(r.loftEnd,{x:r.loftEnd.x+r.sign*18,y:r.loftEnd.y+38},{x:mix(r.loftEnd.x,end.x,.64),y:mix(r.loftEnd.y,end.y,.49)},end,p,4);}
  return r.fall;
 }
 function initialize(){for(const p of motes.particles)route(p);}
 function progress(p,t){const r=route(p);return clamp((t-10500-r.delay)/r.life);}
 function position(p,t,ts=targets(t)){
  const r=route(p),u=progress(p,t);if(u<=.4){const q=u/.4;return along(r.loft,.7*q+.3*q*q);}
  const fall=fallCurve(p,r,ts.find(v=>v.id===r.target)),q=(u-.4)/.6;
  // Match the speed at the loft/fall join, then accelerate toward contact.
  const k=clamp(1.3*r.loft.length*.6/(.4*fall.length),.035,.95);
  return along(fall,k*q+(1-k)*Math.pow(q,SETTINGS.fallPower));
 }
 function appearance(p,t){const r=route(p),age=t-10500-r.delay;if(age<0||age>=r.life-1e-6)return 0;
  const born=ease(0,120,age),breath=.6+.4*Math.sin(t*.003+p.phase)**2,near=ease(.65,1,age/r.life);
  return Math.min(1,born*breath*(1+.18*near));
 }
 function state(p,t){return{...position(p,t),alpha:appearance(p,t)};}
 function hitPoint(p,t){const r=route(p),target=targets(t).find(v=>v.id===r.target),dx=r.local.x*target.height,dy=r.local.y*target.height;return{x:target.x+dx*Math.cos(target.angle)-dy*Math.sin(target.angle),y:target.y+dx*Math.sin(target.angle)+dy*Math.cos(target.angle)};}
 const hitSprites=new Map();
 function hitSprite(n){if(hitSprites.has(n))return hitSprites.get(n);const im=A['meteor_hit_'+n];if(!im)return null;const cv=cf(im.width,im.height),c=cv.getContext('2d');c.drawImage(im,0,0);c.globalCompositeOperation='destination-in';const g=c.createLinearGradient(0,0,im.width,0);g.addColorStop(0,'#fff0');g.addColorStop(.05,'#ffff');g.addColorStop(.95,'#ffff');g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(0,0,im.width,im.height);const h=c.createLinearGradient(0,0,0,im.height);h.addColorStop(0,'#fff0');h.addColorStop(.05,'#ffff');h.addColorStop(.95,'#ffff');h.addColorStop(1,'#fff0');c.fillStyle=h;c.fillRect(0,0,im.width,im.height);hitSprites.set(n,cv);return cv;}
 function paintedHit(c,frame,x,y,d,alpha,turn=0){const lo=Math.floor(frame),z=frame-lo;c.save();c.translate(x,y);c.rotate(turn);c.globalCompositeOperation='source-over';for(const [n,a]of [[lo,1-z],[Math.min(5,lo+1),z]]){const im=hitSprite(n);if(!im||a<=0)continue;c.globalAlpha=alpha*a;c.drawImage(im,-d/2,-d/2,d,d);}c.restore();}
 function reaction(u,t){if(t<10500||u.side!=='enemy')return null;let kick=0,shake=0,flash=0;for(const p of motes.particles){const r=route(p);if(r.target!==u.id)continue;const age=t-10500-r.arrival;if(age<0||age>220)continue;kick+=Math.sin(Math.PI*clamp(age/180))*Math.exp(-age/110);shake+=Math.sin(age*.13+p.id)*Math.exp(-age/85);flash=Math.max(flash,.43*Math.exp(-age/75));}return{x:-Math.min(14,kick*9)+clamp(shake,-1,1)*2,y:-Math.min(3,kick*2),angle:-Math.min(.028,kick*.014),flash};}
 function draw(c,t){if(t<=10500||t>=14200)return;initialize();
  if(t<12700){for(const p of motes.particles){const now=state(p,t),near=ease(.48,1,progress(p,t));if(!now.alpha||near<=0)continue;const r=route(p),pts=[];
    for(let j=8;j>=0;j--){const at=Math.max(10500+r.delay,t-SETTINGS.tailMs*j/8),old=position(p,at),dx=old.x-now.x,dy=old.y-now.y,len=Math.hypot(dx,dy),cap=Math.min(1,SETTINGS.tailMaxPx/Math.max(1,len));pts.push({x:now.x+dx*cap,y:now.y+dy*cap});}
    c.save();c.lineCap='round';c.lineJoin='round';const line=()=>{c.beginPath();pts.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));};
    c.globalCompositeOperation='source-over';c.strokeStyle='rgba(12,1,25,'+(.32*near*now.alpha)+')';c.lineWidth=p.diameter*.5;line();c.stroke();
    c.globalCompositeOperation='screen';for(const [w,a,color]of [[p.diameter*1.5,.18,'111,24,201'],[p.diameter*.54,.65,'159,61,248'],[Math.max(1,p.diameter*.16),.85,'222,162,255']]){const g=c.createLinearGradient(pts[0].x,pts[0].y,now.x,now.y);g.addColorStop(0,'rgba('+color+',0)');g.addColorStop(.55,'rgba('+color+','+(a*near*now.alpha*.5)+')');g.addColorStop(1,'rgba('+color+','+(a*near*now.alpha)+')');c.strokeStyle=g;c.lineWidth=w;line();c.stroke();}c.restore();
   }motes.draw(c,t,p=>state(p,t));}
  for(const target of targets(t)){const arrivals=motes.particles.map(p=>({p,r:route(p)})).filter(e=>e.r.target===target.id),active=arrivals.filter(e=>t-10500-e.r.arrival>=0&&t-10500-e.r.arrival<SETTINGS.burnMs);
   if(active.length){const last=Math.max(...active.map(e=>10500+e.r.arrival)),a=ease(0,130,t-(10500+Math.min(...active.map(e=>e.r.arrival))))*(1-ease(1100,1500,t-last));for(let k=0;k<2;k++){const x=target.x+(k?35:-36),y=target.y-target.height*(k?.40:.63),f=3.2+.6*(.5+.5*Math.sin(t*.008+k*2));paintedHit(c,f,x,y,target.height*(k?.55:.65),(.26+.08*Math.sin(t*.011+k)**2)*a);}}
  }
  for(const p of motes.particles){const r=route(p),age=t-10500-r.arrival;if(age<0||age>=SETTINGS.hitMs)continue;const v=hitPoint(p,t),q=clamp(age/SETTINGS.hitMs),d=65+p.diameter*4.2;paintedHit(c,q*5,v.x,v.y,d,.78*(1-ease(.8,1,q)),(rand(p.id,809)-.5)*.6);}
 }
 function firstArrivals(){initialize();return Object.fromEntries(IDS().map(id=>[id,Math.min(...[...routes.values()].filter(r=>r.target===id).map(r=>r.arrival))]));}

 function drawNumbers(c,t){const first=firstArrivals();for(const target of targets(t)){const age=t-SETTINGS.startMs-first[target.id];if(age<0||age>=SETTINGS.numberLifeMs)continue;
  const fade=1-ease(750,1000,age),rise=70*clamp(age/1000),pop=1+.32*Math.exp(-age/140),shake=Math.sin(age*.13)*6*Math.exp(-age/120);
  c.save();c.globalAlpha=fade;c.globalCompositeOperation='source-over';c.translate(target.head.x+shake,target.head.y-48-rise);c.scale(pop,pop);c.font='900 76px CN, "PingFang SC", sans-serif';c.textAlign='center';c.lineJoin='round';c.shadowColor='#090113';c.shadowBlur=9;c.lineWidth=15;c.strokeStyle='#170322';c.strokeText('-'+SETTINGS.healNumber,0,0);c.lineWidth=6;c.strokeStyle='#eccaff';c.strokeText('-'+SETTINGS.healNumber,0,0);c.shadowBlur=0;c.fillStyle='#501b7b';c.fillText('-'+SETTINGS.healNumber,0,0);c.restore();}}
 function inspect(t){const e=t-10500,first=firstArrivals();return{active:e>0&&e<=3700,elapsedMs:e,phase:e<0?'unchanged':e<900?'错开起步、浮动':e<2200?'加速流星、紫黑爆焰':e<3700?'残焰灼烧、黑日收势':'结束',targets:targets(t).map(({unit,...v})=>v),particleCount:motes.particles.length,originalParticleInstance:true,appearanceSource:'Original nuclei + accelerating dark-purple meteor trails + imagegen six-frame impacts',rainWindowMs:[10500,12700],numberWindowsMs:Object.fromEntries(IDS().map(id=>[id,[10500+first[id],11500+first[id]]])),numbersValue:SETTINGS.healNumber,bitmapMotesUsed:0,paintedHitFrames:6,burnDurationMs:SETTINGS.burnMs,tailMaxPx:SETTINGS.tailMaxPx,fallExponent:SETTINGS.fallPower};}
 return{reset(){bodySamples.clear();routes.clear();},draw,drawNumbers,inspect,targets,initialize,position,state,appearance,originalState,originalMotes:motes,debugParticles:()=>motes.particles,route,firstArrivals,reaction,hitPoint};
}

const api={create,SETTINGS,closingTime,deityTime};root.HD_RAIN=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

(function (G) {
'use strict';
// Dark-god atmospheric pressure and impact depth. All times are CORE/local ms.
// This module never changes the rig, sun path, portrait, damage, or scene clock.
const W=1920,H=1080,TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,q)=>a+(b-a)*q;
const ease=(a,b,t)=>{const q=clamp((t-a)/(b-a));return q*q*(3-2*q);};
const frac=x=>x-Math.floor(x),rnd=(i,k=0)=>frac(Math.sin(i*127.1+k*311.7)*43758.5453);
const SETTINGS={skyPressure:.35,smokeInflow:.52,floatingStoneCount:31,impactCore:.83,shockwaveStrength:.84,groundScarMs:11800};
function create(A,{canvasFactory:cf}){
 const snapshot=cf(W,H),snap=snapshot.getContext('2d');
 const darkSmoke=[],smoke=[];
 for(let i=0;i<8;i++){
  const im=A['intro_smoke_'+i];if(!im)continue;
  // Preserve the hand-painted smoke's actual alpha, curl and volume, only removing its light.
  const cv=cf(im.width,im.height),cc=cv.getContext('2d');cc.drawImage(im,0,0);cc.globalCompositeOperation='source-in';cc.fillStyle='#05030b';cc.fillRect(0,0,cv.width,cv.height);
  darkSmoke.push(cv);smoke.push(im);
 }
 const rocks=Array.from({length:SETTINGS.floatingStoneCount},(_,i)=>({x:110+rnd(i,13)*880,y:700+rnd(i,17)*270,d:3+rnd(i,19)*10,ang:rnd(i,21)*TAU,seed:i}));
 const debris=Array.from({length:24},(_,i)=>({a:rnd(i,51)*TAU,r:90+rnd(i,52)*330,d:3+rnd(i,54)*8,h:20+rnd(i,55)*150,seed:i}));
 function texture(c,list,phase,x,y,w,h,a,turn=0){
  if(!list.length||a<=.001)return;const z=frac(phase/list.length)*list.length,k=Math.floor(z),f=z-k;
  c.save();c.translate(x,y);c.rotate(turn);c.globalCompositeOperation='source-over';
  for(const [j,weight] of [[k,1-f],[(k+1)%list.length,f]]){c.globalAlpha=a*weight;c.drawImage(list[j],-w/2,-h/2,w,h);}c.restore();
 }
 function glow(c,x,y,rx,ry,a,colour='132,63,213',mode='screen'){
  if(a<=0)return;c.save();c.translate(x,y);c.scale(1,ry/rx);c.globalCompositeOperation=mode;
  const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(${colour},${a})`);g.addColorStop(.36,`rgba(${colour},${a*.48})`);g.addColorStop(.75,`rgba(${colour},${a*.12})`);g.addColorStop(1,`rgba(${colour},0)`);c.fillStyle=g;c.fillRect(-rx,-rx,rx*2,rx*2);c.restore();
 }
 function stone(c,x,y,d,turn,a,lit=.3){
  c.save();c.translate(x,y);c.rotate(turn);c.globalAlpha=a;
  c.fillStyle='#17131e';c.beginPath();c.moveTo(-d,-d*.38);c.lineTo(-d*.29,-d*.8);c.lineTo(d*.83,-d*.57);c.lineTo(d,d*.29);c.lineTo(d*.18,d*.75);c.lineTo(-d*.76,d*.45);c.closePath();c.fill();
  c.fillStyle=`rgba(151,126,175,${lit})`;c.beginPath();c.moveTo(-d,-d*.38);c.lineTo(-d*.29,-d*.8);c.lineTo(d*.83,-d*.57);c.lineTo(d*.06,-d*.09);c.closePath();c.fill();
  c.fillStyle='rgba(1,0,5,.65)';c.beginPath();c.moveTo(d*.06,-d*.09);c.lineTo(d*.83,-d*.57);c.lineTo(d,d*.29);c.lineTo(d*.18,d*.75);c.closePath();c.fill();c.restore();
 }
 function environment(c,t,sunState,enemyPositions){
  const appear=ease(6900,7400,t),release=1-ease(9300,9520,t),a=appear*release;if(a<.001)return;
  const q=ease(7000,8900,t),s=sunState||{x:1122,y:160,diameter:mix(93,280,q)},cx=s.x,cy=s.y;
  c.save();
  // Three off-centre shadow volumes creep over the sky. The central god is drawn later.
  glow(c,445,120,690+q*220,410+q*90,a*q*SETTINGS.skyPressure,'1,0,7','source-over');
  glow(c,1655,95,650+q*160,310+q*110,a*q*.26,'2,0,9','source-over');
  glow(c,1050,-80,720,310,a*q*.30,'0,0,3','source-over');
  // Layered painted smoke curls inward instead of stationary lines or orbit rings.
  for(let i=0;i<15;i++){
   const phase=frac(t/(2900+rnd(i,33)*1300)+rnd(i,35)),travel=phase*phase*(3-2*phase),angle=i*2.39996;
   const sx=960+Math.cos(angle)*(810+rnd(i,37)*360),sy=145+Math.sin(angle)*(190+rnd(i,39)*125);
   const curl=Math.sin(Math.PI*phase)*(80+rnd(i,41)*145),x=mix(sx,cx,travel)+Math.cos(angle+phase*3)*curl,y=mix(sy,cy,travel)+Math.sin(angle+phase*3)*curl*.40;
   const d=(170+rnd(i,43)*190)*(1-.47*travel),opacity=a*(.35+.65*q)*Math.sin(Math.PI*phase);
   texture(c,darkSmoke,t/137+i*.61,x,y,d*1.5,d*.8,opacity*SETTINGS.smokeInflow,angle+phase*.8);
   texture(c,smoke,t/137+i*.61,x,y,d*1.5,d*.8,opacity*.095,angle+phase*.8);
  }
  // A small number of ground stones and soot wisps establish a physical pull.
  for(const r of rocks){const local=ease(7000+rnd(r.seed,65)*650,8900,t),height=local*(13+rnd(r.seed,67)*41),x=r.x+Math.sin(t*.0032+r.seed)*local*5,y=r.y-height+Math.sin(t*.004+r.seed)*local*2;
   c.save();c.globalAlpha=a*local*.3;c.fillStyle='#09050d';c.beginPath();c.ellipse(r.x,r.y,r.d*1.5,r.d*.4,0,0,TAU);c.fill();c.restore();stone(c,x,y,r.d,r.ang+Math.sin(t*.0017+r.seed)*local*.4,a*local,.25+q*.12);
  }
  const en=Array.isArray(enemyPositions)?enemyPositions:[];
  for(let i=0;i<9;i++){
   const e=en.length?en[i%en.length]:null,ex=e?e.x:180+(i%3)*300,ey=e?e.y:830;
   const u=frac(t/(1750+rnd(i,81)*650)+rnd(i,83)),v=u*u,px=mix(ex,cx,v)+Math.sin(Math.PI*u)*(110-rnd(i,85)*180),py=mix(ey-45,cy,v)-Math.sin(Math.PI*u)*155;
   const d=(62+rnd(i,87)*55)*(1-.35*u);texture(c,darkSmoke,t/123+i,px,py,d*1.45,d*.85,a*q*.37*Math.sin(Math.PI*u),-.8-u*.7);
  }
  c.restore();
 }
 function craterPath(c,x,y,rx,ry,seed=0){
  c.beginPath();for(let j=0;j<=80;j++){const a=j/80*TAU,r=1+.032*Math.sin(a*11+seed)+.018*Math.sin(a*23+1.3),px=x+Math.cos(a)*rx*r,py=y+Math.sin(a)*ry*r;j?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();
 }
 function impactBack(c,t){
  const age=t-9300;if(age<0||t>SETTINGS.groundScarMs)return;
  const cx=735,cy=810,arrival=.65+.35*ease(0,65,age),fade=1-ease(10800,SETTINGS.groundScarMs,t),pull=1-ease(60,205,age),rx=mix(180,285,ease(0,170,age)),ry=rx*.28;
  c.save();
  // A genuine dark centre survives the existing luminous blast; a rough feathered lip gives depth.
  glow(c,cx,cy,rx*1.47,ry*1.7,.58*fade*arrival,'1,0,5','source-over');
  c.save();craterPath(c,cx,cy,rx,ry,2);c.clip();
  const g=c.createRadialGradient(cx,cy-15,0,cx,cy,rx);g.addColorStop(0,`rgba(0,0,2,${SETTINGS.impactCore*fade})`);g.addColorStop(.66,`rgba(3,1,11,${.88*fade})`);g.addColorStop(1,'rgba(16,4,30,0)');c.fillStyle=g;c.fillRect(cx-rx*1.1,cy-ry*1.3,rx*2.2,ry*2.6);
  for(let i=0;i<5;i++)texture(c,darkSmoke,t/127+i*.71,cx+Math.sin(i*3.1)*rx*.55,cy+Math.cos(i*4.1)*ry*.4,rx*.85,ry*1.8,fade*.52,i);
  c.restore();
  // Near-ground dust falls inward for 0.2 s, while the original impact begins immediately.
  for(let i=0;i<16;i++){const angle=i*2.39996,rr=190+rnd(i,91)*255,p=ease(0,200,age),x=cx+Math.cos(angle)*rr*(1-p*.79),y=cy+Math.sin(angle)*rr*.30*(1-p*.79);if(pull>.001){texture(c,darkSmoke,t/110+i,x,y,80+rr*.18,38+rr*.07,pull*.58,angle);stone(c,x,y,4+rnd(i,93)*8,angle+p*2,pull,.5);}}
  // Restrained crooked fissures, never a bright uniform glyph circle.
  if(age>90&&age<1400){c.save();c.globalCompositeOperation='screen';c.globalAlpha=fade*(1-ease(800,1400,age));for(let k=0;k<7;k++){const angle=k*TAU/7+.13*Math.sin(k),len=140+rnd(k,97)*160;c.beginPath();for(let j=0;j<5;j++){const d=rx*.7+j*len/4,x=cx+Math.cos(angle)*d,y=cy+Math.sin(angle)*d*.31+Math.sin(j*3+k)*7;j?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle='rgba(104,39,178,.25)';c.lineWidth=7;c.stroke();c.strokeStyle='rgba(186,126,238,.58)';c.lineWidth=1.5;c.stroke();}c.restore();}
  c.restore();
 }
 function refractGround(c,cx,cy,rx,ry,amount){
  if(!c.canvas||rx<45)return;snap.setTransform(1,0,0,1,0,0);snap.globalAlpha=1;snap.globalCompositeOperation='copy';snap.drawImage(c.canvas,0,0,W,H);
  c.save();c.beginPath();c.rect(0,610,W,450);c.clip();c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,TAU);c.ellipse(cx,cy,rx*.80,ry*.74,0,0,TAU,true);c.clip('evenodd');c.globalAlpha=amount;c.translate(cx,cy);c.scale(1.018,1.032);c.drawImage(snapshot,-cx,-cy);c.restore();
 }
 function impactFront(c,t){
  const age=t-9300;if(age<0||age>1700)return;
  const cx=735,cy=810,exp=ease(65,900,age),fade=1-ease(550,1400,age),r=mix(120,1110,exp),ry=r*.245;
  c.save();
  // Keep the impact's aperture dark even when the pre-existing wave is drawn above the crater.
  // It is confined below the enemies' faces and all number layers are drawn afterwards.
  const voidAlpha=(1-ease(290,690,age))*.64;
  if(voidAlpha>.001){
   glow(c,cx,cy,220,74,voidAlpha,'1,0,5','source-over');
   for(let i=0;i<3;i++)texture(c,darkSmoke,t/120+i*.9,cx+Math.sin(i*4.3)*80,cy+Math.cos(i*2.7)*12,210,93,voidAlpha*.55,i*.8);
  }
  // Lens displacement is confined to the battlefield floor, never the head or HUD.
  if(age>65&&age<1100)refractGround(c,cx,cy,r,ry,fade*.53);
  // Real painted smoke breaks the broad wave into thick irregular, receding plumes.
  if(age>65){
   for(let i=0;i<22;i++){const a=i*TAU/22+.035*Math.sin(i*4.3),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*ry,depth=.7+.3*Math.sin(a),w=(95+rnd(i,101)*65)*(1+exp*.7),h=(48+rnd(i,103)*30)*depth;
    texture(c,darkSmoke,t/108+i*.55,x,y,w*1.8,h*1.65,fade*.57*SETTINGS.shockwaveStrength,a*.2);
    texture(c,smoke,t/108+i*.55,x,y-3,w*1.55,h*1.25,fade*.38*SETTINGS.shockwaveStrength,a*.2);
   }
   // Short, thick violet-white edge sections disappear independently into dust.
   c.save();c.globalCompositeOperation='screen';c.lineCap='round';for(let k=0;k<13;k++){const start=k*TAU/13+.04*Math.sin(k),len=.12+.13*rnd(k,105),opacity=fade*(.13+.19*rnd(k,107));for(let pass=0;pass<3;pass++){c.beginPath();for(let j=0;j<=14;j++){const a=start+j/14*len,rr=r*(1+.006*Math.sin(a*31)),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.245+Math.sin(a*19)*2;j?c.lineTo(x,y):c.moveTo(x,y);}c.lineWidth=[21,8,2.5][pass]*(1-.5*exp);c.strokeStyle=[`rgba(91,29,170,${opacity*.24})`,`rgba(142,76,212,${opacity*.56})`,`rgba(217,182,249,${opacity})`][pass];c.stroke();}}c.restore();
  }
  // Outgoing fragments have illuminated tops, dark facets and ballistic fall.
  if(age>105){const p=(age-105)/1200,vis=1-ease(900,1500,age);for(const z of debris){const rr=z.r*(.45+p*1.75),x=cx+Math.cos(z.a)*rr,y=cy+Math.sin(z.a)*rr*.30-z.h*Math.sin(Math.min(1,p)*Math.PI)+p*p*90;stone(c,x,y,z.d*(1-.35*clamp(p)),z.a+p*(rnd(z.seed,109)*8-4),vis*.88,.23+.31*(1-clamp(p)));}}
  c.restore();
 }
 return {environment,impactBack,impactFront,settings:SETTINGS};
}
const api={create,SETTINGS};G.HD_MAJESTY=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

(function(G){'use strict';
const W=1920,H=1080,DURATION=14200,TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,q)=>a+(b-a)*q;
const ease=(a,b,t)=>{const q=clamp((t-a)/(b-a));return q*q*(3-2*q)},rand=(i,k=0)=>{const n=Math.sin(i*127.1+k*311.7)*43758.5453;return n-Math.floor(n)};
const SETTINGS={chargeStart:7000,chargeEnd:8900,pressStart:9000,slamTime:9300,firstHit:9400,secondHit:9950,sinkStart:10500,sinkEnd:12600,end:14200,sealOpacity:.48,godOpacity:.86,flameOpacity:.78,orbStartDiameter:93.3333333333,orbMaxDiameter:280,orbGrowthPower:2.2,orbCoronaScale:1.42,firstDamage:[186,161,183],secondDamage:[93,80,91],burnDamage:150};
function create(A,{canvasFactory:cf,mirrorPrelude=false}){
 const Battle=typeof module!=='undefined'?require('./battle-layer.js'):G.HA_BATTLE;
 const Impact=typeof module!=='undefined'?require('./impact.js'):G.HA_IMPACT;
 const Particles=typeof module!=='undefined'?require('./particles.js'):G.HA_PARTICLES;
 const Rain=typeof module!=='undefined'?require('./dark-rain.js'):G.HD_RAIN;
 const battle=Battle.create(A,{canvasFactory:cf}),counts={seal:6,sun:8,pillar:8,essence:6,rise:8,sink:8,eruption:8,slam:8,wave:8,gather:6,press:8,rise_alpha:8,sink_alpha:8,press_alpha:8};
 const motes=Particles.create({point:(a,r)=>({x:1100+Math.cos(a)*r,y:500+Math.sin(a)*r*.3})});
 const originalState=p=>({x:850+rand(p.id,801)*430,y:190+rand(p.id,802)*190,alpha:1});
 const rain=Rain.create(A,{canvasFactory:cf,battle,motes,originalState});
 const Majesty=typeof module!=='undefined'?require('./majesty-fx.js'):G.HD_MAJESTY;
 const majesty=Majesty.create(A,{canvasFactory:cf});
 rain.initialize();battle.setAdditionalMotion(rain.reaction);
 const allies=battle.allies;
 function glow(c,x,y,rx,ry,a,col='154,67,249'){
  if(a<=0)return;c.save();c.translate(x,y);c.scale(1,ry/rx);c.globalCompositeOperation='screen';const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(.25,`rgba(${col},${a*.55})`);g.addColorStop(.65,`rgba(${col},${a*.12})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.fillRect(-rx,-rx,rx*2,rx*2);c.restore();
 }
 const feathered=new Map();
 function texture(key,index){const k=key+'_'+clamp(Math.floor(index),0,counts[key]-1);if(feathered.has(k))return feathered.get(k);const im=A[k];if(!im)return null;const cv=cf(im.width,im.height),c=cv.getContext('2d');c.drawImage(im,0,0);c.globalCompositeOperation='destination-in';const fade=22;
  const g=c.createLinearGradient(0,0,im.width,0);g.addColorStop(0,'#0000');g.addColorStop(fade/im.width,'#000f');g.addColorStop(1-fade/im.width,'#000f');g.addColorStop(1,'#0000');c.fillStyle=g;c.fillRect(0,0,im.width,im.height);
  const h=c.createLinearGradient(0,0,0,im.height);h.addColorStop(0,'#0000');h.addColorStop(fade/im.height,'#000f');h.addColorStop(1-fade/im.height,'#000f');h.addColorStop(1,'#0000');c.fillStyle=h;c.fillRect(0,0,im.width,im.height);feathered.set(k,cv);return cv;
 }
 function cel(c,key,index,x,y,w,h,a=1){const im=texture(key,index);if(!im||a<=0)return;c.save();c.globalCompositeOperation='screen';c.globalAlpha*=a;c.drawImage(im,x,y,w,h);c.restore();}
 function fx(c,key,q,x,y,w,h,a=1){const z=clamp(q)*(counts[key]-1),i=Math.floor(z),f=z-i;cel(c,key,i,x,y,w,h,a*(1-f));if(f>0)cel(c,key,i+1,x,y,w,h,a*f);}
 function loop(c,key,t,x,y,w,h,a=1,start=0){const n=counts[key]-start;const s=(t/125)%(2*(n-1)),v=s<n-1?s:2*(n-1)-s;fx(c,key,(start+v)/(counts[key]-1),x,y,w,h,a);}
 function sceneTime(t){return t>=9300&&t<9366.6666?9300:t;}
 function stage(t){return t<900?'紫眸压场':t<2000?'裂渊醒转':t<4500?'光点凝神':t<7000?'悬浮上托':t<8900?'抽魂聚黑日':t<9050?'举日过顶':t<9300?'整日下砸':t<9950?'地焰反噬':t<10500?'地裂横扫':t<12700?'沉渊 · 余烬灼身':t<14200?'黑日收光 · 紫眸渐暗':'结束';}
 function blackSun(c,t,x,y,d,a=1,q=1){
  if(a<=0)return;c.save();c.globalAlpha*=a;c.fillStyle='#07020e';c.beginPath();c.ellipse(x,y,d*.28,d*.28,0,0,TAU);c.fill();c.restore();
  fx(c,'sun',q,x-d*.5,y-d*.5,d,d,a);glow(c,x,y,d*.67,d*.60,.075*a);
 }
 // Hero sun: a measurable black-disc diameter, threefold growth, a separate
 // painted corona and moving intake ripples. The caster's held sun is unchanged.
 function chargingSun(c,t,s,coreOnly=false){
  const a=1-ease(9300,9410,t),d=s.diameter,q=s.q;if(a<=0)return;
  c.save();c.translate(s.x,s.y);c.scale(1+.12*(1-s.squash),s.squash);c.globalAlpha*=a;
  if(coreOnly){c.beginPath();c.arc(0,0,d*.52,0,TAU);c.clip();}
  c.fillStyle='#040009';c.beginPath();c.arc(0,0,d*.50,0,TAU);c.fill();
  const outer=d*SETTINGS.orbCoronaScale*(1+.028*q*Math.sin(t*.018));
  c.save();c.rotate(t*.00038);loop(c,'sun',t, -outer/2,-outer/2,outer,outer,.78,5);c.restore();
  // An absorbing eclipse disc stays black even while the painted corona
  // brightens. Its graduated boundary preserves the existing flowing texture.
  const voidCore=c.createRadialGradient(0,0,d*.10,0,0,d*.51);
  voidCore.addColorStop(0,'rgba(1,0,4,.99)');voidCore.addColorStop(.64,'rgba(2,0,7,.98)');voidCore.addColorStop(.86,'rgba(5,0,13,.84)');voidCore.addColorStop(1,'rgba(8,0,19,0)');
  c.fillStyle=voidCore;c.fillRect(-d*.52,-d*.52,d*1.04,d*1.04);
  glow(c,0,0,outer*.55,outer*.52,.035+.035*q);
  if(s.collapse>0){glow(c,0,0,14+26*s.collapse,14+26*s.collapse,.82*s.collapse,'185,94,255');glow(c,0,0,3+3*s.collapse,3+3*s.collapse,s.collapse,'244,220,255');}
  // Electrical arcs accelerate along the rim, independent of the sun's scale.
  c.save();c.globalCompositeOperation='screen';c.lineJoin='round';
  const arcs=3+Math.floor(q*8),tick=t/42;
  for(let i=0;i<arcs;i++){
   const theta=i/arcs*TAU+t*.0014,span=.09+.10*(.5+.5*Math.sin(i*8+tick*.21)),r=d*(.50+.018*Math.sin(i*9+tick*.14));
   c.beginPath();for(let j=0;j<9;j++){const ang=theta+span*j/8,rr=r+Math.sin(j*2.6+i+tick*.23)*d*.009,x=Math.cos(ang)*rr,y=Math.sin(ang)*rr;j?c.lineTo(x,y):c.moveTo(x,y);}
   c.strokeStyle='rgba(134,47,230,.25)';c.lineWidth=4;c.stroke();c.strokeStyle='rgba(212,151,255,.75)';c.lineWidth=.9;c.stroke();
  }
  // Brief expanding surface rings at staggered wisp arrivals, clipped to disc.
  if(t<9300){c.beginPath();c.arc(0,0,d*.44,0,TAU);c.clip();for(let i=0;i<3;i++){const u=((t-7000+i*193)%580)/580;if(u<0)continue;c.strokeStyle=`rgba(117,54,166,${(.035+.04*q)*Math.sin(u*Math.PI)})`;c.lineWidth=1.1;c.beginPath();c.ellipse(-d*.15+i*d*.12,d*.16,d*(.04+.58*u),d*(.03+.31*u),-.3,0,TAU);c.stroke();}}
  c.restore();c.restore();
 }
 function groundSeal(c,t,x,y,w,h,a=1){
  const active=ease(650,1450,t)*(1-ease(11600,13000,t));
  c.save();c.translate(x,y-h*.18);c.scale(1,h/w);c.rotate(Math.sin(t*.0021)*.025+t*.000035+.16*clamp((t-650)/1000));c.scale(1,w/h);
  loop(c,'seal',t,-w/2,-h*.50,w*(1+.008*Math.sin(t*.004)),h,a*active*SETTINGS.sealOpacity,3);c.restore();
  const low=ease(730,950,t)*(1-ease(1450,1900,t));if(low>0)for(let i=0;i<5;i++){const xx=x+(i-2)*105,yy=y-38+Math.sin(t*.009+i)*9;loop(c,'pillar',t*1.65+i*157,xx-67,yy-104,134,134,.40*low,3);}
 }
 function eye(c,t){
  if(mirrorPrelude&&t<2600)return;
  const closing=1-ease(13000,14200,t),intro=1-ease(1300,2600,t),vis=(.16*intro+.025)*ease(0,700,t)*closing;
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=vis;c.drawImage(A.eyes,0,0,W,H);c.restore();
  const x=1920*1167/1672,y=1080*536/941,p=ease(0,850,t)*closing;
  glow(c,x,y,24+100*p,20+76*p,(.9*intro+.045)*p,'144,50,255');glow(c,x,y,3+20*p,3+17*p,(.7*intro+.045)*p,'232,209,255');
 }
 function caster(c,t,visibility=1){
  const close=t<12700?Math.min(t,10500):t-2200,s=battle.casterState(close),a=(mirrorPrelude?1:s.opacity)*visibility,power=1-ease(12900,13900,t);
  if(a<=0)return;
  blackSun(c,t,s.sun.x,s.sun.y,210,a*power,.60+.3*Math.sin(t*.001)**2);
  c.save();c.globalAlpha=a;c.translate(s.foot.x,s.foot.y);c.scale(s.scale,s.scale*s.breath);c.transform(1,0,s.sway,1,0,0);c.drawImage(A.tuotianH,-257.5,-656);c.restore();
  s.palms.forEach(p=>glow(c,p.x,p.y,28,25,.3*power));glow(c,s.head.x+10,s.head.y,10,6,.8*power,'189,133,255');
 }
 function drawBattle(c,t){
  const darkness=ease(0,900,t)*(1-ease(12700,14200,t)),charge=ease(7000,8600,t)*(1-ease(9300,9800,t));
  c.save();
  if(mirrorPrelude){
   // 真实战场快照：背景在 0 层已按原版背景亮度预先压暗，这里再按原版单位亮度整体压暗
   c.drawImage(A.battle,0,0,W,H);c.fillStyle='rgba(0,0,0,'+(.47*darkness+.05*charge)+')';c.fillRect(-W,-H,W*3,H*3);
  }else{c.filter=`brightness(${1-.58*darkness-.06*charge}) saturate(.78)`;battle.draw(c,t,{enemyLight:false});}c.restore();
  c.save();c.globalCompositeOperation='multiply';c.globalAlpha=.28*darkness;c.fillStyle='#8264a1';c.fillRect(0,0,W,H);c.restore();
  c.save();const g=c.createRadialGradient(1070,490,220,960,540,1150);g.addColorStop(0,'#05020c00');g.addColorStop(1,`rgba(7,1,17,${.8*darkness})`);c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();
 }

 // B is sampled directly from the selected 1536x1024 PNG; the rig is 768x512.
 // No portrait/pose replacement or RGB keying. All skinning retains its alpha.
 const RIG={source:'godB',width:768,height:512,bobPeriod:1200,bobPx:5.5,
  origin:{x:800,y:280},scale:{x:1,y:1},
  left:{s:[246,247],e:[179,321],w:[113,351],p:[82,356]},
  right:{s:[400,191],e:[543,211],w:[642,157],p:[670,137]}};
 const LP=[[240, 232], [255, 246], [259, 271], [242, 291], [238, 318], [225, 345], [231, 368], [251, 388], [254, 407], [229, 414], [203, 405], [183, 391], [171, 372], [155, 361], [132, 365], [115, 375], [98, 384], [75, 395], [47, 394], [28, 385], [8, 369], [8, 350], [29, 341], [43, 329], [57, 308], [72, 312], [90, 327], [110, 336], [135, 320], [153, 302], [178, 287], [206, 277], [226, 251]],RP=[[391, 179], [420, 173], [445, 172], [474, 184], [511, 182], [549, 173], [587, 160], [610, 145], [621, 118], [635, 85], [652, 81], [670, 100], [681, 104], [689, 88], [709, 82], [724, 102], [729, 126], [718, 149], [696, 167], [676, 183], [653, 197], [638, 221], [658, 232], [688, 217], [709, 210], [738, 215], [758, 244], [758, 281], [742, 300], [750, 324], [760, 362], [761, 400], [741, 401], [711, 363], [678, 343], [640, 332], [607, 319], [575, 301], [549, 284], [526, 266], [504, 244], [478, 238], [451, 225], [420, 214], [402, 205]];
 const baseSkin=cf(768,512),baseCtx=baseSkin.getContext('2d');baseCtx.drawImage(A.godB,0,0,768,512);
 // The selected B silhouette and mesh stay identical. Absorbing midtones give
 // its translucent chest, shoulders and robe depth; painted flame peaks and
 // the approved face remain readable instead of lifting every pixel equally.
 const material=baseCtx.getImageData(0,0,768,512);
 for(let y=0;y<512;y++)for(let x=0;x<768;x++){
  const i=(y*768+x)*4,d=material.data;if(d[i+3]===0)continue;
  const face=1-ease(48,88,Math.hypot((x-302)*.94,(y-119)*1.12));
  const lum=(d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722)/255;
  const weight=(1-face)*ease(140,205,y),gain=mix(1,.46+.54*ease(.22,.86,lum),weight);
  d[i]*=gain;d[i+1]*=gain*mix(1,.88,weight*(1-ease(.62,.9,lum)));d[i+2]*=gain;
  d[i+3]=Math.round(255*(1-Math.pow(1-d[i+3]/255,1+.18*weight)));
 }
 baseCtx.putImageData(material,0,0);
 function cutMask(poly){const cv=cf(768,512),c=cv.getContext('2d');c.fillStyle='#fff';c.beginPath();poly.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();const blurred=cf(768,512),bc=blurred.getContext('2d');bc.filter='blur(1.5px)';bc.drawImage(cv,0,0);return blurred;}
 function cutSkin(mask){const cv=cf(768,512),c=cv.getContext('2d');c.drawImage(baseSkin,0,0);c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);return cv;}
 const masks=[cutMask(LP),cutMask(RP)],armSkin=masks.map(cutSkin);
 const trunk=cf(768,512),tc=trunk.getContext('2d');tc.drawImage(baseSkin,0,0);tc.globalCompositeOperation='destination-out';masks.forEach(m=>tc.drawImage(m,0,0));
 const halo=cf(768,512),hc=halo.getContext('2d');hc.drawImage(baseSkin,0,0);hc.globalCompositeOperation='destination-in';hc.beginPath();hc.ellipse(326,80,84,80,0,0,TAU);hc.ellipse(326,80,71,67,0,0,TAU,true);hc.fill();
 const smooth5=q=>{q=clamp(q);return q*q*q*(q*(q*6-15)+10)};
 const polar=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
 const length=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
 const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
 const L0=[polar(RIG.left.s,RIG.left.e),polar(RIG.left.e,RIG.left.p)],R0=[polar(RIG.right.s,RIG.right.e),polar(RIG.right.e,RIG.right.p)];
 function solveArm(b,s,p,side){
  const l1=length(b.s,b.e),l2=length(b.e,b.p),dx=p[0]-s[0],dy=p[1]-s[1],raw=Math.hypot(dx,dy),d=clamp(raw,Math.abs(l1-l2)+2,l1+l2-1),nx=dx/(raw||1),ny=dy/(raw||1),a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));
  const end=[s[0]+nx*d,s[1]+ny*d],e=[s[0]+nx*a-ny*h*side,s[1]+ny*a+nx*h*side],theta=polar(e,end),rest=polar(b.e,b.p),w=rotateAround(b.w,b.e,e,theta-rest);
  return{s,e,w,p:end,angle:[polar(s,e),theta],reachClamped:Math.abs(raw-d)>.01};
 }
 function travelState(t){const u=clamp((t-9050)/250),h=u*u;return{u,h,x:mix(1122,735,Math.sin(u*Math.PI/2)**1.4),y:mix(160,810,h)};}
 function rigState(t){
  const rise=ease(1750,4500,t),sink=ease(10500,12600,t),up=ease(4500,7000,t),pre=ease(9000,9050,t),flight=travelState(t),hit=flight.h;
  const rebound=t<9300?0:t<9380?ease(9300,9380,t):1-ease(9380,9600,t);
  const root={x:RIG.origin.x+Math.sin(t*.0024)*2.4,y:RIG.origin.y+sink*645+Math.sin(t/1200*TAU)*RIG.bobPx};
  // One fixed B body, continuous chest/shoulder turn. The pose opens vertical
  // headroom; no stage-to-stage picture replacement, no hand grip or fist.
  function torso(p){const left=1-ease(280,360,p[0]),shoulder= Math.exp(-(((p[1]-230)/65)**2));
   let v=[p[0],p[1]-up*56*left*shoulder];
   const turn=hit*(-.17)-rebound*.018,weight=1-ease(350,490,p[1]);
   const z=rotateAround(v,[325,430],[325-hit*66-rebound*5,430+hit*24],turn);
   return[mix(v[0],z[0],weight),mix(v[1],z[1],weight)];}
  const world=p=>({x:root.x+p[0],y:root.y+p[1]}),local=p=>[p.x-root.x,p.y-root.y];
  const arms=[RIG.left,RIG.right].map((b,k)=>{
   const rs=torso(b.s),hs=k?[400,191]:[246,191],ss=[mix(rs[0],hs[0],up*(1-hit)),mix(rs[1],hs[1],up*(1-hit))];
   // Source B has perspective-shortened arms. Correct only bone-axis lengths
   // smoothly as they face up; palms/fingers keep their source proportions.
   const holdE=k?[400,359-280]:[246,341-280],holdW=k?[400,272-280]:[246,247-280];
   let e=[mix(b.e[0],holdE[0],up),mix(b.e[1],holdE[1]-4*pre,up)],ww=[mix(b.w[0],holdW[0],up),mix(b.w[1],holdW[1]-4*pre,up)];
   if(flight.u>0){
    const release=.40,v=Math.min(release,flight.u),f=travelState(9050+250*v),offset=k?[106,92]:[-107,92];
    const palm={x:f.x+offset[0],y:f.y+offset[1]},hw=local({x:palm.x+b.w[0]-b.p[0],y:palm.y+b.w[1]-b.p[1]});
    const follow=ease(release,1,flight.u),end=k?[220,410]:[90,400];
    ww=[mix(hw[0],end[0],follow)-rebound*7,mix(hw[1],end[1],follow)+rebound*10];
    const frac=k?.56:.58,bend=Math.sin(flight.u*Math.PI)*23;
    e=[mix(ss[0],ww[0],frac)+(k?bend:-bend),mix(ss[1],ww[1],frac)-bend*.25];
   }
   const small=(1-hit)*up; e[0]+=Math.sin(t*.004+k)*small*.7;ww[0]+=Math.sin(t*.003+k)*small*.7;
   const pp=[ww[0]+b.p[0]-b.w[0],ww[1]+b.p[1]-b.w[1]];
   return{s:ss,e,w:ww,p:pp,angle:[polar(ss,e),polar(e,ww)],handRotation:0,reachClamped:false};
  });
  return{root,rise,sink,up,pre,hit,rebound,arms,torso,world,head:world(torso([302,119])),palms:arms.map(a=>world(a.p)),source:RIG.source,alpha:SETTINGS.godOpacity*ease(1750,2100,t)*(1-ease(12520,12600,t))};
 }
 function godSpec(t){if(t<1750||t>=12600)return null;const r=rigState(t);return{key:RIG.source,sourceFile:'assets/B_逆冠焚天.png',root:r.root,rise:r.rise,sink:r.sink,palms:r.palms,head:r.head,armAngles:r.arms.map(a=>a.angle),press:r.hit,preLift:r.pre};}
 function triangle(c,im,a,b,d,Aa,Bb,Dd){
  const den=a.x*(b.y-d.y)+b.x*(d.y-a.y)+d.x*(a.y-b.y);if(Math.abs(den)<.0001)return;
  const m=(va,vb,vd)=>[(va*(b.y-d.y)+vb*(d.y-a.y)+vd*(a.y-b.y))/den,(va*(d.x-b.x)+vb*(a.x-d.x)+vd*(b.x-a.x))/den,(va*(b.x*d.y-d.x*b.y)+vb*(d.x*a.y-a.x*d.y)+vd*(a.x*b.y-b.x*a.y))/den];
  const X=m(Aa.x,Bb.x,Dd.x),Y=m(Aa.y,Bb.y,Dd.y),mid={x:(Aa.x+Bb.x+Dd.x)/3,y:(Aa.y+Bb.y+Dd.y)/3};
  c.save();c.beginPath();[Aa,Bb,Dd].forEach((p,i)=>{const dx=p.x-mid.x,dy=p.y-mid.y,r=Math.hypot(dx,dy)||1,x=p.x+dx/r*.32,y=p.y+dy/r*.32;i?c.lineTo(x,y):c.moveTo(x,y)});c.closePath();c.clip();c.transform(X[0],Y[0],X[1],Y[1],X[2],Y[2]);c.drawImage(im,0,0);c.restore();
 }
 function mesh(c,im,map,box=[0,0,768,512],step=16){HA_GLM.mesh(c,im,map,box,step);}

 function rotateAround(p,src,dst,theta){const x=p[0]-src[0],y=p[1]-src[1];return[dst[0]+x*Math.cos(theta)-y*Math.sin(theta),dst[1]+x*Math.sin(theta)+y*Math.cos(theta)];}
 function distSegment(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],u=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy));return Math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy);}
 function axisMap(p,a,b,Aa,Bb){const len=length(a,b),dx=(b[0]-a[0])/len,dy=(b[1]-a[1])/len,nlen=length(Aa,Bb),nx=(Bb[0]-Aa[0])/nlen,ny=(Bb[1]-Aa[1])/nlen,u=(p[0]-a[0])*dx+(p[1]-a[1])*dy,v=-(p[0]-a[0])*dy+(p[1]-a[1])*dx;return[Aa[0]+nx*u*nlen/len-ny*v,Aa[1]+ny*u*nlen/len+nx*v];}
 function armMap(r,k,p){const b=k?RIG.right:RIG.left,d=r.arms[k],v=[p.x,p.y];const u=((p.x-b.w[0])*(b.p[0]-b.w[0])+(p.y-b.w[1])*(b.p[1]-b.w[1]))/length(b.w,b.p);if(u>=-5)return r.world([p.x+d.w[0]-b.w[0],p.y+d.w[1]-b.w[1]]);const part=distSegment(v,b.s,b.e)>distSegment(v,b.e,b.w);return r.world(axisMap(v,part?b.e:b.s,part?b.w:b.e,part?d.e:d.s,part?d.w:d.e));}
 let tClock=0;
 const shoulderCaps=[RIG.left,RIG.right].map(b=>{const mask=cf(768,512),c=mask.getContext('2d'),g=c.createRadialGradient(...b.s,13,...b.s,27);g.addColorStop(0,'#ffff');g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(0,0,768,512);return cutSkin(mask);});
 const boneSkin=armSkin.map((skin,k)=>{const b=k?RIG.right:RIG.left;return [0,1,2].map(part=>{const mask=cf(768,512),m=mask.getContext('2d'),pixels=m.createImageData(768,512);for(let y=0;y<512;y++)for(let x=0;x<768;x++){const du=distSegment([x,y],b.s,b.e),df=distSegment([x,y],b.e,b.w),f=ease(-3,3,du-df),hu=((x-b.w[0])*(b.p[0]-b.w[0])+(y-b.w[1])*(b.p[1]-b.w[1]))/length(b.w,b.p),hand=ease(-9,-1,hu)*(k?ease(605,621,x)*(1-ease(197,218,y)):(1-ease(132,150,x))*ease(294,310,y)),at=(y*768+x)*4;pixels.data[at]=pixels.data[at+1]=pixels.data[at+2]=255;pixels.data[at+3]=255*(part===2?hand:(1-hand)*(part?f:1-f));}m.putImageData(pixels,0,0);const cv=cf(768,512),c=cv.getContext('2d');c.drawImage(skin,0,0);c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);return cv;});});
 const elbowCaps=[RIG.left,RIG.right].map((b,k)=>{const mask=cf(768,512),c=mask.getContext('2d'),g=c.createRadialGradient(...b.e,8,...b.e,18);g.addColorStop(0,'#ffff');g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(0,0,768,512);const cv=cf(768,512),d=cv.getContext('2d');d.drawImage(armSkin[k],0,0);d.globalCompositeOperation='destination-in';d.drawImage(mask,0,0);return cv;});
 function drawArms(c,r){for(let k=0;k<2;k++){
  const b=k?RIG.right:RIG.left,d=r.arms[k];
  for(let part=0;part<3;part++){const a=part?b.e:b.s,z=part?b.w:b.e,aa=part?d.e:d.s,zz=part?d.w:d.e;
   const map=p=>{let v=part===2?[p.x+d.w[0]-b.w[0],p.y+d.w[1]-b.w[1]]:axisMap([p.x,p.y],a,z,aa,zz);const tail=part===2?0:ease(40,110,distSegment([p.x,p.y],a,z));if(part!==2&&tail>0){const sa=polar(a,z),da=polar(aa,zz),delta=Math.atan2(Math.sin(da-sa),Math.cos(da-sa)),normal=-(p.x-a[0])*Math.sin(sa)+(p.y-a[1])*Math.cos(sa),angle=da-delta*.5*tail;v[0]+=(Math.sin(da)-Math.sin(angle))*normal;v[1]+=(Math.cos(angle)-Math.cos(da))*normal;}v[0]+=Math.sin(p.y*.036-tClock*.005)*tail*5;v[1]+=Math.cos(p.x*.03+tClock*.0037)*tail*4;return r.world(v)};
   mesh(c,boneSkin[k][part],map,k?[380,70,768,415]:[0,225,270,420],16);
  }
  const theta=(polar(d.s,d.e)-polar(b.s,b.e)+polar(d.e,d.w)-polar(b.e,b.w))*.5;
  mesh(c,elbowCaps[k],p=>r.world(rotateAround([p.x,p.y],b.e,d.e,theta)),[b.e[0]-19,b.e[1]-19,b.e[0]+19,b.e[1]+19],10);
  mesh(c,shoulderCaps[k],p=>r.world([p.x+d.s[0]-b.s[0],p.y+d.s[1]-b.s[1]]),[b.s[0]-28,b.s[1]-28,b.s[0]+28,b.s[1]+28],10);
 }}
 const godCanvas=cf(W,H),godCtx=godCanvas.getContext('2d'),light=cf(768,512),lc=light.getContext('2d');HA_GLM.markDynamic(light);
 function god(dest,t){if(t<1750||t>=12600)return;const c=godCtx;c.setTransform(GMXT(c));c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,W,H);const r=rigState(t),root=r.root;tClock=t;
  c.save();c.beginPath();c.rect(400,-300,1400,1400);c.clip();c.globalAlpha=Math.min(.96,r.alpha*1.10);
  const dark=c.createRadialGradient(1100,root.y+370,60,1100,root.y+370,350);dark.addColorStop(0,'rgba(4,0,12,.36)');dark.addColorStop(1,'rgba(4,0,12,0)');c.fillStyle=dark;c.fillRect(700,root.y,840,840);
  c.save();c.translate(r.world(r.torso([326,80])).x,r.world(r.torso([326,80])).y);const eclipse=c.createRadialGradient(0,0,35,0,0,75);eclipse.addColorStop(0,'rgba(2,0,7,.83)');eclipse.addColorStop(.75,'rgba(4,0,12,.75)');eclipse.addColorStop(1,'rgba(7,0,16,0)');c.fillStyle=eclipse;c.fillRect(-75,-75,150,150);c.globalAlpha*=.48;c.rotate(t*.00014);c.drawImage(halo,-326,-80);c.restore();
  const bodyMap=p=>{let v=r.torso([p.x,p.y]);const cloth=ease(310,490,p.y),hair=(1-ease(150,240,p.y))*ease(380,700,p.x);
   v[0]+=cloth*(Math.sin(p.y*.036-t*.0048)*6+Math.sin(p.y*.017+t*.0026)*3)+hair*Math.sin(p.x*.04-t*.005)*3.5;
   v[1]+=cloth*Math.sin(p.x*.031+t*.0042)*4+hair*Math.cos(p.x*.03-t*.005)*2;return r.world(v);};
  mesh(c,trunk,bodyMap,[0,0,768,512],20);drawArms(c,r);HA_GLM.flush(c);
  c.save();c.globalCompositeOperation='screen';c.globalAlpha*=.13+.025*Math.sin(t*.005);
  lc.setTransform(1,0,0,1,0,0);lc.globalAlpha=1;lc.globalCompositeOperation='source-over';lc.clearRect(0,0,768,512);lc.drawImage(trunk,0,0);lc.globalCompositeOperation='destination-in';const yy=340+130*Math.sin(t*.0022),g=lc.createLinearGradient(0,yy-90,0,yy+90);g.addColorStop(0,'#fff0');g.addColorStop(.5,'#ffff');g.addColorStop(1,'#fff0');lc.fillStyle=g;lc.fillRect(0,0,768,512);mesh(c,light,bodyMap,[0,150,768,512],26);HA_GLM.flush(c);c.restore();c.restore();
  if(t<4500){const front=mix(15,1000,ease(1750,4500,t));c.globalCompositeOperation='destination-in';const mask=c.createLinearGradient(0,front-115,0,front+115);mask.addColorStop(0,'#ffff');mask.addColorStop(.45,'#fffc');mask.addColorStop(1,'#fff0');c.fillStyle=mask;c.fillRect(0,0,W,H);}
  c.globalCompositeOperation='destination-in';const edge=c.createLinearGradient(0,800,0,900);edge.addColorStop(0,'#ffff');edge.addColorStop(1,'#fff0');c.fillStyle=edge;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over';dest.drawImage(godCanvas,0,0);
 }
 const sampling=baseSkin,samplingCtx=baseCtx,formationSource=samplingCtx.getImageData(0,0,768,512).data,formationTargets=[];
 for(let y=5;y<505;y+=7)for(let x=5;x<760;x+=7){const at=(y*768+x)*4;if(formationSource[at+3]>100&&formationSource[at]+formationSource[at+1]+formationSource[at+2]>260)formationTargets.push([x,y]);}
 function formingMotes(c,t){if(t<1100||t>=4750)return;const strength=ease(1100,1600,t)*(1-ease(4250,4750,t)),r=rigState(t),nodes=Array.from({length:6},(_,i)=>{const a=-Math.PI/2+i*TAU/6;return[1120+Math.cos(a)*470,745+Math.sin(a)*141]}),edges=[[0,2],[2,4],[4,0],[1,3],[3,5],[5,1]];
  for(let i=0;i<330;i++){const life=1150+rand(i,451)*500,offset=rand(i,452)*life,age=t-1100-offset;if(age<0)continue;const cycle=Math.floor(age/life),u=(age%life)/life,arrival=t+(1-u)*life,front=mix(20,1000,ease(1750,4500,arrival));
   const e=edges[i%6],a=nodes[e[0]],b=nodes[e[1]],z=rand(i,453),sx=mix(a[0],b[0],z),sy=mix(a[1],b[1],z);
   const goalY=clamp((front-80-r.root.y)/RIG.scale.y,20,490);let target=formationTargets[Math.floor(rand(i,cycle+461)*formationTargets.length)];
   // Choose a real luminous silhouette texel near the descending assembly band.
   for(let j=0;j<7;j++){const next=formationTargets[Math.floor(rand(i+j*991,cycle+467)*formationTargets.length)];if(Math.abs(next[1]-goalY)<Math.abs(target[1]-goalY))target=next;}
   const polyInside=(p,poly)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;};tClock=t;const end=polyInside(target,LP)?armMap(r,0,{x:target[0],y:target[1]}):polyInside(target,RP)?armMap(r,1,{x:target[0],y:target[1]}):r.world(r.torso(target)),q=u*u*(3-2*u),curl=Math.sin(Math.PI*u)*(65+rand(i,459)*105),ang=i*2.39996+u*7;
   const x=mix(sx,end.x,q)+Math.cos(ang)*curl,y=mix(sy,end.y,q)+Math.sin(ang)*curl*.28,alpha=strength*Math.sin(Math.PI*u)**.55*(.5+rand(i,460)*.5),size=1.2+rand(i,461)*2.4;
   glow(c,x,y,size*4,size*4,alpha*.35,'129,48,216');c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha;c.fillStyle=i%4?'#bb78f2':'#edd5ff';c.beginPath();c.ellipse(x,y,size,size*1.1,0,0,TAU);c.fill();c.restore();
  }
 }

 function sunState(t){
  const q=clamp((t-7000)/1900)**SETTINGS.orbGrowthPower,flight=travelState(t),pre=ease(9000,9050,t);
  const charged=mix(SETTINGS.orbStartDiameter,SETTINGS.orbMaxDiameter,q),target={x:735,y:810};
  let x=1122+Math.sin(t*.0024)*2.4,y=160-4*pre;
  if(t>9050){x=flight.x;y=flight.y;}
  return{x,y,diameter:charged,q,collapse:0,push:flight.h,squash:t<9300?1:mix(.67,1,ease(9300,9410,t)),whole:true,landed:t>=9300,target};
 }
 function sunShatter(c,t){const age=t-9300;if(age<0||age>1050)return;const s=sunState(9300),q=age/1050,fade=1-ease(650,1050,age);
  fx(c,'slam',.25+.75*ease(0,920,age),s.x-420,s.y-390,840,610,.94*fade*(.38+.62*ease(0,115,age)));
  // Collapse first. Coincident pieces at age zero would form one hovering cube.
  if(age<70)return;
  // Pieces carry the original black-sun texture, with black faces and purple lit edges.
  const im=texture('sun',7);for(let i=0;i<22;i++){const a=i*2.399963,v=110+rand(i,906)*360,u=age*.001,x=s.x+Math.cos(a)*v*u,y=s.y-70-Math.sin(a)*v*.72*u+260*u*u,z=10+rand(i,909)*20;
   c.save();c.translate(x,y);c.rotate(a+u*(rand(i,911)-.5)*7);c.globalAlpha=fade*ease(70,170,age);c.beginPath();c.moveTo(-z,-z*.45);c.lineTo(z*.6,-z);c.lineTo(z,z*.6);c.lineTo(-z*.4,z);c.closePath();c.fillStyle='#130323';c.fill();c.clip();c.globalCompositeOperation='screen';c.drawImage(im,Math.floor(rand(i,912)*im.width*.6),Math.floor(rand(i,913)*im.height*.6),im.width*.3,im.height*.3,-z,-z,z*2,z*2);c.restore();glow(c,x,y,z*1.8,z,.15*fade*ease(70,170,age),'151,70,230');}
 }

 function extraction(c,t){
  if(t<7000||t>=9300)return;const q=ease(7000,8900,t),s=sunState(t),en=battle.enemyPositions(t),strength=ease(7000,7250,t);
  for(let i=0;i<en.length;i++){
   const u=en[i],x=u.centerX,y=u.centerY-25;
   // Painted arc flow occupies the span between a live enemy anchor and the sun.
   const minx=Math.min(x,s.x),miny=Math.min(y,s.y);const w=Math.abs(s.x-x),h=Math.abs(y-s.y);
   loop(c,'essence',t+i*83,minx-18,miny-30,w+35,h+60,(.28+.40*q)*strength,2);
   cel(c,'pillar',(Math.floor(t/130)+i)%4,x-u.height*.3,u.y-u.height*.85,u.height*.6,u.height,.25*strength);
   glow(c,x,y,100,100,.10*q);
  }
 }
 function enemyShiver(c,t){if(t<7000||t>9300)return;const q=ease(7000,8900,t);for(const u of battle.enemies){c.save();c.translate(Math.sin(t*.057+u.x)*q*2.2,Math.cos(t*.044+u.x)*q);c.filter='brightness(.45) saturate(.75)';battle.drawUnit(c,u,t,{shadows:false,enemyLight:false});c.restore();}}
 function groundEffects(c,t){
  const units=battle.enemyPositions(t),a=t<9300?0:(.44+.56*ease(9300,9430,t))*(1-ease(10100,10900,t));
  if(a<=0)return;
  for(let i=0;i<units.length;i++){const u=units[i];loop(c,'seal',t+i*63,u.x-185,u.y-104,370,190,.95*a,3);}
 }
 function strikes(c,t){
  // The impact remains on the approved frame: a brief dark compression is
  // followed by the original upward eruption, without moving damage timing.
  c.save();c.globalAlpha*=.38+.62*ease(9300,9420,t);
  const units=battle.enemyPositions(t);
  for(let i=0;i<units.length;i++){
   const u=units[i],birth=9300,age=t-birth;if(age<0||age>1000)continue;
   const q=age<160?ease(0,205,age+90)*5/7:(5+2*ease(160,1000,age))/7;
   fx(c,'pillar',q,u.x-230,u.y-560,460,660,SETTINGS.flameOpacity*(1-ease(750,1000,age)));
   glow(c,u.x,u.y-15,250,70,.35*Math.sin(clamp(age/900)*Math.PI));
  }
  if(t>=9300&&t<10800){const q=clamp((t-9300)/1500);fx(c,'wave',.18+.82*q,-120,420,2170,700,.88*(1-ease(.78,1,q)));}
  c.restore();
 }
 function numbers(c,t){
  const units=battle.enemyPositions(t),offsets={rhino:[-55,-40],leopard:[-55,-30],wolf:[100,-10]};
  for(let hit=0;hit<2;hit++)for(let i=0;i<units.length;i++){
   const age=t-(hit?SETTINGS.secondHit+i*38:SETTINGS.firstHit);if(age<0||age>900)continue;
   const u=units[i],off=offsets[u.id],x=u.damageX+off[0]+(hit?90:0),y=u.damageY-95+off[1]-(hit?-45:0)-Math.min(90,age*.11),pop=1+.19*Math.exp(-age/90);
   c.save();c.translate(x,y);c.scale(pop,pop);c.globalAlpha=1-ease(650,900,age);c.textAlign='center';c.lineJoin='round';c.shadowColor='#06010e';c.shadowBlur=8;c.font='900 68px CN,"PingFang SC",sans-serif';
   if(!hit){c.lineWidth=13;c.strokeStyle='#170628';c.strokeText('爆',-30,0);c.lineWidth=6;c.strokeStyle='#e7c9ff';c.strokeText('爆',-30,0);c.fillStyle='#57218c';c.fillText('爆',-30,0);}
   c.font='900 60px CN,"PingFang SC",sans-serif';const value=String((hit?SETTINGS.secondDamage:SETTINGS.firstDamage)[i]);c.lineWidth=12;c.strokeStyle='#170628';c.strokeText(value,30,52);c.lineWidth=5;c.strokeStyle='#f0d9ff';c.strokeText(value,30,52);c.fillStyle='#65329b';c.fillText(value,30,52);c.restore();
  }
 }
 function render(c,real,renderOptions={}){real=sceneTime(clamp(real,0,DURATION));const t=real,cam=Impact.camera(real),charging=ease(7000,8900,real)*(1-ease(9300,9470,real));
  c.save();c.setTransform(GMXT(c));c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#040108';c.fillRect(0,0,W,H);
  c.translate(W/2+cam.x+Math.sin(real*.043)*charging*3.4,H/2+cam.y+Math.cos(real*.039)*charging*2.2+(real>=9300&&real<9600?16*Math.exp(-(real-9300)/95)*Math.cos((real-9300)*.034):0));const impactZoom=real>=9300&&real<9600?.036*Math.exp(-(real-9300)/150):0;c.scale(cam.scale+impactZoom,cam.scale+impactZoom);c.translate(-W/2,-H/2);
  drawBattle(c,t);eye(c,real);majesty.environment(c,t,sunState(t),battle.enemyPositions(t));groundSeal(c,t,1120,830,1060,470);
  // Entrance energy is carried by seal-born motes, with no central flame pillar.
  formingMotes(c,t);
  if(t>2000&&t<12600)glow(c,1120,530,500,510,.11*(1-ease(11900,12600,t)));
  // Enemy struggle is now part of its single foot-anchored battle transform.
  extraction(c,t);
  if(t>=7000&&t<9050)chargingSun(c,t,sunState(t));
  god(c,t);
  if(t>=7000&&t<9050)chargingSun(c,t,sunState(t),true);
  if(t>=9050&&t<9410)chargingSun(c,t,sunState(t));
  majesty.impactBack(c,t);groundEffects(c,t);strikes(c,t);sunShatter(c,t);majesty.impactFront(c,t);
  c.save();c.filter=`brightness(${.58+.42*ease(12700,14200,real)}) saturate(.8)`;battle.draw(c,t,{side:'ally',background:false,shadows:false});c.restore();if(renderOptions.caster!==false)caster(c,real);
  if(real>10500)rain.draw(c,real);
  
  c.restore();
 }
 function inspect(t){return{timeMs:t,durationMs:DURATION,phase:stage(t),god:godSpec(t),sun:sunState(t),camera:Impact.camera(t),chargeMs:[7000,8900],firstHitMs:9400,secondHitMs:SETTINGS.secondHit,enemyTargets:battle.enemyPositions(t).map(u=>({id:u.id,x:u.x,y:u.y})),impact:{landed:t>=9300,pillars:t>=9300&&t<10300,wave:t>=9300&&t<10800,shatter:t>=9300&&t<10350},ending:rain.inspect(t),endVisible:t>=14200?false:true};}
 return{render,inspect,stage,duration:DURATION,battle,rain,darkness:t=>({d:ease(0,900,t)*(1-ease(12700,14200,t)),c:ease(7000,8600,t)*(1-ease(9300,9800,t))}),renderGod:god,getLastGodCanvas:()=>godCanvas,rigState,layers:{drawBattle,groundSeal,caster,eye,glow,loop,cel,fx}};
}
const api={create,SETTINGS,width:W,height:H,duration:DURATION};G.HEIAN_CORE=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

(function(G){'use strict';
const W=1920,H=1080,TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,q)=>a+(b-a)*q;
const ease=(a,b,t)=>{let q=clamp((t-a)/(b-a));return q*q*(3-2*q)},frac=x=>x-Math.floor(x),rand=(i,k=0)=>frac(Math.sin(i*127.1+k*311.7)*43758.5453123);
function spreadingEyeRadiance(c,e,q,visibility,actual,gold=false){
 const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
 if(visibility<.003)return;q=clamp(q);const spread=ease((q-.14)/.86),over=ease((q-.54)/.46),breathe=.98+.02*Math.sin(actual*.0034);
 const tint=gold?'#ffac29':'#7b27ff',mid=gold?'#ffe093':'#c68aff',pale=gold?'#fff7dc':'#f4e9ff';
 function bloom(rx,ry,stops,alpha,mode='screen'){
  c.save();c.translate(e.x,e.y);c.scale(1,ry/rx);c.globalCompositeOperation=mode;c.globalAlpha=visibility*alpha*breathe;
  const g=c.createRadialGradient(0,0,0,0,0,rx);for(const [p,col]of stops)g.addColorStop(p,col);c.fillStyle=g;c.fillRect(-rx,-rx,rx*2,rx*2);c.restore();
 }
 // The outer penumbra expands continuously; its invisible edge has no ring.
 bloom(20+253*spread,13+165*spread,[[0,tint+'a0'],[.18,tint+'88'],[.48,tint+'3c'],[.78,tint+'10'],[1,tint+'00']],.15+.70*spread);
 bloom(5+102*spread,4+82*spread,[[0,pale+'ed'],[.10,mid+'e0'],[.27,mid+'a8'],[.55,tint+'58'],[1,tint+'00']],(.06+.92*Math.pow(q,1.45)));
 // Broad, feathered streaks from the same point. They carry light beyond the eye.
 c.save();c.globalCompositeOperation='screen';c.translate(e.x,e.y);
 const span=14+246*Math.pow(spread,1.1),height=.55+2.9*spread;
 for(let k=0;k<9;k++){
  const width=height*(1+k*.6),g=c.createLinearGradient(-span,0,span,0);g.addColorStop(0,tint+'00');g.addColorStop(.19,tint+'00');g.addColorStop(.39,mid+'46');g.addColorStop(.49,pale+'f8');g.addColorStop(.5,'#ffffff');g.addColorStop(.51,pale+'f8');g.addColorStop(.61,mid+'46');g.addColorStop(.81,tint+'00');g.addColorStop(1,tint+'00');
  c.globalAlpha=visibility*(.04+.24*spread)/(1+k*.9);c.fillStyle=g;c.fillRect(-span,-width,span*2,width*2);
 }
 // Late radial scattering is soft, narrow and irregular, never a geometric seal.
 for(let j=0;j<26;j++){
  const ang=j*2.399963+.11*Math.sin(j*8.3)+.012*Math.sin(actual*.001+j),len=(30+(j*37)%125)*over,w=(.8+(j%4)*.5)*(1+over),a=visibility*over*(.04+.06*Math.sin(j*4.3)**2);
  if(len<1)continue;c.save();c.rotate(ang);const g=c.createLinearGradient(0,0,len,0);g.addColorStop(0,pale+'df');g.addColorStop(.25,mid+'8c');g.addColorStop(.7,tint+'22');g.addColorStop(1,tint+'00');c.fillStyle=g;
  for(let f=0;f<3;f++){const ww=w*(1+f*.85);c.globalAlpha=a/(1+f);c.beginPath();c.moveTo(0,-.3);c.lineTo(len,-ww);c.lineTo(len,ww);c.lineTo(0,.3);c.closePath();c.fill();}c.restore();
 }
 c.restore();
 // White saturation spreads out from a pinpoint only in the last third.
 const core=1.1+3.8*q+20*over;
 bloom(core,core*.91,[[0,'#ffffff'],[.25,'#ffffff'],[.48,pale+'ee'],[.7,mid+'ae'],[1,mid+'00']],.62+.38*q,'lighter');
 bloom(3+45*over,3+34*over,[[0,'#ffffffed'],[.19,pale+'d4'],[.53,mid+'54'],[1,mid+'00']],over*.78,'lighter');
 // Gentle exposure bloom across the face reinforces brightness without redrawing it.
 bloom(28+260*over,22+190*over,[[0,pale+'80'],[.2,mid+'3a'],[.6,tint+'13'],[1,tint+'00']],over*.65,'screen');
}

function create(A,{canvasFactory:cf,core}){
 const EYE={x:W*1216/1672,y:H*532/941},edges=[[0,2],[2,4],[4,0],[1,3],[3,5],[5,1]];
 const base=cf(W,H),bc=base.getContext('2d'),face=cf(W,H),fc=face.getContext('2d');
 const smoke=Array.from({length:8},(_,i)=>A['intro_smoke_'+i]||A['meteor_hit_'+Math.min(i,5)]);
 function sprite(c,index,x,y,w,h,alpha,turn=0){if(alpha<=0)return;const z=((index%8)+8)%8,lo=Math.floor(z),f=z-lo;c.save();c.translate(x,y);c.rotate(turn);c.globalCompositeOperation='source-over';for(const[n,a]of [[lo,1-f],[(lo+1)%8,f]]){if(!smoke[n]||a<=0)continue;c.globalAlpha*=alpha*a;c.drawImage(smoke[n],-w/2,-h/2,w,h);c.globalAlpha/=alpha*a;}c.restore();}
 function glow(c,x,y,r,a,rgb='153,70,241'){if(a<=0)return;c.save();c.globalCompositeOperation='screen';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(.27,`rgba(${rgb},${a*.5})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
 function pose(t){const q=ease(4500,5500,t);return{x:1120,y:mix(800,730,q),r:mix(610,470,q),flat:mix(.29,.30,q),turn:mix(.09,0,q)+.008*Math.sin(t*.002)};}
 function point(i,t){const p=pose(t),a=-Math.PI/2+i*TAU/6,x=Math.cos(a)*p.r,y=Math.sin(a)*p.r*p.flat;return{x:p.x+x*Math.cos(p.turn)-y*Math.sin(p.turn),y:p.y+x*Math.sin(p.turn)+y*Math.cos(p.turn)};}
 function line(c,pts,a,w=11){if(a<=0)return;c.save();c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.globalCompositeOperation='source-over';c.lineWidth=w*1.8;c.strokeStyle=`rgba(5,0,13,${a*.85})`;c.stroke();c.globalCompositeOperation='screen';for(const[width,alpha,rgb]of [[w*7,.05,'91,25,165'],[w*3.3,.22,'127,46,215'],[w,.8,'177,97,247'],[w*.25,.72,'232,190,255']]){c.lineWidth=width;c.strokeStyle=`rgba(${rgb},${alpha*a})`;c.stroke();}c.restore();}
 function inkAbsorption(c,t){
  const on=ease(950,1600,t),off=1-ease(4050,5000,t),q=on*off;if(q<=0)return;
  for(let i=0;i<38;i++){
   const life=1450+rand(i,71)*800,phase=frac((t-850)/life+rand(i,72)),startAng=i*2.39996,rr=420+rand(i,73)*970;
   const ex=EYE.x+Math.cos(startAng)*rr,ey=EYE.y+Math.sin(startAng)*rr*.66;
   const travel=phase*phase*(3-2*phase),curl=Math.sin(Math.PI*phase)*(50+rand(i,74)*100);
   const x=mix(ex,EYE.x+Math.cos(i)*30,travel)+Math.sin(phase*5+i)*curl,y=mix(ey,EYE.y,travel)+Math.cos(phase*5+i)*curl*.55;
   const a=q*Math.sin(Math.PI*phase)*(.38+rand(i,75)*.32),d=105+rand(i,76)*135;
   sprite(c,t/115+i*.71,x,y,d,d*.65,a,startAng-t*.00018);
   for(let j=0;j<2;j++){
    const xx=x+Math.cos(i+j+t*.003)*d*.22,yy=y+Math.sin(i+j+t*.003)*d*.15;
    glow(c,xx,yy,13,a*.43);c.save();c.globalCompositeOperation='screen';c.globalAlpha=a*.9;c.fillStyle='#a96ce8';c.translate(xx,yy);c.rotate(i+t*.0018);c.beginPath();c.moveTo(-3,-6);c.lineTo(3,-2);c.lineTo(2,6);c.lineTo(-2,2);c.fill();c.restore();
   }
  }
 }
 function inkDrown(c,t){const q=ease(2150,3450,t);if(q<=0)return;
  // Growing, asymmetric ink lobes modulate the same portrait, never replace it.
  c.save();c.globalCompositeOperation='source-over';
  for(let i=0;i<13;i++){
   const angle=i*TAU/13,rad=1080*(1-.53*q),x=960+Math.cos(angle)*rad+Math.sin(t*.0014+i)*28,y=530+Math.sin(angle)*rad*.65+Math.cos(t*.0011+i)*24,r=(330+rand(i,31)*180)*q;
   if(r<1)continue;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(1,0,6,.72)');g.addColorStop(.45,'rgba(2,0,8,.6)');g.addColorStop(.78,'rgba(3,0,10,.23)');g.addColorStop(1,'rgba(3,0,10,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
   sprite(c,t/170+i*.61,x,y,r*1.35,r*1.35,.34*q,angle+t*.00009);
  }c.restore();
 }
 function portrait(c,t){const dissolve=1-ease(4450,5500,t),appear=clamp(t/650)**.85,ink=ease(2150,3450,t),z=1+.025*ease(100,1600,t)-.025*ease(4200,5500,t);
  fc.setTransform(1,0,0,1,0,0);fc.clearRect(0,0,W,H);fc.fillStyle='#000';fc.fillRect(0,0,W,H);
  fc.save();fc.translate(960,540);fc.scale(z,z);fc.translate(-960,-540);
  fc.globalAlpha=appear*(.78-.52*ink);fc.drawImage(A.eyesH,0,0,W,H);fc.globalAlpha=1;
  // Keep Luochen's original gold iris readable; only the opposite violet eye blooms.
  const dim=fc.createRadialGradient(W*494/1672,H*536/941,15,W*494/1672,H*536/941,235);dim.addColorStop(0,'rgba(1,0,5,.16)');dim.addColorStop(1,'rgba(1,0,5,0)');fc.globalAlpha=appear;fc.fillStyle=dim;fc.fillRect(260,320,620,550);fc.globalAlpha=1;
  inkDrown(fc,t);inkAbsorption(fc,t);
  // First reveal the unchanged painted iris. Then the *whole eye* blooms outward.
  // The original Riyue radiance was authored in half-size logical coordinates;
  // scale it with the 1080P eye socket rather than leaving a tiny pupil flare.
  // Peak at 2.10 s; ink starts only after 2.15 s, with the broad violet aura held.
  const power=ease(950,2100,t),energyVisibility=appear*ease(850,1250,t);
  const eyeScale=2.45;
  fc.save();fc.translate(EYE.x,EYE.y);fc.scale(eyeScale,eyeScale);
  spreadingEyeRadiance(fc,{x:0,y:0},power,energyVisibility,t,false);fc.restore();
  for(let j=0;j<3;j++){const age=frac(t/1150+j/3);sprite(fc,t/125+j*.4,EYE.x+61+age*25,EYE.y-27-age*95,65+age*38,90+age*70,appear*.46*Math.sin(age*Math.PI),-.45);}
  fc.restore();c.save();c.globalAlpha=dissolve;c.drawImage(face,0,0);c.restore();
 }
 function sixStar(c,t){if(t<2500||t>=5500)return;const alpha=1-ease(4900,5500,t),nodes=Array.from({length:6},(_,i)=>point(i,t));
  for(let i=0;i<6;i++){const a=ease(2500+i*92,2690+i*92,t)*alpha;if(a<=0)continue;glow(c,nodes[i].x,nodes[i].y,38,a*.75);glow(c,nodes[i].x,nodes[i].y,10,a*.85,'220,169,255');}
  for(let j=0;j<6;j++){
   const progress=clamp((t-3200-j*205)/275);if(!progress)continue;const a=nodes[edges[j][0]],b=nodes[edges[j][1]],end={x:mix(a.x,b.x,progress),y:mix(a.y,b.y,progress)},len=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/len,ny=(b.x-a.x)/len;
   line(c,[a,end],alpha,12);
   // Hairline black fractures interrupt the inner glow; purple pulses bridge them.
   for(let k=0;k<8;k++){const u=(k+.4)/8;if(u>progress)continue;const x=mix(a.x,b.x,u),y=mix(a.y,b.y,u),f=Math.sin(t*.009+k+j)*2;c.save();c.strokeStyle=`rgba(6,0,19,${alpha*.85})`;c.lineWidth=2;c.beginPath();c.moveTo(x-nx*8,y-ny*8);c.lineTo(x+nx*2+f,y+ny*2);c.lineTo(x+nx*8,y+ny*8);c.stroke();c.restore();}
   for(let k=0;k<3;k++){const u=frac(t*.0004+k/3+j*.11);if(u>progress)continue;const x=mix(a.x,b.x,u),y=mix(a.y,b.y,u);glow(c,x,y,29,.37*alpha);sprite(c,t/135+j+k,x,y-18,70,70,.35*alpha,-.3);}
   if(progress<1){glow(c,end.x,end.y,45,.7*alpha);glow(c,end.x,end.y,12,alpha,'226,178,255');}
  }
  if(t>=4500){const p=pose(t),q=ease(4500,5050,t),pts=[];for(let j=0;j<=100;j++){const a=j/100*TAU*q;pts.push({x:p.x+Math.cos(a)*p.r*1.09,y:p.y+Math.sin(a)*p.r*p.flat*1.09});}line(c,pts,alpha*.62,5);}
 }
 function render(c,t){c.save();c.setTransform(GMXT(c));c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,W,H);
  const full=ease(4500,5500,t),local=Math.max(900,t-4400);
  if(full>0){core.render(bc,local,{caster:false});c.globalAlpha=1;c.drawImage(base,0,0);c.globalAlpha=1;}
  portrait(c,t);sixStar(c,t);
  // Same lower-right cut-in position and original two-handed pose as the light skill.
  // It dissolves into the full-scene caster at the exact same coordinates.
  c.save();core.layers.caster(c,t-4400,ease(1000,2500,t));c.restore();
  c.restore();
 }
 function stage(t){return t<950?'黑暗 · 紫色虹膜显露':t<2150?'整眼爆亮 · 紫光映面':t<2500?'烟絮内吸 · 天地吞光':t<3200?'暗聚六点':t<4500?'逐笔裂纹 · 地上画阵':'永夜溶接 · 裂渊落地';}
 return{render,stage,inspect:t=>({timeMs:t,phase:stage(t),faceSource:'assets/eyes.png (same light portrait)',eye:EYE,eyeBloomScale:2.45,irisRevealMs:[350,950],eyeExpansionMs:[950,2100],inkSwallowMs:[2150,3450],star:Array.from({length:6},(_,i)=>point(i,t)),dissolve:ease(4500,5500,t),endLegacyTime:1100})};
}
const api={create,duration:5500};G.HEIAN_INTRO=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

(function(G){'use strict';
const SHIFT=4400,INTRO=5500,JOIN=1100,DURATION=18600;
function create(A,options){const node=typeof module!=='undefined'&&module.exports,Core=node?require('./heian-core.js'):G.HEIAN_CORE,Intro=node?require('./dark-intro.js'):G.HEIAN_INTRO;const core=Core.create(A,{...options,mirrorPrelude:true}),intro=Intro.create(A,{...options,core}),local=t=>Math.max(0,t-SHIFT);
 return{render(c,t){t=Math.max(0,Math.min(DURATION,t));if(t<INTRO)intro.render(c,t);else core.render(c,local(t));},inspect(t){return{timeMs:t,durationMs:DURATION,introEndMs:INTRO,timelineShiftMs:SHIFT,legacyTimeMs:t<INTRO?null:local(t),prelude:t<INTRO?intro.inspect(t):null,core:t>=INTRO?core.inspect(local(t)):null,chargeMs:[11400,13300],hitMs:13700}},stage:t=>t<INTRO?intro.stage(t):core.stage(local(t)),duration:DURATION,battle:core.battle,rain:core.rain,core,intro,rigState:t=>core.rigState(local(t)),renderGod:(c,t)=>core.renderGod(c,local(t))};}
const api={create,width:1920,height:1080,duration:DURATION,SHIFT,INTRO,JOIN,SETTINGS:{chargeStart:11400,chargeEnd:13300,slamTime:13700}};G.HEIAN_STAGE=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

// ---------- 接入游戏 ----------
(function () {
  const DUR = 18.6, SHIFT = 4400;
  const X = window.HAX = { snap: document.createElement('canvas') };
  let st = null, A = null, ready = false, loading = null, real = null;
  const load = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
  const idle = () => new Promise(r => setTimeout(r, 0));
  const cf = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function preload() {
    if (loading) return loading;
    loading = (async () => {
      const meta = await (await fetch('hax_assets/meta.json')).json();
      const pages = await Promise.all(Array.from({ length: meta.pages }, (_, i) => load('hax_assets/p' + i + '.webp')));
      A = {};
      for (const [k, [p, x, y, w, h]] of Object.entries(meta.atlas)) { const c = cf(w, h); c.getContext('2d').drawImage(pages[p], x, y, w, h, 0, 0, w, h); A[k] = c; }
      A.battle_luochen_tuotian = A.tuotianH; A.battle_held_sun = A.sun_7;
      Object.defineProperty(A, 'battle', { get: () => X.snap });
      await idle();
      st = HEIAN_STAGE.create(A, { canvasFactory: cf });
      // 预热（建缓存、编译着色器）
      const c = cf(960, 540), g = c.getContext('2d'); X.snap.width = 960; X.snap.height = 540; g.__gmxM = new DOMMatrix().scale(.5, .5);
      for (const t of [500, 2500, 4800, 6000, 9000, 12000, 13800, 14500, 15500, 17000]) { try { st.render(g, t); } catch (e) { console.error('ha warm', t, e); } await idle(); }
      ready = true;
    })();
    return loading;
  }
  const K = () => 1920 / W;
  const imgOf = u => { const im = IMG[u.key]; return im && im.width ? im : cf(100, 200); };
  function setup(P, enemies, allies) {
    const k = K(), F = u => ({ x: (u.x + (u.ox || 0)) * k, y: (u.y + (u.oy || 0)) * k, h: u.h * k, w: u.h * k * .8, img: imgOf(u) });
    HA_BATTLE.setReal({
      caster: { x: (P.x + (P.ox || 0)) * k, y: (P.y + (P.oy || 0)) * k, height: P.h * k * 340 / 410 },
      allies: (allies || []).map((u, i) => ({ id: 'a' + i, name: u.name, ...F(u) })),
      enemies: enemies.map(F)
    });
    st.rain.reset();
    real = { enemies: enemies.map(e => ({ u: e, ox: e.ox || 0, oy: e.oy || 0 })) };
  }
  const local = T => T < 5500 ? Math.max(900, T - SHIFT) : T - SHIFT;
  // 0 层（单位之下）：背景先按「原版背景亮度 ÷ 原版单位亮度」压暗，单位画上来后整体再按单位亮度压暗 —— 两者亮度都与原版一致
  function back(t) {
    const T = t * 1000; if (T < 4400) return;
    const { d, c } = st.core.darkness(local(T)), bg = 1 - .74 * d - .04 * c, un = 1 - .47 * d - .05 * c, a = 1 - bg / Math.max(.01, un);
    if (a > 0) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,' + a + ')'; ctx.fillRect(-50, -50, W + 100, H + 100); ctx.restore(); }
  }
  function front(t) {
    const g = ctx, cv = g.canvas, s = X.snap, T = Math.min(DUR * 1000, t * 1000);
    // 敌人跟着原版的受压 / 挣扎 / 受击位移（只移动位置）
    if (real) { const k = K(), es = st.battle.enemies; real.enemies.forEach((r, i) => { const u = es[i]; if (!u) return; const m = T >= 5500 ? st.battle.motion(u, local(T)) : { x: 0, y: 0 }; r.u.ox = r.ox + m.x / k; r.u.oy = r.oy + m.y / k; }); }
    if (s.width !== cv.width || s.height !== cv.height) { s.width = cv.width; s.height = cv.height; }
    const sx = s.getContext('2d'); sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalCompositeOperation = 'copy'; sx.drawImage(cv, 0, 0); sx.globalCompositeOperation = 'source-over';
    const m = g.getTransform();
    g.__gmxM = new DOMMatrix([cv.width / 1920, 0, 0, cv.height / 1080, 0, 0]);
    g.save(); g.setTransform(g.__gmxM); st.render(g, T); g.restore(); g.setTransform(m); delete g.__gmxM;
    // 最后那一下（我们自己的地火翻涌 / 光柱 / 爆发），叠在原版命中之上
    if (window.HA_RT && HA_RT.ready && HA_RT.finale) HA_RT.finale(t);
  }
  function done() { if (real) real.enemies.forEach(r => { r.u.ox = r.ox; r.u.oy = r.oy; }); real = null; }
  window.HA_CODEX = { preload, get ready() { return ready; }, DUR, setup, back, front, done, get st() { return st; } };
})();
