// ================= 剧情跳转（?part=…）闸门（作者 11-10：「资源没加载完毕不要露出来，我不怕时间长，就怕画面恶心」）=================
// 病根：各章的「剧情跳转」入口都是 setTimeout(…, 80) 就开演。网慢时 80 毫秒后后面一百多个脚本还没执行完——
//   载入插画、过图遮盖、新地图替换、等资源的闸门统统还没装上，于是地图空着、对话已经开始。
// 改法：带 ?part= 打开时，页面脚本全部执行完之前登记的短延时（≤ 300ms）一律先扣住；
//   等 ① 所有脚本执行完 ② 载入插画、字体、弹窗拆件等预载项全部到齐，再按原顺序放行。等待期间整屏盖一张插画，不露任何半成品。
(function () {
  let q = null; try { q = new URLSearchParams(location.search).get('part'); } catch (e) {}
  if (!q) return;
  const ST = window.setTimeout.bind(window), CT = window.clearTimeout.bind(window);
  const held = []; let seq = 0, open = false;
  window.setTimeout = function (fn, ms) { if (open || typeof fn !== 'function' || (ms || 0) > 300) return ST.apply(window, arguments);
    const args = Array.prototype.slice.call(arguments, 2), id = -(++seq); held.push({ id, fn, ms: ms || 0, args, n: seq }); return id; };
  window.clearTimeout = function (id) { if (typeof id === 'number' && id < 0) { const i = held.findIndex(h => h.id === id); if (i >= 0) held.splice(i, 1); return; } return CT(id); };
  // 整屏遮盖（DOM，不依赖游戏主循环）：跟着画布的位置走
  const cover = document.createElement('div');
  cover.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;background:#05060a;z-index:99999;overflow:hidden';
  const art = document.createElement('img'); art.style.cssText = 'position:absolute;object-fit:cover;opacity:0;transition:opacity .35s'; art.onload = () => { art.style.opacity = 1; }; art.src = 'r157/sel/NH01.webp';
  const tip = document.createElement('div'); tip.style.cssText = 'position:absolute;text-align:center;color:#f3e4c2;font:600 16px/1.4 serif;text-shadow:0 1px 4px #000,0 0 8px #000;letter-spacing:2px';
  cover.appendChild(art); cover.appendChild(tip);
  const mount = () => { if (cover.parentNode || !document.body) return; document.body.appendChild(cover); };
  const place = () => { mount(); const c = document.querySelector('canvas'), r = c && c.getBoundingClientRect(); const R = r && r.width > 10 ? r : { left: 0, top: 0, width: innerWidth, height: innerHeight };
    art.style.left = R.left + 'px'; art.style.top = R.top + 'px'; art.style.width = R.width + 'px'; art.style.height = R.height + 'px';
    tip.style.left = R.left + 'px'; tip.style.width = R.width + 'px'; tip.style.top = (R.top + R.height * .88) + 'px'; tip.style.fontSize = Math.max(12, R.width / 64) + 'px'; };
  let dom = document.readyState !== 'loading'; if (!dom) document.addEventListener('DOMContentLoaded', () => { dom = true; });
  const t0 = performance.now(); let okAt = 0;
  const pending = () => { try { return window.PRELOAD_PENDING ? PRELOAD_PENDING() : []; } catch (e) { return []; } };
  const tick = () => {
    place();
    const waited = performance.now() - t0, pd = pending();
    const artOk = !!(window.LOADING_ART_READY && LOADING_ART_READY());
    const ready = dom && !!window.LOADING_LAYER && ((artOk && !pd.length) || waited > 90000);
    tip.textContent = '正在准备剧情……' + (dom ? (pd.length ? '（还差 ' + pd.length + ' 项）' : '') : '');
    if (!ready) { okAt = 0; return ST(tick, 120); }
    if (!okAt) okAt = performance.now(); if (performance.now() - okAt < 300) return ST(tick, 60);   // 稳住 0.3 秒再放行（刚登记的预载项来得及报到）
    open = true; window.setTimeout = ST; window.clearTimeout = CT;
    held.sort((a, b) => a.ms - b.ms || a.n - b.n);
    for (const h of held.splice(0)) { try { h.fn.apply(window, h.args); } catch (e) { console.warn('part_gate', e); } }
    // 放行后：等游戏自己的黑幕 / 载入插画接手，再撤掉遮盖
    const s1 = performance.now(); const off = () => { let covered = false; try { covered = (typeof S !== 'undefined' && S.fade > .9) || (window.MAP_LOADING && typeof drawMap !== 'undefined' && S.scene === drawMap && MAP_LOADING()); } catch (e) {}
      if (!covered && performance.now() - s1 < 1500) return ST(off, 50);
      cover.style.transition = 'opacity .25s'; cover.style.opacity = 0; ST(() => { try { cover.remove(); } catch (e) {} }, 280); };
    ST(off, 350);
  };
  tick();
  window.PART_GATE = { get open() { return open; }, held };
})();
