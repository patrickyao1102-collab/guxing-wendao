// ================= R175 · 青竹小院碰撞清理（作者 11-10：「很多碰撞也有问题」「草地边缘也都走不了，你要仔细检查每一个地方」）=================
// 小院（含西院扩建）的阻挡表是整块烘出来的：房子把整张贴图（连屋顶、屋顶上面那条草地）都挡住了，草地上还散着一些看不见的阻挡块。
// 进图、等 r66 按贴图补完阻挡以后，这里再过一遍：
//   ① 房子只挡屋身和台基（贴图下半截），屋顶那一截放开——人能从屋后、屋侧的草地和石板路走过去（被屋顶挡住是正常的前后遮挡）；
//   ② 不在任何物件贴图里、地面又是草地或石板路的阻挡块（看不见的墙）放开；
//   ③ 其余（物件真实轮廓、池水、崖边、云海、地图边沿的泥地）照旧挡住；出入口、门口光阵周围不动。
(function () {
  if (typeof TMAPS === 'undefined' || typeof tileSetMap !== 'function') return;
  const MAPS = { qingzhu_court: 1 };
  const HOUSE = /house|cottage|kitchen|hall|room|pavilion_main/i;
  const FOOT = .52;   // 房子从脚底往上挡这么高（屋身 + 台基），再往上是屋顶
  const BAND = id => /gate|arch|torii|paifang/i.test(id) ? .3 : /pine|cherry|tree|willow|bamboo|peach|plum|maple/i.test(id) ? .14 : /rail|fence|balustrade/i.test(id) ? .85 : /rock|stone|flower|bench|trough|perch|lantern|well|stall|cart|crate|barrel|pot|statue|garden|laundry/i.test(id) ? .7 : /wall/i.test(id) ? .95 : .5;
  const alpha = im => { if (im._q175a) return im._q175a; const w = im.width || im.naturalWidth, h = im.height || im.naturalHeight; if (!w || !h) return null;
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
    try { return (im._q175a = { w, h, d: g.getImageData(0, 0, w, h).data }); } catch (e) { return null; } };
  // 地面颜色：草绿才算「本来能走」
  const walkableGround = (r, g, b) => {
    return g > r + 8 && g > b + 12 && g > 70; };   // 只认草地——灰色的石板和崖石分不开，石板路上的阻挡只在屋顶那一截放开
  function clean(T, def) {
    const B = T.block, cs = T.cs || 8, x0 = T.x0 || 0, R = B.length, C = B[0].length; if (!R) return 0;
    if (T._q175) return apply(T, T._q175);   // 算过一次就只重放（别的模块晚到、又把整张表写回去时用）
    // 地面图（含西院）
    let gc = null; try { gc = renderGround(T, def); } catch (e) {}
    const G = document.createElement('canvas'); G.width = C; G.height = R; const gx = G.getContext('2d', { willReadFrequently: true });
    gx.imageSmoothingEnabled = true; try { if (gc) gx.drawImage(gc, 0, 0, gc.width, gc.height, 0, 0, C, R); const bg = def.baked && IMG[def.baked.ground]; if (bg) gx.drawImage(bg, 0, 0, bg.width, bg.height, -x0 / cs, 0, bg.width / cs, bg.height / cs); } catch (e) { return 0; }
    let px; try { px = gx.getImageData(0, 0, C, R).data; } catch (e) { return 0; }
    // 每格：落在哪些物件贴图里、是不是该物件的阻挡带、是不是房子的屋顶
    const keep = new Uint8Array(R * C), roof = new Uint8Array(R * C), cover = new Uint8Array(R * C);
    for (const o of T.objs || []) { if (!o.bk || o.flat || !o.img) continue; const im = IMG[o.img]; if (!im) continue; const A = alpha(im); if (!A) continue;
      const id = o.id || o.img || '', house = (HOUSE.test(id) || HOUSE.test(o.img || '')) && o.w > 200 && o.h > 150;
      const band = house ? FOOT : BAND(id), y0 = o.sy - o.h * band, rail = /rail|fence|balustrade/i.test(id + ' ' + (o.img || ''));
      const c0 = Math.max(0, Math.floor((o.x - x0) / cs)), c1 = Math.min(C - 1, Math.floor((o.x + o.w - x0) / cs)), r0 = Math.max(0, Math.floor(o.y / cs)), r1 = Math.min(R - 1, Math.floor((o.y + o.h) / cs));
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) { const i = r * C + c, wx = (c + .5) * cs + x0, wy = (r + .5) * cs;
        let u = (wx - o.x) / o.w; if (o.flip) u = 1 - u; const ax = Math.floor(u * A.w), ay = Math.floor((wy - o.y) / o.h * A.h);
        if (ax < 0 || ay < 0 || ax >= A.w || ay >= A.h) continue; const op = A.d[(ay * A.w + ax) * 4 + 3] > 60;
        if (op) cover[i] = 1;
        if (wy >= y0 - cs * .5 && wy <= o.sy + cs) { if (op || rail) keep[i] = 1; }   // 栏杆整段挡住，栏杆缝里不能钻过去
        else if (house) roof[i] = 1; } }
    // 西院用：任何物件（不管它自己带不带阻挡）盖住的格子
    const cover2 = new Uint8Array(R * C);
    for (const o of T.objs || []) { if (o.flat || !o.img) continue; const c0 = Math.max(0, Math.floor((o.x - x0) / cs) - 1), c1 = Math.min(C - 1, Math.floor((o.x + o.w - x0) / cs) + 1), r0 = Math.max(0, Math.floor(o.y / cs) + 2), r1 = Math.min(R - 1, Math.floor((o.y + o.h) / cs) + 1); for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) cover2[r * C + c] = 1; }
    // 出入口、门口光阵、落脚点周围不动
    const fixed = new Uint8Array(R * C); const pin = (wx, wy, rad) => { const c0 = Math.floor((wx - x0) / cs), r0 = Math.floor(wy / cs), k = Math.ceil(rad / cs); for (let dr = -k; dr <= k; dr++) for (let dc = -k; dc <= k; dc++) { const c = c0 + dc, r = r0 + dr; if (c >= 0 && r >= 0 && c < C && r < R) fixed[r * C + c] = 1; } };
    for (const d of T.doors || []) if (d.x != null && d.w) pin((d.x + d.w / 2) * cs, (d.y + d.h / 2) * cs, (Math.max(d.w, d.h) * cs) / 2 + 24);
    // 崖边、云海、水面这类「地形阻挡」（挡着、地面又不是草、也不在任何物件里）往外 48px 不放开，免得从栏杆缝、崖边草丛走出去
    const terr = new Uint8Array(R * C), near = new Uint8Array(R * C), K = Math.ceil(48 / cs);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const i = r * C + c, k = i * 4; if (B[r][c] && !cover[i] && !walkableGround(px[k], px[k + 1], px[k + 2])) terr[i] = 1; }
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (terr[r * C + c]) for (let dr = -K; dr <= K; dr++) { const rr = r + dr; if (rr < 0 || rr >= R) continue; for (let dc = -K; dc <= K; dc++) { const cc = c + dc; if (cc >= 0 && cc < C) near[rr * C + cc] = 1; } }
    const open = new Uint8Array(R * C);
    for (let r = 1; r < R - 1; r++) for (let c = 1; c < C - 1; c++) { const i = r * C + c; if (keep[i] || fixed[i]) continue;
      const k = i * 4; if (roof[i] || (!cover[i] && !near[i] && walkableGround(px[k], px[k + 1], px[k + 2]))) open[i] = 1;   // ① 屋顶那一截 ② 看不见的墙
      // ③ 西院（x<0 那半边）是一块平地，没有崖、没有水：不在任何物件贴图里的阻挡一律放开（作者 11-10：阿福屋顶上面那条草地有一道空气墙——那里采到的地面色是灰的，②认不出来）
      else if (!cover2[i]) { const wx = (c + .5) * cs + x0, wy = (r + .5) * cs; if (wx < -24 && wx > x0 + 72 && wy > 72 && wy < R * cs - 72) open[i] = 1; } }
    if (window.R175Q_DEBUG) window.R175Q_DBG = { T, keep, roof, cover, fixed, px, C, R, x0, cs, before: B.map(r => r.slice()) };
    T._q175 = { open, C }; return apply(T, T._q175);
  }
  function apply(T, Q) { const B = T.block, R = B.length, C = Q.C; let n = 0;
    for (let r = 0; r < R; r++) { const row = B[r]; for (let c = 0; c < C; c++) if (row[c] && Q.open[r * C + c]) { row[c] = 0; n++; } }
    if (n) T._stand = null; return n; }
  setInterval(() => { try {
    const m = world.mapName; if (!MAPS[m] || !world.map || !world.map.T) return; const T = world.map.T;
    if (window.MAP_READY && !MAP_READY()) return;
    const R66 = window.R66_COLLIDE; if (R66 && window.CXB2 && CXB2[m] && R66.done[m] == null) return;   // 等 r66 先按贴图补完
    // 进图后前 20 秒每 1.5 秒重放一次：r66 的贴图碰撞有时晚到，会把整张表写回去
    const st = T._q175t || (T._q175t = { n: 0, t: 0 }), t = performance.now(); if (st.n >= 14 || t - st.t < 1500) return; st.n++; st.t = t;
    if (window.R175Q_DEBUG && st.n === 1) window.R175Q_BEFORE = T.block.map(r => r.slice());
    const n = clean(T, world.map.def || TMAPS[m]); if (st.n === 1 || n) window.R175Q_LAST = { map: m, opened: n, run: st.n };
  } catch (e) { console.warn('r175q', e); } }, 500);
  window.R175Q = { clean };
})();
