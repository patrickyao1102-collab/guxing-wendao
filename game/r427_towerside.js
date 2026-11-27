// ================= R427 · 万妖塔一二层：迷宫里的人和事（只进测试版）=================
// 作者 11-27：「迷宫里面应该还有别的东西吧……小小 BOSS、精英怪……被困的 NPC……剧情只能做一次，可以获得材料或者成品装备」
//            「不一定只是一个小剧情……《锁妖塔》里面有很多剧情……设置一个不一样的场景」「要像仙侠，不要聊斋，不要土」
// 剧本：Claude 写，Gemini 第 10 条润色，Claude 合稿（采纳了它的三条建议：心魔改成剑道拷问、陆不归藏起大块寒铁、他摸空剑鞘）。
//   一层 · 忘川泉：被梦丝困了三十年的天剑宗弟子温行舟。入梦打精英「心魔」→ 救醒他 → 照雪剑。泉水每次进塔能喝一口回满。
//   二层 · 冰封演武场：十九尊虎卫冰像。向香案行礼 → 「虎卫之诺」：这一回打玄锋，全队受的伤少一成。
//   二层 · 烽火台：散修陆不归第一次登场（以后会在高层反复出现）。帮他打冰甲残兵 ×3 → 千年寒铁。
//   二层 · 虎卫十九：守着东边那个绞盘的精英，打过了才转得动 → 霜纹护腕。
// 场景是 Codex R422（拼进 r424 的迷宫图里），人物是 Codex R423（r427/ 下：行走图、立绘、两个精英的战斗帧、梦境战斗背景）。
// 图没到的时候：场景没拆墙就整段不开；人物 / 精英图没到，先用塔里现成的小怪顶着打（只为测得通）。
(function () {
  if (!window.TOWER || !TOWER.MAZE || typeof TMAPS === 'undefined') return;
  const MZ = TOWER.MAZE, META = MZ.META, F = () => (S.flags = S.flags || {}), ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const T7 = () => { const t = F().tw7 || (F().tw7 = {}); return t; };   // 一次性的剧情旗子（存档里）
  const RUN = { f1: {}, f2: {} };   // 这一趟进塔才算数的（泉水、虎卫之诺）：进塔时清掉
  const has = (n, name) => !!(META['f' + n] && META['f' + n].objs.some(o => o.name === name));
  const ON1 = () => has(1, 'wangchuan_pond'), ON2 = () => has(2, 'altar');
  // ---------- 位置（照 R422 的需求单） ----------
  const POS = { wen: [900, 2590], pond: [1120, 2390], altar: [2300, 2290], plaza: [1800, 1800, 2800, 2600], lu: [4700, 3420], hu: [4700, 2150] };
  // ---------- 图（r427/） ----------
  const IM = {}; function im(rel) { let o = IM[rel]; if (!o) { o = IM[rel] = new Image(); o.src = 'r427/' + rel + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o); } catch (e) {} } return o.complete && o.naturalWidth ? o : null; }
  // 立绘：对话时左边那张
  const PORT = { '温行舟': ['p_wenxingzhou', '#bfe3d0'], '少年温行舟': ['p_wenxingzhou_young', '#d6ecf5'], '陆不归': ['p_lubugui', '#e8d2a6'], '心魔': ['p_xinmo', '#e6b0b8'], '虎卫十九': ['p_huwei19', '#cfe6ff'] };
  for (const [who, [k, color]] of Object.entries(PORT)) { const key = 'r427_' + k;
    try { let v = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; }, get() { return v || im('portraits/' + k) || undefined; } }); } catch (e) {}
    if (typeof SPEAKERS === 'object') SPEAKERS[who] = Object.assign({}, SPEAKERS[who] || {}, { p: key, color }); }
  if (typeof SPEAKERS === 'object') SPEAKERS['灰衣青年'] = { p: 'r427_p_lubugui', name: '灰衣青年', color: '#e8d2a6' };
  // ---------- 东西：照雪剑、霜纹护腕、千年寒铁 ----------
  const REALM = lv => (typeof window.REALM_NAME === 'function' ? REALM_NAME(lv) : '凝丹');
  if (typeof ITEM_DB === 'object') {
    if (!ITEM_DB.w_zhaoxue) ITEM_DB.w_zhaoxue = { name: '照雪', slot: 'weapon', price: 0, sell: 900, lvReq: 11, wx: 'shui', r427: 1, atk: 31, maxmp: 25, spd: 2, desc: '天剑宗温行舟的佩剑。细长直剑，剑鞘素白，剑格一片小小的雪花纹。出鞘时剑身像映着一层雪光。三十年后，他把它送给了你。' };
    if (!ITEM_DB.r_shuangwen) ITEM_DB.r_shuangwen = { name: '霜纹护腕', slot: 'wrist', price: 0, sell: 600, lvReq: 11, wx: 'jin', r427: 1, atk: 14, def: 3, spd: 1, desc: '北关虎卫的护腕，钢面上结着洗不掉的霜纹，腕口刻一个小小的「十九」。' };
    if (!ITEM_DB.m_qnhantie) ITEM_DB.m_qnhantie = { name: '千年寒铁', price: 0, sell: 300, cat: '材料', r427: 1, desc: '一块冻得发蓝的铁，握久了手心发麻。北关城墙砖缝里抠出来的，打兵器的上好料。' };
    try { if (window.WX5 && WX5.GEAR) { WX5.GEAR.w_zhaoxue = 'shui'; WX5.GEAR.r_shuangwen = 'jin'; } } catch (e) {}
    try { if (window.CRAFT && CRAFT.MAT) CRAFT.MAT.m_qnhantie = { c: 'W', wx: 'shui', g: 3, sig: 'cd' }; } catch (e) {}
  }
  const give = async (title, list) => { const got = []; for (const [id, c] of list) if (ITEM_DB[id]) { addItem(id, c); got.push(ITEM_DB[id].name + (c > 1 ? ' ×' + c : '')); } try { playSnd('jingle_win', .6); } catch (e) {} if (got.length) await showPanel(title, ['!获得：' + got.join('、')]); };
  const L = MZ.lines, nar = t => narrate(t);
  // ---------- 剧本（定稿：/tmp 里的 一二层支线_定稿.md） ----------
  const TXT = {
    wenMeet: [['', '（花林深处豁然开出一片空地，一汪清泉静静映着天光，水面浮着几瓣落花。泉边盘坐着一名青衣剑修，长剑横在膝上，眉眼安详。数不清的赤红细丝从花丛深处探出来，一圈圈缠在他身上。）'],
      ['星旋', '小子，别碰那些丝。……这人身上的剑意，是天剑宗的。'], ['叶孤星', '天剑宗？'], ['星旋', '三十年前，天剑宗有个弟子闯进这塔，再没出去。宗门里他的长明灯，至今还亮着。'], ['云霆', '……还有气息。'],
      ['星旋', '魂叫梦丝锁进心魔里了。想救他，得有人入梦，替他把那道心魔斩了。']],
    wenAgain: [['星旋', '要入梦，就趁早。梦丝缠得越久，人越难醒。']],
    dream: [['', '（眼前一暗。再睁眼时，漫天大雪，一座山门横在眼前。一个少年跪在雪里，身前立着半截断掉的剑碑。）'], ['少年温行舟', '都怪我……师兄是替我挡剑才死的。我不配留在天剑宗。'],
      ['', '（风雪里走来一道人影，提着剑，和碑上刻的名字是同一个人。）'], ['心魔', '行舟，拔剑。'], ['心魔', '那一剑，你慢了半寸。再来。'], ['', '（少年握剑的手在抖，剑始终没能出鞘。）'],
      ['叶孤星', '（上前一步，挡在少年身前）你师兄拿命换你活下来，不是让你跪在雪里的。'], ['心魔', '多嘴。']],
    dreamLose: [['星旋', '……醒醒，小子！梦里被打出来了。缓口气，再来。']],
    wenWake: [['温行舟', '（缓缓睁开眼）……三十年了？我还当，只睡了一夜。'], ['温行舟', '（低头看着膝上的剑）原来我一直跪在那块断碑前，从没起过身。'], ['温行舟', '多谢。这柄「照雪」随我半生，送你吧。']],
    wenAfter: [['温行舟', '那花精的梦丝怕火。（看向云霆）你身边这位道友，正好克她。'], ['云霆', '（微微颔首。）'], ['温行舟', '我先出塔。回宗门，给师兄上一炷香。'], ['', '（他朝泉水深深一揖，转身步入花林，青衣背影渐渐淡去。）'], ['星旋', '……这才像个天剑宗的剑修。']],
    pond: '（泉水清冽，一口入喉，周身灵力流转，连日的疲惫尽数散去。）', pondDone: '（泉水映着天光。刚喝过，这一趟不必再喝了。）', pondBound: '（泉边的梦丝密密麻麻，靠近不了水。）',
    plaza: [['', '（城墙围出一片开阔校场，十九尊虎卫冰像围成一圈，刀尖齐齐指向北方。冰像脚下的积雪平平整整，像是日日有人清扫。）'], ['叶孤星', '十九尊。'], ['星旋', '和那十九只倒扣的酒碗，一样多。']],
    bow: [['', '（风雪骤然一顿。肩头仿佛被人沉沉一按，随即一轻，像是一位老卒拍了拍你。）'], ['星旋', '……这帮老兵认下你了。去见他们的将军，脊梁挺直些。']],
    bowDone: '（三炷香静静燃着。）',
    luMeet: [['', '（烽火台的残垣上，一个灰衣青年死死抱着半截石柱，脚底下三具冰甲残兵举着长枪，一枪接一枪往上捅。）'], ['灰衣青年', '喂——底下那两位兄台！搭把手！这几个铁疙瘩追着我捅了三条街了！'], ['星旋', '……哪儿蹦出来的野猴子。']],
    luAfter: [['陆不归', '（轻巧跳下石柱，拍掉衣摆上的雪）好俊的剑法！在下陆不归，散修一个，平生就爱往别人不敢钻的地方寻宝。这座塔，我比二位早来了两天。'], ['叶孤星', '你一个人闯到了第二层？'],
      ['陆不归', '第一层那位花精姐姐打盹的工夫，顺着墙根溜上来的嘛。（嘿嘿一笑，从怀里摸出一大一小两块泛着蓝光的铁，手一快把大的塞了回去，小的抛过来）喏，谢礼。'],
      ['陆不归', '北关城墙砖缝里抠的，千年寒铁。救命之恩，咱们两清啊！']],
    luAfter2: [['星旋', '小子，他怀里还揣着块大的。'], ['陆不归', '（只当没听见）'], ['云霆', '……你来找什么。'], ['陆不归', '这个嘛——（眼珠一转，压低了声）听说塔顶镇着件东西，能让人回到过去。'],
      ['', '（他笑嘻嘻说着，手指却在腰间那只空剑鞘上摩挲了一下。）'], ['陆不归', '（摆摆手）逗二位玩的。青山不改，后会有期！'], ['', '（话音未落，他一溜烟钻进了城墙的阴影里。）'], ['星旋', '这滑头嘴里十句话九句掺水。……回到过去，哼。']],
    luLose: [['陆不归', '哎哎哎——撑住啊兄台！……算了算了，我自己再抱会儿！']],
    huMeet: [['', '（绞盘前立着一道半透明的披甲身影，虎头盔下看不清面容，掌中长刀凝着一层玄冰。）'], ['虎卫十九', '止步。闸门之前，寸步不让。']],
    huAfter: [['虎卫十九', '（单膝重重跪进雪里，长刀拄地）……将军……还在关外守着吗？'], ['叶孤星', '（望了一眼风雪深处的城楼）……在。还守着。'], ['虎卫十九', '那就好。……那就好。'], ['', '（甲胄化作漫天雪粉散去，原地只留下一副凝着霜纹的护腕。）']],
    huLose: [['虎卫十九', '……退后。']] };
  // ---------- 精英：心魔、虎卫十九（Codex R423 的帧；没到就拿塔里的小怪顶） ----------
  const EM = window.R427_META || {}, H = window.R370_H, AI = window.R370_AI, VSS = window.VS_SCALE = window.VS_SCALE || {};
  const ELITE = { xinmo: { name: '心魔', ep: '梦', lv: 13, spd: 15, hpK: .5, atkK: .85, wx: 'jin', bg: 'bg_r427_dream', stand: 'tw_mengkui' },
    huwei19: { name: '虎卫十九', ep: '北关', lv: 16, spd: 13, hpK: .55, atkK: .95, wx: 'shui', bg: 'bg_tw2', stand: 'tw_xuewei' } };
  for (const [id, E] of Object.entries(ELITE)) { const M = EM[id]; if (!M || typeof VSPRITE_ADD !== 'function') continue; const key = 'yw_r427_' + id;
    VSPRITE_ADD(key, '../r427/' + id, M.main, M.h, false, false); if (M.charge) VSPRITE_ADD(key + '_c', '../r427/' + id + '_charge', M.charge, M.h, false, false); if (M.break) VSPRITE_ADD(key + '_b', '../r427/' + id + '_break', M.break, M.h, false, false);
    try { let v = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; }, get() { return v || im(id + '_pic') || undefined; } }); } catch (e) {}
    VSS[key] = .8; E.vkey = key; E.vh = Math.round(M.bodyH * .92 * .8); }
  { const b = new Image(); b.onload = () => { IMG.bg_r427_dream = b; }; b.src = 'r427/bg_dream.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(b); } catch (e) {} }
  if (AI && H) {
    AI.r427_xinmo = async (e, b) => { const hs = H.heroes(b), t = e.turn % 4;
      if (t === 3) return H.charge(e, '他把剑横在胸前，剑身凝起一层雪光——「断碑」，防御！');
      if (t === 0 && e._charge) return H.aoe(e, b, '断碑', 'fx3_slash_blue', 1.15, '#eef6ff');
      if (t === 2 && hs.length) { const P = hs[ri(0, hs.length - 1)]; await H.strike(e, b, P, '慢了半寸', 1.25, 'fx3_slash_gold'); if (P.alive) { P.gauge = Math.min(P.gauge || 0, -40); floatText(P.x, P.y - P.h - 30, '心乱', '#e6b0b8', 34); } return true; }
      await H.strike(e, b, hs[ri(0, hs.length - 1)], '雪剑', .95, 'fx3_slash_blue'); return true; };
    AI.r427_huwei19 = async (e, b) => { const hs = H.heroes(b), t = e.turn % 3;
      if (t === 2) return H.charge(e, '他双手举刀过顶，刀上的冰一层层厚起来——「冰浪」，防御！');
      if (t === 0 && e._charge) return H.aoe(e, b, '冰浪', 'fx3_slash_blue', 1.1, '#cfe6ff', (P, guarded) => { if (!guarded && P.alive) { P.gauge = -50; floatText(P.x, P.y - P.h - 30, '冻住', '#cfe6ff', 34); } });
      await H.strike(e, b, hs[ri(0, hs.length - 1)], '寸步不让', 1.05, 'fx3_slash_blue'); return true; };
  }
  async function fightElite(id, n) { const E = ELITE[id]; let en;
    if (E.vkey && window.R370_MAKE) { en = R370_MAKE({ id: 'r427_' + id, ep: E.ep, name: E.name, type: 'wolf', lv: E.lv, spd: E.spd, bg: E.bg, vkey: E.vkey, vh: E.vh, scale: 1 });
      en.hp = en.maxhp = Math.round(en.maxhp * E.hpK); en.atk = en._atk0 = Math.round(en.atk * E.atkK); en.lv = E.lv; en.name = E.name + ' Lv' + E.lv; en._wx = E.wx; en._famed = 1; }
    else { en = makeEnemy(E.stand, n === 1 ? 6 : 9); en.name = E.name + ' Lv' + E.lv; en._wx = E.wx; en.hp = en.maxhp = Math.round(en.maxhp * 2.4); en.atk = Math.round(en.atk * 1.15); }
    const bg = IMG[E.bg] ? E.bg : (n === 1 ? 'bg_tw1' : 'bg_tw2');
    const win = await startBattle({ title: '万妖塔 · 第' + '一二'[n - 1] + '层 · ' + E.name, bg, enemies: [en], exp: Math.round(expNeed(E.lv) * .35), gold: 200 + n * 100, boss: !!E.vkey, flee: false, tower: n });
    S.scene = drawMap; return win === true; }
  // ---------- 入梦时整屏换成梦里的雪山门 ----------
  async function inDream(fn) { const o = { t: 0, a: 0 }; o.draw = () => { const bg = IMG.bg_r427_dream; ctx.save(); ctx.globalAlpha = o.a; if (bg) ctx.drawImage(bg, 0, 0, W, H); else { ctx.fillStyle = '#dfe6ee'; ctx.fillRect(0, 0, W, H); }
      ctx.fillStyle = 'rgba(255,255,255,.75)'; const t = performance.now() / 1000; for (let i = 0; i < 70; i++) { const x = (i * 97.3 + t * (14 + i % 5 * 4)) % W, y = (i * 53.1 + t * (30 + i % 7 * 6)) % H; ctx.fillRect(x, y, 2 + i % 3, 2 + i % 3); } ctx.restore(); };
    S.overlay.push(o); try { for (let i = 0; i <= 12; i++) { o.a = i / 12; await nextFrame(); } return await fn(); } finally { const k = S.overlay.indexOf(o); if (k >= 0) S.overlay.splice(k, 1); } }
  // ---------- 一层 · 忘川泉 ----------
  async function wen() { const T = T7();
    if (T.wen === 2) return;
    if (!T.wenSeen) { T.wenSeen = 1; await L(TXT.wenMeet); } else await L(TXT.wenAgain);
    const i = await choose('温行舟', ['入梦', '先不管']); if (i !== 0) return;
    world.locked = true;
    try { await fadeOut(300); let win = false;
      await inDream(async () => { await fadeIn(300); await L(TXT.dream); await fadeOut(240); win = await fightElite('xinmo', 1); });
      if (!win) { partyRevive(.3); await fadeIn(260); await L(TXT.dreamLose); return; }
      T.wen = 1; await fadeIn(300); S.flash = .6; S.flashColor = '#ffd0d8'; try { playSnd('sfx_heal', .7); } catch (e) {}
      await L(TXT.wenWake); await give('温行舟', [['w_zhaoxue', 1]]); await L(TXT.wenAfter);
      T.wen = 2; T.wenFade = performance.now(); } finally { world.locked = false; } }
  async function pond() { const T = T7(); if (T.wen !== 2) { await nar(TXT.pondBound); return; } if (RUN.f1.pond) { await nar(TXT.pondDone); return; }
    RUN.f1.pond = 1; partyRest(); S.flash = .4; S.flashColor = '#d8fff0'; try { playSnd('sfx_heal', .7); } catch (e) {} await nar(TXT.pond); toast('气血、灵力回满', 1800); }
  // ---------- 二层 · 演武场 / 烽火台 / 虎卫十九 ----------
  async function altar() { if (RUN.f2.nuo) { await nar(TXT.bowDone); return; }
    const i = await choose('十九尊虎卫冰像', ['向冰像行一礼', '走开']); if (i !== 0) return;
    RUN.f2.nuo = 1; try { playSnd('sfx_wind', .6); } catch (e) {} await L(TXT.bow); toast('虎卫之诺：这一回打玄锋，全队受的伤少一成', 3200); }
  async function lu() { const T = T7(); if (T.lu) return; world.locked = true;
    try { await L(TXT.luMeet); await fadeOut(220); const win = await TOWER.fightMobs(2, ['tw_bingjia', 'tw_bingjia', 'tw_bingjia']); await fadeIn(240);
      if (!win) { partyRevive(.3); await L(TXT.luLose); return; }
      T.lu = 1; await L(TXT.luAfter); await give('陆不归', [['m_qnhantie', 1]]); await L(TXT.luAfter2); T.luGone = performance.now(); } finally { world.locked = false; } }
  async function hu() { const T = T7(); if (T.hu) return false; world.locked = true;
    try { await L(TXT.huMeet); await fadeOut(220); const win = await fightElite('huwei19', 2); await fadeIn(240);
      if (!win) { partyRevive(.3); await L(TXT.huLose); return true; }
      T.hu = 1; S.flash = .6; S.flashColor = '#e8f4ff'; await L(TXT.huAfter); await give('虎卫十九', [['r_shuangwen', 1]]); return true; } finally { world.locked = false; } }
  // 东边那个绞盘：虎卫十九没打过，不让转
  window.R427_MECH = async (n, o) => { if (n !== 2 || !ON2() || !o || o.name !== 'winch_24_12' || T7().hu) return false; await hu(); return true; };
  // 场景物件换态：梦丝（缠着 / 断了）、香案（冷 / 点上）
  window.R427_STATE = (n, o) => { if (o.name === 'dream_threads') return T7().wen ? 'broken' : 'bound'; if (o.name === 'altar') return RUN.f2.nuo ? 'lit' : 'cold'; return null; };
  // 虎卫之诺：打玄锋那一仗，全队受的伤少一成
  let NUO = false;
  { const fb = TOWER.fightBoss; TOWER.fightBoss = async function (n) { NUO = n === 2 && !!RUN.f2.nuo; try { return await fb.apply(this, arguments); } finally { NUO = false; } }; }
  applyDamage = (orig => function (t, d, crit, opts) { try { if (NUO && t && t.side === 'hero' && d > 0) d = Math.max(1, Math.round(d * .9)); } catch (e) {} return orig.call(this, t, d, crit, opts); })(applyDamage);
  // ---------- 摆进地图：看不见的点（点了触发） + 人物画在地图里 ----------
  const P = MZ.P;
  function add(n) { const M = TMAPS['wyt_f' + n]; if (!M || M._r427 || !(n === 1 ? ON1() : ON2())) return; M._r427 = 1;
    const spot = (name, x, y, talk, extra) => { const [c, r] = P(x, y); M.npcs.push(Object.assign({ key: 'none', c, r, name, hidden: true, h: 120, wander: false, r427: 1, talk }, extra || {})); };
    if (n === 1 && ON1()) { spot('温行舟', POS.wen[0], POS.wen[1], wen, { cond: () => T7().wen !== 2 }); spot('忘川泉', POS.pond[0], POS.pond[1], pond, { h: 90 }); }
    if (n === 2 && ON2()) { spot('虎卫冰像', POS.altar[0], POS.altar[1] + 30, altar, { h: 90 }); spot('灰衣青年', POS.lu[0], POS.lu[1] + 60, lu, { cond: () => !T7().lu }); spot('虎卫十九', POS.hu[0], POS.hu[1], async () => { if (!(await hu())) await nar('（绞盘前只剩一片被踩实的雪。）'); }, { cond: () => !T7().hu }); }
    const objs = M.baked.objs, push = (name, x, y, w, h, sy) => objs.push({ id: 'r427_obj', uid: 'r427_' + n + '_' + name, img: MZ.key(n, 'base'), r427: { n, name }, x: x - w / 2, y: y - h, w, h, sy: sy == null ? y : sy, flat: false, flip: false, noBlock: true, noPre: true });
    if (n === 1 && ON1()) push('wen', POS.wen[0], POS.wen[1], 160, 240, POS.wen[1] + 2);
    if (n === 2 && ON2()) { push('lu', POS.lu[0], POS.lu[1], 160, 240, POS.lu[1] + 40); push('hu', POS.hu[0], POS.hu[1], 160, 240); } }
  add(1); add(2);
  const AT = (rel, f, nf) => { const a = im(rel); if (!a) return null; return [a, (f % nf) * 160, 0]; };
  drawBaked = (orig => function (o, now) { if (!o || o.id !== 'r427_obj') return orig.apply(this, arguments);
    const { name } = o.r427, T = T7(), t = performance.now() / 1000, x = o.x + 80, y = o.y + 240; let fr = null, alpha = 1, flip = false;
    if (name === 'wen') { if (T.wen === 2) { const k = T.wenFade ? (performance.now() - T.wenFade) / 2500 : 9; if (k >= 1) return; alpha = 1 - k; fr = AT('npc/wenxingzhou_wake', 0, 1); } else fr = AT('npc/wenxingzhou_bound', Math.floor(t * 4), 4); }
    else if (name === 'lu') { if (T.lu) { const k = T.luGone ? (performance.now() - T.luGone) / 900 : 9; if (k >= 1) return; alpha = 1 - k; } fr = T.lu ? AT('npc/lubugui_walk', 0, 1) : AT('npc/lubugui_hug', Math.floor(t * 6), 2); }
    else if (name === 'hu') { if (T.hu) return; fr = AT('npc/huwei19_stand', Math.floor(t * 5), 4); flip = true; }
    if (!fr) return; const [a, sx] = fr; ctx.save(); ctx.globalAlpha *= alpha;
    if (name !== 'lu' || T.lu) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y - 8, 24, 7, 0, 0, 7); ctx.fill(); }
    ctx.translate(x, y - 8); if (flip) ctx.scale(-1, 1); ctx.scale(.52, .52); ctx.drawImage(a, sx, 0, 160, 240, -80, -232, 160, 240); ctx.restore(); })(drawBaked);
  // 走进演武场那一下的话（只一回）；每次从外面进塔，这一趟的泉水、虎卫之诺清掉
  updateMap = (orig => function (dt) { const r = orig.apply(this, arguments);
    try { const n = MZ.curN(), p = world.player; if (n === 2 && ON2() && p && !world.locked && !dialog && !choice && !T7().plaza) { const [x0, y0, x1, y1] = POS.plaza; if (p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1) { T7().plaza = 1; world.locked = true; L(TXT.plaza).finally(() => { world.locked = false; }); } } } catch (e) {} return r; })(updateMap);
  tileSetMap = (orig => function (m) { const prev = world && world.mapName; const r = orig.apply(this, arguments); try { const mm = /^wyt_f(\d)$/.exec(m || ''); if (mm && prev !== m) RUN['f' + mm[1]] = {}; } catch (e) {} return r; })(tileSetMap);
  window.R427 = { TXT, POS, RUN, T7, fightElite, wen, pond, altar, lu, hu, ON1, ON2, add };
})();
