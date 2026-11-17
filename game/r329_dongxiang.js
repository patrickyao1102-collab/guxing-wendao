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
  const GOALS = ['把明目丹捎到青阳镇百草轩', '过两天再去百草轩，取桂花糕', '把桂花糕捎回玄天城丹霞堂', '东厢是给谁收拾的？', '回青阳百草轩，跟师弟说', '中秋夜，去丹霞堂（伙计说掌柜请你去家里吃饭）', '去青阳后山，找到百草轩掌柜'];
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
    n.talk = async function (a) { let done = false; try { done = await fn(n); } catch (e) { console.warn('R329', name, e); } if (done) return true;
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

  // ---------- 东厢（作者 11-17：不再借云来客栈的客房——换成 Codex R316 已通过的「东厢小屋」，R347）----------
  let ED = null; try { ED = (window.GXD || {})['r347/data.json'] || null; if (!ED) { const x = new XMLHttpRequest(); x.open('GET', 'r347/data.json?v=2', false); x.send(); if (x.status === 200 || x.status === 0) ED = JSON.parse(x.responseText); } } catch (e) {}
  // 作者 11-17：「之前的旧版本东厢删除」——不再拿云来客栈的客房当底子，也不再有画小图标代替的旧摆设；东厢只有 R347 这一版
  const EAST = TMAPS.dx_east = { title: '阿焰家 · 东厢', indoor: true, npcs: [], chests: [], doors: [], exits: [], onEnter: null };
  { const ld = (k, src) => { if (IMG[k]) return; const im = new Image(); im.onload = () => { try { IMG[k] = im; } catch (e) {} }; im.src = src; };
    if (!ED) console.warn('R329：东厢 r347/data.json 没读到');
    const E = ED || { cs: 8, cols: 125, rows: 94, blocked: '0'.repeat(125 * 94), objs: [], exit: [440, 700, 120, 50], spawn: [500, 640] };
    ld('r347g_east', 'r347/g_east.webp?v=3');
    EAST.baked = { ground: 'r347g_east', cs: E.cs, cols: E.cols, rows: E.rows, w: 1000, h: 750, blocked: E.blocked,
      objs: E.objs.map((o, i) => { ld('r347_' + o.id, 'r347/' + o.id + '.webp?v=2'); return { id: 'r347_' + o.id, uid: 'r347e' + i, img: 'r347_' + o.id, x: o.x, y: o.y, w: o.w, h: o.h, sy: o.sy, flip: false, noBlock: true, noPre: true }; }) };
    ld('r347_tea_pair', 'r347/tea_pair.webp?v=2');
    const [ex, ey, ew] = E.exit; EAST.exits = [{ x: Math.floor(ex / E.cs), y: Math.floor(ey / E.cs), w: Math.ceil(ew / E.cs), h: E.rows - Math.floor(ey / E.cs), to: 'dx_home', at: P(1252, 790), face: 'down', label: '出门 · 院子' }];
    EAST.start = P(E.spawn[0], E.spawn[1]);
    try { delete MAP_ZOOM.dx_east; } catch (e) {} }
  try { if (typeof WIDE_OK === 'object') WIDE_OK.dx_east = 1; } catch (e) {}
  // 支线做完（师弟搬来了）：书桌上换成两只茶盏
  if (ED && typeof tileSetMap === 'function') tileSetMap = (o => function (m) { try { if (m === 'dx_east') { const done = q().s === 3 && F().dx_end === 'east'; for (const ob of EAST.baked.objs) if (ob.id === 'r347_tea_single' || ob.id === 'r347_tea_pair') { ob.img = done ? 'r347_tea_pair' : 'r347_tea_single'; } } } catch (e) {} return o.apply(this, arguments); })(tileSetMap);
  const EP = { lamp: [470, 340], bed: [262, 430], flower: [330, 336], mill: [660, 380], tray: [800, 400] };   // 东厢里各处线索的站位（R316 互动点）
  const seen = k => { const f = F(); f.dx_seen = f.dx_seen || {}; const first = !f.dx_seen[k]; f.dx_seen[k] = (f.dx_seen[k] || 0) + 1; return first; };
  const allSeen = () => { const s = F().dx_seen || {}; return ['lamp', 'bed', 'flower', 'mill', 'tray'].every(k => s[k]); };
  const checkAll = () => { if (on() && N() === 3 && allSeen()) { q().n = 4; toastT('东厢朝南 —— 回青阳百草轩，跟师弟说'); } };
  const look = (k, x, y, icon, name, lines, again) => { if (EP[k]) [x, y] = [EP[k][0], EP[k][1] - 30];
    spot('dx_east', x, y + 30, name, async () => { const first = seen(k); await L(first || !again ? lines : again); checkAll(); }); };
  look('lamp', 470, 440, '🏮', '窗边的灯', [['', '窗边一盏灯。灯罩外面又蒙了一层薄纱，光变得很柔。'], [HUO, '掌柜自己蒙的，说晚上看字不刺眼。']]);
  look('bed', 630, 560, '🛏', '床', [['', '新的丝绵被褥，厚得能堆个小山。屋子朝南，午后太阳正好照在床上。'], [HUO, '听雨楼买的丝绵。……听说听雨楼的老板娘最怕冷……']]);
  look('flower', 360, 600, '🌼', '窗台上的桂花', [['', '一只瓷瓶插满了桂花，开得正好，满屋都是香味。'], [HUO, '听雨楼的招牌，就是桂花茶。']]);
  look('mill', 770, 620, '🪨', '墙边的矮凳和石碾', [['', '墙边一张矮凳，一只旧石碾。凳面磨得发亮。'], [HUO, '听说听雨楼的茶都是现碾的。掌柜说是碾茶用的。']],
    [['', '你凑近又看了一眼。碾槽的缝里卡着一点褐色的渣，闻着发苦。'], ['', '……不像茶。']]);
  look('tray', 478, 790, '🍵', '书桌上的茶盏', [['', '书桌上' + '摆着一只旧茶盏，窑里烧出来的桂花纹。旁边放着一只空盏托，什么也没有。'], [HUO, '那只旧的，是掌柜自己用了十年的。我说给配只新的，掌柜不让，说「另一只，得等人带来」。'],
    [HUO, '难不成，是等听雨楼的老板娘带一只来？']]);
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
  { const n = (TMAPS.xt_danxia.npcs || []).find(n => n.name === XI && !n.hidden); if (n) { const c0 = n.cond; n.cond = () => !(on() && N() === 5) && (typeof c0 === 'function' ? c0() : true); } }
  hook('xt_danxia', XI, async () => { const f = F(), s = q();
    if (s.s === 3) { await say(XI, f.dx_end === 'east' ? '师弟在后头碾药。……你别进去吵他。' : '……明年。明年他会来的。'); return true; }
    if (s.s === 1) {
      if (s.n === 0 || s.n === 1) { await say(XI, '还没动身？匣子别磕着。'); return true; }
      if (s.n === 2) { take('k_dx_cake');
        await L([[YE, '百草轩掌柜让我捎来的，还有这枝金桂。他说……铺子忙，中秋走不开。'], ['', '掌柜接过桂花糕，没有打开，就那么托在手里。炉子里的火——慢慢小了下去。'], [XI, '……知道了。'],
          [YE, '还有这个。他说给你擦手。'], ['', '那包金疮药，他看了很久，揣进了怀里。'], [XI, '他配的金疮药，比我的好。'], [XI, '行了，多谢。你去吧。'],
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
  hook('xt_danxia', HUO, async () => {
    if (on() && N() === 5) {   // 作者 11-17：中秋不在丹霞堂找他，去他家里
      await L([[HUO, '少侠来了！掌柜一早就回家去了，临走交代：今儿中秋，请少侠去家里吃顿便饭。'], [HUO, '就在隔壁。……掌柜还多摆了一副碗筷，嘴上没说给谁。']]);
      const c = await choose(HUO, ['「这就过去。」', '晚点再去']); if (c !== 0) return true;
      await night(); return true; }
    if (!on() || N() < 3 || N() > 4) return false;
    await L([[HUO, '少侠，想看看东厢？……趁掌柜在前堂看炉，快看快看，掌柜一会儿就回来。']]);
    const c = await choose(HUO, ['跟他去东厢', '不了']); if (c !== 0) return true;
    try { await fadeOut(250); } catch (e) {} tileSetMap('dx_east', ...EAST.start, 'up'); S.scene = drawMap; try { await fadeIn(250); } catch (e) {} return true; });

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
        [WANG, '……可不是嘛，小荷那丫头满街在说呢，她姐姐从玄天城捎信回来，说丹霞堂那位掌柜把后院东厢收拾出来了，新被褥、新茶盏。'],
        [WANG, '还说他这半个月天天往听雨楼跑，跟那位老板娘在雅间里一坐就是半天。哎哟，掌柜的，你师兄这是要成亲了吧？'],
        ['', '掌柜手里的糖桂花撒多了，撒了一笼屉。'], [DI, '……是吗。'], [DI, '那是好事。师兄也老大不小了，也该有个人管管他了，烫了手好歹有人给他擦药。'],
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
      [DI, '（把茶盏用布包好，包了一层又一层）少侠，玄天城……中秋那天冷不冷？'], [YE, '东厢朝南。'], [DI, '（笑了，眼眶有点红）……那我把围巾带上。'],
      [DI, '（又笑了一下）少侠，先别告诉师兄。他要是问起来，就照上回那么说——铺子忙，走不开。'], [YE, '……他会失落的。'], [DI, '就失落一个晚上。'], [XX, '（啧。原来最会使坏的，是这一个。）']]);
    q().n = 5; f.dx_shut = 0; toastT('东厢朝南 —— 中秋夜，去丹霞堂（先别说漏嘴）'); }

  // ---------- 结局一：中秋夜（作者 11-17 定）----------
  // 丹霞堂伙计请少侠去掌柜家里过中秋 → 桂花树下一桌菜、三只茶盏 → 叶孤星照师弟托的话说「铺子忙，走不开」→ 阿焰「……嗯」
  // → 直接进小时候（R341：师父、小阿焰、小阿澈，头顶冒泡）→ 慢慢变黑 →「咚、咚」→ 院门开了，师弟站在门口 → 黑场放桃花视频（不打字）
  // → 视频放完还是这一晚的院子：两只茶盏挨在一起；「铺子忙，走不开？」「是他让我这么说的。」→ 领奖励。
  // 阿焰家的院子（R317 02A）拼好之前，先在东厢（dx_east）里演；DX_HOME_SPOTS 给出院子里各人站的位置。
  const knock = () => { try { audioInit(); const ac = AC; if (!ac) return; for (const t of [0, .42]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, ac.currentTime + t); o.frequency.exponentialRampToValueAtTime(60, ac.currentTime + t + .12); g.gain.setValueAtTime(.0001, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(.55, ac.currentTime + t + .005); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + t + .18); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + .2); } } catch (e) {} };
  const actorAs = (name, k, x, y, face) => { const a = addActor('none', x, y, '', '#c9a86a'); a.npc = { name, _r336: k, noLabel: true, talk: async () => {} }; a.h = 116; a.face = face || 'down'; return a; };
  const girl = (name, x, y) => { let n = null; try { n = window.R328 && R328.index().get(name); } catch (e) {} const a = addActor((n && n.key) || 'n_villager', x, y, '', '#c9a86a'); a.npc = Object.assign({}, n || {}, { name, noLabel: true, talk: async () => {}, wander: false }); a.h = (n && n.h) || 112; a.face = 'down'; return a; };
  async function night() { const f = F(); f.dx_night = 1; window.R328_OFF = true;
    const HOME = TMAPS.dx_home ? 'dx_home' : 'dx_east';
    const SP = Object.assign({ ye: [720, 900], yan: [760, 800], che: [680, 800], stove: [560, 800], gate: [720, 1020], peek: [[640, 1000], [800, 1000]] }, (window.DX_HOME_SPOTS || {}));
    let yan = null, che = null; const hud0 = S.hud; S.hud = false;   // 整场戏不显示血条、任务栏
    try {
      try { await fadeOut(500); } catch (e) {}
      try { if (window.DX_GATE) DX_GATE('closed'); } catch (e) {}
      if (TMAPS[HOME]) TMAPS[HOME].night = true;   // 中秋夜
      try { if (HOME === 'dx_home') MAP_ZOOM.dx_home = 1.35; } catch (e) {}   // 吃饭这场镜头拉近一点
      tileSetMap(HOME, ...P(SP.ye[0], SP.ye[1]), 'up'); S.scene = drawMap; world.locked = true; world.banner = null;
      world.actors = world.actors.filter(a => !(a.npc && (a.npc.name === XI || a.npc.name === DI)));
      yan = actorAs(XI, 'ayan', SP.yan[0], SP.yan[1], 'down');
      try { if (window.DX_DINNER) DX_DINNER(true); } catch (e) {} if (SP.cam) world.camFocus = SP.cam;
      try { await fadeIn(700); } catch (e) {}
      await L([['', '中秋夜。院子当中摆了一张小桌，三副碗筷，三只茶盏。桂花开着，月亮很圆。'], [XI, '来了？坐。……菜是伙计做的，我只管看火。'], ['', '他给你倒了茶，又往院门那边看了一眼。'],
        [YE, '百草轩那边……他说铺子忙，走不开。'], [XX, '（小子，撒个谎脸都僵了。）'], [XI, '……嗯。'], ['', '他把第三只茶盏拿起来，看了一会儿，又轻轻放回了茶盘里。']]);
      // 小时候：同一个院子，十几年前（R344 dx_home_old）；没有就在原地演
      // 11-18：回忆戏换成 R357「摇桂花、埋酒」，在阿澈家老院子（十几年前）的桂花树下演；没有就照旧
      const M357 = !!(window.R357_MEMORY && TMAPS.qy_chehome_old);
      const MEM = M357 ? null : SP.mem;
      if (M357) { try { await fadeOut(600); } catch (e) {} await R357_MEMORY(); tileSetMap(HOME, ...P(SP.ye[0], SP.ye[1]), 'up'); S.scene = drawMap; world.locked = true; world.banner = null; S.fade = 1;
        world.actors = world.actors.filter(a => !(a.npc && (a.npc.name === XI || a.npc.name === DI))); yan = actorAs(XI, 'ayan', SP.yan[0], SP.yan[1], 'down'); try { if (window.DX_DINNER) DX_DINNER(true); } catch (e) {} }
      if (MEM && TMAPS[MEM.map]) { try { await fadeOut(600); } catch (e) {} tileSetMap(MEM.map, ...P(MEM.stove[0] + 200, MEM.stove[1] + 40), 'up'); S.scene = drawMap; world.locked = true; world.banner = null; world.actors = world.actors.filter(a => a === world.player); world.camFocus = [MEM.stove[0] + 60, MEM.stove[1] - 60]; S.fade = 0; }
      if (!M357 && window.DX_MEMORY) await DX_MEMORY(MEM && TMAPS[MEM.map] ? { stove: MEM.stove, gate: MEM.che_in, pos: MEM } : { stove: SP.stove, gate: SP.gate });
      if (MEM && TMAPS[MEM.map]) { tileSetMap(HOME, ...P(SP.ye[0], SP.ye[1]), 'up'); S.scene = drawMap; world.locked = true; world.banner = null; S.fade = 1;
        world.actors = world.actors.filter(a => !(a.npc && (a.npc.name === XI || a.npc.name === DI))); yan = actorAs(XI, 'ayan', SP.yan[0], SP.yan[1], 'down'); try { if (window.DX_DINNER) DX_DINNER(true); } catch (e) {} }
      // 黑着，「咚、咚」
      S.fade = 1; await new Promise(r => setTimeout(r, 700)); knock(); await say('', '「咚、咚。」');
      try { if (window.DX_GATE) DX_GATE('half'); } catch (e) {}
      che = actorAs(DI, 'ache', SP.gate[0], SP.gate[1], 'up');
      yan.face = 'down'; world.camFocus = [(SP.yan[0] + SP.gate[0]) / 2, (SP.yan[1] + SP.gate[1]) / 2 - 60];
      try { await fadeIn(900); } catch (e) {}
      await L([['', '院门「吱呀」一声开了。'], ['', '门口站着一个人。脖子上绕着厚围巾，一手提着一笼桂花糕，一手按着怀里的布包。'], ['', '桌边的人站了起来。']]);
      // 黑场，放桃花尾声（不打字，地图配乐先停干净）
      try { if (window.R334_PEACH) await R334_PEACH({ caption: false }); } catch (e) {}
      // 视频放完：还是这一晚的院子（院门关上了）
      world.camFocus = null; try { if (window.DX_GATE) DX_GATE('closed'); } catch (e) {}
      tileSetMap(HOME, ...P(SP.ye[0], SP.ye[1]), 'up'); S.scene = drawMap; world.locked = true; world.banner = null;
      world.actors = world.actors.filter(a => !(a.npc && (a.npc.name === XI || a.npc.name === DI)));
      yan = actorAs(XI, 'ayan', SP.yan[0], SP.yan[1], 'down'); che = actorAs(DI, 'ache', SP.che[0], SP.che[1], 'down');
      try { if (window.DX_DINNER) DX_DINNER(true); } catch (e) {} if (SP.cam) world.camFocus = SP.cam;
      try { await fadeIn(800); } catch (e) {}
      await L([['', '桌上，两只桂花纹的茶盏挨在一起，冒着热气。一只盏沿缺了个小口。'], [XI, '（瞥了你一眼）……铺子忙，走不开？'], [YE, '是他让我这么说的。'],
        [DI, '（低头笑）师兄看火，我下药——'], [XI, '话多。吃饭。']]);
      const g1 = girl(LIAN, SP.peek[0][0], SP.peek[0][1]), g2 = girl(HE, SP.peek[1][0], SP.peek[1][1]);
      await L([['', '院门外，两只花篮的边探进来又缩回去。'], [LIAN, '（小声）我就说，不激一激他，他再等十年也不会来。'], [HE, '（小声）差点激成反的……还好有少侠。'], [LIAN, '嘘——走啦走啦。']]);
      world.actors = world.actors.filter(a => a !== g1 && a !== g2);
      await say(XX, '（……小子，这顿饭，咱们吃慢点。）');
    } finally { try { if (window.DX_DINNER) DX_DINNER(false); } catch (e) {} window.R328_OFF = false; world.locked = false; world.camFocus = null; S.hud = hud0; try { if (window.DX_GATE) DX_GATE('open'); } catch (e) {} try { if (TMAPS[HOME]) TMAPS[HOME].night = false; delete MAP_ZOOM.dx_home; } catch (e) {} }
    f.dx_end = 'east'; f.dx_night = 0; await finish(1, 'p_tongxin'); }
  // ---------- 结局二：两包桂花糕 ----------
  async function endCake() { const f = F();
    await L([['', '中秋夜。青阳，百草轩门口，一个人裹着围巾坐在门槛上，手里捧着一只缺口的茶盏。'], ['', '玄天城，丹霞堂东厢，灯亮到半夜。茶盘里一只桂花纹茶盏，旁边的盏托还是空的。'], ['', '那笼桂花糕，他一块一块吃完了。'],
      ...(world.mapName === 'xt_danxia' ? [[XI, '多谢你跑这两趟。……明年，明年他会来的。']] : [])]);
    f.dx_end = 'cake'; await finish(.45, null); }
  // ---------- 结局三：落了的桂花（失败）----------
  async function endFail() { const f = F();
    const lines = [[DI, '（愣了一下，笑着点头）听雨楼的老板娘……好。好事。师兄嘴笨，找个会说话的正好。'], [DI, '那……贺礼总要有一份。'], ['', '他从柜台上拿起那只缺口的桂花纹茶盏，用布包好，放进一只小木匣。'],
      [DI, '师父留下的，原本是一对。给新人凑个对——一对才吉利。'], [DI, '就说……师弟这边一切都好，让他别惦记。'],
      ['', '回到丹霞堂，掌柜打开木匣，看见那只缺口的茶盏。'], ['', '他没有问一句话。他把茶盏放进空着的盏托里——刚好合上。然后他走出东厢，把门锁上了。'],
      ['', '几天后，百草轩关了门。门上贴着「进山采药，归期未定」。']];
    f.dx_shut = 1; f.dx_failed = 1;
    if (window.SQB) await SQB.fail(ID, '落了的桂花', lines, '去青阳镇找卖花姑娘小荷', ff => { delete ff.dx_seen; delete ff.dx_night; });
    else { await L(lines); q().s = 0; q().n = 0; } }
  // 重做：小荷认错，去后山找师弟
  visitor('qy_town', HE, async () => { const f = F();
    if (on() && N() === 1 && f.dx_gui === 1) {
      await L([[HE, '少侠要花？——金桂？百草轩掌柜让你来的吧，他每年这时候都要一枝。'], ['', '小荷从篮底挑出一枝金桂，枝上的花开了七八分，香气一下子就散开了。'],
        [HE, '给玄天城丹霞堂掌柜的？（一边拿草绳扎花枝，一边笑）巧了，我姐姐小莲刚来信，正说起他。'],
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
        [DI, '（站起来，拍了拍膝盖上的土，笑了，眼眶有点红）……傻子。'], [DI, '少侠，玄天城中秋冷不冷？'], [YE, '东厢朝南。'], [DI, '……那我把围巾带上。'],
        [DI, '（又笑了一下）少侠，先别告诉师兄。他要是问起来，就照上回那么说——铺子忙，走不开。'], [YE, '……他会失落的。'], [DI, '就失落一个晚上。'], [XX, '（啧。原来最会使坏的，是这一个。）']]);
      s.n = 5; f.dx_shut = 0; toastT('东厢朝南 —— 中秋夜，去丹霞堂（先别说漏嘴）'); return; }
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
    : s.n === 2 ? { to: [XI], map: 'xt_danxia' } : s.n === 3 || s.n === 5 ? { to: [HUO], map: 'xt_danxia' } : s.n === 6 ? { to: [DI], map: 'qy_shelter' } : null; } catch (e) {}
  window.R329 = { Q };
})();
