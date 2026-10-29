// ================= 洛尘 · 光明本源 —— Codex 原代码，实时运行 =================
// 由 gmxb/build.py 从 Codex 交付的 particles / stage1 / giant / battle-layer / impact / sequence-fx / healing / stage2 拼成
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
 const point=opts.point;if(typeof point!=='function')throw new Error('GM_PARTICLES requires projected array point()');
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
  g.addColorStop(0,'rgba(255,255,255,'+alpha+')');g.addColorStop(.25,'rgba(255,255,255,'+alpha*.58+')');g.addColorStop(.62,'rgba(255,255,255,'+alpha*.16+')');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
 }
 function drawOne(c,p,s,t){
  if(s.alpha<.004)return;
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=s.alpha;
  glow(c,s.x,s.y,p.haloRadius,.60*p.glowStrength,p.radius*.6);
  c.save();c.translate(s.x,s.y);c.rotate(p.hairPhase+t*.00019);
  c.lineWidth=p.sizeBand==='large'?.9:.65;c.strokeStyle='rgba(255,255,255,.23)';
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
   g.addColorStop(0,'#ffffff');g.addColorStop(.58,'rgba(255,255,255,.98)');g.addColorStop(1,'rgba(255,255,255,0)');
   c.fillStyle=g;c.beginPath();c.arc(s.x,s.y,p.radius*1.16,0,TAU);c.fill();
  }else{c.fillStyle='#fff';c.beginPath();c.arc(s.x,s.y,p.radius,0,TAU);c.fill();}
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
root.GM_PARTICLES={create};if(typeof module!=='undefined')module.exports=root.GM_PARTICLES;
})(typeof window!=='undefined'?window:globalThis);

/* 光明本源 · 统一说明第一阶段，仅 0–5.5 秒。所有长度单位为1080P原生像素。 */
(function(root){
'use strict';
const W=1920,H=1080,DURATION=5500,TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
const frac=x=>x-Math.floor(x);
const rand=(i,k=0)=>frac(Math.sin(i*127.1+k*311.7+23.49)*43758.5453123);
const angles=Array.from({length:6},(_,i)=>-Math.PI/2+i*TAU/6);
const edges=[[0,2],[2,4],[4,0],[1,3],[3,5],[5,1]];
function spreadingEyeRadiance(c,e,q,visibility,actual,gold=false){
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

function create(A={}){
 const R=620;
 const ParticleModule=typeof module!=='undefined'&&module.exports?require('./particles.js'):root.GM_PARTICLES;
 function pose(t){const q=ease((t-4500)/1000);return{x:1175,y:270,scale:mix(.92,1,q),tilt:Math.PI/18,flatten:.296,rotation:(.08+.018*q+.006*Math.sin(Math.max(0,t-5500)*.0008))*TAU,expansion:q};}
 function point(angle,r,t,z=0){
  const p=pose(t),a=angle+p.rotation,x=Math.cos(a)*r*p.scale,y=Math.sin(a)*r*p.scale*p.flatten+z*p.scale;
  return{x:p.x+x*Math.cos(p.tilt)-y*Math.sin(p.tilt),y:p.y+x*Math.sin(p.tilt)+y*Math.cos(p.tilt)};
 }
 const motes=ParticleModule.create({point,angles,starRadius:R});
 function glow(c,x,y,r,alpha,color='255,255,255',inner=0){
  if(alpha<=0)return;c.save();c.globalCompositeOperation='screen';
  const g=c.createRadialGradient(x,y,inner,x,y,r);g.addColorStop(0,'rgba('+color+','+alpha+')');g.addColorStop(.22,'rgba('+color+','+alpha*.7+')');g.addColorStop(.53,'rgba('+color+','+alpha*.27+')');g.addColorStop(1,'rgba('+color+',0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
 }
 function path(c,pts){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));}
 // Analytic multi-band falloff keeps a genuine luminous field at native resolution.
 // Widths refer to TOTAL perpendicular screen-space width, unaffected by perspective.
 function halo(c,pts,total,core,peak,tint='255,255,255'){
  path(c,pts);let previous=0;
  const n=14;
  for(let k=0;k<=n;k++){
   const q=k/n,w=mix(total,core,q),target=peak*q*q*(3-2*q);
   const a=(target-previous)/Math.max(.001,1-previous);previous=target;
   if(a<=0)continue;c.lineWidth=w;c.strokeStyle='rgba('+tint+','+a+')';c.stroke();
  }
 }
 function luminous(c,pts,alpha=1,width=12,t=0,seed=0){
  if(pts.length<2||alpha<=0)return;
  const breathing=.965+.035*Math.sin(t*.007+seed*1.9);
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha*breathing;c.lineCap='round';c.lineJoin='round';
  halo(c,pts,100,width,.25,'241,246,255');
  halo(c,pts,40,width,.70);
  path(c,pts);c.strokeStyle='#ffffff';c.lineWidth=width;c.stroke();
  c.restore();
 }
 function flare(c,x,y,amount,t,seed=0,size=1){
  if(amount<=0)return;
  glow(c,x,y,90*size,.32*amount);glow(c,x,y,38*size,.8*amount);glow(c,x,y,16*size,.96*amount);
  c.save();c.translate(x,y);c.globalCompositeOperation='screen';c.globalAlpha=amount;c.fillStyle='#fff';c.beginPath();c.arc(0,0,5.5*size,0,TAU);c.fill();
  for(let i=0;i<4;i++){
   c.save();c.rotate(i*Math.PI/2+.12*Math.sin(seed));
   const length=(i%2?24:37)*size*(.94+.06*Math.sin(t*.01+seed));
   const g=c.createLinearGradient(0,0,length,0);g.addColorStop(0,'#ffffff');g.addColorStop(.22,'#ffffffa0');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.beginPath();c.moveTo(0,-2.6*size);c.lineTo(length,0);c.lineTo(0,2.6*size);c.closePath();c.fill();c.restore();
  }c.restore();
 }
 function sampleLine(a,b,q){return{x:mix(a.x,b.x,q),y:mix(a.y,b.y,q)};}
 function pulse(c,a,b,q,t,seed){
  const L=Math.hypot(b.x-a.x,b.y-a.y);if(L<1)return;
  for(let k=0;k<3;k++){
   const u=frac(t*.00032+k/3+seed*.173);if(u>q)continue;
   const p=sampleLine(a,b,u),back=sampleLine(a,b,Math.max(0,u-70/L));
   glow(c,p.x,p.y,57,.53);glow(c,p.x,p.y,24,.66);
   c.save();c.globalCompositeOperation='screen';c.globalAlpha=.68;c.lineCap='round';c.lineWidth=22;
   const g=c.createLinearGradient(back.x,back.y,p.x,p.y);g.addColorStop(0,'#ffffff00');g.addColorStop(.6,'#ffffff58');g.addColorStop(.85,'#ffffffa0');g.addColorStop(1,'#ffffff00');
   c.strokeStyle=g;path(c,[back,p]);c.stroke();c.restore();
  }
 }
 function sparks(c,a,b,q,t,seed,isHead=false){
  const L=Math.hypot(b.x-a.x,b.y-a.y);if(L<2)return;
  const nx=-(b.y-a.y)/L,ny=(b.x-a.x)/L;
  c.save();c.globalCompositeOperation='screen';c.lineCap='round';
  for(let k=0;k<(isHead?13:18);k++){
   const cycle=(t*.0014+rand(k,seed+5)*1.3),life=frac(cycle),u=isHead?q:rand(k,seed+12);if(u>q||life>.9)continue;
   const side=rand(k,seed+9)>.5?1:-1,p=sampleLine(a,b,u),d=(5+life*(isHead?70:42))*side;
   const x=p.x+nx*d+Math.sin(k)*life*15,y=p.y+ny*d-life*16;
   const al=Math.sin(Math.PI*life)*.62;
   glow(c,x,y,4+rand(k,seed+17)*5,al*.4);
   c.globalAlpha=al;c.strokeStyle='#fff';c.lineWidth=.8+rand(k,seed+22)*1.4;
   path(c,[{x:x-nx*side*(2+life*6),y:y-ny*side*(2+life*6)},{x,y}]);c.stroke();
  }c.restore();
 }
 function vertex(c,t,i){const q=ease((t-(2500+i*92))/190);if(q<=0)return;const p=point(angles[i],R,t);flare(c,p.x,p.y,q,t,i,.92);}
 function star(c,t){
  if(t<3200)return;
  for(let j=0;j<6;j++){
   const q=clamp((t-(3200+j*205))/275);if(q<=0)continue;
   const a=point(angles[edges[j][0]],R,t),b=point(angles[edges[j][1]],R,t),end=sampleLine(a,b,q);
   luminous(c,[a,end],1,12,t,j);pulse(c,a,b,q,t,j);sparks(c,a,b,q,t,j);
   if(q<1){flare(c,end.x,end.y,1,t,j,1.25);sparks(c,a,b,q,t,j+31,true);}
  }
 }
 function rings(c,t){
  if(t<4500)return;
  const layers=[{r:685,z:0,start:4500,dir:1,w:11},{r:650,z:-23,start:4570,dir:-1,w:10},{r:625,z:18,start:4640,dir:1,w:10}];
  for(const [k,l]of layers.entries()){
   const progress=ease((t-l.start)/(5500-l.start));if(progress<=0)continue;
   for(const offset of [0,Math.PI]){
    const pts=[];for(let j=0;j<=90;j++){const q=j/90*progress;pts.push(point(offset-Math.PI/2+q*Math.PI*l.dir,l.r,t,l.z));}
    luminous(c,pts,.94,l.w,t,k+8);
    if(progress<1){const p=pts[pts.length-1];flare(c,p.x,p.y,.82,t,k,.7);}
    for(let j=0;j<3;j++){
     const u=frac(t*.00038+j/3+k*.13);if(u>progress)continue;
     const a=offset-Math.PI/2+u*Math.PI*l.dir,p=point(a,l.r,t,l.z);
     glow(c,p.x,p.y,47,.48);const arc=[];for(let n=0;n<=12;n++)arc.push(point(a-(n/12)*.09*l.dir,l.r,t,l.z));luminous(c,arc,.4,4,t,j);
    }
   }
  }
 }
 function faceState(t){return {alpha:mix(.075,.44,ease(t/1000)),power:t<1000?.78*ease(t/1000):mix(.78,1,ease((t-1000)/4500))};}
 function face(c,t,visibility=1){if(!A.eyes)return;const s=faceState(t);c.save();c.globalCompositeOperation='screen';c.globalAlpha=s.alpha*visibility;c.drawImage(A.eyes,0,0,W,H);c.restore();}
 function eyeLight(c,t,visibility=1,powerFactor=1){const s=faceState(t),gold={x:W*494/1672,y:H*536/941};c.save();c.scale(2,2);spreadingEyeRadiance(c,{x:gold.x/2,y:gold.y/2},s.power*powerFactor,visibility,t,true);c.restore();}
 function battlefield(c,t){
  const q=ease((t-4500)/1000);if(q<=0||!A.battle)return;
  c.save();c.globalAlpha=q*.92;c.drawImage(A.battle,0,0,W,H);c.globalAlpha=.41;c.fillStyle='#000';c.fillRect(0,0,W,H);c.restore();glow(c,1175,255,710,q*.16);
 }
 function render(c,t){
  t=clamp(t,0,DURATION);c.save();c.setTransform(GMX.M);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,W,H);
  battlefield(c,t);face(c,t);motes.draw(c,t);rings(c,t);star(c,t);for(let i=0;i<6;i++)vertex(c,t,i);eyeLight(c,t);c.restore();
 }
 function stage(t){return t<1000?'黑暗 · 金眸点燃':t<2500?'飞絮光粒 · 分层漂游':t<3200?'汇聚六个亮点':t<4500?'白热光头 · 逐边连星':'光脉流转 · 星阵旋转扩大';}
 function inspect(t){
  const nodes=angles.map(a=>point(a,R,t)),xs=nodes.map(p=>p.x);
  const outer=Array.from({length:360},(_,i)=>point(i*TAU/360,685,t));
  return{timeMs:t,face:faceState(t),array:{...pose(t),starSpan:Math.max(...xs)-Math.min(...xs),outerSpan:Math.max(...outer.map(p=>p.x))-Math.min(...outer.map(p=>p.x)),nodes},particles:motes.inspect(t)};
 }
 return{render,stage,inspect,duration:DURATION,geometry:{point,pose},layers:{battlefield,face,eyeLight,star,rings,vertex,motes,glow,luminous}};
}
root.GUANGMING_STAGE1={create,width:W,height:H,duration:DURATION};
if(typeof module!=='undefined')module.exports=root.GUANGMING_STAGE1;
})(typeof window!=='undefined'?window:globalThis);

