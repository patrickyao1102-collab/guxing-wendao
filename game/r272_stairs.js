// ================= R272 · 天剑集市南边下问剑坪的楼梯重画 =================
// 作者 11-13 晚：「和地图总体风格颜色不匹配」——原来是米黄石阶、细栏杆柱，像别处拿来的。
// Codex R272 照集市的白玉 + 淡金重画了这段台阶（白玉阶面、白玉淡金矮阶墙、级间投影、中间一条浅云纹带），
// 原生出图后只缩小，透明覆盖贴片，只有台阶那块有画；贴在地图 (2010, 3500)，520×560。两边剑碑、下段传送阵不动。只进测试版。
// 长桥栏杆作者还在和 Codex 改，这里不动。
(function () {
  if (!window.R80_ON || typeof IMG === 'undefined') return;
  const im = new Image(); im.src = 'r272/south_stairs.webp';
  const put = () => { const g = window.R80_GROUND; if (!g || !g._r249 || g._r272 || !im.complete || !im.width || !g.getContext) return;
    // 换一张新画布（游戏按画布认缩放缓存，原地改画不会刷新）
    const c = document.createElement('canvas'); c.width = g.width; c.height = g.height; const x = c.getContext('2d'); x.drawImage(g, 0, 0); x.drawImage(im, 2010, 3500, 520, 560);
    c._r91 = 1; c._r249 = 1; c._r272 = 1; window.R80_GROUND = c; IMG.cx2g_tj_market = c; try { if (window.MM_CLEAR) MM_CLEAR('tj_market'); } catch (e) {} };
  setInterval(put, 500);
})();
