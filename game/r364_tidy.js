// ================= R364 · 玄天城两间新铺面 + 停尸房清掉不该有的家具（作者 11-21）=================
// 1）玄天城南城两间空着的旧房子换上 Codex R363 画的新铺面：
//    云来客栈右上那间（house_03_145）→ 成衣铺「丹枫挂衣」方案；巡城司上方那间（house_02_144）→ 胭脂铺「黛青妆柜」方案。
//    原图大小 312×280、柱脚和门槛都对齐原房子，碰撞不用动。
//    挡在铺面前面的东西清掉（作者：「不然玩家根本看不见」）：成衣铺门前的大枫树；胭脂铺门口的麻袋和木箱堆。连带它们脚下的碰撞格一起放开。
//    铺子里面和掌柜还没做，门照旧锁着。
// 2）巡城司停尸房：书案、椅子、笔筒、书、烛台和那只客栈用的木箱（作者：停尸房里放这些很奇怪）撤掉，脚下碰撞格放开。
// 只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  // 把一块矩形里的碰撞格设成可走（x0,y0,x1,y1 是地图像素）
  const clear = (B, x0, y0, x1, y1) => { if (!B || typeof B.blocked !== 'string') return; const a = B.blocked.split(''), cs = B.cs;
    for (let r = Math.floor(y0 / cs); r < Math.ceil(y1 / cs); r++) for (let c = Math.floor(x0 / cs); c < Math.ceil(x1 / cs); c++) if (r >= 0 && c >= 0 && r < B.rows && c < B.cols) a[r * B.cols + c] = '0';
    B.blocked = a.join(''); };

  // ---------- 玄天城 · 两间新铺面 ----------
  const XB = TMAPS.xt_city && TMAPS.xt_city.baked;
  if (XB && XB.objs) {
    // 11-22：两间铺面改由 R367（r367_shops.js）放，这里不再换图
    const GONE = { maple_sunlit_203: [1560, 2010, 1670, 2062], cargo_sacks_168: [570, 1700, 705, 1764], crate_stack_167: [570, 1700, 705, 1764] };
    XB.objs = XB.objs.filter(o => !GONE[o.uid]);
    for (const k in GONE) clear(XB, ...GONE[k]);
  }

  // ---------- 巡城司 · 停尸房 ----------
  const MB = TMAPS.ml_morgue && TMAPS.ml_morgue.baked;
  if (MB && MB.objs) {
    const OUT = /^(old_chest|old_candle|old_plain_chair|old_desk|old_brush_pot|old_books)/;
    MB.objs = MB.objs.filter(o => !OUT.test(o.id || ''));
    clear(MB, 392, 590, 626, 706);   // 书案、椅子
    clear(MB, 856, 494, 962, 530);   // 木箱
  }
})();
