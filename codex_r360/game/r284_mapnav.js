// ================= R284 · 大地图（M 键）点哪儿，人就自己走过去 =================
// 作者 11-15：「我希望在我们的 M 键，就是那个大地图上面，我们设置一个点击就可以自动走到那个位置的功能」。
//   · 大地图开着时，点圆盘里面 → 关掉大地图，人沿着能走的路自己走过去（点到房子、树、水上，就走到离那儿最近、走得到的地方）；
//   · 点圆盘外面 → 跟以前一样，关掉大地图；
//   · 迷宫类地图开着迷雾时，还没去过的黑处点了不走（提示一句）；
//   · 剧情锁住、对话中、战斗中都不动。走的途中自己推摇杆 / 点地面就照常改道。
(function () {
  if (typeof updateMap !== 'function' || !window.MM_API) return;
  const A = window.MM_API, MM = A.MM;
  const geo = () => { const T = world.map.T, th = A.thumb(world.mapName, T), R = 250, cx = W / 2, cy = H / 2 + 10, k = R / (Math.max(th.mw, th.mh) * .56);
    return { T, R, cx, cy, k, ox: (th.x0 || 0) + th.mw / 2, oy: th.mh / 2 }; };
  let mark = null, talk = null;   // 点下去的位置，地面上闪一下金圈
  updateMap = (orig => function (dt) {
    const t = input.tapped;
    if (t && MM.big && world.map && world.map.tile && world.player && !S.menu && !dialog && !choice && !world.locked) {
      const g = geo(), d = Math.hypot(t.x - g.cx, t.y - g.cy);
      if (d < g.R) {
        input.tapped = null; MM.big = false;
        let wx = g.ox + (t.x - g.cx) / g.k, wy = g.oy + (t.y - g.cy) / g.k; talk = null;
        // 点在某个人的小点 / 名字上 → 走到他跟前，到了直接开口
        const toM = (x, y) => [g.cx + (x - g.ox) * g.k, g.cy + (y - g.oy) * g.k];
        const who = (world.actors || []).filter(a => a.npc && !a.hidden && !a.mob && !a.follower && a !== world.player).map(a => { const [u, v] = toM(a.x, a.y); return [a, Math.min(Math.hypot(u - t.x, v - t.y), Math.hypot(u - t.x, v - 22 - t.y))]; }).filter(z => z[1] < 13).sort((a, b) => a[1] - b[1])[0];
        if (who) { talk = who[0]; wx = talk.x; wy = talk.y + 40; }
        if (!A.seen(world.mapName, wx, wy)) { playSnd('ui_click'); toast('那儿还没去过，看不清路', 1600); return; }
        try { if (window.QUEST_NAV) QUEST_NAV.on = false; } catch (e) {}
        const ok = window.QUEST_NAV && QUEST_NAV.walkTo ? QUEST_NAV.walkTo(wx, wy, talk ? 2 : 1) : false; if (!ok) talk = null;
        if (QUEST_NAV) QUEST_NAV.arrive = null;
        if (ok) { playSnd('ui_click'); mark = { x: wx, y: wy, t: performance.now(), m: world.mapName }; toast(talk ? '自动寻路：去找' + String(talk.npc.name || '').split('·').pop().trim() : '自动寻路中……', 1000); }
        return;
      }
    }
    { const K = input.keys || {}; if (talk && (input.tapped || input.joy || MM.big || K.ArrowLeft || K.ArrowRight || K.ArrowUp || K.ArrowDown || K.w || K.a || K.s || K.d)) talk = null; }   // 半路自己点了别处：不再去找那个人
    const r = orig(dt);
    if (talk && world.player && !world.path && !world.locked && !dialog && !choice) { const a = talk; talk = null;
      if ((world.actors || []).includes(a) && Math.hypot(a.x - world.player.x, a.y - world.player.y) < 130) try { doInteract({ type: 'npc', a }); } catch (e) {} }
    return r;
  })(updateMap);
  window.MM_BIG_HINT = () => (GX_TOUCH ? '点地图上任意位置自动走过去，点圆外关闭' : '点地图上任意位置自动走过去，点圆外或按 M 键关闭') + '　·　红点是你，红叹号主线，蓝叹号 / 问号支线，菱形是出口，金圈是任务方向';
  // 目的地金圈（画在地面上，1.6 秒淡掉；人走到前就一直在）
  if (typeof drawMapHud === 'function') drawMapHud = (o => function () { o.apply(this, arguments);
    if (!mark || !world.map || world.mapName !== mark.m) { mark = null; return; } const age = (performance.now() - mark.t) / 1000; if (!world.path && age > .6 || age > 30) { mark = null; return; }
    try { const z = VZ(), C = world.cam || { x: 0, y: 0 }, sx = (mark.x - C.x) * z, sy = (mark.y - C.y) * z, a = Math.max(.35, 1 - age / 1.6), r = 16 + Math.sin(age * 6) * 3;
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(255,200,80,.9)'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.ellipse(sx, sy, r * z, r * .5 * z, 0, 0, 7); ctx.stroke(); ctx.restore(); } catch (e) {} })(drawMapHud);
})();
