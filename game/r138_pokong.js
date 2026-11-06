// ================= R138 · 破空遁符：随时传回青竹小院 =================
// 作者 11-07：叶擎苍给的破空遁符做成无限次法宝——拿到以后随时能用，一用就传回青竹小院（不消耗）。
// 两个入口：① 行囊里选中遁符点「使用」；② 地图界面行囊按钮上方的符按钮。战斗里、剧情演出、对话时不能用。
// 演出：主角身上亮符 → 撕开空间门（Codex r135c/pokong_fx 十帧）→ 白光 → 落到居室门前，空间门倒放合拢。
(function () {
  const IDS = ['k_pokong', 'k_poxu'], HOME = 'qingzhu_court';
  const own = () => !!(S.hero && S.hero.bag && IDS.some(k => S.hero.bag[k] > 0));
  const isPk = id => IDS.includes(id);
  const load = src => { const im = new Image(); im.onload = () => { im.__ok = 1; }; im.src = src; return im; };
  const ready = im => !!(im && im.__ok && im.naturalWidth);
  const ICO = load('r135c/pokong.webp'), FXI = load('r135c/pokong_fx.webp');
  const inBattle = () => typeof battle !== 'undefined' && !!battle;
  const talking = () => (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice) || (typeof sysPanel !== 'undefined' && sysPanel);
  const onMap = () => !!(world.map && world.map.tile && S.scene === drawMap);
  let busy = false, FXS = null;   // FXS: { t0, x, y, rev }

  // 物品说明
  const DESC = '父亲所赠。随时可用，撕开空间传回青竹小院（不消耗）；战斗中逃跑成功率 +25%';
  const fixDesc = () => { for (const k of IDS) if (ITEM_DB[k]) ITEM_DB[k].desc = DESC; };
  fixDesc(); setTimeout(fixDesc, 0);

  // 落点：居室门前，站不住就退到小院南口
  function home() {
    const T = TMAPS[HOME]; if (!T) return null;
    const P = (x, y) => [x / 64 - .5, y / 64 - .8];
    for (const [x, y] of [[1088, 690], [1088, 740], [1010, 720], [1170, 720]]) {
      try { if (world.map && world.mapName === HOME && world.map.T && typeof canStand === 'function' && !canStand(world.map.T, x, y)) continue; } catch (e) {}
      return { p: P(x, y), x, y };
    }
    return { p: T.start, x: 740, y: 1645 };
  }

  function why() {
    if (busy) return '遁符还在运转……';
    if (inBattle()) return '战斗中撕不开空间——想走请用「逃跑」';
    if (!onMap() || talking() || world.hold) return '现在不是用遁符的时候';
    if (window.POKONG_DENY && POKONG_DENY[world.mapName]) return POKONG_DENY[world.mapName];
    if (world.mapName === HOME) return '已经在青竹小院了';
    return '';
  }

  async function use() {
    const no = why(); if (no) { toast(no, 1600); return false; }
    const dst = home(); if (!dst) { toast('遁符感应不到青竹小院', 1600); return false; }
    busy = true; world.locked = true; world.path = null;
    const p = world.player; if (p) p.moving = false;
    try { if (S.menu) S.menu = null; } catch (e) {}
    try { playSnd('sfx_charge', .7); } catch (e) {}
    if (p) FXS = { t0: performance.now(), x: p.x, y: p.y, rev: false };
    await sleep(820);
    S.flash = .7; S.flashColor = '#eaf3ff'; try { playSnd('sfx_star', .6); } catch (e) {}
    await fadeOut(360);
    FXS = null;
    try { tileSetMap(HOME, dst.p[0], dst.p[1], 'down'); S.scene = drawMap; S.hud = true; } catch (e) { console.warn('R138 pokong', e); }
    const q = world.player; if (q) FXS = { t0: performance.now(), x: q.x, y: q.y, rev: true };
    await fadeIn(380);
    await sleep(500);
    world.locked = false; busy = false;
    toast('破空遁符 · 已回到青竹小院', 1700);
    return true;
  }
  window.POKONG_HOME = use;

  // 空间门特效（地图上，世界坐标）
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function (T, cam, now) {
    o.apply(this, arguments);
    try {
      if (!FXS || !ready(FXI)) return;
      const t = (performance.now() - FXS.t0) / 1000, D = .95; if (t > D + .2) { FXS = null; return; }
      let fi = Math.min(9, Math.floor(t / D * 10)); if (FXS.rev) fi = 9 - fi;
      const a = t <= D ? 1 : Math.max(0, 1 - (t - D) / .2), s = 260 * (typeof AZ === 'function' ? AZ() : 1);
      ctx.save(); ctx.globalAlpha = a; ctx.drawImage(FXI, (fi % 5) * 384, Math.floor(fi / 5) * 384, 384, 384, FXS.x - s / 2, FXS.y - s * .62, s, s); ctx.restore();
    } catch (e) {}
  })(tileAmbientHigh);

  // ---- 行囊：选中遁符时出「使用」按钮 ----
  if (typeof useBtn === 'function') useBtn = (o => function (L) {
    const id = S.menu && S.menu.sel;
    if (isPk(id) && itemCount(id)) return { x: L.body.x + L.body.w - 170, y: L.body.y + L.body.h - 92, w: 150, h: 56 };
    return o.apply(this, arguments);
  })(useBtn);
  if (typeof useItemOn === 'function') useItemOn = (o => function (id) {
    if (!isPk(id)) return o.apply(this, arguments);
    const no = why();
    if (no) { toast(no, 1600); return; }
    // 先合上行囊，等下一帧再起符（菜单关掉时 world.locked 会被放开）
    try { closeMenu(); } catch (e) { S.menu = null; world.locked = false; }
    setTimeout(() => { use(); }, 30);
  })(useItemOn);
  // 「使用」旁边那行「给：某某（点上方头像切换）」换成遁符自己的说明
  if (typeof drawMenu === 'function') drawMenu = (o => function () {
    const m = S.menu; if (!(m && isPk(m.sel))) return o.apply(this, arguments);
    const ft = ctx.fillText;
    ctx.fillText = function (s, ...r) { if (typeof s === 'string' && /^给：/.test(s)) s = '传回青竹小院 · 不消耗'; return ft.call(this, s, ...r); };
    try { return o.apply(this, arguments); } finally { ctx.fillText = ft; }
  })(drawMenu);

  // ---- 地图界面：行囊按钮上方的符按钮 ----
  const BTN = () => ({ x: W - 80, y: H - 166, r: 34 });
  const showBtn = () => own() && onMap() && S.hud && !world.locked && !talking() && !S.menu && !inBattle() && !busy && !world.hold;
  tileUpdate = (o => function (dt) {
    const t = input.tapped;
    if (t && !t.key && showBtn()) { const b = BTN(); if (Math.hypot(t.x - b.x, t.y - b.y) < b.r + 8) { consumeTap(); use(); return o(0); } }
    return o(dt);
  })(tileUpdate);
  if (S.overlay) S.overlay.push({ draw() {
    if (!showBtn()) return;
    const b = BTN(), now = performance.now() / 1000, here = world.mapName === HOME;
    ctx.save(); ctx.globalAlpha = here ? .55 : 1;
    const g = ctx.createRadialGradient(b.x, b.y - b.r * .3, 3, b.x, b.y, b.r); g.addColorStop(0, '#2d4a66'); g.addColorStop(1, '#0d1a2a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); ctx.strokeStyle = '#e9c77a'; ctx.lineWidth = 3; ctx.stroke();
    if (!here) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(200,225,255,${.22 + .16 * Math.sin(now * 2.4)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 4, 0, 7); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
    if (ready(ICO)) { const s = b.r * 1.75; ctx.drawImage(ICO, b.x - s / 2, b.y - s / 2 - 3, s, s); }
    else { ctx.font = `30px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9b8'; ctx.fillText('遁', b.x, b.y); }
    ctx.font = `18px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    textOutline('回小院', b.x, b.y + b.r - 4, '#fbe6b0', 'rgba(20,12,4,.9)', 4);
    ctx.restore();
  } });
})();
