// ================= R348 · 阿焰家在玄天城街上的外观（只进测试版）=================
// 作者 11-17 选定 Codex R350「选中方案02」：左边一座小门楼（门在这儿），右边一段折墙，墙里露出一棵金桂，后面三开间正房。
// 换掉丹霞堂右边那栋柳家旧民居（house_01）；门通进阿焰家院子（dx_home），院门出来落回这扇门口的街上。
// 整栋图 1x 380×300（@2x 760×600），左上 (3150,1064)，底边地面线 y=1350；门（左门楼）门槛本地 (69,260)。
// 原来住这儿的柳家（柳絮儿）不再开门；门口那堆货、大缸边的灯杆挪到右边墙根，不挡门。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_city || !TMAPS.xt_city.baked || !TMAPS.dx_home) return;
  const CITY = TMAPS.xt_city, B = CITY.baked, P = (x, y) => [x / 64 - .5, y / 64 - .8];
  // 作者 11-17 18:59：「沈家移除，把这个放大一点点，放在沈家和现在的建筑中间，然后移除中间的护栏」
  //   → 放大 1.2 倍（456×360），底边地面线从 1350 提到 1190（原沈家 1024 和原阿焰家 1350 当中）；沈家整栋、门、碰撞拿掉；右边那段竹篱笆拿掉。
  const K = 1.2, X = 3100, W = Math.round(380 * K), H = Math.round(300 * K), Y = Math.round(1190 - 286 * K), DX = Math.round(X + 69 * K), DY = Math.round(Y + 262 * K);
  { const im = new Image(); im.onload = () => { try { IMG.r348_ayan = im; } catch (e) {} }; im.src = 'r348/ayan_02.webp?v=1'; }
  try { if (!IMG.r348_none) { const c = document.createElement('canvas'); c.width = c.height = 1; IMG.r348_none = c; } } catch (e) {}
  const shut = () => window.DX_GATE_ST === 'closed';
  // 换掉旧民居；柳家后院那只晒架会从屋顶后面戳出来，拿掉
  const house = B.objs.find(o => o.id === 'house_01' && Math.round(o.x) === 3173 && Math.round(o.y) === 1074);
  if (house) Object.assign(house, { id: 'r348_ayan', img: 'r348_ayan', x: X, y: Y, w: W, h: H, sy: DY, ay: DY, ax: DX });
  for (const o of B.objs) if (o.id === 'drying_rack' && Math.round(o.x) === 3326 && Math.round(o.y) === 1040) Object.assign(o, { img: 'r348_none', w: 1, h: 1, noBlock: true });
  const GONE = [['house_03', 3173, 753], ['bamboo_fence', 3427, 1113]], gone = [];   // 沈家、竹篱笆
  for (const o of B.objs) if (GONE.some(([id, x, y]) => o.id === id && Math.round(o.x) === x && Math.round(o.y) === y)) { gone.push([o.x, o.y, o.w, o.h]); Object.assign(o, { img: 'r348_none', w: 1, h: 1, noBlock: true }); }
  const noShen = d => d && d.to === 'xt_home_shen';
  CITY.doors = (CITY.doors || []).filter(d => !noShen(d));
  // 门口的货堆、麻袋、灯杆挪到右边墙根（原来正好堵在新门口）
  const MOVE = [['crate_stack', 3140, 1299, 3290, 1300], ['cargo_sacks', 3125, 1320, 3268, 1322], ['lantern_pole', 3213, 1344, 3333, 1344]];
  const moved = [];
  for (const [id, ox, oy, nx, ny] of MOVE) { const o = B.objs.find(o => o.id === id && Math.round(o.x) === ox && Math.round(o.y) === oy);
    if (o) { const dx = nx - o.x, dy = ny - o.y; moved.push({ o, old: [o.x, o.y + o.h], dx, dy }); o.x = nx; o.y = ny; o.sy += dy; if (o.ay) o.ay += dy; if (o.ax) o.ax += dx; } }
  // 城里的门：柳家 → 阿焰家（传送阵在门楼石阶下的街面上）
  const door = (CITY.doors || []).find(d => d.to === 'xt_home_liu');
  const D = { x: DX, y: Math.round(Y + 292 * K), rw: 22, rh: 12, to: 'dx_home', at: P(749, 890), face: 'up', label: '阿焰家', cond: () => !shut(), msg: '院门关着。' };
  if (door) Object.assign(door, D); else (CITY.doors = CITY.doors || []).push(D);
  // 院子里出院门 → 落在新门口的街上
  for (const d of TMAPS.dx_home.doors || []) if (d.to === 'xt_city') { d.at = P(DX, Math.round(Y + 330 * K)); d.face = 'down'; }
  // 碰撞（本地 1x 坐标）：整栋挡住；左门楼石阶（门前那一小块）能站
  const BODY = [[20, 120], [362, 120], [362, 287], [120, 287], [120, 256], [30, 256], [30, 287], [20, 287]].map(([x, y]) => [x * K, y * K]);
  const DOORWAY = [[44, 250], [94, 250], [94, 262], [44, 262]].map(([x, y]) => [x * K, y * K]);   // 门扇本身（关着），挡
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const patch = () => {
    const cs = B.cs, cols = B.cols, a = B.blocked.split('');
    const set = (x0, y0, x1, y1, v) => { for (let r = Math.floor(y0 / cs); r <= Math.floor(y1 / cs); r++) for (let c = Math.floor(x0 / cs); c <= Math.floor(x1 / cs); c++) if (r >= 0 && c >= 0 && r < B.rows && c < cols) a[r * cols + c] = v; };
    // 先清掉旧民居和旧货堆的占地
    set(3120, 1180, 3530, 1366, '0');            // 原来阿焰家（旧民居）的位置
    set(3175, 960, 3485, 1034, '0');             // 沈家
    for (const g of gone) set(g[0] + 4, g[1] + g[2] * 0 + g[3] - 40, g[0] + g[2] - 4, g[1] + g[3] + 4, '0');
    for (const m of moved) set(m.old[0] - 4, m.old[1] - 40, m.old[0] + m.o.w + 4, m.old[1] + 8, '0');
    // 整栋
    const c0 = Math.floor(X / cs), c1 = Math.ceil((X + W) / cs), r0 = Math.floor((Y + 100) / cs), r1 = Math.ceil((Y + H) / cs);
    for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) { if (c < 0 || c >= cols || r < 0 || r >= B.rows) continue;
      const lx = (c + .5) * cs - X, ly = (r + .5) * cs - Y;
      if (inPoly(lx, ly, BODY) || inPoly(lx, ly, DOORWAY)) a[r * cols + c] = '1'; }
    // 挪过去的货堆、灯杆：脚下一小条挡住
    for (const m of moved) { const o = m.o, fy = o.y + o.h; if (o.id === 'lantern_pole') set(o.x + o.w / 2 - 12, fy - 20, o.x + o.w / 2 + 12, fy, '1'); else set(o.x + 6, fy - 30, o.x + o.w - 6, fy - 4, '1'); }
    B.blocked = a.join('');
    try { const T = world.map && world.map.T; if (T && T.block && world.mapName === 'xt_city') {
      for (let r = Math.floor(740 / cs); r < Math.min(T.block.length, Math.ceil(1500 / cs)); r++) for (let c = Math.floor(3100 / cs); c < Math.min(cols, Math.ceil(3540 / cs)); c++) T.block[r][c] = a[r * cols + c] === '1' ? 1 : 0;
      for (const d of T.doors || []) if (d.to === 'xt_home_liu' || d.to === 'dx_home') Object.assign(d, D);
      if (T.doors) for (let i = T.doors.length - 1; i >= 0; i--) if (noShen(T.doors[i])) T.doors.splice(i, 1);
      for (const o of T.objs || []) if (GONE.some(([id, x, y]) => o.id === id && Math.round(o.x) === x && Math.round(o.y) === y)) Object.assign(o, { img: 'r348_none', w: 1, h: 1, noBlock: true }); } } catch (e) {}
  };
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { const r = o.apply(this, arguments); if (m === 'xt_city') { try { patch(); } catch (e) { console.warn('R348', e); } } return r; })(tileSetMap);
})();
