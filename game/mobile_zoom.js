// ================= 手机上整体放大一点（作者 11-15 真机：「在手机上看人物有点太小了，整体感官有点晃眼，要不要所有都放大一点点」）=================
// 只在手机（触屏、屏幕短边小于 700）上生效：地图和人物一起放大 15%，人和家具、房子的比例不变，只是镜头近一点。平板、电脑不变。
(function () {
  if (typeof VZ !== 'function' || typeof CZ !== 'function') return;
  const phone = (() => { try { const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0; return (touch && Math.min(screen.width, screen.height) < 700) || /[?&]phone=1/.test(location.search); } catch (e) { return false; } })();
  if (!phone) return;
  const K = 1.15;
  VZ = (o => function () { return o.apply(this, arguments) * K; })(VZ);
  CZ = (o => function () { return o.apply(this, arguments) * K; })(CZ);
  window.MOBILE_ZOOM = K;
})();
