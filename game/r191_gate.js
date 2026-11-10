// ================= R191 · 青竹西院 ↔ 青竹菜园：竹月门撤掉，只留传送法阵 =================
// 作者 11-10：「竹门也不是正对着玩家啊，应该是侧面啊，你正对着视角很奇怪；地图另一边也是这个问题」
// 路是东西向穿过去的，门立在南北向的竹篱上——换成侧看的月门，拆成 back（人后面）和 front（人前面）两层，人从两层中间穿过去。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const SPEC = {
    qingzhu_court: { match: o => o.img === 'r175g_west_gate' || o.id === 'r175g_west_gate', key: 'court_west_gate_side', x: -1664, y: 1374, w: 288, h: 262, foot: 1623, walk: [-1568, 1564, 96, 49] },
    qingzhu_garden2: { match: o => o.id === 'r175g2_e_west_east_gate' || o.img === 'r175g2_e_west_east_gate', key: 'garden_east_gate_side', x: 2072, y: 987, w: 288, h: 233, foot: 1207, walk: [2168, 1140, 96, 58] },
  };
  // 作者 11-10 晚：侧面的月门「好丑啊，要不门不加了，就留法阵吧」→ 两边的门都撤掉，只留出口的传送法阵；原来门的阻挡一并放开
  setInterval(() => { try { const m = world.mapName, sp = SPEC[m], T = world.map && world.map.T; if (!sp || !T || !T.objs || !T.block) return; if (window.MAP_READY && !MAP_READY()) return;
      const n0 = T.objs.length; T.objs = T.objs.filter(o => !(sp.match(o) || /^r191_/.test(o.id || ''))); if (T.objs.length !== n0) { try { window.MM_CLEAR && MM_CLEAR(m); } catch (e) {} }
      const cs = T.cs || 32, x0 = T.x0 || 0, c0 = Math.floor((sp.x - x0) / cs), c1 = Math.floor((sp.x + sp.w - 1 - x0) / cs), r0 = Math.floor(sp.y / cs), r1 = Math.floor((sp.y + sp.h - 1) / cs); let ch = 0;
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (T.block[r] && T.block[r][c]) { T.block[r][c] = 0; ch++; }
      if (ch) T._stand = null;
    } catch (e) {} }, 400);
})();
