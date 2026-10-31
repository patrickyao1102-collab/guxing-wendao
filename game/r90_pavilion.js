// R90 云海大亭：亭子整张图（台基 + 台阶 + 柱子 + 屋顶）原来按一个物件排序，人走上台基就被整座亭子盖住。
// 临时拆层（等 Codex 重画分层的亭子）：
//   地面层 = 台基、台阶（平铺在地上，永远在人物下面）
//   中层   = 后排栏杆、后柱、灯笼（按台基后沿排序：人在亭内就站在它们前面）
//   前柱   = 四根前柱（按柱脚排序：人走到柱子后面会被柱子挡住）
//   屋顶   = 屋顶和梁（永远盖在人物上面，人在亭下时半透明，看得见人）
(function () {
  if (typeof tileSetMap !== 'function' || typeof drawBaked !== 'function') return;
  const MAP = 'qingzhu_upper_pavilion', UID = 'r24-pavilion-base';
  const ROOF = 470, MID = 640, PL = 760;                        // 原图 960×960 里的分界行
  const STRIPS = [[95, 190], [272, 360], [598, 690], [772, 862]]; // 四根前柱的横向范围
  const gaps = (a, b) => { const out = []; let x = 0; for (const [l, r] of STRIPS) { if (l > x) out.push([x, a, l - x, b - a]); x = r; } if (x < 960) out.push([x, a, 960 - x, b - a]); return out; };
  function split(o) {
    const base = Object.assign({}, o), sc = o.h / 960, Y = r => o.y + r * sc, pieces = [];
    const mk = (tag, rects, sy, flat) => pieces.push(Object.assign({}, base, { uid: UID + '-' + tag, cut: rects, sy, flat: !!flat, pav: tag }));
    mk('floor', [[0, PL, 960, 960 - PL]].concat(gaps(MID, PL)), Y(960), true);
    mk('mid', gaps(ROOF, MID), Y(650));
    for (const [l, r] of STRIPS) mk('pillar', [[l, ROOF, r - l, PL - ROOF]], Y(755));
    mk('roof', [[0, 0, 960, ROOF]], 1e9);   // 最后画
    return pieces;
  }
  tileSetMap = (orig => function (name) { const res = orig.apply(this, arguments);
    try { if (name === MAP && world.map && world.map.T && world.map.T.objs) { const L = world.map.T.objs, i = L.findIndex(o => o.uid === UID || (o.id === 'qingzhu-r24-pavilion' && !o.pav)); if (i >= 0) L.splice(i, 1, ...split(L[i])); } } catch (e) { console.warn('r90 pavilion', e); }
    return res; })(tileSetMap);
  drawBaked = (orig => function (o, now) {
    if (!o || !o.cut) return orig.apply(this, arguments);
    const sc = o.w / 960; ctx.save(); ctx.beginPath(); for (const [x, y, w, h] of o.cut) ctx.rect(o.x + x * sc, o.y + y * sc, w * sc, h * sc); ctx.clip();
    if (o.pav === 'roof') { const p = world.player; if (p && p.x > o.x + 20 * sc && p.x < o.x + 940 * sc && p.y - 115 < o.y + ROOF * sc && p.y > o.y + 60 * sc) ctx.globalAlpha *= .5; }   // 人走到亭子后面被屋顶挡住时，屋顶变半透明
    orig.apply(this, arguments); ctx.restore();
  })(drawBaked);
})();
