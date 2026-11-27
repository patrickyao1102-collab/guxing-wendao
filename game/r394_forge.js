// ================= R394 · 剑炉：合成 / 强化 / 镶嵌 / 精炼 / 星纹（只进测试版）=================
// 作者 11-27 08:30：「炼器系统你单独详细的设置一个……铸剑师搬到青竹小院后面不有个云海大亭吗？旁边可以弄一个炉子。」
// 作者 11-27 中午：照《秦殇前传：复活》那样做——「打造系统里面有强化、镶嵌、合成」「动画不要特别多」「要有合成那一下的特效，
//   但不是放一个完整的合成动画，那样太拖时间」。合成的规矩（玩家看不到的那张表）在 r400_craft.js，这里只是界面：
//   · 合成：左边是身上的材料，点一下放上阵盘；五样围成一圈，放满点「合成」，盘心出东西。不告诉玩家会出什么。
//           相邻两样相生，那条边亮绿，成色高；相克亮红，成色低（14:25 作者说不要「走火」）。材料自己带的副属性有机会留进成品（14:35：要靠运气）。
//           右边是「合成秘籍」，只记各人的专属套装。
//   · 强化：原来就有的那套（最高 +5，+4 七成、+5 五成，失败只损材料），换成带图标的界面。11-27 傍晚：材料换成淬灵砂 / 淬灵晶（不再和合成抢料）；能把强化挪到同部位的另一件上。
//   · 镶嵌：五行灵珠镶到装备上（星痕剑不镶珠，它点星纹）。11-27 傍晚：灵珠能升级（两颗合一颗，一到五级），换下来的珠子退回行囊。  · 精炼：把用不上的材料炼成五行之精。  · 星纹：上午做的，没动。
// 界面用行囊「玄青星图」那套件；阵盘、页签图标、灵珠等 Codex R400 的图，到了自动换上，没到先用简单的线顶着。
(function () {
  const K = window.R386_KIT, G = window.GEAR5, J = window.WXJ, CR = window.CRAFT; if (!K || !G || !J || !CR || !window.WX5 || typeof cv === 'undefined') return;
  const { KIT, D, T, C, BR, KAI, NUM, fit: fitW, wrap, kitLoad, kitReady, inR } = K, WX = WX5.WX, ORDER = WX5.ORDER, MAT = CR.MAT;
  const F = () => (S.flags = S.flags || {});
  let SMITH = '铸剑师'; const RUNE = [6, 300];   // SMITH：这一回是谁在炉子边说话（青阳镇的王铁匠也用这一套界面）
  const STAT_NAME = { atk: '攻击', def: '防御', maxhp: '气血', maxmp: '灵力', spd: '速度' }, KEYS = ['atk', 'def', 'maxhp', 'maxmp', 'spd'], SLOT_CN = { weapon: '兵器', wrist: '护腕', armor: '衣甲', shoe: '鞋履', acc: '饰品' };
  const UI = { open: false, t0: 0, taps: [], tab: 0, arm: null, say: '', sayT: 0, slots: [null, null, null, null, null], mf: 0, mp: 0, res: null, fx: [], gsel: null, gp: 0, msel: null, sock: 0, mv: null, gsk: null, gmp: 0 };
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
  // 材料栏（合成、精炼两页共用）。合成页里同一种材料按「带的是哪一条副属性」分开摆：带得好的在前，不带的在后。
  // =====================================================================================================
  const ML = { x: 52, y: 124, w: 372, h: 548 }, MCOLS = 4, MROWS = 4, MCW = 88, MCH = 100, MFIL = ['全部', '兵饰', '防具', '百搭'];
  const mfR = i => ({ x: ML.x + 12 + i * 88, y: ML.y + 44, w: 82, h: 34 }), mcR = i => ({ x: ML.x + 10 + (i % MCOLS) * MCW, y: ML.y + 90 + Math.floor(i / MCOLS) * MCH, w: MCW - 4, h: MCH - 4 });
  const MPG = { prev: { x: ML.x + 12, y: ML.y + ML.h - 46, w: 110, h: 36 }, next: { x: ML.x + ML.w - 122, y: ML.y + ML.h - 46, w: 110, h: 36 } };
  const sameU = (u, c) => !!u && u.id === c.id && (u.ln || '') === (c.ln || '');
  const used = c => UI.tab === 0 ? UI.slots.filter(u => sameU(u, c)).length : 0;
  const LINE_COL = k => /^el_/.test(k) ? (GLOWS[k.slice(3)] || '#9FC98F') : k === 'crit' || k === 'ke' ? '#f0c86a' : '#9CC3E8';
  const GLOWS = { jin: '#dfe4ea', mu: '#8fd69a', shui: '#8cc4f2', huo: '#f59a6a', tu: '#e0b46a' };
  function matList(only, byLine) { const ord = { W: 0, A: 1, null: 2 }, out = [];
    const ids = Object.keys(MAT).filter(id => have(id) > 0 && (!only || only(id)) && (UI.mf === 0 || (UI.mf === 1 && MAT[id].c === 'W') || (UI.mf === 2 && MAT[id].c === 'A') || (UI.mf === 3 && !MAT[id].c)))
      .sort((a, b) => ord[MAT[a].c] - ord[MAT[b].c] || MAT[a].g - MAT[b].g || (a < b ? -1 : 1));
    for (const id of ids) { if (byLine) for (const s of CR.stacks(id)) out.push(s); else out.push({ id, n: have(id) }); } return out; }
  function drawMats(title, only, selId, byLine) { D('panel_well_9', ML.x, ML.y, ML.w, ML.h); T(title, ML.x + 16, ML.y + 24, 20, C.gold2, BR(), 400);
    MFIL.forEach((t, i) => { const r = mfR(i), on = UI.mf === i, mk = i === 1 ? art('mark_bing') : i === 2 ? art('mark_fang') : null; D(on ? 'category_s' : 'category_n', r.x, r.y, r.w, r.h);
      if (mk) { ctx.save(); if (!on) ctx.globalAlpha *= .7; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(mk, r.x + 5, r.y + 3, 28, 28); ctx.restore(); }
      T(t, r.x + r.w / 2 + (mk ? 13 : 0), r.y + r.h / 2 + 1, 16, on ? C.gold2 : C.text, KAI(), 600, 'center'); });
    const list = matList(only, byLine), per = MCOLS * MROWS, np = Math.max(1, Math.ceil(list.length / per)); UI.mp = Math.min(UI.mp, np - 1);
    if (!list.length) { ctx.font = `500 16px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap(UI.mf ? '这一类的材料，身上一样都没有。' : '身上还没有材料。打妖兽、开宝箱、采灵矿都能得。', ML.x + 20, ML.y + 130, ML.w - 40, 24, 3); }
    list.slice(UI.mp * per, UI.mp * per + per).forEach((c, i) => { const r = mcR(i), id = c.id, m = MAT[id], n = c.n - used(c), on = selId === id; ctx.save(); if (n <= 0) ctx.globalAlpha *= .35;
      D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(id, r.x + r.w / 2, r.y + 34, 25); } catch (e) {}
      if (m.wx) { try { WX5.emblem(m.wx, r.x + 16, r.y + 16, 13, 1); } catch (e) {} }
      if (m.c) T(m.c === 'W' ? '兵' : '防', r.x + r.w - 15, r.y + 15, 13, C.sub, KAI(), 600, 'center');
      T(String(Math.max(0, n)), r.x + r.w - 10, r.y + 52, 16, C.gold2, NUM(), 700, 'right');
      ctx.font = `500 13px ${KAI()}`; T(fitW(ITEM_DB[id].name, r.w - 8), r.x + r.w / 2, r.y + (byLine ? 69 : 78), 13, C.text, KAI(), 500, 'center');
      if (byLine && c.ln) { const k = CR.parse(c.ln)[0]; T(CR.lineText(c.ln, true), r.x + r.w / 2, r.y + 85, 12.5, LINE_COL(k), KAI(), 700, 'center'); }
      ctx.restore(); });
    if (np > 1) { btn(MPG.prev, '上一页', UI.mp > 0 ? 'n' : 'd', 15); btn(MPG.next, '下一页', UI.mp < np - 1 ? 'n' : 'd', 15); T((UI.mp + 1) + ' / ' + np, ML.x + ML.w / 2, MPG.prev.y + 18, 15, C.sub, NUM(), 600, 'center'); } }
  // 点材料栏：返回那一格 { id, ln, n } / true（点了别的控件）/ null
  function tapMats(tp, only, byLine) { for (let i = 0; i < MFIL.length; i++) if (inR(tp, mfR(i))) { if (UI.mf !== i) { UI.mf = i; UI.mp = 0; snd('ui_click'); } return true; }
    const list = matList(only, byLine), per = MCOLS * MROWS, np = Math.max(1, Math.ceil(list.length / per));
    if (np > 1 && inR(tp, MPG.prev)) { if (UI.mp > 0) { UI.mp--; snd('ui_click'); } return true; } if (np > 1 && inR(tp, MPG.next)) { if (UI.mp < np - 1) { UI.mp++; snd('ui_click'); } return true; }
    const page = list.slice(UI.mp * per, UI.mp * per + per); for (let i = 0; i < page.length; i++) if (inR(tp, mcR(i))) return page[i]; return null; }

  // =====================================================================================================
  // 一、合成
  // =====================================================================================================
  // 阵盘：Codex 的 array 图是 720 见方，五个凹座离盘心 252、凹座直径 130、炉心直径 190；这里按 DISC 的大小缩着画。
  // 五样料围成一圈：最上面那格是头一格，顺时针数。相邻两格之间那条边——相生亮绿，相克亮红，同一行淡金。
  const CX = 652, CY = 356, DISC = 404, DK = DISC / 720, SR = 252 * DK, SLOT_R = 30, CORE_R = 95 * DK, SEAT = 65 * DK;
  const slotXY = i => { const a = (-90 + i * 72) * Math.PI / 180; return [CX + Math.cos(a) * SR, CY + Math.sin(a) * SR]; };
  const B_CLEAR = { x: 462, y: 628, w: 120, h: 46 }, B_GO = { x: 596, y: 628, w: 246, h: 46 };
  const RB = { x: 880, y: 124, w: 348, h: 548 }, rcR = i => ({ x: RB.x + 10, y: RB.y + 76 + i * 106, w: RB.w - 20, h: 100 });
  const REL_COL = { same: [214, 196, 140], sheng: [130, 224, 140], ke: [240, 110, 90] };
  const GLOW = { jin: [226, 230, 240], mu: [110, 210, 130], shui: [110, 180, 240], huo: [255, 130, 70], tu: [224, 172, 92] };
  const pct = v => Math.round(v * 100) + '%';
  const edgeText = a => a.ns === 5 ? '五行流转，一圈全相生' : a.ns || a.nk ? [a.ns ? '相生 ' + a.ns + ' 处' : '', a.nk ? '相克 ' + a.nk + ' 处' : ''].filter(Boolean).join(' · ') : '五行平和';
  // 阵盘下面那两行字：火候怎样、主属性会落在哪一段、有几条副属性在炉里。出哪一件不说。
  // 作者 11-28 07:49：「底下说什么成色那些东西……我作为玩家理解不了，也不看。最直观的就是金木水火土，对了绿色，不对红色……本来就有容错，主要是给人看小贴士。」
  //   所以阵盘下面只留一行最要紧的；相生相克的道理放进左上角「五行」小贴士里。
  function hints(a) { const col = a.nk > a.ns ? C.red : a.ns ? C.green : C.text, gr = a.ns || a.nk ? [a.ns ? '绿 ' + a.ns : '', a.nk ? '红 ' + a.nk : ''].filter(Boolean).join('　') : '';
    if (!a.n) return [['点左边的材料放上阵盘，五样围成一圈。', C.sub], ['', C.sub]];
    if (a.n < 5) return [['还差 ' + (5 - a.n) + ' 样' + (gr ? '　·　' + gr : ''), C.sub], ['', C.sub]];
    if (a.why === 'noclass') return [['至少放一样牙、角、皮、丝之类的料。', C.red], ['', C.sub]];
    if (a.kind === 'recipe') return owned(a.recipe.id) ? [['「' + ITEM_DB[a.recipe.id].name.replace(/ \+\d$/, '') + '」已经有一件了。', C.sub], ['', C.sub]] : [['对上了秘籍：「' + ITEM_DB[a.recipe.id].name + '」', C.gold2], ['', C.sub]];
    if (a.kind === 'fixed') return a.gem ? [['五枚同一行的精：炼成一颗灵珠。', C.text], ['', C.sub]] : [['五样同出一源，稳当。', C.text], ['', C.sub]];
    return [[a.ns === 5 ? '一圈全绿 · 五行流转' : gr ? gr + '　·　绿越多，出的越好' : '五行平和', col], ['', C.sub]]; }
  function drawDisc(now, a) { const ar = art('array'), R = DISC / 2;
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (ar) ctx.drawImage(ar, CX - R, CY - R, DISC, DISC);
    else { const g = ctx.createRadialGradient(CX, CY, 20, CX, CY, R); g.addColorStop(0, 'rgba(34,52,60,.95)'); g.addColorStop(1, 'rgba(12,24,31,.95)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R - 2, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(194,173,120,.55)'; ctx.stroke();
      for (let i = 0; i < 5; i++) { const [x, y] = slotXY(i); ctx.fillStyle = 'rgba(6,14,19,.9)'; ctx.beginPath(); ctx.arc(x, y, SEAT, 0, 7); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(194,173,120,.45)'; ctx.stroke(); }
      ctx.fillStyle = 'rgba(30,16,12,.95)'; ctx.beginPath(); ctx.arc(CX, CY, CORE_R, 0, 7); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(194,173,120,.6)'; ctx.stroke(); }
    ctx.restore();
    // 炉心的火气：空着的时候是暗的；放一样料亮一分，颜色跟着这一炉的主行走
    if (a.n && !UI.res) { const c = GLOW[a.el] || [255, 170, 90], k = (a.n / 5) * (.34 + .08 * Math.sin(now / 300)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(CX, CY, 2, CX, CY, CORE_R); g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${k})`); g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, CORE_R, 0, 7); ctx.fill(); ctx.restore(); }
    // 相邻两格之间的那条边：相生绿、相克红、同一行淡金；对上秘籍的五条全金
    ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 5; i++) { let rl = a.edges && a.edges[i]; if (!rl) continue; if (a.kind === 'recipe') rl = 'same'; const [x, y] = slotXY(i), [x2, y2] = slotXY((i + 1) % 5), c = REL_COL[rl], k = .7 + .25 * Math.sin(now / 240 + i);
      const dx = x2 - x, dy = y2 - y, L = Math.hypot(dx, dy), x0 = x + dx / L * (SEAT + 2), y0 = y + dy / L * (SEAT + 2), x1 = x2 - dx / L * (SEAT + 2), y1 = y2 - dy / L * (SEAT + 2);
      if (rl === 'same' && a.kind !== 'recipe') { ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},.45)`; ctx.lineWidth = 2.5; }
      else { ctx.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},.95)`; ctx.shadowBlur = 12; ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${k})`; ctx.lineWidth = 4.5; }
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      if ((rl === 'sheng' || rl === 'ke') && a.kind !== 'recipe') { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(6,14,19,.92)'; ctx.beginPath(); ctx.arc(mx, my, 13, 0, 7); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},.95)`; ctx.stroke(); T(rl === 'sheng' ? '生' : '克', mx, my + 1, 15, `rgb(${c[0]},${c[1]},${c[2]})`, KAI(), 700, 'center'); } } ctx.restore();
    const on = art('slot_on'), os = SEAT * 2 * 1.13, NUMS = '一二三四五';
    UI.slots.forEach((u, i) => { const [x, y] = slotXY(i), ox = (x - CX) / SR, oy = (y - CY) / SR;
      T(NUMS[i], x + ox * (SEAT + 13), y + oy * (SEAT + 13) + 1, 13, i === 0 ? 'rgba(233,217,168,.9)' : 'rgba(194,173,120,.5)', KAI(), 700, 'center');   // 第几格（头一格颜色亮些）
      if (!u) return; if (on) ctx.drawImage(on, x - os / 2, y - os / 2, os, os); try { itemIcon(u.id, x, y, SLOT_R); } catch (e) {}
      const m = MAT[u.id]; if (m && m.wx) { try { WX5.emblem(m.wx, x + SLOT_R * .95, y - SLOT_R * .95, 15, 1); } catch (e) {} }
      if (u.ln) { const k = CR.parse(u.ln)[0]; ctx.font = `700 12.5px ${KAI()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(CR.lineText(u.ln, true), x, y + SLOT_R - 3, LINE_COL(k), 'rgba(6,14,19,.95)', 4); } });
    // 炉心：刚出炉的那一件；没有的话，看得出主行就淡淡亮一枚那一行的徽记
    const res = UI.res; if (res) { const k = Math.min(1, (now - res.t) / 220), sc = 1 + (1 - k) * .5; ctx.save(); try { ctx.globalAlpha *= k; itemIcon(res.id, CX, CY, (CORE_R - 7) * sc); } catch (e) {} ctx.restore(); }
    else if (a.el && a.n) { try { WX5.emblem(a.el, CX, CY, 22, .32 + .1 * Math.sin(now / 400)); } catch (e) {} } }
  const GRADE_COL = ['#aab3b6', '#E9D9A8', '#8cc4f2', '#f6c65a', '#ff9a6a'];
  const CHENG = v => { const n = Math.round(v * 10); return n >= 10 ? '十成' : '一二三四五六七八九'[n - 1] + '成'; };
  const tierText = a => { const T6 = window.GEAR6 ? GEAR6.TIER_CN : { 1: '练气档', 2: '凝丹档' }; return a.p2 >= 1 ? '这一炉出' + T6[2] : a.p2 <= 0 ? '这一炉出' + T6[1] : '这一炉：' + T6[2] + CHENG(a.p2) + '，' + T6[1] + CHENG(1 - a.p2); };
  function drawSynth(now) { const a = CR.analyze(UI.slots);
    drawMats('材料', null, null, true);
    drawDisc(now, a);
    const res = UI.res, topY = CY - DISC / 2 - 15;
    if (saying(now)) { ctx.font = `500 15px ${KAI()}`; T(fitW(SMITH + '：' + UI.say, 440), CX, topY, 15, C.gold2, KAI(), 500, 'center'); } else if (res) T('出　炉', CX, topY, 16, C.sub, KAI(), 600, 'center');
   // 两档的料混着放：出高一档的机会写明（出哪一件照旧不说）
    if (res) { const it = ITEM_DB[res.id]; ctx.font = `400 25px ${BR()}`; T(fitW(it.name, 420), CX, 581, 25, it.fg ? GRADE_COL[it.grade] : C.gold2, BR(), 400, 'center');
      const lb = window.GEAR6 ? GEAR6.label(res.id) : '', sub = (lb ? lb + '　' : '') + (it.fg ? '主属性 ' + pct(it.mult) + (it.subs.length ? '　' + it.subs.join('　') : '　没带出副属性') : it.slot ? statText(res.id) : ''); ctx.font = `500 15px ${KAI()}`; T(fitW(sub, 440), CX, 607, 15, it.fg && it.subs.length ? C.green : C.sub, KAI(), 500, 'center'); }
    else { const h = hints(a); ctx.font = `600 16px ${KAI()}`; T(fitW(h[0][0], 440), CX, 583, 16, h[0][1], KAI(), 600, 'center'); ctx.font = `500 15px ${KAI()}`; T(fitW(h[1][0], 440), CX, 607, 15, h[1][1], KAI(), 500, 'center'); }
    btn(B_CLEAR, '清　空', a.n ? 'n' : 'd', 17);
    const ng = S.hero.gold || 0;
    if (a.n < 5) btn(B_GO, '放满五样', 'd', 18); else if (!a.ok) btn(B_GO, '这一炉开不了', 'd', 18); else if (a.kind === 'recipe' && owned(a.recipe.id)) btn(B_GO, '已经有一件了', 'd', 18); else if (ng < a.fee) btn(B_GO, '灵石不够（要 ' + a.fee + '）', 'd', 17);
    else btn(B_GO, armed('go') ? (a.kind !== 'recipe' && a.rare ? '里面有珍稀料 · 再点才开炉' : '再点一次 · 开炉') : '合　成　· 灵石 ' + a.fee, armed('go') ? 'p' : 'n', armed('go') && a.kind !== 'recipe' && a.rare ? 15 : 18);
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
  // 照秘籍自己摆料：专属的属性是定死的，所以先用不带副属性的，带得好的留着
  function fillRecipe(rc) { const need = {}, out = []; rc.mats.forEach(q => need[q] = (need[q] || 0) + 1);
    for (const id of Object.keys(need)) { const st = CR.stacks(id).slice().sort((x, y) => CR.score(x.ln) - CR.score(y.ln)); let left = need[id]; for (const s of st) { const t = Math.min(left, s.n); for (let k = 0; k < t; k++) out.push({ id, ln: s.ln || null }); left -= t; if (left <= 0) break; } }
    return out.concat([null, null, null, null, null]).slice(0, 5); }
  function tapSynth(tp) { const m = tapMats(tp, null, true);
    if (m && m.id) { const i = UI.slots.indexOf(null); if (i < 0) { speak('五格都放满了。点阵盘上的料可以拿下来。'); snd('ui_cancel'); return; } if (m.n - used(m) <= 0) { snd('ui_cancel'); return; } UI.slots[i] = { id: m.id, ln: m.ln || null }; UI.res = null; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    if (m) return;
    for (let i = 0; i < 5; i++) { const [x, y] = slotXY(i); if (Math.hypot(tp.x - x, tp.y - y) <= SEAT + 6) { if (UI.slots[i]) { UI.slots[i] = null; UI.arm = null; snd('ui_click'); } return; } }
    if (inR(tp, B_CLEAR)) { if (UI.slots.some(Boolean)) { UI.slots.fill(null); UI.arm = null; snd('ui_click'); } return; }
    const rs = CR.RECIPES.filter(CR.recipeShown).slice(0, 4); for (let i = 0; i < rs.length; i++) if (inR(tp, rcR(i))) { const rc = rs[i], need = {}; rc.mats.forEach(q => need[q] = (need[q] || 0) + 1); const lack = Object.keys(need).filter(q => have(q) < need[q]);
        if (owned(rc.id)) { speak('「' + ITEM_DB[rc.id].name.replace(/ \+\d$/, '') + '」已经有一件了，不用再打。'); snd('ui_cancel'); return; }
        if (lack.length) { speak('「' + ITEM_DB[rc.id].name + '」还差：' + lack.map(q => ITEM_DB[q].name + ' ' + (need[q] - have(q))).join('、') + '。'); snd('ui_cancel'); return; }
        UI.slots = fillRecipe(rc); UI.res = null; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    if (!inR(tp, B_GO)) return; const a = CR.analyze(UI.slots);
    if (a.n < 5) { speak('五格放满了才开得了炉。'); snd('ui_cancel'); return; } if (!a.ok) { speak('光有精气不成器。至少放一样牙、角、皮、丝之类的料。'); snd('ui_cancel'); return; }
    if (a.kind === 'recipe' && owned(a.recipe.id)) { speak('这一件已经有了，不用再打。珍稀的料留着打别的。'); snd('ui_cancel'); return; } if ((S.hero.gold || 0) < a.fee) { speak('炭火钱不够。'); snd('ui_cancel'); return; }
    if (!armed('go')) { UI.arm = { k: 'go', t: performance.now() }; snd('ui_click'); return; }
    UI.arm = null; const r = CR.craft(UI.slots); if (r.err) { speak(r.err === 'gold' ? '炭火钱不够。' : '料不够了。'); snd('ui_cancel'); return; }
    const it = ITEM_DB[r.id], el = (it.gem || WX5.GEAR[r.id] || a.el || 'jin'); UI.slots.fill(null); UI.res = { id: r.id, t: performance.now() };
    burst(CX, CY, el, r.grade >= 3 || r.rank >= 3 ? 1.4 : 1.15); if (r.grade >= 4 || (r.rank >= 3 && a.kind === 'mix')) setTimeout(() => { if (UI.open) burst(CX, CY, 'jin', 1.7); }, 160);
    try { S.flash = r.grade >= 3 ? .3 : .22; S.flashColor = '#ffe9b8'; } catch (e) {} snd('sfx_sword_ring', .6); try { playSnd('jingle_levelup', .45); } catch (e) {}
    speak(it.gem ? '五枚精炼成一颗「' + it.name + '」。到镶嵌那一页，镶到装备上去；攒够两颗一样的，还能合成高一级的。' : a.kind === 'recipe' ? '成了。「' + it.name + '」——这一件只认它的主人。'
      : a.kind === 'fixed' ? (r.lines.length ? '五样同出一源，稳当。头一样料上的那一条，带进去了。' : '五样同出一源，稳当。')
      : (r.rank >= 3 ? '「' + ITEM_DB[r.base].name + '」——这一路料里最难得的一件，十炉也未必出一回。' : r.rank === 2 ? '「' + ITEM_DB[r.base].name + '」，稀有的东西。' : '')
        + (r.grade >= 4 ? '五行流转，五条全留——这样的东西，我打了一辈子铁也没见过几回。绝品。' : r.grade === 3 ? '成色极好。极品。' : r.grade === 2 ? '成色不错，上品。' : r.grade === 0 ? (a.H < 0 ? '五行相克，成色差了些。下回把相生的两样挨着摆。' : '这一炉手气差了点。') : r.rank >= 2 ? '' : '成了。中规中矩。'));
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
      if (g.who) { ctx.font = `700 14px ${KAI()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(g.who === 'hero' ? '叶' : CR.whoName(g.who).slice(0, 1), r.x + 14, r.y + 62, C.green, 'rgba(6,14,19,.92)', 4); }
      const bd = badge(g.id); if (bd) T(bd, r.x + r.w - 8, r.y + 14, 14, C.gold2, NUM(), 700, 'right');
      ctx.font = `500 13px ${KAI()}`; T(fitW(ITEM_DB[g.id].name.replace(/ \+\d$/, '').replace(/（[^）]*）$/, ''), r.w - 6), r.x + r.w / 2, r.y + r.h - 14, 13, C.text, KAI(), 500, 'center'); });
    if (np > 1) { btn(GPG.prev, '上一页', UI.gp > 0 ? 'n' : 'd', 15); btn(GPG.next, '下一页', UI.gp < np - 1 ? 'n' : 'd', 15); T((UI.gp + 1) + ' / ' + np, GL.x + GL.w / 2, GPG.prev.y + 18, 15, C.sub, NUM(), 600, 'center'); } }
  function tapGears(tp) { const list = gearList(), per = GCOLS * GROWS, np = Math.max(1, Math.ceil(list.length / per));
    if (np > 1 && inR(tp, GPG.prev)) { if (UI.gp > 0) { UI.gp--; snd('ui_click'); } return true; } if (np > 1 && inR(tp, GPG.next)) { if (UI.gp < np - 1) { UI.gp++; snd('ui_click'); } return true; }
    const page = list.slice(UI.gp * per, UI.gp * per + per); for (let i = 0; i < page.length; i++) if (inR(tp, gcR(i))) { if (UI.gsel !== page[i].id) { UI.gsel = page[i].id; UI.arm = null; UI.say = ''; UI.sock = 0; snd('ui_click'); } return true; } return false; }
  const GD = { x: 516, y: 124, w: 712, h: 548 };
  function gearHead(id) { const it = ITEM_DB[id], g = WX5.GEAR[id], FX = window.REFINE_FX, rl = FX ? FX.lvOf(id) : 0, nowF = performance.now();   // 强化过的：图标外面盖金纹框、亮星钉（r407_refine_fx.js）
    if (rl) FX.under(GD.x + 66, GD.y + 70, 44, rl, nowF); try { itemIcon(id, GD.x + 66, GD.y + 70, 44); } catch (e) {} if (rl) FX.slot(GD.x + 66 - 60, GD.y + 70 - 58, 120, 120, rl, nowF); T(it.name, GD.x + 130, GD.y + 46, 28, C.gold2, BR(), 400);
    const lb = window.GEAR6 ? GEAR6.label(id) : ''; T((g ? WX[g].n + '性 · ' : '') + (SLOT_CN[it.slot] || '') + (lb ? ' · ' + lb : '') + '　' + statText(id), GD.x + 130, GD.y + 84, 16, C.text);
    if (it.fg) { ctx.font = `500 15px ${KAI()}`; T(fitW('主属性 ' + pct(it.mult) + '　' + (it.subs.length ? '副属性：' + it.subs.join('　') : '没有副属性'), GD.w - 160), GD.x + 130, GD.y + 110, 15, it.subs.length ? C.green : C.sub, KAI(), 500); } }

  // =====================================================================================================
  // 二、强化（+5 封顶、每级各项加一成半、前三级必成——equip_plus 那一套不变；11-27 傍晚换了材料，加了「挪强化」）
  // =====================================================================================================
  // 设计稿第五节：强化不再和合成抢料。练气档的装备用淬灵砂，凝丹档的用淬灵晶；强化到第几级，就用几份。
  //   炭火钱按档算：练气档每级 80、凝丹档每级 200（+1 一倍、+2 两倍……）。
  // 挪强化：把一件装备的强化原样挪到同一个部位的另一件上（那一件得比它低），旧的那件清零——换了新装备，前面的强化不白费。
  const MAXLV = 5, RATE = [1, 1, 1, .7, .5], B_REF = { x: GD.x + GD.w - 250, y: GD.y + GD.h - 76, w: 226, h: 54 }, B_MOVE = { x: GD.x + GD.w - 250 - 196, y: GD.y + GD.h - 76, w: 184, h: 54 };
  const G6 = () => window.GEAR6 || null;
  // 这件装备算哪一档：排进格子的看格子；别的看需要等级（11 级起算凝丹档）。引魂、归元两档的装备还没做，先封在凝丹档
  const gearTier = id => { const g = G6(), t = g ? g.tierOf(id) : 0; if (t) return Math.min(2, t); return (ITEM_DB[id].lvReq || 0) >= (window.GX_LV10 ? 11 : 10) ? 2 : 1; };
  const quenchOf = id => { const g = G6(), q = g && g.QUENCH[gearTier(id)]; return q && ITEM_DB[q] ? q : null; };
  const refCost = (id, l) => { const t = gearTier(id); return { gold: (t >= 2 ? 200 : 80) * (l + 1), n: l + 1, mat: quenchOf(id), tier: t }; };
  const moveFee = (to, lv) => (gearTier(to) >= 2 ? 150 : 60) * lv;
  // 下一级是多少：把等级临时拨高一格读一遍再拨回来（数是 equip_plus 那套读数算的，这里不另算一套）
  function peekNext(id, l) { const R = (S.hero.refine = S.hero.refine || {}), old = R[id], out = {}; R[id] = l + 1; try { for (const k of KEYS) out[k] = ITEM_DB[id][k] || 0; } finally { if (old) R[id] = old; else delete R[id]; } return out; }
  const canMoveTo = (src, id) => !!src && id !== src && ITEM_DB[id] && ITEM_DB[src] && ITEM_DB[id].slot === ITEM_DB[src].slot && CR.refineOf(id) < CR.refineOf(src);
  function drawRefine(now) { const mv = UI.mv && ITEM_DB[UI.mv] && CR.refineOf(UI.mv) > 0 ? UI.mv : (UI.mv = null);
    drawGears(mv ? '挪到哪一件上' : '强化哪一件', id => { const l = CR.refineOf(id); return mv ? (id === mv ? '+' + l : canMoveTo(mv, id) ? '可' : '') : (l ? '+' + l : ''); }); D('panel_well_9', GD.x, GD.y, GD.w, GD.h);
    const id = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null;
    if (!id) { ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap('点左边的一件装备。每强化一级，这件装备的各项属性加一成半，最高 +5。练气档的装备用淬灵砂，凝丹档的用淬灵晶：强化到第几级，就用几份。前三级必成；+4 七成、+5 五成，不成只损材料，装备不坏。换了新装备，可以把旧装备的强化挪过去。', GD.x + 26, GD.y + 44, GD.w - 52, 28, 6); return; }
    gearHead(id); const l = CR.refineOf(id), it = ITEM_DB[id], ng = S.hero.gold || 0;
    // 正在挪：右边写清楚从哪一件挪到哪一件
    if (mv) { const lv = CR.refineOf(mv), ok = canMoveTo(mv, id), fee = ok ? moveFee(id, lv) : 0;
      T('把「' + ITEM_DB[mv].name + '」的强化挪过来', GD.x + 30, GD.y + 150, 20, C.gold2, KAI(), 600);
      if (id === mv) T('点左边另一件' + (SLOT_CN[it.slot] || '装备') + '（右上角标着「可」的）。', GD.x + 30, GD.y + 190, 17, C.sub);
      else if (!ok) T(ITEM_DB[id].slot !== ITEM_DB[mv].slot ? '部位不一样，挪不过来。' : '这一件的强化不比它低，用不着挪。', GD.x + 30, GD.y + 190, 17, C.red);
      else { T('这一件：+' + l + '　→　+' + lv, GD.x + 30, GD.y + 194, 24, C.green, NUM(), 700); T('「' + ITEM_DB[mv].name.replace(/ \+\d$/, '') + '」回到 +0', GD.x + 30, GD.y + 234, 17, C.sub); T('灵石 ' + ng + ' / ' + fee, GD.x + 30, GD.y + 270, 17, ng >= fee ? C.green : C.red, NUM(), 600); }
      if (saying(now)) T(SMITH + '：' + UI.say, GD.x + 30, GD.y + GD.h - 100, 16, C.gold2);
      btn(B_MOVE, '不挪了', 'n', 18); if (ok) btn(B_REF, ng < fee ? '灵石不够' : armed('mv') ? '再点一次 · 挪过来' : '挪到这一件', ng < fee ? 'd' : armed('mv') ? 'p' : 'n', 18); return; }
    if (l >= MAXLV) { T('已经到 +' + MAXLV + '，再敲就碎了。', GD.x + 30, GD.y + 170, 19, C.gold2, KAI(), 600); if (saying(now)) T(SMITH + '：' + UI.say, GD.x + 30, GD.y + GD.h - 100, 16, C.gold2); btn(B_REF, '把强化挪走', 'n', 18); return; }
    const c = refCost(id, l), hv = c.mat ? have(c.mat) : 0;
    T('+' + l + '　→　+' + (l + 1), GD.x + 30, GD.y + 150, 26, C.gold2, NUM(), 700);
    const nx = peekNext(id, l); let y = GD.y + 196; for (const k of KEYS) { const v = it[k]; if (!v || v <= 0) continue; T(STAT_NAME[k], GD.x + 30, y, 17, C.sub); T(String(v), GD.x + 100, y, 19, C.text, NUM(), 700); T('→', GD.x + 150, y, 17, C.sub); T(String(nx[k]), GD.x + 186, y, 19, C.green, NUM(), 700); y += 32; }
    T('要用的料', GD.x + 330, GD.y + 150, 17, C.sub);
    if (c.mat) { try { itemIcon(c.mat, GD.x + 356, GD.y + 204, 26); } catch (e) {} T(ITEM_DB[c.mat].name + ' ×' + c.n, GD.x + 396, GD.y + 196, 19, C.text, KAI(), 600); T('身上有 ' + hv, GD.x + 396, GD.y + 222, 15, hv >= c.n ? C.green : C.red, KAI(), 500); }
    T('灵石 ' + ng + ' / ' + c.gold, GD.x + 330, GD.y + 276, 17, ng >= c.gold ? C.green : C.red, NUM(), 600); T('成功率 ' + Math.round(RATE[l] * 100) + '%' + (RATE[l] < 1 ? '（不成只损材料）' : ''), GD.x + 330, GD.y + 308, 17, RATE[l] < 1 ? '#d9b46a' : C.text);
    if (saying(now)) T(SMITH + '：' + UI.say, GD.x + 30, GD.y + GD.h - 100, 16, C.gold2);
    if (l > 0) btn(B_MOVE, '把强化挪走', 'n', 17);
    if (!c.mat || hv < c.n) btn(B_REF, '料不够', 'd', 18); else if (ng < c.gold) btn(B_REF, '灵石不够', 'd', 18); else btn(B_REF, armed('ref') ? '再点一次 · 下锤' : '强　化', armed('ref') ? 'p' : 'n'); }
  function tapRefine(tp) { const mv = UI.mv && ITEM_DB[UI.mv] && CR.refineOf(UI.mv) > 0 ? UI.mv : (UI.mv = null);
    if (tapGears(tp)) return; const id = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null; if (!id) return; const l = CR.refineOf(id), bx = GD.x + 66, by = GD.y + 70;
    if (mv) { if (inR(tp, B_MOVE)) { UI.mv = null; UI.arm = null; snd('ui_click'); return; } if (!inR(tp, B_REF) || !canMoveTo(mv, id)) return; const lv = CR.refineOf(mv), fee = moveFee(id, lv);
      if ((S.hero.gold || 0) < fee) { speak('挪一回要 ' + fee + ' 灵石的炭火钱。'); snd('ui_cancel'); return; } if (!armed('mv')) { UI.arm = { k: 'mv', t: performance.now() }; snd('ui_click'); return; }
      UI.arm = null; S.hero.gold -= fee; const from = ITEM_DB[mv].name.replace(/ \+\d$/, ''); CR.setRefine(mv, 0); CR.setRefine(id, lv); UI.mv = null; burst(bx, by, WX5.GEAR[id] || 'jin', .9); snd('sfx_sword_ring', .6); try { S.flash = .18; S.flashColor = '#ffe9b8'; } catch (e) {}
      speak('挪好了。「' + from + '」上的火候，原样到了这一件上。'); return; }
    if (inR(tp, B_MOVE) && l > 0 && l < MAXLV) { UI.mv = id; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    if (!inR(tp, B_REF)) return; if (l >= MAXLV) { UI.mv = id; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    const c = refCost(id, l), hv = c.mat ? have(c.mat) : 0; if (!c.mat || hv < c.n) { speak((c.mat ? ITEM_DB[c.mat].name : '淬灵') + '不够，这一级要 ' + c.n + ' 份。' + (c.tier >= 2 ? '头目、妖王身上多，凝丹的妖物偶尔也掉。' : '练气的妖物身上有，铁匠铺也卖。')); snd('ui_cancel'); return; } if ((S.hero.gold || 0) < c.gold) { speak('炭火钱不够。'); snd('ui_cancel'); return; }
    if (!armed('ref')) { UI.arm = { k: 'ref', t: performance.now() }; snd('ui_click'); return; }
    UI.arm = null; CR.take(c.mat, c.n); S.hero.gold -= c.gold; snd('sfx_sword_ring', .7);
    if (Math.random() < RATE[l]) { CR.setRefine(id, l + 1); burst(bx, by, WX5.GEAR[id] || 'jin', .9); try { S.flash = .2; S.flashColor = '#ffe9b8'; playSnd('jingle_levelup', .45); } catch (e) {} speak('成了，+' + (l + 1) + '。' + (l + 1 >= MAXLV ? '到头了，再敲就碎了。' : '')); }
    else { try { S.flash = .18; S.flashColor = '#7a2a1a'; S.shake = 6; playSnd('sfx_hurt', .5); } catch (e) {} speak('火候差了一点。料和炭钱没了，东西没坏，还是 +' + l + '。'); } }

  // =====================================================================================================
  // 三、镶嵌（五行灵珠；按「这一种装备」记，和强化一样）
  // =====================================================================================================
  // 11-27 傍晚（设计稿第六节）：灵珠能升级——两颗一样的合成高一级的一颗，一到五级；换下来的珠子不碎了，退回行囊。
  //   孔里记的是「哪一行 + 几级」：'huo' 是一级的火灵珠（老存档就是这么记的），'huo3' 是三级的。
  const GEMS = () => (S.hero.gems = S.hero.gems || {});
  const sockN = id => { const it = ITEM_DB[id]; if (!it || !it.slot || WX5.isXH(id)) return 0; const t6 = window.GEAR6 ? GEAR6.tierOf(id) : 0; if (t6) return t6 >= 2 ? 2 : 1;   // 排进格子的装备：练气档一个孔，凝丹档两个
    const st = G.setOfItem(id); return (st && st.tier >= 2) || (it.lvReq || 0) >= 10 ? 2 : 1; };
  const gemEL = g => String(g || '').replace(/\d+$/, ''), gemLV = g => +((/(\d+)$/.exec(String(g || '')) || [])[1] || 1), gemTok = (el, lv) => lv > 1 ? el + lv : el;
  const gemItem = g => CR.gemId(gemEL(g), gemLV(g));   // 孔里那颗珠子是行囊里的哪一样东西
  const gemsOf = id => { const a = GEMS()[id] || []; return [a[0] || null, a[1] || null].slice(0, sockN(id)); };
  const gemVal = (g, id) => { const el = gemEL(g), lv = Math.min(CR.GEM_MAX, gemLV(g)), k = CR.GEM[el][1], v = CR.GEM_V[el][lv - 1]; return [k, WX5.GEAR[id] === el ? Math.round(v * 1.5) : v]; };
  const gemBonus = (id, k) => { let t = 0; for (const g of gemsOf(id)) if (g && CR.GEM[gemEL(g)]) { const [kk, v] = gemVal(g, id); if (kk === k) t += v; } return t; };
  // 让装备的属性读数把灵珠算进去（套在强化那层读数的外面）
  function gemWrap(id) { const it = ITEM_DB[id]; if (!it || !it.slot || it._gemW) return; try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {} it._gemW = 1;
    for (const k of KEYS) { const d = Object.getOwnPropertyDescriptor(it, k); let getB, setB; if (d && d.get) { getB = () => d.get.call(it); setB = v => { if (d.set) d.set.call(it, v); }; } else { let v = d ? d.value : undefined; getB = () => v; setB = x => { v = x; }; }
      Object.defineProperty(it, k, { configurable: true, enumerable: !!d, get() { const b = getB(), g = gemBonus(id, k); return g ? (b || 0) + g : b; }, set(v) { setB(v); } }); } }
  // 等强化那层读数先套好（它在开局三秒时补套一遍），再套灵珠这一层；读档进来的也是这里补上
  const plusReady = it => { const d = Object.getOwnPropertyDescriptor(it, 'name'); return !!(d && d.get) || performance.now() > 5000; };
  setInterval(() => { try { if (!S.hero || !S.hero.gems) return; for (const id of Object.keys(S.hero.gems)) { const it = ITEM_DB[id]; if (it && !it._gemW && plusReady(it)) gemWrap(id); } } catch (e) {} }, 500);
  // 往第 i 个孔里镶 g（null = 取下来）。原来那颗退回行囊。正穿在叶孤星身上的，把差额补到他身上
  function setGem(id, i, g) { const it = ITEM_DB[id], h = S.hero; gemWrap(id); const before = {}; for (const k of KEYS) before[k] = it[k] || 0; const a = GEMS()[id] = gemsOf(id).concat([null, null]).slice(0, 2), old = a[i]; a[i] = g || null;
    if (old && ITEM_DB[gemItem(old)]) addItem(gemItem(old), 1);
    const on = h.equip && h.equip[it.slot] === id; if (on) { for (const k of KEYS) { const d = (it[k] || 0) - before[k]; if (d) h[k] += d; } h.hp = Math.min(h.hp, h.maxhp); h.mp = Math.min(h.mp, h.maxmp); } return old || null; }
  const skR = i => ({ x: GD.x + 40 + i * 150, y: GD.y + 150, w: 130, h: 130 }), gmR = i => ({ x: GD.x + 26 + (i % 4) * 166, y: GD.y + 320 + Math.floor(i / 4) * 60, w: 160, h: 56 }), GPER = 8;   // 一排四叠、两排；一叠里左边是图标，右边名字一行、加多少一行，个数靠右
  const GMPG = { prev: { x: GD.x + GD.w - 196, y: GD.y + 286, w: 80, h: 30 }, next: { x: GD.x + GD.w - 106, y: GD.y + 286, w: 80, h: 30 } };
  const B_SET = { x: GD.x + GD.w - 250, y: GD.y + GD.h - 76, w: 226, h: 54 }, B_MERGE = { x: GD.x + GD.w - 250 - 236, y: GD.y + GD.h - 76, w: 224, h: 54 }, B_OFF = { x: GD.x + 356, y: GD.y + 190, w: 150, h: 46 };
  const mergeFee = lv => 100 * lv;   // 两颗 lv 级的合成一颗 lv + 1 级的：炭火钱
  // 行囊里的灵珠：一样一叠，按五行排，同一行高的在前
  function gemStacks() { const out = []; for (const el of ORDER) for (let lv = CR.GEM_MAX; lv >= 1; lv--) { const gid = CR.gemId(el, lv), n = have(gid); if (n > 0 && ITEM_DB[gid]) out.push({ gid, el, lv, n, tok: gemTok(el, lv) }); } return out; }
  function drawInlay(now) { drawGears('镶哪一件', id => { const n = gemsOf(id).filter(Boolean).length; return n ? '珠' + n : ''; }); D('panel_well_9', GD.x, GD.y, GD.w, GD.h);
    const id = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null, st = gemStacks(), np = Math.max(1, Math.ceil(st.length / GPER)); UI.gmp = Math.min(UI.gmp || 0, np - 1); const sel = st.find(q => q.gid === UI.gsk) || null; if (!sel) UI.gsk = null;
    let cur = null;
    if (!id) { ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap('点左边的一件装备，再点下面的一颗灵珠，按「镶上」。灵珠是五枚同一行的精在「合成」那一页炼出来的；两颗一样的能合成高一级的，最高五级。珠子和装备同一行，效果多五成。换下来的珠子退回行囊。', GD.x + 26, GD.y + 44, GD.w - 52, 28, 5); }
    else { gearHead(id); const n = sockN(id), gs = gemsOf(id);
      if (!n) { T('星痕剑不镶珠——它点星纹（看「星纹」那一页）。', GD.x + 30, GD.y + 190, 18, C.gold2, KAI(), 600); }
      else { UI.sock = Math.min(UI.sock, n - 1); cur = gs[UI.sock]; T('孔位（点一下选中）', GD.x + 30, GD.y + 132, 15, C.sub);
        for (let i = 0; i < n; i++) { const r = skR(i), on = UI.sock === i, g = gs[i]; D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); const se = art('socket_empty');
          if (g) { try { itemIcon(gemItem(g), r.x + r.w / 2, r.y + 50, 32); } catch (e) {} const [k, v] = gemVal(g, id); T(STAT_NAME[k] + ' +' + v, r.x + r.w / 2, r.y + 106, 15, C.green, KAI(), 600, 'center'); }
          else { if (se) ctx.drawImage(se, r.x + r.w / 2 - 36, r.y + 14, 72, 72); else { ctx.save(); ctx.strokeStyle = 'rgba(194,173,120,.45)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + 50, 28, 0, 7); ctx.stroke(); ctx.restore(); } T('空', r.x + r.w / 2, r.y + 106, 15, C.sub, KAI(), 600, 'center'); } }
        if (cur) btn(B_OFF, '取下这一颗', 'n', 16); } }
    T('行囊里的灵珠' + (st.length ? '（点一颗选中）' : ''), GD.x + 30, GD.y + 302, 15, C.sub);
    if (!st.length) T('一颗都没有。五枚同一行的精，到「合成」那一页炼一颗。', GD.x + 30, GD.y + 350, 16, C.sub);
    st.slice(UI.gmp * GPER, UI.gmp * GPER + GPER).forEach((q, i) => { const r = gmR(i), on = UI.gsk === q.gid; D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(q.gid, r.x + 26, r.y + 28, 19); } catch (e) {}
      ctx.font = `600 14px ${KAI()}`; T(fitW(ITEM_DB[q.gid].name, r.w - 56), r.x + 50, r.y + 19, 14, C.gold2, KAI(), 600); const same = !!(id && sockN(id) && WX5.GEAR[id] === q.el), kk = CR.GEM[q.el][1], v = id && sockN(id) ? gemVal(q.tok, id)[1] : CR.GEM_V[q.el][q.lv - 1];
      T(STAT_NAME[kk] + ' +' + v, r.x + 50, r.y + 39, 13, same ? C.green : C.text, KAI(), 500); T('×' + q.n, r.x + r.w - 12, r.y + 39, 13, C.sub, KAI(), 500, 'right'); });
    if (np > 1) { btn(GMPG.prev, '上一页', UI.gmp > 0 ? 'n' : 'd', 14); btn(GMPG.next, '下一页', UI.gmp < np - 1 ? 'n' : 'd', 14); }
    if (saying(now)) { ctx.font = `500 16px ${KAI()}`; T(fitW(SMITH + '：' + UI.say, GD.w - 60), GD.x + 30, GD.y + GD.h - 96, 16, C.gold2, KAI(), 500); }
    else if (sel) { const kk = CR.GEM[sel.el][1]; ctx.font = `500 15px ${KAI()}`; T(fitW(ITEM_DB[sel.gid].name + '：' + STAT_NAME[kk] + ' +' + CR.GEM_V[sel.el][sel.lv - 1] + '，镶在' + WX[sel.el].n + '性的装备上再多五成。' + (sel.lv < CR.GEM_MAX ? '两颗能合成一颗' + '一二三四五'[sel.lv] + '级的。' : '已经是最高一级。'), GD.w - 60), GD.x + 30, GD.y + GD.h - 96, 15, C.sub, KAI(), 500); }
    if (sel) { const ng = S.hero.gold || 0, fee = mergeFee(sel.lv);
      if (sel.lv < CR.GEM_MAX) btn(B_MERGE, sel.n < 2 ? '要两颗才能合' : ng < fee ? '灵石不够（要 ' + fee + '）' : armed('mg') ? '再点一次 · 合成' : '两颗合一颗 · 灵石 ' + fee, sel.n < 2 || ng < fee ? 'd' : armed('mg') ? 'p' : 'n', 16);
      if (id && sockN(id)) btn(B_SET, cur === sel.tok ? '孔里就是这一颗' : cur ? '换上这一颗' : '镶　上', cur === sel.tok ? 'd' : 'n', 18); } }
  function tapInlay(tp) { if (tapGears(tp)) return; const id = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null, n = id ? sockN(id) : 0, st = gemStacks(), np = Math.max(1, Math.ceil(st.length / GPER));
    if (id && n) { for (let i = 0; i < n; i++) if (inR(tp, skR(i))) { UI.sock = i; UI.arm = null; snd('ui_click'); return; }
      const cur = gemsOf(id)[UI.sock]; if (cur && inR(tp, B_OFF)) { setGem(id, UI.sock, null); UI.arm = null; snd('ui_click'); speak('取下来了，' + ITEM_DB[gemItem(cur)].name + '回到行囊里。'); return; } }
    if (np > 1 && inR(tp, GMPG.prev)) { if (UI.gmp > 0) { UI.gmp--; snd('ui_click'); } return; } if (np > 1 && inR(tp, GMPG.next)) { if (UI.gmp < np - 1) { UI.gmp++; snd('ui_click'); } return; }
    const page = st.slice((UI.gmp || 0) * GPER, (UI.gmp || 0) * GPER + GPER); for (let i = 0; i < page.length; i++) if (inR(tp, gmR(i))) { if (UI.gsk !== page[i].gid) { UI.gsk = page[i].gid; UI.arm = null; UI.say = ''; snd('ui_click'); } return; }
    const sel = st.find(q => q.gid === UI.gsk); if (!sel) return;
    if (sel.lv < CR.GEM_MAX && inR(tp, B_MERGE)) { const fee = mergeFee(sel.lv); if (sel.n < 2) { speak('要两颗一样的才能合。'); snd('ui_cancel'); return; } if ((S.hero.gold || 0) < fee) { speak('炭火钱不够，要 ' + fee + ' 灵石。'); snd('ui_cancel'); return; }
      if (!armed('mg')) { UI.arm = { k: 'mg', t: performance.now() }; snd('ui_click'); return; }
      UI.arm = null; CR.take(sel.gid, 2); S.hero.gold -= fee; const up = CR.gemId(sel.el, sel.lv + 1); addItem(up, 1); UI.gsk = up; const r = gmR(0); burst(r.x + 26, r.y + 28, sel.el, .8); snd('ui_confirm'); try { playSnd('jingle_levelup', .4); } catch (e) {} speak('两颗并作一颗：「' + ITEM_DB[up].name + '」。'); return; }
    if (id && n && inR(tp, B_SET)) { const cur = gemsOf(id)[UI.sock]; if (cur === sel.tok) return; UI.arm = null; CR.take(sel.gid, 1); const old = setGem(id, UI.sock, sel.tok); const r = skR(UI.sock); burst(r.x + r.w / 2, r.y + 50, sel.el, .8); snd('ui_confirm'); try { playSnd('jingle_levelup', .4); } catch (e) {}
      const [kk, v] = gemVal(sel.tok, id); speak('镶上了。' + STAT_NAME[kk] + ' +' + v + (WX5.GEAR[id] === sel.el ? '——珠子和它同是' + WX[sel.el].n + '性，多出五成。' : '。') + (old ? '原来那颗退回行囊了。' : '')); return; } }

  // =====================================================================================================
  // 四、精炼：把用不上的材料炼成那一行的精（寻常的三炼一，上等的两炼一；珍稀料不在这儿炼）
  // =====================================================================================================
  const canMelt = id => !!MAT[id].c && MAT[id].g <= 2 && !!MAT[id].wx, meltN = id => MAT[id].g >= 2 ? 2 : 3;
  const MD = { x: 436, y: 124, w: 792, h: 548 };
  const B_M1 = { x: MD.x + MD.w / 2 - 180, y: MD.y + 300, w: 170, h: 54 }, B_MA = { x: MD.x + MD.w / 2 + 10, y: MD.y + 300, w: 170, h: 54 };
  function drawMelt(now) { drawMats('炼哪一样', canMelt, UI.msel); D('panel_well_9', MD.x, MD.y, MD.w, MD.h);
    const id = UI.msel && MAT[UI.msel] && have(UI.msel) > 0 ? UI.msel : null;
    if (!id) { ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap('点左边的一样材料，把它炼成那一行的五行之精。寻常的料三样炼一枚，上等的两样炼一枚。头目、妖王身上的珍稀料不在这儿炼——留着照秘籍打专属套装。带着副属性的料会留到最后才炼。', MD.x + 26, MD.y + 44, MD.w - 52, 28, 6); if (saying(now)) T(SMITH + '：' + UI.say, MD.x + 26, MD.y + MD.h - 48, 16, C.gold2); return; }
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
    DRAW[UI.tab](now); drawFx(now);
    // 左上角「五行」小贴士（作者 11-28：精炼旁边一个小贴士，一点开就能看到各种相生相克）
    try { const im = window.WXBOOK && WXBOOK.art && WXBOOK.art('btn_wx'); if (im) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 10; ctx.drawImage(im, TIPB.x - TIPB.r, TIPB.y - TIPB.r, TIPB.r * 2, TIPB.r * 2); ctx.restore(); }
      else { ctx.fillStyle = 'rgba(12,24,31,.95)'; ctx.beginPath(); ctx.arc(TIPB.x, TIPB.y, TIPB.r, 0, 7); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.gold; ctx.stroke(); T('五行', TIPB.x, TIPB.y + 1, 17, C.gold2, KAI(), 700, 'center'); }
      if (UI.tips && window.WXBOOK && WXBOOK.draw) WXBOOK.draw('forge'); } catch (e) {}
    ctx.restore(); }
  const TIPB = { x: 190, y: 60, r: 30 };
  try { S.overlay.push({ draw() { try { draw(); } catch (e) { console.warn('R394', e); try { ctx.restore(); } catch (e2) {} } } }); } catch (e) {}

  async function open(tab, who) { if (UI.open || (typeof battle !== 'undefined' && battle)) return; SMITH = who || '铸剑师'; kitLoad(); artAll(); try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {} try { if (window.IMG_GUARD && IMG_GUARD.bumpMatch) IMG_GUARD.bumpMatch(['fx/fx3_burst_']); } catch (e) {} const lock0 = world.locked, hud0 = S.hud; S.hud = false; world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    UI.open = true; UI.tips = false; UI.t0 = performance.now(); UI.taps.length = 0; UI.arm = null; UI.say = ''; UI.res = null; UI.fx.length = 0; UI.slots = [null, null, null, null, null]; UI.mp = 0; UI.gp = 0; UI.mv = null; if (typeof tab === 'number') UI.tab = tab; snd('ui_open'); let forged = 0;
    try { for (;;) { await nextFrame(); const tp = UI.taps.shift(); if (!tp) continue; if (!kitReady()) continue; if (UI.tips) { UI.tips = false; snd('ui_cancel'); continue; } if (inR(tp, CLOSE)) break;
        if (Math.hypot(tp.x - TIPB.x, tp.y - TIPB.y) <= TIPB.r + 8) { UI.tips = true; snd('ui_confirm'); continue; }
        let hit = false; for (let i = 0; i < TABS.length; i++) if (inR(tp, tabR(i))) { hit = true; if (UI.tab !== i) { UI.tab = i; UI.arm = null; UI.say = ''; UI.mf = 0; UI.mp = 0; UI.gp = 0; UI.mv = null; snd('ui_click'); } } if (hit) continue;
        if (TAP[UI.tab](tp) === 'forged') forged++; } }
    finally { UI.open = false; world.locked = lock0; S.hud = hud0; try { input.tapped = null; } catch (e) {} snd('ui_click'); }
    if (forged && !F().forge_tip && window.SAY_LATER) { F().forge_tip = 1; SAY_LATER(async () => { await say('星旋', '新打的东西在行囊里。点左上角的头像，看看穿在谁身上合适——各人灵根不同，合的十成，不合的八折。'); }); } }
  try { cv.addEventListener('pointerdown', e => { if (!UI.open) return; e.stopImmediatePropagation(); e.preventDefault(); UI.taps.push(toLogical(e)); try { input.tapped = null; } catch (e2) {} }, true); } catch (e) {}

  // 和铸剑师说话：头一回交代炉子的规矩（只说大路数，不说出什么），之后直接开炉
  async function talk() { const f = F();
    if (!f.forge_met) { f.forge_met = 1; await say(SMITH, '宗主家的公子？手伸出来。……茧子是有的，剑没白练。'); await say(SMITH, '广场上人来人往，静不下心。往后我就在这后庭潭边待着，炉子在亭子那头。'); }
    if (!f.forge_pond) { f.forge_pond = 1; await say(SMITH, '这潭水是崖顶雪水落下来的，寒得透骨。剑出了炉，在这里淬一回，锋口不卷。'); await say(SMITH, '往后它就叫淬剑潭。钓竿收了吧，鱼都叫我惊走了。'); }
    if (!f.forge3_met) { f.forge2_met = 1; f.forge3_met = 1;
      await say(SMITH, '妖兽身上的料，五样凑一炉，在阵盘上围成一圈就能开炉。出什么，开了炉才知道。');
      await say(SMITH, '五行的门道不用记——炉边左上角有个「五行」，忘了就点开看看。'); }
    await open(0); }
  window.R394 = { open, talk, isOpen: () => UI.open, UI, RUNE, ARTN, art, sockN, gemsOf, setGem };
})();

