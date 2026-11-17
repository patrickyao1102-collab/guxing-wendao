// ================= R357 · 东厢朝南：小时候的回忆「摇桂花、埋酒」（作者 11-17 定稿剧情，Codex R357 第二步 80 帧）（只进测试版）=================
// 地方：阿澈家老院子「十几年前」那一版（qy_chehome_old），大桂花树下。
// 剧情：师父树下铺布、抱着空酒坛等着 → 两个孩子一人抱一边树干使劲摇 → 桂花落了两人满头满身 → 互相笑话 → 甩脑袋，阿焰顺手一巴掌拍掉阿澈头顶最后一朵，阿澈要拍回去，阿焰一闪
//       → 师父把布上的桂花拢进坛子、封口 → 树根边挖坑埋下：「等你们长大再开。」 → 两人蹲在坑边看，风一吹桂花又落下来 → 慢慢变黑。
// 素材：r357/*.webp（Codex @2x 原图，按 1x 世界尺寸画）；时间轴 r357/tl.json（tl.js 随页面载入）。
// 代码做：走位（转场按路径走、用已通过的行走帧）、树轻晃、满天落花、头上甩下去的花、脚下的影子、回忆的暖色滤镜、最后变黑。
// 用法：await R357_MEMORY()   —— 自己切到 qy_chehome_old，演完画面停在全黑（S.fade=1），调用方接着切回去。
(function () {
  if (typeof TMAPS === 'undefined' || typeof tileDraw !== 'function') return;
  let TL = null;
  try { TL = (window.GXD || {})['r357/tl.json'] || null; } catch (e) {}
  if (!TL) return;
  const MAP = 'qy_chehome_old', V = '?v=1';
  const IM = {};
  const img = k => { if (!IM[k]) { const im = new Image(); im.src = 'r357/' + k + '.webp' + V; IM[k] = im; try { IMG['r357_' + k] = im; } catch (e) {} } return 'r357_' + k; };
  const preload = () => { for (const f of TL.frames) for (const l of f.L) img(l[0]); for (const k in TL.walk) for (const x of TL.walk[k]) img(x); };
  // 脚下的影子（平贴在地上，比人先画）
  { const c = document.createElement('canvas'); c.width = 64; c.height = 20; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 10, 2, 32, 10, 30); gr.addColorStop(0, 'rgba(30,24,16,.42)'); gr.addColorStop(1, 'rgba(30,24,16,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(32, 10, 30, 9, 0, 0, 7); g.fill(); try { IMG.r357_shadow = c; } catch (e) {} }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const tw = (ms, fn) => new Promise(res => { const t0 = performance.now(); const step = () => { const k = Math.min(1, (performance.now() - t0) / ms); fn(k); if (k < 1) requestAnimationFrame(step); else res(); }; step(); });

  // ---------- 画面层：暖色回忆滤镜、落花、甩下来的花、最后变黑 ----------
  let MEM = 0, DARK = 0; const PET = [], BURST = [];
  let fall = { on: false, density: 0, rect: [470, 300, 300, 140] };
  tileDraw = (o => function () { const r = o.apply(this, arguments);
    try { if (MEM > 0 && world.mapName === MAP) {
      const cam = world.cam || { x: 0, y: 0 }, z = typeof VZ === 'function' ? VZ() : 1, now = performance.now() / 1000;
      // 落花（从树冠里出来，飘到地上淡掉）
      if (fall.on && Math.random() < fall.density / 60) { const [x, y, w, h] = fall.rect; PET.push({ x: x + Math.random() * w, y: y + Math.random() * h, vy: .6 + Math.random() * .9, s: Math.random() * 6, life: 200 + Math.random() * 140, c: Math.random() < .7 ? '#f2c94c' : '#e8a93a' }); }
      ctx.save(); if (z !== 1) ctx.scale(z, z); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
      for (const p of PET) { p.y += p.vy; p.x += Math.sin(now * 2 + p.s) * .5; ctx.globalAlpha = Math.min(1, p.life / 40); ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(p.x, p.y, 3, 2, p.s, 0, 7); ctx.fill(); p.life--; }
      for (let i = PET.length - 1; i >= 0; i--) if (PET[i].life <= 0) PET.splice(i, 1);
      const dt = 1 / 60;
      for (const b of BURST) { if (!b.landed) { b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; if (b.y >= b.ty) { b.y = b.ty; b.landed = true; } } else b.life -= 1;
        ctx.globalAlpha = Math.max(0, Math.min(1, b.life / 60)); ctx.fillStyle = b.c; ctx.beginPath(); ctx.ellipse(b.x, b.y, 3, 2, b.s, 0, 7); ctx.fill(); }
      for (let i = BURST.length - 1; i >= 0; i--) if (BURST[i].life <= 0) BURST.splice(i, 1);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .34 * MEM; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#e2b877'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .75); g.addColorStop(0, 'rgba(40,24,6,0)'); g.addColorStop(1, `rgba(40,24,6,${.62 * MEM})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
      if (DARK > 0) { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${Math.min(1, DARK)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    } } catch (e) {}
    return r; })(tileDraw);
  const burst = (foot, e) => { const [lx, ly, lw, lh] = e.landing_rect || [foot[0] - 40, foot[1] + 4, 80, 20];
    for (let i = 0; i < (e.count || 6); i++) BURST.push({ x: foot[0] + (e.origin_offset || [0, -72])[0] + (Math.random() - .5) * 14, y: foot[1] + (e.origin_offset || [0, -72])[1] + (Math.random() - .5) * 10,
      vx: (e.velocity || [0, -40])[0] * (.5 + Math.random()), vy: (e.velocity || [0, -40])[1] * (.6 + Math.random() * .8), g: e.gravity || 260, ty: ly + Math.random() * lh, s: Math.random() * 6, life: 90 + Math.random() * 60, c: Math.random() < .7 ? '#f2c94c' : '#e8a93a' }); };

  // ---------- 摆一帧：把这一帧的图层临时塞进地图物件（和别的东西一起按脚底排前后） ----------
  const T = () => world.map && world.map.T;
  const clear = () => { const t = T(); if (t && t.objs) t.objs = t.objs.filter(o => !o._r357); };
  let FEET = {};
  const put = (layers, extraShadow) => { const t = T(); if (!t || !t.objs) return; clear(); FEET = {};
    const add = [];
    for (const [k, x, y, w, h, z, a, act, feet] of layers) { add.push({ _r357: 1, bk: true, noBlock: true, img: img(k), id: 'r357_' + k, uid: 'r357_' + add.length, x, y, w, h, sy: z, alpha: a });
      (act || []).forEach((id, i) => { FEET[id] = feet[i]; }); }
    for (const id in FEET) { const [fx, fy] = FEET[id]; add.push({ _r357: 1, bk: true, flat: true, noBlock: true, img: 'r357_shadow', id: 'r357_sh', uid: 'r357_sh_' + id, x: fx - 24, y: fy - 7, w: 48, h: 14, sy: fy - 1 }); }
    t.objs.push(...add); };
  // 树轻晃（根部不动，树冠左右摆一点）
  let shake = null;
  const treeObj = () => { const t = T(); return t && (t.objs || []).find(o => o.id === 'tree'); };
  const shakeLoop = () => { const o = treeObj(); if (!o) return;
    if (shake) { o.shakeK = .022 * shake.k; requestAnimationFrame(shakeLoop); } else o.shakeK = 0; };

  const EV = {}; for (const e of TL.events) (EV[e.frame] = EV[e.frame] || []).push(e);
  const fired = new Set();
  const say = (who, text) => { const f = FEET[who] || [700, 600]; const h = who === 'master' ? 118 : 92;
    return window.BUB ? BUB.say({ x: f[0], y: f[1] }, text, { h, ms: Math.max(1500, text.length * 170) }) : sleep(1600); };
  // 一帧的事件；返回这一帧要多停多久（有台词就等台词说完）
  const fire = async i => { const L = EV[i] || []; let waits = [];
    for (const e of L) { const id = e.type + '@' + i + (e.actor || ''); if (e.fire_policy === 'once_per_scene' && fired.has(id)) continue; fired.add(id);
      if (e.type === 'tree_shake_start') { shake = { k: 1 }; shakeLoop(); }
      else if (e.type === 'tree_shake_stop') { if (shake) { const s = shake; tw(e.ease_out_ms || 200, k => s.k = 1 - k).then(() => { shake = null; }); } }
      else if (e.type === 'fall_start') { fall = { on: true, density: (e.density || 45) / 30, rect: e.source_rect || fall.rect }; }
      else if (e.type === 'fall_density') { fall.density = (e.density || 60) / 30; setTimeout(() => { fall.density = .6; }, 1600); }
      else if (e.type === 'wind_fall_start') { fall = { on: true, density: (e.density || 14) / 20, rect: e.source_rect || fall.rect }; }
      else if (e.type === 'head_flower_burst' || e.type === 'last_flower_pop') { const f = FEET[e.actor]; if (f) burst(f, e); }
      else if (e.type === 'soil_puff') { const [x, y] = e.world; for (let k = 0; k < (e.count || 4); k++) BURST.push({ x: x + (Math.random() - .5) * 16, y: y - 4, vx: (Math.random() - .5) * 40, vy: -40 - Math.random() * 30, g: 200, ty: y + 2, s: 0, life: 40, c: '#9a7a52' }); }
      else if (e.type === 'dialogue_cue') waits.push(say(e.actor, e.text)); }
    return waits.length ? Promise.all(waits) : null; };

  // ---------- 转场：按路径走（用已通过的行走帧），其他人照上一帧摆着 ----------
  const walkTo = async (tr, prevLayers) => { const D = tr.duration_ms || 800, movers = tr.actors || [];
    const keep = prevLayers.filter(l => !(l[7] || []).some(id => movers.includes(id)) && !(tr.carry_jar && /^p_jar/.test(l[0])));
    // 坛子跟着师父的手
    const jar = tr.carry_jar ? prevLayers.find(l => /^p_jar/.test(l[0])) : null, mPrev = prevLayers.find(l => (l[7] || []).includes('master'));
    const jarOff = jar && mPrev ? [jar[1] - mPrev[8][0][0], jar[2] - mPrev[8][0][1]] : null;
    const len = p => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; };
    const at = (p, u) => { const L = len(p) * u; let s = 0; for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (s + d >= L || i === p.length - 1) { const k = d ? Math.min(1, (L - s) / d) : 1; const dx = p[i][0] - p[i - 1][0], dy = p[i][1] - p[i - 1][1];
          const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); return [p[i - 1][0] + dx * k, p[i - 1][1] + dy * k, dir]; } s += d; } return [p[0][0], p[0][1], 'down']; };
    const t0 = performance.now();
    await new Promise(res => { const step = () => { const u = Math.min(1, (performance.now() - t0) / D), fi = Math.floor((performance.now() - t0) / 140) % 4; const L = keep.slice();
      for (const id of movers) { const p = tr.paths[id]; if (!p) continue; const [x, y, dir] = at(p, u); const fr = TL.walk[id + '_' + dir] || []; const k = fr[fi % Math.max(1, fr.length)]; if (!k) continue;
        L.push([k, x - 80, y - 232, 160, 240, y, 1, [id], [[x, y]]]);
        if (id === 'master' && jar && jarOff) L.push([jar[0], x + jarOff[0], y + jarOff[1], jar[3], jar[4], y + .2, 1, [], []]); }
      put(L); if (u < 1) requestAnimationFrame(step); else res(); }; step(); }); };

  // 师父走那一段（frame 38–53）：每帧之间按位置连续滑过去，不是一格一格跳
  const MOVE = TL.events.find(e => e.type === 'world_move');
  const glide = async (i, ms) => { const A = TL.frames[i].L, B = (TL.frames[i + 1] || {}).L; if (!B) { put(A); await sleep(ms); return; }
    const t0 = performance.now(); await new Promise(res => { const step = () => { const u = Math.min(1, (performance.now() - t0) / ms);
      const L = A.map(l => { const isM = (l[7] || []).includes('master') || /^p_jar/.test(l[0]); if (!isM) return l;
        const m = B.find(b => ((b[7] || []).includes('master') && (l[7] || []).includes('master')) || (/^p_jar/.test(b[0]) && /^p_jar/.test(l[0]))); if (!m) return l;
        const x = l[1] + (m[1] - l[1]) * u, y = l[2] + (m[2] - l[2]) * u, z = l[5] + (m[5] - l[5]) * u; const feet = (l[8] || []).map((f, j) => { const g = (m[8] || [])[j] || f; return [f[0] + (g[0] - f[0]) * u, f[1] + (g[1] - f[1]) * u]; });
        return [l[0], x, y, l[3], l[4], z, l[6], l[7], feet]; });
      put(L); if (u < 1) requestAnimationFrame(step); else res(); }; step(); }); };

  const LOOPN = { tree: 3, laugh: 2, gather: 2, dig: 2, cover: 2, squat_watch: 3 };
  const playFrame = async i => { const f = TL.frames[i]; const w = fire(i);
    if (MOVE && i >= MOVE.frame && i < MOVE.frame + 15) await glide(i, f.ms); else { put(f.L); await sleep(f.ms); }
    if (w) await w; };

  window.R357_MEMORY = async function (opt) {
    opt = opt || {}; if (!TMAPS[MAP]) return;
    preload(); fired.clear(); PET.length = 0; BURST.length = 0; fall = { on: false, density: 0, rect: [470, 300, 300, 140] }; shake = null;
    const keep = (world.actors || []).slice(), z0 = MAP_ZOOM[MAP], hud0 = S.hud;
    world.locked = true; window.R328_OFF = true;
    try {
      try { if (window.CHE_GATE) CHE_GATE('half'); } catch (e) {}
      try { MAP_ZOOM[MAP] = 1.55; } catch (e) {}
      tileSetMap(MAP, 640 / 64 - .5, 700 / 64 - .8, 'up'); S.scene = drawMap; world.banner = null; S.hud = false;
      world.actors = world.actors.filter(a => a === world.player); world.player.hidden = true; world.camFocus = [650, 520];
      put(TL.frames[0].L); MEM = 1; S.flash = .9; S.flashColor = '#fff4d8';
      await sleep(400); try { S.fade = 0; } catch (e) {}
      await sleep(700);
      // 按时间轴往下演：循环段多放几遍，转场插在对应帧前面
      const loops = {}; for (const l of TL.loops) loops[l.frames[0]] = l;
      const trs = {}; for (const t of TL.transitions) trs[t.before_frame] = t;
      let i = 0, last = TL.frames[0].L;
      while (i < TL.frames.length) {
        if (trs[i]) { await walkTo(trs[i], last); }
        const lp = loops[i];
        if (lp) { const n = LOOPN[lp.id] || 1; for (let r = 0; r < n; r++) for (const k of lp.frames) await playFrame(k); i = lp.frames[lp.frames.length - 1] + 1; last = TL.frames[i - 1].L; continue; }
        await playFrame(i); last = TL.frames[i].L; i++;
      }
      // 结尾：两人蹲着看，风吹落花，慢慢变黑
      const lp = TL.loops.find(l => l.id === 'squat_watch');
      let stop = false; const run = (async () => { while (!stop) for (const k of (lp ? lp.frames : [79])) { if (stop) break; put(TL.frames[k].L); await sleep(TL.frames[k].ms); } })();
      await sleep(1600); await tw(3000, k => DARK = k); DARK = 1; stop = true; await run; await sleep(300);
    } finally {
      clear(); shake = null; const o = treeObj(); if (o) o.shakeK = 0;
      MEM = 0; DARK = 0; fall.on = false; PET.length = 0; BURST.length = 0;
      try { if (z0 == null) delete MAP_ZOOM[MAP]; else MAP_ZOOM[MAP] = z0; } catch (e) {}
      world.actors = keep; world.player.hidden = false; world.camFocus = null; window.R328_OFF = false; world.locked = false; S.hud = hud0;
      try { if (window.BUB) BUB.clear(); } catch (e) {}
      try { S.fade = 1; } catch (e) {}
    }
  };
})();
