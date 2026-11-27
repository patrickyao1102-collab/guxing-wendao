// ================= R420 · 镇妖碑（万妖塔的入口，Codex R413 的画）（只进测试版）=================
// 作者 11-27 22:46：「不要弄什么守塔人了，就一个石碑在那里就好了……镇魔碑什么之类的。」
// 立在云海后庭潭边、竹钓台东边的草地上。碑缝和符文里那层暗红的光慢慢呼吸；点碑进万妖塔（塔的模块到了才接上）。
(function () {
  const MAP = 'qingzhu_upper_pavilion'; if (typeof TMAPS === 'undefined' || !TMAPS[MAP] || !TMAPS[MAP].baked || typeof IMG === 'undefined') return;
  const M = TMAPS[MAP], B = M.baked, F = () => (S.flags = S.flags || {});
  const FX = -190, FY = 520, K = .52, CW = 360, CH = 640, FOOT = 596;   // 碑脚落在 (FX, FY)；图是 360×640，碑座底线在图上 y≈596
  const W = Math.round(CW * K), H = Math.round(CH * K), X = FX - W / 2, Y = FY - FOOT * K;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const IMS = [], load = (k, s) => { const im = new Image(); im.onload = () => { try { IMG[k] = im; } catch (e) {} }; im.src = s; IMS.push(im); };
  load('r420_stele', 'r413/stele.webp?v=1'); load('r420_stele_glow', 'r413/stele_glow.webp?v=1');
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function (name) { try { if (name === MAP && window.IMG_GUARD && IMG_GUARD.bump) for (const im of IMS) IMG_GUARD.bump(im); } catch (e) {} return orig.apply(this, arguments); })(tileSetMap);
  if (!B.objs.some(o => o.id === 'r420_stele')) B.objs.push({ id: 'r420_stele', uid: 'r420_stele', img: 'r420_stele', x: X, y: Y, w: W, h: H, sy: FY, ax: FX, ay: FY, flat: false, flip: false, noBlock: true, noPre: true });
  drawBaked = (orig => function (o, now) { if (!o || o.id !== 'r420_stele') return orig.apply(this, arguments);
    const im = IMG.r420_stele; if (!im) return; ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, o.x, o.y, o.w, o.h);
    const g = IMG.r420_stele_glow; if (g) { const t = performance.now() / 1000, k = .5 + .5 * Math.sin(t * 1.6); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35 + .55 * k; ctx.drawImage(g, o.x, o.y, o.w, o.h); }
    ctx.restore(); })(drawBaked);
  // 挡路：碑座那一块
  const RECT = [FX - 70, FY - 26, FX + 70, FY + 4];
  tileSetMap = (orig => function (m) { const res = orig.apply(this, arguments);
    try { if (m === MAP && world.map && world.map.T && world.map.T.block) { const T = world.map.T, cs = T.cs, c0 = T.c0 || 0, r0 = T.r0 || 0;
      for (let wy = RECT[1]; wy <= RECT[3]; wy += cs / 2) for (let wx = RECT[0]; wx <= RECT[2]; wx += cs / 2) { const r = Math.floor(wy / cs) - r0, c = Math.floor(wx / cs) - c0; if (T.block[r] && c >= 0 && c < T.block[r].length) T.block[r][c] = 1; } } } catch (e) { console.warn('R420 block', e); }
    return res; })(tileSetMap);
  M.npcs = M.npcs || []; if (!M.npcs.some(n => n.stele)) { const [c, r] = P(FX, FY + 40); M.npcs.push({ key: 'none', c, r, name: '镇妖碑', hidden: true, h: Math.round(H * .9), stele: 1, wander: false, talk: () => talk() }); }
  async function talk() {
    if (window.WYT && typeof WYT.enter === 'function') return WYT.enter();
    const f = F();
    if (!f.stele_seen) { f.stele_seen = 1;
      await narrate('潭边立着一块黑青石碑，碑首盘着一只螭，碑身刻满淡金的符文，正中三个古字——「萬妖塔」。一道裂纹从碑顶一直裂到碑座，缝里透出一点暗红的光。');
      await say('星旋', '小子，别伸手。这碑底下镇着一座塔，九层，一层比一层凶。'); await say('叶孤星', '塔在哪儿？'); await say('星旋', '碑就是门。等你骨头再硬一点，本神仙带你进去。'); return; }
    await narrate('碑缝里的红光一明一暗，像有什么东西在底下慢慢喘气。'); }
  if (typeof doInteract === 'function') doInteract = (orig => async function (h) { if (!(h && h.type === 'npc' && h.a && h.a.npc && h.a.npc.stele)) return orig.apply(this, arguments);
    world.locked = true; try { await talk(); } catch (e) { console.warn('R420 talk', e); } finally { world.locked = false; } })(doInteract);
  window.R420_STELE = { FX, FY, K, X, Y, W, H };
})();
