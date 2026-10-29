// ================= 洛尘 · 光明本源（代码重写版）=================
// Codex 版只作参考：素材（金眸特写、神躯五个姿势、光柱/冲击/光阵序列帧、托日立绘）沿用 Codex 的，
// 动作、时间轴、位置全部用代码实时算——施法者、每一只敌人、每一个队友都按战场上的真实位置。
// 时间轴 14.2 秒（与配音 gm_01 对齐）：
//  0.0  黑暗，金眸点燃          1.2  洛尘托日
//  1.0  光絮漂游                 2.6  光絮汇成六星
//  3.2  逐边连星（六芒）         4.6  六芒倾斜成阵，金眸特写淡出
//  5.5  光幕垂落，神躯凝结       7.0  后引蓄力，敌人脚下亮起光印
//  8.9  推掌                     9.4  天光轰出，光柱落在每只敌人身上（伤害）
// 10.4  神躯散成光点             11.95 光点落到每个队友身上（复活 / 回血）
// 12.6  金眸收势
(function () {
  const W0 = 1280, H0 = 720, DUR = 14.2;
  const C = x => Math.max(0, Math.min(1, x)), E = (t, a, b) => { const q = C((t - a) / (b - a)); return q * q * (3 - 2 * q); }, L = (a, b, q) => a + (b - a) * q;
  const R = i => { const x = Math.sin(i * 127.1 + 49.3) * 43758.5453; return x - Math.floor(x); };
  const IM = {}; let meta = null, ready = false, loading = null;
  const load = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
  function preload() {
    if (loading) return loading;
    loading = (async () => {
      meta = await (await fetch('gm_assets/meta.json')).json();
      const keys = ['eyes', 'giant_arrival', 'giant_gather', 'giant_charge', 'giant_push', 'giant_release', 'atlas'];
      const ims = await Promise.all(keys.map(k => load('gm_assets/' + k + '.webp')));
      keys.forEach((k, i) => IM[k] = ims[i]);
      ready = true;
    })();
    return loading;
  }
  // 图集里取一格
  function cell(k) { return meta.atlas[k]; }
  function drawCell(g, k, x, y, w, h, ax = .5, ay = .5) { const e = cell(k); if (!e) return; g.drawImage(IM.atlas, e[0], e[1], e[2], e[3], x - w * ax, y - h * ay, w, h); }
  function seq(g, group, n, q, x, y, w, h, a, ax = .5, ay = .5) {   // 序列帧（黑底，用 lighter 叠加），q 0..1
    if (a <= 0 || q < 0 || q > 1) return; const f = Math.min(n - 1, Math.floor(q * n));
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = C(a); drawCell(g, 'seq_' + group + '_' + f, x, y, w, h, ax, ay); g.restore();
  }
  function glow(g, x, y, r, a, col = '255,228,160') {
    if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.35, `rgba(${col},${a * .4})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  }
  function star(g, x, y, s, a) {   // 四芒小星
    if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y);
    glow(g, 0, 0, s * 2.6, a * .55, '255,240,205');
    g.fillStyle = `rgba(255,250,235,${a})`; for (let k = 0; k < 2; k++) { g.rotate(Math.PI / 2 * k); g.beginPath(); g.moveTo(-s * 2.2, 0); g.quadraticCurveTo(0, -s * .25, s * 2.2, 0); g.quadraticCurveTo(0, s * .25, -s * 2.2, 0); g.fill(); }
    g.restore();
  }

  // ---------- 场景状态 ----------
  let S0 = null;   // { L, allies, enemies, god, hex, motes }
  function setup(Lc, allies, enemies) {
    const gw = 640, gh = gw * 1024 / 1536, gx = Math.min(520, Math.max(330, Lc.x - 600));
    const hex = { x: gx + 230, y: 150, r: 190 };   // 六芒星 / 光阵在神躯身后的天上
    const motes = Array.from({ length: 150 }, (_, i) => ({ x: R(i) * W0, y: 30 + R(i + 300) * 560, s: .8 + R(i + 77) * 2.2, ph: R(i + 9) * 6.28, sp: .2 + R(i + 51) * .8, tgt: i % 6, dl: R(i + 13) * .5 }));
    S0 = { L: Lc, allies, enemies, god: { x: gx, y: -36, w: gw, h: gh }, hex, motes, hit: false };
  }
  const hexPt = (i, tilt) => { const h = S0.hex, an = -Math.PI / 2 + i * Math.PI / 3 + tilt * .35; return { x: h.x + Math.cos(an) * h.r * (1 + .25 * tilt), y: h.y + Math.sin(an) * h.r * L(1, .3, tilt) }; };
  const footOf = u => ({ x: u.x + (u.ox || 0), y: u.y + (u.oy || 0) });
  const chestOf = u => ({ x: u.x + (u.ox || 0), y: u.y + (u.oy || 0) - u.h * .52 });
  // 神躯姿势：arrival → gather → charge → push → release，交叉淡化
  const POSES = [['giant_arrival', 5.5], ['giant_gather', 6.4], ['giant_charge', 7.1], ['giant_push', 8.95], ['giant_release', 10.25]];
  const PALM = { giant_arrival: [51, 709], giant_gather: [56, 406], giant_charge: [55, 343], giant_push: [16, 374], giant_release: [411, 393] };
  function godPoint(p, src) { const g = S0.god; return { x: g.x + src[0] / 1536 * g.w, y: g.y + src[1] / 1024 * g.h }; }
  function curPalm(t) {
    let a = POSES[0][0], b = a, q = 0;
    for (let i = 0; i < POSES.length; i++) if (t >= POSES[i][1]) { a = POSES[i][0]; b = POSES[Math.min(POSES.length - 1, i + 1)][0]; q = i + 1 < POSES.length ? E(t, POSES[i + 1][1] - .22, POSES[i + 1][1]) : 0; }
    const pa = godPoint(0, PALM[a]), pb = godPoint(0, PALM[b]); return { x: L(pa.x, pb.x, q), y: L(pa.y, pb.y, q) };
  }

  // ---------- 各层 ----------
  // 金眸特写（照原版的感觉）：整张脸压暗偏暖，只有左眼像一团金光烧起来
  let darkEyes = null;
  function eyesCanvas() {
    if (darkEyes) return darkEyes; const c = document.createElement('canvas'); c.width = W0; c.height = H0; const x = c.getContext('2d');
    x.filter = 'brightness(.40) saturate(.72) contrast(1.08)'; x.drawImage(IM.eyes, 0, 0, W0, H0); x.filter = 'none';
    x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgb(255,226,196)'; x.fillRect(0, 0, W0, H0);   // 暖调
    x.globalCompositeOperation = 'source-over'; const vg = x.createRadialGradient(W0 * .45, H0 * .52, H0 * .2, W0 * .45, H0 * .52, W0 * .72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(2,1,6,.75)'); x.fillStyle = vg; x.fillRect(0, 0, W0, H0);
    return darkEyes = c;
  }
  function eyes(g, t) {
    const a = E(t, 0, .35) * (1 - E(t, 4.7, 5.6)); if (a <= 0) return;
    const zoom = 1.04 + .03 * E(t, 0, 5);   // 极慢地推近
    g.save(); g.globalAlpha = a; g.translate(368, 382); g.scale(zoom, zoom); g.translate(-368, -382); g.drawImage(eyesCanvas(), 0, 0, W0, H0);
    g.fillStyle = `rgba(0,0,0,${.6 * (1 - E(t, .1, 1.0))})`; g.fillRect(0, 0, W0, H0); g.restore();
    const ig = E(t, .3, 1.15) * a, pulse = .9 + .1 * Math.sin(t * 4.1), ex = 372, ey = 398;
    if (ig <= 0) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    // 眼窝被金光照亮（横向椭圆大光晕）
    g.save(); g.translate(ex, ey); g.scale(1, .42); glow(g, 0, 0, 330, .5 * ig * pulse, '255,168,56'); glow(g, 0, 0, 170, .75 * ig, '255,190,84'); glow(g, 0, 0, 95, .6 * ig, '255,214,120'); g.restore();
    // 金色虹膜
    g.save(); g.translate(ex, ey); g.scale(1, .7); glow(g, 0, 0, 84, 1.1 * ig, '255,200,80'); g.restore();
    // 白金亮核
    glow(g, ex, ey, 40, ig * pulse, '255,246,214'); glow(g, ex, ey, 16, ig, '255,255,250');
    // 横向光芒
    const fl = g.createLinearGradient(ex - 260, 0, ex + 260, 0); fl.addColorStop(0, 'rgba(255,200,110,0)'); fl.addColorStop(.5, `rgba(255,236,190,${.28 * ig * pulse})`); fl.addColorStop(1, 'rgba(255,200,110,0)');
    g.fillStyle = fl; g.fillRect(ex - 260, ey - 2.5, 520, 5);
    g.restore();
  }
  function motesLayer(g, t) {
    const a = E(t, .9, 1.8) * (1 - E(t, 5.3, 6.4)); if (a <= 0) return;
    for (const m of S0.motes) {
      const drift = { x: m.x + Math.sin(t * m.sp + m.ph) * 40 + t * 9 * (m.sp - .5), y: m.y + Math.cos(t * m.sp * .8 + m.ph) * 26 - t * 6 };
      const gather = E(t, 2.6 + m.dl * .5, 3.4 + m.dl * .6) * (1 - E(t, 4.4, 5.0)), p = hexPt(m.tgt, 0);
      const x = L(drift.x, p.x + Math.cos(m.ph) * 8, gather), y = L(drift.y, p.y + Math.sin(m.ph) * 8, gather);
      const al = a * (.45 + .55 * Math.sin(t * 2.4 + m.ph) ** 2) * (1 - .4 * gather); glow(g, x, y, m.s * 7, al * .5, '255,246,226'); glow(g, x, y, m.s * 2.2, al, '255,255,248');
    }
  }
  function hexLayer(g, t) {
    const a = E(t, 2.9, 3.3) * (1 - E(t, 9.8, 10.8)); if (a <= 0) return;
    const tilt = E(t, 4.5, 5.5), rot = t > 5.5 ? (t - 5.5) * .08 : 0;
    const pts = [0, 1, 2, 3, 4, 5].map(i => hexPt(i, tilt));
    // 六个亮点
    for (let i = 0; i < 6; i++) star(g, pts[i].x, pts[i].y, 6 * (1 - .5 * tilt), a * (1 - .5 * tilt));
    // 逐边连星：两个三角形依次画出
    const order = [[0, 2], [2, 4], [4, 0], [1, 3], [3, 5], [5, 1]], draw = 3.2, per = .2;
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      const q = C((t - draw - k * per) / per); if (q <= 0) continue; const A0 = pts[order[k][0]], B0 = pts[order[k][1]];
      const bx = L(A0.x, B0.x, q), by = L(A0.y, B0.y, q), fade = a * (1 - .45 * E(t, 5.6, 6.6));
      for (const [w, al] of [[13, .14], [6, .36], [2.2, .95]]) { g.strokeStyle = `rgba(255,${238 + 10 * (w < 3)},${200 + 40 * (w < 3)},${al * fade})`; g.lineWidth = w; g.beginPath(); g.moveTo(A0.x, A0.y); g.lineTo(bx, by); g.stroke(); }
      if (q < 1) star(g, bx, by, 7, a);
    }
    // 倾斜成阵：外圈椭圆 + 慢转
    const ring = E(t, 4.8, 5.6);
    if (ring > 0) { const h = S0.hex, rx = h.r * 1.32, ry = h.r * .42; g.save(); g.translate(h.x, h.y);
      for (const [rr, w, al] of [[1, 9, .14], [1, 3, .55], [.86, 2, .35]]) { g.strokeStyle = `rgba(255,236,196,${al * a * ring})`; g.lineWidth = w; g.beginPath(); g.ellipse(0, 0, rx * rr, ry * rr, rot * .3, 0, 7); g.stroke(); }
      for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6 + rot; star(g, Math.cos(an) * rx * .93, Math.sin(an) * ry * .93, 2.2, a * ring * .8); }
      g.restore(); }
    g.restore();
  }
  function curtain(g, t) {   // 光幕垂落：天上落下的柔光束，罩住神躯
    const a = E(t, 5.4, 6.3) * (1 - E(t, 9.9, 11)); if (a <= 0) return; const G = S0.god;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) { const x = G.x + G.w * (.25 + i * .09) + Math.sin(t * .7 + i) * 12, w = 30 + R(i) * 50, drop = E(t, 5.4 + i * .06, 6.2 + i * .06);
      const gr = g.createLinearGradient(0, 0, 0, H0 * .82 * drop); gr.addColorStop(0, `rgba(255,236,190,${.16 * a})`); gr.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gr; g.fillRect(x - w / 2, 0, w, H0 * .82 * drop); }
    g.restore();
  }
  function god(g, t) {
    const inA = E(t, 5.5, 6.5), outA = 1 - E(t, 10.25, 10.95); const a = inA * outA; if (a <= 0) return;
    const G = S0.god, breath = 1 + .012 * Math.sin(t * 1.9), lift = Math.sin(t * 1.3) * 5 - 18 * E(t, 10.3, 10.95);
    const charge = E(t, 7.1, 8.9) * (1 - E(t, 8.95, 9.2)), recoil = E(t, 8.95, 9.1) * (1 - E(t, 9.3, 10));
    const dx = 14 * charge - 30 * recoil;
    // 神躯后的光晕（随蓄力变亮）
    glow(g, G.x + G.w * .52, G.y + G.h * .38, G.w * .5, a * (.16 + .2 * charge), '255,226,170');
    for (let i = 0; i < POSES.length; i++) {
      const [k, st] = POSES[i], nx = POSES[i + 1] ? POSES[i + 1][1] : 99, w = E(t, st - .22, st) * (1 - E(t, nx - .22, nx));
      if (w <= 0) continue;
      g.save(); g.globalAlpha = a * w; g.translate(G.x + G.w / 2 + dx, G.y + G.h / 2 + lift); g.scale(breath, breath);
      // 凝结：从光里显形（先 lighter 叠出光体，再实体化）
      const solid = E(t, 5.9, 6.8);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * w * (1 - solid * .82) * .85; g.drawImage(IM[k], -G.w / 2, -G.h / 2, G.w, G.h);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = a * w * solid * .82; g.drawImage(IM[k], -G.w / 2, -G.h / 2, G.w, G.h);
      g.restore();
    }
    // 后引蓄力：掌心聚光 + 四周光丝被吸进掌心
    const P = curPalm(t), c2 = E(t, 7.4, 8.9) * (1 - E(t, 9.25, 9.5));
    if (c2 > 0) {
      glow(g, P.x, P.y, 90 + 60 * c2, .55 * c2); glow(g, P.x, P.y, 26 + 20 * c2, .95 * c2, '255,250,232'); star(g, P.x, P.y, 9 + 6 * c2, c2);
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      for (let i = 0; i < 16; i++) { const an = i * 2.399, ph = ((t * 1.6 + R(i)) % 1), r0 = 260 * (1 - ph) + 20; const x0 = P.x + Math.cos(an) * r0, y0 = P.y + Math.sin(an) * r0 * .7, x1 = P.x + Math.cos(an) * (r0 - 46), y1 = P.y + Math.sin(an) * (r0 - 46) * .7;
        g.strokeStyle = `rgba(255,236,200,${.5 * c2 * Math.sin(ph * Math.PI)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
      g.restore();
    }
  }
  function sigils(g, t) {   // 敌人脚下的光印（地面层）
    const a = E(t, 7.3, 7.9) * (1 - E(t, 9.6, 10.2)); if (a <= 0) return;
    for (const [i, u] of S0.enemies.entries()) { const f = footOf(u), w = Math.max(150, u.h * 1.25), fr = Math.floor(t * 8 + i) % 4;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * (.75 + .25 * Math.sin(t * 6 + i)); drawCell(g, 'seq_4_' + fr, f.x, f.y, w, w * .5); g.restore(); }
  }
  function strike(g, t) {
    const P = curPalm(Math.min(t, 9.3));
    // 推掌光流：从掌心冲向左侧，扫过所有敌人
    const q = C((t - 9.05) / 1.25); if (q > 0 && q < 1) {
      const end = { x: -80, y: P.y + 150 }, len = Math.hypot(P.x - end.x, P.y - end.y), ang = Math.atan2(end.y - P.y, end.x - P.x);
      g.save(); g.translate(P.x, P.y); g.rotate(ang); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - E(q, .75, 1);
      const f = Math.min(11, Math.floor(q * 12)), e = cell('seq_0_' + f); g.drawImage(IM.atlas, e[0], e[1], e[2], e[3], -30, -110, len * E(q, 0, .25) + 30, 220);
      g.restore();
    }
    // 天光：光柱落在每只敌人身上，脚下炸开
    for (const [i, u] of S0.enemies.entries()) { const f = footOf(u), d = i * .05;
      seq(g, 1, 8, (t - 9.32 - d) / .95, f.x, f.y + 6, 150, 640, 1, .5, 1);
      seq(g, 2, 8, (t - 9.38 - d) / .9, f.x, f.y + 20, Math.max(260, u.h * 1.6), Math.max(260, u.h * 1.6) * 1.34, .95, .5, 1);
      if (t > 9.38 + d && t < 9.6 + d) glow(g, chestOf(u).x, chestOf(u).y, 170, .8 * (1 - (t - 9.38 - d) / .22), '255,246,226');
    }
  }
  function dissolve(g, t) {   // 神躯散光 → 光点飞向队友 → 落地生光（复活 / 回血）
    if (t < 10.3 || t > 13.6) return; const G = S0.god;
    S0.allies.forEach((u, j) => {
      const f = footOf(u), c = chestOf(u);
      for (let i = 0; i < 26; i++) { const k = j * 31 + i, st = 10.3 + R(k) * .7, q = C((t - st) / 1.55); if (q <= 0 || q >= 1) continue;
        const s = { x: G.x + G.w * (.3 + R(k + 5) * .5), y: G.y + G.h * (.15 + R(k + 7) * .6) }, m = { x: (s.x + c.x) / 2 + (R(k + 3) - .5) * 260, y: Math.min(s.y, c.y) - 120 - R(k + 4) * 120 };
        const e = q * q * (3 - 2 * q), x = (1 - e) * (1 - e) * s.x + 2 * (1 - e) * e * m.x + e * e * c.x, y = (1 - e) * (1 - e) * s.y + 2 * (1 - e) * e * m.y + e * e * c.y;
        star(g, x, y, 1.6 + R(k + 9) * 2, Math.sin(q * Math.PI) * .95); }
      seq(g, 3, 8, (t - 11.7 - j * .08) / 1.1, f.x, f.y + 14, 230, 310, .9, .5, 1);
      if (t > 11.9 && t < 12.9) glow(g, c.x, c.y, 120, .5 * Math.sin((t - 11.9) * Math.PI), '255,236,180');
    });
  }
  function caster(g, t) {   // 洛尘托日（盖住原本的立绘）
    const a = E(t, 1.0, 1.6), u = S0.L; if (a <= 0) return;
    const f = footOf(u), e = cell('tuotian'), s = u.h * 1.02 / 600, w = e[2] * s, h = e[3] * s;
    g.save(); g.globalAlpha = a; g.drawImage(IM.atlas, e[0], e[1], e[2], e[3], f.x - w / 2, f.y - h, w, h); g.restore();
    const sp = (1 - E(t, 13.2, 14.0)) * a, pulse = .96 + .04 * Math.sin(t * 3.7) + .12 * E(t, 8.6, 9.3) * (1 - E(t, 9.4, 10.2));
    const sx = f.x + (268 - 257.5) * s, sy = f.y - h - 26 * s, sr = 128 * s * pulse;
    glow(g, sx, sy, sr * 2.6, .3 * sp); g.save(); g.globalAlpha = sp; drawCell(g, 'sun', sx, sy, sr * 2, sr * 2); g.restore();
    // 掌心连向太阳的细光
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; for (const px of [146, 390]) { const x = f.x + (px - 257.5) * s, y = f.y - h + 26 * s; g.strokeStyle = `rgba(255,240,200,${.5 * sp})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(sx + (x - sx) * .3, sy + sr * .6); g.stroke(); } g.restore();
    // 收势：金眸一闪
    if (t > 12.6) glow(g, f.x - 4 * s, f.y - h + 112 * s, 40, .7 * Math.sin(C((t - 12.6) / 1.2) * Math.PI), '255,232,150');
  }

  // 前景（单位之上）/ 背景（单位之下）
  function back(t) { const g = ctx; sigils(g, t); }
  function front(t) { const g = ctx; eyes(g, t); motesLayer(g, t); hexLayer(g, t); curtain(g, t); god(g, t); strike(g, t); dissolve(g, t); caster(g, t); }
  window.GM_RT = { preload, get ready() { return ready; }, DUR, setup, back, front };
})();
