// ================= R277 · 传送阵不再被门口台阶、地砖贴片压住 =================
// 作者 11-14：「很多地方这种法阵都被门口的阶梯或者地砖压住了半块、大半块」——原来先画法阵、再画贴地的物件（台阶、地砖贴片、地毯），
// 法阵就被盖住。地图边上的出口法阵（door_portals_all 里画）也一起挪后。改成：法阵先记下来，等贴地的物件画完、开始画立着的东西和人之前再画（人还是站在法阵上面）。只进测试版。
(function () {
  if (typeof drawBaked !== 'function' || typeof drawActorT !== 'function') return;
  let Q = [], on = false;
  const flush = () => { if (!on) return; on = false; const q = Q; Q = [];
    for (const [f, a, t, al] of q) { ctx.save(); try { ctx.setTransform(t); ctx.globalAlpha = al; f.apply(null, a); } catch (e) {} ctx.restore(); } };
  const defer = name => { const f = window[name]; if (typeof f !== 'function') return;
    window[name] = function (...a) { if (on) { Q.push([f, a, ctx.getTransform(), ctx.globalAlpha]); return; } return f.apply(this, a); }; };
  // 作者 11-14：放不下大法阵的地方（屋里、楼梯口、客房、据点里的屋子、门楼台阶上）一律用小号：一圈细光环 + 柔光，和民居门口那种一样
  const SMALL = .55;
  const tight = (T, d, x, y) => {
    const def = world.map && world.map.def; if (def && def.indoor) return true;
    if (!d || !d.edge) return false;
    for (const o of T.objs || []) { if (o.flat || !o.w || !o.h) continue; const sy = o.sy != null ? o.sy : o.y + o.h;
      if (x > o.x - 30 && x < o.x + o.w + 30 && y > o.y + o.h * .35 && y < sy + 14) return o; }
    return false; };
  // 一旦判成小号就不再改回去；地图边上的出口如果落在门楼台阶上，把法阵挪到台阶前面的路上（不被门楼盖住）
  const small = (T, d, x, y) => { if (!d) return;
    if (d._r277T !== T) { d._r277T = T; const t = tight(T, d, x, y); d._r277 = !!t;
      if (t && t !== true && d.edge && !d.spotAt) { const sy = t.sy != null ? t.sy : t.y + t.h; const ny = Math.min((T.mh || 1e9) - 18, sy + 18); if (ny > y) d.spotAt = [x, ny]; } }
    if (d._r277) { d._fit = { s: SMALL, simple: true }; d._fitT = T; d._fitXY = x + ',' + y; } };
  defer('lfxDoor'); defer('lfxExit');
  { const f = window.lfxDoor; if (typeof f === 'function') window.lfxDoor = function (x, y, now, d) { try { small(world.map.T, d, x, y); } catch (e) {} return f.apply(this, arguments); }; }
  window.R277_EDGE = (circle, T, d, x, y, now, f) => { try { small(T, d, x, y); } catch (e) {} const g = d._fit || f;
    if (on) { Q.push([circle, [x, y, now, g.s, g.simple], ctx.getTransform(), ctx.globalAlpha]); return; } circle(x, y, now, g.s, g.simple); };
  if (typeof tileAmbientLow === 'function') tileAmbientLow = (o => function (...a) { Q = []; on = true; return o.apply(this, a); })(tileAmbientLow);
  drawBaked = (o => function (ob, now) { if (on && !(ob && ob.flat)) flush(); return o.apply(this, arguments); })(drawBaked);
  drawActorT = (o => function () { if (on) flush(); return o.apply(this, arguments); })(drawActorT);
  if (typeof drawObj === 'function') drawObj = (o => function () { if (on) flush(); return o.apply(this, arguments); })(drawObj);
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function () { flush(); return o.apply(this, arguments); })(tileAmbientHigh);
})();
