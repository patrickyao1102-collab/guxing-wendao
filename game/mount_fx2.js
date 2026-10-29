// ================= 坐骑光效 v2（Claude）：白虎 = 御风踏云（踏风印 / 卷云纹 / 翼焰 / 破风弧），灵鲲 = 水与星 =================
// 与 Codex mount_duo_effects.js 同一套接口（create / update / draw / clear / setEnabled / setTheme），另加 drawFront / burst。
// 全部世界坐标、实时绘制；只有真在移动才拖尾，悬停时换成环绕的风旋 / 水纹，起落有一圈爆散。
(function (G) {
  'use strict';
  const TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), mix = (a, b, q) => a + (b - a) * q;
  const THEMES = {
    white_tiger: { core: [236, 248, 255], glow: [86, 170, 255], deep: [40, 96, 230], accent: [170, 220, 255], bodyH: 64, wing: 50, wingY: 30 },
    star_kun:    { core: [232, 250, 255], glow: [80, 205, 255], deep: [30, 90, 200], accent: [255, 220, 140], bodyH: 60, wing: 40, wingY: 8 }
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  function create(opt = {}) {
    const rnd = opt.random || Math.random;
    let enabled = true, id = 'white_tiger', th = THEMES[id], clock = 0, prev = null, emitT = 0, sparkT = 0, idleT = 0, stepT = 0, stepSide = 1;
    const trail = [], parts = [], ripples = [];
    let state = { x: 0, y: 0, lift: 6, moving: false, riding: false }, dir = { x: 1, y: 0 }, speed = 0;
    function clear() { trail.length = parts.length = ripples.length = 0; prev = null; }
    function setEnabled(v) { enabled = !!v; clear(); return enabled; }
    function setTheme(v) { id = THEMES[v] ? v : 'white_tiger'; th = THEMES[id]; clear(); }
    const body = () => ({ x: state.x, y: state.y - state.lift - th.bodyH });
    // 两只翼尖（按朝向估算：上下飞时翅膀左右张开，左右飞时翅膀在背上）
    const wingTips = b => { const ax = Math.abs(dir.x), ay = Math.abs(dir.y), spread = 30 + 30 * ay, up = 38 + 22 * ax; return [{ x: b.x - spread - dir.x * 10, y: b.y - up + 8 * ay }, { x: b.x + spread - dir.x * 10, y: b.y - up + 8 * ay }]; };
    function spawn(p) { parts.push(Object.assign({ t: 0 }, p)); if (parts.length > 160) parts.splice(0, parts.length - 160); }
    // 起落：一圈爆散
    function burst(x, y, up) {
      if (!enabled) return;
      ripples.push({ x, y, t: 0, life: .8, r0: 20, r1: 120, k: 'ring' });
      for (let i = 0; i < 26; i++) {
        const a = rnd() * TAU, v = 60 + rnd() * 140;
        if (id === 'star_kun') spawn({ k: i % 3 ? 'bubble' : 'star', x: x + Math.cos(a) * 20, y: y - 20 - rnd() * 40, vx: Math.cos(a) * v * .6, vy: -40 - rnd() * 90, life: .7 + rnd() * .6, s: 2 + rnd() * 4 });
        else if (i % 2) spawn({ k: 'curl', x: x + Math.cos(a) * 30, y: y - 6 + Math.sin(a) * 9, vx: Math.cos(a) * v * .8, vy: Math.sin(a) * v * .25 - (up ? 30 : 10), life: .7 + rnd() * .3, s: 10 + rnd() * 8, th0: a, sense: rnd() < .5 ? -1 : 1 });
        else spawn({ k: 'wflame', x: x + Math.cos(a) * 20, y: y - 10 - rnd() * 40, vx: Math.cos(a) * v * .5, vy: -60 - rnd() * 80, life: .5 + rnd() * .3, s: 5 + rnd() * 4 });
      }
    }
    function update(seconds, st) {
      const dt = clamp(Number(seconds) || 0, 0, .1); clock += dt;
      if (!st || !Number.isFinite(st.x)) { prev = null; return; }
      state = { x: st.x, y: st.y, lift: st.lift || 6, moving: !!st.moving, riding: st.riding !== false };
      // 粒子推进
      for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.t += dt; if (q.t >= q.life) { parts.splice(i, 1); continue; }
        q.x += (q.vx || 0) * dt; q.y += (q.vy || 0) * dt; if (q.k === 'bubble') { q.vx *= .96; q.vy -= 20 * dt; q.x += Math.sin(q.t * 9 + q.s) * 12 * dt; } else if (q.k === 'flame' || q.k === 'wflame') { q.vy -= 50 * dt; q.vx *= .93; } else if (q.k === 'curl') { q.vx *= .95; q.vy *= .95; } else { q.vx *= .9; q.vy *= .9; } }
      for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].t += dt; if (ripples[i].t >= ripples[i].life) ripples.splice(i, 1); }
      while (trail.length && clock - trail[0].born > (id === 'star_kun' ? .75 : .6)) trail.shift();
      if (!enabled || !state.riding) { prev = null; return; }
      const b = body();
      const old = prev; prev = { x: st.x, y: st.y };
      let moved = 0;
      if (old) { const dx = st.x - old.x, dy = st.y - old.y; moved = Math.hypot(dx, dy); if (moved > 100) { clear(); prev = { x: st.x, y: st.y }; return; } if (moved > .01) { dir = { x: dx / moved, y: dy / moved }; } }
      speed = mix(speed, dt ? moved / dt : 0, .2);
      const moving = state.moving && moved > .01;
      if (moving) {
        trail.push({ x: b.x, y: b.y, nx: -dir.y, ny: dir.x, dx: dir.x, dy: dir.y, born: clock, ph: clock * 6 });
        if (trail.length > 48) trail.shift();
        emitT += dt; sparkT += dt;
        // 踏风印：四爪交替踏在风上，每一步留下一圈发光的风纹
        if (id === 'white_tiger') { stepT += dt; if (stepT > .2) { stepT = 0; stepSide = -stepSide; const nx = -dir.y, ny = dir.x; spawn({ k: 'step', x: state.x + nx * stepSide * 16 - dir.x * 6, y: state.y - 2 + ny * stepSide * 5, vx: 0, vy: 0, life: .65, s: 1, rot: rnd() * TAU }); } }
        while (emitT > .035) { emitT -= .035;
          const a = rnd() * TAU, ex = Math.cos(a) * th.wing * .9, ey = Math.sin(a) * 28;
          if (id === 'white_tiger') {
            // 翼焰：两翼尖拖出的长焰舌
            for (const tp of wingTips(b)) if (rnd() < .8) spawn({ k: 'wflame', x: tp.x + (rnd() - .5) * 8, y: tp.y + (rnd() - .5) * 8, vx: -dir.x * (90 + rnd() * 60), vy: -dir.y * (70 + rnd() * 40) - 20, life: .38 + rnd() * .22, s: 5 + rnd() * 4 });
            // 卷云纹：从身侧卷出、向后飘散
            if (rnd() < .22) { const sd = rnd() < .5 ? -1 : 1, nx = -dir.y, ny = dir.x; spawn({ k: 'curl', x: b.x + nx * sd * (34 + rnd() * 20) - dir.x * 20, y: b.y + 24 + ny * sd * 16 + (rnd() - .5) * 20, vx: -dir.x * (70 + rnd() * 40), vy: -dir.y * 50 - 8, life: .8 + rnd() * .3, s: 13 + rnd() * 9, th0: rnd() * TAU, sense: sd }); }
          } else {
            spawn({ k: 'bubble', x: b.x + ex * .8 - dir.x * 30, y: b.y + ey + 10, vx: -dir.x * 40 + (rnd() - .5) * 20, vy: -20 - rnd() * 30, life: .7 + rnd() * .5, s: 1.6 + rnd() * 3.4 });
            if (rnd() < .5) spawn({ k: 'star', x: b.x - dir.x * (40 + rnd() * 30) + (rnd() - .5) * 40, y: b.y + (rnd() - .5) * 40, vx: -dir.x * 20, vy: -10, life: .8 + rnd() * .6, s: 1.6 + rnd() * 2.2 });
          }
        }
      } else {
        // 悬停：环绕的风旋 / 水纹与星点
        idleT += dt;
        if (idleT > .09) { idleT = 0;
          const a = rnd() * TAU;
          if (id === 'white_tiger') {
            if (rnd() < .5) spawn({ k: 'curl', x: b.x + Math.cos(a) * 62, y: b.y + 26 + Math.sin(a) * 18, vx: -Math.sin(a) * 26, vy: -14, life: 1 + rnd() * .4, s: 8 + rnd() * 6, th0: rnd() * TAU, sense: Math.cos(a) > 0 ? 1 : -1 });
            for (const tp of wingTips(b)) if (rnd() < .5) spawn({ k: 'wflame', x: tp.x, y: tp.y, vx: (rnd() - .5) * 20, vy: -40 - rnd() * 30, life: .35 + rnd() * .2, s: 3 + rnd() * 3 });
            stepT += .09; if (stepT > .7) { stepT = 0; spawn({ k: 'step', x: state.x, y: state.y - 2, vx: 0, vy: 0, life: 1.1, s: 1.5, rot: rnd() * TAU }); }
          }
          else spawn({ k: rnd() < .55 ? 'bubble' : 'star', x: b.x + Math.cos(a) * 50, y: b.y + 18 + Math.sin(a) * 16, vx: 0, vy: -16 - rnd() * 16, life: 1 + rnd() * .6, s: 1.4 + rnd() * 2.6 });
        }
        if (id === 'star_kun' && (!ripples.length || ripples[ripples.length - 1].t > .55)) ripples.push({ x: state.x, y: state.y, t: 0, life: 1.4, r0: 14, r1: 70, k: 'water' });
      }
    }
    // 拖尾带：一条从头到尾变细的发光带（两层：外晕 + 亮芯）
    function ribbon(c, side, off, yOff, wave, width, fadeLife) {
      if (trail.length < 3) return;
      const C = [], N = [], Wd = [];
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i], age = clock - p.born, u = i / (trail.length - 1);
        const sway = Math.sin(p.ph - age * 10 + side) * wave * (1 - u);
        C.push([p.x + p.nx * (off * side + sway) - p.dx * age * 30, p.y + p.ny * (off * side + sway) + yOff - age * 14]);
        N.push([p.nx, p.ny]); Wd.push(width * Math.pow(Math.sin(Math.PI * (u * .9 + .05)), .8) * (1 - age / fadeLife * .3));   // 两头收尖，中段最宽
      }
      const t0 = C[0], t1 = C[C.length - 1];
      for (const [k, a, col] of [[2.8, .14, th.deep], [1.7, .3, th.glow], [.55, .85, th.core]]) {
        const g = c.createLinearGradient(t0[0], t0[1], t1[0], t1[1]); g.addColorStop(0, rgba(col, 0)); g.addColorStop(.55, rgba(col, a * .55)); g.addColorStop(1, rgba(col, a));
        c.fillStyle = g; c.beginPath();
        for (let i = 0; i < C.length; i++) { const x = C[i][0] + N[i][0] * Wd[i] * k, y = C[i][1] + N[i][1] * Wd[i] * k; i ? c.lineTo(x, y) : c.moveTo(x, y); }
        for (let i = C.length - 1; i >= 0; i--) c.lineTo(C[i][0] - N[i][0] * Wd[i] * k, C[i][1] - N[i][1] * Wd[i] * k);
        c.closePath(); c.fill();
      }
    }
    function star4(c, x, y, s, a, col) { c.fillStyle = rgba(col, a); c.beginPath(); c.moveTo(x, y - s * 2.2); c.quadraticCurveTo(x, y, x + s * 2.2, y); c.quadraticCurveTo(x, y, x, y + s * 2.2); c.quadraticCurveTo(x, y, x - s * 2.2, y); c.quadraticCurveTo(x, y, x, y - s * 2.2); c.fill(); }
    function glow(c, x, y, r, a, col) { if (a <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    // 背后层：在坐骑之前画（拖尾、焰、泡、地面水纹）
    function draw(c) {
      if (!enabled) return;
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      // 地面：悬停脚下一团光，灵鲲加水纹
      if (state.riding) { const pulse = .5 + .5 * Math.sin(clock * 3); c.save(); c.translate(state.x, state.y); c.scale(1, .28); glow(c, 0, 0, 70, .10 + .05 * pulse, th.glow); c.restore(); }
      for (const r of ripples) { const u = r.t / r.life, rad = mix(r.r0, r.r1, Math.pow(u, .7)), a = (1 - u) * (r.k === 'ring' ? .7 : .35);
        c.save(); c.translate(r.x, r.y); c.scale(1, .3); c.strokeStyle = rgba(r.k === 'ring' ? th.core : th.glow, a); c.lineWidth = r.k === 'ring' ? 4 : 2.2; c.beginPath(); c.arc(0, 0, rad, 0, TAU); c.stroke();
        if (r.k === 'water') { c.strokeStyle = rgba(th.core, a * .6); c.lineWidth = 1; c.beginPath(); c.arc(0, 0, rad * .8, 0, TAU); c.stroke(); } c.restore(); }
      // 拖尾：白虎两翼风带 + 尾焰；灵鲲一条大水纹带 + 星屑
      if (id === 'white_tiger') {
        // 破风弧：飞行时身前一道弯月形的风罩，速度越快越亮
        const sp = clamp(speed / 200, 0, 1); if (sp > .05 && state.riding) { const b = body(), ang = Math.atan2(dir.y, dir.x), pul = .8 + .2 * Math.sin(clock * 12);
          c.save(); c.translate(b.x + dir.x * 46, b.y + 18 + dir.y * 20); c.rotate(ang); c.scale(1, 1);
          for (const [w, a, col] of [[10, .08, th.deep], [5, .16, th.glow], [1.6, .38, th.core]]) { c.strokeStyle = rgba(col, a * sp * pul); c.lineWidth = w; c.beginPath(); c.ellipse(0, 0, 16, 44, 0, -.85, .85); c.stroke(); }
          c.restore(); }
      }
      else { ribbon(c, 1, 0, 6, 16, 14, .75); ribbon(c, -1, 22, -10, 10, 4, .75); ribbon(c, 1, 22, -10, 10, 4, .75); }
      for (const q of parts) {
        const u = q.t / q.life, a = Math.sin(Math.PI * Math.min(1, u * 1.4 + .05));
        if (q.k === 'flame') { const s = q.s * (1 - u * .5); c.save(); c.translate(q.x, q.y); c.rotate(Math.atan2(q.vy, q.vx) + Math.PI / 2);
          glow(c, 0, 0, s * 3.2, .25 * a, th.glow); c.fillStyle = rgba(th.accent, .7 * a); c.beginPath(); c.moveTo(0, -s * 2.2); c.quadraticCurveTo(s, 0, 0, s); c.quadraticCurveTo(-s, 0, 0, -s * 2.2); c.fill(); c.restore(); }
        else if (q.k === 'streak') { const l = q.s * (1 - u); c.strokeStyle = rgba(th.core, .55 * (1 - u)); c.lineWidth = 1.6; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - Math.cos(q.ang) * l, q.y - Math.sin(q.ang) * l); c.stroke(); }
        else if (q.k === 'bubble') { const s = q.s * (1 + u * .4), pop = u > .9 ? (1 - u) * 10 : 1; c.strokeStyle = rgba(th.core, .65 * a * pop); c.lineWidth = 1; c.beginPath(); c.arc(q.x, q.y, s, 0, TAU); c.stroke(); glow(c, q.x, q.y, s * 2.4, .18 * a, th.glow); c.fillStyle = rgba(th.core, .8 * a); c.beginPath(); c.arc(q.x - s * .35, q.y - s * .35, s * .28, 0, TAU); c.fill(); }
        else if (q.k === 'wflame') { const s = q.s * (1 - u * .6), ang = Math.atan2(q.vy, q.vx) - Math.PI / 2;
          c.save(); c.translate(q.x, q.y); c.rotate(ang); glow(c, 0, 0, s * 3.4, .22 * a, th.glow);
          for (const [k, col, al] of [[1.6, th.deep, .45], [1, th.glow, .6], [.45, th.core, .9]]) { c.fillStyle = rgba(col, al * a); c.beginPath(); c.moveTo(0, s * 3.6 * k); c.bezierCurveTo(s * 1.1 * k, s * 1.2 * k, s * .9 * k, -s * .6 * k, 0, -s * k); c.bezierCurveTo(-s * .9 * k, -s * .6 * k, -s * 1.1 * k, s * 1.2 * k, 0, s * 3.6 * k); c.fill(); }
          c.restore(); }
        else if (q.k === 'curl') { // 卷云纹：一笔由粗到细的螺旋
          const R = q.s * (1 + u * .5), th0 = q.th0 + u * 2.4 * q.sense, n = 20, pts = [];
          for (let j = 0; j <= n; j++) { const v = j / n, ang = th0 + v * 5.6 * q.sense, r = R * (1 - v * .86); pts.push([q.x + Math.cos(ang) * r, q.y + Math.sin(ang) * r * .62]); }
          for (const [w, col, al] of [[8, th.deep, .14], [5, th.glow, .3], [2.4, th.core, .85]]) { c.strokeStyle = rgba(col, al * a); for (let j = 1; j < pts.length; j++) { c.lineWidth = w * (1 - j / pts.length * .8); c.beginPath(); c.moveTo(pts[j - 1][0], pts[j - 1][1]); c.lineTo(pts[j][0], pts[j][1]); c.stroke(); } } }
        else if (q.k === 'step') { // 踏风印：脚下一圈发光风纹 + 四道短芒
          const r = 10 + 34 * Math.pow(u, .6) * q.s, al = (1 - u) * 1.15;
          c.save(); c.translate(q.x, q.y); c.scale(1, .32);
          glow(c, 0, 0, r * 1.6, .32 * al, th.glow);
          c.strokeStyle = rgba(th.glow, .45 * al); c.lineWidth = 5; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
          c.strokeStyle = rgba(th.core, .9 * al); c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, r, q.rot, q.rot + 4.2); c.stroke();
          for (let j = 0; j < 4; j++) { const ang = q.rot + j * TAU / 4; c.beginPath(); c.moveTo(Math.cos(ang) * r * 1.1, Math.sin(ang) * r * 1.1); c.lineTo(Math.cos(ang) * r * 1.45, Math.sin(ang) * r * 1.45); c.stroke(); }
          c.restore(); }
        else if (q.k === 'mote') { glow(c, q.x, q.y, q.s * 5, .35 * a, th.glow); c.fillStyle = rgba(th.core, .9 * a); c.beginPath(); c.arc(q.x, q.y, q.s * .7, 0, TAU); c.fill(); }
      }
      c.restore();
    }
    // 前景层：在坐骑之后画（少量闪星，不挡脸）
    function drawFront(c) {
      if (!enabled) return;
      c.save(); c.globalCompositeOperation = 'lighter';
      for (const q of parts) if (q.k === 'star') { const u = q.t / q.life, tw = .55 + .45 * Math.sin(q.t * 14 + q.s * 7), a = Math.sin(Math.PI * u) * tw; glow(c, q.x, q.y, q.s * 4, .3 * a, th.accent); star4(c, q.x, q.y, q.s, .9 * a, th.core); }
      c.restore();
    }
    function snapshot() { return { enabled, theme: id, trail: trail.length, parts: parts.length, ripples: ripples.length }; }
    return { update, draw, drawFront, burst, clear, setEnabled, setTheme, snapshot };
  }
  G.MountFX2 = { create, version: '2.0' };
})(typeof window !== 'undefined' ? window : globalThis);
