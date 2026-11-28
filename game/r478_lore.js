// ================= R478 · 地图来历（载入画面左上角，书法题名下面的一段话；只进测试版）=================
// 作者 11-28 23:35：「过图那个插画背景，左上角是地名，然后你在底下写一些故事。老版《剑网三》每个地图载入时都有当前地图的来历、背景或者故事。」
// 作者 11-29：来历改用 Gemini 重写的版本（kind：传说 / 定位 / 诗 / 无）。
// 文字在 r478/lore.json（{地图id: {k 段名, title 题名, sub 小字, text 来历}}；同一地点的屋子共用一段，k 相同）。没有来历的图不显示。
// 改字：改 lore.json，再跑 tools/r478_build.py 重做字体子集（r478/lore.woff 霞鹜文楷、r478/title.woff 马善政，只含用到的字）。
// 排版：题名图实际画出来的那一块（扫透明边，不按图片外框）往下 10 像素起排；字 25 像素（手机横屏 844×390 上约 13.5 像素），行距 1.6，
//       宽不超过画面 42%，米白字 + 柔和深色描边 + 半透明暗底；题名出来 0.4 秒后淡入。题名图以后换样式也照样按实际高度排。
// 没有 R163 书法题名的图（万妖塔各苑、民宅、巡城司……）：用 lore.json 的题名补一个毛笔题名（小字在上），来历照样排在下面。
// 第一次读到某一段（存档 S.flags.r478 记着）：载入画面多停一会儿，等来历完整露出 3.5 秒再放行；点一下屏幕就不等了。以后再来不多停。
// 挂点：loading.js 画完题名调 LOADING_TITLE_DONE(题名框, 信息)；没有题名图时先调 LOADING_TITLE_MISSING(…)。
(function () {
  if (typeof S === 'undefined' || typeof ctx === 'undefined') return;
  let LORE = {}, ILLU = { maps: {}, files: {} };
  { const p1 = fetch('r478/lore.json?v=2').then(r => r.json()).then(j => { LORE = j || {}; }).catch(() => {});
    const p2 = fetch('r478/illu.json?v=1').then(r => r.json()).then(j => { ILLU = j && j.maps ? j : ILLU; }).catch(() => {});
    try { if (window.PRELOAD) { PRELOAD('地图来历', p1); PRELOAD('专属插画表', p2); } } catch (e) {} }

  // ---------- 每张地图专属载入插画（Codex R477，79 张；同一地点的屋子共用一张；r478/illu.json 记着谁用哪张） ----------
  // 作者最讨厌黑屏：不一次全下。进哪张图下哪张，进图后再把相邻的图（出口 / 门通向的）的插画顺手下好；
  // 换图时这张还没到，loading.js 先用已经下好的 R157 插画垫着，一到立刻换上（swap）。青竹一带原来 R144 轮换那套让位给这里。
  const ART = {};
  function art(key) { let a = ART[key]; if (!a) { a = ART[key] = { im: new Image(), ok: false, swap: 1, key, use() {} }; a.im.onload = () => { a.ok = true; }; a.im.onerror = () => { a.bad = true; }; a.im.src = 'r478/illu/' + key + '.webp?v=1'; } return a; }
  const artKey = m => (ILLU.maps || {})[m] || null;
  window.LOADING_MAP_ART = to => { const k = artKey(to); if (!k) return null; const a = art(k); return a.bad ? null : a; };
  function preloadNear(name) { const d = typeof TMAPS !== 'undefined' && TMAPS[name]; if (!d) return; const k0 = artKey(name); if (k0) art(k0);
    for (const e of (d.exits || []).concat(d.doors || [])) { const k = e && e.to && artKey(e.to); if (k) art(k); } }
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments); setTimeout(() => { try { preloadNear(name); } catch (e) {} }, 800); return r; })(tileSetMap);
  setTimeout(() => { try { if (world && world.mapName) preloadNear(world.mapName); } catch (e) {} }, 3000);
  window.R478_ART = { art, artKey, get loaded() { return Object.keys(ART).filter(k => ART[k].ok); } };
  // 字体：载入画面要用之前装好（装不上就退回游戏里的楷体）
  const FF = [['R478Lore', 'r478/lore.woff?v=2'], ['R478Title', 'r478/title.woff?v=2']];
  for (const [n, u] of FF) { try { const f = new FontFace(n, `url(${u})`); const p = f.load().then(x => document.fonts.add(x)).catch(() => {}); if (window.PRELOAD) PRELOAD('来历字体', p); } catch (e) {} }
  const BODY = '"R478Lore","GuxingKai","R201WK",' + (typeof FONT !== 'undefined' ? FONT : 'serif');
  const HEAD = '"R478Title","R201MS",' + (typeof BRUSH !== 'undefined' ? BRUSH : 'serif');
  const CFG = { size: 25, lh: 1.6, gap: 10, maxW: Math.round(1280 * .42) - 12, fadeIn: 600, delay: 400, hold: 3500, holdMax: 9000 };
  window.R478 = { CFG, lore: m => LORE[m] || null, get data() { return LORE; } };
  const F = () => (S.flags = S.flags || {});
  const seen = k => !!(F().r478 && F().r478[k]);
  const mark = k => { const f = F(); (f.r478 = f.r478 || {})[k] = 1; };

  // ---------- 题名图实际画出来的那一块（扫一次透明边，按图缓存） ----------
  const BOX = new WeakMap();
  function inkBox(im) { let b = BOX.get(im); if (b) return b; b = { x0: 0, y0: 0, x1: 1, y1: 1 };
    try { const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= x0) b = { x0: x0 / w, y0: y0 / h, x1: (x1 + 1) / w, y1: (y1 + 1) / h }; } catch (e) {}
    BOX.set(im, b); return b; }

  // ---------- 断行：一个字一个字量；句读不放行首，「（ 不放行尾（多出一点点宽也认） ----------
  const NO_HEAD = '，。、；：！？」』）〕…—·', NO_TAIL = '「『（〔';
  function wrap(text, maxW) { const L = []; let cur = '', w = 0;
    for (const ch of text) { const cw = ctx.measureText(ch).width;
      if (w + cw > maxW && cur) {
        if (NO_HEAD.includes(ch)) { cur += ch; w += cw; continue; }   // 句读挂在行尾
        let carry = ''; while (cur && NO_TAIL.includes(cur[cur.length - 1])) { carry = cur[cur.length - 1] + carry; cur = cur.slice(0, -1); }
        L.push(cur); cur = carry + ch; w = ctx.measureText(cur).width; }
      else { cur += ch; w += cw; } }
    if (cur) L.push(cur); return L; }
  const LINES = {};   // 断好的行按「段名 + 宽」缓存
  function lines(e) { if (!e.text) return []; const key = e.k + '|' + CFG.maxW + '|' + CFG.size; let L = LINES[key]; if (L && L.font === fontOk()) return L.v;
    ctx.font = `${CFG.size}px ${BODY}`;
    // 作者 11-29：没有真来历的地方用一两句诗（kind 诗）——一句一行，不折行混排
    if (e.kind === '诗') { const v = e.text.split(/(?<=。)/).map(t => t.trim()).filter(Boolean); LINES[key] = { v, font: fontOk() }; return v; }
    let v = wrap(e.text, CFG.maxW);
    // 最后一行只剩一两个字（「样。」）难看：把行宽一点点收窄重排，让最后一行至少四个字（最多收到 82%）
    for (let w = CFG.maxW - CFG.size; v.length > 1 && [...v[v.length - 1]].length < 4 && w > CFG.maxW * .82; w -= CFG.size / 2) { const v2 = wrap(e.text, w); if (v2.length > v.length) break; v = v2; }
    L = LINES[key] = { v, font: fontOk() }; return L.v; }
  const fontOk = () => { try { return document.fonts.check(`${CFG.size}px "R478Lore"`, '天'); } catch (e) { return false; } };

  // ---------- 本次载入的计时 ----------
  // T：题名第一次画出来的时刻（来历从这儿起算 0.4 秒淡入）。载入画面一帧不落地在画，停了半秒以上再画就是新的一次载入。
  const T = { map: null, titleAt: 0, fullAt: 0, last: 0, skip: false, lumAt: 0, lum: .4, std: .12, art: null };
  function track(m, now) { if (T.map !== m || now - T.last > 500) { T.map = m; T.titleAt = now; T.fullAt = 0; T.skip = false; T.lumAt = 0; } T.last = now; }

  // ---------- 没有书法题名：补一个毛笔题名 ----------
  window.LOADING_TITLE_MISSING = (title0, dark, col, a) => {
    const m = world && world.mapName, e = LORE[m]; if (!e) return null;
    const x = 48, now = performance.now(); track(m, now);
    const k = Math.min(1, (now - T.titleAt) / 350);
    ctx.save(); ctx.globalAlpha = a * k; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.lineJoin = 'round';
    let y = 46;
    if (e.sub) { ctx.font = `20px ${BODY}`; try { ctx.letterSpacing = '4px'; } catch (er) {}
      // 小字跟题名同一套颜色：亮插画上墨色字 + 米白描边，暗插画上金色字 + 深色描边
      ctx.lineWidth = 5; ctx.strokeStyle = dark ? 'rgba(255,248,232,.7)' : 'rgba(8,6,4,.7)'; ctx.strokeText(e.sub, x + 4, y); ctx.fillStyle = dark ? 'rgba(52,36,20,.95)' : 'rgba(240,214,160,.97)'; ctx.fillText(e.sub, x + 4, y);
      try { ctx.letterSpacing = '0px'; } catch (er) {} y += 30; }
    ctx.font = `60px ${HEAD}`; const tw = ctx.measureText(e.title).width;
    ctx.lineWidth = 7; ctx.strokeStyle = dark ? 'rgba(255,248,232,.55)' : 'rgba(10,8,6,.62)'; ctx.strokeText(e.title, x, y);
    ctx.fillStyle = col || '#FFF2D5'; ctx.fillText(e.title, x, y);
    ctx.restore();
    return { x, y: 46, w: Math.max(tw, 120), h: y - 46 + 66, own: 1 }; };

  // ---------- 题名下面排来历 ----------
  window.LOADING_TITLE_DONE = (TR, info) => {
    const m = info.map, e = LORE[m]; if (!e || !e.text || !TR) return;   // 作者 11-29：房间庭院这类小地方（kind 无）只显示名字
    const now = info.now || performance.now(); track(m, now);
    { const A = window.LOADING_MAP_ART && LOADING_MAP_ART(m), ak = A && A.ok ? A.key : null; if (ak !== T.art) { T.art = ak; T.lumAt = 0; } }   // 专属插画中途换上来：重新量底下的亮度
    // 题名实际的墨迹框（图）或者字框（自己补的题名）
    let x = TR.x, bottom = TR.y + TR.h;
    if (TR.im) { const b = inkBox(TR.im); x = TR.x + TR.w * b.x0; bottom = TR.y + TR.h * b.y1; }
    x = Math.round(x + 6); const y0 = Math.round(bottom + CFG.gap);
    const k = Math.max(0, Math.min(1, (now - T.titleAt - CFG.delay) / CFG.fadeIn)); if (k <= 0) return;
    if (k >= 1 && !T.fullAt) T.fullAt = now;
    const L = lines(e), lh = Math.round(CFG.size * CFG.lh), h = L.length * lh;
    let wMax = 0; ctx.font = `${CFG.size}px ${BODY}`; for (const s of L) wMax = Math.max(wMax, ctx.measureText(s).width);
    ctx.globalAlpha = (info.a == null ? 1 : info.a) * k;
    // 半透明暗底：一圈圈往外淡，边是虚的，跟插画融在一起
    const px = x - 18, py = y0 - 12, pw = wMax + 36, ph = h + 14;
    // 底下插画越亮，暗底越重（每次载入量一回这块插画的亮度；量的时候字和暗底还没画上去）
    if (!T.lumAt) { T.lumAt = now; const q = lum(px, py, pw, ph), q2 = lum(px, py + ph * .55, pw, ph * .45); T.lum = Math.max(q[0], q2[0]); T.std = Math.max(q[1], q2[1]); }   // 下半截常常是亮地面，取亮的那一半
    const al = Math.max(.45, Math.min(.78, .45 + (T.lum - .36) * .9 + Math.max(0, T.std - .12) * 1.2));   // 越亮、越花，暗底越重
    if (typeof ctx.filter === 'string') { ctx.filter = 'blur(16px)'; ctx.fillStyle = `rgba(6,5,4,${al})`; rr(px, py, pw, ph, 18); ctx.fill(); ctx.filter = 'none'; }   // 能模糊就整块糊开
    else for (let i = 5; i >= 0; i--) { const g = i * 7; ctx.fillStyle = `rgba(6,5,4,${i ? .055 : .2})`; rr(px - g, py - g, pw + g * 2, ph + g * 2, 14 + g); ctx.fill(); }   // 不能模糊（旧浏览器）：一圈圈往外淡
    // 题名和来历之间一道细金线
    const lg = ctx.createLinearGradient(x, 0, x + 150, 0); lg.addColorStop(0, 'rgba(232,194,122,.75)'); lg.addColorStop(1, 'rgba(232,194,122,0)');
    ctx.fillStyle = lg; ctx.fillRect(x, y0 - 5, 150, 1.5);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.lineJoin = 'round';
    const ty = i => y0 + 4 + i * lh + (lh - CFG.size) / 2 - 3;
    ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(10,8,6,.6)'; L.forEach((s, i) => ctx.strokeText(s, x, ty(i)));
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 6; ctx.fillStyle = '#f3e8cf'; L.forEach((s, i) => ctx.fillText(s, x, ty(i)));
    ctx.shadowBlur = 0;
    // 第一次读这一段：载入画面在等的时候，点一下就不再多停（这一下不拿去换插画）
    if (!T.skip && !seen(e.k) && typeof input !== 'undefined' && input.tapped) { T.skip = true; input.tapped = null; mark(e.k); } };
  function lum(x, y, w, h) { try { const m = ctx.getTransform(), sx = m.a, sy = m.d, X = Math.max(0, Math.round(x * sx)), Y = Math.max(0, Math.round(y * sy)), W2 = Math.round(w * sx), H2 = Math.round(h * sy);
      const d = ctx.getImageData(X, Y, W2, H2).data; let t = 0, t2 = 0, n = 0; const st = 4 * Math.max(1, Math.floor(d.length / 4 / 3000));
      for (let i = 0; i < d.length; i += st) { const v = (.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]) / 255; t += v; t2 += v * v; n++; }
      if (!n) return [.4, .12]; const mu = t / n; return [mu, Math.sqrt(Math.max(0, t2 / n - mu * mu))]; } catch (e) { return [.4, .12]; } }
  // 第一次读某段时载入画面多停的那几秒：点一下屏幕就放行（直接听按下；input.tapped 在载入时会被对话框那边先清掉）
  window.addEventListener('pointerdown', () => { try { const m = world && world.mapName, e = LORE[m]; if (e && T.map === m && T.fullAt && !seen(e.k) && performance.now() - T.last < 300) { T.skip = true; mark(e.k); } } catch (er) {} }, true);
  function rr(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }

  // ---------- 第一次读到：多停一会儿 ----------
  // 换图一开始就要拦住（等题名画出来再拦就晚了：载入画面一旦算过「好了」，后面再掉回去也不会重新盖上）；
  // 只在地图画面上拦；题名一直没画出来（插画没到、走了别的路）最多拦 9 秒；来历完整露出 3.5 秒、或者玩家点一下，就放行。
  const H = { map: null, t0: 0 };
  const holding = m => { const now = performance.now(); if (H.map !== m) { H.map = m; H.t0 = now; }
    const e = LORE[m]; if (!e || !e.text || seen(e.k)) return false;
    if (typeof drawMap === 'undefined' || S.scene !== drawMap || !S.started) return false;
    if (now - H.t0 > CFG.holdMax) { mark(e.k); return false; }
    if (T.map === m && T.last >= H.t0) { if (T.skip) return false; if (T.fullAt && now - T.fullAt >= CFG.hold) { mark(e.k); return false; } }
    return true; };
  window.R478.holding = () => holding(world && world.mapName);
  window.R478.state = () => Object.assign({}, T, { now: performance.now() });   // 测试程序看用
  { const o = window.MAP_EXTRA_READY; window.MAP_EXTRA_READY = m => { let a = 1; try { a = o ? o(m) : 1; } catch (e) {} if (a == null) a = 1;
      try { if (holding(m)) return Math.min(a, .99); } catch (e) {} return a; }; }
})();
