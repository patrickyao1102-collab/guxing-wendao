// ================= R474n · 万妖塔一层内苑的梦傀（梦仆 / 梦傀 / 精英梦傀首）战斗：Codex R474 真画帧 + 三招大范围手绘特效（只进测试版）=================
// 素材：Codex「R474_内苑梦傀战斗帧与特效」——三只各 idle / charge / atk / hurt / defeat 五套动作，三招特效：梦仆「牵丝」、梦傀「入梦香」、精英梦傀首「千丝坠」。
// 图集：tools/r474n_build.py → game/r474n/*.webp；尺寸表 game/r474n_meta.js（window.R474N_META）。原画朝右 = 面朝我方，这里自己画、不镜像。
//
// 战斗里怎么画（和 r474_jhbattle.js 绛蘅那套一个路数，画法在 r474_pose.js）：
//   ① 作者 11-28 23:15：逐帧播「好卡」→ 改成「定稿图 + 动作图」：平时一张定稿站姿（idle 第 0 帧）极轻地上下浮；蓄力一张蓄力图（身上红光）；
//      出手只用「起手 → 出招」两张（POSE 表），交叉淡入 0.08～0.12 秒，出招那一下往前一冲、放大 1.06 再回位；
//      挨打不换图，整张往后一仰 + 白边亮一下；死不倒地——定稿图停住，从脚往头化成梦丝和灰色光点飘散（约 1.7 秒）。
//      没有「破绽」「喘息」「虚弱」之类的字和姿势。梦傀首血掉到一半以下：身上那圈红光更足（发怒）。
//   ② 出招：
//      · 普通一下：播 atk，同时把自己那招特效按 anim.json 的建议比例（人物的 1.6 倍，suggestedScale）落在被打的那个人身上；命中帧跳伤害。
//      · 招牌技（梦仆 / 梦傀每三手一次；梦傀首先蓄一手、下一手放）：特效整片铺开——从她手里一路撒到我方整队，比例按「她的手到我方中间」的距离放大，
//        至少不小于建议比例，打我方全体（作者喜欢「一挥就一大把撒过去」）。不震屏、不闪白。
//        牵丝：缚（行动条往后拉）；入梦香：迷（行动条往后拉得更多一点）；千丝坠：缚 + 伤害最重。
//   ③ 特效里那几处被裁出来的直边（入梦香的方块云、牵丝顶上一刀齐），build 的时候已经往里渐隐了（见 tools/r474n_build.py 文件头）。
//
// 谁用新画（接口，给 r473_inner.js / 别的地方用）：
//   · 敌人对象上写 _ny = 'meng_pu' | 'meng_kui' | 'meng_kui_shou'（startBattle 之前写在 cfg.enemies 里的对象上即可），就按这只画；
//   · 或者用 R474NY.make(kind, lvBoost) 直接捏一只（数值从 tw_mengkui 来，名字带等级），R474NY.fight([kind, …], { elite }) 直接开打；
//   · 没写 _ny 的：人在内苑（wyt_f1c）里打的仗（或 cfg.ny 为真），里面的梦傀（key = e_tw_mengkui）自动换成新画——
//     名字里有「梦傀首」→ 精英梦傀首；有「梦仆」→ 梦仆；其余梦傀一只梦仆一只梦傀轮着来（地图上的明雷也是书生、宫侍两种）。
//     所以 r473_inner.js 的精英战（lead 名「精英·梦傀首」+ 两只 tw_mengkui）不用改就是「梦傀首 + 梦仆 + 梦傀」。
//   · 地图明雷 → 战斗：引擎的 mobFight(a) 这里包了一层，碰到的那只（a._mgs：'m' 书生 / 'f' 宫侍）决定第一只梦傀画成梦仆还是梦傀；
//     自己开打的话用 R474NY.fromMapMob(a) 拿到 kind。注意：引擎按地图的 mobs.types 随机挑怪，内苑要是挑出花魇，那只还是花魇。
// 配音 / 音效挂钩：R474SND（见下）。每招「起手」「命中」各一个键：ny_qiansi_cast / ny_qiansi_hit、ny_rumengxiang_*、ny_qiansizhui_*，
//   挨打 / 倒下：ny_<kind>_hurt / ny_<kind>_defeat。R474SND.map[键] = 'r474/sfx/xxx.mp3'（或引擎 playSnd 的键名）就会放；没登记的不发请求、不报错。
// 测试面板：「内苑梦傀战斗：新 / 旧」切换（记在本机 gx_r474_ny）+ 直接开打梦仆 / 梦傀 / 梦傀首。
(function () {
  // ---------- 技能音效挂钩（绛蘅那边 r474_jhbattle.js 也用这一个）----------
  const SND = window.R474SND = window.R474SND || { map: {}, last: [],
    play(key) { try { this.last.push(key); if (this.last.length > 40) this.last.shift(); const v = this.map[key]; if (!v) return;
        if (typeof AUD !== 'undefined' && (AUD.muted || !AUD.mode)) return;
        if (/\.(mp3|ogg|m4a|wav)$/i.test(v)) { const a = new Audio(v); a.volume = .9; a.play().catch(() => {}); } else if (typeof playSnd === 'function') playSnd(v); } catch (e) {} } };

  const M = window.R474N_META, PO = window.R474POSE;
  if (!M || !PO || typeof drawUnit !== 'function' || typeof S === 'undefined' || !window.R370_H) return;
  const LSK = 'gx_r474_ny';
  const LSG = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const LSS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let ON = LSG(LSK, '1') !== '0';
  const DIR = 'r474n/', VER = '?v=1';
  const H = R370_H;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), clamp01 = v => clamp(v, 0, 1);
  const sm = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const nowS = () => performance.now() / 1000;

  const KINDS = ['meng_pu', 'meng_kui', 'meng_kui_shou'];
  const CN = { meng_pu: '梦仆', meng_kui: '梦傀', meng_kui_shou: '梦傀首' };
  const FXOF = { meng_pu: 'qiansi', meng_kui: 'rumengxiang', meng_kui_shou: 'qiansizhui' };
  const SKILL = {   // 招牌技：名字、倍率、附带效果、名字颜色
    meng_pu: { name: '牵丝', mult: .72, color: '#ff8a9a', eff: 'bind' },
    meng_kui: { name: '入梦香', mult: .66, color: '#ffb0d0', eff: 'mist' },
    meng_kui_shou: { name: '千丝坠', mult: 1.05, color: '#ff5a6a', eff: 'bind' } };
  // 特效里「打中的地方」（参考画面坐标，1600×1200 画布、参考视口 0,150,1600,900），对到我方身上哪一处
  const PT = { qiansi: [[1190, 600], 'chest'], rumengxiang: [[1150, 610], 'chest'], qiansizhui: [[1150, 945], 'feet'] };
  // 出手那一帧她手的位置（原画像素），招牌技的特效从这里撒出去
  const HAND = { meng_pu: [1236, 400], meng_kui: [1392, 420], meng_kui_shou: [1245, 330] };
  // 名牌 / 行动条小头像用的头部中心（原画像素）
  const HEAD = { meng_pu: [772, 270], meng_kui: [745, 318], meng_kui_shou: [751, 215] };
  const REF_ACTOR = [392, 952];
  const AX = 760, AY = 1080;   // 人物画布的锚点（脚底）

  // ---------- 比例 ----------
  const CS = () => 1 / M.over;                       // 图集像素 → 屏幕
  const CSRC = k => M.forms[k].s / M.over;           // 原画像素 → 屏幕
  const KFX = k => 1.6 * CSRC(k);                    // 特效参考像素 → 屏幕（anim.json suggestedScale 1.6：特效比人物画布大 1.6 倍）
  const BODY = k => M.forms[k].bodyH;

  // ---------- 图 ----------
  const IM = {};
  const ok = im => im && im.complete && im.naturalWidth;
  function pim(name) { let im = IM[name]; if (!im) { im = IM[name] = new Image(); im.src = DIR + name + VER; } return im; }
  const pagesOf = k => M.forms[k].pages.map(p => p[0]).concat(M.fx[FXOF[k]].pages.map(p => p[0]));
  function load(k) { for (const n of pagesOf(k)) { const im = pim(n); try { if (im.decode) im.decode().catch(() => {}); } catch (e) {} } }
  const ready = k => pagesOf(k).every(n => ok(pim(n)));
  const fxReady = key => M.fx[key].pages.every(p => ok(pim(p[0])));

  const kindOf = u => (ON && u && u.side === 'enemy' && KINDS.includes(u._ny) ? u._ny : null);
  const isNY = u => !!kindOf(u);

  // ---------- 定稿图 / 动作图（挑帧：报告里有拼图 /tmp/claude-0/n4/pose/挑帧.jpg）----------
  const POSE = {
    meng_pu: { still: ['idle', 0], charge: ['charge', 12], wind: ['atk', 8], strike: ['atk', 13] },          // 书生：垂手而立 / 抬腕牵丝 / 袖举过头 → 广袖平甩
    meng_kui: { still: ['idle', 0], charge: ['charge', 13], wind: ['atk', 7], strike: ['atk', 14] },         // 宫侍：侧身含笑 / 拈袖 / 广袖掩身 → 长袖横扫
    meng_kui_shou: { still: ['idle', 0], charge: ['charge', 13], wind: ['atk', 8], strike: ['atk', 12] } };  // 梦傀首：张臂立定 / 双手举过头顶 / 双臂上扬 → 弓步一手前探
  const KEY = a => a[0] + '|' + a[1];
  const dead = u => !u.alive || u.hp <= 0;
  function J(u) { return u._nj || (u._nj = { lastHurt: -9 }); }
  const baseKey = u => KEY(u._charge || J(u).chg > nowS() ? POSE[u._ny].charge : POSE[u._ny].still);
  // 放一招：t0 起手、ts 出招那一下、te 收招
  function move(e, t0, ts, te) { const P = POSE[e._ny]; PO.act(e, { t0, ts, te, L: 22, S: .06, steps: [[t0, KEY(P.wind), .12], [ts - .05, KEY(P.strike), .08]] }); }

  // ---------- 画本体 ----------
  const SRC = {};
  function srcOf(k) { const C = SRC[k] || (SRC[k] = new Map()); return key => { let o = C.get(key); if (o === undefined) { const [a, i] = key.split('|'), A = M.forms[k].acts[a], fr = A && A.fr[+i]; o = fr ? { im: pim(M.forms[k].pages[fr[0]][0]), fr, sc: CS() } : null; C.set(key, o); } return o; }; }
  function drawBody(u, now) {
    const k = u._ny, x = u.x + (u.ox || 0), y = u.y + (u.oy || 0), chg = u._charge || J(u).chg > now;
    const rage = k === 'meng_kui_shou' && u.hp < u.maxhp * .5;   // 梦傀首血掉一半：发怒，光更足
    const power = chg ? .85 + .15 * Math.sin(now * 3) : rage ? .65 : k === 'meng_kui_shou' ? .3 : 0;
    PO.draw(u, now, srcOf(k), x, y, { glow: [255, 70, 96], power, float: 2 }); }

  // ---------- 接进 drawUnit：影子、血条、名字照旧，本体换成真画帧 ----------
  const NKEY = 'ny474_body'; let CUR = null;
  drawUnit = (orig => function (u) {
    if (!isNY(u) || !ready(u._ny)) return orig.apply(this, arguments);
    const now = nowS(), j = J(u);
    if (dead(u)) {   // 死：定稿图停住，从脚往头化成梦丝和灰色光点飘散；散完连影子都不画
      if (!j.deadSnd) { j.deadSnd = 1; SND.play('ny_' + u._ny + '_defeat'); }
      if (j.gone) return; const D = u._ps && u._ps.diss;
      if (!D || now - D.t0 < PO.DUR * .5) { const k0 = u.key, vk0 = u._vk; u.key = NKEY; u._vk = undefined; CUR = { done: true }; try { orig.apply(this, arguments); } catch (e) {} finally { u.key = k0; u._vk = vk0; CUR = null; } }   // 只要影子：老梦傀的倒下别画出来
      if (!PO.dissolve(u, now, srcOf(u._ny), KEY(POSE[u._ny].still), u.x + (u.ox || 0), u.y + (u.oy || 0), 'dream')) j.gone = 1;
      return; }
    if (u.hurt > .85 && now - j.lastHurt > .35) { j.lastHurt = now; PO.hit(u, now); SND.play('ny_' + u._ny + '_hurt'); }
    PO.pick(u, now, baseKey(u));
    const k0 = u.key, vk0 = u._vk, hu = u.hurt, h0 = u.h;
    u.key = NKEY; u._vk = undefined; u.hurt = 0; u.h = BODY(u._ny) + 6; CUR = { u, now, done: false };
    try { orig.apply(this, arguments); }
    finally { const c = CUR; CUR = null; u.key = k0; u._vk = vk0; u.hurt = hu; u.h = h0; if (!c || !c.done) { try { drawBody(u, now); } catch (e) {} } } })(drawUnit);
  drawSprite = (orig => function (key) { if (key === NKEY) { if (CUR && !CUR.done) { CUR.done = true; try { drawBody(CUR.u, CUR.now); } catch (e) {} } return; } return orig.apply(this, arguments); })(drawSprite);

  // 行动条上的小头像：按新画的头裁一张（老图集里只有宫侍梦傀一张脸）
  const ICON = {};
  function icon(k) { if (ICON[k]) return ICON[k]; if (!ready(k)) return null;
    const fr = M.forms[k].acts.idle.fr[0], im = pim(M.forms[k].pages[fr[0]][0]), s = M.forms[k].s, c = document.createElement('canvas'); c.width = 200; c.height = 400;
    const g = c.getContext('2d'), z = 100 / (150 * s);   // 头部约 150 原画像素宽 → 小图里 100 宽
    const [hx, hy] = HEAD[k], ox = 100 - (hx - AX) * s * z, oy = 60 - (hy - AY) * s * z;
    g.drawImage(im, fr[1], fr[2], fr[3], fr[4], ox + fr[5] * z, oy + fr[6] * z, fr[3] * z, fr[4] * z);
    return (ICON[k] = c); }
  if (typeof drawBattleHud === 'function') drawBattleHud = (orig => function () {
    const b = typeof battle !== 'undefined' && battle, sw = [];
    try { if (b && typeof IMG === 'object') for (const u of b.units || []) { const k = kindOf(u), c = k && icon(k); if (c) { const key = 'ny474_icon_' + k; if (!IMG[key]) IMG[key] = c; sw.push([u, u.key]); u.key = key; } } } catch (e) {}
    try { return orig.apply(this, arguments); } finally { for (const [u, k0] of sw) u.key = k0; } })(drawBattleHud);

  // ---------- 特效 ----------
  // T = { ax, ay, px, py, k }：参考画面里的点 (px, py) 落在屏幕 (ax, ay)，放大 k 倍
  function fxBlit(key, i, T, a) {
    const X = M.fx[key], fr = X.fr[i]; if (!fr || a <= .003) return; const im = pim(X.pages[fr[0]][0]); if (!ok(im)) return;
    ctx.save(); ctx.globalAlpha *= Math.min(1, a); ctx.translate(T.ax, T.ay); ctx.scale(T.k / X.s, T.k / X.s); ctx.translate(-T.px * X.s, -T.py * X.s);
    ctx.drawImage(im, fr[1], fr[2], fr[3], fr[4], fr[5], fr[6], fr[3], fr[4]); ctx.restore(); }
  function runFx(key, t0, T, alpha = 1) {
    const X = M.fx[key], dur = X.n / X.fps;
    return addFx({ life: dur + Math.max(0, t0 - nowS()) + .05, layer: 1, draw() { const t = nowS() - t0; if (t < 0 || t > dur) return; const i = Math.min(X.n - 1, Math.floor(t * X.fps));
      try { fxBlit(key, i, T, alpha * clamp01((dur - t) / .35)); } catch (e) {} } }); }
  const spot = (P, w) => [P.x + (P.ox || 0), w === 'feet' ? P.y + (P.oy || 0) : P.y + (P.oy || 0) - (P.h || 240) * .55];
  const handOf = e => { const k = e._ny, [hx, hy] = HAND[k], s = CSRC(k); return [e.x + (hx - AX) * s, e.y + (hy - AY) * s]; };
  const refHand = k => { const [hx, hy] = HAND[k]; return [REF_ACTOR[0] + (hx - AX) / 1.6, REF_ACTOR[1] + (hy - AY) / 1.6]; };   // 参考画面里人物是特效画布的 1/1.6
  // 普通一下：特效按建议比例落在那个人身上
  function fxOne(e, P, t0) { const key = FXOF[e._ny], [pt, w] = PT[key], q = spot(P, w);
    return runFx(key, t0, { ax: q[0], ay: q[1], px: pt[0], py: pt[1], k: KFX(e._ny) }, .95); }
  // 招牌技：整片铺开——从她手里一路撒到我方整队
  function fxWide(e, hs, t0) { const k = e._ny, key = FXOF[k], [pt, w] = PT[key];
    const pts = hs.map(P => spot(P, w)), c = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
    const h = handOf(e), rh = refHand(k), kd = Math.hypot(c[0] - h[0], c[1] - h[1]) / Math.hypot(pt[0] - rh[0], pt[1] - rh[1]);
    const kk = clamp(kd, KFX(k) * 1.2, 1.05);
    return runFx(key, t0, { ax: c[0], ay: c[1], px: pt[0], py: pt[1], k: kk }, 1); }

  // ---------- 出招 ----------
  const heroes = b => H.heroes(b);
  const HIT = (k, act = 'atk') => { const A = M.forms[k].acts[act]; return ((A.hit || A.n) - 1) / A.fps; };
  const EFF = {
    bind: P => { P.gauge = Math.min(P.gauge, -40); floatText(P.x, P.y - P.h - 30, '缚', '#ff9aa8', 34); },
    mist: P => { P.gauge = Math.min(P.gauge, -55); floatText(P.x, P.y - P.h - 30, '迷', '#ffc0dc', 34); } };
  // 打中：会心照算，但不闪红、不震屏（和绛蘅一样「缓、不闪、不抖」——满屏特效上再闪一下太刺眼）
  function hitOne(e, P, mult) { let { d, crit } = dmgCalc(e, P, mult, .08); d = Math.round(d * H.guard(P));
    const b = battle, q0 = b && b.quietCrit, sh = S.shake; if (b) b.quietCrit = 1; try { applyDamage(P, d, crit); } finally { if (b) b.quietCrit = q0; S.shake = Math.min(S.shake, sh); } try { if (typeof playSnd === 'function') playSnd('sfx_hurt'); } catch (er) {} return d; }
  async function waitUntil(t) { const w = t - nowS(); if (w > 0) await sleep(w * 1000); }
  async function normal(e, b) {
    const hs = heroes(b); if (!hs.length) return true; const P = hs[Math.floor(Math.random() * hs.length)], k = e._ny, key = FXOF[k];
    const t0 = nowS(), hT = HIT(k), te = t0 + hT + .5; move(e, t0, t0 + hT - .08, te); SND.play('ny_' + key + '_cast');
    if (fxReady(key)) fxOne(e, P, t0);
    await waitUntil(t0 + hT); if (P.alive) { hitOne(e, P, 1); SND.play('ny_' + key + '_hit'); }
    await waitUntil(te); return true; }
  async function skill(e, b) {
    const k = e._ny, key = FXOF[k], SK = SKILL[k]; e._charge = null;
    if (k !== 'meng_kui_shou') { J(e).chg = nowS() + .85; await sleep(850); }   // 小怪：先亮一下蓄力图（身上红光）再放
    const hs = heroes(b); if (!hs.length) return true;
    try { H.big(SK.name, SK.color, 62); } catch (er) {}
    const t0 = nowS(), hT = HIT(k), te = t0 + hT + .55; move(e, t0, t0 + hT - .08, te); SND.play('ny_' + key + '_cast');
    if (fxReady(key)) fxWide(e, hs, t0);
    await waitUntil(t0 + hT);
    b._aoe = 1; try { for (const P of heroes(b)) { const d = hitOne(e, P, SK.mult); if (P.alive && d > 0) try { EFF[SK.eff](P); } catch (er) {} } } finally { b._aoe = 0; }
    SND.play('ny_' + key + '_hit');
    await waitUntil(te); return true; }
  // 每只的打法：梦仆 / 梦傀第三（或第四）手起每三手放一次招牌技；梦傀首每三手蓄一手、下一手放「千丝坠」
  async function nyAI(e, b) {
    if (!isNY(e) || !ready(e._ny)) return false;   // 没加载好（或切回旧版）：交回原来的打法
    if (e._nyN == null) e._nyN = e._ny === 'meng_kui_shou' ? 0 : -Math.floor(Math.random() * 2);   // 小怪的招牌技错开一手，别几只同一轮一起放
    e._nyN++; const n = e._nyN, tr = w => { TRACE.push(e._ny + '#' + n + ':' + w); if (TRACE.length > 60) TRACE.shift(); };
    if (e._ny === 'meng_kui_shou') {
      if (e._charge) { tr('skill'); return skill(e, b); }
      if (n % 3 === 2) { tr('charge'); e._charge = '她十指一收，满苑的梦丝都绷紧了——「千丝坠」，防御！'; SND.play('ny_qiansizhui_charge'); await sleep(1100); return true; }
      tr('normal'); return normal(e, b); }
    if (n % 3 === 0) { tr('skill'); return skill(e, b); }
    tr('normal'); return normal(e, b); }
  const TRACE = [];   // 最近几手出了什么（测试看）
  if (typeof enemyAct === 'function') enemyAct = (orig => async function (e) {
    try { if (isNY(e) && !e._nyAI) { e._nyAI = 1; const ai0 = e.ai; e.ai = async function (en, b) { const r = await nyAI(en, b); if (r) return r; return ai0 ? ai0.apply(this, arguments) : false; }; } } catch (er) {}
    return orig.apply(this, arguments); })(enemyAct);

  // ---------- 谁换新画（见文件头）----------
  const fromMapMob = a => (a && a._mgs === 'm' ? 'meng_pu' : 'meng_kui');
  const inInner = () => { try { return typeof world !== 'undefined' && world && world.mapName === 'wyt_f1c'; } catch (e) { return false; } };
  let ALT = Math.random() < .5 ? 0 : 1, HINT = null;
  // 地图上碰到明雷（引擎 mobFight(a)）：记下碰到的是书生还是宫侍，开打时第一只梦傀就画成它
  if (typeof mobFight === 'function') mobFight = (orig => function (a) { try { if (inInner() && a && a._mgs) HINT = { kind: fromMapMob(a), t: nowS() }; } catch (e) {} return orig.apply(this, arguments); })(mobFight);
  function tag(cfg) {
    const es = (cfg && cfg.enemies) || []; let any = false;
    const auto = cfg && (inInner() || cfg.ny), hint = HINT && nowS() - HINT.t < 3 ? HINT.kind : null; HINT = null;
    for (const e of es) { if (!e) continue;
      if (!e._ny && auto && e.key === 'e_tw_mengkui') e._ny = /梦傀首/.test(e.name || '') ? 'meng_kui_shou' : /梦仆/.test(e.name || '') ? 'meng_pu' : hint ? hint : (ALT++ % 2 ? 'meng_pu' : 'meng_kui');
      if (hint && e._ny) hint = null;   // 碰到的那一只按地图上的样子，其余的轮着来
      if (KINDS.includes(e._ny)) { any = true;
        if (e._ny === 'meng_pu' && /梦傀(?!首)/.test(e.name || '')) e.name = e.name.replace(/梦傀(?!首)/, '梦仆');
        e.h = BODY(e._ny); e._nyH = e.h; } }
    return any; }
  if (typeof startBattle === 'function') startBattle = (orig => function (cfg) {
    try { if (ON && tag(cfg)) for (const e of cfg.enemies) if (e && KINDS.includes(e._ny)) load(e._ny); } catch (e) {}
    return orig.apply(this, arguments); })(startBattle);
  if (typeof window.VS_BATTLE_READY === 'function') window.VS_BATTLE_READY = (o => function (b) { const r = o.apply(this, arguments);
    try { if (ON && b) { const ks = (b.enemies || []).map(kindOf).filter(Boolean); if (ks.length) return r && ks.every(ready); } } catch (e) {} return r; })(window.VS_BATTLE_READY);

  // ---------- 捏怪 / 直接开打 ----------
  function make(kind, lvB = 4) {
    const m = makeEnemy('tw_mengkui', lvB); m._ny = kind; m._wx = 'mu';
    if (kind === 'meng_pu') { m.name = '梦仆'; m.hp = m.maxhp = Math.round(m.maxhp * .9); m.atk = Math.round(m.atk * 1.08); m.spd += 1; }
    if (kind === 'meng_kui_shou') { m.name = '精英·梦傀首'; m.hp = m.maxhp = Math.round(m.maxhp * 2.4); m.atk = Math.round(m.atk * 1.2); m.lv = 13; }
    m.name += ' Lv' + (kind === 'meng_kui_shou' ? 13 : 12); m.h = BODY(kind); return m; }
  async function fight(kinds, o = {}) {
    const ens = kinds.map(k => make(k)); for (const k of kinds) load(k);
    const pr = startBattle({ title: o.title || ('万妖塔 · 第一层 · ' + (o.elite ? '梦傀首' : '内苑')), bg: o.bg || 'bg_tw1', enemies: ens, exp: Math.round(ens.reduce((s, e) => s + e.maxhp, 0) * .27), gold: o.elite ? 220 : 40 * ens.length, tower: 1, ny: 1 });
    const win = await pr; try { S.scene = drawMap; } catch (e) {}
    if (!win && o.revive !== false) { try { partyRevive(.3); } catch (e) {} }
    return win === true; }
  const SETS = { meng_pu: ['meng_pu', 'meng_pu'], meng_kui: ['meng_kui', 'meng_kui'], meng_kui_shou: ['meng_kui_shou', 'meng_pu', 'meng_kui'] };

  // ---------- 测试面板 ----------
  let row = null;
  function mark() { if (row) for (const b of row.querySelectorAll('button[data-v]')) b.className = (b.dataset.v === '1') === ON ? 'on' : ''; }
  function set(on) { ON = !!on; LSS(LSK, ON ? '1' : '0'); mark(); try { toast('内苑梦傀战斗：' + (ON ? '新（R474 真画帧 + 手绘特效）' : '旧'), 2000); } catch (e) {} }
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r474n]')) return;
      const h = document.createElement('h4'); h.textContent = '11-28 新加 · 内苑梦傀战斗（梦仆 / 梦傀 / 梦傀首，记在本机）'; h.setAttribute('data-r474n', '1');
      row = document.createElement('div'); row.className = 'row';
      for (const [v, t] of [['1', '内苑梦傀：新（R474 真画）'], ['0', '内苑梦傀：旧']]) { const b = document.createElement('button'); b.textContent = t; b.dataset.v = v; b.onclick = () => set(v === '1'); row.appendChild(b); }
      for (const k of KINDS) { const go = document.createElement('button'); go.textContent = '直接开打' + CN[k]; go.onclick = () => { try { const q = document.getElementById('dbgPanel'); if (q) q.hidden = true; } catch (e) {} if (!(typeof battle !== 'undefined' && battle)) fight(SETS[k], { elite: k === 'meng_kui_shou' }); }; row.appendChild(go); }
      p.appendChild(h); p.appendChild(row); mark(); };
    // 面板每次打开都会整个重画（innerHTML），所以一直盯着它：我们这几行没了就再补上（和 r473_inner.js 一样）
    const watch = p => { add(); new MutationObserver(() => { if (!p.querySelector('[data-r474n]')) add(); }).observe(p, { childList: true }); };
    if (document.getElementById('dbgPanel')) watch(document.getElementById('dbgPanel')); else { const mo = new MutationObserver(() => { const p = document.getElementById('dbgPanel'); if (p) { mo.disconnect(); watch(p); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}

  // 录预览 / 测试用：让某只直接出一手（w = 'normal' 普通一下 / 'skill' 招牌技 / 'charge' 梦傀首蓄力）
  async function demo(e, w = 'normal') { const b = battle; if (!b || !isNY(e)) return false;
    if (w === 'charge') { e._charge = '「千丝坠」'; await sleep(1100); return true; }
    return w === 'skill' ? skill(e, b) : normal(e, b); }
  window.R474NY = { TRACE, demo, on: () => ON, set, make, fight, fromMapMob, kindOf, act: u => (u && u._ps && u._ps.cur ? u._ps.cur.key.split('|')[0] : null), move, POSE, ready, load, M, KINDS, SKILL, SETS };
})();
