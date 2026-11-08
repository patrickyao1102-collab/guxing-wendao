// ================= R169 · 全游戏 UI 统一（作者 11-08：「代码框都让 Codex 精细化」「不一定是黑金，要自己设计」）=================
// 设计语言：墨木鎏金 · 宣纸内页 · 白玉点缀（Claude 定方向，Codex R169 第二步正式部件，部件里没有字，字都由这里写）。
// 这一批接：选项框（如意玉牌）、存档列表（两行玉牌）、系统面板（星旋 / 玉佩 = 墨玉传音，其余 = 宣纸卷轴）、
//           飘字提示（墨绸带）、进图地名牌（小木匾）、战斗顶部行动条（墨笔刷）、战斗头顶血条（玉槽金帽）、标题页原著小说 / 编辑策划卷轴。
// 部件没载完时每一处都退回原来的画法，不会卡住。
(function () {
  const P = {}, IM = {}; let ready = false;
  const HEAD = '"GuxingDF",' + BRUSH, BODY = '"GuxingWKB",' + FONT;
  fetch('r169/parts.json').then(r => r.json()).then(j => {
    Object.assign(P, j); let n = 0; const keys = Object.keys(j);
    keys.forEach(k => { const im = new Image(); im.onload = () => { IM[k] = im; if (++n >= keys.length) ready = true; }; im.onerror = () => { if (++n >= keys.length) ready = true; }; im.src = 'r169/' + k + '.webp'; });
  }).catch(() => {});
  const ok = (...ks) => ready && ks.every(k => IM[k] && P[k]);
  // 按 manifest 的切法画：fixed / three-x / three-y / nine（源图是 @2x，切线是 1x 坐标）
  function part(k, x, y, w, h) {
    const im = IM[k], p = P[k]; if (!im || !p) return false;
    const [W1, H1] = p.s, sx = im.width / W1, sy = im.height / H1;
    w = w == null ? W1 : w; h = h == null ? H1 : h;
    const xs = p.m === 'three-x' || p.m === 'nine' ? [0, p.x[0], p.x[1], W1] : [0, W1];
    const ys = p.m === 'three-y' || p.m === 'nine' ? [0, p.y[0], p.y[1], H1] : [0, H1];
    const dxs = xs.length === 4 ? [x, x + xs[1], x + w - (W1 - xs[2]), x + w] : [x, x + w];
    const dys = ys.length === 4 ? [y, y + ys[1], y + h - (H1 - ys[2]), y + h] : [y, y + h];
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      const sw = xs[i + 1] - xs[i], sh = ys[j + 1] - ys[j], dw = dxs[i + 1] - dxs[i], dh = dys[j + 1] - dys[j];
      if (sw > 0 && sh > 0 && dw > 0 && dh > 0) ctx.drawImage(im, xs[i] * sx, ys[j] * sy, sw * sx, sh * sy, dxs[i], dys[j], dw, dh);
    }
    return true;
  }
  const midText = (t, x, y, font, color, align = 'center') => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y + 1); };
  const fitFont = (t, base, px, maxW, min = 16) => { let n = px; ctx.font = base.replace('#', n); while (n > min && ctx.measureText(t).width > maxW) { n -= 1; ctx.font = base.replace('#', n); } return base.replace('#', n); };
  window.R169 = { part, ok, ready: () => ready };

  // ---------------- 选项框：如意玉牌 ----------------
  const isSave = o => /^(自动存档|存档 \d)/.test(String(o));
  const prevRects = typeof choiceRects === 'function' ? choiceRects : null;
  choiceRects = function () {
    if (!ok('option_normal', 'option_focus', 'option_title_ink')) return prevRects.apply(this, arguments);
    const opts = choice.options, n = opts.length, save = opts.some(isSave);
    const w = save ? 730 : 660, h = save ? 69 : 61, gap = save ? 18 : 19;
    if (!save && n > 6) { const rows = Math.ceil(n / 2), cw = 500, cg = 26, y0 = H / 2 - (rows * (h + gap)) / 2 + 40; return opts.map((o, i) => ({ x: W / 2 + (i % 2 ? cg / 2 : -cg / 2 - cw), y: y0 + Math.floor(i / 2) * (h + gap), w: cw, h })); }
    const y0 = Math.max(120, H / 2 - (n * (h + gap) - gap) / 2 + 36);
    return opts.map((o, i) => ({ x: W / 2 - w / 2, y: y0 + i * (h + gap), w, h }));
  };
  let downI = -1;
  window.addEventListener('pointerdown', () => { downI = -1; try { if (!choice) return; const rs = choiceRects(); rs.forEach((r, i) => { if (input.x > r.x && input.x < r.x + r.w && input.y > r.y && input.y < r.y + r.h) downI = i; }); } catch (e) {} }, true);
  window.addEventListener('pointerup', () => { setTimeout(() => { downI = -1; }, 120); }, true);
  window.R169_DRAWCHOICE = function () {
    if (!choice || !ok('option_normal', 'option_focus', 'option_title_ink')) return false;
    const rs = choiceRects(), t = choice.t, k = Math.min(1, t * 5), opts = choice.options, save = opts.some(isSave);
    ctx.save(); ctx.fillStyle = `rgba(10,8,6,${.55 * k})`; ctx.fillRect(0, 0, W, H);
    if (choice.title) {
      const ty = rs[0].y - 52; ctx.globalAlpha = k;
      const tf = fitFont(choice.title, '#px ' + HEAD, 35, 820, 22); ctx.font = tf; const tw = Math.max(300, Math.min(900, ctx.measureText(choice.title).width + 200));
      part('option_title_ink', W / 2 - tw / 2, ty - 31, tw, 63);
      ctx.font = tf; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(choice.title, W / 2, ty + 1, '#f6ebd4', 'rgba(20,12,4,.55)', 3);
    }
    const hx = input.x, hy = input.y;
    rs.forEach((r, i) => {
      const u = Math.max(0, Math.min(1, (t - .04 - i * .05) * 6)), e = 1 - (1 - u) ** 3; if (u <= 0) return;
      const o = String(opts[i]), off = /^[（(].*不可|^🔒/.test(o);
      const hov = hx > r.x && hx < r.x + r.w && hy > r.y && hy < r.y + r.h, down = downI === i && input.down;
      ctx.globalAlpha = e; const x = r.x, yy = r.y + (1 - e) * 16;
      if (save) {
        const empty = / · 空$/.test(o), key = empty ? 'save_empty' : (hov ? 'save_focus' : 'save_filled');
        part(IM[key] ? key : 'option_normal', x, yy, r.w, r.h);
        const parts = o.split(' · '), head = parts.length > 2 ? parts.slice(0, 2).join(' · ') : parts[0], rest = parts.length > 2 ? parts.slice(2).join('　') : (empty ? '空档位' : parts.slice(1).join(' · '));
        midText(head, x + r.w / 2, yy + 24 + (down ? 1 : 0), fitFont(head, '#px ' + HEAD, 24, r.w - 200), '#3c3125');
        midText(rest, x + r.w / 2, yy + 49 + (down ? 1 : 0), fitFont(rest, '#px ' + BODY, 17, r.w - 200, 12), '#685e4f');
      } else {
        const key = off ? 'option_off' : down ? 'option_down' : hov ? 'option_focus' : 'option_normal';
        part(IM[key] ? key : 'option_normal', x, yy, r.w, r.h);
        const f = fitFont(o, (hov ? '#px ' + HEAD : '600 #px ' + BODY), 26, r.w - 200, 15);
        midText(o, x + r.w / 2, yy + r.h / 2 + (down ? 1 : 0), f, off ? '#8f877a' : '#342e25');
      }
    });
    ctx.restore(); return true;
  };

  // ---------------- 系统面板：星旋 / 玉佩 → 墨玉传音；其余 → 宣纸卷轴 ----------------
  const JADE = p => /星旋|玉佩|传音|黑玉/.test(String(p.title || ''));
  window.R169_DRAWPANEL = function (p, k) {
    if (!p || p.eqp) return false;
    const jade = JADE(p); if (jade ? !ok('ink_jade_panel', 'black_jade_charm') : !ok('paper_scroll')) return false;
    const lines = p.lines || [], lh = jade ? 40 : 44;
    ctx.save(); ctx.fillStyle = `rgba(10,8,6,${.5 * k})`; ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H / 2); const z = lerp(.9, 1, k); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); ctx.globalAlpha = k;
    if (jade) {
      const w = 825, h = Math.max(276, 160 + lines.length * lh), x = W / 2 - w / 2 + 12, y = H / 2 - h / 2;
      part('ink_jade_panel', x, y, w, h); part('black_jade_charm', x - 33, y + 13);
      midText(p.title, x + w / 2 + 12, y + 60, fitFont(p.title, '#px ' + HEAD, 40, w - 220, 24), '#f3ebd6');
      lines.forEach((l, i) => { const hl = l.startsWith('!'), s = hl ? l.slice(1) : l; midText(s, x + 103, y + 122 + i * lh, fitFont(s, '#px ' + BODY, 27, w - 170, 16), hl ? '#e3d1a2' : '#f2ecde', 'left'); });
    } else {
      const w = 880, h = Math.max(308, 190 + lines.length * lh), x = W / 2 - w / 2, y = H / 2 - h / 2;
      part('paper_scroll', x, y, w, h);
      midText(p.title, W / 2, y + 86, fitFont(p.title, '#px ' + HEAD, 39, w - 240, 24), '#513a29');
      lines.forEach((l, i) => { const hl = l.startsWith('!'), s = hl ? l.slice(1) : l; midText(s, W / 2, y + 146 + i * lh, fitFont(s, '#px ' + BODY, 27, w - 220, 16), hl ? '#a8382b' : '#513a29'); });
      if (p.t > .4) { ctx.globalAlpha = k * (.55 + .3 * Math.sin(performance.now() / 300)); midText('点按继续', W / 2, y + h - 72, '19px ' + BODY, '#513a29'); }
    }
    ctx.restore(); return true;
  };
  // 原来面板按 720 宽折行；宣纸卷轴更宽，折行宽度跟着放宽
  window.R169_PANEL_WRAPW = p => (!p || p.eqp || !ready) ? 0 : JADE(p) ? 650 : 660;

  // ---------------- 飘字提示：墨绸带 ----------------
  window.R169_DRAWTOAST = function (t, a, off) {
    if (!ok('toast_silk')) return false;
    ctx.save(); ctx.globalAlpha = a; const f = '24px ' + BODY; ctx.font = f;
    const w = Math.max(300, Math.min(1000, ctx.measureText(t.text).width + 150)), h = 72, x = W / 2 - w / 2, y = 72 + off + (off ? 22 : 0);
    part('toast_silk', x, y, w, h); midText(t.text, W / 2, y + h / 2 + 3, f, '#faf2e2');
    ctx.restore(); return true;
  };

  // ---------------- 进图地名牌：小木匾 ----------------
  window.R169_DRAWBANNER = function (bn, a, by) {
    if (!ok('location_sign')) return false;
    ctx.save(); ctx.globalAlpha = a; const f = '32px ' + HEAD; ctx.font = f;
    const w = Math.max(294, ctx.measureText(bn.text).width + 150), h = 73, x = W / 2 - w / 2;
    part('location_sign', x, by, w, h); midText(bn.text, W / 2, by + 32, f, '#efd6a6');
    ctx.restore(); return true;
  };

  // ---------------- 战斗：顶部墨笔刷 + 头顶玉槽血条 ----------------
  window.R169_DRAWTURN = function (text) {
    if (!ok('turn_brush')) return false;
    ctx.save(); const f = '27px ' + HEAD; ctx.font = f; const w = Math.max(431, ctx.measureText(text).width + 150);
    part('turn_brush', 6, 4, w, 47); midText(text, 48, 27, f, '#f7e4ba', 'left'); ctx.restore(); return true;
  };
  window.R169_HPBAR = function (u, cx, by) {
    if (!ok('battle_track', 'battle_fill_ally', 'battle_fill_enemy')) return false;
    const x = cx - 61, y = by - 2, fr = u.maxhp > 0 ? Math.max(0, Math.min(1, u.hp / u.maxhp)) : 0;
    part('battle_track', x, y, 122, 13);
    if (fr > 0) { const im = IM[u.side === 'hero' ? 'battle_fill_ally' : 'battle_fill_enemy']; ctx.save(); ctx.beginPath(); ctx.rect(x + 5, y + 4, 113 * fr, 6); ctx.clip(); ctx.drawImage(im, x + 5, y + 4, 113, 6); ctx.restore(); }
    if (u.shield > 0 && u.shieldMax) { ctx.fillStyle = '#ffd34a'; ctx.fillRect(x + 5, y + 14, 113 * Math.min(1, u.shield / u.shieldMax), 3); }
    return true;
  };

  // ---------------- 标题页「原著小说 / 编辑策划」：宣纸卷轴 ----------------
  window.R169_TITLEPAGE = function (P0, e, now) {
    if (!ok('paper_scroll')) return false;
    ctx.save(); ctx.fillStyle = `rgba(10,8,6,${.55 * e})`; ctx.fillRect(0, 0, W, H);
    const w = 880, h = Math.max(308, 200 + P0.lines.length * 42), x = W / 2 - w / 2, y = H / 2 - h / 2;
    ctx.globalAlpha = e; ctx.translate(W / 2, H / 2); ctx.scale(.94 + .06 * e, .94 + .06 * e); ctx.translate(-W / 2, -H / 2);
    part('paper_scroll', x, y, w, h);
    midText(P0.title, W / 2, y + 88, fitFont(P0.title, '#px ' + HEAD, 38, w - 240, 22), '#513a29');
    P0.lines.forEach((l, i) => { const hl = l.startsWith('!'), s = hl ? l.slice(1) : l; midText(s, W / 2, y + 146 + i * 42, fitFont(s, '#px ' + BODY, 24, w - 220, 15), hl ? '#a8382b' : '#513a29'); });
    ctx.globalAlpha = e * (.5 + .3 * Math.sin(now * 3)); midText('点击任意处返回', W / 2, y + h - 56, '18px ' + BODY, '#513a29');
    ctx.restore(); return true;
  };
})();
