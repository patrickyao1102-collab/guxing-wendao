// ================= 总策划：技能分类调整 =================
// 「破」= 必杀技（怒气 100）：云霆 九天神雷 / 林雪 大雪纷飞 / 洛尘 日月轮转……叶孤星的必杀技尚未定，暂未领悟。
// 破军剑阵·太阳、破军·星落 改为「技」里的普通剑诀（耗灵力，不耗怒气）。
//   太阳：无上境剑诀，平时灰着（解锁条件：无上境）；借力一战星旋借力，可免费放一次。
//   星落：叶孤星开局就会的群攻（和点星一起，是天剑宗弟子的入门剑招）。
(function () {
  if (typeof SKILL_DB === 'undefined' || typeof heroSkills !== 'function') return;
  const SUN_COST = 80, XL_COST = 16;
  window.XL_MULT = 1.5;   // 星落：后山小妖三剑清完，换上寒星剑两剑清完（总策划）
  SKILL_DB.sun = { name: '破军剑阵·太阳', cost: SUN_COST, desc: '烈日化阵，万剑如雨，落日轰击全体（无上境剑诀）', star: '太阳', lv: 0 };
  SKILL_DB.xingluo2 = { name: '星落', cost: XL_COST, desc: '叶孤星以天剑诀自创的群攻剑招：引星光坠地，轰击全体敌人', star: '星落', lv: 1 };
  const F = () => S.flags || (S.flags = {});
  heroSkills = (orig => function () {
    const list = orig(); const b = battle, P = b && b.P; if (!P || P.ally) return list;
    const out = list.filter(x => x.k !== 'none' && x.k !== 'sun' && x.k !== 'xingluo2');
    const h = S.hero;
    if ((h.skills || []).includes('xingluo2') || (h.skills || []).includes('pojun')) { const it = { k: 'xingluo2', name: SKILL_DB.xingluo2.name, cost: XL_COST, desc: SKILL_DB.xingluo2.desc, disabled: P.mp < XL_COST, why: '灵力不足' };
      const i = out.findIndex(x => x.k === 'dianxing'); if (i >= 0) out.splice(i + 1, 0, it); else out.unshift(it); }
    const lend = !!b.cfg.allowUlt, open = lend || !!F().sun_unlocked;
    if (lend || F().sun_seen) out.unshift({ k: 'sun', name: SKILL_DB.sun.name, cost: lend ? 0 : SUN_COST, desc: lend ? '星旋借力 · 仅此一次' : SKILL_DB.sun.desc, disabled: !open || (!lend && P.mp < SUN_COST), why: open ? '灵力不足' : '解锁条件：无上境' });
    return out.length ? out : list;
  })(heroSkills);
  doHeroAction = (orig => async function (k) {
    const b = battle, P = b && b.P;
    if (P && !P.ally && k === 'ult') { toast('叶孤星的必杀技尚未领悟', 1800); return; }
    if (P && !P.ally && (k === 'sun' || k === 'xingluo2')) {
      const lend = k === 'sun' && b.cfg.allowUlt;
      if (k === 'sun' && !lend && !F().sun_unlocked) { toast('解锁条件：无上境', 1800); return; }
      const cost = lend ? 0 : SKILL_DB[k].cost; if (P.mp < cost) { toast('灵力不足', 1500); return; }
      if (b.onEvent) { const r = await b.onEvent('before', b, k === 'sun' ? 'ult' : k); if (r === 'cancel') return; }
      b.state = 'act'; b.menu = null; const rage = P.rage; P.mp -= cost; P.pose = 'cast';
      if (k === 'sun') { F().sun_seen = 1; await skillSun(P); if (lend) b.cfg.allowUlt = false; } else await skXingluo(P);
      P.rage = rage; P.pose = null;
      await afterAct(); return;
    }
    return orig(k);
  })(doHeroAction);
})();
