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
  function star4(ctx, x, y, r, a, c) {
    ctx.fillStyle = `rgba(${c || '255,250,228'},${a})`; ctx.beginPath();
    for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * .22 : r; ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    ctx.closePath(); ctx.fill();
  }
  // 「就是这里」：立柱光 + 地面扩散光环 + 上飘星点。作者 11-10 定为全游戏任务 / 指引的统一光效：
  //   暗的地图用金色（叠加发光）；偏亮的地图叠加看不出来 → 换成衣柜那种蓝（正常叠色 + 外发光描边）
  const TONE = { gold: { c1: '255,236,170', c2: '255,205,110', ring: '255,216,120', sh: 'rgba(255,200,90,.9)', st: '255,250,228', add: true },
                 blue: { c1: '150,200,255', c2: '70,140,250', ring: '70,140,255', sh: 'rgba(60,130,255,.95)', st: '215,238,255', add: false } };
  function beacon(ctx, P, t, k, tone, noGround) {
    const C = TONE[tone] || TONE.gold, { x, base, top } = P, h = base - top + 140, mid = base - h / 2, pulse = .78 + .22 * Math.sin(t * 3.2), m = C.add ? 1 : 1.6;
    ctx.save(); ctx.globalCompositeOperation = C.add ? 'lighter' : 'source-over';
    for (const [w, a] of [[130, .38], [56, .55], [18, .7]]) {
      ctx.save(); ctx.translate(x, mid); ctx.scale(1, h / 2 / w);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w); g.addColorStop(0, `rgba(${C.c1},${a * pulse * k * m})`); g.addColorStop(.6, `rgba(${C.c2},${a * .35 * pulse * k * m})`); g.addColorStop(1, `rgba(${C.c2},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w, 0, TAU); ctx.fill(); ctx.restore();
    }
    if (!noGround) for (let i = 0; i < 3; i++) {
      const u = ((t * .55 + i / 3) % 1), rx = 50 + u * 160, a = (1 - u) * .85 * k;
      ctx.lineWidth = 3 * (1 - u) + 1.5; ctx.strokeStyle = `rgba(${C.ring},${a})`; ctx.shadowColor = C.sh; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.ellipse(x, base, rx, rx * .32, 0, 0, TAU); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    if (!noGround) glow(ctx, x, base, 170, .55 * pulse * k * m, C.c1, C.c2);
    else { ctx.shadowColor = C.sh; ctx.shadowBlur = 24; glow(ctx, x, base - 30, 80, .75 * pulse * k, C.c1, C.c2); ctx.shadowBlur = 0; }   // 宝箱这种没有地面光环的：物件本身一团光
    for (let i = 0; i < 22; i++) {
      const u = (t * (.18 + rnd(i) * .2) + rnd(i + 30)) % 1, px = x + (rnd(i + 60) - .5) * 120 + Math.sin(t * 1.5 + i) * 8, py = base - u * h, a = Math.sin(u * Math.PI) * k;
      glow(ctx, px, py, 7, a * .7, C.st, C.c2); if (i % 3 === 0) star4(ctx, px, py, 5 + rnd(i + 90) * 4, a, C.st);
    }
    ctx.restore();
  }
  // 这张地图算不算「偏亮」：取地面底图缩成 24×24 的平均亮度；夜里一律算暗
  const LUM = {};
  function bright() {
    try {
      const m = world.mapName; if (!m) return false;
      if ((S.flags && (S.flags.res_tod === 'night' || S.flags.lib_ch1 && /^tj_(forbidden|library|scripture)$/.test(m)))) return false;
      if (m in LUM) return LUM[m];
      const T = TMAPS[m], key = T && T.baked && T.baked.ground, im = key && IMG[key]; if (!im || !im.width) return false;
      const c = document.createElement('canvas'); c.width = c.height = 24; const g = c.getContext('2d'); g.drawImage(im, 0, 0, 24, 24);
      const d = g.getImageData(0, 0, 24, 24).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2];
      return (LUM[m] = s / (d.length / 4) / 255 > .5);
    } catch (e) { return false; }
  }
  // 作者 11-10：「就不能是蓝色金色白色的发光大的光点吗」→ 物件周围一圈会飘、会闪的大光点（金 / 蓝 / 白轮流）
  const ORB_C = [['255,214,110', '255,240,190'], ['90,160,255', '200,228,255'], ['255,255,255', '235,244,255']];
  function orbs(ctx, x, y, t, k) {
    k = k == null ? 1 : k;
    ctx.save();
    for (let i = 0; i < 9; i++) {
      const [c, cc] = ORB_C[i % 3], an = t * (.55 + rnd(i) * .3) + i * TAU / 9, rr = 46 + rnd(i + 5) * 26;
      const px = x + Math.cos(an) * rr, py = y - 34 + Math.sin(an) * rr * .45 - ((t * .35 + rnd(i + 9)) % 1) * 46;
      const tw = .65 + .35 * Math.sin(t * 4 + i * 1.7), R = (7 + rnd(i + 2) * 6) * tw;
      // 外光晕用普通叠色 + 彩色阴影，亮地图也看得见；芯子再用发光叠加提亮
      ctx.globalCompositeOperation = 'source-over'; ctx.shadowColor = `rgba(${c},1)`; ctx.shadowBlur = 22;
      glow(ctx, px, py, R * 3.2, .55 * tw * k, cc, c);
      ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'lighter';
      glow(ctx, px, py, R * 1.4, .95 * k, '255,255,255', cc);
      if (i % 3 === 2) star4(ctx, px, py, R * 2.2, .9 * tw * k, '255,255,255');
    }
    ctx.restore();
  }
  window.QUEST_FX = { beacon: (ctx, x, base, top, t, k, tone, noGround) => beacon(ctx, { x, base, top }, t, k == null ? 1 : k, tone || (bright() ? 'blue' : 'gold'), noGround), bright, orbs };
  function flight(ctx, s, t) {
    const pose = ScriptureStory.pose(s); if (!pose) return;
    const [x, y] = pose.point;
    trail.push([x, y]); if (trail.length > 26) trail.shift();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // 作者 11-10：光尾那一条「好丑 不要」→ 去掉，只留书本身的一团光和绕着转的星点
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
