/* forb_fx.js · 藏经阁二层代码特效（Claude 11-07）
   全部用世界坐标（二层 1728×1296），调用方先把 ctx 平移到相机。
   ForbFX.floor(ctx,t)          —— 地面层：九星阵（在所有家具/人物之前画）
   ForbFX.afterObj(ctx,o,t,st)  —— 某件家具画完后：九星台星图投影、莲花灯焰、转轮经藏取书金光
   ForbFX.overlay(ctx,t)        —— 最上层：北窗斜光 + 浮尘 + 星屑
   t 为秒。st={pickup:0..1} 取书时让阵与经藏一起亮。 */
(function(){
  const TAU=Math.PI*2;
  const C={x:864,y:742,rx:318,ry:172};            // 九星阵中心落在石台脚下略南，椭圆=透视
  const rnd=(i)=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};
  const dust=[...Array(70)].map((_,i)=>({x:120+rnd(i)*1500,y:300+rnd(i+99)*900,s:.6+rnd(i+7)*1.6,p:rnd(i+3)*TAU,v:6+rnd(i+5)*10}));
  const motes=[...Array(26)].map((_,i)=>({a:rnd(i+40)*TAU,r:.25+rnd(i+41)*.75,p:rnd(i+42),v:.10+rnd(i+43)*.12}));
  function ell(ctx,k,a0,a1){ctx.beginPath();ctx.ellipse(C.x,C.y,C.rx*k,C.ry*k,0,a0||0,a1||TAU);}
  function pt(k,a){return [C.x+Math.cos(a)*C.rx*k, C.y+Math.sin(a)*C.ry*k];}

  function floor(ctx,t,st){
    const pk=(st&&st.pickup)||0, br=.8+.12*Math.sin(t*1.3)+pk*.3;
    ctx.save();
    // 浅地面上用描金 + 淡青填色才看得见（不能用 lighter）
    ctx.save(); ctx.translate(C.x,C.y); ctx.scale(1,C.ry/C.rx);
    let g=ctx.createRadialGradient(0,0,0,0,0,C.rx);
    g.addColorStop(0,`rgba(255,236,180,${.30*br})`); g.addColorStop(.6,`rgba(120,170,225,${.10*br})`); g.addColorStop(.93,`rgba(70,120,190,${.16*br})`); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,C.rx,0,TAU); ctx.fill(); ctx.restore();
    ctx.shadowColor=`rgba(255,215,120,${.9*br})`; ctx.shadowBlur=10;
    ctx.lineWidth=3; ctx.strokeStyle=`rgba(186,138,52,${.85*br})`; ell(ctx,1); ctx.stroke();
    ctx.lineWidth=1.5; ctx.strokeStyle=`rgba(200,152,64,${.7*br})`; ell(ctx,.93); ctx.stroke();
    ctx.lineWidth=1.3; ctx.strokeStyle=`rgba(70,118,190,${.55*br})`; ell(ctx,.55); ctx.stroke();
    // 外圈缓转刻度（二十八宿）
    const rot=t*.06;
    for(let i=0;i<28;i++){const a=rot+i*TAU/28, [x0,y0]=pt(.93,a), [x1,y1]=pt(1,a);
      ctx.strokeStyle=`rgba(180,132,50,${(i%7?.55:.95)*br})`; ctx.lineWidth=i%7?1.2:3; ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();}
    // 内圈反转虚弧
    ctx.setLineDash([22,14]); ctx.lineDashOffset=-t*16; ctx.lineWidth=1.6; ctx.strokeStyle=`rgba(80,130,200,${.6*br})`; ell(ctx,.76); ctx.stroke(); ctx.setLineDash([]);
    // 九星：环上九点依次点亮，九芒星线
    const P=[...Array(9)].map((_,i)=>pt(.76,-Math.PI/2+i*TAU/9-rot*.5));
    ctx.lineWidth=1.2; ctx.strokeStyle=`rgba(190,145,60,${.5*br})`; ctx.beginPath();
    for(let i=0;i<=9;i++){const q=P[(i*4)%9]; i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);} ctx.stroke();
    ctx.shadowBlur=0;
    for(let i=0;i<9;i++){const ph=((t*.9-i*.33)%3+3)%3, on=Math.max(0,1-ph), k=.55+.45*on+pk*.3, [x,y]=P[i], R=14+on*14;
      let gg=ctx.createRadialGradient(x,y,0,x,y,R); gg.addColorStop(0,`rgba(255,250,225,${k})`); gg.addColorStop(.3,`rgba(255,200,100,${.7*k})`); gg.addColorStop(1,'rgba(255,190,90,0)');
      ctx.fillStyle=gg; ctx.beginPath(); ctx.ellipse(x,y,R,R*.7,0,0,TAU); ctx.fill();
      ctx.fillStyle=`rgba(176,120,36,${.9})`; star(ctx,x,y,5+on*3); ctx.fillStyle='rgba(255,255,245,.95)'; star(ctx,x,y,2.6+on*2);}
    ctx.restore();
  }
  function star(ctx,x,y,r){ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4, rr=i%2?r*.32:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.8);}ctx.closePath();ctx.fill();}

  // 九星台顶的星图投影：一枚缓转的星球 + 光柱
  function holo(ctx,o,t,st){
    const x=o.ax, desk=o.y+o.h*.30, cy=desk-74, R=44, pk=(st&&st.pickup)||0;
    ctx.save();
    // 台面上的淡金光晕 + 细光柱
    let g=ctx.createRadialGradient(x,desk,0,x,desk,120); g.addColorStop(0,`rgba(255,226,150,${.45+pk*.2})`); g.addColorStop(1,'rgba(255,226,150,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(x,desk,120,40,0,0,TAU); ctx.fill();
    // 作者 11-10：原来的梯形光柱太丑 → 改成四周全羽化的竖向柔光 + 几粒往上飘的光尘，没有硬边
    { const mid=(desk+cy)/2, hh=(desk-cy)*.62+20, ww=30; ctx.save(); ctx.globalCompositeOperation='lighter';
      ctx.translate(x,mid); ctx.scale(1,hh/ww);
      const cg=ctx.createRadialGradient(0,0,0,0,0,ww); cg.addColorStop(0,`rgba(255,228,160,${.20+pk*.12})`); cg.addColorStop(.55,`rgba(255,214,130,${.08+pk*.06})`); cg.addColorStop(1,'rgba(255,210,120,0)');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(0,0,ww,0,TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let i=0;i<7;i++){ const u=((t*.22+rnd(i+500))%1), px=x+(rnd(i+520)-.5)*34+Math.sin(t*1.3+i)*3, py=desk-u*(desk-cy+10), a=Math.sin(u*Math.PI)*.75, r=1+rnd(i+540)*1.3;
        const mg=ctx.createRadialGradient(px,py,0,px,py,r*2.2); mg.addColorStop(0,`rgba(255,246,215,${a})`); mg.addColorStop(.45,`rgba(255,226,160,${a*.5})`); mg.addColorStop(1,"rgba(255,220,150,0)");
        ctx.fillStyle=mg; ctx.beginPath(); ctx.arc(px,py,r*2.2,0,TAU); ctx.fill(); }
      ctx.restore(); }
    // 星球：深青描边 + 金色赤道环 + 星点
    g=ctx.createRadialGradient(x-12,cy-14,4,x,cy,R*1.05); g.addColorStop(0,'rgba(210,232,255,.55)'); g.addColorStop(.8,'rgba(90,140,210,.30)'); g.addColorStop(1,'rgba(60,100,180,.0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,cy,R*1.05,0,TAU); ctx.fill();
    const rot=t*.5, tilt=.36;
    ctx.lineWidth=1; ctx.strokeStyle='rgba(60,105,180,.55)';
    for(let i=0;i<3;i++){ctx.beginPath(); ctx.ellipse(x,cy,R*Math.abs(Math.sin(rot+i*1.05))+.5,R,0,0,TAU); ctx.stroke();}
    ctx.beginPath(); ctx.ellipse(x,cy,R,R*.3,0,0,TAU); ctx.stroke();
    ctx.shadowColor='rgba(255,210,110,.9)'; ctx.shadowBlur=8;
    ctx.strokeStyle='rgba(196,146,56,.95)'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x,cy,R*1.4,R*1.4*tilt,-.2,0,TAU); ctx.stroke();
    for(let i=0;i<46;i++){const la=Math.asin(rnd(i+200)*2-1), lo=rnd(i+300)*TAU+rot, cx=Math.cos(la)*Math.sin(lo), cz=Math.cos(la)*Math.cos(lo), cyy=Math.sin(la);
      if(cz<-.15) continue; ctx.fillStyle=`rgba(255,${230+cz*20|0},${170+cz*60|0},${.45+.55*cz})`; ctx.beginPath(); ctx.arc(x+cx*R,cy+cyy*R,1+cz*1.5,0,TAU); ctx.fill();}
    ctx.fillStyle='rgba(176,120,36,.95)'; star(ctx,x,cy,8+Math.sin(t*2)*1.5); ctx.fillStyle='rgba(255,255,240,1)'; star(ctx,x,cy,4);
    for(let i=0;i<2;i++){const a=t*(1.2+i*.5)+i*3, px=x+Math.cos(a)*R*1.4, py=cy+Math.sin(a)*R*1.4*tilt; ctx.fillStyle='rgba(255,226,150,1)'; ctx.beginPath(); ctx.arc(px,py,3,0,TAU); ctx.fill();}
    ctx.restore();
  }
  function lamp(ctx,o,t){
    const x=o.ax, y=o.ay-o.pivot[1]+o.h*.12, f=.85+.1*Math.sin(t*9+o.ax)+.06*Math.sin(t*23+o.ay);
    ctx.save(); ctx.globalCompositeOperation='lighter';
    let g=ctx.createRadialGradient(x,y,0,x,y,70*f); g.addColorStop(0,`rgba(255,214,140,${.42*f})`); g.addColorStop(.4,`rgba(255,180,90,${.14*f})`); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,70*f,0,TAU); ctx.fill(); ctx.restore();
  }
  function afterObj(ctx,o,t,st){
    if(o.id==='o_r135_pedestal') holo(ctx,o,t,st);
    else if(o.id==='o_r135_lamp') lamp(ctx,o,t);
  }
  // 北窗斜光（四扇窗）+ 浮尘
  const WIN=[160,500,1228,1568];
  function overlay(ctx,t){
    ctx.save(); ctx.globalCompositeOperation='screen';
    for(let i=0;i<WIN.length;i++){const x=WIN[i], a=.10+.03*Math.sin(t*.4+i*1.7);
      const g=ctx.createLinearGradient(x,260,x+300,1000); g.addColorStop(0,`rgba(235,245,255,${a})`); g.addColorStop(1,'rgba(235,245,255,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(x-110,262); ctx.lineTo(x+110,262); ctx.lineTo(x+420,1010); ctx.lineTo(x+110,1010); ctx.closePath(); ctx.fill();}
    ctx.globalCompositeOperation='lighter';
    for(const d of dust){const y=((d.y-300-t*d.v)%900+900)%900+300, x=d.x+Math.sin(t*.5+d.p)*14, a=.25+.25*Math.sin(t*1.7+d.p);
      ctx.fillStyle=`rgba(255,250,230,${a})`; ctx.beginPath(); ctx.arc(x,y,d.s,0,TAU); ctx.fill();}
    // 阵上飘起的金色星屑
    for(const m of motes){const ph=(t*m.v+m.p)%1, [x,y]=pt(m.r,m.a+t*.05); const yy=y-ph*170, a=Math.sin(ph*Math.PI)*.8;
      ctx.globalCompositeOperation='source-over'; ctx.fillStyle=`rgba(200,150,60,${a})`; star(ctx,x,yy,3.2); ctx.fillStyle=`rgba(255,250,230,${a})`; star(ctx,x,yy,1.5);}
    ctx.restore();
  }
  window.ForbFX={floor,afterObj,overlay,holo,C};
})();
