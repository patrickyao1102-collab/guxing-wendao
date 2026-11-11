// ================= R193 · 潭边垂钓（独立窗口）=================
// 作者 11-11 定的设计：看水面猜鱼、靠耐心和钓具的概率游戏（数据和概率在 r193_data.js）。
// 流程：钓具匣选竿 / 线 / 饵 → 按住蓄力抛竿 → 等（征兆）→ 看漂 → 往上一划提竿 → 搏鱼（按住收、松手放、往鱼反方向拖）→ 出水。
// 美术等 Codex R193F；没到之前 window.R193_ON 不开，钓台还走旧的。图没到时这里只画占位，不上线。
(function () {
  if (typeof S === 'undefined' || typeof ctx === 'undefined' || !window.R193) return;
  const D = window.R193, now = () => performance.now() / 1000, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const WY0 = 250, NEAR = 650, FAR = 312;   // 水面从 y=250 往下；抛近落在 650，抛满落在 312
  const LAYN = ['浅水', '潭心', '深水'];
  // ---------- 物品 ----------
  for (const b of D.BAITS) ITEM_DB[b.id] = Object.assign(ITEM_DB[b.id] || {}, { name: b.name, cat: '钓具', sell: 0, desc: b.k + '饵。' + (b.like.length ? '特别招' + b.like.map(i => D.fish(i).name).join('、') + '。' : '什么鱼都吃一点。') + '（' + b.from + '）' });
  for (const f of D.FISH.concat(D.JUNK)) if (f.isNew && !f.junk) ITEM_DB['fish_' + f.id] = Object.assign(ITEM_DB['fish_' + f.id] || {}, { name: f.name, sell: f.sell || 0, cat: '食材', desc: '在云海后庭的钓鱼潭里钓到的' + f.name + '。' });
  const F = () => (S.flags = S.flags || {});
  const gear = () => { const f = F(); if (!f.r193_gear) f.r193_gear = { rods: ['rod_old'], lines: ['line_hemp'], rod: 'rod_old', line: 'line_hemp', bait: 'bait_worm' }; return f.r193_gear; };
  const baits = () => D.BAITS.filter(b => itemCount(b.id) > 0);
  const SHI = () => (F().qz_shi || '午');
  // 天气：每天每个时辰定一次（卯时四成起雾，一成半下雨，子时偶尔雷雨）
  function wx() { const f = F(), k = (f.qz_day || 1) + SHI(); f.r193_wx = f.r193_wx || {}; if (!f.r193_wx[k]) { const s = SHI(), r = Math.random(); f.r193_wx[k] = s === '子' && r < .06 ? '雷雨' : r < .15 ? '雨' : s === '卯' && r < .55 ? '雾' : '晴'; } return f.r193_wx[k]; }
  // ---------- 输入 ----------
  const P = { x: 0, y: 0, down: false, x0: 0, y0: 0, t0: 0, taps: 0, swUp: 0, swDn: 0, key: 0 }; let ON = false;
  const toL = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
  window.addEventListener('pointerdown', e => { if (!ON) return; const [x, y] = toL(e); Object.assign(P, { x, y, x0: x, y0: y, t0: now(), down: true }); P.taps++; }, true);
  window.addEventListener('pointermove', e => { if (!ON) return; const [x, y] = toL(e); P.x = x; P.y = y; if (P.down && P.y0 - y > 46 && now() - P.t0 < .6) { P.swUp++; P.t0 = -9; } if (P.down && y - P.y0 > 60 && now() - P.t0 < .6) { P.swDn++; P.t0 = -9; } }, true);
  for (const ev of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(ev, () => { P.down = false; }, true);
  window.addEventListener('keydown', e => { if (!ON) return; if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { P.swUp++; P.key = 1; e.preventDefault(); e.stopPropagation(); } }, true);
  window.addEventListener('keyup', e => { if (!ON) return; if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') P.key = 0; }, true);
  const held = () => P.down || P.key;
  const inR = (r, x = P.x, y = P.y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  // ---------- 状态 ----------
  const ST = { ph: 'gear', t0: 0, pow: 0, fx: 640, fy: 500, fk: 1, layer: 0, plan: null, signs: [], nextSign: 0, cap: null, flt: 'idle', flt0: 0, seq: null, win: 0, fight: null, msg: '', msgT: 0, log: [], fxs: [] };
  window.R193_ST = ST; window.R193_P = P;
  const say1 = (m, s = 2) => { ST.msg = m; ST.msgT = now() + s; };
  const setFlt = a => { ST.flt = a; ST.flt0 = now(); };
  const fxAdd = (k, x, y, s = 1) => ST.fxs.push({ k, x, y, s, t0: now() });
  const BTN = { quit: { x: 24, y: H - 74, w: 160, h: 54 }, reel: { x: 24, y: H - 74, w: 160, h: 54 } };
  const ART = window.R193_ART || null;   // 素材到了以后由 r193_art.js 提供 draw(ST, ...)
  // ---------- 占位画法（素材没到时开发用） ----------
  function drawTmp(t) { ctx.fillStyle = '#9cc9d6'; ctx.fillRect(0, 0, W, WY0); const g = ctx.createLinearGradient(0, WY0, 0, H); g.addColorStop(0, '#3f8ea0'); g.addColorStop(1, '#1d4f60'); ctx.fillStyle = g; ctx.fillRect(0, WY0, W, H - WY0);
    for (const q of ST.fxs) { const u = (t - q.t0) / 1.6; if (u > 1) continue; ctx.strokeStyle = `rgba(255,255,255,${.6 * (1 - u)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(q.x, q.y, 10 + 60 * u * q.s, (10 + 60 * u * q.s) * .3, 0, 0, 7); ctx.stroke(); }
    const ten = ST.fight ? clamp(ST.fight.ten / ST.fight.cap, 0, 1.2) : 0, tipX = 1000 - ten * 60, tipY = 170 + ten * 90;
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(1240, 720); ctx.quadraticCurveTo(1150 - ten * 40, 400 + ten * 60, tipX, tipY); ctx.stroke();
    if (ST.ph !== 'gear' && ST.ph !== 'aim') { const fy = ST.fy + floatDy(t); ctx.strokeStyle = ten > .8 ? '#ff6a4a' : ten > .4 ? '#ffd27a' : 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(ST.fx, fy); ctx.stroke();
      if (ST.ph !== 'fight') { ctx.fillStyle = '#e8462a'; ctx.fillRect(ST.fx - 3 * ST.fk, fy - 26 * ST.fk, 6 * ST.fk, 26 * ST.fk); } }
    if (ST.ph === 'aim' && held()) { ctx.fillStyle = 'rgba(255,255,255,.5)'; const y = NEAR - (NEAR - FAR) * ST.pow; ctx.beginPath(); ctx.ellipse(640, y, 30, 9, 0, 0, 7); ctx.fill(); } }
  // 浮漂上下：idle 轻轻浮动；dot 点一下；dun 顿；black 整支没入；rise 往上浮；drift 横移；sink 慢慢沉
  function floatDy(t) { const u = t - ST.flt0, k = ST.fk;
    switch (ST.flt) { case 'dot': return Math.max(0, Math.sin(Math.min(1, u / .25) * Math.PI)) * 6 * k; case 'dun': case 'dun2': return (u < .12 ? u / .12 : Math.max(0, 1 - (u - .12) / .5)) * 12 * k;
      case 'black': case 'yank': return Math.min(1, u / .18) * 34 * k; case 'rise': return -Math.min(1, u / .6) * 12 * k; case 'sink': case 'sink_slow': return Math.min(1, u / 1.2) * 20 * k;
      case 'drift': case 'drift_far': case 'dun_drag': case 'drag_slow': return 4 * k; case 'still': return 0; default: return Math.sin(t * 2.2) * 1.5 * k; } }
  function drawUI(t) {
    ctx.textAlign = 'center';
    if (ST.ph === 'gear') { const g = gear(), ro = D.rod(g.rod), li = D.line(g.line), b = D.bait(g.bait);
      ctx.fillStyle = 'rgba(20,14,8,.78)'; ctx.fillRect(300, 150, 680, 380); ctx.font = `34px ${BRUSH}`; ctx.fillStyle = '#ffe9b0'; ctx.fillText('钓具匣', 640, 206);
      ctx.font = `600 22px ${FONT}`; ctx.fillStyle = '#fff3d6';
      ctx.fillText('竿：' + ro.name + '　　线：' + li.name + '（承重 ' + li.cap + '）', 640, 262);
      ctx.fillText('饵：' + (b ? b.name + ' ×' + itemCount(b.id) : '没有饵了'), 640, 302);
      ctx.font = `18px ${FONT}`; ctx.fillStyle = '#d8ccb0'; ctx.fillText(SHI() + '时 · ' + wx() + '　　点竿 / 线 / 饵那一行可以换', 640, 340);
      ctx.font = `30px ${BRUSH}`; ctx.fillStyle = '#ffe39a'; ctx.fillText(b ? '点这里，去钓台' : '先去弄点饵', 640, 470); }
    if (ST.ph === 'aim') { ctx.font = `28px ${BRUSH}`; ctx.fillStyle = '#ffe9b0'; ctx.fillText(held() ? '蓄力…… ' + LAYN[layerOf(ST.pow)] : '按住蓄力，松手抛竿', 640, H - 40); }
    if (ST.ph === 'wait') { ctx.font = `600 17px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText(LAYN[ST.layer] + ' · 往下一划收竿重抛', 640, H - 24); }
    if (ST.ph === 'fight' && ST.fight) { ctx.font = `600 17px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('按住收线 · 它猛冲时松手 · 往它反方向拖', 640, H - 24); }
    if (ST.cap && t - ST.cap.t0 < 3.2) { ctx.save(); ctx.globalAlpha = Math.min(1, (3.2 - (t - ST.cap.t0)) / .6); ctx.font = `24px ${BRUSH}`; ctx.fillStyle = '#f6edd6'; ctx.fillText(ST.cap.s, 640, 214); ctx.restore(); }
    if (ST.msg && t < ST.msgT) { ctx.font = `40px ${BRUSH}`; ctx.fillStyle = '#ffe39a'; ctx.fillText(ST.msg, 640, 380); }
    if (ST.ph !== 'fight') { ctx.fillStyle = 'rgba(240,225,190,.92)'; ctx.fillRect(BTN.quit.x, BTN.quit.y, BTN.quit.w, BTN.quit.h); ctx.font = `600 22px ${FONT}`; ctx.fillStyle = '#3a1a06'; ctx.fillText(ST.ph === 'gear' ? '不钓了' : '收竿', BTN.quit.x + 80, BTN.quit.y + 35); }
  }
  const OV = { draw() { if (!ON) return; try { const t = now(); if (ART && ART.ready()) ART.draw(ST, t, { floatDy, held, gear, D, BTN }); else { drawTmp(t); drawUI(t); } } catch (e) { console.warn('R193 draw', e); } } };
  const layerOf = p => p < .38 ? 0 : p < .72 ? 1 : 2;
  // ---------- 流程 ----------
  const frame = () => nextFrame();
  const busy = () => (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice);
  async function waitTap() { const s = P.taps; while (P.taps === s) await frame(); }
  function gearRows() { return { rod: { x: 320, y: 236, w: 640, h: 36 }, bait: { x: 320, y: 278, w: 640, h: 36 }, go: { x: 460, y: 430, w: 360, h: 60 } }; }
  function cycle(list, cur) { const i = list.indexOf(cur); return list[(i + 1) % list.length]; }
  async function gearScreen() { ST.ph = 'gear'; const g = gear();
    while (true) { await frame(); if (busy()) continue; await waitTap(); if (inR(BTN.quit)) return false; const R = gearRows();
      if (inR(R.rod)) { if (P.x < 640) g.rod = cycle(g.rods, g.rod); else g.line = cycle(g.lines, g.line); continue; }
      if (inR(R.bait)) { const bs = baits().map(b => b.id); if (bs.length) g.bait = cycle(bs, bs.includes(g.bait) ? g.bait : bs[bs.length - 1]); continue; }
      if (inR(R.go)) { if (!baits().length) { say1('没有饵了', 1.4); continue; } if (!itemCount(g.bait)) g.bait = baits()[0].id; return true; } } }
  async function aim() { ST.ph = 'aim'; ST.pow = 0; const g = gear(), maxP = D.rod(g.rod).far >= 2 ? 1 : .71;
    while (true) { await frame(); if (busy()) continue;
      if (!P.down) continue;
      if (inR(BTN.quit, P.x0, P.y0)) { while (P.down) await frame(); return false; }
      const t0 = now(); while (P.down) { await frame(); const u = (now() - t0) / 1.6; ST.pow = Math.min(maxP, u < 1 ? u : 2 - u > 0 ? Math.max(.05, 2 - u) : .05); }   // 蓄满会往回落，要在最远时松手
      ST.layer = layerOf(ST.pow); ST.fy = NEAR - (NEAR - FAR) * ST.pow; ST.fx = 640 + rnd(-90, 90) * (1 - ST.pow * .5); ST.fk = 1 - ST.pow * .55;
      try { playSnd('sfx_swing', .5); } catch (e) {}
      fxAdd('splash', ST.fx, ST.fy, ST.fk); setFlt('idle'); return true; } }
  // 等鱼：征兆每 4–8 秒一个；往下一划 / 点「收竿」就收竿重抛（不费饵）
  async function waitBite() { const g = gear(), ro = D.rod(g.rod), o = { bait: g.bait, shi: SHI(), layer: ST.layer, wx: wx(), sens: ro.sens, once: F().r175_turtle ? { turtle: 1 } : null };
    ST.plan = D.plan(o); ST.signs = []; ST.ph = 'wait'; ST.t0 = now(); ST.nextSign = ST.t0 + rnd(2.5, 5); const sd = P.swDn, tp = P.taps;
    while (true) { await frame(); const t = now(); if (busy()) { ST.t0 += 1 / 60; ST.nextSign += 1 / 60; continue; }
      if (P.swDn !== sd || (P.taps !== tp && inR(BTN.quit, P.x0, P.y0))) return 'recast';
      const el = t - ST.t0;
      if (ST.plan.fish && el >= ST.plan.at) return 'bite';
      if (!ST.plan.fish && el >= D.WAIT_MAX) { say1('……没动静', 1.4); return 'recast'; }
      if (t >= ST.nextSign && !(ST.plan.fish && ST.plan.fish.bite && ST.plan.fish.bite.still && el > ST.plan.at - 8)) { const k = D.sign(o, ST.plan); ST.signs.push(k); ST.cap = { s: D.SIGNS[k].name, t0: t, k }; showSign(k); ST.nextSign = t + rnd(4, 8); } } }
  function showSign(k) { const x = ST.fx + rnd(-140, 140), y = clamp(ST.fy + rnd(-60, 30), WY0 + 20, H - 40); if (/ripple|bubbles|jump|scatter|whirl|weed|lotus|gold|silver|petals/.test(k)) fxAdd(k, x, y, ST.fk + .3); }
  // 看漂 + 提竿：试口时提 = 空竿（鱼惊走）；真咬钩后 0.8 秒内提（湘妃竹竿多 0.3 秒）；晚了 = 偷饵
  async function biteAndStrike() { const f = ST.plan.fish, seq = D.biteSeq(f), ro = D.rod(gear().rod), winLen = .8 + (ro.sens >= 3 ? .3 : 0);
    ST.ph = 'bite'; ST.realT = 0; let su = P.swUp; const early = () => P.swUp !== su;
    if (seq.still) { setFlt('still'); const t0 = now(); while (now() - t0 < rnd(3, 5)) { await frame(); if (early()) return 'early'; } }
    for (const a of seq.pre) { setFlt(a === 'none' ? 'still' : 'dot'); fxAdd('ring', ST.fx, ST.fy, ST.fk * .6); const t0 = now(), d = rnd(.45, .9); while (now() - t0 < d) { await frame(); if (early()) return 'early'; } setFlt('idle'); }
    if (seq.pause) { const t0 = now(); while (now() - t0 < .8) { await frame(); if (early()) return 'early'; } }
    setFlt(seq.real); ST.realT = now(); fxAdd('ring', ST.fx, ST.fy, ST.fk); const t0 = now();
    while (now() - t0 < winLen) { await frame(); if (early()) return 'hook'; }
    return 'late'; }
  async function fight() { const g = gear(), f = ST.plan.fish; ST.fight = D.fightInit(f, g.rod, g.line); ST.ph = 'fight'; let last = now(), dir = 0;
    try { playSnd('sfx_hit', .5); } catch (e) {}
    while (true) { await frame(); const t = now(), dt = Math.min(.05, t - last); last = t; if (busy()) continue;
      dir = P.down && Math.abs(P.x - P.x0) > 40 ? Math.sign(P.x - P.x0) : 0;
      const r = D.fightStep(ST.fight, dt, held(), dir); const s = ST.fight;
      ST.fx = 640 + s.dir * 180 * Math.min(1, s.dist) * (s.burst > 0 ? 1.2 : .7) * (1 - ST.pow * .4) + Math.sin(t * 2) * 20; ST.fy = clamp(NEAR - (NEAR - FAR) * Math.min(1, s.dist) * (.4 + ST.pow * .6), WY0 + 30, NEAR);
      if (s.burst > 0 && Math.random() < dt * 8) fxAdd('burst', ST.fx, ST.fy, ST.fk + .4);
      if (r) return r; } }
  async function landed(API, f) { const card = Object.assign({}, f, { r: f.junk ? '' : D.TIERS[f.t] });
    const book = F().r193_sg = F().r193_sg || {}; if (!f.junk) { const s = new Set(book[f.id] || []); ST.signs.forEach(k => s.add(k)); book[f.id] = [...s].slice(0, 8); }
    fxAdd('leap', ST.fx, ST.fy, 1.2); try { playSnd('ui_confirm', .6); } catch (e) {}
    { const t0 = now(); while (now() - t0 < .7) await frame(); }
    if (f.id === 'shrimp') addItem('bait_shrimp', 1);
    await API.showCard(card); API.G.phase = 'pond';
    ST.log.push(f.name); }
  const FAILS = { early: '提早了，鱼吓跑了', late: '饵被吃光了', snap: '线断了——', lost: '脱钩了' };
  window.R193_ANGLE = async function (API) {
    const f = F(), G = API.G;
    if (!f.r193_kit) { f.r193_kit = 1; addItem('bait_worm', 12); addItem('bait_dough', 6); gear();
      await narrate('钓台柱子边多了一只旧木匣，匣盖上刻着一个「松」字。里面是那根旧竹竿、一卷麻线，还有一罐蚯蚓、一包面团。');
      await narrate('（钓鱼换了玩法：看不见水下，只能看浮漂、看水面、看落在竿上的小东西，猜咬钩的是什么。）');
      await narrate('（按住蓄力、松手抛竿，越用力抛得越远越深。等浮漂真沉下去时往上一划提竿；之前那几下轻点是在试口，提了就空。）');
      await narrate('（鱼上钩后按住收线；水面一鼓、它要猛冲时松手，线差的话大鱼一冲就断。）'); }
    const hud0 = S.hud; S.hud = false; world.locked = true; G.on = true; G.phase = 'pond'; G.caught = []; G.card = null; G.fv = false; G.sh = null;
    if (S.overlay.indexOf(OV) < 0) S.overlay.unshift(OV); ON = true; ST.log = [];
    try {
      outer: while (await gearScreen()) {
        while (true) {
          if (!itemCount(gear().bait)) { say1('这种饵用完了', 1.4); break; }
          if (!(await aim())) break;
          const w = await waitBite(); if (w === 'recast') continue;
          const r = await biteAndStrike(); const fish = ST.plan.fish;
          if (r !== 'early') addItem(gear().bait, -1);   // 鱼咬了钩就耗饵；提早只是吓跑
          if (r !== 'hook') { say1(FAILS[r], 1.6); setFlt('idle'); await sleepS(1); continue; }
          const res = await fight(); ST.fight = null;
          if (res === 'land') { await landed(API, fish); continue; }
          const f2 = fish; say1(res === 'snap' ? (f2.t >= 3 ? '线断了——那一下的力气，' + D.line(gear().line).name + '吃不住' : '线断了') : FAILS.lost, 2.2); fxAdd('tail', ST.fx, ST.fy, 1.4); await sleepS(1.6);
        } }
      if (ST.log.length) await narrate('收竿。这一趟钓上来：' + ST.log.join('、') + '。');
    } finally { ON = false; const i = S.overlay.indexOf(OV); if (i >= 0) S.overlay.splice(i, 1); G.on = false; G.phase = ''; G.card = null; world.locked = false; S.hud = hud0; P.down = false; ST.fight = null; }
  };
  async function sleepS(s) { const t0 = now(); while (now() - t0 < s) await frame(); }
})();
