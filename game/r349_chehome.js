// ================= R349 · 阿澈家：师父在青阳的老宅（阿澈守着）（Codex R349 第三步正式拆件，直路版）（只进测试版）=================
// 作者 11-17「去拆吧 但是不要弯弯的路要直的路」。院子 1500×1080（11-17 第六步重拆，比例照青竹小院）：北师父正房，西阿焰房，东阿澈房；当中一棵大桂花树，树下矮桌三凳；
// 西边井、石槽、鱼池、露天灶；东边丹炉、水缸、晒药架、药圃。南北一条直路，中段直角分到两边厢房门口。
// 地图：qy_chehome（现在：冷炉、成人衣裳、六道刻痕）/ qy_chehome_old（十几年前：热炉冒烟、童装、四道刻痕；回忆戏用，不开门）
// 入口（暂定）：青阳百草轩里右后角的「后门」 ↔ 老宅南院门。三间房的门先留接口，不开。
// 碰撞：Codex 脚点掩码（已按家具膨胀），8px 取样；院门关 / 半开 / 开三态，切换连碰撞一起换（CHE_GATE('open')）。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.qy_herb) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const V = '?v=7';
  let D = null, GATE = 'half';
  const load = (k, s) => { if (IMG[k]) return; const im = new Image(); im.onload = () => { try { IMG[k] = im; } catch (e) {} }; im.src = s; };
  const base = TMAPS.xt_inn_room3 || TMAPS.xt_inn_room1 || TMAPS.qy_herb;
  const say1 = t => async () => { await say('', t); };
  // 走近能看的东西：[物件 id, 站位 x, y, 现在的话, 十几年前的话]
  const LOOK = [
    ['alchemy_furnace', 1056, 640, '三足铜丹炉，炉膛是冷的。炉身却擦得锃亮——有人常来擦，就是不生火。', '炉火正旺，青烟一缕一缕往桂花树上飘。'],
    ['height_marks', 604, 624, '树干上一道一道刻痕，旁边刻着小字：「焰」「澈」。最上面两道，隔了好几年。', '树干上四道刻痕，刻得歪歪扭扭。'],
    ['low_table', 462, 470, '一张矮桌，三只板凳——一只大的，两只小的。', '矮桌上三只茶盏。'],
    ['well', 236, 320, '一口老井。辘轳的绳子新换过，井沿还是旧的。', '一口老井。'],
    ['toys', 1307, 311, '一把木剑、一只竹蜻蜓。木剑的刃口，早磨圆了。', '一把新削的木剑、一只竹蜻蜓。'],
    ['tag_yan', 316, 655, '门楣下挂着一块小木牌，刻着一个「焰」字。门窗关得严严的。', ''],
    ['tag_che', 1313, 655, '门楣下挂着一块小木牌，刻着一个「澈」字。', ''],
    ['fish_pond', 133, 780, '一方小水池，几尾红鲤，见人也不躲。', ''],
    ['herb_patch', 1298, 822, '一畦药草，垄沟理得笔直。', '']];
  const mk = (key, name, title, e) => {
    load('r349g_' + key, 'r349/g_' + key + '.webp' + V);
    const objs = e.objs.map((o, i) => { load('r349_' + o.f, 'r349/s/' + o.f + '.webp' + V); return { id: o.f, uid: 'r349' + key + i, img: 'r349_' + o.f, x: o.x, y: o.y, w: o.w, h: o.h, sy: o.sy, flip: false, noBlock: true, noPre: true }; });
    // 院门两扇（换门态时只换图）
    for (const lf of D.gate_states.half.leaves) objs.push({ id: 'gate_' + lf.side, uid: 'r349gate' + key + lf.side, img: 'r349_gate_half_' + lf.side, x: lf.rect[0], y: lf.rect[1], w: lf.rect[2], h: lf.rect[3], sy: D.now.gate.threshold[1], flip: false, noBlock: true, noPre: true, _gate: lf.side });
    const M = TMAPS[name] = Object.assign({}, base, { title, npcs: [], chests: [], doors: [], exits: [], onEnter: null, fog: false, petals: false, indoor: true });
    M.baked = { ground: 'r349g_' + key, cs: e.cs, cols: e.cols, rows: e.rows, w: e.w, h: e.h, blocked: e['blocked_' + GATE], objs };
    M.start = P(e.spawn[0], e.spawn[1]);
    const old = key === 'old';
    for (const [id, x, y, t0, t1] of LOOK) { const t = old ? t1 : t0; if (!t) continue; const [c, r] = P(x, y - 30);
      M.npcs.push({ key: 'none', name: id, hidden: true, h: 100, c, r, wander: false, face: 'down', talk: say1(t) }); }
    try { if (typeof WIDE_OK === 'object') WIDE_OK[name] = 1; } catch (e2) {}
    return M; };
  const build = d => { D = d;
    for (const st of ['closed', 'half', 'open']) for (const s of ['left', 'right']) load('r349_gate_' + st + '_' + s, 'r349/s/gate_' + st + '_' + s + '.webp' + V);
    const H = mk('now', 'qy_chehome', '青阳 · 阿澈家', d.now);
    mk('old', 'qy_chehome_old', '十几年前 · 师父的院子', d.old);
    // 南院门 → 百草轩后门
    const g = d.now.gate.transition_rect;
    H.doors.push({ x: g[0] + g[2] / 2, y: g[1] - 2, rw: g[2] / 2, rh: 14, to: 'qy_town', at: P(241, 392), face: 'down', label: '出院门 · 青阳镇', cond: () => GATE !== 'closed', msg: '院门关着。' });
    // 百草轩右后角的后门 → 院门里
    // 11-17：阿澈家在青阳镇西北角有了自己的门面（R352，见 r352_chehome_ext.js），百草轩后门不再通这里
  };
  // 院门：'closed' / 'half' / 'open'（换门扇的图 + 换碰撞）
  window.CHE_GATE = st => { if (!D) return; GATE = st;
    for (const [name, e] of [['qy_chehome', D.now], ['qy_chehome_old', D.old]]) { const M = TMAPS[name]; if (!M || !M.baked) continue;
      for (const o of M.baked.objs) if (o._gate) o.img = 'r349_gate_' + st + '_' + o._gate;
      M.baked.blocked = e['blocked_' + st]; }
    try { if (world.map && world.map.T && /^qy_chehome/.test(world.mapName)) { const B = TMAPS[world.mapName].baked, T = world.map.T;
      for (let r = 0; r < B.rows; r++) for (let c = 0; c < B.cols; c++) T.block[r][c] = B.blocked.charCodeAt(r * B.cols + c) === 49 ? 1 : 0;
      for (const o of T.objs || []) if (o._gate) o.img = 'r349_gate_' + st + '_' + o._gate; } } catch (e) {} };
  // 剧情站位（院子坐标，Codex 给的）：回忆戏三人在丹炉前、树荫边上；小阿澈从院门跑进来（要开门）
  // 11-17 第六步重拆：画布 1500×1080，比例照青竹小院 / 林府花庭；回忆戏站位照 Codex 给的
  // 11-17 第六步重拆：画布 1500×1080，比例照青竹小院。21:21 作者：桂树挪到后面左边那块草地，回忆戏三个人站在树前（根脚 (600,575)），丹炉在路东
  window.CHE_HOME_SPOTS = { gate_in: [837.5, 965], gate_out: [837.5, 1074], furnace: [1053, 594], tree: [600, 575],
    mem: { map: 'qy_chehome_old', shifu: [700, 650], yan: [785, 662], che: [870, 650], che_path: [[837.5, 1074], [837.5, 965], [837.5, 700], [870, 650]], gate: 'open' } };
  try { const G = (window.GXD || {})['r349/data.json']; if (G) build(G); else { const x = new XMLHttpRequest(); x.open('GET', 'r349/data.json' + V, false); x.send(); if (x.status === 200 || x.status === 0) build(JSON.parse(x.responseText)); } } catch (e) { console.warn('R349', e); }
})();
