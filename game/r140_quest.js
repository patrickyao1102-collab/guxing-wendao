// ================= R140 · 右上任务栏 + 支线鼓励（作者 11-07）=================
// 作者：「要鼓励玩家做支线；任务栏你看看显示在哪里比较好」。左下是摇杆、右下是行囊 / 坐骑，右上本来就是任务位，所以任务栏留在右上：
//  · 第一行主线（红「主」），下面最多两条正在做的支线（蓝「支」）带进度，最底一行金字「附近可接 · 某支线　报酬：……」
//  · 点哪一条就自动寻路到哪（主线照旧走 QUEST_NAV；支线去接 / 交任务的人，或去打怪的地图）；点「收起」只留主线一行
//  · 进入有支线可接的地图，提示一句；支线完成满 3 / 6 / 10 条，当场发「历练嘉奖」（剑诀卷册等技能书）
(function () {
  if (typeof drawMapHud !== 'function' || typeof updateMap !== 'function' || !window.SQ_DEFS) return;
  window.QTRACK = true;
  const F = () => (S.flags = S.flags || {});
  const NAV = window.QUEST_NAV, ROUTE = window.QUEST_ROUTE;
  const SQ = window.SQ_DEFS;
  const stOf = () => { const m = {}; for (const s of SQ_STATE()) m[s.id] = s; return m; };
  const avail = q => !q.cond || q.cond();
  const isReady = s => s.s === 2 || (s.s === 1 && s.p >= s.n);
  const RT = q => (window.SQ_REWARD_TEXT ? SQ_REWARD_TEXT(q) : '');
  const GO = { tj_fish: { map: 'qingzhu_upper_pavilion', msg: '到云海后庭的潭边钓鱼——点东岸竹钓台，正午、黄昏鲤鱼多' } };   // 11-10：院内小池不钓鱼了

  // ---------------- 支线寻路目标 ----------------
  function sideGoal(id) {
    const q = SQ.find(x => x.id === id), s = q && stOf()[id], here = world.mapName;
    if (!q || !s || s.s === 3) return { side: true, msg: '这条支线已经完成了' };
    if (s.s === 0) return { side: true, map: q.giver[0], pick: q.giver[1] };
    if (isReady(s)) return { side: true, map: q.giver[0], pick: q.giver[1] };
    if (q.type === 'talk') return { side: true, map: q.target[0], pick: q.target[1] };
    if (GO[id]) return Object.assign({ side: true }, GO[id], GO[id].map === here ? {} : { msg: null });
    const maps = (q.kill && q.kill.maps) || (q.drop && q.drop.maps);
    if (maps && maps.length) {
      if (maps.includes(here)) return { side: true, map: here, msg: '就在这张图：碰兽火开打' };
      const m = maps.find(m => TMAPS[m] && ROUTE && ROUTE.nextHop(here, m) !== undefined) || maps[0];
      return { side: true, map: m, msg: '到了，碰兽火开打' };
    }
    if (q.kill && q.kill.tier) return { side: true, msg: '去野外地图找' + (q.kill.tier === 'gold' ? '金色' : '紫色') + '的火' };
    return { side: true, msg: q.goal };
  }
  let navId = null;
  function goSide(id) { if (!NAV) return; navId = id; window.QNAV_GOAL = () => sideGoal(id); try { NAV.start(); } catch (e) { console.warn('R140 nav', e); } }
  function goMain() { if (!NAV || !S.quest) return; navId = null; window.QNAV_GOAL = null; NAV.start(); }

  window.R140Q = { goSide, goMain, stOf, SQ, isReady, avail, RT, GO, navId: () => navId };   // R165 新任务栏借用
  // ---------------- 数据：主线 / 进行中支线 / 附近可接 ----------------
  function rows() {
    const st = stOf(), here = world.mapName, out = [];
    const act = SQ.filter(q => st[q.id] && (st[q.id].s === 1 || st[q.id].s === 2));
    const rel = q => { const s = st[q.id]; if (isReady(s)) return 0; const maps = (q.kill && q.kill.maps) || (q.drop && q.drop.maps) || [];
      return q.giver[0] === here || maps.includes(here) || (q.target && q.target[0] === here) || (GO[q.id] && GO[q.id].map === here) ? 1 : 2; };
    act.sort((a, b) => rel(a) - rel(b));
    for (const q of act.slice(0, 2)) { const s = st[q.id], r = isReady(s);
      let sub;
      if (r) sub = '完成了！回去找' + q.giver[1];
      else if (q.type === 'talk') sub = '去找' + q.target[1];
      else if (q.type === 'item') sub = (ITEM_DB[q.item] ? ITEM_DB[q.item].name : '') + '  ' + s.p + ' / ' + s.n;
      else sub = '进度  ' + s.p + ' / ' + s.n;
      out.push({ id: q.id, t: q.name, sub, ready: r }); }
    const near = SQ.find(q => st[q.id] && st[q.id].s === 0 && q.giver[0] === here && avail(q));
    return { side: out, more: Math.max(0, act.length - 2), near };
  }

  // ---------------- 画 ----------------
  const R = window.QTRACK_R = { head: null, main: null, side: [], near: null };
  const ell = (t, max) => { t = String(t || ''); if (ctx.measureText(t).width <= max) return t; const c = [...t]; while (c.length && ctx.measureText(c.join('') + '…').width > max) c.pop(); return c.join('') + '…'; };
  function wrap2(t, max) { t = String(t || ''); if (ctx.measureText(t).width <= max) return [t]; const c = [...t]; let i = c.length; while (i > 1 && ctx.measureText(c.slice(0, i).join('')).width > max) i--; return [c.slice(0, i).join(''), ell(c.slice(i).join(''), max)]; }
  function badge(x, y, k, col) { ctx.fillStyle = col; roundRect(x, y, 28, 28, 6); ctx.fill(); ctx.strokeStyle = 'rgba(246,223,166,.75)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `18px ${BRUSH}`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff2d6'; ctx.fillText(k, x + 14, y + 15); ctx.textAlign = 'left'; }
  function draw() {
    R.head = R.main = R.near = null; R.side = [];
    if (window.R165Q && R165Q.ready()) return;   // 作者 11-08：换成 R165 玄金剑令任务栏
    if (S.hud === false || S.menu || !world.map || S.scene !== drawMap) return;
    const D = rows(), fold = !!F().qt_fold, hasMain = !!S.quest;
    if (!hasMain && !D.side.length && !D.near) return;
    ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const w = 340, x = W - w - 14, y = x < (window.HUD_HX || 0) + 4 ? 96 : 12, pad = 8, tx = x + 50, tw = w - 62;
    ctx.font = `600 18px ${FONT}`; const ml = hasMain ? wrap2(S.quest, tw) : [];
    const mh = hasMain ? (ml.length > 1 ? 62 : 44) : 0, sh = fold ? 0 : D.side.length * 48, nh = !fold && D.near ? 30 : 0, hh = 30;
    const h = hh + mh + sh + nh + pad;
    lacquer(x, y, w, h, { r: 12, thin: true, top: 'rgba(40,24,14,.84)', bot: 'rgba(18,10,6,.84)' });
    // 头
    ctx.font = `22px ${BRUSH}`; textOutline('任务', x + 14, y + 17, '#f6dfa6', '#1a0800', 3);
    ctx.font = `600 13px ${FONT}`; ctx.fillStyle = NAV && NAV.on ? '#ffe27a' : '#bfae8a';
    ctx.fillText(NAV && NAV.on ? '◆ 自动寻路中（点地面取消）' : '点一条自动寻路' + (!fold && D.more ? ' · 另有 ' + D.more + ' 条' : ''), x + 64, y + 17);
    ctx.textAlign = 'right'; ctx.font = `600 15px ${FONT}`; ctx.fillStyle = '#e9c77a';
    ctx.fillText(fold ? '展开 ▾' + (D.side.length ? ' ' + (D.side.length + D.more) : '') : '收起 ▴', x + w - 12, y + 17); ctx.textAlign = 'left';
    R.head = { x: x + w - 96, y, w: 96, h: hh };
    let yy = y + hh;
    // 主线
    if (hasMain) { const on = NAV && NAV.on && !navId;
      ctx.fillStyle = on ? 'rgba(255,200,90,.22)' : 'rgba(184,50,31,.2)'; roundRect(x + 6, yy + 2, w - 12, mh - 4, 8); ctx.fill();
      badge(x + 12, yy + (mh - 28) / 2, '主', '#b8321f');
      ctx.font = `600 18px ${FONT}`; ctx.fillStyle = '#ffe29a'; ml.forEach((l, i) => ctx.fillText(l, tx, yy + (ml.length > 1 ? 18 + i * 24 : mh / 2)));
      R.main = { x, y: yy, w, h: mh }; yy += mh; }
    // 支线
    if (!fold) for (const r of D.side) { const on = NAV && NAV.on && navId === r.id;
      if (on) { ctx.fillStyle = 'rgba(95,184,255,.18)'; roundRect(x + 6, yy + 2, w - 12, 44, 8); ctx.fill(); }
      badge(x + 12, yy + 10, '支', '#2f6fb8');
      ctx.font = `600 17px ${FONT}`; ctx.fillStyle = '#f2e6c8'; ctx.fillText(ell(r.t, tw), tx, yy + 15);
      ctx.font = `14px ${FONT}`; ctx.fillStyle = r.ready ? '#ffd36a' : '#9fc6f0'; ctx.fillText(ell(r.sub, tw), tx, yy + 35);
      R.side.push({ id: r.id, x, y: yy, w, h: 48 }); yy += 48; }
    // 附近可接
    if (!fold && D.near) { ctx.font = `600 14px ${FONT}`; ctx.fillStyle = '#ffd36a';
      { const rt = RT(D.near).split('、'); ctx.fillText(ell('！可接 · ' + D.near.name + '　报酬：' + rt[0] + (rt.length > 1 ? ' 等' : ''), w - 26), x + 14, yy + 14); } R.near = { id: D.near.id, x, y: yy, w, h: nh }; }
    ctx.restore();
  }
  drawMapHud = (o => function () { const r = o.apply(this, arguments); try { draw(); } catch (e) { console.warn('R140 draw', e); } return r; })(drawMapHud);

  // ---------------- 点 ----------------
  const hit = (t, r) => r && t.x >= r.x && t.x <= r.x + r.w && t.y >= r.y && t.y <= r.y + r.h;
  updateMap = (o => function (dt) {
    if (NAV && !NAV.on && window.QNAV_GOAL) { window.QNAV_GOAL = null; navId = null; }
    const t = input.tapped;
    if (t && !t.key && !(window.R165Q && R165Q.ready()) && S.hud !== false && world.map && !S.menu && !dialog && !choice && !world.locked) {
      let done = true;
      if (hit(t, R.head)) { F().qt_fold = !F().qt_fold; try { playSnd('ui_click'); } catch (e) {} }
      else if (hit(t, R.main)) goMain();
      else { const s = R.side.find(r => hit(t, r)); if (s) goSide(s.id); else if (hit(t, R.near)) goSide(R.near.id); else done = false; }
      if (done) { input.tapped = null; }
    }
    return o.apply(this, arguments);
  })(updateMap);

  // ---------------- 进图提示：这里有支线可接 ----------------
  const told = {};
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (name) {
    const r = o.apply(this, arguments);
    setTimeout(() => { try {
      if (told[name] || world.mapName !== name || world.locked || S.hud === false) return;
      const st = stOf(), n = SQ.filter(q => q.giver[0] === name && st[q.id] && st[q.id].s === 0 && avail(q)).length;
      if (n) { told[name] = 1; toast('此地有 ' + n + ' 条支线可接（蓝色「!」）', 2600); }
    } catch (e) {} }, 1600);
    return r;
  })(tileSetMap);

  // ---------------- 历练嘉奖：完成满 3 / 6 / 10 条支线 ----------------
  const MS = [
    { n: 3, items: [['juan2', 1]], gold: 200, line: '《剑诀·卷二》' },
    { n: 6, items: [['juan3', 1], ['p_revive', 2]], points: 60, line: '《剑诀·卷三》' },
    { n: 10, items: [['juan4', 1], ['juan5', 1]], gold: 1000, line: '《剑诀·卷四》《剑诀·卷五》' },
  ];
  const doneN = () => SQ_STATE().filter(s => s.s === 3).length;
  window.SQ_MILESTONE_TEXT = d => { const m = MS.find(m => !(F().sq_ms || {})[m.n]); if (!m) return '历练嘉奖已全部领取'; return d >= m.n ? '历练嘉奖可领' : '再完成 ' + (m.n - d) + ' 条：' + m.line; };
  window.SQ_AFTER = async function () {
    const d = doneN(), got = (F().sq_ms = F().sq_ms || {});
    for (const m of MS) { if (d < m.n || got[m.n]) continue; got[m.n] = 1;
      const items = []; for (const [id, k] of m.items) { addItem(id, k); items.push({ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×' + k, desc: ITEM_DB[id].desc || '' }); }
      if (m.gold) { S.hero.gold += m.gold; items.push({ icon: window.LINGSHI_ICON ? LINGSHI_ICON(m.gold) : 'gold', name: '灵石', count: '×' + m.gold, desc: '' }); }
      if (m.points) { S.hero.points = (S.hero.points || 0) + m.points; items.push({ icon: 'item:ui_star', name: '星辰点', count: '+' + m.points, desc: '' }); }
      toast('历练有成 · 宗门嘉奖', 2200);
      if (window.itemGet) await itemGet(items, '历练嘉奖');
    }
  };
})();
