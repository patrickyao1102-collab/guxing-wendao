// R93 九音录·仙音镇魂 —— Codex v15 成长版接入（作者 11-02：神乐的成长技，七重，每一重阵盘多亮一枚仙音）
// 画面全部由 Codex 的浏览器运行时 xyzh_rt.js（window.XYZH_RT）画：笛声仙音 → 阵盘音位点亮 → 阵下光点凝成同一枚巨音 → 爆散；七重时七音重聚成七彩光柱。
// 这里只做游戏这一侧：群体目标、按命中时刻扣血 / 定身、压暗 / 震屏 / 闪白 / 镜头、音效与喊招。
(function () {
  if (typeof ALLY2_ACT === 'undefined' || !ALLY2_ACT.shenle || typeof ALLY2_SKILLS === 'undefined') return;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const RT = () => window.XYZH_RT;
  window.XYZH_BLOBS = window.XYZH_BLOBS || { 'xyzh_assets/atlas_00.webp': 'a2254f0aceef5df231efe35a42e7dcd4', 'xyzh_assets/atlas_01.webp': '4dce74f97916a14458547373d0bc0124', 'xyzh_assets/atlas_02.webp': 'a7d01c1210788749789758bd804bb1fa' };
  // 素材路径：本地读 xyzh_assets/，线上读作品素材库（XYZH_BLOBS 由发布脚本写入：文件名 → blob id）
  const url = n => (LOC || !window.XYZH_BLOBS || !XYZH_BLOBS[n]) ? n : '/_blob/' + XYZH_BLOBS[n];
  if (RT() && RT().setUrl) RT().setUrl(url);

  const LV = () => Math.max(1, Math.min(7, window.SKILL_TIER ? SKILL_TIER('shenle', 'qingxin') : 1));
  // 灵力：一重 22，每多一枚仙音 +4（七重 46）
  const sk = ALLY2_SKILLS.shenle.qingxin;
  if (sk) { Object.defineProperty(sk, 'cost', { get: () => 18 + 4 * LV(), set() {}, configurable: true });
    sk.desc = '仙音逐枚凝成巨音爆散，攻击全体并镇魂'; }

  const NOTE = .3, PILLAR = .9;   // 每枚仙音对每个敌人 30%，七重光柱再 90%（一重 30%、四重 120%、七重 300%）
  const stunP = (n, u) => n >= 7 ? (u.boss ? .5 : 1) : .15 + .05 * n;
  const S2 = (k, v) => { try { playSnd(k, v); } catch (e) {} };
  // 即梦 SeedAudio 专属音效（lib_xz00–07，bgm_music.js 里映射）；还没载好时退回通用库
  const snd = (k, alt, v) => S2(typeof AUD !== 'undefined' && AUD.real && AUD.real[k] ? k : alt, v);
  const track = (K, t) => { if (!K || !K.length) return 0; if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t <= K[i + 1][0]) { const u = (t - K[i][0]) / Math.max(1e-6, K[i + 1][0] - K[i][0]); return K[i][1] + (K[i + 1][1] - K[i][1]) * u; } return K[K.length - 1][1]; };

  const imgOf = u => { if (typeof IMG === 'undefined') return null; const k = u.key + (u.pose === 'atk' ? '_atk' : u.pose === 'cast' ? '_cast' : ''); return IMG[k] || IMG[u.key]; };
  const sprite = u => { if (!u || !u.alive) return null; const im = imgOf(u); if (!im || !im.width) return null; const h = u.h, w = h * im.width / im.height, x = u.x + (u.ox || 0), y = u.y + (u.oy || 0);
    return { img: im, sx: 0, sy: 0, sw: im.width, sh: im.height, dx: x - w / 2, dy: y - h, dw: w, dh: h }; };

  // ---- Codex v15 时间轴（level_timeline.mjs 原样移植）与镜头参数（levels/level_N.json 的 codeFx 规律）----
  const BASE_HITS = [1.80, 2.55, 3.24, 3.89, 4.50, 5.07, 6.10], BASE_STARTS = [1.10, 1.90, 2.63, 3.32, 3.97, 4.58, 5.15], r4 = x => Math.round(x * 1e4) / 1e4;
  function timeline(L) {
    const extra = L === 7 ? 0 : .07 * (7 - L), hits = BASE_HITS.slice(0, L).map((h, i) => r4(h + .6 + i * extra)), starts = hits.map((h, i) => r4(h - (BASE_HITS[i] - BASE_STARTS[i])));
    const attacks = starts.map((st, i) => { const arr = r4(st + .04), hit = hits[i]; return { note: i + 1, launch: r4(arr - .62), slotArrival: arr, condenseStart: r4(st + .08), holdStart: r4(hit - .2), hit, burstEnd: r4(hit + (i === 6 ? .82 : .56)) }; });
    let soul, restore, dur, ending = null;
    if (L === 7) { soul = { out: [8.6, 9.15], hold: [9.15, 9.33], snapBack: [9.33, 9.55] }; restore = [9.15, 10.1]; dur = 10.2;
      ending = { sevenToneReunion: [6.7, 7.5], coreCompression: [7.5, 7.9], columnImpact: 8.07 }; }
    else { const h = hits[hits.length - 1]; soul = { out: [r4(h + .16), r4(h + .71)], hold: [r4(h + .71), r4(h + .89)], snapBack: [r4(h + .89), r4(h + 1.11)] }; restore = [r4(h + 1.18), r4(h + 1.9)]; dur = Math.ceil((h + 2) * 10 - 1e-8) / 10; }
    const zoom = L === 7 ? [[0, 1], [1.5, 1.02], [6.7, 1.02], [7.0, 1.02], [7.9, 1.025], [8.07, 1.045], [8.75, 1.025], [10.1, 1], [10.2, 1]] : [[0, 1], [1.5, 1.02], [restore[0], 1.02], [restore[1], 1], [dur, 1]];
    const shakes = hits.map((t, i) => L === 7 && i === 6 ? { t, a: 12, d: .2 } : { t, a: 4, d: .12 }), flashes = hits.map((t, i) => L === 7 && i === 6 ? { t, a: .9 } : { t, a: .2 }), stops = hits.map((t, i) => ({ t, d: L === 7 && i === 6 ? .07 : .04 }));
    if (ending) { shakes.push({ t: 8.07, a: 14, d: .28 }); flashes.push({ t: 8.07, a: .95 }); stops.push({ t: 8.07, d: .07 }); }
    return { hits, attacks, soul, ending, dur, dim: [[0, 0], [.55, .54], [restore[0], .54], [restore[1], 0], [dur, 0]], zoom, shakes, flashes, stops };
  }

  async function play(P, ts, N) {
    const R = RT(), b = battle, T = timeline(N), lowFx = !!(window.LOWFX || (window.matchMedia && matchMedia('(pointer:coarse)').matches));
    // 笛孔：b_shenle_cast（492×600）上的吹奏孔 sourcePixel [232,87]，按实际绘制尺寸换算到屏幕（Codex 标定）
    const ci = (typeof IMG !== 'undefined' && (IMG[P.key + '_cast'] || IMG.b_shenle_cast)) || { width: 492, height: 600 }, cw = P.h * ci.width / ci.height, px0 = P.x + (P.ox || 0) - cw / 2, py0 = P.y + (P.oy || 0) - P.h;
    const flute = [px0 + 232 * cw / 492, py0 + 87 * P.h / 600];
    const tg = ts.map((u, i) => { const im = imgOf(u); return { x: u.x, y: u.y, h: u.h, w: im && im.width ? u.h * im.width / im.height : u.h * .8, _i: i }; });
    const plan = R.begin({ level: N, caster: { x: P.x, y: P.y, h: P.h }, flute, targets: tg, unitSprite: o => sprite(ts[o && o._i]), lowFx }) || {};
    const dur = plan.duration || T.dur;
    // 伤害时刻以运行时返回的为准；没有就用时间轴
    const hits = (plan.hits && plan.hits.length ? plan.hits : T.hits.map((t, i) => ({ t, kind: 'note', index: i })).concat(T.ending ? [{ t: T.ending.columnImpact, kind: 'pillar', index: 7 }] : [])).slice().sort((a, c) => a.t - c.t);
    const t0 = performance.now(); let done = false, fired = 0, fl = 0, sh = 0;
    // 命中顿帧已在运行时的采样时间里（Codex）；这里按真实时间走
    const clock = () => (performance.now() - t0) / 1000;
    const realDur = dur;
    const piv = [640, 370];
    window.__R83ZOOM = () => { if (done || battle !== b) { window.__R83ZOOM = null; return null; } const t = clock();
      let k = 0; for (const q of T.shakes) { const a = t - q.t; if (a >= 0 && a < q.d) k = Math.max(k, q.a * (1 - a / q.d)); }
      if (R.shake) k = Math.max(k, R.shake(t) || 0);
      return { s: track(T.zoom, t), px: piv[0], py: piv[1], dx: k ? (Math.random() * 2 - 1) * k : 0, dy: k ? (Math.random() * 2 - 1) * k : 0 }; };
    return new Promise(res => {
      b._cineHide = true;   // 阵盘和巨音在画面上方，演出时收起顶栏 / 状态面板 / 行动条（和点星、群星一样）
      const fin = () => { if (done) return; done = true; window.__R83ZOOM = null; if (battle === b) { b.dim = 0; b._cineHide = false; } try { R.end(); } catch (e) {} res(); };
      // 闪白按 Codex 的 flash(t) 逐帧画（0.05～0.09 秒一闪），不用游戏的 screenFlash（那个衰减慢，七音、光柱时整屏白太久）
      addFx({ life: realDur + 30, layer: 2, update(f) { if (done) f.t = f.life; else f.t = 0; }, draw() { if (done) return; const f = R.flash ? R.flash(clock()) : null; if (!f || !(f.a > .01)) return;
        ctx.save(); ctx.globalAlpha = Math.min(1, f.a); ctx.fillStyle = f.color || '#fff'; ctx.fillRect(-50, -50, W + 100, H + 100); ctx.restore(); } });
      const back = addFx({ life: realDur + 30, layer: 0, update(f) { if (done) f.t = f.life; else f.t = 0; }, draw() { if (!done) { ctx.save(); try { R.drawBack(ctx, clock()); } catch (e) { console.warn(e); } ctx.restore(); } } });
      // 寿命只是保险（游戏的 FX 计时在掉帧时会偏），真正的结束按本技能自己的时钟判断
      addFx({ life: realDur + 30, layer: 1,
        update(f) { if (done) { f.t = f.life; return; } f.t = 0; const t = clock(); if (battle !== b) return fin();
          b.dim = R.sceneDim ? R.sceneDim(t) : track(T.dim, t);
          while (fired < hits.length && t >= hits[fired].t) { onHit(hits[fired]); fired++; }
          cue(t);
          if ((performance.now() - t0) / 1000 >= realDur) fin(); },
        draw() { if (!done) { ctx.save(); try { R.drawFront(ctx, clock()); } catch (e) { console.warn(e); } ctx.restore(); } },
        onEnd() { while (fired < hits.length) onHit(hits[fired++]); back.t = 1e9; fin(); } });
      // ---- 伤害：每枚仙音爆散打全体，七重光柱再打全体；镇魂在魂影拽回时结算 ----
      function onHit(h) {
        const pillar = h.kind === 'pillar';
        snd(pillar ? 'sfx_xz_pillar' : 'sfx_xz_burst', pillar ? 'sfx_ult' : 'sfx_boom', pillar ? 1 : .85);
        for (const u of ts) if (u.alive) { const r = dmgCalc(P, u, pillar ? PILLAR : NOTE, .08); applyDamage(u, r.d, r.crit, { pierce: true }); }
      }
      // ---- 音效：按 Codex 时间轴打点 ----
      const cues = [[.05, () => snd('sfx_xz_flute', 'sfx_wind', .8)], [.6, () => snd('sfx_xz_array', 'sfx_charge', .8)]];
      for (const a of T.attacks) { cues.push([a.slotArrival, () => snd('sfx_xz_slot', 'sfx_star', .9)]); cues.push([a.condenseStart, () => snd('sfx_xz_condense', 'sfx_charge', .6)]); }
      if (T.ending) { cues.push([T.ending.sevenToneReunion[0] + .05, () => snd('sfx_xz_reunion', 'sfx_star', .8)]); cues.push([T.ending.coreCompression[0], () => snd('sfx_xz_core', 'sfx_charge', .7)]); }
      cues.push([T.soul.out[0], () => snd('sfx_xz_soul', 'sfx_dp_soul', .9)]);
      cues.push([T.soul.snapBack[0], () => { snd('sfx_xz_condense', 'sfx_dp_return', .5);
        for (const u of ts) if (u.alive && Math.random() < stunP(N, u)) { (u.buffs || (u.buffs = {})).stun = Math.max(1, u.buffs.stun || 0); try { floatText(u.x, u.y - u.h - 50, '镇魂', '#e8f4ff', 36); } catch (e) {} } }]);
      cues.sort((a, c) => a[0] - c[0]); let ci = 0;
      function cue(t) { while (ci < cues.length && t >= cues[ci][0]) { try { cues[ci][1](); } catch (e) {} ci++; } }
    });
  }

  const old = ALLY2_ACT.shenle.qingxin;
  ALLY2_ACT.shenle.qingxin = async function (P) {
    const ts = aliveEnemies().slice(0, 5); if (!ts.length) return;
    const R = RT(), N = LV();
    if (!R || !R.ready) {   // 运行时没载好：退回旧的音波，但按群体打
      for (const t of ts) { await old.call(this, P, t); if (!aliveEnemies().length) break; } return; }
    P.pose = 'cast'; try { await portraitPop(P); } catch (e) {}
    try { skillBanner('九音录 · 仙音镇魂', '#e8f4ff', N >= 7 ? '七音齐鸣 · 七彩镇魂' : '仙音' + '一二三四五六'[N - 1] + '响 · 镇魂'); } catch (e) {}
    P.pose = 'cast';
    await play(P, ts, N);
    P.pose = null;
  };
  window.R93_XYZH = { level: LV, play, timeline };
})();
