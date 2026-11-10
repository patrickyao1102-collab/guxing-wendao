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
  const art = document.createElement('img'); art.style.cssText = 'position:absolute;object-fit:fill;opacity:0;transition:opacity .35s'; art.onload = () => { art.style.opacity = 1; }; art.src = 'r157/sel/NH01.webp';
  const tip = document.createElement('div'); tip.style.cssText = 'position:absolute;text-align:center;color:#f3e4c2;font:600 16px/1.4 serif;text-shadow:0 1px 4px #000,0 0 8px #000;letter-spacing:2px';
  // 作者 11-10：「进度条怎么没有了」——和游戏载入画面同一套 R157 黑金进度条（轨道 + 金色填充 + 百分比）
  const bar = document.createElement('div'), track = document.createElement('img'), fillBox = document.createElement('div'), fill = document.createElement('div'), pct = document.createElement('div');
  bar.style.cssText = 'position:absolute'; track.src = 'r157/progress/track.webp'; track.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
  fillBox.style.cssText = 'position:absolute;overflow:hidden'; fill.style.cssText = 'height:100%;width:0;background:url(r157/progress/fill_mid.webp) repeat-x;background-size:auto 100%;border-radius:4px;box-shadow:0 0 8px rgba(255,214,140,.6);transition:width .3s';
  pct.style.cssText = 'position:absolute;text-align:right;color:rgba(243,228,194,.85);font:600 14px serif';
  fillBox.appendChild(fill); bar.appendChild(track); bar.appendChild(fillBox);
  cover.appendChild(art); cover.appendChild(tip); cover.appendChild(bar); cover.appendChild(pct);
  let maxPd = 1, prog = 0;
  const mount = () => { if (cover.parentNode || !document.body) return; document.body.appendChild(cover); };
  const place = () => { mount(); const c = document.querySelector('canvas'), r = c && c.getBoundingClientRect();
    let R = r && r.width > 10 && r.height > 10 ? r : null;
    if (!R) { const k = Math.min(innerWidth / 1280, innerHeight / 720); R = { width: 1280 * k, height: 720 * k }; R.left = (innerWidth - R.width) / 2; R.top = (innerHeight - R.height) / 2; }   // 画布还没排好版：照游戏的 16:9 留边，不铺满整个窗口（以前插画被裁得只剩一截）
    const sx = R.width / 1280, sy = R.height / 720;
    Object.assign(bar.style, { left: R.left + 160 * sx + 'px', top: R.top + 648 * sy + 'px', width: 960 * sx + 'px', height: 34 * sy + 'px' });
    Object.assign(fillBox.style, { left: 38 * sx + 'px', top: 13 * sy + 'px', width: 884 * sx + 'px', height: 8 * sy + 'px' });
    Object.assign(pct.style, { left: R.left + 900 * sx + 'px', top: R.top + 688 * sy + 'px', width: 214 * sx + 'px', fontSize: Math.max(11, 16 * sx) + 'px' });
    art.style.left = R.left + 'px'; art.style.top = R.top + 'px'; art.style.width = R.width + 'px'; art.style.height = R.height + 'px';
    tip.style.left = R.left + 'px'; tip.style.width = R.width + 'px'; tip.style.top = (R.top + 600 * sy) + 'px'; tip.style.fontSize = Math.max(12, R.width / 64) + 'px'; };
  let dom = document.readyState !== 'loading'; if (!dom) document.addEventListener('DOMContentLoaded', () => { dom = true; });
  const t0 = performance.now(); let okAt = 0;
  const pending = () => { try { return window.PRELOAD_PENDING ? PRELOAD_PENDING() : []; } catch (e) { return []; } };
  const tick = () => {
    place();
    const waited = performance.now() - t0, pd = pending();
    const artOk = !!(window.LOADING_ART_READY && LOADING_ART_READY());
    const ready = dom && !!window.LOADING_LAYER && ((artOk && !pd.length) || waited > 90000);
    tip.textContent = '正在准备剧情……';
    maxPd = Math.max(maxPd, pd.length); const want = !dom ? Math.min(.25, waited / 40000) : ready ? 1 : .3 + .65 * (1 - pd.length / maxPd) * (artOk ? 1 : .8);
    prog = Math.max(prog, Math.min(.97, want) + (ready ? .03 : 0)); fill.style.width = (prog * 100) + '%'; pct.textContent = Math.round(prog * 100) + '%';
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
