// ================= R175 · 小怪战斗建模重做（作者 11-09：「很多小怪的建模都很不好看」「你认为不好的都去重做」）=================
// Codex R175 交付的 15 只新立绘替换原来的战斗图（以及图鉴 / 大地图里用到的同一 key）。
// 原来这几只有的走「即梦序列帧」、有的走「骨骼动画」，那两套用的还是旧画，所以这里把这些 key 从两套里摘掉，统一用新立绘 + 游戏自带的呼吸 / 受击。
(function () {
  const KEYS = ['m_wolf', 'm_monkey', 'm_tree', 'e_boar', 'e_wolf2', 'e_rhino', 'e_spider', 'e_xiexiu', 'e_corpse2', 'e_xbat', 'e_xwraith', 'e_xspider', 'e_xguard1', 'e_xguard2', 'e_xguard3'];
  const NEW = {};
  for (const k of KEYS) { const im = new Image(); im.onload = () => { NEW[k] = im; }; im.src = 'r175/' + k + '.webp'; }
  function enforce() {
    try {
      for (const k of KEYS) {
        if (window.VSPRITES && VSPRITES[k]) delete VSPRITES[k];
        if (window.RIG_MAP && RIG_MAP[k]) delete RIG_MAP[k];
        if (NEW[k] && typeof IMG !== 'undefined' && IMG[k] !== NEW[k]) IMG[k] = NEW[k];
      }
      if (window.VS_SCALE) for (const k of KEYS) delete VS_SCALE[k];
    } catch (e) {}
  }
  enforce(); setInterval(enforce, 500);
  window.R175_MOBS = { KEYS, ready: () => KEYS.every(k => NEW[k]) };
})();
