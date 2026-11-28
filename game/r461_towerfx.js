// ================= R461 · 万妖塔：首领、小怪的招式特效 + 招式名（Codex R456，只进测试版）=================
// 作者 11-28 09:27：「BOSS 小怪的技能特效你都做了吗？还有技能名字你都要去做啊。」
// 霁月：潮汐 / 溺 / 落泪 / 沉渊；焚羽：灼 / 黑焰 / 涅槃之火；十二只小怪各一招招牌技（出招时屏幕中间亮招名）。
// 图集：Codex 交的是一行横排（40 帧 × 768 宽太长），r456/ 里重排成多行、缩到 0.75，引擎的 fx() 认 FXM 的 cols。
// 每招的「对齐点」照 Codex 说明里的单帧像素（落在目标脚底 / 胸口 / 腰）。
(function () {
  if (typeof FXM !== 'object' || typeof fx !== 'function') return;
  const M = {"fx_tw_chaoxi":[576,384,40,5],"fx_tw_chenyuan":[576,384,40,5],"fx_tw_danlubao":[384,384,24,6],"fx_tw_hanjihengsao":[576,384,24,5],"fx_tw_heiyan":[576,384,40,5],"fx_tw_jiaoweichao":[576,384,24,5],"fx_tw_jinyusanshe":[576,384,24,5],"fx_tw_leizhufu":[384,384,24,6],"fx_tw_liannu":[576,384,24,5],"fx_tw_luolei":[384,384,24,6],"fx_tw_ni":[384,384,24,6],"fx_tw_niepanzhihuo":[384,384,24,6],"fx_tw_qianmengsi":[576,384,24,5],"fx_tw_shihouzhen":[576,384,24,5],"fx_tw_shihunfen":[576,384,24,5],"fx_tw_shuangxiaopu":[576,384,24,5],"fx_tw_shuangzhualie":[384,384,24,6],"fx_tw_yanhuachan":[384,384,24,6],"fx_tw_zhuo":[384,384,24,6]};
  for (const [k, [w, h, n, cols]] of Object.entries(M)) { FXM[k] = { w, h, n, fps: 40, cols };
    try { const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = 'r456/' + k + '.webp?v=1'; if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} }
  // 对齐点：Codex 说明里的单帧像素（原图 768 / 512 宽）
  const SRCW = k => (M[k][0] > 400 ? 768 : 512);
  const at = (k, px, py) => ({ ax: px / SRCW(k), ay: py / 512 });
  const SC = 1.25;   // 图集缩了 0.75，这里放回来再略大一点
  const where = (P, spot) => spot === 'feet' ? P.y : spot === 'waist' ? P.y - P.h * .45 : P.y - P.h * .58;
  function play(k, x, y, a, o = {}) { try { if (!IMG[k]) return; fx(k, Object.assign({ x, y, scale: SC * (o.k || 1), alpha: 1.25, once: true, life: M[k][2] / 40 }, a)); } catch (e) {} }
  const heroesOf = b => (b.heroes || [b.P]).filter(u => u.alive);
  const mid = (hs, f) => hs.reduce((s, P) => s + f(P), 0) / Math.max(1, hs.length);

  // ---------- 首领：霁月、焚羽 ----------
  const H = window.R370_H;
  const TEAM = {
    潮汐: { k: 'fx_tw_chaoxi', p: [588, 337], spot: 'chest', delay: 250 },
    沉渊: { k: 'fx_tw_chenyuan', p: [466, 390], spot: 'feet', delay: 150 },
    黑焰: { k: 'fx_tw_heiyan', p: [500, 417], spot: 'feet', delay: 200 },
  };
  if (H && H.aoe) H.aoe = (orig => async function (e, b, name, fxName) {
    const T = TEAM[name];
    if (T && IMG[T.k]) { const hs = heroesOf(b), x = mid(hs, P => P.x), y = mid(hs, P => where(P, T.spot));
      setTimeout(() => play(T.k, x, y, at(T.k, ...T.p)), 700 + T.delay);   // aoe 先喊招名、压暗 ~0.75 秒再落伤害
      const a = [...arguments]; a[3] = 'fx_tw_none'; return orig.apply(this, a); }
    if (name === '涅槃之火' && IMG.fx_tw_niepanzhihuo) setTimeout(() => play('fx_tw_niepanzhihuo', e.x, e.y, at('fx_tw_niepanzhihuo', 256, 407), { k: 1.3 }), 500);
    return orig.apply(this, arguments); })(H.aoe);
  // 「溺」「灼」两个状态：飘字的同时在那个人身上放特效
  floatText = (orig => function (x, y, text, color) {
    try { if (battle && (text === '溺' || text === '灼')) { const u = battle.units.find(u => u.side === 'hero' && Math.abs(u.x - x) < 3);
        if (u) { if (text === '溺') play('fx_tw_ni', u.x, where(u, 'chest'), at('fx_tw_ni', 256, 215), { k: .9 }); else play('fx_tw_zhuo', u.x, where(u, 'chest'), at('fx_tw_zhuo', 256, 243), { k: .7 }); } } } catch (e) {}
    return orig.apply(this, arguments); })(floatText);
  // 「落泪」：泪水灵落地成形
  if (H && H.summon) H.summon = (orig => function (b, e, types) { const n0 = b.enemies.length, r = orig.apply(this, arguments);
    try { if ((types || []).includes('tw_shuiling')) for (const u of b.enemies.slice(n0)) play('fx_tw_luolei', u.x, u.y, at('fx_tw_luolei', 256, 398), { k: 1 }); } catch (e) {}
    return r; })(H.summon);

  // ---------- 小怪：每只一招招牌技（每三手放一次）----------
  const MOB = {
    e_tw_huayan: { name: '魇花缠', k: 'fx_tw_yanhuachan', p: [256, 428], spot: 'feet', mult: 1.2, eff: 'bind' },
    e_tw_mengkui: { name: '牵梦丝', k: 'fx_tw_qianmengsi', p: [616, 244], spot: 'chest', mult: 1.15, eff: 'bind' },
    e_tw_xuedie: { name: '噬魂粉', k: 'fx_tw_shihunfen', p: [552, 260], spot: 'chest', mult: 1.1, eff: 'mp' },
    e_tw_shini: { name: '石吼震', k: 'fx_tw_shihouzhen', p: [575, 255], spot: 'chest', mult: 1.25, eff: 'stun' },
    e_tw_xuewei: { name: '霜爪裂', k: 'fx_tw_shuangzhualie', p: [256, 251], spot: 'chest', mult: 1.45 },
    e_tw_bingjia: { name: '寒戟横扫', k: 'fx_tw_hanjihengsao', p: [625, 264], spot: 'waist', mult: 1.4 },
    e_tw_shuanglang: { name: '霜啸扑', k: 'fx_tw_shuangxiaopu', p: [672, 253], spot: 'chest', mult: 1.3, eff: 'stun' },
    e_tw_nukui: { name: '连弩', k: 'fx_tw_liannu', p: [593, 365], spot: 'feet', mult: 1.5 },
    e_tw_jiaowei: { name: '蛟尾潮', k: 'fx_tw_jiaoweichao', p: [637, 255], spot: 'chest', mult: 1.4 },
    e_tw_shuiling: { name: '泪珠缚', k: 'fx_tw_leizhufu', p: [256, 256], spot: 'waist', mult: 1.1, eff: 'bind' },
    e_tw_huiyu: { name: '烬羽散射', k: 'fx_tw_jinyusanshe', p: [634, 264], spot: 'chest', mult: 1.35, eff: 'burn' },
    e_tw_dantong: { name: '丹炉爆', k: 'fx_tw_danlubao', p: [256, 301], spot: 'self', mult: 1.6 },
  };
  const EFF = {
    bind: P => { P.gauge = Math.min(P.gauge, -40); floatText(P.x, P.y - P.h - 30, '缚', '#ff9aa8', 34); },
    stun: P => { P.gauge = Math.min(P.gauge, -55); floatText(P.x, P.y - P.h - 30, '震', '#e8e0c8', 34); },
    mp: P => { const d = Math.min(P.mp || 0, 20); P.mp = (P.mp || 0) - d; if (d) floatText(P.x, P.y - P.h - 30, '灵力 -' + d, '#b48cff', 32); },
    burn: P => { P._burn = Math.max(P._burn || 0, 2); floatText(P.x, P.y - P.h - 30, '灼烧', '#ff8a3a', 34); },
  };
  async function mobSkill(e, b) {
    const S0 = MOB[e.key]; if (!S0 || !H || !H.strike) return false;
    e._skn = (e._skn || 0) + 1; if (e._skn % 3 !== 0 || !IMG[S0.k]) return false;   // 每三手放一次招牌技
    const hs = heroesOf(b); if (!hs.length) return false; const P = hs[Math.floor(Math.random() * hs.length)];
    // 招名由 strike 在屏幕中间亮出来；特效对准自己的落点
    setTimeout(() => { try { if (S0.spot === 'self') play(S0.k, P.x - 150, P.y - (e.h || 220) * .5, at(S0.k, ...S0.p), { k: .9 }); else play(S0.k, P.x, where(P, S0.spot), at(S0.k, ...S0.p), { k: S0.p[0] > 400 ? 1.05 : .9 }); } catch (er) {} }, 230);
    await H.strike(e, b, P, S0.name, S0.mult, 'fx_tw_none');
    try { if (S0.eff && P.alive) EFF[S0.eff](P); } catch (er) {}
    return true; }
  if (typeof enemyAct === 'function') enemyAct = (orig => async function (e) {
    try { if (e && !e.ai && MOB[e.key]) e.ai = mobSkill; } catch (er) {}
    return orig.apply(this, arguments); })(enemyAct);
  window.R461 = { MOB, TEAM, play };
})();
