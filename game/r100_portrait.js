// R100 叶孤星对话立绘换成 R88「白袍正蓝」新版 10 种表情（作者 11-03：对话里还是老立绘）
// 平静→p_yegx，坚定→p_yegx2，其余 8 种→p_yegx_<表情>。只在默认服装「白袍正蓝」下生效；换回「原版劲装」就还原老立绘。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const K = ['calm', 'firm', 'smile', 'grin', 'laugh', 'wry', 'surprise', 'angry', 'hurt', 'think'], CW = 781, CH = 900, COLS = 5;
  const KEY = k => k === 'calm' ? 'p_yegx' : k === 'firm' ? 'p_yegx2' : 'p_yegx_' + k;
  const NEW = {}, OLD = {};
  let ready = false;
  const im = new Image();
  im.onload = () => { K.forEach((k, i) => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; c.getContext('2d').drawImage(im, (i % COLS) * CW, Math.floor(i / COLS) * CH, CW, CH, 0, 0, CW, CH); c.__r100 = 1; NEW[KEY(k)] = c; }); ready = true; enforce(); };
  im.src = LOC ? 'r100p/yegx_baipao_expr.webp' : '/_blob/fc7390b8eba18d8e0c3b4802d298aba8';
  const on = () => { try { return !window.YEGX_OUTFIT || YEGX_OUTFIT.get() === 'baipao'; } catch (e) { return true; } };
  // 新图脸的位置和老图不同：战斗头像圆框按脸取景
  const FACE_OLD = {}, FACE_NEW = { fx: .60, fy: .30, span: .34 };
  function enforce() {
    if (!ready || typeof IMG === 'undefined') return;
    const use = on();
    for (const k in NEW) {
      const cur = IMG[k];
      if (cur && !cur.__r100) OLD[k] = cur;            // 老立绘（异步载入后会写进 IMG）记下来，换回原版时用
      const want = use ? NEW[k] : OLD[k];
      if (want && IMG[k] !== want) IMG[k] = want;
    }
    try { if (typeof MEDAL_FACE !== 'undefined') for (const k of ['p_yegx', 'p_yegx2']) { if (!FACE_OLD[k] && MEDAL_FACE[k]) FACE_OLD[k] = Object.assign({}, MEDAL_FACE[k]); MEDAL_FACE[k] = use ? FACE_NEW : (FACE_OLD[k] || MEDAL_FACE[k]); } } catch (e) {}
  }
  setInterval(enforce, 700);
  window.R100_PORTRAIT = { enforce, get ready() { return ready; } };
})();
