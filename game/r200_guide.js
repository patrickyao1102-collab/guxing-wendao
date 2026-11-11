// ================= R200 · 新手引导（作者 11-11）=================
// ① 「第一次拿寒星剑的时候除了有那个光效以外，还可以增加光标方向指引地上，这样玩家就知道要去哪个方向」
//    → 后山去溪边岩隙取剑期间，主角脚下一圈金色方向箭头，始终指向宝箱（离得近了就淡掉）
// ② 「第一次出现任务的时候，引导玩家去使用任务按钮，让他们知道按钮可以展开、收起，可以自动寻路」
//    → 第一次在地图上看到任务栏时：压暗四周、圈出任务栏，分两步讲「点任务＝自动寻路」「点剑徽＝收起 / 再点展开」，点一下进下一步
// ③ 「第一次去打星影木人的时候，引导玩家去放什么技能，不然没玩过的人一直不放两遍，一直结束不了剧情」
//    → 青竹小院试剑：顶上一条金字提示当前该做什么；打开仙术列表时，该放的那招整行金框闪烁 + 箭头
(function () {
  if (typeof drawActorT !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const now = () => performance.now() / 1000;
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

  // ---------- ① 寒星剑：地上方向箭头 ----------
  let BOX = null;
  const boxPos = () => { if (BOX) return BOX; try { const n = TMAPS.tj_houshan.npcs.find(n => n.name === '溪边岩隙宝箱'); if (n) BOX = [(n.c + .5) * 64, (n.r + .5) * 64]; } catch (e) {} return BOX; };
  function groundArrow(p) {
    const b = boxPos(); if (!b) return; const dx = b[0] - p.x, dy = b[1] - p.y, d = Math.hypot(dx, dy); if (d < 90) return;
    const a = Math.atan2(dy, dx), t = now(), fade = Math.min(1, (d - 90) / 160);
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, .5);   // 贴地：竖向压扁
    // 脚下光圈（白石地上也要看得见：深色描边 + 金色）
    ctx.globalAlpha = .85 * fade; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(60,36,8,.55)'; ctx.beginPath(); ctx.arc(0, 0, 62, 0, 7); ctx.stroke();
    ctx.lineWidth = 3.5; ctx.strokeStyle = '#ffd25a'; ctx.shadowColor = '#ffb43a'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(0, 0, 62, 0, 7); ctx.stroke();
    // 三枚依次亮起的箭头
    ctx.rotate(a);
    for (let i = 0; i < 3; i++) { const k = (t * 1.6 - i * .28) % 1, al = Math.max(0, Math.sin(Math.PI * Math.max(0, k)));
      const x = 80 + i * 40; ctx.globalAlpha = fade * (.55 + .45 * al);
      ctx.beginPath(); ctx.moveTo(x + 26, 0); ctx.lineTo(x - 8, -22); ctx.lineTo(x + 1, 0); ctx.lineTo(x - 8, 22); ctx.closePath();
      ctx.shadowBlur = 0; ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(60,36,8,.6)'; ctx.stroke();
      ctx.shadowColor = '#ffb43a'; ctx.shadowBlur = 14; ctx.fillStyle = al > .6 ? '#fff4c4' : '#ffd25a'; ctx.fill(); }
    ctx.restore();
  }
  drawActorT = (o => function (a) {
    try { if (a && a === world.player && window.HANXING_GUIDE && HANXING_GUIDE.need() && !(typeof battle !== 'undefined' && battle)) groundArrow(a); } catch (e) {}
    return o.apply(this, arguments);
  })(drawActorT);

  // ---------- ② 第一次出现任务：教任务栏 ----------
  const TUT = { on: false, step: 0, t0: 0 };
  const STEPS = [
    ['这是任务栏', '当前要做的事写在这里。点一下任务，叶孤星会自动寻路走过去。', 'main'],
    ['展开 / 收起', '点「展开」能看全部任务和支线，再点一次就收起。', 'btn'],
    ['不想挡画面？', '点左上角的剑徽，任务栏缩成一个小标记；想看时点小标记就回来。', 'mini'],
  ];
  const freeMap = () => { try { return world.map && world.player && S.scene === drawMap && !world.locked && !(typeof battle !== 'undefined' && battle) && !dialog && !choice && !sysPanel && !S.menu; } catch (e) { return false; } };
  setInterval(() => {
    try {
      if (TUT.on || F().tut_quest || !S.quest || !freeMap()) return;
      const Q = window.R165Q; if (!Q || !Q.ready() || !Q.UI) return;
      Q.UI.mini = false; Q.UI.open = false; Q.UI.peekUntil = performance.now() + 60000; Q.UI.touchAt = performance.now();   // 先把卡片弹出来
      Object.assign(TUT, { on: true, step: 0, t0: now() }); world.locked = true; try { playSnd('ui_open'); } catch (e) {}
    } catch (e) {}
  }, 700);
  function drawTut() {
    if (!TUT.on) return; const Q = window.R165Q, P = Q && Q.UI && Q.UI.panel; const t = now();
    if (Q && Q.UI) { Q.UI.mini = false; Q.UI.peekUntil = performance.now() + 2000; Q.UI.touchAt = performance.now(); }
    ctx.save();
    // 压暗，任务栏处挖空
    ctx.fillStyle = 'rgba(6,8,14,.58)'; ctx.beginPath(); ctx.rect(0, 0, W, H);
    if (P) { const [x, y, w, h] = P; ctx.moveTo(x - 8, y - 8); ctx.lineTo(x - 8, y + h + 8); ctx.lineTo(x + w + 8, y + h + 8); ctx.lineTo(x + w + 8, y - 8); ctx.closePath(); }
    ctx.fill('evenodd');
    if (P) { const [x, y, w, h] = P, pu = .6 + .4 * Math.sin(t * 5); ctx.strokeStyle = `rgba(255,224,138,${pu})`; ctx.lineWidth = 3; ctx.shadowColor = '#ffd36a'; ctx.shadowBlur = 16; rr(x - 8, y - 8, w + 16, h + 16, 12); ctx.stroke(); ctx.shadowBlur = 0;
      const want = STEPS[TUT.step][2], H0 = (Q.UI.hits || []).find(h => want === 'btn' ? !['mini', 'main', 'peek'].includes(h.a) : h.a === want);
      if (H0 && want !== 'main') { const [hx, hy, hw, hh] = H0.r; ctx.strokeStyle = `rgba(255,246,210,${pu})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx + hw / 2, hy + hh / 2, hw / 2 + 10 + 3 * Math.sin(t * 6), hh / 2 + 8 + 3 * Math.sin(t * 6), 0, 0, 7); ctx.stroke(); } }
    // 说明卡
    const [ti, tx] = STEPS[TUT.step], bw = 520, bh = 132, bx = P ? Math.max(40, P[0] - bw - 30) : W / 2 - bw / 2, by = P ? Math.min(H - bh - 40, P[1] + 20) : H / 2 - bh / 2;
    ctx.fillStyle = 'rgba(28,20,12,.94)'; rr(bx, by, bw, bh, 14); ctx.fill(); ctx.strokeStyle = 'rgba(214,176,96,.9)'; ctx.lineWidth = 2; rr(bx, by, bw, bh, 14); ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `30px ${BRUSH}`; ctx.fillStyle = '#ffe2a0'; ctx.fillText(ti, bx + 24, by + 44);
    ctx.font = `600 18px ${FONT}`; ctx.fillStyle = '#f3e6cc'; const lines = wrapLines(tx, bw - 48); lines.forEach((l, i) => ctx.fillText(l, bx + 24, by + 76 + i * 26));
    ctx.font = `15px ${FONT}`; ctx.fillStyle = 'rgba(243,230,204,.6)'; ctx.textAlign = 'right'; ctx.fillText(TUT.step < STEPS.length - 1 ? '点屏幕继续（' + (TUT.step + 1) + ' / ' + STEPS.length + '）' : '点屏幕开始', bx + bw - 20, by + bh - 14);
    // 指向任务栏的箭头
    if (P) { const ax = bx + bw + 6, ay = by + 40 + 6 * Math.sin(t * 5); ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.moveTo(ax + 20, ay); ctx.lineTo(ax, ay - 12); ctx.lineTo(ax, ay + 12); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  function wrapLines(s, w) { const out = []; let cur = ''; for (const ch of s) { if (ctx.measureText(cur + ch).width > w) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur); return out; }
  updateMap = (o => function () {
    if (TUT.on) { const t = consumeTap(); if (t && now() - TUT.t0 > .5) { TUT.step++; TUT.t0 = now(); try { playSnd('ui_click'); } catch (e) {}
        if (TUT.step >= STEPS.length) { TUT.on = false; F().tut_quest = 1; world.locked = false; try { const Q = R165Q.UI; Q.peekUntil = performance.now() + 4000; } catch (e) {} } }
      return; }
    return o.apply(this, arguments);
  })(updateMap);
  if (typeof drawMapHud === 'function') drawMapHud = (o => function () { const r = o.apply(this, arguments); try { drawTut(); } catch (e) {} return r; })(drawMapHud);

  // ---------- ③ 星影木人试剑：该放哪招 ----------
  const isSpar = b => b && b.cfg && (b.cfg.title === '青竹小院 · 试剑' || b.cfg.title === '小院 · 练剑');
  // tanlangFails 开场是 1（剧情安排第一次必失控），失控一次后变 0
  function skName(b, k, def) { b._g200n = b._g200n || {}; if (!b._g200n[k]) { try { const L = (b.menu && b.menu.sub) || heroSkills(); const s = L.find(x => x.k === k); if (s) b._g200n[k] = s.name; } catch (e) {} } return b._g200n[k] || def; }
  function sparTarget(b) {
    if (!b._tlTaught) return { k: 'pojun', tip: '第一步：点「仙术」，选中「' + skName(b, 'pojun', '破军剑意') + '」，再点「施展」' };
    if (b.tanlangUsed > 0) return null;
    const n = skName(b, 'tanlang', '贪狼剑意');
    if (b.tanlangFails > 0) return { k: 'tanlang', tip: '第二步：点「仙术」，放「' + n + '」（第一次会失控，正常）' };
    return { k: 'tanlang', tip: '失控很正常！再点「仙术」放一次「' + n + '」，这次就成' };
  }
  // R86 技能列表整体缩 0.8 画（点击坐标反算），圈框要换回画面坐标
  const scr = R => { const Z = window.R86_SCALE; if (!Z || !(window.R86_READY && R86_READY()) || R.x < -1000) return R; return { x: Z.AX + (R.x - Z.AX) * Z.K, y: Z.AY + (R.y - Z.AY) * Z.K, w: R.w * Z.K, h: R.h * Z.K }; };
  drawBattle = (o => function () {
    const r = o.apply(this, arguments);
    try { const b = battle; if (!isSpar(b) || dialog || sysPanel) return r; const g = sparTarget(b); if (!g) return r; const t = now();
      ctx.save();
      // 顶部提示条
      ctx.font = `600 22px ${FONT}`; const tw = ctx.measureText(g.tip).width + 60, x = W / 2 - tw / 2, y = 84;
      ctx.fillStyle = 'rgba(20,14,8,.82)'; rr(x, y, tw, 46, 23); ctx.fill(); ctx.strokeStyle = `rgba(255,224,138,${.6 + .4 * Math.sin(t * 4)})`; ctx.lineWidth = 2; rr(x, y, tw, 46, 23); ctx.stroke();
      ctx.fillStyle = '#ffe9b0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g.tip, W / 2, y + 24);
      // 还在十字菜单：圈出「技」
      if (b.state === 'menu' && b.menu && !b.menu.sub) { const RG = window.R86_RING, rp = RG && RG.on() && RG.pos('skill'), it = !rp && typeof MENU !== 'undefined' && MENU.find(m => m.k === 'skill'), c = menuCenter();
        if (rp || it) { const x = rp ? rp.x : c.x + it.dx * 100, y = rp ? rp.y : c.y + it.dy * 92, pu = .75 + .25 * Math.sin(t * 6); ctx.strokeStyle = `rgba(255,224,138,${pu})`; ctx.lineWidth = 4; ctx.shadowColor = '#ffd36a'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(x, y, (rp ? RG.r + 12 : 60) + 5 * Math.sin(t * 6), 0, 7); ctx.stroke(); ctx.shadowBlur = 0;
          const ay = y - (rp ? RG.r + 44 : 78) - 8 * Math.abs(Math.sin(t * 5)); ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.moveTo(x, ay + 22); ctx.lineTo(x - 15, ay); ctx.lineTo(x + 15, ay); ctx.closePath(); ctx.fill(); } }
      // 技能列表打开时：圈出该放的那招
      if (b.state === 'menu' && b.menu && b.menu.sub) { const i = b.menu.sub.findIndex(s => s.k === g.k); const R0 = i >= 0 ? skillRects()[i] : null, R = R0 && scr(R0);
        if (R && R.x > -1000) { const pu = .75 + .25 * Math.sin(t * 6); ctx.strokeStyle = `rgba(255,224,138,${pu})`; ctx.lineWidth = 4; ctx.shadowColor = '#ffd36a'; ctx.shadowBlur = 18; rr(R.x - 4, R.y - 4, R.w + 8, R.h + 8, 12); ctx.stroke(); ctx.shadowBlur = 0;
          const ax = R.x - 18 - 8 * Math.sin(t * 6), ay = R.y + R.h / 2; ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 24, ay - 15); ctx.lineTo(ax - 24, ay + 15); ctx.closePath(); ctx.fill(); } }
      ctx.restore(); } catch (e) {}
    return r;
  })(drawBattle);
})();
