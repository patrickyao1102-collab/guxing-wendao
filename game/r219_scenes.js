// ================= R219 · 万宝楼一楼大厅、后院库房、旧染坊院子（Codex 按游戏画风画的，作者 11-12 已认可）=================
// 大厅顶替原来概念画风的 xt_wanbao（掌柜 / 伙计 / 客人 / 各展台照旧，只挪位置）；库房顶替借来的杂货铺；
// 旧染坊院子接进「三十个名字」终局（门开之后进院、院内开打、地窖救人）。二楼鉴宝雅间等 R222 返工后再换。
(function () {
  const D = window.R219_SC;
  if (!D || typeof TMAPS === 'undefined' || !TMAPS.xt_city || !TMAPS.xt_wanbao) return;
  const F = () => (S.flags = S.flags || {});
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const sq = id => ((F().sq || {})[id] || { s: 0, n: 0 });
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  for (const [sid, R] of Object.entries(D)) { load('r219g_' + sid, 'r219/g_' + sid + '.webp');
    for (const o of R.objs) load(o.img, 'r219/' + (o.img.startsWith('r219c_') ? 'c_' + o.img.slice(6) : 'o_' + o.img.slice(5)) + '.webp'); }
  load('bg_r219_dye', 'r219/bg_dyeyard.webp');
  try { delete MAP_ZOOM.xt_wanbao; delete MAP_ZOOM.xt_wanbao_store; } catch (e) {}
  const ex = (sid, id, o) => { const R = D[sid], e = R.exits.find(e => e.id === id), cs = R.cs, r = e.region;
    return Object.assign({ x: Math.floor(r.x / cs), y: Math.floor(r.y / cs), w: Math.ceil(r.w / cs), h: Math.ceil(r.h / cs), to: e.to, at: e.land ? P(e.land[0], e.land[1]) : null, face: 'down', label: e.label }, o || {}); };
  const mv = (n, xy, o) => { if (!n) return n; const [c, r] = P(xy[0], xy[1]); return Object.assign(n, { c, r, wander: false }, o || {}); };
  const spot = (xy, name, talk, o) => { const [c, r] = P(xy[0], xy[1]); return Object.assign({ key: 'none', c, r, name, hidden: true, h: 110, talk }, o || {}); };
  const objAt = (R, id, dy) => { const o = R.objs.find(o => o.id === id); return o ? [o.x + o.w / 2, o.sy + (dy == null ? 34 : dy)] : null; };
  const caseOn = () => { const s = sq('xt_fake').s; return s === 1 || s === 3; };

  // ---- 万宝楼 · 一楼营业大厅 ----
  { const R = D.xt_wanbao, old = TMAPS.xt_wanbao, N = old.npcs || [], by = n => N.find(x => x.name === n);
    const cityAt = (old.exits.find(e => e.to === 'xt_city') || {}).at;
    mv(by('万宝楼掌柜'), [R.slots.shopkeeper[0], R.slots.shopkeeper[1]]); mv(by('万宝楼伙计'), [R.slots.clerk[0], R.slots.clerk[1]]); mv(by('等鉴定的客人'), [R.slots.guest[0], R.slots.guest[1]]);
    mv(by('万宝楼掌柜 · 鉴宝书案'), R.inter.shop_service || [540, 620]);
    for (const [nm, id] of [['灵材与玉符展台', 'jade_display'], ['丹药与灵药柜', 'medicine_cabinet'], ['法器陈列', 'artifact_rack'], ['待客茶席', 'tea_group']]) { const p = objAt(R, id); if (p) mv(by(nm), p); }
    TMAPS.xt_wanbao = Object.assign({}, old, { title: old.title || '万宝楼', baked: Object.assign({ ground: 'r219g_xt_wanbao' }, R), indoor: true, npcs: N, start: P(R.spawn[0], R.spawn[1] - 40),
      exits: [ex('xt_wanbao', 'to_xt_city', { at: cityAt, label: '出万宝楼 · 玄天城' }),
        ex('xt_wanbao', 'to_appraisal', { at: P(800, 700), label: '上楼 · 鉴宝雅间', arrow: -Math.PI / 2, face: 'up', cond: caseOn, msg: '伙计陪着笑拦住：「客官，二楼雅间今日不待客。」' }),
        ex('xt_wanbao', 'to_store', { label: '后院库房', arrow: -Math.PI / 2, face: 'up', cond: caseOn, msg: '库房重地，门锁着。' })] });
    delete TMAPS.xt_wanbao.img; delete TMAPS.xt_wanbao.tile;
    for (const e of TMAPS.xt_city.exits || []) if (e.to === 'xt_wanbao') e.at = P(R.spawn[0], R.spawn[1] - 50);
    for (const d of TMAPS.xt_city.doors || []) if (d.to === 'xt_wanbao') d.at = P(R.spawn[0], R.spawn[1] - 50);
    const back = P(204, 640); if (TMAPS.xt_wanbao_vip && TMAPS.xt_wanbao_vip.exits[0]) Object.assign(TMAPS.xt_wanbao_vip.exits[0], { at: back, face: 'down' });
  }
  // ---- 万宝楼 · 后院库房 ----
  if (TMAPS.xt_wanbao_store) { const R = D.xt_wanbao_store, old = TMAPS.xt_wanbao_store, N = old.npcs || [], by = n => N.find(x => x.name === n), K = R.clues;
    mv(by('小伍'), [R.slots.warehouse_clerk[0], R.slots.warehouse_clerk[1]]); mv(by('剑匣'), [K.sword_case[0] - 90, K.sword_case[1] + 10]); mv(by('匣中的剑'), [K.fake_sword[0] + 70, K.fake_sword[1] + 10]); mv(by('库房出入簿'), [K.ledger[0], K.ledger[1] - 20]);
    TMAPS.xt_wanbao_store = { title: '万宝楼 · 后院库房', baked: Object.assign({ ground: 'r219g_xt_wanbao_store' }, R), indoor: true, npcs: N, chests: [], doors: [], start: P(R.spawn[0], R.spawn[1] - 30),
      exits: [ex('xt_wanbao_store', 'to_hall', { label: '回前堂 · 万宝楼', at: P(1668, 420) })] };
    window.R219_STORE_IN = P(R.spawn[0], R.spawn[1] - 30);
  }
  // ---- 旧染坊 · 院内 ----
  { const R = D.xt_dyeyard, g = (window.R216T && R216T.gate) || [3540, 2770], done = () => sq('xt_thirty').s === 3;
    const npcs = [
      spot(R.inter.cellar_cover || [1348, 508], '地窖的木盖板', async () => { await say('', done() ? '盖板掀开着，底下是一间不大的地窖。墙角摆着一只冷透的丹炉，地上一圈封灵链的印子。杜先生就是在这儿，把三十个名字写了半个月。' : '一块厚木盖板，压着地窖口。'); }),
      spot(R.inter.workshop_door || [212, 388], '废弃的作坊门', async () => { await say('', '门轴锈死了。门缝里是堆到房梁的旧染架，落满了灰。'); }),
      spot(objAt(R, 'cloth_frame_a', 30) || [900, 520], '晾着的蓝布', async () => { await say('', '布是新的，染得很匀，却连一道折痕都没有——从挂上去那天起，就没人收过。'); }),
    ];
    TMAPS.xt_dyeyard = { title: '玄天城 · 旧染坊', baked: Object.assign({ ground: 'r219g_xt_dyeyard' }, R), npcs, chests: [], doors: [], start: P(R.spawn[0], R.spawn[1] - 40),
      exits: [ex('xt_dyeyard', 'yard_gate', { to: 'xt_city', at: P(g[0], g[1] + 30), label: '出院门 · 玄天城南街' })] };
    window.R219_YARD_IN = P(R.spawn[0], R.spawn[1] - 60);
  }
  window.R219S = { D };
})();
