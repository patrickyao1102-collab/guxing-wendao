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
// 画在哪儿：人物装备面板的五个格子（r389_panel.js）、行囊装备页的栏位（r201_bag.js）、剑炉强化页上那一件（r394_forge.js）。
// 用法：REFINE_FX.under(cx, cy, r, lv, now) 在画图标之前叫（垫宝光；cx、cy、r 是图标的圆心和半径）；REFINE_FX.slot(x, y, w, h, lv, now, bare) 在画完图标之后叫（盖金纹、星钉、光泽；x、y、w、h 是那个格子；bare = 不要五淬的顶饰——行囊装备页的卡片上边正中压着「武器」那块牌子，顶饰会和它挤在一起）。
(function () {
  if (typeof ITEM_DB === 'undefined' || typeof S === 'undefined') return;
  const SRC = 300, CORNER = 96, PAD = 26;   // 金纹框原图 300 见方；四角 96 以内是角花，之外的直边可以拉长；四周多留 26 的边（顶饰要探出框外）
  const PIP = { n: 5, size: 56, gap: 27, up: 15 };   // 星钉：五颗，原图上每颗画多大、相邻两颗隔多远、圆心离下沿多高（都按 300 见方的原图算）。Codex 的星钉图 48 见方、菱形星石只占正中一小块，照 30 画在一百见方的格子上只剩三四个像素，看不清，所以放大到 56
  const SHEEN = { every: 4.4, takes: 1.15 };   // 光泽：每隔几秒来一道，一道走多久
  const AURA_COL = { 4: [169, 180, 255], 5: [255, 217, 138] };
  const lvOf = id => { try { return Math.max(0, Math.min(5, ((S.hero.refine || {})[id]) || 0)); } catch (e) { return 0; } };
  // ---- 图 ----
  const IM = {}, NAMES = ['frame_1', 'frame_2', 'frame_3', 'frame_4', 'frame_5', 'crest_5', 'pip_on', 'pip_off', 'aura'];
  const art = n => { let o = IM[n]; if (!o) { o = IM[n] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r409/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
  const loadAll = () => { for (const n of NAMES) art(n); };
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
  // ---- 宝光：白图按等级上色，记住 ----
  const AURA = {};
  function aura(lv) { if (AURA[lv]) return AURA[lv]; const im = art('aura'), col = AURA_COL[lv]; if (!im || !col) return null; const c = mk(im.width, im.height), g = c.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; g.fillRect(0, 0, c.width, c.height); return (AURA[lv] = c); }
  // 垫在图标后面的那一层（四级、五级才有）。cx、cy、r：图标的圆心和半径
  function under(cx, cy, r, lv, now) { try { lv = Math.max(0, Math.min(5, lv | 0)); if (lv < 4) return; const a = aura(lv); if (!a) return; const R = r * (lv >= 5 ? 1.5 : 1.4), br = .85 + .15 * Math.sin(now / 900 + cx * .01);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= (lv >= 5 ? .5 : .34) * br; ctx.imageSmoothingEnabled = true; ctx.drawImage(a, cx - R, cy - R, R * 2, R * 2); ctx.restore(); } catch (e) { try { ctx.restore(); } catch (e2) {} } }
  // 盖在图标上面的那一层：金纹框、星钉、光泽
  const SCR = {};
  function slot(x, y, w, h, lv, now, bare) { try { lv = Math.max(0, Math.min(5, lv | 0)); if (!lv) return; const ov = overlay(lv, w, h, bare); if (!ov) { loadAll(); return; } const on = art('pip_on'), off = art('pip_off'); if (!on || !off) return;
      const p = ov.pad, ox = x - p, oy = y - p, ow = w + 2 * p, oh = h + 2 * p;
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
      ctx.restore(); } catch (e) { try { ctx.restore(); } catch (e2) {} } }
  window.REFINE_FX = { lvOf, under, slot, ready: () => NAMES.every(n => !!art(n)), loadAll };
})();
