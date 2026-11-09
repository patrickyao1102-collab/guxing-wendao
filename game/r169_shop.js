// ================= R169 · 仙市柜台（青瓷窗柜）商店（作者 11-08 选 C 青瓷窗柜；丹药铺店主选 A 丹霞仙子）=================
// 作者 11-08：不要店主人物站在旁边（像页游）——左边只留月窗空景 + 招呼语。所有店同一套柜台：，中间四格博古架（翻页），右边宣纸货单（单价 / 数量 ± / 总价 / 购后余额），
// 底部钱袋 + 买 / 卖页签 + 朱红「购」印 + 离开玉牌。店幌颜色按店换。部件里没有字，字都由这里写。
// 部件没载完就退回原来的 R64 商店。
(function () {
  if (typeof openShop !== 'function' || !window.R169) return;
  const K = ['counter_frame', 'keeper_bay', 'shelf', 'order_paper', 'shop_sign', 'keeper_greeting', 'wallet_plate', 'coin_purse', 'page_ledge',
    'niche_normal', 'niche_focus', 'price_ticket', 'trade_tab', 'trade_tab_focus', 'buy_seal_normal', 'buy_seal_pressed', 'buy_seal_disabled', 'exit_jade', 'quantity_jade',
    'pennant_herb', 'pennant_arms', 'pennant_books', 'pennant_runes'];
  const HEAD = '"GuxingDF",' + BRUSH, BODY = '"GuxingWKB",' + FONT;
  const KEEPER = {}; const keeper = src => { if (!KEEPER[src]) { const im = new Image(); im.src = src; KEEPER[src] = im; } return KEEPER[src]; };
  const SHOPS = [
    [/丹|药|医|草/, { pennant: 'pennant_herb', hi: ['客官，瞧瞧这炉新丹。', '丹火正旺，今日的丹成色最好。', '出门历练，丹药可别带少了。'] }],
    [/兵|甲|铁|器|剑|玄兵/, { pennant: 'pennant_arms', hi: ['剑要趁手，护具也须合身。', '刚出炉的几件，你挑挑看。'] }],
    [/经|书|典|藏/, { pennant: 'pennant_books', hi: ['先看修行路数，再选与你契合的法诀。', '剑谱参悟到二重、三重，招式才见真意。'] }],
    [/./, { pennant: 'pennant_runes', hi: ['客官随便看看。', '都是好东西，识货的人才看得出。'] }],
  ];
  const cfgOf = who => (SHOPS.find(([re]) => re.test(who || '')) || SHOPS[SHOPS.length - 1])[1];
  const R = window.R169, ok = () => R.ok(...K);
  const NICHE = [[385, 161, 214, 130], [620, 161, 213, 130], [385, 333, 214, 130], [620, 333, 213, 130]], NHIT = [[386, 162, 212, 128], [621, 162, 211, 128], [386, 334, 212, 128], [621, 334, 211, 128]];
  const TICK = [[411, 291, 168, 33], [646, 291, 168, 33], [411, 463, 168, 33], [646, 463, 168, 33]];
  const BUY = [882, 578, 79, 78], LEAVE = [1052, 586, 153, 64], TB = [591, 588, 93, 62], TS = [687, 588, 92, 62], PREV = [470, 519, 66, 42], NEXT = [678, 519, 66, 42], MINUS = [1053, 390, 39, 38], PLUS = [1146, 390, 39, 38], FR = [48, 39, 1184, 642];
  const hit = (t, r) => t && t.x >= r[0] && t.x <= r[0] + r[2] && t.y >= r[1] && t.y <= r[1] + r[3];
  const T = (s, x, y, font, color, align = 'center') => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y + 1); };
  const fit = (s, base, px, maxW, min = 14) => { let n = px; ctx.font = base.replace('#', n); while (n > min && ctx.measureText(s).width > maxW) { n--; ctx.font = base.replace('#', n); } return base.replace('#', n); };
  const catOf = id => { const it = ITEM_DB[id] || {}; return it.slot === 'weapon' ? '兵器' : it.slot === 'armor' ? '防具' : it.slot === 'acc' ? '饰品' : it.cat ? it.cat : it.book ? '剑谱' : it.use || /^p_/.test(id) ? '丹药' : '杂物'; };
  const cnt = id => id === 'p_small' ? (S.hero.potions || 0) + (S.hero.bag[id] || 0) * 0 : (S.hero.bag[id] || 0);
  const effectOf = it => it.slot ? (typeof statText === 'function' ? statText(it) : '') : (it.hp || it.mp || it.revive) ? [it.hp ? '气血 +' + it.hp : '', it.mp ? '灵力 +' + it.mp : '', it.revive ? '复苏' : ''].filter(Boolean).join('　') : it.eff ? it.eff : it.book ? '参悟剑招重数所需' : '';
  function wrap(s, w) { const out = []; let line = ''; for (const ch of String(s || '')) { if (ctx.measureText(line + ch).width > w && line) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; }
  function coin(x, y, r) { ctx.save(); const g = ctx.createRadialGradient(x - r * .3, y - r * .3, 1, x, y, r); g.addColorStop(0, '#e9fff6'); g.addColorStop(.6, '#7fd3c0'); g.addColorStop(1, '#2f7d74'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * .8, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r * .8, y); ctx.closePath(); ctx.fill(); ctx.restore(); }
  let ST = null;
  if (typeof updateMap === 'function') updateMap = (orig => function (dt) { if (ST) return; return orig.apply(this, arguments); })(updateMap);
  const sellList = () => Object.keys(S.hero.bag).filter(id => ITEM_DB[id] && ITEM_DB[id].sell && S.hero.bag[id] > 0);
  const list = () => ST.mode === 'sell' ? sellList() : ST.ids;
  const priceOf = id => ST.mode === 'sell' ? (ITEM_DB[id].sell || 0) : (ITEM_DB[id].price || 0);
  function draw() {
    if (!ST) return; const t = performance.now() / 1000, open = Math.min(1, (t - ST.t0) / .22), e = 1 - (1 - open) ** 3;
    const items = list(), pages = Math.max(1, Math.ceil(items.length / 4)); ST.page = Math.min(ST.page, pages - 1);
    if (!items.includes(ST.sel)) { ST.sel = items[ST.page * 4] || null; ST.qty = 1; }
    const P = R.part, cfg = ST.cfg;
    ctx.save(); ctx.fillStyle = `rgba(8,6,4,${.45 * e})`; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = e; ctx.translate(W / 2, H / 2 + (1 - e) * 16); ctx.scale(.97 + .03 * e, .97 + .03 * e); ctx.translate(-W / 2, -H / 2);
    P('counter_frame', 48, 39, 1184, 642); P('keeper_bay', 68, 126, 296, 369); P('shelf', 361, 140, 508, 425); P('order_paper', 874, 141, 336, 420);
    // 店主
    const kim = cfg.keeper && keeper(cfg.keeper);
    if (kim && kim.complete && kim.naturalWidth) { const [x, y, w, h] = ST.label ? [69, 127, 294, 367] : [72, 133, 288, 361], k = ST.label ? Math.min(w / kim.naturalWidth, h / kim.naturalHeight) : Math.min(w / kim.naturalWidth, h / kim.naturalHeight) * 1.02, dw = kim.naturalWidth * k, dh = kim.naturalHeight * k;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(kim, x + w / 2 - dw / 2, y + h - dh + (ST.label ? 0 : Math.sin(t * 1.4) * 1.5), dw, dh); ctx.restore(); }
    P('keeper_greeting', 94, 491, 243, 60); if (ST.label) T(ST.label, 217, 522, fit(ST.label, '#px ' + HEAD, 24, 200, 16), '#493728'); else T(ST.hi, 217, 522, fit(ST.hi, '#px ' + BODY, 20, 220, 13), '#493728');
    P('shop_sign', 449, 50, 380, 81); T(ST.who.split('').join(' '), 637, 89, fit(ST.who, '#px ' + HEAD, 46, 300, 26), '#e9cd90');
    P(cfg.pennant, 867, 39, 73, 152);
    // 货格
    for (let k = 0; k < 4; k++) {
      const id = items[ST.page * 4 + k]; P(id && id === ST.sel ? 'niche_focus' : 'niche_normal', ...NICHE[k]); if (!id) continue;
      const it = ITEM_DB[id], [nx, ny] = NICHE[k], poor = ST.mode === 'buy' && S.hero.gold < it.price;
      ctx.save(); if (poor) ctx.globalAlpha *= .55; const cy = ny + 60 + (id === ST.sel ? Math.sin(t * 3) * 2 : 0);
      try { if (window.UI_ICON2 && UI_ICON2.has(id)) UI_ICON2.draw(id, nx + 107, cy, 64); else itemIcon(id, nx + 107, cy, 30); } catch (er) {}
      ctx.restore();
      const c = cnt(id); if (c) T('有' + c, nx + 186, ny + 112, '600 13px ' + BODY, '#6a5540', 'right');
      P('price_ticket', ...TICK[k]); const [tx, ty] = TICK[k];
      T(it.name, tx + 59, ty + 16, fit(it.name, '#px ' + HEAD, 20, 100, 13), '#42301e'); coin(tx + 99, ty + 16, 7); T(String(priceOf(id)), tx + 125, ty + 16, '18px ' + BODY, poor ? '#a8382b' : '#69441f');
    }
    P('page_ledge', 429, 522, 371, 34);
    if (pages > 1) { T('‹', 503, 538, '22px ' + BODY, '#88765c'); T((ST.page + 1) + ' / ' + pages, 607, 538, '21px ' + BODY, '#4b392c'); T('›', 713, 538, '22px ' + BODY, '#48362c'); }
    else if (!items.length) T(ST.mode === 'sell' ? '身上没有能卖的杂物' : '今日货已卖完', 615, 538, '19px ' + BODY, '#88765c');
    // 货单
    T('货 单', 922, 180, '19px ' + BODY, '#78644e', 'left'); ctx.fillStyle = '#b7a38a'; ctx.fillRect(990, 180, 189, 1); ctx.fillRect(911, 336, 270, 1); ctx.fillRect(911, 437, 270, 1);
    const id = ST.sel, it = id && ITEM_DB[id];
    if (it) {
      T(it.name, 911, 224, fit(it.name, '#px ' + HEAD, 40, 270, 22), '#423222', 'left');
      T(catOf(id) + '  ·  已有 ' + cnt(id), 911, 262, '21px ' + BODY, '#685640', 'left');
      const ef = effectOf(it) || it.desc || ''; ctx.font = '21px ' + BODY; const ls = wrap(ef, 270).slice(0, 2); ls.forEach((l, i) => T(l, 911, 300 + i * 26 - (ls.length - 1) * 8, '21px ' + BODY, '#425e49', 'left'));
      const pr = priceOf(id), max = ST.mode === 'sell' ? cnt(id) : 99; ST.qty = Math.max(1, Math.min(ST.qty, Math.max(1, max)));
      T(ST.mode === 'sell' ? '收价' : '单价', 911, 366, '22px ' + BODY, '#433528', 'left'); coin(1130, 366, 11); T(String(pr), 1181, 366, '29px ' + HEAD, '#755028', 'right');
      T('数量', 911, 409, '22px ' + BODY, '#433528', 'left'); P('quantity_jade', 1053, 394, 39, 30); P('quantity_jade', 1146, 394, 39, 30);
      T('−', 1072, 409, '21px ' + BODY, '#4c392a'); T('+', 1165, 409, '21px ' + BODY, '#4c392a'); T(String(ST.qty), 1118, 409, '26px ' + HEAD, '#443223');
      const total = pr * ST.qty; T('总价', 911, 464, '22px ' + HEAD, '#433528', 'left'); coin(1130, 464, 11); T(String(total), 1181, 464, '32px ' + HEAD, '#93442e', 'right');
      const left = ST.mode === 'sell' ? S.hero.gold + total : S.hero.gold - total;
      T(ST.mode === 'sell' ? '卖后有 ' + left + ' 灵石' : left < 0 ? '灵石不足，还差 ' + (-left) : '购后余 ' + left + ' 灵石', 911, 510, '21px ' + BODY, left < 0 ? '#a8382b' : '#79654e', 'left');
    }
    // 底栏
    P('wallet_plate', 110, 589, 275, 59); P('coin_purse', 58, 563, 127, 98);
    ST.gs += (S.hero.gold - ST.gs) * .2; T('身上灵石', 233, 617, '20px ' + BODY, '#48382c'); T(String(Math.round(ST.gs)), 321, 617, '27px ' + HEAD, '#704b27');
    P(ST.mode === 'buy' ? 'trade_tab_focus' : 'trade_tab', ...TB); P(ST.mode === 'sell' ? 'trade_tab_focus' : 'trade_tab', ...TS);
    T('买', 637, 619, '27px ' + HEAD, '#503a24'); T('卖', 733, 619, '27px ' + HEAD, '#503a24');
    const can = it && (ST.mode === 'sell' ? cnt(id) >= ST.qty : S.hero.gold >= priceOf(id) * ST.qty), pressed = ST.press && ST.press.k === 'buy' && t - ST.press.t < .15;
    P(!can ? 'buy_seal_disabled' : pressed ? 'buy_seal_pressed' : 'buy_seal_normal', ...BUY); T(ST.mode === 'sell' ? '售' : '购', 921, 617 + (pressed ? 1 : 0), '37px ' + HEAD, can ? '#f8e9cf' : '#d9d0c2');
    P('exit_jade', ...LEAVE); T('离开', 1128, 618, '27px ' + HEAD, '#403225');
    // 成交飞光 + 提示
    for (let i = ST.fx.length - 1; i >= 0; i--) { const f = ST.fx[i], u = (t - f.t) / .8; if (u > 1) { ST.fx.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = 1 - u; ctx.textAlign = 'center'; ctx.font = '700 24px ' + HEAD; textOutline(f.txt, f.x, f.y - 30 - u * 34, '#fff6d8', 'rgba(60,30,0,.8)', 4); ctx.restore(); }
    if (ST.msg && t - ST.msgT < 1.8) { ctx.save(); ctx.globalAlpha = e * Math.min(1, (1.8 - (t - ST.msgT)) / .4); T(ST.msg, 615, 575, '600 18px ' + BODY, '#7a2e22'); ctx.restore(); }
    ctx.restore();
  }
  const layer = { draw };
  const prev = openShop;
  openShop = async function (ids, who) {
    ids = (ids || []).filter(id => ITEM_DB[id]); if (!ids.length) return;
    if (!ok()) return prev.apply(this, arguments);
    const dec = window.R178_SHOP_DECOR ? R178_SHOP_DECOR(who || '') : null;   // R178：每家店的镇店之物 + 店名招牌
    const cfg = dec ? Object.assign({}, cfgOf(who || ''), { keeper: dec.keeper }) : cfgOf(who || ''); if (cfg.keeper) keeper(cfg.keeper);
    ST = { ids, who: (dec && dec.sign) || who || '商铺', label: dec && dec.label, cfg, mode: 'buy', page: 0, sel: ids[0], qty: 1, fx: [], gs: S.hero.gold, t0: performance.now() / 1000, hi: cfg.hi[Math.floor(Math.random() * cfg.hi.length)] };
    const hud0 = S.hud; S.hud = false; S.overlay.push(layer); input.tapped = null;
    try {
      for (;;) {
        await nextFrame(); const tp = consumeTap(); if (!tp) continue; const t = performance.now() / 1000, items = list(), pages = Math.max(1, Math.ceil(items.length / 4));
        if (hit(tp, LEAVE) || !hit(tp, FR)) { try { playSnd('ui_click'); } catch (e) {} await sleep(100); return; }
        if (hit(tp, TB) && ST.mode !== 'buy') { ST.mode = 'buy'; ST.page = 0; ST.sel = null; try { playSnd('ui_click'); } catch (e) {} continue; }
        if (hit(tp, TS) && ST.mode !== 'sell') { ST.mode = 'sell'; ST.page = 0; ST.sel = null; try { playSnd('ui_click'); } catch (e) {} continue; }
        if (pages > 1 && hit(tp, PREV)) { ST.page = (ST.page + pages - 1) % pages; ST.sel = null; try { playSnd('ui_click'); } catch (e) {} continue; }
        if (pages > 1 && hit(tp, NEXT)) { ST.page = (ST.page + 1) % pages; ST.sel = null; try { playSnd('ui_click'); } catch (e) {} continue; }
        if (hit(tp, MINUS)) { ST.qty = Math.max(1, ST.qty - 1); try { playSnd('ui_click'); } catch (e) {} continue; }
        if (hit(tp, PLUS)) { ST.qty++; try { playSnd('ui_click'); } catch (e) {} continue; }
        let picked = false; for (let k = 0; k < 4; k++) { const id = items[ST.page * 4 + k]; if (id && hit(tp, NHIT[k])) { if (ST.sel !== id) { ST.sel = id; ST.qty = 1; try { playSnd('ui_click'); } catch (e) {} } picked = true; } } if (picked) continue;
        if (hit(tp, BUY) && ST.sel) {
          const id = ST.sel, it = ITEM_DB[id], n = ST.qty, k = items.indexOf(id) % 4, nx = NICHE[k][0] + 107, ny = NICHE[k][1] + 60;
          if (ST.mode === 'buy') {
            const cost = it.price * n; if (S.hero.gold < cost) { ST.msg = '灵石不够……'; ST.msgT = t; try { playSnd('ui_cancel'); } catch (e) {} continue; }
            S.hero.gold -= cost; addItem(id, n); ST.press = { k: 'buy', t }; try { playSnd('ui_confirm'); } catch (e) {}
            ST.fx.push({ x: nx, y: ny, t, txt: '+' + n }); ST.msg = '买下了 ' + it.name + (n > 1 ? ' ×' + n : ''); ST.msgT = t;
          } else {
            const have = cnt(id); if (have < n) continue; S.hero.bag[id] -= n; if (S.hero.bag[id] <= 0) delete S.hero.bag[id]; const got = (it.sell || 0) * n; S.hero.gold += got;
            ST.press = { k: 'buy', t }; try { playSnd('ui_confirm'); } catch (e) {} ST.fx.push({ x: nx, y: ny, t, txt: '+' + got + ' 灵石' }); ST.msg = '卖掉了 ' + it.name + (n > 1 ? ' ×' + n : ''); ST.msgT = t; ST.qty = 1;
          }
        }
      }
    } finally { const i = S.overlay.indexOf(layer); if (i >= 0) S.overlay.splice(i, 1); ST = null; input.tapped = null; if (S.hud === false) S.hud = hud0; }
  };
  window.R169_SHOP = { get open() { return !!ST; }, get st() { return ST; } };
})();
