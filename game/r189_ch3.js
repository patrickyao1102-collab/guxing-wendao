// ================= R189 第三章 · 追虎入境 → 女娲秘境（作者 11-10）=================
// 作者：「打败魔虎之后 Codex 已经做好了秘境开启的各种多帧图，然后直接进去，就进到第一个地图啊」「插画版本早就取消了」
// 以前：追虎迷径东北虎痕处打魔虎 → 黑屏一句旁白 → 进整幅插画「秘境」（女神像四连 / 破庙 / 灵泉都是插画场景）。
// 现在（照 Codex R107「林尽闻声 · 追虎入境」那包的 story.motion）：
//   追虎迷径：顺着虎爪印往东北走，出东北隘口 → 林尽闻声：古樟东侧魔虎伏在妖狼尸体上 → 开打
//   → 打完魔虎沿兽径逃向东北石脊（侧奔 / 斜背各 8 帧，步幅跟着距离走），离石脊 364px 时月界裂隙初开 48 帧、再循环 32 帧水纹
//   → 魔虎一头扎进裂隙，叶孤星和云霆顺着兽径追到裂隙前 → 「追！」→ 直接落到秘境第一张图「初入秘境 · 绛荚分溪」
//   秘境七张图一张张往里走：古樟井庭（幻境一 · 补天）→ 五色石山径（幻境二 · 讲道）→ 碧潭听瀑（幻境三 · 九人）
//   → 瀑后归径 → 千丝织天殿（幻境四 · 化光、「你们是谁」、殿角白衣男子赠纳月）→ 月湖 · 双息灵泉（连破三重、云霆剑心解封）
//   → 出秘境落回林尽闻声（夜）→ 古樟下偷听邪修（原来就有）。
// 幻境不再铺整屏插画：就在地图上蒙一层白光、飘光点，旁白照常。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.m_yy_verge || !TMAPS.m_nw_creek) return;
  const F = () => (S.flags || (S.flags = {}));
  const V = TMAPS.m_yy_verge, TG = TMAPS.m_yy_tiger;
  const NW = n => TMAPS['m_nw_' + n];
  const at = (x, y) => [x / 64 - .5, y / 64 - .8];
  const here = n => world.mapName === n;

  // ---------- 素材（Codex R107 定稿拼接_追虎迷径 / objects）----------
  const IM = {};
  for (const n of ['tiger_run_side', 'tiger_run_back', 'rift_open', 'rift_idle', 'tiger_map', 'wolf_dead', 'scale', 'claw']) { const im = new Image(); im.onload = () => { IM[n] = im; }; im.src = 'r189/' + n + '.webp'; }
  const MOTION = {
    run: { side: { img: 'tiger_run_side', frames: 8, cols: 4, cell: [376, 250], pivot: [188, 233] }, back: { img: 'tiger_run_back', frames: 8, cols: 4, cell: [376, 250], pivot: [188, 233] }, stride: 218 },
    rift: { anchor: [3884, 436], trigger: 364, open: { img: 'rift_open', frames: 48, cols: 8, cell: [212, 334], pivot: [106, 312], fps: 24 }, idle: { img: 'rift_idle', frames: 32, cols: 8, cell: [212, 334], pivot: [106, 312], fps: 24 } },
  };
  const ROUTE = [[2636, 1444], [2636, 1420], [2660, 1396], [2660, 1372], [2668, 1364], [2668, 1356], [2676, 1348], [2676, 1332], [2684, 1324], [2684, 1316], [2692, 1308], [2692, 1300], [2700, 1292], [2700, 1284], [2708, 1276], [2708, 1260], [2716, 1252], [2716, 1228], [2740, 1204], [2740, 1132], [2748, 1124], [2748, 1116], [2756, 1108], [2756, 1092], [2764, 1084], [2764, 1076], [2772, 1068], [2772, 1060], [2780, 1052], [2780, 1044], [2788, 1036], [2788, 1020], [2796, 1012], [2900, 908], [2908, 908], [2916, 900], [2924, 900], [2932, 892], [2948, 892], [2956, 884], [3068, 884], [3076, 892], [3092, 892], [3100, 900], [3188, 812], [3204, 812], [3228, 788], [3236, 788], [3244, 780], [3300, 780], [3348, 732], [3356, 732], [3364, 724], [3428, 660], [3444, 660], [3452, 652], [3476, 652], [3500, 676], [3564, 676], [3572, 684], [3580, 684], [3588, 692], [3604, 692], [3612, 700], [3676, 764], [3676, 772], [3684, 780], [3684, 788], [3692, 796], [3692, 812], [3700, 820], [3772, 748], [3772, 740], [3780, 732], [3780, 724], [3788, 716], [3788, 700], [3796, 692], [3796, 572], [3788, 564], [3860, 492], [3860, 484], [3868, 476], [3868, 468], [3876, 460], [3876, 444], [3884, 436]];
  // 林尽闻声地上的痕迹：倒地妖狼、散落铁鳞、带血虎爪痕（一路指向东北石脊）
  const PROPS = [['wolf_dead', 2529, 1472, 82, 54], ['scale', 2508, 1511, 22, 30], ['claw', 2416, 1496, 39, 71], ['claw', 2730, 1168, 39, 71], ['scale', 3063, 894, 22, 30], ['claw', 3372, 719, 39, 71], ['claw', 3707, 775, 39, 71], ['scale', 3823, 505, 22, 30]];
  const TIGER_AT = [2636, 1444];

  function measure(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, L, total: L[L.length - 1] }; }
  function along(P, d) { d = Math.max(0, Math.min(P.total, d)); let a = 0, b = P.L.length - 1; while (a + 1 < b) { const m = (a + b) >> 1; if (P.L[m] <= d) a = m; else b = m; } if (P.pts.length === 1) return P.pts[0].slice(); const w = (d - P.L[a]) / (P.L[b] - P.L[a] || 1); return [P.pts[a][0] + (P.pts[b][0] - P.pts[a][0]) * w, P.pts[a][1] + (P.pts[b][1] - P.pts[a][1]) * w]; }
  const RUN = measure(ROUTE);
  function cell(clip, i, x, y, scale = 1, flip = false, alpha = 1, roll = 0, wipe = 0) {
    const im = IM[clip.img]; if (!im) return; const [w, h] = clip.cell, [ax, ay] = clip.pivot;
    ctx.save(); ctx.translate(x, y); ctx.rotate(roll); ctx.scale(scale * (flip ? -1 : 1), scale); ctx.globalAlpha *= alpha;
    if (wipe > 0) { ctx.beginPath(); ctx.rect(-ax, -ay, w * (1 - wipe), h); ctx.clip(); }   // 头先没进裂缝，身子尾巴跟着消失
    ctx.drawImage(im, (i % clip.cols) * w, Math.floor(i / clip.cols) * h, w, h, -ax, -ay, w, h); ctx.restore();
  }

  // ---------- 林尽闻声上的动态物件：混进地图物件里按脚底排序 ----------
  // st.gate：裂隙已开的秒数（null = 还没开）；st.chase：魔虎奔逃状态
  const st = { gate: null, chase: null, tigerHere: false };
  const gateOpen = () => st.gate != null && st.gate >= MOTION.rift.open.frames / MOTION.rift.open.fps;
  function drawGate() { if (st.gate == null || st.gate < 0) return; const g = MOTION.rift, ok = gateOpen(), clip = ok ? g.idle : g.open, t = ok ? st.gate - g.open.frames / g.open.fps : st.gate;
    const n = Math.floor(Math.max(0, t) * clip.fps + 1e-6), i = ok ? n % clip.frames : Math.min(clip.frames - 1, n); cell(clip, i, g.anchor[0], g.anchor[1]); }
  function drawTiger() {
    if (st.chase && st.chase.actor) { const c = st.chase.actor, gy = c.a[1] + c.oy, bx = c.a[0] + c.ox;
      if (c.shadow > .02) { ctx.save(); ctx.translate(bx, gy - 2); ctx.scale(c.clip === MOTION.run.back ? 63 : 87, 11); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(24,29,36,' + .24 * c.shadow + ')'); g.addColorStop(1, 'rgba(24,29,36,0)'); ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore(); }
      cell(c.clip, c.frame, bx, gy - c.lift, c.scale, c.flip, c.fade, c.roll, c.wipe); return; }
    if (st.tigerHere || (st.chase && !st.chase.run)) { const im = IM.tiger_map || IMG.e_tiger2; if (!im) return; const now = performance.now() / 1000, br = 1 + Math.sin(now * 1.6) * .012, k = IM.tiger_map ? 1 : 178 / im.height;
      ctx.save(); ctx.translate(TIGER_AT[0], TIGER_AT[1]); ctx.scale(k, k * br); ctx.drawImage(im, -im.width / 2, -im.height); ctx.restore(); }   // 地图版魔虎没加载到时先用战斗模型顶上
  }
  function mkObj(id, x, y, w, h, sy, draw) { return { bk: 1, id: 'r189_' + id, x, y, w, h, sy, flat: false, draw }; }   // 不带 img：小地图缩略图不画它（带了没加载的 img 会让小地图退回方块图）
  function installVerge() {
    const T = world.map && world.map.T; if (!T || !here('m_yy_verge') || T._r189) return; T._r189 = 1;
    for (const [n, x, y, ax, ay] of PROPS) T.objs.push(mkObj(n + x, x - ax, y - ay, ax * 2, ay, y - 60, () => { const im = IM[n]; if (im) ctx.drawImage(im, x - ax, y - ay); }));   // 贴地痕迹压在人物脚下
    const tg = mkObj('tiger', 2000, 300, 2100, 1300, TIGER_AT[1], drawTiger); T.objs.push(tg); st.tigerObj = tg;
    const gt = mkObj('gate', 3700, 50, 400, 420, MOTION.rift.anchor[1] + 4, drawGate); T.objs.push(gt);
  }
  drawBaked = (o => function (ob, now) { if (ob && ob.draw && /^r189_/.test(ob.id)) { ob.draw(now); return; } return o.apply(this, arguments); })(drawBaked);

  // ---------- 1) 追虎迷径：只留入林旁白，魔虎挪到林尽闻声 ----------
  const Q_TRACK = '幽影林：顺着虎爪印往东北追（东北隘口 · 林尽闻声）', Q_TIGER = '林尽闻声：古樟东侧传来兽吼', Q_RIFT = '林尽闻声：魔虎逃进了东北石脊的裂隙——追进去';
  ch3ForestEnter = async function () {
    S.hud = true;
    if (!F().ch3_forest) { F().ch3_forest = 1;
      await narrate('幽影林。古木遮天，林子里的树颜色怪得很——紫的、绛红的、银白的，枝杈间隐隐挂着什么。');
      await say('云霆', '小心。树上那些……不是果子。');
      await say('星旋', '东北边……林子深处，那股空间波动越来越强了。地上有新鲜的虎爪印，顺着走。');
      toast('顺着虎爪印往东北走，出东北隘口', 2800); }
    if (!F().ch3_tiger) S.quest = Q_TRACK;
  };
  if (TG) { TG.onEnter = async () => { const f = F(); if (!(f.qingxiao && f.ch3_report) || f.ch3_tiger) return; await ch3ForestEnter(); };
    for (const e of TG.exits || []) if (e.to === 'm_yy_verge') { e.cond = null; delete e.msg; } }
  for (const e of V.exits || []) if (e.to === 'm_yy_tiger') { e.cond = null; delete e.msg; }

  // ---------- 2) 林尽闻声：魔虎 → 奔逃 → 裂隙 ----------
  const tigerDue = () => { const f = F(); return !!(f.qingxiao && f.ch3_report && !f.ch3_tiger && !f.ch3_forest_done); };
  const riftDue = () => { const f = F(); return !!(f.ch3_tiger && f.ch3_mj === 1 && !f.ch3_in); };   // 打完虎还没进秘境（读档回来也能进）
  function vergeTick() {
    if (!here('m_yy_verge')) return; installVerge();
    st.tigerHere = tigerDue() && !st.chase;
    if (riftDue() && st.gate == null && !st.chase) st.gate = 3;   // 读档：裂隙直接是张开的
    if (!world.triggers) return;
    if (tigerDue() && !world.triggers.some(t => t._r189 === 'tiger' && !t.done)) { addTrigger(2390, 1510, 249, () => tigerFight(), true, true); world.triggers[world.triggers.length - 1]._r189 = 'tiger'; if (!/林尽闻声|兽吼/.test(S.quest || '')) S.quest = Q_TIGER; }
    if (riftDue() && !st.chase && gateOpen() && !world.triggers.some(t => t._r189 === 'rift' && !t.done)) { addTrigger(3813, 535, 138, () => enterRift(), true, true); world.triggers[world.triggers.length - 1]._r189 = 'rift'; S.quest = Q_RIFT; }
  }
  setInterval(() => { try { if (typeof battle !== 'undefined' && battle) return; vergeTick(); } catch (e) {} }, 400);
  V.onEnter = (o => async function () { vergeTick(); if (o) return o.apply(this, arguments); })(V.onEnter);
  // 裂隙计时（跟画面帧走）
  (function loop() { let t0 = performance.now(); const step = () => { const t = performance.now(), dt = Math.min(.05, (t - t0) / 1000); t0 = t; if (st.gate != null && here('m_yy_verge')) st.gate += dt; requestAnimationFrame(step); }; requestAnimationFrame(step); })();

  async function tigerFight() {
    world.locked = true; world.path = null; world.player.moving = false; world.camFocus = [TIGER_AT[0] - 60, TIGER_AT[1] - 80];
    await narrate('古樟东侧的空地上，一头浑身覆满黑铁鳞甲的巨虎正伏在一具妖狼的尸体上撕咬。它缓缓抬起头，额心那只竖眼亮起了暗红的光。');
    await say('星旋', '铁鳞魔虎，凝丹五重！小子，比你高了三个小境界——');
    await say('叶孤星', '那正好，试试刚换的星罗。');
    await fadeOut(250);
    const pr = startBattle({ title: '铁鳞魔虎', bg: 'bg_youying', enemies: [tigerBoss()], exp: 260, gold: 400, boss: true, loot: '铁鳞 ×3' }); await fadeIn(250); await pr;
    S.scene = drawMap; F().ch3_mj = 1; F().ch3_tiger = 1; world.camFocus = null;
    await chase();
  }
  // 魔虎沿兽径逃向东北石脊；主角和云霆顺着兽径追（照 Codex 预览里的步速、裂口对位、钻进去的收缩）
  async function chase() {
    const p = world.player; world.locked = true; world.scripted = true;
    const lead = measure([[p.x, p.y], ROUTE[0]]), walk = measure([[p.x, p.y], ...ROUTE.slice(1)]);
    const c = st.chase = { d: 0, sign: 1, angle: 'back', entry: 0, walked: 0, lead: lead.total, walk, actor: null, said: false };
    if (st.tigerObj) st.tigerObj.sy = TIGER_AT[1];
    await narrate('魔虎一声长嚎，甩下妖狼的尸体，拖着伤躯沿兽径往东北窜去——');
    let t0 = performance.now(); c.run = true;
    for (;;) {
      await nextFrame(); const t = performance.now(), dt = Math.min(.05, (t - t0) / 1000); t0 = t;
      if (!here('m_yy_verge')) break;
      // 魔虎
      const left = RUN.total - c.d, spd = left < MOTION.rift.trigger ? 154 : c.d < 125 ? 322 : 428;
      c.d = Math.min(RUN.total, c.d + dt * spd); const rem = RUN.total - c.d, a = along(RUN, c.d);
      if (st.gate == null && rem < MOTION.rift.trigger) { st.gate = 0; playSnd && playSnd('sfx_charge', .5); }
      const b0 = along(RUN, c.d - 46), b1 = along(RUN, c.d + 52), vx = b1[0] - b0[0], vy = b1[1] - b0[1];
      if (Math.abs(vx) > 18) c.sign = Math.sign(vx); const slope = -vy / Math.max(8, Math.abs(vx));
      if (slope > .86) c.angle = 'back'; else if (slope < .49) c.angle = 'side'; if (rem < 85) c.angle = 'back';
      const clip = MOTION.run[c.angle], air = rem <= .01; if (air) c.entry += dt;
      const ing = air ? Math.min(1, c.entry / .64) : 0, frame = air ? (ing < .22 ? 2 : 3) : Math.floor(c.d / MOTION.run.stride * clip.frames) % clip.frames;
      const u = Math.sin(Math.PI * .5 * ing), scale = 1 - .55 * u, wipe = Math.max(0, (ing - .12) / .88), ld = Math.min(143, clip.cell[0] * (1 - wipe) - clip.pivot[0]);
      const ap = Math.min(1, Math.max(0, 1 - rem / 200)), aim = ap * ap * (3 - 2 * ap);
      c.actor = ing >= 1 ? null : { clip, frame, a, flip: c.sign < 0, scale, ox: -c.sign * ld * aim * scale, oy: aim * 22, lift: u * 112, roll: ing * .04, wipe, fade: 1 - .15 * ing, shadow: 1 - u };
      if (st.tigerObj) st.tigerObj.sy = a[1] + (c.actor ? c.actor.oy : 0);
      // 主角顺着兽径跟（落后魔虎 153px，停在裂隙前 146px）
      const stop = walk.total - 146, tgt = Math.max(0, Math.min(stop, c.lead + c.d - 153)), gap = tgt - c.walked;
      if (gap > 0) { const sp = Math.min(675, 420 + gap * .7); c.walked += Math.min(gap, dt * sp); const q = along(walk, c.walked), q0 = along(walk, Math.max(0, c.walked - 22)), fx = q[0] - q0[0], fy = q[1] - q0[1];
        if (Math.abs(fx) + Math.abs(fy) > .5) { if (Math.abs(fx) > Math.abs(fy)) { p.face = fx > 0 ? 'right' : 'left'; p.dir = fx > 0 ? 1 : -1; } else p.face = fy > 0 ? 'down' : 'up'; }
        p.x = q[0]; p.y = q[1]; p.moving = true; } else p.moving = false;
      if (ing >= 1 && c.walked >= walk.total - 158) break;
      if (performance.now() - t > 0 && c.entry > 6) break;   // 保险
    }
    p.moving = false; world.scripted = false; st.chase = null; p.face = 'up';
    if (!here('m_yy_verge')) return;
    if (st.gate == null) st.gate = 2;
    await say('云霆·惊', '空间裂缝？！');
    await say('星旋', '月界的气息……这道裂缝通着一处秘境！');
    await say('叶孤星', '追！');
    await enterRift();
  }
  // 作者 11-12：纯净试玩版 / 安卓包到女娲秘境之前为止（打包时写入 GX_TRIAL；测试版没有这个标记，照常进秘境）。本地加 ?trial=1 可以试。
  const TRIAL = () => !!window.GX_TRIAL || /[?&]trial=1/.test(location.search);
  async function trialEnd() {
    world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    await narrate('裂隙深处月华流转，隐约传来溪水与编钟之声——那是一处尘封万年的秘境。');
    try { window.saveGame && window.saveGame(); } catch (e) {}
    await fadeOut(600); const prev = S.scene;
    S.scene = () => { ctx.fillStyle = '#04050b'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `76px ${BRUSH}`; textOutline('试玩版 · 到此为止', W / 2, 250, '#ffe08a', '#2a0f00', 8);
      ctx.font = `600 26px ${FONT}`; ctx.fillStyle = '#d9c7a0'; ctx.fillText('女娲秘境与之后的故事，还在打磨中，敬请期待。', W / 2, 360);
      ctx.fillText('想知道叶孤星接下来的故事？请看小说《孤星问道》', W / 2, 404);
      ctx.font = `600 20px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillText('进度已保存 · 点击屏幕继续', W / 2, 620); ctx.restore(); };
    const hud0 = S.hud; S.hud = false;
    await fadeIn(600); await sleep(900);
    await new Promise(res => { const h = () => { window.removeEventListener('pointerdown', h, true); window.removeEventListener('keydown', h, true); res(); }; window.addEventListener('pointerdown', h, true); window.addEventListener('keydown', h, true); });
    try { consumeTap(); } catch (e) {}
    await fadeOut(400); S.scene = prev || drawMap; S.hud = hud0; await fadeIn(400); try { consumeTap(); } catch (e) {}
    const c = await choose('试玩内容已全部体验完', ['留在幽影林继续游历', '返回主界面']);
    if (c === 1) { try { await fadeOut(400); } catch (e) {} window.GX_GOING_HOME = true; S.started = false; try { sessionStorage.removeItem('gx_alive'); sessionStorage.setItem('gx_home', '1'); } catch (e) {} location.href = location.pathname; return; }
    if (world.player) { world.player.y += 150; world.player.face = 'down'; }   /* 退开一点，免得站在裂隙触发点上反复弹 */
    world.locked = false;
  }
  async function enterRift() {
    if (TRIAL()) return trialEnd();
    world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    await narrate('两人刚踏进裂隙，一股巨力猛地将他们卷了进去，眼前天旋地转——');
    S.flash = 1; S.flashColor = '#ffffff'; try { playSnd('sfx_ult', .7); } catch (e) {}
    F().ch3_in = 1; st.gate = null;
    await fadeOut(900);
    const s = NW('creek').start || [4.42, 12.22]; tileSetMap('m_nw_creek', s[0], s[1], 'right'); S.scene = drawMap; S.hud = true;
    world.locked = true; await fadeIn(1200); await creekArrive(); world.locked = false;
  }

  // ---------- 3) 女娲秘境：一张张往里走 ----------
  const Q = {
    creek: '女娲秘境：循溪而行（古樟井庭）', glade: '女娲秘境：古樟井庭——井里有光', stones: '女娲秘境：五色石山径', falls: '女娲秘境：碧潭听瀑——水帘后面', passage: '女娲秘境：瀑后归径，传送法阵入女娲宫',
    temple: '女娲秘境：千丝织天殿', spring: '女娲秘境：神殿东侧 · 月湖灵泉',
  };
  async function creekArrive() {
    if (F().ch3_c0) return; F().ch3_c0 = 1;
    await narrate('再睁眼时，铁鳞魔虎早已不见踪影，身后的裂隙也合上了。');
    await narrate('眼前是一片从未见过的天地：溪水泛着银光，半透明的灵植漂浮在空中，伸手去碰，手指却直接穿了过去。');
    await say('云霆', '这些灵植……碰不到？');
    await say('星旋', '（……这里的气息。不对，我好像在哪里……）');
    await say('叶孤星', '星旋？');
    await say('星旋', '没、没事！顺着溪往里走，看看这是什么地方。');
    S.quest = Q.creek;
  }
  // 幻境：地图上蒙一层白光、飘光点，旁白照常（不再铺整屏插画）
  async function vision(lines) {
    const t0 = performance.now(), prev = S.scene;
    S.scene = function () { prev.apply(this, arguments); const t = (performance.now() - t0) / 1000, a = Math.min(1, t / 1.2);
      ctx.save(); ctx.globalAlpha = .5 * a; ctx.fillStyle = '#f2f6ff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.8)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
      if (typeof motesOverlay === 'function') motesOverlay(t); };
    S.flash = 1; S.flashColor = '#ffffff'; try { playSnd('sfx_charge', .5); } catch (e) {}
    try { for (const l of lines) { if (Array.isArray(l)) await say(l[0], l[1]); else await narrate(l); } } finally { S.scene = prev; S.flash = .7; S.flashColor = '#ffffff'; }
  }
  const BEATS = {
    glade: { at: [915, 760], r: 170, flag: 'ch3_v1', async run() {
      await narrate('井庭中央那口古井忽然泛起五彩的光。叶孤星低头一看——井水里映出的不是自己的脸。');
      await vision(['天，裂开了。', '混沌的紫黑色光芒从裂缝里倾泻而下，所过之处，山河崩碎。', '一位人首蛇身的女神托起五彩神石，迎着天裂飞了上去。', ['女神', '……我来补。']]);
      await say('云霆·惊', '刚才那是……女娲补天？');
      await say('星旋', '（……）'); S.quest = Q.stones; } },
    stones: { at: [930, 720], r: 190, flag: 'ch3_v2', async run() {
      await narrate('山径旁那块人首蛇身的青石浮雕，双眼忽然亮了。两旁的五色石一块接一块跟着亮起来，光连成一片，像月光铺在白玉上——');
      await vision(['月下，白玉高台。女神为三名弟子讲道。', ['女神', '夜儿修神月，心要静；若儿修幻月，莫失本心。还有你——冥儿。'], '那个斜躺着、嘴里叼着草的少年懒懒地睁开眼。', ['女神', '你修纳月大道。吞天地之万法……为师最担心的，就是你。'], ['冥儿', '师尊放心，弟子……只吞该吞的。']]);
      await say('云霆·惊', '他……刚才是不是往我们这边看了一眼？'); S.quest = Q.falls; } },
    falls: { at: [700, 640], r: 150, flag: 'ch3_v3', async run() {
      await narrate('灵瀑的水雾里浮出九道人影，一道一道，颜色各不相同。');
      await vision(['九道身影立于云海之上，各自身上亮起不同颜色的光。', ['女神', '我走之后，月界交给你们九人护持。'], ['女神', '记住——无论过去多少年，都不许让「那东西」再从裂缝里出来。']]);
      await say('星旋', '（九个人……九道光……）'); S.quest = Q.passage; } },
    temple: { at: [1120, 1180], r: 220, flag: 'ch3_v4', async run() {
      await narrate('殿前的千丝忽然无风自动，一缕缕光丝织成了一幅画——');
      await vision(['天裂再一次张开。', '这一次，女神没有再托起神石。她的身体化作了万千光点，一片一片，融进了那道裂缝里。', '裂缝合上的那一刻，她回过头，笑了一下。', '地上，那个叼草的少年跪在地上，伸出手，什么也没有抓住。', ['???', '……你们是谁？']]);
      await narrate('那个声音像是隔着千万年传来。叶孤星和云霆浑身一震——再回过神时，刚才看到的一切，竟像退潮一样从脑海里飞快地褪去。');
      await say('云霆·惊', '我们……刚才看到了什么？');
      await say('叶孤星', '……想不起来了。只记得，很难过。');
      await baiyi(); } },
    spring: { at: [1150, 760], r: 200, flag: 'ch3_sp', async run() { await spring(); } },
  };
  // 千丝织天殿殿角：白衣男子（原来的「破庙」）
  // 作者 11-11：月冥用魔族那个音色（不是魔化后的）配音，八句各一条（ym_1..8，Claude 选的版本）
  let ymA = null; const YMV = {};
  function ymv(n) { try { if (typeof AUD !== 'undefined' && AUD.muted) return; if (ymA) ymA.pause(); const a = YMV[n] || (YMV[n] = new Audio('r189/ym_' + n + '.mp4')); a.currentTime = 0; ymA = a; a.play().catch(() => {}); } catch (e) {} }
  // 先把八句下好，免得点开对话才开始下
  function ymPre() { for (let n = 1; n <= 8; n++) if (!YMV[n]) { const a = new Audio('r189/ym_' + n + '.mp4'); a.preload = 'auto'; YMV[n] = a; } }
  async function baiyi() {
    ymPre();
    // 作者 11-11：月冥改到女娲石像脚下 —— 一开始看不见，触发后由无数白色光点凝聚成形（R195）
    const YM = window.R195YM, P0 = world.player;
    if (YM) {
      await moveActor(P0, 1090, 712, 200); P0.face = 'up';
      await narrate('殿后，女娲石像手中的五色石，忽然亮了。');
      await YM.appear();
      await narrate('月华落在石座上，无数细小的光点从四面八方飞来，聚成了一个人——');
      await narrate('一个白衣男子半倚着神像的蛇尾坐着，赤着脚，长发随意散着，指间懒懒地绕着一缕银丝，像是已经在这里坐了很多年。');
    } else {
    await narrate('大殿的阴影里，不知什么时候多了一张草席。');
    await narrate('草席上躺着一个白衣男子，赤着脚，长发随意散着，像是已经在这里躺了很多年。'); }
    ymv(1);
    await say('白衣男子', '……多少年了，终于又有人走到这里。');
    await say('星旋', '（——！！）');
    await narrate('叶孤星第一次感觉到，玉佩在发抖。');
    ymv(2);
    await say('白衣男子·浅笑', '你们修的，是「无量剑派」的东西。有意思……一个星，一个剑。');
    await say('叶孤星', '前辈认得我们的功法？');
    ymv(3);
    await say('白衣男子·追忆', '认得。很久以前的老朋友了。');
    ymv(4);
    await say('白衣男子·哈欠', '（打了个哈欠）既然来了，送你们一点小玩意儿。');
    if (YM) await YM.rise();   // 懒洋洋撑着蛇尾站起来，迈下石座
    await narrate('他抬起一根手指，两缕极细的银光没入了叶孤星和云霆的眉心。');
    if (YM) await YM.gift([P0, (world.followers || [])[0]]);
    S.flash = 1; S.flashColor = '#e8e0ff'; try { playSnd('sfx_ult', .6); } catch (e) {} await sleep(600);
    ymv(5);
    await say('白衣男子·神威', '纳月之力。吞天地之万法……');
    ymv(6);
    await say('白衣男子·冷视', '用的时候，别吞错了东西。');
    if (!S.hero.skills.includes('tunshi')) S.hero.skills.push('tunshi'); F().yt_tunshi = 1;
    try { playSnd('sfx_sword_ring'); } catch (e) {} await showPanel('领悟 · 纳月之力', ['!纳月 · 吞噬', SKILL_DB.tunshi.desc, '灵力消耗 24']);
    await showPanel('云霆 · 领悟纳月之力', ['!纳月 · 吞噬（秘传）', '云霆也得了这缕银光：吞噬敌人灵力，伤害的一半化为自身气血', '灵力消耗 24']);
    ymv(7);
    await say('白衣男子·悲悯', '殿东边有口泉，泡一泡，对你们有好处。');
    ymv(8);
    await say('白衣男子·哈欠', '去吧，我要睡了。');
    if (YM) { const v = YM.vanish(); await narrate('话音刚落，白衣男子的身影一点一点散成了光点，飘回了五色石里。'); await v; }
    else await narrate('话音刚落，白衣男子的身影就像雾一样淡了下去，连那张草席也不见了。');
    await say('叶孤星', '星旋，那人什么修为？');
    await say('星旋', '……我不知道。');
    await say('星旋', '即便是在仙界，我也没见过如此恐怖的存在。');
    F().ch3_bai = 1; S.quest = Q.spring;
  }
  // 月湖 · 双息灵泉：连破三重、云霆剑心解封 → 出秘境
  async function spring() {
    const p = world.player, glow = addFx({ life: 9999, layer: 0, draw(f) { if (!here('m_nw_spring')) { f.t = f.life; return; } if (typeof lightPillar === 'function') { const c = world.cam || { x: 0, y: 0 }, z = (typeof VZ === 'function' ? VZ() : 1); lightPillar((1150 - c.x) * z, (620 - c.y) * z, 260, 420, [170, 240, 255], performance.now() / 1000); } } });
    await narrate('灵泉的水泛着青金色的光。叶孤星刚盘膝坐下，泉中灵气便像潮水一样涌进经脉。');
    for (const [lv, txt] of [[12, '凝丹三重！'], [13, '凝丹四重！'], [14, '凝丹五重！']]) {
      S.flash = .9; S.flashColor = '#fff3c0'; S.shake = 10; try { playSnd('sfx_ult', .5); } catch (e) {}
      floatText(p.x, p.y - 170, txt, '#ffe48a', 60, 1.3, BRUSH); await sleep(1200);
    }
    if (S.hero.lv < 14) await C3.breakTo(14, '连破三重 · 凝丹五重');
    await narrate('就在这时，身旁传来一声压抑的闷哼。');
    await narrate('云霆浑身发抖，脸色白得像纸，周身凝出了一层薄霜——霜还在往外蔓延，连泉水都开始结冰。');
    await say('星旋', '糟了！是冰封剑心！这小子这几天一直在偷偷用这个法子练剑！');
    await say('叶孤星', '冰封剑心？');
    await say('星旋', '把悲、把恨、把想念，统统冻起来。心里什么都没了，剑就能快到极致。');
    await say('星旋', '可灵泉的灵气一冲，冻住的东西全翻上来了——再这样下去，他整个人都会冻死！');
    const i = await choose('怎么办？', ['把星力渡给他', '一巴掌把他拍醒']);
    if (i === 1) { await narrate('叶孤星一巴掌拍在云霆背上，力道大得自己手都麻了。'); await say('叶孤星', '醒醒！'); }
    await narrate('他一掌按在云霆后心，星力源源不断地渡了过去。');
    await say('云霆·伤', '……别管我。');
    await say('叶孤星', '闭嘴。');
    await narrate('星力一刻不停。霜冻到叶孤星的手腕，他也没松手。');
    await say('叶孤星', '你爹娘把你从刀底下推出来，不是让你在这儿把自己冻死的。');
    await narrate('霜，一点一点化开了。云霆睁开眼，长长吐出一口白气。');
    await say('云霆', '……多管闲事。');
    await say('叶孤星', '（甩了甩冻麻的手）嘶——冰块就是冰块，差点把我也冻上。');
    await say('云霆·坏笑', '……活该。');
    await say('叶孤星', '喂，我刚救了你！');
    await say('云霆·坏笑', '嗯。记账上。');
    await say('星旋', '（这俩……一个比一个会记账。）');
    await say('星旋', '把心冻住，剑只是快；把心放开，剑才有意。小子，你这剑心，现在才算真正成了。');
    C3.bond(i === 1 ? 3 : 2);
    S.flash = .8; S.flashColor = '#cfe6ff'; try { playSnd('sfx_sword_ring'); } catch (e) {}
    await showPanel('云霆 · 剑心解封', ['!剑心冰封已解', '云霆 突破凝丹四重', '气血、灵力全满']);
    partyRest(); glow.t = glow.life;
    F().ch3_mjout = 1;
    await fadeOut(800); await ch3Ambush();
  }
  // 进图：剧情点（地图上有红色标记，自动寻路也能找到）；往里的出口要先看完这张图的剧情
  const ORDER = ['creek', 'glade', 'stones', 'falls', 'passage', 'temple', 'spring'];
  const inCh3 = () => { const f = F(); return f.ch3_in === 1 && !f.ch3_mjout; };
  function nwTick() {
    const n = (world.mapName || '').replace(/^m_nw_/, ''); if (!NW(n) || !here('m_nw_' + n) || !inCh3() || !world.triggers) return;
    const B = BEATS[n]; if (!B || F()[B.flag]) return; if (n === 'spring' && !F().ch3_bai) return;
    if (world.triggers.some(t => t._r189 === n && !t.done)) return;
    let [x, y] = B.at; const T = world.map && world.map.T;
    if (T && typeof canStand === 'function' && !canStand(T, x, y)) { outer: for (let rr = 16; rr < 260; rr += 16) for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, xx = x + Math.cos(a) * rr, yy = y + Math.sin(a) * rr; if (canStand(T, xx, yy)) { x = xx; y = yy; break outer; } } }
    addTrigger(x, y, B.r, async () => { F()[B.flag] = 1; await B.run(); }, true, true); world.triggers[world.triggers.length - 1]._r189 = n;
    if (Q[n] && !/女娲秘境/.test(S.quest || '')) S.quest = Q[n];
  }
  setInterval(() => { try { if (typeof battle !== 'undefined' && battle) return; nwTick(); } catch (e) {} }, 400);
  const NEED = { glade: null, stones: 'ch3_v1', falls: 'ch3_v2', passage: 'ch3_v3', temple: null, spring: 'ch3_bai' };
  const MSG = { stones: '井庭那口古井还在泛光……先去看看', falls: '五色石还亮着，先去看看', passage: '碧潭水雾里有东西，先去看看', spring: '大殿里还有什么在等着……先进殿看看' };
  for (const n of ORDER) { const M = NW(n); if (!M) continue;
    M.onEnter = (o => async function () { if (inCh3() && Q[n] && !(BEATS[n] && F()[BEATS[n].flag])) S.quest = Q[n]; nwTick(); if (o) return o.apply(this, arguments); })(M.onEnter);
    for (const e of M.exits || []) { const to = (e.to || '').replace(/^m_nw_/, ''); delete e.msg;
      if (e.to === 'm_yy_tiger') { e.cond = () => !inCh3(); e.msg = '来时的裂隙已经合上了，只能往秘境深处走'; continue; }
      const need = NEED[to], fromIdx = ORDER.indexOf(n), toIdx = ORDER.indexOf(to);
      if (toIdx > fromIdx && NEED[to]) { e.cond = () => !inCh3() || !!F()[NEED[to]]; e.msg = MSG[to]; } else e.cond = null; } }
  // 秘境里每张图的「本图剧情还没看」也算任务目标：寻路规则
  try { if (window.QUEST_ROUTE && QUEST_ROUTE.RULES) {
    const R = QUEST_ROUTE.RULES;
    R.unshift([/林尽闻声：魔虎逃进/, () => ({ map: 'm_yy_verge' })]);
    R.unshift([/林尽闻声：古樟东侧/, () => ({ map: 'm_yy_verge' })]);
    R.unshift([/顺着虎爪印往东北追/, () => ({ map: 'm_yy_verge' })]);
    R.unshift([/女娲秘境：/, () => { const f = F(); const m = !f.ch3_v1 ? 'glade' : !f.ch3_v2 ? 'stones' : !f.ch3_v3 ? 'falls' : !f.ch3_v4 ? 'temple' : 'spring'; return { map: 'm_nw_' + m }; }]);
  } } catch (e) {}
  // 林尽闻声古樟下的邪修：只在出了秘境以后出现（新流程打完虎时 ch3_mj = 1，要等 ch3_mjout）
  drawBaked = (o => function (ob, now) { if (ob && /^mt_[abc]$/.test(ob.id) && F().ch3_mj === 1 && !F().ch3_mjout) return; return o.apply(this, arguments); })(drawBaked);
  // ---------- 4) 云霆也会纳月 · 吞噬（作者 11-10：「纳月灵力云霆和叶孤星都有」）----------
  // 白衣男子的两缕银光一缕给叶孤星、一缕给云霆。老存档：叶孤星已经会吞噬的，云霆也补上
  const ytHas = () => !!(F().yt_tunshi || (S.hero && S.hero.skills && S.hero.skills.includes('tunshi')));
  if (window.MIZHUAN_LIST) MIZHUAN_LIST = (o => function () { const L = o.apply(this, arguments); try { const P = battle && battle.P;
    if (P && P.ally === 'yunting' && ytHas() && !L.some(it => it.k === 'tunshi')) { const c = (SKILL_DB.tunshi && SKILL_DB.tunshi.cost) || 24;
      L.push({ k: 'tunshi', name: '纳月 · 吞噬', cost: c, tag: '单体', desc: '吞噬敌人灵力，伤害的一半化为自身气血（对邪修伤害 +50%）', disabled: P.mp < c, why: '灵力不足' }); } } catch (e) {} return L; })(MIZHUAN_LIST);
  doHeroAction = (o => async function (k) { const b = battle, P = b && b.P;
    if (P && P.ally === 'yunting' && k === 'tunshi' && ytHas()) { b.state = 'act'; b.menu = null; P.mp -= (SKILL_DB.tunshi && SKILL_DB.tunshi.cost) || 24; P.pose = 'cast'; await skTunshi(P, pickTarget()); P.pose = null; await afterAct(); return; }
    return o.apply(this, arguments); })(doHeroAction);
  window.R189CH3 = { IM, st, chase, enterRift, BEATS, vergeTick, nwTick, spring, baiyi };
})();
