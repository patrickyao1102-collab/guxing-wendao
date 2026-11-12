// ================= R232 · 凶杀案支线「迟了一刻的灯」（作者 11-12：来一个特别烧脑且刺激的凶杀案，和别的任务有关联，和青阳镇也有关联）=================
// 两地跑的案子：玄天城云来客栈天字一号房，药材行商贺九章背后插着刀死在反锁的房里。
// 三层翻转：① 人人都拿「灯亮的时候」当时辰，可客栈门口那盏灯被人掺了水，迟了一刻才亮——最铁的不在场证明最可疑；
//           ② 密室是假的：门是死者自己闩的，他在后巷中了刀逃回房里才倒下；
//           ③ 刀不是死因：七天前在青阳镇倚翠楼，有人在他的送行茶里下了「七日青」。一个捅刀的，一个下毒的。
// 和别的支线的关系（作者 11-12 定的规矩：只有一条是硬的，别的只是省步骤）：
//   硬：【青阳镇】黑风寨的账本——没查完，认不出百草轩那页旧账的来路，说不清动机，当众指认会失败（不卡死：查完账本回来找柳三娘重新指认）。
//   省步骤：天字三号房（城卫直接放行）、九灯拱一枢（司灯老人直接说）、三十个名字（说书先生直接说）、万宝楼的赝品（掌柜直接认刀）、
//           长乐坊（叶孤星自己看出左手）、十年剑穗（倚翠楼的人直接开口）。
// 场景与人物：Codex R233（天字一号房命案现场；雷大勇、阿贵、阿芜的行走图和立绘）。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || !window.SQ_DEFS || !TMAPS.xt_city || !TMAPS.xt_inn_hall || !TMAPS.xt_inn_room3 || !TMAPS.xt_inn_corr) return;
  const F = () => (S.flags = S.flags || {});
  const st = id => ((F().sq = F().sq || {})[id] = F().sq[id] || { s: 0, n: 0 });
  const fin = id => st(id).s === 3;
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const YE = '叶孤星', XX = '星旋', BOSS = '柳三娘', LEI = '雷大勇', GUI = '阿贵', SHUN = '云来客栈伙计', GUARD = '查案的城卫', DENG = '司灯老人', SHU = '说书先生', TANG = '糖画摊主',
    WB = '万宝楼掌柜', HUO = '万宝楼伙计', BAI = '百草轩掌柜', WU = '倚翠楼侍女', CHA = '听琴的茶客', ZUI = '醉书生';
  const ID = 'xt_lamp', q = () => st(ID), on = () => q().s === 1;
  const mood = k => { try { window.R227 && R227.mood(k); } catch (e) {} };
  const note = t => { const f = F(); f.hx_notes = f.hx_notes || []; if (!f.hx_notes.includes(t)) { f.hx_notes.push(t); try { playSnd('ui_confirm'); } catch (e) {} toast('记入证词本：' + t, 2600); } };
  const GOALS = ['上二楼，进天字一号房看现场（屋里五处都看一遍）', '下楼，在大堂问话：镖头雷大勇、死者的随从阿贵、掌柜柳三娘',
    '人人都说「灯亮的时候」——去查那盏灯：城中央的司灯老人、客栈门口的说书先生', '查那把短刀的来路：去万宝楼问问',
    '回天字一号房，再看一眼死者；然后下楼问阿贵', '去青阳镇：百草轩（死者存的匣子）、倚翠楼（七天前那盏送行茶）', '回玄天城云来客栈，跟柳三娘说：把人叫齐', '案子结了'];
  const Q = { id: ID, name: '迟了一刻的灯', giver: ['xt_inn_hall', BOSS], where: '玄天城 · 云来客栈大堂 · 掌柜柳三娘', cond: () => !!F().ch3_report && st('xt_room3').s !== 1, type: 'kill', kill: { maps: ['__r232__'], mobs: ['__r232__'] }, n: 7, reward: { exp: 1100, gold: 1200 } };
  Object.defineProperty(Q, 'goal', { enumerable: true, get() { const f = F(), n = q().n;
    if (f.hx_fail && n >= 6) return '这案子缺一环：死者的底细。把青阳镇【黑风寨的账本】查完，去百草轩再看一眼那页旧账，再回来找柳三娘';
    if (n === 0 && !f.hx_pass) return '城卫不放人上楼——去街上找一位玄天城城卫，讨一句准话';
    if (n === 6 && !f.hx_left) return '还差一样：那一刀是左手捅的。去客栈门口问问伙计阿顺，店里谁是左撇子';
    return GOALS[Math.min(GOALS.length - 1, n)]; } });
  Object.defineProperty(Q, 'desc', { enumerable: true, get() { const n = (F().hx_notes || []); return '点灵灯那一夜，云来客栈天字一号房里死了人。门从里面闩着，背后插着一把短刀。' + (n.length ? '　【证词本】' + n.map((t, i) => (i + 1) + '. ' + t).join('　') : ''); } });
  SQ_DEFS.push(Q);
  Object.assign(ITEM_DB, { c_chideng: { name: '迟灯灯芯', slot: 'acc', maxmp: 45, def: 4, spd: 3, price: 0, desc: '司灯老人从客栈门口那盏灵灯里换下来的旧灯芯，浸过水，烧起来总慢一拍。「灯会迟，人心不会。后生，拿着。」' } });

  const hook = (mid, name, fn) => { const M = TMAPS[mid], n = M && (M.npcs || []).find(n => n.name === name && !n.hidden); if (!n) { console.warn('R232：找不到', mid, name); return null; } const orig = n.talk;
    n.talk = async function (a) { let done = false; try { done = await fn(n); } catch (e) { console.warn('R232', name, e); } if (done) return;
      if (typeof orig === 'function') return orig.call(this, a); const A = Array.isArray(orig) ? orig : [orig || '……']; for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(n.name, l); }; return n; };
  const add = (mid, n) => { (TMAPS[mid].npcs = TMAPS[mid].npcs || []).push(n); return n; };
  const man = (mid, cx, x, y, name, talk, extra) => { const [c, r] = P(x, y); return add(mid, Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk }, extra || {})); };
  const spot = (mid, x, y, name, talk, extra) => { const [c, r] = P(x, y); return add(mid, Object.assign({ key: 'none', c, r, name, hidden: true, h: 110, talk }, extra || {})); };
  const shown = () => q().s === 1 || q().s === 3;

  // ---------------- 场景：天字一号房（Codex R233：命案现场；没读到新图就借三号房的）----------------
  const R3 = TMAPS.xt_inn_room3, CORR = TMAPS.xt_inn_corr, HALL = TMAPS.xt_inn_hall, D1 = (window.R233_ROOM || {}).xt_inn_room1;
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  let CLUE = [], BLOOD = null;
  if (D1) { load('r233g_room1', 'r233/g_xt_inn_room1.webp');
    for (const o of D1.objs) load(o.img, 'r233/' + (o.img.startsWith('r233c_') ? 'c_' + o.img.slice(6) : 'o_' + o.img.slice(5)) + '.webp');
    CLUE = D1.objs.filter(o => /^clue_/.test(o.id)); D1.base = D1.objs.filter(o => !/^clue_/.test(o.id));
    // 作者 11-13：天字号房间感觉好空——用现成的家具把一号房添满：衣柜、书桌、床头柜、屏风、落地灯、兰花几、香炉、盆松
    { const ex = (id, img, x, y, w, h) => ({ id, img, uid: 'room1-x-' + id + x, x, y, w, h, sy: y + h, flat: false }), cs = D1.cs, B = D1.blocked.split('');
      const X = [ex('wardrobe', 'r217_xt_inn_room3_wardrobe', 584, 26, 189, 285), ex('bedside', 'r217_xt_inn_room3_bedside', 500, 196, 81, 114), ex('writing_desk', 'r217_xt_inn_room3_writing_desk_set_2', 860, 150, 200, 176),
        ex('screen', 'r213_n2_folding_screen', 70, 716, 264, 194), ex('lamp', 'r213_floor_lamp', 792, 232, 32, 88), ex('lamp', 'r213_floor_lamp', 1218, 800, 32, 88), ex('orchid', 'r213_n2_orchid_stand', 1086, 224, 48, 96),
        ex('incense', 'r213_n2_incense_burner', 560, 560, 60, 79), ex('pine', 'r213_dwarf_pine', 1180, 868, 64, 80),
        ex('chair', 'r213_guest_hat_chair', 402, 610, 76, 108), ex('chair', 'r213_guest_hat_chair_mirror', 642, 610, 76, 108), ex('teatable', 'r213_guest_low_tea_table', 496, 650, 128, 72), ex('orchid', 'r213_n2_orchid_stand', 20, 330, 48, 96),
        Object.assign(ex('rug', 'cx2_bedroom_jade_rug_r6_8b986e', 330, 566, 620, 182), { flat: true, sy: 1 }), ex('curio', 'cx2_curio_shelf_0e07f3', 826, 742, 166, 178), ex('bamboo', 'cx2_bedroom_potted_bamboo_r6_6b9bfa', 1166, 590, 99, 149), ex('lampB', 'cx2_bedroom_standing_lamp_r6_31fffe', 352, 760, 37, 168)];
      for (const o of X) { D1.base.push(o); if (o.flat) continue; for (let y = Math.floor((o.sy - Math.min(46, o.h * .35)) / cs); y <= Math.floor((o.sy - 1) / cs); y++) for (let x = Math.floor((o.x + 6) / cs); x <= Math.floor((o.x + o.w - 7) / cs); x++) if (x >= 0 && y >= 0 && x < D1.cols && y < D1.rows) B[y * D1.cols + x] = '1'; }
      D1.blocked = B.join(''); D1.objs = D1.base.concat(CLUE); }
    const e0 = D1.exits[0], r = e0.region, cs = D1.cs;
    TMAPS.xt_inn_room1 = { title: '云来客栈 · 天字一号房', baked: Object.assign({ ground: 'r233g_room1' }, D1), indoor: true, npcs: [], chests: [], doors: [], start: P(D1.spawn[0], D1.spawn[1] - 40),
      exits: [{ x: Math.floor(r.x / cs), y: Math.floor(r.y / cs), w: Math.ceil(r.w / cs), h: Math.ceil(r.h / cs), to: 'xt_inn_corr', at: P(283, 470), face: 'down', label: '出房门 · 二楼走廊' }] };
    load('r233_corr_blood', 'r233/corr_blood.webp'); BLOOD = { id: 'hx_blood', img: 'r233_corr_blood', uid: 'hx-blood', x: 300, y: 500, w: 400, h: 60, sy: 560, flat: true };
  } else TMAPS.xt_inn_room1 = Object.assign({}, R3, { title: '云来客栈 · 天字一号房', npcs: [], chests: [], doors: [], onEnter: null,
    exits: [Object.assign({}, (R3.exits || [])[0], { to: 'xt_inn_corr', at: P(283, 470), face: 'down', label: '出房门 · 二楼走廊' })] });
  try { if (typeof MAP_ZOOM !== 'undefined' && MAP_ZOOM.xt_inn_room3) MAP_ZOOM.xt_inn_room1 = MAP_ZOOM.xt_inn_room3; } catch (e) {}
  // 现场的痕迹只在案子办着的时候摆出来：尸首、带血的门闩、走廊的血点；结案后收走（茶具和包袱留着）
  if (D1 && typeof tileSetMap === 'function') tileSetMap = (orig => function (m) { try {
      if (m === 'xt_inn_room1') D1.objs = TMAPS.xt_inn_room1.baked.objs = D1.base.concat(CLUE.filter(o => on() || !/body_he|latch_blood/.test(o.id)));
      if (m === 'xt_inn_corr' && CORR.baked && CORR.baked.objs) { CORR.baked.objs = CORR.baked.objs.filter(o => o !== BLOOD); if (on() && IMG.r233_corr_blood) CORR.baked.objs.push(BLOOD); }
    } catch (e) {} return orig.apply(this, arguments); })(tileSetMap);
  // 新人物：雷大勇、阿贵、阿芜（行走图的正面站姿）+ 立绘
  { const im = new Image(); let A = null; im.onload = () => { A = im; }; im.src = 'r233/npc.webp'; const IDX = { lei: 0, agui: 1, awu: 2 };
    if (typeof drawActorT === 'function') drawActorT = (orig => function (a, now) { const k = a.npc && a.npc.hx, i = k != null ? IDX[k] : undefined;
      if (i === undefined || !A || a.hidden) return orig(a, now);
      const sc = .5, bob = Math.sin(now * 2 + a.x) * 1; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 22, 7, 0, 0, 7); ctx.fill();
      ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y - bob); ctx.drawImage(A, i * 160, 0, 160, 240, -80 * sc, -232 * sc, 160 * sc, 240 * sc); ctx.restore(); })(drawActorT);
    for (const [k, f] of [['p_r233_lei', 'p_lei'], ['p_r233_lei_nu', 'p_lei_nu'], ['p_r233_agui', 'p_agui'], ['p_r233_awu', 'p_awu'], ['p_r233_he', 'p_he']]) load(k, 'r233/' + f + '.webp');
    try { SPEAKERS[LEI] = { p: 'p_r233_lei', color: '#c8a890' }; SPEAKERS[GUI] = { p: 'p_r233_agui', color: '#c8c0a0' }; SPEAKERS[WU] = Object.assign({}, SPEAKERS[WU], { p: 'p_r233_awu', color: '#d8e0d8' }); } catch (e) {}
    const w = (TMAPS.qy_yicui && TMAPS.qy_yicui.npcs || []).find(n => n.name === WU && !n.hidden); if (w) w.hx = 'awu'; }
  // 楼梯：原来只有「天字三号房」在办或办完才上得去；这桩案子拿到准话也放行
  for (const e of HALL.exits || []) if (e.to === 'xt_inn_corr') { const c0 = e.cond; e.cond = () => (shown() && (!!F().hx_pass || q().s === 3)) || (typeof c0 === 'function' ? c0() : true); }
  for (const n of HALL.npcs || []) if (n.name === '守楼梯的城卫') { const c0 = n.cond; n.cond = () => !(shown() && F().hx_pass) && (typeof c0 === 'function' ? c0() : true); }
  { const d = (CORR.npcs || []).find(n => n.name === '天字一号的房门'); if (d) { const orig = d.talk; d.talk = async function (a) {
      if (shown()) { const [c, r] = TMAPS.xt_inn_room1.start || [9.5, 11.45]; try { await goMap('xt_inn_room1', c, r, 'up'); } catch (e) { tileSetMap('xt_inn_room1', c, r, 'up'); } if (on()) setTimeout(() => mood('case_xiongsha'), 600); return; }
      return orig.call(this, a); }; } }

  // ---------------- 第一幕：接案（大堂 · 柳三娘）----------------
  hook('xt_inn_hall', BOSS, async () => { const s = q(), f = F();
    if (s.s === 3) { await say(BOSS, f.hx_end === 'run' ? '少侠……那姓雷的，听说有人在幽影林那头见过。天字一号我封了，不敢再住人。' : '少侠，天字一号我请人做了三天法事。……那盏灯，司灯老人亲手换了新芯，如今亮得比谁家都早。'); return true; }
    if (s.s === 1) {
      if (s.n >= 6) { if (!f.hx_left) { await L([[BOSS, '少侠，人我随时能叫齐。可您方才说，那一刀是左手捅的——店里谁使左手，我还真没留意过。'], [BOSS, '阿顺天天端茶递水，谁用哪只手接碗，他最清楚。您问问他？']]); return true; } await finale(); return true; }
      if (s.n === 0 && !f.hx_pass) { await L([[BOSS, '少侠，楼梯口的城卫不放人。他说上回天字三号的案子，就是闲人上去踩乱了现场。'], [BOSS, '您去街上寻一位城卫，讨句准话。我这儿……我这儿实在走不开。']]); return true; }
      if (s.n === 1 && !f.hx_a_b) { await L([[BOSS, '贺老板三天前住进来的，说是来玄天城收一笔账。带着个随从，叫阿贵。'], [BOSS, '点灯那晚，戌时前后，大堂里坐得满满的——都等着看门口那盏灯亮。灯亮的时候，阿贵在街上，雷镖头在那边桌上划拳，我在柜上。'],
          [BOSS, '亥时，阿顺上楼送热水，敲不开门，从门缝里看见人趴在地上……撞开一看，身子都凉了。'], [XX, '（「灯亮的时候」。小子，记着这四个字。她是第一个这么说的。）']]);
        note('柳三娘：灯亮的时候，雷大勇在大堂划拳，阿贵在街上；亥时阿顺撞开门，人已经凉了'); await asked('b'); return true; }
      await say(BOSS, s.n < 2 ? '少侠慢慢问。小店……小店今年是冲撞了哪路神仙。' : '少侠查得怎么样了？城卫说再没个说法，就要封店。'); return true; }
    if (!Q.cond()) return false;
    await L([[BOSS, '（脸色发白，声音压得很低）少侠……又出事了。这回，是人命。'], [BOSS, '天字一号的贺老板，死在房里了。背上插着一把刀。'], [BOSS, '门是从里头闩着的。窗也关着。跟上回天字三号一模一样——可上回是丢东西，这回，是真死了人。'],
      [BOSS, '城卫说，三天之内没个说法，店就得封。少侠，我柳三娘在这条街上十五年，没求过人……']]);
    const k = await choose('支线 · 迟了一刻的灯', ['「带我去看。」（报酬：修为 +1100、灵石 1200，另有相赠）', '下次再说']); if (k !== 0) return true;
    s.s = 1; s.n = 0; f.hx_notes = []; f.hx_seen = {}; f.hx_pass = fin('xt_room3') ? 1 : 0; try { playSnd('ui_confirm'); } catch (e) {}
    if (f.hx_pass) await L([['守楼梯的城卫', '（看见叶孤星，让开了半步）是你。上回天字三号，你看窗栓比我看得细。上去吧。'], [XX, '（门闩着，人死了。小子，这回屋里可没有「昏倒」的人能起来回话了。上楼。）']]);
    else await L([['守楼梯的城卫', '站住。命案现场，闲人免上。'], [BOSS, '官爷，这位是天剑宗的——'], ['守楼梯的城卫', '天剑宗也不行。要上去，找我们街上当值的弟兄讨句准话。'], [XX, '（啧。小子，去街上找个城卫。）']]);
    toast(f.hx_pass ? '接取支线：迟了一刻的灯 —— 上二楼，进天字一号房' : '接取支线：迟了一刻的灯 —— 先去街上找一位城卫', 2800); return true; });
  // 没办过「天字三号房」：多一步，去街上找城卫讨准话
  for (const n of (TMAPS.xt_city.npcs || []).filter(n => n.name === '玄天城城卫')) { const orig = n.talk; n.talk = async function (a) { const f = F();
    if (on() && q().n === 0 && !f.hx_pass) { await L([[YE, '云来客栈的命案，掌柜托我看看现场。'], ['玄天城城卫', '天剑宗的？……（打量了一眼腰间的剑）行。你们宗门在城里有据点，出了岔子找得着人。'], ['玄天城城卫', '拿着这块腰牌，跟楼梯口的弟兄说是我许的。看归看，尸首不许挪。']]);
      f.hx_pass = 1; toast('迟了一刻的灯 —— 回云来客栈，上二楼', 2400); return; }
    if (typeof orig === 'function') return orig.call(this, a); const A = Array.isArray(orig) ? orig : [orig || '……']; for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(n.name, l); }; }

  // ---------------- 第二幕：现场五处 ----------------
  const seen = k => { const f = F(); f.hx_seen = f.hx_seen || {}; if (f.hx_seen[k]) return false; f.hx_seen[k] = 1; return true; };
  const count = async () => { const f = F(), s = q(), n = ['shi', 'men', 'zhuo', 'chuang', 'bao'].filter(k => (f.hx_seen || {})[k]).length; if (s.n !== 0) return; if (n < 5) { toast('天字一号房　现场 ' + n + ' / 5', 1800); return; }
    await L([[GUARD, '看完了？门闩着，窗闩着，人背后中刀。凶手是怎么出去的——穿墙？'], [YE, '凶手没有出去。因为凶手根本没进来过。'], [GUARD, '……什么？'],
      [YE, '门闩上的血指印，是从里面按上去的。闩门的人，是他自己。'], [YE, '他在别处中的刀。带着刀逃回房里，闩上门，才倒下。'],
      [XX, '（所以要问的不是「凶手怎么出的房」，是「他在哪儿、什么时辰中的刀」。小子，下楼。把昨晚在这店里的人，一个一个问过去。）']]);
    note('密室是假的：门是死者自己从里面闩上的，他在别处中了刀才逃回房'); mood('case_yiyun'); s.n = 1; toast('迟了一刻的灯 —— 下楼到大堂问话', 2400); };
  man('xt_inn_room1', 'town_guard', D1 ? 462 : 420, D1 ? 820 : 772, GUARD, async () => { const s = q();
    if (s.s === 3) { await say(GUARD, '这间房，往后我每回巡街都要上来看一眼。'); return; }
    await say(GUARD, s.n === 0 ? '尸首不许挪。别的，你看你的。' : s.n >= 4 ? '仵作还在路上。你要再看，就再看。' : '我守着。你查你的。'); });
  spot('xt_inn_room1', D1 ? 449 : 304, D1 ? 510 : 560, '倒在床前的人', async () => { const s = q(), f = F(); if (!on()) return;
    if (s.n === 4 && !f.hx_body2) {
      mood('case_guiyi');
      await L([['', '叶孤星蹲下身，这一回，看的不是刀。'], ['', '刀口很浅。刀尖卡在肩胛骨上，离要害差着两寸，地上的血也只有巴掌大一摊。'], [YE, '这一刀，杀不了人。'],
        ['', '死者的嘴唇是青的。十个指甲，从根上透出一层淡淡的青色，像是有人拿青黛细细描过。'], [XX, '（……「七日青」。小子，这东西我认得。服下去七天才发作，头六天只是心口发闷，第七天夜里，人说没就没。）'],
        [XX, '（桌上那瓶护心丹，他吃了七天，以为是自己累着了。）'], [YE, '也就是说，就算没有这一刀——'], [XX, '（他也活不过昨晚。捅刀的那个，捅的是个快死的人。）'],
        [YE, '七天前。他在哪儿，喝过谁的东西。'], [XX, '（问他的随从。）']]);
      note('刀口浅，卡在肩胛骨上，杀不了人；死者唇甲发青——是「七日青」，七天前就中了毒'); f.hx_body2 = 1; toast('迟了一刻的灯 —— 下楼问阿贵：七天前，他在哪儿', 2600); return; }
    await L([['', '一个五十来岁的男人面朝下趴在床前的脚踏上，一只手还朝门的方向伸着。'], ['', '背后偏左的位置，插着一把乌木柄的短刀，直没到柄。'], [YE, '刀是从背后捅的，斜着往上。'],
      [XX, '（斜着往上，偏左。小子，你右手握刀从背后捅人，刀口往哪边斜？）'], [YE, '……往右。'], [XX, '（记一笔。）']]);
    if (seen('shi')) { note('短刀从背后偏左斜着往上捅入——握刀的是左手'); await count(); } }, { cond: on });
  spot('xt_inn_room1', D1 ? 636 : 640, D1 ? 818 : 800, '门闩', async () => { if (!on()) return; await L([['', '门闩断成两截，是撞门时撞断的。闩身朝里的一面，有三个暗红的指印。'], [YE, '血指印。按在门闩朝里的一面。'], [XX, '（手上沾着血的人，在屋里，闩了这道门。）']]); if (seen('men')) { note('门闩朝里的一面有血指印'); await count(); } }, { cond: on });
  spot('xt_inn_room1', D1 ? 910 : 924, D1 ? 646 : 576, '圆桌', async () => { if (!on()) return; await L([['', '桌上一壶冷茶，一只杯子。旁边搁着一只小瓷瓶，瓶身上贴着「护心丹」，已经吃空了大半。'], [YE, '护心丹。他心口有毛病？'], [XX, '（先记着。一个大老远来收账的人，随身带着一瓶快吃空的护心丹。）']]); if (seen('zhuo')) { note('桌上有一瓶吃空大半的护心丹'); await count(); } }, { cond: on });
  spot('xt_inn_room1', D1 ? 1040 : 1148, D1 ? 340 : 362, '后窗', async () => { if (!on()) return; await L([['', '窗栓插着，栓头上的灰完完整整。'], [YE, '没人从窗走。'], [XX, '（这家店的窗栓，倒是回回都清白。）']]); if (seen('chuang')) { note('后窗的栓插着，栓头有灰——没人走窗'); await count(); } }, { cond: on });
  spot('xt_inn_room1', D1 ? 1010 : 1104, D1 ? 804 : 898, '行李架上的包袱', async () => { if (!on()) return; await L([['', '包袱没被翻过。钱袋沉甸甸的还在，里头少说两百灵石。'], ['', '包袱底下压着一张当票似的小纸条：「青阳镇 · 百草轩 · 寄匣一只」。'], [YE, '不是劫财。'], [XX, '（钱一文没少。要他命的人，要的不是钱。——那张寄匣的条子，收好。）']]); if (seen('bao')) { note('钱袋没动，不是劫财；有一张「青阳镇百草轩 · 寄匣一只」的条子'); await count(); } }, { cond: on });
  spot('xt_inn_corr', 283, 520, '门槛前的地毯', async () => { await L([['', '靛蓝的长毯上，从后楼梯口到天字一号的门槛，隔几步就有一个铜钱大的暗点。'], [YE, '血。一路滴过来的。'], [XX, '（从后楼梯上来的。后楼梯通后巷。）']]); note('走廊地毯上有一路血点，从后楼梯口滴到天字一号门前'); }, { cond: on });

  // ---------------- 第三幕：大堂问话 ----------------
  async function asked(k) { const f = F(), s = q(); f['hx_a_' + k] = 1; if (s.n !== 1) return; const n = ['l', 'g', 'b'].filter(x => f['hx_a_' + x]).length; if (n < 3) { toast('迟了一刻的灯　问话 ' + n + ' / 3', 1800); return; }
    await L([[XX, '（三个人，三张嘴，说的是同一句话——「灯亮的时候」。）'], [YE, '没有人说戌时几刻。都说灯亮的时候。'], [XX, '（点灯夜嘛，满城的人都拿灯当更漏。可是小子——要是那盏灯，自己就不准呢？）'],
      [XX, '（去问管灯的人。还有，那晚谁在客栈门口待得最久，也问问。）']]);
    s.n = 2; mood('case_yiyun'); toast('迟了一刻的灯 —— 去查那盏灯：司灯老人、说书先生', 2600); }
  man('xt_inn_hall', 'bandit', 840, 960, LEI, async () => { const s = q(), f = F();
    if (s.s === 3) return;
    if (s.n < 1) { await say(LEI, '（独自占着一张桌子喝酒，头也不抬）别挡着光。'); return; }
    if (f.hx_a_l) { await say(LEI, s.n >= 5 ? '（把酒碗往桌上一顿）还问？老子说了八遍了，灯亮的时候我在这儿划拳！' : '该说的我都说了。小兄弟，查案是官差的事。'); return; }
    await L([[YE, '雷镖头。点灯那晚，你在哪儿？'], [LEI, '（咧嘴一笑）在这儿啊。镇远镖局押完一趟镖，弟兄们凑一桌，划拳。灯亮的时候我正赢着呢，满大堂的人都看见了。'], [LEI, '那姓贺的？不认得。一个卖药的，跟我们走镖的八竿子打不着。'],
      ['', '他说话的工夫，伸手去够桌上的酒碗。'], fin('qy_dice') ? [YE, '（左手。筷子在左边，酒碗在左边，刀也挂在右腰——他是左撇子。在长乐坊看庄家看惯了，如今看人先看手。）'] : [XX, '（……小子，这人身上有点不对劲，我一时说不上来。先记着。）']]);
    note('雷大勇：灯亮的时候在大堂划拳，满堂人作证；自称不认得贺九章'); if (fin('qy_dice')) { f.hx_left = 1; note('雷大勇是左撇子：酒碗、筷子都在左手边'); } await asked('l'); }, { cond: on, hx: 'lei' });
  man('xt_inn_hall', 'kitchen_helper', 700, 600, GUI, async () => { const s = q(), f = F();
    if (s.s === 3) { await say(GUI, '我……我送东家回青阳镇。不管他做过什么，总得有人送。'); return; }
    if (s.n < 1) { await say(GUI, '（蹲在墙角，两眼通红）东家……东家……'); return; }
    if (s.n === 4 && f.hx_body2) {
      await L([[YE, '阿贵。七天前，你们东家在哪儿？'], [GUI, '七天前？在青阳镇啊。我们就是从青阳镇动身的。'], [YE, '动身那天，他吃过喝过什么，见过谁？'],
        [GUI, '（想了想）那天一早，东家去百草轩存了只匣子，谁也不让碰。晌午……晌午去了倚翠楼，听了一曲琴，喝了盏茶。他说出远门前听一曲，路上顺。'], [GUI, '就那一盏茶。出了镇，东家就说心口发闷，一路上护心丹没断过。我还当是他累着了……'],
        [XX, '（七天前，青阳镇，倚翠楼，一盏茶。还有百草轩那只谁也不让碰的匣子。小子，这案子的根，不在玄天城。）']]);
      note('阿贵：七天前动身那天，贺九章在百草轩存了只匣子，又去倚翠楼喝了一盏送行茶，出镇就心口发闷'); s.n = 5; mood('case_yinmou'); toast('迟了一刻的灯 —— 去青阳镇：百草轩、倚翠楼', 2800); return; }
    if (f.hx_a_g) { await say(GUI, s.n >= 5 ? '少侠去青阳镇，替我……替我看看东家那只匣子里到底是什么。' : '我真是在街上看灯。卖糖画的能作证。'); return; }
    await L([[GUI, '（哑着嗓子）我跟了东家六年。他这回说来收一笔账，收完就回，不让我跟着，叫我自己上街看灯去。'], [GUI, '灯亮的时候，我在街口看糖画，卖糖画的还跟我搭过话。回来就……就……'], [YE, '他来收谁的账？'],
      [GUI, '不知道。东家的账从不让我看。只知道每个月都有一笔，雷打不动，二十两。'], [XX, '（每月二十两，雷打不动，不让人看。小子，这可不像药材账。）']]);
    note('阿贵：灯亮的时候在街口看糖画；贺九章来玄天城收一笔每月二十两、不让人看的账'); await asked('g'); }, { cond: shown, hx: 'agui' });

  // ---------------- 第四幕：那盏灯 ----------------
  const lampDone = async () => { const f = F(), s = q(); if (s.n !== 2 || !(f.hx_deng && f.hx_shu)) return;
    mood('case_guiyi');
    await L([[XX, '（对上了。满城的灯戌时正亮，只有客栈门口那一盏，迟了一刻。）'], [YE, '大堂里的人看的，都是门口那一盏。'], [XX, '（所以他们嘴里的「灯亮的时候」，不是戌时正，是戌时一刻。中间这一刻钟，谁在，谁不在，没有人说得清。）'],
      [YE, '灯油里的水，是有人掺的。有人要的，就是这一刻钟。'], [XX, '（有意思起来了。先别声张——去查那把刀。乌木柄，刃口带云纹，这种货色，玄天城只有一家卖。）']]);
    note('客栈门口的灯迟了一刻才亮：「灯亮的时候」其实是戌时一刻，中间一刻钟没人说得清'); s.n = 3; toast('迟了一刻的灯 —— 去万宝楼，查那把短刀', 2600); };
  spot('xt_city', 1250, 2190, '客栈门口的灵灯', async () => { const f = F(); if (!on() || q().n < 2) { await say('', '一盏一人多高的灵灯，灯罩擦得很亮。'); return; }
    await L([['', '灯座底下的油壶，壶嘴上挂着一圈水渍。倒出一点在手心——油花底下，沉着一层清水。'], [YE, '油里有水。'], [XX, '（灯芯吃不上油，点着了也只是冒烟，得把水烧干了才透亮。小子，拿这个去问那个管灯的老头。）']]);
    f.hx_lampseen = 1; note('客栈门口那盏灯的油壶里掺了水'); }, { cond: () => on() && q().n === 2 });
  hook('xt_city', DENG, async () => { const f = F(), s = q(); if (!on() || s.n !== 2 || f.hx_deng) return false;
    if (!fin('xt_lamps') && !f.hx_lampseen) { await L([[YE, '老人家，点灯那晚，云来客栈门口的灯——'], [DENG, '（摆摆手）老朽管着全城十盏灯，哪一盏什么时辰亮，是公事，不跟外人嚼舌。'], [XX, '（老头嘴紧。小子，空口去问不成，先去客栈门口，自己看看那盏灯。）']]); return true; }
    await L(fin('xt_lamps') ? [[DENG, '是你啊，后生。上回九盏灯的事，老朽还没谢你。'], [YE, '老人家，点灯那晚，云来客栈门口那盏灯，是不是出过岔子？'], [DENG, '（叹气）瞒不过你。那盏灯，迟了整整一刻才亮。老朽点了四十年灯，头一回。']]
      : [[YE, '老人家，客栈门口那盏灯的油壶里，有水。'], [DENG, '（脸色变了）……你看见了。唉。那盏灯，点灯夜迟了整整一刻才亮。老朽点了四十年灯，头一回。']]);
    await L([[DENG, '戌时正，全城十盏灯一齐点火。九盏都亮了，就那一盏只冒烟。老朽赶过去一看，油里掺了水——得把水烧干，灯才透亮。'], [DENG, '油壶就搁在灯座底下，谁路过都够得着。老朽傍晚添油的时候还好好的。'], [YE, '也就是说，水是傍晚到戌时之间掺的。'], [DENG, '是。老朽怕城主府怪罪，没敢声张……']]);
    note('司灯老人：全城的灯戌时正点，客栈门口那盏油里掺了水，迟了一刻才亮；水是傍晚之后掺的'); f.hx_deng = 1; await lampDone(); if (q().n === 2) toast('迟了一刻的灯 —— 再问问那晚在客栈门口的说书先生', 2400); return true; });
  hook('xt_city', TANG, async () => { const f = F(); if (!on() || q().n !== 2 || f.hx_shu || fin('xt_thirty') || f.hx_tang) return false;
    await L([[YE, '点灯那晚，你在街口见过一个看糖画的随从么？'], [TANG, '见过见过，眼睛红红的小伙子，站了好半天。灯亮的时候他就在我摊子前头。'], [TANG, '不过客官要问那晚的时辰，得问说书的老先生。他就在客栈门口摆场子，更鼓敲没敲、灯亮没亮，他那张嘴记得比谁都清。']]);
    note('糖画摊主：灯亮的时候阿贵确实在街口'); f.hx_tang = 1; return true; });
  hook('xt_city', SHU, async () => { const f = F(), s = q(); if (!on() || s.n !== 2 || f.hx_shu) return false;
    if (!fin('xt_thirty') && !f.hx_tang) { await L([[SHU, '（醒木一拍）后生要听书？今日说的是《九曜》第三回——'], [XX, '（这老头一开讲就停不下来。小子，先找个那晚在街上的人问问，回头再来撬他的嘴。街口卖糖画的就不错。）']]); return true; }
    await L(fin('xt_thirty') ? [[SHU, '是你啊后生！三十个名字那桩事，老朽已经编成了书，改日说给你听。'], [YE, '老先生，点灯那晚，你在客栈门口？']] : [[YE, '老先生，卖糖画的说，点灯那晚你在客栈门口摆场子。']]);
    await L([[SHU, '在啊。那晚可把老朽气坏了！'], [SHU, '戌时的更鼓「咚」一响，满街的人齐声叫好——别处的灯都亮了，偏偏老朽头顶这一盏，光冒烟不亮。听书的全扭头看别处去了！'], [SHU, '老朽硬着头皮把一整段「九曜缺一」说完，足足一刻钟，头顶那盏灯才「噗」地亮起来。'],
      [YE, '更鼓响过之后，一刻钟，灯才亮。'], [SHU, '错不了。老朽说了三十年书，一段书多长，比更漏还准。'], [YE, '那一刻钟里，客栈里有没有人出来过？'], [SHU, '门口没有。可后巷那头……好像有只野猫，撞翻了什么东西，「哐啷」一声。老朽还骂了一句。']]);
    note('说书先生：戌时更鼓响后足足一刻钟，门口的灯才亮；那一刻钟里后巷「哐啷」响过一声'); f.hx_shu = 1; await lampDone(); if (q().n === 2) toast('迟了一刻的灯 —— 再去城中央问问司灯老人', 2400); return true; });

  // ---------------- 第五幕：那把刀（万宝楼）----------------
  const knife = async () => { const s = q();
    await L([[WB, '乌木柄，云纹刃……（翻开账册）是小店的货。三天前卖出去的，四十灵石。'], [WB, '买主没留名字。伙计记了一笔：「镖师打扮，四十上下，左手掏的钱袋。」'], [YE, '左手。'], [WB, '是。小伍还嘀咕，说这人使左手解钱袋，利索得很。'],
      [XX, '（三天前。贺九章也是三天前住进客栈的。有人前脚看见他进城，后脚就去买了刀。）'], [XX, '（刀有了，时辰有了。可小子——我总觉得那一刀太「干净」了。回去，再看一眼那个死人。）']]);
    note('万宝楼：短刀三天前卖给一个镖师打扮、左手掏钱袋的人'); s.n = 4; mood('case_bijin'); toast('迟了一刻的灯 —— 回天字一号房，再看一眼死者', 2600); };
  hook('xt_wanbao', WB, async () => { const f = F(), s = q(); if (!on() || s.n !== 3) return false;
    if (fin('xt_fake')) { await L([[WB, '少侠！稀客稀客。上回的事——'], [YE, '掌柜的，认一把刀。乌木柄，刃口带云纹。']]); await knife(); return true; }
    if (!f.hx_huo) { await L([[YE, '掌柜的，贵店卖过一把乌木柄、云纹刃的短刀么？'], [WB, '（上下打量）客官，小店的买主，向来是不往外说的。'], [XX, '（生意人的规矩。小子，绕个弯——问伙计。伙计的嘴没掌柜的严。）']]); return true; }
    await L([[YE, '掌柜的，那把刀如今插在一个死人背上。城卫迟早来问，不如先跟我说。'], [WB, '（脸色一变）死、死人？……客官稍候，我翻账。']]); await knife(); return true; });
  hook('xt_wanbao', HUO, async () => { const f = F(); if (!on() || q().n !== 3 || fin('xt_fake') || f.hx_huo) return false;
    await L([[YE, '小哥，前几天有没有人来买过乌木柄的短刀？'], [HUO, '（压低声音）有！三天前，是我接的。那人不讲价，丢下钱就走。'], [HUO, '客官可别说是我说的。您跟掌柜提一句「城卫要来查」，他准翻账。']]);
    f.hx_huo = 1; return true; });

  // ---------------- 左手（没办过长乐坊：多一步，问阿顺）----------------
  hook('xt_city', SHUN, async () => { const f = F(), s = q(); if (!on() || f.hx_left || s.n < 1) return false;
    await L([[YE, '阿顺。这几天店里的客人，有谁是使左手的？'], [SHUN, '左手？……有！雷镖头。我给他上菜，筷子回回得摆左边，摆右边他要瞪人的。'], [SHUN, '还有件怪事。点灯那天傍晚，雷镖头跟我借过水瓢，说是饮马。可他们镖局的马，那天压根没牵来店里。']]);
    f.hx_left = 1; f.hx_piao = 1; note('阿顺：雷大勇是左撇子；点灯那天傍晚他借过水瓢，说是饮马，可马没牵来'); return true; });

  // ---------------- 第六幕：青阳镇 ----------------
  const qyDone = async () => { const f = F(), s = q(); if (s.n !== 5 || !(f.hx_page && f.hx_tea)) return;
    await L([[XX, '（一个下毒的，一个捅刀的。一个等了七年，一个只等了三天。）'], [XX, '（回玄天城吧，小子。该把人叫齐了。）']]); s.n = 6; toast('迟了一刻的灯 —— 回玄天城云来客栈，找柳三娘', 2800); };
  const readPage = async () => { const f = F();
    await L([['', '匣子里没有药材。只有一页发黄的账纸，边上是撕下来的毛茬。'], ['', '「九月初五 · 粮车十二 · 走柳溪渡 · 讯银四十两 · 贺」'], ['', '底下另起一行，墨色新得多：「雷老七，今名大勇，镇远镖局 · 月银二十两 · 封口」。']]);
    if (fin('qy_ledger')) { mood('case_yinmou');
      await L([[YE, '这纸，这记法——和黑风寨那本账一模一样。是从那本账上撕下来的一页。'], [XX, '（「讯银」，卖消息的钱。七年前黑风寨头一回下山抢粮，抢的就是柳溪渡那十二辆粮车。是这姓贺的，把渡口的时辰卖了四十两。）'],
        [YE, '雷老七。雷大勇从前是黑风寨的人。'], [XX, '（洗了手，改了名，进了镖局。姓贺的攥着这页账，每月收他二十两封口钱——这就是那笔「雷打不动、不让人看」的账。）'], [YE, '这一回他进城，是来加价的。雷大勇不想再给了。'], [XX, '（动机，有了。）']]);
      note('百草轩的匣子里是从黑风寨账本上撕下的一页：贺九章七年前把粮车的路线卖给黑风寨；雷大勇原是黑风寨的人，每月被他勒索二十两'); f.hx_motive = 1; f.hx_fail = 0; }
    else { await L([[YE, '「讯银」。「封口」。这是哪本账上撕下来的？'], [XX, '（没头没尾的一页纸，看不出来路。小子，这东西拿到公堂上，人家一句「不知哪儿捡的废纸」就打发了。）'], [XX, '（要是见过它原先那本账……算了，先收着。）']]);
      note('百草轩的匣子里有一页撕下来的旧账，写着「雷老七，今名大勇 · 月银二十两 · 封口」——看不出是哪本账上的'); toast('（查完【青阳镇】黑风寨的账本，才认得出这页账的来路）', 3200); }
    f.hx_page = 1; };
  hook('qy_herb', BAI, async () => { const f = F(), s = q(); if (!on() || s.n < 5 || f.hx_box) return false;
    await L([[YE, '掌柜的，贺九章在贵店寄了一只匣子。'], [BAI, '贺老板？是有一只，锁在素柜里。他每月来送一回药材，回回都要自己开柜看一眼。……他出什么事了？'], [YE, '死了。在玄天城。'], [BAI, '（手里的戥子掉在柜上）……柜子没锁，少侠自己看吧。那匣子，我碰都不想碰了。']]);
    f.hx_box = 1; toast('迟了一刻的灯 —— 看看百草轩墙边的素柜', 2200); return true; });
  spot('qy_herb', 128, 340, '素柜里的匣子', async () => { const f = F(); if (!f.hx_box) { await say('', '一只上了年头的素柜。'); return; }
    if (f.hx_page && (f.hx_motive || !fin('qy_ledger'))) { await say('', f.hx_motive ? '匣子空了。那页账在你怀里。' : '那页账还是看不出来路。'); return; }
    await readPage(); await qyDone(); }, { cond: () => shown() && q().n >= 5 });
  const wuScene = async () => { const f = F();
    mood('case_jiushi');
    await L([[YE, '七天前，贺九章临行那盏茶，是你端的。'], [WU, '（手上擦杯子的动作停了一下，又接着擦）是我。'], [WU, '公子是来拿我的？']]);
    if (f.hx_motive) {
      await L([[YE, '九月初五。柳溪渡。粮车十二。'], ['', '杯子从她手里滑下去，没有碎，在柜面上滚了半圈。'], [WU, '……七年了。原来还有人知道那个渡口。'], [WU, '十二辆车里，有我爹，还有我两个哥哥。他们不是修士，是给镇上运秋粮的脚夫。'],
        [WU, '黑风寨的人说，是有人把过渡的时辰卖给了他们，四十两。我找了两年，才找到这个人。又在这楼里端了五年茶，等他哪一天，坐到我的桌上。'], [WU, '「七日青」是我自己配的。方子是我娘留下的，她原先在百草轩抓药。'],
        [WU, '（抬起头，眼睛是干的）公子，我不后悔。只是没想到——他还挨了一刀。那一刀，不是我。'], [YE, '我知道。'], [WU, '苏姑娘什么都不知道。求公子，别惊动她。'], [XX, '（……小子，回去的路上，你慢慢想。）']]);
      note('倚翠楼侍女阿芜：七年前父兄死在柳溪渡的粮车上；她等了七年，在送行茶里下了「七日青」'); f.hx_awu = 1; }
    else { await L([[WU, '一盏茶而已。楼里的茶，都是我端的。'], [WU, '公子说茶里有东西——有凭据么？'], ['', '她的手很稳，杯子擦得一尘不染。'], [XX, '（她知道我们没有。小子，我们连「她为什么要杀他」都说不出来。）']]);
      note('倚翠楼侍女承认茶是她端的，别的一概不认'); }
    f.hx_tea = 1; };
  hook('qy_yicui', WU, async () => { const f = F(), s = q(); if (!on() || s.n < 5) return false;
    if (f.hx_tea) { if (f.hx_motive && !f.hx_awu) { await wuScene(); return true; } await say(WU, f.hx_awu ? '公子要怎么做，我都认。茶凉了，我给您换一盏——这一盏是干净的。' : '公子若没有别的事，我要去添茶了。'); return true; }
    if (!fin('qy_tassel') && !(f.hx_cha && f.hx_zui)) { await L([[YE, '七天前，一位姓贺的药材商在这儿喝过茶。那盏茶是谁端的？'], [WU, '（低头擦杯子）楼里每天几十盏茶，公子问的是哪一盏，我记不得了。'], [XX, '（记不得？小子，问问那天在场的客人。）']]); return true; }
    await wuScene(); await qyDone(); return true; });
  hook('qy_yicui', CHA, async () => { const f = F(); if (!on() || q().n < 5 || f.hx_cha || fin('qy_tassel') || f.hx_tea) return false;
    await L([[YE, '七天前晌午，有位姓贺的药材商来听琴，您可在场？'], [CHA, '在。那人我记得，嗓门大，一进门就嚷着要最好的茶。'], [CHA, '怪的是，平日贵客的茶都是小丫头们端，那天是阿芜姑娘亲自端的。她在这楼里五年了，是管事的，早就不用端茶了。']]);
    f.hx_cha = 1; note('茶客：七天前贺九章的茶，是早已不用端茶的阿芜亲手端的'); return true; });
  hook('qy_yicui', ZUI, async () => { const f = F(); if (!on() || q().n < 5 || f.hx_zui || fin('qy_tassel') || f.hx_tea) return false;
    await L([[ZUI, '（打了个酒嗝）七天前？记得，记得……那天阿芜姑娘端茶，手抖了一下，洒了半盏在托盘上。'], [ZUI, '我还笑她：端了五年茶的人，今日怎么倒像头一回。她没理我。']]);
    f.hx_zui = 1; note('醉书生：那天阿芜端茶时手抖，洒了半盏'); return true; });

  // ---------------- 第七幕：当众指认 ----------------
  async function finale() {
    const s = q(), f = F();
    mood('case_duizhi');
    await L([['', '大堂的门关上了。柳三娘、城卫、阿顺、阿贵，还有独占一桌的雷大勇，都看着叶孤星。'], [GUARD, '人齐了。你说吧，凶手是怎么从一间闩死的屋子里出去的？'],
      [YE, '凶手没进过那间屋子。门闩上的血指印在里面——门，是贺九章自己闩的。'], [YE, '他在后巷中的刀。走廊地毯上一路血点，从后楼梯口滴到天字一号门前。他逃回房里，闩上门，才倒下。'],
      [GUARD, '后巷？什么时辰？'], [YE, '戌时正到戌时一刻之间。'], [LEI, '（嗤笑）那就跟这屋里的人都不相干了。灯亮的时候，谁在哪儿，大伙儿都看着呢。'],
      [YE, '灯亮的时候，是戌时一刻。'], ['', '大堂里静了一下。'], [YE, '点灯夜，全城的灯戌时正亮。只有客栈门口这一盏，油里被人掺了水，迟了一刻。司灯老人和说书先生都能作证。'],
      [YE, '你们每个人说的「灯亮的时候」，都比真正的戌时晚了一刻钟。这一刻钟里，有一个人不在大堂。']]);
    const k = await choose('那一刀，是谁捅的？', ['镖头雷大勇', '随从阿贵', '伙计阿顺', '万宝楼的伙计']);
    if (k !== 0) {
      const who = ['', GUI, SHUN, HUO][k];
      await L([[GUARD, '（一把按住' + (k === 3 ? '门口探头的万宝楼伙计' : who === GUI ? '阿贵' : '阿顺') + '）好啊！原来是你！'], [who, '不、不是我！冤枉啊！'], ['', '大堂里顿时乱成一团。桌椅翻倒的声音里，有人撞开了后门。'],
        [XX, '（……小子。左手，水瓢，那把刀的买主——你再想想。）'], [BOSS, '雷镖头呢？！方才还坐在这儿的！'], ['', '那张桌子空了。酒碗还在桌上打转，碗底压着半吊酒钱。'],
        [GUARD, '（松开手，脸涨得通红）……追！'], [YE, '（是他。我指错了人，他趁乱走了。）'], [XX, '（跑得了一时。记着这张脸，往后总有再碰上的时候。）'],
        [BOSS, '少侠……不管怎么说，小店的嫌疑是洗清了。这点心意，您收着。']]);
      f.hx_end = 'run'; return reward(.5); }
    await L([[YE, '雷大勇。'], [LEI, '（笑容没变）小兄弟，满堂的人都看见我在划拳。'], [YE, '那是灯亮之后。戌时正，更鼓响的时候，你说去后院解手，离了席。'],
      [YE, '万宝楼三天前卖出一把乌木柄短刀，买主是个镖师，左手掏的钱袋。刀口从背后偏左斜着往上——握刀的是左手。'], [SHUN, '雷镖头是左撇子！筷子回回得摆左边！'],
      f.hx_piao ? [SHUN, '还有！点灯那天傍晚，他跟我借过水瓢，说是饮马——可马根本没牵来！'] : [YE, '灯油里的水，是傍晚之后掺的。油壶就在门口灯座底下。'],
      [YE, '你先往灯里掺了水，让它迟一刻亮。戌时正，你从后院绕到后巷，捅了他，再回到桌上接着划拳。等灯亮的时候，满堂的人都替你作证。']]);
    if (!f.hx_motive) {
      await L([[LEI, '（慢慢放下酒碗）好故事。可我为什么要杀一个素不相识的卖药的？'], [YE, '他每月收你二十两——'], [LEI, '凭据呢？'],
        ['', '叶孤星取出那页旧账。'], [LEI, '（扫了一眼，笑出了声）一张没头没尾的破纸，上头有我的手印，还是有官府的印？小兄弟，这东西街边三文钱能写十张。'],
        [GUARD, '（为难）……少侠，他说得在理。这页纸是哪本账上的，谁记的，记的是什么事，一样都说不清。光凭左手和一把水瓢，我拿不了镇远镖局的镖头。'],
        [GUARD, '再说，仵作方才来回话了——人是中毒死的，不是刀捅死的。下毒的又是谁？'], [LEI, '（站起身，掸了掸衣摆）听见了？毒死的。弟兄们，结账。'],
        ['', '没有人拦他。他走到门口，回头看了叶孤星一眼，那眼神像在记一张脸。'], [XX, '（……输了，小子。差的不是时辰，不是刀，是那页账的来路。）'], [XX, '（那页纸是从一整本账上撕下来的。青阳镇，黑风寨——把那本账查到底，再回来。）'],
        [BOSS, '少侠……他这几日还住在镇远镖局，走不远。您要是找着了凭据，我随时再把人叫齐。']]);
      f.hx_fail = 1; mood(null); toast('指认失败 —— 查完【青阳镇】黑风寨的账本，去百草轩再看那页旧账，再回来', 4200); return; }
    await L([[LEI, '（慢慢放下酒碗）好故事。可我为什么要杀一个素不相识的卖药的？'], [YE, '因为他认得你。雷老七。'], ['', '酒碗在桌上磕了一下。'],
      [YE, '（展开那页旧账）这是从黑风寨的账本上撕下来的一页。那本账，我在青阳镇从头翻到了尾。'], [YE, '七年前，贺九章把柳溪渡粮车的时辰卖给黑风寨，四十两。那时候你还叫雷老七，是寨子里的人。'],
      [YE, '后来你洗了手，改了名，进了镖局。他攥着这页账，每月收你二十两封口钱。三天前他进城，是来加价的。'], [GUI, '（喃喃）每月二十两，雷打不动……东家收的，是这笔账？'],
      [LEI, '（脸上的笑一点一点没了）……他要两百两。说不给，就把这页纸送到镇远镖局总镖头的桌上。'], [LEI, '老子洗手三年了！三年没碰过一趟黑货！凭什么——'], ['', '他猛地掀翻了桌子，左手已经按在了刀柄上。'], [XX, '（来了。小子，当心他的左手刀！）']]);
    const lv = S.hero.lv || 10, mk = (name, key, hp, atk, def, extra) => Object.assign({ name, key: (typeof IMG !== 'undefined' && IMG[key]) ? key : 'e_grunt', hp, maxhp: hp, atk, def, spd: 14, h: 250, color: '#665' }, extra || {});
    let win = true;
    try { await fadeOut(220); const pr = startBattle({ bg: 'bg_night', normalBgm: true, title: '云来客栈 · 大堂', boss: true, exp: 300, gold: 240, enemies: [mk('雷大勇（原黑风寨 · 雷老七）', 'e_bandit', 1700 + lv * 120, 48 + lv * 3, 14, { boss: true })] });
      await fadeIn(220); const r = await pr; S.scene = drawMap; await fadeIn(200); win = !!r && r !== 'flee'; } catch (e) { console.warn('R232 fight', e); }
    if (!win) { try { partyRevive(.4); } catch (e) {} await say(XX, '（这人的左手刀又快又刁。缓口气，回头再找掌柜把人叫齐。）'); return; }
    mood('case_jiexiao');
    await L([['', '雷大勇的刀飞了出去，钉在柱子上，嗡嗡地颤。城卫一拥而上，把他按在地上。'], [LEI, '（脸贴着地，喘着粗气）……我捅了他。可我捅完他还能跑！他是自己跑回屋的！一刀捅在肩胛骨上，死不了人！'],
      [GUARD, '仵作方才也是这么说的。人是中毒死的。少侠——下毒的，又是谁？'], ['', '所有人都看着叶孤星。'], [XX, '（青阳镇，倚翠楼，一盏茶。等了七年的那个人。小子，这句话，只有你能说，也只有你能不说。）']]);
    if (f.hx_awu) {
      const k2 = await choose('下毒的人——', ['「是青阳镇倚翠楼的侍女，阿芜。七年前，她的父兄死在柳溪渡。」', '「毒是七天前在路上中的。下毒的人，我没有找到。」']);
      if (k2 === 0) { await L([[GUARD, '（记下名字）青阳镇，倚翠楼，阿芜。我这就发文过去。'], [GUI, '七年前……柳溪渡……（捂住了脸）东家他，真的做过那种事？'], [YE, '账上是这么写的。'],
          [XX, '（你说了实话。实话有时候比刀重，小子。那姑娘说过她认——那就让她自己去认吧。）']]); f.hx_end = 'law'; }
      else { await L([[GUARD, '（皱眉）没找到？……罢了。七天前的事，又出在城外，本也不归玄天城管。捅刀的抓着了，这案子在我这儿，就算结了。'], [GUI, '（看了叶孤星很久，低下头）……东家这些年，夜里常做噩梦，喊的都是「渡口」。我早该猜到的。'],
          [XX, '（你没说。小子，这世上的账，不是每一笔都得由官府来收。——可你要记得，今天这句假话，是你自己选的。）']]); f.hx_end = 'mercy'; } }
    else { await L([[YE, '七天前，青阳镇倚翠楼，有人在他的送行茶里下了「七日青」。端茶的人承认茶是她端的，别的不认。我没有凭据。'], [GUARD, '（叹气）城外的事，没凭据，我也发不了文。捅刀的抓着了，这案子在我这儿，就算结了。'], [XX, '（一半的真相。也罢。）']]); f.hx_end = 'half'; }
    await L([[BOSS, '（长长出了一口气，扶着柜台坐下）十五年了，小店头一回死人……也头一回，有人替小店把话说得这么明白。'], [SHUN, '客官，往后您来，我筷子给您摆中间——您使哪只手都顺。'],
      ['', '门口，司灯老人不知什么时候来了。他从袖子里摸出一截发黑的旧灯芯。'], [DENG, '那盏灯，老朽换了新芯。旧的这截浸过水，烧起来总慢一拍——后生，你拿着。'], [DENG, '灯会迟。人心不会。']]);
    return reward(1);
  }
  async function reward(rate) { const s = q(), f = F(); s.s = 3; s.n = 7; mood(null);
    const h = S.hero, lv0 = h.lv, gold = Math.round(Q.reward.gold * rate), exp = Math.round(Q.reward.exp * rate), show = [];
    if (rate >= 1) { addItem('c_chideng', 1); show.push({ icon: 'item:c_chideng', id: 'c_chideng', name: '迟灯灯芯', count: '×1', desc: ITEM_DB.c_chideng.desc }); }
    h.gold = (h.gold || 0) + gold; show.push({ icon: 'gold', name: '灵石', count: '×' + gold }); try { playSnd('jingle_win'); } catch (e) {}
    if (window.itemGet) await itemGet(show, rate >= 1 ? '支线完成 · 迟了一刻的灯' : '支线了结 · 迟了一刻的灯（真凶在逃）');
    const ups = typeof gainExp === 'function' ? gainExp(exp) : 0; toast('修为 +' + exp, 1800); if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0); }
  window.R232 = { Q, finale, note };
})();
