// ================= R190 · 潭底垂钓（独立界面的钓鱼小游戏）=================
// 作者 11-10：「这个玩法怎么和做饭一样的……都是这种中间读条」「可以开始之后切换界面，进入一个独立钓鱼小游戏，这样可以做的精细些」「你随意发挥吧」
// 玩法（没有读条）：在钓台坐下 → 切到潭水侧剖面，看得见水下三层的鱼。
//   ① 牵钩：手指按在水里，鱼钩慢慢跟过去（按住才动，松手就停在那儿）。
//   ② 逗鱼：钩停稳了，附近的鱼会注意到饵（头顶冒「？」），游过来啄一两下——这时别动钩，一动就惊走。
//   ③ 提竿：鱼一口咬住、冒「！」，马上再点一下屏幕就挂上了；慢了饵被叼走。
//   ④ 拉鱼：按住屏幕收线，鱼被拉向水面。鱼会猛冲（身子发红、往深处窜），猛冲时还按着，线会由白变红、绷断；
//      松手让它跑，跑累了（翻肚冒星）就能一口气拉上来。
//   ⑤ 活饵：钩上是小鱼（白条 / 青虾 / 鲫鱼）时先别急着拉——深水的鳜鱼、星斑鱼、灵鲵会扑上来把它吞了，钓到的就换成大鱼。
//   破草鞋、枯枝在水里漂，钩碰上就挂住，白拉一趟。每个时辰八份饵。
// 素材：Codex R190F 到货前用程序画的水景 + 鱼谱卡上的鱼顶着（r175h_fish.js 的 session 开头认 window.R190_POND）。
(function () {
  if (typeof S === 'undefined' || typeof ctx === 'undefined') return;
  const now = () => performance.now() / 1000, rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const WY = 200, X0 = 70, X1 = 1185, Y0 = 222, Y1 = 676, TIP0 = [928, 105], SEAT = [1010, 170];
  // Codex R190F：三张侧剖面背景、水草前景、侧面钓者、游动 / 挣扎 / 猛扑的鱼、钩、气泡、竹牌
  const IMG2 = {}, KS = ['fg', 'angler_side', 'swim', 'thrash', 'strike', 'hook', 'fx', 'ui']; let asked = false;
  const ldi = k => { if (k in IMG2) return; IMG2[k] = null; const i = new Image(); i.onload = () => { IMG2[k] = i; }; i.onerror = () => { delete IMG2[k]; }; i.src = 'r190f/' + k + '.webp?v=1'; };
  const bgKey = () => { const s = ST.API ? ST.API.SHI() : '午'; return s === '戌' || s === '子' ? 'bg_night' : s === '酉' ? 'bg_dusk' : 'bg_day'; };
  const preload = () => { asked = true; KS.forEach(ldi); ldi(bgKey()); };
  const ready = () => KS.every(k => IMG2[k]) && IMG2[bgKey()];
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (name) { if (name === 'qingzhu_upper_pavilion') { try { KS.forEach(ldi); ldi('bg_day'); } catch (e) {} } return o.apply(this, arguments); })(tileSetMap);
  const SW = { crucian: 0, minnow: 1, grass_carp: 2, shrimp: 3, carp: 4, perch: 5, koi: 6, silver_scale: 7, starfish: 8, salamander: 9, turtle: 10, sandal: 11, twig: 12 };
  const MX = { crucian: 36, minnow: 46, grass_carp: 28, shrimp: 74, carp: 27, perch: 33, koi: 34, silver_scale: 34, starfish: 32, salamander: 30, turtle: 43, sandal: 40, twig: 30 };   // 鱼嘴在帧里的 x（头朝左）
  const STK = { perch: 0, starfish: 1, grass_carp: 2, salamander: 3 };
  const AN = { idle: [0, 4, 6, 1, [[46, 161], [46, 159], [47, 157], [47, 159]]], lift: [1, 6, 12, 0, [[45, 165], [54, 153], [58, 139], [83, 99], [78, 96], [71, 127]]], reel: [2, 4, 8, 1, [[75, 119], [103, 113], [117, 115], [67, 116]]],
    land: [3, 6, 10, 0, [[57, 152], [59, 135], [58, 105], [61, 66], [53, 65], [43, 78]]], miss: [4, 4, 9, 0, [[59, 139], [124, 94], [70, 119], [55, 157]]] };
  const UI = { bait: [12, 12, 193, 56], ruler: [702, 12, 48, 486], lift: [12, 86, 144, 148], liftd: [175, 86, 144, 148], warn: [12, 260, 229, 57], pred: [12, 330, 229, 57] };
  const kOf = o => o.len / (2 * (96 - MX[o.id]));
  // 各种鱼待的水层 [上, 下]、屏幕上的身长、是不是掠食的
  const LAY = { minnow: [232, 340, 76], shrimp: [240, 350, 54], crucian: [262, 420, 85], koi: [250, 390, 102], carp: [380, 524, 117], grass_carp: [372, 540, 132, 1], silver_scale: [420, 566, 105],
    perch: [520, 662, 112, 1], starfish: [556, 672, 117, 1], salamander: [636, 682, 132, 1], turtle: [650, 684, 127], sandal: [300, 640, 73], twig: [240, 600, 81] };
  const SMALL = { minnow: 1, shrimp: 1, crucian: 1 };
  const P = { x: 0, y: 0, down: false, taps: 0 }; let ON = false;
  const toL = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
  window.addEventListener('pointerdown', e => { if (!ON) return; const [x, y] = toL(e); P.x = x; P.y = y; P.down = true; P.taps++; }, true);
  window.addEventListener('pointermove', e => { if (!ON) return; const [x, y] = toL(e); P.x = x; P.y = y; }, true);
  for (const ev of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(ev, () => { P.down = false; }, true);
  const ST = { fxs: [], an: 'idle', a0: 0, fish: [], hook: { x: 700, y: 300, vx: 0, vy: 0, mv: 0 }, bait: true, ph: 'idle', eng: null, hk: null, strain: 0, msg: '', msgT: 0, bub: [], t0: 0, shake: 0, tip: TIP0.slice(), night: false, dusk: false, API: null, hint: '' };
  const setAn = a => { ST.an = a; ST.a0 = now(); };
  const flash = (m, s = 1.4) => { ST.msg = m; ST.msgT = now() + s; };
  const bubble = (x, y, n = 3) => { for (let i = 0; i < n; i++) ST.bub.push({ x: x + rnd(-8, 8), y: y + rnd(-4, 4), r: rnd(1.5, 4), v: rnd(26, 60), t0: now(), ph: rnd(0, 6) }); };

  // ---------- 鱼 ----------
  function pickKind() { const A = ST.API, s = A.SHI(), streak = A.G.streak || 0, f = A.F(), t = [];
    for (const x of A.FISH) { let w = (x.w[0] || 0) + (x.w[1] || 0) + (x.w[2] || 0); if (x.t && x.t[s] != null) w *= x.t[s]; if (x.id === 'turtle' && (f.r175_turtle || (f.r175_wins || 0) < 6)) w = 0;
      if ((x.r === '珍品' || x.r === '稀世') && streak >= 2) w *= 1 + .3 * Math.min(4, streak - 1); if (x.junk) w *= .5; if (w > 0 && LAY[x.id]) t.push([x, w]); }
    let r = Math.random() * t.reduce((a, b) => a + b[1], 0); for (const [x, w] of t) if ((r -= w) < 0) return x; return t[0][0]; }
  function spawn(edge) { const f = pickKind(), L = LAY[f.id], dir = Math.random() < .5 ? 1 : -1, len = L[2];
    const o = { f, id: f.id, len, dir, x: edge ? (dir > 0 ? X0 - 90 : X1 + 90) : rnd(X0 + 40, X1 - 40), y: rnd(L[0], L[1]), hy: 0, v: (f.junk ? 10 : 26 + f.sp * 20) * rnd(.8, 1.2), st: 'swim', t: 0, ph: rnd(0, 6), al: 1 };
    o.hy = o.y; if (f.id === 'salamander' && edge) { o.x = X0 - 60; o.dir = 1; } ST.fish.push(o); return o; }
  const mouth = o => o.st === 'hooked' ? [o.x, o.y] : [o.x + o.dir * o.len * .5, o.y + (o.id === 'salamander' ? 10 * kOf(o) : 0)];
  function stepFish(o, dt, t) { const h = ST.hook;
    if (o.st === 'swim') { o.x += o.dir * o.v * dt; o.y = o.hy + Math.sin(t * .9 + o.ph) * 7; if (!o.f.junk && Math.random() < dt * .06) o.dir *= -1;
      if ((o.dir > 0 && o.x > X1 + 110) || (o.dir < 0 && o.x < X0 - 110)) o.dead = true;
      if (o.f.junk) { if (ST.ph === 'idle' && Math.hypot(h.x - o.x, h.y - o.y) < o.len * .4) snag(o); return; }
      // 注意到饵：钩停稳、有饵、没别的鱼在啄
      if (ST.ph === 'idle' && ST.bait && !ST.eng && !ST.tgt && h.y > WY + 14 && h.mv < 30) { const d = Math.hypot(h.x - o.x, h.y - o.y), sight = 110 + o.len * .7 + (h.tw > t ? 60 : 0);
        if (d < sight && Math.abs(h.y - o.hy) < 120 && Math.random() < dt * (.5 + (h.tw > t ? .9 : 0))) { o.st = 'curious'; o.t = t; ST.eng = o; } } }
    else if (o.st === 'curious') {   // 朝钩游过去：按鱼身中心定朝向（原来按嘴的位置定，鱼一靠近钩就左右来回翻——「鬼畜」）
      if (Math.abs(h.x - o.x) > o.len * .7) o.dir = h.x > o.x ? 1 : -1;
      if (!ST.bait || ST.ph !== 'idle') return flee(o);
      const tx = h.x - o.dir * o.len * .5, ty = h.y - (o.id === 'salamander' ? 10 * kOf(o) : 0), dx = tx - o.x, dy = ty - o.y, l = Math.hypot(dx, dy);
      if (l > 6) { const v = Math.min(l / dt, 40 + o.f.sp * 28); o.x += dx / l * v * dt; o.y += dy / l * v * dt; } else { o.st = 'nibble'; o.t = t; o.n = Math.random() < .3 ? 0 : 1 + (Math.random() < o.f.p * .5 ? 1 : 0); o.nt = t + rnd(.5, 1.1); } }
    else if (o.st === 'nibble') { const [mx, my] = mouth(o); o.x += (h.x - mx) * dt * 6; o.y += (h.y - my) * dt * 6;
      if (t >= o.nt) { if (o.n > 0) { o.n--; o.nt = t + rnd(.55, 1.0); h.jig = t + .3; bubble(h.x, h.y, 2); try { playSnd('ui_move', .3); } catch (e) {} }
        else { o.st = 'bite'; o.t = t; o.win = o.f.win * (ST.easy > 0 ? 2.6 : 1.5); ST.tap0 = P.taps; h.jig = t + .4; bubble(h.x, h.y, 6); try { playSnd('sfx_hit', .5); } catch (e) {} } } }
    else if (o.st === 'bite') { const [mx, my] = mouth(o); o.x += (h.x - mx) * dt * 8; o.y += (h.y - my) * dt * 8; h.y += dt * 30;
      if (P.taps !== ST.tap0) return hookIt(o, t - o.t < o.win * .4);
      if (t - o.t > o.win) { ST.bait = false; ST.eng = null; o.st = 'flee'; o.t = t; o.dir *= -1; flash('慢了一步……饵被叼走了', 1.5); useBait(); } }
    else if (o.st === 'flee') { o.x += o.dir * 190 * dt; o.y += (o.hy - o.y) * dt * 2; o.al = Math.max(0, o.al - dt * .5); if (t - o.t > 2.4) o.dead = true; }
  }
  function flee(o, m) { if (ST.eng === o) ST.eng = null; o.st = 'flee'; o.t = now(); o.dir = ST.hook.x > o.x ? -1 : 1; if (m) flash(m, 1.3); }
  function snag(o) { setAn('lift'); ST.ph = 'fight'; ST.hk = o; o.st = 'hooked'; o.sta = 0; o.spent = true; o.mode = 'rest'; o.mt = 1e9; ST.strain = 0; ST.snag = true; flash(o.id === 'sandal' ? '钩住了……一只破草鞋' : '钩住了一截枯枝', 1.4); }
  function hookIt(o, deft) { { const m = mouth(o); o.st = 'hooked'; o.x = m[0]; o.y = m[1]; } ST.eng = null; ST.ph = 'fight'; ST.hk = o; setAn('lift'); ST.fxs.push({ r: 2, x: o.x, y: o.y, t0: now() }); o.sta = o.f.nd * (deft ? .7 : 1); o.sta0 = o.f.nd; o.mode = 'rest'; o.mt = now() + rnd(.9, 1.6); o.spent = false; ST.strain = 0; ST.snag = false; ST.bait = false; ST.fT = 0;
    flash(deft ? '妙手！' : '挂上了！按住收线', 1.2); try { playSnd('ui_confirm', .6); } catch (e) {} bubble(o.x, o.y, 8); }
  function useBait() { const f = ST.API.F(); f.r175_used = (f.r175_used || 0) + 1; }

  // ---------- 拉鱼 ----------
  function stepFight(dt, t) { const o = ST.hk, f = o.f, tip = ST.tip, hold = P.down && !inQuit(); ST.fT += dt;
    const [mx, my] = mouth(o), dx = tip[0] - mx, dy = tip[1] - my, l = Math.hypot(dx, dy) || 1;
    if (!o.spent && t >= o.mt) { if (o.mode === 'rest') { o.mode = 'warn'; o.mt = t + .4; } else if (o.mode === 'warn') { o.mode = 'rush'; o.mt = t + rnd(.7, 1.3) + f.p * .4; o.ra = rnd(2.2, 3.6); bubble(o.x, o.y, 6); try { playSnd('sfx_swing', .4); } catch (e) {} } else { o.mode = 'rest'; o.mt = t + rnd(1.0, 2.2) / (.6 + f.sp * .4); } }
    const rush = o.mode === 'rush';
    if (rush) { const v = 80 + f.sp * 55 + f.p * 40; o.x += Math.cos(o.ra) * v * dt; o.y += Math.sin(o.ra) * v * dt * .8 + 20 * dt; o.dir = Math.cos(o.ra) > 0 ? 1 : -1; if (Math.random() < dt * 9) bubble(o.x - o.dir * o.len * .4, o.y, 1); }
    else if (o.mode === 'warn') { o.x += Math.sin(t * 70) * 1.6; }
    else if (!o.spent) { o.x += Math.sin(t * 2 + o.ph) * 14 * dt; o.y += (hold ? 0 : 12 * dt); }
    if (hold) { const pull = o.spent ? 230 : rush ? 30 : 120 / (.55 + f.p * .6); o.x += dx / l * pull * dt; o.y += dy / l * pull * dt; if (!rush) o.dir = dx > 0 ? 1 : -1; }
    else if (o.spent && !ST.snag) o.y -= 14 * dt;
    o.x = clamp(o.x, X0 - 20, X1 + 10); o.y = clamp(o.y, WY + 6, Y1);
    // 线的松紧：猛冲时还拉着就往上涨；松手或它歇着就回落
    if (!o.spent) { ST.strain = clamp(ST.strain + (hold && rush ? (.62 + f.p * .38) * (ST.easy > 0 ? .5 : 1) : hold && o.mode === 'warn' ? .15 : hold ? -.3 : -1.1) * dt, 0, 1);
      o.sta -= (hold && !rush ? dt : !hold && rush ? dt * .55 : 0); if (!hold && o.mode === 'rest') o.sta = Math.min(o.sta0, o.sta + dt * .25);
      if (o.sta <= 0) { o.spent = true; o.mode = 'rest'; flash('它没劲了，快拉！', 1.2); try { playSnd('ui_confirm', .4); } catch (e) {} } }
    else ST.strain = Math.max(0, ST.strain - dt);
    ST.shake = ST.strain > .72 ? (ST.strain - .72) * 9 : 0;
    ST.hook.x = mouth(o)[0]; ST.hook.y = mouth(o)[1];
    if (ST.strain >= 1) { lose('线断了！'); try { playSnd('sfx_hurt'); } catch (e) {} return; }
    // 活饵：小鱼还在水下，深处的掠食鱼会扑上来吞掉它
    if (SMALL[o.id] && !ST.snag) for (const q of ST.fish) { if (q === o || q.st !== 'swim' || !LAY[q.id][3]) continue; const d = Math.hypot(q.x - o.x, q.y - o.y);
      if (d < 150 && Math.abs(o.y - q.hy) < 110 && Math.random() < dt * .55) { q.st = 'lunge'; q.t = t; q.tg = o; break; } }
    if (o.y <= WY + 12) { ST.ph = 'land'; ST.landT = t; }
  }
  function stepLunge(q, dt, t) { const o = q.tg; if (!o || ST.hk !== o || o.st !== 'hooked') { q.st = 'swim'; return; } const [mx, my] = mouth(q), dx = o.x - mx, dy = o.y - my, l = Math.hypot(dx, dy); q.dir = dx > 0 ? 1 : -1;
    if (l > 14) { q.x += dx / l * 330 * dt; q.y += dy / l * 330 * dt; return; }
    o.dead = true; bubble(o.x, o.y, 12); { const m = mouth(q); q.st = 'hooked'; q.x = m[0]; q.y = m[1]; } q.sw = t; ST.predT = t; q.sta = q.f.nd; q.sta0 = q.f.nd; q.mode = 'rush'; q.mt = t + 1.2; q.ra = rnd(2.4, 3.4); q.spent = false; ST.hk = q; ST.strain = Math.min(ST.strain, .3);  try { playSnd('sfx_hit', .7); } catch (e) {} }
  function lose(m) { setAn('miss'); const o = ST.hk; if (o) { o.st = 'flee'; o.t = now(); o.dir = o.x > 520 ? -1 : 1; } ST.hk = null; ST.ph = 'idle'; ST.strain = 0; ST.shake = 0; ST.API.G.streak = 0; flash(m, 1.5); useBait(); resetHook(); }
  function resetHook() { ST.tgt = null; ST.hook.x = TIP0[0] - 40; ST.hook.y = WY + 46; ST.bait = ST.API.left() > 0; ST.eng = null; }
  const QUIT = { x: 22, y: H - 66, w: 150, h: 48 }, LIFT = [1135, 622], onLift = () => Math.hypot(P.x - LIFT[0], P.y - LIFT[1]) < 84, inQuit = () => P.x >= QUIT.x && P.x <= QUIT.x + QUIT.w && P.y >= QUIT.y && P.y <= QUIT.y + QUIT.h;

  // ---------- 画 ----------
  const spr = (im, sx, sy, sw, sh, x, y, ax, ay, k, flip, rot, al) => { ctx.save(); if (al != null) ctx.globalAlpha = al; ctx.translate(x, y); if (rot) ctx.rotate(rot); if (flip) ctx.scale(-1, 1); ctx.drawImage(im, sx, sy, sw, sh, -ax * k, -ay * k, sw * k, sh * k); ctx.restore(); };
  function drawFish(o, t) { const k = kOf(o), hooked = o.st === 'hooked', junk = o.f.junk, row = SW[o.id];
    if (hooked && !junk && !(o.sw && t - o.sw < .25)) {   // 挣扎：嘴钉在线头上，身子朝竿尖的反方向甩
      const tip = ST.tip, a = Math.atan2(tip[1] - o.y, tip[0] - o.x), right = tip[0] >= o.x, ax = o.id === 'shrimp' ? 51 : 33, ay = o.id === 'turtle' ? 30 : 37;
      const f = o.spent ? Math.floor(t * 3) % 4 : Math.floor(t * (o.mode === 'rush' ? 16 : 10)) % 4, rot = (right ? a + Math.PI / 4 : a + Math.PI * .75) + (o.mode === 'warn' ? Math.sin(t * 60) * .12 : 0);
      if (o.mode === 'rush' && IMG2.fx) spr(IMG2.fx, (Math.floor(t * 12) % 4) * 96, 3 * 96, 96, 96, o.x - Math.cos(o.ra) * o.len * .9, o.y - Math.sin(o.ra) * o.len * .7, 11, 48, .9, false, o.ra + Math.PI, .9);
      ctx.save(); if (o.mode === 'rush' || o.mode === 'warn') { ctx.shadowColor = 'rgba(255,70,30,.95)'; ctx.shadowBlur = 20; } spr(IMG2.thrash, f * 192, row * 128, 192, 128, o.x, o.y, ax, ay, k, right, rot, o.al); ctx.restore();
      if (o.spent && IMG2.fx) spr(IMG2.fx, (Math.floor(t * 8) % 4) * 96, 4 * 96, 96, 96, o.x - (right ? 1 : -1) * o.len * .3, o.y + o.len * .1, 48, 68, .8);
      return; }
    if ((o.st === 'lunge' || (o.sw && t - o.sw < .25)) && STK[o.id] != null) { const f = o.st === 'lunge' ? Math.floor(t * 12) % 2 : 2 + Math.min(1, Math.floor((t - o.sw) * 8)), c = o.st === 'lunge' ? o : { x: o.x - o.dir * o.len * .5, y: o.y };
      spr(IMG2.strike, f * 192, STK[o.id] * 128, 192, 128, c.x, c.y, 96, 64, k, o.dir > 0); return; }
    const n = junk ? 4 : 6, f = Math.floor(t * (junk ? 5 : 8 + (o.st === 'flee' ? 8 : 0)) + o.ph * 3) % n;
    spr(IMG2.swim, f * 192, row * 128, 192, 128, o.x, o.y, 96, 64, k, o.dir > 0, hooked ? Math.sin(t * 3) * .3 : 0, o.al);
    if ((o.st === 'curious' || o.st === 'nibble') && IMG2.fx) spr(IMG2.fx, (Math.floor(t * 7) % 4) * 96, 96, 96, 96, o.x + o.dir * o.len * .2, o.y - o.len * .22, 48, 82, .8);
  }
  function anFrame(t) { const A = AN[ST.an], n = Math.floor((t - ST.a0) * A[2]); if (!A[3] && n >= A[1]) { setAn(ST.ph === 'fight' ? 'reel' : 'idle'); return anFrame(t); } return [A[0], A[3] ? n % A[1] : n, A[4]]; }
  function drawAngler(t) { let [row, f, tips] = anFrame(t); const fight = ST.ph === 'fight';
    if (ST.an === 'reel' && !(P.down && fight)) f = 0;   // 没按着就不摇
    spr(IMG2.angler_side, f * 256, row * 256, 256, 256, SEAT[0], SEAT[1], 128, 226, 1);
    const tp = tips[f] || tips[0]; ST.tip[0] = SEAT[0] - 128 + tp[0]; ST.tip[1] = SEAT[1] - 226 + tp[1];
    const h = ST.hook, tip = ST.tip, s = ST.strain, col = fight ? `rgb(255,${Math.round(250 - s * 200)},${Math.round(240 - s * 215)})` : 'rgba(250,250,240,.9)';
    ctx.strokeStyle = col; ctx.lineWidth = fight ? 1.4 + s * 1.8 : 1.3; ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); const sag = fight ? (P.down ? 0 : 30) : 22; ctx.quadraticCurveTo((tip[0] + h.x) / 2 + sag * .3, (tip[1] + h.y) / 2 + sag, h.x, h.y); ctx.stroke();
  }
  function drawHook(t) { const h = ST.hook; if (ST.ph === 'fight' || ST.ph === 'land' || ST.ph === 'card') return; const j = h.jig > t ? Math.sin(t * 50) * 3 : 0;
    spr(IMG2.hook, (Math.floor(t * 4) % 2) * 64, (ST.bait ? 1 : 0) * 64, 64, 64, h.x, h.y + j, 32, 8, .9);
    if (ST.ph === 'idle' && P.down && P.y > WY && !ST.eng) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(clamp(P.x, X0, X1), clamp(P.y, WY + 16, Y1 - 6), 16, 0, 7); ctx.stroke(); ctx.restore(); } }
  const uis = (r, x, y, k = 1) => ctx.drawImage(IMG2.ui, r[0], r[1], r[2], r[3], x, y, r[2] * k, r[3] * k);
  function drawAll() { const t = now(), A = ST.API, bg = IMG2[bgKey()]; if (!bg) return; ctx.save(); if (ST.shake > 0) ctx.translate(rnd(-ST.shake, ST.shake), rnd(-ST.shake, ST.shake));
    ctx.drawImage(bg, 0, 0, W, H);
    drawAngler(t);
    for (const o of ST.fish) if (o.st !== 'hooked') drawFish(o, t);
    if (ST.hk) drawFish(ST.hk, t); drawHook(t);
    for (let i = ST.fxs.length - 1; i >= 0; i--) { const q = ST.fxs[i], f = Math.floor((t - q.t0) * 12); if (f >= 6) { ST.fxs.splice(i, 1); continue; } spr(IMG2.fx, f * 96, q.r * 96, 96, 96, q.x, q.y, 48, 77, 1); }
    for (let i = ST.bub.length - 1; i >= 0; i--) { const b = ST.bub[i], y = b.y - (t - b.t0) * b.v; if (y < WY + 2) { ST.bub.splice(i, 1); continue; } ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x + Math.sin(t * 3 + b.ph) * 3, y, b.r, 0, 7); ctx.stroke(); }
    ctx.drawImage(IMG2.fg, (Math.floor(t * 5) % 4) * 1280, 0, 1280, 720, 0, 0, W, H);
    ctx.restore();
    // 竹牌：饵数、水深、提竿、不钓了
    const e = ST.eng, hk = ST.hk, bite = e && e.st === 'bite';
    uis(UI.bait, 22, 18, 1.15); spr(IMG2.hook, 0, 64, 64, 64, 22 + 36 * 1.15, 18 + 10 * 1.15, 32, 8, .62); ctx.font = `600 24px ${FONT}`; ctx.textAlign = 'center'; textOutline('饵 × ' + Math.max(0, A.left()), 22 + (65 + 52) * 1.15, 18 + 37 * 1.15, '#fff3c8', '#1c2a0c', 4);
    if ((A.G.streak || 0) >= 2) { ctx.font = `26px ${BRUSH}`; ctx.textAlign = 'left'; textOutline('连竿 ×' + A.G.streak, 30, 118, '#ffd27a', '#0a1c30', 5); }
    uis(UI.ruler, 1220, 200);
    { const k = bite ? 1 + Math.abs(Math.sin(t * 10)) * .1 : .92, r = P.down && Math.hypot(P.x - LIFT[0], P.y - LIFT[1]) < 80 ? UI.liftd : UI.lift; ctx.save(); ctx.globalAlpha = bite || ST.ph === 'fight' ? 1 : .7; uis(r, LIFT[0] - 72 * k, LIFT[1] - 74 * k, k); ctx.restore(); }
    if (ST.ph !== 'card' && ST.ph !== 'land') { if (!(A.ui && A.ui('button_paper', QUIT.x, QUIT.y))) { ctx.fillStyle = 'rgba(240,225,190,.9)'; ctx.fillRect(QUIT.x, QUIT.y, QUIT.w, QUIT.h); } ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center'; textOutline('不钓了', QUIT.x + 75, QUIT.y + 32, '#fff3d6', '#3a1a06', 4); }
    if (ST.ph === 'fight' && ST.strain > .6 && !(hk && hk.spent)) uis(UI.warn, W / 2 - 115 * 1.3, 232, 1.3);
    else if (ST.predT && t - ST.predT < 1.6) uis(UI.pred, W / 2 - 115 * 1.3, 232, 1.3);
    else if (ST.msg && t < ST.msgT) { ctx.font = `42px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(ST.msg, W / 2, 268, '#ffe39a', '#0a1420', 6); }
    // 鱼头顶的大牌子：猛冲 = 松手；歇气 = 按住拉；没劲 = 快拉
    if (ST.ph === 'fight' && hk && !ST.snag) { const im2 = A.IM2 && A.IM2.ui2, rushing = !hk.spent && (hk.mode === 'rush' || hk.mode === 'warn'), y0 = Math.max(WY + 30, hk.y - 70);
      if (rushing && im2) { const k = .8 + Math.abs(Math.sin(t * 12)) * .08; ctx.drawImage(im2, 0, 0, 192, 96, hk.x - 96 * k, y0 - 48 * k, 192 * k, 96 * k); }
      else { ctx.font = `30px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(hk.spent ? '快拉！' : rushing ? '松手！' : '按住拉', hk.x, y0 + 8, hk.spent ? '#c8f0a0' : rushing ? '#ff8a6a' : '#fff0b8', '#0a1c30', 6); } }
    // 头几条鱼：圈出一条离钩近的鱼，告诉玩家往哪儿点
    if (ST.ph === 'idle' && ST.bait && !e && !ST.tgt && (ST.easy > 0 || !(A.F().r175_wins > 0))) { let best = null, bd = 1e9; for (const o of ST.fish) { if (o.st !== 'swim' || o.f.junk || o.x < X0 + 60 || o.x > X1 - 80) continue; const d = Math.hypot(o.x - ST.hook.x, o.y - ST.hook.y); if (d < bd) { bd = d; best = o; } }
      if (best) { const cx = best.x + best.dir * (best.len * .5 + 36), cy = best.y, r = 20 + Math.sin(t * 5) * 4; ctx.save(); ctx.strokeStyle = 'rgba(255,240,170,.95)'; ctx.lineWidth = 3; ctx.setLineDash([7, 6]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.restore(); ctx.font = `600 18px ${FONT}`; ctx.textAlign = 'center'; textOutline('点这儿', cx, cy - 30, '#fff3b0', '#0a1c30', 4); } }
    // 四步条：现在在哪一步
    { const step = ST.ph === 'fight' || ST.ph === 'land' ? 3 : bite ? 2 : e ? 1 : 0, L = ['① 点水里放钩', '② 等鱼来咬', '③ 冒「！」点提竿', '④ 按住收线'], w = 168, x0 = W / 2 - (w * 4 + 30) / 2 + 20; ctx.font = `600 17px ${FONT}`; ctx.textAlign = 'center';
      for (let i = 0; i < 4; i++) { const x = x0 + i * (w + 10), on = i === step; ctx.fillStyle = on ? 'rgba(246,214,130,.96)' : 'rgba(12,22,34,.55)'; ctx.beginPath(); ctx.moveTo(x + 14, 14); ctx.arcTo(x + w, 14, x + w, 46, 14); ctx.arcTo(x + w, 46, x, 46, 14); ctx.arcTo(x, 46, x, 14, 14); ctx.arcTo(x, 14, x + w, 14, 14); ctx.fill(); ctx.fillStyle = on ? '#3a2408' : 'rgba(240,232,210,.8)'; ctx.fillText(L[i], x + w / 2, 36); } }
    // 提示
    ctx.textAlign = 'center'; const big = (a, col) => { ctx.font = `32px ${BRUSH}`; textOutline(a, W / 2 - 40, H - 58, col || '#ffe9b0', '#0a1c30', 6); }, sub = b => { ctx.font = `600 17px ${FONT}`; textOutline(b, W / 2 - 40, H - 26, '#f2ead2', '#0a1c30', 4); };
    if (ST.ph === 'idle' && !ST.bait) { big('没饵了'); }
    else if (ST.ph === 'idle' && bite) { big('咬住了！快点屏幕提竿！', '#ff9a7a'); }
    else if (ST.ph === 'idle' && e) { big('有鱼过来了，等它咬', '#ffd9a0'); sub('头顶冒「？」是在试探，啄一两下才真咬。先别点，等冒出「！」'); }
    else if (ST.ph === 'idle' && ST.tgt) { big('钩在游过去……'); }
    else if (ST.ph === 'idle') { big('点水里一处，钩会游过去'); sub('把钩放在鱼的嘴前面，停下来等它；别碰到草鞋和枯枝'); }
    else if (ST.ph === 'fight' && ST.snag) { big('按住，把它拉上来'); }
    else if (ST.ph === 'fight' && hk && hk.spent) { big('它没劲了——按住一口气拉上来！', '#c8f0a0'); }
    else if (ST.ph === 'fight' && hk && (hk.mode === 'rush' || hk.mode === 'warn')) { big('鱼在猛冲——松手！', '#ff8a6a'); sub('这时候还按着，线会变红、绷断。它冲完会歇口气，再按住拉'); }
    else if (ST.ph === 'fight') { big('按住屏幕收线，把鱼拉上来'); sub(hk && SMALL[hk.id] ? '钩上是小鱼：先不拉、让它留在深水，大鱼可能扑上来吞了它' : '鱼身发红是要猛冲了，那时候松手'); }
  }
  const OV = { draw() { if (ON) try { drawAll(); } catch (e) {} } };

  // ---------- 一局 ----------
  window.R190_POND = async function (API) {
    const f = API.F(), G = API.G; ST.API = API;
    if (f.r190_tut !== 2) { f.r190_tut = 2; f.r190_easy = 3;
      await narrate('（钓鱼就四步，屏幕上方有四步条，亮着的就是现在该做的。）');
      await narrate('（① 点水里一处，钩自己游过去——放在鱼的嘴前面。② 等：鱼凑过来冒「？」是试探，先别点。）');
      await narrate('（③ 鱼咬住冒「！」，马上点一下屏幕（或右下角「提竿」）。④ 按住屏幕收线；鱼头顶出「松手！」就松开，出「按住拉」再按住。）');
      await narrate('（头三条鱼好钓一些，线不容易断。水越深鱼越大。不钓了点左下角。）'); }
    preload(); if (!ready()) { toast('钓具还在拿……稍等一下再点', 1500); return; }
    const s = API.SHI(); ST.night = s === '戌' || s === '子'; ST.dusk = s === '酉'; ST.easy = f.r190_easy || 0; ST.tgt = null;
    ST.fish.length = 0; ST.bub.length = 0; ST.ph = 'idle'; ST.hk = null; ST.eng = null; ST.strain = 0; ST.shake = 0; ST.msg = ''; ST.tip = TIP0.slice(); P.down = false; ST.fxs.length = 0; ST.predT = 0; setAn('idle');
    for (let i = 0; i < 9; i++) spawn(false);
    const hud0 = S.hud; S.hud = false; world.locked = true; G.on = true; G.phase = 'pond'; G.caught = []; G.streak = 0; G.cat = null; G.card = null; G.fv = false; G.sh = null;
    if (S.overlay.indexOf(OV) < 0) S.overlay.unshift(OV); ON = true; resetHook(); let last = now(), spT = 0, tapSeen = P.taps;
    try {
      while (true) { await nextFrame(); const t = now(), dt = Math.min(.05, t - last); last = t; const h = ST.hook;
        if ((typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice)) { tapSeen = P.taps; continue; }
        if (P.taps !== tapSeen) { tapSeen = P.taps; if (inQuit() && ST.ph !== 'land') break; }
        if (ST.ph === 'idle') { if (API.left() <= 0 && !ST.bait) { await sleep(900); break; }
          // 牵钩：按住水里才动
          // 作者 11-10：「点钩老是鬼畜」——原来要一直按着钩才走，点一下只挪一小步、一顿一顿的。改成：点水里哪儿，钩就自己平稳地游到哪儿（按着拖也行）；有鱼凑过来以后钩不再动
          const px = h.x, py = h.y; if (ST.eng) ST.tgt = null; else if (P.down && P.y > WY - 20 && !inQuit() && !onLift()) ST.tgt = [clamp(P.x, X0, X1), clamp(P.y, WY + 16, Y1 - 6)];
          if (ST.tgt) { const dx = ST.tgt[0] - h.x, dy = ST.tgt[1] - h.y, l = Math.hypot(dx, dy), v = Math.min(l / dt, l < 60 ? 60 + l * 2.6 : 220); if (l > 1.5) { h.x += dx / l * v * dt; h.y += dy / l * v * dt; } else ST.tgt = null; }
          const sp = Math.hypot(h.x - px, h.y - py) / dt; h.mv = (h.mv || 0) * .8 + sp * .2; if (sp > 20 && sp < 90) h.tw = t + 1.2;   // 轻轻抖一下更招鱼
        }
        for (const o of ST.fish) { if (o.st === 'lunge') stepLunge(o, dt, t); else if (o.st !== 'hooked') stepFish(o, dt, t); }
        if (ST.ph === 'fight' && ST.hk) stepFight(dt, t);
        if (ST.ph === 'land') { const o = ST.hk; setAn('land'); { const t1 = now(); while (now() - t1 < .5) { await nextFrame(); const u = (now() - t1) / .5; o.x += (ST.tip[0] - o.x) * u * .2; o.y += (ST.tip[1] + 30 - o.y) * u * .2; ST.hook.x = o.x; ST.hook.y = o.y; } } ST.hk = null; ST.ph = 'card'; ST.fish.splice(ST.fish.indexOf(o), 1); ST.strain = 0; ST.shake = 0; try { playSnd('ui_confirm'); } catch (e) {} bubble(o.x, WY + 12, 14);
          if (ST.easy > 0) { ST.easy--; f.r190_easy = ST.easy; }
          if (!ST.snag) { useBait(); G.streak = (G.streak || 0) + 1; } else ST.bait = true;
          await API.showCard(o.f); G.phase = 'pond'; ST.ph = 'idle'; if (!ST.snag) resetHook(); else { h.x = TIP0[0] - 40; h.y = WY + 46; } tapSeen = P.taps; P.down = false; last = now(); }
        for (let i = ST.fish.length - 1; i >= 0; i--) if (ST.fish[i].dead) { if (ST.eng === ST.fish[i]) ST.eng = null; ST.fish.splice(i, 1); }
        spT -= dt; if (spT <= 0 && ST.fish.length < 10) { spawn(true); spT = rnd(1.2, 2.6); }
      }
      if (API.left() <= 0) { G.phase = 'pond'; await narrate('饵用完了。潭里的鱼也该歇歇了——歇一觉再来。'); }
    } finally { ON = false; const i = S.overlay.indexOf(OV); if (i >= 0) S.overlay.splice(i, 1); G.on = false; G.phase = ''; G.card = null; world.locked = false; S.hud = hud0; P.down = false; }
  };
  window.R190_ST = ST; window.R190_P = P;
})();
