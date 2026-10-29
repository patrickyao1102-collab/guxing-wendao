/* 洛尘 · 本源绝技接入（总策划 Claude，2026-10-25）
 * 光明本源 / 黑暗本源：用 Codex 原代码离线渲染出透明特效层，实时叠在真实战场上（敌人、队友、背景都是游戏里的），按时间点真实结算。
 * 日月轮转：暂时仍播成片过场。
 * 触发规则（设计总表）：
 *   黑暗本源：洛尘气血归零时立刻触发（每场一次）→ 单体 ×3.6 无视防御，洛尘以 50% 气血复活。
 *   光明本源：队友全部倒下、只剩洛尘时立刻触发（每场一次）→ 全体 ×1.5，全队复活/回复到至少 50%，解除控制。
 *   宇宙伊始：光明、黑暗都已触发后洛尘再次倒下 → 全体 ×6.0，之后洛尘不再复活。（特效未做，暂用白闪）
 *   日月轮转：怒气 100 手动释放 → 全体 ×1.8，敌方行动条 −60，我方回复 15% 并解除控制。
 * 洛尘基础属性改为 600/150/58/16/13，取消无限灵力/怒气。
 */
(function () {
  'use strict';
  if (typeof ALLY2_ACT === 'undefined' || !ALLY2_ACT.luochen || typeof ALLY2_SKILLS === 'undefined') return;
  const BASE = 'lc_cine/';
  const CINE = {
    guangming: { video: null, voice: BASE + 'voice/gm_01.mp3', title: '光明本源' },
    heian: { video: null, voice: BASE + 'voice/ha_14.mp3', title: '黑暗本源' },
    riyue: { video: null, voice: BASE + 'voice/ry_12.mp3', title: '日月轮转' },
    pojun: { video: null, voice: null, title: '破军剑阵·太阳' },
    shikong: { video: null, voice: null, title: '时空错乱' },
  };

  // ---------- 数值（总策划定） ----------
  if (typeof PARTY_DB !== 'undefined' && PARTY_DB.luochen) PARTY_DB.luochen.base = { maxhp: 600, maxmp: 150, atk: 58, def: 16, spd: 13 };
  const oldShikong = ALLY2_SKILLS.luochen && ALLY2_SKILLS.luochen.shikong;
  ALLY2_SKILLS.luochen = {
    riyue: { name: '绝技·日月轮转', cost: 0, rage: 100, desc: '烛龙天赋：昼夜轮转，紫雷龙息轰击全体并压回行动条，日出光雨回复全队并解除控制（需怒气满）', lv: 0 },
    shikong: Object.assign({}, oldShikong || { name: '绝技·时空错乱', desc: '光阴倒流、万物失序' }, { cost: 50 }),
  };

  // ---------- 全屏过场 ----------
  let layer = null, vid = null, skipBtn = null;
  const audioBuf = {};
  function ensureLayer() {
    if (layer) return;
    layer = document.createElement('div');
    layer.style.cssText = 'position:fixed;inset:0;z-index:60;background:#000;display:none;align-items:center;justify-content:center';
    vid = document.createElement('video');
    vid.setAttribute('playsinline', ''); vid.setAttribute('webkit-playsinline', ''); vid.preload = 'auto';
    vid.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000';
    skipBtn = document.createElement('button');
    skipBtn.textContent = '跳过 ▶▶';
    skipBtn.style.cssText = 'position:absolute;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));padding:8px 16px;font-size:15px;color:#f3e3bf;background:rgba(20,12,6,.7);border:1px solid rgba(230,200,140,.6);border-radius:6px;display:none';
    layer.append(vid, skipBtn); document.body.appendChild(layer);
  }
  const ac = () => { try { return typeof AC !== 'undefined' && AC && AC.state !== 'closed' ? AC : null; } catch (e) { return null; } };
  const withTimeout = (pr, ms, fb) => Promise.race([pr, new Promise(r => setTimeout(() => r(fb), ms))]);
  async function loadVoice(url) {
    const A = ac(); if (!A) return null;
    if (!audioBuf[url]) audioBuf[url] = fetch(url).then(r => r.arrayBuffer()).then(ab => { try { const r = A.decodeAudioData(ab); return r && r.then ? r.catch(() => null) : null; } catch (e) { return null; } }).catch(() => null);
    return audioBuf[url];
  }
  // 成片整段先下载到本机内存再播，避免边下边播卡顿
  const vBlob = {};
  function loadVideo(kind) {
    if (!vBlob[kind]) vBlob[kind] = fetch(CINE[kind].video).then(r => { if (!r.ok) throw 0; return r.blob(); }).then(b => URL.createObjectURL(b)).catch(() => CINE[kind].video);
    return vBlob[kind];
  }
  function preload() { ensureLayer(); for (const k in CINE) { if (k === 'pojun' || /^(qx|dx)_/.test(k)) continue; if (LIVE && LIVE[k]) loadLive(k); else if (CINE[k].video) loadVideo(k); if (CINE[k].voice) loadVoice(CINE[k].voice); } }

  function play(kind) {
    const c = CINE[kind]; ensureLayer();
    if (!c || !c.video) return Promise.resolve();   // 旧成片过场已下线（实时特效层放不了时直接结算）
    return new Promise(async resolve => {
      let done = false, src = null, safety = null;
      const finish = () => {
        if (done) return; done = true; clearTimeout(safety);
        try { vid.pause(); } catch (e) {} try { src && src.stop(); } catch (e) {}
        layer.style.display = 'none'; skipBtn.style.display = 'none'; window.CINE_PAUSE = false;
        vid.onended = null; vid.onerror = null; skipBtn.onclick = null;
        try { vid.removeAttribute('src'); vid.load(); } catch (e) {}
        try { if (typeof playBgm === 'function' && AUD.want) playBgm(AUD.want, true); } catch (e) {}
        resolve();
      };
      safety = setTimeout(finish, 32000);                        // 无论如何 32 秒后回到战斗，绝不卡死
      layer.style.display = 'flex'; window.CINE_PAUSE = true;      // 过场期间暂停游戏画面，手机只解码视频
      setTimeout(() => { if (!done) skipBtn.style.display = 'block'; }, 1000);
      skipBtn.onclick = e => { e.stopPropagation(); finish(); };
      const muted = typeof AUD !== 'undefined' && AUD.muted;
      try { if (typeof stopBgm === 'function') stopBgm(.3); } catch (e) {}
      const A = ac(); if (A && A.state === 'suspended') { try { await withTimeout(A.resume(), 800); } catch (e) {} }
      const [url, buf] = await Promise.all([withTimeout(loadVideo(kind), 9000, c.video), muted ? null : withTimeout(loadVoice(c.voice), 4000, null)]);
      if (done) return;
      vid.onended = finish; vid.onerror = finish;
      vid.src = url; vid.muted = true;                             // 画面一律静音播放（手机允许），声音走 WebAudio
      const startVoice = () => {
        if (done || muted) return;
        if (buf) { try { src = A.createBufferSource(); src.buffer = buf; src.connect(A.destination); src.start(); } catch (e) {} }
        else { try { vid.muted = false; } catch (e) {} }
      };
      const ok = await withTimeout(vid.play().then(() => true, () => false), 4000, false);
      if (!ok) { finish(); return; }
      startVoice();
      const dur = vid.duration && isFinite(vid.duration) ? vid.duration : 20;
      clearTimeout(safety); safety = setTimeout(finish, dur * 1000 + 2500);
    });
  }

  // ---------- 实时版：Codex 原代码离线渲染出的「透明特效层」叠在真实战场上 ----------
  // 视频上半是特效颜色（预乘），下半是透明度；用 WebGL 合成，敌人/队友/背景都是游戏里真实的。
  const LIVE = {};   // 日月轮转 / 时空错乱已改为 Codex 原代码实时运行（ry_codex.js / sk_codex.js），不再有烘焙视频
  // 天剑三式已改为实时代码绘制（dx_rt / qx_rt / sx_rt），不再使用预渲染视频
  let glc = null, gl = null, glv = null, glReady = false, glOff = null;
  function initGL() {
    if (glReady) return true; if (gl === false) return false;
    try {
      glc = document.createElement('canvas'); glc.width = 1280; glc.height = 720;
      glc.style.cssText = 'position:fixed;pointer-events:none;z-index:55;display:none;left:0;top:0;background:transparent';
      document.body.appendChild(glc);
      gl = glc.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false }) || false; if (!gl) return false;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}'));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec2 uv;uniform sampler2D t;uniform vec2 o;void main(){vec2 q=uv-o;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.){gl_FragColor=vec4(0.);return;}vec3 c=texture2D(t,vec2(q.x,q.y*.5)).rgb;float a=texture2D(t,vec2(q.x,.5+q.y*.5)).r;gl_FragColor=vec4(min(c,vec3(a+.25)),a);}'));
      gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link');
      gl.useProgram(pr); glOff = gl.getUniformLocation(pr, 'o'); gl.uniform2f(glOff, 0, 0);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      glv = document.createElement('video'); glv.setAttribute('playsinline', ''); glv.setAttribute('webkit-playsinline', ''); glv.muted = true; glv.preload = 'auto';
      glv.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0'; document.body.appendChild(glv);
      glReady = true; return true;
    } catch (e) { console.error('LC live GL', e); gl = false; return false; }
  }
  const lBlob = {};
  function loadLive(kind) {
    if (!lBlob[kind]) lBlob[kind] = fetch(LIVE[kind]).then(r => { if (!r.ok) throw 0; return r.blob(); }).then(b => URL.createObjectURL(b)).catch(() => LIVE[kind]);
    return lBlob[kind];
  }
  function placeGL() { const c = document.getElementById('c'); if (!c) return; const r = c.getBoundingClientRect(); Object.assign(glc.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); }
  // cues: [{at: 秒, fn}]，按视频时间触发；返回 false 表示实时版放不了（改用旧过场）
  function playLive(kind, cues, hide, off) {
    if (!LIVE[kind] || !initGL()) return Promise.resolve(false);
    try { gl.uniform2f(glOff, off ? off[0] / 1280 : 0, off ? off[1] / 720 : 0); } catch (e) {}
    return new Promise(async resolve => {
      let done = false, src = null, safety = null, raf = 0, started = false;
      const fired = new Set();
      const fire = all => { for (let i = 0; i < cues.length; i++) if (!fired.has(i) && (all || glv.currentTime >= cues[i].at)) { fired.add(i); try { cues[i].fn(); } catch (e) { console.error(e); } } };
      const finish = ok => {
        if (done) return; done = true; clearTimeout(safety); cancelAnimationFrame(raf);
        if (started) fire(true);
        try { glv.pause(); } catch (e) {} try { src && src.stop(); } catch (e) {}
        glc.style.display = 'none'; skipBtn && (skipBtn.style.display = 'none', skipBtn.onclick = null); if (layer) layer.style.display = 'none';
        if (battle) { battle._hideUnit = null; battle._hideFn = null; battle._cineHide = false; }
        glv.onended = null; glv.onerror = null;
        try { if (typeof playBgm === 'function' && AUD.want) playBgm(AUD.want, true); } catch (e) {}
        resolve(ok);
      };
      safety = setTimeout(() => finish(started), 30000);
      ensureLayer();
      const muted = typeof AUD !== 'undefined' && AUD.muted;
      const A = ac(); if (A && A.state === 'suspended') { try { await withTimeout(A.resume(), 800); } catch (e) {} }
      const [url, buf] = await Promise.all([withTimeout(loadLive(kind), 9000, LIVE[kind]), (muted || !CINE[kind].voice) ? null : withTimeout(loadVoice(CINE[kind].voice), 4000, null)]);
      if (done) return;
      glv.src = url; glv.currentTime = 0; glv.onended = () => finish(true); glv.onerror = () => finish(started);
      const ok = await withTimeout(glv.play().then(() => true, () => false), 8000, false);
      if (!ok || done) { finish(false); return; }
      started = true;
      try { if (typeof stopBgm === 'function') stopBgm(.3); } catch (e) {}
      if (battle) battle._cineHide = true;   // 大招演出时收起顶栏 / 行动条 / 状态面板，免得法阵压在 HUD 上
      if (battle && hide) { if (typeof hide === 'function') battle._hideFn = u => hide(u, glv.currentTime); else battle._hideUnit = hide; }
      if (buf) { try { src = A.createBufferSource(); src.buffer = buf; src.connect(A.destination); src.start(); } catch (e) {} }
      placeGL(); glc.style.display = 'block';
      // 跳过按钮（复用过场层的按钮，但不盖住画面）
      skipBtn.style.display = 'none'; document.body.appendChild(skipBtn); skipBtn.style.position = 'fixed'; skipBtn.style.zIndex = 61;
      setTimeout(() => { if (!done) skipBtn.style.display = 'block'; }, 1000);
      skipBtn.onclick = e => { e.stopPropagation(); finish(true); };
      const tick = () => {
        if (done) return;
        if (glv.readyState >= 2) { try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, glv); gl.viewport(0, 0, 1280, 720); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); } catch (e) {} }
        fire(false); raf = requestAnimationFrame(tick);
      };
      tick();
    });
  }
  // ---------- 代码版大招播放器：配音 + 按时间轴逐帧调用 mod.back / mod.front ----------
  async function playCode(mod, kind, P, cues, dim) {
    const b = battle; if (!b) return;
    const muted = typeof AUD !== 'undefined' && AUD.muted, A = ac();
    if (A && A.state === 'suspended') { try { await withTimeout(A.resume(), 800); } catch (e) {} }
    const buf = (muted || !CINE[kind] || !CINE[kind].voice) ? null : await withTimeout(loadVoice(CINE[kind].voice), 4000, null);
    try { if (typeof stopBgm === 'function') stopBgm(.3); } catch (e) {}
    let src = null; if (buf && A) { try { src = A.createBufferSource(); src.buffer = buf; src.connect(A.destination); src.start(); } catch (e) {} }
    b._cineHide = true; b._hideUnit = P; try { dimTo(dim == null ? .6 : dim, 500); } catch (e) {}
    let fired = 0; const T0 = performance.now(), dur = mod.DUR;
    await new Promise(res => {
      const fire = all => { while (fired < cues.length && (all || F.t >= cues[fired][0])) { try { cues[fired][1](); } catch (e) { console.error(e); } fired++; } };
      const F = addFx({ life: dur, layer: 1, draw(f) { try { mod.front(Math.min(dur - .01, f.t)); } catch (e) { console.error('code ult', e); f.t = f.life; } fire(false); }, onEnd() { fire(true); res(); } });
      addFx({ life: dur, layer: 0, draw(f) { try { mod.back && mod.back(Math.min(dur - .01, F.t)); } catch (e) {} } });
    });
    if (battle === b) { b._cineHide = false; b._hideUnit = null; }
    try { dimTo(0, 300); } catch (e) {}
    try { if (typeof playBgm === 'function' && AUD.want) playBgm(AUD.want, true); } catch (e) {}
  }
  window.addEventListener('resize', () => { if (glc && glc.style.display === 'block') placeGL(); });
  drawUnit = (orig => function (u) { if (battle && (battle._hideUnit === u || (battle._hideFn && battle._hideFn(u)))) return; return orig.apply(this, arguments); })(drawUnit);

  // ---------- 结算 ----------
  const lcOf = b => (b.heroes || []).find(u => u.ally === 'luochen');
  const heroesOf = b => b.heroes || [b.P];
  const clearCtl = u => { const bf = u.buffs || (u.buffs = {}); bf.stun = 0; bf.frozen = 0; u.frozenFx = 0; };
  function revive(u, frac) { u.alive = true; u.hp = Math.max(1, Math.round(u.maxhp * frac)); u.pose = null; u.gauge = 0; u.hurt = 0; clearCtl(u); floatText(u.x, u.y - u.h - 40, '复活', '#ffe9a8', 44); }
  function hitAll(P, mult, opts) { for (const e of aliveEnemies()) { const { d, crit } = dmgCalc(P, e, mult, .1); applyDamage(e, d, crit, opts || {}); } }
  function banner(t, col) { try { floatText(W / 2, H * .22, t, col || '#ffe9a8', 72, 1.4, typeof BRUSH !== 'undefined' ? BRUSH : undefined); } catch (e) {} }

  async function castGuangming(P) {
    const hit = () => hitAll(P, 1.5);
    const heal = () => { for (const u of heroesOf(battle)) { if (!u.alive) revive(u, .5); else { const h0 = u.hp; u.hp = Math.max(u.hp, Math.round(u.maxhp * .5)); clearCtl(u); if (u.hp > h0) floatText(u.x, u.y - u.h - 40, '+' + (u.hp - h0), '#7dffa8', 40); } } };
    // Codex 原代码实时运行（gm_codex.js）：画面与 Codex 交付的一模一样，只把位置对上真实的洛尘 / 敌人 / 队友
    if (window.GM_CODEX) { try { await withTimeout(GM_CODEX.preload(), 15000, null); } catch (e) { console.error('gm codex', e); } }
    if (window.GM_CODEX && GM_CODEX.ready) {
      const knock = () => { for (const e of aliveEnemies()) { const o0 = e.ox || 0; let k = 0; const step = () => { k += 1 / 30; e.ox = o0 - 52 * (k < .12 ? k / .12 : Math.max(0, 1 - (k - .12) / .9)); if (k < 1.05) requestAnimationFrame(step); else e.ox = o0; }; step(); } };
      GM_CODEX.setup(P, heroesOf(battle).filter(u => u !== P), aliveEnemies());
      await playCode(GM_CODEX, 'guangming', P, [[9.4, () => { hit(); knock(); try { playSnd('sfx_boom'); } catch (e) {} }], [11.95, heal]], 0);
      await sleep(400); return;
    }
    if (window.GM_RT) { try { await withTimeout(GM_RT.preload(), 8000, null); } catch (e) {} }
    if (window.GM_RT && GM_RT.ready) {
      const knock = () => { for (const e of aliveEnemies()) { const o0 = e.ox || 0; let k = 0; const step = () => { k += 1 / 30; e.ox = o0 - 52 * (k < .12 ? k / .12 : Math.max(0, 1 - (k - .12) / .9)); if (k < 1.05) requestAnimationFrame(step); else e.ox = o0; }; step(); } };
      GM_RT.setup(P, heroesOf(battle).filter(u => u !== P), aliveEnemies());
      await playCode(GM_RT, 'guangming', P, [[9.4, () => { hit(); knock(); S.shake = 18; try { screenFlash('#fff6e6', .55); playSnd('sfx_boom'); } catch (e) {} }], [11.95, heal], [12.6, () => { try { dimTo(0, 1200); } catch (e) {} }]], .72);
    } else { hit(); heal(); }
    await sleep(400);
  }
  async function castHeian(P) {
    // 总策划：黑日砸下 13.8 秒——血最多的敌人 ×3.6 无视防御，其余 ×0.8；16.4 秒紫黑余焰灼烧全体 ×0.25；17.6 秒洛尘以 50% 复活
    const slam = () => { const es = aliveEnemies().sort((a, c) => c.hp - a.hp); es.forEach((e, i) => { const { d, crit } = dmgCalc(P, e, i ? .8 : 3.6, .1); applyDamage(e, d, crit, i ? {} : { pierce: true }); }); };
    const burn = () => { for (const e of aliveEnemies()) { const { d } = dmgCalc(P, e, .25, 0); applyDamage(e, d, false, {}); floatText(e.x, e.y - e.h - 30, '灼烧', '#d9a8ff', 34); } };
    const back = () => { if (!P.alive) revive(P, .5); };
    // Codex 原代码实时运行（ha_codex.js），位置对上真实战场；「最后那一下」叠加我们自己的地火爆发（ha_rt.js finale）
    if (window.HA_CODEX && !window.HA_OLD) { try { await Promise.all([withTimeout(HA_CODEX.preload(), 15000, null), window.HA_RT ? withTimeout(HA_RT.preload(), 8000, null) : null]); } catch (e) { console.error('ha codex', e); } }
    if (window.HA_CODEX && !window.HA_OLD && HA_CODEX.ready && aliveEnemies().length) {
      const es = aliveEnemies();
      HA_CODEX.setup(P, es, heroesOf(battle).filter(u => u !== P));
      if (window.HA_RT && HA_RT.ready) HA_RT.setup(P, es);
      try { await playCode(HA_CODEX, 'heian', P, [[13.8, () => { slam(); S.shake = 26; try { screenFlash('#c79bff', .5); playSnd('sfx_boom'); } catch (e) {} }], [16.4, () => { burn(); S.shake = 8; }], [17.6, back]], 0); }
      finally { HA_CODEX.done(); }
      await sleep(400); return;
    }
    if (window.HA_RT) { try { await withTimeout(HA_RT.preload(), 8000, null); } catch (e) {} }
    if (window.HA_RT && HA_RT.ready && aliveEnemies().length) {
      const knock = big => { for (const e of aliveEnemies()) { const o0 = e.ox || 0, amp = e === big ? 64 : 36; let k = 0; const step = () => { k += 1 / 30; e.ox = o0 - amp * (k < .1 ? k / .1 : Math.max(0, 1 - (k - .1) / .9)); if (k < 1.0) requestAnimationFrame(step); else e.ox = o0; }; step(); } };
      HA_RT.setup(P, aliveEnemies());
      await playCode(HA_RT, 'heian', P, [[13.8, () => { const big = aliveEnemies().sort((a, c) => c.hp - a.hp)[0]; slam(); knock(big); S.shake = 26; try { screenFlash('#c79bff', .5); playSnd('sfx_boom'); } catch (e) {} }], [16.4, () => { burn(); S.shake = 8; }], [17.6, back]], .78);
    } else { slam(); burn(); back(); }
    await sleep(400);
  }
  async function castRiyue(P) {
    if (window.CODEX_RIYUE_PERFORM) return window.CODEX_RIYUE_PERFORM(P);   // Codex 原代码实时版（ry_codex.js）
    // 总策划：11.18 秒紫雷龙息全体 ×1.8、敌方行动条 −60；14.5 秒日出光雨我方回复 15% 并解除控制。
    const hit = () => { hitAll(P, 1.8); for (const e of aliveEnemies()) e.gauge = Math.max(0, (e.gauge || 0) - 60); };
    const heal = () => { for (const u of heroesOf(battle)) if (u.alive) { if (typeof healUnit2 === 'function') healUnit2(u, u.maxhp * .15); clearCtl(u); } };
    const pose0 = P.pose; P.pose = 'ult';
    // 化龙段（7.4–14.3 秒）我方隐去，龙就是洛尘
    const ok = await playLive('riyue', [{ at: 7.4, fn: () => { P.pose = pose0; } }, { at: 11.18, fn: hit }, { at: 14.5, fn: heal }], (u, t) => u.side === 'hero' && t >= 7.4 && t < 14.3);
    P.pose = pose0;
    if (!ok) { await play('riyue'); hit(); heal(); }
  }
  async function castYuzhou(P) {
    S.flash = 1; S.flashColor = '#ffffff'; S.shake = 18;
    banner('宇宙伊始', '#ffffff');
    await sleep(900);
    hitAll(P, 6.0, { pierce: true });
    await sleep(900);
    try { await say('洛尘', '原来也有神力不可及之时……'); } catch (e) {}
  }
  ALLY2_ACT.luochen.riyue = P => castRiyue(P);
  ALLY2_ACT.luochen.guangming = P => castGuangming(P);
  ALLY2_ACT.luochen.heian = P => castHeian(P);



  // ---------- 洛尘 · 时空错乱（Codex v13 → 离线特效层叠在真实战场上） ----------
  // 总策划：50 灵力；6.6 秒时间冻结（敌方行动条 −40）；9.5 秒巨爪拍地全体 ×1.4 无视防御；13.2 秒光雨我方回复 10%；13.4 秒我方行动条 +40。
  async function castShikong(P) {
    if (window.CODEX_SHIKONG_PERFORM) { await window.CODEX_SHIKONG_PERFORM(P); return; }   // Codex 原代码实时版（sk_codex.js）
    const freeze = () => { for (const e of aliveEnemies()) e.gauge = Math.max(0, (e.gauge || 0) - 40); };
    const hit = () => { for (const e of aliveEnemies()) { const { d, crit } = dmgCalc(P, Object.assign({}, e, { def: 0 }), 1.4, .2); applyDamage(e, d, crit, { pierce: true }); } };
    const heal = () => { for (const u of heroesOf(battle)) if (u.alive && typeof healUnit2 === 'function') healUnit2(u, u.maxhp * .10); };
    const boost = () => { for (const u of heroesOf(battle)) if (u.alive && u !== P) u.gauge = Math.min(99, (u.gauge || 0) + 40); };
    const ok = await playLive('shikong', [{ at: 6.6, fn: freeze }, { at: 9.5, fn: hit }, { at: 13.2, fn: heal }, { at: 13.4, fn: boost }], (u, t) => u === P && t >= 1.2);
    if (!ok) { freeze(); hit(); heal(); boost(); }
    await sleep(300);
  }
  ALLY2_ACT.luochen.shikong = P => castShikong(P);
  // ---------- 云霆 / 林雪 · 天剑一式·点星、天剑二式·群星（Codex 版 → 离线特效层） ----------
  // 特效按标准站位渲染：三人队伍里云霆在第 2 位、林雪在第 3 位；点星另按目标是第几只敌人各备一版。站位对不上时用原来的代码特效。
  const STAR_SLOT = { yunting: 1, linxue: 2 };
  const starOk = P => { const b = battle; return b && b.heroes && b.heroes.length === 3 && STAR_SLOT[P.ally] != null && b.heroes.indexOf(P) === STAR_SLOT[P.ally]; };
  for (const c of ['yunting', 'linxue']) CINE['qx_' + c] = CINE['dx_' + c + '_0'] = CINE['dx_' + c + '_1'] = CINE['dx_' + c + '_2'] = { video: null, voice: null };
  if (typeof skDianxing === 'function') skDianxing = (orig => async function (P, t) {
    const ti = t ? battle.enemies.indexOf(t) : -1;
    if (!t || !starOk(P) || ti < 0 || ti > 2) return orig.apply(this, arguments);
    const hit = () => { if (!t.alive) return; const { d, crit } = dmgCalc(P, t, 1.75, .15); applyDamage(t, d, crit, { pierce: true }); };
    const ok = await playLive('dx_' + P.ally + '_' + ti, [{ at: 1.06, fn: hit }], P);
    if (!ok) return orig.apply(this, arguments);
  })(skDianxing);
  if (typeof skQunxing === 'function') skQunxing = (orig => async function (P) {
    if (!starOk(P)) return orig.apply(this, arguments);
    const wave = () => { for (const e of aliveEnemies()) { const { d, crit } = dmgCalc(P, e, .42, .1); applyDamage(e, d, crit, {}); } };
    const ok = await playLive('qx_' + P.ally, [{ at: 1.38, fn: wave }, { at: 1.96, fn: wave }, { at: 2.54, fn: wave }], P);
    if (!ok) return orig.apply(this, arguments);
  })(skQunxing);
  // ---------- 实时代码版（Codex 源码逐帧绘制，按真实施法者 / 目标 / 敌人数量计算）----------
  const RT = { dx: () => window.DX_RT, qx: () => window.QX_RT, sx: () => window.SX_RT, sun: () => window.SUN_RT };
  const rtReady = k => { const m = RT[k](); return !!(m && m._ready); };
  function rtPreload() { if (window.FXW) return;   // 交给 fx_prewarm.js
    for (const k in RT) { const m = RT[k](); if (m && !m._loading) { m._loading = 1; m.preload().then(() => { m._ready = 1; }, e => { console.error('RT preload ' + k, e); m._loading = 0; }); } } }
  window.RT_PRELOAD = rtPreload;
  // （原来开局 4 秒后在后台预处理，冻结会随机落在走路/战斗中；现在统一交给 fx_prewarm.js 在载入画面里做）   // 进游戏后空闲时预处理素材，第一次放招就是实时代码版
  // 按时间轴播放：draw 每帧调用，cues 到点触发
  const rtRun = (life, layers, cues) => new Promise(res => { let fired = 0; const fire = all => { while (fired < cues.length && (all || F0.t >= cues[fired][0])) { try { cues[fired][1](); } catch (e) {} fired++; } };
    const F0 = addFx({ life, layer: 1, draw(f) { try { layers.front && layers.front(Math.min(life - .02, f.t)); } catch (e) { console.error('RT', e); f.t = f.life; } fire(false); }, onEnd() { fire(true); res(); } });
    if (layers.back) addFx({ life, layer: 0, draw(f) { try { layers.back(Math.min(life - .02, F0.t)); } catch (e) {} } }); });
  if (typeof skDianxing === 'function') skDianxing = (orig => async function (P, t) {
    if (t && battle && rtReady('dx')) {
      window.DX_P = P; window.DX_T = t; P.pose = 'cast'; if (battle) battle._cineHide = true;
      try { dimTo(.48, 300); } catch (e) {}
      const hit = () => { if (!t.alive) return; const { d, crit } = dmgCalc(P, t, 1.75, .15); applyDamage(t, d, crit, { pierce: true }); S.shake = 10; try { playSnd('sfx_hit'); } catch (e) {} };
      await rtRun(2.2, { front: z => DX_RT.rtDraw(z) }, [[.1, () => { try { playSnd('sfx_charge', .45); } catch (e) {} }], [.84, () => { try { playSnd('sfx_beam', .7); } catch (e) {} }], [1.06, hit], [1.75, () => { try { dimTo(0, 600); } catch (e) {} }]]);
      P.pose = null; if (battle) battle._cineHide = false; window.DX_P = window.DX_T = null; return;
    }
    return orig.apply(this, arguments);
  })(skDianxing);
  if (typeof skQunxing === 'function') skQunxing = (orig => async function (P) {
    const es = aliveEnemies();
    if (es.length && battle && rtReady('qx')) {
      window.QX_P = P; window.QX_EN = [0, 1, 2].map(i => es[i % es.length]); QX_RT.reset(); P.pose = 'cast'; if (battle) battle._cineHide = true;
      try { dimTo(.7, 350); } catch (e) {}
      const wave = () => { for (const e of aliveEnemies()) { const { d, crit } = dmgCalc(P, e, .42, .1); applyDamage(e, d, crit, {}); } S.shake = 8; try { playSnd('sfx_hit', .8); } catch (e) {} };
      await rtRun(4, { back: z => QX_RT.rtBack(z), front: z => QX_RT.rtFront(z) }, [[.1, () => { try { playSnd('sfx_charge', .5); } catch (e) {} }], [1.38, wave], [1.96, wave], [2.54, wave], [3.1, () => { try { dimTo(0, 800); } catch (e) {} }]]);
      P.pose = null; if (battle) battle._cineHide = false; window.QX_P = window.QX_EN = null; return;
    }
    return orig.apply(this, arguments);
  })(skQunxing);
  // ---------- 云霆 / 林雪 · 天剑三式·杀星（Codex v11 破空重击 → 透明特效层，按目标位置平移） ----------
  // 引灵成阵 → 阵中凝剑 → 后压蓄势 → 三帧破空 → 3.47 秒命中重顿、击退滑步。单体 ×2.7 必暴无视防御。
  // 特效层渲染时命中点在 (290,433)，实战按目标胸口平移。
  CINE.sx = { video: null, voice: null };
  if (typeof skShaxing === 'function') skShaxing = (orig => async function (P, t) {
    if (!t || !battle) return orig.apply(this, arguments);
    const c = typeof chest === 'function' ? chest(t) : { x: t.x, y: t.y - t.h * .5 };
    const knock = () => { const o0 = t.ox || 0; let k = 0; const step = () => { k += 1 / 30; const q = k < .25 ? (k / .25) : Math.max(0, 1 - (k - .25) / .5); t.ox = o0 - 46 * (k < .25 ? 1 - (1 - q) * (1 - q) : q); if (k < .75) requestAnimationFrame(step); else t.ox = o0; }; step(); };
    const hit = () => { if (!t.alive) return; const { d } = dmgCalc(P, t, 2.7, 0); applyDamage(t, d, true, { pierce: true }); S.shake = 24; try { playSnd('sfx_boom'); screenFlash('#fff4e8', .55); hitStop(130); } catch (e) {} knock(); };
    // 实时代码版：Codex v11 源码在战场上逐帧绘制，法阵/凝剑/破空/命中都按真实施法者和目标计算
    if (window.SX_RT && SX_RT._ready) {
      window.SX_P = P; window.SX_T = t;
      const T0 = { t: 0 }, cues = [[.2, () => { try { playSnd('sfx_charge', .6); } catch (e) {} }], [3.3, () => { try { playSnd('sfx_beam'); } catch (e) {} }], [104 / 30, hit], [4.95, () => { P.pose = null; try { dimTo(0, 900); } catch (e) {} }]];
      try { skillBanner('天剑三式 · 杀星', '#ffe3c8', '引灵成阵，一剑破空'); } catch (e) {}
      try { dimTo(.62, 380); } catch (e) {}
      P.pose = 'cast'; if (battle) battle._cineHide = true;
      await new Promise(res => { let fired = 0; addFx({ life: 6, layer: 1, draw(f) { try { SX_RT.rtDraw(Math.min(5.98, f.t)); } catch (e) { console.error('SX_RT', e); f.t = f.life; } while (fired < cues.length && f.t >= cues[fired][0]) { try { cues[fired][1](); } catch (e) {} fired++; } }, onEnd() { while (fired < cues.length) { try { cues[fired][1](); } catch (e) {} fired++; } res(); } }); });
      if (battle) battle._cineHide = false; P.pose = null; try { dimTo(0, 300); } catch (e) {} window.SX_P = window.SX_T = null;
      return;
    }
    try { skillBanner('天剑三式 · 杀星', '#ffe3c8', '引灵成阵，一剑破空'); } catch (e) {}
    try { dimTo(.55, 300); } catch (e) {}
    P.pose = 'cast';
    const ok = await playLive('sx', [{ at: .2, fn: () => { try { playSnd('sfx_charge', .6); } catch (e) {} } }, { at: 3.3, fn: () => { try { playSnd('sfx_beam'); } catch (e) {} } }, { at: 3.47, fn: hit }, { at: 5.0, fn: () => { P.pose = null; try { dimTo(0, 600); } catch (e) {} } }], null, [c.x - 290, c.y - 433]);
    P.pose = null; try { dimTo(0, 300); } catch (e) {}
    if (!ok) return orig.apply(this, arguments);
  })(skShaxing);

  // ---------- 叶孤星 · 破军剑阵·太阳（Codex v21 龙卷归剑：白金日轮 + 灵光剑雨 + 龙卷归剑，实时代码逐帧画在真实战场上） ----------
  // v21 时间轴：剑雨 3.9–6.5 秒；6.6–9.8 秒光剑在敌阵里盘成龙卷归日；10.4 秒落日命中全体。
  // 总策划：剑雨 3.9–6.5 秒共 27 击，轮流落在各个敌人身上（每击 ×0.22）；9.4 秒落日命中全体 ×4.0 无视防御。合计约 ×6.0。
  // 借力一战（第一次放太阳）：大日落下，群妖一个不留
  if (typeof skillSun === 'function') skillSun = (orig => async function (P) {
    const r = await orig.apply(this, arguments);
    if (battle && battle.cfg && battle.cfg.sunKill) for (const e of aliveEnemies()) applyDamage(e, Math.max(1, Math.ceil(e.hp)), true, { pierce: true });
    return r;
  })(skillSun);
  if (typeof skillSun === 'function') skillSun = (orig => async function (P) {
    // 实时代码版：Codex v16 源码在真实战场上逐帧绘制（法阵、剑雨、落日都按当前敌人位置算）
    if (battle && rtReady('sun') && aliveEnemies().length) {
      const es = aliveEnemies(); window.SUN_P = P; window.SUN_EN = [0, 1, 2].map(i => es[i % es.length]);
      P.rage = 0; let k = 0; const cues = [[.1, () => { try { playSnd('sfx_charge', .6); } catch (e) {} }], [2.2, () => { try { playSnd('sfx_ult', .7); } catch (e) {} }]];
      for (let i = 0; i < 27; i++) cues.push([3.9 + i * .1, () => { const a = aliveEnemies(); if (!a.length) return; const e = a[(k++) % a.length]; const { d, crit } = dmgCalc(P, e, .22, .05); applyDamage(e, d, crit, {}); if (i % 3 === 0) { S.shake = 4; try { playSnd('sfx_hit', .5); } catch (e) {} } }]);
      cues.push([10.4, () => { const kill = battle && battle.cfg && battle.cfg.sunKill; for (const e of aliveEnemies()) { const { d, crit } = dmgCalc(P, e, 4.0, .2); applyDamage(e, kill ? Math.max(d, Math.ceil(e.hp)) : d, kill || crit, { pierce: true }); } S.shake = 26; try { playSnd('sfx_boom'); } catch (e) {} }]);
      cues.push([11.4, () => { try { dimTo(0, 900); } catch (e) {} }]);
      P.pose = 'cast'; battle._cineHide = true; try { dimTo(.62, 500); } catch (e) {}
      await rtRun(SUN_RT.duration || 12.4, { back: z => SUN_RT.rtBack(z), front: z => SUN_RT.rtFront(z) }, cues);
      P.pose = null; if (battle) battle._cineHide = false; window.SUN_P = window.SUN_EN = null; await sleep(300); return;
    }
    if (!LIVE.pojun) return orig.apply(this, arguments);
    P.rage = 0; let k = 0;
    const cues = [];
    for (let i = 0; i < 27; i++) cues.push({ at: 3.9 + i * .1, fn: () => { const es = aliveEnemies(); if (!es.length) return; const e = es[(k++) % es.length]; const { d, crit } = dmgCalc(P, e, .22, .05); applyDamage(e, d, crit, {}); } });
    cues.push({ at: 9.4, fn: () => { const kill = battle && battle.cfg && battle.cfg.sunKill; for (const e of aliveEnemies()) { const { d, crit } = dmgCalc(P, e, 4.0, .2); applyDamage(e, kill ? Math.max(d, Math.ceil(e.hp)) : d, kill || crit, { pierce: true }); } } });
    const ok = await playLive('pojun', cues, P);
    if (!ok) return orig.apply(this, arguments);
    await sleep(300);
  })(skillSun);
  startBattle = (orig => function (cfg) { const pr = orig(cfg); try { if (battle && S.hero && (S.hero.skills || []).includes('pojun')) rtPreload(); for (const u of (battle && battle.heroes) || []) if (STAR_SLOT && STAR_SLOT[u.ally] != null) { if (u.ally === 'yunting' || u.ally === 'linxue') rtPreload(); } } catch (e) {} return pr; })(startBattle);
  // ---------- 触发前对话 ----------
  async function talk(kind, b, L) {
    const mate = heroesOf(b).find(u => u !== L && u.alive);
    const lines = {
      heian: [mate ? [mate.name, '洛尘——！'] : null, ['洛尘·怒', '……吵死了。'], ['洛尘·怒', '这具身体，倒也还用得上。']],
      guangming: [['洛尘', '……都倒下了么。'], ['洛尘', '那便，由我来。']],
      yuzhou: [mate ? [mate.name, '洛尘！撑住！'] : null, ['洛尘', '……最后一次了。']],
    }[kind].filter(Boolean);
    const st = b.state; b.state = 'act';
    for (const [w, t] of lines) { try { await say(w, t); } catch (e) {} }
    b.state = st === 'end' ? st : 'act';
  }
  // ---------- 自动触发：每次行动结算后检查 ----------
  let busy = false;
  async function checkTriggers() {
    const b = battle; if (!b || busy || b.state === 'end') return;
    const L = lcOf(b); if (!L) return;
    const f = b.lcSrc || (b.lcSrc = {});
    busy = true;
    try {
      for (let guard = 0; guard < 3; guard++) {
        if (!aliveEnemies().length) break;
        const mates = heroesOf(b).filter(u => u !== L);
        if (!L.alive && !f.heian) { f.heian = 1; await talk('heian', b, L); await castHeian(L); continue; }
        if (!L.alive && f.heian && f.guangming && !f.yuzhou) { f.yuzhou = 1; await talk('yuzhou', b, L); await castYuzhou(L); break; }
        if (L.alive && !f.guangming && mates.length && mates.every(u => !u.alive)) { f.guangming = 1; await talk('guangming', b, L); await castGuangming(L); continue; }
        break;
      }
    } finally { busy = false; }
  }
  afterAct = (orig => async function () { try { await checkTriggers(); } catch (e) { console.error(e); } return orig.apply(this, arguments); })(afterAct);
  startBattle = (orig => function (cfg) { const pr = orig(cfg); try { if (battle && lcOf(battle)) preload(); } catch (e) {} return pr; })(startBattle);

  // ---------- 声音测试：所有配音版本 ----------
  const VOICES = { gm_00: '光明本源 · 层层加重A', gm_01: '光明本源 · 收尾A（游戏内）', gm_02: '光明本源 · 收尾B', gm_03: '光明本源 · 收尾C',
    ha_14: '黑暗本源 · 存在的意义A（游戏内）', ha_15: '黑暗本源 · 存在的意义B', ha_16: '黑暗本源 · 存在的权利A', ha_17: '黑暗本源 · 存在的权利B',
    ry_04: '日月轮转 · 即为天道A', ry_05: '日月轮转 · 即为天道B', ry_06: '日月轮转 · 皆为天道A', ry_07: '日月轮转 · 皆为天道B',
    ry_08: '日月轮转 · 即为天道 女声1', ry_09: '日月轮转 · 即为天道 女声2', ry_10: '日月轮转 · 皆为天道 女声1', ry_11: '日月轮转 · 皆为天道 女声2',
    ry_12: '日月轮转 · 压迫配乐A（游戏内）', ry_13: '日月轮转 · 压迫配乐B' };
  window.VOICE_LAB = window.VOICE_LAB || [];
  for (const k in VOICES) window.VOICE_LAB.push({ group: '洛尘绝技配音', name: VOICES[k], src: BASE + 'voice/' + k + '.mp3' });


  // ---------- 测试：无限怒气 / 灵力（调试面板开关，默认开） ----------
  const INF_KEY = 'gx_inf_test';
  let inf = true; try { const v = localStorage.getItem(INF_KEY); if (v === '0') inf = false; } catch (e) {}
  const infFill = () => { if (!inf) return; const b = battle; if (!b) return;
    for (const u of heroesOf(b)) if (u && u.alive) { u.rage = 100; u.mp = u.maxmp; } };
  window.INF_TEST = { get on() { return inf; }, toggle() { inf = !inf; try { localStorage.setItem(INF_KEY, inf ? '1' : '0'); } catch (e) {} infFill(); toast && toast(inf ? '无限怒气/灵力：开' : '无限怒气/灵力：关'); return inf; } };
  afterAct = (orig => async function () { infFill(); return orig.apply(this, arguments); })(afterAct);
  heroSkills = (orig => function () { infFill(); return orig.apply(this, arguments); })(heroSkills);
  updateBattle = (orig => function (dt) { if (inf && battle && battle.state === 'menu') infFill(); return orig.apply(this, arguments); })(updateBattle);
  // ---------- 测试入口（调试面板按钮调用） ----------
  async function testBattle(party) {
    S.started = true; S.fade = 0; S.hud = true;
    party = party || ['luochen', 'shenle'];
    void ALLY2.test(party);
    for (let i = 0; i < 80 && !(battle && battle.heroes && battle.heroes.some(u => u.ally === party[0])); i++) await sleep(100);
    await sleep(900); return battle;
  }
  window.LC_CINE = {
    play, preload, CINE, LIVE: (typeof LIVE !== 'undefined' ? LIVE : null), playLive: (k, c, h) => playLive(k, c, h),
    // 给 Codex 的实时大招模块用：播放该大招配音，返回音源（可 stop）
    async voice(kind) { const A = ac(); if (!A || (typeof AUD !== 'undefined' && AUD.muted) || !CINE[kind] || !CINE[kind].voice) return null; if (A.state === 'suspended') { try { await withTimeout(A.resume(), 800); } catch (e) {} } const buf = await withTimeout(loadVoice(CINE[kind].voice), 4000, null); if (!buf) return null; const src = A.createBufferSource(); src.buffer = buf; src.connect(A.destination); src.start(); return src; },
    async test(kind) {
      if (kind === 'heian_old') { window.HA_OLD = 1; try { return await this.test('heian'); } finally { window.HA_OLD = 0; } }   // 测试：Claude 自己写的旧版黑暗本源
      const star = kind === 'qunxing' || kind === 'dianxing' || kind === 'shaxing';
      const b = await testBattle(star ? ['yunting', 'linxue'] : null); if (!b) return; const L = lcOf(b); if (!L && !star) return;
      b.state = 'act'; b.menu = null;
      if (kind === 'heian') { L.hp = 0; L.alive = false; }
      if (kind === 'guangming') for (const u of heroesOf(b)) if (u !== L) { u.hp = 0; u.alive = false; }
      if (kind === 'yuzhou') { b.lcSrc = { heian: 1, guangming: 1 }; L.hp = 0; L.alive = false; }
      if (kind === 'riyue') await castRiyue(L);
      if (kind === 'shikong') { b.P = L; b.active = L; await castShikong(L); }
      if (kind === 'shaxing') { const C = heroesOf(b).find(u => u.ally === 'yunting'); if (C) { b.P = C; await skShaxing(C, b.enemies[window.SX_T ?? 1] || b.enemies[0]); } }
      if (kind === 'qunxing' || kind === 'dianxing') { const C = heroesOf(b).find(u => u.ally === 'yunting') || heroesOf(b).find(u => u.ally === 'linxue'); if (C) { b.P = C; if (kind === 'qunxing') await skQunxing(C); else await skDianxing(C, b.enemies[2] || b.enemies[0]); } }
      if (kind === 'pojun') { b.P = b.main || heroesOf(b)[0]; await skillSun(b.P); }
      await afterAct();
    },
  };
})();
// 大招演出期间隐藏战斗 HUD
if (typeof drawBattleHud === 'function') drawBattleHud = (orig => function () { if (battle && battle._cineHide) return; return orig.apply(this, arguments); })(drawBattleHud);
