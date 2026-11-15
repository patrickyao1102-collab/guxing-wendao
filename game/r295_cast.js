// ================= R295 · Codex R288 人物接进游戏 =================
// 作者 11-15：「支线要跟很多路人说话，路人的建模不能同质化」；《名录》的人物要有自己的样子；听雨楼老板娘不该像农妇。
// ① 八向行走（R253 同一格式：5 行 × 9 列，224×240，脚底 112,232，右边三向镜像，150ms 一帧），画布里成年人约 220 像素高 → 缩到游戏里 116；
//    小孩、老人本来就画得矮，同一个比例缩下来自然矮。
// ② 对话立绘 6 张；③ 战斗形象 3 个（温既白、黑袍人、黑袍刺客）；④ 剧情单帧（苏绫被押、刘独眼缩在床角、司正）。
// ⑤ 12 个路人放到玄天城街上，各说各的话，有几句在传《名录》这桩案子的闲话（有的乱说，有的居然是真的）。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const SC = 116 / 220;
  const ROW = { down: [0, 0], downleft: [1, 0], left: [2, 0], upleft: [3, 0], up: [4, 0], downright: [1, 1], right: [2, 1], upright: [3, 1] };
  const DIRS = ['right', 'downright', 'down', 'downleft', 'left', 'upleft', 'up', 'upright'];
  const FACE = { down: 'down', up: 'up', left: 'left', right: 'right' };
  const IM = {};
  const ld = (pre, k) => { const id = pre + k; if (IM[id]) return IM[id]; const im = new Image(); im.onload = () => { im._ok = 1; }; im.src = 'r295/' + pre + k + '.webp'; return (IM[id] = im); };
  const shadow = (x, y) => { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, 20, 6.5, 0, 0, 7); ctx.fill(); };
  function draw8(a, im, now) {
    const st = a._r295 || (a._r295 = {}), dx = a.x - (st.px ?? a.x), dy = a.y - (st.py ?? a.y); st.px = a.x; st.py = a.y;
    const ms = performance.now();
    if (a.moving && Math.hypot(dx, dy) > .05) { st.dir = DIRS[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8]; st.mt = ms; }
    if (!st.dir) st.dir = FACE[a.npc && a.npc.face] || 'down';
    const mv = a.moving || ms - (st.mt || 0) < 120; if (mv && !st.mv) st.t0 = ms; st.mv = mv;
    const f = mv ? 1 + Math.floor((ms - st.t0) / 150) % 8 : 0, r = ROW[st.dir] || ROW.down;
    ctx.save(); shadow(a.x, a.y); ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y); if (r[1]) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, f * 224, r[0] * 240, 224, 240, -112 * SC, -232 * SC, 224 * SC, 240 * SC); ctx.restore();
  }
  function drawPose(a, im) {
    ctx.save(); shadow(a.x, a.y); ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y); if (a.npc && a.npc.flip) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, -112 * SC, -232 * SC, 224 * SC, 240 * SC); ctx.restore();
  }
  if (typeof window.NPC_WALK === 'function') { const NW = window.NPC_WALK;
    window.NPC_WALK = function (a, now) {
      try { const n = a.npc; if (n && !a.hidden) {
        const pose = typeof n.pose295 === 'function' ? n.pose295() : n.pose295;
        if (pose) { const im = ld('s_', pose); if (im._ok) { drawPose(a, im); return true; } }
        if (n.w9) { const im = ld('w_', n.w9); if (im._ok) { draw8(a, im, now); return true; } } } } catch (e) {}
      return NW.apply(this, arguments); }; }
  // 没有 cx 的人（key 是 none）不会走 NPC_WALK：给他们补一个 cx 占位，让渲染走到这里
  const CAST = (n, w9, pose) => { if (!n) return; n.w9 = w9; if (pose) n.pose295 = pose; if (!n.cx) n.cx = 'villager_m'; n.h = 116; };
  const find = (map, name) => ((TMAPS[map] && TMAPS[map].npcs) || []).filter(n => n.name === name && !n.hidden);

  // ---------------- 立绘、战斗形象 ----------------
  const loadImg = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  for (const [name, k] of [['苏绫', 'suling'], ['顾长庚', 'guchanggeng'], ['温既白', 'wenjibai'], ['刘独眼', 'liudu'], ['花婆', 'huapo'], ['听雨楼掌柜', 'tyboss']]) {
    loadImg('p_r295_' + k, 'r295/p_' + k + '.webp'); try { SPEAKERS[name] = Object.assign({}, SPEAKERS[name] || {}, { p: 'p_r295_' + k }); } catch (e) {} }
  loadImg('e_wenjibai', 'r295/e_wenjibai.webp'); loadImg('e_r295_heipao', 'r295/e_heipao.webp'); loadImg('e_r295_cike', 'r295/e_cike.webp');

  // ---------------- 《名录》的人 ----------------
  const st = () => (((S.flags || {}).sq || {}).ml_case) || { s: 0, n: 0 };
  setTimeout(() => {   // 等 R292 把人摆好再换装
    for (const m of Object.keys(TMAPS)) for (const n of TMAPS[m].npcs || []) {
      if (n.hidden) continue;
      if (n.name === '苏绫') CAST(n, 'suling', m === 'ml_jail' ? () => (st().s === 1 ? 'suling_bound' : null) : null);
      else if (n.name === '顾长庚') CAST(n, 'guchanggeng');
      else if (n.name === '温既白') CAST(n, 'wenjibai');
      else if (n.name === '老冯') CAST(n, 'laofeng');
      else if (n.name === '小六') CAST(n, 'xiaoliu');
      else if (n.name === '刘独眼') CAST(n, 'liudu', () => (st().s === 1 && st().n <= 13 ? 'liudu_corner' : null));
      else if (n.name === '司正') CAST(n, null, 'sizheng_stand');
      else if (n.name === '听雨楼掌柜') { CAST(n, 'tyboss'); n.ws = null; }
    }
  }, 0);

  // ---------------- 12 个路人：玄天城街上 ----------------
  const CITY = TMAPS.xt_city; if (!CITY || !CITY.baked) return;
  const B = CITY.baked, free = (x, y) => { const c = Math.floor(x / B.cs), r = Math.floor(y / B.cs); return c >= 0 && r >= 0 && c < B.cols && r < B.rows && B.blocked.charCodeAt(r * B.cols + c) === 48; };
  const near = (x, y) => { for (let d = 0; d < 400; d += 12) for (let k = 0; k < 16; k++) { const px = x + Math.cos(k * Math.PI / 8) * d, py = y + Math.sin(k * Math.PI / 8) * d; if (free(px, py) && free(px - 16, py) && free(px + 16, py)) return [px, py]; } return [x, y]; };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const ml = () => st().s === 1, mlDone = () => st().s === 3;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const PASS = [
    ['跑腿报事的小孩', 'paotui', [1330, 2250], () => ml() ? ['巡城司的陆捕头死啦！死在云来的澡盆里！我亲眼看见抬出来的……好吧，我是听卖花姐姐说的。', '捕快押走的那个姐姐，一路都没哭。'] : ['大哥哥，要不要我跑腿？一封信两个铜板，城南城北都送得到！', '城主府那边又换岗了，守门的叔叔凶得很。']],
    ['轿夫', 'jiaofu', [1660, 2340], () => ml() ? ['昨晚我抬着轿子打云来门口过，三更天了，二楼还亮着灯。……那会儿还没出事吧？', '巡城司的推官姓顾，铁面一张，谁的面子都不给。'] : ['客官坐轿么？上城北三十文，下城南二十文。', '这城里的路，我闭着眼都能走。']],
    ['富家公子', 'gongzi', [2780, 2250], () => ['听雨楼的檐下青，一壶三钱银子。值，听雨听的是心境。', '本公子的扇子是苍月城的名家画的，你看这山水……算了，你看不懂。']],
    ['落第老秀才', 'xiucai', [1060, 1560], () => ml() ? ['名录？巡城司的散修名录？……老夫年轻时也在那儿抄过几天书。温书办那会儿就在了，一手好字。', '一页名录，几十个名字。人哪，到头来就是纸上一行字。'] : ['今年的榜又没有老夫。三十年了，老夫的字，不比他们差。', '「近者悦，远者来」——孔夫子说的，可惜这城里的人只认灵石。']],
    ['胭脂铺老板娘', 'yanzhi', [3060, 1560], () => ml() ? ['听说云来死的是个捕头？啧，那客栈的浴桶，我上回还想去泡一泡呢。', '被抓的姑娘我见过，来我这儿问过一盒最便宜的口脂，没买。'] : ['姑娘家的胭脂，城东就数我家颜色正。', '这盒玫瑰膏，是照着听雨楼老板娘的唇色调的。']],
    ['镖师', 'biaoshi', [2240, 2760], () => ['南城门外这阵子不太平，林子里老有人进去就不出来。', '押镖的规矩：不问货，不问人，只认镖旗。']],
    ['江湖郎中', 'langzhong', [600, 2300], () => ['跌打损伤、头疼脑热，一帖见效！不灵不要钱！', '少侠气色不错，就是……印堂有点黑。来一帖安神散？']],
    ['卖炊饼的汉子', 'bingfan', [1500, 2560], () => ['炊饼——热乎的炊饼！两文一个！', '巡城司的捕快天天来我这儿买，这两天……少了一个。']],
    ['外乡散修女子', 'sanxiu_f', [2420, 1880], () => ml() ? ['进城的时候巡城司要登记：哪来的、有没有师门、有没有家小……问那么细做什么？', '我一个散修，没门没派。要是哪天不见了，大概也没人来找。'] : ['玄天城真大。我从北边来，走了一个月。', '据点那边的天剑宗弟子，看着就不好惹。']],
    ['茶楼跑堂', 'paotang', [2860, 2200], () => ['客官楼上请！二楼雅座、露台都空着！', '掌柜的说了，下雨天茶钱减半。今儿要是下雨就好了。']],
    ['卖糖葫芦的老汉', 'tanghulu', [1900, 2440], () => ['冰糖葫芦——又大又甜的冰糖葫芦！', '小孩子都爱我这串，大人也爱，就是不好意思说。']],
    ['绣坊小学徒', 'xiufang', [3200, 1820], () => ml() ? ['师父说最近别一个人走夜路，说城东南那边的牙婆专拐小姑娘去做工……', '我才不怕呢。我有剪子。'] : ['这匹料子要送去听雨楼，老板娘订的，可不能弄脏。', '师父说绣一朵牡丹要七天，我绣了十天还没绣好。']],
  ];
  for (const [name, k, xy, lines] of PASS) {
    const [x, y] = near(xy[0], xy[1]), [c, r] = P(x, y);
    try { SPEAKERS[name] = SPEAKERS[name] || { p: '', color: '#e6dccb' }; } catch (e) {}
    (CITY.npcs = CITY.npcs || []).push({ key: 'none', cx: 'villager_m', w9: k, c, r, name, h: 116, wander: false, face: 'down',
      talk: async () => { await say(name, pick(lines())); } });
  }
  window.R295 = { IM, PASS };
})();
