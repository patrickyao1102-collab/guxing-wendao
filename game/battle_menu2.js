// ================= 战斗指令菜单 v2：仙术 / 绝技 / 攻击 / 防御 / 道具 / 逃跑 =================
// 六块漆金令牌沿一道弧排在当前出手角色的左侧，依次滑出；绝技怒气满时金光流转；不能用的令牌变暗并写明原因。
// 只换外观和点选，出招逻辑沿用原来的（点到哪块令牌，就等于点了原十字菜单上对应的那个字）。
// 逃跑（总策划）：只有野外遇敌能逃；首领战、剧情战不能逃。成功率 = 55% + (我方速度 − 敌方平均速度) × 2.5%，限制在 30%–90%；失败本回合作废。
(function () {
  if (typeof drawBattleMenu !== 'function' || typeof handleMenuTap !== 'function') return;
  const CMDS = [
    { k: 'mi', label: '秘传' }, { k: 'skill', label: '仙术' }, { k: 'atk', label: '攻击' },
    { k: 'def', label: '防御' }, { k: 'item', label: '道具' }, { k: 'flee', label: '逃跑' },
  ];
  const OLD = { atk: [0, 0], skill: [-1, 0], ult: [0, -1], def: [1, 0], item: [0, 1] };   // 原十字菜单的位置（转发点选用）
  const R79 = () => window.R79_READY && R79_READY();   // Codex R79「玉牌剑阵」素材到齐就换成玉牌
  let PW = 176, PH = 58, GAP = 10;
  let shownAt = 0, lastActive = null;
  const fleeOK = b => !!(b && b.cfg && b.cfg.flee && !b.cfg.boss && !b.cfg.cannotLose);
  function layout() {
    if (R79()) { PW = 300; PH = 84; GAP = 2; } else { PW = 176; PH = 58; GAP = 10; }
    const b = battle, c = menuCenter(), n = CMDS.length, top = R79() ? 138 : Math.max(70, Math.min(H - 120 - n * (PH + GAP), c.y - (n * (PH + GAP)) / 2 + 10));
    const ax = R79() ? 610 : Math.min(W - PW - 250, c.x - 40);
    return CMDS.map((it, i) => { const u = (i - (n - 1) / 2) / ((n - 1) / 2); return { ...it, x: ax - (R79() ? 30 : 46) * (1 - u * u), y: top + i * (PH + GAP), w: PW, h: PH }; });
  }
  function state(it) {
    const b = battle, P = b.P;
    // 叶孤星没有怒气绝技（太阳是「仙术」里的无上境剑诀）；借力一战时金光提示落在「仙术」上
    if (it.k === 'mi') { const r = Math.floor(P.rage || 0), L = window.MIZHUAN_LIST ? MIZHUAN_LIST() : [], ok = L.some(x => !x.disabled); return { on: ok, note: P.ally ? (r >= 100 ? '怒气已满' : '怒气 ' + r + '/100') : (ok ? '秘传可用' : '尚无秘传'), glow: P.ally && r >= 100 }; }
    if (it.k === 'skill' && !P.ally && b.cfg.allowUlt) return { on: true, note: '太阳 · 星旋借力', glow: true };
    if (it.k === 'item') { const n = S.hero.potions ?? 3; return { on: n > 0, note: '丹药 ×' + n }; }
    if (it.k === 'flee') { const ok = fleeOK(b); return { on: ok, note: ok ? '野外可逃' : '此战不可逃' }; }
    if (it.k === 'skill') return { on: true, note: '灵力 ' + Math.floor(P.mp || 0) };
    if (it.k === 'def') return { on: true, note: '减伤·回灵' };
    return { on: true, note: '' };
  }
  // ---------- 小图标（纯代码画）----------
  function icon(k, x, y, s, col) {
    if (window.UI_ICONS && UI_ICONS.draw('cmd_' + (k === 'mi' ? 'ult' : k), x, y, 22)) return;
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (k === 'atk') { ctx.rotate(-.78); ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(3, -s + 5); ctx.lineTo(3, s * .45); ctx.lineTo(-3, s * .45); ctx.lineTo(-3, -s + 5); ctx.closePath(); ctx.fill(); ctx.fillRect(-8, s * .45, 16, 3); ctx.fillRect(-1.5, s * .45 + 3, 3, s * .4); }
    else if (k === 'skill') { for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2 + .4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * .2, -s * .5, 0, -s); ctx.quadraticCurveTo(-s * .2, -s * .5, 0, 0); ctx.fill(); ctx.restore(); } ctx.beginPath(); ctx.arc(0, 0, s * .22, 0, 7); ctx.fill(); }
    else if (k === 'ult' || k === 'mi') { ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r = i % 2 ? s * .55 : s; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, s * .32, 0, 7); ctx.fill(); }
    else if (k === 'def') { ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * .9, -s * .8, s * .85, -s * .2); ctx.quadraticCurveTo(s * .7, s * .6, 0, s); ctx.quadraticCurveTo(-s * .7, s * .6, -s * .85, -s * .2); ctx.quadraticCurveTo(-s * .9, -s * .8, 0, -s); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -s * .55); ctx.lineTo(0, s * .55); ctx.stroke(); }
    else if (k === 'item') { ctx.beginPath(); ctx.arc(0, s * .32, s * .58, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -s * .45, s * .34, 0, 7); ctx.stroke(); ctx.fillRect(-s * .18, -s * 1.02, s * .36, s * .22); }
    else if (k === 'flee') { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-s + i * 2, -s * .5 + i * s * .5); ctx.lineTo(s * .2 + i * 4, -s * .5 + i * s * .5); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(s * .3, -s * .8); ctx.lineTo(s, 0); ctx.lineTo(s * .3, s * .8); ctx.stroke(); }
    ctx.restore();
  }
  const ICON = { mi: 'icon_secret', skill: 'icon_spell', atk: 'icon_attack', def: 'icon_defend', item: 'icon_item', flee: 'icon_escape' };
  const SERIF = '"STSongti-SC","Songti SC","Noto Serif SC","Source Han Serif SC",serif';
  function jade(r, it, st, k, hov, now) {
    const I = window.R79, sel = hov || !!st.glow, off = st.on ? 0 : 0, lift = sel ? -4 : 0;
    const x = r.x + (1 - k) * 60, y = r.y + lift - 2;
    ctx.save(); ctx.globalAlpha = k;
    const pl = !st.on ? I.command_plate_disabled : sel ? I.command_plate_selected : I.command_plate_normal;
    ctx.drawImage(pl, x, y, 300, 88);
    if (st.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * (.25 + .15 * Math.sin(now * 4)); ctx.drawImage(I.command_plate_selected, x, y, 300, 88); ctx.restore(); }
    const ic = I[ICON[it.k]]; if (ic) { ctx.save(); if (!st.on) { ctx.globalAlpha = k * .48; ctx.filter = 'grayscale(1)'; } ctx.drawImage(ic, x + 38, y + 2, 84, 84); ctx.restore(); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = st.on ? '#0E2424' : '#1F2933';
    ctx.font = `700 28px ${SERIF}`; ctx.fillText(it.label, x + 134, y + 38);
    if (st.note) { ctx.font = `600 13px ${FONT}`; ctx.fillStyle = st.on ? (st.glow ? '#7a4a08' : '#2a4a4a') : '#5a3a2a'; ctx.fillText(st.note, x + 134, y + 63); }
    ctx.restore();
  }
  function plaque(r, it, st, k, hov, now) {
    if (R79()) return jade(r, it, st, k, hov, now);
    const center = it.k === 'atk', ult = !!st.glow;
    ctx.save(); ctx.globalAlpha = k * (st.on ? 1 : .55);
    const x = r.x + (1 - k) * 60, y = r.y;
    // 底板：漆木渐变 + 金边，攻击为朱漆，绝技满怒为金
    const g = ctx.createLinearGradient(x, y, x, y + r.h);
    if (center) { g.addColorStop(0, hov ? '#a8321c' : '#8a2414'); g.addColorStop(1, '#4a0e06'); }
    else if (ult) { g.addColorStop(0, '#7a5414'); g.addColorStop(1, '#3a2406'); }
    else { g.addColorStop(0, hov ? 'rgba(70,44,26,.96)' : 'rgba(44,28,18,.94)'); g.addColorStop(1, 'rgba(18,11,7,.94)'); }
    const rr = 12; ctx.beginPath(); ctx.moveTo(x + rr, y); ctx.lineTo(x + r.w - rr, y); ctx.quadraticCurveTo(x + r.w, y, x + r.w, y + rr); ctx.lineTo(x + r.w, y + r.h - rr); ctx.quadraticCurveTo(x + r.w, y + r.h, x + r.w - rr, y + r.h); ctx.lineTo(x + rr, y + r.h); ctx.quadraticCurveTo(x, y + r.h, x, y + r.h - rr); ctx.lineTo(x, y + rr); ctx.quadraticCurveTo(x, y, x + rr, y); ctx.closePath();
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3; ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = hov || ult ? 2.4 : 1.6; ctx.strokeStyle = ult ? '#ffd86a' : center ? '#f0c068' : '#c99a4a'; ctx.stroke();
    // 内描金线
    ctx.globalAlpha *= .45; ctx.lineWidth = 1; ctx.strokeStyle = '#e9c77a'; ctx.strokeRect(x + 5, y + 5, r.w - 10, r.h - 10); ctx.globalAlpha /= .45;
    // 绝技满怒：一道金光沿边框流转
    if (ult) { const t = (now * .6) % 1, per = 2 * (r.w + r.h), d = t * per; let px, py; if (d < r.w) { px = x + d; py = y; } else if (d < r.w + r.h) { px = x + r.w; py = y + d - r.w; } else if (d < 2 * r.w + r.h) { px = x + r.w - (d - r.w - r.h); py = y + r.h; } else { px = x; py = y + r.h - (d - 2 * r.w - r.h); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(px, py, 0, px, py, 26); gg.addColorStop(0, 'rgba(255,240,180,.9)'); gg.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = gg; ctx.fillRect(px - 26, py - 26, 52, 52);
      ctx.globalAlpha = .18 + .1 * Math.sin(now * 4); ctx.fillStyle = '#ffd86a'; ctx.fillRect(x, y, r.w, r.h); ctx.restore(); }
    // 图标圆章
    const cx = x + 32, cy = y + r.h / 2; ctx.beginPath(); ctx.arc(cx, cy, 19, 0, 7); const ig = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 19); ig.addColorStop(0, center ? '#ffd9a0' : ult ? '#fff0b8' : '#f3e2b8'); ig.addColorStop(1, center ? '#c0782c' : ult ? '#c08a20' : '#9a7a44'); ctx.fillStyle = ig; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#5a3a14'; ctx.stroke();
    icon(it.k, cx, cy, 11, '#3a1e08');
    // 字
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = `34px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`;
    textOutline(it.label, x + 62, y + r.h / 2 - 6, ult ? '#fff2b0' : center ? '#ffe9c4' : '#f5e1b4', '#1a0800', 4);
    if (st.note) { ctx.font = `600 13px ${FONT}`; ctx.fillStyle = st.on ? (ult ? '#ffe28a' : '#d8c49a') : '#a08a70'; ctx.fillText(st.note, x + 64, y + r.h - 11); }
    ctx.restore();
  }
  window.BM2 = { layout: () => layout(), state: it => state(it), CMDS };
  drawBattleMenu = (orig => function () {
    const b = battle; if (!b || !b.menu || b.menu.sub) return orig.apply(this, arguments);
    const now = performance.now() / 1000; if (lastActive !== b.P) { lastActive = b.P; shownAt = now; }
    const hx = input.x, hy = input.y;
    const LY = layout();
    if (R79() && window.R79.sword_cord_tassel) { const I = window.R79; const k0 = Math.max(0, Math.min(1, (now - shownAt) / .25)); ctx.save(); ctx.globalAlpha = k0; const cx = Math.min(...LY.map(r => r.x)) - 18; ctx.drawImage(I.sword_cord_tassel, cx, LY[0].y - 6, 80, LY[LY.length - 1].y + 92 - LY[0].y); ctx.restore(); }
    LY.forEach((r, i) => { const k = Math.max(0, Math.min(1, (now - shownAt - i * .04) / .18)), e = 1 - Math.pow(1 - k, 3), st = state(r), hov = hx > r.x && hx < r.x + r.w && hy > r.y && hy < r.y + r.h; plaque(r, r, st, e, hov && st.on, now); });
  })(drawBattleMenu);
  async function flee(b) {
    const P = b.P; b.state = 'act'; b.menu = null;
    const es = aliveEnemies(), avg = es.reduce((s, e) => s + (e.spd || 10), 0) / Math.max(1, es.length);
    const rate = Math.max(.3, Math.min(.9, .55 + ((P.spd || 10) - avg) * .025));
    try { skillBanner('逃 跑', '#e8f0ff', '成功率 ' + Math.round(rate * 100) + '%'); } catch (e) {}
    await sleep(500);
    if (Math.random() < rate) {
      toast('成功脱身！', 1800); try { playSnd('sfx_wind'); } catch (e) {}
      for (const u of b.heroes || [P]) { u.ox = 0; } let k = 0; await new Promise(res => { const step = () => { k += 1 / 30; for (const u of b.heroes || [P]) u.ox = 600 * k * k; if (k < .6) requestAnimationFrame(step); else res(); }; step(); });
      const r = b.res; b.res = v => r(v ? v : 'flee'); b.fled = true; await endBattle(false); return;
    }
    toast('逃跑失败！', 1600); await afterAct();
  }
  handleMenuTap = (orig => function (tap) {
    const b = battle; if (!b || !b.menu || b.menu.sub) return orig.apply(this, arguments);
    for (const r of layout()) if (tap.x > r.x && tap.x < r.x + r.w && tap.y > r.y && tap.y < r.y + r.h) {
      try { playSnd('ui_click'); } catch (e) {}
      if (r.k === 'mi') { b.menu.sub = window.MIZHUAN_LIST ? MIZHUAN_LIST() : []; try { sfx('blip'); } catch (e) {} return; }
      if (!state(r).on) { toast(r.k === 'item' ? '没有丹药了' : '现在不能这样做', 1500); return; }
      if (r.k === 'flee') { if (!fleeOK(b)) { toast(b.cfg.boss ? '首领战，无路可逃！' : '此战不可逃'); return; } flee(b); return; }
      const c = menuCenter(), o = OLD[r.k]; return orig.call(this, { x: c.x + o[0] * 100, y: c.y + o[1] * 92 });
    }
    // 点在令牌外：什么都不做
  })(handleMenuTap);
})();
