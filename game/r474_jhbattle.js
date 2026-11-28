// ================= R474 · 绛蘅（万妖塔一层首领）战斗：Codex R472 真画帧 + 五招手绘特效（只进测试版）=================
// 作者 11-28：原来的战斗建模「太拉胯」、技能特效「太 low、全是代码画的」→ Codex R472 逐帧重画了两种形态的全部动作和五招特效。
// 图集：tools/r474_build.py → game/r474/jh_f1*.webp、jh_f2*.webp、jh_fx_*.webp；尺寸表在 r415_meta.js 的 bianhua_r474（每帧单独裁边、按动作顺序装页，每页 ≤4096）。
// 这个文件只管「绛蘅」这一个首领在战斗里怎么画、怎么放招，数值和出招顺序照旧走 r421（AI.tw_bianhua）：
//   ① 本体自己画（原画朝右 = 面朝我方，不镜像）：平时 idle；蓄力 charge（放完一遍后在最后几帧里慢慢来回，像在憋着那口气）；
//      挨打 hurt（往后一仰再缓回来）；力竭 tired（循环）；败 defeat（放完停在最后一帧）。两种形态之间、动作之间都柔柔地交叉淡入，不硬切。
//      状态看 R473.stateOf（首领表情那一套：normal / smirk=蓄力 / angry=形态二 / hurt=力竭 / defeat）——身姿和名牌头像的表情用同一个判断，不各做一套。
//   ② 放哪招播哪套：花刃 atk_huaren；入梦 atk_rumeng；花开 atk_huakai；吸梦 atk_ximeng；花葬 atk_huazang；形态二的普通攻击「刀瓣」借吸梦的帧倒放（手从胸前甩出去）+ 花刃的飞瓣。
//   ③ 特效按 anim.json：特效画布比人物画布大 1.6 倍（suggestedScale），命中帧对上伤害跳字；花刃飞向目标、在胸口炸开；入梦的网从天上罩住我方；
//      花开在召唤位（两朵花并排长在她身前，花魇就从那两朵花里出来）破土；吸梦从每只花魇飘到她掌心；花葬铺满全场。
//   ④ 原来代码画 / R435 黑底的那几招特效（fx_tw_rumeng、fx_tw_huazang、fx3_*、蓄力的紫球、召唤的粒子）在她身上关掉；她放招时也不震屏、不闪白（作者：缓、不闪、不抖）。
//   ⑤ 测试面板：「绛蘅战斗：新（R472 真画）/ 旧（R460）」切换（记在本机 gx_r474_jh），再加一个直接开打的按钮。
//   ⑥ 招式音效挂钩：R474SND（定义在 r474_neiyuan.js）。键：jh_<招>_cast（起手）/ jh_<招>_hit（命中），招 = huaren / daoban / rumeng / huakai / ximeng / huazang；
//      R474SND.map[键] = 'r474/sfx/xxx.mp3'（或 playSnd 的键名）就会放，没登记的不发请求。她的台词配音在 r473_bossstage.js（r473/vo/）。
//   ⑦ 换形态（r421 的 become）那一下原来是闪红 + 震屏：她身上也按「缓、不闪、不抖」关掉，只留慢慢交叉淡入的换形。
// 接口：window.R474JH = { on(), set(on), state(e), act(e), M }，state(e) 就是 R473.stateOf 的结果；act(e) 是她此刻身上在播的那套动作。
(function () {
  const M = window.R415_META && R415_META.bianhua_r474;
  if (!M || !window.TOWER || !window.R370_H || !window.R370_AI || typeof drawUnit !== 'function' || typeof S === 'undefined') return;
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
  const snd = (k, delay = 0) => { const go = () => { try { if (window.R474SND) R474SND.play(k); } catch (e) {} }; if (delay > 0) setTimeout(go, delay * 1000); else go(); };

  // ---------- 比例 ----------
  const K = .8;                         // 和 r421 给绛蘅登记的比例一样：屏幕上身体高 = bodyH（380）× 0.8 ≈ 304
  const FK = { f1: 1, f2: 1.1 };        // 形态二多半坐在花枝上、身子矮一截：放大一成，看上去和形态一一样高
  const CS = f => K / M.over * FK[f];   // 图集像素 → 屏幕
  const CSRC = f => M.s * CS(f);        // 原画像素 → 屏幕
  const KFX = f => 1.6 * CSRC(f);       // 特效参考画布像素 → 屏幕（anim.json suggestedScale = 1.6）
  const BODY = () => Math.round(M.bodyH * K);   // 身体在屏幕上的高（血条、飘字按这个算）
  const REF_ACTOR = [392, 952];         // 特效参考画面里施法者的脚
  const FLOWER_ROOT = [[840, 958], [1130, 958]];   // 花开：两朵花在参考画面里的根
  const XI_SRC = [1330, 560], XI_PALM = [471, 488];  // 吸梦：参考画面里气流的来处 / 她的掌心

  // ---------- 图 ----------
  const IM = {};
  const ok = im => im && im.complete && im.naturalWidth;
  function pim(name) { let im = IM[name]; if (!im) { im = IM[name] = new Image(); im.src = DIR + name + VER; } return im; }
  const pages = () => { const a = []; for (const f of ['f1', 'f2']) for (const p of M.forms[f].pages) a.push(p[0]); for (const k in M.fx) for (const p of M.fx[k].pages) a.push(p[0]); return a; };
  function loadAll() { for (const n of pages()) { const im = pim(n); try { if (im.decode) im.decode().catch(() => {}); } catch (e) {} } }
  const ready = f => M.forms[f].pages.every(p => ok(pim(p[0])));
  const fxReady = k => M.fx[k] && M.fx[k].pages.every(p => ok(pim(p[0])));

  const isJH = u => !!(ON && u && u.side === 'enemy' && u._tw && u._tw.n === 1);
  const formOf = u => (u._ph2 ? 'f2' : 'f1');
  function state(u) {   // 和名牌头像同一个判断（R473）
    try { if (window.R473 && R473.stateOf) return R473.stateOf(u); } catch (e) {}
    return !u.alive || u.hp <= 0 || u._defeat ? 'defeat' : u._break > 0 ? 'hurt' : u._charge ? 'smirk' : u._ph2 ? 'angry' : 'normal'; }
  const BASE = { defeat: 'defeat', hurt: 'tired', smirk: 'charge', angry: 'idle', normal: 'idle' };

  // ---------- 这一刻播哪一帧 ----------
  // u._j = { cur:{form,act,f}, prev:{…, t}, one:{act,form,t0,dur,fps,rev}, cT0, dT0, lastHurt }
  function J(u) { return u._j || (u._j = { lastHurt: 0 }); }
  function play(u, act, o = {}) {   // 一次性动作（出招 / 挨打），放完回到常态
    const j = J(u), form = formOf(u), A = M.forms[form].acts[act]; if (!A) return 0;
    const fps = o.fps || A.fps, dur = A.n / fps;
    j.one = { act, form, t0: o.t0 != null ? o.t0 : nowS(), dur: o.pingpong ? dur * 2 : dur, fps, rev: !!o.rev, pingpong: !!o.pingpong };
    return dur; }
  function pick(u, now) {
    const j = J(u), form = formOf(u), A = M.forms[form].acts;
    const base = BASE[state(u)] || 'idle';
    if (j.one && (j.one.form !== form || now - j.one.t0 >= j.one.dur || base === 'defeat')) j.one = null;
    if (base !== 'charge') j.cT0 = null; if (base !== 'defeat') j.dT0 = null;
    let act, f;
    if (base === 'defeat') {
      act = A.defeat ? 'defeat' : 'tired'; if (j.dT0 == null) j.dT0 = now; const a = A[act];
      f = Math.min(a.n - 1, Math.floor((now - j.dT0) * a.fps));
    } else if (j.one && now >= j.one.t0) {
      act = j.one.act; const a = A[act]; let k = Math.floor((now - j.one.t0) * j.one.fps);
      if (j.one.pingpong) k = k < a.n ? k : Math.max(0, 2 * a.n - 1 - k);
      k = Math.max(0, Math.min(a.n - 1, k)); f = j.one.rev ? a.n - 1 - k : k;
    } else if (base === 'charge') {
      act = 'charge'; if (j.cT0 == null) j.cT0 = now; const a = A.charge; let k = Math.floor((now - j.cT0) * a.fps);
      if (k >= a.n) { const L = 7, h = Math.floor((now - j.cT0 - a.n / a.fps) * 6) % (2 * L - 2); k = a.n - 1 - (h < L ? h : 2 * L - 2 - h); }   // 憋着那口气：最后七帧慢慢来回
      f = k;
    } else {
      act = base === 'tired' ? 'tired' : 'idle'; const a = A[act];
      f = Math.floor((now + (u.x % 3)) * a.fps) % a.n;
    }
    const cur = { form, act, f };
    if (j.cur && (j.cur.act !== act || j.cur.form !== form)) j.prev = Object.assign({}, j.cur, { t: now, long: j.cur.form !== form });
    j.cur = cur; return cur; }

  // ---------- 画本体 ----------
  function blit(g, fr, pgs, sc, x, y) { if (!fr) return false; const im = pim(pgs[fr[0]][0]); if (!ok(im)) return false;
    g.drawImage(im, fr[1], fr[2], fr[3], fr[4], x + fr[5] * sc, y + fr[6] * sc, fr[3] * sc, fr[4] * sc); return true; }
  const SIL = document.createElement('canvas'), sg = SIL.getContext('2d');
  { let mw = 1, mh = 1; for (const f of ['f1', 'f2']) for (const a of Object.values(M.forms[f].acts)) for (const r of a.fr) if (r) { mw = Math.max(mw, Math.ceil(r[3] / 3)); mh = Math.max(mh, Math.ceil(r[4] / 3)); } SIL.width = mw; SIL.height = mh; }
  function glow(fr, pgs, sc, x, y, power, now) {   // 身上一圈柔光（R377 给序列帧首领的那种描边光，这里按真画的这一帧抠）
    if (!fr) return; const im = pim(pgs[fr[0]][0]); if (!ok(im)) return;
    const w = Math.max(1, Math.ceil(fr[3] / 3)), h = Math.max(1, Math.ceil(fr[4] / 3));
    sg.clearRect(0, 0, w + 2, h + 2);
    sg.globalCompositeOperation = 'source-over'; sg.drawImage(im, fr[1], fr[2], fr[3], fr[4], 0, 0, w, h);
    sg.globalCompositeOperation = 'source-in'; sg.fillStyle = 'rgb(255,108,128)'; sg.fillRect(0, 0, w, h); sg.globalCompositeOperation = 'source-over';
    const r = 4 + power * 3, a = (.1 + power * .18) * (.85 + .15 * Math.sin(now * 2.2));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a;
    for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; ctx.drawImage(SIL, 0, 0, w, h, x + fr[5] * sc + Math.cos(an) * r, y + fr[6] * sc + Math.sin(an) * r, fr[3] * sc, fr[4] * sc); }
    ctx.restore(); }
  function frameOf(c) { const F = M.forms[c.form]; return [F.acts[c.act] && F.acts[c.act].fr[c.f], F.pages, CS(c.form)]; }
  function drawBody(u, now) {
    const j = J(u), cur = j.cur; if (!cur) return;
    const x = u.x + (u.ox || 0), y = u.y + (u.oy || 0);
    const [fr, pgs, sc] = frameOf(cur);
    const st = state(u), power = st === 'smirk' ? 1 : st === 'hurt' ? .15 : st === 'defeat' ? 0 : .55;
    let fadeAll = 1; if (st === 'defeat' && j.dT0 != null) { const A = M.forms[cur.form].acts.defeat; fadeAll = A ? 1 : clamp01(1 - (now - j.dT0) / 1.4); }
    ctx.save(); ctx.globalAlpha *= fadeAll;
    if (power > .01 && u.alive) glow(fr, pgs, sc, x, y, power, now);
    const p = j.prev, D = p && p.long ? .7 : .18, k = p ? (now - p.t) / D : 1;
    if (p && k < 1) { const [pf, pp, ps] = frameOf(p); ctx.save(); ctx.globalAlpha *= 1 - sm(k); blit(ctx, pf, pp, ps, x, y); ctx.restore(); } else j.prev = null;
    if (p && k < 1 && p.long) { ctx.globalAlpha *= sm(k); }   // 换形态：新的慢慢显出来
    blit(ctx, fr, pgs, sc, x, y);
    ctx.restore(); }

  // ---------- 接进引擎的 drawUnit：影子、血条、名字、R377 的光轮照旧，本体换成真画帧 ----------
  const JKEY = 'jh474_body'; let CUR = null;
  drawUnit = (orig => function (u) {
    if (!isJH(u) || !ready(formOf(u))) return orig.apply(this, arguments);
    const now = nowS(), j = J(u);
    if (u.hurt > .85 && u.alive && now - j.lastHurt > .35 && !(j.one && j.one.act !== 'hurt' && now < j.one.t0 + j.one.dur) && state(u) !== 'defeat') { j.lastHurt = now; play(u, 'hurt', { pingpong: true, fps: 16 }); }
    pick(u, now);
    const k0 = u.key, vk0 = u._vk, hu = u.hurt, h0 = u.h;
    u.key = JKEY; u._vk = undefined; u.hurt = 0; u.h = BODY() + 8; CUR = { u, now, done: false };
    try { orig.apply(this, arguments); }
    finally { const c = CUR; CUR = null; u.key = k0; u._vk = vk0; u.hurt = hu; u.h = h0; if (!c || !c.done) { try { drawBody(u, now); } catch (e) {} } } })(drawUnit);
  drawSprite = (orig => function (key) { if (key === JKEY) { if (CUR && !CUR.done) { CUR.done = true; try { drawBody(CUR.u, CUR.now); } catch (e) {} } return; } return orig.apply(this, arguments); })(drawSprite);

  // ---------- 她放招时：老特效、震屏、闪白都关掉 ----------
  let MUTE = 0;
  const MUTED = new Set(['fx_tw_rumeng', 'fx_tw_huazang', 'fx3_burst_red', 'fx3_slash_gold', 'fx3_orb_violet', 'fx_tw_none']);
  if (typeof fx === 'function') fx = (o => function (name) { if (MUTE > 0 && MUTED.has(name)) return addFx({ life: 0, layer: 1, draw() {} }); return o.apply(this, arguments); })(fx);
  if (typeof particleBurst === 'function') particleBurst = (o => function () { if (MUTE > 0) return; return o.apply(this, arguments); })(particleBurst);
  try { for (const k of ['shake', 'flash']) { let v = S[k] || 0; Object.defineProperty(S, k, { configurable: true, enumerable: true, get() { return v; }, set(x) { if (MUTE > 0 && x > v) return; v = x; } }); } } catch (e) {}
  async function muted(fn) { MUTE++; try { return await fn(); } finally { MUTE--; } }
  // 远程出手：引擎的 strike 会冲到目标面前——她不冲，原地等到命中帧
  if (typeof dashTo === 'function') dashTo = (o => async function (u) { if (u && u._jHold) { const w = u._jHold - nowS(); if (w > 0) await sleep(w * 1000); return; } return o.apply(this, arguments); })(dashTo);
  if (typeof dashBack === 'function') dashBack = (o => async function (u) { if (u && u._jHold) return; return o.apply(this, arguments); })(dashBack);

  // ---------- 特效 ----------
  // 一个变换 T = { ax, ay, px, py, k, rot }：参考画面里的点 p → 屏幕 (ax, ay) + R(rot)·(p − (px, py))·k
  const mapPt = (T, p) => { const dx = (p[0] - T.px) * T.k, dy = (p[1] - T.py) * T.k, c = Math.cos(T.rot || 0), s = Math.sin(T.rot || 0); return [T.ax + dx * c - dy * s, T.ay + dx * s + dy * c]; };
  const mix = (A, B, k) => ({ ax: lerp(A.ax, B.ax, k), ay: lerp(A.ay, B.ay, k), px: A.px, py: A.py, k: lerp(A.k, B.k, k), rot: lerp(A.rot || 0, B.rot || 0, k) });
  const rebase = (T, p) => { const q = mapPt(T, p); return { ax: q[0], ay: q[1], px: p[0], py: p[1], k: T.k, rot: T.rot || 0 }; };
  function fxBlit(key, i, T, a) {
    const X = M.fx[key], fr = X.fr[i]; if (!fr || a <= .003) return; const im = pim(X.pages[fr[0]][0]); if (!ok(im)) return;
    ctx.save(); ctx.globalAlpha *= Math.min(1, a); ctx.translate(T.ax, T.ay); if (T.rot) ctx.rotate(T.rot); ctx.scale(T.k / X.s, T.k / X.s); ctx.translate(-T.px * X.s, -T.py * X.s);
    ctx.drawImage(im, fr[1], fr[2], fr[3], fr[4], fr[5], fr[6], fr[3], fr[4]); ctx.restore(); }
  // 跑一段特效：draw(i, tf, t) 每帧调用（i = 第几帧，从 0 起；tf = 帧内小数；t = 秒）
  function runFx(key, t0, dur, draw, layer = 1) {
    const X = M.fx[key]; return addFx({ life: dur + Math.max(0, t0 - nowS()) + .05, layer, draw() { const t = nowS() - t0; if (t < 0 || t > dur) return; const q = t * X.fps, i = Math.min(X.n - 1, Math.floor(q)); try { draw(i, q - Math.floor(q), t); } catch (e) {} } }); }
  const foot = e => [e.x + (e.ox || 0), e.y + (e.oy || 0)];
  const caster = e => { const [x, y] = foot(e); return { ax: x, ay: y, px: REF_ACTOR[0], py: REF_ACTOR[1], k: KFX(formOf(e)), rot: 0 }; };
  const chest = P => [P.x + (P.ox || 0), P.y + (P.oy || 0) - (P.h || 240) * .58];
  const VIEW = (dx = 0) => ({ ax: 0 + dx, ay: 0, px: 0, py: 150, k: W / 1600, rot: 0 });   // 参考视口 (0,150,1600,900) → 整个屏幕
  const tail = (t, dur, d = .35) => clamp01((dur - t) / d);

  // 花刃 / 刀瓣：飞瓣从她手里出去，一路滑向目标（帧内也连续走，不一跳一跳），在胸口炸开
  function fxHuaren(e, P, t0, o = {}) {
    const X = M.fx.huaren, C = caster(e), tips = X.projectileTipByFrame, rel = X.releaseFrame, imp = X.impactFrame;
    const IP = X.impactAnchor.point, R0 = mapPt(C, tips[rel]), I = chest(P);
    const ref0 = tips[rel], refLen = Math.hypot(IP[0] - ref0[0], IP[1] - ref0[1]);
    const rot = Math.atan2(I[1] - R0[1], I[0] - R0[0]) - Math.atan2(IP[1] - ref0[1], IP[0] - ref0[0]);
    const uOf = n => { const p = n >= imp ? IP : tips[n]; return Math.hypot(p[0] - ref0[0], p[1] - ref0[1]) / refLen; };
    const first = o.skipWind ? rel - 1 : 0, dur = X.n / X.fps;
    const TI = { ax: I[0], ay: I[1], px: IP[0], py: IP[1], k: KFX(formOf(e)) * (o.k || 1), rot: 0 };
    return runFx('huaren', t0, dur, (i, tf, t) => {
      const n = i + 1; if (n - 1 < first) return;
      if (n < rel) { fxBlit('huaren', i, C, 1); return; }
      if (n < imp) { const u = lerp(uOf(n), uOf(n + 1), tf), tip = tips[n], q = [lerp(R0[0], I[0], u), lerp(R0[1], I[1], u)];
        fxBlit('huaren', i, { ax: q[0], ay: q[1], px: tip[0], py: tip[1], k: C.k, rot }, 1); return; }
      fxBlit('huaren', i, TI, tail(t, dur, .3)); }); }

  // 入梦：开头几帧是她身前升起的梦丝（跟着她），之后整张网从天上垂下来、罩住我方（跟着屏幕，网的右缘贴屏幕右边）
  function fxRumeng(e, b, t0) {
    const C = caster(e), hs = H.heroes(b), hx = hs.length ? hs.reduce((s, P) => s + P.x, 0) / hs.length : 1060;
    const V0 = VIEW(Math.max(0, hx - 1320 * W / 1600)), Cb = rebase(C, REF_ACTOR), Vb = rebase(V0, REF_ACTOR), X = M.fx.rumeng, dur = X.n / X.fps;
    return runFx('rumeng', t0, dur, (i, tf, t) => { const q = (i + tf) / 1; const k = sm((q - 2.5) / 3); fxBlit('rumeng', i, k <= 0 ? Cb : k >= 1 ? Vb : mix(Cb, Vb, k), tail(t, dur)); }); }

  // 花葬：花在她胸前旋起来，然后整片花海铺满全场（顶峰的几帧压到 0.93，不把人整个吞掉），最后化成落花散掉
  function fxHuazang(e, t0) {
    const C = caster(e), Cb = rebase(C, REF_ACTOR), Vb = rebase(VIEW(0), REF_ACTOR), X = M.fx.huazang, dur = X.n / X.fps;
    return runFx('huazang', t0, dur, (i, tf, t) => { const q = i + tf, k = sm((q - 3) / 3); fxBlit('huazang', i, k <= 0 ? Cb : k >= 1 ? Vb : mix(Cb, Vb, k), .93 * tail(t, dur, .5)); }); }

  // 花开：两朵花在她身前的两个召唤位破土、开花；花魇从花里出来（花开到头，花慢慢淡掉、花魇慢慢显出来）
  const SLOT_Y = 676, SLOT_X = [480, 614];
  const bloomT = () => { const [a, b2] = FLOWER_ROOT; return { ax: SLOT_X[0], ay: SLOT_Y, px: a[0], py: a[1], k: (SLOT_X[1] - SLOT_X[0]) / (b2[0] - a[0]), rot: 0 }; };
  const BLOOM_HOLD = .45;
  function fxHuakai(t0) { const X = M.fx.huakai, T = bloomT(), dur = X.n / X.fps + BLOOM_HOLD;
    return runFx('huakai', t0, dur, (i, tf, t) => fxBlit('huakai', i, T, tail(t, dur, .6))); }

  // 吸梦：每只活着的花魇身上飘出一缕梦，缓缓流进她举起的掌心
  function fxXimeng(e, flowers, t0) {
    const X = M.fx.ximeng, dur = X.n / X.fps, palm = mapPt(caster(e), XI_PALM), refLen = Math.hypot(XI_SRC[0] - XI_PALM[0], XI_SRC[1] - XI_PALM[1]), refAng = Math.atan2(XI_SRC[1] - XI_PALM[1], XI_SRC[0] - XI_PALM[0]);
    for (const F of flowers) { const s = [F.x, F.y - (F.h || 220) * .55], L = Math.hypot(s[0] - palm[0], s[1] - palm[1]);
      const T = { ax: palm[0], ay: palm[1], px: XI_PALM[0], py: XI_PALM[1], k: Math.max(.2, L / refLen), rot: Math.atan2(s[1] - palm[1], s[0] - palm[0]) - refAng };
      runFx('ximeng', t0, dur, (i, tf, t) => fxBlit('ximeng', i, T, .95 * tail(t, dur))); } }

  // ---------- 出招 ----------
  const HIT = (form, act) => { const A = M.forms[form].acts[act]; return ((A.hit || A.n) - 1) / A.fps; };
  const busyUntil = e => { const j = J(e); return Math.max(j.one ? j.one.t0 + j.one.dur : 0, e._jWait || 0); };
  async function settle(e, cap = 2.2) { const w = Math.min(cap, busyUntil(e) - nowS() - .2); if (w > 0) await sleep(w * 1000); }
  const can = e => isJH(e) && ready(formOf(e));

  if (H.charge) H.charge = (o => async function (e) { if (!can(e)) return o.apply(this, arguments); return muted(() => o.apply(this, arguments)); })(H.charge);

  if (H.strike) H.strike = (o => async function (e, b, P, name, mult, fxName) {
    if (!can(e) || !P) return o.apply(this, arguments);
    const form = formOf(e), t0 = nowS(), a = [...arguments]; a[5] = 'fx_tw_none'; let hitT;
    if (form === 'f1') { play(e, 'atk_huaren'); hitT = HIT('f1', 'atk_huaren'); if (fxReady('huaren')) fxHuaren(e, P, t0); snd('jh_huaren_cast'); snd('jh_huaren_hit', hitT); }
    else {   // 刀瓣：吸梦那套帧倒着放——手从胸前甩出去；飞瓣在手甩开时出手
      const A = M.forms.f2.acts.atk_ximeng, fps = 18, X = M.fx.huaren; play(e, 'atk_ximeng', { rev: true, fps });
      const rel = t0 + (A.n - 6) / fps; hitT = rel - t0 + (X.impactFrame - X.releaseFrame) / X.fps;
      if (fxReady('huaren')) fxHuaren(e, P, rel - (X.releaseFrame - 1) / X.fps, { skipWind: true, k: .85 }); snd('jh_daoban_cast'); snd('jh_daoban_hit', hitT); }
    e._jHold = t0 + hitT;
    try { return await muted(() => o.apply(this, a)); }
    finally { e._jHold = 0; await settle(e, 1.2); } })(H.strike);

  if (H.aoe) H.aoe = (o => async function (e, b, name, fxName) {
    if (!can(e) || (name !== '入梦' && name !== '花葬')) return o.apply(this, arguments);
    const act = name === '入梦' ? 'atk_rumeng' : 'atk_huazang', form = formOf(e), t0 = nowS(), a = [...arguments]; a[3] = 'fx_tw_none';
    play(e, act); { const mk = name === '入梦' ? 'rumeng' : 'huazang'; snd('jh_' + mk + '_cast'); snd('jh_' + mk + '_hit', HIT(form, act)); }
    if (name === '入梦' && fxReady('rumeng')) fxRumeng(e, b, t0); if (name === '花葬' && fxReady('huazang')) fxHuazang(e, t0);
    // 引擎的 aoe 从调用到落伤害约 0.75 秒（喊招名、压暗）：提前起手，让伤害正好落在命中帧
    return muted(async () => { await sleep(Math.max(0, HIT(form, act) - .75) * 1000); return o.apply(this, a); }); })(H.aoe);

  // 花开：r421 先喊「花开」再半秒后召唤——喊招名的那一刻起手，召出来的花魇先藏着，等花开到头再显出来
  let BLOOM = null;
  if (H.big) H.big = (o => function (t) { try { const b = typeof battle !== 'undefined' && battle; if (t === '花开' && b) { const e = (b.enemies || []).find(u => u.alive && isJH(u) && u._ph2); if (e && ready('f2')) { const t0 = nowS(); play(e, 'atk_huakai'); if (fxReady('huakai')) fxHuakai(t0); BLOOM = { e, t0 }; snd('jh_huakai_cast'); snd('jh_huakai_hit', HIT('f2', 'atk_huakai')); } } } catch (er) {} return o.apply(this, arguments); })(H.big);
  if (H.summon) H.summon = (o => function (b, e) {
    if (!can(e)) return o.apply(this, arguments);
    const n0 = b.enemies.length; let r;
    MUTE++; try { r = o.apply(this, arguments); } finally { MUTE--; }
    try { const t0 = BLOOM && BLOOM.e === e && nowS() - BLOOM.t0 < 2 ? BLOOM.t0 : nowS(), X = M.fx.huakai, show = t0 + X.n / X.fps - .15;
      if (!BLOOM || BLOOM.e !== e) { play(e, 'atk_huakai'); if (fxReady('huakai')) fxHuakai(t0); }
      for (const u of b.enemies.slice(n0)) { u._jShow = show; } e._jWait = show + .55; BLOOM = null; } catch (er) {}
    return r; })(H.summon);
  // 花魇：花开到头之前不画，之后 0.5 秒慢慢显出来
  drawUnit = (orig => function (u) { const s = u && u._jShow; if (!s) return orig.apply(this, arguments); const k = (nowS() - s) / .5; if (k < 0) return; if (k >= 1) { u._jShow = 0; return orig.apply(this, arguments); }
    ctx.save(); ctx.globalAlpha *= sm(k); try { return orig.apply(this, arguments); } finally { ctx.restore(); } })(drawUnit);

  // 吸梦 + 每一手收尾：r421 的打法照旧，只在前后补动作
  const AI = R370_AI;
  if (AI.tw_bianhua) AI.tw_bianhua = (o => async function (e, b) {
    if (!can(e)) return o.apply(this, arguments);
    try { if (e._ph2 && !e._turnNow && !e._burnt) { const fl = H.addsAlive(b, e), cap = Math.round(e.maxhp * .5);   // 和 r421 回血的条件一样
        if (fl.length && e.hp < cap) { const t0 = nowS(); play(e, 'atk_ximeng'); if (fxReady('ximeng')) fxXimeng(e, fl, t0); snd('jh_ximeng_cast'); snd('jh_ximeng_hit', HIT('f2', 'atk_ximeng')); await sleep(HIT('f2', 'atk_ximeng') * 1000); } } } catch (er) {}
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
  function set(on) { ON = !!on; LSS(LSK, ON ? '1' : '0'); if (ON) loadAll(); mark(); try { toast('绛蘅战斗：' + (ON ? '新（R472 真画帧 + 手绘特效）' : '旧（R460）'), 2000); } catch (e) {} }
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r474]')) return;
      const h = document.createElement('h4'); h.textContent = '11-28 新加 · 绛蘅战斗（万妖塔一层首领，记在本机）'; h.setAttribute('data-r474', '1');
      row = document.createElement('div'); row.className = 'row';
      for (const [v, t] of [['1', '绛蘅战斗：新（R472 真画）'], ['0', '绛蘅战斗：旧（R460）']]) { const b = document.createElement('button'); b.textContent = t; b.dataset.v = v; b.onclick = () => set(v === '1'); row.appendChild(b); }
      const go = document.createElement('button'); go.textContent = '直接开打绛蘅'; go.onclick = () => { try { const q = document.getElementById('dbgPanel'); if (q) q.hidden = true; } catch (e) {} if (!(typeof battle !== 'undefined' && battle)) TOWER.fightBoss(1); }; row.appendChild(go);
      p.appendChild(h); p.appendChild(row); mark(); };
    // 面板每次打开都会整个重画（innerHTML），所以一直盯着它：我们这几行没了就再补上（和 r473_inner.js 一样）
    const watch = p => { add(); new MutationObserver(() => { if (!p.querySelector('[data-r474]')) add(); }).observe(p, { childList: true }); };
    if (document.getElementById('dbgPanel')) watch(document.getElementById('dbgPanel')); else { const mo = new MutationObserver(() => { const p = document.getElementById('dbgPanel'); if (p) { mo.disconnect(); watch(p); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}

  window.R474JH = { on: () => ON, set, state, act: e => (e && e._j && e._j.cur ? e._j.cur.act : null), play, M, loadAll, ready, KFX, CS };
})();
