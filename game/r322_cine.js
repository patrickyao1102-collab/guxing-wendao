// ================= R322 · 支线关键场面动画（Codex R313 第二批：整屏回忆 / 失败结局 / 特写 / 叠在地图上的光效）（只进测试版）=================
// 作者 11-16：「支线任务的重要场景都要做动画帧」。说到对应那句话之前，先播这一段（点一下可跳过），播完再出这句话。
//   full  —— 整屏回忆（黑底铺满）
//   over  —— 叠在当前画面上（如护城灵枢十灯齐明）
//   close —— 画面压暗，中间出一张特写（断指、灯槽黑粉、灯油里的水）
(function () {
  if (typeof say !== 'function') return;
  const C = { r313_01: [10, 3, 'full'], r313_03: [8, 3, 'full'], r313_13: [10, 3, 'full'], r313_07: [8, 3, 'full'],
    r313_12: [10, 6, 'over'], r313_11: [6, 5, 'close'], r313_14: [6, 5, 'close'], r313_05c: [1, 1, 'close'] };
  const HOLD = 900;
  const cache = {}; const img = (k, i) => { const id = k + '_' + String(i).padStart(3, '0'); if (!cache[id]) { const im = new Image(); im.src = 'r322/' + id + '.webp'; cache[id] = im; } return cache[id]; };
  const pre = k => { for (let i = 0; i < C[k][0]; i++) img(k, i); };
  const ON = [
    [/^是老夫订的。钥匙是老夫借的。剑，是老夫初七夜里亲手换的。/, 'r313_01', '回忆 · 初七夜里'],
    [/^散场的时候，有位贵客派来的管事上了二楼雅间/, 'r313_03', ''],
    [/^凶手没进过那间屋子。门闩上的血指印在里面/, 'r313_13', '回忆 · 后巷'],
    [/^今天是我爹的忌日。那三坛酒，是他这辈子最得意的手艺/, 'r313_07', '回忆 · 昨夜的地窖'],
    [/^闻讯赶来的城卫统领朝老人深深一揖/, 'r313_12', ''],
    [/^灯座灵槽的缝里，沾着一层极细的黑色粉末/, 'r313_11', ''],
    [/^灯座底下的油壶，壶嘴上挂着一圈水渍/, 'r313_14', ''],
    [/^河边石滩。那人被逼到水边，索性一把扯下手套/, 'r313_05c', ''],
  ];
  const dur = k => C[k][0] / C[k][1] * 1000 + (C[k][0] === 1 ? 1700 : HOLD);
  let cur = null; const SEEN = new Set();   // 特写同一张只在一次游戏里播一回（三盏灯不用看三遍）
  const layer = { draw() { if (!cur) return; const k = cur.k, [n, fps, mode] = C[k], t = performance.now() - cur.t0, total = dur(k);
    const i = Math.min(n - 1, Math.floor(t / 1000 * fps)), a = Math.min(1, t / 300, Math.max(0, (total + 300 - t) / 300)), im = img(k, i), ok = im.complete && im.naturalWidth;
    ctx.save();
    if (mode === 'full') { ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
      if (ok) { const s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); } }
    else if (mode === 'over') { ctx.globalAlpha = a; if (ok) { const s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); } }
    else { ctx.globalAlpha = a * .62; ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
      if (ok) { const s = Math.min(1, (H * .62) / im.naturalHeight) * (im.naturalWidth <= 256 ? 1.6 : 1), w = im.naturalWidth * s, h = im.naturalHeight * s;
        ctx.drawImage(im, (W - w) / 2, H * .42 - h / 2, w, h); } }
    ctx.globalAlpha = 1;
    if (cur.title) { ctx.font = `600 26px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,240,210,.85)'; ctx.fillText(cur.title, 36, 52); }
    ctx.font = `20px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,240,210,.55)'; ctx.fillText('点一下跳过', W - 30, H - 26); ctx.restore(); } };
  const play = (k, title) => new Promise(res => { pre(k); cur = { k, title, t0: performance.now() };
    try { playSnd('sfx_star', .4); } catch (e) {}
    const total = dur(k) + 300; let done = false;
    const end = () => { if (done) return; done = true; cur = null; res(); };
    const skip = () => { if (performance.now() - (cur ? cur.t0 : 0) > 400) end(); };
    setTimeout(end, total); const poll = () => { if (done) return; try { if (typeof consumeTap === 'function' && consumeTap()) skip(); } catch (e) {} requestAnimationFrame(poll); }; requestAnimationFrame(poll); });
  // 画在最上层（小地图、血条、行囊按钮之上）：挂在对话框绘制之前
  if (typeof drawDialog === 'function') drawDialog = (o => function () { try { layer.draw(); } catch (e) {} return o.apply(this, arguments); })(drawDialog);
  if (typeof drawMapHud === 'function') drawMapHud = (o => function () { if (cur) return; return o.apply(this, arguments); })(drawMapHud);
  say = (orig => async function (who, text) { const t = String(text || '');
    for (const [re, k, title] of ON) if (re.test(t)) { if (C[k][2] === 'close' && SEEN.has(k)) break; SEEN.add(k); try { await play(k, title); } catch (e) {} break; }
    return orig.apply(this, arguments); })(say);
  window.R322_PLAY = play;
})();
