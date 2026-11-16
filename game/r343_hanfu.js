// ================= R343 · 青阳镇「韩府」：西北角杂货铺换成一户大户人家（作者 11-16「青阳镇跟你说要去移掉的那个，然后放上一户大户人家」，11-17「你自己看着移吧」）（只进测试版）=================
// 外观：Codex R342（青灰瓦、白粉墙、原木梁柱，比民居高一档、不及林府），1x 400×320，左上 (108,620)，底边 y=940 落在石板路上。
// 原来那间杂货铺、它左边那棵大树和门口那堆货一起拿掉；门从杂货铺改成韩府（两间：正厅 → 内室，沿用 R314 大户人家的室内）。
// 住的是韩员外一家：三代在青阳卖布。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.qy_town || !TMAPS.qy_town.baked || !TMAPS.dh_fang || !TMAPS.dh_fang_in) return;
  try { if (!IMG.r343_none) { const c = document.createElement('canvas'); c.width = c.height = 1; IMG.r343_none = c; } } catch (e) {}
  const T = TMAPS.qy_town, P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const X = 108, Y = 620, W = 400, H = 320, DX = 308, DY = 930;
  { const im = new Image(); im.onload = () => { try { IMG.r343_han = im; } catch (e) {} }; im.src = 'r343/han.webp?v=1'; }
  // 两间屋：照方府（R314）的正厅、内室拷一份
  const clone = (src, id, title) => { const M = Object.assign({}, TMAPS[src], { title, npcs: [], chests: [], doors: [], exits: [] }); TMAPS[id] = M; try { if (typeof WIDE_OK === 'object') WIDE_OK[id] = 1; if (window.R252_WIN) delete R252_WIN[id]; } catch (e) {} return M; };
  const HALL = clone('dh_fang', 'dh_han', '韩府 · 正厅'), IN = clone('dh_fang_in', 'dh_han_in', '韩府 · 内室');
  const S0 = TMAPS.dh_fang, S1 = TMAPS.dh_fang_in;
  HALL.exits = (S0.exits || []).map(e => Object.assign({}, e, { to: 'qy_town', at: P(DX, DY + 64), face: 'down', label: '出门 · 青阳镇', cond: null, msg: '' }));
  HALL.doors = (S0.doors || []).map(d => Object.assign({}, d, { to: 'dh_han_in' }));
  IN.doors = (S1.doors || []).map(d => Object.assign({}, d, { to: 'dh_han' }));
  const re = (n, o) => Object.assign({}, n, o);
  const LINES = {
    '方员外': { name: '韩员外', talk: ['韩家在青阳卖了三代布。镇上姑娘出嫁的红绸，十匹有八匹是从我这儿扯的。', '黑风寨闹的那几年，我家的布车被劫了三回。听说是天剑宗的少侠端了寨子？……来，坐，喝茶。', '林府订的绸子我向来不赚钱。当年我的布车陷在黑风谷，是林家主带人替我拉回来的。'] },
    '方家管家': { name: '韩家丫鬟', talk: ['老爷在厅里算账呢，一算就是一下午。', '夫人在里屋做针线。少侠要见老爷，就在这儿等等。'] },
  };
  for (const n of S0.npcs || []) HALL.npcs.push(LINES[n.name] ? re(n, LINES[n.name]) : n);
  const WIFE = { '方夫人': { name: '韩夫人', talk: async () => { const L = ['（她在给一匹红绸收边）这匹是镇上一户人家闺女的嫁衣料子，针脚得细。', '我们家老爷呀，嘴上抠门。镇上谁家办喜事，红绸都按本钱给。'];
    await say('韩夫人', L[Math.floor(Math.random() * L.length)]); } } };
  for (const n of S1.npcs || []) IN.npcs.push(WIFE[n.name] ? re(n, WIFE[n.name]) : n);
  try { for (const k of ['韩员外', '韩家丫鬟', '韩夫人']) SPEAKERS[k] = SPEAKERS[k] || { p: '', color: '#e8d7b0' }; } catch (e) {}
  // 镇上的门：杂货铺 → 韩府
  for (const d of T.doors || []) if (d.to === 'qy_grocery') Object.assign(d, { to: 'dh_han', x: DX, y: DY, rw: 26, rh: 12, at: HALL.start || S0.start, label: '韩府' });
  // 碰撞：这块地先清掉旧杂货铺的阻挡，再按 R342 的脚底多边形挡（墙身 + 两只门墩），石阶能走
  const BLOCK = [[[10, 200], [390, 200], [390, 320], [237, 320], [237, 301], [163, 301], [163, 320], [10, 320]], [[145, 302], [163, 302], [163, 320], [145, 320]], [[237, 302], [255, 302], [255, 320], [237, 320]]];
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  let done = false;
  const patch = () => { const B = T.baked; window.R343_ran = (window.R343_ran || 0) + 1;
  // 换外观、拿掉旧树和货堆
    const store = B.objs.find(o => o.id === 'general_store' && Math.round(o.x) === 196 && Math.round(o.y) === 659);
    if (store) Object.assign(store, { id: 'r343_han', img: 'r343_han', x: X, y: Y, w: W, h: H, sy: Y + 300, ay: Y + 300, ax: DX });
    // 物件表会被别的脚本重新拼一遍，删不掉——就地把它们变成不画的空物件
    const GONE = o => (o.id === 'scholar_tree' && Math.round(o.x) === 17 && Math.round(o.y) === 372) || /^(crate_stack|cargo_sacks)$/.test(o.id) && o.x + o.w > X && o.x < X + W && o.y + o.h > Y + 200 && o.y < Y + H + 30;
    for (const o of B.objs) if (o !== store && GONE(o)) Object.assign(o, { img: 'r343_none', w: 1, h: 1, noBlock: true, _r343gone: 1 });

    try { if (window.R283 && R283.apply) R283.apply('qy_town'); } catch (e) {}
    const cs = B.cs, cols = B.cols, a = B.blocked.split('');
    const c0 = Math.floor(X / cs), c1 = Math.ceil((X + W) / cs), r0 = Math.floor(Y / cs), r1 = Math.ceil((Y + H) / cs);
    for (let r = Math.max(0, r0); r < Math.min(B.rows, r1); r++) for (let c = Math.max(0, c0); c < Math.min(cols, c1); c++) {
      const wx = (c + .5) * cs, wy = (r + .5) * cs, lx = wx - X, ly = wy - Y;
      if (lx >= 0 && lx <= W && ly >= 0 && ly <= H) a[r * cols + c] = BLOCK.some(p => inPoly(lx, ly, p)) ? '1' : (ly >= 200 ? '0' : a[r * cols + c]);
    }
    for (let r = Math.floor((Y + H) / cs); r < Math.ceil((Y + H + 24) / cs); r++) for (let c = Math.floor(150 / cs); c < Math.ceil(350 / cs); c++) a[r * cols + c] = '0';   // 门口那堆货原来挡着的地方
    B.blocked = a.join('');
    // R302 每次进青阳都会把碰撞格子换回它自己存的那份（白天 / 夜里），所以等整条进图流程走完，再把这块的格子改到已经建好的地图上
    try { const TT = world.map && world.map.T; if (TT && TT.block && world.mapName === 'qy_town') for (let r = 0; r < Math.min(B.rows, TT.block.length); r++) { const row = TT.block[r]; for (let c = Math.max(0, Math.floor(100 / cs)); c < Math.min(cols, Math.ceil((X + W + 8) / cs)); c++) row[c] = a[r * cols + c] === '1' ? 1 : 0; } } catch (e) {} };
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { const r = o.apply(this, arguments); if (m === 'qy_town') { try { patch(); } catch (e) { window.R343_err = String(e && e.stack); console.warn('R343', e); } } return r; })(tileSetMap);
})();
