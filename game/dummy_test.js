// ================= 测试面板 · 木人桩：每个角色单独对三根木人，自己选技能放 =================
// 木人不还手、打不死（每次出手后回满血），所有技能临时全解锁，灵力 / 怒气每回合自动回满。
// 结束：测试面板「结束木人桩」，或战斗里点「药」旁边的木人桩提示照常可退。
(function () {
  if (typeof startBattle !== 'function') return;
  const NAMES = { yegx: '叶孤星', yunting: '云霆', linxue: '林雪', luochen: '洛尘', shenle: '神乐' };
  let saved = null; const D = { b: null, me: null };
  function unlockAll() {
    const h = S.hero; saved = { lv: h.lv, skills: h.skills.slice(), sun: S.flags && S.flags.sun_unlocked, seen: S.flags && S.flags.sun_seen, sk4: JSON.stringify(S.sk4 || {}), jt: S.flags && S.flags.yt_jiutian };
    // 所有人的辅助 / 秘传临时全学会；九天神雷提前解锁（结束后恢复）
    S.sk4 = S.sk4 || {}; if (window.SK4 && SK4.X) for (const w in SK4.X) for (const id in SK4.X[w]) S.sk4[w + '.' + id] = 1;
    h.lv = 99; const ally = new Set(['dianxing', 'qunxing', 'shaxing']);
    for (const k of Object.keys(SKILL_DB)) if (!ally.has(k) && !h.skills.includes(k)) h.skills.push(k);
    S.flags = S.flags || {}; S.flags.sun_unlocked = 1; S.flags.sun_seen = 1; S.flags.yt_jiutian = 1;
  }
  function restore() {
    if (!saved) return; const h = S.hero; h.lv = saved.lv; h.skills = saved.skills; S.flags.sun_unlocked = saved.sun; S.flags.sun_seen = saved.seen; S.sk4 = JSON.parse(saved.sk4); S.flags.yt_jiutian = saved.jt; saved = null;
  }
  const dummy = i => ({ name: '木人桩', key: 'm_dummy', hp: 99999, maxhp: 99999, atk: 1, def: 0, spd: 3, h: 200, color: '#8a6a3a', ai: async () => true, dummy: true });
  async function start(who) { try { return await start0(who); } catch (e) { console.error('DUMMY', e && e.stack); } }
  async function start0(who) {
    if (typeof battle !== 'undefined' && battle) { toast('先结束当前战斗'); return; }
    const party = who === 'yegx' ? [] : [who];
    for (const k of party) if (!(S.party || []).includes(k)) joinParty(k);
    for (const k of party) { const a = allyState(k), st = allyStats(k); a.hp = st.maxhp; a.mp = st.maxmp; a.rage = 100; }
    unlockAll();
    S.started = true; S.hud = true;
    try { await fadeOut(200); } catch (e) {}
    const p = startBattle({ title: '木人桩 · ' + NAMES[who], bg: 'bg_mountain', enemies: [dummy(0), dummy(1), dummy(2)], party, dummy: true, cannotLose: true, forceLuochen: who === 'luochen' });
    for (let i = 0; i < 100 && !(typeof battle !== 'undefined' && battle && battle.enemies && battle.enemies[0] && battle.enemies[0].key === 'm_dummy'); i++) await sleep(50);
    if (!battle) { restore(); return; }
    const me = battle.heroes.find(x => who === 'yegx' ? !x.ally : x.ally === who); D.b = battle; D.me = me;
    battle.heroes.forEach(u => { u.rage = 100; u.maxmp = Math.max(u.maxmp, 999); u.mp = u.maxmp; });
    fadeIn(200).catch(() => {});
    toast('木人桩 · ' + NAMES[who] + '：点「仙术」选技能，点「绝技」放必杀；木人不还手、打不死', 3600);
    try { await p; } catch (e) {}
    restore();
  }
  // 每次轮到我方：灵力 / 怒气回满；木人回满血、不会死
  heroSkills = (orig => function () { const b = battle; if (b && b === D.b && b.P) { b.P.maxmp = Math.max(b.P.maxmp, 999); b.P.mp = b.P.maxmp; b.P.rage = 100; } return orig.apply(this, arguments); })(heroSkills);
  afterAct = (orig => async function () {
    const b = battle; if (b && b === D.b) { for (const e of b.enemies) { e.alive = true; e.hp = e.maxhp; e.pose = null; } for (const u of b.heroes) { u.alive = true; u.hp = Math.max(u.hp, 1); u.maxmp = Math.max(u.maxmp, 999); u.mp = u.maxmp; u.rage = 100; } }
    return orig.apply(this, arguments);
  })(afterAct);
  // 木人桩里只有选中的角色出手：轮到别人时自动「防」跳过
  updateBattle = (orig => function (dt) {
    const b = typeof battle !== 'undefined' && battle;
    if (b && b === D.b) for (const u of b.heroes) { u.rage = 100; if (u.mp < 999) { u.maxmp = Math.max(u.maxmp, 999); u.mp = u.maxmp; } }   // 怒气 / 灵力一直满
    if (b && b === D.b && b.state === 'menu' && D.me && b.P !== D.me && !b._skip && !dialog) { b._skip = 1; Promise.resolve(doHeroAction('def')).finally(() => { b._skip = 0; }); }
    return orig.apply(this, arguments);
  })(updateBattle);
  window.DUMMY_TEST = { start, D, end: async () => { const b = typeof battle !== 'undefined' && battle; if (b && b === D.b) { b.state = 'end'; try { FX.length = 0; } catch (e) {} S.hero.hp = S.hero.maxhp; S.hero.mp = S.hero.maxmp; D.b = null; battle = null; try { b.res && b.res(true); } catch (e) {} try { if (world.map) playBgm('bgm_shanmen', true); } catch (e) {} } restore(); }, NAMES };
})();
