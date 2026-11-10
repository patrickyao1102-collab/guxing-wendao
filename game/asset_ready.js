// ================= 载入画面多等一会儿：立绘 / 喊招配音 / 魔族真身素材都到齐再进（作者 11-11）=================
// 作者原话：「叶孤星变成了老立绘，技能喊话都没配音了……我觉得是加载的问题，过图的时间还可以再久点，确保所有东西不出错再过图」
// 做法：登记进 PRELOAD（loading.js）—— 剧情跳转闸门（part_gate）和换图载入画面都会等 PRELOAD 全部完成才放行
(function () {
  if (typeof PRELOAD !== 'function') return;
  const until = (ok, cap) => new Promise(res => { const t0 = performance.now(); const iv = setInterval(() => { let v = false; try { v = ok(); } catch (e) {} if (v || performance.now() - t0 > cap) { clearInterval(iv); res(); } }, 150); });
  // 1) 叶孤星新立绘（R100 十种表情图集）：拆好、替换进 IMG 才算好
  PRELOAD('叶孤星立绘', until(() => window.R100_PORTRAIT && R100_PORTRAIT.ready && IMG.p_yegx && IMG.p_yegx.__r100, 45000));
  // 1b) 叶孤星战斗模型（R88 换装三姿）
  PRELOAD('叶孤星战斗模型', until(() => ['b_yegx', 'b_yegx_atk', 'b_yegx_cast'].every(k => IMG[k] && (IMG[k].naturalWidth || IMG[k].width) > 8), 45000));
  // 2) 全队喊招配音：每条都要能播（canplaythrough）或至少下完一遍（手机没点过屏幕时 audio 不预载，就用 fetch 先下进缓存）
  const voiceReady = () => new Promise(res => {
    const go = () => { const list = window.VOICE29_ALL ? VOICE29_ALL() : null; if (!list) return setTimeout(go, 300);
      Promise.all(list.map(({ a, src }) => new Promise(r => { if (!a) return r(); if (a.readyState >= 3) return r();
        a.addEventListener('canplaythrough', r, { once: true }); a.addEventListener('error', r, { once: true });
        try { fetch(src).then(x => x.arrayBuffer()).then(r, r); } catch (e) { r(); } }))).then(res); };
    go(); });
  PRELOAD('喊招配音', Promise.race([voiceReady(), new Promise(r => setTimeout(r, 40000))]));
  // 3) 魔族真身（R189 / R193）：变身图集、骨翼待机、新立绘、笑声和台词
  PRELOAD('魔族真身', until(() => { const M = window.R189M && R189M.IM; return M && ['b_mz3_idle', 'b_mz3_atk', 'b_mz3_hit', 'mz3_wing', 'mz3_tf1', 'mz3_tf2', 'mz3_tf3', 'mz3_tf4', 'mz3_tf5', 'p3_default', 'yt_inj'].every(k => M[k]); }, 45000));
})();
