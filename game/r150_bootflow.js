// ================= R150 · 剧情等地图载好再开始（作者 11-07：手机开局黑屏，还没进图对话就出来了）=================
// 剧情脚本都是「换图 → 淡入 → 字幕 / 对话」。网速慢时地图素材还没到齐，淡入就结束了，对话框浮在黑屏上。
// 现在淡入、字幕、对话开始前先等当前地图（和它的配乐）载好——载入画面照常显示进度条；最多等 45 秒（网络极慢时载入画面里也可以点屏幕先进）。
(function () {
  const ready = () => { try { return !(window.MAP_LOADING && MAP_LOADING()); } catch (e) { return true; } };
  const wait = () => ready() ? null : new Promise(res => { const t0 = Date.now(); const id = setInterval(() => { if (ready() || Date.now() - t0 > 45000) { clearInterval(id); res(); } }, 100); });
  const gate = f => function () { const w = wait(); if (!w) return f.apply(this, arguments); const a = arguments, self = this; return w.then(() => f.apply(self, a)); };
  if (typeof fadeIn === 'function') fadeIn = gate(fadeIn);
  if (typeof caption === 'function') caption = gate(caption);
  if (typeof say === 'function') say = gate(say);
})();
// 换图时：这张图要的素材如果还在开局排队里（img_guard.js），按名字找出来插队先下
(function () {
  const G = window.IMG_GUARD; if (!G || !G.bumpMatch) return;
  const toksOf = k => {
    const t = [];
    if (/^cx2g_/.test(k)) t.push('cx2/g_' + k.slice(5) + '.');
    else if (/^cx2_/.test(k)) { const id = k.slice(4), A = typeof CX2ATLAS !== 'undefined' ? CX2ATLAS : null, e = A && A.map[id]; if (e) t.push('cx2/atlas_' + e[0] + '.'); t.push('/' + id + '.'); }
    else { t.push('/' + k + '.'); const m = /^([a-z]+\d+)[a-z]?_/.exec(k); if (m) t.push(m[1] + '/'); }
    return t;
  };
  let lastMap = null, tries = 0;
  setInterval(() => { try {
    if (!(window.MAP_LOADING && MAP_LOADING())) { tries = 0; return; }
    if (!(G.lowQ.length || G.lateQ.length)) return;
    if (world.mapName !== lastMap) { lastMap = world.mapName; tries = 0; }
    if (++tries > 30) return;
    const m = world.map, toks = new Set();
    if (m && !m.tile && m.img && !IMG[m.img]) toksOf(m.img).forEach(x => toks.add(x));
    const B = m && m.def && m.def.baked;
    if (B) { if (B.ground && !IMG[B.ground]) toksOf(B.ground).forEach(x => toks.add(x)); for (const o of B.objs || []) if (o.img && !IMG[o.img]) toksOf(o.img).forEach(x => toks.add(x)); }
    G.bumpMatch([...toks]);
  } catch (e) {} }, 300);
})();
