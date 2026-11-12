// ================= R228 · 多层建筑外观（作者 11-12：里面房间多的楼，外面不能还是平房）=================
// Codex 重画了四栋：倚翠楼（R232 白色琴楼：月洞门、八角琴阁、波浪屋脊、白玉兰）、长乐坊（厚顶封窗、侧面木梯）、云来客栈（两层横向长廊）、万宝楼（三层尖顶）。
// 只换这四个实例的图和图像锚点；占地、门口、传送、碰撞一概不动。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const L = [
    ['qy_town', 'house_03_3', 'yicui2', 312, 404, 156, 397],   // R232：白色琴楼（作者：白一点、独特一点）
    ['qy_town', 'house_02_2', 'changle', 312, 323, 155.742, 317.682],
    ['xt_city', 'xt_inn_20', 'yunlai', 712, 504, 356.255, 492.02],
    ['xt_city', 'xt_auction_23', 'wanbao', 359, 607, 179.309, 600.114],
    // R234 第一批（作者 11-12：这种创意给玄天城其他有特色的也改一下）
    ['xt_city', 'xt_arms_17', 'arms', 540, 530, 270, 520],              // 玄兵阁：一柄插进屋顶的巨剑
    ['xt_city', 'xt_apothecary_21', 'danxia', 321, 620, 160.5, 613],    // 丹霞堂：三足丹炉
    ['xt_city', 'xt_teahouse_22', 'teahouse', 390, 640, 195, 632],      // 茶楼：云上茶台
    ['xt_city', 'commerce-r23-facade', 'auction', 650, 580, 325, 572],  // 玄元拍卖场：悬着玉磬的圆殿
  ];
  for (const [map, uid, k, w, h, ax, ay] of L) {
    const M = TMAPS[map], o = M && M.baked && (M.baked.objs || []).find(o => o.uid === uid); if (!o) continue;
    const im = new Image();
    im.onload = () => { try { IMG['r228_' + k] = im; const X = o.ax != null ? o.ax : o.x + o.w / 2, Y = o.ay != null ? o.ay : o.sy;
      Object.assign(o, { img: 'r228_' + k, w, h, x: Math.round(X - ax), y: Math.round(Y - ay), noPre: true }); } catch (e) {} };
    im.src = 'r228/' + k + '.webp';
  }
})();
