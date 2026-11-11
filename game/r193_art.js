// ================= R193 · 潭边垂钓：画面 =================
// R193J（作者 11-12「你去接入吧」）：清水潭面（五个时辰）、水下鱼影、叶孤星坐在竹台上（待着 / 甩竿 / 搏鱼）、竿（握点→竿梢）、竿梢铜铃、
//   钓具匣、收竿签、玉石按钮、浮漂特写圆框、印章、墨痕字底、前景竹叶。
// R193I3：浮漂 16 段动画——每种鱼咬钩时浮漂动法不一样，玩家自己看漂认鱼（idle 待着、debris 杂物）。
// R193F 只留：雨、雾、水面涟漪、四种钓线、钓具匣卷轴和卷轴上的按钮。
// R193G：竿梢 / 水面小生物（征兆）、鱼被提出水面、钓具图标、等级玉牌、新鱼卡、鱼谱底图。
// 画的顺序照 R193J sheet.json draw_order：背景 → 水下鱼影 → 线 → 浮漂和水面效果 → 竿 → 人 → 铃和竿梢小虫 → 匣和签 → 前景 → 按钮 → 特写 → 印章和字。
(function () {
  if (typeof S === 'undefined' || typeof ctx === 'undefined') return;
  const DIR = 'r193f/', V = '?v=1', now = () => performance.now() / 1000, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const KEYS = ['rain', 'fog', 'water_fx', 'line_hemp', 'line_cotton', 'line_ice_silk', 'line_dragon_sinew', 'line_hemp_tension', 'line_cotton_tension', 'line_ice_silk_tension', 'line_dragon_sinew_tension'];
  const UIK = [['scroll', DIR + 'ui_scroll'], ['btn', DIR + 'ui_btn'], ['btn_d', DIR + 'ui_btn_d']];
  const GD = 'r193g/', GK = ['dragonfly', 'butterfly', 'bee', 'kingfisher', 'egret', 'frog', 'fireflies', 'bamboo_leaf', 'peach_petals', 'all_depart', 'fish_lift', 'gear_icons', 'rarity', 'fish_book', 'unknown_fish', 'card_yellow_catfish', 'card_golden_carp', 'card_jade_dragon_carp', 'card_weed'];
  const JD = 'r193j/', JK = ['bg_mao', 'bg_wu', 'bg_you', 'bg_xu', 'bg_zi', 'fg', 'hero_idle', 'hero_cast', 'hero_fight', 'rod', 'rod_bell', 'shadow_s', 'shadow_m', 'shadow_l', 'shadow_gold', 'shadow_hooked',
    'btn_main_normal', 'btn_main_down', 'btn_main_glow', 'btn_left_normal', 'btn_left_down', 'btn_left_glow', 'btn_right_normal', 'btn_right_down', 'btn_right_glow', 'box_gear_normal', 'box_gear_hover', 'tag_quit_normal', 'tag_quit_down',
    'closeup_frame', 'closeup_mask', 'seal_stamp', 'caption_ink'];
  const FK = ['idle', 'crucian', 'minnow', 'shrimp', 'grass_carp', 'carp', 'yellow_catfish', 'perch', 'koi', 'silver_scale', 'starfish', 'salamander', 'golden_carp', 'turtle', 'jade_dragon_carp', 'debris'];
  const IM = {}, DARK = {}; let loading = null, GS = null, JS = null, FS = null;
  const toBmp = im => (window.createImageBitmap ? createImageBitmap(im).catch(() => im) : Promise.resolve(im));
  function loadOne(key, src) { return new Promise(res => { const i = new Image(); i.onload = () => toBmp(i).then(b => { IM[key] = b; res(); }); i.onerror = () => res(); i.src = src; }); }
  function darken(key, k) { const im = IM[key]; if (!im) return; const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(14,22,44,${k})`; g.fillRect(0, 0, c.width, c.height); DARK[key] = c; }
  const json = (p, f) => fetch(p).then(r => r.json()).then(f).catch(() => {});
  function load() { if (!loading) loading = Promise.all(KEYS.map(k => loadOne(k, DIR + k + '.webp' + V)).concat(UIK.map(([k, p]) => loadOne(k, p + '.webp?v=1')), GK.map(k => loadOne('g_' + k, GD + k + '.webp?v=1')),
    JK.map(k => loadOne('j_' + k, JD + k + '.webp?v=1')), FK.map(k => loadOne('f_' + k, JD + 'float/' + k + '.webp?v=1')),
    json(GD + 'sheet.json?v=1', j => { GS = j.assets; }), json(JD + 'sheet.json?v=1', j => { JS = j; }), json(JD + 'float/sheet.json?v=1', j => { FS = j.assets; }))); return loading; }
  const dark = key => { if (!DARK[key]) darken(key, .42); return DARK[key] || IM[key]; };
  const ready = () => !!(JS && FS && IM.j_bg_wu && IM.j_hero_idle && IM.j_rod && IM.f_idle && IM.scroll && IM.water_fx);
  // ---------- 时辰调光：人、竿、铃、前景叶按 recommended_time_tint 乘一层色（提前做好一份，画的时候不用滤镜）----------
  const SHK = { 卯: 'mao', 午: 'wu', 酉: 'you', 戌: 'xu', 子: 'zi' }, TC = {};
  function tint(key, shi) { const im = IM[key]; if (!im || !JS) return im; const c = (JS.recommended_time_tint || {})[SHK[shi]]; if (!c || (c[0] >= 1 && c[1] >= 1 && c[2] >= 1)) return im;
    const ck = key + shi; if (TC[ck]) return TC[ck]; const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(${c.map(v => Math.round(v * 255)).join(',')})`; g.fillRect(0, 0, cv.width, cv.height); g.globalCompositeOperation = 'destination-in'; g.drawImage(im, 0, 0); return (TC[ck] = cv); }
  const SHI = () => (S.flags && S.flags.qz_shi) || '午', night = s => s === '戌' || s === '子';
  const JA = k => JS && JS.assets[k];
  // ---------- 几何（R193J water / preview_layout）----------
  const HERO = [960, 620], ROD_ANCHOR = [352, 430];
  const POLY = [[190, 82], [1115, 82], [1200, 245], [1135, 383], [956, 442], [789, 515], [621, 606], [330, 608], [180, 497], [120, 329]];
  const EXCL = [[[750, 505], [1280, 455], [1280, 720], [680, 720]], [[0, 554], [303, 554], [334, 720], [0, 720]]];
  const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const inWater = (x, y) => inPoly(x, y, POLY) && !EXCL.some(E => inPoly(x, y, E));
  const kAt = y => clamp(.4 + (y - 70) * .00062, .36, .76);   // 浮漂远小近大：预览里 y 325 是 0.56
  const LAYY = y => y < 230 ? 2 : y < 430 ? 1 : 0;
  // 人物这一帧（待着 / 甩竿 / 搏鱼）+ 竿帧
  function pose(ST, t) { const hc = JA('hero_cast'), map = hc ? hc.rod_frame_map : [0, 7, 6, 7, 8, 0];
    if (ST.fight) { const r = clamp(ST.fight.ten / ST.fight.cap, 0, 1); return { a: 'hero_fight', i: Math.floor(t * 6) % 4, rf: 1 + Math.round(r * 4) }; }
    if (ST.lift) return { a: 'hero_fight', i: 2, rf: 3 };
    if (ST.ph === 'aim' && ST.holding) { const i = ST.pow < .3 ? 1 : 2; return { a: 'hero_cast', i, rf: map[i] }; }
    if (ST.castT && t - ST.castT < .45) { const i = Math.min(5, 3 + Math.floor((t - ST.castT) / .15)); return { a: 'hero_cast', i, rf: map[i] }; }
    const fb = ST.ph === 'bite' && ST.fa && floatFrame(ST.fa, t - ST.fa0); return { a: 'hero_idle', i: Math.floor(t * 8) % 8, rf: fb && fb.f.black_float ? 1 : 0 }; }
  function rig(ST, t) { const p = pose(ST, t), A = JA(p.a), R = JA('rod'); if (!A || !R) return { p, tip: [677, 219], grip: [844, 464] };
    const fr = A.frames[p.i] || A.frames[0], hx = HERO[0] - A.anchor[0], hy = HERO[1] - A.anchor[1], gx = hx + fr.grip[0], gy = hy + fr.grip[1], rf = R.frames[p.rf] || R.frames[0];
    return { p, A, fr, hx, hy, gx, gy, rx: gx - ROD_ANCHOR[0], ry: gy - ROD_ANCHOR[1], rf, tip: [gx - ROD_ANCHOR[0] + rf.tip[0], gy - ROD_ANCHOR[1] + rf.tip[1]] }; }
  function tipOf(ST, t) { const r = rig(ST, t); return [r.tip[0], r.tip[1]]; }
  // ---------- 浮漂动画（R193I3）----------
  const FID = { yellowcat: 'yellow_catfish', gold_carp: 'golden_carp', dragon_carp: 'jade_dragon_carp' };
  const floatKey = f => !f ? 'idle' : f.junk ? 'debris' : (FID[f.id] || f.id);
  function floatFrame(key, u) { const a = FS && FS[key]; if (!a) return null; let n = Math.floor(Math.max(0, u) * a.fps); const end = n >= a.frame_count; n = a.loop ? n % a.frame_count : Math.min(a.frame_count - 1, n); return { a, n, f: a.frames[n], end }; }
  // 画一支浮漂：(x,y) 是水线上的落点；返回线拴的那一点（黑漂时拴在水线）
  function drawFloatAt(key, u, x, y, k, g) { const r = floatFrame(key, u), im = g ? IM['f_' + key] : tint('f_' + key, SHI()); if (!r || !im) return [x, y - 60 * k]; const f = r.f, [ax, ay] = f.anchor || r.a.anchor, m = f.motion_xy || [0, 0], [sx, sy, sw, sh] = f.rect;
    const ox = x + (m[0] - ax) * k, oy = y + (m[1] - ay) * k; (g || ctx).drawImage(im, sx, sy, sw, sh, ox, oy, sw * k, sh * k);
    const p = (!f.black_float && f.tip_xy) || f.contact_xy || [ax, ay]; return [ox + p[0] * k, oy + p[1] * k]; }
  // ---------- 水下鱼影：只是气氛（不是目标），在各自那层水里慢慢游 ----------
  const SHD = { s: { im: 'shadow_s', k: .75, op: .26, v: 34, lay: 0 }, m: { im: 'shadow_m', k: .7, op: .27, v: 26, lay: 1 }, l: { im: 'shadow_l', k: .9, op: .24, v: 17, lay: 2 }, gold: { im: 'shadow_gold', k: .55, op: .2, v: 22, lay: 1 } };
  const BAND = [[440, 600], [240, 420], [95, 222]];
  function randIn(lay) { for (let i = 0; i < 40; i++) { const y = BAND[lay][0] + Math.random() * (BAND[lay][1] - BAND[lay][0]), x = 150 + Math.random() * 1000; if (inWater(x, y)) return [x, y]; } return [560, BAND[lay][0] + 40]; }
  function initShadows(ST) { const L = [], add = (k, n) => { for (let i = 0; i < n; i++) { const d = SHD[k], p = randIn(d.lay); L.push({ d, x: p[0], y: p[1], tg: randIn(d.lay), ph: Math.random() * 8, fl: 0, a: 0 }); } };
    add('s', 3); add('m', 2); add('l', 1); if (SHI() === '午' && Math.random() < .4) add('gold', 1); ST.shd = L; }
  function scatterAt(ST, x, y) { for (const s of ST.shd || []) { const d = Math.hypot(s.x - x, s.y - y); if (d < 230) { s.fl = 1.6; const a = Math.atan2(s.y - y, s.x - x); let tx = s.x + Math.cos(a) * 260, ty = s.y + Math.sin(a) * 90; ty = clamp(ty, BAND[s.d.lay][0], BAND[s.d.lay][1]); s.tg = inWater(tx, ty) ? [tx, ty] : randIn(s.d.lay); } } }
  function drawShadows(ST, t, dt, dk) { if (!ST.shd) initShadows(ST); for (const s of ST.shd) { const d = s.d, A = JA(d.im), im = IM['j_' + d.im]; if (!A || !im) continue;
      const dx = s.tg[0] - s.x, dy = s.tg[1] - s.y, dist = Math.hypot(dx, dy); if (dist < 12) s.tg = randIn(d.lay);
      const sp = d.v * (s.fl > 0 ? 3.2 : .7 + .5 * Math.sin(t * .7 + s.ph)) * (kAt(s.y) / .56); s.fl = Math.max(0, s.fl - dt);
      if (dist > 1) { s.x += dx / dist * sp * dt; s.y += dy / dist * sp * dt * .6; } const want = Math.atan2(dy * .6, dx); let da = want - s.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; s.a += da * Math.min(1, dt * 2.2);
      const n = Math.floor((t + s.ph) * A.fps * (s.fl > 0 ? 2 : 1)) % A.frame_count, [cw, ch] = A.cell_size, k = d.k * kAt(s.y) / .56, left = Math.cos(s.a) < 0;
      ctx.save(); ctx.globalAlpha = d.op * (dk ? .6 : 1); ctx.translate(s.x, s.y); ctx.rotate(left ? s.a - Math.PI : s.a); if (left) ctx.scale(-1, 1); ctx.scale(1, .75);
      ctx.drawImage(im, n * cw, 0, cw, ch, -A.anchor[0] * k, -A.anchor[1] * k, cw * k, ch * k); ctx.restore(); } }
  function drawHooked(ST, t, dk) { const A = JA('shadow_hooked'), im = IM.j_shadow_hooked, s = ST.fight; if (!A || !im || !s) return; const n = Math.floor(t * A.fps * (s.burst > 0 ? 1.6 : 1)) % A.frame_count, [cw, ch] = A.cell_size;
    const big = s.f.junk ? .5 : clamp(.55 + s.f.t * .14, .55, 1.15), k = big * kAt(ST.fy) / .56, left = s.dir < 0;
    ctx.save(); ctx.globalAlpha = (s.f.junk ? .22 : .42) * (dk ? .7 : 1); ctx.translate(ST.fx, ST.fy + 10 * k); if (left) ctx.scale(-1, 1); ctx.rotate(-.12); ctx.scale(1, .75); ctx.drawImage(im, n * cw, 0, cw, ch, -A.anchor[0] * k, -A.anchor[1] * k, cw * k, ch * k); ctx.restore(); }
  // ---------- 小工具 ----------
  const ROD_ROW = {}, LINE_IM = { line_hemp: 'line_hemp', line_silk: 'line_cotton', line_ice: 'line_ice_silk', line_jiao: 'line_dragon_sinew' };
  const WF = { small: [0, 8, 8, 0, 72], large: [1, 10, 6, 0, 72], bubbles: [2, 8, 8, 0, 72], gold: [3, 8, 12, 0, 72], silver: [4, 8, 12, 0, 72], vortex: [5, 12, 8, 0, 72], muddy: [6, 8, 6, 0, 72], petals: [7, 8, 6, 0, 72], wake: [8, 8, 12, 0, 72], dash: [9, 8, 16, 0, 94], breach: [10, 8, 16, 0, 94] };
  const FXMAP = { wake: 'wake', ripple_s: 'small', ripple_b: 'large', bubbles: 'bubbles', gold: 'gold', silver: 'silver', whirl: 'vortex', weed: 'muddy', petals: 'petals', lotus: 'small', jump_s: 'dash', scatter: 'dash', ring: 'small', splash: 'small', burst: 'dash', leap: 'breach', tail: 'breach' };
  const FXSCALE = { jump_s: .45, scatter: .6, ring: .55, splash: .7, burst: .8, tail: .7 };
  function cell(im, col, row, cw, ch, x, y, ax, ay, k, al, flip) { if (!im) return; ctx.save(); if (al != null) ctx.globalAlpha = al; ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.drawImage(im, col * cw, row * ch, cw, ch, -ax * k, -ay * k, cw * k, ch * k); ctx.restore(); }
  function img(key, cx, cy, k = 1, al, op) { const im = IM['j_' + key]; if (!im) return; ctx.save(); if (al != null) ctx.globalAlpha = al; if (op) ctx.globalCompositeOperation = op; ctx.drawImage(im, cx - im.width * k / 2, cy - im.height * k / 2, im.width * k, im.height * k); ctx.restore(); }
  function drawLine(x0, y0, x1, y1, lineId, ten) { const base = IM[LINE_IM[lineId] || 'line_hemp'], hot = IM[(LINE_IM[lineId] || 'line_hemp') + '_tension'], len = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(x1 - x0, y1 - y0);
    if (!base) return; ctx.save(); ctx.translate(x0, y0); ctx.rotate(-a); const w = 3, sc = w / 8;
    const seg = im => { for (let d = 0; d < len; d += 64 * sc) { const h = Math.min(64, (len - d) / sc); ctx.drawImage(im, 0, 0, 8, h, -w / 2, d, w, h * sc); } };
    seg(base); if (ten > .35 && hot) { ctx.globalAlpha = clamp((ten - .35) / .5, 0, 1); seg(hot); } ctx.restore(); }
  // 线：竿梢到浮漂顶，中间垂一点（松线时更垂）
  function sagLine(x0, y0, x1, y1, lineId, ten, sag) { const n = 10; let px = x0, py = y0; for (let i = 1; i <= n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag; drawLine(px, py, x, y, lineId, ten); px = x; py = y; } }
  // ---------- 主画面 ----------
  let lastT = 0;
  function draw(ST, t, H2) { const shi = SHI(), g = H2.gear(), wx = H2.wx(), dk = night(shi), dt = clamp(t - lastT, 0, .05); lastT = t;
    ctx.drawImage(IM['j_bg_' + SHK[shi]] || IM.j_bg_wu, 0, 0, W, H);
    if (wx === '雷雨' && ST.flashT && t > ST.flashT && t - ST.flashT < .18) { ctx.fillStyle = 'rgba(230,240,255,.35)'; ctx.fillRect(0, 0, W, H); }
    if (!/gear|book|guide/.test(ST.ph)) drawShadows(ST, t, dt, dk);
    if (ST.fight) drawHooked(ST, t, dk);
    // 水面涟漪
    for (let i = ST.fxs.length - 1; i >= 0; i--) { const q = ST.fxs[i], m = WF[FXMAP[q.k] || 'small']; if (!m) { ST.fxs.splice(i, 1); continue; } const n = Math.floor((t - q.t0) * m[2]); if (n >= m[1]) { ST.fxs.splice(i, 1); continue; }
      cell(IM.water_fx, n, m[0], 256, 128, q.x, q.y, 128, m[4], kAt(q.y) * 1.5 * (FXSCALE[q.k] || 1) * (q.k === 'leap' || q.k === 'tail' ? 1.2 : 1), dk ? .7 : .9, q.flip); }
    const R = rig(ST, t), [tx, ty] = R.tip;
    // 浮漂：飞出去 → 落水 → 待着（idle 循环）→ 鱼来了（这种鱼自己的动法）
    const ct = ST.castT ? t - ST.castT : 9, fly = ST.ph === 'aim' && ct < .32, showF = !ST.fight && !ST.lift && (ST.ph === 'wait' || ST.ph === 'bite' || (ST.ph === 'aim' && ST.castT && !fly));
    let top = null; const k = kAt(ST.fy);
    if (fly) { const u = ct / .32, fx = tx + (ST.fx - tx) * u, fy = ty + (ST.fy - ty) * u - Math.sin(u * Math.PI) * 110; top = drawFloatAt('idle', 0, fx, fy, kAt(Math.max(fy, ST.fy))); }
    if (showF) top = drawFloatAt(ST.fa || 'idle', t - (ST.fa0 || 0), ST.fx, ST.fy, k);
    drawCreatures(ST, t, g, dk, 'water'); drawLift(ST, t, g, dk);
    // 线
    if (!/gear|book|guide/.test(ST.ph) && !(ST.ph === 'aim' && !ST.castT && !ST.holding)) { const ten = ST.fight ? clamp(ST.fight.ten / ST.fight.cap, 0, 1.2) : 0, wob = ten > .7 ? Math.sin(t * 60) * 1.2 : 0;
      let e = top || [ST.fx, ST.fy]; if (ST.fight) e = [ST.fx, ST.fy]; if (ST.lift && ST.lift.mx != null) e = [ST.lift.mx, ST.lift.my];
      if (!(ST.ph === 'aim' && ST.holding)) sagLine(tx, ty, e[0] + wob, e[1], g.line, ten, ST.fight ? (ST.fight.slack > .4 ? 30 : 4 * (1 - ten)) : fly ? 0 : 14);
      if (ST.fight && t - (ST.wakeT || 0) > .2) { ST.wakeT = t; ST.fxs.push({ k: ST.fight.burst > 0 ? 'dash' : 'wake', x: ST.fx, y: ST.fy, t0: t, flip: ST.fight.dir < 0 }); } }
    // 竿 → 人 → 铃
    { const im = tint('j_rod', shi), rf = R.rf; if (im && rf) ctx.drawImage(im, rf.rect[0], rf.rect[1], rf.rect[2], rf.rect[3], R.rx, R.ry, rf.rect[2], rf.rect[3]); }
    { const im = tint('j_' + R.p.a, shi), fr = R.fr; if (im && fr) ctx.drawImage(im, fr.rect[0], fr.rect[1], fr.rect[2], fr.rect[3], R.hx, R.hy, fr.rect[2], fr.rect[3]); }
    { const B = JA('rod_bell'), im = tint('j_rod_bell', shi); if (B && im) { const ten = ST.fight ? clamp(ST.fight.ten / ST.fight.cap, 0, 1) : 0, fb = ST.ph === 'bite' && ST.fa && floatFrame(ST.fa, t - ST.fa0), ring = ten > .15 || (fb && fb.f.black_float);
        const sh = B.animations.shake, n = ring ? sh.frames[Math.floor(t * sh.fps * (.6 + ten)) % sh.frames.length] : 0, sc = .65, [cw, ch] = B.cell_size;
        ctx.drawImage(im, n * cw, 0, cw, ch, tx + 3 - B.anchor[0] * sc, ty + 8 - B.anchor[1] * sc, cw * sc, ch * sc); } }
    drawCreatures(ST, t, g, dk, 'tip');
    // 雾、雨、前景竹叶
    if (wx === '雾' || shi === '卯') { const off = (t * 5) % 1280; ctx.save(); ctx.globalAlpha = wx === '雾' ? .75 : .3; ctx.drawImage(IM.fog, -off, 0, W, H); ctx.save(); ctx.translate(2 * W - off, 0); ctx.scale(-1, 1); ctx.drawImage(IM.fog, 0, 0, W, H); ctx.restore(); ctx.restore(); }
    if (wx === '雨' || wx === '雷雨') { const f = Math.floor(t * 8) % 4; ctx.save(); ctx.globalAlpha = wx === '雷雨' ? .9 : .65; ctx.drawImage(IM.rain, (f % 2) * 1280, Math.floor(f / 2) * 720, 1280, 720, 0, 0, W, H); ctx.restore(); }
    drawUI(ST, t, H2, dk, top, k);
  }
  // ---------- R193G 小生物：征兆出现时上场，飞进 → 停 / 绕 → 飞走 ----------
  const CR = { dragonfly: { im: 'dragonfly', at: 'tip', k: .4, seq: [['arrive'], ['perch', 4.5], ['depart']] }, butterfly: { im: 'butterfly', at: 'tip', k: .38, seq: [['arrive'], ['perch', 4.5], ['depart']] },
    bee: { im: 'bee', at: 'tip', k: .4, seq: [['arrive'], ['orbit', 3.2], ['depart']] }, kingfisher: { im: 'kingfisher', at: 'pos', k: .42, pos: () => [430 + Math.random() * 300, 150 + Math.random() * 60], seq: [['hover', 2.6], ['depart']] },
    egret: { im: 'egret', at: 'pos', k: .36, pos: () => [150, 470], seq: [['wade', 1.2], ['takeoff']], layer: 'water' }, frog_quiet: { im: 'frog', at: 'pos', k: .4, pos: () => [262, 520], seq: [['idle', 1.6], ['jump']], layer: 'water' },
    croak: { im: 'frog', at: 'pos', k: .4, pos: () => [262, 520], seq: [['idle', 3.2], ['jump']], layer: 'water' }, fireflies: { im: 'fireflies', at: 'float', k: .6, seq: [['gather', 4]], night: 1, layer: 'water', glow: 1 },
    leaf: { im: 'bamboo_leaf', at: 'float', dx: 1, k: .4, seq: [['fall']], hold: 1.4, layer: 'water' }, petals: { im: 'peach_petals', at: 'float', dx: 1, k: .44, seq: [['fall']], hold: 1.6, layer: 'water' },
    all_fly: { im: 'all_depart', at: 'tip', k: .4, seq: [['alarm']] } };
  function rowOf(im, id) { const a = GS && GS[im]; return a && a.rows.find(r => r.id === id); }
  function spawn(k, ST) { const d = CR[k]; if (!d || !GS || !IM['g_' + d.im]) return; if (d.night && !night(SHI())) return;
    ST.crs = ST.crs || []; if (k === 'all_fly') ST.crs.forEach(c => scare(c));
    const p = d.at === 'pos' ? d.pos() : d.at === 'float' ? [ST.fx + (d.dx ? (Math.random() - .5) * 140 : 0), ST.fy + (d.dx ? Math.random() * 24 - 8 : 4)] : null;
    ST.crs.push({ k, d, p, i: 0, t0: now() }); }
  function scare(c) { const last = c.d.seq.length - 1; if (c.i < last && c.d.seq[last][1] == null && c.d.seq.length > 1) { c.i = last; c.t0 = now(); } }
  function scareAll(ST) { (ST.crs || []).forEach(scare); }
  function drawCreatures(ST, t, g, dk, layer) { const L = ST.crs; if (!L || !L.length) return; let tip = null;
    for (let j = L.length - 1; j >= 0; j--) { const c = L[j], d = c.d; if ((d.layer || 'tip') !== layer) continue; const step = d.seq[c.i], r = rowOf(d.im, step[0]); if (!r) { L.splice(j, 1); continue; }
      const a = GS[d.im], [cw, ch] = a.cell_size, u = t - c.t0, nf = r.frame_count; let n = Math.floor(u * r.fps), done;
      if (step[1] != null) { n = n % nf; done = u >= step[1]; } else { done = n >= nf; n = Math.min(nf - 1, n); }
      if (done) { if (c.i < d.seq.length - 1) { c.i++; c.t0 = t; } else if (!d.hold || u > nf / r.fps + d.hold) { L.splice(j, 1); continue; } }
      if (!c.p && !tip) tip = tipOf(ST, t); let [x, y] = c.p || tip; const mo = r.motion_xy && r.motion_xy[n] || [0, 0], an = (r.anchor_per_frame && r.anchor_per_frame[n]) || r.anchor, k = d.k;
      const fade = d.hold && step[1] == null && u > nf / r.fps ? clamp(1 - (u - nf / r.fps) / d.hold, 0, 1) : 1;
      const im = dk && !d.glow ? dark('g_' + d.im) : IM['g_' + d.im];
      ctx.save(); ctx.globalAlpha = fade; if (d.glow) ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(im, n * cw, r.row * ch, cw, ch, x + mo[0] * k - an[0] * k, y + mo[1] * k - an[1] * k, cw * k, ch * k); ctx.restore(); } }
  // ---------- 鱼被提出水面 ----------
  const LIFT_ID = { yellowcat: 'yellow_catfish', gold_carp: 'golden_carp', dragon_carp: 'jade_dragon_carp' };
  function drawLift(ST, t, g, dk) { const L = ST.lift; if (!L || !GS) return; const r = rowOf('fish_lift', LIFT_ID[L.id] || L.id); if (!r) return;
    const u = t - L.t0, n = Math.min(r.frame_count - 1, Math.floor(u * r.fps)), e = 1 - Math.pow(1 - clamp(u / 1, 0, 1), 3), [tx, ty] = tipOf(ST, t), k = kAt(L.y) * 1.3;
    const mx = L.x + (tx - L.x) * .25 * e, my = L.y - 130 * e * (L.id === 'turtle' ? .6 : 1) + (r.motion_y ? r.motion_y[n] : 0) * k, an = (r.anchor_per_frame && r.anchor_per_frame[n]) || r.anchor;
    L.mx = mx; L.my = my; ctx.drawImage(dk ? dark('g_fish_lift') : IM.g_fish_lift, n * 384, r.row * 384, 384, 384, mx - an[0] * k, my - an[1] * k, 384 * k, 384 * k); }
  // ---------- 图标 / 卡 ----------
  const ICO = { bait_worm: 0, bait_dough: 1, bait_leaf: 2, bait_redworm: 3, bait_lees: 4, bait_shrimp: 5, bait_fish: 6, bait_peach: 7, bait_firefly: 8, bait_rice: 9, bait_dragon: 10, line_hemp: 11, line_silk: 12, line_ice: 13, line_jiao: 14, rod_old: 15, rod_zi: 16, rod_xiang: 17, rod_ling: 18 };
  function icon(id, x, y, s) { const i = ICO[id]; if (i == null || !IM.g_gear_icons) return; ctx.drawImage(IM.g_gear_icons, (i % 5) * 128, Math.floor(i / 5) * 128, 128, 128, x, y, s, s); }
  function rank(t, x, y, s) { if (IM.g_rarity) ctx.drawImage(IM.g_rarity, t * 64, 0, 64, 64, x, y, s, s); }
  const CARD_NEW = { yellowcat: 'card_yellow_catfish', gold_carp: 'card_golden_carp', dragon_carp: 'card_jade_dragon_carp', weed: 'card_weed' }, CC = {};
  function cardArt(id) { const k = CARD_NEW[id]; if (!k || !IM['g_' + k]) return null; if (!CC[id]) { const c = document.createElement('canvas'); c.width = 384; c.height = 256; c.getContext('2d').drawImage(IM['g_' + k], 0, 0); CC[id] = c; } return CC[id]; }
  // ---------- 界面字 ----------
  const T = (s, x, y, size, col, font, al, edge) => { ctx.save(); if (al != null) ctx.globalAlpha = al; ctx.font = `${size}px ${font || BRUSH}`; ctx.textAlign = 'center'; textOutline(s, x, y, col || '#fff6dc', edge || 'rgba(10,26,36,.85)', Math.max(3, size / 7)); ctx.restore(); };
  // 墨痕字底（caption_ink），字压在上面
  let INK = null;   // caption_ink 图本身很淡（不透明度最高两成），叠四层再用
  function ink(cx, cy, w, al) { if (!INK && IM.j_caption_ink) { INK = document.createElement('canvas'); INK.width = 520; INK.height = 60; const g = INK.getContext('2d'); for (let i = 0; i < 4; i++) g.drawImage(IM.j_caption_ink, 0, 0); }
    const im = INK; if (!im || al <= 0) return; ctx.save(); ctx.globalAlpha = al; const h = 60 * w / 520 * 1.1; ctx.drawImage(im, cx - w / 2, cy - h / 2, w, h); ctx.restore(); }
  // ---------- 按钮（R193J 玉石按钮 / 钓具匣 / 收竿签）----------
  // on = 现在正起作用的那个（收线 / 松线），按下去的样子、字亮；dim = 另一个，淡一点
  function mainBtn(B, label, down, glow, t, k = 1, dim) { const cx = B.x + B.w / 2, cy = B.y + B.h / 2, dy = down ? 2 * k : 0;
    img(down ? 'btn_main_down' : 'btn_main_normal', cx, cy + dy, k, dim ? .8 : 1); if (glow) img('btn_main_glow', cx, cy + dy, k, .55 + .45 * Math.sin(t * 7), 'screen');
    T(label, cx, cy + 14 * k + dy, Math.round(44 * k), dim ? '#6a5a40' : '#3a2a14', BRUSH, 1, 'rgba(250,244,220,.75)'); }
  // 教学：该点的按钮外面一圈一圈往里收的红圈，旁边一只手指
  function tutRing(B, t) { const cx = B.x + B.w / 2, cy = B.y + B.h / 2, r0 = Math.max(B.w, B.h) / 2, u = (t * 1.4) % 1; ctx.save(); ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 4; ctx.globalAlpha = .9;
    if (B.w > B.h * 1.5) { ctx.beginPath(); ctx.roundRect(B.x - 6 - 14 * (1 - u), B.y - 6 - 14 * (1 - u), B.w + 12 + 28 * (1 - u), B.h + 12 + 28 * (1 - u), 16); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(cx, cy, r0 + 6 + 22 * (1 - u), 0, 7); ctx.stroke(); } ctx.restore();
    const hy = Math.sin(t * 6) * 6; ctx.save(); ctx.font = '44px serif'; ctx.textAlign = 'center'; ctx.fillText('👆', B.x - 30, cy + 34 + hy); ctx.restore(); }
  function sideBtn(B, side, down, glow, t) { const cx = B.x + B.w / 2, cy = B.y + B.h / 2, dy = down ? 2 : 0;
    img('btn_' + side + (down ? '_down' : '_normal'), cx, cy + dy); if (glow) img('btn_' + side + '_glow', cx, cy + dy, 1, .55 + .45 * Math.sin(t * 9), 'screen'); }
  function box(B, label, hov, t) { const cx = B.x + B.w / 2, cy = B.y + B.h / 2; img(hov ? 'box_gear_hover' : 'box_gear_normal', cx, cy); T(label, cx, B.y + B.h + 2, 20, '#fff3d6', BRUSH); }
  // 收竿签：图里竹牌在格子右半边（54,63），左边有一丝木匣的边，裁掉；放大 1.7 倍，字竖着写在牌上
  function tag(B, label, down) { const im = IM[down ? 'j_tag_quit_down' : 'j_tag_quit_normal'], cx = B.x + B.w / 2, cy = B.y + B.h / 2 + (down ? 2 : 0), k = 1.7; if (!im) return;
    ctx.drawImage(im, 22, 22, 50, 76, cx - 32 * k, cy - 41 * k, 50 * k, 76 * k);
    ctx.save(); ctx.font = `24px ${BRUSH}`; ctx.textAlign = 'center'; ctx.fillStyle = '#5a3210'; [...label].forEach((c, i) => ctx.fillText(c, cx, cy + 9 + (i - (label.length - 1) / 2) * 26)); ctx.restore(); }
  // 印章：盖下去（seal_stamp 6 帧），字是代码写的
  function seal(ST, t) { const s = ST.seal; if (!s) return; const u = t - s.t0; if (u > 1.1) { ST.seal = null; return; } const A = JA('seal_stamp'), im = IM.j_seal_stamp; if (!A || !im) return;
    const n = Math.min(5, Math.floor(u * 18)), al = u > .8 ? (1.1 - u) / .3 : 1, k = 1.15, x = 640, y = 420, [cw, ch] = A.cell_size;
    ctx.save(); ctx.globalAlpha = al; ctx.drawImage(im, n * cw, 0, cw, ch, x - cw * k / 2, y - ch * k / 2, cw * k, ch * k); ctx.globalAlpha = al * clamp((n - 1) / 3, 0, 1);
    ctx.font = `92px ${BRUSH}`; ctx.textAlign = 'center'; ctx.fillStyle = '#b82a22'; ctx.fillText(s.ch, x, y + 32); ctx.restore(); }
  // 浮漂特写：圆框里放大水面和浮漂（等鱼、看漂时才有，搏鱼时收起）
  let CU = null;
  function closeup(ST, t, top, k, dk) { const im = IM.j_closeup_frame, mk = IM.j_closeup_mask; if (!im || !mk) return; if (!CU) { CU = document.createElement('canvas'); CU.width = CU.height = 160; }
    const g = CU.getContext('2d'), z = 2.1, fr = floatFrame(ST.fa || 'idle', t - (ST.fa0 || 0)), mx = fr && fr.f.motion_xy ? fr.f.motion_xy[0] : 0, cx = ST.fx + mx * k, cy = ST.fy - 50 * k;   // 跟着浮漂横移（鳜鱼拖、灵鲵漂） g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 160, 160);
    g.drawImage(IM['j_bg_' + SHK[SHI()]] || IM.j_bg_wu, cx - 80 / z, cy - 80 / z, 160 / z, 160 / z, 0, 0, 160, 160);
    drawFloatAt(ST.fa || 'idle', t - (ST.fa0 || 0), 80 + (ST.fx - cx) * z, 80 + (ST.fy - cy) * z, k * z, g);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(mk, 0, 0, 160, 160); g.globalCompositeOperation = 'source-over';
    const X = 1168, Y = 176; ctx.save(); ctx.globalAlpha = .96; ctx.drawImage(CU, X - 80, Y - 80); ctx.restore(); ctx.drawImage(im, X - 80, Y - 80); }
  // 搏鱼：线力和鱼力（细细两条，压在墨痕上）
  function fightBars(ST, t) { const s = ST.fight, r = clamp(s.ten / s.cap, 0, 1.15), st = s.st0 ? s.st / s.st0 : 0, x = 470, w = 340, sh = r > .9 ? Math.sin(t * 70) * 2 : 0;
    ink(640, 664, 560, .85); ctx.save(); ctx.translate(sh, 0);
    const bar = (y, v, cols, label, tail, h) => { ctx.fillStyle = 'rgba(20,14,8,.65)'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4); const gr = ctx.createLinearGradient(x, 0, x + w, 0); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); ctx.fillStyle = gr; ctx.fillRect(x, y, w * clamp(v, 0, 1), h);
      ctx.fillStyle = 'rgba(255,248,220,.7)'; for (let i = 1; i < 5; i++) ctx.fillRect(x + w * i / 5 - 1, y - 2, 2, h + 4);
      ctx.font = `20px ${BRUSH}`; ctx.textAlign = 'right'; textOutline(label, x - 10, y + h, '#f4e8c8', 'rgba(10,20,26,.9)', 4); ctx.textAlign = 'left'; ctx.font = `600 15px ${FONT}`; textOutline(tail, x + w + 10, y + h, '#f4e8c8', 'rgba(10,20,26,.9)', 3); };
    bar(648, r, ['#9fd08a', '#e8d27a', '#f09a4a', '#e8462a'], '线', r > .85 ? '要断了' : r > .6 ? '吃紧' : '稳', 10);
    bar(670, st, ['#5a7a70', '#8fd0a8', '#c8f4d0'], '鱼', s.tired ? '没劲了' : '', 6); ctx.restore(); }
  function btn(r, label, down) { ctx.drawImage(down ? IM.btn_d : IM.btn, r.x, r.y, r.w, r.h); T(label, r.x + r.w / 2, r.y + r.h * (down ? .66 : .62), Math.round(r.h * .42), '#fff3d6'); }
  const LAYN = ['浅水', '潭心', '深水'];
  function drawUI(ST, t, H2, dk, top, k) { const g = H2.gear(), D = H2.D, P = H2.P, B = H2.BTN, F = S.flags || {}, b = D.bait(g.bait), scene = ST.ph === 'aim' || ST.ph === 'wait' || ST.ph === 'bite' || ST.ph === 'fight' || ST.ph === 'land';
    // 前景竹叶（盖在人和水上，按时辰调光）
    { const A = JA('fg'), im = tint('j_fg', SHI()); if (A && im) { const f = Math.floor(t * A.fps) % 4; ctx.drawImage(im, (f % 2) * 1280, Math.floor(f / 2) * 720, 1280, 720, 0, 0, W, H); } }
    if (ST.ph === 'gear') { ctx.save(); ctx.fillStyle = 'rgba(6,14,20,.4)'; ctx.fillRect(0, 0, W, H); ctx.drawImage(IM.scroll, 180, 70); ctx.restore();
      const ro = D.rod(g.rod), li = D.line(g.line), n = b ? itemCount(b.id) : 0, R = H2.rows;
      ctx.textAlign = 'center'; ctx.fillStyle = '#4a2a10'; ctx.font = `40px ${BRUSH}`; ctx.fillText('钓具匣', 640, 198);
      const row = (r, label, val, sub) => { const hov = P.inR(r); ctx.save(); if (hov) { ctx.fillStyle = 'rgba(160,120,60,.12)'; ctx.fillRect(r.x, r.y, r.w, r.h); } ctx.textAlign = 'left'; ctx.fillStyle = '#7a4a1a'; ctx.font = `26px ${BRUSH}`; ctx.fillText(label, r.x + 16, r.y + 34);
        if (r.ico) icon(r.ico, r.x + 66, r.y + 1, 44); ctx.fillStyle = '#3a2410'; ctx.font = `600 22px ${FONT}`; ctx.fillText(val, r.x + (r.ico ? 120 : 80), r.y + 33); ctx.textAlign = 'right'; ctx.fillStyle = '#8a6a48'; ctx.font = `16px ${FONT}`; ctx.fillText(sub, r.x + r.w - 16, r.y + 32); ctx.restore(); };
      R.rod.ico = g.rod; R.line.ico = g.line; R.bait.ico = b && n ? b.id : null;
      row(R.rod, '竿', ro.name, (g.rods.length > 1 ? '点一下换 · ' : '') + (ro.far >= 2 ? '抛得到深水' : '只到潭心') + (ro.tough ? ' · 卸力 ' + Math.round(ro.tough * 100) + '%' : ''));
      row(R.line, '线', li.name, (g.lines.length > 1 ? '点一下换 · ' : '') + '承重 ' + li.cap);
      row(R.bait, '饵', b && n ? b.name + ' ×' + n : '没有饵了', b && n ? '点一下换 · ' + b.k + '饵' + (b.like.length ? ' · 招' + b.like.map(i => D.fish(i).name).join('、') : '') : '');
      ctx.textAlign = 'center'; ctx.fillStyle = '#6a4a2a'; ctx.font = `18px ${FONT}`; ctx.fillText(SHI() + '时 · ' + H2.wx() + (H2.wx() === '雾' ? ' · 雾天灵鲵爱出来' : H2.wx() === '雷雨' ? ' · 雷雨夜，潭底有东西不安分' : ''), 640, 466);
      btn(R.go, b && n ? '去钓台' : '没有饵', P.down && P.inR(R.go)); if (R.book) btn(R.book, '鱼谱', P.down && P.inR(R.book));
      for (const e of R.extra || []) { const hv = P.inR(e); ctx.save(); ctx.fillStyle = hv ? 'rgba(122,74,26,.22)' : 'rgba(122,74,26,.12)'; ctx.strokeStyle = 'rgba(122,74,26,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(e.x, e.y, e.w, e.h, 8); ctx.fill(); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillStyle = '#5a3412'; ctx.font = `22px ${BRUSH}`; ctx.fillText(e.label, e.x + e.w / 2, e.y + 28); ctx.restore(); } btn(B.gq, '不钓了', P.down && P.inR(B.gq)); btn(B.help, '？玩法', P.down && P.inR(B.help)); }
    if (ST.ph === 'book') { drawBook(ST, t, H2); return; }
    if (ST.ph === 'guide') { drawGuide(ST, t, H2); return; }
    if (!scene) return;
    // 蓄力：水面上一圈落点，跟着力度往远处走；旧竹竿够不着深水
    if (ST.ph === 'aim' && ST.holding && ST.aimPt) { const [x, y] = ST.aimPt, kk = kAt(y), pul = 1 + .06 * Math.sin(t * 10); ctx.save(); ctx.globalAlpha = .7; ctx.strokeStyle = '#fff8e0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, y, 60 * kk * pul, 17 * kk * pul, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = .35; ctx.beginPath(); ctx.ellipse(x, y, 90 * kk, 26 * kk, 0, 0, 7); ctx.stroke(); ctx.restore(); T(LAYN[LAYY(y)], x, y - 34 * kk - 8, 24, '#fff3d6'); }
    // 甩竿：三个按钮，点哪个甩到哪一层（深水在上、浅水在下，跟画面远近一致）
    if (ST.ph === 'aim' && !ST.castT && !ST.holding) { T('甩到哪儿？', 1140, 474, 24, '#fff3d6');
      [['a2', '深水', '3'], ['a1', '潭心', '2'], ['a0', '浅水', '1']].forEach(([k2, n2, key]) => { const r = B[k2], no = k2 === 'a2' && ST.maxP < 1; ctx.save(); if (no) ctx.globalAlpha = .55; btn(r, no ? '深水（竿短）' : n2, no || (P.down && P.inR(r))); ctx.restore(); }); }
    // 搏鱼按钮在右下；平时只有主按钮
    const held = H2.held(), s = ST.fight;
    if (ST.ph === 'wait' || ST.ph === 'bite') mainBtn(B.main, '提竿', P.down && P.inR(B.main), false, t);
    if (ST.ph === 'fight' && s) { const hot = s.burst > 0 && !s.tired, need = hot ? -s.dir : 0, loose = s.warn > 0 || hot;
      mainBtn(B.main, '收线', held, !held && !loose, t, 1, !held); mainBtn(B.loose, '松线', !held, held && loose, t, .68, held);
      { const ab = held ? B.main : B.loose; img('btn_main_glow', ab.x + ab.w / 2, ab.y + ab.h / 2 + 2 * (held ? 1 : .68), held ? 1 : .68, .5, 'screen'); }   // 正起作用的那个亮着
      T(held ? '正在收线' : '线松着', 1125, 430, 18, held ? '#d8f4b0' : '#ffd27a', FONT, .95);
      sideBtn(B.L, 'left', ST.drag === -1, need === -1 && ST.drag !== -1, t); sideBtn(B.R, 'right', ST.drag === 1, need === 1 && ST.drag !== 1, t);
      if (s.warn > 0 && !ST._warn) ST.seal = { t0: t, ch: '松' }; ST._warn = s.warn > 0; fightBars(ST, t);
      if (hot) T(s.dir < 0 ? '鱼往左冲 → 点右边「带」' : '鱼往右冲 → 点左边「带」', 1125, 400, 19, '#ffe3a0', FONT, .95);
      if (s.tired) { ink(640, 250, 420, .7); T(held ? '它没力气了，拉上来！' : '它没力气了，点「收线」！', 640, 262, 30, '#d8f4b0'); } else if (s.slack > 1) { ink(640, 250, 420, .7); T('线松太久要脱钩——点「收线」', 640, 262, 26, '#ffd27a'); } }
    // 钓具匣（回去换竿线饵）和收竿签
    if (ST.ph === 'aim' || ST.ph === 'wait' || ST.ph === 'bite') { box(B.box, '钓具匣', P.inR(B.box), t); tag(B.tag, ST.ph === 'aim' ? '不钓' : '收竿', P.down && P.inR(B.tag));
      if (b) { icon(b.id, B.box.x + 4, B.box.y - 30, 44); ctx.save(); ctx.font = `600 17px ${FONT}`; ctx.textAlign = 'left'; textOutline(b.name + ' ×' + itemCount(b.id), B.box.x + 48, B.box.y - 2, '#fff3d6', 'rgba(10,20,26,.9)', 3); ctx.restore(); } }
    // 特写圆框
    if ((ST.ph === 'wait' || ST.ph === 'bite' || (ST.ph === 'aim' && ST.castT && t - ST.castT > .32)) && !ST.fight && !ST.lift) closeup(ST, t, top, k, dk);
    // 「玩法」按钮：随时翻图文说明
    if (ST.ph !== 'fight' && ST.ph !== 'land') btn(B.help, '？玩法', P.down && P.inR(B.help));
    // 教学（头一回）：该点哪个按钮就圈哪个，上面一句话；之后头几回只留一行小字
    if (ST.tut) { if (ST.tutBtn && B[ST.tutBtn]) tutRing(B[ST.tutBtn], t);
      const m = ST.ph === 'aim' ? (ST.castT ? '' : '第一步：点「潭心」，把钩甩到潭中间') : ST.ph === 'wait' ? '第二步：等。盯着右上角放大的浮漂，它不动就别点' : ST.tutMsg || '';
      if (m) { ink(640, 560, 760, .9); T(m, 640, 570, 28, '#fff3d6'); } }
    else if (!F.r193_n || F.r193_n < 8) { const tip = ST.ph === 'aim' ? '点「浅水 / 潭心 / 深水」甩竿；不同的鱼待在不同的水层' : ST.ph === 'wait' ? '盯着浮漂（右上角放大了）。没动静别点「提竿」' : ST.ph === 'bite' ? '轻点多是试口；顿下、没入、上送、拖走——点「提竿」' : ST.ph === 'fight' ? '水面一鼓就点「松线」，冲完再点「收线」；往它冲的反方向带' : '';
      if (tip) { ink(640, H - 92, 700, .55); T(tip, 640, H - 86, 18, '#f2ead2', FONT, .95); } }
    if (ST.cap && t - ST.cap.t0 < 3.4) { const u = t - ST.cap.t0, al = Math.min(1, u / .2, (3.4 - u) / .8); ink(640, 104, 460, al * .9); T(ST.cap.s, 640, 114, 30, '#fbf3dc', BRUSH, al); }
    if (ST.msg && t < ST.msgT) { ink(640, 330, 560, .8); T(ST.msg, 640, 344, 38, '#ffe39a'); }
    seal(ST, t);
  }
  // ---------- 图文玩法说明：四页，每页一张游戏里的图（r193j/guide）+ 红圈标出要看 / 要点的地方 + 两句话；第三页是三支浮漂并排动 ----------
  const GUIDE = [
    { t: '一 · 甩竿', im: 'guide1', marks: [[.806, .689, .16, .3, '点一个']], lines: ['右下角三个按钮：点哪个，钩就甩到哪一层水。', '浅水多小鱼，深水才有大鱼——旧竹竿够不着深水。'] },
    { t: '二 · 等鱼、看漂', im: 'guide2', marks: [[.912, .245, .075, .13, '放大的浮漂'], [.88, .875, .07, .12, '动了再点']], lines: ['右上角圆框里是放大的浮漂。它不动，就什么都别点。', '浮漂一动——轻轻点几下是鱼在试口，先忍住。'] },
    { t: '三 · 什么时候点「提竿」', floats: [['crucian', '鲫鱼', '轻点三下，然后一顿', '顿下去那一下点'], ['grass_carp', '草鱼', '不打招呼，直接沉没', '一沉就点'], ['carp', '鲤鱼', '慢慢往上顶起来', '顶起来就点']], lines: ['每种鱼咬钩，浮漂动法都不一样——认出来，就知道底下是什么。', '点早了鱼吓跑（饵还在）；点晚了饵被吃掉。钓到过的鱼，鱼谱里记着它的动法。'] },
    { t: '四 · 搏鱼', im: 'guide4', marks: [[.785, .783, .115, .2, ''], [.785, .435, .085, .15, '要冲了点这个'], [.653, .817, .05, .09, '带'], [.917, .817, .05, .09, '带']], lines: ['鱼上钩后自动在收线。水面一鼓、盖出红「松」字——马上点「松线」，不然线断。', '它冲完了再点「收线」。它往哪边冲，就点另一边的「带」，它累得快。'] }];
  for (const k of ['guide1', 'guide2', 'guide4']) JK.push('guide/' + k);
  function drawGuide(ST, t, H2) { const P = H2.P, B = H2.BTN, i = ST.gi || 0, G = GUIDE[i]; ctx.save(); ctx.fillStyle = 'rgba(6,14,20,.55)'; ctx.fillRect(0, 0, W, H); ctx.drawImage(IM.scroll, 111, 26, 1058, 667); ctx.restore();   // 卷轴放大一点，图才看得清
    ctx.textAlign = 'center'; ctx.fillStyle = '#4a2a10'; ctx.font = `36px ${BRUSH}`; ctx.fillText(G.t, 640, 152);
    const X = 360, Y = 166, Wd = 560, Hd = 315;
    if (G.im) { const im = IM['j_guide/' + G.im]; if (im) ctx.drawImage(im, X, Y, Wd, Hd); ctx.strokeStyle = 'rgba(90,52,18,.8)'; ctx.lineWidth = 3; ctx.strokeRect(X, Y, Wd, Hd);
      for (const [mx, my, rw, rh, lab] of G.marks) { const cx = X + mx * Wd, cy = Y + my * Hd, pul = 1 + .08 * Math.sin(t * 6); ctx.save(); ctx.strokeStyle = '#e8402a'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(cx, cy, rw * Wd * pul, rh * Hd * pul, 0, 0, 7); ctx.stroke(); ctx.restore();
        if (lab) T(lab, clamp(cx, X + 70, X + Wd - 70), cy - rh * Hd - 12, 24, '#fff', BRUSH, 1, 'rgba(160,30,20,.95)'); } }
    if (G.floats) { const u = (t - (ST.g0 || 0)) % 4.2; G.floats.forEach(([k, n, how, when], j) => { const cx = X + Wd * (j + .5) / 3, a = FS && FS[k], bgim = IM.j_bg_wu;
        ctx.save(); ctx.beginPath(); ctx.rect(cx - 80, Y, 160, 220); ctx.clip(); if (bgim) ctx.drawImage(bgim, 520, 280, 160, 220, cx - 80, Y, 160, 220); if (a) drawFloatAt(k, Math.max(0, u - .8), cx, Y + 150, 1, ctx); ctx.restore();
        ctx.strokeStyle = 'rgba(90,52,18,.8)'; ctx.lineWidth = 3; ctx.strokeRect(cx - 80, Y, 160, 220);
        ctx.fillStyle = '#3a2410'; ctx.font = `26px ${BRUSH}`; ctx.fillText(n, cx, Y + 252); ctx.font = `600 16px ${FONT}`; ctx.fillStyle = '#5a3a1a'; ctx.fillText(how, cx, Y + 277); ctx.fillStyle = '#b8301c'; ctx.font = `700 17px ${FONT}`; ctx.fillText('▶ ' + when, cx, Y + 302); }); }
    ctx.fillStyle = '#3a2410'; ctx.font = `600 17px ${FONT}`; G.lines.forEach((l, j) => ctx.fillText(l, 640, 520 + j * 25));
    for (let j = 0; j < 4; j++) { ctx.fillStyle = j === i ? '#b8301c' : 'rgba(122,74,26,.35)'; ctx.beginPath(); ctx.arc(610 + j * 20, 495, 5, 0, 7); ctx.fill(); }
    const nb = B.gnext, pb = B.gprev; btn(nb, i >= 3 ? '开始钓' : '下一页', P.down && P.inR(nb)); if (i > 0) btn(pb, '上一页', P.down && P.inR(pb));
    T('电脑也可以用键盘：空格 = 大按钮　S = 松线　A / D = 左右带　1 2 3 = 浅水 / 潭心 / 深水', 640, 682, 17, '#f2ead2', FONT, .95); }
  // ---------- 鱼谱：左页鱼像（没钓到是灰墨剪影），右页名字、等级、出没、见过的征兆 ----------
  const SHN = { 卯: '卯时', 午: '午时', 酉: '酉时', 戌: '戌时', 子: '子时' };
  function drawBook(ST, t, H2) { const D = H2.D, f = D.FISH[ST.bi || 0], F = S.flags || {}, got = !!(F.r175_book && F.r175_book[f.id] != null), seen = (F.r193_sg && F.r193_sg[f.id]) || [];
    ctx.fillStyle = 'rgba(6,12,16,.6)'; ctx.fillRect(0, 0, W, H); ctx.drawImage(IM.g_fish_book, 0, 0, W, H);
    const art = got ? (cardArt(f.id) || H2.cardArt(f.id)) : null, L = [130, 130, 408, 418];
    if (art) { const s = Math.min(L[2] / art.width, L[3] / art.height) * .95; ctx.drawImage(art, L[0] + (L[2] - art.width * s) / 2, L[1] + (L[3] - art.height * s) / 2, art.width * s, art.height * s); }
    else if (IM.g_unknown_fish) { const s = L[2] / 384 * .85; ctx.save(); ctx.globalAlpha = .8; ctx.drawImage(IM.g_unknown_fish, L[0] + (L[2] - 384 * s) / 2, L[1] + (L[3] - 256 * s) / 2, 384 * s, 256 * s); ctx.restore(); }
    const x = 742, w = 393; let y = 182; ctx.textAlign = 'left'; ctx.fillStyle = '#3a2410'; ctx.font = `44px ${BRUSH}`; ctx.fillText(got ? f.name : '？？？', x + 6, y);
    rank(f.t, x + w - 70, y - 50, 64); ctx.textAlign = 'right'; ctx.font = `600 18px ${FONT}`; ctx.fillStyle = '#7a5a30'; ctx.fillText(D.TIERS[f.t], x + w - 78, y - 10);
    ctx.textAlign = 'left'; y += 22; ctx.fillStyle = 'rgba(122,90,48,.35)'; ctx.fillRect(x, y, w, 2); y += 40;
    const ln = (a, b) => { ctx.font = `22px ${BRUSH}`; ctx.fillStyle = '#7a4a1a'; ctx.fillText(a, x + 6, y); ctx.font = `600 19px ${FONT}`; ctx.fillStyle = '#3a2410'; wrap(b, x + 76, y, w - 80, 26); };
    const wrap = (s2, x2, y2, mw, lh) => { let line = '', yy = y2; for (const ch of s2) { if (ctx.measureText(line + ch).width > mw) { ctx.fillText(line, x2, yy); line = ch; yy += lh; } else line += ch; } ctx.fillText(line, x2, yy); y = yy; };
    ln('时辰', [...f.shi].map(c => SHN[c] || c).join('、')); y += 40; ln('水层', f.lay.map(i => LAYN[i]).join('、')); y += 40;
    if (got) { const likes = D.BAITS.filter(b => b.like.indexOf(f.id) >= 0).map(b => b.name); ln('爱吃', likes.length ? likes.join('、') : '不挑'); y += 40;
      ctx.font = `600 16px ${FONT}`; ctx.fillStyle = '#8a6a48'; ctx.fillText('最大一尾　' + (F.r175_book[f.id] ? F.r175_book[f.id] + ' 寸' : '—'), x + 6, y); y += 40; }
    ln('征兆', seen.length ? seen.map(k => (D.SIGNS[k] || {}).name).filter(Boolean).join('；') : got ? '还没留意过' : '还没钓到，说不清');
    if (got && FS) { const a = FS[floatKey(f)]; if (a && a.description) { y += 40; ln('看漂', a.description); } }
    ctx.textAlign = 'center'; ctx.font = `600 18px ${FONT}`; ctx.fillStyle = '#7a5a30'; ctx.fillText((ST.bi + 1) + ' / ' + D.FISH.length + '　点左页上一条、右页下一条', 640, 612);
    btn(H2.BTN.gq, '合上', H2.P.down && H2.P.inR(H2.BTN.gq)); }
  window.R193_ART = { load, ready, draw, tipOf, kAt, spawn, scareAll, scatterAt, cardArt, icon, inWater, floatKey, floatFrame, LAYY, sheet: () => FS };
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (name) { if (name === 'qingzhu_upper_pavilion' && window.R193_ON) { try { load(); } catch (e) {} } return o.apply(this, arguments); })(tileSetMap);
})();
