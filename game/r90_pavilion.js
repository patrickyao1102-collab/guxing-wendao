// R90 云海大亭：换成 Codex 分层重画的亭子（Codex交付/R90_云海大亭分层，10-31 交付；作者 11-03 催：人在亭子里被整座亭子盖住）。
// 原来地图里这座亭子是一整张图，还复制了 5 份整图（屋檐、四根前柱）按 y=850 排序 → 人一站上台基就被整座亭子连地砖一起盖住。
// 现在全部拿掉，按 Codex 的七层画：
//   ground  台基 + 地砖 + 台阶：平铺在地上，永远在人物下面
//   back    后排四柱、两侧栏杆长椅、灯笼：排序线 = 台基后沿（人在亭里站在它前面，人在亭子后面被它挡住）
//   pillar_1~4 前排四柱：各自按柱脚 y=758 和人物排序
//   roof    屋顶：永远盖在人物上面；人走到屋顶底下被挡住时半透明
// 碰撞照 collision.json：台基内部、台阶可走；台基侧面/前沿、八根柱脚、后侧栏杆长椅不可走。
// 代码只做摆放、排序、碰撞；画面全是 Codex 的原画。
(function () {
  if (typeof tileSetMap !== 'function' || typeof drawBaked !== 'function') return;
  const MAP = 'qingzhu_upper_pavilion', OX = 576, OY = 98;   // 原亭子整图在地图里的左上角（960×960，1:1）
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const BL = { ground: 'ab9526de46c115b114804ce1b5aa0d09', back: '40fe4b289d0c7f07dd76e4991df79fee', pillar_1: '673b0844f1c8bf004e7ff84e7f938c92', pillar_2: '2685913955c44ea647c192a255f73d19', pillar_3: 'd88166bb6fbd0c5e511c7e3ef76619eb', pillar_4: 'ab8dc56dad6c1af283d3d273338d1918', roof: 'c1ca7d2527bfcc62c09cd4e42e9581a7' };
  // 每层裁掉透明边后在 960 画布里的范围 [x0, y0, x1, y1]
  const BB = { ground: [30, 638, 930, 888], back: [145, 448, 815, 700], pillar_1: [101, 448, 187, 758], pillar_2: [274, 448, 358, 758], pillar_3: [602, 449, 687, 758], pillar_4: [775, 448, 859, 758], roof: [19, 71, 939, 512] };
  const IM = {};
  for (const k in BL) { const im = new Image(); im.onload = () => { IM[k] = im; }; im.src = LOC ? 'r90p/' + k + '.webp' : '/_blob/' + BL[k]; }
  const SORT = { back: 645, pillar: 758 };
  function pieces() {
    const mk = (k, sy, flat) => { const b = BB[k]; return { bk: true, id: 'r90-pavilion', uid: 'r90-' + k, r90: k, img: undefined, x: OX + b[0], y: OY + b[1], w: b[2] - b[0], h: b[3] - b[1], sy, flat: !!flat, flip: false }; };
    return [mk('ground', OY + 888, true), mk('back', OY + SORT.back), mk('pillar_1', OY + SORT.pillar), mk('pillar_2', OY + SORT.pillar), mk('pillar_3', OY + SORT.pillar), mk('pillar_4', OY + SORT.pillar), mk('roof', 1e9)];
  }
  // ---- 碰撞（collision.json，图像坐标）----
  const OUTER = [[150, 639], [810, 639], [921, 786], [921, 833], [930, 851], [731, 851], [731, 888], [230, 888], [230, 851], [31, 851], [40, 833], [40, 786]];
  const TOP = [[150, 639], [810, 639], [918, 785], [40, 785]];
  const STAIRS = [[296, 778], [664, 778], [680, 892], [281, 892]];   // 台阶（上下各放宽一点，和台面、地面接上）
  const FEET = [[112, 726, 187, 758], [274, 726, 358, 758], [602, 726, 687, 758], [775, 726, 859, 758]];   // 前柱柱脚
  const RAIL = [[140, 628, 382, 670], [578, 628, 820, 670], [140, 628, 205, 704], [755, 628, 820, 704]];  // 后排栏杆 + 两侧长椅（含后柱柱脚）
  const inPoly = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const inR = (R, x, y) => R.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d);
  function collide(T) {
    const cs = T.cs, B = T.block; if (!B || !cs) return;
    // 旧亭子的碰撞框整块清掉（老图柱子位置和新亭子对不上）
    for (let wy = OY + 560; wy < OY + 900; wy += cs) for (let wx = OX; wx < OX + 960; wx += cs) {
      const r = Math.floor(wy / cs), c = Math.floor(wx / cs); if (!B[r] || c < 0 || c >= B[r].length) continue;
      const x = wx + cs / 2 - OX, y = wy + cs / 2 - OY; let bl = 0;
      if (inPoly(OUTER, x, y) && !inPoly(TOP, x, y) && !inPoly(STAIRS, x, y)) bl = 1;   // 台基侧面、前沿
      if (inR(FEET, x, y) || inR(RAIL, x, y)) bl = 1;
      B[r][c] = bl;
    }
  }
  tileSetMap = (orig => function (name) { const res = orig.apply(this, arguments);
    try { if (name === MAP && world.map && world.map.T && world.map.T.objs) { const T = world.map.T;
      const L = T.objs; for (let i = L.length - 1; i >= 0; i--) if (L[i].id === 'qingzhu-r24-pavilion' || L[i].id === 'r90-pavilion') L.splice(i, 1); L.push(...pieces()); collide(T); } } catch (e) { console.warn('r90 pavilion', e); }
    return res; })(tileSetMap);
  drawBaked = (orig => function (o, now) {
    if (!o || !o.r90) return orig.apply(this, arguments);
    const im = IM[o.r90]; if (!im) return;
    ctx.save();
    if (o.r90 === 'roof') { const p = world.player;   // 人走到屋顶后面 / 底下被挡住时，屋顶半透明
      if (p && p.x > o.x + 30 && p.x < o.x + o.w - 30 && p.y > o.y + 60 && p.y - 70 < o.y + o.h) ctx.globalAlpha *= .5; }
    ctx.drawImage(im, o.x, o.y, o.w, o.h); ctx.restore();
  })(drawBaked);
  window.R90_PAV = { pieces, ready: () => Object.keys(BL).every(k => IM[k]) };
})();
