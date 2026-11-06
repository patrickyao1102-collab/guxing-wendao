// ================= R137 · 后山云海大亭：换 Codex 小亭 + 往西扩建「云海后庭」（Claude 11-07，Codex R134 E2 / E2b 素材）=================
// 作者：亭子换成 Codex 新画的青绿单层小亭；西边扩出一块叶孤星和下人们一起吃饭、看星星的地方（长饭桌 A 青玉流云 + 牡丹/百合大花圃 + 竹林石灯 + 崖边观星台）。
// 下人房不放这里（作者 11-07：已挪到青竹小院西院），云海大亭原来那栋仆役房外观和门一并撤掉。
// 和青竹小院西扩（r136_west.js）同一套做法：一张图直接走过去，不是另一张图——原坐标一个不动（剧情、天鹏、宝箱照旧），
// 扩出来的 1536px 落在 x < 0（-1536 ~ 0），碰撞表每行前面接 192 列，T.x0 / T.c0 交给引擎处理镜头、寻路、站位。
// 关掉：localStorage.r137qz = '0'
(function () {
  const D = window.R137QZ, PAV = 'qingzhu_upper_pavilion', OX = 1536;
  if (!D || typeof TMAPS === 'undefined' || !TMAPS[PAV] || typeof tileSetMap !== 'function' || typeof buildTileMap !== 'function') return;
  try { if (localStorage.getItem('r137qz') === '0') return; } catch (e) {}
  const R = 'r137/', ld = (k, f) => { if (IMG[k]) return; const i = new Image(); i.onload = () => { IMG[k] = i; }; i.src = R + f + '.webp'; };
  let loaded = false;
  const loadAll = () => { if (loaded) return; loaded = true;
    for (const o of D.pav.objs.concat(D.by.objs)) if (/^r137_/.test(o.img)) ld(o.img, o.img.slice(5));
    ld('r137_by_ground', 'by_ground'); };
  setTimeout(loadAll, 12000);
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const BB = D.by, YC = BB.cols;                                  // 扩建区 192 列 × 192 行（8px）
  const BOBJ = BB.objs.map(o => Object.assign({}, o, { x: o.x - OX }, /cx2_flowers_0/.test(o.img) ? { id: 'flowers_01' } : {}));   // 小花丛借原有的随风轻摆
  const SP = {}; for (const k in BB.spots) SP[k] = [BB.spots[k][0] - OX, BB.spots[k][1]];

  // 小地图：往西扩出来的部分也画进去（青竹西院同理），不再一片黑
  window.MM_EXTG = Object.assign(window.MM_EXTG || {}, { [PAV]: 'r137_by_ground', qingzhu_court: 'r136w_ground' });

  // ---------- 碰撞 + 物件：地图构建时把西边接上 ----------
  const M = TMAPS[PAV];
  M.exits = (M.exits || []).filter(e => e.to !== 'qingzhu_servant_room');
  const applyBlock = T => { const PB = D.pav.blocked, YB = BB.blocked;
    for (let r = 0; r < T.rows; r++) { const row = T.block[r]; for (let c = 0; c < YC; c++) row[c] = YB.charCodeAt(r * YC + c) === 49 ? 1 : 0; for (let c = 0; c < 256; c++) row[YC + c] = PB.charCodeAt(r * 256 + c) === 49 ? 1 : 0; }
    T._stand = null; };
  buildTileMap = (o => function (def) {
    const T = o.apply(this, arguments);
    try {
      if (def !== M || !T || !T.baked || T.cs !== 8 || T.rows !== BB.rows || T.c0) return T;
      for (let r = 0; r < T.rows; r++) T.block[r] = new Array(YC).fill(1).concat(T.block[r]);
      T.c0 = -YC; T.x0 = -OX; T.cols += YC; applyBlock(T);
      T.objs = T.objs.filter(ob => !(ob.uid && /^r90-/.test(ob.uid)) && ob.id !== 'r135e_house' && !/^qingzhu-r24-pavilion/.test(ob.id || ''));
      for (const ob of D.pav.objs.concat(BOBJ)) T.objs.push(Object.assign({ bk: true }, ob));
    } catch (e) { console.warn('r137', e); }
    return T;
  })(buildTileMap);
  // 扩建区地面画在原图左边
  drawGroundVis = (o => function (g, cam) {
    try { const T = world.map && world.map.T; if (T && T.x0 === -OX && world.mapName === PAV && IMG.r137_by_ground) ctx.drawImage(IMG.r137_by_ground, T.x0, 0); } catch (e) {}
    return o.apply(this, arguments);
  })(drawGroundVis);

  // ---------- 扩建区里的可调查点 ----------
  M.npcs = M.npcs || [];
  const spot = (name, [x, y], talk, h) => { const [c, r] = P(x, y); M.npcs.push({ key: 'none', c, r, name, hidden: true, h: h || 120, talk }); };
  spot('青玉长桌', SP.dining, async () => {
    await say('', '一张青玉面的长桌，六把圈椅。桌上只摆了一瓶花、一件小玉饰。');
    await say('叶孤星', '（管家说，以后院里的人都在这儿一起吃饭——不分主仆。）');
  }, 130);
  spot('崖边', SP.star, () => window.R137_STARGAZE && R137_STARGAZE(), 110);   // 观星仙器 Codex 设计中，到了换成仙器互动
  spot('白玉花槽', SP.garden_l, ['白玉花槽里种着几株小花，土还是湿的——早上刚浇过。'], 110);
  spot('白玉花槽', SP.garden_r, ['花槽边插着一块小木牌：「小桃种，勿踩」。'], 110);
  spot('桃树', SP.peach, ['一株老桃树，花开得正盛。风一吹，花瓣落在长桌上。'], 140);
  spot('桂花树', SP.osm, ['桂花还没开，叶子绿得发亮。管家说，等秋天开了，满院子都是香的。'], 140);

  // ---------- 观星：在地图里演（作者 11-07：禁止插画）——走到崖边、天色暗下来、云海上空星星一颗颗亮起、划过一道流星 ----------
  const SG = { a: 0, on: false, t0: 0 };
  window.R137_STARGAZE = async function () {
    if (SG.on) return; SG.on = true; world.locked = true;
    const p = world.player, seat = SP.star;
    try { if (typeof moveActor === 'function') await moveActor(p, seat[0], seat[1], 170); p.face = 'down'; } catch (e) {}
    SG.t0 = performance.now() / 1000;
    await (typeof tween === 'function' ? tween(1400, t => SG.a = t) : Promise.resolve(SG.a = 1));
    await say('', '叶孤星在崖边站定。天色一点点暗下去，云海上空的星星一颗接一颗亮了起来。');
    await say('星旋', '看见北边那七颗没有？那是北斗。你的九曜，就从那里开始。');
    await say('叶孤星', '……总有一天，我要把它们一颗一颗点亮。');
    await (typeof tween === 'function' ? tween(1200, t => SG.a = 1 - t) : Promise.resolve(SG.a = 0));
    SG.on = false; world.locked = false;
  };
  const STARS = [...Array(90)].map((_, i) => { const r = k => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5; return v - Math.floor(v); }; return { x: r(1), y: r(2), s: .6 + r(3) * 1.8, p: r(4) * 6.3, d: r(5) }; });
  const BEI = [[.30, .16], [.36, .13], [.42, .15], [.47, .19], [.50, .28], [.58, .30], [.60, .22]];   // 北斗七星（屏幕比例）

  // ---------- 画 ----------
  // 作者 11-07：游戏里所有建筑都不许变透明——屋顶就照常画在最上层（亭内站人的位置在屋檐下方，不会被挡）
  // 观星：整张图压成夜色，屏幕上方（云海上空）星点渐亮 + 北斗连线 + 一道流星；全是代码画在地图上，不切插画
  tileDraw = (orig => function () {
    orig.apply(this, arguments);
    if (!(SG.a > 0) || world.mapName !== PAV) return;
    const a = SG.a, t = performance.now() / 1000 - SG.t0, cam = world.cam || { x: 0, y: 0 }, yT = Math.max(0, Math.min(H, (1300 - cam.y) * VZ())), bh = H - yT;   // 星星只出在崖外云海上空
    ctx.save();
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(${255 - 190 * a | 0},${255 - 180 * a | 0},${255 - 120 * a | 0},1)`; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    let g = ctx.createLinearGradient(0, yT, 0, H); g.addColorStop(0, `rgba(30,36,90,${.5 * a})`); g.addColorStop(1, `rgba(10,14,48,${.7 * a})`); ctx.fillStyle = g; ctx.fillRect(0, yT, W, bh);
    ctx.globalCompositeOperation = 'lighter';
    { const z = VZ(); ctx.save(); ctx.scale(z, z); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));   // 石灯在夜里亮起
      for (const o of BOBJ) if (o.id === 'r137_lantern') { const x = o.x + o.w / 2, y = o.y + o.h * .32, f = .9 + .1 * Math.sin(t * 6 + o.x);
        let gg = ctx.createRadialGradient(x, y, 0, x, y, 120); gg.addColorStop(0, `rgba(255,214,140,${.55 * a * f})`); gg.addColorStop(.35, `rgba(255,180,90,${.18 * a * f})`); gg.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = gg; ctx.fillRect(x - 120, y - 120, 240, 240);
        gg = ctx.createRadialGradient(x, o.y + o.h, 0, x, o.y + o.h, 150); gg.addColorStop(0, `rgba(255,196,120,${.22 * a})`); gg.addColorStop(1, 'rgba(255,196,120,0)'); ctx.save(); ctx.translate(x, o.y + o.h); ctx.scale(1, .45); ctx.translate(-x, -(o.y + o.h)); ctx.fillStyle = gg; ctx.fillRect(x - 150, o.y + o.h - 150, 300, 300); ctx.restore(); }
      ctx.restore(); }
    for (const st of STARS) { const on = Math.min(1, Math.max(0, (t - st.d * 2.5) / .8)); if (!on) continue;
      const x = st.x * W, y = st.y < .55 ? st.y / .55 * H * .62 : yT + 8 + (st.y - .55) / .45 * Math.max(0, bh - 16), land = st.y < .55 ? .45 : 1, al = a * on * land * (.45 + .55 * Math.abs(Math.sin(t * (1.2 + st.d) + st.p))), R = st.s * 3;
      const gg = ctx.createRadialGradient(x, y, 0, x, y, R); gg.addColorStop(0, `rgba(255,252,236,${al})`); gg.addColorStop(1, 'rgba(255,250,230,0)'); ctx.fillStyle = gg; ctx.fillRect(x - R, y - R, R * 2, R * 2); }
    const bon = Math.min(1, Math.max(0, (t - 2.6) / 1.2)) * a;
    if (bon > 0) { ctx.strokeStyle = `rgba(200,220,255,${.35 * bon})`; ctx.lineWidth = 1.2; ctx.beginPath(); const by = y => y * H; BEI.forEach(([x, y], i) => i ? ctx.lineTo(x * W, by(y)) : ctx.moveTo(x * W, by(y))); ctx.stroke();
      for (const [x, y0] of BEI) { const y = by(y0) / H; const gg = ctx.createRadialGradient(x * W, y * H, 0, x * W, y * H, 9); gg.addColorStop(0, `rgba(255,248,215,${bon})`); gg.addColorStop(.4, `rgba(255,220,150,${.5 * bon})`); gg.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = gg; ctx.fillRect(x * W - 9, y * H - 9, 18, 18); } }
    const mt = (t - 4.2) % 7; if (mt > 0 && mt < .9) { const u = mt / .9, x0 = W * .82, y0 = H * .06, x = x0 - u * W * .35, y = y0 + u * H * .2;
      const lg = ctx.createLinearGradient(x, y, x + 120, y - 60); lg.addColorStop(0, `rgba(255,255,240,${a * (1 - u)})`); lg.addColorStop(1, 'rgba(255,255,240,0)');
      ctx.strokeStyle = lg; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 120, y - 60); ctx.stroke(); }
    ctx.restore();
  })(tileDraw);
  // 路南小花丛：R136 随风轻摆 8 帧（336×224 一帧，5fps）
  drawBaked = (orig => function (o, now) {
    if (o && o.id === 'r137_fw') { const im = IMG[o.img]; if (!im) return; const f = Math.floor(now * 5 + o.x * .01) % 8; ctx.drawImage(im, f * 336, 0, 336, 224, o.x, o.y, o.w, o.h); return; }
    return orig(o, now);
  })(drawBaked);

  tileSetMap = (orig => function (name) {
    if (/^qingzhu_/.test(name || '')) loadAll();
    const res = orig.apply(this, arguments);
    try { const T = world.map && world.map.T; if (name === PAV && T && T.x0 === -OX) { T.objs = T.objs.filter(ob => !(ob.uid && /^r90-/.test(ob.uid)) && ob.id !== 'r135e_house'); applyBlock(T); } } catch (e) { console.warn('r137', e); }   // 旧亭子 r90 进图时按老坐标改碰撞，这里整张重写
    return res;
  })(tileSetMap);
})();
