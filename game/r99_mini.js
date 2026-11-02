// ================= R99 · 锁灵阵破阵 + 九曜识海领悟：换成 Codex 画的素材（作者 11-03：画面很差）=================
// 素材全是 Codex 画的独立透明图（阵眼四态、光链、玉牌、匾额、碎链、爆光八帧；识海星空、九曜两态、入定背影、星光、突破光环），
// 代码只负责摆放、呼吸明暗、闪烁和淡入淡出。阵盘和星盘都不旋转（作者看转的会头晕）。素材没载入完时退回原来的画法。
(function () {
  const LOC = !!(window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const MAP = {"sl":{"sl_burst01":[0,0,768,768],"sl_burst02":[770,0,768,768],"sl_burst03":[1540,0,768,768],"sl_burst04":[2310,0,768,768],"sl_burst05":[3080,0,768,768],"sl_burst06":[0,770,768,768],"sl_burst07":[770,770,768,768],"sl_burst08":[1540,770,768,768],"sl_shard01":[2310,770,256,256],"sl_shard02":[2568,770,256,256],"sl_shard03":[2826,770,256,256],"sl_shard04":[3084,770,256,256],"sl_shard05":[3342,770,256,256],"sl_shard06":[3600,770,256,256],"sl_eye0":[3858,770,192,192],"sl_eye1":[0,1540,192,192],"sl_eye2":[194,1540,192,192],"sl_eye3":[388,1540,192,192],"sl_plaque":[582,1540,1000,120],"sl_btn_n":[1584,1540,400,104],"sl_btn_p":[1986,1540,400,104],"sl_chain":[2388,1540,512,64],"sl_tipbar":[2902,1540,900,64]},"jy":{"jy_beam":[0,0,256,1200],"jy_hero":[258,0,600,600],"jy_ring":[860,0,1024,512],"jy_star01_on":[1886,0,256,256],"jy_star01_off":[2144,0,256,256],"jy_star02_on":[2402,0,256,256],"jy_star02_off":[2660,0,256,256],"jy_star03_on":[2918,0,256,256],"jy_star03_off":[3176,0,256,256],"jy_star04_on":[3434,0,256,256],"jy_star04_off":[3692,0,256,256],"jy_star05_on":[0,1202,256,256],"jy_star05_off":[258,1202,256,256],"jy_star06_on":[516,1202,256,256],"jy_star06_off":[774,1202,256,256],"jy_star07_on":[1032,1202,256,256],"jy_star07_off":[1290,1202,256,256],"jy_star08_on":[1548,1202,256,256],"jy_star08_off":[1806,1202,256,256],"jy_star09_on":[2064,1202,256,256],"jy_star09_off":[2322,1202,256,256]}};
  const SRC = { sl: LOC ? 'r99/r99_sl.webp' : '/_blob/69640d798cf056130efb7898bce94b55', jy: LOC ? 'r99/r99_jy.webp' : '/_blob/2bb05b42272960809c7438e78a617c6e', bg: LOC ? 'r99/r99_jy_bg.webp' : '/_blob/895353106177a801ded98b755d7a4c79' };
  const PG = {}, ok = {}; for (const k in SRC) { const im = new Image(); im.onload = () => { ok[k] = 1; }; im.src = SRC[k]; PG[k] = im; }
  // 画一件素材：(x,y) 是素材中心，s 是缩放（素材按 2 倍图画的，默认 0.5）
  function spr(pg, k, x, y, s, a, w, h) { const e = MAP[pg][k]; if (!e || !(a > .003)) return; const ww = (w || e[2]) * s, hh = (h || e[3]) * s; const ga = ctx.globalAlpha; ctx.globalAlpha = ga * Math.min(1, a); ctx.drawImage(PG[pg], e[0], e[1], e[2], e[3], x - ww / 2, y - hh / 2, ww, hh); ctx.globalAlpha = ga; }
  const ez = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };

  // ---------------- 锁灵阵 ----------------
  let layer = null, lastSeal = null, win = null;
  function chain(p, q, a) {   // 光链沿两个阵眼铺开：按原比例重复铺设，不把链节拉扁
    const e = MAP.sl.sl_chain, dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy), seg = e[2] * .5, h = e[3] * .5;
    ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.atan2(dy, dx)); ctx.globalAlpha *= a;
    for (let x = 0; x < len; x += seg) { const w = Math.min(seg, len - x); ctx.drawImage(PG.sl, e[0], e[1], e[2] * w / seg, e[3], x, -h / 2, w, h); }
    ctx.restore();
  }
  function drawSeal(s, now) {
    const t = (now - s.t0) / 1000, n = s.order.length;
    ctx.save();
    if (typeof has === 'function' && has('sq_sealbg')) ctx.drawImage(IMG.sq_sealbg, 0, 0, W, H); else { ctx.fillStyle = '#040612'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = 'rgba(4,6,18,.22)'; ctx.fillRect(0, 0, W, H);
    const demo = t < 2.4 ? Math.floor(t / (2.4 / n)) : -1, errA = s.err ? 1 - ez(t / .6) : 0;
    for (let k = 1; k < s.step; k++) chain(s.pts[s.order[k - 1]], s.pts[s.order[k]], .95);
    s.pts.forEach((p, i) => {
      const k = s.order.indexOf(i), lit = k < s.step, br = 1 + .03 * Math.sin(now / 400 + i);
      spr('sl', 'sl_eye0', p[0], p[1], .5 * br, 1);
      if (lit) spr('sl', 'sl_eye2', p[0], p[1], .5 * br, 1);
      if (k === demo) spr('sl', 'sl_eye1', p[0], p[1], .56, 1);
      if (errA > 0) spr('sl', 'sl_eye3', p[0], p[1], .5, errA);
    });
    for (const q of s.taps || []) { const a = (now - q.t) / 450; if (a >= 1) continue; ctx.globalAlpha = 1 - a; ctx.strokeStyle = q.bad ? '#ff8a7a' : '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q.x, q.y, 22 + a * 40, 0, 7); ctx.stroke(); } ctx.globalAlpha = 1;
    // 匾额 + 提示条 + 玉牌按钮（字用游戏字体写在上面）
    spr('sl', 'sl_plaque', W / 2, 58, .5, 1);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `34px ${BRUSH}`; textOutline(s.cfg.title || '锁灵阵', W / 2, 60, '#fff0c4', '#1a0800', 4);
    spr('sl', 'sl_tipbar', W / 2, H - 132, .5, .95);
    ctx.font = `600 19px ${FONT}`; ctx.fillStyle = '#eef4ff';
    ctx.fillText(t < 2.4 ? '记住星位亮起的顺序……（点屏幕可跳过）' : s.err ? '顺序错了！阵纹反噬，重新来过' : '按刚才的顺序点亮阵眼（' + s.step + ' / ' + n + '）', W / 2, H - 131);
    const SB = { again: { x: W / 2 - 230, y: H - 78, w: 200, h: 52 }, leave: { x: W / 2 + 30, y: H - 78, w: 200, h: 52 } };
    const down = typeof input !== 'undefined' && input.down;
    for (const [r, txt] of [[SB.again, '重新演示'], [SB.leave, '暂时离开']]) {
      const pr = down && input.x >= r.x && input.x <= r.x + r.w && input.y >= r.y && input.y <= r.y + r.h;
      spr('sl', pr ? 'sl_btn_p' : 'sl_btn_n', r.x + r.w / 2, r.y + r.h / 2, .5, 1);
      ctx.font = `26px ${BRUSH}`; ctx.fillStyle = pr ? '#f4fbff' : '#24324a'; ctx.fillText(txt, r.x + r.w / 2, r.y + r.h / 2 + 2);
    }
    ctx.restore();
  }
  function drawWin(now) {   // 破阵成功：爆光八帧 + 碎链四散 + 阵图淡出
    const t = (now - win.t0) / 1000; if (t > 1.5) { win = null; return; }
    const s = win.s, fade = 1 - ez((t - 1.0) / .5);
    ctx.save(); ctx.globalAlpha = fade;
    if (typeof has === 'function' && has('sq_sealbg')) ctx.drawImage(IMG.sq_sealbg, 0, 0, W, H);
    for (let k = 1; k < s.order.length; k++) chain(s.pts[s.order[k - 1]], s.pts[s.order[k]], 1 - ez(t / .25));
    s.pts.forEach(p => spr('sl', 'sl_eye2', p[0], p[1], .5, 1 - ez(t / .4)));
    for (let i = 0; i < 12; i++) { const a = i * 2.399 + .4, d = 60 + ez(t / 1.1) * (260 + (i % 4) * 60), k = 'sl_shard0' + (1 + i % 6);
      spr('sl', k, W / 2 + Math.cos(a) * d * 1.3, H / 2 + Math.sin(a) * d * .8 + t * t * 60, .38, 1 - ez((t - .6) / .7)); }
    const f = Math.min(7, Math.floor(t / .09)), mix = t / .09 - f;
    spr('sl', 'sl_burst0' + (f + 1), W / 2, H / 2, .8, 1 - (f === 7 ? ez((t - .63) / .5) : 0));
    if (f < 7) spr('sl', 'sl_burst0' + (f + 2), W / 2, H / 2, .8, mix * .6);
    ctx.restore();
  }
  (function hook(n) {
    if (typeof S === 'undefined' || !S.overlay || !window.SEAL_PEEK) { if ((n || 0) < 80) setTimeout(() => hook((n || 0) + 1), 250); return; }
    layer = S.overlay.find(o => o && o.draw && /记住星位亮起的顺序/.test(String(o.draw)));
    if (!layer) return;
    const orig = layer.draw;
    layer.draw = function () {
      const s = SEAL_PEEK(), now = performance.now();
      if (lastSeal && !s && lastSeal.step >= lastSeal.order.length && ok.sl) { win = { t0: now, s: lastSeal }; try { playSnd('sfx_boom', .5); } catch (e) {} }
      lastSeal = s;
      if (!s && win) { drawWin(now); return; }   // 爆光演完再把地图 HUD 放回来
      if (!s || !ok.sl) return orig.apply(this, arguments);
      drawSeal(s, now); if (window.SEAL_INPUT) SEAL_INPUT();
    };
  })();

  // ---------------- 九曜识海 ----------------
  const STARS = [[640, 155], [486, 125], [793, 125], [344, 205], [933, 205], [252, 325], [1027, 325], [410, 365], [870, 365]];
  const NAMES = ['天枢', '天璇', '天玑', '天权', '玉衡', '开阳', '摇光', '洞明', '隐元'];
  (function hookSea(n) {
    if (typeof starSea !== 'function') { if ((n || 0) < 80) setTimeout(() => hookSea((n || 0) + 1), 250); return; }
    const orig = starSea;
    starSea = async function (ms = 5200, onLevel) {
      if (!(ok.jy && ok.bg)) return orig(ms, onLevel);
      const o = { t: 0 }, rings = []; S.overlay.push(o);
      const HX = 640, HY = 700;   // 叶孤星入定背影：底部锚点
      o.draw = () => {
        const k = o.t / ms, a = Math.min(1, o.t / 500) * (k > .92 ? (1 - k) / .08 : 1), sec = o.t / 1000;
        ctx.save(); ctx.globalAlpha = a;
        ctx.drawImage(PG.bg, 0, 0, W, H);
        // 九曜：先依次浮现（沉睡态），天枢在 25% 时点亮
        const on = ez((k - .2) / .08);
        STARS.forEach((p, i) => { const show = ez((sec - .15 - i * .07) / .45), tw = .82 + .18 * Math.sin(sec * 2.2 + i * 1.7);
          if (i === 0) { spr('jy', 'jy_star01_off', p[0], p[1], .5, show * (1 - on)); spr('jy', 'jy_star01_on', p[0], p[1], .5 * (1 + .25 * Math.sin(Math.min(1, on) * Math.PI) * (1 - ez((k - .3) / .1))), on * (.92 + .08 * Math.sin(sec * 3))); }
          else spr('jy', 'jy_star0' + (i + 1) + '_off', p[0], p[1], .5, show * tw); });
        // 星光从天枢垂直降入体内
        const bA = ez((k - .25) / .06) * (1 - ez((k - .82) / .1));
        if (bA > 0) { const e = MAP.jy.jy_beam, top = STARS[0][1] + 18, bot = HY - 210, len = (bot - top) * ez((k - .25) / .12);
          ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a * bA * (.85 + .15 * Math.sin(sec * 7));
          ctx.drawImage(PG.jy, e[0], e[1], e[2], e[3], STARS[0][0] - e[2] * .25, top, e[2] * .5, len); ctx.restore(); }
        // 突破光环（练气七 / 八 / 九重各一次）
        for (const r of rings) { const q = (o.t - r) / 900; if (q < 0 || q > 1) continue; ctx.save(); ctx.globalCompositeOperation = 'screen'; spr('jy', 'jy_ring', HX, HY - 40, .25 + .6 * ez(q), 1 - ez((q - .35) / .65)); ctx.restore(); }
        spr('jy', 'jy_hero', HX, HY - 270 * .5 + 15, .5, 1);
        ctx.font = `40px ${BRUSH}`; ctx.textAlign = 'center'; textOutline(NAMES[0], STARS[0][0] + 84, STARS[0][1] + 6, '#fff1c8', '#1a1030', 4);
        ctx.restore();
      };
      const t0 = performance.now(); let lv = 0; const marks = [.5, .64, .78];
      while (performance.now() - t0 < ms) { o.t = performance.now() - t0; if (lv < 3 && o.t / ms > marks[lv]) { lv++; rings.push(o.t); onLevel && onLevel(lv); } await nextFrame(); }
      S.overlay.splice(S.overlay.indexOf(o), 1);
    };
  })();
  window.R99_MINI = { ok, MAP, get win() { return win; }, get last() { return lastSeal && { step: lastSeal.step, n: lastSeal.order.length }; } };
})();
