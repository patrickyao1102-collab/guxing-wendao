// ================= R366 · 醉仙楼大堂缩小、地板压暗、桌上坐满客人（作者 11-21）（只进测试版）=================
// 作者：「我说了把醉仙楼缩小啊，太大了，一进去很晃眼睛」；11-16 也说过醉仙楼要像云来、悦来那样桌桌坐着吃饭的人。
// 1）大堂从 1792×1280 砍到 1792×1040：抽掉第三排桌子那一条地板（y 920–1160），下面的台阶、墙边长凳整体往上挪 240；碰撞格同样抽掉那 30 行。
//    一进门整个大堂一屏看全，不用再往下滚。
// 2）浅白的地板压成暖木色（只压浅色、低饱和的地板像素，墙、柜、盆栽不动）——不再晃眼。
// 3）剩下两排八张桌子；坐着的客人交 Codex R368 照悦来（R277）的画法单做。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined' || !TMAPS.qy_tavern || !TMAPS.qy_tavern.baked) return;
  const M = TMAPS.qy_tavern, B0 = M.baked;
  if (B0.w !== 1792 || B0.h !== 1280) return;   // 地图换过就不动
  const Y0 = 920, Y1 = 1160, DY = Y1 - Y0;
  const B = M.baked = Object.assign({}, B0, { h: B0.h - DY, ground: 'r366g_tavern' });
  // 底表 objs 是和云来大堂共用的数组，先各自复制一份
  B.objs = (B0.objs || []).map(o => Object.assign({}, o)).filter(o => { const sy = o.sy != null ? o.sy : o.y + o.h; return !(sy > Y0 && sy <= Y1); });
  for (const o of B.objs) { const sy = o.sy != null ? o.sy : o.y + o.h; if (sy > Y1) { o.y -= DY; if (o.sy != null) o.sy -= DY; } }
  if (typeof B0.blocked === 'string' && B0.cols) { const cs = B0.cs, r0 = Math.round(Y0 / cs), r1 = Math.round(Y1 / cs);
    B.blocked = B0.blocked.slice(0, r0 * B0.cols) + B0.blocked.slice(r1 * B0.cols); B.rows = B0.rows - (r1 - r0); }
  const g = new Image(); g.onload = () => { try { IMG.r366g_tavern = g; } catch (e) {} try { if (window.MM_CLEAR) MM_CLEAR('qy_tavern'); } catch (e) {} }; g.src = 'r366/tavern_ground.webp?v=2';
  // 进门落脚点、出口跟着往上挪
  const cellDY = DY / 8;
  for (const e of M.exits || []) if (e.y > Y1 / 8) e.y -= cellDY;
  if (M.start) M.start = [M.start[0], M.start[1] - DY / 64];
  for (const k of Object.keys(TMAPS)) for (const d of (TMAPS[k].doors || []).concat(TMAPS[k].exits || [])) if (d && d.to === 'qy_tavern' && d.at) d.at = M.start;
  for (const n of M.npcs || []) if (n.r != null && (n.r + .8) * 64 > Y1) n.r -= DY / 64;
  // 桌上坐的客人：R230 那批「桌子和人画在一张图」的作者 11-13 否了（画风不符），这里不用；交 Codex R368 照 R277 悦来那批的画法给醉仙楼单做一套。
})();