(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.GM_GIANT=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const W=1536,H=1024,OX=780,OY=85,S=.72,TAU=Math.PI*2;
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const mix=(a,b,u)=>a+(b-a)*u;
 const smooth=u=>{u=clamp(u);return u*u*(3-2*u);};
 const ease=(a,b,v)=>smooth((v-a)/(b-a));
 const rnd=(i,seed=0)=>{const n=Math.sin(i*127.1+seed*311.7)*43758.5453123;return n-Math.floor(n);};
 const ANCHOR_NAMES=['head','neck','waist','leftShoulder','leftElbow','leftWrist','leftPalm','rightShoulder','rightElbow','rightWrist','rightPalm'];
 const FIXED={head:[630,225],waist:[620,666]};
 // Before the push, complete original paintings are unchanged. During the
 // push, a fixed B plate and one opaque painted source per arm are composited.
 const KEYPOSES={
  A:{head:[630,225],neck:[659,325],waist:[620,666],leftShoulder:[535,420],leftElbow:[405,590],leftWrist:[247,696],leftPalm:[172,724],rightShoulder:[875,345],rightElbow:[1107,421],rightWrist:[1285,325],rightPalm:[1325,269]},
  B:{head:[654,225],neck:[687,327],waist:[680,661],leftShoulder:[577,388],leftElbow:[363,396],leftWrist:[177,376],leftPalm:[120,350],rightShoulder:[910,341],rightElbow:[1128,430],rightWrist:[1204,263],rightPalm:[1197,205]},
  C:{head:[654,225],neck:[687,327],waist:[680,661],leftShoulder:[795,415],leftElbow:[835,580],leftWrist:[715,590],leftPalm:[640,585],rightShoulder:[853,351],rightElbow:[788,450],rightWrist:[608,425],rightPalm:[551,389]},
  D:{head:[654,225],neck:[687,327],waist:[680,661],leftShoulder:[755,410],leftElbow:[919,548],leftWrist:[851,596],leftPalm:[803,602],rightShoulder:[822,350],rightElbow:[515,395],rightWrist:[225,389],rightPalm:[165,367]}
 };
 KEYPOSES.B1={head:[654,225],neck:[687,327],waist:[680,661],leftShoulder:[577,388],leftElbow:[363,396],leftWrist:[177,376],leftPalm:[120,350],rightShoulder:[880,345],rightElbow:[1070,395],rightWrist:[990,330],rightPalm:[950,275]};
 KEYPOSES.B2={head:[654,225],neck:[687,327],waist:[680,661],leftShoulder:[540,390],leftElbow:[440,470],leftWrist:[400,430],leftPalm:[410,390],rightShoulder:[880,350],rightElbow:[935,490],rightWrist:[840,450],rightPalm:[790,395]};
 KEYPOSES.S1={head:[654,225],neck:[687,327],waist:[680,661],leftShoulder:[795,415],leftElbow:[835,580],leftWrist:[715,590],leftPalm:[640,585],rightShoulder:[853,351],rightElbow:[710,425],rightWrist:[525,410],rightPalm:[460,373]};
 KEYPOSES.S2={head:[654,225],neck:[687,327],waist:[680,661],leftShoulder:[795,415],leftElbow:[945,525],leftWrist:[870,590],leftPalm:[803,602],rightShoulder:[850,350],rightElbow:[515,410],rightWrist:[235,384],rightPalm:[165,359]};
 KEYPOSES.P0={...KEYPOSES.B2,rightShoulder:[870,350],rightElbow:[1000,500],rightWrist:[910,480],rightPalm:[860,445]};
 KEYPOSES.P1={...KEYPOSES.C,rightShoulder:[850,350],rightElbow:[865,485],rightWrist:[770,438],rightPalm:[733,373]};
 KEYPOSES.P2={...KEYPOSES.C,rightShoulder:[850,345],rightElbow:[775,455],rightWrist:[608,425],rightPalm:[550,390]};
 KEYPOSES.P3={...KEYPOSES.C,rightShoulder:[850,345],rightElbow:[710,410],rightWrist:[525,390],rightPalm:[455,355]};
 // Separately painted one-frame smears: each has one connected pair of arms.
 // If a development asset is absent its slot holds C; never blend two poses.
 const ORDER=['A','B','B1','B2','C','P0','P1','P2','P3','S1','S2','D'];
 const FRAME=1000/30;
 const TIMELINE=[{key:'A',t:5500},{key:'B',t:7000},{key:'B1',t:270*FRAME},{key:'P0',t:272*FRAME},{key:'P2',t:274*FRAME},{key:'S1',t:277*FRAME},{key:'S2',t:278*FRAME},{key:'D',t:279*FRAME}];
 function sourceAt(t,keys=ORDER){
  let requested='A';for(const entry of TIMELINE)if(t+1e-7>=entry.t)requested=entry.key;
  const key=keys.includes(requested)&&KEYPOSES[requested]?requested:(requested==='S1'||requested==='S2'?'C':requested==='B1'||requested==='B2'?'B':'A');
  return{key,requested};
 }
 function register(key,x,y){
  const p=KEYPOSES[key],q=ease(p.head[1]+95,p.waist[1],y);
  return[x+mix(FIXED.head[0]-p.head[0],FIXED.waist[0]-p.waist[0],q),y+mix(FIXED.head[1]-p.head[1],FIXED.waist[1]-p.waist[1],q)];
 }
 function registeredAnchor(key,name){return register(key,...KEYPOSES[key][name]);}
 function warpControls(key,t){
  const controls=[];
  // One complete B drawing pulls back uniformly. The surrounding pixels use
  // the same smooth field, so no detached forearm, cutout, or extra limb exists.
  if(key==='B'&&t>=7000){const q=clamp((t-7000)/1900);controls.push({center:registeredAnchor(key,'rightPalm'),dx:52*q,dy:-7*q,radius:245});}
  if(key==='D'&&t>=9300&&t<9400){const q=Math.sin(clamp((t-9300)/100)*Math.PI);controls.push({center:registeredAnchor(key,'rightPalm'),dx:8*q,dy:-1.2*q,radius:220});}
  return controls;
 }
 function deform(key,x,y,t,controls){
  const p=register(key,x,y),headRigid=1-ease(.85,1.2,Math.hypot((p[0]-FIXED.head[0])/230,(p[1]-FIXED.head[1]+30)/230));
  const waistRigid=1-ease(0,150,Math.hypot(p[0]-FIXED.waist[0],p[1]-FIXED.waist[1]));
  let dx=0,dy=0;
  for(const z of controls){const d=Math.hypot(p[0]-z.center[0],p[1]-z.center[1])/z.radius,q=Math.exp(-d*d*2);dx+=z.dx*q;dy+=z.dy*q;}
  const flow=(1-headRigid)*ease(7000,7600,t),cloth=ease(700,1024,y),hair=ease(920,1350,x)*(1-ease(330,590,y));
  dx+=Math.sin(t*.0027-y*.008)*Math.max(cloth,hair*.45)*5*flow;
  dy+=Math.sin(t*.0022+x*.006)*Math.max(cloth,hair*.4)*3*flow;
  const protect=(1-headRigid)*(1-waistRigid);
  return[p[0]+dx*protect,p[1]+dy*protect];
 }
 function leftKey(key){return key==='B1'?'B':key==='P0'?'B2':key==='S2'||key==='D'?'D':'C';}
 function armPoint(key,side,x,y,t){
  const p=register(key,x,y),root=registeredAnchor(key,side+'Shoulder');
  const target=deform('B',...KEYPOSES.B[side+'Shoulder'],8900,warpControls('B',8900));
  const proximal=side==='right'||key==='B2';
  const f=proximal?1-ease(42,190,Math.hypot(p[0]-root[0],p[1]-root[1])):0;
  let dx=(target[0]-root[0])*f,dy=(target[1]-root[1])*f;
  if(key==='D'&&side==='right'&&t>=9300&&t<9400){const palm=registeredAnchor(key,'rightPalm'),d=Math.hypot(p[0]-palm[0],p[1]-palm[1])/220,q=Math.sin(clamp((t-9300)/100)*Math.PI)*Math.exp(-2*d*d);dx+=8*q;dy-=1.2*q;}
  return[p[0]+dx,p[1]+dy];
 }
 function nativePose(t,keys=ORDER){
  const source=sourceAt(t,keys),out={},controls=warpControls(source.key,t);
  for(const n of ANCHOR_NAMES){
   if(t<9000)out[n]=deform(source.key,...KEYPOSES[source.key][n],t,controls);
   else if(n==='head'||n==='neck'||n==='waist'||n.endsWith('Shoulder'))out[n]=deform('B',...KEYPOSES.B[n],8900,warpControls('B',8900));
   else{const side=n.startsWith('left')?'left':'right',k=side==='left'?leftKey(source.key):source.key;out[n]=armPoint(k,side,...KEYPOSES[k][n],t);}
  }
  return{...out,source};
 }
 function poseFor(t,keys){
  const p=nativePose(t,keys),r={};for(const n of ANCHOR_NAMES)r[n]={x:OX+p[n][0]*S,y:OY+p[n][1]*S};
  return{...r,attackDirection:{x:-.995,y:.10},opacity:t>=5500&&t<12000?1:0,formation:ease(5500,7000,t),dissolution:ease(10500,12000,t),sourcePose:p.source.key,sourceKey:p.source.key,sourceMix:0,oneSourceOnly:t<9000,oneSourcePerArm:true,fixedBody:t>=9000};
 }
 function pose(t){return poseFor(t,ORDER);}
 // ===== 光栅化改为 WebGL 网格（Codex 原版是 CPU 逐像素三角网格，手机上一帧要几百毫秒）=====
 // 变形公式（register / deform / warpControls / armPoint / 时间轴）全部沿用上面 Codex 原代码，
 // 只是把「三角形 → 像素」这一步交给显卡；静态合成（暖色处理、锁臂底板、头部蒙版、臂膀裁切）由离线脚本按 Codex 原代码预先算好。
 function create(A,options={}){
  const lightVariant='faint',X=A.__gmx,meta=X.meta,PAD=48,GW=W+PAD;
  const keys=ORDER.slice();
  const cf=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const glc=cf(GW,H),gl=glc.getContext('webgl',{premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:false,alpha:true,depth:false,stencil:false});
  if(!gl)throw new Error('WebGL unavailable');
  const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
  const prog=gl.createProgram();
  gl.attachShader(prog,sh(gl.VERTEX_SHADER,'attribute vec2 p;attribute vec2 s;uniform vec4 cr;varying vec2 uv;void main(){uv=(s-cr.xy)/cr.zw;gl_Position=vec4((p.x+'+PAD+'.0)/'+GW+'.0*2.0-1.0,1.0-p.y/'+H+'.0*2.0,0.0,1.0);}'));
  gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 uv;uniform sampler2D tx;void main(){gl_FragColor=texture2D(tx,uv);}'));
  gl.linkProgram(prog);gl.useProgram(prog);
  const aP=gl.getAttribLocation(prog,'p'),aS=gl.getAttribLocation(prog,'s'),uCr=gl.getUniformLocation(prog,'cr');
  const bP=gl.createBuffer(),bS=gl.createBuffer();gl.enableVertexAttribArray(aP);gl.enableVertexAttribArray(aS);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.enable(gl.BLEND);gl.viewport(0,0,GW,H);
  const tex={};
  function T(name,crop){
   if(tex[name])return tex[name];const src=A[name];if(!src)throw new Error('missing '+name);
   const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   return tex[name]={t,crop:crop||[0,0,src.width,src.height]};
  }
  const armTex=k=>T('arm_'+k,meta.arms[k]);
  function drawTris(tx,P,Sx){gl.bindTexture(gl.TEXTURE_2D,tx.t);gl.uniform4f(uCr,...tx.crop);
   gl.bindBuffer(gl.ARRAY_BUFFER,bP);gl.bufferData(gl.ARRAY_BUFFER,P,gl.STREAM_DRAW);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
   gl.bindBuffer(gl.ARRAY_BUFFER,bS);gl.bufferData(gl.ARRAY_BUFFER,Sx,gl.STREAM_DRAW);gl.vertexAttribPointer(aS,2,gl.FLOAT,false,0,0);
   gl.drawArrays(gl.TRIANGLES,0,P.length/2);}
  function quad(tx,x,y,w,h){const P=new Float32Array([x,y,x+w,y,x,y+h,x+w,y,x+w,y+h,x,y+h]);drawTris(tx,P,P);}
  const NX=32,NY=24,vertices=[],triangles=[];
  for(let j=0;j<=NY;j++)for(let i=0;i<=NX;i++)vertices.push({x:i*W/NX,y:j*H/NY});
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+1,c=a+NX+1,d=c+1;triangles.push([a,b,d],[a,d,c]);}
  const PB=new Float32Array(triangles.length*6),SB=new Float32Array(triangles.length*6);
  function drawWarped(key,t,tx,transform){
   const controls=warpControls(key,t);
   for(const v of vertices){const p=transform?transform(v.x,v.y):deform(key,v.x,v.y,t,controls);v.dx=p[0];v.dy=p[1];}
   let n=0;
   for(const ids of triangles){const a=vertices[ids[0]],b=vertices[ids[1]],c=vertices[ids[2]],den=(b.dx-a.dx)*(c.dy-a.dy)-(c.dx-a.dx)*(b.dy-a.dy);if(den<=0)continue;   // 折叠三角形与原版一样跳过
    for(const v of [a,b,c]){PB[n]=v.dx;SB[n]=v.x;PB[n+1]=v.dy;SB[n+1]=v.y;n+=2;}}
   drawTris(tx,PB.subarray(0,n),SB.subarray(0,n));
  }
  let lastT=NaN;
  function paint(t){
   if(lastT===t)return;lastT=t;const key=sourceAt(t,keys).key;
   gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
   if(t>=9000){   // 锁臂：固定 B 底板（已含原版头部合成）+ 左右各一张原画手臂
    quad(T('plateP'),0,0,W,H);
    for(const side of ['left','right']){const k=side==='left'?leftKey(key):key;drawWarped(k,t,armTex(side+'_'+k),(x,y)=>armPoint(k,side,x,y,t));}
   }else{
    drawWarped(key,t,T(key==='A'?'giantA':'giantB'));
    // applyCanonicalHead：out = out·(1−m) + head·m（预乘空间），两遍混合完成
    const h=meta.head;gl.blendFunc(gl.ZERO,gl.ONE_MINUS_SRC_ALPHA);quad(T('headK',h),h[0],h[1],h[2],h[3]);
    gl.blendFunc(gl.ONE,gl.ONE);quad(T('headM',h),h[0],h[1],h[2],h[3]);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
   }
  }
  const mask=cf(W,H),mc=mask.getContext('2d'),maskP=cf(GW,H),mp=maskP.getContext('2d'),revealed=cf(GW,H),rc=revealed.getContext('2d');
  function formMask(t){
   mc.clearRect(0,0,W,H);mc.globalCompositeOperation='source-over';mc.globalAlpha=1;
   if(t>=7000&&t<=10500){mc.fillStyle='white';mc.fillRect(0,0,W,H);return;}
   if(t<7000){
    const limit=-160+Math.pow(ease(5500,7000,t),.72)*1340;
    mc.fillStyle='white';mc.shadowColor='white';mc.shadowBlur=20;mc.beginPath();mc.moveTo(-20,-20);mc.lineTo(W+20,-20);mc.lineTo(W+20,limit);
    for(let x=W+20;x>=-20;x-=20)mc.lineTo(x,limit+Math.sin(x*.014+t*.002)*31+Math.sin(x*.043-t*.003)*13);mc.closePath();mc.fill();mc.shadowBlur=0;return;
   }
   const q=clamp((t-10500)/1500),limit=H+120-ease(10500,11980,t)*(H+300),whole=1-ease(11700,12000,t);
   for(let x=0;x<W;x+=8){const edge=limit+(Math.sin(x*.009+t*.001)+.55*Math.sin(x*.021-t*.0008))*72,g=mc.createLinearGradient(0,edge-115,0,edge+115);g.addColorStop(0,'rgba(255,255,255,'+whole+')');g.addColorStop(.35,'rgba(255,255,255,'+(.87*whole)+')');g.addColorStop(.72,'rgba(255,255,255,'+(.28*whole)+')');g.addColorStop(1,'rgba(255,255,255,0)');mc.fillStyle=g;mc.fillRect(x,0,8,H);}
   mc.globalCompositeOperation='destination-out';
   for(let i=0;i<76;i++){const age=clamp((q-(.07+rnd(i,71)*.73))/.22);if(age<=0)continue;const x=260+rnd(i,72)*1200,y=30+rnd(i,73)*940,r=(12+rnd(i,74)*42)*Math.sqrt(age),g=mc.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+(.8*age)+')');g.addColorStop(.45,'rgba(0,0,0,'+(.65*age)+')');g.addColorStop(1,'rgba(0,0,0,0)');mc.fillStyle=g;mc.fillRect(x-r,y-r,r*2,r*2);}
   mc.globalCompositeOperation='source-over';
  }
  function draw(c,t){
   if(t<5500||t>=12000)return;paint(t);
   if(t>=7000&&t<=10500){c.save();c.translate(OX,OY);c.scale(S,S);c.drawImage(glc,-PAD,0);c.restore();return;}   // 这段遮罩是全白：直接画，省掉两次整张合成
   formMask(t);
   mp.clearRect(0,0,GW,H);mp.drawImage(mask,PAD,0);mp.drawImage(mask,0,0,1,H,0,0,PAD,H);
   rc.globalCompositeOperation='source-over';rc.clearRect(0,0,GW,H);rc.drawImage(glc,0,0);rc.globalCompositeOperation='destination-in';rc.drawImage(maskP,0,0);rc.globalCompositeOperation='source-over';
   c.save();c.translate(OX,OY);c.scale(S,S);c.drawImage(revealed,-PAD,0);c.restore();
  }
  function auraAnchors(t){const p=poseFor(t,keys);return{halo:{x:OX+655*S,y:OY+163.5*S,radiusX:160*S,radiusY:152*S},head:p.head,neck:p.neck,leftShoulder:p.leftShoulder,rightShoulder:p.rightShoulder,waist:p.waist,placement:{x:OX,y:OY,scale:S},headScale:1};}
  // 轮廓粒子取样：原版每帧整张读回像素，这里读回 1/4 分辨率
  const EW=Math.ceil(GW/4),EH=Math.ceil(H/4),ec=cf(EW,EH),ex=ec.getContext('2d',{willReadFrequently:true});
  let edgeTime=NaN,edgeCache=[];
  function edgePoints(t,count=96){
   paint(t);if(edgeTime!==t){edgeTime=t;edgeCache=[];ex.clearRect(0,0,EW,EH);ex.drawImage(glc,0,0,EW,EH);const d=ex.getImageData(0,0,EW,EH).data,
    alpha=(x,y)=>d[((Math.max(0,Math.min(EH-1,y/4))|0)*EW+(Math.max(0,Math.min(EW-1,(x+PAD)/4))|0))*4+3];
    for(let y=320;y<H-8;y+=10)for(let x=8;x<W-8;x+=10){const a=alpha(x,y);if(a<56)continue;const l=alpha(x-6,y),r=alpha(x+6,y),u=alpha(x,y-6),b=alpha(x,y+6);if(Math.min(l,r,u,b)>40)continue;const nx=l-r,ny=u-b,n=Math.hypot(nx,ny)||1;edgeCache.push({x:OX+x*S,y:OY+y*S,nx:nx/n,ny:ny/n,alpha:a/255});}
   }
   if(edgeCache.length<=count)return edgeCache.map(p=>({...p}));return Array.from({length:count},(_,i)=>({...edgeCache[Math.floor(i*edgeCache.length/count)]}));
  }
  function warm(){for(const k of ['plateP','giantA','giantB'])T(k);T('headK',meta.head);T('headM',meta.head);for(const k of Object.keys(meta.arms))armTex(k);}
  return{draw,drawUnder(){},lightVariant,auraAnchors,edgePoints,pose:t=>poseFor(t,keys),warm,glc,width:1920,height:1080,placement:{x:OX,y:OY,scale:S},sourcePoses:KEYPOSES};
 }
 return{create,pose,sourcePoses:KEYPOSES,timeline:TIMELINE,width:1920,height:1080};
});

