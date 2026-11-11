// ================= R209 · 行囊「玄青星图」暗色皮（作者 11-11：白玉宣纸那版保留，另做一个暗色厚重、神话气息的作为切换）=================
// 美术：Codex R206 A 方向拆件（80 张无字透明件 @2x，r209/*.webp）；所有字都由代码写。坐标、点击区一律沿用现有行囊（R201）的，不另起。
// 底：打开行囊那一刻把当前地图拍一张 → 只虚化地图 → 压暗 → 半透明幕（curtain_9）→ 面板、星纹 → 内容。
// 切换：行囊右上「关闭」下面的小签（玄青 / 白玉），记在本机；测试面板里也能切。换装页照旧用现在的衣柜界面（只是外框跟着换）。
(function () {
  const N = ['avatar_empty', 'avatar_n', 'avatar_name_blank', 'avatar_s', 'bar_exp_9', 'bar_hp_9', 'bar_mp_9', 'bar_track_9', 'button_d', 'button_n', 'button_p', 'card_d_9', 'card_n_9', 'card_s_9', 'category_d', 'category_n', 'category_s',
    'chart_arcs', 'close_d', 'close_n', 'close_p', 'column_label_n', 'column_label_s', 'corner_flourish', 'currency_bar_9', 'curtain_9', 'divider_h_3', 'divider_jewel', 'divider_v_3', 'icon_lock', 'icon_upgrade', 'item_disc_empty', 'item_disc_n',
    'item_slot_d', 'item_slot_n', 'item_slot_s', 'label_blank_9', 'learn_button_d', 'learn_button_n', 'learn_button_p', 'manual_label_n', 'manual_label_s', 'manual_ring_n', 'manual_ring_s', 'name_plate_blank_9', 'panel_detail_9', 'panel_main_9',
    'panel_well_9', 'quality_fan_9', 'quality_fan_circle', 'quality_ling_9', 'quality_ling_circle', 'quality_xian_9', 'quality_xian_circle', 'quality_xuan_9', 'quality_xuan_circle', 'rank_dim', 'rank_lit', 'relic_disc', 'relic_socket_locked',
    'relic_socket_n', 'relic_socket_s', 'save_row_empty_9', 'save_row_n_9', 'save_row_s_9', 'save_thumb_empty_9', 'save_thumb_n_9', 'set_dot_dim', 'set_dot_lit', 'skill_ring_n', 'skill_ring_s', 'skill_ring_unlearned', 'skill_star_base',
    'skill_unlearned_veil', 'star_corner', 'stat_medallion', 'subtitle_blank_9', 'tab_n', 'tab_s', 'title_ornament_blank'];
  // 九宫保护边（Codex layout.json，逻辑像素 左 上 右 下）
  const NINE = { curtain_9: [32, 32, 32, 32], panel_main_9: [18, 18, 18, 18], panel_detail_9: [18, 18, 18, 18], panel_well_9: [14, 14, 14, 14], avatar_name_blank: [12, 6, 12, 6], currency_bar_9: [24, 14, 24, 14], close_n: [20, 12, 20, 12], close_p: [20, 12, 20, 12], close_d: [20, 12, 20, 12],
    button_n: [24, 14, 24, 14], button_p: [24, 14, 24, 14], button_d: [24, 14, 24, 14], category_n: [14, 10, 14, 10], category_s: [14, 10, 14, 10], category_d: [14, 10, 14, 10], item_slot_n: [14, 14, 14, 14], item_slot_s: [14, 14, 14, 14], item_slot_d: [14, 14, 14, 14],
    quality_fan_9: [14, 14, 14, 14], quality_ling_9: [14, 14, 14, 14], quality_xuan_9: [14, 14, 14, 14], quality_xian_9: [14, 14, 14, 14], card_n_9: [18, 18, 18, 18], card_s_9: [18, 18, 18, 18], card_d_9: [18, 18, 18, 18], save_row_n_9: [24, 18, 24, 18], save_row_s_9: [24, 18, 24, 18],
    save_row_empty_9: [24, 18, 24, 18], save_thumb_n_9: [12, 12, 12, 12], save_thumb_empty_9: [12, 12, 12, 12], divider_h_3: [8, 0, 8, 0], divider_v_3: [0, 8, 0, 8], label_blank_9: [16, 9, 16, 9], name_plate_blank_9: [22, 12, 22, 12], subtitle_blank_9: [16, 10, 16, 10],
    bar_track_9: [10, 6, 10, 6], bar_hp_9: [10, 6, 10, 6], bar_mp_9: [10, 6, 10, 6], bar_exp_9: [10, 6, 10, 6], column_label_n: [13, 9, 13, 9], column_label_s: [13, 9, 13, 9], manual_label_n: [15, 9, 15, 9], manual_label_s: [15, 9, 15, 9],
    learn_button_n: [24, 14, 24, 14], learn_button_p: [24, 14, 24, 14], learn_button_d: [24, 14, 24, 14] };
  // Codex 配色.json
  const C = { ink: '#0B1921', panel: '#142932', line: '#8F7C54', lineDim: '#5C594B', gold: '#C2AD78', gold2: '#E9D9A8', text: '#E4DDC9', sub: '#A6AEA6', dim: '#667375', seal: '#883E32', green: '#9FC98F', red: '#D98A78', blue: '#9CC3E8' };
  const PAL = { pTop: 'rgba(20,41,50,.9)', pBot: 'rgba(11,25,33,.92)', cTop: 'rgba(30,54,64,.82)', cBot: 'rgba(14,30,38,.82)', cOff: 'rgba(18,30,36,.72)', well: 'rgba(4,14,20,.30)', slot: 'rgba(10,26,34,.55)', backdrop: 'rgba(6,16,24,.36)',
    fade1: 'rgba(16,34,42,1)', fade0: 'rgba(16,34,42,0)', line: 'rgba(143,124,84,.55)', grainA: .12, gold: C.gold, gold2: C.gold2, text: C.text, sub: C.sub, dim: '#8A9493', red: '#3a3020', red2: '#8F7C54',
    title: C.gold2, titleLine: 'rgba(6,16,24,.85)', hp: '#963E34', mp: '#3E6583', exp: '#8F7C54' };
  const IM = {}; let nOk = 0, started = false;
  // 底图：作者 11-12「人家有背景图的呀…放叶孤星抬头望星空那张，和它一个色调，淡入进去」→ 作者指定载入插画 NA77（墨青水面上的背影）
  let BG = null;
  function load() { if (started) return; started = true; { const im = new Image(); im.onload = () => { BG = im; }; im.src = 'r157/sel/NA77.webp'; }
    try { const f = new FontFace('R209DG', 'url(fonts/r201_wenkai.woff)', { unicodeRange: 'U+0020-007E' }); f.load().then(x => document.fonts.add(x)).catch(() => {}); } catch (e) {} for (const k of N) { const im = new Image(); im.onload = () => { IM[k] = im; nOk++; }; im.src = 'r209/' + k + '.webp'; } }
  let pick = 'dark'; try { pick = localStorage.getItem('bag_skin') || 'dark'; } catch (e) {}
  const want = () => pick === 'dark';
  const ready = () => nOk >= N.length;
  setTimeout(() => { if (want()) load(); }, 6500);
  const X = () => ctx;
  function D(k, x, y, w, h) { const im = IM[k]; if (!im) return false; if (w == null) { w = im.width / 2; h = im.height / 2; } X().drawImage(im, x, y, w, h); return true; }
  function nine(k, x, y, w, h) { const im = IM[k]; if (!im) return false; const p = NINE[k]; if (!p) return D(k, x, y, w, h); const c = X();
    let [l, t, r, b] = p; if (l + r > w) { const s = w / (l + r); l *= s; r *= s; } if (t + b > h) { const s = h / (t + b); t *= s; b *= s; }
    const sw = im.width, sh = im.height, SX = [0, p[0] * 2, sw - p[2] * 2, sw], SY = [0, p[1] * 2, sh - p[3] * 2, sh], DX = [x, x + l, x + w - r, x + w], DY = [y, y + t, y + h - b, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const a = SX[i + 1] - SX[i], bb = SY[j + 1] - SY[j], cw = DX[i + 1] - DX[i], ch = DY[j + 1] - DY[j]; if (a > 0 && bb > 0 && cw > 0 && ch > 0) c.drawImage(im, SX[i], SY[j], a, bb, DX[i], DY[j], cw, ch); }
    return true; }
  const KAI = () => '"R201MS","GuxingWKB",' + BRUSH, WK = () => '"R201WK",' + FONT, NUM = () => '"R201NS",' + FONT;
  function T(s, x, y, size, col, align = 'center', font, wt, glow) { const c = X(); c.save(); c.font = `${wt || 400} ${size}px ${font || KAI()}`; c.textAlign = align; c.textBaseline = 'middle';
    if (glow !== false) { c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 3; c.shadowOffsetY = 1; } c.fillStyle = col; c.fillText(s, x, y); c.restore(); }
  // 竖排两字（页签）
  function vtext(s, cx, cy, size, col) { const ch = [...s]; const g = size * 1.08, y0 = cy - (ch.length - 1) * g / 2; ch.forEach((t, i) => T(t, cx, y0 + i * g, size, col)); }
  function btn(label, x, y, w, h, st) { nine(st === 'd' ? 'button_d' : st === 'p' ? 'button_p' : 'button_n', x, y, w, h); T(label, x + w / 2, y + h / 2 + 1, Math.round(Math.min(h * .48, 28)), st === 'd' ? C.dim : C.gold2); }

  // ---------------- 地图透景（打开行囊那一刻拍一张，之后复用，不每帧虚化）----------------
  const SNAP = { key: null, c: null, w: 0 };
  function backdrop(menuKey) { const c = X(), cv = c.canvas; if (!cv) return;
    if (SNAP.key !== menuKey || SNAP.w !== cv.width || !SNAP.c) {
      const o = SNAP.c || (SNAP.c = document.createElement('canvas')); o.width = cv.width; o.height = cv.height; const g = o.getContext('2d'), sc = cv.width / W, pad = 12 * sc;
      try { g.filter = `blur(${3 * sc}px)`; } catch (e) {}
      g.drawImage(cv, -pad, -pad, cv.width + pad * 2, cv.height + pad * 2); try { g.filter = 'none'; } catch (e) {}
      g.fillStyle = 'rgba(6,16,24,.36)'; g.fillRect(0, 0, o.width, o.height); SNAP.key = menuKey; SNAP.w = cv.width; }
    if (SNAP.t0key !== menuKey) { SNAP.t0key = menuKey; SNAP.t0 = performance.now(); }
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(SNAP.c, 0, 0); c.restore();
    if (BG) { const k = Math.min(1, (performance.now() - SNAP.t0) / 450), s = Math.max(W / BG.width, H / BG.height), bw = BG.width * s, bh = BG.height * s;   // 淡入；铺满、人物偏右留给面板左边的字
      c.save(); c.globalAlpha = k; c.drawImage(BG, (W - bw) / 2, (H - bh) / 2, bw, bh); c.restore(); }
    c.save(); if (BG) c.globalAlpha = .55; nine('curtain_9', 0, 0, W, H); c.restore(); }   /* 有底图时幕淡一点，让画透出来 */

  // ---------------- 白玉件 → 玄青件 的对照（R201 / R202 里画的每个件都过这里）----------------
  const LAB = { label_灵石: '灵石', label_星辰点: '星辰点' };
  const QK = { 凡: 'fan', 灵: 'ling', 玄: 'xuan', 仙: 'xian' }; const TINT = {};
  function bag(k, x, y, w, h, isNine) {   // R201 的 D / nine
    let m;
    if (k === 'bg_full') return true;   // 底由 frame() 画透景
    if (k === 'panel_main_9') { nine('panel_main_9', x, y, w, h); D('star_corner', 700, 0, 328, 96); const c = X(); c.save(); c.translate(910 + 164, 624 + 48); c.rotate(Math.PI); D('star_corner', -164, -48, 328, 96); c.restore(); return true; }
    if (k === 'title_xingnang') { D('title_ornament_blank', x, y, w, h); const src = window.R201_BAG && R201_BAG.IM.title_xingnang;   /* 效果图的「行囊」是那张书法字，染成米金色 */
      if (src) { const o = TINT.c || (TINT.c = document.createElement('canvas')); if (TINT.src !== src) { o.width = src.width; o.height = src.height; const g = o.getContext('2d'); g.clearRect(0, 0, o.width, o.height); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in';
          const gr = g.createLinearGradient(0, 0, 0, o.height); gr.addColorStop(0, '#FFF1CF'); gr.addColorStop(.55, '#E9D3A0'); gr.addColorStop(1, '#B9955C'); g.fillStyle = gr; g.fillRect(0, 0, o.width, o.height); g.globalCompositeOperation = 'source-over'; TINT.src = src; }
        const c = X(); c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6; c.drawImage(o, x, y, w, h); c.restore(); }
      else T('行 囊', x + 92, y + 46, 52, C.gold2); return true; }
    if ((m = /^tab_(.+)_(n|s)$/.exec(k))) { D(m[2] === 's' ? 'tab_s' : 'tab_n', x, y, 76, 104); vtext(m[1], x + 38, y + 52, 30, m[2] === 's' ? '#F6E6BC' : '#D6CCB2'); return true; }
    if (k === 'avatar_empty') { D('avatar_empty', x, y, w, h); T('+', x + w / 2, y + h / 2, 28, C.lineDim, 'center', NUM()); return true; }
    if (k === 'avatar_ring_n') return D('avatar_n', x, y, w, h);
    if (k === 'avatar_ring_s') return D('avatar_s', x, y, w, h);
    if (k === 'avatar_name_plate') return nine('avatar_name_blank', x, y, w, h);
    if (k === 'currency_bar_9') return nine('currency_bar_9', x, y, w, h);
    if (LAB[k]) { T(LAB[k], x, y + h / 2, 24, '#E9D9A8', 'left', KAI()); return true; }
    if (k === 'btn_close_n' || k === 'btn_close_p') { nine(k === 'btn_close_p' ? 'close_p' : 'close_n', x, y, w, h); T('关 闭', x + w / 2, y + h / 2 + 1, 22, C.gold2); return true; }
    if (k === 'slot_card_9') return nine('card_n_9', x, y, w, h);
    if (k === 'slot_card_empty_9') return nine('card_d_9', x, y, w, h);
    if ((m = /^slot_label_(.+)$/.exec(k))) { nine('label_blank_9', x, y, w, h); T(m[1], x + w / 2, y + h / 2 + 1, 20, C.gold2); return true; }
    if (k === 'item_disc') return D('item_disc_n', x, y, w, h);
    if (k === 'item_disc_empty') return D('item_disc_empty', x, y, w, h);
    if (k === 'hero_sub_plate') return nine('subtitle_blank_9', x, y, w, h);
    if (k === 'hero_name_plate') return nine('name_plate_blank_9', x, y, w, h);
    if ((m = /^section_(.+)$/.exec(k))) { nine('divider_h_3', x, y + h / 2 - 5, w, 10); const c = X(); c.save(); c.font = `400 26px ${KAI()}`; const tw = c.measureText(m[1]).width; c.restore();
      const cx = x + w / 2; D('divider_jewel', cx - tw / 2 - 44, y + h / 2 - 9, 30, 18); D('divider_jewel', cx + tw / 2 + 14, y + h / 2 - 9, 30, 18);
      const g = X(); g.save(); g.fillStyle = 'rgba(12,26,34,.92)'; g.fillRect(cx - tw / 2 - 12, y + 6, tw + 24, h - 12); g.restore(); T(m[1], cx, y + h / 2 + 1, 26, C.gold2); return true; }
    if (k === 'swap_card_9_n') return nine('card_n_9', x, y, w, h);
    if (k === 'swap_card_9_s') return nine('card_s_9', x, y, w, h);
    if ((m = /^btn_(.+)_(n|p|d)$/.exec(k)) && m[1] !== 'close') { btn(m[1], x, y, w, h, m[2]); return true; }
    if (k === 'btn_gold_9' || k === 'btn_blue_9') return nine('button_n', x, y, w, h);
    if (k === 'save_row_9_n') return nine('save_row_n_9', x, y, w, h);
    if (k === 'save_row_9_s') return nine('save_row_s_9', x, y, w, h);
    if (k === 'save_row_9_empty') return nine('save_row_empty_9', x, y, w, h);
    if (k === 'save_thumb_frame') return nine('save_thumb_n_9', x, y, w, h);
    if (k === 'save_thumb_empty') return nine('save_thumb_empty_9', x, y, w, h);
    if (k === 'dot_diamond' || k === 'hint_diamond') { const s = Math.min(w, h, 12); return D('set_dot_lit', x + (w - s) / 2, y + (h - s) / 2, s, s); }
    if (k === 'divider_h') return nine('divider_h_3', x, y, w, h);
    if (k === 'label_请选择一个存档位') { T('请选择一个存档位', x + 4, y + h / 2, 22, C.sub, 'left', WK()); return true; }
    if ((m = /^page_title_(.+)$/.exec(k))) { T(m[1], x + w / 2, y + h / 2 + 4, 34, C.gold2); return true; }
    if (k === 'chip_n' || k === 'chip_s') return nine(k === 'chip_s' ? 'category_s' : 'category_n', x, y + 2, w, h - 4);
    if ((m = /^chip_(.+)_(n|s)$/.exec(k))) { nine(m[2] === 's' ? 'category_s' : 'category_n', x, y, w, h); T(m[1], x + w / 2, y + h / 2 + 1, 17, m[2] === 's' ? C.gold2 : C.text, 'center', WK(), 600); return true; }
    if (k === 'item_card_9_n' || k === 'item_card_9_s') { nine(k.endsWith('_s') ? 'item_slot_s' : 'item_slot_n', x, y, w, h); return true; }
    if (k === 'info_box_9') return nine('panel_detail_9', x, y, w, h);
    if (k === 'scroll_track') return nine('bar_track_9', x, y, w, h);
    if (k === 'scroll_thumb') return nine('bar_exp_9', x, y, w, h);
    return false;   // 其余（灵石图标、星辰点图标、空栏位的剪影）照旧用白玉那张
  }
  // R202 技能页的件（参数和白玉件的尺寸习惯一致，这里按 Codex 件的比例换算回同一个中心）
  function skillD(k, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2, sq = (key, f) => { const s = w * f; return D(key, cx - s / 2, cy - s / 2, s, s); };
    if (k === 'panel_star_fixed') { nine('panel_well_9', x, y, w, h); const c = X(); c.save(); c.beginPath(); c.rect(x + 2, y + 2, w - 4, h - 4); c.clip(); D('skill_star_base', x, y, w, h); c.globalAlpha = .9; D('chart_arcs', x, y, w, h); c.restore(); return true; }
    if (k === 'title_gfsx') { T('功法双修', x + 4, y + h / 2, 30, C.gold2, 'left'); return true; }
    if (k === 'manual_halo_n' || k === 'manual_halo_s') return sq(k === 'manual_halo_s' ? 'manual_ring_s' : 'manual_ring_n', .885);
    if (k === 'manual_plate_n' || k === 'manual_plate_s') return nine(k === 'manual_plate_s' ? 'manual_label_s' : 'manual_label_n', x, y, w, h);
    if (k === 'branch_jian' || k === 'branch_fu') { nine('column_label_s', x, y, w, h); T(k === 'branch_jian' ? '剑式' : '辅助', cx, cy + 1, 17, '#F3E3B2', 'center', WK(), 600); return true; }
    if (k === 'branch_blank') return nine('column_label_n', x, y, w, h);
    if (k === 'skill_ring_n' || k === 'skill_ring_s' || k === 'skill_ring_d') return sq(k === 'skill_ring_d' ? 'skill_ring_unlearned' : k, .8626);
    if (k === 'rank_lit' || k === 'rank_dim') return D(k, x, y, w, h);
    if (k === 'badge_upgrade') return D('icon_upgrade', x, y, w, h);
    if (k === 'icon_lock') return D('icon_lock', x, y, w, h);
    if (k === 'btn_n' || k === 'btn_d' || k === 'btn_p') { nine(k === 'btn_d' ? 'learn_button_d' : k === 'btn_p' ? 'learn_button_p' : 'learn_button_n', x + 2, y + 2, w - 4, h - 4);
      if (k !== 'btn_d') {   // 作者 11-12：条件满足时「参悟」要亮起来——暗色版原来亮 / 灰两个状态几乎一样。金色内光 + 呼吸外晕
        const c = X(), pu = .5 + .5 * Math.sin(performance.now() / 420); c.save();
        c.shadowColor = 'rgba(255,205,110,' + (.55 + .35 * pu) + ')'; c.shadowBlur = 16 + 12 * pu; c.strokeStyle = 'rgba(255,214,130,' + (.75 + .25 * pu) + ')'; c.lineWidth = 2;
        c.beginPath(); if (c.roundRect) c.roundRect(x + 6, y + 6, w - 12, h - 12, 12); else c.rect(x + 6, y + 6, w - 12, h - 12); c.stroke(); c.shadowBlur = 0;
        const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,214,130,.34)'); g.addColorStop(.55, 'rgba(214,150,60,.22)'); g.addColorStop(1, 'rgba(150,90,30,.30)'); c.fillStyle = g;
        c.beginPath(); if (c.roundRect) c.roundRect(x + 7, y + 7, w - 14, h - 14, 11); else c.rect(x + 7, y + 7, w - 14, h - 14); c.fill(); c.restore(); }
      T('参 悟', cx, cy + 1, 30, k === 'btn_d' ? C.dim : '#fff3cf'); return true; }
    if (k === 'divider_diamond') { nine('divider_h_3', x, cy - 5, w, 10); D('divider_jewel', cx - 15, cy - 9, 30, 18); return true; }
    if (k === 'panel_detail_9') return nine('panel_detail_9', x, y, w, h);
    return false;
  }
  const on = () => want() && ready();
  window.BDK = { get on() { return on(); }, get want() { return want(); }, ready, load, IM, D, nine, T, vtext, btn, C, PAL, backdrop, bag, skillD, QK,
    set(v) { pick = v ? 'dark' : 'jade'; try { localStorage.setItem('bag_skin', pick); } catch (e) {} if (v) load(); SNAP.key = null; },
    toggle() { this.set(!want()); } };
  // 行囊里的印章式按钮（使用 / 主角 / 出战…）换成暗色按钮件
  if (typeof sealText === 'function') sealText = (orig => function (t, x, y, w, h, active) { if (!window.BAG_DARK || !ready()) return orig.apply(this, arguments); btn(t, x, y, w, h, active ? 'n' : 'd'); })(sealText);
  // 测试面板：行囊皮肤切换
  try { (window.TEST_TOGGLES || (window.TEST_TOGGLES = [])).push({ name: '行囊皮肤：玄青（暗）/ 白玉', get: () => want(), set: v => window.BDK.set(v) }); } catch (e) {}
})();
