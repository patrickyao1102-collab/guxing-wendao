// ================= R302 · 逐张地图查漏（11-15，作者在整理房间，让我一张一张地图查）=================
// ① 后山 · 林间（seal_field）：回「演武广场」的传送阵画在地图最下沿，那几行全是挡路格，人走不到阵上 → 阵上那块打开，出口挪到阵上（y 864–927）。
// ② 玄天城 · 许家：许家的门画在前排梁家的屋顶上（许宅整栋藏在梁家背后），门光浮在屋瓦上 → 照作者 11-14 对王家、李家的处理：关门，房子照旧摆着。
// ③ 幽影林 · 追虎迷径：守林老人站在大松树的树冠底下，只看得见头顶的名字 → 挪到林间小路上（入口北边一点）。
// ④ 林府 · 东厢：林府老管事站在屏风边上，半个身子插进屏风里 → 挪到屏风右前方的空地上。
// ⑤ 自动扫了一遍「人被前面的东西整个挡住、只露名字」：青阳镇南门两个城门护卫藏在城楼里 → 站到城门外传送阵两边；
//    扎辫子的小丫头和大黄被民居屋顶盖住 → 挪到屋后街上；玄天城富家公子、江湖郎中躲在枫树树冠里 → 挪出来一点；
//    镖师整个人在南城门楼里 → 站到城门洞里左边；卖炊饼的汉子被醉仙楼的长幡挡着 → 右挪；城主府宝库守阁人在火晶台后面 → 站到台子右边；
//    林府护卫在大门屋顶后面 → 站到大门右侧。（听雨楼掌柜在柜台后面露半身，是对的，不动。）
// ⑥ 作者 11-15 23:34：「这个书生走路是跳着抖的」——没有走路帧的路人一闲逛，游戏就让整张站姿图一蹦一蹦地滑过去。
//    → 凡是没有走路帧的人（小狗小鸡照旧），不再闲逛，原地站着（只留轻微呼吸起伏）。有走路帧的照常走。
// ⑦ 作者 11-15 23:37：花婆家供桌——神像和香炉浮在桌子后面，不在桌面上，香炉也偏 → 神像放到桌面正中靠后，香炉放在神像正前方。
// ⑧ 作者 11-15 23:52：玄天城据点门口左边那间空屋和旁边一段竹篱笆「太挡路了」→ 拆掉（这间屋没有门，进不去），脚下的挡路格放开。
// ⑨ 作者 11-15：听雨楼一楼「绣庄的女掌柜」还是村妇模型 → 换 Codex R304 新做的绣庄女掌柜（藕荷绣花褙子、发髻单簪、手持绣样）。
//    （二楼五人比例返工：直接替换了 r254f2 里同名的帧条，不用代码。）
// ⑩ 作者 11-15 23:32：百草轩——打叉的青瓷缸、药碾、麻袋、茶桌凳都删掉；香炉挪到屋子正中；加一个来看病的老先生、一个来抓药的娘子。
// ⑪ 作者 11-15 23:33：「这种摊位一不能互动，二没有专属 NPC 站在这里，弄起来有什么用」「建议删掉，每张地图都有客栈药店武器铺」
//    → 玄天城三个没人的摊（灵兽摊、兵器摊、食摊）、苍月城南门八个没人的遮阳摊全部拆掉，挡路格放开；
//      青阳镇三个摊（灵兽、包子、兵器）是灯会那一夜才有摊主的 → 只在灯会那一夜摆出来，平时拆掉；大黄挪出包子摊屋檐。
// 只进测试版。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const SF = TMAPS.seal_field;
  if (SF && SF.baked && SF.baked.cs === 32) {
    (SF.open = SF.open || []).push([18, 26, 12, 5]);
    for (const e of SF.exits || []) if (e.to === 'tj_front' && e.y >= 30) Object.assign(e, { y: 27, h: 2 });   // 镜头到不了最底下那 100 像素：阵画在 y≈888，出口就放在阵上
  }
  const XC = TMAPS.xt_city;
  if (XC) XC.doors = (XC.doors || []).filter(d => d.to !== 'xt_home_xu');
  //            地图                 人             原 x   原 y    新 x   新 y
  { const HP = TMAPS.ml_huapo, O = HP && HP.baked && HP.baked.objs; if (O) for (const o of O) {
      if (o.img === 'r297_house_deity_36x62') Object.assign(o, { x: 311, y: 211 });      // 供桌 215–443，桌面约 y255–290：神像脚底落在 y273
      if (o.img === 'r297_house_incense_30x40') Object.assign(o, { x: 314, y: 248 }); } }   // 香炉在神像正前方，脚底 y288
  { const XB = TMAPS.xt_city && TMAPS.xt_city.baked;
    if (XB) { const kill = o => (o.img === 'cx2_house_02_8ee1c4' && Math.round(o.x) === 165 && Math.round(o.y) === 721) || (o.img === 'cx2_bamboo_fence_c71342' && Math.round(o.x) === 483 && Math.round(o.y) === 1049);
      const gone = XB.objs.filter(kill); if (gone.length) { XB.objs = XB.objs.filter(o => !kill(o)); const cs = XB.cs, B = XB.blocked.split('');
        const keep = (x, y) => XB.objs.some(o => o.w * o.h > 1500 && x >= o.x && x < o.x + o.w && y >= (o.sy || o.y + o.h) - Math.min(90, o.h * .4) && y < (o.sy || o.y + o.h) + 6);
        for (const o of gone) { const y0 = o.h > 150 ? o.sy - 150 : o.y, y1 = o.sy + 8;
          for (let y = y0; y < y1; y += cs) for (let x = o.x; x < o.x + o.w; x += cs) { const c = Math.floor(x / cs), r = Math.floor(y / cs); if (c >= 0 && r >= 0 && c < XB.cols && r < XB.rows && !keep(c * cs + cs / 2, r * cs + cs / 2)) B[r * XB.cols + c] = '0'; } }
        XB.blocked = B.join(''); } } }
  { const TH = TMAPS.xt_teahouse; for (const n of (TH && TH.npcs) || []) if (n.name === '绣庄的女掌柜' && !n.hidden) { n.w9 = 'xiuzhuang'; n.cx = n.cx || 'villager_f'; n.h = 116; n.wander = false; } }
  { const HB = TMAPS.qy_herb, B = HB && HB.baked;
    if (B && !B._r302) { B._r302 = 1; const cs = B.cs, G = B.blocked.split('');
      const cell = (x, y, v) => { const c = Math.floor(x / cs), r = Math.floor(y / cs); if (c >= 0 && r >= 0 && c < B.cols && r < B.rows) G[r * B.cols + c] = v; };
      const box = (o, v) => { for (let y = o.sy - Math.min(60, o.h * .5); y < o.sy + 6; y += cs) for (let x = o.x + 4; x < o.x + o.w - 4; x += cs) cell(x, y, v); };
      const gone = B.objs.filter(o => /water_jar|herb_grinder|tea_table|cargo_sacks/.test(o.img || ''));
      B.objs = B.objs.filter(o => !gone.includes(o)); for (const o of gone) for (let y = o.y; y < o.sy + 40; y += cs) for (let x = o.x - 20; x < o.x + o.w + 20; x += cs) cell(x, y, '0');
      for (const o of B.objs) if (/incense_burner/.test(o.img || '')) { box(o, '0'); Object.assign(o, { x: 503, y: 452, sy: 560 }); box(o, '1'); }
      B.blocked = G.join('');
      const P2 = (x, y) => [x / 64 - .5, y / 64 - .8];
      const add = (name, w9, xy, face, lines) => { const [c, r] = P2(xy[0], xy[1]); try { SPEAKERS[name] = SPEAKERS[name] || { p: '', color: '#e6dccb' }; } catch (e) {}
        (HB.npcs = HB.npcs || []).push({ key: 'none', cx: 'villager_m', w9, c, r, name, h: 116, wander: false, face, random: true, talk: lines }); };
      add('来看病的老先生', 'xiucai', [372, 560], 'right', ['（咳了两声）老毛病了，一到换季就咳。掌柜的方子灵，三帖下去就好。', '年轻人，修行再苦，也别熬夜。老夫年轻时候不信，如今一身病。', '这香炉里点的是安神香，闻着心里就静。']);
      add('抓药的娘子', 'yanzhi', [640, 470], 'up', ['当家的上山采石，跌伤了腿，我来抓两帖跌打的药。', '掌柜的说这药要用黄酒做引子……镇上的酒铺还开着吧？', '最近药价涨得厉害，听说都是黑风寨闹的。']); } }
  // 拆物件 + 放开它脚下的挡路格（周围别的物件脚下照旧挡）
  const unblock = (B, gone) => { const cs = B.cs, G = B.blocked.split('');
    const keep = (x, y) => B.objs.some(o => !gone.includes(o) && o.w * o.h > 1500 && x >= o.x && x < o.x + o.w && y >= (o.sy || o.y + o.h) - Math.min(90, o.h * .4) && y < (o.sy || o.y + o.h) + 6);
    for (const o of gone) { const sy = o.sy || o.y + o.h, y0 = o.h > 150 ? sy - 150 : o.y;
      for (let y = y0; y < sy + 10; y += cs) for (let x = o.x; x < o.x + o.w; x += cs) { const c = Math.floor(x / cs), r = Math.floor(y / cs); if (c >= 0 && r >= 0 && c < B.cols && r < B.rows && !keep(c * cs + cs / 2, r * cs + cs / 2)) G[r * B.cols + c] = '0'; } }
    return G.join(''); };
  const strip = (m, pred) => { const B = TMAPS[m] && TMAPS[m].baked; if (!B) return; const gone = B.objs.filter(pred); if (!gone.length) return; B.blocked = unblock(B, gone); B.objs = B.objs.filter(o => !gone.includes(o)); };
  strip('xt_city', o => /spirit_pet_stall|weapon_stall|food_stall_02/.test(o.img || ''));
  strip('m_cy_gate', o => /prop_awning/.test(o.img || ''));
  { const M = TMAPS.qy_town, B = M && M.baked; if (B && !B._r302s) { B._r302s = 1;
      const st = B.objs.filter(o => /spirit_pet_stall|food_stall_01|weapon_stall/.test(o.img || '')); const fullB = B.blocked, fullO = B.objs.slice();
      const dayB = unblock(B, st), dayO = B.objs.filter(o => !st.includes(o));
      const night = () => !!(S.flags && S.flags.ch3_night && !S.flags.ch3_city);
      const apply = () => { const n = night(); B.blocked = n ? fullB : dayB; B.objs = n ? fullO : dayO; };
      apply(); if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { if (m === 'qy_town') try { apply(); } catch (e) {} return o.apply(this, arguments); })(tileSetMap); } }
  const MOVE = [['m_yy_tiger', '守林老人', null, null, 2040, 3300], ['lin_guest_east', '林府老管事', null, null, 690, 580],
    ['qy_town', '城门护卫', 1428, 2173, 1424, 2345], ['qy_town', '城门护卫', 1580, 2173, 1576, 2345], ['qy_town', '扎辫子的小丫头', null, null, 704, 1657], ['qy_town', '大黄', null, null, 630, 1600],
    ['xt_city', '富家公子', null, null, 2785, 2180], ['xt_city', '江湖郎中', null, null, 620, 2296], ['xt_city', '镖师', null, null, 2150, 2940], ['xt_city', '卖炊饼的汉子', null, null, 1579, 2497],
    ['xt_manor_treasury', '宝库守阁人', null, null, 656, 641], ['lin_court', '林府护卫', null, null, 1320, 1961]];
  const put = m => { const M = TMAPS[m]; if (!M) return; MOVE.forEach(([mm, nm, ox, oy, nx, ny], i) => { if (mm !== m) return;
    const n = (M.npcs || []).find(n => n.name === nm && !n.hidden && (n._r302 === i || (n._r302 === undefined && (ox === null || Math.abs((n.c + .5) * 64 - ox) < 6))));
    if (n) { n._r302 = i; n.c = nx / 64 - .5; n.r = ny / 64 - .8; } }); };
  const maps = [...new Set(MOVE.map(v => v[0]))];
  for (const m of maps) put(m);
  if (typeof walkFinalDraw === 'function') walkFinalDraw = (o => function (a, now) { const r = o.apply(this, arguments);
    try { if (!r && a && a.npc && a.home && a.moving && !/^o_/.test(a.key || '')) { const wk = a.key === 'w_disciple' ? 'w_yegx' : a.key;
      if (!(WALK4[a.key] && has(WALK4[a.key])) && !has(wk + '_0')) { a.tx = null; a.moving = false; a.home = null; } } } catch (e) {}
    return r; })(walkFinalDraw);
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { try { put(m); } catch (e) {} return o.apply(this, arguments); })(tileSetMap);   // 别的脚本后来再挪也盖回来
})();
