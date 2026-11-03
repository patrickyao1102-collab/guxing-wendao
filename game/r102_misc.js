// R102 杂项（作者 11-03）
// 1) 宗门广场西侧那棵大松树挡住了「竹林归径」法阵 → 移除
(function () {
  if (typeof tileSetMap !== 'function') return;
  const DROP = { tj_front: ['pine_lush_62'] };
  tileSetMap = (orig => function (name) {
    const r = orig.apply(this, arguments);
    try { const L = DROP[name], T = world.map && world.map.T; if (L && T && T.objs) for (let i = T.objs.length - 1; i >= 0; i--) if (L.includes(T.objs[i].uid)) T.objs.splice(i, 1); } catch (e) {}
    return r;
  })(tileSetMap);
})();
