// ================= R239 · 天剑宗玄天据点能进去了（作者 11-13：据点里面可以进去；每栋楼都该能进）=================
// Codex 画了正厅（亮堂版：白玉剑龛、镇驿剑、任务玉璧、传讯剑阵、四根盘龙柱、靛青云川毯）和客舍（三张弟子榻、疗伤矮榻、茶桌、蒲团）。作者：内景通过，可以接入。
// 前院（外景）作者不满意，正在重画——画好之前：据点大门 → 正厅；正厅东南角的传送阵 → 客舍。前院到了再插到中间。
// 据点长老搬进正厅莲台（见下），大门口换成两名守门弟子。只进测试版。
(function () {
  const D = window.R239_SECT; if (!D || typeof TMAPS === 'undefined' || !TMAPS.xt_city) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8], L = async a => { for (const [w, t] of a) await say(w, t); };
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  load('r239g_hall', 'r239/g_hall.webp'); load('r239g_rest', 'r239/g_rest.webp');
  for (const k of new Set(D.hall.objs.map(o => o.img))) load(k, 'r239/h_' + k.slice(6) + '.webp');
  for (const k of new Set(D.rest.objs.map(o => o.img))) load(k, 'r239/r_' + k.slice(6) + '.webp');
  const man = (cx, xy, name, talk, o) => { const [c, r] = P(xy[0], xy[1]); return Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk }, o || {}); };
  const spot = (xy, name, talk) => { const [c, r] = P(xy[0], xy[1]); return { key: 'none', c, r, name, hidden: true, h: 110, talk }; };
  const cell = (R, cs) => ({ x: Math.floor(R.x / cs), y: Math.floor(R.y / cs), w: Math.ceil(R.w / cs), h: Math.ceil(R.h / cs) });
  const XX = '星旋', YE = '叶孤星', CLK = '任务执事', F = () => (S.flags = S.flags || {});
  for (const n of [CLK, '侍立弟子', '禀事弟子', '候命弟子', '客舍杂役', '养伤的弟子', '喝茶的弟子']) SPEAKERS[n] = SPEAKERS[n] || { p: '', color: '#cfe0ff' };

  // ---------------- 正厅 ----------------
  const H = D.hall, HS = H.slots, HI = H.inter, GATE = P(960, 892), TOREST = [1708, 1300];
  const hallNpcs = [
    man('scribe', [HI.task_handover[0], HI.task_handover[1] - 16], CLK, async () => {
      if (!F().r239_clerk) { F().r239_clerk = 1;
        await L([[CLK, '少宗主。据点不比山上，人少事杂，怠慢了。'], [CLK, '这面玉璧上挂的是玄天城一带的宗门任务：护送、探查、清剿妖物。牌子亮着的，就是还没人接的。'],
          [CLK, '悬赏的事找莲台上的长老；要往山上递消息，用东边那座传讯剑阵；累了，东南角的阵法通客舍，榻是现成的。'], [XX, '（麻雀虽小，五脏俱全。你爹当年下山，头一站住的多半也是这儿。）']]); return; }
      await say(CLK, ['玉璧上的牌子每日卯时换一批。少宗主若要接悬赏，长老那里登记。', '城里若遇上棘手的事，报「天剑宗玄天据点」的名号，城卫多少给几分面子。', '镇驿剑是建据点那年宗主亲手挂上去的。剑在，据点就在。'][Math.floor(Math.random() * 3)]); }),
    // 作者 11-13：两位侍立弟子要镜像对立——同一身形，一左一右互为镜像；脸朝里（朝向由 r243_front.js 的全局规矩定：一左一右的两个人都朝中间）
    man('disciple_m', HS.attendant_left, '侍立弟子', ['见过少宗主。', '长老吩咐，厅里不得喧哗。……少宗主请便。', '我入门三年，头一回离山。玄天城比山下的镇子大了不知多少倍。'], { random: true }),
    man('disciple_m', HS.attendant_right, '侍立弟子', ['少宗主安好。', '夜里那道护城的光幕亮起来时，镇驿剑也会跟着轻轻地响。', '客舍在东南角的阵法后面，被褥是新晒的。'], { random: true }),
    man('disciple_m', HS.reporting_disciple_1, '禀事弟子', ['城南的灵灯前几日暗过三盏，我正要把这事报上去。', '长老不在座上？……那我再等等。'], { random: true, face: 'up' }),
    man('wandering_blade', HS.waiting_disciple, '候命弟子', ['我在等一趟去落云岭的护送任务。听说那边近来不太平。', '据点里最难熬的是等。等消息，等任务，等回山的那天。'], { random: true }),
    spot(HI.view_town_sword, '镇驿剑', async () => { await L([['', '剑龛里悬着一柄长剑，剑身通明，三道光环绕着它缓缓起落。匾上两个字：天剑。'], [YE, '（这剑意……和山门前的问剑碑是一路的。）'], [XX, '（镇驿剑。一处据点挂一柄，剑断了，山上立刻就知道这儿出了事。）']]); }),
    spot([HI.task_board[0] + 30, HI.task_board[1] + 40], '任务玉璧', async () => { await L([['', '玉璧上嵌着三排玉牌，有的亮着青光，有的已经暗了。'], ['', '「护送药材至苍月城」「探查幽影林灵气异动」「清剿落云岭外岭狼群」……'], [XX, '（想接活，找那个执事，或者莲台上的长老。）']]); }),
    spot(HI.message_sect, '传讯剑阵', async () => { await L([['', '三柄小剑绕着一方玉符缓缓旋转，剑尖始终指着同一个方向——天剑山。'], [XX, '（飞剑传书的阵眼。从这儿递一句话上山，比骑马快上十天。）']]); }),
    spot(HI.council_seating, '议事席', async () => { await say('', '四把圈椅围着一张矮几，茶还温着，像是刚有人议过事。'); }),
  ];
  // 作者 11-13：据点长老不该站在大门口——他在正厅莲台上打坐；大门口由弟子守着，守卫也不是官兵。
    try { const C = TMAPS.xt_city, i = (C.npcs || []).findIndex(n => n.name === '据点长老');
    if (i >= 0) { const e = C.npcs.splice(i, 1)[0], [c, r] = P(HI.report_elder[0], HI.report_elder[1]);
      // R247：长老盘膝坐在莲台上闭目打坐（6 帧呼吸），有人来说话才睁眼（4 帧过渡 → 睁眼 6 帧），说完过一会儿又合上眼。人是一件会动的物件，说话点在台前。
      const FR = { closed: [], open: [], wake: [] }, N = { closed: 6, open: 6, wake: 4 }, MS = { closed: 220, open: 240 }, WK = [100, 100, 120, 160];
      for (const k in FR) { const im = new Image(); im.onload = () => { for (let j = 0; j < N[k]; j++) { const cv = document.createElement('canvas'); cv.width = 192; cv.height = 224; cv.getContext('2d').drawImage(im, j * 192, 0, 192, 224, 0, 0, 192, 224); FR[k].push(cv); } }; im.src = 'r239/elder_' + k + '.webp'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (er) {} }
      let st = 'closed', t0 = 0, openT = 0;
      try { Object.defineProperty(IMG, 'r239_elder', { configurable: true, enumerable: true, set: () => {}, get: () => { const now = performance.now();
        if (st === 'wake') { let d = now - t0, j = 0; while (j < 3 && d > WK[j]) d -= WK[j++]; if (now - t0 > 480) { st = 'open'; openT = now; } return FR.wake[j] || FR.closed[0]; }
        if (st === 'open' && now - openT > 9000 && !(typeof dialog !== 'undefined' && dialog) && !(typeof choice !== 'undefined' && choice)) st = 'closed';
        const f = FR[st]; return f.length ? f[Math.floor(now / MS[st]) % f.length] : undefined; } }); } catch (er) {}
      H.objs.push({ id: 'elder', img: 'r239_elder', uid: 'r239-elder', x: 848, y: 420, w: 96, h: 112, sy: 560, ax: 896, ay: 560, flat: false, flip: false, noBlock: true });
      const t = e.talk; Object.assign(e, { c, r, cx: undefined, hidden: true, h: 150, face: 'down', wander: false,
        talk: async function () { if (st === 'closed') { st = 'wake'; t0 = performance.now(); await new Promise(r => setTimeout(r, 520)); } openT = performance.now() + 1e7; try { return typeof t === 'function' ? await t.apply(this, arguments) : t; } finally { openT = performance.now(); } } });
      if (typeof t !== 'function') e.talk = t;
      load('p_r247_elder', 'r239/p_elder.webp'); SPEAKERS['据点长老'] = Object.assign({}, SPEAKERS['据点长老'], { p: 'p_r247_elder' });
      hallNpcs.unshift(e); }
    for (const q of (window.SQ_DEFS || [])) if (q.giver && q.giver[1] === '据点长老') q.giver[0] = 'xt_sect_hall';
    const g1 = (C.npcs || []).find(n => n.name === '据点守卫'), g2 = (C.npcs || []).find(n => n.name === '天剑宗外门弟子');
    if (g1) { const [c, r] = P(868, 914); Object.assign(g1, { cx: 'disciple_m', name: '守门弟子', c, r, face: 'down', talk: ['天剑宗玄天据点。闲人勿近。', '少宗主？……失敬失敬！长老在正厅莲台上打坐，您里面请。'], random: true }); SPEAKERS['守门弟子'] = SPEAKERS['守门弟子'] || { p: '', color: '#cfe0ff' }; }
    if (g2) { const [c, r] = P(1052, 914); Object.assign(g2, { cx: 'disciple_m', name: '守门弟子', c, r, face: 'down', talk: ['长老脾气不太好，进去说话小心点。', '少宗主你也来历练？……听说你在测灵碑上把战力碑都打裂了？'], random: true }); }
  } catch (e) {}
  TMAPS.xt_sect_hall = { title: '天剑宗玄天据点 · 正厅', baked: Object.assign({ ground: 'r239g_hall' }, H), indoor: true, npcs: hallNpcs, chests: [], start: P(H.spawn[0], H.spawn[1] - 30),
    doors: [{ x: TOREST[0], y: TOREST[1], rw: 40, rh: 22, to: 'xt_sect_rest', at: P(D.rest.spawn[0], D.rest.spawn[1] - 40), face: 'up', label: '客舍' }],
    exits: [Object.assign(cell(H.exit, H.cs), { to: 'xt_city', at: GATE, face: 'down', label: '出门 · 玄天城' })] };

  // ---------------- 客舍 ----------------
  const R = D.rest, RS = R.slots, RI = R.inter;
  R.objs = R.objs.filter(o => !/south_entrance_frame/.test(o.img));   // 作者 11-13：屋子中间立着的那副门框太突兀，取消（出口还在原处，脚下有传送阵）
  const restNpcs = [
    man('waiter', RS.rest_keeper, '客舍杂役', async () => {
      await say('客舍杂役', '少宗主要歇一歇么？榻是现成的，被褥今早才晒过。');
      const k = await choose('客舍', ['歇一歇（气血、灵力回满）', '不必了']); if (k !== 0) return;
      try { if (typeof fadeOut === 'function') await fadeOut(350); if (typeof partyRevive === 'function') partyRevive(1); const h = S.hero; h.hp = h.maxhp; h.mp = h.maxmp; if (typeof fadeIn === 'function') await fadeIn(350); } catch (e) {}
      toast('气血、灵力回满', 1800); await say(XX, '（宗门的榻，睡着就是比客栈踏实。不要钱，更踏实。）'); }),
    man('disciple_m', RI.injured_disciple, '养伤的弟子', ['幽影林里撞上一头成了气候的妖狼……命是捡回来了，胳膊得养上半个月。', '少宗主若要出城，千万别一个人往林子深处走。'], { random: true }),
    man('disciple_f', RI.tea_disciple, '喝茶的弟子', ['这茶是执事从听雨楼捎回来的。他说那楼顶上撑着一把大伞，下雨天坐在露台上，一滴都淋不着。', '墙上那两个字是长老写的：戒躁。他自己倒是全据点脾气最急的一个。'], { random: true }),
    spot([222, 585], '蒲团', async () => { await say('', '三只蒲团对着窗，窗外一片竹影。是弟子们早晚打坐的地方。'); }),
  ];
  TMAPS.xt_sect_rest = { title: '天剑宗玄天据点 · 客舍', baked: Object.assign({ ground: 'r239g_rest' }, R), indoor: true, npcs: restNpcs, chests: [], doors: [], start: P(R.spawn[0], R.spawn[1] - 40),
    exits: [Object.assign(cell(R.exit, R.cs), { to: 'xt_sect_hall', at: P(TOREST[0] - 60, TOREST[1] - 10), face: 'left', label: '出门 · 正厅' })] };

  // ---------------- 玄天城：据点大门的传送阵 ----------------
  (TMAPS.xt_city.doors = TMAPS.xt_city.doors || []).push({ x: 960, y: 852, rw: 46, rh: 22, to: 'xt_sect_hall', at: P(H.spawn[0], H.spawn[1] - 30), face: 'up', label: '天剑宗据点' });
})();
