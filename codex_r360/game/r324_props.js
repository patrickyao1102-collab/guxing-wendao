// ================= R324 · 支线线索小道具（Codex R314）（只进测试版）=================
// 作者 11-16：「有没有什么素材不好点的……点开以后摸了半天，不知道摸什么」。线索点上原来是空地板，现在摆上真东西：
//   悦来大堂的地窖活门（查桂花酿的时候掀开一条缝）+ 门槛缝里的玳瑁义甲；万宝楼库房货箱边的骨骰；
//   云来天字三号后窗台的泥脚印；天字一号行李架上的包袱；玄天城三盏被动过手脚的灵灯底座上的黑粉（九灯拱一枢进行中才有）。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const F = () => (S.flags = S.flags || {});
  const sq = id => (((F().sq || {})[id]) || {}).s || 0;
  const load = k => { if (IMG['r324_' + k]) return; const im = new Image(); im.onload = () => { try { IMG['r324_' + k] = im; } catch (e) {} }; im.src = 'r324/' + k + '.webp'; };
  const liveSprites = new Map();
  const put = (m, o) => { const T = TMAPS[m]; if (!T || !T.baked) return; const objs = T.baked.objs = T.baked.objs || []; if (objs.some(x => x.uid === o.uid)) return;
    const img = o.img; if (typeof img === 'string') load(img);
    const ob = { id: o.uid, uid: o.uid, x: o.x, y: o.y, w: o.w, h: o.h, sy: o.sy != null ? o.sy : o.y + o.h, flat: !!o.flat, flip: false, noBlock: true, noPre: true };
    if (typeof img === 'function') { for (const k of o.keys) load(k); Object.defineProperty(ob, 'img', { enumerable: true, get: () => 'r324_' + img() }); } else ob.img = 'r324_' + img;
    // 进图时 buildTileMap 会复制物件，随后改任务进度时要重新读取它的贴图。
    if (o.show || typeof img === 'function') {
      const sprite = typeof img === 'function' ? () => 'r324_' + img() : () => 'r324_' + img;
      liveSprites.set(o.uid, () => o.show && !o.show() ? '' : sprite());
    }
    objs.push(ob); };
  // 地上的东西压在人脚下面：排序线往上提
  put('qy_inn', { uid: 'r324_hatch', img: () => sq('qy_wine') === 1 ? 'hatch_ajar' : 'hatch_closed', keys: ['hatch_ajar', 'hatch_closed'], x: 1326, y: 604, w: 96, h: 72, flat: 1 });
  put('qy_inn', { uid: 'r324_pick', img: 'tortoiseshell_pick', x: 1428, y: 664, w: 20, h: 14, flat: 1, show: () => sq('qy_wine') === 1 && !F().qb_jiao });
  put('xt_wanbao_store', { uid: 'r324_die', img: 'bone_die', x: 421, y: 586, w: 18, h: 18, flat: 1, show: () => !F().xw_dice });
  put('xt_inn_room3', { uid: 'r324_print', img: 'mud_print_inward_down', x: 972, y: 228, w: 22, h: 40, sy: 5000 });   // 窗台在书桌后面：画在最上层，不让书桌挡住
  put('xt_inn_room1', { uid: 'r324_bundle', img: 'cloth_bundle', x: 1008, y: 730, w: 64, h: 48 });
  for (const [i, [x, y]] of [[1740, 3086], [2740, 3086], [1856, 2310]].entries())
    put('xt_city', { uid: 'r324_powder' + i, img: 'black_powder', x: x - 24, y: y - 22, w: 48, h: 20, flat: 1, show: () => sq('xt_lamps') === 1 });
  if (typeof tileSetMap === 'function') tileSetMap = (original => function () {
    const result = original.apply(this, arguments);
    for (const obj of world.map?.T?.objs || []) {
      const getSprite = liveSprites.get(obj.uid);
      if (getSprite) Object.defineProperty(obj, 'img', { configurable: true, enumerable: true, get: getSprite });
    }
    return result;
  })(tileSetMap);
})();
