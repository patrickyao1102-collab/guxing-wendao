// ================= R328 · 说话的人要在场：不在地图上的人开口，先从门口走进来（只进测试版）=================
// 作者 11-16：「一个人，你设置了他在这个场景里讲话，但这个地图里根本就没有他，你也看不见他的建模，你真的觉得会很奇怪。
//   这种地方你都要做那种地图人物的动画帧，让他进来。」「我说的不止这个任务啊，还有很多任务，你都要这么去设计的。」
// 做法（所有支线、主线通用）：说话的人这张图上看不见 → 去别的图里找他的小人（同名 NPC），从这张图的进门处走到叶孤星身边，再开口；
//   这一段对话说完（对话框、选项都关了），他走回门口消失。叶孤星、星旋（剑灵，在心里说话）、队友、旁白不算。
//   回忆、特写正在播的时候不走人。找不到小人的名字记进 window.R328_MISSING（缺的小人统一让 Codex 补）。
(function () {
  if (typeof say !== 'function' || typeof TMAPS === 'undefined') return;
  const SELF = /^(叶孤星|星旋)/;
  const ALIAS = { '镖头雷大勇': '雷大勇', '送茶的阿顺': '云来客栈伙计' };
  const MISSING = window.R328_MISSING = new Set();
  const party = () => { try { return Object.values(PARTY_DB).map(p => p.name); } catch (e) { return []; } };
  const base = who => { const w = ALIAS[who] || who; return /^(卖花姑娘|挑夫|绣娘|散修|青年|女弟子|外门弟子|小师弟)·/.test(w) ? w : w.split('·')[0]; };
  // 别的图里同名的 NPC（要有小人：key / cx / w9 / pose295 其中一个）
  let IDX = null; const index = () => { if (IDX) return IDX; IDX = new Map();
    for (const [m, T] of Object.entries(TMAPS)) for (const n of (T && T.npcs) || []) { if (!n || n.hidden || !n.name) continue; const sprite = (n.key && n.key !== 'none') || n.cx || n.w9 || n.pose295; if (!sprite) continue; if (!IDX.has(n.name)) IDX.set(n.name, n); }
    // 街上逛的访客（R66）：没有写在地图 NPC 表里，按名字补进来（玄天城的小莲和小荷用同一个小人）
    const V = { xiaohe: ['卖花姑娘·小荷', '卖花姑娘·小莲', '卖花姑娘'], zhaopopo: ['赵婆婆'], daniu: ['挑夫·大牛'], afu: ['绣娘·阿芙'], laoqiaofu: ['老樵夫'], laozhou: ['散修·老周'], xuyan: ['青年·许言'], liuniang: ['柳娘'], suling: ['女弟子·苏铃'], ashi: ['外门弟子·阿石'], qingfeng: ['小师弟·清风'], qinxiaowan: ['秦小婉'] };
    for (const [k, names] of Object.entries(V)) for (const nm of names) if (!IDX.has(nm)) IDX.set(nm, { key: 'n_villager', r66: 'visitor_' + k, name: nm, h: 118 });
    return IDX; };
  const visible = b => (world.actors || []).some(a => !a.hidden && a !== world.player && ((a.npc && (a.npc.name === b || base(a.npc.name) === b)) || a.label === b));
  const busy = () => { try { return (window.R326_BUSY && R326_BUSY()) || (window.R322_BUSY && R322_BUSY()); } catch (e) { return false; } };
  const onMap = () => { try { return world && world.map && world.map.tile && S.scene === drawMap && !battle; } catch (e) { return false; } };
  const px = cr => [(cr[0] + .5) * TS, (cr[1] + .8) * TS];
  const walkTo = async (a, x, y) => { const T = world.map.T; let pts = null;
    try { const [sc, sr] = cellOf(a.x, a.y), [tc, tr] = cellOf(x, y), p = findPath(T, sc, sr, tc, tr); if (p && p.length) pts = p.slice(1).map(([c, r]) => [(c + .5) * CS, (r + .5) * CS]); } catch (e) {}
    if (!pts || !pts.length || pts.length > 80) pts = [[x, y]]; else pts[pts.length - 1] = [x, y];
    for (const [qx, qy] of pts) await moveActor(a, qx, qy, 300); };
  const spot = () => { const p = world.player, T = world.map.T; for (const [dx, dy] of [[96, 0], [-96, 0], [0, 84], [72, 60], [-72, 60], [0, -84], [140, 0], [-140, 0]]) { const x = p.x + dx, y = p.y + dy; try { if (canStand(T, x, y)) return [x, y]; } catch (e) {} } return [p.x + 90, p.y]; };
  const came = new Map();   // 走进来的人（按名字）
  const leave = async (b, o) => { came.delete(b); try { if (world.actors.includes(o.a) && world.mapName === o.map) { await walkTo(o.a, o.door[0], o.door[1]); } } catch (e) {} world.actors = world.actors.filter(x => x !== o.a); };
  setInterval(() => { try { if (!came.size) return; const quiet = !dialog && !choice && !world.locked;
    for (const [b, o] of came) { if (world.mapName !== o.map) { came.delete(b); continue; } if (quiet) { if (!o.q) o.q = performance.now(); else if (performance.now() - o.q > 1400 && !o.out) { o.out = 1; leave(b, o); } } else o.q = 0; } } catch (e) {} }, 300);
  async function walkIn(who) { const b = base(who);
    if (!b || SELF.test(b) || party().includes(b) || /[（(「]/.test(b) || b.length > 10) return;
    if (window.R328_OFF || !onMap() || busy() || visible(b) || came.has(b)) return;
    const n = index().get(b) || index().get(who); if (!n) { MISSING.add(b); return; }
    const def = world.map.def || {}, door = def.start ? px(def.start) : [world.player.x, world.player.y + 200];
    const npc = Object.assign({}, n, { talk: async () => {}, cond: null, wander: false, hidden: false, mark: null, _walkin: 1, noLabel: false });
    const a = addActor(n.key, door[0], door[1], n.name, n.color || '#c9a86a'); a.npc = npc; a.h = n.h || 108; a.face = 'up';
    came.set(b, { a, door, map: world.mapName });
    const lk = world.locked; world.locked = true;
    try { const [x, y] = spot(); await walkTo(a, x, y); const p = world.player; a.face = Math.abs(p.x - a.x) > Math.abs(p.y - a.y) ? (p.x < a.x ? 'left' : 'right') : (p.y < a.y ? 'up' : 'down'); a.dir = p.x < a.x ? -1 : 1; } catch (e) {}
    world.locked = lk; }
  say = (orig => async function (who) { try { if (who) await walkIn(String(who)); } catch (e) {} return orig.apply(this, arguments); })(say);
  window.R328 = { walkIn, came, index: () => index() };
})();
