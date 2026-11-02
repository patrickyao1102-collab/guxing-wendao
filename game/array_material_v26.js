/* 太阳 v28 专用阵盘（Codex 11-03 新画 1254 阵盘，光质精修）。点星等别的技能仍用 array_material_v8.js 的 SUN_ARRAY_V8。 */
/* v22: generated translucent xianxia talisman art supplies all visible array marks.
   Canvas only partitions that image into soft radial layers and moves their light.
   Coordinates and public render contract intentionally match SUN_ARRAY_V8. */
(function(){'use strict';
const TAU=Math.PI*2,C=x=>Math.max(0,Math.min(1,x));
const E=(x,a,b)=>{const q=C((x-a)/(b-a));return q*q*(3-2*q);};
const R=i=>{const q=Math.sin(i*127.1+49.3)*43758.5453;return q-Math.floor(q);};
const config={src:(window.FORCE_LOCAL||/^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname)||location.protocol==='file:')?'sun28/quality_array.webp':'/_blob/9dfcb414b99f6914a68d286368f04e9d',sampleSize:1254,sourceRadius:625,
  logicalRadius:420,exposure:1,lightWaveRates:[1.2,-1.45,1.05],baseGains:[.88,.92,.96],sectorCount:16};
const mk=(w,h)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;return cv;};
let ready=false,promise=null,sourceImage=null,sourceCanvas=null,layers=[],materialReport=null,frameCache=null;
function radialWeights(r){const inner=1-E(r,.48,.55),outer=E(r,.76,.84);return[outer,1-inner-outer,inner];}
function prepare(im){
 sourceImage=im;const n=config.sampleSize,half=n*.5,base=mk(n,n),b=base.getContext('2d');
 b.imageSmoothingEnabled=true;b.imageSmoothingQuality='high';b.drawImage(im,0,0,n,n);sourceCanvas=base;
 const pixels=b.getImageData(0,0,n,n),data=pixels.data;let visible=0,transparent=0;
 // Extract emission instead of carrying opaque midtone fill into the scene.
 for(let at=0;at<data.length;at+=4){
  const r=data[at]/255,g=data[at+1]/255,bl=data[at+2]/255,lum=.2126*r+.7152*g+.0722*bl;
  const energy=Math.pow(C((lum-.28)/.70),1.3),hot=E(lum,.82,.995),ice=bl-r>.015;
  const tint=ice?[126,202,255]:[255,198,102],peak=ice?[245,253,255]:[255,252,238];
  for(let ch=0;ch<3;ch++)data[at+ch]=Math.round(tint[ch]+(peak[ch]-tint[ch])*hot);
  data[at+3]=Math.round(data[at+3]*energy);
 }
 b.putImageData(pixels,0,0);
 const out=Array.from({length:3},()=>{const cv=mk(n,n),g=cv.getContext('2d');return{cv,g,pixels:g.createImageData(n,n)};});
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const at=(y*n+x)*4,r=Math.hypot(x-half,y-half)/config.sourceRadius,w=radialWeights(r);
  if(data[at+3]>0)visible++;else transparent++;
  for(let j=0;j<3;j++){const d=out[j].pixels.data;d[at]=data[at];d[at+1]=data[at+1];d[at+2]=data[at+2];d[at+3]=Math.round(data[at+3]*w[j]);}
 }
 layers=out.map((v,j)=>{
  v.g.putImageData(v.pixels,0,0);
  const sectors=[];
  for(let k=0;k<config.sectorCount;k++){
   const cv=mk(n,n),g=cv.getContext('2d'),start=k/config.sectorCount*TAU,end=(k+1)/config.sectorCount*TAU;
   // This wedge is a sampling mask, never a visible vector line or filled disc.
   g.save();g.translate(half,half);g.beginPath();g.moveTo(0,0);g.arc(0,0,n,start-.012,end+.012);g.closePath();g.clip();g.translate(-half,-half);g.drawImage(v.cv,0,0);g.restore();
   sectors.push(cv);
  }
  return{image:v.cv,sectors,index:j};
 });
 materialReport={source:config.src,size:[im.width,im.height],workingSize:[n,n],
  visiblePixelFraction:visible/(n*n),fullyTransparentPixelFraction:transparent/(n*n),
  radialSeams:[[.48,.55],[.76,.84]],lightPartitionCount:3,sectorCount:config.sectorCount,
  intactArtRotation:true,logicalRadius:config.logicalRadius,exposure:config.exposure,sourceRadiusInWorkingPixels:config.sourceRadius,
  runtimeColor:{maxSaturation:1.4,whiteHotHighlightsProtected:true,originalAlphaPreserved:true},
  generatedImageOnly:true,visibleVectorLines:0};ready=true;
}
function preload(){
 if(ready)return Promise.resolve(materialReport);if(promise)return promise;
 promise=new Promise((ok,no)=>{const im=new Image();im.onload=()=>{try{prepare(im);ok(materialReport);}catch(e){no(e);}};im.onerror=no;im.src=config.src;});return promise;
}
function frameTexture(seconds,reveal){
 const key=seconds.toFixed(7)+':'+reveal.toFixed(7),n=config.sampleSize;
 if(!frameCache)frameCache={cv:mk(n,n),key:null};
 if(frameCache.key===key)return frameCache.cv;frameCache.key=key;
 const g=frameCache.cv.getContext('2d');
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,n,n);g.save();g.translate(n*.5,n*.5);g.globalCompositeOperation='screen';
 // The connected hand-painted swords and cloudwork remain whole while the
 // supplied actor rotates the array. Only energy emphasis crosses the rings.
 g.globalAlpha=.98*(.95+.035*Math.sin(seconds*2))*(.72+.28*E(reveal,.12,.96));g.drawImage(sourceCanvas,-n*.5,-n*.5);
 for(const layer of layers){
  const j=layer.index,breath=.94+.045*Math.sin(seconds*2.0+j*.8),gain=config.baseGains[j]*breath;
  g.save();
  for(let k=0;k<config.sectorCount;k++){
   const an=(k+.5)/config.sectorCount*TAU,travelling=.5+.5*Math.cos(an*2.0-seconds*config.lightWaveRates[j]-j*.9);
   const wake=E(reveal,k/config.sectorCount*.70,k/config.sectorCount*.70+.22);
   const wave=.22*Math.pow(travelling,7)*wake*(.94+.06*Math.sin(seconds*3.1+k*.74));
   if(wave<.008)continue;g.globalAlpha=gain*wave;g.drawImage(layer.sectors[k],-n*.5,-n*.5);
  }
  g.restore();
 }
 g.restore();return frameCache.cv;
}
function render(cx,assets,seconds,st,which='new'){
 if(!ready)throw new Error('SUN_ARRAY_V22.preload() must finish before render.');
 const alpha=C(st.a)*config.exposure,grow=st.grow,reveal=st.reveal===undefined?1:C(st.reveal),morph=st.morph===undefined?1:C(st.morph);
 if(alpha<=0||grow<=0)return;
 const angle=st.angle===undefined?(seconds-3.2)*(-TAU/13.5):st.angle;
 const n=config.sampleSize,s=config.logicalRadius/config.sourceRadius,extent=n*s;
 cx.save();cx.translate(435,205);cx.scale(grow,grow*132/420);cx.rotate(angle);
 cx.globalCompositeOperation='screen';cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
 // Image alpha preserves the open sky between painted strokes; there is no fog fill.
 cx.globalAlpha=alpha;cx.drawImage(frameTexture(seconds,reveal),-extent*.5,-extent*.5,extent,extent);
 cx.restore();
 if(st.dust!==false&&assets?.hit){
  for(let i=0;i<20;i++){
   const q=((seconds*.27+i*.173)%1+1)%1,an=i*2.399+angle,r=(.61+R(i)*.37)*420;
   const x=435+Math.cos(an)*r*grow,y=205+Math.sin(an)*r*132/420*grow-q*52;
   cx.save();cx.globalCompositeOperation='screen';cx.globalAlpha=Math.sin(q*Math.PI)*alpha*.25;cx.drawImage(assets.hit,x-2.5,y-4.5,5,9);cx.restore();
  }
 }
}
function inspect(seconds){return{geometrySource:'v22 imagegen xianxia talisman mother image',
 center:[435,205],radii:[420,132],material:materialReport,sourceReady:ready,
 rotation:(seconds-3.2)*(-TAU/13.5),angularSpeed:TAU/13.5,periodSeconds:13.5,
 lightWaveRates:{outer:1.2,middle:-1.45,inner:1.05},intactArtRotation:true,generatedImageOnly:true,visibleVectorLines:0,
 palette:'white-hot platinum core, pale gold talisman brushwork, ice-blue electric edge'};}
const api={preload,render,inspect,configure(values){if(ready||promise)throw new Error('Configure before preload.');Object.assign(config,values);},
 getLayers(){return layers.map(v=>v.image);},getSource(){return sourceImage;}};
window.SUN_ARRAY_V22=api;window.SUN_ARRAY_V26=api;
})();
