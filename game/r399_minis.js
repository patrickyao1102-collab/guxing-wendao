// ================= R399 · 下山路上的两只头目（只进测试版）=================
// 作者 11-27 晨：「妖王讨伐是非常大的进步，诸如此类还有呢」「最重要的是可玩的感觉」。
// 落星坡的赤焰狼王之后，玩家带着云霆下山，头两张野外图各再放一只头目，一路上都有东西可打：
//   · 松风林道「盘根 · 老松魈」  木 · 十级：下了石阶，岔口那片松林边上立着一棵会动的老松。星痕剑生来属金，金克木。
//   · 山外树林「碎岩 · 铁鳞穿山甲」金 · 十一级：救下林溪之后，北边空地的草甸上多了一团铁疙瘩。云霆的雷火克金。
// 本体是 Codex R399 画的（每只十四帧：平时 / 蓄力 / 出手 / 力竭），打法走妖王那一套，各带一个看得懂的小花样：
//   · 老松魈：每回把根扎进土里（蓄力）会回一口血 → 别拖，趁它根松了猛打。
//   · 穿山甲：平时一身铁鳞（防御高），滚完翻了肚皮（力竭）防御归零 → 那两手是下重手的时候。
// 都不上讨伐榜；打倒了各记一桩玉佩事迹，掉本行的五行之精（够去剑炉开一炉）。
(function () {
  const META = window.R399_META;
  if (!META || !window.R370_YW || !window.R370_AI || !window.R370_H || typeof VSPRITE_ADD !== 'function' || typeof IMG === 'undefined' || typeof TMAPS === 'undefined') return;
  const H = R370_H, AI = R370_AI, K = .8, F = () => (S.flags = S.flags || {});
  const later = fn => { try { (window.SAY_LATER || (f => f()))(fn); } catch (e) {} };
  const jinNow = () => { try { return !window.WX5 || WX5.heroWx() === 'jin'; } catch (e) { return true; } };
  const hasYT = () => { try { return (S.party || []).includes('yunting'); } catch (e) { return false; } };
  const calm = () => { try { return S.scene === drawMap && S.hud && !world.locked && !dialog && !choice && !sysPanel && !battle; } catch (e) { return false; } };

  // ---------- 两只头目 ----------
  const LIST = [
    { id: 'songxiao', mini: true, hidden: true, ep: '盘根', name: '老松魈', type: 'tree', map: 'tj_xiashan', pos: [2292, 812], lv: 10, hp: 1600, atk: 72, def: 12, spd: 9, exp: 420, gold: 200, fabao: null, bg: 'bg_mountain', scale: 1, fxColor: '#8fe07a',
      where: '天剑山下 · 松风林道 · 石阶下的岔口', tip: '它把根扎进土里，就是要横着抽过来了——那一下防御。抽完它的根会松脱，那是出手的时候。', extra: ['m_wx_mu', 'm_wx_mu', 'm_wx_mu', 'm_wx_mu', 'p_small'],
      wx: 'mu', col: [130, 230, 140], halo: 'treant', mapBody: 200, bpos: [300, 640],
      cond: () => { const f = F(); return !!(f.ch2_depart || f.ch2_forest || f.ch2_roam || f.ch3) && S.hero.lv >= 9; },
      seen: () => '小子，看岔口那棵松——树根自己在挪。几百年的老松成了精，叫松魈。木头最怕金铁，' + (jinNow() ? '你手里那把剑正合适。' : '把星纹拨回金纹再砍。'),
      after: async () => { await say('星旋', '几百年的老松，头一回让人连根掀了。它根里攒的那点木精，够去剑炉开一炉。'); },
      task: { id: 'sx1', name: '盘根', desc: '打倒松风林道的头目「盘根 · 老松魈」', pts: 60, quip: '连根掀了一棵几百年的老松。这桩记上。' } },
    { id: 'chuanshanjia', mini: true, hidden: true, ep: '碎岩', name: '铁鳞穿山甲', type: 'rhino', map: 'lin_forest', pos: [2080, 556], lv: 11, hp: 1250, atk: 70, def: 30, spd: 10, exp: 480, gold: 240, fabao: null, bg: 'bg_mountain', scale: 1, fxColor: '#d6dee8',
      where: '云霄山脉 · 山外树林 · 北边空地', tip: '它蜷成铁球就是要滚过来了——那一下防御。滚完它会翻着肚皮喘，那两手它一点都不硬。', extra: ['m_wx_jin', 'm_wx_jin', 'm_wx_jin', 'm_wx_jin', 'p_mp'],
      wx: 'jin', col: [214, 222, 232], halo: ['rhino', 'silver'], mapBody: 96, bpos: [310, 640],
      cond: () => !!F().ch2_linyi && !!F().r399_csj && S.hero.lv >= 9,
      seen: () => '那团铁疙瘩是活的——吃铁矿长大的穿山甲。金铁怕火' + (hasYT() ? '，让云霆的雷去劈' : '') + '；等它滚晕了翻过肚皮，再下重手。',
      after: async () => { await say('星旋', '啃了上百年铁矿，啃出一身硬鳞，偏偏肚皮忘了练。小子，记着——再硬的东西，也有翻过来的一面。'); },
      task: { id: 'cs1', name: '碎岩', desc: '打倒山外树林的头目「碎岩 · 铁鳞穿山甲」', pts: 70, quip: '铁球都叫你们掀翻了。行，记上。' } },
  ];
  const BY = {};
  for (const y of LIST) { const M = META[y.id]; if (!M || !TMAPS[y.map] || !MOB_DB[y.type]) continue; const key = 'yw_' + y.id; BY[y.id] = y;
    R370_YW.push(y);
    VSPRITE_ADD(key, '../r399/' + y.id, M.main, M.h, false, false);
    // 蓄力三帧是「一步步做完一个动作」（根扎进土里 / 蜷成铁球），不是来回晃的待机：做完就停在最后一帧上，隔好一阵才松一下
    if (M.charge && !M.charge._hold) { const mp = [0, 1].concat(new Array(44).fill(2)); Object.assign(M.charge, { map: mp, idleEnd: mp.length - 1, impact: mp.length, n: mp.length, _hold: 1 }); }
    if (M.charge) VSPRITE_ADD(key + '_c', '../r399/' + y.id + '_charge', M.charge, M.h, false, false);
    if (M.break) VSPRITE_ADD(key + '_b', '../r399/' + y.id + '_break', M.break, M.h, false, false);
    // 图鉴 / 图集还没载完时：先用一张小的立绘（用到才载）
    try { let v = null, pic = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; }, get() { if (v) return v; if (!pic) { pic = new Image(); pic.src = 'r399/' + y.id + '_pic.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(pic); } catch (e) {} } return pic.complete && pic.naturalWidth ? pic : undefined; } }); } catch (e) {}
    (window.VS_SCALE = window.VS_SCALE || {})[key] = K;
    // 战斗里身体高 bodyH × K；地图上身体高 mapBody（图集一格里身体只占一部分，给出手留了余量）
    const bodyInFrame = M.bodyH * 1.25 / M.main.fh;
    y.vkey = key; y.vh = Math.round(M.bodyH * .92 * K); y.mh = Math.round(y.mapBody / bodyInFrame); y.gh = y.mapBody; y.apos = [[572, 652], [668, 606], [455, 680]]; y.sslots = y.apos;
    try { const m = MOB_DB[y.type]; if (m && typeof DROPS !== 'undefined' && DROPS[m.key] && !DROPS[key]) DROPS[key] = DROPS[m.key]; } catch (e) {}
    try { if (window.WX5) WX5.YW[y.id] = y.wx; } catch (e) {}
    try { if (window.R377_COL) R377_COL[y.id] = y.col; if (window.R377_ALIAS) R377_ALIAS[y.id] = y.halo; } catch (e) {}
    try { if (window.BESTIARY && BESTIARY.NAME) BESTIARY.NAME[key] = y.ep + ' · ' + y.name; } catch (e) {}
  }
  if (!Object.keys(BY).length) return;
  // 开战前把蓄力 / 力竭两张小图集也拉下来（不然第一次换姿势会闪一下）
  if (typeof startBattle === 'function') startBattle = (orig => function (cfg) { try { const y = cfg && BY[cfg.yw]; if (y) for (const n of ['charge', 'break']) { const im = new Image(); im.src = 'rig/../r399/' + y.id + '_' + n + '.webp'; } } catch (e) {} return orig.apply(this, arguments); })(startBattle);

  // ---------- 打法 ----------
  // 老松魈：三手一扎根（扎根时回一口血），扎完横扫全队，扫完根松了趴下
  AI.songxiao = async (e, b) => { const t = e.turn % 4;
    if (t === 3) { const heal = Math.min(e.maxhp - e.hp, Math.round(e.maxhp * .04));
      if (heal > 0) { e.hp += heal; floatText(e.x, e.y - e.h * .8, '扎根 +' + heal, '#7dff8a', 38); try { fx('fx3_burst_green', { x: e.x, y: e.y - e.h * .4, scale: .9 }); } catch (e2) {} await sleep(400); }
      return H.charge(e, '它把根扎进了土里——这一抽要防御！'); }
    if (t === 0 && e._charge) return H.aoe(e, b, '盘根横扫', 'fx3_burst_green', 1.45, '#8fe07a');
    return false; };
  // 穿山甲：平时铁鳞硬；三手一蜷，蜷完滚向血最多的那个（旁边的人被碎石带到），滚完翻肚皮——力竭这两手防御归零
  AI.chuanshanjia = async (e, b) => { const t = e.turn % 4;
    if (e._soft) { e._soft = 0; e.def = e._def0; floatText(e.x, e.y - e.h - 40, '铁鳞合拢', '#d6dee8', 34); await sleep(350); }
    if (t === 3) return H.charge(e, '它蜷成了一个铁球——这一滚要防御！');
    if (t === 0 && e._charge) { e._charge = null; const hs = H.heroes(b), P = hs.slice().sort((a, c) => c.hp - a.hp)[0]; if (!P) return false;
      await H.strike(e, b, P, '碎岩滚', 2.3, 'fx3_burst_earth');
      for (const Q of H.heroes(b)) if (Q !== P) { const { d } = dmgCalc(e, Q, .6, 0); applyDamage(Q, Math.round(d * H.guard(Q)), false); }
      S.shake = 20; e._break = 2; e._pojiT = performance.now() / 1000; e._soft = 1; e.def = 0;   // 力竭：和妖王那套一样（两手之内受伤多五成），外加铁鳞张开、防御归零；提示只出一行，不和「力竭 · 破绽」叠在一起
      floatText(e.x, e.y - e.h - 70, '肚皮朝天 · 防御归零！', '#ffe27a', 42, 1.6, BRUSH); try { playSnd('sfx_boom', .5); } catch (e2) {} await sleep(500); return true; }
    return false; };

  // ---------- 穿山甲：救下林溪之后才出来，而且要在玩家看不见的时候出来（不在剧情画面里凭空冒一只）----------
  setInterval(() => { try { const f = F(); if (f.r399_csj || !f.ch2_linyi || f.yw_chuanshanjia) return; const y = BY.chuanshanjia; if (!y) return;
      if (world.mapName !== y.map) { f.r399_csj = 1; return; }
      const p = world.player; if (p && calm() && Math.hypot(p.x - y.pos[0], p.y - y.pos[1]) > 900) f.r399_csj = 1; } catch (e) {} }, 1500);

  // ---------- 头一回看见：星旋说一句 ----------
  setInterval(() => { try { if (!calm() || !window.R370_HERE_ALL) return; const f = F(), p = world.player; if (!p) return;
      for (const y of R370_HERE_ALL()) { if (!BY[y.id] || f['r399_seen_' + y.id]) continue; if (Math.hypot(p.x - y.pos[0], p.y - y.pos[1]) > 400) continue;
        f['r399_seen_' + y.id] = 1; const line = typeof y.seen === 'function' ? y.seen() : y.seen;
        // 轮到说的时候人已经走到别的图了：这句先不说，下回再见到它时再说
        later(() => { if (!R370_HERE_ALL().includes(y)) { delete F()['r399_seen_' + y.id]; return; } return say('星旋', line); }); break; } } catch (e) {} }, 700);

  // ---------- 玉佩事迹 ----------
  try { const R = window.R386; if (R && Array.isArray(R.TASKS)) for (const y of LIST) { if (!BY[y.id] || R.TASKS.some(t => t.id === y.task.id)) continue;
      let i = R.TASKS.findIndex(t => t.id === 'lx1'); if (i >= 0) { while (i + 1 < R.TASKS.length && /^(lx1|sx1|cs1)$/.test(R.TASKS[i + 1].id)) i++; i++; } else i = R.TASKS.length;
      R.TASKS.splice(i, 0, { id: y.task.id, cat: '斩妖', name: y.task.name, desc: y.task.desc, n: () => [F()['yw_' + y.id] ? 1 : 0, 1], pts: y.task.pts, show: () => !!(F()['r399_seen_' + y.id] || F()['yw_' + y.id]), quip: y.task.quip }); } } catch (e) { console.warn('R399 task', e); }

  window.R399 = { LIST, BY };
})();
