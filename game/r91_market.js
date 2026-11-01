// R91 天剑集市（R80 六岛星阵）修整（作者 11-01 实机反馈）
// 1. 守护神龙被石台盖住（Codex R80_神龙石台遮挡修复 的结论）：龙 sy=1865、台 sy=1980，按脚底 y 排序时石台后画、把龙身盖掉。
//    石台是地面，不该进人物排序；改成「地面阶段」先画（flat），神龙照原图原坐标留在世界物件里。不再缩小、挪动神龙。
// 2. 灵兽苑入口被栏杆和灵宠摊堵死：截掉入口那段栏杆、挪走摊子，清出通道
// 3. 湖边步道拐角缺栏杆：补一段横栏 + 一段竖栏
// 4. 人和场景比例：集市里的人物（主角、同伴、店主、访客）统一放大 1.2 倍，灵兽不变
(function () {
  if (!window.R80_ON || !window.R60 || !window.R80) return;
  const ID = 'tj_market', B = R60.map, R = window.R80, cs = B.cs;
  const CHAR_K = 1.2;
  const obj = uid => B.objs.find(o => o.uid === uid);
  const setBlock = (x0, y0, x1, y1, v) => { const bl = B.blocked.split(''); for (let r = Math.floor(y0 / cs); r <= Math.floor(y1 / cs); r++) for (let c = Math.floor(x0 / cs); c <= Math.floor(x1 / cs); c++) if (r >= 0 && c >= 0 && r < B.rows && c < B.cols) bl[r * B.cols + c] = v; B.blocked = bl.join(''); };

  // ---- 1. 神龙 / 石台 ----
  const fixDragon = () => { const d = obj('r80_6'); if (d && !d._r91) { d._r91 = 1; d.flat = true; } };   // r80_6 = guardian_dais（sanctum 组）：地面阶段先画，神龙（r80_5）留在排序队列里

  // ---- 2. 灵兽苑入口 ----
  { const r8 = obj('r80_8'); if (r8) r8.wclip = [r8.x - 10, r8.y - 10, r8.w + 20, 1955 - r8.y + 10]; }   // 东侧栏杆只留到 1955（地面图里也烤着这段栏杆，下面一并擦掉）
  setBlock(3760, 1958, 3840, 2160, '0');                      // 入口那段栏杆的阻挡

  // ---- 3. 湖边拐角补栏杆 ----
  { const h = obj('r80_463'), v = obj('r80_22');
    if (h) B.objs.push(Object.assign({}, h, { uid: 'r91_rail_h', x: 3634, y: 2660, sy: 2721, ax: 3634 + h.w / 2, ay: 2721, wclip: [3630, 2640, 152, 90] }));
    if (v) B.objs.push(Object.assign({}, v, { uid: 'r91_rail_v', x: 3626, y: 2702, sy: 2866, ax: 3626 + v.w / 2, ay: 2866, wclip: [3610, 2700, 60, 170] }));
    setBlock(3630, 2706, 3784, 2730, '1'); setBlock(3624, 2706, 3652, 2866, '1'); }

  // 画：裁切 + 人物放大
  const ANIMAL = /deer|crane|bird|sparrow|rabbit|cage/;
  drawBaked = (orig => function (o, now) {
    if (o && o.wclip) { const [x, y, w, h] = o.wclip; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); const r = orig.apply(this, arguments); ctx.restore(); return r; }
    if (o && o.r60 && o.pose && world.mapName === ID && !ANIMAL.test(o.pose.kind || o.pose.texture || '')) { const [ax, ay] = o.pose.anchor; ctx.save(); ctx.translate(ax, ay); ctx.scale(CHAR_K, CHAR_K); ctx.translate(-ax, -ay); const r = orig.apply(this, arguments); ctx.restore(); return r; }
    return orig.apply(this, arguments);
  })(drawBaked);
  const wrapActor = () => { drawActorT = (orig => function (a, now) {
    if (world.mapName !== ID || !a) return orig.apply(this, arguments);
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(CHAR_K, CHAR_K); ctx.translate(-a.x, -a.y); try { return orig.apply(this, arguments); } finally { ctx.restore(); }
  })(drawActorT); };
  if (document.readyState === 'complete') wrapActor(); else window.addEventListener('load', wrapActor);
  // 集市特效层会把遮挡件再画一遍（盖在湖水 / 神龙光效上），所以直接在切好的贴图上擦掉，两条画法都生效
  const cutCanvas = () => { try {
    const r8 = obj('r80_8'), c8 = r8 && IMG['cx2_' + r8.img_id]; if (c8 && c8.getContext) c8.getContext('2d').clearRect(0, (1950 - r8.y) * c8.height / r8.h, c8.width, c8.height);
    // 地面图：用左边一格（70.5px）的地砖盖掉入口那段栏杆
    const g = window.R80_GROUND; if (g && !g._r91) { const c = document.createElement('canvas'); c.width = g.width; c.height = g.height; const q = c.getContext('2d'); q.drawImage(g, 0, 0); const k = g.width / 4864;
      q.drawImage(g, (3774 - 70.5) * k, 1956 * k, 30 * k, 160 * k, 3774 * k, 1956 * k, 30 * k, 160 * k); c._r91 = 1; window.R80_GROUND = c; IMG.cx2g_tj_market = c; }
  } catch (e) { console.warn('r91 market', e); } };
  const iv = setInterval(() => { if (window.R80_OCC_READY && window.R80_GROUND && window.R80_GROUND.width) { fixDragon(); cutCanvas(); clearInterval(iv); if (window.MM_CLEAR) MM_CLEAR(ID); } }, 100);
  // ---- 5. 访客不再穿墙 / 走到悬空处：原来只检查路线端点，中间直线会横穿店铺和云海。逐段采样，不通就重新寻路 ----
  const C = B.cols, RW = B.rows;
  const free = (c, r) => { if (c < 2 || r < 2 || c >= C - 2 || r >= RW - 2) return false; const bl = B.blocked; for (let dc = -2; dc <= 2; dc++) for (let dr = -1; dr <= 1; dr++) if (bl.charCodeAt((r + dr) * C + c + dc) !== 48) return false; return true; };
  const okPx = (x, y) => free(Math.floor(x / cs), Math.floor(y / cs));
  const clear = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6); for (let i = 0; i <= n; i++) { const t = n ? i / n : 0; if (!okPx(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) return false; } return true; };
  const snap = (x, y) => { const c0 = Math.floor(x / cs), r0 = Math.floor(y / cs); for (let d = 0; d < 50; d++) for (let dr = -d; dr <= d; dr++) for (let dc = -d; dc <= d; dc++) { if (Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue; if (free(c0 + dc, r0 + dr)) return [c0 + dc, r0 + dr]; } return null; };
  function bfs(a, b) {
    const key = (c, r) => r * C + c, prev = new Int32Array(C * RW).fill(-1), q = [key(a[0], a[1])]; prev[q[0]] = q[0]; const goal = key(b[0], b[1]); let found = false;
    for (let i = 0; i < q.length; i++) { const k = q[i]; if (k === goal) { found = true; break; } const c = k % C, r = (k - c) / C;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nc = c + dc, nr = r + dr; if (!free(nc, nr)) continue; const nk = key(nc, nr); if (prev[nk] >= 0) continue; prev[nk] = k; q.push(nk); } }
    if (!found) return null; const ks = []; let k = goal; while (k !== prev[k]) { ks.push(k); k = prev[k]; } ks.push(k); ks.reverse();
    const pts = ks.map(k => { const c = k % C; return [(c + .5) * cs, ((k - c) / C + .5) * cs]; });
    const out = [pts[0]]; let i = 0; while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !clear(pts[i], pts[j])) j--; out.push(pts[j]); i = j; }   // 拉直
    return out;
  }
  let routed = false;
  function reroute() {
    const L = R60.life; let n = 0;
    for (const v of L.visitors || []) { let ch = false;
      for (const leg of v.legs || []) { const P = leg.points; let bad = false; for (let i = 0; i < P.length - 1 && !bad; i++) if (!clear(P[i], P[i + 1])) bad = true; if (!bad) continue;
        const a = snap(P[0][0], P[0][1]), b = snap(P[P.length - 1][0], P[P.length - 1][1]); if (!a || !b) continue; const np = bfs(a, b); if (np && np.length >= 2) { leg.points = np; ch = true; n++; } }
      if (ch) delete v._c; }
    for (const o of L.onlookers || []) if (o.anchor && !okPx(o.anchor[0], o.anchor[1])) { const s = snap(o.anchor[0], o.anchor[1]); if (s) o.anchor = [(s[0] + .5) * cs, (s[1] + .5) * cs]; }
    return n;
  }
  tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments); if (name === ID && !routed) { routed = true; try { window.R91_ROUTED = reroute(); } catch (e) { console.warn('r91 reroute', e); } } return r; })(tileSetMap);
  window.R91_MARKET = { fixDragon, CHAR_K, reroute };
})();
