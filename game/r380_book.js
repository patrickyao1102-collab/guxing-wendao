// ================= R380 · 行囊「线装册」：乌木鎏金那套皮升级——木案上摊开一本线装册（Codex R380 体检的改版图 A1 + 拆件）（只进测试版）=================
// 作者 11-27 凌晨：「行囊设计像不像个游戏？」Codex 的第二意见和我的判断一致：现在的行囊信息齐全，但像做工精致的 App——缺材质，物件太小。
// Codex 画了改版效果图（线装册摊在木案上、随身四件做成大物件位）并拆了件。这里先接两样：
//   ① 外壳：行囊第三套皮（「换…」轮到乌木那一档）换成木案 + 蓝布 + 线装册，页签是挂牌，灵石条 / 关闭 / 头像环都换成有材质的件；十页都在这本册子上。
//   ② 状态页照 A1 重排：名字、境界、三条槽、攻防身法在左，半身像在右，下面一条托盘放「随身」四件大物件位（空位有压印；点一下跳到装备页那一栏）。
//   ③ 背包页照 A2 重排：左边蓝布衬里上一格一件（图标比原来大一倍，一页 12 件），右边一页纸写这件东西是什么；丹药直接在纸上点「给谁服用」，装备可以「去换上」。
// 玄青 / 白玉两套不动，默认仍是作者原来用的那套。
(function () {
  if (!window.R201_BAG || !window.R373_SKIN || typeof drawMenu !== 'function' || typeof drawStatus !== 'function') return;
  const IM = R201_BAG.IM;
  const N = ['bg', 'tab_normal', 'tab_selected', 'currency_plate', 'close_normal', 'close_pressed', 'name_tag', 'section_tag', 'item_name_tag', 'portrait_ring_normal', 'portrait_ring_selected', 'slot_normal', 'slot_selected', 'equipment_tray',
    'imprint_sword', 'imprint_robe', 'imprint_boots', 'imprint_pendant', 'health_track', 'health_fill', 'spirit_track', 'spirit_fill', 'cultivation_track', 'cultivation_fill', 'attack_badge', 'defense_badge', 'agility_badge', 'detail_page', 'target_status_tag', 'use_normal', 'use_disabled'];
  const A = {}; let nOk = 0, started = false;
  function load() { if (started) return; started = true; for (const k of N) { const im = new Image(); im.onload = () => { A[k] = im; nOk++; }; im.src = 'r380/' + k + '.webp?v=1'; } }
  const ready = () => nOk >= N.length;
  let built = false;
  const on = () => built && R373_SKIN.on;
  window.R380_BOOK = { get on() { return on(); }, ready };
  const KAI = () => '"R201WK",' + FONT, BR = () => '"R201MS","GuxingWKB",' + BRUSH, SONG = () => '"R201NS",' + FONT;

  // ---------- 九宫 ----------
  function nine(g, im, x, y, w, h, l, t, r, b) { const sw = im.width, sh = im.height, ls = l, ts = t, rs = r, bs = b; if (l + r > w) { const k = w / (l + r); l *= k; r *= k; } if (t + b > h) { const k = h / (t + b); t *= k; b *= k; }
    const SX = [0, ls, sw - rs, sw], SY = [0, ts, sh - bs, sh], DX = [x, x + l, x + w - r, x + w], DY = [y, y + t, y + h - b, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const a = SX[i + 1] - SX[i], bb = SY[j + 1] - SY[j], c = DX[i + 1] - DX[i], d = DY[j + 1] - DY[j]; if (a > 0 && bb > 0 && c > 0 && d > 0) g.drawImage(im, SX[i], SY[j], a, bb, DX[i], DY[j], c, d); } }

  // ---------- ① 外壳：把乌木那套里的几件换成线装册的 ----------
  const store = {}, MY = {};
  function ov(k, paint) { const d = Object.getOwnPropertyDescriptor(IM, k); if (d && d.get) return; const src = IM[k]; if (!src || !src.width) return; store[k] = src;
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.scale(2, 2); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    try { paint(g, src.width / 2, src.height / 2, src); } catch (e) { console.warn('R380 piece', k, e); return; } MY[k] = c;
    Object.defineProperty(IM, k, { configurable: true, enumerable: true, get() { return R373_SKIN.on && MY[k] ? MY[k] : store[k]; }, set(v) { store[k] = v; } }); }
  const T = (g, s, x, y, size, col, font, wt, align) => { g.font = `${wt || 600} ${size}px ${font}`; g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); };
  function build() {
    ov('bg_full', (g, w, h) => { g.drawImage(A.bg, 0, 0, w, h); });
    ov('panel_main_9', () => {});
    ov('title_xingnang', (g, w, h, src) => { const jade = JADE0.title_xingnang; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 6; g.shadowOffsetY = 2;
      if (jade) { const o = document.createElement('canvas'); o.width = jade.width; o.height = jade.height; const c = o.getContext('2d'); c.drawImage(jade, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#E8D5AC'; c.fillRect(0, 0, o.width, o.height); g.drawImage(o, 0, 0, w, h); }
      else T(g, '行囊', w / 2 - 6, h / 2 + 2, 66, '#E8D5AC', BR(), 700); });
    for (const t of (typeof MTABS !== 'undefined' ? MTABS : [])) for (const st of ['n', 's']) ov('tab_' + t + '_' + st, (g, w, h) => { g.drawImage(st === 's' ? A.tab_selected : A.tab_normal, 1, 0, 74, 112); const ch = [...t], gp = 31, y0 = 54 - (ch.length - 1) * gp / 2; ch.forEach((c, i) => T(g, c, 38, y0 + i * gp, 27, st === 's' ? '#FFF0C5' : '#E7D2A7', KAI())); });
    ov('avatar_ring_n', (g, w, h) => g.drawImage(A.portrait_ring_normal, 0, 0, w, h)); ov('avatar_ring_s', (g, w, h) => g.drawImage(A.portrait_ring_selected, 0, 0, w, h));
    ov('avatar_name_plate', (g, w, h) => nine(g, A.name_tag, 0, 0, w, h, 12, 6, 12, 6));
    ov('currency_bar_9', (g, w, h) => nine(g, A.currency_plate, 0, 0, w, h, 21, 10, 21, 10));
    ov('label_灵石', (g, w, h) => T(g, '灵石', 0, h / 2, 23, '#E4CC96', KAI(), 600, 'left')); ov('label_星辰点', (g, w, h) => T(g, '星辰点', 0, h / 2, 23, '#E4CC96', KAI(), 600, 'left'));
    ov('btn_close_n', (g, w, h) => { g.drawImage(A.close_normal, 0, 0, w, h); T(g, '关 闭', w / 2, h / 2 + 1, 22, '#F2DCA6', KAI()); }); ov('btn_close_p', (g, w, h) => { g.drawImage(A.close_pressed, 0, 0, w, h); T(g, '关 闭', w / 2, h / 2 + 3, 22, '#F2DCA6', KAI()); });
    built = true; }
  // 白玉原件（题字要从原图上取字形）：R373 换皮之后 IM 里是乌木件，这里留一手
  const JADE0 = {};
  function stash() { if (JADE0.title_xingnang || R373_SKIN.on) return; const im = IM.title_xingnang; if (im && im.width) JADE0.title_xingnang = im; }

  // ---------- ② 状态页（A1） ----------
  const SLOTS = [['weapon', '武器', 'imprint_sword', 266, 254], ['armor', '衣服', 'imprint_robe', 536, 216], ['shoe', '鞋子', 'imprint_boots', 769, 213], ['acc', '饰品', 'imprint_pendant', 998, 211]];
  const PORT = new Map();
  function portrait(im) { let c = PORT.get(im); if (c) return c; try { const sw = im.width, sh = Math.round(im.width * .86); c = document.createElement('canvas'); c.width = sw; c.height = sh; const g = c.getContext('2d'); g.drawImage(im, 0, 0, sw, sh, 0, 0, sw, sh);
      g.globalCompositeOperation = 'destination-in'; let gr = g.createLinearGradient(0, sh * .74, 0, sh); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, sw, sh);
      gr = g.createLinearGradient(0, 0, sw * .16, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, sw, sh); } catch (e) { c = im; } PORT.set(im, c); return c; }
  const eqOf = mi => (mi.ally && window.allyEqOf ? allyEqOf(mi.k) : S.hero.equip) || {};
  function meter(track, fill, x, y, v, text) { nine(ctx, A[track], x, y, 380, 26, 14, 6, 14, 6); const k = Math.max(0, Math.min(1, v || 0)); if (k > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x + 5, y + 4, 370 * k, 18); ctx.clip(); ctx.drawImage(A[fill], x + 5, y + 4, 370, 18); ctx.restore(); }
    ctx.font = `600 17px ${SONG()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 2.6; ctx.strokeStyle = '#291E19'; ctx.strokeText(text, x + 190, y + 13.5); ctx.fillStyle = '#FFF6E7'; ctx.fillText(text, x + 190, y + 13.5); }
  function statusPage(mi, now) {
    ctx.save();
    ctx.drawImage(A.bg, 212 * 2, 110 * 2, 1046 * 2, 584 * 2, 212, 110, 1046, 584);   // 把这一页的纸重新铺一遍（盖掉原来那页的内框）
    // 半身像
    const im = IMG[mi.p]; if (im) { const pc = portrait(im), pw = 470, ph = pw * pc.height / pc.width, dx = /^p_luochen/.test(mi.p) ? -40 : 0; ctx.drawImage(pc, 770 + dx, 62 + Math.sin(now * 1.2) * 2, pw, ph); }
    // 名字 / 境界
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `700 54px ${BR()}`; ctx.fillStyle = '#30241C'; ctx.fillText(mi.name, 298, 164); const nw = ctx.measureText(mi.name).width;
    ctx.font = `600 22px ${KAI()}`; ctx.fillStyle = '#423022'; ctx.fillText(mi.lv + ' 级　·　' + mi.realm, 298 + nw + 26, 172);
    // 三条槽
    const rows = [['气血', 'health', mi.hp / mi.maxhp, mi.hp + ' / ' + mi.maxhp], ['灵力', 'spirit', mi.mp / mi.maxmp, mi.mp + ' / ' + mi.maxmp]]; if (!mi.ally) rows.push(['修为', 'cultivation', mi.exp / mi.need, mi.exp + ' / ' + mi.need]);
    rows.forEach(([lab, k, v, t], i) => { const y = 215 + i * 42; ctx.font = `600 21px ${KAI()}`; ctx.textAlign = 'left'; ctx.fillStyle = '#453425'; ctx.fillText(lab, 300, y + 14); meter(k + '_track', k + '_fill', 381, y, v, t); });
    ctx.fillStyle = 'rgba(70,50,30,.35)'; ctx.fillRect(300, 344, 462, 1);
    [['攻击', mi.atk, 303, 'attack_badge'], ['防御', mi.def, 471, 'defense_badge'], ['身法', mi.spd, 644, 'agility_badge']].forEach(([n, v, x, b], i) => { ctx.drawImage(A[b], x, 360, 51, 50); ctx.font = `600 17px ${KAI()}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFF0CC'; ctx.fillText(n, x + 25.5, 386);
      ctx.font = `600 33px ${SONG()}`; ctx.textAlign = 'left'; ctx.fillStyle = '#37291C'; ctx.fillText(String(v), x + 62, 386); if (i) { ctx.fillStyle = 'rgba(70,50,30,.3)'; ctx.fillRect(x - 35, 369, 1, 31); } });
    // 随身托盘
    nine(ctx, A.equipment_tray, 232, 467, 1009, 236, 71, 47, 71, 47); nine(ctx, A.section_tag, 634, 454, 156, 36, 31, 8, 31, 8); ctx.font = `600 20px ${KAI()}`; ctx.textAlign = 'center'; ctx.fillStyle = '#F1DEB4'; ctx.fillText('随 身', 712, 472);
    const eq = eqOf(mi);
    SLOTS.forEach(([s, n, imp, x, w]) => { const id = eq[s], it = id && ITEM_DB[id]; nine(ctx, A.slot_normal, x, 499, w, 166, 19, 19, 19, 19); const cx = x + w / 2;
      if (it) { let drawn = false; try { const ic = window.R370_ICON && R370_ICON(id); if (ic) { ctx.drawImage(ic, cx - 54, 509, 108, 108); drawn = true; } else if (window.UI_ICON2 && UI_ICON2.has(id)) { UI_ICON2.draw(id, cx, 563, 108); drawn = true; } } catch (e) {} if (!drawn) { try { itemIcon(id, cx, 563, 44); } catch (e) {} } }
      else { ctx.globalAlpha = .9; ctx.drawImage(A[imp], cx - 79, 505, 158, 116); ctx.globalAlpha = 1; }
      nine(ctx, A.item_name_tag, x + 12, 623, w - 25, 37, 18, 10, 18, 10); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = `600 17px ${KAI()}`; ctx.fillStyle = '#EAC894'; ctx.fillText(n, x + 26, 642);
      if (it) { const st = typeof statText === 'function' ? String(statText(it)).split(/[　 ，,]/)[0] : ''; ctx.font = `500 17px ${KAI()}`; ctx.fillStyle = '#EDE0C8'; ctx.save(); ctx.font = `400 14px ${KAI()}`; const sw = st ? ctx.measureText(st).width + 10 : 0; ctx.restore(); let nm = it.name; const maxW = w - 25 - 62 - sw; while (nm.length > 2 && ctx.measureText(nm).width > maxW) nm = nm.slice(0, -1); ctx.fillText(nm, x + 72, 642);
        if (st) { ctx.font = `400 14px ${KAI()}`; ctx.fillStyle = '#C6BEB1'; ctx.textAlign = 'right'; ctx.fillText(st, x + w - 24, 642); } }
      else { ctx.font = `400 16px ${KAI()}`; ctx.fillStyle = '#C7BFB2'; ctx.fillText('未装备', x + 72, 642); } });
    ctx.restore(); }
  drawStatus = (o => function () { if (on() && window.R201_IN) return; return o.apply(this, arguments); })(drawStatus);

  // ---------- ③ 背包页（A2）：左边蓝布衬里上摆物件，右边一页纸写详情 ----------
  const PER = 12, GC = 4, GX = 254, GY = 198, GW = 596, GAP = 8, CW = (GW - (GC - 1) * GAP) / GC, CH = 138;
  const CATN = { use: '丹药', gear: '装备', book: '秘籍', mat: '材料' };
  if (typeof bagPages === 'function') bagPages = (o => function () { return on() ? Math.max(1, Math.ceil(bagFiltered().length / PER)) : o.apply(this, arguments); })(bagPages);
  if (typeof bagTabs === 'function') bagTabs = (o => function (L) { return on() ? BAG_CATS.map(([k, n], i) => ({ k, n, x: 264 + i * 117, y: 143, w: 107, h: 42 })) : o.apply(this, arguments); })(bagTabs);
  if (typeof bagPager === 'function') bagPager = (o => function (L) { return on() ? { prev: { x: 428, y: 636, w: 84, h: 32 }, next: { x: 592, y: 636, w: 84, h: 32 } } : o.apply(this, arguments); })(bagPager);
  if (typeof bagCells === 'function') bagCells = (o => function (L) { if (!on()) return o.apply(this, arguments); const pg = Math.min(S.menu.bagPage || 0, bagPages() - 1);
    return bagFiltered().slice(pg * PER, pg * PER + PER).map((id, i) => ({ id, x: GX + (i % GC) * (CW + GAP), y: GY + Math.floor(i / GC) * (CH + GAP), w: CW, h: CH })); })(bagCells);
  const UBR = { x: 959, y: 602, w: 212, h: 57 };
  if (typeof useBtn === 'function') useBtn = (o => function (L) { const r = o.apply(this, arguments); return r && on() && S.menu && S.menu.tab === 2 ? UBR : r; })(useBtn);
  if (typeof drawBag === 'function') drawBag = (o => function () { if (on() && window.R201_IN) return; return o.apply(this, arguments); })(drawBag);
  function icon(id, cx, cy, size) { try { const ic = window.R370_ICON && R370_ICON(id); if (ic) { ctx.drawImage(ic, cx - size / 2, cy - size / 2, size, size); return; } if (window.UI_ICON2 && UI_ICON2.has(id)) { UI_ICON2.draw(id, cx, cy, size); return; } } catch (e) {} try { itemIcon(id, cx, cy, size * .42); } catch (e) {} }
  function fit(t, maxW) { let s = t; while (s.length > 2 && ctx.measureText(s).width > maxW) s = s.slice(0, -1); return s === t ? t : s.slice(0, -1) + '…'; }
  function wrap(t, maxW) { const ls = []; let ln = ''; for (const ch of String(t || '')) { if (ch === '\n') { ls.push(ln); ln = ''; continue; } if (ctx.measureText(ln + ch).width > maxW && ln) { ls.push(ln); ln = ch; } else ln += ch; } if (ln) ls.push(ln); return ls; }
  const healable = it => it && it.use === 'heal';
  function targetRows() { const ks = partyList(), h = ks.length > 3 ? 36 : 40, g = ks.length > 3 ? 3 : 5; return ks.map((k, i) => ({ k, x: 893, y: 436 + i * (h + g), w: 341, h })); }
  const full = mi => mi.hp >= mi.maxhp && mi.mp >= mi.maxmp;
  function bagPage() {
    const m = S.menu, L = menuLayout(), ids = bagIds();
    ctx.save(); ctx.textBaseline = 'middle';
    ctx.drawImage(A.bg, 212 * 2, 110 * 2, 1046 * 2, 584 * 2, 212, 110, 1046, 584);
    nine(ctx, A.slot_normal, 232, 111, 638, 565, 19, 19, 19, 19); nine(ctx, A.detail_page, 867, 107, 393, 573, 56, 56, 56, 56);
    // 分类签
    for (const b of bagTabs(L)) { const sel = (m.bagCat || 'all') === b.k, n = b.k === 'all' ? ids.length : ids.filter(id => bagCatOf(id) === b.k).length;
      ctx.globalAlpha = sel || n ? 1 : .5; ctx.drawImage(sel ? A.use_normal : A.close_normal, b.x, b.y, b.w, b.h); ctx.font = `600 19px ${KAI()}`; ctx.textAlign = 'center'; ctx.fillStyle = sel ? '#FFF0C5' : '#E2CFA6'; ctx.fillText(b.n + ' ' + n, b.x + b.w / 2, b.y + b.h / 2 + 1); ctx.globalAlpha = 1; }
    // 物件格
    const cells = bagCells(L);
    for (const c of cells) { const it = ITEM_DB[c.id], sel = m.sel === c.id, cx = c.x + c.w / 2, n = itemCount(c.id);
      nine(ctx, sel ? A.slot_selected : A.slot_normal, c.x, c.y, c.w, c.h, 19, 19, 19, 19);
      if (sel) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(cx, c.y + 54, 4, cx, c.y + 54, 70); g.addColorStop(0, 'rgba(255,214,130,.22)'); g.addColorStop(1, 'rgba(255,214,130,0)'); ctx.fillStyle = g; ctx.fillRect(c.x + 6, c.y + 6, c.w - 12, c.h - 12); ctx.restore(); }
      icon(c.id, cx, c.y + 54, 88);
      if (n > 1) { ctx.font = `700 19px ${SONG()}`; ctx.textAlign = 'right'; ctx.lineWidth = 3.5; ctx.strokeStyle = '#131722'; ctx.strokeText('×' + n, c.x + c.w - 14, c.y + 88); ctx.fillStyle = '#FFE7B0'; ctx.fillText('×' + n, c.x + c.w - 14, c.y + 88); }
      nine(ctx, A.item_name_tag, c.x + 8, c.y + c.h - 38, c.w - 16, 30, 18, 10, 18, 10); ctx.font = `600 16px ${KAI()}`; ctx.textAlign = 'center'; ctx.fillStyle = sel ? '#FFF0C5' : '#E9DCC2'; ctx.fillText(fit(it.name, c.w - 34), cx, c.y + c.h - 22); }
    if (!cells.length) { ctx.font = `600 20px ${KAI()}`; ctx.textAlign = 'center'; ctx.fillStyle = '#9FA9BC'; ctx.fillText(ids.length ? '这一类暂时没有东西。' : '行囊空空如也。', 551, 400); }
    // 翻页
    { const np = bagPages(); if (np > 1) { const P = bagPager(L), pg = Math.min(m.bagPage || 0, np - 1); for (const [r, lab, ok] of [[P.prev, '上一页', pg > 0], [P.next, '下一页', pg < np - 1]]) { ctx.globalAlpha = ok ? 1 : .38; ctx.drawImage(A.close_normal, r.x, r.y, r.w, r.h); ctx.font = `600 16px ${KAI()}`; ctx.textAlign = 'center'; ctx.fillStyle = '#E9D7AE'; ctx.fillText(lab, r.x + r.w / 2, r.y + r.h / 2 + 1); ctx.globalAlpha = 1; }
        ctx.font = `600 17px ${SONG()}`; ctx.textAlign = 'center'; ctx.fillStyle = '#D9C9A6'; ctx.fillText((pg + 1) + ' / ' + np, 552, 653); } }
    // 详情页
    const id = m.sel, it = id && itemCount(id) > 0 ? ITEM_DB[id] : null, CX = 1063, X0 = 899;
    if (!it) { ctx.globalAlpha = .5; ctx.drawImage(A.imprint_pendant, CX - 79, 250, 158, 116); ctx.globalAlpha = 1; ctx.font = `600 19px ${KAI()}`; ctx.textAlign = 'center'; ctx.fillStyle = '#6B5338'; ctx.fillText('点左边的物件，看看它是什么', CX, 400); ctx.font = `500 16px ${KAI()}`; ctx.fillStyle = '#8A7355'; ctx.fillText('丹药可以直接给队里的人服用', CX, 430); ctx.restore(); return; }
    ctx.fillStyle = 'rgba(70,50,30,.13)'; ctx.beginPath(); ctx.ellipse(CX, 247, 62, 8, 0, 0, 7); ctx.fill(); icon(id, CX, 188, 118);
    const heal = healable(it); let ub = null; try { ub = useBtn(L); } catch (e) {}
    ctx.textAlign = 'center'; ctx.font = `700 34px ${BR()}`; ctx.fillStyle = '#30241C'; ctx.fillText(fit(it.name, 320), CX, 281);
    ctx.font = `600 17px ${KAI()}`; ctx.fillStyle = '#7A5A32'; ctx.fillText((it.cat || (/剧情物品/.test(it.desc || '') ? '要紧物件' : ub && !heal && !it.slot ? '可用之物' : CATN[bagCatOf(id)]) || '物件') + '　·　持有 ' + itemCount(id), CX, 312);
    ctx.fillStyle = 'rgba(70,50,30,.3)'; ctx.fillRect(X0 + 6, 330, 316, 1);
    ctx.textAlign = 'left'; ctx.font = `500 17px ${KAI()}`; ctx.fillStyle = '#3E2D1F'; const ls = wrap(it.desc || '', 322), maxL = heal ? 2 : (ub || it.slot ? 6 : 9); let y = 352;
    ls.slice(0, maxL).forEach((l, i) => { ctx.fillText(i === maxL - 1 && ls.length > maxL ? l.slice(0, -1) + '…' : l, X0 + 4, y); y += 25; });
    if (it.slot && typeof statText === 'function') { const st = statText(it); if (st) { y += 6; ctx.font = `600 18px ${KAI()}`; ctx.fillStyle = '#8C2F22'; ctx.fillText(st, X0 + 4, y); y += 26; } // 和身上那件比一比（看的是上面选中的那个人）
      try { const mi = memberInfo(m.who), curId = eqOf(mi)[it.slot], cur = curId && ITEM_DB[curId]; y += 8; ctx.fillStyle = 'rgba(70,50,30,.22)'; ctx.fillRect(X0 + 6, y - 6, 316, 1); y += 14;
        ctx.font = `500 16px ${KAI()}`; ctx.fillStyle = '#6B5338'; ctx.fillText(fit(mi.name + '身上：' + (cur ? cur.name : '空着'), 320), X0 + 4, y); y += 26;
        if (curId === m.sel) { ctx.fillStyle = '#7C6B55'; ctx.fillText('就是这一件', X0 + 4, y); }
        else { let dx = X0 + 4; ctx.font = `600 17px ${KAI()}`; for (const k of STATS) { const d = (it[k] || 0) - ((cur && cur[k]) || 0); if (!it[k] && !(cur && cur[k])) continue; const t = STAT_CN[k] + (d > 0 ? ' ▲' + d : d < 0 ? ' ▼' + (-d) : ' ='); ctx.fillStyle = d > 0 ? '#2F7A2A' : d < 0 ? '#B0352A' : '#7C6B55'; if (dx + ctx.measureText(t).width > X0 + 322) { dx = X0 + 4; y += 24; } ctx.fillText(t, dx, y); dx += ctx.measureText(t).width + 16; } } } catch (e) {} }
    const btn = (lab, ok) => { ctx.drawImage(ok ? A.use_normal : A.use_disabled, UBR.x, UBR.y, UBR.w, UBR.h); ctx.font = `600 24px ${KAI()}`; ctx.textAlign = 'center'; ctx.fillStyle = ok ? '#FFF0C5' : '#B9B4AA'; ctx.fillText(lab, UBR.x + UBR.w / 2, UBR.y + UBR.h / 2 + 1); };
    if (heal) { nine(ctx, A.section_tag, CX - 70, 400, 140, 30, 31, 8, 31, 8); ctx.font = `600 17px ${KAI()}`; ctx.textAlign = 'center'; ctx.fillStyle = '#F1DEB4'; ctx.fillText('给谁服用', CX, 415);
      for (const r of targetRows()) { const mi = memberInfo(r.k), sel = m.who === r.k, f = full(mi), cy = r.y + r.h / 2;
        ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fillStyle = sel ? 'rgba(150,52,30,.13)' : 'rgba(255,255,255,.18)'; ctx.fill(); ctx.lineWidth = sel ? 2 : 1; ctx.strokeStyle = sel ? '#9A4A22' : 'rgba(70,50,30,.28)'; ctx.stroke();
        try { medallion(mi.p, r.x + 24, cy, r.h / 2 - 4, { name: mi.name }); } catch (e) {}
        ctx.textAlign = 'left'; ctx.font = `600 18px ${KAI()}`; ctx.fillStyle = '#30241C'; ctx.fillText(mi.name, r.x + 50, cy + 1); const nameW = ctx.measureText(mi.name).width;
        ctx.font = `500 15px ${SONG()}`; ctx.fillStyle = f ? '#7C6B55' : '#8C2F22'; ctx.textAlign = 'right'; let stt = f ? '气血灵力皆满' : '气血 ' + mi.hp + '/' + mi.maxhp + '　灵力 ' + mi.mp + '/' + mi.maxmp;
        if (!f && ctx.measureText(stt).width > r.w - 50 - nameW - 26) stt = mi.hp < mi.maxhp ? '气血 ' + mi.hp + '/' + mi.maxhp : '灵力 ' + mi.mp + '/' + mi.maxmp;   /* 手机上小字会被放大，两段写不下就只写缺的那一样 */
        ctx.fillText(stt, r.x + r.w - 12, cy + 1); }
      const cur = memberInfo(m.who); btn(full(cur) ? '不必服用' : '给' + cur.name + '服用', !full(cur)); }
    else if (ub) btn('使 用', true);
    else if (it.slot) btn('去换上', true);
    ctx.restore(); }

  // ---------- 接进行囊 ----------
  const INK = /^#3e2d18$/i, GOLDC = /^#9a671f$/i, BLUEC = /^#315e90$/i;
  drawMenu = (o => function () {
    try { stash(); if (R373_SKIN.on) { load(); if (ready() && !built && R201_BAG.ready() && IM.bg_full && IM.bg_full.getContext) build(); } } catch (e) { console.warn('R380 build', e); }
    // 玄青那套右上角的小签原来写「换白玉」，可下一套其实是线装册——照实写
    if (!R373_SKIN.on && S.menu && window.BDK && BDK.on) { const f0 = ctx.fillText; ctx.fillText = function (t) { if (t === '换白玉') arguments[0] = '换线装册'; return f0.apply(this, arguments); }; try { return o.apply(this, arguments); } finally { ctx.fillText = f0; } }
    if (!on() || !S.menu) return o.apply(this, arguments);
    // 册子外面是深色木案：头像下的名字、灵石数目原来是深墨色，换成浅色
    const ft = ctx.fillText, who = S.menu.who || 'hero', names = {}; try { for (const k of partyList()) names[memberInfo(k).name] = k; } catch (e) {}
    ctx.fillText = function (t, x, y) { try { const fs = String(this.fillStyle); if (y > 84 && y < 104 && names[t] && INK.test(fs)) this.fillStyle = names[t] === who ? '#33231A' : '#E9D7B1'; else if (y > 44 && y < 68 && x > 860 && x < 1140) { if (GOLDC.test(fs)) this.fillStyle = '#E4CC96'; else if (BLUEC.test(fs)) this.fillStyle = '#A7CFFF'; } } catch (e) {} return ft.apply(this, arguments); };
    let r; try { r = o.apply(this, arguments); } finally { ctx.fillText = ft; }
    try { const m = S.menu; if (m && m.tab === 0 && !m.savePage && !(typeof choice !== 'undefined' && choice)) statusPage(memberInfo(who), performance.now() / 1000); else if (m && m.tab === 2 && !m.savePage) bagPage(); } catch (e) { console.warn('R380 page', e); try { ctx.restore(); } catch (e2) {} }
    return r; })(drawMenu);
  // 页签挂牌的位置照 Codex 的版式（往左挪一点，别压着册脊）
  if (typeof menuLayout === 'function') menuLayout = (o => function () { const L = o.apply(this, arguments); try { if (on() && L && L.tabs) { const YS = [121, 238, 350, 461, 566, 671]; L.tabs.forEach((r, i) => { r.x = 17 + (i % 2) * 84; r.y = YS[Math.floor(i / 2)] || r.y; r.w = 76; r.h = 108; }); } } catch (e) {} return L; })(menuLayout);
  // 点随身的物件位 → 跳到装备页那一栏
  if (typeof menuUpdate === 'function') menuUpdate = (o => function () { try { const m = S.menu, t = input.tapped;
      if (on() && m && m.tab === 2 && !m.savePage && t && !t.key && m.sel && itemCount(m.sel) > 0) { const it = ITEM_DB[m.sel];   // 背包页：纸上点「给谁服用」/「去换上」
        if (healable(it)) { const r = targetRows().find(r => t.x >= r.x && t.x <= r.x + r.w && t.y >= r.y && t.y <= r.y + r.h); if (r) { consumeTap(); m.who = r.k; try { playSnd('ui_click'); } catch (e) {} return; } }
        else if (it && it.slot && !useBtn(menuLayout()) && t.x >= UBR.x && t.x <= UBR.x + UBR.w && t.y >= UBR.y && t.y <= UBR.y + UBR.h) { consumeTap(); m.tab = 1; m.eqSlot = it.slot; m.eqScroll = 0; m.eqPick = null; m.eqInfo = null; try { playSnd('ui_click'); } catch (e) {} return; } } if (on() && m && m.tab === 0 && !m.savePage && t && !t.key && t.y >= 499 && t.y <= 665) { const s = SLOTS.find(([, , , x, w]) => t.x >= x && t.x <= x + w); if (s) { consumeTap(); m.tab = 1; m.eqSlot = s[0]; m.eqScroll = 0; m.eqPick = null; m.eqInfo = null; try { playSnd('ui_click'); } catch (e) {} return; } } } catch (e) {} return o.apply(this, arguments); })(menuUpdate);
  if (R373_SKIN.on) setTimeout(load, 8000);
})();
