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

  // ================= R301 · 任务界面换成 Codex R298 的正式无字单件（字都由游戏写）=================
  // 作者 11-15：「任务栏不要用代码画，去设计一下，要好看、一目了然」——右上任务栏、独立任务簿、天剑宗悬赏榜三处都换成美术件；
  // 图没加载完之前还用原来代码画的那套（不会白屏）。行囊里的「任务」页照旧（白玉宣纸那套）。
  const AK = ['hud_top', 'hud_mid', 'hud_bot', 'card', 'strip_red', 'strip_gold', 'strip_teal', 'seal_red', 'seal_gold', 'seal_teal', 'btn_all', 'btn_all_p', 'btn_min', 'btn_min_p', 'mini', 'mini_new', 'close', 'close_p',
    'ic_xs', 'ic_jian', 'ic_yu', 'ic_mi', 'ic_loc', 'ic_stone', 'divider', 'page_l', 'page_r', 'spine', 'plaque', 'row', 'row_on', 'tab', 'tab_on', 'nowbox', 'sec', 'cell_xs', 'cell_stone', 'cell_exp', 'cell_book',
    'go', 'go_p', 'go_x', 'trk', 'trk_p', 'trk_x', 'sb_track', 'sb_thumb', 'eave', 'face', 'pillar', 'beam', 'board_plq', 'sel_outline', 'paper_y', 'paper_r', 'taken', 'seal_e', 'seal_m', 'seal_h', 'scroll', 'dplaque', 'jie', 'jie_p', 'back', 'back_p'];
  const ART = {}; for (const k of AK) { const im = new Image(); im.src = 'r301/' + k + '.webp'; ART[k] = im; }
  let artReady = false; const artOn = () => artReady || (artReady = AK.every(k => ART[k].complete && ART[k].naturalWidth > 0));
  const img = (k, x, y, w, h) => { const im = ART[k]; if (im && im.naturalWidth) ctx.drawImage(im, x, y, w || im.naturalWidth, h || im.naturalHeight); };
  const txt = (t, x, y, sz, col, wt, al) => { ctx.font = fnt(sz, wt); ctx.fillStyle = col; ctx.textAlign = al || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); ctx.textAlign = 'left'; };
  const sealK = it => it.kind === 'main' ? 'red' : (it.status === 'ready' || it.status === 'avail') ? 'gold' : 'teal';
  const sealT = it => tagOf(it)[0];
  const seal = (it, x, y, s) => { img('seal_' + sealK(it), x, y, s, s); txt(sealT(it), x + s / 2, y + s / 2 + 1, Math.round(s * .55), '#fff4dc', 800, 'center'); };
  const isBook = id => /^juan|^bk_/.test(id || '');
  const bookIc = id => /^juan[23]/.test(id) ? 'ic_jian' : /^juan[45]/.test(id) ? 'ic_yu' : 'ic_mi';
  const inm = id => (typeof ITEM_DB !== 'undefined' && ITEM_DB[id] && ITEM_DB[id].name) || id;
  function rw(it) { const q = it && it.kind !== 'main' && R() && R().SQ.find(x => x.id === it.id); const r = (q && q.reward) || {};
    const its = (r.items || []).concat(r.bonus || []); const books = its.filter(([id]) => isBook(id)), other = its.filter(([id]) => !isBook(id));
    return { xs: r.xs || 0, gold: r.gold || 0, exp: r.exp || 0, books, other, diff: (q && q.diff) || '', q }; }
  const press = { k: '', t: 0 }; const pressed = k => press.k === k && performance.now() - press.t < 180;

  // ---------- 右上任务栏 ----------
  function drawHudArt(A, rows, k, nav, navId) { HUD.body = null;
    if (F().qt_min || !rows.length) { const s = 56 * k, x = W - 12 - s, y = 12; img(A.doing.some(x => x.status === 'ready') ? 'mini_new' : 'mini', x, y, s, s);
      HUD.rect = [x - 4, y - 4, s + 8, s + 8]; HUD.hits.push({ a: 'max', r: HUD.rect }); return; }
    // 作者 11-15 23:29：「全部」不是开新界面——就在这个任务栏里原地展开，所有任务都列出来，长了按住往下拉；再点收回
    const ALL = !!F().qt_all; if (ALL) rows = A.doing.concat(A.avail);
    const N = rows.length, C = 84 * N + 8 * (N - 1), maxH = Math.max(176, (H - 12 - 118) / k), H0 = Math.min(92 + C, ALL ? maxH : 1e9), x0 = W - 12 - 340 * k, y0 = 12;
    HUD.maxS = Math.max(0, 92 + C - H0); HUD.scroll = ALL ? Math.max(0, Math.min(HUD.maxS, HUD.scroll || 0)) : 0;
    HUD.rect = [x0, y0, 340 * k, H0 * k]; const S2 = (lx, ly, lw, lh) => [x0 + lx * k, y0 + ly * k, lw * k, lh * k];
    HUD.body = ALL && HUD.maxS > 0 ? S2(0, 44, 340, H0 - 76) : null;
    ctx.save(); ctx.translate(x0, y0); ctx.scale(k, k);
    img('hud_top', 0, 0, 340, 44); const mid = ART.hud_mid; for (let y = 44; y < H0 - 32; y += 32) { const h = Math.min(32, H0 - 32 - y); ctx.drawImage(mid, 0, 0, 340, h, 0, y, 340, h); } img('hud_bot', 0, H0 - 32, 340, 32);
    txt('任务', 40, 25, 18, '#f0d596', 700); txt(ALL ? '全部 ' + A.doing.length + ' 条 · 可接 ' + A.avail.length : '点一条，自动带路', 82, 26, 12.5, '#a9b6c2');
    img(pressed('all') ? 'btn_all_p' : 'btn_all', 232, 12, 64, 26); txt(ALL ? '收起' : '全部', 264, 25.5, 14, '#ffe3a3', 700, 'center'); HUD.hits.push({ a: 'all', r: S2(226, 4, 74, 42) });
    img(pressed('min') ? 'btn_min_p' : 'btn_min', 302, 12, 26, 26); ctx.fillStyle = '#ffe3a3'; ctx.fillRect(309, 24, 12, 2.4); HUD.hits.push({ a: 'min', r: S2(298, 4, 38, 42) });
    const top = 48, bot = H0 - 36, sc = HUD.scroll;
    ctx.save(); ctx.beginPath(); ctx.rect(4, top, 334, bot - top); ctx.clip();
    rows.forEach((it, i) => { const cy = 52 + i * 92 - sc; if (cy + 84 < top || cy > bot) return; const on = nav && ((it.kind === 'main' && !navId) || it.id === navId), R2 = rw(it);
      img('card', 10, cy, 320, 84); if (on) { ctx.fillStyle = 'rgba(255,211,106,.09)'; rr(12, cy + 2, 316, 80, 6); ctx.fill(); }
      img('strip_' + sealK(it), 12, cy + 10, 3, 64); seal(it, 18, cy + 8, 24);
      txt(ell(it.name, 272 - (on ? 52 : 0)), 50, cy + 18, 17, '#ffe3a3', 700); if (on) txt('带路中', 322, cy + 18, 12.5, '#ffd36a', 700, 'right');
      ctx.font = fnt(14.5); txt(ell(it.step, 272), 50, cy + 43, 14.5, '#f2ead8');
      const bk = R2.books[0], hasXs = R2.xs > 0, locW = 142 + (hasXs ? 0 : 82) + (bk ? 0 : 28);
      if (it.where) { img('ic_loc', 50, cy + 59, 16, 16); ctx.font = fnt(12.5); txt(ell(it.where, locW), 68, cy + 68, 12.5, '#a9b9c8'); }
      if (bk) img(bookIc(bk[0]), hasXs ? 218 : 296, cy + 54, 24, 24);
      if (hasXs) { img('ic_xs', 246, cy + 54, 24, 24); txt(String(R2.xs), 274, cy + 67, 14, '#f0d596', 700); }
      const y1 = Math.max(top, cy), y2 = Math.min(bot, cy + 84); if (y2 > y1) HUD.hits.push({ a: 'go', it, r: S2(10, y1, 320, y2 - y1) }); });
    ctx.restore();
    if (HUD.maxS > 0) { const th = Math.max(30, (bot - top) * (bot - top) / (C + 8)), ty = top + (sc / HUD.maxS) * (bot - top - th);
      ctx.fillStyle = 'rgba(232,201,138,.18)'; rr(333, top, 3, bot - top, 1.5); ctx.fill(); ctx.fillStyle = 'rgba(232,201,138,.85)'; rr(333, ty, 3, th, 1.5); ctx.fill();
      if (sc < HUD.maxS - 2) txt('↓ 按住往上拖看下面', 170, H0 - 15, 11.5, '#a9b6c2', 400, 'center'); }
    else if (nav) txt('◆ 自动寻路中 · 走动或点地面取消', 170, H0 - 15, 11.5, '#ffd36a', 400, 'center');
    ctx.restore();
  }

  // ---------- 独立任务簿 ----------
  const SEC = (t, x, y) => { img('sec', x, y, 112, 26); txt(t, x + 56, y + 13.5, 13.5, '#f0d596', 700, 'center'); };
  function drawBookArt() { const A = all(); QB.hits = [];
    ctx.save(); ctx.fillStyle = 'rgba(4,6,10,.72)'; ctx.fillRect(0, 0, W, H);
    img('page_l', 100, 90, 540, 600); img('page_r', 640, 90, 540, 600); img('spine', 620, 90, 40, 600);
    img('plaque', 500, 24, 280, 60); txt('任 务 簿', 640, 55, 25, '#f6dfa4', 700, 'center');
    img(pressed('close') ? 'close_p' : 'close', 1144, 48, 32, 32); ctx.strokeStyle = '#f0d596'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(1154, 58); ctx.lineTo(1166, 70); ctx.moveTo(1166, 58); ctx.lineTo(1154, 70); ctx.stroke();
    QB.hits.push({ a: 'close', r: [1136, 40, 48, 48] }); SOLO.bounds = [100, 24, 1080, 666];
    // 页签
    [['doing', '进行中', A.doing.length], ['avail', '可接', A.avail.length], ['done', '已完成', A.done.length]].forEach(([k, n, c], i) => { const x = 156 + i * 120, on = QB.filter === k;
      img(on ? 'tab_on' : 'tab', x, 124, 112, 32); txt(n + ' ' + c, x + 56, 141, 15, on ? '#ffe3a3' : '#b9b2a2', 700, 'center'); QB.hits.push({ a: 'filter', k, r: [x, 120, 112, 40] }); });
    // 列表
    const items = A[QB.filter] || []; if (!QB.sel || !items.find(x => x.id === QB.sel)) QB.sel = items[0] ? items[0].id : null;
    const LX = 156, LY = 164, LW = 360, LH = 496, ST = 72, total = items.length * ST - 8; QB.maxS = Math.max(0, total - LH); QB.scroll = Math.max(0, Math.min(QB.maxS, QB.scroll)); QB.list = [LX, LY, LW + 40, LH];
    ctx.save(); ctx.beginPath(); ctx.rect(LX - 4, LY - 2, LW + 8, LH + 4); ctx.clip();
    if (!items.length) txt(QB.filter === 'avail' ? '这一带暂时没有能接的事。' : QB.filter === 'done' ? '还没有办完的支线。' : '眼下没有在做的任务。', LX + 10, LY + 30, 16, '#b9b2a2');
    items.forEach((it, i) => { const y = LY + i * ST - QB.scroll; if (y + 64 < LY || y > LY + LH) return; const on = it.id === QB.sel;
      img(on ? 'row_on' : 'row', LX, y, 360, 64); seal(it, LX + 10, y + 10, 24);
      ctx.font = fnt(17, 700); txt(ell(it.name, 230), LX + 46, y + 22, 17, on ? '#ffe3a3' : '#f2ead8', 700);
      txt(it.region || '', LX + 346, y + 22, 12.5, '#a9b3bd', 400, 'right');
      ctx.font = fnt(13.5); txt(ell(it.step, 296), LX + 46, y + 46, 13.5, '#cfc6b4');
      QB.hits.push({ a: 'sel', id: it.id, r: [LX, Math.max(LY, y), LW, Math.min(y + 64, LY + LH) - Math.max(LY, y)] }); });
    ctx.restore();
    img('sb_track', 548, 164, 6, 496);
    if (QB.maxS > 0) { const th = Math.max(40, LH * LH / (total + 8)), tY = LY + (QB.scroll / QB.maxS) * (LH - th); img('sb_thumb', 548, tY, 6, th); }
    // 身上的悬赏点 / 灵石（左页底边）
    img('ic_xs', 118, 44, 24, 24); txt('悬赏点 ' + ((S.hero && S.hero.xs) || 0), 146, 57, 15, '#f0d596', 700);
    img('ic_stone', 250, 41, 30, 30); txt('灵石 ' + ((S.hero && S.hero.gold) || 0), 282, 57, 15, '#f0d596', 700);
    // 右页详情
    const it = items.find(x => x.id === QB.sel);
    if (it) { const R2 = rw(it);
      seal(it, 692, 132, 26); ctx.font = fnt(25, 700); txt(ell(it.name, 300), 728, 146, 25, '#f6dfa4', 700);
      txt([it.kind === 'main' ? '主线' : '支线', it.region, R2.diff, { doing: '进行中', ready: '可以交了', avail: '可以接', done: '已完成' }[it.status]].filter(Boolean).join(' · '), 1132, 148, 13, '#a9b3bd', 400, 'right');
      img('divider', 692, 168, 300, 20);
      const CX = 680, CY = 192, CW = 464, CH = 418; QB.detail = [CX, CY, CW, CH];
      ctx.save(); ctx.beginPath(); ctx.rect(CX, CY, CW, CH); ctx.clip();
      let y = 198 - QB.dscroll;
      img('nowbox', 692, y, 440, 80); txt(it.status === 'done' ? '结果' : '现在该做', 708, y + 17, 13.5, '#e8c98a', 700);
      ctx.font = fnt(18, 600); const sl = lines(it.step, 410, 2); sl.forEach((l, i) => txt(l, 708, y + (sl.length > 1 ? 41 + i * 23 : 51), 18, '#fff2d6', 600)); y += 96;
      if (it.where) { SEC('地点', 692, y); y += 34; img('ic_loc', 692, y, 22, 22); ctx.font = fnt(15.5); const wl = lines(it.where, 400); wl.forEach((l, i) => txt(l, 722, y + 12 + i * 22, 15.5, '#efe6d2')); y += wl.length * 22 + 6;
        if (it.kind === 'side' && it.giverWhere && it.giverWhere !== it.where) { txt('发话人在：' + it.giverWhere, 722, y + 8, 13.5, '#a9b3bd'); y += 26; } y += 6; }
      const cells = []; if (R2.xs) cells.push(['cell_xs', 'ic_xs', '悬赏点 ' + R2.xs]); if (R2.gold) cells.push(['cell_stone', 'ic_stone', '灵石 ' + R2.gold]); if (R2.exp) cells.push(['cell_exp', '', '经验 +' + R2.exp]);
      for (const [id, n] of R2.books) cells.push(['cell_book', bookIc(id), inm(id) + (n > 1 ? ' ×' + n : '')]);
      if (R2.other.length) cells.push(['cell_book', '', R2.other.map(([id, n]) => inm(id) + (n > 1 ? '×' + n : '')).join('、')]);
      if (cells.length) { SEC('奖励', 692, y); y += 33;
        cells.forEach(([bg, ic, t], i) => { const x = 692 + (i % 2) * 220, yy = y + Math.floor(i / 2) * 64; img(bg, x, yy, 212, 56);
          if (ic === 'ic_stone') img(ic, x + 8, yy + 12, 32, 32); else if (ic) img(ic, x + 12, yy + 16, 24, 24);
          ctx.font = fnt(15.5); txt(ell(t, ic ? 156 : 186), x + (ic ? 46 : 16), yy + 29, 15.5, '#f2ead8'); });
        y += Math.ceil(cells.length / 2) * 64 + 10; }
      if (it.desc) { SEC(it.kind === 'main' ? '章节' : '来龙去脉', 692, y); y += 36; ctx.font = fnt(15); lines(it.desc, 436).forEach(l => { txt(l, 692, y, 15, '#e6dccb'); y += 22; }); y += 8; }
      if (it.notes && it.notes.length) { SEC('证词本', 692, y); txt(it.notes.length + ' 条', 812, y + 13, 13, '#a9b3bd'); y += 36; ctx.font = fnt(14.5);
        it.notes.forEach((n, i) => { const ls = lines(n, 412); txt((i + 1) + '.', 692, y, 14.5, '#e8c98a', 700); ls.forEach(l => { txt(l, 716, y, 14.5, '#e6dccb'); y += 21; }); y += 5; }); }
      const full = y + QB.dscroll - 198; QB.maxD = Math.max(0, full - CH + 10); QB.dscroll = Math.max(0, Math.min(QB.maxD, QB.dscroll));
      ctx.restore();
      if (QB.maxD > 0 && QB.dscroll < QB.maxD) txt('↓ 按住往上拖看下面', 1132, 612, 12, '#a9b3bd', 400, 'right');
      // 两个按钮
      const done = it.status === 'done';
      img(done ? 'go_x' : pressed('go') ? 'go_p' : 'go', 692, 624, 168, 44); txt(done ? '已办完' : it.status === 'avail' ? '去找发话人' : '带我去', 776, 646.5, 17, done ? '#8f8a80' : '#ffe3a3', 700, 'center');
      if (!done) QB.hits.push({ a: 'go', it, r: [692, 624, 168, 44] });
      if (it.kind === 'side') { const can = it.status === 'doing' || it.status === 'ready', onT = track().includes(it.id);
        img(!can ? 'trk_x' : pressed('track') ? 'trk_p' : 'trk', 880, 624, 204, 44); txt(onT ? '✓ 已在任务栏' : '放进任务栏', 982, 646.5, 17, can ? '#ffe3a3' : '#8f8a80', 700, 'center');
        if (can) QB.hits.push({ a: 'track', it, r: [880, 624, 204, 44] }); }
    } else QB.detail = null;
    ctx.restore(); }

  // ---------- 天剑宗悬赏榜 ----------
  const SLOTS = [[120, 198, -2], [280, 198, 1], [440, 198, -1], [600, 198, 2], [120, 406, 1], [280, 406, -2], [440, 406, 3], [600, 406, -1]];
  function drawBoardArt() { const A = all(); QB.hits = []; QB.list = null;
    ctx.save(); ctx.fillStyle = 'rgba(4,6,10,.72)'; ctx.fillRect(0, 0, W, H);
    img('pillar', 54, 146, 60, 540); img('pillar', 750, 146, 60, 540); img('face', 104, 170, 660, 460); img('beam', 54, 622, 760, 36); img('eave', 24, 34, 800, 120);
    img('board_plq', 234, 62, 380, 60); txt('天剑宗 · 悬赏榜', 424, 93, 24, '#f6dfa4', 700, 'center');
    img(pressed('close') ? 'close_p' : 'close', 1216, 26, 32, 32); ctx.strokeStyle = '#f0d596'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(1226, 36); ctx.lineTo(1238, 48); ctx.moveTo(1238, 36); ctx.lineTo(1226, 48); ctx.stroke();
    QB.hits.push({ a: 'close', r: [1208, 18, 48, 48] }); SOLO.bounds = [24, 18, 1232, 660];
    const taken = A.doing.filter(x => x.kind === 'side' && F().qt_board && F().qt_board[x.id]);
    const list = A.avail.slice(0, 8), rest = taken.slice(0, 8 - list.length);
    if (!QB.sel || !list.find(x => x.id === QB.sel)) QB.sel = list[0] ? list[0].id : null;
    if (!list.length) txt('榜上暂时没有新的悬赏——过些日子再来看看。', 434, 300, 18, '#f0e2c0', 600, 'center');
    list.forEach((it, i) => { const [x, y, deg] = SLOTS[i], R2 = rw(it), hard = R2.diff === '困难', on = it.id === QB.sel;
      ctx.save(); ctx.translate(x + 75, y + 7); ctx.rotate(deg * Math.PI / 180); ctx.translate(-75, -7);
      if (on) img('sel_outline', -4, -4, 158, 198);
      img(hard ? 'paper_r' : 'paper_y', 0, 0, 150, 190);
      const ink = hard ? '#5a1810' : '#3a2610';
      ctx.font = fnt(15.5, 700); txt(ell(it.name, 128), 75, 36, 15.5, ink, 700, 'center');
      const sk = hard ? 'seal_h' : R2.diff === '中等' ? 'seal_m' : 'seal_e'; img(sk, 55, 58, 40, 40); txt(hard ? '难' : R2.diff === '中等' ? '中' : '简', 75, 79, 20, '#fff1e0', 800, 'center');
      const q = R2.q; ctx.font = fnt(12.5); const gl = lines((q && q.goal) || it.step, 128, 2); gl.forEach((l, j) => txt(l, 75, 118 + j * 17 - (gl.length - 1) * 8, 12.5, ink, 400, 'center'));
      if (R2.xs) { img('ic_xs', 44, 148, 24, 24); txt(String(R2.xs), 72, 161, 18, ink, 700); }
      ctx.restore(); QB.hits.push({ a: 'sel', id: it.id, r: [x, y, 150, 190] }); });
    rest.forEach((it, j) => { const [x, y] = SLOTS[list.length + j]; img('taken', x, y, 150, 190); txt('已揭榜', x + 75, y + 96, 18, '#e8c98a', 700, 'center'); txt(ell(it.name, 130), x + 75, y + 122, 12.5, '#c9b48a', 400, 'center'); });
    // 榜文详情
    img('scroll', 864, 104, 352, 560); img('dplaque', 930, 128, 220, 44); txt('榜文详情', 1040, 151, 18, '#f6dfa4', 700, 'center');
    const it = list.find(x => x.id === QB.sel), DK = '#3a2610', SUB = '#6a5236';
    const SECL = (t, y) => { img('sec', 892, y, 112, 26); txt(t, 948, y + 13.5, 13.5, '#f0d596', 700, 'center'); };
    if (it) { const R2 = rw(it), q = R2.q, hard = R2.diff === '困难';
      ctx.font = fnt(20, 700); txt(ell(it.name, 250), 900, 208, 20, DK, 700);
      if (R2.diff) { const sk = hard ? 'seal_h' : R2.diff === '中等' ? 'seal_m' : 'seal_e'; img(sk, 1156, 192, 32, 32); txt(hard ? '难' : R2.diff === '中等' ? '中' : '简', 1172, 209, 16, '#fff1e0', 800, 'center'); }
      SECL('委托', 244); ctx.font = fnt(14.5); const dl = lines(it.desc || (q && q.goal) || it.step, 290, 2); dl.forEach((l, i) => txt(l, 900, 288 + i * 22, 14.5, DK));
      SECL('地点', 328); ctx.font = fnt(14.5); txt(ell((q && q.where) || it.where || it.giverWhere || '', 290), 900, 372, 14.5, DK);
      SECL('奖励', 396);
      const rows = []; if (R2.xs) rows.push(['ic_xs', '悬赏点 ' + R2.xs]); if (R2.gold) rows.push(['ic_stone', '灵石 ' + R2.gold]); for (const [id, n] of R2.books) rows.push([bookIc(id), inm(id) + (n > 1 ? ' ×' + n : '')]);
      if (rows.length < 3 && R2.exp) rows.push(['', '经验 +' + R2.exp]); if (rows.length < 3 && R2.other.length) rows.push(['', R2.other.map(([id, n]) => inm(id) + (n > 1 ? '×' + n : '')).join('、')]);
      rows.slice(0, 3).forEach(([ic, t], i) => { const yy = 438 + i * 40; if (ic === 'ic_stone') img(ic, 898, yy - 4, 30, 30); else if (ic) img(ic, 900, yy, 24, 24); ctx.font = fnt(15); txt(ell(t, 230), 938, yy + 12, 15, DK); });
      img(pressed('go') ? 'jie_p' : 'jie', 890, 590, 168, 44); txt('揭 榜', 974, 612.5, 18, '#ffe3a3', 700, 'center'); QB.hits.push({ a: 'go', it, r: [890, 590, 168, 44] });
    } else txt(list.length ? '点一张榜文看详情' : '', 1040, 380, 15, SUB, 400, 'center');
    img(pressed('close2') ? 'back_p' : 'back', 1080, 590, 96, 40); txt('返回', 1128, 610.5, 16, '#ffe3a3', 700, 'center'); QB.hits.push({ a: 'close', k: 2, r: [1080, 590, 96, 40] });
    ctx.restore(); }

  // ================= 1) 右上任务栏 =================
  const HUD = { hits: [], rect: null };
  function drawHud() {
    HUD.hits = []; HUD.rect = null;
    if (!R() || S.hud === false || S.menu || !world.map || S.scene !== drawMap) return;
    const A = all(), M = A.doing.find(x => x.kind === 'main'), rows = (M ? [M] : []).concat(hudSides(A));
    const k = PHONE ? 1.2 : 1, W0 = 318, now = performance.now(), nav = !!(window.QUEST_NAV && QUEST_NAV.on), navId = R().navId && R().navId();
    if (artOn()) { drawHudArt(A, rows, k, nav, navId); try { if (window.R165Q && R165Q.UI) R165Q.UI.panel = HUD.rect; } catch (e) {} return; }
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
      input.tapped = null; if (HUD.dragT && performance.now() - HUD.dragT < 250) return; const h = HUD.hits.find(h => inR(t.x, t.y, h.r));
      if (h && h.a === 'go' && HUD.body && inR(t.x, t.y, HUD.body)) { HUD.pending = h; return; }   // 展开后的列表：松手时没拖动才算点（按下就带路会和拖动打架）
      if (h) { try { playSnd('ui_click'); } catch (e) {}
        press.k = h.a; press.t = performance.now();
        if (h.a === 'max') F().qt_min = 0; else if (h.a === 'min') { F().qt_min = 1; F().qt_all = 0; } else if (h.a === 'all') { F().qt_all = F().qt_all ? 0 : 1; HUD.scroll = 0; } else if (h.a === 'book') openSolo('book'); else if (h.a === 'go') go(h.it); }
      return; }
    return o.apply(this, arguments);
  })(updateMap);

  // 展开后按住拖动 / 滚轮翻任务栏
  { let hd = null;
    cv.addEventListener('pointerdown', e => { if (!HUD.body) return; let p; try { p = toLogical(e); } catch (er) { return; } if (inR(p.x, p.y, HUD.body)) hd = { y0: p.y, s0: HUD.scroll || 0, moved: false }; });
    cv.addEventListener('pointermove', e => { if (!hd) return; let p; try { p = toLogical(e); } catch (er) { return; } const dy = p.y - hd.y0; if (Math.abs(dy) > 8) hd.moved = true;
      if (hd.moved) { HUD.scroll = Math.max(0, Math.min(HUD.maxS || 0, hd.s0 - dy / (PHONE ? 1.2 : 1))); HUD.dragT = performance.now(); input.down = false; } });
    window.addEventListener('pointerup', () => { const pend = HUD.pending; HUD.pending = null; if (hd && hd.moved) HUD.dragT = performance.now(); else if (pend) { try { playSnd('ui_click'); } catch (e) {} go(pend.it); } hd = null; });
    cv.addEventListener('wheel', e => { if (!HUD.body) return; let p; try { p = toLogical(e); } catch (er) { return; } if (!inR(p.x, p.y, HUD.body)) return; HUD.scroll = Math.max(0, Math.min(HUD.maxS || 0, (HUD.scroll || 0) + e.deltaY * .6)); e.preventDefault(); }, { passive: false }); }

  // ================= 2) 行囊 · 任务页（也是任务榜） =================
  const QB = { mode: 'book', filter: 'doing', sel: null, scroll: 0, dscroll: 0, hits: [], list: null, detail: null, title: '', maxS: 0, maxD: 0 };
  function openBook(mode, title) {
    if (!S.menu) openMenu(); S.menu.tab = MTABS.indexOf('任务'); QB.mode = mode || 'book'; QB.title = title || ''; QB.filter = mode === 'board' ? 'avail' : 'doing'; QB.sel = null; QB.scroll = 0; QB.dscroll = 0; }
  window.QBOOK_OPEN = openBook;
  function pal() { const light = !QB.solo && !window.BAG_DARK; /* 行囊默认是白玉宣纸（浅色）*/ return light
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
    const t = input.tapped; if (t.key || !tapBook(t)) return o(); input.tapped = null;
  })(menuUpdate);
  function tapBook(t) { const h = QB.hits.find(h => inR(t.x, t.y, h.r)); if (!h) return false;
    try { playSnd('ui_click'); } catch (e) {}
    press.k = h.a + (h.k || ''); press.t = performance.now();
    if (h.a === 'close') { setTimeout(closeSolo, 90); return true; }
    if (h.a === 'filter') { QB.filter = h.k; QB.sel = null; QB.scroll = 0; QB.dscroll = 0; }
    else if (h.a === 'sel') { if (QB.sel !== h.id) QB.dscroll = 0; QB.sel = h.id; }
    else if (h.a === 'track') { const T = track(), i = T.indexOf(h.it.id); if (i >= 0) T.splice(i, 1); else { T.unshift(h.it.id); if (T.length > 2) T.length = 2; } F().qt_min = 0; }
    else if (h.a === 'go') { const it = h.it; if (it.kind === 'side') { const T = track(); if (!T.includes(it.id)) { T.unshift(it.id); if (T.length > 2) T.length = 2; } }
      if (it.status === 'avail' && QB.mode === 'board') { const q = R().SQ.find(x => x.id === it.id); F().qt_board = F().qt_board || {}; F().qt_board[it.id] = 1; toast('已揭榜：' + it.name + ' —— 去找' + (q ? q.giver[1] : '发话的人'), 2400); }
      QB.mode = 'book'; if (QB.solo) closeSolo(); else closeMenu(); F().qt_min = 0; setTimeout(() => go(it), 60); }
    return true; }
  // ---------- 独立任务簿（作者 11-15：任务不要和行囊绑在一起；右上「全部」、据点告示板都开这个，不弹整个行囊）----------
  const SB = { x: 100, y: 64, w: 1080, h: 600 };
  let SOLO = null;
  function drawSolo() { if (artOn()) { try { return QB.mode === 'board' ? drawBoardArt() : drawBookArt(); } catch (e) { console.warn('R301 solo', e); } } SOLO.bounds = null; const P = pal(), B = SB;
    ctx.save(); ctx.fillStyle = 'rgba(4,6,10,.74)'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, B.y, 0, B.y + B.h); g.addColorStop(0, '#1b2028'); g.addColorStop(1, '#10141a');
    ctx.fillStyle = g; rr(B.x - 18, B.y - 46, B.w + 36, B.h + 64, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(226,190,112,.75)'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = 'rgba(226,190,112,.25)'; ctx.lineWidth = 1; rr(B.x - 11, B.y - 39, B.w + 22, B.h + 50, 12); ctx.stroke();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = '#f0d596'; ctx.font = fnt(24, 700); ctx.fillText(QB.mode === 'board' ? '悬 赏 榜' : '任 务 簿', W / 2, B.y - 16);
    ctx.textAlign = 'left'; ctx.font = fnt(15, 600); ctx.fillStyle = '#e8c98a'; ctx.fillText('悬赏点 ' + ((S.hero && S.hero.xs) || 0) + '　　灵石 ' + ((S.hero && S.hero.gold) || 0), B.x + 4, B.y - 16);
    const cx = B.x + B.w - 70, cy = B.y - 32; ctx.fillStyle = 'rgba(255,255,255,.07)'; rr(cx, cy, 74, 32, 8); ctx.fill(); ctx.strokeStyle = 'rgba(226,190,112,.6)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#ffe3a3'; ctx.font = fnt(16, 700); ctx.textAlign = 'center'; ctx.fillText('关 闭', cx + 37, cy + 16); SOLO.close = [cx - 6, cy - 6, 86, 44];
    ctx.restore(); drawBook(B); }
  function closeSolo() { if (!SOLO) return; const i = S.overlay.indexOf(SOLO.layer); if (i >= 0) S.overlay.splice(i, 1); cv.removeEventListener('pointerup', SOLO.up); S.hud = SOLO.hud0; world.locked = SOLO.lock0; SOLO = null; QB.solo = false; QB.mode = 'book'; setTimeout(() => { input.tapped = null; }, 0); }
  function openSolo(mode, title) {
    if (SOLO) return; if (S.menu) closeMenu();
    QB.solo = true; QB.mode = mode || 'book'; QB.title = title || ''; QB.filter = mode === 'board' ? 'avail' : 'doing'; QB.sel = null; QB.scroll = 0; QB.dscroll = 0;
    SOLO = { layer: { draw() { try { drawSolo(); } catch (e) { console.warn('R287 solo', e); } } }, hud0: S.hud, lock0: world.locked };
    S.hud = false; world.locked = true; S.overlay.push(SOLO.layer); input.tapped = null;
    SOLO.up = e => { if (!SOLO) return; setTimeout(() => { input.tapped = null; }, 0); if (drag && drag.moved) return; let p; try { p = toLogical(e); } catch (er) { return; }
      if (inR(p.x, p.y, SOLO.close) || !inR(p.x, p.y, SOLO.bounds || [SB.x - 18, SB.y - 46, SB.w + 36, SB.h + 64])) { try { playSnd('ui_click'); } catch (e2) {} return closeSolo(); }
      tapBook(p); };
    setTimeout(() => { if (SOLO) cv.addEventListener('pointerup', SOLO.up); }, 120); }
  window.QSOLO_OPEN = openSolo;
  // 拖动 / 滚轮
  let drag = null;
  const inBook = () => QB.solo || (S.menu && MTABS[S.menu.tab] === '任务');
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
      n.talk = async () => { openSolo('board', title); }; };
    const npcTo = (m, name, title) => { const n = TMAPS[m] && (TMAPS[m].npcs || []).find(n => n.name === name && !n.hidden); if (!n || n._r287) return; n._r287 = 1; const orig = n.talk;
      n.talk = async function (a) { const k = await choose(name, ['看看任务榜（接任务）', '交任务 / 问点别的', '没事']); if (k === 0) { openSolo('board', title); return; } if (k !== 1) return;
        if (typeof orig === 'function') return orig.call(this, a); const L = Array.isArray(orig) ? orig : [orig || '……']; for (const l of n.random ? [L[Math.floor(Math.random() * L.length)]] : L) await say(name, l); }; };
    spotTo('xt_sect_court', '任务告示板', '任务榜 · 玄天城天剑宗据点');
    spotTo('xt_sect_hall', '任务玉璧', '任务榜 · 据点议事堂玉璧');
    npcTo('xt_sect_hall', '任务执事', '任务榜 · 据点任务执事');
    npcTo('tj_hall', '记功执事', '任务榜 · 天剑宗记功执事');
  }
  hookBoards(); setTimeout(hookBoards, 1500); setTimeout(hookBoards, 5000);   // 有的 NPC 是后面的脚本才加进地图的
  window.R287 = { all, QB, HUD, openBook, openSolo, closeSolo };
})();
