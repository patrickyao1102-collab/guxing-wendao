// ================= R354 · 室内人物大小试用（只进测试版）=================
// 作者 11-17 22:19：拿一间屋做三版不同的人物大小，测试面板「地图传送」里点进去一间间比，挑一个合适的，以后室内都照它。
// 用叶孤星居室（作者认为这间比例最接近，「家具比人还大一点」）：屋子、家具一模一样，只有人物大小不同。原版叶孤星居室是 1。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.tj_room || typeof CHAR_SCALE === 'undefined') return;
  const SRC = TMAPS.tj_room;
  [['A', 1.1], ['B', 1.2], ['C', 1.3]].forEach(([k, z]) => {
    const id = 'scale_test_' + k;
    TMAPS[id] = Object.assign({}, SRC, { title: '★人物大小试用 ' + k + '（' + z + ' 倍）· 叶孤星居室', npcs: [], chests: [], onEnter: null, inter: [] });
    CHAR_SCALE[id] = z;
    try { if (typeof MAP_ZOOM === 'object' && MAP_ZOOM.tj_room) MAP_ZOOM[id] = MAP_ZOOM.tj_room; if (typeof WIDE_OK === 'object' && WIDE_OK.tj_room) WIDE_OK[id] = 1; } catch (e) {}
  });
})();
