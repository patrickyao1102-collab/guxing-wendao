/* R76 正式战斗修正版 v2 · 游戏内运行时
 * 读 r76lib.js（Codex 复现参考代码原样）→ 半分辨率 640×360 透明层逐帧重建 → 2 倍贴回战场。
 * - Codex 的 palette() 是逐像素 getImageData（每层约 28ms），这里换成等效的 GPU 合成（color 混合 + 外描边膨胀 + 透明度提亮）。
 * - R68Material 的剑/星核纹理按时间逐帧重算（每次 10ms+），这里只在 R76 内把纹理时间量化到 1/15 秒并按 4 相周期循环，纹理可缓存。
 * - Codex 对 R68Material 的“可见度加强”只在画 R76 时生效，不影响已接入的点星 / 星落。
 * 招式演出按 meta.timing 的节拍结算伤害与增益（数值沿用原技能）。 */
(function () {
  'use strict';
  if (window.R76_OFF || !window.R76 || !window.R68Material || !window.SK4 || !SK4.ACT) { if (window.R68Material && window.__R68ORIG) Object.assign(R68Material, window.__R68ORIG); return; }
  const M = R68Material, ORIG = window.__R68ORIG || {}, W2 = 640, H2 = 360;
  const WRAP = { blade: M.blade, meteor: M.meteor, orb: M.orb, impact: M.impact };
  Object.assign(M, ORIG);                     // 全局恢复原版（点星/星落保持原样）
  const PER = 4 / 5.2, QT = t => Math.round((((t % PER) + PER) % PER) * 15) / 15;
  const QWRAP = {
    blade: (c, t, x, y, len, w, an, a, seed = 0) => WRAP.blade(c, QT(t), x, y, len, w, an, a, seed % 3),
    meteor: (c, t, x, y, len, w, an, a, seed = 0) => WRAP.meteor(c, QT(t), x, y, len, w, an, a, seed % 3),
    orb: (c, t, x, y, r, a, seed = 0) => WRAP.orb(c, QT(t), x, y, r, a, seed % 3),
    impact: WRAP.impact,
  };
  const mk = () => { const c = document.createElement('canvas'); c.width = W2; c.height = H2; return c; };
  const cA = mk(), cB = mk(), cI = mk(), cO = mk(), gA = cA.getContext('2d'), gB = cB.getContext('2d'), gI = cI.getContext('2d'), gO = cO.getContext('2d');
  const PAL = { star: [[34, 94, 187], [98, 178, 255], [255, 254, 238]], thunder: [[83, 31, 158], [168, 119, 250], [233, 255, 255]], ice: [[31, 116, 177], [104, 210, 252], [249, 255, 255]], music: [[77, 57, 153], [96, 210, 220], [255, 252, 234]], soul: [[30, 72, 179], [115, 175, 250], [232, 249, 255]] };
  const rgb = a => `rgb(${a[0]},${a[1]},${a[2]})`;
  const BACK = new Set(['ground', 'back', 'barrier_back']);
  let ready = false; M.preload && M.preload().then(() => { ready = true; }).catch(() => {});

  // 一组层画进 cA（不带 palette），再在 GPU 上着色 → cO
  function renderGroup(id, t, layers, act) {
    const d = R76.defs[id]; gA.setTransform(1, 0, 0, 1, 0, 0); gA.globalCompositeOperation = 'source-over'; gA.globalAlpha = 1; gA.clearRect(0, 0, W2, H2);
    Object.assign(M, QWRAP);
    try { for (const l of layers) { gA.save(); try { R76.handlers[id](gA, t, l, act); } catch (e) { if (!renderGroup.err) { renderGroup.err = 1; console.warn('R76', id, l, e); } } gA.restore(); } }
    finally { Object.assign(M, ORIG); }
    const P = PAL[d.palette] || PAL.star;
    // 着色：亮度保留、色相取中间色（白芯仍白，暗处偏深色）
    gB.globalCompositeOperation = 'copy'; gB.globalAlpha = 1; gB.drawImage(cA, 0, 0);
    gB.globalCompositeOperation = 'color'; gB.fillStyle = rgb(P[1]); gB.fillRect(0, 0, W2, H2);
    gB.globalCompositeOperation = 'destination-in'; gB.drawImage(cA, 0, 0);
    // 外描边：透明度膨胀 2px，染深色
    gI.globalCompositeOperation = 'copy'; gI.globalAlpha = 1; gI.drawImage(cA, -2, 0); gI.globalCompositeOperation = 'source-over';
    for (const [dx, dy] of [[2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]]) gI.drawImage(cA, dx, dy);
    gI.globalCompositeOperation = 'source-in'; gI.fillStyle = rgb(P[0]); gI.fillRect(0, 0, W2, H2);
    gO.globalCompositeOperation = 'copy'; gO.globalAlpha = .72; gO.drawImage(cI, 0, 0);
    gO.globalCompositeOperation = 'source-over'; gO.globalAlpha = 1; gO.drawImage(cB, 0, 0); gO.globalAlpha = .72; gO.drawImage(cB, 0, 0); gO.globalAlpha = 1;
    return cO;
  }
  function blit(c, a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(c, 0, 0, W2 * 2, H2 * 2); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .35 * a; ctx.drawImage(c, 0, 0, W2 * 2, H2 * 2); ctx.restore(); }

  // 站位：Codex 的招式按“槽位”取人（0 叶孤星 / 1 云霆 / 2 林雪或神乐），目标固定放在敌方 2 号槽
  const SLOT = { yunting: 1, linxue: 2, shenle: 2 };
  const half = u => ({ x: (u.x + (u.ox || 0)) / 2, y: (u.y + (u.oy || 0)) / 2, h: u.h / 2 });
  function actors(id, P, t, opt = {}) {
    const b = battle, d = R76.defs[id], hs = (b.heroes || [b.P]).filter(u => u.alive !== false), sl = [null, null, null];
    if (P) sl[d.caster] = P;
    for (const u of hs) { if (u === P) continue; const k = u.ally ? SLOT[u.ally] : 0; if (k != null && !sl[k]) sl[k] = u; }
    for (const u of hs) { if (sl.includes(u)) continue; const k = sl.indexOf(null); if (k >= 0) sl[k] = u; }
    const fill = P || hs[0]; for (let k = 0; k < 3; k++) if (!sl[k]) sl[k] = fill;
    const es = (b.enemies || []).filter(e => e.alive), en = [null, null, null], tt = t || es[0];
    en[2] = tt; for (const e of es) { if (e === tt) continue; const k = en.indexOf(null); if (k >= 0) en[k] = e; }
    for (let k = 0; k < 3; k++) if (!en[k]) en[k] = tt || fill;
    const act = (opt.units || sl).map(half); act.enemies = en.map(half); act.units = sl; act.enemyUnits = en; return act;
  }
  // 发动演出：返回 { until(sec), done }
  function play(id, P, t, opt = {}) {
    const d = R76.defs[id], dur = opt.dur || d.duration, act = actors(id, P, t, opt), t0 = performance.now();
    const now = () => (performance.now() - t0) / 1000;
    const back = d.layers.filter(l => BACK.has(l)), front = d.layers.filter(l => !BACK.has(l));
    // 30fps 重建，中间帧复用（每组自己的缓存画布）
    const draw = ls => { const own = mk(), og = own.getContext('2d'); let fi = -1;
      return () => { if (!ready) return; const tt = now(); if (tt >= dur) return; const f = Math.floor(tt * 30);
        if (f !== fi) { fi = f; og.globalCompositeOperation = 'copy'; og.drawImage(renderGroup(id, tt, ls, act), 0, 0); }
        blit(own); }; };
    addFx({ life: dur + .3, layer: 0, draw: draw(back) }); addFx({ life: dur + .3, layer: 2, draw: draw(front) });
    return { act, until: async s => { const ms = s * 1000 - (performance.now() - t0); if (ms > 0) await sleep(ms); }, now };
  }
  // 持续层（冰柱 / 定魄 / 冰盾 / 音墙 / 剑阵）：cond() 为真时一直循环
  const LOOPS = new Set();
  function loop(id, layer, mkAct, cond, opt = {}) {
    const key = id + ':' + layer + ':' + (opt.key || ''); if (LOOPS.has(key)) return; LOOPS.add(key);
    const t0 = performance.now(), per = opt.per || 1, b0 = battle;
    addFx({ life: 9999, layer: opt.front === false ? 0 : 2, draw(f) {
      if (battle !== b0 || !cond()) { f.t = f.life; LOOPS.delete(key); if (opt.onEnd && battle === b0) opt.onEnd(); return; }
      if (!ready) return; const tt = ((performance.now() - t0) / 1000) % per; blit(renderGroup(id, tt, [layer], mkAct()), opt.alpha ?? 1); } });
  }
  function once(id, layer, act, dur, front = true) {
    const t0 = performance.now();
    addFx({ life: dur + .1, layer: front ? 2 : 0, draw() { if (!ready) return; const tt = (performance.now() - t0) / 1000; if (tt < dur) blit(renderGroup(id, tt, [layer], act)); } });
  }
  window.R76P = { play, loop, once, actors, renderGroup, ready: () => ready };

  // ===================== 招式（数值沿用原技能，演出换成 R76）=====================
  const A = SK4.ACT, bxv = SK4.bxv, TIER = (w, id) => (window.SKILL_TIER ? SKILL_TIER(w, id) : 1), K = T => 1 + [0, 0, .15, .3, .45, .6][T];
  const heroes = () => (battle.heroes || [battle.P]).filter(u => u.alive);
  const tag = (u, text, col) => floatText(u.x - 20, u.y - u.h * .55, text, col, 26, 1.0);
  const dim = (v, ms) => { try { return dimTo(v, ms); } catch (e) {} };
  async function banner(P, name, sub, col) { P.pose = 'cast'; try { skillBanner(name, col, sub); } catch (e) {} await sleep(120); }
  async function bigIntro(P, name, sub, col, d = .6) { P.pose = 'cast'; try { await portraitPop(P); } catch (e) {} try { skillBanner(name, col, sub); } catch (e) {} dim(d, 220); }
  const snd = (k, v) => { try { playSnd(k, v); } catch (e) {} };

  // ---------- 叶孤星 ----------
  A.huti = async function (P) {
    await banner(P, '护 体', '破军剑气 · 护住全队', '#cfe6ff'); dim(.35, 200); snd('sfx_sword_ring', .7);
    const fx = play('huti', P); const T = TIER('hero', 'huti'), v = .2 * K(T), n = T >= 3 ? 3 : 2;
    await fx.until(.8); snd('sfx_buff', .7); S.shake = 4;
    for (const u of heroes()) { (u.bx || (u.bx = {})).dr = { v: Math.max(v, bxv(u, 'dr')), n, src: 'huti' }; tag(u, '减伤 ' + Math.round(v * 100) + '%', '#bfe6ff'); }
    await fx.until(1.85); dim(0, 250); P.pose = null;
  };
  A.ningshen = async function (P) {
    await banner(P, '凝 神', '剑未出，意先至', '#ffe8a8'); dim(.5, 220); snd('sfx_charge', .6);
    const fx = play('ningshen', P); await fx.until(.96); snd('sfx_star', .7); screenFlash('#fff4d8', .25);
    (P.bx || (P.bx = {})).ns = { v: 1, n: 2 }; tag(P, '下一招 +50%', '#ffe08a');
    await fx.until(1.85); dim(0, 250); P.pose = null;
  };
  A.juling = async function (P) {
    await banner(P, '聚 灵', '九曜星光 · 洒落全队', '#ffe8a8'); snd('sfx_star', .7); dim(.45, 200);
    const fx = play('juling', P), v = Math.round(30 * K(TIER('hero', 'juling')));
    await fx.until(1.0); snd('sfx_heal', .6);
    for (const u of heroes()) { u.mp = Math.min(u.maxmp, u.mp + v); tag(u, '灵力 +' + v, '#9fd0ff'); }
    await fx.until(1.85); dim(0, 250); P.pose = null;
  };
  A.duopo = async function (P, t) { if (!t) return;
    await bigIntro(P, '贪狼剑意 · 夺魄', '聚魂为剑 · 一剑定魂', '#9fd0ff', .8); snd('sfx_charge', .8);
    const fx = play('duopo', P, t); await fx.until(1.02); snd('sfx_beam');
    await fx.until(1.18); screenFlash('#c8d8ff', .7); S.shake = 22; snd('sfx_crit');
    const { d } = dmgCalc(P, t, 4.0, .3); applyDamage(t, d, true, { pierce: true }); await hitStop(100);
    if (t.alive && SK4.stun(t, 1) !== false) soulLock(t);
    await fx.until(2.75); dim(0, 300); P.pose = null;
  };
  function soulLock(t) { if (!t.alive) return; t._r76stun = 1;
    loop('duopo', 'soul_lock_loop', () => actors('duopo', null, t), () => t.alive && t.buffs && t.buffs.stun > 0, { key: t.name + t.x }); }
  // 星陨（主角星陨剑阵）
  if (typeof doHeroAction === 'function') doHeroAction = (orig => async function (k) {
    const b = battle, P = b && b.P;
    if (k !== 'xingyun' || !P || P.ally) return orig(k);
    b.state = 'act'; b.menu = null; P.mp -= SKILL_DB.xingyun.cost;
    await bigIntro(P, '破 军 剑 意 · 星 陨', '星陨剑阵', '#cfe6ff', .65); snd('sfx_charge', .7);
    const es = (b.enemies || []).filter(e => e.alive), fx = play('xingyun', P, pickTarget ? pickTarget() : es[0]), en = fx.act.enemyUnits;
    for (let j = 0; j < 9; j++) { await fx.until(.98 + j * .15); const t = en[j % 3]; if (j % 3 === 0) snd('sfx_hit', .55); S.shake = Math.max(S.shake || 0, 8);
      if (t && t.alive && en.indexOf(t) === j % 3) { const { d, crit } = dmgCalc(P, t, .8, .1); applyDamage(t, d, crit); } }
    await fx.until(2.2); screenFlash('#dfefff', .3); P.buffs = P.buffs || {}; P.buffs.shield = 3; floatText(P.x, P.y - P.h - 30, '星陨剑阵', '#cfe6ff', 40);
    loop('xingyun', 'ward_loop', () => actors('xingyun', P), () => P.alive && P.buffs && P.buffs.shield > 0, { front: false, alpha: .8 });
    await fx.until(3.5); dim(0, 300); P.pose = null; await afterAct();
  })(doHeroAction);

  // ---------- 云霆 ----------
  A.qianggong = async function (P) {
    await banner(P, '强 攻', '雷附于刃', '#d8ccff'); dim(.45, 200); snd('sfx_thunder', .55);
    const fx = play('qianggong', P), T = TIER('yunting', 'qianggong'), v = .2 * K(T), n = T >= 3 ? 3 : 2;
    await fx.until(.34); S.shake = 6; await fx.until(.8);
    for (const u of heroes()) { (u.bx || (u.bx = {})).atk = { v: Math.max(v, bxv(u, 'atk')), n, src: 'qianggong' }; tag(u, '攻击 +' + Math.round(v * 100) + '%', '#ffd36a'); }
    await fx.until(1.85); dim(0, 250); P.pose = null;
  };
  A.jifeng = async function (P) {
    await banner(P, '疾 风', '雷之道 · 快字当先', '#bff0ff'); snd('sfx_wind', .7); dim(.4, 200);
    const fx = play('jifeng', P), T = TIER('yunting', 'jifeng'), v = .3 * K(T), n = T >= 3 ? 3 : 2;
    await fx.until(.8);
    for (const u of heroes()) { if (u._spd0 == null) u._spd0 = u.spd; u.spd = u._spd0 * (1 + v); (u.bx || (u.bx = {})).spd = { v, n }; u.gauge = Math.min(99, (u.gauge || 0) + 15); tag(u, '速度 +' + Math.round(v * 100) + '%', '#bff0ff'); }
    await fx.until(1.85); dim(0, 250); P.pose = null;
  };
  A.boming = async function (P) {
    await banner(P, '搏 命', '雷光暴涨 · 不留后路', '#ffb0a0'); dim(.55, 250); snd('sfx_thunder', .7);
    const fx = play('boming', P); await fx.until(.55); S.shake = 10; screenFlash('#e6d8ff', .3);
    const T = TIER('yunting', 'boming'); (P.bx || (P.bx = {})).atk = { v: Math.max(.5 * K(T), bxv(P, 'atk')), n: 3 }; P.bx.vuln = { v: .25, n: 3 };
    tag(P, '攻击 +50%  受伤 +25%', '#ffb0a0'); await fx.until(1.85); dim(0, 250); P.pose = null;
  };
  A.yunlei = async function (P, t) { if (!t) return;
    await bigIntro(P, '云 雷 踏 影', '雷光残影 · 先手一剑', '#d8ccff', .6); snd('sfx_thunder', .8);
    const fx = play('yunleitaying', P, t), a0 = P.alpha == null ? 1 : P.alpha;
    await fx.until(.38); P.alpha = 0; S.shake = 8;
    await fx.until(.52); P.ox = (t.x + t.h * .48 + 70) - P.x; P.alpha = a0; P.pose = 'atk';
    await fx.until(.64); screenFlash('#e8e0ff', .5); S.shake = 14; snd('sfx_hit');
    const { d, crit } = dmgCalc(P, t, 1.5, .2); applyDamage(t, d, crit); await hitStop(100);
    await fx.until(1.24); P.alpha = 0; await fx.until(1.46); P.ox = 0; P.alpha = a0; P.pose = null;
    P.gauge = Math.max(P.gauge, 60); tag(P, '气条回半', '#bff0ff'); await fx.until(2.3); dim(0, 250);
  };

  // ---------- 林雪 ----------
  A.shuangjia = async function (P) {
    await banner(P, '霜 甲', '薄冰为铠 · 护住全队', '#cff4ff'); dim(.4, 200); snd('sfx_ice', .7);
    const fx = play('shuangjia', P), T = TIER('linxue', 'shuangjia'), k1 = K(T), v = Math.min(.5, .25 * k1), n = T >= 3 ? 3 : 2, hp = .15 * k1;
    await fx.until(.9); snd('sfx_heal', .6);
    for (const u of heroes()) { (u.bx || (u.bx = {})).dr = { v: Math.max(v, bxv(u, 'dr')), n, src: 'shuangjia' }; const h = Math.min(u.maxhp - u.hp, Math.round(u.maxhp * hp)); u.hp += h; floatText(u.x + 30, u.y - u.h * .7, '+' + h, '#7dffa8', 38); tag(u, '减伤 ' + Math.round(v * 100) + '%', '#cff4ff'); }
    await fx.until(1.85); dim(0, 250); P.pose = null;
  };
  A.bingxin = async function (P) {
    await banner(P, '冰 心', '心如止水 · 外邪不侵', '#e0f8ff'); dim(.4, 200); snd('sfx_ice', .6);
    const fx = play('bingxin', P); await fx.until(.72);
    for (const u of heroes()) { if (u.buffs) { u.buffs.stun = 0; u.buffs.frozen = 0; } u.frozenFx = 0; (u.bx || (u.bx = {})).ctrlImm = { v: 1, n: 1 }; tag(u, '解控 · 免控一回合', '#e0f8ff'); }
    await fx.until(1.85); dim(0, 250); P.pose = null;
  };
  A.bingdun = async function (P) {
    await banner(P, '冰 盾', '冰晶为盾', '#cff4ff'); snd('sfx_ice', .6);
    const u = heroes().sort((a, c) => a.hp / a.maxhp - c.hp / c.maxhp)[0];
    const fx = play('bingdun', P, null, { units: [u, P, P] });   // 冰盾画在 0 号槽：把受盾的人放进 0 号
    await fx.until(.76); const T = TIER('linxue', 'bingdun'), v = Math.round(u.maxhp * .3 * K(T));
    (u.bx || (u.bx = {})).hs = { v, n: T >= 3 ? 3 : 2, ice: true }; tag(u, '冰盾 ' + v, '#cff4ff');
    iceShield(u); await fx.until(1.7); P.pose = null;
  };
  function iceShield(u) {
    loop('bingdun', 'shield_idle_loop', () => { const a = actors('bingdun', null, null); const h = half(u); a[0] = h; return a; }, () => u.alive && u.bx && u.bx.hs && u.bx.hs.ice && u.bx.hs.v > 0, { key: u.ally || 'hero',
      onEnd() { if (!u.alive) return; const a = actors('bingdun', null, null); a[0] = half(u); once('bingdun', 'shield_break', a, .75); } });
  }
  A.bingfeng = async function (P, t) { if (!t) return;
    await bigIntro(P, '冰 封', '寒气封身 · 一息成冰', '#cff4ff', .55); snd('sfx_ice', .8);
    const fx = play('bingfeng', P, t); await fx.until(.9); screenFlash('#e0f6ff', .45); S.shake = 12; snd('sfx_hit');
    const { d, crit } = dmgCalc(P, t, .8, .1); applyDamage(t, d, crit);
    if (t.alive && SK4.freeze(t, 1)) icePillar(t);
    await hitStop(100); await fx.until(2.6); dim(0, 250); P.pose = null;
  };
  function icePillar(t) { t._r76ice = 1;
    const mk = () => actors('bingfeng', null, t);
    setTimeout(() => loop('bingfeng', 'ice_hold_loop', mk, () => t.alive && t.buffs && t.buffs.frozen > 0, { key: t.name + t.x,
      onEnd() { t._r76ice = 0; once('bingfeng', 'ice_break', mk(), 1); } }), 2400);
  }
  // 寒星（林雪的杀星）
  if (typeof skShaxing === 'function') skShaxing = (orig => async function (P, t) {
    if (!P || P.ally !== 'linxue' || !t) return orig(P, t);
    await bigIntro(P, '杀 星 · 寒 星', '一星坠落 · 寒气开花', '#cff4ff', .7); snd('sfx_charge', .7);
    const fx = play('hanxing', P, t); await fx.until(1.12); snd('sfx_beam');
    await fx.until(1.48); screenFlash('#e0f6ff', .8); S.shake = 24; snd('sfx_boom');
    const { d } = dmgCalc(P, t, 2.7, 0); applyDamage(t, d, false, { pierce: true }); await hitStop(130);
    await fx.until(3.0); dim(0, 300);
  })(skShaxing);

  // ---------- 神乐 ----------
  A.yinzhang = async function (P) {
    await banner(P, '音 障', '音符结墙 · 刀剑不入', '#c8ffd8'); snd('sfx_buff', .7);
    const fx = play('yinzhang', P), T = TIER('shenle', 'yinzhang'), r = .25 * K(T);
    await fx.until(.72);
    for (const u of heroes()) { const v = Math.round(u.maxhp * r); (u.bx || (u.bx = {})).hs = { v: Math.max(v, bxv(u, 'hs')), n: T >= 3 ? 3 : 2, wall: true }; tag(u, '护盾 ' + v, '#c8ffd8'); }
    loop('yinzhang', 'sound_wall_loop', () => actors('yinzhang', P), () => heroes().some(u => u.bx && u.bx.hs && u.bx.hs.wall && u.bx.hs.v > 0), { alpha: .55 });
    await fx.until(1.8); P.pose = null;
  };
  A.shenfa = async function (P) {
    await bigIntro(P, '神 罚 仙 音', '漫天音符 · 自上压落', '#e6d8ff', .65); snd('sfx_charge', .7);
    const fx = play('shenfaxianyin', P);
    for (const s of [1.25, 1.64, 2.03]) { await fx.until(s); S.shake = 9; snd('sfx_hit', .6);
      for (const t of aliveEnemies()) { const { d, crit } = dmgCalc(P, t, .4, .1); applyDamage(t, d, crit); } }
    await fx.until(3.0); dim(0, 300); P.pose = null;
  };
  A.jiuyinhe = async function (P) {
    await bigIntro(P, '九 音 灵 河', '一河流过 · 伤复意涨', '#c8ffd8', .5); snd('sfx_heal', .8);
    const fx = play('jiuyinlinghe', P), hs = heroes(), T = TIER('shenle', 'jiuyinhe'), r = .35 * K(T);
    for (let i = 0; i < hs.length; i++) { await fx.until(.9 + i * .4); const u = hs[i];
      const h = Math.min(u.maxhp - u.hp, Math.round(u.maxhp * r)); u.hp += h; u.rage = Math.min(100, (u.rage || 0) + 20); floatText(u.x, u.y - u.h - 30, '+' + h, '#7dffa8', 42); tag(u, '怒气 +20', '#ffd36a'); }
    await fx.until(2.75); dim(0, 250); P.pose = null;
  };

  // 进战斗前把常用纹理烤一遍（分帧做，不卡）
  let warmed = false;
  window.R76_PREWARM = function () { if (warmed || !ready) return; warmed = true; const c = document.createElement('canvas').getContext('2d'); let i = 0;
    const step = () => { if (i >= 45) return; const q = i % 15, s = Math.floor(i / 15); Object.assign(M, QWRAP); try { M.blade(c, q / 15, 0, 0, 10, 5, 0, 1, s); M.orb(c, q / 15, 0, 0, 5, 1, s); } finally { Object.assign(M, ORIG); } i++; setTimeout(step, 30); };
    step(); };
  setTimeout(() => { const w = setInterval(() => { if (ready) { clearInterval(w); window.R76_PREWARM(); } }, 1000); }, 4000);
})();
