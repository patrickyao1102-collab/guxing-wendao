// ================= R176 · 主界面「问天镜湖」（作者 11-09：「这个作为主界面吧」）=================
// Codex R166 第二十八轮：镜湖底图 + 「孤星问道」题标（问字藏剑）+ 四面竖排剑令（每面各有一张选中态）。
// index.html 的标题画面每帧问 R176_TITLE.ready()，素材到齐就由这里来画、来判定点到哪面剑令。
(function () {
  const L = {}, src = { bg: 'r176/title_bg.webp', name: 'r176/title_name.webp', m1: 'r176/menu_1.webp', m2: 'r176/menu_2.webp', m3: 'r176/menu_3.webp', m4: 'r176/menu_4.webp' };
  for (const k in src) { const im = new Image(); im.onload = () => { L[k] = im; }; im.src = src[k]; }
  const ready = () => Object.keys(src).every(k => L[k]);
  // 剑令整组在 1280×720 画面里的位置（Codex 定位层）与每面剑令的点击范围
  const MX = 112, MY = 438, MW = 350, MH = 208;
  const COLS = [[112, 190], [200, 282], [294, 372], [388, 462]];
  const hit = p => { if (!p || p.y < MY - 6 || p.y > MY + MH + 6) return -1; for (let i = 0; i < 4; i++) if (p.x >= COLS[i][0] - 4 && p.x <= COLS[i][1] + 4) return i; return -1; };
  let sel = 0;
  function draw(now, flashIdx, canLoad) {
    // 底图：极慢的呼吸缩放，湖面不晃
    const z = 1.015 + Math.sin(now * .12) * .012;
    ctx.save(); ctx.translate(W / 2, H * .42); ctx.scale(z, z); ctx.drawImage(L.bg, -W / 2, -H * .42, W, H); ctx.restore();
    // 天上那颗孤星：轻轻闪
    ctx.save(); const tw = .55 + .45 * Math.sin(now * 1.7);
    const g = ctx.createRadialGradient(636, 70, 0, 636, 70, 22); g.addColorStop(0, `rgba(255,250,228,${.55 * tw})`); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(636, 70, 22, 0, 7); ctx.fill(); ctx.restore();
    ctx.drawImage(L.name, 80, 83, 574, 195);
    // 剑令：电脑上鼠标指到哪面就亮哪面；手机上默认亮第一面，点下去那一刻亮被点的那面
    const hv = typeof input !== 'undefined' ? hit({ x: input.x, y: input.y }) : -1;
    if (hv >= 0 && (hv !== 1 || canLoad)) sel = hv;
    const s = flashIdx >= 0 ? flashIdx : sel;
    const im = L['m' + (s + 1)];
    for (let i = 0; i < 4; i++) {
      const [x0, x1] = COLS[i], sx = x0 - MX - 6, sw = x1 - x0 + 12;
      ctx.save(); if (i === 1 && !canLoad) ctx.globalAlpha = .38;
      ctx.drawImage(im, sx, 0, sw, MH, MX + sx, MY, sw, MH); ctx.restore();
    }
    if (!canLoad) { ctx.save(); ctx.textAlign = 'center'; ctx.font = `15px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = 'rgba(214,228,230,.62)'; ctx.fillText('尚无前尘', 241, MY + MH + 22); ctx.restore(); }
  }
  window.R176_TITLE = { ready, draw, hit };
})();
