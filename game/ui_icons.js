// ================= Codex R58 技能/指令图标图集 · 特效对应版（160px × 34，6 列；技能图标按实际特效重画）=================
(function () {
  const MAP = {"book": 0, "cmd_atk": 1, "cmd_def": 2, "cmd_flee": 3, "cmd_item": 4, "cmd_skill": 5, "cmd_ult": 6, "daxue": 7, "dianxing": 8, "gongfa_jiuyao": 9, "gongfa_jiuyin": 10, "gongfa_tianjian": 11, "gongfa_xuemai": 12, "guangming": 13, "heian": 14, "huti": 15, "jiutian": 16, "jueying": 17, "luanshen": 18, "ningfeng": 19, "qunxing": 20, "riyue": 21, "shaxing": 22, "shikong": 23, "sun": 24, "tianlai": 25, "tianshu": 26, "tianxuan": 27, "tunshi": 28, "xingluo": 29, "xingyun": 30, "yinbo": 31, "yujian": 32, "zhuihun": 33, "xingluo2": 34};   // R72：点星(8) 换 Codex 点星C，星落(34) 用 Codex 星落B
  const S = 160, COLS = 6, img = new Image(); let ok = false; img.onload = () => ok = true; img.src = 'ui_icons/skills.webp?v=r72';

  // 「星落」已有 Codex 正式图标（R72 星落B，图集第 34 格），原来的代码画版去掉
  const EXTRA = {};
  // 战斗技能 id → 图标名（id 和图标名不一样的几个）
  const ALIAS = { pojun: 'tianxuan', tanlang: 'zhuihun' };
  window.UI_ICONS = {
    key: id => (id in ALIAS ? ALIAS[id] : id),
    has: k => (ok && k in MAP) || !!EXTRA[k],
    // 以圆徽章半径 r 画在 (x,y)；dim=锁定时压暗去色
    draw(k, x, y, r, dim) { if (EXTRA[k]) { const c = ctx, sz = 2 * r * 512 / 470; c.save(); if (dim) c.filter = 'grayscale(.85) brightness(.55)'; c.drawImage(EXTRA[k], x - sz / 2, y - sz / 2, sz, sz); c.restore(); return true; }
      if (!ok || !(k in MAP)) return false; const i = MAP[k], sz = 2 * r * 512 / 470;
      const c = (typeof ctx !== 'undefined' && ctx) || null; if (!c) return false; c.save();
      if (dim) c.filter = 'grayscale(.85) brightness(.55)';
      c.drawImage(img, (i % COLS) * S, Math.floor(i / COLS) * S, S, S, x - sz / 2, y - sz / 2, sz, sz); c.restore(); return true; },
  };
})();
