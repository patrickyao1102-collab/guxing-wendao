/* Lightweight world-space flight ribbons. Independent of the sprite art and of the game engine. */
(function (global) {
  'use strict';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const THEMES = {
    white_tiger: { blue: [90, 181, 255], pale: [216, 245, 255], height: 44, spread: 19 },
    star_kun: { blue: [112, 157, 255], pale: [225, 231, 255], height: 43, spread: 23 }
  };
  function create(options = {}) {
    const life = clamp(options.life ?? .58, .4, .7);
    const interval = 1 / 30;
    const random = options.random || Math.random;
    let enabled = true, theme = THEMES.white_tiger, clock = 0, sampleClock = 0, starClock = 0, previous = null;
    const points = [], stars = [];
    function clear() { points.length = 0; stars.length = 0; previous = null; sampleClock = 0; starClock = 0; }
    function setEnabled(value) { enabled = !!value; clear(); return enabled; }
    function setTheme(value) { theme = THEMES[value] || THEMES.white_tiger; clear(); }
    function update(seconds, state) {
      const dt = clamp(Number(seconds) || 0, 0, .15);
      clock += dt;
      while (points.length && clock - points[0].born >= life) points.shift();
      for (let i = stars.length - 1; i >= 0; i--) if (clock - stars[i].born >= stars[i].life) stars.splice(i, 1);
      if (!state || !Number.isFinite(state.x) || !Number.isFinite(state.y)) { previous = null; return; }
      const current = { x: state.x, y: state.y };
      const old = previous; previous = current;
      if (!enabled || !state.moving || !old || !dt) { sampleClock = 0; starClock = 0; return; }
      const dx = current.x - old.x, dy = current.y - old.y, distance = Math.hypot(dx, dy);
      // Stationary characters never emit, even if an old input flag remains set.
      if (distance < .01) { sampleClock = 0; return; }
      if (distance > 100) { clear(); previous = current; return; }
      const ux = dx / distance, uy = dy / distance, px = -uy, py = ux;
      sampleClock += dt;
      const count = Math.min(5, Math.floor((sampleClock + 1e-8) / interval));
      sampleClock -= count * interval;
      const lift = Number(state.lift) || 0;
      for (let i = 0; i < count; i++) {
        const age = sampleClock + (count - i - 1) * interval;
        const t = clamp(1 - age / dt, 0, 1);
        const point = { x: old.x + dx * t - ux * 15, y: old.y + dy * t - lift - theme.height - uy * 15, px, py, ux, uy, born: clock - age, phase: clock * 7 };
        points.push(point);
      }
      if (points.length > 36) points.splice(0, points.length - 36);
      starClock += dt;
      if (count && starClock >= .12) {
        starClock %= .12;
        const side = random() < .5 ? -1 : 1, point = points[points.length - 1];
        stars.push({ x: point.x + px * (theme.spread + 5) * side, y: point.y + py * (theme.spread + 5) * side, vx: -ux * (5 + random() * 7), vy: -uy * 7 - 3, born: clock, life: .46 + random() * .18, size: 1.1 + random() * 1.1 });
        if (stars.length > 10) stars.shift();
      }
    }
    function pointAt(point, side) {
      const age = Math.max(0, clock - point.born);
      const wave = Math.sin(point.phase + age * 9) * 2.1;
      const offset = (theme.spread + wave) * side;
      return { x: point.x + point.px * offset - point.ux * age * 7, y: point.y + point.py * offset - point.uy * age * 7 - age * 2, age };
    }
    function draw(ctx) {
      if (!enabled || (!points.length && !stars.length)) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const side of [-1, 1]) {
        for (let i = 1; i < points.length; i++) {
          const a = pointAt(points[i - 1], side), b = pointAt(points[i], side);
          if (Math.hypot(b.x - a.x, b.y - a.y) > 55) continue;
          const fade = Math.pow(clamp(1 - b.age / life, 0, 1), 1.5);
          const nearHead = i === points.length - 1 ? .82 : 1;
          ctx.globalAlpha = fade * .25 * nearHead;
          ctx.strokeStyle = `rgb(${theme.blue.join(',')})`; ctx.lineWidth = 4.4;
          ctx.shadowColor = `rgb(${theme.blue.join(',')})`; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          ctx.globalAlpha = fade * .66 * nearHead;
          ctx.strokeStyle = `rgb(${theme.pale.join(',')})`; ctx.lineWidth = 1.25; ctx.shadowBlur = 2;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      for (const star of stars) {
        const age = Math.max(0, clock - star.born), u = age / star.life;
        const alpha = Math.sin(Math.PI * clamp(u, 0, 1)) * .7;
        const x = star.x + star.vx * age, y = star.y + star.vy * age, size = star.size * (1 - u * .3);
        ctx.globalAlpha = alpha; ctx.fillStyle = `rgb(${theme.pale.join(',')})`;
        ctx.shadowColor = `rgb(${theme.blue.join(',')})`; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.moveTo(x, y - size * 1.5); ctx.lineTo(x + size * .32, y - size * .32);
        ctx.lineTo(x + size, y); ctx.lineTo(x + size * .32, y + size * .32); ctx.lineTo(x, y + size * 1.5);
        ctx.lineTo(x - size * .32, y + size * .32); ctx.lineTo(x - size, y); ctx.lineTo(x - size * .32, y - size * .32); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    function snapshot() { return { enabled, points: points.length, stars: stars.length, life, oldestAge: points.length ? clock - points[0].born : 0, newestPoint: points.length ? { x: points[points.length - 1].x, y: points[points.length - 1].y } : null }; }
    return { update, draw, clear, setEnabled, setTheme, snapshot };
  }
  global.MountDuoEffects = { create, version: '1.0', lifetimeSeconds: .58 };
})(typeof window !== 'undefined' ? window : globalThis);
