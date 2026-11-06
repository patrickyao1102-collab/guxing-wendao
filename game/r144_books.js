// ================= R144 · 技能书图标（Codex R142，作者 11-07：技能书要好看、独特，做成和技能图标一样的）=================
// 22 本书各一张图：秘传 5、剑谱 11、乐谱 2、剑诀卷册 4（卷二青灰 → 卷三蓝 → 卷四紫 → 卷五金）。封面纹样直接取自对应技能图标。
// 背包、商店、获得物品框都走 itemIcon：这里接在最外层，原来代码画的蓝色 / 紫色方块书不再出现。圆底和品质圈照物品图标的画法。
(function () {
  if (typeof itemIcon !== 'function') return;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const M = {"bk_linxue_bingfeng":0,"bk_shenle_jiuyinhe":1,"bk_shenle_shenfa":2,"bk_yt_jiutian":3,"bk_yunting_yunlei":4,"jp_dianxing":5,"jp_jueying":6,"jp_liehun":7,"jp_pojun":8,"jp_qingxin":9,"jp_qunxing":10,"jp_shaxing":11,"jp_tanlang":12,"jp_tianshu":13,"jp_tunshi":14,"jp_xingluo":15,"jp_xingluo2":16,"jp_xingyun":17,"juan2":18,"juan3":19,"juan4":20,"juan5":21};
  const S = 192, C = 6, img = new Image(); let ok = false; img.onload = () => { ok = true; }; img.src = LOC ? 'r142/books.webp' : '/_blob/8d94bd681e3d8f1a057e9905866b6ff2';
  const QC = ['#9a8a70', '#5fbf73', '#5f9cf0', '#f0b43a'];
  const Q = id => /^bk_/.test(id) ? 3 : id === 'juan5' ? 3 : id === 'juan4' || id === 'juan3' ? 2 : 1;
  window.BOOK_ICON = { has: id => ok && id in M, draw(id, x, y, size) { if (!ok || !(id in M)) return false; const i = M[id]; ctx.drawImage(img, (i % C) * S, Math.floor(i / C) * S, S, S, x - size / 2, y - size / 2, size, size); return true; } };
  itemIcon = (orig => function (id, x, y, r) {
    if (!ok || !(id in M)) return orig.apply(this, arguments);
    const q = Q(id); ctx.save();
    const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = QC[q]; ctx.stroke();
    if (q >= 2) { ctx.globalAlpha = .35; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    const i = M[id], sz = r * 2.25; ctx.drawImage(img, (i % C) * S, Math.floor(i / C) * S, S, S, x - sz / 2, y - sz / 2, sz, sz); ctx.restore();
  })(itemIcon);
})();
