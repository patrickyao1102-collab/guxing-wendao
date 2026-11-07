// ================= R105 · 林逸行走帧 v2（作者 11-08：林逸早就有走路帧了，别再整张图蹦蹦跳跳）=================
// 走路：index.html 的 WALK4.n_linyi = linyi_walk4（7 列 × 3 行，下 / 上 / 左，右 = 左镜像）
// 剧情单帧：被妖狼扑倒 → 跌坐（linyi_fall）；道谢 → 作揖（linyi_bow）。原来是把站立图旋转 / 压扁
(function () {
  if (typeof drawActorT !== 'function') return;
  drawActorT = (o => function (a, now) {
    if (a && a.key === 'n_linyi' && !a.hidden) {
      const k = a.bowing ? 'linyi_bow' : (a.rot || 0) > .25 ? 'linyi_fall' : null, im = k && IMG[k];
      if (im) { const al = a.alpha ?? 1; if (al <= .01) return;
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, k === 'linyi_fall' ? 36 : 24, 8, 0, 0, 7); ctx.fill();
        ctx.globalAlpha *= al; ctx.translate(a.x, a.y); if ((a.dir || 1) > 0 === (k === 'linyi_fall')) ctx.scale(-1, 1); ctx.drawImage(im, -40, -116, 80, 120); ctx.restore(); return; }
      const r0 = a.rot, s0 = a.sq; a.rot = 0; a.sq = 1; try { return o.apply(this, arguments); } finally { a.rot = r0; a.sq = s0; }
    }
    return o.apply(this, arguments);
  })(drawActorT);
})();
