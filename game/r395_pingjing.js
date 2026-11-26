// ================= R395 · 练气六重的瓶颈：拿到九曜剑典之前，修为卡在九成九（只进测试版）=================
// 原作：叶孤星「练气六重卡了整整两年」，开场面板上写着「练气六重（99%）」；拿到剑典那一夜「一个时辰就从练气六重冲到了九重」。
// 以前的游戏里，开场在后山多打几只兽火就能升到七重——和这段戏对不上（那句台词和配音都说的是「六重」）。
// 新加了落星坡和头目之后，玩家更容易在拿剑典之前把经验攒满，所以把这条补上：
//   · 没拿到完整的剑典之前，经验照涨，涨到这一级的九成九就停住，升不了级（胜利结算上照常写「经验 +N（582 / 588）」，看得出卡住了）；
//   · 头一回卡住时，叶孤星心里嘀咕一句，星旋回一句，催他去拿剑典——不解释原因（原因留给剑典那场戏说）；
//   · 剑典修复那场戏照旧连升三重。之后一切照常。
// 要撤掉：从 index.html 里删掉这一个文件的引用即可。
(function () {
  if (typeof gainExp !== 'function' || typeof expNeed !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const on = () => { try { if (window.R395_SKIP) return false; const h = S.hero, f = F(); return h.lv === 6 && !f.jiuyao_full && !f.res_fixed && !f.ch1_free && !f.ch2_roam && !f.ch1_after && !(h.skills || []).includes('pojun'); } catch (e) { return false; } };
  gainExp = (orig => function (n) {
    if (!on()) return orig.apply(this, arguments);
    const h = S.hero, need = expNeed(h.lv), cap = need - Math.max(1, Math.round(need * .01));
    h.exp = Math.min(cap, (h.exp || 0) + (n || 0)); if (h.exp >= cap) F().pj_hit = 1; return 0; })(gainExp);
  window.R395 = { on };
  // 头一回卡住：等画面静下来再说（不和战斗结算、获得物品框叠在一起）
  let queued = false;
  try { S.overlay.push({ draw() { try { const f = S.flags || {}; if (!f.pj_hit || f.pj_said || queued || !window.SAY_LATER) return; queued = true;
        SAY_LATER(async () => { const g = S.flags || {}; queued = false; if (g.pj_said || !on()) return; g.pj_said = 1; await say('叶孤星·思', '（……又是这样。差一线，怎么都进不去。）'); await say('星旋', '急什么。本神仙说过了，拿到剑典再说。'); }); } catch (e) {} } }); } catch (e) {}
})();
