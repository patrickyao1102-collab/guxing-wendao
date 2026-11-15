// ================= R317 · 支线做到哪一步，该找的人头上亮蓝色「!」=================
// 作者 11-16：「记住，和支线有关的人物，做到他那一步，记得头上亮一个小感叹号，防止玩家找不到」。
// 原来只有接任务、交任务的人有标记（! 可接 / ? 可交），中间要问话的人没有。现在按 R284 寻路表（每条支线每一步要找谁），
// 这一步要找的人头上亮一个和「可接」同样的蓝色 !；找过了（那一步的名单里去掉了）就不亮。只进测试版。
(function () {
  if (typeof tileAmbientHigh !== 'function' || !window.SQ_DEFS) return;
  const F = () => (S.flags = S.flags || {});
  const want = () => { const out = new Map(), T = window.R284S && R284S.T, sq = F().sq || {}; if (!T) return out;
    for (const q of SQ_DEFS) { const s = sq[q.id]; if (!s || s.s !== 1 || !T[q.id]) continue; let r = null; try { r = T[q.id](s, F()); } catch (e) {} if (!r || !r.to) continue;
      for (const n of r.to) if (n && (!r.map || r.map === world.mapName)) out.set(n, q.id); }
    return out; };
  let cache = null, ct = 0;
  // 接任务的人（灰色 ?「进行中」）同时又是这一步要问的人：灰 ? 换成蓝 !（画原来那层标记时先把他藏一下）
  const grey = n => { const m = window.SQ_MARK && SQ_MARK(n); return !!m && m[0] === '?' && m[1] === '#b8b0a0'; };
  tileAmbientHigh = (orig => function (TT, cam, now) { const hid = [];
    try { if (performance.now() - ct > 500) { cache = want(); ct = performance.now(); }
      if (cache && cache.size) for (const a of world.actors || []) if (a.npc && !a.hidden && cache.has(a.npc.name) && grey(a.npc)) { a.hidden = true; hid.push(a); } } catch (e) {}
    let r; try { r = orig.apply(this, arguments); } finally { for (const a of hid) a.hidden = false; }
    try { if (!cache || !cache.size) return r;
      for (const a of world.actors || []) { const n = a.npc; if (!n || a.hidden || !cache.has(n.name)) continue;
        if (window.SQ_MARK && SQ_MARK(n) && !grey(n)) continue;   // 已经有「可接 / 可交」标记的不重复画
        if (typeof n.mark === 'function' ? n.mark() : n.mark) continue;
        const b = Math.sin(now * 4) * 5, my = a.y - (a.h || 108) - 64 + b; ctx.save();
        const g = ctx.createRadialGradient(a.x, my, 2, a.x, my, 46); g.addColorStop(0, 'rgba(95,184,255,.45)'); g.addColorStop(1, 'rgba(95,184,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(a.x, my, 46, 0, 7); ctx.fill();
        ctx.font = `900 68px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline('!', a.x, my, '#5fb8ff', '#0a2a4a', 9); ctx.restore(); } } catch (e) {}
    return r; })(tileAmbientHigh);
})();
