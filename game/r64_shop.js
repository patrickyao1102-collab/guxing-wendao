// ================= R64 商店界面（Codex 六套风格部件 + Claude 代码排版与动效）=================
// 每家店一种风格：典籍阁=古籍书页 · 丹药铺=宣纸水墨 · 符阵坊=玉石流光 · 兵甲坊=现代极简 · 灵兽苑=竹简卷轴 · 五曜商阁=星盘夜空
// 其他地图的店按店名自动选。剧情对话框不变，只换商店。文字全部由代码画（部件里不含字）。
(function () {
  if (typeof openShop !== 'function') return;
  const SPEC = {"01_ink": {"name": "宣纸水墨", "c": {"title": "#242d29", "body": "#343832", "price": "#8b4c2b", "disabled": "#787b70", "stroke": "#8b9384", "accent": "#a33b32", "background": "#f4efe2", "pressedText": "#fff9e9", "disabledText": "#787b70"}, "ins": {"window": [48, 48, 48, 48], "item_normal": [48, 48, 48, 48], "item_selected": [48, 48, 48, 48], "button_normal": [48, 48, 48, 48], "button_pressed": [48, 48, 48, 48], "button_selected": [48, 48, 48, 48], "button_disabled": [48, 48, 48, 48], "divider": null, "ornament": null, "nameplate": [44, 44, 44, 44]}}, "02_bamboo": {"name": "竹简卷轴", "c": {"title": "#39452c", "body": "#493e26", "price": "#754423", "disabled": "#7e7562", "stroke": "#927441", "accent": "#47664b", "background": "#e8d4a5", "pressedText": "#fff9e9", "disabledText": "#7e7562"}, "ins": {"window": [64, 64, 64, 64], "item_normal": [64, 64, 64, 64], "item_selected": [64, 64, 64, 64], "button_normal": [64, 48, 64, 48], "button_pressed": [64, 48, 64, 48], "button_selected": [64, 48, 64, 48], "button_disabled": [64, 48, 64, 48], "divider": null, "ornament": null, "nameplate": [44, 44, 44, 44]}}, "03_jade": {"name": "玉石流光", "c": {"title": "#fcf0cf", "body": "#e4f1e6", "price": "#f2d8a0", "disabled": "#9db6aa", "stroke": "#78b6a6", "accent": "#e0c68a", "background": "#143f3c", "pressedText": "#152b2c", "disabledText": "#9db6aa"}, "ins": {"window": [56, 56, 56, 56], "item_normal": [56, 56, 56, 56], "item_selected": [56, 56, 56, 56], "button_normal": [56, 48, 56, 48], "button_pressed": [56, 48, 56, 48], "button_selected": [56, 48, 56, 48], "button_disabled": [56, 48, 56, 48], "divider": null, "ornament": null, "nameplate": [44, 44, 44, 44]}}, "04_astrolabe": {"name": "星盘夜空", "c": {"title": "#f3f6ff", "body": "#e3ebf4", "price": "#c1d9ee", "disabled": "#99a8bb", "stroke": "#6b8aa6", "accent": "#a9cbe6", "background": "#142438", "pressedText": "#152b2c", "disabledText": "#99a8bb"}, "ins": {"window": [56, 56, 56, 56], "item_normal": [56, 56, 56, 56], "item_selected": [56, 56, 56, 56], "button_normal": [56, 48, 56, 48], "button_pressed": [56, 48, 56, 48], "button_selected": [56, 48, 56, 48], "button_disabled": [56, 48, 56, 48], "divider": null, "ornament": null, "nameplate": [44, 44, 44, 44]}}, "05_book": {"name": "古籍书页", "c": {"title": "#302f28", "body": "#443b30", "price": "#84502c", "disabled": "#827665", "stroke": "#a69979", "accent": "#9b4134", "background": "#f1e4c7", "pressedText": "#fff9e9", "disabledText": "#827665"}, "ins": {"window": [64, 64, 64, 64], "item_normal": [64, 64, 64, 64], "item_selected": [64, 64, 64, 64], "button_normal": [64, 48, 64, 48], "button_pressed": [64, 48, 64, 48], "button_selected": [64, 48, 64, 48], "button_disabled": [64, 48, 64, 48], "divider": null, "ornament": null, "nameplate": [44, 44, 44, 44]}}, "06_minimal": {"name": "现代极简仙侠", "c": {"title": "#183d31", "body": "#344840", "price": "#386b54", "disabled": "#7b8881", "stroke": "#a5b5a8", "accent": "#376f59", "background": "#f6f6ef", "pressedText": "#fff9e9", "disabledText": "#7b8881"}, "ins": {"window": [32, 32, 32, 32], "item_normal": [32, 32, 32, 32], "item_selected": [32, 32, 32, 32], "button_normal": [32, 32, 32, 32], "button_pressed": [32, 32, 32, 32], "button_selected": [32, 32, 32, 32], "button_disabled": [32, 32, 32, 32], "divider": null, "ornament": null, "nameplate": [32, 32, 32, 32]}}};
  const BLOB = {"01_ink__button_disabled": "4285b817ccad595c512f6fc9ea8b7a65", "01_ink__button_normal": "dbfef8a493a67ae2a8aa5cdce8bddfad", "01_ink__button_pressed": "485cfff6c0bacc8439ade5a0bd5c1c72", "01_ink__button_selected": "d092c72dd1b76138c39b036b8b06d738", "01_ink__divider": "1103b1f181b6d2b2b3a5409f09017a5e", "01_ink__item_normal": "471db3db8f1410ed009408ef30df145a", "01_ink__item_selected": "2f2ec1c30ee2233aebd70496445b9374", "01_ink__nameplate": "5821c41629209fc38cf9c52b5ffb0264", "01_ink__ornament": "8054fd7111c7445675f400aa8e28c629", "01_ink__window": "6026d9cdb0cc0e9aecb303d89f96ac5d", "02_bamboo__button_disabled": "db89862d97ea0fca4186b79838614eb4", "02_bamboo__button_normal": "2e979ff2f64e86cfea4d9b338ed9fd2d", "02_bamboo__button_pressed": "497d81346e5e1ef8b532257d019eb4d1", "02_bamboo__button_selected": "2f576996ff1a6dde23d3a486427ae784", "02_bamboo__divider": "223a741f8fa338d51d4556db05a2bbe5", "02_bamboo__item_normal": "16558757eb248b4b02254d193c6e8bb4", "02_bamboo__item_selected": "0e3f325f10702506807e7042536ee13e", "02_bamboo__nameplate": "cdcaa048df09ecebffa4b441a3ce34a5", "02_bamboo__ornament": "67a926902bc510547656c18d6987ec23", "02_bamboo__window": "a14b92f5edf31e1bf4a9789d64e120f7", "03_jade__button_disabled": "21a6773d96e1e6d59b79a2aec5b26857", "03_jade__button_normal": "a8db408803c2782908c4612422af012e", "03_jade__button_pressed": "5cfbd5ff49e6a782bf195683705f5c2f", "03_jade__button_selected": "ddb6750a996d0b876050cf6124001b31", "03_jade__divider": "cab7e3390d5786e4f9250a27fa8370d4", "03_jade__item_normal": "8d033db1b36f87c24c60ba4da06bdc88", "03_jade__item_selected": "0938717c97dfd378eff0523a2ea7a263", "03_jade__nameplate": "2c3ddbf24fdb4339c8fbbc89db8a7503", "03_jade__ornament": "abd796488b7b76d9001b6a0cd907277e", "03_jade__window": "7871ed3c6e43f00afdb04d1aca86888e", "04_astrolabe__button_disabled": "47b6adf276e2f0071f4c2930bce4e5a9", "04_astrolabe__button_normal": "4b6cb35f7ea07cff11f47be215fc8676", "04_astrolabe__button_pressed": "2f5cd20a78b235b5a3cb0dac54e57f5c", "04_astrolabe__button_selected": "8d44e2793a09ecba09441169b2dda395", "04_astrolabe__divider": "311d328d61938b0e602c21348d710da6", "04_astrolabe__item_normal": "3b664443f0327ea2949bbad7306e6f88", "04_astrolabe__item_selected": "5f5e729b47366089e2d22cd19708e679", "04_astrolabe__nameplate": "b1ef26896fdead7d043737ac70a57149", "04_astrolabe__ornament": "aa186b40e9e2dee65b3f9fc743ffcb19", "04_astrolabe__window": "cefe42d533c73e818490a384f8ed1c58", "05_book__button_disabled": "353461ba82857e86080a0e3323d8d772", "05_book__button_normal": "9e49656ebc695758dfe77f6db6a94543", "05_book__button_pressed": "773ffc2de96a2c42a7bfd674311f7ba3", "05_book__button_selected": "427cedd916dcde2a45f5159e9d71133e", "05_book__divider": "a8cb76ecdd69ef424da6957c66e973fd", "05_book__item_normal": "6215f452eb06c0ed35155676ef29131e", "05_book__item_selected": "84a72fde781a5bcd7c4d3020a56b46f6", "05_book__nameplate": "bad7db3974be186c584fa50fd169a993", "05_book__ornament": "c50a4f619ba4a802f7d719935c511435", "05_book__window": "4eda997b90927b625d5316a400af8173", "06_minimal__button_disabled": "acfaf99c112493993a9151482da46624", "06_minimal__button_normal": "7be6cb2c351efc9b4353f1811e36e8a1", "06_minimal__button_pressed": "0b5020576cea3de5411bf4feef21b5bc", "06_minimal__button_selected": "f2e128f1d6ab50b9542e710c4a175a9c", "06_minimal__divider": "cd92dd75a5ad2f29bbd395fb8b11441b", "06_minimal__item_normal": "30af6a91d181cd9f970dd549e7d65b4a", "06_minimal__item_selected": "3d9fe0ab3bec610859c712cd099204c3", "06_minimal__nameplate": "c84d61823ed2b20801e9e2530deb4a84", "06_minimal__ornament": "a84cc44c850c546cd05d130a170027fe", "06_minimal__window": "a81236abc6c5af4328a657aa10fc6c4e"};
  const loc = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const PARTS = ['window', 'item_normal', 'item_selected', 'button_normal', 'button_pressed', 'button_selected', 'button_disabled', 'divider', 'ornament', 'nameplate'];
  const IM = {};
  function loadStyle(s) { if (IM[s]) return; IM[s] = {}; for (const p of PARTS) { const k = s + '__' + p, im = new Image(); im.onload = () => { IM[s][p] = im; }; im.src = loc || !BLOB[k] ? 'ui3/r64/' + k + '.webp' : '/_blob/' + BLOB[k]; } }
  for (const s in SPEC) setTimeout(() => loadStyle(s), 3000);
  // 九宫格：部件是 2x 图，切线 /2 就是逻辑像素
  function ns(img, x, y, w, h, ins) {
    if (!img) return; const [l, t, r, b] = ins || [0, 0, 0, 0], iw = img.width, ih = img.height;
    const L = Math.min(l / 2, w / 2), T = Math.min(t / 2, h / 2), R = Math.min(r / 2, w / 2), B = Math.min(b / 2, h / 2);
    const sx = [0, l, iw - r, iw], dx = [x, x + L, x + w - R, x + w], sy = [0, t, ih - b, ih], dy = [y, y + T, y + h - B, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const sw = sx[i + 1] - sx[i], sh = sy[j + 1] - sy[j], dw = dx[i + 1] - dx[i], dh = dy[j + 1] - dy[j]; if (sw > 0 && sh > 0 && dw > 0 && dh > 0) ctx.drawImage(img, sx[i], sy[j], sw, sh, dx[i], dy[j], dw, dh); }
  }
  const STYLE = { '典籍阁': '05_book', '丹药铺': '01_ink', '符阵坊': '03_jade', '兵甲坊': '06_minimal', '灵兽苑': '02_bamboo', '五曜商阁': '04_astrolabe' };
  const styleOf = who => STYLE[who] || (/经|书|典|藏/.test(who) ? '05_book' : /药|丹|医|草/.test(who) ? '01_ink' : /符|阵|玉|珍/.test(who) ? '03_jade' : /宝|拍|万|阁|楼/.test(who) ? '04_astrolabe' : /铁|兵|武|器|甲/.test(who) ? '06_minimal' : '02_bamboo');
  const SUB = { '典籍阁': '剑谱 · 功法 · 玉简', '丹药铺': '药品 · 丹药', '符阵坊': '符箓 · 阵旗 · 护身', '兵甲坊': '兵器 · 防具', '灵兽苑': '灵兽 · 坐骑', '五曜商阁': '奇珍 · 稀材' };
  const catOf = id => { const it = ITEM_DB[id] || {}; return it.slot === 'weapon' ? '兵器' : it.slot === 'armor' ? '防具' : it.slot === 'acc' ? '饰品' : it.book ? (id === 'yujian' ? '玉简' : '剑谱') : it.use ? '丹药' : id === 'yunxingshi' ? '稀材' : '杂项'; };
  const cnt = id => id === 'p_small' ? (S.hero.potions || 0) : (S.hero.bag[id] || 0);
  const effectOf = it => it.slot ? statText(it) : it.use ? [it.hp ? '气血 +' + it.hp : '', it.mp ? '灵力 +' + it.mp : '', it.revive ? '复苏' : ''].filter(Boolean).join('　') : it.book ? '参悟剑招重数所需' : '';
  function wrap(s, w) { const out = []; let line = ''; for (const ch of String(s || '')) { if (ctx.measureText(line + ch).width > w && line) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; }
  const hit = (t, r) => t && t.x >= r[0] && t.x <= r[0] + r[2] && t.y >= r[1] && t.y <= r[1] + r[3];
  const FR = [80, 76, 1120, 592], GRID = [126, 196, 576, 344], DET = [788, 196, 372, 360], LEAVE = [788, 590, 176, 52], BUY = [984, 590, 176, 52], SELL = [126, 590, 196, 52];
  const COLS = 4, ROWS = 2, PER = COLS * ROWS, CW = 144, CH = 172, BOX = 100;
  let ST = null;
  window.R64_SHOP = { get open() { return !!ST; }, styleOf };
  if (typeof updateMap === 'function') updateMap = (orig => function (dt) { if (ST) return; return orig.apply(this, arguments); })(updateMap);

  function cellRect(i) { const k = i % PER, c = k % COLS, r = Math.floor(k / COLS); return [GRID[0] + c * CW + (CW - BOX) / 2, GRID[1] + r * CH + 4, BOX, BOX]; }
  function list() { return ST.cat === '全部' ? ST.ids : ST.ids.filter(id => catOf(id) === ST.cat); }
  function tabs() { const out = []; if (ST.cats.length < 2) return out; ctx.font = `600 17px ${FONT}`; let x = ST.tabX; for (const c of ['全部', ...ST.cats]) { const w = ctx.measureText(c).width + 24; out.push([c, [x, 116, w, 34]]); x += w + 6; } return out; }

  // ---------- 每家店的小动效（代码画）----------
  function flourish(s, t, C) {
    const [x, y, w, h] = FR; ctx.save(); ctx.beginPath(); ctx.rect(x + 8, y + 8, w - 16, h - 16); ctx.clip();
    if (s === '03_jade') { const u = (t % 5) / 5, bx = x - 300 + u * (w + 600), g = ctx.createLinearGradient(bx - 120, y, bx + 120, y + h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(220,255,240,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
    if (s === '04_astrolabe') { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const sx = x + ((i * 157.3) % w), sy = y + ((i * 97.1) % h), a = Math.max(0, Math.sin(t * 1.3 + i * 2.1)) ** 3; if (a < .05) continue; ctx.fillStyle = `rgba(200,225,255,${a * .8})`; ctx.fillRect(sx, sy, 2, 2); }
      ctx.strokeStyle = 'rgba(170,205,235,.10)'; ctx.lineWidth = 1; const cx = DET[0] + DET[2] / 2, cy = DET[1] + 150; for (const [r, sp] of [[150, .05], [118, -.08]]) { ctx.beginPath(); ctx.arc(cx, cy, r, t * sp, t * sp + 4.6); ctx.stroke(); } }
    if (s === '02_bamboo') { for (let i = 0; i < 6; i++) { const u = ((t * .05 + i / 6) % 1), lx = x + 40 + ((i * 211) % (w - 80)) + Math.sin(t + i) * 18, ly = y + u * h; ctx.save(); ctx.translate(lx, ly); ctx.rotate(Math.sin(t * 1.5 + i) * .8); ctx.fillStyle = 'rgba(86,120,70,.32)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 2.6, 0, 0, 7); ctx.fill(); ctx.restore(); } }
    if (s === '01_ink') { for (let i = 0; i < 3; i++) { const mx = x + w - 160 + Math.sin(t * .2 + i * 2) * 60, my = y + h - 90 + Math.cos(t * .15 + i) * 20, r = 120 + i * 30, g = ctx.createRadialGradient(mx, my, 0, mx, my, r); g.addColorStop(0, 'rgba(60,66,60,.06)'); g.addColorStop(1, 'rgba(60,66,60,0)'); ctx.fillStyle = g; ctx.fillRect(mx - r, my - r, r * 2, r * 2); } }
    ctx.restore();
    // 印章：典籍阁 / 丹药铺 在标题旁盖一枚朱印
    if (s === '05_book' || s === '01_ink') { const sx = ST.sealX, sy = 120; ctx.save(); ctx.translate(sx + 15, sy + 15); ctx.rotate(-.06); ctx.globalAlpha = .85; ctx.fillStyle = C.accent; ctx.fillRect(-15, -15, 30, 30); ctx.fillStyle = '#fff3e6'; ctx.font = `18px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ST.who[0], 0, 1); ctx.restore(); }
    if (s === '06_minimal') { const k = Math.min(1, (t - ST.t0s) / .6); ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(122, 154); ctx.quadraticCurveTo(122 + 60 * k, 150, 122 + 140 * k, 155); ctx.stroke(); ctx.restore(); }
  }

  function draw() {
    if (!ST) return; const s = ST.style, P = IM[s] || {}, C = SPEC[s].c, I = SPEC[s].ins, t = performance.now() / 1000, items = list();
    const open = Math.min(1, (t - ST.t0s) / .22), e = 1 - (1 - open) ** 3;
    ctx.save(); ctx.fillStyle = `rgba(4,6,10,${.42 * e})`; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = e; ctx.translate(W / 2, H / 2 + (1 - e) * 18); ctx.scale(.96 + .04 * e, .96 + .04 * e); ctx.translate(-W / 2, -H / 2);
    if (P.window) ns(P.window, ...FR, I.window); else { ctx.fillStyle = C.background; ctx.fillRect(...FR); }
    flourish(s, t, C);
    // 标题 + 分类 + 余额
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.font = s === '06_minimal' ? `36px ${BRUSH}` : `700 32px ${FONT}`; ctx.fillStyle = C.title; ctx.fillText(ST.who, 122, 134); const tw = ctx.measureText(ST.who).width;
    ST.sealX = 122 + tw + 12; ST.tabX = 122 + tw + ((s === '05_book' || s === '01_ink') ? 58 : 22);
    const TB = tabs();
    if (TB.length) for (const [c, r] of TB) { const on = c === ST.cat; ctx.font = `600 17px ${FONT}`; ctx.fillStyle = on ? C.accent : C.disabled; ctx.textAlign = 'center'; ctx.fillText(c, r[0] + r[2] / 2, r[1] + r[3] / 2); if (on) { ctx.fillStyle = C.accent; ctx.fillRect(r[0] + 8, r[1] + r[3] - 4, r[2] - 16, 2); } }
    else { ctx.font = `15px ${FONT}`; ctx.fillStyle = C.disabled; ctx.fillText(SUB[ST.who] || '', ST.tabX, 136); }
    const g = Math.round(ST.goldShow += (S.hero.gold - ST.goldShow) * .2); ctx.textAlign = 'right'; ctx.font = `16px ${FONT}`; ctx.fillStyle = C.body; ctx.fillText('身上灵石', 1086, 134); ctx.font = `700 22px ${FONT}`; ctx.fillStyle = C.price; ctx.fillText(String(g), 1160, 134);
    if (P.divider) ctx.drawImage(P.divider, 120, 166, 1040, 4);
    // 货格
    const pages = Math.max(1, Math.ceil(items.length / PER)); ST.page = Math.min(ST.page, pages - 1);
    items.slice(ST.page * PER, ST.page * PER + PER).forEach((id, k) => { const i = ST.page * PER + k, it = ITEM_DB[id], r = cellRect(i), on = id === ST.sel, poor = S.hero.gold < it.price;
      ns(on ? P.item_selected || P.item_normal : P.item_normal, ...r, on ? I.item_selected : I.item_normal);
      const cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2 + (on ? Math.sin(t * 3) * 2.5 : 0);
      if (on) { ctx.save(); ctx.globalCompositeOperation = s === '03_jade' || s === '04_astrolabe' ? 'lighter' : 'source-over'; const gg = ctx.createRadialGradient(cx, cy, 6, cx, cy, 54); gg.addColorStop(0, s === '04_astrolabe' || s === '03_jade' ? 'rgba(220,240,255,.28)' : 'rgba(255,236,190,.55)'); gg.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = gg; ctx.fillRect(cx - 54, cy - 54, 108, 108); ctx.restore(); }
      ctx.save(); if (poor) ctx.globalAlpha = .55; try { itemIcon(id, cx, cy, 34); } catch (e) {} ctx.restore();
      const c = cnt(id); if (c) { ctx.font = `600 13px ${FONT}`; ctx.textAlign = 'right'; ctx.fillStyle = C.body; ctx.fillText('有' + c, r[0] + r[2] - 8, r[1] + r[3] - 10); }
      ctx.textAlign = 'center'; ctx.font = `600 17px ${FONT}`; ctx.fillStyle = C.title; ctx.fillText(it.name, cx, r[1] + r[3] + 20);
      ctx.font = `14px ${FONT}`; ctx.fillStyle = poor ? C.disabled : C.price; ctx.fillText(it.price + ' 灵石' + (poor ? ' · 不足' : ''), cx, r[1] + r[3] + 42); });
    if (pages > 1) { ctx.textAlign = 'center'; ctx.font = `600 18px ${FONT}`; ctx.fillStyle = C.body; ctx.fillText('‹', GRID[0] + GRID[2] / 2 - 50, 560); ctx.fillText((ST.page + 1) + ' / ' + pages, GRID[0] + GRID[2] / 2, 560); ctx.fillText('›', GRID[0] + GRID[2] / 2 + 50, 560); }
    // 竖分隔
    ctx.fillStyle = C.stroke; ctx.globalAlpha *= .45; ctx.fillRect(760, 196, 1, 370); ctx.globalAlpha = e;
    // 详情
    const id = ST.sel, it = id && ITEM_DB[id];
    if (it) { const x = DET[0] + 6; ctx.textAlign = 'left';
      if (P.ornament) ctx.drawImage(P.ornament, DET[0] + DET[2] - 96, DET[1] + 4, 96, 72);
      ctx.font = `700 28px ${FONT}`; ctx.fillStyle = C.title; ctx.fillText(it.name, x, DET[1] + 28);
      ctx.font = `14px ${FONT}`; ctx.fillStyle = C.disabled; ctx.fillText(catOf(id) + '　·　已有 ' + cnt(id), x, DET[1] + 60);
      if (P.divider) ctx.drawImage(P.divider, x, DET[1] + 84, 340, 4);
      ctx.font = `18px ${FONT}`; ctx.fillStyle = C.body; let yy = DET[1] + 114; for (const l of wrap(it.desc || '', 340).slice(0, 4)) { ctx.fillText(l, x, yy); yy += 28; }
      const ef = effectOf(it); if (ef) { yy += 8; ctx.font = `600 18px ${FONT}`; ctx.fillStyle = C.accent; for (const l of wrap(ef, 340).slice(0, 2)) { ctx.fillText(l, x, yy); yy += 26; } }
      yy = Math.max(yy + 8, DET[1] + 290); ctx.font = `15px ${FONT}`; ctx.fillStyle = C.body; ctx.fillText('单价 ' + it.price + ' 灵石', x, yy);
      const left = S.hero.gold - it.price; ctx.fillStyle = left < 0 ? C.accent : C.disabled; ctx.fillText(left < 0 ? '灵石不足，还差 ' + (-left) : '购后余额 ' + left + ' 灵石', x, yy + 24); }
    // 按钮
    const btn = (r, label, state, sel) => { const img = state === 'disabled' ? P.button_disabled : state === 'pressed' ? P.button_pressed : sel ? P.button_selected : P.button_normal; ns(img, r[0], r[1] + (state === 'pressed' ? 1 : 0), r[2], r[3], I['button_' + (state === 'disabled' ? 'disabled' : state === 'pressed' ? 'pressed' : sel ? 'selected' : 'normal')]);
      ctx.textAlign = 'center'; ctx.font = `600 18px ${FONT}`; ctx.fillStyle = state === 'disabled' ? C.disabledText : state === 'pressed' ? C.pressedText : C.title; ctx.fillText(label, r[0] + r[2] / 2, r[1] + r[3] / 2 + 1 + (state === 'pressed' ? 1 : 0)); };
    const pr = k => ST.press && ST.press.k === k && t - ST.press.t < .14 ? 'pressed' : '';
    btn(LEAVE, '离开', pr('leave'), false);
    btn(BUY, it ? (S.hero.gold < it.price ? '灵石不足' : '购买 · ' + it.price) : '购买', it && S.hero.gold >= it.price ? pr('buy') : 'disabled', true);
    const sell = ST.sellable(); if (sell.n) btn(SELL, '卖杂物 · ' + sell.sum, pr('sell'), false); else { ctx.textAlign = 'left'; ctx.font = `14px ${FONT}`; ctx.fillStyle = C.disabled; ctx.fillText('选中商品后，右侧查看详情', 130, 616); }
    // 购买飞光 + 提示
    for (let i = ST.fx.length - 1; i >= 0; i--) { const f = ST.fx[i], u = (t - f.t) / .8; if (u > 1) { ST.fx.splice(i, 1); continue; }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283 + k, d = 10 + u * 70, px = f.x + Math.cos(a) * d, py = f.y + Math.sin(a) * d - u * 20; ctx.globalAlpha = (1 - u) * .9; ctx.fillStyle = k % 2 ? '#fff2c0' : '#ffd36a'; ctx.beginPath(); ctx.arc(px, py, 2.5 * (1 - u) + 1, 0, 7); ctx.fill(); } ctx.restore();
      ctx.save(); ctx.globalAlpha = 1 - u; ctx.textAlign = 'center'; ctx.font = `700 22px ${FONT}`; textOutline('+1', f.x, f.y - 40 - u * 30, '#fff6d8', 'rgba(60,30,0,.8)', 4); ctx.restore(); }
    if (ST.msg && t - ST.msgT < 1.8) { ctx.save(); ctx.globalAlpha = e * Math.min(1, (1.8 - (t - ST.msgT)) / .4); ctx.textAlign = 'center'; ctx.font = `600 18px ${FONT}`; const w = ctx.measureText(ST.msg).width + 40; ctx.fillStyle = 'rgba(12,10,8,.78)'; ctx.fillRect(W / 2 - w / 2, 560 - 18, w, 36); ctx.fillStyle = '#fff1d0'; ctx.fillText(ST.msg, W / 2, 561); ctx.restore(); }
    ctx.restore();
  }
  const layer = { draw };

  openShop = async function (ids, who) {
    ids = (ids || []).filter(id => ITEM_DB[id]); if (!ids.length) return;
    const style = styleOf(who || ''); loadStyle(style);
    const cats = [...new Set(ids.map(catOf))];
    const sellable = () => { const h = S.hero; let n = 0, sum = 0; for (const id of Object.keys(h.bag)) if (ITEM_DB[id] && ITEM_DB[id].sell) { n += h.bag[id]; sum += ITEM_DB[id].sell * h.bag[id]; } return { n, sum }; };
    ST = { ids, who: who || '商铺', style, cats, cat: '全部', page: 0, sel: ids[0], fx: [], goldShow: S.hero.gold, t0s: performance.now() / 1000, sellable, sealX: 300, tabX: 300 };
    const hud0 = S.hud; S.hud = false; S.overlay.push(layer); input.tapped = null;
    try {
      for (;;) {
        await nextFrame(); const tp = consumeTap(); if (!tp) continue; const t = performance.now() / 1000;
        if (hit(tp, LEAVE)) { ST.press = { k: 'leave', t }; playSnd('ui_click'); await sleep(120); return; }
        const it = ITEM_DB[ST.sel];
        if (hit(tp, BUY) && it) { if (S.hero.gold < it.price) { ST.msg = '灵石不够……'; ST.msgT = t; try { playSnd('ui_cancel'); } catch (e) {} continue; }
          S.hero.gold -= it.price; addItem(ST.sel, 1); ST.press = { k: 'buy', t }; try { playSnd('ui_confirm'); } catch (e) {}
          const k = list().indexOf(ST.sel), r = cellRect(k); ST.fx.push({ x: r[0] + r[2] / 2, y: r[1] + r[3] / 2, t }); ST.msg = '买下了 ' + it.name; ST.msgT = t; continue; }
        const sl = sellable(); if (sl.n && hit(tp, SELL)) { const h = S.hero; for (const id of Object.keys(h.bag)) if (ITEM_DB[id] && ITEM_DB[id].sell) delete h.bag[id]; h.gold += sl.sum; ST.press = { k: 'sell', t }; try { playSnd('ui_confirm'); } catch (e) {} ST.msg = '杂物卖了 ' + sl.sum + ' 灵石'; ST.msgT = t; continue; }
        let done = false; for (const [c, r] of tabs()) if (hit(tp, r)) { ST.cat = c; ST.page = 0; const L = list(); if (!L.includes(ST.sel)) ST.sel = L[0]; playSnd('ui_click'); done = true; } if (done) continue;
        const items = list(), pages = Math.ceil(items.length / PER);
        if (pages > 1 && tp.y > 540 && tp.y < 580 && tp.x > GRID[0] && tp.x < GRID[0] + GRID[2]) { ST.page = (ST.page + (tp.x < GRID[0] + GRID[2] / 2 ? pages - 1 : 1)) % pages; playSnd('ui_click'); continue; }
        items.slice(ST.page * PER, ST.page * PER + PER).forEach((id, k) => { const r = cellRect(ST.page * PER + k); if (hit(tp, [r[0] - 20, r[1], r[2] + 40, r[3] + 50])) { if (ST.sel !== id) playSnd('ui_click'); ST.sel = id; } });
        if (!hit(tp, FR)) { playSnd('ui_click'); return; }
      }
    } finally { const i = S.overlay.indexOf(layer); if (i >= 0) S.overlay.splice(i, 1); ST = null; input.tapped = null; if (S.hud === false) S.hud = hud0; }
  };
})();
