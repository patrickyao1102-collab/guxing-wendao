// ================= R260 · 玄天城外景：天剑宗据点、城主府两座院子的院墙连成一圈 =================
// 作者 11-13：「玄天城外面有些墙是不连起来的」——北面根本没有墙，东西两道竖墙到顶就断了；据点大门两侧和墙段之间各漏一条缝；
// 两座院子中间是两道竖墙并排（中间夹一条缝）。
// 改法：都用外景里现成的那两种墙（横段 136×104、竖段 40×200，和城主府前院、林府花庭里的是同一套），
// 北面补一整排；两座院子中间并成一道墙；大门两侧的缝补上。院子里不能再从北边绕进去（只能从大门进）。只进测试版。
(function () {
  const M = typeof TMAPS !== 'undefined' && TMAPS.xt_city, B = M && M.baked; if (!B || !B.objs) return;
  const cs = B.cs, C = B.cols, R = B.rows, bl = B.blocked.split('');
  const H = B.objs.find(o => o.id === 'courtyard_wall_horizontal'), V = B.objs.find(o => o.id === 'courtyard_wall_vertical'); if (!H || !V) return;
  const hdy = H.sy - H.y, vdy = V.sy - V.y;
  const set = (x0, y0, x1, y1, v) => { for (let r = Math.floor(y0 / cs); r <= Math.floor((y1 - 1) / cs); r++) for (let c = Math.floor(x0 / cs); c <= Math.floor((x1 - 1) / cs); c++) if (r >= 0 && c >= 0 && r < R && c < C) bl[r * C + c] = v; };
  let n = 0;
  // sy：墙脚那条线（人走到它北边就被挡住）；k：同一条线上要排在门楼后面画的，sy 减 1
  const addH = (x, sy, k) => { B.objs.push(Object.assign({}, H, { uid: 'r260_h' + (n++), x, y: sy - hdy, sy: sy - (k || 0) })); set(x + 4, sy - 32, x + H.w - 4, sy, '1'); };
  const addV = (x, y) => { B.objs.push(Object.assign({}, V, { uid: 'r260_v' + (n++), x, y, sy: y + vdy })); set(x, y + 8, x + V.w, y + V.h, '1'); };
  // ① 北面一整排：墙脚对齐竖墙的顶端（y=227），从据点西墙外 189 一直到城主府东墙 2757，步距 128（和南墙一样，接缝落在木框上）
  for (let x = 189; x <= 2621; x += 128) addH(x, 227);
  // ② 两座院子中间：原来是 x=1645、x=1709 两道竖墙并排，并成一道 x=1661（据点南墙从西边接过来，城主府南墙从它这里起头）
  B.objs = B.objs.filter(o => !(o.id === 'courtyard_wall_vertical' && (Math.round(o.x) === 1645 || Math.round(o.x) === 1709)));
  set(1632, 224, 1760, 832, '0');
  for (const y of [227, 419, 611]) addV(1661, y);
  // ③ 据点大门两侧：墙段和门楼的短墙之间各漏一条缝，各补一段，补的这段一半藏在门楼短墙后面
  addH(573, 832, 1); addH(1213, 832, 1);
  // ④ 何家挪到西街这栋（门前原来一丛灌木正挡在门口，往西挪开一点）
  { const sh = B.objs.find(o => o.id === 'shrub' && Math.round(o.x) === 213 && Math.round(o.sy) === 1733); if (sh) sh.x = 128; }
  // ⑤ 两座院子里面整片标成不能走：玩家本来就只能从大门进（进门是另一张图），这样街上的路人也不会刷到院墙里面去
  set(285, 256, 1653, 800, '1'); set(1709, 256, 2725, 736, '1');
  // ⑥ 院里原来有个宝箱（据点西北角竹子旁），院子封了以后够不着 → 挪到据点北墙外的草地上
  try { const ch = (M.chests || []).find(c => c.c === 6.5 && c.r === 4); if (ch) { ch.c = 420 / 64 - .5; ch.r = 92 / 64 - .8; } } catch (e) {}
  // ⑦ 据点院里北面正中那栋：换成前院里那座新正厅（同一张图缩小），外面看和进门看是同一座楼
  try { const h = B.objs.find(o => o.id === 'lin_main_hall' && Math.round(o.x) === 766); if (h && window.R260_COURT) {
      if (!IMG.r260c_hall) { const im = new Image(); im.onload = () => { try { IMG.r260c_hall = im; } catch (e) {} }; im.src = 'r260/court/o_hall.webp'; }
      const w = 520, hh = Math.round(w * 560 / 1000), cx = h.x + h.w / 2; Object.assign(h, { img: 'r260c_hall', x: Math.round(cx - w / 2), y: Math.round(h.sy - hh * 557 / 560), w, h: hh }); } } catch (e) {}
  B.blocked = bl.join('');
  try { if (window.MM_CLEAR) MM_CLEAR('xt_city'); } catch (e) {}
  window.R260W = { n };
})();
