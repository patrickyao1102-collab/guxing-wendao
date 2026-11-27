// ================= R394 · 剑炉：拿五行之精打五行装备、给星痕剑点星纹（只进测试版）=================
// 作者 11-27 08:30：「炼器系统你单独详细的设置一个……铸剑师搬到青竹小院后面不有个云海大亭吗？旁边可以弄一个炉子，然后那里设计一个铸剑师。」
// 他自己也提醒：「前期设计的太多，反而去容易降低玩家的那个可玩性跟兴趣度。」所以这里只做最要紧的一圈：
//   打什么属性的妖兽 → 掉什么属性的精 → 拿到云海大亭的剑炉 → 打出那一行的剑 / 衣 / 靴（凑齐三件有套装效果）；
//   星痕剑要点哪一道星纹，也可以拿那一行的精来点（另一条路是星辰宝库里拿星辰点换）。
// 各大主城的铸剑师分等级、天剑宗的炉子只给本宗弟子打、洛尘神乐要先处好关系、给别城铸剑师做任务——都写在设计稿「以后再说」里，这里不做。
// 界面用行囊「玄青星图」那套件。剑炉和铸剑师的画等 Codex R389；画到之前地图上不摆（测试面板里可以直接打开这个界面）。
(function () {
  const K = window.R386_KIT, G = window.GEAR5, J = window.WXJ; if (!K || !G || !J || !window.WX5 || typeof cv === 'undefined') return;
  const { KIT, D, T, C, BR, KAI, NUM, fit: fitW, wrap, kitLoad, kitReady, inR } = K, WX = WX5.WX, ORDER = WX5.ORDER;
  const F = () => (S.flags = S.flags || {});
  const SMITH = '铸剑师';
  // 价钱：[精, 灵石]
  const COST = { 1: { weapon: [4, 180], armor: [3, 150], shoe: [2, 100] }, 2: { weapon: [8, 900], armor: [6, 700], shoe: [4, 500] } }, RUNE = [6, 300];
  const SLOTN = { weapon: '剑', armor: '衣甲', shoe: '靴' }, STAT_NAME = { atk: '攻击', def: '防御', maxhp: '气血', maxmp: '灵力', spd: '速度' };
  // 一档一张 5×3 的表：一列一行五行，三行是剑 / 衣甲 / 靴。已有的名剑（寒星 / 流光 / 玄霜 / 紫电）不在炉子上打，格子里写它们的出处。
  const ELSE = { w_hanxing: '后山溪边岩隙的宝箱里', w_liuguang: '玄天城玄兵阁有售', w_xuanshuang: '玄天城玄兵阁有售', w_zidian: '玄天城玄兵阁有售' };
  const grid = tier => ORDER.map(el => { const s = G.SETS.find(q => q.tier === tier && q.wx === el); return { el, set: s, parts: ['weapon', 'armor', 'shoe'].map(sl => s ? s.parts.find(id => typeof id === 'string' && ITEM_DB[id] && ITEM_DB[id].slot === sl) : null) }; });
  const have = id => { try { const h = S.hero; let n = h.bag[id] || 0; for (const w of ['hero', ...(S.party || [])]) { const e = G.eqOf(w); for (const sl of G.SLOTS) if (e[sl] === id) n++; } return n; } catch (e) { return 0; } };
  const tierOpen = t => t === 1 || (S.hero.lv || 1) >= 10;
  const UI = { open: false, t0: 0, taps: [], tab: 0, sel: null, arm: null, say: '', sayT: 0 };
  const P = { x: 20, y: 96, w: 1240, h: 604 }, BODY = { x: 40, y: 112, w: 1200, h: 572 }, CLOSE = { x: 1126, y: 34, w: 124, h: 46 };
  const TABS = ['练气 · 头一档', '凝丹 · 第二档', '星痕剑 · 星纹'], tabR = i => ({ x: 250 + i * 196, y: 36, w: 186, h: 44 });
  const colX = i => BODY.x + 10 + i * 238, cellR = (i, j) => ({ x: colX(i), y: BODY.y + 52 + j * 96, w: 230, h: 88 });
  const DET = { x: BODY.x + 10, y: BODY.y + 346, w: BODY.w - 20, h: 212 }, BTN = { x: BODY.x + BODY.w - 236, y: BODY.y + 484, w: 206, h: 56 };
  const runeR = i => ({ x: BODY.x + 10 + i * 238, y: BODY.y + 60, w: 230, h: 250 });
  const snd = (n, v) => { try { playSnd(n, v || .7); } catch (e) {} };
  const speak = s => { UI.say = s; UI.sayT = performance.now(); };
  const statText = id => { const it = ITEM_DB[id]; return ['atk', 'def', 'maxhp', 'maxmp', 'spd'].filter(k => it[k]).map(k => STAT_NAME[k] + ' +' + it[k]).join('　'); };
  function btn(r, label, state, size) { D(state === 'd' ? 'button_d' : state === 'p' ? 'button_p' : 'button_n', r.x, r.y, r.w, r.h); T(label, r.x + r.w / 2, r.y + r.h / 2 + 1, size || 19, state === 'd' ? C.dim : C.gold2, KAI(), 600, 'center'); }
  const armed = k => UI.arm && UI.arm.k === k && performance.now() - UI.arm.t < 3500;

  function drawGear(now, tier) { const g = grid(tier), open = tierOpen(tier);
    g.forEach((col, i) => { const x = colX(i); try { WX5.emblem(col.el, x + 24, BODY.y + 26, 15, 1); } catch (e) {} T(WX[col.el].n + ' · ' + (col.set ? col.set.name : ''), x + 48, BODY.y + 27, 20, C.gold2, BR(), 400); T('有 ' + J.count(col.el) + ' 枚' + WX[col.el].n + '精', x + 224, BODY.y + 28, 14, J.count(col.el) ? C.green : C.sub, KAI(), 500, 'right');
      col.parts.forEach((id, j) => { const r = cellR(i, j), on = UI.sel === id; ctx.save(); if (!open) ctx.globalAlpha *= .5; D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); if (!id) { ctx.restore(); return; }
        try { itemIcon(id, r.x + 44, r.y + 44, 30); } catch (e) {} const it = ITEM_DB[id], n = have(id);
        ctx.font = `400 21px ${BR()}`; T(fitW(it.name, 120), r.x + 86, r.y + 30, 21, C.gold2, BR(), 400);
        if (ELSE[id]) T('不在炉上打', r.x + 86, r.y + 60, 14, C.sub); else { const [q, gold] = COST[tier][it.slot]; T(WX[col.el].n + '精 ' + q + '　灵石 ' + gold, r.x + 86, r.y + 60, 14, J.count(col.el) >= q && (S.hero.gold || 0) >= gold ? C.text : C.sub); }
        if (n) T('已有', r.x + r.w - 14, r.y + 30, 14, C.green, KAI(), 600, 'right'); ctx.restore(); }); });
    D('panel_well_9', DET.x, DET.y, DET.w, DET.h);
    const id = UI.sel && ITEM_DB[UI.sel] ? UI.sel : null;
    if (!open) { T('第二档的东西要到凝丹境才打得动——眼下先看看要攒多少。', DET.x + 24, DET.y + 36, 17, C.red); }
    if (!id) { T(UI.say && now - UI.sayT < 6000 ? '「' + UI.say + '」' : '点一件看看要什么料。一行五行，凑齐同一列的剑、衣、靴三件，有套装效果。', DET.x + 24, DET.y + (open ? 40 : 70), 17, UI.say && now - UI.sayT < 6000 ? C.gold2 : C.sub); return; }
    const it = ITEM_DB[id], el = WX5.GEAR[id], st = G.setOfItem(id), y0 = DET.y + (open ? 0 : 30);
    try { itemIcon(id, DET.x + 62, y0 + 62, 42); } catch (e) {}
    T(it.name, DET.x + 124, y0 + 36, 28, C.gold2, BR(), 400); ctx.font = `400 28px ${BR()}`; const nw = ctx.measureText(it.name).width; T(WX[el].n + '性 · ' + SLOTN[it.slot] + '　' + statText(id), DET.x + 140 + nw, y0 + 39, 16, C.text);
    ctx.font = `500 15px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap(String(it.desc || ''), DET.x + 124, y0 + 70, DET.w - 400, 22, 2);
    if (st) T('〔' + st.name + '〕三件：' + st.text + (st.wx ? '（要灵根合' + WX[st.wx].n + '；叶孤星都能激活）' : ''), DET.x + 124, y0 + 122, 15, C.blue);
    if (UI.say && now - UI.sayT < 6000) T('「' + UI.say + '」', DET.x + 24, DET.y + DET.h - 30, 16, C.gold2);
    if (ELSE[id]) { T('出处：' + ELSE[id], BTN.x + BTN.w, BTN.y - 30, 16, C.sub, KAI(), 500, 'right'); btn(BTN, '不在炉上打', 'd', 17); return; }
    const [q, gold] = COST[tier][it.slot], nq = J.count(el), ng = S.hero.gold || 0;
    T(WX[el].n + '精 ' + nq + ' / ' + q, BTN.x + BTN.w, BTN.y - 54, 17, nq >= q ? C.green : C.red, NUM(), 600, 'right'); T('灵石 ' + ng + ' / ' + gold, BTN.x + BTN.w, BTN.y - 28, 17, ng >= gold ? C.green : C.red, NUM(), 600, 'right');
    if (!open) btn(BTN, '凝丹境后开炉', 'd', 17); else if (nq < q) btn(BTN, '还差 ' + (q - nq) + ' 枚' + WX[el].n + '精', 'd', 17); else if (ng < gold) btn(BTN, '灵石不够', 'd'); else btn(BTN, armed(id) ? '再点一次 · 开炉' : '打　造', armed(id) ? 'p' : 'n'); }

  function drawRune(now) { const o = WX5.XH(), hasXH = (() => { try { const h = S.hero; return WX5.isXH(h.equip && h.equip.weapon) || !!(h.bag && (h.bag.w_xinghen || h.bag.w_xinghen2)); } catch (e) { return false; } })();
    T('星痕剑是天底下唯一能换五行的剑。点亮哪一道星纹，打架时就多一样能换的属性。', BODY.x + 14, BODY.y + 28, 17, C.sub);
    ORDER.forEach((el, i) => { const r = runeR(i), own = !!o.own[el], k = 'rune_' + el, nq = J.count(el), ng = S.hero.gold || 0; D(own ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h);
      try { WX5.emblem(el, r.x + r.w / 2, r.y + 62, 40, own ? 1 : .55); } catch (e) {} T(WX[el].n + '纹', r.x + r.w / 2, r.y + 130, 28, own ? C.gold2 : C.text, BR(), 400, 'center'); T('克' + WX[WX5.KE[el]].n, r.x + r.w / 2, r.y + 160, 16, C.sub, KAI(), 500, 'center');
      const br = { x: r.x + 22, y: r.y + 186, w: r.w - 44, h: 48 };
      if (own) T('已点亮', r.x + r.w / 2, br.y + 24, 20, C.green, BR(), 400, 'center'); else if (!hasXH) btn(br, '还没有星痕剑', 'd', 16); else if (nq < RUNE[0]) btn(br, WX[el].n + '精 ' + nq + ' / ' + RUNE[0], 'd', 16); else if (ng < RUNE[1]) btn(br, '灵石 ' + RUNE[1], 'd', 16); else btn(br, armed(k) ? '再点一次 · 点亮' : '点亮 · ' + RUNE[0] + ' 精 ' + RUNE[1] + ' 石', armed(k) ? 'p' : 'n', 16); });
    D('panel_well_9', DET.x, DET.y, DET.w, DET.h); T(UI.say && now - UI.sayT < 6000 ? '「' + UI.say + '」' : '一道星纹：' + RUNE[0] + ' 枚那一行的精，' + RUNE[1] + ' 灵石。星辰宝库里拿星辰点也能换，妖王身上也能得。', DET.x + 24, DET.y + 40, 17, UI.say && now - UI.sayT < 6000 ? C.gold2 : C.sub); }

  function tapGear(tp, tier) { const g = grid(tier); for (let i = 0; i < g.length; i++) for (let j = 0; j < 3; j++) { const id = g[i].parts[j]; if (id && inR(tp, cellR(i, j))) { UI.sel = id; UI.arm = null; UI.say = ''; snd('ui_click'); return; } }
    const id = UI.sel && ITEM_DB[UI.sel] ? UI.sel : null; if (!id || !inR(tp, BTN) || ELSE[id]) return; const it = ITEM_DB[id], el = WX5.GEAR[id], [q, gold] = COST[tier][it.slot];
    if (!tierOpen(tier)) { speak('这块料我的炉子烧得动，你的修为还压不住。凝了丹再来。'); snd('ui_cancel'); return; }
    if (J.count(el) < q) { speak(WX[el].n + '精不够。' + WX[el].n + '性的妖兽身上凝得出来，去打。'); snd('ui_cancel'); return; } if ((S.hero.gold || 0) < gold) { speak('炭火钱不够。'); snd('ui_cancel'); return; }
    if (!armed(id)) { UI.arm = { k: id, t: performance.now() }; snd('ui_click'); return; }
    UI.arm = null; S.hero.bag[J.ID(el)] -= q; if (S.hero.bag[J.ID(el)] <= 0) delete S.hero.bag[J.ID(el)]; S.hero.gold -= gold; addItem(id, 1); F().forged = (F().forged || 0) + 1; snd('ui_confirm'); try { playSnd('jingle_levelup', .5); } catch (e) {}
    const st = G.setOfItem(id); speak('成了。「' + it.name + '」，' + WX[el].n + '性。' + (st ? '同一列的另外两件凑齐，才算一套。' : '')); return 'forged'; }
  function tapRune(tp) { const o = WX5.XH(); for (let i = 0; i < ORDER.length; i++) { const el = ORDER[i], r = runeR(i), br = { x: r.x + 22, y: r.y + 186, w: r.w - 44, h: 48 }, k = 'rune_' + el; if (!inR(tp, br)) continue;
      if (o.own[el]) { speak('这一道早亮了。'); return; } let has = false; try { const h = S.hero; has = WX5.isXH(h.equip && h.equip.weapon) || !!(h.bag && (h.bag.w_xinghen || h.bag.w_xinghen2)); } catch (e) {}
      if (!has) { speak('星痕剑？没见着。等你拿到了再来。'); snd('ui_cancel'); return; } if (J.count(el) < RUNE[0]) { speak(WX[el].n + '精不够，要 ' + RUNE[0] + ' 枚。'); snd('ui_cancel'); return; } if ((S.hero.gold || 0) < RUNE[1]) { speak('炭火钱不够。'); snd('ui_cancel'); return; }
      if (!armed(k)) { UI.arm = { k, t: performance.now() }; snd('ui_click'); return; }
      UI.arm = null; S.hero.bag[J.ID(el)] -= RUNE[0]; if (S.hero.bag[J.ID(el)] <= 0) delete S.hero.bag[J.ID(el)]; S.hero.gold -= RUNE[1]; o.own[el] = 1; o.cur = el; snd('ui_confirm'); try { playSnd('jingle_levelup', .6); } catch (e) {}
      speak(WX[el].n + '纹亮了。这剑认主，我只是替它添了把火。'); return; } }

  function draw() { if (!UI.open) return; kitLoad(); const now = performance.now(), a = Math.min(1, (now - UI.t0) / 180);
    ctx.save(); ctx.fillStyle = `rgba(5,13,19,${.9 * a})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
    if (!kitReady()) { T('炉火正旺……', W / 2, H / 2, 22, C.gold2, KAI(), 500, 'center'); ctx.restore(); return; }
    D('curtain_9', 0, 0, W, H); ctx.font = `400 62px ${BR()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; textOutline('剑炉', 28, 60, C.gold2, 'rgba(6,16,24,.85)', 6);
    TABS.forEach((t, i) => { const r = tabR(i), on = UI.tab === i; D(on ? 'category_s' : 'category_n', r.x, r.y, r.w, r.h); T(t, r.x + r.w / 2, r.y + r.h / 2 + 1, 18, on ? C.gold2 : (i === 1 && !tierOpen(2) ? C.dim : C.text), KAI(), 600, 'center'); });
    T('灵石 ' + (S.hero.gold || 0), CLOSE.x - 24, CLOSE.y + CLOSE.h / 2 + 1, 18, C.gold, NUM(), 600, 'right');
    D('close_n', CLOSE.x, CLOSE.y, CLOSE.w, CLOSE.h); T('关　闭', CLOSE.x + CLOSE.w / 2, CLOSE.y + CLOSE.h / 2 + 1, 19, C.gold2, KAI(), 600, 'center');
    D('panel_main_9', P.x, P.y, P.w, P.h); D('panel_detail_9', BODY.x - 6, BODY.y - 2, BODY.w + 12, BODY.h + 4);
    if (UI.tab === 2) drawRune(now); else drawGear(now, UI.tab + 1); ctx.restore(); }
  try { S.overlay.push({ draw() { try { draw(); } catch (e) { console.warn('R394', e); try { ctx.restore(); } catch (e2) {} } } }); } catch (e) {}

  async function open() { if (UI.open || (typeof battle !== 'undefined' && battle)) return; kitLoad(); const lock0 = world.locked, hud0 = S.hud; S.hud = false; world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    UI.open = true; UI.t0 = performance.now(); UI.taps.length = 0; UI.sel = null; UI.arm = null; UI.say = ''; snd('ui_open'); let forged = 0;
    try { for (;;) { await nextFrame(); const tp = UI.taps.shift(); if (!tp) continue; if (!kitReady()) continue; if (inR(tp, CLOSE)) break;
        let hit = false; for (let i = 0; i < TABS.length; i++) if (inR(tp, tabR(i))) { hit = true; if (UI.tab !== i) { UI.tab = i; UI.sel = null; UI.arm = null; UI.say = ''; snd('ui_click'); } } if (hit) continue;
        if (UI.tab === 2) tapRune(tp); else if (tapGear(tp, UI.tab + 1) === 'forged') forged++; } }
    finally { UI.open = false; world.locked = lock0; S.hud = hud0; try { input.tapped = null; } catch (e) {} snd('ui_click'); }
    if (forged && !F().forge_tip && window.SAY_LATER) { F().forge_tip = 1; SAY_LATER(async () => { await say('星旋', '新打的东西在行囊里。点左上角的头像，看看穿在谁身上合适——各人灵根不同，合的十成，不合的八折。'); }); } }
  try { cv.addEventListener('pointerdown', e => { if (!UI.open) return; e.stopImmediatePropagation(); e.preventDefault(); UI.taps.push(toLogical(e)); try { input.tapped = null; } catch (e2) {} }, true); } catch (e) {}

  // 和铸剑师说话：头一回交代两句；之后问要打造还是强化（强化是原来就有的那一套：狼牙、兽皮 + 灵石，最高 +5）
  async function talk() { const f = F();
    if (!f.forge_met) { f.forge_met = 1; await say(SMITH, '宗主家的公子？手伸出来。……茧子是有的，剑没白练。'); await say(SMITH, '广场上人来人往，静不下心。往后我就守着这座炉子。带五行之精来，剑、甲、靴都能打——精是什么性，打出来就是什么性。'); await say('星旋', '听见没有？想要哪一行的兵器，就去打哪一行的妖兽。'); }
    const opts = ['打造装备 · 点星纹', '强化装备', '离开'], c = await choose(SMITH, opts);
    if (c === 0) await open(); else if (c === 1) { await say(SMITH, '剑要常磨。把家伙拿来，我给你淬一淬。'); try { if (window.REFINE_UI) await REFINE_UI(SMITH); } catch (e) { console.warn('R394 refine', e); } } }
  window.R394 = { open, talk, isOpen: () => UI.open, UI, COST, RUNE };
})();

// ================= 剑炉和铸剑师摆进云海大亭（Codex R389 的画）=================
// 位置照 Codex 的概念图：亭子西边的石板地上，青铜三足炉靠后，剑架在右后，淬火石槽在左前，铁砧在前，铸剑师站在砧右。
// 作者 11-27 08:30：「把铸剑师搬到青竹小院后面的云海大亭，旁边弄一个炉子」——所以人还是原来那位铸剑师，只是换了地方。
(function () {
  const MAP = 'qingzhu_upper_pavilion'; if (typeof TMAPS === 'undefined' || !TMAPS[MAP] || !TMAPS[MAP].baked || !window.R394 || typeof IMG === 'undefined') return;
  const M = TMAPS[MAP], B = M.baked, F = () => (S.flags = S.flags || {});
  const CW = 660, CH = 460, K = 383 / CW, GX = 420, GY = 640, GW = Math.round(CW * K), GH = Math.round(CH * K), SY = GY + 442 * K;   // 整组图在地图上的位置和大小（图是 2 倍画的）
  const FIRE = { x: 172, y: 6, w: 170, h: 68, n: 4, ms: 150 }, NPC_AT = [762, 902], SMITH = '铸剑师';
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const IMS = [], load = (k, s) => { const im = new Image(); im.onload = () => { try { IMG[k] = im; } catch (e) {} }; im.src = s; IMS.push(im); };
  load('r394_forge', 'r394/forge.webp?v=1'); load('r394_fire', 'r394/fire.webp?v=1');
  // 开局阶段要的图会被 img_guard 排到队尾；进云海大亭（或它隔壁的青竹小院、后山崖顶）时让剑炉这两张插队
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function (name) { try { if (/^(qingzhu_upper_pavilion|qingzhu_court|qingzhu_stairs|tj_houshan)$/.test(name) && window.IMG_GUARD && IMG_GUARD.bump) for (const im of IMS) IMG_GUARD.bump(im); } catch (e) {} return orig.apply(this, arguments); })(tileSetMap);
  // 画：整组一张，按铁砧脚下那条线排前后；炉口的火四帧来回，上面叠一团暖光
  if (!B.objs.some(o => o.id === 'r394_forge')) B.objs.push({ id: 'r394_forge', uid: 'r394_forge', img: 'r394_forge', x: GX, y: GY, w: GW, h: GH, sy: SY, ax: GX + GW / 2, ay: SY, flat: false, flip: false, noBlock: true, noPre: true });
  drawBaked = (orig => function (o, now) { if (!o || o.id !== 'r394_forge') return orig.apply(this, arguments);
    const im = IMG.r394_forge; if (!im) return; ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, o.x, o.y, o.w, o.h);
    const fi = IMG.r394_fire; if (fi) { const f = Math.floor(performance.now() / FIRE.ms) % FIRE.n; ctx.drawImage(fi, f * FIRE.w, 0, FIRE.w, FIRE.h, o.x + FIRE.x * K, o.y + FIRE.y * K, FIRE.w * K, FIRE.h * K); }
    const cx = o.x + (FIRE.x + FIRE.w / 2) * K, cy = o.y + (FIRE.y + FIRE.h * .7) * K, k = .5 + .5 * Math.sin(now * 5.3) * Math.sin(now * 2.1); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 86); g.addColorStop(0, `rgba(255,190,90,${.3 + .12 * k})`); g.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 86, 0, 7); ctx.fill();
    for (let i = 0; i < 6; i++) { const life = 1.5 + i * .19, t = ((now + i * .43) % life) / life, x = cx + Math.sin(i * 2.3 + now * .7) * 26 * (1 - t * .4), y = cy - 6 - t * 70, a = Math.sin(t * Math.PI) * .85; ctx.fillStyle = `rgba(255,${200 - i * 12},110,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.3 + (i % 2) * .7, 0, 7); ctx.fill(); }   // 火星
    ctx.restore(); })(drawBaked);
  // 挡路：炉脚、剑架底座、石槽、砧墩各挡脚下一块（图上的像素 → 地图格子）
  const RECTS = [[130, 318, 405, 412], [445, 345, 630, 400], [38, 392, 266, 446], [42, 344, 84, 400], [356, 408, 514, 446]];
  function block() { if (B._r394 === B.blocked) return; const cs = B.cs, cols = B.cols, rows = B.rows, b = B.blocked.split('');
    for (const [x0, y0, x1, y1] of RECTS) for (let r = Math.floor((GY + y0 * K) / cs); r <= Math.floor((GY + y1 * K) / cs); r++) for (let c = Math.floor((GX + x0 * K) / cs); c <= Math.floor((GX + x1 * K) / cs); c++) if (c >= 0 && r >= 0 && c < cols && r < rows) b[r * cols + c] = '1';
    B.blocked = b.join(''); B._r394 = B.blocked; try { if (window.R283 && R283.done) R283.done[MAP] = B.blocked; } catch (e) {} }
  tileSetMap = (orig => function (m) { if (m === MAP) { try { if (window.R283) R283.apply(MAP); block(); } catch (e) { console.warn('R394 block', e); } } return orig.apply(this, arguments); })(tileSetMap);
  // 铸剑师：就是原来站在演武广场上的那一位（Codex R156 的造型，提锤御剑）——照作者说的，把他搬到云海大亭的剑炉旁。广场上不再站人。
  try { const TF = TMAPS.tj_front; if (TF && Array.isArray(TF.npcs)) TF.npcs = TF.npcs.filter(n => n.name !== SMITH); } catch (e) {}
  M.npcs = M.npcs || []; if (!M.npcs.some(n => n.forge)) { const [c, r] = P(NPC_AT[0], NPC_AT[1]); M.npcs.push({ key: 'c_a2', cx: 'spirit_swordsmith', c, r, wander: false, face: 'down', name: SMITH, forge: 1, talk: () => R394.talk() }); }
  // 点他：走这里的菜单（打造 / 强化），不走原来只有「强化装备」的那一层
  if (typeof doInteract === 'function') doInteract = (orig => async function (h) { if (!(h && h.type === 'npc' && h.a && h.a.npc && h.a.npc.forge)) return orig.apply(this, arguments);
    world.locked = true; try { await R394.talk(); } catch (e) { console.warn('R394 talk', e); } finally { world.locked = false; } })(doInteract);
  // 玉佩里多一桩事迹：开炉
  try { const R = window.R386; if (R && Array.isArray(R.TASKS) && !R.TASKS.some(t => t.id === 'lq1')) { const i = R.TASKS.findIndex(t => t.id === 'x4');
      R.TASKS.splice(i < 0 ? R.TASKS.length : i, 0, { id: 'lq1', cat: '修行', name: '开炉', desc: '带五行之精去云海大亭的剑炉，打一件装备', n: () => [Math.min(1, F().forged || 0), 1], pts: 30, show: () => !!(F().forged || F().wxj_said), quip: '自己攒料、自己开炉，这才像个修士。往后缺什么性的兵器，就去打什么性的妖。' }); } } catch (e) {}
  window.R394.place = { GX, GY, GW, GH, SY, NPC_AT };
})();
