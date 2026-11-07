// ================= R136 · 藏经阁二层重拼（Claude 11-07，作者逐版改到 v9 + Codex R135/R135b/R135c）=================
// 换掉旧 1344×1088 二层：Codex R135 琉璃星藏版底图（R135c 补南门、封北楼梯）按 0.75 缩到 1728×1296，
// 家具按作者要求重拼（书架不重复、往八角阵中间收）；中央九星阵 / 石台星图 / 窗光浮尘为代码特效；
// 转轮经藏用 R135b 旋转帧（平时 6fps，取书 18fps + 金光）；南门前传送阵（R135c 待机 / 启动帧）回一层。
// 关掉：localStorage.r136lib = '0'
(function () {
  const D = window.R136LIB;
  if (!D || typeof CXB2 === 'undefined' || !CXB2.tj_forbidden || typeof TMAPS === 'undefined' || !TMAPS.tj_forbidden) return;
  try { if (localStorage.getItem('r136lib') === '0') return; } catch (e) {}
  const FB = CXB2.tj_forbidden, LB = CXB2.tj_library, R = 'r136/';
  const im = {}, ld = (k, src, cb) => { const i = new Image(); i.onload = () => { im[k] = i; cb && cb(i); }; i.src = src; };
  // ---- 地图数据：原对象原地改（别处闭包里拿的都是 FB 这个引用）----
  Object.assign(FB, { w: D.w, h: D.h, cs: D.cs, cols: D.cols, rows: D.rows, blocked: D.blocked, spawn: D.spawn, exits: D.exits, npcs: [], zones: [], lights: [], doors: [],
    inter: D.inter, objs: D.objs.map(o => Object.assign({}, o, { img: 'cx2_' + o.img_id })) });
  ld('g', R + 'g_tj_forbidden.webp', i => { IMG.cx2g_tj_forbidden = i; });
  IMG.cx2g_tj_forbidden = IMG.cx2g_tj_forbidden && IMG.cx2g_tj_forbidden.width === D.w ? IMG.cx2g_tj_forbidden : null;
  if (!IMG.cx2g_tj_forbidden) delete IMG.cx2g_tj_forbidden;
  for (const k of new Set(D.objs.map(o => o.img_id))) ld(k, R + k + '.webp', i => { IMG['cx2_' + k] = i; });
  ld('spin', R + 'rotunda_spin.webp'); ld('rglow', R + 'rotunda_glow.webp');
  ld('tpb', R + 'tp_base.webp'); ld('tpi', R + 'tp_idle.webp'); ld('tpa', R + 'tp_active.webp'); ld('nglow', R + 'night_glow.webp');

  // ---- 坐标工具（同 index.html 藏经阁段）----
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const nearOf = Bm => (x, y) => {
    const ok = (c, r) => c >= 1 && r >= 1 && c < Bm.cols - 1 && r < Bm.rows - 1 && Bm.blocked.charCodeAt(r * Bm.cols + c) === 48 && Bm.blocked.charCodeAt(r * Bm.cols + c + 1) === 48 && Bm.blocked.charCodeAt(r * Bm.cols + c - 1) === 48;
    const c0 = Math.floor(x / Bm.cs), r0 = Math.floor(y / Bm.cs);
    for (let d = 0; d < 30; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue; const c = c0 + dx, r = r0 + dy; if (ok(c, r)) return [(c + .5) * Bm.cs, (r + .6) * Bm.cs]; }
    return [x, y];
  };
  const atF = (x, y) => P(...nearOf(FB)(x, y));
  const exitOf = (e, o) => Object.assign({ x: Math.floor(e.region.x / FB.cs), y: Math.floor(e.region.y / FB.cs), w: Math.max(1, Math.ceil(e.region.w / FB.cs)), h: Math.max(1, Math.ceil(e.region.h / FB.cs)), to: e.to, label: e.label }, o);
  const FI = id => (FB.inter.find(t => t.id === id) || {}).p;
  const OBJ = uid => FB.objs.find(o => o.uid === uid);

  // ---- 地图定义 ----
  const M = TMAPS.tj_forbidden, oldEx = M.exits[0] || {};
  M.baked = Object.assign({ ground: 'cx2g_tj_forbidden' }, FB);
  M.start = atF(864, 1060);
  // 传送阵 → 一层（自己画阵，不要通用光圈）；南门 → 外院（作者：这里应该是门）
  const LX0 = TMAPS.tj_library && (TMAPS.tj_library.exits || []).find(e => e.to === 'tj_scripture');
  M.exits = FB.exits.map(e => e.id === 'south_door'
    ? exitOf(e, { to: 'tj_scripture', label: '南门 · 外院', at: LX0 ? LX0.at : oldEx.at, face: 'down', cond: oldEx.cond, msg: oldEx.msg, noGlow: true, door: true })   // 作者 11-07：二层自带传送阵，南门不要通用蓝色法阵
    : exitOf(e, { to: 'tj_library', label: '传送阵 · 一层', at: oldEx.at, face: oldEx.face || 'down', cond: oldEx.cond, msg: oldEx.msg, noGlow: true }));
  // 交互点：旧 npc（转轮经藏 / 九曜剑典台的 talk 已被剧情改写过）挪到新位置；没有对应家具的去掉；新书架补上说明
  const byName = { '八方转轮经藏': 'archive_rotunda_r4_collection', '叠阶秘本经架': 'ancestral_codices_r4_collection', '青玉简牍藏格': 'jade_slip_r4_collection', '悬简经屏架': 'hanging_sutras_r4_collection',
    '琉璃珍本展龛': 'crystal_codex_case_r4_collection', '星图展卷经案': 'celestial_scroll_desk_r4_collection', '九曜剑典台': 'nine_star_pedestal' };
  const npcs = [];
  for (const n of M.npcs || []) {
    if (n.name === '六棱古卷匣架') { const o = OBJ('forbidden_scroll_outer'); if (o) { const [c, r] = atF(o.ax + 70, o.ay + 30); npcs.push(Object.assign(n, { c, r })); } continue; }
    const p = byName[n.name] && FI(byName[n.name]); if (!p) continue; const [c, r] = atF(...p); npcs.push(Object.assign(n, { c, r }));
  }
  const spot = (name, uid, dx, dy, talk, h) => { const o = OBJ(uid); if (!o) return; const [c, r] = atF(o.ax + dx, o.ay + dy); npcs.push({ key: 'none', c, r, name, hidden: true, h: h || 140, talk }); };
  spot('月洞藏架', 'forbidden_nw', 0, 46, ['圆月形的博古格，书和玉器错落着摆，像一扇看向书海的窗。']);
  spot('竹简卷轴高架', 'forbidden_bamboo', -60, 30, ['一格格插满竹简，竹片上的字是用剑尖刻的，年头最久的已经发黑。']);
  spot('青铜经幢书阁', 'forbidden_bronze', 60, 40, ['青铜幢座上刻满星纹，上层书格里收的都是镇派典籍的抄本。']);
  spot('云纹博古书格', 'forbidden_curio', -40, 40, ['博古格里摆着古卷、玉璧和一只小香炉，炉灰早凉了。']);
  spot('星图卷轴壁龛', 'forbidden_star_niche', 0, -130, ['展开的星图上，九颗星被人用朱砂圈了出来。'], 120);
  M.npcs = npcs;
  // 一层楼道上来的落点：传送阵正上方
  if (TMAPS.tj_library) for (const e of TMAPS.tj_library.exits || []) if (e.to === 'tj_forbidden') { e.at = atF(864, 1050); e.face = 'up'; }
  // 二楼广角：人物稍微收一点，跟家具比例对上
  try { if (typeof CHAR_SCALE !== 'undefined') CHAR_SCALE.tj_forbidden = 1; } catch (e) {}   // 作者 11-08 体检：.86 时人只到书架三分之一、比椅子小，改回 1

  // ---- 剑典剧情：转轮经藏取书点 / 石台落点换成新坐标 ----
  const ROT = OBJ('forbidden_rotunda'), PED = OBJ('forbidden_nine_star');
  const SRC = [ROT.ax, ROT.ay - ROT.h * .5], DST = [PED.ax, PED.y + PED.h * .3];
  if (window.ScriptureStory) {
    const SS = ScriptureStory, c0 = SS.create, t0 = SS.take;
    SS.create = function () { const s = c0.apply(this, arguments); s.destination = DST.slice(); s.source = SRC.slice(); return s; };
    SS.take = function (s) { const r = t0.apply(this, arguments); if (r === 'started') s.source = [SRC[0] + Math.sin(s.angle) * 40, SRC[1]]; return r; };
    if (window.LIBFX && LIBFX.story) LIBFX.story = null;
  }
  const story = () => window.LIBFX && LIBFX.story;
  const here = () => world.mapName === 'tj_forbidden';
  const tS = () => performance.now() / 1000;

  // ---- 传送阵 ----
  const TP = D.teleport, TPS = { t: -9 };
  const tpFrame = (img, f) => { const c = f % 4, r = Math.floor(f / 4); ctx.drawImage(img, c * 240, r * 240, 240, 240, TP.center[0] - TP.anchor[0], TP.center[1] - TP.anchor[1], 240, 240); };
  goMap = (orig => function (name, c, r, face) {
    if (here() && name === 'tj_library' && im.tpa && !TPS.busy) {   // 踩上传送阵：先放启动光柱（第 8 帧传走）
      const p = world.player; if (p && Math.hypot(p.x - TP.center[0], p.y - TP.center[1]) < 200) {
        TPS.busy = true; TPS.t = tS(); world.locked = true; try { playSnd('sfx_star', .5); } catch (e) {}
        const a = arguments, self = this;
        return new Promise(res => setTimeout(() => { TPS.busy = false; world.locked = false; res(orig.apply(self, a)); }, 470));
      }
    }
    return orig.apply(this, arguments);
  })(goMap);

  // ---- 画 ----
  const pickup = () => { const s = story(); return s && (s.phase === 'transferring' || s.align) ? 1 : 0; };
  const fxState = () => ({ pickup: pickup() });
  tileAmbientLow = (orig => function (T, cam, now) {
    if (typeof orig === 'function') orig.apply(this, arguments);
    if (!here() || !window.ForbFX) return;
    try { const t = tS(); ForbFX.floor(ctx, t, fxState()); if (im.tpb) ctx.drawImage(im.tpb, TP.center[0] - TP.anchor[0], TP.center[1] - TP.anchor[1], 240, 240); } catch (e) { console.warn('r136', e); }
  })(typeof tileAmbientLow === 'function' ? tileAmbientLow : null);
  drawBaked = (orig => function (o, now) {
    if (!here() || !o.img_id) return orig(o, now);
    if (o.id === 'o_r135_rotunda' && im.spin) {
      const t = tS(), pk = pickup(), f = Math.floor(t * (pk ? 18 : 6)) % 12, w = D.rot.w, h = D.rot.h;
      ctx.drawImage(im.spin, (f % 6) * w, Math.floor(f / 6) * h, w, h, o.x, o.y, o.w, o.h);
      if (pk && im.rglow) { const g = Math.floor(t * 18) % 8; ctx.drawImage(im.rglow, (g % 4) * w, Math.floor(g / 4) * h, w, h, o.x, o.y, o.w, o.h); }
      return;
    }
    if (o.id === 'o_r135_pedestal') {
      orig(o, now); const s = story();
      try { if (s && s.phase === 'displayed' && window.ArchiveMotion && LIBFX.ready) { const pose = ScriptureStory.pose(s); ArchiveMotion.aura(ctx, ...pose.point, now, 1, false); ArchiveMotion.manuscript(ctx, LIBFX.im, pose, now); ArchiveMotion.aura(ctx, ...pose.point, now, 1, true); }
        if (window.ForbFX) ForbFX.holo(ctx, o, tS(), fxState()); } catch (e) {}
      return;
    }
    return orig(o, now);
  })(drawBaked);
  const NB = {};
  const blank = document.createElement('canvas'); blank.width = blank.height = 1;
  tileAmbientHigh = (orig => function (T, cam, now) {
    if (here() && window.LIBFX && LIBFX.ready) { const want = im.nglow || blank; if (LIBFX.im.light_forbidden !== want) LIBFX.im.light_forbidden = want; }
    orig.apply(this, arguments);
    if (!here()) return;
    try {
      const t = tS(), a = t - TPS.t;
      if (a >= 0 && a < .67 && im.tpa) tpFrame(im.tpa, Math.min(11, Math.floor(a * 18)));
      else if (im.tpi) tpFrame(im.tpi, Math.floor(t * 8) % 12);
      if (window.ForbFX) ForbFX.overlay(ctx, t);
      const p = world.player, ex = M.exits.find(e => e.noGlow && !e.door), dr = M.exits.find(e => e.door);
      if (p && typeof textOutline === 'function') { ctx.save(); ctx.font = `600 20px ${typeof FONT !== 'undefined' ? FONT : 'sans-serif'}`; ctx.textAlign = 'center';
        if (ex && (!ex.cond || ex.cond()) && Math.hypot(p.x - TP.center[0], p.y - TP.center[1]) < 300) textOutline('传送阵 · 一层', TP.center[0], TP.center[1] - 92, '#ffe7b0', '#2a1400', 4);
        if (dr && (!dr.cond || dr.cond()) && Math.hypot(p.x - 864, p.y - 1250) < 220) textOutline('南门 · 外院', 864, 1286, '#ffe7b0', '#2a1400', 4);
        ctx.restore(); }
    } catch (e) { console.warn('r136', e); }
  })(tileAmbientHigh);

  // 夜里（第一章夜探）阁内整体压暗之后，阵纹 / 星图 / 传送阵是法术光，用 lighter 再补亮一层
  tileDraw = (orig => function () {
    orig.apply(this, arguments);
    if (!here() || !(S.flags && S.flags.lib_ch1) || !window.ForbFX) return;
    try { const cam = world.cam || { x: 0, y: 0 }, z = VZ(), t = tS();
      ctx.save(); if (z !== 1) ctx.scale(z, z); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
      // 阵纹先画到离屏，再把挡在它前面的家具 / 人物抠掉，免得夜里的阵光盖在经藏、石台上
      const C0 = ForbFX.C, bx = C0.x - C0.rx - 40, by = C0.y - C0.ry - 40, bw = (C0.rx + 40) * 2, bh = (C0.ry + 40) * 2;
      const oc = NB.c || (NB.c = document.createElement('canvas')); if (oc.width !== bw) { oc.width = bw; oc.height = bh; }
      const o2 = oc.getContext('2d'); o2.setTransform(1, 0, 0, 1, 0, 0); o2.clearRect(0, 0, bw, bh); o2.translate(-bx, -by);
      ForbFX.floor(o2, t, fxState()); o2.globalCompositeOperation = 'destination-out';
      for (const o of FB.objs) { if (o.x > bx + bw || o.x + o.w < bx || o.y > by + bh || o.y + o.h < by) continue; const i = IMG[o.img]; if (!i) continue;
        o2.save(); if (o.flip) { o2.translate(o.x + o.w / 2, 0); o2.scale(-1, 1); o2.translate(-(o.x + o.w / 2), 0); } o2.drawImage(i, o.x, o.y, o.w, o.h); o2.restore(); }
      o2.globalCompositeOperation = 'source-over';
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .55; ctx.drawImage(oc, bx, by);
      ctx.globalAlpha = .75; ForbFX.holo(ctx, PED, t, fxState()); ctx.globalAlpha = .9;
      const a = t - TPS.t; if (a >= 0 && a < .67 && im.tpa) tpFrame(im.tpa, Math.min(11, Math.floor(a * 18))); else if (im.tpi) tpFrame(im.tpi, Math.floor(t * 8) % 12);
      ctx.restore(); } catch (e) { console.warn('r136', e); }
  })(tileDraw);

  // ---- 张长老那段：先让叶孤星退到石台前的演出位，张长老从南门进来 ----
  window.R135A_GEO = { from: [864, 1236], cx: 864, minY: 760 };
  const ST = D.story_positions;
  say = (orig => function (who, text) {
    if (here() && text === '不好，有脚步声！' && world.player && typeof moveActor === 'function') {
      const p = world.player, self = this, a = arguments;
      return (async () => { try { await moveActor(p, ST.ye_guxing[0], ST.ye_guxing[1], 200); p.face = 'right'; p.dir = 1; } catch (e) {} return orig.apply(self, a); })();
    }
    return orig.apply(this, arguments);
  })(say);
})();
