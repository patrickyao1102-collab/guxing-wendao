// R93-11 天剑集市 · 九柱护龙阵（Codex 原画 + nine_pillars.js 的画法移植）
// 九根光柱绕神龙台每隔 40° 一根（赤橙金翠青蓝紫绯白金），地面两圈阵纹反向慢转，柱身呼吸、上行光丝。
// 柱子做成会和人物一起按脚点 y 排序的世界物件（后排柱在神龙后、前排柱在神龙前）；柱身外发光预先烤进贴图（不在每帧做 shadowBlur，手机也跑得动）。
// 代码只做位置、缩放、透明度、旋转；光柱、阵纹、光芯都是 Codex 画的图。
(function () {
  const R = window.R80; if (!R || !R.r93 || !window.R60) return;
  const ID = 'tj_market', B = R60.map;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const BL = { core: 'e15ea803f615a5a9a95825af45bce77e', ring: '2bb373e5f9b5f62dce48a803b1576c7b', p0: '8377711758c98a4c957c17a2696a6569', p1: 'f15327bc77c78c088f0693cefa063c4f', p2: '631f1d794fceedd9f95fdb4e7e8f122e', p3: '909d6dc00ec481c910daef83720bb71a', p4: 'ae7f8a3072cb9f60f8b002c24746d530', p5: 'a2cccf50657df383b28c34816fc1e916', p6: '4cc8e9c8aeb4a72a34ea0419a7424ec2', p7: '26a0785cc25d525698cc372227c004b2', p8: '3dcf5725cd6b1dc82674559d85adc746' };
  const FILE = { core: 'core', ring: 'ring' }; for (let i = 0; i < 9; i++) FILE['p' + i] = 'pillar_' + i;
  const src = k => LOC ? 'r93/' + FILE[k] + '.webp' : '/_blob/' + BL[k];
  const CENTER = [2660, 2078], DRAGON = { x: 2660, y: 2180, ax: 450, ay: 386, w: 900, h: 386 };
  const NODES = [[2660, 1873, [.94, .3, .39]], [3257.79, 1920.96, [1, .53, .25]], [3575.87, 2042.4, [1, .79, .22]], [3465.4, 2180.5, [.42, .8, .32]], [2978.08, 2270.64, [.18, .82, .72]], [2341.92, 2270.64, [.27, .58, 1]], [1854.6, 2180.5, [.55, .36, .92]], [1744.13, 2042.4, [.91, .42, .76]], [2062.21, 1920.96, [.94, .91, .78]]]
    .map(([x, y, c], i) => ({ i, x, y, c, w: 475, h: 900 }));
  const PAD = 70, img = {}; let glow = null;
  for (const k in FILE) { const im = new Image(); im.onload = () => { img[k] = im; }; im.src = src(k); }
  { const im = new Image(); im.onload = () => { img.dragon = im; }; im.src = window.R80_SRC ? R80_SRC('dragon') : ''; }
  // 柱身 + 外发光（Codex：shadowColor 柱色 .65、shadowBlur 24 屏幕像素；场景缩放 .6 → 世界里 40）
  function bake() {
    if (glow) return glow; for (let i = 0; i < 9; i++) if (!img['p' + i]) return null;
    glow = NODES.map(n => { const c = document.createElement('canvas'); c.width = n.w + PAD * 2; c.height = n.h + PAD * 2; const g = c.getContext('2d');
      g.shadowColor = `rgba(${n.c.map(v => Math.round(v * 255)).join(',')},.65)`; g.shadowBlur = 40; g.drawImage(img['p' + n.i], PAD, PAD, n.w, n.h); return c; });
    return glow;
  }
  const pos = (v, m) => ((v % m) + m) % m;
  function pillar(c, n, t) {
    const G = bake(); if (!G || !img.core) return;
    const phase = t * Math.PI * 2 / 8 + n.i * Math.PI * 2 / 9, k = 1 + .025 * Math.sin(phase), w = n.w * k, h = n.h, pw = PAD * k;
    c.save(); c.globalCompositeOperation = 'source-over'; c.globalAlpha = .86 + .05 * Math.sin(phase);
    c.drawImage(G[n.i], n.x - w / 2 - pw, n.y - h - PAD, w + pw * 2, h + PAD * 2);
    c.globalAlpha = .40; c.globalCompositeOperation = 'screen'; c.drawImage(img.core, n.x - w * .14, n.y - h, w * .28, h);
    const q = pos(t / 3.6 + n.i * .137, 1); c.globalAlpha = Math.sin(Math.PI * q) * .24; c.globalCompositeOperation = 'source-over';
    c.drawImage(img['p' + n.i], n.x - w * .2 + Math.sin(phase) * 9, n.y - 220 - q * 550, w * .40, 360);
    c.restore();
  }
  function ring(c, x, y, w, h, ang, a) { if (!img.ring) return; c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'source-over'; c.translate(x, y); c.scale(1, h / w); c.rotate(ang); c.drawImage(img.ring, -w / 2, -w / 2, w, w); c.restore(); }
  // 地面阵纹（物件之前画）
  tileAmbientLow = (orig => function (T, cam, now) {
    if (typeof orig === 'function') orig.apply(this, arguments);
    if (world.mapName !== ID) return; const t = performance.now() / 1000, [x, y] = CENTER;
    ring(ctx, x, y, 2040, 450, t * Math.PI * 2 / 64, .95); ring(ctx, x, y, 1460, 322, -t * Math.PI * 2 / 48, .55);
    for (const n of NODES) ring(ctx, n.x, n.y, 156, 34, 0, .70 + .1 * Math.sin(t * Math.PI * 2 / 8 + n.i));
  })(typeof tileAmbientLow === 'function' ? tileAmbientLow : null);
  // 九根柱：进世界物件，按脚点 y 和人物、神龙一起排序
  const LAST = NODES.reduce((a, n) => n.y > a.y ? n : a, NODES[0]);
  for (const n of NODES) B.objs.push({ id: 'r93_pillar', uid: 'r93p' + n.i + 'x', img: undefined,   /* 不进载入进度（不是贴图件） */ x: n.x - n.w / 2 - PAD, y: n.y - n.h - PAD, w: n.w + PAD * 2, h: n.h + PAD * 2, sy: n.y, flat: false, flip: false, r93p: n });
  drawBaked = (orig => function (o, now) {
    if (o && o.r93p) { const t = performance.now() / 1000; pillar(ctx, o.r93p, t);
      // 前排光柱画完，把神龙原图以 .75 透明度回描一遍，免得光柱把龙身盖没（Codex protectDragon）
      if (o.r93p === LAST && img.dragon) { ctx.save(); ctx.globalAlpha = .75; ctx.drawImage(img.dragon, DRAGON.x - DRAGON.ax, DRAGON.y - DRAGON.ay, DRAGON.w, DRAGON.h); ctx.restore(); }
      return; }
    return orig.apply(this, arguments);
  })(drawBaked);
  // 旧存档落在已经取消的东边大草场 / 云海里：进图时如果脚下不能走，挪到问剑坪返回点
  tileSetMap = (orig => function (name, c, r) {
    const ret = orig.apply(this, arguments);
    try { if (name === ID && world.player) { const cs = B.cs, p = world.player, i = Math.floor(p.y / cs) * B.cols + Math.floor(p.x / cs);
      if (B.blocked.charCodeAt(i) !== 48) { p.x = R.spawn[0]; p.y = R.spawn[1]; p.face = 'up'; if (world.followers) for (const f of world.followers) { f.x = p.x; f.y = p.y + 30; } } } } catch (e) {}
    return ret;
  })(tileSetMap);
  window.R93_PILLARS = { NODES, bake, ready: () => !!(bake() && img.core && img.ring) };
})();
