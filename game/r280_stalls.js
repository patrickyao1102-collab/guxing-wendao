// ================= R280 · 摊子减量（作者 11-14：「吃食摊太多了，根本不需要那么多……一个就够了，弄一堆的话看得很恶心」）=================
// 每张地图同一种摊子只留一个：吃食摊、兵器摊、灵兽摊都一样。留下的是扎堆成一个小市集的那几个（旁边有摊主、路人的那一组）。
// 天剑宗集市本来就是兵器摊、吃食摊各一个，不动。拆掉的摊子底下那块地放开能走。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const KILL = {
    qy_town: [['food_stall_01', 208, 992], ['food_stall_02', 451, 992], ['weapon_stall', 707, 991]],   // 留南街那组：灵兽摊、吃食摊、兵器摊
    xt_city: [['weapon_stall', 2621, 1023], ['food_stall_01', 4029, 1344], ['food_stall_01', 2544, 1715], ['spirit_pet_stall', 1720, 1728],
      ['food_stall_02', 317, 2112], ['food_stall_01', 1789, 2208], ['food_stall_02', 2557, 2240], ['food_stall_02', 4029, 2400]],   // 留广场西边那组：灵兽摊、兵器摊、吃食摊
    m_cy_gate: [['cyc_food_stall_02', 559, 1690]],
  };
  for (const m in KILL) {
    const T = TMAPS[m], B = T && T.baked; if (!B) continue;
    const cs = B.cs, cols = B.cols, rows = B.rows, bl = B.blocked.split('');
    const hit = o => KILL[m].some(([id, x, y]) => o.id === id && Math.abs(o.x - x) < 4 && Math.abs(o.y - y) < 4);
    const gone = B.objs.filter(hit); if (!gone.length) continue;
    const keep = B.objs.filter(o => !hit(o));
    const inBox = (o, x, y) => x >= o.x && x < o.x + o.w && y >= o.y && y < Math.max(o.y + o.h, o.sy || 0) + 8;
    for (const o of gone) for (let r = Math.max(0, Math.floor(o.y / cs)); r <= Math.floor(((o.sy || o.y + o.h) + 8) / cs) && r < rows; r++) for (let c = Math.max(0, Math.floor(o.x / cs)); c < Math.ceil((o.x + o.w) / cs) && c < cols; c++) {
      const x = c * cs + cs / 2, y = r * cs + cs / 2; if (!inBox(o, x, y) || keep.some(k => inBox(k, x, y))) continue; bl[r * cols + c] = '0'; }
    B.objs = keep; B.blocked = bl.join('');
    try { if (window.MM_CLEAR) MM_CLEAR(m); } catch (e) {}
  }
  window.R280 = 1;
})();
