// ================= R283 · 全部地图碰撞重排（作者 11-15：「最影响游戏体验感的是碰撞阻碍没做好——没东西的地方是空气墙，有东西的地方又能穿过去」）=================
// 每张地图逐张算过、逐张看过：
//   · 桌子、坛子、椅子、花盆、灯这类小物件：只挡它真正落地的那一块（按图里实心像素算，桌腿之间也算桌底），不再挡一大圈；
//   · 树：只挡树干，树冠下面能走（人会走到树冠后面被挡住）；
//   · 房子、楼：从墙脚往里挡到房身，不能再从后面走进屋里；
//   · 墙、水、山崖、栏杆这些地形照旧挡；原来画了却没挡上的（后加的楼、河）补上；
//   · 门口、出口、人站的地方保证走得到。
// 格子数据在 r283/grid.js（由测试程序逐张算好 + 我逐张看图后手调的规则）。只有地图原数据没变时才换（防止以后改了地图却套上旧格子）。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof tileSetMap !== 'function' || /[?&]nocol=1/.test(location.search)) return;   // nocol=1：测试程序重算时用原格子
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
  const unrle = (s, n) => { const out = new Array(n); let i = 0, v = 0; for (const t of s.split('.')) { const k = parseInt(t, 36) || 0; out.fill(v ? '1' : '0', i, i + k); i += k; v ^= 1; } return out.join(''); };
  const done = {};
  function apply(m) {
    const G = window.R283_GRID && R283_GRID[m], B = TMAPS[m] && TMAPS[m].baked; if (!G || !B || done[m] === B.blocked) return;
    if (B.cols !== G.cols || B.rows !== G.rows || hash(B.blocked) !== G.h) { done[m] = B.blocked; return; }
    B.blocked = unrle(G.r, G.cols * G.rows); done[m] = B.blocked;
  }
  tileSetMap = (o => function (m) { try { apply(m); } catch (e) {} return o.apply(this, arguments); })(tileSetMap);
  // 人的脚底判定从左右各 16 像素收到 12：一格宽的过道（比如桌子和墙之间）不用对得那么准才过得去
  if (typeof canStand === 'function') canStand = function (T, x, y) { for (const [ox, oy] of [[-12, -4], [12, -4], [-12, 6], [12, 6]]) { const [c, r] = cellOf(x + ox, y + oy); if (!walkable(T, c, r)) return false; } return true; };
  window.R283 = { apply, done };
})();
