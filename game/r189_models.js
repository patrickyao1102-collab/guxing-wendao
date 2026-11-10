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
  function drawTF(u, t) {
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
  drawUnit = (o => function (u) {
    if (u && u._tf != null && u.alive) { const t = performance.now() / 1000 - u._tf; stepParticles(u, u.x + u.ox, u.y + u.oy); drawP(true); if (drawTF(u, t)) { drawP(false); return; } }
    if (u && u._pre != null && u.alive) {   // 变身前奏：斗篷版在低笑里发抖，紫光一丝丝漏出来、魔气往上冒
      const k = Math.min(1, (performance.now() / 1000 - u._pre) / 2.3), x = u.x + u.ox, y = u.y + u.oy;
      stepParticles(u, x, y); drawP(true);
      const ox = u.ox; u.ox += (Math.random() - .5) * 5 * k * k; try { o(u); } finally { u.ox = ox; }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .25 + k * .6;
      const g = ctx.createRadialGradient(x, y - u.h * .5, 6, x, y - u.h * .5, u.h * (.35 + k * .4)); g.addColorStop(0, 'rgba(190,100,255,.7)'); g.addColorStop(1, 'rgba(110,30,190,0)');
      ctx.fillStyle = g; ctx.fillRect(x - u.h, y - u.h * 1.3, u.h * 2, u.h * 1.5); ctx.restore(); drawP(false); return;
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
  const truePortraits = on => { try { for (const n in SPK) { const sp = SPEAKERS[n]; if (!sp) continue; if (on) { if (!(n in OLDP)) OLDP[n] = sp.p; if (IMG[SPK[n]]) sp.p = SPK[n]; } else if (n in OLDP) { sp.p = OLDP[n]; delete OLDP[n]; } } } catch (e) {} };
  // 作者 11-11：「A1 笑声保留，可以接进去」—— 小云雀生成的魔头笑（前 2.5 秒压着嗓子低笑，2.75–5.3 秒放声狂笑，之后喘息收尾）
  const LAUGH = new Audio('r189/mozu2_laugh.mp4'); LAUGH.preload = 'auto';
  const laugh = () => { try { if (typeof AUD !== 'undefined' && AUD.muted) return; LAUGH.currentTime = 0; LAUGH.volume = 1; LAUGH.play().catch(() => {}); } catch (e) {} };
  async function transform(e) {
    truePortraits(true);
    // 一、压下来：斗篷版低笑，全场一点点暗下去，紫光从斗篷缝里漏出来
    e.pose = null; e._pre = performance.now() / 1000; laugh(); S.shake = 4;
    await sleep(2300);
    // 二、撕开：撕斗篷正好卡在放声狂笑那一下
    e._pre = null; e._tf = performance.now() / 1000; S.shake = 14; try { playSnd('sfx_ult', .75); } catch (er) {}
    fx('fx3_orb_violet', { life: 1.2, layer: 0, x: e.x, y: e.y - e.h * .45, scale: k => 1.8 * Math.min(1, k * 2.5), alpha: 1.1, fadeOut: .5 });
    await sleep(620); S.shake = 20; S.flash = .5; S.flashColor = '#b07aff'; try { playSnd('sfx_hit_heavy', .8); } catch (er) {}   // 第 9–18 帧：斗篷撕裂四散
    await sleep(1400);
    // 三、真身落地：狂笑还在殿里回荡，笑声收了再开口
    e._tf = null; e.key = 'e_mozu2'; e.h = Math.round(e.h * BIG); e.name = '魔族真身'; S.shake = 10; floatText(e.x, e.y - e.h - 70, '魔族真身', '#ff8ad0', 58);
    await sleep(1300);
    await say('魔族高手·坏笑', '……很久没有人，逼本座现出这副模样了。');
  }
  window.R189M = { transform, truePortraits, IM };
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
