// ================= R473 · 万妖塔一层内苑换成 Codex 重画的新图（只进测试版）=================
// 作者已定：内苑用 Codex R473 的新画（5040×3600，21×15 格；南入口 (11,15)，封花宫门 (11,5)，北庭第 8～14 列、第 2～4 行；三盏灯 (3,3)、(19,2)、(20,14)）。
// 这里管：
//   ① 把内苑（wyt_f1c）整苑换成新画：底图、15 行前景、物件按 placement 摆；碰撞照新格子；法阵、宝箱、遗物、梦丝、落英按新布局重摆。
//   ② 封花宫门四态用真画帧：sealed（10 帧循环）→ unsealing（12 帧单次，接 closed）→ closed → open（12 帧单次，停末帧）。
//      相邻两帧之间做淡入淡出，读起来是「流」而不是「跳」；禁制散开时只加一点金红光点作点缀（代码画的禁制在新图里退役）。
//   ③ 照魂灯 off / on 两张图，点亮那一下 0.9 秒淡过去（R471 的灯光只留一点，跟着新灯位走）。
//   ④ 绛蘅：首领树干中间的树洞是给她留的——现身演出落在树洞里，平时的立像也站在树洞底缘。
//   ⑤ 小怪：作者定了内苑不显示鬼火，显示明雷梦傀（梦仆书生 / 宫侍梦傀，八方向走 + 正面待机），在路上游荡，碰到进战斗（战斗里先用现有梦傀）。
//      路边还摆着 14 个「入梦百姓」（同一套人设、轻轻摇晃）——分不清哪个会动，作者要的就是这股吓人劲。
//      精英梦傀首在 (12,6) 装睡，走近才惊醒扑过来，碰到进精英战。祭柱、散落小物照位置表摆。
//   ⑥ 地面版本：默认「灰石血纹」（作者 11-28 定：地面克制，花树才显得邪异），暗红版留作备选。
//   ⑦ 测试面板：内苑新画 / 旧画切换、地面版本切换、几个跳到演出各段的按钮。
(function () {
  const M0 = window.R473_INNER_META;
  if (!M0 || !window.R443 || !R443.PADS || !window.TOWER || !TOWER.MAZE) return;
  const MZ = TOWER.MAZE, ST1 = () => MZ.ST(1), TSZ = 240;
  const LSG = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const LSS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const clamp01 = v => Math.max(0, Math.min(1, v)), sm = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const DIR = 'r473/inner/', VER = 2;   // 2：封花宫门重做（灰瓦灰石门楼）+ 首领花树重画 + 门前灰石铺地
  let ON = LSG('gx_r473_inner', '1') !== '0';
  // 地面版本（作者 11-28 最后定的）：默认「灰石血纹」——地面克制，花树才显得邪异；暗红版（def）留在测试面板当备选。
  //   以后 Codex 再交别的版本（比如压暗一点的灰石）：tools/r473_build.py --ground <名字> <目录>，这里 GNAME 加一行名字就能在面板里切。
  const GRS = M0.grounds || {}, GNAME = { gray: '灰石血纹', gray2: '灰石（压暗）', def: '暗红' };
  const GDEF = GRS.gray ? 'gray' : 'def';
  let GROUND = LSG('gx_r473_ground2', GDEF); if (GROUND !== 'def' && !GRS[GROUND]) GROUND = GDEF;
  const inC = () => typeof world !== 'undefined' && world && world.mapName === 'wyt_f1c';

  // ---------- 新布局（格子从 0 起算：[列, 行]）----------
  // 法阵：入口旁那座花纹阵回中苑；西边 (4,9) 和东边 (20,6) 两座剑纹阵是一对（西边点完灯，一步到东北角那盏灯）；
  //       (15,10) 那座就在出发的大路边上，最勾人——是假阵。
  const NEW = {
    pads: [{ c: [9, 12], to: ['b', [15, 1]], g: 'flower', ret: 1 }, { c: [3, 8], to: ['c', [19, 5]], g: 'sword' }, { c: [19, 5], to: ['c', [3, 8]], g: 'sword' }, { c: [14, 9], decoy: 1, g: 'moon' }],
    start: [10, 13],
    chestAt: [[19, 6], [16, 11], [1, 13], [3, 3]] };   // 两个死胡同、西南角、西北灯厅
  const OLD = { pads: R443.PADS.c, start: R443.START.c, chest: R443.CHEST && R443.CHEST.c };
  NEW.chest = (OLD.chest || []).map((ch, i) => [NEW.chestAt[i][0], NEW.chestAt[i][1], ch[2]]);

  // ---------- 物件补充：碰撞框、灯光高度 ----------
  // 首领花树：Codex 照概念图重画的单棵古树（首领花树_重画/，tools/r473_build.py --tree 生成 meta.tree）。
  //   整树 1700×774 画在 (1670,27)，树根脚点 (2520,801)；树洞在 (2488,471) 起 102×129——树洞里的暗红光 8 帧呼吸（每帧 340 毫秒），只裁了树洞那一小块（glow），叠在整树上。
  //   绛蘅入树（R466 定版 B，下半身让洞沿遮住）是另一层 occ：现身之后一直嵌在树洞里，打赢了就空了。
  //   排序：花树和御台同组（御台先画），玩家只能站在御台前面（y ≥ 789），所以花树按 790 排序——站在两侧花根边上的人会被花根盖住脚，站台前的人在树前面。
  //   挡路：树后那一条（北庭第 2 行）整条挡掉，树干再挡一块；御台由 R443 自己挡（台面）。
  const MT = M0.tree || null;
  const TREE = MT ? { x: MT.x, y: MT.y, w: MT.w, h: MT.h, sy: 790, blocks: [[1680, 240, 3360, 470], [2400, 470, 2720, 640]], occ: MT.occ, glow: MT.glow, frames: MT.frames, ms: MT.ms, base: MT.base }
    : { img: 'flower_tree', x: 2073, y: 125, w: 894, h: 590, sy: 635, blocks: [[2290, 250, 2750, 600]] };   // 没出新树时的老花树（R473 第一版）
  const HOLE = MT ? [MT.occ.x + MT.occ.w / 2, MT.occ.y + MT.occ.h] : [2520, 676];   // 树洞底缘（世界坐标）：绛蘅「脚底」——下半身藏在洞沿后面
  const HOLE_C = MT ? [MT.occ.x + MT.occ.w / 2, MT.occ.y + MT.occ.h * .5] : [2520, 600];   // 树洞中心
  const M1 = (() => { const m = JSON.parse(JSON.stringify(M0)); delete m.gray;
    for (const o of m.objs) {
      if (/^lamp/.test(o.id)) { o.blocks = [o.bx - 56, o.by - 46, o.bx + 56, o.by - 2]; o.hy = 112; o.hr = 54; o.ha = .45; o.glowK = .42; }
      if (o.id === 'flower_tree') { Object.assign(o, { x: TREE.x, y: TREE.y, w: TREE.w, h: TREE.h, by: TREE.sy + 80 }); delete o.blocks;   // R443 按 by - 80 排序
        o.states = MT ? { static: MT.base } : { static: TREE.img }; if (MT) { o.frames = MT.frames.concat([MT.occ.img]); o.ms = MT.ms; } }
      if (o.id === 'relic_root') o.hy = 10;
      // 追加摆设：入梦百姓挡脚下一小块；祭柱挡柱脚；散落小物不挡。（人茧在底图花圃里、悬在半空，不挡路）
      if (o.kind === 'puppet') o.blocks = [o.bx - 24, o.by - 16, o.bx + 24, o.by + 4];
      if (o.kind === 'totem') o.blocks = [o.bx - 40, o.by - 28, o.bx + 40, o.by + 2];
    }
    // 树的挡路框（可能不止一块）：挂一个看不见的物件上（R443 只认 o.blocks 一块）
    TREE.blocks.forEach((b, i) => m.objs.push({ id: 'tree_blk' + i, type: '挡路', x: b[0], y: b[1], w: 1, h: 1, bx: b[0], by: b[1], cell: [0, 0], blocks: b, hide: 1 }));
    // 精英梦傀首：占一个物件位（画法、位置每帧由下面的 ELITE 决定）
    if (M0.extra) m.objs.push({ id: 'x_elite', type: '梦傀首', x: 2700, y: 1050, w: 240, h: 320, bx: 2814, by: 1344, cell: [11, 5] });
    return m; })();
  const meta = () => (GRS[GROUND] ? Object.assign({}, M1, { ov: GRS[GROUND].ov }) : M1);
  const key = name => 'r473i_' + (name === 'base' ? GROUND + '_base' : name);
  const src = name => DIR + (name === 'base' && GRS[GROUND] && GRS[GROUND].base ? GROUND + '/base' : name) + '.webp?v=' + VER;
  window.R443_OVR = window.R443_OVR || {};
  R443_OVR.c = { on: () => ON, meta, key, src };

  // 宝箱开没开记在「图名 + 坐标」上：新旧两套坐标互相同步，切来切去不会多开一次
  const chestKey = ([cc, rr]) => 'chest_wyt_f1c_' + ((cc + .5) * TSZ / 64 - .5) + '_' + (((rr + .5) * TSZ + 50) / 64 - 1);
  function syncChests() { try { const F = S.flags || (S.flags = {}); (OLD.chest || []).forEach((o, i) => { const a = chestKey(o), b = chestKey(NEW.chest[i]); if (F[a] || F[b]) F[a] = F[b] = 1; }); } catch (e) {} }

  function apply() {
    R443.PADS.c = ON ? NEW.pads : OLD.pads; R443.START.c = ON ? NEW.start : OLD.start; if (R443.CHEST && OLD.chest) R443.CHEST.c = ON ? NEW.chest : OLD.chest;
    syncChests(); R443.buildAll();
    try { const T = TMAPS.wyt_f1c; if (T && T.mobs) { T.mobs.look = ON ? 'menggui' : null;   // 内苑小怪：显示为梦傀（美术到了自动换上）
      // 新画里梦傀不刷在：北庭（门没开也看得见，免得隔着门游荡）、宫门前（门前是精英梦傀首的地盘，也别挡演出）、梦傀首旁边
      const z0 = T.mobs._z0 || (T.mobs._z0 = T.mobs.zone); T.mobs.zone = !ON ? z0 : (c, r) => { const x = (c + .5) * 40, y = (r + .5) * 40;
        if (y < 980) return false; if (Math.hypot(x - 2520, y - 1229) < 420) return false; if (M0.extra && Math.hypot(x - 2814, y - 1344) < 480) return false; return z0 ? z0(c, r) : true; }; } } catch (e) {}
  }
  apply();
  function reload() { if (!inC() || !world.player) return; const p = world.player, s = R443.START.c, ctr = [(s[0] + .5) * TSZ, (s[1] + .5) * TSZ - 8];
    const T = world.map && world.map.T, c = Math.floor(p.x / 40), r = Math.floor(p.y / 40), ok = T && T.block && T.block[r] && !T.block[r][c];
    const [x, y] = ok ? [p.x, p.y] : ctr; tileSetMap('wyt_f1c', x / 64 - .5, y / 64 - .8, 'up'); }
  function setInner(on) { ON = !!on; LSS('gx_r473_inner', ON ? '1' : '0'); apply(); reload(); toast('万妖塔一层内苑：' + (ON ? '新画（R473）' : '旧画（R443）'), 2000); mark(); }
  function setGround(g) { if (g !== 'def' && !GRS[g]) { toast('这一版地面还没交', 2000); return; } GROUND = g; LSS('gx_r473_ground2', g); apply(); reload(); if (ON) toast('内苑地面：' + (GNAME[g] || g), 1800); mark(); }

  // ---------- 画：门四态、灯两态、绛蘅立像 ----------
  const IM = name => IMG[key(name)];
  const G = () => meta().objs.find(o => o.id === 'gate');
  function gateFrame(d, now) {   // → [帧名, 下一帧名, 混合比例]
    const R = window.R473, s = ST1(), A = d.anim, ms = d.ams;
    const run = (arr, t, per, loop) => { const f = t * 1000 / per; let i = Math.floor(f), k = f - i; if (loop) { i %= arr.length; return [arr[i], arr[(i + 1) % arr.length], k]; }
      if (i >= arr.length - 1) return [arr[arr.length - 1], null, 0]; return [arr[i], arr[i + 1], k]; };
    if (R && R.DOOR && R.DOOR.t0 != null) { const r = run(A.open, now - R.DOOR.t0, ms.open, false); return r[1] ? r : [d.states.open, null, 0]; }
    if (s.gate) return [d.states.open, null, 0];
    if (R && R.WARD && R.WARD.t0 != null) { const t = now - R.WARD.t0; if (t * 1000 >= A.unsealing.length * ms.unsealing) return [d.states.closed, null, 0]; return run(A.unsealing, t, ms.unsealing, false); }
    if (!s.ward) return run(A.sealed, now, ms.sealed, true);
    return [d.states.closed, null, 0]; }
  const MOTE = []; for (let i = 0; i < 70; i++) MOTE.push({ u: Math.random(), v: Math.random(), d: Math.random() * .45, vx: (Math.random() - .5) * 120, vy: -50 - Math.random() * 120, s: 1.3 + Math.random() * 2.4, g: Math.random() < .55 });
  function drawGate(g, d, now) {
    const [a, b, k] = gateFrame(d, now), ia = IM(a), ib = b && IM(b);
    if (ia) g.drawImage(ia, d.x, d.y, d.w, d.h); else { const c = IM(d.states.closed); if (c) g.drawImage(c, d.x, d.y, d.w, d.h); }
    if (ib && k > .02) { g.save(); g.globalAlpha = sm(k); g.drawImage(ib, d.x, d.y, d.w, d.h); g.restore(); }
    // 点缀：禁制散开时，几十个金红光点从门缝里慢慢往上、往两边飘走（不闪，1.6 秒）
    const R = window.R473; if (R && R.WARD && R.WARD.t0 != null) { const kb = (now - R.WARD.t0) / 1.6; if (kb > 0 && kb < 1) { g.save(); g.globalCompositeOperation = 'lighter';
      const L = d.x + 146, Rr = d.x + 345, T0 = d.y + 142, Hh = 158;   // 新门（526×349）：两扇门在 x 146～345、y 142～300
      for (const m of MOTE) { const q = clamp01((kb - m.d) / (1 - m.d)); if (q <= 0 || q >= 1) continue; const e = sm(q), x = L + m.u * (Rr - L) + m.vx * e, y = T0 + m.v * Hh + m.vy * e;
        g.globalAlpha = Math.sin(Math.PI * q) * .85; g.fillStyle = m.g ? '#ffd890' : '#ff8a8a'; g.beginPath(); g.arc(x, y, m.s * (1 - e * .4), 0, 7); g.fill(); }
      g.restore(); } }
    // 开门时门里透出一点暖光（缓进缓出）
    if (R && R.DOOR && R.DOOR.t0 != null) { const q = clamp01((now - R.DOOR.t0) / 1.6), la = Math.sin(Math.PI * q) * .32; if (la > .01) { g.save(); g.globalCompositeOperation = 'lighter'; const cx = d.x + 246, cy = d.y + 220, rg = g.createRadialGradient(cx, cy, 4, cx, cy, 150); rg.addColorStop(0, `rgba(255,176,150,${la})`); rg.addColorStop(1, 'rgba(255,90,90,0)'); g.fillStyle = rg; g.fillRect(cx - 150, cy - 150, 300, 300); g.restore(); } }
  }
  const PREV = {}, LIT = {};
  function drawLamp(g, d, now) { const ls = meta().objs.filter(o => /^lamp/.test(o.id)), i = ls.findIndex(o => o.id === d.id), on = !!(ST1().mech || [])[i];
    if (PREV[i] === undefined) PREV[i] = on; if (on && !PREV[i]) LIT[i] = now; PREV[i] = on;
    const k = on ? (LIT[i] != null ? sm((now - LIT[i]) / .9) : 1) : 0, off = IM(d.states.off), lit = IM(d.states.on);
    if (off && k < 1) g.drawImage(off, d.x, d.y, d.w, d.h);
    if (lit && k > 0) { g.save(); g.globalAlpha = k; g.drawImage(lit, d.x, d.y, d.w, d.h); g.restore(); } }
  const BP = {}; const bpic = () => { const s = MZ.TXT[1].pic; let a = BP[s]; if (!a) { a = BP[s] = new Image(); a.src = s; } return a.complete && a.naturalWidth ? a : null; };
  // 花树：整树（第 1 帧）+ 树洞暗红光 8 帧呼吸（相邻两帧淡入淡出）+ 绛蘅入树那一层
  //   occShow()：她现身以后一直嵌在树洞里（现身演出放的时候由演出自己画、这里先不画；打赢了树洞就空了）
  const occShow = () => { try { if (window.TOWER_STORY && TOWER_STORY.cleared(1)) return false; if (!ST1().jhSeen) return false; const R = window.R473; return !(R && R.APPEAR && (R.APPEAR.on || (R.APPEAR.out && R.APPEAR.out()))); } catch (e) { return false; } };   // R476 关键帧到了：她已经飘出树洞、站在台前（由 boss_pic 那一格画）
  function drawTree(g, d, now) { const b = IM(MT.base); if (!b) return; g.drawImage(b, TREE.x, TREE.y, TREE.w, TREE.h);
    const [gx, gy, gw, gh] = MT.glow, n = MT.frames.length, f = now * 1000 / MT.ms, i = Math.floor(f) % n, k = sm(f - Math.floor(f)), a = IM(MT.frames[i]), c = IM(MT.frames[(i + 1) % n]);
    if (a) g.drawImage(a, gx, gy, gw, gh); if (c && k > .02) { g.save(); g.globalAlpha = k; g.drawImage(c, gx, gy, gw, gh); g.restore(); }
    const R = window.R473, boost = R && R.APPEAR && R.APPEAR.glow ? R.APPEAR.glow(now) : 0;   // 现身时树洞的光一点点涨起来
    if (boost > .01) { g.save(); g.globalCompositeOperation = 'lighter'; const [cx, cy] = HOLE_C, rr = 120 + 60 * boost, rg = g.createRadialGradient(cx, cy, 6, cx, cy, rr); rg.addColorStop(0, `rgba(255,90,90,${.5 * boost})`); rg.addColorStop(.5, `rgba(220,20,40,${.22 * boost})`); rg.addColorStop(1, 'rgba(160,0,20,0)'); g.fillStyle = rg; g.fillRect(cx - rr, cy - rr, rr * 2, rr * 2); g.restore(); }
    if (occShow()) drawOcc(g, now, 1); }
  // 绛蘅入树：极轻地起伏（呼吸一样，上下 1.5 像素），alpha 给现身演出淡入用
  function drawOcc(g, now, alpha) { const O = MT.occ, im = IM(O.img); if (!im || alpha <= .01) return; const dy = Math.sin(now * 1.1) * 1.5;
    g.save(); g.globalAlpha = alpha; g.beginPath(); g.rect(O.x - 4, O.y - 20, O.w + 8, O.h + 20); g.clip(); g.drawImage(im, O.x, O.y + dy, O.w, O.h); g.restore(); }
  function drawBoss(g, now) {
    if (MT) {   // 新树：有 R476 关键帧时她现身后站在御台前（「掩袖而笑」最后一帧，按脚底 866 排序）；没有时嵌在树洞里，跟着花树一起画（drawTree）
      try { const R = window.R473; if (window.TOWER_STORY && TOWER_STORY.cleared(1)) return; if (!ST1().jhSeen || !R || !R.APPEAR || R.APPEAR.on) return; R.APPEAR.standee(g, now); } catch (e) {} return; }
    if (window.TOWER_STORY && TOWER_STORY.cleared(1)) return; const p = bpic(); if (!p) return;
    const h = MZ.TXT[1].picH * 1.15, w = p.width * h / p.height, fy = HOLE[1] + Math.sin(now * 1.2) * 2;
    g.save(); g.globalAlpha = .97; g.translate(HOLE[0], 0); g.scale(-1, 1); g.drawImage(p, -w / 2, fy - h, w, h); g.restore(); }
  drawBaked = (orig => function (o, now) {
    const d = ON && o && o.id === 'r443_obj' && o.r443 && o.r443.z === 'c' ? o.r443.o : null;
    if (!d) return orig.apply(this, arguments);
    try { if (d.id === 'gate') return drawGate(ctx, d, now); if (/^lamp/.test(d.id)) return drawLamp(ctx, d, now); if (d.id === 'boss_pic') return drawBoss(ctx, now); if (d.id === 'x_elite') return drawElite(ctx, now);
      if (d.hide) return; if (d.id === 'flower_tree' && MT) return drawTree(ctx, d, now); } catch (e) { return; }
    return orig.apply(this, arguments); })(drawBaked);
  // 台前立像的排序：脚底（R476：2520,866）——站在她身后（台前那条窄道上）的人被她挡住，站她身前的人挡住她
  tileSetMap = (orig => function (m) { const r = orig.apply(this, arguments);
    try { const ft = window.R473 && R473.APPEAR && R473.APPEAR.foot && R473.APPEAR.foot(); if (m === 'wyt_f1c' && ON && MT && ft) { const b = world.map.T.objs.find(q => q.r443 && q.r443.o && q.r443.o.id === 'boss_pic'); if (b) { b.sy = ft[1]; b.x = ft[0] - 120; b.y = ft[1] - 230; b.w = 240; b.h = 240; } } } catch (e) {}
    return r; })(tileSetMap);
  tileSetMap = (orig => function (m) { if (m === 'wyt_f1c') { for (const k in PREV) delete PREV[k]; for (const k in LIT) delete LIT[k]; syncChests(); } return orig.apply(this, arguments); })(tileSetMap);

  // ---------- 小怪显示为梦傀（明雷梦傀：梦仆书生 / 宫侍梦傀，八方向走各 8 帧 + 正面待机 12 帧）----------
  // 素材：r473/menggui/meta.json + mg_m.webp / mg_f.webp（tools/r473_build.py --extra 生成）；没有就照旧画鬼火。
  // 作者要的吓人感：路边摆着一样打扮的「入梦百姓」，分不清哪个会动——所以地图上的梦傀不挂等级字。
  const MG = { tried: false, meta: null, im: {} };
  const okI = im => im && im.complete && im.naturalWidth;
  function mgLoad() { if (MG.tried) return; MG.tried = true;
    fetch('r473/menggui/meta.json?v=' + VER).then(r => r.ok ? r.json() : null).then(j => { if (!j || !j.sheet) return; MG.meta = j;
      for (const [g, f] of Object.entries(j.sheet)) { const im = new Image(); im.src = 'r473/menggui/' + f + '?v=' + VER; MG.im[g] = im; }
      if (j.elite) { const im = new Image(); im.src = 'r473/menggui/' + j.elite.sheet + '?v=' + VER; MG.im.elite = im; } }).catch(() => {}); }
  const mgOn = () => { try { return ON && inC() && world.map && world.map.def && world.map.def.mobs && world.map.def.mobs.look === 'menggui' && MG.meta && (okI(MG.im.m) || okI(MG.im.f)); } catch (e) { return false; } };
  const DIRS = [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]];   // 下、左下、左、左上、上、右上、右、右下（和图集的行一致）
  const dirOf = (dx, dy) => { const ang = Math.atan2(dy, dx); let best = 0, bd = 9; DIRS.forEach(([u, v], i) => { const dd = Math.abs(Math.atan2(v, u) - ang), d2 = Math.min(dd, 6.283 - dd); if (d2 < bd) { bd = d2; best = i; } }); return best; };
  function shadow(g, x, y, rx, ry, a) { g.save(); g.globalAlpha = a; const rg = g.createRadialGradient(x, y, 0, x, y, rx); rg.addColorStop(0, 'rgba(10,0,4,1)'); rg.addColorStop(.7, 'rgba(10,0,4,.6)'); rg.addColorStop(1, 'rgba(10,0,4,0)'); g.fillStyle = rg; g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.beginPath(); g.arc(x, y, rx, 0, 7); g.fill(); g.restore(); }
  function cell(g, im, D, row, col, x, y, a) { const [fx, fy] = D.foot; if (a != null) { g.save(); g.globalAlpha = a; } g.drawImage(im, col * D.fw, row * D.fh, D.fw, D.fh, Math.round(x - fx), Math.round(y - fy), D.fw, D.fh); if (a != null) g.restore(); }
  function drawMG(a, now) { const J = MG.meta; let sx = a._mgs || (a._mgs = (MG.n = (MG.n || 0) + 1) % 2 ? 'm' : 'f');   /* 男女轮着来：书生、宫侍都看得到 */ if (!okI(MG.im[sx])) sx = okI(MG.im.m) ? 'm' : 'f'; const im = MG.im[sx], D = J.dim[sx];
    const dx = a.x - (a._mgx ?? a.x), dy = a.y - (a._mgy ?? a.y); a._mgx = a.x; a._mgy = a.y; const mv = Math.hypot(dx, dy) > .2;
    if (mv) { a._mgd = dirOf(dx, dy); a._mgw = now; } const walking = a._mgw != null && now - a._mgw < .18;   // 停下后稍等一下再切待机，免得一走一停地闪
    const ph = a._mgp || (a._mgp = Math.random() * 9), row = walking ? J.rows.move + (a._mgd || 0) : J.rows.idle, n = walking ? J.n.move : J.n.idle, ms = walking ? J.ms.move : J.ms.idle;
    const sh = J.shadow || { size: [31, 8], opacity: .23 }; shadow(ctx, a.x, a.y, sh.size[0], sh.size[1], (sh.opacity || .23) * 1.6);
    cell(ctx, im, D, row, Math.floor((now + ph) * 1000 / ms) % n, a.x, a.y); }
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function (T, cam, now) {
    if (inC() && ON) mgLoad();
    const on = mgOn(); const hid = on ? (world.mobs || []).filter(a => a.fire && !a.hidden) : null;
    if (hid) hid.forEach(a => { a.hidden = true; });
    try { orig.apply(this, arguments); } finally { if (hid) hid.forEach(a => { a.hidden = false; }); }
    if (hid) { try { for (const a of hid.sort((p, q) => p.y - q.y)) drawMG(a, now); } catch (e) {} } })(tileAmbientHigh);

  // 碰到梦傀开打：战斗标题别再写「鬼火」
  startBattle = (orig => function (cfg) { try { if (cfg && typeof cfg.title === 'string' && mgOn()) cfg.title = cfg.title.replace(/鬼火/, '梦傀'); } catch (e) {} return orig.apply(this, arguments); })(startBattle);

  // ---------- 精英梦傀首（(12,6)）：装睡 → 玩家走近惊醒 → 扑过来 → 碰到进精英战 ----------
  // 装睡时和路边的入梦百姓一样轻轻摇晃；离玩家 300 内惊醒（12 帧，1.2 秒），然后八方向追；追出 1000 远就放弃、走回原处再装睡。
  const ELITE = { st: 'sleep', t0: 0, x: null, y: null, dir: 0, busy: false };
  const EL = () => MG.meta && MG.meta.elite;
  const elReady = () => ON && inC() && EL() && okI(MG.im.elite) && !ST1().elite;
  function drawElite(g, now) { if (!elReady()) return; const E = EL(), D = E, im = MG.im.elite; if (ELITE.x == null) { ELITE.x = E.at[0]; ELITE.y = E.at[1]; }
    let row, col; const t = now - ELITE.t0;
    if (ELITE.st === 'sleep') { row = E.rows.sleep; col = Math.floor((now + 3.3) * 1000 / E.ms.sleep) % E.n.sleep; }
    else if (ELITE.st === 'wake') { row = E.rows.wake; col = Math.min(E.n.wake - 1, Math.floor(t * 1000 / E.ms.wake)); }
    else if (ELITE.st === 'chase' || ELITE.st === 'home') { row = E.rows.move + ELITE.dir; col = Math.floor(now * 1000 / E.ms.move) % E.n.move; }
    else { row = E.rows.idle; col = Math.floor(now * 1000 / E.ms.idle) % E.n.idle; }
    shadow(g, ELITE.x, ELITE.y, 40, 10, .38);
    cell(g, im, D, row, col, ELITE.x, ELITE.y);
    // 惊醒那一下：身上的梦丝亮起一圈暗红（缓起缓落，不闪）
    if (ELITE.st === 'wake' || (ELITE.st === 'chase' && t < .6)) { const k = ELITE.st === 'wake' ? Math.sin(Math.PI * clamp01(t / 1.4)) : 0; if (k > .01) { g.save(); g.globalCompositeOperation = 'lighter'; const cx = ELITE.x, cy = ELITE.y - 130, rg = g.createRadialGradient(cx, cy, 6, cx, cy, 150); rg.addColorStop(0, `rgba(255,70,90,${.32 * k})`); rg.addColorStop(1, 'rgba(255,40,60,0)'); g.fillStyle = rg; g.fillRect(cx - 150, cy - 150, 300, 300); g.restore(); } } }
  const freeAt = (x, y) => { try { const T = world.map.T, c = Math.floor(x / 40), r = Math.floor(y / 40); return T.block[r] && !T.block[r][c]; } catch (e) { return false; } };
  function stepTo(tx, ty, sp, dt) { const dx = tx - ELITE.x, dy = ty - ELITE.y, d = Math.hypot(dx, dy); if (d < 1) return d; const s = Math.min(d, sp * dt), ux = dx / d, uy = dy / d;
    const tries = [[ux, uy], [Math.sign(ux), 0], [0, Math.sign(uy)]]; for (const [vx, vy] of tries) { if (!vx && !vy) continue; const l = Math.hypot(vx, vy), nx = ELITE.x + vx / l * s, ny = ELITE.y + vy / l * s; if (freeAt(nx, ny)) { ELITE.dir = dirOf(vx, vy); ELITE.x = nx; ELITE.y = ny; break; } }
    return d; }
  function syncObj() { try { const o = world.map.T.objs.find(q => q.r443 && q.r443.o && q.r443.o.id === 'x_elite'); if (o) { o.x = ELITE.x - 130; o.y = ELITE.y - 300; o.w = 260; o.h = 320; o.sy = ELITE.y; } } catch (e) {} }
  async function eliteFight() { if (ELITE.busy) return; ELITE.busy = true; const p = world.player; world.locked = true; world.path = null; world.walkTarget = null; if (p) p.moving = false;
    try { try { playSnd('sfx_claw', .6); } catch (e) {} S.flash = .35; S.flashColor = '#ff3a4a'; await sleep(160); await fadeOut(200);
      const lead = makeEnemy('tw_mengkui', 4); lead.hp = lead.maxhp = Math.round(lead.maxhp * 2.4); lead.atk = Math.round(lead.atk * 1.2); lead.name = '精英·梦傀首 Lv13';   // 战斗帧 Codex 还在画，先用现有梦傀
      const ens = [lead, makeEnemy('tw_mengkui', 4), makeEnemy('tw_mengkui', 4)]; ens.slice(1).forEach(e => { e.name += ' Lv12'; });
      const pr = startBattle({ title: '万妖塔 · 第一层 · 梦傀首', bg: 'bg_tw1', enemies: ens, exp: Math.round(ens.reduce((s2, e) => s2 + e.maxhp, 0) * .3), gold: 220, tower: 1 });
      await fadeIn(260); const win = (await pr) === true; S.scene = drawMap; world.locked = true;
      if (win) { ST1().elite = 1; ELITE.st = 'gone'; const items = []; for (const [id, c] of [['h_huanhun', 1], ['h_mengtan', 2]]) if (ITEM_DB[id]) { addItem(id, c); items.push({ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×' + c, desc: ITEM_DB[id].desc || '' }); }
        await fadeIn(240); if (items.length && window.itemGet) await itemGet(items, '梦傀首 · 散');
      } else { partyRevive(.3); const s0 = R443.START.c, q = world.player; q.x = (s0[0] + .5) * TSZ; q.y = (s0[1] + .5) * TSZ - 8; world.cam = null; try { R443.MUST.on = true; R443.MUST.x = q.x; R443.MUST.y = q.y; } catch (e) {}
        ELITE.st = 'sleep'; ELITE.x = EL().at[0]; ELITE.y = EL().at[1]; await fadeIn(240); toast('败下阵来……回到内苑入口', 2600); }
    } catch (e) { console.warn('R473 elite', e); } finally { world.locked = false; ELITE.busy = false; } }
  updateMap = (orig => function (dt) { const r = orig.apply(this, arguments);
    try { if (!elReady()) return r; const p = world.player, now = performance.now() / 1000, E = EL(); if (ELITE.x == null) { ELITE.x = E.at[0]; ELITE.y = E.at[1]; }
      const busy = ELITE.busy || world.locked || dialog || choice || (typeof sysPanel !== 'undefined' && sysPanel) || (typeof battle !== 'undefined' && battle) || (window.R473 && R473.busy());
      if (!busy && p) { const d = Math.hypot(p.x - ELITE.x, p.y - ELITE.y); dt = Math.min(dt || .016, .05);
        if (ELITE.st === 'sleep' && d < 300) { ELITE.st = 'wake'; ELITE.t0 = now; try { playSnd('sfx_hurt', .35); } catch (e) {} }
        else if (ELITE.st === 'wake' && now - ELITE.t0 > E.n.wake * E.ms.wake / 1000 + .15) { ELITE.st = 'chase'; ELITE.t0 = now; }
        else if (ELITE.st === 'chase') { if (d > 1000) { ELITE.st = 'home'; } else { stepTo(p.x, p.y, 175, dt); if (Math.hypot(p.x - ELITE.x, p.y - ELITE.y) < 58) eliteFight(); } }
        else if (ELITE.st === 'home') { if (d < 300) ELITE.st = 'chase'; else if (stepTo(E.at[0], E.at[1], 120, dt) < 4) { ELITE.st = 'sleep'; } } }
      syncObj(); } catch (e) {} return r; })(updateMap);
  tileSetMap = (orig => function (m) { if (m === 'wyt_f1c' && ELITE.st !== 'gone') { ELITE.st = 'sleep'; ELITE.x = null; } return orig.apply(this, arguments); })(tileSetMap);

  // ---------- 测试面板 ----------
  let rowA = null, rowB = null;
  function mark() { if (rowA) for (const b of rowA.children) b.className = (b.dataset.v === '1') === ON ? 'on' : ''; if (rowB) for (const b of rowB.children) b.className = b.dataset.v === GROUND ? 'on' : ''; }
  const close = () => { try { const p = document.getElementById('dbgPanel'); if (p) { p.hidden = true; p.style.display = ''; } } catch (e) {} };   // 用 hidden 关（style.display 关了以后「测试」按钮就再也打不开面板）
  // 跳到演出各段（测试用）。除「内苑重置」外都先把门前的梦傀首记成打过了，免得演出被它扑断。
  async function jump(what) { close(); const s = ST1(), N = meta().objs.filter(o => /^lamp/.test(o.id)).length;
    if (what === 'reset') { s.mech = []; s.gate = 0; s.ward = 0; s.jhSeen = 0; s.elite = 0; ELITE.st = 'sleep'; ELITE.x = null; try { delete S.flags.tw_clear_1; } catch (e) {} }
    else { s.elite = 1; ELITE.st = 'gone'; }
    if (what === 'two' || what === 'lamp') { s.mech = [1, 1]; s.gate = 0; s.ward = 0; s.jhSeen = 0; }
    if (what === 'gate' || what === 'open') { s.mech = Array(N).fill(1); s.ward = 1; s.gate = 0; s.jhSeen = 0; }
    if (what === 'tree' || what === 'appear') { s.mech = Array(N).fill(1); s.ward = 1; s.gate = 1; s.jhSeen = what === 'appear' ? 0 : s.jhSeen; }
    if (what === 'fight') { s.mech = Array(N).fill(1); s.ward = 1; s.gate = 1; s.jhSeen = 1; }
    if (what !== 'reset') try { delete S.flags.tw_clear_1; } catch (e) {}
    if (!inC()) { R443.goZone('c'); for (let i = 0; i < 200 && !(inC() && !(window.MAP_LOADING && MAP_LOADING())); i++) await sleep(100); await sleep(400); }
    const p = world.player; if (!p) return; const g = G(), L3 = meta().objs.filter(o => /^lamp/.test(o.id))[2];
    const at = { two: [L3.bx, L3.by + 60], lamp: [L3.bx, L3.by + 60], reset: [g.bx, g.by + 200], gate: [g.bx, g.by + 40], open: [g.bx, g.by + 40], tree: [g.bx, g.by - 330], appear: [g.bx, g.by + 40], fight: [g.bx, g.by + 40] }[what];
    if (at) { p.x = at[0]; p.y = at[1]; p.face = 'up'; world.cam = null; } try { R443.applyGate(); } catch (e) {}
    const R = window.R473; await sleep(300);
    if (what === 'lamp' && R) { s.mech = Array(N).fill(1); try { playSnd('sfx_buff', .6); } catch (e) {} return R.wardBreak(); }   // 第三盏灯亮 → 镜头 → 禁制消散
    if (what === 'open' && R) return R.gateTalk();                                                                                 // 推门 → 开门 → 现身 → 对白 → 开打
    if ((what === 'appear' || what === 'fight') && R) return R.bossStage();                                                          // 只看现身 / 直接开打（已现身过：一句话就开打）
    toast({ reset: '内苑已重置', two: '差一盏灯：点灯看破禁', gate: '禁制已破：点门看开门', tree: '门已开' }[what] || '', 2200); }   // 提示要短：20 字以上会变成星旋说话（R134）
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r473]')) return;
      const h = document.createElement('h4'); h.textContent = '11-28 新加 · 万妖塔一层内苑（R473 新画，记在本机）'; h.setAttribute('data-r473', '1');
      rowA = document.createElement('div'); rowA.className = 'row';
      for (const [v, t] of [['1', '内苑：新画 R473'], ['0', '内苑：旧画 R443']]) { const b = document.createElement('button'); b.textContent = t; b.dataset.v = v; b.onclick = () => setInner(v === '1'); rowA.appendChild(b); }
      rowB = document.createElement('div'); rowB.className = 'row';
      for (const [v, t] of [...Object.keys(GRS).map(g => [g, '内苑地面：' + (GNAME[g] || g) + (g === GDEF ? '（默认）' : '')]), ['def', '内苑地面：暗红（备选）']]) { const b = document.createElement('button'); b.textContent = t; b.dataset.v = v; b.onclick = () => setGround(v); rowB.appendChild(b); }
      const rowC = document.createElement('div'); rowC.className = 'row';
      for (const [v, t] of [['reset', '内苑重置'], ['two', '差一盏灯（自己点）'], ['gate', '禁制已破·到门前（自己推门）'], ['tree', '门已开·进北庭']]) { const b = document.createElement('button'); b.textContent = t; b.onclick = () => jump(v); rowC.appendChild(b); }
      // 直接放演出的某一段
      const rowD = document.createElement('div'); rowD.className = 'row';
      for (const [v, t] of [['lamp', '演出①点亮第三盏灯→镜头→禁制消散'], ['open', '演出②推门→开门→现身→对白→开打'], ['appear', '演出③只看绛蘅现身'], ['fight', '演出④已现身·直接开打']]) { const b = document.createElement('button'); b.textContent = t; b.onclick = () => jump(v); rowD.appendChild(b); }
      p.appendChild(h); p.appendChild(rowA); p.appendChild(rowB); p.appendChild(rowC); p.appendChild(rowD); mark(); };
    // 面板每次打开都会整个重画（innerHTML），所以一直盯着它：我们这几行没了就再补上
    const watch = p => { add(); new MutationObserver(() => { if (!p.querySelector('[data-r473]')) add(); }).observe(p, { childList: true }); };
    if (document.getElementById('dbgPanel')) watch(document.getElementById('dbgPanel')); else { const mo = new MutationObserver(() => { const p = document.getElementById('dbgPanel'); if (p) { mo.disconnect(); watch(p); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}

  window.R473I = { on: () => ON, ground: () => GROUND, setInner, setGround, meta, HOLE, HOLE_C, TREE, MT, drawOcc, NEW, OLD, jump, MG, gateFrame, ELITE, eliteFight };
})();
