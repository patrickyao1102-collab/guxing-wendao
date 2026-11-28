// ================= R472 · 万妖塔 · 塔下荒原（进塔前的地图，只进测试版）=================
// 作者 11-28 19:44：「万妖塔初始地图怎么还没做出来，我在测试面板没看见。」
// 作者以前定的：铸剑师把人送到塔下荒原；荒原上看得到塔和镇妖碑；点碑选层；通一层塔亮一层（九层九色）；南边是法坛（落脚点）；
//              塔是八角九层楼阁，做成会缓缓转的立体塔（Codex R444「六角血光柱」版，作者最后认可的方向）。
// 地图：R437 塔下荒原底图（2560×1920，补上 R444 给的地面补片，清掉旧塔旧柱的影子）+ 行前景 + 物件（地裂、崖雾、法坛、枯树、断剑、残碑、镇妖碑）；
//       旧塔、旧锁链、旧锁柱不要了，换成 R444 的立体塔（r472/tower3d.js 自己画塔、锁柱、十八条锁链、九道符环、天地双阵、六道血光柱）。
//       塔顶和天阵在原图北界外，地图往北接一截天（R444 演示全景里的血云），世界坐标 = 原图坐标 + (0, OY)。
// 走法：落在南边法坛 → 走上三段石阶 → 镇妖碑（点它选层，只能选已经能去的层）→ 塔门（点它直接进能去的最高层）。法坛点了回铸剑师那里。
// 进塔：铸剑师「进万妖塔」先送到这里；塔里出塔（走出口 / 打完首领选「回塔下荒原」）都回到这里的法坛。
// 塔每镇住一层，回到荒原时镜头抬到那一层、那一层亮起首领的本色（TOWER3D.setLit）。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined' || !window.TOWER) return;
  const ID = 'wyt_base', OY = 1240, MW = 2560, MH = 1920 + OY, CS = 40, COLS = MW / CS, ROWS = MH / CS;
  const TX = 1304, TY = 410, TSC = 0.84 / 0.47;          // 塔基中心（原图坐标）、塔的比例（R444 游戏接入说明）
  const DOOR_Y = 556;                                     // 塔按入口的深度排进绘制队列
  const STELE = [1320, 744], PAD = [1316, 1566];
  const PIERS = [[-340, -97], [345, -91], [-352, 106], [351, 112.5]].map(([x, y]) => [TX + x * TSC, TY + y * TSC]);   // 立体塔自己画的四根锁柱（脚点）
  const Z0 = .66, C0 = .7;                               // 镜头和人物大小：原图里人物约 115 像素高
  const P = (x, y) => [x / 64 - .5, (y + OY) / 64 - .8];  // 原图坐标 → tileSetMap(c, r)
  const F = () => (S.flags = S.flags || {});
  const CN = '一二三四五六七八九';
  const NAME = { 1: '彼岸花海', 2: '北关雪城', 3: '沉渊龙宫', 4: '焚羽丹房', 5: '山神古城', 6: '阴兵宫城', 7: '第七层', 8: '第八层', 9: '第九层' };
  const COLOR = ['绯红', '霜白', '冰蓝', '赤金', '琥珀', '幽紫', '青碧', '墨金', '星白'];
  const cleared = n => !!F()['tw_clear_' + n];
  const litReal = () => { let k = 0; while (k < 9 && cleared(k + 1)) k++; return k; };
  let PREVIEW = null; const lit = () => PREVIEW == null ? litReal() : PREVIEW;   // 测试面板可以只看效果
  const exists = n => n === 1 || !!(window.R469_META && R469_META[n]) || (n === 2 && !!(TOWER.MAZE && TOWER.MAZE.META && TOWER.MAZE.META.f2));
  const open = n => exists(n) && (n === 1 || cleared(n - 1));
  const here = () => !!(world && world.mapName === ID);
  const isFloor = m => /^wyt_f\d/.test(m || '');
  const BACK = ['qingzhu_upper_pavilion', -200 / 64 - .5, 640 / 64 - .8];   // 法坛回铸剑师身边（跟塔里原来的出口一样）

  // ---------- 图 ----------
  // 物件：[名字, 种类, x, y, 宽, 高, 脚底 y, 帧毫秒, 帧]（R437 placement.json；旧塔、旧锁链、旧锁柱去掉）
  const OBJS = [
    ['fault_01', 'rift', 388, 723, 297, 91, 814, 310, ['rift_01', 'rift_02', 'rift_03', 'rift_04', 'rift_05', 'rift_06']],
    ['fault_02', 'rift', 823, 1192, 213, 64, 1256, 310, ['rift_b_03', 'rift_b_04', 'rift_b_05', 'rift_b_06', 'rift_b_01', 'rift_b_02']],
    ['fault_03', 'rift', 1590, 1086, 297, 91, 1177, 310, ['rift_05', 'rift_06', 'rift_01', 'rift_02', 'rift_03', 'rift_04']],
    ['fault_04', 'rift', 702, 1381, 213, 64, 1445, 310, ['rift_b_02', 'rift_b_03', 'rift_b_04', 'rift_b_05', 'rift_b_06', 'rift_b_01']],
    ['fault_05', 'rift', 1470, 1430, 297, 91, 1521, 310, ['rift_03', 'rift_04', 'rift_05', 'rift_06', 'rift_01', 'rift_02']],
    ['fault_06', 'rift', 1941, 675, 213, 64, 739, 310, ['rift_b_04', 'rift_b_05', 'rift_b_06', 'rift_b_01', 'rift_b_02', 'rift_b_03']],
    ['fault_07', 'rift', 510, 997, 213, 64, 1061, 310, ['rift_b_05', 'rift_b_06', 'rift_b_01', 'rift_b_02', 'rift_b_03', 'rift_b_04']],
    ['fault_08', 'rift', 811, 1525, 213, 64, 1589, 310, ['rift_b_06', 'rift_b_01', 'rift_b_02', 'rift_b_03', 'rift_b_04', 'rift_b_05']],
    ['fault_09', 'rift', 1792, 837, 297, 91, 928, 310, ['rift_02', 'rift_03', 'rift_04', 'rift_05', 'rift_06', 'rift_01']],
    ['mist_01', 'mist', -44, 299, 710, 208, 507, 300, ['blood_mist_01', 'blood_mist_02', 'blood_mist_03', 'blood_mist_04', 'blood_mist_05', 'blood_mist_06', 'blood_mist_07', 'blood_mist_08']],
    ['mist_02', 'mist', 1883, 116, 710, 208, 324, 300, ['blood_mist_04', 'blood_mist_05', 'blood_mist_06', 'blood_mist_07', 'blood_mist_08', 'blood_mist_01', 'blood_mist_02', 'blood_mist_03']],
    ['mist_03', 'mist', 1885, 1245, 710, 208, 1453, 300, ['blood_mist_07', 'blood_mist_08', 'blood_mist_01', 'blood_mist_02', 'blood_mist_03', 'blood_mist_04', 'blood_mist_05', 'blood_mist_06']],
    ['mist_04', 'mist', 33, 1577, 710, 208, 1785, 300, ['blood_mist_06', 'blood_mist_07', 'blood_mist_08', 'blood_mist_01', 'blood_mist_02', 'blood_mist_03', 'blood_mist_04', 'blood_mist_05']],
    ['tp_pad', 'pad', 1092, 1458, 448, 237, 1695, 400, ['tp_pad_01', 'tp_pad_02', 'tp_pad_03', 'tp_pad_04', 'tp_pad_05', 'tp_pad_06']],
    ['dead_tree_n', 'tree', 311, 296, 184, 172, 468, 170, ['talisman_tree_small_01', 'talisman_tree_small_02', 'talisman_tree_small_03', 'talisman_tree_small_04', 'talisman_tree_small_05', 'talisman_tree_small_06']],
    ['tower_haze', 'haze', 945, -131, 710, 208, 77, 420, ['blood_mist_03', 'blood_mist_04', 'blood_mist_05', 'blood_mist_06', 'blood_mist_07', 'blood_mist_08', 'blood_mist_01', 'blood_mist_02']],
    ['dead_tree_e', 'static', 2079, 487, 196, 124, 611, 0, ['fallen_tree']],
    ['stele', 'stele', 1259, 520, 122, 224, 744, 0, ['stele_idle', 'stele_glow']],
    ['sword_w1', 'static', 490, 816, 121, 97, 913, 0, ['sword_cluster_small']],
    ['sword_e1', 'static', 1918, 822, 121, 97, 919, 0, ['sword_cluster_small']],
    ['ruin_e', 'static', 1620, 899, 160, 169, 1068, 0, ['ruin_stele']],
    ['sword_w2', 'static', 798, 898, 152, 174, 1072, 0, ['sword_cluster']],
    ['tree_w', 'tree', 438, 947, 250, 285, 1232, 170, ['talisman_tree_01', 'talisman_tree_02', 'talisman_tree_03', 'talisman_tree_04', 'talisman_tree_05', 'talisman_tree_06']],
    ['sword_e2', 'static', 1617, 1213, 152, 174, 1387, 0, ['sword_cluster']],
    ['ruin_w', 'static', 788, 1295, 164, 96, 1391, 0, ['fallen_stele']],
    ['tree_se', 'tree', 1594, 1381, 184, 172, 1553, 170, ['talisman_tree_small_01', 'talisman_tree_small_02', 'talisman_tree_small_03', 'talisman_tree_small_04', 'talisman_tree_small_05', 'talisman_tree_small_06']]];
  // 行前景（碎石堆）：[行, y, 高, 排序 y]
  const OV = [[2, 95, 202, 320], [3, 334, 109, 480], [4, 504, 100, 640], [5, 723, 66, 800], [6, 784, 109, 960], [7, 990, 92, 1120], [8, 1119, 125, 1280], [9, 1312, 114, 1440], [10, 1465, 95, 1600], [11, 1655, 69, 1760]];
  // 地形（40 一格，原图坐标，# 不能走）：岩台顶面轮廓以内能走；广场四周的围栏、南沿矮墙、石阶两侧栏、崖边碎石堆挡路——广场只能从石阶上去
  // （Claude 按 R437 底图描的轮廓 + 行前景里碎石堆的位置算出来的，脚本 scratchpad/wl/terrain.py）
  const TERRAIN = [
    '################################################################',
    '################################################################',
    '################################################################',
    '################################################################',
    '#########...######################################.....#########',
    '#########....##..................................##....#########',
    '############.##..................................##.....########',
    '############.##..................................##......#######',
    '########.....##..................................##......#######',
    '########.....##..................................##......#######',
    '########.....##..................................##.####.#######',
    '########.....##..................................##......#######',
    '########.....##..................................##.....########',
    '########.....##..................................##.....########',
    '###########..##..................................##.....########',
    '########.....##..................................##.....########',
    '########.....##..................................##.....########',
    '########.....##..................................##....#########',
    '########.....##..................................##.....########',
    '########.....##..................................##...##########',
    '########......##................................###....#########',
    '########.###...############...........###########.....##########',
    '########.................#............#...............##########',
    '########.................#............#...............##########',
    '########.................#............#..............###########',
    '########.................#............#..............###########',
    '#########...####.........#............#.............############',
    '##########...............#............#............#############',
    '##########...............#............#............#############',
    '##########...............#............#...........##############',
    '##########...............#............#.........################',
    '##########...............#............#...........##############',
    '###########..............#............#..........###############',
    '############.............#............#.........################',
    '##############...........#............#......###################',
    '##############...##......#............#.......##################',
    '###############..............................###################',
    '###############.............................####################',
    '################....####....................####################',
    '#################..........................#####################',
    '####################.....................#######################',
    '#####################...................########################',
    '######################................##########################',
    '########################.............###########################',
    '###############################...##############################',
    '################################################################',
    '################################################################',
    '################################################################'];

  const want = {}, got = {};
  const K = n => 'r472_' + n;
  function ld(name, src) { const k = K(name); if (k in want) return; want[k] = 1; const im = new Image(); im.onload = () => { IMG[k] = im; got[k] = 1; }; im.onerror = () => { got[k] = 1; console.warn('R472 缺图', src); }; im.src = 'r472/' + src + '?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} }
  const CORE = ['base', 'sky', ...OV.map(o => 'ov_r' + o[0])];
  function loadCore() { ld('base', 'base.webp'); ld('sky', 'sky.webp'); for (const o of OV) ld('ov_r' + o[0], 'ov_r' + o[0] + '.webp'); }
  function loadRest() { for (const o of OBJS) for (const f of o[8]) ld(f, 'o/' + f + '.webp'); }
  // 立体塔：只在进荒原时才载（四百多 K 的脚本 + 塔身贴图，别的地图用不着）
  const TW = { st: 0 };   // 0 没载 1 在载 2 好了 3 失败（失败就不画塔，不卡进图）
  function loadTower() { if (TW.st) return; TW.st = 1;
    const ok = () => { try { TOWER3D.ready.then(() => { TW.st = 2; TOWER3D.setLit(dispLit(), true); }, e => { console.warn('R472 塔贴图', e); TW.st = 3; }); } catch (e) { TW.st = 3; } };
    if (window.TOWER3D) return ok();
    const s = document.createElement('script'); s.src = 'r472/tower3d.js?v=1'; s.onload = ok; s.onerror = () => { TW.st = 3; }; document.head.appendChild(s); }
  { const o = window.MAP_EXTRA_READY; window.MAP_EXTRA_READY = m => { let a = 1; try { a = o ? o(m) : 1; } catch (e) {} if (a == null) a = 1; if (m !== ID) return a;
      loadCore(); loadRest(); loadTower(); const ks = CORE.map(K); const n = ks.filter(k => got[k]).length + (TW.st >= 2 ? 1 : 0); return Math.min(a, n / (ks.length + 1)); }; }

  // ---------- 碰撞（40 像素一格）----------
  function build() {
    const bl = new Array(COLS * ROWS).fill('1');
    const set = (x0, y0, x1, y1, v) => { for (let r = Math.floor((y0 + OY) / CS); r <= Math.floor((y1 + OY - 1) / CS); r++) for (let c = Math.floor(x0 / CS); c <= Math.floor((x1 - 1) / CS); c++) if (r >= 0 && c >= 0 && r < ROWS && c < COLS) bl[r * COLS + c] = v; };
    const blk = (x0, y0, x1, y1) => set(x0, y0, x1, y1, '1');
    const ellipse = (cx, cy, rx, ry, pred) => { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const x = (c + .5) * CS, y = (r + .5) * CS - OY; if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1 && (!pred || pred(x, y))) bl[r * COLS + c] = '1'; } };
    // 1) 地形打底（北边那截天全挡）
    TERRAIN.forEach((row, R) => [...row].forEach((ch, C) => { if (ch !== '#') bl[(R + OY / CS) * COLS + C] = '0'; }));
    // 3) 塔：塔基 + 台基 + 台阶（台阶前留一块站人的地方，在这儿点塔门）
    ellipse(TX, TY - 4, 262, 142); blk(TX - 225, TY - 60, TX + 225, DOOR_Y - 22);
    // 地阵北半圈：人站进去会被塔一起画的地阵、血光柱盖住，只留塔后面那一条（y < 300）能绕
    ellipse(TX, TY + 71, 470, 150, (x, y) => y < DOOR_Y - 20 && y > 300);
    // 4) 锁柱：南边两根前后各留够空，免得人贴着柱子时前后画反
    for (const [x, y] of PIERS) blk(x - 64, y - 90, x + 64, y + 26);
    // 5) 镇妖碑、物件（挡脚底一小块，别挡大方块）
    blk(STELE[0] - 52, STELE[1] - 46, STELE[0] + 52, STELE[1] + 8);
    for (const [id, kind, x, y, w, h, sy] of OBJS) { if (kind === 'static' || kind === 'tree') { const cx = x + w / 2, hw = id === 'dead_tree_e' ? w * .42 : Math.max(26, w * .28); blk(cx - hw, sy - (kind === 'tree' ? 34 : 30), cx + hw, sy + 4); } }
    return bl.join('');
  }
  const BL = build();

  // ---------- 地图定义 ----------
  const objs = [];
  for (const [row, y, h, sy] of OV) objs.push({ id: 'r472_ov', uid: K('ov_r' + row), img: K('ov_r' + row), x: 0, y: y + OY, w: MW, h, sy: sy + OY, flat: false, flip: false, noBlock: true, noPre: true });
  for (const d of OBJS) { const [id, kind, x, y, w, h, sy] = d; const flat = kind === 'rift' || kind === 'mist' || kind === 'pad';
    objs.push({ id: 'r472_obj', uid: K(id), img: K(d[8][0]), r472: d, x, y: y + OY, w, h, sy: (kind === 'haze' ? DOOR_Y + 4 : sy) + OY, flat, flip: false, noBlock: true, noPre: true }); }
  // 塔：一整个物件，按入口深度排序；外框要包住塔刹、天阵和光柱（不然走远一点就被裁掉不画）
  objs.push({ id: 'r472_obj', uid: K('tower'), img: K('base'), r60: true /* 小地图别把这块当图画 */, r472: ['tower', 'tower'], x: TX - 760, y: TY - 1620 + OY, w: 1520, h: 2160, sy: DOOR_Y + OY, flat: false, flip: false, noBlock: true, noPre: true });
  const npcs = [];
  const spot = (name, x, y, talk, h, extra) => { const [c, r] = P(x, y); npcs.push(Object.assign({ key: 'none', c, r, name, hidden: true, h, wander: false, r472: 1, talk }, extra || {})); };
  spot('镇妖碑', STELE[0], STELE[1] + 52, () => stele(), 230);
  spot('塔门', TX, DOOR_Y + 14, () => door(), 260);
  spot('传送法坛', PAD[0], PAD[1] + 70, () => pad(), 70);
  TMAPS[ID] = { title: '万妖塔 · 塔下荒原', name: ID, indoor: false, leaves: false, chests: [], npcs, start: P(PAD[0], PAD[1]),
    baked: { ground: K('base'), w: MW, h: MH, cs: CS, cols: COLS, rows: ROWS, blocked: BL, objs }, exits: [], onEnter: () => arrive() };
  if (typeof MAP_ZOOM === 'object') MAP_ZOOM[ID] = Z0;
  try { CHAR_SCALE[ID] = C0; } catch (e) {}
  try { window.MAP_SPEED = window.MAP_SPEED || {}; MAP_SPEED[ID] = 1.25; } catch (e) {}   // 镜头拉远、人缩小以后屏幕上走得慢，补一点

  // ---------- 镜头 ----------
  // 平时：越往北走镜头越往上抬，让塔多露出来一点；看塔 / 选层时把镜头拉远（地图和人一起缩，比例不变）
  const CAM = { z: Z0, zt: Z0, fy: null };
  const follow = () => { const p = world.player; if (!p) return [TX, TY + OY]; const ay = p.y - OY, k = Math.max(0, Math.min(1, (1250 - ay) / 650)); return [p.x, p.y - 230 * k]; };
  function setZoom(z) { CAM.z = z; MAP_ZOOM[ID] = z; try { CHAR_SCALE[ID] = C0 * z / Z0; } catch (e) {} }
  const ease = u => u < .5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
  // 镜头平移 + 缩放，ms 毫秒（看的是原图坐标）
  async function look(x, y, z, ms) { const vw0 = W / VZ(), vh0 = H / VZ(), c0 = world.cam ? [world.cam.x + vw0 / 2, world.cam.y + vh0 / 2] : [x, y + OY], z0 = CAM.z, t0 = performance.now();
    CAM.cx = c0[0]; CAM.cy = c0[1]; world.camFocus = () => [CAM.cx, CAM.cy];
    while (true) { const u = Math.min(1, (performance.now() - t0) / ms), e = ease(u); setZoom(z0 + (z - z0) * e);
      CAM.cx = c0[0] + (x - c0[0]) * e; CAM.cy = c0[1] + (y + OY - c0[1]) * e;
      if (u >= 1) break; await sleep(16); }
    await sleep(220); }
  async function lookBack(ms) { const [x, y] = follow(); await look(x, y - OY, Z0, ms || 900); world.camFocus = follow; }
  // 第 n 层在画面上的高度（塔局部单位，塔基往上）：量的是每层那圈符字正面在画面上的位置（选层截图里一层层对过）。
  // tower3d.js 里的 ringY 是符环圆心，正面那半圈投影下来要低一截，所以不直接用它。RAD：每层檐的半径。
  const RING = [40, 99, 187, 262, 320, 395, 447, 502, 547], RAD = [125, 114, 104, 94.9, 86.6, 79, 72.1, 65.8, 60];
  const floorY = n => TY - TSC * RING[n - 1];   // 第 n 层的高度（原图坐标）

  // ---------- 画 ----------
  // 地面：北边一截天（半分辨率）+ R437 底图
  drawGroundVis = (orig => function (g, cam) { if (!here()) return orig.apply(this, arguments);
    const sky = IMG[K('sky')], base = IMG[K('base')], vw = W / VZ() + 4, vh = H / VZ() + 4, x0 = Math.max(0, cam.x - 2), y0 = Math.max(0, cam.y - 2);
    if (sky && y0 < OY + 40) { const sh = Math.min(OY + 40, y0 + vh) - y0, k = sky.height / (OY + 40); ctx.drawImage(sky, x0 * k, y0 * k, Math.min(vw, MW - x0) * k, sh * k, x0, y0, Math.min(vw, MW - x0), sh); }
    if (base && g === base) { const by0 = Math.max(0, y0 - OY), by1 = Math.min(1920, y0 + vh - OY), w = Math.min(vw, MW - x0); if (by1 > by0) ctx.drawImage(base, x0, by0, w, by1 - by0, x0, by0 + OY, w, by1 - by0); }
    else if (!sky) { ctx.fillStyle = '#2a1a22'; ctx.fillRect(x0, y0, vw, vh); } })(drawGroundVis);
  // 慢慢动的东西：两帧之间交叉淡入（不跳帧、不闪）
  const frameAt = (fr, ms, t, ph) => { const n = fr.length, f = (t * 1000 / ms + ph) % n, i = Math.floor(f); return [fr[i], fr[(i + 1) % n], f - i]; };
  function blend(fr, ms, t, ph, x, y, w, h, a) { const [f0, f1, u] = frameAt(fr, ms, t, ph), i0 = IMG[K(f0)], i1 = IMG[K(f1)]; if (!i0) return; const s = u * u * (3 - 2 * u);
    const a0 = ctx.globalAlpha; ctx.globalAlpha = a0 * a; ctx.drawImage(i0, x, y, w, h); if (i1 && s > .01) { ctx.globalAlpha = a0 * a * s; ctx.drawImage(i1, x, y, w, h); } ctx.globalAlpha = a0; }
  const STELE_GLOW = { a: 0 };
  drawBaked = (orig => function (o, now) { if (!o || o.id !== 'r472_obj') return orig.apply(this, arguments);
    const d = o.r472, kind = d[1];
    if (kind === 'tower') { if (TW.st === 2) try { TOWER3D.draw(ctx, TX, TY + OY, TSC, now); } catch (e) { if (!TW.err) { TW.err = 1; console.warn('R472 塔', e); } } return; }
    const fr = d[8], ph = (d[2] * .013) % fr.length;
    if (kind === 'rift') return blend(fr, 900, now, ph, o.x, o.y, o.w, o.h, 1);                                   // 地裂：暗红脉动，原来 310 毫秒一跳，放慢成一呼一吸
    if (kind === 'mist') { const dx = Math.sin(now * .09 + d[2] * .01) * 26; return blend(fr, 1100, now, ph, o.x + dx, o.y, o.w, o.h, .92); }   // 崖下血雾：慢慢翻、慢慢漂
    if (kind === 'haze') { const dx = Math.sin(now * .07) * 40; return blend(fr, 1300, now, ph, o.x + dx, o.y, o.w, o.h, .5); }               // 塔身半腰一层薄血雾
    if (kind === 'pad') return blend(fr, 650, now, ph, o.x, o.y, o.w, o.h, 1);
    if (kind === 'tree') { const n = fr.length, i = Math.floor(now * 1000 / 210 + ph) % (n * 2 - 2), j = i < n ? i : n * 2 - 2 - i, im = IMG[K(fr[j])]; if (im) ctx.drawImage(im, o.x, o.y, o.w, o.h); return; }   // 枯树上的符幡来回飘
    if (kind === 'stele') { const i0 = IMG[K(fr[0])], i1 = IMG[K(fr[1])]; if (i0) ctx.drawImage(i0, o.x, o.y, o.w, o.h);
      // 碑：人走近（或在选层）时，碑上的朱篆慢慢亮起来
      const p = world.player, near = p && Math.hypot(p.x - STELE[0], p.y - OY - STELE[1] - 60) < 230 ? 1 : 0, tgt = Math.max(near, STELE_GLOW.on ? 1 : 0);
      STELE_GLOW.a += (tgt - STELE_GLOW.a) * .05; const a = Math.max(.18 + .12 * Math.sin(now * 1.2), STELE_GLOW.a);
      if (i1 && a > .01) { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(i1, o.x, o.y, o.w, o.h); ctx.restore(); } return; }
    const im = IMG[K(fr[0])]; if (im) ctx.drawImage(im, o.x, o.y, o.w, o.h); })(drawBaked);

  // ---------- 氛围：血光灰雾、塔顶雷云（都在屏幕上画，慢慢动，不闪不抖）----------
  const FOG = []; for (let i = 0; i < 9; i++) FOG.push({ x: Math.random(), y: Math.random(), r: .28 + Math.random() * .3, vx: (Math.random() * .6 + .4) * (Math.random() < .5 ? -1 : 1) * .004, ph: Math.random() * 6 });
  let DARK = null;   // 雷云：把血雾图压成墨色
  function darkClouds() { if (DARK) return DARK; const src = ['blood_mist_02', 'blood_mist_05', 'blood_mist_07'].map(f => IMG[K(f)]); if (src.some(s => !s)) return null;
    DARK = src.map(s => { const c = document.createElement('canvas'); c.width = s.width; c.height = s.height; const g = c.getContext('2d'); g.drawImage(s, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(22,12,20,.82)'; g.fillRect(0, 0, c.width, c.height); return c; }); return DARK; }
  const CLOUD = []; for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2; CLOUD.push({ a, r: 380 + (i % 3) * 120, y: -60 + (i % 4) * 34, s: 1.1 + (i % 3) * .35, k: i % 3, sp: (i % 2 ? 1 : -1) * (.012 + (i % 5) * .003) }); }
  tileAmbientHigh = (orig => function (T, cam, now) { if (orig) orig.apply(this, arguments); if (!here()) return;
    try { const D = darkClouds(), top = TY - 1413 + OY;   // 天阵那一圈（塔局部 -791 × 比例）
      if (D && cam.y < top + 500) { ctx.save();
        // 雷云：围着塔顶和天阵慢慢绕（前后各一半，天阵露在中间）
        for (const c of CLOUD) { const a = c.a + now * c.sp, x = TX + Math.cos(a) * c.r, y = top + c.y + Math.sin(a) * 70 - 40, im = D[c.k], w = im.width * c.s, h = im.height * c.s;
          ctx.globalAlpha = .55 + .2 * Math.sin(a); ctx.drawImage(im, x - w / 2, y - h / 2, w, h); }
        // 云肚子里的雷光：暗红、极慢地明暗（4～7 秒一次），不打闪
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) { const f = Math.max(0, Math.sin(now * (.9 + i * .37) + i * 2.1)) ** 3, x = TX + [-280, 240, 40][i], y = top - 60 + [20, -10, -70][i], r = 220 + i * 40, g = ctx.createRadialGradient(x, y, 4, x, y, r);
          g.addColorStop(0, `rgba(255,110,120,${.16 * f})`); g.addColorStop(.5, `rgba(170,30,60,${.08 * f})`); g.addColorStop(1, 'rgba(120,0,30,0)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
        ctx.restore(); }
    } catch (e) {} })(typeof tileAmbientHigh === 'function' ? tileAmbientHigh : null);
  const layer = { draw() { try { if (typeof S === 'undefined' || S.scene !== drawMap || !here()) return; const t = performance.now() / 1000, cam = world.cam || { x: 0, y: 0 };
      ctx.save();
      // 血光：整体压一点暗红（multiply 只会变暗）
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(236,214,218)'; ctx.fillRect(0, 0, W, H);
      // 灰雾：几团大而软的灰雾，跟镜头有一点视差，横着慢慢漂
      ctx.globalCompositeOperation = 'source-over';
      for (const f of FOG) { f.x += f.vx / 60; if (f.x < -.4) f.x = 1.4; if (f.x > 1.4) f.x = -.4;
        const x = ((f.x * W - cam.x * .12) % (W * 1.8) + W * 1.8) % (W * 1.8) - W * .4, y = f.y * H + Math.sin(t * .15 + f.ph) * 20, r = f.r * W, g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(150,135,145,.16)'); g.addColorStop(.6, 'rgba(120,95,110,.08)'); g.addColorStop(1, 'rgba(110,90,100,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
      // 暗角，偏血红
      const g = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .72); g.addColorStop(0, 'rgba(30,0,8,0)'); g.addColorStop(1, 'rgba(30,0,8,.38)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.restore(); } catch (e) {} } };
  if (typeof S !== 'undefined' && S.overlay) S.overlay.unshift(layer);

  // ---------- 小地图：北边接了一截天，底图要往下挪 OY 才对得上；塔也画一座小的进去 ----------
  function thumbReady() { try { const MA = window.MM_API, sky = IMG[K('sky')], base = IMG[K('base')]; if (!MA || !MA.MM || !sky || !base) return; const old = MA.MM.cache[ID]; if (old && old.ok && old.r472 && (old.tw || TW.st !== 2)) return;
      const s = Math.min(1, 520 / Math.max(MW, MH)), c = document.createElement('canvas'); c.width = Math.round(MW * s); c.height = Math.round(MH * s); const x = c.getContext('2d');
      x.drawImage(sky, 0, 0, MW * s, (OY + 40) * s); x.drawImage(base, 0, OY * s, MW * s, 1920 * s);
      for (const d of OBJS) { if (d[1] === 'mist' || d[1] === 'haze') continue; const im = IMG[K(d[8][0])]; if (im) x.drawImage(im, d[2] * s, (d[3] + OY) * s, d[4] * s, d[5] * s); }
      let tw = 0; if (TW.st === 2) try { TOWER3D.draw(x, TX * s, (TY + OY) * s, TSC * s, performance.now() / 1000); tw = 1; } catch (e) {}
      MA.MM.cache[ID] = { c, s, ok: true, mw: MW, mh: MH, x0: 0, t: performance.now(), r472: 1, tw }; } catch (e) {} }
  setInterval(() => { if (here()) thumbReady(); }, 700);

  // ---------- 进图 ----------
  tileSetMap = (orig => function (m) { const prev = world && world.mapName; if (m === ID) { loadCore(); loadRest(); loadTower(); }
    const res = orig.apply(this, arguments);
    if (m === ID) { setZoom(Z0); CAM.zt = Z0; STELE_GLOW.on = 0;
      if (TW.st === 2) try { TOWER3D.setLit(dispLit(), true); } catch (e) {}
      world.camFocus = follow;
      if (!F().tw_wl_seen) { const vw = W / VZ(), vh = H / VZ(), fy = TY - TSC * 700 + OY; world.cam = { x: TX - vw / 2, y: Math.max(0, fy - vh / 2) }; CAM.cx = TX; CAM.cy = fy; world.camFocus = () => [CAM.cx, CAM.cy]; } }   // 第一次来：镜头先停在塔顶，进图以后再慢慢摇下来
    else if (isFloor(m) && !isFloor(prev)) { SNAP.set = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(cleared)); SNAP.init = true; }
    return res; })(tileSetMap);
  const seenLit = () => { const v = F().tw_wl_lit; return v == null ? litReal() : v; };
  const dispLit = () => PREVIEW != null ? PREVIEW : Math.min(litReal(), seenLit());   // 刚镇住的那层先不亮，回荒原时当面亮给玩家看
  const lines = async L => { for (const [who, text] of L) await say(who, text); };
  const HUD = { v: null, hide() { if (this.v == null) { this.v = S.hud; S.hud = false; } }, show() { if (this.v != null) { S.hud = this.v; this.v = null; } } };   // 演出时把小地图、头像收起来
  // 第一次到荒原：星旋把这地方、这座塔、这块碑交代清楚
  const INTRO = [
    ['', '（法坛上的光一点点散去。脚下是一座悬在血云里的孤岛，灰雾贴着地面翻涌。岛心立着一座九层高塔，四根锁柱、十八道铁链把它牢牢拴住，六道血光从地上的阵纹一直贯到塔顶。）'],
    ['叶孤星', '这就是……铸剑师说的，潭底下那座塔？'],
    ['星旋', '万妖塔。那口潭只是道门，塔本身不在人间——上古的修士把它造在这片荒原上，塔里的东西就算破了封，也落不到人间去。'],
    ['星旋', '九层，每一层镇着一头大妖。小子，看见塔身上那一圈圈血符没有？那是封印。哪一层的大妖被镇服了，那一层就会亮起来。'],
    ['叶孤星', '现在……九层全是暗的。'],
    ['星旋', '这几百年，进去的人不少，走出来的一个没有。小子，腿软的话，现在回头还来得及。'],
    ['云霆', '……怎么进去。'],
    ['星旋', '塔门前那块镇妖碑。手按上去，碑会把你送进你能去的那一层。镇住一层，碑上才肯再放你往上一层，急不得。'],
    ['星旋', '打不过就退回荒原，塔里的东西出不了塔——丢人总比丢命强。累了、伤了，站回南边这座法坛，它送你们回铸剑师那儿。'],
    ['叶孤星', '知道了。'],
    ['', '（云霆没再说话，提剑先一步朝石阶走去。）']];
  async function arrive() {
    try {
      if (!F().tw_wl_seen) { F().tw_wl_seen = 1; F().tw_wl_lit = litReal(); world.locked = true;
        HUD.hide();
        await narrate(INTRO[0][1]);                                               // 镜头停在塔顶天阵
        await look(TX, floorY(3), .5, 3400); await lines(INTRO.slice(1, 7));     // 慢慢摇下来，塔身、锁链、血光柱都在画面里
        STELE_GLOW.on = 1; await look(STELE[0], STELE[1] - 150, .62, 1500); await lines(INTRO.slice(7, 8)); STELE_GLOW.on = 0;   // 说到碑，镜头落到碑上
        await look(PAD[0], PAD[1] - 80, .66, 1400); await lines(INTRO.slice(8, 9));                                            // 说到法坛
        await lookBack(700); HUD.show(); await lines(INTRO.slice(9)); }
      const L = litReal(), S0 = seenLit();
      if (L > S0 && TW.st === 2 && PREVIEW == null) { world.locked = true; HUD.hide();   // 刚镇住一层：镜头抬上去，看那一层亮起来
        await look(TX, floorY(L), .5, 1600); await sleep(250); TOWER3D.setLit(L); await sleep(1400);
        await narrate('（塔身第' + CN[L - 1] + '层的血符一圈圈褪去，化成' + COLOR[L - 1] + '色的琉璃光，缓缓转了起来。）');
        await say('星旋', L >= 9 ? '九层都亮了……小子，这座塔，镇住了。' : L === 1 ? '亮了一层。往上的封印松动了，碑上能选第二层了。' : '又亮了一层。还剩' + CN[9 - L - 1] + '层。');
        F().tw_wl_lit = L; await lookBack(1200); HUD.show(); }
      else { F().tw_wl_lit = L; if (TW.st === 2) TOWER3D.setLit(lit(), true); }
    } catch (e) { console.warn('R472 arrive', e); }
    finally { STELE_GLOW.on = 0; HUD.show(); if (here()) { setZoom(Z0); world.camFocus = follow; } world.locked = false; }
  }

  // ---------- 镇妖碑选层：左边一块碑文，九层从上到下排，每一行正对着塔上那一层；右边是塔 ----------
  // 点一行选中（能去的才选得上），那一层在塔上亮一圈、一根细线连过去；右下「入塔」进去、「离开」退出。键盘：上下选、回车进、Esc 离开。
  const BOSS = ['绛蘅', '玄锋', '霁月', '焚羽', '玄岳', '殷无赦', '', '', ''];
  const HUE = [[255, 116, 144], [203, 242, 250], [102, 207, 255], [255, 162, 65], [255, 205, 91], [202, 146, 255], [109, 247, 198], [210, 167, 79], [244, 225, 255]];   // 跟立体塔九色一样
  const PK_Z = .5, PK_CY = TY - TSC * 340, PK_CX = TX - 190;    // 选层时的镜头：九层都在画面里，塔偏右
  let PICK = null;
  // 每行等距排（上九下一），行右边一根折线连到塔上那一层（fy：那层在屏幕上的高度，tx/hw：塔中线和那层檐的半宽）
  const pkRows = () => { const vz = VZ(), cam = world.cam || { x: 0, y: 0 }; return [9, 8, 7, 6, 5, 4, 3, 2, 1].map((n, i) => { const sy = 62 + i * 71, fy = (floorY(n) + OY - cam.y) * vz, tx = (TX - cam.x) * vz, hw = RAD[n - 1] * .9 * TSC * vz;
      return { n, x: 36, y: sy - 31, w: 440, h: 62, sy, fy, tx, hw }; }); };
  const PK_BTN = { go: { x: 1004, y: 560, w: 240, h: 62 }, out: { x: 1004, y: 636, w: 240, h: 54 } };
  const inR = (t, r) => t.x >= r.x && t.x <= r.x + r.w && t.y >= r.y && t.y <= r.y + r.h;
  const pkState = n => cleared(n) ? 'done' : open(n) ? 'open' : exists(n) ? 'seal' : 'none';
  function pickFloor() { const fl = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(open);
    return new Promise(res => { PICK = { res, sel: fl[fl.length - 1] || 1, t0: performance.now(), hint: '', ht: 0 }; }); }
  function pkDone(v) { const P0 = PICK; PICK = null; if (P0) P0.res(v); }
  function pkSel(n) { if (!PICK) return; const s = pkState(n);
    if (s === 'open' || s === 'done') { PICK.sel = n; PICK.hint = ''; if (TW.st === 2 && n <= lit()) try { TOWER3D.flash(n); } catch (e) {} return; }
    PICK.hint = s === 'seal' ? '第' + CN[n - 1] + '层的封印还没松——先把第' + CN[n - 2] + '层镇住。' : '第' + CN[n - 1] + '层的碑文还看不清，塔里那层还没现出来。'; PICK.ht = performance.now(); }
  function pkTap(t) { if (!PICK || !t) return;
    if (t.key) return pkDone(PICK.sel);
    if (inR(t, PK_BTN.go)) return pkDone(PICK.sel);
    if (inR(t, PK_BTN.out)) return pkDone(0);
    const rows = pkRows(); for (const r of rows) if (inR(t, r)) return pkSel(r.n);
    // 直接点塔身：点到哪一层算哪一层（取高度最近的那层）
    let best = null, bd = 1e9; for (const r of rows) { const d = Math.abs(t.y - r.fy); if (d < bd && Math.abs(t.x - r.tx) < r.hw) { bd = d; best = r; } } if (best && bd < 45) return pkSel(best.n); }
  addEventListener('keydown', e => { if (!PICK) return; const fl = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(open), i = fl.indexOf(PICK.sel);
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { if (i < fl.length - 1) pkSel(fl[i + 1]); e.preventDefault(); }
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { if (i > 0) pkSel(fl[i - 1]); e.preventDefault(); }
    else if (e.key === 'Escape') { pkDone(0); e.preventDefault(); } }, true);
  updateMap = (orig => function (dt) { if (PICK && !dialog && !choice && !sysPanel) pkTap(consumeTap()); return orig.apply(this, arguments); })(updateMap);
  function pkText(t, x, y, font, fill, align) { ctx.font = font; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(12,4,6,.9)'; ctx.strokeText(t, x, y); ctx.fillStyle = fill; ctx.fillText(t, x, y); }
  function pkBtn(r, label, on, hov) { ctx.save(); const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, on ? (hov ? 'rgba(150,40,40,.96)' : 'rgba(118,28,30,.94)') : (hov ? 'rgba(70,48,40,.95)' : 'rgba(40,28,26,.92)')); g.addColorStop(1, on ? 'rgba(58,10,14,.96)' : 'rgba(18,12,12,.92)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(r.x, r.y, r.w, r.h, 10) : ctx.rect(r.x, r.y, r.w, r.h); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = on ? 'rgba(240,190,110,.95)' : 'rgba(170,140,100,.7)'; ctx.stroke(); ctx.restore();
    pkText(label, r.x + r.w / 2, r.y + r.h / 2 + 1, on ? `30px ${BRUSH}` : `600 21px ${FONT}`, on ? '#ffe7b0' : '#e6d8c0', 'center'); }
  const pkLayer = { draw() { if (!PICK || !here() || typeof S === 'undefined' || S.scene !== drawMap) return; try {
      const now = performance.now(), k = Math.min(1, (now - PICK.t0) / 350), rows = pkRows(), hx = input.x, hy = input.y;
      ctx.save(); ctx.globalAlpha = k;
      // 左右压暗：左边放碑文、右下放按钮，塔在中间偏右露着
      let g = ctx.createLinearGradient(0, 0, 640, 0); g.addColorStop(0, 'rgba(8,2,6,.82)'); g.addColorStop(.72, 'rgba(8,2,6,.55)'); g.addColorStop(1, 'rgba(8,2,6,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 640, H);
      g = ctx.createLinearGradient(W - 340, 0, W, 0); g.addColorStop(0, 'rgba(8,2,6,0)'); g.addColorStop(1, 'rgba(8,2,6,.7)'); ctx.fillStyle = g; ctx.fillRect(W - 340, 0, 340, H);
      // 标题
      pkText('镇妖碑', W - 136, 70, `52px ${BRUSH}`, '#ffd9a0', 'center');
      pkText('点一层选中，再按「入塔」', W - 136, 120, `600 18px ${FONT}`, 'rgba(240,225,200,.85)', 'center');
      pkText('只有封印松了的层才进得去', W - 136, 146, `600 18px ${FONT}`, 'rgba(240,225,200,.85)', 'center');
      // 九行碑文
      for (const r of rows) { const st = pkState(r.n), sel = r.n === PICK.sel, c = HUE[r.n - 1], hov = hx > r.x && hx < r.x + r.w && hy > r.y && hy < r.y + r.h, ok = st === 'open' || st === 'done';
        const a = st === 'none' ? .45 : st === 'seal' ? .62 : 1;
        ctx.save(); ctx.globalAlpha = k * a;
        const bg = ctx.createLinearGradient(r.x, 0, r.x + r.w, 0);
        bg.addColorStop(0, sel ? 'rgba(110,24,30,.9)' : st === 'done' ? `rgba(${c.map(v => v * .28 | 0).join(',')},.82)` : 'rgba(26,16,18,.78)'); bg.addColorStop(1, sel ? 'rgba(60,10,16,.55)' : 'rgba(20,12,14,.35)');
        ctx.fillStyle = bg; ctx.fillRect(r.x, r.y + 3, r.w, r.h - 6);
        ctx.lineWidth = sel ? 2.5 : 1; ctx.strokeStyle = sel ? 'rgba(255,214,140,.95)' : hov && ok ? 'rgba(255,200,140,.7)' : st === 'done' ? `rgba(${c.join(',')},.55)` : 'rgba(150,110,90,.35)'; ctx.strokeRect(r.x + .5, r.y + 3.5, r.w - 1, r.h - 7);
        // 层号 · 层名 · 状态
        pkText('第' + CN[r.n - 1] + '层', r.x + 16, r.sy + 1, `30px ${BRUSH}`, st === 'done' ? `rgb(${c.join(',')})` : st === 'open' ? '#ff8f8f' : '#a9988c');
        pkText(st === 'none' ? '？？？' : NAME[r.n], r.x + 112, r.sy - (st === 'done' && BOSS[r.n - 1] ? 9 : 0), `600 21px ${FONT}`, st === 'none' ? '#8d8078' : '#f2e6d0');
        if (st === 'done' && BOSS[r.n - 1]) pkText('镇 · ' + BOSS[r.n - 1], r.x + 112, r.sy + 14, `600 15px ${FONT}`, `rgba(${c.join(',')},.95)`);
        const tag = st === 'done' ? '已镇' : st === 'open' ? '可入' : st === 'seal' ? '封印未启' : '未现';
        pkText(tag, r.x + r.w - 16, r.sy + 1, `600 19px ${FONT}`, st === 'done' ? `rgb(${c.join(',')})` : st === 'open' ? '#ff7a7a' : '#9a8a80', 'right');
        ctx.restore();
        // 选中：细线连到塔上那一层，那一层外面亮一圈（已镇的用首领本色，没镇的用血红）
        if (sel) { const col = st === 'done' ? c : [255, 90, 90], pul = .65 + .35 * Math.sin(now / 260), x1 = r.tx - r.hw - 4, xm = Math.min(x1 - 30, r.x + r.w + 46);
          ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = `rgba(${col.join(',')},${.75 * pul + .2})`; ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.lineDashOffset = -now / 40;
          ctx.beginPath(); ctx.moveTo(r.x + r.w + 4, r.sy); ctx.lineTo(xm, r.sy); ctx.lineTo(x1 - 12, r.fy); ctx.lineTo(x1, r.fy); ctx.stroke(); ctx.setLineDash([]);
          ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(r.tx, r.fy, 4, r.tx, r.fy, r.hw * 1.25); gr.addColorStop(0, `rgba(${col.join(',')},${.3 * pul})`); gr.addColorStop(.7, `rgba(${col.join(',')},${.13 * pul})`); gr.addColorStop(1, `rgba(${col.join(',')},0)`);
          ctx.fillStyle = gr; ctx.save(); ctx.translate(r.tx, r.fy); ctx.scale(1, .42); ctx.translate(-r.tx, -r.fy); ctx.fillRect(r.tx - r.hw * 1.3, r.fy - r.hw * 1.3, r.hw * 2.6, r.hw * 2.6); ctx.restore();
          ctx.beginPath(); ctx.arc(x1, r.fy, 4, 0, Math.PI * 2); ctx.fillStyle = `rgba(${col.join(',')},.95)`; ctx.fill(); ctx.restore(); } }
      // 按钮
      const s = PICK.sel; pkBtn(PK_BTN.go, '入塔 · 第' + CN[s - 1] + '层', true, inR({ x: hx, y: hy }, PK_BTN.go)); pkBtn(PK_BTN.out, '离开', false, inR({ x: hx, y: hy }, PK_BTN.out));
      // 点了封印层：底下一行小字，几秒后淡掉
      if (PICK.hint) { const u = (now - PICK.ht) / 1000, a = u < 2.6 ? 1 : Math.max(0, 1 - (u - 2.6) / .6); if (a > 0) { ctx.globalAlpha = k * a; PICK.hint.split('——').forEach((l, i) => pkText(l + (i ? '' : '——'), W - 136, 488 + i * 28, `600 18px ${FONT}`, '#ffb3a0', 'center')); } else PICK.hint = ''; }
      ctx.restore(); } catch (e) { if (!pkLayer.err) { pkLayer.err = 1; console.warn('R472 选层', e); } } } };
  if (typeof S !== 'undefined' && S.overlay) S.overlay.push(pkLayer);

  // ---------- 碑、塔门、法坛 ----------
  async function stele() {
    STELE_GLOW.on = 1; world.locked = true;
    try { HUD.hide(); await look(PK_CX, PK_CY, PK_Z, 1200);
      if (!F().tw_stele) { F().tw_stele = 1; await narrate('（手掌按上碑面，冰凉刺骨。碑上的朱篆一行行亮了起来——能去的那几层，字是红的。）'); }
      const n = await pickFloor();
      if (n && open(n)) { await look(TX, floorY(n), PK_Z, 700); if (TW.st === 2 && n <= lit()) TOWER3D.flash(n); await sleep(500); HUD.show(); await enterFloor(n); return; }
      await lookBack(900);
    } finally { PICK = null; STELE_GLOW.on = 0; HUD.show(); if (here()) { setZoom(Z0); world.camFocus = follow; } world.locked = false; }
  }
  async function door() {
    const fl = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(open), n = fl[fl.length - 1];
    const i = await choose('万妖塔 · 塔门', ['进第' + CN[n - 1] + '层 · ' + NAME[n], '算了']);
    if (i === 0) await enterFloor(n);
  }
  async function pad() {
    const i = await choose('传送法坛', ['回云海后庭（铸剑师那里）', '留在荒原']);
    if (i === 0) await goMap(BACK[0], BACK[1], BACK[2], 'down');
  }
  // 进第 n 层（入口跟 r469 选层一样：一层 → 外苑；二到六层 → 各层外苑；旧二层单张迷宫照旧）
  async function enterFloor(n) {
    const MZ = TOWER.MAZE, R = window.R469; setZoom(Z0);
    if (n === 1 || (n === 2 && (!R || R.OLD2 || !(window.R469_META && R469_META[2])))) { const Mo = MZ.META['f' + n], E = Mo.entrance.center; await goMap('wyt_f' + n, ...MZ.P(E[0], E[1] - 70), 'up');
      if (!MZ.ST(n).seen) { MZ.ST(n).seen = 1; world.locked = true; try { await MZ.lines(MZ.TXT[n].intro); } finally { world.locked = false; } } return; }
    const [x, y] = R.ctr(...R.land(n, R.M(n, 'a').entry)); await goMap(R.MAPN(n, 'a'), ...MZ.P(x, y - 20), 'up');
    const st = R.ST(n); if (!st.seen) { st.seen = 1; world.locked = true; try { await MZ.lines(n === 2 ? MZ.TXT[2].intro : R.CFG[n].intro); } finally { world.locked = false; } }
  }
  const goWasteland = () => goMap(ID, ...P(PAD[0], PAD[1]), 'up');

  // ---------- 铸剑师「进万妖塔」→ 先到荒原 ----------
  const enterPick = TOWER.enter;   // r469 的选层（留着当后备）
  TOWER.enter = async function () {
    if (!F().tw_told) { F().tw_told = 1; await say('铸剑师', '潭底下压着一座塔，九层，层层镇着上古的凶物。我守这潭，也守这道门。'); await say('铸剑师', '我送你们去塔下。进哪一层，碑上自有分晓；打不过就退回荒原，那些东西出不了塔。'); }
    await goWasteland(); };
  // 塔里出来（各层出口原来通铸剑师身边）→ 回荒原的法坛
  goMap = (orig => async function (name, c, r, face) { try { if (name === BACK[0] && world && isFloor(world.mapName)) return orig.call(this, ID, ...P(PAD[0], PAD[1]), 'up'); } catch (e) {} return orig.apply(this, arguments); })(goMap);
  // 塔里打赢首领、故事放完、能走动了：问一句回不回荒原
  const SNAP = { set: new Set(), t: 0, busy: false };
  updateMap = (orig => function (dt) { const r = orig.apply(this, arguments);
    try { if (!isFloor(world.mapName) || SNAP.busy) { SNAP.t = 0; return r; }
      if (!SNAP.init) { SNAP.init = true; SNAP.set = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(cleared)); }
      const nw = [1, 2, 3, 4, 5, 6, 7, 8, 9].find(n => cleared(n) && !SNAP.set.has(n));
      const idle = nw && S.scene === drawMap && !world.locked && !dialog && !choice && !sysPanel && !(typeof battle !== 'undefined' && battle) && !(window.IG_OPEN && IG_OPEN()) && !(typeof MAP_LOADING === 'function' && MAP_LOADING());
      if (!idle) { SNAP.t = 0; return r; } SNAP.t += dt; if (SNAP.t < 1.2) return r;
      SNAP.busy = true; SNAP.set.add(nw);
      (async () => { world.locked = true; try { const i = await choose('第' + CN[nw - 1] + '层 · 已镇', ['回塔下荒原', '留在这层再看看']); if (i === 0) { world.locked = false; await goWasteland(); } } catch (e) { console.warn('R472 回荒原', e); } finally { world.locked = false; SNAP.busy = false; SNAP.t = 0; } })();
    } catch (e) {} return r; })(updateMap);

  // ---------- 配乐：荒原先放「彼岸 · 古埙古筝」（古埙开头，苍凉；作者挑过可改）----------
  const BGM = 'lib_r428_x7';
  function music() { try { if (!here() || (typeof battle !== 'undefined' && battle) || typeof AUD === 'undefined' || !AUD.mode || AUD.muted || !window.BGM29 || !window.BGM_LIB || !BGM_LIB.tracks[BGM]) return; if (AUD.bgmName !== BGM || !AUD.bgm) BGM29.audition(BGM); } catch (e) {} }
  if (typeof playBgm === 'function') playBgm = (orig => function (n) { try { const T = window.BGM29 && BGM29.T || {}; if (here() && window.BGM_LIB && BGM_LIB.tracks[BGM] && !(typeof battle !== 'undefined' && battle) && n !== T.battle && n !== T.boss) { music(); return; } } catch (e) {} return orig.apply(this, arguments); })(playBgm);
  setInterval(music, 1000);

  // ---------- 测试面板 ----------
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r472]')) return; const h = document.createElement('h4'); h.textContent = '11-28 新加 · 万妖塔 · 塔下荒原（进塔的地图：点碑选层）'; h.setAttribute('data-r472', '1');
      const row = document.createElement('div'); row.className = 'row';
      const hide = () => { try { p.style.display = 'none'; } catch (e) {} };
      const b = document.createElement('button'); b.textContent = '去塔下荒原'; b.onclick = () => { hide(); goWasteland(); }; row.appendChild(b);
      const b2 = document.createElement('button'); b2.textContent = '再看一遍初到荒原'; b2.onclick = () => { delete F().tw_wl_seen; hide(); goWasteland(); }; row.appendChild(b2);
      // 设已通层数（改存档：tw_clear_1..n 记上、后面的清掉），然后送到荒原，当面看第 n 层亮起来的演出
      const lab = document.createElement('div'); lab.textContent = '设已通层数（改存档，回荒原看那一层亮起来）：'; lab.style.cssText = 'margin:6px 0 4px;font-size:13px;opacity:.85';
      const row3 = document.createElement('div'); row3.className = 'row';
      for (let n = 0; n <= 9; n++) { const c = document.createElement('button'); c.textContent = '已通 ' + n + ' 层'; c.onclick = () => {
          for (let k = 1; k <= 9; k++) { if (k <= n) F()['tw_clear_' + k] = 1; else delete F()['tw_clear_' + k]; }
          F().tw_wl_seen = 1; F().tw_wl_lit = Math.max(0, n - 1); PREVIEW = null; SNAP.set = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(cleared)); SNAP.init = true;
          if (TW.st === 2) try { TOWER3D.setLit(F().tw_wl_lit, true); } catch (e) {}
          toast('存档：已通 ' + n + ' 层' + (n ? '，回荒原看第' + CN[n - 1] + '层亮起' : ''), 1800); hide(); if (!world.locked) goWasteland(); }; row3.appendChild(c); }
      const lab2 = document.createElement('div'); lab2.textContent = '只看塔亮几层（不改存档）：'; lab2.style.cssText = 'margin:6px 0 4px;font-size:13px;opacity:.85';
      const row2 = document.createElement('div'); row2.className = 'row';
      for (const n of [null, 0, 1, 3, 6, 9]) { const c = document.createElement('button'); c.textContent = n == null ? '塔按存档亮' : '塔亮 ' + n + ' 层'; c.onclick = () => { PREVIEW = n; if (TW.st === 2) TOWER3D.setLit(dispLit()); toast(n == null ? '塔按存档里镇住的层数亮' : '预览：塔亮 ' + n + ' 层（不改存档）', 1800); }; row2.appendChild(c); }
      p.appendChild(h); p.appendChild(row); p.appendChild(lab); p.appendChild(row3); p.appendChild(lab2); p.appendChild(row2); };
    if (document.getElementById('dbgPanel')) add(); else { const mo = new MutationObserver(() => { if (document.getElementById('dbgPanel')) { add(); mo.disconnect(); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}
  window.R472 = { ID, OY, P, PIERS, stele, door, pad, enterFloor, goWasteland, arrive, look, lookBack, setZoom, lit, enterPick, get pick() { return PICK; }, pkSel, pkDone, pkRows, get preview() { return PREVIEW; }, set preview(v) { PREVIEW = v; if (TW.st === 2) TOWER3D.setLit(dispLit()); }, TW, CAM, SNAP };
})();
