// ================= R382 · 破绽与再动（只进测试版）=================
// 作者 11-27 晨：「最重要的是没有让玩家有可玩的感觉……为什么不想玩两下就走？」
// 四小时的流程里，大半时间在打普通小怪。现在给每一仗一个小小的决定：
//   每种妖兽、每路对手都怕一样东西——叶孤星的「剑」、云霆的「雷」、林雪的「冰」（往后还有神乐的「音」、洛尘的「光」）。
//   用它怕的那个人去打：伤害高三成，跳「破绽」，出手的人行动条立刻回到八成——很快能「再动」一次。
//   （再动得来的那一回合不再连环触发；首领只吃伤害加成，要等它力竭喘息时才给再动。）
// 破绽要自己试出来：第一次打中才记下，或者同一种妖兽打过三只就看破；知道了就在它名字旁边挂一枚小徽记，不知道的挂一枚暗的问号。
// 小怪的血和攻击一点没加——打对了只会更快、更省事（Gemini 的提醒：破绽应该是「省事和贪掉落」，不是被系统按着头做题）。
// 原来就有的「被冻住 / 定住的敌人受伤 +50%，飘破绽」不变，两样可以叠。
// 同时在这里记一份「战绩」（斩了多少、哪种妖兽几只、打出几次破绽），给后面的星旋任务用。
(function () {
  if (typeof applyDamage !== 'function' || typeof drawUnit !== 'function' || typeof endBattle !== 'function' || typeof updateBattle !== 'function') return;
  const EL = { jian: { n: '剑', c: '#ffe9a8', who: '叶孤星' }, lei: { n: '雷', c: '#d6b8ff', who: '云霆' }, bing: { n: '冰', c: '#bfeaff', who: '林雪' }, yin: { n: '音', c: '#bfffe0', who: '神乐' }, guang: { n: '光', c: '#fff3b0', who: '洛尘' } };
  const ALLY_EL = { yunting: 'lei', linxue: 'bing', shenle: 'yin', luochen: 'guang' };
  const elOf = u => !u || u.side !== 'hero' ? null : u.ally ? (ALLY_EL[u.ally] || null) : 'jian';
  // 谁怕什么（按战斗形象的 key）。想法：最常见的妖狼怕剑（开局一个人也常能打出来）；雷击木、铁甲引雷、阴邪怕雷；跑得快的、带火的、虫类怕冰。
  const WEAK = {
    m_wolf: ['jian'], m_tree: ['lei'], m_monkey: ['bing'], e_boar: ['lei'], e_wolf2: ['bing'], e_rhino: ['lei'], e_leopard: ['bing'], e_ywolf: ['lei', 'guang'], e_spider: ['bing'], e_treant: ['jian'],
    e_grunt: ['jian'], e_archer: ['bing'], e_xiexiu: ['lei', 'guang'], e_corpse: ['bing', 'guang'], e_xbat: ['lei', 'yin'], e_xwraith: ['lei', 'guang'], e_xspider: ['bing'], e_xguard1: ['lei'], e_xguard2: ['jian'], e_xguard3: ['bing'], e_fox3: ['jian'],
    e_spiderq: ['jian'], e_wolfking: ['bing'], e_ghost: ['lei', 'guang'],
    // 首领（只加伤害）
    e_tiger: ['lei'], e_boss: ['lei'], e_zhouhu: ['bing'], e_fanglie: ['jian'], e_mozu: ['jian', 'guang'], e_xxboss: ['lei'], e_elder: ['lei', 'guang'], e_elder2: ['lei', 'guang'],
    yw_boar: ['lei'], yw_wolf: ['bing'], yw_leopard: ['bing'], yw_spider: ['jian'], yw_treant: ['lei'], yw_rhino: ['lei'],
  };
  const baseKey = u => { let k = String((u && u.key) || ''); k = k.replace(/_(b|c|d)$/, ''); return k; };
  const weakOf = u => (u && u._weak) || WEAK[baseKey(u)] || null;
  const isBoss = u => !!(u && (u.boss || u._yw || u._plate));
  const F = () => (S.flags = S.flags || {});
  const ST = () => { const f = F(); return f.xs || (f.xs = { wins: 0, kills: {}, wk: 0, zd: 0, zdMax: 0, known: {}, hi: 0 }); };
  const known = k => !!ST().known[k];
  const MULT = 1.3, GAUGE = 80, SEE = 3;

  // ---------- 徽记 / 字样（Codex R383 到了就用图，没到先用字）----------
  const ART = {}; function art(n) { let a = ART[n]; if (!a) { a = ART[n] = { im: new Image(), ok: false }; a.im.onload = () => { a.ok = true; }; a.im.onerror = () => { a.bad = true; }; a.im.src = 'r383/' + n + '.webp?v=1'; } return a.ok ? a.im : null; }
  setTimeout(() => { for (const n of ['wk_jian', 'wk_lei', 'wk_bing', 'wk_yin', 'wk_guang', 'wk_unknown', 'txt_pozhan', 'txt_zaidong']) art(n); }, 9000);
  function emblem(el, x, y, r, dim) { const im = art(el ? 'wk_' + el : 'wk_unknown'); ctx.save(); ctx.globalAlpha *= dim ? .55 : 1;
    if (im) ctx.drawImage(im, x - r, y - r, r * 2, r * 2);
    else { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = 'rgba(16,14,12,.86)'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = el ? EL[el].c : 'rgba(170,170,170,.7)'; ctx.stroke(); ctx.font = `${Math.round(r * 1.25)}px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = el ? EL[el].c : 'rgba(190,190,190,.85)'; ctx.fillText(el ? EL[el].n : '?', x, y + 1); }
    ctx.restore(); }
  function pop(name, text, x, y, col, w) { if (typeof addFx !== 'function') return; addFx({ x, y, life: 1.15, layer: 2, draw(f) { const k = f.t / f.life, s = k < .12 ? 1.9 - .9 * (k / .12) : 1, a = k > .72 ? (1 - k) / .28 : 1, im = art(name); ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.translate(f.x, f.y - k * 36); ctx.scale(s, s);
        if (im) { const h = w * im.height / im.width; ctx.drawImage(im, -w / 2, -h / 2, w, h); } else { ctx.font = `${Math.round(w * .3)}px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(text, 0, 0, col, '#1a0800', 7); } ctx.restore(); } }); }

  // ---------- 打中破绽 ----------
  applyDamage = (orig => function (t, d, crit, opts) {
    try { const b = battle, att = b && b.active; if (b && t && t.alive && t.side === 'enemy' && att && att.side === 'hero' && b.state !== 'end' && !(b.cfg && (b.cfg.sunKill || b.cfg.noWeak))) {   /* 开场借力那一仗不掺这个 */ const el = elOf(att), wk = weakOf(t);
        if (el && wk && wk.includes(el)) { arguments[1] = d = Math.round(d * MULT); hit(b, att, t, el); } } } catch (e) { console.warn('R382', e); }
    return orig.apply(this, arguments); })(applyDamage);
  function hit(b, att, t, el) { const st = ST(), an = b._actNo || 0, k = baseKey(t);
    if (!st.known[k]) { st.known[k] = 1; t._wkNew = performance.now(); }
    if (t._wkAct !== an) { t._wkAct = an; pop('txt_pozhan', '破绽', t.x + (t.ox || 0) + 10, t.y - Math.min(t.h || 200, 340) - 64, '#ffe08a', 190); try { sfx('crit'); } catch (e) {} }
    if (b._wkActCount !== an) { b._wkActCount = an; st.wk = (st.wk || 0) + 1; b._wkN = (b._wkN || 0) + 1; }
    // 再动：这一回合不是「再动」得来的、这次出手还没给过；首领要在力竭时才给
    if (att._wkAct === an || att._wkBonus) return; if (isBoss(t) && !(t._break > 0)) return;
    att._wkAct = an; att._wkPending = true; att.gauge = Math.max(att.gauge || 0, GAUGE);
    st.zd = (st.zd || 0) + 1; b._zdN = (b._zdN || 0) + 1; st.zdMax = Math.max(st.zdMax || 0, b._zdN);
    if (!F().r382_tip) { F().r382_tip = 1; b._wkTip = performance.now(); } }

  // 轮到谁：是不是「再动」得来的回合
  updateBattle = (orig => function () { const r = orig.apply(this, arguments);
    try { const b = battle; if (b) { if (b.state === 'menu' && b.active && b._wkSeen !== b.active) { const u = b.active; b._wkSeen = u; u._wkBonus = !!u._wkPending; u._wkPending = false; if (u._wkBonus) { pop('txt_zaidong', '再动', u.x + (u.ox || 0) - 10, u.y - (u.h || 250) - 58, '#bfeaff', 150); try { sfx('chime'); } catch (e) {} } } else if (b.state === 'run') b._wkSeen = null; } } catch (e) {}
    return r; })(updateBattle);

  // ---------- 名字旁边的徽记 ----------
  drawUnit = (orig => function (u) { const r = orig.apply(this, arguments);
    try { if (u && u.side === 'enemy' && u.alive && battle && !battle._cineHide && !(battle.cfg && (battle.cfg.sunKill || battle.cfg.noWeak))) { const wk = weakOf(u); if (wk) { const kn = known(baseKey(u)), y0 = u.y + (u.oy || 0), x0 = u.x + (u.ox || 0);
          let ex, ey; if (u._noBar || u._plate || u._scale) { ex = x0 - Math.min(90, (u.h || 300) * .26); ey = y0 - Math.min(u.h || 300, 400) - 8; } else { ex = x0 - 55 - 22; ey = y0 - u.h - 26 + 3; }
          const flash = u._wkNew ? Math.max(0, 1 - (performance.now() - u._wkNew) / 900) : 0, R = 17 + flash * 9;
          if (!kn) emblem(null, ex, ey, 13, true); else { const mine = (battle.heroes || [battle.P]).filter(h => h.alive).map(elOf); wk.filter(e => EL[e]).slice(0, 2).forEach((e, i) => emblem(e, ex - i * 30, ey, R, !mine.includes(e))); } } } } catch (e) {}
    return r; })(drawUnit);

  // 头一回打出破绽：战斗画面底下说明一句（几秒自己收）
  if (typeof drawBattle === 'function') drawBattle = (orig => function () { const r = orig.apply(this, arguments);
    try { const b = battle; if (b && b._wkTip) { const dt = (performance.now() - b._wkTip) / 1000; if (dt < 6.5) { const a = Math.min(1, dt * 3) * Math.min(1, (6.5 - dt) * 2), t = '破绽——用它怕的人去打：伤害更高，出手的人还能马上再动一次'; ctx.save(); ctx.globalAlpha = a; ctx.font = `600 22px ${FONT}`; const w = ctx.measureText(t).width + 56, x = (W - w) / 2, y = 598;
          const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(12,8,4,0)'); g.addColorStop(.12, 'rgba(12,8,4,.78)'); g.addColorStop(.88, 'rgba(12,8,4,.78)'); g.addColorStop(1, 'rgba(12,8,4,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, 42); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9b8'; ctx.fillText(t, W / 2, y + 22); ctx.restore(); } else b._wkTip = 0; } } catch (e) {}
    return r; })(drawBattle);

  // ---------- 战绩 ----------
  endBattle = (orig => async function (win) { const b = battle;
    try { if (b && win && !b._r382done) { b._r382done = 1; const st = ST(); st.wins = (st.wins || 0) + 1; const lv = (S.hero && S.hero.lv) || 1;
        for (const e of b.enemies || []) { if (e.alive) continue; const k = baseKey(e); st.kills[k] = (st.kills[k] || 0) + 1; if (st.kills[k] >= SEE && WEAK[k] && !st.known[k]) st.known[k] = 1; if ((e.lv || 0) >= lv + 2) st.hi = (st.hi || 0) + 1; }
        if (b._yw || (b.cfg && b.cfg.boss)) st.boss = (st.boss || 0) + 1; } } catch (e) { console.warn('R382 end', e); }
    return orig.apply(this, arguments); })(endBattle);

  window.R382 = { EL, WEAK, weakOf, elOf, known, stat: ST, baseKey, reveal(k) { ST().known[k] = 1; } };
})();
