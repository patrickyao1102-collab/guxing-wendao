// ================= R326 · 回忆在地图上演（Codex R313「回忆_地图版」）（只进测试版）=================
// 作者 11-16：「立绘定动画是在那个地图上就直接演绎的……回忆的时候，可以有这种直接切成广角大地图就能看得见的，
//   它场景和什么一定是跟我们的场景匹配的呀。」——不再弹整屏插画：说到那句话时，镜头切到出事那间屋子的广角（压暗、偏蓝的夜色），
//   人物小人在原地演一遍，点一下可跳过，演完回到对话。
//   01 秦老初七夜：万宝楼后院库房摸黑进门、开匣、调包、对封条 → 二楼雅间踮脚把真剑挂上北墙第四个空位
//   03 五两银子的摆件（失败结局）：雅间里管事指墙、伙计摘下第四把剑递出、管事接剑——剑鞘上结了一层白霜
//   07 阿蘅的地窖：悦来大堂后厨门边掀开活门、抱出酒坛拂灰、玳瑁义甲碰了坛口
//   13 贺九章那一夜：云来二楼走廊捂肩踉跄、身后一路血点，推开天字一号、回身闩门
(function () {
  if (typeof say !== 'function' || typeof TMAPS === 'undefined') return;
  // 素材：[帧数, 帧宽, 帧高, 脚底x, 脚底y, 每帧毫秒]
  const AS = {"01a":[4,160,240,80,232,[220,220,220,650]],"01b":[6,160,240,80,232,[400,350,500,550,550,800]],"01c":[4,160,240,80,232,[220,220,220,650]],"01d":[4,160,240,80,232,[220,220,220,650]],"01e":[4,160,240,80,232,[220,220,220,650]],"01f":[4,400,144,200,136,[350,350,350,650]],"03a":[3,160,240,80,232,[220,220,650]],"03b":[5,192,240,96,232,[220,220,220,220,650]],"03c":[6,160,240,80,232,[250,250,350,350,400,900]],"03d":[6,72,20,36,10,[250,250,350,350,400,900]],"03e":[1,160,240,80,232,[0]],"07a":[4,160,240,80,232,[220,220,220,650]],"07b":[6,160,240,80,232,[220,220,220,220,220,650]],"07c":[2,160,240,80,232,[260,650]],"13a":[6,160,240,80,232,[180,180,180,180,180,180]],"13b":[4,160,240,80,232,[350,450,450,900]],"13c":[6,16,16,8,12,[90,90,90,110,160,0]],"08":[6,200,200,100,192,[500,350,500,550,700,1000]],"08p":[8,128,160,64,152,[150,150,150,150,150,150,150,150]],"08g":[1,200,160,100,150,[0]]};
  const PROP = { '01f': 1, '03d': 1, '13c': 1, '08p': 1, '08g': 1 };   // 不是人：不跟着地图人物放大
  const cache = {}; const sheet = k => { if (!cache[k]) { const im = new Image(); im.src = 'r326/' + k + '.webp'; cache[k] = im; } return cache[k]; };
  const ex = {}; const exImg = (k, src) => { if (!ex[k]) { const im = new Image(); im.src = src; ex[k] = im; } return ex[k]; };
  // 场景：哪张图、广角取景框（世界坐标）
  const SC = { store: { map: 'xt_wanbao_store', view: [0, 170, 1536, 864] }, appraisal: { map: 'xt_wanbao_vip', view: [0, 0, 1536, 864] },
    hall: { map: 'qy_inn', view: [288, 200, 1440, 810] }, corridor: { map: 'xt_inn_corr', view: [0, 150, 1280, 720] }, hill: { map: 'qy_shelter', view: [640, 20, 960, 540] } };
  // 一条轨：从 t0 起按 seq 逐帧（[帧号, 毫秒, x, y, 透明度]）；from~to 之间可见（t0 前停在第一帧，播完停在最后一帧）
  const seq = (a, pos, from, to, t0, alphas) => { const [n, , , , , du] = AS[a]; const out = []; for (let i = 0; i < n; i++) { const p = Array.isArray(pos[0]) ? pos[Math.min(i, pos.length - 1)] : pos; out.push([i, du[i], p[0], p[1], alphas ? alphas[i] : 1]); } return { a, t0, seq: out, from, to }; };
  const dur = a => AS[a][5].reduce((s, v) => s + v, 0);
  function build(id) {
    if (id === '01') { const shots = []; let t = 300; const tr = [];
      const A = t; tr.push(seq('01a', [[880, 974], [880, 952], [880, 930], [880, 908]], A, A + dur('01a'), A)); t += dur('01a');
      const Bt = t; tr.push(seq('01b', [[580, 670], [584, 670], [592, 670], [635, 670], [680, 670], [730, 670]], Bt, Bt + dur('01b'), Bt)); t += dur('01b');
      const Ct = t; tr.push(seq('01c', [670, 680], Ct, Ct + dur('01c'), Ct)); t += dur('01c');
      const Dt = t; tr.push(seq('01d', [930, 710], Dt, Dt + dur('01d') + 700, Dt)); t += dur('01d') + 700;
      // 剑匣：摸剑那四帧跟着开，调包时一直开着，对封条时已经合上
      const du = AS['01b'][5]; const cs = [[0, Bt, 766, 653, 1]]; for (let i = 0; i < 6; i++) cs.push([Math.min(3, i), du[i], 766, 653, 1]); cs.push([3, dur('01c'), 766, 653, 1]); cs.push([0, 99999, 766, 653, 1]);
      tr.push({ a: '01f', t0: 0, seq: cs, from: 0, to: t });
      shots.push({ sc: 'store', t0: 0, t1: t, tracks: tr, hide: ['xt_wanbao_store-clue-sword_case', 'xt_wanbao_store-clue-fake_sword'], front: { uid: 'xt_wanbao_store-inspection_table', cut: 655, below: 690 } });
      const s2 = t, E = s2 + 300; const sw = { 'xt_wanbao_vip-clue-wall_sword_4': tt => tt < E + 660 ? 'empty' : null };
      shots.push({ sc: 'appraisal', t0: s2, t1: E + dur('01e') + 900, tracks: [seq('01e', [768, 370], s2, E + dur('01e') + 900, E)], swap: sw });
      return shots; }
    if (id === '03') { const A = 300, Bt = A + dur('03a'), Ct = Bt + dur('03b'), end = Ct + dur('03c') + 600, f1 = Ct + 250;
      const tr = [seq('03a', [875, 435], 0, Ct, A), seq('03b', [[768, 370], [768, 370], [780, 394], [805, 422], [827, 432]], 0, f1, Bt),
        seq('03c', [885, 435], Ct, end, Ct), seq('03e', [827, 432], f1, end, f1), seq('03d', [889, 373], f1, end, Ct)];
      return [{ sc: 'appraisal', t0: 0, t1: end, tracks: tr, swap: { 'xt_wanbao_vip-clue-wall_sword_4': tt => tt >= Bt + 440 ? 'empty' : null } }]; }
    if (id === '07') { const F = hatchFoot(), A = 300, Bt = A + dur('07a'), Ct = Bt + dur('07b'), end = Ct + dur('07c') + 700;
      const tr = [seq('07a', F, 0, Bt, A), seq('07b', F, Bt, Ct, Bt), seq('07c', F, Ct, end, Ct)];
      return [{ sc: 'hall', t0: 0, t1: end, tracks: tr, hide: ['r324_pick'], empty: /^r279_t/, swap: { 'r324_hatch': tt => tt >= A + 440 ? 'ajar' : 'closed' } }]; }
    if (id === '13') { const tr = []; const y = 380, x0 = 760; let t = 300, i = 0, x = x0; const walk = [];
      for (; x > 296; i++, x -= 18) { walk.push([i % 6, 180, x, y, 1]); if (i % 2 === 1) tr.push({ a: '13c', t0: t, seq: AS['13c'][5].map((d, k) => [k, d || 99999, x + 18, y + 2, 1]), from: t, to: 1e9 }); t += 180; }
      tr.push({ a: '13a', t0: 300, seq: walk, from: 300, to: t });
      const Bt = t; tr.push(seq('13b', [[280, 370], [275, 350], [270, 335], [270, 335]], Bt, Bt + dur('13b'), Bt, [1, 1, .55, .25]));
      const end = Bt + dur('13b') + 800; for (const k of tr) if (k.to === 1e9) k.to = end;
      return [{ sc: 'corridor', t0: 0, t1: end, tracks: tr, hide: ['xt_inn_corr-clue-wet_footprints', 'xt_inn_corr-clue-broken_latch'] }]; }
    if (id === '08') { const A = 300, end = A + dur('08') + 1200, g = [1150, 330];
      const pet = { a: '08p', t0: A + 1350, seq: [], from: A + 1350, to: end }; for (let i = 0; i < 40; i++) pet.seq.push([i % 8, 150, g[0] - 30, g[1] - 10, 1]);
      // 作者 11-16「要合逻辑」：坟在山里，避难营的房子、帐篷、井、水缸、药匾不该出现在这段回忆里
      return [{ sc: 'hill', t0: 0, t1: end, hide: ['qy_shelter-house_01-4', 'qy_shelter-bandit_tent-5', 'qy_shelter-bandit_tent-6', 'qy_shelter-water_jar-12', 'qy_shelter-well-7', 'qy_shelter-herb_grinder-16', 'qy_shelter-herb_trays-10'], tracks: [{ a: '08g', t0: 0, seq: [[0, 99999, g[0], g[1], 1]], from: 0, to: end }, seq('08', [g[0] - 145, g[1] + 10], 0, end, A), pet] }]; }
    return []; }
  // 阿蘅蹲在活门右手边掀门：脚底落在活门右三分之一、下沿
  function hatchFoot() { try { const o = (TMAPS.qy_inn.baked.objs || []).find(x => x.uid === 'r324_hatch'); if (o) return [Math.round(o.x + o.w * .76), Math.round(o.y + o.h - 2)]; } catch (e) {} return [1399, 674]; }
  const frameAt = (k, t) => { const s = k.seq; let e = t - k.t0; if (e < 0) return s[0]; for (const f of s) { if (e < f[1]) return f; e -= f[1]; } return s[s.length - 1]; };
  const charK = m => { try { const z = MAP_ZOOM[m] || 1, T = TMAPS[m].baked; let vz = z; if (z !== 1 && !(typeof WIDE_OK === 'object' && WIDE_OK[m])) vz = Math.min(1, Math.max(z, W / T.w, H / T.h)); const cz = (typeof CHAR_SCALE !== 'undefined' && CHAR_SCALE[m]) || 1; return cz / vz; } catch (e) { return 1; } };
  // 剑匣摆在验货长案上：排在长案后面一点点（和原来那只剑匣一样）
  const caseY = B => { const o = (B.objs || []).find(x => x.uid === 'xt_wanbao_store-clue-sword_case' || x.id === 'xt_wanbao_store-clue-sword_case'); return o ? o.sy : 760; };
  let cur = null;
  function drawShot(sh, t) {
    const S0 = SC[sh.sc], T = TMAPS[S0.map], B = T && T.baked; if (!B) return;
    const [vx, vy, vw, vh] = S0.view, s = Math.min(W / vw, H / vh), ox = (W - vw * s) / 2 - vx * s, oy = (H - vh * s) / 2 - vy * s, kz = charK(S0.map);
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.beginPath(); ctx.rect((W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s); ctx.clip();
    ctx.setTransform(SCALE * s, 0, 0, SCALE * s, SCALE * ox, SCALE * oy);
    const g = IMG[B.ground]; if (g) ctx.drawImage(g, 0, 0, B.w, B.h);
    const items = []; const FR = sh.front && (() => { const o = (B.objs || []).find(x => (x.uid || x.id) === sh.front.uid); return o ? Object.assign({ o }, sh.front) : null; })();
    for (const o of B.objs || []) { if (sh.hide && sh.hide.includes(o.uid || o.id)) continue; items.push({ y: o.flat ? -1e9 + o.sy : o.sy, o }); }
    for (const k of sh.tracks) { if (t < k.from || t >= k.to) continue; const f = frameAt(k, t); let y = k.a === '01f' ? caseY(B) : k.a === '08p' ? 1e9 : k.a === '08g' ? f[3] : PROP[k.a] ? -1e9 + f[3] : f[3]; if (FR && !PROP[k.a] && f[2] > FR.o.x && f[2] < FR.o.x + FR.o.w && f[3] < FR.o.sy) y = FR.o.sy + 2; items.push({ y, k, f }); }
    items.sort((p, q) => p.y - q.y);
    for (const it of items) {
      if (it.o) { const o = it.o; let im = IMG[o.img]; const sw = sh.swap && sh.swap[o.uid || o.id] && sh.swap[o.uid || o.id](t);
        if (sw === 'empty') im = exImg('vip_empty', 'r219/c_xt_wanbao_vip_wall_sword_4_empty.webp'); else if (sw === 'ajar') im = IMG.r324_hatch_ajar || im; else if (sw === 'closed') im = IMG.r324_hatch_closed || im;
        if (sh.empty && sh.empty.test(o.uid || o.id)) { const ti = IMG.r269_table_set_196x140; if (ti) ctx.drawImage(ti, o.x + 11, o.y + 42, 150, 107); continue; }   // 夜里没有客人：换成空桌
        if (!im || !(im.width || im.naturalWidth)) continue; ctx.save(); if (o.flip) { ctx.translate(o.x + o.w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(o.x + o.w / 2), 0); } ctx.drawImage(im, o.x, o.y, o.w, o.h); ctx.restore(); continue; }
      const { k, f } = it, [n, fw, fh, ax, ay] = AS[k.a], im = sheet(k.a); if (!(im.complete && im.naturalWidth)) continue;
      const z = PROP[k.a] ? 1 : kz; ctx.save(); ctx.globalAlpha = f[4]; ctx.translate(f[2], f[3]); ctx.scale(z, z); ctx.drawImage(im, f[0] * fw, 0, fw, fh, -ax, -ay, fw, fh); ctx.restore();
      // 站在长案后面：长案前沿那一条压住腿脚（只压这个人身上那一块）
      if (FR && !PROP[k.a] && f[3] < FR.below && f[2] > FR.o.x && f[2] < FR.o.x + FR.o.w) { const ti = IMG[FR.o.img]; if (ti) { const x0 = f[2] - ax * z, w = fw * z, y0 = FR.cut, h = f[3] + 4 - FR.cut; if (h > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip(); ctx.drawImage(ti, FR.o.x, FR.o.y, FR.o.w, FR.o.h); ctx.restore(); } } } }
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.restore();
    // 夜色：整张图压暗偏蓝 + 四角暗下去
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#6f84bf'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(6,10,28,.22)'; ctx.fillRect(0, 0, W, H);
    const gr = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,8,.62)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const layer = { draw() { if (!cur) return; const t = performance.now() - cur.t0, shots = cur.shots, end = shots[shots.length - 1].t1;
    let sh = shots[0]; for (const x of shots) if (t >= x.t0) sh = x;
    drawShot(sh, t);
    // 转场：每个镜头头尾 300ms 黑场渐变
    const into = t - sh.t0, left = (sh === shots[shots.length - 1] ? end : sh.t1) - t; const a = Math.max(0, 1 - Math.min(into, left) / 300);
    ctx.save(); if (a > 0) { ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    const F = typeof FONT !== 'undefined' ? FONT : 'serif';
    if (cur.title) { ctx.font = `600 26px ${F}`; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(220,232,255,.88)'; ctx.fillText(cur.title, 36, 52); }
    ctx.font = `20px ${F}`; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(220,232,255,.55)'; ctx.fillText('点一下跳过', W - 30, H - 26); ctx.restore(); } };
  for (const k of Object.keys(AS)) sheet(k);
  // 几张屋子的底图先解码一遍（第一次切过去不黑屏）
  setTimeout(() => { for (const k of Object.keys(SC)) { try { const g = IMG[TMAPS[SC[k].map].baked.ground]; if (g && g.decode) g.decode().catch(() => {}); } catch (e) {} } }, 6000);
  exImg('vip_empty', 'r219/c_xt_wanbao_vip_wall_sword_4_empty.webp');
  function play(id, title) { return new Promise(res => { const shots = build(id); if (!shots.length) return res();
    cur = { id, title, shots, t0: performance.now() }; const total = shots[shots.length - 1].t1; let done = false;
    try { playSnd('sfx_star', .35); } catch (e) {}
    const end = () => { if (done) return; done = true; cur = null; res(); };
    setTimeout(end, total + 100);
    const poll = () => { if (done) return; try { if (typeof consumeTap === 'function' && consumeTap() && performance.now() - cur.t0 > 500) return end(); } catch (e) {} requestAnimationFrame(poll); }; requestAnimationFrame(poll); }); }
  if (typeof drawDialog === 'function') drawDialog = (o => function () { if (cur) { try { layer.draw(); } catch (e) {} return; } return o.apply(this, arguments); })(drawDialog);
  if (typeof drawMapHud === 'function') drawMapHud = (o => function () { if (cur) return; return o.apply(this, arguments); })(drawMapHud);
  const ON = [
    [/^是老夫订的。钥匙是老夫借的。剑，是老夫初七夜里亲手换的。/, '01', '回忆 · 初七夜里'],
    [/^散场的时候，有位贵客派来的管事上了二楼雅间/, '03', '鉴宝会散场以后'],
    [/^今天是我爹的忌日。那三坛酒，是他这辈子最得意的手艺/, '07', '回忆 · 昨夜的地窖'],
    [/^凶手没进过那间屋子。门闩上的血指印在里面/, '13', '回忆 · 那一夜'],
    [/倒在我爹坟前了|^我只倒了一坛在他坟前/, '08', '回忆 · 山里的坟'],
  ];
  say = (orig => async function (who, text) { const t = String(text || '');
    for (const [re, id, title] of ON) if (re.test(t)) { try { await play(id, title); } catch (e) {} break; }
    return orig.apply(this, arguments); })(say);
  // ---------- 九灯拱一枢：三盏被动过手脚的灵灯，灯罩里的火忽明忽暗（Codex R313 第 10 段）----------
  const LAMPS = [['10a', 1740, 2905, 0], ['10b', 2740, 2905, 470], ['10c', 1856, 2129, 910]], LD = [220, 180, 140, 140, 250, 140, 160, 220], LT = LD.reduce((a, b) => a + b, 0), LS = [1, .85, .6, .4, .12, .3, .55, .75];
  for (const [k] of LAMPS) sheet(k);
  const lampOn = () => { try { return world.mapName === 'xt_city' && (((S.flags.sq || {}).xt_lamps || {}).s === 1); } catch (e) { return false; } };
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function (T, cam, now) { orig && orig.apply(this, arguments); if (!lampOn()) return;
    const t = performance.now();
    for (const [k, x, y, ph] of LAMPS) { let e = (t + ph) % LT, i = 0; while (e >= LD[i]) { e -= LD[i]; i++; } const im = sheet(k);
      ctx.save(); const g = ctx.createRadialGradient(x, y, 4, x, y, 40); const d = .62 * (1 - LS[i]); g.addColorStop(0, 'rgba(8,12,24,' + (d + .1) + ')'); g.addColorStop(1, 'rgba(8,12,24,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 40, y - 40, 80, 80);
      if (im.complete && im.naturalWidth) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .85; ctx.drawImage(im, i * 96, 0, 96, 128, x - 48 * .5, y + 22 - 120 * .5, 48, 64); }
      ctx.restore(); } })(tileAmbientHigh);
  window.R326_PLAY = play; window.R326_BUSY = () => !!cur;
})();
