// ================= R348 · 阿焰家在玄天城街上的外观（Codex R346）：丹霞堂右边那栋柳家旧民居，换成阿焰家的红漆院门（只进测试版）=================
// 作者 11-16：「丹霞堂旁边那个小房子你还没有去建」。外观复用 R317 已验收的院墙、红漆门、北正房、桂花树，石阶门墩用 R325。
// 1x 380×300，左上 (3150,1050)，底边 y=1350；门槛 (3302,1322)，街上落脚 (3302,1364)。
// 院门半开＝能进（进去落在院子里的院门内侧）；院门关着（中秋夜那场戏里）＝外面也换成关门的图，进不去。
// 原来住这儿的柳家（柳絮儿）不再开门。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_city || !TMAPS.xt_city.baked || !TMAPS.dx_home) return;
  const CITY = TMAPS.xt_city, B = CITY.baked, P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const X = 3150, Y = 1050, W = 380, H = 300, DX = 3302, DY = 1322;
  for (const st of ['half', 'closed']) { const im = new Image(); im.onload = () => { try { IMG['r348_ayan_' + st] = im; } catch (e) {} }; im.src = 'r348/ayan_' + st + '.webp?v=1'; }
  try { if (!IMG.r348_none) { const c = document.createElement('canvas'); c.width = c.height = 1; IMG.r348_none = c; } } catch (e) {}
  const shut = () => window.DX_GATE_ST === 'closed';
  // 换掉旧民居（house_01），旁边那个晒架挪走（它原来在柳家后院，现在会从屋顶后面戳出来）
  const house = B.objs.find(o => o.id === 'house_01' && Math.round(o.x) === 3173 && Math.round(o.y) === 1074);
  if (house) Object.assign(house, { id: 'r348_ayan', img: 'r348_ayan_half', x: X, y: Y, w: W, h: H, sy: DY, ay: DY, ax: DX });
  const GONE = o => o.id === 'drying_rack' && Math.round(o.x) === 3326 && Math.round(o.y) === 1040;
  for (const o of B.objs) if (GONE(o)) Object.assign(o, { img: 'r348_none', w: 1, h: 1, noBlock: true });
  // 城里的门：柳家 → 阿焰家
  const door = (CITY.doors || []).find(d => d.to === 'xt_home_liu');
  const D = { x: DX, y: DY + 30, rw: 22, rh: 12, to: 'dx_home', at: P(749, 890), face: 'up', label: '阿焰家', cond: () => !shut(), msg: '院门关着。' };
  if (door) Object.assign(door, D); else (CITY.doors = CITY.doors || []).push(D);
  // 院子里出院门 → 落在新门口的街上
  for (const d of TMAPS.dx_home.doors || []) if (d.to === 'xt_city') { d.at = P(DX, DY + 74); d.face = 'down'; }
  // 碰撞（R346 脚底多边形，半开态；关门态多一道门槛）
  const WALL = [[0, 120], [302, 120], [302, 286], [230, 286], [230, 220], [74, 220], [74, 286], [0, 286]];
  const STONES = [[[36, 284], [72, 284], [72, 300], [36, 300]], [[232, 284], [268, 284], [268, 300], [232, 300]]];
  const LEAVES = [[[52.2, 272.1], [123.6, 226.1], [118.9, 224.5], [47.4, 270.6]], [[252.2, 272.1], [180.8, 226.1], [185.6, 224.5], [257, 270.6]]];
  const CLOSED = [[74, 262], [230, 262], [230, 286], [74, 286]];
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const nearSeg = (x, y, poly, r) => poly.some(([px, py]) => Math.hypot(px - x, py - y) < r);
  const patch = () => {
    const cs = B.cs, cols = B.cols, a = B.blocked.split(''), closed = shut();
    const c0 = Math.floor((X - 30) / cs), c1 = Math.ceil((X + W) / cs), r0 = Math.floor((Y + 100) / cs), r1 = Math.ceil((Y + H + 4) / cs);
    for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) { if (c < 0 || c >= cols || r < 0 || r >= B.rows) continue;
      const lx = (c + .5) * cs - X, ly = (r + .5) * cs - Y;
      let blk = inPoly(lx, ly, WALL) || STONES.some(p => inPoly(lx, ly, p)) || (closed ? inPoly(lx, ly, CLOSED) : LEAVES.some(p => inPoly(lx, ly, p) || nearSeg(lx, ly, p, 6)));
      if (lx < 0 || lx > 302) { if (lx < 0 && ly > 150 && ly < 300) a[r * cols + c] = a[r * cols + c]; continue; }   // 画布外沿用原来的
      a[r * cols + c] = blk ? '1' : (ly >= 120 ? '0' : a[r * cols + c]); }
    B.blocked = a.join('');
    if (house) house.img = closed ? 'r348_ayan_closed' : 'r348_ayan_half';
    try { const T = world.map && world.map.T; if (T && T.block && world.mapName === 'xt_city') {
      for (let r = r0; r < Math.min(r1, T.block.length); r++) for (let c = Math.max(0, c0); c < Math.min(cols, c1); c++) T.block[r][c] = a[r * cols + c] === '1' ? 1 : 0;
      for (const o of T.objs || []) if (o.id === 'r348_ayan') o.img = house.img;
      for (const d of T.doors || []) if (d.to === 'xt_home_liu' || d.to === 'dx_home') Object.assign(d, D); } } catch (e) {}
  };
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { const r = o.apply(this, arguments); if (m === 'xt_city') { try { patch(); } catch (e) { console.warn('R348', e); } } return r; })(tileSetMap);
})();
