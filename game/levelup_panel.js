// ================= 作者 11-07：等级提升换成 Codex 定稿「金色海棠云窗」=================
// 拆件在 lvp/（2x 透明 PNG→webp，坐标按 layout.json 的 1x 逻辑坐标）：背后八剑扇阵（慢摆 + 加色辉光）、海棠金框（上段 + 每行中段平铺 + 下段）、
// 角色 Q 版坐在框顶、空题签上代码写「等级 提升」。人名、Lv、五项属性 旧值→新值 +差值、按钮「确定」全部由代码画。
(function () {
  if (typeof levelUpShow !== 'function' || typeof gainExp !== 'function') return;
  const K = ['frame_top', 'frame_body_tile', 'frame_bottom', 'row_divider', 'sword_fan', 'title_blank', 'button_normal', 'button_pressed', 'portrait_hero', 'portrait_linxue', 'portrait_luochen', 'portrait_shenle', 'portrait_yunting'], A = {};
  K.forEach(k => { const im = new Image(); im.onload = () => { A[k] = im; }; im.src = (/^(frame_top|frame_body_tile|frame_bottom|row_divider)$/.test(k) ? 'lvpd/' : 'lvp/') + k + '.webp'; });   // 作者 11-08：系统弹窗定黑金（框体纸面改墨黑，Codex R160 黑金拆件交付后换正式版）
  const ready = () => K.every(k => A[k]);
  const SZ = { frame_top: [644, 160], frame_body_tile: [644, 37], frame_bottom: [644, 143], row_divider: [468, 4], sword_fan: [560, 190], title_blank: [420, 80], button_normal: [248, 62], button_pressed: [248, 62],
    portrait_hero: [155, 190], portrait_linxue: [201, 190], portrait_luochen: [185, 190], portrait_shenle: [184, 184], portrait_yunting: [162, 192] };
  const NAME = { hero: '叶孤星', linxue: '林雪', luochen: '洛尘', shenle: '神乐', yunting: '云霆' };
  const NUM = '"Times New Roman","Noto Serif SC",serif';
  const STATS = [['maxhp', '气血'], ['maxmp', '灵力'], ['atk', '攻击'], ['def', '防御'], ['spd', '身法']];
  const snap = () => { const h = S.hero || {}; const o = {}; STATS.forEach(([k]) => o[k] = Math.round(h[k] || 0)); return o; };

  // 升级前先记下属性（levelUpShow 是在 gainExp 之后调用的）
  let before = null;
  gainExp = (o => function () { const b = snap(), lv = S.hero && S.hero.lv, r = o.apply(this, arguments); if (r) before = { lv, s: b }; return r; })(gainExp);

  let P = null; window.LVP_OPEN = () => !!P;
  const draw = (c, k = 1) => {
    const now = performance.now(), t = (now - P.t0) / 1000, e = 1 - Math.pow(1 - Math.min(1, t / .28), 3);
    const n = P.rows.length, bottomY = 364 + 37 * n, btnY = 588 + 37 * (n - 5);
    const img = (key, x, y) => { const [w, h] = SZ[key]; c.drawImage(A[key], x, y, w, h); };
    const txt = (v, x, y, font, color, align = 'center') => { c.font = font; c.fillStyle = color; c.textAlign = align; c.textBaseline = 'alphabetic'; const m = c.measureText(String(v)); c.fillText(String(v), x, y + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2); };
    const arrow = (x, y, w, h, col, lw) => { c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.stroke(); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2 - h * .6, y - h / 2); c.lineTo(x + w / 2 - h * .44, y); c.lineTo(x + w / 2 - h * .6, y + h / 2); c.closePath(); c.fill(); };
    c.save();
    c.globalAlpha = .55 * e; c.fillStyle = '#05070d'; c.fillRect(0, 0, W, H); c.globalAlpha = e;
    // 整体：从下方轻轻浮上来 + 微缩放（6 行时整体略缩，放得进一屏）
    const fit = Math.min(1, (H - 12) / (bottomY + 143 - 6 + 6));
    c.translate(640, 6); c.scale(fit * (.95 + .05 * e), fit * (.95 + .05 * e)); c.translate(-640, -6 + (1 - e) * 20);
    // 剑阵：慢摆 ±3°，后面再叠一层加色辉光
    const ang = Math.sin(now / 1400) * 3 * Math.PI / 180, glow = .35 + .25 * Math.sin(now / 520);
    c.save(); c.translate(640, 255); c.rotate(ang); c.translate(-640, -255); img('sword_fan', 360, 65);
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = e * glow; c.filter = 'blur(4px)'; img('sword_fan', 360, 65); c.restore();
    c.globalAlpha = e;
    img('frame_top', 318, 204);
    for (let i = 0; i < n; i++) img('frame_body_tile', 318, 364 + 37 * i);
    img('frame_bottom', 318, bottomY);
    for (let i = 0; i < n; i++) img('row_divider', 406, 384.5 + 37 * i + 16);
    img(P.pressed ? 'button_pressed' : 'button_normal', 516, btnY);
    const pk = 'portrait_' + P.who, [pw, ph] = SZ[pk], bob = Math.sin(now / 700) * 2;
    c.drawImage(A[pk], 640 - pw / 2, 264 - ph + bob, pw, ph);
    img('title_blank', 430, 6);
    txt(P.title.slice(0, 2), 580, 44, `46px ${BRUSH}`, '#f5dba9'); txt(P.title.slice(2), 699, 44, `46px ${BRUSH}`, '#f5dba9');
    txt(P.name, 640, 293.5, `600 36px ${FONT}`, '#efe4cc');
    txt('Lv.' + P.lv0, 600, 336.5, `bold 40px ${NUM}`, '#efe4cc', 'right'); arrow(640, 336.5, 36, 14, '#efe4cc', 1.5); txt('Lv.' + P.lv1, 678, 336.5, `bold 40px ${NUM}`, '#8fdda0', 'left');
    P.rows.forEach(([lab, a, b], i) => {
      const y = 384.5 + 37 * i, d = b - a, q = Math.min(1, Math.max(0, (t - .25 - i * .08) / .25)); c.save(); c.globalAlpha = e * q;
      const col = d > 0 ? '#8fdda0' : d < 0 ? '#ff8e7c' : '#a89878';
      txt(lab, 416, y, `600 28px ${FONT}`, '#efe4cc', 'left'); txt(a, 588, y, `bold 28px ${NUM}`, '#efe4cc', 'right');
      arrow(641, y, 26, 10, '#efe4cc', 1.2); txt(b, 752, y, `bold 28px ${NUM}`, col, 'right');
      txt(d > 0 ? '+' + d : d < 0 ? String(d) : '—', 870, y, `bold 28px ${NUM}`, col, 'right'); c.restore();
    });
    txt('确 定', 640, btnY + 31 + (P.pressed ? 1 : 0), `600 36px ${FONT}`, '#422b17');
    c.restore();
  };
  S.overlay.push({ draw() { if (P) try { draw(ctx); } catch (e) { console.warn('levelup_panel', e); P.res(); P = null; } } });
  consumeTap = (o => function () { if (P) { const t = o(); P.pressed = !!input.down; if (t && performance.now() - P.t0 > 500) { const r = P.res; P = null; r(); } return null; } return o(); })(consumeTap);
  (function tick() { if (P) { P.pressed = !!input.down; if (input.tapped) consumeTap(); } requestAnimationFrame(tick); })();

  window.levelPanel = (o = {}) => new Promise(res => {
    if (!ready()) return res(false);
    P = { who: o.who || 'hero', name: o.name || NAME[o.who || 'hero'], lv0: o.lv0, lv1: o.lv1, rows: (o.rows || []).slice(0, 6), title: o.title || '等级提升', t0: performance.now(), res: () => res(true) };
    if (P.rows.length < 3) P.rows = P.rows.concat(STATS.slice(0, 3 - P.rows.length).map(([k, l]) => [l, 0, 0]));
  });

  levelUpShow = (orig => async function (lv0) {
    const h = S.hero; if (!ready()) { try { if (window.IMG_GUARD) IMG_GUARD.bumpMatch(['lvp/', 'lvpd/']); } catch (e) {} for (let i = 0; i < 30 && !ready(); i++) await new Promise(r => setTimeout(r, 100)); }   // 作者 11-07：窗口素材没载完就退回代码框 → 先插队载素材，最多等 3 秒
    if (!ready() || !h) return orig.apply(this, arguments);
    const b = before && before.lv === lv0 ? before.s : null; before = null;
    const now = snap();
    const rows = STATS.map(([k, l]) => { const old = b ? b[k] : now[k] - ((typeof GROW === 'object' && GROW[k]) || 0) * (h.lv - lv0); return [l, Math.round(old), now[k]]; });
    try { playSnd('jingle_levelup'); } catch (e) {} S.flash = .6; S.flashColor = '#fff3c0';
    await levelPanel({ who: 'hero', lv0, lv1: h.lv, rows });
    if (typeof showLearns === 'function') await showLearns();
  })(levelUpShow);

  // 测试入口：控制台 LVP_TEST('linxue')
  window.LVP_TEST = (who = 'hero') => levelPanel({ who, lv0: 12, lv1: 13, rows: [['气血', 1860, 1980], ['灵力', 96, 108], ['攻击', 268, 284], ['防御', 142, 151], ['身法', 82, 86]] });
})();

