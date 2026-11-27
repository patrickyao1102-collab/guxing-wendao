// ================= R392 · 新地图「天剑宗 · 后山落星坡」（Codex R387 的画，只进测试版）=================
// 作者 11-27 晨：「最开始的天剑宗后山那个地图，以及最开始那个前十五分钟，一定要吸引住玩家……可以画别的地图，但总体要和天剑峰的画风相似。」
// 后山崖顶很好看，但只有一屏多大：拿到寒星剑之后，玩家除了下山去藏经阁，没有别处可去、没有东西可找。
// 落星坡接在崖顶东边小路的尽头——流星的大块头砸在这里。玩家头一回自己决定「去不去」：
//   · 中央草甸有妖兽游荡（妖狼火、山魈土、树妖精木），正好拿水性的寒星剑、木性的桃木剑试相克；
//   · 陨星坑里趴着头目「衔星 · 赤焰狼王」（R388），打不打随意，打赢有事迹可交；
//   · 三只宝箱（潭后暗台 / 试剑台 / 观云台）装的是灵草和五行之精，不是装备；
//   · 坑里坑外散着十粒星屑，走过去玉佩就吸走，每粒 3 点星辰点；
//   · 小潭东岸能歇脚：走过去气血灵力回满，打累了回来喝一口再去打。
// 底图 11-27 上午返修过一次（R387B：草甸镜像纹、白玉台厚度和落影、陨坑的坑沿和裂纹、石径、崖边一圈收边），位置坐标没变。
// 地图数据在 r392_data.js（tools/r392_build.py 从 Codex 的成品生成：底图、遮挡件、碰撞格、各点坐标，比例和后山崖顶一样是 0.74）。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.tj_houshan || !window.R392_DATA || typeof IMG === 'undefined' || typeof tileSetMap !== 'function') return;
  const D = window.R392_DATA, ID = 'tj_luoxing', F = () => (S.flags = S.flags || {}), HS = TMAPS.tj_houshan;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const V = '?v=2';   // v2 = Codex R387B 返修后的底图

  // ---------- 碰撞：星核脚下挡一小块（成品通行图里那一块太小，缩到游戏比例后被抹掉了）----------
  const B = D.blocked.split('');
  { const cx = D.core.x + D.core.w / 2, fy = D.core.foot; for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 1; dx++) { const c = Math.floor(cx / D.cs) + dx, r = Math.floor((fy - 6) / D.cs) + dy; if (c >= 0 && r >= 0 && c < D.cols && r < D.rows) B[r * D.cols + c] = '1'; } }
  const blocked = B.join('');
  const free = (x, y) => [[-12, -4], [12, -4], [-12, 6], [12, 6]].every(([ox, oy]) => { const c = Math.floor((x + ox) / D.cs), r = Math.floor((y + oy) / D.cs); return c >= 0 && r >= 0 && c < D.cols && r < D.rows && blocked[r * D.cols + c] === '0'; });
  const near = (x, y) => { if (free(x, y)) return [x, y]; for (let d = 6; d < 160; d += 6) for (let a = 0; a < 6.28; a += .4) { const nx = x + Math.cos(a) * d, ny = y + Math.sin(a) * d; if (free(nx, ny)) return [Math.round(nx), Math.round(ny)]; } return [x, y]; };

  // ---------- 图 ----------
  const IMS = [];   // 开局阶段要的图会被 img_guard 排到队尾慢慢下；真进这张图时让它们插队（见最下面）
  const load = (k, s, cb) => { const im = new Image(); im.onload = () => { try { IMG[k] = im; if (cb) cb(im); } catch (e) {} }; im.src = s; IMS.push(im); return im; };
  load('r392g', 'r392/g.webp' + V); load('r392core', 'r392/core.webp' + V);
  const objs = D.occ.map(([x, y, w, h, sy, ax, ay], i) => ({ id: 'r392_occ', uid: 'r392_' + i, img: 'r392o_' + i, x, y, w, h, sy: Math.max(sy, y + h * .5), ax: x + w / 2, ay: sy, flat: false, flip: false, noBlock: true, noPre: true, _a: [ax, ay] }));
  load('r392occ', 'r392/occ.webp' + V, im => { for (const o of objs) { if (!o._a) continue; const c = document.createElement('canvas'); c.width = o.w; c.height = o.h; c.getContext('2d').drawImage(im, o._a[0], o._a[1], o.w, o.h, 0, 0, o.w, o.h); IMG[o.img] = c; } });
  // 星核：四帧呼吸光
  objs.push({ id: 'r392_core', uid: 'r392_core', img: 'r392core', x: D.core.x, y: D.core.y, w: D.core.w, h: D.core.h, sy: D.core.foot, ax: D.core.x + D.core.w / 2, ay: D.core.foot, flat: false, flip: false, noBlock: true, noPre: true });
  // 星屑：十粒，用后山崖顶现成的灵晶画（蓝的和白的），小一号
  const XP = D.crystals.map(([x, y], i) => { const [nx, ny] = near(x, y); return { i, x: nx, y: ny, img: 'cx2_hs4_crystal_cluster_' + (i % 3 === 1 ? 'opal' : 'sapphire') }; });
  for (const c of XP) objs.push({ id: 'r392_xp', uid: 'r392_xp' + c.i, img: c.img, x: c.x - 19, y: c.y - 38, w: 38, h: 42, sy: c.y, ax: c.x, ay: c.y, flat: false, flip: false, noBlock: true, noPre: true, _xp: c });
  const xpTaken = i => !!F()['lx_xp' + i];

  // ---------- 地图 ----------
  const TP = D.tp, BACK = [1500, 990];   // 回崖顶：落在东边小路上，传送阵西侧
  const HS_TP = [1570, 985];             // 崖顶东边小路尽头的传送阵
  const zone = (c, r) => { const x = (c + .5) * D.cs, y = (r + .8) * D.cs; return D.spawns.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 230) && Math.hypot(x - D.boss[0], y - D.boss[1]) > 300 && Math.hypot(x - TP[0], y - TP[1]) > 260; };
  const TYPES = ['wolf', 'wolf', 'monkey', 'tree'];
  const MOBS_A = { n: 5, types: ['wolf', 'wolf', 'monkey'], bg: 'bg_night', lv: 0, lvR: [4, 5], zone, early: 'LX' };     // 拿到剑典之前：练气六重，一个人，手里只有水性的寒星剑——先不放木性的树妖精（水生木，砍不动又没法换剑）
  const MOBS_B = { n: 6, types: TYPES, bg: 'bg_night', lv: 0, lvR: [8, 10], zone };                  // 三日自由期：练气九重
  const MOBS_C = { n: 6, types: TYPES, bg: 'bg_night', lv: 0, zone };                                // 之后：跟着主角的等级走
  const M = TMAPS[ID] = {
    title: '天剑宗 · 后山落星坡', leaves: true,
    baked: { ground: 'r392g', w: D.w, h: D.h, cs: D.cs, cols: D.cols, rows: D.rows, blocked, objs, npcs: [], exits: [], inter: [], zones: [] },
    start: P(...near(TP[0], TP[1] + 70)),
    exits: [{ x: Math.floor(TP[0] / D.cs) - 1, y: Math.floor(TP[1] / D.cs) - 1, w: 3, h: 3, to: 'tj_houshan', at: P(BACK[0], BACK[1]), face: 'left', label: '西 · 后山崖顶', spotAt: [TP[0], TP[1]] }],
    chests: [
      { c: P(...D.chests.C)[0], r: P(...D.chests.C)[1], items: [['m_wx_shui', 2], ['moon_dew', 2], ['gold', 60]], _r392: 1 },    // 潭后暗台：水边，水之精 + 月露灵草
      { c: P(...D.chests.E)[0], r: P(...D.chests.E)[1], items: [['m_wx_jin', 2], ['p_small', 2]], _r392: 1 },                      // 试剑台：历代弟子试剑的地方，金之精
      { c: P(...D.chests.F)[0], r: P(...D.chests.F)[1], items: [['m_wx_mu', 1], ['m_wx_tu', 1], ['gold', 80]], _r392: 1 },         // 观云台
    ],
    npcs: [],
  };
  for (const ch of M.chests) ch.items = ch.items.filter(([id]) => id === 'gold' || (typeof ITEM_DB !== 'undefined' && ITEM_DB[id]) || /^m_wx_/.test(id));
  Object.defineProperty(M, 'mobs', { configurable: true, enumerable: true, get() { const f = F(); return f.ch1_free && !f.ch2_roam ? MOBS_B : !f.jiuyao_full && !f.ch2_roam && (S.hero.lv || 6) <= 6 ? MOBS_A : MOBS_C; }, set() {} });
  try { if (typeof MAP_ZOOM === 'object' && MAP_ZOOM.tj_houshan) MAP_ZOOM[ID] = MAP_ZOOM.tj_houshan; } catch (e) {}

  // 崖顶 → 落星坡：东边小路尽头多一座传送阵。手里有了真剑才放行（开场那场借力战之前不显）
  const hasSword = () => { try { const f = F(), w = S.hero.equip && S.hero.equip.weapon; return !!(f.hs_chest || f.ch1_free || f.ch2_roam || f.res_ch1 || (w && w !== 'w_wood')); } catch (e) { return false; } };
  const gate = { x: Math.floor(HS_TP[0] / 16) - 1, y: Math.floor(HS_TP[1] / 16) - 1, w: 3, h: 3, to: ID, at: M.start, face: 'down', label: '东 · 落星坡', spotAt: HS_TP,
    cond: () => !!F().hs_explored && hasSword(), get msg() { return F().hs_explored ? '那边是野地。先去溪边岩隙把剑取了再过去。' : ''; } };
  if (!HS.exits.some(e => e.to === ID)) HS.exits.push(gate);

  // ---------- 进图：星旋说两句（只说一回）；后山的灵晶图跟着载 ----------
  let lxQ = false;
  tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments);
    if (name === ID) { try { if (window.CX2_LAZY_LD) CX2_LAZY_LD('tj_houshan'); } catch (e) {}
      try { const y = window.R388 && R388.y; if (y) y.pos = D.boss.slice(); } catch (e) {}
      if (!F().lx_seen && !lxQ && window.SAY_LATER) { lxQ = true; SAY_LATER(async () => { const f = F(); lxQ = false; if (world.mapName !== ID || f.lx_seen) return; f.lx_seen = 1;
          await say('星旋', '喏，流星的大块头砸在这儿了。那块星核还没凉透，满山的妖兽都是冲它来的。');
          const y = window.R388 && R388.y; if (y && !f['yw_' + y.id] && (!y.cond || y.cond())) await say('星旋', '坑里趴着的那头狼不一样——它把星核的碎片咬进肉里了。打不打，你自己掂量。'); }); } }
    return r; })(tileSetMap);
  try { const y = window.R388 && R388.y; if (y) y.pos = D.boss.slice(); } catch (e) {}

  // 拿到寒星剑的时候，星旋顺口指一句路（去不去由玩家）
  try { const box = HS.npcs.find(n => n.name === '溪边岩隙宝箱'); if (box && typeof box.talk === 'function') { const t0 = box.talk; box.talk = async function () { const had = !!F().hs_chest; const r = await t0.apply(this, arguments);
        try { if (!had && F().hs_chest && !F().lx_hint && !F().res_ch1) { F().lx_hint = 1; await say('星旋', '对了，东边坡下星力最重，流星的大块头多半砸在那儿。想试剑就去看看；不想去，就下山办正事。'); } } catch (e) {} return r; }; } } catch (e) {}

  // ---------- 画：星核呼吸、星屑、坑底的光 ----------
  const POP = [];
  drawBaked = (orig => function (o, now) {
    if (o && o.id === 'r392_core') { const im = IMG.r392core; if (!im) return; const n = D.core.n, fw = im.width / n, f = Math.floor(performance.now() / D.core.ms) % (n * 2 - 2), fi = f < n ? f : n * 2 - 2 - f, cx = o.x + o.w / 2, cy = o.y + o.h * .55, k = .5 + .5 * Math.sin(now * 1.6);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      { ctx.save(); ctx.translate(cx, o.sy - 4); ctx.scale(1, .42); const g = ctx.createRadialGradient(0, 0, 6, 0, 0, 170); g.addColorStop(0, `rgba(150,215,255,${.34 + .1 * k})`); g.addColorStop(.5, `rgba(110,180,255,${.13 + .05 * k})`); g.addColorStop(1, 'rgba(110,180,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 170, 0, 7); ctx.fill(); ctx.restore(); }   // 照在坑底的光
      { const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 120); g.addColorStop(0, `rgba(190,230,255,${.26 + .12 * k})`); g.addColorStop(1, 'rgba(120,190,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 120, 0, 7); ctx.fill(); }
      ctx.restore();
      ctx.drawImage(im, fi * fw, 0, fw, im.height, o.x, o.y, o.w, o.h);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const life = 2.4 + i * .23, t = ((now + i * .61) % life) / life, x = cx + Math.sin(i * 2.7) * 46 + Math.sin(now * .8 + i) * 6, y = o.sy - 20 - t * 150, a = Math.sin(t * Math.PI) * .8; ctx.fillStyle = `rgba(190,230,255,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.6 + (i % 3) * .5, 0, 7); ctx.fill(); } ctx.restore();
      return; }
    if (o && o.id === 'r392_rest') { const x = o.ax, y = o.ay; ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) { const t = ((now * .5 + i * .5) % 1), r = 10 + t * 30; ctx.strokeStyle = `rgba(190,235,255,${(1 - t) * .7})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, r, r * .42, 0, 0, 7); ctx.stroke(); }
      { const g = ctx.createRadialGradient(x, y, 2, x, y, 30); g.addColorStop(0, 'rgba(190,235,255,.3)'); g.addColorStop(1, 'rgba(190,235,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 30, 13, 0, 0, 7); ctx.fill(); }
      ctx.restore(); return; }
    if (o && o.id === 'r392_xp') { const c = o._xp; if (!c || xpTaken(c.i)) return; const im = IMG[o.img]; const k = .6 + .4 * Math.sin(now * 3 + c.i * 1.7), bob = Math.sin(now * 2 + c.i) * 2.5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; { ctx.translate(c.x, c.y - 2); ctx.scale(1, .4); const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 46); g.addColorStop(0, `rgba(160,220,255,${.42 * k})`); g.addColorStop(1, 'rgba(160,220,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill(); } ctx.restore();
      if (im) { ctx.save(); ctx.shadowColor = 'rgba(170,225,255,.95)'; ctx.shadowBlur = 8 + 8 * k; ctx.drawImage(im, o.x, o.y + bob, o.w, o.h); ctx.restore(); }
      else { ctx.save(); ctx.fillStyle = 'rgba(190,230,255,.95)'; ctx.beginPath(); ctx.moveTo(c.x, c.y - 30 + bob); ctx.lineTo(c.x + 8, c.y - 14 + bob); ctx.lineTo(c.x, c.y + bob); ctx.lineTo(c.x - 8, c.y - 14 + bob); ctx.closePath(); ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const ph = (now * .9 + c.i * .37) % 1; if (ph < .45) { const r = 9 * Math.sin(ph / .45 * Math.PI), sx = c.x + 7, sy = c.y - 30 + bob; ctx.strokeStyle = `rgba(255,255,255,${Math.sin(ph / .45 * Math.PI)})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx - r, sy); ctx.lineTo(sx + r, sy); ctx.moveTo(sx, sy - r); ctx.lineTo(sx, sy + r); ctx.stroke(); } ctx.restore();
      return; }
    return orig.apply(this, arguments); })(drawBaked);

  // ---------- 潭边歇脚：走到小潭东岸，气血灵力回满（打累了回来喝一口，再去打）----------
  const REST = (() => { const y = 947; for (let x = 366; x < 700; x += 8) if (free(x, y) && free(x + 16, y)) return [x + 14, y]; return near(560, 940); })();
  objs.push({ id: 'r392_rest', uid: 'r392_rest', img: 'r392core', x: REST[0] - 30, y: REST[1] - 20, w: 60, h: 30, sy: REST[1] - 400, ax: REST[0], ay: REST[1], flat: true, flip: false, noBlock: true, noPre: true });
  let restT = 0;
  function rest() { const f = F(), now = performance.now(); if (now - restT < 4000) return; let need = S.hero.hp < S.hero.maxhp || S.hero.mp < S.hero.maxmp; try { for (const k of S.party || []) { const st = allyStats(k), a = allyState(k); if (a.hp < st.maxhp || a.mp < st.maxmp) need = true; } } catch (e) {}
    if (!need) return; restT = now; try { partyRest(); playSnd('ui_confirm', .7); } catch (e) {} POP.push({ x: REST[0], y: REST[1], t0: now / 1000, text: '气血、灵力回满' });
    if (!f.lx_rest && window.SAY_LATER) { f.lx_rest = 1; SAY_LATER(async () => { await say('星旋', '这潭水泡过星力。打累了就回来喝一口，比你那几颗丹药管用。'); }); } }

  // ---------- 星屑：走近就被玉佩吸走，每粒 3 点星辰点；十粒捡齐星旋说一句 ----------
  const XP_PTS = 3;
  function takeXp(c) { const f = F(); f['lx_xp' + c.i] = 1; S.hero.points = (S.hero.points || 0) + XP_PTS; try { playSnd('ui_confirm', .8); } catch (e) {}
    POP.push({ x: c.x, y: c.y, t0: performance.now() / 1000 });
    const n = XP.filter(q => xpTaken(q.i)).length;
    if (!f.lx_xp_said && window.SAY_LATER) { f.lx_xp_said = 1; SAY_LATER(async () => { await say('星旋', '星屑。里头还剩一点星力，玉佩替你吸了——三点星辰点，蚊子腿也是肉。'); }); }
    if (n === XP.length && !f.lx_xp_all) { f.lx_xp_all = 1; setTimeout(() => { try { toast('落星坡的星屑拾尽了'); } catch (e) {} }, 900); } }
  window.R392 = { ID, D, XP, count: () => [XP.filter(q => xpTaken(q.i)).length, XP.length], near };
  // 进落星坡（或者站到崖顶、马上可能要进）时：这张图的底图 / 遮挡 / 星核不排队，马上下
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function (name) { try { if ((name === ID || name === 'tj_houshan') && window.IMG_GUARD && IMG_GUARD.bump) for (const im of IMS) IMG_GUARD.bump(im); } catch (e) {} return orig.apply(this, arguments); })(tileSetMap);
  S.overlay.push({ draw() { try {
    if (S.scene !== drawMap || world.mapName !== ID || !world.player) { POP.length = 0; return; }
    const p = world.player, now = performance.now() / 1000;
    if (!world.locked && !battle && !dialog && !choice && !sysPanel && !(window.IG_OPEN && IG_OPEN())) { for (const c of XP) if (!xpTaken(c.i) && Math.hypot(p.x - c.x, p.y - c.y) < 44) { takeXp(c); break; } if (Math.hypot(p.x - REST[0], p.y - REST[1]) < 46) rest(); }
    if (!POP.length) return; const z = VZ(), cam = world.cam || { x: 0, y: 0 };
    for (let i = POP.length - 1; i >= 0; i--) { const o = POP[i], dt = now - o.t0; if (dt > 1.5) { POP.splice(i, 1); continue; } const a = Math.min(1, (1.5 - dt) / .4), sx = (o.x - cam.x) * z, sy = (o.y - cam.y) * z;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 10; k++) { const an = k * .628 + o.t0, r = dt * 80 * z; ctx.fillStyle = `rgba(170,225,255,${a * .85})`; ctx.beginPath(); ctx.arc(sx + Math.cos(an) * r, sy - 14 * z + Math.sin(an) * r * .6 - dt * 30 * z, 3 * a + .5, 0, 7); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; ctx.font = `700 18px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(o.text || ('星辰点 +' + XP_PTS), sx, sy - 46 * z - dt * 34, '#d8f0ff', 'rgba(0,10,30,.9)', 4); ctx.restore(); }
  } catch (e) {} } });

  // ---------- 拿到剑典之前的落星坡：主角这时一个人、练气六重——寻常兽火都是不追人的绿火，偶尔一团精英（紫）和金灵，不出「危」的红火 ----------
  if (typeof spawnTileMob === 'function') spawnTileMob = (orig => function (T, def) { const n = world.mobs.length; orig.apply(this, arguments);
    try { const a = world.mobs[world.mobs.length - 1]; if (world.mobs.length > n && a && a.fire && def.mobs && def.mobs.early === 'LX') { const f = a.fire;
        if (f.tier === 'purple') f.lv = 6;                                   // 精英：一队两三只，会追人，是这张图上的硬仗
        else if (f.tier !== 'gold') { f.tier = 'green'; f.lv = 4 + (Math.random() < .5 ? 0 : 1); }   // 其余都是绿火：不追人，一两只，想打才打
      } } catch (e) {} })(spawnTileMob);
  // 一进图先刷出一半，不要空荡荡地等
  tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments);
    if (name === ID) setTimeout(() => { try { const Mb = M.mobs, T = world.map && world.map.T; if (world.mapName !== ID || !Mb || !T) return; for (let i = 0; i < 14 && world.mobs.length < Math.ceil(Mb.n / 2); i++) spawnTileMob(T, M); } catch (e) {} }, 400);
    return r; })(tileSetMap);

  // ---------- 玉佩里的两桩事迹 ----------
  try { const R = window.R386; if (R && Array.isArray(R.TASKS) && !R.TASKS.some(t => t.id === 'lx1')) {
      const i = R.TASKS.findIndex(t => t.id === 'y1');
      R.TASKS.splice(i < 0 ? R.TASKS.length : i, 0, { id: 'lx1', cat: '斩妖', name: '衔星', desc: '打倒落星坡的头目「衔星 · 赤焰狼王」', n: () => [F().yw_xingwolf ? 1 : 0, 1], pts: 50, show: () => !!F().lx_seen, quip: '星核碎片都咬进肉里的畜生也敢动，胆子不小。它肩上那点星力归你了。' });
      const j = R.TASKS.findIndex(t => t.id === 't3');
      R.TASKS.splice(j < 0 ? R.TASKS.length : j, 0, { id: 'lx2', cat: '探索', name: '拾星', desc: '把落星坡的十粒星屑拾尽', n: () => window.R392.count(), pts: 20, show: () => !!F().lx_seen, quip: '一粒都没给本神仙剩下？行，手脚够干净。' });
    } } catch (e) {}
})();
