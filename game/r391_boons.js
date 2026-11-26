// ================= R391 · 星辰宝库里那几样东西的效果（只进测试版）=================
// 玉佩面板（r386）里能换的货，真正起作用的地方在这里。每样只做一件事，战斗里看得见：
//   引星符　　每打出一次相克攒一格星辉（叶孤星头顶四颗小星），满四格自己引下一道星光砸全体敌人。
//   纳月诀　　打出相克的那一手，出手的人回 6% 气血、8 点灵力。
//   回锋阵盘　我方挨打，阵盘回敬一剑（挨打那人攻击的一半）。
//   护主星符　每场一次：我方有人被打倒，星旋把他拉回来，留三成气血。
//   乾坤囊　　法宝一场能祭两回。
//   剑气开路　比主角低三级以上的兽火，撞上直接斩散，不进战斗（修为、灵石照拿一半）。
// 全部用现成的特效（星光、斩击、光爆），没有新做特效。开场借力那一仗不掺这些。
(function () {
  if (!window.R386 || !window.WX5 || typeof applyDamage !== 'function' || typeof updateBattle !== 'function') return;
  const has = id => { try { return !!R386.has(id); } catch (e) { return false; } };
  const on = b => !!b && b.state !== 'end' && !(b.cfg && (b.cfg.sunKill || b.cfg.noWx));
  const alive = b => (b.enemies || []).filter(e => e.alive);
  const FX = (n, o) => { try { if (typeof FXM !== 'undefined' && FXM[n]) fx(n, o); } catch (e) {} };
  const FT = (x, y, t, c, s, big) => { try { big ? floatText(x, y, t, c, s, 1.4, BRUSH) : floatText(x, y, t, c, s); } catch (e) {} };

  // ---------- 引星符：星坠 ----------
  async function starfall(b) { if (battle !== b || !on(b) || b._yxBusy) return; b._yxBusy = 1;
    try { const P = b.P, es = alive(b); if (!es.length || !P) return; FT(W / 2, 262, '引　星', '#cfe6ff', 62, true); try { playSnd('sfx_charge', .6); } catch (e) {}
      await new Promise(r => setTimeout(r, 420)); if (battle !== b || b.state === 'end') return;
      for (const e of alive(b)) { FX('fx4_star_blue', { x: e.x, y: e.y - (e.h || 200) * .5, scale: 1.1, alpha: 1.3 }); const { d } = dmgCalc(P, e, 1.1, 0); applyDamage(e, d, false, { noWx: true }); }
      try { sfx('boom'); } catch (e) {} S.shake = 12; S.flash = .25; S.flashColor = '#cfe6ff'; } catch (e) { console.warn('R391 yx', e); } finally { b._yxBusy = 0; } }

  applyDamage = (orig => function (t, d, crit, opts) { const b = battle, an = b && (b._actNo || 0), ke0 = b ? (b._keN || 0) : 0, att = b && b.active, wasAlive = t && t.alive;
    const r = orig.apply(this, arguments);
    try { if (!on(b) || !t) return r;
      // 我方打出相克
      if (t.side === 'enemy' && att && att.side === 'hero' && (b._keN || 0) > ke0) {
        if (has('ny') && b._nyAct !== an && att.alive) { b._nyAct = an; const h = Math.max(1, Math.round(att.maxhp * .06)); att.hp = Math.min(att.maxhp, att.hp + h); att.mp = Math.min(att.maxmp, (att.mp || 0) + 8); FT(att.x, att.y - att.h * .78, '纳月 +' + h, '#9fe6b0', 32); }
        if (has('yx') && (b._keN % 4) === 0) setTimeout(() => starfall(b), 520); }
      // 我方挨打
      if (t.side === 'hero' && wasAlive && att && att.side === 'enemy' && !(opts && opts.noWx)) {
        if (!t.alive && has('hz') && !b._hzUsed) { b._hzUsed = 1; t.alive = true; t.hp = Math.max(1, Math.round(t.maxhp * .3)); FT(t.x, t.y - t.h - 36, '星旋护主', '#ffe9a0', 44, true); FX('fx3_burst_gold', { x: t.x, y: t.y - t.h * .5, scale: 1.1 }); try { playSnd('sfx_heal'); } catch (e) {} }
        if (t.alive && att.alive && has('zp') && b._zpAct !== an + ':' + (att._zpN = (att._zpN || 0) + 1)) { b._zpAct = an + ':' + att._zpN; const e = att, dd = Math.max(1, Math.round((t.atk || 10) * .5));
          setTimeout(() => { try { if (battle !== b || b.state === 'end' || !e.alive) return; FX('fx3_slash_gold', { x: e.x, y: e.y - (e.h || 200) * .5, scale: .8 }); FT(e.x, e.y - Math.min(e.h || 200, 340) - 24, '回锋', '#ffe9a0', 34); applyDamage(e, dd, false, { noWx: true }); } catch (e2) {} }, 380); } } } catch (e) { console.warn('R391', e); }
    return r; })(applyDamage);

  // 引星符的星辉：叶孤星血条上方四颗小星
  if (typeof drawUnit === 'function') drawUnit = (orig => function (u) { const r = orig.apply(this, arguments);
    try { const b = battle; if (u && u.alive && b && u === b.P && on(b) && !b._cineHide && has('yx')) { const n = (b._keN || 0) % 4, x0 = u.x + (u.ox || 0), y0 = u.y + (u.oy || 0) - u.h - 26 - 15; ctx.save();
        for (let i = 0; i < 4; i++) { const x = x0 - 27 + i * 18, lit = i < n; ctx.beginPath(); ctx.moveTo(x, y0 - 6); ctx.lineTo(x + 5, y0); ctx.lineTo(x, y0 + 6); ctx.lineTo(x - 5, y0); ctx.closePath(); ctx.fillStyle = lit ? '#cfe6ff' : 'rgba(10,16,24,.7)'; if (lit) { ctx.shadowColor = '#8fc8ff'; ctx.shadowBlur = 8; } ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 1.2; ctx.strokeStyle = lit ? '#ffffff' : 'rgba(170,190,210,.6)'; ctx.stroke(); } ctx.restore(); } } catch (e) {}
    return r; })(drawUnit);

  // 乾坤囊：法宝祭过一回之后，再给一回
  updateBattle = (orig => function () { const r = orig.apply(this, arguments);
    try { const b = battle; if (b && b._fbUsed && !b._qkUsed && b.state === 'run' && has('qk')) { b._fbUsed = 0; b._qkUsed = 1; } } catch (e) {}
    return r; })(updateBattle);

  // ---------- 剑气开路 ----------
  if (typeof mobFight === 'function') mobFight = (orig => async function (a) {
    try { const lv = (S.hero && S.hero.lv) || 1, ml = a && a.fire && a.fire.lv; if (has('jq') && a && ml && ml <= lv - 3 && !(a.fire.tier === 'purple' || a.elite)) {
        const e = makeEnemy(a.mob, 0), exp = Math.max(1, Math.round((e.maxhp || 120) / 6)), gold = Math.max(1, Math.round((e.maxhp || 120) / 12));
        a.hidden = true; world.mobs = (world.mobs || []).filter(x => x !== a); world.actors = (world.actors || []).filter(x => x !== a);
        try { sfx('crit'); } catch (e2) {} S.flash = .3; S.flashColor = '#ffffff'; try { particleBurst(a.x, a.y - 30, 26, ['#fff', '#cfe6ff', '#ffe9a0'], 320, .8, 6); } catch (e2) {}
        S.hero.gold += gold; gainExp(exp); try { toast('剑气开路 · 修为 +' + exp + ' 灵石 +' + gold, 1800); } catch (e2) {}
        try { const st = WX5.stat(); st.wins = (st.wins || 0) + 1; } catch (e2) {}
        try { if (window.SQ_ON_WIN) await SQ_ON_WIN({ map: world.mapName, fire: a.fire, enemies: [] }); } catch (e2) {}
        return; } } catch (e) { console.warn('R391 jq', e); }
    return orig.apply(this, arguments); })(mobFight);
  window.R391 = 1;
})();
