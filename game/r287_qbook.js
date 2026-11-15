// ================= R287 · 任务栏重做 + 行囊「任务」页 + 任务榜（作者 11-15）=================
// 作者：「右上角那个任务列表做的不够好，它不能下滑，很多时候我看不清……更重要是让读者能够看得清晰，一目了然，需要该做什么」
//      「行囊里面应该也有任务栏这个选项，尽量做的详细一点点」
//      「支线是主角自己主动去接案子……天剑宗据点旁边那个任务栏可以接任务；天剑宗大殿里那个执事弟子那里也可以接任务、交任务」
// 1) 右上任务栏：实底深色卡片、大字；只放主线 + 最多两条正在跟的支线，每条三行：任务名 / 现在该做什么 / 在哪。点一条就带路。
//    右上「全部」打开行囊的任务页；「－」收成一个小圆标。手机上整体放大一点。
// 2) 行囊 · 任务页：左边列表（进行中 / 可接 / 已完成，能上下拖、滚轮），右边详情：现在该做（大字框）、地点、报酬、来龙去脉、证词本；
//    按钮：带我去 / 放进任务栏（右上最多跟两条）。
// 3) 任务榜：玄天城天剑宗据点的告示板、据点议事堂的任务玉璧 / 任务执事、天剑宗大殿的记功执事，打开同一个页面的「榜」模式：
//    列出各地可接的事，选一条「揭榜」，记进任务栏并带你去找发话的人。只进测试版。
(function () {
  if (typeof drawMapHud !== 'function' || typeof updateMap !== 'function' || !window.SQ_DEFS || typeof MTABS === 'undefined') return;
  window.QT287 = true;
  const F = () => (S.flags = S.flags || {});
  const PHONE = (() => { try { const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0; return (touch && Math.min(screen.width, screen.height) < 700) || /[?&]phone=1/.test(location.search); } catch (e) { return false; } })();
  const REG = m => !m ? '' : /^qy_|^lin_|^hf_|qingyang/.test(m) ? '青阳镇' : /^xt_/.test(m) ? '玄天城' : /^tj_|^qingzhu/.test(m) ? '天剑宗' : '野外';
  const NOTES = { xt_room3: 'xr_notes', xt_fake: 'xw_notes', xt_thirty: 'xn_notes', xt_lamp: 'hx_notes' };
  const mapTitle = m => String((TMAPS[m] && TMAPS[m].title) || '').replace(/^天剑宗 · /, '');
  const R = () => window.R140Q;
  const track = () => { const f = F(); if (!Array.isArray(f.qt_track)) f.qt_track = []; return f.qt_track; };

  // ---------------- 数据 ----------------
  function mainItem() {
    const q = String(S.quest || ''); if (!q || (window.ML_ACTIVE && ML_ACTIVE())) return null;   /* 主线案《名录》办着的时候，它就是主线 */
    const i = q.search(/[：:]/), pre = i > 0 && i <= 12 ? q.slice(0, i).trim() : '', step = pre ? q.slice(i + 1).trim() : q;
    let map = ''; try { const RU = window.QUEST_ROUTE && QUEST_ROUTE.RULES, r = RU && RU.find(([re]) => re.test(q)), g = r && r[1](); if (g && g.map) map = g.map; } catch (e) {}
    return { id: '__main', kind: 'main', name: pre || '主线', status: 'doing', step, map, where: map ? mapTitle(map) : '', region: REG(map), reward: '', desc: typeof CHAP === 'function' ? CHAP() : '', notes: [] };
  }
  function sideItem(q, s) {
    const Q = R(); s = s || { s: 0 };
    const ready = s.s !== 0 && s.s !== 3 && Q.isReady(s), status = s.s === 0 ? 'avail' : s.s === 3 ? 'done' : ready ? 'ready' : 'doing';
    let step = '', map = q.giver[0];
    if (status === 'avail') step = '去找' + q.giver[1] + '，接下这件事';
    else if (status === 'ready') step = '办完了——回去告诉' + q.giver[1];
    else if (status === 'done') step = '已经办完了';
    else if (q.type === 'talk') { step = '去找' + q.target[1]; map = q.target[0]; }
    else {
      const maps = ((q.kill && q.kill.maps) || (q.drop && q.drop.maps) || []).filter(m => TMAPS[m]);
      step = String(q.goal || '');
      if (q.type === 'item') step = (step ? step + '　' : '') + ((ITEM_DB[q.item] && ITEM_DB[q.item].name) || '') + ' ' + (s.p || 0) + ' / ' + s.n;
      else if (maps.length) step += '　（' + (s.p || 0) + ' / ' + s.n + '）';
      let g = null; try { g = window.R284S && R284S.goal(q.id); } catch (e) {}
      map = (g && g.map) || maps[0] || q.giver[0];
    }
    const where = status === 'doing' && map ? mapTitle(map) : q.where;
    return { id: q.id, kind: q.main ? 'main' : 'side', name: q.name, status, step, map, where: where || q.where || '', region: REG(map || q.giver[0]), reward: Q.RT(q) || '', desc: String(q.desc || '').replace(/\s*【证词本】[\s\S]*$/, ''), notes: (F()[NOTES[q.id] || q.notesKey] || []).slice(), giverWhere: q.where };
  }
  function all() {
    const Q = R(); if (!Q) return { doing: [], avail: [], done: [] };
    const st = Q.stOf(), here = REG(world.mapName), out = { doing: [], avail: [], done: [] };
    const m = mainItem(); if (m) out.doing.push(m);
    for (const q of Q.SQ) { const s = st[q.id]; const it = sideItem(q, s);
      if (it.status === 'avail') { if (Q.avail(q)) out.avail.push(it); }
      else if (it.status === 'done') out.done.push(it); else out.doing.push(it); }
    const near = it => (it.region === here ? 0 : 1);
    out.doing.sort((a, b) => (a.kind === 'main' ? -9 : 0) - (b.kind === 'main' ? -9 : 0) || (a.status === 'ready' ? -1 : 0) - (b.status === 'ready' ? -1 : 0) || near(a) - near(b));
    out.avail.sort((a, b) => near(a) - near(b));
    return out;
  }
  // 右上任务栏跟哪两条支线：玩家点了「放进任务栏」的优先；没点过就挑正在带路的、本地的
  function hudSides(A) {
    const T = track(), sides = A.doing.filter(x => x.kind === 'side');
    let pick = T.map(id => sides.find(x => x.id === id)).filter(Boolean);
    if (!pick.length) { const nav = R() && R().navId && R().navId(); const here = REG(world.mapName);
      pick = sides.slice().sort((a, b) => (b.id === nav) - (a.id === nav) || (b.status === 'ready') - (a.status === 'ready') || (b.region === here) - (a.region === here)); }
    return pick.slice(0, 2);
  }
  function go(it) { try { if (it.id === '__main') R().goMain(); else R().goSide(it.id); } catch (e) {} }

  // ---------------- 画字的小工具 ----------------
  const fnt = (sz, w) => `${w || 400} ${sz}px ${FONT}`;
  function lines(t, max, n) { const out = []; let cur = ''; for (const ch of String(t || '').replace(/\n/g, ' ')) { if (ctx.measureText(cur + ch).width > max && cur) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur);
    if (n && out.length > n) { out.length = n; let l = out[n - 1]; while (l && ctx.measureText(l + '…').width > max) l = l.slice(0, -1); out[n - 1] = l + '…'; } return out.length ? out : ['']; }
  const ell = (t, max) => lines(t, max, 1)[0];
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  const COL = { main: '#ff6a55', side: '#6fb8ff', ready: '#7fd18b', avail: '#ffc04a', done: '#9aa3ab' };
  const tagOf = it => it.kind === 'main' ? ['主', COL.main] : it.status === 'ready' ? ['交', COL.ready] : it.status === 'avail' ? ['接', COL.avail] : it.status === 'done' ? ['完', COL.done] : ['支', COL.side];
  function tag(t, col, x, y, s) { ctx.save(); ctx.fillStyle = col; rr(x, y, s, s, 5); ctx.fill(); ctx.fillStyle = '#10141b'; ctx.font = fnt(Math.round(s * .62), 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x + s / 2, y + s / 2 + 1); ctx.restore(); }

  // ================= 1) 右上任务栏 =================
  const HUD = { hits: [], rect: null };
  function drawHud() {
    HUD.hits = []; HUD.rect = null;
    if (!R() || S.hud === false || S.menu || !world.map || S.scene !== drawMap) return;
    const A = all(), M = A.doing.find(x => x.kind === 'main'), rows = (M ? [M] : []).concat(hudSides(A));
    const k = PHONE ? 1.2 : 1, W0 = 318, now = performance.now(), nav = !!(window.QUEST_NAV && QUEST_NAV.on), navId = R().navId && R().navId();
    if (F().qt_min || !rows.length) {   // 收起：右上一个小圆标
      const cx = W - 44 * k, cy = 44 * k, r = 26 * k;
      ctx.save(); ctx.fillStyle = 'rgba(12,14,20,.86)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = nav ? '#ffd36a' : 'rgba(226,190,112,.85)'; ctx.stroke();
      ctx.fillStyle = '#ffe3a3'; ctx.font = fnt(Math.round(15 * k), 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('任务', cx, cy + 1);
      if (A.doing.some(x => x.status === 'ready')) { ctx.fillStyle = COL.ready; ctx.beginPath(); ctx.arc(cx + r * .72, cy - r * .72, 6 * k, 0, 7); ctx.fill(); }
      ctx.restore(); HUD.rect = [cx - r - 4, cy - r - 4, r * 2 + 8, r * 2 + 8]; HUD.hits.push({ a: 'max', r: HUD.rect }); return; }
    // 量高度
    ctx.font = fnt(15.5); const lay = rows.map(it => { const st = lines(it.step, W0 - 52, 2); return { it, st, h: 12 + 22 + st.length * 21 + (it.where ? 19 : 0) + 8 }; });
    const H0 = 40 + lay.reduce((s, l) => s + l.h, 0) + (nav ? 22 : 6), x0 = W - 12 - W0 * k, y0 = 10;
    HUD.rect = [x0, y0, W0 * k, H0 * k];
    const S2 = (lx, ly, lw, lh) => [x0 + lx * k, y0 + ly * k, lw * k, lh * k];
    ctx.save(); ctx.translate(x0, y0); ctx.scale(k, k);
    ctx.fillStyle = 'rgba(11,13,19,.86)'; rr(0, 0, W0, H0, 12); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(226,190,112,.55)'; ctx.stroke();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = '#e8c98a'; ctx.font = fnt(15, 700); ctx.fillText('任务', 16, 21);
    ctx.fillStyle = '#9fb0c2'; ctx.font = fnt(12.5); ctx.fillText('点一条，自动带路', 56, 21.5);
    // 全部 / 收起
    const btn = (x, w, t, a) => { ctx.fillStyle = 'rgba(255,255,255,.07)'; rr(x, 8, w, 26, 7); ctx.fill(); ctx.strokeStyle = 'rgba(226,190,112,.45)'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#ffe3a3'; ctx.font = fnt(14, 700); ctx.textAlign = 'center'; ctx.fillText(t, x + w / 2, 21.5); ctx.textAlign = 'left'; HUD.hits.push({ a, r: S2(x - 4, 2, w + 8, 38) }); };
    btn(W0 - 104, 60, '全部 ›', 'book'); btn(W0 - 38, 28, '－', 'min');
    let y = 40;
    for (const { it, st, h } of lay) {
      const [t, col] = tagOf(it), on = nav && ((it.kind === 'main' && !navId) || it.id === navId);
      ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.beginPath(); ctx.moveTo(12, y + .5); ctx.lineTo(W0 - 12, y + .5); ctx.stroke();
      if (on) { ctx.fillStyle = 'rgba(255,211,106,.10)'; ctx.fillRect(4, y + 1, W0 - 8, h - 2); }
      ctx.fillStyle = col; ctx.fillRect(4, y + 8, 3, h - 16);
      tag(t, col, 14, y + 11, 22);
      ctx.fillStyle = '#ffe3a3'; ctx.font = fnt(17, 700); ctx.fillText(ell(it.name, W0 - 60 - (on ? 54 : 0)), 44, y + 23);
      if (on) { ctx.fillStyle = '#ffd36a'; ctx.font = fnt(12.5, 700); ctx.textAlign = 'right'; ctx.fillText('带路中', W0 - 14, y + 23); ctx.textAlign = 'left'; }
      ctx.fillStyle = '#f4ecd8'; ctx.font = fnt(15.5); st.forEach((l, i) => ctx.fillText(l, 44, y + 46 + i * 21));
      if (it.where) { ctx.fillStyle = '#9fb4c8'; ctx.font = fnt(13); ctx.fillText('◎ ' + ell(it.where, W0 - 70), 44, y + 46 + st.length * 21 - 2); }
      HUD.hits.push({ a: 'go', it, r: S2(0, y, W0, h) });
      y += h;
    }
    if (nav) { ctx.fillStyle = '#ffd36a'; ctx.font = fnt(12.5); ctx.fillText('◆ 自动寻路中 · 自己走动或点地面就取消', 16, y + 10); }
    ctx.restore();
    try { if (window.R165Q && R165Q.UI) R165Q.UI.panel = HUD.rect; } catch (e) {}   // 新手引导指着任务栏讲解时用
  }
  drawMapHud = (o => function () { const r = o.apply(this, arguments); try { drawHud(); } catch (e) { console.warn('R287 hud', e); } return r; })(drawMapHud);
  const inR = (x, y, r) => r && x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3];
  const busy = () => S.hud === false || !world.map || S.menu || dialog || choice || world.locked || (typeof sysPanel !== 'undefined' && sysPanel);
  updateMap = (o => function (dt) {
    const t = input.tapped;
    if (t && !t.key && HUD.rect && !busy() && inR(t.x, t.y, HUD.rect)) {
      input.tapped = null; const h = HUD.hits.find(h => inR(t.x, t.y, h.r)); if (h) { try { playSnd('ui_click'); } catch (e) {}
        if (h.a === 'max') F().qt_min = 0; else if (h.a === 'min') F().qt_min = 1; else if (h.a === 'book') openBook('book'); else if (h.a === 'go') go(h.it); }
      return; }
    return o.apply(this, arguments);
  })(updateMap);

  // ================= 2) 行囊 · 任务页（也是任务榜） =================
  const QB = { mode: 'book', filter: 'doing', sel: null, scroll: 0, dscroll: 0, hits: [], list: null, detail: null, title: '', maxS: 0, maxD: 0 };
  function openBook(mode, title) {
    if (!S.menu) openMenu(); S.menu.tab = MTABS.indexOf('任务'); QB.mode = mode || 'book'; QB.title = title || ''; QB.filter = mode === 'board' ? 'avail' : 'doing'; QB.sel = null; QB.scroll = 0; QB.dscroll = 0; }
  window.QBOOK_OPEN = openBook;
  function pal() { const light = !window.BAG_DARK; /* 行囊默认是白玉宣纸（浅色）*/ return light
    ? { card: 'rgba(255,252,244,.92)', cardOn: 'rgba(255,238,200,.98)', line: 'rgba(120,80,30,.38)', gold: '#7a4a08', text: '#2a1f12', sub: '#5f5446', box: 'rgba(255,230,170,.55)', btn: 'rgba(120,80,30,.10)' }
    : { card: 'rgba(255,255,255,.05)', cardOn: 'rgba(232,201,138,.16)', line: 'rgba(226,190,112,.35)', gold: '#e8c98a', text: '#f2ead8', sub: '#a9b3bd', box: 'rgba(232,201,138,.10)', btn: 'rgba(255,255,255,.07)' }; }
  function drawBook(B) {
    const P = pal(), A = all(); QB.hits = [];
    const LX = B.x + 22, LY = B.y + 64, LW = Math.min(410, B.w * .4), LH = B.h - 82, DX = LX + LW + 22, DW = B.x + B.w - 22 - DX, DY = B.y + 18, DH = B.h - 36;
    ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    // 标题 + 三个分页
    const tabs = [['doing', '进行中', A.doing.length], ['avail', QB.mode === 'board' ? '榜上可接' : '可接', A.avail.length], ['done', '已完成', A.done.length]];
    let tx = LX; if (QB.mode === 'board') { ctx.fillStyle = P.gold; ctx.font = fnt(20, 700); ctx.fillText(QB.title || '任务榜', LX, B.y + 22); }
    const ty = QB.mode === 'board' ? B.y + 30 : B.y + 18, th = 34; if (QB.mode === 'board') { /* 榜：分页放在标题下 */ }
    const tw = (LW - 16) / 3;
    tabs.forEach(([k, n, c], i) => { const x = LX + i * (tw + 8), on = QB.filter === k; ctx.fillStyle = on ? P.cardOn : P.btn; rr(x, ty + (QB.mode === 'board' ? 6 : 0), tw, th - (QB.mode === 'board' ? 6 : 0), 8); ctx.fill(); ctx.strokeStyle = on ? P.gold : P.line; ctx.lineWidth = on ? 2 : 1; ctx.stroke();
      ctx.fillStyle = on ? P.gold : P.sub; ctx.font = fnt(16, 700); ctx.textAlign = 'center'; ctx.fillText(n + ' ' + c, x + tw / 2, ty + th / 2 + (QB.mode === 'board' ? 3 : 0)); ctx.textAlign = 'left'; QB.hits.push({ a: 'filter', k, r: [x, ty, tw, th] }); });
    // 列表
    const items = A[QB.filter] || []; if (!QB.sel || !items.find(x => x.id === QB.sel)) QB.sel = items[0] ? items[0].id : null;
    const CH = 76, GAP = 8, total = items.length * (CH + GAP); QB.maxS = Math.max(0, total - LH); QB.scroll = Math.max(0, Math.min(QB.maxS, QB.scroll)); QB.list = [LX, LY, LW, LH];
    ctx.save(); ctx.beginPath(); ctx.rect(LX - 2, LY - 2, LW + 4, LH + 4); ctx.clip();
    if (!items.length) { ctx.fillStyle = P.sub; ctx.font = fnt(16); ctx.fillText(QB.filter === 'avail' ? '这一带暂时没有能接的事。' : QB.filter === 'done' ? '还没有办完的支线。' : '眼下没有在做的任务。', LX + 6, LY + 24); }
    items.forEach((it, i) => { const y = LY + i * (CH + GAP) - QB.scroll; if (y + CH < LY || y > LY + LH) return; const on = it.id === QB.sel, [t, col] = tagOf(it);
      ctx.fillStyle = on ? P.cardOn : P.card; rr(LX, y, LW - 14, CH, 10); ctx.fill(); ctx.strokeStyle = on ? P.gold : P.line; ctx.lineWidth = on ? 2 : 1; ctx.stroke();
      tag(t, col, LX + 12, y + 13, 24);
      ctx.fillStyle = on ? P.gold : P.text; ctx.font = fnt(18, 700); ctx.fillText(ell(it.name, LW - 120), LX + 46, y + 25);
      ctx.fillStyle = P.sub; ctx.font = fnt(13); ctx.textAlign = 'right'; ctx.fillText(it.region || '', LX + LW - 28, y + 25); ctx.textAlign = 'left';
      ctx.fillStyle = P.text; ctx.globalAlpha = .85; ctx.font = fnt(14.5); ctx.fillText(ell(it.step, LW - 64), LX + 46, y + 54); ctx.globalAlpha = 1;
      QB.hits.push({ a: 'sel', id: it.id, r: [LX, Math.max(LY, y), LW - 14, Math.min(y + CH, LY + LH) - Math.max(LY, y)] }); });
    ctx.restore();
    if (QB.maxS > 0) { // 滚动条 + 提示
      const sx = LX + LW - 6, thH = Math.max(40, LH * LH / total), thY = LY + (QB.scroll / QB.maxS) * (LH - thH);
      ctx.fillStyle = P.btn; rr(sx - 3, LY, 6, LH, 3); ctx.fill(); ctx.fillStyle = P.gold; rr(sx - 3, thY, 6, thH, 3); ctx.fill();
      const left = Math.max(0, Math.ceil((total - QB.scroll - LH) / (CH + GAP))); if (left > 0) { ctx.fillStyle = P.gold; ctx.font = fnt(13, 700); ctx.textAlign = 'center'; ctx.fillText('↓ 下面还有 ' + left + ' 条，按住往上拖', LX + LW / 2 - 8, LY + LH + 9); ctx.textAlign = 'left'; } }
    // 详情
    const it = items.find(x => x.id === QB.sel); QB.detail = [DX, DY, DW, DH - 64];
    ctx.strokeStyle = P.line; ctx.lineWidth = 1; rr(DX, DY, DW, DH, 12); ctx.stroke();
    if (it) {
      const pad = 22, IW = DW - pad * 2; ctx.save(); ctx.beginPath(); ctx.rect(DX + 2, DY + 2, DW - 4, DH - 66); ctx.clip();
      let y = DY + 30 - QB.dscroll; const [t, col] = tagOf(it);
      tag(t, col, DX + pad, y - 15, 30); ctx.fillStyle = P.gold; ctx.font = fnt(25, 700); ctx.fillText(ell(it.name, IW - 44), DX + pad + 42, y + 1); y += 32;
      ctx.fillStyle = P.sub; ctx.font = fnt(14.5); ctx.fillText([it.kind === 'main' ? '主线' : '支线', it.region, { doing: '进行中', ready: '可以交了', avail: '可以接', done: '已完成' }[it.status]].filter(Boolean).join('　·　'), DX + pad, y); y += 26;
      // 现在该做（大字框）
      ctx.font = fnt(19, 600); const sl = lines(it.step, IW - 28); const bh = 34 + sl.length * 27;
      ctx.fillStyle = P.box; rr(DX + pad, y, IW, bh, 10); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = P.gold; ctx.font = fnt(13.5, 700); ctx.fillText(it.status === 'done' ? '结果' : '现在该做', DX + pad + 14, y + 16);
      ctx.fillStyle = P.text; ctx.font = fnt(19, 600); sl.forEach((l, i) => ctx.fillText(l, DX + pad + 14, y + 42 + i * 27)); y += bh + 18;
      const field = (k, v) => { if (!v) return; ctx.fillStyle = P.gold; ctx.font = fnt(15, 700); ctx.fillText(k, DX + pad, y); ctx.fillStyle = P.text; ctx.font = fnt(15.5); const ls = lines(v, IW - 62); ls.forEach((l, i) => ctx.fillText(l, DX + pad + 62, y + i * 23)); y += ls.length * 23 + 10; };
      field('地点', it.where); if (it.kind === 'side' && it.giverWhere && it.giverWhere !== it.where) field('发话人', it.giverWhere); field('报酬', it.reward);
      if (it.desc) { y += 4; ctx.fillStyle = P.gold; ctx.font = fnt(15, 700); ctx.fillText(it.kind === 'main' ? '章节' : '来龙去脉', DX + pad, y); y += 24; ctx.fillStyle = P.text; ctx.font = fnt(15); lines(it.desc, IW).forEach(l => { ctx.fillText(l, DX + pad, y); y += 22; }); y += 8; }
      if (it.notes && it.notes.length) { y += 4; ctx.fillStyle = P.gold; ctx.font = fnt(15, 700); ctx.fillText('证词本（' + it.notes.length + ' 条）', DX + pad, y); y += 24; ctx.font = fnt(14.5);
        it.notes.forEach((n, i) => { const ls = lines(n, IW - 26); ctx.fillStyle = P.gold; ctx.fillText((i + 1) + '.', DX + pad, y); ctx.fillStyle = P.text; ls.forEach(l => { ctx.fillText(l, DX + pad + 24, y); y += 21; }); y += 5; }); }
      const full = y + QB.dscroll - (DY + 30); QB.maxD = Math.max(0, full - (DH - 66 - 30)); QB.dscroll = Math.max(0, Math.min(QB.maxD, QB.dscroll));
      ctx.restore();
      if (QB.maxD > 0) { ctx.fillStyle = P.sub; ctx.font = fnt(12.5); ctx.textAlign = 'right'; ctx.fillText(QB.dscroll < QB.maxD ? '↓ 按住往上拖看下面' : '', DX + DW - 16, DY + DH - 72); ctx.textAlign = 'left'; }
      // 按钮
      const by = DY + DH - 54, b = (x, w, t, a, hot) => { ctx.fillStyle = hot ? 'rgba(232,201,138,.9)' : P.btn; rr(x, by, w, 40, 9); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = hot ? '#1b1408' : P.gold; ctx.font = fnt(17, 700); ctx.textAlign = 'center'; ctx.fillText(t, x + w / 2, by + 21); ctx.textAlign = 'left'; QB.hits.push({ a, it, r: [x, by, w, 40] }); };
      if (it.status !== 'done') b(DX + pad, 150, it.status === 'avail' ? (QB.mode === 'board' ? '揭榜 · 去接' : '去找发话人') : '带我去', 'go', true);
      if (it.kind === 'side' && (it.status === 'doing' || it.status === 'ready')) { const on = track().includes(it.id); b(DX + pad + 166, 210, on ? '✓ 已放进任务栏' : '放进右上任务栏', 'track', false); }
    }
    ctx.restore();
  }
  drawQuest = (o => function (B) { if (S.menu && MTABS[S.menu.tab] === '任务') { try { return drawBook(B); } catch (e) { console.warn('R287 book', e); } } return o(B); })(drawQuest);
  // 换到别的页签时回到「行囊」模式
  menuUpdate = (o => function () {
    const m = S.menu; if (m && MTABS[m.tab] !== '任务' && QB.mode === 'board') QB.mode = 'book';
    if (!m || MTABS[m.tab] !== '任务' || !input.tapped || (drag && drag.moved)) return o();
    const t = input.tapped, h = !t.key && QB.hits.find(h => inR(t.x, t.y, h.r)); if (!h) return o();
    input.tapped = null; try { playSnd('ui_click'); } catch (e) {}
    if (h.a === 'filter') { QB.filter = h.k; QB.sel = null; QB.scroll = 0; QB.dscroll = 0; }
    else if (h.a === 'sel') { if (QB.sel !== h.id) QB.dscroll = 0; QB.sel = h.id; }
    else if (h.a === 'track') { const T = track(), i = T.indexOf(h.it.id); if (i >= 0) T.splice(i, 1); else { T.unshift(h.it.id); if (T.length > 2) T.length = 2; } F().qt_min = 0; }
    else if (h.a === 'go') { const it = h.it; if (it.kind === 'side') { const T = track(); if (!T.includes(it.id)) { T.unshift(it.id); if (T.length > 2) T.length = 2; } }
      if (it.status === 'avail' && QB.mode === 'board') { const q = R().SQ.find(x => x.id === it.id); F().qt_board = F().qt_board || {}; F().qt_board[it.id] = 1; toast('已揭榜：' + it.name + ' —— 去找' + (q ? q.giver[1] : '发话的人'), 2400); }
      QB.mode = 'book'; closeMenu(); F().qt_min = 0; setTimeout(() => go(it), 60); }
  })(menuUpdate);
  // 拖动 / 滚轮
  let drag = null;
  const inBook = () => S.menu && MTABS[S.menu.tab] === '任务';
  cv.addEventListener('pointerdown', e => { if (!inBook()) return; let p; try { p = toLogical(e); } catch (er) { return; }
    if (inR(p.x, p.y, QB.list)) drag = { y0: p.y, s0: QB.scroll, w: 'l', moved: false }; else if (inR(p.x, p.y, QB.detail)) drag = { y0: p.y, s0: QB.dscroll, w: 'd', moved: false }; else drag = null; });
  cv.addEventListener('pointermove', e => { if (!drag) return; let p; try { p = toLogical(e); } catch (er) { return; } const dy = p.y - drag.y0; if (Math.abs(dy) > 8) drag.moved = true;
    if (drag.moved) { if (drag.w === 'l') QB.scroll = drag.s0 - dy; else QB.dscroll = drag.s0 - dy; } });
  window.addEventListener('pointerup', () => { setTimeout(() => { drag = null; }, 0); });
  cv.addEventListener('wheel', e => { if (!inBook()) return; let p; try { p = toLogical(e); } catch (er) { return; }
    if (inR(p.x, p.y, QB.list)) { QB.scroll += e.deltaY * .7; e.preventDefault(); } else if (inR(p.x, p.y, QB.detail)) { QB.dscroll += e.deltaY * .7; e.preventDefault(); } }, { passive: false });

  // ================= 3) 任务榜：据点告示板 / 任务玉璧 / 任务执事 / 天剑宗大殿记功执事 =================
  function hookBoards() {
    const spotTo = (m, name, title) => { const n = TMAPS[m] && (TMAPS[m].npcs || []).find(n => n.name === name); if (!n || n._r287) return; n._r287 = 1;
      n.talk = async () => { openBook('board', title); }; };
    const npcTo = (m, name, title) => { const n = TMAPS[m] && (TMAPS[m].npcs || []).find(n => n.name === name && !n.hidden); if (!n || n._r287) return; n._r287 = 1; const orig = n.talk;
      n.talk = async function (a) { const k = await choose(name, ['看看任务榜（接任务）', '交任务 / 问点别的', '没事']); if (k === 0) { openBook('board', title); return; } if (k !== 1) return;
        if (typeof orig === 'function') return orig.call(this, a); const L = Array.isArray(orig) ? orig : [orig || '……']; for (const l of n.random ? [L[Math.floor(Math.random() * L.length)]] : L) await say(name, l); }; };
    spotTo('xt_sect_court', '任务告示板', '任务榜 · 玄天城天剑宗据点');
    spotTo('xt_sect_hall', '任务玉璧', '任务榜 · 据点议事堂玉璧');
    npcTo('xt_sect_hall', '任务执事', '任务榜 · 据点任务执事');
    npcTo('tj_hall', '记功执事', '任务榜 · 天剑宗记功执事');
  }
  hookBoards(); setTimeout(hookBoards, 1500); setTimeout(hookBoards, 5000);   // 有的 NPC 是后面的脚本才加进地图的
  window.R287 = { all, QB, HUD, openBook };
})();
