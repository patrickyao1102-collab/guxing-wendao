// ================= R189 支线 · 槐柳双魂（作者 11-10）=================
// 作者：「幽影林加一个 NPC，有个任务——找到那两棵树（一个有男鬼一个有女鬼），第一张地图里就有；击败男女鬼可以获得一件防具」
// 追虎迷径（幽影林第一张图）南口的守林老人：十年前儿子儿媳进林采药没再出来，林里老槐上伏着灰衣男魂、绛柳上倚着紫衣女魂。
// 接下支线后，两棵树下各打一场（男魂 / 女魂各带一只阴魂），打完回去找老人 → 同心衣（防具，谁都能穿）。
// 原来这两棵树下的「树上挂魂」小怪战（yyt_f1 / yyt_f2）在接了支线后由支线战代替。
(function () {
  const M = TMAPS && TMAPS.m_yy_tiger; if (!M || !window.SQ_DEFS) return;
  const F = () => (S.flags = S.flags || {});
  const ID = 'yy_ghost', GIVER = '守林老人';
  ITEM_DB.a_tongxin = { name: '同心衣', slot: 'armor', def: 14, maxhp: 140, lvReq: 11,
    desc: '守林老人的儿媳当年一针一线缝给丈夫的护身衣，青布里衬着一层素纱，袖口绣着一对并蒂的槐花和柳叶。（需要境界：凝丹二重）' };
  const TREES = [
    { k: 'm', at: [942, 2298], flag: 'yyq_m', title: '幽影林 · 槐下男魂', name: '灰衣男魂', key: 'e_yyq_m', pre: ['老槐的枝杈上横伏着那个灰蓝衣的人影，长袖垂到林道上。', '它慢慢转过头来。那张脸上，竟还看得出几分憨厚。'],
      after: [['灰衣男魂', '……爹……药……采到了……'], ['', '魂影散成一片灰白的光，顺着槐枝飘了上去。树上只剩一截空荡荡的衣袖。']] },
    { k: 'f', at: [3540, 2070], flag: 'yyq_f', title: '幽影林 · 柳间女魂', name: '紫衣女魂', key: 'e_yyq_f', pre: ['绛柳的树杈里倚着那个淡紫衣的女子，长发混在柳丝里，像是睡着了。', '柳丝无风自动——她睁开了眼。'],
      after: [['紫衣女魂', '……他在等我……我得去找他……'], ['', '紫色的魂影轻轻一晃，化作点点微光，朝老槐的方向飘去了。']] },
  ];
  const Q = { id: ID, name: '槐柳双魂', giver: ['m_yy_tiger', GIVER], where: '幽影林 · 追虎迷径 · 守林老人', cond: () => !!F().ch3_report,
    desc: '守林老人的儿子儿媳十年前进林采药，再也没出来。林里一株老槐上伏着灰衣男魂，一株绛柳上倚着紫衣女魂。', goal: '找到老槐上的灰衣男魂、绛柳上的紫衣女魂，送他们往生',
    type: 'kill', kill: { maps: ['m_yy_tiger'], mobs: ['__yyq__'] }, n: 2,
    accept: [[GIVER, '……年轻人，你们是要往林子深处去？'], [GIVER, '十年前，我儿子带着他媳妇进林采药，说好太阳落山就回。这一等，就是十年。'],
      [GIVER, '后来进林的人都说——西边一株老槐上伏着个灰衣的魂，东边一株绛柳上倚着个紫衣的女魂。'], [GIVER, '老头子不敢去看……我怕就是他们俩，困在树上，不得往生。'], [GIVER, '求你们……送他们一程。']],
    done: [[GIVER, '……散了？都散了？'], [GIVER, '（老人望着林子深处，半天没说话）……好，好。总算能走了。'], [GIVER, '这件衣裳，是我那儿媳当年给他缝的，他走那天忘了穿。我收了十年……你们拿去吧，穿在活人身上，比压在箱底强。']],
    reward: { exp: 420, gold: 300, items: [['a_tongxin', 1]] } };
  SQ_DEFS.push(Q);
  const st = () => ((F().sq = F().sq || {})[ID] = F().sq[ID] || { s: 0, n: 0 });
  const ready = () => st().s === 1 && st().n >= 2;
  // 守林老人：追虎迷径南口
  M.npcs = M.npcs || [];
  const npc = { key: 'none', cx: 'groundskeeper', c: 1880 / 64 - .5, r: 3440 / 64 - .8, name: GIVER, h: 116, wander: false, face: 'down', _sq: [] };
  npc.talk = async function () {
    const s = st();
    if (s.s === 3) { await say(GIVER, '林子里清静多了。老头子每天来这儿坐坐，跟他们说说话。'); return; }
    if (ready()) { for (const [w, t] of Q.done) await say(w, t); s.s = 3; await reward(); return; }
    if (s.s === 1) { await say(GIVER, '（' + Q.goal + '）　现在 ' + s.n + ' / 2'); return; }
    if (!Q.cond()) { await say(GIVER, '……林子里不太平，年轻人别往深处走。'); return; }
    for (const [w, t] of Q.accept) await say(w, t);
    const k = await choose('支线 · ' + Q.name, ['接下（报酬：' + (window.SQ_REWARD_TEXT ? SQ_REWARD_TEXT(Q) : '同心衣') + '）', '下次再说']);
    if (k !== 0) return;
    s.s = 1; F().yyt_f1 = 1; F().yyt_f2 = 1;   // 两棵树下原来的小怪战由支线战代替
    world.triggers = (world.triggers || []).filter(t => !TREES.some(T => Math.hypot(t.x - T.at[0], t.y - T.at[1]) < 5 && !t._yyq));
    try { playSnd('ui_confirm'); } catch (e) {} toast('接取支线：' + Q.name + ' —— 西边老槐、东边绛柳', 2800); addTrees();
  };
  M.npcs.push(npc);
  async function reward() {
    const h = S.hero, r = Q.reward, lv0 = h.lv; h.gold += r.gold; for (const [id, n] of r.items) addItem(id, n);
    const it = ITEM_DB.a_tongxin;
    if (window.itemGet) await itemGet([{ icon: 'item:a_tongxin', id: 'a_tongxin', name: it.name, count: '×1', desc: '防具 · 防御 +' + it.def + '　气血 +' + it.maxhp + '（谁都能穿）' }, { icon: 'gold', name: '灵石', count: '×' + r.gold }], '支线完成 · ' + Q.name);
    else await showPanel('支线完成 · ' + Q.name, ['!获得：同心衣', '灵石 +' + r.gold]);
    const ups = typeof gainExp === 'function' ? gainExp(r.exp) : 0; toast('经验 +' + r.exp, 1800);
    if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0);
  }
  // 两棵树下的支线战
  function ghostBoss(T) { const g = typeof ghostUnit === 'function' ? ghostUnit(T.k === 'm' ? 2 : 1) : { name: '阴魂', hp: 420, maxhp: 420, atk: 40, def: 6, spd: 15, h: 220, color: '#5a7a9a', xie: true, ghost: true };
    const lv = Math.max(0, (S.hero.lv || 12) - 12); return Object.assign(g, { name: T.name, key: has(T.key) ? T.key : g.key, hp: 1400 + lv * 90, maxhp: 1400 + lv * 90, atk: 48 + lv * 3, def: 10, spd: 15, h: 270, boss: true, color: T.k === 'm' ? '#6a7f9a' : '#9a7ab8' }); }
  function addTrees() {
    if (world.mapName !== 'm_yy_tiger' || st().s !== 1 || !world.triggers) return;
    for (const T of TREES) { if (F()[T.flag] || T.busy || world.triggers.some(t => t._yyq === T.k && !t.done)) continue;
      addTrigger(T.at[0], T.at[1], 90, async () => {
        world.locked = true; world.path = null; world.player.moving = false; T.busy = true;
        try { await treeFight(T); } finally { T.busy = false; world.locked = false; } }, true, true);
      world.triggers[world.triggers.length - 1]._yyq = T.k; }
  }
  async function treeFight(T) {
        for (const l of T.pre) await say('', l);
        S.flash = .45; S.flashColor = '#cfe6ff'; await sleep(120); await fadeOut(200);
        const ens = [ghostBoss(T), typeof ghostUnit === 'function' ? ghostUnit(0) : makeEnemy('ghost', 2)];
        const pr = startBattle({ title: T.title, bg: 'bg_youying', enemies: ens, exp: 160, gold: 120, boss: true }); await fadeIn(220); const win = await pr;
        S.scene = drawMap;
        if (win && win !== 'flee') { F()[T.flag] = 1; st().n = Math.min(2, st().n + 1); for (const [w, t] of T.after) await say(w, t);
          toast('支线 · ' + Q.name + '　' + st().n + ' / 2' + (st().n >= 2 ? '（完成，回南口找守林老人）' : ''), 2800); }
        else { partyRevive(.3); }
  }
  setInterval(() => { try { if (typeof battle !== 'undefined' && battle) return; addTrees(); } catch (e) {} }, 800);
  // 任务栏点这条支线：寻路到还没打的那棵树
  try { if (window.R140Q && R140Q.GO) Object.defineProperty(R140Q.GO, ID, { configurable: true, enumerable: true, get() {
    const p = world.player, left = TREES.filter(T => !F()[T.flag]); if (!left.length) return { map: 'm_yy_tiger', pick: GIVER };
    const T = p && world.mapName === 'm_yy_tiger' ? left.sort((a, b) => Math.hypot(a.at[0] - p.x, a.at[1] - p.y) - Math.hypot(b.at[0] - p.x, b.at[1] - p.y))[0] : left[0];
    return { map: 'm_yy_tiger', pt: T.at, msg: T.k === 'm' ? '西边的老槐' : '东边的绛柳' }; } }); } catch (e) {}
})();
