// ================= Codex 整图地图：代码加细节（R64）=================
// 按物件名自动认出它是什么，再给它加“活”的东西。只作用于 Codex 烘焙地图（CXB2），老地图已有的效果不重复加。
//  树/竹/草/花/旗：随风轻摇          灯/炉/火盆/篝火：呼吸暖光 + 火星往上飘
//  丹炉/茶炉/茶桌/香炉：袅袅白汽      水缸/井/池塘/瀑布：水面闪光、瀑布水雾
//  灵晶/宝物/神剑：星芒闪烁 + 灵光     花丛（室外白天）：蝴蝶绕着飞
//  樱/桃/桂/枫：树下零星飘花瓣落叶     室内：空气里浮着的金色微尘
(function () {
  if (typeof CXB2 === 'undefined') return;
  // 自动降特效：连续 4 秒平均帧时间 > 24ms（低于约 40 帧）就打开 LOWFX，关掉蝴蝶/星芒/云影/柔光这些纯装饰
  (function () { let last = 0, acc = 0, n = 0, t0 = 0; const f = t => { if (last && S && S.scene === drawMap) { acc += Math.min(100, t - last); n++; if (!t0) t0 = t; if (t - t0 > 4000) { const avg = acc / n; if (avg > 24 && !window.LOWFX_LOCK) window.LOWFX = 1; acc = n = 0; t0 = t; } } last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); })();
  const TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a);
  const has = (id, re) => re.test(id);
  // ---------- 分类 ----------
  const R = {
    noSway: /rock|stone|crag|cliff|stele|statue|lion|rail|wall|gate|hall|house|shop|stall|counter|shelf|cabinet|bed|desk|table|chair|lamp|lantern|pillar|column|jar|well|pond|stump|bones|boulder|cart|crate|sacks|board|post|dais|throne|tent|tower|palisade|cage|bench|arch|marker|bank|step/,
    pine: /pine|cypress/, tree: /tree|maple|birch|willow|osmanthus|cherry|scholar/, bamboo: /bamboo/, soft: /fern|grass|flower|reed|herb_rack|moon_herb|starflower|frostfruit/, flag: /banner|flag/,
    fire: /brazier|campfire|forge|furnace|bonfire/, stove: /stove|incense|tea_wind|tea_stove/, lamp: /lamp|lantern|lotus_lamp|cloud_lamp|candle/,
    steam: /tea_table|tea_set|tea_service|vip-tea|tea_sect|tea_yunting|tea_bamboo|tea_linxue|tea_wanbao|tea_reception|pill_counter|herb_grinder/,
    water: /pond|well|water_jar|trough|cold_spring/, fall: /waterfall/,
    crystal: /crystal|jade_slip|seal_shard|spirit_lamp|soul_pill|treasure_fire|treasure_ice|treasure_star|floating_sword|suspended_sword|ancestor_blade|xingxuan|ningshuang|thunder_sword|codex_case|sword_runner/,
    flowers: /flower|flowerbed|fern_flowers|lotus|starflower/, petal: /cherry|peach|osmanthus|maple/,
  };
  const CRYCOL = id => /amethyst|purple|thunder|nine/.test(id) ? '205,160,255' : /emerald|jade/.test(id) ? '150,255,200' : /rose|fire/.test(id) ? '255,170,150' : /amber|soul|treasure_star|ancestor/.test(id) ? '255,220,140' : '170,225,255';
  const SWAYK = id => /rock|stone|boulder|crag/.test(id) ? 0 : has(id, R.noSway) && !has(id, /flower|grass|fern|bamboo|reed/) ? 0 : has(id, R.flag) ? .03 : has(id, R.bamboo) ? .045 : has(id, R.soft) ? .04 : has(id, R.pine) ? .012 : has(id, R.tree) ? .02 : 0;

  let LIST = null, MAPID = null, PARTS = [], BUGS = [], MOTES = [], last = 0;
  function build() {
    const def = world.map && world.map.def, B = def && def.baked; MAPID = world.mapName; LIST = []; PARTS = []; BUGS = []; MOTES = [];
    if (!B || !B.objs) return;
    const T = world.map.T;
    for (const o of T.objs) {
      if (!o.bk || o.r60 || !o.id) continue; const id = String(o.id);
      const k = SWAYK(id); if (k && !(id in BK_SWAY) && o.w < 700) BK_SWAY[id] = k;
      if (OBJ_FX[id]) continue;   // 老效果已经有的不重复
      const e = { o, id };
      if (has(id, R.fire)) e.fire = 1;
      else if (has(id, R.lamp)) e.lamp = 1;
      if (has(id, R.stove)) e.steam = 1, e.fire2 = has(id, /stove|furnace/) ? 1 : 0;
      if (has(id, R.steam)) e.steam = 1;
      if (has(id, R.fall)) e.fall = 1; else if (has(id, R.water)) e.water = 1;
      if (has(id, R.crystal)) e.crystal = CRYCOL(id);
      if (has(id, R.flowers) && !e.lamp) e.flowers = 1;
      if (has(id, R.petal)) e.petal = /maple/.test(id) ? 'maple' : /osmanthus/.test(id) ? 'gold' : 'pink';
      if (e.fire || e.lamp || e.steam || e.water || e.fall || e.crystal || e.flowers || e.petal) LIST.push(e);
    }
  }
  const indoor = () => { const d = world.map && world.map.def; return !!(d && (d.indoor || (d.baked && d.baked.indoor))); };
  const night = () => { const d = world.map && world.map.def; return !!(d && d.tint); };

  // ---------- 预渲染的小贴图 ----------
  const mk = (s, f) => { const c = document.createElement('canvas'); c.width = c.height = s; f(c.getContext('2d'), s); return c; };
  const GLOW = {}; const glow = col => GLOW[col] || (GLOW[col] = mk(128, (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, `rgba(${col},.55)`); r.addColorStop(.35, `rgba(${col},.18)`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 0, s, s); }));
  const PUFF = mk(64, (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, 'rgba(245,245,248,.9)'); r.addColorStop(1, 'rgba(245,245,248,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); });
  function star(x, y, r, a, col) { ctx.globalAlpha = a; ctx.fillStyle = `rgba(${col},1)`; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r * .28, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r * .28, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - r * .7, y); ctx.quadraticCurveTo(x, y, x, y - r * .2); ctx.quadraticCurveTo(x, y, x + r * .7, y); ctx.quadraticCurveTo(x, y, x, y + r * .2); ctx.quadraticCurveTo(x, y, x - r * .7, y); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r * .12, 0, TAU); ctx.fill(); }
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  // ---------- 每帧 ----------
  tileAmbientHigh = (orig => function (T, cam, now) {
    orig && orig(T, cam, now);
    const def = world.map && world.map.def; if (!def || !def.baked || window.MD2_OFF) return;
    if (MAPID !== world.mapName || !LIST) build();
    const t = performance.now(), dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
    const vx0 = cam.x - 150, vx1 = cam.x + W + 150, vy0 = cam.y - 150, vy1 = cam.y + H + 250;
    const ind = indoor(), nt = night(), out = !ind && !nt;
    let nPart = PARTS.length;
    ctx.save();
    for (const e of LIST) {
      const o = e.o; if (o.x + o.w < vx0 || o.x > vx1 || o.y + o.h < vy0 || o.y > vy1) continue;
      const cx = o.x + o.w / 2, seed = o.x * .013 + o.y * .007;
      // 灯：呼吸暖光
      if (e.lamp) { const y = o.y + o.h * .3, R = Math.max(70, Math.min(160, o.w * .9)) * (nt || ind ? 1.25 : 1), f = .82 + Math.sin(now * 6 + seed) * .07 + Math.sin(now * 13.3 + seed * 2) * .05;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (nt ? .95 : ind ? .7 : .45) * f; ctx.drawImage(glow('255,180,90'), cx - R, y - R, R * 2, R * 2); }
      // 火盆 / 篝火 / 炼器炉：火光 + 火星
      if (e.fire || e.fire2) { const y = o.y + o.h * (e.fire2 ? .62 : .5), R = Math.max(90, Math.min(220, o.w * 1.1)), f = .78 + Math.sin(now * 9 + seed) * .1 + Math.sin(now * 17 + seed) * .06;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (nt ? 1 : .6) * f; ctx.drawImage(glow('255,130,50'), cx - R, y - R, R * 2, R * 2);
        if (nPart < 260 && Math.random() < dt * (e.fire ? 7 : 3)) { PARTS.push({ k: 'ember', x: cx + rnd(-o.w * .18, o.w * .18), y, vx: rnd(-12, 12), vy: rnd(-70, -40), t: 0, life: rnd(1, 2.2), ph: rnd(0, 7) }); nPart++; } }
      // 白汽
      if (e.steam && nPart < 260 && Math.random() < dt * (e.fire2 || /incense/.test(e.id) ? 2.2 : .9)) { PARTS.push({ k: /incense/.test(e.id) ? 'incense' : 'steam', x: cx + rnd(-o.w * .08, o.w * .08), y: o.y + o.h * (/incense/.test(e.id) ? .12 : .32), t: 0, life: rnd(2.2, 3.6), ph: rnd(0, 7) }); nPart++; }
      // 水面闪光
      if (e.water && !window.LOWFX) { const pond = /pond|spring/.test(e.id), ex = cx, ey = o.y + o.h * (pond ? .55 : .2), rx = o.w * (pond ? .36 : .22), ry = o.h * (pond ? .22 : .05);
        ctx.globalCompositeOperation = 'lighter'; const n = pond ? 9 : 2;
        for (let i = 0; i < n; i++) { const ph = now * (.5 + hash(i, seed) * .6) + i * 1.7 + seed, a = Math.sin(ph) * .5 + .5; if (a < .6) continue; const ang = hash(seed, i) * TAU, rr = Math.sqrt(hash(i + 3, seed));
          star(ex + Math.cos(ang) * rx * rr, ey + Math.sin(ang) * ry * rr, (pond ? 7 : 5) * (a - .4), (a - .6) * 2, '235,250,255'); } }
      // 瀑布：底部水雾
      if (e.fall && nPart < 260 && Math.random() < dt * 6) { PARTS.push({ k: 'mist', x: cx + rnd(-o.w * .2, o.w * .2), y: o.y + o.h * .88, vx: rnd(-14, 14), t: 0, life: rnd(1.6, 2.8) }); nPart++; }
      // 灵晶 / 宝物：灵光呼吸 + 星芒
      if (e.crystal) { const col = e.crystal, y = o.y + o.h * .45, R = Math.max(60, Math.min(170, o.w * .75)), p = .55 + Math.sin(now * 2 + seed) * .25;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = p * (ind || nt ? .8 : .5); ctx.drawImage(glow(col), cx - R, y - R, R * 2, R * 2);
        if (!window.LOWFX) for (let i = 0; i < 3; i++) { const cyc = now * .7 + i / 3 + hash(i, seed), k = cyc % 1, id = Math.floor(cyc); const a = Math.sin(k * Math.PI); if (a < .05) continue;
          star(o.x + o.w * (.2 + .6 * hash(id, i + seed)), o.y + o.h * (.1 + .6 * hash(i + seed, id)), 9 * a + 3, a * .9, col); } }
      // 树下零星飘花瓣
      if (e.petal && !ind && nPart < 260 && Math.random() < dt * .9) { PARTS.push({ k: 'petal', c: e.petal, x: o.x + rnd(o.w * .15, o.w * .85), y: o.y + rnd(o.h * .2, o.h * .55), floor: o.sy + rnd(-10, 40), vx: rnd(8, 22), t: 0, life: 9, ph: rnd(0, 7), s: rnd(.7, 1.2) }); nPart++; }
      // 花丛：蝴蝶（白天室外）
      if (e.flowers && out && !window.LOWFX && !e.bug && hash(seed, 9) < .45) { e.bug = 1; BUGS.push({ hx: cx, hy: o.y + o.h * .3, x: cx, y: o.y, ph: rnd(0, 7), col: ['255,236,160', '255,255,255', '190,220,255', '255,190,210'][Math.floor(hash(seed, 2) * 4)], s: rnd(.8, 1.1) }); }
    }
    // 粒子
    ctx.globalCompositeOperation = 'source-over';
    for (let i = PARTS.length - 1; i >= 0; i--) { const p = PARTS[i]; p.t += dt; if (p.t > p.life) { PARTS.splice(i, 1); continue; } const k = p.t / p.life;
      if (p.k === 'ember') { p.x += (p.vx + Math.sin(p.t * 6 + p.ph) * 18) * dt; p.y += p.vy * dt; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - k) * .95; ctx.fillStyle = k < .4 ? '#ffe7a0' : '#ff9a40'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * (1 - k * .6), 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      else if (p.k === 'steam' || p.k === 'incense') { const thin = p.k === 'incense', x = p.x + Math.sin(p.t * (thin ? 2.2 : 1.4) + p.ph) * (thin ? 5 + k * 10 : 6 + k * 14), y = p.y - p.t * (thin ? 22 : 18), r = (thin ? 4 : 8) + k * (thin ? 12 : 22);
        ctx.globalAlpha = (thin ? .28 : .32) * Math.min(1, k * 4) * (1 - k); ctx.drawImage(PUFF, x - r, y - r, r * 2, r * 2); }
      else if (p.k === 'mist') { const r = 16 + k * 40; ctx.globalAlpha = .3 * Math.sin(k * Math.PI); ctx.drawImage(PUFF, p.x + p.vx * p.t - r, p.y - p.t * 12 - r, r * 2, r * 2); }
      else if (p.k === 'petal') { if (p.y < p.floor) { p.x += (p.vx + Math.sin(p.t * 1.8 + p.ph) * 26) * dt; p.y += 34 * dt; } else p.life = Math.min(p.life, p.t + 1.2);
        const a = Math.min(1, (p.life - p.t) / 1.2); ctx.globalAlpha = .9 * a; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.t * 2 + p.ph); ctx.scale(1, Math.abs(Math.sin(p.t * 3 + p.ph)) * .7 + .3);
        ctx.fillStyle = p.c === 'maple' ? '#d9692f' : p.c === 'gold' ? '#f2c14e' : '#ffc0d0'; ctx.beginPath(); ctx.ellipse(0, 0, (p.c === 'gold' ? 3 : 5.5) * p.s, (p.c === 'gold' ? 3 : 3) * p.s, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    }
    // 蝴蝶：绕着花丛画 8 字
    if (!window.LOWFX) for (const b of BUGS) { if (b.hx < vx0 || b.hx > vx1 || b.hy < vy0 || b.hy > vy1) continue;
      const u = now * .55 * b.s + b.ph, x = b.hx + Math.sin(u) * 70, y = b.hy - 26 + Math.sin(u * 2) * 26 + Math.sin(now * 3 + b.ph) * 6, fl = Math.abs(Math.sin(now * 16 + b.ph));
      ctx.globalAlpha = .9; ctx.save(); ctx.translate(x, y); ctx.scale(Math.cos(u) > 0 ? 1.6 : -1.6, 1.6);
      ctx.fillStyle = `rgba(${b.col},1)`; ctx.strokeStyle = 'rgba(60,40,30,.55)'; ctx.lineWidth = .8;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 4 * fl, -3, 5 * fl + 1, 6, s * .5, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(s * 3 * fl, 3, 3.5 * fl + .8, 4, -s * .4, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#3a2a20'; ctx.fillRect(-.8, -5, 1.6, 10); ctx.restore(); }
    // 室内：浮尘
    if (ind && !window.LOWFX) { while (MOTES.length < 34) MOTES.push({ x: rnd(0, W), y: rnd(0, H), ph: rnd(0, 7), s: rnd(.6, 1.6), v: rnd(4, 10) });
      ctx.globalCompositeOperation = 'lighter';
      for (const m of MOTES) { m.y -= m.v * dt * .4; m.x += Math.sin(now * .4 + m.ph) * .15; if (m.y < -10) { m.y = H + 10; m.x = rnd(0, W); }
        ctx.globalAlpha = .25 + Math.sin(now * 1.3 + m.ph) * .2; ctx.fillStyle = '#ffe8b8'; ctx.beginPath(); ctx.arc(cam.x + m.x, cam.y + m.y, m.s, 0, TAU); ctx.fill(); } }
    ctx.restore();
  })(typeof tileAmbientHigh === 'function' ? tileAmbientHigh : null);
  window.MAP_DETAIL2 = { list: () => LIST, parts: () => PARTS, R };
})();
