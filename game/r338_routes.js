// ================= R338 · 玄天城南城门分岔：幽影林 / 落云岭（作者 11-17：「玄天城除了通往幽影林外，还通往落云岭的……你完善这个地图系统」）（只进测试版）=================
// 原来：从落云岭·松溪外岭走到玄天城南门能进城，可城里南城门只通幽影林（还要先去据点禀报才放行）——回不去落云岭，是条单行道。
// 现在：走到南城门，先问往哪边走——
//   「落云岭 · 松溪外岭」：随时能走（来时的老山路，翻过去就是青阳镇外）；
//   「幽影林 · 追虎迷径」：还是原来的条件（先去天剑宗据点禀报魔族的事）；不够就照原话拦下；
//   「先不出城」：往回退一步。
// 点任务栏自动寻路路过这里，直接去任务要去的那边，不问。青阳 ⇄ 玄天城的近路是西门的「青玄近道」（R335）。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_city || !TMAPS.ly_ridge || typeof goMap !== 'function') return;
  const CITY = TMAPS.xt_city, P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const gate = (CITY.exits || []).find(e => e.to === 'yy_forest' || e.to === 'm_yy_tiger');
  if (!gate) return;
  const yyCond = gate.cond, yyMsg = gate.msg || '先去天剑宗据点禀报魔族的事，再出城。';
  gate.cond = () => true; gate.msg = ''; gate.label = '南城门 · 落云岭 / 幽影林'; gate._r338 = 1;
  const LY_AT = P(1272, 1890);   // 松溪外岭最南边、往玄天城那个口子往里一点
  let stepping = false, busy = false;
  if (typeof tileUpdate === 'function') tileUpdate = (o => function () { stepping = true; try { return o.apply(this, arguments); } finally { stepping = false; } })(tileUpdate);
  const noAsk = (fn) => { const had = !!window.QUEST_NAV, q = window.QUEST_NAV || (window.QUEST_NAV = {}), prev = q.on; q.on = true;
    try { return fn(); } finally { q.on = prev; if (!had) { try { delete window.QUEST_NAV; } catch (e) {} } } };   // 下一层（R134）就不会再问一遍「是否进入」
  const back = () => { const p = world.player; if (!p) return; p.moving = false; world.path = null; world.walkTarget = null; p.y -= 48; p.face = 'up'; };
  goMap = (orig => async function (name, c, r, face) {
    if (!(name === gate.to && world.mapName === 'xt_city' && stepping) || busy) return orig.apply(this, arguments);
    if (window.QUEST_NAV && QUEST_NAV.on) return orig.apply(this, arguments);
    busy = true; world.locked = true; world.path = null; world.walkTarget = null; if (world.player) world.player.moving = false;
    let k = 2;
    try {
      const yyOk = (() => { try { return !yyCond || !!yyCond(); } catch (e) { return true; } })();
      k = await choose('出南城门，往哪边走？', ['落云岭 · 松溪外岭（翻过去就是青阳镇外）', '幽影林 · 追虎迷径' + (yyOk ? '' : '（还不能去）'), '先不出城']);
      if (k === 1 && !yyOk) { world.locked = false; await say('', yyMsg); back(); return; }
    } finally { busy = false; world.locked = false; }
    if (k === 0) return noAsk(() => orig.call(this, 'ly_ridge', LY_AT[0], LY_AT[1], 'up'));
    if (k === 1) return noAsk(() => orig.apply(this, arguments));
    back();
  })(goMap);
  // 地图格子（T.doors）可能在本文件之前就建好了，门的条件是拷过去的——每次进玄天城都再改一遍
  const fixT = () => { try { const T = world.map && world.map.T; if (!T || world.mapName !== 'xt_city') return;
    for (const d of T.doors || []) if (d.edge && d.to === gate.to) { d.cond = () => true; d.msg = ''; d.label = gate.label; } } catch (e) {} };
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { const r = o.apply(this, arguments); if (m === 'xt_city') fixT(); return r; })(tileSetMap);
  // 落云岭那头的出口名字跟着改清楚
  for (const e of TMAPS.ly_ridge.exits || []) if (e.to === 'xt_city') e.label = '玄天城 · 南城门';
})();
