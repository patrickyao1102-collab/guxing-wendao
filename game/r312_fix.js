// ================= R312 · 作者 11-16 凌晨试玩反馈 =================
// ① 悦来客栈大堂：
//    · 「手机摇杆在这边，这三个人挪一下，分散到别的地方」→ 行商、弹琵琶的姑娘、外地刀客从左下角挪到中间和右边；
//    · 「两边的窗户很丑，做不出效果就直接加个边框，当作墙」→ 左右两条斜窗换成一整条木板墙（r312/qyinn_g.webp）；
//    · 「中间可以走的太小了，好几次卡住，桌子往下移一点」→ 最下面一排桌往下挪 30；
//      每张桌只挡「桌面 + 前后长凳」那一块，不再把整桌连人头都挡住，排与排之间空出约 3 格可走。
// ② 青阳镇：南城墙根那几栋贴着城墙的小房子（进不去，屋顶顶着城墙很突兀）去掉，换成树、柴垛、草垛、手推车；
//    卖糖人南边那块空草地，放一棵大树，树下一张石桌两条长凳。
// 只进测试版。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const setCell = (B, x0, y0, x1, y1, v, frac) => { const cs = B.cs, G = B.blocked.split('');
    for (let r = Math.floor(y0 / cs); r <= Math.floor((y1 - 1) / cs); r++) for (let c = Math.floor(x0 / cs); c <= Math.floor((x1 - 1) / cs); c++) {
      if (r < 0 || c < 0 || r >= B.rows || c >= B.cols) continue;
      if (frac) { const ov = (Math.min(y1, (r + 1) * cs) - Math.max(y0, r * cs)) / cs; if (ov < frac) continue; }
      G[r * B.cols + c] = v; }
    B.blocked = G.join(''); };

  // ---------- ① 悦来客栈大堂 ----------
  const IN = TMAPS.qy_inn, IB = IN && IN.baked;
  if (IB && !IB._r312) { IB._r312 = 1;
    try { const im = new Image(); im.onload = () => { try { IMG.r312_qyinn_g = im; IB.ground = 'r312_qyinn_g'; } catch (e) {} }; im.src = 'r312/qyinn_g.webp'; } catch (e) {}
    const DY = { r279_t05: 30, r279_t07: 30 };
    // 先把原来六张桌的挡块全部清掉（左右两列桌子那一片）
    for (const X of [620, 1090]) for (const Y of [585, 765, 945]) setCell(IB, X - 16, Y + 20, X + 200, Math.min(Y + 190, 1120), '0');
    for (const o of IB.objs) { if (!/^r279_t0/.test(o.uid || '')) continue; const d = DY[o.uid] || 0; o.y += d; o.sy += d;
      setCell(IB, o.x + 16, o.y + 74, o.x + 156, o.y + 158, '1', .4); }
    const MV = { 赶车的车夫: 30, 卖豆腐的刘嫂: 30, 绣坊的周嫂: 30 };
    const TO = { 行商: [1440, 1080], 弹琵琶的姑娘: [1340, 800], 外地刀客: [560, 985] };
    for (const n of IN.npcs || []) {
      if (MV[n.name]) n.r += MV[n.name] / 64;
      const t = TO[n.name]; if (t) { const [c, r] = P(t[0], t[1]); n.c = c; n.r = r; }
    }
  }

  // ---------- ② 青阳镇 ----------
  // r302 每次进青阳镇都会在「白天 / 灯会夜」两套数据之间换一下，所以这里写成一个函数，换完再补一次
  const TREE = 'cx2_scholar_tree_b1c619', PEACH = 'cx2_peach_tree_648fdc', WOOD = 'cx2_firewood_033291', HAY = 'cx2_haystack_e0bf03', CART = 'cx2_handcart_379f34', FLOWER = 'cx2_flowerbed_e4d43e', RACK = 'cx2_drying_rack_da34fe', SACK = 'cx2_cargo_sacks_262b04';
  const ADD = [
    // 城墙根：上面紧挨着铁匠铺、陈家、悦来的门，不放树（树冠会挡门），只放矮的柴垛、晾架、推车、草垛；靠河那一处放一棵桃树
    [RACK, 230, 2000, 136, 120, [.1, 30, .9]], [WOOD, 392, 2060, 104, 64, [.1, 26, .9]],
    [CART, 640, 2034, 120, 88, [.1, 30, .9]], [SACK, 790, 2050, 111, 100, [.1, 30, .9]],
    [HAY, 1712, 2034, 120, 88, [.1, 30, .9]], [WOOD, 1870, 2060, 104, 64, [.1, 26, .9]],
    [PEACH, 2560, 1850, 200, 264, [.38, 24, .62]], [FLOWER, 2700, 2060, 120, 72, null],
    // 卖糖人南边的空草地：大树 + 石桌长凳（镇上的人歇脚、下棋的地方）
    [TREE, 900, 1580, 248, 312, [.38, 26, .62]],
    ['cx2_stone_tea_table_9b2c59', 1190, 1770, 123, 89, [.1, 34, .9]],
    ['r312_stool', 1140, 1792, 42, 60, [.1, 18, .9]],
    ['r312_stool', 1324, 1792, 42, 60, [.1, 18, .9]],
  ];
  try { const im = new Image(); im.onload = () => { try { IMG.r312_stool = im; } catch (e) {} }; im.src = 'r239/court/o_garden_stone_stools.webp'; } catch (e) {}
  const GONE = [[197, 1930], [613, 1930], [1688, 1931], [2533, 1912]];
  window.R312Q = B => {
    const gone = B.objs.filter(o => /cx2_house_0/.test(o.img || '') && GONE.some(([x, y]) => Math.abs(o.x - x) < 3 && Math.abs(o.y - y) < 3));
    for (const o of gone) setCell(B, o.x, o.y + 40, o.x + o.w, Math.min(o.y + o.h, 2128), '0');
    const objs = B.objs.filter(o => !gone.includes(o) && !String(o.uid || '').startsWith('r312_'));
    ADD.forEach(([img, x, y, w, h, block], i) => { objs.push({ img, x, y, w, h, sy: y + h, uid: 'r312_' + i });
      if (block) setCell(B, x + w * block[0], y + h - block[1], x + w * block[2], y + h, '1'); });
    B.objs = objs; };
  { const QB = TMAPS.qy_town && TMAPS.qy_town.baked; if (QB) try { R312Q(QB); } catch (e) {} }
  window.R312 = 1;
})();