/* Original v8 battle artwork, separated for actual enemy recoil.
   Browser: GM_BATTLE.create(A); CommonJS: require(...).create(A).
   A keys are listed in manifest.json. Times are milliseconds, 1920 x 1080.
   draw(ctx, t, opts) honors the caller's transform, filter and global alpha.
   Caster is excluded from draw() by default: call drawCasterForeground() after
   the deity and impact. It reuses the original b_luochen_ult painting throughout
   the shot; no standing-pose return. The held sun is a separate approved asset. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GM_BATTLE=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
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
function create(A){
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
  if(u.id==='luochen')return drawCasterForeground(c,t,opts);
  const p=motion(u,t),x=u.x+p.x,y=u.y+p.y;
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
  c.restore();
 }
 function draw(c,t,opts={}){
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(opts.background!==false){c.save();c.fillStyle=(globalThis.MATTE||'#000');c.fillRect(0,0,1920,1080);c.restore();}
  if(opts.caster===true&&(!opts.side||opts.side==='ally'))drawCasterForeground(c,t,opts);
  c.restore();
 }
 function enemyPositions(t){return units.filter(u=>u.side==='enemy').map(u=>{
  const p=motion(u,t),x=u.x+p.x,y=u.y+p.y,b=u.screenBounds;
  const anchor=(px,py)=>{const dx=(px-u.x)*p.scaleX,dy=(py-u.y)*p.scaleY;return{x:x+dx*Math.cos(p.angle)-dy*Math.sin(p.angle),y:y+dx*Math.sin(p.angle)+dy*Math.cos(p.angle)}};
  const center=anchor(b[0]+b[2]/2,b[1]+b[3]/2),damage=anchor(b[0]+b[2]*.48,b[1]+b[3]*.22);
  return{...u,x,y,angle:p.angle,scaleX:p.scaleX,scaleY:p.scaleY,hitFlash:p.flash,centerX:center.x,centerY:center.y,damageX:damage.x,damageY:damage.y};
 })}
 return{draw,drawUnit,drawCasterForeground,casterState,units,get enemies(){return units.filter(u=>u.side==='enemy')},get allies(){return units.filter(u=>u.side==='ally')},enemyPositions,motion};
}
function setReal(conf){
 Object.assign(CASTER,{x:conf.caster.x,y:conf.caster.y,height:conf.caster.height});
 Object.assign(units[0],{x:CASTER.x,y:CASTER.y,height:CASTER.height,screenBounds:[CASTER.x+(82-CASTER.footX)*CASTER.height/656,CASTER.y-CASTER.height,433*CASTER.height/656,CASTER.height]});
 units.length=1;
 for(const a of conf.allies)units.push({id:a.id,name:a.name,side:'ally',x:a.x,y:a.y,height:a.h,img:a.img,footX:a.img.width/2,footY:a.img.height,naturalHeight:a.img.height,screenBounds:[a.x-a.w/2,a.y-a.h,a.w,a.h]});
 conf.enemies.forEach((e,i)=>units.push({id:'e'+i,idx:i,name:'e'+i,side:'enemy',x:e.x,y:e.y,height:e.h,footX:0,footY:0,naturalHeight:e.h,screenBounds:[e.x-e.w/2,e.y-e.h,e.w,e.h]}));
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
const api={draw,time,flash,camera,inspect,targets:TARGETS};G.GM_IMPACT=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);

(function(G){'use strict';
const META={
  "0": [
    {
      "key": "seq_0_0",
      "width": 502,
      "height": 241,
      "origin": [
        468.434,
        111.5
      ]
    },
    {
      "key": "seq_0_1",
      "width": 502,
      "height": 241,
      "origin": [
        464.336,
        111.763
      ]
    },
    {
      "key": "seq_0_2",
      "width": 502,
      "height": 241,
      "origin": [
        459.926,
        111.883
      ]
    },
    {
      "key": "seq_0_3",
      "width": 502,
      "height": 246,
      "origin": [
        461.749,
        119.315
      ]
    },
    {
      "key": "seq_0_4",
      "width": 502,
      "height": 246,
      "origin": [
        462.144,
        119.572
      ]
    },
    {
      "key": "seq_0_5",
      "width": 502,
      "height": 246,
      "origin": [
        460.134,
        119.451
      ]
    },
    {
      "key": "seq_0_6",
      "width": 502,
      "height": 244,
      "origin": [
        460.564,
        113.739
      ]
    },
    {
      "key": "seq_0_7",
      "width": 502,
      "height": 244,
      "origin": [
        461.692,
        117.519
      ]
    },
    {
      "key": "seq_0_8",
      "width": 502,
      "height": 244,
      "origin": [
        461.118,
        118.047
      ]
    },
    {
      "key": "seq_0_9",
      "width": 502,
      "height": 253,
      "origin": [
        463.058,
        113.856
      ]
    },
    {
      "key": "seq_0_10",
      "width": 502,
      "height": 253,
      "origin": [
        465.643,
        113.078
      ]
    },
    {
      "key": "seq_0_11",
      "width": 502,
      "height": 253,
      "origin": [
        466.356,
        113.597
      ]
    }
  ],
  "1": [
    {
      "key": "seq_1_0",
      "width": 374,
      "height": 500,
      "origin": [
        187,
        0
      ]
    },
    {
      "key": "seq_1_1",
      "width": 374,
      "height": 500,
      "origin": [
        187,
        0
      ]
    },
    {
      "key": "seq_1_2",
      "width": 374,
      "height": 500,
      "origin": [
        187,
        0
      ]
    },
    {
      "key": "seq_1_3",
      "width": 374,
      "height": 500,
      "origin": [
        187,
        0
      ]
    },
    {
      "key": "seq_1_4",
      "width": 374,
      "height": 504,
      "origin": [
        187,
        0
      ]
    },
    {
      "key": "seq_1_5",
      "width": 374,
      "height": 504,
      "origin": [
        187,
        0
      ]
    },
    {
      "key": "seq_1_6",
      "width": 374,
      "height": 504,
      "origin": [
        187,
        0
      ]
    },
    {
      "key": "seq_1_7",
      "width": 374,
      "height": 504,
      "origin": [
        187,
        0
      ]
    }
  ],
  "2": [
    {
      "key": "seq_2_0",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        365
      ]
    },
    {
      "key": "seq_2_1",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        361
      ]
    },
    {
      "key": "seq_2_2",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        351
      ]
    },
    {
      "key": "seq_2_3",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        337
      ]
    },
    {
      "key": "seq_2_4",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        288
      ]
    },
    {
      "key": "seq_2_5",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        279
      ]
    },
    {
      "key": "seq_2_6",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        285
      ]
    },
    {
      "key": "seq_2_7",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        309
      ]
    }
  ],
  "3": [
    {
      "key": "seq_3_0",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        399
      ]
    },
    {
      "key": "seq_3_1",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        389
      ]
    },
    {
      "key": "seq_3_2",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        381
      ]
    },
    {
      "key": "seq_3_3",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        366
      ]
    },
    {
      "key": "seq_3_4",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        353
      ]
    },
    {
      "key": "seq_3_5",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        353
      ]
    },
    {
      "key": "seq_3_6",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        354
      ]
    },
    {
      "key": "seq_3_7",
      "width": 374,
      "height": 502,
      "origin": [
        187,
        353
      ]
    }
  ],
  "4": [
    {
      "key": "seq_4_0",
      "width": 617,
      "height": 617,
      "origin": [
        308.5,
        392.412
      ]
    },
    {
      "key": "seq_4_1",
      "width": 617,
      "height": 617,
      "origin": [
        308.5,
        392.412
      ]
    },
    {
      "key": "seq_4_2",
      "width": 617,
      "height": 617,
      "origin": [
        308.5,
        392.412
      ]
    },
    {
      "key": "seq_4_3",
      "width": 617,
      "height": 617,
      "origin": [
        308.5,
        392.412
      ]
    }
  ]
};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=(a,b,t)=>{const q=clamp((t-a)/(b-a));return q*q*(3-2*q);};
// These are the approved imagegen cels. Interpolation only joins adjacent
// painted optical fields; it never substitutes one translated still for motion.
function blend(keys,t){
 if(t<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){
  const q=(t-keys[i-1][0])/(keys[i][0]-keys[i-1][0]);
  return keys[i-1][1]+(keys[i][1]-keys[i-1][1])*q;
 }return keys.at(-1)[1];
}
function mainIndex(t){
 return blend([[9300,0],[9317,1],[9333,2],[9367,3],[9384,4],
 [9400,5],[9480,6],[9580,7],[9680,8],[9770,7],[9860,6],
 [9950,7],[10040,8],[10130,9],[10320,10],[10500,11]],t);
}
function pillarIndex(t,birth){
 if(t<9400)return blend([[birth,0],[birth+(9400-birth)*.30,1],[birth+(9400-birth)*.65,2],[9400,3]],t);
 return blend([[9400,3],[9490,4],[9600,5],[9720,4],[9850,5],[10000,4],[10130,5],[10300,6],[10500,7]],t);
}
function create(A,cf){
 const cache=new Map();
 function field(group,index){
  const m=META[group][index],key=m.key;
  if(cache.has(key))return cache.get(key);
  const im=A[key];if(!im)throw Error('Missing generated sequence frame '+key);
  const pad=55,cv=A[key+'_b']||cf(1,1);
  // Large-radius blur is only the approved mist shell. The unblurred cel
  // carries the original glass waves, volume and sparks.
  const r={im,m,blur:cv,pad};cache.set(key,r);return r;
 }
 function frames(group,index,draw){
  index=clamp(index,0,META[group].length-1);
  const i=Math.floor(index),f=index-i;
  draw(field(group,i),1-f);
  if(f>.001&&i+1<META[group].length)draw(field(group,i+1),f);
 }
 function shaft(c,t,from,to,branch=false,birth=9300){
  if(t<birth||t>=10500)return;
  const dx=to.x-from.x,dy=to.y-from.y,full=Math.hypot(dx,dy);
  const alpha=(.7+.3*ease(birth,birth+30,t))*(1-ease(10360,10500,t));
  const group=branch?1:0,index=branch?pillarIndex(t,birth):mainIndex(t);
  c.save();c.translate(from.x,from.y);c.rotate(Math.atan2(dy,dx));
  c.globalCompositeOperation='screen';
  frames(group,index,(f,w)=>{
   const m=f.m,[ox,oy]=m.origin,p=f.pad;
   if(branch){
    // All three vertical pillars use the exact same painted material.
    const sx=250/m.width,sy=full/(m.height*.968);
    c.save();c.rotate(-Math.PI/2);
    c.globalAlpha=alpha*w*.18;c.drawImage(f.blur,-(ox+p)*sx*1.75,-p*sy,(m.width+2*p)*sx*1.75,(m.height+2*p)*sy);
    c.globalAlpha=alpha*w*.76;c.drawImage(f.im,-ox*sx,0,m.width*sx,m.height*sy);
    c.restore();
   }else{
    const sx=full/(ox-12),sy=2.25;
    c.save();c.scale(-1,1);
    c.globalAlpha=alpha*w*.27;
    c.drawImage(f.blur,-ox*sx-p*sx,-(oy+p)*sy*1.8,(m.width+2*p)*sx,(m.height+2*p)*sy*1.8);
    c.globalAlpha=alpha*w*.16;
    c.drawImage(f.blur,-ox*sx-p*sx,-(oy+p)*sy*1.22,(m.width+2*p)*sx,(m.height+2*p)*sy*1.22);
    c.globalAlpha=alpha*w*.88;c.drawImage(f.im,-ox*sx,-oy*sy,m.width*sx,m.height*sy);
    c.restore();
   }
  });
  c.restore();
 }
 function burst(c,t,p,main=false){
  const age=t-9400;if(age<0||age>950)return;
  const group=main?2:3,index=blend([[0,0],[35,1],[110,2],[210,3],[340,4],[500,5],[670,6],[900,7]],age);
  const alpha=(main?.69:.85)*(1-ease(740,950,age));
  c.save();c.globalCompositeOperation='screen';
  frames(group,index,(f,w)=>{
   const scale=main?1.42:.90,[ox,oy]=f.m.origin;
   c.globalAlpha=alpha*w;
   c.drawImage(f.im,p.x-ox*scale,p.y-oy*scale,f.m.width*scale,f.m.height*scale);
   c.globalAlpha=alpha*w*.12;
   c.drawImage(f.blur,p.x-(ox+f.pad)*scale,p.y-(oy+f.pad)*scale,(f.m.width+2*f.pad)*scale,(f.m.height+2*f.pad)*scale);
  });c.restore();
 }
 function seal(c,t,x,y,r,alpha,index){
  if(alpha<=0)return;
  const frame=t<9310?blend([[7500+index*90,0],[7900+index*90,1]],t):
   blend([[9310,1],[9400,2],[9460,1],[9540,3]],t);
  c.save();c.globalCompositeOperation='screen';
  frames(4,frame,(f,w)=>{
   const sx=r*2.4/(f.m.width*.94),sy=sx*.75,[ox,oy]=f.m.origin;
   c.globalAlpha=alpha*w*(t>=9400&&t<9460?.95:.70);
   c.drawImage(f.im,x-ox*sx,y-oy*sy,f.m.width*sx,f.m.height*sy);
  });c.restore();
 }
 function draw(c,t,o){
  if(t<9300||t>=10500)return;
  const targets=o.targets.map(p=>({...p}));
  if(t>=9400&&o.drawEnemyForeground)o.drawEnemyForeground(c,t);
  // Small celestial columns stay visible through the broad foreground shaft.
  for(let i=0;i<targets.length;i++){
   const p=targets[i];shaft(c,t,{x:p.x,y:-90},{x:p.x,y:p.y},true,9316+i*9);
  }
  shaft(c,t,o.palm,o.end,false);
  // Ground bursts are in front of the shafts; damage numbers are drawn last
  // by stage2, entirely outside this optical compositing pass.
  for(const p of targets)burst(c,t,p,false);
  burst(c,t,{x:590,y:735},true);
 }
 return{draw,seal,inspect:t=>({main:mainIndex(t),pillars:[9316,9325,9334].map(b=>pillarIndex(t,b)),source:'40 imagegen painted frames',mist:'same frames, radius19px, vertical expansion1.8×, screen alpha0.27',sealRiseRemoved:true})};
}
const api={create};G.GM_SEQUENCE=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);

(function(root){'use strict';
// The exact Stage 1/12-second dissolve GM_PARTICLES instance is injected here.
// No new particles, sprite, size, color, halo, filament or drawOne implementation.
const SETTINGS={startMs:10500,dissolveMs:400,rainMs:2200,floatFraction:.40,closeStartMs:2200,endMs:3700,healNumber:300,launchSpreadMs:400,numberLifeMs:800};
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,q)=>a+(b-a)*q;
const smooth=q=>{q=clamp(q);return q*q*(3-2*q);};
const ease=(a,b,t)=>smooth((t-a)/(b-a)),frac=x=>x-Math.floor(x),rand=(i,s)=>frac(Math.sin(i*127.1+s*311.7)*43758.5453123);
function closingTime(t){if(t<=10500)return t;return t<=12700?10500:t-2200;}
function deityTime(t){return t<=10500?t:10500+1500*clamp((t-10500)/SETTINGS.dissolveMs);}
function create(A,{canvasFactory:cf,battle,motes,originalState}){
 if(!motes||!motes.particles||!originalState)throw Error('Inject the original dissolve particle instance');
 const IDS=()=>battle.allies.map(u=>u.id),bodySamples=new Map(),routes=new Map();
 function targets(t){return IDS().map(id=>{const u=battle.allies.find(u=>u.id===id);if(!u)throw Error('Healing target missing: '+id);const s=id==='luochen'?battle.casterState(closingTime(t)):null,foot=s?s.foot:{x:u.x,y:u.y},height=s?s.height:u.height;return{id,name:u.name,unit:u,x:foot.x,y:foot.y,height,head:{x:foot.x,y:foot.y-height}};});}
 function samples(target){
  if(bodySamples.has(target.id))return bodySamples.get(target.id);const u=target.unit,im=(target.id==='luochen'?A.battle_luochen_tuotian:u.img)||A.battle_luochen_tuotian,cv=cf(im.width,im.height),c=cv.getContext('2d');c.drawImage(im,0,0);const d=c.getImageData(0,0,im.width,im.height).data,list=[];
  for(let y=im.height*.15|0;y<im.height*.96;y+=5)for(let x=0;x<im.width;x+=5)if(d[(y*im.width+x)*4+3]>200)list.push({x:(x-u.footX)/u.naturalHeight,y:(y-u.footY)/u.naturalHeight});
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
  return along(fall,k*q+(1-k)*Math.pow(q,2.35));
 }
 function appearance(p,t){const r=route(p),age=t-10500-r.delay;if(age<0||age>=r.life)return 0;
  const born=ease(0,120,age),breath=.6+.4*Math.sin(t*.003+p.phase)**2,near=ease(.65,1,age/r.life);
  return Math.min(1,born*breath*(1+.18*near));
 }
 function state(p,t){return{...position(p,t),alpha:appearance(p,t)};}
 function draw(c,t){if(t<=10500||t>=12700)return;initialize();
  // Short, low-opacity histories of the SAME original mote; no new sprite/style.
  for(const [lag,opacity]of [[24,.045],[12,.085]])motes.draw(c,t,(p)=>{const now=state(p,t),near=ease(.68,1,progress(p,t));if(!now.alpha||!near)return null;const old=position(p,t-lag),dx=old.x-now.x,dy=old.y-now.y,d=Math.hypot(dx,dy),cap=Math.min(1,(lag===24?16:9)/Math.max(.001,d));return{x:now.x+dx*cap,y:now.y+dy*cap,alpha:now.alpha*near*opacity};});
  motes.draw(c,t,p=>state(p,t));
 }
 function firstArrivals(){initialize();return Object.fromEntries(IDS().map(id=>[id,Math.min(...[...routes.values()].filter(r=>r.target===id).map(r=>r.arrival))]));}

 function drawNumbers(c,t){
  const first=firstArrivals();
  for(const target of targets(t)){const age=t-SETTINGS.startMs-first[target.id];if(age<0||age>=SETTINGS.numberLifeMs)continue;
   const fade=1-ease(650,800,age),rise=42*clamp(age/800),pop=1+.10*Math.exp(-age/100);
   c.save();c.globalAlpha=fade;c.globalCompositeOperation='source-over';c.translate(target.head.x,target.head.y-46-rise);c.scale(pop,pop);c.font='900 60px CN, "PingFang SC", sans-serif';c.textAlign='center';c.lineJoin='round';c.lineWidth=9;c.strokeStyle='#3b2b16';c.shadowColor='rgba(29,22,10,.7)';c.shadowBlur=8;c.shadowOffsetY=2;c.strokeText('+'+SETTINGS.healNumber,0,0);c.shadowBlur=0;c.shadowOffsetY=0;c.fillStyle='#fff0bd';c.fillText('+'+SETTINGS.healNumber,0,0);c.restore();
  }
 }
 function inspect(t){const e=t-10500,first=firstArrivals();return{active:e>0&&e<=3700,elapsedMs:e,phase:e<0?'unchanged':e<900?'错开起步、轻轻上浮转落':e<2200?'逐渐加速、落身即消失':e<3700?'托日收势、金眸收光':'结束',targets:targets(t).map(({unit,...v})=>v),particleCount:motes.particles.length,originalParticleInstance:true,appearanceSource:'particles.js drawOne — unchanged',rainWindowMs:[10500,12700],numberWindowsMs:Object.fromEntries(IDS().map(id=>[id,[10500+first[id],11300+first[id]]])),numbersValue:SETTINGS.healNumber,bitmapMotesUsed:0};}
 return{reset(){bodySamples.clear();routes.clear();},draw,drawNumbers,inspect,targets,initialize,position,state,appearance,originalState,originalMotes:motes,debugParticles:()=>motes.particles,route,firstArrivals};
}

const api={create,SETTINGS,closingTime,deityTime};root.GM_HEALING=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

(function(root){
'use strict';
const W=1920,H=1080,DURATION=14200,TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,q)=>a+(b-a)*q,frac=x=>x-Math.floor(x);
const ease=(a,b,t)=>{let q=clamp((t-a)/(b-a));return q*q*(3-2*q)};
const rand=(i,s=0)=>frac(Math.sin(i*127.1+s*311.7)*43758.5453123);
function stage(t){return t<1000?'黑暗 · 金眸点燃':t<2500?'飞絮光粒 · 分层漂游':t<3200?'汇聚六个亮点':t<4500?'白热光头 · 逐边连星':t<5500?'六星分明 · 倾斜成阵':t<7000?'光幕垂落 · 神躯凝结':t<8600?'单姿连续后引 · 左掌锁定':t<8900?'蓄力末段':t<9300?'逐帧推掌 · 手绘拖影':t<9400?'掌心到位 · 天光轰出':t<10500?'神罚命中 · 冲击余韵':'神躯散光 · 金眸收势';}
function sceneTime(t){if(t<9466.6667)return t;if(t<9533.3334)return 9466.6667;if(t<10050)return t-66.6667*(1-ease(9533.3334,10050,t));return t;}
function create(A,options={}){
 const n=typeof module!=='undefined'&&module.exports;
 const Phase=n?require('./stage1.js'):root.GUANGMING_STAGE1;
 const Battle=n?require('./battle-layer.js'):root.GM_BATTLE;
 const Giant=n?require('./giant.js'):root.GM_GIANT;
 if(n)require('./impact.js');const Impact=root.GM_IMPACT;
 const factory=options.canvasFactory||((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});
 const Sequence=n?require('./sequence-fx.js'):root.GM_SEQUENCE;
 const sequence=Sequence.create(A,factory);
 const Healing=n?require('./healing.js'):root.GM_HEALING;
 const lightVariant=['faintest','faint'].includes(options.lightVariant)?options.lightVariant:'faintest';
 const battle=Battle.create(A),giant=Giant.create(A,{canvasFactory:factory,lightVariant});
 const p1=Phase.create(A),L=p1.layers;
 const arr=factory(W,H),ac=arr.getContext('2d'),snapshot=factory(W,H),sc=snapshot.getContext('2d');
 const point=p1.geometry.point;
 const rawMotes=L.motes;
 function originalDissolveMoteState(p,t){
   const q=clamp((t-10500)/1500),start=rand(p.id,83)*.58,born=ease(start,start+.12,q),fade=1-ease(.78,1,q);
   const x=950+rand(p.id,84)*850,y=180+rand(p.id,85)*650;
   return{x:x+Math.sin(q*TAU+p.phase)*(20+rand(p.id,86)*50),y:y-q*(60+rand(p.id,87)*150),alpha:born*fade*(.6+.4*Math.sin(t*.003+p.phase)**2)};
 }
 const healing=Healing.create(A,{canvasFactory:factory,battle,motes:rawMotes,originalState:originalDissolveMoteState});
 // Gold is carried by broad energy layers; the body painting itself is not bleached.
 function goldLine(c,pts,a,width){
  if(a<=0||pts.length<2)return;
  c.save();c.globalCompositeOperation='screen';c.lineCap='round';c.lineJoin='round';
  for(const [scale,opacity,rgb]of [[8,.055,'255,173,39'],[3.6,.18,'255,201,87'],[1,.78,'255,232,165'],[.3,.8,'255,251,229']]){
   c.lineWidth=width*scale;c.strokeStyle=`rgba(${rgb},${a*opacity})`;
   c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
  }c.restore();
 }
 function releaseEnergy(t){return ease(9280,9340,t)*(1-ease(9480,10450,t));}
 function divineHalo(c,t){
  const q=ease(5700,6650,t)*(1-ease(10500,11750,t));if(q<=0)return;
  const anchor=giant.auraAnchors?giant.auraAnchors(t):{halo:{x:1251.6,y:202.72,rx:115.2,ry:109.44}};
  const h=anchor.halo||anchor, x=h.x||1251.6,y=h.y||202.72,rx=h.rx||h.radiusX||115.2,ry=h.ry||h.radiusY||109.44;
  const burst=releaseEnergy(t),spin=(t-5500)*.000105;
  c.save();c.globalCompositeOperation='screen';
  // The painted halo stays in place. Its etched ring and interrupted corona revolve.
  for(let ring=0;ring<2;ring++){
   const r=1.04+ring*.11,dir=ring?-1:1;
   for(let j=0;j<6;j++){
    const start=j*TAU/6+spin*dir,pts=[];
    for(let k=0;k<=15;k++){const a=start+k*.035;pts.push({x:x+Math.cos(a)*rx*r,y:y+Math.sin(a)*ry*r});}
    goldLine(c,pts,q*(.28+burst*.46),1.2+burst*1.2);
   }
  }
  for(let i=0;i<28;i++){
   const a=i*TAU/28+spin,r=1.22;
   c.save();c.translate(x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r);c.rotate(a+Math.PI/2);
   c.strokeStyle=`rgba(255,228,165,${q*(.28+burst*.24)})`;c.lineWidth=.85;c.lineCap='round';
   // Small cloud-head scrolls: asymmetric curved seals, without letter-like strokes.
   c.beginPath();c.moveTo(-5.2,2.6);
   c.bezierCurveTo(-2.9,3.2,-3.1,.3,-1.4,-.1);
   c.bezierCurveTo(-4.5,-1.1,-3.9,-4.1,-1.6,-4.1);
   c.bezierCurveTo(.3,-4.1,.8,-2.3,-.2,-1.4);
   c.bezierCurveTo(1.3,-2.2,3.9,-1.7,3.9,.4);
   c.bezierCurveTo(3.9,2.5,1.3,3.4,.4,1.9);
   c.bezierCurveTo(-.3,.8,.7,.1,1.5,.5);
   c.moveTo(-2.3,4.5);c.bezierCurveTo(.5,5.2,3.8,4.3,5.1,2.5);
   if(i%3===0){c.moveTo(-5.9,-.7);c.bezierCurveTo(-6.8,-3.8,-4.7,-6.0,-2.1,-5.9);}
   c.stroke();c.restore();
  }
  if(burst>0){
   L.glow(c,x,y,195,q*burst*.13,'255,211,111');
   for(let i=0;i<8;i++){
    const a=i*TAU/8+spin,r0=rx*1.01,r1=r0+18+burst*(35+rand(i,181)*80);
    goldLine(c,[{x:x+Math.cos(a)*r0,y:y+Math.sin(a)*r0*.95},{x:x+Math.cos(a)*r1,y:y+Math.sin(a)*r1*.95}],q*burst*.22,1.1);
   }
  }
  c.restore();
 }
 function divineShedding(c,t){
  const q=ease(5700,6650,t)*(1-ease(10500,11850,t));if(q<=0||!giant.edgePoints)return;
  const edge=giant.edgePoints(t,96);if(!edge||!edge.length)return;
  c.save();c.globalCompositeOperation='screen';
  for(let i=0;i<96;i++){
   const p=edge[i%edge.length],life=1.4+rand(i,212)*1.8,age=frac(t*.001/life+rand(i,213)),fade=Math.sin(Math.PI*age)**.7;
   const d=5+age*(16+rand(i,214)*52),x=p.x+(p.nx||0)*d+Math.sin(age*3.6+i)*12,y=p.y+(p.ny||0)*d-age*(45+rand(i,215)*95);
   const a=q*fade*(.42+rand(i,216)*.5)*(p.alpha===undefined?1:clamp(p.alpha*3,.5,1));
   const r=1.7+rand(i,217)*2.7;
   L.glow(c,x,y,r*6,a*.33,'255,194,65');
   c.fillStyle=`rgba(255,235,170,${a})`;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
   if(i%4===0){
    const len=14+rand(i,218)*18,lean=Math.sin(t*.0008+i)*.5;
    c.save();c.translate(x,y);c.rotate(lean-.3);
    const g=c.createLinearGradient(0,0,0,-len);g.addColorStop(0,`rgba(255,227,145,${a*.7})`);g.addColorStop(.5,`rgba(255,214,117,${a*.42})`);g.addColorStop(1,'rgba(255,214,117,0)');
    c.fillStyle=g;c.beginPath();c.moveTo(0,2);c.bezierCurveTo(-5,-len*.3,-4,-len*.7,3,-len);c.bezierCurveTo(6,-len*.5,5,-len*.2,0,2);c.fill();c.restore();
   }
  }
  c.restore();
 }
 function curve(a,b,c,q){const v=1-q;return{x:v*v*a.x+2*v*q*b.x+q*q*c.x,y:v*v*a.y+2*v*q*b.y+q*q*c.y};}
 function stream(c,a,b,end,amount,t,seed,width=3){
  if(amount<=0)return;const pts=[];for(let j=0;j<=26;j++)pts.push(curve(a,b,end,j/26*amount));
  L.luminous(c,pts,.12,width,t,seed);
  const q=frac(t*.00072+seed*.173);if(q<amount){const p=curve(a,b,end,q);L.glow(c,p.x,p.y,19,.45);c.save();c.fillStyle='#fff';c.beginPath();c.arc(p.x,p.y,2.3+seed%3,0,TAU);c.fill();c.restore();}
 }
 function lightCurtain(c,t,P){
  if(t<5500||t>10500)return;
  const charge=ease(7000,8600,t),forming=ease(5500,6400,t),linger=1-ease(9300,9470,t);
  if(linger<=0)return;
  for(let i=0;i<15;i++){
   const a=point(i*TAU/15,310+rand(i,2)*250,t,-3);
   const target={x:1080+rand(i,3)*675,y:500+rand(i,4)*340};
   const end={x:mix(target.x,P.rightPalm.x,charge),y:mix(target.y,P.rightPalm.y,charge)};
   const bend={x:mix(a.x,end.x,.5)+Math.sin(t*.001+i)*45,y:mix(a.y,end.y,.5)+90*charge};
   stream(c,a,bend,end,forming*linger,t,i,1.6+(i%4)*.7);
  }
  if(t<7000){
   const q=ease(5500,6800,t),bottom=270+q*530;
   for(let k=0;k<3;k++){
    c.save();c.globalCompositeOperation='screen';const g=c.createLinearGradient(0,230,0,bottom);
    g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.25,'rgba(255,255,255,'+(.025*q)+')');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;
    c.beginPath();c.moveTo(1180+k*75,250);c.lineTo(1240+k*75,250);c.lineTo(1510+k*55,bottom);c.lineTo(1120+k*55,bottom);c.closePath();c.fill();c.restore();
   }
  }
 }
 function fieldMotes(c,t,P){
  rawMotes.draw(c,t,(p,s)=>{
   if(t<7000)return s;
   if(t<9500){
    const from=rawMotes.state(p,7000);if(from.alpha<.01)return from;
    const start=7000+rand(p.id,81)*320,q=ease(start,9270,t),r=Math.sin(q*Math.PI)*(30+rand(p.id,82)*65);
    return{x:mix(from.x,P.rightPalm.x,q)+Math.sin(q*TAU+p.phase)*r,y:mix(from.y,P.rightPalm.y,q)+Math.cos(q*TAU+p.phase)*r,alpha:from.alpha*(1-ease(.84,1,q))};
   }
   if(t<10500)return{...s,alpha:0};
   return originalDissolveMoteState(p,t);
  });
 }
 function mark(c,x,y,r,flatten,t,alpha){
  if(alpha<=0)return;const vs=Array.from({length:6},(_,i)=>{const a=-Math.PI/2+i*TAU/6;return{x:x+Math.cos(a)*r,y:y+Math.sin(a)*r*flatten}});
  for(const tri of [[0,2,4,0],[1,3,5,1]])L.luminous(c,tri.map(i=>vs[i]),alpha,3.8,t,1);
  const ring=Array.from({length:61},(_,j)=>({x:x+Math.cos(j*TAU/60)*r*1.16,y:y+Math.sin(j*TAU/60)*r*flatten*1.16}));L.luminous(c,ring,alpha*.66,2.2,t,2);
 }
 function locks(c,t,P){
  const q=ease(7350,7900,t)*(1-ease(9400,9800,t));if(q<=0)return;
  // The guiding palm releases its lock as the arm retracts; ground marks remain until impact.
  const handLock=q*(1-ease(8900,9300,t))*.48;
  mark(c,P.leftPalm.x-8,P.leftPalm.y,48,.83,t,handLock*.72);
  for(const [i,u]of battle.enemyPositions(t).entries()){
   const a=ease(7500+(i%3)*90,7900+(i%3)*90,t)*(1-ease(9750,10250,t));
   sequence.seal(c,t,u.x,u.y-3,110,a,i%3);
  }
 }
 function glassGroundSeal(c,x,y,r,t,a,index){
  if(a<=0)return;
  const activation=ease(9316+index*9,9400,t),burst=t>=9400?Math.exp(-(t-9400)/115):0;
  c.save();c.translate(x,y);c.scale(1,.25);c.globalCompositeOperation='screen';
  const disc=c.createRadialGradient(-r*.15,-r*.2,0,0,0,r*1.27);
  disc.addColorStop(0,`rgba(255,248,220,${a*(.025+.035*activation)})`);
  disc.addColorStop(.78,`rgba(255,233,183,${a*.055})`);disc.addColorStop(1,'rgba(255,238,194,0)');
  c.fillStyle=disc;c.beginPath();c.arc(0,0,r*1.27,0,TAU);c.fill();
  const vs=Array.from({length:6},(_,i)=>{let angle=-Math.PI/2+i*TAU/6;return[Math.cos(angle)*r,Math.sin(angle)*r];});
  const line=(draw,width=1)=>{
   for(const [w,opacity,color]of [[10,.055,'255,220,150'],[3.3,.19,'255,234,185'],[1.15,.68,'255,242,204'],[.45,.80,'255,255,243']]){
    c.lineWidth=w*width;c.strokeStyle=`rgba(${color},${a*opacity*(.60+.32*activation+.38*burst)})`;c.beginPath();draw();c.stroke();
   }
  };
  line(()=>{for(const tri of [[0,2,4,0],[1,3,5,1]])tri.forEach((j,k)=>k?c.lineTo(...vs[j]):c.moveTo(...vs[j]));});
  line(()=>c.arc(0,0,r*1.17,0,TAU),.7);line(()=>c.arc(0,0,r*1.30,0,TAU),.5);
  // Small curved seal/cloud motifs are etched into the optical rim.
  for(let k=0;k<18;k++){
   const ang=k*TAU/18+t*.000035;c.save();c.rotate(ang);c.translate(r*1.235,0);
   line(()=>{c.moveTo(-3,-5);c.quadraticCurveTo(5,-6,4,0);c.quadraticCurveTo(2,5,-3,3);c.moveTo(-2,-1);c.quadraticCurveTo(3,-3,1,1);},.45);
   c.restore();
  }
  c.restore();
 }
 function chargeOrb(c,t,P,part='all'){
  if(t<=7000||t>9460)return;
  const q=ease(7000,8600,t),build=ease(7000,7300,t),drop=1-ease(9300,9450,t),p=P.rightPalm,r=10+35*q;
  const squeeze=1-.09*ease(8600,8900,t),R=r*squeeze*(1-.30*ease(8900,9300,t)),pulse=1+.025*Math.sin(t*.037)*(q*q);
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=drop*build;
  if(part!=='inflows'){
  L.glow(c,p.x,p.y,R*2.65,.10+.08*q,'255,181,47');
  L.glow(c,p.x,p.y,R*1.55,.24+.12*q,'255,222,132');
  const core=c.createRadialGradient(p.x-R*.12,p.y-R*.16,0,p.x,p.y,R*pulse);
  core.addColorStop(0,'#fffdf4');core.addColorStop(.25,'#fff9df');core.addColorStop(.54,'rgba(255,236,170,.96)');core.addColorStop(.80,'rgba(255,193,65,.74)');core.addColorStop(1,'rgba(255,176,36,0)');
  c.fillStyle=core;c.beginPath();c.arc(p.x,p.y,R*pulse,0,TAU);c.fill();
  for(let i=0;i<10;i++){
   const a=i*TAU/10+t*.0035,rad=R*(.71+.19*Math.sin(t*.006+i));
   const pts=[];for(let j=0;j<=20;j++){const ang=a+j*.052;pts.push({x:p.x+Math.cos(ang)*rad,y:p.y+Math.sin(ang)*rad*.86});}
   goldLine(c,pts,(.16+.22*q),3.5+q*2);
  }
  }
  if(part!=='core'){
  // Inflows follow the painted right palm; the sphere stays smaller than the head.
  for(let arm=0;arm<6;arm++){
   const pts=[],turn=t*.0022+arm*TAU/6;
   for(let j=0;j<=38;j++){const u=j/38,rr=R+Math.pow(1-u,1.4)*(210+arm*18),ang=turn+(1-u)*2.2;pts.push({x:p.x+Math.cos(ang)*rr,y:p.y+Math.sin(ang)*rr*.57});}
   goldLine(c,pts,(.13+.12*q)*build,1.8+q*1.8);
  }
  for(let i=0;i<172;i++){
   if(t>=9300)break; // Inflow motes are consumed at release; the beam owns the outgoing flow.
   const v=frac((t-7000)*(.0007+rand(i,116)*.0007)+rand(i,117)),rr=R+Math.pow(1-v,1.5)*(170+rand(i,118)*520),a=i*2.39996+(1-v)*4+t*.0006;
   const x=p.x+Math.cos(a)*rr,y=p.y+Math.sin(a)*rr*.58,alpha=Math.sin(Math.PI*v)*(.30+.65*q)*build;
   L.glow(c,x,y,4+rand(i,119)*8,alpha*.48,'255,206,99');
   c.save();c.strokeStyle='rgba(255,234,168,'+alpha+')';c.lineWidth=1.4+rand(i,120)*2.2;c.lineCap='round';
   c.beginPath();c.moveTo(x-Math.cos(a+.8)*(10+q*24),y-Math.sin(a+.8)*(7+q*15));c.lineTo(x,y);c.stroke();c.restore();
  }
  }
  c.restore();
 }
 function pushTrail(c,t){
  if(t<8900||t>9370)return;const fade=ease(8900,8960,t)*(1-ease(9300,9370,t));
  c.save();c.globalCompositeOperation='screen';
  for(let lag=3;lag>=1;lag--){const pts=[];for(let j=0;j<7;j++){const at=t-lag*18-j*7,p=giant.pose(Math.max(8900,at)).rightPalm;pts.push(p);}L.luminous(c,pts,.14*fade*(1-lag*.18),9-lag*1.6,t,lag+150);}
  c.restore();
 }
 function chargeVignette(c,t){
  const q=ease(7000,7550,t)*(1-ease(9300,9500,t));if(q<=0)return;
  c.save();const g=c.createRadialGradient(1280,390,180,960,540,1150);g.addColorStop(0,'rgba(0,3,12,0)');g.addColorStop(.5,'rgba(0,3,12,'+(.08*q)+')');g.addColorStop(1,'rgba(0,3,12,'+(.55*q)+')');c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();
 }
 function battleEye(c,t){
  const restore=ease(10500,11000,t),out=ease(11000,12000,t),size=mix(.28,1,restore),a=mix(.055,1,restore)*(1-out),x=W*494/1672,y=H*536/941;
  c.save();c.translate(x,y);c.scale(size,size);c.translate(-x,-y);L.eyeLight(c,t,a,mix(.54,1,restore)*(1-.25*out));c.restore();
 }
 function damageLabels(c,t){
  const ages=[t-9400,t-9400,t-9400],values=[186,161,183],units=battle.enemyPositions(t);
  const offsets={rhino:[-55,-40],leopard:[-55,-30],wolf:[100,-10]};
  for(let i=0;i<units.length;i++){
   const age=ages[i];if(age<0||age>1050)continue;const u=units[i],a=(.94+.06*ease(0,30,age))*(1-ease(700,1050,age)),pop=1+.19*Math.exp(-age/90),off=offsets[u.id];
   const x=(u.damageX||u.centerX)+off[0],y=(u.damageY||u.centerY)-95+off[1]-Math.min(90,age*.115);
   c.save();c.translate(x,y);c.scale(pop,pop);c.globalAlpha=a;c.globalCompositeOperation='source-over';c.textAlign='center';c.lineJoin='round';
   c.shadowColor='rgba(40,20,7,.75)';c.shadowBlur=9;c.shadowOffsetY=2;
   c.font='900 70px CN, "PingFang SC", sans-serif';c.strokeStyle='#39200d';c.lineWidth=11;c.strokeText('爆',-34,0);c.shadowBlur=0;c.shadowOffsetY=0;c.fillStyle='#fff1b1';c.fillText('爆',-34,0);
   c.font='900 60px CN, "PingFang SC", sans-serif';c.shadowBlur=8;c.shadowOffsetY=2;c.strokeStyle='#321b0b';c.lineWidth=9;c.strokeText(String(values[i]),30,52);c.shadowBlur=0;c.shadowOffsetY=0;c.fillStyle='#fff3c4';c.fillText(String(values[i]),30,52);c.restore();
  }
 }
 function array(c,t,scatter=true){
  const fade=1-ease(10500,11900,t);if(fade<=0)return;
  ac.clearRect(0,0,W,H);L.rings(ac,t);L.star(ac,t);for(let i=0;i<6;i++)L.vertex(ac,t,i);
  const focus=(1-.73*ease(5500,6400,t))*(1-.50*ease(7000,7600,t)*(1-ease(9350,9700,t)));
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=fade*focus;c.drawImage(arr,0,0);c.restore();
  if(t>10500&&scatter)for(let i=0;i<100;i++){const a=i*TAU/100,p=point(a,620+rand(i,93)*65,t),age=clamp((t-10500)/1500);L.glow(c,p.x+Math.sin(i)*age*75,p.y-age*(60+rand(i,94)*90),4+rand(i,95)*9,Math.sin(Math.PI*age)*.48);}
 }
 function battleBrightness(t){const charge=ease(7000,7600,t)*(1-ease(9300,9700,t));return (.44+.15*ease(10500,12000,t))*(1-.25*charge);}
 function drawBattle(c,t){
  c.save();c.globalAlpha=1;c.drawImage(A.battle,0,0,W,H);c.fillStyle='rgba(0,0,0,'+(1-battleBrightness(t))+')';c.fillRect(-W,-H,W*3,H*3);c.restore();
 }
 function divineRadiance(c,t){
  const q=ease(5650,6600,t)*(1-ease(10500,11850,t));
  if(q<=0)return;
  const charge=ease(7000,8600,t)*(1-ease(9300,9650,t));
  const burst=releaseEnergy(t),flare=ease(9260,9300,t)*(1-ease(9430,10150,t)),level=q*(1-.25*charge), cx=1250,cy=345;
  c.save();c.globalCompositeOperation='screen';
  // Environmental emission is separate from the original warm-gold body paint.
  // Dark gaps between long rays preserve contrast instead of laying a white veil.
  let g=c.createRadialGradient(cx,cy,40,cx,cy,780);
  g.addColorStop(0,'rgba(255,220,153,'+(.19*level)+')');
  g.addColorStop(.36,'rgba(255,221,166,'+(.08*level)+')');
  g.addColorStop(1,'rgba(255,225,178,0)');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  // Eight tapered, softly feathered shafts replace the dense hard spoke fan.
  if(!divineRadiance.shaft){
   const cv=factory(256,96),ctx=cv.getContext('2d'),im=ctx.createImageData(256,96),d=im.data;
   for(let yy=0;yy<96;yy++)for(let xx=0;xx<256;xx++){
    const u=xx/255,v=(yy-47.5)/47.5,spread=.13+.69*Math.sin(Math.PI*u)**.76;
    const a=ease(0,.06,u)*(1-ease(.32,1,u))*Math.exp(-3.2*(v/spread)**2),at=(yy*256+xx)*4;
    d[at]=255;d[at+1]=245;d[at+2]=218;d[at+3]=Math.round(a*255);
   }ctx.putImageData(im,0,0);divineRadiance.shaft=cv;
  }
  const angles=[-2.98,-2.48,-1.95,-1.32,-.62,.22,1.08,2.15];
  for(let i=0;i<angles.length;i++){
   const ang=angles[i]+.006*Math.sin(t*.00055+i*2.7),len=(1050+rand(i,922)*660)*(1+burst*.18),width=110+rand(i,923)*150;
   const a=level*(.095+.025*Math.sin(t*.0007+i)**2)+flare*(.16+rand(i,924)*.09);
   c.save();c.translate(cx,cy);c.rotate(ang);
   c.globalAlpha=a*.36;c.drawImage(divineRadiance.shaft,0,-width*.90,len,width*1.8);
   c.globalAlpha=a;c.drawImage(divineRadiance.shaft,0,-width*.50,len,width);
   c.restore();
  }
  c.translate(1330,935);c.scale(1,.22);
  g=c.createRadialGradient(0,0,10,0,0,620);
  g.addColorStop(0,'rgba(255,225,173,'+(.24*level+.32*burst)+')');
  g.addColorStop(.55,'rgba(255,217,147,'+(.10*level+.15*burst)+')');
  g.addColorStop(1,'rgba(255,225,175,0)');
  c.fillStyle=g;c.fillRect(-640,-640,1280,1280);c.restore();
 }
 // Face is resolved in final 1080P pixels, AFTER every glow and particle pass.
 // The source has one offline bicubic resize; the face has no runtime resampling.
 const faceROI={x:62,y:135,w:98,h:102},faceFeather=6;
 function faceCamera(real){
  const v=Impact.camera(real),q=ease(7000,8900,real)*(1-ease(9300,9470,real));
  return {scale:v.scale,x:960+v.x+Math.sin(real*.043)*q*3.4,y:540+v.y+Math.cos(real*.039)*q*2.2};
 }
 const faceReferenceCamera=faceCamera(9300),faceReferenceCenter={x:1211,y:256};
 const faceWorldCenter={x:960+(faceReferenceCenter.x-faceReferenceCamera.x)/faceReferenceCamera.scale,y:540+(faceReferenceCenter.y-faceReferenceCamera.y)/faceReferenceCamera.scale};
 function facePlacement(real){
  const v=faceCamera(real),cx=(faceWorldCenter.x-960)*v.scale+v.x,cy=(faceWorldCenter.y-540)*v.scale+v.y;
  // Translation alone follows the head; fixed output size keeps the approved face identical.
  return {x:Math.round(1100+cx-faceReferenceCenter.x),y:Math.round(70+cy-faceReferenceCenter.y),roi:faceROI,feather:faceFeather};
 }
 function finalFacePixels(c,real,opacityTime=real){
  // 脸部跟着神躯显形的进度出现（原版在身体还没显形时就把脸贴上去，会出现一个方块）
  const q=ease(5500,6000,opacityTime)*ease(5850,6250,opacityTime)*(1-ease(10500,11850,opacityTime));if(!q)return;
  // 原版：读回像素、按羽化把定稿脸部贴回去；这里用离线羽化好的同一张脸直接叠（同样的混合结果）
  const p=facePlacement(real),f=A.__gmx.meta.face;
  c.save();c.setTransform(GMX.M);c.globalAlpha=q;c.globalCompositeOperation='source-over';c.drawImage(A.faceF,p.x+f[0],p.y+f[1]);c.restore();
 }
 function render(c,real){
  real=clamp(real,0,DURATION);if(real<=5500){p1.render(c,real);battle.drawCasterForeground(c,real);return;}
  const ending=real>10500,t=sceneTime(Healing.closingTime(real)),deityT=Healing.deityTime(real),P=giant.pose(t),cam=Impact.camera(real),charging=ease(7000,8900,real)*(1-ease(9300,9470,real));
  c.save();c.setTransform(GMX.M);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,W,H);
  c.translate(W/2+cam.x+Math.sin(real*.043)*charging*3.4,H/2+cam.y+Math.cos(real*.039)*charging*2.2);c.scale(cam.scale,cam.scale);c.translate(-W/2,-H/2);
  drawBattle(c,t);L.face(c,t,.24);chargeVignette(c,t);divineRadiance(c,ending?deityT:t);if(!ending)fieldMotes(c,t,P);array(c,ending?deityT:t,!ending);lightCurtain(c,ending?deityT:t,P);divineHalo(c,ending?deityT:t);pushTrail(c,t);
  // During the four repaired push cels, incoming light stays behind the solid arm.
  const armOcclusion=t>=9000&&t<9300;
  if(armOcclusion)chargeOrb(c,t,P,'inflows');
  giant.draw(c,ending?deityT:t);if(!ending)divineShedding(c,t);locks(c,t,P);chargeOrb(c,t,P,armOcclusion?'core':'all');
  Impact.draw(c,t,{sequence,palm:P.rightPalm,end:{x:-100,y:P.rightPalm.y+190},targets:battle.enemyPositions(9400).map(u=>({x:u.x,y:u.y})),sceneSource:snapshot,drawEnemyForeground:(ctx,at)=>{ctx.save();ctx.globalAlpha=1;ctx.filter='brightness('+battleBrightness(at)+') saturate(.82)';battle.draw(ctx,at,{side:'enemy',background:false,shadows:false});ctx.restore();},impactAtlas:A.impactAtlas,beamTexture:A.impactBeamV11,thunderTexture:A.impactThunderV11});
  battle.drawCasterForeground(c,t);battleEye(c,t);if(ending)healing.draw(c,real);c.restore();
  const f=Impact.flash(real);if(f>0){c.save();c.globalAlpha=f;c.fillStyle='#FFFFFF';c.fillRect(0,0,W,H);c.restore();}
  // Keep the original world positions and camera motion, but draw hit text last.
  c.save();c.setTransform(GMX.M);c.translate(W/2+cam.x+Math.sin(real*.043)*charging*3.4,H/2+cam.y+Math.cos(real*.039)*charging*2.2);c.scale(cam.scale,cam.scale);c.translate(-W/2,-H/2);c.restore();
  finalFacePixels(c,real,ending?deityT:real);
 }
 function inspect(real){const t=Healing.closingTime(real);return{timeMs:real,healing:healing.inspect(real),sceneTimeMs:sceneTime(t),stage:stage(t),giant:giant.pose(sceneTime(t)),array:p1.inspect(t).array,impact:Impact.inspect(sceneTime(t),{palm:giant.pose(sceneTime(t)).rightPalm,end:{x:-100,y:giant.pose(sceneTime(t)).rightPalm.y+190}}),face:{...p1.inspect(t).face,renderedAlpha:t<=5500?p1.inspect(t).face.alpha:.44*.24},goldVisibility:mix(.055,1,ease(10500,11000,t))*(1-ease(11000,12000,t)),chargeOrbDiameter:t<=7000||t>9460?0:2*(10+35*ease(7000,8600,t))*(1-.09*ease(8600,8900,t))*(1-.30*ease(8900,9300,t)),chargeOrbMaximumDiameter:90,battleBrightness:battleBrightness(t),caster:battle.casterState(t)};}
 return{render,inspect,stage,duration:DURATION,facePlacement,healing,battle,giant};
}
root.GUANGMING_STAGE2={create,stage,width:W,height:H,duration:DURATION,sceneTime};
if(typeof module!=='undefined'&&module.exports)module.exports=root.GUANGMING_STAGE2;
})(typeof globalThis!=='undefined'?globalThis:this);

// ---------- 接入游戏：每帧把 Codex 的 1920×1080 画面直接画到战斗画布上 ----------
(function () {
  const GMX = window.GMX = { M: new DOMMatrix(), snap: document.createElement('canvas') };
  const DUR = 14.2;
  let st = null, A = null, ready = false, loading = null;
  const load = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
  const idle = () => new Promise(r => setTimeout(r, 0));
  function preload() {
    if (loading) return loading;
    loading = (async () => {
      const meta = await (await fetch('gmx_assets/meta.json')).json();
      const pages = await Promise.all(Array.from({ length: meta.pages }, (_, i) => load('gmx_assets/p' + i + '.webp')));
      A = {};
      for (const [k, [p, x, y, w, h]] of Object.entries(meta.atlas)) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(pages[p], x, y, w, h, 0, 0, w, h); A[k] = c; }
      A.eyes = A.eyesF; A.battle_luochen_tuotian = A.tuotian; A.battle_held_sun = A.sun;
      Object.defineProperty(A, 'battle', { get: () => GMX.snap });
      A.__gmx = { meta };
      await idle();
      st = GUANGMING_STAGE2.create(A, { lightVariant: 'faint' });
      await idle(); st.giant.warm();
      // 预热：第一次画到某些时刻会建缓存（光束形状、序列帧等），提前在离屏画布上跑一遍
      const c = document.createElement('canvas'); c.width = 960; c.height = 540; const g = c.getContext('2d');
      GMX.snap.width = 960; GMX.snap.height = 540; GMX.M = new DOMMatrix().scale(.5, .5);
      for (const t of [300, 3000, 5000, 6000, 7500, 9100, 9350, 9420, 9600, 10200, 11000, 13000]) { try { st.render(g, t); } catch (e) { console.error('gm warm', t, e); } await idle(); }
      ready = true;
    })();
    return loading;
  }
  const K = () => 1920 / W;
  function setup(P, allies, enemies) {
    const k = K(), F = u => ({ x: (u.x + (u.ox || 0)) * k, y: (u.y + (u.oy || 0)) * k, h: u.h * k, w: u.h * k * .8 });
    const img = u => { const im = IMG[u.key]; return im && im.width ? im : (() => { const c = document.createElement('canvas'); c.width = 100; c.height = 200; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(20, 0, 60, 200); return c; })(); };
    GM_BATTLE.setReal({
      caster: { x: (P.x + (P.ox || 0)) * k, y: (P.y + (P.oy || 0)) * k, height: P.h * k * 340 / 410 },
      allies: allies.map((u, i) => ({ id: 'a' + i, name: u.name, img: img(u), ...F(u) })),
      enemies: enemies.map(F)
    });
    st.healing.reset();
  }
  function front(t) {
    const g = ctx, cv = g.canvas, s = GMX.snap;
    if (s.width !== cv.width || s.height !== cv.height) { s.width = cv.width; s.height = cv.height; }
    const sx = s.getContext('2d'); sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalAlpha = 1; sx.globalCompositeOperation = 'copy'; sx.drawImage(cv, 0, 0); sx.globalCompositeOperation = 'source-over';
    const m = g.getTransform();
    // 快照是整块像素画布：在 Codex 坐标里按 (0,0,1920,1080) 画回去，需要映射到画布像素
    GMX.M = new DOMMatrix([cv.width / 1920, 0, 0, cv.height / 1080, 0, 0]);
    g.save(); g.setTransform(GMX.M); st.render(g, Math.min(DUR * 1000, t * 1000)); g.restore(); g.setTransform(m);
  }
  window.GM_CODEX = { preload, get ready() { return ready; }, DUR, setup, front, get st() { return st; } };
})();
