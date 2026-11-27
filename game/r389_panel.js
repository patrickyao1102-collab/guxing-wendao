// ================= R389 · 人物全身面板：身上四件、五行合不合、套装凑了几件（只进测试版）=================
// 作者 11-27 08:17：「可以给人物设置一个全身面板嘛，对不对？然后就可以看到衣服、武器、鞋子、饰品这样子。」
// 打开：在地图上点左上角的头像（点谁看谁）。界面用行囊「玄青星图」那套件，和玉佩是一家。
//   左边：人站在中间，四周四个格子（武器 / 衣 / 靴 / 饰品），下面写境界和本命灵根；
//   右边：点一个格子，列出行囊里能换的同部位装备——每件写清五行、穿在这个人身上发挥几成、属于哪一套；
//   右下：这个人身上的套装凑了几件、激活没有，激不活的写明为什么。
// 规矩本身（八折、套装）在 r389_gear.js。
(function () {
  const K = window.R386_KIT, G = window.GEAR5; if (!K || !G || !window.WX5 || typeof cv === 'undefined' || typeof partyList !== 'function') return;
  const { KIT, D, T, C, BR, KAI, NUM, fit: fitW, wrap, kitLoad, kitReady, inR } = K, WX = WX5.WX;
  const F = () => (S.flags = S.flags || {});
  const UI = { open: false, t0: 0, taps: [], who: 'hero', slot: 'weapon', sel: null, page: 0, msg: '', msgT: 0 };
  const SLOT_NAME = { weapon: '武器', wrist: '护腕', armor: '衣甲', shoe: '靴', acc: '饰品' };
  const STAT_NAME = { atk: '攻击', def: '防御', maxhp: '气血', maxmp: '灵力', spd: '速度' };
  const P = { x: 20, y: 96, w: 1240, h: 604 }, LEFT = { x: 34, y: 110, w: 470, h: 576 }, RIGHT = { x: 516, y: 110, w: 730, h: 576 }, CLOSE = { x: 1126, y: 34, w: 124, h: 46 };
  const SLOT_POS = { weapon: [LEFT.x + 16, LEFT.y + 34], wrist: [LEFT.x + 16, LEFT.y + 172], acc: [LEFT.x + 16, LEFT.y + 310], armor: [LEFT.x + LEFT.w - 116, LEFT.y + 34], shoe: [LEFT.x + LEFT.w - 116, LEFT.y + 310] };   // 11-27：左边一列是管攻击的三件（武器、护腕、饰品），右边是衣甲和靴
  const slotR = s => ({ x: SLOT_POS[s][0], y: SLOT_POS[s][1], w: 100, h: 100 });
  const whoR = i => ({ x: 250 + i * 150, y: 36, w: 140, h: 44 });
  const cardR = i => ({ x: RIGHT.x + 14 + (i % 2) * 354, y: RIGHT.y + 92 + Math.floor(i / 2) * 86, w: 346, h: 78 });
  const PER = 6, PG = { prev: { x: RIGHT.x + RIGHT.w - 226, y: RIGHT.y + 50, w: 96, h: 34 }, next: { x: RIGHT.x + RIGHT.w - 110, y: RIGHT.y + 50, w: 96, h: 34 } };
  const DET = { x: RIGHT.x + 14, y: RIGHT.y + 354, w: RIGHT.w - 28, h: 104 }, ACT = { x: RIGHT.x + RIGHT.w - 168, y: RIGHT.y + 384, w: 140, h: 48 }, SETB = { x: RIGHT.x + 14, y: RIGHT.y + 466, w: RIGHT.w - 28, h: 100 };
  const snd = (n, v) => { try { playSnd(n, v || .7); } catch (e) {} };
  const say = s => { UI.msg = s; UI.msgT = performance.now(); };
  const info = () => { try { return memberInfo(UI.who); } catch (e) { return memberInfo('hero'); } };
  const eq = () => G.eqOf(UI.who);
  const statText = (id, who) => { const it = ITEM_DB[id]; if (!it) return ''; const f = G.fit(who, id), out = []; for (const k of ['atk', 'def', 'maxhp', 'maxmp', 'spd']) if (it[k]) { const v = it[k] > 0 ? Math.round(it[k] * f) : it[k]; out.push(STAT_NAME[k] + (v > 0 ? ' +' : ' ') + v); } return out.join('　'); };
  const cands = () => { const h = S.hero, cur = eq()[UI.slot]; const own = Object.keys(h.bag || {}).filter(id => ITEM_DB[id] && ITEM_DB[id].slot === UI.slot && (h.bag[id] || 0) > 0); const lst = (cur ? [cur] : []).concat(own.filter(id => id !== cur));
    const rank = id => id === cur ? -9 : -(G.fit(UI.who, id) * 100) - (ITEM_DB[id].atk || 0) - (ITEM_DB[id].def || 0); return lst.sort((a, b) => rank(a) - rank(b)); };
  const rootLine = who => { if (who === 'hero') { const e = WX5.heroWx(); return [e, '灵根 · 无' + (e ? '　　眼下出手：' + WX[e].n : ''), '出手的五行跟着手里的剑走；穿什么都是十成']; }
    const r = WX5.ROOT[who], r2 = WX5.ROOT2[who]; return [r, '本命灵根 · ' + (r ? WX[r].n : '无') + (who === 'yunting' ? '（雷）' : ''), r2 ? '也能激发' + WX[r2].n + '（九成）；别的五行八折' : '合灵根的装备十成，不合的八折']; };

  // 立绘四周的透明边裁掉（各人的图留白不一样，裁了才一样大）；算一次记住
  const TRIM = new WeakMap();
  function trim(im) { let b = TRIM.get(im); if (b) return b; b = [0, 0, im.width, im.height];
    try { const k = Math.min(1, 160 / Math.max(im.width, im.height)), w = Math.max(1, Math.round(im.width * k)), h = Math.max(1, Math.round(im.height * k)), c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= x0 && y1 >= y0) b = [Math.max(0, (x0 - 1) / k), Math.max(0, (y0 - 1) / k), Math.min(im.width, (x1 - x0 + 3) / k), Math.min(im.height, (y1 - y0 + 3) / k)]; } catch (e) {}
    TRIM.set(im, b); return b; }
  // 人：用战斗里那张全身站姿（叶孤星 b_yegx、队友 PARTY_DB.key），没载到再退回对话立绘
  function portrait(mi, cx, top, h) { let full = null; try { full = IMG[UI.who === 'hero' ? 'b_yegx' : (PARTY_DB[UI.who] || {}).key]; } catch (e) {}
    ctx.save(); ctx.beginPath(); ctx.rect(LEFT.x + 8, LEFT.y + 8, LEFT.w - 16, 452); ctx.clip();
    if (full && full.width) { const bb = trim(full), bw = 290, bh = 420, s = Math.min(bw / bb[2], bh / bb[3]), w = bb[2] * s, hh = bb[3] * s; ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(cx, LEFT.y + 446, 96, 12, 0, 0, 7); ctx.fill(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(full, bb[0], bb[1], bb[2], bb[3], cx - w / 2, LEFT.y + 448 - hh, w, hh); }
    else { const im = IMG[mi.p]; if (im && im.width) { const s = h / im.height, w = im.width * s; ctx.drawImage(im, cx - w / 2, top, w, h); } }
    ctx.restore(); }
  function drawSlot(s, now) { const r = slotR(s), id = eq()[s], on = UI.slot === s; D(on ? 'item_slot_s' : 'item_slot_n', r.x, r.y, r.w, r.h);
    if (id && ITEM_DB[id]) { try { itemIcon(id, r.x + 50, r.y + 48, 34); } catch (e) {}
      if (window.REFINE_FX) { const lv = REFINE_FX.lvOf(id); if (lv) REFINE_FX.rect(r.x + 5, r.y + 5, r.w - 10, r.h - 10, 15, lv, now); } }   // 强化几级，框上就有几道光绕着转（r407_refine_fx.js）
    else T('空', r.x + 50, r.y + 50, 24, C.dim, BR(), 400, 'center');
    ctx.font = `600 15px ${KAI()}`; const nm = id && ITEM_DB[id] ? fitW(String(ITEM_DB[id].name).replace(/（(下品|中品|上品|极品|绝品)）/, ''), 118) : SLOT_NAME[s];   // 格子下面的名字不带成色（图标左上角有小牌） ctx.save(); ctx.fillStyle = 'rgba(6,16,24,.78)'; const tw = Math.min(124, ctx.measureText(nm).width + 16); ctx.fillRect(r.x + 50 - tw / 2, r.y + 104, tw, 24); ctx.restore(); T(nm, r.x + 50, r.y + 117, 15, id ? C.gold2 : C.sub, KAI(), 600, 'center');
    if (id && UI.who !== 'hero') { const f = G.fit(UI.who, id); if (f < 1) { ctx.save(); ctx.fillStyle = f >= .9 ? '#8a6a2a' : '#8a3a2c'; ctx.beginPath(); ctx.arc(r.x + 16, r.y + 16, 15, 0, 7); ctx.fill(); T(f >= .9 ? '九' : '八', r.x + 16, r.y + 17, 16, '#ffe9c8', BR(), 400, 'center'); ctx.restore(); } } }

  function drawLeft(now) { const mi = info(); D('panel_detail_9', LEFT.x, LEFT.y, LEFT.w, LEFT.h);
    if (KIT.skill_star_base) { ctx.save(); ctx.globalAlpha *= .35; ctx.beginPath(); ctx.rect(LEFT.x + 8, LEFT.y + 8, LEFT.w - 16, 452); ctx.clip(); ctx.drawImage(KIT.skill_star_base, LEFT.x - 40, LEFT.y + 10, 560, 460); ctx.restore(); }
    portrait(mi, LEFT.x + LEFT.w / 2, LEFT.y + 16, 640);
    for (const s of G.SLOTS) drawSlot(s, now);
    D('panel_well_9', LEFT.x + 12, LEFT.y + 462, LEFT.w - 24, 102);
    T(mi.name, LEFT.x + 30, LEFT.y + 490, 30, C.gold2, BR(), 400); T((mi.lv ? mi.lv + ' 级 · ' : '') + (mi.realm || ''), LEFT.x + LEFT.w - 30, LEFT.y + 492, 17, C.gold, KAI(), 500, 'right');
    const [el, a, b] = rootLine(UI.who); try { if (el) WX5.emblem(el, LEFT.x + 44, LEFT.y + 534, 15, 1); } catch (e) {}
    T(a, LEFT.x + 68, LEFT.y + 524, 17, C.text, KAI(), 600); ctx.font = `500 14px ${KAI()}`; T(fitW(b, LEFT.w - 100), LEFT.x + 68, LEFT.y + 547, 14, C.sub, KAI(), 500); }

  function drawRight(now) { const mi = info(), cur = eq()[UI.slot]; D('panel_detail_9', RIGHT.x, RIGHT.y, RIGHT.w, RIGHT.h);
    // 属性一行
    [['气血', mi.maxhp], ['灵力', mi.maxmp], ['攻击', mi.atk], ['防御', mi.def], ['速度', mi.spd]].forEach(([n, v], i) => { const x = RIGHT.x + 26 + i * 140; T(n, x, RIGHT.y + 28, 15, C.sub); const lw = ctx.measureText(n).width; T(String(v == null ? '-' : v), x + lw + 10, RIGHT.y + 28, 20, C.text, NUM(), 700); });
    D('divider_h_3', RIGHT.x + 16, RIGHT.y + 46, RIGHT.w - 32, 3);
    T(SLOT_NAME[UI.slot] + ' · 行囊里能换的', RIGHT.x + 22, RIGHT.y + 68, 18, C.gold2, KAI(), 600);
    const list = cands(), np = Math.max(1, Math.ceil(list.length / PER)); UI.page = Math.min(UI.page, np - 1);
    if (np > 1) { btn(PG.prev, '上一页', UI.page > 0 ? 'n' : 'd', 15); btn(PG.next, '下一页', UI.page < np - 1 ? 'n' : 'd', 15); }
    if (!list.length) T('行囊里没有这个部位的装备。', RIGHT.x + RIGHT.w / 2, RIGHT.y + 200, 18, C.sub, KAI(), 500, 'center');
    list.slice(UI.page * PER, UI.page * PER + PER).forEach((id, i) => { const r = cardR(i), it = ITEM_DB[id], on = UI.sel === id, isCur = id === cur, [ft, fk] = G.fitText(UI.who, id), st = G.setOfItem(id);
      D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(id, r.x + 40, r.y + 39, 26); } catch (e) {}
      ctx.font = `400 21px ${BR()}`; T(fitW(it.name, 150), r.x + 78, r.y + 26, 21, C.gold2, BR(), 400); const nw = Math.min(150, ctx.measureText(it.name).width);
      const rkc = window.GEAR6 ? GEAR6.col(id) : null;   // 排进格子的装备：套装名用它那一等的颜色；不成套的写「稀有」「难得」（常见的不写）
      if (st) T('〔' + st.name + '〕', r.x + 82 + nw, r.y + 27, 14, st.tier >= 9 ? '#f0c86a' : rkc || C.blue, KAI(), 600);
      else if (rkc && GEAR6.rankOf(id) > 0) T('〔' + GEAR6.rankName(id) + '〕', r.x + 82 + nw, r.y + 27, 14, rkc, KAI(), 600);
      if (isCur) T('身上', r.x + r.w - 16, r.y + 26, 15, C.green, KAI(), 600, 'right');
      ctx.font = `600 14px ${KAI()}`; const tagW = ctx.measureText(ft).width; T(ft, r.x + r.w - 16, r.y + 54, 14, fk > 0 ? C.green : fk < -1 ? C.red : fk < 0 ? '#d9b46a' : C.sub, KAI(), 600, 'right');
      ctx.font = `500 14px ${KAI()}`; T(fitW(statText(id, UI.who), r.w - 78 - tagW - 30), r.x + 78, r.y + 54, 14, C.text, KAI(), 500); });
    // 选中的那一件
    D('panel_well_9', DET.x, DET.y, DET.w, DET.h); const id = UI.sel && ITEM_DB[UI.sel] ? UI.sel : null;
    if (!id) { T(UI.msg && now - UI.msgT < 4000 ? UI.msg : '点左边的格子换部位；点上面的装备看说明。', DET.x + 22, DET.y + 34, 17, UI.msg && now - UI.msgT < 4000 ? C.gold2 : C.sub); }
    else { const it = ITEM_DB[id]; T(it.name, DET.x + 22, DET.y + 28, 24, C.gold2, BR(), 400); const g = WX5.GEAR[id]; ctx.font = `400 24px ${BR()}`; const nw = ctx.measureText(it.name).width; const lb = window.GEAR6 ? GEAR6.label(id) : ''; if (g) { try { WX5.emblem(g, DET.x + 42 + nw, DET.y + 28, 12, 1); } catch (e) {} T(WX[g].n + '性' + (lb ? ' · ' + lb : ''), DET.x + 60 + nw, DET.y + 29, 15, C.sub); } else if (lb) T(lb, DET.x + 34 + nw, DET.y + 29, 15, C.sub);
      ctx.font = `500 15px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = UI.msg && now - UI.msgT < 4000 ? C.gold2 : C.text; wrap(UI.msg && now - UI.msgT < 4000 ? UI.msg : String(it.desc || ''), DET.x + 22, DET.y + 58, DET.w - 210, 22, 2);
      btn(ACT, id === cur ? '卸　下' : '换　上', 'n'); }
    // 套装
    D('panel_well_9', SETB.x, SETB.y, SETB.w, SETB.h); const sets = G.setsOf(UI.who), own = G.SETS.find(s => s.owner === UI.who), rows = sets.slice();
    if (own && !rows.some(([s]) => s.id === own.id)) rows.unshift([own, G.setState(UI.who, own)]);
    if (!rows.length) T('身上还没有成套的装备。套装要凑齐四件：剑、护腕、衣、靴。专属套装再配上它的饰品，还有一层。', SETB.x + 22, SETB.y + 34, 16, C.sub);
    rows.slice(0, 3).forEach(([s, st], i) => { const y = SETB.y + 22 + i * 28; if (s.wx) { try { WX5.emblem(s.wx, SETB.x + 30, y, 10, 1); } catch (e) {} }
      const head = (s.owner ? '专属套装 · ' : '套装 · ') + s.name + '　' + st.n + ' / ' + st.need + (s.extra ? (st.ex ? ' + 饰品' : '') : ''); T(head, SETB.x + 48, y, 16, st.on ? C.green : C.gold2, KAI(), 600); const hw = ctx.measureText(head).width;
      const sk = s.skill ? '；套装技能「' + s.skillName + '」' + (st.on ? '可以施展' : '（穿齐才能施展）') : '';
      const full = st.on4 ? '五件：' + s.text + '；' + s.extra.text + sk : '四件：' + s.text + sk + (s.extra && st.on && ITEM_DB[s.extra.id] ? '（再配上' + ITEM_DB[s.extra.id].name + '还有一层）' : '');
      ctx.font = `500 15px ${KAI()}`;
      if (rows.length === 1) { ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = st.on ? C.text : C.sub; wrap(full, SETB.x + 48, y + 27, SETB.w - 76, 22, 2); }   // 只有一套时：效果另起一行写全（专属套装的字多，一行写不下）
      else T(fitW(full, SETB.w - 48 - Math.max(160, hw + 18) - 150), SETB.x + 48 + Math.max(160, hw + 18), y, 15, st.on ? C.text : C.sub);
      T(st.on ? '已激活' : st.why || ('还差 ' + (st.need - st.n) + ' 件'), SETB.x + SETB.w - 20, y, 15, st.on ? C.green : st.why ? C.red : C.sub, KAI(), 600, 'right'); }); }

  function btn(r, label, state, size) { D(state === 'd' ? 'button_d' : state === 'p' ? 'button_p' : 'button_n', r.x, r.y, r.w, r.h); T(label, r.x + r.w / 2, r.y + r.h / 2 + 1, size || 18, state === 'd' ? C.dim : C.gold2, KAI(), 600, 'center'); }

  function doEquip(id) { const it = ITEM_DB[id], h = S.hero, who = UI.who, cur = eq()[UI.slot];
    if (id === cur) { // 卸下
      if (who === 'hero') { try { applyItemStats(id, -1); } catch (e) {} h.equip[UI.slot] = null; } else { eq()[UI.slot] = null; }
      h.bag[id] = (h.bag[id] || 0) + 1; snd('ui_click'); say('卸下了「' + it.name + '」。'); UI.sel = null; return; }
    if (who === 'hero') { if (it.lvReq && (h.lv || 1) < it.lvReq) { say('等级不足：要 ' + it.lvReq + ' 级才穿得上。'); snd('ui_cancel'); return; } equipItem(id); if (h.equip[UI.slot] !== id) { say('穿不上。'); return; } }
    else if (!(window.equipAlly && equipAlly(who, id))) { say('换不上。'); return; }
    try { if (sysPanel && sysPanel.eqp) sysPanel = null; } catch (e) {}   // 行囊里换装会弹的那张「旧值 → 新值」面板，这里不弹（本面板自己写清楚了）
    const [ft] = G.fitText(who, id); say('换上了「' + it.name + '」' + (who === 'hero' || !WX5.GEAR[id] ? '。' : '——' + ft + '。')); UI.sel = id; }

  function draw() { if (!UI.open) return; kitLoad(); const now = performance.now(), a = Math.min(1, (now - UI.t0) / 180);
    ctx.save(); ctx.fillStyle = `rgba(5,13,19,${.9 * a})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
    if (!kitReady()) { T('稍等……', W / 2, H / 2, 22, C.gold2, KAI(), 500, 'center'); ctx.restore(); return; }
    D('curtain_9', 0, 0, W, H);
    ctx.font = `400 62px ${BR()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; textOutline('装备', 28, 60, C.gold2, 'rgba(6,16,24,.85)', 6);
    partyList().forEach((k, i) => { const r = whoR(i), on = UI.who === k, mi = memberInfo(k); D(on ? 'category_s' : 'category_n', r.x, r.y, r.w, r.h); T(mi.name, r.x + r.w / 2, r.y + r.h / 2 + 1, 19, on ? C.gold2 : C.text, KAI(), 600, 'center'); });
    D('close_n', CLOSE.x, CLOSE.y, CLOSE.w, CLOSE.h); T('关　闭', CLOSE.x + CLOSE.w / 2, CLOSE.y + CLOSE.h / 2 + 1, 19, C.gold2, KAI(), 600, 'center');
    D('panel_main_9', P.x, P.y, P.w, P.h); drawLeft(now); drawRight(now); ctx.restore(); }
  try { S.overlay.push({ draw() { try { draw(); } catch (e) { console.warn('R389 panel', e); try { ctx.restore(); } catch (e2) {} } } }); } catch (e) {}

  async function open(who) { if (UI.open || (typeof battle !== 'undefined' && battle)) return; kitLoad(); const lock0 = world.locked, hud0 = S.hud; S.hud = false; world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    UI.open = true; UI.t0 = performance.now(); UI.taps.length = 0; UI.who = partyList().includes(who) ? who : 'hero'; UI.slot = 'weapon'; UI.sel = null; UI.page = 0; UI.msg = ''; snd('ui_open');
    try { for (;;) { await nextFrame(); const tp = UI.taps.shift(); if (!tp) continue; if (!kitReady()) continue;
        if (inR(tp, CLOSE)) break;
        const pl = partyList(); let hit = false; for (let i = 0; i < pl.length; i++) if (inR(tp, whoR(i))) { hit = true; if (UI.who !== pl[i]) { UI.who = pl[i]; UI.sel = null; UI.page = 0; UI.msg = ''; snd('ui_click'); } } if (hit) continue;
        for (const s of G.SLOTS) if (inR(tp, slotR(s))) { hit = true; if (UI.slot !== s) { UI.slot = s; UI.page = 0; snd('ui_click'); } UI.sel = eq()[s] || null; UI.msg = ''; } if (hit) continue;
        const list = cands(), np = Math.max(1, Math.ceil(list.length / PER));
        if (np > 1) { if (inR(tp, PG.prev) && UI.page > 0) { UI.page--; snd('ui_click'); continue; } if (inR(tp, PG.next) && UI.page < np - 1) { UI.page++; snd('ui_click'); continue; } }
        const vis = list.slice(UI.page * PER, UI.page * PER + PER); for (let i = 0; i < vis.length; i++) if (inR(tp, cardR(i))) { hit = true; UI.sel = vis[i]; UI.msg = ''; snd('ui_click'); } if (hit) continue;
        if (UI.sel && ITEM_DB[UI.sel] && inR(tp, ACT)) { try { doEquip(UI.sel); } catch (e) { console.warn('R389 equip', e); } continue; } } }
    finally { UI.open = false; world.locked = lock0; S.hud = hud0; try { input.tapped = null; } catch (e) {} snd('ui_click'); } }
  try { cv.addEventListener('pointerdown', e => { if (!UI.open) return; e.stopImmediatePropagation(); e.preventDefault(); UI.taps.push(toLogical(e)); try { input.tapped = null; } catch (e2) {} }, true); } catch (e) {}

  // 地图左上角的头像：点谁看谁
  const AV = i => ({ x: 192 + i * 64, y: 42, r: 30 });
  const hudOn = () => world.map && S.scene === drawMap && S.hud && !world.locked && !dialog && !choice && !sysPanel && !S.menu && !(typeof battle !== 'undefined' && battle) && !UI.open && !(window.R386 && R386.isOpen && R386.isOpen()) && !(window.IG_OPEN && IG_OPEN());
  try { cv.addEventListener('pointerdown', e => { if (UI.open || !hudOn()) return; const p = toLogical(e), pl = partyList(); for (let i = 0; i < pl.length; i++) { const a = AV(i); if (Math.hypot(p.x - a.x, p.y - a.y) <= a.r) { e.stopImmediatePropagation(); e.preventDefault(); try { input.tapped = null; } catch (e2) {} open(pl[i]); return; } } }, true); } catch (e) {}
  window.R389 = { open, isOpen: () => UI.open, UI };
})();
