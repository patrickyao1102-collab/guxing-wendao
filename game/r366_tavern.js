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
  // 桌上坐的客人：Codex R368（照 R277 悦来 / R277b 云来的画法，整桌连人 6 帧 240ms）：
  //   1 镖师划拳、2 散修敬酒、3 醉卧拍背、4 老客独酌、5 少年拍桌、8 掌柜算酒账；6、7 号（门口中间过道两张）空着。
  //   每组 256×256 一帧（@2x 512），按原桌子的左上换成整组图，按原桌底边排前后；人坐的地方补挡路。
  const T368 = [[1, 167, 497, 144, 421, 665, [[184, 585, 30, 20], [327, 585, 30, 20]]], [2, 541, 503, 519, 427, 671, [[562, 598, 30, 20], [700, 598, 30, 20]]],
    [3, 1051, 497, 1029, 421, 665, [[1092, 575, 30, 20], [1164, 542, 30, 20]]], [4, 1429, 503, 1407, 427, 671, [[1456, 593, 30, 20], [1586, 594, 30, 20]]],
    [5, 167, 730, 144, 654, 898, [[195, 818, 30, 20], [265, 753, 30, 20], [321, 818, 30, 20]]], [8, 1429, 730, 1407, 654, 898, [[1456, 810, 30, 20], [1584, 811, 30, 20]]]];
  const FR = {};
  const key = (n, ph) => { const id = 'r368_t' + n; if (!Object.getOwnPropertyDescriptor(IMG, id))
      try { Object.defineProperty(IMG, id, { configurable: true, enumerable: true, set: () => {}, get: () => { const a = FR[n]; return a ? a[(Math.floor(performance.now() / 240) + ph) % 6] : undefined; } }); } catch (e) {}
    return id; };
  const load = n => { const im = new Image(); im.onload = () => { const a = []; for (let i = 0; i < 6; i++) { const c = document.createElement('canvas'); c.width = 512; c.height = 512; c.getContext('2d').drawImage(im, i * 512, 0, 512, 512, 0, 0, 512, 512); a.push(c); } FR[n] = a; }; im.src = 'r366/table' + n + '.webp?v=1'; };
  const setBlock = (x0, y0, w, h) => { try { const cs = B.cs, a = B.blocked.split(''); for (let r = Math.floor(y0 / cs); r < Math.ceil((y0 + h) / cs); r++) for (let c = Math.floor(x0 / cs); c < Math.ceil((x0 + w) / cs); c++) if (r >= 0 && c >= 0 && r < B.rows && c < B.cols) a[r * B.cols + c] = '1'; B.blocked = a.join(''); } catch (e) {} };
  T368.forEach(([n, ox, oy, fx, fy, gy, feet], i) => {
    const o = B.objs.find(q => /^dining/.test(q.id || '') && Math.abs(q.x - ox) < 3 && Math.abs(q.y - oy) < 3); if (!o) return;
    load(n); Object.assign(o, { id: 'r368_t' + n, uid: 'r368_t' + n, img: key(n, i * 2 % 6), x: fx, y: fy, w: 256, h: 256, sy: gy, flat: false, noPre: true });
    for (const f of feet) setBlock(...f); });
})();
