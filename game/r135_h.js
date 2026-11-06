// ================= R135 · H 天枢打坐特效升级（作者 11-07 修改1 第 9 条：叶孤星居室打坐、头顶「天枢」亮起那段太简陋）=================
// 换成 Codex R134_H「天枢初醒」6.5 秒分层演出：居室 → 星空展开 → 北斗七星依次点亮（摇光→开阳→玉衡→天权→天玑→天璇→天枢）
// → 星光灌顶 + 灵气旋涡 → 金字「天枢」显现收束。绘制逻辑照搬 Codex 预览.html 的 render(t)，改成画在游戏 canvas 的 overlay 上。
// 只换画面：starSea(ms, onLevel) 的调用方（第一章居室练气六→九重、第二章出发前夜凝丹）剧情 / 数值一行不动，
// onLevel 照旧回调三次（落在灌顶段），演出期间锁输入、收起地图 HUD，结束后回到原流程。素材没载完时退回 r99 的旧版。
(function () {
  const K = ['room', 'starfield', 'meditating', 'star_blue', 'star_gold', 'tian_shu_gold', 'vortex', 'waterfall'], IM = {}; let loaded = 0;
  K.forEach(k => { const im = new Image(); im.onload = () => { IM[k] = im; loaded++; }; im.src = 'r135h/' + k + '.webp'; });
  const ready = () => loaded >= K.length;
  // manifest.json 的七星节点（顺序即点亮顺序）与连线
  const STARS = [{ x: 390, y: 110, at: 1.2 }, { x: 475, y: 145, at: 1.56 }, { x: 560, y: 205, at: 1.92 }, { x: 650, y: 190, at: 2.28 }, { x: 735, y: 250, at: 2.64 }, { x: 855, y: 215, at: 3.0 }, { x: 835, y: 115, at: 3.36 }];
  const LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]];
  const DUR = 6.5, OUT = .5, LV_AT = [3.75, 4.35, 4.95];   // 三次升级落在「星光灌顶」3.6–5.2 秒
  const sat = x => Math.max(0, Math.min(1, x)), ease = x => { x = sat(x); return x * x * (3 - 2 * x); };
  function pic(im, x, y, w, h, a) { if (!(a > .003)) return; const g = ctx.globalAlpha; ctx.globalAlpha = g * sat(a); ctx.drawImage(im, x, y, w, h); ctx.globalAlpha = g; }
  // 图集帧：旋涡 3×2（384×384），光瀑 4×1（384×512）
  function cell(im, i, cols, cw, ch, x, y, w, h, a) { if (!(a > .003)) return; const g = ctx.globalAlpha; ctx.globalAlpha = g * sat(a); ctx.drawImage(im, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch, x, y, w, h); ctx.globalAlpha = g; }
  function render(t) {   // 1280×720 舞台 = 游戏画布，坐标直接用
    pic(IM.room, 0, 0, W, H, 1);
    if (t > .45) { ctx.save(); const r = ease((t - .45) / .95) * 1500; ctx.beginPath(); ctx.ellipse(640, 320, Math.max(1, r), Math.max(1, r * .65), 0, 0, Math.PI * 2); ctx.clip(); pic(IM.starfield, 0, 0, W, H, ease((t - .45) / .95)); ctx.restore(); }
    const va = ease((t - 2.8) / 1.1) * (1 - .65 * ease((t - 5.7) / .8)), vf = Math.floor(Math.max(0, t - 2.8) * 10) % 6;
    const ba = ease((t - 3.6) / .5) * (1 - ease((t - 5.25) / .65));
    if (ba > 0) cell(IM.waterfall, Math.floor(Math.max(0, t - 3.6) * 10) % 4, 4, 384, 512, 490, -35, 300, 410, ba * .7);
    const breath = Math.sin(t * 2) * 1.5; pic(IM.meditating, 448, 320 + breath, 384, 320, 1);   // 底中锚点 (192,320) → 舞台 (640,640)
    if (va > 0) cell(IM.vortex, vf, 3, 384, 384, 345, 325, 590, 390, va * .85);   // 旋涡只叠一次，避免矩形接缝
    ctx.save(); ctx.lineWidth = 1.4;
    for (const [a, b] of LINKS) { const p = STARS[a], q = STARS[b], u = ease((t - Math.max(p.at, q.at)) / .3); if (u > 0) { ctx.beginPath(); ctx.strokeStyle = 'rgba(161,207,255,' + (.5 * u) + ')'; ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + (q.x - p.x) * u, p.y + (q.y - p.y) * u); ctx.stroke(); } }
    ctx.restore();
    STARS.forEach((p, i) => { const a = ease((t - p.at) / .24); if (a <= 0) return; const gold = i === 6 && t >= 5.2, w = (gold ? 148 : 91) * (1 + .07 * Math.sin(t * 3 + i)); pic(gold ? IM.star_gold : IM.star_blue, p.x - w / 2, p.y - w / 2, w, w, a); });
    if (t >= 5.2) { const a = ease((t - 5.2) / .5); pic(IM.tian_shu_gold, 875, 55, 240, 75, a); pic(IM.star_gold, 590, 305, 100, 100, a * .6); }
  }
  (function hook(n) {
    if (typeof starSea !== 'function' || typeof S === 'undefined' || !S.overlay) { if ((n || 0) < 80) setTimeout(() => hook((n || 0) + 1), 250); return; }
    const prev = starSea;
    starSea = async function (ms = 5200, onLevel) {
      if (!ready()) return prev.apply(this, arguments);
      const o = { t: 0 }, texts = [], hud0 = S.hud, lock0 = world.locked;
      S.hud = false; S.toast = null; world.locked = true;
      // 调用方在 onLevel 里用 floatText 飘境界字；原版 floatText 画在 overlay 底下（看不见），这里临时改画到演出层上面
      const ft0 = typeof floatText === 'function' ? floatText : null;
      if (ft0) floatText = function (x, y, text, color, size = 44, life = 1.0, font = FONT) { texts.push({ x, y, text, color, size, life, font, t0: o.t / 1000 }); };
      o.draw = () => {
        const sec = o.t / 1000, t = Math.min(DUR, sec), a = sat(sec / .3) * (1 - ease((sec - DUR) / OUT));
        ctx.save(); ctx.globalAlpha = a; render(t);
        // 境界字只画最新一条，挪到人物膝下、缩小一号，不挡灌顶和人物
        const f = texts[texts.length - 1], k = f ? (sec - f.t0) / f.life : 1;
        if (f && k >= 0 && k < 1) { const s = k < .15 ? 1.5 + (1 - 1.5) * (k / .15) : 1;
          ctx.save(); ctx.globalAlpha = a * (k > .7 ? (1 - k) / .3 : 1); ctx.translate(f.x, 682 - k * 24); ctx.scale(s, s);
          ctx.font = `900 ${Math.round(f.size * .6)}px ${f.font}`; ctx.textAlign = 'center'; textOutline(f.text, 0, 0, f.color, '#1a0600', 6); ctx.restore(); }
        ctx.restore();
      };
      S.overlay.push(o);
      try {
        const t0 = performance.now(); let lv = 0;
        while (performance.now() - t0 < (DUR + OUT) * 1000) {
          o.t = performance.now() - t0; if (typeof input !== 'undefined') input.tapped = null;   // 演出期间吃掉点击
          if (lv < 3 && o.t / 1000 >= LV_AT[lv]) { lv++; try { onLevel && onLevel(lv); } catch (e) { console.error(e); } }
          await nextFrame();
        }
        while (lv < 3) { lv++; try { onLevel && onLevel(lv); } catch (e) { console.error(e); } }
      } finally {
        if (ft0) floatText = ft0;
        const i = S.overlay.indexOf(o); if (i >= 0) S.overlay.splice(i, 1);
        if (S.hud === false) S.hud = hud0; world.locked = lock0;
        if (typeof input !== 'undefined') input.tapped = null;
      }
    };
  })();
  window.R135_H = { ready, render, DUR };
})();
