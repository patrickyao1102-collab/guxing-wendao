// ================= R214 · 玄天城探案支线①「天字三号房」（作者 11-12：支线不要「接了就打、找到就完」；要多个人反复问、有反转；难度不给玩家，给玩家的是推理和反转的爽感）=================
// 密室案，偏机智轻快。三次翻转：外贼翻窗？→ 伙计监守自盗？→ 「昏倒」的行商自己做的局，那箱药根本没进过这间房。
// 玩家不会卡：下一步去哪、问谁，任务栏写明；两个人说法打架的地方由叶孤星 / 星旋自己点破；最后把人叫齐当众说穿，玩家只管看。
// 场景暂用现成室内顶着（大堂 = 悦来客栈那张，客房 = 苍月城东厢内寝），Codex R214 的云来客栈三张图到了再换。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_city || !window.SQ_DEFS) return;
  const CITY = TMAPS.xt_city, CB = CITY.baked || {};
  const F = () => (S.flags = S.flags || {});
  const st = id => ((F().sq = F().sq || {})[id] = F().sq[id] || { s: 0, n: 0 });
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const YE = '叶孤星', XX = '星旋', BOSS = '柳三娘', QIAN = '钱满仓', SHUN = '云来客栈伙计', NV = '沈霜', GUARD = '查案的城卫', DAN = '丹霞堂伙计';
  const ID = 'xt_room3', q = () => st(ID);
  const free = (x, y) => { try { return CB.blocked.charCodeAt(Math.floor(y / CB.cs) * CB.cols + Math.floor(x / CB.cs)) === 48; } catch (e) { return true; } };
  const nearFree = (x, y) => { for (let r = 0; r <= 200; r += 16) for (let a = 0; a < 8; a++) { const px = x + Math.cos(a * Math.PI / 4) * r, py = y + Math.sin(a * Math.PI / 4) * r; if (free(px, py)) return [px, py]; } return [x, y]; };
  // 证词本：记下来的话，任务栏里能翻
  const note = t => { const f = F(); f.xr_notes = f.xr_notes || []; if (!f.xr_notes.includes(t)) { f.xr_notes.push(t); try { playSnd('ui_confirm'); } catch (e) {} toast('记入证词本：' + t, 2600); } };
  const GOALS = ['进云来客栈，上二楼看看天字三号房（屋里五处都看一遍）', '下楼，在大堂问问：钱满仓、掌柜柳三娘、靠窗的女修沈霜', '城卫怀疑伙计阿顺——出客栈，到门口问他昨晚去了哪儿', '去城东丹霞堂门口，问问那批灵药到底是什么样的货', '回云来客栈大堂，再问掌柜柳三娘一句：钱满仓进店那天带了什么', '都对上了。跟柳三娘说：把人叫齐', '案子结了'];
  const Q = { id: ID, name: '天字三号房', giver: ['xt_city', SHUN], where: '玄天城 · 云来客栈门口 · 伙计阿顺', cond: () => !!F().ch3_report, type: 'kill', kill: { maps: ['__r214__'], mobs: ['__r214__'] }, n: 6, reward: { exp: 680, gold: 700 } };
  Object.defineProperty(Q, 'goal', { enumerable: true, get() { return GOALS[Math.min(GOALS.length - 1, q().n)]; } });
  Object.defineProperty(Q, 'desc', { enumerable: true, get() { const n = (F().xr_notes || []); return '云来客栈一间从里面闩死的客房，行商昏倒在地，一箱要送去丹霞堂的灵药不见了。' + (n.length ? '　【证词本】' + n.map((t, i) => (i + 1) + '. ' + t).join('　') : ''); } });
  SQ_DEFS.push(Q);
  Object.assign(ITEM_DB, { c_tianzi: { name: '天字号房牌', slot: 'acc', maxhp: 70, maxmp: 25, def: 3, price: 0, desc: '云来客栈的铜房牌，背面刻着「天字三号」。柳三娘说：这间房往后不收你钱——「就当镇宅了。」' } });

  // ---------------- 场景（暂借现成室内）----------------
  const clone = (id, src, title) => { const T = TMAPS[src]; if (!T) return false; TMAPS[id] = Object.assign({}, T, { title, npcs: [], chests: [], onEnter: null, doors: [], exits: [] }); try { if (MAP_ZOOM[src] && !MAP_ZOOM[id]) MAP_ZOOM[id] = MAP_ZOOM[src]; } catch (e) {} return true; };
  if (!clone('xt_inn_hall', 'qy_inn', '云来客栈 · 大堂') || !clone('xt_inn_room3', 'm_cy_bedroom', '云来客栈 · 天字三号房')) { console.warn('R214：缺室内图'); return; }
  const HALL = TMAPS.xt_inn_hall, ROOM = TMAPS.xt_inn_room3, H0 = TMAPS.qy_inn, R0 = TMAPS.m_cy_bedroom;
  const [dx, dy] = nearFree(1120, 2140), hallIn = [8, 10], roomIn = R0.start || [7.7, 12.1];
  const ex = (T, fb) => Object.assign({}, ((T.exits || [])[0]) || fb);
  HALL.exits = [Object.assign(ex(H0, { x: 15, y: 22, w: 5, h: 2 }), { to: 'xt_city', at: P(dx, dy + 40), face: 'down', label: '出门 · 玄天城', cond: null, msg: '' })];
  ROOM.exits = [Object.assign(ex(R0, { x: 28, y: 58, w: 9, h: 3 }), { to: 'xt_inn_hall', at: [2.6, 6.2], face: 'down', label: '下楼 · 大堂', cond: null, msg: '' })];
  (CITY.doors = CITY.doors || []).push({ x: dx, y: dy - 6, rw: 40, rh: 22, to: 'xt_inn_hall', at: hallIn, face: 'up', label: '云来客栈', cond: () => !!F().ch3_report || !!F().ch3_city, msg: '' });
  const add = (T, n) => { (T.npcs = T.npcs || []).push(n); return n; };
  const man = (T, cx, c, r, name, talk, extra) => add(T, Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk }, extra || {}));
  const spot = (T, c, r, name, talk, extra) => add(T, Object.assign({ key: 'none', c, r, name, hidden: true, h: 110, talk }, extra || {}));
  const on = () => q().s === 1;

  // ---------------- 第一幕：接案 ----------------
  { const n = (CITY.npcs || []).find(n => n.name === SHUN && !n.hidden); if (n) { const orig = n.talk;
    n.talk = async function (a) {
      const s = q(), f = F();
      const dflt = async () => { if (typeof orig === 'function') return orig.call(this, a); const A = Array.isArray(orig) ? orig : [orig || '客官里面请！']; for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(SHUN, l); };
      if (s.s === 3) { await say(SHUN, '客官！托您的福，掌柜的没扣我工钱，还许我夜里出去抄书了。……对了，书坊这两天赶印的那批烫金帖子，怪得很，回头我再跟您细说。'); return; }
      if (s.s === 1 && s.n === 2) {
        await L([[YE, '阿顺。昨晚你说在后厨睡的，可掌柜说后厨夜里上了锁。'], [SHUN, '（脸一下白了）我、我……客官，我真没偷东西！'], [SHUN, '我……我是翻后墙出去了。城南墨香书坊夜里缺人抄书，一晚上二十文。我娘的药钱不够，可掌柜的不许伙计夜里出门，我不敢说。'],
          [YE, '有人能替你作证么？'], [SHUN, '书坊老板！还有——您看我这手。（摊开双手，十个指头全是洗不掉的墨）这两天书坊在赶一批烫金的帖子，墨里掺了金粉，三天都洗不干净。'],
          [XX, '（墨是真的，金粉也是真的。这小子昨晚确实在抄书——偷药的人，手上可不会带着一夜的墨。）'], [YE, '我信你。那批药长什么样，你见过么？'], [SHUN, '没见着。钱老板不让人进屋。客官要问货，得去城东丹霞堂，药是他们订的。']]);
        note('阿顺昨晚翻墙去书坊抄书，十指金墨为证——不是他'); s.n = 3; return; }
      if (s.s === 1) { await say(SHUN, s.n < 2 ? '客官，现场在二楼天字三号，城卫守着呢。大堂里问话也方便。' : '客官查得怎么样了？掌柜的急得一上午没喝水。'); return; }
      if (!Q.cond()) return dflt();
      await L([[SHUN, '（压低声音）这位仙长，您是天剑宗的吧？求您帮帮小店——出大事了！'], [SHUN, '天字三号的钱老板一早没下楼。门从里头闩得死死的，撞开一看，人倒在地上，叫都叫不醒！'], [SHUN, '他带来的一箱灵药没了。那是丹霞堂订的货，值三千灵石！按玄天城的规矩，「店失客物，店赔七成」……掌柜的要是赔了这笔钱，小店就得关门。'],
        [SHUN, '城卫来看了一眼，说是外贼翻窗。可我们后巷那堵墙三丈高啊！']]);
      const k = await choose('支线 · 天字三号房', ['「带我去看看。」（报酬：修为 +680、灵石 700，另有相赠）', '下次再说']); if (k !== 0) return;
      s.s = 1; s.n = 0; f.xr_notes = []; try { playSnd('ui_confirm'); } catch (e) {}
      await say(XX, '（门从里面闩着，东西却没了。有意思——小子，先别听他们怎么说，上楼自己看。）'); toast('接取支线：天字三号房 —— 进客栈，上二楼', 2800);
    }; } }

  // ---------------- 第二幕：现场五处 ----------------
  spot(HALL, 2.2, 4.6, '楼梯 · 上二楼', async () => {
    if (!on() && q().s !== 3) { await say('', '楼梯口站着个城卫：「二楼出了案子，闲人免上。」'); return; }
    try { await goMap('xt_inn_room3', roomIn[0], roomIn[1], 'up'); } catch (e) { tileSetMap('xt_inn_room3', roomIn[0], roomIn[1], 'up'); }
  });
  const seen = k => { const f = F(); f.xr_seen = f.xr_seen || {}; if (f.xr_seen[k]) return false; f.xr_seen[k] = 1; return true; };
  const count = async () => { const f = F(), s = q(), n = Object.keys(f.xr_seen || {}).length; if (s.n !== 0) return; if (n < 5) { toast('天字三号房　现场 ' + n + ' / 5', 1800); return; }
    await L([[GUARD, '看完了？我说了，外贼翻窗。窗台上那泥脚印就是铁证。'], [YE, '贼翻窗进来，偷了东西再翻出去。那他是怎么从外面，把屋里的窗栓插上的？'], [GUARD, '……这，这个嘛……'],
      [XX, '（第一个说法，破了。门闩着，窗也闩着——昨夜这屋里，从头到尾只有一个人。先下楼，听听那个「只有一个人」怎么说。）']]);
    s.n = 1; toast('天字三号房 —— 下楼到大堂问话', 2400); };
  man(ROOM, 'town_guard', 9.6, 10.4, GUARD, async () => { if (q().n === 0 && on()) await say(GUARD, '天剑宗的？行，你看你的。反正就是外贼翻窗，没什么好查的。'); else await say(GUARD, q().s === 3 ? '惭愧。往后办案，我先看窗栓。' : '……我再想想那窗栓的事。'); });
  spot(ROOM, 7.7, 11.2, '断掉的门闩', async () => { if (!on()) return; await L([['', '一根手腕粗的木门闩，从正中间断成两截，断口是新茬。'], [YE, '是撞门的时候撞断的。也就是说，撞开之前，门确确实实是从里面闩着的。']]); if (seen('men')) { note('门是从里面闩死的，撞门时才断'); await count(); } }, { cond: on });
  spot(ROOM, 12.6, 5.2, '后窗和窗栓', async () => { if (!on()) return; await L([['', '窗子朝着后巷，关得严严实实。铜窗栓插在槽里，栓头上落着一层薄灰。'], [XX, '（灰都没蹭掉。这栓子，昨夜没人从这头动过第二回。）']]); if (seen('chuang')) { note('后窗的栓也是从里面插着的，栓头有灰'); await count(); } }, { cond: on });
  spot(ROOM, 11.4, 5.6, '窗台上的泥印', async () => { if (!on()) return; await L([['', '窗台上有一个清清楚楚的泥脚印，鞋尖朝着屋里。'], [YE, '只有进来的，没有出去的。'], [XX, '（而且只有一只。小子，你翻窗的时候，是单脚跳进来的？）']]); if (seen('ni')) { note('窗台只有一个朝里的泥印，没有出去的'); await count(); } }, { cond: on });
  spot(ROOM, 9.4, 7.6, '桌上的两只茶杯', async () => { if (!on()) return; await L([['', '圆桌上一壶两杯。一只杯子喝干了，杯底留着一点褐色的渣；另一只倒扣着，根本没用过。'], [YE, '摆了两只杯子，像是在等人。可第二只杯子连翻都没翻过来。'], [XX, '（要么那人没来。要么——压根就没有那个人，杯子是摆给后来进屋的人看的。）']]); if (seen('cha')) { note('两只茶杯：一只喝干有药渣，一只倒扣没用过'); await count(); } }, { cond: on });
  spot(ROOM, 5.2, 8.6, '地板上的印子', async () => { if (!on()) return; await L([['', '床边的地板上，薄灰里留着一块干净的长方形，是放过箱子的痕迹——约莫一尺来宽，两尺来长。'], ['', '床底下还滚着一个揉皱的小纸包，纸上印着「安神散」三个字，是药铺里最寻常的助眠药。'], [YE, '（一尺宽，两尺长。值三千灵石的一箱灵药，就这么大？）']]); if (seen('yin')) { note('地上的箱印只有一尺宽两尺长；床底有安神散的空纸包'); await count(); } }, { cond: on });

  // ---------------- 第三幕：大堂问话（三个人）----------------
  const asked = async k => { const f = F(), s = q(); f['xr_a_' + k] = 1; if (s.n !== 1) return; if (!(f.xr_a_q && f.xr_a_b && f.xr_a_n)) { toast('天字三号房　问话 ' + ['q', 'b', 'n'].filter(x => f['xr_a_' + x]).length + ' / 3', 1800); return; }
    await L([['', '门口一阵响动——查案的城卫大步下了楼。'], [GUARD, '我想明白了！不是外贼，是内贼！昨晚的茶是那个伙计送的，药就下在茶里。掌柜的，后厨昨晚是不是上了锁？他说他睡后厨——他在撒谎！'], [BOSS, '阿顺？不可能，那孩子……（说不下去了）'],
      [XX, '（第二个说法来了。小子，那伙计确实撒了谎。可撒谎的人，未必是偷东西的人——去问他本人。）']]);
    s.n = 2; toast('天字三号房 —— 出客栈，到门口问阿顺', 2400); };
  man(HALL, 'traveling_merchant', 4.2, 8.2, QIAN, async () => { const s = q();
    if (s.s === 3) { await say(QIAN, F().xr_end === 2 ? '（系着围裙擦桌子）客官慢用！……唉，三年，就三年。' : '……'); return; }
    if (!on() || s.n < 1) { await say(QIAN, '（瘫在椅子上，脸色蜡黄，旁边的伙计正给他扇风）哎哟……我的头……'); return; }
    if (s.n >= 5) { await say(QIAN, '（不停擦汗）少、少侠还有什么要问的？该说的我都说了……'); return; }
    await L([[QIAN, '少侠！您可得给我做主啊！我昨晚喝了杯茶，就人事不省了。醒过来——箱子没了！'], [QIAN, '那一箱三十株凝露草，是我全部的身家。进店那天两个挑夫才抬上楼的，半人高的大箱子，就搁在我床边上！'], [QIAN, '丹霞堂的定金我都收了，交不出货要翻倍赔……客栈得赔我！「店失客物，店赔七成」，这是玄天城的规矩！'],
      [XX, '（半人高的大箱子，搁在床边。小子，床边那块印子多大来着？……先记下，别声张。）']]);
    note('钱满仓说：药箱半人高，两个挑夫抬上楼，搁在床边'); await asked('q'); }, { cond: () => !(F().xr_end === 1) });
  man(HALL, 'innkeeper', 8, 4.4, BOSS, async () => { const s = q(), f = F();
    if (s.s === 3) { await say(BOSS, '少侠再来玄天城，天字三号给您留着，不收钱。'); return; }
    if (!on()) { await say(BOSS, '客官打尖还是住店？……唉，今天楼上出了点事，怠慢了。'); return; }
    if (s.n === 5) return finale();
    if (s.n === 4) {
      await L([[YE, '掌柜的，再问一句。钱满仓进店那天，带了什么行李？谁替他搬的？'], [BOSS, '行李？他自己拎上去的呀，一只小藤箱，还没我这算盘大。我当时还打趣：钱老板这趟货少，是发了大财用不着跑了？'], [YE, '没有挑夫？没有半人高的大箱子？'],
        [BOSS, '挑夫？小店的楼梯窄，大箱子上楼得拆栏杆，我能不知道？……等等，少侠，你的意思是——'], [XX, '（一个说两个挑夫抬着半人高的箱子，一个说他自己拎着只小藤箱。地板上那块印子，站在谁那边，小子你说呢。）'], [YE, '掌柜的，劳烦把人都叫到大堂来。钱老板，城卫，还有门口的阿顺。']]);
      note('柳三娘说：钱满仓进店只拎了一只小藤箱，没有挑夫'); s.n = 5; toast('天字三号房 —— 跟柳三娘说：把人叫齐', 2400); return; }
    if (s.n < 1) { await say(BOSS, '少侠先上楼看看吧。小店十五年的招牌，全指望您了。'); return; }
    if (f.xr_a_b) { await say(BOSS, s.n >= 2 ? '阿顺那孩子是我看着长大的……少侠，求您问明白。' : '少侠再去问问别人？'); return; }
    await L([[BOSS, '少侠，昨晚的茶是阿顺送的，戌时三刻。钱老板自己在门口接的，没让进屋。'], [BOSS, '这门闩是老式的，只能从里头闩，外头没有钥匙孔——所以城卫才咬定是翻窗。'], [BOSS, '按规矩，客人在店里丢了东西，小店赔七成。三千灵石的七成……（苦笑）把这栋楼卖了也就这个数。']]);
    note('茶是戌时三刻阿顺送的，钱满仓在门口接，没让人进屋'); await asked('b'); });
  man(HALL, 'wandering_blade', 13.4, 7.2, NV, async () => { const s = q();
    if (!on() || s.n < 1) { await say(NV, '（靠窗坐着，自顾自擦一柄短剑）……'); return; }
    if (F().xr_a_n) { await say(NV, '我只说我看见的。别的，与我无关。'); return; }
    await L([[YE, '这位道友住天字四号？昨夜隔壁可有动静？'], [NV, '（头也不抬）寅时。我在窗边打坐。'], [NV, '隔壁的窗子开过一回，又关上了。没人出来，也没人进去。'],
      [NV, '只有一只手伸出来，往窗台上按了一下什么东西，就缩回去了。'], [YE, '一只手？从屋里伸出来的？'], [NV, '从屋里。手很胖。']]);
    note('沈霜看见：寅时，一只很胖的手从屋里伸出来，往窗台上按了一下'); await asked('n'); });

  // ---------------- 第四幕：丹霞堂 ----------------
  { const n = (CITY.npcs || []).find(n => n.name === DAN && !n.hidden); if (n) { const orig = n.talk; n.talk = async function (a) {
      const s = q(); if (s.s === 1 && s.n === 3) {
        await L([[YE, '贵堂订的那批凝露草，是怎么个装法？'], [DAN, '凝露草？那东西娇贵，见风就蔫，得一株一株码在寒玉匣里，匣子外头再套木箱。三十株的货，箱子少说半人高，两个人才抬得动。'], [YE, '一尺宽、两尺长的箱子，装得下么？'],
          [DAN, '（笑）那顶多装三株。少侠说笑了。'], [DAN, '说起来，钱老板这批货三天前就该交，他推说路上耽搁，一拖再拖。我们掌柜昨儿还放了话：今天再不交，定金翻倍赔——一千五变三千。'],
          [XX, '（今天不交货就要赔三千。偏偏昨天夜里，货「丢」了。巧不巧？回客栈，问掌柜的一句话就够了。）']]);
        note('丹霞堂：三十株凝露草的箱子至少半人高；钱满仓拖了三天没交货，今天再不交要赔三千'); s.n = 4; toast('天字三号房 —— 回客栈大堂，再问柳三娘', 2400); return; }
      if (typeof orig === 'function') return orig.call(this, a); const A = Array.isArray(orig) ? orig : [orig || '客官要抓药？']; for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(DAN, l); }; } }

  // ---------------- 第五幕：当众说穿 ----------------
  async function finale() {
    const s = q(), f = F();
    await L([['', '大堂的门关上了。柳三娘、城卫、阿顺、沈霜，还有瘫在椅子上的钱满仓，都看着叶孤星。'], [QIAN, '少侠这是……抓到贼了？'], [YE, '抓到了。就在这间屋里。'],
      [YE, '第一件。门闩和窗栓，都是从里面插上的。昨夜那间房里，从头到尾只有一个人。'], [GUARD, '可窗台上的泥印——'], [YE, '只有一个，鞋尖朝里，没有出去的。寅时，沈道友看见一只手从屋里伸出来，往窗台上按了一下。贼不会从屋里往外按脚印。'],
      [NV, '手很胖。'], ['', '所有人的目光，慢慢落在了钱满仓那双肉乎乎的手上。'], [QIAN, '（干笑）这、这位道友怕是看花了眼……'],
      [YE, '第二件。两只茶杯，一只喝干，杯底是安神散的渣；另一只倒扣着没动过。纸包在床底下。迷药不是别人下的——是你自己喝的。倒扣的那只杯子，是摆给撞门进来的人看的。'],
      [QIAN, '我……我为什么要迷晕我自己？！我丢了三千灵石的货！'], [YE, '第三件。你说药箱半人高，两个挑夫抬上楼。丹霞堂也说，三十株凝露草的箱子，少说半人高。'],
      [YE, '可掌柜说，你进店那天，自己拎着一只小藤箱。地板上的印子，一尺宽，两尺长。'], [BOSS, '（一拍柜台）小店的楼梯，半人高的箱子上不来！'],
      [YE, '所以没有贼。因为从头到尾，就没有那箱药。'], ['', '大堂里静得能听见算盘珠子滚动的声音。'],
      [YE, '你的货三天前就该交，一直交不出来。今天再不交，要赔丹霞堂三千。于是你想了个法子：货不是「没有」，是「在客栈被偷了」——丹霞堂那边成了天灾，客栈这边，还得照规矩赔你七成。'],
      [XX, '（一进一出，白赚两千一。算盘打得比掌柜的还响。）'], ['', '钱满仓脸上的肉抖了几下，「扑通」一声，从椅子上滑到了地上。'],
      [QIAN, '……货是真有过的！半路在幽影林叫妖兽掀了车，三十株草烂得一株不剩！我收了定金，还了旧债，一文都没剩下……我、我是实在没路走了！'],
      [SHUN, '那您就让我替您背这个贼名？我娘还等着我的工钱抓药！'], [QIAN, '（头磕在地上）……对不住，小兄弟。我对不住你。']]);
    const k = await choose('怎么处置钱满仓？', ['「交给城卫，按玄天城的规矩办。」', '（看向柳三娘）「掌柜的，这是你的店。你说。」']);
    if (k === 1) { await L([[BOSS, '（盯着钱满仓看了半晌，叹了口气）报官，他坐三年牢，我一文钱拿不回来，丹霞堂那三千也是烂账。'], [BOSS, '钱满仓，你不是会算账么？从今天起，你给我在柜上当账房，包吃住，没工钱。丹霞堂的定金，我先替你垫上，你拿三年的工抵。干不干？'],
        [QIAN, '（愣了半天，眼泪下来了）……干！我干！'], [GUARD, '这……不合规矩吧？'], [BOSS, '苦主是我，我不告。官爷，喝碗茶再走？'], [XX, '（这掌柜的，才是这屋里最会算账的。白得一个账房，还落了个仁义的名声。）']]); f.xr_end = 2; }
    else { await L([[GUARD, '（咳了一声，上前把人拎起来）钱满仓，诈赔、诬告，跟我走一趟吧。'], [GUARD, '……少侠，惭愧。往后办案，我先看窗栓。'], [BOSS, '少侠，小店十五年的招牌，是您保下来的。']]); f.xr_end = 1; }
    await L([[SHUN, '客官，谢谢您信我。……还有件事，不知当讲不当讲。书坊这两天赶印的那批烫金帖子，老板不让我们看正面写的什么，印坏的都要当面烧掉。我总觉得不大对劲。'], [XX, '（烫金的帖子，不让人看……记一笔。这城里的怪事，一件连着一件。）'],
      [BOSS, '这块房牌您拿着。天字三号，往后给您留着——就当镇宅了。']]);
    f.xr_hint3 = 1; s.s = 3; s.n = 6;
    const h = S.hero, lv0 = h.lv; addItem('c_tianzi', 1); h.gold = (h.gold || 0) + Q.reward.gold; try { playSnd('jingle_win'); } catch (e) {}
    if (window.itemGet) await itemGet([{ icon: 'item:c_tianzi', id: 'c_tianzi', name: '天字号房牌', count: '×1', desc: ITEM_DB.c_tianzi.desc }, { icon: 'gold', name: '灵石', count: '×' + Q.reward.gold }], '支线完成 · 天字三号房');
    const ups = typeof gainExp === 'function' ? gainExp(Q.reward.exp) : 0; toast('修为 +' + Q.reward.exp, 1800); if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0);
  }
  window.R214 = { st, Q, finale };
})();
