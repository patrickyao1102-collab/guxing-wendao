// ================= R380 · 行囊「线装册」：乌木鎏金那套皮升级——木案上摊开一本线装册（Codex R380 体检的改版图 A1 + 拆件）（只进测试版）=================
// 作者 11-27 凌晨：「行囊设计像不像个游戏？」Codex 的第二意见和我的判断一致：现在的行囊信息齐全，但像做工精致的 App——缺材质，物件太小。
// Codex 画了改版效果图（线装册摊在木案上、随身四件做成大物件位）并拆了件。这里先接两样：
//   ① 外壳：行囊第三套皮（「换…」轮到乌木那一档）换成木案 + 蓝布 + 线装册，页签是挂牌，灵石条 / 关闭 / 头像环都换成有材质的件；十页都在这本册子上。
//   ② 状态页照 A1 重排：名字、境界、三条槽、攻防身法在左，半身像在右，下面一条托盘放「随身」四件大物件位（空位有压印；点一下跳到装备页那一栏）。
// 背包页的大格版（A2）等作者看过再接。玄青 / 白玉两套不动，默认仍是作者原来用的那套。
(function () {
  if (!window.R201_BAG || !window.R373_SKIN || typeof drawMenu !== 'function' || typeof drawStatus !== 'function') return;
  const IM = R201_BAG.IM;
  const N = ['bg', 'tab_normal', 'tab_selected', 'currency_plate', 'close_normal', 'close_pressed', 'name_tag', 'section_tag', 'item_name_tag', 'portrait_ring_normal', 'portrait_ring_selected', 'slot_normal', 'slot_selected', 'equipment_tray',
    'imprint_sword', 'imprint_robe', 'imprint_boots', 'imprint_pendant', 'health_track', 'health_fill', 'spirit_track', 'spirit_fill', 'cultivation_track', 'cultivation_fill', 'attack_badge', 'defense_badge', 'agility_badge'];
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
    ctx.font = `600 22px ${KAI()}`; ctx.fillStyle = '#423022'; ctx.fillText(mi.realm + '　·　' + mi.lv + ' 级', 298 + nw + 26, 172);
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

  // ---------- 接进行囊 ----------
  const INK = /^#3e2d18$/i, GOLDC = /^#9a671f$/i, BLUEC = /^#315e90$/i;
  drawMenu = (o => function () {
    try { stash(); if (R373_SKIN.on) { load(); if (ready() && !built && R201_BAG.ready() && IM.bg_full && IM.bg_full.getContext) build(); } } catch (e) { console.warn('R380 build', e); }
    if (!on() || !S.menu) return o.apply(this, arguments);
    // 册子外面是深色木案：头像下的名字、灵石数目原来是深墨色，换成浅色
    const ft = ctx.fillText, who = S.menu.who || 'hero', names = {}; try { for (const k of partyList()) names[memberInfo(k).name] = k; } catch (e) {}
    ctx.fillText = function (t, x, y) { try { const fs = String(this.fillStyle); if (y > 84 && y < 104 && names[t] && INK.test(fs)) this.fillStyle = names[t] === who ? '#33231A' : '#E9D7B1'; else if (y > 44 && y < 68 && x > 860 && x < 1140) { if (GOLDC.test(fs)) this.fillStyle = '#E4CC96'; else if (BLUEC.test(fs)) this.fillStyle = '#A7CFFF'; } } catch (e) {} return ft.apply(this, arguments); };
    let r; try { r = o.apply(this, arguments); } finally { ctx.fillText = ft; }
    try { const m = S.menu; if (m && m.tab === 0 && !m.savePage && !(typeof choice !== 'undefined' && choice)) statusPage(memberInfo(who), performance.now() / 1000); } catch (e) { console.warn('R380 status', e); }
    return r; })(drawMenu);
  // 页签挂牌的位置照 Codex 的版式（往左挪一点，别压着册脊）
  if (typeof menuLayout === 'function') menuLayout = (o => function () { const L = o.apply(this, arguments); try { if (on() && L && L.tabs) { const YS = [121, 238, 350, 461, 566, 671]; L.tabs.forEach((r, i) => { r.x = 17 + (i % 2) * 84; r.y = YS[Math.floor(i / 2)] || r.y; r.w = 76; r.h = 108; }); } } catch (e) {} return L; })(menuLayout);
  // 点随身的物件位 → 跳到装备页那一栏
  if (typeof menuUpdate === 'function') menuUpdate = (o => function () { try { const m = S.menu, t = input.tapped; if (on() && m && m.tab === 0 && !m.savePage && t && !t.key && t.y >= 499 && t.y <= 665) { const s = SLOTS.find(([, , , x, w]) => t.x >= x && t.x <= x + w); if (s) { consumeTap(); m.tab = 1; m.eqSlot = s[0]; m.eqScroll = 0; m.eqPick = null; m.eqInfo = null; try { playSnd('ui_click'); } catch (e) {} return; } } } catch (e) {} return o.apply(this, arguments); })(menuUpdate);
  if (R373_SKIN.on) setTimeout(load, 8000);
})();
