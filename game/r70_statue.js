// ================= 接入 Codex R70：青竹小院 · 叶孤星石像（A 搞怪托腮望天，作者选定）=================
// 摆在「道」字右上侧草地（Codex 定的脚底 [565,1515]，含底座约 202 像素高 ≈ 叶孤星 1.8 倍），加碰撞和「观看」。
(function () {
  const B = typeof CXB2 !== 'undefined' && CXB2.qingzhu_court; if (!B || !TMAPS.qingzhu_court) return;
  const loc = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const im = new Image(); im.onload = () => { IMG.r70_statue_a = im; }; im.src = loc ? 'cx2r70/r70_statue_a.webp' : '/_blob/4a1a902bf201da4886c2c1a7fe999da6';
  const W = 199.08, H = 232.55, AX = 106.92, AY = 220.54, FX = 565, FY = 1515;
  B.objs.push({ id: 'r70_statue_a', uid: 'r70_yeguxing_a', img: 'r70_statue_a', x: FX - AX, y: FY - AY, w: W, h: H, ax: FX, ay: FY, sy: 1646, flat: false, flip: false });
  // 碰撞：脚底左右 64、往上 36 像素（cs = 8）
  const cs = B.cs, bl = B.blocked.split('');
  for (let y = FY - 36; y < FY; y += cs) for (let x = FX - 64; x < FX + 64; x += cs) { const i = Math.floor(y / cs) * B.cols + Math.floor(x / cs); if (i >= 0 && i < bl.length) bl[i] = '1'; }
  B.blocked = bl.join('');
  const P = (x, y) => [x / 64 - .5, y / 64 - .8], [c, r] = P(605, 1551);
  TMAPS.qingzhu_court.npcs.push({ key: 'none', c, r, name: '叶孤星石像', hidden: true, h: 150, talk: async () => { await narrate('石雀站上了头顶，他托着下巴仰望天空，仿佛正无奈地想着：又是我？'); } });
})();
