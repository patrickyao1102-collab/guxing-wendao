// ================= R175 · 青竹菜园 · 种地（播种 / 浇水 / 每歇一次长一截 / 采收；果树开花结果；畜舍出产物）=================
// 不在布置模式时，点田块、果树、畜舍、蜂箱、水井 → 头顶挂出 R166 竹牌（播种 / 浇水 / 采收 / 采摘 / 收产物 / 取蜜 / 打水）。
// 每歇一次（换一个时辰）：浇过水的田长一截（种子 → 幼苗 → 长成 → 成熟），然后田又干了；挨着竹笕出水口的田、挨水的水田自己有水。
// 果树：长叶 → 开花 → 挂果，摘完歇一次又长叶；畜舍、蜂箱、葡萄架每歇一次能收一回。收的东西进行囊，厨房的食材直接用厨房那一份。
(function () {
  const G0 = window.R175G, U = window.R175G_U; if (!G0 || !U) return;
  const { GID, GS } = G0;
  const ICO = {"watermelon":0,"yamred":1,"lotus_root":2,"water_bamboo":3,"peach":4,"plum":5,"pear":6,"persimmon":7,"grape":8,"duck_egg":9,"cow_milk":10,"wool":11,"goose_feather":12,"spirit_fruit":13,"radish":14,"scallion":15,"pumpkin":16,"pea":17,"goose_egg":18,"goat_milk":19,"rabbit_fur":20,"stardew":21};
  const F = () => (S.flags = S.flags || {});
  const now = () => performance.now() / 1000;
  // ---------- 收成 → 物品 ----------
  const INGS = ['竹笋', '莲子', '红枣', '桂花', '糯米', '青菜', '豆腐', '香菇', '鸡蛋', '灵米', '山药', '蜂蜜'];
  const ING = n => 'ing_' + INGS.indexOf(n);   // 厨房（r139）已有的食材
  const NM = { radish: '萝卜', scallion: '香葱', pea: '甜豌豆', pumpkin: '金瓜', watermelon: '西瓜', yamred: '红薯', lotus_root: '莲藕', water_bamboo: '茭白', stardew: '星露灵草',
    peach: '桃', plum: '李子', pear: '梨', persimmon: '柿子', spirit_fruit: '灵果', grape: '葡萄', duck_egg: '鸭蛋', goose_egg: '鹅蛋', goose_feather: '鹅羽', rabbit_fur: '兔绒', goat_milk: '羊奶', wool: '羊毛', cow_milk: '牛奶' };
  const SELL = { radish: 6, scallion: 5, pea: 8, pumpkin: 10, watermelon: 14, yamred: 8, lotus_root: 14, water_bamboo: 12, stardew: 60, peach: 12, plum: 10, pear: 12, persimmon: 12, spirit_fruit: 80, grape: 10, duck_egg: 8, goose_egg: 10, goose_feather: 10, rabbit_fur: 16, goat_milk: 12, wool: 18, cow_milk: 12 };
  const DESC = { stardew: '灵田里长的星露灵草，叶尖挂着一点星光似的露。', spirit_fruit: '灵脉谷里灵果树结的果子，咬一口满嘴清甜的灵气。', goose_feather: '大白鹅身上掉的羽毛，攒多了能做扇子。', rabbit_fur: '兔窝里梳下来的绒毛，软乎乎的。', wool: '羊圈里剪下的羊毛，可以拿去换钱，也能做冬衣。' };
  for (const k in NM) ITEM_DB['r175i_' + k] = Object.assign(ITEM_DB['r175i_' + k] || {}, { name: NM[k], sell: SELL[k], cat: '食材', desc: (DESC[k] || '青竹菜园里自己种、自己养出来的' + NM[k] + '。') + '可以卖钱。' });
  const OUT = k => ITEM_DB['r175i_' + k] ? 'r175i_' + k : k;
  const CROP = { cabbage: ING('青菜'), radish: OUT('radish'), scallion: OUT('scallion'), pea: OUT('pea'), yam: ING('山药'), pumpkin: OUT('pumpkin'), watermelon: OUT('watermelon'), yamred: OUT('yamred'), rice: ING('灵米'), lotus_root: OUT('lotus_root'), water_bamboo: OUT('water_bamboo'), stardew: OUT('stardew') };
  const TREE = { peach: OUT('peach'), plum: OUT('plum'), pear: OUT('pear'), persimmon: OUT('persimmon'), jujube: ING('红枣'), osmanthus: ING('桂花'), spirit: OUT('spirit_fruit') };
  const PROD = { henhouse: [[ING('鸡蛋'), 2]], duck_shed: [[OUT('duck_egg'), 2]], goose_shelter: [[OUT('goose_egg'), 1], [OUT('goose_feather'), 1]], hutch: [[OUT('rabbit_fur'), 1]],
    goat_pen: [[OUT('goat_milk'), 1], [OUT('wool'), 1]], ox_byre: [[OUT('cow_milk'), 2]], hive: [[ING('蜂蜜'), 1]], fishpond: [['fish_carp', 1]], trellis_h: [[OUT('grape'), 3]], trellis_v: [[OUT('grape'), 3]] };
  const nameOf = id => (ITEM_DB[id] && ITEM_DB[id].name) || id;
  // 行囊图标：第 9 批食材格 + R166 收获图标
  let IC = null; const icLoad = () => { if (IC !== null) return; IC = 0; const i = new Image(); i.onload = () => { IC = i; }; i.src = (window.R162_ASSETS && R162_ASSETS['r175g/icons.webp']) || 'r175g/icons.webp'; };
  setTimeout(icLoad, 8000);
  if (typeof itemIcon === 'function') itemIcon = (o => function (id, x, y, r) {
    if (/^r175i_/.test(id)) { icLoad(); const k = id.slice(6), n = ICO[k]; if (IC && n != null) { const s = r * 2.3; ctx.drawImage(IC, (n % 8) * 128, Math.floor(n / 8) * 128, 128, 128, x - s / 2, y - s / 2, s, s); return; } }
    return o.apply(this, arguments); })(itemIcon);
  window.R175G_HARVEST1 = k => { const id = CROP[k]; if (id) addItem(id, 1); };

  // ---------- 每歇一次 ----------
  const KEY = () => (F().qz_day || 1) + '_' + (F().qz_shi || '');
  const autoWet = m => { const [w, h] = U.fpOf(m); if (m.soil === 'paddy') { for (let r = m.r; r < m.r + h; r++) for (let c = m.c; c < m.c + w; c++) if (U.wet(c, r)) return true; }
    const O = U.occ(m); for (let r = m.r - 1; r <= m.r + h; r++) for (let c = m.c - 1; c <= m.c + w; c++) { const o = O[c + ',' + r]; if (o && o.k === 'flume_spout') return true; } return false; };
  function tick() {
    const g = GS(); for (const m of g.mods) { if (U.isBuilding(m)) continue; const c = U.catOf(m);
      if (m.k === 'bed') { const wet = m.wet || autoWet(m); if (wet) for (const cp of m.crops || []) if (cp && cp.st < 3) cp.st++; m.wet = autoWet(m) ? 1 : 0; }
      else if (c && c.tree) m.ts = m.ts === 'leaf' ? 'flower' : m.ts === 'flower' ? 'fruit' : m.ts === 'picked' ? 'leaf' : (m.ts || 'leaf');
      if (PROD[m.k]) m.rd = 1; } }
  setInterval(() => { try { const g = F().r175g; if (!g || !g.mods) return; const k = KEY(); if (g.tk == null) { g.tk = k; return; } if (g.tk !== k) { g.tk = k; tick(); if (world.mapName === GID && world.map) G0.rebuildObjs(world.map.T); } } catch (e) {} }, 1000);
  // 刚开局那座鸡舍今天就能捡蛋；新摆的要歇一次才有
  const ready = m => m.rd === 1 || (m.rd === undefined && m.u === 'starter_coop');

  // ---------- 点模块：竹牌 ----------
  const PQ = { m: null, t0: 0, opts: [] };
  const busy = () => (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice) || (window.IG_OPEN && IG_OPEN()) || (typeof sysPanel !== 'undefined' && sysPanel);
  const inR = (q, r) => q && r && q.x >= r.x && q.x <= r.x + r.w && q.y >= r.y && q.y <= r.y + r.h;
  const crops = m => (m.crops || []).filter(Boolean);
  function optsOf(m) {
    const c = U.catOf(m); if (!c) return [];
    if (m.k === 'bed') { const L = crops(m); if (!L.length) return [{ k: 'sow', p: 'sow' }]; const o = [];
      if (L.some(x => x.st >= 3)) o.push({ k: 'harvest', p: 'harvest' });
      if (L.some(x => x.st < 3)) o.push({ k: 'water', p: 'water', off: m.wet || autoWet(m) ? (autoWet(m) ? '有水自己长' : '今天浇过了') : null }); return o; }
    if (c.tree) return m.ts === 'fruit' ? [{ k: 'pick', p: 'pick' }] : [{ k: 'info', p: 'pick', off: m.ts === 'flower' ? '开花了，歇一觉就结果' : m.ts === 'picked' ? '刚摘过，歇一觉再长' : '长着叶子，歇一觉开花' }];
    if (m.k === 'hive') return [{ k: 'collect', p: 'honey', off: ready(m) ? null : '蜜还没满，歇一觉再来' }];
    if (PROD[m.k]) return [{ k: 'collect', p: /trellis/.test(m.k) ? 'pick' : 'collect', off: ready(m) ? null : '刚收过，歇一觉再来' }];
    if (m.k === 'well') return [{ k: 'well', p: 'water_row' }];
    return []; }
  const plaqueRects = () => { const m = PQ.m; if (!m) return []; const [w, h] = U.fpOf(m), a = U.A(U.imgOf(m)), top = (m.r + h) * 64 - (a ? (a.f ? a.f[1] : a.d[1]) : h * 64);
    const [sx, sy] = U.toScr((m.c + w / 2) * 64, top), n = PQ.opts.length, pw = 196, ph = 70, gap = 10, x0 = sx - (n * pw + (n - 1) * gap) / 2;
    return PQ.opts.map((o, i) => ({ o, x: Math.max(8, Math.min(W - pw - 8, x0 + i * (pw + gap))), y: Math.max(8, sy - ph - 14), w: pw, h: ph })); };
  const open = m => { PQ.m = m; PQ.t0 = now(); PQ.opts = optsOf(m); try { playSnd('ui_click', .4); } catch (e) {} };
  cv.addEventListener('pointerdown', e => { try {
    if (world.mapName !== GID || world.locked || busy() || (U.B && U.B.on) || !S.hud) { PQ.m = null; return; }
    const q = toLogical(e);
    if (PQ.m) { for (const r of plaqueRects()) if (inR(q, r)) { e.stopImmediatePropagation(); e.preventDefault(); if (r.o.off) { toast(r.o.off, 1400); try { playSnd('ui_cancel', .4); } catch (er) {} } else act(PQ.m, r.o); PQ.m = null; return; } PQ.m = null; }
    const w = U.toWorld(q), m = U.modAt(w.x, w.y); if (!m || U.isBuilding(m)) return; const o = optsOf(m); if (!o.length) return;
    e.stopImmediatePropagation(); e.preventDefault(); open(m);
  } catch (er) {} }, true);
  S.overlay.push({ draw() { try {
    if (!PQ.m || world.mapName !== GID || world.locked || busy() || (U.B && U.B.on)) { if (PQ.m && (world.mapName !== GID || (U.B && U.B.on))) PQ.m = null; return; }
    const u = Math.min(1, (now() - PQ.t0) / .18), m = PQ.m, [w, h] = U.fpOf(m);
    // 选中的东西：四角括角
    { const z = VZ(), cam = world.cam || { x: 0, y: 0 }; ctx.save(); ctx.scale(z, z); ctx.translate(-cam.x, -cam.y); const x = m.c * 64, y = m.r * 64, L = 20; ctx.strokeStyle = 'rgba(255,248,214,.95)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(60,40,10,.7)'; ctx.shadowBlur = 4;
      for (const [px, py, dx, dy] of [[x, y, 1, 1], [x + w * 64, y, -1, 1], [x, y + h * 64, 1, -1], [x + w * 64, y + h * 64, -1, -1]]) { ctx.beginPath(); ctx.moveTo(px + dx * L, py); ctx.lineTo(px, py); ctx.lineTo(px, py + dy * L); ctx.stroke(); } ctx.restore(); }
    ctx.save(); ctx.globalAlpha = u;
    for (const r of plaqueRects()) { const st = r.o.off ? 'disabled' : 'normal', y = r.y + (1 - u) * 10;
      if (!U.ui('plaque_' + r.o.p + '_' + st, r.x, y, r.w, r.h)) { ctx.fillStyle = r.o.off ? '#d8d0bd' : '#f3e6c2'; ctx.fillRect(r.x, y, r.w, r.h); ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#3e2810'; ctx.fillText({ sow: '播种', water: '浇水', harvest: '采收', pick: '采摘', collect: '收产物', well: '打水', info: '看看' }[r.o.k] || '', r.x + r.w / 2, y + 44); }
      if (r.o.off) { ctx.font = `600 14px ${FONT}`; ctx.textAlign = 'center'; textOutline(r.o.off, r.x + r.w / 2, y + r.h + 16, '#fff3d6', '#2a1406', 3); } }
    ctx.restore(); } catch (e) {} } });

  // ---------- 动作：先走过去 ----------
  async function walkNear(m) {
    const p = world.player, [w, h] = U.fpOf(m), tx = (m.c + w / 2) * 64, ty = (m.r + h) * 64 + 26;
    if (Math.hypot(p.x - tx, p.y - ty) < 130 || Math.abs(p.x - tx) < w * 32 + 40 && p.y > m.r * 64 - 30 && p.y < (m.r + h) * 64 + 70) return true;
    const T = world.map.T, [sc, sr] = cellOf(p.x, p.y), [tc, tr] = cellOf(tx, ty), path = findPath(T, sc, sr, tc, tr); if (!path) return true;
    world.path = smoothPath(T, p.x, p.y, path.slice(1)); const t0 = performance.now();
    while (world.path && performance.now() - t0 < 9000) { await new Promise(r => setTimeout(r, 120)); if (world.mapName !== GID) return false; }
    p.face = 'up'; return Math.hypot(p.x - tx, p.y - ty) < 260; }
  const pop = (txt) => toast(txt, 1600);
  async function act(m, o) {
    if (o.k === 'sow') { U.enter(); U.B.tab = 1; U.B.sel = null; U.flash('选一样种子，再点这块田', 2.4); return; }
    if (!(await walkNear(m))) return;
    if (o.k === 'water') { m.wet = 1; splash(m); try { playSnd('sfx_water', .5); } catch (e) { try { playSnd('ui_confirm', .4); } catch (er) {} } pop('浇好了，歇一觉就长一截'); return; }
    if (o.k === 'harvest') { const got = {}; m.crops = (m.crops || []).map(cp => { if (cp && cp.st >= 3) { const id = CROP[cp.k]; if (id) { addItem(id, 1); got[id] = (got[id] || 0) + 1; } return null; } return cp; });
      try { playSnd('ui_confirm', .6); } catch (e) {} pop(Object.keys(got).map(id => nameOf(id) + ' +' + got[id]).join('　') + '　收进行囊'); return; }
    if (o.k === 'pick') { const c = U.catOf(m); if (c.tree) { const id = TREE[c.tree]; addItem(id, 3); m.ts = 'picked'; pop(nameOf(id) + ' +3　收进行囊'); } else { for (const [id, n] of PROD[m.k] || []) addItem(id, n); m.rd = 0; pop(nameOf((PROD[m.k] || [[]])[0][0]) + ' +' + ((PROD[m.k] || [[0, 0]])[0][1]) + '　收进行囊'); } try { playSnd('ui_confirm', .6); } catch (e) {} return; }
    if (o.k === 'collect') { const L = PROD[m.k] || []; for (const [id, n] of L) addItem(id, n); m.rd = 0; try { playSnd('ui_confirm', .6); } catch (e) {} pop(L.map(([id, n]) => nameOf(id) + ' +' + n).join('　') + '　收进行囊'); return; }
    if (o.k === 'well') { let n = 0; for (const b of GS().mods) if (b.k === 'bed' && crops(b).some(x => x.st < 3) && Math.abs(b.c + 1 - m.c) <= 4 && Math.abs(b.r + 1 - m.r) <= 4) { b.wet = 1; splash(b); n++; } pop(n ? '打了一桶水，旁边 ' + n + ' 畦都浇上了' : '旁边没有要浇的田'); return; }
  }
  // 浇水水花（程序画的小水珠，落在田上）
  const SPL = [];
  const splash = m => { const t = now(); for (let i = 0; i < 10; i++) SPL.push({ x: m.c * 64 + 16 + Math.random() * 96, y: m.r * 64 + 20 + Math.random() * 96, t0: t + Math.random() * .3 }); };
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function () { const r = o.apply(this, arguments); try { if (world.mapName === GID && SPL.length) { const t = now(); ctx.save();
      for (let i = SPL.length - 1; i >= 0; i--) { const s = SPL[i], u = (t - s.t0) / .5; if (u < 0) continue; if (u >= 1) { SPL.splice(i, 1); continue; } ctx.globalAlpha = (1 - u) * .85; ctx.fillStyle = '#d8f2ff'; ctx.beginPath(); ctx.ellipse(s.x, s.y - 26 * (1 - u), 3, 5, 0, 0, 7); ctx.fill(); ctx.globalAlpha = u * (1 - u) * 2; ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(s.x, s.y, 4 + u * 10, 2 + u * 4, 0, 0, 7); ctx.stroke(); }
      ctx.restore(); } } catch (e) {} return r; })(tileAmbientHigh);
})();
