// ================= R192 · 潭底甩钩（黄金矿工式的钓鱼）=================
// 作者 11-11：「钓鱼不好玩……要不黄金矿工那样子？」「难度越来越大」
// 玩法：钩子吊在竿尖下面左右摆，点一下屏幕就顺着当时的方向射出去，碰到哪条鱼就钩住哪条，然后收线拉回来（鱼越大越沉、拉得越慢，连点屏幕能拉快一点）。
//   一关 35 秒，有目标分（鱼越值钱分越高）；到时间总分够了就进下一关，不够就收竿。破草鞋、枯枝又沉又只值 2 分。
//   越往后：钩摆得越快、鱼游得越快还会躲钩、杂物越多、目标越高。一关用一份饵。
//   拉小鱼（白条 / 青虾 / 鲫鱼）经过深水的鳜鱼、星斑鱼、灵鲵身边时，可能被一口吞掉——钩上的就换成那条大的。
//   收竿时鱼篓只装得下「打过的关数 ×2 + 1」条，留最值钱的，其余放回潭里；第一次钓到的鱼种另外出鱼卡。
// 画面全用 Codex R190F 那套侧剖面素材。原来的「潭底垂钓」（r190_pond.js）留着：window.R192_OFF = 1 就切回去。
(function () {
  if (typeof S === 'undefined' || typeof ctx === 'undefined' || !window.R190_POND) return;
  const OLD = window.R190_POND;
  const now = () => performance.now() / 1000, rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const WY = 200, X0 = 70, X1 = 1185, Y1 = 676, TIP0 = [928, 105], SEAT = [1010, 170];
  const IMG2 = {}, KS = ['fg', 'angler_side', 'swim', 'thrash', 'strike', 'hook', 'fx', 'ui'];
  const ldi = k => { if (k in IMG2) return; IMG2[k] = null; const i = new Image(); i.onload = () => { IMG2[k] = i; }; i.onerror = () => { delete IMG2[k]; }; i.src = 'r190f/' + k + '.webp?v=1'; };
  const bgKey = () => { const s = ST.API ? ST.API.SHI() : '午'; return s === '戌' || s === '子' ? 'bg_night' : s === '酉' ? 'bg_dusk' : 'bg_day'; };
  const preload = () => { KS.forEach(ldi); ldi(bgKey()); }, ready = () => KS.every(k => IMG2[k]) && IMG2[bgKey()];
  const SW = { crucian: 0, minnow: 1, grass_carp: 2, shrimp: 3, carp: 4, perch: 5, koi: 6, silver_scale: 7, starfish: 8, salamander: 9, turtle: 10, sandal: 11, twig: 12 };
  const MX = { crucian: 36, minnow: 46, grass_carp: 28, shrimp: 74, carp: 27, perch: 33, koi: 34, silver_scale: 34, starfish: 32, salamander: 30, turtle: 43, sandal: 40, twig: 30 };
  const STK = { perch: 0, starfish: 1, grass_carp: 2, salamander: 3 };
  const AN = { idle: [0, 4, 6, 1, [[46, 161], [46, 159], [47, 157], [47, 159]]], lift: [1, 6, 12, 0, [[45, 165], [54, 153], [58, 139], [83, 99], [78, 96], [71, 127]]], reel: [2, 4, 8, 1, [[75, 119], [103, 113], [117, 115], [67, 116]]],
    land: [3, 6, 10, 0, [[57, 152], [59, 135], [58, 105], [61, 66], [53, 65], [43, 78]]], miss: [4, 4, 9, 0, [[59, 139], [124, 94], [70, 119], [55, 157]]] };
  const UI = { bait: [12, 12, 193, 56] };
  const LAY = { minnow: [232, 340, 76], shrimp: [240, 350, 54], crucian: [262, 420, 85], koi: [250, 390, 102], carp: [380, 524, 117], grass_carp: [372, 540, 132, 1], silver_scale: [420, 566, 105],
    perch: [520, 662, 112, 1], starfish: [556, 672, 117, 1], salamander: [636, 682, 132, 1], turtle: [650, 684, 127], sandal: [300, 640, 73], twig: [240, 600, 81] };
  const SMALL = { minnow: 1, shrimp: 1, crucian: 1 };
  const kOf = o => o.len / (2 * (96 - MX[o.id]));
  const PTS = f => f.junk ? 2 : f.id === 'turtle' ? 200 : f.id === 'salamander' ? 120 : (f.sell || 10);
  const TGS = [50, 130, 240, 380, 550, 750, 980, 1240], TG = n => n <= 8 ? TGS[n - 1] : 1240 + 300 * (n - 8);   // 累计目标（自测：每竿都瞄准的脚本一关能拿 250 分上下，按它的四五成定）
  const LVT = 35, TH0 = -1.36, TH1 = .44, L0 = 62;
  const P = { x: 0, y: 0, down: false, taps: 0 }; let ON = false;
  const toL = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
  window.addEventListener('pointerdown', e => { if (!ON) return; const [x, y] = toL(e); P.x = x; P.y = y; P.down = true; P.taps++; }, true);
  for (const ev of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(ev, () => { P.down = false; }, true);
  const ST = { API: null, lv: 1, total: 0, tEnd: 0, ph: 'swing', sw: 0, th: 0, L: L0, hx: 0, hy: 0, hk: null, fish: [], pops: [], bub: [], fxs: [], got: [], tip: TIP0.slice(), an: 'idle', a0: 0, msg: '', msgT: 0, boost: 0, shot: 0, interT: 0 };
  const setAn = a => { if (ST.an === a && AN[a][3]) return; ST.an = a; ST.a0 = now(); };
  const flash = (m, s = 1.4) => { ST.msg = m; ST.msgT = now() + s; };
  const bubble = (x, y, n = 3) => { for (let i = 0; i < n; i++) ST.bub.push({ x: x + rnd(-8, 8), y: y + rnd(-4, 4), r: rnd(1.5, 4), v: rnd(26, 60), t0: now(), ph: rnd(0, 6) }); };
  const QUIT = { x: 22, y: H - 66, w: 150, h: 48 }, inQuit = () => P.x >= QUIT.x && P.x <= QUIT.x + QUIT.w && P.y >= QUIT.y && P.y <= QUIT.y + QUIT.h;
  const snd = (n, v) => { try { playSnd(n, v); } catch (e) {} };

  // ---------- 鱼 ----------
  function pickKind(junk) { const A = ST.API, s = A.SHI(), f = A.F(), t = [];
    for (const x of A.FISH) { if (!!x.junk !== !!junk || !LAY[x.id]) continue; let w = (x.w[0] || 0) + (x.w[1] || 0) + (x.w[2] || 0); if (x.t && x.t[s] != null) w *= x.t[s];
      if (x.id === 'turtle' && (f.r175_turtle || (f.r175_wins || 0) < 6 || ST.lv < 3)) w = 0; if ((x.r === '珍品' || x.r === '稀世') && ST.lv >= 3) w *= 1 + .12 * Math.min(6, ST.lv - 2); if (w > 0) t.push([x, w]); }
    let r = Math.random() * t.reduce((a, b) => a + b[1], 0); for (const [x, w] of t) if ((r -= w) < 0) return x; return t[0][0]; }
  function spawn(edge, junk) { const f = pickKind(junk), L = LAY[f.id], dir = Math.random() < .5 ? 1 : -1, len = L[2], k = 1 + .16 * (ST.lv - 1);
    const o = { f, id: f.id, len, dir, x: edge ? (dir > 0 ? X0 - 90 : X1 + 90) : rnd(X0 + 60, X1 - 220), y: rnd(L[0], L[1]), v: (f.junk ? 9 : (26 + f.sp * 20) * k) * rnd(.8, 1.2), st: 'swim', ph: rnd(0, 6), al: 1, shot: 0, dg: 0 };
    o.hy = o.y; ST.fish.push(o); return o; }
  function stepFish(o, dt, t) {
    if (o.st === 'flee') { o.x += o.dir * 210 * dt; o.al = Math.max(0, o.al - dt * .6); if (o.al <= 0) o.dead = true; return; }
    if (o.st === 'lunge') { const q = o.tg; if (!q || ST.hk !== q) { o.st = 'swim'; return; } const dx = q.x - (o.x + o.dir * o.len * .5), dy = q.y - o.y, l = Math.hypot(dx, dy); o.dir = dx > 0 ? 1 : -1;
      if (l > 16) { o.x += dx / l * 380 * dt; o.y += dy / l * 380 * dt; return; }
      q.dead = true; bubble(q.x, q.y, 12); o.st = 'hooked'; o.sw = t; o.x = ST.hx; o.y = ST.hy; ST.hk = o; ST.predT = t; flash('被' + o.f.name + '一口吞了！', 1.4); snd('sfx_hit', .7); return; }
    const fast = o.dg > t ? 2.8 : 1; o.x += o.dir * o.v * fast * dt; o.y = o.hy + Math.sin(t * .9 + o.ph) * 7;
    if (!o.f.junk && Math.random() < dt * .05 * (1 + .25 * ST.lv)) o.dir *= -1;
    if ((o.dir > 0 && o.x > X1 + 110) || (o.dir < 0 && o.x < X0 - 110)) o.dead = true;
    // 钩射过来：第 3 关起鱼会躲（每一竿每条鱼只判一次）
    if (ST.ph === 'shoot' && !o.f.junk && o.shot !== ST.shot && Math.hypot(ST.hx - o.x, ST.hy - o.y) < 130) { o.shot = ST.shot; if (Math.random() < clamp((ST.lv - 2) * .13, 0, .62)) { o.dg = t + .45; if (Math.random() < .5) o.dir *= -1; bubble(o.x, o.y, 2); } }
  }
  const hit = o => Math.abs(ST.hx - o.x) < o.len * .46 && Math.abs(ST.hy - o.y) < o.len * .2 + 12;
  const reelV = o => o ? (o.f.junk ? 105 : o.id === 'turtle' ? 95 : 540 / (1 + o.f.p * 2.3)) : 980;

  // ---------- 画 ----------
  const spr = (im, sx, sy, sw, sh, x, y, ax, ay, k, flip, rot, al) => { ctx.save(); if (al != null) ctx.globalAlpha = al; ctx.translate(x, y); if (rot) ctx.rotate(rot); if (flip) ctx.scale(-1, 1); ctx.drawImage(im, sx, sy, sw, sh, -ax * k, -ay * k, sw * k, sh * k); ctx.restore(); };
  function drawFish(o, t) { const k = kOf(o), hooked = o.st === 'hooked', junk = o.f.junk, row = SW[o.id];
    if (hooked && !junk && !(o.sw && t - o.sw < .25)) { const tip = ST.tip, a = Math.atan2(tip[1] - o.y, tip[0] - o.x), right = tip[0] >= o.x, ax = o.id === 'shrimp' ? 51 : 33, ay = o.id === 'turtle' ? 30 : 37;
      spr(IMG2.thrash, (Math.floor(t * 12) % 4) * 192, row * 128, 192, 128, o.x, o.y, ax, ay, k, right, right ? a + Math.PI / 4 : a + Math.PI * .75, o.al); return; }
    if ((o.st === 'lunge' || (o.sw && t - o.sw < .25)) && STK[o.id] != null) { const f = o.st === 'lunge' ? Math.floor(t * 12) % 2 : 2 + Math.min(1, Math.floor((t - o.sw) * 8)), c = o.st === 'lunge' ? o : { x: o.x - o.dir * o.len * .5, y: o.y };
      spr(IMG2.strike, f * 192, STK[o.id] * 128, 192, 128, c.x, c.y, 96, 64, k, o.dir > 0); return; }
    const n = junk ? 4 : 6, f = Math.floor(t * (junk ? 5 : 8 + (o.st === 'flee' || o.dg > t ? 8 : 0)) + o.ph * 3) % n;
    spr(IMG2.swim, f * 192, row * 128, 192, 128, o.x, o.y, 96, 64, k, o.dir > 0, hooked ? Math.sin(t * 3) * .3 : 0, o.al); }
  function anFrame(t) { const A = AN[ST.an], n = Math.floor((t - ST.a0) * A[2]); if (!A[3] && n >= A[1]) { ST.an = ST.ph === 'reel' ? 'reel' : 'idle'; ST.a0 = t; return anFrame(t); } return [A[0], A[3] ? n % A[1] : n, A[4]]; }
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  function drawAll() { const t = now(), A = ST.API, bg = IMG2[bgKey()]; if (!bg) return;
    ctx.drawImage(bg, 0, 0, W, H);
    { const [row, f, tips] = anFrame(t); spr(IMG2.angler_side, f * 256, row * 256, 256, 256, SEAT[0], SEAT[1], 128, 226, 1); const tp = tips[f] || tips[0], tx = SEAT[0] - 128 + tp[0], ty = SEAT[1] - 226 + tp[1]; ST.tip[0] += (tx - ST.tip[0]) * .25; ST.tip[1] += (ty - ST.tip[1]) * .25; }
    for (const o of ST.fish) if (o.st !== 'hooked') drawFish(o, t);
    // 摆动时的瞄准虚线
    if (ST.ph === 'swing') { ctx.save(); ctx.strokeStyle = 'rgba(255,250,220,.28)'; ctx.lineWidth = 2; ctx.setLineDash([6, 10]); ctx.lineDashOffset = -t * 40; ctx.beginPath(); ctx.moveTo(ST.hx, ST.hy); ctx.lineTo(ST.hx + Math.sin(ST.th) * 260, ST.hy + Math.cos(ST.th) * 260); ctx.stroke(); ctx.restore(); }
    ctx.strokeStyle = 'rgba(250,250,240,.92)'; ctx.lineWidth = ST.ph === 'reel' && ST.hk ? 2 : 1.4; ctx.beginPath(); ctx.moveTo(ST.tip[0], ST.tip[1]); ctx.lineTo(ST.hx, ST.hy); ctx.stroke();
    if (ST.hk) drawFish(ST.hk, t); else spr(IMG2.hook, (Math.floor(t * 4) % 2) * 64, 64, 64, 64, ST.hx, ST.hy, 32, 8, .95, false, -ST.th);
    for (let i = ST.fxs.length - 1; i >= 0; i--) { const q = ST.fxs[i], f = Math.floor((t - q.t0) * 12); if (f >= 6) { ST.fxs.splice(i, 1); continue; } spr(IMG2.fx, f * 96, q.r * 96, 96, 96, q.x, q.y, 48, 77, 1); }
    for (let i = ST.bub.length - 1; i >= 0; i--) { const b = ST.bub[i], y = b.y - (t - b.t0) * b.v; if (y < WY + 2) { ST.bub.splice(i, 1); continue; } ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x + Math.sin(t * 3 + b.ph) * 3, y, b.r, 0, 7); ctx.stroke(); }
    ctx.drawImage(IMG2.fg, (Math.floor(t * 5) % 4) * 1280, 0, 1280, 720, 0, 0, W, H);
    for (let i = ST.pops.length - 1; i >= 0; i--) { const q = ST.pops[i], u = (t - q.t0) / 1.3; if (u >= 1) { ST.pops.splice(i, 1); continue; } ctx.save(); ctx.globalAlpha = 1 - u * u; ctx.font = `30px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(q.s, q.x, q.y - u * 60, q.c, '#0a1c30', 6); ctx.restore(); }
    // 顶上：第几关 / 分数 / 时间
    const tg = TG(ST.lv), left = Math.max(0, ST.tEnd - t), inter = ST.ph === 'inter', bw = 520, bx = W / 2 - bw / 2;
    ctx.fillStyle = 'rgba(10,20,32,.62)'; rr(bx - 16, 12, bw + 32, 84, 16); ctx.fill();
    ctx.font = `30px ${BRUSH}`; ctx.textAlign = 'left'; textOutline('第 ' + ST.lv + ' 关', bx, 48, '#ffe39a', '#0a1420', 5);
    ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'right'; textOutline('鱼获 ' + ST.total + ' / 目标 ' + tg, bx + bw, 46, ST.total >= tg ? '#b8f0a0' : '#fff3d6', '#0a1420', 4);
    ctx.fillStyle = 'rgba(255,255,255,.16)'; rr(bx, 62, bw, 16, 8); ctx.fill(); const u = inter ? 1 : left / LVT; ctx.fillStyle = u < .25 ? '#ff7a5a' : '#f2c860'; rr(bx, 62, Math.max(16, bw * u), 16, 8); ctx.fill();
    ctx.font = `600 16px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#1c1206'; if (!inter) ctx.fillText(Math.ceil(left) + ' 秒', bx + bw / 2, 76);
    ctx.drawImage(IMG2.ui, UI.bait[0], UI.bait[1], UI.bait[2], UI.bait[3], 22, 18, UI.bait[2] * 1.15, UI.bait[3] * 1.15); spr(IMG2.hook, 0, 64, 64, 64, 22 + 36 * 1.15, 18 + 10 * 1.15, 32, 8, .62); ctx.font = `600 24px ${FONT}`; ctx.textAlign = 'center'; textOutline('饵 × ' + Math.max(0, A.left()), 22 + 117 * 1.15, 18 + 37 * 1.15, '#fff3c8', '#1c2a0c', 4);
    if (!(A.ui && A.ui('button_paper', QUIT.x, QUIT.y))) { ctx.fillStyle = 'rgba(240,225,190,.9)'; ctx.fillRect(QUIT.x, QUIT.y, QUIT.w, QUIT.h); } ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center'; textOutline('收竿', QUIT.x + 75, QUIT.y + 32, '#fff3d6', '#3a1a06', 4);
    if (ST.msg && t < ST.msgT) { ctx.font = `44px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(ST.msg, W / 2, 270, '#ffe39a', '#0a1420', 6); }
    ctx.textAlign = 'center'; const big = (a, col) => { ctx.font = `30px ${BRUSH}`; textOutline(a, W / 2 - 40, H - 54, col || '#ffe9b0', '#0a1c30', 6); }, sub = b => { ctx.font = `600 17px ${FONT}`; textOutline(b, W / 2 - 40, H - 24, '#f2ead2', '#0a1c30', 4); };
    if (inter) { big('过关！下一关目标 ' + TG(ST.lv + 1), '#c8f0a0'); sub('钩摆得更快，鱼也更机灵了'); }
    else if (ST.ph === 'swing') { big('点屏幕，把钩甩出去'); sub(ST.lv === 1 ? '钩摆到对准鱼的时候点；深处的鱼更值钱，草鞋枯枝只值 2 分还特别沉' : '第 ' + ST.lv + ' 关：到时间总分够 ' + tg + ' 才能进下一关'); }
    else if (ST.ph === 'reel' && ST.hk) { big(ST.hk.f.junk ? '钩到杂物了……连点屏幕快点拉上来' : '连点屏幕，拉得更快！', ST.hk.f.junk ? '#ffb89a' : '#ffe9b0'); }
  }
  const OV = { draw() { if (ON) try { drawAll(); } catch (e) {} } };

  // ---------- 一趟 ----------
  function startLevel(n) { ST.lv = n; ST.fish.length = 0; const nf = Math.max(6, 10 - Math.floor(n / 2)), nj = Math.min(5, 1 + Math.floor(n / 2)); for (let i = 0; i < nf; i++) spawn(false, false); for (let i = 0; i < nj; i++) spawn(false, true);
    ST.ph = 'swing'; ST.sw = rnd(0, 6); ST.L = L0; ST.hk = null; ST.tEnd = now() + LVT; { const f = ST.API.F(); f.r175_used = (f.r175_used || 0) + 1; } flash('第 ' + n + ' 关　目标 ' + TG(n), 1.6); setAn('idle'); }
  function land(o, t) { const f = o.f, p = PTS(f); ST.total += p; ST.got.push(f); ST.pops.push({ s: '+' + p + ' ' + f.name, x: ST.tip[0] - 60, y: ST.tip[1] + 60, c: f.junk ? '#c9c2b0' : p >= 40 ? '#ffd27a' : '#fff3d6', t0: t }); ST.fxs.push({ r: 2, x: ST.tip[0] - 20, y: WY + 6, t0: t }); bubble(ST.tip[0] - 20, WY + 14, 8);
    ST.fish.splice(ST.fish.indexOf(o), 1); snd(f.junk ? 'ui_move' : 'ui_confirm', .6); setAn(f.junk ? 'miss' : 'land'); }
  async function finish(API, quit) { const f = API.F(), G = API.G, real = ST.got.filter(x => !x.junk), book = f.r175_book = f.r175_book || {}, played = ST.lv;
    for (const x of ST.got) if (x.junk && book[x.id] == null) book[x.id] = 0;
    // 第一次钓到的鱼种（还有老龟、灵鲵）出鱼卡，按原来的流程走
    const seen = {}, firsts = [], rest = []; for (const x of real) { if ((book[x.id] == null || x.id === 'turtle') && !seen[x.id]) { seen[x.id] = 1; firsts.push(x); } else rest.push(x); }
    for (const x of firsts) { await API.showCard(x); G.phase = 'pond'; }
    const keepN = played * 2 + 1, keep = rest.filter(x => x.id !== 'salamander' && x.id !== 'turtle').sort((a, b) => PTS(b) - PTS(a)).slice(0, keepN), cnt = {};
    for (const x of keep) { const size = x.sz ? x.sz[0] + Math.random() * (x.sz[1] - x.sz[0]) : 0; book[x.id] = Math.max(book[x.id] || 0, Math.round(size)); f.r175_wins = (f.r175_wins || 0) + 1; addItem('fish_' + x.id, 1); G.caught.push(x.id); cnt[x.name] = (cnt[x.name] || 0) + 1; }
    f.r192_best = Math.max(f.r192_best || 0, ST.total); f.r192_lv = Math.max(f.r192_lv || 0, played);
    const list = Object.keys(cnt).map(k => k + ' ×' + cnt[k]).join('、'), back = rest.length - keep.length;
    await narrate((quit ? '收竿。' : '时间到，这一关没够数——收竿。') + '这一趟打到第 ' + played + ' 关，鱼获 ' + ST.total + ' 分。');
    if (keep.length) await narrate('鱼篓里留下：' + list + '。' + (back > 0 ? '（鱼篓装不下，另外 ' + back + ' 条放回潭里了。）' : ''));
    else if (!firsts.length) await narrate('鱼篓是空的。'); }
  window.R190_POND = async function (API) {
    if (window.R192_OFF) return OLD(API);
    const f = API.F(), G = API.G; ST.API = API;
    if (!f.r192_tut) { f.r192_tut = 1;
      await narrate('（钓鱼换了玩法：钩子吊在竿尖下面左右摆，点一下屏幕就顺着那个方向甩出去，碰到哪条鱼就钩住哪条，自己拉回来。）');
      await narrate('（一关 35 秒，屏幕上面有目标分。鱼越值钱分越高，深水的鱼更值钱但拉得慢；草鞋、枯枝只值 2 分还特别沉。收线时连点屏幕能拉快一点。）');
      await narrate('（到时间总分够了就进下一关，越往后越难；不够就收竿。一关用一份饵。左下角可以随时收竿。）'); }
    preload(); if (!ready()) { toast('钓具还在拿……稍等一下再点', 1500); return; }
    ST.total = 0; ST.got.length = 0; ST.bub.length = 0; ST.fxs.length = 0; ST.pops.length = 0; ST.msg = ''; ST.tip = TIP0.slice(); ST.predT = 0; P.down = false; ST.shot = 0; ST.boost = 0;
    const hud0 = S.hud; S.hud = false; world.locked = true; G.on = true; G.phase = 'pond'; G.caught = []; G.streak = 0; G.cat = null; G.card = null; G.fv = false; G.sh = null;
    if (S.overlay.indexOf(OV) < 0) S.overlay.unshift(OV); ON = true; startLevel(1); let last = now(), spT = 1, tapSeen = P.taps, quit = false;
    try {
      while (true) { await nextFrame(); const t = now(), dt = Math.min(.05, t - last); last = t;
        if ((typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice)) { tapSeen = P.taps; ST.tEnd += dt; continue; }
        let tap = false; if (P.taps !== tapSeen) { tapSeen = P.taps; if (inQuit()) { quit = true; break; } tap = true; }
        const tip = ST.tip;
        if (ST.ph === 'inter') { if (t >= ST.interT) startLevel(ST.lv + 1); ST.hx = tip[0]; ST.hy = tip[1] + L0; continue; }
        if (ST.ph === 'swing') { ST.sw += dt * (1.45 + .2 * ST.lv); ST.th = (TH0 + TH1) / 2 + (TH1 - TH0) / 2 * Math.sin(ST.sw); ST.L = L0; if (tap) { ST.ph = 'shoot'; ST.shot++; setAn('lift'); snd('sfx_swing', .5); } }
        else if (ST.ph === 'shoot') { ST.L += 720 * dt; }
        else if (ST.ph === 'reel') { if (tap) ST.boost = t + .32; const o = ST.hk, v = reelV(o) * (o && ST.boost > t ? 1.7 : 1); ST.L -= v * dt; if (o && Math.random() < dt * 6) bubble(ST.hx, ST.hy, 1);
          // 活饵：拉小鱼经过掠食鱼身边，可能被吞
          if (o && SMALL[o.id] && !o.bit) for (const q of ST.fish) { if (q.st !== 'swim' || !LAY[q.id][3]) continue; if (Math.hypot(q.x - o.x, q.y - o.y) < 150) { o.bit = 1; if (Math.random() < .45) { q.st = 'lunge'; q.tg = o; } break; } }
          if (ST.L <= L0) { ST.L = L0; if (ST.hk) land(ST.hk, t); else setAn('idle'); ST.hk = null; ST.ph = 'swing'; } }
        ST.hx = tip[0] + Math.sin(ST.th) * ST.L; ST.hy = tip[1] + Math.cos(ST.th) * ST.L;
        if (ST.hk) { ST.hk.x = ST.hx; ST.hk.y = ST.hy; }
        if (ST.ph === 'shoot') { let got = null; if (ST.hy > WY) for (const o of ST.fish) if (o.st === 'swim' && hit(o)) { got = o; break; }
          if (got) { got.st = 'hooked'; ST.hk = got; ST.ph = 'reel'; setAn('reel'); ST.fxs.push({ r: 2, x: ST.hx, y: ST.hy, t0: t }); bubble(ST.hx, ST.hy, 6); snd('sfx_hit', .5); if (got.f.junk) flash(got.id === 'sandal' ? '一只破草鞋……' : '一截枯枝……', 1); }
          else if (ST.hx < X0 || ST.hx > X1 || ST.hy > Y1) { ST.ph = 'reel'; setAn('reel'); } }
        for (const o of ST.fish) if (o.st !== 'hooked') stepFish(o, dt, t);
        for (let i = ST.fish.length - 1; i >= 0; i--) if (ST.fish[i].dead) ST.fish.splice(i, 1);
        spT -= dt; if (spT <= 0) { const nj = ST.fish.filter(o => o.f.junk).length, nf = ST.fish.length - nj; if (nj < Math.min(5, 1 + Math.floor(ST.lv / 2))) spawn(true, true); else if (nf < Math.max(6, 10 - Math.floor(ST.lv / 2))) spawn(true, false); spT = rnd(.8, 1.8); }
        // 时间到：手上还拉着的这一条算完再结算
        if (t >= ST.tEnd && ST.ph === 'swing') { if (ST.total >= TG(ST.lv) && API.left() > 0) { ST.ph = 'inter'; ST.interT = t + 2.2; snd('ui_confirm', .7); } else break; }
      }
      const noBait = !quit && ST.total >= TG(ST.lv) && API.left() <= 0; G.phase = 'pond'; ST.ph = 'inter'; ST.interT = 1e12;
      if (noBait) { await narrate('第 ' + ST.lv + ' 关也过了——可饵用完了。'); quit = true; }
      await finish(API, quit);
      if (API.left() <= 0) await narrate('饵用完了。潭里的鱼也该歇歇了——歇一觉再来。');
    } finally { ON = false; const i = S.overlay.indexOf(OV); if (i >= 0) S.overlay.splice(i, 1); G.on = false; G.phase = ''; G.card = null; world.locked = false; S.hud = hud0; P.down = false; }
  };
  window.R192_ST = ST; window.R192_P = P; window.R192_TG = TG;
})();
