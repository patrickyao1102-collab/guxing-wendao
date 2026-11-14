// ================= R277 · 传送阵不再被门口台阶、地砖贴片压住 =================
// 作者 11-14：「很多地方这种法阵都被门口的阶梯或者地砖压住了半块、大半块」——原来先画法阵、再画贴地的物件（台阶、地砖贴片、地毯），
// 法阵就被盖住。改成：法阵先记下来，等贴地的物件画完、开始画立着的东西和人之前再画（人还是站在法阵上面）。只进测试版。
(function () {
  if (typeof drawBaked !== 'function' || typeof drawActorT !== 'function') return;
  let Q = [], on = false;
  const flush = () => { if (!on) return; on = false; const q = Q; Q = [];
    for (const [f, a, t, al] of q) { ctx.save(); try { ctx.setTransform(t); ctx.globalAlpha = al; f.apply(null, a); } catch (e) {} ctx.restore(); } };
  const defer = name => { const f = window[name]; if (typeof f !== 'function') return;
    window[name] = function (...a) { if (on) { Q.push([f, a, ctx.getTransform(), ctx.globalAlpha]); return; } return f.apply(this, a); }; };
  defer('lfxDoor'); defer('lfxExit');
  if (typeof tileAmbientLow === 'function') tileAmbientLow = (o => function (...a) { const r = o.apply(this, a); Q = []; on = true; return r; })(tileAmbientLow);
  drawBaked = (o => function (ob, now) { if (on && !(ob && ob.flat)) flush(); return o.apply(this, arguments); })(drawBaked);
  drawActorT = (o => function () { if (on) flush(); return o.apply(this, arguments); })(drawActorT);
  if (typeof drawObj === 'function') drawObj = (o => function () { if (on) flush(); return o.apply(this, arguments); })(drawObj);
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function () { flush(); return o.apply(this, arguments); })(tileAmbientHigh);
})();
