// ================= R471 · 万妖塔三苑的「越往里越压人」气氛（只进测试版）=================
// 作者 11-28 19:27：「进入内苑之后，和外苑、中苑没什么不同啊，恐怖感、压迫感在地图上要体现得明显一点。」
// 做法（纯代码叠在地图上，不改底图）：按苑分三档——
//   外苑：几乎不动；中苑：压暗一点、零星血丝从天上垂落、薄红雾；
//   内苑：明显压暗 + 偏血红的色调、四角压黑的暗角会像呼吸一样极慢地收放、成片红雾缓缓漂移、更多血丝垂落，
//         越靠近首领台越重（走近首领台时画面边缘几乎发黑，只剩中间那棵树和台子亮）。
// 全程缓进缓出：不闪、不抖、不突然变色。以后二到六层按各层的色调接同一套（下面 CFG 加一行就行）。
(function () {
  const CFG = {
    // 苑地图名: [压暗, 暗角, 红雾, 血丝数, 色调(r,g,b)]
    wyt_f1a: [0.00, 0.10, 0.00, 0, [60, 0, 12]],
    wyt_f1b: [0.10, 0.28, 0.10, 14, [60, 0, 12]],
    wyt_f1c: [0.30, 0.62, 0.26, 40, [70, 0, 14]],
    // R473 新画内苑 + 灰石血纹地面（作者 11-28：地面克制，花树才显得邪异）：压暗照旧，但不再把灰石整片染成血红——色调只偏一点点红、红雾减半
    wyt_f1c_gray: [0.30, 0.62, 0.13, 40, [70, 0, 14], 'neutral'],
  };
  const cfgOf = m => (m === 'wyt_f1c' && window.R473I && R473I.on() && R473I.ground() !== 'def' && CFG.wyt_f1c_gray) || CFG[m];
  const lerp = (a, b, k) => a + (b - a) * k;
  let cur = null, k = 0;   // k：当前强度，进图时从 0 慢慢升上去
  const TH = []; for (let i = 0; i < 60; i++) TH.push({ x: Math.random(), y: Math.random(), len: 80 + Math.random() * 220, sp: 6 + Math.random() * 14, w: .6 + Math.random() * 1.4, ph: Math.random() * 6.28 });
  const FOG = []; for (let i = 0; i < 7; i++) FOG.push({ x: Math.random(), y: Math.random(), r: .35 + Math.random() * .35, vx: (Math.random() - .5) * .006, vy: (Math.random() - .5) * .004 });
  function bossNear() {   // 0（远）～1（就在首领台前）
    try { if (world.mapName !== 'wyt_f1c') return 0; const d = R443_META.b.c.objs.find(o => o.id === 'boss_dais'), p = world.player; if (!d || !p) return 0;
      const dist = Math.hypot(p.x - d.bx, p.y - (d.by + 60)); return Math.max(0, Math.min(1, 1 - (dist - 250) / 1400)); } catch (e) { return 0; }
  }
  // ---------- 照魂灯：点亮前后要一眼看得出（作者 19:32：「点亮和不点亮特效好像没什么区别」）----------
  // 没点：灯罩发青发冷，被一圈暗影压着，几缕红色残魂绕着灯慢慢打转（像在等光）；
  // 点亮那一下：一道暖金光柱从灯里缓缓升起再散开（1.5 秒，不闪），残魂化成光点飘走；
  // 点亮以后：地上一圈暖光、灯心火光轻轻跳动、细小的金色火星往上飘，在压暗的内苑里很显眼。
  const LIT = {};   // 灯序号 → 点亮的时刻
  function lamps(t) {
    try {
      if (world.mapName !== 'wyt_f1c' || !window.R443_META) return;
      const V = (window.R443 && R443.ver && R443.ver()) || 'b', M = window.R443 && R443.Z ? R443.Z('c') : R443_META[V] && R443_META[V].c; if (!M) return;   // R473：内苑换新画时跟着新灯位
      const ls = M.objs.filter(o => /^lamp/.test(o.id)), st = ((S.flags.tw || {}).f1 || {}).mech || [];
      const zm = VZ(), cam = world.cam || { x: 0, y: 0 }, now = performance.now() / 1000;
      ls.forEach((o, i) => {
        const x = (o.bx - cam.x) * zm, gy = (o.by - cam.y) * zm, s = zm, y = gy - ((o.hy || 44) - 44) * s, wk = o.glowK || 1; if (   /* 新灯（R473）自己画了光：hy 灯心高度、glowK 减弱 */x < -200 || x > W + 200 || y < -300 || y > H + 200) return;
        const on = !!st[i]; if (on && LIT[i] == null) LIT[i] = (LIT._init ? now : now - 99); LIT._init = 1;
        ctx.save(); ctx.globalAlpha = wk;
        if (!on) {
          // 冷：压一层青灰暗影
          const g = ctx.createRadialGradient(x, y - 40 * s, 4, x, y - 40 * s, 70 * s); g.addColorStop(0, 'rgba(20,30,45,.35)'); g.addColorStop(1, 'rgba(20,30,45,0)'); ctx.fillStyle = g; ctx.fillRect(x - 80 * s, y - 120 * s, 160 * s, 160 * s);
          // 红色残魂绕灯
          ctx.globalCompositeOperation = 'lighter';
          for (let j = 0; j < 3; j++) { const a = t * .7 + j * 2.1, rx = Math.cos(a) * 46 * s, ry = Math.sin(a) * 16 * s - 50 * s + Math.sin(t * 1.3 + j) * 6 * s;
            const gg = ctx.createRadialGradient(x + rx, y + ry, 0, x + rx, y + ry, 12 * s); gg.addColorStop(0, 'rgba(255,70,90,.55)'); gg.addColorStop(1, 'rgba(255,40,60,0)'); ctx.fillStyle = gg; ctx.fillRect(x + rx - 14 * s, y + ry - 14 * s, 28 * s, 28 * s); }
        } else {
          ctx.globalCompositeOperation = 'lighter';
          const fl = .85 + Math.sin(t * 7.3 + i) * .06 + Math.sin(t * 11.1 + i * 2) * .04;
          // 地上一圈暖光（扁椭圆）
          ctx.save(); ctx.translate(x, gy - 6 * s); ctx.scale(1, .42); const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 150 * s); gr.addColorStop(0, `rgba(255,190,110,${.32 * fl})`); gr.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 150 * s, 0, 7); ctx.fill(); ctx.restore();
          // 灯心的光
          const gc = ctx.createRadialGradient(x, y - 44 * s, 0, x, y - 44 * s, 60 * s); gc.addColorStop(0, `rgba(255,230,170,${.7 * fl})`); gc.addColorStop(.4, `rgba(255,170,80,${.3 * fl})`); gc.addColorStop(1, 'rgba(255,140,60,0)'); ctx.fillStyle = gc; ctx.fillRect(x - 60 * s, y - 104 * s, 120 * s, 120 * s);
          // 金色火星往上飘
          for (let j = 0; j < 6; j++) { const p = ((t * .35 + j / 6) % 1), ex = x + Math.sin(j * 1.7 + t) * 14 * s, ey = y - 60 * s - p * 110 * s; ctx.globalAlpha = (1 - p) * .8 * wk; ctx.fillStyle = '#ffd38a'; ctx.beginPath(); ctx.arc(ex, ey, 1.6 * s, 0, 7); ctx.fill(); }
          ctx.globalAlpha = wk;
          // 刚点亮：暖金光柱缓缓升起再散（1.5 秒）
          const d = now - LIT[i]; if (d < 1.6) { const u = d / 1.6, hgt = 260 * s * Math.min(1, u * 1.6), al = Math.sin(Math.PI * u) * .55;
            const gp = ctx.createLinearGradient(x - 26 * s, 0, x + 26 * s, 0); gp.addColorStop(0, 'rgba(255,200,120,0)'); gp.addColorStop(.5, `rgba(255,225,160,${al})`); gp.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = gp; ctx.fillRect(x - 26 * s, y - 40 * s - hgt, 52 * s, hgt); }
        }
        ctx.restore();
      });
    } catch (e) {}
  }
  const layer = { draw() {
    try {
      if (typeof S === 'undefined' || S.scene !== drawMap || !world || !world.map) return;
      const c = cfgOf(world.mapName); if (!c) { cur = null; k = 0; return; }
      if (cur !== world.mapName) { cur = world.mapName; k = 0; }
      k = Math.min(1, k + 1 / 120);   // 进图后约两秒慢慢压上来
      const t = performance.now() / 1000, near = bossNear(), K = k * (1 + near * .6);
      const [dim, vig, fog, nth, col] = c;
      ctx.save();
      // 1) 色调：整体压暗、偏血红（multiply 只会变暗，不会突然发亮）
      if (dim > 0 && c[5] === 'neutral') { ctx.globalCompositeOperation = 'multiply'; const q = dim * K; ctx.fillStyle = `rgb(${Math.round(255 * (1 - Math.min(.3, q * .72)))},${Math.round(255 * (1 - Math.min(.4, q * .95)))},${Math.round(255 * (1 - Math.min(.38, q * .9)))})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
      else if (dim > 0) { ctx.globalCompositeOperation = 'multiply'; const q = dim * K; ctx.fillStyle = `rgb(${Math.round(255 * (1 - Math.min(.3, q * .55)))},${Math.round(255 * (1 - Math.min(.55, q * 1.4)))},${Math.round(255 * (1 - Math.min(.5, q * 1.3)))})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
      // 2) 红雾：几团大而软的雾，跟着镜头有一点视差，慢慢漂
      if (fog > 0) { const cam = world.cam || { x: 0, y: 0 };
        for (const f of FOG) { f.x += f.vx / 60; f.y += f.vy / 60; if (f.x < -.3) f.x = 1.3; if (f.x > 1.3) f.x = -.3; if (f.y < -.3) f.y = 1.3; if (f.y > 1.3) f.y = -.3;
          const x = ((f.x * W - cam.x * .15) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = ((f.y * H - cam.y * .15) % (H * 1.6) + H * 1.6) % (H * 1.6) - H * .3, r = f.r * W;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(120,10,24,${fog * K * .55})`); g.addColorStop(1, 'rgba(120,10,24,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); } }
      // 3) 血丝：从画面上方垂落、缓缓往下滑、轻轻摆（一层的招牌：天上垂下的血红细丝）
      const n = Math.round(nth * Math.min(1.5, K)); if (n) { ctx.lineCap = 'round';
        for (let i = 0; i < n; i++) { const s = TH[i], y0 = ((s.y * (H + 400) + t * s.sp) % (H + 400)) - 300, x0 = s.x * W + Math.sin(t * .5 + s.ph) * 10;
          const g = ctx.createLinearGradient(0, y0, 0, y0 + s.len); g.addColorStop(0, 'rgba(150,10,25,0)'); g.addColorStop(.5, `rgba(170,14,30,${.55 * Math.min(1, K)})`); g.addColorStop(1, 'rgba(150,10,25,0)');
          ctx.strokeStyle = g; ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + Math.sin(t * .7 + s.ph) * 8, y0 + s.len / 2, x0 + Math.sin(t * .4 + s.ph) * 4, y0 + s.len); ctx.stroke(); } }
      // 4) 暗角：四角压黑，内苑会极慢地「呼吸」（6 秒一次，幅度很小）
      if (vig > 0) { const br = 1 + (dim > .15 ? Math.sin(t * 1.05) * .04 : 0), v = Math.min(.85, vig * K * br);
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * (.42 - near * .12), W / 2, H / 2, Math.max(W, H) * .72);
        g.addColorStop(0, 'rgba(8,0,3,0)'); g.addColorStop(1, `rgba(8,0,3,${v})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      lamps(t);
      ctx.restore();
    } catch (e) {}
  } };
  if (typeof S !== 'undefined' && S.overlay) S.overlay.unshift(layer);   // 放最底层：对话框、获得框、HUD 都在它上面
  window.R471 = { CFG };
})();