// ================= 剑炉和铸剑师摆进云海大亭（Codex R389 的画）=================
// 位置照 Codex 的概念图：亭子西边的石板地上，青铜三足炉靠后，剑架在右后，淬火石槽在左前，铁砧在前，铸剑师站在砧右。
// 作者 11-27 08:30：「把铸剑师搬到青竹小院后面的云海大亭，旁边弄一个炉子」——所以人还是原来那位铸剑师，只是换了地方。
(function () {
  const MAP = 'qingzhu_upper_pavilion'; if (typeof TMAPS === 'undefined' || !TMAPS[MAP] || !TMAPS[MAP].baked || !window.R394 || typeof IMG === 'undefined') return;
  const M = TMAPS[MAP], B = M.baked, F = () => (S.flags = S.flags || {});
  const CW = 660, CH = 460, K = 383 / CW, GX = -300, GY = 560, GW = Math.round(CW * K), GH = Math.round(CH * K), SY = GY + 442 * K;   // 整组图在地图上的位置和大小（图是 2 倍画的）
  const FIRE = { x: 172, y: 6, w: 170, h: 68, n: 4, ms: 150 }, NPC_AT = [-200, 548], SMITH = '铸剑师';   // 11-27 夜作者：铸剑师站在亭前的路口老挡路；11-28 作者：「铸剑师挪到潭水旁边，点铸剑师进入副本」——站到后庭潭边、竹钓台东边的草地上，万妖塔从他这里进
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
  tileSetMap = (orig => function (m) { if (m === MAP) { try { if (window.R283) R283.apply(MAP); block(); } catch (e) { console.warn('R394 block', e); } } const res = orig.apply(this, arguments);
    // 走路实际看的是 world.map.T.block（建图时已经从 B.blocked 抄过去了），这里补上，不然炉子、石槽人能穿过去
    try { if (m === MAP && world.map && world.map.T && world.map.T.block) { const T = world.map.T, cs = T.cs, c0 = T.c0 || 0; for (const [x0, y0, x1, y1] of RECTS) for (let wy = GY + y0 * K; wy <= GY + y1 * K; wy += cs) for (let wx = GX + x0 * K; wx <= GX + x1 * K; wx += cs) { const r = Math.floor(wy / cs), c = Math.floor(wx / cs) - c0; if (T.block[r] && c >= 0 && c < T.block[r].length) T.block[r][c] = 1; } } } catch (e) { console.warn('R394 T.block', e); }
    return res; })(tileSetMap);
  // 铸剑师：就是原来站在演武广场上的那一位（Codex R156 的造型，提锤御剑）——照作者说的，把他搬到云海大亭的剑炉旁。广场上不再站人。
  try { const TF = TMAPS.tj_front; if (TF && Array.isArray(TF.npcs)) TF.npcs = TF.npcs.filter(n => n.name !== SMITH); } catch (e) {}
  M.npcs = M.npcs || []; if (!M.npcs.some(n => n.forge)) { const [c, r] = P(NPC_AT[0], NPC_AT[1]); M.npcs.push({ key: 'c_a2', cx: 'spirit_swordsmith', c, r, wander: false, face: 'down', name: SMITH, forge: 1, talk: () => R394.talk() }); }
  // 点他：直接开剑炉的界面（合成 / 强化 / 镶嵌 / 精炼 / 星纹），不走原来只有「强化装备」的那一层
  if (typeof doInteract === 'function') doInteract = (orig => async function (h) { if (!(h && h.type === 'npc' && h.a && h.a.npc && h.a.npc.forge)) return orig.apply(this, arguments);
    world.locked = true; try { if (window.TOWER && typeof TOWER.enter === 'function') { const i = await choose(SMITH, ['开炉（合成 · 强化 · 镶嵌）', '进万妖塔', '告辞']); if (i === 0) await R394.talk(); else if (i === 1) await TOWER.enter(); } else await R394.talk(); } catch (e) { console.warn('R394 talk', e); } finally { world.locked = false; } })(doInteract);
  // 玉佩里多一桩事迹：开炉
  try { const R = window.R386; if (R && Array.isArray(R.TASKS) && !R.TASKS.some(t => t.id === 'lq1')) { const i = R.TASKS.findIndex(t => t.id === 'x4');
      R.TASKS.splice(i < 0 ? R.TASKS.length : i, 0, { id: 'lq1', cat: '修行', name: '开炉', desc: '带五样材料去云海大亭的剑炉，合成一件东西', n: () => [Math.min(1, F().forged || 0), 1], pts: 30, show: () => !!(F().forged || F().wxj_said), quip: '自己攒料、自己开炉，这才像个修士。料怎么配、五行怎么搭，多试几炉就摸出门道了。' }); } } catch (e) {}
  window.R394.place = { GX, GY, GW, GH, SY, NPC_AT };
})();
