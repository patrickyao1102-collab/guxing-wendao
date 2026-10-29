// ================= 大招特效预热：只在载入画面里做，绝不在战斗/走路中途卡顿 =================
// 太阳、点星、群星、杀星、光明、黑暗、日月、时空 这些特效第一次使用前要解压大图、逐像素预处理（会冻住画面几秒）。
// 以前是开局 4 秒后在后台偷偷做，冻结会随机落在走路或战斗中途。现在统一改为：
//  · 进地图、地图素材载完后：如果队伍里有人的大招特效还没预热，就在载入画面里接着预热（显示进度），做完才放行；
//  · 进战斗时：这场战斗会用到的特效没预热好，就先在战斗开场的载入画面里预热，做完才开始第一回合；
//  · 每个特效整局游戏只预热一次。
(function () {
  const F = window.FXW = { st: {}, label: '', cur: 0, total: 0, active: false };
  const rt = name => () => { const m = window[name]; if (!m || !m.preload) return Promise.resolve(); if (m._ready) return Promise.resolve(); m._loading = 1; return m.preload().then(() => { m._ready = 1; }); };
  const sunOn = () => { const f = S.flags || {}; return !!(f.sun_seen || f.sun_unlocked) || !!(typeof battle !== 'undefined' && battle && battle.cfg && (battle.cfg.sunKill || battle.cfg.allowUlt)); };
  const MODS = {
    sun: { who: ['hero'], name: '破军剑阵·太阳', when: sunOn, have: () => !!window.SUN_RT, run: rt('SUN_RT'), ready: () => !!(window.SUN_RT && SUN_RT._ready) },
    dx: { who: ['hero', 'yunting', 'linxue'], name: '天剑一式·点星', have: () => !!window.DX_RT, run: rt('DX_RT'), ready: () => !!(window.DX_RT && DX_RT._ready) },
    qx: { who: ['yunting', 'linxue'], name: '天剑二式·群星', have: () => !!window.QX_RT, run: rt('QX_RT'), ready: () => !!(window.QX_RT && QX_RT._ready) },
    sx: { who: ['yunting', 'linxue'], name: '天剑三式·杀星', when: () => S.hero.lv >= 14, have: () => !!window.SX_RT, run: rt('SX_RT'), ready: () => !!(window.SX_RT && SX_RT._ready) },
    gm: { who: ['luochen'], name: '光明本源', have: () => !!window.GM_CODEX, run: () => GM_CODEX.preload(), ready: () => !!(window.GM_CODEX && GM_CODEX.ready) },
    ha: { who: ['luochen'], name: '黑暗本源', have: () => !!window.HA_CODEX, run: () => Promise.all([HA_CODEX.preload(), window.HA_RT && HA_RT.preload ? HA_RT.preload() : 0]), ready: () => !!(window.HA_CODEX && HA_CODEX.ready) },
    ry: { who: ['luochen'], name: '日月轮转', have: () => typeof window.LC_DRAGON_LOAD === 'function', run: () => Promise.resolve(LC_DRAGON_LOAD()) },
    sk: { who: ['luochen'], name: '时空错乱', have: () => !!window.CODEX_LUOCHEN_SHIKONG, run: () => CODEX_LUOCHEN_SHIKONG.preload(), ready: () => !!(window.CODEX_LUOCHEN_SHIKONG && CODEX_LUOCHEN_SHIKONG.ready) },
  };
  const isDone = k => F.st[k] === 'done' || F.st[k] === 'fail' || (MODS[k].ready && MODS[k].ready());
  F.needed = members => Object.keys(MODS).filter(k => { const m = MODS[k]; return m.who.some(w => members.includes(w)) && m.have() && (!m.when || m.when()) && !isDone(k); });
  const timeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(r, ms))]);
  const nextFrame = () => new Promise(r => setTimeout(r, 40));   // 让进度条刷新一下
  let chain = Promise.resolve();
  F.warm = keys => { if (!keys.length) return chain; F.active = true; F.total = keys.length; F.cur = 0;
    chain = chain.then(async () => { for (const k of keys) { if (isDone(k)) { F.cur++; continue; } F.label = MODS[k].name; F.st[k] = 'run'; await nextFrame();
        try { await timeout(MODS[k].run(), 40000); F.st[k] = 'done'; } catch (e) { console.error('FX prewarm ' + k, e); F.st[k] = 'fail'; }
        F.cur++; await nextFrame(); }
      F.active = false; });
    return chain; };
  const partyNow = () => ['hero', ...(S.party || [])];
  const battleParty = b => ['hero', ...((b && b.heroes) || []).filter(u => u.ally).map(u => u.ally)];

  // 载入期间：不让走路、不让点对话
  if (typeof consumeTap === 'function') consumeTap = (orig => function () { if (F.active) { if (typeof input !== 'undefined') input.tapped = null; return null; } return orig.apply(this, arguments); })(consumeTap);
  updateMap = (orig => function (dt) { if (F.active) { if (world.player) world.player.moving = false; return; } return orig.apply(this, arguments); })(updateMap);
  updateBattle = (orig => function (dt) { if (F.active || (battle && battle.__warm)) return; return orig.apply(this, arguments); })(updateBattle);

  // 进战斗：先预热这场要用的特效
  startBattle = (orig => function (cfg) {
    const pr = orig.apply(this, arguments); const b = battle;
    try { const ks = F.needed(battleParty(b)); if (ks.length && b) { b.__warm = true; F.warm(ks).then(() => { b.__warm = false; }); } } catch (e) { console.error(e); }
    return pr;
  })(startBattle);

  // 进地图：地图素材到齐后，顺手把队伍的大招特效预热完
  setInterval(() => { try {
    if (F.active || typeof battle !== 'undefined' && battle) return;
    if (!world || !world.map || S.scene !== drawMap || (window.MAP_LOADING && MAP_LOADING())) return;
    const ks = F.needed(partyNow()); if (ks.length) F.warm(ks);
  } catch (e) {} }, 500);

  // 载入画面
  let shown = 0;
  S.overlay.push({ draw() {
    const on = F.active; shown = on ? 1 : Math.max(0, shown - .1); if (!shown) return;
    if (on && typeof input !== 'undefined') input.tapped = null;
    ctx.save(); ctx.globalAlpha = shown; ctx.fillStyle = 'rgba(6,8,14,.92)'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * .6); g.addColorStop(0, 'rgba(90,80,150,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `40px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.fillStyle = '#ffe2a0'; ctx.fillText('凝 聚 剑 意', W / 2, H / 2 - 50);
    const bw = 420, bh = 8, bx = W / 2 - bw / 2, by = H / 2 + 10, k = F.total ? (F.cur + .5) / F.total : 1;
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(bx, by, bw, bh);
    const lg = ctx.createLinearGradient(bx, 0, bx + bw, 0); lg.addColorStop(0, '#8a7ad8'); lg.addColorStop(1, '#ffe8a8'); ctx.fillStyle = lg; ctx.fillRect(bx, by, bw * Math.min(1, k), bh);
    ctx.font = `600 18px ${typeof FONT !== 'undefined' ? FONT : 'sans-serif'}`; ctx.fillStyle = 'rgba(232,220,192,.85)';
    ctx.fillText('预载技能特效 · ' + (F.label || '') + '（' + Math.min(F.total, F.cur + 1) + ' / ' + F.total + '）', W / 2, by + 36);
    ctx.font = `14px ${typeof FONT !== 'undefined' ? FONT : 'sans-serif'}`; ctx.fillStyle = 'rgba(232,220,192,.55)'; ctx.fillText('每个特效只需预载一次，之后施展不再卡顿', W / 2, by + 64);
    ctx.restore();
  } });
})();
