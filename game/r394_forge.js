// ================= R394 · 剑炉：合成 / 强化 / 镶嵌 / 精炼 / 星纹（只进测试版）=================
// 作者 11-27 08:30：「炼器系统你单独详细的设置一个……铸剑师搬到青竹小院后面不有个云海大亭吗？旁边可以弄一个炉子。」
// 作者 11-27 中午：照《秦殇前传：复活》那样做——「打造系统里面有强化、镶嵌、合成」「动画不要特别多」「要有合成那一下的特效，
//   但不是放一个完整的合成动画，那样太拖时间」。合成的规矩（玩家看不到的那张表）在 r400_craft.js，这里只是界面：
//   · 合成：左边是身上的材料，点一下放进阵盘的五个角；放满五样点「合成」，盘心出东西。不告诉玩家会出什么。
//           右边是「合成秘籍」，只记各人的专属套装。
//   · 强化：原来就有的那套（最高 +5，+4 七成、+5 五成，失败只损材料），换成带图标的界面；兵器饰品吃兵饰料，衣甲鞋吃防具料。
//   · 镶嵌：五行灵珠镶到装备上（星痕剑不镶珠，它点星纹）。  · 精炼：把用不上的材料炼成五行之精。  · 星纹：上午做的，没动。
// 界面用行囊「玄青星图」那套件；阵盘、页签图标、灵珠等 Codex R400 的图，到了自动换上，没到先用简单的线顶着。
(function () {
  const K = window.R386_KIT, G = window.GEAR5, J = window.WXJ, CR = window.CRAFT; if (!K || !G || !J || !CR || !window.WX5 || typeof cv === 'undefined') return;
  const { KIT, D, T, C, BR, KAI, NUM, fit: fitW, wrap, kitLoad, kitReady, inR } = K, WX = WX5.WX, ORDER = WX5.ORDER, MAT = CR.MAT;
  const F = () => (S.flags = S.flags || {});
  const SMITH = '铸剑师', RUNE = [6, 300];
  const STAT_NAME = { atk: '攻击', def: '防御', maxhp: '气血', maxmp: '灵力', spd: '速度' }, KEYS = ['atk', 'def', 'maxhp', 'maxmp', 'spd'], SLOT_CN = { weapon: '兵器', armor: '衣甲', shoe: '鞋履', acc: '饰品' };
  const UI = { open: false, t0: 0, taps: [], tab: 0, arm: null, say: '', sayT: 0, slots: [null, null, null, null, null], mf: 0, mp: 0, res: null, fx: [], gsel: null, gp: 0, msel: null, sock: 0 };
  const P = { x: 20, y: 96, w: 1240, h: 604 }, BODY = { x: 40, y: 112, w: 1200, h: 572 }, CLOSE = { x: 1126, y: 34, w: 124, h: 46 };
  const TABS = ['合成', '强化', '镶嵌', '精炼', '星纹'], TABK = ['hecheng', 'qianghua', 'xiangqian', 'jinglian', 'xingwen'], tabR = i => ({ x: 232 + i * 150, y: 36, w: 142, h: 44 });
  const snd = (n, v) => { try { playSnd(n, v || .7); } catch (e) {} };
  const speak = s => { UI.say = s; UI.sayT = performance.now(); };
  const saying = now => UI.say && now - UI.sayT < 7000;
  const armed = k => UI.arm && UI.arm.k === k && performance.now() - UI.arm.t < 3500;
  const have = id => (S.hero.bag[id] || 0);
  // 这件东西身上有没有（行囊里，或者谁正穿着）——专属的只要一件，有了就不再打，珍稀料留给别的方子
  const owned = id => { try { if (have(id) > 0) return true; for (const w of ['hero', ...(S.party || [])]) { const e = G.eqOf(w); for (const sl of G.SLOTS) if (e[sl] === id) return true; } } catch (e) {} return false; };
  function btn(r, label, state, size) { D(state === 'd' ? 'button_d' : state === 'p' ? 'button_p' : 'button_n', r.x, r.y, r.w, r.h); T(label, r.x + r.w / 2, r.y + r.h / 2 + 1, size || 19, state === 'd' ? C.dim : C.gold2, KAI(), 600, 'center'); }
  const statText = id => { const it = ITEM_DB[id]; return KEYS.filter(k => it[k]).map(k => STAT_NAME[k] + ' +' + it[k]).join('　'); };

  // ---- Codex R400 的图（到了才有）----
  // ---- Codex R400 的图（11-27 下午到的；r400i/）：阵盘、料槽的光圈、空孔位、秘籍册子、五枚页签小图标、两枚「兵 / 防」小标 ----
  const ART = {}, ARTN = new Set(['array', 'slot_on', 'socket_empty', 'book', 'tab_hecheng', 'tab_qianghua', 'tab_xiangqian', 'tab_jinglian', 'tab_xingwen', 'mark_bing', 'mark_fang']);
  const art = n => { if (!ARTN.has(n)) return null; let o = ART[n]; if (!o) { o = ART[n] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r400i/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
  const artAll = () => { for (const n of ARTN) art(n); };
  setTimeout(artAll, 7000);
  // ---- 出炉那一下的光：用战斗里现成的五行爆光，一闪就过 ----
  const FXN = { jin: 'fx3_burst_gold', mu: 'fx3_burst_green', shui: 'fx3_burst_blue', huo: 'fx3_burst_red', tu: 'fx3_burst_earth' };
  function burst(x, y, el, scale) { UI.fx.push({ n: FXN[el] || 'fx3_burst_gold', el, x, y, t0: performance.now(), s: scale || 1 }); }
  function drawFx(now) { UI.fx = UI.fx.filter(f => { const m = (typeof FXM !== 'undefined' && FXM[f.n]) || null, im = typeof IMG !== 'undefined' && IMG[f.n];
      if (!m || !im) { const k = (now - f.t0) / 380; if (k >= 1) return false; const c = GLOW[f.el] || [255, 220, 160], R = 150 * f.s * (.3 + .7 * k); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(f.x, f.y, 2, f.x, f.y, R); g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${.9 * (1 - k)})`); g.addColorStop(.5, `rgba(${c[0]},${c[1]},${c[2]},${.4 * (1 - k)})`); g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, 7); ctx.fill(); ctx.restore(); return true; }
      const fr = Math.floor((now - f.t0) / 1000 * m.fps * .8); if (fr >= m.n) return false; const sz = m.w * f.s; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(im, fr * m.w, 0, m.w, m.h, f.x - sz / 2, f.y - sz / 2, sz, sz); ctx.restore(); return true; }); }

  // =====================================================================================================
  // 材料栏（合成、精炼两页共用）
  // =====================================================================================================
  const ML = { x: 52, y: 124, w: 372, h: 548 }, MCOLS = 4, MROWS = 4, MCW = 88, MCH = 100, MFIL = ['全部', '兵饰', '防具', '百搭'];
  const mfR = i => ({ x: ML.x + 12 + i * 88, y: ML.y + 44, w: 82, h: 34 }), mcR = i => ({ x: ML.x + 10 + (i % MCOLS) * MCW, y: ML.y + 90 + Math.floor(i / MCOLS) * MCH, w: MCW - 4, h: MCH - 4 });
  const MPG = { prev: { x: ML.x + 12, y: ML.y + ML.h - 46, w: 110, h: 36 }, next: { x: ML.x + ML.w - 122, y: ML.y + ML.h - 46, w: 110, h: 36 } };
  const used = id => UI.tab === 0 ? UI.slots.filter(s => s === id).length : 0;
  function matList(only) { const ord = { W: 0, A: 1, null: 2 }; return Object.keys(MAT).filter(id => have(id) > 0 && (!only || only(id)) && (UI.mf === 0 || (UI.mf === 1 && MAT[id].c === 'W') || (UI.mf === 2 && MAT[id].c === 'A') || (UI.mf === 3 && !MAT[id].c)))
      .sort((a, b) => ord[MAT[a].c] - ord[MAT[b].c] || MAT[a].g - MAT[b].g || (a < b ? -1 : 1)); }
  function drawMats(title, only, selId) { D('panel_well_9', ML.x, ML.y, ML.w, ML.h); T(title, ML.x + 16, ML.y + 24, 20, C.gold2, BR(), 400);
    MFIL.forEach((t, i) => { const r = mfR(i), on = UI.mf === i, mk = i === 1 ? art('mark_bing') : i === 2 ? art('mark_fang') : null; D(on ? 'category_s' : 'category_n', r.x, r.y, r.w, r.h);
      if (mk) { ctx.save(); if (!on) ctx.globalAlpha *= .7; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(mk, r.x + 5, r.y + 3, 28, 28); ctx.restore(); }
      T(t, r.x + r.w / 2 + (mk ? 13 : 0), r.y + r.h / 2 + 1, 16, on ? C.gold2 : C.text, KAI(), 600, 'center'); });
    const list = matList(only), per = MCOLS * MROWS, np = Math.max(1, Math.ceil(list.length / per)); UI.mp = Math.min(UI.mp, np - 1);
    if (!list.length) { ctx.font = `500 16px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap(UI.mf ? '这一类的材料，身上一样都没有。' : '身上还没有材料。打妖兽、开宝箱、采灵矿都能得。', ML.x + 20, ML.y + 130, ML.w - 40, 24, 3); }
    list.slice(UI.mp * per, UI.mp * per + per).forEach((id, i) => { const r = mcR(i), m = MAT[id], n = have(id) - used(id), on = selId === id; ctx.save(); if (n <= 0) ctx.globalAlpha *= .35;
      D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(id, r.x + r.w / 2, r.y + 38, 27); } catch (e) {}
      if (m.wx) { try { WX5.emblem(m.wx, r.x + 15, r.y + 15, 10, 1); } catch (e) {} }
      if (m.c) T(m.c === 'W' ? '兵' : '防', r.x + r.w - 15, r.y + 15, 13, C.sub, KAI(), 600, 'center');
      T(String(Math.max(0, n)), r.x + r.w - 10, r.y + 58, 16, C.gold2, NUM(), 700, 'right');
      ctx.font = `500 14px ${KAI()}`; T(fitW(ITEM_DB[id].name, r.w - 8), r.x + r.w / 2, r.y + r.h - 14, 14, C.text, KAI(), 500, 'center'); ctx.restore(); });
    if (np > 1) { btn(MPG.prev, '上一页', UI.mp > 0 ? 'n' : 'd', 15); btn(MPG.next, '下一页', UI.mp < np - 1 ? 'n' : 'd', 15); T((UI.mp + 1) + ' / ' + np, ML.x + ML.w / 2, MPG.prev.y + 18, 15, C.sub, NUM(), 600, 'center'); } }
  // 点材料栏：返回 { id } / true（点了别的控件）/ null
  function tapMats(tp, only) { for (let i = 0; i < MFIL.length; i++) if (inR(tp, mfR(i))) { if (UI.mf !== i) { UI.mf = i; UI.mp = 0; snd('ui_click'); } return true; }
    const list = matList(only), per = MCOLS * MROWS, np = Math.max(1, Math.ceil(list.length / per));
    if (np > 1 && inR(tp, MPG.prev)) { if (UI.mp > 0) { UI.mp--; snd('ui_click'); } return true; } if (np > 1 && inR(tp, MPG.next)) { if (UI.mp < np - 1) { UI.mp++; snd('ui_click'); } return true; }
    const page = list.slice(UI.mp * per, UI.mp * per + per); for (let i = 0; i < page.length; i++) if (inR(tp, mcR(i))) return { id: page[i] }; return null; }

  // =====================================================================================================
  // 一、合成
  // =====================================================================================================
  // 阵盘：Codex 的 array 图是 720 见方，五个凹座离盘心 252、凹座直径 130、炉心直径 190；这里按 DISC 的大小缩着画
  const CX = 652, CY = 356, DISC = 404, DK = DISC / 720, SR = 252 * DK, SLOT_R = 30, CORE_R = 95 * DK;
  const slotXY = i => { const a = (-90 + i * 72) * Math.PI / 180; return [CX + Math.cos(a) * SR, CY + Math.sin(a) * SR]; };
  const B_CLEAR = { x: 462, y: 628, w: 120, h: 46 }, B_GO = { x: 596, y: 628, w: 246, h: 46 };
  const RB = { x: 880, y: 124, w: 348, h: 548 }, rcR = i => ({ x: RB.x + 10, y: RB.y + 76 + i * 106, w: RB.w - 20, h: 100 });
  const REL_COL = { same: [233, 217, 168], sheng: [150, 215, 140], wild: [150, 215, 140], ke: [226, 120, 100], none: [130, 142, 146] };
  const hintOf = a => !a.n ? ['点左边的材料，放到阵盘的五个角上。', C.sub] : a.n < 5 ? ['还差 ' + (5 - a.n) + ' 样。', C.sub] : a.why === 'noclass' ? ['光有精气，没有料——至少放一样牙、角、皮、丝之类的东西。', C.red]
    : a.kind === 'recipe' ? (owned(a.recipe.id) ? ['「' + ITEM_DB[a.recipe.id].name.replace(/ \+\d$/, '') + '」已经有一件了，不用再打。', C.sub] : ['对上了秘籍：「' + ITEM_DB[a.recipe.id].name + '」', C.gold2]) : a.s >= 2 ? ['五行相生，火候正旺。', C.green] : a.s === 1 ? ['略有相生，火候不差。', C.green] : a.s < 0 ? ['五行相克，怕是要走火。', C.red] : a.rel.every(r => r === 'same') ? ['五行纯一。', C.text] : ['五行平和。', C.text];
  const GLOW = { jin: [226, 230, 240], mu: [110, 210, 130], shui: [110, 180, 240], huo: [255, 130, 70], tu: [224, 172, 92] };
  function drawDisc(now, a) { const ar = art('array'), R = DISC / 2, seat = 65 * DK;
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (ar) ctx.drawImage(ar, CX - R, CY - R, DISC, DISC);
    else { const g = ctx.createRadialGradient(CX, CY, 20, CX, CY, R); g.addColorStop(0, 'rgba(34,52,60,.95)'); g.addColorStop(1, 'rgba(12,24,31,.95)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R - 2, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(194,173,120,.55)'; ctx.stroke();
      for (let i = 0; i < 5; i++) { const [x, y] = slotXY(i); ctx.fillStyle = 'rgba(6,14,19,.9)'; ctx.beginPath(); ctx.arc(x, y, seat, 0, 7); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(194,173,120,.45)'; ctx.stroke(); }
      ctx.fillStyle = 'rgba(30,16,12,.95)'; ctx.beginPath(); ctx.arc(CX, CY, CORE_R, 0, 7); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(194,173,120,.6)'; ctx.stroke(); }
    ctx.restore();
    // 炉心的火气：空着的时候是暗的；放一样料亮一分，颜色跟着这一炉的主行走
    if (a.n && !UI.res) { const c = GLOW[a.el] || [255, 170, 90], k = (a.n / 5) * (.34 + .08 * Math.sin(now / 300)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(CX, CY, 2, CX, CY, CORE_R); g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${k})`); g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, CORE_R, 0, 7); ctx.fill(); ctx.restore(); }
    // 每样料到炉心一道光：同性金、相生绿、相克红、不相干的只有淡淡一线；对上秘籍的五道全金
    ctx.save(); ctx.lineCap = 'round'; UI.slots.forEach((id, i) => { if (!id || !a.rel[i]) return; const rl = a.kind === 'recipe' ? 'same' : a.rel[i], [x, y] = slotXY(i), c = REL_COL[rl], k = .62 + .22 * Math.sin(now / 260 + i);
      const dx = CX - x, dy = CY - y, L = Math.hypot(dx, dy), x0 = x + dx / L * (seat + 3), y0 = y + dy / L * (seat + 3), x1 = CX - dx / L * (CORE_R + 2), y1 = CY - dy / L * (CORE_R + 2);
      if (rl === 'none') { ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},.3)`; ctx.lineWidth = 2; }
      else { ctx.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},.9)`; ctx.shadowBlur = 10; ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${k})`; ctx.lineWidth = 3.5; }
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }); ctx.restore();
    const on = art('slot_on'), os = seat * 2 * 1.13;
    UI.slots.forEach((id, i) => { const [x, y] = slotXY(i); if (!id) { if (!ar) T(String(i + 1), x, y + 1, 18, 'rgba(194,173,120,.35)', NUM(), 600, 'center'); return; }
      if (on) ctx.drawImage(on, x - os / 2, y - os / 2, os, os); try { itemIcon(id, x, y, SLOT_R); } catch (e) {}
      const m = MAT[id]; if (m && m.wx) { try { WX5.emblem(m.wx, x + SLOT_R * .8, y - SLOT_R * .8, 11, 1); } catch (e) {} } });
    // 炉心：刚出炉的那一件；没有的话，看得出主行就淡淡亮一枚那一行的徽记
    const res = UI.res; if (res) { const k = Math.min(1, (now - res.t) / 220), sc = 1 + (1 - k) * .5; ctx.save(); try { ctx.globalAlpha *= k; itemIcon(res.id, CX, CY, (CORE_R - 7) * sc); } catch (e) {} ctx.restore(); }
    else if (a.el && a.n) { try { WX5.emblem(a.el, CX, CY, 22, .32 + .1 * Math.sin(now / 400)); } catch (e) {} } }
  function drawSynth(now) { const a = CR.analyze(UI.slots);
    drawMats('材料', null, null);
    drawDisc(now, a);
    const res = UI.res;
    if (res) { T('出　炉', CX, CY - DISC / 2 - 14, 16, C.sub, KAI(), 600, 'center'); ctx.font = `400 25px ${BR()}`; T(fitW(ITEM_DB[res.id].name + (res.bonus && !/\+\d$/.test(ITEM_DB[res.id].name) ? '　+' + res.bonus : ''), 400), CX, CY + DISC / 2 + 22, 25, C.gold2, BR(), 400, 'center'); }
    const [ht, hc] = saying(now) ? [SMITH + '：' + UI.say, C.gold2] : hintOf(a); ctx.font = `500 16px ${KAI()}`; T(fitW(ht, 430), CX, res ? 609 : 598, 16, hc, KAI(), 500, 'center');
    btn(B_CLEAR, '清　空', a.n ? 'n' : 'd', 17);
    const ng = S.hero.gold || 0;
    if (a.n < 5) btn(B_GO, '放满五样', 'd', 18); else if (!a.ok) btn(B_GO, '这一炉开不了', 'd', 18); else if (a.kind === 'recipe' && owned(a.recipe.id)) btn(B_GO, '已经有一件了', 'd', 18); else if (ng < a.fee) btn(B_GO, '灵石不够（要 ' + a.fee + '）', 'd', 17);
    else btn(B_GO, armed('go') ? (a.kind === 'mix' && a.rare ? '里面有珍稀料 · 再点才开炉' : '再点一次 · 开炉') : '合　成　· 灵石 ' + a.fee, armed('go') ? 'p' : 'n', armed('go') && a.kind === 'mix' && a.rare ? 15 : 18);
    // 秘籍
    D('panel_well_9', RB.x, RB.y, RB.w, RB.h); const bk = art('book'); if (bk) ctx.drawImage(bk, RB.x + 8, RB.y + 2, 46, 46); T('合成秘籍', RB.x + (bk ? 58 : 16), RB.y + 24, 20, C.gold2, BR(), 400); T('只记各人的专属套装', RB.x + RB.w - 14, RB.y + 26, 14, C.sub, KAI(), 500, 'right');
    T('点一条，料齐的会自己摆上去。', RB.x + 16, RB.y + 56, 14, C.sub);
    const rs = CR.RECIPES.filter(CR.recipeShown).slice(0, 4);
    rs.forEach((rc, i) => { const r = rcR(i), it = ITEM_DB[rc.id], need = {}; rc.mats.forEach(m => need[m] = (need[m] || 0) + 1); const own = owned(rc.id), okAll = !own && Object.keys(need).every(m => have(m) >= need[m]);
      D(okAll ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(rc.id, r.x + 40, r.y + 40, 28); } catch (e) {}
      ctx.font = `400 21px ${BR()}`; T(fitW(it.name, 130), r.x + 78, r.y + 24, 21, C.gold2, BR(), 400); T(CR.whoName(rc.who) + ' · 专属', r.x + r.w - 14, r.y + 24, 14, '#f0c86a', KAI(), 600, 'right');
      // 要的料：一样一个小图标，要两个以上的在右下角标数；身上不够的发暗、数字发红
      let x = r.x + 96; Object.keys(need).forEach(m => { const lack = have(m) < need[m]; ctx.save(); if (lack) ctx.globalAlpha *= .42; try { itemIcon(m, x, r.y + 64, 17); } catch (e) {} ctx.restore();
        if (need[m] > 1 || lack) { ctx.font = `700 13px ${NUM()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(lack ? have(m) + '/' + need[m] : '×' + need[m], x + 13, r.y + 78, lack ? C.red : C.gold2, 'rgba(6,14,19,.92)', 4); } x += 46; });
      T(own ? '已有' : okAll ? '料齐' : '', r.x + 40, r.y + 84, 13, own ? C.gold : C.green, KAI(), 600, 'center'); });
    if (!rs.length) T('秘籍上还是空的。', RB.x + 16, RB.y + 110, 16, C.sub);
    ctx.font = `500 14px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap('别的东西没有方子。五样料放进去，开了炉才知道出什么。', RB.x + 16, RB.y + RB.h - 44, RB.w - 32, 20, 2); }
  function tapSynth(tp) { const m = tapMats(tp, null);
    if (m && m.id) { const i = UI.slots.indexOf(null); if (i < 0) { speak('五个角都放满了。点阵盘上的料可以拿下来。'); snd('ui_cancel'); return; } if (have(m.id) - used(m.id) <= 0) { snd('ui_cancel'); return; } UI.slots[i] = m.id; UI.res = null; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    if (m) return;
    for (let i = 0; i < 5; i++) { const [x, y] = slotXY(i); if (Math.hypot(tp.x - x, tp.y - y) <= 65 * DK + 6) { if (UI.slots[i]) { UI.slots[i] = null; UI.arm = null; snd('ui_click'); } return; } }
    if (inR(tp, B_CLEAR)) { if (UI.slots.some(Boolean)) { UI.slots.fill(null); UI.arm = null; snd('ui_click'); } return; }
    const rs = CR.RECIPES.filter(CR.recipeShown).slice(0, 4); for (let i = 0; i < rs.length; i++) if (inR(tp, rcR(i))) { const rc = rs[i], need = {}; rc.mats.forEach(q => need[q] = (need[q] || 0) + 1); const lack = Object.keys(need).filter(q => have(q) < need[q]);
        if (owned(rc.id)) { speak('「' + ITEM_DB[rc.id].name.replace(/ \+\d$/, '') + '」已经有一件了，不用再打。'); snd('ui_cancel'); return; }
        if (lack.length) { speak('「' + ITEM_DB[rc.id].name + '」还差：' + lack.map(q => ITEM_DB[q].name + ' ' + (need[q] - have(q))).join('、') + '。'); snd('ui_cancel'); return; }
        UI.slots = rc.mats.slice(); UI.res = null; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    if (!inR(tp, B_GO)) return; const a = CR.analyze(UI.slots);
    if (a.n < 5) { speak('五个角放满了才开得了炉。'); snd('ui_cancel'); return; } if (!a.ok) { speak('光有精气不成器。至少放一样牙、角、皮、丝之类的料。'); snd('ui_cancel'); return; }
    if (a.kind === 'recipe' && owned(a.recipe.id)) { speak('这一件已经有了，不用再打。珍稀的料留着打别的。'); snd('ui_cancel'); return; } if ((S.hero.gold || 0) < a.fee) { speak('炭火钱不够。'); snd('ui_cancel'); return; }
    if (!armed('go')) { UI.arm = { k: 'go', t: performance.now() }; snd('ui_click'); return; }
    UI.arm = null; const r = CR.craft(UI.slots); if (r.err) { speak(r.err === 'gold' ? '炭火钱不够。' : '料不够了。'); snd('ui_cancel'); return; }
    const it = ITEM_DB[r.id], el = (it.gem || WX5.GEAR[r.id] || a.el || 'jin'); UI.slots.fill(null); UI.res = { id: r.id, bonus: r.bonus, t: performance.now() };
    burst(CX, CY, el, 1.15); try { S.flash = .22; S.flashColor = '#ffe9b8'; } catch (e) {} snd('sfx_sword_ring', .6); try { playSnd('jingle_levelup', .45); } catch (e) {}
    speak(it.gem ? '五枚精炼成一颗「' + it.name + '」。到镶嵌那一页，镶到装备上去。' : a.kind === 'recipe' ? '成了。「' + it.name + '」——这一件只认它的主人。'
      : r.bonus ? '五行相生，这一炉出了彩。「' + it.name + '」，出炉就是 +' + r.bonus + '。' : a.kind === 'mix' && r.id === a.upId ? '火候好，出了上品——「' + it.name + '」。' : a.kind === 'mix' && r.id === a.dudId ? (a.s < 0 ? '相克的料搁一炉，走了火。只成了件「' : '火候差了点，只成了件「') + it.name + '」。' : '成了。「' + it.name + '」。');
    return 'forged'; }

  // =====================================================================================================
  // 装备栏（强化、镶嵌两页共用）：身上穿的（主角、队友）在前，行囊里的在后；同一种只列一次
  // =====================================================================================================
  const GL = { x: 52, y: 124, w: 452, h: 548 }, GCOLS = 5, GROWS = 4, GCW = 86, GCH = 104, gcR = i => ({ x: GL.x + 12 + (i % GCOLS) * GCW, y: GL.y + 48 + Math.floor(i / GCOLS) * GCH, w: GCW - 4, h: GCH - 4 });
  const GPG = { prev: { x: GL.x + 12, y: GL.y + GL.h - 46, w: 110, h: 36 }, next: { x: GL.x + GL.w - 122, y: GL.y + GL.h - 46, w: 110, h: 36 } };
  function gearList() { const out = [], seen = new Set(), put = (id, who) => { if (!id || !ITEM_DB[id] || !ITEM_DB[id].slot) return; if (seen.has(id)) { const o = out.find(q => q.id === id); if (who && !o.who) o.who = who; return; } seen.add(id); out.push({ id, who }); };
    try { for (const w of ['hero', ...(S.party || [])]) { const e = G.eqOf(w); for (const sl of G.SLOTS) put(e[sl], w); } for (const id of Object.keys(S.hero.bag)) if (have(id) > 0) put(id, null); } catch (e) {} return out; }
  function drawGears(title, badge) { D('panel_well_9', GL.x, GL.y, GL.w, GL.h); T(title, GL.x + 16, GL.y + 24, 20, C.gold2, BR(), 400);
    const list = gearList(), per = GCOLS * GROWS, np = Math.max(1, Math.ceil(list.length / per)); UI.gp = Math.min(UI.gp, np - 1);
    if (!list.length) T('身上、行囊里都没有装备。', GL.x + 20, GL.y + 90, 16, C.sub);
    list.slice(UI.gp * per, UI.gp * per + per).forEach((g, i) => { const r = gcR(i), on = UI.gsel === g.id; D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(g.id, r.x + r.w / 2, r.y + 38, 27); } catch (e) {}
      if (g.who) { ctx.font = `700 14px ${KAI()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(g.who === 'hero' ? '叶' : CR.whoName(g.who).slice(0, 1), r.x + 15, r.y + 16, C.green, 'rgba(6,14,19,.92)', 4); }
      const bd = badge(g.id); if (bd) T(bd, r.x + r.w - 8, r.y + 14, 14, C.gold2, NUM(), 700, 'right');
      ctx.font = `500 13px ${KAI()}`; T(fitW(ITEM_DB[g.id].name.replace(/ \+\d$/, ''), r.w - 6), r.x + r.w / 2, r.y + r.h - 14, 13, C.text, KAI(), 500, 'center'); });
    if (np > 1) { btn(GPG.prev, '上一页', UI.gp > 0 ? 'n' : 'd', 15); btn(GPG.next, '下一页', UI.gp < np - 1 ? 'n' : 'd', 15); T((UI.gp + 1) + ' / ' + np, GL.x + GL.w / 2, GPG.prev.y + 18, 15, C.sub, NUM(), 600, 'center'); } }
  function tapGears(tp) { const list = gearList(), per = GCOLS * GROWS, np = Math.max(1, Math.ceil(list.length / per));
    if (np > 1 && inR(tp, GPG.prev)) { if (UI.gp > 0) { UI.gp--; snd('ui_click'); } return true; } if (np > 1 && inR(tp, GPG.next)) { if (UI.gp < np - 1) { UI.gp++; snd('ui_click'); } return true; }
    const page = list.slice(UI.gp * per, UI.gp * per + per); for (let i = 0; i < page.length; i++) if (inR(tp, gcR(i))) { if (UI.gsel !== page[i].id) { UI.gsel = page[i].id; UI.arm = null; UI.say = ''; UI.sock = 0; snd('ui_click'); } return true; } return false; }
  const GD = { x: 516, y: 124, w: 712, h: 548 };
  function gearHead(id) { const it = ITEM_DB[id], g = WX5.GEAR[id]; try { itemIcon(id, GD.x + 66, GD.y + 70, 44); } catch (e) {} T(it.name, GD.x + 130, GD.y + 46, 28, C.gold2, BR(), 400);
    T((g ? WX[g].n + '性 · ' : '') + (SLOT_CN[it.slot] || '') + '　' + statText(id), GD.x + 130, GD.y + 84, 16, C.text); }

  // =====================================================================================================
  // 二、强化（规矩照旧：equip_plus 那一套）
  // =====================================================================================================
  const MAXLV = 5, RATE = [1, 1, 1, .7, .5], B_REF = { x: GD.x + GD.w - 250, y: GD.y + GD.h - 76, w: 226, h: 54 };
  const refCost = (id, l) => ({ gold: Math.round((40 + (ITEM_DB[id].price || 120) * .35) * (l + 1)), n: l + 1, cls: /^(weapon|acc)$/.test(ITEM_DB[id].slot) ? 'W' : 'A' });
  // 下一级是多少：把等级临时拨高一格读一遍再拨回来（数是 equip_plus 那套读数算的，这里不另算一套）
  function peekNext(id, l) { const R = (S.hero.refine = S.hero.refine || {}), old = R[id], out = {}; R[id] = l + 1; try { for (const k of KEYS) out[k] = ITEM_DB[id][k] || 0; } finally { if (old) R[id] = old; else delete R[id]; } return out; }
  // 用哪几样料：先用寻常的，珍稀的（三品）和百搭的不动
  const inRecipe = id => CR.RECIPES.some(r => r.mats.includes(id));
  function refPick(cls, n) { const pool = Object.keys(MAT).filter(id => MAT[id].c === cls && MAT[id].g <= 2 && have(id) > 0).sort((a, b) => MAT[a].g - MAT[b].g || (inRecipe(a) ? 1 : 0) - (inRecipe(b) ? 1 : 0) || have(b) - have(a) || (a < b ? -1 : 1)), out = []; let left = n;
    for (const id of pool) { if (left <= 0) break; const t = Math.min(left, have(id)); out.push([id, t]); left -= t; } return { list: out, left }; }
  function drawRefine(now) { drawGears('强化哪一件', id => { const l = CR.refineOf(id); return l ? '+' + l : ''; }); D('panel_well_9', GD.x, GD.y, GD.w, GD.h);
    const id = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null;
    if (!id) { ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap('点左边的一件装备。每强化一级，这件装备的各项属性加一成半，最高 +5。兵器、饰品用牙角骨晶，衣甲、鞋履用皮丝壳鳞。前三级必成；+4 七成、+5 五成，不成只损材料，装备不坏。', GD.x + 26, GD.y + 44, GD.w - 52, 28, 5); return; }
    gearHead(id); const l = CR.refineOf(id), it = ITEM_DB[id];
    if (l >= MAXLV) { T('已经到 +' + MAXLV + '，再敲就碎了。', GD.x + 30, GD.y + 170, 19, C.gold2, KAI(), 600); if (saying(now)) T(SMITH + '：' + UI.say, GD.x + 30, GD.y + GD.h - 48, 16, C.gold2); return; }
    const c = refCost(id, l), pk = refPick(c.cls, c.n), ng = S.hero.gold || 0;
    T('+' + l + '　→　+' + (l + 1), GD.x + 30, GD.y + 150, 26, C.gold2, NUM(), 700);
    const nx = peekNext(id, l); let y = GD.y + 196; for (const k of KEYS) { const v = it[k]; if (!v || v <= 0) continue; T(STAT_NAME[k], GD.x + 30, y, 17, C.sub); T(String(v), GD.x + 100, y, 19, C.text, NUM(), 700); T('→', GD.x + 150, y, 17, C.sub); T(String(nx[k]), GD.x + 186, y, 19, C.green, NUM(), 700); y += 32; }
    T('要用的料（' + CR.CLASS_NAME[c.cls] + ' ×' + c.n + '）', GD.x + 330, GD.y + 150, 17, C.sub); let x = GD.x + 356;
    if (!pk.list.length) T('身上一样都没有', GD.x + 330, GD.y + 196, 17, C.red); pk.list.forEach(([m, n]) => { try { itemIcon(m, x, GD.y + 204, 24); } catch (e) {} T('×' + n, x + 28, GD.y + 216, 15, C.text, NUM(), 700); T(fitW(ITEM_DB[m].name, 80), x, GD.y + 244, 13, C.sub, KAI(), 500, 'center'); x += 92; });
    if (pk.left > 0 && pk.list.length) T('还差 ' + pk.left, x, GD.y + 204, 16, C.red, KAI(), 600);
    T('灵石 ' + ng + ' / ' + c.gold, GD.x + 330, GD.y + 296, 17, ng >= c.gold ? C.green : C.red, NUM(), 600); T('成功率 ' + Math.round(RATE[l] * 100) + '%' + (RATE[l] < 1 ? '（不成只损材料）' : ''), GD.x + 330, GD.y + 328, 17, RATE[l] < 1 ? '#d9b46a' : C.text);
    if (saying(now)) T(SMITH + '：' + UI.say, GD.x + 30, GD.y + GD.h - 48, 16, C.gold2);
    if (pk.left > 0) btn(B_REF, '料不够', 'd', 18); else if (ng < c.gold) btn(B_REF, '灵石不够', 'd', 18); else btn(B_REF, armed('ref') ? '再点一次 · 下锤' : '强　化', armed('ref') ? 'p' : 'n'); }
  function tapRefine(tp) { if (tapGears(tp)) return; const id = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null; if (!id || !inR(tp, B_REF)) return; const l = CR.refineOf(id); if (l >= MAXLV) return;
    const c = refCost(id, l), pk = refPick(c.cls, c.n); if (pk.left > 0) { speak('料不够。' + (c.cls === 'W' ? '牙、角、骨、晶' : '皮、丝、壳、鳞') + '之类的，再攒 ' + pk.left + ' 样来。'); snd('ui_cancel'); return; } if ((S.hero.gold || 0) < c.gold) { speak('炭火钱不够。'); snd('ui_cancel'); return; }
    if (!armed('ref')) { UI.arm = { k: 'ref', t: performance.now() }; snd('ui_click'); return; }
    UI.arm = null; for (const [m, n] of pk.list) CR.take(m, n); S.hero.gold -= c.gold; snd('sfx_sword_ring', .7); const bx = GD.x + 66, by = GD.y + 70;
    if (Math.random() < RATE[l]) { CR.setRefine(id, l + 1); burst(bx, by, WX5.GEAR[id] || 'jin', .9); try { S.flash = .2; S.flashColor = '#ffe9b8'; playSnd('jingle_levelup', .45); } catch (e) {} speak('成了，+' + (l + 1) + '。' + (l + 1 >= MAXLV ? '到头了，再敲就碎了。' : '')); }
    else { try { S.flash = .18; S.flashColor = '#7a2a1a'; S.shake = 6; playSnd('sfx_hurt', .5); } catch (e) {} speak('火候差了一点。料和炭钱没了，东西没坏，还是 +' + l + '。'); } }

  // =====================================================================================================
  // 三、镶嵌（五行灵珠；按「这一种装备」记，和强化一样）
  // =====================================================================================================
  const GEMS = () => (S.hero.gems = S.hero.gems || {});
  const sockN = id => { const it = ITEM_DB[id]; if (!it || !it.slot || WX5.isXH(id)) return 0; const st = G.setOfItem(id); return (st && st.tier >= 2) || (it.lvReq || 0) >= 10 ? 2 : 1; };
  const gemsOf = id => { const a = GEMS()[id] || []; return [a[0] || null, a[1] || null].slice(0, sockN(id)); };
  const gemVal = (el, id) => { const [, k, v] = CR.GEM[el]; return [k, WX5.GEAR[id] === el ? Math.round(v * 1.5) : v]; };
  const gemBonus = (id, k) => { let t = 0; for (const el of gemsOf(id)) if (el) { const [kk, v] = gemVal(el, id); if (kk === k) t += v; } return t; };
  // 让装备的属性读数把灵珠算进去（套在强化那层读数的外面）
  function gemWrap(id) { const it = ITEM_DB[id]; if (!it || !it.slot || it._gemW) return; try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {} it._gemW = 1;
    for (const k of KEYS) { const d = Object.getOwnPropertyDescriptor(it, k); let getB, setB; if (d && d.get) { getB = () => d.get.call(it); setB = v => { if (d.set) d.set.call(it, v); }; } else { let v = d ? d.value : undefined; getB = () => v; setB = x => { v = x; }; }
      Object.defineProperty(it, k, { configurable: true, enumerable: !!d, get() { const b = getB(), g = gemBonus(id, k); return g ? (b || 0) + g : b; }, set(v) { setB(v); } }); } }
  // 等强化那层读数先套好（它在开局三秒时补套一遍），再套灵珠这一层；读档进来的也是这里补上
  const plusReady = it => { const d = Object.getOwnPropertyDescriptor(it, 'name'); return !!(d && d.get) || performance.now() > 5000; };
  setInterval(() => { try { if (!S.hero || !S.hero.gems) return; for (const id of Object.keys(S.hero.gems)) { const it = ITEM_DB[id]; if (it && !it._gemW && plusReady(it)) gemWrap(id); } } catch (e) {} }, 500);
  function setGem(id, i, el) { const it = ITEM_DB[id], h = S.hero; gemWrap(id); const before = {}; for (const k of KEYS) before[k] = it[k] || 0; const a = GEMS()[id] = gemsOf(id).concat([null, null]).slice(0, 2); a[i] = el;
    const on = h.equip && h.equip[it.slot] === id; if (on) { for (const k of KEYS) { const d = (it[k] || 0) - before[k]; if (d) h[k] += d; } h.hp = Math.min(h.hp, h.maxhp); h.mp = Math.min(h.mp, h.maxmp); } }
  const skR = i => ({ x: GD.x + 40 + i * 150, y: GD.y + 150, w: 130, h: 130 }), gmR = i => ({ x: GD.x + 30 + i * 132, y: GD.y + 340, w: 122, h: 118 });
  function drawInlay(now) { drawGears('镶哪一件', id => { const n = gemsOf(id).filter(Boolean).length; return n ? '珠' + n : ''; }); D('panel_well_9', GD.x, GD.y, GD.w, GD.h);
    const id = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null;
    if (!id) { ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap('点左边的一件装备，再点一颗灵珠镶上去。灵珠是五枚同一行的精在「合成」那一页炼出来的。珠子和装备同一行，效果多五成。换珠子时，原来那颗会碎。', GD.x + 26, GD.y + 44, GD.w - 52, 28, 5); }
    else { gearHead(id); const n = sockN(id), gs = gemsOf(id);
      if (!n) { T('星痕剑不镶珠——它点星纹（看「星纹」那一页）。', GD.x + 30, GD.y + 190, 18, C.gold2, KAI(), 600); }
      else { UI.sock = Math.min(UI.sock, n - 1); T('孔位（点一下选中）', GD.x + 30, GD.y + 132, 15, C.sub);
        for (let i = 0; i < n; i++) { const r = skR(i), on = UI.sock === i, el = gs[i]; D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); const se = art('socket_empty');
          if (el) { try { itemIcon('g_' + el, r.x + r.w / 2, r.y + 50, 32); } catch (e) {} const [k, v] = gemVal(el, id); T(STAT_NAME[k] + ' +' + v, r.x + r.w / 2, r.y + 106, 15, C.green, KAI(), 600, 'center'); }
          else { if (se) ctx.drawImage(se, r.x + r.w / 2 - 36, r.y + 14, 72, 72); else { ctx.save(); ctx.strokeStyle = 'rgba(194,173,120,.45)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + 50, 28, 0, 7); ctx.stroke(); ctx.restore(); } T('空', r.x + r.w / 2, r.y + 106, 15, C.sub, KAI(), 600, 'center'); } } } }
    T('身上的灵珠', GD.x + 30, GD.y + 318, 15, C.sub);
    ORDER.forEach((el, i) => { const r = gmR(i), gid = 'g_' + el, n = have(gid), k = 'gem_' + el; ctx.save(); if (!n) ctx.globalAlpha *= .4; D(armed(k) ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(gid, r.x + r.w / 2, r.y + 40, 27); } catch (e) {}
      T(ITEM_DB[gid].name, r.x + r.w / 2, r.y + 80, 15, C.gold2, KAI(), 600, 'center'); const same = !!(id && sockN(id) && WX5.GEAR[id] === el), [kk, v] = id && sockN(id) ? gemVal(el, id) : [CR.GEM[el][1], CR.GEM[el][2]];
      T(STAT_NAME[kk] + ' +' + v + '　×' + n, r.x + r.w / 2, r.y + 102, 13, same ? C.green : C.text, KAI(), 500, 'center'); ctx.restore(); if (same && n) T('同性', r.x + r.w - 20, r.y + 16, 12, C.green, KAI(), 600, 'center'); });
    T(saying(now) ? SMITH + '：' + UI.say : (UI.arm && /^gem_/.test(UI.arm.k) && armed(UI.arm.k) ? '再点一次这颗珠子，就镶上去。' : ''), GD.x + 30, GD.y + GD.h - 48, 16, C.gold2); }
  function tapInlay(tp) { if (tapGears(tp)) return; const id = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null; if (!id) return; const n = sockN(id); if (!n) return;
    for (let i = 0; i < n; i++) if (inR(tp, skR(i))) { UI.sock = i; UI.arm = null; snd('ui_click'); return; }
    for (let i = 0; i < ORDER.length; i++) if (inR(tp, gmR(i))) { const el = ORDER[i], gid = 'g_' + el, k = 'gem_' + el; if (!have(gid)) { speak('这种珠子身上没有。五枚' + WX[el].n + '精，到合成那一页炼一颗。'); snd('ui_cancel'); return; }
        const cur = gemsOf(id)[UI.sock]; if (cur === el) { speak('这个孔里已经是' + ITEM_DB[gid].name + '了。'); return; }
        if (!armed(k)) { UI.arm = { k, t: performance.now() }; snd('ui_click'); if (cur) speak('这个孔里原来那颗' + ITEM_DB['g_' + cur].name + '会碎。再点一次才换。'); return; }
        UI.arm = null; CR.take(gid, 1); setGem(id, UI.sock, el); const r = skR(UI.sock); burst(r.x + r.w / 2, r.y + 50, el, .8); snd('ui_confirm'); try { playSnd('jingle_levelup', .4); } catch (e) {}
        const [kk, v] = gemVal(el, id); speak('镶上了。' + STAT_NAME[kk] + ' +' + v + (WX5.GEAR[id] === el ? '——珠子和它同是' + WX[el].n + '性，多出五成。' : '。')); return; } }

  // =====================================================================================================
  // 四、精炼：把用不上的材料炼成那一行的精（寻常的三炼一，上等的两炼一；珍稀料不在这儿炼）
  // =====================================================================================================
  const canMelt = id => !!MAT[id].c && MAT[id].g <= 2 && !!MAT[id].wx, meltN = id => MAT[id].g >= 2 ? 2 : 3;
  const MD = { x: 436, y: 124, w: 792, h: 548 };
  const B_M1 = { x: MD.x + MD.w / 2 - 180, y: MD.y + 300, w: 170, h: 54 }, B_MA = { x: MD.x + MD.w / 2 + 10, y: MD.y + 300, w: 170, h: 54 };
  function drawMelt(now) { drawMats('炼哪一样', canMelt, UI.msel); D('panel_well_9', MD.x, MD.y, MD.w, MD.h);
    const id = UI.msel && MAT[UI.msel] && have(UI.msel) > 0 ? UI.msel : null;
    if (!id) { ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap('点左边的一样材料，把它炼成那一行的五行之精。寻常的料三样炼一枚，上等的两样炼一枚。头目、妖王身上的珍稀料不在这儿炼——留着照秘籍打专属套装。', MD.x + 26, MD.y + 44, MD.w - 52, 28, 5); if (saying(now)) T(SMITH + '：' + UI.say, MD.x + 26, MD.y + MD.h - 48, 16, C.gold2); return; }
    const m = MAT[id], k = meltN(id), n = have(id), out = 'm_wx_' + m.wx, cx = MD.x + MD.w / 2;
    try { itemIcon(id, cx - 150, MD.y + 150, 46); itemIcon(out, cx + 150, MD.y + 150, 46); } catch (e) {}
    T(ITEM_DB[id].name + ' ×' + k, cx - 150, MD.y + 216, 19, C.gold2, KAI(), 600, 'center'); T(ITEM_DB[out].name + ' ×1', cx + 150, MD.y + 216, 19, C.gold2, KAI(), 600, 'center'); T('→', cx, MD.y + 150, 40, C.gold, KAI(), 500, 'center');
    T('身上有 ' + n + ' 样，能炼 ' + Math.floor(n / k) + ' 枚', cx, MD.y + 256, 16, n >= k ? C.text : C.red, KAI(), 500, 'center');
    btn(B_M1, '炼一枚', n >= k ? 'n' : 'd'); btn(B_MA, armed('melt') ? '再点 · 全炼' : '全部炼掉', n >= k ? (armed('melt') ? 'p' : 'n') : 'd');
    if (saying(now)) T(SMITH + '：' + UI.say, MD.x + 26, MD.y + MD.h - 48, 16, C.gold2); }
  function tapMelt(tp) { const r = tapMats(tp, canMelt); if (r && r.id) { UI.msel = r.id; UI.arm = null; UI.say = ''; snd('ui_click'); return; } if (r) return;
    const id = UI.msel && MAT[UI.msel] && have(UI.msel) > 0 ? UI.msel : null; if (!id) return; const b1 = B_M1, ba = B_MA;
    const m = MAT[id], k = meltN(id), n = have(id), out = 'm_wx_' + m.wx; let times = 0;
    if (inR(tp, b1)) times = n >= k ? 1 : 0; else if (inR(tp, ba)) { if (n < k) return; if (!armed('melt')) { UI.arm = { k: 'melt', t: performance.now() }; snd('ui_click'); return; } times = Math.floor(n / k); } else return;
    if (!times) { speak('不够一炉。要 ' + k + ' 样才炼得出一枚。'); snd('ui_cancel'); return; }
    UI.arm = null; CR.take(id, k * times); addItem(out, times); burst(MD.x + MD.w / 2 + 150, MD.y + 150, m.wx, .8); snd('ui_confirm'); speak('炼出 ' + times + ' 枚' + ITEM_DB[out].name + '。'); }

  // =====================================================================================================
  // 五、星纹（上午做的，原样）
  // =====================================================================================================
  const runeR = i => ({ x: BODY.x + 10 + i * 238, y: BODY.y + 60, w: 230, h: 250 }), DET = { x: BODY.x + 10, y: BODY.y + 346, w: BODY.w - 20, h: 212 };
  function drawRune(now) { const o = WX5.XH(), hasXH = (() => { try { const h = S.hero; return WX5.isXH(h.equip && h.equip.weapon) || !!(h.bag && (h.bag.w_xinghen || h.bag.w_xinghen2)); } catch (e) { return false; } })();
    T('星痕剑是天底下唯一能换五行的剑。点亮哪一道星纹，打架时就多一样能换的属性。', BODY.x + 14, BODY.y + 28, 17, C.sub);
    ORDER.forEach((el, i) => { const r = runeR(i), own = !!o.own[el], k = 'rune_' + el, nq = J.count(el), ng = S.hero.gold || 0; D(own ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h);
      try { WX5.emblem(el, r.x + r.w / 2, r.y + 62, 40, own ? 1 : .55); } catch (e) {} T(WX[el].n + '纹', r.x + r.w / 2, r.y + 130, 28, own ? C.gold2 : C.text, BR(), 400, 'center'); T('克' + WX[WX5.KE[el]].n, r.x + r.w / 2, r.y + 160, 16, C.sub, KAI(), 500, 'center');
      const br = { x: r.x + 22, y: r.y + 186, w: r.w - 44, h: 48 };
      if (own) T('已点亮', r.x + r.w / 2, br.y + 24, 20, C.green, BR(), 400, 'center'); else if (!hasXH) btn(br, '还没有星痕剑', 'd', 16); else if (nq < RUNE[0]) btn(br, WX[el].n + '精 ' + nq + ' / ' + RUNE[0], 'd', 16); else if (ng < RUNE[1]) btn(br, '灵石 ' + RUNE[1], 'd', 16); else btn(br, armed(k) ? '再点一次 · 点亮' : '点亮 · ' + RUNE[0] + ' 精 ' + RUNE[1] + ' 石', armed(k) ? 'p' : 'n', 16); });
    D('panel_well_9', DET.x, DET.y, DET.w, DET.h); T(saying(now) ? SMITH + '：' + UI.say : '一道星纹：' + RUNE[0] + ' 枚那一行的精，' + RUNE[1] + ' 灵石。星辰宝库里拿星辰点也能换，妖王身上也能得。', DET.x + 24, DET.y + 40, 17, saying(now) ? C.gold2 : C.sub); }
  function tapRune(tp) { const o = WX5.XH(); for (let i = 0; i < ORDER.length; i++) { const el = ORDER[i], r = runeR(i), br = { x: r.x + 22, y: r.y + 186, w: r.w - 44, h: 48 }, k = 'rune_' + el; if (!inR(tp, br)) continue;
      if (o.own[el]) { speak('这一道早亮了。'); return; } let has = false; try { const h = S.hero; has = WX5.isXH(h.equip && h.equip.weapon) || !!(h.bag && (h.bag.w_xinghen || h.bag.w_xinghen2)); } catch (e) {}
      if (!has) { speak('星痕剑？没见着。等你拿到了再来。'); snd('ui_cancel'); return; } if (J.count(el) < RUNE[0]) { speak(WX[el].n + '精不够，要 ' + RUNE[0] + ' 枚。'); snd('ui_cancel'); return; } if ((S.hero.gold || 0) < RUNE[1]) { speak('炭火钱不够。'); snd('ui_cancel'); return; }
      if (!armed(k)) { UI.arm = { k, t: performance.now() }; snd('ui_click'); return; }
      UI.arm = null; CR.take(J.ID(el), RUNE[0]); S.hero.gold -= RUNE[1]; o.own[el] = 1; o.cur = el; const rr = runeR(i); burst(rr.x + rr.w / 2, rr.y + 62, el, .9); snd('ui_confirm'); try { playSnd('jingle_levelup', .6); } catch (e) {}
      speak(WX[el].n + '纹亮了。这剑认主，我只是替它添了把火。'); return; } }

  // =====================================================================================================
  // 总的：画、点、开关
  // =====================================================================================================
  const DRAW = [drawSynth, drawRefine, drawInlay, drawMelt, drawRune], TAP = [tapSynth, tapRefine, tapInlay, tapMelt, tapRune];
  function draw() { if (!UI.open) return; kitLoad(); const now = performance.now(), a = Math.min(1, (now - UI.t0) / 180);
    ctx.save(); ctx.fillStyle = `rgba(5,13,19,${.9 * a})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
    if (!kitReady()) { T('炉火正旺……', W / 2, H / 2, 22, C.gold2, KAI(), 500, 'center'); ctx.restore(); return; }
    D('curtain_9', 0, 0, W, H); ctx.font = `400 62px ${BR()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; textOutline('剑炉', 28, 60, C.gold2, 'rgba(6,16,24,.85)', 6);
    TABS.forEach((t, i) => { const r = tabR(i), on = UI.tab === i, ic = art('tab_' + TABK[i]); D(on ? 'category_s' : 'category_n', r.x, r.y, r.w, r.h); if (ic) { ctx.save(); if (!on) ctx.globalAlpha *= .62; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(ic, r.x + 16, r.y + 5, 34, 34); ctx.restore(); }
      T(t, r.x + r.w / 2 + (ic ? 18 : 0), r.y + r.h / 2 + 1, 19, on ? C.gold2 : C.text, KAI(), 600, 'center'); });
    T('灵石 ' + (S.hero.gold || 0), CLOSE.x - 24, CLOSE.y + CLOSE.h / 2 + 1, 18, C.gold, NUM(), 600, 'right');
    D('close_n', CLOSE.x, CLOSE.y, CLOSE.w, CLOSE.h); T('关　闭', CLOSE.x + CLOSE.w / 2, CLOSE.y + CLOSE.h / 2 + 1, 19, C.gold2, KAI(), 600, 'center');
    D('panel_main_9', P.x, P.y, P.w, P.h); D('panel_detail_9', BODY.x - 6, BODY.y - 2, BODY.w + 12, BODY.h + 4);
    DRAW[UI.tab](now); drawFx(now); ctx.restore(); }
  try { S.overlay.push({ draw() { try { draw(); } catch (e) { console.warn('R394', e); try { ctx.restore(); } catch (e2) {} } } }); } catch (e) {}

  async function open(tab) { if (UI.open || (typeof battle !== 'undefined' && battle)) return; kitLoad(); artAll(); try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {} try { if (window.IMG_GUARD && IMG_GUARD.bumpMatch) IMG_GUARD.bumpMatch(['fx/fx3_burst_']); } catch (e) {} const lock0 = world.locked, hud0 = S.hud; S.hud = false; world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    UI.open = true; UI.t0 = performance.now(); UI.taps.length = 0; UI.arm = null; UI.say = ''; UI.res = null; UI.fx.length = 0; UI.slots.fill(null); UI.mp = 0; UI.gp = 0; if (typeof tab === 'number') UI.tab = tab; snd('ui_open'); let forged = 0;
    try { for (;;) { await nextFrame(); const tp = UI.taps.shift(); if (!tp) continue; if (!kitReady()) continue; if (inR(tp, CLOSE)) break;
        let hit = false; for (let i = 0; i < TABS.length; i++) if (inR(tp, tabR(i))) { hit = true; if (UI.tab !== i) { UI.tab = i; UI.arm = null; UI.say = ''; UI.mf = 0; UI.mp = 0; UI.gp = 0; snd('ui_click'); } } if (hit) continue;
        if (TAP[UI.tab](tp) === 'forged') forged++; } }
    finally { UI.open = false; world.locked = lock0; S.hud = hud0; try { input.tapped = null; } catch (e) {} snd('ui_click'); }
    if (forged && !F().forge_tip && window.SAY_LATER) { F().forge_tip = 1; SAY_LATER(async () => { await say('星旋', '新打的东西在行囊里。点左上角的头像，看看穿在谁身上合适——各人灵根不同，合的十成，不合的八折。'); }); } }
  try { cv.addEventListener('pointerdown', e => { if (!UI.open) return; e.stopImmediatePropagation(); e.preventDefault(); UI.taps.push(toLogical(e)); try { input.tapped = null; } catch (e2) {} }, true); } catch (e) {}

  // 和铸剑师说话：头一回交代炉子的规矩（只说大路数，不说出什么），之后直接开炉
  async function talk() { const f = F();
    if (!f.forge_met) { f.forge_met = 1; await say(SMITH, '宗主家的公子？手伸出来。……茧子是有的，剑没白练。'); await say(SMITH, '广场上人来人往，静不下心。往后我就守着这座炉子。'); }
    if (!f.forge2_met) { f.forge2_met = 1;
      await say(SMITH, '妖兽身上的牙、角、骨、晶，打兵器和佩饰；皮、丝、壳、鳞，做衣甲和鞋履。五样料凑一炉。');
      await say(SMITH, '五行相生，火候就好；相克，多半走火。出什么——开了炉才知道。只有各人的专属套装，我这本秘籍上记着方子。');
      await say('星旋', '听见没有？料越杂，越要讲究五行。乱炖一锅，出什么本神仙可不管。'); }
    await open(0); }
  window.R394 = { open, talk, isOpen: () => UI.open, UI, RUNE, ARTN, art, sockN, gemsOf, setGem };
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
  // 点他：直接开剑炉的界面（合成 / 强化 / 镶嵌 / 精炼 / 星纹），不走原来只有「强化装备」的那一层
  if (typeof doInteract === 'function') doInteract = (orig => async function (h) { if (!(h && h.type === 'npc' && h.a && h.a.npc && h.a.npc.forge)) return orig.apply(this, arguments);
    world.locked = true; try { await R394.talk(); } catch (e) { console.warn('R394 talk', e); } finally { world.locked = false; } })(doInteract);
  // 玉佩里多一桩事迹：开炉
  try { const R = window.R386; if (R && Array.isArray(R.TASKS) && !R.TASKS.some(t => t.id === 'lq1')) { const i = R.TASKS.findIndex(t => t.id === 'x4');
      R.TASKS.splice(i < 0 ? R.TASKS.length : i, 0, { id: 'lq1', cat: '修行', name: '开炉', desc: '带五样材料去云海大亭的剑炉，合成一件东西', n: () => [Math.min(1, F().forged || 0), 1], pts: 30, show: () => !!(F().forged || F().wxj_said), quip: '自己攒料、自己开炉，这才像个修士。料怎么配、五行怎么搭，多试几炉就摸出门道了。' }); } } catch (e) {}
  window.R394.place = { GX, GY, GW, GH, SY, NPC_AT };
})();
