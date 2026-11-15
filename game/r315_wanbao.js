// ================= R315 · 万宝楼的赝品：后院库房三处现场跟着现在的库房图走 =================
// 作者 11-16：「万宝楼支线不对，进入库房以后，那个探索和现有界面对不上，请你重新设计」。
// 库房早就换成了 R219 的新图（鉴宝案上开着剑匣，剑躺在匣里；出入簿挂在两排货架中间的墙上），
// 可三处现场的话还是照旧图写的（「铜锁锃亮的长匣」「案上横着一柄古剑」），点的位置也离东西很远。改成：
//  · 三处点的位置贴着画面里的东西：剑匣在鉴宝案前左，剑在鉴宝案前右，出入簿在墙下；
//  · 点开时把那件东西放大给你看（剑匣连剑、剑、出入簿翻开的那一页），话照着画面改；
//  · 出入簿用《名录》账册那套翻开的书页，竖排从右往左写，近十天三行、上个月一排「秦 · 复验」。只进测试版。
(function () {
  const T = typeof TMAPS !== 'undefined' && TMAPS.xt_wanbao_store; if (!T || typeof say !== 'function') return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const by = n => (T.npcs || []).find(x => x.name === n);
  const put = (n, x, y) => { const s = by(n); if (s) { const [c, r] = P(x, y); s.c = c; s.r = r; } return s; };
  const CASE = 'r219c_xt_wanbao_store_sword_case', SWORD = 'r219c_xt_wanbao_store_fake_sword', BOOK = 'r297_ledger';
  try { if (!IMG[BOOK]) { const im = new Image(); im.onload = () => { try { IMG[BOOK] = im; } catch (e) {} }; im.src = 'r297/ledger_ui.webp'; } } catch (e) {}
  // 画面里的话，照新图改几句
  const FIX = [['乌木长匣，三道铜锁。', '乌木长匣就开在鉴宝案上，三道铜锁还挂在匣沿。'], ['一只乌木长匣，铜锁锃亮。', '鉴宝案上开着一只乌木长匣，铜锁锃亮，匣里躺着一柄剑。'],
    ['案上横着一柄古剑。', '剑匣里躺着一柄古剑。'], ['墙上挂着一本出入簿。', '两排货架中间的墙上，挂着一本出入簿。'], ['匣盖的封条是揭开后又原样贴回去的', '匣盖内沿那道封条，是揭开后又原样贴回去的']];
  const fix = t => { if (typeof t !== 'string') return t; for (const [a, b] of FIX) t = t.split(a).join(b); return t; };
  // 放大看：剑匣（连剑）、剑、出入簿
  const card = (draw) => ({ draw() { try { ctx.save(); ctx.fillStyle = 'rgba(8,6,4,.66)'; ctx.fillRect(0, 0, W, H);
    const x0 = W * .12, y0 = H * .05, w = W * .76, h = H * .64; ctx.fillStyle = '#241a12'; ctx.strokeStyle = '#c9a25a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y0, w, h, 14) : ctx.rect(x0, y0, w, h); ctx.fill(); ctx.stroke(); draw(x0, y0, w, h); ctx.restore(); } catch (e) {} } });
  const fit = (im, x0, y0, w, h, pad) => { const s = Math.min((w - pad * 2) / im.width, (h - pad * 2) / im.height); return [s, x0 + (w - im.width * s) / 2, y0 + (h - im.height * s) / 2]; };
  const VIEW = {
    剑匣: card((x0, y0, w, h) => { const c = IMG[CASE], s = IMG[SWORD]; if (!c) return; ctx.imageSmoothingQuality = 'high'; const [k, x, y] = fit(c, x0, y0, w, h, 40); ctx.drawImage(c, x, y, c.width * k, c.height * k);
      if (s) ctx.drawImage(s, x + 39 / 380 * c.width * k, y + 54 / 108 * c.height * k, 300 / 380 * c.width * k, 34 / 108 * c.height * k); }),
    匣中的剑: card((x0, y0, w, h) => { const s = IMG[SWORD]; if (!s) return; ctx.imageSmoothingQuality = 'high'; const [k, x, y] = fit(s, x0, y0, w, h * .7, 30); ctx.drawImage(s, x, y + h * .12, s.width * k, s.height * k);
      // 剑格内侧那几道新锉痕：一点亮光
      const gx = x + s.width * k * .2, gy = y + h * .12 + s.height * k * .5, t = performance.now() / 300; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,190,' + (.35 + .25 * Math.sin(t)) + ')';
      ctx.beginPath(); ctx.ellipse(gx, gy, 18, 10, 0, 0, 7); ctx.fill(); }),
    库房出入簿: { draw() { try { const im = IMG[BOOK]; ctx.save(); ctx.fillStyle = 'rgba(8,6,4,.66)'; ctx.fillRect(0, 0, W, H); if (!im) { ctx.restore(); return; }
      const sc = Math.min(W / 1536, H * .74 / 1024), bx = (W - 1536 * sc) / 2, by0 = H * .01; ctx.drawImage(im, bx, by0, 1536 * sc, 1024 * sc);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3dca6'; ctx.font = '700 ' + Math.round(34 * sc) + 'px ' + FONT; ctx.fillText('库房出入簿', bx + 768 * sc, by0 + 140 * sc);
      const col = (t, cx, red) => { ctx.fillStyle = red ? '#9a1c12' : '#2a1a0e'; ctx.font = '600 ' + Math.round(32 * sc) + 'px ' + FONT; let y = 300; for (const ch of t) { if (ch === ' ') { y += 14; continue; } ctx.fillText(ch === '·' ? '・' : ch, bx + cx * sc, by0 + y * sc); y += ch === '·' ? 30 : 40; } };
      // 右页（这个月，从右往左）：近十天只有三行
      ['本　月', '初七 · 小伍 · 值夜', '初八 · 掌柜 · 盘库', '初九 · 小伍 · 值夜'].forEach((t, i) => col(t, 1290 - i * 76, i === 0));
      // 左页（上个月）：隔一天就是一行「秦 · 复验」，到月底忽然没了
      ['上　月', '十三 · 秦 · 复验', '十五 · 秦 · 复验', '十七 · 秦 · 复验', '十九 · 秦 · 复验', '廿一 · 秦 · 复验'].forEach((t, i) => col(t, 680 - i * 76, i === 0));
      ctx.restore(); } catch (e) {} } },
  };
  const wrap = (name, x, y) => { const s = put(name, x, y); if (!s || s._r315) return; s._r315 = 1; const orig = s.talk;
    s.talk = async function (a) { const o = VIEW[name], sv = window.say, h0 = S.hud; for (const v of Object.values(VIEW)) { const j = S.overlay.indexOf(v); if (j >= 0) S.overlay.splice(j, 1); } if (o) S.overlay.push(o); S.hud = false;
      window.say = function (w, t) { return sv.call(this, w, fix(t)); };
      try { if (typeof orig === 'function') return await orig.call(this, a); for (const l of [].concat(orig || [])) await sv(name, fix(l)); }
      finally { window.say = sv; const i = S.overlay.indexOf(o); if (i >= 0) S.overlay.splice(i, 1); S.hud = h0; } }; };
  wrap('剑匣', 660, 792); wrap('匣中的剑', 880, 792); wrap('库房出入簿', 807, 436);
})();
