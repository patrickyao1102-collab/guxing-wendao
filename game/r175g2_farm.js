// ================= R175 · 青竹菜园（新图）· 园簿、种地、收蛋、摘果、轮班的人 =================
// 作者 11-10：第一次进菜园小桃带路，认一遍田、水车、鸡院、鸭棚、园屋、手浇菜畦、果林，然后把《园簿》交给少爷；
//   之后屏幕上多一个「园簿」按钮，一处就能管整张图（田地 / 禽院 / 果树）；走到跟前点东西也能直接干（头顶挂竹牌）。
//   除了子时，园子里都有人：卯时阿福喂鸡、午时小桃浇菜、酉时松伯看水车、戌时青禾收菜干。
//   菜地不让人踩：田面整块挡住，人站在田头、田埂上干活。
(function () {
  const G2 = window.R175G2; if (!G2 || typeof TMAPS === 'undefined' || !TMAPS[G2.ID]) return;
  const { ID, M } = G2;
  const F = () => (S.flags = S.flags || {});
  const D = () => { const f = F(); const d = f.g2 || (f.g2 = {}); d.plots = d.plots || {}; d.prod = d.prod || {}; d.tree = d.tree || {}; return d; };
  const now = () => performance.now() / 1000;
  const busy = () => (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice) || (window.IG_OPEN && IG_OPEN()) || (typeof sysPanel !== 'undefined' && sysPanel);
  const here = () => world.mapName === ID && world.map && world.map.T;
  const snd = (k, v) => { try { playSnd(k, v); } catch (e) {} };

  // ---------- 物品 ----------
  const INGS = ['竹笋', '莲子', '红枣', '桂花', '糯米', '青菜', '豆腐', '香菇', '鸡蛋', '灵米', '山药', '蜂蜜'];
  const ING = n => 'ing_' + INGS.indexOf(n);
  const ITEM = (k, name, sell, desc) => { const id = 'r175i_' + k; ITEM_DB[id] = Object.assign({ name, sell, cat: '食材', desc }, ITEM_DB[id] || {}); return id; };
  const IT = {
    radish: ITEM('radish', '萝卜', 6, '青竹菜园里自己种的萝卜。可以卖钱。'), pumpkin: ITEM('pumpkin', '金瓜', 10, '青竹菜园里自己种的金瓜。可以卖钱。'),
    peach: ITEM('peach', '桃', 12, '园里桃树上摘的桃。可以卖钱。'), pear: ITEM('pear', '梨', 12, '园里梨树上摘的梨。可以卖钱。'), plum: ITEM('plum', '李子', 10, '园里李子树上摘的红李子。可以卖钱。'),
    persimmon: ITEM('persimmon', '柿子', 12, '园里柿子树上摘的柿子。可以卖钱。'), grape: ITEM('grape', '葡萄', 10, '葡萄架上剪下来的一串葡萄。可以卖钱。'),
    duck_egg: ITEM('duck_egg', '鸭蛋', 8, '鸭棚稻草里捡的鸭蛋。可以卖钱。'), goose_egg: ITEM('goose_egg', '鹅蛋', 10, '大白鹅下的蛋，比鸭蛋还大一圈。可以卖钱。'),
  };
  const CROP = {
    rice: { name: '灵米', item: ING('灵米'), art: ['rice0', 'rice1'], n: 3 }, cabbage: { name: '青菜', item: ING('青菜'), art: ['bok0', 'bok1'], n: 4 },
    radish: { name: '萝卜', item: IT.radish, art: ['radish0', 'radish1'], n: 4 }, pumpkin: { name: '金瓜', item: IT.pumpkin, art: ['pumpkin0', 'pumpkin1'], n: 3 },
  };
  const PLOT = { plot1: 'rice', plot2: 'cabbage', plot3: 'radish', plot4: 'pumpkin' };
  const SEEDS5 = ['cabbage', 'radish', 'pumpkin'];   // 园屋手浇菜畦能种的（有画的这三样）
  const PL = {}; for (const p of M.plots) PL[p.id] = p;
  const plotSt = id => { const d = D(); let s = d.plots[id]; if (!s) s = d.plots[id] = id === 'plot5' ? { st: 0, crop: null, wet: 0 } : { st: 4, crop: PLOT[id], wet: 0 }; return s; };
  const cropOf = id => CROP[plotSt(id).crop || PLOT[id]];
  const STN = ['空着', '刚下种', '冒芽了', '长起来了', '熟了'];
  window.R175G2_WET = () => { try { return !!plotSt('plot5').wet; } catch (e) { return false; } };

  // ---------- 每歇一次（换一个时辰）：有水的田长一截，鸡鸭下蛋，果子再挂上 ----------
  const KEY = () => (F().qz_day || 1) + '_' + (F().qz_shi || '');
  function tick() {
    const d = D();
    for (const id in PL) { const s = plotSt(id); if (s.st >= 1 && s.st < 4) { const wet = PL[id].watering === 'sluice' || s.wet; if (wet) s.st++; } s.wet = 0; }
    for (const k in d.prod) d.prod[k] = 0; for (const k in d.tree) d.tree[k] = 0;
  }
  setInterval(() => { try { const f = F(); if (!f.g2 || !f.qz_shi) return; const d = D(), k = KEY(); if (d.tk == null) { d.tk = k; return; } if (d.tk !== k) { d.tk = k; tick(); } } catch (e) {} }, 1000);

  // ---------- 东西在哪、站哪儿干 ----------
  const objOf = a => M.objs.filter(e => e.a === a).map(e => { const st = M.static[a]; return { x: e.xy[0], y: e.xy[1], w: st ? st[3] : 100, h: st ? st[4] : 100, f: e.f }; });
  const TG = [];
  const P5 = M.points || {};
  for (const p of M.plots) { const [x, y, w, h] = p.rect; const STAND = { plot1: [1568, 240], plot2: [2208, 496], plot3: [1568, 1040], plot4: [2272, 880], plot5: P5['菜畦田头'] || [1856, 1968] };
    TG.push({ k: 'plot', id: p.id, name: p.name, r: [x, y, w, h], stand: STAND[p.id] || p.approach, top: y }); }
  const TREES = [['estate_peach', 'peach', '桃树'], ['e_estate_peach', 'peach', '桃树'], ['estate_pear', 'pear', '梨树'], ['estate_apple', 'plum', '李子树'], ['estate_persimmon', 'persimmon', '柿子树'], ['e_estate_persimmon', 'persimmon', '柿子树']];
  for (const [a, fr, nm] of TREES) objOf(a).forEach((o, i) => TG.push({ k: 'tree', id: a + '_' + i, fruit: fr, name: nm, r: [o.x + o.w * .12, o.y, o.w * .76, o.h * .8], stand: [o.x + o.w / 2, o.f + 40], top: o.y }));
  objOf('estate_grapes').forEach((o, i) => TG.push({ k: 'tree', id: 'grapes_' + i, fruit: 'grape', name: '葡萄架', r: [o.x, o.y, o.w, o.h], stand: [o.x + o.w / 2, o.f + 36], top: o.y }));
  objOf('shore_coop').forEach(o => TG.push({ k: 'coop', id: 'coop', name: '鸡舍', r: [o.x, o.y, o.w, o.h], stand: [o.x + o.w * .55, o.f + 46], top: o.y }));
  objOf('e_duckshed').forEach(o => TG.push({ k: 'duck', id: 'duck', name: '鸭棚', r: [o.x, o.y, o.w, o.h], stand: P5['鸭棚干岸'] || [1488, 1872], top: o.y }));
  objOf('e_well').forEach(o => TG.push({ k: 'well', id: 'well', name: '石井', r: [o.x, o.y, o.w, o.h], stand: P5['石井'] || [2096, 1840], top: o.y }));
  objOf('e_seeds').forEach(o => TG.push({ k: 'seeds', id: 'seeds', name: '种子柜', r: [o.x, o.y, o.w, o.h], stand: P5['种子柜'] || [1936, 1680], top: o.y }));
  objOf('e_baskets').forEach(o => TG.push({ k: 'basket', id: 'basket', name: '竹篮', r: [o.x, o.y, o.w, o.h], stand: P5['竹篮'] || [1872, 1680], top: o.y }));
  const inRect = (x, y, r) => x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3];
  const tgAt = (x, y) => { let best = null; for (const t of TG) if (inRect(x, y, t.r)) { const a = t.r[2] * t.r[3]; if (!best || a < best.a) best = { t, a }; } return best && best.t; };

  // 能干什么（竹牌）
  const ready = k => !D().prod[k];
  const treeReady = id => !D().tree[id];
  function optsOf(t) {
    if (t.k === 'plot') { const s = plotSt(t.id), c = cropOf(t.id);
      if (s.st >= 4) return [{ k: 'harvest', p: 'harvest' }];
      if (s.st === 0) return [{ k: 'sow', p: 'sow' }];
      if (PL[t.id].watering === 'sluice') return [{ k: 'water', p: 'water', off: '有水渠自己浇着，歇一觉长一截' }];
      return [{ k: 'water', p: 'water', off: s.wet ? '今天浇透了，歇一觉长一截' : null }]; }
    if (t.k === 'tree') return [{ k: 'pick', p: 'pick', off: treeReady(t.id) ? null : '刚摘过，歇一觉再长' }];
    if (t.k === 'coop') return [{ k: 'collect', p: 'collect', off: ready('coop') ? null : '刚捡过，歇一觉再来' }];
    if (t.k === 'duck') return [{ k: 'collect', p: 'collect', off: ready('duck') ? null : '刚捡过，歇一觉再来' }];
    if (t.k === 'well') return [{ k: 'well', p: 'water_row', off: D().pail ? '桶里已经有水了' : null }];
    if (t.k === 'seeds') return [{ k: 'seeds', p: 'sow' }];
    if (t.k === 'basket') return [{ k: 'book', p: 'collect' }];
    return [];
  }
  const LAB = { sow: '播种', water: '浇水', water_row: '打水', harvest: '采收', pick: '采摘', collect: '收产物' };

  // ---------- 干活 ----------
  const give = async (list, title) => { const items = list.filter(([, n]) => n > 0); for (const [id, n] of items) addItem(id, n);
    try { if (window.itemGet) await itemGet(items.map(([id, n]) => ({ icon: 'item:' + id, name: (ITEM_DB[id] && ITEM_DB[id].name) || id, count: '×' + n, desc: (ITEM_DB[id] && ITEM_DB[id].desc) || '' })), title); else toast(title, 1600); } catch (e) { toast(title, 1600); } };
  async function pickSeed() {
    const i = await choose('种子柜 · 手浇菜畦种什么', SEEDS5.map(k => CROP[k].name + '籽').concat(['先不种'])); if (i < 0 || i >= SEEDS5.length) return null; return SEEDS5[i]; }
  async function doAct(t, o, remote) {
    const d = D();
    if (o.k === 'book') { openBook(); return; }
    if (o.k === 'seeds') { const s = plotSt('plot5'); if (s.st !== 0) { toast('菜畦里已经种着' + cropOf('plot5').name + '了', 1600); return; }
      const c = await pickSeed(); if (!c) return; s.crop = c; s.st = 1; snd('ui_confirm', .5); toast('园屋后头的菜畦种上了' + CROP[c].name + '——记得打水来浇', 2200); return; }
    if (o.k === 'well') { d.pail = 1; snd('sfx_water', .5); toast('打了一桶井水，去浇手浇菜畦吧', 1800); return; }
    if (t.k === 'plot') { const s = plotSt(t.id);
      if (o.k === 'sow') { if (t.id === 'plot5') { const c = await pickSeed(); if (!c) return; s.crop = c; } else s.crop = PLOT[t.id]; s.st = 1; s.wet = 0; snd('ui_confirm', .5);
        toast(t.name + '种上了' + cropOf(t.id).name + (PL[t.id].watering === 'sluice' ? '，渠水会自己浇' : '，记得打水来浇'), 2000); return; }
      if (o.k === 'water') { if (!remote && !d.pail) { toast('桶是空的——先去园屋院里的石井打水', 1800); return; } d.pail = 0; s.wet = 1; snd('sfx_water', .5); toast('浇透了，歇一觉就长一截', 1600); return; }
      if (o.k === 'harvest') { if (s.st < 4) return; const c = cropOf(t.id); s.st = 0; s.wet = 0; snd('ui_confirm', .5); await give([[c.item, c.n]], t.name + ' · 收成'); return; } }
    if (t.k === 'tree') { if (!treeReady(t.id)) return; d.tree[t.id] = 1; snd('ui_confirm', .5); await give([[IT[t.fruit], t.fruit === 'grape' ? 3 : 2]], t.name + ' · 采摘'); return; }
    if (t.k === 'coop') { if (!ready('coop')) return; d.prod.coop = 1; await give([[ING('鸡蛋'), 3]], '鸡舍 · 捡蛋'); return; }
    if (t.k === 'duck') { if (!ready('duck')) return; d.prod.duck = 1; await give([[IT.duck_egg, 2], [IT.goose_egg, 1]], '鸭棚 · 捡蛋'); return; }
  }

  // 先走过去（站到田头 / 树下 / 棚前），再干
  function standNear(T, x, y) { for (let r = 0; r <= 160; r += 16) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a / 16 * 6.283) * r, py = y + Math.sin(a / 16 * 6.283) * r; if (canStand(T, px, py)) return [px, py]; if (!r) break; } return [x, y]; }
  async function walkTo(t) {
    const p = world.player, T = world.map.T, [tx, ty] = standNear(T, t.stand[0], t.stand[1]);
    if (Math.hypot(p.x - tx, p.y - ty) < 70) return true;
    const [sc, sr] = cellOf(p.x, p.y), [tc, tr] = cellOf(tx, ty), path = findPath(T, sc, sr, tc, tr); if (!path) { toast('走不过去', 1200); return false; }
    world.path = smoothPath(T, p.x, p.y, path.slice(1)); const t0 = performance.now();
    while (world.path && performance.now() - t0 < 12000) { await new Promise(r => setTimeout(r, 120)); if (world.mapName !== ID) return false; }
    const cx = t.r[0] + t.r[2] / 2, cy = t.r[1] + t.r[3] / 2; p.face = Math.abs(cx - p.x) > Math.abs(cy - p.y) ? (cx > p.x ? 'right' : 'left') : (cy < p.y ? 'up' : 'down');
    return Math.hypot(p.x - tx, p.y - ty) < 120;
  }

  // ---------- 头顶竹牌 ----------
  const z = () => (typeof VZ === 'function' ? VZ() : 1), cam = () => world.cam || { x: 0, y: 0 };
  const toScr = (x, y) => [(x - cam().x) * z(), (y - cam().y) * z()];
  const toW = q => ({ x: q.x / z() + cam().x, y: q.y / z() + cam().y });
  const PQ = { t: null, t0: 0, opts: [] };
  const plaqueRects = () => { const t = PQ.t; if (!t) return []; const [sx, sy] = toScr(t.r[0] + t.r[2] / 2, t.top), n = PQ.opts.length, pw = 180, ph = 64, gap = 10, x0 = sx - (n * pw + (n - 1) * gap) / 2;
    return PQ.opts.map((o, i) => ({ o, x: Math.max(8, Math.min(W - pw - 8, x0 + i * (pw + gap))), y: Math.max(64, Math.min(H - ph - 40, sy - ph - 10)), w: pw, h: ph })); };
  const inR = (q, r) => q && r && q.x >= r.x && q.x <= r.x + r.w && q.y >= r.y && q.y <= r.y + r.h;
  const UI = (k, x, y, w, h) => !!(window.R175G_UI && R175G_UI(k, x, y, w, h));

  // ---------- 园簿 ----------
  const BK = { on: false, tab: 0, t0: 0 };
  const BTN = () => ({ x: W - 104, y: H - 236, w: 84, h: 84 });
  const hasBook = () => !!D().book;
  function openBook() { BK.on = true; BK.t0 = now(); BK.tab = BK.tab || 0; PQ.t = null; world.locked = true; snd('ui_open', .5); }
  function closeBook() { BK.on = false; world.locked = false; snd('ui_close', .5); }
  const PAN = () => { const w = Math.min(1000, W - 40), h = Math.min(580, H - 40); return { x: (W - w) / 2, y: (H - h) / 2, w, h }; };
  const TABS = ['田地', '禽院', '果树'];
  function rows() {
    if (BK.tab === 0) return M.plots.map(p => { const s = plotSt(p.id), c = cropOf(p.id), t = TG.find(x => x.k === 'plot' && x.id === p.id);
      const st = s.st === 0 ? (p.id === 'plot5' ? '翻好了土，等着下种' : '收完了，空着') : (c ? c.name + ' · ' + STN[s.st] : STN[s.st]);
      const wet = s.st >= 1 && s.st < 4 ? (p.watering === 'sluice' ? '渠水自己浇' : s.wet ? '今天浇透了' : '要打井水来浇') : '';
      return { t, icon: c ? c.item : null, name: p.id === 'plot5' ? '园屋手浇菜畦' : (p.name || '') + '田', st, sub: wet, opts: optsOf(t) }; });
    if (BK.tab === 1) return TG.filter(t => t.k === 'coop' || t.k === 'duck').map(t => ({ t, icon: t.k === 'coop' ? ING('鸡蛋') : IT.duck_egg, name: t.k === 'coop' ? '鸡院 · 鸡舍' : '河岸 · 鸭棚',
      st: (t.k === 'coop' ? ready('coop') : ready('duck')) ? (t.k === 'coop' ? '鸡舍里有新下的蛋' : '稻草里有鸭蛋、鹅蛋') : '刚捡过', sub: '每歇一次下一回蛋', opts: optsOf(t) }));
    const seen = {}; return TG.filter(t => t.k === 'tree').map((t, i) => { seen[t.name] = (seen[t.name] || 0) + 1; return { t, icon: IT[t.fruit], name: t.name + (TG.filter(x => x.name === t.name).length > 1 ? ' ' + '一二三'[seen[t.name] - 1] : ''),
      st: treeReady(t.id) ? '挂满了果子' : '刚摘过', sub: t.r[0] < 1000 ? '西岸果林' : '东岸', opts: optsOf(t) }; });
  }
  let BKR = [];   // 这一帧的按钮区
  function drawBook() {
    const P = PAN(), u = Math.min(1, (now() - BK.t0) / .2); BKR = [];
    ctx.save(); ctx.globalAlpha = u; ctx.fillStyle = 'rgba(20,14,6,.55)'; ctx.fillRect(0, 0, W, H);
    // 纸面 + 竹框
    ctx.translate(0, (1 - u) * 16);
    ctx.fillStyle = '#6b4a22'; roundRect(P.x - 8, P.y - 8, P.w + 16, P.h + 16, 18); ctx.fill();
    const g = ctx.createLinearGradient(0, P.y, 0, P.y + P.h); g.addColorStop(0, '#f6ecd2'); g.addColorStop(1, '#ead9b2'); ctx.fillStyle = g; roundRect(P.x, P.y, P.w, P.h, 14); ctx.fill();
    ctx.strokeStyle = '#a5803f'; ctx.lineWidth = 2; roundRect(P.x + 8, P.y + 8, P.w - 16, P.h - 16, 10); ctx.stroke();
    ctx.font = `700 30px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = '#4a2f12'; ctx.fillText('园簿', P.x + 32, P.y + 50);
    ctx.font = `500 15px ${FONT}`; ctx.fillStyle = '#7a5a2e'; ctx.fillText('小桃记的 · 青竹菜园里种的、养的、长的', P.x + 104, P.y + 48);
    // 页签
    TABS.forEach((n, i) => { const r = { x: P.x + P.w - 330 + i * 102, y: P.y + 20, w: 94, h: 40 }, on = BK.tab === i;
      ctx.fillStyle = on ? '#8a5a26' : '#d9c495'; roundRect(r.x, r.y, r.w, r.h, 10); ctx.fill(); ctx.fillStyle = on ? '#fff4da' : '#5a3d18'; ctx.font = `700 19px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(n, r.x + r.w / 2, r.y + 27);
      BKR.push({ r, tab: i }); });
    // 关
    { const r = { x: P.x + P.w - 46, y: P.y - 14, w: 44, h: 44 }; ctx.fillStyle = '#6b4a22'; ctx.beginPath(); ctx.arc(r.x + 22, r.y + 22, 20, 0, 7); ctx.fill(); ctx.strokeStyle = '#f6ecd2'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(r.x + 14, r.y + 14); ctx.lineTo(r.x + 30, r.y + 30); ctx.moveTo(r.x + 30, r.y + 14); ctx.lineTo(r.x + 14, r.y + 30); ctx.stroke(); BKR.push({ r, close: 1 }); }
    // 条目（两列）
    const L = rows(), cols = 2, cw = (P.w - 72) / cols, rh = 86, y0 = P.y + 78;
    L.forEach((it, i) => { const cx = P.x + 28 + (i % cols) * (cw + 16), cy = y0 + Math.floor(i / cols) * (rh + 10); if (cy + rh > P.y + P.h - 14) return;
      ctx.fillStyle = 'rgba(255,250,236,.75)'; roundRect(cx, cy, cw, rh, 10); ctx.fill(); ctx.strokeStyle = 'rgba(150,110,50,.45)'; ctx.lineWidth = 1.5; roundRect(cx, cy, cw, rh, 10); ctx.stroke();
      if (it.icon && typeof itemIcon === 'function') try { itemIcon(it.icon, cx + 40, cy + rh / 2, 24); } catch (e) {}
      ctx.textAlign = 'left'; ctx.fillStyle = '#4a2f12'; ctx.font = `700 19px ${FONT}`; ctx.fillText(it.name, cx + 78, cy + 30);
      ctx.fillStyle = '#6a4a22'; ctx.font = `500 16px ${FONT}`; ctx.fillText(it.st, cx + 78, cy + 54); if (it.sub) { ctx.fillStyle = '#8f7346'; ctx.font = `500 13px ${FONT}`; ctx.fillText(it.sub, cx + 78, cy + 74); }
      const o = it.opts[0]; if (!o || o.k === 'book') return;
      const r = { x: cx + cw - 146, y: cy + (rh - 50) / 2, w: 136, h: 50 }, stt = o.off ? 'disabled' : 'normal';
      if (!UI('plaque_' + o.p + '_' + stt, r.x, r.y, r.w, r.h)) { ctx.fillStyle = o.off ? '#d8d0bd' : '#e9cf8e'; roundRect(r.x, r.y, r.w, r.h, 10); ctx.fill(); ctx.fillStyle = '#3e2810'; ctx.font = `700 19px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(LAB[o.p] || '', r.x + r.w / 2, r.y + 32); }
      BKR.push({ r, it, o }); });
    ctx.restore();
  }

  // ---------- 输入 ----------
  cv.addEventListener('pointerdown', e => { try {
    if (!here()) { PQ.t = null; if (BK.on) closeBook(); return; }
    const q = toLogical(e);
    if (BK.on) { e.stopImmediatePropagation(); e.preventDefault(); if (busy()) return;
      for (const b of BKR) if (inR(q, b.r)) { snd('ui_click', .5);
        if (b.close) { closeBook(); return; } if (b.tab != null) { BK.tab = b.tab; return; }
        if (b.o.off) { toast(b.o.off, 1400); return; }
        world.locked = false; Promise.resolve(doAct(b.it.t, b.o, true)).finally(() => { if (BK.on) world.locked = true; }); return; }
      const P = PAN(); if (!inR(q, P)) closeBook(); return; }
    if (world.locked || busy() || !S.hud) { PQ.t = null; return; }
    if (hasBook() && inR(q, BTN())) { e.stopImmediatePropagation(); e.preventDefault(); openBook(); return; }
    if (PQ.t) { for (const r of plaqueRects()) if (inR(q, r)) { e.stopImmediatePropagation(); e.preventDefault(); const t = PQ.t; PQ.t = null;
        if (r.o.off) { toast(r.o.off, 1400); snd('ui_cancel', .4); return; }
        if (r.o.k === 'book') { openBook(); return; }
        (async () => { if (!(await walkTo(t))) return; const o2 = optsOf(t).find(x => x.k === r.o.k); if (!o2 || o2.off) { if (o2 && o2.off) toast(o2.off, 1400); return; } await doAct(t, o2, false); })(); return; }
      PQ.t = null; }
    const w = toW(q), t = tgAt(w.x, w.y); if (!t) return; const o = optsOf(t); if (!o.length) return;
    e.stopImmediatePropagation(); e.preventDefault(); PQ.t = t; PQ.t0 = now(); PQ.opts = o; snd('ui_click', .4);
  } catch (er) {} }, true);

  addEventListener('keydown', e => { if (BK.on && (e.key === 'Escape' || e.key === 'Backspace')) { e.stopImmediatePropagation(); if (!busy()) closeBook(); } }, true);
  S.overlay.push({ draw() { try {
    if (!here()) { if (BK.on) closeBook(); return; }
    if (BK.on) { drawBook(); return; }
    if (world.locked || busy() || !S.hud) return;
    if (hasBook()) { const b = BTN(), pulse = D().bookNew ? .5 + .5 * Math.sin(now() * 4) : 0;
      ctx.save(); ctx.fillStyle = 'rgba(40,26,8,.45)'; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2 + 3, b.w / 2, 0, 7); ctx.fill();
      if (pulse) { ctx.strokeStyle = 'rgba(255,226,140,' + (.4 + pulse * .5) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 4 + pulse * 3, 0, 7); ctx.stroke(); }
      if (!UI('deed', b.x, b.y, b.w, b.h)) { ctx.fillStyle = '#e9d6a6'; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, 7); ctx.fill(); }
      ctx.font = `700 17px ${FONT}`; ctx.textAlign = 'center'; textOutline('园簿', b.x + b.w / 2, b.y + b.h + 18, '#fff3d6', '#3a2208', 4); ctx.restore(); }
    if (!PQ.t) return;
    const u = Math.min(1, (now() - PQ.t0) / .18), t = PQ.t;
    { ctx.save(); const [x0, y0] = toScr(t.r[0], t.r[1]), [x1, y1] = toScr(t.r[0] + t.r[2], t.r[1] + t.r[3]), L = 18; ctx.strokeStyle = 'rgba(255,248,214,.95)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(60,40,10,.7)'; ctx.shadowBlur = 4;
      for (const [px, py, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { ctx.beginPath(); ctx.moveTo(px + dx * L, py); ctx.lineTo(px, py); ctx.lineTo(px, py + dy * L); ctx.stroke(); } ctx.restore(); }
    ctx.save(); ctx.globalAlpha = u;
    for (const r of plaqueRects()) { const st = r.o.off ? 'disabled' : 'normal', y = r.y + (1 - u) * 10;
      if (!UI('plaque_' + r.o.p + '_' + st, r.x, y, r.w, r.h)) { ctx.fillStyle = r.o.off ? '#d8d0bd' : '#f3e6c2'; roundRect(r.x, y, r.w, r.h, 10); ctx.fill(); ctx.font = `700 22px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#3e2810'; ctx.fillText(LAB[r.o.p] || '', r.x + r.w / 2, y + 40); }
      if (r.o.off) { ctx.font = `600 14px ${FONT}`; ctx.textAlign = 'center'; textOutline(r.o.off, r.x + r.w / 2, y + r.h + 16, '#fff3d6', '#2a1406', 3); } }
    ctx.font = `700 16px ${FONT}`; ctx.textAlign = 'center'; { const [sx, sy] = toScr(t.r[0] + t.r[2] / 2, t.top); textOutline(t.name, sx, Math.max(56, Math.min(H - 110, sy - 84)), '#fff3d6', '#3a2208', 4); }
    ctx.restore();
  } catch (e) {} } });

  // ---------- 作物按长势画（种子 / 冒芽 / 长起来 / 熟了）----------
  const SCALE = [0, 0, .42, .7, 1];
  drawBaked = (o => function (ob) {
    const e = ob && (ob.r175g2e || ob.r175g2c);
    if (e && e.plot && world.mapName === ID) { const s = plotSt(e.plot), k = SCALE[s.st] || 0; if (!k) return;
      if (k === 1 && !ob.r175g2c) return o.apply(this, arguments);
      const im = IMG[ob.img]; if (!im) return; const fx = e.fx, fy = ob.sy, lx = fx - ob.x, ly = fy - ob.y;
      ctx.drawImage(im, fx - lx * k, fy - ly * k, ob.w * k, ob.h * k); return; }
    return o.apply(this, arguments); })(drawBaked);
  // 手浇菜畦的作物（原图上是空畦，按选的种子摆上去）
  const P5P = (PL.plot5 && PL.plot5.plants) || [];
  drawGroundVis = (o => function () {
    o.apply(this, arguments);
    try { if (world.mapName !== ID) return; const T = world.map && world.map.T; if (!T || !T.objs) return; T.objs = T.objs.filter(q => !q.r175g2c);
      const s = plotSt('plot5'), c = cropOf('plot5'); if (!c || s.st < 2) return;
      P5P.forEach((p, i) => { const a = c.art[(i + (i >> 1)) % 2], im = IMG['r175g2_' + a], ft = (M.foots || {})[a]; if (!im || !ft) return;
        T.objs.push({ bk: true, id: 'r175g2c' + i, img: 'r175g2_' + a, x: p.foot[0] - ft[0], y: p.foot[1] - ft[1], w: im.width, h: im.height, sy: p.foot[1], flat: false, r175g2c: { plot: 'plot5', fx: p.foot[0] } }); });
    } catch (e) {}
  })(drawGroundVis);

  // ---------- 园子里的人：除了子时都有人（r135 的行走图和干活动作）----------
  const SHI = () => F().qz_shi || (() => { const t = typeof TOD === 'function' ? TOD() : ''; return t === 'dawn' ? '卯' : t === 'dusk' ? '酉' : t === 'night' ? '戌' : '午'; })();
  const N = TMAPS[ID].npcs = TMAPS[ID].npcs || [];
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const statusLine = () => { const out = [];
    const ripe = M.plots.filter(p => plotSt(p.id).st >= 4).map(p => cropOf(p.id).name); if (ripe.length) out.push([...new Set(ripe)].join('、') + '熟了，可以收了');
    const dry = plotSt('plot5'); if (dry.st >= 1 && dry.st < 4 && !dry.wet) out.push('园屋后头那块菜畦该浇水了'); if (dry.st === 0) out.push('园屋后头那块菜畦空着，种子柜里有籽');
    if (ready('coop')) out.push('鸡舍里有蛋'); if (ready('duck')) out.push('鸭棚里有蛋');
    const tr = TG.filter(t => t.k === 'tree' && treeReady(t.id)).length; if (tr) out.push('果林里有 ' + tr + ' 棵树挂着果子');
    return out.length ? out.join('；') + '。' : '园里的活都干完了，歇一觉再来看看吧。'; };
  const ROT = {
    '卯': { who: 'servant', name: '小厮阿福', x: 520, y: 1930, job: 'carry', route: [380, 720], face: 1, lines: ['少爷早！鸡比阿福起得还早，天没亮就在院里刨食了。', '阿福先给鸡添水，一会儿去捡蛋——少爷要不要一起？', '那只大公鸡凶得很，上回追着阿福啄了半个院子。'] },
    '午': { who: 'maid2', name: '侍女小桃', x: 2256, y: 770, job: 'water', face: -1, lines: ['日头正好，小桃来给菜浇浇水。', '少爷您看那金瓜，比小桃的脑袋还大了！', '园簿上都记着呢，哪块地熟了，翻一翻就知道。'] },
    '酉': { who: 'steward', name: '松伯', x: 1660, y: 236, face: -1, lines: ['老头子来看看水车。这车转了三十年，比少爷年纪还大。', '水往田里走得匀，庄稼就长得齐。', '天快黑了，少爷早些回院里，夜里河边凉。'] },
    '戌': { who: 'maid1', name: '侍女青禾', x: 1900, y: 1790, job: 'sweep', route: [1820, 2140], face: 1, lines: ['晒架上的菜干得收了，夜里一返潮就白晒了。', '园屋的门我闩好了，鸡舍也看过了。', '少爷夜里还过来呀？灯笼给您留着。'] },
  };
  for (const s in ROT) { const R = ROT[s], [c, r] = P(R.x, R.y);
    const n = { key: 'none', name: R.name, c, r, h: 108, wander: false, random: true, r135e: R.who, job: R.job, route: R.route, face: R.face, g2rot: s,
      cond: () => SHI() === s && !!D().intro,
      talk: async () => { const i = await choose(R.name.replace(/^(侍女|小厮)/, ''), ['说说话', '园里有什么活？', '走开']); if (i === 0) await say(R.name, R.lines[Math.floor(Math.random() * R.lines.length)]); else if (i === 1) await say(R.name, statusLine()); } };
    if (R.who === 'steward') delete n.job; N.push(n); }

  // ---------- 第一次来：小桃带路 ----------
  const GATE = M.spawn;
  const guide = { key: 'none', name: '侍女小桃', c: P(GATE[0] - 150, GATE[1] + 40)[0], r: P(GATE[0] - 150, GATE[1] + 40)[1], h: 108, wander: false, random: false, r135e: 'maid2', face: 1, g2guide: 1,
    cond: () => !D().intro, talk: () => intro() };
  N.push(guide);
  const TOUR = [
    [[1780, 640], '这四块田挨着水渠。水车把河水一斗一斗舀上来，顺着渠流进田里——灵米、青菜、萝卜、金瓜，不用浇也长。'],
    [[1290, 230], '那架木水车是松伯年轻时候装的，傍晚他常过来看看水走得匀不匀。'],
    [[480, 1760], '河那边是鸡院。阿福每天一早去喂鸡、捡蛋，那只大公鸡可凶了，少爷当心。'],
    [[1380, 1860], '鸭子和鹅住在河边那间小棚里，蛋就下在棚底的稻草上。'],
    [[1990, 1700], '这是园屋。种子柜、竹篮都在屋檐下，院里那口石井的水最甜。'],
    [[1872, 2140], '园屋后头这一块是少爷自己的菜畦，没有水渠，得从井里打水来浇。想种什么，去种子柜挑。'],
    [[400, 420], '西边那片是果林，桃、梨、李子、柿子，还有一架葡萄，熟了就能摘。'],
  ];
  let introBusy = false;
  async function intro() {
    if (introBusy || D().intro) return; introBusy = true;
    const p = world.player; world.locked = true;
    try {
      const a = (world.actors || []).find(x => x.npc && x.npc.g2guide);
      if (a && p) await moveActor(a, p.x - 90, p.y + 6, 160);
      const late = SHI() === '子' || SHI() === '戌';
      await say('侍女小桃·笑', (late ? '少爷这么晚还过来呀……小桃提着灯陪您走一圈。' : '少爷！') + '松伯说菜园以后交给少爷管了，小桃带您认认地方——跟紧了哦。');
      for (const [pt, line] of TOUR) { world.camFocus = pt; await new Promise(r => setTimeout(r, 900)); await say('侍女小桃', line); }
      world.camFocus = null; await new Promise(r => setTimeout(r, 600));
      await say('侍女小桃·得意', '少爷记不住也没关系——小桃都写在这本《园簿》上了。哪块地熟了、鸡舍有没有蛋，翻一翻就知道。');
      const d = D(); d.intro = 1; d.book = 1; d.bookNew = 1;
      try { if (window.itemGet) await itemGet([{ icon: 'gold', name: '园簿', count: '×1', desc: '小桃手抄的菜园簿子。在菜园里点右下角的「园簿」，田地、禽院、果树一处就能管。' }], '获得'); } catch (e) {}
      await say('侍女小桃·笑', '平日里园子里都有人：早上阿福喂鸡，晌午小桃来浇菜，傍晚松伯看水车，入夜青禾姐来收菜干。少爷有事就喊我们！');
      if (a) { await moveActor(a, GATE[0] - 20, GATE[1] + 10, 150); a.hidden = true; }
    } finally { world.camFocus = null; world.locked = false; introBusy = false; }
  }
  // 进门自动开始
  setInterval(() => { try { if (!here() || D().intro || introBusy || world.locked || busy()) return; if (window.MAP_READY && !MAP_READY()) return; const a = (world.actors || []).find(x => x.npc && x.npc.g2guide); if (a) intro(); } catch (e) {} }, 800);
  // 打开过一次园簿，按钮就不再闪
  { const ob = openBook; openBook = function () { D().bookNew = 0; return ob.apply(this, arguments); }; }

  window.R175G2F = { D, plotSt, tick, TG, optsOf, doAct, openBook, intro, ROT, PQ, tgAt, toW };
})();
