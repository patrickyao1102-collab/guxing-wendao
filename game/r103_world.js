// R103 接入（Codex 交付 R103_杂役扫地_蝴蝶_正面宝箱，11-03）
// 1) 扫地杂役动起来：走一段（原 npc_walk_r1 走路帧）→ 停下来扫地（新画的扫地帧，三向 8 帧 8fps）→ 再走；扫的时候扫帚边飘起几片竹叶。
//    竹林归径「扫竹叶的杂役」、演武广场「杂役」、藏经阁「扫地杂役」都是这一个造型。和他说话时他停下来不扫。
// 2) 蝴蝶：只放在花草多的户外图（竹林归径、青竹小院、云海大亭、天剑后山、花坪、林府曲水花庭），夜里不出来。
//    白 / 淡黄 / 浅蓝 / 金纹四色，扇翅 8 帧 12fps，偶尔停下来歇翅。
// 3) 宝箱：换成 Codex 新画的正面宝箱（方方正正、正对镜头），分层叠：外晕(screen) → 箱体 → 缝光(screen) / 箱内微光(screen)。
//    没开：外晕 0.9 + 缝光 1，慢慢呼吸；开过：外晕 0.06 + 箱内微光 0.28，缝光关掉。
// 画面全是 Codex 的图；代码只做裁帧、摆放、位移、透明度和叠加。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const BLOB = {"bamboo_leaves":"d3b8e8cff1235d04d4bb5fb70a5ebf74","butterflies_all":"7beb37367746af2899d36486ec26ab3b","groundskeeper_sweep":"785c60fa5f74257295c6bac10aa3af92",
    "chest_01_tianjian_jade_closed":"5dcde3ac94f4baec3679a1ee9a1f8f30","chest_01_tianjian_jade_open":"02fafc3e607fe1351cc1486aaca300c6","chest_02_star_celestial_closed":"c24d7e24499346225b4338c400226cf3","chest_02_star_celestial_open":"633c9a31c24e004f9ae606384721198d",
    "chest_03_ancient_vine_closed":"2e8767af735ac9a6bf5059ef29e33e9f","chest_03_ancient_vine_open":"6109c9c9f515db97d581d84a718cb6e3","chest_04_vermilion_lacquer_closed":"325abe16f8082f0954441eddc8d316cb","chest_04_vermilion_lacquer_open":"29126261546e1818b6d9d55a5ea27275",
    "chest_05_gilded_zitan_closed":"89b37ac006511217926f2304e0ed9d81","chest_05_gilded_zitan_open":"5f8e335c31b6a74dcd9f2336fb2155d8","chest_06_sealed_iron_closed":"b400e763222febaebcd8c86bec9e5be5","chest_06_sealed_iron_open":"c50bdc496531eab2fbc8139d92a3e96a",
    "halo_01_tianjian_jade":"db9b6db65e3b934f80b7d3a7621d4692","halo_02_star_celestial":"3bb610f49bce131e841ee4bb7bad7fd4","halo_03_ancient_vine":"ace3959854146c37e5d388ff5f3beaa7","halo_04_vermilion_lacquer":"2064454e044d82ccfd23a3b95ffedca1","halo_05_gilded_zitan":"4d7ad51c021ca56fbd10ab5618f47bd9","halo_06_sealed_iron":"712abf8eb4bc746b9c8e5faf6c2088d0",
    "inner_01_tianjian_jade":"47024101ca86561a484673b69c78e4b4","inner_02_star_celestial":"d2c820adc3797a229c9fb0e10cec2287","inner_03_ancient_vine":"eae8b30c20039672b6f6cdc43be7d53b","inner_04_vermilion_lacquer":"93b5d0295ac4f45ebce19d385f30c735","inner_05_gilded_zitan":"65b10deca067769cb5e242593d8eea0f","inner_06_sealed_iron":"9cfb72f66ac99ad0a7834c81a8d67417",
    "seam_01_tianjian_jade":"1be90a1612ca3421bdf8c41a9b68d1b3","seam_02_star_celestial":"39afae9ccb8156264f1462169db68420","seam_03_ancient_vine":"5a97469217351c5fd4de88b675f39d25","seam_04_vermilion_lacquer":"3d7a7f633fe46cb9d50d5e93d3e93e98","seam_05_gilded_zitan":"e0532da3301aa27f21b5a2c98f73f12b","seam_06_sealed_iron":"6cb01fb09d2e72b4e87094e2feeb9460"};
  const R130B = {"chest_01_tianjian_jade_closed": "02a184f395eb3926ceba331bf3043f86", "chest_01_tianjian_jade_open": "26c7e2b8f5af64487aef2cdf6e1ef8d9", "chest_02_star_celestial_closed": "fe84cee702612c3c419a32e6f9158f8e", "chest_02_star_celestial_open": "89f67c7680a1650129fbe2caab9a49eb", "chest_03_ancient_vine_closed": "020d3434c8f54a0e1d0fc8e169a5925b", "chest_03_ancient_vine_open": "cec492496766534ad62710f9de45d8f1", "chest_04_vermilion_lacquer_closed": "235e49dbb62435226c2a5c067d6d1a73", "chest_04_vermilion_lacquer_open": "667a33be491da95099d4d9d1f845c195", "chest_05_gilded_zitan_closed": "23a0885c4632191295a450db018fef92", "chest_05_gilded_zitan_open": "5611242c3005abaaef717ccfe282c2e8", "chest_06_sealed_iron_closed": "9d611a0d73d1ed7b6b381fc1f8a2d66f", "chest_06_sealed_iron_open": "170bf1ed7eb78854348b0414a606fea4", "halo_01_tianjian_jade": "6eba4d9aae744eb4a7da6352576dcd85", "halo_02_star_celestial": "984b782ebe026a4b2f66c32714ace22c", "halo_03_ancient_vine": "2c955fb43214683d297bd64af5a935a6", "halo_04_vermilion_lacquer": "b1f2678173914315214ec8f5846d1f9b", "halo_05_gilded_zitan": "ed1f93f9dd960c5215b623ec6ac097d2", "halo_06_sealed_iron": "620aeddbfb63e13e0c12b0ae2b36f2ab", "inner_01_tianjian_jade": "37e2cfde5f7887e3d73de6261abf9918", "inner_02_star_celestial": "62943f9e5be92f50d4a386305fddeb0b", "inner_03_ancient_vine": "d57849e8dcfacd9d2d07811c43872630", "inner_04_vermilion_lacquer": "7dd098608eed29eef39159d2b791e95d", "inner_05_gilded_zitan": "95f7fd34cda91bfd1a6f431a12ca20fb", "inner_06_sealed_iron": "212dc487dd69626b5e83e8ebb62cf305", "seam_01_tianjian_jade": "cbbe2f374a47f817ab4528f84d6246b3", "seam_02_star_celestial": "ad3173cc781d62a2687444ebf7bacba7", "seam_03_ancient_vine": "8e7bc9f6e4e0ed28227678bb6a2b3519", "seam_04_vermilion_lacquer": "ef8cd27411802c3f38fdbde5eb84835f", "seam_05_gilded_zitan": "a6ea4d8c99b574f98e928c9703782022", "seam_06_sealed_iron": "7189fd6bc933d9dd9fbfbf0fc2d589d4"};   // 11-06 发布页素材库 id（R130 方正宝箱 30 件）
  const IM = {}, want = {};
  function img(n) { if (IM[n]) return IM[n]; if (want[n]) return null; want[n] = 1; const im = new Image(); im.onload = () => { IM[n] = im; }; im.src = (/^(chest|halo|seam|inner)_/.test(n) ? (LOC || !R130B[n] ? 'r130/' + n + '.webp' : '/_blob/' + R130B[n]) : (LOC ? 'r103/' + n + '.webp' : '/_blob/' + BLOB[n])); return null; }   // 作者 11-06：宝箱换成 R130 方正小宝箱（r130/），其余仍走 r103
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ================= 3) 正面宝箱 =================
  const SL = ['01_tianjian_jade', '02_star_celestial', '03_ancient_vine', '04_vermilion_lacquer', '05_gilded_zitan', '06_sealed_iron'];
  // manifest.json：各光层相对箱体脚点的偏移 + 自身锚点
  // 作者 11-06：换 R130 方正宝箱——偏移按 R130 manifest（缝光 / 内微光相对脚点），箱体可见宽 160 → 按 K 缩成约 48px，比原来小一圈
  const OFF = { seam: [-59, -59, -58, -58, -57, -54], inner: [-80, -80, -75, -74, -73, -68] };
  const K = .25 * 1.2;
  function chest(x, y, open, i, tms) {
    const s = SL[i] || SL[0], body = img('chest_' + s + (open ? '_open' : '_closed'));
    const halo = img('halo_' + s), seam = img('seam_' + s), inner = img('inner_' + s);
    img('chest_' + s + (open ? '_closed' : '_open'));   // 另一态也先载好，开箱时不闪
    if (!body) return false;
    const t = tms / 1000, br = .5 + .5 * Math.sin(2 * Math.PI * t / 2.4);
    ctx.save(); ctx.translate(x, y); ctx.scale(K, K);
    if (halo) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = open ? .06 : .9 * (.82 + .18 * br); ctx.drawImage(halo, -256, -238, 512, 320); ctx.restore(); }
    ctx.drawImage(body, -128, -224, 256, 224);
    if (!open && seam) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .82 + .18 * br; ctx.drawImage(seam, -128, OFF.seam[i] - 32, 256, 64); ctx.restore(); }
    if (open && inner) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .28; ctx.drawImage(inner, -104, OFF.inner[i] - 48, 208, 96); ctx.restore(); }
    ctx.restore(); return true;
  }
  window.R103_CHEST = chest;
  for (const s of SL.slice(0, 1)) img('chest_' + s + '_closed');

  // ================= 1) 扫地杂役 =================
  const GK = 'groundskeeper', GS = .5566;   // 和原走路帧同一个缩放（npc_walk_r1 groundskeeper）
  const LEAVES = [];
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) {
    o.apply(this, arguments);
    try { for (const a of world.actors || []) if (a.npc && a.npc.cx === GK && !a.hidden) {
      if (!a.home) { a.home = [a.x, a.y]; a.wait = rnd(2, 4); }   // 用游戏原来的闲逛逻辑走动；停下的那几秒就是在扫地
      if (a.tx) a._sw = 0; else if (!a._sw) { a._sw = 1; a.wait += rnd(2, 4); }   // 每次停下多扫一会儿再走
    } } catch (e) {}
  })(tileUpdate);
  function sweeping(a) { return a.npc && a.npc.cx === GK && a.home && !a.moving && !a.tx && !a.talking && !(typeof dialog !== 'undefined' && dialog && dialog.who === a.npc.name); }
  const NW = window.NPC_WALK;
  window.NPC_WALK = function (a, now) {
    if (a && a.npc && a.npc.cx === GK && sweeping(a)) {
      const im = img('groundskeeper_sweep'); if (im) {
        const row = a._row ?? 0, flip = !!a._flip, f = Math.floor(now * 8 + (a.x * .013 % 1) * 8) % 8;
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 22, 7, 0, 0, 7); ctx.fill();
        ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y); if (flip) ctx.scale(-1, 1); ctx.scale(GS, GS);
        ctx.drawImage(im, f * 160, row * 240, 160, 240, -80, -232, 160, 240); ctx.restore();
        // 扫帚扫到地上那一下，飘起一两片竹叶
        if ((f === 2 || f === 6) && a._lf !== f && LEAVES.length < 40) {
          const side = row === 2 ? (flip ? 1 : -1) : (f === 2 ? -1 : 1), bx = a.x + side * rnd(14, 26), by = a.y - rnd(0, 4);
          for (let k = 0; k < (Math.random() < .5 ? 1 : 2); k++) LEAVES.push({ x: bx, y: by, vx: side * rnd(10, 30), vy: -rnd(20, 40), r: rnd(0, 6), vr: rnd(-3, 3), f: Math.floor(rnd(0, 8)), t: 0, life: rnd(1.1, 1.8), z: rnd(0, 6) });
        }
        a._lf = f; return true;
      }
    }
    return NW ? NW(a, now) : false;
  };
  let lastT = performance.now();
  function drawLeaves() {
    const now = performance.now(), dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    const im = img('bamboo_leaves'); if (!im || !LEAVES.length) return;
    for (let i = LEAVES.length - 1; i >= 0; i--) { const l = LEAVES[i]; l.t += dt; if (l.t > l.life) { LEAVES.splice(i, 1); continue; }
      l.x += l.vx * dt; l.z = Math.max(0, l.z - l.vy * dt); l.vy -= 70 * dt; l.vx *= .985; l.r += l.vr * dt;
      const a = Math.min(1, (l.life - l.t) / .4), sz = 11;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(l.x, l.y - l.z - 4); ctx.rotate(l.r); ctx.drawImage(im, (l.f % 4) * 48, Math.floor(l.f / 4) * 48, 48, 48, -sz / 2, -sz / 2, sz, sz); ctx.restore(); }
  }

  // ================= 2) 蝴蝶 =================
  const BF_MAPS = { qingzhu_bamboo: 5, qingzhu_court: 4, qingzhu_upper_pavilion: 3, tj_houshan: 3, seal_field: 5, lin_court: 4 };
  let BF = [], bfMap = null;
  function spawnBF() {
    BF = []; bfMap = world.mapName; const n = BF_MAPS[bfMap]; const T = world.map && world.map.T; if (!n || !T) return;
    const p = world.player, W0 = T.mw || 2000, H0 = T.mh || 1500;
    for (let i = 0; i < n; i++) {
      // 一半在主角附近（进图就看得到），一半散在整张图
      const near = i % 2 === 0, hx = near ? p.x + rnd(-500, 500) : rnd(150, W0 - 150), hy = near ? p.y + rnd(-350, 250) : rnd(150, H0 - 150);
      BF.push({ c: Math.random() < .12 ? 3 : Math.floor(rnd(0, 3)), hx, hy, x: hx, y: hy, ph: rnd(0, 7), sp: rnd(.35, .6), perch: 0, rest: rnd(4, 10), flip: false, z: rnd(26, 48) });
    }
  }
  function drawBF(now) {
    if (world.mapName !== bfMap) spawnBF();
    if (!BF.length) return;
    if (window.TOD && TOD() === 'night') return;
    const im = img('butterflies_all'); if (!im) return;
    const t = now / 1000, dt = 1 / 60;
    for (const b of BF) {
      if (b.perch > 0) { b.perch -= dt; if (b.perch <= 0) b.rest = rnd(5, 12); }
      else {
        b.rest -= dt; b.ph += dt * b.sp;
        const nx = b.hx + Math.sin(b.ph * 1.3) * 120 + Math.sin(b.ph * 3.1 + 1) * 30, ny = b.hy + Math.sin(b.ph * .9 + 2) * 70 + Math.cos(b.ph * 2.7) * 18;
        if (Math.abs(nx - b.x) > .05) b.flip = nx > b.x;
        b.x = nx; b.y = ny; b.z = 34 + Math.sin(b.ph * 4.3) * 10;
        if (b.rest <= 0) { b.perch = rnd(2, 4); b.z = 6; }
      }
      const perched = b.perch > 0, col = perched ? 8 : Math.floor(t * 12 + b.c * 3 + b.hx) % 8, s = .5;
      ctx.save(); ctx.globalAlpha = .95;
      ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(b.x, b.y, 7, 2.5, 0, 0, 7); ctx.fill();
      ctx.translate(b.x, b.y - b.z); if (b.flip) ctx.scale(-1, 1); ctx.scale(s, s);
      if (perched) ctx.drawImage(im, col * 64, b.c * 64, 64, 64, -40, -46, 64, 64); else ctx.drawImage(im, col * 64, b.c * 64, 64, 64, -32, -32, 64, 64);
      ctx.restore();
    }
  }
  if (typeof tileAmbientHigh === 'function' || true) tileAmbientHigh = (o => function (T, cam, now) {
    o && o.apply(this, arguments);
    try { drawLeaves(); drawBF(performance.now()); } catch (e) {}
  })(typeof tileAmbientHigh === 'function' ? tileAmbientHigh : null);
  window.R103_WORLD = { BF: () => BF, LEAVES };
})();
