// ================= R215 · 玄天城探案支线②「万宝楼的赝品」（作者 11-12：多人反复问话、有反转；难度不给玩家，给的是推理和反转的爽感）=================
// 调包案，偏沉稳。三次翻转：欠赌债的库房伙计偷的？→ 订赝品的是三十年的老鉴定师？→ 他不是偷，是藏：真剑一直挂在所有人眼皮底下。
// 和青阳镇联动：伙计小伍的赌债欠在青阳镇长乐坊；玩家若掀过那张桌子、翻过账房的流水账（qd_won / qd_ledger），这里有专属对白，直接拿账本说话。
// 收尾接主线暗线：要买剑的「贵客」是炼魂谷的人，身上掉出一张烫金请帖 → 支线③「三十个名字」的引子（xw_hint3）。
// 玩家不会卡：任务栏写明下一步；矛盾由叶孤星 / 星旋点破；当众说穿只管看。
// 场景暂用现成室内（雅间 = 拍卖场二楼雅间那张，库房 = 青阳镇杂货铺那张），Codex 按游戏画风重画的万宝楼到了再换。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_city || !TMAPS.xt_wanbao || !window.SQ_DEFS) return;
  const CITY = TMAPS.xt_city, WB = TMAPS.xt_wanbao;
  const F = () => (S.flags = S.flags || {});
  const st = id => ((F().sq = F().sq || {})[id] = F().sq[id] || { s: 0, n: 0 });
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const YE = '叶孤星', XX = '星旋', BOSS = '万宝楼掌柜', QIN = '秦老', WU = '小伍', HAN = '韩公子', HUO = '万宝楼伙计', XB = '玄兵阁掌柜', GS = '贵客的管事';
  const ID = 'xt_fake', q = () => st(ID), on = () => q().s === 1;
  const note = t => { const f = F(); f.xw_notes = f.xw_notes || []; if (!f.xw_notes.includes(t)) { f.xw_notes.push(t); try { playSnd('ui_confirm'); } catch (e) {} toast('记入证词本：' + t, 2600); } };
  const GOALS = ['跟万宝楼伙计说一声，去后院库房看现场（三处都看一遍）', '问话：掌柜、二楼雅间的鉴定师秦老、库房伙计小伍，再听听大堂伙计怎么说', '掌柜认定是小伍——回库房，当面问他钥匙的事', '全城能仿这把剑的只有玄兵阁——去西大街问玄兵阁掌柜', '回万宝楼二楼雅间，问秦老', '秦老不肯说剑在哪——看看雅间北墙上那排「仿古摆件」', '跟掌柜说：把人都请到雅间来', '（已完成）'];
  const Q = { id: ID, name: '万宝楼的赝品', giver: ['xt_wanbao', BOSS], where: '玄天城 · 万宝楼 · 掌柜', cond: () => !!F().ch3_report, type: 'kill', kill: { maps: ['__r215__'], mobs: ['__r215__'] }, n: 7, reward: { exp: 760, gold: 800 } };
  Object.defineProperty(Q, 'goal', { enumerable: true, get() { return GOALS[Math.min(GOALS.length - 1, q().n)]; } });
  Object.defineProperty(Q, 'desc', { enumerable: true, get() { const n = (F().xw_notes || []); return '三天后鉴宝会要上拍的「霜河古剑」，在万宝楼的库房里变成了一把没有灵纹的赝品。库房钥匙只有三把。' + (n.length ? '　【证词本】' + n.map((t, i) => (i + 1) + '. ' + t).join('　') : ''); } });
  SQ_DEFS.push(Q);
  Object.assign(ITEM_DB, { c_jianjing: { name: '鉴宝水晶镜', slot: 'acc', maxmp: 60, atk: 5, spd: 2, price: 0, desc: '秦老用了三十年的单片水晶镜，镜框磨得发亮。「老夫的眼睛用不上它了。少侠的眼睛，比它好使。」' } });
  try { SPEAKERS[QIN] = SPEAKERS[QIN] || { p: '', color: '#d8d0b8' }; SPEAKERS[WU] = SPEAKERS[WU] || { p: '', color: '#c8d8a8' }; SPEAKERS[HAN] = SPEAKERS[HAN] || { p: '', color: '#bcd0f0' }; SPEAKERS[GS] = SPEAKERS[GS] || { p: '', color: '#c9a0ff' }; } catch (e) {}

  // ---------------- 场景（暂借现成室内）----------------
  const clone = (id, src, title) => { const T = TMAPS[src]; if (!T) return null; const M = TMAPS[id] = Object.assign({}, T, { title, npcs: [], chests: [], onEnter: null, doors: [], exits: [] }); try { if (MAP_ZOOM[src] && !MAP_ZOOM[id]) MAP_ZOOM[id] = MAP_ZOOM[src]; } catch (e) {} return M; };
  const VIP = clone('xt_wanbao_vip', 'xt_auction_vip', '万宝楼 · 二楼鉴宝雅间'), STORE = clone('xt_wanbao_store', 'qy_grocery', '万宝楼 · 后院库房');
  if (!VIP || !STORE) { console.warn('R215：缺室内图'); return; }
  const wbIn = WB.start || [9.56, 13.4], vipIn = P(800, 700), storeIn = [7.25, 8.5];
  const ex0 = src => Object.assign({}, (TMAPS[src].exits || [])[0]);
  VIP.exits = [Object.assign(ex0('xt_auction_vip'), { to: 'xt_wanbao', at: wbIn, face: 'up', label: '下楼 · 万宝楼大堂', cond: null, msg: '' })];
  STORE.exits = [Object.assign(ex0('qy_grocery'), { to: 'xt_wanbao', at: wbIn, face: 'up', label: '回前堂 · 万宝楼', cond: null, msg: '' })];
  const add = (T, n) => { (T.npcs = T.npcs || []).push(n); return n; };
  const man = (T, cx, xy, name, talk, extra) => { const [c, r] = P(xy[0], xy[1]); return add(T, Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk }, extra || {})); };
  const spot = (T, xy, name, talk, extra) => { const [c, r] = P(xy[0], xy[1]); return add(T, Object.assign({ key: 'none', c, r, name, hidden: true, h: 110, talk }, extra || {})); };
  const go = async (m, at, face) => { try { await goMap(m, at[0], at[1], face || 'up'); } catch (e) { tileSetMap(m, at[0], at[1], face || 'up'); } };
  const wrap = (M, name, fn) => { const n = (M.npcs || []).find(n => n.name === name && !n.hidden); if (!n) { console.warn('R215：找不到', name); return null; } const orig = n.talk;
    n.talk = async function (a) { let done = false; try { done = await fn(n); } catch (e) { console.warn('R215', name, e); } if (done) { if (n.shop) { const sh = n.shop; n.shop = null; setTimeout(() => { n.shop = sh; }, 0); } return; }
      if (typeof orig === 'function') return orig.call(this, a); const A = Array.isArray(orig) ? orig : [orig || '……']; for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(n.name, l); }; return n; };

  // ---------------- 第一幕：接案（掌柜）----------------
  wrap(WB, BOSS, async () => {
    const s = q(), f = F();
    if (s.s === 3) { await say(BOSS, f.xw_end === 2 ? '少侠！那把剑送去天剑宗据点了，据点长老亲自来接的。小店「假一赔十」的牌子，往后还得加一句——「邪修免入」。' : '少侠！韩公子把剑带回去了，一文钱没让小店赚。……可这三天，来小店鉴宝的客人倒多了一倍。怪事。'); return true; }
    if (s.s === 1) {
      if (s.n === 6) { await finale(); return true; }
      if (s.n === 0) { await say(BOSS, '库房在后院，让伙计带您过去。少侠，千万小声些——这事要是传出去，小店百年的招牌就完了。'); return true; }
      if (s.n === 1 && !f.xw_a_b) {
        await L([[BOSS, '库房的钥匙，原本是三把：我一把，秦老一把，值夜的小伍一把。'], [BOSS, '不过上个月，秦老那把我收回来了。他年纪大了，夜里进库房磕了一回头，我怕他再摔着。'], [YE, '也就是说，这一个月里，能开库房的只有你和小伍。'],
          [BOSS, '……正是。少侠，我总不会偷自家的货砸自家的招牌吧？'], [BOSS, '这把剑是韩家公子寄拍的，入库那天秦老亲手验的，白纸黑字写着「真品 · 上品灵器」。「假一赔十」——底价三千灵石，我得赔他三万。']]);
        note('掌柜说：钥匙三把；秦老那把上个月收回了，这一个月能开库房的只有掌柜和小伍'); await asked('b'); return true; }
      if (s.n === 2) { await say(BOSS, '还用问么？全楼上下谁不知道小伍好赌！少侠，您替我问他——剑，卖到哪儿去了！'); return true; }
      await say(BOSS, s.n >= 5 ? '少侠查到什么了？脸色怎么这样……' : '少侠辛苦。有眉目了么？'); return true; }
    if (!Q.cond()) return false;
    const k0 = await choose(BOSS, ['（他眼圈发黑，手里的茶早凉了）掌柜的，出什么事了？', '看看货']); if (k0 !== 0) return false;
    await L([[BOSS, '（把人拉到书案后面，压低了声音）少侠是天剑宗的弟子，我信得过。小店……出了件要命的事。'], [BOSS, '三天后的鉴宝会，压轴的是一柄「霜河古剑」，上品灵器，三百年的老物件。已经有贵客放了话，志在必得。'],
      [BOSS, '昨夜我例行开匣复验——剑还在匣子里，可是……没有灵纹了。形制、分量、连剑脊上那道旧磕痕都分毫不差，偏偏是死铁一块。'], [BOSS, '有人把它调了包。'], [XX, '（连旧磕痕都仿出来了？小子，这可不是街边铁匠铺的手艺。）']]);
    const k = await choose('支线 · 万宝楼的赝品', ['「我替你查。」（报酬：修为 +760、灵石 800，另有相赠）', '下次再说']); if (k !== 0) return true;
    s.s = 1; s.n = 0; f.xw_notes = []; f.xw_seen = {}; try { playSnd('ui_confirm'); } catch (e) {}
    await say(XX, '（剑在匣子里，匣子在库房里，库房锁着。先看现场，再听人说话——老规矩。）'); toast('接取支线：万宝楼的赝品 —— 找大堂伙计带路，去后院库房', 3000); return true;
  });

  // ---------------- 大堂伙计：带路 + 闲话 ----------------
  wrap(WB, HUO, async () => {
    const s = q(), f = F();
    if (s.s !== 1 && s.s !== 3) return false;
    const opts = ['去后院库房', '上二楼鉴宝雅间']; if (s.s === 1 && s.n >= 1 && !f.xw_a_h) opts.push('（压低声音）小伍这个人，平日怎么样？'); opts.push('没事');
    const k = await choose(HUO + '：客官要去哪儿？', opts), pick = opts[k];
    if (pick === '去后院库房') { await go('xt_wanbao_store', window.R219_STORE_IN || storeIn); return true; }
    if (pick === '上二楼鉴宝雅间') { await go('xt_wanbao_vip', vipIn); return true; }
    if (/小伍/.test(pick || '')) {
      await L([[HUO, '小伍哥？人是不坏……就是手痒。'], [HUO, '上个月他告假回青阳镇老家，回来整个人都蔫了。后来才听说，在那边一个叫长乐坊的赌坊里，一晚上欠了八十两。'],
        f.qd_won ? [YE, '长乐坊。……那张桌子，是我掀的。'] : [XX, '（长乐坊？青阳镇西北角那家。小子，那地方的骰子可不干净。）'],
        f.qd_won ? [HUO, '啊？！少侠您……（肃然起敬）怪不得！'] : [HUO, '客官也听说过？'],
        [HUO, '可怪就怪在——前天他忽然眉开眼笑，说债还清了，一文不欠。八十两啊客官，他一年的工钱才十二两。'], [XX, '（欠了八十两的人，偏偏在丢剑的前后脚，把债还清了。……这个说法太顺了，顺得让人不放心。）']]);
      note('伙计说：小伍在青阳镇长乐坊欠了八十两赌债，前天忽然全还清了'); await asked('h'); return true; }
    return true;
  });

  // ---------------- 第二幕：库房三处 ----------------
  const seen = k => { const f = F(); f.xw_seen = f.xw_seen || {}; if (f.xw_seen[k]) return false; f.xw_seen[k] = 1; return true; };
  const count = async () => { const f = F(), s = q(), n = Object.keys(f.xw_seen || {}).length; if (s.n !== 0) return; if (n < 3) { toast('万宝楼的赝品　现场 ' + n + ' / 3', 1800); return; }
    await L([[YE, '锁没撬过，匣子没坏。是有钥匙的人，大大方方开门进来换的。'], [XX, '（而且换的人不慌不忙——连旧磕痕都对得上的赝品，不是一两天打得出来的。这是早就备好的。去问问有钥匙的人。）']]);
    s.n = 1; toast('万宝楼的赝品 —— 问话：掌柜、秦老（二楼雅间）、小伍，再听听大堂伙计', 3000); };
  spot(STORE, [800, 640], '剑匣', async () => { if (!on()) { await say('', '一只乌木长匣，铜锁锃亮。'); return; }
    await L([['', '乌木长匣，三道铜锁。锁眼里干干净净，没有撬痕，匣盖的封条是揭开后又原样贴回去的——贴得很仔细，连边角都对齐了。'], [YE, '贼偷了东西，还有闲心把封条贴整齐？']]); if (seen('xia')) { note('剑匣三道锁都没撬过；封条被人仔细地原样贴了回去'); await count(); } });
  spot(STORE, [520, 420], '匣中的剑', async () => { if (!on()) { await say('', '案上横着一柄古剑。'); return; }
    await L([['', '剑长三尺一寸，剑脊上一道斜斜的旧磕痕。叶孤星并指在剑身上一抹，星力渡进去，如石沉大海。'], [YE, '死铁。'], ['', '他把剑翻过来。剑格内侧，贴着护手的地方，有几道极细的新锉痕，亮得晃眼。'],
      [XX, '（这是打好之后，照着真剑一点一点修的。修的人见过真剑，而且不止一眼——是拿在手里，对着量过的。）']]); if (seen('jian')) { note('赝品是照着真剑仔细修过的：仿它的人长时间拿过真剑'); await count(); } });
  spot(STORE, [240, 330], '库房出入簿', async () => { if (!on()) { await say('', '墙上挂着一本出入簿。'); return; }
    await L([['', '出入簿上，近十天的记录只有三行：'], ['', '「初七 · 小伍 · 值夜」「初八 · 掌柜 · 盘库」「初九 · 小伍 · 值夜」'], ['', '再往前翻，上个月几乎每隔一天就有一行「秦 · 复验」。到了月底，这个名字忽然一行都没有了。'],
      [YE, '（一个每隔一天就要进库房看一眼的人，忽然一个月没来过。）']]); if (seen('bu')) { note('出入簿：近十天只有小伍值夜、掌柜盘库；秦老上月常来，这个月一次都没有'); await count(); } });

  // ---------------- 第三幕：问话（掌柜 / 秦老 / 小伍 / 伙计）----------------
  const asked = async k => { const f = F(), s = q(); f['xw_a_' + k] = 1; if (s.n !== 1) return; const got = ['b', 'q', 'w', 'h'].filter(x => f['xw_a_' + x]).length;
    if (got < 4) { toast('万宝楼的赝品　问话 ' + got + ' / 4', 1800); return; }
    await L([['', '掌柜不知什么时候跟了过来，脸色铁青。'], [BOSS, '不用查了。有钥匙，值夜，欠着赌债，前天债又清了——少侠，这还不够明白么？'], [BOSS, '小伍！我待你不薄！'],
      [XX, '（第一个说法：欠债的伙计监守自盗。件件都对得上。……可是小子，一个急着还八十两赌债的人，哪来的闲钱和工夫，提前一个月去订一把分毫不差的赝品？）'], [YE, '掌柜的，先别报官。我再问他一句话。']]);
    s.n = 2; toast('万宝楼的赝品 —— 回库房，当面问小伍钥匙的事', 2600); };
  man(STORE, 'kitchen_helper', [360, 520], WU, async () => { const s = q(), f = F();
    if (s.s === 3) { await say(WU, '少侠！我戒了，真戒了。秦老说，往后教我认东西——他说我手稳，就是心不稳。'); return; }
    if (!on()) { await say(WU, '（蹲在货箱边上发呆）……'); return; }
    if (s.n === 2) {
      await L([[YE, '小伍。你的债是怎么还清的？'], [WU, '（腿一软，坐在了货箱上）我没偷剑！少侠，我真没偷！'],
        ...(f.qd_ledger ? [[YE, '我知道钱不是你的。（把一本流水账放在货箱上）青阳镇长乐坊的账。「伍 · 欠八十两」，后面一行：「已清 · 代付人：秦」。'], [WU, '（瞪大了眼）这、这账本怎么会在您手里……'], [XX, '（因为那间账房是这小子踹开的。说吧，你们秦老为什么替你还债？）']]
          : [[YE, '八十两不是小数目。谁替你还的？'], [WU, '……是秦老。'], [XX, '（鉴定师？）']]),
        [WU, '秦老说，他那把钥匙叫掌柜收了，可库里有几件东西，他不亲手再摸一遍，夜里睡不着。他问我……能不能把钥匙借他一夜。'], [WU, '我想着，秦老在楼里三十年了，比掌柜来得都早，库里哪件东西不是他验的？就借了。第二天一早，他把钥匙还给我，还塞给我一张银票，说：「年轻人，别再去那种地方。」'],
        [WU, '我要是知道剑会出事，打死我也不借啊！'], [YE, '哪一夜？'], [WU, '初七。'],
        [XX, '（初七，出入簿上写的是「小伍 · 值夜」。进库房的，其实是那个「一个月没来过」的人。……可他图什么？三十年的老鉴定师，要偷早偷了。先弄明白那把赝品是谁打的。）']]);
      note('小伍承认：初七夜里把钥匙借给了秦老；赌债是秦老替他还的'); s.n = 3; toast('万宝楼的赝品 —— 去西大街，问玄兵阁掌柜谁能仿这把剑', 2800); return; }
    if (f.xw_a_w) { await say(WU, s.n >= 3 ? '少侠，秦老他……不会有事吧？' : '我、我该说的都说了……'); return; }
    if (s.n < 1) { await say(WU, '少侠随便看。我……我就在这儿守着。'); return; }
    await L([[YE, '初七、初九，都是你值夜？'], [WU, '是、是我。'], [YE, '夜里可有人来过？'], [WU, '（眼神躲了一下）没、没有。我一直守着，就……就初七肚子不舒服，离开过一刻钟。就一刻钟！'],
      [XX, '（他在撒谎。不过撒的是哪一句，还不好说。）']]);
    note('小伍说：两夜都是他值夜，没人来过；只有初七离开过一刻钟（他眼神在躲）'); await asked('w'); });
  man(VIP, 'riddle_elder', [330, 580], QIN, async () => { const s = q(), f = F();
    if (s.s === 3) { await say(QIN, '少侠来了。坐。老夫如今看东西，是用手看的——倒比从前用眼的时候，看得更准些。'); return; }
    if (!on()) { await say(QIN, '（闭着眼，手指在一只旧瓷瓶上慢慢摩挲）……宣和年的东西。可惜，口沿补过。'); return; }
    if (s.n === 4) {
      await L([[YE, '秦老。玄兵阁的鲁师傅说，一个月前有人订了一把仿霜河古剑。图样上的字，每个都有铜钱那么大。'], ['', '老人摩挲瓷瓶的手停住了。'], [QIN, '……鲁铁头的嘴，还是这么不严。'], [QIN, '是老夫订的。钥匙是老夫借的。剑，是老夫初七夜里亲手换的。'],
        [YE, '真剑在哪儿？'], [QIN, '毁了。扔进炉子里化了。少侠报官吧，老夫一把年纪，牢饭也吃不了几年。'], [YE, '（一个把封条边角都对齐的人，会把三百年的古剑扔进炉子？）'],
        [XX, '（他在护着什么。小子，别问他了，问这间屋子——老头的手，刚才往北墙那边偏了一下。那儿挂着一排落灰的「仿古摆件」。）']]);
      note('秦老认了：赝品是他订的，剑是他换的。可他说真剑「化了」——他在说谎'); s.n = 5; toast('万宝楼的赝品 —— 看看雅间北墙上那排摆件', 2600); return; }
    if (s.n === 5) { await say(QIN, '……少侠，有些事，不知道比知道好。'); return; }
    if (s.n >= 6) { await say(QIN, '（长长地出了一口气）罢了。少侠把人叫来吧，该老夫说的，老夫自己说。'); return; }
    if (f.xw_a_q) { await say(QIN, '老夫验过的东西，三十年没出过错。'); return; }
    if (s.n < 1) { await say(QIN, '库房的事？少侠先去看过再来问老夫。'); return; }
    await L([[YE, '秦老，霜河古剑入库那天，是您验的？'], [QIN, '是老夫。三尺一寸，重七斤四两，霜纹自剑锷起，九转而至剑尖。真品，上品灵器，错不了。'], [YE, '听说您的钥匙上个月交回去了。'],
      [QIN, '（淡淡地）掌柜说老夫老了。老了就老了吧。'], ['', '老人说话的时候，眼睛一直望着叶孤星左边一尺远的地方。'], [XX, '（小子，你往右挪一步试试。……看见没有？他的眼珠子没跟着你动。这老头，怕是快看不见了。）']]);
    note('秦老说：入库那天他亲手验的，是真品。（他的眼睛似乎快看不见了）'); await asked('q'); }, { face: 'right' });

  // ---------------- 第四幕：玄兵阁 ----------------
  wrap(CITY, XB, async () => { const s = q();
    if (!(s.s === 1 && s.n === 3)) return false;
    const k = await choose(XB, ['「打听件事：全城谁能仿一把上品灵器，仿到连旧磕痕都一样？」', '看看货']); if (k !== 0) return false;
    await L([[XB, '（脸色一变，左右看了看）客官这话……可不敢乱说。仿器不犯法，可仿到那个份上——全城只有一个人，我们后头铸剑坊的鲁师傅。'], [XB, '我替您问过了。他说一个月前确实接过一单：来人蒙着脸，放下一张图样、一袋灵石就走。图样画得极细，尺寸标到了毫厘，连哪道磕痕多深都写着。'],
      [YE, '蒙着脸。那就认不出是谁了。'], [XB, '人是认不出。可鲁师傅说，那张图样他忘不了——上头批注的字，一个个有铜钱那么大。'], [XB, '他原话是：「写这字的人，要么是三岁的娃娃，要么……眼睛快瞎了。」'],
      [XX, '（眼睛快瞎了，却能把一把剑的尺寸标到毫厘——那是三十年的手记得，不是眼睛记得。小子，你心里有数了吧。）'], [YE, '……多谢。']]);
    note('玄兵阁：一个月前有人蒙面订了仿剑，图样极精，但批注的字有铜钱大——写字的人眼睛快瞎了'); s.n = 4; toast('万宝楼的赝品 —— 回万宝楼二楼雅间，问秦老', 2600); return true; });

  // ---------------- 第五幕：墙上的摆件 ----------------
  spot(VIP, [564, 392], '北墙上的仿古摆件', async () => { const s = q();
    if (s.s === 3) { await say('', '那排摆件还在，只是正中间空了一个位置，留着一道剑形的浅印。'); return; }
    if (!on() || s.n < 5) { await say('', '北墙上挂着一排仿古的刀剑摆件，给客人对照着讲形制用的，落了薄薄一层灰。'); return; }
    if (s.n >= 6) { await say('', '第四把。它安安静静地挂在那儿，像过去的三天一样。'); return; }
    await L([['', '一排七把，都是讲形制用的仿品，落着一样的灰。'], ['', '叶孤星从左看到右。第四把——三尺一寸，剑脊上一道斜斜的旧磕痕。剑鞘上的灰，比旁边几把都薄。'], ['', '他伸出手，星力还没渡过去，鞘中已经传来一声极轻的清鸣，像冰面下的水。'],
      [XX, '（……哈。）'], [XX, '（全楼上下翻了三天的剑，就挂在客人头顶上。谁会去多看一眼「摆件」？）'], [QIN, '（闭上了眼）……少侠好眼力。比老夫当年还好。'],
      [YE, '秦老。您没有偷它。您是把它——藏起来了。'], [YE, '为什么？'], [QIN, '……把掌柜叫上来吧。还有韩公子。这话，该当着他们的面说。']]);
    note('真剑一直挂在雅间北墙上，混在一排「仿古摆件」里——秦老不是偷，是藏'); s.n = 6; toast('万宝楼的赝品 —— 下楼跟掌柜说：把人都请到雅间来', 2800); });
  spot(VIP, [564, 590], '鉴宝案', async () => { await say('', '一张紫檀鉴宝案，案上的放大水晶、软尺、白绢手套摆得一丝不乱。水晶镜上却落了灰——很久没人用过了。'); });

  // ---------------- 寄拍的卖主：韩公子（大堂里那位「等鉴定的客人」）----------------
  wrap(WB, '等鉴定的客人', async n => { const s = q();
    if (s.s === 3) { await say(HAN, F().xw_end === 2 ? '剑在天剑宗，我放心。等我修到凝丹，自己去据点把它请回来。' : '剑我带回去了。先祖的东西，往后再穷也不卖了。少侠，多谢。'); return true; }
    if (!on() || s.n < 1) return false;
    await L([[HAN, '（衣裳洗得发白，袖口却熨得很平）在下韩云舟。少侠是为霜河剑的事来的？掌柜的……已经同我说了。'], [HAN, '那是先祖的佩剑。家里到我这一辈，只剩这一件东西了。我娘的病要用玄参续命，实在没法子，才送来寄拍。'],
      [HAN, '三万灵石的赔偿，我不要。我只想知道，剑还在不在这世上。'], [XX, '（苦主不要赔偿，只要剑。这倒是个明白人。）']]);
    note('卖主韩云舟：剑是先祖佩剑，为母治病才寄拍；他不要赔偿，只想知道剑还在不在'); return true; });

  // ---------------- 第六幕：当众说穿 ----------------
  async function finale() {
    const s = q(), f = F();
    await go('xt_wanbao_vip', vipIn);
    await L([['', '鉴宝雅间的门关上了。掌柜、韩云舟、小伍，还有一位不请自来的客人——那位「志在必得」的贵客派来的管事，说是来看看压轴的剑。'], [BOSS, '少侠，人齐了。贼……到底是谁？'], [YE, '没有贼。'],
      [YE, '第一件。剑匣的锁没撬过，封条贴得整整齐齐。换剑的人有钥匙，而且爱惜这只匣子。'], [YE, '第二件。小伍初七夜里把钥匙借出去过。借钥匙的人替他还了八十两赌债——不是买通，是劝他别再赌。'], [WU, '（低着头）……是秦老。'], [BOSS, '秦老？！'],
      [YE, '第三件。赝品是一个月前在玄兵阁订的。图样尺寸标到毫厘，批注的字却有铜钱大。写字的人眼睛快看不见了，可他的手，记得那把剑的每一分每一寸。'],
      ['', '所有人都看向窗边的老人。秦老慢慢站起来，朝掌柜的方向拱了拱手——偏了半尺。'], [BOSS, '（声音发颤）老秦，你的眼睛……什么时候的事？'], [QIN, '去年冬天就不大行了。怕你辞了我，没敢说。'],
      [BOSS, '三十年了！我辞谁也不会辞你！……可你为什么要偷剑？！'], [YE, '他没有偷。'], ['', '叶孤星走到北墙下，从那排落灰的摆件里，取下了第四把。'], ['', '剑出鞘三寸。满室生寒，霜纹自剑锷起，九转而至剑尖——一声清鸣，案上的茶水结了一层薄冰。'],
      [HAN, '（眼圈一下红了）是它……是先祖的剑！'], [BOSS, '它、它一直挂在这儿？我每天从这墙底下过八回！'], [XX, '（所以才没人找得到。）'],
      [YE, '秦老。您把它从库房换出来，却没带出这栋楼。您不是要它，是不想让它上鉴宝会。——为什么？'],
      [QIN, '……入库那天，老夫的眼睛已经看不清霜纹了，是用手验的。手摸上去，剑里头，有东西在动。'], [QIN, '这把剑里，封着一缕剑魂。韩家先祖坐化的时候，把最后一口气留在了剑里。'],
      [QIN, '老夫验了三十年东西，认得什么样的人会为什么样的东西出价。那位贵客托人来问了七回——不问剑锋利不利，不问灵纹全不全，只问一句：「里头的东西，还醒着么？」'],
      ['', '雅间里，那位一直含笑不语的管事，脸上的笑慢慢收了。'], [QIN, '买剑的人不问剑，问魂。老夫没有凭据，说出来谁信？掌柜的要做生意，韩公子等着救命钱。老夫只好……让他们拍走一块死铁。'],
      [GS, '（轻轻鼓了两下掌）老先生眼睛瞎了，心倒不瞎。'], [GS, '可惜。主上要的东西，从来没有拿不到的。一缕三百年的剑魂——够炼一炉好丹了。'], [XX, '（炼魂——小子！是炼魂谷的人！）'], [YE, '（横剑挡在秦老身前）想要，自己来拿。']]);
    const lv = Math.max(0, (S.hero.lv || 11) - 11);
    const mk = (name, key, hp, atk, def, extra) => Object.assign({ name, key: (typeof IMG !== 'undefined' && IMG[key]) ? key : 'e_grunt', hp, maxhp: hp, atk, def, spd: 13, h: 250, color: '#665' }, extra || {});
    let win = true;
    try { await fadeOut(220); const pr = startBattle({ bg: 'bg_night', normalBgm: true, title: '万宝楼 · 鉴宝雅间', boss: true, exp: 260, gold: 200,
      enemies: [mk('炼魂谷执事（凝丹二重）', 'e_xiexiu', 1500 + lv * 110, 46 + lv * 3, 13, { boss: true }), mk('炼魂谷随从', 'e_grunt', 560 + lv * 40, 34 + lv * 2, 8), mk('炼魂谷随从', 'e_grunt', 560 + lv * 40, 34 + lv * 2, 8)] });
      await fadeIn(220); const r = await pr; S.scene = drawMap; await fadeIn(200); win = !!r && r !== 'flee'; } catch (e) { console.warn('R215 fight', e); }
    if (!win) { try { partyRevive(.4); } catch (e) {} await say(XX, '（这执事有两下子。缓口气，回头再找掌柜把人叫齐。）'); return; }
    await L([['', '执事撞碎了窗棂，带着一身的血翻了出去。地上落下一张烫金的帖子。'], ['', '帖子上没有抬头，只有一行字：「月晦之夜 · 城南 · 鉴宝小会」，下面压着一个数：「三十」。'],
      [XX, '（烫金的帖子……那个抄书的小伙计说的，就是这个？三十——又是三十。）'], [YE, '（青阳镇那封密信上也写着：凝丹修士三十。）'],
      [BOSS, '（腿还在抖）炼、炼魂谷……我差点把韩家先祖的魂，亲手卖给了炼魂谷……'], [BOSS, '老秦，我……我对不住你。那把钥匙，你拿回去。往后你用手验，我给你念。'], [QIN, '（笑了）掌柜的，你念字可不大利索。'],
      [HAN, '（双手捧着剑，对秦老深深一揖）老先生护的不是一把剑，是我韩家的先人。云舟无以为报。'], [HAN, '只是这剑……放在我手里，怕是护不住第二回。少侠，你说，它该去哪儿？']]);
    const k = await choose('霜河古剑该去哪儿？', ['「带回家。先祖的剑，该由后人守着。——药钱的事，让掌柜想办法。」', '「送去天剑宗据点。等你自己修到凝丹，再来请它回去。」']);
    if (k === 1) { await L([[HAN, '（愣了愣，随即郑重点头）好。等我配得上它的那天。'], [BOSS, '韩公子令堂的玄参，小店包了！就当……就当给老秦的眼睛积德。'], [XX, '（据点那个老头子，这回可捡着宝了。）']]); f.xw_end = 2; }
    else { await L([[HAN, '……是。再穷，也不卖先人了。'], [BOSS, '韩公子令堂的玄参，小店包了！老秦替我保住的招牌，值这个价。'], [XX, '（剑魂听见了。你看——鞘上的霜，化了。）']]); f.xw_end = 1; }
    await L([[QIN, '少侠。这片水晶镜跟了老夫三十年，如今用不上了。'], [QIN, '老夫的眼睛看不见，才被一把剑上了一课：东西的真假，原来不在眼睛里。……少侠的眼睛，比它好使。拿着吧。']]);
    f.xw_hint3 = 1; s.s = 3; s.n = 7;
    const h = S.hero, lv0 = h.lv; addItem('c_jianjing', 1); h.gold = (h.gold || 0) + Q.reward.gold; try { playSnd('jingle_win'); } catch (e) {}
    if (window.itemGet) await itemGet([{ icon: 'item:c_jianjing', id: 'c_jianjing', name: '鉴宝水晶镜', count: '×1', desc: ITEM_DB.c_jianjing.desc }, { icon: 'gold', name: '灵石', count: '×' + Q.reward.gold }], '支线完成 · 万宝楼的赝品');
    const ups = typeof gainExp === 'function' ? gainExp(Q.reward.exp) : 0; toast('修为 +' + Q.reward.exp, 1800); if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0);
    toast('捡到一张烫金请帖：「月晦之夜 · 城南 · 鉴宝小会」', 3200);
  }
  window.R215W = { st, Q, finale };
})();
