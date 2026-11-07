// ================= Codex R58 技能/指令图标图集 · 特效对应版（160px × 34，6 列；技能图标按实际特效重画）=================
(function () {
  const MAP = {"book": 0, "cmd_atk": 1, "cmd_def": 2, "cmd_flee": 3, "cmd_item": 4, "cmd_skill": 5, "cmd_ult": 6, "daxue": 7, "dianxing": 8, "gongfa_jiuyao": 9, "gongfa_jiuyin": 10, "gongfa_tianjian": 11, "gongfa_xuemai": 12, "guangming": 13, "heian": 14, "huti": 15, "jiutian": 16, "jueying": 17, "luanshen": 18, "ningfeng": 19, "qunxing": 20, "riyue": 21, "shaxing": 22, "shikong": 23, "sun": 24, "tianlai": 25, "tianshu": 26, "tianxuan": 27, "tunshi": 28, "xingluo": 29, "xingyun": 30, "yinbo": 31, "yujian": 32, "zhuihun": 33, "xingluo2": 34};   // R72：点星(8) 换 Codex 点星C，星落(34) 用 Codex 星落B
  const S = 160, COLS = 6, img = new Image(); let ok = false; img.onload = () => ok = true; img.src = 'ui_icons/skills.webp?v=r72';

  // R94 Codex 第二轮定稿：17 枚新招图标，独立图集 960×480，每格 160
  const MAP2 = {"duopo":[0,0],"ningshen":[160,0],"juling":[320,0],"xl_wushang":[480,0],"qianggong":[640,0],"jifeng":[800,0],"boming":[0,160],"yunlei":[160,160],"shuangjia":[320,160],"bingxin":[480,160],"bingdun":[640,160],"bingfeng":[800,160],"qxq":[0,320],"yinzhang":[160,320],"shenfa":[320,320],"jiuyinhe":[480,320],"qingxin":[640,320]};
  const img2 = new Image(); let ok2 = false; img2.onload = () => ok2 = true; img2.src = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:') ? 'ui_icons/skills_r94.webp?v=r94' : '/_blob/42000a674e756d728b8f3cfdbf27a906';
  // 作者 11-08：图标图集也算进载入（没下完不放行进图），领悟 / 技能窗不会出现空图标座
  (function reg(n) { if (!window.PRELOAD) { if (n < 100) setTimeout(() => reg(n + 1), 50); return; } for (const im of [img, img2]) if (!im.complete) PRELOAD('技能图标', new Promise(r => { im.addEventListener('load', r); im.addEventListener('error', r); })); })(0);
  // 「星落」已有 Codex 正式图标（R72 星落B，图集第 34 格），原来的代码画版去掉
  const EXTRA = {};
  // 战斗技能 id → 图标名（id 和图标名不一样的几个）
  const ALIAS = { pojun: 'tianxuan', tanlang: 'zhuihun', xz_lv1: 'qingxin', xz_lv2: 'qingxin', xz_lv3: 'qingxin', xz_lv4: 'qingxin', xz_lv5: 'qingxin', xz_lv6: 'qingxin', xz_lv7: 'qingxin' };   // R94：夺魄等 17 招已有正式图标（skills_r94.webp），不再借图
  window.UI_ICONS = {
    key: id => (id in ALIAS ? ALIAS[id] : id),
    has: k => (ok && k in MAP) || (ok2 && k in MAP2) || !!EXTRA[k],
    // 以圆徽章半径 r 画在 (x,y)；dim=锁定时压暗去色
    draw(k, x, y, r, dim) { if (EXTRA[k]) { const c = ctx, sz = 2 * r * 512 / 470; c.save(); if (dim) c.filter = 'grayscale(.85) brightness(.55)'; c.drawImage(EXTRA[k], x - sz / 2, y - sz / 2, sz, sz); c.restore(); return true; }
      if (ok2 && k in MAP2) { const c = (typeof ctx !== 'undefined' && ctx) || null; if (!c) return false; const [sx, sy] = MAP2[k], sz = 2 * r * 512 / 470; c.save();
        if (dim) c.filter = 'grayscale(.85) brightness(.55)'; c.drawImage(img2, sx, sy, S, S, x - sz / 2, y - sz / 2, sz, sz); c.restore(); return true; }
      if (!ok || !(k in MAP)) return false; const i = MAP[k], sz = 2 * r * 512 / 470;
      const c = (typeof ctx !== 'undefined' && ctx) || null; if (!c) return false; c.save();
      if (dim) c.filter = 'grayscale(.85) brightness(.55)';
      c.drawImage(img, (i % COLS) * S, Math.floor(i / COLS) * S, S, S, x - sz / 2, y - sz / 2, sz, sz); c.restore(); return true; },
  };
})();
