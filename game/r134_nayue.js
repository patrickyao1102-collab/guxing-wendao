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
  // 作者 11-07 晚：毛笔字太潦草 → 换端正的宋体粗体（Noto Serif SC 900），外面一个细银线双框 + 四角回纹，月光银渐变字
  function drawTitle(t) {
    const A = sm(.7, 1.15, t) * (1 - sm(2.75, 3.3, t)); if (A <= .001) return;
    const TXT = [...'纳月峰主降临'], y = 168, fs = 66, gap = 26;
    ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.font = `900 ${fs}px "Noto Serif SC","Songti SC","STSong","SimSun",serif`;
    const ws = TXT.map(c => ctx.measureText(c).width), tw = ws.reduce((a, b) => a + b, 0) + gap * (TXT.length - 1);
    const open = sm(.7, 1.25, t), bw = (tw + 120) * (.7 + .3 * open), bh = 128, bx = 640 - bw / 2, by = y - 56;
    // 底：半透明夜蓝，上下渐隐
    ctx.globalAlpha = A; ctx.save(); ctx.translate(640, y); ctx.scale(1, bh / bw * 1.3); const fr = bw * .62, fill = ctx.createRadialGradient(0, 0, fr * .2, 0, 0, fr);
    fill.addColorStop(0, 'rgba(6,12,30,.66)'); fill.addColorStop(.7, 'rgba(6,12,30,.45)'); fill.addColorStop(1, 'rgba(6,12,30,0)'); ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(0, 0, fr, 0, 7); ctx.fill(); ctx.restore();
    // 双线框（上下两条长线 + 两端短竖线）与四角回纹
    const line = (x1, y1, x2, y2, a, w) => { ctx.strokeStyle = `rgba(214,230,255,${a})`; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    ctx.shadowColor = 'rgba(140,190,255,.8)'; ctx.shadowBlur = 8;
    line(bx, by + 8, bx + bw, by + 8, .85, 1.2); line(bx + 10, by + 14, bx + bw - 10, by + 14, .45, 1);
    line(bx, by + bh - 8, bx + bw, by + bh - 8, .85, 1.2); line(bx + 10, by + bh - 14, bx + bw - 10, by + bh - 14, .45, 1);
    const corner = (cx, cy, sx, sy) => { ctx.strokeStyle = 'rgba(232,242,255,.95)'; ctx.lineWidth = 1.6; ctx.beginPath();
      ctx.moveTo(cx, cy + sy * 26); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * 26, cy); ctx.moveTo(cx + sx * 6, cy + sy * 16); ctx.lineTo(cx + sx * 6, cy + sy * 6); ctx.lineTo(cx + sx * 16, cy + sy * 6); ctx.stroke();
      ctx.fillStyle = 'rgba(240,248,255,.95)'; ctx.save(); ctx.translate(cx + sx * 12, cy + sy * 12); ctx.rotate(Math.PI / 4); ctx.fillRect(-2.5, -2.5, 5, 5); ctx.restore(); };
    corner(bx - 6, by + 2, 1, 1); corner(bx + bw + 6, by + 2, -1, 1); corner(bx - 6, by + bh - 2, 1, -1); corner(bx + bw + 6, by + bh - 2, -1, -1);
    // 逐字浮现：月光银渐变 + 冷蓝辉光
    let x = 640 - tw / 2;
    TXT.forEach((c, i) => { const k = sm(.78 + i * .07, 1.18 + i * .07, t), cx = x + ws[i] / 2; x += ws[i] + gap; if (k <= 0) return;
      ctx.globalAlpha = A * k; const yy = y + (1 - k) * 8;
      ctx.shadowColor = 'rgba(120,175,255,.9)'; ctx.shadowBlur = 22; ctx.fillStyle = 'rgba(190,215,255,.5)'; ctx.fillText(c, cx, yy);
      const g = ctx.createLinearGradient(0, yy - fs / 2, 0, yy + fs / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#eef4ff'); g.addColorStop(1, '#a9c4ec');
      ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(20,40,90,.9)'; ctx.fillStyle = g; ctx.fillText(c, cx, yy); });
    // 小字
    ctx.globalAlpha = A * sm(1.35, 1.85, t); ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(120,170,255,.8)'; try { ctx.letterSpacing = '8px'; } catch (e) {}
    ctx.font = `600 18px "Noto Serif SC","Songti SC",serif`; ctx.fillStyle = 'rgba(222,234,255,.92)'; ctx.fillText('借洛尘之身 · 亲临', 640, y + 48);
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
