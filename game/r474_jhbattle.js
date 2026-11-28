// ================= R474 · 绛蘅（万妖塔一层首领）战斗：Codex R472 真画 —— 定稿图 + 动作图 + 五招手绘特效（只进测试版）=================
// 作者 11-28：原来的战斗建模「太拉胯」、技能特效「太 low、全是代码画的」→ Codex R472 逐帧重画了两种形态的全部动作和五招特效。
// 作者 11-28 23:15 看录屏：逐帧播「好卡」；「就做一张定稿图，然后做动作图，中间不需要连贯」；「不需要弄那个咳嗽喘气、衰弱，搞得跟驼背一样」；
//   「BOSS 一定是很帅，技能炫酷，然后发怒，最后死的时候结束、消散」。→ 本体改成「定稿图 + 动作图」（画法在 r474_pose.js）：
//   ① 平时一张定稿站姿：形态一 = idle 第 0 帧（披帛环身、提一枝彼岸花）；形态二 = defeat 第 0 帧（花枝缠身、双臂舒展——那一套前几帧正好是最舒展的站姿，
//      后面才跪坐下去；这里只借第 0 帧当形态二的定稿，跪坐那几帧不用）。代码给它极轻的上下浮动，不换帧。
//   ② 蓄力：一张蓄力静图（形态一 charge 12 闭目嗅花；形态二 charge 9 双手合十仰面），身上那圈光一明一暗。
//   ③ 放招：起手图 → 出招图（交叉淡入 0.08～0.12 秒），出招那一下往前冲、放大到 1.06 再回位；收招淡回定稿图。挑的帧见 MV 表。
//   ④ 挨打：不换图，整张往后一仰 + 白边亮 120 毫秒（r474_pose.js）。
//   ⑤ 形态：正常（形态一，粉光，几片花瓣慢慢绕身）→ 发怒（形态二，红光更足、身后一团暗红的怒气、花瓣绕得快一倍多）→ 死（定稿图停住，从脚往头化成彼岸花瓣飘散）。
//      没有「力竭 / tired」：r370 的力竭（_break）只留数值上的效果，她身上看不出来（R377 那圈光在她身上也不因力竭变暗）。
// 作者 23:16：「他的技能很多还不如小怪的绚丽……把技能变得更大化一点」→ 她是首领，招必须比梦傀更大更炫（梦傀的招不动，形成对比）：
//   · 五招特效整体放大：花刃飞瓣 ×1.35、命中那一团 ×1.9；入梦 / 花葬以我方中间为中心再放大 1.2 / 1.15（从她身前一路铺到我方身后）；花开 ×1.5。
//   · 每招叠两层：底层放大 1.4 倍、半透明、慢两帧；上层原尺寸（fx2）。
//   · 出招前全场（背景）轻轻压暗 0.3 秒，出招那一下再放亮（dimBg）；命中那一刻定格约两帧（她和她的特效停 0.12 秒，freeze）。不震屏、不闪红。
// 数值和出招顺序照旧走 r421（AI.tw_bianhua）。
// 特效按 anim.json：特效画布比人物画布大 1.6 倍（suggestedScale），命中帧对上伤害跳字；花刃飞向目标、在胸口炸开；入梦的网从天上罩住我方；
//   花开在召唤位（两朵花并排长在她身前，花魇就从那两朵花里出来）破土；吸梦从每只花魇飘到她掌心；花葬铺满全场。
// 原来代码画 / R435 黑底的那几招特效（fx_tw_rumeng、fx_tw_huazang、fx3_*、蓄力的紫球、召唤的粒子）在她身上关掉；放招、换形态都不震屏、不闪白（作者：缓、不闪、不抖）。
// 测试面板：「绛蘅战斗：新（R472 真画）/ 旧（R460）」切换（记在本机 gx_r474_jh），再加一个直接开打的按钮。
// 招式音效挂钩：R474SND（定义在 r474_neiyuan.js）。键：jh_<招>_cast（起手）/ jh_<招>_hit（命中），招 = huaren / daoban / rumeng / huakai / ximeng / huazang；
//   R474SND.map[键] = 'r474/sfx/xxx.mp3'（或 playSnd 的键名）就会放，没登记的不发请求。她的台词配音在 r473_bossstage.js（r473/vo/）。
// 接口：window.R474JH = { on(), set(on), state(e), act(e), … }，state(e) 就是 R473.stateOf 的结果（normal / smirk=蓄力 / angry=形态二 / defeat）；act(e) 是她此刻身上那张图的动作名。
(function () {
  const M = window.R415_META && R415_META.bianhua_r474, PO = window.R474POSE;
  if (!M || !PO || !window.TOWER || !window.R370_H || !window.R370_AI || typeof drawUnit !== 'function' || typeof S === 'undefined') return;
  const LSK = 'gx_r474_jh';
  const LSG = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const LSS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let ON = LSG(LSK, '1') !== '0';
  const DIR = 'r474/', VER = '?v=1';
  const H = R370_H;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const sm = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const nowS = () => performance.now() / 1000;
  // 她自己的时钟：命中那一刻「定格」0.12 秒（她和她的特效停住，别人照常），之后接着走
  let FZA = 0, FZ0 = -1, FZD = 0;
  function clk() { const n = nowS(); if (FZ0 >= 0) { if (n < FZ0 + FZD) return FZ0 - FZA; FZA += FZD; FZ0 = -1; } return n - FZA; }
  function freeze(d = .12) { clk(); if (FZ0 < 0) { FZ0 = nowS(); FZD = d; } }
  const snd = (k, delay = 0) => { const go = () => { try { if (window.R474SND) R474SND.play(k); } catch (e) {} }; if (delay > 0) setTimeout(go, delay * 1000); else go(); };

  // ---------- 比例 ----------
  const K = .8;                         // 和 r421 给绛蘅登记的比例一样：屏幕上身体高 = bodyH（380）× 0.8 ≈ 304
  const FK = { f1: 1, f2: 1 };          // 形态二的定稿图是站姿（defeat 0，和形态一 idle 一样高），两形态同一个比例
  const CS = f => K / M.over * FK[f];   // 图集像素 → 屏幕
  const CSRC = f => M.s * CS(f);        // 原画像素 → 屏幕
  const KFX = f => 1.6 * CSRC(f);       // 特效参考画布像素 → 屏幕（anim.json suggestedScale = 1.6）
  const BODY = () => Math.round(M.bodyH * K);   // 身体在屏幕上的高（血条、飘字按这个算）
  const REF_ACTOR = [392, 952];         // 特效参考画面里施法者的脚
  const FLOWER_ROOT = [[840, 958], [1130, 958]];   // 花开：两朵花在参考画面里的根
  const XI_SRC = [1330, 560], XI_PALM = [471, 488];  // 吸梦：参考画面里气流的来处 / 她的掌心

  // ---------- 定稿图 / 动作图（挑帧：报告里有拼图 /tmp/claude-0/n4/pose/挑帧.jpg）----------
  const STILL = { f1: ['idle', 0], f2: ['defeat', 0] };      // 定稿站姿
  const CHG = { f1: ['charge', 12], f2: ['charge', 9] };      // 蓄力
  const MV = {                                                // 每招：起手 wind / 出招 strike
    huaren: { form: 'f1', wind: ['atk_huaren', 7], strike: ['atk_huaren', 11] },    // 广袖扬过头顶 → 长袖向前甩直
    rumeng: { form: 'f1', wind: ['atk_rumeng', 8], strike: ['atk_rumeng', 15] },    // 双臂交举过顶 → 一手上扬一手前送
    daoban: { form: 'f2', wind: ['atk_huazang', 8], strike: ['atk_huazang', 20] },  // 双手拢在胸前 → 一臂甩开（吸梦那套是背身，不够好看，借花葬的正面帧）
    huakai: { form: 'f2', wind: ['atk_huakai', 4], strike: ['atk_huakai', 20] },    // 俯身按地 → 起身抬手（花开）
    ximeng: { form: 'f2', wind: ['defeat', 3], strike: ['charge', 9] },             // 双臂舒展、掌心向上承梦 → 双手合十收进来（atk_ximeng 是背身，不用）
    huazang: { form: 'f2', wind: ['atk_huazang', 8], strike: ['atk_huazang', 12] }, // 双手拢花 → 裙摆旋开、双臂舒展
  };
  const ALT = { huaren: 'daoban', daoban: 'huaren', rumeng: 'huazang', huazang: 'rumeng', huakai: 'huazang', ximeng: 'huazang' };   // 形态对不上时借另一形态的同类招
  const KEY = (f, a) => f + '|' + a[0] + '|' + a[1];

  // ---------- 图 ----------
  const IM = {};
  const ok = im => im && im.complete && im.naturalWidth;
  function pim(name) { let im = IM[name]; if (!im) { im = IM[name] = new Image(); im.src = DIR + name + VER; } return im; }
  const pages = () => { const a = []; for (const f of ['f1', 'f2']) for (const p of M.forms[f].pages) a.push(p[0]); for (const k in M.fx) for (const p of M.fx[k].pages) a.push(p[0]); return a; };
  function loadAll() { for (const n of pages()) { const im = pim(n); try { if (im.decode) im.decode().catch(() => {}); } catch (e) {} } }
  const ready = f => M.forms[f].pages.every(p => ok(pim(p[0])));
  const fxReady = k => M.fx[k] && M.fx[k].pages.every(p => ok(pim(p[0])));
  const SRC = new Map();
  function src(key) { let o = SRC.get(key); if (o === undefined) { const [f, a, i] = key.split('|'), F = M.forms[f], A = F && F.acts[a], fr = A && A.fr[+i]; o = fr ? { im: pim(F.pages[fr[0]][0]), fr, sc: CS(f) } : null; SRC.set(key, o); } return o; }

  const isJH = u => !!(ON && u && u.side === 'enemy' && u._tw && u._tw.n === 1);
  const formOf = u => (u._ph2 ? 'f2' : 'f1');
  function state(u) {   // 和名牌头像同一个判断（R473）：normal / smirk（蓄力）/ angry（形态二）/ defeat
    try { if (window.R473 && R473.stateOf) return R473.stateOf(u); } catch (e) {}
    return !u.alive || u.hp <= 0 || u._defeat ? 'defeat' : u._charge ? 'smirk' : u._ph2 ? 'angry' : 'normal'; }
  const baseKey = (u, st) => { const f = formOf(u); return KEY(f, st === 'smirk' ? CHG[f] : STILL[f]); };
  function J(u) { return u._j || (u._j = { lastHurt: -9 }); }
  // 放一招：t0 起手、ts 出招那一下、te 收招（都是她的时钟）
  function move(e, name, t0, ts, te) {
    const f = formOf(e); let m = MV[name]; if (m.form !== f) m = MV[ALT[name]]; if (!m || m.form !== f) return;
    PO.act(e, { t0, ts, te, L: 30, S: .06, steps: [[t0, KEY(f, m.wind), .12], [ts - .05, KEY(f, m.strike), .08]] }); }

  // ---------- 画本体 ----------
  // 绕身的彼岸花瓣：平时几片慢慢转；发怒（形态二）片数多、转得快一倍多；身后一团暗红怒气（慢慢明暗，不闪）
  const AUR = []; { let sd = 5; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 22; i++) AUR.push({ a0: r() * 6.283, r: .75 + r() * .45, h: r(), sz: 3 + r() * 2.6, rot: r() * 6.28, vr: (r() - .5) * 3, col: r(), sp: .8 + r() * .4 }); }
  const PCOL = ['#e8283e', '#c81428', '#ff5a6e'];
  function petal(x, y, s, rot, col, a) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= a; ctx.fillStyle = PCOL[Math.floor(col * 2.99)];
    ctx.beginPath(); ctx.moveTo(0, -s * 1.6); ctx.quadraticCurveTo(s * .42, -s * .2, 0, s * 1.2); ctx.quadraticCurveTo(-s * .42, -s * .2, 0, -s * 1.6); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= .35; ctx.fillStyle = '#ff8090'; ctx.beginPath(); ctx.ellipse(0, -s * .2, s * .5, s * 1.1, 0, 0, 7); ctx.fill(); ctx.restore(); }   // 花瓣上一点亮，红底背景上也看得见
  function aura(front, now, angry) {
    const Hh = BODY(), n = angry ? 22 : 9, sp = angry ? 1.25 : .45, rx = angry ? 150 : 120, ry = 28;
    if (!front && angry) { const cy = -Hh * .5, pl = .75 + .25 * Math.sin(now * 1.3); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, cy, Hh * .1, 0, cy, Hh * .75); g.addColorStop(0, `rgba(255,40,64,${.2 * pl})`); g.addColorStop(.6, `rgba(190,10,40,${.1 * pl})`); g.addColorStop(1, 'rgba(150,0,30,0)'); ctx.fillStyle = g; ctx.fillRect(-Hh, cy - Hh, Hh * 2, Hh * 2); ctx.restore(); }
    for (let i = 0; i < n; i++) { const p = AUR[i], ang = p.a0 + now * sp * p.sp, s = Math.sin(ang); if ((s > 0) !== front) continue;
      const x = Math.cos(ang) * rx * p.r, y = -Hh * (.18 + .62 * p.h) + s * ry + Math.sin(now * .9 + i) * 6;
      petal(x, y, p.sz * (front ? 1.9 : 1.5), p.rot + now * p.vr, p.col, (front ? .85 : .55) * (angry ? 1 : .8)); } }
  const GLOW = { normal: [[255, 108, 128], .45], smirk: [[255, 96, 110], 1], angry: [[255, 60, 80], .85], defeat: [null, 0] };
  function drawBody(u, now, st) {
    const x = u.x + (u.ox || 0), y = u.y + (u.oy || 0), angry = !!u._ph2, [glow, power0] = GLOW[st] || GLOW.normal;
    const power = st === 'smirk' ? power0 * (.75 + .25 * Math.sin(now * 3)) : power0;
    PO.draw(u, now, src, x, y, { glow, power, float: 3, back: () => aura(false, now, angry), front: () => aura(true, now, angry) }); }

  // ---------- 接进引擎的 drawUnit：影子、血条、名字、R377 的光轮照旧，本体换成定稿图 / 动作图 ----------
  const JKEY = 'jh474_body'; let CUR = null;
  drawUnit = (orig => function (u) {
    if (!isJH(u) || !ready(formOf(u))) return orig.apply(this, arguments);
    const now = clk(), j = J(u), st = state(u);
    if (st === 'defeat') {   // 死：定稿图停住，再从脚往头化成花瓣飘散；散完连影子都不画
      if (j.gone) return; const D = u._ps && u._ps.diss;
      if (!D || now - D.t0 < PO.DUR * .5) { const k0 = u.key, vk0 = u._vk; u.key = JKEY; u._vk = undefined; CUR = { done: true }; try { orig.apply(this, arguments); } catch (e) {} finally { u.key = k0; u._vk = vk0; CUR = null; } }   // 只要影子：老图集那套「败」别画出来
      if (!PO.dissolve(u, now, src, KEY(formOf(u), STILL[formOf(u)]), u.x + (u.ox || 0), u.y + (u.oy || 0), 'petal')) j.gone = 1;
      return; }
    if (u.hurt > .85 && now - j.lastHurt > .35) { j.lastHurt = now; PO.hit(u, now); }
    const f = formOf(u); if (j.form && j.form !== f) PO.want(u, baseKey(u, st), now, .7); j.form = f;   // 换形态：新的慢慢显出来
    PO.pick(u, now, baseKey(u, st));
    const k0 = u.key, vk0 = u._vk, hu = u.hurt, h0 = u.h, br0 = u._break;
    u.key = JKEY; u._vk = undefined; u.hurt = 0; u.h = BODY() + 8; if (br0 > 0) u._break = 0; CUR = { u, now, st, done: false };
    try { orig.apply(this, arguments); }
    finally { const c = CUR; CUR = null; u.key = k0; u._vk = vk0; u.hurt = hu; u.h = h0; u._break = br0; if (!c || !c.done) { try { drawBody(u, now, st); } catch (e) {} } } })(drawUnit);
  drawSprite = (orig => function (key) { if (key === JKEY) { if (CUR && !CUR.done) { CUR.done = true; try { drawBody(CUR.u, CUR.now, CUR.st); } catch (e) {} } return; } return orig.apply(this, arguments); })(drawSprite);

  // ---------- 她放招时：老特效、震屏、闪白都关掉 ----------
  let MUTE = 0;
  const MUTED = new Set(['fx_tw_rumeng', 'fx_tw_huazang', 'fx3_burst_red', 'fx3_slash_gold', 'fx3_orb_violet', 'fx_tw_none']);
  if (typeof fx === 'function') fx = (o => function (name) { if (MUTE > 0 && MUTED.has(name)) return addFx({ life: 0, layer: 1, draw() {} }); return o.apply(this, arguments); })(fx);
  if (typeof particleBurst === 'function') particleBurst = (o => function () { if (MUTE > 0) return; return o.apply(this, arguments); })(particleBurst);
  try { for (const k of ['shake', 'flash']) { let v = S[k] || 0; Object.defineProperty(S, k, { configurable: true, enumerable: true, get() { return v; }, set(x) { if (MUTE > 0 && x > v) return; v = x; } }); } } catch (e) {}
  async function muted(fn) { MUTE++; try { return await fn(); } finally { MUTE--; } }
  // 远程出手：引擎的 strike 会冲到目标面前——她不冲，原地等到命中帧（_jHold 是真实时间）
  if (typeof dashTo === 'function') dashTo = (o => async function (u) { if (u && u._jHold) { const w = u._jHold - nowS(); if (w > 0) await sleep(w * 1000); return; } return o.apply(this, arguments); })(dashTo);
  if (typeof dashBack === 'function') dashBack = (o => async function (u) { if (u && u._jHold) return; return o.apply(this, arguments); })(dashBack);

  // ---------- 出招的「势」：背景先压暗、出招那一下放亮；命中定格 ----------
  function dimBg(t0, tUp) {   // engine 的 fx 第 0 层画在背景之上、人物之下：只压背景，人和特效照样亮
    const life = tUp - t0 + .45 + Math.max(0, t0 - clk());
    return addFx({ life, layer: 0, draw() { const c = clk(), a = .34 * sm((c - t0) / .3) * (1 - sm((c - tUp) / .35)); if (a <= .005) return; ctx.save(); ctx.fillStyle = `rgba(14,2,8,${a})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }); }
  const stopAt = sec => setTimeout(() => freeze(.12), Math.max(0, sec) * 1000);

  // ---------- 特效 ----------
  // 一个变换 T = { ax, ay, px, py, k, rot }：参考画面里的点 p → 屏幕 (ax, ay) + R(rot)·(p − (px, py))·k
  const mapPt = (T, p) => { const dx = (p[0] - T.px) * T.k, dy = (p[1] - T.py) * T.k, c = Math.cos(T.rot || 0), s = Math.sin(T.rot || 0); return [T.ax + dx * c - dy * s, T.ay + dx * s + dy * c]; };
  const mix = (A, B, k) => ({ ax: lerp(A.ax, B.ax, k), ay: lerp(A.ay, B.ay, k), px: A.px, py: A.py, k: lerp(A.k, B.k, k), rot: lerp(A.rot || 0, B.rot || 0, k) });
  const rebase = (T, p) => { const q = mapPt(T, p); return { ax: q[0], ay: q[1], px: p[0], py: p[1], k: T.k, rot: T.rot || 0 }; };
  const about = (T, c, s) => ({ ax: c[0] + (T.ax - c[0]) * s, ay: c[1] + (T.ay - c[1]) * s, px: T.px, py: T.py, k: T.k * s, rot: T.rot || 0 });   // 以屏幕上 c 点为中心放大 s 倍
  function fxBlit(key, i, T, a) {
    const X = M.fx[key], fr = X.fr[i]; if (!fr || a <= .003) return; const im = pim(X.pages[fr[0]][0]); if (!ok(im)) return;
    ctx.save(); ctx.globalAlpha *= Math.min(1, a); ctx.translate(T.ax, T.ay); if (T.rot) ctx.rotate(T.rot); ctx.scale(T.k / X.s, T.k / X.s); ctx.translate(-T.px * X.s, -T.py * X.s);
    ctx.drawImage(im, fr[1], fr[2], fr[3], fr[4], fr[5], fr[6], fr[3], fr[4]); ctx.restore(); }
  // 两层：底层放大 1.4 倍、半透明、慢两帧；上层原尺寸（作者 23:16「技能变得更大化一点」）
  function fx2(key, i, T, a, c) { const cc = c || [T.ax, T.ay]; if (i >= 2) fxBlit(key, i - 2, about(T, cc, 1.4), a * .42); fxBlit(key, i, T, a); }
  // 跑一段特效：draw(i, tf, t) 每帧调用（i = 第几帧，从 0 起；tf = 帧内小数；t = 秒）
  function runFx(key, t0, dur, draw, layer = 1) {
    const X = M.fx[key]; return addFx({ life: dur + Math.max(0, t0 - clk()) + .35, layer, draw() { const t = clk() - t0; if (t < 0 || t > dur) return; const q = t * X.fps, i = Math.min(X.n - 1, Math.floor(q)); try { draw(i, q - Math.floor(q), t); } catch (e) {} } }); }
  const foot = e => [e.x + (e.ox || 0), e.y + (e.oy || 0)];
  const caster = e => { const [x, y] = foot(e); return { ax: x, ay: y, px: REF_ACTOR[0], py: REF_ACTOR[1], k: KFX(formOf(e)), rot: 0 }; };
  const chest = P => [P.x + (P.ox || 0), P.y + (P.oy || 0) - (P.h || 240) * .58];
  const heroMid = b => { const hs = H.heroes(b); if (!hs.length) return [1000, 420]; const ps = hs.map(chest); return [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length]; };
  const VIEW = (dx = 0) => ({ ax: 0 + dx, ay: 0, px: 0, py: 150, k: W / 1600, rot: 0 });   // 参考视口 (0,150,1600,900) → 整个屏幕
  const tail = (t, dur, d = .35) => clamp01((dur - t) / d);

  // 花刃 / 刀瓣：飞瓣从她手里出去，一路滑向目标（帧内也连续走，不一跳一跳），在胸口炸开（飞瓣 ×1.35、炸开那一团 ×1.9）
  function fxHuaren(e, P, t0, o = {}) {
    const X = M.fx.huaren, C = caster(e), tips = X.projectileTipByFrame, rel = X.releaseFrame, imp = X.impactFrame;
    const IP = X.impactAnchor.point, R0 = mapPt(C, tips[rel]), I = chest(P);
    const ref0 = tips[rel], refLen = Math.hypot(IP[0] - ref0[0], IP[1] - ref0[1]);
    const rot = Math.atan2(I[1] - R0[1], I[0] - R0[0]) - Math.atan2(IP[1] - ref0[1], IP[0] - ref0[0]);
    const uOf = n => { const p = n >= imp ? IP : tips[n]; return Math.hypot(p[0] - ref0[0], p[1] - ref0[1]) / refLen; };
    const first = o.skipWind ? rel - 1 : 0, dur = X.n / X.fps;
    const TI = { ax: I[0], ay: I[1], px: IP[0], py: IP[1], k: KFX(formOf(e)) * (o.k || 1) * 1.9, rot: 0 };
    return runFx('huaren', t0, dur, (i, tf, t) => {
      const n = i + 1; if (n - 1 < first) return;
      if (n < rel) { fx2('huaren', i, C, 1); return; }
      if (n < imp) { const u = lerp(uOf(n), uOf(n + 1), tf), tip = tips[n], q = [lerp(R0[0], I[0], u), lerp(R0[1], I[1], u)];
        fx2('huaren', i, { ax: q[0], ay: q[1], px: tip[0], py: tip[1], k: C.k * 1.35, rot }, 1); return; }
      fx2('huaren', i, TI, tail(t, dur, .3)); }); }

  // 入梦：开头几帧是她身前升起的梦丝（跟着她），之后整张网从天上垂下来、罩住我方（以我方中间为中心再放大 1.2）
  function fxRumeng(e, b, t0) {
    const C = caster(e), hs = H.heroes(b), hx = hs.length ? hs.reduce((s, P) => s + P.x, 0) / hs.length : 1060, hc = heroMid(b);
    const V0 = VIEW(Math.max(0, hx - 1320 * W / 1600)), Cb = rebase(C, REF_ACTOR), Vb = about(rebase(V0, REF_ACTOR), hc, 1.2), X = M.fx.rumeng, dur = X.n / X.fps;
    return runFx('rumeng', t0, dur, (i, tf, t) => { const q = i + tf, k = sm((q - 2.5) / 3); fx2('rumeng', i, k <= 0 ? Cb : k >= 1 ? Vb : mix(Cb, Vb, k), tail(t, dur), k > .5 ? hc : null); }); }

  // 花葬：花在她胸前旋起来，然后整片花海铺满全场（以我方中间为中心再放大 1.15，顶峰压到 0.93，不把人整个吞掉），最后化成落花散掉
  function fxHuazang(e, b, t0) {
    const C = caster(e), hc = heroMid(b), Cb = rebase(C, REF_ACTOR), Vb = about(rebase(VIEW(0), REF_ACTOR), hc, 1.15), X = M.fx.huazang, dur = X.n / X.fps;
    return runFx('huazang', t0, dur, (i, tf, t) => { const q = i + tf, k = sm((q - 3) / 3); fx2('huazang', i, k <= 0 ? Cb : k >= 1 ? Vb : mix(Cb, Vb, k), .93 * tail(t, dur, .5), k > .5 ? hc : null); }); }

  // 花开：两朵花在她身前的两个召唤位破土、开花（×1.5）；花魇从花里出来（花开到头，花慢慢淡掉、花魇慢慢显出来）
  const SLOT_Y = 676, SLOT_X = [480, 614];
  const bloomT = () => { const [a, b2] = FLOWER_ROOT, T = { ax: SLOT_X[0], ay: SLOT_Y, px: a[0], py: a[1], k: (SLOT_X[1] - SLOT_X[0]) / (b2[0] - a[0]), rot: 0 }; return about(T, [(SLOT_X[0] + SLOT_X[1]) / 2, SLOT_Y], 1.5); };
  const BLOOM_HOLD = .45;
  function fxHuakai(t0) { const X = M.fx.huakai, T = bloomT(), c = [(SLOT_X[0] + SLOT_X[1]) / 2, SLOT_Y], dur = X.n / X.fps + BLOOM_HOLD;
    return runFx('huakai', t0, dur, (i, tf, t) => fx2('huakai', i, T, tail(t, dur, .6), c)); }

  // 吸梦：每只活着的花魇身上飘出一缕梦，缓缓流进她举起的掌心（底层以掌心为中心放大）
  function fxXimeng(e, flowers, t0) {
    const X = M.fx.ximeng, dur = X.n / X.fps, palm = mapPt(caster(e), XI_PALM), refLen = Math.hypot(XI_SRC[0] - XI_PALM[0], XI_SRC[1] - XI_PALM[1]), refAng = Math.atan2(XI_SRC[1] - XI_PALM[1], XI_SRC[0] - XI_PALM[0]);
    for (const F of flowers) { const s = [F.x, F.y - (F.h || 220) * .55], L = Math.hypot(s[0] - palm[0], s[1] - palm[1]);
      const T = { ax: palm[0], ay: palm[1], px: XI_PALM[0], py: XI_PALM[1], k: Math.max(.2, L / refLen), rot: Math.atan2(s[1] - palm[1], s[0] - palm[0]) - refAng };
      runFx('ximeng', t0, dur, (i, tf, t) => fx2('ximeng', i, T, .95 * tail(t, dur), palm)); } }

  // ---------- 出招 ----------
  const HIT = (form, act) => { const A = M.forms[form].acts[act]; return A ? ((A.hit || A.n) - 1) / A.fps : 1; };
  const busyUntil = e => Math.max(PO.busyTill(e), e._jWait || 0);
  async function settle(e, cap = 2.2) { const w = Math.min(cap, busyUntil(e) - clk() - .2); if (w > 0) await sleep(w * 1000); }
  const can = e => isJH(e) && ready(formOf(e));

  if (H.charge) H.charge = (o => async function (e) { if (!can(e)) return o.apply(this, arguments); return muted(() => o.apply(this, arguments)); })(H.charge);

  if (H.strike) H.strike = (o => async function (e, b, P, name, mult, fxName) {
    if (!can(e) || !P) return o.apply(this, arguments);
    const form = formOf(e), t0 = clk(), a = [...arguments]; a[5] = 'fx_tw_none'; let hitT;
    if (form === 'f1') { const X = M.fx.huaren, rel = (X.releaseFrame - 1) / X.fps; hitT = HIT('f1', 'atk_huaren');
      move(e, 'huaren', t0, t0 + rel, t0 + hitT + .45); dimBg(t0, t0 + rel); if (fxReady('huaren')) fxHuaren(e, P, t0); snd('jh_huaren_cast'); snd('jh_huaren_hit', hitT); }
    else {   // 刀瓣：手收在胸前 → 甩开，飞瓣在手甩开时出手
      const X = M.fx.huaren, rel = 1.0; hitT = rel + (X.impactFrame - X.releaseFrame) / X.fps;
      move(e, 'daoban', t0, t0 + rel, t0 + hitT + .4); dimBg(t0, t0 + rel);
      if (fxReady('huaren')) fxHuaren(e, P, t0 + rel - (X.releaseFrame - 1) / X.fps, { skipWind: true, k: .85 }); snd('jh_daoban_cast'); snd('jh_daoban_hit', hitT); }
    stopAt(hitT); e._jHold = nowS() + hitT;
    try { return await muted(() => o.apply(this, a)); }
    finally { e._jHold = 0; await settle(e, 1.2); } })(H.strike);

  if (H.aoe) H.aoe = (o => async function (e, b, name, fxName) {
    if (!can(e) || (name !== '入梦' && name !== '花葬')) return o.apply(this, arguments);
    const act = name === '入梦' ? 'atk_rumeng' : 'atk_huazang', mk = name === '入梦' ? 'rumeng' : 'huazang', form = formOf(e), t0 = clk(), a = [...arguments]; a[3] = 'fx_tw_none';
    const hitT = HIT(M.forms[form].acts[act] ? form : (form === 'f1' ? 'f2' : 'f1'), act);
    move(e, mk, t0, t0 + hitT - .1, t0 + hitT + .55); dimBg(t0, t0 + hitT - .1); stopAt(hitT);
    snd('jh_' + mk + '_cast'); snd('jh_' + mk + '_hit', hitT);
    if (name === '入梦' && fxReady('rumeng')) fxRumeng(e, b, t0); if (name === '花葬' && fxReady('huazang')) fxHuazang(e, b, t0);
    // 引擎的 aoe 从调用到落伤害约 0.75 秒（喊招名、压暗）：提前起手，让伤害正好落在命中帧
    return muted(async () => { await sleep(Math.max(0, hitT - .75) * 1000); return o.apply(this, a); }); })(H.aoe);

  // 花开：r421 先喊「花开」再半秒后召唤——喊招名的那一刻起手，召出来的花魇先藏着，等花开到头再显出来
  let BLOOM = null;
  function bloom(e, t0) { const hT = HIT('f2', 'atk_huakai'); move(e, 'huakai', t0, t0 + hT - .05, t0 + hT + .65); dimBg(t0, t0 + hT - .05); setTimeout(() => freeze(.12), hT * 1000); if (fxReady('huakai')) fxHuakai(t0); }
  if (H.big) H.big = (o => function (t) { try { const b = typeof battle !== 'undefined' && battle; if (t === '花开' && b) { const e = (b.enemies || []).find(u => u.alive && isJH(u) && u._ph2); if (e && ready('f2')) { const t0 = clk(); bloom(e, t0); BLOOM = { e, t0 }; snd('jh_huakai_cast'); snd('jh_huakai_hit', HIT('f2', 'atk_huakai')); } } } catch (er) {} return o.apply(this, arguments); })(H.big);
  if (H.summon) H.summon = (o => function (b, e) {
    if (!can(e)) return o.apply(this, arguments);
    const n0 = b.enemies.length; let r;
    MUTE++; try { r = o.apply(this, arguments); } finally { MUTE--; }
    try { const t0 = BLOOM && BLOOM.e === e && clk() - BLOOM.t0 < 2 ? BLOOM.t0 : clk(), X = M.fx.huakai, show = t0 + X.n / X.fps - .15;
      if (!BLOOM || BLOOM.e !== e) bloom(e, t0);
      for (const u of b.enemies.slice(n0)) { u._jShow = show; } e._jWait = show + .55; BLOOM = null; } catch (er) {}
    return r; })(H.summon);
  // 花魇：花开到头之前不画，之后 0.5 秒慢慢显出来
  drawUnit = (orig => function (u) { const s = u && u._jShow; if (!s) return orig.apply(this, arguments); const k = (clk() - s) / .5; if (k < 0) return; if (k >= 1) { u._jShow = 0; return orig.apply(this, arguments); }
    ctx.save(); ctx.globalAlpha *= sm(k); try { return orig.apply(this, arguments); } finally { ctx.restore(); } })(drawUnit);

  // 吸梦 + 每一手收尾：r421 的打法照旧，只在前后补动作
  const AI = R370_AI;
  if (AI.tw_bianhua) AI.tw_bianhua = (o => async function (e, b) {
    if (!can(e)) return o.apply(this, arguments);
    try { if (e._ph2 && !e._turnNow && !e._burnt) { const fl = H.addsAlive(b, e), cap = Math.round(e.maxhp * .5);   // 和 r421 回血的条件一样
        if (fl.length && e.hp < cap) { const t0 = clk(), hT = HIT('f2', 'atk_ximeng'); move(e, 'ximeng', t0, t0 + hT, t0 + hT + .45); dimBg(t0, t0 + hT); if (fxReady('ximeng')) fxXimeng(e, fl, t0); snd('jh_ximeng_cast'); snd('jh_ximeng_hit', hT); await sleep(hT * 1000); } } } catch (er) {}
    const turning = e._turnNow && !e._ph2;   // 这一手是换形态：闪红、震屏关掉
    const r = turning ? await muted(() => o.apply(this, arguments)) : await o.apply(this, arguments);
    if (isJH(e)) { e.h = Math.round(M.bodyH * .92 * K); await settle(e); }   // 换形态后 r421 把高度设成老图集的，这里按真画帧的身高改回来
    return r; })(AI.tw_bianhua);

  // ---------- 开打：拉图集、把召唤位排成她身前并排的两朵花 ----------
  if (typeof startBattle === 'function') startBattle = (orig => function (cfg) {
    try { if (ON && cfg && cfg.tower === 1 && cfg.boss) { loadAll(); for (const e of cfg.enemies || []) if (e && e._tw && e._tw.n === 1 && e._yw) e._yw.sslots = SLOT_X.map(x => [x, SLOT_Y]).concat([[545, 470], [440, 560]]); } } catch (e) {}
    return orig.apply(this, arguments); })(startBattle);
  if (typeof window.VS_BATTLE_READY === 'function') window.VS_BATTLE_READY = (o => function (b) { const r = o.apply(this, arguments); try { if (ON && b && (b.enemies || []).some(u => u && u._tw && u._tw.n === 1)) return r && ready('f1'); } catch (e) {} return r; })(window.VS_BATTLE_READY);

  // ---------- 测试面板 ----------
  let row = null;
  function mark() { if (row) for (const b of row.querySelectorAll('button[data-v]')) b.className = (b.dataset.v === '1') === ON ? 'on' : ''; }
  function set(on) { ON = !!on; LSS(LSK, ON ? '1' : '0'); if (ON) loadAll(); mark(); try { toast('绛蘅战斗：' + (ON ? '新（R472 真画 · 定稿图 + 动作图）' : '旧（R460）'), 2000); } catch (e) {} }
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r474]')) return;
      const h = document.createElement('h4'); h.textContent = '11-28 新加 · 绛蘅战斗（万妖塔一层首领，记在本机）'; h.setAttribute('data-r474', '1');
      row = document.createElement('div'); row.className = 'row';
      for (const [v, t] of [['1', '绛蘅战斗：新（R472 真画）'], ['0', '绛蘅战斗：旧（R460）']]) { const b = document.createElement('button'); b.textContent = t; b.dataset.v = v; b.onclick = () => set(v === '1'); row.appendChild(b); }
      const go = document.createElement('button'); go.textContent = '直接开打绛蘅'; go.onclick = () => { try { const q = document.getElementById('dbgPanel'); if (q) q.hidden = true; } catch (e) {} if (!(typeof battle !== 'undefined' && battle)) TOWER.fightBoss(1); }; row.appendChild(go);
      p.appendChild(h); p.appendChild(row); mark(); };
    // 面板每次打开都会整个重画（innerHTML），所以一直盯着它：我们这几行没了就再补上（和 r473_inner.js 一样）
    const watch = p => { add(); new MutationObserver(() => { if (!p.querySelector('[data-r474]')) add(); }).observe(p, { childList: true }); };
    if (document.getElementById('dbgPanel')) watch(document.getElementById('dbgPanel')); else { const mo = new MutationObserver(() => { const p = document.getElementById('dbgPanel'); if (p) { mo.disconnect(); watch(p); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}

  // 录预览 / 测试用：让她直接放某一招的画面（不扣血）：name = huaren / daoban / rumeng / huazang / huakai / ximeng
  function demo(e, name, b = typeof battle !== 'undefined' && battle) { const t0 = clk(), P = b && H.heroes(b)[0];
    if (name === 'huaren' || name === 'daoban') { if (P) fxHuaren(e, P, t0); move(e, name, t0, t0 + .9, t0 + 1.85); dimBg(t0, t0 + .9); stopAt(1.4); }
    else if (name === 'rumeng' || name === 'huazang') { const hT = HIT(formOf(e), 'atk_' + name) || 1.15; move(e, name, t0, t0 + hT - .1, t0 + hT + .55); dimBg(t0, t0 + hT - .1); stopAt(hT); if (name === 'rumeng') fxRumeng(e, b, t0); else fxHuazang(e, b, t0); }
    else if (name === 'huakai') bloom(e, t0);
    else if (name === 'ximeng') { const fl = H.addsAlive(b, e); const hT = HIT('f2', 'atk_ximeng'); move(e, 'ximeng', t0, t0 + hT, t0 + hT + .45); dimBg(t0, t0 + hT); if (fl.length) fxXimeng(e, fl, t0); } }
  window.R474JH = { on: () => ON, set, state, act: e => (e && e._ps && e._ps.cur ? e._ps.cur.key.split('|')[1] : null), key: e => (e && e._ps && e._ps.cur ? e._ps.cur.key : null), demo, move, M, loadAll, ready, KFX, CS, STILL, CHG, MV, clk };
})();
