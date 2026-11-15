// ================= R302 · 逐张地图查漏（11-15，作者在整理房间，让我一张一张地图查）=================
// ① 后山 · 林间（seal_field）：回「演武广场」的传送阵画在地图最下沿，那几行全是挡路格，人走不到阵上 → 阵上那块打开，出口挪到阵上（y 864–927）。
// ② 玄天城 · 许家：许家的门画在前排梁家的屋顶上（许宅整栋藏在梁家背后），门光浮在屋瓦上 → 照作者 11-14 对王家、李家的处理：关门，房子照旧摆着。
// ③ 幽影林 · 追虎迷径：守林老人站在大松树的树冠底下，只看得见头顶的名字 → 挪到林间小路上（入口北边一点）。
// ④ 林府 · 东厢：林府老管事站在屏风边上，半个身子插进屏风里 → 挪到屏风右前方的空地上。
// ⑤ 自动扫了一遍「人被前面的东西整个挡住、只露名字」：青阳镇南门两个城门护卫藏在城楼里 → 站到城门外传送阵两边；
//    扎辫子的小丫头和大黄被民居屋顶盖住 → 挪到屋后街上；玄天城富家公子、江湖郎中躲在枫树树冠里 → 挪出来一点；
//    镖师整个人在南城门楼里 → 站到城门洞里左边；卖炊饼的汉子被醉仙楼的长幡挡着 → 右挪；城主府宝库守阁人在火晶台后面 → 站到台子右边；
//    林府护卫在大门屋顶后面 → 站到大门右侧。（听雨楼掌柜在柜台后面露半身，是对的，不动。）
// 只进测试版。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const SF = TMAPS.seal_field;
  if (SF && SF.baked && SF.baked.cs === 32) {
    (SF.open = SF.open || []).push([18, 26, 12, 5]);
    for (const e of SF.exits || []) if (e.to === 'tj_front' && e.y >= 30) Object.assign(e, { y: 27, h: 2 });   // 镜头到不了最底下那 100 像素：阵画在 y≈888，出口就放在阵上
  }
  const XC = TMAPS.xt_city;
  if (XC) XC.doors = (XC.doors || []).filter(d => d.to !== 'xt_home_xu');
  //            地图                 人             原 x   原 y    新 x   新 y
  const MOVE = [['m_yy_tiger', '守林老人', null, null, 2040, 3300], ['lin_guest_east', '林府老管事', null, null, 690, 580],
    ['qy_town', '城门护卫', 1428, 2173, 1424, 2345], ['qy_town', '城门护卫', 1580, 2173, 1576, 2345], ['qy_town', '扎辫子的小丫头', null, null, 704, 1657], ['qy_town', '大黄', null, null, 760, 1657],
    ['xt_city', '富家公子', null, null, 2785, 2180], ['xt_city', '江湖郎中', null, null, 620, 2296], ['xt_city', '镖师', null, null, 2150, 2940], ['xt_city', '卖炊饼的汉子', null, null, 1579, 2497],
    ['xt_manor_treasury', '宝库守阁人', null, null, 656, 641], ['lin_court', '林府护卫', null, null, 1320, 1961]];
  const put = m => { const M = TMAPS[m]; if (!M) return; MOVE.forEach(([mm, nm, ox, oy, nx, ny], i) => { if (mm !== m) return;
    const n = (M.npcs || []).find(n => n.name === nm && !n.hidden && (n._r302 === i || (n._r302 === undefined && (ox === null || Math.abs((n.c + .5) * 64 - ox) < 6))));
    if (n) { n._r302 = i; n.c = nx / 64 - .5; n.r = ny / 64 - .8; } }); };
  const maps = [...new Set(MOVE.map(v => v[0]))];
  for (const m of maps) put(m);
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { try { put(m); } catch (e) {} return o.apply(this, arguments); })(tileSetMap);   // 别的脚本后来再挪也盖回来
})();
