/* 传送法阵 · 全地图统一版（Claude）
 * 作者要求：所有传送阵都做成「天剑宗后山」那种——深青底色 + 青色符文法阵（双环刻度、符文、八角星、中心光）+ 柔光柱 + 上升光粒 + 浮在上方的地名。
 * 青阳镇原来的 door_portals.js / door_portals_fast.js 文件保留，但不再画（这里直接接管所有地图，包括青阳镇）。
 * 性能：带发光的线条预先画进离屏贴图，每帧只旋转 / 调透明度；只画镜头内的法阵。后山崖顶自己画同款法阵，这里跳过。
 */
(() => {
  'use strict';
  if (typeof lfxDoor !== 'function' || typeof tileAmbientHigh !== 'function') return;
  const COL = (typeof LFX_COL !== 'undefined' && LFX_COL.cyan) || [120, 230, 255], WH = [255, 245, 225];
  const rg = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const K = 2, R0 = 80, S = 110, D = S * 2;
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = D * K; const g = c.getContext('2d'); g.scale(K, K); g.translate(S, S); return [c, g]; };
  // 底：深青垫色 + 法阵底光 + 双外环 + 中心亮点
  const [base, b] = mk();
  { let gr = b.createRadialGradient(0, 0, 10, 0, 0, 96); gr.addColorStop(0, 'rgba(18,80,125,.62)'); gr.addColorStop(.75, 'rgba(18,80,125,.42)'); gr.addColorStop(1, 'rgba(40,120,170,0)'); b.fillStyle = gr; b.beginPath(); b.arc(0, 0, 96, 0, 7); b.fill(); }
  const [glow, gl] = mk();
  { const gr = gl.createRadialGradient(0, 0, 0, 0, 0, R0 * 1.25); gr.addColorStop(0, rg(COL, .38)); gr.addColorStop(.55, rg(COL, .12)); gr.addColorStop(1, rg(COL, 0)); gl.fillStyle = gr; gl.beginPath(); gl.arc(0, 0, R0 * 1.25, 0, 7); gl.fill();
    gl.shadowColor = rg(COL, .9); gl.shadowBlur = 14 * K; gl.strokeStyle = rg(COL, .75); gl.lineWidth = 2.2; gl.beginPath(); gl.arc(0, 0, R0, 0, 7); gl.stroke(); gl.lineWidth = 1; gl.beginPath(); gl.arc(0, 0, R0 * .9, 0, 7); gl.stroke();
    gl.shadowBlur = 0; const c = gl.createRadialGradient(0, 0, 0, 0, 0, R0 * .3); c.addColorStop(0, rg(WH, .7)); c.addColorStop(1, rg(COL, 0)); gl.fillStyle = c; gl.beginPath(); gl.arc(0, 0, R0 * .3, 0, 7); gl.fill(); }
  // 外圈刻度 + 符文（顺转）
  const [outer, o] = mk();
  { o.shadowColor = rg(COL, .9); o.shadowBlur = 14 * K; o.strokeStyle = rg(COL, .75); o.lineWidth = 1.6;
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, l = i % 3 === 0 ? .1 : .05; o.beginPath(); o.moveTo(Math.cos(a) * R0 * .9, Math.sin(a) * R0 * .9); o.lineTo(Math.cos(a) * R0 * (.9 - l), Math.sin(a) * R0 * (.9 - l)); o.stroke(); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .2; o.save(); o.translate(Math.cos(a) * R0 * .72, Math.sin(a) * R0 * .72); o.rotate(a); o.strokeRect(-5, -3, 10, 6); o.beginPath(); o.moveTo(-3, 0); o.lineTo(3, 0); o.stroke(); o.restore(); } }
  // 内环 + 八角星（逆转）
  const [inner, n] = mk();
  { n.shadowColor = rg(COL, .9); n.shadowBlur = 14 * K; n.strokeStyle = rg(COL, .8); n.lineWidth = 1.4; n.beginPath(); n.arc(0, 0, R0 * .58, 0, 7); n.stroke();
    for (let k = 0; k < 2; k++) { n.beginPath(); for (let i = 0; i <= 4; i++) { const a = (i / 4) * Math.PI * 2 + k * Math.PI / 4; const px = Math.cos(a) * R0 * .58, py = Math.sin(a) * R0 * .58; i ? n.lineTo(px, py) : n.moveTo(px, py); } n.stroke(); }
    n.beginPath(); n.arc(0, 0, R0 * .26, 0, 7); n.stroke(); }

  const inView = (x, y) => { const c = world.cam || { x: 0, y: 0 }; return !(x < c.x - 120 || x > c.x + W + 120 || y < c.y - 60 || y > c.y + H + 220); };
  const skipMap = () => world.mapName === 'tj_houshan';     // 后山崖顶自己画同款法阵
  const usable = d => d && !d.noGlow && (!d.cond || d.cond() || d.msg) && d.to && TMAPS[d.to];
  const spot = (T, d) => {
    if (!d.edge) return d.rect ? [d.rect[0], d.rect[1]] : [(d.c + .5) * TS, (d.r + 1) * TS - 6];
    if (d._spot && d._spotT === T) return d._spot;
    let x = (d.x + (d.w || 1) / 2) * CS, y = (d.y + (d.h || 1) / 2) * CS;
    const cx = T.mw / 2, cy = T.mh / 2, L = Math.hypot(cx - x, cy - y) || 1, ux = (cx - x) / L, uy = (cy - y) / L;
    for (let k = 0; k < 14; k++) { if (canStand(T, x, y)) break; x += ux * 12; y += uy * 12; }
    x = Math.max(40, Math.min(T.mw - 40, x)); y = Math.max(40, Math.min(T.mh - 24, y));
    d._spot = [x, y]; d._spotT = T; return d._spot;
  };
  const sizeOf0 = d => d.edge ? 1 : .8;     // 门口的阵小一点
  // 门口两边有花坛、石狮、柱子挨得很近时：量一下左右能放多宽，放不下就缩小并换成简化法阵（只留柔光 + 一圈细环）
  function fit(T, d, x, y) {
    if (d._fitT === T && d._fitXY === x + ',' + y) return d._fit;
    let clr = 999; const want = 110 * sizeOf0(d);
    const blocked = (px, py) => { const [c, r] = cellOf(px, py); return !walkable(T, c, r); };
    if (!d.edge) for (const sgn of [-1, 1]) for (let dx = 24; dx <= want + 6; dx += 6) { if (blocked(x + sgn * dx, y - 4) || blocked(x + sgn * dx, y + 8)) { clr = Math.min(clr, dx); break; } }
    for (const o of T.objs || []) { if (!o.bk || o.r60 || o.flat || o.sy < y - 30 || o.sy > y + 70) continue; const l = o.x + o.w * .08, r = o.x + o.w * .92; if (x > l && x < r) continue; const gap = x < l ? l - x : x - r; clr = Math.min(clr, gap); }
    const s0 = sizeOf0(d), s = clr >= want ? s0 : Math.max(.36, (clr - 6) / 110);
    d._fit = { s, simple: s < s0 * .85 }; d._fitT = T; d._fitXY = x + ',' + y; return d._fit;
  }
  const sizeOf = d => (d._fit && d._fitT === world.map.T) ? d._fit.s : sizeOf0(d);
  // 地面法阵（人物脚下那一层）
  function circle(x, y, now, s, simple) {
    const pulse = .82 + Math.sin(now * 2.2) * .18, spin = now * .5, sz = D * s;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, .42);
    if (simple) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = pulse; ctx.drawImage(glow, -sz / 2, -sz / 2, sz, sz);
      ctx.globalAlpha = .55 + .35 * Math.sin(now * 3); ctx.strokeStyle = rg(COL, .9); ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -now * 18; ctx.beginPath(); ctx.arc(0, 0, R0 * s * .62, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); return; }
    ctx.drawImage(base, -sz / 2, -sz / 2, sz, sz);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = pulse;
    ctx.drawImage(glow, -sz / 2, -sz / 2, sz, sz);
    ctx.save(); ctx.rotate(spin); ctx.drawImage(outer, -sz / 2, -sz / 2, sz, sz); ctx.restore();
    ctx.rotate(-spin * 1.6); ctx.drawImage(inner, -sz / 2, -sz / 2, sz, sz);
    ctx.restore();
  }
  // 光柱 + 光粒 + 地名（画在树木屋檐之上，被遮住也看得见）
  function pillar(x, y, now, s, text, near) {
    if (typeof lightPillar === 'function') lightPillar(x, y, R0 * 1.1 * s, R0 * 2.4 * s, COL, now, .38);
    if (typeof risingMotes === 'function') risingMotes(x, y, 72 * s, 150 * s, 14, COL, now, 1);
    if (text) { ctx.save(); ctx.globalAlpha = near ? 1 : .88; ctx.font = `600 20px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      textOutline(text, x, y - 60 * s - 6 + Math.sin(now * 3) * 3, '#e6fbff', '#06283a', 4); ctx.restore(); }
  }
  const label = d => (d.label || (TMAPS[d.to] && TMAPS[d.to].title) || '').replace(/^(进入|前往)\s*·\s*/, '');

  const preHigh = window.__preDoorHigh || null;   // 青阳镇旧光标之前的原版
  // 门（建筑入口）：换成统一法阵
  const prevDoor = lfxDoor;
  lfxDoor = function (x, y, now, d) { if (!d) return prevDoor(x, y, now, d); if (skipMap() || !usable(d) || !inView(x, y)) return; const f = fit(world.map.T, d, x, y); circle(x, y, now, f.s, f.simple); };
  // 地图边缘出口：地面层画法阵
  const prevLow = typeof tileAmbientLow === 'function' ? tileAmbientLow : null;
  tileAmbientLow = function (T, cam, now) { if (prevLow) prevLow(T, cam, now); if (skipMap()) return;
    for (const d of T.doors) { if (!d.edge || !usable(d)) continue; const [x, y] = spot(T, d); if (inView(x, y)) { const f = fit(T, d, x, y); circle(x, y, now, f.s, f.simple); } } };
  // 上层：光柱、光粒、地名
  const prevHigh = tileAmbientHigh;
  tileAmbientHigh = function (T, cam, now) {
    const town = world.map && world.map.def === TMAPS.qy_town;
    if (town && preHigh) preHigh(T, cam, now); else prevHigh(T, cam, now);
    if (skipMap()) return;
    for (const d of T.doors) { if (!usable(d)) continue; const [x, y] = spot(T, d); if (!inView(x, y)) continue;
      const near = world.player && Math.hypot(world.player.x - x, world.player.y - y) < 190;
      pillar(x, y, now, sizeOf(d), (d.edge || Math.hypot(world.player.x - x, world.player.y - y) < 280) ? label(d) : '', near); } };
})();
