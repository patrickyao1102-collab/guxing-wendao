// ================= R175 · 云海后庭新貌（Codex R175 第 1 批，作者 11-09 定稿 V4 水色）=================
// 作者 11-09：后庭不做田了——北边一道会动的三级大瀑布（泉眼在崖上），落成钓鱼潭；潭水从西南口流出，穿过石板路（那段改成石板桥），
// 再从西南崖口落进云海、流向山下的菜园。东岸一座竹钓台（钓鱼见 r175h_fish.js）。长饭桌、六把椅子、桌上花瓶玉饰撤掉（作者：后期搬走）；
// 旧的三盏竹林石灯换成 Codex 定位的四盏白玉宫灯；上中、左上两丛竹子让给北崖。观星先照旧（作者：观星以后再细化），只把站位挪出溪水。
// 地面 = 原后庭地面 + 北崖 + 潭 + 两段溪 + 南崖水帘（离线拼成一张）；水动画、桥、钓台在人物下面画；四时辰光层在西扩上替换原来的「拉伸左边缘」。
// 关掉：localStorage.r175h = '0'
(function () {
  const PAV = 'qingzhu_upper_pavilion', OX = 1536, D = 'r175h/';
  if (!window.R137QZ || typeof TMAPS === 'undefined' || !TMAPS[PAV] || typeof buildTileMap !== 'function') return;
  try { if (localStorage.getItem('r175h') === '0') return; } catch (e) {}
  window.R175H_ON = true;
  const META = {"bridge":[253,807,306,158],"dock":[1020,390,163,110],"north_falls":{"xy":[626,46],"w":315,"h":273,"n":24,"cols":6,"fps":16},"impact":{"xy":[518,298],"w":465,"h":123,"n":12,"cols":4,"fps":12},"source":{"xy":[718,40],"w":125,"h":108,"n":8,"cols":4,"fps":12},"pond_glints":{"xy":[447,344],"w":607,"h":282,"n":8,"cols":4,"fps":8},"creek":{"xy":[282,509],"w":392,"h":770,"n":12,"cols":6,"fps":12},"south_falls":{"xy":[275,1256],"w":261,"h":250,"n":24,"cols":6,"fps":16},"koi":{"xy":[780,465],"w":76,"h":48,"n":6,"cols":6,"fps":7},"mist_0":{"xy":[628,310],"w":158,"h":68,"drift":[9,3],"T":5},"mist_1":{"xy":[771,330],"w":158,"h":68,"drift":[10,3],"T":6},"mist_2":{"xy":[328,1422],"w":158,"h":68,"drift":[11,3],"T":7},"lamp":{"w":74,"h":155,"feet":[[344,651],[1207,671],[579,1217],[961,1205]]}};
  const RLE = ["0",67,83,108,84,107,86,105,87,104,88,103,89,100,93,96,96,92,100,89,103,88,105,86,106,85,107,85,107,84,109,82,110,81,111,80,112,79,114,77,115,77,115,77,115,76,116,76,117,75,117,74,117,75,116,76,116,75,116,76,116,76,115,77,115,76,115,79,113,81,110,85,104,90,99,95,95,99,90,17,34,54,84,20,34,54,82,22,34,55,79,24,34,55,77,26,34,56,75,117,73,120,71,121,73,120,74,118,76,117,76,117,74,117,75,117,74,118,74,117,74,118,74,118,73,120,72,120,71,121,71,121,70,123,68,125,66,127,64,129,62,131,59,131,60,131,60,131,59,131,59,132,59,132,58,133,58,133,56,136,53,138,51,140,48,143,30,3,11,147,29,7,1,155,27,158,4,2,27,160,2,3,25,166,25,78,4,85,24,79,4,84,24,168,23,168,24,168,23,168,24,168,23,169,23,168,23,169,23,169,22,170,22,170,22,169,23,169,22,170,22,170,22,169,22,3816,24,130,25,13,24,130,25,13,24,130,25,13,24,130,25,13,24,130,24,14,24,168,24,168,24,129,1,38,24,127,3,38,24,124,6,38,24,122,8,38,24,119,11,38,24,116,14,38,24,114,16,38,24,111,19,38,24,109,21,38,24,107,23,38,24,105,25,38,24,102,28,38,24,100,30,38,24,98,32,37,25,95,35,37,25,87,43,37,25,87,43,37,25,86,44,37,25,84,46,37,25,81,49,37,25,78,52,37,25,75,55,37,25,56,4,12,58,37,25,9,3,44,4,9,61,37,25,8,4,54,64,37,25,62,68,37,25,59,71,37,25,52,78,37,25,42,88,37,26,33,96,37,26,25,104,37,155,36,156,27,165,16,176,10,182,5,5563];
  const IM = {};
  const KEYS = ['by_ground', 'ov_bridge', 'ov_dock', 'an_north_falls', 'an_impact', 'an_source', 'an_pond_glints', 'an_creek', 'an_south_falls', 'an_koi', 'mist_0', 'mist_1', 'mist_2', 'lamp', 'l_dawn', 'l_dusk', 'l_evening', 'l_midnight'];
  const ld = k => { if (k in IM) return; IM[k] = null; const i = new Image();
    i.onload = () => { IM[k] = i; if (k === 'by_ground') IMG.r137_by_ground = i; if (k === 'lamp') IMG.r175h_lamp = i; };
    i.onerror = () => { FAIL[k] = (FAIL[k] || 0) + 1; delete IM[k]; if (FAIL[k] < 3) setTimeout(() => ld(k), 1500 * FAIL[k]); };   // 下载失败重试两次，还不行就不再拦着载入画面
    i.src = ((window.R162_ASSETS && R162_ASSETS[D + k + '.webp']) || (D + k + '.webp')); };
  const FAIL = {};
  let loaded = false; const loadAll = () => { if (loaded) return; loaded = true; KEYS.forEach(ld); setTimeout(() => { try { mainCol('night'); mainCol('dawn'); } catch (e) {} }, 0); };
  setTimeout(loadAll, 6000);
  window.R175H_READY = () => KEYS.filter(k => IM[k] || FAIL[k] >= 3).length / KEYS.length;
  // 作者 11-08「一定要把所有东西准备好才可以加载完毕」：后庭的瀑布、潭水、光层也算进载入进度，进图时不会一块块冒出来
  { const o = window.MAP_EXTRA_READY; window.MAP_EXTRA_READY = n => { let a = 1; try { a = o ? o(n) : 1; } catch (e) {} if (a == null) a = 1; if (n !== PAV) return a; loadAll(); const f = window.R175_FISH_READY ? R175_FISH_READY() : 1; return Math.min(a, R175H_READY(), f); }; }

  // ---------- 碰撞：整块西扩重写（潭、溪、北崖、南崖云海按 Codex 多边形；桥面、钓台可走；三丛竹、四盏灯脚下挡住）----------
  { let s = '', c = RLE[0]; for (let i = 1; i < RLE.length; i++) { s += c.repeat(RLE[i]); c = c === '0' ? '1' : '0'; }
    if (s.length === R137QZ.by.cols * R137QZ.by.rows) R137QZ.by.blocked = s; }

  // ---------- 物件：撤饭桌一套、旧石灯、让位的两丛竹；加四盏白玉宫灯 ----------
  const DROP = /^r137by_(dining_|chair_|lantern_|bamboo_n1$|bamboo_n2$)/;
  const LAMPS = META.lamp.feet.map(([fx, fy], i) => ({ uid: 'r175h_lamp_' + i, id: 'r175h_lamp', img: 'r175h_lamp', x: fx - META.lamp.w / 2 - OX, y: fy - META.lamp.h, w: META.lamp.w, h: META.lamp.h, sy: fy, flat: false, flip: false, bk: true }));
  const fixObjs = T => { if (!T || !T.objs || T.__r175h) return; T.__r175h = 1; T.objs = T.objs.filter(o => !(o.uid && DROP.test(o.uid))); for (const o of LAMPS) T.objs.push(Object.assign({}, o)); };
  buildTileMap = (o => function (def) { const T = o.apply(this, arguments); try { if (def === TMAPS[PAV] && T && T.x0 === -OX) fixObjs(T); } catch (e) { console.warn('r175h', e); } return T; })(buildTileMap);
  tileSetMap = (o => function (name) { if (name === PAV) loadAll(); const r = o.apply(this, arguments); try { const T = world.map && world.map.T; if (name === PAV && T && T.x0 === -OX) fixObjs(T); } catch (e) {} return r; })(tileSetMap);

  // ---------- 可调查点：饭桌那个撤掉；观星挪到崖边空地（原来那处现在是溪水）；钓台 ----------
  const M = TMAPS[PAV]; M.npcs = M.npcs || [];
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const STAR = [880 - OX, 1150], OLDSTAR = [480 - OX, 1150];
  M.npcs = M.npcs.filter(n => n.name !== '青玉长桌');
  { const s = M.npcs.find(n => n.name === '崖边'); if (s) { [s.c, s.r] = P(...STAR); } }
  { const g0 = window.R137_STARGAZE; if (g0) window.R137_STARGAZE = async function () {   // 原观星会先走到旧站位 → 换成新站位
      const mv = window.moveActor; if (typeof mv === 'function') window.moveActor = function (a, x, y) { const r = [...arguments]; if (Math.abs(x - OLDSTAR[0]) < 2 && Math.abs(y - OLDSTAR[1]) < 2) { r[1] = STAR[0]; r[2] = STAR[1]; } return mv.apply(this, r); };
      try { return await g0.apply(this, arguments); } finally { if (mv) window.moveActor = mv; } }; }
  window.R175H_DOCK = [1105 - OX, 472];   // 钓台坐处（脚点）
  { const [c, r] = P(1112 - OX, 470); M.npcs.push({ key: 'none', c, r, name: '竹钓台', hidden: true, h: 90, talk: () => window.R175_FISH ? R175_FISH() : narrate('竹钓台伸进潭里，矮凳边放着一只鱼篓，竹笠挂在柱子上。') }); }

  // ---------- 水动画 + 桥 + 钓台：地面之后、人物之前 ----------
  const now = () => performance.now() / 1000;
  function anim(k, t) { const d = META[k], im = IM['an_' + k]; if (!im || !d) return; const f = Math.floor(t * d.fps) % d.n;
    ctx.drawImage(im, (f % d.cols) * d.w, Math.floor(f / d.cols) * d.h, d.w, d.h, d.xy[0] - OX, d.xy[1], d.w, d.h); }
  const KOI = [...Array(6)].map((_, i) => ({ p: i * 1.7, s: .18 + (i % 3) * .05, rx: 150 - i * 12, ry: 52 - i * 4, cx: 760 + (i % 2 ? 30 : -40), cy: 470 + (i % 3) * 10 }));
  window.R175H_KOI = () => Math.min(6, (S.flags && S.flags.r175_koi) || 0);
  function water(T) {
    const t = now();
    for (const k of ['pond_glints', 'creek', 'impact', 'north_falls', 'source', 'south_falls']) anim(k, t);
    const nk = R175H_KOI(), ki = IM.an_koi, kd = META.koi;   // 放生的锦鲤在潭心慢慢游
    if (ki && nk) for (let i = 0; i < nk; i++) { const q = KOI[i], a = t * q.s + q.p, x = q.cx + Math.cos(a) * q.rx, y = q.cy + Math.sin(a) * q.ry, dir = -Math.sin(a) > 0 ? 1 : -1, f = Math.floor(t * kd.fps + i) % kd.n;
      ctx.save(); ctx.globalAlpha = .9; ctx.translate(x - OX, y); if (dir < 0) ctx.scale(-1, 1); ctx.drawImage(ki, f * kd.w, 0, kd.w, kd.h, -kd.w / 2, -kd.h / 2, kd.w, kd.h); ctx.restore(); }
    for (let i = 0; i < 3; i++) { const d = META['mist_' + i], im = IM['mist_' + i]; if (!im) continue; const u = t * 2 * Math.PI / d.T + i;
      ctx.save(); ctx.globalAlpha = .75 + .2 * Math.sin(u * .5); ctx.drawImage(im, d.xy[0] - OX + Math.sin(u) * d.drift[0], d.xy[1] + Math.sin(u * 1.3) * d.drift[1], d.w, d.h); ctx.restore(); }
    for (const k of ['bridge', 'dock']) { const im = IM['ov_' + k], r = META[k]; if (im) ctx.drawImage(im, r[0] - OX, r[1], r[2], r[3]); }
    if (window.R175_FISH_UNDER) try { R175_FISH_UNDER(); } catch (e) {}   // 鱼影、浮漂（钓鱼时）
  }
  drawGroundVis = (o => function (g, cam) {
    const r = o.apply(this, arguments);
    try { const T = world.map && world.map.T; if (world.mapName === PAV && T && T.x0 === -OX && g && !g.__pv && IM.by_ground) water(T); } catch (e) { console.warn('r175h', e); }
    return r;
  })(drawGroundVis);

  // ---------- 夜色 / 晨昏：西扩用 Codex 四时辰光层（r162 的 extTint 先问这里）----------
  window.R175H_EXT = function (T, t, dusk) {
    if (world.mapName !== PAV) return false;
    const shi = window.QZ_SHI ? QZ_SHI() : '';
    const k = dusk ? 'l_dusk' : t === 'dawn' ? 'l_dawn' : t === 'night' ? (shi === '子' ? 'l_midnight' : 'l_evening') : null;
    const im = k && IM[k]; if (!im) return false;
    // 接缝：Codex 这四层是后庭自己的光（灯、瀑布、潭面），和主图的夜色 / 晨光 / 暮色不是一个调子，x = 0 那条线会看出竖缝。
    // 做法：后庭大部分照 Codex 原样；最东边 BAND 宽的一条，Codex 层渐渐淡掉，同时把主图那一套（整图压色 + cx2 光层最左一列）渐渐加满，到 x = 0 正好和主图一模一样。
    const sw0 = im.width * (OX - BAND) / OX;
    ctx.drawImage(im, 0, 0, sw0, im.height, T.x0, 0, OX - BAND, OX);
    const band = codexBand(k, im); if (band) ctx.drawImage(band, -BAND, 0, BAND, OX);
    const grad = (c0, c1) => { const g = ctx.createLinearGradient(-BAND, 0, 0, 0); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; };
    if (t === 'night') { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = grad('rgb(255,255,255)', 'rgb(150,162,214)'); ctx.fillRect(-BAND, 0, BAND, T.mh); ctx.globalCompositeOperation = 'source-over'; }
    const col = mainCol(t); if (col) ctx.drawImage(col, -BAND, 0, BAND, T.mh);
    if (dusk) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = grad('rgb(255,255,255)', 'rgb(255,206,160)'); ctx.fillRect(-BAND, 0, BAND, T.mh);
      ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = grad('rgba(255,140,60,0)', 'rgba(255,140,60,.35)'); ctx.fillRect(-BAND, 0, BAND, T.mh); ctx.globalCompositeOperation = 'source-over'; }
    return true;
  };
  const BAND = 320, MB = {}, MC = {};
  const codexBand = (k, im) => { if (MB[k]) return MB[k]; const sw = im.width * BAND / OX, c = document.createElement('canvas'); c.width = Math.max(1, Math.round(sw)); c.height = im.height; const g = c.getContext('2d');
    g.drawImage(im, im.width - sw, 0, sw, im.height, 0, 0, c.width, c.height); g.globalCompositeOperation = 'destination-in';
    const gr = g.createLinearGradient(0, 0, c.width, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); return (MB[k] = c); };
  // 主图 cx2 光层最左边那一列（和 r162 一样取左边约 40/2304 宽求平均），拉成一条、透明度从 0 渐到 1
  const mainCol = t => { let o = MC[t]; if (!o) { o = MC[t] = { c: null }; const im = new Image(); im.onload = () => {
      const n = Math.max(2, Math.round(im.width * 40 / 2304)), c1 = document.createElement('canvas'); c1.width = 1; c1.height = im.height; const g1 = c1.getContext('2d'); g1.imageSmoothingEnabled = true; g1.imageSmoothingQuality = 'high'; g1.drawImage(im, 0, 0, n, im.height, 0, 0, 1, im.height);
      const c = document.createElement('canvas'); c.width = 64; c.height = im.height; const g = c.getContext('2d'); g.drawImage(c1, 0, 0, 1, im.height, 0, 0, 64, im.height); g.globalCompositeOperation = 'destination-in';
      const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, 64, im.height); o.c = c; };
    im.src = 'cx2/l_' + PAV + '_' + t + '.webp'; } return o.c; };
})();
