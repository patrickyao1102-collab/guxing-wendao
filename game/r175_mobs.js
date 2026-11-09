// ================= R175 · 小怪战斗建模重做（作者 11-09：「很多小怪的建模都很不好看」「你认为不好的都去重做」）=================
// 第一阶段：Codex 交付 15 只新立绘 → 图鉴 / 大地图用的静态图（r175/<key>.webp）。
// 第二阶段：Codex 交付 20 套动画（8 帧待机 + 12 帧出手，含黑风寨喽啰四款、斗笠弓手）
//   → 打成图集 rig/v175_<key>.webp，挂进「序列帧妖兽」系统（VSPRITE_ADD）：待机循环 / 出手整段 / 受击闪白 / 倒地化灰。
// 原来这些 key 有的走旧的即梦序列帧、有的走骨骼动画，这里统一换成新动画，并把旧的摘掉。
(function () {
  // key: [h（整帧显示高度，按 BATTLE_SIZE ÷ 待机本体占比换算）, 图集参数]
  const M = (fw, fh, footX, footY) => ({ idleEnd: 7, impact: 13, n: 20, cols: 5, fw, fh, footX, footY, fps: 8 });
  const ANIM = {
    m_wolf: [136, M(560, 271, 258.2, 265.3)],
    m_monkey: [205, M(424, 340, 216.8, 335.4)],
    m_tree: [165, M(380, 340, 235.7, 335.7)],
    e_grunt: [245, M(353, 340, 217.8, 335.9)],
    e_grunt_b: [262, M(367, 340, 221.8, 335.9)],
    e_grunt_c: [250, M(512, 340, 328.9, 333.5)],
    e_grunt_d: [240, M(313, 340, 183.1, 336.1)],
    e_archer: [242, M(359, 340, 213.2, 336.0)],
    e_boar: [136, M(545, 340, 312.0, 334.0)],
    e_wolf2: [143, M(514, 340, 221.9, 334.4)],
    e_rhino: [160, M(515, 340, 308.2, 333.8)],
    e_spider: [189, M(538, 340, 293.3, 334.6)],
    e_xiexiu: [242, M(345, 340, 143.3, 336.1)],
    e_corpse2: [242, M(414, 340, 270.0, 335.1)],
    e_xbat: [280, M(497, 340, 280.2, 334.7)],
    e_xwraith: [266, M(558, 340, 378.6, 332.7)],
    e_xspider: [266, M(494, 340, 258.2, 334.8)],
    e_xguard1: [263, M(520, 340, 316.8, 333.3)],
    e_xguard2: [267, M(422, 340, 199.2, 335.7)],
    e_xguard3: [262, M(332, 340, 175.0, 336.1)],
  };
  // 第一阶段静态立绘（图鉴 / 大地图）；喽啰 / 弓手没有单独静态图，用图集第一帧（own = true）
  const KEYS = ['m_wolf', 'm_monkey', 'm_tree', 'e_boar', 'e_wolf2', 'e_rhino', 'e_spider', 'e_xiexiu', 'e_corpse2', 'e_xbat', 'e_xwraith', 'e_xspider', 'e_xguard1', 'e_xguard2', 'e_xguard3'];
  const OWN = { e_grunt: 1, e_archer: 1 };
  const NEW = {};
  for (const k of KEYS) { const im = new Image(); im.onload = () => { NEW[k] = im; }; im.src = 'r175/' + k + '.webp'; }
  function enforce() {
    try {
      if (typeof VSPRITE_ADD === 'function') for (const k in ANIM) {
        const id = 'v175_' + k, V = window.VSPRITES && VSPRITES[k];
        if (!V || V.id !== id) VSPRITE_ADD(k, id, ANIM[k][1], ANIM[k][0], !!OWN[k], !!OWN[k]);
        if (window.RIG_MAP && RIG_MAP[k]) delete RIG_MAP[k];
      }
      if (window.VS_SCALE) for (const k in ANIM) delete VS_SCALE[k];
      for (const k of KEYS) if (NEW[k] && typeof IMG !== 'undefined' && IMG[k] !== NEW[k]) IMG[k] = NEW[k];
    } catch (e) {}
  }
  enforce(); setInterval(enforce, 500);
  // 图集在 rig/ 下会被图片队列排到最后；开打时让它插队（战斗载入画面会等它下完）
  if (typeof startBattle === 'function') startBattle = (o => function () {
    enforce(); const r = o.apply(this, arguments);
    try { if (window.IMG_GUARD && IMG_GUARD.bumpMatch) IMG_GUARD.bumpMatch(['rig/v175_']); } catch (e) {}
    return r;
  })(startBattle);
  window.R175_MOBS = { KEYS, ANIM, ready: () => KEYS.every(k => NEW[k]) };
})();
