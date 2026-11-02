// ================= R92 叶孤星新八向行走（Codex 最初四向版 + 斜下第4帧摆臂衔接，160ms）=================
// 五个方向各 8 帧 + 1 张停步：下 / 左下 / 左 / 左上 / 上；右、右下、右上用镜像。
// 每格 224×240，脚底在 (112,232)；人物倍率按 Codex 实测 0.44（绘制高度 95 时）。整帧统一 160ms，一轮 1.28 秒。
// 默认开；测试面板「叶孤星 · 新八向行走」可关掉换回原来的走路图。只换叶孤星，云霆、林雪不变。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const im = new Image(); let ok = false; im.onload = () => { ok = true; }; im.src = LOC ? 'walk8/yegx_walk8.webp' : '/_blob/5a332df968af88119ab41a77711c40e7';
  let on = true, hits = 0; try { on = localStorage.getItem('walk8') !== '0'; } catch (e) {}
  const ROW = { down: [0, 0], down_left: [1, 0], left: [2, 0], up_left: [3, 0], up: [4, 0], right: [2, 1], down_right: [1, 1], up_right: [3, 1] };
  const FRAME_MS = 160;
  let t0 = 0, wasMoving = false, lastCall = 0;
  function raw(c, dir, moving, x, y, height) {
    const r = ROW[dir] || ROW.down, now = performance.now();
    if (moving && (!wasMoving || now - lastCall > 300)) t0 = now;   // 起步从第 1 帧开始；转向不重置
    wasMoving = !!moving; lastCall = now;
    const f = moving ? Math.floor((now - t0) / FRAME_MS) % 8 : 8;
    const sc = 0.44 * height / 95;
    c.save(); c.translate(x, y); if (r[1]) c.scale(-1, 1); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(im, f * 224, r[0] * 240, 224, 240, -112 * sc, -232 * sc, 224 * sc, 240 * sc); c.restore(); hits++;
    return { frame: f };
  }
  const wrap = () => { if (typeof WalkLab === 'undefined' || !WalkLab.draw) return setTimeout(wrap, 300);
    const od = WalkLab.draw;
    WalkLab.draw = function (c, id, kind, dir, phase, moving, x, y, height) {
      if (on && ok && kind === 'guxing' && ROW[dir]) return raw(c, dir, moving, x, y, height);
      return od.apply(this, arguments);
    };
  };
  wrap();
  (function addBtn(n) {
    const pan = document.getElementById('dbgPanel'); if (!pan) { if ((n || 0) < 40) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
    const h = document.createElement('h4'); h.textContent = '叶孤星 · 新八向行走'; const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button'); const lab = () => { b.textContent = on ? '新八向行走：开 · 点一下换回原来的' : '新八向行走：关（原来的走路图）· 点一下开'; }; lab();
    b.onclick = () => { on = !on; try { localStorage.setItem('walk8', on ? '1' : '0'); } catch (e) {} lab(); pan.hidden = true;
      try { toast(on ? '已换成新八向行走' : '已换回原来的走路图', 2200); } catch (e) {} };
    row.appendChild(b);
    // 测试面板每次打开整块重画（innerHTML），按钮被冲掉就放回最上面
    const put = () => { if (!pan.contains(row)) { lab(); pan.prepend(h, row); } };
    put(); new MutationObserver(put).observe(pan, { childList: true });
  })();
  // 行囊「换装」页加切换：新版八向 / 原版行走（作者 11-03：给叶孤星设置一个切换行走）
  const setOn = v => { on = !!v; try { localStorage.setItem('walk8', on ? '1' : '0'); } catch (e) {} };
  (function addMenu(n) {
    if (typeof drawQuest !== 'function' || typeof menuUpdate !== 'function' || typeof MTABS === 'undefined' || !MTABS.includes('换装')) { if ((n || 0) < 60) setTimeout(() => addMenu((n || 0) + 1), 500); return; }
    const isTab = () => S.menu && MTABS[S.menu.tab] === '换装';
    const G = B => { const y = B.y + 268; return { y, a: { x: B.x + 14, y: y + 26, w: 150, h: 52 }, b: { x: B.x + 174, y: y + 26, w: 150, h: 52 } }; };
    drawQuest = (orig => function (B) { const r = orig.apply(this, arguments); if (!isTab()) return r;
      const g = G(B); ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = `600 17px ${FONT}`; ctx.fillStyle = UI.text; ctx.fillText('行走动作', B.x + 18, g.y + 8);
      for (const [rc, lab, sel] of [[g.a, '新版八向', on], [g.b, '原版行走', !on]]) {
        roundRect(rc.x, rc.y, rc.w, rc.h, 12); ctx.fillStyle = sel ? 'rgba(142,42,28,.32)' : UI.slot; ctx.fill(); ctx.lineWidth = sel ? 2.5 : 1; ctx.strokeStyle = sel ? UI.gold2 : UI.line; ctx.stroke();
        ctx.textAlign = 'center'; ctx.font = `600 17px ${FONT}`; ctx.fillStyle = sel ? (UI.gold2 || '#ffe08a') : UI.text; ctx.fillText(lab, rc.x + rc.w / 2, rc.y + rc.h / 2 + 1); }
      ctx.restore(); return r; })(drawQuest);
    menuUpdate = (orig => function () { const t = input.tapped;
      if (isTab() && t && !t.key) { const g = G(menuLayout().body); const ia = inR(t, g.a), ib = inR(t, g.b);
        if (ia || ib) { consumeTap(); setOn(ia); try { playSnd('ui_click'); } catch (e) {} try { toast(ia ? '叶孤星行走：新版八向' : '叶孤星行走：原版', 1400); } catch (e) {} return; } }
      return orig.apply(this, arguments); })(menuUpdate);
  })();
  window.WALK8 = { get on() { return on && ok; }, get ready() { return ok; }, drawRaw: raw, get hits() { return hits; }, set(v) { on = !!v; try { localStorage.setItem('walk8', on ? '1' : '0'); } catch (e) {} } };
})();
