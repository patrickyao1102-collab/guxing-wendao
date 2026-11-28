// ================= R473 · 万妖塔一层：禁制 → 灯亮破禁 → 推门 → 绛蘅现身 → 对白 → 开打；首领表情；招式配音挂点（只进测试版）=================
// 作者 11-28 19:37：「三盏魂灯开启……当第三盏亮起的时候，切换镜头广角，移到门那块，门前禁制亮光消失，当玩家走到门前自己互动打开，
//                   打开之后，花妖的出场动画帧、特效帧出现，非常炫酷，然后开始一些剧情对话……然后开打。」
// 作者 19:42：「破绽、什么喘息之类的太多了，仙侠类游戏有这些吗，我觉得可以变化表情。」
// 这个文件管四件事：
//   ① 内苑那道朱门（R443 的 gate）点灯前罩一层血红 / 暗金的符文禁制（R444 的 blood-veil + 血符，代码让它慢慢流动）；碰门 → 星旋一句话。
//   ② 第三盏照魂灯亮起：锁住操作，镜头缓缓拉成广角、滑到门前，禁制从中间裂开、化成光点散掉（1.5 秒，不闪不抖），镜头再滑回玩家。
//      门不自己开——走过去点一下才推开（两扇门向两边转开，代码做的）。
//   ③ 门一推开（新画内苑）：镜头越过门楼看向花树——树洞的暗红光涨起来、花瓣旋进洞里，她在树洞里由暗红人影慢慢显出颜色（代码版，
//      R476 关键帧到了用 R473.APPEAR.useFrames 换掉人物那一段，见下面 ③'）→ 名号 → 一层 meet 对白 → 开打；打输了再来只放一句、直接开打。
//      旧画内苑照旧：走进花树那片院子才放 R463 的现身演出。
//   ④ 战斗里首领名牌左边一枚头像，按状态换表情：平时 / 蓄力（冷笑）/ 换形态后（怒）/ 败。
//      作者 11-28 23:15：「不需要弄那个咳嗽喘气、衰弱……BOSS 一定是很帅……然后发怒，最后死的时候消散」→ 去掉「力竭（hurt）」那一档：
//      r370 的力竭（_break）只留数值，头像照「平时 / 怒」走，不再低头、发灰、喘；也不再触发 _tired 配音。
//      现在每个首领只有「平常」「被打败」两张对话立绘，先用代码做变化（色调、阴影、眼部光、轻微缩放倾斜）；
//      接口：Codex 交 r434/p_jiangheng_{normal,smirk,angry,defeat}.webp（构图和 p_jiangheng.webp 一样），有哪张就自动用哪张。
//   ⑤ 首领配音挂点：r473/vo/<键>.mp3 有就放，没有就静默（键名见 VO_KEYS，报告里有清单）。
(function () {
  if (typeof S === 'undefined' || !window.TOWER || !TOWER.MAZE || !window.R443_META) return;
  const F = () => (S.flags = S.flags || {});
  const MZ = TOWER.MAZE, ST1 = () => MZ.ST(1);
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const sm = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const io3 = v => { v = clamp01(v); return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
  const seg = (t, a, b) => clamp01((t - a) / (b - a));
  const mix = (a, b, k) => a + (b - a) * k;
  const ok = im => im && im.complete && im.naturalWidth;
  const V = () => (window.R443 && R443.ver && R443.ver()) || 'b';
  const NEWI = () => !!(window.R473I && R473I.on());   // 内苑换成 R473 新画时：门用真画帧（r473_inner.js 画），这里代码画的禁制 / 开门退役
  const C1 = () => (window.R443 && R443.Z ? R443.Z('c') : (R443_META[V()] || R443_META.b).c);
  const GATE = () => C1().objs.find(o => o.id === 'gate');
  const DAIS = () => C1().objs.find(o => o.id === 'boss_dais');
  const NLAMP = () => C1().objs.filter(o => /^lamp/.test(o.id)).length || 3;
  const lit = () => (ST1().mech || []).filter(Boolean).length;
  const inC = () => typeof world !== 'undefined' && world && world.mapName === 'wyt_f1c';
  const cleared = () => !!(window.TOWER_STORY && TOWER_STORY.cleared(1));
  const IMK = name => 'r443_' + V() + '_c_' + name;
  const pic = src => { const im = new Image(); im.src = src; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} return im; };
  const VEIL = pic('r473/ward_veil.webp?v=1'), RUNES = pic('r473/ward_runes.webp?v=1');
  let GOLD = null;   // 血符染成暗金的一份（只做一次）
  function gold() { if (GOLD || !ok(RUNES)) return GOLD; const c = document.createElement('canvas'); c.width = RUNES.width; c.height = RUNES.height; const g = c.getContext('2d'); g.drawImage(RUNES, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#e0aa4a'; g.fillRect(0, 0, c.width, c.height); return GOLD = c; }

  // ---------- 镜头：VZ 乘一个系数（< 1 拉远），焦点按时间缓动 ----------
  const CAM = { on: false, t: 0, z: 1, fx: 0, fy: 0, mv: null };
  if (typeof VZ === 'function') VZ = (o => function () { return o.apply(this, arguments) * (CAM.on ? CAM.z : 1); })(VZ);
  // 从当前位置缓到 (x, y, z)，dur 秒；pan / zoom 各自的时间段（0～1 的比例）可以错开，读起来像「先拉远、再滑过去」
  function camTo(x, y, z, dur, o = {}) { return new Promise(res => { CAM.mv = { x0: CAM.fx, y0: CAM.fy, z0: CAM.z, x, y, z, dur, t: 0, pan: o.pan || [0, 1], zoom: o.zoom || [0, 1], res }; }); }
  function camStart() { const p = world.player; CAM.fx = p.x; CAM.fy = p.y; CAM.z = 1; CAM.t = 0; CAM.mv = null; CAM.on = true; }
  function camStop() { CAM.on = false; CAM.mv = null; CAM.z = 1; }
  function camApply(dt) { if (!CAM.on || !world.cam || !world.map || !world.map.T) return; const m = CAM.mv;
    if (m) { m.t += Math.min(dt, .05) * (CAM.sp || 1);   /* 现身时点屏幕加快：镜头跟着快 */ const u = m.t / m.dur, kp = io3(seg(u, m.pan[0], m.pan[1])), kz = io3(seg(u, m.zoom[0], m.zoom[1]));
      CAM.fx = mix(m.x0, m.x, kp); CAM.fy = mix(m.y0, m.y, kp); CAM.z = mix(m.z0, m.z, kz); if (u >= 1) { CAM.mv = null; m.res(); } }
    const T = world.map.T, vw = W / VZ(), vh = H / VZ();
    world.cam.x = Math.max(T.x0 || 0, Math.min(T.mw - vw, CAM.fx - vw / 2)); world.cam.y = Math.max(0, Math.min(T.mh - vh, CAM.fy - vh * .55)); }
  const until = f => new Promise(res => { const k = () => { if (f()) res(); else requestAnimationFrame(k); }; k(); });
  const lockAll = () => { const p = world.player; world.locked = true; world.path = null; world.walkTarget = null; if (p) p.moving = false; };

  // ---------- ① 禁制 ----------
  const WARD = { t0: null };   // 破禁那一下的时刻（秒）
  const wardUp = () => !ST1().gate && !ST1().ward;
  const DOT = []; for (let i = 0; i < 90; i++) DOT.push({ u: Math.random(), v: Math.random(), d: Math.random() * .35, vx: (Math.random() - .5) * 90, vy: -40 - Math.random() * 110, s: 1.2 + Math.random() * 2.4, g: Math.random() < .45 });
  function runeCell(g, src, col, row, x, y, w, h, a) { if (a <= .01) return; g.globalAlpha = a; g.drawImage(src, col * 144, row * 80, 144, 80, x - w / 2, y - h / 2, w, h); }
  // 门洞：gate_closed 图里两扇门在 x 78～255、y 58～198（330×205 的图，地图上 1:1）
  function drawWard(g, o, now) {
    const t = now, br = WARD.t0 == null ? -1 : (now - WARD.t0) / 1.5; if (br >= 1) return;
    const L = o.x + 70, R = o.x + 262, T0 = o.y + 44, B = o.y + 200, mid = (L + R) / 2, hw = (R - L) / 2, Hh = B - T0;
    const kb = br < 0 ? 0 : br, crack = sm(seg(kb, 0, .3)), part = io3(seg(kb, .18, 1)), fade = 1 - sm(seg(kb, .25, .95));
    const breath = .82 + .18 * Math.sin(t * 1.3);
    g.save();
    // 底：门洞里压一层暗红（像隔着一层血色的水看门）
    g.globalAlpha = .42 * fade; const bg = g.createLinearGradient(0, T0, 0, B); bg.addColorStop(0, 'rgba(60,0,12,.2)'); bg.addColorStop(.5, 'rgba(90,6,20,.85)'); bg.addColorStop(1, 'rgba(50,0,10,.9)'); g.fillStyle = bg; g.fillRect(L - part * 60, T0, (R - L) + part * 120, Hh);
    g.globalCompositeOperation = 'lighter';
    // 外面一圈血光：整道门笼在禁制里（呼吸一样极慢地明暗）
    { const ax = mid, ay = (T0 + B) / 2, rr = hw * 1.9, ag = g.createRadialGradient(ax, ay, hw * .5, ax, ay, rr); ag.addColorStop(0, `rgba(255,50,70,${.30 * breath * fade})`); ag.addColorStop(.6, `rgba(200,20,40,${.14 * breath * fade})`); ag.addColorStop(1, 'rgba(160,0,20,0)'); g.globalAlpha = 1; g.fillStyle = ag; g.save(); g.translate(ax, ay); g.scale(1, .85); g.translate(-ax, -ay); g.fillRect(ax - rr, ay - rr, rr * 2, rr * 2); g.restore(); }
    // 两片血纱：从中间裂开时各往外滑、变淡
    for (const side of [-1, 1]) { const dx = side * part * 74, sx = side < 0 ? 0 : 450, a = (.9 + .1 * Math.sin(t * .9 + side)) * fade;
      if (ok(VEIL) && a > .01) { g.globalAlpha = a; const x0 = side < 0 ? L + dx - 8 : mid + dx; g.drawImage(VEIL, sx, 37, 446, 775, x0, T0 - 24, hw + 8, Hh + 30); g.globalAlpha = a * .55; g.drawImage(VEIL, sx, 37, 446, 775, x0, T0 - 24, hw + 8, Hh + 30); }
      // 符文：两列，慢慢往上流，一明一暗地呼吸；红、金相间
      if (ok(RUNES)) { const GD = gold(); g.save(); g.beginPath(); g.rect(side < 0 ? L + dx - 6 : mid + dx, T0 - 10, hw + 6, Hh + 12); g.clip();
        for (let c = 0; c < 2; c++) for (let r = -1; r < 5; r++) { const fy = ((t * 9 + r * 36 + c * 18) % 180), y = B - fy + 10, x = (side < 0 ? L + 24 + c * 44 : mid + 26 + c * 44) + dx;
          const edge = Math.min(1, (y - T0) / 30, (B - y) / 24), sh = .45 + .55 * Math.max(0, Math.sin(t * 1.6 + r * 1.7 + c * 2.3 + side));
          const id = (r + 9 + c * 3 + (side > 0 ? 4 : 0)) % 9, col = 1 + ((r + c + 5) % 5), src = (r + c) % 2 && GD ? GD : RUNES;
          const ra = Math.max(0, edge) * sh * fade; runeCell(g, src, col, id, x, y, 64, 36, ra * .45); runeCell(g, src, col, id, x, y, 56, 31, ra); } g.restore(); } }
    g.globalAlpha = 1;
    // 两边柱脚的竖光、地上一道光：禁制的「边」
    const ea = (.55 + .25 * breath) * fade; for (const x of [L + 4 - part * 70, R - 4 + part * 70]) { const lg = g.createLinearGradient(x - 10, 0, x + 10, 0); lg.addColorStop(0, 'rgba(255,60,80,0)'); lg.addColorStop(.5, `rgba(255,120,110,${ea})`); lg.addColorStop(1, 'rgba(255,60,80,0)'); g.fillStyle = lg; g.fillRect(x - 10, T0, 20, Hh); }
    { const gy = B - 2, rg = g.createRadialGradient(mid, gy, 2, mid, gy, hw + 40); rg.addColorStop(0, `rgba(255,110,90,${.45 * breath * fade})`); rg.addColorStop(1, 'rgba(255,60,60,0)'); g.save(); g.translate(mid, gy); g.scale(1, .22); g.translate(-mid, -gy); g.fillStyle = rg; g.fillRect(mid - hw - 40, gy - hw - 40, (hw + 40) * 2, (hw + 40) * 2); g.restore(); }
    // 裂开：中缝先亮起一道暖金细线，再随两片纱一起淡去
    if (br >= 0) { const ca = crack * (1 - sm(seg(kb, .35, .8))); if (ca > 0) { const cg = g.createLinearGradient(mid - 14, 0, mid + 14, 0); cg.addColorStop(0, 'rgba(255,200,140,0)'); cg.addColorStop(.5, `rgba(255,236,200,${.85 * ca})`); cg.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = cg; const hh = Hh * crack; g.fillRect(mid - 14, B - hh, 28, hh); }
      // 光点：符文化成的金红光点，慢慢往上、往两边飘散
      for (const d of DOT) { const k = seg(kb, .2 + d.d, 1); if (k <= 0 || k >= 1) continue; const e = sm(k), x = L + d.u * (R - L) + d.vx * e + Math.sign(d.u - .5) * part * 40, y = T0 + d.v * Hh + d.vy * e, a = Math.sin(Math.PI * k) * .9;
        g.globalAlpha = a; g.fillStyle = d.g ? '#ffd890' : '#ff7a80'; g.beginPath(); g.arc(x, y, d.s * (1 - e * .5), 0, 7); g.fill(); } }
    g.restore(); }

  // ---------- 开门：两扇门绕门轴向里转开（门洞后面就是 gate_open 那张图）----------
  const DOOR = { t0: null };
  function drawDoor(g, o, now) { const im0 = IMG[IMK('gate_closed')], im1 = IMG[IMK('gate_open')]; const k = clamp01((now - DOOR.t0) / 1.7), e = io3(k);
    if (im1) { g.save(); g.globalAlpha = sm(seg(k, 0, .5)); g.drawImage(im1, o.x, o.y, o.w, o.h); g.restore(); }
    if (!im0) return;
    // 门框、门楼照旧（门扇以外的部分用 closed 图垫着，开到一半再交给 open 图）
    g.save(); g.globalAlpha = 1 - sm(seg(k, .35, .8)); g.beginPath(); g.rect(o.x, o.y, o.w, o.h); g.rect(o.x + 78, o.y + 58, 177, 140); g.clip('evenodd'); g.drawImage(im0, o.x, o.y, o.w, o.h); g.restore();
    for (const [sx, sw, hinge] of [[78, 87, 78], [165, 90, 255]]) { const w = sw * (1 - .9 * e), x = hinge === 78 ? o.x + 78 : o.x + 255 - w;
      g.save(); g.globalAlpha = 1 - sm(seg(k, .78, 1)); g.drawImage(im0, sx, 58, sw, 140, x, o.y + 58, w, 140);
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(20,4,6,${.45 * e})`; g.fillRect(x, o.y + 58, w, 140); g.restore(); }
    // 门缝里透出来的暖光（缓进缓出）
    const la = Math.sin(Math.PI * sm(seg(k, .1, 1))) * .5; if (la > .01) { g.save(); g.globalCompositeOperation = 'lighter'; const cx = o.x + 166, cy = o.y + 130, rg = g.createRadialGradient(cx, cy, 4, cx, cy, 120); rg.addColorStop(0, `rgba(255,170,150,${la})`); rg.addColorStop(1, 'rgba(255,90,90,0)'); g.fillStyle = rg; g.fillRect(cx - 120, cy - 120, 240, 240); g.restore(); } }

  drawBaked = (orig => function (o, now) {
    const d = o && o.id === 'r443_obj' && o.r443 && o.r443.z === 'c' ? o.r443.o : null;
    if (!d) return orig.apply(this, arguments);
    // 绛蘅没现过身之前，花树下不站人（现身演出放的时候也不站）
    if (d.id === 'boss_pic' && (!ST1().jhSeen || (window.R463 && R463.C.on))) return;
    if (d.id === 'gate' && NEWI()) return orig.apply(this, arguments);
    if (d.id === 'gate' && DOOR.t0 != null) { try { drawDoor(ctx, d, performance.now() / 1000); } catch (e) {} return; }
    const r = orig.apply(this, arguments);
    if (d.id === 'gate' && (wardUp() || WARD.t0 != null)) { try { drawWard(ctx, d, performance.now() / 1000); } catch (e) {} }
    return r; })(drawBaked);

  // ---------- ② 第三盏灯亮：镜头到门前，禁制散掉 ----------
  let BUSY = false;
  async function wardBreak() {
    if (BUSY || !inC()) { ST1().ward = 1; return; }
    BUSY = true; const hud0 = S.hud; lockAll();
    try { const g = GATE(), p = world.player; await sleep(700);   // 让刚点亮的灯先亮一会儿
      S.hud = false; camStart();
      await camTo(g.bx, g.by - 60, .6, 2.8, { zoom: [0, .55], pan: [.15, 1] });   // 先拉远成广角，再滑到门前
      await camTo(g.bx, g.by - 40, 1.12, 1.6);                                    // 再缓缓推近，门看得清
      await sleep(350);
      WARD.t0 = performance.now() / 1000; try { playSnd('sfx_star', .55); } catch (e) {}
      await sleep(1600); ST1().ward = 1; WARD.t0 = null;
      await sleep(250);
      await say('星旋', '……禁制破了。小子，门就在那儿，过去推开它。');
      const p2 = world.player; await camTo(p2.x, p2.y, 1, 2.2, { zoom: [.3, 1], pan: [0, .9] });
    } catch (e) { console.warn('R473 ward', e); ST1().ward = 1; WARD.t0 = null; }
    finally { camStop(); S.hud = hud0 === false ? true : hud0; world.locked = false; BUSY = false; } }

  // 碰门：禁制没破 → 星旋一句；破了 → 推门
  async function gateTalk() {
    if (ST1().gate) return;
    if (wardUp() && lit() < NLAMP()) { await say('星旋', '门上罩着禁制，硬闯不得。把内苑那三盏照魂灯都点亮，它自己就散了。'); toast('照魂灯 ' + lit() + ' / ' + NLAMP(), 1600); return; }
    if (wardUp()) return wardBreak();   // 老存档：灯早点满了但禁制还在
    if (BUSY) return; BUSY = true; lockAll();
    try { DOOR.t0 = performance.now() / 1000; try { playSnd('ui_open', .8); } catch (e) {} await sleep(1750);
      ST1().gate = 1; DOOR.t0 = null; try { if (window.R443 && R443.applyGate) R443.applyGate(); } catch (e) {}
    } finally { DOOR.t0 = null; world.locked = false; BUSY = false; ARM = true; }
    // 新画内苑：门一开，镜头直接越过门楼看向花树——她在树洞里现身（作者：「打开之后，花妖的出场动画、特效帧出现」）
    if (NEWI() && R473I.MT && !cleared() && !ST1().jhSeen) { await sleep(350); return bossStage(); } }


  // ---------- ③' 新画内苑：绛蘅从花树的树洞里现身 ----------
  // 有 R476 关键帧（Codex：小云雀视频转帧 + 重画，r476_meta.js + r476/fall、r476/laugh）时：
  //   0～2.6  镜头缓缓拉成广角、滑到花树前，画面压一层极淡的暗红；0.5～3.6 花瓣旋着往树洞里收；1～4.5 树洞的暗红光一点点涨起来
  //   2.6～4.0 树洞里浮出她沉睡的样子（第 1 帧：先是一道暗红人影，再慢慢显出颜色）
  //   4.0～7.6 「脱树飘落」45 帧（每帧照 anim.json 80 毫秒）：睁眼 → 花枝松动 → 根须退开 → 探身出洞 → 双袖展开 → 披帛回旋 → 拢袖下落 → 落地收势 → 台前站定
  //            镜头跟着她往下滑；她出洞那一下花瓣从洞口荡开、化成花雨；落地时脚下一圈花光荡开
  //   7.6～10.2 「掩袖而笑」32 帧：侧头睥睨 → 抬袖 → 掩唇笑 → 再笑 → 落袖 → 收回站姿；镜头慢慢推近到她
  //   8.4～9.4 名号淡入，10.6～11.4 淡出，接对白。对白时、开打前，她就停在最后一帧（收回站姿）站在台前，极轻地起伏。
  //   相邻两帧之间都做淡入淡出（不跳）；两段之间也柔柔地交叉过去。点屏幕可加快（三倍速，镜头一起快）。
  // 没有 R476（或者帧没载完）时退回代码版：她在树洞里由暗红人影慢慢显出颜色，之后一直嵌在树洞里（R466 定版 B 那一层）。
  // 以后再换现身动画：tools/r476_build.py 重新生成 r476_meta.js 就行（段名 fall / laugh，世界坐标照 anim.json 的 world_origin_px × map_scale）。
  const KF = window.R476_APPEAR || null;
  const APPEAR = { on: false, t: 0, T: null, DUR: 10.8, FF: false, kf: false };
  const HC = () => window.R473I ? R473I.HOLE_C : [2538, 535];
  // R476 帧：进内苑就开始下（不挡进图），现身时全到了才用
  const KIM = { fall: [], laugh: [], want: false };
  function kfLoad() { if (!KF || KIM.want) return; KIM.want = true; for (const k of ['fall', 'laugh']) for (let i = 1; i <= KF[k].n; i++) KIM[k].push(pic('r476/' + k + '/' + String(i).padStart(2, '0') + '.webp?v=1')); }
  const kfReady = () => !!KF && KIM.want && KIM.fall.length && KIM.fall.every(ok) && KIM.laugh.every(ok);
  const seqDur = k => KF[k].ms.reduce((a, b) => a + b, 0) / 1000;
  // 一段帧在第 tt 秒：画第 i 帧，再把第 i+1 帧按帧内进度淡上去（帧间柔和过渡）；alpha 整体透明度
  function seqDraw(g, k, tt, alpha = 1, hold = false) { const Q = KF[k], ims = KIM[k]; let acc = 0, i = 0, f = 0; const ms = tt * 1000;
    for (i = 0; i < Q.n; i++) { if (ms < acc + Q.ms[i]) { f = (ms - acc) / Q.ms[i]; break; } acc += Q.ms[i]; } if (i >= Q.n) { i = Q.n - 1; f = 0; }
    if (hold && i >= Q.n - 1) f = 0;
    const a = ims[i], b = i + 1 < Q.n ? ims[i + 1] : null; g.save(); g.globalAlpha = alpha; if (ok(a)) g.drawImage(a, Q.x, Q.y, Q.w, Q.h);
    if (b && ok(b) && f > .02) { g.globalAlpha = alpha * sm(f); g.drawImage(b, Q.x, Q.y, Q.w, Q.h); } g.restore(); }
  const T_IN = 2.6, T_FALL = 4.0, T_LAUGH = () => T_FALL + seqDur('fall'), T_END = () => T_LAUGH() + seqDur('laugh');
  // 她出了树洞以后：树洞那一层（R466 定版 B）不再画；地图上画「掩袖而笑」最后一帧当立像（r473_inner 来问）
  APPEAR.out = () => kfReady();
  APPEAR.standee = (g, now) => { if (!kfReady() || APPEAR.on) return false; const Q = KF.laugh, im = KIM.laugh[Q.n - 1]; if (!ok(im)) return false;
    const b = Math.sin(now * 1.1) * .012;   // 呼吸：身子极轻地一起一伏（以脚底为轴缩放，不晃位置）
    g.save(); g.translate(Q.foot[0], Q.foot[1]); g.scale(1, 1 + b); g.translate(-Q.foot[0], -Q.foot[1]); g.drawImage(im, Q.x, Q.y, Q.w, Q.h); g.restore(); return true; };
  APPEAR.foot = () => (KF ? KF.laugh.foot : null);
  const AP_PET = []; function apPetals() { AP_PET.length = 0; let sd = 11; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 220; i++) AP_PET.push({ a0: r() * 6.283, r0: 520 + r() * 820, d: r() * 1.3, sp: .7 + r() * .7, sz: 3.6 + r() * 4, rot: r() * 6.28, vr: (r() - .5) * 3, col: r(), glow: r() < .15, bang: r() * 6.283, bsp: 120 + r() * 260, fall: 60 + r() * 120 }); }
  function apPetal(g, x, y, s, rot, col, a, glow) { g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a; g.fillStyle = col < .5 ? '#d81a30' : col < .8 ? '#b50f22' : '#f04a5c';
    g.beginPath(); g.moveTo(0, -s * 1.6); g.quadraticCurveTo(s * .42, -s * .2, 0, s * 1.2); g.quadraticCurveTo(-s * .42, -s * .2, 0, -s * 1.6); g.fill();
    if (glow) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .25; g.fillStyle = '#ff5064'; g.beginPath(); g.ellipse(0, 0, s * .6, s * 1.4, 0, 0, 7); g.fill(); } g.restore(); }
  // 节点（秒）：有关键帧 / 代码版各一套
  const TL = () => APPEAR.kf ? { burst: 5.0, land: T_FALL + 3.1, title: T_LAUGH() + .8, glowOut: [5.5, 8], dur: T_END() + 1.3 } : { burst: 6.0, land: 6.2, title: 7.4, glowOut: [6.2, 8.4], dur: 10.8 };
  // 树洞的光涨落（r473_inner 画树时来问）：0～1
  APPEAR.glow = () => { if (!APPEAR.on) return 0; const t = APPEAR.T != null ? APPEAR.T : APPEAR.t, L = TL(); return sm(seg(t, 1, 4.5)) * (1 - .7 * sm(seg(t, L.glowOut[0], L.glowOut[1]))); };
  const SIL = {};   // 染成暗红的剪影（每张图做一次）
  function sil(im) { if (!ok(im)) return null; const k = im.src; if (SIL[k]) return SIL[k]; const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#5a0612'; g.fillRect(0, 0, c.width, c.height); return SIL[k] = c; }
  // 由暗红人影慢慢显出颜色（ks：人影出来的进度，kc：显色的进度）
  function emerge(g, im, x, y, w, h, ks, kc) { const S2 = sil(im); if (S2 && ks * (1 - kc) > .01) { g.save(); g.globalAlpha = ks * (1 - kc); g.drawImage(S2, x, y, w, h); g.restore(); }
    if (kc > .01) { g.save(); g.globalAlpha = kc; g.drawImage(im, x, y, w, h); g.restore(); } }
  const apLayer = { draw() { try { if (!APPEAR.on) return; const t = APPEAR.T != null ? APPEAR.T : APPEAR.t, zm = VZ(), cam = world.cam, now = performance.now() / 1000; if (!cam) return;
      const [hx, hy] = HC(), L = TL(); ctx.save();
      const dim = sm(seg(t, .2, 1.8)) * (1 - sm(seg(t, L.dur - 3.2, L.dur)) * .7); ctx.fillStyle = `rgba(18,2,8,${.24 * dim})`; ctx.fillRect(0, 0, W, H);
      ctx.translate(-cam.x * zm, -cam.y * zm); ctx.scale(zm, zm);
      // 花瓣：旋进树洞 → 她出洞时从洞口荡开、落成花雨
      const pts = AP_PET.map(p => { const kin = io3(seg(t, .5 + p.d * .6, 3.6 + p.d * .5)), ang = p.a0 + t * p.sp * 1.4 + kin * 2.4, r = mix(p.r0, 18, kin);
        let x = hx + Math.cos(ang) * r, y = hy + Math.sin(ang) * r * .55, a = clamp01(seg(t, p.d * .6, .8 + p.d * .6)) * (1 - sm(seg(kin, .82, 1)) * .9);
        const out = sm(seg(t, L.burst + p.d * .25, L.burst + 3.6)); if (out > 0) { a = Math.sin(Math.PI * Math.min(1, out * 1.2)) * .9; x = hx + Math.cos(p.bang) * p.bsp * out; y = hy + Math.sin(p.bang) * p.bsp * .5 * out + p.fall * out * out * 2.2; }
        return [p, x, y, a, Math.sin(ang) > 0]; });
      for (const [p, x, y, a, f] of pts) if (!f && a > .01) apPetal(ctx, x, y, p.sz, p.rot + t * p.vr, p.col, a, p.glow);
      // 树洞口一道细光：洞「醒」过来（缓起缓落）
      { const k = Math.sin(Math.PI * seg(t, 2.2, 4.4)); if (k > .01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createLinearGradient(hx - 16, 0, hx + 16, 0); lg.addColorStop(0, 'rgba(255,150,120,0)'); lg.addColorStop(.5, `rgba(255,220,190,${.45 * k})`); lg.addColorStop(1, 'rgba(255,150,120,0)'); ctx.fillStyle = lg; ctx.fillRect(hx - 16, hy - 62 * k, 32, 124 * k); ctx.restore(); } }
      // 人物
      if (APPEAR.kf) {
        const ks = sm(seg(t, T_IN, T_IN + .8)), kc = sm(seg(t, T_IN + .5, T_FALL)), F0 = KF.fall;
        if (t < T_FALL) { if (ks > .01) emerge(ctx, KIM.fall[0], F0.x, F0.y, F0.w, F0.h, ks, kc); }
        else { const tl = T_LAUGH(), x = sm(seg(t, tl - .1, tl + .15));   // 两段交接：0.25 秒交叉淡过去
          if (x < 1) seqDraw(ctx, 'fall', t - T_FALL, 1, true); if (x > 0) seqDraw(ctx, 'laugh', Math.max(0, t - tl), x, true); }
        // 显色、出洞时身后一圈暖红的光（缓进缓出）
        const kg = Math.sin(Math.PI * seg(t, T_IN + .3, T_FALL + 1.6)); if (kg > .01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createRadialGradient(hx, hy, 4, hx, hy, 110); rg.addColorStop(0, `rgba(255,170,150,${.32 * kg})`); rg.addColorStop(1, 'rgba(255,60,80,0)'); ctx.fillStyle = rg; ctx.fillRect(hx - 110, hy - 110, 220, 220); ctx.restore(); }
      } else {
        const O = window.R473I && R473I.MT && R473I.MT.occ, im = O && IMG['r473i_' + O.img];
        if (O && ok(im)) { const ks = sm(seg(t, 3.8, 5.2)), kc = sm(seg(t, 4.6, 6.2)), dy = Math.sin(now * 1.1) * 1.5 + (1 - ks) * 10;
          ctx.save(); ctx.beginPath(); ctx.rect(O.x - 4, O.y - 20, O.w + 8, O.h + 20); ctx.clip(); emerge(ctx, im, O.x, O.y + dy, O.w, O.h, ks, kc); ctx.restore();
          const kg = Math.sin(Math.PI * seg(t, 4.2, 7)); if (kg > .01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createRadialGradient(hx, hy, 4, hx, hy, 90); rg.addColorStop(0, `rgba(255,170,150,${.35 * kg})`); rg.addColorStop(1, 'rgba(255,60,80,0)'); ctx.fillStyle = rg; ctx.fillRect(hx - 90, hy - 90, 180, 180); ctx.restore(); } }
      }
      // 地上一圈花光荡开（她落地的地方 / 御台前沿）
      { const k = seg(t, L.land, L.land + 2.6); if (k > 0 && k < 1) { const e = sm(k), r = 50 + 420 * e, a = (1 - e) * .5, fx = APPEAR.kf ? KF.fall.foot[0] : hx, gy = APPEAR.kf ? KF.fall.foot[1] : 820; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(fx, gy); ctx.scale(1, .32); const rg = ctx.createRadialGradient(0, 0, r * .72, 0, 0, r); rg.addColorStop(0, 'rgba(255,60,90,0)'); rg.addColorStop(.85, `rgba(255,90,110,${a})`); rg.addColorStop(1, 'rgba(255,60,90,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.restore(); } }
      for (const [p, x, y, a, f] of pts) if (f && a > .01) apPetal(ctx, x, y, p.sz * 1.1, p.rot + t * p.vr, p.col, a, p.glow);
      ctx.restore();
      // 名号：慢慢淡入、亮一会儿、淡出（不闪）
      const tk = sm(seg(t, L.title, L.title + 1.2)) * (1 - sm(seg(t, L.dur - .8, L.dur))); if (tk > 0) { const B = (window.TOWER && TOWER.BOSS && TOWER.BOSS[1]) || { name: '绛蘅', title: '彼岸花精' };
        ctx.save(); ctx.globalAlpha = tk; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `30px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = 'rgba(255,220,220,.85)'; ctx.fillText('万妖塔 · 第一层', W / 2, 92);
        ctx.font = `76px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.shadowColor = '#ff4058'; ctx.shadowBlur = 22; ctx.fillStyle = '#fff4ec'; ctx.fillText(B.name, W / 2, 160 + 8 * (1 - tk)); ctx.shadowBlur = 0;
        ctx.font = `28px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.fillStyle = '#ff9aa6'; ctx.fillText(B.title, W / 2, 222); ctx.restore(); }
      if (APPEAR.T == null && t < L.dur - .3) { ctx.save(); ctx.globalAlpha = .55 * sm(seg(t, 1, 2)); ctx.font = `18px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#f2d8d0'; ctx.fillText(APPEAR.FF ? '加快中……' : '轻点屏幕可加快', W - 28, H - 22); ctx.restore(); }
    } catch (e) {} } };
  // 放一遍现身（等它放完再 resolve）；镜头停在她身前，交给后面的对白
  async function appearHollow() {
    const [hx, hy] = HC(); kfLoad(); for (let i = 0; i < 40 && KF && !kfReady(); i++) await sleep(100);   // 帧还没到齐就再等一会儿（最多 4 秒），到不齐就用代码版
    APPEAR.kf = kfReady(); apPetals(); APPEAR.t = 0; APPEAR.FF = false; APPEAR.on = true; AVO = false; APPEAR.DUR = TL().dur;
    if (!S.overlay.includes(apLayer)) S.overlay.unshift(apLayer);
    S.hud = false; camStart();
    camTo(hx, hy + 200, .78, 2.6, { zoom: [0, .7], pan: [.1, 1] });            // 拉远成广角、滑到花树前
    if (APPEAR.kf) { const ft = KF.fall.foot;
      await until(() => APPEAR.t >= T_FALL + .4 || !APPEAR.on);
      camTo(ft[0], ft[1] - 150, .95, 3.4);                                     // 跟着她往下飘
      await until(() => APPEAR.t >= T_LAUGH() - .3 || !APPEAR.on);
      camTo(ft[0], ft[1] - 70, 1.35, 2.8);                                     // 慢慢推近到她（掩袖而笑）
    } else {
      await until(() => APPEAR.t >= 6 || !APPEAR.on);
      camTo(hx, hy + 70, 1.28, 3.6);                                           // 慢慢推近到树洞
    }
    await until(() => APPEAR.t >= APPEAR.DUR || !APPEAR.on);
    ST1().jhSeen = 1; APPEAR.on = false; const i = S.overlay.indexOf(apLayer); if (i >= 0) S.overlay.splice(i, 1); }
  tileSetMap = (orig => function (m) { const r = orig.apply(this, arguments); try { if (m === 'wyt_f1c' && NEWI()) kfLoad(); } catch (e) {} return r; })(tileSetMap);

  // ---------- ③ 进院子：现身 → 对白 → 开打 ----------
  let ARM = true, FF = false, AVO = true;
  const RETRY = [['', '（花树下，那道红影又回过头来，笑意温温柔柔。）'], ['绛蘅', '既然不肯乖乖入梦，那就——两个一起留下来做花肥吧。']];
  async function bossStage() {
    if (BUSY) return; if (cleared()) { await narrate('花树下空荡荡的，只有落花。'); return; }
    if (!ST1().gate) return gateTalk();
    BUSY = true; ARM = false; const hud0 = S.hud; lockAll(); const d = DAIS(); let close = null;
    try {
      if (!ST1().jhSeen && NEWI() && R473I.MT) {   // 新画内苑：她在花树的树洞里现身
        await appearHollow();
        await MZ.lines(MZ.TXT[1].meet);
      } else if (!ST1().jhSeen && window.R463 && R463.play) {
        FF = false; AVO = false;
        close = await R463.play(NEWI() ? [R473I.HOLE[0], R473I.HOLE[1] + 80] : [d.bx, d.by]);   // 新画：落在花树树洞里
        await until(() => R463.C.t >= 10.9 || !R463.C.on);   // 名号淡掉再开口
        await MZ.lines(MZ.TXT[1].meet);
        ST1().jhSeen = 1;
      } else {
        ST1().jhSeen = 1; S.hud = false; camStart(); if (NEWI() && R473I.MT) { kfLoad(); const ft = kfReady() ? KF.laugh.foot : null, [hx, hy] = R473I.HOLE_C; await (ft ? camTo(ft[0], ft[1] - 90, 1.2, 1.8) : camTo(hx, hy + 110, 1.1, 1.8)); } else await camTo(d.bx, d.by - 120, .9, 1.6);
        await MZ.lines(RETRY);
      }
      world.locked = true; await fadeOut(260); if (close) { close(); close = null; } camStop();
      const win = await TOWER.fightBoss(1); world.locked = true; S.hud = hud0 === false ? true : hud0;
      if (win) { const items = []; if (!F().tw_prize_1) { F().tw_prize_1 = 1; for (const [id, c] of MZ.TXT[1].prize || []) if (ITEM_DB[id]) { addItem(id, c); items.push({ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×' + c, desc: ITEM_DB[id].desc || '' }); } }
        if (items.length && window.itemGet) await itemGet(items, '万妖塔 · 第一层'); }
      else { partyRevive(.3); const g = GATE(), p = world.player; p.x = g.bx; p.y = g.by + (NEWI() ? 260 : 170); /* 新画：退远一点，门前那只梦傀首别被吵醒 */ p.face = 'up'; world.cam = null; await fadeIn(260); toast('败下阵来……养好伤、备足丹药再来', 3000); }
    } catch (e) { console.warn('R473 boss', e); }
    finally { if (close) close(); APPEAR.on = false; { const i = S.overlay.indexOf(apLayer); if (i >= 0) S.overlay.splice(i, 1); } CAM.sp = 1; camStop(); S.hud = hud0 === false ? true : hud0; world.locked = false; BUSY = false; } }
  // 现身演出时点屏幕：加快（不硬切）；右下角一行小字提示
  const hint = { draw() { if (!(window.R463 && R463.C.on && R463.C.t < R463.DUR - .3) || !BUSY) return; ctx.save(); ctx.globalAlpha = .55 * sm(seg(R463.C.t, 1, 2)); ctx.font = `18px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#f2d8d0'; ctx.fillText(FF ? '加快中……' : '轻点屏幕可加快', W - 28, H - 22); ctx.restore(); } };
  S.overlay.push(hint);
  updateMap = (orig => function (dt) { const r = orig.apply(this, arguments);
    try { camApply(dt);
      if (APPEAR.on && APPEAR.T == null) { if (input.tapped) { input.tapped = null; APPEAR.FF = true; } const sp = APPEAR.FF ? 3 : 1; CAM.sp = sp; APPEAR.t += Math.min(dt, .05) * sp; if (!AVO && APPEAR.t >= (APPEAR.kf ? T_LAUGH() + .9 : 4.4)) { AVO = true; vo('jh_appear'); }   /* 配音挂点：掩唇笑那一下（代码版：显色时） */ }
      if (window.R463 && R463.C.on && BUSY && R463.C.T == null) { if (input.tapped) { input.tapped = null; FF = true; } if (FF && R463.C.t < R463.DUR - .05) R463.C.t = Math.min(R463.DUR - .05, R463.C.t + Math.min(dt, .05) * 2.5); if (!AVO && R463.C.t >= 4.4) { AVO = true; vo('jh_appear'); } }
      if (!inC()) { ARM = true; return r; }
      const p = world.player, g = GATE(); if (!p || !g) return r;
      if (p.y > g.by + 50) ARM = true;
      if (ARM && !BUSY && ST1().gate && !cleared() && !world.locked && !dialog && !choice && !(typeof sysPanel !== 'undefined' && sysPanel) && !(typeof battle !== 'undefined' && battle) && p.y < g.y - 6 && Math.abs(p.x - g.bx) < 760) bossStage();
    } catch (e) {} return r; })(updateMap);
  // 进内苑时：老存档里灯早已点满、门也开了的，禁制直接算破了
  tileSetMap = (orig => function (m) { const r = orig.apply(this, arguments); try { if (m === 'wyt_f1c') { ARM = true; if (ST1().gate) ST1().ward = 1; } } catch (e) {} return r; })(tileSetMap);

  // ---------- ④ 首领表情 ----------
  // 头像裁切：脸在立绘里的位置（比例）和裁多大（占宽的比例）；以后 Codex 交的表情图照 p_xxx.webp 的构图，用 normal 那组
  const FACE = { jiangheng: [.61, .26, .30], jiangheng_2: [.65, .32, .30], xuanfeng: [.62, .18, .30], xuanfeng_2: [.64, .26, .30], jiyue: [.66, .29, .30], jiyue_2: [.70, .30, .30], fenyu: [.71, .19, .30], fenyu_2: [.69, .22, .30] };
  const EYE = { jiangheng: [[.40, .36], [.66, .33]] };   // 眼睛在头像里的位置（冷笑时眼里一点光）
  const BOSSID = { 绛蘅: 'jiangheng', 玄锋: 'xuanfeng', 霁月: 'jiyue', 焚羽: 'fenyu' };
  const STATES = ['normal', 'smirk', 'angry', 'defeat'];
  const EXIMG = {};   // id_state → Image（没有的会 onerror，记成 bad，不再要）
  // 已经交了的专门表情图（不去试探没交的文件，免得控制台一串 404）：Codex 交了 r434/p_jiangheng_smirk.webp 这类，就在这里加一项 'jiangheng_smirk'
  const EXPR_FILES = new Set([]);
  function exImg(id, st) { const k = id + '_' + st; if (!EXPR_FILES.has(k)) return null; let o = EXIMG[k]; if (!o) { o = EXIMG[k] = { im: new Image(), bad: false }; o.im.onerror = () => { o.bad = true; }; o.im.src = 'r434/p_' + k + '.webp?v=1'; } return !o.bad && ok(o.im) ? o.im : null; }
  function srcFor(id, st) {   // → [图, 裁切参数, 是不是专门画的]
    const own = exImg(id, st); if (own) return [own, FACE[id] || [.6, .25, .3], true];
    const two = IMG['r434_p_' + id + '_2'], one = IMG['r434_p_' + id];
    if (st === 'defeat' && two) return [two, FACE[id + '_2'] || FACE[id] || [.6, .28, .3], false];
    if (one) return [one, FACE[id] || [.6, .25, .3], false]; return [null]; }
  const stateOf = e => !e.alive || e.hp <= 0 || e._defeat ? 'defeat' : e._charge ? 'smirk' : e._ph2 ? 'angry' : 'normal';   // 没有「力竭」这一档（见文件头 ④）
  const EX = { e: null, cur: 'normal', prev: null, t0: 0, pulse: 0 };
  const MED = { x: 396, y: 186, r: 50 };
  function face(g, id, st, a, now) { const [im, fc, drawn] = srcFor(id, st); if (!im || a <= .01) return;
    const R = MED.r, s = fc[2] * im.width, sx = fc[0] * im.width - s / 2, sy = fc[1] * im.height - s / 2;
    // 轻微的姿态：冷笑 抬一点、侧一点；怒 前压、放大（缓、不抖）
    let sc = 1, rot = 0, dy = 0;
    if (st === 'smirk') { sc = 1.06; rot = -.05; dy = -2; }
    else if (st === 'angry') { sc = 1.08 + .012 * Math.sin(now * 2.4); }
    else if (st === 'defeat') { sc = 1; rot = .04; dy = 3; }
    g.save(); g.globalAlpha = a; g.beginPath(); g.arc(MED.x, MED.y, R, 0, 7); g.clip();
    g.fillStyle = '#120608'; g.fillRect(MED.x - R, MED.y - R, R * 2, R * 2);
    g.save(); g.translate(MED.x, MED.y + dy); g.rotate(rot); g.scale(sc, sc); g.drawImage(im, sx, sy, s, s, -R, -R, R * 2, R * 2);
    if (!drawn) {   // 只有一张立绘：用色调 + 光影做表情
      g.globalCompositeOperation = 'source-atop';
      if (st === 'smirk') { const lg = g.createLinearGradient(-R, 0, R, 0); lg.addColorStop(0, 'rgba(120,0,20,.30)'); lg.addColorStop(.6, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(255,90,70,.22)'); g.fillStyle = lg; g.fillRect(-R, -R, R * 2, R * 2); }
      if (st === 'angry') { g.fillStyle = `rgba(185,8,22,${.36 + .05 * Math.sin(now * 2.4)})`; g.fillRect(-R, -R, R * 2, R * 2); const vg = g.createRadialGradient(0, 0, R * .4, 0, 0, R * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,0,4,.55)'); g.fillStyle = vg; g.fillRect(-R, -R, R * 2, R * 2); }
      if (st === 'defeat') { g.fillStyle = 'rgba(60,55,60,.42)'; g.fillRect(-R, -R, R * 2, R * 2); }
      g.globalCompositeOperation = 'source-over';
      if ((st === 'smirk' || st === 'angry') && EYE[id]) { g.globalCompositeOperation = 'lighter'; const f = (.7 + .3 * Math.sin(now * 2.2)) * (st === 'angry' ? 1.25 : 1);   // 冷笑 / 发怒：眼里一点光（怒时更亮）
        for (const [ex, ey] of EYE[id]) { const x = -R + ex * R * 2, y = -R + ey * R * 2, rg = g.createRadialGradient(x, y, 0, x, y, 9); rg.addColorStop(0, `rgba(255,220,200,${.5 * f})`); rg.addColorStop(.35, `rgba(255,60,80,${.3 * f})`); rg.addColorStop(1, 'rgba(255,40,60,0)'); g.fillStyle = rg; g.fillRect(x - 9, y - 9, 18, 18); } } }
    g.restore(); g.restore(); }
  const RING = { normal: [233, 196, 120], smirk: [255, 90, 80], angry: [255, 50, 50], defeat: [150, 140, 130] };
  const exLayer = { draw() { try {
    const b = typeof battle !== 'undefined' && battle; if (!b || !b.cfg || !b.cfg.tower) { EX.e = null; return; }
    const e = b._yw && b._yw._tw ? b._yw : (b.enemies || []).find(u => u._tw); if (!e) return; const id = BOSSID[e._tw.name]; if (!id) return;
    const now = performance.now() / 1000; if (EX.e !== e) { EX.e = e; EX.cur = stateOf(e); EX.prev = null; EX.t0 = now - 1; }
    const st = stateOf(e); if (st !== EX.cur) { EX.prev = EX.cur; EX.cur = st; EX.t0 = now; EX.pulse = now; onExpr(e, st); }
    if (b.state === 'end' && !e._defeat) return;
    const k = sm((now - EX.t0) / .45), R = MED.r, pk = Math.max(0, 1 - (now - EX.pulse) / .9);
    ctx.save();
    // 外圈光：状态的颜色，蓄力时一明一暗地亮（提醒防御），换表情时柔柔地鼓一下
    const c = RING[EX.cur], glow = (EX.cur === 'smirk' ? .55 + .35 * Math.sin(now * 5) : EX.cur === 'angry' ? .45 + .15 * Math.sin(now * 2.4) : .3) + pk * .4;
    const rg = ctx.createRadialGradient(MED.x, MED.y, R * .9, MED.x, MED.y, R * 1.6 + pk * 10); rg.addColorStop(0, `rgba(${c},${glow})`); rg.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(MED.x, MED.y, R * 1.7 + pk * 10, 0, 7); ctx.fill();
    if (EX.prev && k < 1) face(ctx, id, EX.prev, 1 - k, now); face(ctx, id, EX.cur, EX.prev ? k : 1, now);
    ctx.lineWidth = 4; ctx.strokeStyle = `rgb(${RING.normal})`; ctx.beginPath(); ctx.arc(MED.x, MED.y, R + 1, 0, 7); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = `rgba(${c},.9)`; ctx.beginPath(); ctx.arc(MED.x, MED.y, R + 5, 0, 7); ctx.stroke();
    ctx.restore(); } catch (er) {} } };
  S.overlay.push(exLayer);
  // 表情变的时候顺带出声（配音挂点）
  function onExpr(e, st) { const id = BOSSID[e._tw.name]; if (!id) return; if (st === 'angry') vo(id + '_turn'); }
  // 首领倒下：先让她（他）说完最后一句（「被打败」立绘），再收场
  const DEFEAT = { 1: [['绛蘅', '……花根已断，梦境要散了。……原来，真的没有人在等我……']], 2: [['玄锋', '虎卫听令……随本将……再守最后一阵……北关……不破……']] };
  endBattle = (orig => async function (win) { try { const b = battle; if (win && b && b.cfg && b.cfg.tower && b.cfg.boss && !b._r473d) { b._r473d = 1; const e = (b.enemies || []).find(u => u._tw); const L = DEFEAT[b.cfg.tower];
        if (e && L) { e._defeat = 1; const id = BOSSID[e._tw.name], sp = SPEAKERS[e._tw.name], p0 = sp && sp.p; if (sp && id && IMG['r434_p_' + id + '_2']) sp.p = 'r434_p_' + id + '_2';
          await sleep(700); try { for (const [w, t] of L) await say(w, t); } finally { if (sp) sp.p = p0; } } } } catch (e) {}
    return orig.apply(this, arguments); })(endBattle);

  // ---------- ⑤ 配音挂点 ----------
  // r473/vo/<键>.mp3：有就放，没有就静默。静音 / 关了配音（r227_vo_off）时不放。招式名 → 拼音键。
  const MOVE = { 入梦: 'rumeng', 花葬: 'huazang', 花刃: 'huaren', 刀瓣: 'daoban', 花开: 'huakai', 虎啸: 'huxiao', 白虎噬: 'baihushi', 断戟横扫: 'duanji', 扑击: 'puji' };
  const VO_KEYS = ['jh_appear', 'jh_meet_1', 'jh_meet_2', 'jh_meet_3', 'jh_meet_4', 'jh_retry', 'jiangheng_charge_rumeng', 'jiangheng_rumeng', 'jiangheng_huaren', 'jiangheng_turn', 'jiangheng_huakai', 'jiangheng_charge_huazang', 'jiangheng_huazang', 'jiangheng_daoban', 'jiangheng_ximeng', 'jiangheng_burnt', 'jiangheng_defeat'];
  // 已经录好的配音（文件放 r473/vo/<键>.mp3，然后把键名加进下面这个名单；不在名单里的只记一笔、不去请求文件，免得控制台一串 404）
  //   测试时看 R473.VO_LOG：每次挂点被触发都会记下键名和时刻，配音到了按这个对口型。
  const VO_HAVE = new Set([]);
  const VO_LOG = [];
  const BAD = new Set(); let VOA = null;
  function vo(key) { try { if (key) { VO_LOG.push([key, +(performance.now() / 1000).toFixed(2)]); if (VO_LOG.length > 60) VO_LOG.shift(); } if (!key || BAD.has(key) || !VO_HAVE.has(key)) return; if (typeof AUD !== 'undefined' && (AUD.muted || !AUD.mode)) return; try { if (localStorage.getItem('r227_vo_off') === '1') return; } catch (e) {}
      if (VOA) { try { VOA.pause(); } catch (e) {} } const a = new Audio('r473/vo/' + key + '.mp3'); a.volume = .95; a.onerror = () => BAD.add(key); VOA = a; a.play().catch(() => {}); } catch (e) {} }
  const RH = window.R370_H, bossId = e => e && e._tw && BOSSID[e._tw.name];
  if (RH) {
    if (RH.charge) RH.charge = (o => function (e, text) { const id = bossId(e); if (id) { const m = /「(.+?)」/.exec(text || ''); vo(id + '_charge' + (m && MOVE[m[1]] ? '_' + MOVE[m[1]] : '')); } return o.apply(this, arguments); })(RH.charge);
    if (RH.aoe) RH.aoe = (o => function (e, b, name) { const id = bossId(e); if (id && MOVE[name]) setTimeout(() => vo(id + '_' + MOVE[name]), 120); return o.apply(this, arguments); })(RH.aoe);
    if (RH.strike) RH.strike = (o => function (e, b, P, name) { const id = bossId(e); if (id && name && MOVE[name]) vo(id + '_' + MOVE[name]); return o.apply(this, arguments); })(RH.strike);
    if (RH.summon) RH.summon = (o => function (b, e) { const id = bossId(e); if (id) vo(id + '_huakai'); return o.apply(this, arguments); })(RH.summon);
  }
  // 现身时那一下张臂（R463 第 4.6 秒）配笑声；meet 对白按「说话人 + 开头几个字」配
  const MEET = [['绛蘅', '嘘轻些', 'jh_meet_1'], ['绛蘅', '可他们外头', 'jh_meet_2'], ['绛蘅', '你心里也藏着', 'jh_meet_3'], ['绛蘅', '真是位不解风情', 'jh_meet_4'], ['绛蘅', '既然不肯乖乖入梦', 'jh_retry'], ['绛蘅', '花根已断', 'jiangheng_defeat']];
  say = (o => function (who, text) { try { const n = String(text || '').replace(/（[^）]*）/g, '').replace(/[^一-鿿]/g, ''); for (const [w, k, id] of MEET) if (w === who && n.startsWith(k)) { vo(id); break; } } catch (e) {} return o.apply(this, arguments); })(say);
  floatText = (o => function (x, y, text) { try { if (typeof battle !== 'undefined' && battle && battle.cfg && battle.cfg.tower === 1) { if (/^吸梦/.test(text)) vo('jiangheng_ximeng'); else if (/^梦断了/.test(text)) vo('jiangheng_burnt'); } } catch (e) {} return o.apply(this, arguments); })(floatText);

  window.R473 = { VO_LOG, VO_HAVE, wardBreak, gateTalk, bossStage, APPEAR, appearHollow, CAM, camTo, camStart, camStop, WARD, DOOR, EX, MED, FACE, EYE, STATES, srcFor, stateOf, vo, VO_KEYS, MOVE, DEFEAT, RETRY, busy: () => BUSY };
})();
