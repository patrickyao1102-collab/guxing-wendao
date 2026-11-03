// R100 叶孤星对话立绘换成 R88「白袍正蓝」新版 10 种表情（作者 11-03：对话里还是老立绘）
// 平静→p_yegx，坚定→p_yegx2，其余 8 种→p_yegx_<表情>。只在默认服装「白袍正蓝」下生效；换回「原版劲装」就还原老立绘。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const K = ['calm', 'firm', 'smile', 'grin', 'laugh', 'wry', 'surprise', 'angry', 'hurt', 'think'], CW = 781, CH = 900, COLS = 5;
  const KEY = k => k === 'calm' ? 'p_yegx' : k === 'firm' ? 'p_yegx2' : 'p_yegx_' + k;
  // 11-04：另外四套换装也各有 10 种表情（R88），跟着换装走；原版劲装用老立绘
  const SHEET = { baipao: 'fc7390b8eba18d8e0c3b4802d298aba8', heiyao: 'f8d6978d57f279962231897c1f7cbed4', jiaoling: 'a6279fa5ea379297ace3c51a10596654', guxing: '85d11a31df89f1ac96d845932f0d2069', tianjian: '5c96d9eb74d9c742bb9137e588568a31' };
  const SETS = {}, OLD = {}; let NEW = {}, ready = false;
  const outfit = () => { try { return window.YEGX_OUTFIT ? YEGX_OUTFIT.get() : 'baipao'; } catch (e) { return 'baipao'; } };
  const loadSet = id => { if (SETS[id]) return SETS[id]; const set = SETS[id] = { ok: false, c: {} }; const im = new Image();
    im.onload = () => { K.forEach((k, i) => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; c.getContext('2d').drawImage(im, (i % COLS) * CW, Math.floor(i / COLS) * CH, CW, CH, 0, 0, CW, CH); c.__r100 = 1; set.c[KEY(k)] = c; }); set.ok = true; enforce(); };
    im.src = LOC ? 'r100p/yegx_' + id + '_expr.webp' : '/_blob/' + SHEET[id]; return set; };
  loadSet('baipao');
  const on = () => !!SHEET[outfit()];
  // 新图脸的位置和老图不同：战斗头像圆框按脸取景
  const FACE_OLD = {}, FACE_NEW = { fx: .60, fy: .30, span: .34 };
  function enforce() {
    if (typeof IMG === 'undefined') return;
    const id = outfit(); if (SHEET[id]) { const set = loadSet(id); if (set.ok) { NEW = set.c; ready = true; } }
    if (!ready) return;
    const use = on() && SETS[id] && SETS[id].ok;
    for (const k of K.map(KEY)) {
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
