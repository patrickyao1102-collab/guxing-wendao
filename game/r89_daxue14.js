// R89 林雪 · 大雪纷飞 v14「冰爆震地」：照 Codex 交付（timeline_3敌 + runtime_reference.js）原样接入。
// 所有画面都是 Codex 画的 PNG 序列；代码只做位置、帧、光强、镜头、染色、物理（与 runtime_reference 同一套公式）。
// 实机：按真实敌人站位重绑锚点 / 冰锥尺寸 / 碎冰落点；HUD 在镜头之后绘制。
(function () {
  if (!window.DX14_DATA) return;
  const D = window.DX14_DATA, LOC = !!(window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const BLOB = window.DX14_BLOB || {};
  const src = f => LOC || !BLOB[f] ? 'r89/' + f + '.webp' : '/_blob/' + BLOB[f];
  const IM = {};
  function img(f) { if (IM[f] !== undefined) return IM[f] || null; IM[f] = false; const im = new Image(); im.onload = () => { const ok = () => { IM[f] = im; }; im.decode ? im.decode().then(ok, ok) : ok(); }; im.src = src(f); return null; }
  const num = id => id.split('_')[0];
  const pair = id => ({ body: img('dx14_' + num(id) + '_body'), glow: img('dx14_' + num(id) + '_glow') });
  const PB = () => img('dx14_particles_body'), PG = () => img('dx14_particles_glow');
  function preload() { for (const c of D.T.clips) pair(c.asset); PB(); PG(); img('dx14_frost_material'); img('dx14_ice_B'); }
  window.DX14_PRELOAD = preload;

  // ---------- runtime_reference.js（原样移植）----------
  const clamp = x => Math.max(0, Math.min(1, x)), ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  function track(keys, t) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [a, x] = keys[i - 1], [b, y] = keys[i]; return x + (y - x) * (t - a) / (b - a); } return keys[keys.length - 1][1]; }
  const snowClock = (t, hold) => { const [a, b] = hold; return t < a ? t : t < b ? a : t - (b - a); };
  function anchor(T, key) { if (T.anchors[key]) return T.anchors[key]; const e = T.targets.find(e => key === e.id + '.feet'); return e ? e.feet : [640, 360]; }
  function snowParticle(p, t, T) {
    const time = snowClock(t, T.timing.snowHold), age = time - p.birth;
    if (t < 1.8 || t >= 6.7 || age < 0 || age >= p.life) return null;
    let x = p.x + p.vx * age + 12 * Math.sin(age * 7 + p.phase), y = p.y + p.vy * age;
    if (x < 8 || x > T.rightClip || y < 28 || y > 690) return null;
    if (t >= 5.1) { const e = T.targets.reduce((a, b) => Math.abs(a.feet[0] - x) < Math.abs(b.feet[0] - x) ? a : b); x += (e.feet[0] - x) * ease((t - e.freezeStart) / .42) * .8; }
    return { id: p.asset, x, y, w: Math.round(p.size / 2) * 2, h: Math.round(p.size / 2) * 2, angle: Math.round((p.rotation + age * p.spin) / 15) * 15,
      opacity: p.opacity * ease(age / .08) * ease((p.life - age) / .22), glowGain: .35 + Math.max(0, Math.sin(time * 9 + p.phase)) ** 12 * 1.2, frame: 0, depth: p.depth };
  }
  function clipPose(q, t, T) {
    if (t < q.start || t >= q.end) return null;
    const local = t - q.start, span = q.end - q.start, u = local / span, id = q.asset;
    let [x, y] = anchor(T, q.anchor), [w, h] = q.size, a = q.opacity, g = q.glowGain;
    const [dx, dy] = q.offset || [0, 0]; x += dx; y += dy;
    if (q.fadeIn) a *= ease(local / q.fadeIn); if (q.fadeOut) a *= ease((span - local) / q.fadeOut);
    if (q.scaleIn) { const k = q.scaleIn[0] + (q.scaleIn[1] - q.scaleIn[0]) * ease(local / (id.includes('阵') ? .55 : 3)); w *= k; h *= k; }
    if (q.breath && t >= 1.8 && t < 5.1) { const pulse = Math.max(0, Math.cos((t - 1.8) * Math.PI * 2 / .6)) ** 6; g *= .8 + 1.1 * pulse; if (id === '06_阵下体积光') a *= .5 + .5 * pulse; }
    if (id === '49_持续施法六芒星' && t >= 6.7 && t < 6.85) g *= 1 + 2 * ease((6.85 - t) / .15);
    if (['01_', '02_', '03_'].some(s => id.startsWith(s))) { if (t >= Math.max(...T.targets.map(e => e.closed)) && t < 6.7) g = .72; if (t > 6.7) a *= ease((7.35 - t) / .65); }
    const rect = D.T.assets[id].contentRect;
    if (q.pivot === 'feet' || q.fitContent) { const [l, top, r, bot] = rect, sx = w / (r - l), sy = h / (bot - top); x += (256 - (l + r) / 2) * sx; y += q.pivot === 'feet' ? -(bot - 256) * sy : (256 - (top + bot) / 2) * sy; w = 512 * sx; h = 512 * sy; }
    let angle = (q.rotation || 0) + (q.rotationDegreesPerSecond || 0) * local;
    if (q.windSlide) x += q.windSlide.amplitudeX * Math.sin(local * Math.PI * 2 / q.windSlide.period);
    if (q.orbit) { const o = q.orbit, th = o.phase + local * o.radiansPerSecond; x += o.radiusX * Math.cos(th); y += o.radiusY * Math.sin(th); a *= .55 + .45 * Math.sin(th * 3 + t * 4) ** 2; }
    if (q.path) { const p = q.path, [tx, ty] = anchor(T, p.to);
      if (p.alignToMotion) { const [sx, sy] = anchor(T, q.anchor); x = (x + tx) / 2; y = (y + ty) / 2; w = Math.hypot(tx - sx, ty - sy); h = 110; angle = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI + 180; }
      else { const v = ease((t - p.moveStart) / (p.moveEnd - p.moveStart)); x += (tx - x) * v; y += (ty - y) * v + Math.sin(v * Math.PI) * (p.arcY || 0); } }
    let frame = q.interpolateFrames ? Math.min(15, u * 15) : q.framePolicy.startsWith('once') ? Math.min(15, Math.floor(u * 16)) : Math.floor(local * 16) % 16;
    if (id === '16_星芒霜环瞬爆') { frame = Math.min(15, 2 + Math.floor(u * 14)); const k = .65 + .5 * ease(u / .45); w *= k; h *= k; }
    if (id === '66_晶魄爆裂白芯') { frame = Math.min(15, 2 + Math.floor(u * 14)); const k = .40 + ease(u / .55); w *= k; h *= k; }
    if (id === '67_冰霜震地冲击') { frame = Math.min(15, 2 + Math.floor(u * 14)); const k = .40 + .95 * ease(u / .7); w *= k; h *= k; }
    if (q.sealSweep) frame = local < .24 ? Math.min(15, Math.floor(local / .24 * 16)) : Math.floor(local * 16) % 16;
    return { id, x, y, w, h, angle, opacity: a, glowGain: g, frame, projectionY: q.projectionY || 1, z: q.z };
  }
  const scratch = {};
  function mixFrame(atlas, j, key) { const cw = atlas.width / 4; j = Math.min(15, Math.round(j * 8) / 8); const lo = Math.floor(j), hi = Math.min(15, lo + 1), u = j - lo;
    let c = scratch[key]; if (!c) { c = document.createElement('canvas'); c.width = c.height = 512; scratch[key] = c; } const x = c.getContext('2d'); x.clearRect(0, 0, 512, 512); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1 - u;
    x.drawImage(atlas, lo % 4 * cw, Math.floor(lo / 4) * cw, cw, cw, 0, 0, 512, 512); x.globalCompositeOperation = 'lighter'; x.globalAlpha = u; x.drawImage(atlas, hi % 4 * cw, Math.floor(hi / 4) * cw, cw, cw, 0, 0, 512, 512); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; return c; }
  // images: 4x4 图集（格宽 = 图宽/4）；sprite: 粒子图集 sourceRect（160 格代表 512 逻辑画布）
  function drawPair(ctx, images, p, sr) {
    if (!images || !images.body || p.opacity <= .005) return;
    let bi = images.body, gi = images.glow, rect;
    if (sr) rect = sr;
    else if (p.frame !== Math.floor(p.frame)) { bi = mixFrame(images.body, p.frame, 'b'); gi = images.glow ? mixFrame(images.glow, p.frame, 'g') : null; rect = [0, 0, 512, 512]; }
    else { const cw = bi.width / 4; rect = [(Math.floor(p.frame) % 4) * cw, Math.floor(p.frame / 4) * cw, cw, cw]; }
    ctx.save(); ctx.translate(p.x, p.y);
    if (p.projectionY !== undefined && p.projectionY !== 1) { ctx.scale(p.w / 512, p.h / 512); ctx.rotate(p.angle * Math.PI / 180); }
    else { ctx.rotate(p.angle * Math.PI / 180); ctx.scale(p.w / 512, p.h / 512); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.min(1, p.opacity);
    ctx.drawImage(bi, rect[0], rect[1], rect[2], rect[3], -256, -256, 512, 512);
    if (gi && p.glowGain > 0) { ctx.globalCompositeOperation = 'lighter'; let gain = Math.max(0, p.opacity * p.glowGain); let rg = rect; if (!sr && gi !== images.glow) rg = [0, 0, 512, 512]; else if (!sr) { const cw = gi.width / 4; rg = [(Math.floor(p.frame) % 4) * cw, Math.floor(p.frame / 4) * cw, cw, cw]; }
      while (gain > 0) { ctx.globalAlpha = Math.min(1, gain); ctx.drawImage(gi, rg[0], rg[1], rg[2], rg[3], -256, -256, 512, 512); gain -= 1; } }
    ctx.restore();
  }
  function drawAny(ctx, p) { const sr = D.SPR[p.id]; if (sr && !(p.forceAtlas)) { const b = PB(), g = PG(); if (b) drawPair(ctx, { body: b, glow: p.glowGain > 0 ? g : null }, p, sr); } else drawPair(ctx, pair(p.id), p); }
  function extraParticles(t, T) {
    const out = [], [cx, cy] = T.anchors.skyArray, Dm = T.arrayDiameter, tau = Math.PI * 2;
    const flake = i => `${String(20 + i % 12).padStart(2, '0')}_独立六瓣雪花_${String(i % 12 + 1).padStart(2, '0')}`;
    const put = (id, x, y, w, angle, opacity, glowGain = 1, z = 2, h = w) => out.push({ id, x, y, w, h, angle, opacity, glowGain, z, frame: 0 });
    const OX = T.ox || 0;   // 实机：敌阵区横向平移
    if (t < 1.8) { for (let i = 0; i < 40; i++) put(flake(i), 80 + OX + (i * 113) % 650, 190 + (i * 67) % 420, 8 + i % 5 * 2, i * 27, .25 + .25 * ease(t), .6, i % 4 < 2 ? -1 : 2);
      if (t > .65) { const u = ease((t - .65) / 1.15); for (let i = 0; i < 36; i++) { const th = i * 2.399, r = (280 + i % 5 * 22) * (1 - u); put(flake(i), cx + Math.cos(th) * r, cy + Math.sin(th) * r * .35, 12 * (1 - u) + 4, i * 33, Math.sin(u * Math.PI), .8, -2); } } }
    if (t >= 1.8 && t < 5.15) for (let i = 0; i < 32; i++) { const u = (t * 1.9 + i * .618033) % 1; put(`${32 + i % 4}_锐利短雪痕_${i % 4 + 1}`, 80 + OX + ((i * 117 - u * 210) % 650 + 650) % 650, 100 + u * 530, 38 + i % 3 * 16, -60, .55 * Math.sin(u * Math.PI), .8, 2, 15 + i % 3 * 4); }
    for (const e of T.targets) { const u = (t - e.freezeStart) / .42; if (u >= 0 && u < 1) for (let i = 0; i < 36; i++) { const th = i * 2.4 + u * tau * 1.2, r = e.bodyWidth * .8 * (1 - u); put(flake(i), e.feet[0] + Math.cos(th) * r, e.feet[1] - e.bodyHeight * i / 36 + Math.sin(th) * r * .25, 12 + i % 3 * 3, th * 180 / Math.PI, Math.sin(u * Math.PI), 1, 2); } }
    if (t > 6.7 && t < 7.6) { const u = (t - 6.7) / .9; for (let i = 0; i < 45; i++) { const th = i * 2.399, r = Dm * .35 * (.3 + i % 7 / 10); put(flake(i), cx + Math.cos(th) * r, cy + Math.sin(th) * r * .35 - u * 60, 8 + i % 4 * 3, i * 23 + u * 20, (1 - u) * .8, .9, -1); } }
    if (t > 6.85 && t < 8) for (let i = 0; i < 120; i++) { const age = t - 6.85, tw = Math.max(0, Math.sin(i * 2.399 + age * 11)) ** 8; put('17_钻石尘星芒', 80 + OX + i * 97 % 690, 220 + i * 73 % 370 + age * (12 + i % 7 * 3), 4 + i % 4 * 3, i * 41, (.08 + .92 * tw) * ease((8 - t) / .4), 1.2, 6); }
    // 手印消散（casterSeal）
    if (t >= 6.7 && t < 7.15) { const u = (t - 6.7) / .45, [sx, sy] = T.anchors.casterSeal; for (let i = 0; i < 18; i++) { const th = i * 2.399, r = 20 + u * 50; put(`${20 + i % 12}_独立六瓣雪花_${String(i % 12 + 1).padStart(2, '0')}`, sx + Math.cos(th) * r * .7, sy + Math.sin(th) * r - u * 20, 5 + i % 3 * 2, i * 43 + u * 40, 1 - u, .5, 6); } }
    return out;
  }
  function ordinarySnow(p, t) {
    const density = track([[0, .05], [.7, .35], [1.8, .85], [3, 1], [5.1, 1], [6.7, .8], [7.3, .35], [8, 0]], t), gust = .88 + .12 * Math.sin(t * 3.7) ** 2;
    const opacity = clamp((density * gust - p.rank) * 8) * p.opacity; if (opacity < .01) return null;
    const mod = (a, n) => ((a % n) + n) % n, x = mod(p.x + p.vx * t + 24 * Math.sin(t * 2 + p.phase) + 120, 1520) - 120, y = mod(p.y + p.vy * t + 90, 900) - 90, size = Math.round(p.size / 2) * 2;
    return { id: p.asset, x, y, w: size, h: size, angle: Math.round((p.phase * 50 + t * p.spin) / 15) * 15, opacity, glowGain: 0, frame: 0, depth: p.depth };
  }
  function shardPosition(p, age) { const k = p.impact, g = p.gravity, d = p.bounceDuration; let vx = p.vx, x = p.x;
    if (age < k) return [x + vx * age, p.y + p.vy * age + .5 * g * age * age, p.rotation + p.spin * age];
    const u = age - k; x += vx * k; const up = (p.vy + g * k) * p.restitution; vx *= p.friction;
    if (u < d) return [x + vx * u, p.floor - up * u + .5 * g * u * u, p.rotation + p.spin * (k + u * .5)];
    const v = u - d; return [x + vx * d + vx * .45 * (1 - Math.exp(-6 * v)) / 6, p.floor, p.rotation + p.spin * (k + d * .5)]; }
  function physicalShards(t, S) { if (t < 6.7 || t >= 8) return []; const age = t - 6.7, opacity = ease((8 - t) / .32), out = [];
    for (const p of S) { const [x, y, angle] = shardPosition(p, age); out.push({ id: p.asset, x, y, w: p.size, h: p.size, angle, opacity, glowGain: .28 + .45 * Math.exp(-age * 4) + .16 * Math.max(0, Math.sin(age * 12 + p.rotation)) ** 8, frame: 0 });
      const u = age - p.impact; if (u > 0 && u < .65) for (const q of p.secondary) out.push({ id: q.asset, x: p.x + p.vx * p.impact + q.vx * u, y: Math.min(p.floor, p.floor + q.vy * u + 550 * u * u), w: q.size, h: q.size, angle: q.spin * u, opacity: opacity * ease((.65 - u) / .2), glowGain: .32, frame: 0 }); }
    return out; }
  function rebindShard(p, old, e) { const sx = e.bodyWidth / old.bodyWidth, sy = e.bodyHeight / old.bodyHeight;
    const q = Object.assign({}, p, { x: e.feet[0] + (p.x - old.feet[0]) * sx, y: e.feet[1] + (p.y - old.feet[1]) * sy, size: p.size * Math.sqrt(sx * sy) });
    q.floor = Math.max(e.feet[1] - q.size * .26, q.y + 2); q.impact = (-q.vy + Math.sqrt(q.vy * q.vy + 2 * q.gravity * (q.floor - q.y))) / q.gravity; q.bounceDuration = 2 * (q.vy + q.gravity * q.impact) * q.restitution / q.gravity; return q; }
  const impactClock = t => t >= 6.7 && t < 6.8 - 1e-7 ? 6.7 : t;

  // ---------- 实机绑定 ----------
  const bboxCache = {};
  function unitImg(u) { const key = u.key + (u.pose === 'atk' ? '_atk' : u.pose === 'cast' ? '_cast' : ''); return IMG[key] || IMG[u.key]; }
  function visBox(im) { const k = im.src; if (bboxCache[k]) return bboxCache[k]; const c = document.createElement('canvas'), s = Math.min(1, 256 / Math.max(im.width, im.height)); c.width = Math.max(1, Math.round(im.width * s)); c.height = Math.max(1, Math.round(im.height * s));
    const x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height); let d; try { d = x.getImageData(0, 0, c.width, c.height).data; } catch (e) { return bboxCache[k] = [0, 0, 1, 1]; }
    let l = c.width, r = 0, tp = c.height, b = 0; for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) if (d[(y * c.width + xx) * 4 + 3] > 40) { if (xx < l) l = xx; if (xx > r) r = xx; if (y < tp) tp = y; if (y > b) b = y; }
    return bboxCache[k] = r > l ? [l / c.width, tp / c.height, (r + 1) / c.width, (b + 1) / c.height] : [0, 0, 1, 1]; }
  function liveTarget(u, i, tmpl) { const im = unitImg(u), h = u.h, w = im ? h * im.width / im.height : h * .8, bb = im ? visBox(im) : [0, 0, 1, 1];
    return { id: 'enemy' + i, unit: u, feet: [u.x + (u.ox || 0), u.y + (u.oy || 0)], bodyWidth: Math.max(40, w * (bb[2] - bb[0])), bodyHeight: Math.max(60, h * (1 - bb[1])), freezeStart: tmpl.freezeStart, closed: tmpl.closed, tmpl }; }
  function bind(P, enemies) {
    const n = enemies.length, base = D.T, TT = base.targets;
    const targets = enemies.map((u, i) => liveTarget(u, i, TT[i % 3]));
    const gx = targets.reduce((a, e) => a + e.feet[0], 0) / n, gy = targets.reduce((a, e) => a + e.feet[1], 0) / n, maxY = Math.max(...targets.map(e => e.feet[1]));
    const px = P.x + (P.ox || 0), py = P.y + (P.oy || 0), ph = P.h || 223;
    const anchors = { casterHand: [px - .2 * ph, py - .826 * ph], casterSeal: [px - .359 * ph, py - .826 * ph], enemyGroup: [gx, gy], skyArray: [gx, 155], coldHorizon: [640, 230], frostField: [640, 555], impactGround: [gx, maxY - 25] };
    const T = { anchors, targets, timing: base.timing, codeFx: base.codeFx, arrayDiameter: base.arrayDiameter[String(Math.min(3, n))], ox: gx - base.anchors.enemyGroup[0], rightClip: Math.min(860, Math.max(810, Math.max(...targets.map(e => e.feet[0] + e.bodyWidth)) + 60)) };
    // 时间轴：群体/天阵段照用；逐敌段按真实敌人缩放尺寸与偏移
    const clips = [];
    for (const c of base.clips) { const m = /^enemy(\d)\.feet$/.exec(c.anchor); if (!m) { if (c.asset.startsWith('0') && /0[123]_/.test(c.asset)) { const k = T.arrayDiameter / 1040; clips.push(Object.assign({}, c, { size: [c.size[0] * k, c.size[1] * k] })); } else clips.push(c); continue; }
      const k = +m[1]; for (let i = k; i < n; i += 3) { const e = targets[i], o = TT[k], sx = e.bodyWidth / o.bodyWidth, sy = e.bodyHeight / o.bodyHeight, dt = (i - k) / 3 * .24;
        clips.push(Object.assign({}, c, { anchor: 'enemy' + i + '.feet', size: [c.size[0] * sx, c.size[1] * sy], offset: c.offset ? [c.offset[0] * sx, c.offset[1] * sy] : undefined, start: c.start + (c.start < 6.7 ? dt : 0), end: c.end + (c.end <= 6.7 ? 0 : 0) })); } }
    // 体积光、冰霜地面等跟随敌阵
    T.clips = clips.sort((a, b) => (a.z || 0) - (b.z || 0));
    // 暴雪粒子：offsetNormalized 绑到真实天阵
    const N = D.names; T.snow = D.P.map(a => ({ asset: N[a[0]], birth: a[1], life: a[2], x: gx + a[3] * T.arrayDiameter, y: 155 + a[4] * T.arrayDiameter, vx: a[5], vy: a[6], size: a[7], rotation: a[8], spin: a[9], phase: a[10], depth: a[11], opacity: a[12] }));
    T.weather = D.W.map(a => ({ asset: N[a[0]], depth: a[1], x: a[2], y: a[3], vx: a[4], vy: a[5], size: a[6], phase: a[7], spin: a[8], opacity: a[9], rank: a[10] }));
    T.shards = []; targets.forEach((e, i) => { const tid = 'enemy' + (i % 3); for (const p of D.SH) if (p.target === tid) T.shards.push(rebindShard(p, TT[i % 3], e)); });
    return T;
  }

  // ---------- 敌人身上的寒霜 / 薄冰（只在单位自身 alpha 内）----------
  const fc = document.createElement('canvas');
  function frostOverlay(ctx, e, t, T) {
    const u = e.unit; if (!u || !u.alive && t < 6.7) { if (!u) return; }
    const im = unitImg(u); if (!im) return; const F = T.codeFx, conf = F.snowAccretionMaterial;
    let tint = track(F.unitColdTint.opacityKeys, t); for (const x of F.enemyHitFlashTimes) if (x <= t && t < x + .08) tint = Math.max(tint, (1 - (t - x) / .08) * .32);
    const ai = track(conf.thinIceOpacityKeys, t), af = track(conf.frostOpacityKeys, t); if (tint < .01 && ai < .01 && af < .01) return;
    const h = u.h, w = h * im.width / im.height, X = u.x + (u.ox || 0) - w / 2, Y = u.y + (u.oy || 0) - h;
    fc.width = Math.ceil(w); fc.height = Math.ceil(h); const c = fc.getContext('2d'); c.clearRect(0, 0, fc.width, fc.height); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.drawImage(im, 0, 0, fc.width, fc.height);
    c.globalCompositeOperation = 'source-atop'; c.globalAlpha = tint; c.fillStyle = 'rgb(219,248,255)'; c.fillRect(0, 0, fc.width, fc.height);
    const tile = 180 / 512;
    for (const [nm, al] of [['dx14_ice_B', ai], ['dx14_frost_material', af]]) { const m = img(nm); if (!m || al < .01) continue; const pat = c.createPattern(m, 'repeat'); if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(tile * 512 / m.width)); c.globalAlpha = al; c.fillStyle = pat; c.fillRect(0, 0, fc.width, fc.height); }
    // 原图：先画一遍完整单位（已在场景里），这里只把"染色 + 材质"盖回去：去掉原像素，留差值叠加
    ctx.save(); ctx.globalAlpha = 1; ctx.drawImage(fc, X, Y, w, h); ctx.restore();
  }

  // ---------- 播放 ----------
  function run(P, enemies) {
    preload();
    const T = bind(P, enemies), F = T.codeFx, t0 = performance.now(), b0 = battle;
    const now = () => impactClock((performance.now() - t0) / 1000);
    const alive = () => battle === b0 && (performance.now() - t0) / 1000 < 8.05;
    const life = 8.1;
    const backClips = T.clips.filter(c => (c.z || 0) < 0), frontClips = T.clips.filter(c => (c.z || 0) >= 0);
    // 镜头：推近 + 冰爆震地（整个战斗世界，HUD 不动）
    window.__R83ZOOM = () => { const rt = (performance.now() - t0) / 1000; if (!alive()) { window.__R83ZOOM = null; return null; } const t = impactClock(rt);
      const s = track(F.cameraZoomKeys, t); let dx = 0, dy = 0; const q = F.groundSlam; if (q && t >= q.start) { const a = t - q.start; dx = Math.round(track(q.xKeys, a)); dy = Math.round(track(q.yKeys, a)); }
      for (const sh of F.shakes) { const a = t - sh.time; if (a >= 0 && a < sh.duration) { const k = sh.pixels * (1 - a / sh.duration); dx += (Math.random() * 2 - 1) * k; dy += (Math.random() * 2 - 1) * k; } }
      return { s, px: F.cameraPivot[0], py: F.cameraPivot[1], dx, dy }; };
    // 层 0：背景冷化（降饱和 + 冷色，只压背景）→ 远景霜气 / 地面霜纹 / 天阵等 z<0 → 远层雪
    addFx({ life, layer: 0, draw() { if (!alive()) return; const t = now();
      const ds = track(F.desaturationKeys, t), et = track(F.environmentTint.opacityKeys, t);
      if (ds > .005) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = ds; ctx.fillStyle = '#808080'; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore(); }
      if (et > .005) { ctx.save(); ctx.globalAlpha = et; ctx.fillStyle = `rgb(${F.environmentTint.color.join(',')})`; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore(); }
      for (const c of backClips) { const p = clipPose(c, t, T); if (p) drawPair(ctx, pair(p.id), p); }
      for (const p of T.weather) if (p.depth === 0) { const q = ordinarySnow(p, t); if (q) drawAny(ctx, q); }
      for (const p of T.snow) if (p.depth <= 1) { const q = snowParticle(p, t, T); if (q) drawAny(ctx, q); }
      for (const q of extraParticles(t, T)) if (q.z < 0) drawAny(ctx, q);
    } });
    // 层 1：敌人寒霜 → 冷白雾 → z≥0 片段 → 近层雪 / 碎冰
    addFx({ life, layer: 1, draw() { if (!alive()) return; const t = now();
      if (t < 6.75) for (const e of T.targets) if (e.unit.alive || t < 6.7) frostOverlay(ctx, e, t, T);
      const mist = track(F.coldWhiteMist.opacityKeys, t); if (mist > .005) { ctx.save(); ctx.globalAlpha = mist; ctx.fillStyle = `rgb(${F.coldWhiteMist.color.join(',')})`; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore(); }
      for (const c of frontClips) { const p = clipPose(c, t, T); if (p) drawPair(ctx, pair(p.id), p); }
      for (const p of T.snow) if (p.depth >= 2) { const q = snowParticle(p, t, T); if (q) drawAny(ctx, q); }
      for (const q of extraParticles(t, T)) if (q.z >= 0) drawAny(ctx, q);
      for (const q of physicalShards(t, T.shards)) drawAny(ctx, q);
      for (const p of T.weather) if (p.depth >= 1) { const q = ordinarySnow(p, t); if (q) drawAny(ctx, q); }
    } });
    // 层 2：白闪（在 HUD 之上）
    addFx({ life, layer: 2, draw() { if (!alive()) return; const t = now(); for (const f of F.whiteFlashes) { const a = t - f.time; if (a >= 0 && a < f.duration) { const k = a < .025 ? a / .025 : 1 - (a - .025) / (f.duration - .025); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = f.peak * Math.max(0, k); ctx.fillStyle = '#f4fcff'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); } } } });
    return { until: async s => { while ((performance.now() - t0) / 1000 < s && battle === b0) await sleep(16); }, T };
  }
  window.DX14 = { run, bind, preload };

  // ---------- 林雪 · 大雪纷飞（v14）----------
  const DMG_TICKS = [2, 2.5, 3, 3.5, 4, 4.5, 5];
  window.DAXUE14_ON = true;
  const prevUlt = typeof ultDaxue === 'function' ? ultDaxue : null;
  ultDaxue = async function (P) {
    if (!window.DAXUE14_ON) return prevUlt && prevUlt(P);
    const ts = aliveEnemies(); if (!ts.length) return;
    P.pose = 'cast'; try { await portraitPop(P); } catch (e) {}
    const S2 = (n, v) => { try { playSnd(n, v); } catch (e) {} };
    const fx = run(P, ts);
    S2('sfx_dx_bed', .75); await fx.until(.12); S2('sfx_dx_prelude', .9);
    await fx.until(.5); S2('sfx_dx_cloud', .8);
    await fx.until(1.8); S2('sfx_dx_array', 1); S2('sfx_dx_storm', .9);
    let k = 0;
    const closes = fx.T.targets.map(e => e.closed).slice(0, 3);
    for (const c of closes) { await fx.until(c); S2('sfx_dx_freeze', .9); }
    await fx.until(6.7); S2('sfx_dx_shatter', 1); S2('sfx_boom', .8); try { hitStop(100); } catch (e) {}
    for (const t of ts) if (t.alive) { const { d } = dmgCalc(P, t, 1.25, 0); applyDamage(t, d, false); }
    await fx.until(6.82);
    for (const t of aliveEnemies()) { const bf = t.buffs || (t.buffs = {}); if (window.SK4 && SK4.immune && SK4.immune(t)) { try { SK4.immuneFx(t); } catch (e) {} continue; } bf.frozen = 1; t.gauge = 0; t.frozenFx = 1; floatText(t.x, t.y - t.h - 40, '冰封', '#cff4ff', 44); if (window.SK4 && SK4.onCtrl) SK4.onCtrl(t); }
    await fx.until(6.9); S2('sfx_dx_tinkle', .8);
    await fx.until(7.2); P.pose = null; await fx.until(8.0);
  };
  // 有林雪的战斗提前预载
  if (typeof startBattle === 'function') startBattle = (orig => function (cfg) { const r = orig.apply(this, arguments); try { if ((battle && battle.heroes || []).some(u => u.ally === 'linxue')) setTimeout(preload, 500); } catch (e) {} return r; })(startBattle);
})();
