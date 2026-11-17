// ================= R352 · 阿澈家在青阳镇街上的门面（Codex R352 第二步正式资源，作者选「返工1 A 小房接院」）（只进测试版）=================
// 换掉青阳镇西北角那栋「民居」（house_01 197,63）。整栋 1x 500×333（@2x 1000×666），左上 (0,0)，地面线 y=333；
// 左边一间小房，房门就是入口（门槛 (241,317)，法阵在门前台阶上 (241,325)），右边折墙围着桂树小院，后面露出师父正房。
// 从这扇门进去 = 阿澈家院子南院门里；院门出来落回这扇门口的街上 (241,392)。原来民居门口那只水缸挪走（正挡在门前）。
// r302 每次进青阳镇都会把物件和碰撞重置一遍，所以都在进图之后补（物件、门、碰撞串 + T.block）。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.qy_town || !TMAPS.qy_chehome) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  { const im = new Image(); im.onload = () => { try { IMG.r352_che = im; } catch (e) {} }; im.src = 'r352/che_closed.webp?v=1'; }
  const OBJ = { id: 'r352_che', uid: 'r352_che', img: 'r352_che', x: 0, y: 0, w: 500, h: 333, sy: 311, flip: false, noBlock: true, noPre: true, bk: true };
  const DOOR = { x: 241, y: 325, rw: 24, rh: 12, rect: [241, 325, 24, 12], upOnly: true, to: 'qy_chehome', at: P(1005, 1150), face: 'up', label: '阿澈家' };
  const BODY = [[29, 92], [478, 92], [497, 214], [497, 333], [298, 333], [298, 312], [193, 312], [193, 333], [29, 333]];
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const isOld = o => o && ((o.id === 'house_01' && Math.round(o.x) === 197 && Math.round(o.y) === 63) || (o.id === 'water_jar' && Math.round(o.x) === 250 && Math.round(o.y) === 293));
  for (const d of TMAPS.qy_town.doors || []) if (d.to === 'qy_house') Object.assign(d, DOOR);
  const patch = () => { const T = world.map && world.map.T; if (!T) return; const QB = TMAPS.qy_town.baked, cs = QB.cs, cols = QB.cols, bl = QB.blocked.split('');
    for (const o of T.objs || []) if (isOld(o)) Object.assign(o, { img: 'r343_none', w: 1, h: 1, noBlock: true });
    if (IMG.r352_che && !(T.objs || []).some(o => o.uid === 'r352_che')) T.objs.push(Object.assign({}, OBJ));
    let had = false; for (const d of T.doors || []) if (d.to === 'qy_house' || d.to === 'qy_chehome') { Object.assign(d, DOOR); had = true; }
    if (!had) (T.doors = T.doors || []).push(Object.assign({}, DOOR));
    for (let r = Math.floor(60 / cs); r <= Math.floor(372 / cs); r++) for (let c = 0; c <= Math.floor(520 / cs); c++) { if (r >= QB.rows || c >= cols) continue;
      const x = (c + .5) * cs, y = (r + .5) * cs; let v = inPoly(x, y, BODY) ? 1 : (y < 362 && x < 512 ? 0 : -1);
      if (v < 0) continue; if (T.block[r]) T.block[r][c] = v; bl[r * cols + c] = v ? '1' : '0'; }
    QB.blocked = bl.join(''); };
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { const r = o.apply(this, arguments); if (m === 'qy_town') { try { patch(); } catch (e) { console.warn('R352', e); } } return r; })(tileSetMap);
})();
