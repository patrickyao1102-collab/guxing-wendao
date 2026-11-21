// ================= R365 · 中秋夜饭桌换成 Codex R358 那套（作者 11-21）（只进测试版）=================
// 作者 11-21 实机：「这个桌子也没换……桌子和人物大小还有中秋节这个剧情匹配吗？一点也不匹配」——之前是把正房的雕花太师椅、茶桌搬到院子里凑数，比人大一大截。
// 换成 Codex R358 第一步（已通过）：家常方桌、三把围着桌子的椅子（左右侧对桌子，后面一把朝镜头），桌上三副碗筷、三只茶盏、桂花糕、三碟小菜、一碟月饼；
//   三人的坐姿关键帧（阿焰 9 个、叶孤星 3 个、阿澈 3 个）先当动作用，Codex R365 的逐帧交来再换成逐帧。
// 世界坐标照 R358 摆位与脚点.json（dx_home 1x）：桌 (729,558) 142×94；左椅 (701,593)；右椅 (865,593)；后椅 (780,527)；
//   阿焰脚点 (739,657)、叶孤星 (869,657)、阿澈 (800,594)。层次：椅子 → 人 → 桌子 → 桌上东西。
// 另外：阿澈中秋夜进门那一身（厚围巾、提着笼屉，R316 已做好的四向行走）接上。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const K = ['table', 'chair_l', 'chair_r', 'chair_b', 'bowl', 'cup', 'cup_empty', 'cup_chip', 'steam', 'teapot', 'cakes', 'fish', 'greens', 'tofu', 'mooncakes',
    'yan_sit', 'yan_pour', 'yan_look', 'yan_cup', 'yan_cupdown', 'yan_rise', 'yan_stand', 'yan_eat', 'yan_glance', 'ye_sit', 'ye_drink', 'ye_eat', 'che_sit', 'che_smile', 'che_eat'];
  let loaded = false;
  const load = () => { if (loaded) return; loaded = true;
    for (const k of K) { const im = new Image(); im.onload = () => { try { IMG['r365_' + k] = im; } catch (e) {} }; im.src = 'r365/' + k + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} } };
  const SEAT = { yan: [739, 657], ye: [869, 657], che: [800, 594] };
  // 桌上的东西：[图, 左上x, 左上y, 宽, 高]
  const TOP = [['bowl', 739, 574, 16, 13], ['bowl', 836, 574, 16, 13], ['bowl', 793, 559, 16, 13], ['teapot', 762, 559, 19, 14], ['cakes', 776, 573, 26, 21],
    ['fish', 805, 576, 31, 16], ['greens', 740, 589, 25, 15], ['tofu', 774, 590, 25, 15], ['mooncakes', 807, 590, 25, 15], ['cup', 762, 584, 8, 8], ['cup', 841, 591, 8, 8]];
  const st = { on: false, cups: 'before', held: false, pose: {} };
  const T = () => (world.mapName === 'dx_home' && world.map && world.map.T) || null;
  const rebuild = () => { const t = T(); if (!t || !t.objs) return; t.objs = t.objs.filter(o => !o._r365);
    if (!st.on) return;
    const add = (k, x, y, w, h, sy, extra) => t.objs.push(Object.assign({ _r365: 1, bk: true, id: 'r365_' + k, uid: 'r365_' + k + '_' + t.objs.length, img: 'r365_' + k, x, y, w, h, sy, noBlock: true }, extra || {}));
    add('chair_b', 780, 527, 40, 61, 588); add('chair_l', 701, 593, 44, 61, 654); add('chair_r', 865, 593, 44, 61, 654);
    add('table', 729, 558, 142, 94, 662);
    for (const [k, x, y, w, h] of TOP) add(k, x, y, w, h, 663);
    if (st.cups === 'before') { if (!st.held) add('cup_empty', 798, 566, 8, 8, 663); }
    else { add('cup_chip', 771, 584, 8, 8, 663); add('steam', 762, 568, 18, 16, 664, { _steam: 1 }); }
    for (const who in st.pose) { const k = st.pose[who]; if (!k) continue; const [fx, fy] = SEAT[who]; add(k, fx - 80, fy - 232, 160, 240, fy + (who === 'che' ? 0 : 1)); } };
  // 茶汽轻轻往上飘（一张图上下浮、明暗呼吸，Codex 逐帧来了换掉）
  if (typeof tileDraw === 'function') tileDraw = (o => function () { try { const t = T(); if (st.on && t && t.objs) { const k = performance.now() / 1000; for (const ob of t.objs) if (ob._steam) { ob.y = 568 - (k * 6 % 6); ob.alpha = .55 + .35 * Math.sin(k * 2.2); } } } catch (e) {} return o.apply(this, arguments); })(tileDraw);
  window.DXD = {
    SEAT,
    load,
    on(cups) { load(); st.on = true; st.cups = cups || st.cups; st.held = false; rebuild();
      try { const t = T(); for (const ob of (t && t.objs) || []) if (ob.id === '02A_basket_center') { ob._img0 = ob._img0 || ob.img; ob.img = 'r344_none'; } } catch (e) {} },
    off() { st.on = false; st.pose = {}; rebuild(); try { const t = T(); for (const ob of (t && t.objs) || []) if (ob.id === '02A_basket_center' && ob._img0) ob.img = ob._img0; } catch (e) {} },
    pose(who, k) { st.pose[who] = k ? (k.indexOf('_') > 0 ? k : who + '_' + k) : null; rebuild(); },
    poses(o) { for (const w in o) st.pose[w] = o[w] ? w + '_' + o[w] : null; rebuild(); },
    cups(s) { st.cups = s; rebuild(); },
    hold(b) { st.held = !!b; rebuild(); },
    // 头顶冒泡；有小云雀配音的句子一起放（R359 只认对话框，这里补上）
    async say(who, text, o) { o = o || {}; const a = typeof who === 'string' ? { x: SEAT[who][0], y: SEAT[who][1] } : who;
      let ms = o.ms; try { const name = o.name; if (name && window.R359VO) { const id = R359VO.find(name, text); if (id) { R359VO.play(id); const v = R359VO.V.find(e => e[2] === id); if (v) ms = Math.max(ms || 0, v[3] * 1000 + 500); } } } catch (e) {}
      if (!window.BUB) return new Promise(r => setTimeout(r, ms || 1800));
      return BUB.say(a, text, { h: o.h || (typeof who === 'string' ? 98 : 120), ms }); },
  };
  // 中秋夜还用旧接口（r329 里 DX_DINNER(true/false)）的地方，一律改到这套
  window.DX_DINNER = on => { if (on) DXD.on(); else DXD.off(); };
  // 阿澈厚围巾提笼那一身：actor._r365scarf = true 时用这张图集（4 行 下/上/左/右 × 4 帧，@2x 320×480，脚点 160,464）
  const SC = new Image(); SC.src = 'r365/che_scarf_walk.webp?v=1';
  const ROW = { down: 0, up: 1, left: 2, right: 3 };
  if (typeof walkFinalDraw === 'function') walkFinalDraw = (o => function (a, now) {
    if (a && a._r365scarf && SC.complete && SC.naturalWidth) { try {
      let f = a.face || 'down'; if (a.moving && a.tx != null) { const dx = a.tx - a.x, dy = a.ty - a.y; f = Math.abs(dx) > Math.abs(dy) * 1.2 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
      if (!(f in ROW)) f = 'down'; const t = now || performance.now() / 1000;
      ctx.save(); ctx.globalAlpha *= a.alpha ?? 1; ctx.drawImage(SC, (a.moving ? Math.floor(t / .16) % 4 : 1) * 320, ROW[f] * 480, 320, 480, a.x - 80, a.y - 232, 160, 240); ctx.restore(); return true; } catch (e) {} }
    return o.apply(this, arguments); })(walkFinalDraw);
  // 中秋夜一开始就预载（F().dx_night 置 1 的时候）
  setInterval(() => { try { if (S && S.flags && S.flags.dx_night) load(); } catch (e) {} }, 2500);
})();
