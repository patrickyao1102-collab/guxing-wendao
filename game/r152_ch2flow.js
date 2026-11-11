// ================= R152 · 第二章出发前的顺序（作者 11-07）=================
// 叶擎苍夜访送宝（凝元丹、破空遁符、盘缠）→ 当晚自己去后山九曜锁灵阵取流云仙衣、自己在行囊里服下凝元丹 → 回屋歇息 → 三日后清晨
// → 大殿听任务、和云霆组队 → 一起逛天剑集市（买《九天神雷》云霆当场参悟）→ 南边山门叶擎苍送别 → 下山。
(function () {
  const F = () => (S.flags = S.flags || {});
  const freeNow = () => typeof battle !== 'undefined' && !battle && world && world.map && S.scene === drawMap && !world.locked && !dialog && !choice && !(typeof sysPanel !== 'undefined' && sysPanel) && !(window.IG_OPEN && IG_OPEN()) && !(window.MAP_LOADING && MAP_LOADING());
  const whenFree = (fn, tries = 600) => { const id = setInterval(() => { if (--tries < 0) return clearInterval(id); if (!freeNow()) return; clearInterval(id); try { fn(); } catch (e) { console.warn('R152', e); } }, 300); };
  const night = () => { const f = F(); return !!f.ch2_night && !f.ch2_roam && !f.ch2_hall; };
  const nightQuest = () => { const f = F(), parts = [];
    if (!f.ch2_liuyun) parts.push('去后山九曜锁灵阵取流云仙衣（出小院北上云海大亭）');
    if (!f.ch2_pill) parts.push('凝元丹在行囊里，选中点「使用」服下');
    if (f.ch2_liuyun) parts.push('回青竹小院歇息');
    return '今夜：' + parts.join(' · '); };

  // ---- 夜访之后：自由行动 ----
  window.CH2_NIGHT_FREE = async function () {
    const f = F(); f.ch2_night = 1; f.ch2_seal_open = 1; f.hs_impact = 1;
    await say('星旋', '仙衣封在后山的九曜锁灵阵里——今晚就去？夜里的后山，正适合破阵。');
    await say('星旋', '还有，凝元丹别揣着当糖豆。打开行囊，选中它点「使用」，自己服下。');
    S.quest = nightQuest(); S.hud = true; world.locked = false;
    toast('出小院往北，经云海大亭上后山', 2600);
  };
  setInterval(() => { try { if (night() && /^今夜：|集齐 3 枚破阵灵晶/.test(S.quest || '') && (F().ch2_liuyun || /^今夜：/.test(S.quest || ''))) { const q = nightQuest(); if (S.quest !== q) S.quest = q; } } catch (e) {} }, 800);

  // ---- 流云仙衣到手（当晚）----
  window.CH2_ROBE_NIGHT = async function () {
    world.locked = true;
    try {
      await say('星旋', '仙衣到手！回小院歇着吧，明早就要下山了。');
      if (!F().ch2_pill) await say('星旋', '对了——凝元丹还没吃呢。在行囊里，选中点「使用」。');
      S.quest = nightQuest();
    } finally { world.locked = false; }
    toast('从南边白玉石阶下山，回青竹小院', 2400);
  };

  // ---- 凝元丹：行囊里自己服下 ----
  const isPill = id => id === 'n_ningyuan';
  if (typeof useBtn === 'function') useBtn = (o => function (L) {
    const id = S.menu && S.menu.sel;
    if (isPill(id) && itemCount(id)) return { x: L.body.x + L.body.w - 170, y: L.body.y + L.body.h - 92, w: 150, h: 56 };
    return o.apply(this, arguments);
  })(useBtn);
  if (typeof useItemOn === 'function') useItemOn = (o => function (id) {
    if (!isPill(id)) return o.apply(this, arguments);
    if (typeof battle !== 'undefined' && battle) { toast('战斗中不能服用', 1400); return; }
    try { closeMenu(); } catch (e) { S.menu = null; world.locked = false; }
    setTimeout(() => { eatPill(); }, 40);
  })(useItemOn);
  async function eatPill() {
    const f = F(), h = S.hero; if (f.ch2_pill || !itemCount('n_ningyuan')) return;
    f.ch2_pill = 1; world.locked = true; S.hud = false; if (world.player) world.player.moving = false;
    try {
      if (h.bag && h.bag.n_ningyuan) { h.bag.n_ningyuan--; if (!h.bag.n_ningyuan) delete h.bag.n_ningyuan; }
      // 作者 11-11：不要星空打坐那段花哨过场，服下直接弹升级面板
      h.realm = '凝丹二重'; h.maxhp += 84; h.maxmp += 31; h.atk += 9; h.def += 5; h.hp = h.maxhp; h.mp = h.maxmp; S.hero.learnQ = [];
      playSnd('jingle_levelup'); S.flash = .9; S.flashColor = '#fff3c0';
      await showPanel('突破 · 凝丹境', ['!练气九重 → 凝丹二重', '丹田中凝出一颗灵丹，天枢、天璇双星图案浮现其上', '破军剑意·天璇　贪狼剑意·追魂　重新凝聚', '凝元丹药力磅礴，一口气冲开了凝丹一重、二重', '气血 +84　灵力 +31　攻击 +9　防御 +5']);
      if (window.R134_FORGE) await R134_FORGE();
    } finally { world.locked = false; S.hud = true; }
    if (night()) { S.quest = nightQuest(); if (world.mapName === 'tj_room' && f.ch2_liuyun) return sleepNow(); }
  }
  window.CH2_EAT_PILL = eatPill;

  // ---- 回屋歇息 → 三日后清晨 ----
  let sleeping = false;
  async function sleepNow() {
    if (sleeping) return; sleeping = true;
    try { await say('叶孤星', '仙衣到手，修为也上去了……睡觉。'); await window.CH2_DAWN(); } finally { sleeping = false; }
  }
  tileSetMap = (orig => function (name) {
    const r = orig.apply(this, arguments);
    try { const f = F(); if (name === 'tj_room' && night() && f.ch2_liuyun) whenFree(async () => {
      if (world.mapName !== 'tj_room' || !night()) return;
      if (!F().ch2_pill) { if (window.R207_PILL_TUT) return R207_PILL_TUT(); world.locked = true; try { await say('星旋', '睡之前，先把凝元丹服了——行囊里，选中点「使用」。'); } finally { world.locked = false; } return; }
      sleepNow();
    }); } catch (e) {}
    return r;
  })(tileSetMap);

  // ---- 下山前：凝元丹还没吃（读旧档的情况）→ 山门前提醒 ----
  window.R152_PILL_GATE = () => !itemCount('n_ningyuan') || !!F().ch2_pill;

  // ---- 自动寻路 ----
  { const R = window.QUEST_ROUTE; if (R && Array.isArray(R.RULES)) {
    R.RULES.unshift([/^今夜：/, () => (F().ch2_liuyun ? (F().ch2_pill || world.mapName !== 'tj_room' ? { map: 'tj_room' } : { map: 'tj_room', tell: '睡前先服凝元丹：点右下「行囊」，选中凝元丹，点「使用」' }) : { map: 'tj_houshan' })]);   /* 11-10 跑 bug：回到居室还没吃丹，寻路只说「目标就在这张地图上，四处看看」——屋里没有可走的点，直接告诉玩家去行囊里用 */
    R.RULES.unshift([/和云霆一起去天剑集市/, () => ({ map: 'tj_market' })]);
  } }

  // ---- 山门送别：第二天大殿组队之后，走到天剑山门送别庭就开始送别 ----
  window.CH2_GATE_OK = () => false;   // 作者 11-08：送别改回演武广场南端（山门前），天剑山门不再触发送别
  tileSetMap = (orig => function (name) {
    const r = orig.apply(this, arguments);
    try { const f = F(); if (false && name === 'tj_shanmen' && f.ch2_hall && f.ch2_liuyun && !f.ch2_depart && window.CH2_DEPART_GO) setTimeout(() => {
      if (world.mapName !== 'tj_shanmen') return;
      addTrigger(1728, 1760, 150, async () => { const ok = await CH2_DEPART_GO(); if (ok === false) { const t = world.triggers.find(t => t.x === 1728 && t.y === 1760); if (t) t.done = false; if (world.player) world.player.y -= 140; } });
    }, 300); } catch (e) {}
    return r;
  })(tileSetMap);
  { const R = window.QUEST_ROUTE; if (R && Array.isArray(R.RULES)) R.RULES.unshift([/南边山门出发|山门出发/, () => (!F().ch2_market && /集市/.test(S.quest || '') ? { map: 'tj_market' } : { map: 'tj_front' })]);   /* 11-10 跑 bug：「和云霆一起去天剑集市采买…再从南边山门出发」被这条先接走 → 寻路去山门 → 星旋问「出发之前……」→ 选先去集市 → 寻路又回山门，死循环 */ R.RULES.unshift([/前往松风林道/, () => ({ map: 'tj_xiashan' })]); }
})();
