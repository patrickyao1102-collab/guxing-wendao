/* Codex R83 · 代码特效改画图：通用时间轴播放器（imagegen 原画 + 4×4 图集，按 timeline.json 原样摆放）
 * 锚点：caster / target / field / enemyN / allyN + .head / .feet / .chest；once-fit 按片段时长铺满 16 帧，loop 按 fps 循环；keyframes 线性插值。 */
(function () {
  'use strict';
  if (!window.SK4 || !SK4.ACT) return;
  const LOC = !!(window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const DEFS = { duopo: {"dir": "r83/01_叶孤星_夺魄_幽紫摄魂/", "dur": 2.6, "hit": [1.2], "dim": {"color": [8, 6, 25], "peakOpacity": 0.28, "fadeInSeconds": 0.25, "fadeOutSeconds": 0.4}, "el": {"01_聚魂剑冠": {"b": "7e8f843d70a49a3174b73f4b3105fb64", "fps": 16}, "02_魂剑向心汇聚": {"b": "fb3d91d259aca00ff4d73f506f539a5e", "fps": 16}, "03_夺魄魂剑": {"b": "df950baace71c883e690c2c91e75f63b", "fps": 32}, "04_眉心命中": {"b": "dae2750f9abd038f4b162161bdf45140", "fps": 20}, "05_摄魂锁印": {"b": "c17ca1d3f598a76c6e6cbc1b3c45e836", "fps": 16}}, "clips": [{"element": "01_聚魂剑冠", "start": 0, "end": 1.12, "anchor": "caster.head", "offset": [-160, -140], "displaySize": [540, 540], "opacity": 0.86, "rotationDegrees": 0, "z": 1, "fadeIn": 0.06, "fadeOut": 0.12, "blend": "source-over", "playback": "once-fit", "persistentUntilStatusRemoved": false}, {"element": "02_魂剑向心汇聚", "start": 0, "end": 0.96, "anchor": "caster.head", "offset": [-160, -10], "displaySize": [580, 580], "opacity": 0.9, "rotationDegrees": 0, "z": 1, "fadeIn": 0.06, "fadeOut": 0.12, "blend": "source-over", "playback": "once-fit", "persistentUntilStatusRemoved": false}, {"element": "03_夺魄魂剑", "start": 0.88, "end": 1.34, "anchor": "caster.head", "offset": [-180, -30], "displaySize": [480, 480], "opacity": 1, "rotationDegrees": -15, "z": 1, "fadeIn": 0.1, "fadeOut": 0.04, "blend": "source-over", "playback": "loop", "persistentUntilStatusRemoved": false, "keyframes": [{"t": 0.88, "anchor": "caster.head", "offset": [-180, -30]}, {"t": 1.04, "anchor": "caster.head", "offset": [-180, -30]}, {"t": 1.2, "anchor": "target.head", "offset": [185, 50]}, {"t": 1.34, "anchor": "target.head", "offset": [185, 50]}]}, {"element": "04_眉心命中", "start": 1.2, "end": 1.8, "anchor": "target.head", "offset": [0, 6], "displaySize": [520, 520], "opacity": 0.9, "rotationDegrees": 0, "z": 1, "fadeIn": 0, "fadeOut": 0.05, "blend": "source-over", "playback": "once-fit", "persistentUntilStatusRemoved": false, "startFrame": 4}, {"element": "05_摄魂锁印", "start": 1.28, "end": 2.6, "anchor": "target.head", "offset": [0, 4], "displaySize": [100, 100], "opacity": 0.95, "rotationDegrees": 0, "z": 1, "fadeIn": 0.12, "fadeOut": 0.22, "blend": "source-over", "playback": "loop", "persistentUntilStatusRemoved": true}]} };
  const IMC = {};
  function img(def, name) { const key = def.dir + name; if (IMC[key] !== undefined) return IMC[key] || null; IMC[key] = false; const im = new Image(); im.onload = () => { IMC[key] = im; }; im.src = LOC ? def.dir + name + '.webp' : '/_blob/' + def.el[name].b; return null; }
  function preload(def) { for (const n in def.el) img(def, n); }
  for (const k in DEFS) setTimeout(() => preload(DEFS[k]), 3000);
  const pos = u => ({ x: u.x + (u.ox || 0), y: u.y + (u.oy || 0), h: u.h });
  function anchorPt(ctxU, a) { const [who, part] = a.split('.'); if (who === 'field') return [640, 360]; const u = ctxU[who]; if (!u) return [640, 360]; const p = pos(u);
    return part === 'head' ? [p.x, p.y - p.h] : part === 'chest' ? [p.x, p.y - p.h * .65] : [p.x, p.y]; }
  function where(ctxU, c, t) { const kf = c.keyframes; if (!kf || !kf.length) { const [x, y] = anchorPt(ctxU, c.anchor); return [x + c.offset[0], y + c.offset[1]]; }
    if (t <= kf[0].t) { const [x, y] = anchorPt(ctxU, kf[0].anchor); return [x + kf[0].offset[0], y + kf[0].offset[1]]; }
    for (let i = 0; i < kf.length - 1; i++) { const a = kf[i], b = kf[i + 1]; if (t <= b.t) { const q = (t - a.t) / Math.max(1e-6, b.t - a.t), [ax, ay] = anchorPt(ctxU, a.anchor), [bx, by] = anchorPt(ctxU, b.anchor); return [ax + a.offset[0] + (bx + b.offset[0] - ax - a.offset[0]) * q, ay + a.offset[1] + (by + b.offset[1] - ay - a.offset[1]) * q]; } }
    const z = kf[kf.length - 1], [x, y] = anchorPt(ctxU, z.anchor); return [x + z.offset[0], y + z.offset[1]]; }
  function drawClip(def, c, ctxU, t, alphaMul = 1, forceLoop = false) {
    const im = img(def, c.element); if (!im) return; const tc = t - c.start, dur = c.end - c.start; const fps = def.el[c.element].fps;
    let fr; if (c.playback === 'loop' || forceLoop) fr = Math.floor(tc * fps) % 16; else { const s0 = c.startFrame || 0; fr = Math.min(15, s0 + Math.floor(Math.max(0, tc) / dur * (16 - s0))); }
    let a = (c.opacity ?? 1) * alphaMul; if (!forceLoop) { if (c.fadeIn > 0) a *= Math.min(1, tc / c.fadeIn); if (c.fadeOut > 0) a *= Math.min(1, (c.end - t) / c.fadeOut); }
    if (a <= 0) return; const [x, y] = where(ctxU, c, t), cw = im.width / 4, [w, h] = c.displaySize;
    ctx.save(); ctx.globalAlpha = Math.min(1, a); if (c.blend && c.blend !== 'source-over') ctx.globalCompositeOperation = c.blend; ctx.translate(x, y); if (c.rotationDegrees) ctx.rotate(c.rotationDegrees * Math.PI / 180);
    ctx.drawImage(im, (fr % 4) * cw, Math.floor(fr / 4) * cw, cw, cw, -w / 2, -h / 2, w, h); ctx.restore(); }
  // 播一整招：返回 { until(sec) }
  function play(id, ctxU) { const def = DEFS[id]; preload(def); const t0 = performance.now(), now = () => (performance.now() - t0) / 1000;
    if (def.dim) { const d = def.dim; addFx({ life: def.dur + .1, layer: 0, draw() { const t = now(); const a = d.peakOpacity * Math.min(1, t / d.fadeInSeconds) * Math.min(1, Math.max(0, def.dur - t) / d.fadeOutSeconds); if (a <= 0) return; ctx.save(); ctx.fillStyle = `rgba(${d.color.join(',')},${a})`; ctx.fillRect(-50, -50, W + 100, H + 100); ctx.restore(); } }); }
    addFx({ life: def.dur + .1, layer: 2, draw() { const t = now(); for (const c of def.clips) if (t >= c.start && t < c.end) drawClip(def, c, ctxU, t); } });
    return { until: async s => { const ms = s * 1000 - (performance.now() - t0); if (ms > 0) await sleep(ms); } }; }
  // 持续层：片段结束后接着循环，直到 cond() 为假
  function hold(id, element, ctxU, cond) { const def = DEFS[id], c = def.clips.find(x => x.element === element); if (!c) return; const t0 = performance.now(), b0 = battle;
    addFx({ life: 9999, layer: 2, draw(f) { if (battle !== b0 || !cond()) { f.t = f.life; return; } const t = c.start + (performance.now() - t0) / 1000; drawClip(def, c, ctxU, t, 1, true); } }); }
  window.R83P = { DEFS, play, hold, preload };

  // ---------- 叶孤星 · 贪狼剑意·夺魄（幽紫摄魂）----------
  const A = SK4.ACT;
  A.duopo = async function (P, t) { if (!t) return;
    P.pose = 'cast'; try { await portraitPop(P); } catch (e) {} try { skillBanner('贪狼剑意 · 夺魄', '#c8a8ff', '聚魂为剑 · 一剑定魂'); } catch (e) {}
    try { playSnd('sfx_charge', .8); } catch (e) {}
    const fx = play('duopo', { caster: P, target: t });
    await fx.until(1.0); try { playSnd('sfx_beam'); } catch (e) {}
    await fx.until(1.2); screenFlash('#d8c8ff', .22); S.shake = 22; try { playSnd('sfx_crit'); } catch (e) {}
    const { d } = dmgCalc(P, t, 4.0, .3); applyDamage(t, d, true, { pierce: true }); await hitStop(100);
    if (t.alive && SK4.stun(t, 1) !== false) { t._r76stun = 1; hold('duopo', '05_摄魂锁印', { target: t }, () => t.alive && t.buffs && t.buffs.stun > 0); }
    await fx.until(2.6); P.pose = null;
  };
})();
