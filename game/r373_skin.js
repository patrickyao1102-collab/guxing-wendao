// ================= R373 · 行囊第三套皮「乌木鎏金」（Codex R373，照 R206 A 拆件的 80 张同名件）（只进测试版）=================
// 作者 11-26 夜：「还有各种框，感觉游戏感也不足，你找 Codex 设计，找你认可的」。Codex 出了三个方向，Claude 选了「乌木鎏金」。
// 接法：不动现有两套（玄青 / 白玉），只在行囊右上「换…」那个小签的轮换里多一档——玄青 → 乌木鎏金 → 白玉 → 玄青。默认还是作者原来用的那套。
// 做法：乌木版是「暖绢内页 + 深墨字」，字色和白玉版一路，所以直接把白玉版每个件（R201 的 119 张）换成用乌木件现拼的同尺寸图，行囊的排版、点击区一概不动。
(function () {
  if (!window.R201_BAG || !window.BDK || typeof FONT === 'undefined') return;
  const N = ['avatar_empty', 'avatar_n', 'avatar_name_blank', 'avatar_s', 'bar_exp_9', 'bar_hp_9', 'bar_mp_9', 'bar_track_9', 'button_d', 'button_n', 'button_p', 'card_d_9', 'card_n_9', 'card_s_9', 'category_d', 'category_n', 'category_s',
    'chart_arcs', 'close_d', 'close_n', 'close_p', 'column_label_n', 'column_label_s', 'corner_flourish', 'currency_bar_9', 'curtain_9', 'divider_h_3', 'divider_jewel', 'divider_v_3', 'icon_lock', 'icon_upgrade', 'item_disc_empty', 'item_disc_n',
    'item_slot_d', 'item_slot_n', 'item_slot_s', 'label_blank_9', 'learn_button_d', 'learn_button_n', 'learn_button_p', 'manual_label_n', 'manual_label_s', 'manual_ring_n', 'manual_ring_s', 'name_plate_blank_9', 'panel_detail_9', 'panel_main_9',
    'panel_well_9', 'quality_fan_9', 'quality_fan_circle', 'quality_ling_9', 'quality_ling_circle', 'quality_xian_9', 'quality_xian_circle', 'quality_xuan_9', 'quality_xuan_circle', 'rank_dim', 'rank_lit', 'relic_disc', 'relic_socket_locked',
    'relic_socket_n', 'relic_socket_s', 'save_row_empty_9', 'save_row_n_9', 'save_row_s_9', 'save_thumb_empty_9', 'save_thumb_n_9', 'set_dot_dim', 'set_dot_lit', 'skill_ring_n', 'skill_ring_s', 'skill_ring_unlearned', 'skill_star_base',
    'skill_unlearned_veil', 'star_corner', 'stat_medallion', 'subtitle_blank_9', 'tab_n', 'tab_s', 'title_ornament_blank'];
  const NINE = { curtain_9: [32, 32, 32, 32], panel_main_9: [18, 18, 18, 18], panel_detail_9: [18, 18, 18, 18], panel_well_9: [14, 14, 14, 14], avatar_name_blank: [12, 6, 12, 6], currency_bar_9: [24, 14, 24, 14], close_n: [20, 12, 20, 12], close_p: [20, 12, 20, 12], close_d: [20, 12, 20, 12],
    button_n: [24, 14, 24, 14], button_p: [24, 14, 24, 14], button_d: [24, 14, 24, 14], category_n: [14, 10, 14, 10], category_s: [14, 10, 14, 10], category_d: [14, 10, 14, 10], item_slot_n: [14, 14, 14, 14], item_slot_s: [14, 14, 14, 14], item_slot_d: [14, 14, 14, 14],
    quality_fan_9: [14, 14, 14, 14], quality_ling_9: [14, 14, 14, 14], quality_xuan_9: [14, 14, 14, 14], quality_xian_9: [14, 14, 14, 14], card_n_9: [18, 18, 18, 18], card_s_9: [18, 18, 18, 18], card_d_9: [18, 18, 18, 18], save_row_n_9: [24, 18, 24, 18], save_row_s_9: [24, 18, 24, 18],
    save_row_empty_9: [24, 18, 24, 18], save_thumb_n_9: [12, 12, 12, 12], save_thumb_empty_9: [12, 12, 12, 12], divider_h_3: [8, 0, 8, 0], divider_v_3: [0, 8, 0, 8], label_blank_9: [16, 9, 16, 9], name_plate_blank_9: [22, 12, 22, 12], subtitle_blank_9: [16, 10, 16, 10],
    bar_track_9: [10, 6, 10, 6], bar_hp_9: [10, 6, 10, 6], bar_mp_9: [10, 6, 10, 6], bar_exp_9: [10, 6, 10, 6], column_label_n: [13, 9, 13, 9], column_label_s: [13, 9, 13, 9], manual_label_n: [15, 9, 15, 9], manual_label_s: [15, 9, 15, 9],
    learn_button_n: [24, 14, 24, 14], learn_button_p: [24, 14, 24, 14], learn_button_d: [24, 14, 24, 14] };
  const W_IM = {}; let nOk = 0, started = false;
  function load() { if (started) return; started = true; for (const k of N) { const im = new Image(); im.onload = () => { W_IM[k] = im; nOk++; }; im.src = 'r373/' + k + '.webp?v=1'; } }
  const ready = () => nOk >= N.length && R201_BAG.ready();
  let wood = false; try { wood = localStorage.getItem('bag_skin3') === 'wood'; } catch (e) {}
  if (wood) setTimeout(load, 7000);
  const INK = '#3A2412', GOLD = '#835414', SUB = '#634B39', DIM = '#8a7a62', RED = '#8A1F12';
  const KAI = () => '"R201MS","GuxingWKB",' + BRUSH, WK = () => '"R201WK",' + FONT, NUM = () => '"R201NS",' + FONT;
  let g = null;   // 当前在画的离屏画布
  function D(k, x, y, w, h) { const im = W_IM[k]; if (!im) return false; if (w == null) { w = im.width / 2; h = im.height / 2; } g.drawImage(im, x, y, w, h); return true; }
  function nine(k, x, y, w, h) { const im = W_IM[k]; if (!im) return false; const p = NINE[k]; if (!p) return D(k, x, y, w, h);
    let [l, t, r, b] = p; if (l + r > w) { const s = w / (l + r); l *= s; r *= s; } if (t + b > h) { const s = h / (t + b); t *= s; b *= s; }
    const sw = im.width, sh = im.height, SX = [0, p[0] * 2, sw - p[2] * 2, sw], SY = [0, p[1] * 2, sh - p[3] * 2, sh], DX = [x, x + l, x + w - r, x + w], DY = [y, y + t, y + h - b, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const a = SX[i + 1] - SX[i], bb = SY[j + 1] - SY[j], cw = DX[i + 1] - DX[i], ch = DY[j + 1] - DY[j]; if (a > 0 && bb > 0 && cw > 0 && ch > 0) g.drawImage(im, SX[i], SY[j], a, bb, DX[i], DY[j], cw, ch); }
    return true; }
  function T(s, x, y, size, col, align = 'center', font, wt) { g.save(); g.font = `${wt || 400} ${size}px ${font || KAI()}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); g.restore(); }
  function vtext(s, cx, cy, size, col) { const ch = [...s]; const gp = size * 1.08, y0 = cy - (ch.length - 1) * gp / 2; ch.forEach((t, i) => T(t, cx, y0 + i * gp, size, col)); }
  function btn(label, x, y, w, h, st) { nine(st === 'd' ? 'button_d' : st === 'p' ? 'button_p' : 'button_n', x, y, w, h); T(label, x + w / 2, y + h / 2 + 1, Math.round(Math.min(h * .48, 28)), st === 'd' ? DIM : INK); }
  // 白玉件 → 乌木件（照 R209 的对照表；画进和白玉件一样大的离屏画布）
  function piece(k, w, h, jade) { let m;
    if (k === 'bg_full') { const gr = g.createRadialGradient(w / 2, h / 2, 120, w / 2, h / 2, 800); gr.addColorStop(0, '#E9D9B6'); gr.addColorStop(.7, '#D8C299'); gr.addColorStop(1, '#B79C6E'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.save(); g.globalAlpha = .5; D('chart_arcs', w - 520, -60, 560, 560); g.restore(); g.fillStyle = '#2A1C12'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5); g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h); g.strokeStyle = '#B98A3C'; g.lineWidth = 2; g.strokeRect(7, 7, w - 14, h - 14); return true; }
    if (k === 'panel_main_9') return nine('panel_main_9', 0, 0, w, h);
    if (k === 'title_xingnang') { D('title_ornament_blank', 0, 0, w, h); if (jade) { const o = document.createElement('canvas'); o.width = jade.width; o.height = jade.height; const c = o.getContext('2d'); c.drawImage(jade, 0, 0); c.globalCompositeOperation = 'source-in'; const gr = c.createLinearGradient(0, 0, 0, o.height); gr.addColorStop(0, '#4A2A12'); gr.addColorStop(1, '#2A180C'); c.fillStyle = gr; c.fillRect(0, 0, o.width, o.height); g.drawImage(o, 0, 0, w, h); } else T('行 囊', 92, 46, 52, INK); return true; }
    if ((m = /^tab_(.+)_(n|s)$/.exec(k))) { D(m[2] === 's' ? 'tab_s' : 'tab_n', 0, 0, 76, 104); vtext(m[1], 38, 52, 28, m[2] === 's' ? RED : INK); return true; }
    if (k === 'avatar_empty') { D('avatar_empty', 0, 0, w, h); T('+', w / 2, h / 2, 28, DIM, 'center', NUM()); return true; }
    if (k === 'avatar_ring_n') return D('avatar_n', 0, 0, w, h);
    if (k === 'avatar_ring_s') return D('avatar_s', 0, 0, w, h);
    if (k === 'avatar_name_plate') return nine('avatar_name_blank', 0, 0, w, h);
    if (k === 'currency_bar_9') return nine('currency_bar_9', 0, 0, w, h);
    if (k === 'label_灵石' || k === 'label_星辰点') { T(k.slice(6), 0, h / 2, 24, GOLD, 'left', KAI()); return true; }
    if (k === 'btn_close_n' || k === 'btn_close_p') { nine(k === 'btn_close_p' ? 'close_p' : 'close_n', 0, 0, w, h); T('关 闭', w / 2, h / 2 + 1, 22, INK); return true; }
    if (k === 'slot_card_9') return nine('card_n_9', 0, 0, w, h);
    if (k === 'slot_card_empty_9') return nine('card_d_9', 0, 0, w, h);
    if ((m = /^slot_label_(.+)$/.exec(k))) { nine('label_blank_9', 0, 0, w, h); T(m[1], w / 2, h / 2 + 1, 20, INK); return true; }
    if (k === 'item_disc') return D('item_disc_n', 0, 0, w, h);
    if (k === 'item_disc_empty') return D('item_disc_empty', 0, 0, w, h);
    if (k === 'hero_sub_plate') return nine('subtitle_blank_9', 0, 0, w, h);
    if (k === 'hero_name_plate') { nine('name_plate_blank_9', 0, 0, w, h); g.save(); g.fillStyle = 'rgba(58,34,16,.88)'; g.beginPath(); if (g.roundRect) g.roundRect(8, 5, w - 16, h - 10, 6); else g.rect(8, 5, w - 16, h - 10); g.fill(); g.strokeStyle = 'rgba(214,170,96,.8)'; g.lineWidth = 1; g.stroke(); g.restore(); return true; }   // 名字是浅色字，名牌压成乌木色
    if ((m = /^section_(.+)$/.exec(k))) { nine('divider_h_3', 0, h / 2 - 5, w, 10); g.save(); g.font = `400 26px ${KAI()}`; const tw = g.measureText(m[1]).width; g.restore(); const cx = w / 2;
      g.save(); g.globalCompositeOperation = 'destination-out'; g.fillRect(cx - tw / 2 - 50, 0, tw + 100, h); g.restore(); D('divider_jewel', cx - tw / 2 - 44, h / 2 - 9, 30, 18); D('divider_jewel', cx + tw / 2 + 14, h / 2 - 9, 30, 18); T(m[1], cx, h / 2 + 1, 26, GOLD); return true; }
    if (k === 'swap_card_9_n') return nine('card_n_9', 0, 0, w, h);
    if (k === 'swap_card_9_s') return nine('card_s_9', 0, 0, w, h);
    if ((m = /^btn_(.+)_(n|p|d)$/.exec(k)) && m[1] !== 'close') { btn(m[1], 0, 0, w, h, m[2]); return true; }
    if (k === 'btn_gold_9' || k === 'btn_blue_9') return nine('button_n', 0, 0, w, h);
    if (k === 'save_row_9_n') return nine('save_row_n_9', 0, 0, w, h);
    if (k === 'save_row_9_s') return nine('save_row_s_9', 0, 0, w, h);
    if (k === 'save_row_9_empty') return nine('save_row_empty_9', 0, 0, w, h);
    if (k === 'save_thumb_frame') return nine('save_thumb_n_9', 0, 0, w, h);
    if (k === 'save_thumb_empty') return nine('save_thumb_empty_9', 0, 0, w, h);
    if (k === 'dot_diamond' || k === 'hint_diamond') { const s = Math.min(w, h, 12); return D('set_dot_lit', (w - s) / 2, (h - s) / 2, s, s); }
    if (k === 'divider_h') return nine('divider_h_3', 0, 0, w, h);
    if (k === 'label_请选择一个存档位') { T('请选择一个存档位', 4, h / 2, 22, SUB, 'left', WK()); return true; }
    if ((m = /^page_title_(.+)$/.exec(k))) { T(m[1], w / 2, h / 2 + 4, 34, GOLD); return true; }
    if (k === 'chip_n' || k === 'chip_s') return nine(k === 'chip_s' ? 'category_s' : 'category_n', 0, 2, w, h - 4);
    if ((m = /^chip_(.+)_(n|s)$/.exec(k))) { nine(m[2] === 's' ? 'category_s' : 'category_n', 0, 0, w, h); T(m[1], w / 2, h / 2 + 1, 17, m[2] === 's' ? RED : INK, 'center', WK(), 600); return true; }
    if (k === 'item_card_9_n' || k === 'item_card_9_s') return nine(k.endsWith('_s') ? 'item_slot_s' : 'item_slot_n', 0, 0, w, h);
    if (k === 'info_box_9') return nine('panel_detail_9', 0, 0, w, h);
    if (k === 'scroll_track') return nine('bar_track_9', 0, 0, w, h);
    if (k === 'scroll_thumb') return nine('bar_exp_9', 0, 0, w, h);
    return false; }
  let PAPER = '239,220,190';
  const JADE = {}, WOOD = {}; let built = 0;
  function build() { const IM = R201_BAG.IM; for (const k in IM) { const src = JADE[k] || IM[k]; if (!src || !src.width) continue; JADE[k] = src;
      const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; g = c.getContext('2d'); g.scale(2, 2); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      let ok = false; try { ok = piece(k, src.width / 2, src.height / 2, src); } catch (e) { ok = false; } if (ok) WOOD[k] = c; } g = null; built = performance.now(); }
  function apply(on) { const IM = R201_BAG.IM; for (const k in JADE) IM[k] = on && WOOD[k] ? WOOD[k] : JADE[k]; }
  let applied = false, fontsAt = 0;
  function sync() { if (!wood) { if (applied) { apply(false); applied = false; } return; } load(); if (!ready()) return;
    if (!built) { build(); try { Promise.all([document.fonts.load('30px R201MS', '行囊'), document.fonts.load('17px R201WK', '全部')]).then(() => { fontsAt = performance.now(); }); } catch (e) {} }
    if (fontsAt && fontsAt > built) { build(); applied = false; }   // 字体到齐后重拼一次（件上的字是现写的）
    if (!applied) { apply(true); applied = true; } }
  // 乌木开着时，对 R201 来说就是「白玉」那一路（字色、排版都按白玉走），玄青那套暂时让位；不改玩家原来存的玄青 / 白玉选择
  const B = window.BDK, dOn = Object.getOwnPropertyDescriptor(B, 'on'), dWant = Object.getOwnPropertyDescriptor(B, 'want');
  try { Object.defineProperty(B, 'on', { configurable: true, get() { return wood ? false : dOn.get.call(B); } }); Object.defineProperty(B, 'want', { configurable: true, get() { return wood ? false : dWant.get.call(B); } }); } catch (e) {}
  const set0 = B.set.bind(B);
  const save = () => { try { localStorage.setItem('bag_skin3', wood ? 'wood' : 'off'); } catch (e) {} };
  B.toggle = function () { if (wood) { wood = false; save(); sync(); set0(false); }            // 乌木 → 白玉
    else if (dWant.get.call(B)) { wood = true; save(); sync(); }                             // 玄青 → 乌木
    else set0(true); };                                                                      // 白玉 → 玄青
  B.set = function (v) { if (wood) { wood = false; save(); sync(); } return set0(v); };
  window.R373_SKIN = { get on() { return wood; }, set(v) { wood = !!v; save(); sync(); }, ready, sync };
  if (typeof drawMenu === 'function') drawMenu = (o => function () { try { sync(); } catch (e) {}
    // 白玉版有几处写死的白纸渐隐（立绘底部），乌木开着时换成绢纸色
    let patched = false; if (wood && applied) { try { const CG = CanvasRenderingContext2D.prototype.createLinearGradient; ctx.createLinearGradient = function () { const gr = CG.apply(this, arguments), add = gr.addColorStop.bind(gr); gr.addColorStop = (of, c) => add(of, typeof c === 'string' ? c.replace('240,239,236', PAPER) : c); return gr; }; patched = true; } catch (e) {} }
    let r; try { r = o.apply(this, arguments); } finally { if (patched) { try { delete ctx.createLinearGradient; } catch (e) {} } }
    try { if (wood && S.menu && !window.GX_TRIAL) { ctx.save(); const x = 1162, y = 80, w = 90, h = 28; ctx.globalAlpha = 1; if (typeof roundRect === 'function') roundRect(x, y, w, h, 12); ctx.fillStyle = 'rgba(248,236,208,.96)'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(153,105,50,.9)'; ctx.stroke();
        ctx.font = `600 16px "R201WK",${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = GOLD; ctx.fillText('换白玉', x + w / 2, y + h / 2 + 1); ctx.restore(); } } catch (e) {}
    return r; })(drawMenu);
  try { (window.TEST_TOGGLES || (window.TEST_TOGGLES = [])).push({ name: '行囊皮肤：乌木鎏金（R373）', get: () => wood, set: v => window.R373_SKIN.set(v) }); } catch (e) {}
})();
