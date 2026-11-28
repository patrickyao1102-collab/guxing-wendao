// ================= R458 · 万妖塔进图首领预告（Codex R450，只进测试版）=================
// 作者 11-28 08:32：「一进地图，镜头切到首领那里，炫一下：光柱、龙卷、闪电，首领立绘一闪——然后又消失，镜头回到人物。」
//   「开场那一下炫酷一点……跟后面现身最好用两段不一样的动画。」「每个人的出场方式可能都不一样」
// 做法：每层头一回进来（入口那段旁白说完、能走了之后），整屏放 Codex 合成好的 4 秒预告（首领台、首领一闪、立绘、镜头回人物）。
//   首领台本身照旧空着，走到跟前另放「现身」（R445 / R455）。点一下屏幕可以跳过。看过记在存档里，不再重放；测试面板可以重看。
//   声音先用现成音效垫着（炉爆、风、冰），绛蘅的笑声和台词、白虎的吼、龙吟等小云雀做好再换。
(function () {
  const F = () => (S.flags || (S.flags = {}));
  const floorOf = m => { const r = /^wyt_f(\d)/.exec(m || ''); return r ? +r[1] : 0; };
  // 对点的声音：[秒, 音效, 音量]
  const CUE = {
    1: [[.27, 'sfx_wind', .35], [1.1, 'sfx_vine', .45], [1.9, 'sfx_star', .5]],
    2: [[.2, 'sfx_wind', .6], [1.6, 'sfx_hit_heavy', .9], [1.62, 'sfx_wind', .7], [3.03, 'sfx_sword_ring', .8]],
    3: [[.3, 'sfx_wind', .45], [1.9, 'sfx_ice', .45], [3.13, 'sfx_ice', .7]],
    4: [[.9, 'sfx_boom', .45], [1.33, 'sfx_boom', .6], [1.77, 'sfx_boom', .75], [2.2, 'sfx_boom', 1]],
  };
  let busy = false;
  async function play(n) {
    if (busy) return; busy = true;
    const v = document.createElement('video'); const mp4 = v.canPlayType('video/mp4; codecs="avc1.42E01E"'); v.src = 'r458/teaser_' + n + (mp4 ? '.mp4' : '.webm') + '?v=1';   // 认不了 H.264 的浏览器换 webm v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
    const lock0 = world.locked, hud0 = S.hud; world.locked = true; if (world.player) world.player.moving = false; world.path = null;
    const o = { t: 0, a: 0 }; let started = false, done = false, skip = false;
    o.draw = () => { ctx.save(); ctx.fillStyle = '#000'; ctx.globalAlpha = Math.min(1, o.a); ctx.fillRect(0, 0, W, H);
      if (started && v.readyState >= 2) { ctx.globalAlpha = Math.min(1, o.a); ctx.drawImage(v, 0, 0, W, H); }
      ctx.restore(); };
    try {
      await fadeOut(260); S.hud = false; S.overlay.push(o); o.a = 1; await fadeIn(1);
      await new Promise(res => { const to = setTimeout(res, 4000); v.addEventListener('canplay', () => { clearTimeout(to); res(); }, { once: true }); v.load(); });
      try { await v.play(); started = true; } catch (e) { started = false; }
      if (started) {
        const t0 = performance.now(), cues = (CUE[n] || []).slice();
        input.tapped = null;
        while (!done) { const t = v.currentTime; while (cues.length && t >= cues[0][0]) { const [, s, vol] = cues.shift(); try { playSnd(s, vol); } catch (e) {} }
          if (t >= 2.0 && t < 2.05 && n === 2) S.shake = 14;
          if (input.tapped) { input.tapped = null; if (performance.now() - t0 > 400) skip = true; }
          if (v.ended || skip || performance.now() - t0 > 6500) done = true; await nextFrame(); }
      }
      await fadeOut(200);
    } catch (e) { console.warn('R458 teaser', e); }
    finally { const i = S.overlay.indexOf(o); if (i >= 0) S.overlay.splice(i, 1); try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} S.hud = hud0; world.locked = lock0; busy = false; await fadeIn(300); }
  }
  // 头一回进这一层：等能走了再放
  updateMap = (orig => function (dt) { const r = orig.apply(this, arguments);
    try { const n = floorOf(world.mapName); if (!n || busy || !CUE[n]) return r; const k = 'tw_teaser_' + n; if (F()[k]) return r;
      if (world.locked || dialog || choice || (typeof sysPanel !== 'undefined' && sysPanel) || (typeof battle !== 'undefined' && battle) || S.fade > .05) return r;
      if (window.MAP_LOADING && MAP_LOADING()) return r;
      F()[k] = 1; play(n); } catch (e) {} return r; })(updateMap);
  // 测试面板：重看预告
  try { const add = () => { const p = document.getElementById('dbgPanel'); if (!p || p.querySelector('[data-r458]')) return; const h = document.createElement('h4'); h.textContent = '11-28 新加 · 万妖塔进图首领预告（点屏幕可跳过）'; h.setAttribute('data-r458', '1');
      const row = document.createElement('div'); row.className = 'row';
      [['绛蘅', 1], ['玄锋', 2], ['霁月', 3], ['焚羽', 4]].forEach(([nm, n]) => { const b = document.createElement('button'); b.textContent = '预告 · ' + nm; b.onclick = () => { try { p.hidden = true; } catch (e) {} play(n); }; row.appendChild(b); });
      p.appendChild(h); p.appendChild(row); };
    if (document.getElementById('dbgPanel')) add(); else { const mo = new MutationObserver(() => { if (document.getElementById('dbgPanel')) { add(); mo.disconnect(); } }); mo.observe(document.documentElement, { childList: true, subtree: true }); } } catch (e) {}
  window.R458 = { play, get busy() { return busy; } };
})();
