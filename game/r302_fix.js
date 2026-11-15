// ================= R302 · 逐张地图查漏（11-15，作者在整理房间，让我一张一张地图查）=================
// ① 后山 · 林间（seal_field）：回「演武广场」的传送阵画在地图最下沿，那几行全是挡路格，人走不到阵上 → 阵上那块打开，出口挪到阵上（y 864–927）。
// ② 玄天城 · 许家：许家的门画在前排梁家的屋顶上（许宅整栋藏在梁家背后），门光浮在屋瓦上 → 照作者 11-14 对王家、李家的处理：关门，房子照旧摆着。
// ③ 幽影林 · 追虎迷径：守林老人站在大松树的树冠底下，只看得见头顶的名字 → 挪到林间小路上（入口北边一点）。
// ④ 林府 · 东厢：林府老管事站在屏风边上，半个身子插进屏风里 → 挪到屏风右前方的空地上。
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
  const MOVE = { m_yy_tiger: ['守林老人', 2040, 3300], lin_guest_east: ['林府老管事', 690, 580] };
  const put = m => { const v = MOVE[m], M = TMAPS[m]; if (!v || !M) return; for (const n of M.npcs || []) if (n.name === v[0] && !n.hidden) { n.c = v[1] / 64 - .5; n.r = v[2] / 64 - .8; } };
  for (const m in MOVE) put(m);
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { try { put(m); } catch (e) {} return o.apply(this, arguments); })(tileSetMap);   // 别的脚本后来再挪也盖回来
})();
