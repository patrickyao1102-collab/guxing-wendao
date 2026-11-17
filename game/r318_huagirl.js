// ================= R318 · 卖花姑娘姐妹：买花攒好感 + 初见三问（贯穿全局的支线，第一版）=================
// 作者 11-15 构思：「卖花的设成贯穿全局的支线，以后后续城池也有类似的，都是她的亲姐妹；买花可以增加好感度；
// 第一次遇见她会问你三个关于原著的剧情问题，三题答对了有奖励（可以奖励技能书）；所有卖花的问题都答对了——隐藏结局」。
// 11-16：「小荷的问题，以及卖花的好感度，你接入了吗」。
// 第一版：青阳镇 / 天剑集市一带的卖花姑娘·小荷（妹妹），玄天城的卖花姑娘小莲（姐姐）。以后的城池再加姐妹，往 SIS 里添一行就行。
//  · 初见：她先考你三题（原著里的事），三题全对送一本技能书；答错了不告诉你错在哪，下次再来考。
//  · 第一次就三题全对，记一笔「一次答对」；每一位姐妹都一次答对 → F().hua_he = 1（隐藏结局的条件，结局以后再做）。
//  · 买花：一枝 5 灵石，好感 +5（满 100）；好感到 30 / 60 / 100 她各回送一样东西。
//  · 她身上的案子（三十个名字、九灯拱一枢）正在查的时候，先走案子的话，不弹这些。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof say !== 'function' || typeof choose !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const H = () => (F().hua = F().hua || {});
  const SIS = {
    xiaohe: { names: ['卖花姑娘·小荷'], maps: ['qy_town', 'tj_market'], who: '卖花姑娘·小荷', call: '小荷', book: 'bk_hero_ningshen',
      hello: ['（她抱着一篮栀子花，歪着头打量你）你就是天剑宗的那位少宗主？', '我叫小荷。我听过好多好多你们天剑宗的故事——考考你，答对了，我送你一样好东西！'],
      chat: ['我有好几个姐姐，一个比一个会卖花。你要是去了大城里，替我瞧瞧她们瘦了没有。', '栀子花要早上摘，露水还没干的时候最香。'],
      Q: [['叶孤星生来是什么命格？', ['天煞孤星', '七杀破军', '紫微帝星', '天乙贵人'], 0],
        ['星旋这个器灵，平时待在叶孤星身上哪件东西里？', ['星痕剑', '那块黑色的玉佩', '九曜剑典', '发冠上的青玉扣'], 1],
        ['九曜剑典的残本，原本藏在天剑宗哪里？', ['宗主居所的书房', '藏经阁最深处的禁阁', '后山的锁灵阵里', '演武场的测灵碑底下'], 1]] },
    xiaolian: { names: ['卖花姑娘·小莲', '卖花姑娘'], maps: ['xt_city'], who: '卖花姑娘·小莲', call: '小莲', book: 'bk_hero_juling',
      hello: ['（她把一枝白茶花插回篮里，上上下下看了你两遍）……公子，你见过一个扎两个小辫儿、嗓门特别大的卖花丫头没有？', '那是我妹妹小荷！我叫小莲。——荷就是莲，莲就是荷，我爹给闺女起名字，向来偷懒。', '小荷爱考人，我也爱。不过我的题，可没她那么好答。'],
      chat: ['我们家姐妹多，一个城里放一个，像撒花籽似的。你往后走得远了，总会碰上的——她们都比我凶。', '你见过小荷了？她是不是又说她最会卖花？哼。', '玄天城的人买花，不问香不香，只问贵不贵。'],
      right: ['（她愣了一下，慢慢笑了）……这些可不是街上听来的。公子，你是真把那本书读进心里去了。', '书里写的那些事，比我说的细多了，也疼多了。——说好的，这个给你。'],
      Q: [['玄元拍卖场上，叶孤星花一万灵石拍下一件谁都看不上的东西，星旋还叮嘱他「先别跟人提」。那是什么？', ['一面裂了缝的铜镜', '一只灰白的旧玉盘', '一截枯木', '一块黑石头'], 1],
        ['那晚结账的时候，叶孤星掏出一样东西，拍卖行的老者亲自双手递还，飞云宗那个青年当场看傻了眼。是什么？', ['天剑宗的少宗主令牌', '一张深黑色、嵌着淡金花纹的灵晶卡', '叶擎苍的亲笔书信', '一袋星辰砂'], 1],
        ['星星灵兽铺里那头谁都驯不服的银角青蛟，最后是被谁驯服的？', ['叶孤星——拿灵果哄好的', '云霆——一剑镇住的', '洛尘——走到结界前，看了它一眼', '店主柳婉清自己'], 2]] },
  };
  const GIFT = { 30: ['p_big', 2, '两颗大还丹'], 60: ['p_mp', 3, '三颗回灵丹'], 100: ['acc_qz_taohua', 1, '一枚桃花佩'] };
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const reg = n => { try { SPEAKERS[n] = SPEAKERS[n] || { p: '', color: '#ffc8d8' }; } catch (e) {} };
  const st = k => { const h = H(); return (h[k] = h[k] || { met: 0, tries: 0, done: 0, first: 0, fav: 0, gift: {} }); };
  const busy = s => (s.busy || []).some(id => { const q = ((F().sq || {})[id]); return q && q.s === 1; });
  const gold = () => (S.hero && S.hero.gold) || 0;

  async function quiz(k) { const s = SIS[k], o = st(k); o.tries++;
    let right = 0;
    for (let i = 0; i < s.Q.length; i++) { const [q, opts, ans] = s.Q[i];
      const c = await choose(s.call + ' 问（' + (i + 1) + ' / 3）：' + q, opts); if (c === ans) right++; }
    if (right === 3) {
      const first = o.tries === 1; if (!o.done) { o.done = 1; if (first) o.first = 1; }
      await L((s.right || ['三题全对！你是真的听过这些故事，还是……你就是故事里的人？', '说好的，这个给你。']).map(t => [s.who, t]));
      if (!o.got) { o.got = 1; try { addItem(s.book, 1); } catch (e) {} const nm = (ITEM_DB[s.book] || {}).name || '技能书'; try { await showPanel('获得道具', ['!' + nm, '卖花姑娘' + s.call + '的谢礼']); } catch (e) {} }
      if (Object.keys(SIS).every(x => st(x).first)) { F().hua_he = 1; await say('星旋', '（小子，这几个卖花的丫头……一个比一个记性好。总觉得哪里不对。）'); }
    } else {
      await L([[s.who, '（她抿着嘴笑）错了' + (3 - right) + '题。哪题错了，我可不告诉你——'], [s.who, '回去好好想想，下回再来考你。']]);
    } }

  async function buy(k) { const s = SIS[k], o = st(k);
    if (gold() < 5) return say(s.who, '一枝五文……呃，五块灵石。公子钱袋好像空了？');
    S.hero.gold -= 5; o.fav = Math.min(100, (o.fav || 0) + 5); try { if (window.R322_ACT) R322_ACT(k === 'xiaohe' ? 'r313_18_he' : 'r313_18_lian', s.names[0]); } catch (e) {} try { playSnd('ui_confirm'); } catch (e) {}
    try { toast(s.call + '好感 +5（' + o.fav + ' / 100）', 1800); } catch (e) {}
    await say(s.who, ['（她挑了一枝开得最好的递给你）给，今天第一枝最香。', '谢谢公子！花要插在清水里，能开三天。', '你又来啦？我就知道你会再来。'][Math.min(2, Math.floor(o.fav / 30))]);
    for (const t of [30, 60, 100]) if (o.fav >= t && !o.gift[t]) { o.gift[t] = 1; const [id, n, nm] = GIFT[t];
      await say(s.who, t === 100 ? '你买了我这么多花……这个送你，是我自己编的，别嫌弃。' : '公子老照顾我生意，这个你拿着，路上用得着。');
      try { addItem(id, n); await showPanel('获得道具', ['!' + nm, s.call + '回送的']); } catch (e) {} } }

  async function talk(k, orig, self, a) { const s = SIS[k], o = st(k);
    // 十年剑穗：碑前的花是谁送的（看过剑碑、还没回去告诉苏晚的时候）
    { const qc = ((F().sq || {}).qy_tassel || {}); if (k === 'xiaohe' && qc.s === 1 && qc.n === 2 && !F().qc_he) { F().qc_he = 1;
      await L([[s.who, '（她篮子里的栀子少了一小把）……少侠去过河东的老槐树了？'], ['叶孤星', '碑前的花，是你送的？'], [s.who, '嗯。七年了，隔几天送一回。'],
        [s.who, '那年黑风寨下山抢粮，我坐在我爹的粮车上，八岁。山贼把刀架在我爹脖子上，是一个穿青衫的大哥哥站到车前面的。'], [s.who, '他回头跟我说：「小丫头，闭上眼睛，数到一百。」……我数到一百，睁开眼，山贼都跑了。'],
        [s.who, '他靠着车轮坐着，身上全是血，还冲我笑。'], [s.who, '后来我才知道他叫沈舟。'], [s.who, '少侠，倚翠楼那个弹琴的姐姐，是在等他吧？……你替我告诉她，他那边的花，从来没断过。'],
        ['星旋', '（……小子，这一句，比什么都重。）']]); o.fav = Math.min(100, (o.fav || 0) + 10); try { toast('小荷好感 +10', 1600); } catch (e) {} return; } }
    if (busy(s)) return orig && orig.call(self, a);   // 正在查她身上的案子：先走案子
    if (!o.met) { o.met = 1; await L(s.hello.map(t => [s.who, t])); const c = await choose(s.who, ['「考吧。」', '下次吧']); if (c === 0) return quiz(k); return; }
    const opts = ['买一枝花（5 灵石）', o.done ? null : '「再考我一次。」', '闲聊', '走了'].filter(Boolean);
    const c = await choose(s.call + '　好感 ' + (o.fav || 0) + ' / 100', opts), pick = opts[c];
    if (pick === '买一枝花（5 灵石）') return buy(k);
    if (pick === '「再考我一次。」') return quiz(k);
    if (pick === '闲聊') { const C = s.chat || ['今天的花开得好，你闻闻。']; return say(s.who, C[Math.floor(Math.random() * C.length)]); } }

  const wrapN = (n, m) => { if (!n || n._r318 || n.hidden) return; const k = Object.keys(SIS).find(k => SIS[k].names.includes(n.name) && (!SIS[k].maps || SIS[k].maps.includes(m))); if (!k) return;
    n._r318 = 1; reg(n.name); const orig = typeof n.talk === 'function' ? n.talk : (() => { const A = [].concat(n.talk || []); return async function () { for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(n.name, l); }; })();
    n.talk = async function (a) { return talk(k, orig, this, a); }; };
  // 地图里写死的（玄天城的小莲）+ 进图时随机撒在街上的（R66 访客里的小荷）
  const rename = () => { try { if (world.mapName !== 'xt_city') return; for (const a of world.actors || []) if (a.npc && a.npc.name === '卖花姑娘·小荷') { a.npc.name = '卖花姑娘·小莲'; a.name = '卖花姑娘·小莲'; a.npc._r318 = 0; } } catch (e) {} };
  // 作者 11-17 21:54：「地图上老是找不到卖花的，点自动寻路也不给寻，还老走到林府门口」
  //   原来青阳镇的小荷是进图时随机撒在街上、到处溜达的路人（不在地图名单里，寻路找不到她）；玄天城还多出一个溜达的「小莲」，跟城南写死的那位重了。
  //   → 青阳镇：小荷固定站在林府南边那条石板街口（大樟树旁），不乱走，地图名单里有她，寻路、小地图都找得到；玄天城：只留城南那位，溜达的那个拿掉。
  { const Q = TMAPS.qy_town; if (Q && !(Q.npcs || []).some(n => n.name === '卖花姑娘·小荷' && n._r318fix)) (Q.npcs = Q.npcs || []).push({ key: 'n_villager', r66: 'visitor_xiaohe', name: '卖花姑娘·小荷', _r318fix: 1,
      talk: ['新摘的栀子花，三文一枝～', '买一枝送心上人吧，少侠。'], random: true, wander: false, h: 118, face: 'down', c: 1180 / 64 - .5, r: 1640 / 64 - .8 }); }
  const dropWander = () => { try { if (!/^(qy_town|xt_city)$/.test(world.mapName)) return;
      for (let i = world.actors.length - 1; i >= 0; i--) { const a = world.actors[i]; if (a && a.npc && a.npc.r66 === 'visitor_xiaohe' && a.npc.wander) world.actors.splice(i, 1); } } catch (e) {} };
  const hook = () => { dropWander(); rename(); for (const m of Object.keys(TMAPS)) for (const n of TMAPS[m].npcs || []) wrapN(n, m); try { for (const a of world.actors || []) wrapN(a.npc, world.mapName); } catch (e) {} };
  hook();
  if (typeof tileSetMap === 'function') tileSetMap = (o => function () { const r = o.apply(this, arguments); try { hook(); } catch (e) {} return r; })(tileSetMap);
  window.R318_HUA = { SIS, st };
})();
