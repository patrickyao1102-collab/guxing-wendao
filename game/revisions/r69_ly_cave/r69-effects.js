/* R69 local object effects. Shared by preview, renderer and game patch. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.R69_EFFECTS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const indexes = new WeakMap();
  const tau = Math.PI * 2;
  function lookup(config, uid) {
    if (!config || typeof config !== 'object') return null;
    let index = indexes.get(config);
    if (!index) {
      index = new Map();
      for (const e of config.crystals || []) index.set(e.uid, {kind: 'crystal', spec: e});
      for (const e of config.pools || []) index.set(e.uid, {kind: 'pool', spec: e});
      indexes.set(config, index);
    }
    return index.get(uid);
  }
  function color(value, fallback) {
    const s = String(value || fallback).replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(s)) return fallback.match(/../g).map(v => parseInt(v, 16)).join(',');
    return s.match(/../g).map(v => parseInt(v, 16)).join(',');
  }
  function crystal(ctx, e, t, mode) {
    const s = e.scale || 1, phase = e.phase || 0;
    const pulse = .5 + .5 * Math.sin(t * tau / (e.period || 5.8) + phase);
    const strength = (mode === 'night' ? 1.1 : 1) * (.045 + .045 * pulse);
    ctx.translate(e.x, e.y - 62 * s);
    ctx.scale(23 * s, 34 * s);
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(0, 0, .04, 0, 0, 1);
    const rgb = color(e.color, 'a8a0ee');
    g.addColorStop(0, `rgba(${rgb},${strength})`);
    g.addColorStop(.55, `rgba(${rgb},${strength * .4})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2);
    // A tiny moving brightness change, not a new particle field.
    ctx.fillStyle = `rgba(218,226,255,${.10 + .10 * pulse})`;
    ctx.beginPath(); ctx.ellipse(.04, -.15, .045, .05, 0, 0, tau); ctx.fill();
  }
  function pool(ctx, e, t) {
    // Inset inside the exact irregular water mask, so the ripple never covers shore rocks.
    const rx = Math.max(1, e.rx - 8), ry = Math.max(1, e.ry - 6);
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const a = i * tau / 90, r = 1 + .060 * Math.sin(a * 7) + .035 * Math.cos(a * 11);
      const x = e.x + Math.cos(a) * rx * r, y = e.y + Math.sin(a) * ry * r;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.clip();
    ctx.globalCompositeOperation = 'screen';
    ctx.lineWidth = 1;
    const period = e.period || 4.8;
    for (let i = 0; i < 2; i++) {
      const p = ((t / period + i * .48 + (e.phase || 0)) % 1 + 1) % 1;
      const a = Math.sin(Math.PI * p) ** 2 * .16;
      const x = e.x + (i ? .28 : -.32) * e.rx, y = e.y + (i ? .15 : -.18) * e.ry;
      const radius = 7 + 55 * p;
      ctx.strokeStyle = `rgba(190,225,233,${a})`;
      ctx.beginPath();ctx.ellipse(x, y, radius, radius * .36, 0, .2, Math.PI * 1.83);ctx.stroke();
      ctx.strokeStyle = `rgba(190,225,233,${a * .45})`;
      ctx.beginPath();ctx.ellipse(x, y + 1, radius * .8, radius * .29, 0, Math.PI * 1.05, tau);ctx.stroke();
    }
  }
  function drawObject(ctx, config, uid, timeSeconds, mode, reducedMotion) {
    const effect = lookup(config, uid);
    if (!effect) return false;
    const t = reducedMotion ? 1.35 : (Number.isFinite(timeSeconds) ? timeSeconds : 0);
    ctx.save();
    try {
      if (effect.kind === 'crystal') crystal(ctx, effect.spec, t, mode);
      else pool(ctx, effect.spec, t);
    } finally { ctx.restore(); }
    return true;
  }
  return Object.freeze({apiVersion: 1, drawObject});
});
