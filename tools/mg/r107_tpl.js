// R107 苍月篇新地图（作者 11-03：Codex 那批地图像概念图、尺寸不对、布局不对——用那批素材里还不错的，加上以前用过的素材，自己拼）
// 十八张：幽影林（林边宿营 / 追虎迷径）、女娲秘境（天瀑 / 神像古道 / 群像遗庭 / 山巅小庙 / 庙内 / 庙后灵泉）、
//         苍月城（南门 / 旧街 / 城主府 / 议事正堂 / 三间客舍 / 北郊阵门）、炼魂谷地下密道（两层）。
// 画法跟青阳镇、山外树林一样：整张地面图（草地、土路、石板、影子、远处的树都烘在里面）+ 靠近路的树和物件单独按脚底排序（人能走到树后面）。
// 人物 ~110px，树 280~380px，房子 ~300px —— 玩家视角下一屏能看见一整片场景，不再是几棵巨树。
// 现在只接进「测试 → 地图传送」（id 以 m_ 开头），剧情还走原来的；等作者看过再接进第三章。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const BL = {"bg_cellar_b1": "658cc0fa23f7b467ec5c239e4bf10673", "bg_cellar_b2": "b3f15705261dfe23d862a0b90f9fefb1", "e_xbat": "6311538a9ae9f00e1eb5e153ba85734f", "e_xguard1": "83e019c79138d5b991e2d0973e88387e", "e_xguard2": "5c77bc92dce2eb51703e16f90bdfa441", "e_xguard3": "56f0f0bb48d458cc1a2a28fa8e166281", "e_xspider": "3514ae94c02414a1599dc49263f8db3d", "e_xwraith": "7ea1864f106bf31c5df5e707fa579e73", "mm_xbat": "c1f535decabeb4247a41e9f82d998365", "mm_xspider": "28ac124b0c2bc696fa85b9ec305cbda3", "mm_xwraith": "d6b0de792d8027d0b5b50302f01e71d2", "n_xguard1": "74d00418b29b4c4e9420745693a8657a", "n_xguard2": "af430a5fcea5562816406319c98b6ae1", "n_xguard3": "0e1e65cdb16c6416e9eea87f7aa50f83", "lk_nw_spring": "ff733fddd2a32bc8b2ba5e580d312a37", "w_moon_crane": "35478d97994c1f64a4774e111147f761", "w_moon_deer": "eb4f0a239486ce49c2f63680701887c6", "w_moon_sparrow": "fc7e03384ff291e1370a2f21499b95a7", "w_loom_silk": "6ce607fc26ba8619d31c8e99e170cde8", "atlas_0": "876dd1a8f6722ba7051bf1d583053b46", "g_cy_council": "857494286fc8c172a176b8f0555ddbdb", "g_cy_gate": "6e45126aed82009b9d446405c635d212", "g_cy_manor": "077dd98fd5292a8b6280656236952d49", "g_cy_north": "4c90e4e29c4c614f0dbfe4ac283c2d56", "g_nw_falls": "036c4d3efc1d6dc08bddc0f03992d92f", "g_nw_spring": "d91e4e902d4619fc08f54185599cf694", "g_nw_temple": "511aa5e189f77b879cef64c1e9637b2a", "g_xx_b1": "4d6a139b01d341027c941dadcdeebd96", "g_xx_b2": "303a8130ea00aa528257f5acdf8dc843", "g_yy_deep": "9767ef76ed45c7232ef50b7d17d5a322", "g_yy_edge": "e75898842f196cf88f3a82ff15585eec", "atlas_1": "f92139a114032f2f50407235eb51e1ae", "g_cy_study": "a14b83136ee26ccd75c89dded6c5984e", "g_cy_bedroom": "0c775c16330c54e2288c98053a0762df", "g_cy_kitchen": "61afd56f14d81c1e894afe17d0de39ad", "g_cy_guest": "62e857916e61406ac73ce639600ffafd", "g_nw_passage": "363a43a6df01679bfae12a77701eb5d5", "lk_nw_passage": "cc38f02af1ab5142313fa53c23db7f0d", "w_fp_falls": "35fced1d8a714fc9883be50d7454ff76", "g_nw_creek": "2a2d69368c3be110b4d3bb7d96591cf7", "g_nw_glade": "a501c436ef212be3f44faca327d3744d", "g_nw_stones": "a6c2bf1fea5352daffb028ebf0f50cd1", "lk_nw_creek": "c566484ca562130b6490ced370bae831", "lk_nw_glade": "c566484ca562130b6490ced370bae831"};   // 发布版 blob
  const SRC = k => LOC || !BL[k] ? 'r107/' + k + '.webp' : '/_blob/' + BL[k];
  const NAMES = __NAMES__, ATLAS = __ATLAS__, PAGES = __PAGES__;
  const DATA = __DATA__;
  const PFX = '__PFX__';
  // ---- 月湖水面（照搬 Codex lake-surface.mjs：同一张倒影图按行轻微错位成波纹 + 接触涟漪 + 泉眼气泡和游鱼；石瀑只有中间水流在动）----
  function drawLakeSurface(ctx, layer, sheet, seconds, viewport) {
    if (!sheet) return;
    if (layer.channels) { for (const flowBanks of layer.channels) drawLakeSurface(ctx, { flowBanks, period: layer.period }, sheet, seconds, viewport); return; }
    if (layer.flowBanks) {   // 溪流：石底不动，只有半透明的光点顺流往下漂（照搬 Codex）
      const banks = layer.flowBanks.filter(([, , y]) => y >= viewport.y - 12 && y <= viewport.y + viewport.h + 12);
      if (banks.length < 2 || banks.every(([l, r]) => r < viewport.x || l > viewport.x + viewport.w)) return;
      ctx.save(); ctx.beginPath();
      banks.forEach(([l, , y], i) => i ? ctx.lineTo(l, y) : ctx.moveTo(l, y));
      for (let i = banks.length - 1; i >= 0; i--) ctx.lineTo(banks[i][1], banks[i][2]);
      ctx.closePath(); ctx.clip();
      const first = Math.min(...banks.map(b => b[0])), last = Math.max(...banks.map(b => b[1])), y0 = banks[0][2], y1 = banks[banks.length - 1][2];
      const key = '_pat'; if (!sheet[key]) sheet[key] = ctx.createPattern(sheet, 'repeat');
      const offset = (seconds / layer.period % 1) * sheet.height;
      ctx.translate(0, offset); ctx.fillStyle = sheet[key]; ctx.fillRect(first, y0 - offset, last - first, y1 - y0); ctx.restore(); return; }
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
  // 阵法：隐阵 / 血印显形 / 破阵 三态换图；显形时血印和阵楔一明一暗地呼吸（只调 Codex 画好的图的亮度）
  const FMS = [];
  const fmCv = (F, k, w, h) => { F.cv = F.cv || {}; let c = F.cv[k]; if (!c) { c = F.cv[k] = document.createElement('canvas'); c.width = w; c.height = h; } const g = c.getContext('2d'); g.clearRect(0, 0, w, h); return [c, g]; };
  setInterval(() => { const cur = typeof world !== 'undefined' && world.map && world.map.def && world.map.def.r107; if (!cur) return; const t = performance.now() / 1000;
    for (const F of FMS) { if (F.id !== cur) continue; const v = (S.flags && S.flags[F.flag]) || 0, base = IMG['r107_' + F.st[v]]; if (!base || !base.width) continue;
      const pulse = .5 + .5 * Math.sin(t * 2.2);
      if (v !== 1) IMG[F.key] = base;
      else { const b0 = IMG['r107_' + F.st[0]], gl = IMG['r107_' + F.glow], [c, g] = fmCv(F, 'main', base.width, base.height);
        if (b0) g.drawImage(b0, 0, 0); g.globalAlpha = .55 + .45 * pulse; g.drawImage(base, 0, 0); g.globalAlpha = 1;
        if (gl) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = .45 * pulse; g.drawImage(gl, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
        IMG[F.key] = c; }
      F.w.forEach((nm, i) => { const w0 = IMG['r107_' + nm], w1 = IMG['r107_' + F.wl[i]]; if (!w0) return; if (v !== 1 || !w1) { IMG[F.wk[i]] = w0; return; }
        const [c, g] = fmCv(F, 'w' + i, w0.width, w0.height), p = .5 + .5 * Math.sin(t * 2.2 - i * 1.1);
        g.drawImage(w0, 0, 0); g.globalAlpha = .35 + .65 * p; g.drawImage(w1, 0, 0); g.globalAlpha = 1; IMG[F.wk[i]] = c; }); } }, 50);
  // ---- 物件图集：用到时才载，载完切成单张 ----
  let atlasLoading = false;
  const loadAtlas = () => { if (atlasLoading) return; atlasLoading = true;
    for (let p = 0; p < PAGES; p++) { const im = new Image(); im.onload = () => { for (const [k, e] of Object.entries(ATLAS)) if (e[0] === p) { const c = document.createElement('canvas'); c.width = e[3]; c.height = e[4]; c.getContext('2d').drawImage(im, e[1], e[2], e[3], e[4], 0, 0, e[3], e[4]); IMG['r107_' + k] = c; } }; im.src = SRC('atlas_' + p); } };
  const loadGround = id => { const k = 'r107g_' + id; if (IMG[k] || loadGround[k]) return; loadGround[k] = 1; const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = SRC('g_' + id); };
  // ---- R117：地下一层的守卫弟子、小怪（Codex 画的战斗立绘 + 地图站姿 / 4 帧原地循环）和私牢救人 ----
  const M117 = __M117__;
  for (const k of ['e_xguard1', 'e_xguard2', 'e_xguard3', 'e_xbat', 'e_xwraith', 'e_xspider', 'n_xguard1', 'n_xguard2', 'n_xguard3', 'bg_cellar_b1', 'bg_cellar_b2']) { const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = SRC(k); }
  // R117-F 洞穴战斗背景：原来的 bg_cellar 从没有过（退回山道图），地下的战斗、剧情一律换成 Codex 画的阴湿密道；炼魂谷长老那场用炼魂密室
  try { if (typeof K4 === 'object') { const o = K4.cellar; K4.cellar = () => IMG.bg_cellar_b1 ? 'bg_cellar_b1' : o(); } } catch (e) {}
  if (typeof startBattle === 'function') startBattle = (o => function (cfg) { if (cfg && /炼魂/.test(cfg.title || '') && IMG.bg_cellar_b2) cfg.bg = 'bg_cellar_b2'; return o.apply(this, arguments); })(startBattle);
  const MM = {};
  for (const k of ['xbat', 'xwraith', 'xspider']) { const im = new Image(); im.src = SRC('mm_' + k); MM[k] = { im, cv: [] }; }
  setInterval(() => { const t = performance.now() / 1000;
    for (const k in MM) { const { im, cv } = MM[k], A = M117[k]; if (!im.complete || !im.naturalWidth) continue; const f = Math.floor(t * (k === 'xwraith' ? 5 : 8)) % 4;
      if (!cv[f]) { const c = document.createElement('canvas'); c.width = A.fw; c.height = A.fh; c.getContext('2d').drawImage(im, f * A.fw, 0, A.fw, A.fh, 0, 0, A.fw, A.fh); cv[f] = c; } IMG['mm_' + k] = cv[f]; } }, 60);
  if (typeof MOB_DB === 'object') Object.assign(MOB_DB, {
    xbat: { key: 'e_xbat', mkey: 'mm_xbat', name: '血纹蝙蝠', hp: 420, atk: 44, def: 8, spd: 16, h: 255, mh: 62, xie: true },
    xwraith: { key: 'e_xwraith', mkey: 'mm_xwraith', name: '锁链怨灵', hp: 560, atk: 50, def: 10, spd: 11, h: 255, mh: 96, xie: true },
    xspider: { key: 'e_xspider', mkey: 'mm_xspider', name: '洞穴石蛛', hp: 700, atk: 48, def: 22, spd: 9, h: 255, mh: 58, xie: true },
    xguard1: { key: 'e_xguard1', name: '邪修看守', hp: 640, atk: 52, def: 14, spd: 12, h: 255, mh: 108, xie: true },
    xguard2: { key: 'e_xguard2', name: '持幡符修', hp: 560, atk: 58, def: 10, spd: 13, h: 255, mh: 108, xie: true },
    xguard3: { key: 'e_xguard3', name: '巡夜弟子', hp: 600, atk: 50, def: 12, spd: 15, h: 255, mh: 108, xie: true } });
  if (window.BATTLE_SIZE) Object.assign(window.BATTLE_SIZE, { e_xguard1: 238, e_xguard2: 236, e_xguard3: 236, e_xbat: 150, e_xwraith: 215, e_xspider: 160 });
  if (typeof spawnTileMob === 'function') spawnTileMob = (o => function () { const n0 = (world.mobs || []).length; const r = o.apply(this, arguments);
    for (const a of (world.mobs || []).slice(n0)) { const md = MOB_DB[a.mob]; if (md && md.mkey) a.key = md.mkey; } return r; })(spawnTileMob);
  const GNAME = ['邪修看守', '持幡符修', '巡夜弟子'];
  const GLINE = ['什么人！敢闯长老的私牢——拿下！', '哼，又来一个送死的，正好拿去给长老炼魂。', '站住！这里关的人，谁也别想带走。'];
  const PRISONER = [['多……多谢少侠。我本是过路的散修，被他们一棍打晕拖到这里。', '再晚几日，我这一身修为就要被那长老炼成血丹了。'],
    ['你们……不是邪修？太好了，太好了……', '他们每隔几天就拖一个人去下面，再没见谁回来过。'],
    ['咳……水……谢谢。我是苍月城外采药的，被抓来已经半个月了。', '下面那层血腥气重得很，你们千万当心。'],
    ['我还以为这辈子出不去了。', '这点灵石是我藏在鞋底的，你们拿着，别推辞。'],
    ['少侠留步——那长老在下层布了大阵，专吸人的修为。', '我修为低，帮不上忙，先回苍月城报信去。'],
    ['多谢恩公！我师兄也被关在这附近，求你们也救救他。', '……若他已经不在了，就替我们讨个公道。'],
    ['锁链一松，人就站不住了……多谢，多谢。', '我记下了诸位的模样，日后必报此恩。']];
  const PRS = [];
  setInterval(() => { for (const P of PRS) { const v = IMG[(S.flags && S.flags[P.rk]) ? P.op : P.cl]; if (v) IMG[P.key] = v; } }, 200);
  async function fightGuards(p, i, gk) {
    await say(GNAME[i % 3], GLINE[i % 3]);
    world.locked = true; world.path = null; world.player.moving = false;
    const lvb = 3 + Math.max(0, S.hero.lv - 10) * .3;
    const ens = p.guards.map((g, j) => makeEnemy('xguard' + ((i + j) % 3 + 1), lvb)); ens.push(makeEnemy(['xbat', 'xwraith', 'xspider'][i % 3], lvb));
    S.flash = .5; S.flashColor = '#fff'; await sleep(120); await fadeOut(180);
    const pr = startBattle({ title: '地下一层 · 私牢', bg: 'bg_cellar_b1', enemies: ens, flee: false }); await fadeIn(220); const win = await pr;
    S.scene = drawMap;
    if (win && win !== 'flee') { S.flags = S.flags || {}; S.flags[gk] = 1;
      world.actors = world.actors.filter(a => !(a.npc && p.guards.some(g => Math.abs(a.x - g[0]) < 3 && Math.abs(a.y - g[1]) < 3)));
      await say('', '看守倒在地上，腰间的钥匙串叮当作响。'); }
    else { partyRevive(.3); toast('败下阵来……幸好保住了性命', 2400); }
    world.locked = false;
  }
  const LOOT = [[['p_big', 2], ['gold', 160]], [['p_mp', 3]], [['c_jade', 1], ['gold', 80]], [['p_small', 3], ['gold', 120]]];
  for (const [id, d] of Object.entries(DATA)) {
    const key = PFX + id; if (TMAPS[key]) continue;
    // 碰撞：游程编码还原成 '0'/'1' 字符串
    let s = '', v = d.b0; for (const n of d.b) { s += v.repeat(n); v = v === '1' ? '0' : '1'; }
    const objs = d.o.map(([i, x, y, w, h, sy, f, ph]) => { const nm = NAMES[i]; let img = 'r107_' + nm;
      if ((f & 4) && ANIM[nm]) { img = 'r107_anim_' + id + '_' + ACV.length; ACV.push({ key: img, id: nm, mid: id, ph: ph || 0 }); }
      else if (d.cas && /_cascade$/.test(nm)) { img = 'r107_cas_' + id + '_' + CAS.length; CAS.push({ key: img, base: 'r107_' + nm, mid: id }); IMG[img] = IMG['r107_' + nm]; }
      return { id: nm, img, x, y, w, h, sy, flat: !!(f & 1), flip: !!(f & 2) }; });
    if (d.fm) { const F = d.fm; F.id = id; F.wk = []; FMS.push(F);   // 阵法：巨石和阵楔按状态换图
      for (const o of objs) { if (o.id === F.st[0]) o.img = F.key = 'r107_fm_' + id; const wi = F.w.indexOf(o.id); if (wi >= 0) o.img = F.wk[wi] = 'r107_fmw_' + id + '_' + wi; } }
    const baked = { ground: 'r107g_' + id, w: d.w, h: d.h, cs: 16, cols: d.cols, rows: d.rows, blocked: s, objs };
    const def = { title: d.t, baked, r107: id, water: d.wa || [], indoor: !!(d.meta && d.meta.indoor), start: d.start, npcs: [], leaves: /^yy_|^nw_|cy_north/.test(id),
      chests: d.ch.map(([c, r], i) => ({ c, r, items: LOOT[i % LOOT.length] })),
      exits: d.ex.map(e => Object.assign({}, e, { cond: () => e.to.startsWith(PFX) && !!TMAPS[e.to], msg: e.label + '：这条路还没通（等接进剧情）' })) };
    if (d.fm) { const F = d.fm, st = () => (S.flags && S.flags[F.flag]) || 0, put = v => { S.flags = S.flags || {}; S.flags[F.flag] = v; S.flash = .45; S.flashColor = '#ff5a48'; };
      const at = (x, y) => [x / 64 - .5, y / 64 - .8], [c1, r1] = at(...F.trig), [c2, r2] = at(...F.eye);
      const done = () => say('', '巨石已从中裂开，石阶一路往地下去。');
      def.npcs.push({ key: 'none', c: c1, r: r1, name: '', hidden: true, h: 150, talk: async () => {
        const v = st(); if (v === 0) { await say('', '巨石上刻着一道残旧的纹路，像字又不像字。'); await say('', '指尖刚触到石面，残纹里忽然渗出血光——一道封印在巨石上显了形。'); put(1); }
        else if (v === 1) await say('', '血印在石上一明一暗。阵眼……似乎偏在巨石左侧。'); else await done(); } });
      def.npcs.push({ key: 'none', c: c2, r: r2, name: '', hidden: true, h: 150, talk: async () => {
        const v = st(); if (v === 0) await say('', '一块灰白的岩石，石脚生着青苔。');
        else if (v === 1) { await say('', '找准阵眼，一击而下——血印寸寸崩散，巨石从中裂开，露出往下的石阶。'); put(2); } else await done(); } });
      for (const e of def.exits) if (e.to === PFX + F.exit) { const c0 = e.cond; e.cond = () => st() >= 2 && c0(); delete e.msg; } }
    for (const [x, y, lines] of d.nt || []) def.npcs.push({ key: 'none', c: x / 64 - .5, r: y / 64 - .8, name: '', hidden: true, h: 150, talk: async () => { for (const l of lines) await say('', l); } });   // 可调查的地方（只有旁白）
    if (d.mobs) { const Z = d.z; def.mobs = Object.assign({}, d.mobs, { zone: (c, r) => { const x = (c + .5) * 16, y = (r + .8) * 16; return Z.some(([zx, zy, zr]) => Math.hypot(x - zx, y - zy) < zr); } }); }
    if (d.meta && d.meta.prisons) { const F = k => S.flags && S.flags[k], at = (x, y) => [x / 64 - .5, y / 64 - .8];   // 私牢：先打看守，再开牢门救人
      d.meta.prisons.forEach((p, i) => {
        const o = objs.find(o => o.id === p.cell), gk = 'xxb1_g_' + p.id, rk = 'xxb1_r_' + p.id;
        if (o) { const k2 = 'r107_pr_' + id + '_' + p.id; o.img = k2; PRS.push({ key: k2, cl: 'r107_' + p.cell, op: 'r107_' + p.cell.replace('_关闭', '_开启'), rk }); }
        p.guards.forEach((g, j) => { const [c, r] = at(...g); def.npcs.push({ key: 'n_xguard' + ((i + j) % 3 + 1), c, r, name: GNAME[(i + j) % 3], h: 118, face: 'down', cond: () => !F(gk), talk: async () => { await fightGuards(p, i, gk); } }); });
        const [uc, ur] = at(...p.use);
        def.npcs.push({ key: 'none', c: uc, r: ur, name: '', hidden: true, h: 150, talk: async () => {
          if (F(rk)) return say('', '牢里已经空了，只剩一地乱草和半截断链。');
          if (!F(gk)) { await say('', '铁栅后隐约有人影在动。'); return say('', '牢门边还有邪修看着，得先把他们打发了。'); }
          const L = PRISONER[i % PRISONER.length]; await say('', '铁栅后蜷着一个衣衫破烂的修士，手脚都锁着铁链。叶孤星一剑斩断了锁。');
          S.flags[rk] = 1; S.flash = .35; S.flashColor = '#ffe0a0';
          await say('被囚的修士', L[0]); await say('被囚的修士', L[1]);
          S.hero.gold += 60; addItem('p_big', 1); toast('获救的修士相赠：灵石 ×60、' + ((typeof ITEM_DB === 'object' && ITEM_DB.p_big && ITEM_DB.p_big.name) || '丹药') + ' ×1', 2600);
          const done = d.meta.prisons.filter(q => F('xxb1_r_' + q.id)).length;
          if (done === d.meta.prisons.length) toast('地下一层被关的修士已经全部救出', 3200); else toast('已救出 ' + done + ' / ' + d.meta.prisons.length + ' 人', 2200); } });
      }); }
    TMAPS[key] = def;
    if (d.meta && d.meta.zoom && typeof MAP_ZOOM === 'object' && !MAP_ZOOM[key]) MAP_ZOOM[key] = d.meta.zoom;   // 人物和地图比例
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
    if (D.fm && ((S.flags && S.flags[D.fm.flag]) || 0) === 1) { const [fx, fy] = D.fm.trig, a = .16 + .12 * Math.sin(now * 2.2), R = 320; ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(fx, fy - 170, 0, fx, fy - 170, R); g.addColorStop(0, `rgba(255,50,36,${a})`); g.addColorStop(1, 'rgba(255,50,36,0)'); ctx.fillStyle = g; ctx.fillRect(fx - R, fy - 170 - R, R * 2, R * 2); ctx.restore(); }
    for (const L of D.lights || []) { if (L.x + L.r < cam.x || L.x - L.r > cam.x + vw || L.y + L.r < cam.y || L.y - L.r > cam.y + vh) continue;
      const a = .32 + Math.sin(now * 1.7 + L.x) * .08; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r); g.addColorStop(0, `rgba(${L.c},${a})`); g.addColorStop(1, `rgba(${L.c},0)`); ctx.fillStyle = g; ctx.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); ctx.restore(); }
    return r; })(tileAmbientHigh);
  window.R107_MAPS = { DATA, SPOT: (id, k) => DATA[id] && DATA[id].spots[k] };
})();
