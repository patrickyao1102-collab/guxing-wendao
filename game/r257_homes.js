// ================= R257 · 民居能进了（第一批：一般人家 · 西卧东堂）=================
// 作者 11-13：玄天城、青阳镇的房子都得能进；民居分穷人 / 一般 / 富人三种，地板、床、格局各不相同；
// 起居和睡觉不是靠一架屏风分——是「一明两暗」：堂屋待客吃饭，隔墙那边是卧房，门洞上挂半开的蓝印花布帘，人从帘下走过去。
// Codex R255 先出概念图定布置，再拆成「底图 + 遮挡层 + 单件」按 2 倍做（人物 112 像素为准）。六张格局陆续到，到一张开一批门：
// 已到：乙1、乙2（一般人家两种）、丙1（富人家）。穷人家（甲1、甲2）地面颜色太艳，退回 Codex 调，到了再开；丙2 到了再开两户。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || !window.R255_HOMES || !TMAPS.xt_city || !TMAPS.qy_town) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const reg = n => { try { SPEAKERS[n] = SPEAKERS[n] || { p: '', color: '#e6dccb' }; } catch (e) {} };
  const loaded = {};
  const load = (key, src) => { if (loaded[key]) return; loaded[key] = 1; const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  // 可点的东西：按这一户的身份各写一句
  const LOOK = {
    灶台: ['灶膛里的火压着，锅盖缝里冒着一线白气。', '灶台擦得干净，墙上挂着锅铲和漏勺。'],
    供案与中堂: ['条案上供着香炉和一对烛台，中堂是一幅山水，两边的对联写着：家和万事兴，人勤百业旺。'],
    架子床: ['架子床挂着素色的帐子，被褥叠得整整齐齐。……别人家的卧房，看一眼就好。'],
    针线桌: ['笸箩里是没做完的针线，一只鞋底纳了一半。'],
    土灶: ['灶膛里的火压着，锅盖缝里冒着一线白气。', '灶台擦得干净，墙上挂着锅铲和漏勺。'],
    长案与中堂: ['长案上摆着座屏、瓷瓶和一座自鸣钟，中堂是一幅山水。对联写的是：克己复礼修身，勤俭兴家立业。'],
    拔步床: ['拔步床像一间小屋子：床前一圈雕花围廊，两级踏步，绸帐挽在两边。……别人家的卧房，看一眼就好。'],
    大书案: ['书案上摊着一本账册，笔搁在砚台边上，墨还没干。'],
    琴桌: ['琴桌上横着一张七弦琴，弦上落了薄薄一层灰——主人大概许久没弹了。'],
  };
  function build(id, o) {
    const D = R255_HOMES[o.plan]; if (!D) return false;
    const K = 'r255_' + o.plan + '_';
    load(K + 'g', 'r255/' + o.plan + '/g.webp'); for (const x of D.objs) load(K + x.f, 'r255/' + o.plan + '/o_' + x.f + '.webp');
    const objs = D.objs.map((x, i) => ({ id: x.id, uid: id + '_' + i, img: K + x.f, x: x.x, y: x.y, w: x.w, h: x.h, sy: x.layer === 'depth' ? x.sy : 1, ax: x.x + x.w / 2, ay: x.sy, flat: x.layer !== 'depth', flip: false, noBlock: true, noPre: true }));
    const bk = { ground: K + 'g', cs: D.cs, cols: D.cols, rows: D.rows, w: D.w, h: D.h, blocked: D.blocked, objs };
    const spot = n => D.spots.find(s => s[0] === n) || D.spots[0];
    const npcs = [];
    for (const [cx, name, talk, at, face] of o.people) { reg(name); const s = spot(at), [c, r] = P(s[1], s[2]); npcs.push({ key: 'none', cx, c, r, name, h: 118, wander: false, face: face || 'down', talk, random: talk.length > 1 }); }
    for (const [, label, x, y] of D.inter) { const lines = (o.look && o.look[label]) || LOOK[label]; if (!lines) continue; const [c, r] = P(x, y - 6); npcs.push({ key: 'none', c, r, name: label, hidden: true, h: 100, talk: lines, random: lines.length > 1 }); }
    const [dx, dy] = o.door, cityName = o.city === 'xt_city' ? '玄天城' : '青阳镇', E = D.exit, cs = D.cs, start = P(D.spawn[0], D.spawn[1] - 26);
    // 出门落脚点：门前往南半步；那儿要是站不住（花坛、杂物），就在附近找一处能站的
    let out = [dx, dy + 54]; try { const cb = TMAPS[o.city].baked, ccs = cb.cs, free = (x, y) => [[-16, -4], [16, -4], [-16, 6], [16, 6]].every(([ox, oy]) => { const c = Math.floor((x + ox) / ccs), r = Math.floor((y + oy) / ccs); return c >= 0 && r >= 0 && c < cb.cols && r < cb.rows && cb.blocked[r * cb.cols + c] === '0'; });
      search: for (const yy of [54, 44, 66, 34, 80, 96]) for (const xx of [0, -18, 18, -36, 36, -56, 56]) if (free(dx + xx, dy + yy) && free(dx + xx, dy + yy + 10)) { out = [dx + xx, dy + yy]; break search; } } catch (e) {}
    TMAPS[id] = { title: cityName + ' · ' + o.title, baked: bk, indoor: true, npcs, chests: [], doors: [], start,
      exits: [{ x: Math.floor(E[0] / cs), y: Math.floor(E[1] / cs) - 1, w: Math.ceil(E[2] / cs), h: Math.ceil(E[3] / cs) + 1, to: o.city, at: P(out[0], out[1]), face: 'down', label: '出门 · ' + cityName }] };
    (TMAPS[o.city].doors = TMAPS[o.city].doors || []).push({ x: dx, y: dy + 8, rw: 36, rh: 18, to: id, at: start, face: 'up', label: o.label });
    return true;
  }
  // 作者 11-13：天剑宗据点、城主府院墙里面（和墙角那栋）的房子不是民宅，不能进——冯家、何家、郑家挪到院子外头街边的空房子。
  // 门的位置 = 房子底边那扇门的正下方：house_01 门在正中偏左（0.47），house_02 门在右侧（0.72），house_03 双开门在正中
  const d1 = (x, sy) => [x + 312 * .47, sy], d2 = (x, sy) => [x + 312 * .72, sy], d3 = (x, sy) => [x + 156, sy];
  const LIST = [
    ['xt_home_zhou', 'xt_city', d1(4005, 384), '周家', '周宅', [['scribe', '周秀才', ['十年寒窗，考到如今还是个秀才。也好，教教巷子里的孩子，够吃饭。', '玄天城的纸贵。城主府一出告示，满城的纸就涨一文。', '堂屋这副对联是我自己写的。字一般，意思是好的。'], 'guest'], ['villager_f', '周家娘子', ['他读书，我做针线，日子过得去。', '里间是卧房，乱得很，客人就别进去看了。……要看也行，别笑话。'], 'sewing_side']]],
    ['xt_home_shen', 'xt_city', d3(3173, 1024), '沈家', '沈宅', [['herbalist', '沈老郎中', ['丹霞堂的丹药是好，可寻常人家哪吃得起？头疼脑热的，还是来找我。', '少侠气色不错。就是眉间有点郁结——心里有事，别憋着。', '灶上熬的是给东街王家小儿的药，三碗水煎成一碗，急不得。'], 'cooking', 'up']]],
    ['xt_home_xu', 'xt_city', d3(4133, 1728), '许家', '许宅', [['scribe', '许账房', ['我给拍卖场记账。经手的灵石堆起来比这屋子还高——没有一块是我的。', '账房的规矩：看见什么，记什么；记了什么，忘什么。', '回了家我连算盘都不想碰。喝茶，喝茶。'], 'guest']]],
    ['xt_home_luo', 'xt_city', d2(2597, 1792), '罗家', '罗宅', [['villager_m', '罗石匠', ['城中间那座灵枢台的石阶，是我爷爷那辈人凿的。', '好石头会响。你敲敲看——当，当。听见没有？', '这屋的青砖地是我自己墁的，三十年了，没翘过一块。'], 'altar_front', 'up'], ['woman_well', '罗家嫂子', ['他一说起石头就没完。少侠坐，喝口水。', '饭快好了，不嫌弃就留下吃一口。'], 'cooking', 'up']]],
    ['xt_home_liang', 'xt_city', d1(4037, 1920), '梁家', '梁宅', [['woman_well', '梁家嫂子', ['河东这一片住的多是手艺人家。', '我家那口子是修桥的。桥修好了，他倒天天不着家。', '帘子那边是卧房。孩子刚睡下，少侠轻些说话。'], 'doorway', 'right']]],
    ['qy_home_li', 'qy_town', d1(2533, 2196), '李家', '李宅', [['scribe', '李塾师', ['镇上的蒙童都在我这儿识字。束脩？一年两斗米。', '林府的小姐小时候也来听过几天课，坐不住，三天就跑了。', '读书人家，没什么值钱东西。就这幅中堂，是先父留下的。'], 'guest']]],
  ];
  // 乙2（东卧西堂）
  const LIST2 = [
    ['xt_home_liu', 'xt_city', d1(3173, 1344), '柳家', '柳宅', [['maid', '柳絮儿', ['我在听雨楼后厨帮工，今日轮休。', '掌柜的待人好，就是规矩大：茶娘的手，一天要洗十二遍。', '难得歇一天，把攒了半个月的衣裳都补了。'], 'sewing_side']]],
    ['xt_home_feng', 'xt_city', d2(4069, 1280), '冯家', '冯宅', [['villager_m', '冯木匠', ['城主府那几扇花窗是我师父打的，我打的是……窗户底下那条板凳。', '你要打家具？排到明年开春了。', '这屋里的桌椅柜子都是我自己打的。榆木的，结实，传得了三代。'], 'guest'], ['little_girl', '冯小满', ['爹说我长大了也当木匠！', '（她举着一只木头小鸟给你看。）'], 'altar_front']]],
    ['xt_home_qian', 'xt_city', d1(197, 1344), '钱家', '钱宅', [['traveling_merchant', '货郎·钱二', ['我挑着担子走街串巷，这城里哪条巷子有几户人家，我比城卫都清楚。', '针头线脑、胭脂水粉，少侠要不要给家里人捎点？', '今日落雨，不出担了。在家歇一天脚。'], 'guest']]],
    ['xt_home_he', 'xt_city', d1(120, 1696), '何家', '何宅', [['woman_well', '何家嫂子', ['当家的在城门口当差，三天才回一趟。', '井水这两天有点浑，烧开了再喝。', '灶上炖着汤，等他回来喝。……也不知今晚回不回。'], 'cooking', 'up']]],
    ['qy_home_wang', 'qy_town', d2(197, 2196), '王家', '王宅', [['villager_f', '王家媳妇', ['当家的原先在醉仙楼掌勺，红烧肉镇上数第一。醉仙楼搬去玄天城开大店，他也跟着去了，一个月才回来一趟。', '南门外头最近不太平，天黑了我就闩门。'], 'cooking', 'up'], ['little_girl', '王丫丫', ['我爹做的糖饼可好吃了！', '（她躲到门帘后头，又探出半个脑袋。）'], 'doorway']]],
  ];
  // 丙1（富人家：正厅 + 西卧房 + 东书房）
  const LIST3 = [
    ['xt_home_zheng', 'xt_city', d3(3365, 576), '郑家', '郑宅', [['merchant', '郑掌柜', ['我在北边街上开绸缎庄。这阵子拍卖会，外地客人多，生意比往年好三成。', '做买卖的，家里也得摆张书案——不是看书，是算账。', '正厅这张八仙桌是花梨的。谈生意，桌子得压得住场面。'], 'hall_guest'], ['maid', '郑家丫鬟', ['老爷在厅里见客，夫人出门上香去了。', '西边落地罩后头是卧房，东边隔扇后头是书房。少侠要喝茶，我去沏。'], 'west_door', 'right']]],
    ['xt_home_song', 'xt_city', d3(1381, 1792), '宋家', '宋宅', [['merchant', '宋老板', ['云来客栈的酒是我家酒坊供的。「三白酿」，听过没有？', '酿酒靠水。玄天城的井，就数我家后院那口最甜。', '书房里那张琴是摆样子的。我只会听，不会弹。'], 'desk_behind'], ['villager_f', '宋夫人', ['他一说起酒就没完。少侠坐，喝茶。', '厅里这块地毯是陪嫁的，织的是我娘家那边的花样。'], 'hall_guest']]],
  ];
  let n = 0; for (const [L, plan] of [[LIST, 'yi1'], [LIST2, 'yi2'], [LIST3, 'bing1']]) for (const [id, city, door, label, title, people] of L) if (build(id, { plan, city, door, label, title, people })) n++;
  window.R257 = { n, build };
})();
