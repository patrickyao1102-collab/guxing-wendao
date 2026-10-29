// ================= 单体技能 / 普通攻击：点选目标 =================
// 选了「攻击」或单体仙术后，敌人头上出现金色箭头，点哪个打哪个；点空白处返回菜单。场上只剩一个敌人时直接出手。
(function () {
  if (typeof doHeroAction !== 'function' || typeof pickTarget !== 'function') return;
  const SINGLE = new Set(['atk', 'tanlang', 'jueying', 'tunshi', 'dianxing', 'shaxing', 'qingxin', 'jinwu']);
  let forced = null;
  pickTarget = (orig => function () { if (forced && forced.alive) return forced; return orig.apply(this, arguments); })(pickTarget);
  doHeroAction = (orig => async function (k) {
    const b = battle;
    if (b && SINGLE.has(k) && !b.__picked && b.P && aliveEnemies().length > 1) {
      b.state = 'pick'; b.pickK = k; b.menu = null; b.pickT0 = performance.now(); return;
    }
    if (b) { forced = b.__picked || null; b.__picked = null; }
    try { return await orig.apply(this, arguments); } finally { forced = null; }
  })(doHeroAction);
  const hit = (t, e) => Math.abs(t.x - e.x) < Math.max(70, (e.w || 120) * .5) && t.y < e.y + 30 && t.y > e.y - (e.h || 200) - 30;
  updateBattle = (orig => function (dt) {
    const b = battle; if (!b || b.state !== 'pick') return orig.apply(this, arguments);
    const t = input.tapped; if (!t) return; input.tapped = null;
    if (performance.now() - b.pickT0 < 150) return;
    const e = aliveEnemies().find(e => hit(t, e));
    if (e) { try { playSnd('ui_click'); } catch (_) {} b.__picked = e; const k = b.pickK; b.state = 'act'; doHeroAction(k); return; }
    // 点空白：回到菜单
    try { playSnd('ui_click'); } catch (_) {} b.state = 'menu'; b.menu = { sel: null, sub: null };
  })(updateBattle);
  drawBattle = (orig => function () {
    orig.apply(this, arguments); const b = battle; if (!b || b.state !== 'pick') return;
    const now = performance.now() / 1000; ctx.save();
    for (const e of aliveEnemies()) { const x = e.x;
      { const pa = .55 + Math.sin(now * 4) * .25; ctx.save(); ctx.translate(x, e.y - 6); ctx.scale(1, .32); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(255,214,120,${pa})`; ctx.beginPath(); ctx.arc(0, 0, 86, 0, 7); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,240,200,${pa * .8})`; ctx.rotate(now * .8); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.arc(0, 0, 100, 0, .5); ctx.stroke(); } ctx.restore(); }
      ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, e.y - 10, 4, x, e.y - 10, 70); g.addColorStop(0, 'rgba(255,220,120,.35)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, e.y - 6, 80, 26, 0, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `30px ${BRUSH}`; textOutline('选择目标', W / 2, 92, '#ffe9b0', '#1a0800', 5);
    ctx.font = `600 16px ${FONT}`; textOutline('点敌人出手 · 点空白处返回', W / 2, 126, '#f0e2c0', 'rgba(0,0,0,.8)', 3);
    ctx.restore();
  })(drawBattle);
})();
