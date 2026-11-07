// ================= R161 · 天剑山门 · 月白凤首箜篌可以弹（作者 11-08）=================
// 点一下东庭那架月白凤首箜篌（不用走过去，那片是景观草地），就拨响它：放一段箜篌曲（配乐库「神殿·空灵飘渺」：箜篌、竹笛、风铃），
// 树冠和琴弦的辉光跟着亮起来、随弦颤动；走开（离开这张图）或曲子放完一段（约 40 秒）后，换回本图配乐。
// 以后 Codex 交了箜篌拨弦多帧动画，在这里接上。
(function () {
  if (typeof tileUpdate !== 'function') return;
  const HX = 2995, HY = 400, HW = 230, HH = 330, TRACK = 'lib_xyq_nwg02', DUR = 10000;   // 作者 11-08：最多奏 10 秒，然后接回本图配乐
  const LINES = ['指尖拂过琴弦，清越的弦音在云海间荡开。', '弦音如水，连树冠上的灵光都跟着轻轻颤动。', '月白凤首箜篌——据说是天剑宗某位祖师从云海里捞上来的。弹得好不好，只有云知道。'];
  let n = 0, endT = 0, busy = false;
  // 作者 11-08：先对话，让玩家自己选要不要弹
  async function play() {
    if (busy || endT) return; busy = true; world.locked = true;
    try {
      await say('', '东庭的云纹石台上，横着一架月白凤首箜篌，琴弦在风里微微发亮。');
      const c = await choose('要拨弦弹一曲吗？', ['拨弦弹一曲', '不了，看看就好']);
      if (c !== 0) return;
      window.KONGHOU_T0 = performance.now(); window.KONGHOU_UNTIL = performance.now() + DUR; endT = window.KONGHOU_UNTIL;
      try { if (window.BGM29) BGM29.audition(TRACK); } catch (e) {}
      try { S.flash = .25; S.flashColor = '#dff3ff'; } catch (e) {}
      await say('', LINES[n++ % LINES.length]);
    } finally { world.locked = false; busy = false; }
  }
  let hinted = '';
  setInterval(() => { try { const p = world.player; if (world.mapName === 'tj_shanmen' && p && hinted !== 'y' && Math.hypot(p.x - HX, p.y - HY) < 900 && !world.locked && !dialog) { hinted = 'y'; toast('东庭有一架月白箜篌，点它可以弹奏', 2600); } } catch (e) {} }, 700);
  setInterval(() => { try { if (!endT) return; if (world.mapName !== 'tj_shanmen' || performance.now() > endT) { endT = 0; window.KONGHOU_UNTIL = 0; if (window.BGM29) BGM29.resume(); } } catch (e) {} }, 500);
  tileUpdate = (orig => function (dt) {
    try {
      const t = input.tapped;
      if (t && !t.key && world.mapName === 'tj_shanmen' && !world.locked && !dialog && !choice && !(typeof sysPanel !== 'undefined' && sysPanel) && !S.menu) {
        const cam = world.cam || { x: 0, y: 0 }, z = typeof VZ === 'function' ? VZ() : 1, wx = t.x / z + cam.x, wy = t.y / z + cam.y;
        if (Math.abs(wx - HX) < HW / 2 && wy > HY - HH && wy < HY + 20) { input.tapped = null; play(); }
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  })(tileUpdate);
})();
