// ================= 大招特效预热：只在载入画面里做，绝不在战斗/走路中途卡顿 =================
// 太阳、点星、群星、杀星、光明、黑暗、日月、时空 这些特效第一次使用前要解压大图、逐像素预处理（会冻住画面几秒）。
// 以前是开局 4 秒后在后台偷偷做，冻结会随机落在走路或战斗中途。现在统一改为：
//  · 进地图、地图素材载完后：如果队伍里有人的大招特效还没预热，就在载入画面里接着预热（显示进度），做完才放行；
//  · 进战斗时：这场战斗会用到的特效没预热好，就先在战斗开场的载入画面里预热，做完才开始第一回合；
//  · 每个特效整局游戏只预热一次。
(function () {
  const F = window.FXW = { st: {}, label: '', cur: 0, total: 0, active: false };
  const rt = name => () => { const m = window[name]; if (!m || !m.preload) return Promise.resolve(); if (m._ready) return Promise.resolve(); m._loading = 1; return m.preload().then(() => { m._ready = 1; }); };
  // 后山借力那一战（xlLend）放的是星落·无上境，不再预载太阳（以前会先卡一下「凝聚剑意 · 破军剑阵·太阳」）
  const sunOn = () => { const f = S.flags || {}; return !!(f.sun_seen || f.sun_unlocked) || !!(typeof battle !== 'undefined' && battle && battle.cfg && ((battle.cfg.sunKill && !battle.cfg.xlLend) || battle.cfg.allowUlt)); };
  const MODS = {
    sun: { who: ['hero'], name: '破军剑阵·太阳', when: sunOn, have: () => !!window.SUN_RT, run: rt('SUN_RT'), ready: () => !!(window.SUN_RT && SUN_RT._ready) },
    dx: { who: ['hero', 'yunting', 'linxue'], name: '天剑一式·点星', have: () => !!window.DX_RT, run: rt('DX_RT'), ready: () => !!(window.DX_RT && DX_RT._ready) },
    qx: { who: ['yunting', 'linxue'], name: '天剑二式·群星', have: () => !!window.QX_RT, run: rt('QX_RT'), ready: () => !!(window.QX_RT && QX_RT._ready) },
    sx: { who: ['yunting', 'linxue'], name: '天剑三式·杀星', when: () => S.hero.lv >= 14, have: () => !!window.SX_RT, run: rt('SX_RT'), ready: () => !!(window.SX_RT && SX_RT._ready) },
    gm: { who: ['luochen'], name: '光明本源', have: () => !!window.GM_CODEX, run: () => GM_CODEX.preload(), ready: () => !!(window.GM_CODEX && GM_CODEX.ready) },
    ha: { who: ['luochen'], name: '黑暗本源', have: () => !!window.HA_CODEX, run: () => Promise.all([HA_CODEX.preload(), window.HA_RT && HA_RT.preload ? HA_RT.preload() : 0]), ready: () => !!(window.HA_CODEX && HA_CODEX.ready) },
    ry: { who: ['luochen'], name: '日月轮转', have: () => typeof window.LC_DRAGON_LOAD === 'function', run: () => Promise.resolve(LC_DRAGON_LOAD()) },
    xz: { who: ['shenle'], name: '九音录·仙音镇魂', have: () => !!window.XYZH_RT, run: () => window.XYZH_RT.ready ? Promise.resolve() : XYZH_RT.preload(), ready: () => !!(window.XYZH_RT && XYZH_RT.ready) },
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
    // 作者 11-08：「技能也是，必须完全加载完毕、顺滑无比才可以进入战斗」——特效预热 + 这场战斗画面要用的图（敌人动态图集、背景、技能图标……）全部下完才开打
    try { if (b) { const ks = F.needed(battleParty(b)); b.__warm = true; F.active = true; F.label = '战斗素材'; F.total = Math.max(1, ks.length); F.cur = 0;
      // 战斗画面每帧画到的图里，还没下完的都记下来；连续几次检查全都下完了才算好（最多等 25 秒）
      const imgsIdle = async () => { const C2 = CanvasRenderingContext2D.prototype, DI = C2.drawImage, want = new Set();
        const own = Object.prototype.hasOwnProperty.call(ctx, 'drawImage'), DO = own ? ctx.drawImage : null;
        const spy = base => function (im) { try { if (im && im instanceof HTMLImageElement && !(im.complete && im.naturalWidth)) want.add(im); } catch (e) {} return base.apply(this, arguments); };
        C2.drawImage = spy(DI); if (own) ctx.drawImage = spy(DO);
        const t0 = performance.now(); let calm = 0;
        try { while (performance.now() - t0 < 25000) { await new Promise(r => setTimeout(r, 150));
            for (const im of want) if (im.complete) want.delete(im);
            let vsOk = !window.VS_BATTLE_READY || VS_BATTLE_READY(b);
            // 骨骼动画妖兽：分件图都下完（rig/ 在图片队列最后，先插队）
            try { for (const u of b.enemies || []) { const M = window.RIG_MAP && RIG_MAP[u.key], R = M && RIG.RIGS[M.rig]; if (R && !R.ready) { vsOk = false; if (window.IMG_GUARD && IMG_GUARD.bumpMatch) IMG_GUARD.bumpMatch(['rig/']); } } } catch (e) {}
            calm = want.size || !vsOk ? 0 : calm + 1; if (calm >= 6) break; } } finally { C2.drawImage = DI; if (own) ctx.drawImage = DO; } };
      Promise.all([ks.length ? F.warm(ks) : Promise.resolve(), imgsIdle()]).then(() => { F.active = false; b.__warm = false; }, () => { F.active = false; b.__warm = false; }); } } catch (e) { console.error(e); if (b) { b.__warm = false; F.active = false; } }
    return pr;
  })(startBattle);

  // 进地图：地图素材到齐后，顺手把队伍的大招特效预热完
  setInterval(() => { try {
    if (F.active || typeof battle !== 'undefined' && battle) return;
    if (!world || !world.map || S.scene !== drawMap || (window.MAP_LOADING && MAP_LOADING())) return;
    const ks = F.needed(partyNow()); if (ks.length) F.warm(ks);
  } catch (e) {} }, 500);

  // 载入画面：作者 11-08「不准再出现以前的老页面」→ 和换图一样用 R157 插画载入画面；画在整帧最上面（对话框、战斗界面都盖住）
  window.FXW_BLOCKING = () => F.active || !!(typeof battle !== 'undefined' && battle && battle.__warm);
  if (typeof frameInner === 'function') frameInner = (o => function (now) { const r = o.apply(this, arguments);
    try { if (FXW_BLOCKING() && window.LOADING_LAYER) { if (typeof input !== 'undefined') input.tapped = null;
      ctx.save(); ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.globalAlpha = 1;
      const k = F.total ? Math.min(.95, (F.cur + .5) / F.total) : .5; LOADING_LAYER.draw(k); ctx.restore(); } } catch (e) {}
    return r; })(frameInner);
})();
