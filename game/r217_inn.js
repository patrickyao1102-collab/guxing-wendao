// ================= R217 · 云来客栈三张图（Codex 按游戏画风重画 + 地板地毯分档）接进「天字三号房」=================
// 顶替 r214 里借的占位房间：大堂（金砖墁地、云鹤毯）→ 宽楼梯 → 二楼走廊（靛蓝长毯）→ 天字三号房（线索都画在场景里）。
// 数据在 r217/inn.js（tools/r217_inn_convert.py 生成）。剧情、问话、证词本全部沿用 r214，只挪站位和调查点。
(function () {
  const D = window.R217_INN;
  if (!D || typeof TMAPS === 'undefined' || !TMAPS.xt_city || !TMAPS.xt_inn_hall || !TMAPS.xt_inn_room3) return;
  const F = () => (S.flags = S.flags || {});
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const sq = () => ((F().sq || {}).xt_room3 || { s: 0, n: 0 });
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  for (const [sid, R] of Object.entries(D)) { load('r217g_' + sid, 'r217/g_' + sid + '.webp');
    for (const o of R.objs) if (!/^r213_/.test(o.img)) load(o.img, 'r217/' + (o.img.startsWith('r217c_') ? 'c_' + o.img.slice(6) : 'o_' + o.img.slice(5)) + '.webp'); }
  try { delete MAP_ZOOM.xt_inn_hall; delete MAP_ZOOM.xt_inn_room3; } catch (e) {}
  const ex = (sid, id, o) => { const R = D[sid], e = R.exits.find(e => e.id === id), cs = R.cs, r = e.region;
    return Object.assign({ x: Math.floor(r.x / cs), y: Math.floor(r.y / cs), w: Math.ceil(r.w / cs), h: Math.ceil(r.h / cs), to: e.to, at: e.land ? P(e.land[0], e.land[1]) : null, face: 'down', label: e.label }, o || {}); };
  const mv = (n, xy, o) => { if (!n) return n; const [c, r] = P(xy[0], xy[1]); return Object.assign(n, { c, r, wander: false }, o || {}); };
  const spot = (xy, name, talk, o) => { const [c, r] = P(xy[0], xy[1]); return Object.assign({ key: 'none', c, r, name, hidden: true, h: 110, talk }, o || {}); };
  const oldH = TMAPS.xt_inn_hall, oldR = TMAPS.xt_inn_room3, cityAt = (oldH.exits[0] || {}).at;
  const hn = n => (oldH.npcs || []).find(x => x.name === n), rn = n => (oldR.npcs || []).find(x => x.name === n);
  const open = () => sq().s === 1 || sq().s === 3;

  // ---- 大堂 ----
  const H = D.xt_inn_hall, stairSpot = hn('楼梯 · 上二楼'); if (stairSpot) stairSpot.cond = () => false;
  mv(hn('柳三娘'), [H.slots.innkeeper[0], H.slots.innkeeper[1] + 4]); mv(hn('钱满仓'), [H.slots.guest_a[0] + 70, H.slots.guest_a[1] + 30]); mv(hn('沈霜'), [H.slots.guest_b[0] + 70, H.slots.guest_b[1] + 20]);
  const hallNpcs = (oldH.npcs || []).slice();
  hallNpcs.push({ key: 'none', cx: 'town_guard', c: P(1500, 470)[0], r: P(1500, 470)[1], name: '守楼梯的城卫', h: 116, wander: false, face: 'down', talk: ['二楼出了案子，闲人免上。'], cond: () => !open() });
  hallNpcs.push({ key: 'none', cx: 'tea_guest', c: P(1120, 700)[0], r: P(1120, 700)[1], name: '食客', h: 116, wander: false, talk: async () => { await say('食客', sq().s === 3 ? '听说了么？天字三号那桩案子，叫一个天剑宗的少年人，在这大堂里当众给说穿了！' : '云来客栈的酱肘子，玄天城头一份。就是今天楼上闹哄哄的，吃得不踏实。'); } });
  TMAPS.xt_inn_hall = { title: '云来客栈 · 大堂', baked: Object.assign({ ground: 'r217g_xt_inn_hall' }, H), indoor: true, npcs: hallNpcs, chests: [], doors: [], start: P(H.spawn[0], H.spawn[1] - 40),
    exits: [ex('xt_inn_hall', 'lobby_city', { at: cityAt, label: '出门 · 玄天城' }), ex('xt_inn_hall', 'lobby_up', { label: '上楼 · 二楼走廊', arrow: -Math.PI / 2, cond: open, msg: '城卫拦在楼梯口：「二楼出了案子，闲人免上。」' })] };
  for (const d of TMAPS.xt_city.doors || []) if (d.to === 'xt_inn_hall') d.at = P(H.spawn[0], H.spawn[1] - 50);

  // ---- 二楼走廊 ----
  const C = D.xt_inn_corr, latch = rn('断掉的门闩'); mv(latch, [C.clues.broken_latch[0], C.clues.broken_latch[1] - 20]);
  const corrNpcs = [];
  if (latch) corrNpcs.push(latch);
  corrNpcs.push(spot([C.clues.wet_footprints[0] - 40, C.clues.wet_footprints[1]], '地毯上的湿脚印', async () => { await say('', '靛蓝长毯上有一串淡淡的湿脚印，从楼梯口一路走到三号房门前，就没了。'); await say('叶孤星', '（鞋印很大，鞋底带着水——是早上从后厨赶上来撞门的伙计。）'); await say('星旋', '（嗯，这个不算。小子，不是地上有个印子就都是线索。）'); }));
  for (const [nm, x] of [['天字一号', 283], ['天字二号', 674], ['天字四号', 1448]]) corrNpcs.push(spot([x, 400], nm + '的房门', async () => { await say('', nm === '天字四号' ? '门关着。门缝里透出一点极淡的冷香——住的是那位擦短剑的女修。' : '门关着，里面没有动静。'); }));
  TMAPS.xt_inn_corr = { title: '云来客栈 · 二楼走廊', baked: Object.assign({ ground: 'r217g_xt_inn_corr' }, C), indoor: true, npcs: corrNpcs, chests: [], doors: [], start: P(C.spawn[0], C.spawn[1]),
    exits: [ex('xt_inn_corr', 'corridor_down', { label: '下楼 · 大堂' }), ex('xt_inn_corr', 'room3', { label: '天字三号房', face: 'up', arrow: -Math.PI / 2 })] };

  // ---- 天字三号房 ----
  const R = D.xt_inn_room3, K = R.clues;
  mv(rn('后窗和窗栓'), [K.inside_window_bolt[0], K.inside_window_bolt[1] - 10]); mv(rn('窗台上的泥印'), [K.inward_mud[0] - 30, K.inward_mud[1] - 10]);
  mv(rn('桌上的两只茶杯'), [K.two_teacups[0], K.two_teacups[1] - 60]); mv(rn('地板上的印子'), [K.small_box_mark[0], K.small_box_mark[1] - 30]); mv(rn('查案的城卫'), [R.slots.clerk[0] - 120, R.slots.clerk[1]]);
  const roomNpcs = (oldR.npcs || []).filter(n => n !== latch);
  roomNpcs.push(spot([K.powder_packet[0], K.powder_packet[1]], '床底的纸包', async () => { await say('', '床沿底下露出一角揉皱的纸包，上头印着「安神散」——药铺里最寻常的助眠药。'); await say('星旋', '（自己屋里的床底下，滚着一包安神散。记着它，一会儿看桌上的茶杯。）'); }));
  TMAPS.xt_inn_room3 = { title: '云来客栈 · 天字三号房', baked: Object.assign({ ground: 'r217g_xt_inn_room3' }, R), indoor: true, npcs: roomNpcs, chests: [], doors: [], start: P(R.spawn[0], R.spawn[1] - 30),
    exits: [ex('xt_inn_room3', 'room3_return', { label: '出房门 · 二楼走廊' })] };
  window.R217I = { D };
})();
