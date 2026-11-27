// ================= R426 · 树下、草丛里、柜子里摸得到东西（只进测试版）=================
// 作者 11-27 21:02：「宝不只有宝箱，还有平时一些，比如说柜子啊、树木啊……摸一摸、探索一下，可能都会掉落一些材料」
// 作者 11-28：「很多树木或者草地或者一些柜子都可以有光去表示你有东西，但是有一些隐藏的不发光也有。」
// 做法：每张图从地图上现成的物件里挑几样（野外挑树、灌木草丛、山石树桩；屋里挑柜子、箱笼、书架、篮筐……），
//   大部分身上隐隐有一层光（呼吸似的亮一下、飘两点光尘），走过去点它就能摸到东西；另有少数「暗藏」的一点光都没有，
//   要自己去点才知道——东西也给得好一点。挑哪几样按地图名算死，以后不变。摸过的过一阵又会有（发光的半小时，暗藏的两个时辰）。
(function () {
  if (typeof TMAPS === 'undefined' || typeof tileSetMap !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const TREE = /tree|pine|birch|maple|camphor|osmanthus|sophora|fir\b|willow|scholar|redwood|ginkgo|pear|albizia|tallow|bamboo|槐|松|杉|樟|柏|杨|竹|折影木|银树/i;
  const BUSH = /shrub|荆丛|fern|蕨|grass_clump|reed|芦苇|thatch|tea\b|yyv_tea|yyt_tea|bush/i;
  const ROCK = /rock|boulder|苔岩|溪石|stump|mushroom/i;
  const FURN = /chest|cupboard|cabinet|wardrobe|bookcase|shelf|curio|dressing|vanity|basket|jar|sacks|firewood|crate|book_stack|altar|bedside|robe_rack|counter|柜|箱|架/i;
  const NO = /wall|lamp|lantern|pillar|column|post|rail|door|window|strip|border|bed\b|canopy|screen|painting|couplet|rug|mat\b|threshold|sign|banner/i;
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = seed || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  const nameOf = o => String(o.img_id || o.img || o.id || '');
  const kindOf = (o, indoor) => { const n = nameOf(o); if (NO.test(n)) return null; if (indoor) return FURN.test(n) ? 'furn' : null; return TREE.test(n) ? 'tree' : BUSH.test(n) ? 'bush' : ROCK.test(n) ? 'rock' : null; };
  const SP = {};   // 地图 → [{x, y, w, h, kind, hidden, i}]
  function gen(m) { if (SP[m]) return SP[m]; const out = SP[m] = []; const M = TMAPS[m], B = M && M.baked;
    if (!B || typeof B.blocked !== 'string' || !B.cols || !Array.isArray(B.objs)) return out;
    const indoor = !!M.indoor; if (!indoor && !M.mobs && !/town|city|market|front|court|garden|xiashan|houshan|bamboo|pavilion|road|forest|valley|ridge|creek|glade|stones|spring|north|gate/.test(m)) return out;
    try { const cs = B.cs, cols = B.cols, rows = B.rows, free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && B.blocked[r * cols + c] === '0';
      const seen = new Uint8Array(cols * rows), q = [], ents = [];
      if (M.start) ents.push([(M.start[0] + .5) * 64, (M.start[1] + .8) * 64]); for (const e of M.exits || []) ents.push([(e.x + (e.w || 1) / 2) * cs, (e.y + (e.h || 1) / 2) * cs]);
      for (const [ex, ey] of ents) { const c0 = Math.floor(ex / cs), r0 = Math.floor(ey / cs); let hit = false; for (let d = 0; d < 12 && !hit; d++) for (let dy = -d; dy <= d && !hit; dy++) for (let dx = -d; dx <= d && !hit; dx++) if (free(c0 + dx, r0 + dy) && !seen[(r0 + dy) * cols + c0 + dx]) { seen[(r0 + dy) * cols + c0 + dx] = 1; q.push(c0 + dx, r0 + dy); hit = true; } }
      for (let i = 0; i < q.length; i += 2) { const c = q[i], r = q[i + 1]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dx, nr = r + dy; if (free(nc, nr) && !seen[nr * cols + nc]) { seen[nr * cols + nc] = 1; q.push(nc, nr); } } }
      const reach = (x, y) => { for (let dy = 16; dy <= 90; dy += 14) for (let dx = -30; dx <= 30; dx += 15) { const c = Math.floor((x + dx) / cs), r = Math.floor((y + dy) / cs); if (c >= 0 && r >= 0 && c < cols && r < rows && seen[r * cols + c]) return true; } return false; };
      const avoid = ents.map(e => [e[0], e[1], 260]); for (const np of M.npcs || []) if (np.c != null && !np.r426) avoid.push([(np.c + .5) * 64, (np.r + .8) * 64, 140]);
      for (const ch of M.chests || []) avoid.push([(ch.c + .5) * 64, (ch.r + 1) * 64, 150]); for (const d of M.doors || []) if (d.x != null) avoid.push([d.x, d.y, 160]);
      const front = B.objs.filter(o => !o.flat && o.w > 60 && o.h > 60), covered = (o, x, y) => front.some(f => f !== o && f.sy > y + 6 && x > f.x + 10 && x < f.x + f.w - 10 && y - 20 > f.y && y - 50 < f.y + f.h);
      const cand = [];
      for (const o of B.objs) { if (o.flat || !(o.w > 30) || !(o.h > 30)) continue; const k = kindOf(o, indoor); if (!k) continue; const x = o.x + o.w / 2, y = o.sy != null ? o.sy : o.y + o.h;
        if (x < 60 || y < 120 || x > B.w - 60 || y > B.h - 30) continue; if (!reach(x, y) || covered(o, x, y)) continue; if (avoid.some(([ax, ay, d]) => Math.hypot(ax - x, ay - y) < d)) continue; cand.push({ x, y, w: o.w, h: o.h, kind: k }); }
      const R = rng(hash('r426' + m)); for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
      const n = indoor ? Math.min(2, cand.length) : Math.max(3, Math.min(8, Math.round(B.w * B.h / 1600000))), gap = indoor ? 160 : 360;
      for (const c of cand) { if (out.length >= n) break; if (out.some(p => Math.hypot(p.x - c.x, p.y - c.y) < gap)) continue; c.i = out.length; out.push(c); }
      const hid = indoor ? (out.length >= 2 ? 1 : 0) : Math.max(1, Math.round(out.length / 4)); for (let k = 0; k < hid; k++) { const p = out[out.length - 1 - k]; if (p) p.hidden = true; }
    } catch (e) { console.warn('R426 gen', e); }
    return out; }
  const REGROW = { glow: 30 * 60 * 1000, hidden: 120 * 60 * 1000 };
  const fk = (m, p) => 'sr_' + m + '_' + p.i, ready = (m, p) => { const v = F()[fk(m, p)]; return !v || Date.now() - v > (p.hidden ? REGROW.hidden : REGROW.glow); };
  function mats(m) { const out = []; try { for (const t of (TMAPS[m].mobs || {}).types || []) for (const [id] of (typeof DROPS !== 'undefined' && DROPS[(MOB_DB[t] || {}).key]) || []) if (ITEM_DB[id] && ITEM_DB[id].mat && !out.includes(id)) out.push(id); } catch (e) {} return out; }
  const pickOne = (a, r) => a[Math.floor(r * a.length)];
  function reward(m, p) { const r = Math.random, lv = (S.hero && S.hero.lv) || 1, ms = mats(m), ok = id => !!ITEM_DB[id];
    if (p.hidden) { const pool = [['q_sha', 2], ['q_jing', 1], ['x_xingshen', 2], ['p_big', 1], ['juan3', 1]].filter(([id]) => ok(id));
      const gems = ['jin', 'mu', 'shui', 'huo', 'tu'].map(e => 'g_' + e + '2').filter(ok); if (gems.length && r() < .3) return [[pickOne(gems, r()), 1]];
      if (ms.length && r() < .4) return [[pickOne(ms, r()), 2], ['gold', 60 + lv * 8]]; return [pickOne(pool, r()) || ['gold', 120 + lv * 10]]; }
    if (p.kind === 'furn') { const x = r(); return x < .35 ? [['gold', 20 + lv * 4 + Math.floor(r() * 30)]] : x < .6 ? [['p_small', 1]] : x < .8 ? [['p_mp', 1]] : [[ok('x_xingshen') ? 'x_xingshen' : 'p_small', 1]]; }
    const x = r(); if (ms.length && x < .55) return [[pickOne(ms, r()), 1]]; return x < .75 ? [['p_small', 1]] : x < .88 ? [['p_mp', 1]] : [['gold', 15 + lv * 3]]; }
  const WORD = { tree: ['拨开树根下的落叶', '在树洞里摸了摸'], bush: ['拨开草丛', '在草根底下翻了翻'], rock: ['翻开石头底下', '在石缝里掏了掏'], furn: ['拉开柜门翻了翻', '在箱笼里翻了翻'] };
  async function search(m, p) {
    if (!ready(m, p)) { toast(p.kind === 'furn' ? '刚翻过，空的' : '刚找过了，过一阵再来看看', 1600); return; }
    F()[fk(m, p)] = Date.now(); const got = [];
    for (const [id, n] of reward(m, p)) { if (id === 'gold') { S.hero.gold += n; got.push('灵石 ' + n); } else if (ITEM_DB[id]) { addItem(id, n); got.push(ITEM_DB[id].name + (n > 1 ? ' ×' + n : '')); } }
    try { playSnd(p.hidden ? 'jingle_win' : 'ui_confirm', p.hidden ? .45 : .7); } catch (e) {}
    const w = WORD[p.kind] || WORD.bush; toast((p.hidden ? '暗处藏着东西！' : '') + w[p.i % w.length] + '，找到：' + got.join('、'), 2600);
    try { for (let k = 0; k < 14; k++) BURST.push({ x: p.x, y: p.y - Math.min(p.h, 160) * .4, a: Math.random() * 7, v: 40 + Math.random() * 60, t0: performance.now() / 1000, c: p.hidden ? [255, 220, 120] : [200, 255, 220] }); } catch (e) {} }
  // 地图上加一个看不见的「人」站在物件脚下：点物件、走过去、翻找（和点 NPC 一样走引擎原来那一套）
  tileSetMap = (orig => function (m) { try { const M = TMAPS[m]; if (M && !M._r426) { M._r426 = 1; const ps = gen(m); M.npcs = M.npcs || [];
          for (const p of ps) M.npcs.push({ key: 'none', c: p.x / 64 - .5, r: p.y / 64 - .8, name: p.kind === 'furn' ? '翻找' : '摸索', hidden: true, noLabel: true, h: Math.max(70, Math.min(170, p.h * .7)), wander: false, r426: p, talk: () => search(m, p) }); } } catch (e) { console.warn('R426', e); }
    return orig.apply(this, arguments); })(tileSetMap);
  if (typeof doInteract === 'function') doInteract = (orig => async function (h) { if (!(h && h.type === 'npc' && h.a && h.a.npc && h.a.npc.r426)) return orig.apply(this, arguments);
    world.locked = true; try { const p = h.a.npc.r426; await search(world.mapName, p); } catch (e) { console.warn('R426 search', e); } finally { world.locked = false; } })(doInteract);
  // 发光：物件身上一层很淡的光，呼吸似的；两三点光尘慢慢往上飘。暗藏的不画
  const BURST = [];
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function (T, cam, now) { if (orig) orig.apply(this, arguments);
    try { const m = world.mapName, ps = SP[m]; const t = performance.now() / 1000; ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (ps) for (const p of ps) { if (p.hidden || !ready(m, p)) continue; const hh = Math.min(p.h, p.kind === 'tree' ? 200 : 120), cx = p.x, cy = p.y - hh * .42, rr = Math.max(34, Math.min(p.w, hh) * .48), k = .5 + .5 * Math.sin(t * 1.9 + p.i * 1.3);
        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, rr); g.addColorStop(0, `rgba(255,232,160,${.34 + .3 * k})`); g.addColorStop(.5, `rgba(255,220,140,${.12 + .14 * k})`); g.addColorStop(1, 'rgba(255,230,170,0)'); ctx.fillStyle = g; ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
        for (let j = 0; j < 4; j++) { const life = 2.6, ph = ((t + j * .9 + p.i * .37) % life) / life, x = cx + Math.sin(j * 2.1 + p.i + t * .6) * rr * .5, y = p.y - 10 - ph * (hh * .7), a = Math.sin(ph * Math.PI) * .75;
          ctx.fillStyle = `rgba(255,236,170,${a})`; ctx.beginPath(); ctx.arc(x, y, 2.8, 0, 7); ctx.fill(); ctx.fillStyle = `rgba(255,255,240,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.2, 0, 7); ctx.fill(); } }
      for (let i = BURST.length - 1; i >= 0; i--) { const b = BURST[i], dt = t - b.t0; if (dt > 1) { BURST.splice(i, 1); continue; } const a = 1 - dt; ctx.fillStyle = `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a})`; ctx.beginPath(); ctx.arc(b.x + Math.cos(b.a) * b.v * dt, b.y + Math.sin(b.a) * b.v * dt * .6 - dt * 30, 2.2 * a + .6, 0, 7); ctx.fill(); }
      ctx.restore(); } catch (e) {} })(typeof tileAmbientHigh === 'function' ? tileAmbientHigh : null);
  window.R426 = { gen, SP };
})();
