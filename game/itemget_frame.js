// ================= 作者 11-07：获得物品框换成 Codex 定稿「素白 A·题签下落款孤星问道」（原暖绢旧金，拆件尺寸坐标完全一致，只换图和字色）=================
// 拆件（2x 透明 PNG→webp）在 igf/；框顶 / 可平铺中段 / 框底 / 奖励条 / 星芒分隔 / 按钮按 layout.json 拼，1~6 行纵向拉长，
// 图标、名称、数量、按钮字由代码画。原来的 itemGet 调用链（音效、点击关闭）不动，只换掉画面。
(function () {
  if (typeof window.itemGet !== 'function' || !S || !S.overlay) return;
  const K = ['frame_top', 'frame_body_tile', 'frame_bottom', 'reward_row', 'divider_star_cloud', 'button_normal', 'button_pressed'], A = {};
  let ready = 0;
  K.forEach(k => { const im = new Image(); im.onload = () => { A[k] = im; ready++; }; im.src = 'igf2/' + k + '.webp'; });

  // 记录当前弹窗（最外层包一层，原链照走）
  let MY = null;
  window.itemGet = (o => function (items, title) {
    const p = o.apply(this, arguments), me = { items: items || [], title: title || '获得物品', t0: performance.now() }; MY = me;
    Promise.resolve(p).then(() => { if (MY === me) MY = null; });
    return p;
  })(window.itemGet);

  const drawIcon = (k, x, y, s) => {
    if (k && /^item:/.test(k)) { itemIcon(k.slice(5), x, y, s * .46); return; }
    if (k && IMG[k]) { const im = IMG[k], iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, r = Math.min(s / iw, s / ih); ctx.drawImage(im, x - iw * r / 2, y - ih * r / 2, iw * r, ih * r); return; }
    ctx.save(); ctx.translate(x, y); const z = s / 68; ctx.scale(z, z);
    if (k === 'gold') { for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#c9a23a', '#e8c35a', '#ffe08a'][i]; ctx.beginPath(); ctx.ellipse(-8 + i * 8, 10 - i * 9, 20, 9, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#7a5a10'; ctx.lineWidth = 2; ctx.stroke(); } }
    else { const g = ctx.createRadialGradient(-6, -6, 2, 0, 0, 22); g.addColorStop(0, '#fff'); g.addColorStop(.4, '#ff9a8a'); g.addColorStop(1, '#a8322a'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 20, 0, 7); ctx.fill(); }
    ctx.restore();
  };
  const ell = (t, max) => { t = String(t || ''); if (ctx.measureText(t).width <= max) return t; const c = [...t]; while (c.length && ctx.measureText(c.join('') + '…').width > max) c.pop(); return c.join('') + '…'; };
  const cnt = c => { if (c == null || c === '') return '×1'; c = String(c).trim(); return /^[×xX*]/.test(c) ? '×' + c.replace(/^[×xX*]\s*/, '') : /^\d+$/.test(c) ? '×' + c : c; };

  function draw() {
    const now = performance.now(), t = (now - MY.t0) / 1000, k = Math.min(1, t / .22), ek = 1 - Math.pow(1 - k, 3);
    const items = MY.items.slice(0, 6), n = Math.max(1, items.length);
    const w = 928, h = 424 + 232 * n, margin = 24, cx = W / 2, cy = H / 2;
    const fit = Math.min(1, (W - 2 * margin) / (w / 2), 2 * Math.min(cy - margin, H - margin - cy) / (h / 2));
    const sc = fit / 2 * (.94 + .06 * ek), bodyH = 232 * n - 40, bottomY = 274 + bodyH;
    ctx.save();
    ctx.globalAlpha = k * .55; ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = k;
    ctx.translate(cx, cy + (1 - ek) * 18); ctx.scale(sc, sc); ctx.translate(-w / 2, -h / 2);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(A.frame_top, 0, 0, 928, 274);
    for (let y = 0; y < bodyH; y += 232) { const hh = Math.min(232, bodyH - y); ctx.drawImage(A.frame_body_tile, 0, 0, 928, hh, 0, 274 + y, 928, hh); }
    ctx.drawImage(A.frame_bottom, 0, bottomY, 928, 190);
    for (let i = 0; i < n - 1; i++) ctx.drawImage(A.divider_star_cloud, 312, 472 + i * 232, 316, 42);
    items.forEach((it, i) => {
      const x = 84, y = 274 + i * 232, d = t - .12 - i * .12, a = Math.min(1, Math.max(0, d / .25));
      ctx.save(); ctx.globalAlpha = k * a;
      ctx.drawImage(A.reward_row, x, y, 792, 202);
      // 图标：淡金光晕 + 弹一下
      ctx.save(); ctx.beginPath(); ctx.rect(x + 24, y + 20, 164, 164); ctx.clip();
      const rg = ctx.createRadialGradient(x + 106, y + 102, 6, x + 106, y + 102, 96); rg.addColorStop(0, 'rgba(255,226,150,.38)'); rg.addColorStop(1, 'rgba(255,210,120,0)'); ctx.fillStyle = rg; ctx.fillRect(x + 24, y + 20, 164, 164);
      const pop = 1 + .22 * Math.max(0, 1 - d / .3); drawIcon(it.icon, x + 106, y + 102, 150 * pop); ctx.restore();
      ctx.fillStyle = '#594A35'; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
      const c = cnt(it.count); let cf = 50; ctx.font = `${cf}px ${FONT}`; while (cf > 30 && ctx.measureText(c).width > 120) { cf -= 4; ctx.font = `${cf}px ${FONT}`; }
      ctx.fillText(c, x + 742, y + 101); const cw = ctx.measureText(c).width;
      const maxN = Math.min(344, 742 - cw - 24 - 260);
      ctx.textAlign = 'left'; let nf = 58; ctx.font = `${nf}px ${BRUSH}`; while (nf > 40 && ctx.measureText(String(it.name)).width > maxN) { nf -= 4; ctx.font = `${nf}px ${BRUSH}`; }
      const desc = it.desc ? String(it.desc) : '';
      ctx.fillText(ell(it.name, maxN), x + 260, y + (desc ? 82 : 101));
      if (desc) { ctx.font = `500 28px ${FONT}`; ctx.fillStyle = 'rgba(89,74,53,.78)'; ctx.fillText(ell(desc, 742 - 260), x + 262, y + 142); }
      ctx.restore();
    });
    const bx = 236, by = bottomY + 40, pressed = t > .6 && input && input.down;
    ctx.drawImage(pressed ? A.button_pressed : A.button_normal, bx, by, 458, 126);
    ctx.font = `64px ${BRUSH}`; ctx.fillStyle = pressed ? '#463A2B' : '#594A35'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (t > .6) ctx.globalAlpha = k * (.82 + .18 * Math.sin(now / 220));
    ctx.fillText('收下', bx + 229, by + 63);
    ctx.restore();
  }

  // 换掉原来那块 overlay 的画法（资源没载完前仍用旧框兜底）
  const hook = () => {
    const ov = S.overlay.find(o => o && o.draw && /IG\.items/.test(String(o.draw)));
    if (!ov) return false;
    const old = ov.draw;
    ov.draw = function () { if (MY && ready === K.length) { try { return draw(); } catch (e) { console.warn('itemget_frame', e); } } return old.apply(this, arguments); };
    return true;
  };
  if (!hook()) { let tries = 0; const iv = setInterval(() => { if (hook() || ++tries > 40) clearInterval(iv); }, 250); }
  window.ITEMGET_FRAME = { test: () => itemGet([{ icon: 'ic_hanxing', name: '寒星剑', count: '×1', desc: '溪边岩隙里沉睡多年的寒剑。' }, { icon: 'pill', name: '回春丹', count: '×2' }, { icon: 'gold', name: '灵石', count: '×80' }]) };
})();


