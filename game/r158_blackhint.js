// ================= R158 · 黑屏剧情提示（作者 11-07）=================
// 剧情黑屏时，对话框 / 选项 / 系统面板以前画在黑幕下面 → 玩家只看见一片黑，不知道要点屏幕。
// 现在黑幕盖住一大半时：把对话框、选项、面板重新画在黑幕上面，并在下方闪一行「点击屏幕或按任意键继续」。
(function () {
  const HINT = '点击屏幕或按任意键继续';
  let t0 = 0;
  frameInner = (orig => function (now) {
    orig(now);
    try {
      const black = (S.fade || 0) > .45;
      const waiting = !!(dialog || choice || sysPanel);
      if (!black || !waiting || battle) { t0 = 0; return; }
      if (!t0) t0 = now;
      ctx.save(); ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.globalAlpha = 1;
      drawDialog(); drawPanel(); drawChoice();
      if (!choice) {   // 选项本身就要点，不用再提示
        const k = Math.min(1, (now - t0) / 600), a = k * (.55 + .45 * Math.sin(now / 420));
        const y = dialog ? H - 252 : H - 46;
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `600 22px ${FONT}`; ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.85)';
        ctx.strokeText(HINT, W / 2, y); ctx.fillStyle = '#f3dfae'; ctx.fillText(HINT, W / 2, y);
        // 两侧小菱形
        const w = ctx.measureText(HINT).width / 2 + 22; ctx.fillStyle = '#d8b36a';
        for (const s of [-1, 1]) { ctx.save(); ctx.translate(W / 2 + s * w, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-4, -4, 8, 8); ctx.restore(); }
      }
      ctx.restore();
    } catch (e) {}
  })(frameInner);
})();
