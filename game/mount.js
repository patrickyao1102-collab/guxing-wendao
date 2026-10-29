// ================= 御风白虎 / 星海灵鲲：独立双坐骑飞行试玩 =================
// 总策划：
//  · 只在户外大地图可骑；进室内 / 剧情锁定 / 不允许的地图自动落地。
//  · 骑乘速度 = 步行 ×1.6；飞行时不受房屋、树木、水面阻挡，只受地图边界限制。
//  · 飞行时不进门、不遇怪（飞在上面），地图边缘出口照常通往下一张图；碰到剧情触发点会先落地再触发。
//  · 独立地面软阴影；轻盈双流光与星点由单独 effect JS 绘制，不改变原图。
//  · 美术：Codex「坐骑01_御风白虎」骑乘帧（与大地图行走帧同规格：高精度每格 320×480，八行：下 / 左下 / 左 / 左上 / 上 / 右上 / 右 / 右下，列 0 悬停、1–6 扇翅）。
//    素材没到之前整个系统保持隐藏（拿不到坐骑，按钮不出现）。
(function () {
  if (typeof tileUpdate !== 'function') return;
  const F = () => S.flags || (S.flags = {});
  const CATALOG = window.MOUNT_DUO_CATALOG = {
  "white_tiger": {
    "id": "white_tiger",
    "name": "御风白虎",
    "available": true,
    "sheet": "mount/tiger_2x.webp",
    "cell": [
      320,
      480
    ],
    "foot": [
      160,
      464
    ],
    "atlasSize": [
      2240,
      3840
    ],
    "directionRows": {
      "down": 0,
      "down_left": 1,
      "left": 2,
      "up_left": 3,
      "up": 4,
      "up_right": 5,
      "right": 6,
      "down_right": 7
    },
    "renderScaleByDirection": {
      "down": 0.6584158415841584,
      "down_left": 0.7732558139534884,
      "left": 0.875,
      "up_left": 0.7228260869565217,
      "up": 0.665,
      "up_right": 0.7228260869565217,
      "right": 0.875,
      "down_right": 0.7732558139534884
    },
    "lift": 6,
    "speedMul": 1.6,
    "fps": 8,
    "effectTheme": "white_tiger"
  },
  "star_kun": {
    "id": "star_kun",
    "name": "星海灵鲲",
    "available": true,
    "sheet": "mount/kun_2x.webp",
    "cell": [
      320,
      480
    ],
    "foot": [
      160,
      464
    ],
    "atlasSize": [
      2240,
      3840
    ],
    "directionRows": {
      "down": 0,
      "down_left": 1,
      "left": 2,
      "up_left": 3,
      "up": 4,
      "up_right": 5,
      "right": 6,
      "down_right": 7
    },
    "renderScaleByDirection": {
      "down": 0.5785123966942148,
      "down_left": 0.8045977011494253,
      "left": 0.9210526315789473,
      "up_left": 0.9722222222222222,
      "up": 0.7865168539325843,
      "up_right": 0.9722222222222222,
      "right": 0.9210526315789473,
      "down_right": 0.8045977011494253
    },
    "lift": 6,
    "speedMul": 1.6,
    "fps": 8,
    "effectTheme": "star_kun"
  }
};
  let activeId = 'white_tiger';
  const CFG = window.MOUNT_CFG = { ...CATALOG[activeId] };
  const FX = (window.MountFX2 || window.MountDuoEffects).create();   // 光效 v2（mount_fx2.js），没有时退回 Codex 原版
  FX.setTheme(CFG.effectTheme);
  const R = window.RIDE = { on: false, k: 0, anim: null, t: 0 };
  // Screen-space angles: right=0°, down=90°; boundaries belong to the clockwise sector.
  const angleFaces = ['right', 'down_right', 'down', 'down_left', 'left', 'up_left', 'up', 'up_right'];
  const flightFaceOf = (vx, vy) => angleFaces[(Math.floor((Math.atan2(vy, vx) + Math.PI / 8) / (Math.PI / 4) + 1e-12) + 8) % 8];
  // 允许骑乘的地图：户外、非剧情关卡
  const DENY = new Set(['tj_houshan', 'seal_field', 'mijing', 'tj_forbidden', 'tj_scripture']);
  const allowed = m => { const d = TMAPS[m]; return !!(d && !d.indoor && !DENY.has(m) && !/mijing|cave|dungeon|_room|_hall|_inn|_shop/.test(m)); };
  const images = {}, loadStates = {};
  const has = () => !!F().mount_duo && !!images[activeId];
  for (const [id, spec] of Object.entries(CATALOG)) {
    if (!spec.available) { loadStates[id] = 'pending'; continue; }
    loadStates[id] = 'loading';
    const im = new Image();
    im.onload = () => {
      if (im.naturalWidth !== spec.atlasSize[0] || im.naturalHeight !== spec.atlasSize[1]) { loadStates[id] = 'error'; return; }
      images[id] = im; IMG['mount_duo_' + id] = im; loadStates[id] = 'ready';
    };
    im.onerror = () => { loadStates[id] = 'error'; }; im.src = spec.sheet;
  }
  window.MOUNT_GIVE = () => { F().mount_duo = 1; };
  window.MOUNT_DUO_SELECT = id => {
    if (!images[id] || !CATALOG[id] || R.anim) return false;
    activeId = id; Object.assign(CFG, CATALOG[id]);
    FX.setTheme(CFG.effectTheme); R.moving = false;
    world.walkTarget = null; world.path = null; input.keys = {}; input.down = false;
    return true;
  };
  window.MOUNT_DUO_EFFECTS = enabled => FX.setEnabled(enabled);

  // ---------- 起飞 / 落地 ----------
  const burst = (x, y, n) => { if (FX.burst) FX.burst(x, y, n > 15); };
  window.MOUNT_DUO_STATUS = () => ({
    mountId: activeId, mountName: CFG.name,
    mounts: Object.entries(CATALOG).map(([id, config]) => ({ id, name: config.name, available: config.available, state: loadStates[id] })),
    riding: R.on, moving: !!R.moving, face: R.on ? (R.flightFace || world.player?.face) : world.player?.face,
    position: world.player && [Math.round(world.player.x), Math.round(world.player.y)],
    sprite: !!images[activeId], animating: !!R.anim,
    sheetSize: images[activeId] && [images[activeId].naturalWidth, images[activeId].naturalHeight],
    renderScale: CFG.renderScaleByDirection[R.flightFace || world.player?.face || 'down'], fps: CFG.fps,
    effects: FX.snapshot(),
    errors: (window.__gameErrs || []).slice(-2)
  });
  // 能走通的区域：从起飞点（或进图落点）出发洪泛，落地只落在这片区域里，绝不会落进围墙里的死角
  function reach(T, x, y) {
    const [c0, r0] = cellOf(x, y), C = T.cols, Rn = T.rows, m = new Uint8Array(C * Rn), q = [];
    const ok = (c, r) => c >= 0 && r >= 0 && c < C && r < Rn && !T.block[r][c];
    if (!ok(c0, r0)) return null; m[r0 * C + c0] = 1; q.push(c0, r0);
    for (let i = 0; i < q.length; i += 2) { const c = q[i], r = q[i + 1]; for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dc, nr = r + dr; if (ok(nc, nr) && !m[nr * C + nc]) { m[nr * C + nc] = 1; q.push(nc, nr); } } }
    return { T, m };
  }
  const inReach = (T, x, y) => { const z = R.reach; if (!z || z.T !== T) return true; const [c, r] = cellOf(x, y); return !!z.m[r * T.cols + c]; };
  function nearestStand(T, x, y) { const good = (a, b) => a > 20 && b > 30 && a < T.mw - 20 && b < T.mh - 8 && canStand(T, a, b) && inReach(T, a, b); if (good(x, y)) return [x, y]; for (let d = 8; d < 900; d += 8) for (let a = 0; a < 6.28; a += 8 / d) { const nx = x + Math.cos(a) * d, ny = y + Math.sin(a) * d * .8; if (good(nx, ny)) return [nx, ny]; } return R.from || [x, y]; }
  async function takeOff() {
    if (R.on || R.anim || !has() || !allowed(world.mapName) || world.locked) return;
    const p = world.player; world.path = null; world.walkTarget = null; FX.clear();
    R.reach = reach(world.map.T, p.x, p.y); R.from = [p.x, p.y];
    R.flightFace = p.face || 'down'; R.on = true; R.anim = 'up'; R.t = 0; burst(p.x, p.y, 18); try { playSnd('sfx_charge', .35); } catch (e) {}
    await sleep(650); R.anim = null; R.k = 1;
  }
  async function land(instant) {
    if (!R.on) return; FX.clear(); const T = world.map && world.map.T, p = world.player;
    if (T) { const [x, y] = nearestStand(T, p.x, p.y); p.x = x; p.y = y; }
    if (instant) { R.on = false; R.anim = null; R.k = 0; return; }
    R.anim = 'down'; R.t = 0; await sleep(520); burst(p.x, p.y, 14); try { playSnd('ui_confirm', .5); } catch (e) {}
    R.on = false; R.anim = null; R.k = 0;
    for (const f of world.followers || []) { f.x = p.x; f.y = p.y; }
    world.trail.length = 0;
  }
  window.MOUNT_LAND = land; window.MOUNT_TOGGLE = () => R.on ? land() : takeOff();

  // ---------- 进图：不允许的图自动落地 ----------
  tileSetMap = (orig => function (name) { FX.clear(); if (R.on && !allowed(name)) { R.on = false; R.anim = null; R.k = 0; } const res = orig.apply(this, arguments); if (R.on) { try { const p = world.player; R.reach = reach(world.map.T, p.x, p.y); R.from = [p.x, p.y]; } catch (e) {} } return res; })(tileSetMap);

  // ---------- 飞行移动（自己算，不走碰撞；其余逻辑交回原来的 tileUpdate）----------
  const BTN = () => ({ x: W - 212, y: H - 62, r: 40 });
  tileUpdate = (orig => function (dt) {
    const T = world.map.T, p = world.player;
    const free = !world.locked && !dialog && !choice && !sysPanel && !S.menu;
    // 骑乘按钮
    if (free && S.hud && has() && allowed(world.mapName) && input.tapped && !input.tapped.key) { const b = BTN(), t = input.tapped; if (Math.hypot(t.x - b.x, t.y - b.y) < b.r + 8) { consumeTap(); R.on ? land() : takeOff(); return orig(0); } }
    if (R.on && (world.locked || !allowed(world.mapName))) { if (!allowed(world.mapName)) land(true); }
    if (!R.on || R.anim || !free) { if (R.on && R.anim) { consumeTap(); } return orig(dt); }
    // 剧情触发点：先落地再触发
    for (const t of world.triggers) if (!t.done && Math.hypot(p.x - t.x, p.y - t.y) < t.r + 30) { land(true); return orig(dt); }
    const cam = world.cam || { x: 0, y: 0 }, spd = (typeof WALK_FINAL_SPEED !== 'undefined' ? WALK_FINAL_SPEED : 146) * CFG.speedMul;
    const tap = consumeTap(); if (tap && !tap.key) { world.walkTarget = { x: clamp(tap.x + cam.x, 24, T.mw - 24), y: clamp(tap.y + cam.y, 40, T.mh - 12) }; }
    let vx = 0, vy = 0; const K = input.keys; let kx = 0, ky = 0;
    if (K.ArrowLeft || K.a || K.A) kx -= 1; if (K.ArrowRight || K.d || K.D) kx += 1; if (K.ArrowUp || K.w || K.W) ky -= 1; if (K.ArrowDown || K.s || K.S) ky += 1;
    if (kx || ky) { world.walkTarget = null; const l = Math.hypot(kx, ky); vx = kx / l * spd; vy = ky / l * spd; }
    else if (input.down && !tap && !world.walkTarget) { const dx = input.x + cam.x - p.x, dy = input.y + cam.y - p.y, l = Math.hypot(dx, dy); if (l > 30) { vx = dx / l * spd; vy = dy / l * spd; } }
    else if (world.walkTarget) { const dx = world.walkTarget.x - p.x, dy = world.walkTarget.y - p.y, l = Math.hypot(dx, dy); if (l <= Math.max(.5, spd * dt * 1.2)) { p.x = world.walkTarget.x; p.y = world.walkTarget.y; world.walkTarget = null; } else { vx = dx / l * spd; vy = dy / l * spd; } }
    if (vx || vy) { p.x = clamp(p.x + vx * dt, 24, T.mw - 24); p.y = clamp(p.y + vy * dt, 40, T.mh - 12); R.flightFace = flightFaceOf(vx, vy); p.face = faceOf(vx, vy); if (Math.abs(vx) > 1) p.dir = vx > 0 ? 1 : -1; }
    R.moving = !!(vx || vy);
    // 地图边缘出口照常走
    if (R.moving) { const [pc, pr] = cellOf(p.x, p.y);
      for (const d of T.doors) { if (!d.edge || (d.cond && !d.cond())) continue; if (pc >= d.x && pc < d.x + (d.w || 1) && pr >= d.y && pr < d.y + (d.h || 1)) { world.walkTarget = null; goMap(d.to, d.at[0], d.at[1], d.face || p.face); return; } } }
    // 交回原逻辑（镜头、NPC、触发点……），但不让它再移动主角
    const keys = input.keys, down = input.down; input.keys = {}; input.down = false; const wt = world.walkTarget; world.path = null; world.walkTarget = null;
    try { orig(dt); } finally { input.keys = keys; input.down = down; world.walkTarget = wt; }
    p.moving = R.moving;
  })(tileUpdate);
  // 飞着不遇怪
  tileMobs = (orig => function (dt, T, free) { return orig(dt, T, free && !R.on); })(tileMobs);

  // ---------- 绘制 ----------
  const lerpK = () => R.anim === 'up' ? Math.min(1, R.t / .65) : R.anim === 'down' ? 1 - Math.min(1, R.t / .52) : (R.on ? 1 : 0);
  drawActorT = (orig => function (a, now) {
    if (R.on && (a === world.player || a.follower)) return;   // 主角骑虎画在高层；同伴“随行”不画
    return orig(a, now);
  })(drawActorT);
  tileAmbientLow = (orig => function (T, cam, now) {
    orig(T, cam, now); if (!R.on) return; const p = world.player, k = lerpK(), bob = Math.sin(now * 3.2) * 2;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(45 + 10 * k - bob * .45, 11 + 3 * k);
    const shadow = ctx.createRadialGradient(0, 0, .1, 0, 0, 1);
    shadow.addColorStop(0, 'rgba(12,22,35,.24)');
    shadow.addColorStop(.55, 'rgba(12,22,35,.14)');
    shadow.addColorStop(1, 'rgba(12,22,35,0)');
    ctx.fillStyle = shadow; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  })(tileAmbientLow);
  let last = performance.now();
  tileAmbientHigh = (orig => function (T, cam, now) {
    const t1 = performance.now(), dt = Math.min(.1, (t1 - last) / 1000); last = t1; R.t += dt;
    const p = world.player;
    const flightLift = CFG.lift + Math.sin(now * 3.2) * 2;
    if (!R.on && !FX.burst) FX.clear();
    FX.update(dt, { x: p.x, y: p.y, lift: flightLift, moving: R.on && R.moving && !R.anim && !world.locked && !S.menu && !dialog && !choice && !sysPanel, riding: R.on && !R.anim });
    // World-space ribbons render behind the opaque rider/beast, so light never masks the face.
    FX.draw(ctx);
    if (R.on) {
      const k = lerpK(), bob = Math.sin(now * 3.2) * 2 * k, lift = CFG.lift * k + bob, im = images[activeId];
      // 起落光环
      if (R.anim) { const u = R.anim === 'up' ? R.t / .65 : R.t / .52; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,236,190,${.7 * (1 - u)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(p.x, p.y, 30 + u * 90, 10 + u * 30, 0, 0, 7); ctx.stroke(); ctx.restore(); }
      const f = R.flightFace || p.face || 'down', row = CFG.directionRows[f] ?? 0, col = (R.moving || R.anim) ? 1 + Math.floor(now * CFG.fps) % 6 : 0;
      const [cw, ch] = CFG.cell, sc = CFG.renderScaleByDirection[f] || CFG.renderScaleByDirection.down, [fx, fy] = CFG.foot;
      ctx.save(); ctx.translate(p.x, p.y - lift);
      if (im) ctx.drawImage(im, col * cw, row * ch, cw, ch, -fx * sc, -fy * sc, cw * sc, ch * sc);
      ctx.restore();
      if (FX.drawFront) FX.drawFront(ctx);
    }
    return orig(T, cam, now);
  })(tileAmbientHigh);
  // 骑乘按钮（行囊左边）
  const hudLayer = { draw() {
    if (!world.map || !world.map.tile || S.scene !== drawMap || !S.hud || !has() || !allowed(world.mapName) || world.locked || dialog || choice || sysPanel || S.menu || (typeof battle !== 'undefined' && battle)) return;
    const b = BTN(), now = performance.now() / 1000;
    ctx.save(); const g = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, b.r); g.addColorStop(0, R.on ? '#2c5c78' : '#7a2420'); g.addColorStop(1, R.on ? '#10283a' : '#3a0c0a'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); ctx.strokeStyle = '#e9c77a'; ctx.lineWidth = 3; ctx.stroke();
    if (R.on) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(200,230,255,${.35 + .2 * Math.sin(now * 3)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 4, 0, 7); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
    ctx.font = `30px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9b8'; ctx.fillText(R.on ? '落' : activeId === 'star_kun' ? '鲲' : '虎', b.x, b.y + 1);
    ctx.restore();
  } };
  if (S.overlay) S.overlay.push(hudLayer);
  // ---------- 接入游戏（Claude）：两只坐骑都有时，「换」按钮切换；拿坐骑：MOUNT_GIVE('white_tiger' | 'star_kun') ----------
  const owned = () => Object.keys(CATALOG).filter(id => F()['mount_' + id] || (F().mount_duo && !Object.keys(CATALOG).some(k => F()['mount_' + k])));
  window.MOUNT_GIVE = id => { F().mount_duo = 1; if (id) { F()['mount_' + id] = 1; if (!owned().includes(activeId)) window.MOUNT_DUO_SELECT(id); } };
  const SW = () => ({ x: W - 262, y: H - 104, r: 22 });
  tileUpdate = (orig => function (dt) {
    const t = input.tapped, list = owned();
    if (t && !t.key && list.length > 1 && has() && S.hud && !world.locked && !dialog && !choice && !sysPanel && !S.menu && allowed(world.mapName)) { const b = SW(); if (Math.hypot(t.x - b.x, t.y - b.y) < b.r + 8) { consumeTap(); const i = list.indexOf(activeId); window.MOUNT_DUO_SELECT(list[(i + 1) % list.length]); toast('坐骑：' + CFG.name); return orig(0); } }
    return orig(dt);
  })(tileUpdate);
  if (S.overlay) S.overlay.push({ draw() {
    if (owned().length < 2 || !world.map || !world.map.tile || S.scene !== drawMap || !S.hud || !has() || !allowed(world.mapName) || world.locked || dialog || choice || sysPanel || S.menu || (typeof battle !== 'undefined' && battle)) return;
    const b = SW(); ctx.save(); ctx.fillStyle = 'rgba(20,30,44,.85)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); ctx.strokeStyle = '#e9c77a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = `20px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9b8'; ctx.fillText('换', b.x, b.y + 1); ctx.restore();
  } });
})();
