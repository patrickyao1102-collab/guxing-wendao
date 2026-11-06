// ===== R135-A：星旋新地图建模（白衣高马尾）+ 藏经阁「星旋施法 · 张长老滑倒」演出 =====
// 作者 11-07（修改1 第 2 条）：地图上的星旋小人不好看、和立绘差太多 → 换成 Codex 照定稿立绘新画的四向行走（白衣、黑长发高马尾、少年神仙）。
//   图集 1120×720：7 列 3 行，行序 下 / 上 / 左，第 0 列待机、1–6 列走路，右向镜像；每帧 160×240，脚点 (80,232)，8fps。
//   显示倍率 0.46：整帧 110px、人身约 100px，和叶孤星地图身高（约 100px）一致。旧的幼年体图集不删，新图没载好或测试面板关掉时自动退回。
// 作者 11-07（修改1 第 8 条）：藏经阁二层，星旋说「嘿嘿，看我的！」之后加一段演出——
//   星旋现身朝张长老抬手施法 → 指尖一缕星光 → 张长老脚下铺开一滩发亮的水渍 → 张长老踩水打滑、手舞足蹈、一屁股坐地（10 帧）→ 接原来的「哎哟喂！……」。
//   时序照 Codex manifest（约 2.25 秒到台词）：0 抬手 / 375ms 星光 / 625ms 水渍 / 1000ms 踩水 / 1875ms 坐地（震屏 + 撞击声）/ 2250ms 出台词。
//   张长老原来在这张图上没有人形，只有对话立绘；这里用滑倒图集第 1 帧当他的地图待机建模，说「奇怪……」那句时从楼道口走过来。
(function () {
  if (typeof drawActorT !== 'function' || typeof say !== 'function' || typeof IMG === 'undefined') return;
  const IM = {}, OK = {};
  for (const k of ['xingxuan_walk', 'xingxuan_cast', 'zhang_slip', 'starlight', 'puddle']) { const im = new Image(); im.onload = () => { OK[k] = 1; if (k === 'xingxuan_walk') IMG.r135_xx_walk = im; }; im.src = 'r135a/' + k + '.webp'; IM[k] = im; }
  let on = true; try { on = localStorage.getItem('r135xx') !== '0'; } catch (e) {}
  const XS = .46;                // 星旋（以及同一演出里的张长老、特效）的人物倍率
  const XO = 85;                 // 星旋现身时站在叶孤星旁边多远（人物像素）：叶孤星取书时贴着转轮经藏，离远一点免得和经藏叠在一起
  const GAP = 165;               // 星旋到张长老多远（人物像素；manifest 里 390px × 0.46 ≈ 180，二层地方小，略收一点）
  const az = () => (typeof AZ === 'function' ? AZ() : 1);
  const vz = () => (typeof VZ === 'function' ? VZ() : 1);

  // ---------- A. 星旋新四向行走：换 NEW_CHAR_SHEET 里的 w_xingxuan（index.html 那段 drawSheet 照常画：镜像右向、8fps 迈步、脚下影子） ----------
  const SHEET = window.NEW_CHAR_SHEET;
  if (SHEET && SHEET.w_xingxuan) {
    const old = SHEET.w_xingxuan, neu = { im: 'r135_xx_walk', s: XS, ms: 125 };
    Object.defineProperty(SHEET, 'w_xingxuan', { configurable: true, enumerable: true, get() { return on && OK.xingxuan_walk ? neu : old; } });
  }
  // 后山观星崖第一次见面时那个漂在半空的星旋（地图物件，不是 actor）：换成新建模的正面待机帧，轻轻上下浮；按人物倍率补回地图缩放，和叶孤星一样大
  const HS0 = window.HS_XX_DRAW;
  window.HS_XX_DRAW = function (x, y, now) {
    if (!(on && OK.xingxuan_walk)) return HS0 ? HS0(x, y, now) : false;
    const s = XS * az(), lift = Math.sin(now * 2.4) * 2 - 6;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= .3 + Math.sin(now * 3) * .08;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 40 * az()); g.addColorStop(0, 'rgba(190,215,255,.8)'); g.addColorStop(1, 'rgba(190,215,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 40 * az(), y - 24 * az(), 80 * az(), 48 * az()); ctx.restore();
    ctx.save(); ctx.translate(x, y + lift); ctx.drawImage(IM.xingxuan_walk, 0, 0, 160, 240, -80 * s, -232 * s, 160 * s, 240 * s); ctx.restore(); return true;
  };

  // ---------- B. 演出用的画法 ----------
  // 帧图集：fw×fh 一格，cols 列
  const cell = (im, i, fw, fh, cols) => [(i % cols) * fw, Math.floor(i / cols) * fh, fw, fh];
  const P = { on: false };       // 当前演出：{ t0, xx, el, pud:{x,y}, flip, cue... }
  const tNow = () => performance.now();
  // 星旋施法帧（朝右；flip 时镜像成朝左）
  function drawCast(a, f) {
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 20, 7, 0, 0, 7); ctx.fill(); ctx.restore();
    const [sx, sy, w, h] = cell(IM.xingxuan_cast, f, 160, 240, 4);
    ctx.save(); ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y); if (P.flip) ctx.scale(-1, 1);
    ctx.drawImage(IM.xingxuan_cast, sx, sy, w, h, -80 * XS, -232 * XS, 160 * XS, 240 * XS); ctx.restore();
  }
  // 张长老：滑倒图集 10 帧（第 0 帧 = 地图待机），走路时没有步帧，用轻微的起伏 + 左右摆假装迈步
  function drawElder(a, now) {
    const f = a._f || 0, mv = !!a.moving, bob = mv ? Math.abs(Math.sin(now * 9)) * 2.2 : 0, sw = mv ? Math.sin(now * 9) * .025 : 0;
    const sit = f >= 7, shw = sit ? 46 : 24;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, shw, 8, 0, 0, 7); ctx.fill(); ctx.restore();
    const [sx, sy, w, h] = cell(IM.zhang_slip, f, 256, 256, 5);
    ctx.save(); ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y - bob); ctx.rotate(sw); if (a._flip) ctx.scale(-1, 1);
    ctx.drawImage(IM.zhang_slip, sx, sy, w, h, -128 * XS, -232 * XS, 256 * XS, 256 * XS); ctx.restore();
  }
  // 特效帧（星光 / 水渍）：256×256，4 列 2 行；pivot 对准锚点；sc = 相对人物的倍率
  function drawFx(im, f, x, y, px, py, sc, alpha, flip) {
    const [sx, sy, w, h] = cell(im, f, 256, 256, 4), s = sc * XS;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(az(), az()); if (flip) ctx.scale(-1, 1);
    ctx.drawImage(im, sx, sy, w, h, -px * s, -py * s, 256 * s, 256 * s); ctx.restore();
  }
  // 演出时间轴（毫秒）
  const T = { star: 375, starEnd: 1175, pud: 625, pudEnd: 1425, slip: 1000, sit: 1875, cue: 2250, castEnd: 1000 };
  const fr = (t, t0, fps, n, hold) => { const i = Math.floor((t - t0) * fps / 1000); return i < 0 ? -1 : i >= n ? (hold ? n - 1 : -1) : i; };
  // 指尖位置（世界坐标）：星旋脚点 + (47,-86) 人物像素
  const tip = () => { const a = P.xx, k = XS * az(); return [a.x + (P.flip ? -47 : 47) * k, a.y - 86 * k]; };
  // 水渍画在地面一层：塞成一个「假 actor」参与 y 排序（排在张长老脚底之前，所以被他踩在下面）
  function drawPuddle(t, lit) {
    if (!P.pud) return; const f = fr(t, T.pud, 10, 8, true); if (f < 0) return;
    const fade = P.out ? Math.max(0, 1 - (tNow() - P.out) / 500) : 1;
    drawFx(IM.puddle, f, P.pud.x, P.pud.y, 128, 145, .65, (lit ? .16 : .85) * fade, false);   // 说明里要求别把水渍整体拉成实体光盘：压暗后只补一点亮
  }
  function drawStar(t, lit) {
    const f = fr(t, T.star, 10, 8, false); if (f < 0 || !P.xx) return; const [x, y] = tip();
    drawFx(IM.starlight, f, x, y, 42, 128, .7, lit ? .85 : 1, P.flip);
  }
  // 指尖到水渍之间飞过去的一点星芒（Codex 的星光只在指尖绽开，距离隔得远时补一道看得见的去向）
  function drawMote(t) {
    if (!P.xx || !P.pud || t < 500 || t > 760) return; const u = (t - 500) / 260, [x0, y0] = tip(), x1 = P.pud.x, y1 = P.pud.y - 6 * az();
    const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 40 * az();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const v = Math.max(0, u - i * .05), xx = x0 + (x1 - x0) * v, yy = y0 + (y1 - y0) * v - Math.sin(v * Math.PI) * 40 * az(), r = (7 - i) * az();
      const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, r * 2); g.addColorStop(0, `rgba(215,235,255,${.75 - i * .13})`); g.addColorStop(1, 'rgba(150,190,255,0)'); ctx.fillStyle = g; ctx.fillRect(xx - r * 2, yy - r * 2, r * 4, r * 4); }
    ctx.restore(); void x; void y;
  }

  drawActorT = (orig => function (a, now) {
    try {
      if (a && a._r135 === 'pud') { drawPuddle(tNow() - P.t0, false); return; }
      if (a && a._r135 === 'star') { const t = tNow() - P.t0; drawStar(t, false); return; }
      if (a && a._r135 === 'elder' && OK.zhang_slip) { drawElder(a, now); return; }
      if (a && a.key === 'w_xingxuan' && a._r135cast != null && OK.xingxuan_cast && !a.hidden) { drawCast(a, a._r135cast); return; }
    } catch (e) { console.warn('r135_a', e); }
    return orig.apply(this, arguments);
  })(drawActorT);
  // 夜里阁内整体压暗（index.html 的 tileDraw 夜色在最后乘一层深蓝）：星光、水渍是法术光，压暗之后再用 lighter 补一层亮
  if (typeof tileDraw === 'function') tileDraw = (orig => function () {
    orig.apply(this, arguments);
    if (!P.on || world.mapName !== P.map) return;
    try { const t = tNow() - P.t0, cam = world.cam || { x: 0, y: 0 }, z = vz();
      ctx.save(); if (z !== 1) ctx.scale(z, z); ctx.translate(-Math.round(cam.x), -Math.round(cam.y)); ctx.globalCompositeOperation = 'lighter';
      if (P.t0) { drawPuddle(t, true); drawStar(t, true); drawMote(t); }
      // 星旋是器灵：身周一圈淡淡的冷光，夜里也看得清他抬手；张长老只借一点灯下的光
      const halo = (a, r, al) => { if (!a || a.hidden || !(al > 0)) return; const k = az(), x = a.x, y = a.y - 48 * k; ctx.save(); ctx.translate(x, y); ctx.scale(r * k, r * 1.1 * k);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, `rgba(190,210,255,${al})`); g.addColorStop(.5, `rgba(170,195,255,${al * .35})`); g.addColorStop(1, 'rgba(170,195,255,0)'); ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore(); };
      halo(P.xx, 70, .16 * (P.xx ? P.xx.alpha ?? 1 : 0)); halo(P.el, 70, .07 * (P.el ? P.el.alpha ?? 1 : 0));
      ctx.restore(); } catch (e) { console.warn('r135_a', e); }
  })(tileDraw);

  // ---------- 剧情挂钩 ----------
  const inLib = () => world.mapName === 'tj_forbidden' && S.flags && S.flags.lib_ch1 && typeof S.scene === 'function' && world.map && world.map.tile;
  const ready = () => on && OK.zhang_slip && OK.xingxuan_cast && OK.starlight && OK.puddle && OK.xingxuan_walk;
  const tw = (ms, fn) => (typeof tween === 'function' ? tween(ms, fn) : new Promise(r => { fn(1); r(); }));
  function clear() { if (!P.on) return; const ids = [P.xx, P.el, P.pa, P.sa].filter(Boolean); world.actors = (world.actors || []).filter(a => !ids.includes(a)); for (const k in P) delete P[k]; P.on = false; }
  // 张长老从楼道口走过来，停在叶孤星右边（右边放不下就放左边，星旋施法帧镜像）
  function spawnElder() {
    clear(); const p = world.player, M = world.map.T, k = az(), gap = (XO + GAP) * k;
    let flip = false, ex = p.x + gap;
    if (ex > M.mw - 110) { flip = true; ex = p.x - gap; }
    ex = Math.max(110, Math.min(M.mw - 110, ex));
    const G = window.R135A_GEO || { from: [672, 1010], cx: 672, minY: 560 };   // R136 新二层：从南门进来
    const ey = Math.max(G.minY, Math.min(M.mh - 110, p.y + 8));
    const el = addActor('', G.from[0], Math.min(M.mh - 70, G.from[1]), '张长老', '#c8f0b0'); el._r135 = 'elder'; el._f = 0; el.h = 104; el.alpha = 0; el._flip = false;
    Object.assign(P, { on: true, map: world.mapName, el, flip, ex, ey, t0: 0 });
    tw(300, t => el.alpha = t);
    // 先斜着走到石台一侧，再往上走到位（不穿过中间的剑典石台）；星旋现身时还没走到就直接到位
    const mid = Math.abs(ex - G.cx) > 140 ? [G.cx + (ex > G.cx ? 150 : -150), Math.max(ey, G.from[1] > 1100 ? ey : 860)] : null;
    walk(el, mid ? [mid, [ex, ey]] : [[ex, ey]], 150);
  }
  async function walk(a, pts, spd) {
    const tok = a._tok = {};
    for (const [x, y] of pts) {
      const x0 = a.x, y0 = a.y, d = Math.hypot(x - x0, y - y0); if (d < 1) continue; const t0 = tNow(), dur = d / spd * 1000; a.moving = true;
      await new Promise(res => { const st = () => { if (a._tok !== tok) return res(); const u = Math.min(1, (tNow() - t0) / dur); a.x = x0 + (x - x0) * u; a.y = y0 + (y - y0) * u; if (u >= 1) return res(); requestAnimationFrame(st); }; requestAnimationFrame(st); });
      if (a._tok !== tok) return;
    }
    a.moving = false;
  }
  // 星旋从玉佩里化光现身，站到叶孤星和张长老之间偏叶孤星这侧
  async function showXX() {
    const p = world.player, x = p.x + (P.flip ? -1 : 1) * XO * az(), y = p.y + 6 * az();
    const xx = addActor('w_xingxuan', x, y, '星旋', '#cfe0ff'); xx.alpha = 0; xx.h = 110; xx.face = P.flip ? 'left' : 'right'; xx.dir = P.flip ? -1 : 1; P.xx = xx;
    if (P.el) { P.el._tok = null; P.el.x = P.ex; P.el.y = P.ey; P.el.moving = false; P.el.alpha = 1; }   // 万一还在走（玩家点得飞快）直接到位
    try { playSnd('sfx_star', .5); } catch (e) {}
    if (typeof particleBurst === 'function') try { const cam = world.cam || { x: 0, y: 0 }, z = vz(); particleBurst((x - cam.x) * z, (y - 50 * az() - cam.y) * z, 14, ['#cfe0ff', '#fff'], 90, .8, 3, -30); } catch (e) {}
    await tw(400, t => xx.alpha = t);
  }
  let swallowHit = false;
  async function perform() {
    const xx = P.xx, el = P.el;
    const pud = { x: el.x + (P.flip ? 20 : -20) * az() * XS, y: el.y };
    P.pud = pud;
    P.pa = addActor('', pud.x, pud.y - 40, '', ''); P.pa._r135 = 'pud';           // y 比张长老脚底小 → 先画、被他踩在下面
    P.sa = addActor('', xx.x, xx.y + 2, '', ''); P.sa._r135 = 'star';
    el._flip = false; el._f = 0;
    P.t0 = tNow(); let shook = false, starSnd = false;
    await new Promise(res => {
      const step = () => {
        if (!P.on) return res();
        const t = tNow() - P.t0;
        xx._r135cast = t < 1400 ? Math.min(7, Math.floor(t * 8 / 1000)) : null;
        if (t >= T.star && !starSnd) { starSnd = true; try { playSnd('sfx_star', .7); } catch (e) {} }
        el._f = t < T.slip ? 0 : Math.min(9, Math.floor((t - T.slip) * 8 / 1000));
        if (t >= T.sit && !shook) { shook = true; S.shake = 10; try { sfx('hit'); } catch (e) {} }
        if (t >= T.cue) return res();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    // 张长老抱怨期间停在最后一帧（指着空气抱怨）；演出期间每帧继续推（rAF 停了也不影响：帧号已到底）
    el._f = 9; xx._r135cast = null;
    swallowHit = true;   // 原剧情紧接着还有一句 S.shake = 10; sfx('hit')——坐地那一下已经震过、响过了，吞掉这一次
    setTimeout(() => { swallowHit = false; }, 1500);   // 保险：万一没接上那句台词，也不能一直吞掉撞击声
  }
  if (typeof sfx === 'function') sfx = (orig => function (type) { if (swallowHit && type === 'hit') return; return orig.apply(this, arguments); })(sfx);

  say = (orig => function (who, text) {
    try {
      if (typeof text === 'string' && inLib()) {
        if (text.startsWith('奇怪，刚才明明察觉到禁制有异动') && ready()) spawnElder();
        else if (text === '嘿嘿，看我的！' && P.on && P.el && ready()) {
          return (async () => { await showXX(); await orig.call(this, who, text); if (P.on) await perform(); })();
        }
        else if (text.startsWith('哎哟喂！是谁这么没公德心') && P.on) {
          if (swallowHit) { S.shake = Math.min(S.shake || 0, 4); swallowHit = false; }
          const r = orig.apply(this, arguments);
          return r.then(v => { const xx = P.xx; if (xx) tw(450, t => xx.alpha = 1 - t).then(() => { xx.hidden = true; }); return v; });   // 星旋化回玉佩
        }
      }
    } catch (e) { console.warn('r135_a', e); }
    return orig.apply(this, arguments);
  })(say);
  // 离开这张图（剧情 fadeOut 后切到外院）时收掉演出里加的人物
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function () { if (P.on) clear(); swallowHit = false; return orig.apply(this, arguments); })(tileSetMap);

  // 测试面板：可关掉换回旧的幼年体星旋
  (function addBtn(n) {
    const pan = document.getElementById('dbgPanel'); if (!pan) { if ((n || 0) < 40) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
    const h = document.createElement('h4'); h.textContent = '星旋 · 新地图建模（R135）'; const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button'); const lab = () => { b.textContent = on ? '星旋白衣新建模 + 张长老滑倒演出：开 · 点一下换回旧的' : '星旋新建模：关（旧幼年体，无滑倒演出）· 点一下开'; }; lab();
    b.onclick = () => { on = !on; try { localStorage.setItem('r135xx', on ? '1' : '0'); } catch (e) {} lab(); pan.hidden = true; try { toast(on ? '星旋已换成白衣新建模' : '星旋已换回旧的幼年体', 2200); } catch (e) {} };
    row.appendChild(b);
    const put = () => { if (!pan.contains(row)) { lab(); pan.prepend(h, row); } };
    put(); new MutationObserver(put).observe(pan, { childList: true });
  })();
  window.R135A = { get on() { return on; }, set(v) { on = !!v; }, ok: OK, P, T };
})();
