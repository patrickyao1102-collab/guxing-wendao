// ================= R256 · 街头路人换成八向行走（作者 11-13：路人走路像鬼畜 → 学叶孤星 / 四伙伴，出八向行走）=================
// Codex R253 重做的路人行走图：和四伙伴同一格式——每人一张 2016×1200，五行 = 下 / 左下 / 左 / 左上 / 上，第 0 格站立，第 1–8 格行走，
// 格子 224×240，脚底 (112,232)，每帧 160ms；右、右下、右上由左侧镜像。图放在 r253w/<名字>.webp，到一张换一张，没到的还用旧图。
// 管两处：玄天城 / 青阳镇街上闲逛的路人（r66 那一批），天剑集市里按路线走的访客。人物在屏幕上的高度和旧图一样（载入时量站立帧）。只进测试版。
(function () {
  if (typeof drawActorT !== 'function' || !window.R66_NPC) return;
  const KEYS = ['xiaohe', 'zhaopopo', 'daniu', 'afu', 'laoqiaofu', 'laozhou', 'xuyan', 'liuniang', 'suling', 'ashi', 'qingfeng', 'qinxiaowan', 'man', 'woman'];
  const ROW = { down: [0, 0], downleft: [1, 0], left: [2, 0], upleft: [3, 0], up: [4, 0], downright: [1, 1], right: [2, 1], upright: [3, 1] };
  const DIRS = ['right', 'downright', 'down', 'downleft', 'left', 'upleft', 'up', 'upright'];
  const IM = {}, SC = {};
  const top = (im, sx, sy, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, sx, sy, w, h, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 60) return y; return 0; };
  for (const k of KEYS) { const im = new Image(); im.onload = () => { if (im.width < 2016 || im.height < 1200) return;
      // 新图站立帧的人有多高 → 缩到和旧图画出来一样高（旧图：160×240 的格子按 0.5 画，脚底 232）
      let want = 103; try { const old = R66_NPC.img('visitor_' + k); if (old && old.width) want = (232 - top(old, 0, 0, 160, 240)) * .5; } catch (e) {}
      const h = 232 - top(im, 0, 0, 224, 240); SC[k] = h > 40 ? want / h : .46; IM[k] = im; };
    im.onerror = () => {}; im.src = 'r253w/' + k + '.webp'; }
  const keyOf = t => { const k = String(t || '').replace(/^visitor_/, ''); return IM[k] ? k : null; };
  // st：这个人自己的步态状态；(x,y) 脚底；moving：这一帧是不是在走；face：停下时朝哪
  function draw8(k, st, x, y, moving, alpha) {
    const ms = performance.now(), dx = x - (st.px ?? x), dy = y - (st.py ?? y); st.px = x; st.py = y;
    if (moving && Math.hypot(dx, dy) > .05) { st.dir = DIRS[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8]; st.mt = ms; }
    const mv = moving || ms - (st.mt || 0) < 120; if (mv && !st.mv) st.t0 = ms; st.mv = mv;
    const f = mv ? 1 + Math.floor((ms - st.t0) / 160) % 8 : 0, r = ROW[st.dir] || ROW.down, sc = SC[k];
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, 20, 6, 0, 0, 7); ctx.fill();
    ctx.globalAlpha *= alpha ?? 1; ctx.translate(x, y); if (r[1]) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(IM[k], f * 224, r[0] * 240, 224, 240, -112 * sc, -232 * sc, 224 * sc, 240 * sc); ctx.restore();
  }
  // 城里闲逛的路人
  drawActorT = (orig => function (a, now) {
    const k = a && !a.hidden && a.npc && a.npc.r66 && keyOf(a.npc.r66); if (!k) return orig.apply(this, arguments);
    const st = a._n8 || (a._n8 = { dir: a.dir > 0 ? 'downright' : 'downleft' }); draw8(k, st, a.x, a.y, !!a.moving, a.alpha);
  })(drawActorT);
  // 集市里按路线走的访客：影子、名牌、任务标记还走原来那套（画的时候先把贴图关掉），人换成八向图
  if (typeof drawBaked === 'function') drawBaked = (orig => function (o, now) {
    const p = o && o.r60 && o.pose, k = p && /^visitor_/.test(p.texture || '') && keyOf(p.texture);
    if (!k || !p.anchor) return orig.apply(this, arguments);
    const di = ctx.drawImage; ctx.drawImage = function () {}; try { orig.apply(this, arguments); } finally { delete ctx.drawImage; if (ctx.drawImage !== di) ctx.drawImage = di; }
    const st = p._n8 || (p._n8 = { dir: p.row === 1 ? 'up' : p.row === 2 ? (p.flip ? 'right' : 'left') : 'down' }), [ax, ay] = p.anchor, mv = Math.hypot(ax - (st.px ?? ax), ay - (st.py ?? ay)) > .05;
    draw8(k, st, ax, ay, mv, 1);
  })(drawBaked);
  window.R256 = { IM, SC };
})();
