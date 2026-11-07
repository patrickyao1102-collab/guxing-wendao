// ================= R149 · 手机小字放大（作者 11-07：手机版问题梳理）=================
// 游戏按 1280×720 设计，到 iPhone 横屏整体缩到约 0.56 倍：14 号字只剩 8 磅左右，人名、任务栏、提示都看不清。
// 小屏（缩放 < 0.75）时，主画布上 18 号以下的字等比放大（最多放到 20），大字不动；电脑、平板不受影响。
// 只改主画布（离屏缓存画布照旧，免得预先算好尺寸的贴图被撑破）；量宽截断的地方用的是同一字号，会自动适应。
(function () {
  const C = CanvasRenderingContext2D.prototype, d = Object.getOwnPropertyDescriptor(C, 'font');
  if (!d || !d.set || typeof ctx === 'undefined') return;
  const main = ctx; let k = 1; const cache = new Map(), cache2 = new Map();
  const upd = () => { const s = typeof SCALE === 'number' ? SCALE : 1; const nk = s < .75 ? Math.min(1.3, .72 / s) : 1; if (nk !== k) { k = nk; cache.clear(); cache2.clear(); } };
  upd(); window.addEventListener('resize', () => setTimeout(upd, 0));
  // 作者 11-07：手机上看功法栏（技能页）字太小 → 技能页里小字再放大一档（最多 1.55 倍、上限 21 号）
  const skillTab = () => { try { return k > 1 && S.menu && typeof MTABS !== 'undefined' && MTABS[S.menu.tab] === '技能'; } catch (e) { return false; } };
  const boost = f => {
    if (k === 1) return f; const st = skillTab(), C = st ? cache2 : cache; let r = C.get(f); if (r !== undefined) return r;
    const kk = st ? Math.min(1.55, k * 1.22) : k, cap = st ? 21 : 20;
    r = f.replace(/(\d+(?:\.\d+)?)px/, (m, n) => { n = +n; return n >= 10 && n <= 18 ? Math.min(cap, Math.round(n * kk * 10) / 10) + 'px' : m; });
    if (C.size > 800) C.clear(); C.set(f, r); return r;
  };
  Object.defineProperty(C, 'font', { configurable: true, enumerable: d.enumerable, get: d.get,
    set(v) { d.set.call(this, this === main ? boost(String(v)) : v); } });
  window.GX_TEXT_BOOST = () => k;
})();
