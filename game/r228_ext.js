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
    ['xt_city', 'xt_teahouse_22', 'teahouse3', 460, 660, 230, 642],   // R246：正门改成半开的雕花格扇门、门里亮着（作者：原来像个大门洞）
    // 旧：     // 听雨楼：R238 按正确比例重画（门洞 108×136，一层茶堂 + 两层露台 + 伞顶）
  ];
  for (const [map, uid, k, w, h, ax, ay] of L) {
    const M = TMAPS[map], o = M && M.baked && (M.baked.objs || []).find(o => o.uid === uid); if (!o) continue;
    const im = new Image();
    im.onload = () => { try { IMG['r228_' + k] = im; const X = o.ax != null ? o.ax : o.x + o.w / 2, Y = o.ay != null ? o.ay : o.sy;
      const nw = { img: 'r228_' + k, w, h, x: Math.round(X - ax), y: Math.round(Y - ay), noPre: true }; Object.assign(o, nw);
      // 作者 11-13：从测试面板直接跳进玄天城时新楼不出来（要进一次楼再出来才换）、M 键大地图也还是旧楼——
      // 地图是进图那一刻照着数据抄一份的，图片后到就只改了数据、没改已经抄好的那份。这里把眼前这张图也一起改掉，再让大地图重画。
      try { if (typeof world !== 'undefined' && world.map && world.mapName === map) { const lo = (world.map.T.objs || []).find(x => x.uid === uid); if (lo) Object.assign(lo, nw); } } catch (e) {}
      try { if (window.MM_CLEAR) MM_CLEAR(map); } catch (e) {} } catch (e) {} };
    im.src = 'r228/' + k + '.webp';
  }
})();
