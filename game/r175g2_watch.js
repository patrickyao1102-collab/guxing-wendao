// ================= R175 · 青竹菜园 · 园屋值夜室（Codex「双院齐胸篱与园屋值夜室」02 原尺寸拼）=================
// 作者 11-10：园屋要能进去——是值夜的屋子。除了松伯，青禾、小桃、阿福三个人按天轮流值夜：戌时在园屋院里收拾，子时睡在这里，
//   当晚他自己屋里那张床空着（r162 的 asleep 认 R175G2_DUTY）。
// 屋前台阶两格是门；屋里南墙正中两格出门。夜里（戌 / 子）换夜墙、闭窗、点灯芯；子时床上叠值夜人的睡姿（r162/bed.webp 现成帧，
//   按该角色整套帧的可见包围盒中心对准 Codex 标的锚点），最后整屋压一层 midnight_light（油灯边留暖光，暗处看得清门槛和床沿）。
(function () {
  const G = 'qingzhu_garden2', WID = 'qingzhu_garden2_watch_room', D = 'r175g2/w/';
  if (typeof TMAPS === 'undefined' || !TMAPS[G] || typeof buildTileMap !== 'function') return;
  const M = {"size":[832,768],"cols":26,"rows":24,"blocked":"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111011111011111111111111111110111110000000000111111111100011000000000001111111111000110000000000011111111110000000000000000111111111100000000000001111111111111000000000000011111111111110000000000000111111111111100000000000000001100000000000000000000000011000000000000000000000000110000000000000000000000001100000000000000000000000011000000000000000000000000111111111111100111111111111","spawn":[416,688],"st":{"duty_ledger":[0,0,45,27],"jar":[47,0,100,118],"leaning_hoe_rake":[149,0,79,94],"oil_lamp":[230,0,40,45],"oil_wick_lit":[272,0,40,45],"seed_shelf":[314,0,180,140],"single_bed":[496,0,206,303],"south_cutaway_east":[704,0,344,20],"south_cutaway_west":[1050,0,344,20],"stool":[1396,0,58,55],"table":[1456,0,169,103]},"objs":[{"a":"seed_shelf","n":null,"xy":[604,172],"f":312,"id":"seed_shelf"},{"a":"leaning_hoe_rake","n":null,"xy":[510,219],"f":313,"id":"leaning_hoe_rake"},{"a":"table","n":null,"xy":[318,247],"f":350,"id":"table"},{"a":"oil_lamp","n":"oil_wick_lit","xy":[330,224],"f":269,"id":"oil_lamp"},{"a":"duty_ledger","n":null,"xy":[408,251],"f":278,"id":"duty_ledger"},{"a":"stool","n":null,"xy":[392,352],"f":407,"id":"stool"},{"a":"jar","n":null,"xy":[696,420],"f":538,"id":"jar"},{"a":"single_bed","n":null,"xy":[58,248],"f":551,"id":"single_bed"},{"a":"south_cutaway_west","n":null,"xy":[13,748],"f":9760,"id":"south_cutaway_west"},{"a":"south_cutaway_east","n":null,"xy":[475,748],"f":9760,"id":"south_cutaway_east"}],"sleeper":{"source":"r162/bed.webp","sheet_layout":"Use live game action-frame mapping for the on-duty NPC; never infer atlas row indices from NPC order.","frame_size":[256,256],"draw_size":[256,256],"frame_pivot":[128,128],"world_anchor":[161,393],"bed_local_anchor":[103,145],"frame_top_left":[33,265],"mattress_safe_rect":[81,296,160,220],"nominal_visible_content":[101,303,120,180],"align":"框中对齐。若某个角色的透明留白偏心，取该角色同一套动作所有帧的 alpha 并集中心作 pivot，对准同一 world_anchor；不逐帧漂移。","layer":"single_bed child, before foreground actors and night lights","order":551.1,"max_occupants":1,"occupant_from":"active_watch_npc","valid_ids":{"maid1":"青禾","maid2":"小桃","servant":"阿福"},"exclude":["松伯"],"show_at":"子时；由现行值夜排班给唯一角色","empty_otherwise":true},"pts":{"entry":[416,688],"bedside":[304,464],"desk":[336,400],"stool":[465,397],"seed_shelf":[678,352],"water_jar":[656,529],"south_exit_left":[400,752],"south_exit_right":[432,752]},"exit":{"id":"south_exit","map_id":"qingzhu_garden2_watch_room","side":"south","cells":[[12,23],[13,23]],"trigger_rect":[384,736,64,32],"destination":"qingzhu_garden2","destination_foot":[2032,1680],"destination_facing":"south","on":"cross_south_when_moving","cooldown_until_clear":true},"enter":{"id":"garden_house_enter","map_id":"qingzhu_garden2","exterior_asset":"house","exterior_reference_world_foot":[2044,1638],"trigger_rect":[2016,1632,64,32],"trigger_cells":[[63,51],[64,51]],"on":"interact_facing_north","destination":"qingzhu_garden2_watch_room","destination_foot":[416,688],"destination_facing":"north","cooldown_until_clear":true}};
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const F = () => (S.flags = S.flags || {});
  const SHI = () => F().qz_shi || (() => { const t = typeof TOD === 'function' ? TOD() : ''; return t === 'night' ? '戌' : t === 'dawn' ? '卯' : t === 'dusk' ? '酉' : '午'; })();
  const night = () => { const s = SHI(); return s === '戌' || s === '子'; };
  const DUTY = () => (window.R175G2_DUTY ? R175G2_DUTY() : 'maid1');
  const NAME = { maid1: '侍女青禾', maid2: '侍女小桃', servant: '小厮阿福' };
  const IM = {}; let want = 0, got = 0;
  const ld = (k, cb) => { if (k in IM) return; IM[k] = null; want++; const i = new Image(); i.onload = () => { IM[k] = i; got++; try { cb && cb(i); } catch (e) {} }; i.onerror = () => { got++; }; i.src = (k === 'bed' ? 'r162/bed.webp' : D + k + '.webp') + '?v=w1'; };
  const loadAll = () => { ld('ground_day', i => { IMG.r175w_g = i; }); ld('ground_night'); ld('midnight'); ld('bed');
    ld('st', im => { for (const k in M.st) { const [x, y, w, h] = M.st[k], c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, x, y, w, h, 0, 0, w, h); IMG['r175w_' + k] = c; } }); };
  { const o = window.MAP_EXTRA_READY; window.MAP_EXTRA_READY = n => { let a = 1; try { a = o ? o(n) : 1; } catch (e) {} if (a == null) a = 1; if (n !== WID) return a; loadAll(); return Math.min(a, want ? got / want : 0); }; }

  // ---------- 屋内地图 ----------
  const objs = M.objs.map((e, i) => { const st = M.st[e.a]; return { bk: true, id: 'r175w_' + e.id, img: 'r175w_' + e.a, x: e.xy[0], y: e.xy[1], w: st[2], h: st[3], sy: e.f + i * 1e-4, flat: false, flip: false, r175w: e }; });
  const ex = M.exit, [ec, er] = ex.cells[0], back = P(ex.destination_foot[0], ex.destination_foot[1] + 10);
  TMAPS[WID] = { title: '园屋 · 值夜屋', name: WID, indoor: true, qz: true,
    baked: { ground: 'r175w_g', w: M.size[0], h: M.size[1], cs: 32, cols: M.cols, rows: M.rows, blocked: M.blocked, objs },
    start: P(M.spawn[0], M.spawn[1]), chests: [], npcs: [],
    exits: [{ x: ec, y: er, w: ex.cells.length, h: 1, to: G, at: back, face: 'down', label: '出门 · 青竹菜园' }] };
  // 菜园这边：屋前台阶两格进门
  { const en = M.enter, [c0, r0] = en.trigger_cells[0]; TMAPS[G].exits.push({ x: c0, y: r0, w: en.trigger_cells.length, h: 1, to: WID, at: P(M.spawn[0], M.spawn[1]), face: 'up', label: '园屋 · 值夜屋' }); }
  // 值夜簿、床上的人
  const N = TMAPS[WID].npcs;
  { const [c, r] = P(M.pts.desk[0] + 40, M.pts.desk[1]); N.push({ key: 'none', c, r, name: '值夜簿', hidden: true, h: 120, talk: async () => {
    const d = (F().qz_day || 1), who = n => NAME[n].replace(/^(侍女|小厮)/, '');
    await narrate('桌上摊着一本值夜簿，三个名字轮着写：青禾、小桃、阿福。');
    await narrate('今晚这一格写的是「' + who(DUTY()) + '」，字迹歪歪扭扭，旁边还画了一盏小油灯。'); } }); }
  { const [c, r] = P(M.pts.bedside[0], M.pts.bedside[1]); N.push({ key: 'none', c, r, name: '床榻', hidden: true, h: 150, talk: async () => {
    if (SHI() !== '子') { await narrate('窄窄的一张单人床，被褥叠得方方正正——今晚值夜的人睡这儿。'); return; }
    const L = { maid1: ['青禾侧身睡着，手里还攥着没缝完的鞋垫。', '（少爷轻手轻脚地把油灯拨暗了一点。）'], maid2: ['小桃抱着被角睡得正香，嘴里嘟囔着「鸭子……别跑……」。', '（少爷替她把滑下来的被子掖了掖。）'], servant: ['阿福四仰八叉地打着小呼噜，鞋还没脱。', '（少爷忍着笑，把他的鞋摆正。）'] }[DUTY()] || [];
    for (const l of L) await narrate(l); } }); }

  // ---------- 画 ----------
  // 夜里地面换夜墙闭窗；子时叠睡姿；整屋压子夜光
  const BB = {};   // 每个角色睡姿整套帧的可见包围盒中心
  const bbOf = who => { if (BB[who]) return BB[who]; const im = IM.bed, R = window.R162 && R162.IDX && R162.IDX[who + '_sleep_night_4f']; if (!im || !R) return null;
    const c = document.createElement('canvas'); c.width = 256 * R.n; c.height = 256; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, R.r * 256, 256 * R.n, 256, 0, 0, 256 * R.n, 256);
    const d = g.getImageData(0, 0, c.width, 256).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < 256; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 40) { const lx = x % 256; if (lx < x0) x0 = lx; if (lx > x1) x1 = lx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return (BB[who] = x1 < 0 ? [128, 128] : [(x0 + x1) / 2, (y0 + y1) / 2]); };
  drawGroundVis = (o => function () {
    o.apply(this, arguments);
    try { if (world.mapName !== WID) return; if (night() && IM.ground_night) ctx.drawImage(IM.ground_night, 0, 0);
      const T = world.map && world.map.T; if (!T || !T.objs) return; T.objs = T.objs.filter(q => !q.r175ws);
      if (SHI() === '子' && IM.bed) T.objs.push({ bk: true, id: 'r175ws', x: 0, y: 0, w: 1, h: 1, sy: M.sleeper.order || 551.1, flat: false, r175ws: DUTY() });
    } catch (e) {}
  })(drawGroundVis);
  drawBaked = (o => function (ob) {
    if (ob && ob.r175w && world.mapName === WID) { const e = ob.r175w, k = night() && e.n ? e.n : e.a, im = IMG['r175w_' + k]; if (im) ctx.drawImage(im, ob.x, ob.y); return; }
    if (ob && ob.r175ws) { const who = ob.r175ws, R = window.R162 && R162.IDX && R162.IDX[who + '_sleep_night_4f'], im = IM.bed, c = bbOf(who); if (!R || !im || !c) return;
      const f = Math.floor(performance.now() / 1000 * (R.fps || 3)) % R.n, [ax, ay] = M.sleeper.world_anchor;
      if (who === 'servant') { ctx.save(); ctx.translate(ax, ay); ctx.rotate(Math.PI / 2); ctx.drawImage(im, f * 256, R.r * 256, 256, 256, Math.round(-c[0]), Math.round(-c[1]), 256, 256); ctx.restore(); return; }   // 阿福那套是横着躺的（他屋里是横床），这张床竖放，转 90° 头朝里
      ctx.drawImage(im, f * 256, R.r * 256, 256, 256, Math.round(ax - c[0]), Math.round(ay - c[1]), 256, 256); return; }
    return o.apply(this, arguments); })(drawBaked);
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function () {
    o.apply(this, arguments);
    try { if (world.mapName === WID && SHI() === '子' && IM.midnight) ctx.drawImage(IM.midnight, 0, 0); } catch (e) {}
  })(tileAmbientHigh);
  window.R175W = { WID, M, IM };
})();
