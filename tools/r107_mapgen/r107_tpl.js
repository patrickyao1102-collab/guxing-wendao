// R107 苍月篇新地图（作者 11-03：Codex 那批地图像概念图、尺寸不对、布局不对——用那批素材里还不错的，加上以前用过的素材，自己拼）
// 十八张：幽影林（林边宿营 / 追虎迷径）、女娲秘境（天瀑 / 神像古道 / 群像遗庭 / 山巅小庙 / 庙内 / 庙后灵泉）、
//         苍月城（南门 / 旧街 / 城主府 / 议事正堂 / 三间客舍 / 北郊阵门）、炼魂谷地下密道（两层）。
// 画法跟青阳镇、山外树林一样：整张地面图（草地、土路、石板、影子、远处的树都烘在里面）+ 靠近路的树和物件单独按脚底排序（人能走到树后面）。
// 人物 ~110px，树 280~380px，房子 ~300px —— 玩家视角下一屏能看见一整片场景，不再是几棵巨树。
// 现在只接进「测试 → 地图传送」（id 以 m_ 开头），剧情还走原来的；等作者看过再接进第三章。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const BL = {"lk_nw_spring": "ff733fddd2a32bc8b2ba5e580d312a37", "w_moon_crane": "35478d97994c1f64a4774e111147f761", "w_moon_deer": "eb4f0a239486ce49c2f63680701887c6", "w_moon_sparrow": "fc7e03384ff291e1370a2f21499b95a7", "w_loom_silk": "6ce607fc26ba8619d31c8e99e170cde8", "atlas_0": "1cd1b9be3ea0d53aff01cc0bd77900a5", "g_cy_council": "8681516d6b911d4a5862d8ef97d385d5", "g_cy_gate": "6e45126aed82009b9d446405c635d212", "g_cy_guest_lin": "0f7151f69000646968dd04ac250e79f7", "g_cy_guest_ye": "e461a196ec19d7b89851694e3e7eff47", "g_cy_guest_yun": "55a3537fd8d3d0d17ee883e8dce84aea", "g_cy_manor": "d79384eb14cdfe08a8c173296a2e8b09", "g_cy_north": "4ea43d76e4ca3482c6e1e12ad9fa2b4f", "g_cy_street": "d61e3799eccacb7654d3b31f0da185f3", "g_nw_court": "1f02dd1a4d392d484764a26b3db7121f", "g_nw_falls": "036c4d3efc1d6dc08bddc0f03992d92f", "g_nw_inner": "bb4f25b5be2336d71d0af4b3a2ad51dc", "g_nw_path": "1c855ce897b0abb37a305cf384a49cea", "g_nw_spring": "d91e4e902d4619fc08f54185599cf694", "g_nw_temple": "511aa5e189f77b879cef64c1e9637b2a", "g_xx_b1": "a71f0cba585ba6617b1616870d69db0e", "g_xx_b2": "303a8130ea00aa528257f5acdf8dc843", "g_yy_deep": "9767ef76ed45c7232ef50b7d17d5a322", "g_yy_edge": "e75898842f196cf88f3a82ff15585eec"};   // 发布版 blob
  const SRC = k => LOC || !BL[k] ? 'r107/' + k + '.webp' : '/_blob/' + BL[k];
  const NAMES = __NAMES__, ATLAS = __ATLAS__, PAGES = __PAGES__;
  const DATA = __DATA__;
  const PFX = '__PFX__';
  // ---- 月湖水面（照搬 Codex lake-surface.mjs：同一张倒影图按行轻微错位成波纹 + 接触涟漪 + 泉眼气泡和游鱼；石瀑只有中间水流在动）----
  function drawLakeSurface(ctx, layer, sheet, seconds, viewport) {
    if (!sheet) return;
    const [width, height] = layer.size;
    const left = Math.max(0, Math.floor(viewport.x) - 8), right = Math.min(width, Math.ceil(viewport.x + viewport.w) + 8);
    const top = Math.max(0, Math.floor(viewport.y / 6) * 6), bottom = Math.min(height, viewport.y + viewport.h);
    if (right <= left || bottom <= top) return;
    const t = seconds * 2 * Math.PI / layer.period;
    const yShift = y => 2.8 * Math.sin(y * .082 - t) + 1.9 * Math.sin(y * .034 + t);
    for (let y = top; y < bottom; y += 6) {
      const h = Math.min(6, height - y), sy = Math.max(0, y + yShift(y));
      const end = Math.min(height, y + h + yShift(y + h)), dx = 3.1 * Math.sin(y * .065 - t) + 1.65 * Math.sin(y * .023 + t * 2);
      if (end > sy) ctx.drawImage(sheet, left, sy, right - left, end - sy, left + dx, y, right - left, h);
    }
    ctx.save(); ctx.lineCap = 'round';
    for (const { x, y, r, phase } of layer.contacts) {
      if (x + r < left || x - r > right || y + 12 < top || y - 20 > bottom) continue;
      for (let i = 0; i < 2; i++) {
        const p = (seconds / layer.period * 2 + phase + i * .5) % 1;
        const radius = r * (.56 + .55 * p), opacity = .36 * Math.sin(Math.PI * p) ** 1.15;
        ctx.strokeStyle = 'rgba(220,242,225,' + opacity + ')'; ctx.lineWidth = 1.6 - p * .65;
        ctx.beginPath(); ctx.ellipse(x, y, radius, radius * .17, 0, .08, 2.9); ctx.stroke();
        ctx.strokeStyle = 'rgba(49,109,111,' + opacity * .72 + ')';
        ctx.beginPath(); ctx.ellipse(x, y + 1.9, radius * .96, radius * .17, 0, .52, 2.65); ctx.stroke();
      }
    }
    ctx.restore();
    for (const s of layer.springs || []) if (s.x + s.r >= left && s.x - s.r <= right && s.y + 80 >= top && s.y - 80 <= bottom) springWater(ctx, s, seconds, layer.period);
  }
  function springWater(ctx, s, seconds, period) {
    const t = seconds / period, tau = 2 * Math.PI;
    ctx.save(); ctx.translate(s.x, s.y);
    for (let j = 0; j < 4; j++) {
      const u = (t + s.phase + j * .25) % 1, r = s.r * (.08 + .98 * u);
      ctx.strokeStyle = 'rgba(211,250,231,' + (.46 * Math.sin(Math.PI * u) * (1 - .4 * u)) + ')'; ctx.lineWidth = 2.2 - u;
      for (let k = 0; k < 3; k++) { const a = k * 2.13 + .25 * Math.sin(s.x + k + t * tau); ctx.beginPath(); ctx.ellipse(3 * Math.sin(s.y + j), 0, r, r * .32, .04, a, a + .8 + .24 * Math.cos(j + k)); ctx.stroke(); }
    }
    for (let j = 0; j < 15; j++) {
      const p = (t * 2 + j * .618 + s.phase) % 1, x = Math.sin(j * 29.3) * s.r * .3 + 2 * Math.sin(p * tau + j), y = Math.cos(j * 8.8) * 8 - p * 15;
      ctx.globalAlpha = Math.sin(Math.PI * p) * .7; ctx.strokeStyle = '#e4fff1'; ctx.fillStyle = '#beeadd'; ctx.lineWidth = .9;
      ctx.beginPath(); ctx.arc(x, y, 1.1 + 2.1 * p, 0, tau); ctx.stroke(); ctx.fillRect(x - 1, y - 1, 1, 1);
    }
    ctx.globalAlpha = 1;
    for (let j = 0; j < 3; j++) {
      const a = t * tau + j * .48 + s.phase * 9, rx = s.r * (.66 + j * .14), ry = rx * .32, px = rx * Math.cos(a), py = ry * Math.sin(a) + 37;
      ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(ry * Math.cos(a), -rx * Math.sin(a))); ctx.globalAlpha = .64;
      const bend = 2.5 * Math.sin(t * tau * 5 + j); ctx.fillStyle = '#285954'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.bezierCurveTo(5, -3.8, -2, -3.6, -7, bend * .55); ctx.lineTo(-12, bend - 2); ctx.lineTo(-11, bend + 2); ctx.lineTo(-6, bend * .55 + 1); ctx.quadraticCurveTo(3, 4, 8, 0); ctx.fill();
      ctx.strokeStyle = '#b3bf88'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, -1); ctx.quadraticCurveTo(0, -2, -4, bend * .4); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  // im：石瀑整图；在 (0,0)-(W,H) 坐标里画（调用方先 translate/scale 到物件框）
  function springCascadeLocal(ctx, im, t) {
    const W = im.width, H = im.height; ctx.save(); ctx.beginPath(); ctx.moveTo(.44 * W, .16 * H); ctx.lineTo(.58 * W, .16 * H); ctx.lineTo(.63 * W, .68 * H); ctx.lineTo(.39 * W, .68 * H); ctx.closePath(); ctx.clip();
    for (let yy = Math.floor(H * .15); yy < H * .70; yy += 3) {
      const shift = z => 1.7 * Math.sin(z * .12 - t * 2 * Math.PI / 1.4) + .8 * Math.sin(z * .22 - t * 2 * Math.PI / .8);
      const sy = yy + shift(yy); ctx.drawImage(im, .36 * W, sy, .31 * W, 3 + shift(yy + 3) - shift(yy), .36 * W, yy, .31 * W, 3);
    }
    ctx.restore();
  }
  const CAS = [], LKS = {};
  const lakeSheet = L => { if (!LKS[L.src]) { const im = new Image(); im.src = SRC(L.src); LKS[L.src] = im; } const m = LKS[L.src]; return m.complete && m.naturalWidth ? m : null; };
  // 会动的物件（女娲神殿的丝帷随风飘）：Codex 画的逐帧风动图集，按格播放
  const ANIM = __ANIM__, ACV = [], ASH = {};
  const animSheet = k => { const A = ANIM[k]; if (!ASH[A.src]) { const im = new Image(); im.src = SRC(A.src); ASH[A.src] = im; } return ASH[A.src]; };
  setInterval(() => { const cur = typeof world !== 'undefined' && world.map && world.map.def && world.map.def.r107; if (!cur) return; const t = performance.now() / 1000;
    for (const a of ACV) { if (a.mid !== cur) continue; const A = ANIM[a.id], sh = animSheet(a.id); if (!sh.complete || !sh.naturalWidth) continue;
      let c = a.cv; if (!c) { c = a.cv = document.createElement('canvas'); c.width = A.fw; c.height = A.fh; }
      const f = (Math.floor(t * A.fps) + a.ph) % A.count, g = c.getContext('2d'); g.clearRect(0, 0, A.fw, A.fh);
      g.drawImage(sh, (f % A.cols) * A.fw, Math.floor(f / A.cols) * A.fh, A.fw, A.fh, 0, 0, A.fw, A.fh); IMG[a.key] = c; } }, 1000 / 12);
  setInterval(() => { const cur = typeof world !== 'undefined' && world.map && world.map.def && world.map.def.r107; if (!cur) return; const t = performance.now() / 1000;
    for (const k of CAS) { if (k.mid !== cur) continue; const base = IMG[k.base]; if (!base || !base.width) continue;
      let c = k.cv; if (!c) { c = k.cv = document.createElement('canvas'); c.width = base.width; c.height = base.height; }
      const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(base, 0, 0); springCascadeLocal(g, base, t); IMG[k.key] = c; } }, 1000 / 24);
  // ---- 物件图集：用到时才载，载完切成单张 ----
  let atlasLoading = false;
  const loadAtlas = () => { if (atlasLoading) return; atlasLoading = true;
    for (let p = 0; p < PAGES; p++) { const im = new Image(); im.onload = () => { for (const [k, e] of Object.entries(ATLAS)) if (e[0] === p) { const c = document.createElement('canvas'); c.width = e[3]; c.height = e[4]; c.getContext('2d').drawImage(im, e[1], e[2], e[3], e[4], 0, 0, e[3], e[4]); IMG['r107_' + k] = c; } }; im.src = SRC('atlas_' + p); } };
  const loadGround = id => { const k = 'r107g_' + id; if (IMG[k] || loadGround[k]) return; loadGround[k] = 1; const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = SRC('g_' + id); };
  const LOOT = [[['p_big', 2], ['gold', 160]], [['p_mp', 3]], [['c_jade', 1], ['gold', 80]], [['p_small', 3], ['gold', 120]]];
  for (const [id, d] of Object.entries(DATA)) {
    const key = PFX + id; if (TMAPS[key]) continue;
    // 碰撞：游程编码还原成 '0'/'1' 字符串
    let s = '', v = d.b0; for (const n of d.b) { s += v.repeat(n); v = v === '1' ? '0' : '1'; }
    const objs = d.o.map(([i, x, y, w, h, sy, f, ph]) => { const nm = NAMES[i]; let img = 'r107_' + nm;
      if ((f & 4) && ANIM[nm]) { img = 'r107_anim_' + id + '_' + ACV.length; ACV.push({ key: img, id: nm, mid: id, ph: ph || 0 }); }
      else if (d.cas && /_cascade$/.test(nm)) { img = 'r107_cas_' + id + '_' + CAS.length; CAS.push({ key: img, base: 'r107_' + nm, mid: id }); IMG[img] = IMG['r107_' + nm]; }
      return { id: nm, img, x, y, w, h, sy, flat: !!(f & 1), flip: !!(f & 2) }; });
    const baked = { ground: 'r107g_' + id, w: d.w, h: d.h, cs: 16, cols: d.cols, rows: d.rows, blocked: s, objs };
    const def = { title: d.t, baked, r107: id, water: d.wa || [], indoor: !!(d.meta && d.meta.indoor), start: d.start, npcs: [], leaves: /^yy_|^nw_|cy_north/.test(id),
      chests: d.ch.map(([c, r], i) => ({ c, r, items: LOOT[i % LOOT.length] })),
      exits: d.ex.map(e => Object.assign({}, e, { cond: () => e.to.startsWith(PFX) && !!TMAPS[e.to], msg: e.label + '：这条路还没通（等接进剧情）' })) };
    if (d.mobs) { const Z = d.z; def.mobs = Object.assign({}, d.mobs, { zone: (c, r) => { const x = (c + .5) * 16, y = (r + .8) * 16; return Z.some(([zx, zy, zr]) => Math.hypot(x - zx, y - zy) < zr); } }); }
    TMAPS[key] = def;
  }
  // 进图时载地面和图集
  tileSetMap = (o => function (name) { const d = TMAPS[name]; if (d && d.r107) { loadAtlas(); loadGround(d.r107); } return o.apply(this, arguments); })(tileSetMap);
  if (typeof tileAmbientLow === 'function') tileAmbientLow = (o => function (T, cam, now) {
    const r = o.apply(this, arguments); const d = world.map && world.map.def; if (!d || !d.r107) return r; const D = DATA[d.r107];
    if (D && D.lake) { const sh = lakeSheet(D.lake); const z = (typeof VZ === 'function' ? VZ() : 1) || 1; if (sh) drawLakeSurface(ctx, D.lake, sh, performance.now() / 1000, { x: cam.x, y: cam.y, w: W / z, h: H / z }); }
    return r; })(tileAmbientLow);
  // 每张图自己的色调（幽影林偏暗偏青）和灵光
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function (T, cam, now) {
    const r = o.apply(this, arguments); const d = world.map && world.map.def; if (!d || !d.r107) return r; const D = DATA[d.r107];
    const z = (typeof VZ === 'function' ? VZ() : 1) || 1, vw = W / z, vh = H / z;
    if (D.meta && D.meta.grade) { ctx.save(); ctx.fillStyle = D.meta.grade; ctx.fillRect(cam.x - 4, cam.y - 4, vw + 8, vh + 8); ctx.restore(); }
    for (const L of D.lights || []) { if (L.x + L.r < cam.x || L.x - L.r > cam.x + vw || L.y + L.r < cam.y || L.y - L.r > cam.y + vh) continue;
      const a = .32 + Math.sin(now * 1.7 + L.x) * .08; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r); g.addColorStop(0, `rgba(${L.c},${a})`); g.addColorStop(1, `rgba(${L.c},0)`); ctx.fillStyle = g; ctx.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); ctx.restore(); }
    return r; })(tileAmbientHigh);
  window.R107_MAPS = { DATA, SPOT: (id, k) => DATA[id] && DATA[id].spots[k] };
})();
