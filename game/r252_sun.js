// ================= R252 · 阳光照进屋里（作者 11-13：客房白天没有阳光；让阳光照进来，你想想办法）=================
// 做法：不画进底图，而是每一帧在「家具和人物之上」叠一层暖光——所以光会落在地上、桌上、床上，人走进光里身上也会亮。
//   ① 窗格光斑：按窗户的格子数算出一块斜着投在地上的光（每一格是一小块软边的亮斑），离窗越远越淡、越散；
//   ② 光柱：从窗口到光斑之间一道很淡的斜光；③ 光里慢慢飘的浮尘。
// 白天才有，随时辰变：清晨偏金、斜得长；正午偏白、短；傍晚偏橙；夜里没有（换成灯光，等素材）。
// 每间房只要登记「窗在哪、几格」就行；以后 Codex 的房间 layout 里带 windows 字段就自动生效。只进测试版。
(function () {
  if (typeof tileAmbientHigh !== 'function') return;
  // [窗左 x, 窗宽, 窗台 y（墙上）, 墙根 y（光从这里落地）, 格子列数, 行数]
  const WIN = { xt_inn_room1: [[948, 250, 60, 300, 3, 3]], xt_inn_room3: [[948, 250, 60, 300, 3, 3]], xt_sect_rest: [[186, 262, 62, 300, 3, 3]] };
  window.R252_WIN = WIN;
  const tod = () => { try { const f = S.flags || {}; if (window.R252_FORCE) return R252_FORCE; if (f.res_tod === 'night' || f.auc_night) return 'night'; return f.res_tod || 'day'; } catch (e) { return 'day'; } };
  const LOOK = { dawn: { c: [255, 214, 150], len: 430, skew: -330, a: .34 }, morning: { c: [255, 226, 170], len: 380, skew: -250, a: .32 }, day: { c: [255, 240, 205], len: 330, skew: -190, a: .30 }, noon: { c: [255, 246, 225], len: 250, skew: -90, a: .26 }, dusk: { c: [255, 190, 120], len: 440, skew: 300, a: .36 }, evening: { c: [255, 190, 120], len: 440, skew: 300, a: .36 } };
  const CACHE = {};
  function patch(key, w, cols, rows, L) {   // 一块窗格光斑：先画成正的，绘制时再斜着贴到地上
    const id = key + '|' + L.len + '|' + L.c; if (CACHE[id]) return CACHE[id];
    const cv = document.createElement('canvas'), pad = 40; cv.width = w + pad * 2; cv.height = L.len + pad * 2; const q = cv.getContext('2d');
    q.filter = 'blur(4px)'; const cw = w / cols, ch = L.len / rows, gap = 15;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const fade = 1 - r / rows * .55; q.fillStyle = `rgba(${L.c[0]},${L.c[1]},${L.c[2]},${fade})`;
      q.fillRect(pad + c * cw + gap, pad + r * ch + gap * .7, cw - gap * 2, ch - gap * 1.4);
      q.fillStyle = `rgba(${L.c[0]},${L.c[1]},${L.c[2]},${fade * .35})`; q.fillRect(pad + c * cw + cw * .46, pad + r * ch + gap, 3, ch - gap * 2); }   // 格心里一点细棂的影
    q.filter = 'none'; q.globalCompositeOperation = 'destination-in'; const g = q.createLinearGradient(0, pad, 0, pad + L.len); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.7, 'rgba(0,0,0,.8)'); g.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = g; q.fillRect(0, 0, cv.width, cv.height);
    return (CACHE[id] = { cv, pad });
  }
  tileAmbientHigh = (orig => function (T, cam, now) {
    orig(T, cam, now);
    try { const m = world.mapName, def = TMAPS[m], ws = WIN[m] || (def && def.baked && def.baked.windows); if (!ws || window.R252_OFF) return;
      const t = tod(); if (t === 'night' || t === 'midnight') return; const L = LOOK[t] || LOOK.day, br = 1 + .05 * Math.sin(now * .7);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const [wx, ww, sill, base, cols, rows] of ws) {
        const P = patch(m + wx, ww, cols, rows, L), k = L.skew / L.len;
        // ① 光柱：窗口 → 落地处，一道很淡的斜梯形
        const g = ctx.createLinearGradient(0, sill, 0, base + L.len * .6); g.addColorStop(0, `rgba(${L.c[0]},${L.c[1]},${L.c[2]},${.07 * br})`); g.addColorStop(1, `rgba(${L.c[0]},${L.c[1]},${L.c[2]},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(wx, sill); ctx.lineTo(wx + ww, sill + 130); ctx.lineTo(wx + ww + L.skew * .6, base + L.len * .6); ctx.lineTo(wx + L.skew * .6 - 30, base + L.len * .6); ctx.closePath(); ctx.fill();
        // ② 地上的窗格光斑（斜着贴）
        ctx.save(); ctx.globalAlpha = L.a * br; ctx.transform(1, 0, k, 1, wx - P.pad - k * (-P.pad), base - P.pad); ctx.drawImage(P.cv, 0, 0); ctx.restore();
        // ③ 浮尘
        for (let i = 0; i < 16; i++) { const s = i * 37.7, u = (Math.sin(s) * .5 + .5), v = ((now * .018 + (Math.sin(s * 1.7) * .5 + .5)) % 1), y = sill + 60 + v * (base - sill + L.len * .55), x = wx + u * ww + k * Math.max(0, y - base) + Math.sin(now * .4 + s) * 9, al = .5 * Math.sin(v * Math.PI) * (.6 + .4 * Math.sin(now * 1.3 + s));
          ctx.fillStyle = `rgba(255,248,225,${Math.max(0, al)})`; ctx.beginPath(); ctx.arc(x, y, 1.1 + (i % 3) * .5, 0, 7); ctx.fill(); }
      }
      ctx.restore();
    } catch (e) {}
  })(tileAmbientHigh);
})();
