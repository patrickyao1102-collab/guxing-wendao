// ================= R147 · 大特效图集切块（手机放追魂 / 星罗卡顿）=================
// 追魂、星罗、天枢、绝影共用的 cxfx/yg.webp 是 8580×6304（解码后 206MB），sl / jt 也超过 4096 宽。
// 手机浏览器处理这种超大图很吃力：首次使用要整张解码，内存紧张时被回收又要重新解码 → 放技能时一顿一顿。
// 这里离线把三张图按帧带切块、重新装箱成 ≤4096 的几张（yg 只剩约 109MB），进战斗时提前解码成常驻位图；
// 特效代码不动：它仍按原大图坐标切帧，drawImage 在这一层换算到对应的块上，画面一模一样。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const TILES = {"yg":{"W":8580,"H":6304,"sheets":["cxfx/t/yg_0.webp","cxfx/t/yg_1.webp"],"map":[[0,0,3980,215,1,0,1711],[3980,0,796,215,0,2978,3311],[0,217,3980,333,1,0,392],[3980,217,796,333,0,2722,2024],[0,552,2688,398,0,0,2911],[0,952,3840,390,1,0,0],[3840,952,768,390,0,3282,0],[0,1344,550,525,0,104,0],[0,1871,102,660,0,0,0],[0,2533,4023,453,0,0,662],[4023,2533,1341,453,0,656,0],[0,2988,2976,398,0,0,3311],[0,3388,3980,143,1,0,2296],[3980,3388,796,143,1,1957,1490],[0,3533,3879,254,1,0,1013],[3879,3533,1293,254,0,2690,2911],[0,3789,4077,450,0,0,1572],[4077,3789,1359,450,0,0,2024],[0,4241,3960,182,1,0,1928],[3960,4241,3960,182,1,0,2112],[7920,4241,660,182,1,1295,1490],[0,4425,4077,433,0,0,2476],[4077,4425,1359,433,0,1361,2024],[0,4860,3843,453,0,0,1117],[3843,4860,1281,453,0,1999,0],[0,5315,3879,219,1,0,1269],[3879,5315,1293,219,1,0,1490],[0,5536,3800,135,1,0,2441],[3800,5536,1900,135,1,0,2578],[0,5673,3800,284,1,0,727],[3800,5673,1900,284,0,1802,3711],[0,5959,1800,343,0,0,3711]]},"sl":{"W":7140,"H":3580,"sheets":["cxfx/t/sl_0.webp","cxfx/t/sl_1.webp"],"map":[[0,0,4030,208,0,0,3661],[4030,0,806,208,0,0,3871],[0,210,4015,334,0,0,1932],[4015,210,365,334,0,3040,411],[0,546,190,38,0,3742,0],[0,586,3570,247,0,0,3163],[3570,586,3570,247,0,0,3412],[0,835,4030,113,1,0,198],[4030,835,806,113,1,0,313],[0,950,3790,367,0,0,1208],[3790,950,758,367,0,1520,411],[0,1319,3790,353,0,0,1577],[3790,1319,758,353,0,2280,411],[0,1674,3913,196,1,0,0],[3913,1674,2795,196,0,808,3871],[0,1872,3570,291,0,0,2577],[3570,1872,3570,291,0,0,2870],[0,2165,3740,409,0,0,0],[3740,2165,748,409,0,0,411],[0,2576,1842,307,0,0,2268],[0,2885,1842,307,0,1844,2268],[0,3194,3840,384,0,0,822],[3840,3194,768,384,0,750,411]]},"jt":{"W":6288,"H":2625,"sheets":["cxfx/t/jt_0.webp"],"map":[[0,0,3744,109,0,0,3013],[0,111,1664,265,0,1942,1233],[0,378,3632,221,0,0,1570],[0,601,3971,118,0,0,2773],[3971,601,1805,118,0,0,2893],[0,721,3232,141,0,0,2509],[0,864,3376,47,0,0,3124],[0,913,3248,119,0,0,2652],[0,1034,3192,446,0,0,0],[0,1482,3668,186,0,0,1793],[3668,1482,2620,186,0,0,1981],[0,1670,3668,168,0,0,2169],[3668,1670,2620,168,0,0,2339],[0,1840,3880,335,0,0,896],[3880,1840,1940,335,0,0,1233],[0,2177,3552,446,0,0,448]]}};
  const BLOB = window.CXFX_TILE_BLOB || {"cxfx/t/yg_0.webp":"42984b88e5916c373d7993959d819ac4","cxfx/t/yg_1.webp":"76eda9daee6830bf1b788b08f1083b69","cxfx/t/sl_0.webp":"a88e0af9a6de238d3b7454df8fa516c3","cxfx/t/sl_1.webp":"8ad5f3d6ec4acd94c4cc3f94734d2ff3","cxfx/t/jt_0.webp":"2a6bb35b66a968df3af44c11a1f472ba"};   // 线上版：切块存在素材库（/_blob/）；手机 App / 本地读 cxfx/t/ 原文件
  const VIRT = new WeakMap();
  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (!desc || !desc.set) return;
  const od = CanvasRenderingContext2D.prototype.drawImage;

  function loadSheet(p) {
    return new Promise(res => {
      const im = new Image(); im.onload = async () => {
        try { if (window.createImageBitmap) { res(await createImageBitmap(im)); return; } } catch (e) {}
        try { await im.decode(); } catch (e) {} res(im);
      }; im.onerror = () => res(null);
      im.src = LOC ? p : (BLOB[p] ? '/_blob/' + BLOB[p] : p);
    });
  }
  async function virtualLoad(img, id) {
    const T = TILES[id], sheets = [];
    for (const p of T.sheets) { const s = await loadSheet(p); if (!s) { fail(img, id); return; } sheets.push(s); }   // 一张张来，内存峰值低
    VIRT.set(img, { T, sheets });
    try { Object.defineProperty(img, 'naturalWidth', { value: T.W }); Object.defineProperty(img, 'naturalHeight', { value: T.H }); Object.defineProperty(img, 'width', { value: T.W }); Object.defineProperty(img, 'height', { value: T.H }); Object.defineProperty(img, 'complete', { value: true }); } catch (e) {}
    try { img.onload && img.onload({ type: 'load', target: img }); } catch (e) { (window.__gameErrs || []).push('cxfx tiles ' + id + ': ' + e.message); }
  }
  // 切块读失败（极少见）：退回整张原图
  function fail(img, id) { desc.set.call(img, 'cxfx/' + id + '.webp'); }

  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, enumerable: desc.enumerable, get: desc.get,
    set(v) { const m = /(?:^|\/)cxfx\/(yg|sl|jt)\.webp(?:\?.*)?$/.exec(String(v)); if (m && TILES[m[1]] && !this.__cxfxRaw) { this.__cxfxRaw = 1; virtualLoad(this, m[1]); return; } desc.set.call(this, v); },
  });

  CanvasRenderingContext2D.prototype.drawImage = function (img) {
    const V = img && VIRT.get(img); if (!V) return od.apply(this, arguments);
    if (arguments.length !== 9) return;   // 只有「从大图里切一块」这一种用法
    let [, sx, sy, sw, sh, dx, dy, dw, dh] = arguments;
    const M = V.T.map;
    for (let i = 0; i < M.length; i++) { const c = M[i];
      if (sx >= c[0] - .5 && sx < c[0] + c[2] && sy >= c[1] - .5 && sy < c[1] + c[3]) {
        // 不越出这一块（块与块之间隔 2px，越界会切到邻居）；越界部分按比例裁掉
        let x0 = Math.max(sx, c[0]), y0 = Math.max(sy, c[1]), x1 = Math.min(sx + sw, c[0] + c[2]), y1 = Math.min(sy + sh, c[1] + c[3]);
        if (x1 <= x0 || y1 <= y0) return;
        const kx = dw / sw, ky = dh / sh;
        return od.call(this, V.sheets[c[4]], c[5] + x0 - c[0], c[6] + y0 - c[1], x1 - x0, y1 - y0, dx + (x0 - sx) * kx, dy + (y0 - sy) * ky, (x1 - x0) * kx, (y1 - y0) * ky);
      } }
  };
  window.CXFX_TILES = TILES;
})();
