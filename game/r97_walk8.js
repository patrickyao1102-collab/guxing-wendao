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
  const wrap = () => { if (typeof WalkLab === 'undefined' || !WalkLab.draw) return setTimeout(wrap, 300);
    const od = WalkLab.draw;
    WalkLab.draw = function (c, id, kind, dir, phase, moving, x, y, height) {
      const r = ROW[dir];
      if (on && ok && kind === 'guxing' && r) {
        const now = performance.now();
        if (moving && (!wasMoving || now - lastCall > 300)) t0 = now;   // 起步从第 1 帧开始；转向不重置
        wasMoving = !!moving; lastCall = now;
        const f = moving ? Math.floor((now - t0) / FRAME_MS) % 8 : 8;
        const sc = 0.44 * height / 95;
        c.save(); c.translate(x, y); if (r[1]) c.scale(-1, 1); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
        c.drawImage(im, f * 224, r[0] * 240, 224, 240, -112 * sc, -232 * sc, 224 * sc, 240 * sc); c.restore(); hits++;
        return { frame: f };
      }
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
  window.WALK8 = { get on() { return on && ok; }, get hits() { return hits; }, set(v) { on = !!v; try { localStorage.setItem('walk8', on ? '1' : '0'); } catch (e) {} } };
})();
