// R107 苍月篇新地图（作者 11-03：Codex 那批地图像概念图、尺寸不对、布局不对——用那批素材里还不错的，加上以前用过的素材，自己拼）
// 十八张：幽影林（林边宿营 / 追虎迷径）、女娲秘境（天瀑 / 神像古道 / 群像遗庭 / 山巅小庙 / 庙内 / 庙后灵泉）、
//         苍月城（南门 / 旧街 / 城主府 / 议事正堂 / 三间客舍 / 北郊阵门）、炼魂谷地下密道（两层）。
// 画法跟青阳镇、山外树林一样：整张地面图（草地、土路、石板、影子、远处的树都烘在里面）+ 靠近路的树和物件单独按脚底排序（人能走到树后面）。
// 人物 ~110px，树 280~380px，房子 ~300px —— 玩家视角下一屏能看见一整片场景，不再是几棵巨树。
// 现在只接进「测试 → 地图传送」（id 以 m_ 开头），剧情还走原来的；等作者看过再接进第三章。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const BL = {"atlas_0": "8a22c4b3feb26d3d45126ddf4620481e", "g_cy_council": "8681516d6b911d4a5862d8ef97d385d5", "g_cy_gate": "c52acf8f9317438ba31e1c67e530855e", "g_cy_guest_lin": "0f7151f69000646968dd04ac250e79f7", "g_cy_guest_ye": "e461a196ec19d7b89851694e3e7eff47", "g_cy_guest_yun": "55a3537fd8d3d0d17ee883e8dce84aea", "g_cy_manor": "d79384eb14cdfe08a8c173296a2e8b09", "g_cy_north": "6438f2370415dd70bd27a9bc37545f54", "g_cy_street": "d61e3799eccacb7654d3b31f0da185f3", "g_nw_court": "c23eb78f149c3452fdf1bc1dc542bc2b", "g_nw_falls": "f2d0612a2c973254405f786ac6bc7ff8", "g_nw_inner": "bb4f25b5be2336d71d0af4b3a2ad51dc", "g_nw_path": "1c855ce897b0abb37a305cf384a49cea", "g_nw_spring": "355026dc236e67136754574c55c39003", "g_nw_temple": "fabd4c83986a08225fd735d02c5d5beb", "g_xx_b1": "a71f0cba585ba6617b1616870d69db0e", "g_xx_b2": "303a8130ea00aa528257f5acdf8dc843", "g_yy_deep": "9767ef76ed45c7232ef50b7d17d5a322", "g_yy_edge": "e75898842f196cf88f3a82ff15585eec"};   // 发布版 blob
  const SRC = k => LOC || !BL[k] ? 'r107/' + k + '.webp' : '/_blob/' + BL[k];
  const NAMES = __NAMES__, ATLAS = __ATLAS__, PAGES = __PAGES__;
  const DATA = __DATA__;
  const PFX = '__PFX__';
  // ---- 物件图集：用到时才载，载完切成单张 ----
  let atlasLoading = false;
  const loadAtlas = () => { if (atlasLoading) return; atlasLoading = true;
    for (let p = 0; p < PAGES; p++) { const im = new Image(); im.onload = () => { for (const [k, e] of Object.entries(ATLAS)) if (e[0] === p) { const c = document.createElement('canvas'); c.width = e[3]; c.height = e[4]; c.getContext('2d').drawImage(im, e[1], e[2], e[3], e[4], 0, 0, e[3], e[4]); IMG['r107_' + k] = c; } }; im.src = SRC('atlas_' + p); } };
  const loadGround = id => { const k = 'r107g_' + id; if (IMG[k] || loadGround[k]) return; loadGround[k] = 1; const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = SRC('g_' + id); };
  const LOOT = [[['p_big', 2], ['gold', 160]], [['p_mp', 3]], [['c_jade', 1], ['gold', 80]], [['p_small', 3], ['gold', 120]]];
  for (const [id, d] of Object.entries(DATA)) {
    const key = PFX + id; if (TMAPS[key]) continue;
    // 碰撞：游程编码还原成 '0'/'1' 字符串
    let s = '', v = d.b0; for (const n of d.b) { s += v.repeat(n); v = v === '1' ? '0' : '1'; }
    const objs = d.o.map(([i, x, y, w, h, sy, f]) => ({ id: NAMES[i], img: 'r107_' + NAMES[i], x, y, w, h, sy, flat: !!(f & 1), flip: !!(f & 2) }));
    const baked = { ground: 'r107g_' + id, w: d.w, h: d.h, cs: 16, cols: d.cols, rows: d.rows, blocked: s, objs };
    const def = { title: d.t, baked, r107: id, water: d.wa || [], indoor: !!(d.meta && d.meta.indoor), start: d.start, npcs: [], leaves: /^yy_|^nw_|cy_north/.test(id),
      chests: d.ch.map(([c, r], i) => ({ c, r, items: LOOT[i % LOOT.length] })),
      exits: d.ex.map(e => Object.assign({}, e, { cond: () => e.to.startsWith(PFX) && !!TMAPS[e.to], msg: e.label + '：这条路还没通（等接进剧情）' })) };
    if (d.mobs) { const Z = d.z; def.mobs = Object.assign({}, d.mobs, { zone: (c, r) => { const x = (c + .5) * 16, y = (r + .8) * 16; return Z.some(([zx, zy, zr]) => Math.hypot(x - zx, y - zy) < zr); } }); }
    TMAPS[key] = def;
  }
  // 进图时载地面和图集
  tileSetMap = (o => function (name) { const d = TMAPS[name]; if (d && d.r107) { loadAtlas(); loadGround(d.r107); } return o.apply(this, arguments); })(tileSetMap);
  // 每张图自己的色调（幽影林偏暗偏青）和灵光
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function (T, cam, now) {
    const r = o.apply(this, arguments); const d = world.map && world.map.def; if (!d || !d.r107) return r; const D = DATA[d.r107];
    const z = (typeof VZ === 'function' ? VZ() : 1) || 1, vw = W / z, vh = H / z;
    if (D.meta && D.meta.grade) { ctx.save(); ctx.fillStyle = D.meta.grade; ctx.fillRect(cam.x - 4, cam.y - 4, vw + 8, vh + 8); ctx.restore(); }
    for (const L of D.lights || []) { if (L.x + L.r < cam.x || L.x - L.r > cam.x + vw || L.y + L.r < cam.y || L.y - L.r > cam.y + vh) continue;
      const a = .32 + Math.sin(now * 1.7 + L.x) * .08; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r); g.addColorStop(0, `rgba(${L.c},${a})`); g.addColorStop(1, `rgba(${L.c},0)`); ctx.fillStyle = g; ctx.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); ctx.restore(); }
    return r; })(tileAmbientHigh);
  window.R107_MAPS = { DATA, SPOT: (id, k) => DATA[id] && DATA[id].spots[k] };
})();
