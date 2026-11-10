// ================= R192 · 潭底甩钩（黄金矿工式的钓鱼）=================
// 作者 11-11：「钓鱼不好玩……要不黄金矿工那样子？」「难度越来越大」「画风好点 精致点，一定要做的好看」
// 玩法：铜金抓钩吊在竿尖下面左右摆，点一下屏幕就顺着当时的方向射出去，碰到鱼或潭底的东西就抓住，收线拉回来（越沉拉得越慢，连点屏幕能拉快一点）。
//   一关 35 秒（顶牌下沿的一炷香烧完为止），有目标分；到时间总分够了就进下一关，不够就收竿。
//   潭底每关摆一批不会动的东西：珍珠蚌（合口 / 含珠）、灵石、沉箱（开出来多少灵石看运气）、酒坛，还有又沉又不值钱的大青石；偶尔有通体金鳞的金鳞鲤快速游过。
//   越往后：钩摆得越快、鱼游得越快还会躲钩、大青石和杂物越多、目标越高。一关用一份饵。
//   拉小鱼（白条 / 青虾 / 鲫鱼）经过深水的鳜鱼、星斑鱼、灵鲵身边时，可能被一口吞掉——钩上的就换成那条大的。
//   收竿时鱼篓只装得下「打过的关数 ×2 + 1」条鱼，留最值钱的，其余放回潭里；潭底捞上来的宝贝折成灵石。第一次钓到的鱼种另外出鱼卡。
// 素材：Codex R190F（背景 / 鱼 / 钓者）+ R192M（抓钩、线轮、钓索、拖尾、潭底宝物、金鳞鲤、顶牌、计时香、木签、横幅、结算卷轴、按钮、特效）。
// 原来的「潭底垂钓」（r190_pond.js）留着：window.R192_OFF = 1 就切回去。
(function () {
  if (typeof S === 'undefined' || typeof ctx === 'undefined' || !window.R190_POND) return;
  const OLD = window.R190_POND;
  const now = () => performance.now() / 1000, rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const WY = 200, X0 = 70, X1 = 1185, Y1 = 690, TIP0 = [928, 105], SEAT = [1010, 170];
  const IMG2 = {}, KS = ['fg', 'angler_side', 'swim', 'thrash', 'strike', 'ui'], KM = ['hook', 'line_reel', 'line_rope', 'trail', 'items', 'hud_top', 'incense_full', 'incense_ash', 'incense_ember', 'score_tag', 'banner_clear', 'banner_finish', 'result_scroll', 'button_normal', 'button_down', 'fx'];
  const ldi = (k, dir, key) => { key = key || k; if (key in IMG2) return; IMG2[key] = null; const i = new Image(); i.onload = () => { IMG2[key] = i; }; i.onerror = () => { delete IMG2[key]; }; i.src = dir + k + '.webp?v=1'; };
  const bgKey = () => { const s = ST.API ? ST.API.SHI() : '午'; return s === '戌' || s === '子' ? 'bg_night' : s === '酉' ? 'bg_dusk' : 'bg_day'; };
  const preload = () => { KS.forEach(k => ldi(k, 'r190f/')); KM.forEach(k => ldi(k, 'r192m/', 'm_' + k)); ldi(bgKey(), 'r190f/'); };
  const ready = () => KS.every(k => IMG2[k]) && KM.every(k => IMG2['m_' + k]) && IMG2[bgKey()];
  const M = k => IMG2['m_' + k];
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (name) { if (name === 'qingzhu_upper_pavilion') { try { preload(); } catch (e) {} } return o.apply(this, arguments); })(tileSetMap);
  const SW = { crucian: 0, minnow: 1, grass_carp: 2, shrimp: 3, carp: 4, perch: 5, koi: 6, silver_scale: 7, starfish: 8, salamander: 9, turtle: 10, sandal: 11, twig: 12 };
  const MX = { crucian: 36, minnow: 46, grass_carp: 28, shrimp: 74, carp: 27, perch: 33, koi: 34, silver_scale: 34, starfish: 32, salamander: 30, turtle: 43, sandal: 40, twig: 30 };
  const STK = { perch: 0, starfish: 1, grass_carp: 2, salamander: 3 };
  const AN = { idle: [0, 4, 6, 1, [[46, 161], [46, 159], [47, 157], [47, 159]]], lift: [1, 6, 12, 0, [[45, 165], [54, 153], [58, 139], [83, 99], [78, 96], [71, 127]]], reel: [2, 4, 8, 1, [[75, 119], [103, 113], [117, 115], [67, 116]]],
    land: [3, 6, 10, 0, [[57, 152], [59, 135], [58, 105], [61, 66], [53, 65], [43, 78]]], miss: [4, 4, 9, 0, [[59, 139], [124, 94], [70, 119], [55, 157]]] };
  const UI = { bait: [12, 12, 193, 56] };
  const LAY = { minnow: [232, 340, 76], shrimp: [240, 350, 54], crucian: [262, 420, 85], koi: [250, 390, 102], carp: [380, 524, 117], grass_carp: [372, 540, 132, 1], silver_scale: [420, 566, 105],
    perch: [520, 600, 112, 1], starfish: [540, 610, 117, 1], salamander: [580, 620, 132, 1], turtle: [590, 625, 127], sandal: [300, 560, 73], twig: [240, 560, 81] };
  const SMALL = { minnow: 1, shrimp: 1, crucian: 1 };
  // 潭底的东西：items.webp 第 1 行的格子；pts 分数、reel 收线速度、gold 折成的灵石
  const PROP = { clam: { c: 0, name: '珍珠蚌', pts: 30, reel: 300, gold: [2, 5], w: 3 }, pearl: { c: 1, name: '含珠蚌', pts: 90, reel: 230, gold: [12, 22], w: 1.1 }, ore: { c: 2, name: '灵石', pts: 70, reel: 210, gold: [8, 15], w: 2 },
    chest: { c: 3, name: '沉箱', pts: 0, reel: 140, gold: [0, 0], w: 1 }, jar: { c: 5, name: '酒坛', pts: 45, reel: 190, gold: [5, 10], w: 1.6 }, boulder: { c: 4, name: '大青石', pts: 3, reel: 80, gold: [0, 0], junk: 1 },
    gcarp: { c: 0, name: '金鳞鲤', pts: 150, reel: 380, gold: [20, 35], swim: 1 } };
  const kOf = o => o.len / (2 * (96 - MX[o.id]));
  const PTS = f => f.junk ? 2 : f.id === 'turtle' ? 200 : f.id === 'salamander' ? 120 : (f.sell || 10);
  const TGS = [100, 240, 420, 640, 900, 1200, 1540, 1920], TG = n => n <= 8 ? TGS[n - 1] : 1920 + 420 * (n - 8);   // 累计目标（自测：每竿都瞄准的脚本一关能拿 450 分上下；真人四成左右，大约打到第 3、4 关）
  const LVT = 35, TH0 = -1.36, TH1 = .44, L0 = 58, HKS = .6, GRAB = 128 * HKS;   // 钩眼到爪尖
  const HX = 300, HY = 6, SCO = [HX + 449, HY + 44];
  const P = { x: 0, y: 0, down: false, taps: 0 }; let ON = false;
  const toL = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
  window.addEventListener('pointerdown', e => { if (!ON) return; const [x, y] = toL(e); P.x = x; P.y = y; P.down = true; P.taps++; }, true);
  window.addEventListener('pointermove', e => { if (!ON) return; const [x, y] = toL(e); P.x = x; P.y = y; }, true);
  for (const ev of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(ev, () => { P.down = false; }, true);
  const ST = { API: null, lv: 1, total: 0, tEnd: 0, ph: 'swing', sw: 0, th: 0, L: L0, hx: 0, hy: 0, gx: 0, gy: 0, hk: null, fish: [], pops: [], bub: [], fxs: [], motes: [], got: [], tip: TIP0.slice(), an: 'idle', a0: 0, msg: '', msgT: 0, boost: 0, shot: 0, interT: 0, finT: 0, res: null, gold: 0 };
  const setAn = a => { if (ST.an === a && AN[a][3]) return; ST.an = a; ST.a0 = now(); };
  const flash = (m, s = 1.4) => { ST.msg = m; ST.msgT = now() + s; };
  const bubble = (x, y, n = 3) => { for (let i = 0; i < n; i++) ST.bub.push({ x: x + rnd(-8, 8), y: y + rnd(-4, 4), r: rnd(1.5, 4), v: rnd(26, 60), t0: now(), ph: rnd(0, 6) }); };
  const fx = (row, x, y) => ST.fxs.push({ row, x, y, t0: now() });
  const QUIT = { x: 18, y: H - 74, w: 172, h: 57 }, inQuit = () => P.x >= QUIT.x && P.x <= QUIT.x + QUIT.w && P.y >= QUIT.y && P.y <= QUIT.y + QUIT.h;
  const snd = (n, v) => { try { playSnd(n, v); } catch (e) {} };

  // ---------- 鱼和潭底的东西 ----------
  function pickKind(junk) { const A = ST.API, s = A.SHI(), f = A.F(), t = [];
    for (const x of A.FISH) { if (!!x.junk !== !!junk || !LAY[x.id]) continue; let w = (x.w[0] || 0) + (x.w[1] || 0) + (x.w[2] || 0); if (x.t && x.t[s] != null) w *= x.t[s];
      if (x.id === 'turtle' && (f.r175_turtle || (f.r175_wins || 0) < 6 || ST.lv < 3)) w = 0; if ((x.r === '珍品' || x.r === '稀世') && ST.lv >= 3) w *= 1 + .12 * Math.min(6, ST.lv - 2); if (w > 0) t.push([x, w]); }
    let r = Math.random() * t.reduce((a, b) => a + b[1], 0); for (const [x, w] of t) if ((r -= w) < 0) return x; return t[0][0]; }
  function spawn(edge, junk) { const f = pickKind(junk), L = LAY[f.id], dir = Math.random() < .5 ? 1 : -1, len = L[2], k = 1 + .16 * (ST.lv - 1);
    const o = { f, id: f.id, len, dir, x: edge ? (dir > 0 ? X0 - 90 : X1 + 90) : rnd(X0 + 60, X1 - 220), y: rnd(L[0], L[1]), v: (f.junk ? 9 : (26 + f.sp * 20) * k) * rnd(.8, 1.2), st: 'swim', ph: rnd(0, 6), al: 1, shot: 0, dg: 0, pts: PTS(f) };
    o.hy = o.y; ST.fish.push(o); return o; }
  function mkProp(id, x, y) { const d = PROP[id], o = { prop: d, id, f: { name: d.name, junk: d.junk }, x, y, hy: y, len: 110, dir: 1, v: 0, st: 'swim', ph: rnd(0, 6), al: 1, shot: 0, dg: 0, pts: d.pts };
    if (id === 'chest') { o.pts = Math.round(rnd(30, 70 + 25 * ST.lv) / 5) * 5; o.goldN = Math.round(o.pts * rnd(.25, .4)); } else o.goldN = Math.round(rnd(d.gold[0], d.gold[1]));
    if (d.swim) { o.dir = Math.random() < .5 ? 1 : -1; o.x = o.dir > 0 ? X0 - 90 : X1 + 90; o.v = 190 + 14 * ST.lv; }
    ST.fish.push(o); return o; }
  function layBottom() { const n = 4 + Math.min(2, Math.floor(ST.lv / 3)), nb = Math.min(4, 1 + Math.floor(ST.lv / 2)), ids = [];
    const pool = Object.keys(PROP).filter(k => PROP[k].w && (k !== 'chest' || ST.lv >= 2) && (k !== 'pearl' || ST.lv >= 2)); for (let i = 0; i < n; i++) { let r = Math.random() * pool.reduce((a, k) => a + PROP[k].w, 0); for (const k of pool) if ((r -= PROP[k].w) < 0) { ids.push(k); break; } }
    for (let i = 0; i < nb; i++) ids.push('boulder'); ids.sort(() => Math.random() - .5);
    const slot = (X1 - 140 - (X0 + 50)) / ids.length; ids.forEach((id, i) => mkProp(id, X0 + 50 + slot * (i + .5) + rnd(-slot * .25, slot * .25), rnd(628, 652))); }
  function stepFish(o, dt, t) {
    if (o.prop && !o.prop.swim) return;
    if (o.st === 'flee') { o.x += o.dir * 210 * dt; o.al = Math.max(0, o.al - dt * .6); if (o.al <= 0) o.dead = true; return; }
    if (o.st === 'lunge') { const q = o.tg; if (!q || ST.hk !== q) { o.st = 'swim'; return; } const dx = q.x - (o.x + o.dir * o.len * .5), dy = q.y - o.y, l = Math.hypot(dx, dy); o.dir = dx > 0 ? 1 : -1;
      if (l > 16) { o.x += dx / l * 380 * dt; o.y += dy / l * 380 * dt; return; }
      q.dead = true; bubble(q.x, q.y, 12); fx(2, q.x, q.y); o.st = 'hooked'; o.sw = t; o.x = ST.gx; o.y = ST.gy; ST.hk = o; flash('被' + o.f.name + '一口吞了！', 1.4); snd('sfx_hit', .7); return; }
    const fast = o.dg > t ? 2.8 : 1; o.x += o.dir * o.v * fast * dt; o.y = o.hy + Math.sin(t * .9 + o.ph) * (o.prop ? 14 : 7);
    if (!o.f.junk && !o.prop && Math.random() < dt * .05 * (1 + .25 * ST.lv)) o.dir *= -1;
    if ((o.dir > 0 && o.x > X1 + 110) || (o.dir < 0 && o.x < X0 - 110)) o.dead = true;
    if (ST.ph === 'shoot' && !o.f.junk && o.shot !== ST.shot && Math.hypot(ST.gx - o.x, ST.gy - o.y) < 130) { o.shot = ST.shot; if (Math.random() < clamp((ST.lv - 2) * .13, 0, .62)) { o.dg = t + .45; if (Math.random() < .5) o.dir *= -1; bubble(o.x, o.y, 2); } }
  }
  const hit = o => o.prop && !o.prop.swim ? Math.abs(ST.gx - o.x) < 62 && ST.gy > o.y - 52 && ST.gy < o.y + 26 : Math.abs(ST.gx - o.x) < o.len * .46 && Math.abs(ST.gy - o.y) < o.len * .2 + 12;
  const reelV = o => !o ? 980 : o.prop ? o.prop.reel : o.f.junk ? 105 : o.id === 'turtle' ? 95 : 540 / (1 + o.f.p * 2.3);

  // ---------- 画 ----------
  const spr = (im, sx, sy, sw, sh, x, y, ax, ay, k, flip, rot, al) => { if (!im) return; ctx.save(); if (al != null) ctx.globalAlpha = al; ctx.translate(x, y); if (rot) ctx.rotate(rot); if (flip) ctx.scale(-1, 1); ctx.drawImage(im, sx, sy, sw, sh, -ax * k, -ay * k, sw * k, sh * k); ctx.restore(); };
  function drawFish(o, t) { const hooked = o.st === 'hooked';
    if (o.prop) { const d = o.prop;
      if (d.swim) { const f = Math.floor(t * 12 + o.ph * 3) % 6; if (hooked) spr(M('items'), f * 192, 128, 192, 128, o.x, o.y, 26, 62, .62, false, Math.PI / 2 + Math.sin(t * 9) * .25);
        else { ctx.save(); ctx.shadowColor = 'rgba(255,214,110,.85)'; ctx.shadowBlur = 16 + Math.sin(t * 6) * 6; spr(M('items'), f * 192, 128, 192, 128, o.x, o.y, 96, 64, .62, o.dir > 0); ctx.restore(); } return; }
      if (hooked) spr(M('items'), d.c * 192, 0, 192, 128, o.x, o.y, 96, 46, .85, false, Math.sin(t * 4) * .12);
      else { if (o.id === 'ore' || o.id === 'pearl') { ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * 3 + o.ph) * .15; ctx.shadowColor = o.id === 'ore' ? '#7ad0ff' : '#fff2c8'; ctx.shadowBlur = 22; spr(M('items'), d.c * 192, 0, 192, 128, o.x, o.y, 96, 82, .85); ctx.restore(); }
        spr(M('items'), d.c * 192, 0, 192, 128, o.x, o.y, 96, 82, .85); } return; }
    const k = kOf(o), junk = o.f.junk, row = SW[o.id];
    if (hooked && !junk && !(o.sw && t - o.sw < .25)) { const tip = ST.tip, a = Math.atan2(tip[1] - o.y, tip[0] - o.x), right = tip[0] >= o.x, ax = o.id === 'shrimp' ? 51 : 33, ay = o.id === 'turtle' ? 30 : 37;
      spr(IMG2.thrash, (Math.floor(t * 12) % 4) * 192, row * 128, 192, 128, o.x, o.y, ax, ay, k, right, right ? a + Math.PI / 4 : a + Math.PI * .75, o.al); return; }
    if ((o.st === 'lunge' || (o.sw && t - o.sw < .25)) && STK[o.id] != null) { const f = o.st === 'lunge' ? Math.floor(t * 12) % 2 : 2 + Math.min(1, Math.floor((t - o.sw) * 8)), c = o.st === 'lunge' ? o : { x: o.x - o.dir * o.len * .5, y: o.y };
      spr(IMG2.strike, f * 192, STK[o.id] * 128, 192, 128, c.x, c.y, 96, 64, k, o.dir > 0); return; }
    const n = junk ? 4 : 6, f = Math.floor(t * (junk ? 5 : 8 + (o.st === 'flee' || o.dg > t ? 8 : 0)) + o.ph * 3) % n;
    spr(IMG2.swim, f * 192, row * 128, 192, 128, o.x, o.y, 96, 64, k, o.dir > 0, hooked ? Math.sin(t * 3) * .3 : 0, o.al); }
  function anFrame(t) { const A = AN[ST.an], n = Math.floor((t - ST.a0) * A[2]); if (!A[3] && n >= A[1]) { ST.an = ST.ph === 'reel' ? 'reel' : 'idle'; ST.a0 = t; return anFrame(t); } return [A[0], A[3] ? n % A[1] : n, A[4]]; }
  function drawRig(t) { const tip = ST.tip, len = Math.hypot(ST.hx - tip[0], ST.hy - tip[1]), rope = M('line_rope');
    ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(-ST.th); const rk = .8; for (let d = 0; d < len; d += 32 * rk) { const h = Math.min(32, (len - d) / rk); ctx.drawImage(rope, 0, 0, 8, h, -4 * rk, d, 8 * rk, h * rk); } ctx.restore();
    if (ST.ph === 'shoot') spr(M('trail'), 0, (Math.floor(t * 14) % 4) * 256, 64, 256, ST.hx, ST.hy, 32, 248, .62, false, -ST.th, .9);
    if (ST.hk) drawFish(ST.hk, t);
    const hf = ST.ph === 'shoot' ? 1 : ST.ph === 'reel' ? (ST.hk ? 2 : 3) : 0; spr(M('hook'), hf * 160, 0, 160, 160, ST.hx, ST.hy, 80, 12, HKS, false, -ST.th);
    const spin = ST.ph === 'reel' || ST.ph === 'shoot'; spr(M('line_reel'), (spin ? Math.floor(t * (ST.ph === 'shoot' ? 20 : 12)) % 4 : 0) * 96, 0, 96, 96, tip[0], tip[1], 48, 48, .42); }
  const btn = (x, y, w, h, label, down) => { ctx.drawImage(M(down ? 'button_down' : 'button_normal'), x, y, w, h); ctx.font = `${Math.round(h * .42)}px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(label, x + w / 2, y + h * (down ? .66 : .62), '#fff3d6', '#1c3a1c', 4); };
  function drawHud(t) { const A = ST.API, tg = TG(ST.lv), inter = ST.ph === 'inter' || ST.ph === 'fin', left = inter ? 0 : Math.max(0, ST.tEnd - t);
    ctx.drawImage(M('hud_top'), HX, HY);
    ctx.textBaseline = 'middle'; ctx.fillStyle = '#4a2a10'; ctx.font = `34px ${BRUSH}`; ctx.textAlign = 'center'; ctx.fillText('第 ' + ST.lv + ' 关', HX + 136, HY + 47);
    ctx.font = `600 25px ${FONT}`; ctx.fillStyle = ST.total >= tg ? '#2f6a1c' : '#4a2a10'; ctx.fillText('鱼获 ' + ST.total + '  /  目标 ' + tg, SCO[0], SCO[1] + 2); ctx.textBaseline = 'alphabetic';
    const k = Math.round(520 * clamp(left / LVT, 0, 1)); ctx.drawImage(M('incense_ash'), HX + 80, HY + 78);
    if (k > 0) { ctx.drawImage(M('incense_full'), 0, 0, k, 36, HX + 80, HY + 78, k, 36); spr(M('incense_ember'), (Math.floor(t * 8) % 4) * 48, 0, 48, 48, HX + 80 + k, HY + 96, 24, 35, 1); }
    if (!inter && left < 8 && left > 0) { ctx.font = `600 18px ${FONT}`; ctx.textAlign = 'right'; textOutline(Math.ceil(left) + ' 秒', HX + 664, HY + 116, '#ffd2b0', '#3a0e06', 4); }
    ctx.drawImage(IMG2.ui, UI.bait[0], UI.bait[1], UI.bait[2], UI.bait[3], 22, 18, UI.bait[2] * 1.15, UI.bait[3] * 1.15); spr(M('hook'), 0, 0, 160, 160, 22 + 36 * 1.15, 18 + 6, 80, 12, .26); ctx.font = `600 24px ${FONT}`; ctx.textAlign = 'center'; textOutline('饵 × ' + Math.max(0, A.left()), 22 + 117 * 1.15, 18 + 37 * 1.15, '#fff3c8', '#1c2a0c', 4);
    if (!ST.res && ST.ph !== 'fin') btn(QUIT.x, QUIT.y, QUIT.w, QUIT.h, '收竿', P.down && inQuit()); }
  function drawAll() { const t = now(), A = ST.API, bg = IMG2[bgKey()]; if (!bg) return;
    ctx.drawImage(bg, 0, 0, W, H);
    { const [row, f, tips] = anFrame(t); spr(IMG2.angler_side, f * 256, row * 256, 256, 256, SEAT[0], SEAT[1], 128, 226, 1); const tp = tips[f] || tips[0], tx = SEAT[0] - 128 + tp[0], ty = SEAT[1] - 226 + tp[1]; ST.tip[0] += (tx - ST.tip[0]) * .25; ST.tip[1] += (ty - ST.tip[1]) * .25; }
    for (const o of ST.fish) if (o.st !== 'hooked' && o.prop && !o.prop.swim) drawFish(o, t);
    for (const o of ST.fish) if (o.st !== 'hooked' && !(o.prop && !o.prop.swim)) drawFish(o, t);
    drawRig(t);
    for (let i = ST.fxs.length - 1; i >= 0; i--) { const q = ST.fxs[i], n = q.row === 1 ? 4 : 6, fps = [15, 12, 14, 13][q.row], f = Math.floor((now() - q.t0) * fps); if (f >= n) { ST.fxs.splice(i, 1); continue; } spr(M('fx'), f * 128, q.row * 128, 128, 128, q.x, q.y, 64, q.row === 3 ? 92 : 66, 1); }
    for (let i = ST.bub.length - 1; i >= 0; i--) { const b = ST.bub[i], y = b.y - (t - b.t0) * b.v; if (y < WY + 2) { ST.bub.splice(i, 1); continue; } ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x + Math.sin(t * 3 + b.ph) * 3, y, b.r, 0, 7); ctx.stroke(); }
    ctx.drawImage(IMG2.fg, (Math.floor(t * 5) % 4) * 1280, 0, 1280, 720, 0, 0, W, H);
    drawHud(t);
    // 光点飞向分数牌
    for (let i = ST.motes.length - 1; i >= 0; i--) { const q = ST.motes[i], u = (t - q.t0) / .7; if (u >= 1) { ST.motes.splice(i, 1); continue; } const e = u * u * (3 - 2 * u), x = q.x + (SCO[0] - q.x) * e, y = q.y + (SCO[1] - q.y) * e - Math.sin(u * Math.PI) * 60; spr(M('fx'), (Math.floor(u * 8) % 4) * 128, 128, 128, 128, x, y, 64, 64, .8, x > q.x); }
    for (let i = ST.pops.length - 1; i >= 0; i--) { const q = ST.pops[i], u = (t - q.t0) / 1.5; if (u >= 1) { ST.pops.splice(i, 1); continue; } const y = q.y - u * 50; ctx.save(); ctx.globalAlpha = u < .8 ? 1 : (1 - u) * 5; ctx.drawImage(M('score_tag'), q.x - 85, y - 28); ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = q.c; ctx.fillText(q.s, q.x + 7, y + 1); ctx.restore(); ctx.textBaseline = 'alphabetic'; }
    if (ST.msg && t < ST.msgT) { ctx.font = `40px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(ST.msg, W / 2, 300, '#ffe39a', '#0a1420', 6); }
    // 过关 / 收竿横幅
    const ban = (k, t0) => { const u = clamp((t - t0) / .35, 0, 1), s = 1.25 - .25 * (1 - (1 - u) * (1 - u)); ctx.save(); ctx.globalAlpha = u; ctx.translate(W / 2, 330); ctx.scale(s, s); ctx.drawImage(M(k), -380, -105); ctx.restore(); };
    if (ST.ph === 'inter') { ban('banner_clear', ST.interT - 2.2); ctx.font = `600 24px ${FONT}`; ctx.textAlign = 'center'; textOutline('下一关目标 ' + TG(ST.lv + 1) + '　·　钩摆得更快，鱼也更机灵了', W / 2, 470, '#fff3d6', '#0a1c30', 5); }
    if (ST.ph === 'fin' && !ST.res) ban('banner_finish', ST.finT);
    // 新手提示（只在第一关）
    if (ST.lv === 1 && !ST.res && ST.ph !== 'fin') { ctx.textAlign = 'center'; ctx.font = `28px ${BRUSH}`; const a = ST.ph === 'swing' ? '钩摆到对准的时候，点屏幕甩出去' : ST.ph === 'reel' && ST.hk ? (ST.hk.f.junk ? '是块石头……连点屏幕快点拉' : '连点屏幕，拉得更快！') : ''; if (a) textOutline(a, W / 2, H - 46, '#ffe9b0', '#0a1c30', 6); }
    if (ST.res) drawRes(t);
  }
  function drawRes(t) { const r = ST.res, u = clamp((t - r.t0) / .3, 0, 1), x = W / 2 - 460, y = 70;
    ctx.save(); ctx.globalAlpha = u * .55; ctx.fillStyle = '#06121c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = u; ctx.drawImage(M('result_scroll'), x, y + (1 - u) * 30);
    ctx.textAlign = 'center'; ctx.fillStyle = '#4a2a10'; ctx.font = `40px ${BRUSH}`; ctx.fillText(r.title, W / 2, y + 128); ctx.font = `600 24px ${FONT}`;
    r.lines.forEach((s, i) => { ctx.fillStyle = s.c || '#4a2a10'; ctx.fillText(s.s, W / 2, y + 186 + i * 40); });
    btn(W / 2 - 115, y + 452, 230, 76, '好', P.down && t - r.t0 > .4); ctx.restore(); }
  const OV = { draw() { if (ON) try { drawAll(); } catch (e) {} } };

  // ---------- 一趟 ----------
  function startLevel(n) { ST.lv = n; ST.fish.length = 0; const nf = Math.max(5, 9 - Math.floor(n / 2)), nj = Math.min(3, Math.floor(n / 2)); for (let i = 0; i < nf; i++) spawn(false, false); for (let i = 0; i < nj; i++) spawn(false, true); layBottom();
    ST.gc = Math.random() < .3 + .06 * n ? now() + rnd(6, 24) : 0;
    ST.ph = 'swing'; ST.sw = rnd(0, 6); ST.L = L0; ST.hk = null; ST.tEnd = now() + LVT; { const f = ST.API.F(); f.r175_used = (f.r175_used || 0) + 1; } flash('第 ' + n + ' 关　目标 ' + TG(n), 1.6); setAn('idle'); }
  function land(o, t) { const p = o.pts; ST.total += p; ST.got.push(o.prop ? { prop: 1, id: o.id, name: o.f.name, pts: p, gold: o.goldN, junk: o.f.junk } : o.f);
    ST.pops.push({ s: '+' + p + ' ' + o.f.name, x: ST.tip[0] - 190, y: WY + 52, c: o.f.junk ? '#6a5a48' : p >= 60 ? '#a8420e' : '#4a2a10', t0: t }); fx(0, ST.tip[0] - 20, WY + 4); bubble(ST.tip[0] - 20, WY + 14, 8);
    if (!o.f.junk) for (let i = 0; i < Math.min(5, 1 + Math.floor(p / 30)); i++) ST.motes.push({ x: ST.tip[0] - 20 + rnd(-20, 20), y: WY + rnd(-10, 10), t0: t + i * .08 });
    ST.fish.splice(ST.fish.indexOf(o), 1); snd(o.f.junk ? 'ui_move' : 'ui_confirm', .6); setAn(o.f.junk ? 'miss' : 'land'); }
  async function tapWait(min) { const t0 = now(), s = P.taps; while (true) { await nextFrame(); if (P.taps !== s && now() - t0 > min) return; } }
  async function finish(API, quit, noBait) { const f = API.F(), G = API.G, real = ST.got.filter(x => !x.junk && !x.prop), props = ST.got.filter(x => x.prop && !x.junk), book = f.r175_book = f.r175_book || {}, played = ST.lv;
    for (const x of ST.got) if (x.junk && !x.prop && book[x.id] == null) book[x.id] = 0;
    ST.ph = 'fin'; ST.finT = now(); snd('ui_confirm', .5); { const t0 = now(); while (now() - t0 < 1.5) await nextFrame(); }
    const seen = {}, firsts = [], rest = []; for (const x of real) { if ((book[x.id] == null || x.id === 'turtle') && !seen[x.id]) { seen[x.id] = 1; firsts.push(x); } else rest.push(x); }
    for (const x of firsts) { await API.showCard(x); G.phase = 'pond'; }
    const keepN = played * 2 + 1, keep = rest.filter(x => x.id !== 'salamander' && x.id !== 'turtle').sort((a, b) => PTS(b) - PTS(a)).slice(0, keepN), cnt = {};
    for (const x of keep) { const size = x.sz ? x.sz[0] + Math.random() * (x.sz[1] - x.sz[0]) : 0; book[x.id] = Math.max(book[x.id] || 0, Math.round(size)); f.r175_wins = (f.r175_wins || 0) + 1; addItem('fish_' + x.id, 1); G.caught.push(x.id); cnt[x.name] = (cnt[x.name] || 0) + 1; }
    const gold = props.reduce((a, x) => a + (x.gold || 0), 0), pc = {}; for (const x of props) pc[x.name] = (pc[x.name] || 0) + 1; if (gold > 0) try { S.hero.gold = (S.hero.gold || 0) + gold; } catch (e) {}
    f.r192_best = Math.max(f.r192_best || 0, ST.total); f.r192_lv = Math.max(f.r192_lv || 0, played);
    const back = rest.length - keep.length, L = [];
    L.push({ s: '打到第 ' + played + ' 关　·　鱼获 ' + ST.total + ' 分' + (ST.total >= (f.r192_best || 0) && ST.total > 0 ? '　（最好成绩）' : ''), c: '#7a3a0e' });
    const fl = Object.keys(cnt).map(k => k + '×' + cnt[k]).join('　'); L.push({ s: fl ? '鱼篓：' + fl : firsts.length ? '鱼篓：新鱼已记进鱼谱' : '鱼篓是空的' });
    if (back > 0) L.push({ s: '鱼篓装不下，另外 ' + back + ' 条放回潭里了', c: '#6a5a48' });
    const pl = Object.keys(pc).map(k => k + '×' + pc[k]).join('　'); if (pl) L.push({ s: '潭底捞上来：' + pl }); if (gold > 0) L.push({ s: '折成灵石 +' + gold, c: '#2f6a1c' });
    if (noBait || API.left() <= 0) L.push({ s: '饵用完了，歇一觉再来', c: '#6a5a48' });
    ST.res = { t0: now(), title: noBait ? '饵尽收竿' : quit ? '收竿' : '香尽收竿', lines: L.slice(0, 6) }; await tapWait(.5); ST.res = null; }
  window.R190_POND = async function (API) {
    if (window.R192_OFF) return OLD(API);
    const f = API.F(), G = API.G; ST.API = API;
    if (!f.r192_tut) { f.r192_tut = 1;
      await narrate('（钓鱼换了玩法：铜金抓钩吊在竿尖下面左右摆，点一下屏幕就顺着那个方向甩出去，碰到鱼或潭底的东西就抓住，自己拉回来。）');
      await narrate('（顶上那炷香烧完就是一关，要在香烧完前凑够目标分。越值钱的越沉、拉得越慢；大青石又沉又不值钱，别去碰。收线时连点屏幕能拉快一点。）');
      await narrate('（够数就进下一关，越往后越难；不够就收竿。一关用一份饵，左下角可以随时收竿。潭底捞上来的宝贝最后折成灵石。）'); }
    preload(); if (!ready()) { toast('钓具还在拿……稍等一下再点', 1500); return; }
    ST.total = 0; ST.got.length = 0; ST.bub.length = 0; ST.fxs.length = 0; ST.pops.length = 0; ST.motes.length = 0; ST.msg = ''; ST.tip = TIP0.slice(); P.down = false; ST.shot = 0; ST.boost = 0; ST.res = null;
    const hud0 = S.hud; S.hud = false; world.locked = true; G.on = true; G.phase = 'pond'; G.caught = []; G.streak = 0; G.cat = null; G.card = null; G.fv = false; G.sh = null;
    if (S.overlay.indexOf(OV) < 0) S.overlay.unshift(OV); ON = true; startLevel(1); let last = now(), spT = 1, tapSeen = P.taps, quit = false;
    try {
      while (true) { await nextFrame(); const t = now(), dt = Math.min(.05, t - last); last = t;
        if ((typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice)) { tapSeen = P.taps; ST.tEnd += dt; continue; }
        let tap = false; if (P.taps !== tapSeen) { tapSeen = P.taps; if (inQuit() && ST.ph !== 'inter') { quit = true; break; } tap = true; }
        const tip = ST.tip;
        if (ST.ph === 'inter') { if (t >= ST.interT) startLevel(ST.lv + 1); ST.th *= .9; ST.hx = tip[0] + Math.sin(ST.th) * L0; ST.hy = tip[1] + Math.cos(ST.th) * L0; ST.gx = ST.hx; ST.gy = ST.hy + GRAB; continue; }
        if (ST.ph === 'swing') { ST.sw += dt * (1.45 + .2 * ST.lv); ST.th = (TH0 + TH1) / 2 + (TH1 - TH0) / 2 * Math.sin(ST.sw); ST.L = L0; if (tap) { ST.ph = 'shoot'; ST.shot++; setAn('lift'); snd('sfx_swing', .5); } }
        else if (ST.ph === 'shoot') { ST.L += 720 * dt; }
        else if (ST.ph === 'reel') { if (tap) ST.boost = t + .32; const o = ST.hk, v = reelV(o) * (o && ST.boost > t ? 1.7 : 1); ST.L -= v * dt; if (o && Math.random() < dt * 6) bubble(ST.gx, ST.gy, 1);
          if (o && SMALL[o.id] && !o.bit) for (const q of ST.fish) { if (q.st !== 'swim' || !LAY[q.id] || !LAY[q.id][3]) continue; if (Math.hypot(q.x - o.x, q.y - o.y) < 150) { o.bit = 1; if (Math.random() < .45) { q.st = 'lunge'; q.tg = o; } break; } }
          if (ST.L <= L0) { ST.L = L0; if (ST.hk) land(ST.hk, t); else setAn('idle'); ST.hk = null; ST.ph = 'swing'; } }
        ST.hx = tip[0] + Math.sin(ST.th) * ST.L; ST.hy = tip[1] + Math.cos(ST.th) * ST.L; ST.gx = ST.hx + Math.sin(ST.th) * GRAB; ST.gy = ST.hy + Math.cos(ST.th) * GRAB;
        if (ST.hk) { ST.hk.x = ST.gx; ST.hk.y = ST.gy; }
        if (ST.ph === 'shoot') { let got = null; if (ST.gy > WY) for (const o of ST.fish) if (o.st === 'swim' && hit(o)) { got = o; break; }
          if (got) { got.st = 'hooked'; ST.hk = got; ST.ph = 'reel'; setAn('reel'); bubble(ST.gx, ST.gy, 6); snd('sfx_hit', .5);
            if (got.prop && !got.prop.swim) { fx(3, ST.gx, ST.gy + 20); if (got.id === 'boulder') flash('一块大青石……', 1); } else { fx(0, ST.gx, ST.gy); if (got.f.junk) flash(got.id === 'sandal' ? '一只破草鞋……' : '一截枯枝……', 1); else if (got.id === 'gcarp') flash('金鳞鲤！', 1.2); } }
          else if (ST.gx < X0 || ST.gx > X1 || ST.gy > Y1) { if (ST.gy > Y1) fx(3, ST.gx, Y1); ST.ph = 'reel'; setAn('reel'); } }
        for (const o of ST.fish) if (o.st !== 'hooked') stepFish(o, dt, t);
        for (let i = ST.fish.length - 1; i >= 0; i--) if (ST.fish[i].dead) ST.fish.splice(i, 1);
        if (ST.gc && t >= ST.gc) { ST.gc = 0; mkProp('gcarp', 0, rnd(300, 500)); }
        spT -= dt; if (spT <= 0) { const sw = ST.fish.filter(o => !o.prop), nj = sw.filter(o => o.f.junk).length, nf = sw.length - nj; if (nj < Math.min(3, Math.floor(ST.lv / 2))) spawn(true, true); else if (nf < Math.max(5, 9 - Math.floor(ST.lv / 2))) spawn(true, false); spT = rnd(.8, 1.8); }
        if (t >= ST.tEnd && ST.ph === 'swing') { if (ST.total >= TG(ST.lv) && API.left() > 0) { ST.ph = 'inter'; ST.interT = t + 2.2; snd('ui_confirm', .7); } else break; }
      }
      const noBait = !quit && ST.total >= TG(ST.lv) && API.left() <= 0; G.phase = 'pond';
      await finish(API, quit, noBait);
    } finally { ON = false; const i = S.overlay.indexOf(OV); if (i >= 0) S.overlay.splice(i, 1); G.on = false; G.phase = ''; G.card = null; world.locked = false; S.hud = hud0; P.down = false; }
  };
  window.R192_ST = ST; window.R192_P = P; window.R192_TG = TG;
})();
