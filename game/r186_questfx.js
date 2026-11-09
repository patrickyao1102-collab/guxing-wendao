// ================= R186 · 任务道具光效加强（作者 11-10：「光效强烈点，让读者知道，尤其是任务道具」「藏经阁书架上拿书的时候光效也要强烈一点」）=================
// 藏经阁二层（第一章夜探）：
//   星旋指出转轮经藏之后 → 经藏上立一道金光 + 地上一圈圈往外扩的光环 + 往上飘的金星，告诉玩家「就是这里」
//   取书飞往石台的一路 → 剑典周围一大团金光 + 拖一条光尾，落到石台那一下爆开一圈光
//   剑典落在石台上之后（等着把玉佩贴上去）→ 石台上同样立金光
// 全部画在最上层（人物和家具之上），世界坐标。
(function () {
  const TAU = Math.PI * 2;
  const ROT = { x: 548, base: 985, top: 600, book: [548, 868] }, PED = { x: 864, base: 700, book: [864, 594] };
  const rnd = i => { const s = Math.sin(i * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };
  const here = () => typeof world !== 'undefined' && world.mapName === 'tj_forbidden' && S.flags && S.flags.lib_ch1;
  const story = () => window.LIBFX && LIBFX.story;
  const trail = []; let lastPhase = '', landAt = -9;

  function glow(ctx, x, y, r, a, c1, c2) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${c1},${a})`); g.addColorStop(.35, `rgba(${c2},${a * .45})`); g.addColorStop(1, `rgba(${c2},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  function star4(ctx, x, y, r, a) {
    ctx.fillStyle = `rgba(255,250,228,${a})`; ctx.beginPath();
    for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * .22 : r; ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    ctx.closePath(); ctx.fill();
  }
  // 「就是这里」：立柱金光 + 地面扩散光环 + 上飘金星
  function beacon(ctx, P, t, k) {
    const { x, base, top } = P, h = base - top + 140, mid = base - h / 2, pulse = .78 + .22 * Math.sin(t * 3.2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // 竖光：外层宽而淡，内层窄而亮，全部羽化
    for (const [w, a] of [[130, .38], [56, .55], [18, .7]]) {
      ctx.save(); ctx.translate(x, mid); ctx.scale(1, h / 2 / w);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w); g.addColorStop(0, `rgba(255,236,170,${a * pulse * k})`); g.addColorStop(.6, `rgba(255,205,110,${a * .35 * pulse * k})`); g.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w, 0, TAU); ctx.fill(); ctx.restore();
    }
    // 地面三圈往外扩的光环
    for (let i = 0; i < 3; i++) {
      const u = ((t * .55 + i / 3) % 1), rx = 50 + u * 160, a = (1 - u) * .85 * k;
      ctx.lineWidth = 3 * (1 - u) + 1; ctx.strokeStyle = `rgba(255,216,120,${a})`; ctx.shadowColor = 'rgba(255,200,90,.9)'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.ellipse(x, base, rx, rx * .32, 0, 0, TAU); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    glow(ctx, x, base, 170, .55 * pulse * k, '255,232,160', '255,200,100');
    // 往上飘的金星
    for (let i = 0; i < 22; i++) {
      const u = (t * (.18 + rnd(i) * .2) + rnd(i + 30)) % 1, px = x + (rnd(i + 60) - .5) * 120 + Math.sin(t * 1.5 + i) * 8, py = base - u * h, a = Math.sin(u * Math.PI) * k;
      glow(ctx, px, py, 7, a * .7, '255,246,210', '255,214,130'); if (i % 3 === 0) star4(ctx, px, py, 5 + rnd(i + 90) * 4, a);
    }
    ctx.restore();
  }
  function flight(ctx, s, t) {
    const pose = ScriptureStory.pose(s); if (!pose) return;
    const [x, y] = pose.point;
    trail.push([x, y]); if (trail.length > 26) trail.shift();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // 光尾
    for (let i = 1; i < trail.length; i++) {
      const u = i / trail.length, [x0, y0] = trail[i - 1], [x1, y1] = trail[i];
      ctx.strokeStyle = `rgba(255,222,140,${u * .7})`; ctx.lineWidth = 4 + u * 24; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      if (i % 3 === 0) star4(ctx, x1 + (rnd(i + t | 0) - .5) * 30, y1 + (rnd(i + 7) - .5) * 30, 4 + u * 5, u * .9);
    }
    // 书周围一大团光
    const p = .85 + .15 * Math.sin(t * 9);
    glow(ctx, x, y, 190, .6 * p, '255,240,190', '255,200,100');
    glow(ctx, x, y, 72, .9 * p, '255,252,235', '255,226,150');
    for (let i = 0; i < 6; i++) { const a = t * 2.4 + i * TAU / 6; star4(ctx, x + Math.cos(a) * 80, y + Math.sin(a) * 32, 10, .9); }
    ctx.restore();
  }
  function landing(ctx, t) {
    const a = t - landAt; if (a < 0 || a > 1.3) return;
    const [x, y] = PED.book, u = a / 1.3;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, x, y, 80 + u * 260, (1 - u) * .9, '255,250,225', '255,210,120');
    for (let i = 0; i < 2; i++) { const v = Math.min(1, u * (1.4 - i * .4)), r = 30 + v * 300;
      ctx.lineWidth = 6 * (1 - v) + 1; ctx.strokeStyle = `rgba(255,224,140,${(1 - v) * .9})`; ctx.beginPath(); ctx.ellipse(x, y + 60, r, r * .36, 0, 0, TAU); ctx.stroke(); }
    for (let i = 0; i < 12; i++) { const an = i * TAU / 12 + .2, L = 60 + u * 200;
      ctx.strokeStyle = `rgba(255,240,190,${(1 - u) * .7})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * 30, y + Math.sin(an) * 30); ctx.lineTo(x + Math.cos(an) * L, y + Math.sin(an) * L * .7); ctx.stroke(); }
    ctx.restore();
  }

  if (typeof tileDraw === 'function') tileDraw = (orig => function () {
    orig.apply(this, arguments);
    if (!here() || typeof ScriptureStory === 'undefined') return;
    const s = story(); if (!s) return;
    try {
      const cam = world.cam || { x: 0, y: 0 }, z = typeof VZ === 'function' ? VZ() : 1, t = performance.now() / 1000;
      if (s.phase !== lastPhase) { if (s.phase === 'transferring') { trail.length = 0; landAt = -9; } lastPhase = s.phase; }
      ctx.save(); if (z !== 1) ctx.scale(z, z); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
      if (s.phase === 'identified') beacon(ctx, ROT, t, 1);
      else if (s.phase === 'transferring') { beacon(ctx, ROT, t, Math.max(0, 1 - s.time / .8)); flight(ctx, s, t); if (s.time > 3.15 && landAt < 0) landAt = t; }
      else if (s.phase === 'displayed') beacon(ctx, { x: PED.x, base: PED.base, top: 520 }, t, .85);
      landing(ctx, t);
      ctx.restore();
    } catch (e) { console.warn('r186', e); }
  })(tileDraw);
})();
