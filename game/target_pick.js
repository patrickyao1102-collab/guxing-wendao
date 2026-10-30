// ================= 单体技能 / 普通攻击：点选目标 =================
// 选了「攻击」或单体仙术后，敌人头上出现金色箭头，点哪个打哪个；点空白处返回菜单。场上只剩一个敌人时直接出手。
(function () {
  if (typeof doHeroAction !== 'function' || typeof pickTarget !== 'function') return;
  const SINGLE = new Set(['atk', 'tanlang', 'jueying', 'tunshi', 'dianxing', 'shaxing', 'qingxin', 'jinwu', 'yunlei', 'bingfeng', 'duopo']);
  let forced = null;
  pickTarget = (orig => function () { if (forced && forced.alive) return forced; return orig.apply(this, arguments); })(pickTarget);
  doHeroAction = (orig => async function (k) {
    const b = battle;
    if (b && SINGLE.has(k) && !b.__picked && b.P && aliveEnemies().length > 1) {
      const it = b.menu && b.menu.sub && b.menu.sub.find(x => x.k === k); b.pickName = k === 'atk' ? '普通攻击' : (it && it.name) || ''; b.pickSel = null; b.pickPress = null;
      b.state = 'pick'; b.pickK = k; b.menu = null; b.pickT0 = performance.now(); r86Ring(b); return;
    }
    if (b) { forced = b.__picked || null; b.__picked = null; }
    try { return await orig.apply(this, arguments); } finally { forced = null; }
  })(doHeroAction);
  // R86 A 羊脂白玉选目标：顶部横幅（招式名）+ 目标头顶剑标 + 脚下光环（画在角色后层）+ 底部确认条（返回 / 目标名 / 确认施展）
  const R86ON = () => window.R86 && R86.READY && R86.READY();
  // 横幅和确认条整体缩到 0.8 挪到顶部空位（照 Codex 原尺寸画在中间会压住敌人）
  const GB = [16, 58, .8, 338, 150], GC = [488, 146, .8, 350, 564], XF = (g, r) => ({ x: g[0] + (r.x - g[3]) * g[2], y: g[1] + (r.y - g[4]) * g[2], w: r.w * g[2], h: r.h * g[2] });
  const BACK = XF(GC, { x: 376, y: 584, w: 96, h: 40 }), CONF = XF(GC, { x: 677, y: 582, w: 215, h: 47 }), IN = (p, r) => p && p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
  function r86Ring(b) { if (!R86ON() || typeof addFx !== 'function') return; addFx({ life: 9999, layer: 0, draw(f) { if (battle !== b || b.state !== 'pick') { f.t = f.life; return; } const e = b.pickSel; if (!e || !e.alive) return;
    const now = performance.now() / 1000; ctx.save(); ctx.globalAlpha = .82 + .18 * Math.sin(now * 3.2); window.R86.D('target_ring', e.x - 95, e.y - 24, 190, 60); ctx.restore(); } }); }
  const hit = (t, e) => Math.abs(t.x - e.x) < Math.max(70, (e.w || 120) * .5) && t.y < e.y + 30 && t.y > e.y - (e.h || 200) - 30;
  updateBattle = (orig => function (dt) {
    const b = battle; if (!b || b.state !== 'pick') return orig.apply(this, arguments);
    const t = input.tapped; if (!t) return; input.tapped = null;
    if (performance.now() - b.pickT0 < 150) return;
    if (R86ON()) { const es = aliveEnemies(); if (!es.length) return; if (!b.pickSel || !b.pickSel.alive) b.pickSel = es[0];
      const go = e => { try { playSnd('ui_confirm'); } catch (_) {} b.__picked = e; const k = b.pickK; b.state = 'act'; doHeroAction(k); };
      if (IN(t, CONF)) return go(b.pickSel);
      if (IN(t, BACK)) { try { playSnd('ui_cancel'); } catch (_) {} b.state = 'menu'; b.menu = { sel: null, sub: null }; return; }
      const e = es.find(e => hit(t, e)); if (!e) return;
      if (e === b.pickSel) return go(e);   // 再点一次已选中的敌人 = 直接出手
      try { playSnd('ui_click'); } catch (_) {} b.pickSel = e; return; }
    const e = aliveEnemies().find(e => hit(t, e));
    if (e) { try { playSnd('ui_click'); } catch (_) {} b.__picked = e; const k = b.pickK; b.state = 'act'; doHeroAction(k); return; }
    // 点空白：回到菜单
    try { playSnd('ui_click'); } catch (_) {} b.state = 'menu'; b.menu = { sel: null, sub: null };
  })(updateBattle);
  drawBattle = (orig => function () {
    orig.apply(this, arguments); const b = battle; if (!b || b.state !== 'pick') return;
    if (R86ON()) { const es = aliveEnemies(); if (!b.pickSel || !b.pickSel.alive) b.pickSel = es[0]; const e = b.pickSel, R = window.R86, now = performance.now() / 1000;
      const k0 = Math.min(1, (performance.now() - b.pickT0) / 180), ez = 1 - Math.pow(1 - k0, 3); ctx.save(); ctx.globalAlpha = ez;
      if (e) { const bob = Math.sin(now * 4) * 4; R.D('target_marker', e.x - 18, e.y - e.h - 108 + bob, 36, 72); }
      const G = g => { ctx.translate(g[0], g[1]); ctx.scale(g[2], g[2]); ctx.translate(-g[3], -g[4]); };
      ctx.save(); ctx.translate(0, -(1 - ez) * 16); G(GB); R.D('target_banner', 338, 150, 570, 126); R.D(b.pickK === 'atk' ? 'icon_attack_normal' : 'icon_spell_normal', 375, 181, 64, 64);
      R.txt(b.pickName || '选择目标', 488, 182, 346, 36, 30); R.txt('请选择敌方单体目标 · 再点一次直接出手', 488, 222, 346, 25, 21); ctx.restore();
      const pb = IN(input, BACK) && input.down, pc = IN(input, CONF) && input.down;
      ctx.save(); G(GC); R.D('target_confirm_bar', 350, 564, 580, 78); R.D(pb ? 'back_pressed' : 'back_normal', 374, 580, 100, 46); R.D(pc ? 'confirm_pressed' : 'confirm_normal', 663, 572, 240, 64);
      R.txt('返回', 386, 589, 75, 26, 24, 'center'); R.txt('目标：' + (e ? (e.name || '') : ''), 486, 588, 166, 29, 23, 'center'); R.txt('确认施展', 713, 587, 163, 30, 28, 'center'); ctx.restore();
      ctx.restore(); return; }
    const now = performance.now() / 1000; ctx.save();
    for (const e of aliveEnemies()) { const x = e.x;
      { const pa = .55 + Math.sin(now * 4) * .25; ctx.save(); ctx.translate(x, e.y - 6); ctx.scale(1, .32); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(255,214,120,${pa})`; ctx.beginPath(); ctx.arc(0, 0, 86, 0, 7); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,240,200,${pa * .8})`; ctx.rotate(now * .8); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.arc(0, 0, 100, 0, .5); ctx.stroke(); } ctx.restore(); }
      ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, e.y - 10, 4, x, e.y - 10, 70); g.addColorStop(0, 'rgba(255,220,120,.35)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, e.y - 6, 80, 26, 0, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    if (window.R79 && R79.target_banner) { ctx.drawImage(R79.target_banner, 376, 2, 570, 52); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 20px "STSongti-SC","Songti SC","Noto Serif SC",serif`; ctx.fillStyle = '#0E2424'; ctx.fillText('选择目标 · 点敌人出手 · 点空白处返回', 661, 29); }
    else { ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `30px ${BRUSH}`; textOutline('选择目标', 245, 96, '#ffe9b0', '#1a0800', 5);
    ctx.font = `600 16px ${FONT}`; textOutline('点敌人出手 · 点空白处返回', 245, 130, '#f0e2c0', 'rgba(0,0,0,.8)', 3); }
    ctx.restore();
  })(drawBattle);
})();
