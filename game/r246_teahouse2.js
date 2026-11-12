// ================= R246 · 听雨楼补完（作者 11-13：伙计、掌柜都换成美女，这是个潇洒的地方；二楼上不去，要有传送法阵）=================
// ① 女掌柜 + 三位茶娘：Codex 交的行走图（7 列 × 3 行，单帧 160×240，第 0 列是站姿；行 = 下 / 上 / 左），站着的人画站姿那一帧。
// ② 二层：半边室内雅座（三个花罩雅座、古琴、红泥小炉）+ 半边弧形观雨露台。一层东边楼梯口的传送阵上楼。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_teahouse) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8], L = async a => { for (const [w, t] of a) await say(w, t); };
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  // ---- 人物 ----
  const WS = {}; for (const k of ['keeper', 'tea_yellow', 'tea_green', 'tea_lotus']) { const im = new Image(); im.onload = () => { im._ok = 1; }; im.src = 'r246/ws_' + k + '.webp'; WS[k] = im; }
  if (typeof window.NPC_WALK === 'function') { const NW = window.NPC_WALK;
    window.NPC_WALK = function (a, now) {
      try { const n = a.npc, im = n && n.ws && WS[n.ws];
        if (im && im._ok && !a.hidden) { const f = n.face, row = f === 'up' ? 1 : (f === 'left' || f === 'right') ? 2 : 0, bob = Math.sin(now * 1.8 + a.x * .01) * .8;
          ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 20, 6.5, 0, 0, 7); ctx.fill();
          ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y - bob); if (f === 'right') ctx.scale(-1, 1); ctx.scale(.5, .5);
          ctx.drawImage(im, 0, row * 240, 160, 240, -80, -232, 160, 240); ctx.restore(); return true; } } catch (e) {}
      return NW.apply(this, arguments); }; }
  load('p_r246_keeper', 'r246/p_keeper.webp');
  try { SPEAKERS['听雨楼掌柜'] = Object.assign({}, SPEAKERS['听雨楼掌柜'], { p: 'p_r246_keeper', color: '#cfe6ea' }); for (const n of ['茶娘·阿杏', '茶娘·青禾', '茶娘·素笺', '抚琴女子', '凭栏的白衣剑客', '对弈的茶客', '写诗的书生', '斟茶的茶娘']) SPEAKERS[n] = SPEAKERS[n] || { p: '', color: '#e6dccb' }; } catch (e) {}

  // ---- 二层 ----
  const D = window.R246_2F; if (!D) return;
  load('r246g_2f', 'r246/g_2f.webp'); for (const k of new Set(D.objs.map(o => o.img))) load(k, 'r246/o_' + k.slice(5) + '.webp');
  const spot = (xy, name, talk) => { const [c, r] = P(xy[0], xy[1]); return { key: 'none', c, r, name, hidden: true, h: 110, talk }; };
  const XX = '星旋', YE = '叶孤星', T = D.talk, UP = [1120, 487], DOWN = [272, 860];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const npcs = [
    spot(T.qin_player, '抚琴女子', async () => { await L([['', '琴声不疾不徐，像檐上的雨一滴一滴落进缸里。'], ['抚琴女子', pick(['（她没有抬头，指尖在弦上轻轻一按，余音散进雨里。）', '客官想听什么？……罢了，雨想听什么，我便弹什么。'])], [XX, '（这丫头手上有功夫。不是剑的功夫——是把心弦压住的功夫。）']]); }),
    spot(T.rain_swordsman, '凭栏的白衣剑客', async () => { await L([['凭栏的白衣剑客', pick(['从这儿望出去，十盏灵灯一盏不落。夜里灵枢的光幕升起来，雨打在上头，像打在一口倒扣的琉璃碗上。', '我在等一场雨停。停了，就该走了。……可这玄天城的雨，总也不停。'])]]); }),
    spot(T.chess_guest_sand, '对弈的茶客', async () => { await L([['对弈的茶客', pick(['别吵别吵，这一手我想了半炷香了。', '他让我三子，我还是输。可在这楼上输棋，比在别处赢棋痛快。'])], [XX, '（黑棋那条大龙早死了，他还没看出来。）']]); }),
    spot(T.poet, '写诗的书生', async () => { await L([['写诗的书生', pick(['「一楼风雨半城灯」……下一句，下一句是什么来着……', '掌柜的说，谁能在这楼上写出一句让她点头的诗，那一年的茶钱都免了。三年了，没人免过。'])]]); }),
    spot(T.tea_attendant, '斟茶的茶娘', async () => { await say('斟茶的茶娘', pick(['露台的茶凉得快，客官趁热。', '那把大伞是掌柜的亲手画的伞面。她说，伞底下的人不该淋雨，也不该淋愁。'])); }),
    spot(D.stove, '红泥小炉', async () => { await say('', '炉上的水刚响边，壶嘴吐着一线白气。'); }),
  ];
  TMAPS.xt_teahouse_2f = { title: '听雨楼 · 二层雅座与观雨露台', baked: Object.assign({ ground: 'r246g_2f' }, D), indoor: true, npcs, chests: [], doors: [], start: P(DOWN[0], DOWN[1]),
    exits: [{ x: Math.floor(D.exit.x / 8), y: Math.floor(D.exit.y / 8), w: Math.ceil(D.exit.w / 8), h: Math.ceil(D.exit.h / 8), to: 'xt_teahouse', at: P(UP[0], UP[1] + 40), face: 'down', label: '下楼 · 一层茶堂' }] };
  (TMAPS.xt_teahouse.doors = TMAPS.xt_teahouse.doors || []).push({ x: UP[0], y: UP[1] - 6, rw: 40, rh: 20, to: 'xt_teahouse_2f', at: P(DOWN[0], DOWN[1]), face: 'right', label: '上楼 · 雅座与露台' });
})();
