// ================= R243 · 站着不动的 NPC 用正脸（作者 11-13：不要每个人都是侧脸，很多 NPC 设成正脸，正面也很好看）=================
// 原来：NPC 走路时用走路图（有正 / 背 / 侧三个方向），一站定就换回一张固定的侧身立像。
// 现在：这些普通站姿的人站定时用走路图里的「正面站姿」那一帧；有特定姿势的（打铁、说书、捏糖人、洗衣、弹琵琶等）不动，还是原来那张。
// 个别需要侧身 / 背身的，在 NPC 上写 face: 'left' | 'right' | 'up' 即可。只进测试版。
(function () {
  if (typeof window.NPC_WALK !== 'function') return;
  const SC = {"town_guard":0.587,"disciple_m":0.5226,"disciple_f":0.514,"merchant":0.5131,"waiter":0.5136,"maid":0.5131,"scribe":0.5301,"wandering_blade":0.5177,"herbalist":0.5338,"traveling_merchant":0.5164,"tea_guest":0.5156,"villager_m":0.514,"villager_f":0.5157,"innkeeper":0.6113,"apothecary":0.5698,"library_elder":0.5352,"lin_elder":0.518,"steward_elder":0.6625,"teaching_elder":0.5825,"riddle_elder":0.5249,"bandit":0.5147,"kitchen_helper":0.5688,"maiden_market":0.5145,"granny_wang":0.5521,"drinker":0.5431,"drunk_scholar":0.532};
  const IM = {}, get = k => { if (!IM[k]) { const im = new Image(); im.onload = () => { im._ok = 1; }; im.src = 'walk/' + k + '.webp'; IM[k] = im; } return IM[k]._ok ? IM[k] : null; };
  const NW = window.NPC_WALK;
  window.NPC_WALK = function (a, now) {
    try { const n = a.npc, k = n && n.cx;
      if (k && SC[k] && !a.moving && !(a._walkT > 0) && !a.hidden && !n.sidePose && !window.R243_OFF) { const im = get(k);
        if (im) { const f = n.face, row = f === 'up' ? 1 : (f === 'left' || f === 'right') ? 2 : 0, flip = f === 'right' || (row === 0 && false), s = SC[k], bob = Math.sin(now * 1.8 + a.x * .01) * .8;
          ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 22, 7, 0, 0, 7); ctx.fill();
          ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y - bob); if (flip) ctx.scale(-1, 1); ctx.scale(s, s);
          ctx.drawImage(im, 0, row * 240, 160, 240, -80, -232, 160, 240); ctx.restore(); return true; } }
    } catch (e) {}
    return NW.apply(this, arguments);
  };
})();
