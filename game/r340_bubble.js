// ================= R340 · 头顶冒泡说话（作者 11-17：「说话并不用立绘说，就是用头顶冒泡那种方式去说，你一句我一句」）（只进测试版）=================
// 给剧情动画用：人物头顶冒一个小纸泡，字一个个出来，停一会儿自己消失，不弹对话框、不挡画面。
//   await BUB.say(actor, '不疼。', { ms: 1800, h: 84 })   actor＝地图上的人（有 x、y），h＝这个人站着有多高（默认 116）
//   BUB.say 返回的 Promise 在泡泡消失时结束；点一下屏幕可以提前跳到下一句。
//   BUB.clear() 全部收掉。
(function () {
  if (typeof tileDraw !== 'function') return;
  const L = [];   // { a, text, t0, ms, h, res, out }
  let tap = false;
  const FONT_ = (typeof FONT !== 'undefined' ? FONT : 'serif');
  const wrap = (g, s, maxW) => { const out = []; let line = ''; for (const ch of s) { const t = line + ch; if (g.measureText(t).width > maxW && line) { out.push(line); line = ch; } else line = t; } if (line) out.push(line); return out; };
  const draw = () => {
    if (!L.length) return;
    const cam = world.cam || { x: 0, y: 0 }, now = performance.now();
    ctx.save(); try { const z = typeof VZ === 'function' ? VZ() : 1; if (z !== 1) ctx.scale(z, z); } catch (e) {} ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    for (const b of L) {
      const age = now - b.t0, life = b.ms, fin = b.out ? Math.max(0, 1 - (now - b.out) / 220) : 1;
      const k = Math.min(1, age / 180) * fin; if (k <= 0) continue;
      const shown = b.text.slice(0, Math.max(1, Math.floor(age / 55)));   // 一个字一个字冒出来
      ctx.font = `600 22px ${FONT_}`;
      const lines = wrap(ctx, b.text, 230), lw = Math.max(...lines.map(s => ctx.measureText(s).width));
      const pw = Math.max(64, lw + 30), ph = lines.length * 28 + 18;
      const x = b.a.x, y = b.a.y - (b.h || 116) - 16 - (1 - k) * 8;
      const bx = Math.round(x - pw / 2), by = Math.round(y - ph);
      ctx.globalAlpha = k;
      ctx.fillStyle = 'rgba(40,24,8,.28)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx + 2, by + 3, pw, ph, 12) : ctx.rect(bx + 2, by + 3, pw, ph); ctx.fill();
      ctx.fillStyle = '#fbf3df'; ctx.strokeStyle = '#8a6a3c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, pw, ph, 12) : ctx.rect(bx, by, pw, ph); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 8, by + ph - 1); ctx.lineTo(x, by + ph + 10); ctx.lineTo(x + 8, by + ph - 1); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 8, by + ph); ctx.lineTo(x, by + ph + 10); ctx.lineTo(x + 8, by + ph); ctx.stroke();
      ctx.fillStyle = '#3b2812'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      let left = shown.length;
      lines.forEach((s, i) => { const part = s.slice(0, Math.max(0, left)); left -= s.length; if (part) ctx.fillText(part, Math.round(x - ctx.measureText(s).width / 2), by + 10 + i * 28); });
    }
    ctx.restore();
    for (let i = L.length - 1; i >= 0; i--) { const b = L[i];
      if (!b.out && (now - b.t0 > b.ms || (tap && now - b.t0 > 300))) { b.out = now; }
      if (b.out && now - b.out > 240) { L.splice(i, 1); try { b.res(); } catch (e) {} } }
    tap = false;
  };
  tileDraw = (o => function () { const r = o.apply(this, arguments); try { draw(); } catch (e) {} return r; })(tileDraw);
  try { addEventListener('pointerdown', () => { if (L.length) tap = true; }, true); } catch (e) {}
  window.BUB = {
    say(a, text, o) { o = o || {}; return new Promise(res => { if (!a) return res();
      for (const b of L) if (b.a === a && !b.out) b.out = performance.now();   // 同一个人说新的一句，旧的先收
      L.push({ a, text: String(text), t0: performance.now(), ms: o.ms || Math.max(1400, 900 + String(text).length * 140), h: o.h, res }); }); },
    clear() { const now = performance.now(); for (const b of L) if (!b.out) b.out = now; },
    get busy() { return L.length > 0; },
  };
})();
