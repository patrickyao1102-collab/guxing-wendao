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
  setInterval(() => { try { const g = F().r175g; if (!g || !g.mods || !F().qz_shi) return; /* 出了青竹 qz_shi 会被清空，那不算歇了一次 */ const k = KEY(); if (g.tk == null) { g.tk = k; return; } if (g.tk !== k) { g.tk = k; tick(); if (world.mapName === GID && world.map) G0.rebuildObjs(world.map.T); } } catch (e) {} }, 1000);
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
    // 走过去的这几秒里可能又点了一次、或者被收回了：到了再看一眼还能不能收（不然会重复进账）
    if (!GS().mods.includes(m)) return;
    if ((o.k === 'collect' && !ready(m)) || (o.k === 'pick' && (U.catOf(m).tree ? m.ts !== 'fruit' : !ready(m)))) return;
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
// ================= R175 · 青竹菜园 · 畜舍门前的鸡鸭鹅兔、牛羊马鹿；鱼塘里的锦鲤草鱼；蜂箱上的飞蜂（Codex 第 6 批动物）=================
(function () {
  const G0 = window.R175G, U = window.R175G_U; if (!G0 || !U) return;
  const { GID, GS } = G0;
  const AN = {"a":{"hen_adult_walk":{"d":[48,44],"f":[24,44],"n":4,"fps":7},"hen_adult_eat":{"d":[48,44],"f":[24,44],"n":4,"fps":5},"hen_adult_idle":{"d":[48,44],"f":[24,44],"n":4,"fps":4},"hen_young_walk":{"d":[34,31],"f":[17,31],"n":4,"fps":7},"hen_young_eat":{"d":[34,31],"f":[17,31],"n":4,"fps":5},"hen_young_idle":{"d":[34,31],"f":[17,31],"n":4,"fps":4},"duck_adult_walk":{"d":[48,40],"f":[24,40],"n":4,"fps":7},"duck_adult_eat":{"d":[48,40],"f":[24,40],"n":4,"fps":5},"duck_adult_idle":{"d":[48,40],"f":[24,40],"n":4,"fps":4},"duck_young_walk":{"d":[34,29],"f":[17,29],"n":4,"fps":7},"duck_young_eat":{"d":[34,29],"f":[17,29],"n":4,"fps":5},"duck_young_idle":{"d":[34,29],"f":[17,29],"n":4,"fps":4},"goose_adult_walk":{"d":[60,54],"f":[30,54],"n":4,"fps":7},"goose_adult_eat":{"d":[60,54],"f":[30,54],"n":4,"fps":5},"goose_adult_idle":{"d":[60,54],"f":[30,54],"n":4,"fps":4},"goose_young_walk":{"d":[42,38],"f":[21,38],"n":4,"fps":7},"goose_young_eat":{"d":[42,38],"f":[21,38],"n":4,"fps":5},"goose_young_idle":{"d":[42,38],"f":[21,38],"n":4,"fps":4},"rabbit_adult_walk":{"d":[42,34],"f":[21,34],"n":4,"fps":7},"rabbit_adult_eat":{"d":[42,34],"f":[21,34],"n":4,"fps":5},"rabbit_adult_idle":{"d":[42,34],"f":[21,34],"n":4,"fps":4},"rabbit_young_walk":{"d":[29,24],"f":[14.5,24],"n":4,"fps":7},"rabbit_young_eat":{"d":[29,24],"f":[14.5,24],"n":4,"fps":5},"rabbit_young_idle":{"d":[29,24],"f":[14.5,24],"n":4,"fps":4},"ox_adult_walk":{"d":[102,83],"f":[51,83],"n":4,"fps":7},"ox_adult_eat":{"d":[102,83],"f":[51,83],"n":4,"fps":5},"ox_adult_idle":{"d":[102,83],"f":[51,83],"n":4,"fps":4},"ox_young_walk":{"d":[71,58],"f":[35.5,58],"n":4,"fps":7},"ox_young_eat":{"d":[71,58],"f":[35.5,58],"n":4,"fps":5},"ox_young_idle":{"d":[71,58],"f":[35.5,58],"n":4,"fps":4},"horse_adult_walk":{"d":[103,95],"f":[51.5,95],"n":4,"fps":7},"horse_adult_eat":{"d":[103,95],"f":[51.5,95],"n":4,"fps":5},"horse_adult_idle":{"d":[103,95],"f":[51.5,95],"n":4,"fps":4},"horse_young_walk":{"d":[72,66],"f":[36,66],"n":4,"fps":7},"horse_young_eat":{"d":[72,66],"f":[36,66],"n":4,"fps":5},"horse_young_idle":{"d":[72,66],"f":[36,66],"n":4,"fps":4},"deer_adult_walk":{"d":[87,82],"f":[43.5,82],"n":4,"fps":7},"deer_adult_eat":{"d":[87,82],"f":[43.5,82],"n":4,"fps":5},"deer_adult_idle":{"d":[87,82],"f":[43.5,82],"n":4,"fps":4},"deer_young_walk":{"d":[61,57],"f":[30.5,57],"n":4,"fps":7},"deer_young_eat":{"d":[61,57],"f":[30.5,57],"n":4,"fps":5},"deer_young_idle":{"d":[61,57],"f":[30.5,57],"n":4,"fps":4},"goat_adult_walk":{"d":[71,62],"f":[35.5,62],"n":4,"fps":7},"goat_adult_eat":{"d":[71,62],"f":[35.5,62],"n":4,"fps":5},"goat_adult_idle":{"d":[71,62],"f":[35.5,62],"n":4,"fps":4},"goat_young_walk":{"d":[50,44],"f":[25,44],"n":4,"fps":7},"goat_young_eat":{"d":[50,44],"f":[25,44],"n":4,"fps":5},"goat_young_idle":{"d":[50,44],"f":[25,44],"n":4,"fps":4},"koi_adult_swim":{"d":[62,30],"f":[31,30],"n":6,"fps":8},"koi_adult_feed":{"d":[62,30],"f":[31,30],"n":4,"fps":6},"koi_adult_idle":{"d":[62,30],"f":[31,30],"n":4,"fps":4},"koi_young_swim":{"d":[38,21],"f":[19,21],"n":6,"fps":8},"koi_young_feed":{"d":[38,21],"f":[19,21],"n":4,"fps":6},"koi_young_idle":{"d":[38,21],"f":[19,21],"n":4,"fps":4},"grassfish_adult_swim":{"d":[62,30],"f":[31,30],"n":6,"fps":8},"grassfish_adult_feed":{"d":[62,30],"f":[31,30],"n":4,"fps":6},"grassfish_adult_idle":{"d":[62,30],"f":[31,30],"n":4,"fps":4},"grassfish_young_swim":{"d":[38,21],"f":[19,21],"n":6,"fps":8},"grassfish_young_feed":{"d":[38,21],"f":[19,21],"n":4,"fps":6},"grassfish_young_idle":{"d":[38,21],"f":[19,21],"n":4,"fps":4},"hive_bees":{"d":[59,45],"f":[37,54],"n":6,"fps":9}},"r":{"horse_adult_walk#0":[0,0,103,95],"horse_adult_walk#1":[105,0,103,95],"horse_adult_walk#2":[210,0,103,95],"horse_adult_walk#3":[315,0,103,95],"horse_adult_eat#0":[420,0,103,95],"horse_adult_eat#1":[525,0,103,95],"horse_adult_eat#2":[630,0,103,95],"horse_adult_eat#3":[735,0,103,95],"horse_adult_idle#0":[840,0,103,95],"horse_adult_idle#1":[0,97,103,95],"horse_adult_idle#2":[105,97,103,95],"horse_adult_idle#3":[210,97,103,95],"ox_adult_walk#0":[315,97,102,83],"ox_adult_walk#1":[419,97,102,83],"ox_adult_walk#2":[523,97,102,83],"ox_adult_walk#3":[627,97,102,83],"ox_adult_eat#0":[731,97,102,83],"ox_adult_eat#1":[835,97,102,83],"ox_adult_eat#2":[0,194,102,83],"ox_adult_eat#3":[104,194,102,83],"ox_adult_idle#0":[208,194,102,83],"ox_adult_idle#1":[312,194,102,83],"ox_adult_idle#2":[416,194,102,83],"ox_adult_idle#3":[520,194,102,83],"deer_adult_walk#0":[624,194,87,82],"deer_adult_walk#1":[713,194,87,82],"deer_adult_walk#2":[802,194,87,82],"deer_adult_walk#3":[891,194,87,82],"deer_adult_eat#0":[0,279,87,82],"deer_adult_eat#1":[89,279,87,82],"deer_adult_eat#2":[178,279,87,82],"deer_adult_eat#3":[267,279,87,82],"deer_adult_idle#0":[356,279,87,82],"deer_adult_idle#1":[445,279,87,82],"deer_adult_idle#2":[534,279,87,82],"deer_adult_idle#3":[623,279,87,82],"horse_young_walk#0":[712,279,72,66],"horse_young_walk#1":[786,279,72,66],"horse_young_walk#2":[860,279,72,66],"horse_young_walk#3":[934,279,72,66],"horse_young_eat#0":[0,363,72,66],"horse_young_eat#1":[74,363,72,66],"horse_young_eat#2":[148,363,72,66],"horse_young_eat#3":[222,363,72,66],"horse_young_idle#0":[296,363,72,66],"horse_young_idle#1":[370,363,72,66],"horse_young_idle#2":[444,363,72,66],"horse_young_idle#3":[518,363,72,66],"goat_adult_walk#0":[592,363,71,62],"goat_adult_walk#1":[665,363,71,62],"goat_adult_walk#2":[738,363,71,62],"goat_adult_walk#3":[811,363,71,62],"goat_adult_eat#0":[884,363,71,62],"goat_adult_eat#1":[0,431,71,62],"goat_adult_eat#2":[73,431,71,62],"goat_adult_eat#3":[146,431,71,62],"goat_adult_idle#0":[219,431,71,62],"goat_adult_idle#1":[292,431,71,62],"goat_adult_idle#2":[365,431,71,62],"goat_adult_idle#3":[438,431,71,62],"ox_young_walk#0":[511,431,71,58],"ox_young_walk#1":[584,431,71,58],"ox_young_walk#2":[657,431,71,58],"ox_young_walk#3":[730,431,71,58],"ox_young_eat#0":[803,431,71,58],"ox_young_eat#1":[876,431,71,58],"ox_young_eat#2":[949,431,71,58],"ox_young_eat#3":[0,495,71,58],"ox_young_idle#0":[73,495,71,58],"ox_young_idle#1":[146,495,71,58],"ox_young_idle#2":[219,495,71,58],"ox_young_idle#3":[292,495,71,58],"deer_young_walk#0":[365,495,61,57],"deer_young_walk#1":[428,495,61,57],"deer_young_walk#2":[491,495,61,57],"deer_young_walk#3":[554,495,61,57],"deer_young_eat#0":[617,495,61,57],"deer_young_eat#1":[680,495,61,57],"deer_young_eat#2":[743,495,61,57],"deer_young_eat#3":[806,495,61,57],"deer_young_idle#0":[869,495,61,57],"deer_young_idle#1":[932,495,61,57],"deer_young_idle#2":[0,555,61,57],"deer_young_idle#3":[63,555,61,57],"goose_adult_walk#0":[126,555,60,54],"goose_adult_walk#1":[188,555,60,54],"goose_adult_walk#2":[250,555,60,54],"goose_adult_walk#3":[312,555,60,54],"goose_adult_eat#0":[374,555,60,54],"goose_adult_eat#1":[436,555,60,54],"goose_adult_eat#2":[498,555,60,54],"goose_adult_eat#3":[560,555,60,54],"goose_adult_idle#0":[622,555,60,54],"goose_adult_idle#1":[684,555,60,54],"goose_adult_idle#2":[746,555,60,54],"goose_adult_idle#3":[808,555,60,54],"hive_bees#0":[870,555,59,45],"hive_bees#1":[931,555,59,45],"hive_bees#2":[0,614,59,45],"hive_bees#3":[61,614,59,45],"hive_bees#4":[122,614,59,45],"hive_bees#5":[183,614,59,45],"goat_young_walk#0":[244,614,50,44],"goat_young_walk#1":[296,614,50,44],"goat_young_walk#2":[348,614,50,44],"goat_young_walk#3":[400,614,50,44],"goat_young_eat#0":[452,614,50,44],"goat_young_eat#1":[504,614,50,44],"goat_young_eat#2":[556,614,50,44],"goat_young_eat#3":[608,614,50,44],"goat_young_idle#0":[660,614,50,44],"goat_young_idle#1":[712,614,50,44],"goat_young_idle#2":[764,614,50,44],"goat_young_idle#3":[816,614,50,44],"hen_adult_walk#0":[868,614,48,44],"hen_adult_walk#1":[918,614,48,44],"hen_adult_walk#2":[968,614,48,44],"hen_adult_walk#3":[0,661,48,44],"hen_adult_eat#0":[50,661,48,44],"hen_adult_eat#1":[100,661,48,44],"hen_adult_eat#2":[150,661,48,44],"hen_adult_eat#3":[200,661,48,44],"hen_adult_idle#0":[250,661,48,44],"hen_adult_idle#1":[300,661,48,44],"hen_adult_idle#2":[350,661,48,44],"hen_adult_idle#3":[400,661,48,44],"duck_adult_walk#0":[450,661,48,40],"duck_adult_walk#1":[500,661,48,40],"duck_adult_walk#2":[550,661,48,40],"duck_adult_walk#3":[600,661,48,40],"duck_adult_eat#0":[650,661,48,40],"duck_adult_eat#1":[700,661,48,40],"duck_adult_eat#2":[750,661,48,40],"duck_adult_eat#3":[800,661,48,40],"duck_adult_idle#0":[850,661,48,40],"duck_adult_idle#1":[900,661,48,40],"duck_adult_idle#2":[950,661,48,40],"duck_adult_idle#3":[0,707,48,40],"goose_young_walk#0":[50,707,42,38],"goose_young_walk#1":[94,707,42,38],"goose_young_walk#2":[138,707,42,38],"goose_young_walk#3":[182,707,42,38],"goose_young_eat#0":[226,707,42,38],"goose_young_eat#1":[270,707,42,38],"goose_young_eat#2":[314,707,42,38],"goose_young_eat#3":[358,707,42,38],"goose_young_idle#0":[402,707,42,38],"goose_young_idle#1":[446,707,42,38],"goose_young_idle#2":[490,707,42,38],"goose_young_idle#3":[534,707,42,38],"rabbit_adult_walk#0":[578,707,42,34],"rabbit_adult_walk#1":[622,707,42,34],"rabbit_adult_walk#2":[666,707,42,34],"rabbit_adult_walk#3":[710,707,42,34],"rabbit_adult_eat#0":[754,707,42,34],"rabbit_adult_eat#1":[798,707,42,34],"rabbit_adult_eat#2":[842,707,42,34],"rabbit_adult_eat#3":[886,707,42,34],"rabbit_adult_idle#0":[930,707,42,34],"rabbit_adult_idle#1":[974,707,42,34],"rabbit_adult_idle#2":[0,749,42,34],"rabbit_adult_idle#3":[44,749,42,34],"hen_young_walk#0":[88,749,34,31],"hen_young_walk#1":[124,749,34,31],"hen_young_walk#2":[160,749,34,31],"hen_young_walk#3":[196,749,34,31],"hen_young_eat#0":[232,749,34,31],"hen_young_eat#1":[268,749,34,31],"hen_young_eat#2":[304,749,34,31],"hen_young_eat#3":[340,749,34,31],"hen_young_idle#0":[376,749,34,31],"hen_young_idle#1":[412,749,34,31],"hen_young_idle#2":[448,749,34,31],"hen_young_idle#3":[484,749,34,31],"koi_adult_swim#0":[520,749,62,30],"koi_adult_swim#1":[584,749,62,30],"koi_adult_swim#2":[648,749,62,30],"koi_adult_swim#3":[712,749,62,30],"koi_adult_swim#4":[776,749,62,30],"koi_adult_swim#5":[840,749,62,30],"koi_adult_feed#0":[904,749,62,30],"koi_adult_feed#1":[0,785,62,30],"koi_adult_feed#2":[64,785,62,30],"koi_adult_feed#3":[128,785,62,30],"koi_adult_idle#0":[192,785,62,30],"koi_adult_idle#1":[256,785,62,30],"koi_adult_idle#2":[320,785,62,30],"koi_adult_idle#3":[384,785,62,30],"grassfish_adult_swim#0":[448,785,62,30],"grassfish_adult_swim#1":[512,785,62,30],"grassfish_adult_swim#2":[576,785,62,30],"grassfish_adult_swim#3":[640,785,62,30],"grassfish_adult_swim#4":[704,785,62,30],"grassfish_adult_swim#5":[768,785,62,30],"grassfish_adult_feed#0":[832,785,62,30],"grassfish_adult_feed#1":[896,785,62,30],"grassfish_adult_feed#2":[960,785,62,30],"grassfish_adult_feed#3":[0,817,62,30],"grassfish_adult_idle#0":[64,817,62,30],"grassfish_adult_idle#1":[128,817,62,30],"grassfish_adult_idle#2":[192,817,62,30],"grassfish_adult_idle#3":[256,817,62,30],"duck_young_walk#0":[320,817,34,29],"duck_young_walk#1":[356,817,34,29],"duck_young_walk#2":[392,817,34,29],"duck_young_walk#3":[428,817,34,29],"duck_young_eat#0":[464,817,34,29],"duck_young_eat#1":[500,817,34,29],"duck_young_eat#2":[536,817,34,29],"duck_young_eat#3":[572,817,34,29],"duck_young_idle#0":[608,817,34,29],"duck_young_idle#1":[644,817,34,29],"duck_young_idle#2":[680,817,34,29],"duck_young_idle#3":[716,817,34,29],"rabbit_young_walk#0":[752,817,29,24],"rabbit_young_walk#1":[783,817,29,24],"rabbit_young_walk#2":[814,817,29,24],"rabbit_young_walk#3":[845,817,29,24],"rabbit_young_eat#0":[876,817,29,24],"rabbit_young_eat#1":[907,817,29,24],"rabbit_young_eat#2":[938,817,29,24],"rabbit_young_eat#3":[969,817,29,24],"rabbit_young_idle#0":[0,849,29,24],"rabbit_young_idle#1":[31,849,29,24],"rabbit_young_idle#2":[62,849,29,24],"rabbit_young_idle#3":[93,849,29,24],"koi_young_swim#0":[124,849,38,21],"koi_young_swim#1":[164,849,38,21],"koi_young_swim#2":[204,849,38,21],"koi_young_swim#3":[244,849,38,21],"koi_young_swim#4":[284,849,38,21],"koi_young_swim#5":[324,849,38,21],"koi_young_feed#0":[364,849,38,21],"koi_young_feed#1":[404,849,38,21],"koi_young_feed#2":[444,849,38,21],"koi_young_feed#3":[484,849,38,21],"koi_young_idle#0":[524,849,38,21],"koi_young_idle#1":[564,849,38,21],"koi_young_idle#2":[604,849,38,21],"koi_young_idle#3":[644,849,38,21],"grassfish_young_swim#0":[684,849,38,21],"grassfish_young_swim#1":[724,849,38,21],"grassfish_young_swim#2":[764,849,38,21],"grassfish_young_swim#3":[804,849,38,21],"grassfish_young_swim#4":[844,849,38,21],"grassfish_young_swim#5":[884,849,38,21],"grassfish_young_feed#0":[924,849,38,21],"grassfish_young_feed#1":[964,849,38,21],"grassfish_young_feed#2":[0,875,38,21],"grassfish_young_feed#3":[40,875,38,21],"grassfish_young_idle#0":[80,875,38,21],"grassfish_young_idle#1":[120,875,38,21],"grassfish_young_idle#2":[160,875,38,21],"grassfish_young_idle#3":[200,875,38,21]}};
  let AIM = null; const aLoad = () => { if (AIM !== null) return; AIM = 0; const i = new Image(); i.onload = () => { AIM = i; }; i.onerror = () => { AIM = null; }; i.src = (window.R162_ASSETS && R162_ASSETS['r175g/animals.webp']) || 'r175g/animals.webp'; };
  tileSetMap = (o => function (name) { if (name === GID) aLoad(); return o.apply(this, arguments); })(tileSetMap);
  const HERD = { henhouse: [['hen', 'adult'], ['hen', 'adult'], ['hen', 'young']], duck_shed: [['duck', 'adult'], ['duck', 'adult'], ['duck', 'young']], goose_shelter: [['goose', 'adult'], ['goose', 'young']],
    hutch: [['rabbit', 'adult'], ['rabbit', 'young'], ['rabbit', 'young']], goat_pen: [['goat', 'adult'], ['goat', 'adult'], ['goat', 'young']], ox_byre: [['ox', 'adult'], ['ox', 'young']],
    stable: [['horse', 'adult'], ['horse', 'young']], deer_pen: [['deer', 'adult'], ['deer', 'young']] };
  const AK = 1.25;   // 菜园地图缩到 .8，人物按 1.25 画；动物跟人一个比例
  const now = () => performance.now() / 1000;
  const herds = {};
  const herdOf = m => { let h = herds[m.u]; if (h) return h; const L = HERD[m.k]; if (!L) return null; const [w, hh] = U.fpOf(m);
    return (herds[m.u] = L.map(([sp, age], i) => ({ sp, age, x: (m.c + (i + .5) * w / L.length) * 64, y: (m.r + hh) * 64 + 20 + (i % 2) * 16, tx: 0, ty: 0, st: 'idle', t0: Math.random() * 3, until: Math.random() * 2, dir: i % 2 ? 1 : -1 }))); };
  const walk = (x, y) => { const T = world.map && world.map.T; if (!T) return false; const [c, r] = cellOf(x, y); return walkable(T, c, r); };
  // 在畜舍门前那一条地上溜达：吃两口、站一会儿、走几步
  function stepHerd(m, h, dt, t) { const [w, hh] = U.fpOf(m), x0 = m.c * 64 + 6, x1 = (m.c + w) * 64 - 6, y0 = (m.r + hh) * 64 + 12, y1 = y0 + 50;
    for (const a of h) {
      if (t > a.until) { const r = Math.random(); if (r < .45) { for (let k = 0; k < 6; k++) { const tx = x0 + Math.random() * (x1 - x0), ty = y0 + Math.random() * (y1 - y0); if (walk(tx, ty)) { a.tx = tx; a.ty = ty; a.st = 'walk'; break; } } a.until = t + 6; if (a.st !== 'walk') { a.st = 'idle'; a.until = t + 1.5; } }
        else { a.st = r < .78 ? 'eat' : 'idle'; a.until = t + 1.6 + Math.random() * 3; } a.t0 = t; }
      if (a.st === 'walk') { const dx = a.tx - a.x, dy = a.ty - a.y, l = Math.hypot(dx, dy), v = /horse|deer/.test(a.sp) ? 36 : a.sp === 'ox' ? 22 : a.age === 'young' ? 24 : 28;
        if (l < 2) { a.st = 'idle'; a.t0 = t; a.until = t + 1 + Math.random() * 2; } else { a.x += dx / l * Math.min(l, v * dt); a.y += dy / l * Math.min(l, v * dt); if (Math.abs(dx) > .5) a.dir = dx > 0 ? 1 : -1; } } } }
  const frameOf = (id, t0) => { const mm = AN.a[id]; if (!mm) return null; const f = Math.floor((now() - t0) * mm.fps) % mm.n; return [mm, AN.r[id + '#' + f]]; };
  function drawAnimal(a) { if (!AIM) return; const id0 = a.sp + '_' + a.age + '_' + a.st, id = AN.a[id0] ? id0 : a.sp + '_' + a.age + '_idle', fr = frameOf(id, a.t0); if (!fr || !fr[1]) return; const [mm, r] = fr;
    const w = mm.d[0] * AK, h = mm.d[1] * AK, fx = mm.f[0] * AK, fy = mm.f[1] * AK;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(a.x, a.y - 1, w * .3, Math.max(3, w * .09), 0, 0, 7); ctx.fill();
    ctx.translate(a.x, a.y); if (a.dir > 0) ctx.scale(-1, 1); ctx.drawImage(AIM, r[0], r[1], r[2], r[3], -fx, -fy, w, h); ctx.restore(); }
  // 每帧：动物按脚点排进物件（和人、房舍一起排深浅）
  let last = 0;
  drawGroundVis = (o => function (g, cam) { o.apply(this, arguments);
    try { if (world.mapName !== GID || !world.map) return; aLoad(); const T = world.map.T, t = now(), dt = Math.min(.05, last ? t - last : .016); last = t;
      const live = {}; T.objs = T.objs.filter(ob => !ob.r175a);
      for (const m of GS().mods) { if (!HERD[m.k] || U.isBuilding(m)) continue; live[m.u] = 1; const h = herdOf(m); stepHerd(m, h, dt, t);
        for (const a of h) T.objs.push({ bk: true, id: 'r175a', img: 'r175a', x: a.x - 70, y: a.y - 130, w: 140, h: 132, sy: a.y, r175a: a }); }
      for (const u in herds) if (!live[u]) delete herds[u];
    } catch (e) {} })(drawGroundVis);
  if (typeof drawBaked === 'function') drawBaked = (o => function (ob) { if (ob && ob.r175a) { drawAnimal(ob.r175a); return; } return o.apply(this, arguments); })(drawBaked);
  // 鱼塘：锦鲤、草鱼在水里绕圈；蜂箱：飞蜂
  const swim = {};
  window.R175G_AFTERMOD = (m, x, y, w, h) => { if (!AIM) { aLoad(); return; } const t = now();
    if (m.k === 'fishpond') { const L = swim[m.u] || (swim[m.u] = [['koi', 'adult', 0], ['grassfish', 'adult', 2.1], ['koi', 'young', 4.2]]); const cx = x + w / 2, cy = y + h * .56, rx = w * .28, ry = h * .17;
      for (const [sp, age, ph] of L) { const k = t * (age === 'young' ? .5 : .36) + ph, px = cx + Math.cos(k) * rx, py = cy + Math.sin(k) * ry, id = sp + '_' + age + '_swim', fr = frameOf(id, ph); if (!fr || !fr[1]) continue; const [mm, r] = fr, s = .9;
        ctx.save(); ctx.globalAlpha = .9; ctx.translate(px, py); ctx.rotate(Math.atan2(Math.cos(k) * ry, -Math.sin(k) * rx) + Math.PI); ctx.drawImage(AIM, r[0], r[1], r[2], r[3], -mm.d[0] * s / 2, -mm.d[1] * s / 2, mm.d[0] * s, mm.d[1] * s); ctx.restore(); } }
    if (m.k === 'hive') { const fr = frameOf('hive_bees', 0); if (fr && fr[1]) { const [mm, r] = fr; ctx.drawImage(AIM, r[0], r[1], r[2], r[3], x + w / 2 - mm.f[0], y + h - 10 - mm.f[1], mm.d[0], mm.d[1]); } } };
})();
