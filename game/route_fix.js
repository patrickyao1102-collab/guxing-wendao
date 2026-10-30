// ================= 天剑宗路线整理 + 任务指引光标 =================
// 作者反馈：演武广场南边的大台阶应该是「下山」，藏经阁另开一条路；路线要有指引光标。
//  · 演武广场 南 → 山门 · 下山（没有宗主吩咐不能下山；第二章出发剧情照旧在山门前触发）
//  · 藏经阁改走竹林归径西边的小路：后山崖顶 → 云海大亭 → 青竹小院 → 竹林归径 →（西）藏经阁
//  · 藏经阁外院南阶 → 回竹林归径
//  · 任务指引：按当前任务算出「下一步该走哪个出口」，只在小地图 / 大地图上标金圈，大地图出口牌标金框（地面不画箭头）
(function () {
  if (typeof CXB2 === 'undefined' || typeof TMAPS === 'undefined') return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const nearOf = Bm => (x, y) => {
    const k = Math.max(1, Math.round(16 / Bm.cs));
    const ok = (c, r) => { if (c < k || r < 1 || c >= Bm.cols - k || r >= Bm.rows - 1) return false; for (let d = -k; d <= k; d++) if (Bm.blocked.charCodeAt(r * Bm.cols + c + d) !== 48) return false; return true; };
    const c0 = Math.floor(x / Bm.cs), r0 = Math.floor(y / Bm.cs), lim = Math.ceil(30 * 32 / Bm.cs);
    for (let d = 0; d < lim; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue; const c = c0 + dx, r = r0 + dy; if (ok(c, r)) return [(c + .5) * Bm.cs, (r + .6) * Bm.cs]; }
    return [x, y];
  };
  const atIn = (id, x, y) => CXB2[id] ? P(...nearOf(CXB2[id])(x, y)) : null;

  const BM = TMAPS.qingzhu_bamboo, SC = TMAPS.tj_scripture, FR = TMAPS.tj_front;
  if (BM && SC && CXB2.qingzhu_bamboo && CXB2.tj_scripture) {
    // 竹林归径西边小路（林间空地尽头）→ 藏经阁外院南阶
    if (!BM.exits.some(e => e.to === 'tj_scripture'))
      BM.exits.push({ x: 6, y: 78, w: 10, h: 18, to: 'tj_scripture', label: '西 · 藏经阁', at: atIn('tj_scripture', 1024, 1900), face: 'up' });
    // 藏经阁外院南阶 → 竹林归径（落在西边空地）
    const back = SC.exits.find(e => e.to === 'tj_front');
    if (back) { back.to = 'qingzhu_bamboo'; back.label = '南 · 竹林归径'; back.at = atIn('qingzhu_bamboo', 190, 690); back.face = 'right'; }
  }
  if (FR) {
    // 演武广场南门：山门 · 下山
    const g = FR.exits.find(e => e.to === 'tj_scripture');
    if (g) { g.label = '南 · 山门（下山）'; g.cond = () => false; g.msg = '这是下山的山门。没有宗主吩咐，不能私自下山。'; g.noNav = true; }
  }

  // ---------------- 指引光标 ----------------
  const G = { t: 0, hop: null, pt: null, map: null };
  const dlgOpen = () => (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice);
  const doorSpot = (T, d) => {
    if (!d.edge) return d.rect ? [d.rect[0], d.rect[1]] : [(d.c + .5) * TS, (d.r + 1) * TS - 6];
    if (d._spot && d._spotT === T) return d._spot;
    let x = (d.x + (d.w || 1) / 2) * CS, y = (d.y + (d.h || 1) / 2) * CS;
    const cx = T.mw / 2, cy = T.mh / 2, L = Math.hypot(cx - x, cy - y) || 1, ux = (cx - x) / L, uy = (cy - y) / L;
    for (let k = 0; k < 14; k++) { if (canStand(T, x, y)) break; x += ux * 12; y += uy * 12; }
    return [Math.max(40, Math.min(T.mw - 40, x)), Math.max(40, Math.min(T.mh - 24, y))];
  };
  function compute() {
    G.hop = null; G.pt = null; G.map = world.mapName;
    const R = window.QUEST_ROUTE; if (!R || !world.map || !world.map.tile || !world.player || !S.quest) return;
    const q0 = S.quest.replace(/（[^）]*）|\([^)]*\)/g, '');
    const rule = R.RULES.find(([re]) => re.test(q0)) || R.RULES.find(([re]) => re.test(S.quest)); if (!rule) return;
    let goal; try { goal = rule[1](); } catch (e) { return; }
    if (!goal || !TMAPS[goal.map]) return;
    const T = world.map.T, here = world.mapName, p = world.player;
    if (goal.map !== here) {
      const hop = R.nextHop(here, goal.map);
      const ds = hop ? (T.doors || []).filter(d => d.to === hop) : [], d = ds.find(d => !d.cond || d.cond()) || ds[0];   // 同一目的地有多个口（如藏经阁正门锁着、侧廊能走）→ 指向能走的那个
      if (d && (!d.cond || d.cond())) { G.hop = hop; G.pt = doorSpot(T, d); return; }
      // 出口暂时被剧情锁住（如第一章后山南阶）→ 指向剧情触发点
      const tg = (world.triggers || []).filter(t => !t.done && t.marker !== false).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      if (tg) { G.pt = [tg.x, tg.y]; return; }
      if (d) { G.hop = hop; G.pt = doorSpot(T, d); }
      return;
    }
    if (goal.pt) { G.pt = [goal.pt[0], goal.pt[1]]; return; }
    const dist = o => Math.hypot(o.x - p.x, o.y - p.y);
    if (goal.pick) { const it = (world.actors || []).filter(a => a.npc && a.npc.name === goal.pick).sort((a, b) => dist(a) - dist(b))[0]; if (it) { G.pt = [it.x, it.y]; return; } }
    const tg = (world.triggers || []).filter(t => !t.done && t.marker !== false).sort((a, b) => dist(a) - dist(b))[0]; if (tg) { G.pt = [tg.x, tg.y]; return; }
    const npc = (world.actors || []).find(a => a.npc && (typeof a.npc.mark === 'function' ? a.npc.mark() : a.npc.mark)); if (npc) G.pt = [npc.x, npc.y];
  }
  window.QUEST_HOP = () => (G.map === world.mapName ? G.hop : null);
  window.QUEST_GUIDE = G;

  const prevHigh = tileAmbientHigh;
  tileAmbientHigh = function (T, cam, now) {
    prevHigh(T, cam, now);
    try {
      const nowMs = performance.now(); if (nowMs - G.t > 400 || G.map !== world.mapName) { G.t = nowMs; compute(); }
      // 作者：地面上的金色箭头不要了——任务方向只在小地图 / 大地图上标（金圈 + 金框出口）
    } catch (e) { }
  };
})();
