// ================= 洛尘 · 黑暗本源（代码重写版）=================
// Codex 版只作参考：金眸特写、裂渊六星、冥日流焰神躯、黑日 / 光柱 / 地火 / 余烬序列帧沿用 Codex 素材，
// 动作、时间轴、位置全部用代码实时算（法阵铺在真实敌人脚下，黑日吸的是每只敌人身上的气，砸、烧都落在真实位置）。
// 时间轴 18.6 秒（与配音 ha_14 对齐）：
//  0.0  金眸特写            1.6  右眼紫芒点燃，黑烟从四周爬进来
//  2.6  天地变暗，只剩紫芒  3.1  紫芒在地上逐边画出六芒星
//  4.8  裂渊六星成阵，紫焰升腾  6.6  光粒从阵里升起，凝成神躯
//  8.2  神躯立于阵上        10.4 举手聚黑日，从每只妖兽身上抽出紫气
// 13.1 黑日砸下            13.8 命中：血最多的 ×3.6 无视防御，其余 ×0.8；地火翻涌
// 14.6 神躯沉回阵中        15.2 紫色星烬升空，落向群妖
// 16.4 余焰灼烧全体 ×0.25  17.6 洛尘以 50% 复活
(function () {
  const W0 = 1280, H0 = 720, DUR = 18.6;
  const C = x => Math.max(0, Math.min(1, x)), E = (t, a, b) => { const q = C((t - a) / (b - a)); return q * q * (3 - 2 * q); }, L = (a, b, q) => a + (b - a) * q;
  const R = i => { const x = Math.sin(i * 127.1 + 49.3) * 43758.5453; return x - Math.floor(x); };
  let meta = null, pages = [], eyesIm = null, ready = false, loading = null;
  const load = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
  function preload() {
    if (loading) return loading;
    loading = (async () => {
      meta = await (await fetch('ha_assets/meta.json')).json();
      pages = await Promise.all(Array.from({ length: meta.pages }, (_, i) => load('ha_assets/atlas' + i + '.webp')));
      eyesIm = await load('gm_assets/eyes.webp'); ready = true;
    })();
    return loading;
  }
  function draw(g, k, x, y, w, h, ax = .5, ay = .5) { const e = meta.map[k]; if (!e) return; g.drawImage(pages[e[0]], e[1], e[2], e[3], e[4], x - w * ax, y - h * ay, w, h); }
  const RGBA = new Set(['intro_smoke', 'meteor_hit', 'rise_alpha', 'sink_alpha']);
  const COUNT = { intro_smoke: 8, seal: 6, rise_alpha: 8, sun: 8, essence: 6, slam: 8, pillar: 8, eruption: 8, wave: 8, sink_alpha: 8, meteor_hit: 6 };
  function seq(g, name, q, x, y, w, h, a = 1, ax = .5, ay = .5, rot = 0) {
    if (a <= 0 || q < 0 || q >= 1) return; const n = COUNT[name], f = Math.min(n - 1, Math.floor(q * n));
    g.save(); g.globalCompositeOperation = RGBA.has(name) ? 'source-over' : 'lighter'; g.globalAlpha = C(a);
    if (rot) { g.translate(x, y); g.rotate(rot); draw(g, name + '_' + f, 0, 0, w, h, ax, ay); } else draw(g, name + '_' + f, x, y, w, h, ax, ay);
    g.restore();
  }
  function glow(g, x, y, r, a, col = '190,110,255') {
    if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.35, `rgba(${col},${a * .4})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  }
  function spark(g, x, y, s, a, col = '215,160,255') { if (a <= 0) return; glow(g, x, y, s * 3, a * .6, col); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(245,225,255,${a})`; g.beginPath(); g.arc(x, y, s * .6, 0, 7); g.fill(); g.restore(); }
  const footOf = u => ({ x: u.x + (u.ox || 0), y: u.y + (u.oy || 0) }), chestOf = u => ({ x: u.x + (u.ox || 0), y: u.y + (u.oy || 0) - u.h * .52 });

  let S0 = null;
  function setup(Lc, enemies) {
    const fs = enemies.map(footOf), cx = fs.length ? fs.reduce((s, f) => s + f.x, 0) / fs.length : 380, cy = fs.length ? Math.max(...fs.map(f => f.y)) - 30 : 560;
    const arr = { x: Math.max(300, Math.min(640, cx + 70)), y: Math.min(620, cy), rx: 360, ry: 92 };
    const godX = arr.x + 120, godBase = arr.y + 10;
    S0 = { L: Lc, enemies, arr, god: { x: godX, base: godBase, h: 470 }, big: enemies.slice().sort((a, b) => b.hp - a.hp)[0] };
  }
  const EYE_R = { x: 848, y: 382 };   // 特写里紫色那只眼
  const hexPt = (i) => { const a = S0.arr, an = -Math.PI / 2 + i * Math.PI / 3; return { x: a.x + Math.cos(an) * a.rx * .78, y: a.y + Math.sin(an) * a.ry * .78 }; };
  const sunPos = t => { const G = S0.god, up = { x: G.x - 70, y: G.base - G.h - 40 }, drop = E(t, 13.1, 13.75); return { x: L(up.x, S0.arr.x - 40, drop), y: L(up.y, S0.arr.y - 30, drop) }; };

  function eyes(g, t) {
    const a = E(t, 0, .8) * (1 - E(t, 2.4, 3.0)); if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.drawImage(eyesIm, 0, 0, W0, H0); g.fillStyle = 'rgba(6,2,14,.35)'; g.fillRect(0, 0, W0, H0);
    const vg = g.createRadialGradient(W0 / 2, H0 / 2, H0 * .2, W0 / 2, H0 / 2, W0 * .7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(3,0,10,${.5 + .45 * E(t, 1.4, 2.6)})`); g.fillStyle = vg; g.fillRect(0, 0, W0, H0); g.restore();
    // 黑烟从四周爬进来
    for (let i = 0; i < 6; i++) { const q = (t - 1.0 - i * .12) / 1.8, side = i % 2 ? 1 : -1; seq(g, 'intro_smoke', q, W0 / 2 + side * (420 - 160 * C(q)), 130 + i * 90, 380, 380, a * .85); }
  }
  function eyeLight(g, t) {   // 紫芒：先在右眼点燃，天地变暗后变成一点紫光，再去画六芒星
    const ig = E(t, 1.6, 2.4), out = 1 - E(t, 4.4, 5.0); if (ig <= 0 || out <= 0) return;
    let p = EYE_R; if (t > 3.0) { const k = Math.min(5, Math.floor((t - 3.1) / .25)), q = C((t - 3.1 - k * .25) / .25), A0 = hexPt(k), B0 = hexPt((k + 2) % 6); p = t < 3.1 ? EYE_R : { x: L(A0.x, B0.x, q), y: L(A0.y, B0.y, q) }; if (t < 3.1) p = EYE_R; }
    const mv = E(t, 2.7, 3.1); if (t < 3.1 && mv > 0) { const A0 = hexPt(0); p = { x: L(EYE_R.x, A0.x, mv), y: L(EYE_R.y, A0.y, mv) }; }
    const pulse = .85 + .15 * Math.sin(t * 9);
    glow(g, p.x, p.y, 140 * ig, .6 * ig * out * pulse); glow(g, p.x, p.y, 34, .95 * ig * out, '240,215,255'); spark(g, p.x, p.y, 6, ig * out);
  }
  function hexLines(g, t) {   // 3.1–4.6 逐边画六芒星（地面透视）
    const a = E(t, 3.05, 3.2) * (1 - E(t, 5.2, 6.0)); if (a <= 0) return;
    const order = [[0, 2], [2, 4], [4, 0], [1, 3], [3, 5], [5, 1]];
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (let k = 0; k < 6; k++) { const q = C((t - 3.1 - k * .25) / .25); if (q <= 0) continue; const A0 = hexPt(order[k][0]), B0 = hexPt(order[k][1]);
      for (const [w, al] of [[14, .14], [6, .38], [2.2, .95]]) { g.strokeStyle = `rgba(${w < 3 ? '240,215,255' : '170,90,255'},${al * a})`; g.lineWidth = w; g.beginPath(); g.moveTo(A0.x, A0.y); g.lineTo(L(A0.x, B0.x, q), L(A0.y, B0.y, q)); g.stroke(); } }
    const r = E(t, 4.4, 4.9); if (r > 0) { const A = S0.arr; for (const [w, al] of [[10, .14], [3, .55]]) { g.strokeStyle = `rgba(190,120,255,${al * a * r})`; g.lineWidth = w; g.beginPath(); g.ellipse(A.x, A.y, A.rx * .96, A.ry * .96, 0, 0, 7); g.stroke(); } }
    g.restore();
  }
  function array(g, t) {   // 裂渊六星：地上的紫焰法阵
    const a = E(t, 4.7, 5.6) * (1 - E(t, 15.6, 16.8)); if (a <= 0) return; const A = S0.arr;
    glow(g, A.x, A.y, A.rx * 1.1, .28 * a);
    g.save(); g.globalAlpha = a * .95; g.globalCompositeOperation = 'lighter'; g.translate(A.x, A.y); g.scale(1, A.ry / (A.rx * .42)); g.rotate(t * .05); draw(g, 'hex', 0, 0, A.rx * 2.1, A.rx * 2.1 * .667 * .63); g.restore();
    const f = Math.floor(t * 7) % 6; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .55; draw(g, 'seal_' + f, A.x, A.y, A.rx * 2.2, A.ry * 3.2); g.restore();
    // 光粒从阵里升起（神躯就是它们凝成的）
    const rise = E(t, 5.6, 6.4) * (1 - E(t, 8.0, 8.8));
    for (let i = 0; i < 60; i++) { const ph = (t * (.35 + R(i) * .4) + R(i + 9)) % 1, an = R(i + 3) * 6.28, rr = R(i + 5);
      const sx = A.x + Math.cos(an) * A.rx * rr * .9, sy = A.y + Math.sin(an) * A.ry * rr * .9, G = S0.god, cvg = E(t, 6.6, 7.8);
      const x = L(sx, G.x + (R(i + 7) - .5) * 160, cvg * ph), y = sy - ph * L(220, G.h * .8, cvg);
      spark(g, x, y, 1.5 + R(i + 11) * 2, rise * Math.sin(ph * Math.PI) * .9); }
  }
  function godLayer(g, t) {
    const G = S0.god;
    // 凝结：rise 序列（7.0–8.2）
    seq(g, 'rise_alpha', (t - 6.9) / 1.3, G.x, G.base + 20, G.h * .75, G.h, 1, .5, 1);
    // 站立 / 握拳（8.2–14.6）
    const a = E(t, 8.0, 8.3) * (1 - E(t, 14.4, 14.7)); if (a > 0) {
      const fist = E(t, 10.2, 10.7) * (1 - E(t, 13.6, 14.0)), breath = 1 + .01 * Math.sin(t * 2.1), sway = Math.sin(t * 1.3) * 4;
      glow(g, G.x, G.base - G.h * .55, G.h * .7, .3 * a + .2 * fist);
      for (const [k, w] of [['god', 1 - fist], ['god_fist', fist]]) { if (w <= .01) continue;
        g.save(); g.globalAlpha = a * w; g.translate(G.x + sway, G.base); g.scale(breath, breath); draw(g, k, 0, 0, G.h * .75, G.h, .5, 1); g.restore(); }
      // 神躯紫焰（底部地火）
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .55; const fw = Math.floor(t * 10) % 8; draw(g, 'wave_' + fw, G.x, G.base + 26, G.h * .9, G.h * .5, .5, 1); g.restore();
    }
    // 沉回阵中（14.6–15.8）
    seq(g, 'sink_alpha', (t - 14.55) / 1.3, G.x, G.base + 20, G.h * .75, G.h, 1, .5, 1);
  }
  function blackSun(g, t) {
    const a = E(t, 10.4, 10.8) * (1 - E(t, 13.75, 13.85)); if (a <= 0) return; const p = sunPos(t), grow = E(t, 10.4, 12.6), s = 90 + 150 * grow;
    const f = Math.min(7, Math.floor(E(t, 10.4, 12.4) * 8)); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.translate(p.x, p.y); g.rotate(-t * 1.6); draw(g, 'sun_' + f, 0, 0, s, s); g.restore();
    g.save(); g.fillStyle = `rgba(2,0,6,${.92 * a})`; g.beginPath(); g.arc(p.x, p.y, s * .2, 0, 7); g.fill(); g.restore();   // 黑日核心
    glow(g, p.x, p.y, s * .9, .35 * a);
    // 从每只妖兽身上抽出紫气，流进黑日
    const drain = E(t, 10.8, 11.3) * (1 - E(t, 12.9, 13.2));
    if (drain > 0) for (const [i, u] of S0.enemies.entries()) { const c = chestOf(u), ang = Math.atan2(p.y - c.y, p.x - c.x), d = Math.hypot(p.x - c.x, p.y - c.y), f2 = Math.floor(t * 9 + i * 2) % 6;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = drain * .8; g.translate(c.x, c.y); g.rotate(ang); draw(g, 'essence_' + f2, d * .5, 0, d, 120); g.restore();
      for (let j = 0; j < 8; j++) { const ph = (t * 1.2 + j / 8 + i * .13) % 1, e2 = ph * ph; spark(g, L(c.x, p.x, e2) + Math.sin(ph * 9 + j) * 10, L(c.y, p.y, e2), 2, drain * Math.sin(ph * Math.PI)); } }
    // 下砸
    if (t > 13.05) seq(g, 'slam', (t - 13.05) / .8, p.x, p.y + 60, 300, 400, 1, .5, .7);
  }
  function impact(g, t) {
    const A = S0.arr;
    if (t > 13.75 && t < 15.2) { const q = (t - 13.75) / 1.45, f = Math.min(7, Math.floor(q * 8));   // 地火翻涌，横扫整片地面
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - E(q, .6, 1); for (let i = -1; i <= 1; i++) draw(g, 'wave_' + f, A.x + i * A.rx * .75, A.y + 40, A.rx * 1.1, A.ry * 3.4, .5, 1); g.restore();
      glow(g, A.x, A.y - 40, A.rx * 1.4, .55 * (1 - E(q, 0, .5)), '200,120,255'); }
    for (const [i, u] of S0.enemies.entries()) { const f = footOf(u), big = u === S0.big, sc = big ? 1.25 : 1, d = i * .04;
      seq(g, 'pillar', (t - 13.75 - d) / .95, f.x, f.y + 10, 190 * sc, 560 * sc, 1, .5, 1);
      seq(g, 'eruption', (t - 13.8 - d) / 1.0, f.x, f.y + 16, Math.max(220, u.h * 1.5) * sc, Math.max(220, u.h * 1.5) * sc * 1.33, .95, .5, 1);
      // 16.4 余焰灼烧：星烬落下
      seq(g, 'meteor_hit', (t - 16.35 - d) / .9, chestOf(u).x, chestOf(u).y, 230, 230, 1);
    }
  }
  function embers(g, t) {   // 15.0–16.4 紫色星烬升空，再落向群妖
    if (t < 14.9 || t > 16.6) return; const G = S0.god;
    S0.enemies.forEach((u, j) => { const c = chestOf(u);
      for (let i = 0; i < 18; i++) { const k = j * 37 + i, st = 14.9 + R(k) * .5, q = C((t - st) / (16.4 - st)); if (q <= 0 || q >= 1) continue;
        const s = { x: G.x + (R(k + 1) - .5) * 200, y: G.base - G.h * (.3 + R(k + 2) * .6) }, m = { x: (s.x + c.x) / 2 + (R(k + 3) - .5) * 200, y: Math.min(s.y, c.y) - 200 - R(k + 4) * 140 };
        const e = q * q, x = (1 - e) * (1 - e) * s.x + 2 * (1 - e) * e * m.x + e * e * c.x, y = (1 - e) * (1 - e) * s.y + 2 * (1 - e) * e * m.y + e * e * c.y;
        spark(g, x, y, 2 + R(k + 5) * 2, Math.sin(q * Math.PI) * .95); } });
  }
  function caster(g, t) {   // 洛尘托着黑日；17.6 复活时紫金一闪
    const a = E(t, 2.6, 3.2) * (1 - E(t, 17.3, 17.7)); const u = S0.L, f = footOf(u);
    if (a > 0) { const e = meta.map.tuotian, s = u.h * 1.02 / 600, w = e[3] * s, h = e[4] * s;
      g.save(); g.globalAlpha = a; g.filter = 'brightness(.82) saturate(.8)'; g.drawImage(pages[e[0]], e[1], e[2], e[3], e[4], f.x - w / 2, f.y - h, w, h); g.restore();
      const sx = f.x + 10 * s, sy = f.y - h - 26 * s, sr = 120 * s * (.96 + .04 * Math.sin(t * 3)), fr = 4 + Math.floor(t * 6) % 4;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.translate(sx, sy); g.rotate(t * 1.2); draw(g, 'sun_' + fr, 0, 0, sr * 2.2, sr * 2.2); g.restore();
      g.save(); g.fillStyle = `rgba(2,0,6,${.9 * a})`; g.beginPath(); g.arc(sx, sy, sr * .45, 0, 7); g.fill(); g.restore();
      // 紫眸
      glow(g, f.x - 4 * s, f.y - h + 112 * s, 26, .6 * a * (.8 + .2 * Math.sin(t * 6)));
    }
    if (t > 17.4) { const q = C((t - 17.4) / 1.1); glow(g, f.x, f.y - u.h * .5, 160, .7 * Math.sin(q * Math.PI), '230,190,255'); spark(g, f.x, f.y - u.h * .55, 10, Math.sin(q * Math.PI)); }
  }
  function darkness(g, t) {   // 天地变暗（盖住战场，单位在下）
    const a = E(t, 2.4, 3.0) * (1 - E(t, 16.6, 17.8)); if (a <= 0) return;
    g.save(); g.fillStyle = `rgba(4,1,12,${.62 * a})`; g.fillRect(0, 0, W0, H0); g.restore();
  }
  function back(t) { const g = ctx; darkness(g, t); array(g, t); }
  function front(t) { const g = ctx; hexLines(g, t); godLayer(g, t); blackSun(g, t); impact(g, t); embers(g, t); caster(g, t); eyes(g, t); eyeLight(g, t); }
  // 只画「最后那一下」：13.75–15.2 秒的地火翻涌、光柱、爆发（叠在 Codex 原版的命中上）
  function finale(t) { if (!S0 || t < 13.7 || t > 15.3) return; const g = ctx; g.save(); impact(g, Math.min(t, 15.25)); g.restore(); }
  window.HA_RT = { preload, get ready() { return ready; }, DUR, setup, back, front, finale };
})();
