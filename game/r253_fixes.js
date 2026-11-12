// ================= R253 · 全局修正（作者 11-13 凌晨：「我说的所有问题都是全局的问题，不要只改一个地方」）=================
// ① 人物和屋子的比例：把新做的内景逐张对着「人」量了一遍，家具明显偏大的整张缩小（人物在屏幕上的大小不变）。
// ② 传送阵放在楼梯口：凡是楼梯尽头 / 楼梯顶上的传送阵，都挪到踏上楼梯的那一头；对面回来的落脚点跟着挪。
// ③ 画在场景里的人（坐着喝茶的、抚琴的、下棋的、莲台上的长老……）都要有名字、能搭话：
//    在人脚下放一个「只有名字和对话、不画身体」的 NPC（ghost），头顶就有名牌，点人或走近按键都能说话。
// ④ 听雨楼二层：写诗的书生原来坐到了矮墙上，挪回地板；露台两张空桌坐上客人，斟茶的茶娘有了斟茶的对象；二层多一位走动的茶娘。
// 只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof drawActorT !== 'function') return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const L = async a => { for (const [w, t] of a) await say(w, t); };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const XX = '星旋', YE = '叶孤星';
  const reg = n => { try { SPEAKERS[n] = SPEAKERS[n] || { p: '', color: '#e6dccb' }; } catch (e) {} };

  // ---------------- ① 比例 ----------------
  // 量法：以作者认可的青阳镇 / 林府 / 青竹小院为准（太师椅约 96×120、圆凳约 52、茶桌约 150×100、书案约 250×150），
  // 把新内景里同类家具的尺寸除一下：万宝楼一层 / 据点正厅 / 天字一号房偏大四成左右，客栈大堂、三号房、万宝楼雅间和库房偏大两成多。
  // 房间比屏幕小的（两间客房 1280×960）缩了以后两侧留暗边，和别的小屋子（民居、养伤内堂）一样。
  try {
    const Z = { xt_wanbao: .72, xt_sect_hall: .72, xt_inn_hall: .8, xt_wanbao_vip: .8334, xt_wanbao_store: .8334, xt_inn_room1: .75, xt_inn_room3: .75, xt_sect_rest: .75 };
    const WIDE = { xt_inn_room1: 1, xt_inn_room3: 1, xt_sect_rest: 1 };
    for (const [k, z] of Object.entries(Z)) { const B = TMAPS[k] && TMAPS[k].baked; if (!B) continue;
      for (const [m, M] of Object.entries(TMAPS)) if (M && M.baked === B) { MAP_ZOOM[m] = z; if (WIDE[k] && typeof WIDE_OK === 'object') WIDE_OK[m] = 1; } }
    // 作者 11-13：正厅缩小以后，莲台上的长老跟着缩成了「袖珍」的——他是画在场景里的人，不是家具。
    // 规矩（全局）：地图整张缩小时，画在场景里的人（莲台长老、带人座位组）不跟着缩，按脚底放回和走动的人一样的大小。
    // 客栈大堂那几桌当初摆的时候就放大过 1.2–1.3，正好抵掉，不再重复放大。
    const isPerson = o => o.img === 'r239_elder' || /^set_/.test(o.id || '');
    for (const [k, z] of Object.entries(Z)) { if (k === 'xt_inn_hall') continue; const B = TMAPS[k] && TMAPS[k].baked; if (!B) continue; for (const o of B.objs || []) if (isPerson(o)) o._pk = 1 / z; }
    if (typeof drawBaked === 'function') drawBaked = (orig => function (o, now) { const k = o && o._pk; if (!k || k === 1) return orig.apply(this, arguments);
      const cx = o.x + o.w / 2, by = o.y + o.h; ctx.save(); ctx.translate(cx, by); ctx.scale(k, k); ctx.translate(-cx, -by); try { return orig.apply(this, arguments); } finally { ctx.restore(); } })(drawBaked);
  } catch (e) { console.warn('r253 zoom', e); }

  // ---------------- ② 传送阵放在楼梯口 ----------------
  try {
    const ex = (m, re) => (TMAPS[m] && TMAPS[m].exits || []).find(e => re.test(e.label || ''));
    let e;
    // 玄元拍卖场：东西两道楼梯，原来阵在楼梯顶上 → 挪到最下面两级台阶
    if ((e = ex('xt_auction', /西侧楼梯/))) Object.assign(e, { x: 21, y: 63, w: 11, h: 4 });
    if ((e = ex('xt_auction', /东侧楼梯/))) Object.assign(e, { x: 168, y: 63, w: 11, h: 4 });
    if ((e = ex('xt_auction_vip', /返回拍卖大厅/))) Object.assign(e, { at: P(212, 592), face: 'down' });   // 下楼回来：站在西楼梯脚下
    // 万宝楼：上楼的阵原来在楼梯顶 → 楼梯脚
    if ((e = ex('xt_wanbao', /上楼/))) Object.assign(e, { x: 19, y: 43, w: 18, h: 4 });
    if ((e = ex('xt_wanbao_vip', /下楼回大厅/))) Object.assign(e, { at: P(228, 440), face: 'down' });
    // 云来客栈二楼走廊：下楼的阵原来在楼梯最底下 → 楼梯口（走廊地板接楼梯的那一头）；从大堂上来也落在楼梯口旁边
    if ((e = ex('xt_inn_corr', /下楼/))) Object.assign(e, { x: 196, y: 91, w: 21, h: 4 });
    if ((e = ex('xt_inn_hall', /上楼/))) Object.assign(e, { at: P(1652, 692), face: 'up' });
    for (const [m, M] of Object.entries(TMAPS)) if (M && M !== TMAPS.xt_inn_hall && M.baked && TMAPS.xt_inn_hall && M.baked === TMAPS.xt_inn_hall.baked) for (const x of M.exits || []) if (/上楼/.test(x.label || '') && x.to === 'xt_inn_corr') Object.assign(x, { at: P(1652, 692), face: 'up' });
  } catch (e) { console.warn('r253 stairs', e); }

  // ---------------- ③ 只有名字和对话、不画身体的 NPC ----------------
  drawActorT = (o => function (a, now) { if (a && a.npc && a.npc.ghost && !a.hidden) return; return o.apply(this, arguments); })(drawActorT);
  const ghost = (x, y, name, talk, h) => { reg(name); const [c, r] = P(x, y); return { key: 'none', ghost: true, c, r, name, h: h || 100, wander: false, talk, random: Array.isArray(talk) && talk.length > 1 }; };
  window.R253 = { ghost };

  // 据点长老：莲台上的人原来没有名牌、头顶也不出任务标记
  try { const e = (TMAPS.xt_sect_hall && TMAPS.xt_sect_hall.npcs || []).find(n => n.name === '据点长老'); if (e) { e.hidden = false; e.ghost = true; e.h = 160; } } catch (e) {}

  // 带人座位组：每一桌一个名字、几句闲话（按它所在的铺子写）
  const SETS = {
    qy_tea: {
      set_tea_chess: ['对弈的老茶客', ['将！……哎，不算不算，我方才手滑了。', '在这茶馆下了二十年棋，赢的茶钱够再开一间茶馆。输的嘛，够开两间。', '后生，观棋不语。——除非你看出我要输了，那赶紧说。']],
      set_tea_mother_girl: ['带着女儿的妇人', ['慢点喝，烫。……这孩子，一听要来镇上就不肯睡觉。', '她爹在林府当差，月底才回一趟家。我带她来看看热闹。', '（小姑娘捧着茶碗，偷偷看了你的剑一眼，又赶紧低下头。）']],
    },
    qy_tavern: {
      set_sq4_escorts: ['歇脚的镖师', ['这趟镖走玄天城，路上不太平，东家多给了三成的脚钱。', '云霄山脉外头那片林子，夜里千万别生火。火一亮，什么都招来了。', '喝完这碗就上路。——小二，再切二斤牛肉包上！']],
      set_round2_old_friends: ['叙旧的老友', ['一晃十年。你那时候说要去玄天城闯一闯，闯得如何？', '闯什么闯，在万宝楼后院搬了十年箱子。来，喝。', '镇上还是老样子。就是醉仙楼的酒，掺的水比从前少了。']],
      set_sq2_drunk: ['喝高了的酒客', ['我、我没醉……这桌子怎么自己在转……', '嗝——我跟你说，我年轻时候也是测过灵根的！……杂灵根。嗝。', '（他趴在桌上，嘴里还在念叨一个人的名字。）']],
      set_sq1_swordsman: ['独酌的剑客', ['……', '剑不离手，酒不过三。这是规矩。', '你的剑不错。握剑的手，还嫩了点。']],
      set_round3_cultivators: ['论道的散修', ['凝丹难，难在一个「凝」字。灵力易聚，心念难收。', '听说天剑宗今年收徒，光测灵碑前就排了三天。', '散修有散修的好处——没人管。也有散修的坏处——没人管。']],
    },
    qy_inn: {
      set_sq2_merchants: ['对账的行商', ['这批药材运到玄天城，丹霞堂给的价是青阳镇的两倍，刨去路上的损耗……还是赚。', '你那算盘打错一位了。重来。', '悦来客栈的床板硬是硬了点，胜在干净，不闹耗子。']],
      set_sq4_family: ['投宿的一家人', ['孩子他爹，明天还得赶路，少喝两口。', '我们是去玄天城投亲的。听说那里夜里满城都是灵灯，亮得跟白天一样。', '（最小的那个孩子已经趴在桌边睡着了。）']],
    },
    xt_inn_hall: {
      set_round5_feast: ['摆席的客人', ['今日是我们东家五十大寿，这一桌是掌柜的特意留的。', '来来来，满上！云来客栈的「三白酿」，出了玄天城可喝不着。', '听说了吗，玄元拍卖场这回要出一件压轴的东西，城里的客栈都住满了。']],
      set_sq2_guards: ['歇脚的城卫', ['刚下值。这几日城门查得紧，站一天腿都是木的。', '上头只说「留意生面孔」，留意什么、为什么留意，一个字不讲。', '你也是来赶拍卖会的？住店记得把门闩插好。']],
      set_long_solo_noodles: ['埋头吃面的汉子', ['（他头也不抬，呼噜呼噜吃得正香。）', '别跟我说话，面要坨了。', '这家的阳春面，汤是拿老鸡吊的。十文钱，值。']],
      set_long6_caravan: ['商队的伙计们', ['我们是走苍月城那条线的商队，明早天不亮就得套车。', '头儿说这趟货贵重，夜里要轮着守。今晚我守下半夜，先吃饱。', '玄天城样样都好，就是东西贵。一碗面顶我们那儿三碗。']],
      set_sq2_cultivator_pair: ['结伴的修士', ['拍卖会的入场牌子你拿到了么？我托人问了三家，都说没了。', '听说万宝楼二楼可以鉴宝，就是那位鉴宝师傅的眼光毒得很，一句话能把人说哭。', '师兄，我们的灵石只够住三晚。']],
      set_dine_three_ochre: ['吃饭的行脚客', ['这城里的客栈，就数云来的饭菜实在。', '天字号的房？那是给有钱的主儿住的，我们睡通铺。', '掌柜的柳三娘你可别惹，她一个人能镇住半条街的泼皮。']],
      set_dine_three_teal: ['闲谈的住客', ['昨夜二楼不知哪间房，半夜里咚的一声，吓我一跳。', '城主府的告示看了没有？这阵子入夜以后，少往偏巷里走。', '听雨楼的茶，云来的酒，万宝楼的眼——玄天城三绝。']],
      set_dine_one: ['独坐的客人', ['……我在等人。', '这位置好，进门的、上楼的，谁都看得见。', '（他面前的茶早凉了，一口没动。）']],
    },
    qy_yicui: {
      set_tea_two_ladies: ['听琴的姐妹', ['姐姐你听，这一段像不像落雨？', '嘘——苏姑娘抚琴的时候，楼里是不许出声的。', '我们攒了半个月的钱，就为来听这一曲。']],
      set_tea_old_scholar: ['闭目听琴的老先生', ['（老先生闭着眼，手指在膝头轻轻打着拍子。）', '琴为心声。这位姑娘的琴里，有一桩放不下的旧事。', '老朽耳朵背了，琴声倒是越听越清楚。']],
      set_tea_two_scholars: ['品茶的书生', ['倚翠楼的规矩：只听琴，不劝酒。这才是读书人该来的地方。', '兄台方才那句「弦上有秋声」，对得妙。', '我们是结伴去玄天城赶考的，路过青阳镇，慕名而来。']],
      set_tea_two_couple: ['听曲的小夫妻', ['成亲三年，他头一回带我出来听曲。', '（男人不好意思地挠挠头）铺子里忙嘛……往后常来，常来。', '这茶点做得精致，回头我也学着做。']],
    },
    qy_changle: {
      set_madiao4: ['打马吊的赌客', ['碰！……等等，你方才那张牌是从哪儿摸的？', '手气背的时候，喝口凉水都塞牙。再来一圈！', '长乐坊的庄家从不出千——他们用不着。']],
      set_cards_two: ['斗叶子牌的两人', ['一对「万贯」，压你。', '急什么，我还有牌。……你看我这眼神，像是有牌的样子么？', '输了的请酒，说好的。']],
      set_gamble_winner: ['赢了钱的赌客', ['哈哈哈哈！今晚的酒，我请！', '看见没有，这就叫时来运转！昨天我还欠着坊里二十两呢。', '见好就收？……再押一把，就一把。']],
      set_gamble_four: ['押大小的赌客', ['大！大！大！——哎！', '我押小的时候它开大，我押大的时候它开小。这骰子是不是认得我？', '小兄弟，听句劝：这地方，站着看看就好。']],
      set_gamble_watch: ['看热闹的闲汉', ['我不赌，我就看看。看别人输钱，比自己赢钱还解闷。', '那边那位，从晌午坐到现在，把媳妇的镯子都押上了。', '楼上账房管得严，欠了钱想赖？门口那两位打手可不是摆设。']],
    },
    xt_teahouse: {
      set_round2_old_friends: ['叙旧的老茶客', ['这楼里的雨声，和四十年前一个样。人倒是换了好几茬。', '你还记得么，当年咱俩就是在这张桌上，为一碟茴香豆打了一架。', '掌柜的新换的茶娘，手比从前那几个稳。']],
      set_sq2_cultivator_pair: ['结伴的修士', ['听雨楼的规矩，楼内不谈买卖，不动刀兵。连城主府的人进来都得先解剑。', '二楼露台那位白衣剑客，在栏杆边站了三天了，一句话没说过。', '师姐，这壶「檐下青」要八块灵石……我们还是喝白水吧。']],
    },
  };
  try {
    for (const [m, table] of Object.entries(SETS)) { const M = TMAPS[m], bk = M && M.baked; if (!bk) continue; M.npcs = M.npcs || [];
      for (const o of bk.objs || []) { const d = table[o.id]; if (!d || o._r253) continue; o._r253 = 1;
        const by = o.sy != null ? o.sy : o.y + o.h; M.npcs.push(ghost(o.x + o.w / 2, by - 2, d[0], d[1], Math.round(o.h * .74))); } }
  } catch (e) { console.warn('r253 sets', e); }

  // ---------------- ④ 听雨楼二层 ----------------
  try {
    const M = TMAPS.xt_teahouse_2f, bk = M && M.baked, A = window.R231S && R231S.A;
    if (bk && A) {
      const cs = bk.cs, B = bk.blocked.split(''), set = (x0, y0, x1, y1, v) => { for (let y = Math.floor(y0 / cs); y <= Math.floor(y1 / cs); y++) for (let x = Math.floor(x0 / cs); x <= Math.floor(x1 / cs); x++) if (x >= 0 && y >= 0 && x < bk.cols && y < bk.rows) B[y * bk.cols + x] = v; };
      const O = bk.objs, byId = id => O.filter(o => o.id === id);
      // 西南角那座花罩雅座贴着矮墙，书生的桌子摆到了墙上 → 拿掉这座花罩，书生挪到地板上、琴师旁边（听着琴写诗）
      const scr = byId('alcove_screen')[2], poet = byId('poet_set')[0], cush = O.find(o => o.id === 'straw_cushion' && o.x === 378 && o.y === 1006);
      if (scr && poet) {
        // 先把这一角的挡路按墙的走向重排（墙沿：(185,923) → (292,999) → (438,1057)），再给书生的新位置补上
        const wallX = y => y < 999 ? 185 + (y - 923) * (292 - 185) / (999 - 923) : 292 + (y - 999) * (438 - 292) / (1057 - 999);
        for (let y = 936; y <= 1052; y += cs) for (let x = 120; x <= 520; x += cs) B[Math.floor(y / cs) * bk.cols + Math.floor(x / cs)] = x < wallX(y + cs) + 14 ? '1' : '0';
        O.splice(O.indexOf(scr), 1);
        Object.assign(poet, { x: 430, y: 905, sy: 1001 }); set(446, 972, 510, 1000, '1');
        if (cush) Object.assign(cush, { x: 548, y: 978, sy: 1007 });
      }
      // 露台两张空桌 → 坐上客人（R230 的座位组，六帧循环）：近处一位观雨的老先生（茶娘正给他斟茶），伞边一位摇扇的妇人
      // 这一组别处没用过的话，六帧循环的图要自己挂上（不然进图会一直等这张图）
      const anim = k => { const key = 'r230_' + k, d = Object.getOwnPropertyDescriptor(IMG, key); if (d && d.get) return; const a = A[k], im = new Image(), fr = [];
        im.onload = () => { const fw = im.width / 6, fh = im.height; for (let i = 0; i < 6; i++) { const c = document.createElement('canvas'); c.width = fw; c.height = fh; c.getContext('2d').drawImage(im, i * fw, 0, fw, fh, 0, 0, fw, fh); fr.push(c); } };
        im.src = 'r230/a_' + k + '.webp';
        try { Object.defineProperty(IMG, key, { configurable: true, enumerable: true, get: () => fr.length ? fr[Math.floor(performance.now() / 1000 * 6) % fr.length] : undefined, set: () => {} }); } catch (e) {} };
      const put = (o, k, cx, by) => { const a = A[k]; anim(k); for (const key of Object.keys(o)) delete o[key];
        Object.assign(o, { id: 'set_' + k, uid: 'r253_2f_' + k, img: 'r230_' + k, w: a[0], h: a[1], x: Math.round(cx - a[2]), y: Math.round(by - a[3]), sy: by, flat: false, noPre: true });
        set(cx + a[4] - a[2], by + a[5] - a[3], cx + a[4] - a[2] + a[6] - 1, by + a[5] - a[3] + a[7] - 1, '1'); };
      const tt = byId('terrace_tea_set');
      if (tt[0]) put(tt[0], 'tea_old_scholar', 1092, 752);
      if (tt[1]) put(tt[1], 'tea_lady_fan', 1150, 990);
      bk.blocked = B.join('');
      // 人：都有名字、都能搭话（原来只有看不见的热点，头顶没名牌）
      const ob = id => O.find(o => o.id === id), feet = (o, dx) => [o.x + o.w / 2 + (dx || 0), o.sy - 2];
      const q = ob('qin_player_set'), sw = ob('rain_swordsman'), cb = ob('chess_guest_blue'), csd = ob('chess_guest_sand'), ta = ob('tea_attendant');
      const keep = (M.npcs || []).filter(n => n.name === '红泥小炉');
      const npcs = keep.slice();
      if (q) npcs.push(ghost(...feet(q), '琴娘·疏桐', async () => { await L([['', '琴声不疾不徐，像檐上的雨一滴一滴落进缸里。'], ['琴娘·疏桐', pick(['（她没有抬头，指尖在弦上轻轻一按，余音散进雨里。）', '客官想听什么？……罢了，雨想听什么，我便弹什么。', '这张琴是掌柜的借我的。她说琴放着不弹，木头会忘了自己是琴。'])], [XX, '（这丫头手上有功夫。不是剑的功夫——是把心弦压住的功夫。）']]); }, 104));
      if (poet) npcs.push(ghost(...feet(poet), '书生·陆怀章', async () => { await L([['书生·陆怀章', pick(['「一楼风雨半城灯」……下一句，下一句是什么来着……', '掌柜的说，谁能在这楼上写出一句让她点头的诗，那一年的茶钱都免了。三年了，没人免过。', '嘘——疏桐姑娘这一段，我得记下来。琴声记不住，就记它像什么。'])]]); }, 104));
      if (cb) npcs.push(ghost(...feet(cb), '棋客·温先生', async () => { await L([['棋客·温先生', pick(['（他拈着一枚白子，含笑不语。）', '让他三子，是敬他年长。赢他，是敬这盘棋。', '小友也懂棋？那你看，他这条大龙还有没有活路？……别说出来。'])]]); }, 88));
      if (csd) npcs.push(ghost(...feet(csd), '棋客·老贺', async () => { await L([['棋客·老贺', pick(['别吵别吵，这一手我想了半炷香了。', '他让我三子，我还是输。可在这楼上输棋，比在别处赢棋痛快。', '再来一盘！……掌柜的，记账！'])], [XX, '（黑棋那条大龙早死了，他还没看出来。）']]); }, 88));
      if (sw) npcs.push(ghost(...feet(sw), '白衣剑客·谢停云', async () => { await L([['白衣剑客·谢停云', pick(['从这儿望出去，十盏灵灯一盏不落。夜里灵枢的光幕升起来，雨打在上头，像打在一口倒扣的琉璃碗上。', '我在等一场雨停。停了，就该走了。……可这玄天城的雨，总也不停。', '剑在楼下。听雨楼的规矩，上楼不带兵刃——这规矩，我服。'])]]); }, 120));
      if (ta) npcs.push(ghost(...feet(ta), '茶娘·挽月', async () => { await say('茶娘·挽月', pick(['露台的茶凉得快，客官趁热。', '那把大伞是掌柜的亲手画的伞面。她说，伞底下的人不该淋雨，也不该淋愁。', '我管露台这几桌。客官要添水，招招手就好。'])); }, 116));
      if (tt[0]) npcs.push(ghost(1092, 750, '观雨的老先生', ['（老先生捧着茶盏，望着雨幕出神。）', '老朽每逢落雨必来。这一城的屋瓦，淋湿了才好看。', '挽月这丫头斟茶，七分满，一滴不洒。如今的年轻人，难得。'], 110));
      if (tt[1]) npcs.push(ghost(1150, 988, '摇扇的妇人', ['下着雨还摇扇子？——摇的不是风，是闲。', '我家那口子在万宝楼当掌眼，忙得脚不沾地。我一个人来，倒清净。', '这露台的位置要提前三天订。今日是托了掌柜的情面。'], 110));
      // 二层的茶娘：素笺从一层调上来，在雅座这半边走动添茶
      try { const one = TMAPS.xt_teahouse, i = (one.npcs || []).findIndex(n => n.name === '茶娘·素笺');
        if (i >= 0) { const n = one.npcs.splice(i, 1)[0]; const [c, r] = P(700, 850);
          npcs.push(Object.assign({}, n, { c, r, talk: ['……茶单在这里。新到的是「檐下青」。', '疏桐姑娘一曲不重样。我听了三年，没听她弹过第二遍。', '雅座这边归我，露台那边归挽月。客官坐哪边都好，雨声是一样的。'] })); } } catch (e) {}
      M.npcs = npcs;
    }
  } catch (e) { console.warn('r253 2f', e); }
})();
