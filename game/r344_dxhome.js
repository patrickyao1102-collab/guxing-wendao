// ================= R344 · 阿焰家（丹霞堂掌柜在玄天城的家；师父的老宅在青阳，阿澈守着）：院子 + 厨房 + 正房 + 回忆版院子（Codex R317 正式拆件 v4）（只进测试版）=================
// 作者 11-16：「丹霞堂旁边那个小房子你还没有去建」；11-17：中秋「去院子里找他，去他家里找他」，小时候的回忆就在同一个院子里演。
// 地图：dx_home（1500×1000 院子：北正房 → 正房，西布帘 → 厨房，东门 → 东厢（dx_east），南院门 → 玄天城丹霞堂门口）
//       dx_home_old（十几年前的同一个院子：没有对联、灯笼，小号旧丹炉；回忆戏专用，不开门）
//       dx_kitchen（厨房，1000×750），dx_mainroom（师兄正房，1000×750）
// 碰撞：Codex 给的脚点掩码（已按家具膨胀过）按 8px 一格取样；院门有关 / 半开 / 开三态，切换时连碰撞一起换（DX_GATE('half')）。
// 院子在城里的外观：R348（丹霞堂右边那栋，院门半开能进）；院门出去落在那扇门口。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_danxia) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  let D = null;
  const load = (k, s) => { if (IMG[k]) return; const im = new Image(); im.onload = () => { try { IMG[k] = im; } catch (e) {} }; im.src = s; };
  const base = TMAPS.xt_inn_room3 || TMAPS.xt_inn_room1;
  const say1 = (t) => async () => { await say('', t); };
  const LOOK = {
    well: '一口老井，辘轳的木柄磨得发亮。井沿上搁着两只木桶，一大一小。', alchemy_furnace: '三足铜丹炉，炉身熏得发黑。炉下的炭火压得很匀——会看火的人，才压得出这样的火。',
    medicine_shelf: '一架药罐，罐口都用油纸封着，纸上写着药名。字很丑。', herb_basket: '一筐晒干的药草。有一半，是治烫伤的。',
    stone_table: '石桌上一套粗陶茶具，茶盘里摆着三只盏，有一只从来没倒过茶。', stone_stool_left: '石凳的坐面磨得溜光。', stone_stool_right: '石凳的坐面磨得溜光。',
    water_jar: '大水缸，水面上漂着两片桂花叶。', firewood_south: '劈好的柴，码得整整齐齐。', firewood_kitchen: '劈好的柴，码得整整齐齐。',
    drying_rack: '四匾晒着的药材：当归、白芷、甘草——还有一匾桂花。', basket_center: '一筐刚采回来的药草，还带着露水。',
    failed_cakes: '一盘焦黑歪扭的桂花糕。最上面那块，焦得最厉害。', recipe: '一张手写的方子：「糯米粉三两，粳米粉一两……糖桂花少许，蒸熟取出待凉。」「少许」两个字，被圈了又圈。',
    ointment: '一只打开的烫伤药盒，药膏少了一大块。', osmanthus_sugar: '糖桂花罐子，快见底了。', preparation: '案板、菜刀、一篮青菜。……看样子，这几天有人在学做饭。', drying_osmanthus: '竹席上晾着桂花，摊得很匀。',
    keepsake_jar: '枕边一只小瓦罐，罐底结着一层干掉的黑药膏。……像是很多年前的东西了。', tree_drawing: '墙上一幅画：桂花树下，两个小孩蹲在炉子边。画得很笨，落款是「阿焰，十二岁」。',
    tea_set: '茶桌上一壶两盏，都还没用过。', curio: '博古架上没什么值钱东西：一把小木剑、一只竹蜻蜓、一只缺了口的旧炉盖。' };
  const mk = (key, title, e, extra) => {
    load('r344g_' + key, 'r344/g_' + key + '.webp?v=1');
    const objs = e.objs.map((o, i) => { load('r344_' + o.f, 'r344/s/' + o.f + '.webp?v=1'); return { id: o.f, uid: 'r344' + key + i, img: 'r344_' + o.f, x: o.x, y: o.y, w: o.w, h: o.h, sy: o.sy, flip: false, noBlock: true, noPre: true }; });
    const M = TMAPS['dx_' + key] = Object.assign({}, base, { title, npcs: [], chests: [], doors: [], exits: [], onEnter: null, fog: false, petals: false, indoor: true }, extra || {});
    M.baked = { ground: 'r344g_' + key, cs: e.cs, cols: e.cols, rows: e.rows, w: e.w, h: e.h, blocked: e.blocked || e.blocked_open, objs };
    M.start = P(e.spawn[0], e.spawn[1]);
    for (const it of e.inter || []) if (LOOK[it.id]) M.npcs.push({ key: 'none', name: (it.description || '').slice(0, 8), hidden: true, h: 100, c: P(it.approach[0], it.approach[1] - 30)[0], r: P(it.approach[0], it.approach[1] - 30)[1], wander: false, face: 'down', talk: say1(LOOK[it.id]) });
    try { if (typeof WIDE_OK === 'object') WIDE_OK['dx_' + key] = 1; } catch (e2) {}
    return M; };
  const door = (r, to, at, label, face) => ({ x: r[0] + r[2] / 2, y: r[1] + r[3] / 2, rw: r[2] / 2, rh: r[3] / 2, to, at: P(at[0], at[1]), face: face || 'down', label });
  const build = d => { D = d;
    const H = mk('home', '阿焰家 · 院子', d.home), O = mk('home_old', '十几年前 · 师父的院子', d.home_old), K = mk('kitchen', '阿焰家 · 厨房', d.kitchen), R = mk('mainroom', '阿焰家 · 正房', d.mainroom);
    const dd = id => d.home.doors.find(x => x.id === id);
    H.doors.push(door(dd('main_room').trigger_rect, 'dx_mainroom', [500, 680], '正房', 'up'), door(dd('kitchen').trigger_rect, 'dx_kitchen', [500, 680], '厨房', 'up'));
    if (TMAPS.dx_east) { H.doors.push(Object.assign(door(dd('east_room').trigger_rect, 'dx_east', [500, 600], '东厢', 'up'), TMAPS.dx_east.start ? { at: TMAPS.dx_east.start } : {}));
      for (const e of TMAPS.dx_east.exits || []) Object.assign(e, { to: 'dx_home', at: P(1252, 790), face: 'down', label: '出门 · 院子' }); }
    const gx = d.home.gate.transition_rect; H.exits = [];
    H.doors.push(Object.assign(door([gx[0], gx[1] - 14, gx[2], 24], 'xt_city', [3060, 1440], '出院门 · 玄天城'), { gate: 1, cond: () => GATE !== 'closed' }));
    K.doors.push(door(d.kitchen.doors[0].trigger_rect, 'dx_home', [250, 790], '回院子'));
    R.doors.push(door(d.mainroom.doors[0].trigger_rect, 'dx_home', [745, 480], '回院子'));
    // 院门两扇
    for (const key of ['home', 'home_old']) { const M = TMAPS['dx_' + key], st = d.home.gate.states;
      for (const lf of st.open.leaves) { const k = 'gate_open_' + lf.side; load('r344_' + k, 'r344/s/' + k + '.webp?v=1');
        M.baked.objs.push({ id: 'gate_' + lf.side, uid: 'r344gate' + key + lf.side, img: 'r344_' + k, x: lf.rect[0], y: lf.rect[1], w: lf.rect[2], h: lf.rect[3], sy: 992, flip: false, noBlock: true, noPre: true, _gate: lf.side }); } }
    for (const st of ['closed', 'half', 'open']) for (const s of ['left', 'right']) load('r344_gate_' + st + '_' + s, 'r344/s/gate_' + st + '_' + s + '.webp?v=1');
  };
  let GATE = 'open';
  // 院门：'closed' / 'half' / 'open'（换门扇的图 + 换碰撞）
  window.DX_GATE = st => { if (!D) return; GATE = st; window.DX_GATE_ST = st;
    for (const key of ['home', 'home_old']) { const M = TMAPS['dx_' + key]; if (!M || !M.baked) continue;
      for (const o of M.baked.objs) if (o._gate) o.img = 'r344_gate_' + st + '_' + o._gate;
      M.baked.blocked = (key === 'home' ? D.home : D.home_old)['blocked_' + st]; }
    try { if (world.map && world.map.T && /^dx_home/.test(world.mapName)) { const B = TMAPS[world.mapName].baked, T = world.map.T;
      for (let r = 0; r < B.rows; r++) for (let c = 0; c < B.cols; c++) T.block[r][c] = B.blocked.charCodeAt(r * B.cols + c) === 49 ? 1 : 0;
      for (const o of T.objs || []) if (o._gate) o.img = 'r344_gate_' + st + '_' + o._gate; } } catch (e) {} };
  // 剧情站位（院子坐标）：桂花树下石桌一带吃饭；回忆戏的站位照 R339 timeline
  window.DX_HOME_SPOTS = { ye: [1012, 712], yan: [782, 700], che: [898, 712], stove: [462, 891], gate: [749, 903], peek: [[700, 975], [800, 975]], cam: [890, 640],
    mem: { map: 'dx_home_old', shifu: [400, 888], yan: [501, 888], che_in: [773, 994], che_path: [[770, 910], [763, 820], [668, 806], [565, 807]], che: [564, 888], stove: [462, 891] } };
  try { MAP_ZOOM.dx_home_old = 1.7; } catch (e) {}   // 回忆戏镜头拉近
  // 中秋夜：把正房的茶桌、两把椅子搬到院子当中（石桌在院子最底下，镜头拉不过去、会被对话框挡住）
  window.DX_DINNER = on => { const T = world.map && world.map.T; if (!T || !T.objs || world.mapName !== 'dx_home') return;
    T.objs = T.objs.filter(o => !o._dinner);
    for (const o of T.objs) if (o.id === '02A_basket_center') { if (on) { o._img0 = o._img0 || o.img; o.img = 'r344_none'; } else if (o._img0) o.img = o._img0; }
    if (!on) return;
    const add = (f, x, y, w, h, sy) => T.objs.push({ _dinner: 1, bk: true, id: f, uid: 'dinner_' + f, img: 'r344_' + f, x, y, w, h, sy, noBlock: true });
    add('04_tea_table', 812, 548, 177, 146, 690); add('04_tea_chair_left', 726, 588, 83, 110, 690); add('04_tea_chair_right', 990, 588, 81, 110, 692); };
  // 数据同步载入（地图得在进图之前就在 TMAPS 里）
  try { const x = new XMLHttpRequest(); x.open('GET', 'r344/data.json?v=1', false); x.send(); if (x.status === 200 || x.status === 0) build(JSON.parse(x.responseText)); } catch (e) { console.warn('R344', e); }
})();
