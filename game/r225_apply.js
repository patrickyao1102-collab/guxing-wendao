// ================= R225 / R226 · 账房新布局、茶座、带人座位组、短楼梯口（只进测试版）=================
// 在 r213_rooms.js 搭房间之前，把 r213/patch.js 里的新数据换进 R213_ROOMS。
(function () {
  const D = window.R213_ROOMS, Pt = window.R225_PATCH; if (!D || !Pt) return;
  Object.assign(D.objs, Pt.objs);
  // 账房：整间换成新布局
  if (Pt.rooms.qy_changle_2f) D.rooms.qy_changle_2f = Pt.rooms.qy_changle_2f;
  // 带人座位组：六帧循环，切成单帧，IMG 里按时间取帧
  const anim = (k) => { const a = Pt.anim[k], key = 'r213_' + k, im = new Image(), fr = []; im.onload = () => { for (let i = 0; i < a.n; i++) { const c = document.createElement('canvas'); c.width = a.fw; c.height = a.fh; c.getContext('2d').drawImage(im, i * a.fw, 0, a.fw, a.fh, 0, 0, a.fw, a.fh); fr.push(c); } };
    im.src = 'r213/a_' + k + '.webp'; try { Object.defineProperty(IMG, key, { configurable: true, enumerable: true, get: () => fr.length ? fr[Math.floor(performance.now() / 1000 * a.fps) % fr.length] : undefined, set: () => {} }); } catch (e) {} return a; };
  // 倚翠楼琴堂：四张饭馆方桌 → 茶座（两组有客人在喝茶听琴，两组空着）
  { const R = D.rooms.qy_yicui, kinds = ['set_tea_two_scholars', 'tea_seat_low', 'tea_seat_round', 'set_tea_two_couple']; let i = 0;
    R.objs = R.objs.filter(o => o.id !== 'interior_wall_stairwell_front').map(o => { if (o.id !== 'tea_table') return o; const k = kinds[i++ % kinds.length], cx = o.x + o.w / 2, isA = !!Pt.anim[k], a = isA ? anim(k) : Pt.objs[k], w = isA ? a.fw : a.w, h = isA ? a.fh : a.h;
      return { id: k, img: 'r213_' + k, uid: o.uid, x: cx - a.ax, y: o.sy - a.ay + 6, w, h, sy: o.sy + 6, flat: false, noPre: isA }; }); }
  { const R = D.rooms.qy_changle; R.objs = R.objs.filter(o => o.id !== 'interior_wall_stairwell_front'); }
  // 短楼梯口：传送点挪到楼梯口前的平地，原来长楼梯占的格子放开
  const tp = Pt.nook && Pt.nook.tp || [94, 304];
  for (const sid of ['qy_yicui', 'qy_changle']) { const R = D.rooms[sid], b = R.blocked.split(''), cs = R.cs;
    for (let r = Math.floor(250 / cs); r <= Math.floor(520 / cs); r++) for (let c = 1; c <= Math.floor(232 / cs); c++) b[r * R.cols + c] = '0';
    R.blocked = b.join(''); const e = R.exits.find(e => /^up_to/.test(e.id)); if (e) e.region = { x: 32, y: tp[1] - 48, w: 192, h: 64 }; }
  window.R225_ON = true;
})();
