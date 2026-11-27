// ================= R430 · 万妖塔：首领立绘 + 开战立绘 + 招式特效 + 一二层新小怪（只进测试版）=================
// 作者 11-28 凌晨：「BOSS 的战斗立绘、对话立绘、动画帧……都可以开任务」「小怪种类有点少，一二层三到四种」。
// 到货：Codex R434（绛蘅 / 玄锋 / 霁月 / 焚羽：对话立绘「平常」「被打败」各一张 + 开战大立绘）、R435（入梦 / 花葬 / 虎啸 / 白虎噬 四个招式特效，黑底横排序列帧）、
//       R433（一层：血蝶魂、花缚石狻猊；二层：霜鬃狼、城头弩傀，图集拼进 r415/）。
(function () {
  const T = window.TOWER, META = window.R415_META;
  if (!T || !META || typeof IMG === 'undefined' || typeof VSPRITE_ADD !== 'function') return;
  const VSS = window.VS_SCALE = window.VS_SCALE || {};
  const ld = (k, src) => { if (IMG[k]) return; const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = src; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} };
  // ---------- 一、二层新小怪 ----------
  const MOBS = {
    tw_xuedie: { name: '血蝶魂', hp: 520, atk: 49, def: 9, spd: 18, atkType: 'claw', wx: 'mu', fl: 1 },
    tw_shini: { name: '花缚石狻猊', hp: 760, atk: 45, def: 19, spd: 9, atkType: 'claw', wx: 'mu', fl: 1 },
    tw_shuanglang: { name: '霜鬃狼', hp: 640, atk: 58, def: 12, spd: 19, atkType: 'claw', wx: 'jin', fl: 2 },
    tw_nukui: { name: '城头弩傀', hp: 780, atk: 54, def: 20, spd: 10, atkType: 'claw', wx: 'jin', fl: 2 } };
  for (const [t, m] of Object.entries(MOBS)) { const id = t.slice(3), M = META[id]; if (!M) continue; const key = 'e_' + t;
    VSPRITE_ADD(key, '../r415/' + id, M.main, M.h, false, false); VSS[key] = 1;
    MOB_DB[t] = { key, name: m.name, hp: m.hp, atk: m.atk, def: m.def, spd: m.spd, h: Math.round(M.bodyH * .92), atkType: m.atkType, mh: 104 };
    try { if (window.WX5) WX5.ENEMY[key] = m.wx; } catch (e) {}
    try { let v = null, pic = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; }, get() { if (v) return v; if (!pic) { pic = new Image(); pic.src = 'r415/' + id + '_pic.webp?v=1'; } return pic.complete && pic.naturalWidth ? pic : undefined; } }); } catch (e) {}
    T.MOBS[t] = m; }
  try { const X = T.MAZE && T.MAZE.TXT; if (X) {
      if (X[1] && MOB_DB.tw_xuedie) X[1].mobs.push(['tw_xuedie', 'tw_xuedie', 'tw_huayan'], ['tw_shini', 'tw_xuedie'], ['tw_shini', 'tw_mengkui'], ['tw_xuedie', 'tw_mengkui', 'tw_huayan']);
      if (X[2] && MOB_DB.tw_shuanglang) X[2].mobs.push(['tw_shuanglang', 'tw_shuanglang'], ['tw_nukui', 'tw_xuewei'], ['tw_shuanglang', 'tw_bingjia', 'tw_nukui'], ['tw_nukui', 'tw_shuanglang']); } } catch (e) {}
  // ---------- 对话立绘 ----------
  const BOSSP = { 绛蘅: 'jiangheng', 玄锋: 'xuanfeng', 霁月: 'jiyue', 焚羽: 'fenyu' };
  const COLOR = { 绛蘅: '#ffb0b8', 玄锋: '#dfeaff', 霁月: '#bfefff', 焚羽: '#ffc08a' };
  for (const [who, id] of Object.entries(BOSSP)) { ld('r434_p_' + id, 'r434/p_' + id + '.webp?v=1'); ld('r434_p_' + id + '_2', 'r434/p_' + id + '_2.webp?v=1');
    if (typeof SPEAKERS === 'object') SPEAKERS[who] = Object.assign({}, SPEAKERS[who] || {}, { p: 'r434_p_' + id, color: COLOR[who] }); }
  // 打完放故事时，首领用「被打败」那一张
  try { const ST = window.TOWER_STORY; if (ST && ST.play) ST.play = (orig => async function () { const keep = {};
      for (const [who, id] of Object.entries(BOSSP)) if (SPEAKERS[who]) { keep[who] = SPEAKERS[who].p; if (IMG['r434_p_' + id + '_2']) SPEAKERS[who].p = 'r434_p_' + id + '_2'; }
      try { return await orig.apply(this, arguments); } finally { for (const who in keep) SPEAKERS[who].p = keep[who]; } })(ST.play); } catch (e) {}
  // ---------- 开战立绘：进首领战前，大立绘从右边划进来，左边写名号 ----------
  const CUT = { 1: 'jiangheng', 2: 'xuanfeng', 3: 'jiyue', 4: 'fenyu' };
  for (const n in CUT) ld('r434_cut_' + CUT[n], 'r434/cut_' + CUT[n] + '.webp?v=1');
  const V = { on: false, t0: 0, n: 0 };
  const overlay = { draw() { if (!V.on) return; const t = (performance.now() - V.t0) / 1000, B = T.BOSS[V.n], im = IMG['r434_cut_' + CUT[V.n]]; if (!B) return;
    const a = Math.min(1, t / .25) * (t > 1.55 ? Math.max(0, 1 - (t - 1.55) / .3) : 1), k = 1 - Math.pow(1 - Math.min(1, t / .45), 3);
    ctx.save(); ctx.globalAlpha = a * .78; ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, 1280, 720); ctx.globalAlpha = a;
    if (im) ctx.drawImage(im, 1280 - 1280 * (.12 + .88 * k) + 1280 * .0, 0, 1280, 720);
    const col = { mu: '#ff7a8a', jin: '#e8f4ff', shui: '#9fe6ff', huo: '#ffb06a' }[B.wx] || '#ffe0a0';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; const x = 90 - 60 * (1 - k);
    ctx.font = `26px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = 'rgba(255,240,220,.85)'; ctx.fillText('万妖塔 · 第' + '一二三四五六七八九'[V.n - 1] + '层', x, 250);
    ctx.font = `88px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.shadowColor = col; ctx.shadowBlur = 24; ctx.fillStyle = '#fff6e8'; ctx.fillText(B.name, x, 340); ctx.shadowBlur = 0;
    ctx.font = `34px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.fillStyle = col; ctx.fillText(B.title, x + 6, 420);
    ctx.restore(); } };
  if (typeof T.fightBoss === 'function') T.fightBoss = (orig => async function (n) {
    try { if (CUT[n] && IMG['r434_cut_' + CUT[n]]) { V.on = true; V.n = n; V.t0 = performance.now(); if (!S.overlay.includes(overlay)) S.overlay.push(overlay); try { playSnd('sfx_charge'); } catch (e) {} await sleep(1900); } } catch (e) {}
    finally { V.on = false; const i = S.overlay.indexOf(overlay); if (i >= 0) S.overlay.splice(i, 1); }
    return orig.apply(this, arguments); })(T.fightBoss);
  // ---------- 招式特效（Codex R435：黑底，叠加发光） ----------
  try { if (typeof FXM === 'object') {
      Object.assign(FXM, { fx_tw_rumeng: { w: 768, h: 512, n: 12, fps: 24 }, fx_tw_huazang: { w: 768, h: 512, n: 12, fps: 24 }, fx_tw_huxiao: { w: 768, h: 512, n: 10, fps: 24 }, fx_tw_huishi: { w: 512, h: 512, n: 10, fps: 26 }, fx_tw_none: { w: 1, h: 1, n: 1, fps: 30 } });
      for (const k of ['fx_tw_rumeng', 'fx_tw_huazang', 'fx_tw_huxiao', 'fx_tw_huishi']) ld(k, 'r434/' + k + '.webp?v=1'); } } catch (e) {}
  const TEAM = { 入梦: 'fx_tw_rumeng', 花葬: 'fx_tw_huazang', 虎啸: 'fx_tw_huxiao' }, ONE = { 白虎噬: 'fx_tw_huishi' };
  const H = window.R370_H;
  if (H && H.aoe) H.aoe = (orig => async function (e, b, name, fxName) { const k = TEAM[name];
    if (k && IMG[k]) { try { const hs = H.heroes(b); const cx = hs.reduce((s, P) => s + P.x, 0) / Math.max(1, hs.length), cy = hs.reduce((s, P) => s + P.y - P.h * .5, 0) / Math.max(1, hs.length);
        setTimeout(() => { try { fx(k, { x: cx, y: cy, scale: 1.45, alpha: 1.25 }); } catch (er) {} }, 700); } catch (er) {}
      const a = [...arguments]; a[3] = 'fx_tw_none'; return orig.apply(this, a); }
    return orig.apply(this, arguments); })(H.aoe);
  if (H && H.strike) H.strike = (orig => async function (e, b, P, name, mult, fxName) { const k = ONE[name]; if (k && IMG[k]) { const a = [...arguments]; a[5] = k; return orig.apply(this, a); } return orig.apply(this, arguments); })(H.strike);
  window.R430T = { MOBS, overlay };
})();
