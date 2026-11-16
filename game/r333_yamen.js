// ================= R333 · 玄天城街上的巡城司换成真衙门门脸（作者 11-16：「先把那个巡城司放进去吧」）（只进测试版）=================
// 原来巡城司借的是钱家南边一间普通民房，和左右几间一模一样，看不出是衙门。
// 换成 Codex R294「巡城司门口」那套：歇山顶门楼 +「巡城司」匾 + 石阶 + 两盏灯 + 一对石狮 + 右手鸣冤鼓，整套按 0.75 缩到和街上房子一个比例。
// 地方：原来没有门、没人用的「杂货铺」那块地（连同旁边几丛竹子花草）腾出来给它；原来那间民房留着当普通人家（门牌摘掉）。
(function () {
  const C = typeof TMAPS !== 'undefined' && TMAPS.xt_city, B = C && C.baked; if (!B || !B.objs || B._r333) return; B._r333 = 1;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const K = .75, BX = 100, BY = 1715;   // 门楼左上角（世界坐标）和缩放
  const RM = ['general_store_65', 'bamboo_201', 'shrub_202', 'shrub_233', 'flowers_03_239', 'flowers_01_238', 'grass_clump_03_236'];
  const gone = B.objs.filter(o => RM.includes(o.uid || o.id));
  B.objs = B.objs.filter(o => !RM.includes(o.uid || o.id));
  // [图, 门口图里相对门楼左上的 x, y, 宽, 高, 脚底 y]
  const L = [['old_yamen_building', 0, 0, 620, 326, 326], ['old_stone_steps', 210, 315, 188, 47, 340], ['old_sign_yamen', 240, 137, 140, 46, 327],
    ['hall_lamp', 175, 285, 44, 124, 409], ['hall_lamp', 420, 285, 44, 124, 409], ['old_lion_west', 110, 350, 85, 108, 458], ['old_lion_east', 450, 350, 85, 108, 458], ['old_drum', 570, 325, 90, 141, 466]];
  const load = k => { if (IMG['r333_' + k]) return; const im = new Image(); im.onload = () => { try { IMG['r333_' + k] = im; } catch (e) {} }; im.src = 'r333/' + k + '.webp'; };
  L.forEach(([f, x, y, w, h, sy], i) => { load(f); B.objs.push({ id: 'r333_' + f, uid: 'r333_' + i, img: 'r333_' + f, x: BX + x * K, y: BY + y * K, w: w * K, h: h * K, sy: BY + sy * K, flip: false, noBlock: true, noPre: true }); });
  // 碰撞：杂货铺那块先放开，再把门楼墙身、灯、石狮、鼓的脚下挡上（石阶留空，人走到台阶下就进门）
  try { const cs = B.cs, G = B.blocked.split(''), set = (x0, y0, x1, y1, v) => { for (let y = y0; y < y1; y += cs / 2) for (let x = x0; x < x1; x += cs / 2) { const c = Math.floor(x / cs), r = Math.floor(y / cs); if (c >= 0 && r >= 0 && c < B.cols && r < B.rows) G[r * B.cols + c] = v; } };
    for (const o of gone) if (/general_store/.test(o.uid || '')) set(o.x, o.y + o.h * .45, o.x + o.w, o.y + o.h, '0');
    const X = v => BX + v * K, Y = v => BY + v * K;
    set(X(12), Y(150), X(205), Y(318), '1'); set(X(395), Y(150), X(608), Y(318), '1'); set(X(205), Y(150), X(395), Y(300), '1');   // 门楼（中间留出台阶）
    set(X(180), Y(392), X(214), Y(409), '1'); set(X(425), Y(392), X(459), Y(409), '1');   // 两盏灯
    set(X(115), Y(430), X(190), Y(458), '1'); set(X(455), Y(430), X(530), Y(458), '1'); set(X(580), Y(440), X(655), Y(466), '1');   // 石狮、鼓
    B.blocked = G.join(''); } catch (e) { console.warn('R333 碰撞', e); }
  // 门：台阶下沿正中；出衙门回到台阶前
  const DX = BX + 304 * K, DY = BY + 362 * K;
  for (const d of C.doors || []) if (d.to === 'ml_yamen') Object.assign(d, { x: DX, y: DY - 6, rw: 40, rh: 20 });
  const YA = TMAPS.ml_yamen; if (YA) for (const e of YA.exits || []) if (e.to === 'xt_city') Object.assign(e, { at: P(DX, DY + 46), face: 'down' });
})();
