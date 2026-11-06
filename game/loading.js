// ================= 换图载入画面：地面 / 物件没载好之前不再露出绿底，显示载入进度条；并提前预载相邻地图 =================
(function () {
  if (typeof S === 'undefined' || !S.overlay) return;
  let shown = 0, prog = 0, mapAt = null, t0 = 0, forced = null;
  // 当前地图还差多少图没载好（0~1）
  // 作者 11-06：进度条走满之前，本地图的配乐也要缓冲好（最多等 8 秒，网络太慢就先进图，曲子随后接上）
  const aw = { m: null, t: 0 };
  function musicOk() { if (!window.BGM29 || !BGM29.ready) return true; if (aw.m !== world.mapName) { aw.m = world.mapName; aw.t = performance.now(); } if (performance.now() - aw.t > 8000) return true; return BGM29.ready(); }
  function readiness() { const r = imgReady(); return r >= 1 && forced !== world.mapName && S.scene === drawMap && !musicOk() ? .97 : r; }
  function imgReady() {
    const m = world.map; if (!m || S.scene !== drawMap) return 1;
    if (forced === world.mapName) return 1;   // 玩家在“网络很慢”提示里点了继续
    // 老式整图地图（藏经阁、后山等）：底图必须到齐
    if (!m.tile) { const k = m.img; if (!k) return 1; return IMG[k] && IMG[k].width > 8 ? 1 : 0; }
    const d = m.def; if (!d || !d.baked) return 1;
    const g = d.baked.ground, objs = d.baked.objs || [];
    if (window.CX2_LAZY_LD && /^cx2g_/.test(g || '') && !IMG[g]) CX2_LAZY_LD(g.slice(5));
    let n = 0, ok = 0; for (const o of objs) { if (!o.img) continue; n++; if (IMG[o.img]) ok++; }
    return (IMG[g] ? .65 : 0) + .35 * (n ? ok / n : 1);
  }
  window.MAP_READY = () => readiness() >= 1;
  window.MAP_LOADING = () => { try { return readiness() < 1; } catch (e) { return false; } };
  const layer = { draw() {
    if (world.mapName !== mapAt) { mapAt = world.mapName; t0 = performance.now(); prog = 0; }
    let r = readiness();
    // 兜底：只要这一帧地面画的还是绿色占位（不管哪条剧情路径进的图），就盖上载入画面
    if (window.__GPH && performance.now() - window.__GPH < 250 && forced !== world.mapName) r = Math.min(r, .6);
    if (r >= 1) { shown = Math.max(0, shown - .08); if (!shown) return; } else shown = 1;
    prog += (r - prog) * .15; if (r < 1) prog = Math.min(prog, .97);
    const a = shown;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#07080d'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * .6); g.addColorStop(0, 'rgba(60,70,120,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const title = (world.map && world.map.def && world.map.def.title) || '';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `48px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.fillStyle = '#ffe2a0'; ctx.fillText(title, W / 2, H / 2 - 50);
    const bw = 420, bh = 8, bx = W / 2 - bw / 2, by = H / 2 + 10;
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(bx, by, bw, bh);
    const lg = ctx.createLinearGradient(bx, 0, bx + bw, 0); lg.addColorStop(0, '#d8a752'); lg.addColorStop(1, '#ffe8a8'); ctx.fillStyle = lg; ctx.fillRect(bx, by, bw * Math.max(.04, prog), bh);
    // 流星光点
    const sx = bx + bw * Math.max(.04, prog); ctx.globalCompositeOperation = 'lighter'; const sg = ctx.createRadialGradient(sx, by + 4, 0, sx, by + 4, 18); sg.addColorStop(0, 'rgba(255,240,200,.9)'); sg.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = sg; ctx.fillRect(sx - 18, by - 14, 36, 36); ctx.globalCompositeOperation = 'source-over';
    ctx.font = `600 18px ${typeof FONT !== 'undefined' ? FONT : 'sans-serif'}`; ctx.fillStyle = 'rgba(232,220,192,.8)'; ctx.fillText('载入中…… ' + Math.round(prog * 100) + '%', W / 2, by + 36);
    const waited = (performance.now() - t0) / 1000;
    if (r < 1 && waited > 12) { ctx.font = `600 15px ${typeof FONT !== 'undefined' ? FONT : 'sans-serif'}`; ctx.fillStyle = 'rgba(232,220,192,.65)'; ctx.fillText(waited > 40 ? '网络较慢，素材仍在下载。点击屏幕可先进入（可能缺图）' : '网络较慢，正在重试下载……', W / 2, by + 66); }
    if (r < 1 && typeof input !== 'undefined' && input.tapped) { if (waited > 40) forced = world.mapName; input.tapped = null; }
    ctx.restore();
  } };
  S.overlay.push(layer);
  // 载入画面期间：收起地图 HUD、不让角色乱走
  drawMapHud = (orig => function () { if (shown >= .99) return; return orig.apply(this, arguments); })(drawMapHud);
  updateMap = (orig => function (dt) { if (readiness() < 1) { if (world.player) world.player.moving = false; return; } return orig(dt); })(updateMap);
  // 预载相邻地图（出口 / 门通向的图），下一次换图就不用等
  function preloadNear(name) {
    const d = TMAPS[name]; if (!d) return;
    for (const e of (d.exits || []).concat(d.doors || [])) { const to = e && e.to; if (!to || !TMAPS[to]) continue; const B = TMAPS[to].baked; if (B && /^cx2g_/.test(B.ground || '') && !IMG[B.ground] && window.CX2_LAZY_LD) CX2_LAZY_LD(B.ground.slice(5)); }   // 按地面图的 id 预载（原来传的是地图名，玄天城南门外那张会去要一张不存在的 g_yy_forest）
  }
  tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments); setTimeout(() => { try { preloadNear(name); } catch (e) {} }, 1200); return r; })(tileSetMap);
})();
