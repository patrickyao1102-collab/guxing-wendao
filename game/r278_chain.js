// ================= R278 · 「八方来」客栈连锁 · 第一步：醉仙楼搬去玄天城 =================
// 作者 11-14：醉仙楼改到玄天城，盖在云来客栈南边那排两开间铺面的位置（外观等 Codex）；青阳镇原来醉仙楼那块换成民居。
// 悦来（青阳镇）和云来（玄天城，最高档）同属一个东家「八方来」，以后各城的客栈都是它的分号，连锁任务从这儿牵线。
// 醉仙楼里原来那三条支线留在青阳镇：桂花酿、金灵传说挪进悦来大堂（刀客、醉书生、弹琵琶的阿蘅搬进悦来），犀角炖的厨子改成悦来的厨子，站客栈门口。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.qy_town || !TMAPS.qy_inn || !TMAPS.qy_tavern) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const reg = n => { try { SPEAKERS[n] = SPEAKERS[n] || { p: '', color: '#e6dccb' }; } catch (e) {} };

  // ---- 1. 醉仙楼的三位客人搬进悦来大堂（他们身上挂的支线对话跟着人走）----
  const MOVE = { 外地刀客: [130, 1075], 醉醺醺的书生: [1312, 1000], 弹琵琶的姑娘: [222, 930] };   // 阿蘅坐说书台
  const TV = TMAPS.qy_tavern, IN = TMAPS.qy_inn; IN.npcs = IN.npcs || [];
  for (const n of IN.npcs) if (n.name === '听书的老人家') { const [c, r] = P(430, 1000); n.c = c; n.r = r; }   // 让出说书台给阿蘅，老人家挪到台子右边听
  TV.npcs = (TV.npcs || []).filter(n => { const s = MOVE[n.name]; if (!s || n.hidden) return true; const [c, r] = P(s[0], s[1]); n.c = c; n.r = r; n.wander = false; IN.npcs.push(n); return false; });

  // ---- 2. 支线登记改地方 ----
  for (const q of window.SQ_DEFS || []) {
    if (q.id === 'gold') { q.giver = ['qy_inn', '外地刀客']; q.where = '青阳镇 · 悦来客栈 · 外地刀客'; }
    if (q.id === 'horn') { q.giver = ['qy_town', '悦来厨子']; q.where = '青阳镇 · 悦来客栈门口 · 悦来厨子'; q.name = '悦来的招牌菜'; q.desc = '悦来客栈的招牌「犀角炖」断货了。';
      for (const L of [q.accept, q.done]) for (const l of L || []) if (l[0] === '醉仙楼厨子') l[0] = '悦来厨子'; }
  }
  // 厨子：原来站醉仙楼门口 → 站悦来客栈门口（左边花坛外，不挡东边去河东的路）
  reg('悦来厨子');
  for (const n of TMAPS.qy_town.npcs || []) if (n.name === '醉仙楼厨子') { n.name = '悦来厨子'; const [c, r] = P(1545, 1975); n.c = c; n.r = r; n.wander = false; }
  try { for (const k in window.GX_TIPS || {}) { const A = GX_TIPS[k]; if (Array.isArray(A)) for (let i = 0; i < A.length; i++) if (typeof A[i] === 'string') A[i] = A[i].replace('醉仙楼的外地刀客', '悦来客栈的外地刀客'); } } catch (e) {}

  // ---- 3. 青阳镇：醉仙楼那栋楼换成民居（陈家）（拼接：用镇上同款 house_03），门口的酒旗、两张茶桌撤掉 ----
  const B = TMAPS.qy_town.baked, cs = B.cs, cols = B.cols, rows = B.rows;
  const bl = B.blocked.split('');
  const at = (c, r) => r * cols + c;
  const objs = B.objs, iR = objs.findIndex(o => o.id === 'restaurant'), tpl = objs.find(o => o.id === 'house_03' && Math.abs(o.x - 1093) < 2);
  if (iR >= 0 && tpl) {
    const R = objs[iR], gone = new Set([R]);
    for (const o of objs) if ((o.id === 'wine_flag' && Math.abs(o.x - 832) < 4) || (o.id === 'tea_table' && o.y > 1820 && o.y < 1850 && o.x > 450 && o.x < 760)) gone.add(o);
    const keep = objs.filter(o => !gone.has(o));
    const inBox = (o, x, y) => x >= o.x && x < o.x + o.w && y >= o.y && y < Math.max(o.y + o.h, o.sy || 0) + 8;
    // 拆掉的东西占的格子放开（别的东西也压着的格子不动）
    for (const o of gone) for (let r = Math.floor(o.y / cs); r <= Math.floor(((o.sy || o.y + o.h) + 8) / cs) && r < rows; r++) for (let c = Math.floor(o.x / cs); c < Math.ceil((o.x + o.w) / cs) && c < cols; c++) {
      const x = c * cs + cs / 2, y = r * cs + cs / 2; if (!inBox(o, x, y)) continue; if (keep.some(k => inBox(k, x, y))) continue; bl[at(c, r)] = '0'; }
    // 新房子：照 house_03 原件的挡路格子抄一份
    const H = { id: 'house_03', uid: 'r278_qy_chen', img: tpl.img, x: 533, y: 1608, w: tpl.w, h: tpl.h, sy: 1888, flip: false, noPre: true };
    for (const k in tpl) if (!(k in H)) H[k] = tpl[k];
    const dx = Math.round((H.x - tpl.x) / cs), dy = Math.round((H.y - tpl.y) / cs);
    for (let r = Math.floor(tpl.y / cs); r <= Math.floor((tpl.sy + 8) / cs); r++) for (let c = Math.floor(tpl.x / cs); c < Math.ceil((tpl.x + tpl.w) / cs); c++) if (B.blocked[at(c, r)] === '1') { const c2 = c + dx, r2 = r + dy; if (c2 >= 0 && c2 < cols && r2 >= 0 && r2 < rows) bl[at(c2, r2)] = '1'; }
    keep.splice(keep.indexOf(objs[iR - 1]) + 1, 0, H);
    B.objs = keep; B.blocked = bl.join('');
    { const d0 = (TMAPS.qy_town.doors || []).find(d => d.to === 'qy_tavern'); if (d0) window.R278_TAVERN_AT = d0.at; }   // 醉仙楼门里落脚点，R282 在玄天城开门时用
    TMAPS.qy_town.doors = (TMAPS.qy_town.doors || []).filter(d => d.to !== 'qy_tavern');
    try { if (window.MM_CLEAR) MM_CLEAR('qy_town'); } catch (e) {}
  }
  // ---- 4. 青阳镇添两户：陈家（原醉仙楼那块）、孙家（镇东北空房）。作者 11-14 改主意：醉仙楼在玄天城盖在云来客栈南边那排铺面（xt_arcade_r18）的位置，沈家、柳家照旧留在玄天城 ----
  if (window.R257 && R257.build) {
    R257.build('qy_home_chen', { plan: 'yi1', city: 'qy_town', door: [533 + 156, 1888], label: '陈家', title: '陈宅', people: [['villager_m', '陈老汉', ['这块地原先是醉仙楼。醉仙楼搬去玄天城开大店，我儿子跟去跑堂了，就把这块地盘下来给我养老。', '玄天城一碗面要十文！还是镇上好，清净，便宜。', '灶上炖着萝卜，少侠不嫌弃就尝一口。'], 'cooking', 'up']] });
    R257.build('qy_home_sun', { plan: 'yi2', city: 'qy_town', door: [2437 + 312 * .47, 332.8], label: '孙家', title: '孙宅', people: [['maid', '孙小翠', ['我在悦来客栈后厨帮工，今日轮休。', '我们东家是「八方来」，玄天城那家云来客栈也是一家的。听说那边一间上房，够我挣半年。', '难得歇一天，把攒了半个月的衣裳都补了。'], 'sewing_side']] });
  }
  // 作者 11-14：青阳镇下排王家、东边李家的门都在城墙背后，人走过去被墙挡住 →「不要了，没必要放那么多人家」，两户关门（房子照旧摆着）
  TMAPS.qy_town.doors = (TMAPS.qy_town.doors || []).filter(d => d.to !== 'qy_home_wang' && d.to !== 'qy_home_li');
  window.R278 = 1;
})();
