// R100 林雪 / 云霆 · 天剑一式·点星：手前也出一个小六芒星阵（作者 11-03）
// 跟叶孤星点星手前那个小阵同一套原画（R68 星辰法阵四层图集）、同样的出现 / 收拢节奏，只换颜色：林雪冰蓝、云霆紫电。
// 做法：每帧把原画小阵画到一张小画布上，用 color 混合换色相（保留原画明暗），再叠到施法者手前。
(function () {
  const C = x => Math.max(0, Math.min(1, x)), E = (t, a, b) => { const q = C((t - a) / (b - a)); return q * q * (3 - 2 * q); }, L = (a, b, q) => a + (b - a) * q;
  const SZ = 256, off = document.createElement('canvas'), mask = document.createElement('canvas'); off.width = off.height = mask.width = mask.height = SZ;
  const og = off.getContext('2d'), mg = mask.getContext('2d');
  const COL = { b_linxue: 'rgb(110,196,255)', b_yunting: 'rgb(168,120,255)' };
  const GLOW = { b_linxue: '150,215,255', b_yunting: '190,160,255' };
  const LAUNCH = .84;
  let cache = null;
  function geo(P, T) {
    if (cache && cache.P === P && cache.T === T) return cache;
    let f = null, aim = null;
    try { const s = DX_RT.inspectDianxing(); f = s.finger; aim = s.aim; } catch (e) {}
    const k = (P.h || 240) / 240;
    if (!f) f = { x: P.x - 26, y: P.y - (P.h || 240) * .66 };
    if (!aim) aim = { x: T.x, y: T.y - T.h * .58 };
    const ang = Math.atan2(aim.y - f.y, aim.x - f.x), d = 52 * k;
    cache = { P, T, k, ang, f, gate: { x: f.x + Math.cos(ang) * d, y: f.y + Math.sin(ang) * d } };
    return cache;
  }
  function hex(c, z, P, T) {
    const M = window.R68Material; if (!M || !M.array || !P || !T) return;
    const col = COL[P.key]; if (!col) return;
    const a = E(z, .03, .19) * (1 - E(z, LAUNCH, LAUNCH + .10)); if (a <= .003) return;
    const g = geo(P, T), op = E(z, .04, .34), snap = 1 - .35 * E(z, .70, LAUNCH), s = g.k * 1.3;
    const rx = L(7, 26, op) * snap * s, ry = L(10, 57, op) * snap * s;
    og.setTransform(1, 0, 0, 1, 0, 0); og.globalCompositeOperation = 'source-over'; og.globalAlpha = 1; og.clearRect(0, 0, SZ, SZ);
    og.save(); og.translate(SZ / 2, SZ / 2); og.rotate(g.ang - Math.PI); M.array(og, z * 2.2, { x: 0, y: 0, rx, ry, a: a * .66 }); og.restore();
    mg.clearRect(0, 0, SZ, SZ); mg.drawImage(off, 0, 0);
    og.globalCompositeOperation = 'color'; og.fillStyle = col; og.fillRect(0, 0, SZ, SZ);
    og.globalCompositeOperation = 'destination-in'; og.drawImage(mask, 0, 0); og.globalCompositeOperation = 'source-over';
    c.save(); c.globalCompositeOperation = 'lighter'; c.drawImage(off, g.gate.x - SZ / 2, g.gate.y - SZ / 2); c.globalCompositeOperation = 'screen'; c.drawImage(off, g.gate.x - SZ / 2, g.gate.y - SZ / 2); c.restore();   // 换色后同亮度的蓝紫看着比金色暗，叠两遍补回来
    try { M.glow(c, g.gate.x, g.gate.y, 30 * g.k, 42 * g.k, a * .16, GLOW[P.key]); M.glow(c, g.f.x, g.f.y, 12 * g.k, 12 * g.k, a * .35, GLOW[P.key]); } catch (e) {}
  }
  (function wrap(n) {
    const R = window.DX_RT; if (!R || !R.rtDraw) { if ((n || 0) < 80) setTimeout(() => wrap((n || 0) + 1), 250); return; }
    if (R.__hex) return; R.__hex = 1; try { window.R68Material && R68Material.preload && R68Material.preload(); } catch (e) {} const od = R.rtDraw;
    R.rtDraw = function (z) { const r = od.apply(this, arguments); try { if (typeof ctx !== 'undefined') hex(ctx, z, window.DX_P, window.DX_T); } catch (e) {} return r; };
  })();
  window.DX_HEX = { draw: hex };
})();
