// ================= R313 · 测试面板「支线」：每条支线一个入口，点了从头开始做 =================
// 作者 11-16：「在测试面板把各个支线的入口列出来，设一个分类叫做支线，然后我一个一个点进去，从头开始做」。
// 点一条：① 这条支线的进度清零（连同它自己的线索、对话记号）；② 接任务的前提不够就补上（章节记号）；
// ③ 直接传送到接任务的人旁边。「名录」是自动开场的，传送到云来客栈门口就开演。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || !window.SQ_DEFS) return;
  const F = () => (S.flags = S.flags || {});
  // 每条支线自己用的记号前缀（重做时一起清掉）
  const OWN = { qy_ledger: ['qa_'], qy_wine: ['qb_'], qy_tassel: ['qc_', 'xg_'], qy_dice: ['qd_'], xt_story: ['xh_'], xt_lamps: ['xi_'],
    xt_room3: ['xr_'], xt_fake: ['xw_a_', 'xw_end', 'xw_notes', 'xw_seen'], xt_thirty: ['xn_'], xt_lamp: ['hx_'], dx_east: ['dx_'], ml_case: ['ml_', 'res_tod'], yy_ghost: ['yyt_'] };
  // 接任务前提：缺什么补什么（只补最少的那个章节记号）
  const NEED = { tj_fish: ['ch2_roam'], tj_book: ['ch2_roam'], tj_copy: ['ch2_roam'], tj_beast: ['ch2_roam'], bandit: ['ch2_plan'], horn: ['ch2_plan'],
    qy_wine: ['ch2_plan'], qy_tassel: ['ch2_plan'], qy_dice: ['ch2_plan'], spider: ['ch3'], elite: ['ch3_report'], yy_ghost: ['ch3_report'],
    qy_ledger: ['ch3_report'], xt_story: ['ch3_report'], xt_lamps: ['ch3_report'], xt_room3: ['ch3_report'], xt_fake: ['ch3_report'],
    xt_thirty: ['ch3_report', 'xw_hint3'], xt_lamp: ['ch3_report'], dx_east: ['ch3_report'], ml_case: ['ch3_report', 'qingxiao'] };
  const CAT = [['天剑宗', ['tj_fish', 'tj_book', 'tj_copy', 'tj_beast']],
    ['青阳镇', ['kite', 'hide', 'fang', 'bandit', 'horn', 'gold', 'qy_ledger', 'qy_wine', 'qy_tassel', 'qy_dice']],
    ['玄天城', ['spider', 'elite', 'xt_story', 'xt_lamps', 'xt_room3', 'xt_fake', 'xt_thirty', 'xt_lamp', 'dx_east']],
    ['主线 · 凶杀案', ['ml_case']],
    ['野外', ['yy_ghost']]];
  window.SQ_TEST_LIST = () => { const seen = new Set(), out = [];
    for (const [g, ids] of CAT) { const L = ids.map(id => SQ_DEFS.find(q => q.id === id)).filter(Boolean); L.forEach(q => seen.add(q.id)); if (L.length) out.push([g, L]); }
    const rest = SQ_DEFS.filter(q => !seen.has(q.id)); if (rest.length) out.push(['其他', rest]);
    return out; };
  const standNear = (x, y) => { const T = world.map && world.map.T; if (!T || typeof canStand !== 'function') return [x, y];
    for (let d = 0; d <= 320; d += 8) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a * Math.PI / 8) * d, py = y + Math.abs(Math.sin(a * Math.PI / 8)) * d;
      if (canStand(T, px, py) && canStand(T, px - 14, py) && canStand(T, px + 14, py)) return [px, py]; } return [x, y]; };
  window.SQ_GO = id => { const q = SQ_DEFS.find(x => x.id === id); if (!q) return;
    const f = F(); f.sq = f.sq || {}; delete f.sq[id];
    for (const k of Object.keys(f)) if ((OWN[id] || []).some(p => k.indexOf(p) === 0)) delete f[k];
    for (const k of NEED[id] || []) if (!f[k]) f[k] = 1;
    try { dialog = null; choice = null; } catch (e) {}
    try { if (window.QUEST_NAV) QUEST_NAV.on = false; } catch (e) {}
    let m = q.giver[0], x, y;
    if (id === 'ml_case') { f.sq.ml_case = { s: 0, n: 0 }; delete f.ch3_forest; delete f.ch3_forest_done; m = 'xt_city'; x = 1120; y = 2330; }
    else { const n = ((TMAPS[m] || {}).npcs || []).find(n => n.name === q.giver[1]); if (n) { x = (n.c + .5) * 64; y = (n.r + .8) * 64 + 80; } }
    if (!TMAPS[m]) return toast && toast('找不到地图：' + m);
    const s = x != null ? [x / 64 - .5, y / 64 - .8] : (TMAPS[m].start || [5, 5]);
    tileSetMap(m, s[0], s[1], 'up'); S.scene = drawMap; world.locked = false; world.hold = false; S.fade = 0;
    setTimeout(() => { try { if (x != null && world.player) { const [px, py] = standNear(world.player.x, world.player.y); world.player.x = px; world.player.y = py; } } catch (e) {} }, 60);
    try { toast(id === 'ml_case' ? '名录：走到云来客栈门口就开场' : '「' + q.name + '」从头开始 —— 找' + q.giver[1] + '接任务', 2600); } catch (e) {} };
})();
