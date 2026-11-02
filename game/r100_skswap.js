// 作者 11-03：删掉「破军剑意·天枢」；天枢的特效（金色巨剑镇压全体）给「破军剑阵·星罗」；
// 星罗原来的特效给「星陨」——星陨本来就借星罗剑阵的画面（index.html 星陨那段调 skXingluoArr），所以星陨不用动。
(function () {
  if (typeof doHeroAction !== 'function' || typeof SKILL_DB === 'undefined') return;
  // ---- 1. 天枢：从技能表、书、已学列表里拿掉 ----
  const DROP = () => { try { if (S.hero && S.hero.skills && S.hero.skills.includes('tianshu')) S.hero.skills = S.hero.skills.filter(k => k !== 'tianshu'); } catch (e) {} };
  delete SKILL_DB.tianshu;
  try { for (const k in ITEM_DB) if (/^(bk_hero_tianshu|jp_tianshu)$/.test(k)) delete ITEM_DB[k]; } catch (e) {}
  try { if (S.inv) for (const k of ['bk_hero_tianshu', 'jp_tianshu']) delete S.inv[k]; } catch (e) {}
  setInterval(DROP, 1500); DROP();
  if (typeof heroSkills === 'function') heroSkills = (orig => function () { DROP(); return orig.apply(this, arguments).filter(it => it.k !== 'tianshu'); })(heroSkills);

  // ---- 2. 星罗换成天枢的画面（名字、喊招仍是星罗；伤害按星罗原来三段合计 1.5 倍）----
  if (SKILL_DB.xingluo) SKILL_DB.xingluo.desc = '星罗星力凝成金色巨剑，从天而降镇压全体敌人';
  const RN = s => typeof s === 'string' ? s.replace(/破军剑意\s*·\s*天\s*枢/, '破军剑阵 · 星罗').replace(/天\s*枢/g, '星罗') : s;
  doHeroAction = (orig => async function (k) {
    const b = battle, P = b && b.P;
    if (k !== 'xingluo' || !P || P.ally || typeof skTianshu !== 'function') return orig.apply(this, arguments);
    b.state = 'act'; b.menu = null; P.mp -= (SKILL_DB.xingluo && SKILL_DB.xingluo.cost) || 0; P.pose = 'cast';
    const sb = window.skillBanner, ci = window.castIntro, dc = window.dmgCalc;
    window.skillBanner = function (n, ...r) { return sb.call(this, RN(n), ...r); };
    if (ci) window.castIntro = function (P2, n, ...r) { return ci.call(this, P2, RN(n), ...r); };
    if (dc) window.dmgCalc = function (a, t, m, ...r) { return dc.call(this, a, t, (m || 1) * 1.2, ...r); };   // 天枢一击 1.25 倍 → 星罗 1.5 倍
    try { await skTianshu(P, typeof pickTarget === 'function' ? pickTarget() : null); }
    finally { window.skillBanner = sb; if (ci) window.castIntro = ci; if (dc) window.dmgCalc = dc; }
    P.pose = null; await afterAct();
  })(doHeroAction);
})();
