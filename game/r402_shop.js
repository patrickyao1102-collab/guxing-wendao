// ================= R402 · 商店换成「像商店的商店」（只进测试版）=================
// 作者 11-27 14:20：「商店系统做的太花里胡哨了……很多时候看起来都不像一个商店，而像一个很精美的插画一样的。你要把它做的像商店一样的。」
// 14:23 点头的排法（和行囊、剑炉是一家）：
//   上：店名、买 / 卖、身上灵石、关闭
//   左：整面货架——一页十二格，每格图标 + 名字 + 价钱；货的种类多就出分类页签，能翻页
//   右：点中的那件——大图标、属性、说明；装备列出每个人换上以后是涨是跌（绿涨红跌）、合不合灵根
//   右下：数量 − / +、最多、合计、买后余多少、「买入」
//   卖：一样的格子，摆的是自己行囊里能卖的东西（卖装备要点两下；各人的专属装备不收）
// 不摆景、不站店主。旧的青瓷窗柜（R169）留着：测试面板里可以切回去；正式版里没有这个文件，还是旧的。
// 所有走 openShop 的店都换（r169_shop.js 开店那一下先看 window.R402_SHOP）。
(function () {
  const K = window.R386_KIT; if (!K || typeof cv === 'undefined' || typeof ITEM_DB === 'undefined' || typeof openShop !== 'function') return;
  const { D, T, C, BR, KAI, NUM, fit: fitW, wrap, kitLoad, kitReady, inR } = K;
  const F = () => (S.flags = S.flags || {});
  const UI = { open: false, hide: false, under: false, t0: 0, taps: [], mode: 'buy', cat: 0, page: 0, sel: null, qty: 1, ids: [], title: '', msg: '', msgOk: false, msgT: 0, arm: null, press: 0 };
  const P = { x: 20, y: 96, w: 1240, h: 604 }, BODY = { x: 40, y: 112, w: 1200, h: 572 }, CLOSE = { x: 1126, y: 34, w: 124, h: 46 };
  const GL = { x: 52, y: 124, w: 716, h: 548 }, DP = { x: 780, y: 124, w: 448, h: 548 }, BY = DP.y + DP.h;
  const COLS = 3, ROWS = 4, PER = COLS * ROWS, CW = 226, CH = 100, GAP = 8, GX = GL.x + 11, GY = GL.y + 58;
  const cellR = i => ({ x: GX + (i % COLS) * (CW + GAP), y: GY + Math.floor(i / COLS) * (CH + GAP), w: CW, h: CH });
  const chipR = (i, n) => { const w = Math.min(92, Math.floor((GL.w - 22 - (n - 1) * 6) / n)); return { x: GL.x + 11 + i * (w + 6), y: GL.y + 12, w, h: 36 }; };
  const PG = { prev: { x: GL.x + 11, y: GL.y + GL.h - 50, w: 120, h: 38 }, next: { x: GL.x + GL.w - 131, y: GL.y + GL.h - 50, w: 120, h: 38 } };
  let TABX = 232; const tabR = i => ({ x: TABX + i * 132, y: 36, w: 124, h: 44 });
  const B_MINUS = { x: DP.x + 78, y: BY - 146, w: 58, h: 50 }, B_PLUS = { x: DP.x + 196, y: BY - 146, w: 58, h: 50 }, B_MAX = { x: DP.x + 268, y: BY - 146, w: 96, h: 50 }, B_GO = { x: DP.x + DP.w - 184, y: BY - 84, w: 168, h: 68 };
  const near = (p, r, d) => p.x >= r.x - d && p.x <= r.x + r.w + d && p.y >= r.y - d && p.y <= r.y + r.h + d;   // 手机上手指粗：小按钮的可点范围往外放一圈
  const snd = (n, v) => { try { playSnd(n, v || .7); } catch (e) {} };
  const note = (s, ok) => { UI.msg = s; UI.msgOk = !!ok; UI.msgT = performance.now(); };
  function btn(r, label, state, size) { D(state === 'd' ? 'button_d' : state === 'p' ? 'button_p' : 'button_n', r.x, r.y, r.w, r.h); T(label, r.x + r.w / 2, r.y + r.h / 2 + 1, size || 19, state === 'd' ? C.dim : C.gold2, KAI(), 600, 'center'); }

  // ---------- 货 ----------
  const KEYS = ['atk', 'def', 'maxhp', 'maxmp', 'spd'], SN = { atk: '攻击', def: '防御', maxhp: '气血', maxmp: '灵力', spd: '速度' };
  const CAT_ORDER = ['兵器', '护腕', '衣甲', '鞋履', '饰品', '丹药', '功法', '材料', '钓具', '食材', '杂物'];
  const isMat = id => { try { return !!(window.CRAFT && CRAFT.isMat && CRAFT.isMat(id)); } catch (e) { return false; } };
  const catOf = id => { const it = ITEM_DB[id] || {}; return it.slot === 'weapon' ? '兵器' : it.slot === 'wrist' ? '护腕' : it.slot === 'armor' ? '衣甲' : it.slot === 'shoe' ? '鞋履' : it.slot === 'acc' ? '饰品' : it.book ? '功法' : isMat(id) || /^m_/.test(id) ? '材料' : it.cat ? it.cat : (it.use || it.hp || it.mp || it.revive || /^p_/.test(id)) ? '丹药' : '杂物'; };
  const have = id => { try { return itemCount(id) || 0; } catch (e) { return (S.hero.bag[id] || 0); } };
  const wxOf = id => { try { return (window.WX5 && WX5.GEAR[id]) || (window.CRAFT && CRAFT.MAT[id] && CRAFT.MAT[id].wx) || null; } catch (e) { return null; } };
  const exclusive = id => { try { const it = ITEM_DB[id]; if (it.heroOnly) return true; const s = window.GEAR5 && GEAR5.setOfItem(it.base || id); return !!(s && s.owner); } catch (e) { return false; } };
  const rank = id => { const i = CAT_ORDER.indexOf(catOf(id)); return i < 0 ? 99 : i; };
  const sellList = () => Object.keys(S.hero.bag).filter(id => ITEM_DB[id] && ITEM_DB[id].sell > 0 && S.hero.bag[id] > 0 && !exclusive(id)).sort((a, b) => rank(a) - rank(b) || (ITEM_DB[b].sell || 0) - (ITEM_DB[a].sell || 0) || (a < b ? -1 : 1));
  const all = () => UI.mode === 'sell' ? sellList() : UI.ids;
  const catsOf = list => { const s = []; for (const id of list) { const c = catOf(id); if (!s.includes(c)) s.push(c); } return s.sort((a, b) => (CAT_ORDER.indexOf(a) + 100) % 100 - (CAT_ORDER.indexOf(b) + 100) % 100); };
  const priceOf = id => UI.mode === 'sell' ? (ITEM_DB[id].sell || 0) : (ITEM_DB[id].price || 0);
  const shortName = s => String(s || '').replace(/（(下品|中品|上品|极品|绝品)）/, '');
  const GRADE_COL = ['#A6AEA6', '#E4DDC9', '#9FC98F', '#9CC3E8', '#E9B96A'];
  // ---------- 换上以后是涨是跌 ----------
  const members = () => ['hero', ...((S.party || []).slice(0, 4))];
  const whoName = w => w === 'hero' ? '叶孤星' : ((typeof PARTY_DB !== 'undefined' && PARTY_DB[w]) || {}).name || w;
  const fitOf = (w, id) => { try { return window.GEAR5 ? GEAR5.fit(w, id) : 1; } catch (e) { return 1; } };
  const eqOf = w => { try { return window.GEAR5 ? GEAR5.eqOf(w) : (w === 'hero' ? (S.hero.equip || {}) : {}); } catch (e) { return {}; } };
  const eff = (w, id, k) => { const it = id && ITEM_DB[id]; return it ? Math.round((it[k] || 0) * fitOf(w, id)) : 0; };
  function deltas(w, id) { const it = ITEM_DB[id], cur = eqOf(w)[it.slot], out = []; for (const k of KEYS) { const d = eff(w, id, k) - eff(w, cur, k); if (d) out.push([k, d]); } out.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])); return { cur, out }; }
  const better = id => { try { const it = ITEM_DB[id]; if (!it.slot) return 0; const { cur, out } = deltas('hero', id); if (cur === id) return 0; return Math.sign(out.reduce((s, [, d]) => s + d, 0)); } catch (e) { return 0; } };
  const maxQty = id => { const it = ITEM_DB[id]; if (UI.mode === 'sell') return have(id); const pr = it.price || 0; return Math.max(0, Math.min(99, pr > 0 ? Math.floor((S.hero.gold || 0) / pr) : 99, it.xs ? Math.floor((S.hero.xs || 0) / it.xs) : 99)); };

  // ---------- 左：货架 ----------
  function shown() { const list = all(), cats = catsOf(list); if (UI.cat > cats.length) UI.cat = 0; return { list: UI.cat ? list.filter(id => catOf(id) === cats[UI.cat - 1]) : list, cats }; }
  function drawGoods(now) { D('panel_well_9', GL.x, GL.y, GL.w, GL.h); const { list, cats } = shown(), sell = UI.mode === 'sell';
    const chips = ['全部', ...cats]; if (cats.length > 1) chips.forEach((t, i) => { const r = chipR(i, chips.length), on = UI.cat === i; D(on ? 'category_s' : 'category_n', r.x, r.y, r.w, r.h); T(t, r.x + r.w / 2, r.y + r.h / 2 + 1, 17, on ? C.gold2 : C.text, KAI(), 600, 'center'); });
    else T(sell ? '行囊里能卖的' : (cats[0] || '货架'), GL.x + 18, GL.y + 30, 19, C.gold2, BR(), 400);
    const np = Math.max(1, Math.ceil(list.length / PER)); UI.page = Math.min(UI.page, np - 1); const page = list.slice(UI.page * PER, UI.page * PER + PER);
    if (!list.includes(UI.sel)) { UI.sel = page[0] || null; UI.qty = 1; UI.arm = null; }
    if (!list.length) { ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap(sell ? '行囊里没有能卖的东西。' : '今天的货卖完了。', GL.x + 24, GL.y + 110, GL.w - 48, 26, 2); }
    page.forEach((id, i) => { const r = cellR(i), it = ITEM_DB[id], on = UI.sel === id, pr = priceOf(id), n = have(id), poor = !sell && ((S.hero.gold || 0) < pr || (it.xs || 0) > (S.hero.xs || 0));
      D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h);
      ctx.save(); if (poor) ctx.globalAlpha *= .5; try { itemIcon(id, r.x + 48, r.y + 50, 31); } catch (e) {} const wx = !it.slot && wxOf(id); if (wx) { try { WX5.emblem(wx, r.x + 17, r.y + 18, 10, 1); } catch (e) {} } ctx.restore();   /* 装备的图标自己带五行小标，材料没有，这里补一个 */
      ctx.font = `600 19px ${KAI()}`; T(fitW(shortName(it.name), r.w - 104), r.x + 92, r.y + 33, 19, poor ? C.sub : C.text, KAI(), 600);
      const ps = String(pr); T(ps, r.x + 92, r.y + 66, 20, poor ? C.red : C.gold2, NUM(), 700); ctx.font = `700 20px ${NUM()}`; const pw = ctx.measureText(ps).width; T('灵石', r.x + 97 + pw, r.y + 68, 13, C.sub, KAI(), 500);
      if (!sell && it.xs) T('悬赏 ' + it.xs, r.x + r.w - 12, r.y + 68, 13, (it.xs || 0) > (S.hero.xs || 0) ? C.red : C.blue, KAI(), 600, 'right');
      if (sell) T('×' + n, r.x + r.w - 12, r.y + 68, 17, C.text, NUM(), 700, 'right'); else if (n) T('已有 ' + n, r.x + r.w - 12, r.y + 68, 14, C.sub, KAI(), 500, 'right');
      if (!sell) { const b = better(id); if (b) T(b > 0 ? '▲' : '▼', r.x + r.w - 20, r.y + 20, 15, b > 0 ? C.green : C.red, KAI(), 700, 'center'); } });
    if (np > 1) { btn(PG.prev, '上一页', UI.page > 0 ? 'n' : 'd', 16); btn(PG.next, '下一页', UI.page < np - 1 ? 'n' : 'd', 16); T((UI.page + 1) + ' / ' + np, GL.x + GL.w / 2, PG.prev.y + 19, 16, C.sub, NUM(), 600, 'center'); } }

  // ---------- 右：这一件 ----------
  function drawDetail(now) { D('panel_well_9', DP.x, DP.y, DP.w, DP.h); const id = UI.sel, it = id && ITEM_DB[id], sell = UI.mode === 'sell', x0 = DP.x + 18, xr = DP.x + DP.w - 18;
    if (!it) { T(sell ? '点左边的东西，看能卖多少。' : '点左边的货看看。', DP.x + DP.w / 2, DP.y + 220, 17, C.sub, KAI(), 500, 'center'); return; }
    D('item_disc_n', x0 - 2, DP.y + 12, 96, 96); try { itemIcon(id, x0 + 46, DP.y + 60, 33); } catch (e) {}
    ctx.font = `400 28px ${BR()}`; T(fitW(it.name, DP.w - 146), x0 + 108, DP.y + 44, 28, it.fg ? GRADE_COL[it.grade] || C.gold2 : C.gold2, BR(), 400);
    const wx = wxOf(id), sub = catOf(id) + (wx && window.WX5 ? ' · ' + WX5.WX[wx].n + '系' : '') + '　已有 ' + have(id); T(sub, x0 + 108, DP.y + 82, 15, C.sub, KAI(), 500);
    D('divider_h_3', x0, DP.y + 116, DP.w - 36, 3);
    let y = DP.y + 142;
    if (it.slot) { const ks = KEYS.filter(k => it[k]); ks.forEach((k, i) => { const cx = x0 + (i % 2) * 206, cy = y + Math.floor(i / 2) * 30; T(SN[k], cx, cy, 18, C.text, KAI(), 600); T((it[k] > 0 ? '+' : '') + it[k], cx + 44, cy, 20, C.gold2, NUM(), 700); }); y += Math.ceil(ks.length / 2) * 30 + 2;
      try { const st = window.GEAR5 && GEAR5.setOfItem(it.base || id); if (st) { ctx.font = `500 14px ${KAI()}`; T(fitW(st.name + '套装（' + '〇一二三四五'[st.parts.length] + '件齐）：' + st.text, DP.w - 36), x0, y, 14, C.blue, KAI(), 500); y += 24; } } catch (e) {} }
    else if (!it.desc) { const ef = [it.hp ? '气血 +' + it.hp : '', it.mp ? '灵力 +' + it.mp : '', it.revive ? '救起倒下的同伴' : ''].filter(Boolean).join('　') || it.eff || ''; if (ef) { T(ef, x0, y, 18, C.green, KAI(), 600); y += 30; } }
    const room = it.slot ? 2 : 6, big = !it.slot; ctx.font = `500 ${big ? 17 : 15}px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = big ? C.text : C.sub; const lh = big ? 27 : 23, n = wrap(it.desc || '', x0, y + 2, DP.w - 36, lh, room); y += n * lh + 10;   /* 丹药、杂物没有属性行，说明就是正文，字放大一号 */
    if (it.slot) { const lack = it.lvReq && (S.hero.lv || 1) < it.lvReq;
      T('换上以后', x0, y + 4, 14, C.dim, KAI(), 600); if (lack) T('等级不足：要 ' + it.lvReq + ' 级', xr, y + 4, 14, C.red, KAI(), 600, 'right'); y += 30;
      for (const w of members()) { if (y > BY - 184) break; const { cur, out } = deltas(w, id); T(whoName(w), x0, y, 16, C.text, KAI(), 600); let x = x0 + 74;
        if (cur === id) T('正穿着', x, y, 15, C.dim, KAI(), 500); else if (!out.length) T('持平', x, y, 15, C.dim, KAI(), 500);
        else for (const [k, d] of out.slice(0, 2)) { const s = SN[k] + (d > 0 ? ' ▲' : ' ▼') + Math.abs(d); T(s, x, y, 15, d > 0 ? C.green : C.red, KAI(), 700); x += ctx.measureText(s).width + 14; }
        if (w !== 'hero') { try { const ft = GEAR5.fitText(w, id); T(ft[0].replace('灵根 · ', ' · '), xr, y, 13, ft[1] > 0 ? C.green : ft[1] < 0 ? C.red : C.dim, KAI(), 500, 'right'); } catch (e) {} }
        y += 27; } }
    // 右下：数量、合计、买 / 卖
    if (UI.msg && now - UI.msgT < 2200) { ctx.save(); ctx.globalAlpha *= Math.min(1, (2200 - (now - UI.msgT)) / 400); ctx.font = `600 15px ${KAI()}`; T(fitW(UI.msg, DP.w - 36), x0, BY - 174, 15, UI.msgOk ? C.green : C.red, KAI(), 600); ctx.restore(); }
    D('divider_h_3', x0, BY - 160, DP.w - 36, 3);
    const pr = priceOf(id), mx = maxQty(id); UI.qty = Math.max(1, Math.min(UI.qty, Math.max(1, mx)));
    T('数量', x0, B_MINUS.y + 26, 17, C.text, KAI(), 600); btn(B_MINUS, '−', UI.qty > 1 ? 'n' : 'd', 28); T(String(UI.qty), (B_MINUS.x + B_MINUS.w + B_PLUS.x) / 2, B_MINUS.y + 26, 26, C.gold2, NUM(), 700, 'center'); btn(B_PLUS, '+', UI.qty < mx ? 'n' : 'd', 28); btn(B_MAX, '最多', mx > 1 && UI.qty < mx ? 'n' : 'd', 18);
    const total = pr * UI.qty, gold = S.hero.gold || 0, xsN = sell ? 0 : (it.xs || 0) * UI.qty, left = sell ? gold + total : gold - total, xl = (S.hero.xs || 0) - xsN;
    T(sell ? '卖得' : '合计', x0, BY - 58, 17, C.text, KAI(), 600); const ts = String(total); T(ts, x0 + 50, BY - 58, 30, C.gold2, NUM(), 700); ctx.font = `700 30px ${NUM()}`; const tw = ctx.measureText(ts).width; T('灵石', x0 + 56 + tw, BY - 54, 14, C.sub, KAI(), 500);
    ctx.font = `500 14.5px ${KAI()}`; T(fitW(sell ? '卖后有 ' + left + ' 灵石' : xl < 0 ? '悬赏点还差 ' + (-xl) + '，去做支线' : left < 0 ? '灵石不够，还差 ' + (-left) : (xsN ? '另需悬赏点 ' + xsN + '　' : '') + '买后余 ' + left + ' 灵石', B_GO.x - x0 - 12), x0, BY - 26, 14.5, !sell && (left < 0 || xl < 0) ? C.red : C.sub, KAI(), 500);   /* 这一行不能顶到「买入」那颗按钮上：单价格子里有了，这里不再写 */
    const can = sell ? have(id) >= UI.qty : left >= 0 && xl >= 0, armed = sell && UI.arm && UI.arm.id === id && now - UI.arm.t < 3500, pressed = now - UI.press < 160;
    btn(B_GO, sell ? (armed ? '再点一下' : '卖　出') : '买　入', !can ? 'd' : pressed ? 'p' : 'n', 24); }

  // ---------- 总的：画 ----------
  function draw() { if (!UI.open || (UI.hide && !UI.under)) return; kitLoad(); const now = performance.now(), a = Math.min(1, (now - UI.t0) / 180);
    ctx.save(); ctx.fillStyle = `rgba(5,13,19,${.9 * a})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
    if (!kitReady()) { T('稍等……', W / 2, H / 2, 22, C.gold2, KAI(), 500, 'center'); ctx.restore(); return; }
    D('curtain_9', 0, 0, W, H); let fs = 62; ctx.font = `400 ${fs}px ${BR()}`; while (fs > 36 && ctx.measureText(UI.title).width > 400) { fs -= 2; ctx.font = `400 ${fs}px ${BR()}`; } ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; const tw = ctx.measureText(UI.title).width; textOutline(UI.title, 28, 60, C.gold2, 'rgba(6,16,24,.85)', 6); TABX = Math.max(232, Math.round(28 + tw + 34));
    ['买', '卖'].forEach((t, i) => { const r = tabR(i), on = (UI.mode === 'sell') === !!i; D(on ? 'category_s' : 'category_n', r.x, r.y, r.w, r.h); T(t, r.x + r.w / 2, r.y + r.h / 2 + 1, 21, on ? C.gold2 : C.text, KAI(), 600, 'center'); });
    const gs = '灵石 ' + (S.hero.gold || 0); T(gs, CLOSE.x - 24, CLOSE.y + CLOSE.h / 2 + 1, 19, C.gold, NUM(), 600, 'right');
    if (UI.ids.some(id => ITEM_DB[id] && ITEM_DB[id].xs)) { ctx.font = `600 19px ${NUM()}`; const gw = ctx.measureText(gs).width; T('悬赏点 ' + (S.hero.xs || 0), CLOSE.x - 24 - gw - 28, CLOSE.y + CLOSE.h / 2 + 1, 19, C.blue, NUM(), 600, 'right'); }
    D('close_n', CLOSE.x, CLOSE.y, CLOSE.w, CLOSE.h); T('关　闭', CLOSE.x + CLOSE.w / 2, CLOSE.y + CLOSE.h / 2 + 1, 19, C.gold2, KAI(), 600, 'center');
    D('panel_main_9', P.x, P.y, P.w, P.h); D('panel_detail_9', BODY.x - 6, BODY.y - 2, BODY.w + 12, BODY.h + 4);
    drawGoods(now); drawDetail(now); ctx.restore(); }
  const layer = { draw() { try { draw(); } catch (e) { console.warn('R402', e); try { ctx.restore(); } catch (e2) {} } } };

  // ---------- 点 ----------
  function remove(id, n) { const h = S.hero; if (id === 'p_small') { h.potions = Math.max(0, (h.potions || 0) - n); return; }
    if (isMat(id) && CRAFT.take) { CRAFT.take(id, n); return; }
    h.bag[id] = (h.bag[id] || 0) - n; if (h.bag[id] <= 0) { delete h.bag[id]; if (h.fg && h.fg[id]) { delete h.fg[id]; if (h.refine) delete h.refine[id]; } } }
  async function trade(now) { const id = UI.sel, it = id && ITEM_DB[id]; if (!it) return; const n = UI.qty, pr = priceOf(id);
    if (UI.mode === 'buy') { const cost = pr * n, xc = (it.xs || 0) * n;
      if (xc > (S.hero.xs || 0)) { note('悬赏点不够，去做几件支线。'); snd('ui_cancel'); return; }
      if ((S.hero.gold || 0) < cost) { note('灵石不够，还差 ' + (cost - (S.hero.gold || 0)) + '。'); snd('ui_cancel'); return; }
      S.hero.gold -= cost; if (xc) S.hero.xs = (S.hero.xs || 0) - xc; addItem(id, n); UI.press = now; UI.qty = 1; snd('ui_confirm'); note('买下了 ' + it.name + (n > 1 ? ' ×' + n : ''), true);
      // 作者 11-10：买完要有物品获得提示（带音效）——获得框要压在最上面，先把商店收一下，点掉再放回来
      if (window.itemGet) { UI.hide = true; const li = S.overlay.indexOf(layer); if (li >= 0) S.overlay.splice(li, 1);
        const gi = S.overlay.findIndex(o => o && o.draw && /IG\.items|itemget_frame/.test(String(o.draw))); if (gi >= 0) { S.overlay.splice(gi, 0, layer); UI.under = true; }   // 商店垫在获得框底下接着画，不露出地图
        try { input.tapped = null; } catch (e) {}
        try { await itemGet([{ icon: 'item:' + id, id, name: it.name, count: '×' + n, desc: it.desc || '' }], '购入'); } catch (e) {}
        { const i2 = S.overlay.indexOf(layer); if (i2 >= 0) S.overlay.splice(i2, 1); } if (UI.open) S.overlay.push(layer); UI.hide = false; UI.under = false; UI.taps.length = 0; UI.msgT = performance.now(); try { input.tapped = null; } catch (e) {} }
    } else { if (have(id) < n) return;
      if (it.slot && !(UI.arm && UI.arm.id === id && now - UI.arm.t < 3500)) { UI.arm = { id, t: now }; note('装备卖了就没了，确定的话再点一下「卖出」。'); snd('ui_click'); return; }
      remove(id, n); const got = pr * n; S.hero.gold = (S.hero.gold || 0) + got; UI.arm = null; UI.press = now; UI.qty = 1; snd('ui_confirm'); note('卖掉了 ' + shortName(it.name) + (n > 1 ? ' ×' + n : '') + '，得 ' + got + ' 灵石', true); } }
  async function tap(tp) { const now = performance.now();
    for (let i = 0; i < 2; i++) if (inR(tp, tabR(i))) { const m = i ? 'sell' : 'buy'; if (UI.mode !== m) { UI.mode = m; UI.cat = 0; UI.page = 0; UI.sel = null; UI.qty = 1; UI.arm = null; UI.msg = ''; snd('ui_click'); } return; }
    const { list, cats } = shown(), np = Math.max(1, Math.ceil(list.length / PER));
    if (cats.length > 1) for (let i = 0; i <= cats.length; i++) if (inR(tp, chipR(i, cats.length + 1))) { if (UI.cat !== i) { UI.cat = i; UI.page = 0; UI.sel = null; UI.qty = 1; UI.arm = null; snd('ui_click'); } return; }
    if (np > 1 && inR(tp, PG.prev)) { if (UI.page > 0) { UI.page--; UI.sel = null; snd('ui_click'); } return; }
    if (np > 1 && inR(tp, PG.next)) { if (UI.page < np - 1) { UI.page++; UI.sel = null; snd('ui_click'); } return; }
    const page = list.slice(UI.page * PER, UI.page * PER + PER); for (let i = 0; i < page.length; i++) if (inR(tp, cellR(i))) { if (UI.sel !== page[i]) { UI.sel = page[i]; UI.qty = 1; UI.arm = null; snd('ui_click'); } return; }
    const id = UI.sel; if (!id || !ITEM_DB[id]) return; const mx = maxQty(id);
    if (near(tp, B_MINUS, 8)) { if (UI.qty > 1) { UI.qty--; UI.arm = null; snd('ui_click'); } return; }
    if (near(tp, B_PLUS, 8)) { if (UI.qty < mx) { UI.qty++; UI.arm = null; snd('ui_click'); } return; }
    if (near(tp, B_MAX, 6)) { if (mx > 1 && UI.qty !== mx) { UI.qty = mx; UI.arm = null; snd('ui_click'); } return; }
    if (inR(tp, B_GO)) await trade(now); }

  // ---------- 开店 ----------
  const NAME = { '云娘': '锦云坊', '胭脂铺老板娘': '点绛铺', '秦师傅': '裁月记' };
  const titleOf = who => { who = who || '商铺'; if (NAME[who]) return NAME[who]; try { const d = window.R178_SHOP_DECOR && R178_SHOP_DECOR(who); if (d && d.sign) return d.sign; } catch (e) {} return String(who).replace(/(掌柜|老板娘|老板|伙计|店主)$/, '') || who; };
  async function open(ids, who) { ids = (ids || []).filter(id => ITEM_DB[id]); if (!ids.length || UI.open) return;
    kitLoad(); try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {}
    const lock0 = world.locked, hud0 = S.hud; S.hud = false; world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    Object.assign(UI, { open: true, hide: false, t0: performance.now(), mode: 'buy', cat: 0, page: 0, sel: ids[0], qty: 1, ids, title: titleOf(who), msg: '', arm: null, press: 0 }); UI.taps.length = 0;
    S.overlay.push(layer); try { input.tapped = null; } catch (e) {} snd('ui_open');
    try { for (;;) { await nextFrame(); const tp = UI.taps.shift(); if (!tp) continue; if (!kitReady()) continue; if (inR(tp, CLOSE)) break; await tap(tp); } }
    finally { UI.open = false; UI.hide = false; UI.under = false; const i = S.overlay.indexOf(layer); if (i >= 0) S.overlay.splice(i, 1); world.locked = lock0; if (S.hud === false) S.hud = hud0; try { input.tapped = null; } catch (e) {} snd('ui_click'); } }
  try { cv.addEventListener('pointerdown', e => { if (!UI.open || UI.hide) return; e.stopImmediatePropagation(); e.preventDefault(); UI.taps.push(toLogical(e)); try { input.tapped = null; } catch (e2) {} }, true); } catch (e) {}

  // on()：测试面板里可以切回旧的青瓷窗柜，比着看
  window.R402_SHOP = { open, on: () => !F().r402_old && kitReady(), isOpen: () => UI.open, UI, titleOf };
  setTimeout(kitLoad, 5000);
})();
