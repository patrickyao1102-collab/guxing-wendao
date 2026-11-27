// ================= R398 · 野外多放几只宝箱，装的是五行之精和药材（只进测试版）=================
// 作者 11-27 08:30：「宝箱什么可以多放一点，不一定都放装备，也不可能每个宝箱都是装备吧。药材啊，还有炼器材料……」
// 六张野外地图一共加十一只。里面没有装备：五行之精（多给这张图上打不到的那几行——前期水精、木精难得）、丹药、灵石。
// 位置是程序挑的：从入口走得到、四周宽敞（不会堵路）、不被树冠屋檐盖住、离入口和别的宝箱都远——所以多半在岔路尽头的空地上。每张图第一次进去时算一次，以后不变。
(function () {
  if (typeof TMAPS === 'undefined' || !window.WXJ || typeof tileSetMap !== 'function') return;
  const ADD = {
    tj_xiashan: [[['m_wx_shui', 2], ['p_small', 2]], [['m_wx_mu', 2], ['gold', 80]], [['m_wx_jin', 1], ['m_wx_tu', 1], ['moon_dew', 1]]],
    lin_forest: [[['m_wx_mu', 2], ['p_small', 1]]],
    hf_valley: [[['m_wx_huo', 2], ['p_mp', 1]]],
    xt_road: [[['m_wx_shui', 2], ['gold', 100]], [['m_wx_tu', 2], ['p_small', 2]]],
    m_yy_tiger: [[['m_wx_shui', 3], ['p_big', 1]], [['m_wx_mu', 3], ['gold', 200]]],
    m_yy_verge: [[['m_wx_mu', 3], ['p_mp', 2]], [['m_wx_jin', 2], ['m_wx_shui', 2]]],
  };
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = seed || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function spots(name, n) { const M = TMAPS[name], B = M && M.baked; if (!B || typeof B.blocked !== 'string' || !B.cols) return [];
    const cs = B.cs, cols = B.cols, rows = B.rows, free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && B.blocked[r * cols + c] === '0';
    const seen = new Uint8Array(cols * rows), q = [], ents = [];
    if (M.start) ents.push([(M.start[0] + .5) * 64, (M.start[1] + .8) * 64]); for (const e of M.exits || []) ents.push([(e.x + (e.w || 1) / 2) * cs, (e.y + (e.h || 1) / 2) * cs]);
    for (const [ex, ey] of ents) { const c0 = Math.floor(ex / cs), r0 = Math.floor(ey / cs); let hit = false; for (let d = 0; d < 14 && !hit; d++) for (let dy = -d; dy <= d && !hit; dy++) for (let dx = -d; dx <= d; dx++) if (free(c0 + dx, r0 + dy)) { if (!seen[(r0 + dy) * cols + c0 + dx]) { q.push(c0 + dx, r0 + dy); seen[(r0 + dy) * cols + c0 + dx] = 1; } hit = true; break; } }
    for (let i = 0; i < q.length; i += 2) { const c = q[i], r = q[i + 1]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dx, nr = r + dy; if (free(nc, nr) && !seen[nr * cols + nc]) { seen[nr * cols + nc] = 1; q.push(nc, nr); } } }
    const k = Math.ceil(76 / cs), room = (c, r) => { for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) if (!free(c + dx, r + dy) || !seen[(r + dy) * cols + c + dx]) return false; return true; };
    const avoid = ents.map(e => [e[0], e[1], 420]); for (const ch of M.chests || []) avoid.push([(ch.c + .5) * 64, (ch.r + .8) * 64, 520]); for (const np of M.npcs || []) if (np.c != null) avoid.push([(np.c + .5) * 64, (np.r + .8) * 64, 220]);
    for (const d of M.doors || []) if (d.x != null) avoid.push([d.x, d.y, 240]); for (const y of window.R370_YW || []) if (y.map === name && y.pos) avoid.push([y.pos[0], y.pos[1], 420]);
    // 不能被树冠、屋檐盖住：凡是画在它前面的物件（脚线在它南边），外框罩住箱子的都不要
    const front = (B.objs || []).filter(o => !o.flat && o.w > 50 && o.h > 50), hid = (x, y) => front.some(o => o.sy > y - 6 && x > o.x - 46 && x < o.x + o.w + 46 && y - 20 > o.y - 10 && y - 70 < o.y + o.h);
    const R = rng(hash('r398' + name)), cand = [];
    for (let t = 0; t < 30000 && cand.length < 260; t++) { const c = Math.floor(R() * cols), r = Math.floor(R() * rows); if (!room(c, r)) continue; const x = (c + .5) * cs, y = (r + .5) * cs; if (x < 120 || y < 200 || x > B.w - 120 || y > B.h - 100) continue; if (avoid.some(([ax, ay, d]) => Math.hypot(ax - x, ay - y) < d)) continue; if (hid(x, y) || hid(x, y + 70)) continue; cand.push([x, y]); }
    const out = []; for (let i = 0; i < n && cand.length; i++) { let best = -1, bd = -1; for (let j = 0; j < cand.length; j++) { const [x, y] = cand[j]; let d = Math.min(...ents.map(e => Math.hypot(e[0] - x, e[1] - y)), 9e9); for (const o of out) d = Math.min(d, Math.hypot(o[0] - x, o[1] - y) * 1.2); if (d > bd) { bd = d; best = j; } } if (best < 0 || bd < 380) break; out.push(cand[best]); cand.splice(best, 1); }
    return out; }
  const done = {};
  function place(name) { if (done[name] || !ADD[name]) return; done[name] = 1; const M = TMAPS[name]; if (!M || !M.baked) return; M.chests = M.chests || []; if (M.chests.some(c => c._r398)) return;
    const list = ADD[name].map(items => items.filter(([id]) => id === 'gold' || ITEM_DB[id])), sp = spots(name, list.length);
    sp.forEach(([x, y], i) => { M.chests.push({ c: x / 64 - .5, r: y / 64 - .8, items: list[i], _r398: 1 }); }); }
  tileSetMap = (orig => function (m) { try { if (ADD[m]) { if (window.R283) R283.apply(m); place(m); } } catch (e) { console.warn('R398', e); } return orig.apply(this, arguments); })(tileSetMap);
  window.R398 = { ADD, place, spots, list: name => (TMAPS[name].chests || []).filter(c => c._r398).map(c => [Math.round((c.c + .5) * 64), Math.round((c.r + .8) * 64), c.items]) };
})();
