// ================= R421 · 万妖塔：首领（两种形态）与塔里的小怪（只进测试版）=================
// 作者 11-27：「每一层的关底 BOSS 一定都是很强大的……极其强大的妖怪原型或者化身」「每个从第一层开始，BOSS 也会有双种形态……分阶段」。
// 本体都是 Codex R415 画的（r415/，tools/r378_build.py 拼成图集）：每个首领两种形态各 14 帧（平时 / 蓄力 / 出手 / 力竭），小怪 8 帧。
// 打法走妖王那一套（蓄力那一回合要防御，放完大招力竭有破绽），血打到一半当场换第二种形态，招数跟着变。
//   一层 · 彼岸花精「绛蘅」（木）：形态一「花中人」——入梦（蓄力后全队挨一下，没防御的睡一轮）；形态二「花冢」——花魇在就回血，花葬。
//   二层 · 白虎之魂「玄锋」（金）：形态一「银甲将军」——虎啸（没防御的被震退）；形态二「白虎真身」——更快，白虎噬（扑血最多的一个）。
// 地图、迷宫、机关、故事回放在 r422（等 Codex R418 的拼图）里接；这里只管打。
(function () {
  const META = window.R415_META; if (!META || !window.R370_AI || !window.R370_H || !window.R370_MAKE || typeof VSPRITE_ADD !== 'function' || typeof IMG === 'undefined') return;
  const H = R370_H, AI = R370_AI, F = () => (S.flags = S.flags || {}), ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const VS = window.VSPRITES, VSS = window.VS_SCALE = window.VS_SCALE || {};
  // ---------- 图集登记 ----------
  const K = { bianhua_f1: .8, bianhua_f2: .82, baihu_f1: .8, baihu_f2: .8 };
  function reg(id, k) { const M = META[id]; if (!M) return null; const key = 'yw_tw_' + id;
    VSPRITE_ADD(key, '../r415/' + (M.file || id), M.main, M.h, false, false);
    if (M.charge) VSPRITE_ADD(key + '_c', '../r415/' + (M.file || id) + '_charge', M.charge, M.h, false, false);
    if (M.break) VSPRITE_ADD(key + '_b', '../r415/' + (M.file || id) + '_break', M.break, M.h, false, false);
    try { let v = null, pic = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; }, get() { if (v) return v; if (!pic) { pic = new Image(); pic.src = 'r415/' + id + '_pic.webp?v=1'; } return pic.complete && pic.naturalWidth ? pic : undefined; } }); } catch (e) {}
    VSS[key] = k; return { key, vh: Math.round(M.bodyH * .92 * k), M }; }
  const FORM = {}; for (const id of Object.keys(K)) FORM[id] = reg(id, K[id]);
  // 战斗背景（Codex R419）：一层彼岸花海、二层北关城楼前
  for (const [k, f] of [['bg_tw1', 'bg_bianhua'], ['bg_tw2', 'bg_baihu']]) { const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = 'r419/' + f + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} }
  const preload = ids => { for (const id of ids) for (const s of ['', '_charge', '_break']) { const im = new Image(); im.src = 'r415/' + ((META[id] && META[id].file) || id) + s + '.webp'; } };
  // 小怪：登记进 MOB_DB（塔里的怪比外面的厉害，经验多五成）
  const MOBS = {
    tw_huayan: { name: '花魇', hp: 560, atk: 47, def: 11, spd: 15, atkType: 'claw', wx: 'mu', fl: 1 },
    tw_mengkui: { name: '梦傀', hp: 620, atk: 42, def: 14, spd: 11, atkType: 'vine', wx: 'mu', fl: 1 },
    tw_xuewei: { name: '雪魄虎卫', hp: 700, atk: 55, def: 15, spd: 15, atkType: 'claw', wx: 'jin', fl: 2 },
    tw_bingjia: { name: '冰甲残兵', hp: 820, atk: 50, def: 21, spd: 9, atkType: 'claw', wx: 'shui', fl: 2 } };
  for (const [t, m] of Object.entries(MOBS)) { const id = t.slice(3), M = META[id]; if (!M) continue; const key = 'e_' + t;
    VSPRITE_ADD(key, '../r415/' + (M.file || id), M.main, M.h, false, false); VSS[key] = 1;
    MOB_DB[t] = { key, name: m.name, hp: m.hp, atk: m.atk, def: m.def, spd: m.spd, h: Math.round(M.bodyH * .92), atkType: m.atkType, mh: 104 };
    try { if (window.WX5) WX5.ENEMY[key] = m.wx; } catch (e) {}
    try { let v = null, pic = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; }, get() { if (v) return v; if (!pic) { pic = new Image(); pic.src = 'r415/' + id + '_pic.webp?v=1'; } return pic.complete && pic.naturalWidth ? pic : undefined; } }); } catch (e) {} }

  // ---------- 首领 ----------
  const BOSS = {
    1: { n: 1, id: 'tw_bianhua', ep: '彼岸', name: '绛蘅', title: '彼岸花精', wx: 'mu', lv: 14, spd: 13, hpK: 1.05, atkK: .9, f1: 'bianhua_f1', f2: 'bianhua_f2', f2name: '花冢', bg: 'bg_tw1', pos: [300, 628], pos2: [300, 640],
      cry: '嘘——轻点声。两个一起留下来睡吧。', turn: ['……竟还不肯睡？', '也罢，既然不愿做梦，', '那便化作花肥，留在这儿吧。'], adds: ['tw_huayan'] },
    2: { n: 2, id: 'tw_baihu', ep: '白虎', name: '玄锋', title: '白虎之魂', wx: 'jin', lv: 17, spd: 14, hpK: 1.6, atkK: 1.05, f1: 'baihu_f1', f2: 'baihu_f2', f2name: '白虎真身', bg: 'bg_tw2', pos: [290, 630], pos2: [300, 640],
      cry: '关外的东西，一个也不许进来。', turn: ['……北关，不破。'], adds: [] } };
  const heroes = b => H.heroes(b);
  async function become(e, b) {   // 换第二种形态
    const B = e._tw, f2 = FORM[B.f2]; e._ph2 = 1; e._charge = null; e._break = 0; e._va = null; e.pose = null; e.turn = 0;
    try { playSnd('sfx_charge'); } catch (er) {}
    for (const line of B.turn) { floatText(e.x + 40, e.y - e.h - 40, line, '#ffd9c0', 34, 1.6, BRUSH); await sleep(1100); }
    S.flash = .9; S.flashColor = B.wx === 'mu' ? '#ff3a4a' : '#e8f4ff'; S.shake = 16; try { playSnd('sfx_boom', .8); } catch (er) {}
    try { particleBurst(e.x, e.y - e.h * .5, 60, B.wx === 'mu' ? ['#ff4a5a', '#ffb0b0', '#4a0a10'] : ['#ffffff', '#bfe4ff', '#ffe9a0'], 520, 1.2, 8); } catch (er) {}
    if (f2) { e.key = f2.key; e.h = f2.vh; } if (B.pos2) { e.x = B.pos2[0]; e.y = B.pos2[1]; }
    e.name = B.ep + ' · ' + B.name + '「' + B.f2name + '」 Lv' + e.lv; e.atk = Math.round(e._atk0 * 1.18); e._atk0b = e.atk;
    if (B.wx === 'jin') e.spd = Math.round(e.spd * 1.3);
    H.big(B.f2name, B.wx === 'mu' ? '#ff6a7a' : '#e8f4ff', 76); await sleep(1000); return true; }
  // 打到一半：这一下不让它直接打死，卡在一半，马上轮到它出手（先换形态）
  applyDamage = (orig => function (t, d, crit, opts) {
    try { if (t && t._tw && !t._ph2 && t.alive) { const half = Math.round(t.maxhp * .5); if (t.hp - d < half) { if (t.hp <= half) d = 0; else d = t.hp - half; t._turnNow = 1; t.gauge = 999; } } } catch (e) {}
    return orig.call(this, t, d, crit, opts); })(applyDamage);
  // 火烧花（作者 11-28 采纳）：花魇被云霆的火打死，绛蘅下一轮「吸梦」吸不到，回不了血——五行教学：火克木
  applyDamage = (orig => function (t, d, crit, opts) { const r = orig.call(this, t, d, crit, opts);
    try { const b = battle; if (b && t && t.key === 'e_tw_huayan' && !t.alive && !t._burnShown && b.active && b.active.ally === 'yunting') { t._burnShown = 1; const boss = b.enemies.find(e => e._tw && e._tw.n === 1 && e.alive); if (boss) { boss._burnt = 1; floatText(t.x, t.y - (t.h || 200) - 20, '火烧花 · 断梦', '#ff9a4a', 40, 1.4); try { playSnd('sfx_boom', .5); } catch (e) {} } } } catch (e) {}
    return r; })(applyDamage);
  // 一层 · 绛蘅
  AI.tw_bianhua = async (e, b) => {
    if (e._turnNow && !e._ph2) { e._turnNow = 0; return become(e, b); }
    if (!e._ph2) { const t = e.turn % 4;
      if (t === 3) return H.charge(e, '她闭上眼，花海翻涌，光丝结成了网——「入梦」，防御！');
      if (t === 0 && e._charge) return H.aoe(e, b, '入梦', 'fx3_burst_red', 1.05, '#ff7a8a', (P, guarded) => { if (!guarded && P.alive) { P.gauge = -90; floatText(P.x, P.y - P.h - 30, '入梦', '#ffb0c0', 36); } });
      const hs = heroes(b); await H.strike(e, b, hs[ri(0, hs.length - 1)], '花刃', 1.0, 'fx3_slash_gold'); return true; }
    // 形态二：花魇在，她就回血；火烧花——身边的花魇被火打死过，她这一轮不回
    const fl = H.addsAlive(b, e), t = e.turn % 4;
    const cap = Math.round(e.maxhp * .5);   // 吸梦最多回到换形态时那一半
    if (e._burnt) { e._burnt = 0; floatText(e.x, e.y - e.h * .8, '梦断了……吸不动', '#ffb08a', 34); await sleep(300); }
    else if (fl.length && e.hp < cap) { const heal = Math.min(cap - e.hp, Math.round(e.maxhp * .015 * fl.length)); e.hp += heal; floatText(e.x, e.y - e.h * .8, '吸梦 +' + heal, '#ff9aa8', 40); await sleep(400); }
    const bloom = (!e._bl1 && e.turn === 1) || (!e._bl2 && e._bl1 && e.hp < e.maxhp * .25);   // 花开两回：换完形态头一手、血剩四分之一
    if (bloom && fl.length < 2) { if (!e._bl1) e._bl1 = 1; else e._bl2 = 1; H.big('花开', '#ff6a7a', 64); await sleep(500); H.summon(b, e, ['tw_huayan', 'tw_huayan'].slice(0, 2 - fl.length)); await sleep(400); return true; }
    if (t === 3) return H.charge(e, '所有花瓣向后收拢，花心亮得刺眼——「花葬」，防御！');
    if (t === 0 && e._charge) return H.aoe(e, b, '花葬', 'fx3_burst_red', 1.4, '#ff5a6a');
    const hs = heroes(b); await H.strike(e, b, hs[ri(0, hs.length - 1)], '刀瓣', .62, 'fx3_slash_gold'); const h2 = heroes(b); if (h2.length) await H.strike(e, b, h2[ri(0, h2.length - 1)], null, .62, 'fx3_slash_gold'); return true; };
  // 二层 · 玄锋
  AI.tw_baihu = async (e, b) => {
    if (e._turnNow && !e._ph2) { e._turnNow = 0; return become(e, b); }
    if (!e._ph2) { const t = e.turn % 4;
      if (t === 3) return H.charge(e, '长戟拄地，风雪倒卷——「虎啸」，防御！');
      if (t === 0 && e._charge) return H.aoe(e, b, '虎啸', 'fx3_slash_blue', 1.3, '#e8f4ff', (P, guarded) => { if (!guarded && P.alive) { P.gauge = -60; floatText(P.x, P.y - P.h - 30, '震慑', '#cfe8ff', 36); } });
      const hs = heroes(b); await H.strike(e, b, hs[ri(0, hs.length - 1)], '断戟横扫', 1.05, 'fx3_slash_blue'); return true; }
    const t = e.turn % 3;
    if (t === 2) return H.charge(e, '它仰头长啸，风雪卷成了漩涡——「白虎噬」，防御！');
    if (t === 0 && e._charge) { e._charge = null; const hs = heroes(b), P = hs.slice().sort((a, c) => c.hp - a.hp)[0]; await H.strike(e, b, P, '白虎噬', 2.7, 'fx3_burst_gold'); S.shake = 20; await H.tired(e); return true; }
    const hs = heroes(b); await H.strike(e, b, hs[ri(0, hs.length - 1)], '扑击', .95, 'fx3_claw_red'); return true; };

  // ---------- 开打 ----------
  function makeBoss(n) { const B = BOSS[n], f1 = FORM[B.f1]; if (!f1) return null;
    const y = { id: B.id, ep: B.ep, name: B.name, type: 'wolf', lv: B.lv, spd: B.spd, bg: B.bg, vkey: f1.key, vh: f1.vh, scale: 1 };
    const e = R370_MAKE(y); e.hp = e.maxhp = Math.round(e.maxhp * B.hpK); e.atk = e._atk0 = Math.round(e.atk * B.atkK); e._tw = B; e._wx = B.wx; e.lv = B.lv; e.name = B.ep + ' · ' + B.name + ' Lv' + B.lv; e._famed = 1; return e; }
  async function fightBoss(n) { const B = BOSS[n]; const boss = makeBoss(n); if (!boss) { toast('首领还没到'); return false; }
    preload([B.f1, B.f2]); const ens = [boss];
    const pr = startBattle({ title: '万妖塔 · 第' + '一二三四五六七八九'[n - 1] + '层 · ' + B.title, bg: B.bg, enemies: ens, exp: Math.round(expNeed(B.lv) * .9), gold: 400 + n * 200, boss: true, flee: false, tower: n });
    try { if (battle) for (const u of battle.enemies) if (u._tw) { u._scale = 1; battle._yw = u; u.x = B.pos[0]; u.y = B.pos[1]; } } catch (e) {}
    const win = await pr; S.scene = drawMap;
    if (win === true) { const first = !F()['tw_clear_' + n]; F()['tw_clear_' + n] = 1; try { if (window.TOWER_STORY) await TOWER_STORY.play(n, first); } catch (e) { console.warn('R421 story', e); } }
    return win === true; }
  async function fightMobs(n, types) { const lvB = n === 1 ? 4 : 6.5;
    const ens = types.map(t => { const m = makeEnemy(t, lvB); m._wx = MOBS[t] && MOBS[t].wx; m.name += ' Lv' + (BOSS[n].lv - 2); return m; });
    const exp = Math.round(ens.reduce((s, e) => s + e.maxhp, 0) * .18 * 1.5);
    const win = await startBattle({ title: '万妖塔 · 第' + '一二三四五六七八九'[n - 1] + '层', bg: BOSS[n].bg, enemies: ens, exp, gold: 40 * ens.length, tower: n });
    return win === true; }
  window.TOWER = { BOSS, MOBS, FORM, fightBoss, fightMobs, makeBoss };
})();
