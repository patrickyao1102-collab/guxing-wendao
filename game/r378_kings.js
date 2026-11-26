// ================= R378 · 六只妖王的本体重画（Codex R378）（只进测试版）=================
// 作者 11-27 凌晨：「我觉得你那只野猪就很难看……得让妖王自己去重新生成一个，要大一点，然后有那种压迫感。」
// 原来妖王用的是普通妖兽放大。现在每只妖王有自己的本体，并且照仙剑的做法分状态播帧：
//   平时（呼吸，来回播）／蓄力（要放大招的姿势——该防御）／出手（预备 → 发力 → 命中 → 收回）／力竭（喘息——该猛打）。
// 图集由 tools/r378_build.py 从 Codex 的逐帧图拼出来，尺寸表在 r378_meta.js。哪只的图到了就换哪只，没到的照旧。
// 讨伐榜上的画像、地图上的巢穴、图鉴一起换成新样子。只换形象和站位，不动数值和打法。
(function () {
  const META = window.R378_META; if (!META || !window.R370_YW || typeof VSPRITE_ADD !== 'function' || typeof IMG === 'undefined') return;
  const VS = window.VSPRITES;
  // 站位：新本体宽，妖王往左靠；身前的小怪往右让
  // 作者 11-27 晨：「战斗界面本来就小、人物填得满，BOSS 放大会把（法宝钮、指令轮）和战斗条都遮住……我们是手游，比例要对照同款手游，太大了头晕目眩。」
  // 所以妖王不再画到四百多高：缩到比我方高出三成上下（我方立绘约 260 高），整只摆在左边那块空地里——
  // 左上法宝钮（到 y=170）、中间指令轮（x 从 500 起）、底下行动条（y 从 660 起）都不碰。K 是每只在战斗里的缩放，MAPK 是地图巢穴上的。
  const K = { boar: .78, leopard: .82, rhino: .70, treant: .76, wolf: .72, spider: .70 }, MAPK = .78;
  const POS = { boar: [250, 622], leopard: [262, 620], rhino: [262, 624], treant: [240, 628], wolf: [250, 626], spider: [258, 626] };
  const APOS = [[572, 652], [668, 606], [455, 680]], SSLOTS = [[572, 652], [668, 606], [455, 680], [760, 660], [610, 560]];
  for (const y of R370_YW) { const M = META[y.id]; if (!M || !M.main) continue; const key = 'yw_' + y.id;
    VSPRITE_ADD(key, '../r378/' + y.id, M.main, M.h, false, false);
    if (M.charge) VSPRITE_ADD(key + '_c', '../r378/' + y.id + '_charge', M.charge, M.h, false, false);
    if (M.break) VSPRITE_ADD(key + '_b', '../r378/' + y.id + '_break', M.break, M.h, false, false);
    // 图鉴 / 图集还没载完时：先用一张小的立绘（用到才载）
    try { let v = null, pic = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; },
      get() { if (v) return v; if (!pic) { pic = new Image(); pic.src = 'r378/' + y.id + '_pic.webp?v=1'; } return pic.complete && pic.naturalWidth ? pic : undefined; } }); } catch (e) {}
    const k = K[y.id] || .76; (window.VS_SCALE = window.VS_SCALE || {})[key] = k;
    y.vkey = key; y.vh = Math.round(M.bodyH * .92 * k); y.scale = 1; y.mh = Math.round(M.h * .56 * MAPK); y.bpos = POS[y.id] || [300, 630]; y.apos = APOS; y.sslots = SSLOTS;
    try { const m = MOB_DB[y.type]; if (m && typeof DROPS !== 'undefined' && DROPS[m.key] && !DROPS[key]) DROPS[key] = DROPS[m.key]; } catch (e) {}
    try { if (M.poster && window.R370_ART) R370_ART('yw_' + y.id, 'r378'); } catch (e) {}   // 榜上的画像：先占住这个名字，之后榜里取到的就是新画像
    try { if (window.BESTIARY) { const c = BESTIARY.CAT.find(c => c[0] === 'yw_' + y.id); if (c) c[2] = key; } } catch (e) {}
  }
  // 蓄力 / 力竭换姿势；出手那一下用回主图集（里面有出手帧）
  if (typeof drawUnit === 'function') drawUnit = (orig => function (u) {
    try { if (u && u._yw && u.side === 'enemy' && typeof u.key === 'string' && u.key.indexOf('yw_') === 0) { let vk;
        if (u.alive && u._va == null) { if (u._break > 0 && VS[u.key + '_b']) vk = u.key + '_b'; else if (u._charge && VS[u.key + '_c']) vk = u.key + '_c'; }
        u._vk = vk; } } catch (e) {}
    return orig.apply(this, arguments); })(drawUnit);
  // 开战前把蓄力 / 力竭两张小图集也拉下来（不然第一次换姿势会闪一下旧图）
  if (typeof startBattle === 'function') startBattle = (orig => function (cfg) { try { const y = cfg && cfg.yw && R370_YW.find(q => q.id === cfg.yw), M = y && META[y.id];
      if (M) for (const n of ['charge', 'break']) if (M[n]) { const im = new Image(); im.src = 'rig/../r378/' + y.id + '_' + n + '.webp'; } } catch (e) {}
    return orig.apply(this, arguments); })(startBattle);
})();
