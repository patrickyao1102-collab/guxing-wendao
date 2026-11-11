// ================= R193 · 潭边垂钓：画面（Codex R193F 素材）=================
// 背景 → 瀑布流光 → 雨 → 水面效果 → 浮漂 → 雾 → 前景竹叶 → 线 → 竿，顺序照 R193F sheet.json 的 render_order。
// 图全部提前读好并转成 ImageBitmap；夜里的竿和竹叶提前压暗一份，画的时候不用滤镜。
// R193G：竿梢 / 水面小生物（征兆）、鱼被提出水面、钓具图标、等级玉牌、新鱼卡、鱼谱底图。
(function () {
  if (typeof S === 'undefined' || typeof ctx === 'undefined') return;
  const DIR = 'r193f/', V = '?v=1', now = () => performance.now() / 1000, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const KEYS = ['bg_mao', 'bg_wu', 'bg_you', 'bg_xu', 'bg_zi', 'rain', 'fog', 'fg', 'waterfall', 'rods', 'float', 'water_fx', 'line_hemp', 'line_cotton', 'line_ice_silk', 'line_dragon_sinew', 'line_hemp_tension', 'line_cotton_tension', 'line_ice_silk_tension', 'line_dragon_sinew_tension'];
  const UIK = [['scroll', DIR + 'ui_scroll'], ['btn', DIR + 'ui_btn'], ['btn_d', DIR + 'ui_btn_d']];
  const GD = 'r193g/', GK = ['dragonfly', 'butterfly', 'bee', 'kingfisher', 'egret', 'frog', 'fireflies', 'bamboo_leaf', 'peach_petals', 'all_depart', 'fish_lift', 'gear_icons', 'rarity', 'fish_book', 'unknown_fish', 'card_yellow_catfish', 'card_golden_carp', 'card_jade_dragon_carp', 'card_weed'];
  const IM = {}, DARK = {}; let loading = null, GS = null;
  const toBmp = im => (window.createImageBitmap ? createImageBitmap(im).catch(() => im) : Promise.resolve(im));
  function loadOne(key, src) { return new Promise(res => { const i = new Image(); i.onload = () => toBmp(i).then(b => { IM[key] = b; res(); }); i.onerror = () => res(); i.src = src; }); }
  function darken(key, k) { const im = IM[key]; if (!im) return; const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(14,22,44,${k})`; g.fillRect(0, 0, c.width, c.height); DARK[key] = c; }
  function load() { if (!loading) loading = Promise.all(KEYS.map(k => loadOne(k, DIR + k + '.webp' + V)).concat(UIK.map(([k, p]) => loadOne(k, p + '.webp?v=1')), GK.map(k => loadOne('g_' + k, GD + k + '.webp?v=1')),
    fetch(GD + 'sheet.json?v=1').then(r => r.json()).then(j => { GS = j.assets; }).catch(() => {}))).then(() => { darken('rods', .45); darken('fg', .5); }); return loading; }
  const dark = key => { if (!DARK[key]) darken(key, .42); return DARK[key] || IM[key]; };
  const ready = () => KEYS.every(k => IM[k]) && IM.scroll;
  // 几何：竿柄放在 (1268,714)，格子里的握柄锚点 (608,608)
  const HANDLE = [1268, 714], GRIP = 608;
  const TIPS = [[[81, 81], [80, 102], [80, 130], [83, 189], [82, 266], [102, 395], [246, 88], [299, 66], [480, 53]], [[81, 71], [75, 97], [75, 146], [100, 174], [118, 290], [126, 346], [229, 43], [334, 27], [490, 15]],
    [[76, 54], [84, 79], [80, 121], [109, 134], [135, 271], [110, 315], [251, 28], [328, 12], [471, 5]], [[94, 79], [93, 107], [93, 151], [100, 185], [144, 289], [145, 360], [248, 54], [310, 34], [461, 13]]];
  const ROD_ROW = { rod_old: 0, rod_zi: 1, rod_xiang: 2, rod_ling: 3 }, LINE_IM = { line_hemp: 'line_hemp', line_silk: 'line_cotton', line_ice: 'line_ice_silk', line_jiao: 'line_dragon_sinew' };
  const FL = { idle: [0, 8, 6, 1], dot: [1, 6, 10, 0], dun: [2, 6, 12, 0], dun2: [2, 6, 14, 0], dun_drag: [2, 6, 12, 0], black: [3, 8, 8, 0], yank: [3, 8, 14, 0], sink: [3, 8, 4, 0], sink_slow: [3, 8, 3, 0], rise: [4, 8, 6, 0], drift: [5, 8, 8, 0], drift_far: [5, 8, 6, 0], drag_slow: [5, 8, 4, 0], still: [0, 1, 1, 0], entry: [6, 8, 14, 0] };
  // 水面效果 [行, 帧数, 帧率, 循环, 锚点 y]
  const WF = { small: [0, 8, 8, 0, 72], large: [1, 10, 6, 0, 72], bubbles: [2, 8, 8, 0, 72], gold: [3, 8, 12, 0, 72], silver: [4, 8, 12, 0, 72], vortex: [5, 12, 8, 0, 72], muddy: [6, 8, 6, 0, 72], petals: [7, 8, 6, 0, 72], wake: [8, 8, 12, 0, 72], dash: [9, 8, 16, 0, 94], breach: [10, 8, 16, 0, 94] };
  const FXMAP = { wake: 'wake', ripple_s: 'small', ripple_b: 'large', bubbles: 'bubbles', gold: 'gold', silver: 'silver', whirl: 'vortex', weed: 'muddy', petals: 'petals', lotus: 'small', jump_s: 'dash', scatter: 'dash', ring: 'small', splash: 'small', burst: 'dash', leap: 'breach', tail: 'breach' };
  const FXSCALE = { jump_s: .45, scatter: .6, ring: .55, splash: .7, burst: .8, tail: .7 };
  const FTOP = [[23, 26, 30, 26, 21, 21, 20, 21], [33, 40, 50, 38, 33, 30, 140, 140], [33, 53, 90, 68, 52, 32, 140, 140], [20, 47, 67, 87, 101, 140, 140, 140], [52, 44, 34, 26, 27, 20, 14, 8], [26, 27, 28, 28, 24, 24, 24, 24], [20, 25, 28, 27, 24, 26, 20, 20]];   // 每格浮漂顶端（线拴在这）
  const BG = { 卯: 'bg_mao', 午: 'bg_wu', 酉: 'bg_you', 戌: 'bg_xu', 子: 'bg_zi' };
  const night = s => s === '戌' || s === '子';
  const kAt = y => .36 + .5 * clamp((y - 330) / 310, 0, 1);   // 浮漂远小近大
  function rodFrame(ST, t) { if (ST.ph === 'aim' && ST.holding) return ST.pow < .34 ? 6 : ST.pow < .67 ? 7 : 8;
    if (ST.castT && t - ST.castT < .2) return 8; if (ST.fight) return 1 + Math.round(clamp(ST.fight.ten / ST.fight.cap, 0, 1) * 4);
    if (ST.ph === 'bite' && /black|yank|dun|drag|sink/.test(ST.flt)) return 1; return 0; }
  function tipOf(ST, t, rodId) { const r = ROD_ROW[rodId] || 0, f = rodFrame(ST, t), tp = TIPS[r][f]; return [HANDLE[0] - GRIP + tp[0], HANDLE[1] - GRIP + tp[1], r, f]; }
  function cell(im, col, row, cw, ch, x, y, ax, ay, k, al, flip) { if (!im) return; ctx.save(); if (al != null) ctx.globalAlpha = al; ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.drawImage(im, col * cw, row * ch, cw, ch, -ax * k, -ay * k, cw * k, ch * k); ctx.restore(); }
  function drawLine(x0, y0, x1, y1, lineId, ten) { const base = IM[LINE_IM[lineId] || 'line_hemp'], hot = IM[(LINE_IM[lineId] || 'line_hemp') + '_tension'], len = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(x1 - x0, y1 - y0);
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(-a); const w = 5, sc = w / 8;
    const seg = im => { for (let d = 0; d < len; d += 64 * sc) { const h = Math.min(64, (len - d) / sc); ctx.drawImage(im, 0, 0, 8, h, -w / 2, d, w, h * sc); } };
    seg(base); if (ten > .35 && hot) { ctx.globalAlpha = clamp((ten - .35) / .5, 0, 1); seg(hot); } ctx.restore(); }
  function draw(ST, t, H2) { const shi = (S.flags && S.flags.qz_shi) || '午', g = H2.gear(), wx = H2.wx(), dk = night(shi);
    ctx.drawImage(IM[BG[shi]] || IM.bg_wu, 0, 0, W, H);
    { const f = Math.floor(t * 8) % 4; ctx.save(); ctx.globalAlpha = dk ? .14 : .28; ctx.drawImage(IM.waterfall, (f % 2) * 256, Math.floor(f / 2) * 256, 256, 256, 947 - 128 * .58, 272 - 220 * .76, 256 * .58, 256 * .76); ctx.restore(); }
    if (wx === '雨' || wx === '雷雨') { const f = Math.floor(t * 8) % 4; ctx.save(); ctx.globalAlpha = wx === '雷雨' ? .95 : .7; ctx.drawImage(IM.rain, (f % 2) * 1280, Math.floor(f / 2) * 720, 1280, 720, 0, 0, W, H); ctx.restore();
      if (wx === '雷雨' && (Math.floor(t * 10) % 97) === 0) { ctx.fillStyle = 'rgba(230,240,255,.35)'; ctx.fillRect(0, 0, W, H); } }
    // 水面效果
    for (let i = ST.fxs.length - 1; i >= 0; i--) { const q = ST.fxs[i], m = WF[FXMAP[q.k] || 'small']; if (!m) { ST.fxs.splice(i, 1); continue; } const n = Math.floor((t - q.t0) * m[2]); if (n >= m[1]) { ST.fxs.splice(i, 1); continue; }
      cell(IM.water_fx, n, m[0], 256, 128, q.x, q.y, 128, m[4], kAt(q.y) * 2.4 * (FXSCALE[q.k] || 1) * (q.k === 'leap' || q.k === 'tail' ? 1.2 : 1), null, q.flip); }
    // 浮漂（搏鱼时不画，换成水线）
    const ct = ST.castT ? t - ST.castT : 9, fly = ST.ph === 'aim' && ct < .3, showF = ST.ph === 'wait' || ST.ph === 'bite' || (ST.ph === 'aim' && ST.castT && !fly);
    let fx = ST.fx, fy = ST.fy, topY = fy; const k = kAt(fy);
    if (fly) { const [tx0, ty0] = tipOf(ST, t, g.rod), u = ct / .3; fx = tx0 + (ST.fx - tx0) * u; fy = ty0 + (ST.fy - ty0) * u - Math.sin(u * Math.PI) * 120; topY = fy; cell(IM.float, 0, 0, 96, 192, fx, fy, 48, 140, kAt(Math.max(ST.fy, fy))); }
    if (ST.ph === 'wait' || ST.ph === 'bite') { const u = t - ST.flt0; if (/drift|drag_slow/.test(ST.flt)) fx += Math.min(1, u / (ST.flt === 'drift_far' ? 1.6 : 1)) * (ST.flt === 'drift_far' ? 70 : 34) * k * (ST.fdir || 1); }
    if (showF) { const a = ct >= .3 && ct < .9 ? 'entry' : ST.flt, m = FL[a] || FL.idle, u = t - (a === 'entry' ? ST.castT + .3 : ST.flt0); let n = Math.floor(u * m[2]); n = m[3] ? n % m[1] : Math.min(m[1] - 1, n);
      cell(IM.float, n, m[0], 96, 192, fx, fy, 48, 140, k); topY = fy + (FTOP[m[0]][n] - 140) * k + 2; }
    drawCreatures(ST, t, g, dk, 'water'); drawLift(ST, t, g, dk);
    if (wx === '雾' || shi === '卯') { const off = (t * 5) % 1280; ctx.save(); ctx.globalAlpha = wx === '雾' ? .9 : .4; ctx.drawImage(IM.fog, -off, 0, W, H); ctx.save(); ctx.translate(2 * W - off, 0); ctx.scale(-1, 1); ctx.drawImage(IM.fog, 0, 0, W, H); ctx.restore(); ctx.restore(); }
    { const f = Math.floor(t * 2) % 4, im = dk ? DARK.fg : IM.fg; ctx.drawImage(im, (f % 2) * 1280, Math.floor(f / 2) * 720, 1280, 720, 0, 0, W, H); }
    // 线和竿
    const [tx, ty, row, frm] = tipOf(ST, t, g.rod);
    if (ST.ph !== 'gear' && ST.ph !== 'book' && !(ST.ph === 'aim' && !ST.castT)) { const ten = ST.fight ? clamp(ST.fight.ten / ST.fight.cap, 0, 1.2) : 0, wob = ten > .7 ? Math.sin(t * 60) * 1.5 : 0;
      let ex = ST.ph === 'fight' ? ST.fx : fx, ey = ST.ph === 'fight' ? ST.fy : topY; if (ST.lift && ST.lift.mx != null) { ex = ST.lift.mx; ey = ST.lift.my; } drawLine(tx, ty, ex + wob, ey, g.line, ten);
      if (ST.ph === 'fight' && t - (ST.wakeT || 0) > .18) { ST.wakeT = t; ST.fxs.push({ k: ST.fight && ST.fight.burst > 0 ? 'dash' : 'wake', x: ST.fx, y: ST.fy, t0: t, flip: ST.fight && ST.fight.dir < 0 }); } }
    { const im = dk ? DARK.rods : IM.rods; ctx.drawImage(im, frm * 640, row * 640, 640, 640, HANDLE[0] - GRIP, HANDLE[1] - GRIP, 640, 640); }
    drawCreatures(ST, t, g, dk, 'tip');
    drawUI(ST, t, H2, dk);
  }
  // ---------- R193G 小生物：征兆出现时上场，飞进 → 停 / 绕 → 飞走 ----------
  // at: tip = 跟着竿梢（竿弯了也跟着）；pos = 固定在水面某处。seq: [行 id, 停留秒数（循环行）]
  const CR = { dragonfly: { im: 'dragonfly', at: 'tip', k: .62, seq: [['arrive'], ['perch', 4.5], ['depart']] }, butterfly: { im: 'butterfly', at: 'tip', k: .56, seq: [['arrive'], ['perch', 4.5], ['depart']] },
    bee: { im: 'bee', at: 'tip', k: .58, seq: [['arrive'], ['orbit', 3.2], ['depart']] }, kingfisher: { im: 'kingfisher', at: 'pos', k: .55, pos: () => [470 + Math.random() * 240, 190 + Math.random() * 50], seq: [['hover', 2.6], ['depart']] },
    egret: { im: 'egret', at: 'pos', k: .42, pos: () => [96, 520], seq: [['wade', 1.2], ['takeoff']], layer: 'water' }, frog_quiet: { im: 'frog', at: 'pos', k: .5, pos: () => [318, 530], seq: [['idle', 1.6], ['jump']], layer: 'water' },
    croak: { im: 'frog', at: 'pos', k: .5, pos: () => [318, 530], seq: [['idle', 3.2], ['jump']], layer: 'water' }, fireflies: { im: 'fireflies', at: 'float', k: .8, seq: [['gather', 4]], night: 1, layer: 'water', glow: 1 },
    leaf: { im: 'bamboo_leaf', at: 'float', dx: 1, k: .5, seq: [['fall']], hold: 1.4, layer: 'water' }, petals: { im: 'peach_petals', at: 'float', dx: 1, k: .55, seq: [['fall']], hold: 1.6, layer: 'water' },
    all_fly: { im: 'all_depart', at: 'tip', k: .55, seq: [['alarm']] } };
  function rowOf(im, id) { const a = GS && GS[im]; return a && a.rows.find(r => r.id === id); }
  function spawn(k, ST) { const d = CR[k]; if (!d || !GS || !IM['g_' + d.im]) return; const shi = (S.flags && S.flags.qz_shi) || '午'; if (d.night && !night(shi)) return;
    ST.crs = ST.crs || []; if (k === 'all_fly') ST.crs.forEach(c => scare(c));
    const p = d.at === 'pos' ? d.pos() : d.at === 'float' ? [ST.fx + (d.dx ? (Math.random() - .5) * 160 : 0), ST.fy + (d.dx ? Math.random() * 30 - 10 : 4)] : null;
    ST.crs.push({ k, d, p, i: 0, t0: now() }); }
  function scare(c) { const last = c.d.seq.length - 1; if (c.i < last && c.d.seq[last][1] == null && c.d.seq.length > 1) { c.i = last; c.t0 = now(); } }
  function scareAll(ST) { (ST.crs || []).forEach(scare); }
  function drawCreatures(ST, t, g, dk, layer) { const L = ST.crs; if (!L || !L.length) return;
    for (let j = L.length - 1; j >= 0; j--) { const c = L[j], d = c.d; if ((d.layer || 'tip') !== layer) continue; const step = d.seq[c.i], r = rowOf(d.im, step[0]); if (!r) { L.splice(j, 1); continue; }
      const a = GS[d.im], [cw, ch] = a.cell_size, u = t - c.t0, nf = r.frame_count; let n = Math.floor(u * r.fps), done;
      if (step[1] != null) { n = n % nf; done = u >= step[1]; } else { done = n >= nf; n = Math.min(nf - 1, n); }
      if (done) { if (c.i < d.seq.length - 1) { c.i++; c.t0 = t; } else if (!d.hold || u > nf / r.fps + d.hold) { L.splice(j, 1); continue; } }
      let [x, y] = c.p || tipOf(ST, t, g.rod); const mo = r.motion_xy && r.motion_xy[n] || [0, 0], an = (r.anchor_per_frame && r.anchor_per_frame[n]) || r.anchor, k = d.k;
      const fade = d.hold && step[1] == null && u > nf / r.fps ? clamp(1 - (u - nf / r.fps) / d.hold, 0, 1) : 1;
      const im = dk && !d.glow ? dark('g_' + d.im) : IM['g_' + d.im];
      ctx.save(); ctx.globalAlpha = fade; if (d.glow) ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(im, n * cw, r.row * ch, cw, ch, x + mo[0] * k - an[0] * k, y + mo[1] * k - an[1] * k, cw * k, ch * k); ctx.restore(); } }
  // ---------- 鱼被提出水面 ----------
  const LIFT_ID = { yellowcat: 'yellow_catfish', gold_carp: 'golden_carp', dragon_carp: 'jade_dragon_carp' };
  function drawLift(ST, t, g, dk) { const L = ST.lift; if (!L || !GS) return; const r = rowOf('fish_lift', LIFT_ID[L.id] || L.id); if (!r) return;
    const u = t - L.t0, n = Math.min(r.frame_count - 1, Math.floor(u * r.fps)), e = 1 - Math.pow(1 - clamp(u / 1, 0, 1), 3), [tx, ty] = tipOf(ST, t, g.rod), k = kAt(L.y) * 1.6;
    const mx = L.x + (tx - L.x) * .18 * e, my = L.y - 150 * e * (L.id === 'turtle' ? .6 : 1) + (r.motion_y ? r.motion_y[n] : 0) * k, an = (r.anchor_per_frame && r.anchor_per_frame[n]) || r.anchor;
    L.mx = mx; L.my = my; ctx.drawImage(dk ? dark('g_fish_lift') : IM.g_fish_lift, n * 384, r.row * 384, 384, 384, mx - an[0] * k, my - an[1] * k, 384 * k, 384 * k); }
  // ---------- 图标 / 卡 ----------
  const ICO = { bait_worm: 0, bait_dough: 1, bait_leaf: 2, bait_redworm: 3, bait_lees: 4, bait_shrimp: 5, bait_fish: 6, bait_peach: 7, bait_firefly: 8, bait_rice: 9, bait_dragon: 10, line_hemp: 11, line_silk: 12, line_ice: 13, line_jiao: 14, rod_old: 15, rod_zi: 16, rod_xiang: 17, rod_ling: 18 };
  function icon(id, x, y, s) { const i = ICO[id]; if (i == null || !IM.g_gear_icons) return; ctx.drawImage(IM.g_gear_icons, (i % 5) * 128, Math.floor(i / 5) * 128, 128, 128, x, y, s, s); }
  function rank(t, x, y, s) { if (IM.g_rarity) ctx.drawImage(IM.g_rarity, t * 64, 0, 64, 64, x, y, s, s); }
  const CARD_NEW = { yellowcat: 'card_yellow_catfish', gold_carp: 'card_golden_carp', dragon_carp: 'card_jade_dragon_carp', weed: 'card_weed' }, CC = {};
  function cardArt(id) { const k = CARD_NEW[id]; if (!k || !IM['g_' + k]) return null; if (!CC[id]) { const c = document.createElement('canvas'); c.width = 384; c.height = 256; c.getContext('2d').drawImage(IM['g_' + k], 0, 0); CC[id] = c; } return CC[id]; }
  // ---------- 界面字 ----------
  const T = (s, x, y, size, col, font, al) => { ctx.save(); if (al != null) ctx.globalAlpha = al; ctx.font = `${size}px ${font || BRUSH}`; ctx.textAlign = 'center'; textOutline(s, x, y, col || '#fff6dc', 'rgba(10,26,36,.85)', Math.max(3, size / 7)); ctx.restore(); };
  // 一条两头淡出去的墨色底，字压在上面看得清
  function band(cx, cy, w, h, al) { if (al <= 0) return; ctx.save(); ctx.globalAlpha = al; const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g.addColorStop(0, 'rgba(12,24,30,0)'); g.addColorStop(.2, 'rgba(12,24,30,.9)'); g.addColorStop(.8, 'rgba(12,24,30,.9)'); g.addColorStop(1, 'rgba(12,24,30,0)'); ctx.fillStyle = g; ctx.fillRect(cx - w / 2, cy - h / 2, w, h); ctx.restore(); }
  // 搏鱼时的线力：竹节样的一条，过了七成变琥珀、过了承重变红并抖
  function gauge(s, t) { const r = clamp(s.ten / s.cap, 0, 1.15), x = 440, y = 628, w = 400, h = 12, sh = r > .9 ? Math.sin(t * 70) * 2 : 0;
    ctx.save(); ctx.translate(sh, 0); band(640, y + 6, 520, 40, .45); ctx.fillStyle = 'rgba(30,22,12,.7)'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#9fd08a'); g.addColorStop(.65, '#e8d27a'); g.addColorStop(.85, '#f09a4a'); g.addColorStop(1, '#e8462a'); ctx.fillStyle = g; ctx.fillRect(x, y, w * Math.min(1, r), h);
    ctx.fillStyle = 'rgba(255,248,220,.85)'; for (let i = 1; i < 5; i++) ctx.fillRect(x + w * i / 5 - 1, y - 3, 2, h + 6);
    ctx.font = `20px ${BRUSH}`; ctx.textAlign = 'right'; textOutline('线', x - 12, y + 12, '#f4e8c8', 'rgba(10,20,26,.9)', 4); ctx.restore(); }
  function btn(r, label, down) { ctx.drawImage(down ? IM.btn_d : IM.btn, r.x, r.y, r.w, r.h); T(label, r.x + r.w / 2, r.y + r.h * (down ? .66 : .62), Math.round(r.h * .42), '#fff3d6'); }
  function drawUI(ST, t, H2, dk) { const g = H2.gear(), D = H2.D, P = H2.P;
    if (ST.ph === 'gear') { ctx.save(); ctx.fillStyle = 'rgba(6,14,20,.35)'; ctx.fillRect(0, 0, W, H); ctx.drawImage(IM.scroll, 180, 70); ctx.restore();
      const ro = D.rod(g.rod), li = D.line(g.line), b = D.bait(g.bait), n = b ? itemCount(b.id) : 0, R = H2.rows;
      ctx.textAlign = 'center'; ctx.fillStyle = '#4a2a10'; ctx.font = `40px ${BRUSH}`; ctx.fillText('钓具匣', 640, 198);
      const row = (r, label, val, sub) => { const hov = P.inR(r); ctx.save(); if (hov) { ctx.fillStyle = 'rgba(160,120,60,.12)'; ctx.fillRect(r.x, r.y, r.w, r.h); } ctx.textAlign = 'left'; ctx.fillStyle = '#7a4a1a'; ctx.font = `26px ${BRUSH}`; ctx.fillText(label, r.x + 16, r.y + 34);
        if (r.ico) icon(r.ico, r.x + 66, r.y + 1, 44); ctx.fillStyle = '#3a2410'; ctx.font = `600 22px ${FONT}`; ctx.fillText(val, r.x + (r.ico ? 120 : 80), r.y + 33); ctx.textAlign = 'right'; ctx.fillStyle = '#8a6a48'; ctx.font = `16px ${FONT}`; ctx.fillText(sub, r.x + r.w - 16, r.y + 32); ctx.restore(); };
      R.rod.ico = g.rod; R.line.ico = g.line; R.bait.ico = b && n ? b.id : null;
      row(R.rod, '竿', ro.name, (g.rods.length > 1 ? '点一下换 · ' : '') + (ro.far >= 2 ? '抛得到深水' : '只到潭心') + (ro.tough ? ' · 卸力 ' + Math.round(ro.tough * 100) + '%' : ''));
      row(R.line, '线', li.name, (g.lines.length > 1 ? '点一下换 · ' : '') + '承重 ' + li.cap);
      row(R.bait, '饵', b && n ? b.name + ' ×' + n : '没有饵了', b && n ? '点一下换 · ' + b.k + '饵' + (b.like.length ? ' · 招' + b.like.map(i => D.fish(i).name).join('、') : '') : '');
      ctx.textAlign = 'center'; ctx.fillStyle = '#6a4a2a'; ctx.font = `18px ${FONT}`; ctx.fillText(((S.flags && S.flags.qz_shi) || '午') + '时 · ' + H2.wx() + (H2.wx() === '雾' ? ' · 雾天灵鲵爱出来' : H2.wx() === '雷雨' ? ' · 雷雨夜，潭底有东西不安分' : ''), 640, 456);
      btn(R.go, b && n ? '去钓台' : '没有饵', P.down && P.inR(R.go)); if (R.book) btn(R.book, '鱼谱', P.down && P.inR(R.book)); btn(H2.BTN.quit, '不钓了', P.down && P.inR(H2.BTN.quit)); }
    if (ST.ph === 'book') drawBook(ST, t, H2);
    if (ST.ph === 'aim') { const hint = ST.holding ? ['浅水', '潭心', '深水'][ST.pow < .38 ? 0 : ST.pow < .72 ? 1 : 2] + (ST.pow > .95 ? ' · 松手！' : '') : '按住蓄力，松手抛竿';
      T(hint, 640, H - 44, 30, '#fff1c8'); if (ST.holding) { const y = 640 - 310 * ST.pow, k = kAt(y); ctx.save(); ctx.globalAlpha = .55; ctx.strokeStyle = '#fff8e0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(640, y, 46 * k * 2, 13 * k * 2, 0, 0, 7); ctx.stroke(); ctx.restore(); } }
    if (ST.ph === 'wait' && (!S.flags.r193_n || S.flags.r193_n < 6)) T('看水面、看浮漂 · 往下一划可以收竿重抛', 640, H - 30, 20, '#f2ead2', FONT, .85);
    if (ST.ph === 'bite' && (!S.flags.r193_n || S.flags.r193_n < 6)) T('浮漂真沉下去时，往上一划（或按空格）', 640, H - 30, 22, '#ffe9b0', FONT);
    if (ST.ph === 'fight' && ST.fight) { const s = ST.fight; gauge(s, t); if (s.warn > 0) T('它要冲了——松手！', 640, 250, 36, '#ffb08a'); else if (s.tired) T('它没力气了，收线！', 640, 250, 32, '#c8f0a0');
      if (!S.flags.r193_n || S.flags.r193_n < 6) T('按住收线 · 水面一鼓就松手 · 往它反方向拖', 640, H - 30, 18, '#f2ead2', FONT, .85); }
    if (ST.ph === 'book') return;
    if (ST.cap && t - ST.cap.t0 < 3.4) { const u = t - ST.cap.t0, al = Math.min(1, u / .2, (3.4 - u) / .8); band(640, 116, 420, 54, al * .55); T(ST.cap.s, 640, 128, 30, '#fbf3dc', BRUSH, al); }
    if (ST.msg && t < ST.msgT) T(ST.msg, 640, 360, 42, '#ffe39a');
    if (ST.ph === 'aim' || ST.ph === 'wait') btn(H2.BTN.quit, '收竿', P.down && P.inR(H2.BTN.quit));
  }
  // ---------- 鱼谱：左页鱼像（没钓到是灰墨剪影），右页名字、等级、出没、见过的征兆 ----------
  const SHN = { 卯: '卯时', 午: '午时', 酉: '酉时', 戌: '戌时', 子: '子时' }, LAYN = ['浅水', '潭心', '深水'];
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
    ctx.textAlign = 'center'; ctx.font = `600 18px ${FONT}`; ctx.fillStyle = '#7a5a30'; ctx.fillText((ST.bi + 1) + ' / ' + D.FISH.length + '　点左页上一条、右页下一条', 640, 612);
    btn(H2.BTN.quit, '合上', H2.P.down && H2.P.inR(H2.BTN.quit)); }
  window.R193_ART = { load, ready, draw, tipOf, kAt, spawn, scareAll, cardArt, icon };
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (name) { if (name === 'qingzhu_upper_pavilion' && window.R193_ON) { try { load(); } catch (e) {} } return o.apply(this, arguments); })(tileSetMap);
})();
