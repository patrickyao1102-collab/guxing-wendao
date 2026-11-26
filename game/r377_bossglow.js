// ================= R377 · Boss 的光（作者 11-27 凌晨：「Boss 做得尽量好看一点，光感足一点，让它有 Boss 的感觉」）（只进测试版）=================
// 原来妖王 / 主线首领在战斗里只是「放大的普通妖兽」，身上没有光。妖兽本体不重画，这里给所有首领叠四层光：
//   ① 脚下妖阵（Codex R377 seal_<id>，没到之前用代码画的光圈顶着）　② 身后光轮（halo_<id>，慢转 + 呼吸）
//   ③ 身体描边光（把当前这一帧抠成纯色剪影，在身后错位叠八次——只有序列帧妖兽有）　④ 身前往上飘的光尘
// 蓄力时整体更亮、跳得更快；破绽（力竭）时暗下去。六只妖王各用自己的颜色，主线首领用通用的暗红（或它自己的招式色）。
// 地图上妖王巢穴也垫上同一套光轮 / 妖阵。只加显示，不动数值。
(function () {
  if (typeof drawUnit !== 'function' || typeof ctx === 'undefined') return;
  const COL = { boar: [240, 190, 84], wolf: [140, 205, 255], leopard: [255, 140, 60], spider: [255, 214, 90], treant: [130, 230, 140], rhino: [226, 186, 104], boss: [255, 96, 96] };
  const art = n => (window.R370_ART ? R370_ART(n, 'r377') : null);
  const hex = h => { const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h || ''); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null; };
  const lift = c => { const mx = Math.max(c[0], c[1], c[2], 1), k = Math.max(1, 235 / mx); return c.map(v => Math.min(255, Math.round(v * k * .92 + 20))); };   // 太暗的招式色提亮一点
  const idOf = u => (u._yw && u._id) || 'boss';
  const colOf = u => COL[u._id] || (u.fxColor && hex(u.fxColor) ? lift(hex(u.fxColor)) : COL.boss);
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  setTimeout(() => { for (const k of ['boss', 'boar', 'wolf', 'leopard', 'spider', 'treant', 'rhino']) { art('halo_' + k); art('seal_' + k); } }, 14000);

  // ---- 当前这一帧的纯色剪影（序列帧妖兽）----
  const SIL = document.createElement('canvas'), sg = SIL.getContext('2d'), SIM = {};
  function vsFrame(u, now) { const V = window.VSPRITES && VSPRITES[(u && u._vk) || (u && u.key)]; if (!V) return null; let im = SIM[V.id];
    if (!im) { im = SIM[V.id] = new Image(); im.src = 'rig/' + V.id + '.webp'; } if (!im.complete || !im.naturalWidth) return null;
    const m = V.meta; let f = -1; if (u._va != null) { f = m.idleEnd + 1 + Math.floor((now - u._va) * 20); if (f >= m.n) f = -1; }
    if (f < 0) { const L = m.idleEnd + 1, k = Math.floor((now + (u.x % 3)) * 8) % (L * 2 - 2 || 1); f = k < L ? k : L * 2 - 2 - k; }
    if (m.map) f = m.map[f]; const H = V.h * ((window.VS_SCALE || {})[u.key] || 1); return { im, m, f, H, S: H / m.fh }; }
  function silhouette(fr, c) { const m = fr.m, w = Math.ceil(m.fw / 2), h = Math.ceil(m.fh / 2); if (SIL.width !== w || SIL.height !== h) { SIL.width = w; SIL.height = h; } else sg.clearRect(0, 0, w, h);
    sg.globalCompositeOperation = 'source-over'; sg.drawImage(fr.im, (fr.f % m.cols) * m.fw, Math.floor(fr.f / m.cols) * m.fh, m.fw, m.fh, 0, 0, w, h);
    sg.globalCompositeOperation = 'source-in'; sg.fillStyle = rgba(c, 1); sg.fillRect(0, 0, w, h); sg.globalCompositeOperation = 'source-over'; return SIL; }

  // 静态立绘的首领（没有序列帧、也不是骨骼动画的）：剪影只抠一次
  const STC = {};
  function staticSil(u, c) { try { if (typeof IMG === 'undefined' || !u.key || (window.RIG_MAP && RIG_MAP[u.key])) return null; const d = Object.getOwnPropertyDescriptor(IMG, u.key); if (!d || d.get) return null; const im = IMG[u.key]; if (!im || !im.width) return null;
      const k = u.key + '|' + c.join(','); let o = STC[k]; if (!o) { const w = Math.max(1, Math.round(im.width / 2)), h = Math.max(1, Math.round(im.height / 2)), cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h; const g = cv2.getContext('2d'); g.drawImage(im, 0, 0, w, h); g.globalCompositeOperation = 'source-in'; g.fillStyle = rgba(c, 1); g.fillRect(0, 0, w, h); o = STC[k] = { cv: cv2, ar: im.width / im.height }; }
      return o; } catch (e) { return null; } }

  // ---- 光轮 + 妖阵（战斗和地图共用）：x,y = 脚底；H = 身高 ----
  function back(id, c, x, y, H, t, power, seed) {
    const pulse = .5 + .5 * Math.sin(t * (1.6 + power * 2.4) + seed), a0 = .35 + power * .65;
    // 先把身后压暗一圈（白天的背景太亮，光叠上去不显）
    { ctx.save(); const cy0 = y - H * .5, g0 = ctx.createRadialGradient(x, cy0, H * .15, x, cy0, H * 1.25); g0.addColorStop(0, `rgba(8,6,10,${.34 * a0})`); g0.addColorStop(.6, `rgba(8,6,10,${.2 * a0})`); g0.addColorStop(1, 'rgba(8,6,10,0)'); ctx.fillStyle = g0; ctx.beginPath(); ctx.arc(x, cy0, H * 1.25, 0, 7); ctx.fill(); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // 地上的光
    { const rw = H * 1.05, g = ctx.createRadialGradient(x, y, 4, x, y, rw); g.addColorStop(0, rgba(c, .42 * a0)); g.addColorStop(.55, rgba(c, .14 * a0)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.save(); ctx.translate(x, y); ctx.scale(1, .3); ctx.translate(-x, -y); ctx.beginPath(); ctx.arc(x, y, rw, 0, 7); ctx.fill(); ctx.restore(); }
    // 妖阵
    const seal = art('seal_' + id) || art('seal_boss'), sw = H * 1.95;
    if (seal) { ctx.globalAlpha = Math.min(1, (.55 + pulse * .25) * a0 * 1.1); ctx.drawImage(seal, x - sw / 2, y - sw / 4 + H * .01, sw, sw / 2); }
    else { ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const r = H * (.42 + i * .2) * (1 + pulse * .03); ctx.strokeStyle = rgba(c, (.5 - i * .13) * a0); ctx.beginPath(); ctx.ellipse(x, y, r, r * .3, 0, 0, 7); ctx.stroke(); }
      ctx.setLineDash([10, 16]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = rgba(c, .55 * a0); ctx.beginPath(); ctx.ellipse(x, y, H * .72, H * .216, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    // 光轮
    const halo = art('halo_' + id) || art('halo_boss'), cy = y - H * .56, hs = H * 1.8 * (1 + pulse * .035);
    ctx.globalAlpha = 1; { const g = ctx.createRadialGradient(x, cy, H * .1, x, cy, H * .95); g.addColorStop(0, rgba(c, .2 * a0)); g.addColorStop(.5, rgba(c, .08 * a0)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, cy, H * .95, 0, 7); ctx.fill(); }
    if (halo) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(x, cy); ctx.rotate(t * .1 + seed); ctx.globalAlpha = Math.min(1, (.5 + pulse * .22) * a0 * 1.05); ctx.drawImage(halo, -hs / 2, -hs / 2, hs, hs); ctx.restore(); }   /* screen：比 lighter 不容易曝成一片白 */
    else { ctx.save(); ctx.translate(x, cy); ctx.rotate(t * .25 + seed); ctx.lineWidth = 2.5; for (let i = 0; i < 2; i++) { const r = H * (.62 + i * .14); ctx.strokeStyle = rgba(c, (.5 - i * .15) * a0 * (.7 + pulse * .3)); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); }
      for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6, r0 = H * .64, r1 = H * (.8 + (i % 2) * .08); ctx.strokeStyle = rgba(c, .35 * a0); ctx.beginPath(); ctx.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); ctx.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); ctx.stroke(); } ctx.restore(); }
    ctx.restore();
  }
  function motes(c, x, y, H, t, power, seed) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const n = 16;
    for (let i = 0; i < n; i++) { const k = (t * (.22 + (i % 5) * .035) + i / n + seed) % 1, px = x + Math.sin(i * 12.9898 + seed * 7) * H * .52 + Math.sin(t * 1.3 + i) * 8, py = y - k * H * 1.15, a = Math.sin(k * Math.PI) * (.45 + power * .5), r = (2.2 + (i % 3)) * (1 - k * .5);
      const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3.2); g.addColorStop(0, rgba([255, 255, 255], a)); g.addColorStop(.35, rgba(c, a * .8)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r * 3.2, 0, 7); ctx.fill(); }
    ctx.restore(); }

  // ---- 战斗 ----
  drawUnit = (orig => function (u) {
    let on = false; try { on = !!(u && u.side === 'enemy' && u.alive && (u._yw || u.boss) && !u.eye && typeof battle !== 'undefined' && battle); } catch (e) {}
    if (!on) return orig.apply(this, arguments);
    const now = performance.now() / 1000, t0 = u._glowT0 || (u._glowT0 = now), ramp = Math.min(1, (now - t0) / .9), c = colOf(u), id = idOf(u);
    const power = (u._break > 0 ? .12 : u._charge ? 1 : .62) * ramp, sc = u._scale || 1, ax = u.x + (u.ox || 0), ay = u.y + (u.oy || 0), seed = (u.x * .013) % 6.28;
    let fr = null; try { fr = vsFrame(u, now); } catch (e) {} const H = (u._yw && u._yw.vh) ? u._yw.vh / .92 : fr ? fr.H : (u.h || 260);   /* 重画过的妖王：图集留了出手的余量，光按身体的高度算 */
    const xf = () => { if (sc !== 1) { ctx.translate(ax, ay); ctx.scale(sc, sc); ctx.translate(-ax, -ay); } };
    try { ctx.save(); xf(); back(id, c, ax, ay, H, now, power, seed);
      if (fr) { const s = silhouette(fr, c), m = fr.m, S = fr.S, r = 5 / sc + power * 3; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .1 + power * .2; ctx.translate(ax, ay); ctx.scale(-1, 1);
        for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; ctx.drawImage(s, -m.footX * S + Math.cos(an) * r, -m.footY * S + Math.sin(an) * r, m.fw * S, m.fh * S); } ctx.restore(); }
      else { const o = staticSil(u, c); if (o) { const br = Math.sin(now * 2.4 + u.x) * 3, h = (u.h || 260) + br, w = h * o.ar, r = 5 / sc + power * 3; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .1 + power * .2;
          for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; ctx.drawImage(o.cv, ax - w / 2 + Math.cos(an) * r, ay + br * .3 - h + Math.sin(an) * r, w, h); } ctx.restore(); } }
      ctx.restore(); } catch (e) { try { ctx.restore(); } catch (e2) {} }
    const res = orig.apply(this, arguments);
    try { ctx.save(); xf(); motes(c, ax, ay, H, now, power, seed); ctx.restore(); } catch (e) {}
    return res; })(drawUnit);

  // ---- 首领蓄力时：屏幕四边压一圈它的颜色 ----
  try { S.overlay.push({ draw() { try { const b = typeof battle !== 'undefined' && battle; if (!b || b.state === 'end') return; const e = (b.enemies || []).find(u => u && u.alive && u._charge && (u._yw || u.boss)); if (!e) return;
      const c = colOf(e), t = performance.now() / 1000, a = .2 + .12 * Math.sin(t * 7); ctx.save(); const g = ctx.createRadialGradient(640, 360, 300, 640, 360, 760); g.addColorStop(0, rgba(c, 0)); g.addColorStop(1, rgba(c, a)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); } catch (er) {} } }); } catch (e) {}

  // ---- 妖王登场：开打头一两秒，一道墨带横过屏幕，名号用它自己的颜色亮出来 ----
  try { S.overlay.push({ draw() { try { const b = typeof battle !== 'undefined' && battle, e = b && b._yw; if (!e || !e.alive || b.state === 'end') return; if (b.__warm || (window.FXW_BLOCKING && FXW_BLOCKING())) return;
      const now = performance.now() / 1000; if (!b._r377t) { b._r377t = now; try { S.flash = .5; S.flashColor = rgba(colOf(e), 1); S.shake = 10; playSnd('sfx_ult', .45); } catch (er) {} }
      const dt = now - b._r377t, D = 1.9; if (dt > D) return; const c = colOf(e), a = Math.min(1, dt / .18) * Math.min(1, (D - dt) / .45), sl = (1 - Math.min(1, dt / .22)) * 260, sc = 1 + Math.max(0, .22 - dt) * 1.8;
      ctx.save(); ctx.globalAlpha = a; const g = ctx.createLinearGradient(0, 250, 0, 470); g.addColorStop(0, 'rgba(6,4,3,0)'); g.addColorStop(.22, 'rgba(6,4,3,.86)'); g.addColorStop(.78, 'rgba(6,4,3,.86)'); g.addColorStop(1, 'rgba(6,4,3,0)'); ctx.fillStyle = g; ctx.fillRect(0, 250, W, 220);
      ctx.fillStyle = rgba(c, .75); ctx.fillRect(sl, 296, W, 2); ctx.fillRect(-sl, 424, W, 2);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.translate(640 - sl * .4, 350); ctx.scale(sc, sc);
      ctx.shadowColor = rgba(c, .95); ctx.shadowBlur = 34; ctx.font = `92px ${BRUSH}`; ctx.fillStyle = rgba(c, 1); ctx.fillText(e._ep || '', 0, -6); ctx.shadowBlur = 0;
      ctx.font = `92px ${BRUSH}`; ctx.fillStyle = 'rgba(255,250,236,.92)'; ctx.fillText(e._ep || '', 0, -6);
      ctx.font = `700 24px ${FONT}`; ctx.fillStyle = rgba(c, 1); ctx.fillText('妖王　·　' + ((e._yw && e._yw.name) || '') + '　Lv' + e.lv, 0, 56); ctx.restore(); } catch (er) { try { ctx.restore(); } catch (e2) {} } } }); } catch (e) {}

  // ---- 地图上的妖王巢穴：垫在本体后面 ----
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function (T, cam, now) {
    let y = null; try { y = window.R370_HERE && R370_HERE(); if (y && typeof battle !== 'undefined' && battle) y = null; } catch (e) {}
    const t = performance.now() / 1000, c = y && (COL[y.id] || COL.boss);
    if (y) { try { back(y.id, c, y.pos[0], y.pos[1], y.mh * .92, t, .7, 1.3); } catch (e) {} }
    const r = orig && orig.apply(this, arguments);
    if (y) { try { motes(c, y.pos[0], y.pos[1], y.mh * .92, t, .6, 1.3); } catch (e) {} }
    return r; })(tileAmbientHigh);
})();
