// ================= R134 · 纳月降临 换成 Codex v2「朦胧灵月」10 秒演出（作者 11-06 要求更炫酷，沿用代码版风格）=================
// 绘制全交给 nayue_fx.js（Codex 原样收录）；这里只负责：载图、按真实战斗站位喂坐标、7.42 秒必杀 / 8.15 秒回满、震屏和音效。
// 三个方向：A 天月镇世（默认）/ B 峰主临尘 / C 万流归月。测试面板「纳月降临」用当前方向；控制台 NAYUE_SET('B') 可切。
(function () {
  if (typeof window.NayueFX === 'undefined' || !window.LC_NAYUE) return;
  const K = ['moon', 'halo', 'beam', 'feather', 'particle', 'bloom', 'shockwave', 'avatar'], IM = {}; let loaded = 0;
  K.forEach(k => { const im = new Image(); im.onload = () => { IM[k] = im; loaded++; }; im.src = 'nayue/' + k + '.webp'; });
  const ready = () => loaded >= 7 && IM.moon && IM.halo && IM.bloom;
  // 作者 11-07：技能音频选定第 08 版「梵音钟磬」（够压迫感）。10 秒整段跟时间轴走，放的时候配乐压低
  let SND = null, sndRaw = null; fetch('nayue/nayue_bgm08.mp3').then(r => r.ok ? r.arrayBuffer() : null).then(b => { sndRaw = b; }).catch(() => {});
  function playScene() {
    try { if (AUD.muted || AUD.mode !== 'webaudio' || !AC) return false;
      const go = buf => { const s = AC.createBufferSource(); s.buffer = buf; const g = AC.createGain(); g.gain.value = 1; s.connect(g); g.connect(AUD.sfxGain); s.start();
        if (AUD.musicGain) { const t = AC.currentTime, mg = AUD.musicGain.gain, v0 = mg.value; mg.cancelScheduledValues(t); mg.setValueAtTime(v0, t); mg.linearRampToValueAtTime(v0 * .2, t + .4); mg.setValueAtTime(v0 * .2, t + 9.6); mg.linearRampToValueAtTime(v0, t + 10.6); } };
      if (SND) { go(SND); return true; }
      if (sndRaw) { AC.decodeAudioData(sndRaw.slice(0), buf => { SND = buf; go(buf); }); return true; }
    } catch (e) {} return false; }
  let VAR = 'A'; try { VAR = localStorage.getItem('nayue_var') || 'A'; } catch (e) {}
  window.NAYUE_READY = () => ready();
  window.NAYUE_SET = v => { if (!/^[ABC]$/.test(v)) return VAR; VAR = v; try { localStorage.setItem('nayue_var', v); } catch (e) {} return VAR; };
  let FXM = null, RUN = null;
  // 夜幕期间战斗单位跟着压暗（Codex：先画单位，再按 s.night 降亮度）
  if (typeof drawUnit === 'function') drawUnit = (orig => function (u) {
    if (!RUN || !RUN.s) return orig.apply(this, arguments);
    const s = RUN.s; ctx.save(); ctx.filter = `brightness(${1 - s.night * .47}) saturate(${1 - s.night * .4})`;
    if (u && u.side === 'enemy' && s.dead && RUN.snap.includes(u) && !RUN.spare) ctx.globalAlpha *= Math.max(0, s.enemyAlpha);
    try { return orig.apply(this, arguments); } finally { ctx.restore(); }
  })(drawUnit);
  const old = LC_NAYUE.cast;
  LC_NAYUE.cast = async function (opts = {}) {
    const b = battle; if (!b || !ready()) return old.apply(this, arguments);
    if (RUN) return;   // 同一场不并发
    FXM = FXM || NayueFX.create(IM);
    const st = b.state; b.state = 'act'; b._cineHide = 1;
    const L = b.heroes.find(u => u.ally === 'luochen'), Y = b.main || b.P, es = aliveEnemies();
    window.NAYUE_LINE = '“' + String(opts.line || '……还不到你倒下的时候。').replace(/^“|”$/g, '') + '”';
    const anchors = () => ({
      luochen: L ? { x: L.x, y: L.y, eyeX: L.x - 8, eyeY: L.y - L.h * .86 } : undefined,
      yeguxing: Y ? { x: Y.x, y: Y.y } : undefined,
      enemies: es.map(e => ({ x: e.x, y: e.y - e.h * .5, h: e.h })),
    });
    const run = RUN = { t0: performance.now(), s: null, snap: es, spare: !!opts.spare, hit: false, heal: false };
    const hold = setInterval(() => { if (battle === b && RUN === run) { b.state = 'act'; b.menu = null; } }, 30);   // 演出期间锁住回合，别让别人插队 / 提前结算胜利
    const T = () => (performance.now() - run.t0) / 1000;
    const back = addFx({ life: 11, layer: 0, draw() { try { FXM.back(ctx, Math.min(10, T()), VAR, anchors()); } catch (e) {} } });
    const front = addFx({ life: 11, layer: 2, draw() { try { run.s = FXM.front(ctx, Math.min(10, T()), VAR, anchors(), { lowFlash: false }); } catch (e) {} } });
    const own = playScene(); const sfx = (n, v) => { if (!own) playSnd(n, v); };
    sfx('sfx_charge', 1);
    const at = (sec, fn) => new Promise(res => { const id = setInterval(() => { if (T() >= sec || battle !== b) { clearInterval(id); try { if (battle === b) fn(); } catch (e) {} res(); } }, 16); });
    await at(1.8, () => sfx('sfx_wind', 1));
    await at(3.8, () => sfx('sfx_beam', .8));
    await at(7.3, () => { S.shake = 7; sfx('sfx_boom', 1); });
    await at(7.42, () => { run.hit = true;
      b.quietCrit = 1; for (const e of es) { const d = run.spare ? Math.max(0, e.hp - 1) : e.hp; if (d > 0) applyDamage(e, d, false, { pierce: true }); } b.quietCrit = 0; });   // 只要 Codex 的白闪和「必杀」字，不要暴击的红闪和「爆」
    await at(8.15, () => { run.heal = true; if (Y) { Y.hp = Y.maxhp; Y.alive = true; if (Y.buffs) { Y.buffs.stun = 0; Y.buffs.frozen = 0; } } sfx('sfx_heal', 1); });
    await at(10, () => {});
    clearInterval(hold); back.life = 0; back.t = 99; front.life = 0; front.t = 99; RUN = null; b._cineHide = 0;
    F().nayue_seen = (F().nayue_seen || 0) + 1;
    if (battle === b && opts.after !== false) { await sl(200); await say('洛尘', '……刚才，发生了什么？我好像……睡着了。'); }
    if (battle === b) { b.state = st === 'menu' ? 'run' : st; if (!aliveEnemies().length) await endBattle(true); }
  };
  const F = () => (S.flags = S.flags || {});
  const sl = ms => new Promise(r => setTimeout(r, ms));
})();
