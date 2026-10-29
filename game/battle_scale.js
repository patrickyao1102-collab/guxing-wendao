// ================= 战斗建模统一尺寸（总策划定，2026-10-24）=================
// 所有战斗：同一个角色/妖兽永远同一高度，不随队伍人数、章节、技能变化。
// 基准：叶孤星 240px（1280×720 画面高度的 33%）。数值 = 立绘显示高度（图都已裁到边，等于人物身高）。
(function () {
  const HERO = 240;
  const SIZE = {
    // 我方（身高比例：叶孤星 1.00）
    b_yegx: HERO, b_yunting: 247, b_luochen: 238, b_linxue: 223, b_shenle: 221, b_zhao: 240, b_xingxuan: 232,
    // 人形敌人（与主角同一身高带）
    e_grunt: 236, e_archer: 236, e_xiexiu: 238, e_corpse: 236, e_corpse2: 236, e_corpse3: 236, e_ghost: 228, e_ghost2: 228, e_ghost3: 228,
    // 普通妖兽（叶孤星的 0.70～0.85）
    m_wolf: 125, e_wolf2: 135, e_ywolf: 135, m_tree: 160, e_boar: 130, e_rhino: 150, e_leopard: 140,
    // 半人形妖物
    e_spider: 180, e_treant: 245, m_monkey: 190,
    // 精英（1.10～1.20）
    e_wolfking: 260, e_spiderq: 230, e_ly_eagle: 200, e_ly_wolf: 200,
    // 人形 Boss（1.12～1.25，人终究是人）
    e_boss: 285, e_zhouhu: 290, e_fanglie: 280, e_mozu: 300, e_xxboss: 290, e_elder: 300, e_elder2: 300,
    // 巨兽 Boss（1.50～1.60）
    e_tiger: 320, e_ly_lion: 365, e_ly_roc: 380,
    // 道具/木桩
    m_dummy: 200, e_eye: 200,
  };
  window.BATTLE_SIZE = SIZE;
  // 即梦视频妖兽（逐帧动画）不读 SIZE，用这里的缩放：普通妖兽约为人物的六成高，精英/Boss 更大
  window.VS_SCALE = { e_leopard: .66, e_boar: .66, m_tree: .7, e_wolfking: .85, e_spiderq: .9, e_tiger: .95 };
  const sizeOf = u => {
    if (SIZE[u.key] != null) return SIZE[u.key];
    if (u.side === 'hero') return HERO;
    return null;                       // 表外的敌人保持原值（以后新加的妖兽必须先登记进 SIZE）
  };
  // 骨骼妖兽：让 rig_battle 的换算结果正好等于表里的高度
  const fixRig = () => {
    const M = window.RIG_MAP; if (!M || typeof MOB_DB === 'undefined') return;
    for (const k in M) {
      if (SIZE[k] == null) continue;
      const ent = Object.values(MOB_DB).find(e => e && e.key === k);
      M[k].h = ent ? ent.h : SIZE[k];  // rig 里 H = M.h × u.h / MOB_H，取 M.h = MOB_H 时 H = u.h
    }
  };
  if (typeof startBattle === 'function') startBattle = (orig => function (cfg) {
    const pr = orig(cfg); const b = typeof battle !== 'undefined' && battle;
    if (b && b.units) { fixRig(); for (const u of b.units) { const h = sizeOf(u); if (h) u.h = h; } }
    return pr;
  })(startBattle);
})();
