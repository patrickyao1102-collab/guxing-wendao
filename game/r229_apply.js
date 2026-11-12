// ================= R229 · R225 后续新布局（听雨阁 / 琴堂 / 赌坊）+ R226 第二批带人座位组（只进测试版）=================
// 在 r225_apply.js 之后、r213_rooms.js 之前：把 r213/patch2.js 里的三间新屋子整间换进 R213_ROOMS；
// 带人座位组（六帧循环）做成按时间取帧的图，玄天城的云来大堂也用同一批。
(function () {
  const D = window.R213_ROOMS, Pt = window.R229_PATCH; if (!D || !Pt) return;
  Object.assign(D.objs, Pt.objs);
  for (const sid in Pt.rooms) D.rooms[sid] = Pt.rooms[sid];
  for (const k in Pt.anim) { const a = Pt.anim[k], key = 'r213_' + k, d = Object.getOwnPropertyDescriptor(IMG, key); if (d && d.get) continue;
    const im = new Image(), fr = []; im.onload = () => { const fw = im.width / a.n, fh = im.height; for (let i = 0; i < a.n; i++) { const c = document.createElement('canvas'); c.width = fw; c.height = fh; c.getContext('2d').drawImage(im, i * fw, 0, fw, fh, 0, 0, fw, fh); fr.push(c); } };
    im.src = 'r213/a_' + k + '.webp';
    try { Object.defineProperty(IMG, key, { configurable: true, enumerable: true, get: () => fr.length ? fr[Math.floor(performance.now() / 1000 * a.fps) % fr.length] : undefined, set: () => {} }); } catch (e) {} }
  window.R229_ON = true;
})();
