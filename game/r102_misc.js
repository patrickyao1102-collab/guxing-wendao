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
        f.ch2_market = 1;
        setTimeout(async () => {
          if (world.mapName !== 'tj_market') return;
          const lk = world.locked; world.locked = true;
          try {
            await say('星旋', '到了！丹药铺的回春丹、回灵丹多备几颗，打黑风寨用得上。');
            await say('星旋', '兵甲坊看看护甲和饰品；典籍阁有《剑诀·卷二》——学过的招式拿它参悟，能修到第二重。');
            await say('叶孤星', '灵石就这么点……得省着花。');
            await say('星旋', '买完了回问剑坪，南边山门出发。');
            S.quest = '在天剑集市采买（丹药铺 / 兵甲坊 / 典籍阁），买完回问剑坪南边山门出发';
          } finally { world.locked = lk; }
        }, 900);
      }
    } catch (e) {}
    return r;
  })(tileSetMap);
})();
