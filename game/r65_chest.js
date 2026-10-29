// ================= R65 · 仙侠宝箱（Codex 交付，六款 × 开关两态 + 地面灵光 + 箱口溢光 + 星芒）=================
// 按 Codex README 接入：箱体 64×56 逻辑尺寸、脚点在底边中点；地面灵光画在箱体下面（普通混合，2.4 秒呼吸、缓慢旋转），
// 打开后叠加箱口溢光（screen 混合，1.8 秒呼吸）和三颗上飘的星芒。地图不同款式不同：
//   01 天剑青玉匣：宗门（问剑坪、藏经阁、青竹小院、集市）　02 星辰灵匣：后山、锁灵阵　03 古木藤纹箱：山外树林、黑风谷、雾林
//   04 描金漆木箱：青阳镇、玄天城　05 富贵金镶箱：林府、城主府、万宝楼　06 玄铁封印箱：黑风寨、邪修之地
// 箱子比原来的大一圈（1.5 倍逻辑尺寸，约 96px 宽），没打开的箱子地面灵光更亮一点，打开过的灵光变淡。
(function () {
  if (typeof drawObj !== 'function' || typeof OBJDEF === 'undefined') return;
  const SL = ['tianjian_jade', 'star_celestial', 'ancient_vine', 'vermilion_lacquer', 'gilded_zitan', 'sealed_iron'];
  const BLOB = {
    'chest_01_tianjian_jade_closed': '988f15d92d451b975cd012e1d9862933', 'chest_01_tianjian_jade_open': 'b5c0552378df92fcdef6730525dec03f',
    'chest_02_star_celestial_closed': '5a410e8afe835e2453958f8c17571e56', 'chest_02_star_celestial_open': '39a873c1fd8e3cb64622fc576d087bf7',
    'chest_03_ancient_vine_closed': 'c58a45eca74c99752e31ebdbfe48f7b1', 'chest_03_ancient_vine_open': 'ad529fe1701706ccbd0396851e680ecb',
    'chest_04_vermilion_lacquer_closed': '5eb4bdece9827f1834be75f24d310994', 'chest_04_vermilion_lacquer_open': '8863958b86a3b6a7a35fba48f786091c',
    'chest_05_gilded_zitan_closed': '9cae11adb1939bd9ddac5b25df959a17', 'chest_05_gilded_zitan_open': '5c54f91c833cbd40fb46716511ff2de4',
    'chest_06_sealed_iron_closed': '98b3817c525c24e41c696633a58f0871', 'chest_06_sealed_iron_open': '4f3e411e54d3332fbf2a0c1f532f9fb7',
    'glow_01_tianjian_jade': '3f56a6dc2bcc11f468e34597692ccb71', 'glow_02_star_celestial': '6b16d5f662793c24bd16926e38f6dddf', 'glow_03_ancient_vine': '13e972eb38ce0e168de6b6e1e72a32a0',
    'glow_04_vermilion_lacquer': 'f7cebf327d0ffb5c94c3896a959ed0eb', 'glow_05_gilded_zitan': '7a2162044ca6504fac542986c16270b4', 'glow_06_sealed_iron': 'bc8926e8e06cba4ac7d3600c413cea1e',
    'inner_01_tianjian_jade': '8177e092d7aeabbd4145e01085596885', 'inner_02_star_celestial': '53089d9bc4aa4759490bd2f1bdc6a8e5', 'inner_03_ancient_vine': 'ba5f39f12000738e3bf6bbb7d3be2c51',
    'inner_04_vermilion_lacquer': 'd3f0aea1c46573ed05a99440d3065167', 'inner_05_gilded_zitan': '3e52602c044b348b157ad9b54bdeb3b3', 'inner_06_sealed_iron': '823eea920c7da33ab113447844d8fc85',
    'sparkle': '7de82af53e243bb2eda768cfa33519b6' };
  const local = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const src = n => local || !BLOB[n] ? 'ui3/r65/' + n + '.webp' : '/_blob/' + BLOB[n];
  const IM = {}, want = {};
  function img(n) { if (IM[n]) return IM[n].ok ? IM[n] : null; if (want[n]) return null; want[n] = 1; const im = new Image(); im.onload = () => { im.ok = true; IM[n] = im; }; im.src = src(n); return null; }
  const stem = i => String(i + 1).padStart(2, '0') + '_' + SL[i];
  // 地图 → 款式（0 起）
  function styleOf(m) {
    m = m || '';
    if (/^(tj_houshan|seal_field|mijing)/.test(m)) return 1;
    if (/^(lin_forest|hf_valley|yy_|ly_|qy_outer|qy_wild|xt_wild|qy_shelter)/.test(m)) return 2;
    if (/^(hf_camp|bl_|xie_|demon|mo_)/.test(m)) return 5;
    if (/^(lin_|xt_manor|xt_governor|xt_wanbao|governor)/.test(m)) return 4;
    if (/^(qy_|xt_|market|jishi)/.test(m)) return 3;
    return 0;
  }
  window.R65_CHEST = { styleOf, force: null };
  function preload(i) { const s = stem(i); for (const n of ['chest_' + s + '_closed', 'chest_' + s + '_open', 'glow_' + s, 'inner_' + s, 'sparkle']) img(n); }
  const SC = 1.5;   // 逻辑尺寸放大倍数
  function drawChest(x, y, open, i, tms) {
    const s = stem(i), t = tms / 1000;
    const cl = img('chest_' + s + '_closed'), op = img('chest_' + s + '_open'), gl = img('glow_' + s), inn = img('inner_' + s), sp = img('sparkle');
    if (!cl || !op) return false;
    ctx.save(); ctx.translate(x, y); ctx.scale(SC, SC);
    if (gl) {
      const pulse = 1 + .035 * Math.sin(2 * Math.PI * t / 2.4);
      ctx.save(); ctx.globalAlpha = (open ? .22 : .48) + .12 * Math.sin(2 * Math.PI * t / 2.4);
      ctx.translate(0, -3); ctx.scale(40 * pulse, 16 * pulse); ctx.rotate(t * Math.PI * 2 / 18);
      ctx.drawImage(gl, -1, -1, 2, 2); ctx.restore();
    }
    ctx.drawImage(open ? op : cl, -32, -56, 64, 56);
    if (open && inn) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .6 + .12 * Math.sin(2 * Math.PI * t / 1.8);
      const st = 1 + .035 * Math.sin(2 * Math.PI * t / 2.1); ctx.translate(0, -24); ctx.scale(1, st); ctx.drawImage(inn, -32, -54, 64, 64); ctx.restore();
    }
    if (sp) {   // 没开的箱子也飘一点星芒，让人远远就看见
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const n = open ? 3 : 2;
      for (let k = 0; k < n; k++) {
        const ph = (t / 2.2 + k / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * ph) * (open ? .7 : .5);
        const sx = [-14, 9, 1][k] + 2 * Math.sin(t + k), sy = (open ? -30 : -40) - ph * 33, sz = [6, 8, 5][k];
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * .4 + k); ctx.drawImage(sp, -sz / 2, -sz / 2, sz, sz); ctx.restore();
      }
      ctx.restore();
    }
    ctx.restore();
    return true;
  }
  drawObj = (orig => function (o) {
    const d = o && o.d;
    if (d && (d === OBJDEF.chest || d === OBJDEF.chest_open)) {
      const i = R65_CHEST.force != null ? R65_CHEST.force : styleOf(typeof world !== 'undefined' && world.mapName);
      const x = (o.c + .5) * TS + (o.ox || 0), y = (o.r + 1) * TS + (o.dy || 0);
      // 落地影子（跟别的物件一致）
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x, y - 4, 44, 12, 0, 0, 7); ctx.fill(); ctx.restore();
      if (drawChest(x, y, d === OBJDEF.chest_open, i, performance.now())) return;
    }
    return orig.call(this, o);
  })(drawObj);
  // 进图时预载本图款式
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments); try { preload(styleOf(name)); } catch (e) {} return r; })(tileSetMap);
  preload(0);
})();

