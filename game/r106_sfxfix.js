// R106 战斗音效补全（作者 11-03：打木人放技能，很多打击音感都没有，音效都不对）
// 逐招实测（木人桩里每招放一遍，记下每个音效、每次伤害、震屏的时间）后发现两个问题：
//  1) 很多招在「蓄力 → 命中」之间有 1–5 秒完全没声音（剑阵成形、星云亮起、光柱压下时一片安静），
//     太阳、寂灭仙曲、杀星、星落、九音灵河、追魂最明显；
//  2) 命中只有一声「闷响」，好几个目标同时中招也只响一下，没有剑气 / 金属的脆响。
// 招式的动画快慢跟着帧率走（手机卡一点就慢一点），所以不按固定毫秒补音，而是跟着招式本身的进度：
//  · 出招后、第一下命中之前，只要安静超过 0.25 秒（按上一个音效的实际长度算），就补一个蓄势音
//    （每个人一套：叶孤星剑鸣 / 光束 / 星光，云霆雷鸣，林雪冰晶，神乐仙音），轮流不重复；
//  · 第一下命中时叠一声挥剑破空，像是剑气斩到；
//  · 技能命中时在闷响上叠一层「剑气爆裂 + 金属共鸣」（暴击音效，压低音量），打击更脆；
//    同一时刻多目标中招时，后几个目标错开 55ms 各补一声，听得出「打中了好几个」。
// 全部用即梦音效库里的现成音效，不用代码合成。
(function () {
  if (typeof doHeroAction !== 'function' || typeof playSnd !== 'function') return;
  const THEME = {
    hero: ['sfx_sword_ring', 'sfx_beam', 'sfx_star'],
    yunting: ['sfx_thunder', 'sfx_sword_ring', 'sfx_charge'],
    linxue: ['sfx_ice', 'sfx_sword_ring', 'sfx_dx_tinkle'],
    shenle: ['sfx_xz_condense', 'sfx_xz_slot', 'sfx_xz_array'],
    luochen: ['sfx_beam', 'sfx_charge'],
  };
  const NOFILL = new Set(['atk', 'def', 'item', 'huti', 'ningshen', 'juling', 'shuangjia', 'bingdun', 'jifeng', 'boming', 'qianggong']);   // 普攻、辅助招本来就短，不补
  const ps = playSnd;
  const st = { on: false, who: 'hero', k: '', t0: 0, quietUntil: 0, hit: false, n: 0, lastHit: 0, burst: 0 };
  const durOf = n => { try { const b = AUD.buf[n]; return b ? b.duration * 1000 : 900; } catch (e) { return 900; } };
  playSnd = function (n, v, r) {
    const now = performance.now();
    if (st.on && !/^ui_/.test(n)) st.quietUntil = Math.max(st.quietUntil, now + durOf(n) * .7);
    if (n === 'sfx_hit' && st.on) {
      if (now - st.lastHit < 30) { if (st.burst < 3) { const d = 55 * ++st.burst; setTimeout(() => ps('sfx_hit', (v ?? 1) * .75, 1.08), d); } return; }
      st.lastHit = now; st.burst = 0;
      ps('sfx_crit', .38, 1.15);
    }
    return ps.apply(this, arguments);
  };
  // 第一下真正打到（掉血）时：停止补蓄势音，并叠一声挥剑破空
  if (typeof applyDamage === 'function') applyDamage = (o => function (t) { if (st.on && !st.hit && t && t.side !== 'hero') { st.hit = true; try { ps('sfx_swing', .8); } catch (e) {} } return o.apply(this, arguments); })(applyDamage);
  // 蓄势补音：每 100ms 看一眼
  setInterval(() => {
    if (!st.on || st.hit || NOFILL.has(st.k)) return;
    const now = performance.now(); if (now - st.t0 < 500 || now < st.quietUntil + 250) return;
    if (typeof battle === 'undefined' || !battle) return;
    const th = THEME[st.who] || THEME.hero, n = th[st.n++ % th.length];
    try { playSnd(n, .55); } catch (e) {}
  }, 100);
  const once = () => { if (window.__R106_WRAPPED) return; window.__R106_WRAPPED = 1;
    doHeroAction = (orig => async function (k) {
      const b = typeof battle !== 'undefined' && battle, P = b && b.P;
      Object.assign(st, { on: true, who: P ? (P.ally || 'hero') : 'hero', k, t0: performance.now(), quietUntil: performance.now() + 900, hit: false, n: 0, lastHit: 0, burst: 0 });
      try { return await orig.apply(this, arguments); } finally { st.on = false; }
    })(doHeroAction); };
  if (document.readyState === 'complete') setTimeout(once, 0); else window.addEventListener('load', () => setTimeout(once, 0));   // 包在喊话层外面
  window.R106_SFX = { st, THEME };
})();
