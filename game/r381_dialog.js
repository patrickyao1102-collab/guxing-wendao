// ================= R381 · 对话框换成有材质的（Codex R381 拆件）（只进测试版）=================
// 作者 11-26 夜：「各种框，感觉游戏感也不足」；11-27 凌晨点名要看的方向里有「对话框」。
// 原来的对话框是代码画的：一块深色圆角矩形、一圈细金线、一个红色圆角矩形当名牌。能用，但没有材质。
// Codex 做了两个方向：A「乌木描金」（乌木板、嵌金线、四角回纹、靛蓝织物名签，浅色字）；B「展卷」（宣纸卷、两端木轴、墨色字）。
// 默认用 A（Codex 和我都推荐：浅色铺地上压得住，和选项卷轴同屏时分得清）。测试面板里可以换成 B 或者切回原来的。
// 只换画法：立绘、台词、名字、每行多少字、点哪里继续，全都和原来一样。
(function () {
  if (typeof drawDialog !== 'function' || typeof ease !== 'function' || typeof wrapText !== 'function') return;
  const KEY = 'r381_dlg'; let MODE = 'a'; try { const v = localStorage.getItem(KEY); if (v === 'a' || v === 'b' || v === 'off') MODE = v; } catch (e) {}
  const N = ['dlg_box', 'dlg_name', 'dlg_ff', 'dlg_ff_on', 'dlg_next_1', 'dlg_next_2', 'dlg_next_3', 'dlg_next_4'], A = { a: {}, b: {} }, started = {};
  // 开机头几秒游戏在排队载大图，这时候要的小图有时会石沉大海——所以没到齐就隔几秒再要一次
  function load(v) { const now = performance.now(); if (started[v] && now - started[v] < 12000) return; started[v] = now; for (const n of N) { if (A[v][n]) continue; const im = new Image(); im.onload = () => { A[v][n] = im; }; im.src = 'r381/' + v + '_' + n + '.webp?v=1'; } }
  const ok = v => !!A[v] && N.every(n => A[v][n]);
  const CFG = { a: { text: '#F4E9D3', narr: '#E6D9BE', name: '#F5E7BF', ff: '#EBDDBC', ffOn: '#FFE9A8' }, b: { text: '#2E2218', narr: '#4A3A2A', name: '#35261A', ff: '#3A2A1C', ffOn: '#8C2F22' } };
  if (MODE !== 'off') { let n = 0; const iv = setInterval(() => { if (ok(MODE) || MODE === 'off' || ++n > 30) return clearInterval(iv); load(MODE); }, 3000); }
  // 九宫（只横向拉：名签）
  function nineH(im, x, y, w, h, cap) { const sw = im.width, sh = im.height, sc = cap * 2; ctx.drawImage(im, 0, 0, sc, sh, x, y, cap, h); ctx.drawImage(im, sc, 0, sw - sc * 2, sh, x + cap, y, w - cap * 2, h); ctx.drawImage(im, sw - sc, 0, sc, sh, x + w - cap, y, cap, h); }
  // 让原来那套「画了等于没画」，顺便知道它这一帧到底要不要画对话框（回忆演出时它不画）
  let reached = false; const SENT = { get slide() { reached = true; return 0; }, text: '', shown: 0, who: '', p: null };
  function draw(d) { const V = A[MODE], C = CFG[MODE], k = ease(d.slide), bx = 36, bw = W - 72, bh = 176, by = H - bh - 18 + (1 - k) * 40, now = performance.now();
    const cgOn = !!(window.CG_ON && CG_ON()), hasP = !cgOn && d.p && has(d.p);
    if (hasP) { const im = IMG[d.p], ph = 540, pw = ph * im.width / im.height; ctx.save(); ctx.globalAlpha = k; ctx.drawImage(im, lerp(-pw, -10, k), H - ph + 6, pw, ph); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.5); ctx.drawImage(V.dlg_box, bx, by, bw, bh);
    const tx = hasP ? 400 : 84;
    if (d.who) { ctx.font = `34px ${BRUSH}`; const tw = ctx.measureText(d.who).width, nw = Math.max(140, Math.round(tw + 64)), nx = tx - 20; nineH(V.dlg_name, nx, by - 25, nw, 48, 26);
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; if (MODE === 'a') { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1; } ctx.fillStyle = C.name; ctx.fillText(d.who, nx + nw / 2 + (MODE === 'b' ? 4 : 0), by + 1); ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
    ctx.font = `600 29px ${FONT}`; ctx.fillStyle = d.who ? C.text : C.narr; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    const all = [...d.text], shown = all.slice(0, Math.floor(d.shown)).join(''); wrapText(shown, bw - (tx - bx) - 60).slice(0, 3).forEach((l, i) => ctx.fillText(l, tx, by + 40 + i * 42));
    if (d.shown >= all.length) { const f = V['dlg_next_' + (1 + Math.floor(now / 160) % 4)], b = Math.sin(now / 180) * 3; ctx.drawImage(f, bx + bw - 86, by + bh - 62 + b, 44, 44); }
    ctx.restore(); }
  drawDialog = (o => function () {
    const d = dialog; if (!d || d === SENT || MODE === 'off') return o.apply(this, arguments);
    if (!ok(MODE)) { load(MODE); return o.apply(this, arguments); }
    const g0 = UI.grainA; reached = false; dialog = SENT; UI.grainA = 0; try { o.apply(this, arguments); } finally { dialog = d; UI.grainA = g0; }
    if (!reached) return;
    try { draw(d); ffChip(); } catch (e) { console.warn('R381', e); } })(drawDialog);
  // 「快进」小签：底换成 Codex 的件（字还是游戏写）。R379 那边看到这个标记就不再自己写字。
  const FFR = { x: 1086, y: 480, w: 150, h: 40 };
  function ffChip() { if (!window.R379 || (typeof choice !== 'undefined' && choice) || (typeof sysPanel !== 'undefined' && sysPanel)) return; const V = A[MODE], C = CFG[MODE], on = !!R379.ff, now = performance.now();
    ctx.save(); ctx.globalAlpha = on ? .86 + Math.sin(now / 170) * .14 : .94; ctx.drawImage(on ? V.dlg_ff_on : V.dlg_ff, FFR.x, FFR.y, FFR.w, FFR.h);
    ctx.font = `600 17px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = on ? C.ffOn : C.ff; ctx.fillText(on ? '快进中 · 点一下停' : '快进 ▶▶', FFR.x + FFR.w / 2 + (MODE === 'b' ? 4 : 0), FFR.y + FFR.h / 2 + 1); ctx.restore(); }
  Object.defineProperty(window, 'R381_FF', { get() { return MODE !== 'off' && ok(MODE); } });
  window.R381 = { get mode() { return MODE; }, set(v) { MODE = v === 'b' ? 'b' : v === 'off' ? 'off' : 'a'; try { localStorage.setItem(KEY, MODE); } catch (e) {} if (MODE !== 'off') load(MODE); }, ready: () => MODE === 'off' || ok(MODE) };
  // 测试面板
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r381]')) return; const h = document.createElement('h4'); h.textContent = '11-27 新加 · 对话框（R381）'; h.setAttribute('data-r381', '1');
      const row = document.createElement('div'); row.className = 'row'; const b = document.createElement('button'); const NAME = { a: '乌木描金', b: '展卷（宣纸）', off: '原来的' }, NEXT = { a: 'b', b: 'off', off: 'a' };
      const lab = () => { b.textContent = '对话框：' + NAME[MODE] + '（点一下换成「' + NAME[NEXT[MODE]] + '」）'; }; lab(); b.onclick = () => { R381.set(NEXT[MODE]); lab(); }; row.appendChild(b);
      const anchor = p.querySelector('[data-r379]'); if (anchor) { p.insertBefore(row, anchor); p.insertBefore(h, row); } else { p.appendChild(h); p.appendChild(row); } };
    if (document.getElementById('dbgPanel')) add(); else { const mo = new MutationObserver(() => { if (document.getElementById('dbgPanel')) { add(); mo.disconnect(); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}
})();
