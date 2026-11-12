// ================= R228 · 多层建筑外观（作者 11-12：里面房间多的楼，外面不能还是平房）=================
// Codex 重画了四栋：倚翠楼（R232 白色琴楼：月洞门、八角琴阁、波浪屋脊、白玉兰）、长乐坊（厚顶封窗、侧面木梯）、云来客栈（两层横向长廊）、万宝楼（三层尖顶）。
// 作者 11-13：人和门的比例要对（门洞要比人高一截，以丹霞堂为准）——倚翠楼放大 1.25、长乐坊 1.4、云来客栈 1.12，用高清原图缩出来。
// 只换这些实例的图和图像锚点；占地、门口、传送、碰撞一概不动。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const L = [
    ['qy_town', 'house_03_3', 'yicui3', 390, 505, 195, 496],   // R232：白色琴楼（作者：白一点、独特一点）
    ['qy_town', 'house_02_2', 'changle2', 437, 452, 218, 445],
    ['xt_city', 'xt_inn_20', 'yunlai2', 797, 564, 399, 551],
    ['xt_city', 'xt_auction_23', 'wanbao', 359, 607, 179.309, 600.114],
    // R234 第一批（作者 11-12：这种创意给玄天城其他有特色的也改一下）
    // 玄兵阁、玄元拍卖场：作者 11-13 说更喜欢老版本，换回原图（R234 / R237 的图留在 Codex 交付目录里，不再用）
    ['xt_city', 'xt_apothecary_21', 'danxia2', 321, 620, 160.5, 613],   // 丹霞堂：R235 丹药葫芦（作者：丹炉像炼器，要葫芦）
    ['xt_city', 'xt_teahouse_22', 'teahouse3', 460, 660, 230, 642, 'teahouse3_night'],   // R246：正门改成半开的雕花格扇门、门里亮着（作者：原来像个大门洞）
    // 旧：     // 听雨楼：R238 按正确比例重画（门洞 108×136，一层茶堂 + 两层露台 + 伞顶）
  ];
  // 作者 11-13：从测试面板直接跳进玄天城，新楼还是不出来、M 键大地图也是旧的——
  // 原来只在脚本刚载入时换一次：那时地图数据 / 贴图表有时还没备好（或之后被重建），这一次就白换了。
  // 现在改成每隔半秒核对一遍：数据里的、眼前这张地图里的，只要还是旧图就再换，换到为止（换好后几乎不花时间）。
  // 夜里亮灯的版本（有图的才换）：入夜后同一栋楼换成亮灯图，天亮换回来
  const NI = {}; for (const e of L) if (e[7]) { const im = new Image(); im.onload = () => { im._ok = 1; }; im.src = 'r228/' + e[7] + '.webp'; NI[e[2]] = im; }
  const night = () => { try { const f = S.flags || {}; return f.res_tod === 'night' || !!f.auc_night || window.R236_FORCE === 'night'; } catch (e) { return false; } };
  const IM = {}; for (const [, , k] of L) { const im = new Image(); im.onload = () => { im._ok = 1; apply(); }; im.src = 'r228/' + k + '.webp'; IM[k] = im;
    try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} }   // 开局阶段不要紧的图会排队慢慢下（img_guard.js，停在标题画面时一次只下两张）；这几张楼要马上用，插队
  function apply() { let ch = null;
    for (const [map, uid, k, w, h, ax, ay] of L) { const im = IM[k]; if (!im._ok) continue; const key = 'r228_' + k;
      try { const use = NI[k] && NI[k]._ok && night() ? NI[k] : im; if (IMG[key] !== use) IMG[key] = use; } catch (e) {}
      const fix = o => { if (!o || o.img === key) return; const X = o.ax != null ? o.ax : o.x + o.w / 2, Y = o.ay != null ? o.ay : o.sy; Object.assign(o, { img: key, w, h, x: Math.round(X - ax), y: Math.round(Y - ay), noPre: true }); ch = map; };
      try { const M = TMAPS[map]; fix(M && M.baked && (M.baked.objs || []).find(o => o.uid === uid)); } catch (e) {}
      try { if (typeof world !== 'undefined' && world.map && world.mapName === map && world.map.T) fix((world.map.T.objs || []).find(o => o.uid === uid)); } catch (e) {} }
    if (ch) try { if (window.MM_CLEAR) MM_CLEAR(ch); } catch (e) {} }
  apply(); setInterval(apply, 500);
})();
