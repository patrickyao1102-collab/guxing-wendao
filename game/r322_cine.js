// ================= R322 · 支线关键场面动画（Codex R313 第二批：整屏回忆 / 失败结局）（只进测试版）=================
// 作者 11-16：「支线任务的重要场景都要做动画帧」。说到对应那句话之前，先整屏播一段回忆（点一下可跳过），播完再出这句话。
(function () {
  if (typeof say !== 'function') return;
  const N = { r313_01: 10, r313_03: 8, r313_13: 10 }, FPS = 3, HOLD = 900;
  const cache = {}; const img = (k, i) => { const id = k + '_' + String(i).padStart(3, '0'); if (!cache[id]) { const im = new Image(); im.src = 'r322/' + id + '.webp'; cache[id] = im; } return cache[id]; };
  const pre = k => { for (let i = 0; i < N[k]; i++) img(k, i); };
  const ON = [
    [/^是老夫订的。钥匙是老夫借的。剑，是老夫初七夜里亲手换的。/, 'r313_01', '回忆 · 初七夜里'],
    [/^散场的时候，有位贵客派来的管事上了二楼雅间/, 'r313_03', ''],
    [/^凶手没进过那间屋子。门闩上的血指印在里面/, 'r313_13', '回忆 · 后巷'],
  ];
  let cur = null;
  const layer = { draw() { if (!cur) return; const t = performance.now() - cur.t0, total = N[cur.k] / FPS * 1000 + HOLD;
    const i = Math.min(N[cur.k] - 1, Math.floor(t / 1000 * FPS)), a = Math.min(1, t / 300, Math.max(0, (total + 300 - t) / 300));
    ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a; const im = img(cur.k, i);
    if (im.complete && im.naturalWidth) { const s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); }
    if (cur.title) { ctx.font = `600 26px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,240,210,.85)'; ctx.fillText(cur.title, 36, 52); }
    ctx.font = `20px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,240,210,.55)'; ctx.fillText('点一下跳过', W - 30, H - 26); ctx.restore(); } };
  const play = (k, title) => new Promise(res => { pre(k); cur = { k, title, t0: performance.now() };
    try { playSnd('sfx_star', .4); } catch (e) {}
    const total = N[k] / FPS * 1000 + HOLD + 300; let done = false;
    const end = () => { if (done) return; done = true; cur = null; res(); };
    const skip = () => { if (performance.now() - (cur ? cur.t0 : 0) > 400) end(); };
    setTimeout(end, total); const poll = () => { if (done) return; try { if (typeof consumeTap === 'function' && consumeTap()) skip(); } catch (e) {} requestAnimationFrame(poll); }; requestAnimationFrame(poll); });
  // 画在最上层（小地图、血条、行囊按钮之上）：挂在对话框绘制之前
  if (typeof drawDialog === 'function') drawDialog = (o => function () { try { layer.draw(); } catch (e) {} return o.apply(this, arguments); })(drawDialog);
  if (typeof drawMapHud === 'function') drawMapHud = (o => function () { if (cur) return; return o.apply(this, arguments); })(drawMapHud);
  say = (orig => async function (who, text) { const t = String(text || '');
    for (const [re, k, title] of ON) if (re.test(t)) { try { await play(k, title); } catch (e) {} break; }
    return orig.apply(this, arguments); })(say);
  window.R322_PLAY = play;
})();
