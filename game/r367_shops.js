// ================= R367 · 玄天城衣饰铺：成衣铺、裁缝铺、胭脂铺（Codex R367，作者 11-22 选定）（只进测试版）=================
// 作者：「要不让胭脂铺和成衣铺再大一点点，有特色一点」「这里其实可以开裁缝铺和成衣铺，把那两个民房移除……把民居合理布局」；
//   R367 第一版成衣铺（斜着搭一卷红锦的顶）作者不要（「这种斜着的顶我见多了」），换的三款 A 横梁织坊 / B 绣鹤花楼 / C 双阁晒锦「都好好看啊」。
// 摆法：
//   西南角上（原钱家）＝ 成衣铺 · C 双阁晒锦，460×380，左上 (105,980)，门槛 (335,1360)
//   西南角下（原何家 + 旧胭脂铺两间合一）＝ 胭脂铺 · 花镜妆奁，540×285，左上 (140,1420)，门槛 (410,1705)
//   云来客栈东边（原 R364 那间）＝ 裁缝铺 · B 绣鹤花楼，按 0.8 放（368×304），门槛中点 (1560,1801)
//   A 横梁织坊留给以后的城（缥缈城铺子多）。
// 拆掉的：钱家、何家两间民房，晒衣架、两个花坛、木箱、麻袋、水缸、两丛花、一丛灌木。
// 民居：钱家搬到万宝楼东边那间空房（house_03_67）；何家城里已经没有空着的民房了，先不开门（屋里的何家嫂子不在任何支线里）。
// 三间铺子里面和掌柜还没做，门先不开。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined' || !TMAPS.xt_city || !TMAPS.xt_city.baked) return;
  const M = TMAPS.xt_city, B = M.baked;
  const setRect = (v, x0, y0, w, h) => { if (typeof B.blocked !== 'string') return; const a = B.blocked.split(''), cs = B.cs;
    for (let r = Math.floor(y0 / cs); r < Math.ceil((y0 + h) / cs); r++) for (let c = Math.floor(x0 / cs); c < Math.ceil((x0 + w) / cs); c++) if (r >= 0 && c >= 0 && r < B.rows && c < B.cols) a[r * B.cols + c] = v;
    B.blocked = a.join(''); };
  const GONE = new Set(['house_01_57', 'house_01_143', 'house_02_144', 'house_03_145', 'drying_rack_215', 'flowerbed_104', 'crate_stack_173', 'water_jar_172', 'cargo_sacks_174', 'flowers_03_235', 'flowers_01_234', 'shrub_237', 'flowerbed_100']);
  // 先把这些东西脚下原来挡路的格子放开
  const old = (B.objs || []).filter(o => GONE.has(o.uid));
  for (const o of old) { const sy = o.sy != null ? o.sy : o.y + o.h; const top = Math.max(o.y, sy - (/^house/.test(o.uid) ? 170 : o.h)); setRect('0', o.x, top, o.w, sy - top + 4); }
  B.objs = (B.objs || []).filter(o => !GONE.has(o.uid));
  const SH = [
    // [uid, 图, 左上x, 左上y, 宽, 高, 接地y, 挡路矩形…]
    ['r367_chengyi', 'r367/chengyi.webp', 105, 980, 460, 380, 1360, [[118, 1248, 434, 80], [118, 1328, 185, 32], [367, 1328, 185, 32]]],
    ['r367_yanzhi', 'r367/yanzhi.webp', 140, 1420, 540, 285, 1705, [[170, 1609, 480, 64], [170, 1673, 208, 32], [442, 1673, 208, 32]]],
    ['r367_caifeng', 'r367/caifeng.webp', 1376, 1497, 368, 304, 1801, [[1406, 1711, 309, 64], [1406, 1775, 129, 26], [1586, 1775, 129, 26]]],
  ];
  for (const [uid, src, x, y, w, h, sy, rects] of SH) {
    const im = new Image(); im.onload = () => { try { IMG[uid] = im; } catch (e) {} try { if (window.MM_CLEAR) MM_CLEAR('xt_city'); } catch (e) {} }; im.src = src + '?v=1';
    try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {}
    B.objs.push({ id: uid, uid, img: uid, x, y, w, h, sy, flat: false, noPre: true });
    for (const r of rects) setRect('1', ...r); }
  // 民居挪家：钱家 → 万宝楼东边空房（house_03_67，双开门在正中）
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const free = (x, y) => { const cs = B.cs; return [[-16, -4], [16, -4], [-16, 6], [16, 6]].every(([ox, oy]) => { const c = Math.floor((x + ox) / cs), r = Math.floor((y + oy) / cs); return c >= 0 && r >= 0 && c < B.cols && r < B.rows && B.blocked[r * B.cols + c] === '0'; }); };
  const move = (label, dx, dy) => { const d = (M.doors || []).find(e => e.label === label); if (!d) return; d.x = dx; d.y = dy + 8;
    let out = [dx, dy + 54]; search: for (const yy of [54, 44, 66, 34, 80, 96]) for (const xx of [0, -18, 18, -36, 36]) if (free(dx + xx, dy + yy) && free(dx + xx, dy + yy + 10)) { out = [dx + xx, dy + yy]; break search; }
    const H = TMAPS[d.to]; for (const e of (H && H.exits) || []) if (e.to === 'xt_city') e.at = P(out[0], out[1]); };
  move('钱家', 3365 + 156, 305 + 270);
  M.doors = (M.doors || []).filter(d => d.label !== '何家');
  try { if (window.MM_CLEAR) MM_CLEAR('xt_city'); } catch (e) {}
})();
