// ================= R176 · 主界面（作者 11-09）=================
// 两套主界面，每次打开游戏随机二选一（作者：「主界面这个和镜湖那个二选一，随机」）：
//   lake ——「问天镜湖」R166 第二十八轮：镜湖底图 + 问字藏剑题标 + 左下四面竖排剑令
//   yg   ——「破军临日 · 曜锋」R166 第三十轮：R157 YG01 原画 + 曜锋题名 + 右下四面剑令
// 每面剑令各有一张选中态。index.html 的标题画面每帧问 R176_TITLE.ready()，素材到齐就由这里来画、来判定点到哪面剑令。
(function () {
  const THEMES = {
    lake: { bg: 'r176/title_bg.webp', name: 'r176/title_name.webp', menu: i => 'r176/menu_' + i + '.webp',
      nameR: [80, 83, 574, 195], M: [112, 438, 350, 208], cols: [[112, 190], [200, 282], [294, 372], [388, 462]], star: [636, 70], zoomY: .42, dim: 'rgba(214,228,230,.62)' },
    yg: { bg: 'r176/yg_bg.webp', name: 'r176/yg_name.webp', menu: i => 'r176/yg_menu_' + i + '.webp',
      nameR: [46, 53, 463, 116], M: [927, 511, 292, 175], cols: [[929, 981], [1008, 1060], [1086, 1138], [1164, 1216]], star: null, zoomY: .45, dim: 'rgba(240,222,196,.66)' },
  };
  let key = Math.random() < .5 ? 'lake' : 'yg';
  try { const q = location.hash.match(/title=(lake|yg)/); if (q) key = q[1]; } catch (e) {}
  const T = THEMES[key], L = {};
  const src = { bg: T.bg, name: T.name, m1: T.menu(1), m2: T.menu(2), m3: T.menu(3), m4: T.menu(4) };
  for (const k in src) { const im = new Image(); im.onload = () => { L[k] = im; }; im.src = src[k]; }
  const ready = () => Object.keys(src).every(k => L[k]);
  const [MX, MY, MW, MH] = T.M, COLS = T.cols;
  const hit = p => { if (!p || p.y < MY - 6 || p.y > MY + MH + 6) return -1; for (let i = 0; i < 4; i++) if (p.x >= COLS[i][0] - 4 && p.x <= COLS[i][1] + 4) return i; return -1; };
  let sel = 0;
  function draw(now, flashIdx, canLoad) {
    // 底图：极慢的呼吸缩放
    const z = 1.015 + Math.sin(now * .12) * .012, cy = H * T.zoomY;
    ctx.save(); ctx.translate(W / 2, cy); ctx.scale(z, z); ctx.drawImage(L.bg, -W / 2, -cy, W, H); ctx.restore();
    if (T.star) {   // 镜湖天上那颗孤星：轻轻闪
      const [sx, sy] = T.star, tw = .55 + .45 * Math.sin(now * 1.7);
      ctx.save(); const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 22); g.addColorStop(0, `rgba(255,250,228,${.55 * tw})`); g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 22, 0, 7); ctx.fill(); ctx.restore();
    }
    const [nx, ny, nw, nh] = T.nameR; ctx.drawImage(L.name, nx, ny, nw, nh);
    // 剑令：电脑上鼠标指到哪面就亮哪面；手机上默认亮第一面，点下去那一刻亮被点的那面
    const hv = typeof input !== 'undefined' ? hit({ x: input.x, y: input.y }) : -1;
    if (hv >= 0 && (hv !== 1 || canLoad)) sel = hv;
    const s = flashIdx >= 0 ? flashIdx : sel, im = L['m' + (s + 1)];
    for (let i = 0; i < 4; i++) {
      const [x0, x1] = COLS[i], sx = x0 - MX - 6, sw = x1 - x0 + 12;
      ctx.save(); if (i === 1 && !canLoad) ctx.globalAlpha = .38;
      ctx.drawImage(im, sx, 0, sw, MH, MX + sx, MY, sw, MH); ctx.restore();
    }
    if (!canLoad) { ctx.save(); ctx.textAlign = 'center'; ctx.font = `15px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = T.dim; ctx.fillText('尚无前尘', (COLS[1][0] + COLS[1][1]) / 2, MY + MH + 22); ctx.restore(); }
  }
  window.R176_TITLE = { ready, draw, hit, theme: key };
})();
