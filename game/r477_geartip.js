// ================= R477 · 装备详情框（只进测试版）=================
// 作者 11-28 23:16 看了「断金切玉 +5」的详情框：「你这个装备排列让我看都看不懂……QQ华夏、剑网三的装备怎么排列的？你这样弄在一起根本就没法看。」
// 原来：副属性、灵窍、强化、灵韵、说明全写成一大段字挤在一起（r467 的 descOf 拼出来的那段）。
// 现在：照网游的排法——分区、一条一行、颜色区分。全游戏看装备详情都走这一个文件：
//   GEAR_TIP.open(id, 选项)      弹出的详情框（深色描金底，和原来行囊里那款一样；内容多了自动变高，再多就能上下滑，不缩字）
//   GEAR_TIP.inline(id, x, y, w, h, 选项)   嵌在别的面板里（铁匠铺右边那一栏），排法、颜色一模一样，只是没有外框
//   GEAR_TIP.brief(id)           一句话的简介（行囊下面那一条、获得物品框里那一行用：「红装 · 副属性 5 条 · 灵窍 3 · +5」）
//   GEAR_TIP.hot(id, 方框, 选项)  在这一帧登记「这里画着一件装备」：长按（手机）/ 右键（电脑）弹详情；选项 tap:true 时点一下就弹
// 从上到下七个区（没有的区整个不画），区与区之间一条淡淡的分隔线：
//   1 抬头：图标 + 名字（按品级上色）+「+5」；第二行小字：部位 · 境界档 + 品级字样
//   2 主属性：大一号的白字，一条一行；和身上那件比的 ▲▼ 写在每行右边（绿涨红跌）
//   3 副属性：一条一行，淡蓝；特殊类（吸血、反震、定心、先机、怒意、克制）淡紫；极品那条行尾挂一个小「极」字
//   4 灵窍：小标题「灵窍 3」，每个窍一行，前面小圆点按五行上色；空窍「○ 空窍」灰色
//   5 强化：「强化 +3」（作者 23:31：不用星星，直接写几级）+ 下一行强化带来的那一条
//   6 灵韵（只有金装有）：金色小标题「灵韵 · 连斩」+ 金色说明
//   7 说明：灰色斜体的物品描述；最后一行小字「需要 6 级」（等级不够写红色）
// 调用的地方：r103（行囊·装备页点装备）、本文件（行囊·背包页点装备）、r389_panel（装备面板）、r402_shop（铁匠铺）、
//   r467_gearfuse（剑炉：装备格子长按 / 右键，右边那件点图标或「详情」）、itemget_frame（获得物品：点那一行）。
(function () {
  const KIT = window.R386_KIT;
  if (!KIT || typeof ITEM_DB === 'undefined' || typeof S === 'undefined' || typeof cv === 'undefined') return;
  const { BR, KAI, NUM } = KIT;
  const GF = () => window.GEARFUSE, CR = () => window.CRAFT, G6 = () => window.GEAR6;
  const KEYS = ['atk', 'def', 'maxhp', 'maxmp', 'spd'];
  const SN = { atk: '攻击', def: '防御', maxhp: '气血', maxmp: '灵力', spd: '身法' };
  const SLOT_CN = { weapon: '武器', wrist: '护腕', armor: '衣服', shoe: '鞋子', acc: '饰品' };
  // ---- 颜色（深色底上用）----
  const COL = {
    main: '#f4efe4',          // 主属性：白
    sub: '#9fd0ff',           // 副属性：淡蓝
    sp: '#d2b2ff',            // 特殊类副属性：淡紫
    top: '#ffd75a',           // 「极」字徽记的底
    title: '#c8b37c',         // 小标题（灵窍 3）
    dim: '#7d8687',           // 空窍、暗星、小注
    up: '#8fe08a', down: '#ff8a7a',
    star: '#ffd75a',              // 强化几级、名字后面的 +5
    bonus: '#a8e08f',         // 强化带来的那一条
    ly: '#ffd75a', lyText: '#f0d58a',
    set: '#9fd4c0',           // 套装
    lore: '#a89a86',          // 说明：淡褐灰
    head2: '#a6aea6', line: 'rgba(194,173,120,.26)' };
  // 灵窍小圆点：金黄、木绿、水蓝、火红、土褐
  const ELC = { jin: '#f2cf4a', mu: '#6fd36a', shui: '#58a8ff', huo: '#ff5b45', tu: '#b98a55' };
  const ELN = { jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' };
  const SPECIAL = { xx: 1, fz: 1, dx: 1, xj: 1, ny: 1, ke: 1 };
  const baseName = s => String(s || '').replace(/ \+\d+$/, '').replace(/（(下品|中品|上品|极品|绝品)）$/, '');
  const hero = () => S.hero || {};
  const refLv = id => { try { const f = GF(); if (f && f.refLv) return f.refLv(id); } catch (e) {} return ((hero().refine || {})[id]) || 0; };

  // =====================================================================================================
  // 一、读一件装备：拆成七个区要的东西
  // =====================================================================================================
  function autoCmp(id) { const it = ITEM_DB[id]; if (!it || !it.slot) return null; const w = (hero().equip || {})[it.slot]; return w && w !== id && ITEM_DB[w] ? w : null; }
  function model(id, o) {
    const it = ITEM_DB[id]; if (!it || !it.slot) return null; o = o || {};
    const f = GF(), cr = CR(), g6 = G6(), lv = refLv(id);
    const cmp = o.cmp === undefined || o.cmp === 'auto' ? autoCmp(id) : (o.cmp && o.cmp !== id && ITEM_DB[o.cmp] ? o.cmp : null), ci = cmp ? ITEM_DB[cmp] : null;
    const M = { id, it, lv, cmp, cmpName: ci ? ci.name : '', cmpWho: o.who || '' };
    // 1 抬头
    let gi = -1; try { gi = f ? f.gradeOf(id) : -1; } catch (e) {}
    const gw = f && gi >= 0 ? f.GRADES[gi][0] + '装' : '';
    let tier = ''; const xian = !!(f && f.XIAN && f.XIAN[id]);
    try { if (xian) tier = '仙器'; else { const t = (g6 && g6.tierOf(id)) || (f && f.tierOfId ? f.tierOfId(id) : ((it.lvReq || 0) >= 11 ? 2 : 1)); tier = (g6 && g6.TIER_CN && g6.TIER_CN[t]) || ['', '练气档', '凝丹档'][t] || ''; } } catch (e) {}
    M.head = { name: baseName(it.name), col: (window.GEAR_COL && GEAR_COL(id)) || '#e9d9a8', slot: SLOT_CN[it.slot] || '', tier, gw, wx: (window.WX5 && WX5.GEAR && WX5.GEAR[id] && WX5.WX[WX5.GEAR[id]]) ? WX5.WX[WX5.GEAR[id]].n + '性' : '',
      only: !!it.heroOnly || (window.ALLY_EQ_OK && !ALLY_EQ_OK(id)) };
    // 2 主属性
    M.main = KEYS.filter(k => it[k] || (ci && ci[k])).map(k => { const v = it[k] || 0; return { k, n: SN[k], v, d: ci ? v - (ci[k] || 0) : null }; });
    // 3 副属性
    M.subs = []; M.note = '';
    try { if (f && cr) { const t = f.tierOfId ? f.tierOfId(id) : 1;
      for (const ln of f.linesOf(id)) { const [k, v] = cr.parse(ln); M.subs.push({ t: cr.subText(k, v), sp: !!SPECIAL[k], top: f.isTop ? f.isTop(ln, t) : false }); } } } catch (e) {}
    if (it.r467shop) M.note = '买到手随机带一两样：副属性或者灵窍（到手才知道）';
    // 4 灵窍
    M.socks = [];
    try { if (f && f.socksOf(id)) { for (const tok of f.gemsOf(id)) { if (!tok) { M.socks.push(null); continue; }
        const s = String(tok), l = f.tokLine(s, it.slot), mat = s.startsWith('m:'), gid = mat ? s.split(':')[1] : (f.tokItem ? f.tokItem(s) : cr.gemId(s.replace(/\d+$/, ''), +((/(\d+)$/.exec(s) || [])[1] || 1)));
        let el = mat ? ((/^(?:el|res)_(\w+)$/.exec(l ? l[0] : '') || [])[1] || (window.WX5 && WX5.GEAR && WX5.GEAR[gid]) || ((cr.MAT || {})[gid] || {}).wx) : s.replace(/\d+$/, '');
        M.socks.push({ el, name: (ITEM_DB[gid] || {}).name || '灵珠', eff: l ? cr.subText(l[0], l[1]) : '' }); } } } catch (e) {}
    // 5 强化
    if (lv > 0) { let bonus = ''; try { const p = f && f.PLUS5 ? f.PLUS5(it.slot) : ({ weapon: 1, wrist: 1, acc: 1 }[it.slot] ? ['crit', 3] : ['guard', 3]); bonus = cr.subText(p[0], p[1]); } catch (e) {}
      M.ref = { lv, max: 5, bonus, done: lv >= 5 }; }
    // 6 灵韵
    try { const r = f && f.recOf(id); if (r && r.ly && f.LYI[r.ly]) M.ly = { k: r.ly, n: f.LYI[r.ly].n, d: f.LYI[r.ly].d };
      if (r && r.leg) { const t = KEYS.filter(k => r.leg[k]).map(k => SN[k] + ' +' + r.leg[k]).join('、'); if (t) M.leg = '旧珠余韵：' + t + '（老存档里镶过的灵珠化进了这件装备，已算在主属性里）'; } } catch (e) {}
    // 套装
    try { const st = window.GEAR5 && GEAR5.setOfItem(it.base || ((hero().fg || {})[id] || {}).b || id); if (st) M.set = { n: st.name + '套装', t: (st.parts ? '四件齐：' : '') + st.text }; } catch (e) {}
    // 7 说明
    let lore = ''; try { lore = it.lore467 !== undefined ? it.lore467 : it.desc; } catch (e) {}
    lore = String(lore || '').replace(/（需要[^）]*）/g, '').replace(/^【[^】]*】/, '').replace(/^买到手随机[^。]*。/, '').trim();
    { const L2 = window.EQUIP_LORE && EQUIP_LORE[it.base || ((hero().fg || {})[id] || {}).b || id]; if (L2 && lore.length < 24) lore = L2; }   // 原来的一句太短：换成行囊原来写的来历
    M.lore = lore; M.req = it.lvReq || 0; M.reqOk = (hero().lv || 1) >= M.req;
    return M; }

  // 一句话的简介：放在只有一两行地方的（行囊下面那一条、获得物品框、装备面板下面那一栏）
  function brief(id) { const M = model(id, { cmp: null }); if (!M) return ''; const a = [];
    if (M.head.gw) a.push(M.head.gw); a.push(M.subs.length ? '副属性 ' + M.subs.length + ' 条' : M.note ? '随机带一两样' : '没有副属性');
    if (M.socks.length) a.push('灵窍 ' + M.socks.length); if (M.lv) a.push('强化 +' + M.lv); if (M.ly) a.push('灵韵「' + M.ly.n + '」');
    return a.join(' · '); }

  // =====================================================================================================
  // 二、排版：把一件装备排成一行一行（每行记着高度和怎么画），弹框、嵌入两种用法共用
  // =====================================================================================================
  const F = (sz, wt, it, fam) => (it ? 'italic ' : '') + (wt || 500) + ' ' + sz + 'px ' + (fam || KAI());
  function txt(s, x, y, font, col, align) { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); return ctx.measureText(s).width; }
  function wrapLines(s, w, font) { ctx.font = font; const out = []; let ln = ''; for (const ch of String(s || '')) { if (ctx.measureText(ln + ch).width > w && ln && !/[，。、；：！？」）…—]/.test(ch)) { out.push(ln); ln = ch; } else ln += ch; } if (ln) out.push(ln); return out; }
  function badge(s, x, y, bg, fg) { ctx.font = F(14, 800); const w = ctx.measureText(s).width + 10; ctx.save(); if (typeof roundRect === 'function') roundRect(x, y - 10, w, 20, 5); else { ctx.beginPath(); ctx.rect(x, y - 10, w, 20); } ctx.fillStyle = bg; ctx.fill(); ctx.restore(); txt(s, x + w / 2, y + 1, F(14, 800), fg, 'center'); return w; }
  const LYIM = {}; function lyIcon(k) { let o = LYIM[k]; if (!o) { o = LYIM[k] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r467/ly_' + k + '.webp?v=1'; } return o.ok ? o.im : null; }

  function rows(M, w) {
    const R = [], sec = () => { if (R.length) R.push({ h: 13, sep: 1, draw(x, y) { ctx.fillStyle = COL.line; ctx.fillRect(x, y + 6, w, 1); } }); };
    // 2 主属性
    if (M.main.length) { sec();
      for (const s of M.main) R.push({ h: 30, draw(x, y) { const c = y + 15; txt(s.n, x, c, F(22, 700), COL.main); txt((s.v >= 0 ? '+' : '') + s.v, x + 58, c, F(22, 700, 0, NUM()), s.v < 0 ? COL.down : COL.main);
        if (s.d) txt((s.d > 0 ? '▲ ' : '▼ ') + Math.abs(s.d), x + w, c + 1, F(18, 700, 0, NUM()), s.d > 0 ? COL.up : COL.down, 'right'); else if (s.d === 0) txt('—', x + w, c, F(16, 600), COL.dim, 'right'); } });
      if (M.cmp) R.push({ h: 22, draw(x, y) { txt('▲▼ 和' + (M.cmpWho ? M.cmpWho : '') + '身上的「' + baseName(M.cmpName) + '」比', x + w, y + 10, F(14, 500), COL.dim, 'right'); } }); }
    // 3 副属性
    if (M.subs.length || M.note) { sec();
      for (const s of M.subs) R.push({ h: 27, draw(x, y) { const c = y + 13, tw = txt(s.t, x, c, F(19, 600), s.sp ? COL.sp : COL.sub); if (s.top) badge('极', x + tw + 8, c, COL.top, '#2a1a06'); } });
      if (M.note) for (const l of wrapLines(M.note, w, F(17, 500))) R.push({ h: 25, draw(x, y) { txt(l, x, y + 12, F(17, 500), COL.sub); } }); }
    // 4 灵窍
    if (M.socks.length) { sec();
      R.push({ h: 26, draw(x, y) { txt('灵窍 ' + M.socks.length, x, y + 12, F(16, 700), COL.title); const n = M.socks.filter(Boolean).length; txt(n < M.socks.length ? '镶了 ' + n + ' 个' : '镶满了', x + w, y + 12, F(14, 500), COL.dim, 'right'); } });
      for (const s of M.socks) R.push({ h: 27, draw(x, y) { const c = y + 13;
        if (!s) { ctx.save(); ctx.strokeStyle = COL.dim; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x + 8, c, 6, 0, 7); ctx.stroke(); ctx.restore(); txt('空窍', x + 24, c, F(18, 500), COL.dim); return; }
        const col = ELC[s.el] || '#e0c070'; ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 8, c, 6.5, 0, 7); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke(); ctx.restore();
        const nw = txt(s.name, x + 24, c, F(18, 600), '#e4ddc9'); txt(s.eff, x + 24 + Math.max(nw + 16, 86), c, F(18, 600), col); } }); }
    // 5 强化
    if (M.ref) { sec(); const r = M.ref;
      R.push({ h: 30, draw(x, y) { const c = y + 15; const tw = txt('强化', x, c, F(19, 700), COL.title); txt('+' + r.lv, x + tw + 10, c + 1, F(21, 700, 0, NUM()), COL.star); } });
      if (r.bonus) R.push({ h: 26, draw(x, y) { if (r.done) txt(r.bonus, x, y + 12, F(18, 600), COL.bonus); else txt('到 +5 另得：' + r.bonus, x, y + 12, F(16, 500), COL.dim); } }); }
    // 6 灵韵
    if (M.ly) { sec();
      R.push({ h: 30, draw(x, y) { const c = y + 15, im = lyIcon(M.ly.k); let tx = x; if (im) { ctx.drawImage(im, x - 2, c - 14, 28, 28); tx += 32; } txt('灵韵 · ' + M.ly.n, tx, c, F(19, 700), COL.ly); } });
      for (const l of wrapLines(M.ly.d, w, F(17, 500))) R.push({ h: 25, draw(x, y) { txt(l, x, y + 12, F(17, 500), COL.lyText); } }); }
    // 套装
    if (M.set) { sec(); R.push({ h: 26, draw(x, y) { txt(M.set.n, x, y + 12, F(16, 700), COL.set); } });
      for (const l of wrapLines(M.set.t, w, F(16, 500))) R.push({ h: 23, draw(x, y) { txt(l, x, y + 11, F(16, 500), COL.set); } }); }
    // 7 说明
    if (M.lore || M.leg || M.req) { sec();
      for (const l of wrapLines(M.lore, w, F(17, 500, 1))) R.push({ h: 24, draw(x, y) { txt(l, x, y + 12, F(17, 500, 1), COL.lore); } });
      if (M.leg) for (const l of wrapLines(M.leg, w, F(14, 500))) R.push({ h: 20, draw(x, y) { txt(l, x, y + 10, F(14, 500), COL.dim); } });
      if (M.req) R.push({ h: 24, draw(x, y) { txt('需要 ' + M.req + ' 级', x, y + 13, F(15, 600), M.reqOk ? '#8d969a' : COL.down); } }); }
    if (R.length && R[0].sep) R.shift();   // 抬头底下已经有一条线了
    return R; }

  // 抬头（弹框里画；嵌在铁匠铺里时铺子自己有抬头）
  const HEAD_H = 86;
  function drawHead(M, x, y, w) {
    try { itemIcon(M.id, x + 34, y + 42, 31); } catch (e) {}
    const h = M.head; ctx.font = F(30, 400, 0, BR()); let nm = h.name; const lim = w - 84 - (M.lv ? 46 : 0); while (nm.length > 2 && ctx.measureText(nm).width > lim) nm = nm.slice(0, -1); if (nm !== h.name) nm = nm.slice(0, -1) + '…';
    const nw = txt(nm, x + 80, y + 27, F(30, 400, 0, BR()), h.col); if (M.lv) txt('+' + M.lv, x + 88 + nw, y + 28, F(24, 700, 0, NUM()), COL.star);
    let sx = x + 81; const s1 = [h.slot, h.tier].filter(Boolean).join(' · '); sx += txt(s1, sx, y + 63, F(17, 500), COL.head2);
    if (h.gw) { sx += 14; sx += txt(h.gw, sx, y + 63, F(17, 800), h.col); }
    if (h.only) { sx += 10; txt('· 叶孤星专属', sx, y + 63, F(15, 500), COL.head2); } }

  // =====================================================================================================
  // 三、弹出的详情框
  // =====================================================================================================
  const BOX_W = 500, PAD = 26, BTN_H = 48, TOP = 14;
  let TIP = null;   // { id, o, sc, drag }
  function open(id, o) { if (!ITEM_DB[id] || !ITEM_DB[id].slot) return false; TIP = { id, o: o || {}, sc: 0, t0: performance.now() }; try { playSnd('ui_click'); } catch (e) {} try { input.tapped = null; } catch (e) {} return true; }
  function close() { const t = TIP; TIP = null; if (t && t.o.onClose) try { t.o.onClose(); } catch (e) {} }
  function layout() { const M = model(TIP.id, TIP.o); if (!M) return null; const cw = BOX_W - PAD * 2, R = rows(M, cw), ch = R.reduce((a, r) => a + r.h, 0);
    const btn = TIP.o.btns && TIP.o.btns.length ? BTN_H + 22 : 16, maxH = H - 16, h = Math.min(maxH, TOP + HEAD_H + 6 + ch + 8 + btn);
    let x = (W - BOX_W) / 2, y = Math.round((H - h) / 2); const a = TIP.o.anchor;
    if (a) { x = a.x + a.w + 14; if (x + BOX_W > W - 12) x = a.x - BOX_W - 14; if (x < 12) x = Math.max(12, Math.min(W - BOX_W - 12, a.x + a.w / 2 - BOX_W / 2)); y = Math.max(12, Math.min(H - h - 12, a.y + a.h / 2 - h / 2)); }
    const vy = y + TOP + HEAD_H + 6, vh = h - (TOP + HEAD_H + 6) - btn, max = Math.max(0, ch + 8 - vh);
    const bs = (TIP.o.btns || []).map((b, i, A) => { const bw = A.length > 1 ? 180 : 220, gap = 24, tot = A.length * bw + (A.length - 1) * gap; return Object.assign({}, b, { r: { x: x + BOX_W / 2 - tot / 2 + i * (bw + gap), y: y + h - BTN_H - 16, w: bw, h: BTN_H } }); });
    return { M, R, ch, x, y, h, vy, vh, max, bs }; }
  // 深色描金的底：就是原来行囊详情框用的那一款（lacquer + 四角描金），颜色固定用「玄青」那一套，换主题也不变
  function frame(x, y, w, h) { const keep = { gold: UI.gold, line: UI.line, grainA: UI.grainA }; try { Object.assign(UI, { gold: '#C2AD78', line: 'rgba(143,124,84,.55)', grainA: .12 });
      lacquer(x, y, w, h, { r: 16, corners: true, top: 'rgba(28,50,60,.97)', bot: 'rgba(12,27,35,.98)' }); } finally { Object.assign(UI, keep); } }
  function button(b) { const ok = b.ok !== false, st = ok ? (b.primary === false ? 'n' : 'n') : 'd';
    let drew = false; try { drew = KIT.D('button_' + st, b.r.x, b.r.y, b.r.w, b.r.h); } catch (e) {}
    if (!drew) { ctx.save(); roundRect(b.r.x, b.r.y, b.r.w, b.r.h, 10); ctx.fillStyle = 'rgba(20,40,48,.95)'; ctx.fill(); ctx.strokeStyle = '#C2AD78'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
    txt(b.label, b.r.x + b.r.w / 2, b.r.y + b.r.h / 2 + 1, F(20, 700), ok ? '#E9D9A8' : '#7d8687', 'center'); }
  function drawBody(L, sc) { let y = L.vy + 4 - sc; for (const r of L.R) { if (y + r.h > L.vy - 4 && y < L.vy + L.vh + 4) r.draw(L.x + PAD, y); y += r.h; } }
  function scrollBar(x, y, h, sc, max, ch) { if (max <= 0) return; ctx.save(); ctx.fillStyle = 'rgba(194,173,120,.14)'; ctx.fillRect(x, y, 4, h); const th = Math.max(30, h * h / (ch + 8)), ty = y + (h - th) * (sc / max); ctx.fillStyle = 'rgba(233,217,168,.6)'; ctx.fillRect(x, ty, 4, th); ctx.restore(); }
  function fades(x, y, w, h, sc, max) { ctx.save(); if (sc > 2) { const g = ctx.createLinearGradient(0, y, 0, y + 22); g.addColorStop(0, 'rgba(24,44,54,.95)'); g.addColorStop(1, 'rgba(24,44,54,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, 22); }
    if (sc < max - 2) { const g = ctx.createLinearGradient(0, y + h - 30, 0, y + h); g.addColorStop(0, 'rgba(14,30,38,0)'); g.addColorStop(1, 'rgba(14,30,38,.96)'); ctx.fillStyle = g; ctx.fillRect(x, y + h - 30, w, 30); txt('▼ 往上滑看更多', x + w / 2, y + h - 9, F(13, 600), 'rgba(233,217,168,.7)', 'center'); } ctx.restore(); }
  let LAST = null;
  function drawModal() { if (!TIP) return; const L = layout(); if (!L) { TIP = null; return; } LAST = L; TIP.sc = Math.max(0, Math.min(L.max, TIP.sc));
    const k = Math.min(1, (performance.now() - TIP.t0) / 140);
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(3,7,11,.55)'; ctx.fillRect(0, 0, W, H);
    frame(L.x, L.y, BOX_W, L.h); drawHead(L.M, L.x + PAD - 6, L.y + TOP, BOX_W - PAD * 2 + 6);
    ctx.fillStyle = COL.line; ctx.fillRect(L.x + PAD, L.y + TOP + HEAD_H + 1, BOX_W - PAD * 2, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(L.x + 8, L.vy, BOX_W - 16, L.vh); ctx.clip(); drawBody(L, TIP.sc); fades(L.x + 8, L.vy, BOX_W - 16, L.vh, TIP.sc, L.max); ctx.restore();
    scrollBar(L.x + BOX_W - 16, L.vy + 4, L.vh - 8, TIP.sc, L.max, L.ch);
    for (const b of L.bs) button(b);
    ctx.restore(); }

  // ---- 弹框开着时，所有点按都归它：点按钮、框里上下拖、框外点一下关掉 ----
  const inR = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  let downP = null, lp = null;
  function onDownModal(p) { const L = LAST; if (!L) { close(); return; }
    for (const b of L.bs) if (inR(p, b.r)) { if (b.ok === false) { try { playSnd('ui_cancel'); } catch (e) {} if (b.no) try { b.no(); } catch (e) {} return; } const t = TIP; TIP = null; try { playSnd('ui_click'); } catch (e) {} if (b.on) try { b.on(); } catch (e) { console.warn('R477 btn', e); } if (t && t.o.onClose) try { t.o.onClose(); } catch (e) {} return; }
    if (inR(p, { x: L.x, y: L.y, w: BOX_W, h: L.h })) { TIP.drag = { y0: p.y, s0: TIP.sc }; return; }
    close(); try { playSnd('ui_click'); } catch (e) {} }
  // 嵌入用法登记的滑动区（铁匠铺）：{ key, r, max }
  const SC = {}; let REG = [];
  let HOT = [];
  function hit(p) { for (let i = HOT.length - 1; i >= 0; i--) if (inR(p, HOT[i].r)) return HOT[i]; return null; }
  window.addEventListener('pointerdown', e => { if (e.button === 2) return; let p; try { p = toLogical(e); } catch (er) { return; }
    if (TIP) { e.stopImmediatePropagation(); e.preventDefault(); onDownModal(p); return; }
    const h = hit(p); if (h && h.o.tap) { e.stopImmediatePropagation(); e.preventDefault(); openHot(h); return; }
    downP = { x: p.x, y: p.y, moved: false };
    if (h) { clearTimeout(lp); lp = setTimeout(() => { if (downP && !downP.moved && !TIP) openHot(h); }, 430); }
    const g = REG.find(q => inR(p, q.r) && q.max > 0); if (g) downP.reg = { key: g.key, y0: p.y, s0: SC[g.key] || 0, max: g.max }; }, true);
  window.addEventListener('pointermove', e => { let p; try { p = toLogical(e); } catch (er) { return; }
    if (TIP && TIP.drag) { TIP.sc = Math.max(0, Math.min(LAST ? LAST.max : 0, TIP.drag.s0 + (TIP.drag.y0 - p.y))); return; }
    if (downP) { if (Math.hypot(p.x - downP.x, p.y - downP.y) > 12) { downP.moved = true; clearTimeout(lp); } const g = downP.reg; if (g) SC[g.key] = Math.max(0, Math.min(g.max, g.s0 + (g.y0 - p.y))); } }, true);
  window.addEventListener('pointerup', () => { if (TIP) TIP.drag = null; downP = null; clearTimeout(lp); }, true);
  window.addEventListener('pointercancel', () => { if (TIP) TIP.drag = null; downP = null; clearTimeout(lp); }, true);
  window.addEventListener('wheel', e => { let p; try { p = toLogical(e); } catch (er) { return; }
    if (TIP) { TIP.sc = Math.max(0, Math.min(LAST ? LAST.max : 0, TIP.sc + e.deltaY * .6)); e.preventDefault(); e.stopImmediatePropagation(); return; }
    const g = REG.find(q => inR(p, q.r) && q.max > 0); if (g) { SC[g.key] = Math.max(0, Math.min(g.max, (SC[g.key] || 0) + e.deltaY * .6)); e.preventDefault(); } }, { capture: true, passive: false });
  window.addEventListener('keydown', e => { if (!TIP) return; if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { close(); try { playSnd('ui_click'); } catch (er) {} }
    if (e.key === 'ArrowDown') TIP.sc += 60; if (e.key === 'ArrowUp') TIP.sc -= 60; e.stopImmediatePropagation(); e.preventDefault(); }, true);
  try { cv.addEventListener('contextmenu', e => { let p; try { p = toLogical(e); } catch (er) { return; } const h = hit(p); if (h || TIP) e.preventDefault(); if (h && !TIP) openHot(h); }); } catch (e) {}
  function openHot(h) { open(h.id, Object.assign({ anchor: h.r, cmp: 'auto', btns: [{ label: '关　闭' }] }, h.o.tip || {})); }

  // =====================================================================================================
  // 四、嵌在面板里（铁匠铺右边那一栏）：同样的排法，不画外框；放不下就在那一块里上下滑
  // =====================================================================================================
  function inline(id, x, y, w, h, o) { o = o || {}; const M = model(id, o); if (!M) return 0; const key = o.key || 'inline', R = rows(M, w - 14);
    if (o.extra) { R.push({ h: 15, draw(xx, yy) { ctx.fillStyle = COL.line; ctx.fillRect(xx, yy + 7, w - 14, 1); } }); R.push({ h: o.extra.h, draw: o.extra.draw }); }
    const ch = R.reduce((a, r) => a + r.h, 0), max = Math.max(0, ch - h); if (SC[key + '#id'] !== id) { SC[key + '#id'] = id; SC[key] = 0; } const sc = SC[key] = Math.max(0, Math.min(max, SC[key] || 0));
    REG.push({ key, r: { x, y, w, h }, max });
    ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y, w + 8, h); ctx.clip(); let yy = y - sc; for (const r of R) { if (yy + r.h > y - 2 && yy < y + h + 2) r.draw(x, yy); yy += r.h; }
    if (max > 0) { if (sc < max - 2) { const g = ctx.createLinearGradient(0, y + h - 26, 0, y + h); g.addColorStop(0, 'rgba(10,22,28,0)'); g.addColorStop(1, 'rgba(10,22,28,.92)'); ctx.fillStyle = g; ctx.fillRect(x - 4, y + h - 26, w + 8, 26); txt('▼ 往上滑看更多', x + w / 2, y + h - 8, F(13, 600), 'rgba(233,217,168,.7)', 'center'); } }
    ctx.restore(); scrollBar(x + w - 4, y + 2, h - 4, sc, max, ch); return Math.min(ch, h); }

  // 这一帧画着装备的地方（剑炉格子、获得物品那一行……）：长按 / 右键弹详情；tap:true 的点一下就弹
  function hot(id, r, o) { if (!id || !ITEM_DB[id] || !ITEM_DB[id].slot || !r) return; HOT.push({ id, r: { x: r.x, y: r.y, w: r.w, h: r.h }, o: o || {} }); }
  function hotClear() { HOT = []; }

  // 每一帧：开头清掉上一帧登记的格子；最后把弹框画在所有东西上面
  if (typeof frameInner === 'function') frameInner = (o => function () { HOT = []; REG = []; const r = o.apply(this, arguments);
    if (TIP) { try { drawModal(); } catch (e) { console.warn('R477 tip', e); TIP = null; } } return r; })(frameInner);

  // =====================================================================================================
  // 五、行囊 · 背包页：点一件装备 → 弹详情框（换上 / 关闭）；下面那一条说明只写一句简介
  // =====================================================================================================
  if (typeof menuUpdate === 'function') menuUpdate = (o => function () { const m = S.menu, t = input.tapped;
    if (!(m && m.tab === 2 && !m.savePage && t && !t.key && typeof bagCells === 'function')) return o.apply(this, arguments);
    let c = null; try { c = bagCells(menuLayout()).find(c => inR(t, c)); } catch (e) {}
    const r = o.apply(this, arguments);
    if (c && ITEM_DB[c.id] && ITEM_DB[c.id].slot && !TIP) { const id = c.id, it = ITEM_DB[id], E = window.R103_EQ, who = m.who;
      let cur = null, nm = ''; try { const mi = memberInfo(who); nm = who && who !== 'hero' ? mi.name : ''; cur = E ? E.eqNow()[it.slot] : (hero().equip || {})[it.slot]; } catch (e) {}
      const only = E && E.isAlly() && E.heroOnly(id);
      open(id, { cmp: cur, who: nm, anchor: c, btns: [{ label: only ? '专　属' : '换　上', ok: !only, on: () => { if (E) E.wear(id); else equipItem(id); } }, { label: '关　闭' }] }); }
    return r; })(menuUpdate);
  if (typeof drawBag === 'function') drawBag = (o => function () { API.briefOn = true; try { return o.apply(this, arguments); } finally { API.briefOn = false; } })(drawBag);

  const API = window.GEAR_TIP = { open, close, isOpen: () => !!TIP, inline, brief, hot, hotClear, model, briefOn: false, COL, _hot: () => HOT, _sc: SC, _btns: () => TIP && LAST ? LAST.bs.map(b => ({ label: b.label, r: b.r })) : [] };   // _hot / _sc / _btns 给测试脚本看
})();
