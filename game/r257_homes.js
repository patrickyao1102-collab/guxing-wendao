// ================= R257 · 民居能进了（第一批：一般人家 · 西卧东堂）=================
// 作者 11-13：玄天城、青阳镇的房子都得能进；民居分穷人 / 一般 / 富人三种，地板、床、格局各不相同；
// 起居和睡觉不是靠一架屏风分——是「一明两暗」：堂屋待客吃饭，隔墙那边是卧房，门洞上挂半开的蓝印花布帘，人从帘下走过去。
// Codex R255 先出概念图定布置，再拆成「底图 + 遮挡层 + 单件」按 2 倍做（人物 112 像素为准）。六张格局陆续到，到一张开一批门：
// 这一版是「乙1」，先开六户；其余人家等乙2、甲1、甲2、丙1、丙2 到了再开，各户不重样。只进测试版。
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
    TMAPS[id] = { title: cityName + ' · ' + o.title, baked: bk, indoor: true, npcs, chests: [], doors: [], start,
      exits: [{ x: Math.floor(E[0] / cs), y: Math.floor(E[1] / cs) - 1, w: Math.ceil(E[2] / cs), h: Math.ceil(E[3] / cs) + 1, to: o.city, at: P(dx, dy + 54), face: 'down', label: '出门 · ' + cityName }] };
    (TMAPS[o.city].doors = TMAPS[o.city].doors || []).push({ x: dx, y: dy + 8, rw: 36, rh: 18, to: id, at: start, face: 'up', label: o.label });
    return true;
  }
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
  let n = 0; for (const [id, city, door, label, title, people] of LIST) if (build(id, { plan: 'yi1', city, door, label, title, people })) n++;
  window.R257 = { n, build };
})();
