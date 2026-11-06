// ================= R135-E · 管家重做 + 青竹小院侍女 / 小厮 + 云海大亭仆役房（作者 11-07 修改1 第 12 条）=================
// 作者 11-07：管家的建模太像宗门长老 → 换 Codex 新画的中年管家（圆领长衫、账本、钥匙串），地图行走图 + 对话立绘都换。
// 作者 11-07：青竹小院每天清晨要有两个侍女一个小厮在干活 → 青禾扫地、小桃浇花、阿福端水来回走；夜里回仆役房歇着。
// 作者 11-07：他们住在青竹小院后面那张图（云海大亭）的房子里 → 云海大亭西侧竹丛处摆一栋仆役房（昼 / 夜两版），门口能进，
//            里面是 Codex 画的通铺室内（4 床 + 屏风 + 3 柜 + 公用桌 + 灶台，中间留通道），出门回到房门口。
// 素材都在 r135e/（Codex R134_E 交付转 webp）：行走图 1120×720（下 / 上 / 左三行，0 列站立、1-6 列走路 8fps，右 = 左镜像，脚点 80,232）；
// 干活动作 6 帧横排 1536×256（每帧 256×256，脚点 128,240，6fps，画的是朝右）；立绘 868×900。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.qingzhu_court || typeof drawActorT !== 'function' || typeof tileSetMap !== 'function') return;
  const D = 'r135e/', ROOM = 'qingzhu_servant_room', PAV = 'qingzhu_upper_pavilion', COURT = 'qingzhu_court';
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const F = () => (S.flags = S.flags || {});
  const night = () => { try { return window.TOD ? TOD() === 'night' : false; } catch (e) { return false; } };
  const dlgWho = () => (typeof dialog !== 'undefined' && dialog) ? dialog.who : null;

  // ---------- 素材：进青竹一带才开始载（首屏不挡），15 秒后后台补载 ----------
  const IM = {}, REQ = {};
  const get = f => { if (IM[f]) return IM[f]; if (!REQ[f]) { REQ[f] = 1; const im = new Image(); im.onload = () => { IM[f] = im; if (f === 'house_day') IMG.r135e_house_day = im; if (f === 'house_night') IMG.r135e_house_night = im; if (f === 'interior') IMG.r135e_interior = im; if (PORT[f]) { IMG['p_r135e_' + f.slice(2)] = im; for (const n of PORT[f]) if (SPEAKERS[n]) SPEAKERS[n].p = 'p_r135e_' + f.slice(2); } }; im.src = D + f + '.webp'; } return null; };
  // 立绘载好才挂到 SPEAKERS 上（没载好时对话不会出现空白占位小人）
  // 作者 11-07：管家新形象（裹头巾）太丑，不像仙侠 → 先撤回原来的管家，等 Codex 重画
  const PORT = { p_maid1: ['侍女青禾'], p_maid2: ['侍女小桃'], p_servant: ['小厮阿福'] };
  if (typeof SPEAKERS === 'object') {
    SPEAKERS['管家'] = Object.assign({ color: '#e8d7b0' }, SPEAKERS['管家'] || {});
    SPEAKERS['侍女青禾'] = { color: '#cfe8c4' }; SPEAKERS['侍女小桃'] = { color: '#f6c9d2' }; SPEAKERS['小厮阿福'] = { color: '#c6d4ec' };
  }
  if (typeof MEDAL_FACE === 'object') { MEDAL_FACE.p_r135e_steward = { fx: .26, fy: .1, span: .24 }; MEDAL_FACE.p_r135e_maid1 = { fx: .73, fy: .08, span: .22 }; MEDAL_FACE.p_r135e_maid2 = { fx: .26, fy: .6, span: .22 }; MEDAL_FACE.p_r135e_servant = { fx: .76, fy: .62, span: .22 }; }
  const ALL = ['steward_walk', 'maid1_walk', 'maid1_work', 'maid2_walk', 'maid2_work', 'servant_walk', 'servant_work', 'p_steward', 'p_maid1', 'p_maid2', 'p_servant', 'house_day', 'house_night', 'interior'];
  const preload = name => { if (/^qingzhu_|^tj_room$/.test(name || '')) ALL.forEach(get); };
  setTimeout(() => ALL.forEach(get), 15000);

  // ---------- 人物定义 ----------
  const SC = .47;   // 管家身高 220px × .47 ≈ 103，和地图上别的 NPC 看着一样高（.54 时比叶孤星高出一头）；四人同一比例，Codex 留的身高差保留
  const WALK = { steward: 'steward_walk', maid1: 'maid1_walk', maid2: 'maid2_walk', servant: 'servant_walk' };
  const WORK = { maid1: 'maid1_work', maid2: 'maid2_work', servant: 'servant_work' };

  // 1) 管家：青竹小院 + 管事房里那两个「管家」换新行走图（位置、对话、传送功能都不动）
  for (const id of [COURT, 'qingzhu_steward_room']) for (const n of (TMAPS[id] && TMAPS[id].npcs) || []) if (n.name === '管家' && !n.hidden && window.R135E_STEWARD_OK) { n.r135e = 'steward'; n.h = 112; n.row = 0; }

  // 2) 白天在院里干活的三个人（夜里不出现，回仆役房）
  const court = TMAPS[COURT]; court.npcs = court.npcs || [];
  const dayOnly = () => !night();
  const addN = (map, o) => { const d = TMAPS[map]; d.npcs = d.npcs || []; const [c, r] = P(o.x, o.y); const n = Object.assign({ key: 'none', c, r, h: 108, wander: false, random: true }, o); delete n.x; delete n.y; d.npcs.push(n); return n; };
  // 青禾：东侧客舍门前石板路上扫地，扫一阵挪几步再扫（走路用行走图，停下来就是扫地动作）
  addN(COURT, { name: '侍女青禾', cx: 'maid', r135e: 'maid1', job: 'sweep', x: 1640, y: 566, route: [1640, 1790], face: 1, cond: dayOnly, _r135day: 1,
    talk: ['少爷早。竹叶一夜落一层，扫完这头，那头又落了。', '管家交代了，院子得干干净净的，少爷带朋友回来才有面子。', '少爷练剑当心些，上回削下来的竹枝，奴婢扫了一早上呢。'] });
  // 小桃：居室门前东边那一溜花圃，原地浇花
  addN(COURT, { name: '侍女小桃', cx: 'maid', r135e: 'maid2', job: 'water', x: 1292, y: 628, face: 1, cond: dayOnly, _r135day: 1,
    talk: ['这些花得趁日头没上来浇，晌午再浇要伤根的。', '石桌边那盆兰草开了，少爷路过闻闻？', '嘘——那块别踩，我才撒的花籽。'] });
  // 阿福：石阶下那段横着的石板路上端着水盆来回走（端水帧本身就是边走边端，停下时定在端盆站姿）
  addN(COURT, { name: '小厮阿福', cx: 'waiter', r135e: 'servant', job: 'carry', x: 240, y: 948, route: [240, 490], face: 1, cond: dayOnly, _r135day: 1,
    talk: ['少爷让让——水洒了要挨管家骂的！', '灶上烧着热水，少爷练完剑回来就能用。', '后山那口泉可真远，一早上挑了六趟。'] });

  // ---------- 画人 ----------
  const shadow = a => { ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 21, 7, 0, 0, 7); ctx.fill(); };
  const towardPlayer = a => { const p = world.player; if (!p) return null; const px = p.x - a.x, py = p.y - a.y; if (Math.abs(px) > Math.abs(py) * .8) return [2, px > 0]; return [py < 0 ? 1 : 0, false]; };
  function drawR(a, now) {
    const n = a.npc, k = n.r135e, st = a._r135 || {}, ph = (a.x * .013) % 1;
    const talk = a.talking || dlgWho() === n.name;
    const job = night() && n._r135day ? null : n.job;
    // 干活：扫地 / 浇花（停着时）、端水（一直）用 256 帧
    if (job && (job === 'carry' || !st.mv)) {
      const im = get(WORK[k]); if (!im) return false;
      let f, flip;
      if (talk) { f = job === 'carry' ? 2 : 0; flip = world.player ? world.player.x < a.x : false; }
      else { flip = (st.dir || n.face || 1) < 0; f = job === 'carry' ? (st.mv ? Math.floor(now * 7 + ph * 6) % 6 : 2) : Math.floor(now * 6 + ph * 6) % 6; }
      ctx.save(); shadow(a); ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y); if (flip) ctx.scale(-1, 1); ctx.scale(SC, SC);
      ctx.drawImage(im, f * 256, 0, 256, 256, -128, -240, 256, 256); ctx.restore(); return true;
    }
    const im = get(WALK[k]); if (!im) return false;
    let row = a._row ?? n.row ?? 0, flip = !!a._flip, col = 0;
    if (st.mv) { row = 2; flip = st.dir > 0; col = 1 + Math.floor(now * 8 + ph * 6) % 6; }
    else if (a.moving) {   // 剧情里被 moveActor 牵着走时也迈步
      let dx = (a.tx ?? a.x) - a.x, dy = (a.ty ?? a.y) - a.y; if (a._lx != null && Math.hypot(a.x - a._lx, a.y - a._ly) > .2) { dx = a.x - a._lx; dy = a.y - a._ly; }
      if (Math.abs(dx) + Math.abs(dy) > .01) { if (Math.abs(dx) > Math.abs(dy) * .8) { row = 2; flip = dx > 0; } else row = dy < 0 ? 1 : 0; }
      col = 1 + Math.floor(now * 8 + ph * 6) % 6;
    }
    if (talk) { const t = towardPlayer(a); if (t) [row, flip] = t; }
    a._lx = a.x; a._ly = a.y; if (!talk) { a._row = row; a._flip = flip; }
    ctx.save(); shadow(a); ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y); if (flip) ctx.scale(-1, 1); ctx.scale(SC, SC);
    ctx.drawImage(im, col * 160, row * 240, 160, 240, -80, -232, 160, 240); ctx.restore(); return true;
  }
  drawActorT = (o => function (a, now) {
    const k = a && a.npc && a.npc.r135e; if (!k || a.hidden) return o.apply(this, arguments);
    try { if (drawR(a, now)) return; } catch (e) {}
    return o.apply(this, arguments);   // 图还没载好：先用原来的样子顶着
  })(drawActorT);

  // ---------- 走动：青禾 / 阿福沿一小段横路来回；夜里院里的人收工 ----------
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) {
    o.apply(this, arguments);
    try {
      if (!world.actors) return; const nt = night();
      for (let i = world.actors.length - 1; i >= 0; i--) { const a = world.actors[i], n = a.npc; if (!n || !n.r135e) continue;
        if ((n._r135day && nt) || (n._r135night && !nt)) { world.actors.splice(i, 1); continue; }   // 剧情中途换了时辰：该收工的收工
        if (!n.route) continue;
        const st = a._r135 || (a._r135 = { dir: n.face || 1, wait: 2 + Math.random() * 3, mv: false });
        const busy = a.talking || dlgWho() === n.name || (typeof choice !== 'undefined' && choice);
        if (busy) { st.mv = false; continue; }
        if (st.wait > 0) { st.wait -= dt; st.mv = false; if (st.wait <= 0) st.mv = true; continue; }
        const sp = n.job === 'carry' ? 52 : 46, x1 = st.dir > 0 ? n.route[1] : n.route[0];
        const step = Math.min(Math.abs(x1 - a.x), sp * Math.min(dt, .05)); a.x += Math.sign(x1 - a.x) * step; st.mv = true;
        if (Math.abs(x1 - a.x) < .5) { a.x = x1; st.dir = -st.dir; st.mv = false; st.wait = n.job === 'sweep' ? 6 + Math.random() * 4 : 1.2 + Math.random() * 1.5; }
      }
    } catch (e) {}
  })(tileUpdate);

  // ---------- 3) 云海大亭西侧：仆役房外观（替掉那一丛竹子）----------
  // 显示宽 540（Codex 建议约 500）：云海大亭这张图缩到 .75 显示、人物不缩，房子再小门就比叶孤星矮了。
  // 西边草地只有 ~430 宽（再往东是去后山的石板路，不能挡），所以房子左边一间伸出地图边外（镜头到不了），看着像房子往西还有一截。
  const HW = 540, HK = HW / 768, HX = -135, HBASE = 700, HY = HBASE - 445 * HK, DOORX = HX + 362 * HK;   // 门前台阶中心约在原图 (362,440)
  const pav = TMAPS[PAV];
  if (pav && pav.baked) {
    pav.exits = pav.exits || [];
    const cs = pav.baked.cs || 8;
    // 门：台阶前一小条（玩家脚底走进去就进屋）
    pav.exits.push({ x: Math.floor((DOORX - 36) / cs), y: Math.floor(HBASE / cs) + 1, w: Math.ceil(72 / cs), h: 3, to: ROOM, label: '仆役房', at: P(640, 820), face: 'up' });
  }
  function patchPav() {
    const T = world.map && world.map.T; if (!T || T._r135e) return; T._r135e = 1;
    // 原来那丛竹子（route_bamboo_sun，左上角 -17,391）挪掉，房子立在这里
    T.objs = T.objs.filter(o => !(o.id === 'route_bamboo_sun' && Math.abs(o.x + 17) < 30 && Math.abs(o.y - 391) < 30));
    T.objs.push({ id: 'r135e_house', bk: true, img: 'r135e_house_day', x: HX, y: HY, w: HW, h: 512 * HK, sy: HBASE, flat: false, flip: false });
    const cs = T.cs, set = (x0, y0, x1, y1, v) => { for (let r = Math.max(0, Math.floor(y0 / cs)); r <= Math.min(T.rows - 1, Math.floor(y1 / cs)); r++) for (let c = Math.max(0, Math.floor(x0 / cs)); c <= Math.min(T.cols - 1, Math.floor(x1 / cs)); c++) T.block[r][c] = v; };
    set(0, HBASE, 430, 790, 0);              // 竹丛原来的根部碰撞放开，房前留一条能走到门口的空地
    set(0, HY + 20, HX + 742 * HK, HBASE - 1, 1);   // 整栋房子挡住（台阶前那一条不挡；屋后到竹丛那条缝也挡上，免得人钻到屋顶后面）
  }
  // 夜里换夜景版（窗里有暖光）
  if (typeof drawBaked === 'function') drawBaked = (o => function (ob, now) {
    if (ob && ob.id === 'r135e_house') { ob.img = night() && IMG.r135e_house_night ? 'r135e_house_night' : 'r135e_house_day'; if (!IMG[ob.img]) { get('house_day'); get('house_night'); return; } }
    return o.apply(this, arguments);
  })(drawBaked);

  // ---------- 4) 仆役房室内（1280×960 整图，独立地图）----------
  { const W0 = 1280, H0 = 960, cs = 8, cols = W0 / cs, rows = H0 / cs;
    // 能走的地方：中央通道 + 灶台前 + 方桌前一条 + 门口；床铺 / 屏风 / 柜子 / 方桌 / 灶台都挡住
    const free = (x, y) => {
      if (y >= 852) return x >= 505 && x <= 775 && y <= 918;           // 门口门槛
      if (y < 412) return false;                                        // 北墙 + 三只衣柜
      const L = 168 - (y - 400) * 80 / 452, R = 1118 + (y - 400) * 80 / 452; if (x < L || x > R) return false;   // 左右墙
      if (x < 452 && y < 808) return false;                             // 左边两张床、屏风、公用方桌和长凳
      if (x > 832 && y < 620) return false;                             // 右边两张床和屏风
      if (x > 930 && y < 846) return false;                             // 灶台、柴筐
      return true; };
    let b = ''; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) b += free((c + .5) * cs, (r + .5) * cs) ? '0' : '1';
    TMAPS[ROOM] = {
      title: '云海大亭 · 仆役房', indoor: true,
      baked: { ground: 'r135e_interior', w: W0, h: H0, cs, cols, rows, blocked: b, objs: [] },
      start: P(640, 820), chests: [],
      exits: [{ x: Math.floor(512 / cs), y: Math.floor(868 / cs), w: Math.ceil(256 / cs), h: 6, to: PAV, label: '出门 · 云海大亭', at: P(DOORX, HBASE + 44), face: 'down' }],
      npcs: [],
    };
    const spot = (x, y, name, text) => { const [c, r] = P(x, y); TMAPS[ROOM].npcs.push({ key: 'none', c, r, name, hidden: true, h: 110, talk: [text] }); };
    spot(458, 500, '侍女的床铺', '两张床挨着屏风，被褥叠得方方正正。枕边压着一枝晒干的桂花。');
    spot(826, 500, '靠窗的床铺', '一张是阿福的，被角卷着；另一张空着，被子也叠得整整齐齐——管家说，院里迟早还要添人。');
    spot(640, 424, '三只衣柜', '一人一只衣柜，柜门上用炭笔写着名字：青禾、小桃、阿福。');
    spot(462, 760, '公用方桌', '吃饭、缝补都在这张桌上。竹匾里晾着针线，还有一块叠好的布巾。');
    spot(905, 760, '小灶台', '灶上温着一壶热水。管家吩咐过：少爷练完剑回来，随时有热水用。');
    // 夜里三个人都在屋里
    const nightOnly = () => night();
    addN(ROOM, { name: '侍女青禾', cx: 'maid', r135e: 'maid1', x: 560, y: 600, row: 0, cond: nightOnly, _r135night: 1, talk: ['少爷怎么到下人房来了？屋里乱，您别嫌弃。', '明儿一早还得扫院子，奴婢先歇了。'] });
    addN(ROOM, { name: '侍女小桃', cx: 'maid', r135e: 'maid2', x: 700, y: 640, row: 0, cond: nightOnly, _r135night: 1, talk: ['嘘——青禾姐睡得浅。', '少爷要热水吗？灶上一直温着呢。'] });
    addN(ROOM, { name: '小厮阿福', cx: 'waiter', r135e: 'servant', x: 880, y: 720, row: 2, cond: nightOnly, _r135night: 1, talk: ['灶火我看着呢，少爷放心。', '今儿挑了六趟水，胳膊都抬不起来啦。'] });
  }
  // 室内夜里压暗一点，灶口留一团暖光（这张图没有 Codex 夜景光照层）
  // 云海大亭夜里整张图会被压暗偏蓝，仆役房夜景版窗里的暖光也跟着暗了 → 窗口再补一层暖光
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function (T, cam, now) {
    o.apply(this, arguments);
    try { if (world.mapName === PAV && night() && T._r135e) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (const [ix, iy, r, a] of [[122, 305, 46, .28], [238, 305, 46, .28], [488, 305, 46, .28], [590, 305, 46, .28], [362, 335, 60, .22], [428, 285, 30, .3]]) { const x = HX + ix * HK, y = HY + iy * HK; if (x < -40) continue; const g = ctx.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, `rgba(255,190,110,${a})`); g.addColorStop(1, 'rgba(255,150,70,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
        ctx.restore(); } } catch (e) {}
    try { if (world.mapName !== ROOM || !night()) return; ctx.save();
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(150,148,190)'; ctx.fillRect(0, 0, T.mw, T.mh);
      ctx.globalCompositeOperation = 'lighter'; const fl = .85 + Math.sin(now * 7) * .06 + Math.sin(now * 13) * .04;
      for (const [x, y, r, a] of [[1092, 770, 230, .30], [305, 190, 150, .10], [990, 190, 150, .10]]) { const g = ctx.createRadialGradient(x, y, 4, x, y, r); g.addColorStop(0, `rgba(255,170,90,${a * fl})`); g.addColorStop(1, 'rgba(255,140,60,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
      ctx.restore(); } catch (e) {}
  })(tileAmbientHigh);

  // ---------- 进图：预载素材、给云海大亭摆房子 ----------
  tileSetMap = (o => function (name) {
    if (name === ROOM) get('interior');
    const res = o.apply(this, arguments);
    try { preload(name); if (name === PAV) patchPav(); } catch (e) {}
    return res;
  })(tileSetMap);
  window.R135E = { patchPav, get: get, IM };
})();
