// ================= 作者 11-06：借力战之后强制去溪边岩隙拿寒星剑，拿到剑之前后山不刷兽火、不触发战斗 =================
// 原来的引导：星旋说“先去取剑”，但后山已经刷出兽火，拿剑路上要被拖进两轮战斗；南边石阶法阵也能直接走掉。
// 现在：没拿剑之前 ——
//   · 后山的兽火全部收起、不再刷新（拿到剑后恢复，正常历练）；
//   · 玩家能自由操作时自动寻路带去溪边岩隙宝箱（玩家自己走开，停下 2 秒后又会接着带路）；
//   · 南边下山法阵挡住：星旋提醒先去取剑。
(function () {
  if (typeof tileMobs !== 'function' || typeof addTrigger !== 'function') return;
  const F = () => (S.flags || {});
  const need = () => typeof world !== 'undefined' && world.mapName === 'tj_houshan' && F().hs_explored && !F().hs_chest && !F().ch1_free && !F().ch2_roam && !F().ch1_after && !F().ch2_seal_open;
  window.HANXING_GUIDE = { need };

  // 1) 没拿剑：收起兽火、不刷新
  tileMobs = (o => function (dt, T, free) {
    if (need()) {
      if (world.mobs && world.mobs.length) { const ms = world.mobs; world.mobs = []; world.actors = world.actors.filter(a => !ms.includes(a)); }
      world.mobT = 2; return;
    }
    return o.apply(this, arguments);
  })(tileMobs);

  // 2) 下山法阵：没拿剑就挡回去
  addTrigger = (o => function (x, y, r, fn) {
    const out = o.apply(this, arguments);
    try {
      const t = world.triggers[world.triggers.length - 1];
      if (t && t.fn === fn && world.mapName === 'tj_houshan') {
        t.fn = async function () {
          if (need()) {
            const tx = t.x, ty = t.y, rr = t.r;
            const re = setInterval(() => { const p = world.player; if (!p || world.mapName !== 'tj_houshan') { clearInterval(re); return; } if (Math.hypot(p.x - tx, p.y - ty) > rr + 30) { t.done = false; clearInterval(re); } }, 300);
            await say('星旋', '急什么，剑还没拿呢！溪边岩隙那股剑气就在西边，先去取了再下山。');
            setTimeout(go, 200); return;
          }
          return fn.apply(this, arguments);
        };
      }
    } catch (e) {}
    return out;
  })(addTrigger);

  // 3) 强制带路去溪边岩隙
  let idle = 0;
  function go() { try { if (!need() || !window.QUEST_NAV) return; if (!/取剑/.test(S.quest || '')) S.quest = '去溪边岩隙取剑（看左上角小地图的金圈）'; if (!QUEST_NAV.on) QUEST_NAV.start(); } catch (e) {} }
  setInterval(() => {
    try {
      if (!need()) { idle = 0; return; }
      const p = world.player, busy = world.locked || world.hold || (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice) || (typeof battle !== 'undefined' && battle) || S.scene !== drawMap;
      if (!p || busy) { idle = 0; return; }
      if (window.QUEST_NAV && QUEST_NAV.on) { idle = 0; return; }
      if (p.moving || world.path) { idle = 0; return; }
      if (++idle >= 4) { idle = 0; go(); }   // 停下约 2 秒就接着带路
    } catch (e) {}
  }, 500);

  // 4) 提示文字：这时候不该说“碰到兽火就开打”
  toast = (o => function (text) {
    try { if (need() && /^碰到发光的兽火就会开打/.test(String(text || ''))) arguments[0] = '星旋带路：先去溪边岩隙取剑（拿到剑之前，兽火不会出现）'; } catch (e) {}
    return o.apply(this, arguments);
  })(toast);
})();
