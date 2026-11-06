// ================= 作者 11-07：换装属性面板换成第十稿「五人统一金色」干净底板（Codex R134 拆件，坐标与第八 / 九稿一致）=================
(function () {
  const K = ['hero', 'linxue', 'luochen', 'shenle', 'yunting'], NEW = {};
  K.forEach(k => { const im = new Image(); im.onload = () => { NEW[k] = im; IMG['eqp_' + k] = im; }; im.src = 'eqp10/eqp10_' + k + '.webp'; });
  // 旧底板晚到时别把新的盖回去
  setInterval(() => { for (const k in NEW) if (IMG['eqp_' + k] !== NEW[k]) IMG['eqp_' + k] = NEW[k]; }, 500);
  // 干净底板的按钮是空的：「确定」二字由这里画（跟面板同样的淡入缩放）
  if (typeof drawPanel === 'function') drawPanel = (o => function () {
    const r = o.apply(this, arguments);
    try { const P = sysPanel; if (P && P.eqp && NEW[P.eqp.who] && IMG['eqp_' + P.eqp.who] === NEW[P.eqp.who]) {
      const k = ease(Math.min(1, P.t * 4)), z = .94 + .06 * k;
      ctx.save(); ctx.translate(640, 360); ctx.scale(z, z); ctx.translate(-640, -360); ctx.globalAlpha = k;
      ctx.font = `26px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f6e8c7'; ctx.fillText('确 定', 640, 564); ctx.restore(); } } catch (e) {}
    return r;
  })(drawPanel);
})();
