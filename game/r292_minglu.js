// ================= R292 · 主线案《名录》（作者 11-15 定稿第五版）=================
// 黑风寨之后、幽影林之前：主角团路过玄天城，清晨的云来客栈门口押出一个女子——是叶孤星在黑风寨放出来的散修苏绫。
// 巡城司捕头陆砚半夜死在云来天字二号房的浴室里。和推官顾长庚一起查：浴室五处、验尸、提审、杂役、听雨楼、黑市（打斗一）、地窖；
// 连夜回青阳：林府名单、悦来的夜里（打斗二）、刘独眼和账册；回玄天城：文书房借阅簿、大堂对质、暗室（打斗三 · 首领温既白）。
// 三层反转：苏绫是线人 → 刘独眼在等着勒索 → 「白先生」是一直帮你查案的老书办温既白。不写鬼怪、不给人放血；选错了只是多走一步，不会失败。
// 场景、人物现在先借现成的图（巡城司大堂借苍月城主府正堂……），Codex R288 / R289 / R290 交来再换。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_city || !window.SQ_DEFS || typeof ITEM_DB === 'undefined') return;
  const CITY = TMAPS.xt_city;
  const F = () => (S.flags = S.flags || {});
  const ID = 'ml_case';
  const st = () => ((F().sq = F().sq || {})[ID] = F().sq[ID] || { s: 0, n: 0 });
  const N = () => st().n, on = k => st().s === 1 && (k == null || st().n === k);
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const YE = '叶孤星', XX = '星旋', YT = '云霆', SU = '苏绫', GU = '顾长庚', WEN = '温既白', FENG = '老冯', LIU6 = '小六', HUA = '花婆', DU = '刘独眼', SZ = '司正', BK = '捕快', TEA = '听雨楼掌柜';
  try { for (const [n, c] of [[SU, '#bfe3d0'], [GU, '#9fb8d8'], [WEN, '#d8cfa8'], [FENG, '#c8c0b0'], [LIU6, '#d8c8a8'], [HUA, '#d8a8c8'], [DU, '#c8a088'], [SZ, '#e8b0a0'], [BK, '#b0c0d0'], ['黑袍人', '#a08ac0']]) SPEAKERS[n] = SPEAKERS[n] || { p: '', color: c }; } catch (e) {}
  const snd = k => { try { playSnd(k); } catch (e) {} };

  // ---------------- 证词本、物证 ----------------
  const note = t => { const f = F(); f.ml_notes = f.ml_notes || []; if (!f.ml_notes.includes(t)) { f.ml_notes.push(t); snd('ui_confirm'); toast('记入证词本：' + t, 2600); } };
  const ITEMS = {
    k_ml_letter: ['据点长老的担保信', '天剑宗玄天据点的担保信，盖着据点的印：「此二人奉宗门之命历练，所言所行，据点担保。」'],
    k_ml_ling: ['巡城司协查令', '推官顾长庚签发的协查令，一块乌木小牌，背面烙着「巡城司」三个字。拿着它，客栈、衙门、牢房都进得去。'],
    k_minglu_page: ['名录抄本一页', '从陆捕头拳头里取出来的一页散修名录抄本，揉得稀烂。第一行写着「苏绫」。'],
    k_minglu_book: ['发冠里的小册子', '陆捕头藏在发冠里的小册子：三年里失踪的二十七个散修，每个名字后面都有一个入城登记的日子。'],
    k_minglu_tag: ['花婆的牙牌', '一块磨得发亮的黄杨木牙牌，刻着「荐工」二字，穗子被扯断了。是小六在水柜铜扣上捡到的。'],
    k_minglu_paper: ['一张公文纸', '听雨楼掌柜留下的：「白先生」付账时包铜钱用的纸。纸是巡城司的公文纸，抬头印着淡淡的水纹。'],
    k_minglu_note: ['靴筒里的银票', '鱼七靴筒里的一张银票。票角压着半个红印：「……司文书……」。'],
    k_minglu_list: ['林府的名单', '林府管事誊的两张单子：一张是从黑风寨放回来的人，一张是「没找回来的」。'],
    k_minglu_ledger: ['黑风寨账册', '刘独眼带出来的山寨账册：卖出去的每一个人、每一笔钱。玄天城那头的代号是「白先生」，交货的地方写着「西北林中」。'],
    k_minglu_borrow: ['名录借阅簿', '文书房的名录借阅簿。「夜核名录」那几行，落款都是顾长庚。'],
  };
  for (const [id, [name, desc]] of Object.entries(ITEMS)) if (!ITEM_DB[id]) ITEM_DB[id] = { name, price: 0, desc, key: true };
  ITEM_DB.acc_zhaodan = ITEM_DB.acc_zhaodan || { name: '照胆镜', slot: 'acc', atk: 14, spd: 4, price: 0,
    desc: '巴掌大的青铜小镜，镜背刻一只睁开的眼。古话说照胆镜能照见人心里藏着什么。巡城司大堂上传了几代。【照胆】暴击 +10%；每场战斗开头看破敌人虚实。' };
  const give = async (id, title) => { addItem(id, 1); snd('ui_confirm'); const it = ITEM_DB[id];
    if (window.itemGet) await itemGet([{ icon: 'item:' + id, id, name: it.name, count: '×1', desc: it.desc }], title || '获得物证'); else toast('获得：' + it.name, 2200); };
  const hasIt = id => (S.hero.bag[id] || 0) > 0;

  // ---------------- 任务 ----------------
  const GOALS = [
    '云来客栈门口围了好多人——过去看看',
    '去天剑宗玄天据点，请据点长老写一封担保信',
    '拿着担保信去巡城司衙门（城西，钱家南边），找推官顾长庚',
    '去云来客栈二楼的天字二号房：浴室现场五处都看一遍',
    '回巡城司，到停尸房找仵作老冯验尸',
    '去巡城司牢房，提审苏绫',
    '回云来客栈大堂，找送热水的杂役小六',
    '拿着牙牌去听雨楼，问问掌柜',
    '入夜了：去城东南城墙边，找花婆家',
    '花婆说鱼七在地窖里——下去看看',
    '连夜赶回青阳镇，找林府管事要当初放回来的人的名单',
    '去青阳悦来客栈，问掌柜「王老客」住哪间',
    '上悦来客栈二楼，进最里面的天字三号房',
    '问问缩在床角的刘独眼',
    '回玄天城巡城司，问顾长庚：还有谁知道陆捕头住在云来',
    '去巡城司文书房，翻一翻卷宗架',
    '去巡城司大堂——司正坐堂，当众对质',
    '追进文书房底下的暗室',
    '回巡城司大堂，见司正',
  ];
  const Q = { id: ID, name: '名录', main: true, notesKey: 'ml_notes', giver: ['xt_city', GU], where: '玄天城 · 云来客栈门口', cond: () => false, type: 'kill', kill: { maps: ['__ml__'], mobs: ['__ml__'] }, n: 99, reward: { exp: 1500, gold: 1600 } };
  Object.defineProperty(Q, 'goal', { enumerable: true, get() { return GOALS[Math.min(GOALS.length - 1, N())]; } });
  Object.defineProperty(Q, 'desc', { enumerable: true, get() { return '巡城司捕头陆砚半夜死在云来客栈天字二号房的浴室里。被当成凶手押出来的散修苏绫，是你在黑风寨亲手放出来的人。巡城司推官顾长庚限明日午时前拿出东西，否则按苏绫结案。'; } });
  SQ_DEFS.push(Q);
  window.ML_ACTIVE = () => st().s === 1;
  const next = (n, msg) => { st().n = n; snd('ui_confirm'); toast('主线 · 名录　有新进展', 2200); };   /* 下一步写在右上任务栏（长提示会变成星旋说话，这里不用） */

  // ---------------- 地图（先借现成的图）----------------
  const copyView = (from, to) => { try { if (MAP_ZOOM[from] && !MAP_ZOOM[to]) MAP_ZOOM[to] = MAP_ZOOM[from]; if (typeof WIDE_OK === 'object' && WIDE_OK[from]) WIDE_OK[to] = 1; if (window.R252_WIN && R252_WIN[from]) R252_WIN[to] = R252_WIN[from]; } catch (e) {} };
  const freeAt = (T, x, y) => { const B = T && T.baked; if (!B || !B.blocked) return true; const c = Math.floor(x / B.cs), r = Math.floor(y / B.cs); if (c < 0 || r < 0 || c >= B.cols || r >= B.rows) return false; return B.blocked.charCodeAt(r * B.cols + c) === 48; };
  const near = (T, x, y) => { for (let d = 0; d <= 360; d += 12) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a * Math.PI / 8) * d, py = y + Math.sin(a * Math.PI / 8) * d; if (freeAt(T, px, py) && freeAt(T, px - 16, py) && freeAt(T, px + 16, py) && freeAt(T, px, py + 10)) return [Math.round(px), Math.round(py)]; } return [x, y]; };
  const sz = T => [(T.baked && T.baked.w) || 1600, (T.baked && T.baked.h) || 1000];
  const at = (T, fx, fy) => { const [w, h] = sz(T); return near(T, fx * w, fy * h); };
  const clone = (id, src, title) => { const T0 = TMAPS[src]; if (!T0) return null;
    const T = TMAPS[id] = Object.assign({}, T0, { title, npcs: [], chests: [], doors: [], onEnter: null, fog: false, petals: false, exits: (T0.exits || []).slice(0, 1).map(e => Object.assign({}, e, { cond: null, msg: '' })) });
    copyView(src, id); return T; };
  const startOf = T => T.start || P(...at(T, .5, .8));
  const door = (T, xy, to, label, cond, msg) => { (T.doors = T.doors || []).push({ x: xy[0] - 20, y: xy[1] - 8, rw: 40, rh: 16, to, at: startOf(TMAPS[to]), face: 'up', label, cond: cond || null, msg: msg || '' }); };
  const backTo = (T, to, xy, label) => { for (const e of T.exits) { e.to = to; e.at = P(xy[0], xy[1] + 48); e.face = 'down'; e.label = label; } };
  const add = (T, n) => { (T.npcs = T.npcs || []).push(n); return n; };
  const man = (T, cx, xy, name, talk, extra) => { const [c, r] = P(xy[0], xy[1]); return add(T, Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk }, extra || {})); };
  const spot = (T, xy, name, talk, extra) => { const [c, r] = P(xy[0], xy[1]); return add(T, Object.assign({ key: 'none', c, r, name, hidden: true, h: 110, talk }, extra || {})); };

  try { if (window.R283) for (const m of ['m_cy_council', 'm_cy_guest', 'lin_servants', 'm_cy_study', 'qy_changle_2f', 'xt_dyeyard', 'xt_wanbao_store', 'xt_city']) R283.apply(m); } catch (e) {}   // 借来的图先套上 R283 修好的碰撞
  const YA = clone('ml_yamen', 'm_cy_council', '巡城司 · 大堂'), MO = clone('ml_morgue', 'm_cy_guest', '巡城司 · 停尸房'), JA = clone('ml_jail', 'lin_servants', '巡城司 · 牢房'),
    AR = clone('ml_archive', 'm_cy_study', '巡城司 · 文书房'), AN = clone('ml_secret', 'qy_changle_2f', '巡城司 · 文书房暗室'),
    CE = clone('ml_cellar', 'xt_wanbao_store', '黑市 · 地窖');
  if (!YA || !MO || !JA || !AR || !AN || !CE) { console.warn('R292：缺借用的室内图'); return; }
  // 玄天城街上：巡城司（城西钱家南边那座空房）、黑市后巷口（城东南那座空房）
  const yaDoor = near(CITY, 557, 1730), alDoor = near(CITY, 3521, 2660);
  CITY.doors = CITY.doors || [];
  CITY.doors.push({ x: yaDoor[0] - 20, y: yaDoor[1] - 14, rw: 40, rh: 22, to: 'ml_yamen', at: startOf(YA), face: 'up', label: '巡城司', cond: () => st().s === 1 && N() >= 2 || st().s === 3, msg: '巡城司衙门。门口的衙役：「无事莫近。」' });
  // 作者 11-15：「黑市后巷夜景太难画，玄天城有那么多房子，直接把城里一条街变成夜里就好」——黑市就在城东南这条街上，入夜后街上压暗、挂灯；花婆的牙行是街边那间空房
  CITY.doors.push({ x: alDoor[0] - 20, y: alDoor[1] - 14, rw: 40, rh: 22, to: 'ml_cellar', at: startOf(CE), face: 'up', label: '地窖', cond: () => st().s === 1 && N() === 9, msg: '花婆家的门板关着。' });
  backTo(YA, 'xt_city', yaDoor, '出衙门 · 玄天城');
  // 衙门里：左停尸房、右牢房、后面文书房
  const dMo = at(YA, .14, .62), dJa = at(YA, .86, .62), dAr = at(YA, .8, .42);
  door(YA, dMo, 'ml_morgue', '停尸房'); door(YA, dJa, 'ml_jail', '牢房'); door(YA, dAr, 'ml_archive', '文书房', () => N() >= 14 || st().s === 3, '文书房的门锁着：「卷宗重地，闲人免进。」');
  backTo(MO, 'ml_yamen', dMo, '出门 · 巡城司大堂'); backTo(JA, 'ml_yamen', dJa, '出门 · 巡城司大堂'); backTo(AR, 'ml_yamen', dAr, '出门 · 巡城司大堂');
  backTo(AN, 'ml_archive', at(AR, .2, .35), '上石阶 · 文书房');
  backTo(CE, 'xt_city', alDoor, '上石阶 · 玄天城');

  // ---------------- 演出小工具 ----------------
  const busy = { v: false };
  const ready = () => !busy.v && world.player && !world.locked && !dialog && !choice && !S.menu && !sysPanel && S.fade === 0 && S.scene === drawMap && (!window.LOADING_SHOWN || LOADING_SHOWN() === 0);   // 载入画面还在时别开演（对话会被吞掉）
  const lock = async fn => { if (busy.v) return; busy.v = true; world.locked = true; try { await fn(); } catch (e) { console.warn('R292', e); } busy.v = false; world.locked = false; };
  const choose2 = async (title, opts) => { try { return await choose(title, opts); } catch (e) { return 0; } };
  // 回忆：Codex R289 的两段动画（浴室那一刀 10 秒、白先生交钱 7 秒，原生 1280×720，压成 mp4）；放不出来就退回字幕
  const playVid = src => new Promise(res => { let done = false, v = null, o = null, t0 = performance.now();
    let end = ok => { if (done) return; done = true; try { const i = S.overlay.indexOf(o); if (i >= 0) S.overlay.splice(i, 1); v && v.pause(); } catch (e) {} res(ok); };
    try { v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = src;
      o = { draw() { try { ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); if (v.readyState >= 2) { const sc = Math.min(W / 1280, H / 720), w = 1280 * sc, h = 720 * sc; ctx.drawImage(v, (W - w) / 2, (H - h) / 2, w, h); } ctx.restore(); } catch (e) {} } };
      S.overlay.push(o); v.onended = () => end(true); v.onerror = () => end(false); setTimeout(() => end(v.readyState >= 2), 16000);
      const p = v.play(); if (p && p.catch) p.catch(() => end(false));
      const skip = () => { if (performance.now() - t0 > 1500) end(true); }; cv.addEventListener('pointerdown', skip); const e0 = end; end = ok => { cv.removeEventListener('pointerdown', skip); e0(ok); }; } catch (e) { end(false); } });
  const memory = async (cap, lines, vid) => { await fadeOut(500); try { await caption(cap, 1800); } catch (e) {}
    let ok = false; if (vid) { const h0 = S.hud; S.hud = false; S.fade = 0; ok = await playVid(vid); S.hud = h0; S.fade = 1; }
    if (!ok) for (const t of lines) await narrate(t); await fadeIn(500); };
  // 验尸图：Codex R289 的黑金界面，四处圆点自己点（喉咙、手腕、指甲、发冠）
  const AUT = { im: null, pts: { guan: [250, 128], hou: [250, 202], wan: [326, 344], jia: [346, 373] } };
  { const im = new Image(); im.onload = () => { AUT.im = im; }; im.src = 'r296/autopsy.webp'; }
  const autopsy = (left, seen) => new Promise(res => { if (!AUT.im) return res(undefined);
    const sc = (H - 60) / 720, w = 500 * sc, x0 = (W - w) / 2, y0 = 30, pos = id => [x0 + AUT.pts[id][0] * sc, y0 + AUT.pts[id][1] * sc];
    const o = { draw() { try { const t = performance.now() / 1000; ctx.save(); ctx.fillStyle = 'rgba(6,6,10,.72)'; ctx.fillRect(0, 0, W, H); ctx.drawImage(AUT.im, x0, y0, w, 720 * sc);
      for (const id of Object.keys(AUT.pts)) { const [x, y] = pos(id), on = left.includes(id), r = (on ? 13 + Math.sin(t * 4) * 3 : 10) * sc * 1.4;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = on ? 'rgba(255,205,90,.35)' : 'rgba(150,140,120,.35)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = on ? '#ffd36a' : '#8a806c'; ctx.stroke(); }
      ctx.font = '600 20px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = '#f3e2b8'; ctx.fillText('点身上发亮的地方看一看（' + seen + ' / 4）　·　点框外不看了', W / 2, H - 8); ctx.restore(); } catch (e) {} } };
    let fin = false; const done = v => { if (fin) return; fin = true; cv.removeEventListener('pointerdown', onDown); const i = S.overlay.indexOf(o); if (i >= 0) S.overlay.splice(i, 1); setTimeout(() => { input.tapped = null; }, 0); res(v); };
    const onDown = e => { const t = toLogical(e);   // 直接听手指按下（不和别的界面抢 tapped）
      for (const id of left) { const [x, y] = pos(id); if (Math.hypot(t.x - x, t.y - y) < 30 * sc * 1.4) return done(id); }
      if (t.x < x0 || t.x > x0 + w) done(null); };
    S.overlay.push(o); cv.addEventListener('pointerdown', onDown); });
  let dark = null;   // 只剩一盏灯：屏幕压暗，人身边一圈亮
  const darkOn = () => { if (dark) return; dark = { t: 0, draw() { try { const p = world.player, z = VZ(), C = world.cam || { x: 0, y: 0 }, x = (p.x - C.x) * z, y = (p.y - 50 - C.y) * z, g = ctx.createRadialGradient(x, y, 40, x, y, 300);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.6, 'rgba(4,6,12,.72)'); g.addColorStop(1, 'rgba(2,3,8,.94)'); ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); } catch (e) {} } }; S.overlay.push(dark); };
  const darkOff = () => { if (!dark) return; const i = S.overlay.indexOf(dark); if (i >= 0) S.overlay.splice(i, 1); dark = null; };
  const fight = async cfg => { world.locked = true; await fadeOut(250); const p = startBattle(Object.assign({ cannotLose: true }, cfg)); await fadeIn(300); const r = await p; S.scene = drawMap; world.locked = false; return r; };
  const heiyi = (n, hp) => ({ name: n || '黑袍人', key: /刺客/.test(n || '') ? (has('e_r295_cike') ? 'e_r295_cike' : 'e_xiexiu') : (has('e_r295_heipao') ? 'e_r295_heipao' : 'e_xiexiu'), hp: hp || 520, maxhp: hp || 520, atk: 44, def: 12, spd: 13, h: 255, color: '#2a2030', xie: true });
  const wenBoss = () => ({ name: '温既白', key: has('e_wenjibai') ? 'e_wenjibai' : 'e_xxboss', hp: 3400, maxhp: 3400, atk: 62, def: 18, spd: 13, h: 290, color: '#2a2030', fxColor: '#9a70ff', boss: true, xie: true, slot: [300, 610],
    ai: async (e, b) => { e.turn = (e.turn || 0) + 1;
      if (e.hp < e.maxhp * .5 && !e.p2) { e.p2 = true; await say(WEN, '二十七个名字……再添两个，又何妨。'); floatText(e.x, e.y - e.h - 30, '名录锁魂', '#c09aff', 54, 1.2, BRUSH); e.atk += 10; snd('sfx_ult'); S.shake = 12; await sleep(700); return true; }
      if (e.turn % 3 === 0 && typeof enemyAoE === 'function') return enemyAoE(e, '黑链缚名', 'fx3_burst_violet', .75, '#c09aff');
      return false; } });

  // 照胆镜：暴击 +10%；战斗开头看破虚实
  const zd = () => { try { return S.hero.equip && S.hero.equip.acc === 'acc_zhaodan'; } catch (e) { return false; } };
  if (typeof dmgCalc === 'function') dmgCalc = (o => function (att, def, mult, cr) { if (cr == null) cr = .15; if (att && att.side === 'hero' && att.name === '叶孤星' && zd()) cr += .1; return o.call(this, att, def, mult, cr); })(dmgCalc);
  if (typeof startBattle === 'function') startBattle = (o => function (cfg) { const p = o.apply(this, arguments);
    if (zd()) setTimeout(() => { try { for (const e of battle.enemies) floatText(e.x, e.y - e.h - 20, '照胆 · 气血 ' + e.hp, '#ffe39a', 30, 1.4); } catch (e) {} }, 500); return p; })(startBattle);

  // ---------------- 改别人身上的话 ----------------
  const dflt = async (orig, n, a, self) => { if (typeof orig === 'function') return orig.call(self, a); const A = Array.isArray(orig) ? orig : [orig || '……']; for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(n.name, l); };
  const hooks = [];
  const hook = (name, fn) => hooks.push([name, fn]);
  const applyHooks = () => { for (const m of Object.keys(TMAPS)) for (const n of (TMAPS[m] && TMAPS[m].npcs) || []) for (const [name, fn] of hooks) {
    if (n.name !== name || (n._ml || []).includes(name)) continue; (n._ml = n._ml || []).push(name); const orig = n.talk;
    n.talk = async function (a) { if (await fn(a, n)) return; return dflt(orig, n, a, this); }; } };

  // ================= 上 · 玄天城 =================
  // 一、清晨的云来
  const scene1 = () => lock(async () => {
    await fadeOut(400); try { await caption('清晨 · 云来客栈门口', 1800); } catch (e) {} await fadeIn(400);
    await L([['', '客栈门口围了一圈人。两个捕快推着一个女子出来，她双手反绑，一身素青布衣，发髻上只插着一根木簪。'],
      ['', '人群里有人在嚷：「就是她！半夜在楼上转悠，陆捕头就死了！」'],
      ['', '女子被推得一个踉跄，抬头的时候正好看见了叶孤星。她愣了一下，突然挣着喊出来——'],
      [SU, '恩人！是你——黑风寨的恩人！我没有杀人！'],
      [YE, '（……是她。黑风寨寨门口那群被押着的人里，扶着老人的那个姑娘。叫苏……苏绫。）'],
      [XX, '（小子，看她的手。练气修为，割不出那么利落的一刀。）'],
      ['', '一个穿深青官袍的中年人拨开人群，挡在叶孤星面前，腰上的铜牌晃了一下。'],
      [GU, '巡城司推官顾长庚。巡城司办案，闲人退下。'],
      [YE, '她说她没杀人。'], [GU, '人人都这么说。'], [YT, '……孤星。'],
      [YE, '我们不走。大人要证据，我们帮你找。'],
      [GU, '（上下打量）天剑宗的？巡城司不收来路不明的帮手。想插手，拿你们据点的担保信来。'],
      ['', '顾长庚一摆手，捕快押着苏绫往城西去了。苏绫回头看了一眼，没再说话。'],
      [XX, '（本来要去苍月城看看林雪那丫头，路过这儿就撞上了。……行，先把这件事了了，再上路。）']]);
    note('苏绫被当成凶手押走——她是黑风寨放出来的人，练气修为，割不出那一刀'); next(1);
  });

  // 二、讨协查令
  hook('据点长老', async () => { if (!on(1)) return false;
    await L([[YE, '长老，我想请据点写一封担保信。巡城司在办一桩案子，被冤枉的是我在黑风寨救出来的人。'],
      ['据点长老', '巡城司的案子？……顾长庚那个人，古板是古板，倒还算干净。'], ['据点长老', '（提笔写了几行，盖上据点的印）拿去。宗门弟子在外，路见不平，本就该管一管。只是记着，官府的规矩，比山里的规矩多。']]);
    await give('k_ml_letter', '获得'); next(2); return true; });
  const yaGu = man(YA, 'town_guard', at(YA, .42, .5), GU, async () => {
    const n = N();
    if (on(2)) {
      await L([[GU, '（看完担保信，眉头没松）天剑宗……好大的面子。'], [GU, '巡城司办案，最怕的就是江湖人插手。插完了手，人走了，烂摊子是衙门收。'],
        ['', '旁边一个穿旧蓝布直裰、耳后夹着一支笔的老书办笑呵呵地凑过来。'],
        [WEN, '顾大人，天剑宗的担保信，司里这些年也没见过几封。陆捕头是咱们的人，多一双眼睛，总不是坏事。'],
        [GU, '……温书办都这么说了。'], [WEN, '老朽温既白，管文书的。二位要调什么卷宗，尽管来找我。'],
        [GU, '（扔过来一块乌木牌）协查令。明日午时前拿不出东西，就按苏绫结案。现场在云来天字二号房，我叫人守着。']]);
      await give('k_ml_ling', '获得'); next(3); return; }
    if (n === 3) return say(GU, '现场在云来客栈二楼天字二号房。看仔细些，别碰乱了东西。');
    if (n === 4 || n === 5) return say(GU, n === 4 ? '尸身在停尸房，老冯在那儿。' : '要提审苏绫，牢房在右手边。');
    if (n === 14) {
      await L([[YE, '顾大人，陆捕头住在云来——这件事，还有谁知道？'], [GU, '没人知道。他谁也没告诉。'],
        [YE, '苏绫说，陆捕头只告诉了顾大人一个人。'], ['', '顾长庚的脸一下子白了。他张了张嘴，半天才出声。'],
        [GU, '……那天我去文书房调名录，随口提了一句：「陆砚这几日住在云来，有事去那儿找他。」'],
        [GU, '屋里只有……只有温书办在。可他在衙门三十年了，谁都信得过他。'],
        [XX, '（三十年。三年前散修开始失踪，他已经在这儿二十七年了。小子，去文书房看看。）']]);
      note('顾长庚只在文书房对温既白提过陆砚住在云来'); next(15); return; }
    if (n >= 15 && n <= 16) return say(GU, '……文书房的钥匙在这儿，你们去吧。我脑子乱得很。');
    if (st().s === 3) return say(GU, '（抱拳）前日多有得罪。');
    return say(GU, '巡城司办案，有话快说。');
  }, { cond: () => !(N() === 16) });
  man(YA, 'scribe', at(YA, .58, .46), WEN, async () => {
    const n = N();
    if (n < 3) return say(WEN, '二位莫怪，顾大人就是这个脾气。');
    if (n <= 9) return L([[WEN, '查得怎么样？陆捕头是个好人，三十岁了还没娶亲，一心扑在案子上。'], [WEN, '有什么要老朽帮忙的，尽管说。']]);
    if (n <= 13) return say(WEN, '青阳那边可有收获？快马跑得还顺吧？');
    return say(WEN, '二位辛苦。老朽在文书房候着，要什么卷宗都有。');
  }, { cond: () => st().s === 1 && N() < 16 });

  const HALL = TMAPS.xt_inn_hall;
  // 拿到协查令以后，云来楼梯口的城卫放行（R217 原来只认「天字三号房」那条支线）
  const caseUp = () => st().s === 3 || (st().s === 1 && N() >= 3);
  if (HALL) { for (const e of HALL.exits || []) if (e.to === 'xt_inn_corr') { const c0 = e.cond; e.cond = () => caseUp() || (typeof c0 === 'function' ? c0() : true); }
    for (const n of HALL.npcs || []) if (n.name === '守楼梯的城卫') { const c0 = n.cond; n.cond = () => !caseUp() && (typeof c0 === 'function' ? c0() : true); } }
  // 三、浴室现场（云来天字二号房，R274 那间双人房的卫浴）
  const R2 = TMAPS.xt_inn_room2;
  const seen = k => { const f = F(); f.ml_seen = f.ml_seen || {}; if (f.ml_seen[k]) return false; f.ml_seen[k] = 1; return true; };
  const count = async () => { const n = Object.keys(F().ml_seen || {}).length; if (!on(3)) return; if (n < 5) { toast('浴室现场　' + n + ' / 5', 1800); return; }
    await memory('回忆 · 三更', ['三更。浴室里全是热气。屏风后，陆砚靠在浴桶里，闭着眼。', '角落那只大水柜——水面动了一下，又静了。', '一根手指，慢慢抬起了柜盖。',
      '灯芯「啪」地爆了一声。', '黑影破水而出——一刀。', '屏风上溅开一片红。水里的人拼命抬起手，抓下了一页纸。', '……水面慢慢平了下去。'], 'r296/ml_bath.mp4');
    await L([[XX, '（凶手在水柜里伏了不知多久，出来的时候连水声都没有。会闭气功夫的刺客——练气境的姑娘可做不到。）'], [YE, '尸身在巡城司。去看看。']]);
    next(4); };
  if (R2) {
    const look = (k, xy, name, lines, nt, fn) => spot(R2, xy, name, async () => { if (!on(3)) { if (N() < 3) await say('', '门口站着个捕快：「巡城司办案，闲人勿入。」'); return; } await L(lines); if (fn) await fn(); if (seen(k)) { note(nt); await count(); } }, { cond: () => st().s === 1 && N() <= 3 });
    look('tong', [1263, 470], '浴桶', [['', '浴桶里的水已经凉透了。人还歪在桶里，只露出肩膀以上，喉咙上一道刀口。'], [XX, '（一刀。从身后往前，干净利落。）']], '陆砚死在浴桶里，喉咙一刀，从身后往前');
    look('gui', [1420, 760], '浴室角落的大水柜', [['', '一人多高的大水柜，木身铜箍。柜盖没盖严，露出一道缝。'], ['', '柜壁内侧有一排抓痕，缝里卡着一片指甲大的黑鳞——不是鱼鳞，是一种水靠上缝的东西。'], [YE, '有人在里面待过。']], '大水柜的盖子没盖严，柜壁有抓痕，卡着一片黑鳞');
    look('ping', [1176, 760], '屏风', [['', '屏风上溅着一大片红，是喷上去的，不是抹上去的。'], [XX, '（人是在浴桶里被杀的，那时候他坐着，背对着水柜。）']], '屏风上的血是喷上去的——人背对着水柜被杀');
    look('jiao', [1330, 790], '地上的湿脚印', [['', '地上一串湿脚印，从水柜一直走到浴室顶上的小天窗底下，就断了。'], [YE, '从水柜出来，从天窗走。根本没下过楼。']], '一串湿脚印从水柜走到天窗下——凶手没下楼');
    look('quan', [1100, 470], '死者的拳头', [['', '死者的右拳攥得死紧。捕快帮着掰开，里面是揉烂的一页纸——散修名录的抄本。'], ['', '第一行，写着「苏绫」。'], ['守门的捕快', '顾大人说了，这不就是证据？'], [YE, '是证据。只是不知道是谁的证据。']], '死者拳里攥着一页名录抄本，第一行就是「苏绫」',
      async () => { if (!hasIt('k_minglu_page')) await give('k_minglu_page'); });
  }

  // 四、验尸（停尸房）
  man(MO, 'groundskeeper', at(MO, .42, .48), FENG, async () => {
    if (!on(4)) return say(FENG, N() < 4 ? '活人少来这儿。' : '人死了，话都在身上。你听过一遍，就别再来打扰他了。');
    await L([['', '屋里只有一盏油灯。老冯一边哼着小曲，一边揭开白布。'], [FENG, '推官让你们看，那就看吧。不过我不替你们看——你们自己指，我告诉你们是什么。']]);
    const f = F(); f.ml_body = f.ml_body || {};
    const parts = [['hou', '喉咙', [[FENG, '薄刃，极薄。从身后往前一拉，一刀就断了气。是个用刀的老手。']], '喉咙上的刀口：极薄的刃，从身后往前'],
      ['wan', '手腕', [[FENG, '干干净净，一道挡过的伤都没有。他连抬手都没来得及——是突然出手的。']], '手腕上没有挡过的伤——是突然出手'],
      ['jia', '指甲缝', [[FENG, '（用小镊子夹出一点东西）黑的，薄片儿。……跟你们说的水柜里那片，一样。'], [XX, '（他死前抓过凶手。抓下来的是水靠上的鳞片。）']], '指甲缝里的黑鳞和水柜里的一样'],
      ['guan', '发冠', [[FENG, '发冠里头有东西。（拔出发簪，一本巴掌大的小册子滑了出来）'], ['', '音乐停了。'], ['', '小册子里一页一页，全是名字。三年里失踪的二十七个散修，每个名字后面，都有一个入城登记的日子。'], [YE, '……他不是来客栈避人的。他是在查这个。']], '陆砚发冠里藏着小册子：三年失踪的二十七个散修，名字后面都有入城登记的日子']];
    for (;;) { const left = parts.filter(p => !f.ml_body[p[0]]); if (!left.length) break;
      let p; const pick = await autopsy(left.map(q => q[0]), 4 - left.length);
      if (pick === undefined) { const k = await choose2('验尸图　·　点一处看（' + (4 - left.length) + ' / 4）', left.map(q => q[1]).concat(['先不看了'])); if (k < 0 || k >= left.length) return; p = left[k]; }
      else { if (!pick) return; p = left.find(q => q[0] === pick); } f.ml_body[p[0]] = 1; await L(p[2]); note(p[3]); if (p[0] === 'guan' && !hasIt('k_minglu_book')) await give('k_minglu_book'); }
    await L([[FENG, '（盖上白布）就这些了。剩下的，问活人去。'], [XX, '（苏绫在牢里。她撒没撒谎，一问便知。）']]); next(5);
  });

  // 五、提审苏绫（牢房）
  man(JA, 'prisoner', at(JA, .5, .42), SU, async () => {
    const n = N();
    if (n < 5) return say(SU, '恩人……');
    if (n === 5) {
      await L([[SU, '恩人，我真的没有杀人。'], [YE, '那天夜里，你去云来做什么？'], [SU, '……陆捕头欠我工钱。我去找他讨。']]);
      const k = await choose2('提审苏绫', ['（拿出发冠里的小册子）', '「讨工钱，要半夜去？」', '先不问了']);
      if (k === 2) return;
      if (k === 1) { await L([[SU, '……白天他不在。'], [XX, '（她在躲。小子，拿陆砚自己藏的东西给她看。）']]); return; }
      await L([['', '苏绫看见小册子，眼圈一下就红了。'], [SU, '他……他把这个藏在头发里？'], [SU, '我不是去讨工钱的。从黑风寨回来以后，我一直替陆捕头打听——他在查城里失踪的散修。'],
        [SU, '黑风寨的二当家刘独眼没死。他手里有山寨的账册，上面记着卖出去的每一个人。我告诉了陆捕头，他说有人盯着他，不敢回家，就住进了云来。'],
        [SU, '他说这件事，他只告诉了顾大人一个人。'], [SU, '那天二更我下楼，看见送热水的杂役蹲在水柜边上，鬼鬼祟祟的。'], [YE, '为什么不早说？'], [SU, '……我怕那伙穿黑袍的人知道我是线人，再来抓我。']]);
      note('苏绫是陆砚的线人：刘独眼没死，账册在他手里'); note('苏绫：陆捕头住云来的事，只告诉了顾大人'); note('苏绫：那晚二更看见送水的杂役在水柜边');
      next(6); return; }
    if (n >= 6 && n < 18) return say(SU, '恩人，小心那些穿黑袍的人。');
    return say(SU, '谢谢你们。');
  }, { cond: () => st().s === 1 });

  // 六、杂役小六（云来大堂）
  if (HALL) man(HALL, 'kitchen_helper', near(HALL, 640, 760), LIU6, async () => {
    if (!on(6)) return say(LIU6, N() > 6 ? '我、我都说了……' : '客官要热水？我这就去烧。');
    await L([[YE, '天字二号房浴室里那只大水柜，平时锁不锁？'], [LIU6, '锁、锁的！一向锁着，我每天晚上都锁。']]);
    const k = await choose2('问小六', ['（拿出苏绫的话）「二更天，有人看见你蹲在水柜边。」', '「那锁呢？」', '先不问了']);
    if (k === 2) return;
    if (k === 1) { await L([['', '锁好好地挂在柜扣上。锁眼干干净净，一点撬过的划痕都没有。'], [XX, '（锁没被撬。那就是根本没锁上——或者有人开了。小子，拿苏绫的话压他。）']]); return; }
    await L([[LIU6, '……'], [YE, '锁眼没被撬过。水柜那晚根本没锁。'], ['', '小六腿一软，差点跪下。'],
      [LIU6, '客官饶命！有人给了我二两银子，叫我那天晚上别锁水柜……我、我以为他是要偷水柜里存的酒……'],
      [LIU6, '那人戴着斗笠，看不清脸。腰上挂着一块牙牌，走的时候穗子勾在水柜铜扣上，扯断了。我捡起来了，一直不敢拿出来……'],
      [XX, '（牙牌上刻着「荐工」。这是牙行的东西。玄天城里谁消息最灵？去听雨楼问问。）']]);
    await give('k_minglu_tag'); note('小六收了二两银子没锁水柜，给钱的人挂着一块「荐工」牙牌'); next(7);
  }, { cond: () => st().s === 1 && N() >= 3 });

  // 七、听雨楼掌柜（卖丝绸，也卖消息）
  hook(TEA, async () => { if (!on(7)) return false;
    await L([[YE, '掌柜的，这块牙牌，你认得吗？'], [TEA, '（团扇停了一下）……客官从哪儿得来的？'], [TEA, '黄杨木、「荐工」二字——这是黑市花婆的牙牌。城东南后巷里的牙婆，替人介绍活计，什么活都介绍。'],
      [TEA, '我再送客官一句：花婆每月初一来我二楼包间，见一位从不露脸的「白先生」。那人付账，铜钱总拿一张纸包着。'], [TEA, '我留了一张。（从柜里取出一张折好的纸）']]);
    await give('k_minglu_paper'); await L([[XX, '（这纸……抬头的水纹，是衙门的公文纸。）'], [YE, '天黑了，去黑市。']]);
    note('听雨楼掌柜：牙牌是黑市花婆的；「白先生」每月初一包雅间见花婆，铜钱用公文纸包'); next(8); return true; });

  // 八、夜探黑市（打斗一）
  spot(CITY, [alDoor[0] + 70, alDoor[1] + 10], '花婆家', async () => {
    if (!on(8)) return say('', N() > 8 ? '花婆家的门板钉死了。' : '一户关着门的人家，门边挂着一块小木牌：「荐工」。');
    await lock(async () => {
      await L([['', '花婆家门口蹲着个人，看见你们，嘴里一声尖哨。'], ['', '屋顶上一下子落下三个黑袍人，兜帽遮脸，面巾蒙口。'], [XX, '（看不出门派。……身上的气，阴得很。）']]);
      await fight({ title: '黑市 · 花婆家门口', bg: 'bg_night', enemies: [heiyi(), heiyi('黑袍人', 600), heiyi()], exp: 360, gold: 260 });
      await L([['', '黑袍人翻过屋脊跑了。屋里一个矮胖的老婆子缩在方桌后头，满手镯子叮叮当当地抖。'],
        [HUA, '哎哟……老婆子只替人说媒、荐工，别的什么都不知道啊！'], [YE, '（亮出牙牌）你的牙牌，挂在云来客栈的水柜上。'], [HUA, '……'],
        [HUA, '我说，我说。雇那个刺客鱼七的，是一位「白先生」。老婆子从没见过他的脸，只认得他的声音。'],
        [HUA, '还有……黑风寨那个刘独眼，托我给白先生带过话，要一万灵石换一本账册。他人躲在青阳镇的悦来客栈。'],
        [HUA, '昨天夜里，已经有一个穿黑袍的出城往青阳去了。'], [HUA, '鱼七？他……他在里屋床边那块石板底下，地窖里。你们自己去看吧。']]);
      note('花婆：雇刺客鱼七的是「白先生」，她只认得声音'); note('花婆：刘独眼要一万灵石换账册，人在青阳悦来；昨夜有黑袍人去了青阳');
      next(9); });
  }, { cond: () => st().s === 1 });
  // 九、地窖
  spot(CE, at(CE, .5, .4), '晃动的人影', async () => {
    if (!on(9)) return;
    await lock(async () => {
      darkOn();
      await L([['', '举着火折往下走。台阶上有水渍，越往下越潮。'], ['', '地窖尽头，有个人影在轻轻地晃。'], ['', '火光一照——'],
        ['', '一个穿黑色水靠的人倒吊在铁钩上，湿发贴着脸。右手的袖子空了一截。'], [XX, '（……鱼七。人刚死不久。灭口。）'],
        ['', '靴筒里露出一角纸。是一张银票，票角压着半个红印——「……司文书……」']]);
      darkOff(); await give('k_minglu_note'); note('鱼七被灭口，靴筒里的银票压着半个印：「……司文书……」');
      await L([[YE, '有人去青阳杀刘独眼了。'], [YT, '连夜走。'], ['', '出后巷的时候，一个捕快牵着一匹快马等在巷口。'],
        [BK, '温书办吩咐的：二位要是出城，骑这匹，快。'], [XX, '（……他怎么知道我们要出城？）']]);
      next(10);
      await fadeOut(500); try { await caption('连夜 · 青阳镇', 1800); } catch (e) {}
      const T = TMAPS.qy_town, d = (T.npcs || []).find(n => n.name === '林府管事'); tileSetMap('qy_town', d ? d.c : 21, d ? d.r + 1.4 : 14.4, 'up'); S.scene = drawMap; await fadeIn(500);
    });
  }, { cond: () => st().s === 1 });

  // ================= 中 · 青阳镇 =================
  hook('林府管事', async () => { if (!on(10)) return false;
    await L([['林府管事', '叶公子？这么晚了……'], [YE, '当初从黑风寨放回来的人，林府记过名单吗？'], ['林府管事', '记了。老爷吩咐的，一个一个都登了册。还有一张……没找回来的。'],
      ['', '两张单子，一张长，一张短。叶孤星把陆砚的小册子摊开，和那张短的一行一行对。'],
      [XX, '（青阳没找回来的，和玄天城失踪的散修……日子挨着日子。送去的是同一个地方。）']]);
    await give('k_minglu_list'); note('林府名单：青阳没找回来的人，和玄天城失踪的散修送去了同一个地方'); next(11); return true; });
  hook('客栈掌柜', async () => { if (!on(11)) return false;
    await L([[YE, '掌柜的，楼上住着一位王老客？'], ['客栈掌柜', '王老客？没有没有，小店没有这么个人。']]);
    const k = await choose2('问悦来掌柜', ['（亮出巡城司协查令）', '先不问了']); if (k !== 0) return true;
    await L([['客栈掌柜', '（看见那块乌木牌，脸色一变）……巡城司的？'], ['客栈掌柜', '我、我也是收了人家的钱……他说他是卖布的，躲仇家。楼上最里头那间，天字三号。'], ['客栈掌柜', '客官，楼上的灯……刚才全灭了。']]);
    note('悦来掌柜收了钱替「王老客」瞒着：人在楼上天字三号'); next(12); return true; });
  // 十二、悦来的夜里（打斗二）
  const S3 = TMAPS.qy_inn_s3;
  const night = () => lock(async () => {
    darkOn();
    await L([['', '屋里没点灯，只有滴水声。一滴，又一滴。'], ['', '床角缩着一个精瘦的人，左眼蒙着黑布，抖得像筛糠。他看见你们，没出声，只用口型说了三个字——'], ['', '「他　在　这。」'],
      [XX, '（那个黑袍人已经在屋里了。小子，举灯，一处一处照。）']]);
    const places = ['床底', '衣柜', '房梁', '浴桶'], tried = [];
    for (;;) {
      const left = places.filter(p => !tried.includes(p));
      const k = await choose2('他藏在哪？（每照一处，心跳就响一点）', left); const p = left[Math.max(0, k)];
      if (p === '浴桶') {
        await L([['', '叶孤星盯着那只浴桶。水面太平了——平得不像有人用过。'], [YE, '（鱼七的水柜……）'], ['', '一剑刺下去——水里猛地翻起一个黑影！']]);
        darkOff(); await fight({ title: '悦来客栈 · 天字三号', bgmLib: 'battle_case', bg: 'bg_night', enemies: [Object.assign(heiyi('黑袍刺客', 900), { atk: 50, spd: 15, hp: 640 })], exp: 420, gold: 300 });
        break; }
      tried.push(p);
      await say('', { 床底: '灯伸到床底下——只有一双落了灰的鞋。', 衣柜: '拉开衣柜——几件挂着的旧衣裳，空的。', 房梁: '灯举起来照房梁——什么也没有。' }[p]);
      if (tried.length >= 2) {
        await L([['', '身后的浴桶里，「哗」的一声——'], ['', '一个黑影破水而出，短刃直取后心！'], [YT, '孤星——！']]);
        darkOff(); S.hero.hp = Math.max(1, Math.round(S.hero.hp * .7));
        await fight({ title: '悦来客栈 · 天字三号（被偷袭）', bgmLib: 'battle_case', bg: 'bg_night', enemies: [Object.assign(heiyi('黑袍刺客', 900), { atk: 54, spd: 16 })], exp: 420, gold: 300 });
        break; }
    }
    darkOff();
    await L([['', '黑袍刺客撞碎了窗子，翻上屋顶跑了。屋里只剩下刘独眼粗重的喘气声。'], [XX, '（这一回，又是水里藏人。）']]);
    next(13);
  });
  if (S3) {
    updateMap = (o => function (dt) { const r = o.apply(this, arguments); if (world.mapName === 'qy_inn_s3' && on(12) && ready()) night(); return r; })(updateMap);
    man(S3, 'bandit', near(S3, 300, 380), DU, async () => {
      if (N() < 13) return;
      if (on(13)) {
        await L([[DU, '我……我就是个卖布的，姓王，叫我王老客就行……'], [YE, '卖布的，左眼蒙着黑布，袖口一道刀疤？']]);
        const k = await choose2('问刘独眼', ['（拿出林府的名单）', '先不问了']); if (k !== 0) return;
        await L([['', '刘独眼看见名单上那一个个名字，脸上的血色一点点退了下去。'], [DU, '……躲不过了。'], [DU, '账册给你们。保我一条命。'],
          ['', '他从床板底下抽出一本油布包着的账册。账上记着卖出去的每一个人、每一笔钱，玄天城那头只有一个代号：「白先生」。'],
          ['', '「白先生」的每一笔，都写在巡城司的公文纸上。交货的地方只写了四个字：「西北林中」。'],
          [DU, '白先生我没见过脸，可我听过他的声音。再听见，我认得。']]);
        await give('k_minglu_ledger'); note('黑风寨账册：「白先生」的每一笔都写在巡城司公文纸上，交货地「西北林中」'); note('刘独眼听过「白先生」的声音，再听见认得');
        await L([['', '林府护卫押着刘独眼走出悦来的时候，天已经蒙蒙亮了。'], ['', '王婆婆正在门口扫地。她看清了那张脸，扔下扫帚就冲了上来，哭得说不出一句话。'],
          [YE, '（她孙子，也是被黑风寨抓走的。）'], [YT, '回玄天城。'], [XX, '（这一回，该那位「白先生」睡不着了。）']]);
        next(14);
        await fadeOut(500); try { await caption('回玄天城', 1600); } catch (e) {} tileSetMap('ml_yamen', ...startOf(YA), 'up'); S.scene = drawMap; await fadeIn(500); return; }
      return say(DU, '……我都交代了。');
    }, { cond: () => st().s === 1 && N() >= 12 && N() <= 13 });
  }

  // ================= 下 · 玄天城 =================
  // 十五、文书房的借阅簿
  spot(AR, at(AR, .55, .4), '卷宗架', async () => {
    if (!on(15)) return say('', '一排排卷宗架，按年份码得整整齐齐。');
    await lock(async () => {
      await L([['', '卷宗架按年份码得整整齐齐。最底下一格，压着一本名录借阅簿。'], ['', '「夜核名录」的那几行，落款都是同一个名字——顾长庚。'],
        [XX, '（每一次「夜核名录」的日子……小子，对一对陆砚的小册子。）'], ['', '每一次，都是小册子上有人失踪的前一夜。']]);
      await give('k_minglu_borrow'); note('借阅簿：每次「夜核名录」都在有人失踪的前一夜，落款写着顾长庚');
      await L([['', '刚合上簿子，门外一阵脚步。几个捕快冲了进来。'], [BK, '温书办在顾推官的案头搜出了一沓名录抄本！顾推官已经拿下了，司正大人升堂！'],
        [XX, '（……来得真巧。）']]);
      next(16); });
  }, { cond: () => st().s === 1 && N() >= 14 });
  // 十六、大堂对质
  const ROUNDS = [
    { claim: '顾推官的案头搜出了名录抄本。抄本、借阅簿，都是他的笔迹——人证物证俱在。', right: 'k_minglu_note', back: '印信谁都能盗。文书房的印，衙门里哪个书办摸不着？',
      say: [[YE, '鱼七靴筒里的银票，票角压着半个印：「……司文书……」。雇凶的钱，是从文书房出去的。']] },
    { claim: '印信谁都能盗。文书房的印，衙门里哪个书办摸不着？', right: 'k_minglu_ledger', back: '公文纸一衙门的人都在用，这又能说明什么？',
      say: [[YE, '黑风寨的账册上，「白先生」的每一笔都写在巡城司的公文纸上。听雨楼掌柜也留着一张——白先生付账，铜钱就拿它包着。']] },
    { claim: '公文纸一衙门的人都在用，这又能说明什么？', right: 'k_minglu_borrow', back: '落款写得清清楚楚，「顾长庚」三个字，还要怎样？',
      say: [[YE, '借阅簿上，每一次「夜核名录」，都是小册子上有人失踪的前一夜。落款写着顾长庚——可这笔迹，和死者拳里那页名录一模一样。'], [YE, '那页名录，是文书房抄的。']] },
  ];
  man(YA, 'library_elder', at(YA, .5, .3), SZ, async () => {
    if (on(16)) return lock(async () => {
      await L([['', '大堂上，司正端坐，两旁衙役站定。顾长庚被押在堂下，温既白站在一旁，手里捧着那沓抄本。'], [SZ, '顾长庚，你还有什么话说？'], [GU, '……我没有。'], [YE, '大人，我替顾推官辩。']]);
      for (const R of ROUNDS) {
        await say(WEN, R.claim);
        for (;;) {
          const ids = Object.keys(ITEMS).filter(id => hasIt(id) && /^k_minglu_/.test(id));
          const k = await choose2('从证词本里拿出……', ids.map(id => ITEM_DB[id].name)); const id = ids[Math.max(0, k)];
          if (id === R.right) { await L(R.say); break; }
          await L([[WEN, '（笑了笑）' + ITEM_DB[id].name + '？这跟顾推官有什么相干。'], [XX, '（这堵不住他的嘴。小子，听清他刚才那句话，再挑。）']]);
        }
      }
      await L([[WEN, '……落款写得清清楚楚，「顾长庚」三个字，还要怎样？'], [YE, '大人，把刘独眼带上来。'],
        ['', '刘独眼被护卫押上堂。温既白还在说着什么，刘独眼突然浑身一抖，指着他叫了起来——'], [DU, '就是这个声音！']]);
      await memory('回忆 · 黑市', ['花婆的小铺里，昏暗。一只手把一包用公文纸包着的铜钱推过桌面。', '这一回，镜头转了过来。', '——是温既白的脸。'], 'r296/ml_money.mp4');
      await L([[WEN, '（笑了一下）可惜，晚了。'], ['', '温既白身上猛地腾起一股黑气，袍子被撑得鼓起来，一把撞开了文书房的暗门！'], [SZ, '拿下他！'], [YE, '追！']]);
      note('大堂对质：刘独眼认出了温既白的声音——他就是「白先生」'); next(17);
      tileSetMap('ml_secret', ...startOf(AN), 'up'); S.scene = drawMap; });
    if (on(18)) return lock(async () => {
      await L([[SZ, '这桩案子，多亏二位仗义。'], ['', '苏绫放了出来，顾长庚的枷也卸了。刘独眼和花婆收监。'], [GU, '（没说谢，只抱拳行了个礼）前日多有得罪。'],
        [SU, '（攥着陆砚的小册子）上面这些人，我一个一个去找他们的家里人。'],
        [SZ, '司里没什么好东西。这面镜子跟了衙门几十年，请收下。']]);
      const s = st(); s.s = 3; s.n = 18; F().ml_done = 1;
      const h = S.hero, lv0 = h.lv; addItem('acc_zhaodan', 1); h.gold = (h.gold || 0) + Q.reward.gold; snd('jingle_win');
      if (window.itemGet) await itemGet([{ icon: 'item:acc_zhaodan', id: 'acc_zhaodan', name: '照胆镜', count: '×1', desc: ITEM_DB.acc_zhaodan.desc }, { icon: 'gold', name: '灵石', count: '×' + Q.reward.gold }], '主线 · 名录　结案');
      const ups = typeof gainExp === 'function' ? gainExp(Q.reward.exp) : 0; toast('修为 +' + Q.reward.exp, 1800); if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0);
      await L([[XX, '（暗室里那本「已送西北 · 二十七人」，账册上的「西北林中」……小子，抄一份带着。）'], [YE, '（西北……）'], [YT, '该上路了。苍月城，林雪师姐那边。']]);
      toast('主线 · 名录　已结案', 2600); });
    if (st().s === 3) return say(SZ, '二位往后路过玄天城，巡城司的门，随时开着。');
    return say(SZ, '本官坐堂，有冤申冤。');
  }, { cond: () => N() >= 16 || st().s === 3 });
  // 十七、暗室（打斗三 · 首领）
  man(AN, 'scribe', at(AN, .5, .38), WEN, async () => {
    if (!on(17)) return;
    await lock(async () => {
      await L([['', '文书房底下是一间石室。整面墙挂满了名录抄本，一个名字一道红圈。'], ['', '最新的一道圈还没干——圈着的是「苏绫」。'],
        [WEN, '（转过身，眼白发青，手里那卷名录化成了黑色的锁链）三十年。老朽在这衙门里抄了三十年的名字。'], [WEN, '没师门、没家小的散修，死了也没人来找。老朽不过是……替他们找了个去处。'], [YE, '今天有人来找了。']]);
      await fight({ title: '巡城司 · 暗室', bgmLib: 'battle_case', bg: 'bg_hall', boss: true, enemies: [wenBoss()], exp: 900, gold: 600 });
      await L([['', '温既白倒在名录墙下，黑气一点点散了，又变回那个微胖、和气的老书办。'], [WEN, '……上面的人，你们惹不起。'],
        ['', '架子上一本账，最后一行写着：「已送西北 · 二十七人」。'], [XX, '（西北。账册上也写着「西北林中」。……先记着。）']]);
      note('暗室的账：「已送西北 · 二十七人」'); next(18);
    });
  }, { cond: () => on(17) });

  // 入夜：查到黑市这两步，玄天城压成夜里（人身边一圈亮，街上暗），第一次出门有一行字
  const nightOn = () => !battle && world.map && world.map.tile && world.mapName === 'xt_city' && st().s === 1 && (N() === 8 || N() === 9);
  // 用游戏自己的昼夜（Codex 的夜景灯光层）：这两步时把时辰拨到夜里，办完拨回来
  updateMap = (o => function (dt) { const r = o.apply(this, arguments); try { const f = F(), want = st().s === 1 && (N() === 8 || N() === 9) && /^(xt_city|ml_cellar)$/.test(world.mapName || '');
    if (want && f.res_tod !== 'night') { f.ml_tod = 1; f.res_tod = 'night'; } else if (!want && f.ml_tod) { f.ml_tod = 0; f.res_tod = ''; } } catch (e) {} return r; })(updateMap);
  const nightCap = () => lock(async () => { F().ml_nightcap = 1; await fadeOut(400); try { await caption('入夜 · 玄天城东南 · 黑市', 2000); } catch (e) {} await fadeIn(400); toast('花婆家在城东南城墙边', 2200); });
  // ---------------- 什么时候开始；没结案不出南城门 ----------------
  const eligible = () => { const f = F(); return S.started && f.ch3_report && f.qingxiao && !f.ch3_forest && !f.ch3_forest_done && st().s === 0; };
  const DOOR_YL = [1120, 2160];
  updateMap = (o => function (dt) { const r = o.apply(this, arguments);
    try { if (world.mapName === 'xt_city' && ready()) {
      if (eligible()) { const s = st(); s.s = 1; s.n = 0; F().ml_notes = []; snd('ui_confirm'); toast('主线 · 名录', 2200); }
      if (on(8) && !F().ml_nightcap && !busy.v) nightCap();
      if (on(0) && !busy.v && Math.hypot(world.player.x - DOOR_YL[0], world.player.y - DOOR_YL[1]) < 340) scene1(); } } catch (e) {}
    return r; })(updateMap);
  { const ex = (CITY.exits || []).find(e => e.to === 'yy_forest'); if (ex) { const oc = ex.cond, om = ex.msg;
    ex.cond = () => (oc ? oc() : true) && st().s !== 1;
    Object.defineProperty(ex, 'msg', { configurable: true, get() { return st().s === 1 ? '苏绫的案子还没了结。先把这件事办了，再出城。' : om; }, set(v) {} }); } }

  // ---------------- 带路（R284 那套）----------------
  const left = (seen, names) => Object.keys(names).filter(k => !(seen || {})[k]).map(k => names[k]);
  const NAV = (s, f) => { const n = s.n;
    if (n === 0) return { area: ['xt_city', DOOR_YL[0], DOOR_YL[1], 200, '云来客栈门口围着一圈人——城南大街上'] };
    if (n === 3) return { look: ['xt_inn_room2', ...left(f.ml_seen, { tong: '浴桶', gui: '浴室角落的大水柜', ping: '屏风', jiao: '地上的湿脚印', quan: '死者的拳头' })], lookMsg: '天字二号房的浴室：五处，小地图上的金圈是还没看过的' };
    if (n === 9 && world.mapName !== 'ml_cellar' && TMAPS.ml_huapo) return { to: ['床边的石板'] };
    if (n === 12) return { area: ['qy_inn_s3', null, null, 0, '悦来二楼最里面的天字三号房'] };
    return { to: [[GU, '据点长老', GU, null, FENG, SU, LIU6, TEA, '花婆家', '晃动的人影', '林府管事', '客栈掌柜', null, DU, GU, '卷宗架', SZ, WEN, SZ][n]].filter(Boolean), map: { 11: 'qy_inn' }[n] };
  };
  const install = () => { if (!window.R284S || !window.R140Q || !R140Q.GO) return false; R284S.T[ID] = NAV;
    if (!Object.getOwnPropertyDescriptor(R140Q.GO, ID)) Object.defineProperty(R140Q.GO, ID, { configurable: true, enumerable: true, get() { return R284S.goal(ID) || undefined; } }); return true; };
  applyHooks(); if (!install()) setTimeout(install, 0); setTimeout(applyHooks, 0); setTimeout(applyHooks, 3000);
  window.R292 = { st, next, GOALS, scene1,  maps: ['ml_yamen', 'ml_morgue', 'ml_jail', 'ml_archive', 'ml_secret', 'ml_cellar'] };
})();
