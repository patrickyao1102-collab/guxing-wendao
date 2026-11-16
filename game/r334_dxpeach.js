// ================= R334 · 支线「东厢朝南」完美结局尾声：第二年开春，桃花树下（作者 11-16 定稿的 22 秒动画）（只进测试版）=================
// 作者 11-16：「你可以把这个接入我们之前预设的动画里面，就是支线做完的时候」。
// 片子：小云雀（Seedance）做的 V2/V3 精选剪辑版，22 秒，1280×720，带原声。放在 r334/dx_peach.mp4。
// 时机：结局一「东厢朝南」——中秋夜、第二天碾药之后，领奖励之前；先黑场打字幕「第二年 · 开春」，再整屏放片子。
// 放片子时先停 BGM，放完再接回；能出声就出声，浏览器不让出声就静音放；放不出来就跳过，不卡剧情。右下角可「跳过」。
(function () {
  const SRC = 'r334/dx_peach.mp4?v=1';
  let pre = null;   // 支线走到中秋夜就先把片子拉下来，到时候不用等
  const preload = () => { if (pre) return; try { pre = document.createElement('link'); pre.rel = 'preload'; pre.as = 'video'; pre.href = SRC; document.head.appendChild(pre); } catch (e) {} };
  const play = () => new Promise(res => {
    let done = false, box = null, v = null, timer = 0;
    const end = () => { if (done) return; done = true; clearTimeout(timer);
      try { v && v.pause(); } catch (e) {}
      try { box && box.remove(); } catch (e) {}
      res(); };
    try {
      box = document.createElement('div');
      box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .6s';
      v = document.createElement('video');
      v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.playsInline = true; v.preload = 'auto'; v.src = SRC;
      v.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000';
      const skip = document.createElement('div'); skip.textContent = '跳过 ›';
      skip.style.cssText = 'position:absolute;right:max(18px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));padding:6px 14px;border-radius:16px;font:600 15px/1.4 serif;color:#f3e2b8;background:rgba(0,0,0,.45);border:1px solid rgba(243,226,184,.35);cursor:pointer;opacity:0;transition:opacity .4s;user-select:none';
      box.appendChild(v); box.appendChild(skip); document.body.appendChild(box);
      requestAnimationFrame(() => { box.style.opacity = '1'; });
      setTimeout(() => { skip.style.opacity = '1'; }, 1500);   // 一开始别让人手快点掉
      skip.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); end(); });
      v.addEventListener('ended', () => { box.style.opacity = '0'; setTimeout(end, 600); });
      v.addEventListener('error', end);
      timer = setTimeout(end, 40000);   // 网络太慢也别卡死
      const p = v.play();
      if (p && p.catch) p.catch(() => { v.muted = true; const p2 = v.play(); if (p2 && p2.catch) p2.catch(end); });
    } catch (e) { end(); }
  });
  window.R334_PEACH = async function () {
    try { await fadeOut(600); } catch (e) {}
    try { await caption('第二年 · 开春', 2000); } catch (e) {}
    const h0 = S.hud; S.hud = false;
    try { window.BGM29 && BGM29.stop(); } catch (e) {}
    try { await play(); } catch (e) {}
    S.hud = h0;
    try { window.BGM29 && BGM29.resume(); } catch (e) {}
    try { await fadeIn(600); } catch (e) {}
  };
  // 中秋夜开始时预载（F().dx_night 置 1 的时候）；进游戏后每隔一会儿看一眼，便宜
  setInterval(() => { try { if (S && S.flags && S.flags.dx_night) preload(); } catch (e) {} }, 3000);
})();
