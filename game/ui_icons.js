// ================= Codex R58 技能/指令图标图集 · 特效对应版（160px × 34，6 列；技能图标按实际特效重画）=================
(function () {
  const MAP = {"book": 0, "cmd_atk": 1, "cmd_def": 2, "cmd_flee": 3, "cmd_item": 4, "cmd_skill": 5, "cmd_ult": 6, "daxue": 7, "dianxing": 8, "gongfa_jiuyao": 9, "gongfa_jiuyin": 10, "gongfa_tianjian": 11, "gongfa_xuemai": 12, "guangming": 13, "heian": 14, "huti": 15, "jiutian": 16, "jueying": 17, "luanshen": 18, "ningfeng": 19, "qunxing": 20, "riyue": 21, "shaxing": 22, "shikong": 23, "sun": 24, "tianlai": 25, "tianshu": 26, "tianxuan": 27, "tunshi": 28, "xingluo": 29, "xingyun": 30, "yinbo": 31, "yujian": 32, "zhuihun": 33};
  const S = 160, COLS = 6, img = new Image(); let ok = false; img.onload = () => ok = true; img.src = 'ui_icons/skills.webp?v=r58fx';

  // 「星落」：Codex 图标套里还没有，先按同一徽章规格（512 画布、约 470 圆徽章、细金边）用代码画：夜空里三道金色星光坠地，落点炸开星芒
  const EXTRA = {};
  { const N = 160, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'), R = N * 235 / 512, c = N / 2;
    const bg = g.createRadialGradient(c, c * .8, 4, c, c, R); bg.addColorStop(0, '#2b4f8f'); bg.addColorStop(.7, '#132a55'); bg.addColorStop(1, '#0a1530');
    g.save(); g.beginPath(); g.arc(c, c, R, 0, 7); g.fillStyle = bg; g.fill(); g.clip();
    for (let i = 0; i < 26; i++) { const x = (Math.sin(i * 91.7) * .5 + .5) * N, y = (Math.sin(i * 37.3) * .5 + .5) * N * .7; g.fillStyle = `rgba(220,235,255,${.35 + (i % 3) * .2})`; g.fillRect(x, y, 1.4, 1.4); }
    // 地面法阵弧
    g.strokeStyle = 'rgba(255,214,120,.55)'; g.lineWidth = 2; g.beginPath(); g.ellipse(c, c + R * .62, R * .78, R * .2, 0, 0, 7); g.stroke();
    g.strokeStyle = 'rgba(255,214,120,.3)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(c, c + R * .62, R * .55, R * .13, 0, 0, 7); g.stroke();
    g.globalCompositeOperation = 'lighter';
    for (const [sx, sy, ex, ey, w] of [[c - R * .95, c - R * .95, c - R * .28, c + R * .55, 7], [c - R * .2, c - R * 1.1, c + R * .12, c + R * .6, 9], [c + R * .45, c - R * 1.0, c + R * .55, c + R * .5, 6]]) {
      const gr = g.createLinearGradient(sx, sy, ex, ey); gr.addColorStop(0, 'rgba(255,220,140,0)'); gr.addColorStop(.75, 'rgba(255,226,150,.75)'); gr.addColorStop(1, 'rgba(255,250,225,1)');
      g.strokeStyle = gr; g.lineCap = 'round'; g.lineWidth = w; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
      const hg = g.createRadialGradient(ex, ey, 0, ex, ey, w * 3.4); hg.addColorStop(0, 'rgba(255,255,240,1)'); hg.addColorStop(.35, 'rgba(255,214,120,.8)'); hg.addColorStop(1, 'rgba(255,180,80,0)'); g.fillStyle = hg; g.beginPath(); g.arc(ex, ey, w * 3.4, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,250,230,.95)'; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr = k % 2 ? w * .55 : w * 2.2; g.lineTo(ex + Math.cos(a) * rr, ey + Math.sin(a) * rr); } g.closePath(); g.fill(); }
    g.restore();
    g.lineWidth = N * 7 / 512 * 2; g.strokeStyle = '#d9b46a'; g.beginPath(); g.arc(c, c, R, 0, 7); g.stroke();
    g.lineWidth = 1; g.strokeStyle = 'rgba(255,236,190,.8)'; g.beginPath(); g.arc(c, c, R - 3, 0, 7); g.stroke();
    EXTRA.xingluo2 = cv; }
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
