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
  // 出了青竹 qz_shi 会被清空：那不算换时辰，竿数不重置（同一天、时辰为空就沿用旧钥匙）
  const left = () => { const f = F(); let k = restKey(); if (!f.qz_shi && f.r175_rk && f.r175_rk.split('_')[0] === String(f.qz_day || 1)) k = f.r175_rk; if (f.r175_rk !== k) { f.r175_rk = k; f.r175_used = 0; } return CASTS - (f.r175_used || 0); };
  if (typeof partyHealAll === 'function') partyHealAll = (o => function () { F().r175_used = 0; return o.apply(this, arguments); })(partyHealAll);
  const IM = {}; let req = false;
  const FK = ['angler', 'float', 'shadow', 'cat', 'cards', 'ing', 'ui'], FAIL = {};
  const ld = k => { const i = new Image(); i.onload = () => { IM[k] = i; if (k === 'ing') mkIcons(); }; i.onerror = () => { FAIL[k] = (FAIL[k] || 0) + 1; if (FAIL[k] < 3) setTimeout(() => ld(k), 1500 * FAIL[k]); }; i.src = (window.R162_ASSETS && R162_ASSETS[D + k + '.webp']) || (D + k + '.webp'); };
  const need = () => { if (req) return; req = true; FK.forEach(ld); for (const k of K2) { const i = new Image(); i.onload = () => { IM2[k] = i; }; i.src = 'r175f2/' + k + '.webp?v=1'; } };
  // Codex R175F2：水花 / 拖线尾迹 / 九种鱼的鱼跃和挂线 / 白鹭 / 竹筒 / 院猫扑水 / 三块竹牌（没下完之前用程序画的顶着）
  const IM2 = {}, K2 = ['splash', 'wake', 'leap', 'hang', 'egret', 'tube', 'tube_card', 'cat2', 'ui2'];
  const LROW = { crucian: 0, minnow: 1, grass_carp: 2, carp: 3, perch: 4, koi: 5, silver_scale: 6, starfish: 7, salamander: 8 };
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
    for (const x of FISH) { let w = x.w[zi] || 0; if (x.t && x.t[s] != null) w *= x.t[s]; if (x.id === 'turtle' && (f.r175_turtle || caught < 6)) w = 0; if ((x.r === '珍品' || x.r === '稀世') && G.streak >= 2) w *= 1 + .3 * Math.min(4, G.streak - 1); if (w > 0) t.push([x, w]); }
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
  // 按住收线：按手指 id 记，第二根手指松开不算松手
  const DOWN = new Set();
  try { cv.addEventListener('pointerdown', e => { if (!G.on || busy()) return; const q = toLogical(e); TAPS.push(q); DOWN.add(e.pointerId); G.hold = true; e.stopImmediatePropagation(); e.preventDefault(); }, true);
    for (const ev of ['pointerup', 'pointercancel']) window.addEventListener(ev, e => { DOWN.delete(e.pointerId); G.hold = DOWN.size > 0; }, true);
    window.addEventListener('blur', () => { DOWN.clear(); G.hold = false; }, true); } catch (e) {}
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
    if (G.cat && IM.cat) { const c = G.cat, pz = c.act === 'pounce' && IM2.cat2, cd = pz ? { row: 3, n: 8, fps: 12 } : M.cat[c.act === 'pounce' ? 'watch' : c.act], n = Math.floor((now() - c.t0) * cd.fps), cf = c.loop === false ? Math.min(cd.n - 1, n) : n % cd.n, sz = M.cat_disp.size[0];
      ctx.save(); ctx.translate(c.x, c.y); ctx.scale(k, k); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, -1, 20, 6, 0, 0, 7); ctx.fill();
      ctx.drawImage(pz ? IM2.cat2 : IM.cat, cf * 128, cd.row * 128, 128, 128, -sz * .5, -sz * (240 / 256), sz, sz); ctx.restore(); }
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
  // ---------- 近景镜头 + 水花 / 涟漪 / 出水的鱼（屏幕层，按世界坐标换算）----------
  const Z0 = (typeof MAP_ZOOM === 'object' && MAP_ZOOM[PAV]) || .75; let zCur = Z0, zLast = 0;
  const zSet = z => { try { if (Math.abs(z - Z0) < .004) { MAP_ZOOM[PAV] = Z0; delete CHAR_SCALE[PAV]; } else { MAP_ZOOM[PAV] = z; CHAR_SCALE[PAV] = z / Z0; } } catch (e) {} };
  const zWant = () => !G.on ? Z0 : G.phase === 'reel' || G.phase === 'land' || G.phase === 'bite' ? 1 : G.phase === 'wait' || G.phase === 'cast' || G.phase === 'miss' ? .88 : Z0;
  function zTick() { const t = now(), dt = Math.min(.05, t - (zLast || t)); zLast = t; const w = zWant(); if (Math.abs(w - zCur) < .002) { if (zCur !== w) { zCur = w; zSet(zCur); } return; } zCur += (w - zCur) * Math.min(1, dt * 2.6); zSet(zCur); }
  setInterval(() => { if (!G.on && zCur !== Z0) { zCur = Z0; zSet(Z0); } }, 500);
  const FX = [], RINGS = [];
  const SPR = [], SPN = [6, 8, 8, 8], SPF = [12, 14, 14, 12];
  function splash(x, y, n, pw, row) { if (row != null && IM2.splash) { SPR.push({ row, x, y, t0: now(), k: .5 + pw / 400 }); n = Math.ceil(n / 3); }
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - .5) * 1.9, v = pw * (.45 + Math.random() * .75); FX.push({ x: x + (Math.random() - .5) * 10, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t0: now(), life: .45 + Math.random() * .4, r: 1.2 + Math.random() * 2.2, y0: y }); } RINGS.push({ x, y, t0: now(), life: .9, k: 1 + pw / 160 }); try { playSnd('sfx_water', .5); } catch (e) {} }
  const artOf = id => (ICON['c_' + id] = ICON['c_' + id] || cardCanvas(id));
  const fishLen = f => [34, 46, 62][f.sh || 0];
  function fishAt(id, wx, wy, len, rot, flip, al) { const c = artOf(id); if (!c) return; const [sx, sy] = toScr(wx, wy), z = VZ(), w = len * z, h = w * c.height / c.width;
    ctx.save(); ctx.globalAlpha = al == null ? 1 : al; ctx.translate(sx, sy); if (flip) ctx.scale(-1, 1); ctx.rotate(rot); ctx.drawImage(c, -w / 2, -h / 2, w, h); ctx.restore(); }
  // 世界坐标画一格：锚点 (ax, ay) 落在 (wx, wy)，k = 世界里的缩放
  function wspr(im, fx, fy, fw, fh, wx, wy, ax, ay, k, flip, rot, al) { const [sx, sy] = toScr(wx, wy), q = k * VZ(); ctx.save(); if (al != null) ctx.globalAlpha = al; ctx.translate(sx, sy); if (rot) ctx.rotate(rot); if (flip) ctx.scale(-1, 1); ctx.drawImage(im, fx, fy, fw, fh, -ax * q, -ay * q, fw * q, fh * q); ctx.restore(); }
  const EGP = [470 - OX, 566];   // 白鹭歇脚的地方（潭西南岸的石头上）
  function egPos(e, t) { const u = t - e.t0, s = .62, P = [e.fx + 48 * s, e.fy - 69 * s]; if (u < .5) { const v = u / .5, w = v * v * (3 - 2 * v); return [e.sx + (P[0] - e.sx) * w, e.sy + (P[1] - e.sy) * w - Math.sin(v * Math.PI) * 40]; } const v = Math.min(1, (u - .5) / .7); return [P[0] + 330 * v, P[1] - 250 * v * v - 30 * v]; }
  function drawFX(t) { const z = VZ(); ctx.save();
    if (G.tube && IM2.tube) { const b = G.tube; b.x = b.x0 + Math.sin(t * .23 + b.ph) * 70; b.y = b.y0 + Math.cos(t * .19 + b.ph) * 16; wspr(IM2.tube, (Math.floor(t * 5) % 4) * 96, 0, 96, 96, b.x, b.y, 48, 61, .62); }
    if (G.phase === 'reel' && IM2.wake && !(G.leap && G.leap.st === 'air') && G.run != null) wspr(IM2.wake, (Math.floor(t * 10) % 6) * 192, 0, 192, 96, G.fx, G.fy, 178, 48, .5, false, Math.atan2(Math.sin(G.run) * .5, Math.cos(G.run)), G.hold ? .55 : .9);
    for (let i = SPR.length - 1; i >= 0; i--) { const q = SPR[i], f = Math.floor((t - q.t0) * SPF[q.row]); if (f >= SPN[q.row]) { SPR.splice(i, 1); continue; } wspr(IM2.splash, f * 192, q.row * 192, 192, 192, q.x, q.y, 96, 136, q.k); }
    if (G.eg && IM2.egret) { const e = G.eg; if (e.st === 'idle') wspr(IM2.egret, (Math.floor(t * 4) % 4) * 256, 192, 256, 192, e.x, e.y, 128, 171, .5); else { const [x, y] = egPos(e, t); wspr(IM2.egret, Math.min(11, Math.floor((t - e.t0) * 10)) * 256, 0, 256, 192, x, y, 128, 91, .62); } }
    for (let i = RINGS.length - 1; i >= 0; i--) { const r = RINGS[i], u = (t - r.t0) / r.life; if (u >= 1) { RINGS.splice(i, 1); continue; } const [sx, sy] = toScr(r.x, r.y); ctx.strokeStyle = `rgba(255,255,255,${.6 * (1 - u)})`; ctx.lineWidth = 2 * z;
      ctx.beginPath(); ctx.ellipse(sx, sy, (8 + u * 34 * r.k) * z, (3 + u * 13 * r.k) * z, 0, 0, 7); ctx.stroke(); }
    if (G.leap && G.leap.st === 'air' && G.fish && IM2.leap && LROW[G.fish.id] != null) { const L = G.leap, u = Math.min(1, (t - L.t0) / L.dur); wspr(IM2.leap, Math.min(7, Math.floor(u * 8)) * 192, LROW[G.fish.id] * 160, 192, 160, L.x + L.dx * u, L.y, 96, 139, fishLen(G.fish) / 62, L.dx > 0); }
    else if (G.leap && G.leap.st === 'air' && G.fish) { const L = G.leap, u = Math.min(1, (t - L.t0) / L.dur), h = Math.sin(u * Math.PI) * L.h; fishAt(G.fish.id, L.x + L.dx * u, L.y - h - 6, fishLen(G.fish) * 1.25, (u - .5) * 1.5 * (L.dx > 0 ? -1 : 1) + (L.dx > 0 ? .0 : 0), L.dx > 0, 1); }
    if (G.fly && G.fish) { const L = G.fly, u = Math.min(1, (t - L.t0) / L.dur), x = L.x0 + (L.x1 - L.x0) * u, y = L.y0 + (L.y1 - L.y0) * u - Math.sin(u * Math.PI) * 110;
      if (IM2.hang && LROW[G.fish.id] != null) { try { const [tx, ty] = tip(), [a0, b0] = toScr(tx, ty), [a1, b1] = toScr(x, y); ctx.strokeStyle = 'rgba(250,250,240,.85)'; ctx.lineWidth = 1.3 * z; ctx.beginPath(); ctx.moveTo(a0, b0); ctx.lineTo(a1, b1); ctx.stroke(); } catch (e) {}
        wspr(IM2.hang, (Math.floor(t * 8) % 4) * 128, LROW[G.fish.id] * 128, 128, 128, x, y, 64, 7, fishLen(G.fish) / 62 * (1 + u * .3), false, Math.sin(t * 9) * .18); }
      else fishAt(G.fish.id, x, y, fishLen(G.fish) * (1.25 + u * .5), Math.sin(t * 22) * .35 + .5, true, 1); if (Math.random() < .5) FX.push({ x, y, vx: (Math.random() - .5) * 40, vy: 20, t0: t, life: .4, r: 1.4, y0: y + 200 }); }
    if (G.deftT && t - G.deftT < 1.1 && IM2.ui2 && G.fv) { const u = (t - G.deftT) / 1.1, [sx, sy] = toScr(G.fx, G.fy), k = (u < .15 ? .6 + u / .15 * .6 : 1.2 - Math.min(.2, (u - .15) * .5)) * 1.1; ctx.save(); ctx.globalAlpha = u > .8 ? (1 - u) / .2 : 1; ctx.drawImage(IM2.ui2, 0, 96, 192, 96, sx - 96 * k, sy - 120 - 48 * k, 192 * k, 96 * k); ctx.restore(); }
    for (let i = FX.length - 1; i >= 0; i--) { const q = FX[i], u = (t - q.t0) / q.life; if (u >= 1) { FX.splice(i, 1); continue; } const e = t - q.t0, x = q.x + q.vx * e, y = Math.min(q.y0, q.y + q.vy * e + 260 * e * e); const [sx, sy] = toScr(x, y);
      ctx.fillStyle = `rgba(245,252,255,${.9 * (1 - u)})`; ctx.beginPath(); ctx.arc(sx, sy, q.r * z, 0, 7); ctx.fill(); }
    ctx.restore(); }
  function drawUI() {
    zTick(); if (!G.on || !IM.ui) return; const t = now();
    ctx.save(); try { drawFX(t); } catch (e) {}
    // 今日鱼篓（左上）：Codex 面板上已经写着「今日鱼篓」，右边补一句还剩几竿；三个格子放最近钓到的
    if (G.phase !== 'pond' && !window.R193_ON) { const r = M.ui.today_creel, sc = .74, x = 18, y = 10; ui('today_creel', x, y, r[2] * sc, r[3] * sc);
      ctx.font = `600 15px ${FONT}`; ctx.textAlign = 'right'; ctx.fillStyle = '#6a4a22'; ctx.fillText('还剩 ' + Math.max(0, left()) + (G.phase === 'pond' ? ' 份饵' : ' 竿'), x + 362 * sc, y + 128 * sc);
      const sl = M.today_slots || [];
      G.caught.slice(-3).forEach((id, i) => { const q = sl[i]; if (!q) return; const c = ICON['fish_' + id] || (IM.cards && (ICON['c_' + id] = ICON['c_' + id] || cardCanvas(id))); if (!c) return;
        const bw = q[2] * sc, bh = q[3] * sc, f = Math.min(bw / c.width, bh / c.height) * 1.08, w = c.width * f, h = c.height * f; ctx.drawImage(c, x + q[0] * sc + (bw - w) / 2, y + q[1] * sc + (bh - h) / 2, w, h); }); }
    // 收竿
    if (G.phase === 'pond') {} else if (G.streak >= 2 && IM2.ui2) { ctx.drawImage(IM2.ui2, 0, 192, 192, 96, 18, 118, 192, 96); ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center'; textOutline('×' + G.streak, 18 + 98 + 28, 118 + 31 + 24, '#fff3c8', '#1c2a0c', 4); ctx.textAlign = 'left'; ctx.font = `600 15px ${FONT}`; textOutline('连着钓上来，好鱼更爱咬钩', 30, 208, '#f6ecd0', '#2a1406', 3); }
    else if (G.streak >= 2) { ctx.font = `28px ${BRUSH}`; ctx.textAlign = 'left'; textOutline('连竿 ×' + G.streak, 30, 158, '#ffd27a', '#2a1406', 5); ctx.font = `600 15px ${FONT}`; textOutline('连着钓上来，好鱼更爱咬钩', 30, 180, '#f6ecd0', '#2a1406', 3); }
    if (G.phase !== 'card' && G.phase !== 'pond') { ui('button_paper', BTN_QUIT.x, BTN_QUIT.y); ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center'; textOutline('不钓了', BTN_QUIT.x + 75, BTN_QUIT.y + 32, '#fff3d6', '#3a1a06', 4); }
    // 提示
    if (G.phase === 'aim') { ctx.font = `34px ${BRUSH}`; ctx.textAlign = 'center'; textOutline('点潭面，选个落点', W / 2, H - 120, '#ffe9b0', '#2a1406', 6);
      ctx.font = `600 18px ${FONT}`; textOutline('瀑下急水 · 潭心深水 · 荷边浅水，出的鱼不一样', W / 2, H - 88, '#f6ecd0', '#2a1406', 4); }
    // 作者 11-10：「也没什么提示」——每一步屏幕下方都写着现在该干什么
    { const hint = (a, b, col) => { ctx.font = `34px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(a, W / 2, H - 120, col || '#ffe9b0', '#2a1406', 6); if (b) { ctx.font = `600 18px ${FONT}`; textOutline(b, W / 2, H - 88, '#f6ecd0', '#2a1406', 4); } };
      if (!(G.msg && now() < G.msgT)) {
        if (G.phase === 'wait' && G.fl === 'nod') hint('鱼在试探——别点！', '浮漂只是轻轻点头。现在点，鱼就惊走了', '#ffb37a');
        else if (G.phase === 'wait') hint('等鱼咬钩……', '浮漂轻轻点头是试探，别点；猛地沉下去、冒出「！」才是咬钩');
        else if (G.phase === 'bite') hint('咬钩了！快点一下！', '点屏幕任何地方都行，慢了鱼就跑了', '#ff9a7a');
        else if (G.phase === 'reel' && G.leap && IM2.ui2) { const k = 1.7 + Math.abs(Math.sin(t * 12)) * .12; ctx.drawImage(IM2.ui2, 0, 0, 192, 96, W / 2 - 96 * k, 120 - 48 * k, 192 * k, 96 * k); ctx.font = `600 18px ${FONT}`; ctx.textAlign = 'center'; textOutline(G.leap.st === 'pre' ? '鱼要跃出水面了——现在拉着线会绷断' : '松着手，等它落回水里', W / 2, 196, '#f6ecd0', '#2a1406', 4); }
        else if (G.phase === 'reel' && G.leap) { ctx.font = `44px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(G.leap.st === 'pre' ? '鱼要跃出水面——松手！' : '松着手，等它落水！', W / 2, 150, '#ffb08a', '#2a1406', 6); ctx.font = `600 18px ${FONT}`; textOutline('鱼跃的时候还拉着线，线一下就绷断', W / 2, 184, '#f6ecd0', '#2a1406', 4); }
        else if (G.phase === 'reel') { ctx.font = `600 17px ${FONT}`; ctx.textAlign = 'center'; textOutline('进度涨满就起鱼 · 拉太紧（指针到最右）会断线 · 放太松（到最左）会脱钩', W / 2, H - 150, '#f6ecd0', '#2a1406', 4); } } }
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
  const BTXT = { keep: '收进鱼篓', release: '放　生', take: '算　了', open: '打开看看' };
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
    G.fv = false; await sleep(500); G.cast0 = now(); G.fv = true; setFl('idle'); await sleep(450); G.fx = wx; G.fy = ly; setFl('land'); G.ring = now(); splash(wx, ly, 6, 70, 0);
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
    splash(G.fx, G.fy, 10, 110, 1); const win0 = fish.win * ((F().r175_easy || 0) > 0 ? 2.4 : 1); let win = win0, hit = false, last2 = now();   // 头两条鱼给足反应时间
    while (win > 0) { await frame(); const t = now(); win -= t - last2; last2 = t; const tp = take(); if (tp) { if (inR(tp, BTN_QUIT)) return 'quit'; hit = true; break; } }
    if (!hit) { G.streak = 0; G.phase = 'miss'; setAct('miss'); G.sh = null; G.fv = false; flash('慢了一步……鱼溜了', 1.4); await waitAct(); setAct('wait'); return null; }
    const deft = win > win0 * .6;   // 竹牌一冒出来就点中：妙手，起手就有三成进度
    setAct('hook'); G.phase = 'reel'; G.ten = .35; G.prog = deft ? fish.nd * .3 : 0; if (deft) { G.deftT = now(); if (!IM2.ui2) flash('妙手！', 1); try { playSnd('ui_confirm', .6); } catch (e) {} } G.zc = .37 + Math.random() * .1; setFl('nod');
    await sleep(300); setAct('fight');
    let slack = 0, surge = 0, sdir = 1, last3 = now(), run = Math.random() * 6.28, wake = 0, rT = 0, egWarn = false, leapT = now() + 1.6 + Math.random() * 1.6; const egOk = !fish.junk && (fish.sh || 0) <= 1 && fish.id !== 'salamander', egLim = 6 + fish.nd * 1.7; const hx = G.fx, hy = G.fy, canLeap = !fish.junk && fish.id !== 'turtle' && fish.id !== 'shrimp'; G.leap = null;
    while (true) { await frame(); const t = now(), dt = Math.min(.05, t - last3); last3 = t; take();
      surge -= dt; if (surge <= 0) { surge = .4 + Math.random() * 1.2 / fish.sp; sdir = Math.random() < .55 ? 1 : -1; run += (Math.random() - .5) * 3; }
      // 鱼跃：先抖两下（预兆），再跃出水面；这段时间按着线会猛地绷紧，松着手反而涨进度
      if (canLeap && !G.leap && t >= leapT && G.prog < fish.nd - .5) { G.leap = { st: 'pre', t0: t, dur: .5 }; try { playSnd('sfx_hit', .35); } catch (e) {} }
      if (G.leap) { const L = G.leap; if (L.st === 'pre' && t - L.t0 >= L.dur) { const dx = (Math.random() < .5 ? -1 : 1) * (26 + Math.random() * 22); G.leap = { st: 'air', t0: t, dur: .67, x: G.fx, y: G.fy, dx, h: 46 + (fish.sh || 0) * 14 }; splash(G.fx, G.fy, 16, 150, 2); }
        else if (L.st === 'air' && t - L.t0 >= L.dur) { G.fx = Math.max(hx - 64, Math.min(hx + 64, L.x + L.dx)); splash(G.fx, G.fy, 14, 120, 3); G.leap = null; leapT = t + 2.2 + Math.random() * 2.4 / fish.sp; } }
      const leaping = !!G.leap; G.run = run; rT += dt;
      // 白鹭：歇在岸上的那只盯着小鱼，溜得太久它就俯冲下来叼走
      if (G.eg && G.eg.st === 'idle' && egOk) { if (!egWarn && rT > egLim * .55) { egWarn = true; flash('白鹭盯上你的鱼了，快收！', 1.5); }
        if (rT > egLim && !leaping) { const e = G.eg; G.eg = { st: 'swoop', t0: t, sx: e.x, sy: e.y - 50, fx: G.fx, fy: G.fy }; try { playSnd('sfx_swing', .6); } catch (e2) {}
          while (now() - G.eg.t0 < .5) await frame(); splash(G.fx, G.fy, 12, 120, 1); G.streak = 0; G.phase = 'miss'; setAct('miss'); G.sh = null; G.fv = false; flash('白鹭把鱼叼走了！', 1.6);
          while (now() - G.eg.t0 < 1.2) await frame(); G.eg = null; await waitAct(); setAct('wait'); return null; } }
      const pull = fish.p * (.35 + .65 * Math.abs(Math.sin(t * fish.sp * 2.3))) * sdir;
      G.ten = Math.max(0, Math.min(1, G.ten + (leaping ? (G.hold ? 1.5 : -.08) : (G.hold ? .55 : -.5) + pull * .5) * dt));
      G.zc = Math.max(.3, Math.min(.54, G.zc + Math.sin(t * fish.sp * .9) * dt * .07));
      const inZ = Math.abs(G.ten - G.zc) <= fish.zw / 2; G.prog = Math.max(0, G.prog + (leaping ? (G.hold ? -dt * .3 : dt * .9) : inZ ? dt : -dt * .45));
      { const v = (leaping && G.leap.st === 'pre' ? 0 : 26 + fish.sp * 16) * (G.hold ? .55 : 1), nx = G.fx + Math.cos(run) * v * dt + (leaping && G.leap.st === 'pre' ? Math.sin(t * 60) * 1.4 : 0), ny = G.fy + Math.sin(run) * v * dt * .5;
        if (Math.abs(nx - hx) > 64 || Math.abs(ny - hy) > 26 || zoneAt(nx + OX, ny) < 0) run += 2.2 + Math.random(); else { G.fx = nx; G.fy = ny; }
        if (G.sh) { G.sh.x = G.fx + OX - 10 * Math.cos(run); G.sh.y = G.fy + 3; G.sh.dir = Math.cos(run) > 0 ? 1 : -1; G.sh.al = leaping && G.leap.st === 'air' ? 0 : .62; }
        wake -= dt; if (wake <= 0 && !(leaping && G.leap.st === 'air')) { wake = .16; RINGS.push({ x: G.fx, y: G.fy, t0: t, life: .7, k: .55 }); if (Math.random() < .5) FX.push({ x: G.fx, y: G.fy, vx: (Math.random() - .5) * 60, vy: -50 - Math.random() * 40, t0: t, life: .35, r: 1.3, y0: G.fy }); } }
      if (G.ten >= .99) { G.leap = null; G.streak = 0; G.phase = 'miss'; setAct('miss'); G.sh = null; G.fv = false; flash('线断了！', 1.4); try { playSnd('sfx_hurt'); } catch (e) {} await waitAct(); setAct('wait'); return null; }
      slack = G.ten <= .02 ? slack + dt : 0; if (slack > .9) { G.leap = null; G.streak = 0; G.phase = 'miss'; setAct('miss'); G.sh = null; G.fv = false; flash('线太松，脱钩了', 1.4); await waitAct(); setAct('wait'); return null; }
      if (G.prog >= fish.nd) break; }
    if (F().r175_easy > 0) F().r175_easy--;
    G.leap = null; G.phase = 'land'; G.sh = null; splash(G.fx, G.fy, 22, 170, 2); { const p = world.player; G.fly = { t0: now(), dur: .55, x0: G.fx, y0: G.fy, x1: p.x - 6, y1: p.y - 46 }; }
    G.fv = false; setAct('land'); try { playSnd('ui_confirm'); } catch (e) {} await waitAct(); while (G.fly && now() - G.fly.t0 < G.fly.dur) await frame(); G.fly = null; if (!fish.junk) G.streak = (G.streak || 0) + 1;
    return fish;
  }
  async function showCard(fish) {
    const f = F(), size = fish.sz ? fish.sz[0] + Math.random() * (fish.sz[1] - fish.sz[0]) : 0;
    const small = fish.id === 'minnow' || fish.id === 'shrimp' || fish.id === 'crucian';
    const btns = fish.id === 'salamander' || fish.id === 'turtle' ? ['release'] : fish.junk ? ['take'] : (G.cat && small ? ['keep', 'release', 'feed'] : ['keep', 'release']);
    const title = fish.junk ? '……钓到了' : fish.r === '传说' || fish.r === '稀世' ? '稀世鱼获' : '今日鱼获';
    G.card = { t0: now(), art: fish.art || cardCanvas(fish.id), name: fish.name, title, btns, line: fish.junk ? (fish.id === 'sandal' ? '左脚的，右脚的还在潭底' : '它看起来比你还惊讶') : sizeTxt(size) + ' · ' + fish.r };
    G.phase = 'card'; TAPS.length = 0;
    let pick = null; while (!pick) { await frame(); const tp = take(); if (!tp) continue; if (now() - G.card.t0 < .35) continue; for (const b of cardRects(G.card).bs) if (inR(tp, b)) { pick = b.k; break; } }   // 卡片淡入时手还在连点，先不算
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
  // 漂来的竹筒：瞄它甩一竿就钩上来，里面是一张纸条和一点东西（每个时辰最多一只）
  const NOTES = ['竹筒里卷着一张泛黄的纸条：「后山的桃子熟了，谁捡到谁去摘。」落款的年号，比少爷的岁数还大。', '纸条上只有歪歪扭扭一行字：「师兄，我把你的剑穗掉潭里了，对不住。」', '油纸里裹着几块灵石，纸上写着：「给下一个钓到它的有缘人。」', '纸条上画着一只歪脖子的鹤，旁边写着：「今日练剑又被师父罚了，记之。」'];
  async function tubeCast() { const b = G.tube, f = F(); if (!b) return; G.tx = b.x; G.ty = b.y; G.phase = 'cast'; setAct('cast'); try { playSnd('sfx_swing'); } catch (e) {}
    G.fv = false; await sleep(500); G.cast0 = now(); G.fv = true; setFl('idle'); await sleep(450); G.fx = b.x; G.fy = b.y; splash(b.x, b.y, 6, 70, 0); await waitAct();
    setAct('hook'); await sleep(350); G.tube = null; G.fv = false; setAct('land'); try { playSnd('ui_confirm'); } catch (e) {} await waitAct(); setAct('wait'); f.r175_tube_k = restKey();
    G.card = { t0: now(), art: IM2.tube_card || null, name: '漂来的竹筒', title: '……钓到了', btns: ['open'], line: '封口缠着麻绳，里面像是塞着什么' }; G.phase = 'card'; TAPS.length = 0;
    let pick = null; while (!pick) { await frame(); const tp = take(); if (!tp || now() - G.card.t0 < .35) continue; for (const q of cardRects(G.card).bs) if (inR(tp, q)) pick = q.k; } G.card = null;
    await narrate(NOTES[Math.floor(Math.random() * NOTES.length)]); const g = 30 + Math.floor(Math.random() * 51); try { S.hero.gold = (S.hero.gold || 0) + g; } catch (e) {}
    f.r175_tubes = (f.r175_tubes || 0) + 1; toast('竹筒底下还压着 ' + g + ' 灵石', 2000); }
  // 院猫扑水：没钓上来的时候，蹲在旁边的猫有时自己下爪子
  async function catPounce() { const c = G.cat; if (!c || !IM2.cat2) return; c.act = 'pounce'; c.t0 = now(); c.loop = false; await sleep(340); splash(c.x - 46, c.y - 4, 8, 90, 0); await sleep(340);
    if (Math.random() < .35) { c.act = 'eat'; c.t0 = now(); c.loop = true; if (window.QZ_BOND) QZ_BOND('cat', 1, true); toast(catName() + '自己捞上来一条小白条，叼到一边吃去了　♥ 情谊 +1', 2200); await sleep(1500); }
    else toast(catName() + '扑了个空，甩了少爷一身水', 1800); c.act = 'watch'; c.t0 = now(); c.loop = true; }
  async function session() {
    if (G.on) return;
    const f = F();
    if (window.R193_ANGLE && window.R193_ON) { need(); return R193_ANGLE({ FISH, FD, F, cardCanvas, IM, IM2, showCard, G, SHI, catName, ui }); }   // 作者 11-11：换成「潭边垂钓」（r193_*.js），旧的几版接好后删
    if (left() <= 0) { await narrate('今天潭里的鱼都学精了——歇一觉再来。'); return; }
    need(); if (!IM.angler || !IM.float || !IM.ui) { toast('钓具还在拿……稍等一下再点', 1400); return; }
    if (!f.r175_rod) { f.r175_rod = 1; await narrate('钓台柱子上斜靠着一根旧竹竿，竿梢磨得发亮——是松伯的。'); await say('叶孤星', '（借来用用，回头跟松伯说一声。）'); }
    if (!f.r175_tut) { f.r175_tut = 1; f.r175_easy = 2;
      await narrate('（怎么钓：先点潭面选一个落点，叶孤星会把竿甩过去。）');
      await narrate('（然后等。鱼游过来会先碰一碰饵，浮漂轻轻点头——这是试探，千万别点。）');
      await narrate('（等浮漂猛地沉下去、冒出一块「！」竹牌，马上点一下屏幕，就挂上了。）');
      await narrate('（挂上以后是溜鱼：按住屏幕收线，松开放线，让鱼标留在亮框里，进度涨满鱼就上来了。拉太紧会断线，放太松会脱钩。）');
      await narrate('（溜鱼的时候鱼会跃出水面：浮漂一抖，屏幕上喊「松手」，就马上松开，等它落回水里再接着收。竹牌一冒出来就点中，算「妙手」，起手就有三成进度。）');
      await narrate('（潭边有时歇着一只白鹭：小鱼溜得太久，它会俯冲下来叼走。潭里偶尔漂来一只竹筒，点它甩一竿就能钩上来。）');
      await narrate('（每个时辰能钓八竿。不想钓了，点右下角「不钓了」。屏幕下方每一步都有提示，头两条鱼会咬得久一点。）'); }
    world.locked = true; const hud0 = S.hud;
    const p = world.player, [dx, dy] = DOCK();
    try { if (typeof moveActor === 'function') await moveActor(p, dx, dy, 200); } catch (e) {}
    p.x = dx; p.y = dy; p.face = 'left'; S.hud = false;
    G.on = true; G.caught = []; G.phase = 'sit'; setAct('sit'); G.streak = 0; G.leap = null; G.fly = null; G.deftT = 0; G.run = null;
    G.eg = !f.r175_easy && Math.random() < .4 ? { st: 'idle', x: EGP[0], y: EGP[1] } : null;   // 头两条鱼（教学）不来捣乱
    G.tube = f.r175_tube_k !== restKey() && Math.random() < .3 ? { x0: 760 - OX, y0: 480, x: 760 - OX, y: 480, ph: Math.random() * 6 } : null;
    world.camFocus = () => (G.phase === 'reel' || G.phase === 'bite' || G.phase === 'land') && G.fv ? [G.fx * .62 + world.player.x * .38, G.fy * .62 + world.player.y * .38 - 10] : G.phase === 'wait' || G.phase === 'cast' ? [G.tx * .5 + world.player.x * .5 - 40, 462] : [800 - OX, 470]; TAPS.length = 0;
    G.cat = Math.random() < ((f.qz_bond || {}).cat || f.cat_feeds ? .7 : .4) ? { x: 1180 - OX, y: 520, act: 'watch', t0: now() } : null;   // 院猫闻着鱼腥味跑来蹲着
    try {
      await waitAct(); setAct('wait');
      while (left() > 0) {
        G.phase = 'aim'; G.fv = false; let tgt = null; TAPS.length = 0;   // 上一竿收尾时多点的几下不能直接变成下一竿
        while (!tgt) { await frame(); const tp = take(); if (!tp) continue; if (inR(tp, BTN_QUIT)) break;
          const z = VZ(), c = world.cam, wx = tp.x / z + c.x, wy = tp.y / z + c.y, zi = zoneAt(wx + OX, wy);
          if (G.tube && Math.hypot(wx - G.tube.x, wy - G.tube.y) < 44) { tgt = 'tube'; break; }
          if (zi < 0) { flash('要落在潭里', 1); continue; } tgt = [wx + OX, wy, zi]; }
        if (!tgt) break;
        f.r175_used = (f.r175_used || 0) + 1;
        if (tgt === 'tube') { await tubeCast(); G.phase = 'aim'; setAct('wait'); continue; }
        const got = await oneCast(...tgt);
        if (got === 'quit') break;
        if (got) await showCard(got);
        else if (G.cat && G.phase !== 'card' && Math.random() < .45) await catPounce();
        G.phase = 'aim'; setAct('wait');
      }
      if (left() <= 0) { G.phase = 'sit'; await narrate('今天的竿数用完了。潭里的鱼也该歇歇了。'); }
    } finally { G.on = false; G.fv = false; G.phase = ''; G.card = null; G.sh = null; G.cat = null; G.leap = null; G.fly = null; G.eg = null; G.tube = null; SPR.length = 0; FX.length = 0; RINGS.length = 0; zCur = Z0; zSet(Z0); world.cam = null; world.camFocus = null; world.locked = false; S.hud = hud0; TAPS.length = 0; }
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
