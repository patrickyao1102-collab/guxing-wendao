// ================= 选项框换成 R64「星盘夜空」风格（Codex 部件 + 代码排版）=================
// 原来的厚金云纹条太压抑：换成深蓝底 + 细银线的选项条，标题用毛笔字配两道银色细线；选项依次滑入，悬停/选中有银光
(function () {
  if (typeof drawChoice !== 'function') return;
  const loc = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const BLOB = { option_normal: '704be359273dd96e58645a99e4087b0c', option_selected: 'bd59eb6c1434d6fea0acf8e3a513274c', option_pressed: '40692fce249c583cb194e6e39bca6b05' }, IM = {};
  for (const k in BLOB) { const im = new Image(); im.onload = () => { IM[k] = im; }; im.src = loc ? 'ui3/r64/04_astrolabe__' + k + '.webp' : '/_blob/' + BLOB[k]; }
  const INS = [56, 56, 56, 56];
  function ns(img, x, y, w, h) { const [l, t, r, b] = INS, iw = img.width, ih = img.height, L = Math.min(l / 2, w / 2), T = Math.min(t / 2, h / 2), R = Math.min(r / 2, w / 2), B = Math.min(b / 2, h / 2);
    const sx = [0, l, iw - r, iw], dx = [x, x + L, x + w - R, x + w], sy = [0, t, ih - b, ih], dy = [y, y + T, y + h - B, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const sw = sx[i + 1] - sx[i], sh = sy[j + 1] - sy[j], dw = dx[i + 1] - dx[i], dh = dy[j + 1] - dy[j]; if (sw > 0 && sh > 0 && dw > 0 && dh > 0) ctx.drawImage(img, sx[i], sy[j], sw, sh, dx[i], dy[j], dw, dh); } }
  choiceRects = function () { const n = choice.options.length;
    if (n > 5) { const rows = Math.ceil(n / 2), w = 520, h = 62, gap = 18, cg = 36, y0 = H / 2 - (rows * (h + gap)) / 2 + 56; return choice.options.map((o, i) => ({ x: W / 2 + (i % 2 ? cg / 2 : -cg / 2 - w), y: y0 + Math.floor(i / 2) * (h + gap), w, h })); }
    const w = 760, h = 64, gap = 22, y0 = H / 2 - (n * (h + gap)) / 2 + 44; return choice.options.map((o, i) => ({ x: W / 2 - w / 2, y: y0 + i * (h + gap), w, h })); };
  const prev = drawChoice;
  drawChoice = function () {
    if (!choice) return; if (!IM.option_normal) return prev();
    const rs = choiceRects(), t = choice.t, now = performance.now() / 1000, k = Math.min(1, t * 5);
    ctx.save(); ctx.fillStyle = `rgba(4,8,18,${.62 * k})`; ctx.fillRect(0, 0, W, H);
    // 标题：毛笔字 + 两侧银线与菱形星点
    if (choice.title) { const ty = rs[0].y - 56; ctx.globalAlpha = k; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `44px ${BRUSH}`;
      const tw = ctx.measureText(choice.title).width; textOutline(choice.title, W / 2, ty, '#f3f6ff', 'rgba(8,14,30,.9)', 6);
      ctx.strokeStyle = 'rgba(193,217,238,.75)'; ctx.lineWidth = 1.2; for (const s of [-1, 1]) { const x0 = W / 2 + s * (tw / 2 + 24), x1 = x0 + s * 150 * k; const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(193,217,238,.85)'); g.addColorStop(1, 'rgba(193,217,238,0)'); ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x1, ty); ctx.stroke();
        ctx.fillStyle = '#dbe8f6'; ctx.save(); ctx.translate(x0 - s * 8, ty); ctx.rotate(Math.PI / 4); ctx.fillRect(-3.5, -3.5, 7, 7); ctx.restore(); } }
    const hx = input.x, hy = input.y;
    rs.forEach((r, i) => { const u = Math.max(0, Math.min(1, (t - .05 - i * .06) * 6)), e = 1 - (1 - u) ** 3; if (u <= 0) return;
      const hov = hx > r.x && hx < r.x + r.w && hy > r.y && hy < r.y + r.h, x = r.x + (1 - e) * 40;
      ctx.globalAlpha = e; ns(hov ? IM.option_selected || IM.option_normal : IM.option_normal, x, r.y, r.w, r.h);
      if (hov) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(x, 0, x + r.w, 0), p = (now * .6) % 1; g.addColorStop(Math.max(0, p - .15), 'rgba(170,205,240,0)'); g.addColorStop(p, 'rgba(170,205,240,.16)'); g.addColorStop(Math.min(1, p + .15), 'rgba(170,205,240,0)'); ctx.fillStyle = g; ctx.fillRect(x + 6, r.y + 6, r.w - 12, r.h - 12); ctx.restore(); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `600 ${r.w > 600 ? 26 : 23}px ${FONT}`; ctx.fillStyle = hov ? '#ffffff' : '#e3ebf4'; ctx.fillText(choice.options[i], x + r.w / 2, r.y + r.h / 2 + 1);
      // 左侧序号星点
      ctx.fillStyle = hov ? '#c1d9ee' : 'rgba(193,217,238,.55)'; ctx.beginPath(); ctx.arc(x + 34, r.y + r.h / 2, hov ? 4 : 3, 0, 7); ctx.fill(); });
    ctx.restore();
  };
})();
