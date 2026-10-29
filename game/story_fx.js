// ================= 剧情小法术光效（夜里也要一眼看得出在施法）=================
// SLEEP_FX(targets)：星旋的「昏睡术」——紫色灵光从叶孤星身边飞向每个目标，落地成紫色符文法阵 + 光柱 + 飘起的 Zzz，屏幕跟着一亮。
(function () {
  if (typeof tileAmbientHigh !== 'function') return;
  const V = (typeof LFX_COL !== 'undefined' && LFX_COL.violet) || [190, 150, 255];
  const list = [];
  window.SLEEP_FX = function (targets, dur = 2.8) {
    const p = world.player, t0 = performance.now() / 1000;
    for (const [x, y] of targets) list.push({ x, y, sx: p ? p.x : x, sy: p ? p.y - 70 : y - 200, t0, dur });
    if (typeof playSnd === 'function') { try { playSnd('sfx_buff'); } catch (e) {} }
    setTimeout(() => { S.flash = .45; S.flashColor = '#cdb8ff'; try { playSnd('sfx_charge'); } catch (e) {} }, 600);
    return new Promise(r => setTimeout(r, dur * 1000));
  };
  const prev = tileAmbientHigh;
  tileAmbientHigh = function (T, cam, now) {
    prev(T, cam, now);
    if (!list.length) return;
    const tn = performance.now() / 1000;
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i], t = tn - e.t0; if (t > e.dur) { list.splice(i, 1); continue; }
      ctx.save();
      if (t < .6) {   // 飞行的灵光球
        const k = t / .6, ek = 1 - Math.pow(1 - k, 2), mx = (e.sx + e.x) / 2, my = Math.min(e.sy, e.y) - 140;
        const bx = (1 - ek) * (1 - ek) * e.sx + 2 * (1 - ek) * ek * mx + ek * ek * e.x, by = (1 - ek) * (1 - ek) * e.sy + 2 * (1 - ek) * ek * my + ek * ek * (e.y - 60);
        ctx.globalCompositeOperation = 'lighter';
        for (let j = 0; j < 8; j++) { const kk = Math.max(0, ek - j * .04), tx = (1 - kk) * (1 - kk) * e.sx + 2 * (1 - kk) * kk * mx + kk * kk * e.x, ty = (1 - kk) * (1 - kk) * e.sy + 2 * (1 - kk) * kk * my + kk * kk * (e.y - 60);
          const r = 22 - j * 2.2, g = ctx.createRadialGradient(tx, ty, 0, tx, ty, r); g.addColorStop(0, `rgba(255,245,255,${.9 - j * .1})`); g.addColorStop(.4, `rgba(${V[0]},${V[1]},${V[2]},${.7 - j * .08})`); g.addColorStop(1, 'rgba(120,80,255,0)'); ctx.fillStyle = g; ctx.fillRect(tx - r, ty - r, r * 2, r * 2); }
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, 40); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, `rgba(${V[0]},${V[1]},${V[2]},.9)`); g.addColorStop(1, 'rgba(120,80,255,0)'); ctx.fillStyle = g; ctx.fillRect(bx - 40, by - 40, 80, 80);
      } else {        // 落地：法阵 + 光柱 + Zzz
        const u = t - .6, life = e.dur - .6, fade = Math.min(1, u / .25) * Math.min(1, (life - u) / .5), pop = 1 + Math.max(0, .35 - u) * 1.6;
        if (typeof runeCircle === 'function') runeCircle(e.x, e.y, 54 * pop, V, now, { alpha: 1.4 * fade, spin: 1.2 });
        if (typeof lightPillar === 'function') lightPillar(e.x, e.y, 80, 230, V, now, 1.1 * fade);
        if (typeof risingMotes === 'function') risingMotes(e.x, e.y, 50, 170, 16, V, now, fade);
        if (u < .4) { ctx.globalCompositeOperation = 'lighter'; const r = 40 + u * 260, g = ctx.createRadialGradient(e.x, e.y - 50, r * .6, e.x, e.y - 50, r); g.addColorStop(0, 'rgba(200,170,255,0)'); g.addColorStop(.8, `rgba(220,200,255,${.6 * (1 - u / .4)})`); g.addColorStop(1, 'rgba(200,170,255,0)'); ctx.fillStyle = g; ctx.fillRect(e.x - r, e.y - 50 - r, r * 2, r * 2); }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fade; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let z = 0; z < 3; z++) { const zu = (u * .7 + z * .33) % 1, zx = e.x + 26 + zu * 40 + Math.sin(now * 3 + z) * 6, zy = e.y - 150 - zu * 90, fs = 20 + z * 7;
          ctx.globalAlpha = fade * Math.sin(zu * Math.PI); ctx.font = `${fs}px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; textOutline('Z', zx, zy, '#f1e6ff', '#3a1a6e', 4); }
      }
      ctx.restore();
    }
  };
})();
