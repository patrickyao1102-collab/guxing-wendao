// ================= 接入 Codex R52 新版林府：曲水花庭 + 家主书房 + 林逸住处 + 药灶杂役房 =================
// 从青阳镇府门（以及东西两扇侧门）进入独立的林府院落 lin_court，再由院落进正厅 / 三间客舍 / 书房 / 林逸住处 / 药灶房。
// 原有正厅、西厢、东厢、林雪静养房的地图和剧情不动，只把它们的“出门”改回院落。
(function () {
  const D = window.LIN52; if (!D || typeof CXB2 === 'undefined' || typeof TMAPS === 'undefined') return;
  const NEWIDS = Object.keys(D.maps);
  Object.assign(CXB2, D.maps);
  // 总策划：药灶房东边井台旁的花坛、灯杆、小石块挤成一团，人容易卡住——拿掉，并清掉它们的碰撞格
  { const B = CXB2.lin_court, DROP = { 'r52-base-68': null, 'r52-base-69': [673, 1773, 24, 17], 'r52-lin_court-163': [767, 1818, 26, 16], 'r52-lin_court-94': [215, 1385, 430, 27], 'r52-lin_court-95': [1659, 1385, 430, 27], 'r52-lin_court-175': [767, 778, 26, 16], 'r52-lin_court-172': [1637, 1228, 26, 16], 'r52-lin_court-148': [737, 1278, 26, 16], 'r52-lin_court-169': [1657, 1488, 26, 16], 'r52-lin_court-154': [1307, 1613, 26, 16], 'r52-lin_court-151': [767, 1628, 26, 16], 'r52-lin_court-166': [1632, 1648, 26, 16], 'r52-lin_court-157': [1362, 1718, 26, 16], 'r52-lin_court-160': [1007, 1788, 26, 16] };   // 东西两段木廊、路边小石块全部拿掉
    B.objs = B.objs.filter(o => !(o.uid in DROP));
    const bl = B.blocked.split('');
    for (const r of Object.values(DROP)) if (r) { const [x, y, w, h] = r; for (let cy = Math.floor((y - 10) / B.cs); cy <= Math.floor((y + h + 10) / B.cs); cy++) for (let cx = Math.floor((x - 10) / B.cs); cx <= Math.floor((x + w + 10) / B.cs); cx++) if (cx >= 0 && cy >= 0 && cx < B.cols && cy < B.rows) bl[cy * B.cols + cx] = '0'; }
    B.blocked = bl.join(''); }
  // ---- 图片：地面 + 物件图集 ----
  const ld = (k, src) => { const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = src; };
  for (const id of NEWIDS) { ld('cx2g_' + id, 'cx2/g_' + id + '.webp'); for (const o of CXB2[id].objs) o.img = 'cx2_' + (o.img_id || o.id); }
  if (CXB2.lin_court) CXB2.lin_court.objs = CXB2.lin_court.objs.filter(o => !/^yunting/.test(o.id || ''));   // 花庭里烘焙进去的静态云霆去掉（云霆是跟随队友，不该再站一个）
  for (let pi = 0; pi < D.atlas.pages; pi++) { const im = new Image(); im.onload = () => { for (const [k, e] of Object.entries(D.atlas.map)) if (e[0] === pi && !IMG['cx2_' + k]) { const c = document.createElement('canvas'); c.width = e[3]; c.height = e[4]; c.getContext('2d').drawImage(im, e[1], e[2], e[3], e[4], 0, 0, e[3], e[4]); IMG['cx2_' + k] = c; } }; im.src = 'cx2/lin52_atlas_' + pi + '.webp'; }
  // 物件裁切（房间两段墙按多边形裁开）
  drawBaked = (orig => function (o, now) {
    if (!o.clip) return orig(o, now);
    ctx.save(); ctx.beginPath(); o.clip.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip(); orig(o, now); ctx.restore();
  })(drawBaked);

  // ---- 坐标工具 ----
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const nearOf = Bm => (x, y) => {
    const k = Math.max(1, Math.round(16 / Bm.cs));
    const ok = (c, r) => { if (c < k || r < 1 || c >= Bm.cols - k || r >= Bm.rows - 1) return false; for (let d = -k; d <= k; d++) if (Bm.blocked.charCodeAt(r * Bm.cols + c + d) !== 48) return false; return true; };
    const c0 = Math.floor(x / Bm.cs), r0 = Math.floor(y / Bm.cs), lim = Math.ceil(30 * 32 / Bm.cs);
    for (let d = 0; d < lim; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue; const c = c0 + dx, r = r0 + dy; if (ok(c, r)) return [(c + .5) * Bm.cs, (r + .6) * Bm.cs]; }
    return [x, y];
  };
  const atIn = (id, x, y) => P(...nearOf(CXB2[id])(x, y));
  const cells = (B, e, o) => Object.assign({ x: Math.floor(e.region.x / B.cs), y: Math.floor(e.region.y / B.cs), w: Math.max(1, Math.ceil(e.region.w / B.cs)), h: Math.max(1, Math.ceil(e.region.h / B.cs)), to: e.to, label: e.label }, o);
  // 院落里某扇门（通往 room）门前 100px 的落点：门都在建筑南墙，所以往南（下）站
  const C = CXB2.lin_court;
  const courtDoor = room => (C.exits || []).find(e => e.to === room);
  const courtAt = room => { const e = courtDoor(room); if (!e) return atIn('lin_court', ...C.spawn); const cx = e.region.x + e.region.w / 2, cy = e.region.y + e.region.h; return atIn('lin_court', cx, cy + (room === 'qy_town' ? -110 : 70)); };
  // 进房间的落点：房门（出口区域）正上方 70px（suggested_spawn_px 是对面地图的坐标，不能用）
  const roomAt = room => { const B = CXB2[room]; if (!B) return null; const e = (B.exits || [])[0]; if (e && e.region) return atIn(room, e.region.x + e.region.w / 2, e.region.y - 70); return atIn(room, B.w / 2, B.h - 120); };
  let gate = null;   // 镇上林府府门（改指向前先记下位置）
  const townAt = () => (window.qyBack && (qyBack.lin_manor || qyBack.lin_guest_west)) || (gate ? P(gate.x, gate.y + 70) : null);
  const TITLE = { lin_court: '林府 · 曲水花庭', lin_study: '林府 · 家主书房', lin_yi_room: '林府 · 林逸住处', lin_service: '林府 · 药灶与杂役房' };
  const LABEL = { lin_manor: '正厅', lin_guest_west: '西厢 · 叶孤星客房', lin_guest_east: '东厢 · 云霆客房', lin_guest_xue: '内院 · 林雪静养房', lin_study: '家主书房', lin_yi_room: '林逸住处', lin_service: '药灶房', qy_town: '出府 · 青阳镇' };
  const say2 = lines => async () => { for (const l of lines) { const i = l.indexOf('：'); if (i > 0 && i < 6) await say(l.slice(0, i), l.slice(i + 1)); else await narrate(l); } };

  // ---- 注册四张新图 ----
  for (const id of NEWIDS) { const B = CXB2[id];
    const spots = (B.inter || []).filter(t => t.p && t.lines && t.lines.length).map(t => { const [c, r] = atIn(id, t.p[0], t.p[1] + 24); return { key: 'none', c, r, name: t.name || '', hidden: true, h: 110, talk: say2(t.lines) }; });
    TMAPS[id] = { title: TITLE[id] || B.title, baked: Object.assign({ ground: 'cx2g_' + id }, B), indoor: B.indoor, chests: [], leaves: !B.indoor,
      start: id === 'lin_court' ? atIn(id, ...B.spawn) : roomAt(id), npcs: spots, exits: [] };
  }
  // 院落出口：各房间 + 出府
  TMAPS.lin_court.exits = C.exits.filter(e => e.to && (CXB2[e.to] || TMAPS[e.to])).map(e => cells(C, e, { to: e.to, label: LABEL[e.to] || e.label, at: e.to === 'qy_town' ? townAt() : roomAt(e.to), face: e.to === 'qy_town' ? 'down' : 'up' }));
  for (const id of ['lin_study', 'lin_yi_room', 'lin_service']) { const B = CXB2[id]; TMAPS[id].exits = B.exits.map(e => cells(B, e, { to: 'lin_court', label: '林府院落', at: courtAt(id), face: 'down' })); }
  // 院里的人
  const npc = (cx, x, y, name, talk) => { const [c, r] = atIn('lin_court', x, y); TMAPS.lin_court.npcs.push({ key: 'none', cx, c, r, name, talk, random: Array.isArray(talk) && talk.length > 1, wander: false, h: 118 }); };
  npc('town_guard', 1250, 1960, '林府护卫', ['府门昼夜都有人守着，少侠放心。', '黑风寨的事一了，镇上总算太平了。']);
  npc('maid', 1330, 1560, '丫鬟', ['池里的锦鲤是老爷亲手放的，养了十几年了。', '客舍的被褥每天都换新的，少侠有什么吩咐尽管说。']);
  npc('steward_elder', 980, 1080, '林府老管事', ['从月洞门往北是正厅和书房，往南是客人们住的内园。', '药灶房在西南角，要用热水药材，跟那边说一声就是。']);

  // ---- 旧房间“出门” → 回到院落对应的门前 ----
  for (const id of ['lin_manor', 'lin_guest_west', 'lin_guest_east', 'lin_guest_xue']) { const M = TMAPS[id]; if (!M) continue;
    for (const e of M.exits || []) if (e.to === 'qy_town' || (id === 'lin_guest_xue' && e.to === 'lin_manor')) {
      const at = courtAt(id); Object.defineProperty(e, 'to', { value: 'lin_court', writable: true, configurable: true, enumerable: true });
      Object.defineProperty(e, 'at', { value: at, writable: true, configurable: true, enumerable: true }); e.face = 'down'; e.label = '林府院落'; } }
  // ---- 青阳镇：府门 / 东西侧门 → 林府院落 ----
  const Q = TMAPS.qy_town;
  if (Q) for (const d of Q.doors || []) {
    if (d.to === 'lin_manor') { gate = { x: d.x, y: d.y }; d.to = 'lin_court'; d.at = courtAt('qy_town'); d.face = 'up'; d.label = '林府'; }
    // 府门两侧的厢房：客房已搬进府内院落，这两间改作「待客茶坊」「杂役房」（室内图待 Codex 出，先不开放）
    else if (d.to === 'lin_guest_west') { d.to = 'lin_court'; d.at = courtAt('lin_guest_west'); d.label = '待客茶坊'; d.cond = () => false; d.msg = '茶坊里几位等着拜见家主的客人正低声品茶，掌事丫鬟朝你摆摆手：“少侠请从正门进府。”'; }
    else if (d.to === 'lin_guest_east') { d.to = 'lin_court'; d.at = courtAt('lin_guest_east'); d.label = '杂役房'; d.cond = () => false; d.msg = '杂役们正忙着劈柴挑水，屋里堆满了杂物，没什么好看的。'; }
  }
  // 院落出府落点：镇上林府门口（qyBack 在镇图初始化后才有）
  { const at = townAt(); if (at) for (const e of TMAPS.lin_court.exits) if (e.to === 'qy_town') e.at = at; }
  setTimeout(() => { const at = townAt(); if (at) for (const e of TMAPS.lin_court.exits) if (e.to === 'qy_town') e.at = at; }, 0);
  window.LIN52_ON = true;
})();
