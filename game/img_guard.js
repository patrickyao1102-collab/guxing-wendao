// ================= 图片载入守卫（最先加载）=================
// 1) 任何图片下载失败，自动重试（最多 5 次，间隔递增），不会因为一次网络抖动就缺图黑屏。
// 2) 大型技能特效图集（太阳 / 光明 / 黑暗 / 日月 / 时空 / 杀星等）排在后面：
//    地图正在载入时先不下载它们，等地图素材到齐再放行，最多同时下 2 张——手机网速有限时，先保证地图。
(function () {
  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (!desc || !desc.set) return;
  const HEAVY = /(^|\/)(sun_assets|skx_assets|ryx_assets|hax_assets|ha_assets|gmx_assets|sx_assets|cxfx|lc_cine)\//;
  const G = window.IMG_GUARD = { pending: 0, heavyQ: [], heavyActive: 0, hold: () => !!(window.MAP_LOADING && MAP_LOADING()), fails: 0 };
  function realSet(im, v) { desc.set.call(im, v); }
  function track(im, v, tries) {
    G.pending++;
    const done = ok => { im.removeEventListener('load', onL); im.removeEventListener('error', onE); G.pending--; if (im.__heavy) { G.heavyActive--; pump(); } if (!ok) G.fails++; };
    const onL = () => done(true);
    const onE = () => { if (tries < 5) { done(true); setTimeout(() => { const u = v + (v.includes('?') ? '&' : '?') + 'retry=' + (tries + 1); track(im, v, tries + 1); realSet(im, u); }, 400 * (tries + 1)); } else done(false); };
    im.addEventListener('load', onL); im.addEventListener('error', onE);
  }
  function start(im, v) { track(im, v, 0); realSet(im, v); }
  function pump() {
    while (G.heavyQ.length && G.heavyActive < 2 && !G.hold()) { const [im, v] = G.heavyQ.shift(); im.__heavy = true; G.heavyActive++; start(im, v); }
  }
  setInterval(pump, 250);
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, enumerable: desc.enumerable,
    get() { return desc.get.call(this); },
    set(v) {
      v = String(v);
      if (/^(data:|blob:)/.test(v)) return realSet(this, v);
      if (HEAVY.test(v)) { G.heavyQ.push([this, v]); pump(); return; }
      start(this, v);
    },
  });
})();
