// ================= R195 · 月冥在女娲石像脚下（千丝织天殿）=================
// 作者 11-11：「月冥应该是在女娲石像那里」「一开始叶孤星看不见他，触发剧情之后很多白色小光点凝聚成他，以首帧姿势出来」「你可以自己加点特效进去」
// Codex R195：白光凝形 36 帧（12fps）→ 倚蛇尾待机 20 帧循环（8fps）→ 撑尾迈下石座 12 帧（8fps，末帧 = 新站姿）。
// 画布 384×320，摆位按 Codex 的截图坐标换成世界坐标：截图时 VZ = 0.8、cam = (320, 0)，画布左上 (552,334) → 世界 (1010, 417.5)，每帧像素 = (120/224)/0.8 世界单位。
// 自加特效：五色石先亮、月华光柱落到石座、四周光点飞来；坐着时脚下一圈月光、身边飘银丝光尘；赠礼时两缕银丝从指尖飞进二人眉心；离去时倒放凝形、光点四散升空。
(function () {
  if (typeof drawActorT !== 'function' || typeof IMG === 'undefined') return;
  const IM = {}; const ld = (k, f) => { const i = new Image(); i.onload = () => { IM[k] = i; }; i.src = 'r195/' + f + '.webp'; };
  ld('appear', 'ym_seat_appear'); ld('idle', 'ym_seat_idle'); ld('rise', 'ym_seat_rise');
  const A = { appear: { cols: 6, n: 36, fps: 12 }, idle: { cols: 5, n: 20, fps: 8 }, rise: { cols: 4, n: 12, fps: 8 } };
  const FW = 384, FH = 320, OX = 1010, OY = 417.5, K = (120 / 224) / 0.8;
  const W2 = (fx, fy) => [OX + fx * K, OY + fy * K];          // 帧内坐标 → 世界坐标
  const SEAT = W2(220.64, 213.55), FINGER = W2(170, 236), STONE = [1182, 269], GROUND = W2(180, 262);
  let act = null;                                              // 月冥这个地图人物
  const ST = { mode: null, t0: 0, rev: false, glow: 0, motes: [], threads: [] };
  const t = () => performance.now() / 1000;
  function frameOf() {
    const m = ST.mode, a = A[m === 'vanish' ? 'appear' : m]; if (!a) return null; const e = t() - ST.t0;
    if (m === 'idle') return ['idle', Math.floor(e * a.fps) % a.n];
    let f = Math.floor(e * a.fps); if (f >= a.n) f = a.n - 1;
    if (m === 'vanish') return ['appear', a.n - 1 - f];
    return [m, f];
  }
  // 光点：世界坐标，飞向 / 飞离目标
  function spawnMotes(n, inward) {
    for (let i = 0; i < n; i++) { const ang = Math.random() * 6.283, r = 160 + Math.random() * 260, cx = SEAT[0] - 40, cy = SEAT[1] - 40;
      ST.motes.push({ x0: inward ? cx + Math.cos(ang) * r : cx + (Math.random() - .5) * 120, y0: inward ? cy + Math.sin(ang) * r * .6 : cy + (Math.random() - .5) * 120,
        x1: inward ? cx + (Math.random() - .5) * 90 : cx + Math.cos(ang) * r, y1: inward ? cy + (Math.random() - .5) * 110 : cy - 120 - Math.random() * 260,
        t0: t() + Math.random() * (inward ? 1.6 : .6), d: 1 + Math.random() * 1.2, s: 2 + Math.random() * 3.5 }); }
  }
  function drawFxWorld() {
    const now = t();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // 五色石与月华光柱
    if (ST.glow > 0) { const g0 = ST.glow, p = .75 + .25 * Math.sin(now * 3);
      let g = ctx.createRadialGradient(STONE[0], STONE[1], 2, STONE[0], STONE[1], 70); g.addColorStop(0, `rgba(255,250,235,${.9 * g0 * p})`); g.addColorStop(.4, `rgba(200,220,255,${.35 * g0})`); g.addColorStop(1, 'rgba(160,190,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(STONE[0], STONE[1], 70, 0, 7); ctx.fill();
      const bx = SEAT[0] - 30, top = SEAT[1] - 420, lg = ctx.createLinearGradient(0, top, 0, SEAT[1] + 30); lg.addColorStop(0, 'rgba(220,230,255,0)'); lg.addColorStop(.6, `rgba(225,235,255,${.11 * g0})`); lg.addColorStop(1, `rgba(240,245,255,${.2 * g0})`);
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(bx - 40, top); ctx.lineTo(bx + 40, top); ctx.lineTo(bx + 120, SEAT[1] + 30); ctx.lineTo(bx - 120, SEAT[1] + 30); ctx.closePath(); ctx.fill(); }
    // 坐着时：脚下一圈淡淡的月光
    if (ST.mode === 'idle' || ST.mode === 'rise') { const g = ctx.createRadialGradient(GROUND[0], GROUND[1], 4, GROUND[0], GROUND[1], 120);
      g.addColorStop(0, `rgba(230,235,255,${.22 + .06 * Math.sin(now * 1.7)})`); g.addColorStop(1, 'rgba(200,210,255,0)'); ctx.save(); ctx.translate(GROUND[0], GROUND[1]); ctx.scale(1, .35); ctx.translate(-GROUND[0], -GROUND[1]);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(GROUND[0], GROUND[1], 120, 0, 7); ctx.fill(); ctx.restore();
      if (Math.random() < .12) ST.motes.push({ x0: SEAT[0] - 60 + Math.random() * 90, y0: SEAT[1] - Math.random() * 90, x1: 0, y1: 0, drift: 1, t0: now, d: 2.5 + Math.random() * 1.5, s: 1.5 + Math.random() * 2 }); }
    // 光点
    for (let i = ST.motes.length - 1; i >= 0; i--) { const m = ST.motes[i], k = (now - m.t0) / m.d; if (k < 0) continue; if (k >= 1) { ST.motes.splice(i, 1); continue; }
      let x, y; if (m.drift) { x = m.x0 + Math.sin(now * 1.3 + m.s * 9) * 10; y = m.y0 - k * 70; } else { const e = 1 - (1 - k) ** 2; x = m.x0 + (m.x1 - m.x0) * e; y = m.y0 + (m.y1 - m.y0) * e - Math.sin(Math.PI * k) * 30; }
      const a = Math.sin(Math.PI * k), r = m.s * 2.6, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.35, `rgba(215,228,255,${.7 * a})`); g.addColorStop(1, 'rgba(190,205,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    // 赠礼银丝：指尖 → 两人眉心
    for (let i = ST.threads.length - 1; i >= 0; i--) { const th = ST.threads[i], k = (now - th.t0) / th.d; if (k >= 1.4) { ST.threads.splice(i, 1); continue; } if (k < 0) continue;
      const u = th.u, tx = u.x, ty = u.y - (u.h || 108) * .9, sx = FINGER[0], sy = FINGER[1], cx = (sx + tx) / 2, cy = Math.min(sy, ty) - 90;
      const head = Math.min(1, k), tail = Math.max(0, k - .35), fade = k > 1 ? 1 - (k - 1) / .4 : 1;
      ctx.lineWidth = 2.2; ctx.strokeStyle = `rgba(235,240,255,${.85 * fade})`; ctx.shadowColor = 'rgba(200,215,255,.9)'; ctx.shadowBlur = 10; ctx.beginPath();
      for (let s = tail; s <= head + 1e-6; s += .02) { const q = 1 - s, x = q * q * sx + 2 * q * s * cx + s * s * tx, y = q * q * sy + 2 * q * s * cy + s * s * ty; s === tail ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke(); ctx.shadowBlur = 0;
      if (k >= 1 && !th.hit) { th.hit = 1; for (let j = 0; j < 10; j++) ST.motes.push({ x0: tx, y0: ty, x1: tx + (Math.random() - .5) * 90, y1: ty - 30 - Math.random() * 60, t0: now, d: .6 + Math.random() * .4, s: 1.6 + Math.random() * 1.6 }); } }
    ctx.restore();
  }
  drawActorT = (o => function (a, now) {
    if (a !== act) return o.apply(this, arguments);
    const fr = frameOf(); drawFxWorld(); if (!fr) return;
    const im = IM[fr[0]]; if (!im) return; const c = A[fr[0]].cols, f = fr[1];
    ctx.save(); ctx.globalAlpha *= a.alpha ?? 1; ctx.drawImage(im, (f % c) * FW, Math.floor(f / c) * FH, FW, FH, OX, OY, FW * K, FH * K); ctx.restore();
  })(drawActorT);
  const wait = s => new Promise(r => setTimeout(r, s * 1000));
  const snd = (n, v) => { try { playSnd(n, v); } catch (e) {} };
  // —— 剧情调用 ——
  const ready = () => IM.appear && IM.idle && IM.rise;
  async function appear() {
    for (let i = 0; i < 60 && !ready(); i++) await wait(.1);
    if (!act || world.actors.indexOf(act) < 0) { act = addActor('__ym195', SEAT[0] - 70, OY + 185 * K + 60, '白衣男子', '#e8e0ff'); act.h = 120; }
    act.alpha = 1; ST.mode = null; ST.glow = 0;
    // ① 五色石先亮、月华光柱慢慢落下
    for (let i = 0; i <= 20; i++) { ST.glow = i / 20; await wait(.04); }
    snd('sfx_star', .5); spawnMotes(70, true); await wait(.8);
    // ② 光点凝形（Codex 36 帧，3 秒）
    ST.mode = 'appear'; ST.t0 = t(); snd('sfx_buff', .5); await wait(36 / 12);
    ST.mode = 'idle'; ST.t0 = t(); S.flash = .35; S.flashColor = '#eef2ff';
    for (let i = 20; i >= 6; i--) { ST.glow = i / 20; await wait(.05); }   // 光柱收淡，留一点五色石的余光
  }
  async function rise() { if (!act) return; // 等到待机循环边界再起身
    if (ST.mode === 'idle') { const e = (t() - ST.t0) % (20 / 8); await wait(Math.min(2.5 - e, 2.5)); }
    ST.mode = 'rise'; ST.t0 = t(); await wait(12 / 8); }
  async function gift(us) { const now = t(); us.forEach((u, i) => { if (u) ST.threads.push({ u, t0: now + i * .18, d: .9 }); }); snd('sfx_sword_ring', .5); await wait(1.4); }
  async function vanish() { if (!act) return; spawnMotes(80, false); ST.mode = 'vanish'; ST.t0 = t(); for (let i = 6; i >= 0; i--) { ST.glow = i / 20; await wait(.05); } await wait(36 / 12 - .35);
    ST.mode = null; ST.glow = 0; await wait(1.2); world.actors = world.actors.filter(x => x !== act); act = null; ST.motes.length = 0; }
  // 剧情跳转 / 测试面板直接进殿也能看：地图离开时把人收掉
  setInterval(() => { try { if (act && world.mapName !== 'm_nw_temple') { world.actors = world.actors.filter(x => x !== act); act = null; ST.mode = null; ST.glow = 0; ST.motes.length = 0; } } catch (e) {} }, 500);
  window.R195YM = { appear, rise, gift, vanish, IM, ST, get actor() { return act; }, SEAT };
  try { if (typeof PRELOAD === 'function') PRELOAD('月冥', new Promise(r => { const t0 = performance.now(); const iv = setInterval(() => { if (ready() || performance.now() - t0 > 45000) { clearInterval(iv); r(); } }, 200); })); } catch (e) {}
})();
