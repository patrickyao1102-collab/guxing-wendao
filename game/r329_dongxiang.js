// ================= R329 · 支线「东厢朝南」（丹霞堂师兄弟的中秋）（只进测试版）=================
// 作者 11-16 定的剧情，文档《支线「东厢朝南」完整剧情》。素材（东厢、后院、回忆、中秋夜动作帧）Codex R316 在做；
// 没到之前：东厢借云来天字四号房的屋子，五样能看的东西用画出来的小图标代替；回忆、中秋夜用旁白演。
// 进度 n：0 捎明目丹去青阳 → 1 等桂花糕（要先离开百草轩再回来）→ 2 捎糕回丹霞堂 → 3 东厢给谁收拾的（问小莲、听雨楼、进东厢）
//        → 4 回青阳跟师弟说（关键抉择）→ 5 中秋夜去丹霞堂 → 6（失败后重做）去青阳后山找师弟
// 结局：east 东厢朝南 / cake 两包桂花糕 / 失败「落了的桂花」（可重做）。隐藏：传闻之后自己去问掌柜「要娶老板娘？」（不提示）。
// 影响「迟了一刻的灯」：east → 师弟住丹霞堂，匣子带来了，不用跑青阳；失败未重做 → 百草轩关门，要去青阳后山找师弟拿钥匙。
(function () {
  if (typeof TMAPS === 'undefined' || !window.SQ_DEFS || !TMAPS.xt_danxia || !TMAPS.qy_herb || !TMAPS.xt_teahouse) return;
  const F = () => (S.flags = S.flags || {});
  const st = id => ((F().sq = F().sq || {})[id] = F().sq[id] || { s: 0, n: 0 });
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const ID = 'dx_east', q = () => st(ID), on = () => q().s === 1, N = () => q().n;
  const WANG = '王婶', YE = '叶孤星', XX = '星旋', XI = '丹霞堂掌柜', DI = '百草轩掌柜', HUO = '丹霞堂伙计', HE = '卖花姑娘·小荷', LIAN = '卖花姑娘·小莲', BOSS = '听雨楼掌柜', NIANG = '抓药的娘子';
  const toastT = t => { try { toast(t, 2600); } catch (e) {} };
  const GOALS = ['把明目丹捎到青阳镇百草轩', '过两天再去百草轩，取桂花糕', '把桂花糕捎回玄天城丹霞堂', '东厢是给谁收拾的？', '回青阳百草轩，跟师弟说', '中秋夜，去丹霞堂', '去青阳后山，找到百草轩掌柜'];
  const Q = { id: ID, name: '东厢朝南', giver: ['xt_danxia', XI], where: '玄天城 · 丹霞堂 · 掌柜', cond: () => !!F().ml_done /* 作者 11-17：凶杀案（名录）结案以后才有 */, type: 'kill', kill: { maps: ['__dx__'], mobs: ['__dx__'] }, n: 6, reward: { exp: 900, gold: 600 } };
  Object.defineProperty(Q, 'goal', { enumerable: true, get() { const g = F().dx_gui; if (N() === 1 && F().dx_away && g === 1) return '去街口卖花的小荷那儿，买一枝金桂'; if (N() === 1 && g === 2) return '把金桂拿回百草轩'; return GOALS[Math.min(GOALS.length - 1, N())]; } });
  Object.defineProperty(Q, 'desc', { enumerable: true, get() { return '丹霞堂掌柜托你给青阳百草轩的师弟捎一盒明目丹。木匣底下，还压着一张折好的字条。'; } });
  SQ_DEFS.push(Q);
  Object.assign(ITEM_DB, {
    k_dx_box: { name: '明目丹木匣', slot: null, price: 0, desc: '丹霞堂掌柜托你捎去青阳的。匣底压着一张折好的字条。' },
    k_dx_cake: { name: '一笼桂花糕', slot: null, price: 0, desc: '百草轩掌柜亲手做的，还热着。旁边一小包金疮药，一枝金桂。' },
    p_tongxin: { name: '同心丹', use: 'heal', hp: 3000, mp: 600, price: 0, desc: '一个看火，一个下药，两人一炉炼的。气血、灵力几乎全满。' } });
  const give = id => { try { addItem(id, 1); } catch (e) {} };
  const take = id => { try { const b = S.hero.bag || {}; if (b[id]) { b[id]--; if (b[id] <= 0) delete b[id]; } } catch (e) {} };

  // ---------- 小工具 ----------
  const hook = (mid, name, fn) => { const M = TMAPS[mid], n = M && (M.npcs || []).find(n => n.name === name && !n.hidden); if (!n) { console.warn('R329：找不到', mid, name); return null; } const orig = n.talk;
    n.talk = async function (a) { let done = false; try { done = await fn(n); } catch (e) { console.warn('R329', name, e); } if (done) return;
      if (typeof orig === 'function') return orig.call(this, a); const A = Array.isArray(orig) ? orig : [orig || '……']; for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(n.name, l); }; return n; };
  const add = (mid, n) => { (TMAPS[mid].npcs = TMAPS[mid].npcs || []).push(n); return n; };
  const spot = (mid, x, y, name, talk, extra) => { const [c, r] = P(x, y); return add(mid, Object.assign({ key: 'none', c, r, name, hidden: true, h: 110, talk }, extra || {})); };
  const tpl = name => { for (const T of Object.values(TMAPS)) for (const n of (T && T.npcs) || []) if (n && n.name === name && !n.hidden && !n._r329) return n; return null; };
  const clone = (mid, name, x, y, talk, cond, face) => { const t = tpl(name); if (!t) return null; const [c, r] = P(x, y);
    return add(mid, Object.assign({}, t, { c, r, talk, cond, face: face || 'down', wander: false, _r329: 1, mark: null })); };
  // 街上走的访客（卖花姑娘）：进图时才生成，这里按名字把对话包一层
  const visitor = (mid, name, fn) => { tileSetMap = (o => function (m) { const r = o.apply(this, arguments);
    try { if (m === mid) for (const a of world.actors || []) if (a.npc && a.npc.name === name && !a.npc._r329v) { const n = a.npc, orig = n.talk; n._r329v = 1;
      n.talk = async function (x) { let done = false; try { done = await fn(n); } catch (e) { console.warn('R329', e); } if (done) return; if (typeof orig === 'function') return orig.call(this, x); }; } } catch (e) {}
    return r; })(tileSetMap); };

  // ---------- 东厢（暂借云来天字四号房的屋子；Codex R316 的东厢到了再换）----------
  const SRC = TMAPS.xt_inn_room4 || TMAPS.xt_inn_room1;
  const EAST = TMAPS.dx_east = Object.assign({}, SRC, { title: '丹霞堂 · 东厢', npcs: [], chests: [], doors: [], onEnter: null,
    exits: (SRC.exits || []).slice(0, 1).map(e => Object.assign({}, e, { to: 'xt_danxia', at: P(930, 640), face: 'down', label: '出门 · 丹霞堂', cond: null, msg: '' })) });
  try { if (MAP_ZOOM[SRC === TMAPS.xt_inn_room4 ? 'xt_inn_room4' : 'xt_inn_room1']) MAP_ZOOM.dx_east = MAP_ZOOM.xt_inn_room4 || MAP_ZOOM.xt_inn_room1; if (typeof WIDE_OK === 'object') WIDE_OK.dx_east = 1; } catch (e) {}
  const ICON = [];   // 代替素材的小图标：[x, y, 字, 名字]
  const seen = k => { const f = F(); f.dx_seen = f.dx_seen || {}; const first = !f.dx_seen[k]; f.dx_seen[k] = (f.dx_seen[k] || 0) + 1; return first; };
  const allSeen = () => { const s = F().dx_seen || {}; return ['lamp', 'bed', 'flower', 'mill', 'tray'].every(k => s[k]); };
  const checkAll = () => { if (on() && N() === 3 && allSeen()) { q().n = 4; toastT('东厢朝南 —— 回青阳百草轩，跟师弟说'); } };
  const look = (k, x, y, icon, name, lines, again) => { ICON.push([x, y, icon, name]);
    spot('dx_east', x, y + 30, name, async () => { const first = seen(k); await L(first || !again ? lines : again); checkAll(); }); };
  look('lamp', 470, 440, '🏮', '窗边的灯', [['', '窗边一盏灯。灯罩外面又蒙了一层薄纱，光变得很柔。'], [HUO, '掌柜自己蒙的，说晚上看字不刺眼。']]);
  look('bed', 630, 560, '🛏', '床', [['', '新的丝绵被褥，厚得能堆个小山。屋子朝南，午后太阳正好照在床上。'], [HUO, '听雨楼买的丝绵。……老板娘怕冷，对吧？']]);
  look('flower', 360, 600, '🌼', '窗台上的桂花', [['', '一只瓷瓶插满了桂花，开得正好，满屋都是香味。'], [HUO, '听雨楼的招牌，就是桂花茶。']]);
  look('mill', 770, 620, '🪨', '墙边的矮凳和石碾', [['', '墙边一张矮凳，一只旧石碾。凳面磨得发亮。'], [HUO, '听说听雨楼的茶，都是现碾的。']],
    [['', '你凑近又看了一眼。碾槽的缝里卡着一点褐色的渣，闻着发苦。'], ['', '……不像茶。']]);
  look('tray', 478, 790, '🍵', '茶盘', [['', '茶盘里摆着一只旧茶盏，窑里烧出来的桂花纹。旁边放着一只空盏托，什么也没有。'], [HUO, '那只旧的，是掌柜自己用了十年的。我说给配只新的，掌柜不让，说「另一只，得等人带来」。'],
    [HUO, '听雨楼老板娘收了一屋子茶盏……是要她带一只来？']]);
  // 中秋夜：师兄弟都在东厢
  clone('dx_east', XI, 560, 700, async () => say(XI, '……屋子没怎么收拾。'), () => N() === 5 && F().dx_night, 'down');
  clone('dx_east', DI, 640, 700, async () => say(DI, '被褥太厚了。'), () => N() === 5 && F().dx_night, 'down');
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function (T, cam, now) { o && o.apply(this, arguments);
    try { if (world.mapName !== 'dx_east') return; ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const [x, y, ic] of ICON) { ctx.fillStyle = 'rgba(255,248,230,.85)'; ctx.strokeStyle = 'rgba(120,80,40,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill(); ctx.stroke(); ctx.font = '30px sans-serif'; ctx.fillStyle = '#000'; ctx.fillText(ic, x, y + 1); }
      ctx.restore(); } catch (e) {} })(tileAmbientHigh);

  // ---------- 第一幕：丹霞堂（接取）----------
  const shopTalk = async () => { const f = F(), s = q();
    const opts = []; if (s.n >= 2 && s.n <= 4) opts.push('「师弟中秋……不来了。」（就此交差）'); if (f.dx_rumor && s.n >= 2 && s.n <= 4) opts.push('闲聊两句'); opts.push('走了');
    const k = await choose(XI, opts), pick = opts[k];
    if (pick === '闲聊两句') { const c = await choose('闲聊', ['「听说掌柜要娶听雨楼的老板娘了？」', '「生意还好？」', '算了']);
      if (c === 0) { f.dx_nobride = 1;
        await L([[YE, '听说掌柜要娶听雨楼的老板娘了？'], ['', '掌柜一口茶喷在了炉盖上，「嗤」地一声冒起一股白气。'], [XI, '谁要娶她？！我是去跟她学——'], ['', '他自己把话咽了回去，低头去拨炉底的灰。拨了很久。'],
          [YE, '青阳那边都这么传。百草轩掌柜也听说了。'], [XI, '（手里的火钳「当」地掉在地上）……师弟信了？'], [XI, '没有什么娶亲。你就跟师弟说，没有。'], [XI, '其他的……你自己看着说吧。']]); return true; }
      if (c === 1) { await say(XI, '还行。'); return true; } return true; }
    if (pick && pick.indexOf('不来了') > 0) return endCake();
    return true; };
  hook('xt_danxia', XI, async () => { const f = F(), s = q();
    if (s.s === 3) { await say(XI, f.dx_end === 'east' ? '师弟在后头碾药。……你别进去吵他。' : '……明年。明年他会来的。'); return true; }
    if (s.s === 1) {
      if (s.n === 0 || s.n === 1) { await say(XI, '还没动身？匣子别磕着。'); return true; }
      if (s.n === 2) { take('k_dx_cake');
        await L([[YE, '百草轩掌柜让我捎来的，还有这枝金桂。他说……铺子忙，中秋走不开。'], ['', '掌柜接过桂花糕，没有打开，就那么托在手里。炉子里的火——慢慢小了下去。'], [XI, '……知道了。'],
          [YE, '还有这个。他说给你擦手。'], ['', '那包金疮药，他看了很久，揣进了怀里。'], [XI, '他配的金疮药，比我的好。……这话别告诉他。'], [XI, '行了，多谢。你去吧。'],
          [HUO, '（追到门口，压低声音）少侠少侠——青阳那位，是不是不来了？'], [HUO, '哎。那东厢白收拾了。……也不对，掌柜从没说过是收拾给谁的。……不过街上都在传，是给听雨楼老板娘的。']]);
        s.n = 3; toastT('东厢朝南 —— 东厢是给谁收拾的？'); return true; }
      if (s.n === 5) { await night(); return true; }
      return shopTalk(); }
    if (!Q.cond()) return false;
    await L([['', '丹炉里的火烧得正旺。掌柜单手扶着炉盖，另一只手的手背上，有两道新结的疤。'], [XI, '买丹？柜上有。'], [XI, '……等等。你上回说，你是从青阳来的？'], [YE, '是。'],
      [XI, '（从柜底拿出一只小木匣）顺路的话，捎给百草轩那个傻小子。明目丹，一天一颗。他晚上点灯配药，眼睛早晚要熬坏。'],
      ['', '他递匣子的时候，你看见他手背上那两道疤，还泛着红。'], [YE, '掌柜的手……'],
      [HUO, '（从柜台后面探出头来抢话）就是炼这盒明目丹烫的！掌柜一连炼了三炉，前两炉嫌火气重，全倒了——第三炉开炉的时候，他连炉布都没垫……'], [XI, '话多。看你的炉去。'],
      [HUO, '（缩回去）……那小的给您拿烫伤药？'], [XI, '不用。'], [YE, '百草轩掌柜是……'], [XI, '我师弟。'], [XI, '（又往匣子底下塞了一张折好的字条）里头还有张字条。别偷看。'], [XI, '你什么时候动身？']]);
    const k = await choose('支线 · 东厢朝南', ['「这就去。」（报酬：修为 +900、灵石 600，另有相赠）', '下次再说']); if (k !== 0) return true;
    s.s = 1; s.n = 0; f.dx_seen = {}; give('k_dx_box'); try { playSnd('ui_confirm'); } catch (e) {}
    await say(XI, '……嗯。路上别磕着那匣子。'); toastT('接取支线：东厢朝南 —— 把明目丹捎到青阳百草轩'); return true; });
  // 伙计：带你进东厢
  hook('xt_danxia', HUO, async () => { if (!on() || N() < 3 || N() > 4) return false;
    await L([[HUO, '少侠，想看看东厢？……趁掌柜在前堂看炉，快看快看，掌柜一会儿就回来。']]);
    const c = await choose(HUO, ['跟他去东厢', '不了']); if (c !== 0) return true;
    try { await fadeOut(250); } catch (e) {} tileSetMap('dx_east', ...P(860, 820), 'up'); S.scene = drawMap; try { await fadeIn(250); } catch (e) {} return true; });

  // ---------- 第二幕 / 第三幕：青阳百草轩 ----------
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { try { if (on() && N() === 1 && m !== 'qy_herb') F().dx_away = 1; } catch (e) {} return o.apply(this, arguments); })(tileSetMap);
  const shut = () => !!F().dx_shut;
  { const n = (TMAPS.qy_herb.npcs || []).find(n => n.name === DI); if (n) { const c0 = n.cond; n.cond = () => !shut() && (typeof c0 === 'function' ? c0() : true); } }
  spot('qy_herb', 528, 420, '门上的字条', async () => say('', '柜台上压着一张字条：「进山采药，归期未定。」'), { cond: () => shut() });
  // 王婶（来百草轩抓药的街坊）：说话的人要站在图上——第一次送匣子、和买金桂回来那两场她都在铺子里
  { const t = tpl(NIANG); if (t) add('qy_herb', Object.assign({}, t, { name: WANG, c: P(300, 520)[0], r: P(300, 520)[1], face: 'right', wander: false, _r329: 1, mark: null,
      talk: async () => say(WANG, '抓两副安神的。……掌柜的配药，比城里的还灵。'),
      cond: () => on() && (N() === 0 || (N() === 1 && F().dx_gui === 2)) })); }
  hook('qy_herb', DI, async () => { const f = F(), s = q(); if (!on()) return false;
    if (s.n === 0) { take('k_dx_box');
      await L([['', '百草轩里一股苦香。掌柜坐在柜台后，低着头慢慢推着药碾。秋天还没凉透，他脖子上已经绕了两圈厚围巾，脚边生着一只小火盆。'], [DI, '客官报药方——哦，是你呀，天剑宗的少侠。'],
        [YE, '（递上木匣）玄天城丹霞堂，托我捎来的。'], ['', '他打开匣子，把里头的纸签凑到灯底下，鼻尖快贴到纸上了，才看清字。然后他笑了。'], [DI, '明目丹……师兄的字还是这么丑。'],
        [DI, '师兄好吗？手上有没有烫着？'], [YE, '……有两道新疤。'], [DI, '（叹口气）就知道。小时候就这样，烫了还硬说不疼。'],
        ['', '他给你倒茶。他自己的茶盏很旧，窑里烧出来的桂花纹，盏沿磕了一个小口。'], [YE, '这盏子缺了个口，不换一只？'], [DI, '师父留下的，原本是一对。另一只……不在我这儿。缺了口也能喝。'],
        ['', '匣子底下压着那张字条。他把字条展开，凑到灯底下看了很久。手里的药碾，不知什么时候停了。'], [DI, '（低头笑了一下）十年了，师兄头一回开口叫我去玄天城过中秋。'],
        [DI, '后面还跟一句「不来也行」。……师兄就是这样，想要什么，从来不好好说。'], [YE, '那你去吗？'], [DI, '我……想想。你过两天再来，我把桂花糕做好，你替我捎回去。'],
        [WANG, '掌柜的是该出去走走了。一个人守着这铺子十年，年年中秋就坐在门口看月亮。'], [DI, '哎，王婶，您的药——当心烫。']]);
      s.n = 1; f.dx_away = 0; toastT('东厢朝南 —— 过两天再去百草轩（先去别处转转）'); return true; }
    if (s.n === 1) { if (!f.dx_away) { await say(DI, '桂花糕还在蒸笼里呢。少侠先去镇上转转，回头再来。'); return true; }
      // 作者 11-16：八卦不能「冲进别人家里说」。改成：快中秋了，掌柜托你去街口卖花的小荷那儿买一枝金桂，跟糕一起捎给师兄；
      // 小荷包花的时候顺嘴说起姐姐的来信（花摊上聊天，自然）；你回铺子时，抓药的王婶也在，正把这事当新鲜事讲给掌柜听。
      if (!f.dx_gui) {
        await L([['', '柜台上摆着一笼刚蒸好的桂花糕，热气还没散。掌柜在糕上一块一块地撒糖桂花，哼着个小曲。'], [DI, '少侠来得正好。我想好了——'],
          [DI, '快中秋了。师兄最爱金桂，玄天城的桂花开得晚，这会儿还没香。街口卖花的小荷那儿有早开的金桂，劳烦少侠替我挑一枝，跟糕一起捎去。'],
          [DI, '（摸出几枚灵石）挑开得正好的，别要全开的——路上一颠，花就落了。']]);
        f.dx_gui = 1; toastT('东厢朝南 —— 去街口卖花的小荷那儿，买一枝金桂'); return true; }
      if (f.dx_gui === 1) { await say(DI, '小荷的花摊就在街口。……挑开得正好的。'); return true; }
      await L([['', '你拿着金桂回到百草轩。铺子里多了个人——王婶来抓药，正倚着柜台跟掌柜说话。'],
        [WANG, '……可不是嘛，小荷那丫头满街都在说，她姐姐从玄天城来的信——丹霞堂那位掌柜，把后院东厢收拾出来了，新被褥、新茶盏。'],
        [WANG, '还说他这半个月天天往听雨楼跑，跟那位老板娘在雅间里一坐就是半天。哎哟，掌柜的，你师兄这是要成亲了吧？'],
        ['', '掌柜手里的糖桂花撒多了，撒了一笼屉。'], [DI, '……是吗。'], [DI, '那是好事。师兄也老大不小了，是该有个人管着擦药了。'],
        [WANG, '（拎起药包，回头看了一眼）掌柜的，药钱回头再给你啊。'], ['', '王婶拎着药包出了门。掌柜把桂花糕重新整了一遍，整了很久。'],
        [DI, '（接过金桂，看了一会儿，又递回给你）……这枝也一并带去吧。'], [DI, '中秋我就不去了。人家家里要办喜事，我去凑什么热闹。'],
        [DI, '（递过桂花糕和一小包药）这个替我捎去。金疮药是给师兄手上的。师兄炼丹，手上总有烫伤，自己从来不擦。'], [DI, '就说……就说铺子忙，走不开。'], [XX, '（小子，就这么回去交差？）']]);
      try { world.actors = world.actors.filter(a => !(a.npc && a.npc.name === WANG)); } catch (e) {}
      give('k_dx_cake'); f.dx_rumor = 1; s.n = 2; toastT('东厢朝南 —— 把桂花糕和金桂捎回丹霞堂'); return true; }
    if (s.n === 4) { await choiceScene(); return true; }
    if (s.n === 2 || s.n === 3) { await say(DI, '桂花糕路上别压着。……师兄收到了吗？'); return true; }
    return false; });

  // ---------- 第四幕：玄天城打听 ----------
  visitor('xt_city', LIAN, async () => { if (!on() || N() < 3 || N() > 4) return false; const f = F();
    await L([[LIAN, '哟，少侠。见过我妹妹小荷没有？她是不是又把我的信念给人听了？'],
      [LIAN, '我亲眼看见的——丹霞堂掌柜天天一打烊就去听雨楼，老板娘亲自引他上雅间。前天还见他从听雨楼抱出一大卷丝绵——做被褥用的。'],
      [LIAN, '一个全城最好的丹师，一个全城最精明的老板娘。你说，配不配？']]); f.dx_lian = 1; return true; });
  hook('xt_teahouse', BOSS, async () => { if (!on() || N() < 3 || N() > 4) return false; const f = F();
    if (!f.dx_tea) await L([['喝茶的老修士', '丹霞堂那位？天天来，一来就上雅间，老板娘亲自待着。一壶茶喝到打烊。'], ['歇脚的散修', '老板娘守寡五年了，提亲的人得排到城门口。哪个没碰一鼻子灰？就丹霞堂那位，她笑着迎进门。']]);
    await L([[BOSS, '少侠也来打听丹霞堂？（拢了拢披肩）秋天了，我这人怕冷，少侠莫笑。'], [YE, '丹霞堂掌柜天天来这儿……'], [BOSS, '他来找我，是为了一个人。（笑）是谁，你得问他。'],
      [BOSS, '他在我这儿买了丝绵，买了桂花，还问了我一堆怎么照顾怕冷的人。我都一一说了。'], [BOSS, '我这儿的茶都是现碾的。……他学东西倒认真，就是手太重，糟蹋了我好几斤上等的糖桂花。'],
      [BOSS, '（半真半假地叹气）少侠你说，我配不配得上他？']]); f.dx_tea = 1; return true; });

  // ---------- 第六幕：关键抉择（百草轩）----------
  async function choiceScene() { const f = F();
    await L([['', '百草轩的门关了一半。掌柜坐在门槛上，捧着那只缺口的旧茶盏，茶早凉了。'], [DI, '少侠又来了。师兄……收到桂花糕了吗？'], [YE, '收到了。'], [DI, '那就好。喜事……定在哪天？']]);
    if (window.SQB) await SQB.key('这一句说出口，就收不回来了');
    const opts = ['「没有什么喜事。东厢，是给你收拾的。」', f.dx_nobride ? null : '「是真的。他要娶听雨楼的老板娘了。」', '「……我也不清楚。」'].filter(Boolean);
    const k = await choose('你怎么跟他说？', opts), pick = opts[k];
    if (pick.indexOf('是真的') >= 0) return endFail();
    if (pick.indexOf('不清楚') >= 0) { await say(DI, '（笑了笑）是吗。那师兄该忙了。中秋我就在青阳，坐门口看月亮，也一样。'); return endCake(); }
    await say(DI, '（笑了一下）少侠别哄我。被褥、桂花——哪一样像是给我的？');
    const EV = [['「灯罩蒙了纱，怕你伤眼。」', '师兄对谁都这么细。'], ['「被褥很厚，屋子朝南。」', '听说听雨楼的老板娘也怕冷。'], ['「墙边那只石碾里，是药渣。」', '……药渣？（他的手停了一下，还是摇了摇头）'],
      ['「茶盘上摆着师兄那只桂花纹的旧盏，旁边空着一只盏托。伙计说，另一只得等人带来。」', null]];
    for (let miss = 0; miss < 2;) { const c = await choose('拿什么让他信？', EV.map(e => e[0])); const [, back] = EV[c];
      if (!back) break; await say(DI, back); miss++; if (miss >= 2) { await say(DI, '少侠是好心，我知道。'); return endCake(); } }
    await L([['', '掌柜低头看着手里的茶盏，很久没有说话。拇指一遍一遍摸过盏沿那个小缺口。'],
      [DI, '这个口子，是师兄十二岁那年磕的。那回炼坏一炉丹，烧了师父半边眉毛，师兄吓得把茶盏都摔了。……后来师兄一直说，要赔我一只新的。'], [DI, '十年了，师兄还留着另一只。'],
      [DI, '（把茶盏用布包好，包了一层又一层）少侠，玄天城……中秋那天冷不冷？'], [YE, '东厢朝南。'], [DI, '（笑了，眼眶有点红）……那我把围巾带上。']]);
    q().n = 5; f.dx_shut = 0; toastT('东厢朝南 —— 中秋夜，去丹霞堂'); }

  // ---------- 结局一：中秋夜 ----------
  async function night() { const f = F(); f.dx_night = 1; window.R328_OFF = true;
    try { await fadeOut(400); } catch (e) {} tileSetMap('dx_east', ...P(720, 860), 'up'); S.scene = drawMap; world.locked = true; try { await fadeIn(500); } catch (e) {}
    try { await L([['', '中秋夜。后院挂了一串灯笼，月亮很圆。掌柜在炉边看火，炉里什么也没炼，他就是在那里看着。'], ['', '院门「吱呀」一声。'],
      ['', '百草轩掌柜站在门口，脖子上绕着那条厚围巾，一手提着一笼桂花糕，一手按着怀里的布包。'], ['', '炉边的人没有回头。'],
      [XI, '来了？'], [DI, '来了。'], [XI, '屋子没怎么收拾，凑合住。'], [DI, '被褥太厚了。'], [XI, '……玄天城冷。'],
      ['', '师弟把布包打开，把那只缺口的茶盏放进空着的盏托里。两只桂花纹的茶盏，十年来第一次摆在了一起。'],
      ['', '师兄从身后拿出一只油纸包，往桌上一推。纸包里是几块桂花糕，歪歪扭扭，有一块还焦了角。'], [XI, '……年年都是你做。今年换我。'], [XI, '跟听雨楼那位学了半个月。……难吃也得吃。'],
      ['', '师弟拿起那块焦了角的，咬了一口。'], [DI, '……糖放多了。'], [XI, '下回少放。'], ['', '师弟低着头，把那块糕一点一点吃完了。'],
      ['', '—— 很多年前，师父院里的桂花树下。十二岁的阿焰第一次自己看火，炉盖一烫，手背上起了一串泡。'], ['小阿焰', '不疼。'],
      ['', '小阿澈拉过他的手，吹了又吹，从怀里摸出一只小瓦罐，挖出一大块黑乎乎的药膏，糊了上去。'], ['小阿澈', '我自己配的。……好像配多了。'], ['', '小阿焰看着自己变成黑色的手，笑出了声。一朵桂花，落在了小阿澈的头发上。 ——'],
      ['', '一阵风过，桂花落了师弟一肩。师兄伸手，把他肩上的一朵桂花拈掉，在指间捏了一会儿，没有扔。'], [XI, '……阿澈。'], [DI, '嗯？'], [XI, '……没什么。喝茶。'],
      ['', '两只茶盏挨在一起，冒着热气。院子里很静，只听得见炉子里炭火轻轻一响。']]);
      // R334（作者 11-16）：最动人的地方就停在这里——黑场，「第二年 · 开春」，直接放桃花树下那段动画；不插别的话，地图配乐先停干净
      try { if (window.R334_PEACH) await R334_PEACH(); } catch (e) {} }
    finally { window.R328_OFF = false; world.locked = false; }
    f.dx_end = 'east'; try { await fadeOut(400); } catch (e) {} tileSetMap('xt_danxia', ...P(900, 700), 'up'); S.scene = drawMap; try { await fadeIn(400); } catch (e) {}
    await L([['', '开春以后，丹霞堂的东厢再没空过。师弟坐在前堂的矮凳上，低头碾药；师兄在一旁看炉，手背上的疤擦了药。'], [XI, '（把一个小瓷瓶放在柜上）拿着。我们俩一炉炼的。'], [DI, '师兄看火，我下药。师父说过，火和水……'], [XI, '话多。'],
      ['', '门口，两只花篮的边探进来又缩回去。'], [LIAN, '（小声）我就说，不激一激他，他再等十年也不会来。'], [HE, '（小声）差点激成反的……还好有少侠。'], [LIAN, '嘘——走啦走啦。'], [XX, '（……小子，咱们也走吧。）']]);
    f.dx_night = 0; await finish(1, 'p_tongxin'); }
  // ---------- 结局二：两包桂花糕 ----------
  async function endCake() { const f = F();
    await L([['', '中秋夜。青阳，百草轩门口，一个人裹着围巾坐在门槛上，手里捧着一只缺口的茶盏。'], ['', '玄天城，丹霞堂东厢，灯亮到半夜。茶盘里一只桂花纹茶盏，旁边的盏托还是空的。'], ['', '那笼桂花糕，他一块一块吃完了。'],
      ...(world.mapName === 'xt_danxia' ? [[XI, '多谢你跑这两趟。……明年，明年他会来的。']] : [])]);
    f.dx_end = 'cake'; await finish(.45, null); }
  // ---------- 结局三：落了的桂花（失败）----------
  async function endFail() { const f = F();
    const lines = [[DI, '（愣了一下，笑着点头）听雨楼的老板娘……好。好事。师兄嘴笨，找个会说话的正好。'], [DI, '那……贺礼总要有一份。'], ['', '他从柜台上拿起那只缺口的桂花纹茶盏，用布包好，放进一只小木匣。'],
      [DI, '师父留下的，原本是一对。给新人凑个对——一对才吉利。'], [DI, '就说……师弟这边一切都好。炉子没炸过，一次都没有。'],
      ['', '回到丹霞堂，掌柜打开木匣，看见那只缺口的茶盏。'], ['', '他没有问一句话。他把茶盏放进空着的盏托里——刚好合上。然后他走出东厢，把门锁上了。'],
      ['', '几天后，百草轩关了门。门上贴着「进山采药，归期未定」。']];
    f.dx_shut = 1; f.dx_failed = 1;
    if (window.SQB) await SQB.fail(ID, '落了的桂花', lines, '去青阳镇找卖花姑娘小荷', ff => { delete ff.dx_seen; delete ff.dx_night; });
    else { await L(lines); q().s = 0; q().n = 0; } }
  // 重做：小荷认错，去后山找师弟
  visitor('qy_town', HE, async () => { const f = F();
    if (on() && N() === 1 && f.dx_gui === 1) {
      await L([[HE, '少侠要花？——金桂？百草轩掌柜让你来的吧，他每年这时候都要一枝。'], ['', '小荷从篮底挑出一枝金桂，枝上的花开了七八分，香气一下子就散开了。'],
        [HE, '给玄天城那位师兄的？（一边拿草绳扎花枝，一边笑）巧了，我姐姐小莲刚来信，就说起丹霞堂。'],
        [HE, '她说那位掌柜在收拾后院的东厢，还在她那儿订了一整年的桂花。（压低声音）……像是要办喜事呢。'],
        [HE, '（捂了一下嘴）哎呀，我又多嘴了。喏，开得正好，路上别颠着。替我问掌柜好。']]);
      f.dx_gui = 2; toastT('东厢朝南 —— 金桂买好了，回百草轩'); return true; }
    if (!f.dx_failed || on() || q().s === 3) return false;
    await L([[HE, '（抓着花篮，眼圈红红的）少侠……那个传闻，是我和姐姐编的。我们就想激他去玄天城问个明白，哪知道他……'], [HE, '他就在后山采药。少侠，再帮一回？']]);
    const c = await choose(HE, ['「我去。」', '下次吧']); if (c !== 0) return true;
    const s = q(); s.s = 1; s.n = 6; f.dx_failed = 0; toastT('东厢朝南 —— 去青阳后山，找到百草轩掌柜'); return true; });
  if (TMAPS.qy_shelter) clone('qy_shelter', DI, 1120, 380, async () => { const f = F(), s = q();
    if (on() && s.n === 6) {
      await L([['', '后山的林子边上，百草轩掌柜蹲在地上挖药，背篓里没几株。围巾上沾了草籽。'], [DI, '少侠？……你怎么找到这儿来了。'],
        [YE, '你送去的那只茶盏，正好放进他空着的盏托里。那屋子，是给你的。'], ['', '掌柜握着药锄的手，停住了。'], [DI, '……他没给谁用？'], [YE, '他把屋子锁了。'],
        [DI, '（站起来，拍了拍膝盖上的土，笑了，眼眶有点红）……傻子。'], [DI, '少侠，玄天城中秋冷不冷？'], [YE, '东厢朝南。'], [DI, '……那我把围巾带上。']]);
      s.n = 5; f.dx_shut = 0; toastT('东厢朝南 —— 中秋夜，去丹霞堂'); return; }
    if (lampKey()) return;
    await say(DI, '后山的药，比镇上的好。……我一个人，挺清静。'); }, () => shut() || (on() && N() === 6), 'down');
  async function finish(rate, item) { const s = q(); s.s = 3; s.n = 6;
    const h = S.hero, lv0 = h.lv, gold = Math.round(Q.reward.gold * rate), exp = Math.round(Q.reward.exp * rate), show = [];
    if (item) { give(item); show.push({ icon: 'item:' + item, id: item, name: ITEM_DB[item].name, count: '×1', desc: ITEM_DB[item].desc }); }
    h.gold = (h.gold || 0) + gold; show.push({ icon: 'gold', name: '灵石', count: '×' + gold }); try { playSnd('jingle_win'); } catch (e) {}
    if (window.itemGet) await itemGet(show, rate >= 1 ? '支线完成 · 东厢朝南' : '支线了结 · 东厢朝南（盏托还空着）');
    const ups = typeof gainExp === 'function' ? gainExp(exp) : 0; toastT('修为 +' + exp); if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0); }

  // ---------- 结局一之后：师弟常在丹霞堂 ----------
  clone('xt_danxia', DI, 480, 770, async () => { if (lampBox()) return; await say(DI, ['师兄看火，我碾药。……他嫌我手慢。', '明目丹一天一颗，师兄每天早上盯着我吃。'][Math.floor(Math.random() * 2)]); }, () => F().dx_end === 'east', 'right');

  // ---------- 和「迟了一刻的灯」的关系 ----------
  const lamp = () => (((F().sq || {}).xt_lamp) || {});
  function lampBox() { const f = F(), s = lamp(); if (s.s !== 1 || (s.n || 0) < 5 || f.hx_page) return false;
    (async () => { await L([[YE, '掌柜的，贺九章在百草轩寄过一只匣子。'], [DI, '贺老板那只？我搬来玄天城的时候，寄存的东西都带上了——怕我走了，没人看着。'], [DI, '（从箱底取出一只匣子）……他出什么事了？'], [YE, '死了。'], [DI, '（手一抖）……少侠自己看吧。']]);
      f.hx_box = 1; if (window.R232_PAGE) await R232_PAGE(); })(); return true; }
  function lampKey() { const f = F(), s = lamp(); if (s.s !== 1 || (s.n || 0) < 5 || f.hx_box || !shut()) return false;
    (async () => { await L([[YE, '掌柜的，贺九章在百草轩寄过一只匣子。'], [DI, '贺老板那只？锁在素柜里。（摸出一把铜钥匙）铺子关着，少侠自己去开吧。'], [DI, '……他出什么事了？'], [YE, '死了。'], [DI, '（低下头）……少侠去吧。']]);
      f.hx_box = 1; toastT('迟了一刻的灯 —— 回百草轩，用钥匙开墙边的素柜'); })(); return true; }

  // ---------- 寻路 / 头上的「!」（歪打正着那条不标）----------
  try { if (window.R284S && R284S.T) R284S.T[ID] = (s, f) => s.n === 0 || s.n === 4 ? { to: [DI], map: 'qy_herb' } : s.n === 1 ? { to: f.dx_away ? [DI] : [], map: 'qy_herb' }
    : s.n === 2 || s.n === 5 ? { to: [XI], map: 'xt_danxia' } : s.n === 3 ? { to: [HUO], map: 'xt_danxia' } : s.n === 6 ? { to: [DI], map: 'qy_shelter' } : null; } catch (e) {}
  window.R329 = { Q };
})();
