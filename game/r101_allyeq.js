// 作者 11-03：队友也能换装备。背包是全队共用的——叶孤星开局后山那把剑、后来换星痕剑后闲下来的剑，都可以给云霆 / 林雪用。
// 原来队友装备是「随剧情获得，暂不能更换」：青霄剑、云雷剑、紫云天罗甲只是剧情 flag 直接加属性，背包里看不到。
// 现在：这三件变成真物品，剧情给的时候自动穿在对应队友身上；替下来的回到共用背包，可以在「装备」页随便换。
// 叶孤星专属（星痕剑、流云仙衣）队友不能穿。
(function () {
  if (typeof allyStats !== 'function' || typeof drawEquip !== 'function' || typeof equipCards !== 'function') return;
  const F = () => S.flags || (S.flags = {});
  Object.assign(ITEM_DB, {
    w_qingxiao: { name: '青霄剑', slot: 'weapon', atk: 14, desc: '玄兵阁镇店之宝，极品灵器，出鞘有风雷之声' },
    w_yunlei: { name: '云雷剑', slot: 'weapon', atk: 16, desc: '城主府宝库的下品玄器，剑意霸道' },
    a_ziyun: { name: '紫云天罗甲', slot: 'armor', def: 12, maxhp: 120, desc: '城主府宝库的下品玄器，紫云织就' },
  });
  const HERO_ONLY = id => /^w_xinghen/.test(id) || id === 'a_liuyun' || !!(ITEM_DB[id] && ITEM_DB[id].heroOnly);
  const OK = id => { const it = ITEM_DB[id]; return !!(it && it.slot) && !HERO_ONLY(id); };
  window.ALLY_EQ_OK = OK;
  const SLOTS = ['weapon', 'armor', 'acc'];
  function eqOf(k) { S.allyEq = S.allyEq || {}; if (!S.allyEq[k]) S.allyEq[k] = { weapon: null, armor: null, acc: null }; return S.allyEq[k]; }
  window.allyEqOf = eqOf;
  // 剧情给的兵器衣甲 → 真物品（每样只转一次；旧存档进来也会补上）
  function migrate() {
    const f = F(); S.allyEq = S.allyEq || {}; const A = S.allyEq;
    if (f.qingxiao && !A._q) { A._q = 1; const y = eqOf('yunting'); if (!y.weapon) y.weapon = 'w_qingxiao'; else addItem('w_qingxiao'); }
    if (f.ly_gear && !A._g) { A._g = 1; const y = eqOf('yunting'), l = eqOf('linxue'); if (y.weapon) addItem(y.weapon); y.weapon = 'w_yunlei'; if (l.armor) addItem(l.armor); l.armor = 'a_ziyun'; }
  }
  allyStats = (orig => function (k) {
    const o = orig(k);
    try { migrate(); const e = S.allyEq && S.allyEq[k]; if (e) for (const s of SLOTS) { const it = ITEM_DB[e[s]]; if (it) for (const st of STATS) if (it[st]) o[st] = (o[st] || 0) + it[st]; } } catch (er) {}
    return o;
  })(allyStats);
  window.equipAlly = function (k, id) {
    const it = ITEM_DB[id], h = S.hero; if (!it || !it.slot) return false;
    if (!OK(id)) { toast(it.name + '是叶孤星专属，旁人用不了'); return false; }
    if ((h.bag[id] || 0) <= 0) return false;
    const e = eqOf(k), old = e[it.slot]; if (old) h.bag[old] = (h.bag[old] || 0) + 1;
    h.bag[id]--; if (!h.bag[id]) delete h.bag[id]; e[it.slot] = id;
    try { const a = allyState(k), st = allyStats(k); a.hp = Math.min(a.hp, st.maxhp); a.mp = Math.min(a.mp, st.maxmp); } catch (er) {}
    playSnd('ui_confirm'); return true;
  };
  const isAlly = () => S.menu && S.menu.who && S.menu.who !== 'hero';
  // 装备页：队友看的是自己的三格 + 共用背包里能穿的
  equipCards = function (L) {
    const h = S.hero, ally = isAlly(), eq = ally ? eqOf(S.menu.who) : h.equip, slots = [['weapon', '武器'], ['armor', '衣甲'], ['acc', '饰品']], cw = (L.body.w - 40) / 3;
    const top = slots.map(([s, n], i) => ({ s, n, id: eq[s], x: L.body.x + 10 + i * (cw + 10), y: L.body.y + 10, w: cw, h: 110 }));
    const own = Object.keys(h.bag).filter(id => ITEM_DB[id] && ITEM_DB[id].slot && (!ally || OK(id)));
    const pages = Math.max(1, Math.ceil(own.length / 8)), pg = Math.min(S.menu.eqPage || 0, pages - 1);
    const pager = pages > 1 ? { pages, pg, prev: { x: L.body.x + L.body.w - 250, y: L.body.y + 124, w: 76, h: 32 }, next: { x: L.body.x + L.body.w - 88, y: L.body.y + 124, w: 76, h: 32 } } : null;
    const list = own.slice(pg * 8, pg * 8 + 8).map((id, i) => ({ id, x: L.body.x + 10 + (i % 2) * ((L.body.w - 30) / 2 + 10), y: L.body.y + 170 + Math.floor(i / 2) * 84, w: (L.body.w - 30) / 2, h: 74 }));
    return { top, list, pager };
  };
  drawEquip = (orig => function (B, L, mi) {
    if (!mi.ally) return orig.apply(this, arguments);
    const h = S.hero, keep = h.equip; h.equip = eqOf(S.menu.who);   // 借用叶孤星那套画法（对比 ▲▼ 也按队友当前装备算）
    try { orig.call(this, B, L, Object.assign({}, mi, { ally: false })); } finally { h.equip = keep; }
  })(drawEquip);
  menuUpdate = (orig => function () {
    const m = S.menu; if (!(m && m.tab === 1 && isAlly())) return orig.apply(this, arguments);
    const t = consumeTap(); if (!t) return; const L = menuLayout();
    if (t.key === 'Escape' || inR(t, L.close)) { closeMenu(); return; }
    for (let i = 0; i < L.tabs.length; i++) if (inR(t, L.tabs[i])) { m.tab = i; m.sel = null; playSnd('ui_click'); return; }
    for (const r of L.members) if (inR(t, r)) { m.who = r.k; m.sel = null; playSnd('ui_click'); return; }
    const { list, pager } = equipCards(L);
    if (pager) { if (inR(t, pager.prev) && pager.pg > 0) { m.eqPage = pager.pg - 1; playSnd('ui_click'); return; } if (inR(t, pager.next) && pager.pg < pager.pages - 1) { m.eqPage = pager.pg + 1; playSnd('ui_click'); return; } }
    for (const c of list) if (inR(t, c)) { if (equipAlly(m.who, c.id)) toast(memberInfo(m.who).name + ' 换上了 ' + ITEM_DB[c.id].name); return; }
  })(menuUpdate);
})();
