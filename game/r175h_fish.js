// ================= R175 · 云海后庭 · 潭边垂钓（Codex R175 第 2 批）=================
// 作者 11-01：钓鱼要有点难度；11-09：在后庭钓鱼潭里钓，地图里演（叶孤星坐在东岸竹钓台上，朝西甩竿）。
// 流程：点竹钓台 → 点潭面选落点（瀑下急水 / 潭心深水 / 荷边浅水，各出不同的鱼，时辰也有讲究）→ 甩竿、浮漂落水 →
//   水下鱼影游过来，浮漂会先点头试探（这时点就把鱼惊走）→ 真咬钩时浮漂猛沉、冒出「!」竹牌，要马上点 →
//   溜鱼：按住收线、松开放线，鱼标记停在亮框里进度才涨；太紧断线、太松脱钩，大鱼会突然冲 → 起鱼，弹鱼获卡（收进鱼篓 / 放生）。
// 每天 8 竿（歇息后刷新）。放生的锦鲤会留在潭里游。院猫有时会跑来蹲在旁边，钓到小鱼可以喂它。
(function () {
  const PAV = 'qingzhu_upper_pavilion', OX = 1536, D = 'r175f/';
  if (typeof TMAPS === 'undefined' || !TMAPS[PAV] || typeof drawActorT !== 'function' || !window.R175H_ON) return;
  const M = {"angler":{"sit":{"row":0,"n":2,"fps":9,"loop":false,"tip":[[41.0,63.0],[16.5,140.0]]},"cast":{"row":1,"n":8,"fps":9,"loop":false,"tip":[[16.0,146.0],[40.5,101.5],[106.0,71.5],[172.5,64.5],[114.5,59.5],[4.5,77.5],[4.5,128.5],[9.5,147.5]]},"wait":{"row":2,"n":4,"fps":6,"loop":true,"tip":[[12.0,152.0],[12.5,150.5],[12.5,149.5],[12.5,150.5]]},"tap":{"row":3,"n":4,"fps":9,"loop":false,"tip":[[12.5,149.5],[17.5,134.5],[29.0,139.0],[14.5,143.0]]},"hook":{"row":4,"n":4,"fps":9,"loop":false,"tip":[[10.5,158.5],[26.0,144.0],[64.5,64.0],[47.5,115.5]]},"fight":{"row":5,"n":6,"fps":6,"loop":true,"tip":[[53.0,92.5],[92.0,84.0],[112.0,87.5],[52.5,80.5],[21.5,108.5],[42.0,89.0]]},"land":{"row":6,"n":6,"fps":9,"loop":false,"tip":[[27.5,140.5],[29.5,115.5],[29.0,73.5],[33.5,17.5],[21.5,16.0],[7.5,35.0]]},"miss":{"row":7,"n":6,"fps":9,"loop":false,"tip":[[30.5,121.5],[89.0,68.5],[122.0,60.0],[48.0,91.5],[29.5,128.5],[24.5,146.5]]}},"float":{"idle":{"row":0,"n":6,"fps":8,"loop":true},"nod":{"row":1,"n":4,"fps":8,"loop":true},"dive":{"row":2,"n":6,"fps":8,"loop":false},"land":{"row":3,"n":6,"fps":8,"loop":false},"ring":{"row":4,"n":6,"fps":8,"loop":false}},"float_disp":{"size":[58,58],"foot":[29,36.25]},"shadow":[{"y":0,"w":42,"h":25,"n":4,"fps":6},{"y":25,"w":62,"h":36,"n":4,"fps":6},{"y":61,"w":88,"h":52,"n":4,"fps":6}],"cat":{"watch":{"row":0,"n":6,"fps":6},"reach":{"row":1,"n":6,"fps":6},"eat":{"row":2,"n":6,"fps":6}},"cat_disp":{"size":[112,112]},"cards":{"crucian":[0,"鲫鱼",false,false],"minnow":[1,"白条",false,false],"grass_carp":[2,"草鱼",false,false],"shrimp":[3,"青虾",false,false],"carp":[4,"鲤鱼",false,false],"perch":[5,"鳜鱼",false,false],"koi":[6,"锦鲤",false,false],"silver_scale":[7,"银鳞鱼",false,false],"starfish":[8,"星斑鱼",false,false],"salamander":[9,"灵鲵",true,false],"turtle":[10,"潭底老龟",false,true],"sandal":[11,"破草鞋",false,false],"twig":[12,"枯树枝",false,false]},"ing":{"ingredient_crucian":[0,"鲫鱼"],"ingredient_minnow":[1,"白条"],"ingredient_grass_carp":[2,"草鱼"],"ingredient_shrimp":[3,"青虾"],"ingredient_carp":[4,"鲤鱼"],"ingredient_perch":[5,"鳜鱼"],"ingredient_silver_scale":[6,"银鳞鱼"],"ingredient_starfish":[7,"星斑鱼"],"old_rod":[8,"旧竹竿"],"purple_rod":[9,"紫竹竿"],"silk_rod":[10,"灵丝竿"],"worm_bait":[11,"蚯蚓"],"rice_bait":[12,"灵米团"]},"dish":{"crucian_tofu":[0,"鲫鱼豆腐汤"],"steamed_perch":[1,"清蒸鳜鱼"],"sweet_carp":[2,"糖醋鲤鱼"],"braised_prawn":[3,"油焖青虾"],"silver_congee":[4,"银鳞灵米粥"],"star_soup":[5,"星斑鱼汤"],"cat_dried_fish":[6,"小鱼干"]},"ui":{"catch_card":[0,0,338,448],"book_blank":[340,0,704,380],"today_creel":[0,450,420,230],"creel_panel":[422,450,380,176],"bite":[804,450,76,88],"progress_rim":[882,450,64,64],"tension_frame":[0,682,360,60],"button_paper":[362,682,150,48],"button_green":[514,682,150,48],"keep_btn":[666,682,150,48],"release_btn":[818,682,150,48],"fish_marker":[970,682,46,46],"tension_band":[0,744,304,20]},"today_slots":[[58,133,96,58],[160,133,96,58],[264,133,96,58]]};
  const Z = {"瀑下急水":[[605,346],[910,340],[956,386],[868,424],[672,415]],"潭心深水":[[582,424],[856,417],[958,407],[954,497],[845,561],[710,578],[589,522]],"荷边浅水":[[470,388],[559,378],[601,420],[582,493],[518,530],[463,470]]};
  const CASTS = 8;
  const F = () => (S.flags = S.flags || {});
  // 每歇一次（换一个时辰）刷新 8 竿：用「第几天 + 时辰」当钥匙，钥匙一变就清零
  const restKey = () => (F().qz_day || 1) + '_' + (F().qz_shi || '');
  const left = () => { const f = F(), k = restKey(); if (f.r175_rk !== k) { f.r175_rk = k; f.r175_used = 0; } return CASTS - (f.r175_used || 0); };
  if (typeof partyHealAll === 'function') partyHealAll = (o => function () { F().r175_used = 0; return o.apply(this, arguments); })(partyHealAll);
  const IM = {}; let req = false;
  const FK = ['angler', 'float', 'shadow', 'cat', 'cards', 'ing', 'ui'], FAIL = {};
  const ld = k => { const i = new Image(); i.onload = () => { IM[k] = i; if (k === 'ing') mkIcons(); }; i.onerror = () => { FAIL[k] = (FAIL[k] || 0) + 1; if (FAIL[k] < 3) setTimeout(() => ld(k), 1500 * FAIL[k]); }; i.src = (window.R162_ASSETS && R162_ASSETS[D + k + '.webp']) || (D + k + '.webp'); };
  const need = () => { if (req) return; req = true; FK.forEach(ld); };
  window.R175_FISH_READY = () => { need(); return FK.filter(k => IM[k] || FAIL[k] >= 3).length / FK.length; };
  setTimeout(need, 9000);
  tileSetMap = (o => function (name) { if (name === PAV) need(); return o.apply(this, arguments); })(tileSetMap);
  const now = () => performance.now() / 1000;

  // ---------- 鱼 ----------
  // w：三片钓区的权重 [瀑下急水, 潭心深水, 荷边浅水]；t：时辰倍率；p 力气 sp 速度 zw 亮框宽 nd 要溜几秒 win 咬钩反应时间；sz 尺寸（寸）
  const FISH = [
    { id: 'crucian', w: [2, 3, 3], p: .45, sp: 1.0, zw: .34, nd: 2.8, win: .55, sz: [4, 9], r: '寻常', sell: 12, sh: 1 },
    { id: 'minnow', w: [0, 1, 4], t: { 戌: .3, 子: .2 }, p: .3, sp: .9, zw: .4, nd: 2.0, win: .6, sz: [3, 6], r: '寻常', sell: 6, sh: 0 },
    { id: 'grass_carp', w: [2, 2, 0], t: { 卯: 1.6, 酉: 1.6 }, p: .65, sp: 1.2, zw: .3, nd: 3.4, win: .5, sz: [12, 26], r: '寻常', sell: 18, sh: 2 },
    { id: 'shrimp', w: [0, 0, 4], p: .25, sp: .8, zw: .42, nd: 1.8, win: .6, sz: [2, 4], r: '寻常', sell: 8, sh: 0 },
    { id: 'carp', w: [0, 3, 1], t: { 午: 1.5, 酉: 1.5, 子: .4 }, p: .7, sp: 1.3, zw: .28, nd: 3.8, win: .5, sz: [10, 20], r: '少见', sell: 25, sh: 2 },
    { id: 'perch', w: [3, 0, 0], t: { 卯: 1.8, 午: 1.2, 戌: .3, 子: .2 }, p: .85, sp: 1.6, zw: .25, nd: 4.2, win: .45, sz: [9, 16], r: '珍品', sell: 40, sh: 1 },
    { id: 'koi', w: [0, 0, 1.2], t: { 午: 2, 卯: .5, 酉: .8, 戌: 0, 子: 0 }, p: .6, sp: 1.4, zw: .28, nd: 3.6, win: .45, sz: [8, 14], r: '珍品', sell: 60, sh: 1 },
    { id: 'silver_scale', w: [0, 2, 0], t: { 卯: 0, 午: 0, 酉: 0 }, p: .9, sp: 1.8, zw: .23, nd: 4.4, win: .42, sz: [9, 15], r: '珍品', sell: 70, sh: 1 },
    { id: 'starfish', w: [0, .8, 0], t: { 卯: 0, 午: 0, 酉: 0, 戌: 0 }, p: 1.0, sp: 1.9, zw: .22, nd: 4.6, win: .4, sz: [10, 18], r: '稀世', sell: 150, sh: 2 },
    { id: 'salamander', w: [.35, 0, 0], t: { 午: 0, 酉: 0, 戌: 0, 子: 0 }, p: 1.0, sp: 2.0, zw: .2, nd: 5.0, win: .38, sz: [14, 24], r: '稀世', sh: 2 },
    { id: 'turtle', w: [0, .3, 0], p: 1.1, sp: .8, zw: .3, nd: 5.5, win: .5, sz: [16, 22], r: '传说', sh: 2 },
    { id: 'sandal', w: [0, .4, .8], p: .35, sp: .7, zw: .42, nd: 2.0, win: .6, junk: 1, sh: 0 },
    { id: 'twig', w: [.6, 0, .5], p: .25, sp: .6, zw: .44, nd: 1.6, win: .65, junk: 1, sh: 0 },
  ];
  const FD = {}; for (const f of FISH) { f.name = M.cards[f.id][1]; FD[f.id] = f; }
  const EDIBLE = { crucian: 1, minnow: 1, grass_carp: 1, shrimp: 1, carp: 1, perch: 1, silver_scale: 1, starfish: 1 };
  const DESC = { crucian: '潭里最常见的鲫鱼，炖汤最鲜。', minnow: '细长的白条，炸成小鱼干，院里的猫最爱。', grass_carp: '劲大肉厚的草鱼，清早和黄昏最爱咬钩。', shrimp: '荷叶底下的青虾，透亮透亮的。',
    carp: '金红的鲤鱼，正午和黄昏常在潭心打转。', perch: '鳜鱼爱待在瀑布底下的急水里，花纹像披了一身斑。', koi: '红白相间的锦鲤，好看得舍不得吃。', silver_scale: '只在夜里出来的银鳞鱼，鳞片映着月光。', starfish: '子夜才咬钩的星斑鱼，身上的斑点像缀了一把星子。' };
  for (const id in EDIBLE) ITEM_DB['fish_' + id] = Object.assign(ITEM_DB['fish_' + id] || {}, { name: FD[id].name, sell: FD[id].sell, cat: '食材', desc: DESC[id] + '在云海后庭的钓鱼潭里钓到的。可以卖钱。' });
  ITEM_DB.fish_koi = Object.assign(ITEM_DB.fish_koi || {}, { name: '锦鲤', sell: 60, desc: DESC.koi + '可以卖钱；在钓鱼潭放生的话，它会一直在潭里游。' });
  ITEM_DB.f_oldcoin = Object.assign(ITEM_DB.f_oldcoin || {}, { name: '旧铜钱', sell: 0, desc: '潭底老龟背上用红绳系着的一枚旧铜钱，正面刻着一个「叶」字。不知道是多少年前，谁在这潭边许过愿。' });
  // 行囊图标：可吃的鱼用 Codex 厨房格
  const ICON = {};
  function mkIcons() { const im = IM.ing; if (!im) return; for (const id in EDIBLE) { const r = M.ing['ingredient_' + id]; if (!r) continue; const c = document.createElement('canvas'); c.width = c.height = 160; c.getContext('2d').drawImage(im, (r[0] % 7) * 160, Math.floor(r[0] / 7) * 160, 160, 160, 0, 0, 160, 160); ICON['fish_' + id] = c; } }
  const cardCanvas = id => { const im = IM.cards, r = M.cards[id]; if (!im || !r) return null; const c = document.createElement('canvas'); c.width = 384; c.height = 256; c.getContext('2d').drawImage(im, (r[0] % 4) * 384, Math.floor(r[0] / 4) * 256, 384, 256, 0, 0, 384, 256); return c; };
  if (typeof itemIcon === 'function') itemIcon = (o => function (id, x, y, r) {
    let c = ICON[id]; if (!c && (id === 'fish_koi' || id === 'f_oldcoin') && IM.cards) c = ICON[id] = cardCanvas(id === 'fish_koi' ? 'koi' : 'turtle');
    if (c) { const s = r * 2.4, h = s * c.height / c.width; ctx.drawImage(c, x - s / 2, y - h / 2, s, h); return; }
    return o.apply(this, arguments); })(itemIcon);

  const catName = () => { try { return (window.R139_CATNAME && R139_CATNAME()) || '小猫'; } catch (e) { return '小猫'; } };
  const SHI = () => { const s = window.QZ_SHI && QZ_SHI(); if (s) return s; const t = window.TOD ? TOD() : ''; return t === 'night' ? '戌' : t === 'dawn' ? '卯' : t === 'dusk' ? '酉' : '午'; };
  const ZN = ['瀑下急水', '潭心深水', '荷边浅水'];
  function roll(zi) {
    if (window.__forceFish && FD[window.__forceFish]) { const f = FD[window.__forceFish]; window.__forceFish = null; return f; }   // 测试用
    const s = SHI(), f = F(), caught = f.r175_wins || 0, t = [];
    for (const x of FISH) { let w = x.w[zi] || 0; if (x.t && x.t[s] != null) w *= x.t[s]; if (x.id === 'turtle' && (f.r175_turtle || caught < 6)) w = 0; if (w > 0) t.push([x, w]); }
    let r = Math.random() * t.reduce((a, b) => a + b[1], 0); for (const [x, w] of t) if ((r -= w) < 0) return x; return t[0][0];
  }
  const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const zoneAt = (lx, ly) => ZN.findIndex(n => inPoly(lx, ly, Z[n]));
  const sizeTxt = c => { const n = Math.round(c); if (n < 10) return '★寸'.replace('★', '一二三四五六七八九'[n - 1]); const ch = Math.floor(n / 10), cun = n % 10, d = '一二三四五六七八九'; return (ch === 1 ? '一' : d[ch - 1]) + '尺' + (cun ? d[cun - 1] + '寸' : ''); };

  // ---------- 状态 ----------
  const DOCK = () => window.R175H_DOCK || [1105 - OX, 472];
  const G = { on: false, phase: '', act: 'wait', a0: 0, fx: 0, fy: 0, tx: 0, ty: 0, cast0: 0, fl: 'idle', fl0: 0, ten: .5, prog: 0, fish: null, sh: null, msg: '', msgT: 0, hold: false, card: null, cat: null, caught: [] };
  const TAPS = [];
  const busy = () => (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice) || (window.IG_OPEN && IG_OPEN());   // 对话框 / 选项 / 获得物品弹窗开着时，点击照常交给它们
  try { cv.addEventListener('pointerdown', e => { if (!G.on || busy()) return; const q = toLogical(e); TAPS.push(q); G.hold = true; e.stopImmediatePropagation(); e.preventDefault(); }, true);
    for (const ev of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(ev, () => { G.hold = false; }, true); } catch (e) {}
  const take = () => TAPS.shift() || null;
  const flash = (m, s = 1.3) => { G.msg = m; G.msgT = now() + s; };
  const setAct = (a) => { G.act = a; G.a0 = now(); };
  const actF = () => { const d = M.angler[G.act]; const k = Math.floor((now() - G.a0) * d.fps); return d.loop ? k % d.n : Math.min(d.n - 1, k); };
  const actDone = () => { const d = M.angler[G.act]; return !d.loop && (now() - G.a0) * d.fps >= d.n; };
  const setFl = k => { G.fl = k; G.fl0 = now(); };
  const AZK = () => (typeof AZ === 'function' ? AZ() : 1);   // 地图缩放时引擎把人物放大 1/VZ（这张图 1.33），钓台动作跟着一起放大，和走路时一样大
  const tip = () => { const p = world.player, d = M.angler[G.act], tp = d.tip[actF()] || d.tip[0], k = AZK(); return [p.x + (tp[0] - 128) * .5 * k, p.y + (tp[1] - 245) * .5 * k]; };
  const toScr = (wx, wy) => { const z = VZ(), c = world.cam || { x: 0, y: 0 }; return [(wx - c.x) * z, (wy - c.y) * z]; };
  // ---------- 按钮（屏幕坐标）----------
  const BTN_QUIT = { x: W - 190, y: H - 78, w: 150, h: 48 };
  const inR = (p, r) => p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const ui = (k, x, y, w, h) => { const r = M.ui[k], im = IM.ui; if (!r || !im) return false; ctx.drawImage(im, r[0], r[1], r[2], r[3], x, y, w == null ? r[2] : w, h == null ? r[3] : h); return true; };

  // ---------- 画：叶孤星（坐在钓台上）----------
  drawActorT = (o => function (a, now0) {
    if (!(G.on && a === world.player && IM.angler)) return o.apply(this, arguments);
    const d = M.angler[G.act], f = actF(), k = AZK();
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(a.x + 4, a.y - 2, 22, 7, 0, 0, 7); ctx.fill();
    ctx.drawImage(IM.angler, f * 256, d.row * 256, 256, 256, a.x - 64, a.y - 122.5, 128, 128); ctx.restore();
    ctx.save(); if (k !== 1) { ctx.translate(a.x, a.y); ctx.scale(1 / k, 1 / k); ctx.translate(-a.x, -a.y); }   // 鱼线、猫：撤回引擎的人物缩放，按世界坐标画
    if (G.fv) {   // 鱼线：竿尖 → 浮漂，溜鱼时绷直
      const [x0, y0] = tip(), x1 = G.fx, y1 = G.fy - 8, mx = (x0 + x1) / 2, sag = G.phase === 'reel' ? 4 + (1 - G.ten) * 30 : G.phase === 'cast' ? -24 : 40;
      ctx.strokeStyle = 'rgba(250,250,240,.8)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, Math.max(y0, y1) + sag, x1, y1); ctx.stroke(); }
    if (G.cat && IM.cat) { const c = G.cat, cd = M.cat[c.act], n = Math.floor((now() - c.t0) * cd.fps), cf = c.loop === false ? Math.min(cd.n - 1, n) : n % cd.n, sz = M.cat_disp.size[0];
      ctx.save(); ctx.translate(c.x, c.y); ctx.scale(k, k); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, -1, 20, 6, 0, 0, 7); ctx.fill();
      ctx.drawImage(IM.cat, cf * 128, cd.row * 128, 128, 128, -sz * .5, -sz * (240 / 256), sz, sz); ctx.restore(); }
    ctx.restore();
  })(drawActorT);
  // ---------- 画：水下鱼影 + 浮漂（地面层之后，r175h_houting.js 调用）----------
  const AMB = [...Array(4)].map((_, i) => ({ s: i % 3, x: 700 + i * 60, y: 450 + (i % 2) * 40, tx: 0, ty: 0, k: 0, dir: 1 }));
  function shadowAt(s, x, y, dir, al) { const im = IM.shadow; if (!im) return; const d = M.shadow[s], f = Math.floor(now() * d.fps + x * .01) % d.n;
    ctx.save(); ctx.globalAlpha = al; ctx.translate(x - OX, y); if (dir > 0) ctx.scale(-1, 1); ctx.drawImage(im, f * d.w, d.y, d.w, d.h, -d.w / 2, -d.h / 2, d.w, d.h); ctx.restore(); }
  window.R175_FISH_UNDER = function () {
    const t = now();
    for (const a of AMB) { if (!a.k || t > a.k) { const P = Z['潭心深水']; for (let n = 0; n < 9; n++) { const x = 600 + Math.random() * 380, y = 410 + Math.random() * 170; if (inPoly(x, y, P)) { a.tx = x; a.ty = y; break; } } a.k = t + 3 + Math.random() * 4; }
      const dx = a.tx - a.x, dy = a.ty - a.y, l = Math.hypot(dx, dy); if (l > 1) { a.x += dx / l * .35; a.y += dy / l * .35; a.dir = dx > 0 ? 1 : -1; }
      if (!(G.on && G.sh)) shadowAt(a.s, a.x, a.y, a.dir, .42); }
    if (!G.on) return;
    if (G.sh) { const s = G.sh; shadowAt(s.s, s.x, s.y, s.dir, s.al); }
    const im = IM.float; if (!im || !G.fv) return;
    const d = M.float[G.fl], k = Math.floor((now() - G.fl0) * d.fps), f = d.loop === false ? Math.min(d.n - 1, k) : k % d.n, [w, h] = M.float_disp.size, [fx, fy] = M.float_disp.foot;
    if (G.phase === 'cast' && now() - G.cast0 < .45) { const u = (now() - G.cast0) / .45, [x0, y0] = tip(); G.fx = x0 + (G.tx - x0) * u; G.fy = y0 + (G.ty - y0) * u - Math.sin(u * Math.PI) * 90; }
    ctx.drawImage(im, f * 80, d.row * 80, 80, 80, G.fx - fx, G.fy - fy, w, h);
    if (G.ring) { const rd = M.float.ring, rk = Math.floor((now() - G.ring) * rd.fps); if (rk < rd.n) ctx.drawImage(im, rk * 80, rd.row * 80, 80, 80, G.fx - fx * 1.6, G.fy - fy * 1.2, w * 1.6, h * 1.6); else G.ring = 0; }
  };
  // ---------- 画：屏幕上的竹牌、拉力条、鱼获卡、鱼篓 ----------
  function drawUI() {
    if (!G.on || !IM.ui) return; const t = now();
    ctx.save();
    // 今日鱼篓（左上）：Codex 面板上已经写着「今日鱼篓」，右边补一句还剩几竿；三个格子放最近钓到的
    { const r = M.ui.today_creel, sc = .74, x = 18, y = 10; ui('today_creel', x, y, r[2] * sc, r[3] * sc);
      ctx.font = `600 15px ${FONT}`; ctx.textAlign = 'right'; ctx.fillStyle = '#6a4a22'; ctx.fillText('还剩 ' + Math.max(0, left()) + ' 竿', x + 362 * sc, y + 128 * sc);
      const sl = M.today_slots || [];
      G.caught.slice(-3).forEach((id, i) => { const q = sl[i]; if (!q) return; const c = ICON['fish_' + id] || (IM.cards && (ICON['c_' + id] = ICON['c_' + id] || cardCanvas(id))); if (!c) return;
        const bw = q[2] * sc, bh = q[3] * sc, f = Math.min(bw / c.width, bh / c.height) * 1.08, w = c.width * f, h = c.height * f; ctx.drawImage(c, x + q[0] * sc + (bw - w) / 2, y + q[1] * sc + (bh - h) / 2, w, h); }); }
    // 收竿
    if (G.phase !== 'card') { ui('button_paper', BTN_QUIT.x, BTN_QUIT.y); ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center'; textOutline('收　竿', BTN_QUIT.x + 75, BTN_QUIT.y + 32, '#fff3d6', '#3a1a06', 4); }
    // 提示
    if (G.phase === 'aim') { ctx.font = `34px ${BRUSH}`; ctx.textAlign = 'center'; textOutline('点潭面，选个落点', W / 2, H - 120, '#ffe9b0', '#2a1406', 6);
      ctx.font = `600 18px ${FONT}`; textOutline('瀑下急水 · 潭心深水 · 荷边浅水，出的鱼不一样', W / 2, H - 88, '#f6ecd0', '#2a1406', 4); }
    if (G.fv && window.TOD && TOD() === 'night') { const [sx, sy] = toScr(G.fx, G.fy - 9), r = 9 + Math.sin(t * 5) * 1.5, g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.2);   // 夜里用夜光漂：漂尖一点暖光
      g.addColorStop(0, 'rgba(255,246,200,.85)'); g.addColorStop(.35, 'rgba(255,220,140,.35)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, r * 2.2, 0, 7); ctx.fill(); }
    if (G.phase === 'bite') { const [sx, sy] = toScr(G.fx, G.fy), b = Math.abs(Math.sin(t * 14)) * 8; ui('bite', sx - 38, sy - 104 - b); }
    if (G.phase === 'reel') {   // 竹制拉力框：左松右紧；亮框里进度才涨
      const r = M.ui.tension_frame, x = W / 2 - r[2] / 2 - 30, y = H - 104, br = M.ui.tension_band, bx = x + (r[2] - br[2]) / 2, by = y + (r[3] - br[3]) / 2;
      ui('tension_band', bx, by); ui('tension_frame', x, y);
      const z0 = G.zc - G.fish.zw / 2, z1 = G.zc + G.fish.zw / 2;
      ctx.save(); ctx.strokeStyle = 'rgba(255,248,215,.95)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(255,230,150,.9)'; ctx.shadowBlur = 10; ctx.strokeRect(bx + br[2] * z0, by - 3, br[2] * (z1 - z0), br[3] + 6); ctx.restore();
      const mk = M.ui.fish_marker; ui('fish_marker', bx + br[2] * G.ten - mk[2] / 2, by + br[3] / 2 - mk[3] / 2);
      const pr = M.ui.progress_rim, px = x + r[2] + 18, py = y + r[3] / 2 - pr[3] / 2, q = Math.min(1, G.prog / G.fish.nd);
      ctx.save(); ctx.fillStyle = 'rgba(60,40,20,.55)'; ctx.beginPath(); ctx.arc(px + pr[2] / 2, py + pr[3] / 2, pr[2] / 2 - 9, 0, 7); ctx.fill();
      ctx.fillStyle = '#f2c860'; ctx.beginPath(); ctx.moveTo(px + pr[2] / 2, py + pr[3] / 2); ctx.arc(px + pr[2] / 2, py + pr[3] / 2, pr[2] / 2 - 9, -Math.PI / 2, -Math.PI / 2 + q * Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.restore();
      ui('progress_rim', px, py);
      ctx.font = `600 18px ${FONT}`; ctx.textAlign = 'center'; textOutline('按住收线 · 松开放线 · 让鱼标记停在亮框里', W / 2 - 30, y - 12, '#fff3d6', '#2a1406', 4); }
    if (G.card) drawCard(G.card, t);
    if (G.msg && t < G.msgT) { ctx.font = `42px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(G.msg, W / 2, 150, '#ffe39a', '#1a0c00', 6); }
    ctx.restore();
  }
  const CS = 1.3, PAPER = [110, 95, 172, 325];   // 卷轴纸面（原图像素）
  function cardRects(c) { const r = M.ui.catch_card, w = r[2] * CS, h = r[3] * CS, x = 96, y = Math.round((H - h) / 2), n = c.btns.length;
    const bw = 140 * CS, bh = (n >= 3 ? 36 : 40) * CS, gap = (n >= 3 ? 5 : 8) * CS, y0 = y + (n >= 3 ? 292 : n === 2 ? 326 : 346) * CS, cx = x + (PAPER[0] + PAPER[2] / 2) * CS;
    return { x, y, w, h, cx, n, bs: c.btns.map((k, i) => ({ k, x: cx - bw / 2, y: y0 + i * (bh + gap), w: bw, h: bh })) }; }
  const BTXT = { keep: '收进鱼篓', release: '放　生', take: '算　了' };
  function drawCard(c, t) {
    const R = cardRects(c), u = Math.min(1, (t - c.t0) / .25), S3 = R.n >= 3; ctx.save(); ctx.globalAlpha = u; ctx.translate(0, (1 - u) * 20);
    ctx.fillStyle = 'rgba(8,10,14,.35)'; ctx.fillRect(-20, -40, W + 40, H + 80);
    ui('catch_card', R.x, R.y, R.w, R.h); ctx.textAlign = 'center';
    ctx.font = `${Math.round(24 * CS)}px ${BRUSH}`; textOutline(c.title, R.cx, R.y + 128 * CS, '#6a3e14', '#f3e6c6', 3);
    const im = c.art; if (im) { const aw = (S3 ? 132 : 164) * CS, ah = aw * im.height / im.width; ctx.drawImage(im, R.cx - aw / 2, R.y + (S3 ? 136 : 140) * CS, aw, ah); }
    ctx.font = `${Math.round(32 * CS)}px ${BRUSH}`; textOutline(c.name, R.cx, R.y + (S3 ? 256 : 284) * CS, '#3a2410', '#f3e6c6', 3);
    ctx.font = `600 ${Math.round(14 * CS)}px ${FONT}`; ctx.fillStyle = '#6a4a22'; ctx.fillText(c.line, R.cx, R.y + (S3 ? 278 : 308) * CS);
    for (const b of R.bs) { const green = b.k === 'keep'; ui(green ? 'button_green' : 'button_paper', b.x, b.y, b.w, b.h);
      ctx.font = `600 ${Math.round(17 * CS)}px ${FONT}`; const tx = b.k === 'feed' ? '喂' + (catName().length <= 3 ? catName() : '猫') : BTXT[b.k];
      textOutline(tx, b.x + b.w / 2, b.y + b.h / 2 + 7 * CS, green ? '#fff6dc' : '#4a2c10', green ? '#22340f' : '#f6ecd0', 4); }
    ctx.restore(); }
  S.overlay.push({ draw() { try { drawUI(); } catch (e) {} } });

  // ---------- 一竿 ----------
  async function frame() { await nextFrame(); }
  async function waitAct() { while (!actDone()) await frame(); }
  async function oneCast(lx, ly, zi) {
    const fish = roll(zi), wx = lx - OX;
    G.fish = fish; G.tx = wx; G.ty = ly; G.phase = 'cast'; setAct('cast'); try { playSnd('sfx_swing'); } catch (e) {}
    G.fv = false; await sleep(500); G.cast0 = now(); G.fv = true; setFl('idle'); await sleep(450); G.fx = wx; G.fy = ly; setFl('land'); G.ring = now();
    await waitAct(); setAct('wait'); G.phase = 'wait'; setFl('idle'); TAPS.length = 0;
    // 鱼影从旁边游过来 → 在浮漂底下转悠，先试探着点一两下头（这时点就把它惊走）→ 真咬钩
    // come 游过来 / near 在漂下转悠 / nod 试探点头 / flee 被惊走（过一会儿再来一条）
    const spawn = () => { const ang = Math.random() * Math.PI * 2, dist = 110 + Math.random() * 60; return { s: fish.sh, x: lx + Math.cos(ang) * dist, y: ly + Math.sin(ang) * dist * .55, dir: 1, al: 0, ang }; };
    G.sh = spawn(); let st = 'come', tN = 0, nods = Math.random() < .25 ? 0 : 1 + (Math.random() < fish.p * .5 ? 1 : 0), last = now();
    while (true) { await frame(); const t = now(), dt = Math.min(.05, t - last); last = t;
      const s = G.sh, gx = st === 'flee' ? lx + Math.cos(s.ang) * 220 : lx + 16 + Math.sin(t * 1.7) * (st === 'come' ? 0 : 7), gy = st === 'flee' ? ly + Math.sin(s.ang) * 120 : ly + 5 + Math.cos(t * 1.3) * (st === 'come' ? 0 : 4);
      const dx = gx - s.x, dy = gy - s.y, l = Math.hypot(dx, dy), v = st === 'flee' ? 160 : st === 'come' ? 42 + fish.sp * 12 : 20;
      s.al = st === 'flee' ? Math.max(0, s.al - dt * .8) : Math.min(.58, s.al + dt * .7); if (l > 1) { s.x += dx / l * Math.min(l, v * dt); s.y += dy / l * Math.min(l, v * dt); if (Math.abs(dx) > 2) s.dir = dx > 0 ? 1 : -1; }
      if (st === 'come' && l < 12) { st = 'near'; tN = t + .7 + Math.random() * 1.1; }
      else if (st === 'near' && t >= tN) { if (nods > 0) { nods--; st = 'nod'; tN = t + .55; setFl('nod'); setAct('tap'); } else break; }
      else if (st === 'nod' && t >= tN) { st = 'near'; tN = t + .6 + Math.random() * 1.0; setFl('idle'); }
      else if (st === 'flee' && t >= tN) { G.sh = spawn(); st = 'come'; nods = Math.random() < .4 ? 0 : 1; }
      if (G.act === 'tap' && actDone()) setAct('wait');
      const tp = take();
      if (tp) { if (inR(tp, BTN_QUIT)) return 'quit';
        if (st !== 'flee') { flash(st === 'nod' ? '只是试探……鱼被惊走了' : '点早了，鱼被惊走了……', 1.3); try { playSnd('ui_cancel'); } catch (e) {} st = 'flee'; tN = t + 2.4; setFl('idle'); G.ring = now(); } } }
    // 咬钩
    G.phase = 'bite'; setFl('dive'); try { playSnd('sfx_hit', .5); } catch (e) {} TAPS.length = 0;
    let win = fish.win, hit = false, last2 = now();
    while (win > 0) { await frame(); const t = now(); win -= t - last2; last2 = t; const tp = take(); if (tp) { if (inR(tp, BTN_QUIT)) return 'quit'; hit = true; break; } }
    if (!hit) { G.phase = 'miss'; setAct('miss'); G.sh = null; G.fv = false; flash('慢了一步……鱼溜了', 1.4); await waitAct(); setAct('wait'); return null; }
    setAct('hook'); G.phase = 'reel'; G.ten = .35; G.prog = 0; G.zc = .37 + Math.random() * .1; setFl('nod');
    await sleep(300); setAct('fight');
    let slack = 0, surge = 0, sdir = 1, last3 = now();
    while (true) { await frame(); const t = now(), dt = Math.min(.05, t - last3); last3 = t; take();
      surge -= dt; if (surge <= 0) { surge = .4 + Math.random() * 1.2 / fish.sp; sdir = Math.random() < .55 ? 1 : -1; }
      const pull = fish.p * (.35 + .65 * Math.abs(Math.sin(t * fish.sp * 2.3))) * sdir;
      G.ten = Math.max(0, Math.min(1, G.ten + ((G.hold ? .55 : -.5) + pull * .5) * dt));
      G.zc = Math.max(.3, Math.min(.54, G.zc + Math.sin(t * fish.sp * .9) * dt * .07));
      const inZ = Math.abs(G.ten - G.zc) <= fish.zw / 2; G.prog = Math.max(0, G.prog + (inZ ? dt : -dt * .45));
      G.fx += Math.sin(t * 3 * fish.sp) * .6; G.fy += Math.cos(t * 2.3 * fish.sp) * .3; if (G.sh) { G.sh.x = G.fx + OX - 10; G.sh.y = G.fy; }
      if (G.ten >= .99) { G.phase = 'miss'; setAct('miss'); G.sh = null; G.fv = false; flash('线断了！', 1.4); try { playSnd('sfx_hurt'); } catch (e) {} await waitAct(); setAct('wait'); return null; }
      slack = G.ten <= .02 ? slack + dt : 0; if (slack > .9) { G.phase = 'miss'; setAct('miss'); G.sh = null; G.fv = false; flash('线太松，脱钩了', 1.4); await waitAct(); setAct('wait'); return null; }
      if (G.prog >= fish.nd) break; }
    G.phase = 'land'; G.sh = null; G.fv = false; setAct('land'); try { playSnd('ui_confirm'); } catch (e) {} await waitAct();
    return fish;
  }
  async function showCard(fish) {
    const f = F(), size = fish.sz ? fish.sz[0] + Math.random() * (fish.sz[1] - fish.sz[0]) : 0;
    const small = fish.id === 'minnow' || fish.id === 'shrimp' || fish.id === 'crucian';
    const btns = fish.id === 'salamander' || fish.id === 'turtle' ? ['release'] : fish.junk ? ['take'] : (G.cat && small ? ['keep', 'release', 'feed'] : ['keep', 'release']);
    const title = fish.junk ? '……钓到了' : fish.r === '传说' || fish.r === '稀世' ? '稀世鱼获' : '今日鱼获';
    G.card = { t0: now(), art: cardCanvas(fish.id), name: fish.name, title, btns, line: fish.junk ? (fish.id === 'sandal' ? '左脚的，右脚的还在潭底' : '它看起来比你还惊讶') : sizeTxt(size) + ' · ' + fish.r };
    G.phase = 'card'; TAPS.length = 0;
    let pick = null; while (!pick) { await frame(); const tp = take(); if (!tp) continue; for (const b of cardRects(G.card).bs) if (inR(tp, b)) { pick = b.k; break; } }
    G.card = null;
    f.r175_book = f.r175_book || {}; f.r175_book[fish.id] = Math.max(f.r175_book[fish.id] || 0, Math.round(size));
    if (fish.junk) return;
    f.r175_wins = (f.r175_wins || 0) + 1;
    if (fish.id === 'turtle') { f.r175_turtle = 1; addItem('f_oldcoin', 1);
      await narrate('一只背上长着青苔的老龟被拖出水面，慢悠悠地伸出脑袋，看了你一眼。');
      await narrate('它背上用红绳系着一枚旧铜钱。你解下铜钱，把它放回潭里——老龟沉下去之前，又回头看了你一眼。');
      try { if (window.itemGet) await itemGet([{ icon: 'item:f_oldcoin', name: '旧铜钱', count: '×1', desc: ITEM_DB.f_oldcoin.desc }], '潭底老龟'); } catch (e) {} return; }
    if (fish.id === 'salamander') { await narrate('灵鲵在你手心里扭了扭，凉丝丝的。你把它放回瀑布底下，它一甩尾巴就不见了。'); toast('灵鲵已记进鱼谱', 1600); return; }
    if (pick === 'release') { if (fish.id === 'koi') { f.r175_koi = Math.min(6, (f.r175_koi || 0) + 1); toast('锦鲤游回潭里，留在潭心打转', 1800); } else toast('放回潭里了', 1200); return; }
    if (pick === 'feed') { const c = G.cat; if (c) { c.act = 'reach'; c.t0 = now(); c.loop = false; await sleep(700); c.act = 'eat'; c.t0 = now(); c.loop = true; }
      if (window.QZ_BOND) QZ_BOND('cat', 2, true); else f.cat_feeds = (f.cat_feeds || 0) + 1; toast('♥ ' + catName() + ' · 情谊 +2　吃得眯起了眼', 1800); await sleep(1600); if (c) { c.act = 'watch'; c.t0 = now(); } return; }
    const id = fish.id === 'koi' ? 'fish_koi' : 'fish_' + fish.id; addItem(id, 1); G.caught.push(fish.id);
    toast('收进鱼篓：' + fish.name, 1400);
  }

  // ---------- 一次垂钓 ----------
  async function session() {
    if (G.on) return;
    const f = F();
    if (left() <= 0) { await narrate('今天潭里的鱼都学精了——歇一觉再来。'); return; }
    need(); if (!IM.angler || !IM.float || !IM.ui) { toast('钓具还在拿……稍等一下再点', 1400); return; }
    if (!f.r175_rod) { f.r175_rod = 1; await narrate('钓台柱子上斜靠着一根旧竹竿，竿梢磨得发亮——是松伯的。'); await say('叶孤星', '（借来用用，回头跟松伯说一声。）'); }
    world.locked = true; const hud0 = S.hud;
    const p = world.player, [dx, dy] = DOCK();
    try { if (typeof moveActor === 'function') await moveActor(p, dx, dy, 200); } catch (e) {}
    p.x = dx; p.y = dy; p.face = 'left'; S.hud = false;
    G.on = true; G.caught = []; G.phase = 'sit'; setAct('sit'); world.camFocus = [800 - OX, 470]; TAPS.length = 0;
    G.cat = Math.random() < ((f.qz_bond || {}).cat || f.cat_feeds ? .7 : .4) ? { x: 1180 - OX, y: 520, act: 'watch', t0: now() } : null;   // 院猫闻着鱼腥味跑来蹲着
    try {
      await waitAct(); setAct('wait');
      while (left() > 0) {
        G.phase = 'aim'; G.fv = false; let tgt = null;
        while (!tgt) { await frame(); const tp = take(); if (!tp) continue; if (inR(tp, BTN_QUIT)) break;
          const z = VZ(), c = world.cam, wx = tp.x / z + c.x, wy = tp.y / z + c.y, zi = zoneAt(wx + OX, wy);
          if (zi < 0) { flash('要落在潭里', 1); continue; } tgt = [wx + OX, wy, zi]; }
        if (!tgt) break;
        f.r175_used = (f.r175_used || 0) + 1;
        const got = await oneCast(...tgt);
        if (got === 'quit') break;
        if (got) await showCard(got);
        G.phase = 'aim'; setAct('wait');
      }
      if (left() <= 0) { G.phase = 'sit'; await narrate('今天的竿数用完了。潭里的鱼也该歇歇了。'); }
    } finally { G.on = false; G.fv = false; G.phase = ''; G.card = null; G.sh = null; G.cat = null; world.camFocus = null; world.locked = false; S.hud = hud0; TAPS.length = 0; }
  }
  // ---------- 入口要看得见（R168 的教训：「钓鱼入口我一直没找到」）----------
  // ① 钓台上方挂「潭边 · 垂钓」名字牌，潭里漂一只浮漂；② 点整片潭水或钓台都能进垂钓；③ 头两回走进后庭提示一句。
  const DOCKR = [1020, 390, 163, 110], TAG = [1092, 384], MARK = [930, 458];
  const dockNpc = () => (world.actors || []).find(a => a.npc && a.npc.name === '竹钓台');
  const onDock = (lx, ly) => lx >= DOCKR[0] && lx <= DOCKR[0] + DOCKR[2] && ly >= DOCKR[1] && ly <= DOCKR[1] + DOCKR[3];
  if (typeof pickInteract === 'function') pickInteract = (o => function (wx, wy) {
    try { if (world.mapName === PAV && !G.on) { const lx = wx + OX; if (onDock(lx, wy) || zoneAt(lx, wy) >= 0) { const a = dockNpc(); if (a) return { type: 'npc', a }; } } } catch (e) {}
    return o.apply(this, arguments); })(pickInteract);
  const markFloat = () => { const im = IM.float; if (!im || G.on) return; const d = M.float.idle, f = Math.floor(now() * d.fps) % d.n, [w, h] = M.float_disp.size, [fx, fy] = M.float_disp.foot;
    ctx.drawImage(im, f * 80, d.row * 80, 80, 80, MARK[0] - OX - fx, MARK[1] - fy, w, h); };
  window.R175_FISH_UNDER = (o => function () { o.apply(this, arguments); try { markFloat(); } catch (e) {} })(window.R175_FISH_UNDER);
  if (typeof drawMap === 'function') drawMap = (o => function () {
    const r = o.apply(this, arguments);
    try { if (world.mapName !== PAV || G.on || !world.cam || (typeof battle !== 'undefined' && battle) || S.menu) return r;
      const z = VZ(), sx = (TAG[0] - OX - world.cam.x) * z, sy = (TAG[1] - world.cam.y) * z;
      if (sx > -120 && sx < W + 120 && sy > -60 && sy < H + 60) { ctx.save(); ctx.textAlign = 'center'; ctx.font = `600 18px ${FONT}`; textOutline('潭边 · 垂钓', sx, sy, '#ffe08a', '#1a0c00', 4); ctx.restore(); } } catch (e) {}
    return r; })(drawMap);
  let inBack = false;
  setInterval(() => { try { const here = world.mapName === PAV && world.player && world.player.x < -260 && !G.on; if (here && !inBack) { const f = F(); if ((f.r175_hint || 0) < 2) { f.r175_hint = (f.r175_hint || 0) + 1; setTimeout(() => { try { if (world.mapName === PAV && !G.on) toast('后庭潭里能钓鱼，点潭水就行', 2600); } catch (e) {} }, 1200); } } inBack = here; } catch (e) {} }, 800);
  window.R175_FISH = session; window.R175_FISH_G = G;
})();
