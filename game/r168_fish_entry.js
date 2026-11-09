// ================= R168 · 垂钓入口看得见（作者 11-08：「钓鱼入口我一直没找到」）=================
// 原来小池只是一个看不见的 80 像素热点，还要点准池子下沿那一小块，没人找得到。
// 现在：① 池面上方挂一个「小池 · 垂钓」的名字牌和一个上下浮动的鱼漂；② 点整片池水都能进垂钓（走到池边再开始）；
// ③ 进青竹小院的头两次，提示一句「院中小池可以垂钓」。
// 作者 11-10：院内小池不钓鱼了——垂钓搬到云海后庭的潭边（r175h）。小池只剩「看看」，名字牌、鱼漂、提示都撤掉。
(function () {
  setTimeout(() => { try { const n = ((TMAPS.qingzhu_court || {}).npcs || []).find(x => x.name === '小池'); if (n) n.talk = async () => { await narrate('池水映着日影，几尾红鲤懒洋洋地游着。'); await narrate('（想钓鱼的话，后庭潭边的竹钓台上能钓。）'); }; } catch (e) {} }, 0);
})();
if (0) (function () {
  if (typeof pickInteract !== 'function' || typeof drawMap !== 'function' || typeof TMAPS === 'undefined' || !TMAPS.qingzhu_court) return;
  const MAP = 'qingzhu_court';
  const P = { x: 1150, y: 1112, rx: 215, ry: 105 };   // 池面（世界坐标）
  const pond = () => (world.actors || []).find(a => a.npc && a.npc.name === '小池');
  const inPond = (wx, wy) => ((wx - P.x) / P.rx) ** 2 + ((wy - P.y) / P.ry) ** 2 <= 1;
  pickInteract = (orig => function (wx, wy) {
    try { if (world.mapName === MAP && inPond(wx, wy)) { const a = pond(); if (a) return { type: 'npc', a }; } } catch (e) {}
    return orig.apply(this, arguments);
  })(pickInteract);
  drawMap = (orig => function () {
    const r = orig.apply(this, arguments);
    try {
      if (world.mapName !== MAP || !world.cam || !pond() || (typeof battle !== 'undefined' && battle) || S.menu) return r;
      const z = typeof VZ === 'function' ? VZ() : 1, now = performance.now() / 1000;
      const sx = (P.x - world.cam.x) * z, sy = (P.y - 85 - world.cam.y) * z;
      if (sx < -100 || sx > W + 100 || sy < -100 || sy > H + 100) return r;
      ctx.save(); ctx.textAlign = 'center';
      const by = sy + 26 + Math.sin(now * 2.4) * 3;   // 鱼漂
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(sx, sy + 40, 16 + Math.sin(now * 2.4) * 3, 4, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#d8372b'; ctx.beginPath(); ctx.ellipse(sx, by, 6, 8, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff6e6'; ctx.beginPath(); ctx.ellipse(sx, by, 6, 8, 0, 0, Math.PI); ctx.fill();
      ctx.strokeStyle = '#3a1a0a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx, by - 8); ctx.lineTo(sx, by - 16); ctx.stroke();
      ctx.font = `600 18px ${FONT}`; textOutline('小池 · 垂钓', sx, sy - 2, '#ffe08a', '#1a0c00', 4);
      ctx.restore();
    } catch (e) {}
    return r;
  })(drawMap);
  let lastMap = '';
  setInterval(() => {
    try {
      const m = world.mapName; if (m === lastMap) return; lastMap = m;
      if (m !== MAP) return; const f = S.flags = S.flags || {}; if ((f.fish_hint || 0) >= 2) return; f.fish_hint = (f.fish_hint || 0) + 1;
      setTimeout(() => { try { if (world.mapName === MAP) toast('院中小池可以垂钓——点池水就行', 2600); } catch (e) {} }, 2500);
    } catch (e) {}
  }, 800);
})();
