// ================= R131 · 给 Codex 新图组补宝箱（作者 11-06：放在不起眼的角落，能走到，不压大路和传送阵）=================
// 位置由 tools/r107_mapgen/place_chests.py 按通行格 + 地面颜色挑好（离出口 / 出生点远、周围可走格少、站草地不站路面），
// 再人工核过一遍写死在这里；古樟井庭那张自动挑到了树台中央，手动改到两侧草地。坐标是 64px 地砖。
// 奖励按地方：秘境偏丹药，苍月城偏灵石，地下偏大还丹。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const ADD = {
    m_nw_creek: [[19, 7, [['p_mp', 2], ['gold', 120]]], [2, 2, [['p_revive', 1]]]],
    m_nw_glade: [[3, 7, [['p_big', 1], ['gold', 150]]], [25, 6, [['p_mp', 2], ['gold', 120]]]],
    m_nw_falls: [[19, 6, [['p_big', 1], ['p_mp', 1]]]],
    m_nw_passage: [[14, 17, [['p_mp', 2], ['gold', 120]]]],
    m_nw_spring: [[11, 9, [['p_revive', 1]]]],
    m_cy_north: [[2, 38, [['p_big', 1], ['gold', 160]]], [56, 40, [['p_mp', 2], ['gold', 100]]], [52, 2, [['gold', 220]]]],
    m_cy_gate: [[56, 16, [['gold', 220]]], [3, 39, [['p_big', 1], ['gold', 160]]]],
    m_cy_manor: [[26, 5, [['p_big', 1], ['gold', 160]]]],
    m_xx_b2: [[5, 17, [['p_big', 2], ['gold', 260]]], [34, 17, [['p_revive', 1], ['gold', 200]]], [22, 9, [['p_mp', 3]]]],
  };
  for (const [m, list] of Object.entries(ADD)) {
    const def = TMAPS[m]; if (!def) continue;
    def.chests = def.chests || [];
    if (def.chests.length) continue;   // 已有宝箱的地图不动
    for (const [c, r, items] of list) def.chests.push({ c, r, items });
  }
})();
