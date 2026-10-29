// ================= 接入 Codex R54：林府前院仪门 + 待客茶坊 + 杂役房 + 六套待客茶席 =================
// 镇上林府：外府门可直接穿过，前院正北的「仪门」进曲水花庭；前院西厢 = 待客茶坊，东厢 = 杂役房。
(function () {
  const D = window.R54; if (!D || typeof CXB2 === 'undefined' || typeof TMAPS === 'undefined') return;
  const IDS = Object.keys(D.maps);
  Object.assign(CXB2, D.maps);
  // ---- 图片 ----
  const ld = (k, src) => { const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = src; };
  for (const id of IDS) { ld('cx2g_' + id, 'cx2/g_' + id + '.webp'); for (const o of CXB2[id].objs) o.img = 'cx2_' + o.img_id; }
  { const im = new Image(); im.onload = () => { for (const [k, e] of Object.entries(D.atlas.map)) { const c = document.createElement('canvas'); c.width = e[3]; c.height = e[4]; c.getContext('2d').drawImage(im, e[1], e[2], e[3], e[4], 0, 0, e[3], e[4]); IMG['cx2_' + k] = c; } }; im.src = 'cx2/r54_atlas_0.webp'; }
  // ---- 青阳镇：林府正厅 → 仪门（碰撞同步）----
  const Q = CXB2.qingyang;
  if (Q) { const i = Q.objs.findIndex(o => o.uid === 'lin_main_hall_39'); if (i >= 0) Q.objs[i] = Object.assign({}, D.gate, { img: 'cx2_' + D.gate.img_id }); if (D.qyBlocked && D.qyBlocked.length === Q.blocked.length) { const TB = TMAPS.qy_town && TMAPS.qy_town.baked; if (TB && TB !== Q && TB.blocked && TB.blocked.length === Q.blocked.length) { const a = TB.blocked.split(''); for (let i = 0; i < a.length; i++) if (D.qyBlocked[i] !== Q.blocked[i]) a[i] = D.qyBlocked[i]; TB.blocked = a.join(''); } Q.blocked = D.qyBlocked; } }
  // ---- 六间屋子换上各自风格的茶席 ----
  for (const [m, o] of Object.entries(D.tea)) { const B = CXB2[m]; if (!B) continue; const no = Object.assign({}, o, { img: 'cx2_' + o.img_id }); for (const arr of [B.objs, TMAPS[m] && TMAPS[m].baked && TMAPS[m].baked.objs]) { if (!arr) continue; const i = arr.findIndex(x => x.uid === o.uid); if (i >= 0) arr[i] = no; } }
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
  const roomAt = room => { const B = CXB2[room], e = B.exits[0]; return atIn(room, e.region.x + e.region.w / 2, e.region.y - 70); };
  const BACK = { lin_teahouse: [1248, 1240], lin_servants: [1830, 1240] };
  const TITLE = { lin_teahouse: '林府 · 待客茶坊', lin_servants: '林府 · 杂役房' };
  // 物件说明（写成游戏里的话，不留设计备注）
  const LINES = {
    '博古茶柜': ['柜里码着一排排茶罐，签子上写着“雨前”“云雾”“老枞”，最上一格摆着一套青瓷盏，看着就舍不得用。'],
    '待客茶席': ['两张圈椅之间一方小案，茶还温着。来拜见家主的客人，都先在这里候着。'],
    '小风炉': ['炉里的炭压得正好，铜壶嘴冒着细细的白气。'],
    '轮值通铺': ['通铺上的被褥叠得方方正正，枕边压着一张轮值的木牌。'],
    '工具与木桶': ['扫帚、木锨、水桶挂得整整齐齐，林府的规矩可见一斑。'],
    '晾衣杆': ['竹竿上晾着几件粗布短衫，还带着皂角的味道。'],
    '灶台与柴薪': ['灶膛里的火还没熄，旁边码着劈好的柴。杂役们一早一晚都在这里烧水做饭。'],
  };
  const say2 = lines => async () => { for (const l of lines) await narrate(l); };
  for (const id of IDS) { const B = CXB2[id];
    const spots = B.inter.filter(t => t.p && LINES[t.name]).map(t => { const [c, r] = atIn(id, t.p[0], t.p[1] + 24); return { key: 'none', c, r, name: t.name, hidden: true, h: 110, talk: say2(LINES[t.name]) }; });
    const back = BACK[id];
    TMAPS[id] = { title: TITLE[id], baked: Object.assign({ ground: 'cx2g_' + id }, B), indoor: true, chests: [], leaves: false, start: roomAt(id), npcs: spots,
      exits: B.exits.map(e => ({ x: Math.floor(e.region.x / B.cs), y: Math.floor(e.region.y / B.cs), w: Math.max(1, Math.ceil(e.region.w / B.cs)), h: Math.max(1, Math.ceil(e.region.h / B.cs)), to: 'qy_town', label: '出门 · 青阳镇', at: atIn('qingyang', ...back), face: 'down' })) };
  }
  const npc = (id, cx, x, y, name, talk) => { const [c, r] = atIn(id, x, y); TMAPS[id].npcs.push({ key: 'none', cx, c, r, name, talk, random: talk.length > 1, wander: false, h: 118 }); };
  npc('lin_teahouse', 'maid', 640, 600, '掌茶丫鬟', ['少侠来了？家主吩咐过，少侠是府上的贵客，不必在这儿候着。', '今儿泡的是青阳山上的云雾，少侠尝一盏？', '来拜见家主的人一天比一天多，都说青阳镇如今有天剑宗照应着。']);
  npc('lin_servants', 'kitchen_helper', 420, 560, '林府杂役', ['少侠怎么到这儿来了？这里乱糟糟的，别弄脏了衣裳。', '府里上上下下几十口人，吃饭用水都是我们这儿管着。', '听说小姐的病是少侠请来的仙师治好的？我们几个都念着少侠的好呢。']);
  // ---- 镇上两扇厢房门：开放 ----
  const T = TMAPS.qy_town;
  if (T) for (const d of T.doors || []) {
    if (d.label === '待客茶坊' || d.label === '杂役房') { const to = d.label === '待客茶坊' ? 'lin_teahouse' : 'lin_servants'; d.to = to; d.at = roomAt(to); d.face = 'up'; delete d.cond; delete d.msg; }
  }
  // ================= R55：杂役房旧屋底图（墙已画在底图里，拿掉原花窗挂画）+ 前院家训木牌 + 仪门两名门房护卫 =================
  { const B = CXB2.lin_servants; B.objs = B.objs.filter(o => o.uid !== 'r54-lin_servants-0' && o.uid !== 'r54-lin_servants-1'); TMAPS.lin_servants.baked.objs = B.objs; }
  if (Q) {
    const o = { id: 'lin_family_rules_r55', uid: 'r55-family-rules', ax: 1226, ay: 845, x: 1185, y: 780, w: 82, h: 67, sy: 845, flat: false, flip: false, img: 'cx2_r55_rules' };
    ld('cx2_r55_rules', 'cx2/r55_rules.webp');
    let i = Q.objs.findIndex(x => (x.sy ?? x.ay) > 845); if (i < 0) i = Q.objs.length; Q.objs.splice(i, 0, o);
    const bl = Q.blocked.split(''); for (let cy = Math.floor(835 / Q.cs); cy <= Math.floor(847 / Q.cs); cy++) for (let cx = Math.floor(1202 / Q.cs); cx <= Math.floor(1250 / Q.cs); cx++) bl[cy * Q.cols + cx] = '1'; Q.blocked = bl.join('');
    const TB = TMAPS.qy_town && TMAPS.qy_town.baked; if (TB && TB !== Q && TB.blocked) { const a = TB.blocked.split(''); for (let cy = Math.floor(835 / Q.cs); cy <= Math.floor(847 / Q.cs); cy++) for (let cx = Math.floor(1202 / Q.cs); cx <= Math.floor(1250 / Q.cs); cx++) a[cy * Q.cols + cx] = '1'; TB.blocked = a.join(''); }
  }
  if (T) {
    const [c, r] = atIn('qingyang', 1226, 892);
    T.npcs.push({ key: 'none', c, r, name: '林府家训', hidden: true, h: 110, talk: async () => { await narrate('木牌上刻着几行端正的小楷：'); await narrate('「待客以诚，持家以俭；扶危济困，不负乡邻。」——林氏家训'); } });
    for (const [x, name] of [[1444, '林府门房'], [1564, '林府门房']]) { const [gc, gr] = P(x, 804);
      T.npcs.push({ key: 'none', cx: 'town_guard', c: gc, r: gr, name, face: 'down', wander: false, h: 118, random: true,
        talk: ['少侠请进，家主吩咐过，少侠来府上不必通报。', '仪门里头就是曲水花庭，再往里是正厅。', '西厢是待客茶坊，东厢是杂役房。'] }); }
  }
  window.LIN54_ON = true;
})();
