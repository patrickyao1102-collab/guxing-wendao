// ================= R407 · 强化框：强化几级，装备格上亮几颗星钉，金纹一级比一级讲究（只进测试版）=================
// 作者 11-27 18:48：「强化等级应该是到五就顶级了，然后它会反映在那个装备栏的那个框上面。」（设计稿里我提过的 +9 作废，照旧 +5 封顶。）
// 头两版是代码画的光绕着框转——19:37：「光效感觉很差，没有那种很色彩斑斓的」；改成五色以后 19:47：「感觉更廉价了……
//   可能不是转，也有可能是那种光泽呢。你设计吧，或者你让 Codex 给你设计。」
// 第三版（这一版）不转了，也不用彩色：
//   · 看几级：格子下沿嵌一排五颗小星钉，强化几级亮几颗。
//   · 好不好看靠框本身：一张画出来的金纹框盖在格子上，一共五级——一道细金线 → 双线回纹 → 云雷纹嵌灵珠 → 斜面金边如意云头 → 整圈鎏金、
//     四角云头托四芒星、上边正中一枚星芒顶饰。金纹、星钉、宝光都是 Codex R409 画的（r409/）。
//   · 光泽：每隔几秒，一道柔光顺着金纹斜着滑过去——只在金纹上亮（拿金纹自己当模子），不盖住装备图标。亮着的星钉轻轻呼吸。
//   · 四级、五级的图标后面垫一团淡淡的宝光。
// 第四版（11-27 21:00 作者：「还是不绚丽……起码框放上去会让人感觉这个很厉害，或者整体那个界面发光」）：金纹框留着当骨架，外面加一层活的灵光（Codex R410 画的，r410/）：
//   · 一级一个颜色：银白、青、蓝、紫、赤金；光贴着框呼吸，往框外晕开。
//   · 流光：一到五道画出来的灵光顺着框跑，级越高越多越快。
//   · 四级紫色灵焰、五级赤金的焰沿着框烧，细小的光点往上飘；三级起四角时不时闪一颗星芒；五级顶饰后面放光芒。
//   · 人物面板：五件装备全到三、四、五级，立绘背后亮起对应颜色的一大团光（bodyAura）。
// 画在哪儿：人物装备面板的五个格子（r389_panel.js）、行囊装备页的栏位（r201_bag.js）、剑炉强化页上那一件（r394_forge.js）。
// 用法：REFINE_FX.under(cx, cy, r, lv, now) 在画图标之前叫（垫宝光；cx、cy、r 是图标的圆心和半径）；REFINE_FX.slot(x, y, w, h, lv, now, bare) 在画完图标之后叫（盖金纹、星钉、光泽；x、y、w、h 是那个格子；bare = 不要五淬的顶饰——行囊装备页的卡片上边正中压着「武器」那块牌子，顶饰会和它挤在一起）。
(function () {
  if (typeof ITEM_DB === 'undefined' || typeof S === 'undefined') return;
  const SRC = 300, CORNER = 96, PAD = 26;   // 金纹框原图 300 见方；四角 96 以内是角花，之外的直边可以拉长；四周多留 26 的边（顶饰要探出框外）
  const PIP = { n: 5, size: 56, gap: 27, up: 15 };   // 星钉：五颗，原图上每颗画多大、相邻两颗隔多远、圆心离下沿多高（都按 300 见方的原图算）。Codex 的星钉图 48 见方、菱形星石只占正中一小块，照 30 画在一百见方的格子上只剩三四个像素，看不清，所以放大到 56
  const SHEEN = { every: 4.4, takes: 1.15 };   // 光泽：每隔几秒来一道，一道走多久
  const AURA_COL = { 3: [120, 170, 255], 4: [169, 140, 255], 5: [255, 200, 110] };
  const lvOf = id => { try { return Math.max(0, Math.min(5, ((S.hero.refine || {})[id]) || 0)); } catch (e) { return 0; } };
  // ---- 图 ----
  const IM = {}, NAMES = ['frame_1', 'frame_2', 'frame_3', 'frame_4', 'frame_5', 'crest_5', 'pip_on', 'pip_off', 'aura'];
  const art = n => { let o = IM[n]; if (!o) { o = IM[n] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r409/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
  const IM2 = {}, N2 = ['glow_1', 'glow_2', 'glow_3', 'glow_4', 'glow_5', 'streak_1', 'streak_2', 'streak_3', 'streak_4', 'streak_5', 'flame_4', 'flame_5', 'mote', 'twinkle', 'crest_glow', 'body_aura_3', 'body_aura_4', 'body_aura_5'];
  const art2 = n => { let o = IM2[n]; if (!o) { o = IM2[n] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r410/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
  const loadAll = () => { for (const n of NAMES) art(n); for (const n of N2) art2(n); };
  setTimeout(loadAll, 8000);
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  // ---- 金纹框：九宫格拉到要的大小（3 倍像素，放大了也不糊），顶饰一起拼上；按「几级 + 多大」记住 ----
  const K = 3, CACHE = {};
  function overlay(lv, w, h, bare) { const key = lv + ':' + Math.round(w) + 'x' + Math.round(h) + (bare ? 'b' : ''); if (CACHE[key]) return CACHE[key]; const fr = art('frame_' + lv); if (!fr) return null; if (lv >= 5 && !art('crest_5')) return null;
    const W = Math.round(w * K), H = Math.round(h * K), s = Math.min(W, H) / SRC, pad = Math.round(PAD * s), c = mk(W + 2 * pad, H + 2 * pad), g = c.getContext('2d'), cs = CORNER, cd = Math.min(CORNER * s, W / 2, H / 2), ms = SRC - 2 * CORNER, mw = W - 2 * cd, mh = H - 2 * cd;
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.translate(pad, pad);
    const xs = [[0, cs, 0, cd], [cs, ms, cd, mw], [SRC - cs, cs, W - cd, cd]], ys = [[0, cs, 0, cd], [cs, ms, cd, mh], [SRC - cs, cs, H - cd, cd]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (i === 1 && j === 1) continue; const [sx, sw, dx, dw] = xs[i], [sy, sh, dy, dh] = ys[j]; if (dw > 0 && dh > 0) g.drawImage(fr, sx, sy, sw, sh, dx, dy, dw, dh); }
    if (lv >= 5 && !bare) { const cr = art('crest_5'), cw = cr.width * s, ch = cr.height * s; g.drawImage(cr, W / 2 - cw / 2, 9 * s - ch * .5, cw, ch); }   // 顶饰骑在上边那条线上（线离画布边 9）
    return (CACHE[key] = { c, s: s / K, pad: pad / K }); }   // s：原图 1 像素在屏幕上是多少（逻辑像素）；pad：四周多出来的边（逻辑像素）
  // ---- 灵光框：360 见方，正中 300 是金纹框的位置（四周多 30）；四角 126 以内不拉，直边拉长 ----
  const GCACHE = {};
  function glowC(lv, w, h) { const key = lv + ':' + Math.round(w) + 'x' + Math.round(h); if (GCACHE[key]) return GCACHE[key]; const im = art2('glow_' + lv); if (!im) return null;
    const s0 = Math.min(w, h) / 300, W = Math.round((w + 60 * s0) * K), H = Math.round((h + 60 * s0) * K), s = s0 * K, c = mk(W, H), g = c.getContext('2d'), S0 = 360, cs = 126, cd = Math.min(cs * s, W / 2, H / 2), ms = S0 - 2 * cs, mw = W - 2 * cd, mh = H - 2 * cd;
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    const xs = [[0, cs, 0, cd], [cs, ms, cd, mw], [S0 - cs, cs, W - cd, cd]], ys = [[0, cs, 0, cd], [cs, ms, cd, mh], [S0 - cs, cs, H - cd, cd]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (i === 1 && j === 1) continue; const [sx, sw, dx, dw] = xs[i], [sy, sh, dy, dh] = ys[j]; if (dw > 0 && dh > 0) g.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh); }
    return (GCACHE[key] = { c, pad: 30 * s0 }); }
  // 框上一圈的路（贴着金线走，离格子边 9、切角不管）：t 从 0 到 1 绕一圈，给出点和方向
  function onPath(x, y, w, h, s, t) { const d = 9 * s, X0 = x + d, Y0 = y + d, X1 = x + w - d, Y1 = y + h - d, a = X1 - X0, b = Y1 - Y0, P = 2 * (a + b); let u = ((t % 1) + 1) % 1 * P;
    if (u < a) return [X0 + u, Y0, 0]; u -= a; if (u < b) return [X1, Y0 + u, Math.PI / 2]; u -= b; if (u < a) return [X1 - u, Y1, Math.PI]; u -= a; return [X0, Y1 - u, -Math.PI / 2]; }
  const STREAK = { 1: [1, .055], 2: [1, .07], 3: [2, .085], 4: [2, .1], 5: [3, .12] };   // 几道流光、每秒走一圈的几分之几
  // 灵光、流光、灵焰、光点：盖在金纹框底下和外面的那一层
  function aura2(x, y, w, h, lv, now, bare, top) { const s = Math.min(w, h) / 300, t = now / 1000, ph = x * .013 + y * .007;
    if (!top) { const gc = glowC(lv, w, h); if (gc) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (lv >= 4 ? .85 : .75) + (lv >= 4 ? .15 : .25) * Math.sin(t * (1.6 + lv * .25) + ph); ctx.drawImage(gc.c, x - gc.pad, y - gc.pad, w + 2 * gc.pad, h + 2 * gc.pad); if (lv <= 2) ctx.drawImage(gc.c, x - gc.pad, y - gc.pad, w + 2 * gc.pad, h + 2 * gc.pad); ctx.restore(); }   // 一二级的光本来就淡，叠两遍才看得出
      if (lv >= 5 && !bare) { const cg = art2('crest_glow'); if (cg) { const cw = 240 * s * 1.25, ch = 140 * s * 1.25; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .7 + .3 * Math.sin(t * 2.2 + ph); ctx.drawImage(cg, x + w / 2 - cw / 2, y + 9 * s - ch / 2, cw, ch); ctx.restore(); } }
      return; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // 流光
    const st = art2('streak_' + lv); if (st) { const [n, sp] = STREAK[lv], L = Math.min(w, h) * (lv >= 4 ? .62 : .5), th = L * 48 / 192;
      for (let i = 0; i < n; i++) { const [px, py, an] = onPath(x, y, w, h, s, t * sp * (300 / Math.max(w, h)) * 1.6 + i / n + ph * .1); ctx.save(); ctx.translate(px, py); ctx.rotate(an); ctx.globalAlpha = .95; ctx.drawImage(st, -L + th * .3, -th / 2, L, th); ctx.restore(); } }
    // 灵焰：上沿四簇、两侧各两簇（侧面的朝外倒）
    const fl = lv >= 4 ? art2('flame_' + lv) : null; if (fl) { const fh = Math.min(w, h) * (lv >= 5 ? .3 : .24), fw = fh * 96 / 128, d = 9 * s;
      const spots = (bare ? [[.66, 0, 0], [.86, 0, 0]] : [[.2, 0, 0], [.4, 0, 0], [.6, 0, 0], [.8, 0, 0]]).concat([[0, .3, -1], [0, .62, -1], [1, .3, 1], [1, .62, 1]]);   // 行囊的长卡片上沿左边压着「武器」那块牌子，焰只放右边
      spots.forEach(([u, v, side], k) => { const fr = Math.floor(t * 12 + k * 3) % 8, sk = side ? .72 : 1, px = side ? (side < 0 ? x + d : x + w - d) : x + w * u, py = side ? y + h * v : y + d, sc = .8 + .25 * Math.sin(t * 5 + k * 1.7);
        ctx.save(); ctx.translate(px, py); ctx.rotate(side * Math.PI / 2); ctx.globalAlpha = .9; ctx.drawImage(fl, fr * 96, 0, 96, 128, -fw * sc * sk / 2, -fh * sc * sk * .92, fw * sc * sk, fh * sc * sk); ctx.restore(); }); }
    // 往上飘的光点（四级起）
    const mo = lv >= 4 ? art2('mote') : null; if (mo) { const n = lv >= 5 ? 9 : 6, col = lv >= 5 ? 1 : .8;
      for (let k = 0; k < n; k++) { const life = 2.4, a = ((t + k * life / n + ph) % life) / life, sx = x + w * (.08 + .84 * ((k * .618 + Math.floor((t + k * life / n + ph) / life) * .37) % 1)), sy = y + h - a * (h + 30 * s), r = (lv >= 5 ? 14 : 11) * s * (1.4 - a * .6) * 2.4;
        ctx.globalAlpha = col * Math.sin(Math.PI * a); ctx.drawImage(mo, sx - r / 2, sy - r / 2, r, r); } }
    // 四角的星芒（三级起，轮流闪）
    const tw = lv >= 3 ? art2('twinkle') : null; if (tw) { const corners = [[x + 9 * s, y + 9 * s], [x + w - 9 * s, y + 9 * s], [x + w - 9 * s, y + h - 9 * s], [x + 9 * s, y + h - 9 * s]], per = lv >= 5 ? 1.1 : 1.7;
      corners.forEach(([cx, cy], k) => { const a = ((t + k * per / 4 + ph) % per) / per; if (a > .35) return; const kk = Math.sin(Math.PI * a / .35), r = (lv >= 5 ? 70 : 54) * s * kk + 4; ctx.globalAlpha = kk; ctx.drawImage(tw, cx - r / 2, cy - r / 2, r, r); }); }
    ctx.restore(); }
  // 人物立绘背后的光：五件都到三级以上，看最低的那一件是几级
  function bodyAura(cx, footY, hgt, lv, now) { try { if (lv < 3) return; const im = art2('body_aura_' + Math.min(5, lv)); if (!im) return; const t = now / 1000, H = hgt * 1.15, W = H * im.width / im.height;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (lv >= 5 ? .8 : .6) + .2 * Math.sin(t * 1.4); ctx.drawImage(im, cx - W / 2, footY - H * .92, W, H); ctx.restore(); } catch (e) { try { ctx.restore(); } catch (e2) {} } }
  // ---- 宝光：白图按等级上色，记住 ----
  const AURA = {};
  function aura(lv) { if (AURA[lv]) return AURA[lv]; const im = art('aura'), col = AURA_COL[lv]; if (!im || !col) return null; const c = mk(im.width, im.height), g = c.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; g.fillRect(0, 0, c.width, c.height); return (AURA[lv] = c); }
  // 垫在图标后面的那一层（四级、五级才有）。cx、cy、r：图标的圆心和半径
  function under(cx, cy, r, lv, now) { try { lv = Math.max(0, Math.min(5, lv | 0)); if (lv < 3) return; const a = aura(lv); if (!a) return; const R = r * (lv >= 5 ? 1.6 : 1.45), br = .85 + .15 * Math.sin(now / 900 + cx * .01);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= (lv >= 5 ? .5 : .34) * br; ctx.imageSmoothingEnabled = true; ctx.drawImage(a, cx - R, cy - R, R * 2, R * 2); ctx.restore(); } catch (e) { try { ctx.restore(); } catch (e2) {} } }
  // 盖在图标上面的那一层：金纹框、星钉、光泽
  const SCR = {};
  function slot(x, y, w, h, lv, now, bare) { try { lv = Math.max(0, Math.min(5, lv | 0)); if (!lv) return; const ov = overlay(lv, w, h, bare); if (!ov) { loadAll(); return; } const on = art('pip_on'), off = art('pip_off'); if (!on || !off) return;
      const p = ov.pad, ox = x - p, oy = y - p, ow = w + 2 * p, oh = h + 2 * p;
      aura2(x, y, w, h, lv, now, bare, false);   // 灵光垫在金纹框底下
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(ov.c, ox, oy, ow, oh);
      // 星钉：五颗，亮 lv 颗；亮着的轻轻呼吸，各有各的节拍
      const s = ov.s, ps = PIP.size * s, py = y + h - PIP.up * s, t = now / 1000;
      for (let i = 0; i < PIP.n; i++) { const px = x + w / 2 + (i - (PIP.n - 1) / 2) * PIP.gap * s, lit = i < lv; ctx.globalAlpha = 1; ctx.drawImage(lit ? on : off, px - ps / 2, py - ps / 2, ps, ps);
        if (lit) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .28 + .22 * Math.sin(t * 2.1 + i * 1.3 + x * .02); ctx.drawImage(on, px - ps / 2, py - ps / 2, ps, ps); ctx.restore(); } }
      // 光泽：一道斜着的柔光从左上滑到右下，只落在金纹上（拿金纹自己当模子）
      const ph = ((t + (x * .0031 + y * .0017)) % SHEEN.every) / SHEEN.takes;
      if (ph < 1) { const W = ov.c.width, H = ov.c.height, key = W + 'x' + H, sc = SCR[key] || (SCR[key] = mk(W, H)), g = sc.getContext('2d');
        g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); g.drawImage(ov.c, 0, 0);
        const D = W + H, bw = D * .2, c0 = -bw + (D + 2 * bw) * ph, gr = g.createLinearGradient((c0 - bw) / 2, (c0 - bw) / 2, (c0 + bw) / 2, (c0 + bw) / 2);   // 沿着对角线方向的一条带子，中心走在 x + y = c0 这条斜线上
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,250,232,' + (lv >= 5 ? .95 : lv >= 3 ? .8 : .62) + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.globalCompositeOperation = 'source-in'; g.fillStyle = gr; g.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.sin(Math.PI * ph); ctx.drawImage(sc, ox, oy, ow, oh); }
      ctx.restore(); aura2(x, y, w, h, lv, now, bare, true); } catch (e) { try { ctx.restore(); } catch (e2) {} } }
  window.REFINE_FX = { lvOf, under, slot, bodyAura, ready: () => NAMES.every(n => !!art(n)) && N2.every(n => !!art2(n)), loadAll };
})();
