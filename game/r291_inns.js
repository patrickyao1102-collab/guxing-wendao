// ================= R291 · 两家客栈换房（作者 11-15）=================
// 作者：「悦来客栈就保持现在的大堂设计，二楼直接上楼，然后有三间房，用老版天字三号房那种朴素的布局」
//      「空回廊留给云来；更豪华的都放到云来客栈里去」
// 1) 悦来二楼回廊三扇门（原来两扇 + 东头新开一扇）→ 三间朴素客房，照云来天字三号房的老布局（床、衣柜、圆桌、屏风）；
// 2) 原来悦来那两间豪华客房（R274 那套：双人间、单人间）搬去云来二楼回廊，成为天字二号、天字四号（原来这两扇门推不开）。
//    旧存档里站在那两间屋里的，出门会回到云来回廊。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.qy_inn || !TMAPS.xt_inn_corr || !TMAPS.xt_inn_room3) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const QY = TMAPS.qy_inn, CORR = TMAPS.xt_inn_corr, R3 = TMAPS.xt_inn_room3;
  const copyView = (from, to) => { try { if (MAP_ZOOM[from] && !MAP_ZOOM[to]) MAP_ZOOM[to] = MAP_ZOOM[from]; if (typeof WIDE_OK === 'object' && WIDE_OK[from]) WIDE_OK[to] = 1; if (window.R252_WIN && R252_WIN[from]) R252_WIN[to] = R252_WIN[from]; } catch (e) {} };

  // ---------------- 1) 悦来：三间朴素客房 ----------------
  const ex0 = (R3.exits || [])[0] || { x: 65, y: 108, w: 30, h: 8 };
  const DOORS = [['qy_inn_s1', '悦来客栈 · 天字一号房', 706, '天字一号房'], ['qy_inn_s2', '悦来客栈 · 天字二号房', 1131, '天字二号房'], ['qy_inn_s3', '悦来客栈 · 天字三号房', 1530, '天字三号房']];
  for (const [id, title, x, label] of DOORS) {
    const back = P(x + 20, 200 + 48);
    TMAPS[id] = Object.assign({}, R3, { title, npcs: [], chests: [], doors: [], onEnter: null, fog: false,
      exits: [Object.assign({}, ex0, { to: 'qy_inn', at: back, face: 'down', label: '出房门 · 二楼回廊', cond: null, msg: '' })] });
    copyView('xt_inn_room3', id);
    const d = (QY.doors || []).find(d => d.label === label && /^qy_inn_room_|^qy_inn_s/.test(d.to));
    if (d) { d.to = id; d.at = R3.start || TMAPS[id].start; }
    else (QY.doors = QY.doors || []).push({ x, y: 200, rw: 40, rh: 16, to: id, at: R3.start || TMAPS[id].start, face: 'up', label });
  }

  // ---------------- 2) 云来：天字二号、四号接上两间豪华客房 ----------------
  const MOVE = [['qy_inn_room_a', 'xt_inn_room2', '云来客栈 · 天字二号房', '天字二号的房门', '天字二号房', 674], ['qy_inn_room_b', 'xt_inn_room4', '云来客栈 · 天字四号房', '天字四号的房门', '天字四号房', 1448]];
  for (const [old, id, title, spotName, label, x] of MOVE) {
    const M = TMAPS[old]; if (!M) continue;
    const spot = (CORR.npcs || []).find(n => n.name === spotName); const back = spot ? [spot.c, spot.r + 1.1] : P(x, 420);
    M.title = title;
    for (const e of M.exits || []) { e.to = 'xt_inn_corr'; e.at = back; e.label = '出房门 · 二楼走廊'; }
    TMAPS[id] = M; copyView(old, id);   // 新旧两个名字指着同一间屋（旧存档能读）
    if (spot) spot.cond = () => false;   // 原来「门推不开」的那句不要了
    const cx = Math.round(x / 8) - 5;
    (CORR.exits = CORR.exits || []).push({ x: cx, y: 39, w: 10, h: 7, to: id, at: M.start, face: 'up', label, arrow: -Math.PI / 2 });
  }
  // 云来回廊已有出口：大堂下楼、天字三号；天字一号由 R232 的「房门」互动点进出，保持不动
})();
