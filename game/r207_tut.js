// ================= R207 · 聚光引导（作者 11-11：所有教程都要有「跳过」）=================
// SPOT.run(steps)：压暗全屏，只挖出当前要点的位置（金框呼吸 + 箭头），顶上一条说明；除了挖空处和「跳过」，别处点了没反应。
// 步骤：{ title, text, rect: () => [x,y,w,h] | null, done: () => bool, tap: true（点到挖空处就算完成）}
// 返回 'done' 或 'skip'
(function () {
  const now = () => performance.now() / 1000;
  const SK = [W - 150, 22, 124, 46];
  let CUR = null;
  const inRect = (p, r) => r && p.x >= r[0] && p.x <= r[0] + r[2] && p.y >= r[1] && p.y <= r[1] + r[3];
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  // 输入：抢在画布之前看一眼
  let blockedDown = false;
  window.addEventListener('pointerdown', e => {
    if (!CUR) return; const c = document.querySelector('canvas'); if (!c || e.target !== c) return;
    const r = c.getBoundingClientRect(), p = { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    if (dialog || sysPanel || choice || (window.ITEMGET_ACTIVE && ITEMGET_ACTIVE()) || (window.R169_SHOP && R169_SHOP.open)) return;   // 11-11 重要 bug：剧情台词 / 面板 / 商店开着时绝不拦点击（之前拦了，台词点不过去就卡住）
    if (inRect(p, SK)) { CUR.skip = true; blockedDown = true; e.stopImmediatePropagation(); e.preventDefault(); try { playSnd('ui_click'); } catch (_) {} return; }
    const st = CUR.steps[CUR.i], R = st && st.rect && st.rect();
    if (R && inRect(p, [R[0] - 10, R[1] - 10, R[2] + 20, R[3] + 20])) { if (st.tap) CUR.tapAt = now(); return; }
    if (!R && (dialog || sysPanel || choice)) return;   // 这一步正在讲话 / 弹面板：放行
    blockedDown = true; e.stopImmediatePropagation(); e.preventDefault();
  }, { capture: true });
  window.addEventListener('pointerup', e => { if (blockedDown) { blockedDown = false; e.stopImmediatePropagation(); } }, { capture: true });
  window.addEventListener('keydown', e => { if (CUR && (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape')) { e.stopImmediatePropagation(); } }, { capture: true });

  const hudWillDraw = () => { try { return !(window.R135G_OPEN && R135G_OPEN()) && S.hud && !(typeof battle !== 'undefined' && battle) && !dialog && !choice && !sysPanel; } catch (e) { return false; } };
  if (typeof drawMapHud === 'function') drawMapHud = (o => function () { const r = o.apply(this, arguments); try { if (hudWillDraw()) ov.paint(); } catch (e) {} return r; })(drawMapHud);   // 菜单在 HUD 里画，引导要盖在菜单上面
  const ov = { draw() { if (!hudWillDraw()) this.paint(); }, paint() {
    if (!CUR) return; const st = CUR.steps[CUR.i]; if (!st) return; const t = now(), R = st.rect && st.rect();
    if (dialog || choice) return;   // 剧情台词在讲：先让台词说完
    ctx.save();
    ctx.fillStyle = 'rgba(6,8,14,.6)'; ctx.beginPath(); ctx.rect(0, 0, W, H);
    if (R) { const [x, y, w, h] = R, m = 8; ctx.moveTo(x - m, y - m); ctx.lineTo(x - m, y + h + m); ctx.lineTo(x + w + m, y + h + m); ctx.lineTo(x + w + m, y - m); ctx.closePath(); }
    ctx.fill('evenodd');
    if (R) { const [x, y, w, h] = R, p = .5 + .5 * Math.sin(t * 5);
      ctx.save(); ctx.shadowColor = '#ffc24a'; ctx.shadowBlur = 18 + 10 * p; ctx.lineWidth = 3 + p * 1.5; ctx.strokeStyle = '#ffd77a'; rr(x - 8, y - 8, w + 16, h + 16, 12); ctx.stroke(); ctx.restore();
      // 箭头：从说明条那边指过来
      const cx = x + w / 2, top = y > H * .45, ay = top ? y - 22 - 8 * p : y + h + 22 + 8 * p;
      ctx.save(); ctx.translate(cx, ay); if (!top) ctx.rotate(Math.PI); ctx.fillStyle = '#ffe08a'; ctx.strokeStyle = 'rgba(60,36,8,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-16, -22); ctx.lineTo(-6, -22); ctx.lineTo(-6, -40); ctx.lineTo(6, -40); ctx.lineTo(6, -22); ctx.lineTo(16, -22); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); }
    // 说明条：放在挖空处的另一半屏
    const bw = 620, bx = (W - bw) / 2, by = R && R[1] + R[3] / 2 < H * .5 ? H - 150 : 96;
    ctx.save(); rr(bx, by, bw, 86, 14); ctx.fillStyle = 'rgba(18,16,24,.92)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(232,194,122,.8)'; ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `26px ${BRUSH}`; ctx.fillStyle = '#ffd77a'; ctx.fillText(st.title || '', bx + 22, by + 26);
    ctx.font = `600 17px ${FONT}`; ctx.fillStyle = '#f1e6cc'; const tx = typeof st.text === 'function' ? st.text() : st.text || ''; ctx.fillText(tx, bx + 22, by + 60);
    ctx.textAlign = 'right'; ctx.font = `600 13px ${FONT}`; ctx.fillStyle = 'rgba(232,210,160,.7)'; ctx.fillText((CUR.i + 1) + ' / ' + CUR.steps.length, bx + bw - 18, by + 26); ctx.restore();
    // 跳过
    ctx.save(); const [sx, sy, sw, sh] = SK; rr(sx, sy, sw, sh, 23); ctx.fillStyle = 'rgba(20,16,12,.85)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(232,194,122,.9)'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `22px ${BRUSH}`; ctx.fillStyle = '#ffe9b8'; ctx.fillText('跳 过 ›', sx + sw / 2, sy + sh / 2 + 1); ctx.restore();
    ctx.restore();
  } };
  window.SPOT = {
    active: () => !!CUR,
    cancel(r) { const C = CUR; if (!C) return; CUR = null; const k = S.overlay.indexOf(ov); if (k >= 0) S.overlay.splice(k, 1); try { C.res(r || 'skip'); } catch (e) {} },
    run(steps) { return new Promise(res => {
      if (CUR) { CUR.res('skip'); }
      CUR = { steps, i: 0, res, skip: false, tapAt: 0, t0: now() }; if (S.overlay.indexOf(ov) < 0) S.overlay.push(ov);
      const iv = setInterval(() => { const C = CUR; if (!C || C.res !== res) { clearInterval(iv); return; }
        const end = r => { clearInterval(iv); CUR = null; const k = S.overlay.indexOf(ov); if (k >= 0) S.overlay.splice(k, 1); res(r); };
        if (C.skip) return end('skip');
        if (S.overlay[S.overlay.length - 1] !== ov) { const k = S.overlay.indexOf(ov); if (k >= 0) S.overlay.splice(k, 1); S.overlay.push(ov); }   // 衣柜之类后开的界面层也盖不住引导
        const st = C.steps[C.i]; let ok = false; try { ok = st.done ? !!st.done() : false; } catch (e) {}
        if (!ok && st.tap && C.tapAt && now() - C.tapAt > .25) ok = true;
        if (ok) { C.i++; C.tapAt = 0; try { playSnd('ui_click'); } catch (e) {} if (C.i >= C.steps.length) return end('done'); }
      }, 100); }); } };

  // ---------- 九天神雷：买下秘卷 → 行囊 → 技能 → 云霆 → 九天神雷 → 参悟（跳过＝直接学会）----------
  const F = () => (S.flags = S.flags || {});
  const tabIx = n => MTABS.indexOf(n);
  const tabR = n => { try { const L = menuLayout(), b = L.tabs[tabIx(n)]; return b ? [b.x, b.y, b.w, b.h] : null; } catch (e) { return null; } };
  const memR = k => { try { const m = menuLayout().members.find(m => m.k === k); return m ? [m.x, m.y, m.w, m.h] : null; } catch (e) { return null; } };
  const nodeR = (who, pred) => { try { if (!S.menu || S.menu.who !== who) return null; const G = window.SKT_GEO && SKT_GEO(); const o = G && G.nodes.find(pred); return o ? [o.x - o.r, o.y - o.r, o.r * 2, o.r * 2 + 22] : null; } catch (e) { return null; } };
  const btnR = () => { try { const G = SKT_GEO(); return [G.btn.x, G.btn.y, G.btn.w, G.btn.h]; } catch (e) { return null; } };
  const BAG = [W - 128, H - 112, 112, 104];
  const isTab = n => S.menu && MTABS[S.menu.tab] === n;
  window.SPOT_STEPS = { tabR, memR, nodeR, btnR, BAG, isTab };
  // 叶孤星：用《剑诀·卷二》把凝神（还没学会就用点星）参悟到第二重（跳过＝直接升）
  window.R207_UP_TUT = async function () {
    const id = (S.hero.skills || []).includes('ningshen') || (window.SK4 && SK4.learned && SK4.learned('hero', 'ningshen')) ? 'ningshen' : 'dianxing', nm = id === 'ningshen' ? '凝神' : '点星';
    const tier = () => { try { return window.SKILL_TIER ? SKILL_TIER('hero', id) : 1; } catch (e) { return 1; } };
    for (let i = 0; i < 600 && ((window.R169_SHOP && R169_SHOP.open) || dialog || sysPanel || choice || world.locked); i++) await sleep(200);
    if (tier() >= 2) return;
    await say('星旋', '卷二到手——先给你自己用。我教你怎么参悟升重：');
    const isN = o => o.n && o.n.id === id;
    const upR = () => { try { const h = window.R154 && R154.hit; const u = h && h.upgrade; return u ? u.rect : null; } catch (e) { return null; } };
    const r = await SPOT.run([
      { title: '打开行囊', text: '点右下角的「行囊」。', rect: () => S.menu ? null : BAG, done: () => !!S.menu },
      { title: '技能页', text: '点左边的「技能」。', rect: () => tabR('技能'), done: () => isTab('技能') },
      { title: '看叶孤星', text: '上面选叶孤星自己的头像。', rect: () => memR('hero'), done: () => isTab('技能') && S.menu.who === 'hero' },
      { title: '找到' + nm, text: '点一下「' + nm + '」。', rect: () => nodeR('hero', isN), done: () => window.SKT_SEL && SKT_SEL() === 'hero.' + id },
      { title: '参悟', text: '右下角「参悟」，打开这一招的详情。', rect: () => window.R154 && R154.state ? null : btnR(), done: () => !!(window.R154 && R154.state) || tier() >= 2 },
      { title: '参悟升重', text: '点「参悟升重」，用掉卷二，' + nm + '升到第二重。', rect: () => upR(), done: () => tier() >= 2 },
    ]);
    if (r === 'skip' && tier() < 2) { try { if (window.SKT && SKT.upgrade) SKT.upgrade('hero', id); } catch (e) {} }
  };
  // 凝元丹：行囊 → 背包 → 选中凝元丹 → 使用（跳过＝直接服下）
  const cellR = id => { try { const L = menuLayout(), c = bagCells(L).find(c => c.id === id); return c ? [c.x, c.y, c.w, c.h] : null; } catch (e) { return null; } };
  const useR = () => { try { const b = useBtn(menuLayout()); return b ? [b.x, b.y, b.w, b.h] : null; } catch (e) { return null; } };
  let pillBusy = false;
  window.R207_PILL_TUT = async function () {
    if (pillBusy || F().ch2_pill || !itemCount('n_ningyuan')) return; pillBusy = true; F().tut_pill = 1;
    try {
      await say('星旋', '睡前先把凝元丹服了。丹药都在行囊里——我教你怎么用：');
      const r = await SPOT.run([
        { title: '打开行囊', text: '点右下角的「行囊」。', rect: () => S.menu ? null : BAG, done: () => !!S.menu },
        { title: '背包', text: '点左边的「背包」。', rect: () => tabR('背包'), done: () => isTab('背包') },
        { title: '找到凝元丹', text: () => cellR('n_ningyuan') ? '点一下凝元丹。' : '上面换到「全部」，找到凝元丹点一下。', rect: () => cellR('n_ningyuan') || (bagTabs(menuLayout()).map(b => [b.x, b.y, b.w, b.h])[0] || null), done: () => isTab('背包') && S.menu.sel === 'n_ningyuan' },
        { title: '服下', text: '点「使用」，服下凝元丹。', rect: () => useR(), done: () => !!F().ch2_pill },
      ]);
      if (r === 'skip' && !F().ch2_pill) { try { if (S.menu) closeMenu(); } catch (e) {} if (window.CH2_EAT_PILL) await CH2_EAT_PILL(); }
    } finally { pillBusy = false; }
  };
  // 流云仙衣：行囊 → 换装 → 穿上流云仙衣 → 换回弟子服 → 再穿回（跳过＝直接整套穿上）
  const cardR = id => { try { if (!(window.R135G_OPEN && R135G_OPEN())) return null; return id === 'baipao' ? [852, 154, 374, 187] : [852, 364, 374, 187]; } catch (e) { return null; } };
  const wearing = () => { try { return window.YEGX_OUTFIT ? YEGX_OUTFIT.get() : ''; } catch (e) { return ''; } };
  window.R207_OUTFIT_TUT = async function () {
    if (F().tut_outfit) return; F().tut_outfit = 1;
    await say('星旋', '仙衣能幻化成任何模样。穿什么样子你自己挑——我教你在哪儿换：');
    const wardOrTab = () => (window.R135G_OPEN && R135G_OPEN()) ? null : tabR('换装');
    const r = await SPOT.run([
      { title: '打开行囊', text: '点右下角的「行囊」。', rect: () => S.menu ? null : BAG, done: () => !!S.menu },
      { title: '换装', text: '点左边的「换装」。', rect: () => wardOrTab(), done: () => !!(window.R135G_OPEN && R135G_OPEN()) || isTab('换装') },
      { title: '穿上流云仙衣', text: '点「流云仙衣」那张卡，整套换上。', rect: () => cardR('guxing'), done: () => wearing() === 'guxing' },
      { title: '换回来试试', text: '再点「天剑弟子服」——随时都能换回来。', rect: () => cardR('baipao'), done: () => wearing() === 'baipao' },
      { title: '想穿哪套就穿哪套', text: '最后再点「流云仙衣」穿回白衣。', rect: () => cardR('guxing'), done: () => wearing() === 'guxing' },
    ]);
    if (r === 'skip' || wearing() !== 'guxing') { try { if (window.YEGX_OUTFIT) YEGX_OUTFIT.set('guxing'); } catch (e) {} }
    try { const C = window.R135G_CUR && R135G_CUR(); if (C && C.close) { C.close(); C.res && C.res(); } } catch (e) {}
    try { if (S.menu) closeMenu(); } catch (e) {}
  };
  let jtBusy = false;
  window.R207_JT_TUT = async function () {
    if (F().yt_jiutian || jtBusy) return; jtBusy = true; try {
    for (let i = 0; i < 600 && ((window.R169_SHOP && R169_SHOP.open) || dialog || sysPanel || choice || world.locked); i++) await sleep(200);   // 等商店关了、剧情空闲再教
    if (F().yt_jiutian) return;
    await say('星旋', '秘卷到手了——别光揣着，得让云霆参悟了才算数。我教你一遍：');
    const isJT = o => o.n && o.n.name === '九天神雷';
    const r = await SPOT.run([
      { title: '打开行囊', text: '点右下角的「行囊」。', rect: () => S.menu ? null : BAG, done: () => !!S.menu },
      { title: '技能页', text: '点左边的「技能」。', rect: () => tabR('技能'), done: () => isTab('技能') },
      { title: '换到云霆', text: '点上面云霆的头像，看他的技能。', rect: () => memR('yunting'), done: () => isTab('技能') && S.menu.who === 'yunting' },
      { title: '找到九天神雷', text: '「秘传」一列里就是九天神雷，点一下它。', rect: () => nodeR('yunting', isJT), done: () => window.SKT_SEL && /^yunting\.ult$/.test(SKT_SEL() || '') },
      { title: '参悟', text: '右下角「参悟」——用掉秘卷，云霆就学会了。', rect: () => btnR(), done: () => !!F().yt_jiutian },
    ]);
    if (r === 'skip' && !F().yt_jiutian && window.R134_YT_LEARN) { try { if (S.menu && typeof closeMenu === 'function') closeMenu(); } catch (e) {} await R134_YT_LEARN(); }
    } finally { jtBusy = false; }
  };
})();

// ================= 作者 11-11：天剑宗地图上，主角脚下有金色方向箭头指向任务目标（和寒星剑那个一样）；集市采买时要找的掌柜头顶一束巨大的金光 =================
(function () {
  const F = () => (S.flags = S.flags || {});
  const TJ = m => /^(tj_|qingzhu)/.test(m || '');
  let TGT = null, tAt = 0;
  const target = () => { const t = performance.now(); if (t - tAt > 400) { tAt = t; TGT = window.QUEST_NAV && QUEST_NAV.target ? QUEST_NAV.target() : null; } return TGT; };
  function arrow(p, b) {
    const dx = b[0] - p.x, dy = b[1] - p.y, d = Math.hypot(dx, dy); if (d < 110) return;
    const a = Math.atan2(dy, dx), t = performance.now() / 1000, fade = Math.min(1, (d - 110) / 160);
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, .5);
    ctx.globalAlpha = .8 * fade; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(60,36,8,.5)'; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.stroke();
    ctx.lineWidth = 3.2; ctx.strokeStyle = '#ffd25a'; ctx.shadowColor = '#ffb43a'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.stroke();
    ctx.rotate(a);
    for (let i = 0; i < 3; i++) { const k = (t * 1.6 - i * .28) % 1, al = Math.max(0, Math.sin(Math.PI * Math.max(0, k))), x = 78 + i * 38; ctx.globalAlpha = fade * (.55 + .45 * al);
      ctx.beginPath(); ctx.moveTo(x + 24, 0); ctx.lineTo(x - 8, -20); ctx.lineTo(x + 1, 0); ctx.lineTo(x - 8, 20); ctx.closePath();
      ctx.shadowBlur = 0; ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(60,36,8,.6)'; ctx.stroke(); ctx.shadowColor = '#ffb43a'; ctx.shadowBlur = 14; ctx.fillStyle = al > .6 ? '#fff4c4' : '#ffd25a'; ctx.fill(); }
    ctx.restore(); }
  // 掌柜头顶的巨大金光
  const KEEPER = { 丹药铺: '老丹师', 典籍阁: '老修士' };
  // window.R207_SHOP_TARGET 由 r134_fix 的采买单给：() => { shop, label } / null
  function bigBeacon(a, label) {
    const t = performance.now() / 1000, p = .5 + .5 * Math.sin(t * 3), top = a.y - (a.h || 108) - 30;
    ctx.save();
    // 光柱
    const g = ctx.createLinearGradient(0, top - 360, 0, a.y); g.addColorStop(0, 'rgba(255,214,110,0)'); g.addColorStop(.6, 'rgba(255,214,110,' + (.22 + .12 * p) + ')'); g.addColorStop(1, 'rgba(255,236,170,' + (.35 + .15 * p) + ')');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(a.x - 34, a.y); ctx.lineTo(a.x - 70, top - 360); ctx.lineTo(a.x + 70, top - 360); ctx.lineTo(a.x + 34, a.y); ctx.closePath(); ctx.fill();
    // 脚下光圈
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(1, .42); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,220,120,' + (.55 + .35 * p) + ')'; ctx.shadowColor = '#ffc24a'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(0, 0, 70 + 10 * p, 0, 7); ctx.stroke(); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    // 头顶大菱形 + 字
    const by = top - 40 - 10 * Math.sin(t * 2.4);
    ctx.save(); ctx.translate(a.x, by); ctx.shadowColor = '#ffb43a'; ctx.shadowBlur = 26 + 12 * p;
    ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(28, 0); ctx.lineTo(0, 34); ctx.lineTo(-28, 0); ctx.closePath(); ctx.fillStyle = '#ffd25a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff4c4'; ctx.stroke();
    ctx.shadowBlur = 0; ctx.font = `30px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5a2a08'; ctx.fillText('买', 0, 2); ctx.restore();
    if (label) { ctx.font = `600 18px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const w = ctx.measureText(label).width + 28; ctx.fillStyle = 'rgba(20,14,6,.82)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(a.x - w / 2, by - 70, w, 30, 15) : ctx.rect(a.x - w / 2, by - 70, w, 30); ctx.fill(); ctx.fillStyle = '#ffe9b8'; ctx.fillText(label, a.x, by - 55); }
    ctx.restore(); }
  drawActorT = (o => function (a) {
    const free = !(typeof battle !== 'undefined' && battle);
    try { if (free && a === world.player && TJ(world.mapName) && window.R134_SHOPPING && R134_SHOPPING() && !world.locked && S.quest &&   /* 作者 11-11：地上箭头只在「第一次拿寒星剑」（r200）和「集市采买到下山」这两段出现 */ !(window.HANXING_GUIDE && HANXING_GUIDE.need())) { const b = target(); if (b) arrow(a, b); } } catch (e) {}
    const r = o.apply(this, arguments);
    return r;
  })(drawActorT);
  // 掌柜本人是烘在地图里的（actor 是隐形的），所以在地面物件都画完之后单独画一遍光
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function () { const r = o.apply(this, arguments);
    try { if (!(typeof battle !== 'undefined' && battle) && window.R207_SHOP_TARGET && world.mapName === 'tj_market') { const s = R207_SHOP_TARGET();
      const a = s && (world.actors || []).find(a => a.npc && a.npc.name === KEEPER[s.shop]); if (a) { ctx.save(); ctx.translate(a.x, a.y); ctx.scale(1.55, 1.55); bigBeacon({ x: 0, y: 0, h: 70 }, s.label); ctx.restore(); } } } catch (e) {}
    return r; })(tileAmbientHigh);
})();

// ================= 作者 11-11：第一次采买时商店里的引导 —— 空白条写「要买什么、买几个」，要买的那格发光、别的压暗，数量先填好，「购」发光；有跳过 =================
(function () {
  const NICHE = [[385, 161, 214, 130], [620, 161, 213, 130], [385, 333, 214, 130], [620, 333, 213, 130]], BUY = [1090, 578, 79, 78], STRIP = [445, 524, 335, 30], SKIP = [905, 586, 120, 40];
  let off = false, lastOpen = false, lastSel = null, lastTgt = null;
  const want = () => { if (off || (window.ITEMGET_ACTIVE && ITEMGET_ACTIVE()) || !window.R169_SHOP || !R169_SHOP.open || !window.R207_SHOP_TARGET) return null; const s = R207_SHOP_TARGET(), st = R169_SHOP.st; if (!s || !st || st.mode !== 'buy' || !st.ids.includes(s.id)) return null; return { s, st }; };
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  const ov = { draw() {
    const W0 = want(); if (!W0) return; const { s, st } = W0, t = performance.now() / 1000, p = .5 + .5 * Math.sin(t * 5);
    const k = st.ids.indexOf(s.id);
    if (Math.floor(k / 4) !== st.page) return;   // 翻到别页了：不画
    const N = NICHE[k % 4];
    ctx.save();
    // 别的格子压暗
    for (let i = 0; i < 4; i++) if (i !== k % 4 && st.ids[st.page * 4 + i]) { const r = NICHE[i]; ctx.fillStyle = 'rgba(10,8,6,.55)'; rr(r[0], r[1], r[2], r[3] + 36, 10); ctx.fill(); }
    // 要买的那格金框
    ctx.save(); ctx.shadowColor = '#ffc24a'; ctx.shadowBlur = 18 + 10 * p; ctx.lineWidth = 3 + 1.5 * p; ctx.strokeStyle = '#ffd77a'; rr(N[0] - 4, N[1] - 4, N[2] + 8, N[3] + 44, 12); ctx.stroke(); ctx.restore();
    // 购 发光
    if (st.sel === s.id) { ctx.save(); ctx.shadowColor = '#ffd25a'; ctx.shadowBlur = 22 + 14 * p; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,226,140,' + (.6 + .4 * p) + ')'; rr(BUY[0] - 6, BUY[1] - 6, BUY[2] + 12, BUY[3] + 12, 14); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(BUY[0] + BUY[2] / 2, BUY[1] - 16 - 6 * p); ctx.fillStyle = '#ffe08a'; ctx.strokeStyle = 'rgba(60,36,8,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-12, -16); ctx.lineTo(-4, -16); ctx.lineTo(-4, -30); ctx.lineTo(4, -30); ctx.lineTo(4, -16); ctx.lineTo(12, -16); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); }
    // 空白条里的说明
    ctx.fillStyle = 'rgba(60,34,14,.92)'; rr(STRIP[0], STRIP[1], STRIP[2], STRIP[3], 8); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(232,194,122,.8)'; ctx.stroke();
    ctx.font = `600 16px "R201WK",${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9b8';
    ctx.fillText(st.sel === s.id ? '要买：' + s.name + ' ×' + s.left + '　数量已填好，点右下「购」' : '要买：' + s.name + ' ×' + s.left + '　先点发光的那一格', STRIP[0] + STRIP[2] / 2, STRIP[1] + STRIP[3] / 2 + 1);
    // 跳过
    ctx.fillStyle = 'rgba(30,20,10,.85)'; rr(SKIP[0], SKIP[1], SKIP[2], SKIP[3], 20); ctx.fill(); ctx.strokeStyle = 'rgba(232,194,122,.9)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `20px ${BRUSH}`; ctx.fillStyle = '#ffe9b8'; ctx.fillText('跳过引导', SKIP[0] + SKIP[2] / 2, SKIP[1] + SKIP[3] / 2 + 1);
    ctx.restore();
  } };
  // 每帧：商店一开就把这层压到最上面；选中目标时把数量填成还差几个
  setInterval(() => { try {
    const o = !!(window.R169_SHOP && R169_SHOP.open); if (o && !lastOpen) { const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1); S.overlay.push(ov); lastSel = null; } if (!o) { const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1); } lastOpen = o;
    const W0 = want(); if (!W0) return; const { s, st } = W0, k = st.ids.indexOf(s.id);
    if (S.overlay[S.overlay.length - 1] !== ov) { const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1); S.overlay.push(ov); }   // 商店关了获得物品框后会把自己那层重新压上来
    if (lastSel === null || lastTgt !== s.id) { st.page = Math.floor(k / 4); st.sel = s.id; lastTgt = s.id; lastSel = ''; }
    if (st.sel === s.id && lastSel !== s.id + ':' + s.left) { st.qty = s.left; lastSel = s.id + ':' + s.left; } else if (st.sel !== s.id && lastSel && lastSel.indexOf(':') > 0) lastSel = '';
  } catch (e) {} }, 60);
  // 跳过：点到就关掉这次采买的商店引导
  window.addEventListener('pointerdown', e => { if (!want()) return; const c = document.querySelector('canvas'); if (!c || e.target !== c) return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
    if (x >= SKIP[0] && x <= SKIP[0] + SKIP[2] && y >= SKIP[1] && y <= SKIP[1] + SKIP[3]) { off = true; e.stopImmediatePropagation(); e.preventDefault(); try { playSnd('ui_click'); } catch (_) {} } }, { capture: true });
})();

// ================= 作者 11-11：星影木人试剑 —— 只能放该放的那招（先破军·天璇，再贪狼·追魂直到成功），别的全部锁住；右上角「跳过」=====
(function () {
  const isSpar = b => b && b.cfg && (b.cfg.title === '青竹小院 · 试剑' || b.cfg.title === '小院 · 练剑');
  const want = b => { if (!isSpar(b)) return null; if (!b._tlTaught) return 'pojun'; if (b.tanlangUsed > 0) return null; return 'tanlang'; };
  const NM = { pojun: '破军剑意 · 天璇', tanlang: '贪狼剑意 · 追魂' };
  const SK = [W - 150, 22, 124, 46];
  const lockMsg = k => toast('现在只能放「' + NM[k] + '」——点「仙术」找发光的那一招', 1800);
  if (typeof heroSkills === 'function') heroSkills = (o => function () { const L = o.apply(this, arguments); try { const b = battle, k = want(b); if (k && b.P && !b.P.ally) for (const s of L) if (s && s.k !== k) { s.disabled = true; s.why = '现在只能放「' + NM[k] + '」'; } } catch (e) {} return L; })(heroSkills);
  let MINE = null;
  const wrapAct = () => { if (typeof doHeroAction === 'function' && doHeroAction !== MINE) MINE = doHeroAction = (o => async function (k) { try { const b = battle, w = want(b); if (w && b && b.P && !b.P.ally && k !== w) { lockMsg(w); if (b.state !== 'menu') { b.state = 'menu'; b.menu = { sel: null, sub: null }; } return; } } catch (e) {} return o.apply(this, arguments); })(doHeroAction); };
  setInterval(wrapAct, 500);   // 别的脚本在 load 之后还会再包一层 doHeroAction：始终保持这层在最外面（试剑时才拦）   // r106 在 load 后才包一层，要包在它外面
  function skip() { const b = battle; if (!isSpar(b)) return; try { if (!S.hero.skills.includes('pojun')) S.hero.skills.push('pojun'); if (!S.hero.skills.includes('tanlang')) S.hero.skills.push('tanlang'); } catch (e) {}
    b._tlTaught = true; b.tanlangUsed = Math.max(1, b.tanlangUsed || 0); b._g207skip = 1; for (const e of b.enemies) { e.hp = 0; e.alive = false; } toast('已跳过试剑', 1400); b.state = 'act'; b.menu = null; Promise.resolve().then(() => afterAct()).catch(e => console.warn('skip', e)); }
  drawBattle = (o => function () { const r = o.apply(this, arguments); try { const b = battle; if (!want(b) || b._g207skip) return r;
    ctx.save(); const [x, y, w, h] = SK; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 23) : ctx.rect(x, y, w, h); ctx.fillStyle = 'rgba(20,16,12,.85)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(232,194,122,.9)'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `22px ${BRUSH}`; ctx.fillStyle = '#ffe9b8'; ctx.fillText('跳 过 ›', x + w / 2, y + h / 2 + 1); ctx.restore(); } catch (e) {} return r; })(drawBattle);
  window.addEventListener('pointerdown', e => { try { const b = typeof battle !== 'undefined' && battle; if (!want(b) || b._g207skip || dialog || sysPanel) return; const c = document.querySelector('canvas'); if (!c || e.target !== c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
    if (x >= SK[0] && x <= SK[0] + SK[2] && y >= SK[1] && y <= SK[1] + SK[3]) { e.stopImmediatePropagation(); e.preventDefault(); skip(); } } catch (_) {} }, { capture: true });
})();
