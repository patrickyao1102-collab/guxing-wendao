// ================= R253 · 全局修正（作者 11-13 凌晨：「我说的所有问题都是全局的问题，不要只改一个地方」）=================
// ① 人物和屋子的比例：把新做的内景逐张对着「人」量了一遍，家具明显偏大的整张缩小（人物在屏幕上的大小不变）。
// ② 传送阵放在楼梯口：凡是楼梯尽头 / 楼梯顶上的传送阵，都挪到踏上楼梯的那一头；对面回来的落脚点跟着挪。
// ③ 画在场景里的人（抚琴的、下棋的、莲台上的长老……）都要有名字、能搭话（带人座位组已全部撤掉，换回空桌椅）：
//    在人脚下放一个「只有名字和对话、不画身体」的 NPC（ghost），头顶就有名牌，点人或走近按键都能说话。
// ④ 听雨楼二层：写诗的书生原来坐到了矮墙上，挪回地板；二层多一位走动的茶娘。（露台原来加的两位座位组客人已撤掉）
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

  // 带人座位组全部撤掉（作者 11-13：「这 30 桌人物和我们的画风格格不入」——桌子和人画在一张图里，人的画法和游戏里走动的人对不上）。
  // R231 那一批（r231_sets.js）已经不加载，原来的空桌椅自己就回来了；这里把 R213 / R229 那一批（倚翠楼琴堂、长乐坊、云来大堂）换回同屋的空桌椅。
  // 以后坐着的客人按游戏里行走图的画风一个一个单独做，再摆到这些桌子边上（拼接法）。
  try {
    const one = (img, w, h, ax, ay, cx, sy, id) => ({ id, uid: 'r253e_' + id + '_' + Math.round(cx) + '_' + Math.round(sy), img, w, h, x: Math.round(cx - ax), y: Math.round(sy - ay), sy: Math.round(sy), flat: false });
    const EMPTY = {
      // 琴堂：矮茶几（自带左右两只绣墩）+ 前后各一只绣墩，和琴堂里原来那组空茶座一样
      qy_yicui: (cx, sy) => [one('r213_n1_r226_tea_low', 192, 160, 96, 144, cx, sy, 'tea_low'), one('r213_n1_r226_stool_extra', 47, 45, 23.5, 45, cx, sy - 48, 'stool_extra'), one('r213_n1_r226_stool_extra', 47, 45, 23.5, 45, cx, sy + 48, 'stool_extra')],
      // 赌坊：牌九桌（自带两只凳）+ 左右各一只方凳；「看热闹」那条长凳组直接拿掉
      qy_changle: (cx, sy, o) => /gamble_watch/.test(o.id) ? [] : [one('r213_c1_paijiu_table', 182, 114, 91, 108, cx, sy, 'paijiu_table'), one('r213_c1_plain_stool', 40, 40, 20, 40, cx - 96, sy, 'plain_stool'), one('r213_c1_plain_stool', 40, 40, 20, 40, cx + 96, sy, 'plain_stool')],
      // 云来大堂：同屋那种圆桌配三只凳（位置正好落在原来那几张桌子排成的格子上）
      xt_inn_hall: (cx, sy) => [one('r217_xt_inn_hall_dining_06', 212, 168, 106, 168, cx, sy, 'dining')],
    };
    for (const [m, M] of Object.entries(TMAPS)) { const bk = M && M.baked, f = EMPTY[m]; if (!bk || !bk.objs) continue;
      if (!f) { if (bk.objs.some(o => /^r2(13|30)_set_|^r230_/.test(o.img || ''))) bk.objs = bk.objs.filter(o => !/^r2(13|30)_set_|^r230_/.test(o.img || '')); continue; }
      const out = []; let hit = 0;
      for (const o of bk.objs) { if (!/^r213_set_/.test(o.img || '')) { out.push(o); continue; } hit++; out.push(...f(o.x + o.w / 2, o.sy != null ? o.sy : o.y + o.h, o)); }
      if (hit) bk.objs = out; }
    // 赌坊拿掉的那条长凳原来占着的格子放开
    { const bk = TMAPS.qy_changle && TMAPS.qy_changle.baked; if (bk) { const cs = bk.cs, B = bk.blocked.split(''); for (let y = 272; y < 320; y += cs) for (let x = 288; x < 448; x += cs) B[Math.floor(y / cs) * bk.cols + Math.floor(x / cs)] = '0'; bk.blocked = B.join(''); } }
  } catch (e) { console.warn('r253 sets', e); }
  // 悦来客栈（青阳镇）：左边那道上楼的楼梯（楼上并没有房间）、右上角后厨那个门框拿掉，原来占着的地方放开
  try { const bk = TMAPS.qy_inn && TMAPS.qy_inn.baked;
    if (bk) { bk.objs = bk.objs.filter(o => o.id !== 'interior_stairs' && o.id !== 'kitchen_door'); const cs = bk.cs, B = bk.blocked.split(''), open = (x0, y0, x1, y1) => { for (let y = y0; y < y1; y += cs) for (let x = x0; x < x1; x += cs) B[Math.floor(y / cs) * bk.cols + Math.floor(x / cs)] = '0'; };
      open(32, 256, 224, 416); open(928, 192, 1088, 224); bk.blocked = B.join(''); } } catch (e) { console.warn('r253 inn', e); }

  // ---------------- ④ 听雨楼二层 ----------------
  try {
    const M = TMAPS.xt_teahouse_2f, bk = M && M.baked;
    if (bk) {
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
      // 露台两张空桌原来坐上了 R230 座位组的两位客人——座位组的人画风不对，撤掉，露台还是两张空桌
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
      // 二层的茶娘：素笺从一层调上来，在雅座这半边走动添茶
      try { const one = TMAPS.xt_teahouse, i = (one.npcs || []).findIndex(n => n.name === '茶娘·素笺');
        if (i >= 0) { const n = one.npcs.splice(i, 1)[0]; const [c, r] = P(700, 850);
          npcs.push(Object.assign({}, n, { c, r, talk: ['……茶单在这里。新到的是「檐下青」。', '疏桐姑娘一曲不重样。我听了三年，没听她弹过第二遍。', '雅座这边归我，露台那边归挽月。客官坐哪边都好，雨声是一样的。'] })); } } catch (e) {}
      M.npcs = npcs;
    }
  } catch (e) { console.warn('r253 2f', e); }
})();
