// ================= 走路质感：脚步声（按地面材质）+ 脚下扬尘 / 草屑 + 起步加速 =================
// 不改角色动作，只补“落脚”的反馈：每一步有声音、有一点尘土，起步有一个很短的加速。
(function () {
  if (typeof updateMap !== 'function') return;
  // ---- 地面材质：把当前地图的地面缩成小图，按脚下颜色判断 草 / 土 / 石 / 木 ----
  let gMap = null, gData = null, gW = 0, gH = 0, gSx = 1, gSy = 1;
  function groundOf(x, y) {
    const def = world.map && world.map.def; if (!def) return 'stone';
    if (def.indoor) return 'wood';
    const im = def.baked && IMG[def.baked.ground];
    if (gMap !== world.mapName || !gData) {
      gData = null; gMap = world.mapName;
      if (im && world.map.T) { try { const T = world.map.T; gW = 160; gH = Math.max(1, Math.round(160 * T.mh / T.mw)); const c = document.createElement('canvas'); c.width = gW; c.height = gH; const cx = c.getContext('2d'); cx.drawImage(im, 0, 0, gW, gH); gData = cx.getImageData(0, 0, gW, gH).data; gSx = gW / T.mw; gSy = gH / T.mh; } catch (e) { gData = null; } }
    }
    if (!gData) return 'stone';
    const i = (Math.min(gH - 1, Math.max(0, Math.floor(y * gSy))) * gW + Math.min(gW - 1, Math.max(0, Math.floor(x * gSx)))) * 4;
    const r = gData[i], g = gData[i + 1], b = gData[i + 2];
    if (g > r * 1.12 && g > b * 1.05) return 'grass';
    if (r > b * 1.25 && r > 90) return 'dirt';
    return 'stone';
  }
  // ---- 脚步声：WebAudio 合成（噪声 + 滤波 + 包络），音量很轻 ----
  let noise = null;
  function stepSound(kind) {
    return;   // 作者：走路声去掉
    try {
      if (typeof AUD === 'undefined' || AUD.muted || AUD.mode !== 'webaudio' || !AC || !AUD.sfxGain) return;
      if (!noise) { noise = AC.createBuffer(1, Math.floor(AC.sampleRate * .25), AC.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const t = AC.currentTime, s = AC.createBufferSource(); s.buffer = noise; s.playbackRate.value = .9 + Math.random() * .2;
      const f = AC.createBiquadFilter(), g = AC.createGain();
      const P = { wood: ['lowpass', 700, .8, .55, .09], stone: ['bandpass', 1900, 1.2, .5, .06], dirt: ['bandpass', 900, .9, .5, .09], grass: ['highpass', 2600, .7, .22, .14] }[kind] || ['bandpass', 1500, 1, .4, .07];
      f.type = P[0]; f.frequency.value = P[1] * (.92 + Math.random() * .16); f.Q.value = P[2];
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P[3] * .5, t + .006); g.gain.exponentialRampToValueAtTime(.0008, t + P[4]);
      s.connect(f); f.connect(g); g.connect(AUD.sfxGain); s.start(t, Math.random() * .1, P[4] + .02);
      if (kind === 'wood') {   // 木地板多一声低沉的“咚”
        const o = AC.createOscillator(), og = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(70, t + .08);
        og.gain.setValueAtTime(.12, t); og.gain.exponentialRampToValueAtTime(.0008, t + .09); o.connect(og); og.connect(AUD.sfxGain); o.start(t); o.stop(t + .1);
      }
    } catch (e) {}
  }
  // ---- 扬尘 / 草屑（世界坐标）----
  const puffs = [];
  function puff(x, y, kind) {
    if (kind === 'wood') return;
    const n = kind === 'grass' ? 3 : 4;
    for (let i = 0; i < n; i++) puffs.push({ x: x + (Math.random() - .5) * 14, y: y - 2 + (Math.random() - .5) * 4, vx: (Math.random() - .5) * 22, vy: -6 - Math.random() * 10, r: kind === 'grass' ? 1.6 : 3 + Math.random() * 3, t: 0, life: kind === 'grass' ? .45 : .6 + Math.random() * .25, kind });
    if (puffs.length > 60) puffs.splice(0, puffs.length - 60);
  }
  tileAmbientLow = (orig => function (T, cam, now) {
    orig(T, cam, now);
    if (!puffs.length) return;
    ctx.save();
    for (const p of puffs) { const k = p.t / p.life; if (k >= 1) continue; const a = (1 - k) * (p.kind === 'grass' ? .7 : .28);
      if (p.kind === 'grass') { ctx.fillStyle = `rgba(110,150,70,${a})`; ctx.fillRect(p.x, p.y, p.r * 1.6, p.r); }
      else { ctx.fillStyle = p.kind === 'dirt' ? `rgba(170,140,100,${a})` : `rgba(200,195,185,${a})`; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * (1 + k * 1.6), p.r * (.6 + k * .8), 0, 0, 7); ctx.fill(); } }
    ctx.restore();
  })(tileAmbientLow);
  // ---- 每帧：步点、起步加速 ----
  let last = performance.now(), moveT = 0, stepAcc = 0, foot = 0;
  const STEP = .197;   // 走路一圈 6 帧 × 131ms，左右脚各落一次
  updateMap = (orig => function (dt) {
    const now = performance.now(), d = Math.min(.1, (now - last) / 1000); last = now;
    const p = world.player, wasMoving = p && p.moving;
    window.WALK_MUL = wasMoving ? Math.min(1, .62 + .38 * Math.min(1, moveT / .16)) : .62;
    const r = orig(dt);
    if (p && p.moving && world.map && world.map.tile && !world.locked) {
      moveT += d; stepAcc += d;
      if (stepAcc >= STEP || moveT === d) { stepAcc = moveT === d ? STEP * .5 : stepAcc - STEP; foot ^= 1; const k = groundOf(p.x, p.y); stepSound(k); puff(p.x + (foot ? 5 : -5), p.y, k); }
    } else { moveT = 0; stepAcc = 0; }
    for (const q of puffs) { q.t += d; q.x += q.vx * d; q.y += q.vy * d; q.vy += 18 * d; }
    for (let i = puffs.length - 1; i >= 0; i--) if (puffs[i].t >= puffs[i].life) puffs.splice(i, 1);
    return r;
  })(updateMap);
  const _tsm = tileSetMap; tileSetMap = function () { puffs.length = 0; gData = null; return _tsm.apply(this, arguments); };
})();
