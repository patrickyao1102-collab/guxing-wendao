// ================= R425 · 宝箱：小一点、点得到、不被挡住（只进测试版）=================
// 作者 11-28：「宝箱……长版的我觉得太大了……很多宝箱都被卡着坐标、或者光标都点不到。可以把宝箱做的小一点，但精细发光一点。」
// Claude 查了一遍：41 张有宝箱的图里，三十来只被树冠、屋檐、城墙盖住（画在箱子前面，点上去点到的是树），还有几只放在走不到的地方。
//   ① 画小：木 / 铜 / 金三档从 92 / 102 / 112 宽缩到 68 / 74 / 80（新的小箱子图 Codex 在画，到了再换）。
//   ② 点得到：可点的范围跟着画走，再四周放宽一点（手指比鼠标粗）。
//   ③ 挪位置：进图时把被盖住、走不到的箱子挪到附近最近的一块空地上（从入口走得到、前面没有东西挡、离人和门有点距离）。
//      开没开过照旧认得：老位置上开过的，挪过去也是开过的。
(function () {
  if (typeof tileSetMap !== 'function' || typeof TMAPS === 'undefined') return;
  window.R425_CHEST_W = { wood: 68, bronze: 74, gold: 80 };
  const F = () => (S.flags = S.flags || {}), key = (m, c, r) => 'chest_' + m + '_' + c + '_' + r;
  function fix(m) { const T = world.map && world.map.T; if (!T || !T.block || !world.chests || !world.chests.length) return;
    const cs = T.cs || 64, c0 = T.c0 || 0, R = T.rows, C = T.block[0].length;
    const free = (x, y) => { const r = Math.floor(y / cs), c = Math.floor(x / cs) - c0; return r >= 0 && c >= 0 && r < R && c < C && T.block[r][c] === 0; };
    // 从玩家站的地方灌水：哪些格子走得到
    const seen = new Uint8Array(R * C), q = [], p = world.player; const pr = Math.floor(p.y / cs), pc = Math.floor(p.x / cs) - c0;
    const seed = (r, c) => { if (r >= 0 && c >= 0 && r < R && c < C && T.block[r][c] === 0 && !seen[r * C + c]) { seen[r * C + c] = 1; q.push(c, r); } };
    seed(pr, pc); for (const d of T.doors || []) if (d.edge && d.x != null) for (let r = d.y; r < d.y + (d.h || 1); r++) for (let c = d.x; c < d.x + (d.w || 1); c++) seed(r, c - c0);
    for (let i = 0; i < q.length; i += 2) { const c = q[i], r = q[i + 1]; seed(r, c + 1); seed(r, c - 1); seed(r + 1, c); seed(r - 1, c); }
    const reach = (x, y) => { const r = Math.floor(y / cs), c = Math.floor(x / cs) - c0; return r >= 0 && c >= 0 && r < R && c < C && seen[r * C + c] === 1; };
    const front = (T.objs || []).filter(o => o.bk && !o.flat && o.w > 50 && o.h > 50);
    const covered = (x, y) => front.some(o => o.sy > y + 4 && x > o.x + 6 && x < o.x + o.w - 6 && y - 26 > o.y && y - 64 < o.y + o.h);
    const people = (world.actors || []).filter(a => a.npc).map(a => [a.x, a.y]);
    const ok = (x, y, self) => { for (let dx = -36; dx <= 36; dx += 12) for (let dy = -16; dy <= 4; dy += 10) if (!free(x + dx, y + dy)) return false;
      let st = false; for (let dy = 24; dy <= 90 && !st; dy += 12) for (let dx = -40; dx <= 40 && !st; dx += 20) if (reach(x + dx, y + dy)) st = true; if (!st) return false;
      if (covered(x, y)) return false; if (people.some(([ax, ay]) => Math.hypot(ax - x, ay - y) < 110)) return false;
      if (world.chests.some(o => o !== self && Math.hypot((o.c + .5) * 64 - x, (o.r + 1) * 64 - y) < 160)) return false; return true; };
    for (const ch of world.chests) { const x0 = (ch.c + .5) * 64, y0 = (ch.r + 1) * 64; if (ok(x0, y0, ch)) continue;
      let best = null; for (let rad = 16; rad <= 640 && !best; rad += 16) for (let a = 0; a < 24 && !best; a++) { const x = x0 + Math.cos(a * Math.PI / 12) * rad, y = y0 + Math.sin(a * Math.PI / 12) * rad * .8; if (ok(x, y, ch)) best = [x, y]; }
      if (!best) continue; const opened = ch.opened || !!F()[key(m, ch.c, ch.r)];
      ch._from = [ch.c, ch.r]; ch.c = Math.round((best[0] / 64 - .5) * 16) / 16; ch.r = Math.round((best[1] / 64 - 1) * 16) / 16;
      if (opened) { ch.opened = true; F()[key(m, ch.c, ch.r)] = 1; } else if (F()[key(m, ch.c, ch.r)]) ch.opened = true; } }
  tileSetMap = (orig => function (m) { const r = orig.apply(this, arguments); try { fix(m); } catch (e) { console.warn('R425', e); } return r; })(tileSetMap);
  // 点得到：画多大就能点多大，四周再放宽一些
  if (typeof pickInteract === 'function') pickInteract = (orig => function (wx, wy) { const h = orig.apply(this, arguments); if (h) return h;
    for (const ch of world.chests || []) { const x = (ch.c + .5) * 64, y = (ch.r + 1) * 64; if (Math.abs(wx - x) < 52 && wy < y + 22 && wy > y - 96) return { type: 'chest', ch }; }
    return null; })(pickInteract);
})();
