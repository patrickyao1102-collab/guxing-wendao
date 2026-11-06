// ================= R134 · 纳月降临 换成 Codex v2「朦胧灵月」10 秒演出（作者 11-06 要求更炫酷，沿用代码版风格）=================
// 绘制全交给 nayue_fx.js（Codex 原样收录）；这里只负责：载图、按真实战斗站位喂坐标、7.42 秒必杀 / 8.15 秒回满、震屏和音效。
// 三个方向：A 天月镇世（默认）/ B 峰主临尘 / C 万流归月。测试面板「纳月降临」用当前方向；控制台 NAYUE_SET('B') 可切。
(function () {
  if ((typeof window.NayueFX === 'undefined' && typeof window.NayueRedesign === 'undefined') || !window.LC_NAYUE) return;
  // 作者 11-07：换成 Codex「万点归月」大光点吸收 · 整圈月光修正版（nayue_fx3.js，纯代码光球 + 960 颗光点，不用贴图）。
  // 命中 7.46 秒、回满 8.52 秒、6.90–7.35 秒寂静停顿。控制台 NAYUE_SET('A') 可切回 v2 朦胧灵月，NAYUE_SET('N') 切回来。
  const NEW = () => !!window.NayueRedesign && VAR !== 'A' && VAR !== 'B' && VAR !== 'C';
  const K = ['moon', 'halo', 'beam', 'feather', 'particle', 'bloom', 'shockwave', 'avatar'], IM = {}; let loaded = 0;
  K.forEach(k => { const im = new Image(); im.onload = () => { IM[k] = im; loaded++; }; im.src = 'nayue/' + k + '.webp'; });
  const ready = () => NEW() || (window.NayueFX && loaded >= 7 && IM.moon && IM.halo && IM.bloom);
  // 作者 11-07：技能音频选定第 08 版「梵音钟磬」（够压迫感）。10 秒整段跟时间轴走，放的时候配乐压低
  let SND = null, sndRaw = null; fetch('nayue/nayue_bgm08.mp3').then(r => r.ok ? r.arrayBuffer() : null).then(b => { sndRaw = b; }).catch(() => {});
  function playScene() {
    try { if (AUD.muted || AUD.mode !== 'webaudio' || !AC) return false;
      const go = buf => { const s = AC.createBufferSource(); s.buffer = buf; const g = AC.createGain(); g.gain.value = .8; s.connect(g); g.connect(AUD.sfxGain); s.start();
        if (AUD.musicGain) { const t = AC.currentTime, mg = AUD.musicGain.gain, v0 = mg.value; mg.cancelScheduledValues(t); mg.setValueAtTime(v0, t); mg.linearRampToValueAtTime(v0 * .72, t + .4); mg.setValueAtTime(v0 * .72, t + 9.6); mg.linearRampToValueAtTime(v0, t + 10.6); } };
      if (SND) { go(SND); return true; }
      if (sndRaw) { AC.decodeAudioData(sndRaw.slice(0), buf => { SND = buf; go(buf); }); return true; }
    } catch (e) {} return false; }
  let VAR = 'N'; try { VAR = localStorage.getItem('nayue_var2') || 'N'; } catch (e) {}
  window.NAYUE_READY = () => ready();
  window.NAYUE_SET = v => { if (!/^[ABCN]$/.test(v)) return VAR; VAR = v; FXM = null; try { localStorage.setItem('nayue_var2', v); } catch (e) {} return VAR; };
  let FXM = null, RUN = null;
  // 夜幕期间战斗单位跟着压暗（Codex：先画单位，再按 s.night 降亮度）
  if (typeof drawUnit === 'function') drawUnit = (orig => function (u) {
    if (!RUN || !RUN.s) return orig.apply(this, arguments);
    const s = RUN.s, en = u && u.side === 'enemy', ls = RUN.v3 ? (s.loss || 0) : 0; ctx.save();
    ctx.filter = RUN.v3 ? `brightness(${(1 - s.night * .71) * (en ? 1 - ls * .62 : 1)}) saturate(${Math.max(0, 1 - s.night * .55 - (en ? ls * .7 : 0))})` : `brightness(${1 - s.night * .47}) saturate(${1 - s.night * .4})`;
    if (u && u.side === 'enemy' && s.dead && RUN.snap.includes(u) && !RUN.spare) ctx.globalAlpha *= Math.max(0, s.enemyAlpha);
    try { return orig.apply(this, arguments); } finally { ctx.restore(); }
  })(drawUnit);
  // 作者 11-07：「纳月峰主降临」不要通用招式横幅（黑条太丑）——月光银字逐字浮现，两侧细线，底下一行小字，月亮落下前收掉
  const sm = (a, b, t) => { const u = Math.max(0, Math.min(1, (t - a) / (b - a))); return u * u * (3 - 2 * u); };
  function drawTitle(t) {
    const A = sm(.7, 1.15, t) * (1 - sm(2.75, 3.3, t)); if (A <= .001) return;
    const TXT = [...'纳月峰主降临'], y = 168, fs = 76, gap = 22;
    ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.font = `${fs}px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`;
    const ws = TXT.map(c => ctx.measureText(c).width), tw = ws.reduce((a, b) => a + b, 0) + gap * (TXT.length - 1);
    // 很淡的一团夜色托住字，不用黑条
    ctx.save(); ctx.translate(640, y + 14); ctx.scale(1, .3); const R = tw * .8, bg = ctx.createRadialGradient(0, 0, 10, 0, 0, R); bg.addColorStop(0, `rgba(0,4,16,${.45 * A})`); bg.addColorStop(.6, `rgba(0,4,16,${.22 * A})`); bg.addColorStop(1, 'rgba(0,4,16,0)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // 两侧细线：从字边向外淡出，内端一颗菱形光点
    const L = sm(.9, 1.6, t) * A;
    for (const sd of [-1, 1]) { const x0 = 640 + sd * (tw / 2 + 26), x1 = x0 + sd * 210 * sm(.9, 1.6, t);
      const lg = ctx.createLinearGradient(x0, 0, x1, 0); lg.addColorStop(0, `rgba(214,232,255,${.75 * L})`); lg.addColorStop(1, 'rgba(214,232,255,0)');
      ctx.strokeStyle = lg; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, y + 4); ctx.lineTo(x1, y + 4); ctx.stroke();
      ctx.save(); ctx.translate(x0 - sd * 8, y + 4); ctx.rotate(Math.PI / 4); ctx.fillStyle = `rgba(240,248,255,${.9 * L})`; ctx.shadowColor = 'rgba(150,200,255,.9)'; ctx.shadowBlur = 10; ctx.fillRect(-3.5, -3.5, 7, 7); ctx.restore(); }
    // 逐字浮现：每字晚 0.08 秒，自下而上 10px，带月白辉光
    let x = 640 - tw / 2;
    TXT.forEach((c, i) => { const k = sm(.72 + i * .08, 1.12 + i * .08, t), cx = x + ws[i] / 2; x += ws[i] + gap; if (k <= 0) return;
      ctx.globalAlpha = A * k; const yy = y + (1 - k) * 10;
      ctx.shadowColor = 'rgba(130,185,255,.95)'; ctx.shadowBlur = 26; ctx.fillStyle = 'rgba(205,226,255,.55)'; ctx.fillText(c, cx, yy);
      const g = ctx.createLinearGradient(0, yy - fs / 2, 0, yy + fs / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(.6, '#e6f0ff'); g.addColorStop(1, '#b9d2f5');
      ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(180,215,255,.8)'; ctx.fillStyle = g; ctx.fillText(c, cx, yy); });
    // 小字
    const sub = '借洛尘之身 · 亲临'; try { ctx.letterSpacing = '6px'; } catch (e) {} ctx.globalAlpha = A * sm(1.3, 1.8, t); ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(120,170,255,.8)';
    ctx.font = `600 20px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = 'rgba(222,234,255,.9)'; ctx.fillText(sub, 640, y + 62);
    ctx.restore();
  }
  const old = LC_NAYUE.cast;
  LC_NAYUE.cast = async function (opts = {}) {
    const b = battle; if (!b || !ready()) return old.apply(this, arguments);
    if (RUN) return;   // 同一场不并发
    FXM = FXM || (NEW() ? NayueRedesign.create() : NayueFX.create(IM));
    const V3 = NEW(), TI = V3 ? { boom: 7.35, hit: 7.46, heal: 8.52, wind: 1.9, beam: 3.65 } : { boom: 7.3, hit: 7.42, heal: 8.15, wind: 1.8, beam: 3.8 };
    const st = b.state; b.state = 'act'; b._cineHide = 1;
    const L = b.heroes.find(u => u.ally === 'luochen'), Y = b.main || b.P, es = aliveEnemies();
    window.NAYUE_LINE = '“' + String(opts.line || '……还不到你倒下的时候。').replace(/^“|”$/g, '') + '”';
    const anchors = () => ({
      luochen: L ? { x: L.x, y: L.y, eyeX: L.x - 8, eyeY: L.y - L.h * .86 } : undefined,
      yeguxing: Y ? { x: Y.x, y: Y.y } : undefined,
      enemies: es.map(e => ({ x: e.x, y: e.y - e.h * .5, h: e.h })),
    });
    // 作者 11-07：放之前洛尘要先开口（以前有，换万点归月后没了）；放的时候要打出「纳月峰主降临」
    const LINE = String(opts.line || '……还不到你倒下的时候。').replace(/^“|”$/g, '');
    if (V3) { RUN = { pre: 1 }; try { await say('洛尘', LINE); } catch (e) {} RUN = null; if (battle !== b) return; }
    const run = RUN = { t0: performance.now(), s: null, snap: es, spare: !!opts.spare, hit: false, heal: false, v3: V3 };
    const hold = setInterval(() => { if (battle === b && RUN === run) { b.state = 'act'; b.menu = null; } }, 30);   // 演出期间锁住回合，别让别人插队 / 提前结算胜利
    const T = () => (performance.now() - run.t0) / 1000;
    const back = addFx({ life: 40, layer: 0, draw() { try { FXM.back(ctx, Math.min(10, T()), VAR, anchors()); } catch (e) {} } });
    const front = addFx({ life: 40, layer: 2, draw() { try { run.s = FXM.front(ctx, Math.min(10, T()), VAR, anchors(), { lowFlash: false }); } catch (e) {} } });
    const own = playScene(); const sfx = (n, v) => { if (!own) playSnd(n, v); };
    sfx('sfx_charge', 1);
    const ttl = V3 ? addFx({ life: 40, layer: 2, draw() { try { drawTitle(T()); } catch (e) {} } }) : null;
    const at = (sec, fn) => new Promise(res => { const id = setInterval(() => { if (T() >= sec || battle !== b) { clearInterval(id); try { if (battle === b) fn(); } catch (e) {} res(); } }, 16); });
    await at(TI.wind, () => sfx('sfx_wind', 1));
    await at(TI.beam, () => sfx('sfx_beam', .8));
    await at(TI.boom, () => { S.shake = V3 ? 10 : 7; sfx('sfx_boom', 1); });
    await at(TI.hit, () => { run.hit = true;
      b.quietCrit = 1; for (const e of es) { const d = run.spare ? Math.max(0, e.hp - 1) : e.hp; if (d > 0) applyDamage(e, d, false, { pierce: true }); } b.quietCrit = 0; });   // 只要 Codex 的白闪和「必杀」字，不要暴击的红闪和「爆」
    await at(TI.heal, () => { run.heal = true; if (Y) { Y.hp = Y.maxhp; Y.alive = true; if (Y.buffs) { Y.buffs.stun = 0; Y.buffs.frozen = 0; } } sfx('sfx_heal', 1); });
    await at(10, () => {});
    clearInterval(hold); if (ttl) { ttl.life = 0; ttl.t = 99; } back.life = 0; back.t = 99; front.life = 0; front.t = 99; RUN = null; b._cineHide = 0;
    F().nayue_seen = (F().nayue_seen || 0) + 1;
    if (battle === b && opts.after !== false) { await sl(200); await say('洛尘', '……刚才，发生了什么？我好像……睡着了。'); }
    if (battle === b) { b.state = st === 'menu' ? 'run' : st; if (!aliveEnemies().length) await endBattle(true); }
  };
  const F = () => (S.flags = S.flags || {});
  const sl = ms => new Promise(r => setTimeout(r, ms));
})();
