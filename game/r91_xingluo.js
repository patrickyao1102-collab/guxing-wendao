// R91 星落：叶孤星自创的剑招（作者 11-01）
// 他练天剑诀卡在练气，学不到正版「群星」，无聊自己琢磨出了星落——初期威力远不及群星，会随境界成长：初阶 → 中阶 → 无上境。
// 后山夜路那一战，星旋借给他看的不再是「破军剑阵·太阳」，而是无上境的星落（太阳留到九曜完本之后）。
(function () {
  if (typeof SKILL_DB === 'undefined' || typeof heroSkills !== 'function' || typeof doHeroAction !== 'function') return;
  const F = () => S.flags || (S.flags = {});
  const NAME = '星落·无上境';
  // 星落阶段：1 初阶（练气）2 中阶（凝丹起）3 无上境。素材到位前，画面暂时共用现有星落。
  window.XL_TIER = function () { const r = (S.hero && S.hero.realm) || ''; if (/无上/.test(r)) return 3; if (/凝丹|引魂|元婴|化神/.test(r)) return 2; return 1; };
  if (SKILL_DB.xingluo2) SKILL_DB.xingluo2.desc = '叶孤星少年时自创的群攻剑招：学不到天剑诀的群星，便自己引星光坠地。威力远不及正版群星，会随境界成长';
  try { if (typeof GF_DESC !== 'undefined' && GF_DESC.xingluo2) GF_DESC.xingluo2 = SKILL_DB.xingluo2.desc; } catch (e) {}

  heroSkills = (orig => function () {
    const list = orig(); const b = battle, P = b && b.P; if (!P || P.ally) return list;
    const lend = !!(b.cfg && b.cfg.xlLend);
    if (lend || F().xlw_seen) {
      const it = { k: 'xl_wushang', name: NAME, cost: 0, desc: lend ? '星旋借力 · 仅此一次' : '星落的最终形态：星河倾落，北斗镇世（无上境）', disabled: !lend, why: '解锁条件：无上境' };
      const i = list.findIndex(x => x.k === 'xingluo2'); if (i >= 0) list.splice(i + 1, 0, it); else list.unshift(it);
    }
    return list;
  })(heroSkills);

  doHeroAction = (orig => async function (k) {
    const b = battle, P = b && b.P;
    if (P && !P.ally && k === 'xl_wushang') {
      if (!(b.cfg && b.cfg.xlLend)) { toast('解锁条件：无上境', 1800); return; }
      if (b.onEvent) { const r = await b.onEvent('before', b, 'ult'); if (r === 'cancel') return; }
      b.state = 'act'; b.menu = null; const rage = P.rage; P.pose = 'cast';
      const m0 = window.XL_MULT; window.XL_MULT = 60; window.XL_WUSHANG = 1;   // 无上境：一招清场
      try { await skXingluo(P); if (b.cfg.sunKill) for (const e of aliveEnemies()) applyDamage(e, Math.max(1, Math.ceil(e.hp)), true, { pierce: true }); } finally { window.XL_MULT = m0; window.XL_WUSHANG = 0; }
      F().xlw_seen = 1; b.cfg.xlLend = false; P.rage = rage; P.pose = null;
      await afterAct(); return;
    }
    return orig(k);
  })(doHeroAction);
})();
