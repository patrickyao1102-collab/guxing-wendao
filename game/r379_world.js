// ================= R379 · 地图上「值得走过去的东西」（作者 11-27 凌晨）（只进测试版）=================
// 作者：「游戏里很多地方的那种图标，或者说我之前做的那些素材，我感觉就是不够游戏化……让人玩起来没有什么探索欲。」
// Claude 把地图截了一遍：地图画得好，但地图上能碰、能捡、能打的东西太素——野怪是一小团通用的火、宝箱只有一种、地上没有任何闪光的东西。
// 照仙剑的路子（一眼看得出「那里有东西」，再一眼看得出「值不值钱」）改四样：
//   ① 野怪显形：兽火 / 鬼火里站着妖兽本体（领头的那只），脚下身后烧着原来那档颜色的火——颜色照旧表示强弱（绿 / 蓝 / 紫精英 / 红危险 / 金稀有），头顶写名字和等级。
//   ② 灵光点：野外地上散着几处会闪的东西（灵草 / 灵矿 / 遗落之物），走过去就捡起来；每张图捡了几处写在进图横幅上。
//   ③ 宝箱三档：木箱 / 铜箱 / 金箱，按里面东西的贵贱分（Codex R379 的图到了才换）。
//   ④ 头顶的任务标记换成画的令符（图到了才换）。
// 美术件：Codex R379（r379/*.webp）。没到的先用代码画的顶着。测试面板里有开关可以切回原来的火。
(function () {
  if (typeof TMAPS === 'undefined' || typeof tileAmbientHigh !== 'function' || typeof MOB_DB === 'undefined') return;
  const F = () => (S.flags = S.flags || {});
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  let SHOW = LS('r379_show') !== 'off';
  let NAMES = LS('r379_names') !== 'off';
  const ART = {}; const art = n => { let o = ART[n]; if (!o) { o = ART[n] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r379/' + n + '.webp?v=1'; } return o.ok ? o.im : null; };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const TIER = () => window.FIRE_TIER || {};
  const ELITE = { lin_forest: 'wolfking', hf_valley: 'wolfking', yy_forest: 'spiderq' };
  const has = k => { try { return typeof IMG !== 'undefined' && !!IMG[k]; } catch (e) { return false; } };

  // ---------- ① 野怪显形 ----------
  // 染过色的火（Codex 的白火，一档颜色染一份）
  const TINT = {};
  function fireFrame(kind, tier, i) { const src = art('fire_' + kind + '_' + (i + 1)); if (!src) return null; const k = kind + tier + i; let c = TINT[k];
    if (!c) { const T = TIER()[tier]; if (!T) return null; c = TINT[k] = document.createElement('canvas'); c.width = 160; c.height = 160; const g = c.getContext('2d'); g.drawImage(src, 0, 0, 160, 160); g.globalCompositeOperation = 'source-atop'; g.fillStyle = rgba(T.c, .78); g.fillRect(0, 0, 160, 160); }
    return c; }
  function keyOf(a) { const f = a.fire; let k = (MOB_DB[a.mob] || {}).key; if (f && f.tier === 'purple') { const e = ELITE[world.mapName], me = e && MOB_DB[e]; if (me && has(me.key)) k = me.key; } return k; }
  function heightOf(a, k) { const md = Object.values(MOB_DB).find(m => m.key === k) || MOB_DB[a.mob] || {}; let h = Math.max(78, Math.min(136, (md.mh || 90) * 1.08)); if (a.fire.tier === 'purple') h *= 1.18; if (a.fire.tier === 'gold') h *= .92; return h; }
  function drawMob(a, now) { const f = a.fire, T = TIER()[f.tier]; if (!T) return; const c = T.c, t = now + f.ph, k = keyOf(a), H = heightOf(a, k), ghost = f.kind === 'ghost', x = a.x, y = a.y;
    ctx.save();
    // 地上的光斑
    let g = ctx.createRadialGradient(x, y, 2, x, y, H * .62); g.addColorStop(0, rgba(c, .5)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, H * .62, H * .2, 0, 0, 7); ctx.fill();
    // 身后的火
    ctx.globalCompositeOperation = 'lighter';
    const fr = CLEAN ? null : fireFrame(ghost ? 'ghost' : 'beast', f.tier, Math.floor(t * 9) % 6), fs = H * 1.55;
    if (CLEAN) { ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(c, .7 + Math.sin(t * 4) * .2); ctx.beginPath(); ctx.ellipse(x, y, H * .42, H * .13, 0, 0, 7); ctx.stroke(); }
    else if (fr) { ctx.globalAlpha = .9; ctx.drawImage(fr, x - fs / 2, y - fs * .84, fs, fs); ctx.globalAlpha = 1; }
    else { const pulse = 1 + Math.sin(t * 6) * .06; g = ctx.createRadialGradient(x, y - H * .42, 3, x, y - H * .42, H * .72 * pulse); g.addColorStop(0, rgba(c, .6)); g.addColorStop(.55, rgba(c, .22)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - H * .42, H * .72 * pulse, 0, 7); ctx.fill();
      for (let i = 0; i < 6; i++) { const ox = (i - 2.5) * H * .17, ph = t * (ghost ? 3 : 7) + i * 1.9, hh = H * (.55 + (i % 2) * .22) * (1 + Math.sin(ph * 1.6) * .14), sw = Math.sin(ph) * 7, w = H * .11;
        g = ctx.createLinearGradient(x, y, x, y - hh); g.addColorStop(0, rgba(c, 0)); g.addColorStop(.25, rgba(c, .6)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x + ox - w, y - 2); ctx.bezierCurveTo(x + ox - w, y - hh * .5, x + ox + sw * .5, y - hh * .75, x + ox + sw, y - hh); ctx.bezierCurveTo(x + ox + sw * .5 + w * .4, y - hh * .7, x + ox + w, y - hh * .5, x + ox + w, y - 2); ctx.closePath(); ctx.fill(); } }
    ctx.globalCompositeOperation = 'source-over';
    // 本体
    const bob = a.moving ? Math.abs(Math.sin(t * 9)) * 3 : Math.sin(t * 2.2) * 1.5;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, H * .3, H * .075, 0, 0, 7); ctx.fill();
    drawSprite(k, x, y - bob, H, a.dir < 0, ghost ? .94 : 1, '#a55', '');
    // 身前几点火星；金灵多一圈碎光
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < (CLEAN ? (f.tier === 'gold' || f.tier === 'purple' || f.tier === 'red' ? 5 : 0) : f.tier === 'gold' ? 10 : 5); i++) { const kk = ((t * .6 + i / 5) % 1), sx = x + Math.sin(i * 7.3 + t * 1.4) * H * .34, sy = y - 6 - kk * H * .95; ctx.fillStyle = rgba(c, (1 - kk) * .9); ctx.beginPath(); ctx.arc(sx, sy, 2.4 * (1 - kk) + .6, 0, 7); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    // 发现主角：头顶冒一下叹号（之后就扑过来了）
    try { const p = world.player, R = { green: 0, blue: 230, purple: 260, red: 320, gold: 0 }[f.tier] || 0, near = !!p && R > 0 && Math.hypot(p.x - x, p.y - y) < R; if (near && !a._seen) a._alertT = now; a._seen = near;
      if (a._alertT != null && now - a._alertT < .9) { const dt = now - a._alertT, pop = Math.min(1, dt / .12), yy = y - H - 44 - Math.sin(Math.min(1, dt / .25) * Math.PI) * 8; ctx.save(); ctx.globalAlpha = Math.min(1, (.9 - dt) / .25); ctx.translate(x, yy); ctx.scale(pop, pop); ctx.font = `900 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline('！', 0, 0, '#ff5a3a', '#fff4e0', 5); ctx.restore(); } } catch (e) {}
    // 头顶：名字 + 等级（颜色 = 强弱）
    const md = Object.values(MOB_DB).find(m => m.key === k) || MOB_DB[a.mob] || {}, nm = (T.tag ? T.tag + '·' : '') + (md.name || '') + ' Lv' + f.lv;
    { const p = world.player, dd = p ? Math.hypot(p.x - x, p.y - y) : 0, na = NAMES ? Math.max(0, Math.min(1, (460 - dd) / 110)) : 1; if (na <= 0) { ctx.restore(); return; } ctx.globalAlpha = na; }   // 名字等级走近才显（远处只看火的颜色）
    ctx.font = `700 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(nm, x, y - H - 14, rgba([Math.min(255, c[0] + 70), Math.min(255, c[1] + 70), Math.min(255, c[2] + 70)], 1), 'rgba(0,0,0,.85)', 4);
    ctx.restore(); }

  // ---------- ② 灵光点 ----------
  const TOWN = ['xt_city', 'qy_town', 'tj_market', 'tj_front', 'tj_shanmen'];   // 城里、宗门：墙根路边偶尔有人掉的东西在闪（只闪光，不画东西）
  const KINDS = { coin: { c: [255, 226, 150], name: '遗落的东西' }, herb: { c: [120, 240, 190], name: '灵草' }, ore: { c: [150, 200, 255], name: '灵矿' }, relic: { c: [255, 214, 110], name: '遗落之物' } };
  const RELIC = { xt_road: [['x_anxi', 2]], lin_forest: [['p_big', 2]], hf_valley: [['m_yanjing', 1], ['gold', 120]], m_yy_tiger: [['m_silk', 2], ['p_mp', 1]], m_yy_verge: [['m_thorn', 2], ['p_mp', 2]], tj_xiashan: [['p_big', 1], ['gold', 80]], m_xx_b1: [['m_shike', 2], ['p_big', 1]] };
  const PK = {};   // 地图 → [{x,y,kind,i}]
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = seed || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function gen(name) { if (PK[name]) return PK[name]; const M = TMAPS[name], B = M && M.baked; const out = PK[name] = [];
    const town = TOWN.includes(name);
    if (!M || (!M.mobs && !town) || !B || typeof B.blocked !== 'string' || !B.cols) return out;
    try { const cs = B.cs, cols = B.cols, rows = B.rows, free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && B.blocked[r * cols + c] === '0';
      // 从入口灌水：只在走得到的地方放
      const seen = new Uint8Array(cols * rows), q = [], ents = [];
      if (M.start) ents.push([(M.start[0] + .5) * 64, (M.start[1] + .8) * 64]); for (const e of M.exits || []) ents.push([(e.x + (e.w || 1) / 2) * cs, (e.y + (e.h || 1) / 2) * cs]);
      for (const [ex, ey] of ents) { const c0 = Math.floor(ex / cs), r0 = Math.floor(ey / cs); for (let d = 0; d < 12 && !q.length; d++) for (let dy = -d; dy <= d && !q.length; dy++) for (let dx = -d; dx <= d; dx++) if (free(c0 + dx, r0 + dy)) { q.push(c0 + dx, r0 + dy); seen[(r0 + dy) * cols + c0 + dx] = 1; break; } if (q.length) break; }
      for (let i = 0; i < q.length; i += 2) { const c = q[i], r = q[i + 1]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dx, nr = r + dy; if (free(nc, nr) && !seen[nr * cols + nc]) { seen[nr * cols + nc] = 1; q.push(nc, nr); } } }
      const R = rng(hash('r379' + name)), n = town ? Math.max(2, Math.min(5, Math.round(B.w * B.h / 3600000))) : Math.max(3, Math.min(7, Math.round(B.w * B.h / 2200000))), avoid = ents.map(e => [e[0], e[1], 300]);
      for (const np of M.npcs || []) if (np.c != null) avoid.push([(np.c + .5) * 64, (np.r + .8) * 64, 150]); for (const d of M.doors || []) if (d.x != null) avoid.push([d.x, d.y, 170]);
      for (const ch of M.chests || []) avoid.push([(ch.c + .5) * 64, (ch.r + .8) * 64, 220]);
      const yw = (window.R370_YW || []).find(y => y.map === name); if (yw) avoid.push([yw.pos[0], yw.pos[1], 340]);
      const room = (c, r) => { const k = Math.ceil(26 / cs); for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) if (!free(c + dx, r + dy) || !seen[(r + dy) * cols + c + dx]) return false; return true; };
      for (let tries = 0; tries < 4000 && out.length < n; tries++) { const c = Math.floor(R() * cols), r = Math.floor(R() * rows); if (!room(c, r)) continue; const x = (c + .5) * cs, y = (r + .5) * cs;
        if (x < 80 || y < 160 || x > B.w - 80 || y > B.h - 60) continue; if (avoid.some(([ax, ay, d]) => Math.hypot(ax - x, ay - y) < d)) continue; if (out.some(p => Math.hypot(p.x - x, p.y - y) < 430)) continue;
        out.push({ x, y, i: out.length, kind: town ? 'coin' : R() < .56 ? 'herb' : 'ore' }); }
      // 离入口最远的那一处是「遗落之物」
      if (!town && out.length >= 3 && ents.length) { let best = null, bd = -1; for (const p of out) { const d = Math.min(...ents.map(e => Math.hypot(e[0] - p.x, e[1] - p.y))); if (d > bd) { bd = d; best = p; } } if (best) best.kind = 'relic'; }
    } catch (e) { console.warn('R379 gen', e); }
    return out; }
  const taken = (name, p) => !!F()['pk_' + name + '_' + p.i];
  window.R379_COUNT = name => { const a = gen(name); return [a.filter(p => taken(name, p)).length, a.length]; };
  function rewardOf(name, p) { const lv = (S.hero && S.hero.lv) || 1, R = rng(hash(name + p.i + 'rw'));
    if (p.kind === 'relic') return RELIC[name] || [['p_big', 1]];
    if (p.kind === 'coin') { const r0 = R(); return r0 < .6 ? [['gold', 12 + Math.floor(R() * 24)]] : r0 < .85 ? [['p_small', 1]] : [['x_xingshen', 1]]; }
    if (p.kind === 'ore') return [['gold', 30 + lv * 5 + Math.floor(R() * 30)]];
    const mats = []; try { for (const t of TMAPS[name].mobs.types) for (const [id] of (typeof DROPS !== 'undefined' && DROPS[(MOB_DB[t] || {}).key]) || []) if (ITEM_DB[id] && ITEM_DB[id].mat && !mats.includes(id)) mats.push(id); } catch (e) {}
    const r = R(); return r < .4 ? [['p_small', 1]] : r < .62 ? [['p_mp', 1]] : mats.length && r < .86 ? [[mats[Math.floor(R() * mats.length)], 1]] : [['x_xingshen', 1]]; }
  const POP = [];
  function pick(name, p) { F()['pk_' + name + '_' + p.i] = 1; const got = [];
    for (const [id, n] of rewardOf(name, p)) { if (id === 'gold') { S.hero.gold += n; got.push('灵石 ' + n); } else if (ITEM_DB[id]) { addItem(id, n); got.push(ITEM_DB[id].name + (n > 1 ? ' ×' + n : '')); } }
    try { playSnd(p.kind === 'relic' ? 'jingle_win' : 'ui_confirm', p.kind === 'relic' ? .5 : .8); } catch (e) {}
    POP.push({ x: p.x, y: p.y, t0: performance.now() / 1000, text: got.join('、'), c: KINDS[p.kind].c, big: p.kind === 'relic' });
    if (p.kind === 'relic') { const [a, b] = R379_COUNT(name); setTimeout(() => toast('拾得遗落之物：' + got.join('、').slice(0, 9), 2200), 200); } }
  function drawPick(p, now) { const K = KINDS[p.kind], c = K.c, im = p.kind === 'coin' ? null : art('pick_' + p.kind), t = now + p.i * 1.7, x = p.x, y = p.y; ctx.save();
    let g = ctx.createRadialGradient(x, y - 6, 2, x, y - 6, 44); g.addColorStop(0, rgba(c, .4 + Math.sin(t * 3) * .12)); g.addColorStop(1, rgba(c, 0)); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y - 4, 44, 26, 0, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    if (im) { const w = p.kind === 'relic' ? 62 : 54, h = w * im.height / im.width; ctx.drawImage(im, x - w / 2, y - h + 8, w, h); }
    else if (p.kind === 'coin') { /* 只闪光 */ }
    else { ctx.fillStyle = rgba(c, .95); ctx.strokeStyle = 'rgba(20,30,30,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x + 9, y - 12); ctx.lineTo(x, y + 2); ctx.lineTo(x - 9, y - 12); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    // 闪光：隔一会儿「叮」一下
    const ph = (t * .7) % 1, sp = art('sparkle_' + (1 + Math.min(3, Math.floor(ph * 8)))); ctx.globalCompositeOperation = 'lighter';
    if (ph < .5) { const sx = x + Math.sin(p.i * 3.1 + Math.floor(t * .7) * 2.3) * 12, sy = y - 26 + Math.cos(p.i * 1.3 + Math.floor(t * .7)) * 8, s = 34;
      if (sp) ctx.drawImage(sp, sx - s / 2, sy - s / 2, s, s); else { const k = Math.sin(ph * 2 * Math.PI), r = 13 * k; ctx.strokeStyle = `rgba(255,255,240,${k})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx - r, sy); ctx.lineTo(sx + r, sy); ctx.moveTo(sx, sy - r); ctx.lineTo(sx, sy + r); ctx.stroke(); } }
    ctx.restore(); }
  function drawPops(now) { for (let i = POP.length - 1; i >= 0; i--) { const o = POP[i], dt = now - o.t0; if (dt > 1.5) { POP.splice(i, 1); continue; } const a = Math.min(1, (1.5 - dt) / .4);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 10; k++) { const an = k * .628 + o.t0, r = dt * 90; ctx.fillStyle = rgba(o.c, a * .8); ctx.beginPath(); ctx.arc(o.x + Math.cos(an) * r, o.y - 14 + Math.sin(an) * r * .6 - dt * 30, 3 * a + .5, 0, 7); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; ctx.font = `700 ${o.big ? 19 : 16}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline('拾得 ' + o.text, o.x, o.y - 44 - dt * 34, '#fff6d8', 'rgba(20,10,0,.9)', 4); ctx.restore(); } }

  // ---------- ③ 宝箱三档 ----------
  const tierOfChest = ch => { try { let v = 0; for (const [id, n] of ch.items || []) { if (id === 'gold') v += n; else { const it = ITEM_DB[id] || {}; v += (it.slot || it.fabao ? 600 : it.book || /^juan/.test(id) ? 400 : (it.price || it.sell * 4 || 60)) * n; } } return v >= 600 ? 'gold' : v >= 240 ? 'bronze' : 'wood'; } catch (e) { return 'wood'; } };
  if (typeof drawObj === 'function' && typeof OBJDEF !== 'undefined') drawObj = (orig => function (o) {
    try { if (SHOW && o && o.d && (o.d === OBJDEF.chest || o.d === OBJDEF.chest_open)) { const open = o.d === OBJDEF.chest_open, ch = (world.chests || []).find(c => c.c === o.c && c.r === o.r), tier = ch ? (ch._tier || (ch._tier = tierOfChest(ch))) : 'wood', im = art('chest_' + tier + (open ? '_open' : ''));
        if (im) { const x = (o.c + .5) * TS, y = (o.r + 1) * TS, w = { wood: 92, bronze: 102, gold: 112 }[tier], h = w * im.height / im.width, now = performance.now() / 1000, c = { wood: [255, 214, 140], bronze: [120, 235, 220], gold: [255, 220, 110] }[tier];
          ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.beginPath(); ctx.ellipse(x, y - 6, w * .44, 12, 0, 0, 7); ctx.fill();
          if (!open) { ctx.globalCompositeOperation = 'lighter'; const k = tier === 'gold' ? 1 : tier === 'bronze' ? .7 : .45, g = ctx.createRadialGradient(x, y - h * .4, 2, x, y - h * .4, w * .95); g.addColorStop(0, rgba(c, (.34 + Math.sin(now * 3) * .12) * k)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - h * .4, w * .95, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
          ctx.drawImage(im, x - w / 2, y - h + 4, w, h);
          if (!open) { const ph = (now * .8 + o.c) % 1, sp = art('sparkle_' + (1 + Math.min(3, Math.floor(ph * 8)))); if (ph < .5 && sp) { ctx.globalCompositeOperation = 'lighter'; const s = tier === 'gold' ? 40 : 30; ctx.drawImage(sp, x + Math.sin(Math.floor(now * .8) * 2.1 + o.r) * w * .3 - s / 2, y - h * .62 - s / 2, s, s); } }
          ctx.restore(); return; } } } catch (e) {}
    return orig.apply(this, arguments); })(drawObj);

  // ---------- ④ 头顶的任务标记：字体的「!」「?」换成画的令符 ----------
  // 蓝色的「去找这个人」（支线进行中要找的人，R317）：同一块令符，换成青蓝色，和金色的「可接」分得开
  const BLUE = {}; function blueOf(n) { if (BLUE[n]) return BLUE[n]; const im = art(n); if (!im) return null; try { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height), a = d.data; for (let i = 0; i < a.length; i += 4) { const r = a[i]; a[i] = Math.round(a[i + 2] * .9); a[i + 1] = Math.min(255, Math.round(a[i + 1] * 1.05)); a[i + 2] = Math.min(255, Math.round(r * 1.08)); } g.putImageData(d, 0, 0); return BLUE[n] = c; } catch (e) { return BLUE[n] = im; } }
  function mark(n, x, y, w, blue) { const im = blue ? blueOf(n) : art(n); if (!im) return false; const h = w * im.height / im.width; ctx.save(); ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.drawImage(im, x - w / 2, y - h / 2 - 4, w, h); ctx.restore(); return true; }
  if (typeof textOutline === 'function') textOutline = (orig => function (t, x, y, col) { try { if (SHOW && (t === '!' || t === '?')) { const f = ctx.font; if (/900 68px/.test(f)) { const grey = /b8b0a0/i.test(col || ''), blue = /5fb8ff/i.test(col || ''); if (mark(t === '!' ? 'mark_quest' : grey ? 'mark_wait' : 'mark_done', x, y, 54, blue)) return; } else if (/900 56px/.test(f) && t === '!') { if (mark('mark_story', x, y, 50)) return; } } } catch (e) {} return orig.apply(this, arguments); })(textOutline);
  try { const ft = ctx.fillText, st = ctx.strokeText; const big = () => /900 52px/.test(ctx.font);
    ctx.fillText = function (t, x, y) { if (t === '!' && SHOW && big() && mark('mark_story', x, y - 14, 46)) return; return ft.apply(this, arguments); };
    ctx.strokeText = function (t, x, y) { if (t === '!' && SHOW && big() && art('mark_story')) return; return st.apply(this, arguments); }; } catch (e) {}
  // ---------- ⑤ NPC 的名字：走近了才显出来（原来一屏十几个名字常年挂着，像地图标注）；头顶的任务 / 主线令符照旧远远就看得见 ----------
  // 小地图底下那行「按 M 键或点击即可放大」：只在进图头几秒提示，之后收掉（常驻的操作说明像网页）
  let hintMap = '', hintT = 0;
  if (typeof textOutline === 'function') textOutline = (orig => function (t) { try { if (SHOW && typeof t === 'string' && /即可放大$|^点击小地图放大$/.test(t)) { const now = performance.now(); if (hintMap !== world.mapName) { hintMap = world.mapName; hintT = now; } const dt = (now - hintT) / 1000; if (dt > 7) return; if (dt > 6) { ctx.save(); ctx.globalAlpha *= 7 - dt; try { return orig.apply(this, arguments); } finally { ctx.restore(); } } } } catch (e) {} return orig.apply(this, arguments); })(textOutline);
  if (typeof textOutline === 'function') textOutline = (orig => function (t, x, y, col, oc) { try { if (SHOW && NAMES && oc === '#1a0c00' && (col === '#fff4d8' || col === '#ffe08a') && /600 (18|19|20)(\.\d+)?px/.test(ctx.font) && world.player && S.scene === drawMap && !(typeof battle !== 'undefined' && battle)) {
        if (typeof dialog !== 'undefined' && dialog) return;   /* 说话的时候场景里的名字都收起来（对话框上已经写了是谁） */
        if (CLEAN) { const me = world.player; let best = null, bd = 1e9; for (const ac of world.actors || []) { if (!ac.npc || ac.hidden || ac.npc.noLabel) continue; const dd = Math.hypot(ac.x - me.x, ac.y - me.y); if (dd < bd) { bd = dd; best = ac; } }
          if (!best || bd > 230 || best.npc.name !== t || Math.abs(best.x - x) > 4) return; arguments[0] = t + ' · ' + (best.npc.shop ? '买卖' : '交谈'); return orig.apply(this, arguments); }
        const p = world.player, d = Math.hypot(p.x - x, (p.y - 60) - (y + 70)), a = Math.max(0, Math.min(1, (330 - d) / 90)); if (a <= 0) return; if (a < 1) { ctx.save(); ctx.globalAlpha *= a; try { return orig.apply(this, arguments); } finally { ctx.restore(); } } } } catch (e) {}
    return orig.apply(this, arguments); })(textOutline);

  setTimeout(() => { for (const n of ['chest_wood', 'chest_wood_open', 'chest_bronze', 'chest_bronze_open', 'chest_gold', 'chest_gold_open', 'mark_quest', 'mark_done', 'mark_story', 'mark_wait']) art(n); }, 5000);

  // ---------- 接进地图 ----------
  tileAmbientHigh = (orig => function (T, cam, now) {
    const hid = []; let mine = [];
    try { if (SHOW) { mine = (world.mobs || []).filter(a => a.fire && !a.hidden && has(keyOf(a))); for (const a of mine) { a.hidden = true; hid.push(a); } } } catch (e) {}
    let r; try { r = orig && orig.apply(this, arguments); } finally { for (const a of hid) a.hidden = false; }
    try { const name = world.mapName, t = performance.now() / 1000; if (!(typeof battle !== 'undefined' && battle)) { for (const p of gen(name)) if (!taken(name, p)) drawPick(p, t); drawPops(t); }
      mine.sort((p, q) => p.y - q.y); for (const a of mine) drawMob(a, now); } catch (e) {}
    return r; })(tileAmbientHigh);
  if (typeof tileMobs === 'function') tileMobs = (orig => function (dt, T, free) { const r = orig.apply(this, arguments);
    try { if (free && !world.locked && !(typeof battle !== 'undefined' && battle)) { const p = world.player, name = world.mapName; for (const q of gen(name)) if (!taken(name, q) && Math.hypot(p.x - q.x, p.y - q.y) < 46) { pick(name, q); break; } } } catch (e) {}
    return r; })(tileMobs);
  setTimeout(() => { for (const n of ['pick_herb', 'pick_ore', 'pick_relic', 'sparkle_1', 'sparkle_2', 'sparkle_3', 'sparkle_4', 'fire_beast_1', 'fire_beast_2', 'fire_beast_3', 'fire_beast_4', 'fire_beast_5', 'fire_beast_6', 'fire_ghost_1', 'fire_ghost_2', 'fire_ghost_3', 'fire_ghost_4', 'fire_ghost_5', 'fire_ghost_6']) art(n); }, 9000);
  // ---------- ⑥ 对话快进：对话框右上角「快进 ▶▶」，点一下自动往下翻，遇到要选的地方 / 开打 / 再点一下就停 ----------
  let FF = false, ffT = 0, ffIdle = 0; const FFR = { x: 1086, y: 482, w: 150, h: 40 };
  const ffShow = () => typeof dialog !== 'undefined' && dialog && !(typeof choice !== 'undefined' && choice) && !(typeof sysPanel !== 'undefined' && sysPanel);
  try { cv.addEventListener('pointerdown', e => { if (!ffShow() && !FF) return; const p = toLogical(e), hit = p.x >= FFR.x && p.x <= FFR.x + FFR.w && p.y >= FFR.y && p.y <= FFR.y + FFR.h;
      if (FF) { FF = false; e.stopImmediatePropagation(); e.preventDefault(); try { input.tapped = null; } catch (er) {} return; }
      if (hit) { FF = true; ffT = 0; ffIdle = performance.now(); e.stopImmediatePropagation(); e.preventDefault(); try { input.tapped = null; playSnd('ui_click', .6); } catch (er) {} } }, true); } catch (e) {}
  try { S.overlay.push({ draw() { try { const now = performance.now();
      if (FF) { if ((typeof choice !== 'undefined' && choice) || (typeof sysPanel !== 'undefined' && sysPanel) || (typeof battle !== 'undefined' && battle && battle.state === 'menu')) FF = false;
        else if (typeof dialog !== 'undefined' && dialog) { ffIdle = now; if (now - ffT > 170) { ffT = now; const d = dialog, total = [...String(d.text || '')].length; if (d.shown < total) d.shown = total; else { dialog = null; try { d.res(); } catch (er) {} } } }
        else if (now - ffIdle > 2500) FF = false; }
      if (!ffShow() && !FF) return; if (window.R381_FF && typeof dialog !== 'undefined' && dialog) return;   /* R381 对话框自己画快进签 */ ctx.save(); ctx.font = `700 17px ${FONT}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.globalAlpha = FF ? .75 + Math.sin(now / 160) * .25 : .82;
      textOutline(FF ? '快进中 ▶▶（点一下停）' : '快进 ▶▶', FFR.x + FFR.w - 8, FFR.y + FFR.h / 2, FF ? '#ffe27a' : '#f2e6c8', 'rgba(20,10,0,.88)', 4); ctx.restore(); } catch (e) {} } }); } catch (e) {}

  // ---------- ⑦ 镜头近一档（默认关，测试面板里开）：地图和人物一起放大 20%，和手机上那套（R 手机放大 15%）同一个做法 ----------
  let NEAR = LS('r379_cam') === 'near';
  let KZ = 1;
  let CLEAN = LS('r380_clean') !== 'off';   // 清爽模式（Codex R380 效果图 B / C 的方向）：镜头近、队伍只留小头像、任务收成一行、只给身边那个人写名字、野怪不带火
  try { if (typeof VZ === 'function' && typeof CZ === 'function') { const MZ = window.MOBILE_ZOOM || 1;   /* 手机上本来就放大了 15%（R 手机放大）：这里只补到同一个目标倍数 */ VZ = (o => function () { return o.apply(this, arguments) * KZ; })(VZ); CZ = (o => function () { return o.apply(this, arguments) * KZ; })(CZ);
      // 镜头倍数慢慢过渡；剧情演出（定了镜头焦点的那种）自动退回原来的远景，免得把说话的人切到画面外
      let lastT = 0, lockT = 0; S.overlay.push({ draw() { try { const now = performance.now(), dt = Math.min(.1, (now - (lastT || now)) / 1000); lastT = now; let staged = !!(world && world.camFocus) || !!(typeof battle !== 'undefined' && battle);
          // 没定焦点、但锁着玩家在演的剧情（不是自己找人搭话、不是开着行囊）：锁满半秒也退回远景
          try { const talking = (world.actors || []).some(a => a.talking), scripted = world.locked && !talking && !S.menu && S.scene === drawMap; if (!scripted) lockT = 0; else if (!lockT) lockT = now; if (scripted && now - lockT > 500) staged = true; } catch (e) {}
          let want = CLEAN ? 1.15 : NEAR ? 1.2 : 1;   /* 作者 11-27 晨：我们是手游，比例对照手游，别照端游拉太近。1.15 就是手机上作者真机调过的那一档——手机上等于不变，电脑上跟手机同一个比例 */
          // 一屏就装得下的小屋子（铺子、客房）：只近一点点，别一进门就把柜台后面的掌柜切到画面外
          try { const T0 = world.map && world.map.T; if (want > 1.15 && T0 && T0.mh && S.scene === drawMap) { const vz0 = VZ() / KZ / MZ; if (T0.mh * vz0 <= H * 1.08) want = 1.15; } } catch (e) {}
          const tg = staged ? 1 : Math.max(1, want / MZ); if (Math.abs(tg - KZ) < .002) { KZ = tg; return; } KZ += (tg - KZ) * Math.min(1, dt * 3.5);
          // 倍数在变的这几帧，镜头自己对准主角（对话 / 上锁时引擎不一定在挪镜头，不管的话人会滑出画面）
          try { const T = world.map && world.map.T, pl = world.player; if (T && pl && world.cam && !world.camFocus && S.scene === drawMap) { const vz = VZ(), VWd = W / vz, VHd = H / vz;
              world.cam.x = T.mw <= VWd ? (T.mw - VWd) / 2 : Math.max(T.x0 || 0, Math.min(T.mw - VWd, pl.x - VWd / 2)); world.cam.y = T.mh <= VHd ? (T.mh - VHd) / 2 : Math.max(0, Math.min(T.mh - VHd, pl.y - VHd * .55)); } } catch (e) {} } catch (e) {} } }); } } catch (e) {}

  // ---------- ⑧ 清爽模式的界面 ----------
  // 队伍：顶上三条长卡收成小头像（外圈一道弧是气血）
  try { if (typeof drawHudCard === 'function' && typeof medallion === 'function') drawHudCard = (o => function (m, i, x) { if (!CLEAN) return o.apply(this, arguments);
      const r = 23, cx = x + r + 12, cy = 42, k = Math.max(0, Math.min(1, m.hp / (m.maxhp || 1))); ctx.save(); ctx.fillStyle = 'rgba(10,8,6,.45)'; ctx.beginPath(); ctx.arc(cx, cy + 2, r + 5, 0, 7); ctx.fill();
      medallion(m.p, cx, cy, r, { name: m.name, color: m.color }); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, 7); ctx.stroke();
      ctx.strokeStyle = k < .3 ? '#ff5a4a' : '#7fe08a'; ctx.beginPath(); ctx.arc(cx, cy, r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke(); ctx.restore(); return x + r * 2 + 12; })(drawHudCard); } catch (e) {}
  // 任务：右上那张卡收成一行「主线 · 现在该做什么」，点一下自动带路；旁边的小圆标点开任务册
  let QR = null, QI = null;
  // 清爽模式下第一次有任务：原来那套三步教学（R200）讲的是任务栏的「展开 / 收起 / 缩成小标记」，清爽模式里没有这些，而且它会锁住人、压暗全屏。
  // 这里换成任务那一行旁边的一句短提示：不锁人、不压暗，点一下或者过几秒自己收。
  let tipT = 0, freeT = 0;
  try { S.overlay.push({ draw() { try { if (!CLEAN || !S.started || !S.quest) return; const f = F(); if (!f.tut_quest) { f.tut_quest = 1; f.r380_qtip = 1; } } catch (e) {} } }); } catch (e) {}
  try { cv.addEventListener('pointerdown', () => { if (tipT > 0 && performance.now() - tipT > 2500) tipT = -1; }, true); } catch (e) {}
  function qtip() { const f = F(); if (!CLEAN || !QR || f.r380_qtip !== 1 && !(tipT > 0)) return; const now = performance.now();
    if (f.r380_qtip === 1) { if (world.locked || (typeof dialog !== 'undefined' && dialog)) { freeT = 0; return; } if (!freeT) freeT = now; if (now - freeT < 1200) return;   /* 剧情中间偶尔松一下手不算，连着闲下来一会儿才提示 */ f.r380_qtip = 2; tipT = now; try { playSnd('ui_open', .5); } catch (e) {} }
    const dt = (now - tipT) / 1000; if (dt > 10) { tipT = -1; return; } const al = Math.min(1, dt * 3) * Math.min(1, (10 - dt) * 2), pu = .55 + .45 * Math.sin(now / 190);
    ctx.save(); ctx.globalAlpha = al; ctx.strokeStyle = `rgba(255,224,138,${pu})`; ctx.lineWidth = 2.5; ctx.shadowColor = '#ffd36a'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.roundRect(QR.x - 2, QR.y - 3, QR.w + 6, QR.h + 6, 10); ctx.stroke(); ctx.shadowBlur = 0;
    const lines = ['这一行是眼下要做的事。', '点它，叶孤星会自己走过去；右边的卷轴是任务册。']; ctx.font = `600 17px ${FONT}`; const bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 36, bh = 74, bx = Math.min(W - bw - 14, QR.x + QR.w - bw + 60), by = QR.y + QR.h + 16;
    ctx.fillStyle = 'rgba(24,17,10,.92)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 10); ctx.fill(); ctx.strokeStyle = 'rgba(214,176,96,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bw - 120, by + 1); ctx.lineTo(bx + bw - 108, by - 11); ctx.lineTo(bx + bw - 96, by + 1); ctx.closePath(); ctx.fillStyle = 'rgba(24,17,10,.92)'; ctx.fill();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f5e8cc'; lines.forEach((l, i) => ctx.fillText(l, bx + 18, by + 24 + i * 27)); ctx.restore(); }
  if (typeof drawMapHud === 'function') drawMapHud = (o => function () { if (!CLEAN) { QR = QI = null; return o.apply(this, arguments); }
    const f = F(), keep = f.qt_min; f.qt_min = 1; let r; try { r = o.apply(this, arguments); } finally { if (keep === undefined) delete f.qt_min; else f.qt_min = keep; }
    try { QR = null; QI = (window.R287 && R287.HUD && R287.HUD.rect) || null; if (S.hud === false || S.menu || !world.map || S.scene !== drawMap || !window.R287) return r;
      const A = R287.all(), it = A.doing.find(x => x.kind === 'main') || A.doing[0]; if (!it) return r;
      const head = it.kind === 'main' ? '主线' : '支线', txt = (it.step || it.name || '').replace(/（[^）]*）/g, ''); ctx.save(); ctx.font = `600 18px ${FONT}`; let t = txt; while (t.length > 4 && ctx.measureText(t).width > 380) t = t.slice(0, -2) + '…';
      const tw = ctx.measureText(t).width, w = tw + 78, x1 = W - 84, x0 = x1 - w, y = 22, h = 40, g = ctx.createLinearGradient(x0 - 40, 0, x1, 0); g.addColorStop(0, 'rgba(14,10,6,0)'); g.addColorStop(.18, 'rgba(14,10,6,.62)'); g.addColorStop(1, 'rgba(14,10,6,.62)'); ctx.fillStyle = g; ctx.fillRect(x0 - 40, y, w + 40, h);
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = `700 14px ${FONT}`; ctx.fillStyle = it.kind === 'main' ? '#ff9a7a' : '#8fc8ff'; ctx.fillText(head, x0 + 6, y + h / 2 + 1); ctx.font = `600 18px ${FONT}`; ctx.fillStyle = (window.QUEST_NAV && QUEST_NAV.on) ? '#ffe27a' : '#f5ead0'; ctx.fillText(t, x0 + 46, y + h / 2 + 1); ctx.restore();
      QR = { x: x0 - 10, y, w: w + 10, h, it }; qtip(); } catch (e) {}
    return r; })(drawMapHud);
  try { cv.addEventListener('pointerdown', e => { if (!CLEAN || (!QR && !QI) || S.menu || world.locked || (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice)) return; const p = toLogical(e);
      const inq = QR && p.x >= QR.x && p.x <= QR.x + QR.w && p.y >= QR.y && p.y <= QR.y + QR.h, ini = QI && p.x >= QI[0] && p.x <= QI[0] + QI[2] && p.y >= QI[1] && p.y <= QI[1] + QI[3]; if (!inq && !ini) return;
      e.stopImmediatePropagation(); e.preventDefault(); try { input.tapped = null; playSnd('ui_click'); } catch (er) {}
      try { if (ini) { if (window.QBOOK_OPEN) QBOOK_OPEN(); } else if (QR.it.id === '__main') R140Q.goMain(); else R140Q.goSide(QR.it.id); } catch (er) { console.warn('R380 quest', er); } }, true); } catch (e) {}

  // 测试面板：切回原来的火
  window.R379 = { get show() { return SHOW; }, set(v) { SHOW = !!v; try { localStorage.setItem('r379_show', SHOW ? 'on' : 'off'); } catch (e) {} }, get near() { return NEAR; }, setNear(v) { NEAR = !!v; try { localStorage.setItem('r379_cam', NEAR ? 'near' : 'far'); } catch (e) {} }, get ff() { return FF; }, get clean() { return CLEAN; }, setClean(v) { CLEAN = !!v; try { localStorage.setItem('r380_clean', CLEAN ? 'on' : 'off'); } catch (e) {} }, get names() { return NAMES; }, setNames(v) { NAMES = !!v; try { localStorage.setItem('r379_names', NAMES ? 'on' : 'off'); } catch (e) {} }, gen, art };
  try { const pan = document.getElementById('dbgPanel'); const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r379]')) return; const h = document.createElement('h4'); h.textContent = '11-27 新加 · 野怪显形 / 灵光点 / 名字 / 镜头（R379）'; h.setAttribute('data-r379', '1');
      const row = document.createElement('div'); row.className = 'row'; const b = document.createElement('button'); const lab = () => { b.textContent = '野怪：' + (SHOW ? '显出本体（点一下切回原来的火）' : '原来的火（点一下显出本体）'); }; lab(); b.onclick = () => { R379.set(!SHOW); lab(); }; row.appendChild(b); const b2 = document.createElement('button'); const lab2 = () => { b2.textContent = 'NPC 名字：' + (NAMES ? '走近才显示（点一下改回一直显示）' : '一直显示（点一下改成走近才显示）'); }; lab2(); b2.onclick = () => { R379.setNames(!NAMES); lab2(); }; row.appendChild(b2); const b3 = document.createElement('button'); const lab3 = () => { b3.textContent = '镜头：' + (NEAR ? '近一档（点一下改回原来）' : '原来（点一下拉近一档，人物大两成）'); }; lab3(); b3.onclick = () => { R379.setNear(!NEAR); lab3(); }; row.appendChild(b3); const b4 = document.createElement('button'); const lab4 = () => { b4.textContent = '★ 清爽模式：' + (CLEAN ? '开着（点一下关）' : '关着（点一下开：镜头近、界面精简、野怪不带火）'); }; lab4(); b4.onclick = () => { R379.setClean(!CLEAN); lab4(); p.hidden = true; }; row.prepend(b4); p.prepend(h, row); };
    if (pan) add(); else { const mo = new MutationObserver(() => { if (document.getElementById('dbgPanel')) { add(); mo.disconnect(); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}
})();
