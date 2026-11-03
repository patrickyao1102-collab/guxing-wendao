// R104 获得宝物的音效（作者 11-03：候选 1 编钟一响 / 2 灵光上扬接编钟 / 5 光罩风铃「都可以当宝物」）
// 以前获得宝物放的是 jingle_levelup（清光升的开头），作者三次都说难听。现在：
//   凡是「获得 / 打开宝箱 / 宝物 / 神器 / 宝库 / 坐骑」这类面板弹出时，从三个宝光音效里随机放一个（不连着重复）；
//   同一刻原本要放的 jingle_levelup 自动让掉，不会两个叠在一起。升级、突破、章节结束、领悟技能仍是原来的。
(function () {
  if (typeof playSnd !== 'function' || typeof showPanel !== 'function') return;
  const BX = ['jingle_bx1', 'jingle_bx2', 'jingle_bx5'];
  const TRE = /获得|宝箱|宝物|神器|宝库|坐骑|赠/;
  const _ps = playSnd; let last = -1, tAt = -1e9, pend = null;
  function playTreasure() {
    let i = Math.floor(Math.random() * BX.length); if (i === last) i = (i + 1 + Math.floor(Math.random() * (BX.length - 1))) % BX.length;
    last = i; tAt = performance.now(); if (pend) { clearTimeout(pend); pend = null; }
    _ps(BX[i], 1);
  }
  window.playTreasure = playTreasure;
  // jingle_levelup 晚一拍再放：如果紧接着弹出的是获得宝物的面板，就让给宝光音效
  playSnd = function (n, ...a) {
    if (n === 'jingle_levelup') {
      if (performance.now() - tAt < 600) return;
      if (pend) clearTimeout(pend);
      pend = setTimeout(() => { pend = null; if (performance.now() - tAt > 600) _ps(n, ...a); }, 0);
      return;
    }
    return _ps.call(this, n, ...a);
  };
  showPanel = (o => function (title) { try { if (TRE.test(String(title || ''))) playTreasure(); } catch (e) {} return o.apply(this, arguments); })(showPanel);
  if (typeof window.itemGet === 'function') window.itemGet = (o => function (items, title) { try { playTreasure(); } catch (e) {} return o.apply(this, arguments); })(window.itemGet);
})();