// ================= R68 · 给没有宝箱的地图补上 Codex 宝箱（位置按碰撞格自动挑的可走空地）=================
// 奖励按地图阶段：宗门/后山 → 回春丹、灵石；玄天城/落云岭/青阳外岭 → 大还丹、回灵丹、星华丹、更多灵石
(function () {
  if (typeof TMAPS === 'undefined') return;
  const ADD = {
    tj_front: [[29.5, 15.5, [['p_small', 2], ['gold', 50]]], [6.5, 33, [['p_mp', 2]]], [48.5, 33, [['gold', 80]]]],
    seal_field: [[17.5, 9, [['p_small', 2]]], [3.5, 3.5, [['gold', 60]]], [3.5, 13, [['p_mp', 1], ['p_small', 1]]]],
    tj_houshan: [[11.5, 12, [['p_small', 3]]], [22.5, 6.5, [['gold', 50]]]],
    qingzhu_court: [[17, 9.8, [['p_mp', 2]]], [9.6, 26.3, [['gold', 70]]]],
    qingzhu_stairs: [[7.9, 15.1, [['p_small', 2], ['gold', 40]]], [6.6, 2.6, [['p_big', 1]]]],
    xt_city: [[56, 31.5, [['gold', 150]]], [6.5, 4, [['p_big', 1]]], [15, 45, [['p_mp', 3]]]],
    xt_manor: [[18.4, 25, [['gold', 200]]], [41, 4.1, [['p_revive', 1]]]],
    xt_manor_treasury: [[12.9, 9.4, [['gold', 300], ['p_big', 1]]]],
    tj_library: [[21.5, 15, [['p_mp', 2]]]],
    ly_ridge: [[23.3, 30, [['p_big', 1]]], [8.5, 3, [['gold', 120]]], [36.3, 5.3, [['p_mp', 2], ['p_small', 2]]]],
    ly_midnorth: [[19, 3.5, [['gold', 150]]], [38, 34, [['p_big', 2]]], [4.8, 33.3, [['p_revive', 1]]]],
    ly_cave: [[25, 11.5, [['gold', 200]]], [6, 16, [['p_big', 1], ['p_mp', 2]]]],
    ly_valley: [[15.8, 22, [['p_big', 2]]], [40.3, 5, [['gold', 180]]], [40.8, 37.3, [['p_revive', 1]]]],
    qy_escape: [[21.5, 11, [['p_small', 3]]], [3.5, 18, [['gold', 100]]]],
    qy_shelter: [[29.3, 9.3, [['p_mp', 2]]], [2.8, 21.3, [['gold', 120]]]],
    qy_defense: [[21.3, 3.5, [['p_big', 1]]], [4.5, 29, [['gold', 150]]]],
    qy_rescue: [[31.5, 18.8, [['p_big', 1], ['p_mp', 2]]], [3, 28.5, [['gold', 150]]], [3.5, 2.8, [['p_revive', 1]]]],
    lin_court: [[28, 29.1, [['gold', 160]]], [4.9, 4.6, [['p_big', 1]]]],
    tj_market: [[47.6, 32.1, [['gold', 90]]], [7.1, 31.8, [['p_small', 2], ['p_mp', 1]]]],
  };
  for (const [m, list] of Object.entries(ADD)) {
    const def = TMAPS[m]; if (!def) continue;
    def.chests = def.chests || [];
    if (def.chests.length) continue;   // 已有宝箱的地图不动
    for (const [c, r, items] of list) def.chests.push({ c, r, items });
  }
})();
