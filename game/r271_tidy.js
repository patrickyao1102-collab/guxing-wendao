// ================= R271 · 作者 11-13 晚上实机挑出来的小毛病 =================
// 天剑宗集市：作者在截图上画叉的两样不要了——符阵坊左前方那个小书架（r80_display）、右边那座青瓦面摊（r80_stall，灶膳摊）。
//   灶膳摊大娘还留在原地卖食材（青竹小院做菜要用），面摊那块地方的阻挡一并清掉，人能走过去。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const KILL = new Set(['r80_41', 'r80_91']);
  const datas = [...new Set([window.R60 && R60.map, TMAPS.tj_market && TMAPS.tj_market.baked].filter(Boolean))];
  const setBlock = (B, x0, y0, x1, y1, v) => { if (!B.blocked || !B.cs) return; const cs = B.cs, bl = B.blocked.split('');
    for (let r = Math.floor(y0 / cs); r <= Math.floor(y1 / cs); r++) for (let c = Math.floor(x0 / cs); c <= Math.floor(x1 / cs); c++) if (r >= 0 && c >= 0 && r < B.rows && c < B.cols) bl[r * B.cols + c] = v;
    B.blocked = bl.join(''); };
  const tidy = () => { for (const B of datas) { if (B._r271) continue; B._r271 = 1;
      if (Array.isArray(B.objs)) for (let i = B.objs.length - 1; i >= 0; i--) if (KILL.has(B.objs[i].uid)) B.objs.splice(i, 1);
      setBlock(B, 2600, 3216, 2800, 3336, '0'); } };   // 面摊柜台底下那块（右边的栏杆从 2820 起，不动）
  tidy();
  // 已经在集市里：眼前这张图也一并去掉
  const live = () => { try { if (world.mapName !== 'tj_market' || !world.map || !world.map.T) return; const T = world.map.T;
    if (T.objs && T.objs.some(o => KILL.has(o.uid))) { T.objs = T.objs.filter(o => !KILL.has(o.uid));
      if (T.block) { const cs = T.cs; for (let r = Math.floor(3216 / cs); r <= Math.floor(3336 / cs); r++) for (let c = Math.floor(2600 / cs); c <= Math.floor(2800 / cs); c++) if (T.block[r]) T.block[r][c] = 0; } } } catch (e) {} };
  setInterval(live, 1000);
})();
