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
    const fr = fireFrame(ghost ? 'ghost' : 'beast', f.tier, Math.floor(t * 9) % 6), fs = H * 1.55;
    if (fr) { ctx.globalAlpha = .9; ctx.drawImage(fr, x - fs / 2, y - fs * .84, fs, fs); ctx.globalAlpha = 1; }
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
    for (let i = 0; i < (f.tier === 'gold' ? 10 : 5); i++) { const kk = ((t * .6 + i / 5) % 1), sx = x + Math.sin(i * 7.3 + t * 1.4) * H * .34, sy = y - 6 - kk * H * .95; ctx.fillStyle = rgba(c, (1 - kk) * .9); ctx.beginPath(); ctx.arc(sx, sy, 2.4 * (1 - kk) + .6, 0, 7); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    // 头顶：名字 + 等级（颜色 = 强弱）
    const md = Object.values(MOB_DB).find(m => m.key === k) || MOB_DB[a.mob] || {}, nm = (T.tag ? T.tag + '·' : '') + (md.name || '') + ' Lv' + f.lv;
    ctx.font = `700 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(nm, x, y - H - 14, rgba([Math.min(255, c[0] + 70), Math.min(255, c[1] + 70), Math.min(255, c[2] + 70)], 1), 'rgba(0,0,0,.85)', 4);
    ctx.restore(); }

  // ---------- ② 灵光点 ----------
  const KINDS = { herb: { c: [120, 240, 190], name: '灵草' }, ore: { c: [150, 200, 255], name: '灵矿' }, relic: { c: [255, 214, 110], name: '遗落之物' } };
  const RELIC = { xt_road: [['x_anxi', 2]], lin_forest: [['p_big', 2]], hf_valley: [['m_yanjing', 1], ['gold', 120]], m_yy_tiger: [['m_silk', 2], ['p_mp', 1]], m_yy_verge: [['m_thorn', 2], ['p_mp', 2]], tj_xiashan: [['p_big', 1], ['gold', 80]], m_xx_b1: [['m_shike', 2], ['p_big', 1]] };
  const PK = {};   // 地图 → [{x,y,kind,i}]
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = seed || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function gen(name) { if (PK[name]) return PK[name]; const M = TMAPS[name], B = M && M.baked; const out = PK[name] = [];
    if (!M || !M.mobs || !B || typeof B.blocked !== 'string' || !B.cols) return out;
    try { const cs = B.cs, cols = B.cols, rows = B.rows, free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && B.blocked[r * cols + c] === '0';
      // 从入口灌水：只在走得到的地方放
      const seen = new Uint8Array(cols * rows), q = [], ents = [];
      if (M.start) ents.push([(M.start[0] + .5) * 64, (M.start[1] + .8) * 64]); for (const e of M.exits || []) ents.push([(e.x + (e.w || 1) / 2) * cs, (e.y + (e.h || 1) / 2) * cs]);
      for (const [ex, ey] of ents) { const c0 = Math.floor(ex / cs), r0 = Math.floor(ey / cs); for (let d = 0; d < 12 && !q.length; d++) for (let dy = -d; dy <= d && !q.length; dy++) for (let dx = -d; dx <= d; dx++) if (free(c0 + dx, r0 + dy)) { q.push(c0 + dx, r0 + dy); seen[(r0 + dy) * cols + c0 + dx] = 1; break; } if (q.length) break; }
      for (let i = 0; i < q.length; i += 2) { const c = q[i], r = q[i + 1]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dx, nr = r + dy; if (free(nc, nr) && !seen[nr * cols + nc]) { seen[nr * cols + nc] = 1; q.push(nc, nr); } } }
      const R = rng(hash('r379' + name)), n = Math.max(3, Math.min(7, Math.round(B.w * B.h / 2200000))), avoid = ents.map(e => [e[0], e[1], 300]);
      for (const ch of M.chests || []) avoid.push([(ch.c + .5) * 64, (ch.r + .8) * 64, 220]);
      const yw = (window.R370_YW || []).find(y => y.map === name); if (yw) avoid.push([yw.pos[0], yw.pos[1], 340]);
      const room = (c, r) => { const k = Math.ceil(26 / cs); for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) if (!free(c + dx, r + dy) || !seen[(r + dy) * cols + c + dx]) return false; return true; };
      for (let tries = 0; tries < 4000 && out.length < n; tries++) { const c = Math.floor(R() * cols), r = Math.floor(R() * rows); if (!room(c, r)) continue; const x = (c + .5) * cs, y = (r + .5) * cs;
        if (x < 80 || y < 160 || x > B.w - 80 || y > B.h - 60) continue; if (avoid.some(([ax, ay, d]) => Math.hypot(ax - x, ay - y) < d)) continue; if (out.some(p => Math.hypot(p.x - x, p.y - y) < 430)) continue;
        out.push({ x, y, i: out.length, kind: R() < .56 ? 'herb' : 'ore' }); }
      // 离入口最远的那一处是「遗落之物」
      if (out.length >= 3 && ents.length) { let best = null, bd = -1; for (const p of out) { const d = Math.min(...ents.map(e => Math.hypot(e[0] - p.x, e[1] - p.y))); if (d > bd) { bd = d; best = p; } } if (best) best.kind = 'relic'; }
    } catch (e) { console.warn('R379 gen', e); }
    return out; }
  const taken = (name, p) => !!F()['pk_' + name + '_' + p.i];
  window.R379_COUNT = name => { const a = gen(name); return [a.filter(p => taken(name, p)).length, a.length]; };
  function rewardOf(name, p) { const lv = (S.hero && S.hero.lv) || 1, R = rng(hash(name + p.i + 'rw'));
    if (p.kind === 'relic') return RELIC[name] || [['p_big', 1]];
    if (p.kind === 'ore') return [['gold', 30 + lv * 5 + Math.floor(R() * 30)]];
    const mats = []; try { for (const t of TMAPS[name].mobs.types) for (const [id] of (typeof DROPS !== 'undefined' && DROPS[(MOB_DB[t] || {}).key]) || []) if (ITEM_DB[id] && ITEM_DB[id].mat && !mats.includes(id)) mats.push(id); } catch (e) {}
    const r = R(); return r < .4 ? [['p_small', 1]] : r < .62 ? [['p_mp', 1]] : mats.length && r < .86 ? [[mats[Math.floor(R() * mats.length)], 1]] : [['x_xingshen', 1]]; }
  const POP = [];
  function pick(name, p) { F()['pk_' + name + '_' + p.i] = 1; const got = [];
    for (const [id, n] of rewardOf(name, p)) { if (id === 'gold') { S.hero.gold += n; got.push('灵石 ' + n); } else if (ITEM_DB[id]) { addItem(id, n); got.push(ITEM_DB[id].name + (n > 1 ? ' ×' + n : '')); } }
    try { playSnd(p.kind === 'relic' ? 'jingle_win' : 'ui_confirm', p.kind === 'relic' ? .5 : .8); } catch (e) {}
    POP.push({ x: p.x, y: p.y, t0: performance.now() / 1000, text: got.join('、'), c: KINDS[p.kind].c, big: p.kind === 'relic' });
    if (p.kind === 'relic') { const [a, b] = R379_COUNT(name); setTimeout(() => toast('拾得遗落之物：' + got.join('、').slice(0, 9), 2200), 200); } }
  function drawPick(p, now) { const K = KINDS[p.kind], c = K.c, im = art('pick_' + p.kind), t = now + p.i * 1.7, x = p.x, y = p.y; ctx.save();
    let g = ctx.createRadialGradient(x, y - 6, 2, x, y - 6, 44); g.addColorStop(0, rgba(c, .4 + Math.sin(t * 3) * .12)); g.addColorStop(1, rgba(c, 0)); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y - 4, 44, 26, 0, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    if (im) { const w = p.kind === 'relic' ? 62 : 54, h = w * im.height / im.width; ctx.drawImage(im, x - w / 2, y - h + 8, w, h); }
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
  function mark(n, x, y, w) { const im = art(n); if (!im) return false; const h = w * im.height / im.width; ctx.save(); ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.drawImage(im, x - w / 2, y - h / 2 - 4, w, h); ctx.restore(); return true; }
  if (typeof textOutline === 'function') textOutline = (orig => function (t, x, y, col) { try { if (SHOW && (t === '!' || t === '?')) { const f = ctx.font; if (/900 68px/.test(f)) { const grey = /b8b0a0/i.test(col || ''); if (mark(t === '!' ? 'mark_quest' : grey ? 'mark_wait' : 'mark_done', x, y, 54)) return; } else if (/900 56px/.test(f) && t === '!') { if (mark('mark_story', x, y, 50)) return; } } } catch (e) {} return orig.apply(this, arguments); })(textOutline);
  try { const ft = ctx.fillText, st = ctx.strokeText; const big = () => /900 52px/.test(ctx.font);
    ctx.fillText = function (t, x, y) { if (t === '!' && SHOW && big() && mark('mark_story', x, y - 14, 46)) return; return ft.apply(this, arguments); };
    ctx.strokeText = function (t, x, y) { if (t === '!' && SHOW && big() && art('mark_story')) return; return st.apply(this, arguments); }; } catch (e) {}
  // ---------- ⑤ NPC 的名字：走近了才显出来（原来一屏十几个名字常年挂着，像地图标注）；头顶的任务 / 主线令符照旧远远就看得见 ----------
  if (typeof textOutline === 'function') textOutline = (orig => function (t, x, y, col, oc) { try { if (SHOW && NAMES && oc === '#1a0c00' && (col === '#fff4d8' || col === '#ffe08a') && /600 18px/.test(ctx.font) && world.player && S.scene === drawMap && !(typeof battle !== 'undefined' && battle)) {
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
  // 测试面板：切回原来的火
  window.R379 = { get show() { return SHOW; }, set(v) { SHOW = !!v; try { localStorage.setItem('r379_show', SHOW ? 'on' : 'off'); } catch (e) {} }, get names() { return NAMES; }, setNames(v) { NAMES = !!v; try { localStorage.setItem('r379_names', NAMES ? 'on' : 'off'); } catch (e) {} }, gen, art };
  try { const pan = document.getElementById('dbgPanel'); const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r379]')) return; const h = document.createElement('h4'); h.textContent = '11-27 新加 · 野怪显形 / 灵光点（R379）'; h.setAttribute('data-r379', '1');
      const row = document.createElement('div'); row.className = 'row'; const b = document.createElement('button'); const lab = () => { b.textContent = '野怪：' + (SHOW ? '显出本体（点一下切回原来的火）' : '原来的火（点一下显出本体）'); }; lab(); b.onclick = () => { R379.set(!SHOW); lab(); }; row.appendChild(b); const b2 = document.createElement('button'); const lab2 = () => { b2.textContent = 'NPC 名字：' + (NAMES ? '走近才显示（点一下改回一直显示）' : '一直显示（点一下改成走近才显示）'); }; lab2(); b2.onclick = () => { R379.setNames(!NAMES); lab2(); }; row.appendChild(b2); p.prepend(h, row); };
    if (pan) add(); else { const mo = new MutationObserver(() => { if (document.getElementById('dbgPanel')) { add(); mo.disconnect(); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}
})();
