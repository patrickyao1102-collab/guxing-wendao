// R100 星落·练气：头顶换成 Codex v06 金色阵法（作者 11-03：流星雨就用现在游戏里的，头顶接光云或阵法都行 → 用阵法）
// 原画：Codex交付/R100_星落练气_画图版/v06_日景光质重做/assets/array 的 outer / inner / center 三层（同一张母图拆层）。
// 代码只做旋转、压扁成透视椭圆、淡入淡出：外环顺时针 42°/秒、落星时加速到 64°/秒，内环反向 0.48 倍，中心不转（照 renderer.py）。
// 作者 11-03：正常的转不晕，星落那种「似转非转」才晕 —— 这里是真正匀速转。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const URL = LOC ? 'r100x/xl_array.webp' : '/_blob/' + (window.XLARR_BLOB || 'd64beb1b84daf511ea5d57d576880f8a');
  // [图集x, y, 宽, 高, 占整张 1280 母图的比例]
  const MAP = { outer: [0, 0, 696, 696, .9062], inner: [698, 0, 490, 490, .6375], center: [1190, 0, 234, 234, .3047] };
  const SIZE = 520, PROJ = .38, DY = 16;   // Codex 1280×720 里阵盘宽 520、纵向压到 0.38；正式战斗顶上有队伍血条，阵盘再下移 16 让开
  let img = null, ok = false;
  img = new Image(); img.onload = () => { (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => { ok = true; }); }; img.src = URL;
  const C = x => Math.max(0, Math.min(1, x)), E = (t, a, b) => { const q = C((t - a) / (b - a)); return q * q * (3 - 2 * q); };
  // 外环转角（度）：从出招起匀速 50°/秒，不加速、不减速。
  // 作者 11-03：转着转着突然变慢又变快，看得心里难受 —— 原因是命中时战斗「顿帧」(battle.freeze) 会把特效时间停住 70~140 毫秒，
  // 七颗流星砸下来就一卡一卡。所以阵盘转角改用真实时间（performance.now）走，顿帧时照样匀速转，只有淡入淡出跟技能时间轴。
  const SPEED = 50; let T0 = 0, lastT = 1e9;
  function realT(t) { const now = performance.now(); if (t < lastT - .3 || !T0) T0 = now - t * 1000; lastT = t; return (now - T0) / 1000; }
  function rot(t) { return SPEED * t; }
  const alpha = t => E(t, .85, 1.3) * (1 - E(t, 4.65, 5.3));
  function part(c, k, ang, a) {
    const m = MAP[k], s = SIZE * m[4];
    c.save(); c.scale(1, PROJ); if (ang) c.rotate(ang); c.globalAlpha = a; c.drawImage(img, m[0], m[1], m[2], m[3], -s / 2, -s / 2, s, s); c.restore();
  }
  function draw(c, x, y, t, mul) {
    if (!ok) return; const a = alpha(t) * (mul == null ? 1 : mul) * (.94 + .06 * Math.sin(t * 3.7)); if (a <= .003) return;
    const r = rot(realT(t)) * Math.PI / 180;
    c.save(); c.translate(x, y + DY); c.globalCompositeOperation = 'source-over';
    part(c, 'outer', r, a); part(c, 'inner', -r * .48, a); part(c, 'center', 0, a);
    c.restore();
  }
  // 落星的出发点：外环上 0.72 半径处的 12 个刻点，随外环一起转（流星从阵纹上射出）
  function nodes(t, o) {
    const r = rot(t) * Math.PI / 180, out = [];
    for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6 + r; out.push({ index: i, x: o.x + Math.cos(an) * SIZE / 2 * .72, y: o.y + DY + Math.sin(an) * SIZE / 2 * .72 * PROJ }); }
    return out;
  }
  window.XLARR = { draw, nodes, rot, alpha, ready: () => ok, SIZE, PROJ };
})();
