// ================= R463 · 绛蘅现身（代码驱动，只进测试版）=================
// 作者 11-28 14:35～14:58：「拉广角，看到一个人在那里施法出来，不需要鬼畜」「做地图动画增加特效把它弄流畅，代码特效可以吗」
//   「任何情况下都不可以鬼畜」「没必要切脸部特写，就算要切也是拉近拉远，慢慢平缓拉」
// 做法：不靠逐帧大图，全用代码在地图上演——镜头缓缓拉成广角对准首领台 → 花瓣从四面八方旋进来 → 光柱慢慢升起、地上两道法环展开
//   → 她从花瓣里由脚到头凝出来（悬空）→ 张开双臂（狂笑）→ 缓缓落到台上站定 → 光柱散去、花瓣化成花雨落下 → 名号淡入。
//   全程没有闪白、没有震屏、没有硬切；所有变化都用缓动曲线，镜头只做平滑的拉远 / 推近。
//   人物用 Codex R455 第二轮的三张定格（悬空 / 狂笑 / 站立），按地图比例缩到比叶孤星高一些。
(function () {
  const DIR = 'r463/', K = 0.35;   // 人物缩放：Codex 画布 → 地图（身高约 170，叶孤星约 126）
  const POSE = { laugh: { f: [264, 486] } };
  for (const k in POSE) { const im = new Image(); im.src = DIR + 'jh_' + k + '.png?v=1'; POSE[k].im = im; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} }
  const ok = im => im && im.complete && im.naturalWidth;
  const C = { on: false, t: 0, T: null, z: 1, done: null, at: null };
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = v => { v = clamp01(v); return v * v * (3 - 2 * v); };                    // 平滑起止
  const ease2 = v => { v = clamp01(v); return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
  const seg = (t, a, b) => clamp01((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const DUR = 9.5;

  // 镜头缩放：现身时乘上 C.z（< 1 是拉远成广角，> 1 是推近）
  if (typeof VZ === 'function') VZ = (o => function () { return o.apply(this, arguments) * (C.on ? C.z : 1); })(VZ);

  // ---------- 花瓣 ----------
  const PET = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function makePetals() { PET.length = 0; seed = 7;
    for (let i = 0; i < 300; i++) PET.push({ a0: rnd() * Math.PI * 2, r0: 600 + rnd() * 900, h0: -rnd() * 260 + 60, rT: 55 + rnd() * 150, hT: -50 - rnd() * 300, sp: (.6 + rnd() * .8) * (rnd() < .5 ? 1 : 1),
      d: rnd() * 1.4, sz: 4 + rnd() * 4.5, rot: rnd() * 6.28, vr: (rnd() - .5) * 3, col: rnd(), fall: 40 + rnd() * 90, drift: (rnd() - .5) * 220, glow: rnd() < .15 }); }
  function petalPos(p, t, cx, cy) {
    // 1) 0.6～3.6 秒：从远处旋进来，收成一根花柱；2) 3.6～6.2：绕着她转；3) 6.2 以后：散开成花雨慢慢落下、淡掉
    const kin = ease2(seg(t, .6 + p.d * .5, 3.6 + p.d * .4));
    const ang = p.a0 + t * p.sp * 1.6 + kin * 2.2;
    const r = lerp(p.r0, p.rT, kin), h = lerp(p.h0, p.hT, kin);
    let x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r * .42 + h, a = clamp01(seg(t, p.d * .5, .9 + p.d * .5)) * .95;
    const out = ease(seg(t, 6.2 + p.d * .3, 9.2));
    if (out > 0) { x += p.drift * out + Math.cos(ang) * 160 * out; y += p.fall * out * 2.2 + 120 * out * out; a *= 1 - out * .85; }
    return { x, y, a, front: Math.sin(ang) > 0 };
  }
  function drawPetal(g, x, y, s, rot, col, a, glow) {
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
    const c1 = col < .5 ? '#d81a30' : col < .8 ? '#b50f22' : '#f04a5c';   // 彼岸花瓣：细长、深红，不是圆点
    g.fillStyle = c1; g.beginPath(); g.moveTo(0, -s * 1.6); g.quadraticCurveTo(s * .42, -s * .2, 0, s * 1.2); g.quadraticCurveTo(-s * .42, -s * .2, 0, -s * 1.6); g.fill();
    g.strokeStyle = 'rgba(255,170,170,.45)'; g.lineWidth = .8; g.beginPath(); g.moveTo(0, -s * 1.4); g.lineTo(0, s); g.stroke();
    if (glow) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .2; g.fillStyle = '#ff5064'; g.beginPath(); g.ellipse(0, 0, s * .6, s * 1.4, 0, 0, 7); g.fill(); }
    g.restore();
  }
  // ---------- 光柱、法环 ----------
  // 光柱贴图（只做一次）：横向中间亮两边透明、竖向顶端淡出；用 lighter 叠上去（不用 destination-out，那会把地图擦成黑块）
  let PT = null; function ptex() { if (PT) return PT; const c = document.createElement('canvas'); c.width = 128; c.height = 512; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 128, 0); gr.addColorStop(0, 'rgba(255,40,70,0)'); gr.addColorStop(.3, 'rgba(255,70,95,.35)'); gr.addColorStop(.5, 'rgba(255,200,200,1)'); gr.addColorStop(.7, 'rgba(255,70,95,.35)'); gr.addColorStop(1, 'rgba(255,40,70,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 512); const vg = g.createLinearGradient(0, 0, 0, 512); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(.35, 'rgba(0,0,0,1)'); vg.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-in'; g.fillStyle = vg; g.fillRect(0, 0, 128, 512); return PT = c; }
  function pillar(g, cx, gy, t) {
    const up = ease(seg(t, 1.6, 3.8)), out = ease(seg(t, 6.0, 7.8)); const k = up * (1 - out); if (k <= 0) return;
    const Hh = 1000 * up, w = 170 + 16 * Math.sin(t * 1.3), T = ptex();
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const [ww, aa] of [[w * 2.2, .22], [w, .38], [w * .4, .45]]) { g.globalAlpha = aa * k; g.drawImage(T, cx - ww / 2, gy - Hh, ww, Hh); }
    g.restore();
  }
  // 作者 15:42「特效挺好看，还可以再炫酷一点」：两道花光绕着光柱交缠上升、火星慢慢往上飘、她落定时一圈花瓣贴地荡开、台面一圈圈暖光扩散（都缓进缓出，不闪）
  function helix(g, cx, gy, t) {
    const up = ease(seg(t, 2.0, 4.2)), out = ease(seg(t, 6.0, 7.8)), k = up * (1 - out); if (k <= 0) return; const Hh = 980 * up;
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (const ph of [0, Math.PI]) for (let i = 0; i < 70; i++) { const y0 = i / 70, y1 = (i + 1) / 70; if (y1 * 1000 > Hh) break;
      const xa = cx + Math.cos(y0 * 9 + t * 2.4 + ph) * (90 - 40 * y0), xb = cx + Math.cos(y1 * 9 + t * 2.4 + ph) * (90 - 40 * y1), front = Math.sin(y0 * 9 + t * 2.4 + ph) > 0;
      const fade = Math.min(1, (Hh - y0 * 1000) / 220) * (1 - y0 * .6);
      g.strokeStyle = `rgba(255,${front ? 150 : 90},${front ? 160 : 110},${(front ? .55 : .25) * k * fade})`; g.lineWidth = front ? 5 : 3;
      g.beginPath(); g.moveTo(xa, gy - y0 * 1000); g.lineTo(xb, gy - y1 * 1000); g.stroke(); }
    g.restore();
  }
  const SPK = []; for (let i = 0; i < 90; i++) SPK.push({ x: (Math.random() - .5) * 520, d: Math.random() * 5, v: 40 + Math.random() * 70, s: 1.2 + Math.random() * 2.2, w: Math.random() * 6.28 });
  function sparks(g, cx, gy, t) { const k = ease(seg(t, 1.8, 3.2)) * (1 - ease(seg(t, 8.0, 10.2))); if (k <= 0) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const p of SPK) { const tt = (t - 1.8 + p.d) % 5, y = gy - tt * p.v * 1.6, x = cx + p.x * (1 - tt / 9) + Math.sin(tt * 1.4 + p.w) * 14, a = k * Math.sin(Math.PI * tt / 5) * .8; if (a <= 0) continue;
      g.globalAlpha = a; g.fillStyle = '#ffb090'; g.beginPath(); g.arc(x, y, p.s, 0, 7); g.fill(); }
    g.restore(); }
  function landing(g, cx, gy, t) { const k = seg(t, 7.0, 9.4); if (k <= 0 || k >= 1) return; const e = ease(k), r = 40 + 420 * e, a = (1 - e) * .9;
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, gy); g.scale(1, .36);
    const rg = g.createRadialGradient(0, 0, r * .7, 0, 0, r); rg.addColorStop(0, 'rgba(255,60,90,0)'); rg.addColorStop(.85, `rgba(255,90,110,${.35 * a})`); rg.addColorStop(1, 'rgba(255,60,90,0)'); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.restore();
    for (let i = 0; i < 48; i++) { const an = i / 48 * Math.PI * 2 + i * .37, rr = r * (.86 + (i % 5) * .03); drawPetal(g, cx + Math.cos(an) * rr, gy + Math.sin(an) * rr * .36, 4.5, an + t * 2, i % 3 / 3, a, i % 4 === 0); } }
  function rings(g, cx, gy, t) {
    const show = (a, b, R, col, spin) => { const k = ease(seg(t, a, b)), out = ease(seg(t, 6.4, 8.4)); if (k <= 0 || out >= 1) return; const r = R * (.25 + .75 * k);
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = k * (1 - out); g.translate(cx, gy); g.scale(1, .38);
      g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
      g.lineWidth = 1.5; g.globalAlpha *= .7; g.beginPath(); g.arc(0, 0, r * .86, 0, 7); g.stroke();
      g.rotate(t * spin); g.lineWidth = 5; g.setLineDash([18, 26]); g.beginPath(); g.arc(0, 0, r * .93, 0, 7); g.stroke(); g.setLineDash([]);
      const rg = g.createRadialGradient(0, 0, 0, 0, 0, r); rg.addColorStop(0, 'rgba(255,60,90,.22)'); rg.addColorStop(1, 'rgba(255,60,90,0)'); g.fillStyle = rg; g.globalAlpha = k * (1 - out) * .8; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
      g.restore(); };
    show(1.8, 3.6, 300, 'rgba(255,90,110,.9)', .25); show(2.4, 4.2, 200, 'rgba(255,190,170,.8)', -.4);
  }
  // ---------- 人物 ----------
  const OFF = document.createElement('canvas'), og = OFF.getContext('2d');
  function figure(g, P, gx, gy, lift, alpha, reveal) {
    const im = P.im; if (!ok(im) || alpha <= 0) return;
    const w = im.width * K, h = im.height * K, x = gx - P.f[0] * K, y = gy - lift - P.f[1] * K;
    if (reveal >= 1) { g.save(); g.globalAlpha = alpha; g.drawImage(im, x, y, w, h); g.restore(); return; }
    // 由脚到头凝出来：软边遮罩往上推
    const sc = 2; OFF.width = Math.ceil(w * sc); OFF.height = Math.ceil(h * sc); og.clearRect(0, 0, OFF.width, OFF.height); og.globalCompositeOperation = 'source-over'; og.drawImage(im, 0, 0, OFF.width, OFF.height);
    const edge = OFF.height * (1.25 - reveal * 1.5), soft = OFF.height * .25;
    const mg = og.createLinearGradient(0, edge - soft, 0, edge + soft); mg.addColorStop(0, 'rgba(0,0,0,0)'); mg.addColorStop(1, 'rgba(0,0,0,1)');
    og.globalCompositeOperation = 'destination-in'; og.fillStyle = mg; og.fillRect(0, 0, OFF.width, OFF.height); og.globalCompositeOperation = 'source-over';
    g.save(); g.globalAlpha = alpha; g.drawImage(OFF, x, y, w, h);
    // 凝形那条边上一圈暖光
    g.globalCompositeOperation = 'lighter'; const ey = y + (edge / sc); const eg = g.createLinearGradient(0, ey - 30, 0, ey + 30); eg.addColorStop(0, 'rgba(255,80,100,0)'); eg.addColorStop(.5, `rgba(255,120,130,${.35 * (1 - reveal)})`); eg.addColorStop(1, 'rgba(255,80,100,0)');
    g.fillStyle = eg; g.fillRect(x - 20, ey - 30, w + 40, 60); g.restore();
  }

  // ---------- 镜头 ----------
  updateMap = (orig => function (dt) { const r = orig.apply(this, arguments);
    try { if (!C.on || !world.cam || !C.at) return r; const t = C.T != null ? C.T : C.t;
      if (C.T == null) C.t += Math.min(dt, .05);
      const [bx, by] = C.at, p0 = C.p0;
      const k1 = ease2(seg(t, 0, 1.8)), k2 = ease(seg(t, 4.2, 8.6));
      C.z = lerp(1, .84, k1) * lerp(1, 1.5, k2);   // 先拉远成广角，后段慢慢推近
      const fx = lerp(p0[0], bx, k1), fy = lerp(p0[1], by - 150, k1) + lerp(0, 10, k2);
      const T = world.map.T, vw = W / VZ(), vh = H / VZ();
      world.cam.x = Math.max(T.x0 || 0, Math.min(T.mw - vw, fx - vw / 2)); world.cam.y = Math.max(0, Math.min(T.mh - vh, fy - vh / 2));
      if (C.T == null && t >= DUR && C.done) { const d = C.done; C.done = null; d(); }
    } catch (e) {} return r; })(updateMap);

  // 地图坐标系里画（叠在地图上，对话框之下）
  const layer = { draw() { if (!C.on || !C.at) return; const t = C.T != null ? C.T : C.t, zm = VZ(), cam = world.cam; const [bx, by] = C.at, gy = by - 80;
      ctx.save();
      // 微微压暗、偏一点红（缓进缓出）
      const dim = ease(seg(t, .2, 1.8)) * (1 - ease(seg(t, 7.6, 9.4)) * .6);
      ctx.fillStyle = `rgba(18,2,8,${.38 * dim})`; ctx.fillRect(0, 0, W, H);
      ctx.translate(-cam.x * zm, -cam.y * zm); ctx.scale(zm, zm);
      rings(ctx, bx, gy, t); landing(ctx, bx, gy, t);
      const pts = PET.map(p => [p, petalPos(p, t, bx, gy - 120)]);
      for (const [p, q] of pts) if (!q.front && q.a > .01) drawPetal(ctx, q.x, q.y, p.sz, p.rot + t * p.vr, p.col, q.a, p.glow);
      pillar(ctx, bx, gy, t); helix(ctx, bx, gy, t); sparks(ctx, bx, gy, t);
      // 人物（作者 15:27 嫌露腿的姿势丑 → 只用张臂狂笑这一张：裙摆收得住、不露腿、轮廓大）：3.0～4.6 由脚到头凝出、悬空 → 6.0～7.4 缓缓降到离台半尺，悬着轻轻起伏
      const bob = Math.sin(t * 1.8) * 6, liftK = 1 - ease2(seg(t, 6.0, 7.4)), lift = 22 + (48 + bob) * liftK + Math.sin(t * 1.2) * 3 * (1 - liftK);
      const rv = ease(seg(t, 3.0, 4.6)), aF = clamp01(seg(t, 3.0, 3.4));
      if (rv > 0) { ctx.save(); ctx.globalAlpha = .35 * rv * (1 - liftK * .5); ctx.fillStyle = '#1a0408'; ctx.beginPath(); ctx.ellipse(bx, gy, 52 - liftK * 12, 14 - liftK * 4, 0, 0, 7); ctx.fill(); ctx.restore(); }
      figure(ctx, POSE.laugh, bx, gy, lift, aF, rv);
      for (const [p, q] of pts) if (q.front && q.a > .01) drawPetal(ctx, q.x, q.y, p.sz * 1.1, p.rot + t * p.vr, p.col, q.a, p.glow);
      ctx.restore();
      // 名号：最后慢慢淡入（不闪）
      const tk = ease(seg(t, 7.4, 8.6)) * (1 - ease(seg(t, 9.8, 10.8))); if (tk > 0) {   /* R473：名号亮一会儿就淡掉，后面接对白 */ const B = (window.TOWER && TOWER.BOSS && TOWER.BOSS[1]) || { name: '绛蘅', title: '彼岸花精' };
        ctx.save(); ctx.globalAlpha = tk; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `30px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = 'rgba(255,220,220,.85)'; ctx.fillText('万妖塔 · 第一层', W / 2, 92);
        ctx.font = `76px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.shadowColor = '#ff4058'; ctx.shadowBlur = 22; ctx.fillStyle = '#fff4ec'; ctx.fillText(B.name, W / 2, 160 + 8 * (1 - tk)); ctx.shadowBlur = 0;
        ctx.font = `28px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.fillStyle = '#ff9aa6'; ctx.fillText(B.title, W / 2, 222); ctx.restore(); }
    } };

  async function play(at) {
    if (C.on) return; at = at || (() => { const d = window.R443_META && R443_META.b && R443_META.b.c && R443_META.b.c.objs.find(o => o.id === 'boss_dais'); return d ? [d.bx, d.by] : [2520, 829]; })();
    makePetals(); const p = world.player; C.p0 = [p.x, p.y - 60]; C.at = at; C.t = 0; C.z = 1; C.on = true;
    const lock0 = world.locked, hud0 = S.hud; world.locked = true; p.moving = false; world.path = null; S.hud = false;
    if (!S.overlay.includes(layer)) S.overlay.unshift(layer);
    await new Promise(res => { C.done = res; });
    return () => { const i = S.overlay.indexOf(layer); if (i >= 0) S.overlay.splice(i, 1); C.on = false; C.z = 1; world.locked = lock0; S.hud = hud0; };
  }
  // 录屏用：R463.seek(t) 定格在第 t 秒
  window.R463 = { play, C, DUR, seek(t) { C.T = t; }, ready: () => ok(POSE.laugh.im) };
})();
