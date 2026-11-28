// ================= R474 · 战斗「定稿图 + 动作图」（只进测试版）：绛蘅（r474_jhbattle.js）和内苑三只梦傀（r474_neiyuan.js）共用 =================
// 作者 11-28 23:15 看了战斗录屏：「梦傀的战斗建模是不是帧率不够？它做得好卡呀！其实你可以就做一张定稿图，然后做动作图，中间其实不需要连贯，
//   反而你做这种连贯的动画帧，中间好卡。然后不需要弄那个咳嗽喘气，那个衰弱，你搞得跟驼背一样，好难看……BOSS 一定是很帅，技能炫酷，然后发怒，最后死的时候结束、消散之类的。」
// 所以不再逐帧播整段动画，改成：
//   ① 平时：一张「定稿站姿」静图，代码给它极轻的上下浮动（2～3 像素，慢），不换帧。
//   ② 放招：只用两张关键动作图——起手 / 出招，之间 80～150 毫秒交叉淡入；出招那一下整张图往前一冲再回位、放大到 1.06 再回来（力度靠位移和缩放，不靠帧数）。
//   ③ 挨打：不换图，整张图往后一仰（往后挪一点 + 微微后倾），身上一圈白边亮 120 毫秒。
//   ④ 死：最后一张定稿图停住，然后从下往上化成花瓣 / 光点 / 梦丝飘散（约 1.7 秒），不倒地、不震、不闪。
//   ⑤ 没有任何「力竭 / 喘气 / 驼背」的样子。
// 这个文件只管「怎么画」：每个单位身上挂一个 u._ps（当前图、上一张图、正在放的动作、挨打时刻、消散），图从哪来由调用方给（src(key) → { im, fr, sc }）。
//   fr 是图集里那一帧：[页, sx, sy, w, h, ox, oy]，画在脚底 (x + ox·sc, y + oy·sc)，sc = 图集像素 → 屏幕。
// 接口 window.R474POSE：
//   want(u, key, now, xf)            —— 这一刻该显示哪张（换了就和上一张交叉淡入 xf 秒；xf ≥ .5 算「换形态」，新图慢慢显出来）
//   act(u, { t0, ts, te, steps, L, S }) —— 放一招：steps = [[时刻, key, 淡入秒数], …]；ts = 出招那一下（往前冲 L 像素、放大到 1 + S）；te = 收招回到定稿图
//   pick(u, now, baseKey)            —— 有招在放就按 steps 选图，放完回 baseKey；返回当前 key
//   hit(u, now)                      —— 挨打：往后一仰 + 白边
//   draw(u, now, src, x, y, o)       —— 画本体（o.glow = [r,g,b]、o.power 身上那圈光的强弱、o.float 浮动幅度、o.back / o.front 身后 / 身前再画点什么）
//   dissolve(u, now, src, key, x, y, kind) —— 死了以后画消散；kind = 'petal'（彼岸花瓣）/ 'dream'（梦丝 + 灰色光点）；返回 false = 已经散完
//   left(b)                          —— 这场仗里还有多少秒的消散没放完（打赢收场前等它放完）
(function () {
  if (typeof ctx === 'undefined') return;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const sm = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const nowS = () => performance.now() / 1000;
  const ok = im => im && im.complete && im.naturalWidth;
  const ST = u => u._ps || (u._ps = { cur: null, prev: null, act: null, hurtT: -9, diss: null });

  function want(u, key, now, xf = .12) {
    const s = ST(u); if (s.cur && s.cur.key === key) return;
    if (s.cur) s.prev = { key: s.cur.key, t: now, d: Math.max(.04, xf), long: xf >= .5 };
    s.cur = { key }; }
  function act(u, o) { ST(u).act = Object.assign({ L: 26, S: .06 }, o); }
  function pick(u, now, baseKey) {
    const s = ST(u), a = s.act; let key = baseKey, xf = .15;
    if (a && now < a.te) { for (const [t, k, x] of a.steps) if (now >= t) { key = k; xf = x == null ? .12 : x; } }
    else if (a) s.act = null;
    want(u, key, now, xf); return key; }
  function hit(u, now) { ST(u).hurtT = now; }
  const busyTill = u => { const a = u && u._ps && u._ps.act; return a ? a.te : 0; };

  // ---------- 这一刻整张图怎么挪：浮动 + 出招前冲 / 放大 + 挨打后仰 ----------
  function motion(u, now, amp) {
    const s = ST(u); let dx = 0, dy = 0, sc = 1, rot = 0, white = 0;
    dy = Math.sin(now * 1.7 + (u.x % 7)) * amp;   // 极轻的浮动：上下 amp 像素，约 3.7 秒一个来回
    const a = s.act;
    if (a && now < a.te) {
      if (now < a.ts) dx = -.18 * a.L * sm((now - a.t0) / Math.max(.15, a.ts - a.t0));   // 起手：微微往后收
      else { const k = now - a.ts, D = Math.max(.2, a.te - a.ts - .1);
        const p = k < .1 ? sm(k / .1) : 1 - sm((k - .1) / D);
        dx = k < .1 ? lerp(-.18 * a.L, a.L, sm(k / .1)) : a.L * p; sc = 1 + a.S * p; } }
    const hk = now - s.hurtT;
    if (hk >= 0 && hk < .5) { const r = hk < .07 ? sm(hk / .07) : 1 - sm((hk - .07) / .43); dx -= 16 * r; rot -= .045 * r; white = hk < .12 ? 1 - hk / .12 : 0; }
    return { dx, dy, sc, rot, white }; }

  // ---------- 剪影（身上那圈光、挨打的白边用），按「图 + 帧 + 颜色」缓存，1/3 大小 ----------
  const SIL = new Map();
  function sil(im, fr, col) {
    const k = im.src + '|' + fr[1] + ',' + fr[2] + '|' + col; let c = SIL.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(fr[3] / 3)); c.height = Math.max(1, Math.ceil(fr[4] / 3));
    const g = c.getContext('2d'); g.drawImage(im, fr[1], fr[2], fr[3], fr[4], 0, 0, c.width, c.height);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
    if (SIL.size > 160) SIL.clear(); SIL.set(k, c); return c; }
  function ring(im, fr, sc, col, r, a) {   // 剪影错开八个方向叠：一圈柔光 / 白边
    if (a <= .005) return; const c = sil(im, fr, col);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a;
    for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; ctx.drawImage(c, fr[5] * sc + Math.cos(an) * r, fr[6] * sc + Math.sin(an) * r, fr[3] * sc, fr[4] * sc); }
    ctx.restore(); }
  function blit(S) { if (!S || !S.fr || !ok(S.im)) return false; const fr = S.fr; ctx.drawImage(S.im, fr[1], fr[2], fr[3], fr[4], fr[5] * S.sc, fr[6] * S.sc, fr[3] * S.sc, fr[4] * S.sc); return true; }

  function draw(u, now, src, x, y, o = {}) {
    const s = ST(u); if (!s.cur) return;
    const m = motion(u, now, o.float == null ? 2.5 : o.float), C = src(s.cur.key); if (!C || !ok(C.im)) return;
    ctx.save(); ctx.translate(x + m.dx, y + m.dy); if (m.rot) ctx.rotate(m.rot); if (m.sc !== 1) ctx.scale(m.sc, m.sc);
    if (o.back) { try { o.back(m); } catch (e) {} }
    const p = s.prev, k = p ? (now - p.t) / p.d : 1;
    const col = o.glow ? 'rgb(' + o.glow.join(',') + ')' : null, pw = o.power || 0;
    if (col && pw > .01) ring(C.im, C.fr, C.sc, col, 4 + pw * 3, (.1 + pw * .18) * (.85 + .15 * Math.sin(now * 2.2)));
    if (m.white > 0) ring(C.im, C.fr, C.sc, '#fff', 3.5, .55 * m.white);   // 挨打：身后一圈白边（画在本体后面，只露出轮廓）
    if (p && k < 1) { const P0 = src(p.key); ctx.save(); ctx.globalAlpha *= 1 - sm(k); blit(P0); ctx.restore(); } else s.prev = null;
    ctx.save(); if (p && k < 1 && p.long) ctx.globalAlpha *= sm(k); blit(C); ctx.restore();
    if (m.white > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= .16 * m.white; blit(C); ctx.restore(); }   // 整张微微亮一下（不刺眼）
    if (o.front) { try { o.front(m); } catch (e) {} }
    ctx.restore(); }

  // ---------- 消散：从脚往头，一层层化成花瓣 / 光点 / 梦丝往上飘 ----------
  const HOLD = .35, DUR = 1.7;   // 停住 0.35 秒，再用 1.7 秒从下往上散完；最后一片飘完还要 ~1.3 秒
  const TMP = document.createElement('canvas'), tg = TMP.getContext('2d');
  function build(C, kind, t0) {
    const fr = C.fr, w = Math.max(1, Math.round(fr[3] * C.sc)), h = Math.max(1, Math.round(fr[4] * C.sc));
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.drawImage(C.im, fr[1], fr[2], fr[3], fr[4], 0, 0, w, h);
    let data = null; try { data = g.getImageData(0, 0, w, h).data; } catch (e) {}
    const pts = [], step = Math.max(3, Math.round(Math.sqrt(w * h / 900)));   // 大约取 900 个落在身上的点
    let sd = 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let yy = 0; yy < h; yy += step) for (let xx = 0; xx < w; xx += step) {
      const px = Math.min(w - 1, xx + Math.floor(r() * step)), py = Math.min(h - 1, yy + Math.floor(r() * step)), i = (py * w + px) * 4;
      if (data && data[i + 3] < 90) continue; if (r() > .72) continue;
      pts.push({ x: px, y: py, c: data ? [data[i], data[i + 1], data[i + 2]] : [220, 200, 200], vx: (r() - .4) * 46, vy: -(38 + r() * 90), life: .9 + r() * .6, rot: r() * 6.28, vr: (r() - .5) * 5, sz: .75 + r() * .7, ph: r() * 6.28, kind: r() });
    }
    // 每个点什么时候被消散线扫到（消散线按 smoothstep 往上走，这里反解一次）
    for (const p of pts) { const v = clamp01((h + 30 - p.y) / (h + 60)); let lo = 0, hi = 1; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (sm(m) < v) lo = m; else hi = m; } p.at = lo * DUR; }
    if (TMP.width < w + 4) TMP.width = w + 4; if (TMP.height < h + 4) TMP.height = h + 4;
    return { cv, w, h, ox: fr[5] * C.sc, oy: fr[6] * C.sc, pts, t0: t0 + HOLD, r0: nowS() + HOLD, kind }; }   // t0 是调用方的时钟（绛蘅有「定格」），r0 是真实时间
  const PET = ['#d81a30', '#b50f22', '#f04a5c', '#e8283e'];
  function particle(p, x, y, a, kind) {
    if (kind === 'petal') {
      if (p.kind < .78) { const s = 4.6 * p.sz + 1.6; ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot); ctx.globalAlpha = a; ctx.fillStyle = PET[Math.floor(p.kind * 5.1) % 4];
        ctx.beginPath(); ctx.moveTo(0, -s * 1.6); ctx.quadraticCurveTo(s * .45, -s * .2, 0, s * 1.15); ctx.quadraticCurveTo(-s * .45, -s * .2, 0, -s * 1.6); ctx.fill(); ctx.restore(); }
      else { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * .8; ctx.fillStyle = '#ffb0a0'; ctx.beginPath(); ctx.arc(x, y, 1.6 * p.sz + .6, 0, 7); ctx.fill(); ctx.restore(); }
    } else {   // 梦：灰白光点为主，夹几缕细细的梦丝
      if (p.kind < .8) { const l = (p.c[0] + p.c[1] + p.c[2]) / 3, v = Math.round(lerp(l, 210, .6)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * .85; ctx.fillStyle = `rgb(${v},${v},${Math.min(255, v + 12)})`; ctx.beginPath(); ctx.arc(x, y, 1.3 * p.sz + .5, 0, 7); ctx.fill(); ctx.restore(); }
      else { const L = 10 + p.sz * 12; ctx.save(); ctx.globalAlpha = a * .7; ctx.strokeStyle = p.kind < .9 ? '#e8c8cc' : '#d0606e'; ctx.lineWidth = 1; ctx.translate(x, y); ctx.rotate(p.rot * .3);
        ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.quadraticCurveTo(0, Math.sin(p.ph) * 6, L / 2, Math.cos(p.ph) * 3); ctx.stroke(); ctx.restore(); }
    } }
  // 返回 true = 还在散；false = 散完了（调用方之后什么都不用画）
  function dissolve(u, now, src, key, x, y, kind = 'petal') {
    const s = ST(u); if (!s.diss) { const C = src(key); if (!C || !ok(C.im)) return true; s.diss = build(C, kind, now); s.cur = { key }; s.prev = null; s.act = null; }
    const D = s.diss, t = now - D.t0;
    if (t > DUR + 1.6) return false;
    const e = t <= 0 ? 0 : sm(t / DUR), line = D.h + 30 - (D.h + 60) * e;   // 消散线：从脚底往上走（局部坐标，0 = 图的顶）
    const fy = Math.sin(now * 1.7 + (u.x % 7)) * 2.5 * (1 - e);
    // 还没散的上半截：消散线以上照常，往下 34 像素内渐隐
    if (line > -30) { tg.clearRect(0, 0, D.w + 4, D.h + 4); tg.globalCompositeOperation = 'source-over'; tg.drawImage(D.cv, 0, 0);
      tg.globalCompositeOperation = 'destination-in'; const gr = tg.createLinearGradient(0, line - 34, 0, line); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); tg.fillStyle = gr; tg.fillRect(0, 0, D.w + 4, D.h + 4); tg.globalCompositeOperation = 'source-over';
      ctx.drawImage(TMP, 0, 0, D.w, D.h, x + D.ox, y + D.oy + fy, D.w, D.h);
      // 消散线上一道极淡的暖光（不闪）
      if (t > 0 && line < D.h + 20) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .22 * Math.sin(Math.PI * clamp01(t / DUR)); const ly = y + D.oy + fy + line - 12, lg = ctx.createLinearGradient(0, ly - 14, 0, ly + 14);
        const c = kind === 'petal' ? '255,120,120' : '220,220,235'; lg.addColorStop(0, `rgba(${c},0)`); lg.addColorStop(.5, `rgba(${c},1)`); lg.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = lg; ctx.fillRect(x + D.ox, ly - 14, D.w, 28); ctx.restore(); } }
    // 飘起来的花瓣 / 光点：消散线扫过哪里，哪里就飘起来
    for (const p of D.pts) { const te = t - p.at; if (te <= 0) continue; const k = te / p.life; if (k >= 1) continue;
      const px = x + D.ox + p.x + p.vx * te + Math.sin(now * 2 + p.ph) * 6 * k, py = y + D.oy + fy + p.y + p.vy * te - 14 * te * te;
      p.rot += p.vr * .016; particle(p, px, py, Math.sin(Math.PI * Math.min(1, k * 1.15 + .08)) * (1 - k * .3), kind); }
    return true; }
  function left(b) { let w = 0; const n = nowS(); for (const u of (b && b.units) || []) { const D = u && u._ps && u._ps.diss; if (D) w = Math.max(w, D.r0 + DUR + .5 - n); else if (u && u._ps && !u.alive) w = Math.max(w, HOLD + DUR + .5); } return w; }   // 刚倒下、还没开始画消散的也算上

  // 打赢收场前：还有人在消散，就等她（它）散完再出胜利面板（最多 2.6 秒）。
  // 这个文件在 index.html 里排在 r473_bossstage.js 之后：这一层包在 r473 的「临终一句」外面——先看她化成花瓣散完，再听最后那句话。
  if (typeof endBattle === 'function') endBattle = (orig => async function (win) { try { const b = typeof battle !== 'undefined' && battle; if (win && b) { const w = Math.min(2.6, left(b)); if (w > 0) await sleep(w * 1000); } } catch (e) {} return orig.apply(this, arguments); })(endBattle);

  window.R474POSE = { want, act, pick, hit, draw, dissolve, left, motion, busyTill, HOLD, DUR, ST };
})();
