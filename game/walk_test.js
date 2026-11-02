// ================= 测试版行走（R92 修长左向八帧）=================
// 测试面板「叶孤星 · 测试版行走」开关：打开后叶孤星往左 / 往右走用 Codex 新画的八帧（右边是左边镜像），
// 站着不动、往上下和斜向走仍用原来的 v2。开关记在本机，默认关。正式替换等作者看过再说。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const im = new Image(); let ok = false; im.onload = () => { ok = true; }; im.src = LOC ? 'walk_test/yegx_left8.webp' : '/_blob/8450f70bae3200dfa6da534a240bd015';
  let on = false, hits = 0; try { on = localStorage.getItem('walkTest8') === '1'; } catch (e) {}
  // 每格 224×240，腰在 x=112、脚底在 y=232；一轮 8 帧地面走 160px（1x）→ 每帧 20px，按游戏缩放和移速算出每帧时长，脚不打滑
  const wrap = () => { if (typeof WalkLab === 'undefined' || !WalkLab.draw) return setTimeout(wrap, 500);
    const od = WalkLab.draw;
    WalkLab.draw = function (c, id, kind, dir, phase, moving, x, y, height) {
      if (on && ok && moving && kind === 'guxing' && (dir === 'left' || dir === 'right')) {
        const sc = height / 224, spd = (typeof WALK_FINAL_SPEED !== 'undefined' ? WALK_FINAL_SPEED : 146), fd = 20 * sc / spd;
        const f = Math.floor(performance.now() / 1000 / fd) % 8;
        c.save(); c.translate(x, y); if (dir === 'right') c.scale(-1, 1); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
        c.drawImage(im, f * 224, 0, 224, 240, -112 * sc, -232 * sc, 224 * sc, 240 * sc); c.restore(); hits++; return { frame: f };
      }
      return od.apply(this, arguments);
    };
  };
  wrap();
  (function addBtn(n) {
    const pan = document.getElementById('dbgPanel'); if (!pan) { if ((n || 0) < 40) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
    const h = document.createElement('h4'); h.textContent = '叶孤星 · 测试版行走'; const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button'); const lab = () => { b.textContent = on ? '测试版行走：开（往左右走用新八帧）· 点一下关' : '测试版行走：关 · 点一下开'; }; lab();
    b.onclick = () => { on = !on; try { localStorage.setItem('walkTest8', on ? '1' : '0'); } catch (e) {} lab(); pan.hidden = true;
      try { toast(on ? '已换成测试版行走：往左、往右走看效果（上下和斜向还是原来的）' : '已换回原来的行走', 2600); } catch (e) {} };
    row.appendChild(b); pan.appendChild(h); pan.appendChild(row);
  })();
  window.WALK_TEST8 = { get on() { return on; }, get hits() { return hits; }, set(v) { on = !!v; try { localStorage.setItem('walkTest8', on ? '1' : '0'); } catch (e) {} } };
})();
