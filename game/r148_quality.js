// ================= R148 · 自动画质（作者 11-07：手机上玩画质没电脑好）=================
// 平时一律按 2 倍清晰度画（手机以前封顶 1.5，放大到 3 倍屏就糊）。
// 掉帧时（多半是大招最华丽的那几秒）临时降到 1.5 / 1.25 倍，画面只是略软、不会卡；流畅一阵后自动升回 2 倍。
// 判断用最近帧的平均耗时，和这台设备自己的最好帧率比：明显变慢（慢于 30ms，且比基准慢一半）连续 0.5 秒降一档；
// 接近基准连续 3 秒升一档；每次调整后 1.2 秒内不再动。省电模式锁 30 帧的手机不会被误判成卡。
// 刚升档就又卡（6 秒内）→ 下次升档要等的流畅时间翻倍（最多 60 秒），稳定一分钟后复原，免得在临界点来回跳。
(function () {
  if (typeof resize !== 'function') return;
  const STEPS = [2, 1.5, 1.25];
  let lv = 0, ema = 16.7, last = 0, slowT = 0, fastT = 0, hold = 0, upWait = 3, lastUp = -1e9, clock = 0, base = 16.7;
  hold = 5;   // 刚启动的几秒在加载素材，帧慢不算卡
  window.DPR_CAP = STEPS[0];
  const set = i => { if (i === lv) return;
    if (i > lv && clock - lastUp < 6) upWait = Math.min(60, upWait * 2);   // 刚升上去就又卡 → 下次要流畅更久才升（防止来回跳）
    if (i < lv) lastUp = clock;
    lv = i; window.DPR_CAP = STEPS[i]; try { resize(); } catch (e) {} hold = 1.2; slowT = fastT = 0; };
  function tick(t) {
    if (last) {
      const dt = Math.min(250, t - last);
      if (document.visibilityState === 'visible' && dt > 0) {
        ema = ema * .85 + dt * .15; const s = dt / 1000; clock += s;
        if (clock - lastUp > 60) upWait = 3;   // 稳定一分钟，恢复正常升档速度
        base = Math.min(base + s * .05, ema);   // 屏幕本身的刷新上限（60Hz≈16.7ms；省电模式锁 30 帧≈33ms）：取跑得最快时的帧间隔，只极慢地回调，不跟着降档变
        const SLOW = Math.max(30, base * 1.5), FAST = Math.max(19, base * 1.15);
        let loading = false; try { loading = !!(window.MAP_LOADING && MAP_LOADING()) || !S.started; } catch (e) {}
        if (loading) { hold = Math.max(hold, 1.5); ema = Math.min(ema, base * 1.2); }   // 切地图 / 标题加载时不判断
        if (hold > 0) hold -= s;
        else if (ema > SLOW) { fastT = 0; slowT += s; if (slowT > .5 && lv < STEPS.length - 1) set(lv + 1); }
        else if (ema < FAST) { slowT = 0; fastT += s; if (fastT > upWait && lv > 0) set(lv - 1); }
        else { slowT = Math.max(0, slowT - s); fastT = Math.max(0, fastT - s); }
      }
    }
    last = t; requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => { last = 0; });   // 切到后台回来，别把那一段空白当成卡顿
  window.GX_QUALITY = { get level() { return STEPS[lv]; }, get frameMs() { return +ema.toFixed(1); }, force(i) { set(Math.max(0, Math.min(STEPS.length - 1, i))); } };
  try { resize(); } catch (e) {}
})();
