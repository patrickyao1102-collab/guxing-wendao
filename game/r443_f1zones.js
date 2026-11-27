// ================= R443 · 万妖塔第一层：三苑迷宫 + 传送法阵（只进测试版）=================
// 作者 11-28 凌晨：「迷宫太小……更大更难」「宫廷地板、朱红描金栏杆、栏杆外一圈圈彼岸花圃，越往里越红」「有些路走不到，要靠传送法阵，要传对了才行」
//                「第一层不要那么难……让玩家感到难，但又走得出来」「法阵用不一样的纹样」「不同楼层的法阵特效也不一样」「多做几版，整图接进去测」。
// 三苑：外苑 → 中苑 → 内苑，各 21×15 格、每格 240（Claude 设计的格子，Codex 画三版：R436b 斜俯视混搭 / R436c 拼图法 / R436d 整块手绘）。
// 法阵：纹样一样的两座是一对（来回通）；花纹阵通往下一苑；别的纹样是假阵——一踩送回本苑起点，阵纹裂开（R441 八种纹样 + 裂阵）。
// 踩阵的特效是 R442 一层「梦丝缠身、花瓣回旋」。照魂灯三盏、花墙、首领、遗物、温行舟（R427 支线）照旧，只是搬进三苑里。
// 测试面板可以切三版画风（记在本机），也能直接进任意一苑。
(function () {
  const MZ = window.TOWER && TOWER.MAZE, META = window.R443_META;
  if (!MZ || !META || typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const F = () => (S.flags = S.flags || {}), ST = () => MZ.ST(1), TXT = MZ.TXT[1], P = MZ.P;
  const CS = 40, TSZ = 240, ZS = ['a', 'b', 'c'], ZNAME = { a: '外苑', b: '中苑', c: '内苑' }, MAPN = z => 'wyt_f1' + z;
  const zoneOf = m => { const mm = /^wyt_f1([abc])$/.exec(m || ''); return mm ? mm[1] : null; };
  const curZ = () => zoneOf(world && world.mapName);
  const BACK = ['qingzhu_upper_pavilion', ...P(-200, 640)];
  let V = (() => { try { const v = localStorage.getItem('gx_r443_ver'); if (META[v]) return v; } catch (e) {} return 'b'; })();
  const VNAME = { b: 'B · 斜俯视混搭', c: 'C · 拼图法', d: 'D · 整块手绘' };
  const ctr = (c, r) => [(c + .5) * TSZ, (r + .5) * TSZ - 8];   // 法阵中心（脚底落点）
  // ---------- 法阵：纹样一样的是一对；花纹阵通下一苑 / 回上一苑；别的是假阵 ----------
  const PADS = {
    a: [{ c: [17, 3], to: ['a', [13, 13]], g: 'moon' }, { c: [13, 13], to: ['a', [17, 3]], g: 'moon' }, { c: [13, 1], to: ['b', [10, 13]], g: 'flower', exit: 1 },
      { c: [3, 7], decoy: 1, g: 'cloud' }, { c: [13, 5], decoy: 1, g: 'water' }],
    b: [{ c: [10, 13], to: ['a', [13, 1]], g: 'flower', ret: 1 }, { c: [11, 11], to: ['b', [7, 13]], g: 'butterfly' }, { c: [7, 13], to: ['b', [11, 11]], g: 'butterfly' },
      { c: [15, 1], to: ['c', [10, 13]], g: 'flower', exit: 1 }, { c: [15, 5], decoy: 1, g: 'flame' }, { c: [9, 5], decoy: 1, g: 'bell' }],
    c: [{ c: [10, 13], to: ['b', [15, 1]], g: 'flower', ret: 1 }, { c: [1, 1], to: ['c', [13, 13]], g: 'sword' }, { c: [13, 13], to: ['c', [1, 1]], g: 'sword' },
      { c: [11, 9], decoy: 1, g: 'moon' }, { c: [11, 5], decoy: 1, g: 'cloud' }] };
  const START = { a: [10, 13], b: [10, 13], c: [10, 13] };
  const used = () => { const s = ST(); return s.tpUsed || (s.tpUsed = {}); };
  const padKey = (z, p) => z + p.c.join('_');
  // ---------- 图 ----------
  const want = {}, got = {};
  const K = (z, name) => 'r443_' + V + '_' + z + '_' + name, KT = name => 'r443_tp_' + name;
  function ldk(k, src) { if (k in want) return; want[k] = 1; const im = new Image(); im.onload = () => { IMG[k] = im; got[k] = 1; }; im.onerror = () => { got[k] = 1; }; im.src = src; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} }
  const ld = (z, name) => ldk(K(z, name), 'r443/' + V + '/' + z + '/' + name + '.webp?v=1');
  const ldt = name => ldk(KT(name), 'r443/tp/' + name + '.webp?v=2');   // v2：R446c 加帧（法阵 idle 12 / on 16，传送 go 24 / arrive 12）
  const Z = z => META[V][z];
  function loadCore(z) { const M = Z(z); ld(z, 'base'); for (const o of M.ov) ld(z, o[6]); }
  function loadRest(z) { const M = Z(z);
    for (const o of M.objs) { for (const f of o.frames || []) ld(z, f); for (const s of Object.values(o.states || {})) ld(z, s); }
    for (const w of M.water) { ld(z, w.mask); ld(z, w.tile); if (w.fg) ld(z, w.fg); for (const g of w.glints) ld(z, g); }
    for (const p of PADS[z]) { ldt('tp_' + p.g + '_idle'); ldt('tp_' + p.g + '_on'); } ldt('tp_used'); ldt('tp1_go'); ldt('tp1_arrive'); }
  { const o = window.MAP_EXTRA_READY; window.MAP_EXTRA_READY = m => { let a = 1; try { a = o ? o(m) : 1; } catch (e) {} if (a == null) a = 1; const z = zoneOf(m); if (!z) return a;
      loadCore(z); loadRest(z); const pre = 'r443_' + V + '_' + z + '_', ks = Object.keys(want).filter(k => k === pre + 'base' || Z(z).ov.some(o => pre + o[6] === k)); return Math.min(a, ks.length ? ks.filter(k => got[k]).length / ks.length : 0); }; }
  // ---------- 地图 ----------
  const isLamp = o => /^lamp/.test(o.id), isGate = o => o.id === 'gate', isRelic = o => /^relic/.test(o.id);
  const lampsOf = () => Z('c').objs.filter(isLamp);
  const RELIC_I = { a: 0, b: 1, c: 2 };
  function build(z) { const M = Z(z), cols = Math.ceil(M.w / CS), rows = Math.ceil(M.h / CS);
    const bl = new Array(cols * rows).fill('0'); const blk = (x0, y0, x1, y1) => { for (let r = Math.floor(y0 / CS); r <= Math.floor((y1 - 1) / CS); r++) for (let c = Math.floor(x0 / CS); c <= Math.floor((x1 - 1) / CS); c++) if (r >= 0 && c >= 0 && r < rows && c < cols) bl[r * cols + c] = '1'; };
    M.grid.forEach((row, R) => [...row].forEach((ch, C) => { if (ch === '#') blk(C * TSZ, R * TSZ, (C + 1) * TSZ, (R + 1) * TSZ); }));
    for (const o of M.objs) { if (o.blocks) blk(...o.blocks);
      if (isLamp(o)) blk(o.bx - 36, o.by - 30, o.bx + 36, o.by + 4);
      if (o.id === 'boss_dais') blk(o.x + 40, o.y + 30, o.x + o.w - 40, o.by - 60);
      if (o.id === 'wangchuan_pond' && o.w > 300) blk(o.x + o.w * .12, o.y + o.h * .3, o.x + o.w * .86, o.y + o.h * .86); }
    const objs = [];
    for (const [r, x, y, w, h, sy, name] of M.ov) objs.push({ id: 'r443_ov', uid: K(z, name), img: K(z, name), x, y, w, h, sy, flat: false, flip: false, noBlock: true, noPre: true });
    for (const o of M.objs) objs.push({ id: 'r443_obj', uid: K(z, o.id), img: K(z, 'base'), r443: { z, o }, x: o.x, y: o.y, w: o.w, h: o.h, sy: o.id === 'flower_tree' ? o.by - 80 : o.by, flat: /mist|pond|dais/.test(o.id), flip: false, noBlock: true, noPre: true });
    const dais = M.objs.find(o => o.id === 'boss_dais');
    if (dais) objs.push({ id: 'r443_obj', uid: K(z, 'boss_pic'), img: K(z, 'base'), r443: { z, o: { id: 'boss_pic', bx: dais.bx, by: dais.by } }, x: dais.bx - 200, y: dais.by - 520, w: 400, h: 520, sy: dais.by - 100, flat: false, flip: false, noBlock: true, noPre: true });
    const npcs = [], spot = (name, x, y, talk, h = 120, extra) => { const [c, r] = P(x, y); npcs.push(Object.assign({ key: 'none', c, r, name, hidden: true, h, wander: false, r443: z, talk }, extra || {})); };
    if (z === 'c') { lampsOf().forEach((o, i) => spot(TXT.mech, o.bx, o.by + 30, () => mech(i), 120)); const g = M.objs.find(isGate); if (g) spot('花墙', g.bx, g.by + 20, shut, 150, { cond: () => !ST().gate }); }
    M.objs.filter(isRelic).forEach(o => spot('遗物', o.bx, o.by + 30, () => relic(RELIC_I[z]), 60));
    if (dais) spot(TXT.boss, dais.bx, dais.by - 60, boss, 200);
    if (z === 'b' && window.R427) { const seat = M.objs.find(o => o.id === 'seat_stone'), pond = M.objs.find(o => o.id === 'wangchuan_pond');
      if (seat) { const wx = seat.bx + 70, wy = seat.by + 40; spot('温行舟', wx, wy, R427.wen, 120, { cond: () => R427.T7().wen !== 2 });
        objs.push({ id: 'r427_obj', uid: 'r443_wen', img: K(z, 'base'), r427: { n: 1, name: 'wen' }, x: wx - 80, y: wy - 240, w: 160, h: 240, sy: wy + 2, flat: false, flip: false, noBlock: true, noPre: true }); }
      if (pond) spot('忘川泉', pond.bx, pond.by - 20, R427.pond, 90); }
    const S0 = ctr(...START[z]);
    TMAPS[MAPN(z)] = { title: '万妖塔 · 第一层 · ' + ZNAME[z], name: MAPN(z), indoor: false, leaves: false, chests: [], npcs, start: P(S0[0], S0[1]),
      baked: { ground: K(z, 'base'), w: M.w, h: M.h, cs: CS, cols, rows, blocked: bl.join(''), objs },
      exits: z === 'a' ? [{ x: Math.floor((10 * TSZ) / CS), y: rows - 1, w: Math.ceil(TSZ / CS), h: 1, to: BACK[0], at: [BACK[1], BACK[2]], face: 'down', label: '出塔' }] : [] };
    if (typeof MAP_ZOOM === 'object') MAP_ZOOM[MAPN(z)] = MAP_ZOOM.qingzhu_upper_pavilion || 1; }
  const buildAll = () => ZS.forEach(build); buildAll();
  // 花墙（内苑 G 格）开没开
  function applyGate() { try { if (curZ() !== 'c') return; const T = world.map.T, M = Z('c'); M.grid.forEach((row, R) => [...row].forEach((ch, C) => { if (ch !== 'G') return;
      for (let r = R * TSZ / CS; r < (R + 1) * TSZ / CS; r++) for (let c = C * TSZ / CS; c < (C + 1) * TSZ / CS; c++) if (T.block[r]) T.block[r][c] = ST().gate ? 0 : 1; })); } catch (e) {} }
  // 进塔：铸剑师那里选了第一层 → 外苑
  goMap = (orig => async function (name, c, r, face) { if (name === 'wyt_f1') { const s = ctr(...START.a); return orig.call(this, MAPN('a'), ...P(s[0], s[1] + 60), 'up'); } return orig.apply(this, arguments); })(goMap);
  tileSetMap = (orig => function (m) { const prev = world && world.mapName, z = zoneOf(m); if (z) { loadCore(z); loadRest(z); }
    const res = orig.apply(this, arguments);
    if (z) { applyGate(); STEP.d = 0; STEP.next = 700 + Math.random() * 500; MUST.on = true; MUST.x = world.player ? world.player.x : 0; MUST.y = world.player ? world.player.y : 0;
      if (!zoneOf(prev) && prev !== 'wyt_f1' && window.R427 && R427.RUN) R427.RUN.f1 = {}; }
    return res; })(tileSetMap);
  // ---------- 画：物件、法阵、水、特效 ----------
  const stateOf = o => { if (isGate(o)) return ST().gate ? 'open' : 'closed'; if (isLamp(o)) { const i = lampsOf().findIndex(x => x.id === o.id); return ST().mech[i] ? 'on' : 'off'; } return o.def || Object.keys(o.states)[0]; };
  const BPIC = {}; const bpic = () => { const s = TXT.pic; let a = BPIC[s]; if (!a) { a = BPIC[s] = new Image(); a.src = s; } return a.complete && a.naturalWidth ? a : null; };
  drawBaked = (orig => function (o, now) { if (!o || o.id !== 'r443_obj') return orig.apply(this, arguments);
    const { z, o: d } = o.r443;
    if (d.id === 'boss_pic') { if (TOWER_STORY.cleared(1)) return; const p = bpic(); if (!p) return; const h = TXT.picH * 1.15, w = p.width * h / p.height, fy = d.by - 130;
      ctx.save(); ctx.globalAlpha = .97; ctx.translate(d.bx, 0); ctx.scale(-1, 1); ctx.drawImage(p, -w / 2, fy - h, w, h); ctx.restore(); return; }
    let k = null;
    if (d.states) k = K(z, d.states[stateOf(d)]);
    else if (d.frames) { const n = d.frames.length, i = Math.floor(now * 1000 / (d.ms || 180) + d.x * .013) % n; k = K(z, d.frames[i]); }
    const im = k && IMG[k]; if (!im) return; ctx.drawImage(im, o.x, o.y, o.w, o.h);
    if (isLamp(d) && stateOf(d) === 'on') { const f = .7 + .3 * Math.sin(now * 5 + d.x), cx = d.bx, cy = d.by - d.h * .6, g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 80); ctx.save(); ctx.globalCompositeOperation = 'lighter'; g.addColorStop(0, `rgba(255,236,200,${.5 * f})`); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 80, cy - 80, 160, 160); ctx.restore(); } })(drawBaked);
  const WC = {};
  function drawWater(z, now) { for (const [i, w] of Z(z).water.entries()) { const mk = IMG[K(z, w.mask)], tl = IMG[K(z, w.tile)]; if (!mk || !tl) continue;
      let c = WC[z + i]; if (!c || c.width !== w.w) { c = WC[z + i] = document.createElement('canvas'); c.width = w.w; c.height = w.h; }
      const g = c.getContext('2d'); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w.w, w.h);
      const tw = tl.width, th = tl.height, ox = ((now * w.vx) % tw + tw) % tw, oy = ((now * w.vy) % th + th) % th;
      for (let y = -th + oy; y < w.h; y += th) for (let x = -tw + ox; x < w.w; x += tw) g.drawImage(tl, x, y);
      g.globalCompositeOperation = 'destination-in'; g.drawImage(mk, 0, 0, w.w, w.h); g.globalCompositeOperation = 'source-over';
      const gl = IMG[K(z, w.glints[Math.floor(now * 1000 / (w.gms || 160)) % w.glints.length])]; if (gl) g.drawImage(gl, 0, 0, w.w, w.h);
      ctx.drawImage(c, w.x, w.y); const fg = w.fg && IMG[K(z, w.fg)]; if (fg) ctx.drawImage(fg, w.x, w.y, w.w, w.h); } }
  const FX = { pad: null, go: null, arrive: null };
  const strip = (k, n, fw, fh, i, x, y, ax, ay, a) => { const im = IMG[k]; if (!im) return; ctx.save(); if (a != null) ctx.globalAlpha = a; ctx.drawImage(im, (i % n) * fw, 0, fw, fh, x - ax, y - ay, fw, fh); ctx.restore(); };
  function drawPads(z, now) { const U = used(), t = performance.now();
    for (const p of PADS[z]) { const [x, y] = ctr(...p.c);
      if (p.decoy && U[padKey(z, p)]) { strip(KT('tp_used'), 1, 260, 260, 0, x, y, 130, 182); continue; }
      const on = FX.pad && FX.pad.z === z && FX.pad.p === p ? Math.floor((t - FX.pad.t0) / 42) : -1;
      if (on >= 0 && on < 16) strip(KT('tp_' + p.g + '_on'), 16, 260, 260, on, x, y, 130, 182);
      else strip(KT('tp_' + p.g + '_idle'), 12, 260, 260, Math.floor(now * 12 + p.c[0]), x, y, 130, 182); } }
  if (typeof tileAmbientLow === 'function') tileAmbientLow = (orig => function (T, cam, now) { orig.apply(this, arguments); const z = curZ(); if (!z) return; try { drawWater(z, now); drawPads(z, now); } catch (e) {} })(tileAmbientLow);
  tileAmbientHigh = (orig => function (T, cam, now) { if (orig) orig.apply(this, arguments); const z = curZ(); if (!z) return;
    try { const t = performance.now();
      if (FX.go && FX.go.z === z) { const i = Math.floor((t - FX.go.t0) / 42); if (i < 24) strip(KT('tp1_go'), 24, 256, 384, i, FX.go.x, FX.go.y, 128, 324); else FX.go = null; }
      if (FX.arrive && FX.arrive.z === z) { const i = Math.floor((t - FX.arrive.t0) / 42); if (i < 12) strip(KT('tp1_arrive'), 12, 256, 384, i, FX.arrive.x, FX.arrive.y, 128, 324); else FX.arrive = null; }
      // 遗物的一点闪光；没点亮的灯一明一暗
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const tt = now;
      for (const o of Z(z).objs) { let x, y, r0;
        if (isRelic(o) && !ST().relic[RELIC_I[z]]) { x = o.bx; y = o.by - 10; r0 = 30; }
        else if (isLamp(o) && stateOf(o) === 'off') { x = o.bx; y = o.by - 50; r0 = 60; } else continue;
        const f = .5 + .5 * Math.sin(tt * 3 + o.bx), g = ctx.createRadialGradient(x, y, 1, x, y, r0); g.addColorStop(0, `rgba(255,232,190,${.3 + .3 * f})`); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.fillRect(x - r0, y - r0, r0 * 2, r0 * 2); }
      ctx.restore(); } catch (e) {} })(typeof tileAmbientHigh === 'function' ? tileAmbientHigh : null);
  // ---------- 踩阵 ----------
  const MUST = { on: false, x: 0, y: 0 };   // 刚落地站在阵上：先走开才会再触发
  const onPad = (p, x, y) => { const [cx, cy] = ctr(...p.c); return ((x - cx) / 78) ** 2 + ((y - cy) / 44) ** 2 < 1; };
  let BUSY = false;
  async function tp(z, p) { const pl = world.player; BUSY = true; world.locked = true; world.path = null; world.walkTarget = null; pl.moving = false;
    try { const [x, y] = ctr(...p.c); pl.x = x; pl.y = y; FX.pad = { z, p, t0: performance.now() }; FX.go = { z, x, y, t0: performance.now() + 120 };
      try { playSnd('sfx_buff', .7); } catch (e) {} await sleep(520); pl.hidden = true; await sleep(380);
      let tz, tc;
      if (p.decoy) { used()[padKey(z, p)] = 1; tz = z; tc = START[z]; } else [tz, tc] = p.to;
      await fadeOut(200);
      const [tx, ty] = ctr(...tc);
      if (tz !== z) tileSetMap(MAPN(tz), ...P(tx, ty), 'down'); else { pl.x = tx; pl.y = ty; world.cam = null; }
      const p2 = world.player; p2.x = tx; p2.y = ty; p2.hidden = false; MUST.on = true; MUST.x = tx; MUST.y = ty;
      FX.arrive = { z: tz, x: tx, y: ty, t0: performance.now() + 150 }; await fadeIn(260);
      const T7 = ST(); T7.tpTold = T7.tpTold || {};
      if (p.decoy) { try { playSnd('sfx_claw', .5); } catch (e) {} S.flash = .35; S.flashColor = '#ff3a4a';
        if (!T7.tpTold.decoy) { T7.tpTold.decoy = 1; await say('星旋', '假阵！又被花香送回来了。'); await say('星旋', '瞧见没，踩过的那座阵纹裂开了——记住它，别再上当。'); } else toast('假阵……被送回了' + ZNAME[z] + '的起点', 2000); }
      else if (p.exit && !T7.tpTold['to_' + tz]) { T7.tpTold['to_' + tz] = 1; await narrate(tz === 'b' ? '（花香一下子浓了。眼前是一座泉庭，红花开得比外苑更密。）' : '（脚下的石板泛着暗红。远处花海深处，一株巨大的花树遮住了半边天。）'); }
      else if (!p.exit && !p.ret && !T7.tpTold.pair) { T7.tpTold.pair = 1; await say('星旋', '纹样一样的两座阵是通的。花纹的那座，八成通往更里头。'); }
    } catch (e) { console.warn('R443 tp', e); } finally { try { world.player.hidden = false; } catch (e) {} BUSY = false; world.locked = false; } }
  // ---------- 暗雷 ----------
  const STEP = { d: 0, next: 900, lx: 0, ly: 0 };
  updateMap = (orig => function (dt) {
    // 塔里的 M 地图点了不自动寻路（路要自己找），点哪儿都只是关上
    try { if (curZ() && input.tapped && window.MM_API && MM_API.MM.big) { input.tapped = null; MM_API.MM.big = false; try { playSnd('ui_click'); } catch (e) {} } } catch (e) {}
    const r = orig.apply(this, arguments);
    try { const z = curZ(), p = world.player; if (!z || !p) return r;
      if (world.locked || BUSY || dialog || choice || sysPanel || (typeof battle !== 'undefined' && battle)) { STEP.lx = p.x; STEP.ly = p.y; return r; }
      if (MUST.on) { if (Math.hypot(p.x - MUST.x, p.y - MUST.y) > 110) MUST.on = false; }
      else for (const pd of PADS[z]) { if (pd.decoy && used()[padKey(z, pd)]) continue; if (onPad(pd, p.x, p.y)) { tp(z, pd); return r; } }
      const d = Math.hypot(p.x - STEP.lx, p.y - STEP.ly); STEP.lx = p.x; STEP.ly = p.y; if (d > 0 && d < 40) STEP.d += d;
      const [sx, sy] = ctr(...START[z]); if (Math.hypot(p.x - sx, p.y - sy) < 300) return r;
      if (STEP.d >= STEP.next) { STEP.d = 0; STEP.next = 850 + Math.random() * 650; encounter(z); } } catch (e) {} return r; })(updateMap);
  async function encounter(z) { BUSY = true; world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    try { const set = TXT.mobs[Math.floor(Math.random() * TXT.mobs.length)]; S.flash = .5; S.flashColor = '#ff3a4a'; try { playSnd('sfx_claw', .6); } catch (e) {} await sleep(150); await fadeOut(200);
      const win = await TOWER.fightMobs(1, set); S.scene = drawMap;
      if (!win) { partyRevive(.3); const p = world.player, [x, y] = ctr(...START[z]); p.x = x; p.y = y; MUST.on = true; MUST.x = x; MUST.y = y; toast('败下阵来……回到' + ZNAME[z] + '起点', 2600); }
      await fadeIn(240); } catch (e) { console.warn('R443 enc', e); } finally { BUSY = false; world.locked = false; } }
  // ---------- 照魂灯、花墙、遗物、首领 ----------
  const lines = MZ.lines;
  async function mech(i) { const S2 = ST(); if (S2.mech[i]) { await narrate(TXT.mech + '已经' + TXT.mechVerb + '了。'); return; }
    S2.mech[i] = 1; try { playSnd('sfx_buff', .6); } catch (e) {} const k = S2.mech.filter(Boolean).length, N = lampsOf().length;
    await narrate(TXT.mechLines[Math.min(k, 3) - 1]);
    if (k >= N && !S2.gate) { S2.gate = 1; applyGate(); try { playSnd('sfx_charge', .6); } catch (e) {} S.shake = 10; toast('花墙开了', 1800); } else if (k < N) toast(TXT.mech + ' ' + k + ' / ' + N, 1600); }
  async function shut() { await narrate(TXT.gateShut); await say('星旋', '三盏' + TXT.mech + '都' + TXT.mechVerb + '了才开。内苑里找找。'); }
  async function relic(i) { const S2 = ST(); if (S2.relic[i]) { await narrate('这件东西已经看过了。'); return; } S2.relic[i] = 1; await lines(TXT.relics[i]); }
  async function boss() { if (TOWER_STORY.cleared(1)) { await narrate('花树下空荡荡的，只有落花。'); return; }
    if (!ST().gate) return shut();
    await lines(TXT.meet); world.locked = true; await fadeOut(240);
    const win = await TOWER.fightBoss(1); world.locked = true;
    if (win) { const got2 = []; if (!F().tw_prize_1) { F().tw_prize_1 = 1; for (const [id, c] of TXT.prize || []) if (ITEM_DB[id]) { addItem(id, c); got2.push(ITEM_DB[id].name + (c > 1 ? ' ×' + c : '')); } }
      if (got2.length) await showPanel('万妖塔 · 第一层', ['镇妖图卷又展开了一幅。', '!获得：' + got2.join('、')]); }
    else { partyRevive(.3); const p = world.player, [x, y] = ctr(...START.c); p.x = x; p.y = y; MUST.on = true; MUST.x = x; MUST.y = y; await fadeIn(240); toast('败下阵来……养好伤、备足丹药再来', 3000); }
    world.locked = false; }
  // ---------- M 键地图（作者 11-28 09:17）：「其他地方全是黑的，只有中间 BOSS 那里是亮的……黑暗中有个红点代表玩家，但玩家不知道具体的路」 ----------
  // 三苑当成一整张大图：外苑在下、中苑居中、内苑在上；路一律不画，只亮首领台，红点是自己。小地图（左上角圆盘）也全黑，边上一团红光指着首领的方向。
  const BOSS_AT = (() => { const d = META.b && META.b.c && META.b.c.objs.find(o => o.id === 'boss_dais'); return d ? [d.bx, d.by - 80] : [2520, 700]; })();
  const ZY = { a: 2, b: 1, c: 0 };
  function drawTowerMap() { const MA = window.MM_API, z = curZ(), p = world.player; if (!MA || !z || !p) return; const MM = MA.MM, now = performance.now() / 1000;
    const big = MM.big, R = big ? 250 : MM.r, cx = big ? W / 2 : MM.cx, cy = big ? H / 2 + 10 : MM.cy;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip(); ctx.fillStyle = 'rgba(7,4,8,.985)'; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    const glow = (x, y, r, a) => { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(255,70,80,${a})`); g.addColorStop(.4, `rgba(200,20,40,${a * .5})`); g.addColorStop(1, 'rgba(120,0,20,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    const pulse = .75 + .25 * Math.sin(now * 2.4);
    if (big) { // 三苑叠成一张：每苑 5040×3600，竖着摞
      const MW = 5040, MH = 3600 * 3, k = (R * 1.7) / MH, ox = cx - MW * k / 2, oy = cy - MH * k / 2, toB = (zz, x, y) => [ox + x * k, oy + (ZY[zz] * 3600 + y) * k];
      ctx.strokeStyle = 'rgba(150,40,50,.35)'; ctx.lineWidth = 1; for (const zz of ZS) { const [a, b] = toB(zz, 0, 0); ctx.strokeRect(a, b, MW * k, 3600 * k);
        ctx.font = `600 13px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = zz === z ? 'rgba(255,210,200,.8)' : 'rgba(200,150,150,.35)'; ctx.fillText(ZNAME[zz], a + 6, b + 5); }
      const [bx, by] = toB('c', BOSS_AT[0], BOSS_AT[1]); ctx.globalCompositeOperation = 'lighter'; glow(bx, by, 46 * pulse, .9); glow(bx, by, 16, 1); ctx.globalCompositeOperation = 'source-over';
      const [u, v] = toB(z, p.x, p.y); ctx.fillStyle = '#ff4b3a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(u, v, 5 + Math.sin(now * 5) * .7, 0, 7); ctx.fill(); ctx.stroke(); }
    else { // 小圆盘：自己在中间；首领在这一苑就照实画，不在就在圆边上朝北亮一团
      const k = R / MM.view; let bx, by; if (z === 'c') { bx = cx + (BOSS_AT[0] - p.x) * k; by = cy + (BOSS_AT[1] - p.y) * k; } else { bx = cx + (BOSS_AT[0] - p.x) * k; by = cy - R; }
      const d = Math.hypot(bx - cx, by - cy); if (d > R - 8) { bx = cx + (bx - cx) / d * (R - 8); by = cy + (by - cy) / d * (R - 8); }
      ctx.globalCompositeOperation = 'lighter'; glow(bx, by, 22 * pulse, .9); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ff4b3a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 4.5 + Math.sin(now * 5) * .6, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    if (big) { ctx.save(); ctx.font = `600 16px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#0a0606'; ctx.fillRect(0, cy + R + 46, W, 44); ctx.fillStyle = '#e8c9c0'; ctx.fillText('红点是你，红光处是首领。路，要自己找。' + (GX_TOUCH ? '　点任意处关闭' : '　点任意处或按 M 键关闭'), cx, cy + R + 66); ctx.restore(); } }
  drawMapHud = (orig => function () { orig.apply(this, arguments); try { if (curZ() && S.hud !== false && !S.menu && !dialog && !choice) drawTowerMap(); } catch (e) {} })(drawMapHud);
  // ---------- 测试面板：切画风、直接进某一苑 ----------
  function setVer(v) { if (!META[v]) return; V = v; try { localStorage.setItem('gx_r443_ver', v); } catch (e) {} buildAll(); const z = curZ(); if (z && world.player) { const p = world.player; tileSetMap(MAPN(z), ...P(p.x, p.y), 'down'); } toast('万妖塔一层画风：' + VNAME[v], 2000); mark(); }
  function goZone(z) { const s = ctr(...START[z]); goMap(MAPN(z), ...P(s[0], s[1]), 'up'); }
  let row1 = null; const mark = () => { if (row1) for (const b of row1.children) b.className = b.dataset.v === V ? 'on' : ''; };
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r443]')) return; const h = document.createElement('h4'); h.textContent = '11-28 新加 · 万妖塔一层三苑（三版画风，记在本机）'; h.setAttribute('data-r443', '1');
      row1 = document.createElement('div'); row1.className = 'row';
      for (const v of ['b', 'c', 'd']) { const b = document.createElement('button'); b.textContent = VNAME[v]; b.dataset.v = v; b.onclick = () => setVer(v); row1.appendChild(b); }
      const row2 = document.createElement('div'); row2.className = 'row';
      for (const z of ZS) { const b = document.createElement('button'); b.textContent = '进一层' + ZNAME[z]; b.onclick = () => { try { const pnl = document.getElementById('dbgPanel'); if (pnl) pnl.style.display = 'none'; } catch (e) {} goZone(z); }; row2.appendChild(b); }
      p.appendChild(h); p.appendChild(row1); p.appendChild(row2); mark(); };
    if (document.getElementById('dbgPanel')) add(); else { const mo = new MutationObserver(() => { if (document.getElementById('dbgPanel')) { add(); mo.disconnect(); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}
  window.R443 = { PADS, START, setVer, goZone, tp, ver: () => V, FX, MUST, buildAll, curZ, STEP };
})();
