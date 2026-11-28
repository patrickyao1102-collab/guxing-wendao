// ================= R469 · 万妖塔二～六层：三苑迷宫 + 传送法阵（只进测试版）=================
// 作者 11-28：一层改成三苑（外苑 → 中苑 → 内苑）+ 传送法阵以后，二到六层也照这个做法让 Codex 画（R447 二层北关雪城、R448 三层沉渊龙宫 / 四层焚羽丹房、R465 五层山神古城 / 六层阴兵宫城）。
// 每层三苑，各 21×15 格、每格 240 像素；底图、行前景（墙南边的人盖住墙，墙北边的人被墙挡住）、机关物件双态、法阵、走法都在 r469_meta.js（build_r469.py 从 Codex 交付转出来）。
// 规矩照一层（r443_f1zones.js）：
//   · 法阵：纹样一样的两座是一对（来回通）；单向阵只去不回；出口阵通下一苑、回苑阵回上一苑；假阵一踩送回本苑入口，阵盘裂开（踩过的假阵不再触发）。刚落地站在阵上，先走开才会再触发。
//   · 三～六层：每苑先解开本苑的机关，出口阵才亮（Codex 说明：「出口需要本苑的激活标记」）；三苑都解开，内苑首领门才开。二层只有城楼有机关：三个绞盘各开一道铁闸，东绞盘有虎卫十九守着。
//   · 机关：二层绞盘、三层镇水明珠（P 格拾珠 → 本苑 L 格珠座归位）、四层封丹炉（封了以后那座炉的热浪和余烬停掉）、五层挂回庙匾、六层点亮魂灯。走上那一格就触发（也可以点它）。
//   · 明雷：地图上飘鬼火（代码画，r200 那一套），碰到才开打；塔里不要暗雷。
//   · 首领：走进内苑 B 格（首领台）→ 对话 → 开战（二层玄锋、三层霁月、四层焚羽）。五、六层首领还没有战斗数据，台前先立一块「镇魔碑」，不开打。
//   · M 键地图：全黑，只亮首领台，红点是自己（跟一层一样，路要自己找）。
// 入口：铸剑师那里「进万妖塔」的选层（原来在 r424 的 TOWER.enter，这里换成一到六层都能选；测试版不设等级门槛、也不要求先打过上一层）。
// 旧的二层单张迷宫（r424 的 wyt_f2）还留着当回退：测试面板能切回去（记在本机）。
(function () {
  const MZ = window.TOWER && TOWER.MAZE, META = window.R469_META;
  if (!MZ || !META || typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const F = () => (S.flags = S.flags || {}), P = MZ.P, lines = MZ.lines, CS = 40, TS = 240, ZS = ['a', 'b', 'c'], CN = '一二三四五六七八九';
  const FLOORS = [2, 3, 4, 5, 6].filter(n => META[n]);
  const MAPN = (n, z) => 'wyt_f' + n + z;
  const parse = m => { const r = /^wyt_f([2-6])([abc])$/.exec(m || ''); return r && META[r[1]] ? [+r[1], r[2]] : null; };
  const cur = () => parse(world && world.mapName);
  const M = (n, z) => META[n].courts[z];
  const ctr = (c, r) => [(c - .5) * TS, (r - .5) * TS];   // 格心（1 起的列、行）= 脚底落点
  // 落点：二层入口格（第 15 行）整个压在门楼底下，人站进去就被门楼挡没了 → 落到门楼北边那一格（跟 Codex 走法的第一步一样）
  const land = (n, c) => n === 2 && c[1] === 15 ? [c[0], 14] : c;
  const cellOf2 = (x, y) => [Math.floor(x / TS) + 1, Math.floor(y / TS) + 1];
  const eq = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  const BACK = ['qingzhu_upper_pavilion', ...P(-200, 640)];   // 出塔回铸剑师身边（跟一层一样）
  const T7 = () => (window.R427 && R427.T7 ? R427.T7() : {});
  let OLD2 = (() => { try { return localStorage.getItem('gx_r469_old2') === '1'; } catch (e) { return false; } })();
  // ---------- 各层的设定 ----------
  // 小怪：用 MOB_DB 里已有的塔怪。五、六层还没有自己的怪，先拿五行相近的顶着（报告里列了）：五层山神古城（土）→ 石狻猊、弩傀、丹童傀儡；六层阴兵宫城 → 冰甲残兵、梦傀、泪水灵
  // 等级：一层鬼火 12～13 级、二层 15～16 级，往上每层 +3
  const CFG = {
    2: { title: '北关雪城', mech: '绞盘', mobs: ['tw_xuewei', 'tw_bingjia', 'tw_shuanglang', 'tw_nukui'], lv: 6.5, lvR: [15, 16], bg: 'bg_tw2', boss: 2, pic: 'r415/baihu_f1_pic.webp?v=1', picH: 220, gating: false, flash: '#cfe8ff',
      gateShut: '（铁闸落着，粗铁栅一根根插进雪里，纹丝不动。）', gateHint: '闸门边上有绞盘的铁链——找到对应的绞盘转开它。', after: '（城楼上只剩一杆断戟插在雪里。）' },
    3: { title: '沉渊龙宫', mech: '镇水明珠', mobs: ['tw_jiaowei', 'tw_shuiling'], lv: 9, lvR: [18, 19], bg: 'bg_tw3', boss: 3, pic: 'r415/longnv_f1_pic.webp?v=1', picH: 220, gating: true, flash: '#9fe6ff',
      gateShut: '（白玉首领门紧闭着，门上三个珠槽空空的。）', gateHint: '三苑的镇水明珠都归了座，这门才开。', dead: '出口法阵黯着——本苑的镇水明珠还没归座', after: '（白玉台上空荡荡的，只剩那摞泡皱的信。）',
      pick: '（指尖刚碰到，那颗镇水明珠就浮了起来，幽幽的蓝光绕着你的手腕打转。）', noPearl: '珠座空着——本苑的镇水明珠还没找到',
      act: ['（明珠落回珠座，「叮」的一声，四下的水声忽然静了一瞬。）', '（第二颗明珠归位。远处传来一声低低的龙吟，像是有谁在梦里翻了个身。）', '（最后一颗明珠落座，整座龙宫的夜明珠同时亮了一亮——内苑的首领门开了。）'],
      intro: [['', '（四下一暗，耳边全是水声。白玉宫道浸在没踝的海水里，夜明珠一盏盏亮着，照不见尽头。）'], ['星旋', '龙宫……沉在塔里的龙宫。小子，看见那些空着的珠座没？'], ['星旋', '每一苑都丢了一颗镇水明珠。找回来、送回本苑的珠座，往里走的法阵才肯动。']],
      meet: [['', '（沉璧内苑的尽头，一座白玉台浸在海水里。台上的白衣女子垂着眼，怀里抱着一摞泡皱了的信。）'], ['霁月', '……你们，是从城里来的吗？'], ['叶孤星', '我们是来闯塔的。'], ['霁月', '（慢慢抬起头，眼底泛起海水一样的光）原来……不是来接我的。'], ['星旋', '小子，当心——潮要涨了。']],
      prize: [['q_yu', 1], ['g_shui2', 1], ['p_revive', 1]] },
    4: { title: '焚羽丹房', mech: '丹炉', mobs: ['tw_huiyu', 'tw_dantong'], lv: 11.5, lvR: [21, 22], bg: 'bg_tw4', boss: 4, pic: 'r415/fenyu_f1_pic.webp?v=1', picH: 220, gating: true, flash: '#ffb06a',
      gateShut: '（首领门上缠着三道黑火锁链，烫得人不敢靠近。）', gateHint: '三苑还烧着黑火的丹炉都封上，锁链才会断。', dead: '出口法阵黯着——本苑的丹炉还没封', after: '（裂开的丹炉边，只剩一枚冷掉的凤卵。）',
      act: ['（你压下炉盖，炉膛里的黑火挣了两下，熄了。热浪退去，只剩焦苦的药味。）', '（第二座丹炉封上了。炉壁上一根烧焦的凤羽，轻轻飘落在你脚边。）', '（最后一座丹炉熄了火。丹房深处传来一声凄厉的凤鸣——首领门上的黑火锁链，断了。）'],
      intro: [['', '（热浪扑面。焦黑的丹房一间连着一间，炉火烧了几百年都没熄，空气里飘着呛人的药味和烧焦的羽毛。）'], ['云霆', '……是凤羽烧焦的味道。'], ['星旋', '每一苑都有一座还烧着黑火的丹炉。把炉封了，出口的法阵才会亮。']],
      meet: [['', '（烬羽内苑最深处，一座巨大的丹炉裂成了两半。炉边坐着一个少年，一只翅膀完好，另一只烧着黑色的火。）'], ['焚羽', '……又是来拔羽毛的？'], ['叶孤星', '我们不要你的羽毛。'], ['焚羽', '（冷笑一声，黑火腾地窜高）他们当年，也是这么说的。']],
      prize: [['q_yu', 2], ['g_huo2', 1], ['juan5', 1]] },
    5: { title: '山神古城', mech: '庙匾', mobs: ['tw_shini', 'tw_nukui', 'tw_dantong'], lv: 14, lvR: [24, 25], bg: 'bg_tw2', boss: 0, gating: true, flash: '#ffe0a0',
      gateShut: '（城门紧闭，门楣上空着挂匾的位置。）', gateHint: '三处门楼的「山神庇佑」都挂回去，城门才开。', dead: '出口法阵黯着——本苑门楼的庙匾还没挂回去',
      act: ['（你把「山神庇佑」的庙匾托回门楼，匾上金字一亮，脚下的地面轻轻一颤。）', '（第二块庙匾挂上了。远处的山壁里，好像有什么巨大的东西缓缓吸了一口气。）', '（第三块庙匾归位，整座古城的地面都在震——城门，开了。）'],
      intro: [['', '（脚下是一座荒了千年的山城。石街两旁的门楼都空着，匾额不知被谁摘了下来，扔在墙根。）'], ['星旋', '山神的城，山神的匾。把「山神庇佑」挂回门楼上，这城才认你。']] },
    6: { title: '阴兵宫城', mech: '魂灯', mobs: ['tw_bingjia', 'tw_mengkui', 'tw_shuiling'], lv: 16.5, lvR: [27, 28], bg: 'bg_tw3', boss: 0, gating: true, flash: '#9fb8ff',
      gateShut: '（宫门前站着两排石俑，戈尖交叉，封死了去路。）', gateHint: '三盏魂灯都点亮，石俑才会收戈。', dead: '出口法阵黯着——本苑的魂灯还没点亮',
      act: ['（魂灯「噗」地燃起幽蓝的火，近处的石俑齐齐低下了头。）', '（第二盏魂灯亮了。甬道里响起一阵整齐的甲叶声，像是有人在点卯。）', '（第三盏魂灯亮起。两排石俑同时收戈，宫门缓缓打开。）'],
      intro: [['', '（阴风扑面。一列列石俑披甲执戈，排满了宫城的甬道，眼眶空空的，却像在盯着你看。）'], ['叶孤星', '……这些都是兵？'], ['星旋', '阴兵。每一苑都有一盏魂灯灭着——点亮了，它们才肯让路。']] } };
  const STELE = [['', '（首领台前立着一块镇魔碑，碑面上的朱砂还很新：「此层首领尚在镇压」。）'], ['星旋', '封印还牢着。这一层镇的东西，暂时出不来——往后再来。']];
  // ---------- 宝箱（作者 11-28：以药材和炼器料为主，技能书一两本，丹方每层最多一张，少量装备；越往上越好） ----------
  // 位置是脚本挑的「不在正确路线上的岔路深处」，格子按 1 起的 [列, 行]。现有物品里只有一层那一张丹方，所以二～六层暂时没放丹方。
  const CHEST = {
    2: { a: [[16, 6, [['m_jiapian', 3], ['m_wx_jin', 2], ['h_wangyou', 2]]], [2, 6, [['m_duanren', 3], ['q_jing', 2]]], [8, 10, [['moon_dew', 2], ['p_big', 1], ['m_tielin', 2]]]],
      b: [[16, 12, [['m_wx_shui', 2], ['m_yingya', 2], ['h_wangyou', 2]]], [2, 4, [['bk_hero_ningshen', 1], ['moon_dew', 1]]], [7, 9, [['m_tiejia', 2], ['q_jing', 1], ['p_mp', 2]]]],
      c: [[16, 10, [['r_liuguang', 1], ['m_jiapian', 2]]], [5, 5, [['h_huanhun', 1], ['m_wx_jin', 2], ['q_sha', 3]]], [14, 2, [['juan3', 1], ['moon_dew', 2], ['g_jin2', 1]]]] },
    3: { a: [[12, 2, [['m_yugu', 3], ['m_wx_shui', 2], ['h_wangyou', 2]]], [14, 14, [['m_shetui', 3], ['q_jing', 2]]], [2, 7, [['moon_dew', 2], ['p_mp', 2], ['m_yingya', 2]]]],
      b: [[20, 10, [['h_mengtan', 2], ['m_yugu', 2], ['g_shui', 1]]], [2, 2, [['bk_linxue_bingxin', 1], ['h_wangyou', 2]]], [15, 2, [['m_wx_shui', 3], ['q_jing', 2], ['p_big', 1]]]],
      c: [[10, 10, [['s_bingwen', 1], ['m_shetui', 2]]], [2, 14, [['h_huanhun', 1], ['h_mengtan', 2], ['q_yu', 1]]], [19, 8, [['m_silk', 3], ['m_wx_shui', 2], ['moon_dew', 2]]]] },
    4: { a: [[6, 4, [['m_langpi', 3], ['m_wx_huo', 2], ['h_wangyou', 2]]], [18, 12, [['m_xingjing', 2], ['q_jing', 2]]], [20, 3, [['moon_dew', 2], ['p_big', 1], ['m_wing', 3]]]],
      b: [[18, 8, [['m_yanjing', 2], ['m_wx_huo', 2], ['h_huanhun', 1]]], [3, 2, [['bk_yunting_qianggong', 1], ['moon_dew', 2]]], [2, 13, [['g_huo', 1], ['m_langpi', 2], ['p_mp', 2]]]],
      c: [[16, 14, [['r_yantie', 1], ['m_xingjing', 2]]], [6, 5, [['h_huanhun', 1], ['m_yanjing', 2], ['q_yu', 1]]], [14, 3, [['m_wx_huo', 3], ['h_wangyou', 3]]], [17, 8, [['juan4', 1], ['q_jing', 2]]]] },
    5: { a: [[10, 6, [['m_shougu', 3], ['m_wx_tu', 2], ['h_wangyou', 2]]], [19, 14, [['m_zhuao', 3], ['q_jing', 2]]], [2, 2, [['moon_dew', 2], ['p_big', 1], ['m_shike', 2]]]],
      b: [[18, 8, [['m_songxin', 2], ['m_wx_tu', 2], ['h_huanhun', 1]]], [2, 2, [['bk_hero_juling', 1], ['moon_dew', 2]]], [7, 14, [['g_tu', 1], ['m_zhuao', 2], ['p_mp', 2]]]],
      c: [[16, 14, [['a_yanwen', 1], ['m_shougu', 2]]], [4, 2, [['h_huanhun', 1], ['m_songxin', 2], ['q_yu', 1]]], [20, 2, [['m_wx_tu', 3], ['h_wangyou', 3]]], [20, 10, [['c_huangyu', 1], ['q_jing', 2]]]] },
    6: { a: [[18, 6, [['m_yingpi', 2], ['m_wx_shui', 2], ['h_wangyou', 2]]], [7, 12, [['m_gupian', 2], ['q_jing', 2]]], [13, 10, [['moon_dew', 2], ['p_big', 2]]], [20, 10, [['m_yingya', 3], ['m_wx_jin', 2]]]],
      b: [[10, 8, [['h_huanhun', 1], ['m_yingpi', 2], ['p_mp', 2]]], [19, 14, [['bk_linxue_bingdun', 1], ['moon_dew', 2]]], [14, 2, [['m_gupian', 2], ['q_yu', 1]]], [20, 6, [['g_shui2', 1], ['h_wangyou', 3]]]],
      c: [[2, 8, [['w_hanguang', 1], ['m_yingya', 2]]], [20, 14, [['h_huanhun', 2], ['q_sui', 1]]], [16, 2, [['m_neidan', 1], ['m_wx_jin', 2], ['moon_dew', 2]]], [6, 3, [['juan5', 1], ['p_revive', 1]]]] } };
  const MOBN = { a: 5, b: 5, c: 4 };
  // ---------- 存档里的进度（每层一份：各苑机关、明珠、绞盘、踩过的假阵、遗物） ----------
  const ST = n => { const t = F().tw69 || (F().tw69 = {}); return t['f' + n] || (t['f' + n] = { act: {}, pearl: {}, win: {}, used: {}, relic: {}, told: {}, gate: 0, seen: 0 }); };
  const flagsOf = n => { const a = ST(n).act; return { court_1_activated: !!a.a, court_2_activated: !!a.b, court_3_activated: !!a.c }; };
  // ---------- 图 ----------
  const want = {}, got = {};
  const K = (n, z, name) => 'r469_' + n + z + '_' + name, KO = (n, name) => 'r469_' + n + 'o_' + name, KT = (n, name) => 'r469_' + n + 't_' + name;
  function ldk(k, src) { if (k in want) return; want[k] = 1; const im = new Image(); im.onload = () => { IMG[k] = im; got[k] = 1; }; im.onerror = () => { got[k] = 1; }; im.src = src; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} }
  const V = '?v=1';
  const ld = (n, z, name) => ldk(K(n, z, name), 'r469/f' + n + '/' + z + '/' + name + '.webp' + V);
  const ldo = (n, name) => ldk(KO(n, name), 'r469/f' + n + '/o/' + name + '.webp' + V);
  const ldt = (n, name) => ldk(KT(n, name), 'r469/f' + n + '/tp/' + name + '.webp' + V);
  function loadCore(n, z) { const C = M(n, z); ld(n, z, 'base'); for (const o of C.ov) ld(n, z, o[6]); }
  function loadRest(n, z) { const C = M(n, z);
    for (const o of C.objs) for (const s of Object.values(o.st || {})) ldo(n, s);
    for (const p of C.pads) { if (p.img) ldo(n, p.img); if (p.used) ldo(n, p.used); }
    if (C.water) { ldo(n, C.water.tile); C.water.glints.forEach(g => ldo(n, g)); for (const b of C.water.blocks) { ldo(n, b.mask); if (b.fg) ldo(n, b.fg); } }
    if (C.emit) ldo(n, C.emit.tex);
    for (const k of ['idle', 'go', 'arrive']) ldt(n, k);
    if (CFG[n].pic) bpic(n); }
  { const o = window.MAP_EXTRA_READY; window.MAP_EXTRA_READY = m => { let a = 1; try { a = o ? o(m) : 1; } catch (e) {} if (a == null) a = 1; const q = parse(m); if (!q) return a;
      const [n, z] = q; loadCore(n, z); loadRest(n, z); const ks = [K(n, z, 'base'), ...M(n, z).ov.map(o2 => K(n, z, o2[6]))]; return Math.min(a, ks.filter(k => got[k]).length / ks.length); }; }
  const BPIC = {}; function bpic(n) { const s = CFG[n].pic; if (!s) return null; let a = BPIC[s]; if (!a) { a = BPIC[s] = new Image(); a.src = s; } return a.complete && a.naturalWidth ? a : null; }
  // ---------- 地图 ----------
  const typeOf = o => /^(G\d|gate|boss_gate)$/.test(o.id) ? 'gate' : /^L\d$/.test(o.id) ? 'winch' : /^relic/.test(o.id) ? 'relic' : /^pearl_/.test(o.id) ? 'pearl' : /^seat_/.test(o.id) ? 'seat'
    : /^furnace/.test(o.id) ? 'furnace' : /^plaque/.test(o.id) ? 'plaque' : /^lamp_\d+_\d+$/.test(o.id) ? 'soul' : /^lamp_/.test(o.id) ? 'plamp' : o.id === 'boss' ? 'dais' : 'deco';
  const backLanding = (n, z) => { const R = META[n].route, zi = ZS.indexOf(z); if (!zi) return null; const pz = ZS[zi - 1]; const s = R.find(s2 => s2[0] === pz && s2[5] === z); return s ? [pz, [s[1], s[2]]] : null; };
  const GUARD = { c: [19, 14] };   // 二层城楼：虎卫十九守在东绞盘前（Codex events.guard）
  function build(n, z) {
    const C = M(n, z), cols = Math.ceil(C.w / CS), rows = Math.ceil(C.h / CS), cfg = CFG[n];
    const bl = new Array(cols * rows).fill('0'); const blk = (x0, y0, x1, y1) => { for (let r = Math.floor(y0 / CS); r <= Math.floor((y1 - 1) / CS); r++) for (let c = Math.floor(x0 / CS); c <= Math.floor((x1 - 1) / CS); c++) if (r >= 0 && c >= 0 && r < rows && c < cols) bl[r * cols + c] = '1'; };
    C.grid.forEach((row, R) => [...row].forEach((ch, Cc) => { if (ch === '#') blk(Cc * TS, R * TS, (Cc + 1) * TS, (R + 1) * TS); }));
    // 立在路上的东西挡一小块脚底（冰像、香案、烽火台），别的物件都在机关格上、要能踩上去
    // 只挡不在正确路线上的格子（Codex 的走法会从冰像之间穿过去，挡了就走不通）
    const onRoute = new Set(); for (const s of META[n].route) { if (s[0] === z) onRoute.add(s[1] + ',' + s[2]); if (s[5] === z) onRoute.add(s[6] + ',' + s[7]); }
    for (const o of C.objs) { const t = o.type || '', fc = cellOf2(o.bx, o.by - 4); if (/冰像|香案|烽火台/.test(t) && !onRoute.has(fc.join(','))) blk(o.bx - Math.min(40, o.w * .4), o.by - 26, o.bx + Math.min(40, o.w * .4), o.by + 2); }
    const objs = [];
    for (const [r, x, y, w, h, sy, name] of C.ov) objs.push({ id: 'r469_ov', uid: K(n, z, name), img: K(n, z, name), x, y, w, h, sy, flat: false, flip: false, noBlock: true, noPre: true });
    for (const o of C.objs) objs.push({ id: 'r469_obj', uid: K(n, z, o.id), img: K(n, z, 'base'), r469: { n, z, o }, x: o.x, y: o.y, w: o.w, h: o.h, sy: o.sy, flat: false, flip: false, noBlock: true, noPre: true });
    const B = C.B[0];
    if (B) { const [bx, by] = ctr(...B); objs.push({ id: 'r469_obj', uid: K(n, z, 'boss_pic'), img: K(n, z, 'base'), r469: { n, z, o: { id: 'boss_pic', bx, by } }, x: bx - 200, y: by - 520, w: 400, h: 600, sy: by + 30, flat: false, flip: false, noBlock: true, noPre: true }); }
    const npcs = [], spot = (name, x, y, talk, h = 120, extra) => { const [c, r] = P(x, y); npcs.push(Object.assign({ key: 'none', c, r, name, hidden: true, h, wander: false, r469: 1, talk }, extra || {})); };
    for (const L of C.L) { const [x, y] = ctr(...L); spot(cfg.mech, x, y + 20, () => onCell(n, z, L, true), 110); }
    for (const Pc of C.P) { const [x, y] = ctr(...Pc); spot('镇水明珠', x, y + 20, () => onCell(n, z, Pc, true), 80, { cond: () => !ST(n).pearl[z] }); }
    for (const g of C.G) { const [x, y] = ctr(...g); spot(n === 2 ? '铁闸' : '首领门', x, y + 70, () => shut(n), 140, { cond: () => !gateOpen(n, z, g) }); }
    C.objs.filter(o => typeOf(o) === 'relic').forEach(o => spot('遗物', o.bx, o.by + 30, () => relic(n, z), 60));
    if (B) { const [x, y] = ctr(...B); spot(cfg.boss ? (TOWER.BOSS[cfg.boss] || {}).name || '首领' : '镇魔碑', x, y + 40, () => boss(n), 200); }
    // 二层：演武场香案（虎卫之诺）、烽火台陆不归、城楼虎卫十九（R427 的支线，搬进三苑）
    if (n === 2 && window.R427) {
      const al = C.objs.find(o => o.id === 'altar'); if (al) spot('虎卫冰像', al.bx, al.by + 30, R427.altar, 90);
      const bc = C.objs.find(o => o.id === 'beacon'); if (bc) { const lx = bc.bx - 30, ly = bc.by + 20; spot('灰衣青年', lx, ly + 40, R427.lu, 120, { cond: () => !T7().lu });
        objs.push({ id: 'r427_obj', uid: 'r469_lu', img: K(n, z, 'base'), r427: { n: 2, name: 'lu' }, x: lx - 80, y: ly - 240, w: 160, h: 240, sy: ly + 40, flat: false, flip: false, noBlock: true, noPre: true }); }
      if (z === 'c') { const [hx, hy] = ctr(...GUARD.c); spot('虎卫十九', hx, hy + 10, () => guard(), 120, { cond: () => !T7().hu });
        objs.push({ id: 'r427_obj', uid: 'r469_hu', img: K(n, z, 'base'), r427: { n: 2, name: 'hu' }, x: hx - 80, y: hy - 240 + 20, w: 160, h: 240, sy: hy + 20, flat: false, flip: false, noBlock: true, noPre: true }); } }
    const E = C.entry, [ex, ey] = ctr(...land(n, E)), back = backLanding(n, z);
    const exits = [];
    if (z === 'a') exits.push({ x: Math.floor((E[0] - 1) * TS / CS), y: rows - 1, w: Math.ceil(TS / CS), h: 1, to: BACK[0], at: [BACK[1], BACK[2]], face: 'down', label: '出塔' });
    else if (back) { const [lx, ly] = ctr(...back[1]); exits.push({ x: Math.floor((E[0] - 1) * TS / CS), y: rows - 1, w: Math.ceil(TS / CS), h: 1, to: MAPN(n, back[0]), at: P(lx, ly), face: 'down', label: '回' + M(n, back[0]).name }); }
    const avoid = [[ex, ey, 560], ...C.pads.map(p => [p.fx[0], p.fx[1], 220]), ...C.L.map(c => [...ctr(...c), 240]), ...C.P.map(c => [...ctr(...c), 200]), ...C.B.map(c => [...ctr(...c), 640])];
    TMAPS[MAPN(n, z)] = { title: '万妖塔 · 第' + CN[n - 1] + '层 · ' + cfg.title + ' · ' + C.name, name: MAPN(n, z), indoor: false, leaves: false,
      chests: ((CHEST[n] || {})[z] || []).map(([cc, rr, items]) => ({ c: (cc - .5) * TS / 64 - .5, r: ((rr - .5) * TS + 50) / 64 - 1, items })),   // 宝箱按 64 像素一格记
      npcs, start: P(ex, ey - 20),
      baked: { ground: K(n, z, 'base'), w: C.w, h: C.h, cs: CS, cols, rows, blocked: bl.join(''), objs },
      // 明雷：飘鬼火，碰到才开打；入口、法阵、机关格、首领台附近不刷
      mobs: { n: MOBN[z], get types() { const t = cfg.mobs.filter(k => typeof MOB_DB !== 'undefined' && MOB_DB[k]); return t.length ? t : ['tw_bingjia']; }, bg: cfg.bg, lv: cfg.lv, lvR: cfg.lvR, tower: n,
        zone: (c, r) => { const x = (c + .5) * CS, y = (r + .5) * CS; for (const [ax, ay, rad] of avoid) if (Math.hypot(x - ax, y - ay) < rad) return false; return true; } },
      exits };
    if (typeof MAP_ZOOM === 'object') MAP_ZOOM[MAPN(n, z)] = MAP_ZOOM.qingzhu_upper_pavilion || 1; }
  const buildAll = () => { for (const n of FLOORS) for (const z of ZS) build(n, z); }; buildAll();
  // ---------- 门 ----------
  function gateOpen(n, z, g) { const st = ST(n); if (n === 2) { const o = M(n, z).objs.find(o2 => eq(o2.cell, g) && o2.requires); return o ? !!st.win[o.requires] : true; } return !!st.gate; }
  function applyGates() { try { const q = cur(); if (!q) return; const [n, z] = q, T = world.map.T, C = M(n, z);
      for (const g of C.G) { const v = gateOpen(n, z, g) ? 0 : 1; for (let r = (g[1] - 1) * TS / CS; r < g[1] * TS / CS; r++) for (let c = (g[0] - 1) * TS / CS; c < g[0] * TS / CS; c++) if (T.block[r]) T.block[r][c] = v; } } catch (e) {} }
  // ---------- 进塔 / 换苑 ----------
  goMap = (orig => async function (name, c, r, face) { const m = /^wyt_f([2-6])$/.exec(name || ''); if (m && META[m[1]] && !(m[1] === '2' && OLD2)) { const n = +m[1], [x, y] = ctr(...land(n, M(n, 'a').entry)); return orig.call(this, MAPN(n, 'a'), ...P(x, y - 20), 'up'); } return orig.apply(this, arguments); })(goMap);
  const MUST = { on: false, x: 0, y: 0 }, LAST = { k: '' }, PREV = { x: 0, y: 0 };
  tileSetMap = (orig => function (m) { const prev = world && world.mapName, q = parse(m); if (q) { loadCore(...q); loadRest(...q); }
    const res = orig.apply(this, arguments);
    if (q) { const [n, z] = q; applyGates(); const p = world.player; MUST.on = true; MUST.x = p ? p.x : 0; MUST.y = p ? p.y : 0; LAST.k = p ? z + cellOf2(p.x, p.y) : '';
      if (n === 2 && !(parse(prev) && parse(prev)[0] === 2) && window.R427 && R427.RUN) R427.RUN.f2 = {};   // 虎卫之诺、泉水这些「这一趟才算数」的，从外面进来时清掉
      const nz = ZS[ZS.indexOf(z) + 1]; if (nz) setTimeout(() => { try { ld(n, nz, 'base'); } catch (e) {} }, 2500); }   // 下一苑的底图先在后台下着，传过去少等一会儿
    return res; })(tileSetMap);
  // ---------- 画：物件、首领、镇魔碑 ----------
  function stateOf(n, z, o) { const st = ST(n), t = typeOf(o);
    if (t === 'gate') return gateOpen(n, z, o.cell || M(n, z).G[0]) ? 'open' : 'closed';
    if (t === 'winch') return st.win[o.id] ? 'turned' : 'idle';
    if (t === 'relic') return st.relic[z] ? 'collected' : 'present';
    if (t === 'pearl') return st.pearl[z] ? 'taken' : 'available';
    if (t === 'seat') return st.act[z] ? 'set' : 'empty';
    if (t === 'furnace') return st.act[z] ? 'sealed' : 'active';
    if (t === 'plaque' || t === 'soul') return st.act[z] ? 'on' : 'off';
    return o.def || Object.keys(o.st || {})[0]; }
  function drawStele(x, y) {   // 五、六层：镇魔碑（代码画的一块青石碑）
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y, 62, 16, 0, 0, 7); ctx.fill();
    const w = 84, h = 170, x0 = x - w / 2, y0 = y - h; const g = ctx.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, '#3e4446'); g.addColorStop(.5, '#6c7476'); g.addColorStop(1, '#2f3436');
    ctx.fillStyle = '#2a2e30'; ctx.fillRect(x0 - 14, y - 22, w + 28, 22);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, y - 20); ctx.lineTo(x0, y0 + 18); ctx.quadraticCurveTo(x, y0 - 12, x0 + w, y0 + 18); ctx.lineTo(x0 + w, y - 20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(20,22,24,.8)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = `600 26px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#b8261e';
    ['镇', '魔', '碑'].forEach((ch, i) => ctx.fillText(ch, x, y0 + 40 + i * 34)); ctx.restore(); }
  drawBaked = (orig => function (o, now) { if (!o || o.id !== 'r469_obj') return orig.apply(this, arguments);
    const { n, z, o: d } = o.r469;
    if (d.id === 'boss_pic') { const cfg = CFG[n];
      if (!cfg.boss) { drawStele(d.bx, d.by + 30); return; }
      if (window.TOWER_STORY && TOWER_STORY.cleared(n)) return; const p = bpic(n); if (!p) return; const h = cfg.picH * 1.15, w = p.width * h / p.height, fy = d.by + (n === 2 ? -10 : 30);
      ctx.save(); ctx.globalAlpha = .97; ctx.translate(d.bx, 0); ctx.scale(-1, 1); ctx.drawImage(p, -w / 2, fy - h, w, h); ctx.restore(); return; }
    const s = stateOf(n, z, d), k = d.st && d.st[s]; const im = k && IMG[KO(n, k)]; if (!im) return; ctx.drawImage(im, o.x, o.y, o.w, o.h); })(drawBaked);
  // ---------- 画：水（三层）、法阵、特效、粒子 ----------
  let WBUF = null;
  function drawWater(n, z, now, cam, vw, vh) { const W2 = M(n, z).water; if (!W2) return; const tl = IMG[KO(n, W2.tile)]; if (!tl) return;
    const gl2 = IMG[KO(n, W2.glints[Math.floor(now * 1000 / W2.gms) % W2.glints.length])];
    if (!WBUF) { WBUF = document.createElement('canvas'); WBUF.width = 240; WBUF.height = 240; }
    const g = WBUF.getContext('2d'), md = (x, m) => ((x % m) + m) % m;
    const rep = (im, x, y, w, h) => { const sx = -md(x, im.width), sy = -md(y, im.height); for (let j = sy; j < h; j += im.height) for (let i = sx; i < w; i += im.width) g.drawImage(im, i, j); };
    for (const b of W2.blocks) { if (b.x > cam.x + vw || b.y > cam.y + vh || b.x + b.w < cam.x || b.y + b.h < cam.y) continue; const mk = IMG[KO(n, b.mask)]; if (!mk) continue;
      if (WBUF.width !== b.w || WBUF.height !== b.h) { WBUF.width = b.w; WBUF.height = b.h; }
      g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, b.w, b.h); rep(tl, b.x - now * W2.v[0], b.y - now * W2.v[1], b.w, b.h); if (gl2) rep(gl2, b.x, b.y, b.w, b.h);
      g.globalCompositeOperation = 'destination-in'; g.drawImage(mk, 0, 0, b.w, b.h); g.globalCompositeOperation = 'source-over';
      ctx.drawImage(WBUF, b.x, b.y); const fg = b.fg && IMG[KO(n, b.fg)]; if (fg) ctx.drawImage(fg, b.x, b.y, b.w, b.h); } }
  const FX = { pad: null, go: null, arrive: null };
  function frame(key, A, i, x, y, alpha) { const im = IMG[key]; if (!im) return; const c = i % A.cols, r = Math.floor(i / A.cols);
    if (alpha != null && alpha !== 1) { ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(im, c * A.fw, r * A.fh, A.fw, A.fh, x - A.ax, y - A.ay, A.fw, A.fh); ctx.restore(); }
    else ctx.drawImage(im, c * A.fw, r * A.fh, A.fw, A.fh, x - A.ax, y - A.ay, A.fw, A.fh); }
  const padDead = (n, z, p) => p.k === 'exit' && CFG[n].gating && !ST(n).act[z];
  const padUsed = (n, z, p) => p.k === 'decoy' && ST(n).used[z + p.c.join('_')];
  function drawPads(n, z, now, cam, vw, vh) { const C = M(n, z), A = META[n].tp;
    for (const p of C.pads) { const [x, y] = p.fx; if (x < cam.x - 300 || x > cam.x + vw + 300 || y < cam.y - 200 || y > cam.y + vh + 450) continue;
      const used = padUsed(n, z, p), dead = padDead(n, z, p);
      if (p.r) { const key = used && p.used ? p.used : p.img, im = key && IMG[KO(n, key)];
        if (im) { ctx.save(); if (used && !p.used) { ctx.globalAlpha = .32; } else if (dead) ctx.globalAlpha = .5; ctx.drawImage(im, p.r[0], p.r[1], p.r[2], p.r[3]); ctx.restore(); } }
      if (used || dead) continue;
      if (FX.go && FX.go.p === p) continue;   // 正在传送的那一座由 go 特效接管
      const I = A.idle; if (I) frame(KT(n, 'idle'), I, Math.floor(now * 1000 / I.ms + p.c[0] * 3 + p.c[1]) % I.n, x, y, I.a); } }
  // 三、四层：Codex 氛围/layers.mjs 的粒子（龙宫出气泡，丹房飘余烬；封了炉的那一处停掉）
  function drawEmit(n, z, now, cam, vw, vh) { const E = M(n, z).emit; if (!E) return; const im = IMG[KO(n, E.tex)]; if (!im) return; const fl = flagsOf(n), md = (x, m) => ((x % m) + m) % m;
    ctx.save(); if (E.type === '余烬') ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, w, h, cnt, seed, off] of E.list) { if (off && fl[off]) continue; if (x + w / 2 < cam.x || x - w / 2 > cam.x + vw || y - h > cam.y + vh || y + 15 < cam.y) continue;
      for (let k = 0; k < cnt; k++) { const sd = seed * .091 + k * 2.399963, t = md(now / E.cyc * (k % 2 + 1) + sd, 1);
        const u = x + Math.sin(sd) * w * .34 + Math.sin(t * 6.28318 + sd) * w * .12, v = y - h * t, s = 7 + 7 * (.5 + .5 * Math.cos(sd));
        ctx.globalAlpha = Math.sin(Math.PI * t) * .78; ctx.drawImage(im, u - s / 2, v - s / 2, s, s); } }
    ctx.restore(); }
  // 二层：雪（Canvas 2D，世界坐标里两层远近雪片；风雪暴露度取 Codex 权重图第一块，墙根、屋檐下雪少）
  const SNOWW = {}; let FLAKE = null;
  function snowW(z) { const k = '2' + z; if (SNOWW[k] !== undefined) return SNOWW[k]; SNOWW[k] = null; const D = M(2, z).dyn;
    fetch('r469/f2/' + z + '/w.r8' + V).then(r => r.arrayBuffer()).then(b => { SNOWW[k] = { a: new Uint8Array(b), D }; }).catch(() => {}); return null; }
  function drawSnow(z, now, cam, vw, vh) { const S2 = snowW(z);
    if (!FLAKE) { FLAKE = document.createElement('canvas'); FLAKE.width = FLAKE.height = 16; const g = FLAKE.getContext('2d'), rg = g.createRadialGradient(8, 8, 0, 8, 8, 8); rg.addColorStop(0, 'rgba(250,252,255,1)'); rg.addColorStop(.45, 'rgba(235,244,255,.75)'); rg.addColorStop(1, 'rgba(230,240,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 16, 16); }
    const expo = (x, y) => { if (!S2) return .8; const D = S2.D, [rx, ry, rw, rh] = D.rects[0], [wx, wy, ww, wh] = D.worlds[0], u = (x - wx) / ww, v = (y - wy) / wh; if (u < 0 || v < 0 || u >= 1 || v >= 1) return 0; return S2.a[(ry + Math.floor(v * rh)) * D.atlas[0] + rx + Math.floor(u * rw)] / 255; };
    const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    ctx.save();
    for (const [pitch, vx, vy, sz, al] of [[96, 23, 36, 5, .55], [150, 63, 98, 9, .8]]) {
      const ox = vx * now, oy = vy * now, gx0 = Math.floor((cam.x - ox) / pitch) - 1, gy0 = Math.floor((cam.y - oy) / pitch) - 1, gx1 = Math.ceil((cam.x + vw - ox) / pitch) + 1, gy1 = Math.ceil((cam.y + vh - oy) / pitch) + 1;
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const r1 = hash(gx, gy + pitch), r2 = hash(gy * 1.3, gx + 7.7);
        const x = (gx + .15 + .7 * r1) * pitch + ox + 4 * Math.sin(now * 1.1 + gy), y = (gy + .15 + .7 * r2) * pitch + oy; const e = expo(x, y); if (e < .05) continue;
        ctx.globalAlpha = al * (.32 + .68 * r1) * (.35 + .65 * e); const s = sz * (.6 + .6 * r2); ctx.drawImage(FLAKE, x - s, y - s, s * 2, s * 2); } }
    ctx.restore(); }
  // 灯、明珠、没解开的机关：一点暖光，提示「这儿能点」
  function drawGlows(n, z, now, cam, vw, vh) { const C = M(n, z), st = ST(n); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const glow = (x, y, r0, col, a) => { if (x < cam.x - r0 || x > cam.x + vw + r0 || y < cam.y - r0 || y > cam.y + vh + r0) return; const g = ctx.createRadialGradient(x, y, 1, x, y, r0); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r0, y - r0, r0 * 2, r0 * 2); };
    for (const o of C.objs) { const t = typeOf(o), f = .5 + .5 * Math.sin(now * 3 + o.bx * .01);
      if (t === 'plamp') glow(o.bx, o.by - 30, 70, '170,225,255', .22 + .1 * f);
      else if (t === 'pearl' && !st.pearl[z]) glow(o.bx, o.by - 40, 60, '170,230,255', .35 + .3 * f);
      else if (t === 'seat' && st.act[z]) glow(o.bx, o.by - 40, 70, '170,230,255', .3 + .15 * f);
      else if (t === 'soul' && st.act[z]) { const k = .8 + .2 * Math.sin(now * 2 * Math.PI / 3) + .06 * Math.sin(now * 13); glow(o.bx, o.by - o.h * .62, 110, '120,170,255', .42 * k); }
      else if ((t === 'winch' && !st.win[o.id]) || ((t === 'seat' || t === 'furnace' || t === 'plaque' || t === 'soul') && !st.act[z])) glow(o.bx, o.by - 40, 70, n === 4 ? '255,190,120' : '255,232,190', .16 + .16 * f);
      else if (t === 'relic' && !st.relic[z]) glow(o.bx, o.by - 10, 34, '255,232,190', .3 + .3 * f); }
    ctx.restore(); }
  if (typeof tileAmbientLow === 'function') tileAmbientLow = (orig => function (T, cam, now) { orig.apply(this, arguments); const q = cur(); if (!q) return; const [n, z] = q;
    try { const zm = VZ(), vw = W / zm, vh = H / zm, C = M(n, z);
      if (window.R469_DYN) R469_DYN.draw(ctx, IMG[K(n, z, 'base')], n + z, 'r469/f' + n + '/' + z + '/w.r8' + V, C.dyn, flagsOf(n), now, C.w, C.h);
      drawWater(n, z, now, cam, vw, vh); drawPads(n, z, now, cam, vw, vh); } catch (e) { if (!drawErr++) console.warn('R469 low', e); } })(tileAmbientLow);
  let drawErr = 0;
  tileAmbientHigh = (orig => function (T, cam, now) { if (orig) orig.apply(this, arguments); const q = cur(); if (!q) return; const [n, z] = q;
    try { const zm = VZ(), vw = W / zm, vh = H / zm, A = META[n].tp, t = performance.now();
      if (FX.go && FX.go.n === n && FX.go.z === z) { const i = Math.floor((t - FX.go.t0) / A.go.ms); if (i >= 0 && i < A.go.n) frame(KT(n, 'go'), A.go, i, FX.go.x, FX.go.y, A.go.a); else if (i >= A.go.n) FX.go = null; }
      if (FX.arrive && FX.arrive.n === n && FX.arrive.z === z) { const i = Math.floor((t - FX.arrive.t0) / A.arrive.ms); if (i >= 0 && i < A.arrive.n) frame(KT(n, 'arrive'), A.arrive, i, FX.arrive.x, FX.arrive.y, A.arrive.a); else if (i >= A.arrive.n) FX.arrive = null; }
      drawEmit(n, z, now, cam, vw, vh); drawGlows(n, z, now, cam, vw, vh); if (n === 2) drawSnow(z, now, cam, vw, vh); } catch (e) { if (!drawErr++) console.warn('R469 high', e); } })(typeof tileAmbientHigh === 'function' ? tileAmbientHigh : null);
  // ---------- 踩阵 ----------
  const onPad = (p, x, y) => ((x - p.fx[0]) / 80) ** 2 + ((y - p.fx[1]) / 48) ** 2 < 1;
  let BUSY = false, BUSY_T = 0;
  const settle = (x, y) => { const p = world.player; p.x = x; p.y = y; world.cam = null; world.path = null; world.walkTarget = null; try { world.trail = (world.trail || []).map(() => [x, y, p.face || 'down']); for (const f of world.followers || []) { f.x = x; f.y = y; } } catch (e) {} };
  async function tp(n, z, p) { const pl = world.player, A = META[n].tp; BUSY = true; world.locked = true; world.path = null; world.walkTarget = null; pl.moving = false;
    try { const [x, y] = p.fx; pl.x = x; pl.y = y; FX.pad = { n, z, p, t0: performance.now() }; FX.go = { n, z, p, x, y, t0: performance.now() + 60 };
      try { playSnd('sfx_buff', .7); } catch (e) {} const goMs = Math.min(1400, A.go.n * A.go.ms); await sleep(goMs * .55); pl.hidden = true; await sleep(goMs * .4);
      const st = ST(n); if (p.k === 'decoy') st.used[z + p.c.join('_')] = 1;
      const [tz, tc0] = p.to, tc = land(n, tc0); await fadeOut(200); FX.go = null;
      const [tx, ty] = ctr(...tc);
      if (tz !== z) tileSetMap(MAPN(n, tz), ...P(tx, ty), 'down');
      settle(tx, ty); const p2 = world.player; p2.hidden = false; MUST.on = true; MUST.x = tx; MUST.y = ty; LAST.k = tz + tc;
      FX.arrive = { n, z: tz, x: tx, y: ty, t0: performance.now() + 150 }; await fadeIn(260);
      const told = st.told;
      if (p.k === 'decoy') { try { playSnd('sfx_claw', .5); } catch (e) {} S.flash = .35; S.flashColor = '#ff3a4a';
        if (!F().tw69_decoy) { F().tw69_decoy = 1; await say('星旋', '假阵！又被送回来了。'); await say('星旋', '踩过的那座阵盘裂开了——记住它，别再上当。'); } else toast('假阵……被送回了' + M(n, z).name + '入口', 2000); }
      else if ((p.k === 'exit' || p.k === 'back') && tz !== z) { if (!told['to_' + tz]) { told['to_' + tz] = 1; toast('万妖塔 · 第' + CN[n - 1] + '层 · ' + M(n, tz).name, 2200); } }
      else if (p.k === 'pair' && !F().tw69_pair) { F().tw69_pair = 1; await say('星旋', '纹样一样的两座阵是通的，来回都能走。'); }
    } catch (e) { console.warn('R469 tp', e); } finally { try { world.player.hidden = false; } catch (e) {} BUSY = false; world.locked = false; } }
  // ---------- 走上某一格：明珠、机关、虎卫十九、首领台 ----------
  async function run(fn) { if (BUSY) return; BUSY = true; world.locked = true; world.path = null; world.walkTarget = null; if (world.player) world.player.moving = false;
    try { await fn(); } catch (e) { console.warn('R469', e); } finally { BUSY = false; world.locked = false; } }
  function onCell(n, z, cell, tapped) { const C = M(n, z);
    if (C.P.some(c => eq(c, cell)) && !ST(n).pearl[z]) return run(() => pearl(n, z));
    if (C.L.some(c => eq(c, cell))) return run(() => mech(n, z, cell, tapped));
    if (n === 2 && z === 'c' && eq(cell, GUARD.c) && window.R427 && !T7().hu) return run(() => guard());
    if (C.B.some(c => eq(c, cell))) return run(() => boss(n)); }
  async function pearl(n, z) { const st = ST(n); if (st.pearl[z]) return; st.pearl[z] = 1; try { playSnd('sfx_star', .6); } catch (e) {}
    if (!st.told.pick) { st.told.pick = 1; await narrate(CFG[n].pick); } toast('拾得镇水明珠——送回本苑的珠座', 2200); }
  async function mech(n, z, cell, tapped) { const st = ST(n), cfg = CFG[n];
    if (n === 2) { const o = M(n, z).objs.find(o2 => eq(o2.cell, cell) && /^L\d$/.test(o2.id)); if (!o) return;
      if (st.win[o.id]) { if (tapped) await narrate(cfg.mech + '已经转开了。'); return; }
      if (o.requires_event === 'guard' && window.R427 && !T7().hu) { await guard(); if (!T7().hu) return; }
      st.win[o.id] = 1; try { playSnd('sfx_boom', .6); } catch (e) {} S.shake = 8; const k = Object.keys(st.win).length;
      await narrate(MZ.TXT[2].mechLines[Math.min(k, 3) - 1]); applyGates(); try { playSnd('sfx_charge', .5); } catch (e) {} toast('铁闸开了 ' + k + ' / 3', 1800); return; }
    if (st.act[z]) { if (tapped) await narrate(cfg.mech + (n === 3 ? '已经归座了。' : n === 4 ? '已经封上了。' : n === 5 ? '已经挂回去了。' : '已经点亮了。')); return; }
    if (n === 3 && st.pearl[z] !== 1) { toast(cfg.noPearl, 2200); return; }
    if (n === 3) st.pearl[z] = 2;
    st.act[z] = 1; try { playSnd(n === 4 ? 'sfx_boom' : 'sfx_buff', .6); } catch (e) {} S.flash = .3; S.flashColor = cfg.flash;
    const k = ZS.filter(x => st.act[x]).length; await narrate(cfg.act[Math.min(k, 3) - 1]);
    if (k >= 3 && !st.gate) { st.gate = 1; applyGates(); try { playSnd('sfx_charge', .6); } catch (e) {} S.shake = 10; toast('首领门开了', 2000); }
    else toast(M(n, z).name + '的' + cfg.mech + '解开了（' + k + ' / 3）· 出口法阵亮了', 2400); }
  async function guard() { if (!window.R427 || T7().hu) return; const p = world.player, back = [PREV.x, PREV.y]; await R427.hu(); if (!T7().hu && p) settle(back[0], back[1]); }
  async function shut(n) { await narrate(CFG[n].gateShut); await say('星旋', CFG[n].gateHint); }
  async function relic(n, z) { const st = ST(n); if (st.relic[z]) { await narrate('这件东西已经看过了。'); return; } st.relic[z] = 1; const R = n === 2 && MZ.TXT[2].relics[ZS.indexOf(z)]; if (R) await lines(R); }
  async function boss(n) { const cfg = CFG[n];
    if (!cfg.boss || !TOWER.BOSS[cfg.boss]) { await lines(STELE); return; }
    if (window.TOWER_STORY && TOWER_STORY.cleared(n)) { await narrate(cfg.after); return; }
    const X = n === 2 ? MZ.TXT[2] : cfg;
    if (!ST(n).seen) ST(n).seen = 1;
    await lines(X.meet); world.locked = true; await fadeOut(240);
    const win = await TOWER.fightBoss(n); world.locked = true;
    if (win) { const got2 = []; if (!F()['tw_prize_' + n]) { F()['tw_prize_' + n] = 1; for (const [id, c] of X.prize || []) if (ITEM_DB[id]) { addItem(id, c); got2.push(ITEM_DB[id].name + (c > 1 ? ' ×' + c : '')); } }
      if (got2.length) await showPanel('万妖塔 · 第' + CN[n - 1] + '层', ['镇妖图卷又展开了一幅。', '!获得：' + got2.join('、')]); }
    else { partyRevive(.3); const [x, y] = ctr(...land(n, M(n, 'c').entry)); settle(x, y - 20); MUST.on = true; MUST.x = x; MUST.y = y - 20; LAST.k = 'c' + M(n, 'c').entry; await fadeIn(240); toast('败下阵来……养好伤、备足丹药再来', 3000); } }
  // 二层瓮城：走进演武场那一下的话（R427 原来按旧地图坐标判断，这里按新瓮城的冰像圈）
  const PLAZA = [1950, 1450, 3100, 2200];
  updateMap = (orig => function (dt) {
    try { if (cur() && input.tapped && window.MM_API && MM_API.MM.big) { input.tapped = null; MM_API.MM.big = false; try { playSnd('ui_click'); } catch (e) {} } } catch (e) {}   // 塔里 M 地图点了不自动寻路
    const r = orig.apply(this, arguments);
    try { const q = cur(), p = world.player; if (!q || !p) return r; const [n, z] = q;
      // 看门狗：对话被别处清掉（没走 resolve）时，BUSY 会一直挂着、法阵再也不触发——没对话、没战斗却忙了 20 秒以上，就当它结束了
      if (BUSY) { if (!BUSY_T) BUSY_T = performance.now(); else if (performance.now() - BUSY_T > 20000 && !dialog && !choice && !(typeof battle !== 'undefined' && battle) && !(typeof sysPanel !== 'undefined' && sysPanel)) { BUSY = false; BUSY_T = 0; world.locked = false; try { world.player.hidden = false; } catch (e) {} } } else BUSY_T = 0;
      if (world.locked || BUSY || dialog || choice || (typeof sysPanel !== 'undefined' && sysPanel) || (typeof battle !== 'undefined' && battle)) return r;
      if (window.MAP_LOADING && MAP_LOADING()) return r;
      const C = M(n, z);
      if (MUST.on) { if (Math.hypot(p.x - MUST.x, p.y - MUST.y) > 110) MUST.on = false; }
      else for (const pd of C.pads) { if (padUsed(n, z, pd) || !onPad(pd, p.x, p.y)) continue;
        if (padDead(n, z, pd)) { MUST.on = true; MUST.x = p.x; MUST.y = p.y; toast(CFG[n].dead, 2200); try { playSnd('ui_cancel', .5); } catch (e) {} break; }
        tp(n, z, pd); return r; }
      const cell = cellOf2(p.x, p.y), ck = z + cell;
      if (ck !== LAST.k) { LAST.k = ck; onCell(n, z, cell, false); }
      if (!BUSY) { PREV.x = p.x; PREV.y = p.y; }
      if (n === 2 && z === 'b' && window.R427 && !T7().plaza && p.x > PLAZA[0] && p.x < PLAZA[2] && p.y > PLAZA[1] && p.y < PLAZA[3]) { T7().plaza = 1; run(() => lines(R427.TXT.plaza)); }
    } catch (e) {} return r; })(updateMap);
  // ---------- M 键地图：全黑，只亮首领台，红点是自己（同一层三苑竖着摞成一张，外苑在下） ----------
  const ZY = { a: 2, b: 1, c: 0 };
  const bossAt = n => { const B = M(n, 'c').B[0]; return B ? ctr(...B) : [2520, 840]; };
  function drawTowerMap() { const MA = window.MM_API, q = cur(), p = world.player; if (!MA || !q || !p) return; const [n, z] = q, MM = MA.MM, now = performance.now() / 1000, BA = bossAt(n);
    const big = MM.big, R = big ? 250 : MM.r, cx = big ? W / 2 : MM.cx, cy = big ? H / 2 + 10 : MM.cy;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip(); ctx.fillStyle = 'rgba(7,4,8,.985)'; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    const glow = (x, y, r, a) => { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(255,70,80,${a})`); g.addColorStop(.4, `rgba(200,20,40,${a * .5})`); g.addColorStop(1, 'rgba(120,0,20,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    const pulse = .75 + .25 * Math.sin(now * 2.4);
    if (big) { const MW = 5040, MH = 3600 * 3, k = (R * 1.7) / MH, ox = cx - MW * k / 2, oy = cy - MH * k / 2, toB = (zz, x, y) => [ox + x * k, oy + (ZY[zz] * 3600 + y) * k];
      ctx.strokeStyle = 'rgba(150,40,50,.35)'; ctx.lineWidth = 1; for (const zz of ZS) { const [a, b] = toB(zz, 0, 0); ctx.strokeRect(a, b, MW * k, 3600 * k);
        ctx.font = `600 13px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = zz === z ? 'rgba(255,210,200,.8)' : 'rgba(200,150,150,.35)'; ctx.fillText(M(n, zz).name, a + 6, b + 5); }
      const [bx, by] = toB('c', BA[0], BA[1]); ctx.globalCompositeOperation = 'lighter'; glow(bx, by, 46 * pulse, .9); glow(bx, by, 16, 1); ctx.globalCompositeOperation = 'source-over';
      const [u, v] = toB(z, p.x, p.y); ctx.fillStyle = '#ff4b3a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(u, v, 5 + Math.sin(now * 5) * .7, 0, 7); ctx.fill(); ctx.stroke(); }
    else { const k = R / MM.view; let bx, by; if (z === 'c') { bx = cx + (BA[0] - p.x) * k; by = cy + (BA[1] - p.y) * k; } else { bx = cx + (BA[0] - p.x) * k; by = cy - R; }
      const d = Math.hypot(bx - cx, by - cy); if (d > R - 8) { bx = cx + (bx - cx) / d * (R - 8); by = cy + (by - cy) / d * (R - 8); }
      ctx.globalCompositeOperation = 'lighter'; glow(bx, by, 22 * pulse, .9); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ff4b3a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 4.5 + Math.sin(now * 5) * .6, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    if (big) { ctx.save(); ctx.font = `600 16px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#0a0606'; ctx.fillRect(0, cy + R + 46, W, 44); ctx.fillStyle = '#e8c9c0'; ctx.fillText('红点是你，红光处是首领。路，要自己找。' + (typeof GX_TOUCH !== 'undefined' && GX_TOUCH ? '　点任意处关闭' : '　点任意处或按 M 键关闭'), cx, cy + R + 66); ctx.restore(); } }
  drawMapHud = (orig => function () { orig.apply(this, arguments); try { if (cur() && S.hud !== false && !S.menu && !dialog && !choice) drawTowerMap(); } catch (e) {} })(drawMapHud);
  // ---------- 铸剑师那里选层：一到六层（测试版不设门槛） ----------
  const NAME = { 1: '彼岸花海', 2: '北关雪城', 3: '沉渊龙宫', 4: '焚羽丹房', 5: '山神古城', 6: '阴兵宫城' };
  const enterOld = TOWER.enter;
  async function enter() { const ns = [1, ...FLOORS];
    const opts = ns.map(n => '第' + CN[n - 1] + '层 · ' + NAME[n] + (window.TOWER_STORY && TOWER_STORY.cleared(n) ? '（已镇）' : ''));
    const i = await choose('万妖塔', [...opts, '算了']); if (i < 0 || i >= ns.length) return; const n = ns[i];
    if (!F().tw_told) { F().tw_told = 1; await say('铸剑师', '潭底下压着一座塔，九层，层层镇着上古的凶物。我守这潭，也守这道门。'); await say('铸剑师', '进去了，生死自理。打不过就往回跑——入口那块地方，它们不敢靠近。'); }
    if (n === 1 || (n === 2 && OLD2)) { const Mo = MZ.META['f' + n], E = Mo.entrance.center; await goMap('wyt_f' + n, ...P(E[0], E[1] - 70), 'up');
      if (!MZ.ST(n).seen) { MZ.ST(n).seen = 1; world.locked = true; try { await lines(MZ.TXT[n].intro); } finally { world.locked = false; } } return; }
    const [x, y] = ctr(...land(n, M(n, 'a').entry)); await goMap(MAPN(n, 'a'), ...P(x, y - 20), 'up');
    const st = ST(n); if (!st.seen) { st.seen = 1; world.locked = true; try { await lines(n === 2 ? MZ.TXT[2].intro : CFG[n].intro); } finally { world.locked = false; } } }
  TOWER.enter = enter;
  // ---------- 测试面板：直接进某层某苑、切回旧二层、一键解开本层机关 ----------
  function goZone(n, z) { const [x, y] = ctr(...land(n, M(n, z).entry)); goMap(MAPN(n, z), ...P(x, y - 20), 'up'); }
  function solve(n) { const st = ST(n); if (n === 2) { for (const id of ['L1', 'L2', 'L3']) st.win[id] = 1; if (window.R427) T7().hu = 1; } else { for (const z of ZS) { st.act[z] = 1; if (n === 3) st.pearl[z] = 2; } st.gate = 1; } applyGates(); toast('第' + CN[n - 1] + '层机关全开（测试）', 1800); }
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r469]')) return; const h = document.createElement('h4'); h.textContent = '11-28 新加 · 万妖塔二～六层三苑（Codex R447 / R448 / R465）'; h.setAttribute('data-r469', '1'); p.appendChild(h);
      for (const n of FLOORS) { const row = document.createElement('div'); row.className = 'row';
        for (const z of ZS) { const b = document.createElement('button'); b.textContent = CN[n - 1] + '层' + M(n, z).name; b.onclick = () => { try { p.style.display = 'none'; } catch (e) {} goZone(n, z); }; row.appendChild(b); }
        const b2 = document.createElement('button'); b2.textContent = '解开' + CN[n - 1] + '层机关'; b2.onclick = () => solve(n); row.appendChild(b2); p.appendChild(row); }
      const row = document.createElement('div'); row.className = 'row'; const b = document.createElement('button'); const lab = () => { b.textContent = OLD2 ? '二层：旧单张迷宫（点切回三苑）' : '二层：新三苑（点切回旧单张迷宫）'; };
      lab(); b.onclick = () => { OLD2 = !OLD2; try { localStorage.setItem('gx_r469_old2', OLD2 ? '1' : '0'); } catch (e) {} lab(); toast(OLD2 ? '二层改回旧单张迷宫（记在本机）' : '二层用新三苑', 1800); }; row.appendChild(b); p.appendChild(row); };
    if (document.getElementById('dbgPanel')) add(); else { const mo = new MutationObserver(() => { if (document.getElementById('dbgPanel')) { add(); mo.disconnect(); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}
  window.R469 = { land, CFG, CHEST, ST, M, MAPN, goZone, solve, tp, cur, FX, MUST, LAST, enter, enterOld, build, buildAll, applyGates, ctr, onCell, get OLD2() { return OLD2; } };
})();
