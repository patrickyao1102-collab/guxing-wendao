// ================= R201 · 行囊「白玉宣纸」（作者 11-11 选定 Codex R199 第 02 版；R200 拆件，固定字都是 Codex 写进图里的）=================
// 外框：白玉宣纸底 + 主框 + 「行囊」+ 两列页签 + 队伍头像 + 灵石条 + 关闭；各页内容照旧画在主框里（宣纸配色）。
// 装备页按 Codex 版式重做：左武器 / 衣服、右鞋子 / 饰品，中间人物立绘；下排「可替换装备」——
//   作者 11-11：「可替换装备有很多怎么办」→「滑吧」：点哪个栏位下排就只列那一类，左右拖动翻看，比身上强的排前面并标「↑」。
// 点卡片选中、选中的卡上出「换上」；再点选中的卡 / 点已穿的栏位 → 原来的装备详情（卸下 / 换上）。
(function () {
  if (typeof drawMenu !== 'function' || typeof menuLayout !== 'function') return;
  const N = {"avatar_empty": "a000", "avatar_name_plate": "a001", "avatar_ring_n": "a002", "avatar_ring_s": "a003", "bg_full": "a004", "btn_blue_9": "a005", "btn_close_n": "a006", "btn_close_p": "a007", "btn_gold_9": "a008", "btn_丢弃_d": "a009", "btn_丢弃_n": "a010", "btn_丢弃_p": "a011", "btn_使用_d": "a012", "btn_使用_n": "a013", "btn_使用_p": "a014", "btn_删除_d": "a015", "btn_删除_n": "a016", "btn_删除_p": "a017", "btn_卸下_d": "a018", "btn_卸下_n": "a019", "btn_卸下_p": "a020", "btn_存档_d": "a021", "btn_存档_n": "a022", "btn_存档_p": "a023", "btn_换上_d": "a024", "btn_换上_n": "a025", "btn_换上_p": "a026", "btn_查看_d": "a027", "btn_查看_n": "a028", "btn_查看_p": "a029", "btn_覆盖_d": "a030", "btn_覆盖_n": "a031", "btn_覆盖_p": "a032", "btn_读档_d": "a033", "btn_读档_n": "a034", "btn_读档_p": "a035", "chip_n": "a036", "chip_s": "a037", "chip_丹药_n": "a038", "chip_丹药_s": "a039", "chip_全部_n": "a040", "chip_全部_s": "a041", "chip_材料_n": "a042", "chip_材料_s": "a043", "chip_秘籍_n": "a044", "chip_秘籍_s": "a045", "chip_装备_n": "a046", "chip_装备_s": "a047", "currency_bar_9": "a048", "divider_h": "a049", "dot_diamond": "a050", "ghost_武器": "a051", "ghost_衣服": "a052", "ghost_鞋子": "a053", "ghost_饰品": "a054", "hero_name_plate": "a055", "hero_sub_plate": "a056", "hint_diamond": "a057", "icon_lingshi": "a058", "icon_xingchen": "a059", "info_box_9": "a060", "item_card_9_n": "a061", "item_card_9_s": "a062", "item_disc": "a063", "item_disc_empty": "a064", "label_星辰点": "a065", "label_灵石": "a066", "label_请选择一个存档位": "a067", "page_title_任务": "a068", "page_title_出战": "a069", "page_title_图鉴": "a070", "page_title_坐骑": "a071", "page_title_存档": "a072", "page_title_技能": "a073", "page_title_换装": "a074", "page_title_状态": "a075", "page_title_神器": "a076", "page_title_背包": "a077", "page_title_装备": "a078", "panel_main_9": "a079", "save_row_9_empty": "a080", "save_row_9_n": "a081", "save_row_9_s": "a082", "save_thumb_empty": "a083", "save_thumb_frame": "a084", "scroll_thumb": "a085", "scroll_track": "a086", "section_可替换装备": "a087", "slot_card_9": "a088", "slot_card_empty_9": "a089", "slot_label_武器": "a090", "slot_label_衣服": "a091", "slot_label_鞋子": "a092", "slot_label_饰品": "a093", "swap_card_9_n": "a094", "swap_card_9_s": "a095", "tab_任务_n": "a096", "tab_任务_s": "a097", "tab_出战_n": "a098", "tab_出战_s": "a099", "tab_图鉴_n": "a100", "tab_图鉴_s": "a101", "tab_坐骑_n": "a102", "tab_坐骑_s": "a103", "tab_存档_n": "a104", "tab_存档_s": "a105", "tab_技能_n": "a106", "tab_技能_s": "a107", "tab_换装_n": "a108", "tab_换装_s": "a109", "tab_状态_n": "a110", "tab_状态_s": "a111", "tab_神器_n": "a112", "tab_神器_s": "a113", "tab_背包_n": "a114", "tab_背包_s": "a115", "tab_装备_n": "a116", "tab_装备_s": "a117", "title_xingnang": "a118"};
  // 九宫格保护边（逻辑像素，Codex layout.json）
  const NINE = { panel_main_9: [112, 102, 112, 100], currency_bar_9: [44, 14, 44, 14], slot_card_9: [40, 30, 76, 46], slot_card_empty_9: [40, 30, 76, 46], swap_card_9_n: [40, 28, 106, 55], swap_card_9_s: [40, 28, 106, 55], save_row_9_n: [42, 26, 240, 80], save_row_9_s: [42, 26, 240, 80], save_row_9_empty: [42, 26, 240, 80], btn_gold_9: [32, 14, 32, 14], btn_blue_9: [32, 14, 32, 14], chip_n: [18, 9, 18, 9], chip_s: [18, 9, 18, 9], info_box_9: [52, 48, 106, 80], item_card_9_n: [28, 30, 42, 50], item_card_9_s: [28, 30, 48, 68] };
  const C = { ink: '#3E2D18', grey: '#77746E', light: '#FFF5DA', red: '#A43B2E', blue: '#315E90', gold: '#9A671F', line: '#C69B57', green: '#2f7a2a' }, CJ = Object.assign({}, C),
    CD = { ink: '#E4DDC9', grey: '#8A9493', light: '#F3E3B2', red: '#D98A78', blue: '#9CC3E8', gold: '#C2AD78', line: '#8F7C54', green: '#9FC98F' };
  const IM = {}; let nOk = 0; const NALL = Object.keys(N).length;
  // 菜单图在第一次打开行囊前就下好（开局空闲时下，不抢地图图）
  // 作者 11-11：「还是 Codex 的字体好」→ 行囊里的字全换成 Codex 配的三款（OFL 免费商用，按游戏用字裁剪）：
  //   马善政毛笔楷书 = 名字 / 标题；霞鹜文楷 = 正文说明；Noto Serif SC = 数字（灵石、等级、时间）
  const FF = [['R201MS', 'fonts/r201_mashan.woff', {}], ['R201WK', 'fonts/r201_wenkai.woff', {}], ['R201NS', 'fonts/r201_noto.woff', { weight: '200 900' }]];
  function loadFonts() { for (const [n, u, d] of FF) { try { const f = new FontFace(n, `url(${u})`, d); f.load().then(x => document.fonts.add(x)).catch(() => {}); } catch (e) {} } }
  let started = false; function load() { if (started) return; started = true; loadFonts(); for (const k in N) { const im = new Image(); im.onload = () => { IM[k] = im; nOk++; }; im.src = 'r201/' + N[k] + '.webp'; } }
  setTimeout(load, 6000);
  const READY = () => nOk >= NALL;
  window.R201_BAG = { ready: READY, IM, nine: (...a) => nine(...a), D: (...a) => D(...a) };
  const DK = () => !!window.BAG_DARK;   /* R209 玄青暗色皮：画每个件之前先问它要不要换成暗色件 */
  const D = (k, x, y, w, h) => { if (DK() && BDK.bag(k, x, y, w, h)) return; const im = IM[k]; if (!im) return; if (w == null) { w = im.width / 2; h = im.height / 2; } ctx.drawImage(im, x, y, w, h); };
  function nine(k, x, y, w, h) { if (DK() && BDK.bag(k, x, y, w, h, true)) return; const im = IM[k]; if (!im) return; const p = NINE[k]; if (!p) return D(k, x, y, w, h);
    const [l, t, r, b] = p, s = 2, sw = im.width, sh = im.height, SX = [0, l * s, sw - r * s, sw], SY = [0, t * s, sh - b * s, sh], DX = [x, x + l, x + w - r, x + w], DY = [y, y + t, y + h - b, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const a = SX[i + 1] - SX[i], bb = SY[j + 1] - SY[j], c = DX[i + 1] - DX[i], d = DY[j + 1] - DY[j]; if (a > 0 && bb > 0 && c > 0 && d > 0) ctx.drawImage(im, SX[i], SY[j], a, bb, DX[i], DY[j], c, d); } }
  const KAI = '"R201MS","GuxingWKB",' + BRUSH, NUM = '"R201NS",' + FONT;
  const txt = (s, x, y, size, col, align = 'left', font, wt) => { ctx.font = `${wt || 400} ${size}px ${font || KAI}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(s, x, y); };
  const fit = (s, maxW) => { let t = s; while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -1); return t === s ? s : t.slice(0, -1) + '…'; };

  // ---------------- 布局（照 Codex layout.json）----------------
  const PANEL = { x: 204, y: 114, w: 1044, h: 580 }, BODY = { x: 236, y: 146, w: 980, h: 516 };
  menuLayout = (orig => function () { const L = orig(); if (!READY()) return L;
    L.close = { x: 1148, y: 28, w: 118, h: 46 };
    L.tabs = MTABS.map((t, i) => ({ x: 30 + (i % 2) * 82, y: 124 + Math.floor(i / 2) * 108, w: 76, h: 104 }));
    L.members = partyList().slice(0, 4).map((k, i) => ({ k, x: 250 + i * 112, y: 4, w: 86, h: 104 }));
    L.body = Object.assign({}, BODY); L.skin = { x: -999, y: -999, w: 0, h: 0 }; return L; })(menuLayout);

  // ---------------- 外框 ----------------
  function frame(L, m) {
    if (DK()) BDK.backdrop(S.menu); else { ctx.fillStyle = '#E9E6E0'; ctx.fillRect(0, 0, W, H); D('bg_full', 0, 0, W, H); } nine('panel_main_9', PANEL.x, PANEL.y, PANEL.w, PANEL.h);
  }
  function header(L, m) {
    D('title_xingnang', 14, 6, 204, 100);
    L.tabs.forEach((r, i) => { const t = MTABS[i], on = m.savePage ? t === '存档' : i === m.tab, k = 'tab_' + t + '_' + (on ? 's' : 'n'); if (IM[k]) D(k, r.x, r.y, 76, 116); else { ctx.save(); txt(t, r.x + 38, r.y + 58, 22, C.ink, 'center'); ctx.restore(); } });
    // 队伍头像：先画圆形裁切的人像，再叠头像框
    for (let i = 0; i < 4; i++) { const x = 250 + i * 112, y = 4, r = L.members[i];
      if (!r) { D('avatar_empty', x, y, 86, 86); continue; }
      const info = memberInfo(r.k), sel = r.k === m.who;
      if (typeof medallion === 'function') { ctx.save(); medallion(info.p, x + 43, y + 43, 34, { sel: false, name: info.name, color: info.color, bg: '#e9e4da' }); ctx.restore(); }
      D(sel ? 'avatar_ring_s' : 'avatar_ring_n', x, y, 86, 86);
      if (sel) { D('avatar_name_plate', x - 3, y + 79, 92, 26); txt(info.name, x + 43, y + 92, 17, C.ink, 'center'); }
      else txt(info.name, x + 43, y + 92, 17, C.ink, 'center'); }
    nine('currency_bar_9', 778, 28, 352, 54); D('icon_lingshi', 797, 37, 30, 34); D('label_灵石', 829, 40, 50, 30); D('icon_xingchen', 960, 37, 32, 34); D('label_星辰点', 993, 40, 76, 30);
    txt(String(S.hero.gold || 0), 886, 56, 22, C.gold, 'left', NUM, 700); txt(String(S.hero.points || 0), 1076, 56, 22, C.blue, 'left', NUM, 700);
    D(closeDown ? 'btn_close_p' : 'btn_close_n', 1148, 28, 118, 46);
    if (window.BDK) { const r = SKIN_R; ctx.save(); ctx.globalAlpha = .92; if (typeof roundRect === 'function') roundRect(r.x, r.y, r.w, r.h, 12); ctx.fillStyle = DK() ? 'rgba(12,26,34,.85)' : 'rgba(255,252,244,.9)'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = DK() ? 'rgba(143,124,84,.8)' : 'rgba(198,155,87,.8)'; ctx.stroke(); ctx.restore();
      txt(DK() ? '换白玉' : '换玄青', r.x + r.w / 2, r.y + r.h / 2 + 1, 16, DK() ? '#C2AD78' : C.gold, 'center', '"R201WK",' + FONT, 600); }
  }
  const SKIN_R = { x: 1162, y: 80, w: 90, h: 28 };
  // 作者 11-12：游戏里没法退出 → 行囊左下角「返回主界面」（问一句再回标题，没存的进度会丢）
  const HOME_R = { x: 30, y: 668, w: 158, h: 42 }; let homeDown = false;
  function homeBtn() { const r = HOME_R; if (DK()) { BDK.btn('返回主界面', r.x, r.y, r.w, r.h, homeDown ? 'p' : 'n'); return; }
    nine('btn_gold_9', r.x, r.y, r.w, r.h); if (!IM.btn_gold_9) { ctx.save(); if (typeof roundRect === 'function') roundRect(r.x, r.y, r.w, r.h, 12); ctx.fillStyle = '#C69B57'; ctx.fill(); ctx.restore(); } txt('返回主界面', r.x + r.w / 2, r.y + r.h / 2 + 1, 20, '#FFF5DA', 'center'); }
  let closeDown = false;

  // ---------------- 装备页 ----------------
  const SLOTS = [['weapon', '武器', 244, 167], ['armor', '衣服', 244, 328], ['shoe', '鞋子', 953, 167], ['acc', '饰品', 953, 328]];
  const ROW = { x: 244, y: 550, w: 970, h: 112 }, CW = 310, GAP = 20;
  const isAlly = () => S.menu && S.menu.who && S.menu.who !== 'hero';
  const eqNow = () => isAlly() && window.allyEqOf ? allyEqOf(S.menu.who) : S.hero.equip;
  const okFor = id => !isAlly() || !window.ALLY_EQ_OK || ALLY_EQ_OK(id);
  function score(it, cur) { let s = 0; for (const k of STATS) { const d = (it[k] || 0) - ((cur && cur[k]) || 0); s += (k === 'maxhp' || k === 'maxmp') ? d / 5 : d; } return s; }
  function swapList() { const m = S.menu, slot = m.eqSlot || 'weapon', eq = eqNow(), cur = eq[slot] ? ITEM_DB[eq[slot]] : null;
    return Object.keys(S.hero.bag).filter(id => S.hero.bag[id] > 0 && ITEM_DB[id] && ITEM_DB[id].slot === slot && okFor(id)).map(id => ({ id, sc: score(ITEM_DB[id], cur) })).sort((a, b) => b.sc - a.sc); }
  const maxScroll = n => Math.max(0, n * (CW + GAP) - GAP - ROW.w);
  function clampScroll(n) { const m = S.menu; m.eqScroll = Math.max(0, Math.min(maxScroll(n), m.eqScroll || 0)); }
  const prevEquipCards = equipCards;
  equipCards = function (L) { if (!READY()) return prevEquipCards(L); const eq = eqNow();
    const top = SLOTS.map(([s, n, x, y]) => ({ s, n, id: eq[s], x, y, w: 254, h: 132 }));
    const ls = swapList(); clampScroll(ls.length); const off = S.menu.eqScroll || 0;
    const list = ls.map((o, i) => ({ id: o.id, sc: o.sc, x: ROW.x + i * (CW + GAP) - off, y: ROW.y, w: CW, h: ROW.h })).filter(c => c.x + c.w > ROW.x && c.x < ROW.x + ROW.w);
    return { top, list, pager: null, all: ls.length }; };
  const wearBtn = c => ({ x: c.x + c.w - 112, y: c.y + 34, w: 102, h: 44 });
  function drawEquipPage(L, mi) {
    const m = S.menu, eq = eqNow(), sel = m.eqSlot || 'weapon', now = performance.now() / 1000;
    // 中间立绘（底部淡出，头顶可以越过主框上沿，照 Codex 图）
    const im = IMG[mi.p]; if (im) { const ph = 520, pw = ph * im.width / im.height, cx = 722; ctx.save(); ctx.beginPath(); ctx.rect(500, 66, 444, 434); ctx.clip();
      const fy = 470;
      if (DK()) { const o = PFADE.c || (PFADE.c = document.createElement('canvas')); o.width = 444; o.height = 434; const g2 = o.getContext('2d'); g2.clearRect(0, 0, 444, 434); g2.drawImage(im, cx - pw / 2 - 500, 76 + Math.sin(now * 1.2) * 2 - 66, pw, ph);
        g2.globalCompositeOperation = 'destination-out'; const gg = g2.createLinearGradient(0, fy - 60 - 66, 0, 500 - 66); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(0,0,0,1)'); g2.fillStyle = gg; g2.fillRect(0, fy - 60 - 66, 444, 434); g2.globalCompositeOperation = 'source-over'; ctx.drawImage(o, 500, 66); ctx.restore(); }
      else { ctx.drawImage(im, cx - pw / 2, 76 + Math.sin(now * 1.2) * 2, pw, ph);
      const g = ctx.createLinearGradient(0, fy - 60, 0, 500); g.addColorStop(0, 'rgba(240,239,236,0)'); g.addColorStop(1, 'rgba(240,239,236,1)'); ctx.fillStyle = g; ctx.fillRect(500, fy - 60, 444, 500 - fy + 60); ctx.restore(); } }
    D('hero_sub_plate', 547, 454, 350, 46); D('hero_name_plate', 610, 420, 224, 44);
    txt(mi.name, 722, 442, 30, C.light, 'center'); txt(mi.realm + ' · ' + mi.lv + '级', 722, 478, 22, C.ink, 'center');
    // 四个栏位
    const { top } = equipCards(L);
    for (const c of top) { const has = !!c.id, x = c.x, y = c.y;
      nine(has ? 'slot_card_9' : 'slot_card_empty_9', x, y, 254, 132);
      if (c.s === sel) { ctx.save(); ctx.strokeStyle = `rgba(214,160,60,${.65 + .35 * Math.sin(now * 4)})`; ctx.lineWidth = 3; ctx.shadowColor = '#f0c060'; ctx.shadowBlur = 12; if (typeof roundRect === 'function') roundRect(x + 4, y + 4, 246, 124, 14); ctx.stroke(); ctx.restore(); }
      D('slot_label_' + c.n, x + 30, y - 13, 116, 34);
      D(has ? 'item_disc' : 'item_disc_empty', x + 24, y + 37, 82, 82);
      if (has) { itemIcon(c.id, x + 65, y + 78, 30); const it = ITEM_DB[c.id]; ctx.font = `25px ${KAI}`; txt(fit(it.name, 128), x + 115, y + 66, 25, C.ink); ctx.font = `600 14px ${FONT}`; txt(fit(statText(it), 130), x + 115, y + 98, 14, C.green, 'left', FONT); }
      else { D('ghost_' + c.n, x + 39, y + 44, 52, 64); txt('未装备', x + 115, y + 72, 25, C.grey); } }
    // 可替换装备
    D('section_可替换装备', 250, 501, 948, 50);
    const { list, all } = equipCards(L), cur = eq[sel] ? ITEM_DB[eq[sel]] : null;
    ctx.save(); ctx.beginPath(); ctx.rect(ROW.x - 4, ROW.y - 6, ROW.w + 8, ROW.h + 12); ctx.clip();
    if (!list.length) txt('背包里没有能换的' + SLOTS.find(s => s[0] === sel)[1], ROW.x + ROW.w / 2, ROW.y + ROW.h / 2, 24, C.grey, 'center');
    for (const c of list) { const it = ITEM_DB[c.id], on = m.eqPick === c.id;
      nine(on ? 'swap_card_9_s' : 'swap_card_9_n', c.x, c.y, c.w, c.h); D('item_disc', c.x + 18, c.y + 15, 82, 82); itemIcon(c.id, c.x + 59, c.y + 56, 30);
      const nameW = on ? 96 : 190; ctx.font = `24px ${KAI}`; txt(fit(it.name + (S.hero.bag[c.id] > 1 ? '×' + S.hero.bag[c.id] : ''), nameW), c.x + 110, c.y + 42, 24, C.ink);
      if (c.sc > 0) txt('↑', c.x + 110 + Math.min(nameW, ctx.measureText(it.name).width) + 8, c.y + 40, 24, C.green, 'left', FONT);
      // 和身上那件比
      let dx = c.x + 110; ctx.font = `600 14px ${FONT}`; for (const k of STATS) { const d = (it[k] || 0) - ((cur && cur[k]) || 0); if (!it[k] && !(cur && cur[k])) continue; const s = STAT_CN[k] + (d > 0 ? '▲' + d : d < 0 ? '▼' + (-d) : '='); if (dx + ctx.measureText(s).width > c.x + (on ? c.w - 116 : c.w - 16)) break; txt(s, dx, c.y + 76, 14, d > 0 ? C.green : d < 0 ? C.red : C.grey, 'left', FONT); dx += ctx.measureText(s).width + 8; }
      if (on) { const b = wearBtn(c); D(wearDown === c.id ? 'btn_换上_p' : 'btn_换上_n', b.x, b.y, b.w, b.h); } }
    ctx.restore();
    // 滑动提示：两头的小箭头 + 共几件
    if (all > 3) { const off = m.eqScroll || 0, mx = maxScroll(all); ctx.save(); ctx.fillStyle = C.line;
      if (off > 2) { ctx.beginPath(); ctx.moveTo(ROW.x - 14, ROW.y + 56); ctx.lineTo(ROW.x - 2, ROW.y + 44); ctx.lineTo(ROW.x - 2, ROW.y + 68); ctx.fill(); }
      if (off < mx - 2) { ctx.beginPath(); ctx.moveTo(ROW.x + ROW.w + 14, ROW.y + 56); ctx.lineTo(ROW.x + ROW.w + 2, ROW.y + 44); ctx.lineTo(ROW.x + ROW.w + 2, ROW.y + 68); ctx.fill(); }
      ctx.restore(); ctx.font = `600 14px ${FONT}`; const lab = '共 ' + all + ' 件 · 左右拖动', lw = ctx.measureText(lab).width; ctx.fillStyle = DK() ? 'rgba(12,26,34,.95)' : '#F0EFEC'; ctx.fillRect(1204 - lw - 10, 517, lw + 14, 18); txt(lab, 1200, 526, 14, C.grey, 'right', FONT, 600); }
  }
  let wearDown = null; const PFADE = {};


  // ---------------- 存档页（Codex 版式：三条存档条 + 缩略金框 + 存档 / 读档）----------------
  const TH = {}; for (const k of ['loc_qy', 'loc_xt', 'loc_pine', 'party_1', 'party_2', 'party_3', 'party_4', 'party_5']) { const im = new Image(); im.onload = () => { TH[k] = im; }; im.src = 'r187/' + k + '.webp'; }
  const SKEY = s => 'gx_save_' + s, sread = s => { try { const d = JSON.parse(localStorage.getItem(SKEY(s)) || 'null'); return d && d.hero ? d : null; } catch (e) { return null; } };
  const locOf = d => /^qy_/.test(d.map || '') ? 'loc_qy' : /^xt_/.test(d.map || '') ? 'loc_xt' : 'loc_pine';
  const CN3 = ['一', '二', '三'], two = n => String(n).padStart(2, '0');
  const srow = i => ({ x: 248, y: 172 + i * 144, w: 952, h: 136 }), SBTN = { x: 758, y: 602, w: 208, h: 66 }, LBTN = { x: 984, y: 602, w: 208, h: 66 };
  let btnDown = null;
  function drawSavePage(L, m) {
    const sel = m.saveSel;
    for (let i = 0; i < 3; i++) { const r = srow(i), d = sread(String(i + 1)), y = r.y;
      nine(!d ? 'save_row_9_empty' : sel === i ? 'save_row_9_s' : 'save_row_9_n', r.x, y, r.w, r.h);
      if (d) { const pn = Math.max(1, Math.min(5, 1 + ((d.party || []).length))), pt = TH['party_' + pn], th = TH[locOf(d)];   // 作者 11-11：存档缩略图要有队伍头像（存档时队里有谁就画谁）
        ctx.save(); ctx.beginPath(); ctx.rect(287, y + 19, 322, 100); ctx.clip();
        if (pt) { const sw = 163 * 3.22, sx = Math.max(0, Math.min(pt.width - sw, 400 + pn * 20 - sw / 2)); ctx.drawImage(pt, sx, 0, sw, 163, 287, y + 19, 322, 100); }
        else if (th) { const s = Math.max(322 / th.width, 100 / th.height); ctx.drawImage(th, 448 - th.width * s / 2, y + 69 - th.height * s / 2, th.width * s, th.height * s); }
        ctx.restore();
        D('save_thumb_frame', 280, y + 12, 336, 114); D('dot_diamond', 634, y + 62, 12, 12);
        const h = d.hero || {}, t = new Date(d.t || 0);
        txt('存档' + CN3[i] + ' · ' + fit(d.title || '某处', 300), 663, y + 35, 31, C.ink);
        txt('叶孤星 · ' + (h.realm ? h.realm + ' · ' : '') + (h.lv || '?') + '级', 672, y + 71, 22, C.ink, 'left', FONT, 600);
        txt(t.getFullYear() + '-' + two(t.getMonth() + 1) + '-' + two(t.getDate()) + '  ' + two(t.getHours()) + ':' + two(t.getMinutes()), 672, y + 103, 22, C.ink, 'left', NUM, 600); }
      else { D('save_thumb_empty', 280, y + 12, 336, 114); D('dot_diamond', 634, y + 62, 12, 12); txt('存档' + CN3[i] + ' · 空存档', 663, y + 68, 31, C.ink); } }
    D('divider_h', 272, 606, 460, 10); D('hint_diamond', 258, 632, 22, 22);
    if (sel == null) D('label_请选择一个存档位', 288, 625, 300, 36); else txt('已选 存档' + CN3[sel] + (sread(String(sel + 1)) ? '（再存会覆盖）' : ''), 292, 643, 22, C.ink);
    const hasD = sel != null && !!sread(String(sel + 1)), canS = sel != null, canL = hasD;
    D(!canS ? 'btn_存档_d' : btnDown === 'save' ? 'btn_存档_p' : 'btn_存档_n', SBTN.x, SBTN.y, SBTN.w, SBTN.h);
    D(!canL ? 'btn_读档_d' : btnDown === 'load' ? 'btn_读档_p' : 'btn_读档_n', LBTN.x, LBTN.y, LBTN.w, LBTN.h);
    D('page_title_存档', 492, 90, 400, 74);
  }
  async function saveTap(t, m) {
    for (let i = 0; i < 3; i++) if (inR(t, srow(i))) { m.saveSel = i; playSnd('ui_click'); return; }
    const sel = m.saveSel; if (sel == null) return; const s = String(sel + 1), d = sread(s);
    if (inR(t, SBTN)) { btnDown = 'save'; setTimeout(() => { btnDown = null; }, 160);
      if (d) { const c = await choose('覆盖「存档' + CN3[sel] + '」？', ['覆盖', '取消']); if (c !== 0) return; }
      const ok = window.saveGame && window.saveGame(s); if (ok) { playSnd('ui_confirm'); toast('已存入 存档' + CN3[sel]); } else toast('这里暂时不能存档', 1600); return; }
    if (inR(t, LBTN) && d) { btnDown = 'load'; setTimeout(() => { btnDown = null; }, 160);
      const c = await choose('读取「存档' + CN3[sel] + '」？当前没存的进度会丢失', ['读取', '取消']); if (c !== 0) return;
      playSnd('ui_confirm'); try { await fadeOut(400); } catch (e) {} const ok = window.loadGame && window.loadGame(s); try { await fadeIn(400); } catch (e) {} return; }
  }

  // 白玉宣纸配色（Codex 配色.json）：各页原来用 UI.* 画的卡片、字、分隔线、选中签都跟着换成白玉 + 描金 + 金褐
  const JADE = { pTop: '#F4F2EE', pBot: '#E9E6E0', cTop: 'rgba(252,251,248,.96)', cBot: 'rgba(236,233,226,.96)', cOff: 'rgba(228,225,218,.85)', well: 'rgba(198,155,87,.05)', slot: 'rgba(198,155,87,.10)',
    fade1: 'rgba(240,239,236,1)', fade0: 'rgba(240,239,236,0)', line: 'rgba(198,155,87,.55)', grainA: .12, gold: '#C69B57', gold2: '#7a5226', text: '#3E2D18', sub: '#5a4a34', dim: '#77746E',
    red: '#9a6524', red2: '#c79246', title: '#3E2D18', titleLine: 'rgba(255,253,246,.95)' };
  window.R201_JADE = JADE;
  // 菜单里各页原来写的 ${FONT} / ${BRUSH}：画行囊期间把 ctx.font 映射到 Codex 字体（画完还原，地图 / 战斗不受影响）
  const FD = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font');
  /* 玄青暗色皮（作者 11-12：要和 Codex 效果图同一套字）：效果图里名目、名字、物品名这些短字都是马善政毛笔字 → 18px 及以上的正文字也用马善政，小字说明仍用霞鹜文楷 */
  const mapFont = v => { if (typeof v !== 'string' || v.indexOf('R201') >= 0) return v; let body = '"R201WK",' + FONT;
    if (window.BAG_DARK) { const m = /(\d+)px/.exec(v); if (m && +m[1] >= 18) body = '"R209DG","R201MS","R201WK",' + FONT; }   /* 数字、英文走文楷（R209DG 只管 ASCII），汉字走马善政 */
    return v.replace(BRUSH, '"R201MS",' + BRUSH).replace(FONT, body); };
  function fontOn() { try { Object.defineProperty(ctx, 'font', { configurable: true, get() { return FD.get.call(this); }, set(v) { FD.set.call(this, mapFont(v)); } }); } catch (e) {} }
  function fontOff() { try { delete ctx.font; } catch (e) {} }
  // ---------------- 主画 ----------------
  const prevDraw = drawMenu;
  drawMenu = function () {
    if (!READY() || !S.menu) { load(); return prevDraw.apply(this, arguments); }
    const m = S.menu, L = menuLayout(), mi = memberInfo(m.who), now = performance.now() / 1000;
    const keep = {}; for (const k in UI) keep[k] = UI[k];
    const dark = !!(window.BDK && BDK.on); window.BAG_DARK = dark; Object.assign(C, dark ? CD : CJ);
    try { if (typeof UI_BASE !== 'undefined') Object.assign(UI, UI_BASE, (typeof THEMES !== 'undefined' && THEMES.paper) || {}, dark ? BDK.PAL : JADE, { id: dark ? 'xuanqing' : 'paper' }); } catch (e) {}
    ctx.save(); window.R201_IN = true; fontOn();
    try {
      frame(L, m);
      const B = L.body, tab = MTABS[m.tab];
      if (m.savePage) drawSavePage(L, m);
      else if (m.tab === 1) { drawEquipPage(L, mi);
        if (m.eqInfo && ITEM_DB[m.eqInfo.id]) { // 原来的装备详情（卸下 / 换上）：只让它画在详情框那块，底下我们的页面不被盖
          const w = 620, h = 400, bx = B.x + (B.w - w) / 2, by = B.y + (B.h - h) / 2; ctx.save(); ctx.fillStyle = 'rgba(40,30,18,.35)'; ctx.fillRect(PANEL.x + 20, PANEL.y + 20, PANEL.w - 40, PANEL.h - 40);
          ctx.beginPath(); ctx.rect(bx - 2, by - 2, w + 4, h + 4); ctx.clip(); drawEquip(B, L, mi); ctx.restore(); } }
      else { ctx.save(); ctx.beginPath(); ctx.rect(B.x, B.y, B.w, B.h); ctx.clip();
        if (m.tab === 0) drawStatus(B, mi, now); else if (m.tab === 2) drawBag(B, L); else if (m.tab === 3) drawSkills(B, L); else drawQuest(B);
        ctx.restore(); }
      header(L, m); homeBtn();
    } finally { window.R201_IN = false; window.BAG_DARK = false; fontOff(); ctx.restore(); for (const k in keep) UI[k] = keep[k]; }
  };

  // ---------------- 装备页点击 + 拖动 ----------------
  let drag = null;
  const prevUpd = menuUpdate;
  menuUpdate = function () {
    const m = S.menu; if (!READY() || !m) return prevUpd.apply(this, arguments);
    const L = menuLayout();
    // 关闭按钮按下态
    closeDown = !!(input.down && inR(input, L.close));
    { const t = input.tapped; if (t && !t.key && window.BDK && inR(t, SKIN_R)) { consumeTap(); BDK.toggle(); playSnd('ui_click'); return; } }
    { const t = input.tapped; if (t && !t.key && inR(t, HOME_R) && !(typeof choice !== 'undefined' && choice)) { consumeTap(); homeDown = true; setTimeout(() => { homeDown = false; }, 160); playSnd('ui_click');
      (async () => { const c = await choose('返回主界面？还没存档的进度会丢失', ['返回主界面', '先存档', '取消']); if (c === 0) { try { await fadeOut(400); } catch (e) {} window.GX_GOING_HOME = true; S.started = false; try { sessionStorage.removeItem('gx_alive'); sessionStorage.setItem('gx_home', '1'); } catch (e) {} location.href = location.pathname; }   /* 11-12：先清掉「正在玩」标记，不然被当成意外重载又自动接档 */ else if (c === 1) { m.savePage = true; m.saveSel = null; m.eqInfo = null; } })(); return; } }
    // 「存档」页签：就在行囊里画存档页（不再跳出去）
    { const t = input.tapped, si = MTABS.indexOf('存档');
      if (t && !t.key && si >= 0 && L.tabs[si] && inR(t, L.tabs[si])) { consumeTap(); m.savePage = true; m.saveSel = null; m.eqInfo = null; playSnd('ui_click'); return; }
      if (m.savePage) { if (!t) return; if (t.key === 'Escape' || inR(t, L.close)) { m.savePage = false; return prevUpd.apply(this, arguments); }
        if (L.tabs.some(r => inR(t, r)) || L.members.some(r => inR(t, r))) { m.savePage = false; return prevUpd.apply(this, arguments); }
        if (typeof choice !== 'undefined' && choice) return; consumeTap(); saveTap(t, m); return; } }
    if (m.tab !== 1 || m.eqInfo) { drag = null; return prevUpd.apply(this, arguments); }
    // 下排拖动
    const n = swapList().length;
    if (input.down) { if (!drag && inR(input, { x: ROW.x, y: ROW.y, w: ROW.w, h: ROW.h })) drag = { x0: input.x, s0: m.eqScroll || 0, moved: false };
      if (drag) { const dx = input.x - drag.x0; if (Math.abs(dx) > 8) drag.moved = true; if (drag.moved) { m.eqScroll = drag.s0 - dx; clampScroll(n); } } }
    const t = input.tapped; if (!t) { if (!input.down) drag = null; return; }
    if (drag && drag.moved) { consumeTap(); drag = null; return; } drag = null;
    if (t.key || inR(t, L.close) || L.tabs.some(r => inR(t, r)) || L.members.some(r => inR(t, r))) { m.eqPick = null; return prevUpd.apply(this, arguments); }
    const { top, list } = equipCards(L);
    for (const c of top) if (inR(t, c)) { consumeTap(); if ((m.eqSlot || 'weapon') !== c.s) { m.eqSlot = c.s; m.eqScroll = 0; m.eqPick = null; playSnd('ui_click'); } else if (c.id) { m.eqInfo = { id: c.id, slot: c.s, from: 'slot' }; playSnd('ui_click'); } return; }
    for (const c of list) if (inR(t, c)) { consumeTap();
      if (m.eqPick === c.id && inR(t, wearBtn(c))) { wearDown = c.id; setTimeout(() => { wearDown = null; }, 160); wear(c.id); m.eqPick = null; return; }
      if (m.eqPick === c.id) { m.eqInfo = { id: c.id, from: 'bag' }; playSnd('ui_click'); return; }
      m.eqPick = c.id; playSnd('ui_click'); return; }
    consumeTap(); m.eqPick = null;
  };
  function wear(id) {
    if (isAlly()) { if (window.ALLY_EQ_OK && !ALLY_EQ_OK(id)) { toast(ITEM_DB[id].name + '是叶孤星专属，旁人用不了'); return; } if (window.equipAlly && equipAlly(S.menu.who, id)) toast(memberInfo(S.menu.who).name + ' 换上了 ' + ITEM_DB[id].name); }
    else { equipItem(id); playSnd('ui_confirm'); toast('已装备 ' + ITEM_DB[id].name); }
  }
})();
