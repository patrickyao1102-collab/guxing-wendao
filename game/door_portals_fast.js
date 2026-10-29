/* 青阳镇门口光标 · 提速版（Claude）——放在 door_portals.js 之后加载，door_portals.js 原文件保留不动。
 * 外观与 door_portals.js 相同：青色光晕 + 双环 + 旋转刻度、门上方的下箭头、靠近时的「进入 · xx」牌子。
 * 原来每个门每帧都用 shadowBlur 现画描边（模糊非常吃性能，青阳镇门多所以特别卡），
 * 这里把这些带发光的线条预先画进离屏贴图，每帧只做 drawImage / 旋转 / 透明度；并且只画镜头内的门。
 */
(() => {
  'use strict';
  if (typeof lfxDoor !== 'function' || typeof tileAmbientHigh !== 'function' || !TMAPS.qy_town) return;
  const K = 2, mk = (w, h) => { const c = document.createElement('canvas'); c.width = w * K; c.height = h * K; const g = c.getContext('2d'); g.scale(K, K); return [c, g]; };
  const town = () => world.map && world.map.def === TMAPS.qy_town;
  const active = d => d && !d.edge && !d.noGlow && (!d.cond || d.cond());
  const pos = d => d.rect ? d.rect : [(d.c + .5) * TS, (d.r + 1) * TS - 6];
  const inView = (x, y) => { const c = world.cam || { x: 0, y: 0 }; return !(x < c.x - 90 || x > c.x + W + 90 || y < c.y - 90 || y > c.y + H + 90); };
  // —— 地面光圈：底光 / 双环（呼吸）/ 刻度（旋转）三张贴图，未压扁，绘制时 scale(1,.42) ——
  const S = 60, D = S * 2;
  const [glow, g0] = mk(D, D); g0.translate(S, S);
  { const gr = g0.createRadialGradient(0, 0, 7, 0, 0, 48); gr.addColorStop(0, 'rgba(120,230,218,.15)'); gr.addColorStop(.65, 'rgba(150,235,220,.23)'); gr.addColorStop(1, 'rgba(150,235,220,0)'); g0.fillStyle = gr; g0.beginPath(); g0.arc(0, 0, 48, 0, Math.PI * 2); g0.fill(); }
  const [rings, g1] = mk(D, D); g1.translate(S, S); g1.shadowColor = '#b0fff1'; g1.shadowBlur = 8 * K;
  g1.lineWidth = 2; g1.strokeStyle = 'rgba(185,255,233,.85)'; g1.beginPath(); g1.arc(0, 0, 37, 0, Math.PI * 2); g1.stroke();
  g1.lineWidth = 1.3; g1.strokeStyle = 'rgba(255,222,157,.85)'; g1.beginPath(); g1.arc(0, 0, 30, 0, Math.PI * 2); g1.stroke();
  const [ticks, g2] = mk(D, D); g2.translate(S, S); g2.shadowColor = '#b0fff1'; g2.shadowBlur = 8 * K; g2.lineWidth = 1.3; g2.strokeStyle = 'rgba(255,222,157,.85)';
  for (let i = 0; i < 8; i++) { g2.rotate(Math.PI / 4); g2.beginPath(); g2.moveTo(39, 0); g2.lineTo(44, 0); g2.stroke(); }
  // —— 门上方的小下箭头 ——
  const [chev, g3] = mk(40, 36); g3.translate(20, 16); g3.shadowColor = 'rgba(180,255,225,.85)'; g3.shadowBlur = 8 * K;
  g3.lineJoin = 'round'; g3.lineWidth = 2; g3.strokeStyle = '#41544b'; g3.fillStyle = '#fff1b4';
  g3.beginPath(); g3.moveTo(-10, -6); g3.lineTo(0, 1); g3.lineTo(10, -6); g3.lineTo(10, 0); g3.lineTo(0, 8); g3.lineTo(-10, 0); g3.closePath(); g3.fill(); g3.stroke();

  const prevDoor = lfxDoor;   // door_portals.js 的版本（非青阳镇时它会再转给原版）
  lfxDoor = function (x, y, now, d) {
    if (!town()) return prevDoor(x, y, now, d);
    if (!active(d) || !inView(x, y)) return;
    const pulse = .85 + Math.sin(now * 2.2) * .15, ga = ctx.globalAlpha;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, .42); ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(glow, -S, -S, D, D);
    ctx.globalAlpha = ga * pulse; ctx.drawImage(rings, -S, -S, D, D);
    ctx.rotate(now * .32); ctx.drawImage(ticks, -S, -S, D, D);
    ctx.restore();
  };
  // 门上箭头 + 靠近提示：逻辑照抄 door_portals.js，只把带模糊的箭头换成贴图
  const baseHigh = (() => { // 取 door_portals.js 包装之前的原版（它内部先调原版再画箭头），这里重新包一层原版
    return window.__tileAmbientHighBase || null;
  })();
  const dpHigh = tileAmbientHigh;
  tileAmbientHigh = function (T, cam, now) {
    if (!town() || !baseHigh) return dpHigh(T, cam, now);
    baseHigh(T, cam, now);
    for (const d of T.doors) {
      if (!active(d)) continue;
      const [x, y] = pos(d);
      if (x < cam.x - 70 || x > cam.x + W + 70 || y < cam.y - 30 || y > cam.y + H + 90) continue;
      const near = world.player && Math.hypot(world.player.x - x, world.player.y - y) < 190;
      const bob = Math.sin(now * 2.6) * 3;
      ctx.drawImage(chev, x - 20, y - 30 + bob - 16, 40, 36);
      if (near && d.label) {
        ctx.save(); ctx.font = `600 16px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const label = '进入 · ' + d.label, w = ctx.measureText(label).width + 22;
        ctx.fillStyle = 'rgba(20,41,35,.87)'; ctx.strokeStyle = 'rgba(215,210,154,.85)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(x - w / 2, y - 76, w, 26, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff0cc'; ctx.fillText(label, x, y - 63); ctx.restore();
      }
    }
  };
})();
