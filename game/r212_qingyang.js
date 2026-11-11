// ================= R212 · 青阳镇支线（作者 11-12：纯净版到女娲秘境前为止，青阳镇的铺子和房子要用起来，加有含金量的小故事）=================
// 六段内容，都在青阳镇里完成，不挡主线：
//   A【青阳镇】黑风寨的账本 —— 推理：找出把林家行踪卖给黑风寨的内应（茶馆 / 聚宝斋 / 悦来客栈），收尾接上苍月城的伏笔
//   B 三十年的桂花酿 —— 醉仙楼丢酒案：问话、看地窖，真相和抉择
//   C 十年剑穗 —— 倚翠楼（新开的房子）琴师苏晚等一个天剑宗弟子等了十年
//   D 长乐坊 —— 赌坊（新开的房子）出千：看懂庄家的手法，三把赢回货郎的担子
//   E 陨星护腕 —— 隐藏装备，不进任务栏：说书先生 → 洗衣姑娘 → 歪脖子柳 → 王铁匠
//   F 平安符 —— 庙会之夜的林溪（她一厢情愿；叶孤星只当她是妹妹，并且当面说清楚）
// 新房子不新画图：借用试玩版走不到的苍月城两间屋子的室内图（桂影院正屋 → 倚翠楼，城主府东厢客舍 → 长乐坊后堂）。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.qy_town || !window.SQ_DEFS) return;
  const F = () => (S.flags = S.flags || {});
  const st = id => ((F().sq = F().sq || {})[id] = F().sq[id] || { s: 0, n: 0 });
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const YE = '叶孤星', XX = '星旋';
  const afterCamp = () => { const f = F(); return !!(f.ch3_night || f.ch3_city || f.ch3 || f.ch3_report); };   // 黑风寨已经打完
  const inTown = () => !!F().ch2_plan || afterCamp();
  const lvUp = () => Math.max(0, (S.hero.lv || 11) - 11);

  function hook(mid, name, fn) {
    const M = TMAPS[mid], n = M && (M.npcs || []).find(n => n.name === name && !n.hidden);
    if (!n) { console.warn('R212：找不到', mid, name); return null; }
    const orig = n.talk;
    n.talk = async function (a) {
      let done = false; try { done = await fn(n); } catch (e) { console.warn('R212', name, e); }
      if (done) { if (n.shop) { const sh = n.shop; n.shop = null; setTimeout(() => { n.shop = sh; }, 0); } return; }
      if (typeof orig === 'function') return orig.call(this, a);
      const A = Array.isArray(orig) ? orig : [orig || '……'], pick = n.random ? [A[Math.floor(Math.random() * A.length)]] : A; for (const l of pick) await say(n.name, l);
    };
    return n;
  }
  const npc = (mid, cx, x, y, name, talk, extra) => { if (Array.isArray(x)) { extra = talk; talk = name; name = y; } const [c, r] = Array.isArray(x) ? x : P(x, y); const n = Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk }, extra || {}); (TMAPS[mid].npcs = TMAPS[mid].npcs || []).push(n); return n; };
  const spotNpc = (mid, x, y, name, talk, extra) => { const [c, r] = P(x, y); const n = Object.assign({ key: 'none', c, r, name, hidden: true, h: 110, talk }, extra || {}); (TMAPS[mid].npcs = TMAPS[mid].npcs || []).push(n); return n; };
  async function gain(title, items, gold, exp) {
    const h = S.hero, lv0 = h.lv, show = [];
    for (const [id, n] of items || []) { addItem(id, n); const it = ITEM_DB[id] || {}; show.push({ icon: 'item:' + id, id, name: it.name || id, count: '×' + n, desc: it.desc || '' }); }
    if (gold) { h.gold = (h.gold || 0) + gold; show.push({ icon: 'gold', name: '灵石', count: '×' + gold }); }
    try { playSnd('jingle_win'); } catch (e) {}
    if (show.length) { if (window.itemGet) await itemGet(show, title); else await showPanel(title, show.map(s => '!' + s.name + ' ' + s.count)); }
    if (exp) { const ups = typeof gainExp === 'function' ? gainExp(exp) : 0; toast('修为 +' + exp, 1800); if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0); }
  }
  async function fight(cfg) {
    await fadeOut(220); const pr = startBattle(Object.assign({ bg: 'bg_night', exp: 0, gold: 0, normalBgm: true }, cfg)); await fadeIn(220);
    const win = await pr; S.scene = drawMap; await fadeIn(200);
    if (!win || win === 'flee') { try { partyRevive(.4); } catch (e) { S.hero.hp = Math.max(1, Math.round(S.hero.maxhp * .4)); } return false; }
    return true;
  }
  const human = (name, key, hp, atk, def, extra) => Object.assign({ name, key: (typeof IMG !== 'undefined' && IMG[key]) ? key : 'e_grunt', hp, maxhp: hp, atk, def, spd: 12, h: 250, color: '#665' }, extra || {});
  // 任务栏用：按进度变的目标说明
  const Q = (o, goals) => { const q = Object.assign({ type: 'kill', kill: { maps: ['__r212__'], mobs: ['__r212__'] }, reward: {} }, o);
    Object.defineProperty(q, 'goal', { enumerable: true, get() { const s = st(o.id); return goals[Math.min(goals.length - 1, s.n)] || goals[0]; } }); SQ_DEFS.push(q); return q; };

  // ---------------- 物品 ----------------
  Object.assign(ITEM_DB, {
    c_guihua: { name: '桂花香囊', slot: 'acc', maxhp: 60, def: 3, price: 0, desc: '阿蘅用她爹当年晒的陈桂花缝的香囊。三十年了，凑近还闻得到一点甜。' },
    c_jiansui: { name: '故人剑穗', slot: 'acc', atk: 6, maxmp: 30, price: 0, desc: '天剑宗内门弟子沈舟的剑穗。在青阳镇的琴案上放了十年，终于要回家了。' },
    c_tongling: { name: '走街铜铃', slot: 'acc', spd: 3, maxhp: 40, price: 0, desc: '货郎走街串巷摇了半辈子的铜铃。「听见铃响就知道是我来了——少侠带着它，走到哪儿都有人给开门。」' },
    c_pingan: { name: '平安符', slot: 'acc', maxhp: 50, def: 2, price: 0, desc: '林溪亲手绣的平安符，针脚歪歪扭扭，绣的是青阳镇的柳叶。绣了三个晚上。' },
    c_yunxing: { name: '陨星护腕', slot: 'acc', atk: 10, def: 4, spd: 2, price: 0, desc: '三十年前坠进青阳河的天外陨铁，王铁匠照着他师父留下的图样打的。戴上去腕子发沉，出剑反倒更稳。' },
    m_yuntie: { name: '陨铁', price: 0, desc: '拳头大的一块黑石头，沉得出奇，敲一下嗡嗡作响。也许该拿给懂行的人看看。' },
    k_shenxin: { name: '未写完的信', price: 0, desc: '一封没写完的信，纸已经发黄。抬头两个字：「晚娘」。' },
  });

  // =====================================================================================
  // 新房子：倚翠楼、长乐坊（借苍月城两间屋子的室内图）
  // =====================================================================================
  function cloneRoom(id, src, title, doorXY, label) {
    const T = TMAPS[src]; if (!T) { console.warn('R212：缺室内图', src); return false; }
    const back = P(doorXY[0], doorXY[1] + 46), ex0 = (T.exits || [])[0] || { x: 27, y: 58, w: 9, h: 3 };
    TMAPS[id] = Object.assign({}, T, { title, npcs: [], chests: [], onEnter: null, doors: [], exits: [Object.assign({}, ex0, { to: 'qy_town', at: back, face: 'down', label: '出门 · 青阳镇', cond: null, msg: '' })] });
    try { if (typeof MAP_ZOOM === 'object' && MAP_ZOOM[src] && !MAP_ZOOM[id]) MAP_ZOOM[id] = MAP_ZOOM[src]; } catch (e) {}
    TMAPS.qy_town.doors.push({ x: doorXY[0], y: doorXY[1], rw: 30, rh: 20, to: id, at: T.start || [7.7, 12.1], face: 'up', label, cond: () => inTown(), msg: '门关着。' });
    return true;
  }
  const HAS_YC = cloneRoom('qy_yicui', 'm_cy_guiying', '倚翠楼 · 临河阁', [2080, 358], '倚翠楼');
  const HAS_CL = cloneRoom('qy_changle', 'm_cy_guest', '长乐坊 · 后堂', [737, 358], '长乐坊');

  // =====================================================================================
  // A【青阳镇】黑风寨的账本
  // =====================================================================================
  const QA = Q({ id: 'qy_ledger', name: '【青阳镇】黑风寨的账本', giver: ['qy_town', '林府管事'], where: '青阳镇 · 林府门口 · 林府管事', cond: afterCamp, n: 4,
    desc: '黑风寨的账本里，每月有一笔「茶钱」付给镇上某个人，买的是林家车队和小姐出门的日子。林溪那天在林子里遇袭，不是碰巧。',
    reward: { exp: 520, gold: 500, items: [['juan3', 1]] } },
    ['照账本上的三条线索查：茶馆（初五的茶）、聚宝斋（戌时后门）、悦来客栈（左手缺一指）', '还差两条线索：茶馆 / 聚宝斋 / 悦来客栈', '还差一条线索：茶馆 / 聚宝斋 / 悦来客栈', '线索齐了——去悦来客栈，当面指认那个人', '回林府门口，把密信交给林府管事', '回林府门口，把密信交给林府管事']);
  const qa = () => st('qy_ledger'), clue = k => { const f = F(); if (f['qa_' + k]) return false; f['qa_' + k] = 1; const s = qa(); s.n = Math.min(3, (f.qa_tea ? 1 : 0) + (f.qa_shop ? 1 : 0) + (f.qa_inn ? 1 : 0)); toast('【青阳镇】黑风寨的账本　线索 ' + s.n + ' / 3', 2200); return true; };
  npc('qy_town', 'steward_elder', 1416, 905, '林府管事', async () => {
    const s = qa();
    if (s.s === 3) { await say('林府管事', '家主已经把密信抄了一份，连夜送去天剑宗据点。少侠的恩情，林家记下了。'); return; }
    if (s.s === 1 && s.n >= 4) {
      await L([['林府管事', '（看完密信，手都在抖）……「凝丹修士三十，月底前送抵苍月城北」。他们抓人，是要送去苍月城？'], [YE, '黑风寨只是个幌子。背后要人的，另有其主。'], [XX, '（苍月城北……小子，这事比一窝山贼大得多。记着这个地名。）'],
        ['林府管事', '老朽这就去禀报家主。少侠查得干净利落，还替小姐讨回了公道——这是林家的一点心意，万勿推辞。']]);
      s.s = 3; await gain('委托完成 · 黑风寨的账本', QA.reward.items, QA.reward.gold, QA.reward.exp); return; }
    if (s.s === 1) { await say('林府管事', '账本上三条线索：「初五·茶三斤·老地方」「银货两讫，戌时后门」「此人左手缺一指」。少侠多留心茶馆、聚宝斋和悦来客栈。'); return; }
    if (!afterCamp()) { await say('林府管事', '家主正在厅里议事，少侠里面请。'); return; }
    await L([['林府管事', '叶少侠留步。家主有件事，不便在府里说，命老朽在这儿等您。'], ['林府管事', '清点黑风寨缴回来的东西，翻出一本账。每月都有一笔「茶钱」，付给镇上的某个人——买的，是林家车队出镇、还有小姐出门的日子。'],
      [YE, '……林溪那天在林子里被围，不是碰巧。'], ['林府管事', '是。这个人还在镇上。家主不愿声张，怕打草惊蛇，想请少侠暗中查一查。'],
      ['林府管事', '账上没有名字，只有三句话：「初五·茶三斤·老地方」「银货两讫，戌时后门」「此人左手缺一指」。']]);
    const k = await choose('【青阳镇】黑风寨的账本', ['接下（报酬：' + SQ_REWARD_TEXT(QA) + '）', '下次再说']); if (k !== 0) return;
    s.s = 1; s.n = 0; try { playSnd('ui_confirm'); } catch (e) {} toast('接取：黑风寨的账本 —— 去茶馆、聚宝斋、悦来客栈打听', 3000);
    await say(XX, '（茶、后门、缺一指。三句话三个地方——小子，别急着抓人，先把三句话都对上。）');
  }, { cond: () => afterCamp(), h: 116 });
  hook('qy_tea', '茶客', async () => { if (qa().s !== 1 || F().qa_tea) return false;
    await L([[YE, '打听个事。每月初五，有没有人来买三斤茶？'], ['茶客', '初五？有啊！悦来客栈住着的那位行商，雷打不动，每月初五来买三斤最便宜的粗茶。'], ['茶客', '怪就怪在——他买了从来不喝，拎着就走。我还笑他：做买卖的人，喝不出好赖？'],
      ['茶客', '还有一桩，他掏钱从来只用右手，左手总揣在袖子里，大夏天也揣着。']]);
    clue('tea'); await say(XX, '（粗茶不是拿来喝的——是个记号。「老地方」就是这间茶馆。）'); return true; });
  hook('qy_treasure', '聚宝斋掌柜', async () => { if (qa().s !== 1 || F().qa_shop) return false;
    await L([[YE, '掌柜，贵店的后门，戌时以后有人来过么？'], ['聚宝斋掌柜', '（脸色一变）客官这话……唉，实不相瞒，是有一位。每月总有那么一两回，戌时过后敲后门，卖些零碎首饰，说是家传的，急着用钱。'],
      ['聚宝斋掌柜', '小店贪便宜收了几回。可上个月他拿来一只小孩的长命锁，背面刻着个「王」字……老朽越想越不对，没敢收，也没敢问。'], [YE, '是谁？'],
      ['聚宝斋掌柜', '悦来客栈的住客。天黑，他又总低着头，老朽只记得一样：他递东西用右手，左手戴着只鹿皮手套，从来不摘。']]);
    clue('shop'); F().qa_lock = 1; await say(XX, '（长命锁，刻着「王」字……镇上王婆婆的孙子，不就是被黑风寨抓走的？这人卖的是山贼的赃。）'); return true; });
  hook('qy_inn', '店小二', async () => { if (qa().s !== 1 || F().qa_inn) return false;
    await L([[YE, '小二哥，店里的客人，可有左手缺了指头的？'], ['店小二', '缺指头的？喏，窗边喝酒那位张木匠——不过客官，他缺的是右手小指，刨木头刨的，全镇都知道，他自己还拿这个劝人别喝酒干活。'],
      ['店小二', '左手嘛……天字房那位行商，住了快三个月了，左手一直戴着手套，吃饭都不摘。有回我添茶碰了一下，那手套的小指头是瘪的。'], ['店小二', '他每月总有几天半夜才回来，问就说去收账。这镇上哪有那么多账好收……']]);
    clue('inn'); await say(XX, '（一个明着缺右手，一个藏着缺左手。账本上写的是哪只手，小子，你可记清楚。）'); return true; });
  async function accuse() {
    const s = qa(); if (s.s !== 1 || s.n < 3 || s.n >= 4) return false;
    await say(XX, '（三条线索都对上了。小子，说吧——是谁？）');
    for (;;) {
      const k = await choose('把林家的行踪卖给黑风寨的人是——', ['窗边喝酒的张木匠', '天字房的行商', '客栈掌柜', '再想想']);
      if (k === 3 || k < 0) return true;
      if (k === 0) { await L([['喝酒的汉子', '我？！少侠你看清楚——（伸出右手）我缺的是这只！刨子啃的，镇上谁不知道？'], [XX, '（账本写的是左手。明晃晃摆在外头的，往往不是你要找的。）']]); continue; }
      if (k === 2) { await L([['客栈掌柜', '哎哟我的仙长！小店十个指头齐齐全全（伸出两只手），您数数！'], [XX, '（……你是数都不数就开口啊。）']]); continue; }
      break;
    }
    await L([[YE, '这位掌柜的。每月初五，三斤粗茶；戌时后门，山贼的赃物——还有，劳驾把左手的手套摘了。'], ['行商', '……少侠说笑了。在下做的是正经买卖——'], ['', '话没说完，他猛地掀翻桌子，撞开后窗跳了出去。'], [YE, '追！']]);
    const lv = lvUp();
    await L([['', '河边石滩。那人被逼到水边，索性一把扯下手套——左手小指齐根而断，断口发黑，缠着一圈暗红的符纹。'], ['行商', '天剑宗的小崽子……你们毁了黑风寨，坏了谷里多大的事，你知不知道？'], [XX, '（断指炼魂——炼魂谷的暗桩！小心，这人至少凝丹一重！）']]);
    const win = await fight({ title: '炼魂谷暗桩', enemies: [human('行商（炼魂谷暗桩）', 'e_xiexiu', 1500 + lv * 90, 44 + lv * 3, 12, { boss: true, xie: true, h: 255 })], exp: 260, gold: 200, boss: true });
    if (!win) { await say(XX, '（先缓口气。他受了伤跑不远，还在河滩上——回客栈再来。）'); return true; }
    F().qa_caught = 1; s.n = 4;
    await L([['', '那人倒在石滩上，怀里滑出一封火漆封口的密信。'], ['行商', '……没用的。黑风寨没了，还有别的寨子。谷里要的人，一个都不会少……'], ['', '林家的护卫闻声赶到，把人捆了。叶孤星拆开密信，只看了一行，眉头就皱了起来。'],
      [YE, '「凝丹修士三十，月底前送抵苍月城北」……'], [XX, '（先交给林家。这封信，够他们睡不着觉的了。）']]);
    toast('【青阳镇】黑风寨的账本 —— 回林府门口找林府管事', 2800);
    if (F().qa_lock) await say(XX, '（对了，那只长命锁还在聚宝斋掌柜那儿压着。有空替王婆婆要回来。）');
    return true;
  }
  { const n = hook('qy_inn', '行商', async () => { const s = qa(); if (s.s === 1 && s.n >= 3 && s.n < 4) return accuse(); if (s.s === 1 && s.n < 3) { await say('行商', '（低头喝茶）……少侠有事？在下只是个过路做买卖的。'); return true; } return false; });
    if (n) { const c0 = n.cond; n.cond = () => !F().qa_caught && (!c0 || c0()); }
    hook('qy_inn', '喝酒的汉子', async () => { const s = qa(); if (s.s === 1 && s.n >= 3 && s.n < 4) return accuse(); return false; });
    hook('qy_inn', '客栈掌柜', async () => { const s = qa(); if (s.s === 1 && s.n >= 3 && s.n < 4) { const k = await choose('客栈掌柜', ['（当众指认内应）', '只是随便问问']); if (k === 0) return accuse(); } return false; }); }
  // 尾声：王婆婆孙子的长命锁
  hook('qy_treasure', '聚宝斋掌柜', async () => { const f = F(); if (!f.qa_caught || !f.qa_lock || f.qa_lock >= 2) return false;
    await L([['聚宝斋掌柜', '人抓住了？！老天……那只长命锁老朽一直没敢收，他押在柜上说过几天来取。少侠拿去，物归原主吧。'], ['聚宝斋掌柜', '往后戌时以后，小店的后门再也不开了。']]); f.qa_lock = 2; toast('拿到：刻着「王」字的长命锁（交给王婆婆）', 2600); return true; });
  hook('qy_town', '王婆婆', async () => { const f = F(); if (f.qa_lock !== 2) return false;
    await L([[YE, '婆婆，这个是不是您家的？'], ['王婆婆', '（接过去，手抖得厉害）……是、是我孙子的长命锁！他满月那天我亲手给戴上的……被抓走那天，叫那帮天杀的扯了去。'],
      ['王婆婆', '孙子回来了，锁也回来了……老婆子没什么好东西，这几颗丹药是孙子在山上采药换的，少侠一定收下。']]);
    f.qa_lock = 3; await gain('王婆婆的谢礼', [['p_big', 2], ['p_mp', 2]], 0, 120); return true; });

  // =====================================================================================
  // B 三十年的桂花酿
  // =====================================================================================
  const QB = Q({ id: 'qy_wine', name: '三十年的桂花酿', giver: ['qy_tavern', '醉仙楼掌柜'], where: '青阳镇 · 醉仙楼 · 掌柜', cond: inTown, n: 4,
    desc: '醉仙楼压箱底的三坛三十年桂花酿，一夜之间从地窖里不见了。窖门的锁好好的。', reward: { exp: 300, gold: 240 } },
    ['在醉仙楼里问话、看地窖口；厨子在楼外街上', '再多问几个人（刀客 / 书生 / 厨子 / 地窖口）', '再多问一处（刀客 / 书生 / 厨子 / 地窖口）', '心里有数了——去和弹琵琶的阿蘅谈谈', '把结果告诉醉仙楼掌柜', '把结果告诉醉仙楼掌柜']);
  const qb = () => st('qy_wine'), bclue = k => { const f = F(); if (f['qb_' + k]) return; f['qb_' + k] = 1; const s = qb(); const n = ['dao', 'shu', 'chu', 'jiao'].filter(x => f['qb_' + x]).length; if (s.n < 3) { s.n = Math.min(3, n); toast('三十年的桂花酿　线索 ' + s.n + ' / 3', 2000); } };
  hook('qy_tavern', '醉仙楼掌柜', async () => {
    const s = qb(), f = F();
    if (s.s === 3) return false;
    if (s.s === 1 && s.n >= 4) {
      const way = f.qb_way || 1;
      if (way === 3) await L([[YE, '掌柜的，酒是阿蘅姑娘拿的。'], ['醉仙楼掌柜', '什么？！我供她吃住，她竟然——'], ['弹琵琶的姑娘', '（放下琵琶，走过来）掌柜，是我。两坛在柴房，一口没动。另一坛……我倒在我爹坟前了。今天是他的忌日。']]);
      else await L([[way === 2 ? '弹琵琶的姑娘' : YE, way === 2 ? '掌柜，那三坛酒是我拿的。两坛在柴房，一口没动。另一坛……我倒在我爹坟前了。今天是他的忌日。' : '掌柜的，酒找到了，两坛在柴房，一口没动。拿酒的人，想亲口跟你说。'], ...(way === 2 ? [] : [['弹琵琶的姑娘', '是我。另一坛，我倒在我爹坟前了。今天是他的忌日。']])]);
      await L([['醉仙楼掌柜', '……你爹？'], ['弹琵琶的姑娘', '老桂。三十年前，醉仙楼的酿酒师傅。那三坛，是他亲手封的。'], ['', '掌柜张了张嘴，半天没说出话来。'],
        ['醉仙楼掌柜', '……老桂封坛那年，我还是个跑堂的。他教我认的头一种酒，就是桂花酿。后来东家换了人，嫌他工钱高……我那时候说不上话。'],
        ['醉仙楼掌柜', '那一坛，不算偷。算醉仙楼欠他的——晚了三十年，敬他的。'], ['醉仙楼掌柜', '剩下两坛，今晚照开。第一碗谁也不许动——阿蘅，你替你爹尝。'],
        ['弹琵琶的姑娘', '（眼眶红了，深深一福）……多谢掌柜。'], [XX, '（啧。本器灵差点以为是桩偷酒的案子，结果是桩还酒的。）']]);
      s.s = 3;
      if (way === 3) { await say('醉仙楼掌柜', '少侠查得明白。小店一点心意。'); await gain('支线完成 · 三十年的桂花酿', [['p_big', 2]], QB.reward.gold, QB.reward.exp); }
      else { await say('弹琵琶的姑娘', '少侠没有当众拆穿我，还肯听我把话说完。这个香囊里是我爹当年晒的桂花……不值钱，可我只有这个了。'); await gain('支线完成 · 三十年的桂花酿', [['c_guihua', 1]], QB.reward.gold, QB.reward.exp); }
      return true; }
    if (s.s === 1) { await say('醉仙楼掌柜', '少侠问出什么没有？昨晚留在店里的就那三位：外地刀客、醉书生、弹琵琶的阿蘅。钥匙只有我和厨子有。'); return true; }
    if (!inTown()) return false;
    const k0 = await choose('醉仙楼掌柜', ['掌柜的脸色不大好，出什么事了？', '买东西']); if (k0 !== 0) return false;
    await L([['醉仙楼掌柜', '唉！少侠有所不知，小店压箱底的三坛三十年桂花酿，本打算庙会上开坛的——昨夜从地窖里不见了！'], ['醉仙楼掌柜', '窖门的锁好好的，没撬过。昨晚留在店里的就三个人：那个外地刀客、喝醉的书生、还有弹琵琶的阿蘅。钥匙只有我和厨子有。'],
      ['醉仙楼掌柜', '依我看就是那刀客！来路不明，成天板着脸。可我没凭没据，又打不过他……少侠是天剑宗的人，能不能替小店问一问？']]);
    const k = await choose('支线 · 三十年的桂花酿', ['接下（报酬：修为 +300、灵石 240，另有谢礼）', '下次再说']); if (k !== 0) return true;
    s.s = 1; s.n = 0; try { playSnd('ui_confirm'); } catch (e) {} toast('接取支线：三十年的桂花酿 —— 在醉仙楼问话，再看看地窖口', 3000); return true;
  });
  hook('qy_tavern', '外地刀客', async () => { if (qb().s !== 1 || F().qb_dao) return false;
    await L([[YE, '昨夜地窖丢了酒。掌柜的怀疑你。'], ['外地刀客', '（冷笑）我滴酒不沾。练刀的手，不能抖。'], ['外地刀客', '昨晚我在后院练刀到三更。倒是听见地窖那边有人哼曲子——调子很老，我小时候听我娘哼过。贼会一边偷一边哼曲子？']]);
    bclue('dao'); return true; });
  hook('qy_tavern', '醉醺醺的书生', async () => { if (qb().s !== 1 || F().qb_shu) return false;
    await L([[YE, '你这一身酒气……'], ['醉醺醺的书生', '嗝——少、少侠冤枉！我喝的是三文一碗的烧刀子。桂花酿？甜的，我嫌腻。'], ['醉醺醺的书生', '不过昨夜我趴在这桌上，是闻见一阵桂花香从楼梯口飘过去。还「叮」的一声，像是什么弦碰着了酒坛子……然后我就又睡着了。']]);
    bclue('shu'); return true; });
  hook('qy_town', '醉仙楼厨子', async () => { if (qb().s !== 1 || F().qb_chu) return false;
    await L([[YE, '地窖的钥匙，你一直带在身上？'], ['醉仙楼厨子', '挂腰上呢，睡觉都不摘！……哦，就前天，阿蘅那丫头帮我缝围裙，围裙解下来搭在灶台边，钥匙也在那儿搁了小半个时辰。那丫头手巧，人也老实。'],
      ['醉仙楼厨子', '说起来她也是苦命。她爹老桂，三十年前就是这楼里的酿酒师傅，那三坛桂花酿还是他封的呢。后来东家换人，把他辞了，没两年人就没了。']]);
    bclue('chu'); return true; });
  spotNpc('qy_tavern', 1180, 300, '地窖口', async () => { const s = qb();
    if (s.s !== 1) { await say('', '通往地窖的小门，锁着。门缝里透出一股凉丝丝的酒香。'); return; }
    await L([['', '地窖口的锁完好无损。地上留着三圈酒坛压出的印子，有一圈旁边的浮灰被什么东西扫过。'], ['', '门槛缝里卡着一片小小的、磨得发亮的玳瑁片——弹琵琶用的义甲。'], [XX, '（锁没坏，是用钥匙开的。至于这片指甲……小子，楼上谁弹琵琶？）']]);
    bclue('jiao'); }, { cond: () => qb().s === 1 });
  hook('qy_tavern', '弹琵琶的姑娘', async () => {
    const s = qb(); if (s.s !== 1) return false;
    if (s.n >= 4) { await say('弹琵琶的姑娘', '……少侠去和掌柜说吧。我就在这儿，不走。'); return true; }
    if (s.n < 3) { await say('弹琵琶的姑娘', '（低头调弦）……少侠要听曲么？今天只弹一支老调子。'); return true; }
    await L([[YE, '阿蘅姑娘。昨夜地窖里哼的那支老调子，是你今天要弹的这支吧。'], ['', '琵琶声停了。'], ['弹琵琶的姑娘', '……少侠都知道了。'],
      ['弹琵琶的姑娘', '今天是我爹的忌日。那三坛酒，是他这辈子最得意的手艺。封坛的时候他说，等开坛那天，要自己尝第一口。'], ['弹琵琶的姑娘', '他没等到。'],
      ['弹琵琶的姑娘', '我只倒了一坛在他坟前。剩下两坛在柴房，一口没动。我本打算今晚弹完这一曲，就去跟掌柜认。认了，这碗饭也就不吃了。']]);
    const k = await choose('怎么办？', ['「我去和掌柜说，酒找到了。剩下的话，你自己告诉他。」', '「这是你和掌柜之间的事。你去说，我在旁边。」', '「偷就是偷。我会如实告诉掌柜。」']);
    F().qb_way = k === 1 ? 2 : k === 2 ? 3 : 1; s.n = 4;
    await say('弹琵琶的姑娘', k === 2 ? '……应该的。少侠请便。' : '……多谢少侠。'); toast('三十年的桂花酿 —— 去找醉仙楼掌柜', 2400); return true;
  });

  // =====================================================================================
  // C 十年剑穗（倚翠楼）
  // =====================================================================================
  if (HAS_YC) {
    const QC = Q({ id: 'qy_tassel', name: '十年剑穗', giver: ['qy_yicui', '苏晚'], where: '青阳镇 · 倚翠楼（河边北首）· 琴师苏晚', cond: inTown, n: 2,
      desc: '倚翠楼的琴师苏晚，十年前救过一个养伤的天剑宗外门弟子。他留下一枚剑穗，说进了内门就回来。', reward: { exp: 360, gold: 0 } },
      ['镇上谁管山里的坟？去问问采药老人', '过东边石桥，去河东老槐树下看看那块剑碑', '回倚翠楼，告诉苏晚', '回倚翠楼，告诉苏晚']);
    const qc = () => st('qy_tassel');
    npc('qy_yicui', 'villager_f', [7.6, 6.6], '苏晚', async () => {
      const s = qc(), f = F();
      if (s.s === 3) { await say('苏晚', '琴还弹，只是不弹那一支了。公子，一路平安。'); return; }
      if (s.s === 1 && s.n >= 2) {
        const k = await choose('告诉苏晚', ['（把那封信交给她）「他回来过。七年前，就在镇口。」', '「他进了内门，闭关去了。你……别等了。」', '「还没打听到。」']);
        if (k === 2 || k < 0) { await say('苏晚', '不急。十年都等了。'); return; }
        if (k === 1) await L([['苏晚', '（静静看了他一会儿，笑了）公子不会说谎。'], ['苏晚', '他若是那样的人，当年就不会留这枚剑穗。……请公子告诉我实话。'], ['', '叶孤星沉默片刻，把那封发黄的信放在了琴案上。']]);
        else await say('', '叶孤星把那封发黄的信放在了琴案上。');
        await L([['', '「晚娘：我进内门了。走了三年才敢回来，是怕你等的那个人太没出息。」'], ['', '「到了镇口，才知道黑风寨在抢粮。等我片刻，办完这件事，就来听琴。」'], ['', '信到这里就断了。'],
          ['', '苏晚把信看了很久。窗外的河灯一盏一盏漂过去。'], ['苏晚', '……他到了镇口。'], ['苏晚', '原来这十年，他只离我一条街。'],
          ['', '她坐回琴案前，把那支弹了十年的曲子，从头到尾弹了最后一遍。'], ['苏晚', '我不等了。'], ['苏晚', '不是不等他——是不用等了。他来过了。'],
          ['苏晚', '这枚剑穗该回天剑宗。公子是他的同门，请替我……带他回家。'], [YE, '（双手接过）天剑宗弟子叶孤星，代沈师兄谢过苏姑娘十年。'], [XX, '（……）'], [XX, '（走吧，小子。让她一个人待会儿。）']]);
        s.s = 3; try { if (S.hero.bag && S.hero.bag.k_shenxin) delete S.hero.bag.k_shenxin; } catch (e) {}
        await gain('支线完成 · 十年剑穗', [['c_jiansui', 1]], 0, QC.reward.exp); return; }
      if (s.s === 1) { await say('苏晚', s.n === 0 ? '公子若有沈舟的消息……不论好坏，都请告诉我。' : '河东的老槐树……我十年没过那座桥了。'); return; }
      await L([['', '临河的小阁里焚着淡香。琴案后坐着一个素衣女子，案角压着一枚褪了色的青色剑穗。'], ['苏晚', '公子这身衣裳……是天剑宗的人？'], [YE, '是。'],
        ['苏晚', '恕我冒昧。贵宗外门，可有一位叫沈舟的弟子？'], ['苏晚', '十年前他路过青阳镇，受了伤，在我这儿听了三个月的琴。走的时候留下这枚剑穗，说等进了内门，就回来。'],
        ['苏晚', '我不懂修行的事。只是每年庙会，我都把他爱听的那支曲子弹一遍。今年是第十遍了。'], [YE, '外门弟子上千，我……不认得这个名字。']]);
      const k = await choose('支线 · 十年剑穗', ['「我替你打听。」（报酬：修为 +360，另有所托）', '下次再说']); if (k !== 0) return;
      s.s = 1; s.n = 0; try { playSnd('ui_confirm'); } catch (e) {}
      await L([['苏晚', '多谢公子。不论是什么消息，我都受得住。'], [XX, '（小子，天剑宗的弟子要是死在外头，同门会就地立一块剑碑。这镇上要是有，采药的、看坟的总该知道。）']]);
      toast('接取支线：十年剑穗 —— 去问问镇上的采药老人', 2800);
    }, { h: 116 });
    hook('qy_town', '采药老人', async () => { const s = qc(); if (s.s !== 1 || s.n !== 0) return false;
      await L([[YE, '老人家，这镇上有没有天剑宗弟子的剑碑？'], ['采药老人', '……有。河东那棵老槐树底下，就一块。后生，你是来接他的？'],
        ['采药老人', '七年前，黑风寨头一回下山抢粮。镇上没人敢拦。一个路过的天剑宗后生拦了——一个人，一把剑，挡了十几个。'], ['采药老人', '粮保住了。人没保住。'],
        ['采药老人', '是我给他收的殓。他怀里有封没写完的信，我不识字，可我想着总有一天有人来找，就一直收着。给你。']]);
      addItem('k_shenxin', 1); if (window.itemGet) await itemGet([{ icon: 'item:k_shenxin', id: 'k_shenxin', name: '未写完的信', count: '×1', desc: ITEM_DB.k_shenxin.desc }], '采药老人所托');
      s.n = 1; toast('十年剑穗 —— 过东边石桥往北，河东老槐树下有块剑碑', 3000); return true; });
    spotNpc('qy_town', 2605, 792, '河东剑碑', async () => { const s = qc();
      if (s.s === 1 && s.n === 1) {
        await L([['', '老槐树下立着一块半人高的青石碑，碑前压着几枝新折的野花。'], ['', '碑上刻着一行字：「天剑宗内门弟子沈舟之墓」。字是用剑刻的，很深，七年了还没被雨水磨平。'],
          [YE, '（内门弟子……他做到了。）'], ['', '叶孤星整了整衣襟，按天剑宗的规矩，对着石碑行了同门之礼。'], [XX, '（一个人一把剑，挡十几个山贼……这小子，死得不亏你们天剑宗的名头。）'], [YE, '沈师兄。有人等了你十年。我去替你回个话。']]);
        s.n = 2; toast('十年剑穗 —— 回倚翠楼告诉苏晚', 2600); return; }
      await say('', s.s === 3 ? '碑前的野花换了新的。旁边多了一小坛酒，封泥上按着一个琴弦的印子。' : '老槐树下立着一块青石碑，碑前压着几枝野花。');
    }, { cond: () => qc().s >= 1 });
  }

  // =====================================================================================
  // D 长乐坊
  // =====================================================================================
  if (HAS_CL) {
    const QD = Q({ id: 'qy_dice', name: '长乐坊', giver: ['qy_town', '货郎'], where: '青阳镇 · 街上的货郎', cond: inTown, n: 3,
      desc: '货郎在长乐坊连输十七把，担子和女儿的嫁妆钱都押了进去。他说那儿的骰子邪门。', reward: { exp: 320, gold: 300 } },
      ['去长乐坊（镇子西北角，民居隔壁）看看那张骰子桌', '先别急着下注——听听赌客们怎么说', '坐到桌前，和庄家赌三把', '回街上告诉货郎']);
    const qd = () => st('qy_dice');
    hook('qy_town', '货郎', async () => {
      const s = qd();
      if (s.s === 3) return false;
      if (s.s === 1 && s.n >= 3) {
        await L([['货郎', '担子！我的担子！……还有闺女的嫁妆钱，一文不少！'], ['货郎', '少侠，我这辈子再也不进那扇门了。这铃铛跟了我半辈子，走街串巷全靠它——您带着，比跟着我这个糊涂人强。']]);
        s.s = 3; await gain('支线完成 · 长乐坊', [['c_tongling', 1]], QD.reward.gold, QD.reward.exp); return true; }
      if (s.s === 1) { await say('货郎', '少侠……那桌子邪门得很，您可千万别把自己也搭进去。'); return true; }
      if (!inTown()) return false;
      const k0 = await choose('货郎', ['（他蹲在墙根，担子不见了）出什么事了？', '看看货']); if (k0 !== 0) return false;
      await L([['货郎', '……没了，全没了。担子押了，闺女的嫁妆钱也押了。'], ['货郎', '镇子西北角新开的长乐坊，我就想着赢两个钱给闺女添件首饰……那骰子邪门！我连押十七把大，开出来十七把小！'],
        [XX, '（十七把？小子，天底下没有这么巧的骰子。）']]);
      const k = await choose('支线 · 长乐坊', ['接下（报酬：' + '修为 +320、灵石 300，另有谢礼' + '）', '下次再说']); if (k !== 0) return true;
      s.s = 1; s.n = 0; try { playSnd('ui_confirm'); } catch (e) {} toast('接取支线：长乐坊 —— 镇子西北角，民居隔壁那扇门', 3000); return true;
    });
    const look = k => { const f = F(), s = qd(); if (s.s !== 1) return; f['qd_' + k] = 1; if (s.n < 1) s.n = 1; if (f.qd_a && f.qd_b && s.n < 2) { s.n = 2; toast('长乐坊 —— 看明白了，坐到桌前去', 2400); } };
    npc('qy_changle', 'tea_guest', [4.6, 8.4], '老赌客', async () => {
      if (qd().s !== 1) { await say('老赌客', '小赌怡情，小赌怡情……唉。'); return; }
      await L([['老赌客', '后生，看在你面善，告诉你个事。那庄家每回摇完盅，右手都要在桌沿上敲一敲。'], ['老赌客', '我盯了半个月：他敲的时候，眼睛从来不看盅——看的是台面上两堆银子。'], ['老赌客', '可看出来也没用。他是等大伙儿都下完注才敲的。']]);
      look('a'); });
    npc('qy_changle', 'drinker', [10.6, 8.6], '输红眼的汉子', async () => {
      if (qd().s !== 1) { await say('输红眼的汉子', '再来一把！这把一定翻本！'); return; }
      await L([['输红眼的汉子', '邪了门了！台面上哪边银子多，哪边准输！我跟着人多的押，输；跟着钱多的押，还是输！'], [XX, '（盅子底下有灵力波动——练气修士，隔着盅拨骰子。他不是赌，是哪边钱多就吃哪边。）']]);
      look('b'); });
    npc('qy_changle', 'bandit', [3.4, 5.6], '长乐坊打手', ['看什么看？要赌就上桌，不赌就滚。'], { face: 'right' });
    npc('qy_changle', 'bandit', [12, 5.6], '长乐坊打手', ['输了别赖账，这儿的规矩。'], { face: 'left' });
    npc('qy_changle', 'merchant', [7.6, 6.2], '庄家', async () => {
      const s = qd(), f = F();
      if (f.qd_won) { await say('', '骰子桌掀翻在地，人早跑没影了。'); return; }
      if (s.s !== 1) { await say('庄家', '这位公子面生。押大押小，买定离手——小店童叟无欺。'); return; }
      if (s.n < 2) { await L([['庄家', '公子要上桌？请。'], [XX, '（等等。你连他怎么赢的都没看明白，上去就是送钱。先听听这屋里的人怎么说。）']]); return; }
      await L([[YE, '我替那个货郎赌。赢了，他的担子和银子原样还他。'], ['庄家', '（笑）爽快。三把定输赢。输了嘛——公子腰上那把剑，看着值几个钱。']]);
      const R = [['第一把 —— 台面上：押「大」的银子堆成了山，押「小」的只有零星几枚', 1], ['第二把 —— 这回赌客们学乖了，纷纷改押「小」；押「大」的寥寥无几', 0]];
      for (let i = 0; i < R.length; i++) {
        for (;;) { const k = await choose(R[i][0], ['押大', '押小']); if (k === R[i][1]) { await L([['', '盅开——' + (k === 0 ? '四五六，大！' : '一二二，小！')], ['庄家', i === 0 ? '……公子好手气。' : '（额角见汗）……再来。']]); break; }
          await L([['', '盅开——' + (k === 0 ? '一一三，小。' : '五六六，大。')], [XX, '（记不记得那两个赌客说的？他吃的是钱多的那一边。）'], ['庄家', '这把不算数？行，公子是贵客，让你一把。']]); } }
      await say('', '第三把。庄家使了个眼色，两个打手各往「大」「小」两边压上一锭一模一样的银子——台面上，两边一般多了。');
      for (;;) { const k = await choose('第三把 —— 两边的银子一样多。他现在只盯着你一个人', ['押大', '押小', '（按住骰盅）「开盅之前，我想先看看盅底。」']);
        if (k === 2) break;
        await L([['', '盅开——恰好是你没押的那一边。'], [XX, '（两边一样多，他就只吃你。你押哪边，他都开另一边——除非骰子没法动。）'], ['庄家', '公子还剩一口气，再让你一把，免得说小店欺生。']]); }
      await L([['', '叶孤星一掌按在骰盅上，星力顺着掌心压了下去。'], ['', '盅里「咔」的一声——三枚骰子被两股力道夹在中间，竟自己立了起来，在盅底滴溜溜打转。满屋子的人都听见了。'],
        ['输红眼的汉子', '骰子……骰子自己在动？！'], ['老赌客', '隔盅拨骰！他是个修士——他一直在出千！'], ['庄家', '（脸色铁青，一脚踹翻了桌子）给脸不要脸……给我废了他！']]);
      const lv = lvUp();
      const win = await fight({ title: '长乐坊', enemies: [human('庄家（练气九重）', 'e_xiexiu', 980 + lv * 70, 38 + lv * 3, 10, { boss: true }), human('长乐坊打手', 'e_grunt', 420 + lv * 30, 30 + lv * 2, 7), human('长乐坊打手', 'e_grunt', 420 + lv * 30, 30 + lv * 2, 7)], exp: 220, gold: 160, boss: true });
      if (!win) { await say(XX, '（他们人多。缓一缓，回头再来掀这张桌子。）'); return; }
      f.qd_won = 1; s.n = 3;
      await L([['', '庄家带着打手从后门跑了。赌客们一拥而上，各自把输掉的银子从钱箱里数了回去。'], ['老赌客', '货郎的担子在后头柴房，我认得！少侠，我这就给他送去。'], [XX, '（十七把大十七把小。贪的人上钩，老实的人也上钩——这桌子掀得好。）']]);
      toast('长乐坊 —— 回街上告诉货郎', 2400);
    }, { h: 116 });
    for (const n of TMAPS.qy_changle.npcs) if (/打手|庄家/.test(n.name)) { const c0 = n.cond; n.cond = () => !F().qd_won && (!c0 || c0()); }
  }

  // =====================================================================================
  // E 隐藏：陨星护腕（不进任务栏，也没有任何标记）
  // =====================================================================================
  hook('qy_tea', '说书先生', async () => { const f = F(); if (f.qe) return false; if (!inTown()) return false;
    await L([['说书先生', '……话说三十年前，也是这么个夜里，一颗流星拖着青白的尾巴，「轰」地砸进了镇东的河里！'], ['说书先生', '第二天一早，河滩上的柳树一夜之间全朝着一个方向歪了过去——诸位猜，朝的是哪儿？'], ['说书先生', '欲知后事如何，且听下回分解！（一拍醒木）'],
      [XX, '（流星？……小子，这故事要是真的，那东西八成还在。）']]); f.qe = 1; return true; });
  hook('qy_town', '河边洗衣的姑娘', async () => { const f = F(); if (f.qe !== 1) return false;
    await L([[YE, '姑娘，这河滩上的柳树，哪一棵歪得最厉害？'], ['河边洗衣的姑娘', '最歪的？在下游，石桥边上、靠西岸的那一棵。歪得都快躺进河里了。'], ['河边洗衣的姑娘', '那树根底下有块黑石头，我们捶衣裳从来不用它——一棒槌下去，震得手麻，还「当当」响，跟敲钟似的。']]); f.qe = 2; return true; });
  spotNpc('qy_town', 2192, 1862, '歪脖子柳', async () => { const f = F();
    if (f.qe === 2) { await L([['', '一棵歪得几乎贴着地的老柳。树根把一块黑黝黝的石头裹在了里面，只露出拳头大的一角。'], ['', '叶孤星屈指一弹——「当」的一声，余音嗡嗡不绝。'], [XX, '天外陨铁！难怪柳树都朝着它长……这么大一块，够打一副护腕了。拿去给镇上的铁匠瞧瞧。']]);
      f.qe = 3; addItem('m_yuntie', 1); if (window.itemGet) await itemGet([{ icon: 'item:m_yuntie', id: 'm_yuntie', name: '陨铁', count: '×1', desc: ITEM_DB.m_yuntie.desc }], '歪脖子柳下'); return; }
    await say('', f.qe >= 3 ? '老柳树根底下多了个拳头大的坑。' : '一棵歪得几乎贴着地的老柳树。'); });
  hook('qy_smith', '王铁匠', async () => { const f = F(); if (f.qe !== 3 || !itemCount('m_yuntie')) return false;
    await L([['王铁匠', '少侠要打什么……（看见那块黑石头，锤子「咣当」掉在了地上）'], ['王铁匠', '这、这是陨铁？！我师父找了一辈子，临死都没见着一块……图样他倒是画好了，压在我枕头底下三十年。'], ['王铁匠', '少侠，这活儿我不收工钱。只要两百灵石的炭火——陨铁得烧三天三夜的旺火，寻常炭不顶用。']]);
    const k = await choose('王铁匠', ['打（200 灵石）', '先不打']); if (k !== 0) return true;
    if ((S.hero.gold || 0) < 200) { await say('王铁匠', '灵石不够？不急，陨铁我替你收着图样，凑够了再来。'); return true; }
    S.hero.gold -= 200; try { const b = S.hero.bag; if (b.m_yuntie) { b.m_yuntie--; if (b.m_yuntie <= 0) delete b.m_yuntie; } } catch (e) {}
    await L([['', '炉火烧得发白。王铁匠光着膀子抡了整整一夜的锤，每一锤落下去，火星都是青色的。'], ['王铁匠', '成了。（捧着护腕看了半天）师父，您的图样，徒弟替您打出来了。'], ['王铁匠', '拿去吧少侠。这东西跟着我只能压箱底，跟着你，才算没白从天上掉下来。']]);
    f.qe = 4; await gain('王铁匠打成的', [['c_yunxing', 1]], 0, 200); return true; });

  // =====================================================================================
  // F 平安符（庙会之夜的林溪）
  // =====================================================================================
  const fairNow = () => !!(F().ch3_night && !F().ch3_city);
  { const [c, r] = P(1345, 1705);
    TMAPS.qy_town.npcs.push({ key: 'n_linyi', c, r, name: '林溪', h: 100, wander: false, face: 'down', cond: () => fairNow(), talk: async () => {
      const f = F();
      if (f.qf_done) { await say('林溪', '叶大哥快去找云霆哥吧！他一个人在桥那边练了一晚上了。……我、我再看会儿灯。'); return; }
      await L([['', '灯谜摊旁边，林溪提着一盏兔子灯，踮着脚往街口张望。一回头看见叶孤星，灯差点脱了手。'], ['林溪·惊', '叶、叶大哥！好巧……我不是在等你！我就是、就是出来看灯！'],
        ['扎辫子的小丫头', '姐姐在这儿站了一个时辰啦！糖人都化了！'], ['林溪·羞', '小、小孩子别乱说话！'], [YE, '你爹肯放你出门了？'], ['林溪', '我带了四个护卫呢，都在街口……叶大哥，我买了两盏河灯，多了一盏。你、你要不要一起放？']]);
      await L([['', '河边。两盏河灯晃晃悠悠漂进了水里，和满河的灯火混在一处。'], ['林溪', '叶大哥，你许了什么愿？'], [YE, '愿云霆那家伙别再折腾自己的伤。还有，早点把魔族的事查清楚。'],
        ['林溪', '……没、没有别的了？'], [YE, '有。愿你爹少操点心，你也别再一个人往林子里跑。'], ['林溪', '（小声）……这也算愿望啊。']]);
      await L([['林溪·羞', '叶大哥，这个给你。（从袖子里摸出一枚小小的平安符，飞快地塞了过来）'], ['林溪·羞', '我自己绣的，绣了三个晚上……上面是青阳镇的柳叶，不、不是别的什么！你们明天就要走了，路上带着。']]);
      await choose('林溪的平安符', ['「谢了。绣得不错。」', '「这个我不能白拿。」']);
      await L([[YE, '我收下。'], [YE, '林溪。你叫我一声大哥，我就当你是妹妹。往后在青阳镇要是有人欺负你，报天剑宗叶孤星的名字。'], ['', '林溪怔了一下。河灯的光在她眼睛里晃了晃。'],
        ['林溪', '……妹妹啊。'], ['林溪', '（很小声）才不要只做妹妹……'], [YE, '嗯？'], ['林溪·笑', '没什么！我是说——那我要做最厉害的那个妹妹！等我练到凝丹，就去天剑宗找你们，到时候叶大哥可不许装不认识！'],
        [YE, '行。山门的师兄要是拦你，就说是我说的。'], ['', '林溪用力点了点头，提着兔子灯跑进了人群里。跑出几步，又回头挥了挥手。'],
        [XX, '小子，你是真看不出来，还是装看不出来？'], [YE, '看出来了。所以才要说清楚。'], [YE, '她该惦记的是自己的修行，不是一个明天就要走的过路人。'], [XX, '……难得你也有像个人的时候。']]);
      f.qf_done = 1; await gain('林溪所赠', [['c_pingan', 1]], 0, 80);
    } });
  }

  // 庙会那晚，原来站在街上催「随时可以出发」的那个林溪不再出现（黑风寨都打完了）
  try { for (const n of TMAPS.qy_town.npcs) if (n.name === '林溪' && n.cond && /ch2_plan/.test(String(n.cond)) && !/fairNow|ch3_night/.test(String(n.cond))) { const c0 = n.cond; n.cond = () => c0() && !afterCamp(); } } catch (e) {}
  window.R212 = { st, QA, QB, has: { yicui: HAS_YC, changle: HAS_CL } };
})();
