/* v4 geometry preserved. Only light/material rendering differs. */
(function(){'use strict';const C=x=>Math.max(0,Math.min(1,x)),TAU=Math.PI*2,E=(t,a,b)=>{let q=C((t-a)/(b-a));return q*q*(3-2*q)},R=i=>{let x=Math.sin(i*127.1+49.3)*43758.5453;return x-Math.floor(x)};
let c,A,t,a,mode,metal,kind='rail',index=0,angle=0,elapsed=0,reveal=1,morph=1,baseMatrix=null;const radius=420,dipper=[[-.48,-.20],[-.27,-.32],[-.06,-.20],[.08,.04],[.33,.11],[.49,-.13],[.25,-.28]];
const mk=(w,h)=>{let x=document.createElement('canvas');x.width=w;x.height=h;return x};const flowPlane=mk(1024,1024),fg=flowPlane.getContext('2d');
function visibility(){if(morph<1)return 1;const n=kind==='rune'?32:kind==='tick'?96:kind==='seal'?8:kind==='node'?7:12;return E(reveal,index/n*.75,index/n*.75+.22);}
function lighting(){if(kind==='rune'){let phase=((elapsed*.24-index/32)%1+1)%1;return .22+.78*Math.exp(-Math.pow((phase-.10)/.11,2))+.10*(.5+.5*Math.sin(elapsed*2.2+index*.63));}if(kind==='node'){let phase=((elapsed*.44-index/7)%1+1)%1;return .24+.76*Math.exp(-Math.pow((phase-.1)/.18,2));}return .62+.22*Math.cos(index*.71+elapsed*.35);}
function oldPath(draw,w,alpha=1){c.save();c.lineCap='round';c.lineJoin='round';c.globalCompositeOperation='screen';c.globalAlpha=a*alpha*.32;c.strokeStyle='#ffbe29';c.shadowColor='#ffb523';c.shadowBlur=16;c.lineWidth=w*2.3;c.beginPath();geometry(draw);c.stroke();c.shadowBlur=0;c.globalCompositeOperation='source-over';c.globalAlpha=a*alpha;c.strokeStyle='#46260b';c.lineWidth=w+3;c.beginPath();geometry(draw);c.stroke();c.strokeStyle=metal;c.lineWidth=w;c.stroke();c.globalCompositeOperation='screen';c.strokeStyle='#fff2bc';c.globalAlpha=a*alpha*.95;c.lineWidth=Math.max(.9,w*.22);c.stroke();c.restore();}
function path(draw,w,alpha=1){if(mode==='v4')return oldPath(draw,w,alpha);alpha*=visibility();const energy=lighting(),vary=.9+.15*Math.sin(index*1.72+kind.length),thick=w*2.2*vary;c.save();c.lineCap='round';c.lineJoin='round';c.globalCompositeOperation='screen';c.beginPath();geometry(draw);
c.strokeStyle='#f9e2b7';c.lineWidth=thick*1.6;c.globalAlpha=a*alpha*(.035+.035*energy);c.stroke();
c.strokeStyle='#f1d5a3';c.lineWidth=thick;c.globalAlpha=a*alpha*(.28+.22*energy);c.stroke();
c.strokeStyle='#fffdf6';c.lineWidth=thick*.60;c.globalAlpha=a*alpha*(.35+.30*energy);c.stroke();
c.strokeStyle='#ffffff';c.lineWidth=Math.max(.8,thick*.28);c.globalAlpha=a*alpha*(.48+.38*energy);c.stroke();c.restore();}
function band(inner,outer,alpha){if(mode==='v4')return;const width=outer-inner;if(width>radius*.05)return;const mid=(inner+outer)*.5;c.save();c.globalCompositeOperation='screen';c.beginPath();c.arc(0,0,mid,0,TAU*reveal);c.strokeStyle='#fff1d5';c.lineWidth=width*2.2;c.globalAlpha=a*alpha*.21;c.stroke();c.strokeStyle='#fffdf4';c.lineWidth=width*.9;c.globalAlpha=a*alpha*.34;c.stroke();c.strokeStyle='#ffffff';c.lineWidth=Math.max(1,width*.42);c.globalAlpha=a*alpha*.72;c.stroke();c.restore();}
function lightPath(draw,w,alpha=1){if(mode==='v4')return oldLightPath(draw,w,alpha);alpha*=kind==='rail'?1:visibility();const thick=w*2.2,energy=lighting();c.save();c.lineCap='round';c.lineJoin='round';c.globalCompositeOperation='screen';c.beginPath();geometry(draw);c.strokeStyle='#fff2d8';c.lineWidth=thick*1.55;c.globalAlpha=alpha*.08;c.stroke();c.strokeStyle='#f5dcae';c.lineWidth=thick;c.globalAlpha=alpha*.28;c.stroke();c.strokeStyle='#fffdf6';c.lineWidth=thick*.60;c.globalAlpha=alpha*(.46+.18*energy);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=Math.max(.8,thick*.30);c.globalAlpha=alpha*.84;c.stroke();c.restore();}
function star(x,y,r,alpha=1){const e=lighting();alpha*=visibility();c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha*(.35+.45*e);c.drawImage(A.hit,x-r*1.9,y-r*1.9,r*3.8,r*3.8);c.restore();}
function imageFlow(){fg.setTransform(1,0,0,1,0,0);fg.clearRect(0,0,1024,1024);fg.save();fg.translate(512,512);fg.beginPath();for(const[lo,hi]of[[.973,1.020],[.820,.854],[.691,.718]]){fg.arc(0,0,radius*hi,0,TAU);fg.arc(0,0,radius*lo,0,TAU,true);}fg.clip('evenodd');fg.globalCompositeOperation='screen';
 for(let j=0;j<40;j++){const an=j*TAU/40+elapsed*.10,p=((elapsed*.65+j*.053)%1+1)%1,f=p*8,k=Math.floor(f),u=E(f-k,0,1),power=.10+.90*Math.pow(.5+.5*Math.sin(an*3-elapsed*.5),4);for(const rr of [.994,.837,.705]){fg.save();fg.rotate(an);fg.translate(radius*rr,0);for(const [ix,aa]of[[k,1-u],[(k+1)%8,u]]){fg.globalAlpha=aa*power*.95;fg.drawImage(A['flow'+ix],-44,-90,88,180);}fg.restore();}}
 fg.restore();c.save();c.globalCompositeOperation='screen';c.globalAlpha=a*.15;c.filter='blur(8px)';c.drawImage(flowPlane,-512,-512);c.filter='none';c.globalAlpha=a*.28;c.drawImage(flowPlane,-512,-512);c.restore();}
function dust(seconds,st){for(let i=0;i<28;i++){const q=((seconds*.32+i*.173)%1+1)%1,an=i*2.399+angle,r=(.72+R(i)*.27)*radius,x=435+Math.cos(an)*r*st.grow,y=205+Math.sin(an)*r*.3142857*st.grow-q*74;const alpha=Math.sin(q*Math.PI)*st.a*.42;c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha;c.drawImage(A.hit,x-3,y-5,6,10);c.restore();}}
function gem(x,y,i){const e=lighting(),sz=8+5*e; c.save();c.translate(x,y);c.globalCompositeOperation='source-over';c.globalAlpha=a*visibility()*(.6+.4*e);c.scale(.08+.92*morph,.08+.92*morph);const gr=c.createLinearGradient(-sz,-sz,sz,sz);gr.addColorStop(0,'#fffef7');gr.addColorStop(.45,'#fff6df');gr.addColorStop(.5,'#ceb98a');gr.addColorStop(1,'#fffaf0');c.fillStyle=gr;c.beginPath();c.moveTo(0,-sz*1.3);c.lineTo(sz,0);c.lineTo(0,sz*1.3);c.lineTo(-sz,0);c.closePath();c.fill();c.globalCompositeOperation='screen';c.globalAlpha=a*e;c.drawImage(A.hit,-sz*2,-sz*2,sz*4,sz*4);c.restore();}
function ornaments(){kind='cloud';for(let j=0;j<24;j++){index=j%12;c.save();c.rotate(j*TAU/24);const rr=radius*1.045;path(g=>{g.moveTo(rr-8,-25);g.bezierCurveTo(rr+24,-30,rr+31,-7,rr+10,-2);g.bezierCurveTo(rr-12,-4,rr-8,20,rr+12,18);g.bezierCurveTo(rr+31,15,rr+18,1,rr+7,6);},2.5,.68);c.restore();}
kind='rail';index=0;for(const rr of [.690,.719,.815,.85,.971,1.012]){c.save();c.globalCompositeOperation='screen';c.globalAlpha=a*.65;for(const off of [-2.6,2.6]){c.beginPath();c.arc(0,0,radius*rr+off,0,TAU*reveal);c.lineWidth=2.8;c.strokeStyle='#eed3a1';c.stroke();c.lineWidth=1.1;c.strokeStyle='#fffef8';c.stroke();}c.restore();}
kind='spoke';for(let j=0;j<8;j++){index=j;c.save();c.rotate(j*TAU/8);c.translate(radius*1.04,0);c.rotate(-Math.PI/2);c.globalAlpha=a*visibility()*.88;c.globalCompositeOperation='source-over';if(A.solid)c.drawImage(A.solid,-13,-6,26,88);c.restore();}}

// Project each original array path into the solar annulus at morph=0, then
// continuously release its original control points. All rings/glyphs persist.
function geometry(draw){
 if(morph>=.99999||!baseMatrix){draw(c);return;}
 const m=c.getTransform(),b=baseMatrix,det=b.a*b.d-b.b*b.c,md=m.a*m.d-m.b*m.c;
 let last=[0,0],first=null;
 function map(x,y){const wx=m.a*x+m.c*y+m.e-b.e,wy=m.b*x+m.d*y+m.f-b.f,px=(b.d*wx-b.c*wy)/det,py=(-b.b*wx+b.a*wy)/det,r=Math.hypot(px,py),an=Math.atan2(py,px),nr=morph*r+(1-morph)*radius*(.82+.18*r/radius),nx=Math.cos(an)*nr,ny=Math.sin(an)*nr,xx=b.a*nx+b.c*ny+b.e-m.e,yy=b.b*nx+b.d*ny+b.f-m.f;return[(m.d*xx-m.c*yy)/md,(-m.b*xx+m.a*yy)/md];}
 const p={moveTo(x,y){last=[x,y];first=last;c.moveTo(...map(x,y));},lineTo(x,y){const from=last,n=8;for(let k=1;k<=n;k++){const q=k/n;c.lineTo(...map(from[0]+(x-from[0])*q,from[1]+(y-from[1])*q));}last=[x,y];},bezierCurveTo(x1,y1,x2,y2,x3,y3){const f=last;for(let k=1;k<=14;k++){const q=k/14,u=1-q;c.lineTo(...map(u*u*u*f[0]+3*u*u*q*x1+3*u*q*q*x2+q*q*q*x3,u*u*u*f[1]+3*u*u*q*y1+3*u*q*q*y2+q*q*q*y3));}last=[x3,y3];},arc(x,y,r,aa,bb){const n=Math.max(12,Math.ceil(Math.abs(bb-aa)*20));for(let k=0;k<=n;k++){const an=aa+(bb-aa)*k/n,xx=x+r*Math.cos(an),yy=y+r*Math.sin(an);if(k===0)c.moveTo(...map(xx,yy));else c.lineTo(...map(xx,yy));last=[xx,yy];}},closePath(){c.closePath();if(first)last=first;}};
 draw(p);
}
function imperialFiligree(){
 // Broad scalloped crown, openwork lattices, and alternating faceted settings.
 kind='cloud';for(let j=0;j<16;j++){index=j;c.save();c.rotate(j*TAU/16);const r=radius;
 path(g=>{g.moveTo(r*1.018,-53);g.bezierCurveTo(r*1.07,-55,r*1.08,-38,r*1.13,-28);g.bezierCurveTo(r*1.20,-10,r*1.16,8,r*1.12,0);g.bezierCurveTo(r*1.06,-8,r*1.11,25,r*1.17,30);g.bezierCurveTo(r*1.10,49,r*1.05,53,r*1.018,53);},2.4,.75);
 path(g=>{g.moveTo(r*1.035,-42);g.bezierCurveTo(r*1.06,-27,r*1.16,-22,r*1.13,0);g.bezierCurveTo(r*1.10,23,r*1.06,27,r*1.035,42);},1.35,.63);
 path(g=>{g.moveTo(r*1.13,0);g.lineTo(r*1.185,-14);g.lineTo(r*1.23,0);g.lineTo(r*1.185,14);g.closePath();},1.85,.85);
 c.save();c.translate(r*1.185,0);c.scale(morph,morph);gem(0,0,j);c.restore();c.restore();}
 kind='rail';index=0;for(const rr of [.535,.565,1.055,1.073])lightPath(g=>g.arc(0,0,radius*rr,0,TAU),1.6,a*.70);
 kind='tracery';c.save();c.rotate(-elapsed*.12);for(let j=0;j<24;j++){index=j;c.save();c.rotate(j*TAU/24);path(g=>{g.moveTo(radius*.565,0);g.bezierCurveTo(radius*.62,-21,radius*.67,-17,radius*.689,0);g.bezierCurveTo(radius*.67,17,radius*.62,21,radius*.565,0);},1.5,.62);c.restore();}c.restore();
 // Eight outward rays become the eight inner sword spokes, same vertices.
 kind='seal';for(let j=0;j<8;j++){index=j;const pts=[[.54,0],[.77,-11],[.76,-24],[.80,-11],[.87,-8],[.87,8],[.80,11],[.76,24],[.77,11],[.54,0]];c.save();c.rotate(j*TAU/8);c.globalCompositeOperation='screen';c.globalAlpha=a*.58;c.strokeStyle='#fffdf5';c.lineWidth=2.1;c.beginPath();pts.forEach((p,i)=>{let x=(1-morph)*(i===0||i===9?radius*1.57:radius*.97)+morph*radius*p[0],y=p[1]*(.22+.78*morph);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();c.restore();}
}

function oldRadial(x,y,rx,ry,color,alpha){if(alpha<=0||rx<=0)return;c.save();c.translate(x,y);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,color+'cc');g.addColorStop(.32,color+'50');g.addColorStop(1,color+'00');c.globalCompositeOperation='screen';c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(-rx,-rx,rx*2,rx*2);c.restore();}
function oldLightPath(draw,width,alpha=1){c.save();c.globalCompositeOperation='screen';c.lineJoin='round';c.lineCap='round';for(const [k,col,a]of[[7,'#f77905',.10],[4,'#ffa60b',.23],[1.9,'#ffd650',.85],[.65,'#fffce9',1]]){c.lineWidth=width*k;c.strokeStyle=col;c.globalAlpha=alpha*a;c.beginPath();geometry(draw);c.stroke();}c.restore();}
function oldStar(x,y,r,a=1){c.save();c.translate(x,y);c.globalCompositeOperation='screen';c.globalAlpha=a;c.fillStyle='#fff5c4';c.shadowColor='#ffad16';c.shadowBlur=8;c.beginPath();c.moveTo(0,-r);c.lineTo(r*.2,-r*.2);c.lineTo(r,0);c.lineTo(r*.2,r*.2);c.lineTo(0,r);c.lineTo(-r*.2,r*.2);c.lineTo(-r,0);c.lineTo(-r*.2,-r*.2);c.closePath();c.fill();c.restore();}

function render(cx,assets,seconds,st,which='new'){c=cx;A=assets;t=seconds+.7;elapsed=seconds-3.2;a=st.a;morph=st.morph===undefined?1:st.morph;reveal=st.reveal===undefined?1:st.reveal;mode=which;angle=st.angle===undefined?(Math.min(seconds,5.5)-1.4)*.16:st.angle;if(a<=0||st.grow<=0)return;
 if(mode==='v4')oldRadial(435,205,420*1.18,132*1.5,'#f3a617',a*.40);
 c.save();c.translate(435,205);c.scale(st.grow,st.grow*132/420);c.rotate(angle);baseMatrix=c.getTransform();
 // The light stays in world space while the relief rotates beneath it.
 c.save();if(mode!=='v4')c.rotate(-angle);metal=c.createLinearGradient(-radius,-radius,radius,radius);const stops=mode==='v4'?[[0,'#fff4bb'],[.18,'#ffd468'],[.33,'#a76210'],[.45,'#fff3b1'],[.55,'#d99020'],[.73,'#fff1b1'],[1,'#b46a0d']]:[[0,'#f8efdb'],[.24,'#fffdf3'],[.55,'#f0e5cc'],[.8,'#ffffff'],[1,'#fff3db']];for(const[k,v]of stops)metal.addColorStop(k,v);c.restore();kind='rail';index=0;
 // Raised gold rails surround a recessed amber rune belt.
 band(radius*.835,radius*.982,.23);band(radius*.976,radius*1.006,.94);band(radius*.824,radius*.844,.85);band(radius*.694,radius*.712,.7);
 for(let j=0;j<5;j++){let r=radius*[1.009,.971,.847,.818,.705][j];lightPath(g=>g.arc(0,0,r,0,TAU*reveal),j===0?3.4:2.5,a*(j===0?.95:.75));}
 c.save();c.rotate(elapsed*.78);kind="tick";for(let i=0;i<96;i++){index=i;let ang=i*TAU/96;c.save();c.rotate(ang);path(g=>{g.moveTo(radius*.955,0);g.lineTo(radius*(i%4===0?.926:.941),0)},i%4===0?2.8:1.6,.83);c.restore();}
 c.restore();c.save();c.rotate(elapsed*.06);kind="rune";for(let i=0;i<32;i++){index=i;c.save();c.rotate(i*TAU/32);let rr=radius*.894;
  path(g=>{g.moveTo(rr-12,-8);g.lineTo(rr-3,-8);g.lineTo(rr+6,0);g.lineTo(rr-3,8);g.lineTo(rr-12,8);g.moveTo(rr-6,-14);g.lineTo(rr-6,14);g.moveTo(rr+3,-11);g.lineTo(rr+11,-11);g.lineTo(rr+11,11);g.lineTo(rr+3,11);if(i%2===0){g.moveTo(rr-15,-4);g.lineTo(rr-19,0);g.lineTo(rr-15,4);}},3.8,.94);c.restore();}
 c.restore();
 // Eight engraved sword seals, scalloped inner tracery and inset faceted gems.
 kind="seal";for(let i=0;i<8;i++){index=i;c.save();c.rotate(i*TAU/8);const q=radius;
  path(g=>{g.moveTo(q*.807,-24);g.bezierCurveTo(q*.70,-35,q*.60,-46,q*.535,0);g.bezierCurveTo(q*.60,46,q*.70,35,q*.807,24)},4.2,.8);
  path(g=>{g.moveTo(q*.80,0);g.lineTo(q*.56,-10);g.lineTo(q*.60,0);g.lineTo(q*.56,10);g.closePath();g.moveTo(q*.64,-19);g.lineTo(q*.64,19);g.moveTo(q*.65,0);g.lineTo(q*.73,0)},5.0,1);
  c.save();c.translate(q*.995,0);c.fillStyle='#fff8e7';c.globalCompositeOperation='screen';c.globalAlpha=a*.14;c.beginPath();c.moveTo(-17,0);c.lineTo(0,-16);c.lineTo(17,0);c.lineTo(0,16);c.closePath();c.fill();path(g=>{g.moveTo(-14,0);g.lineTo(0,-12);g.lineTo(14,0);g.lineTo(0,12);g.closePath();},2.4);star(0,0,7,a);c.restore();
  path(g=>{g.arc(0,0,q*.77,.08,.70);},2.3,.7);c.restore();}
 kind="tracery";c.save();c.rotate(-t*.065);for(let i=0;i<12;i++){index=i;c.save();c.rotate(i*TAU/12);path(g=>{g.moveTo(radius*.38,0);g.bezierCurveTo(radius*.43,-24,radius*.53,-25,radius*.57,0);g.bezierCurveTo(radius*.53,25,radius*.43,24,radius*.38,0)},2.6,.48);c.restore();}c.restore();
 c.save();c.rotate(elapsed*.69);kind="dipper";lightPath(g=>dipper.forEach((p,i)=>i?g.lineTo(p[0]*radius,p[1]*radius):g.moveTo(p[0]*radius,p[1]*radius)),4.4,a*.9);
 kind="node";for(let i=0;i<7;i++){index=i;const p=dipper[i],x=p[0]*radius,y=p[1]*radius;path(g=>g.arc(x,y,19,0,TAU),3.8,.85);gem(x,y,i);star(x,y,13,a);}
 c.restore();
 ornaments();imperialFiligree();
 // Moving highlights slide along the band; the geometry itself never jitters.
 kind="glint";for(let j=0;j<4;j++){index=j;let angle=t*(.22+j*.04)+j*1.57,r=radius*(j%2===0?.982:.834);for(let k=0;k<10;k++)lightPath(g=>g.arc(0,0,r,angle+k*.022,angle+(k+1)*.022),5.2,a*(k+1)/14);}
 if(mode!=='v4'&&reveal>.9)imageFlow();c.restore();if(mode!=='v4'&&st.dust!==false)dust(seconds,st);}
window.SUN_ARRAY_V8={render,inspect(seconds){return{geometrySource:'solar4.js drawArray',center:[435,205],radii:[420,132],runes:32,swordSeals:8,dipperNodes:7,angularSpeed:Math.PI*2/13.5,periodSeconds:13.5,strokeScale:mode==='v4'?1:2.2,rotation:(Math.min(seconds,5.5)-1.4)*.16,innerCounterRotation:.065,layerSpeeds:{runes:.075,ticks:-.22,dipper:.17},cloudScrolls:48,outerCrownPanels:16,orbitJewels:16,swordSpokes:8,gemNodes:7};}};
})();
