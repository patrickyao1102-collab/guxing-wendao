// ================= R479 · 载入画面地名题字换成 Codex R477 新题字（只进测试版）=================
// 作者 11-29 01:59：「这个字体怎么感觉还是不对呀？怎么又变成这个金色的了？我不是之前让 Codex 出了个字体吗？」
// → 载入画面左上角的地名从 R163 金色书法题名换成 Codex R477 两套横题（作者 A、B 都喜欢）：
//    A · 行草横题（默认）  r479/A/<地图id>.webp
//    B · 宋刻横题          r479/B/<地图id>.webp
//    每张都是透明底、高 180、宽随字，已经包含「大地名 + 下方小字分区」两级，自带轻微反色描边，亮暗插画都清楚（只有一版，不分亮暗）。
// 测试面板里能切「A 行草 / B 宋刻 / 旧版」，记在本机 localStorage gx_r479_title（A / B / old）。
// 排版（Codex 建议，1280×720 下）：题字左上从 (53,32) 起，显示高 155（原图 180 等比缩）；来历正文由 r478_lore.js 按题字墨迹的实际底边往下排。
// 新题字自带分区小字：旧版图里的小字、r478 给没题名的图补的马善政毛笔题名都不会再画（那条路只有题名图两版都 404 时才走）。
// 按需加载：进哪张图要哪张，进图后把相邻图（出口 / 门通向的）的题字顺手下好；没下好之前 loading.js 先不画题名（插画照常盖着，不黑屏），
//          下好后 0.25 秒淡入，不闪。没有新题字的图（灵泉、秘境、老路等）照旧用 R163 旧题名。
// 挂点：loading.js 的 LOADING_TITLE_SRC（题名图地址）、LOADING_TITLE_PLACE（新题字的位置大小）、LOADING_TITLE_RESET（换样式后清缓存）。
(function () {
  const LSK = 'gx_r479_title';
  const LSG = () => { try { return localStorage.getItem(LSK); } catch (e) { return null; } };
  const LSS = v => { try { localStorage.setItem(LSK, v); } catch (e) {} };
  let MODE = LSG(); if (MODE !== 'A' && MODE !== 'B' && MODE !== 'old') MODE = 'A';
  // Codex R477 交的 174 张（A、B 两套地图一样）
  const IDS = new Set('dh_fang dh_fang_in dh_han dh_han_in dh_song dh_song_in dh_tang dh_tang_in dh_xie dh_xie_in dh_zheng dh_zheng_in dx_east dx_home dx_home_old dx_kitchen dx_mainroom hf_camp hf_valley lin_court lin_forest lin_guest_east lin_guest_west lin_guest_xue lin_manor lin_servants lin_service lin_study lin_teahouse lin_yi_room ly_cave ly_midnorth ly_ridge ly_valley m_cy_bedroom m_cy_council m_cy_gate m_cy_guest m_cy_guiying m_cy_kitchen m_cy_manor m_cy_north m_cy_study m_nw_creek m_nw_falls m_nw_glade m_nw_passage m_nw_spring m_nw_stones m_nw_temple m_xx_b1 m_xx_b2 m_yy_tiger m_yy_verge ml_archive ml_cellar ml_huapo ml_jail ml_morgue ml_secret ml_yamen qingzhu_bamboo qingzhu_court qingzhu_garden qingzhu_garden2 qingzhu_garden2_watch_room qingzhu_kitchen qingzhu_room_afu qingzhu_room_qinghe qingzhu_room_xiaotao qingzhu_servant_room qingzhu_stairs qingzhu_steward_room qingzhu_upper_pavilion qy_changle qy_changle_2f qy_chehome qy_chehome_old qy_defense qy_escape qy_grocery qy_herb qy_home_chen qy_home_li qy_home_sun qy_home_wang qy_house qy_inn qy_inn_room_a qy_inn_room_b qy_inn_s1 qy_inn_s2 qy_inn_s3 qy_rescue qy_shelter qy_smith qy_tavern qy_tea qy_town qy_treasure qy_yicui qy_yicui_2f seal_field tj_forbidden tj_front tj_hall tj_houshan tj_library tj_luoxing tj_market tj_room tj_scripture tj_shanmen tj_xiashan tj_yunjie wyt_base wyt_f1 wyt_f1a wyt_f1b wyt_f1c wyt_f2 wyt_f2a wyt_f2b wyt_f2c wyt_f3a wyt_f3b wyt_f3c wyt_f4a wyt_f4b wyt_f4c wyt_f5a wyt_f5b wyt_f5c wyt_f6a wyt_f6b wyt_f6c xt_auction xt_auction_vip xt_caifeng xt_chengyi xt_city xt_danxia xt_dyeyard xt_home_feng xt_home_he xt_home_liang xt_home_liu xt_home_luo xt_home_qian xt_home_shen xt_home_song xt_home_xu xt_home_zheng xt_home_zhou xt_inn_corr xt_inn_hall xt_inn_room1 xt_inn_room2 xt_inn_room3 xt_inn_room4 xt_manor xt_manor_hall xt_manor_recovery xt_manor_treasury xt_road xt_sect_court xt_sect_hall xt_sect_rest xt_teahouse xt_teahouse_2f xt_wanbao xt_wanbao_store xt_wanbao_vip xt_yanzhi'.split(' '));
  const CFG = { x: 53, y: 32, h: 155, fade: 250 };
  const newSrc = m => (MODE === 'A' || MODE === 'B') && IDS.has(m) ? 'r479/' + MODE + '/' + m + '.webp?v=1' : null;
  // loading.js 每张图要两版（light / dark）：新题字只有一版，两版给同一张（浏览器只下一次）；旧版 / 没有新题字的图照旧给 R163
  window.LOADING_TITLE_SRC = (m, v) => newSrc(m) || ('r163/' + m + '_' + v + '.webp');

  // ---------- 新题字的位置大小（只认这套图；旧版 R163 返回 null，照 loading.js 原来的排法） ----------
  const T = { map: null, t0: 0, last: 0 };
  window.LOADING_TITLE_PLACE = (im, m, now) => {
    if (!im || !/\/r479\/[AB]\//.test(im.src || '')) return null;
    now = now || performance.now();
    if (T.map !== m || now - T.last > 500) { T.map = m; T.t0 = now; } T.last = now;   // 新的一次载入（或题字刚下好第一次画）：从这一刻起淡入
    const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height || 180, sc = CFG.h / ih;
    return { x: CFG.x, y: CFG.y, w: Math.round(iw * sc), h: CFG.h, a: Math.min(1, (now - T.t0) / CFG.fade) };
  };

  // ---------- 按需预载：当前图 + 相邻图 ----------
  const PRE = {};
  function pre(m) { const s = newSrc(m); if (!s || PRE[s]) return; const im = new Image(); PRE[s] = im; im.decoding = 'async'; im.src = s; }
  function preloadNear(name) { const d = typeof TMAPS !== 'undefined' && TMAPS[name]; pre(name); if (!d) return;
    for (const e of (d.exits || []).concat(d.doors || [])) if (e && e.to) pre(e.to); }
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function (name) { try { pre(name); } catch (e) {} const r = orig.apply(this, arguments); setTimeout(() => { try { preloadNear(name); } catch (e) {} }, 600); return r; })(tileSetMap);
  setTimeout(() => { try { if (typeof world !== 'undefined' && world.mapName) preloadNear(world.mapName); } catch (e) {} }, 2500);

  // ---------- 切换样式 ----------
  const NAME = { A: 'A 行草', B: 'B 宋刻', old: '旧版' };
  function set(v) { MODE = v; LSS(v); try { if (window.LOADING_TITLE_RESET) LOADING_TITLE_RESET(); } catch (e) {} mark(); try { if (world && world.mapName) preloadNear(world.mapName); } catch (e) {}
    try { toast('地名题字：' + NAME[v], 2000); } catch (e) {} }
  window.R479 = { get mode() { return MODE; }, set, CFG, has: m => IDS.has(m), src: newSrc, state: () => Object.assign({ now: performance.now() }, T) };   // state 给测试程序看

  // ---------- 测试面板：「地名题字：A 行草 / B 宋刻 / 旧版」 ----------
  let row = null;
  function mark() { if (row) for (const b of row.querySelectorAll('button[data-v]')) b.className = b.dataset.v === MODE ? 'on' : ''; }
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r479]')) return;
      const h = document.createElement('h4'); h.textContent = '11-29 新加 · 载入画面地名题字（Codex R477，记在本机）'; h.setAttribute('data-r479', '1');
      row = document.createElement('div'); row.className = 'row';
      for (const v of ['A', 'B', 'old']) { const b = document.createElement('button'); b.textContent = '地名题字：' + NAME[v]; b.dataset.v = v; b.onclick = () => set(v); row.appendChild(b); }
      p.appendChild(h); p.appendChild(row); mark(); };
    // 面板每次打开都会整个重画（innerHTML），所以一直盯着它：我们这几行没了就再补上（和 r474_neiyuan.js 一样）
    const watch = p => { add(); new MutationObserver(() => { if (!p.querySelector('[data-r479]')) add(); }).observe(p, { childList: true }); };
    if (document.getElementById('dbgPanel')) watch(document.getElementById('dbgPanel')); else { const mo = new MutationObserver(() => { const p = document.getElementById('dbgPanel'); if (p) { mo.disconnect(); watch(p); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}
})();
