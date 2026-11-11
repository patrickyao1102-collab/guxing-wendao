// ================= R213 · 玄天城支线（作者 11-12：玄天城是最繁华的城，也要有支线；高端支线要能探索全城，还要和青阳镇有来有往）=================
//   G 青阳镇带来的两件事（和青阳镇互动）：把沈舟的剑穗带回天剑宗据点（做完「十年剑穗」）；把炼魂谷密信的事禀报据点（做完「黑风寨的账本」）
//   H 说书人的下半段：青阳镇庙会上说书先生留的扣子「九曜缺一」，到玄天城接着听；听完答三问
//   I 九灯拱一枢（高端 · 探索全城）：护城灵枢的十盏灵灯，夜里总有三盏发暗。找出是哪三盏、为什么、是谁
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_city || !window.SQ_DEFS) return;
  const M = TMAPS.xt_city, B = M.baked || {};
  const F = () => (S.flags = S.flags || {});
  const st = id => ((F().sq = F().sq || {})[id] = F().sq[id] || { s: 0, n: 0 });
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const YE = '叶孤星', XX = '星旋', ELDER = '据点长老';
  const inCity = () => { const f = F(); return !!(f.ch3_city || f.ch3_report || f.ch3); };
  const lvUp = () => Math.max(0, (S.hero.lv || 12) - 12);
  const free = (x, y) => { try { return B.blocked.charCodeAt(Math.floor(y / B.cs) * B.cols + Math.floor(x / B.cs)) === 48; } catch (e) { return true; } };
  const nearFree = (x, y) => { for (let r = 0; r <= 160; r += 16) for (let a = 0; a < 8; a++) { const px = x + Math.cos(a * Math.PI / 4) * r, py = y + Math.sin(a * Math.PI / 4) * r; if (free(px, py)) return [px, py]; } return [x, y]; };
  function hook(name, fn) {
    const n = (M.npcs || []).find(n => n.name === name && !n.hidden); if (!n) { console.warn('R213：找不到', name); return null; }
    const orig = n.talk;
    n.talk = async function (a) { let done = false; try { done = await fn(n); } catch (e) { console.warn('R213', name, e); }
      if (done) { if (n.shop) { const sh = n.shop; n.shop = null; setTimeout(() => { n.shop = sh; }, 0); } return; }
      if (typeof orig === 'function') return orig.call(this, a);
      const A = Array.isArray(orig) ? orig : [orig || '……'], pick = n.random ? [A[Math.floor(Math.random() * A.length)]] : A; for (const l of pick) await say(n.name, l); };
    return n;
  }
  const npc = (cx, x, y, name, talk, extra) => { const [fx, fy] = nearFree(x, y), [c, r] = P(fx, fy); const n = Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk }, extra || {}); M.npcs.push(n); return n; };
  const spot = (x, y, name, talk, extra) => { const [fx, fy] = nearFree(x, y), [c, r] = P(fx, fy); const n = Object.assign({ key: 'none', c, r, name, hidden: true, h: 130, talk }, extra || {}); M.npcs.push(n); return n; };
  async function gain(title, items, gold, exp, points) {
    const h = S.hero, lv0 = h.lv, show = [];
    for (const [id, n] of items || []) { addItem(id, n); const it = ITEM_DB[id] || {}; show.push({ icon: 'item:' + id, id, name: it.name || id, count: '×' + n, desc: it.desc || '' }); }
    if (gold) { h.gold = (h.gold || 0) + gold; show.push({ icon: 'gold', name: '灵石', count: '×' + gold }); }
    if (points) h.points = (h.points || 0) + points;
    try { playSnd('jingle_win'); } catch (e) {}
    if (show.length) { if (window.itemGet) await itemGet(show, title); else await showPanel(title, show.map(s => '!' + s.name + ' ' + s.count)); }
    if (points) toast('星辰点 +' + points, 1800);
    if (exp) { const ups = typeof gainExp === 'function' ? gainExp(exp) : 0; toast('修为 +' + exp + (points ? '　星辰点 +' + points : ''), 2000); if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0); }
  }
  const Q = (o, goals) => { const q = Object.assign({ type: 'kill', kill: { maps: ['__r213__'], mobs: ['__r213__'] }, reward: {} }, o);
    Object.defineProperty(q, 'goal', { enumerable: true, get() { const s = st(o.id); return goals[Math.min(goals.length - 1, s.n)] || goals[0]; } }); SQ_DEFS.push(q); return q; };

  Object.assign(ITEM_DB, {
    c_lingshu: { name: '灵枢碎玉', slot: 'acc', maxmp: 45, spd: 2, def: 3, price: 0, desc: '护城灵枢换下来的一角旧阵玉，被灵光养了四十年。司灯的老人说，这东西认得玄天城的每一盏灯。' },
    c_xingmu: { name: '说书人的醒木', slot: 'acc', atk: 4, maxmp: 20, price: 0, desc: '说书先生拍了半辈子的醒木，木头里像是浸着一千个故事。「后生，下半段书，就托你去找了。」' },
  });

  // =====================================================================================
  // G 青阳镇带来的两件事 —— 天剑宗据点
  // =====================================================================================
  hook(ELDER, async () => {
    const f = F(), sq = f.sq || {};
    const tassel = sq.qy_tassel && sq.qy_tassel.s === 3 && !f.xg_tassel, letter = sq.qy_ledger && sq.qy_ledger.s === 3 && !f.xg_letter;
    if (!f.ch3_report || (!tassel && !letter)) return false;
    const k = await choose(ELDER, [tassel ? '（取出沈舟的剑穗）「长老，弟子替一位师兄带了件东西回来。」' : null, letter ? '「青阳镇抓到一个炼魂谷的暗桩，身上有封密信。」' : null, '没什么事'].filter(Boolean));
    const opts = [tassel ? 't' : null, letter ? 'l' : null, 'x'].filter(Boolean), pick = opts[k] || 'x';
    if (pick === 'x') return false;
    if (pick === 't') {
      await L([['', '据点长老接过那枚褪了色的青色剑穗，翻过来看了一眼穗结，手忽然停住了。'], [ELDER, '……这个结，是老夫教的。外门那批孩子里，只有一个人总也打不好，打出来永远是歪的。'], [ELDER, '沈舟。十年前总往山下跑的那个小子。入内门那天，他来跟老夫告假，说要下山还一个愿。'],
        [ELDER, '此后再没回来。宗门的名册上，他这一栏写的是「失踪」。老夫一直以为……他是嫌修行苦，跑了。'], [YE, '他没跑。七年前黑风寨下山抢粮，他一个人一把剑，挡在了青阳镇的镇口。'], ['', '长老久久没有说话。'],
        [ELDER, '（提笔，在名册上划掉了两个字，重新写了一行）「内门弟子沈舟，殁于青阳，护一镇之粮。」'], [ELDER, '这枚剑穗你留着。他是为护人而死的，剑穗跟着一个还在护人的弟子，比锁在名册柜里强。'],
        [ELDER, '青阳镇那位等他的姑娘……宗门每年会有一份抚恤送过去。不是赏，是天剑宗欠她的十年。'], [XX, '（……这老头，总算说了句人话。）']]);
      f.xg_tassel = 1; await gain('据点记功 · 剑穗归宗', [], 0, 300, 60); return true; }
    await L([[YE, '信上写着：「凝丹修士三十，月底前送抵苍月城北」。'], [ELDER, '（脸色沉了下来）……苍月城。上个月，那边的据点刚报过：城外接连有散修失踪，一共二十七人，全是凝丹境。'], [ELDER, '二十七，加上黑风寨没送成的这一批——正好三十。有人在凑数。'],
      [XX, '（凑三十个凝丹修士……小子，这不是抓人，这是在备料。）'], [ELDER, '此事老夫即刻飞剑传书宗门。你们若往东去，务必绕开苍月城北；若是绕不开——（顿了顿）记住，先保命。'], [YE, '弟子记下了。']]);
    f.xg_letter = 1; await gain('据点记功 · 密信', [['p_big', 2]], 0, 260, 40); return true;
  });

  // =====================================================================================
  // H 说书人的下半段
  // =====================================================================================
  // 青阳镇庙会上那一段：听过就记一笔
  try { const T = TMAPS.qy_town, n = T && (T.npcs || []).filter(n => n.name === '说书先生').pop(); if (n && typeof n.talk === 'function') { const o = n.talk; n.talk = async function (a) { const r = await o.call(this, a); F().xh_part1 = 1; return r; }; } } catch (e) {}
  const QH = Q({ id: 'xt_story', name: '说书人的下半段', giver: ['xt_city', '说书先生'], where: '玄天城 · 云来客栈门口 · 说书先生', cond: inCity, n: 1,
    desc: '青阳镇庙会上，说书先生留了个扣子：长青剑仙飞升那日，留下一句「九曜缺一，此生难圆」。', reward: { exp: 280 } }, ['听说书先生把《长青剑仙》讲完，答他三问', '听说书先生把《长青剑仙》讲完，答他三问']);
  hook('说书先生', async () => {
    const s = st('xt_story'), f = F(); if (s.s === 3) return false; if (!inCity()) return false;
    if (s.s === 0) { await say('说书先生', f.xh_part1 ? '哟，这不是青阳镇庙会上那位后生？追到玄天城来听下半段——老朽这书，没白说！' : '后生，听书么？今儿讲的是《长青剑仙》的下半段，头一段在青阳镇庙会上讲过了，不妨事，老朽给你捋一遍。');
      const k = await choose('支线 · 说书人的下半段', ['坐下听书', '下次再说']); if (k !== 0) return true; s.s = 1; }
    await L([['说书先生', '上回书说到：千年前，长青剑仙一人一剑，以九曜剑典横扫群魔。九曜者，天枢、天璇、天玑、天权、玉衡、开阳、摇光，外加左辅、右弼两颗隐星——九星齐聚，方成剑典。'],
      ['说书先生', '可诸位知道么，剑仙一生只点亮了八颗。他寻遍九州，找那第九颗星寻了三百年，到飞升那日也没找到。'], ['说书先生', '飞升之前，他把剑典一分为二：一半刻在一块黑玉上，抛向了九天之外；另一半，留给了一个他从没见过的人。'],
      ['说书先生', '有弟子问：师尊，留给谁？剑仙只答了八个字——「九曜缺一，此生难圆」。又说：「缺的那一颗，不在天上。」'], [YE, '（一块黑玉……）'], [XX, '（…………）'], [YE, '（星旋？你怎么不说话？）'], [XX, '（没、没什么！这老头编得还挺像回事的。听书听书！）'],
      ['说书先生', '好，书说完了。按老朽的规矩，听完得答三问——全答上了，老朽这块醒木送你；答不上，明日请早！']]);
    const QS = [['剑仙一生，点亮了几颗星？', ['七颗', '八颗', '九颗'], 1], ['他把剑典的一半刻在了什么上面？', ['一柄剑上', '一块黑玉上', '一座石碑上'], 1], ['剑仙说，缺的那一颗星在哪里？', ['在九天之外', '在群魔手里', '不在天上'], 2]];
    let ok = 0; for (const [q, o, a] of QS) { const i = await choose(q, o); if (i === a) { ok++; toast('答对了', 900); } else toast('不对……', 900); }
    if (ok < 3) { await say('说书先生', '中了 ' + ok + ' 问。后生，听书要用心——老朽再给你讲一遍？'); return true; }
    await L([['说书先生', '三问全中！好耳力。（把醒木往他手里一塞）拿着。'], ['说书先生', '实不相瞒，这书老朽说了四十年，下半段的下半段，老朽自己也不知道——那第九颗星到底在哪儿，没人知道。'], ['说书先生', '后生，你要是哪天知道了，记得回来告诉老朽一声。老朽好把这书说完。'], [YE, '……一言为定。']]);
    s.s = 3; s.n = 1; await gain('支线完成 · 说书人的下半段', [['c_xingmu', 1]], 0, QH.reward.exp); return true;
  });

  // =====================================================================================
  // I 九灯拱一枢（高端 · 探索全城）
  // =====================================================================================
  const QI = Q({ id: 'xt_lamps', name: '九灯拱一枢', giver: ['xt_city', '司灯老人'], where: '玄天城 · 城中央护城灵枢旁 · 司灯老人', cond: () => !!F().ch3_report, n: 5,
    desc: '护城灵枢靠全城十盏灵灯供着。这三夜，总有三盏灯一到子时就发暗，灵石明明是满的。城卫说是司灯的老人老糊涂了，要换人。', reward: { exp: 620, gold: 800 } },
    ['走遍全城，把十盏灵灯挨个看一遍，找出发暗的三盏', '还有两盏发暗的灯没找到（全城一共十盏）', '还有一盏发暗的灯没找到（全城一共十盏）', '三盏都在南城门到云来客栈的路上——去客栈门口问问伙计', '去指认那个人（挑夫 / 卖花姑娘 / 糖画摊主）', '回护城灵枢，告诉司灯老人']);
  const qi = () => st('xt_lamps');
  const LAMPS = ((typeof CXB2 !== 'undefined' && CXB2.xt_city && CXB2.xt_city.objs) || []).filter(o => /spirit_lamp/.test(o.id || '')).map(o => [Math.round(o.x + o.w / 2), Math.round(o.y + o.h)]);
  const BAD = [[1740, 3086], [2740, 3086], [1856, 2310]];   // 南城门两侧 + 往云来客栈去的那一盏
  const isBad = ([x, y]) => BAD.some(([bx, by]) => Math.hypot(bx - x, by - y) < 60);
  npc('library_elder', 2120, 1840, '司灯老人', async () => {
    const s = qi(), f = F();
    if (s.s === 3) { await say('司灯老人', '十盏灯，一盏不少。老朽每晚还是照旧走一圈——四十年了，改不掉。'); return; }
    if (s.s === 1 && s.n >= 5) {
      await L([['司灯老人', '炼魂谷的蚀灵粉……难怪灵石是满的，灯却亮不起来。他们是在一盏一盏地试，哪盏灭了，护城大阵就在哪儿薄一分。'], ['司灯老人', '城卫说老朽老糊涂了。老朽没糊涂——这十盏灯，哪一盏什么时候该多亮，老朽闭着眼都知道。'],
        ['', '闻讯赶来的城卫统领朝老人深深一揖，又转向叶孤星，递过一只锦盒。'], ['玄天城城卫', '城主府的赏。另外——司灯一职，照旧由老人家管。往后三班城卫，夜里听他调遣。'],
        ['司灯老人', '后生，这一角旧阵玉是当年换阵眼时拆下来的，老朽揣了四十年。它认得玄天城的每一盏灯，往后，也认得你。'], [XX, '（他们在试护城大阵的弱点……小子，这座城，迟早有一场大的。）']]);
      s.s = 3; await gain('支线完成 · 九灯拱一枢', [['c_lingshu', 1]], QI.reward.gold, QI.reward.exp, 60); return; }
    if (s.s === 1) { await say('司灯老人', s.n < 3 ? '全城十盏灯：灵枢四角四盏，城东两盏，南街两盏，南城门两盏。发暗的那三盏，后生可要看仔细。' : '灯找着了？那粉末是什么来路，还得落在人身上。'); return; }
    if (!F().ch3_report) { await say('司灯老人', '（提着一盏小灯，绕着灵枢慢慢地走）……'); return; }
    await L([['', '一个提着小灯的老人，正绕着护城灵枢一圈一圈地走，嘴里念念有词，像在数着什么。'], ['司灯老人', '……七、八、九、十。不对，不对。'], [YE, '老人家，在数什么？'],
      ['司灯老人', '数灯。玄天城的护城大阵，九灯拱一枢，外加一盏备灯，一共十盏。老朽管了四十年，一盏没灭过。'], ['司灯老人', '可这三夜，一到子时，总有三盏发暗。灵石是满的，灯芯是新的——偏偏就是不亮。'],
      ['司灯老人', '城卫说老朽老眼昏花，过了这个月就换人。后生，你年轻，眼睛好——能不能替老朽把十盏灯都看一遍？']]);
    const k = await choose('支线 · 九灯拱一枢', ['接下（报酬：修为 +620、灵石 800，另有相赠）', '下次再说']); if (k !== 0) return;
    s.s = 1; s.n = 0; f.xi_seen = {}; try { playSnd('ui_confirm'); } catch (e) {}
    await say(XX, '（十盏灯散在全城。别偷懒，一盏一盏走过去看——发暗的未必是最远的。）'); toast('接取支线：九灯拱一枢 —— 把全城十盏灵灯看一遍', 3000);
  }, { cond: () => inCity() });
  LAMPS.forEach((pt, i) => spot(pt[0], pt[1] + 26, '灵灯', async () => {
    const s = qi(), f = F(); f.xi_seen = f.xi_seen || {};
    if (s.s !== 1 || s.n >= 3) { await say('', '一盏一人多高的青铜灵灯，灯光稳稳地亮着，顺着地上的石槽流向护城灵枢。'); return; }
    if (!isBad(pt)) { await say('', f.xi_seen[i] ? '看过了。这一盏灯光饱满，灵槽里干干净净。' : '灯光饱满，灯座的灵槽里干干净净，灵石还剩大半。这一盏没毛病。'); f.xi_seen[i] = 1; return; }
    if (f.xi_seen[i]) { await say('', '这盏灯比别处暗了一圈。灵槽缝里的黑色粉末还在。'); return; }
    f.xi_seen[i] = 1; s.n = Math.min(3, s.n + 1);
    await L([['', '这盏灯的光，比别处暗了一圈。'], ['', '灯座灵槽的缝里，沾着一层极细的黑色粉末，凑近有股淡淡的腥气。']]);
    if (s.n === 1) await say(XX, '（蚀灵粉！撒进灵槽，灵石的灵力就送不出来——灯看着没坏，其实是被人掐住了喉咙。这是炼魂谷的手艺。）' + (((F().sq || {}).qy_ledger || {}).s === 3 ? '（青阳镇一个，玄天城又一个。这帮人的手伸得可真长。）' : ''));
    toast('九灯拱一枢　发暗的灯 ' + s.n + ' / 3', 2000);
    if (s.n >= 3) await L([[YE, '南城门两盏，往西去的路上一盏……三盏连起来，是一条路。'], [XX, '（从南城门，到云来客栈。有人每天夜里走这条路，一路走一路撒。去客栈门口问问。）']]);
  }, { cond: () => qi().s === 1 }));
  hook('云来客栈伙计', async () => { const s = qi(); if (s.s !== 1 || s.n !== 3) return false;
    await L([[YE, '伙计，店里有没有哪位客人，夜里子时前后出门？'], ['云来客栈伙计', '子时出门？有！通铺那个挑夫，住了小半个月，天天半夜挑着空担子出去，说是去码头接货。'], ['云来客栈伙计', '我还纳闷呢——玄天城哪来的码头？再说了，他那担子是空的，可回回出门前都要往怀里揣一包东西，黑乎乎的，有股鱼腥味。'],
      ['云来客栈伙计', '人倒是老实，不赊账。白天就在南城门里头揽活，客官一找就能找着。']]);
    s.n = 4; toast('九灯拱一枢 —— 去找那个人对质', 2400); await say(XX, '（空担子，鱼腥味，子时出门。小子，心里有数了吧——可别指错了人。）'); return true; });
  async function accuse(who) {
    const s = qi(); if (s.s !== 1 || s.n !== 4) return false;
    const k = await choose('往灵灯里撒蚀灵粉的人，是' + who + '？', ['是。（当面指认）', '再想想']); if (k !== 0) return true;
    if (who !== '挑夫') { await L([[who, who === '卖花姑娘' ? '我？公子说笑了，我天一黑就收摊回家，我娘能作证的！' : '哎哟客官，我这糖画摊子天黑就收，夜里熬糖稀还来不及呢！'], [XX, '（伙计说的是谁？挑着空担子、子时出门的那个。）']]); return true; }
    await L([[YE, '每天子时，空担子，一包蚀灵粉。从南城门一路撒到云来客栈——三盏灯，一盏不落。'], ['挑夫', '……（慢慢放下了扁担）'], ['挑夫', '天剑宗的狗鼻子，倒是灵。可惜你们知道得太晚了——十盏灯，我已经试完了七盏。'], [XX, '（小心！这人身上的灵压不对，凝丹二重往上！）']]);
    const lv = lvUp();
    await fadeOut(220); const pr = startBattle({ title: '蚀灵暗桩', bg: (typeof IMG !== 'undefined' && IMG.bg_xuantian) ? 'bg_xuantian' : 'bg_night', enemies: [Object.assign({ name: '挑夫（炼魂谷暗桩）', key: (typeof IMG !== 'undefined' && IMG.e_xiexiu) ? 'e_xiexiu' : 'e_grunt', hp: 2100 + lv * 110, maxhp: 2100 + lv * 110, atk: 54 + lv * 3, def: 14, spd: 14, h: 255, color: '#655', boss: true, xie: true })], exp: 340, gold: 260, boss: true, normalBgm: true });
    await fadeIn(220); const win = await pr; S.scene = drawMap; await fadeIn(200);
    if (!win || win === 'flee') { try { partyRevive(.4); } catch (e) {} await say(XX, '（硬茬子。缓口气再来，他跑不出城。）'); return true; }
    F().xi_caught = 1; s.n = 5;
    await L([['', '那人被城卫按在地上，嘴里还在笑。'], ['挑夫', '七盏……够了。哪里薄，哪里厚，谷里已经知道了……'], [YE, '（他们试的不是灯。是这座城。）']]);
    toast('九灯拱一枢 —— 回护城灵枢告诉司灯老人', 2600); return true;
  }
  for (const who of ['挑夫', '卖花姑娘', '糖画摊主']) { const n = hook(who, () => accuse(who)); if (n && who === '挑夫') { const c0 = n.cond; n.cond = () => !F().xi_caught && (!c0 || c0()); } }

  window.R213 = { st, LAMPS, BAD };
})();
