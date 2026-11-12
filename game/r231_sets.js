// ================= R231 · 带人座位组第三批（Codex R230 的 30 组；作者 11-12：素材太少，不同桌子、不同的人、不同姿势，按场景摆）=================
// 茶馆放下棋喝茶的，酒楼放划拳醉酒的，客栈放吃饭的行商和一家人，赌坊放马吊和叶子牌。
// 做法：把屋里原来的空桌子原地换成「桌子 + 人」的一整组（六帧循环），落脚点对齐原桌子的底边中点；人占的地方补上挡路。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  // 组名: [帧宽, 帧高, 锚点x, 锚点y, 占地x, 占地y, 占地宽, 占地高]
  const A = {"tea_chess":[224,192,112,176,33,115,159,61],"tea_mother_girl":[224,192,112,176,31,112,160,64],"tea_two_ladies":[192,160,96,144,17,83,158,61],"tea_old_scholar":[192,160,96,144,31,83,131,61],"tea_lady_fan":[192,160,96,144,24,90,146,54],"sq4_escorts":[288,256,144,240,59,164,171,76],"round2_old_friends":[224,192,112,176,37,117,150,59],"sq2_drunk":[256,224,128,208,53,143,152,65],"sq1_swordsman":[256,224,128,208,70,144,119,64],"round3_cultivators":[256,224,128,208,44,140,174,68],"sq2_merchants":[256,224,128,208,56,143,145,65],"sq4_family":[288,256,144,240,61,162,170,78],"round5_feast":[320,256,160,240,73,161,178,79],"sq2_guards":[288,256,144,240,69,178,153,62],"long_solo_noodles":[384,256,192,240,75,172,234,68],"long6_caravan":[384,256,192,240,78,159,227,81],"sq2_cultivator_pair":[256,224,128,208,52,147,152,61],"madiao4":[288,256,144,240,60,160,169,80],"cards_two":[224,192,112,176,40,115,145,61],"gamble_winner":[288,256,144,240,88,175,123,65],"vip_two_appraise":[288,224,144,208,60,148,168,60]};
  const anim = k => { const key = 'r230_' + k, d = Object.getOwnPropertyDescriptor(IMG, key); if (d && d.get) return key; const a = A[k], im = new Image(), fr = [];
    im.onload = () => { for (let i = 0; i < 6; i++) { const c = document.createElement('canvas'); c.width = a[0]; c.height = a[1]; c.getContext('2d').drawImage(im, i * a[0], 0, a[0], a[1], 0, 0, a[0], a[1]); fr.push(c); } };
    im.src = 'r230/a_' + k + '.webp';
    try { Object.defineProperty(IMG, key, { configurable: true, enumerable: true, get: () => fr.length ? fr[Math.floor(performance.now() / 1000 * 6) % fr.length] : undefined, set: () => {} }); } catch (e) {} return key; };
  // [地图, 原物件 id, 第几个(同 id 里), 换成哪组, 放大倍数, 顺手拿掉的散凳（[id, 第几个]…）]
  const PUT = [
    ['qy_tea', 'tea_table', 1, 'tea_chess', 1], ['qy_tea', 'tea_table', 3, 'tea_mother_girl', 1],
    ['qy_tavern', 'tea_table', 0, 'sq4_escorts', 1], ['qy_tavern', 'tea_table', 1, 'round2_old_friends', 1], ['qy_tavern', 'tea_table', 3, 'sq2_drunk', 1], ['qy_tavern', 'tea_table', 4, 'sq1_swordsman', 1], ['qy_tavern', 'tea_table', 5, 'round3_cultivators', 1],
    ['qy_inn', 'tea_table', 1, 'sq2_merchants', 1], ['qy_inn', 'tea_table', 3, 'sq4_family', 1],
    ['xt_inn_hall', 'dining_03', 0, 'round5_feast', 1.3], ['xt_inn_hall', 'dining_01', 0, 'sq2_guards', 1.3], ['xt_inn_hall', 'dining_05', 0, 'long_solo_noodles', 1.2], ['xt_inn_hall', 'dining_09', 0, 'long6_caravan', 1.2], ['xt_inn_hall', 'dining_10', 0, 'sq2_cultivator_pair', 1.3],
    ['qy_yicui', 'r226_tea_low', 0, 'tea_two_ladies', 1, [['r226_stool_extra', 0], ['r226_stool_extra', 1]]], ['qy_yicui', 'set_tea_one', 0, 'tea_old_scholar', 1],
    ['qy_changle', 'paijiu_table', 0, 'madiao4', 1, [['plain_stool', 0], ['plain_stool', 1], ['plain_stool', 2], ['plain_stool', 3]]], ['qy_changle', 'paijiu_table', 1, 'cards_two', 1, [['plain_stool', 4], ['plain_stool', 5], ['plain_stool', 6], ['plain_stool', 7]]], ['qy_changle', 'set_gamble_four', 1, 'gamble_winner', 1],
  ];
  const pick = (bk, id, i) => (bk.objs || []).filter(o => o.id === id)[i];
  const drop = new Set(), done = [];
  for (const [map, id, i, k, sc, rm] of PUT) { const M = TMAPS[map], bk = M && M.baked; if (!bk || !A[k]) continue; const o = pick(bk, id, i); if (!o) continue;
    const a = A[k], cx = o.x + o.w / 2, by = o.sy != null ? o.sy : o.y + o.h; for (const [rid, ri] of rm || []) { const s = pick(bk, rid, ri); if (s) drop.add(s); }
    done.push([bk, o, { id: 'set_' + k, uid: 'r231_' + map + '_' + k, img: anim(k), w: Math.round(a[0] * sc), h: Math.round(a[1] * sc), x: Math.round(cx - a[2] * sc), y: Math.round(by - a[3] * sc), sy: Math.round(by), flat: false, noPre: true },
      [cx + (a[4] - a[2]) * sc, by + (a[5] - a[3]) * sc, a[6] * sc, a[7] * sc]]); }
  for (const [bk, o, n, fp] of done) { for (const key of Object.keys(o)) delete o[key]; Object.assign(o, n);
    // 人坐的地方也挡路（原来只挡桌子）；NPC 站的格子、出入口不动
    try { if (typeof bk.blocked === 'string' && bk.cols) { const cs = bk.cs, B = bk.blocked.split(''); for (let y = Math.floor(fp[1] / cs); y <= Math.floor((fp[1] + fp[3] - 1) / cs); y++) for (let x = Math.floor(fp[0] / cs); x <= Math.floor((fp[0] + fp[2] - 1) / cs); x++) if (x >= 0 && y >= 0 && x < bk.cols && y < bk.rows) B[y * bk.cols + x] = '1'; bk.blocked = B.join(''); } } catch (e) {} }
  for (const [bk] of done) if (drop.size) bk.objs = bk.objs.filter(o => !drop.has(o));
  window.R231S = { A, PUT, n: done.length };
})();
