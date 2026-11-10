// ================= R191 · 青竹西院 ↔ 青竹菜园的竹月门改成侧面（Codex R191G）=================
// 作者 11-10：「竹门也不是正对着玩家啊，应该是侧面啊，你正对着视角很奇怪；地图另一边也是这个问题」
// 路是东西向穿过去的，门立在南北向的竹篱上——换成侧看的月门，拆成 back（人后面）和 front（人前面）两层，人从两层中间穿过去。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const SPEC = {
    qingzhu_court: { match: o => o.img === 'r175g_west_gate' || o.id === 'r175g_west_gate', key: 'court_west_gate_side', x: -1664, y: 1374, w: 288, h: 262, foot: 1623, walk: [-1568, 1564, 96, 49] },
    qingzhu_garden2: { match: o => o.id === 'r175g2_e_west_east_gate' || o.img === 'r175g2_e_west_east_gate', key: 'garden_east_gate_side', x: 2072, y: 987, w: 288, h: 233, foot: 1207, walk: [2168, 1140, 96, 58] },
  };
  const A = {};
  for (const m in SPEC) for (const L of ['back', 'front']) { const k = 'r191_' + SPEC[m].key + '_' + L, i = new Image(); i.onload = () => { IMG[k] = i; try { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(i, 0, 0); A[k] = g.getImageData(0, 0, i.width, i.height).data; } catch (e) {} }; i.src = 'r191g/' + SPEC[m].key + '_' + L + '.webp?v=1'; }
  // 阻挡：原来正面月门的两个石墩位置放开，换成新门两根门柱的柱脚；门洞那条路保持通畅
  function cells(T, sp) { const cs = T.cs || 32, x0 = T.x0 || 0, set = [], clr = [];
    const c0 = Math.floor((sp.x - x0) / cs), c1 = Math.floor((sp.x + sp.w - 1 - x0) / cs), r0 = Math.floor(sp.y / cs), r1 = Math.floor((sp.y + sp.h - 1) / cs);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) clr.push([r, c]);
    if (cs <= 16) for (const L of ['back', 'front']) { const d = A['r191_' + sp.key + '_' + L]; if (!d) continue; let bot = 0; for (let y = sp.h - 1; y >= 0 && !bot; y--) for (let x = 0; x < sp.w; x += 2) if (d[(y * sp.w + x) * 4 + 3] > 80) { bot = y; break; }
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) { const wx = (c + .5) * cs + x0, wy = (r + .5) * cs, lx = Math.round(wx - sp.x), ly = Math.round(wy - sp.y); if (ly < bot - 26 || ly > bot || lx < 0 || lx >= sp.w) continue;
        if (wx > sp.walk[0] - 4 && wx < sp.walk[0] + sp.walk[2] + 4 && wy > sp.walk[1] - 2 && wy < sp.walk[1] + sp.walk[3] + 2) continue; if (d[(ly * sp.w + lx) * 4 + 3] > 80) set.push([r, c]); } }
    return { set, clr }; }
  setInterval(() => { try { const m = world.mapName, sp = SPEC[m], T = world.map && world.map.T; if (!sp || !T || !T.objs || !T.block) return; if (window.MAP_READY && !MAP_READY()) return;
      const kb = 'r191_' + sp.key + '_back', kf = 'r191_' + sp.key + '_front'; if (!IMG[kb] || !IMG[kf] || !A[kb] || !A[kf]) return;
      const o = T.objs.find(sp.match) || T.objs.find(q => q.id === 'r191_back_' + m);
      if (o && o.img !== kb) { o.img = kb; o.id = 'r191_back_' + m; o.x = sp.x; o.y = sp.y; o.w = sp.w; o.h = sp.h; o.sy = sp.walk[1] - 8; o.flip = false; try { window.MM_CLEAR && MM_CLEAR(m); } catch (e) {} }
      if (o && !T.objs.some(q => q.id === 'r191_front_' + m)) T.objs.push({ bk: true, id: 'r191_front_' + m, img: kf, x: sp.x, y: sp.y, w: sp.w, h: sp.h, sy: sp.foot + 26, flat: false });
      if (!o) return; const Q = T._r191 || (T._r191 = cells(T, sp)); let ch = 0;
      for (const [r, c] of Q.clr) if (T.block[r] && T.block[r][c] && !Q.set.some(q => q[0] === r && q[1] === c)) { T.block[r][c] = 0; ch++; }
      for (const [r, c] of Q.set) if (T.block[r] && !T.block[r][c]) { T.block[r][c] = 1; ch++; }
      if (ch) T._stand = null;
    } catch (e) {} }, 400);
})();
