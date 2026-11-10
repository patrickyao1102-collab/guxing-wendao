// ================= R189 Codex 交付：周虎重做 / 神秘魔族撕斗篷变身真身 / 槐柳双魂 / 同心衣图标（作者 11-10）=================
// 作者：「周虎模型不合格」「神秘魔族剧情突破以后变身——斗篷撕下，变成魔族真身，也是个帅哥，攻击力大幅提升」
// 战斗模型都是三张静态图：待机 / 出手 / 受击（400 宽，脚底贴底边居中，朝右）。敌人出手（pose = 'atk'）换出手图，挨打（hurt）换受击图。
(function () {
  if (typeof drawUnit !== 'function' || typeof IMG === 'undefined') return;
  const IM = {}, load = (k, src, cb) => { const im = new Image(); im.onload = () => { IM[k] = im; cb && cb(im); }; im.src = src; };
  // ---------- 三姿态敌人 ----------
  // 作者 11-10 看过：周虎、男女魂不合格，先只接魔族真身（周虎 / 男女魂的接法留着，Codex 重画后把这两组加回 SETS 就行）
  const SETS = { e_mozu2: 'mozu2' };
  for (const key in SETS) for (const p of ['idle', 'atk', 'hit']) load(key + '__' + p, 'r189/b_' + SETS[key] + '_' + p + '.webp', im => { IMG[key + '__' + p] = im; });
  // 周虎：原来的战斗图是光膀子虎皮围裙的山贼、和对话立绘对不上 → 换成照立绘画的（黑褐兽毛披肩、旧铁护肩、暗红腰封、发髻络腮胡、鬼头刀）
  //   原来那条即梦逐帧视频也是旧形象，一起停掉；地图上剧情里的小人（IMG.e_zhouhu）也用新待机图
  for (const key of []) { let old = IMG[key]; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, get: () => IMG[key + '__idle'] || old, set: v => { old = v; } }); }
  for (const key of ['e_mozu2']) Object.defineProperty(IMG, key, { configurable: true, enumerable: true, get: () => IMG[key + '__idle'], set: () => {} });
  const dropVS = () => { try { if (window.VSPRITES) delete VSPRITES.e_zhouhu; if (window.RIG_MAP) delete RIG_MAP.e_zhouhu; } catch (e) {} };
  // dropVS(); setTimeout(dropVS, 3000);   // 周虎新模型接进来时再打开
  if (window.BATTLE_SIZE) Object.assign(BATTLE_SIZE, { e_mozu2: BATTLE_SIZE.e_mozu || 300, e_yyq_m: 240, e_yyq_f: 228 });
  // 待机可见高（px，原画 720 高里人物占的高度）+ 出手 / 受击相对待机的绘制倍率（R191 战斗模型参数.json）
  const REL = { e_mozu2: { idleH: 707, idle: 1, atk: 2.1352, hit: 1.44898 } };
  { const c = document.createElement('canvas'); c.width = c.height = 1; IMG.__r189_none = c; }
  const pose = u => u.hurt > .15 ? 'hit' : (u.pose === 'atk' || u.pose === 'cast') ? 'atk' : 'idle';

  // ---------- 魔族撕斗篷变身（30 帧 · 15fps · 2 秒；图集缩到一半：每格 336×384，6 列，脚底锚点 168,372）----------
  const TF = { cols: 6, n: 30, fps: 15, fw: 336, fh: 384, ax: 168, ay: 372, src: 2 /* 图集像素 → 原画像素 */, idleH: 707 };
  load('tf', 'r189/mozu2_tf.webp');
  for (const n of ['default', 'angry', 'grin']) load('p_' + n, 'r189/p_mozu2_' + n + '.webp', im => { IMG['p_mozu2_' + n] = im; if (typeof MEDAL_FACE !== 'undefined') MEDAL_FACE['p_mozu2_' + n] = { fx: .5, fy: .22, span: .4 }; });
  // ---------- R193 Codex 邪化真身（作者 11-11：「要更邪恶一点，不要只是帅」「背后最好还要有翅膀」）----------
  // 骨翼；待机是 16 帧扇翼循环（8fps）；变身 48 帧 15fps 3.2 秒五页图集；三姿共用同一原画倍率 k（原画脚底到角尖约 690px）
  // 游戏里的图：静态三姿缩到 0.75、扇翼和变身图集缩到 0.5（下面的 sc 换回原画像素）
  const M3 = { idleH: 690,
    pose: { idle: { f: 'b_mz3_idle', sc: .75, ax: 440, ay: 720 }, atk: { f: 'b_mz3_atk', sc: .75, ax: 664, ay: 592 }, hit: { f: 'b_mz3_hit', sc: .75, ax: 376, ay: 688 } },
    wing: { f: 'mz3_wing', sc: .5, fw: 880, fh: 720, cols: 4, n: 16, fps: 8, ax: 440, ay: 720 },
    tf: { fps: 15, n: 48, pages: [[0, 14, 432, 752, 5, 216, 742], [15, 22, 832, 752, 2, 416, 742], [23, 29, 1568, 736, 2, 784, 726], [30, 35, 1584, 736, 2, 792, 726], [36, 47, 992, 736, 3, 496, 726]] } };
  for (const k of ['b_mz3_idle', 'b_mz3_atk', 'b_mz3_hit', 'mz3_wing', 'mz3_tf1', 'mz3_tf2', 'mz3_tf3', 'mz3_tf4', 'mz3_tf5']) load(k, 'r193/' + k + '.webp');
  for (const n of ['default', 'angry', 'grin']) load('p3_' + n, 'r193/p_mz3_' + n + '.webp', im => { IMG['p_mz3_' + n] = im; if (typeof MEDAL_FACE !== 'undefined') MEDAL_FACE['p_mz3_' + n] = { fx: .5, fy: .2, span: .4 }; });
  const has3 = () => ['b_mz3_idle', 'b_mz3_atk', 'b_mz3_hit', 'mz3_wing'].every(k => IM[k]);
  const hasTF3 = () => [1, 2, 3, 4, 5].every(i => IM['mz3_tf' + i]);
  function drawTF3(u, t) {
    const T = M3.tf, F = Math.min(T.n - 1, Math.floor(t * T.fps)), pi = T.pages.findIndex(p => F >= p[0] && F <= p[1]), P = T.pages[pi], im = IM['mz3_tf' + (pi + 1)];
    const i = F - P[0], fw = P[2], fh = P[3], cols = P[4], k = u.h / M3.idleH * (1 + (BIG - 1) * Math.min(1, t / 3));
    const x = u.x + u.ox, y = u.y + u.oy;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(x, y, u.h * .3 * (1 + (BIG - 1)), u.h * .065, 0, 0, 7); ctx.fill();
    ctx.drawImage(im, (i % cols) * fw * .5, Math.floor(i / cols) * fh * .5, fw * .5, fh * .5, x - P[5] * k, y - P[6] * k, fw * k, fh * k); ctx.restore(); return true;
  }
  function drawTF(u, t) {
    if (hasTF3()) return drawTF3(u, t);
    const im = IM.tf; if (!im) return false;
    const f = Math.min(TF.n - 1, Math.floor(t * TF.fps)), s = u.h / TF.idleH * TF.src * (1 + (BIG - 1) * Math.min(1, t / 1.9));   // 和真身待机图同一缩放；撕斗篷时人一路长高到真身大小
    const w = TF.fw * s, h = TF.fh * s, x = u.x + u.ox - TF.ax * s, y = u.y + u.oy - TF.ay * s;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(u.x + u.ox, u.y + u.oy, u.h * .26, u.h * .06, 0, 0, 7); ctx.fill();
    ctx.drawImage(im, (f % TF.cols) * TF.fw, Math.floor(f / TF.cols) * TF.fh, TF.fw, TF.fh, x, y, w, h); ctx.restore(); return true;
  }
  // ---------- R193 真身压迫感（作者 11-11：「一点压迫感都没有，光效、魔族的压迫都没有，只剩下帅了」）----------
  // 场上：整场压暗 + 四角紫黑暗角 + 心跳般的脉动；他脚下一圈紫红魔纹慢转、身后一团暗紫光
  // 身上：剪影外一层翻滚的黑紫魔气（模糊轮廓、往上飘）+ 紫色辉光描边；周身不停往上冒紫火星和黑烟
  const BIG = 1.22;   // 真身比斗篷版高一截，站在那就压人
  const TINT = new Map();
  function tinted(im, col) { let m = TINT.get(im); if (!m) TINT.set(im, m = {}); if (m[col]) return m[col];
    const c = document.createElement('canvas'), sc = 360 / im.height; c.width = Math.round(im.width * sc); c.height = 360; const g = c.getContext('2d');
    g.drawImage(im, 0, 0, c.width, c.height); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); return m[col] = c; }
  const P = []; let pT = 0;
  const trueForm = () => { try { return battle && battle.units.find(u => u.side === 'enemy' && u.key === 'e_mozu2' && u.alive && u._tf == null); } catch (e) { return null; } };
  const beat = t => { const p = t % 2.4; return Math.exp(-((p - .1) ** 2) / .004) + .6 * Math.exp(-((p - .42) ** 2) / .004); };   // 咚—咚 两下
  const building = () => { try { return battle && battle.units.find(u => u.side === 'enemy' && u.alive && (u._pre != null || u._tf != null)); } catch (e) { return null; } };
  function pressure() {
    let u = trueForm(), K = 1; const t = performance.now() / 1000;
    if (!u) { u = building(); if (!u) return; K = u._pre != null ? Math.min(1, (t - u._pre) / 2.3) * .85 : .85 + Math.min(1, (t - u._tf) / 2) * .15; }
    const bx = u.x + u.ox, by = u.y + u.oy, bt = beat(t) * K;
    ctx.save(); ctx.globalAlpha = K;
    ctx.fillStyle = `rgba(14,0,22,${.34 + bt * .08})`; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(bx, by - u.h * .5, 20, bx, by - u.h * .5, u.h * 1.5);
    g.addColorStop(0, `rgba(120,30,190,${.42 + bt * .15})`); g.addColorStop(.45, 'rgba(70,10,110,.2)'); g.addColorStop(1, 'rgba(40,0,60,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); g.addColorStop(0, 'rgba(10,0,16,0)'); g.addColorStop(1, `rgba(10,0,16,${.7 + bt * .1})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // 脚下：黑色压痕 + 两圈魔纹（紫外圈顺转、暗红内圈逆转）
    g = ctx.createRadialGradient(bx, by, 4, bx, by, u.h * .7); g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.translate(bx, by); ctx.scale(1, .3); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, u.h * .7, 0, 7); ctx.fill(); ctx.restore();
    const cir = IMG.fx3_circle_blue; if (cir) { const m = FXM.fx3_circle_blue, fr = Math.floor(t * 8) % m.n;
      for (const [hue, sc, sp, a] of [[70, u.h * 1.15 / m.w, .25, .75 + bt * .25], [140, u.h * .72 / m.w, -.45, .55]]) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * K; ctx.filter = `hue-rotate(${hue}deg) saturate(1.6)`;
        ctx.translate(bx, by); ctx.scale(1, .3); ctx.rotate(t * sp); ctx.scale(sc, sc); ctx.drawImage(cir, fr * m.w, 0, m.w, m.h, -m.w / 2, -m.h / 2, m.w, m.h); ctx.restore(); } }
    ctx.restore();
  }
  drawFx = (o => function (layer) { if ((layer || 0) === 0) pressure(); return o.apply(this, arguments); })(drawFx);
  function stepParticles(u, x, y) {
    const now = performance.now() / 1000, dt = Math.min(.05, pT ? now - pT : .016); pT = now;
    const bw = u.h * .34;
    for (let n = dt * 40; n > 0; n--) if (Math.random() < n) {
      const smoke = Math.random() < .5, hy = Math.random();
      P.push({ smoke, x: x + (Math.random() - .5) * bw * (smoke ? 1.3 : 1.1), y: y - u.h * hy * (smoke ? .5 : .9), vx: (Math.random() - .5) * 20, vy: -(smoke ? 40 + Math.random() * 50 : 70 + Math.random() * 110),
        life: smoke ? 1.4 + Math.random() : .9 + Math.random() * .9, t: 0, s: smoke ? 20 + Math.random() * 30 : 1.2 + Math.random() * 2.2, c: Math.random() < .25 ? '255,70,150' : '170,90,255', ph: Math.random() * 6 });
    }
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.t += dt; if (p.t > p.life) { P.splice(i, 1); continue; } p.x += (p.vx + Math.sin(now * 3 + p.ph) * 18) * dt; p.y += p.vy * dt; }
    if (P.length > 260) P.splice(0, P.length - 260);
  }
  function drawP(smoke) { ctx.save(); ctx.globalCompositeOperation = smoke ? 'source-over' : 'lighter';
    for (const p of P) { if (p.smoke !== smoke) continue; const k = p.t / p.life, a = Math.sin(Math.PI * k);
      if (smoke) { const r = p.s * (1 + k * 1.4), g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); g.addColorStop(0, `rgba(18,0,28,${.7 * a})`); g.addColorStop(1, 'rgba(22,0,34,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); }
      else { const r = p.s * 2.4, g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); g.addColorStop(0, `rgba(255,235,255,${a})`); g.addColorStop(.25, `rgba(${p.c},${.9 * a})`); g.addColorStop(1, `rgba(${p.c},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); } }
    ctx.restore(); }
  function auraBack(u, im, x, y, w, h) {
    const t = performance.now() / 1000; stepParticles(u, x, y);
    drawP(true);
    const dk = tinted(im, '#12001c'), vi = tinted(im, '#a24cff');
    ctx.save();
    for (let i = 0; i < 3; i++) {   // 黑紫魔气：三层放大、往上飘、轻微摆动的模糊剪影
      const s = 1.05 + i * .045 + Math.sin(t * 2.2 + i * 2) * .015, lift = ((t * .6 + i / 3) % 1);
      ctx.globalAlpha = (.75 - i * .15) * (1 - lift * .5); ctx.filter = `blur(${10 + i * 6}px)`;
      ctx.drawImage(dk, x - w * s / 2 + Math.sin(t * 1.7 + i) * 4, y - h * s - lift * 18, w * s, h * s); }
    ctx.globalCompositeOperation = 'lighter'; const bt = beat(t);
    ctx.globalAlpha = .55 + Math.sin(t * 3.1) * .12 + bt * .25; ctx.filter = 'blur(7px)';
    const s = 1.025; ctx.drawImage(vi, x - w * s / 2, y - h * s + h * (s - 1) * .02, w * s, h * s);
    ctx.restore();
  }
  function auraFront(u, x, y, w, h) {
    drawP(false);
    const t = performance.now() / 1000, bt = beat(t); if (bt < .05) return;   // 心跳那一下，身上的紫光往外涨一圈
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = bt * .35;
    const g = ctx.createRadialGradient(x, y - u.h * .55, 10, x, y - u.h * .55, u.h * .75); g.addColorStop(0, 'rgba(200,120,255,.6)'); g.addColorStop(1, 'rgba(120,40,200,0)');
    ctx.fillStyle = g; ctx.fillRect(x - u.h, y - u.h * 1.4, u.h * 2, u.h * 1.6); ctx.restore();
  }
  // ---------- R196 云霆重伤（作者 11-11：「云霆死了应该有一个重伤的战斗建模」）----------
  // 中爪 → 被击飞 → 撑剑单膝跪住（9 帧 0.8 秒），之后一直跪在场上喘气；画布 640×500、底边中点对齐原站位，整幅高 = 原战斗图高
  load('yt_inj', 'r193/yt_injured.webp');
  const INJ = { n: 9, dur: [80, 70, 90, 70, 70, 80, 100, 120, 120], fw: 384, fh: 300 };
  function drawInjured(u) {
    const im = IM.yt_inj; if (!im) return false;
    let ms = (performance.now() / 1000 - u._injT) * 1000, f = 0; while (f < INJ.n - 1 && ms >= INJ.dur[f]) { ms -= INJ.dur[f]; f++; }
    const H = u.h, Wd = H * 640 / 500, x = u.x + u.ox, y = u.y + u.oy, last = f === INJ.n - 1, br = last ? Math.sin(performance.now() / 1000 * 2.2) : 0;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x, y, u.h * .3, u.h * .06, 0, 0, 7); ctx.fill();
    if (u.hurt > .5) ctx.filter = 'brightness(2.2)';
    const hh = H * (1 + br * .008);   // 跪着肩膀一起一伏
    ctx.drawImage(im, f * INJ.fw, 0, INJ.fw, INJ.fh, x - Wd / 2, y - hh, Wd, hh); ctx.restore(); return true;
  }
  drawUnit = (o => function (u) {
    if (u && u._injT != null && u.side === 'hero' && drawInjured(u)) return;
    if (u && u._tf != null && u.alive) { const t = performance.now() / 1000 - u._tf; stepParticles(u, u.x + u.ox, u.y + u.oy); drawP(true); if (drawTF(u, t)) { drawP(false); return; } }
    if (u && u._pre != null && u.alive) {   // 变身前奏：斗篷版在低笑里发抖，紫光一丝丝漏出来、魔气往上冒
      const k = Math.min(1, (performance.now() / 1000 - u._pre) / 2.3), x = u.x + u.ox, y = u.y + u.oy;
      stepParticles(u, x, y); drawP(true);
      const ox = u.ox; u.ox += (Math.random() - .5) * 5 * k * k; try { o(u); } finally { u.ox = ox; }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .25 + k * .6;
      const g = ctx.createRadialGradient(x, y - u.h * .5, 6, x, y - u.h * .5, u.h * (.35 + k * .4)); g.addColorStop(0, 'rgba(190,100,255,.7)'); g.addColorStop(1, 'rgba(110,30,190,0)');
      ctx.fillStyle = g; ctx.fillRect(x - u.h, y - u.h * 1.3, u.h * 2, u.h * 1.5); ctx.restore(); drawP(false); return;
    }
    if (u && u.side === 'enemy' && u.key === 'e_mozu2' && u.alive && has3()) {
      const ps = pose(u), P = M3.pose[ps], now = performance.now() / 1000, kk = u.h / M3.idleH;
      const x = u.x + u.ox + (u.hurt > 0 ? Math.sin(now * 80) * 8 * u.hurt : 0), y = u.y + u.oy;
      const k0 = u.key; u.key = '__r189_none'; try { o(u); } finally { u.key = k0; }   // 影子、血条、名字照旧
      const st = IM[P.f], w = st.width / P.sc * kk, h = st.height / P.sc * kk;
      // 魔气剪影按当前姿势的静态图，再按 Codex 的脚底锚点放（画幅左右不对称时也对得上）
      auraBack(u, st, x + (st.width / P.sc / 2 - P.ax) * kk, y + (st.height / P.sc - P.ay) * kk, w, h);
      ctx.save(); if (u.hurt > .5) ctx.filter = 'brightness(2.2)';
      if (ps === 'idle') { const W8 = M3.wing, f = Math.floor(now * W8.fps) % W8.n, im = IM[W8.f];
        ctx.drawImage(im, (f % W8.cols) * W8.fw * W8.sc, Math.floor(f / W8.cols) * W8.fh * W8.sc, W8.fw * W8.sc, W8.fh * W8.sc, x - W8.ax * kk, y - W8.ay * kk, W8.fw * kk, W8.fh * kk); }
      else ctx.drawImage(st, x - P.ax * kk, y - P.ay * kk, w, h);
      ctx.restore(); auraFront(u, x, y, w, h); return;
    }
    const set = u && u.side === 'enemy' && SETS[u.key], ps = set && pose(u), k = set && u.key + '__' + ps;
    if (!k || !IMG[k]) return o(u);
    // R191：三张姿态都是 400×720 整幅、脚底在底边中点；出手 / 受击按 Codex 给的「相对待机倍率」画（招式伸展大、人缩在画幅里）
    const R = REL[u.key]; if (R && u.alive) {
      const im = IMG[k], now = performance.now() / 1000, sc = u.h / R.idleH * (R[ps] || 1), w = im.width * sc * (720 / im.height), h = 720 * sc;
      const x = u.x + u.ox + (u.hurt > 0 ? Math.sin(now * 80) * 8 * u.hurt : 0), y = u.y + u.oy;
      const k0 = u.key; u.key = '__r189_none'; try { o(u); } finally { u.key = k0; }   // 影子、血条、名字照旧（本体不画）
      const aura = u.key === 'e_mozu2';
      if (aura) auraBack(u, im, x, y, w, h);
      ctx.save(); if (u.hurt > .5) ctx.filter = 'brightness(2.2)'; ctx.drawImage(im, x - w / 2, y - h, w, h); ctx.restore();
      if (aura) auraFront(u, x, y, w, h); return;
    }
    const k0 = u.key; u.key = k; try { return o(u); } finally { u.key = k0; }
  })(drawUnit);

  // 对话立绘：变身之后「魔族高手」说话用真身立绘（default / 怒 / 坏笑），这一战打完、黑风寨收尾演完就换回斗篷版
  const SPK = { '魔族高手': 'p_mozu2_default', '魔族高手·怒': 'p_mozu2_angry', '魔族高手·坏笑': 'p_mozu2_grin' }, OLDP = {};
  const truePortraits = on => { try { for (const n in SPK) { const sp = SPEAKERS[n]; if (!sp) continue; if (on) { if (!(n in OLDP)) OLDP[n] = sp.p; const p3 = SPK[n].replace('mozu2', 'mz3'); if (IMG[p3]) sp.p = p3; else if (IMG[SPK[n]]) sp.p = SPK[n]; } else if (n in OLDP) { sp.p = OLDP[n]; delete OLDP[n]; } } } catch (e) {} };
  // 作者 11-11：「A1 笑声保留，可以接进去」—— 小云雀生成的魔头笑（前 2.5 秒压着嗓子低笑，2.75–5.3 秒放声狂笑，之后喘息收尾）
  const LAUGH = new Audio('r189/mozu2_laugh.mp4'), LINE = new Audio('r189/mozu2_line.mp4'); LAUGH.preload = LINE.preload = 'auto';
  const laugh = () => { try { if (typeof AUD !== 'undefined' && AUD.muted) return; LAUGH.currentTime = 0; LAUGH.volume = 1; LAUGH.play().catch(() => {}); } catch (e) {} };
  async function transform(e) {
    truePortraits(true);
    // 一、压下来：斗篷版低笑，全场一点点暗下去，紫光从斗篷缝里漏出来
    e.pose = null; e._pre = performance.now() / 1000; laugh(); S.shake = 4;
    const v3 = hasTF3() && has3();
    // 作者 11-11：「笑声不用那么长，总时长缩到 10 秒」—— 笑声剪成 3.15 秒（低笑尾巴 + 狂笑），变身动画 3.2 秒正好盖住，台词紧接着吼出来
    await sleep(v3 ? 0 : 2300);
    // 二、撕开：撕斗篷正好卡在放声狂笑那一下
    e._pre = null; e._tf = performance.now() / 1000; S.shake = 14; try { playSnd('sfx_ult', .75); } catch (er) {}
    fx('fx3_orb_violet', { life: 1.2, layer: 0, x: e.x, y: e.y - e.h * .45, scale: k => 1.8 * Math.min(1, k * 2.5), alpha: 1.1, fadeOut: .5 });
    if (v3) {   // R193 三段：0–1 秒低笑压下 / 1–2 秒骨翼撑破斗篷张到最大（正对狂笑）/ 2–3.2 秒收翼抬头、红瞳一亮
      await sleep(1000); S.shake = 16; try { playSnd('sfx_hit_heavy', .8); } catch (er) {}
      await sleep(450); S.shake = 24; S.flash = .55; S.flashColor = '#b07aff';
      await sleep(1350); S.flash = .25; S.flashColor = '#ff3050';   // 红瞳那一下
      await sleep(350);
    } else {
    await sleep(620); S.shake = 20; S.flash = .5; S.flashColor = '#b07aff'; try { playSnd('sfx_hit_heavy', .8); } catch (er) {}   // 第 9–18 帧：斗篷撕裂四散
    await sleep(1400); }
    // 三、真身落地：狂笑还在殿里回荡，笑声收了再开口
    e._tf = null; e.key = 'e_mozu2'; e.h = Math.round(e.h * BIG); e.name = '魔族真身'; S.shake = 10; floatText(e.x, e.y - e.h - 70, '魔族真身', '#ff8ad0', 58);
    await sleep(v3 ? 50 : 1900);
    // 作者 11-11：台词用癫狂版 F6（自己的笑声剪掉，只留台词），咬着牙一字一字吼出来
    try { if (!(typeof AUD !== 'undefined' && AUD.muted)) { LINE.currentTime = 0; LINE.play().catch(() => {}); } } catch (er) {}
    await say('魔族高手·坏笑', '既然看见了本座的真身——你们，一个都别想活着离开。');
  }
  // ---------- 真身技能（作者 11-11：「魔族变身以后技能也应该升级炫酷，威力大幅度提升」）----------
  const banner = (t, col) => floatText(W / 2, 210, t, col || '#d9a0ff', 78, 1.3, BRUSH);
  async function windup(e, name, col) {
    banner(name, col); try { playSnd('sfx_charge'); } catch (er) {} await dimTo(.65, 220);
    e.pose = 'atk'; S.shake = 10;   // 双翼猛地张开
    fx('fx3_orb_violet', { loop: true, life: .9, layer: 2, x: e.x + e.h * .25, y: e.y - e.h * .55, scale: k => .4 + k * 1.1, alpha: 1.4, fadeOut: .2 });
    await sleep(650);
  }
  const strikeFx = (t, big) => { const x = t.x, y = t.y - t.h * .5, s = big ? 1.5 : 1.1;
    fx('fx3_claw_red', { x: x - 10, y, scale: s, rot: -.3, alpha: 1.5 }); setTimeout(() => fx('fx3_claw_red', { x: x + 14, y: y + 10, scale: s * .9, rot: .5, flip: true, alpha: 1.4 }), 110);
    fx('fx3_burst_violet', { x, y, scale: big ? 2.4 : 1.6, alpha: 1.4 }); sparks(x, y, big ? 30 : 18, { speed: 520, size: 1 });
    try { playSnd('sfx_hit_heavy', .9); } catch (er) {} S.shake = big ? 24 : 16; S.flash = big ? .6 : .35; S.flashColor = '#ff2040'; };
  // 剧情一爪：直取云霆（伤害由剧情接管）
  async function killStrike(e, t) {
    await windup(e, '魔翼 · 噬魂爪', '#ff6a8a'); if (t) { strikeFx(t, true); if (t.ally === 'yunting') t._injT = performance.now() / 1000; } await sleep(800); e.pose = null; await dimTo(0, 250);
  }
  async function trueSkill(e, b, kind) {
    const alive = (b.heroes || [b.P]).filter(u => u.alive); if (!alive.length) return false;
    if (kind === 'claw') {   // 噬魂魔爪：单体重击 + 吸血回复
      const t = alive.find(u => !u.ally) || alive[0];
      await windup(e, '噬魂魔爪', '#ff6a8a'); strikeFx(t, false);
      let { d, crit } = dmgCalc(e, t, 1.4, .1); if (t.buffs && t.buffs.def) { d = Math.round(d * .4); delete t.buffs.def; } else if (t.buffs && t.buffs.shield) d = Math.round(d * .5);
      applyDamage(t, d, crit);
      const heal = Math.round(d * .4); e.hp = Math.min(e.maxhp, e.hp + heal);
      for (let i = 0; i < 16; i++) { const sx = t.x, sy = t.y - t.h * .5, life = .6 + Math.random() * .4, ox = (Math.random() - .5) * 80, oy = (Math.random() - .5) * 80;
        addFx({ life, layer: 2, draw(f) { const k = f.t / f.life, x = sx + ox * (1 - k) + (e.x - sx) * k * k, y = sy + oy * (1 - k) + (e.y - e.h * .5 - sy) * k * k; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.sin(Math.PI * k);
          const g = ctx.createRadialGradient(x, y, 0, x, y, 14); g.addColorStop(0, 'rgba(255,90,140,1)'); g.addColorStop(1, 'rgba(160,40,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill(); ctx.restore(); } }); }
      await sleep(700); floatText(e.x, e.y - e.h - 30, '噬魂 +' + heal, '#ff8ad0', 40);
      await sleep(400); e.pose = null; await dimTo(0, 250); return true;
    }
    // 魔翼 · 黑煞天坠：骨翼一扇，黑煞魔焰从天而降砸满全场
    await windup(e, '魔翼 · 黑煞天坠', '#c79bff');
    for (let i = 0; i < 7; i++) setTimeout(() => { const t = alive[i % alive.length], x = t.x + (Math.random() - .5) * 220, y = t.y - t.h * (.2 + Math.random() * .5);
      fx('fx3_burst_violet', { x, y, scale: 1.3 + Math.random() * .8, alpha: 1.4 }); try { playSnd('sfx_boom', .5); } catch (er) {} S.shake = 14; }, i * 120);
    await sleep(500);
    for (const t of alive) { strikeFx(t, false); let { d, crit } = dmgCalc(e, t, 1.2, .05); if (t.buffs && t.buffs.def) { d = Math.round(d * .4); delete t.buffs.def; } else if (t.buffs && t.buffs.shield) d = Math.round(d * .5); applyDamage(t, d, crit); }
    S.shake = 22; await sleep(900); e.pose = null; await dimTo(0, 250); return true;
  }
  // 作者 11-11：变身前的台词配音（第一轮 A1 那种好听的音色）：P2b 半血那句（加快 1.3 倍、收紧停顿）、P3a「魔渊护体！」
  const VO = { p2: new Audio('r189/mozu_p2.mp4'), p3: new Audio('r189/mozu_p3.mp4'), b0: new Audio('r189/mozu_b0.mp4'), c0: new Audio('r189/mozu_c0.mp4') }; for (const k in VO) VO[k].preload = 'auto';
  const vo = k => { try { if (typeof AUD !== 'undefined' && AUD.muted) return; for (const o in VO) if (o !== k) VO[o].pause(); const a = VO[k]; a.currentTime = 0; a.play().catch(() => {}); } catch (e) {} };
  window.R189M = { transform, truePortraits, IM, killStrike, trueSkill, vo };
  if (typeof ch2After === 'function') ch2After = (o => async function () { truePortraits(false); return o.apply(this, arguments); })(ch2After);
  // 打输了 / 跳过战斗也换回来
  startBattle = (o => function (cfg) { const pr = o.apply(this, arguments); try { if (!(cfg && (cfg.enemies || []).some(x => x && x.key === 'e_mozu'))) truePortraits(false); } catch (e) {} return pr; })(startBattle);

  // ---------- 同心衣图标（R128 物品图标那套样式）----------
  load('i_tongxin', 'r189/i_tongxin.webp');
  if (typeof itemIcon === 'function') itemIcon = (o => function (id, x, y, r) {
    if (id !== 'a_tongxin' || !IM.i_tongxin) return o.apply(this, arguments);
    ctx.save(); const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = '#8fd0a8'; ctx.stroke();
    const s = r * 2.15; ctx.drawImage(IM.i_tongxin, x - s / 2, y - s / 2, s, s); ctx.restore();
  })(itemIcon);
})();
