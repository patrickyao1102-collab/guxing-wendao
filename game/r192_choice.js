// ================= R192 选项框换新（作者 11-10：「白色界面难看」→ Codex 出六套，作者：「1、2 都可以」）=================
// 方案1「夜墨金线」：半透明墨底 + 细金线，地图透得出来 —— 一般剧情选项
// 方案2「朱押笺」：旧纸榜文 + 左侧朱押 —— 支线 / 悬赏 / 委托接取（像揭一张榜）
// 每条按文字定宽（不再整条白玉横在屏幕中间），高 58、间距 9；存档列表仍用 R169 两行玉牌。部件没载完退回 R169。
(function () {
  const SK = {
    1: { cut: [76, 624], tcut: [50, 398], title: '#FAEACE', text: '#FFF1D6', off: '#D2CEC7', shadow: 'rgba(0,0,0,.55)' },
    2: { cut: [111, 649], tcut: [50, 399], title: '#3A251C', text: '#322318', off: '#6a5c4c', shadow: null },
  };
  const IM = {}; let n = 0;
  for (const s of [1, 2]) for (const k of ['normal', 'focus', 'pressed', 'disabled', 'title']) { const im = new Image(); im.onload = () => { IM['s' + s + '_' + k] = im; n++; }; im.src = 'r192/s' + s + '_' + k + '.webp'; }
  const ready = s => ['normal', 'focus', 'pressed', 'disabled', 'title'].every(k => IM['s' + s + '_' + k]);
  const HEAD = '"GuxingDF",' + BRUSH, BODY = '"GuxingWKB",' + FONT;
  const isSave = o => /^(自动存档|存档 \d)/.test(String(o));
  const skinOf = () => (choice && /支线|悬赏|委托|榜/.test(choice.title || '')) ? 2 : 1;
  // 三段切：左头 / 中段拉伸 / 右头（源图 2×，1× 宽 720、高 58；标题 448×62）
  function three(im, cut, W1, x, y, w, h) { const sx = im.width / W1, L = cut[0], R = W1 - cut[1];
    ctx.drawImage(im, 0, 0, L * sx, im.height, x, y, L, h);
    ctx.drawImage(im, cut[0] * sx, 0, (cut[1] - cut[0]) * sx, im.height, x + L, y, Math.max(1, w - L - R), h);
    ctx.drawImage(im, cut[1] * sx, 0, R * sx, im.height, x + w - R, y, R, h); }
  const fontOpt = (o, px) => '600 ' + px + 'px ' + BODY;
  function optW(o, s) { const c = SK[s].cut; ctx.save(); ctx.font = fontOpt(o, 24); const tw = ctx.measureText(String(o)).width; ctx.restore();
    return Math.min(W - 80, Math.max(300, tw + 24 + c[0] + (720 - c[1]))); }
  const H1 = 58, GAP = 9;
  const prevRects = choiceRects;
  choiceRects = function () {
    const opts = choice && choice.options; if (!opts) return prevRects.apply(this, arguments);
    const s = skinOf(); if (!ready(s) || opts.some(isSave)) return prevRects.apply(this, arguments);
    const k = opts.length;
    if (k > 6) { const rows = Math.ceil(k / 2), cw = 520, cg = 18, y0 = H / 2 - (rows * (H1 + GAP)) / 2 + 40; return opts.map((o, i) => ({ x: W / 2 + (i % 2 ? cg / 2 : -cg / 2 - cw), y: y0 + Math.floor(i / 2) * (H1 + GAP), w: cw, h: H1 })); }
    const y0 = Math.max(140, H / 2 - (k * (H1 + GAP) - GAP) / 2 + 60);
    return opts.map((o, i) => { const w = optW(o, s); return { x: W / 2 - w / 2, y: y0 + i * (H1 + GAP), w, h: H1 }; });
  };
  let downI = -1;
  window.addEventListener('pointerdown', () => { downI = -1; try { if (!choice) return; choiceRects().forEach((r, i) => { if (input.x > r.x && input.x < r.x + r.w && input.y > r.y && input.y < r.y + r.h) downI = i; }); } catch (e) {} }, true);
  window.addEventListener('pointerup', () => { setTimeout(() => { downI = -1; }, 120); }, true);
  const prevDraw = window.R169_DRAWCHOICE;
  window.R169_DRAWCHOICE = function () {
    if (!choice) return false; const opts = choice.options, s = skinOf(), S1 = SK[s];
    if (!ready(s) || opts.some(isSave)) return prevDraw ? prevDraw.apply(this, arguments) : false;
    const rs = choiceRects(), t = choice.t, k = Math.min(1, t * 5);
    ctx.save(); ctx.fillStyle = `rgba(8,6,4,${(s === 1 ? .36 : .22) * k})`; ctx.fillRect(0, 0, W, H);   // 作者 11-11：「条颜色调淡了，和 Codex 弄的不一样」→ 夜墨金线照效果图压暗到 .36，墨底叠两层（Codex 效果图的墨色更深）
    if (choice.title) {
      ctx.globalAlpha = k; const ty = rs[0].y - 44;
      let px = 30; ctx.font = px + 'px ' + HEAD; while (px > 20 && ctx.measureText(choice.title).width > 760) { px--; ctx.font = px + 'px ' + HEAD; }
      const tw = Math.min(W - 120, Math.max(260, ctx.measureText(choice.title).width + 28 + 100));
      three(IM['s' + s + '_title'], S1.tcut, 448, W / 2 - tw / 2, ty - 31, tw, 62); if (s === 1) three(IM['s' + s + '_title'], S1.tcut, 448, W / 2 - tw / 2, ty - 31, tw, 62);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (S1.shadow) textOutline(choice.title, W / 2, ty + 1, S1.title, S1.shadow, 3); else { ctx.fillStyle = S1.title; ctx.fillText(choice.title, W / 2, ty + 1); }
    }
    const hx = input.x, hy = input.y;
    rs.forEach((r, i) => {
      const u = Math.max(0, Math.min(1, (t - .04 - i * .05) * 6)), e = 1 - (1 - u) ** 3; if (u <= 0) return;
      const o = String(opts[i]), off = /^[（(].*不可|^🔒/.test(o);
      const hov = hx > r.x && hx < r.x + r.w && hy > r.y && hy < r.y + r.h, down = downI === i && input.down;
      ctx.globalAlpha = e; const x = r.x, yy = r.y + (1 - e) * 14;
      const key = off ? 'disabled' : down ? 'pressed' : hov ? 'focus' : 'normal';
      three(IM['s' + s + '_' + key], S1.cut, 720, x, yy, r.w, r.h); if (s === 1) three(IM['s' + s + '_' + key], S1.cut, 720, x, yy, r.w, r.h);
      const c = S1.cut, inner = r.w - c[0] - (720 - c[1]) - 24, cx = x + c[0] + 12 + inner / 2;
      let px = 24; ctx.font = fontOpt(o, px); while (px > 15 && ctx.measureText(o).width > inner) { px--; ctx.font = fontOpt(o, px); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const ty = yy + r.h / 2 + 1 + (down ? 1 : 0), col = off ? S1.off : S1.text;
      if (S1.shadow) textOutline(o, cx, ty, col, S1.shadow, 3); else { ctx.fillStyle = col; ctx.fillText(o, cx, ty); }
    });
    ctx.restore(); return true;
  };
  window.R192 = { IM, ready, skinOf };
})();
