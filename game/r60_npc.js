// ================= 天剑宗集市：人人可对话 + 隐藏任务 =================
// 店主、闲逛的访客、驻足的看客、仙鹤和灵鹿都能点。每人的话按次序往下说（多聊几次能听到后半段故事）。
// 隐藏任务（不进主线任务栏，用 S.flags.mk_* 记录）：
//  1 炼器女修「给弟弟的第一把剑」：狼牙×3 → 《星落》剑谱 + 120 灵石
//  2 老修士「旧书签」：聊满三次 → 去南湖观景台找书签 → 剑诀玉简
//  3 老丹师「月露灵草」：月露灵草×1（后山采）→ 大还丹×2 + 清灵散×2
//  4 秦小婉「仙鹤叼走的发簪」：找仙鹤要回来 → 破阵灵晶×1
//  5 灵鹿：摸三次 → 饲养弟子送礼
//  6 韩平「一颗回春丹」：送他一颗 → 灵石，日后还有回报
//  7 柳娘「找女儿」：灵兽苑边找到阿蘅 → 香囊（回春丹×2）
//  8 赵婆婆 & 王老伯「老伴走散」：告诉婆婆老伯在南湖边 → 腌梅子（复苏丹）
(function () {
  const R = window.R60_MARKET; if (!R || !TMAPS[R.ID]) return;
  const { M, L, atIn, ID } = R, F = () => S.flags, H = () => S.hero, P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const HERO = '叶孤星';
  const cnt = id => (id === 'p_small' ? H().potions || 0 : (H().bag[id] || 0));
  const take = (id, n) => { if (id === 'p_small') H().potions -= n; else { H().bag[id] -= n; if (H().bag[id] <= 0) delete H().bag[id]; } };
  const ok = id => id === 'gold' || id === 'p_small' || !!ITEM_DB[id];
  async function give(list, who) {
    const lines = []; for (const [id, n] of list) { if (!ok(id)) continue; if (id === 'gold') { H().gold += n; lines.push('灵石 ×' + n); } else { addItem(id, n); lines.push((ITEM_DB[id] ? ITEM_DB[id].name : id) + ' ×' + n); } }
    try { playSnd('ui_confirm'); } catch (e) {}
    if (lines.length) { toast('获得：' + lines.join('、'), 2400); await narrate('获得 ' + lines.join('、') + (who ? '（' + who + '赠）' : '') + '。'); }
  }
  const done = k => !!F()['mk_' + k], set = (k, v = 1) => { F()['mk_' + k] = v; }, get = k => F()['mk_' + k] || 0;
  const doneCount = () => ['sword', 'bookmark', 'dew', 'pin', 'deer', 'han', 'girl', 'oldpair'].filter(k => get(k) === 2).length;
  // 按次序说下一段（多聊会说到后面的故事）；每段可以是多句 [[说话人, 话], ...]
  async function next(id, name, beats) {
    const i = get('c_' + id) % beats.length; set('c_' + id, get('c_' + id) + 1);
    for (const b of beats[i]) { if (Array.isArray(b)) await say(b[0] === 0 ? HERO : b[0], b[1]); else await say(name, b); }
  }
  const book = has => (ITEM_DB.jp_xingluo2 ? 'jp_xingluo2' : 'jp_dianxing');

  // ---------------- 六位店主 ----------------
  const MER = {
    alchemist: { name: '老丹师', shop: 'medicine', beats: [
      ['小友气色不错。修行之人啊，三分靠悟性，七分靠吃饭睡觉。'],
      ['这铺子我守了四十年。年轻时也想御剑天下，后来发现，救一个人比赢一场架舒坦。'],
      ['前些年有个外门小娃，练剑练到昏在山门口。我灌了他三碗药汤，他醒来第一句话是“师父，我还能练吗”。……那孩子如今是内门执剑了。', [0, '后来呢？'], '后来？后来他每年冬至都给我送一坛酒。我不喝酒，可我每坛都留着。'],
      ['丹炉的火要文，人的心也要文。急了，药就苦了。'],
    ] },
    storyteller: { name: '老修士', shop: 'skills', beats: [
      ['典籍阁的书，有的三百年没人翻过。书不怕旧，怕没人读。'],
      ['你翻剑谱的时候，记得看看批注。前人写在边上的那几个小字，往往比正文还值钱。'],
      ['……我年轻时，有个同门师妹，最爱在书里夹一片银杏叶做书签。', '她说，书签夹在哪儿，下回就从哪儿接着读——人也一样。', '后来她下山去了，书签却还在我这儿。前些日子在南湖观景台打盹，一阵风……唉。'],
    ] },
    artificer: { name: '炼器女修', shop: 'armory', beats: [
      ['今天这炉火色正，打出来的剑会很听话。'],
      ['剑是有脾气的。你待它好，它在要紧时候就不会让你失望。'],
      ['我爹是山下铁匠。我第一次摸到灵铁那天，他哭了，说“咱家祖坟冒青烟了”。'],
    ] },
    peddler: { name: '俏掌柜', shop: 'talismans', beats: [
      ['哟，叶少侠！我这儿的符可都是开过光的——好吧，是开过灵的。'],
      ['偷偷告诉你，昨天林雪师姐来买过清心符，一口气买了二十张。', [0, '二十张？'], '可不是嘛，说是给新入门的师弟师妹备着。那位师姐呀，看着冷，心可软了。'],
      ['做生意嘛，最要紧的是笑。我笑一天能多卖三张符。'],
      ['你要是哪天去九曜锁灵阵那边，记得多带几张护身符。别问我怎么知道的，我是掌柜，什么都知道一点。'],
    ] },
    beast_keeper: { name: '饲养弟子', shop: null, beats: [
      ['嘘——小声点，鹤师兄在午睡。……它比我入门早，所以我叫它师兄。'],
      ['灵鹿最喜欢清晨的露水草。你要是摸它，从下巴往上摸，它会眯眼睛。'],
      ['笼里那只雀儿叫小团子，嘴碎，一天到晚学人说话。上回学掌门咳嗽，学得可像了。'],
    ] },
    board_keeper: { name: '宗务值事', shop: 'special', beats: [
      ['五曜商阁只收奇珍，价高——但童叟无欺。'],
      ['宗门贡献榜上，叶少侠的名字可往上爬了不少。再接再厉。'],
      ['我每天站在这儿记账。账本上全是数，可我记得每一笔后面是谁。'],
    ] },
  };

  // 炼器女修：给弟弟的第一把剑
  async function questSword() {
    const st = get('sword');
    if (st === 0) {
      await say('炼器女修', '叶少侠……能求你件事吗？');
      await say('炼器女修', '我弟弟下个月入外门。我想亲手给他打一把剑，剑柄要用狼牙做护手——狼牙镇邪，保他平安。');
      await say('炼器女修', '可我守着炉子走不开。你若历练时碰到妖狼，帮我带三颗狼牙回来好不好？');
      const c = await choose('帮炼器女修收集狼牙？', ['好，交给我', '下次吧']); if (c === 0) { set('sword', 1); toast('隐藏任务：给弟弟的第一把剑（狼牙 0/3）', 2400); await say('炼器女修', '谢谢你！我……我先给他把剑胚烧上。'); }
      return true;
    }
    if (st === 1) {
      if (cnt('m_fang') >= 3) {
        take('m_fang', 3); set('sword', 2);
        await say('炼器女修', '三颗狼牙！还都这么整齐……你一定挑过吧。');
        await narrate('她把狼牙一颗颗嵌进剑柄，炉火映着她的侧脸，眼睛亮亮的。');
        await say('炼器女修', '等他拿到剑，我会告诉他：护手上的狼牙，是一位叫叶孤星的师兄打来的。');
        await say('炼器女修', '这本剑谱是我当年入门时买的，翻得都起毛了。你拿去，比放在我这儿有用。');
        await give([[book(), 1], ['gold', 120]], '炼器女修');
      } else await say('炼器女修', '狼牙还差 ' + (3 - cnt('m_fang')) + ' 颗。不急的，你平安回来最要紧。');
      return true;
    }
    return false;
  }
  // 老修士：旧书签
  async function questBookmark() {
    const st = get('bookmark');
    if (st === 0 && get('c_storyteller') >= 3) {
      await say('老修士', '……那片银杏叶，大概就落在南湖观景台的石缝里了。我这把老骨头，弯不下腰喽。');
      const c = await choose('替老修士找回书签？', ['我去看看', '改天吧']); if (c === 0) { set('bookmark', 1); toast('隐藏任务：旧书签（去南湖观景台找找）', 2400); }
      return true;
    }
    if (st === 1 && get('bm_got')) {
      set('bookmark', 2);
      await narrate('老修士接过那片发黄的银杏叶，用袖口擦了很久。');
      await say('老修士', '叶脉都脆了……可它还在。');
      await say('老修士', '她当年夹着它的那一页，写的是“剑在心先，心在剑后”。我读了一辈子，才读懂。');
      await say('老修士', '这枚玉简，我留着也是压箱底。年轻人，你替我把这句话练出来。');
      await give([['yujian', 1]], '老修士');
      return true;
    }
    if (st === 1) { await say('老修士', '南湖观景台，石栏边上。不急，书签不会跑的——它等了我三十年了。'); return true; }
    return false;
  }
  // 老丹师：月露灵草
  async function questDew() {
    const st = get('dew');
    if (st === 0 && get('c_alchemist') >= 2) {
      await say('老丹师', '小友，帮老头子一个忙？后山溪边长着月露灵草，我想配一炉安神汤。');
      await say('老丹师', '给谁？……给典籍阁那个老家伙。他最近总睡不好，嘴上不说，眼圈黑得像墨。');
      const c = await choose('帮老丹师带月露灵草？', ['好', '下次吧']); if (c === 0) { set('dew', 1); toast('隐藏任务：月露灵草（后山溪边采集）', 2400); }
      return true;
    }
    if (st === 1) {
      if (cnt('moon_dew') >= 1) {
        take('moon_dew', 1); set('dew', 2);
        await say('老丹师', '好草，露水还没干呢。');
        await say('老丹师', '我们俩斗了一辈子嘴，他说我的药苦，我说他的书闷。可人老了，能斗嘴的就剩他一个了。');
        await say('老丹师', '这几颗丹药你收着。别跟他说是我托你的啊——就说是你自己孝敬的。');
        await give([['p_big', 2], ['p_mp', 2]], '老丹师');
      } else await say('老丹师', '月露灵草在后山溪边，月光照得到的石头缝里最多。');
      return true;
    }
    return false;
  }
  const merQuest = { artificer: questSword, storyteller: questBookmark, alchemist: questDew };
  const merMark = {
    artificer: () => get('sword') === 0 || (get('sword') === 1 && cnt('m_fang') >= 3),
    storyteller: () => (get('bookmark') === 0 && get('c_storyteller') >= 3) || (get('bookmark') === 1 && get('bm_got')),
    alchemist: () => (get('dew') === 0 && get('c_alchemist') >= 2) || (get('dew') === 1 && cnt('moon_dew') >= 1),
    beast_keeper: () => get('deer_pet') >= 3 && get('deer') !== 2,
  };
  async function talkMerchant(key) {
    const m = MER[key];
    if (key === 'beast_keeper' && get('deer_pet') >= 3 && get('deer') !== 2) {
      set('deer', 2);
      await say('饲养弟子', '灵鹿刚才一直往你那边看——它可从不主动亲近生人。');
      await say('饲养弟子', '它认你了。这是它前几日蜕下的茸角，磨成粉能救命。你收着。');
      await give([['p_revive', 1], ['gold', 60]], '饲养弟子'); return;
    }
    if (merQuest[key] && merMark[key] && merMark[key]()) { if (await merQuest[key]()) return; }
    const opts = [], acts = [];
    if (m.shop) { opts.push('看看货'); acts.push('shop'); }
    opts.push('聊聊'); acts.push('chat');
    if (merQuest[key] && get(key === 'artificer' ? 'sword' : key === 'storyteller' ? 'bookmark' : 'dew') === 1) { opts.push('关于托付的事'); acts.push('quest'); }
    opts.push('告辞'); acts.push('bye');
    const c = await choose(m.name, opts), act = acts[c];
    if (act === 'shop') await R.shop(m.shop);
    else if (act === 'chat') { await next(key, m.name, m.beats); if (merQuest[key] && merMark[key] && merMark[key]()) await merQuest[key](); }
    else if (act === 'quest') await merQuest[key]();
  }

  // ---------------- 十二位逛集市的人 ----------------
  const VIS = [
    { name: '外门弟子·阿石', beats: [
      ['下个月外门大比……我连木人桩都打不过。', [0, '木人桩不会还手。'], '对啊！所以更丢人了！'],
      ['听说叶师兄当年测灵碑，光柱冲得比藏经阁还高？……我测的时候，碑亮了一下，就一下。'],
      ['我想好了，今天买一本剑谱，明天开始每天早起。……后天再开始也行。'],
    ] },
    { name: '赵婆婆', q: 'oldpair', beats: [
      ['孩子，你是天剑宗的吧？我孙子小虎也在外门，我给他腌了一坛梅子。'],
      ['我家老头子说去买包桂花糖，一转眼人就没了。这把年纪了还乱跑……'],
    ] },
    { name: '青年·许言', beats: [
      ['想给小婉买支新发簪……可这集市上的簪子，没一支比得上她丢的那支。'],
      ['她那支是她娘留下的。我嘴笨，不知道该怎么哄她。'],
    ] },
    { name: '秦小婉', q: 'pin', beats: [
      ['……我没哭，是风沙迷眼睛了。'],
    ] },
    { name: '散修·老周', beats: [
      ['小兄弟，听说了吗？问剑坪那个叶孤星，一剑把试剑石劈出了火星子！', [0, '……是吗。'], '可不！我亲眼看见的——好吧，我听亲眼看见的人说的。'],
      ['我在这集市摆了二十年摊，看过的天才多了。真正走得远的，都是那种买完东西会说“谢谢”的。'],
      ['云霆那小子前天来买磨剑石，一口气砍价砍了半个时辰。剑法好，抠门也是一绝。'],
    ] },
    { name: '女弟子·苏铃', beats: [
      ['林雪师姐好厉害啊……练剑的时候，连飘下来的花瓣都会绕着她走。'],
      ['我偷偷学师姐把头发束高，结果被师父说像一根葱。'],
      ['叶师兄，你说……我以后也能像林雪师姐那样吗？', [0, '能。'], '真的？！那、那我今天多练一个时辰！'],
    ] },
    { name: '挑夫·大牛', beats: [
      ['这担灵米送去伙房，回去还得挑水。不累！一想到媳妇在家等我，浑身是劲。'],
      ['我媳妇做的葱油饼，比丹药还提神。真的，你不信改天来尝尝。'],
    ] },
    { name: '绣娘·阿芙', beats: [
      ['我绣的剑穗，一针一线都是祝福。挂在剑上，走夜路不怕黑。'],
      ['有个弟子每个月都来买一条剑穗，红色的。我问他为什么，他说剑穗断了，就说明它替他挡了一劫。'],
    ] },
    { name: '小师弟·清风', beats: [
      ['师兄好！我来替师父买药，钱攥在手里一路都不敢松……手心全是汗。'],
      ['我长大了也要当执剑弟子！现在先当跑腿弟子。'],
    ] },
    { name: '柳娘', q: 'girl', beats: [
      ['我家阿蘅一眨眼就不见了……那丫头从小就爱看鸟。'],
    ] },
    { name: '老樵夫', beats: [
      ['今早山上起雾，雾里的松树像一排排剑。天剑宗的山，连树都是剑的样子。'],
      ['我砍了一辈子柴，从没砍过天剑宗的松。掌门说过，那些树比宗门还老。'],
    ] },
    { name: '卖花姑娘·小荷', beats: [
      ['买枝灵兰吧？放在床头，夜里睡得香。'],
      ['不买也没关系，这枝送你。修行辛苦，总得有点好看的东西。'],
      ['花开一季，人活一世，都要开得漂漂亮亮的。'],
    ] },
  ];
  // ---------------- 八位驻足的看客 ----------------
  const ONL = [
    { name: '老书生·陈夫子', beats: [
      ['老朽在典籍阁门口站了三十年，书没买几本，倒是看完了一半。'],
      ['掌柜的从不赶我。他说“读书的人站在门口，书阁就有人气”。'],
    ] },
    { name: '女剑修·沈芷', beats: [
      ['那把寒铁剑……再攒两个月，就能买下了。'],
      ['我每天来看它一眼，生怕被别人买走。……说出来好像有点傻。'],
    ] },
    { name: '受伤弟子·韩平', q: 'han', beats: [
      ['（他捂着胳膊）昨日巡山被狼抓了一下……我在等丹师开门。'],
    ] },
    { name: '老阵师·鲁老', beats: [
      ['九曜锁灵阵？嘿，那阵眼讲究的是“破一而开九”。三颗破阵灵晶，缺一颗都不行。'],
      ['符阵坊这丫头画符的手艺，比我当年强。就是嘴太快，符纸上偶尔会多画一笔。'],
    ] },
    { name: '阿蘅', q: 'girl2', beats: [
      ['仙鹤刚才冲我点头了！你看见了吗？'],
      ['鸟雀叫小团子，会学人说话。我教它说“阿蘅最好看”，它学会了“阿蘅”。'],
    ] },
    { name: '富家公子·钱多多', beats: [
      ['五曜商阁的东西，本公子全都买得起！……就是这个月零花钱花完了。'],
      ['我爹说，钱买不来剑心。我觉得他在说我。'],
    ] },
    { name: '王老伯', q: 'oldpair2', beats: [
      ['五十年前，我就是在这儿，第一次见到我家老婆子。那时候她扎两根麻花辫。'],
      ['我买了桂花糖，一回头，人不见了。我就在这儿等她——她肯定会找到这儿来。'],
    ] },
    { name: '画师·墨娘', beats: [
      ['别动——对，就这样。你站在那儿，正好入画。'],
      ['我画集市，画的不是摊子，是人。买东西的人脸上，总藏着一点点欢喜。'],
    ] },
  ];

  async function talkVisitor(i) {
    const v = VIS[i], id = 'v' + i;
    // 秦小婉：发簪
    if (v.q === 'pin') {
      const st = get('pin');
      if (st === 0) {
        await say(v.name, '……我没哭，是风沙迷眼睛了。');
        await say(v.name, '刚才在灵兽苑边上，我的玉簪滑下来，那只仙鹤一低头就叼走了……那是我娘留给我的。');
        await say('青年·许言', '我去追，它扑棱翅膀就把我扇了回来。');
        const c = await choose('帮秦小婉要回发簪？', ['我去找仙鹤', '再说吧']); if (c === 0) { set('pin', 1); toast('隐藏任务：仙鹤叼走的发簪（去灵兽苑找仙鹤）', 2400); await say(v.name, '真的吗？谢谢你！它……它要是不给，你别跟它打啊，它也不是坏鹤。'); }
        return;
      }
      if (st === 1 && get('pin_got')) {
        set('pin', 2);
        await narrate('秦小婉接过玉簪，手指一直在发抖。');
        await say(v.name, '就是这支……娘，我找回来了。');
        await say('青年·许言', '（小声）谢谢你，师兄。她今天第一次笑。');
        await say(v.name, '这颗灵晶是我在山脚捡的，亮晶晶的，我一直当宝贝。你在宗门里，它比在我这儿有用。');
        await give([['yunxingshi', 1]], '秦小婉'); return;
      }
      if (st === 1) { await say(v.name, '仙鹤就在灵兽苑里……你小心点。'); return; }
      await next(id, v.name, [['（她把玉簪插得稳稳的）这回再也不会掉了。'], ['许言说下回要请你喝茶，你可一定要来。'], ['娘以前说，好人会有好报。我现在信了。']]); return;
    }
    if (v.q === 'girl') {
      const st = get('girl');
      if (st === 0) { await say(v.name, '少侠，你看见一个穿绿衣裳的小姑娘吗？我家阿蘅，一眨眼就不见了……'); await say(v.name, '那丫头从小就爱看鸟，八成跑去哪儿看热闹了。'); set('girl', 1); toast('隐藏任务：找阿蘅（穿绿衣的姑娘，爱看鸟）', 2400); return; }
      if (st === 1 && get('girl_found')) {
        set('girl', 2); await say(v.name, '在灵兽苑？这丫头！……找到就好，找到就好。');
        await say(v.name, '这个香囊是我自己缝的，里头装了两颗回春丹。出门在外的孩子，都得有人惦记着。');
        await give([['p_small', 2]], '柳娘'); return;
      }
      if (st === 1) { await say(v.name, '绿衣裳，爱看鸟……拜托你了。'); return; }
      await next(id, v.name, [['阿蘅说长大了要来天剑宗养仙鹤。我说好，娘给你攒束脩。'], ['谢谢你帮我找到她。当娘的，一刻看不见孩子就慌。']]); return;
    }
    if (v.q === 'oldpair') {
      const st = get('oldpair');
      if (st < 1) { await next(id, v.name, v.beats); if (get('c_v1') >= 2 && !get('oldpair')) { set('oldpair', 1); toast('隐藏任务：赵婆婆找老伴', 2400); } return; }
      if (st === 1 && get('oldpair_seen')) {
        set('oldpair', 2); await say(HERO, '婆婆，老伯在集市南边等您，他说那是您俩第一次见面的地方。');
        await say(v.name, '……这死老头子。五十年了，还记得。');
        await narrate('赵婆婆嘴上骂着，眼角却笑出了褶子。');
        await say(v.name, '孩子，这坛梅子给你分一小罐。本来是给小虎的——他嫌酸，你不会嫌吧？');
        await give([['p_revive', 1]], '赵婆婆'); return;
      }
      if (st === 1) { await say(v.name, '他呀，八成又跑去什么老地方发呆了……'); return; }
      await next(id, v.name, [['我跟老头子说好了，等小虎出师，我们俩就搬到山脚下住。'], ['孩子，多吃饭。修仙也得吃饭。']]); return;
    }
    await next(id, v.name, v.beats);
  }
  async function talkOnlooker(i) {
    const v = ONL[i], id = 'o' + i;
    if (v.q === 'han') {
      const st = get('han');
      if (st === 0) {
        await say(v.name, '（他捂着胳膊）昨日巡山被狼抓了一下，不碍事……就是丹师还在忙，我在等。');
        if (cnt('p_small') >= 1) { const c = await choose('给韩平一颗回春丹？', ['给他一颗', '算了']); if (c === 0) { take('p_small', 1); set('han', 2); await narrate('韩平愣了一下，接过丹药吞了下去，脸色好了很多。'); await say(v.name, '我跟你非亲非故的……谢谢。我叫韩平，以后巡山遇到你，狼我来挡。'); await say(v.name, '这点灵石你别推，我这月刚领了例钱。'); await give([['gold', 80]], '韩平'); } }
        return;
      }
      await next(id, v.name, [['胳膊好了，今天能多劈两百剑。'], ['那天要不是你，我得疼一宿。……以后有事，喊我一声。'], ['我跟师弟们说了，集市上有个叶师兄，人可好了。']]); return;
    }
    if (v.q === 'girl2') {
      if (get('girl') === 1 && !get('girl_found')) { set('girl_found', 1); await say(HERO, '你是阿蘅吧？你娘在集市上急着找你。'); await say(v.name, '呀！我、我就看了一会儿仙鹤……'); await say(v.name, '我马上回去！谢谢大哥哥！'); return; }
      await next(id, v.name, v.beats); return;
    }
    if (v.q === 'oldpair2') {
      if (get('oldpair') === 1 && !get('oldpair_seen')) { set('oldpair_seen', 1); await next(id, v.name, v.beats.slice(1)); await say(HERO, '赵婆婆在集市上找您呢。'); await say(v.name, '哎呀！她又要骂我了……你帮我跟她说，我在老地方等她，她就懂了。'); return; }
      if (get('oldpair') === 2) { await say(v.name, '她来了，骂了我一路，还把桂花糖全吃了。……嘿嘿。'); return; }
      await next(id, v.name, v.beats); return;
    }
    if (i === 7 && doneCount() >= 4 && !get('paint')) {
      set('paint', 1); await say(v.name, '这些日子我画了好多张集市。你看——这是秦小婉戴着玉簪，这是韩平在劈剑，这是赵婆婆和王老伯在老地方。');
      await say(v.name, '画着画着才发现，每张画里都有你的影子。这张送你，算我谢谢你。');
      await give([['c_jade', 1], ['gold', 100]], '墨娘'); return;
    }
    await next(id, v.name, v.beats);
  }
  // 灵兽
  async function talkCrane() {
    if (get('pin') === 1 && !get('pin_got')) {
      await narrate('仙鹤歪着头看你，嘴里衔着一点亮晶晶的东西。');
      const c = await choose('怎么让仙鹤松口？', ['伸手去抢', '蹲下来，安静地等', '学一声鹤鸣']);
      if (c === 0) { await narrate('仙鹤一扑翅，把你扇了个趔趄，玉簪还衔在嘴里。'); await say('饲养弟子', '别抢别抢！鹤师兄吃软不吃硬。'); return; }
      if (c === 2) await narrate('你“咕——”地叫了一声。仙鹤愣住了，看你的眼神像在看一只奇怪的鹤。然后它把玉簪轻轻放在了你脚边。');
      else await narrate('你蹲下来，一动不动。过了好一会儿，仙鹤踱到你面前，低头把玉簪放进了你手心。');
      set('pin_got', 1); toast('取回：秦小婉的玉簪', 2000); await say('饲养弟子', '它就是喜欢亮的东西……谢谢你没凶它。'); return;
    }
    const L2 = ['仙鹤单脚立着，脖子弯成一道好看的弧，眯着眼晒太阳。', '仙鹤展开翅膀，绕着你踱了一圈，像在检阅新来的弟子。', '仙鹤低头啄了啄你的衣角——大概在确认你是不是能吃的。'];
    await narrate(L2[get('c_crane') % L2.length]); set('c_crane', get('c_crane') + 1);
  }
  async function talkDeer() {
    const n = get('deer_pet');
    if (n >= 3) { await narrate(['灵鹿把脑袋搁在你肩上，呼出的气暖暖的。', '灵鹿轻轻舔了一下你的手背。'][n % 2]); set('deer_pet', n + 1); return; }
    const L2 = ['你伸出手，灵鹿退了半步，警惕地看着你。', '你从下巴往上轻轻挠，灵鹿眯起了眼睛。', '灵鹿主动把脑袋凑过来，蹭了蹭你的掌心。'];
    await narrate(L2[n]); set('deer_pet', n + 1);
    if (n + 1 === 3 && get('deer') !== 2) toast('灵鹿亲近了你——去跟饲养弟子说说？', 2400);
  }
  async function talkBookmarkSpot(a) {
    if (get('bookmark') !== 1 || get('bm_got')) { await narrate('湖风吹过观景台，水面上一圈圈涟漪慢慢散开。'); return; }
    await narrate('石栏的缝隙里，卡着一片发黄的银杏叶。叶面上，有一行很淡的小字。');
    await narrate('「剑在心先，心在剑后。」');
    set('bm_got', 1); toast('取回：旧银杏书签', 2000);
  }

  // ---------------- 建交互点（跟着人走）----------------
  const T = TMAPS[ID], spots = [], h = 132;
  const follow = (uid, name, talk, at, hh = h) => { const [c, r] = P(at[0], at[1]); const n = { key: 'none', c, r, name, hidden: true, h: hh, r60: uid, talk: async a => { M.hold.add(uid); try { await talk(a); } finally { M.hold.delete(uid); } } }; spots.push(n); return n; };
  for (const n of L.npcs) if (MER[n.key]) follow('npc_' + n.key, MER[n.key].name, () => talkMerchant(n.key), n.home).mapLabel = true;
  (L.visitors || []).forEach((v, i) => { if (VIS[i]) follow(v.id, VIS[i].name, () => talkVisitor(i), v.legs[0].points[0]); });
  (L.onlookers || []).forEach((v, i) => { if (ONL[i]) follow(v.id, ONL[i].name, () => talkOnlooker(i), v.anchor); });
  follow('m-crane', '仙鹤', talkCrane, L.crane, 170);
  follow('m-deer', '灵鹿', talkDeer, L.deer, 150);
  const pd = L.pond; if (pd) { const at = atIn(ID, pd.center[0] - pd.rx - 40, pd.center[1]); if (at) spots.push({ key: 'none', c: at[0], r: at[1], name: '南湖观景台', hidden: true, h: 140, talk: talkBookmarkSpot }); }
  // 集市原有的“店铺门面”点，店主走开了也能买；但店主本人在门口时让给店主
  for (const n of T.npcs) if (!n.r60) n.h = Math.min(n.h || 130, 100);
  T.npcs.push(...spots);

  // ---------------- 每帧：交互点跟着人走 ----------------
  tileAmbientLow = (orig => function (T2, cam, now) {
    if (orig) orig(T2, cam, now);
    if (world.mapName !== ID) return;
    const byId = {}; for (const a of R.actors()) byId[a.uid] = a;
    for (const a of world.actors) if (a.npc && a.npc.r60) { const p = byId[a.npc.r60]; if (p) { a.x = p.anchor[0]; a.y = p.anchor[1]; } }
  })(tileAmbientLow);

  // 名字（走近才显示）+ 任务「！」
  const NAMEOF = {}; (L.visitors || []).forEach((v, i) => VIS[i] && (NAMEOF[v.id] = VIS[i].name.split('·').pop())); (L.onlookers || []).forEach((v, i) => ONL[i] && (NAMEOF[v.id] = ONL[i].name.split('·').pop()));
  const MARK = {
    'npc_artificer': merMark.artificer, 'npc_storyteller': merMark.storyteller, 'npc_alchemist': merMark.alchemist, 'npc_beast_keeper': merMark.beast_keeper,
    'visitor-3': () => get('pin') === 0 || (get('pin') === 1 && get('pin_got')),
    'visitor-9': () => get('girl') === 0 || (get('girl') === 1 && get('girl_found')),
    'visitor-1': () => get('oldpair') === 1 && get('oldpair_seen'),
    'onlooker-2': () => get('han') === 0 && cnt('p_small') > 0,
    'onlooker-4': () => get('girl') === 1 && !get('girl_found'),
    'onlooker-6': () => get('oldpair') === 1 && !get('oldpair_seen'),
    'onlooker-7': () => doneCount() >= 4 && !get('paint'),
    'm-crane': () => get('pin') === 1 && !get('pin_got'),
  };
  window.R60_NPC = {
    // 人被柜台/货架/石头挡住时，不画头顶名字（不然名字浮在家具上）
    hidden(o) {
      const T = world.map && world.map.T; if (!T) return false; const [ax, ay] = o.anchor;
      for (const b of T.objs) { if (!b.bk || b.r60 || b.flat || b.sy <= ay || b.sy - ay > 220) continue;
        if (ax > b.x + b.w * .12 && ax < b.x + b.w * .88 && b.y < ay - 30) return true; }
      return false;
    },
    label(o) {
      const p = world.player; if (!p) return null; if (this.hidden(o)) return null; const d = Math.hypot(o.anchor[0] - p.x, o.anchor[1] - p.y);
      const mk = MARK[o.uid] && MARK[o.uid]() ? '!' : '';
      const nm = d < 260 && NAMEOF[o.uid] ? NAMEOF[o.uid] : '';
      return nm || mk ? { name: nm, mark: mk } : null;
    },
    VIS, ONL, MER, doneCount, NAMEOF, MARK,
  };
})();
