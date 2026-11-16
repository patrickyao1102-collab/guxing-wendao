// ================= R337 · 玄天城五户大户人家换上 Codex R325 新外观（作者 11-16：「很多大户人家外观的建模你也没有放」）（只进测试版）=================
// 原来郑府 / 宋府 / 方府 / 谢府 / 唐府用的还是两间铺面连在一起的旧楼（像杂货铺）。换成 R325 三款：
//   A＝门楼居中（郑府、唐府换树版）  B＝门楼偏左 + 月窗墙（宋府、谢府添树版）  C＝门楼居中 + 竹（方府）。
// 每张图＝整栋 + 石阶门墩层 + 府名匾，合成一张（石阶在人脚下、盖住门楼柱脚）；遮挡线在本地 y=349，人站上台阶就画在楼前面。
// 碰撞：这块地先清掉旧铺面的阻挡，再按 R325 的脚底多边形挡（墙身 + 两只门墩），石阶能走；门（传送）挪到新门口的门槛上。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_city || !TMAPS.xt_city.baked) return;
  const CITY = TMAPS.xt_city, B = CITY.baked, P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const A_BLOCK = [[[18, 238], [542, 238], [542, 372], [341, 372], [341, 349], [219, 349], [219, 372], [18, 372]], [[201, 350], [223, 350], [223, 372], [201, 372]], [[337, 350], [359, 350], [359, 372], [337, 372]]];
  const B_BLOCK = [[[18, 238], [542, 238], [542, 372], [211, 372], [211, 349], [89, 349], [89, 372], [18, 372]], [[71, 350], [93, 350], [93, 372], [71, 372]], [[207, 350], [229, 350], [229, 372], [207, 372]]];
  const H = [
    { k: 'zheng', x: 3880, y: 466, door: 280, block: A_BLOCK },
    { k: 'song', x: 584, y: 978, door: 150, block: B_BLOCK },
    { k: 'fang', x: 120, y: 2258, door: 280, block: A_BLOCK },
    { k: 'xie', x: 2648, y: 2258, door: 150, block: B_BLOCK },
    { k: 'tang', x: 3880, y: 2258, door: 280, block: A_BLOCK },
  ];
  for (const h of H) { const im = new Image(); im.onload = () => { try { IMG['r337_' + h.k] = im; } catch (e) {} }; im.src = 'r337/' + h.k + '.webp?v=1';
    const o = B.objs.find(o => o.x === h.x && o.y === h.y && o.w === 560 && o.h === 372);
    if (o) Object.assign(o, { img: 'r337_' + h.k, id: 'r337_' + h.k, sy: h.y + 349, ay: h.y + 349, ax: h.x + h.door });
    // 城里的门（r314 放在旧铺面底边正中）挪到新门槛；从正厅出门也落在新门口
    const dx = h.x + h.door, dy = h.y + 364;
    for (const d of CITY.doors || []) if (d.to === 'dh_' + h.k) Object.assign(d, { x: dx, y: dy, rw: 26, rh: 12 });
    const hall = TMAPS['dh_' + h.k]; if (hall && hall.exits && hall.exits[0]) hall.exits[0].at = P(dx, h.y + 420);
  }
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  let done = false;
  const patch = () => { if (done) return; done = true;
    try { if (window.R283 && R283.apply) R283.apply('xt_city'); } catch (e) {}
    const cs = B.cs, cols = B.cols, a = B.blocked.split('');
    for (const h of H) {
      const c0 = Math.floor(h.x / cs), c1 = Math.ceil((h.x + 560) / cs), r0 = Math.floor((h.y + 150) / cs), r1 = Math.ceil((h.y + 372) / cs);
      for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) { if (c < 0 || c >= cols || r < 0 || r >= B.rows) continue;
        const lx = (c + .5) * cs - h.x, ly = (r + .5) * cs - h.y;
        a[r * cols + c] = h.block.some(p => inPoly(lx, ly, p)) ? '1' : (ly >= 238 || lx < 18 || lx > 542 ? '0' : a[r * cols + c]); }
    }
    B.blocked = a.join('');
  };
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { if (m === 'xt_city') { try { patch(); } catch (e) { console.warn('R337', e); } } return o.apply(this, arguments); })(tileSetMap);
})();
