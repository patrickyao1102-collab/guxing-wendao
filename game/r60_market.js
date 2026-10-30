// ================= 接入 Codex R60：天剑宗集市「剑徽环庭仙市」=================
// 问剑坪（演武广场）东行进集市。六家店：典籍阁 / 兵甲坊 / 丹药铺 / 符阵坊 / 灵兽苑 / 五曜商阁；
// 店主定点站在柜台前（R67 方正铺子），访客沿路闲逛，灵兽苑里有仙鹤、灵鹿、鸟雀，南端小湖有涟漪（按 Codex market-life-r60 逐帧移植）。
(function () {
  const D = window.R60; if (!D || typeof CXB2 === 'undefined' || typeof TMAPS === 'undefined') return;
  const ID = 'tj_market', B = D.map, L = D.life;
  const BLOB = {"g_tj_market": "f51f3aae73214886a9c28a39dcbb27e9", "r60_atlas_0": "156fea751c031e4a99ac01f78aa914a9", "r60_life_alchemist": "f66d68c6638c9ac89626a0ef9a49a5e9", "r60_life_artificer": "4ec87ac53effca2f730727ea399733b5", "r60_life_beast_keeper": "398e8c34930f91bec4f97b1038e668d7", "r60_life_board_keeper": "1eafe8cf3041ea381857e29d9a6476cc", "r60_life_crane": "2515d98b0e7b93745fcbdbc259b0da12", "r60_life_deer": "3ab4db5aa51ff70d1eec10013531de5d", "r60_life_guest_blue": "dedc92f087417e5abe721760acf9f4d9", "r60_life_guest_elder": "9581cba1e0cd9fc17dc3ef5e3758699d", "r60_life_guest_jade": "4d9acc687184db1701f317ea420b361a", "r60_life_keeper_feed": "7a25e02a0207fa02d845961e4a263f13", "r60_life_peddler": "17c77424adb003521888d671d73242da", "r60_life_sparrow": "fe6a90a076e27fcc354080779481be64", "r60_life_storyteller": "62c96fa8afa9b90b66ab733eeb82ef5c", "r60_life_visitor_man": "f760b6ce877d5ee5ee4652d9494a1314", "r60_life_visitor_woman": "2162ae3c2e8f9c26a47d9cdd630f199f"};   // 图片放在作品素材库（发布包已近上限）
  const local = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const src = n => (n === 'g_tj_market' && window.R80_ON && window.R80_SRC) ? R80_SRC('ground') : (!local && BLOB[n]) ? '/_blob/' + BLOB[n] : 'cx2/' + n + '.webp';
  CXB2[ID] = B;
  // ---- 图片 ----
  const ld = (k, n) => { const im = new Image(); im.onload = () => { IMG[k] = im; }; im.src = src(n); };
  ld('cx2g_' + ID, 'g_' + ID);
  for (const o of B.objs) o.img = 'cx2_' + o.img_id;
  for (let p = 0; p < D.atlas.pages; p++) { const im = new Image(); im.onload = () => { for (const [k, e] of Object.entries(D.atlas.map)) { if (e[0] !== p) continue; const c = document.createElement('canvas'); c.width = e[3]; c.height = e[4]; c.getContext('2d').drawImage(im, e[1], e[2], e[3], e[4], 0, 0, e[3], e[4]); IMG['cx2_' + k] = c; } }; im.src = src('r60_atlas_' + p); }
  const LIFE = {}; for (const k of Object.keys(L.textures)) { const im = new Image(); im.onload = () => { LIFE[k] = im; }; im.src = src('r60_life_' + k); }

  // ---- 坐标工具 ----
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const nearOf = Bm => (x, y) => {
    const k = Math.max(1, Math.round(16 / Bm.cs));
    const ok = (c, r) => { if (c < k || r < 1 || c >= Bm.cols - k || r >= Bm.rows - 1) return false; for (let d = -k; d <= k; d++) if (Bm.blocked.charCodeAt(r * Bm.cols + c + d) !== 48) return false; return true; };
    const c0 = Math.floor(x / Bm.cs), r0 = Math.floor(y / Bm.cs), lim = Math.ceil(30 * 32 / Bm.cs);
    for (let d = 0; d < lim; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue; const c = c0 + dx, r = r0 + dy; if (ok(c, r)) return [(c + .5) * Bm.cs, (r + .6) * Bm.cs]; }
    return [x, y];
  };
  const atIn = (id, x, y) => CXB2[id] ? P(...nearOf(CXB2[id])(x, y)) : null;

  // ---- 六家店 ----
  ITEM_DB.yunxingshi = Object.assign(ITEM_DB.yunxingshi || { name: '破阵灵晶' }, { price: ITEM_DB.yunxingshi && ITEM_DB.yunxingshi.price || 300 });
  const books = ['dianxing', 'xingluo2', 'pojun', 'tanlang', 'tianshu', 'qunxing', 'shaxing'].map(k => 'jp_' + k);
  const has = id => !!ITEM_DB[id];
  const SHOP = {
    skills: { who: '老修士', items: () => (window.SK4_SHOP ? SK4_SHOP() : books.filter(has)), hi: ['先看修行路数，再选与你契合的法诀。', '剑谱参悟到二重、三重，招式才见真章。'] },
    armory: { who: '炼器女修', items: () => ['w_qingfeng', 'w_hantie', 'a_cloth', 'a_leather', 'a_iron'].filter(has), hi: ['剑要趁手，护具也须合身。', '刚出炉的几件，你挑挑看。'] },
    medicine: { who: '老丹师', items: () => ['p_small', 'p_big', 'p_mp', 'p_revive'].filter(has), hi: ['回气血、复灵力、解毒疗伤，药品都在这儿了。', '出门历练，丹药别省着买。'] },
    talismans: { who: '俏掌柜', items: () => ['c_jade', 'p_mp', 'p_revive'].filter(has), hi: ['符箓救急，阵旗护营，出门历练可别只带一把剑。'] },
    special: { who: '五曜商阁执事', items: () => ['yunxingshi', 'c_jade'].filter(has), hi: ['五曜商阁只收奇珍。破阵灵晶也有几颗，就看你出不出得起价。'] },
  };
  const NAME = { skills: '典籍阁', armory: '兵甲坊', medicine: '丹药铺', talismans: '符阵坊', beasts: '灵兽苑', special: window.R80_ON ? '天剑商阁' : '五曜商阁' };
  const npcs = [];
  for (const t of B.inter) { if (!t.p) continue; const [c, r] = atIn(ID, t.p[0], t.p[1] + 10) || P(t.p[0], t.p[1]);
    const sh = SHOP[t.shop], nm = NAME[t.shop] || t.name;
    npcs.push({ key: 'none', c, r, name: nm, hidden: true, h: 130, mapLabel: NAME[t.shop] ? 'shop' : true, talk: async () => {
      if (sh) { await say(sh.who, sh.hi[Math.floor(Math.random() * sh.hi.length)]); await openShop(sh.items(), nm); }
      else if (t.shop === 'beasts') { await say('灵兽苑饲养员', '这些灵兽都通人性，要等你修为再高些，才认你做主人。'); await narrate('仙鹤在苑里踱步，灵鹿低头啃着灵草，笼里的雀儿叽叽喳喳。'); }
      else if (t.text) await narrate(t.text);
    } });
  }
  const ex = B.exits[0];
  TMAPS[ID] = { title: '天剑宗 · 集市', baked: Object.assign({ ground: 'cx2g_' + ID }, B), chests: [], leaves: true, start: atIn(ID, ...B.spawn), npcs,
    exits: [{ x: Math.floor(ex.region.x / B.cs), y: Math.floor(ex.region.y / B.cs), w: Math.ceil(ex.region.w / B.cs), h: Math.ceil(ex.region.h / B.cs), to: 'tj_front', label: '南 · 问剑坪', at: atIn('tj_front', 3096, 1824), face: 'left' }] };
  // 问剑坪东边：原来的「试剑台（修缮中）」改成集市入口
  const FR = TMAPS.tj_front;
  if (FR) { const e = FR.exits.find(e => e.to === 'tj_plaza'); if (e) { e.to = ID; e.label = '东 · 天剑宗集市'; e.at = atIn(ID, ...B.spawn); e.face = 'up'; delete e.cond; delete e.msg; } }

  // ---- 集市里的人和灵兽（Codex market-life-r60 移植）----
  const mod = (x, n) => (x % n + n) % n, lerp = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
  const M = { time: 0, clocks: Object.fromEntries(L.npcs.map((a, i) => [a.key, a.key === 'beast_keeper' ? 0 : i * 3.1])), vclocks: Object.fromEntries((L.visitors || []).map(v => [v.id, v.phase])), paused: new Set(), hold: new Set(), last: 0 };
  const feedFrame = t => t < .55 ? 0 : t < 1 ? 1 : t < 1.5 ? 2 : t < 2 ? 3 : t < 4.6 ? 4 : t < 5.6 ? 5 : t < 6.2 ? 6 : 7;
  function npcPose(n, t) {
    const keeper = n.key === 'beast_keeper', period = keeper ? 24 : 36, u = mod(t, period); let at = n.home, frame = 0, row = 0, flip = false, action = 'stand';
    const start = keeper ? 4 : 12, end = keeper ? 7 : 15, back = keeper ? 14 : 28, finish = keeper ? 17 : 31;
    if (u >= start && u < end) { at = lerp(n.home, n.end, (u - start) / (end - start)); row = 2; flip = n.end[0] > n.home[0]; frame = 1 + Math.floor(u * 8) % 6; action = 'walk'; }
    else if (u >= end && u < back) { at = n.end; if (keeper) { action = 'feed'; frame = feedFrame(u - end); } }
    else if (u >= back && u < finish) { at = lerp(n.end, n.home, (u - back) / (finish - back)); row = 2; flip = n.home[0] > n.end[0]; frame = 1 + Math.floor(u * 8) % 6; action = 'walk'; }
    return { uid: 'npc_' + n.key, kind: n.key, title: n.title, anchor: [...at], frame, row, flip, action, texture: action === 'feed' ? 'keeper_feed' : n.key, shadow: action !== 'feed' };
  }
  function visitorPose(v, t) {
    const legs = v._c || (v._c = v.legs.map(leg => { const lengths = leg.points.slice(1).map((p, i) => Math.hypot(p[0] - leg.points[i][0], p[1] - leg.points[i][1])); return Object.assign({}, leg, { lengths, length: lengths.reduce((a, b) => a + b, 0) }); }));
    const total = legs.reduce((a, l) => a + l.length / v.speed + l.pause, 0); let u = mod(t, total), at = legs[0].points[0], dir = 0, flip = false, action = 'stand';
    for (const l of legs) { const walk = l.length / v.speed; if (u < walk) { let d = u * v.speed; for (let i = 0; i < l.lengths.length; i++) { if (d <= l.lengths[i]) { const a = l.points[i], b = l.points[i + 1], dx = b[0] - a[0], dy = b[1] - a[1]; at = lerp(a, b, l.lengths[i] ? d / l.lengths[i] : 0); dir = Math.abs(dx) > Math.abs(dy) ? 2 : dy < 0 ? 1 : 0; flip = dir === 2 && dx > 0; action = 'walk'; break; } d -= l.lengths[i]; } break; } u -= walk; if (u < l.pause) { at = l.points[l.points.length - 1]; break; } u -= l.pause; }
    return { uid: v.id, kind: 'visitor', texture: v.texture, anchor: at, frame: action === 'walk' ? 1 + Math.floor(t * 8) % 6 : 0, row: dir, flip, action, shadow: true };
  }
  function update(dt, hero) {
    M.time += dt; M.paused.clear();
    for (const n of L.npcs) { if (M.hold.has('npc_' + n.key)) { M.paused.add(n.key); continue; } const a = npcPose(n, M.clocks[n.key] + dt); if (a.action === 'walk' && Math.hypot(a.anchor[0] - hero[0], a.anchor[1] - hero[1]) < 48) { M.paused.add(n.key); continue; } M.clocks[n.key] += dt; }
    for (const v of L.visitors || []) { if (M.hold.has(v.id)) { M.paused.add(v.id); continue; } const a = visitorPose(v, M.vclocks[v.id] + dt); if (a.action === 'walk' && Math.hypot(a.anchor[0] - hero[0], a.anchor[1] - hero[1]) < 48) { M.paused.add(v.id); continue; } M.vclocks[v.id] += dt; }
  }
  function actors() {
    const t = M.time, out = L.npcs.map(n => { const p = npcPose(n, M.clocks[n.key]); if (M.paused.has(n.key)) { p.frame = 0; p.action = 'stand'; } return p; });
    for (const v of L.visitors || []) { const p = visitorPose(v, M.vclocks[v.id]); if (M.paused.has(v.id)) { p.frame = 0; p.action = 'stand'; } out.push(p); }
    for (const v of L.onlookers || []) out.push({ uid: v.id, kind: 'onlooker', texture: v.texture, anchor: v.anchor, frame: v.frame, row: 0, flip: v.flip, shadow: true });
    const a = (kind, at, frame, extra = {}) => out.push(Object.assign({ uid: 'm-' + kind, kind, texture: kind, anchor: at, frame, row: Math.floor(frame / 4) }, extra));
    const cs = [0, 1, 2, 3, 3, 2, 1, 0, 4, 5, 6, 6, 5, 7, 0]; a('crane', L.crane, cs[Math.min(cs.length - 1, Math.floor(mod(t, 18) / 1.2))], { shadow: false, sort_y: L.craneSort || L.crane[1] });
    const u = mod(M.clocks.beast_keeper, 24); let deer = 0;
    if (u > 6 && u < 15) deer = u < 7 ? 1 : u < 8 ? 2 : u < 9 ? 3 : u < 10 ? 4 : u < 12.5 ? 5 : u < 13.5 ? 6 : 7; else deer = [0, 0, 1, 0, 7, 0][Math.floor(mod(t, 9) / 1.5)];
    a('deer', L.deer, deer, { shadow: true });
    const perched = mod(t, 9) < 5; a('sparrow', L.cagedBird, perched ? (Math.floor(t) % 4 === 0 ? 7 : 0) : [1, 2, 3, 4, 5, 4, 2][Math.floor(t * 10) % 7], { uid: 'm-sparrow-cage', sort_y: L.cageSort - 1, shadow: false });
    const orbit = mod(t, 12), home = L.freeBird, fly = orbit > 3;
    a('sparrow', fly ? [home[0] + Math.sin((orbit - 3) / 9 * Math.PI * 2) * 85, home[1] - Math.sin((orbit - 3) / 9 * Math.PI) * 60] : home, fly ? [1, 2, 3, 4, 5, 4, 2][Math.floor(t * 10) % 7] : 0, { uid: 'm-sparrow-free', sort_y: L.freeBirdSort ?? 2600, shadow: false });
    return out;
  }
  function drawActor(o) {
    const a = L.textures[o.texture], im = LIFE[o.texture]; if (!a || !im) return;
    const [w, h] = a.frameSize, [ax, ay] = a.anchor, s = a.scale, cols = a.columns;
    const npc = a.layout === 'directional' || (o.texture === o.kind && L.npcs.some(n => n.key === o.kind));
    const col = npc ? o.frame : o.frame % cols, row = npc ? o.row : Math.floor(o.frame / cols);
    ctx.save(); ctx.translate(o.anchor[0], o.anchor[1]);
    if (o.shadow) { ctx.fillStyle = 'rgba(36,53,45,.15)'; ctx.beginPath(); ctx.ellipse(0, -2, o.kind === 'deer' ? 65 : 16, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    if (o.flip) ctx.scale(-1, 1);
    ctx.drawImage(im, col * w, row * h, w, h, -ax * s, -ay * s, w * s, h * s); ctx.restore();
    if (o.title && !(window.R60_NPC && R60_NPC.hidden(o))) { const nm = o.title.split('·').pop().trim(); ctx.save(); ctx.font = `600 18px ${FONT}`; ctx.textAlign = 'center'; textOutline(nm, o.anchor[0], o.anchor[1] - ay * s - 8, '#ffe08a', '#1a0c00', 4); ctx.restore(); }
    const lb = window.R60_NPC && R60_NPC.label(o); if (lb) { const top = o.anchor[1] - ay * s; ctx.save(); ctx.textAlign = 'center'; if (lb.name) { ctx.font = `600 17px ${FONT}`; textOutline(lb.name, o.anchor[0], top - 8, '#fff4d8', '#1a0c00', 4); } if (lb.mark) { const b = Math.sin(performance.now() / 250) * 5; ctx.font = `900 34px ${FONT}`; textOutline(lb.mark, o.anchor[0], top - (o.title || lb.name ? 34 : 10) + b, '#ffd34a', '#5a2a00', 5); } ctx.restore(); }
  }
  // 每次进集市：把人和灵兽做成“物件”混进深度排序
  tileSetMap = (orig => function (name) {
    const r = orig.apply(this, arguments);
    if (name === ID && world.map && world.map.T) { const T = world.map.T; T.objs = T.objs.filter(o => !o.r60); for (const a of actors()) T.objs.push({ bk: true, r60: a.uid, x: a.anchor[0] - 60, y: a.anchor[1] - 140, w: 120, h: 150, sy: a.sort_y ?? a.anchor[1], pose: a }); M.last = performance.now(); }
    return r;
  })(tileSetMap);
  tileAmbientLow = (orig => function (T, cam, now) {
    if (orig) orig(T, cam, now);
    if (world.mapName !== ID) return;
    const t = performance.now(), dt = Math.min(.1, (t - (M.last || t)) / 1000); M.last = t;
    const p = world.player; update(dt, p ? [p.x, p.y] : [0, 0]);
    const byId = {}; for (const a of actors()) byId[a.uid] = a;
    for (const o of T.objs) if (o.r60) { const a = byId[o.r60]; if (!a) continue; o.pose = a; o.sy = a.sort_y ?? a.anchor[1]; o.x = a.anchor[0] - 60; o.y = a.anchor[1] - 140; }
    // 南端小湖：水面上慢慢漂过的细小涟漪
    const pd = L.pond; if (pd) { const [x, y] = pd.center, tt = M.time + (pd.phase || 0), tau = Math.PI * 2;
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, pd.rx, pd.ry, 0, 0, tau); ctx.clip(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const u = mod(tt * .055 + i / 7, 1), r = .12 + u * .84, al = Math.sin(u * Math.PI) * .17, ang = i * 2.17 + Math.sin(tt * .12 + i) * .13, cx = x + Math.sin(i * 1.9 + tt * .11) * pd.rx * .12, cy = y + Math.cos(i * 1.3 + tt * .09) * pd.ry * .1;
        ctx.strokeStyle = i % 3 === 0 ? `rgba(220,239,243,${al})` : `rgba(151,203,219,${al})`; ctx.lineWidth = i % 3 === 0 ? 1.55 : 1; ctx.beginPath(); ctx.ellipse(cx, cy, pd.rx * r, pd.ry * r, 0, ang, ang + .48 + (i % 3) * .18); ctx.stroke();
        ctx.strokeStyle = `rgba(201,224,235,${al * .52})`; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(cx, cy, pd.rx * r, pd.ry * r, 0, ang + Math.PI, ang + Math.PI + .35); ctx.stroke(); }
      ctx.restore(); }
  })(typeof tileAmbientLow === 'function' ? tileAmbientLow : null);
  drawBaked = (orig => function (o, now) { if (o.r60) return drawActor(o.pose); return orig.apply(this, arguments); })(drawBaked);
  window.R60_MARKET = { M, actors, L, atIn, ID,
    shop: async id => { const sh = SHOP[id], nm = NAME[id]; if (sh) await openShop(sh.items(), nm); } };
})();
