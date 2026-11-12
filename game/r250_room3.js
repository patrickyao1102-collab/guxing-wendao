// ================= R250 · 天字三号房添家具（作者 11-13：客栈的天字号房间好空；直接拿现成素材去拼）=================
// 地面上三块颜色不对的补丁已经在图里抹平；这里用现成素材添：茶座一组（两把官帽椅 + 矮茶几 + 地毯）、圆桌下的地毯、屏风、立灯、盆竹、兰花架、香炉。
// 不挡线索、不挡门口。只进测试版。
(function () {
  const M = typeof TMAPS !== 'undefined' && TMAPS.xt_inn_room3, D = M && M.baked; if (!D || !D.objs || D._r250) return; D._r250 = 1;
  const cs = D.cs, B = D.blocked.split('');
  const ex = (id, img, x, y, w, h, o) => Object.assign({ id: 'r250_' + id, img, uid: 'r250-' + id + '-' + x, x, y, w, h, sy: y + h, ax: x + w / 2, ay: y + h, flat: false, flip: false, noBlock: true }, o || {});
  const X = [
    ex('rug', 'cx2_bedroom_jade_rug_r6_8b986e', 250, 572, 400, 150, { flat: true, sy: 1 }), ex('rug2', 'cx2_bedroom_jade_rug_r6_8b986e', 760, 452, 330, 150, { flat: true, sy: 1 }),
    ex('chair', 'r213_guest_hat_chair', 300, 600, 76, 108), ex('chair2', 'r213_guest_hat_chair_mirror', 524, 600, 76, 108), ex('teatable', 'r213_guest_low_tea_table', 386, 640, 128, 72),
    ex('screen', 'r213_n2_folding_screen', 60, 716, 264, 194), ex('lampB', 'cx2_bedroom_standing_lamp_r6_31fffe', 600, 190, 37, 168), ex('bamboo', 'cx2_bedroom_potted_bamboo_r6_6b9bfa', 62, 240, 99, 149),
    ex('orchid', 'r213_n2_orchid_stand', 950, 816, 48, 96), ex('incense', 'r213_n2_incense_burner', 880, 300, 60, 79), ex('lamp', 'r213_floor_lamp', 1222, 800, 32, 88),
  ];
  for (const o of X) { D.objs.push(o); if (o.flat) continue;
    for (let y = Math.floor((o.sy - Math.min(46, o.h * .35)) / cs); y <= Math.floor((o.sy - 1) / cs); y++) for (let x = Math.floor((o.x + 6) / cs); x <= Math.floor((o.x + o.w - 7) / cs); x++) if (x >= 0 && y >= 0 && x < D.cols && y < D.rows) B[y * D.cols + x] = '1'; }
  D.blocked = B.join('');
})();
