// ================= R429 · 万妖塔三、四层：首领、小怪、战斗背景、故事（只进测试版）=================
// 作者 11-28 凌晨：派 Codex（Ultra）并行画三、四层。到货：R426 沉渊龙女「霁月」两形态 + 守殿蛟卫 / 泪水灵；R429 堕凰「焚羽」两形态 + 烬羽 / 丹童傀儡；
// R431 / R432 三、四层战斗背景和七张故事画。图集用 tools/r378_build.py 拼进 r415/（和一二层同一处）。
// 三、四层的迷宫还在画（R430 龙宫要返工；一层正在按作者的新要求重做成三苑 + 传送法阵，二三层要不要也那样等作者玩过一层再定），
// 所以先在测试面板放两个按钮，直接打三、四层首领、看故事。
(function () {
  const META = window.R415_META, T = window.TOWER;
  if (!META || !T || !window.R370_AI || !window.R370_H || typeof VSPRITE_ADD !== 'function' || typeof IMG === 'undefined') return;
  const H = R370_H, AI = R370_AI, ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), VSS = window.VS_SCALE = window.VS_SCALE || {};
  // ---------- 图集登记（和 r421 一个规矩） ----------
  function reg(id, k) { const M = META[id]; if (!M) return null; const key = 'yw_tw_' + id;
    VSPRITE_ADD(key, '../r415/' + id, M.main, M.h, false, false);
    if (M.charge) VSPRITE_ADD(key + '_c', '../r415/' + id + '_charge', M.charge, M.h, false, false);
    if (M.break) VSPRITE_ADD(key + '_b', '../r415/' + id + '_break', M.break, M.h, false, false);
    try { let v = null, pic = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; }, get() { if (v) return v; if (!pic) { pic = new Image(); pic.src = 'r415/' + id + '_pic.webp?v=1'; } return pic.complete && pic.naturalWidth ? pic : undefined; } }); } catch (e) {}
    VSS[key] = k; return { key, vh: Math.round(M.bodyH * .92 * k), M }; }
  const K = { longnv_f1: .8, longnv_f2: .82, fenyu_f1: .8, fenyu_f2: .82 };
  for (const id of Object.keys(K)) { const f = reg(id, K[id]); if (f) T.FORM[id] = f; }
  for (const [k, f] of [['bg_tw3', 'bg_longnv'], ['bg_tw4', 'bg_fenyu']]) { const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = 'r419/' + f + '.webp?v=1'; }
  // ---------- 小怪 ----------
  const MOBS = {
    tw_jiaowei: { name: '守殿蛟卫', hp: 900, atk: 60, def: 20, spd: 13, atkType: 'claw', wx: 'shui', fl: 3 },
    tw_shuiling: { name: '泪水灵', hp: 640, atk: 48, def: 12, spd: 16, atkType: 'claw', wx: 'shui', fl: 3 },
    tw_huiyu: { name: '烬羽', hp: 760, atk: 70, def: 13, spd: 19, atkType: 'claw', wx: 'huo', fl: 4 },
    tw_dantong: { name: '丹童傀儡', hp: 1050, atk: 62, def: 24, spd: 10, atkType: 'claw', wx: 'huo', fl: 4 } };
  for (const [t, m] of Object.entries(MOBS)) { const id = t.slice(3), M = META[id]; if (!M) continue; const key = 'e_' + t;
    VSPRITE_ADD(key, '../r415/' + id, M.main, M.h, false, false); VSS[key] = 1;
    MOB_DB[t] = { key, name: m.name, hp: m.hp, atk: m.atk, def: m.def, spd: m.spd, h: Math.round(M.bodyH * .92), atkType: m.atkType, mh: 104 };
    try { if (window.WX5) WX5.ENEMY[key] = m.wx; } catch (e) {}
    try { let v = null, pic = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; }, get() { if (v) return v; if (!pic) { pic = new Image(); pic.src = 'r415/' + id + '_pic.webp?v=1'; } return pic.complete && pic.naturalWidth ? pic : undefined; } }); } catch (e) {}
    T.MOBS[t] = m; }
  // ---------- 首领 ----------
  Object.assign(T.BOSS, {
    3: { n: 3, id: 'tw_longnv', ep: '沉渊', name: '霁月', title: '沉渊龙女', wx: 'shui', lv: 20, spd: 14, hpK: 2.0, atkK: 1.05, f1: 'longnv_f1', f2: 'longnv_f2', f2name: '沉渊', bg: 'bg_tw3', pos: [300, 630], pos2: [290, 640],
      cry: '你们……是从城里来的吗？', turn: ['……原来，不是来接我的。', '那便……一起沉下去吧。'], adds: ['tw_shuiling'] },
    4: { n: 4, id: 'tw_fenyu', ep: '堕凰', name: '焚羽', title: '堕凰', wx: 'huo', lv: 23, spd: 16, hpK: 2.3, atkK: 1.1, f1: 'fenyu_f1', f2: 'fenyu_f2', f2name: '堕凰真身', bg: 'bg_tw4', pos: [300, 630], pos2: [290, 640],
      cry: '……又是来拔羽毛的？', turn: ['你们……和他们一样。', '烧吧——烧到连灰都不剩！'], adds: ['tw_huiyu'] } });
  const COL = { shui: ['#7fd8ff', ['#ffffff', '#9fe6ff', '#2a7fb0']], huo: ['#ff7a3a', ['#ffcf6a', '#ff5a2a', '#3a0a1a']] };
  async function become(e, b) { const B = e._tw, f2 = T.FORM[B.f2], c = COL[B.wx]; e._ph2 = 1; e._charge = null; e._break = 0; e._va = null; e.pose = null; e.turn = 0;
    try { playSnd('sfx_charge'); } catch (er) {}
    for (const line of B.turn) { floatText(e.x + 40, e.y - e.h - 40, line, '#ffd9c0', 34, 1.6, BRUSH); await sleep(1100); }
    S.flash = .9; S.flashColor = c[0]; S.shake = 16; try { playSnd('sfx_boom', .8); } catch (er) {}
    try { particleBurst(e.x, e.y - e.h * .5, 60, c[1], 520, 1.2, 8); } catch (er) {}
    if (f2) { e.key = f2.key; e.h = f2.vh; } if (B.pos2) { e.x = B.pos2[0]; e.y = B.pos2[1]; }
    e.name = B.ep + ' · ' + B.name + '「' + B.f2name + '」 Lv' + e.lv; e.atk = Math.round(e._atk0 * 1.18);
    H.big(B.f2name, c[0], 76); await sleep(1000); return true; }
  const heroes = b => H.heroes(b);
  // 三层 · 霁月：形态一「潮汐」（蓄力后全队挨一下，没防御的「溺」——这一轮行动条倒退）；形态二「沉渊」：落泪化出泪水灵，泪水灵在她就回血，「沉渊」大招
  AI.tw_longnv = async (e, b) => {
    if (e._turnNow && !e._ph2) { e._turnNow = 0; return become(e, b); }
    if (!e._ph2) { const t = e.turn % 4;
      if (t === 3) return H.charge(e, '她托起夜明珠，身周的水流倒卷成漩涡——「潮汐」，防御！');
      if (t === 0 && e._charge) return H.aoe(e, b, '潮汐', 'fx3_burst_blue', 1.1, '#9fe6ff', (P, guarded) => { if (!guarded && P.alive) { P.gauge = -70; floatText(P.x, P.y - P.h - 30, '溺', '#9fe6ff', 36); } });
      const hs = heroes(b); await H.strike(e, b, hs[ri(0, hs.length - 1)], '月刃', 1.0, 'fx3_slash_blue'); return true; }
    const sl = H.addsAlive(b, e), t = e.turn % 4, cap = Math.round(e.maxhp * .5);
    if (sl.length && e.hp < cap) { const heal = Math.min(cap - e.hp, Math.round(e.maxhp * .018 * sl.length)); e.hp += heal; floatText(e.x, e.y - e.h * .8, '泪 +' + heal, '#bfefff', 40); await sleep(400); }
    const tears = (!e._t1 && e.turn === 1) || (!e._t2 && e._t1 && e.hp < e.maxhp * .25);
    if (tears && sl.length < 2) { if (!e._t1) e._t1 = 1; else e._t2 = 1; H.big('落泪', '#bfefff', 64); await sleep(500); H.summon(b, e, ['tw_shuiling', 'tw_shuiling'].slice(0, 2 - sl.length)); await sleep(400); return true; }
    if (t === 3) return H.charge(e, '龙身盘起，水流卷成了巨大的漩涡——「沉渊」，防御！');
    if (t === 0 && e._charge) return H.aoe(e, b, '沉渊', 'fx3_burst_blue', 1.45, '#7fd8ff');
    const hs = heroes(b); await H.strike(e, b, hs[ri(0, hs.length - 1)], '激流', 1.05, 'fx3_burst_blue'); return true; };
  // 四层 · 焚羽：形态一每一手叠「灼」，「黑焰」大招；形态二「涅槃之火」——没在它蓄满之前打到四分之一以下，它回一截血
  AI.tw_fenyu = async (e, b) => {
    if (e._turnNow && !e._ph2) { e._turnNow = 0; return become(e, b); }
    const burn = P => { if (P && P.alive) { P._burn = Math.max(P._burn || 0, 3); floatText(P.x, P.y - P.h - 30, '灼', '#ff8a3a', 36); } };
    if (!e._ph2) { const t = e.turn % 4;
      if (t === 3) return H.charge(e, '他张开双翼，周身的火从赤金慢慢转黑——「黑焰」，防御！');
      if (t === 0 && e._charge) return H.aoe(e, b, '黑焰', 'fx3_burst_red', 1.15, '#ff6a3a', (P, guarded) => { if (!guarded) burn(P); });
      const hs = heroes(b), P = hs[ri(0, hs.length - 1)]; await H.strike(e, b, P, '黑火羽刃', 1.0, 'fx3_slash_gold'); burn(P); return true; }
    const t = e.turn % 4;
    if (t === 3) return H.charge(e, '它仰首长鸣，黑火卷成了火环——「涅槃之火」，防御！');
    if (t === 0 && e._charge) { const r = await H.aoe(e, b, '涅槃之火', 'fx3_burst_red', 1.5, '#ff5a2a', (P, guarded) => { if (!guarded) burn(P); });
      if (e.alive && e.hp > e.maxhp * .25 && !e._reborn) { e._reborn = 1; const heal = Math.round(e.maxhp * .12); e.hp = Math.min(e.maxhp * .5, e.hp + heal); floatText(e.x, e.y - e.h * .8, '涅槃 +' + heal, '#ffcf6a', 44); }
      return r; }
    const hs = heroes(b); await H.strike(e, b, hs[ri(0, hs.length - 1)], '扑击', 1.0, 'fx3_claw_red'); const h2 = heroes(b); if (h2.length && Math.random() < .5) await H.strike(e, b, h2[ri(0, h2.length - 1)], null, .6, 'fx3_burst_red'); return true; };
  // ---------- 故事（Claude 写，等作者看过可以再请 Gemini 润色） ----------
  try { const ST = window.TOWER_STORY && TOWER_STORY.STORY; if (ST) Object.assign(ST, {
    3: [['s', '霁月', '……你们，是从城里来的吗？'],
      [1, '', '那年秋天，东海边的一座城遇上了百年不遇的大潮。浪头比城墙还高，满城的人挤在城头，哭喊声盖过了风声。'],
      [2, '', '海底深处，一条白龙抬头望着那座摇摇欲坠的城。她是东海龙族的公主，名叫霁月。'],
      [3, '', '龙族祖训：不得以龙脉干涉人间。她还是把龙脉和逆鳞一起抽了出来，化作一只灵眼，从海底托住了整座城。从那一刻起，她的尾巴开始变成石头。'],
      [4, '', '城保住了。第一年海祭，满城的人都来了海边，放河灯、摆香案。有个小姑娘把手拢在嘴边，冲着大海喊她的名字。'],
      [5, '', '后来，城成了繁华的大港，人换了一代又一代。海边那座小小的祭台长满了青苔，再没有人记得，海底有一条龙。'],
      [6, '', '只有一个在破庙里过冬的小乞丐，从老人嘴里听说了这件事。他每年给海里写一封信，开头总是同一句：「霁月：今年也风调雨顺。」'],
      ['s', '霁月', '他们……还记得我，对吗？'],
      [null, '叶孤星', '（攥紧了那摞泡皱的信）……记得。每年都有人给你写信。'],
      [null, '霁月', '（轻轻笑了）那就好。那……我就再睡一会儿。'],
      [7, '', '她抱着那摞信，闭上了眼睛。海面的光一束一束照下来，像很多年前，那一夜城头的灯。']],
    4: [['s', '焚羽', '……又是来拔羽毛的？'],
      [1, '', '南疆火山之巅，每隔五百年，冥凰一族会有一只赤羽浴火涅槃。那一夜，轮到了焚羽。'],
      [2, '', '山脚下，一队背着丹炉和铁笼的修士正往上爬。他们听说，凤羽入丹，可以延寿一纪。'],
      [3, '', '涅槃最虚弱的那一刻，金色的符网从天而降。'],
      [4, '', '那一年，那座宗门的丹房日夜不熄。一根根赤金的凤羽，被投进了炉火里。'],
      [5, '', '它没能涅槃，却也没死。从灰烬里站起来的是一个少年——一只翅膀完好，另一只，烧着黑色的火。'],
      [6, '', '那一夜，宗门的山门、楼阁、丹房，连同所有的丹炉，被黑火烧得干干净净，连灰都没留下。'],
      ['s', '焚羽', '我烧了他们，一个不剩。可我的羽毛……一根也没回来。'],
      [null, '叶孤星', '那枚凤卵，是你的？'],
      [null, '焚羽', '（低下头）……是那一窝里，唯一没被他们带走的。它冷了五百年，我还在等它孵出来。'],
      [7, '', '焦土上，少年用残缺的那只翅膀，轻轻护住一枚冷掉的凤卵。天边透出了一线晨光。']] }); } catch (e) {}
  // ---------- 测试面板：直接打三、四层首领 ----------
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r429]')) return; const h = document.createElement('h4'); h.textContent = '11-28 新加 · 万妖塔三、四层首领（迷宫还在画，先直接打）'; h.setAttribute('data-r429', '1');
      const row = document.createElement('div'); row.className = 'row';
      for (const [n, lab] of [[3, '打三层 · 沉渊龙女霁月'], [4, '打四层 · 堕凰焚羽']]) { const btn = document.createElement('button'); btn.textContent = lab;
        btn.onclick = () => { try { const pnl = document.getElementById('dbgPanel'); if (pnl) pnl.style.display = 'none'; } catch (e) {} if (typeof battle !== 'undefined' && battle) return; T.fightBoss(n); }; row.appendChild(btn); }
      p.appendChild(h); p.appendChild(row); };
    if (document.getElementById('dbgPanel')) add(); else { const mo = new MutationObserver(() => { if (document.getElementById('dbgPanel')) { add(); mo.disconnect(); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}
  window.R429T = { MOBS };
})();
