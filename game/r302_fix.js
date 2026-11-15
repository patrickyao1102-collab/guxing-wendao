// ================= R302 · 逐张地图查漏（11-15，作者在整理房间，让我一张一张地图查）=================
// ① 后山 · 林间（seal_field）：回「演武广场」的传送阵画在地图最下沿，那几行全是挡路格，人走不到阵上 → 阵上那块打开，出口挪到阵上（y 864–927）。
// ② 玄天城 · 许家：许家的门画在前排梁家的屋顶上（许宅整栋藏在梁家背后），门光浮在屋瓦上 → 照作者 11-14 对王家、李家的处理：关门，房子照旧摆着。
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
})();
