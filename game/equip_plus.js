// ================= 装备强化 + 更多宝箱（总策划）=================
// 刷怪 → 掉狼牙 / 兽皮 → 找铁匠强化 → 变强，补上「打怪有收获」的循环。
//  · 每件装备可强化到 +5，每级让这件装备的全部属性 +15%（至少 +1）
//  · 材料：武器用狼牙，护甲用兽皮，饰品用狼牙或兽皮都行；外加灵石
//  · +1 ~ +3 必成，+4 七成，+5 五成；失败只损失材料和灵石，不掉级
//  · 强化的地方：天剑宗演武广场的「铸剑师」、青阳镇「王铁匠」，以及以后各城的铁匠
//  · 装备名字会带上 +N（背包、装备页、商店、获得提示都一样）
(function () {
  if (typeof ITEM_DB === 'undefined' || typeof S === 'undefined') return;
  const MAXLV = 5, STEP = .15, RATE = [1, 1, 1, .7, .5];
  const R = () => (S.hero.refine = S.hero.refine || {});
  const lvOf = id => (R()[id] || 0);
  const KEYS = ['atk', 'def', 'maxhp', 'maxmp', 'spd'];
  // 把装备的名字和属性改成「随强化等级变化」的读取器：所有显示和计算自动跟着变
  const BASE = {};
  function wrap(id) {
    const it = ITEM_DB[id]; if (!it || !it.slot || BASE[id]) return;
    const b = BASE[id] = { name: it.name }; for (const k of KEYS) if (typeof it[k] === 'number') b[k] = it[k];
    Object.defineProperty(it, 'name', { configurable: true, enumerable: true, get() { const l = lvOf(id); return b.name + (l ? ' +' + l : ''); }, set(v) { b.name = v; } });
    for (const k of KEYS) if (k in b) Object.defineProperty(it, k, { configurable: true, enumerable: true,
      get() { const l = lvOf(id); if (!l) return b[k]; const v = b[k]; if (v <= 0) return v; return v + Math.max(l, Math.round(v * STEP * l)); }, set(v) { b[k] = v; } });
  }
  const wrapAll = () => { for (const id in ITEM_DB) wrap(id); };
  wrapAll(); setTimeout(wrapAll, 3000);   // 后面模块再加的装备（如寒星剑、星痕剑中品）也包进来

  const MAT = { weapon: ['m_fang'], armor: ['m_hide'], acc: ['m_fang', 'm_hide'] };
  const costOf = (id, l) => { const it = ITEM_DB[id], p = BASE[id] && (it.price || 120); return { gold: Math.round((40 + (p || 120) * .35) * (l + 1)), n: l + 1, mats: MAT[it.slot] || ['m_fang'] }; };
  const have = id => (S.hero.bag[id] || 0);
  const matName = ms => ms.map(m => ITEM_DB[m].name).join('或');
  const matHave = ms => ms.reduce((s, m) => s + have(m), 0);
  function takeMats(ms, n) { for (const m of ms) { const t = Math.min(n, have(m)); if (t) { S.hero.bag[m] -= t; if (!S.hero.bag[m]) delete S.hero.bag[m]; n -= t; } if (!n) break; } }

  async function refineUI(who) {
    wrapAll();
    for (;;) {
      const h = S.hero, eq = h.equip || {}, slots = ['weapon', 'armor', 'acc'].filter(s => eq[s]);
      const bagGear = Object.keys(h.bag).filter(id => ITEM_DB[id] && ITEM_DB[id].slot && !slots.some(s => eq[s] === id));
      const list = [...slots.map(s => eq[s]), ...bagGear].slice(0, 6);
      if (!list.length) { await say(who, '你身上连件像样的家伙都没有，拿什么来强化？'); return; }
      const opts = list.map(id => { const l = lvOf(id); if (l >= MAXLV) return ITEM_DB[id].name + '　已到 +' + MAXLV;
        const c = costOf(id, l); return ITEM_DB[id].name + ' → +' + (l + 1) + '　灵石 ' + c.gold + '，' + matName(c.mats) + ' ×' + c.n + '（有 ' + matHave(c.mats) + '）' + (RATE[l] < 1 ? '　成功率 ' + Math.round(RATE[l] * 100) + '%' : ''); });
      opts.push('不强化了');
      const k = await choose(who + ' · 强化装备（身上 ' + h.gold + ' 灵石）', opts);
      if (k < 0 || k >= list.length) return;
      const id = list[k], l = lvOf(id);
      if (l >= MAXLV) { await say(who, '这件已经到头了，再敲就碎了。'); continue; }
      const c = costOf(id, l);
      if (h.gold < c.gold) { await say(who, '灵石不够。强化到 +' + (l + 1) + ' 要 ' + c.gold + ' 灵石。'); continue; }
      if (matHave(c.mats) < c.n) { await say(who, '材料不够——要 ' + matName(c.mats) + ' ' + c.n + ' 个。野外的妖兽身上就有，去打些来。'); continue; }
      h.gold -= c.gold; takeMats(c.mats, c.n);
      playSnd('sfx_sword_ring'); S.shake = 6; S.flash = .35; S.flashColor = '#ffe2a0'; await sleep(500);
      if (Math.random() < RATE[l]) {
        const slot = ITEM_DB[id].slot, on = h.equip && h.equip[slot] === id;
        const before = {}; for (const kk of KEYS) before[kk] = ITEM_DB[id][kk] || 0;
        R()[id] = l + 1;
        const lines = ['!' + ITEM_DB[id].name]; for (const kk of KEYS) { const d = (ITEM_DB[id][kk] || 0) - before[kk]; if (d) { lines.push(STAT_CN[kk] + ' ' + before[kk] + ' → ' + ITEM_DB[id][kk]); if (on) h[kk] += d; } }
        h.hp = Math.min(h.hp, h.maxhp); h.mp = Math.min(h.mp, h.maxmp);
        playSnd('jingle_levelup'); await showPanel('强化成功', lines);
      } else { playSnd('sfx_hurt'); await showPanel('强化失败', ['火候差了一点……', '材料和灵石没了，装备没有损坏，还是 +' + l]); }
    }
  }
  window.REFINE_UI = refineUI;

  // ---------- 铁匠 / 铸剑师：先问要买东西还是强化 ----------
  const SMITHS = new Set(['王铁匠', '铸剑师']);
  doInteract = (orig => async function (h) {
    if (!(h && h.type === 'npc' && h.a && h.a.npc && SMITHS.has(h.a.npc.name))) return orig.apply(this, arguments);
    const n = h.a.npc; world.locked = true;
    try {
      const opts = n.shop ? ['看看兵器', '强化装备', '离开'] : ['强化装备', '离开'];
      const c = await choose(n.name, opts); const pick = opts[c];
      if (pick === '强化装备') { await say(n.name, n.name === '铸剑师' ? '剑要常磨。把家伙拿来，我给你淬一淬。' : '要强化？拿来我看看。'); await refineUI(n.name); }
      else if (pick === '看看兵器') { await openShop(n.shop, n.name); }
    } finally { world.locked = false; }
  })(doInteract);

  // ---------- 天剑宗演武广场：铸剑师 ----------
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const nearOf = Bm => (x, y) => {
    const k = Math.max(1, Math.round(16 / Bm.cs));
    const ok = (c, r) => { if (c < k || r < 1 || c >= Bm.cols - k || r >= Bm.rows - 1) return false; for (let d = -k; d <= k; d++) if (Bm.blocked.charCodeAt(r * Bm.cols + c + d) !== 48) return false; return true; };
    const c0 = Math.floor(x / Bm.cs), r0 = Math.floor(y / Bm.cs), lim = Math.ceil(30 * 32 / Bm.cs);
    for (let d = 0; d < lim; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue; const c = c0 + dx, r = r0 + dy; if (ok(c, r)) return [(c + .5) * Bm.cs, (r + .6) * Bm.cs]; }
    return [x, y];
  };
  const atIn = (id, x, y) => CXB2[id] ? P(...nearOf(CXB2[id])(x, y)) : null;
  if (TMAPS.tj_front && CXB2.tj_front) {
    const [c, r] = atIn('tj_front', 2080, 1330);
    TMAPS.tj_front.npcs = TMAPS.tj_front.npcs || [];
    if (!TMAPS.tj_front.npcs.some(n => n.name === '铸剑师')) TMAPS.tj_front.npcs.push({ key: 'c_a2', c, r, name: '铸剑师', wander: false, talk: ['……'] });
  }

  // ---------- 更多宝箱（开过会记住）----------
  const addChest = (map, x, y, items) => { const M = TMAPS[map]; if (!M || !CXB2[map]) return; const [c, r] = atIn(map, x, y); M.chests = (M.chests || []).concat([{ c, r: r - .2, items }]); };
  addChest('qingzhu_bamboo', 260, 1180, [['a_cloth', 1], ['m_hide', 2]]);                 // 竹林归径 · 西南空地
  addChest('tj_scripture', 300, 1460, [['c_jade', 1], ['gold', 60]]);                      // 藏经阁外院 · 西侧
  addChest('qingzhu_upper_pavilion', 1700, 260, [['p_big', 1], ['m_fang', 2]]);           // 云海大亭 · 东北角

  // 背包里的材料说明：告诉玩家狼牙兽皮能强化
  if (ITEM_DB.m_fang) ITEM_DB.m_fang.desc = '妖狼的牙。可以卖钱，也能找铁匠强化武器';
  if (ITEM_DB.m_hide) ITEM_DB.m_hide.desc = '妖兽的毛皮。可以卖钱，也能找铁匠强化护甲';
})();
