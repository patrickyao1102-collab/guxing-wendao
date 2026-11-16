// ================= R333 · 玄天城街上的巡城司换成真衙门门脸（作者 11-16：「先把那个巡城司放进去吧」）（只进测试版）=================
// 原来巡城司借的是钱家南边一间普通民房，和左右几间一模一样，看不出是衙门。
// 换成 Codex R294「巡城司门口」那套：歇山顶门楼 +「巡城司」匾 + 石阶 + 两盏灯 + 一对石狮 + 右手鸣冤鼓，整套原大（门楼 620 宽，正好两间民居并排那么宽；作者 11-16：「起码也要像两个民居加起来那么大」）。
// 地方：原来没有门、没人用的「杂货铺」那块地（连同旁边几丛竹子花草）腾出来给它；原来那间民房留着当普通人家（门牌摘掉）。
(function () {
  const C = typeof TMAPS !== 'undefined' && TMAPS.xt_city, B = C && C.baked; if (!B || !B.objs || B._r333) return; B._r333 = 1;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const K = 1, BX = 95, BY = 1705;   // 门楼左上角（世界坐标）和缩放
  const RM = ['general_store_65', 'bamboo_201', 'shrub_202', 'shrub_233', 'flowers_03_239', 'flowers_01_238', 'grass_clump_03_236', 'peach_tree_126'];
  const gone = B.objs.filter(o => RM.includes(o.uid || o.id));
  B.objs = B.objs.filter(o => !RM.includes(o.uid || o.id));
  // [图, 门口图里相对门楼左上的 x, y, 宽, 高, 脚底 y]
  const L = [['old_yamen_building', 0, 0, 620, 326, 326], ['old_stone_steps', 210, 315, 188, 47, 340], ['old_sign_yamen', 240, 137, 140, 46, 327],
    ['hall_lamp', 175, 270, 44, 124, 394], ['hall_lamp', 420, 270, 44, 124, 394], ['front_lion', 105, 312, 85, 114, 426], ['front_lion', 455, 312, 85, 114, 426, 1], ['old_drum', 575, 300, 90, 141, 441]];   // 石狮、灯、鼓往台阶边收一点，门前不占太多街面
  // 石狮用正面的一对（作者 11-16：「两个石狮子是斜的，这个不太好」）——R260 正面石狮调成米灰，右边那只镜像
  // 门前那棵枫树往下让一让（树冠原来正好压在石狮上），桃树拿掉
  for (const o of B.objs) if ((o.uid || o.id) === 'maple_sunlit_189') { o.x -= 40; o.y += 120; o.sy += 120; }
  const load = k => { if (IMG['r333_' + k]) return; const im = new Image(); im.onload = () => { try { IMG['r333_' + k] = im; } catch (e) {} }; im.src = 'r333/' + k + '.webp'; };
  L.forEach(([f, x, y, w, h, sy, fl], i) => { load(f); B.objs.push({ id: 'r333_' + f, uid: 'r333_' + i, img: 'r333_' + f, x: BX + x * K, y: BY + y * K, w: w * K, h: h * K, sy: BY + sy * K, flip: !!fl, noBlock: true, noPre: true }); });
  // 碰撞：杂货铺那块先放开，再把门楼墙身、灯、石狮、鼓的脚下挡上（石阶留空，人走到台阶下就进门）
  try { const cs = B.cs, G = B.blocked.split(''), set = (x0, y0, x1, y1, v) => { for (let y = y0; y < y1; y += cs / 2) for (let x = x0; x < x1; x += cs / 2) { const c = Math.floor(x / cs), r = Math.floor(y / cs); if (c >= 0 && r >= 0 && c < B.cols && r < B.rows) G[r * B.cols + c] = v; } };
    for (const o of gone) if (/general_store/.test(o.uid || '')) set(o.x, o.y + o.h * .45, o.x + o.w, o.y + o.h, '0');
    const X = v => BX + v * K, Y = v => BY + v * K;
    set(X(12), Y(150), X(205), Y(318), '1'); set(X(395), Y(150), X(608), Y(318), '1'); set(X(205), Y(150), X(395), Y(300), '1');   // 门楼（中间留出台阶）
    set(X(180), Y(377), X(214), Y(394), '1'); set(X(425), Y(377), X(459), Y(394), '1');   // 两盏灯
    set(X(110), Y(398), X(185), Y(426), '1'); set(X(460), Y(398), X(535), Y(426), '1'); set(X(585), Y(415), X(660), Y(441), '1');   // 石狮、鼓
    // 桃树拿掉、枫树挪走以后，原来挡树干的格子和门前路上一块看不见的挡格放开
    set(288, 2304, 352, 2400, '0'); set(416, 2336, 512, 2400, '0'); set(320, 2176, 448, 2240, '0');
    B.blocked = G.join(''); } catch (e) { console.warn('R333 碰撞', e); }
  // 门：台阶下沿正中；出衙门回到台阶前
  const DX = BX + 304 * K, DY = BY + 362 * K;
  for (const d of C.doors || []) if (d.to === 'ml_yamen') Object.assign(d, { x: DX, y: DY - 6, rw: 40, rh: 20 });
  const YA = TMAPS.ml_yamen; if (YA) for (const e of YA.exits || []) if (e.to === 'xt_city') Object.assign(e, { at: P(DX, DY + 46), face: 'down' });
})();
