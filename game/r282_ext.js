// ================= R282 · 「八方来」外观上地图（Codex R278 + 修订1）=================
// 青阳镇：悦来客栈换新外观（两层、屋顶紫铜云纹门环、「宿」字布幌会飘）。
// 玄天城：云来客栈换装（烟紫门帘、匾嵌门环、屋顶同款徽饰）；云来南边那排两开间铺面拆掉，盖醉仙楼（东侧「醉」字长幡会飘），
//         醉仙楼的门通原来的醉仙楼内景（qy_tavern），出门回玄天城。
// 素材都是 2 倍图，按 1 倍大小画，视网膜屏 / 手机上更清楚。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined' || !TMAPS.qy_town || !TMAPS.xt_city) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const load = (k, f) => { const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = 'r282/' + f; };
  load('r282_yuelai', 'yuelai.webp'); load('r282_zuixian', 'zuixian.webp'); load('r282_roof', 'roof_emblem.webp');
  // 会飘的旗：横条 6 帧，每帧 200ms
  const strip = (k, f, fw, fh) => { const fr = []; const im = new Image(); im.onload = () => { for (let i = 0; i < 6; i++) { const c = document.createElement('canvas'); c.width = fw; c.height = fh; c.getContext('2d').drawImage(im, i * fw, 0, fw, fh, 0, 0, fw, fh); fr.push(c); } }; im.src = 'r282/' + f;
    try { Object.defineProperty(IMG, k, { configurable: true, enumerable: true, set: () => {}, get: () => fr.length ? fr[Math.floor(performance.now() / 200) % 6] : undefined }); } catch (e) {} };
  strip('r282_yflag', 'yuelai_flag.webp', 120, 128); strip('r282_zbanner', 'zuixian_banner.webp', 80, 1040);

  // 换掉 / 拆掉物件时，把它们占的挡路格放开；新楼按图里不透明的地方，在楼脚那一条（门槛以上 110 像素内）重新挡上
  const rework = (m, kill, add, foot) => {
    const B = TMAPS[m].baked, cs = B.cs, cols = B.cols, rows = B.rows, bl = B.blocked.split('');
    const gone = B.objs.filter(kill), keep = B.objs.filter(o => !kill(o));
    const inBox = (o, x, y) => x >= o.x && x < o.x + o.w && y >= o.y && y < Math.max(o.y + o.h, o.sy || 0) + 8;
    for (const o of gone) for (let r = Math.max(0, Math.floor(o.y / cs)); r <= Math.floor(((o.sy || o.y + o.h) + 8) / cs) && r < rows; r++) for (let c = Math.max(0, Math.floor(o.x / cs)); c < Math.ceil((o.x + o.w) / cs) && c < cols; c++) {
      const x = c * cs + cs / 2, y = r * cs + cs / 2; if (!inBox(o, x, y) || keep.some(k => inBox(k, x, y))) continue; bl[r * cols + c] = '0'; }
    for (const [x0, x1, y0, y1] of foot || []) for (let r = Math.floor(y0 / cs); r < Math.ceil(y1 / cs) && r < rows; r++) for (let c = Math.floor(x0 / cs); c < Math.ceil(x1 / cs) && c < cols; c++) if (r >= 0 && c >= 0) bl[r * cols + c] = '1';
    B.objs = keep.concat(add); B.blocked = bl.join('');
    try { if (window.MM_CLEAR) MM_CLEAR(m); } catch (e) {}
  };

  // ---- 青阳镇 · 悦来客栈 ----（门洞底边中点对齐原来的门 (1792,1898)）
  { const X = 1792 - 210, Y = 1898 - 405;
    rework('qy_town', o => o.id === 'inn' || (o.id === 'lantern_pole' && ((Math.abs(o.x - 1613) < 3 && Math.abs(o.y - 1792) < 3) || (Math.abs(o.x - 1869) < 3 && Math.abs(o.y - 1792) < 3) || (Math.abs(o.x - 1645) < 3 && Math.abs(o.y - 1632) < 3))),
      [{ id: 'inn', uid: 'r282_yuelai', img: 'r282_yuelai', x: X, y: Y, w: 420, h: 420, sy: 1890, flip: false, noPre: true },
       { id: 'r282_yflag', uid: 'r282_yflag', img: 'r282_yflag', x: X + 350, y: Y + 255, w: 60, h: 64, sy: 1891, flip: false, noPre: true, noBlock: true }],
      [[X + 22, 1792 - 40, 1898 - 104, 1898 - 8], [1792 + 40, X + 398, 1898 - 104, 1898 - 8]]); }

  // ---- 玄天城 · 云来客栈换装 ----（同尺寸同门位，直接换图；屋顶另立徽饰）
  // 主图由 r228_ext.js 换（它每半秒核对一次图）；这里只在屋顶正中立徽饰（云来主图左上角 (721,1561)，徽饰在主图 (359,-65)）
  TMAPS.xt_city.baked.objs.push({ id: 'r282_roof', uid: 'r282_yunlai_roof', img: 'r282_roof', x: 1080, y: 1496, w: 80, h: 98, sy: 2113, flip: false, noPre: true, noBlock: true });

  // ---- 玄天城 · 醉仙楼 ----（拆掉云来南边的两开间铺面和楼后、门前那堆杂物）
  { const X = 1032, Y = 2224, DX = X + 260, DY = Y + 437;
    const K = [['xt_arcade_r18', 1032, 2258], ['handcart', 1252, 2288], ['bamboo', 1219, 2226], ['shrub', 1279, 2326], ['drying_rack', 1214, 2320], ['bamboo_fence', 1315, 2393], ['shrub', 1334, 2443], ['grass_clump_03', 1172, 2490], ['flowers_01', 1256, 2544], ['crate_stack', 1239, 2579], ['cargo_sacks', 1225, 2600]];
    rework('xt_city', o => K.some(([id, x, y]) => o.id === id && Math.abs(o.x - x) < 4 && Math.abs(o.y - y) < 4),
      [{ id: 'r282_zuixian', uid: 'r282_zuixian', img: 'r282_zuixian', x: X, y: Y, w: 560, h: 440, sy: DY, flip: false, noPre: true },
       { id: 'r282_zbanner', uid: 'r282_zbanner', img: 'r282_zbanner', x: X + 520, y: Y - 70, w: 40, h: 520, sy: DY + 4, flip: false, noPre: true, noBlock: true }],
      [[X + 24, DX - 44, DY - 110, DY - 6], [DX + 44, X + 540, DY - 110, DY - 6], [X + 530, X + 552, DY - 14, DY + 6]]);
    const out = P(DX, DY + 58);
    TMAPS.xt_city.doors.push({ x: DX, y: DY + 8, rw: 40, rh: 18, upOnly: true, to: 'qy_tavern', at: window.R278_TAVERN_AT || TMAPS.qy_tavern.start, face: 'up', label: '醉仙楼' });
    for (const e of TMAPS.qy_tavern.exits || []) if (e.to === 'qy_town') { e.to = 'xt_city'; e.at = out; e.label = '玄天城'; }
    TMAPS.qy_tavern.title = '醉仙楼';
  }
  window.R282 = 1;
})();
