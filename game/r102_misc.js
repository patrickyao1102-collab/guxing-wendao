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

// 2) 下山前的集市之行（作者 11-03）：取了流云仙衣之后第一次进天剑集市，星旋指点买什么；买完回问剑坪南边山门出发
(function () {
  if (typeof tileSetMap !== 'function') return;
  const F = () => S.flags || (S.flags = {});
  tileSetMap = (orig => function (name) {
    const r = orig.apply(this, arguments);
    try {
      const f = F();
      if (name === 'tj_market' && f.ch2_liuyun && !f.ch2_depart && !f.ch2_market) {
        f.ch2_market = 1;   // 作者 11-10：「你定吧」——旧版进集市的四句星旋台词和 R134 的购物单重复，删掉旧版，只留 R134 的购物单（它也会写任务栏）
      }
    } catch (e) {}
    return r;
  })(tileSetMap);
})();
