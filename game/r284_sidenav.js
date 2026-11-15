// ================= R284 · 支线 / 查案：点任务栏就带路；难找的地方在小地图上标圈、说方位 =================
// 作者 11-15：「因为我们是手游，找 NPC 是很难找的，得给出提示的，小地图上去标一标；有一些难的不标的话，那你也得说它在城的哪个方向。
//            大部分支线任务，你点支线任务，你也可以直接导找到目的地的。」
// 以前：青阳镇 / 玄天城这十条带剧情的支线（账本、桂花酿、剑穗、长乐坊、说书人、九灯、天字三号房、赝品、三十个名字、迟了一刻的灯），
//      接下以后点任务栏只会冒一句「就在这张地图上，四处看看」，不带路。
// 现在：按每条支线眼下走到哪一步，算出该去找谁 / 看哪儿：
//   · 找人 → 自动走过去、到了直接开口（人在别的图就先带过去；在楼上 / 后院这种只能让伙计领路的地方，先带去找领路的人）；
//   · 屋里要「几处都看一遍」的现场 → 带进屋，小地图上把还没看过的几处标金圈（不替你一处处点——看现场是查案的乐趣）；
//   · 推理要你自己指认的人（账本的内应、往灯里撒粉的人）→ 不带到人跟前，只带到那片地方、说方位，小地图上圈一大片。
// 进行中的支线，要看的地方平时也在小地图上标着（淡一点的金圈），不用先点任务栏。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || !window.SQ_DEFS) return;
  const F = () => (S.flags = S.flags || {});
  const st = id => ((F().sq || {})[id]) || { s: 0, n: 0 };
  const fin = id => st(id).s === 3;
  // ---------------- 按名字找人 / 找地方（人搬过家也找得到） ----------------
  const okCond = n => { try { return !n.cond || !!n.cond(); } catch (e) { return false; } };
  function locate(names, hint) {
    names = [].concat(names); const out = [];
    for (const m of Object.keys(TMAPS)) { const M = TMAPS[m]; for (const n of M.npcs || []) if (names.includes(n.name) && okCond(n)) out.push({ m, n }); }
    if (!out.length) return null;
    const here = world.mapName, R = window.QUEST_ROUTE, reach = m => m === here || (R && R.nextHop(here, m) !== undefined);
    return out.find(o => o.m === here && (!hint || o.m === hint)) || out.find(o => hint && o.m === hint && reach(o.m)) || out.find(o => o.m === here) || out.find(o => reach(o.m)) || out.find(o => !hint || o.m === hint) || out[0];
  }
  const actorOf = o => (world.actors || []).filter(a => a.npc && (a.npc === o.n || a.npc.name === o.n.name)).sort((a, b) => Math.hypot(a.x - world.player.x, a.y - world.player.y) - Math.hypot(b.x - world.player.x, b.y - world.player.y))[0];
  // 方位：按这张图的中心说「城东北 / 城南 / 屋里」
  function dirOf(m, x, y) { const T = world.map && world.mapName === m ? world.map.T : null, w = T ? T.mw : (TMAPS[m] && TMAPS[m].baked && TMAPS[m].baked.w) || 2000, h = T ? T.mh : (TMAPS[m] && TMAPS[m].baked && TMAPS[m].baked.h) || 2000;
    const dx = x / w - .5, dy = y / h - .5, ns = dy < -.17 ? '北' : dy > .17 ? '南' : '', ew = dx < -.17 ? '西' : dx > .17 ? '东' : '';
    const big = /city|town|xt_city|qy_town/.test(m); return (big ? '城' : '') + (ns || ew ? (ew + ns || '') : '中央').replace(/^(东|西)(南|北)$/, (s, a, b) => b === '' ? a : a + b); }
  // ---------------- 每条支线：现在这一步要去哪 ----------------
  // 返回 { to: [名字…], map: 偏向的图, via: 进不去时先找的领路人, look: 小地图要标的 [图, 名字…] / [图, [x,y]…], area: [图, x, y, 半径, 说法] }
  const P = (...a) => a;
  const T = {
    qy_ledger: (s, f) => s.n < 3 ? { to: [!f.qa_tea && '茶客', !f.qa_shop && '聚宝斋掌柜', !f.qa_inn && '店小二'].filter(Boolean) }
      : s.n === 3 ? { area: ['qy_inn', null, null, 0, '人就在悦来客栈大堂——三条线索对上的是谁，你自己判断，找他当面说'] }
      : s.n === 4 ? { to: ['林府管事'] } : s.n === 5 ? { to: ['账桌'], msg: '要先帮货郎掀了长乐坊的桌子，二楼才上得去' }
      : s.n === 6 ? { to: ['林府门房'] } : s.n === 7 ? (fin('qy_dice') ? { to: ['货郎'] } : { to: ['货郎'], msg: '先把货郎担子的事了结（支线「长乐坊」）' }) : { to: ['林府管事'] },
    qy_wine: (s, f) => s.n < 3 ? { to: [!f.qb_dao && '外地刀客', !f.qb_shu && '醉醺醺的书生', !f.qb_chu && '悦来厨子', !f.qb_chu && '醉仙楼厨子', !f.qb_jiao && '地窖口'].filter(Boolean) }
      : s.n === 3 ? { to: ['弹琵琶的姑娘'] } : { to: ['客栈掌柜'], map: 'qy_inn' },
    qy_tassel: s => s.n === 0 ? { to: ['采药老人'] } : s.n === 1 ? { to: ['河东剑碑'] } : { to: ['苏晚'] },
    qy_dice: (s, f) => s.n === 0 ? { to: ['老赌客', '输红眼的汉子'] } : s.n === 1 ? { to: [!f.qd_a && '老赌客', !f.qd_b && '输红眼的汉子'].filter(Boolean) } : s.n === 2 ? { to: ['庄家'] } : { to: ['货郎'] },
    xt_story: () => ({ to: ['说书先生'] }),
    xt_lamps: (s, f) => s.n < 3 ? { look: ['xt_city', ...lampsLeft(f)], lookMsg: '全城十盏灵灯：灵枢四角四盏、城东两盏、南街两盏、南城门两盏——小地图上的金圈是还没看过的' }
      : s.n === 3 ? { to: ['云来客栈伙计'] }
      : s.n === 4 ? { area: ['xt_city', 2240, 2900, 420, '那人白天在南城门里头揽活——去南城门一带找，可别指错了人'] } : { to: ['司灯老人'] },
    xt_room3: (s, f) => s.n === 0 ? { look: ['xt_inn_room3', ...left(f.xr_seen, { men: '断掉的门闩', chuang: '后窗和窗栓', ni: '窗台上的泥印', cha: '桌上的两只茶杯', yin: '地板上的印子' })], lookMsg: '天字三号房：屋里五处，小地图上的金圈是还没看过的' }
      : s.n === 1 ? { to: [!f.xr_a_q && '钱满仓', !f.xr_a_b && '柳三娘', !f.xr_a_n && '沈霜'].filter(Boolean), map: 'xt_inn_hall' }
      : s.n === 2 ? { to: ['云来客栈伙计'] } : s.n === 3 ? { to: ['丹霞堂伙计'] } : { to: ['柳三娘'] },
    xt_fake: (s, f) => s.n === 0 ? { look: ['xt_wanbao_store', ...left(f.xw_seen, { xia: '剑匣', jian: '匣中的剑', bu: '库房出入簿' })], lookMsg: '后院库房：三处，小地图上的金圈是还没看过的', via: '万宝楼伙计' }
      : s.n === 1 ? { to: [!f.xw_a_b && '万宝楼掌柜', !f.xw_a_q && '秦老', !f.xw_a_w && '小伍', !f.xw_a_h && '万宝楼伙计'].filter(Boolean), via: '万宝楼伙计' }
      : s.n === 2 ? { to: ['小伍'], via: '万宝楼伙计' } : s.n === 3 ? { to: ['玄兵阁掌柜'] } : s.n === 4 ? { to: ['秦老'], via: '万宝楼伙计' }
      : s.n === 5 ? { to: ['北墙上的仿古摆件'], via: '万宝楼伙计' } : { to: ['万宝楼掌柜'] },
    xt_thirty: (s, f) => s.n === 0 ? { to: [!f.xn_a_s && '云来客栈伙计', !f.xn_a_n && '沈霜', !f.xn_a_z && '城主府主簿'].filter(Boolean) }
      : s.n === 1 ? { to: ['卖花姑娘'] } : s.n === 2 ? { to: ['丹霞堂伙计'] } : s.n === 3 ? { to: ['司灯老人'] } : s.n === 4 ? { to: ['据点长老'] } : { to: ['旧染坊'] },
    xt_lamp: (s, f) => {
      if (f.hx_fail && s.n >= 6) return fin('qy_ledger') ? { to: ['素柜里的匣子', '柳三娘'] } : { msg: '先把青阳镇【黑风寨的账本】查完' };
      if (s.n === 0) return f.hx_pass ? { look: ['xt_inn_room1', ...left(f.hx_seen, { shi: '倒在床前的人', men: '门闩', zhuo: '圆桌', chuang: '后窗', bao: '行李架上的包袱' })], lookMsg: '天字一号房：屋里五处，小地图上的金圈是还没看过的' } : { to: ['玄天城城卫'] };
      if (s.n === 1) return { to: [!f.hx_a_l && '雷大勇', !f.hx_a_g && '阿贵', !f.hx_a_b && '柳三娘'].filter(Boolean) };
      if (s.n === 2) return { to: [!f.hx_deng && '司灯老人', !f.hx_shu && '说书先生'].filter(Boolean) };
      if (s.n === 3) return { to: ['万宝楼掌柜'] };
      if (s.n === 4) return { to: [!f.hx_body2 && '倒在床前的人', '阿贵'].filter(Boolean) };
      if (s.n === 5) return { to: [!f.hx_page && (f.hx_box ? '素柜里的匣子' : '百草轩掌柜'), !f.hx_tea && '倚翠楼侍女'].filter(Boolean) };
      return { to: [f.hx_left ? '柳三娘' : '云来客栈伙计'] };
    },
  };
  const left = (seen, names) => Object.keys(names).filter(k => !(seen || {})[k]).map(k => names[k]);
  // 九灯：和 r213 同一套算法拿十盏灯的位置；看过的按序号记在 f.xi_seen
  let LAMPS = null;
  const lampsLeft = f => { if (!LAMPS) LAMPS = ((typeof CXB2 !== 'undefined' && CXB2.xt_city && CXB2.xt_city.objs) || []).filter(o => /spirit_lamp/.test(o.id || '')).map(o => [Math.round(o.x + o.w / 2), Math.round(o.y + o.h)]);
    return LAMPS.filter((p, i) => !(f.xi_seen || {})[i]); };

  // ---------------- 算出寻路目标（给 R140 的任务栏用） ----------------
  let spotWant = null, spotAt = 0;
  function goal(id) {
    const fn = T[id], s = st(id), q = SQ_DEFS.find(x => x.id === id); if (!fn || s.s !== 1) return null;
    let r; try { r = fn(s, F()) || {}; } catch (e) { return null; }
    const here = world.mapName, R = window.QUEST_ROUTE, msg = r.msg || (q && q.goal) || '';
    const reach = m => m === here || (R && R.nextHop(here, m) !== undefined);
    const viaGoal = m => { if (!r.via || reach(m)) return null; const v = locate(r.via); return v ? { side: true, map: v.m, pick: r.via, msg } : null; };
    if (r.area) { const [m, x, y, , say] = r.area; return { side: true, map: m, msg: say, pt0: x != null ? [x, y] : null }; }
    if (r.look) { const m = r.look[0]; if (m !== here) return viaGoal(m) || { side: true, map: m, msg: r.lookMsg }; return { side: true, map: m, msg: (r.look.length > 1 ? r.lookMsg : '这里都看过了') }; }
    for (const name of r.to || []) {
      const o = locate(name, r.map); if (!o) continue;
      if (o.m !== here) return viaGoal(o.m) || { side: true, map: o.m, msg };
      const a = actorOf(o); if (!a) return { side: true, map: o.m, msg };
      if (!a.hidden) return { side: true, map: o.m, pick: a.npc.name, msg };
      spotWant = a; return { side: false, map: o.m, pt: [a.x, a.y - 30], msg };   // side:false → 走「到点」那条路   // 地上的「现场」（看不见的互动点）：走过去，到了替你点一下
    }
    return { side: true, msg };
  }
  // 自动寻路走到「现场」后，替玩家点一下（寻路刚停、人就在跟前时）
  let wasOn = false, arr = null;
  updateMap = (o => function (dt) { const nav = window.QUEST_NAV, on = !!(nav && nav.on); if (nav && nav.arrive) arr = nav.arrive; const r = o.apply(this, arguments);
    if (wasOn && !on && arr && world.player && Math.hypot(arr.x - world.player.x, arr.y - world.player.y) < 100 && spotWant && world.player && !world.path && !world.locked && !dialog && !choice && (world.actors || []).includes(spotWant) && Math.hypot(spotWant.x - world.player.x, spotWant.y - world.player.y) < 120) { const a = spotWant; spotWant = null; try { doInteract({ type: 'npc', a }); } catch (e) {} }
    if (!on) arr = null; wasOn = on; return r; })(updateMap);

  // ---------------- 接到 R140 任务栏上 ----------------
  function install() { const Q = window.R140Q; if (!Q || !Q.GO) return false;
    for (const id of Object.keys(T)) if (!Object.getOwnPropertyDescriptor(Q.GO, id)) Object.defineProperty(Q.GO, id, { configurable: true, enumerable: true, get() { return goal(id) || undefined; } });
    return true; }
  if (!install()) { const iv = setInterval(() => { if (install()) clearInterval(iv); }, 500); setTimeout(() => clearInterval(iv), 60000); }
  // ---------------- 小地图标圈 ----------------
  let MARKS = [], markT = 0;
  function calcMarks() { const out = [], here = world.mapName, f = F();
    for (const id of Object.keys(T)) { const s = st(id); if (s.s !== 1) continue; let r; try { r = T[id](s, f) || {}; } catch (e) { continue; }
      const hot = window.R140Q && R140Q.navId && R140Q.navId() === id;
      if (r.look && r.look[0] === here) for (const it of r.look.slice(1)) { let x, y; if (Array.isArray(it)) [x, y] = it; else { const o = locate(it, here), a = o && o.m === here && actorOf(o); if (!a) continue; x = a.x; y = a.y; } out.push({ x, y, r: 0, hot }); }
      if (r.area && r.area[0] === here && r.area[1] != null) out.push({ x: r.area[1], y: r.area[2], r: r.area[3], hot });
    }
    MARKS = out; }
  window.MM_MARKS = function (id, toM, big, now, seenAt) {
    if (performance.now() - markT > 500) { markT = performance.now(); try { calcMarks(); } catch (e) { MARKS = []; } }
    for (const m of MARKS) { if (!seenAt(m.x, m.y)) continue; const [a, b] = toM(m.x, m.y); ctx.save();
      if (m.r) { const k = Math.hypot(...toM(m.x + m.r, m.y).map((v, i) => v - [a, b][i])); ctx.strokeStyle = 'rgba(255,211,106,.85)'; ctx.setLineDash([6, 5]); ctx.lineWidth = big ? 2.5 : 1.6; ctx.beginPath(); ctx.arc(a, b, Math.max(10, k), 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,211,106,.10)'; ctx.fill(); }
      else { const rr = (big ? 10 : 6) + Math.sin(now * 5 + m.x) * (big ? 2 : 1); ctx.strokeStyle = m.hot ? '#ffd36a' : 'rgba(255,211,106,.75)'; ctx.shadowColor = 'rgba(255,200,80,.9)'; ctx.shadowBlur = m.hot ? 8 : 4; ctx.lineWidth = big ? 2.6 : 1.8; ctx.beginPath(); ctx.arc(a, b, rr, 0, 7); ctx.stroke(); }
      ctx.restore(); } };
  window.R284S = { goal: id => goal(id), T, locate, dirOf };
})();
