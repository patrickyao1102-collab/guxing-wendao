// ================= 角色技能喊招配音（即梦 SeedAudio 全能配音）=================
// 出招时按「谁 + 哪招」播一句台词：叶孤星 / 云霆 / 林雪 / 神乐。每招可有多条候选（配乐库「癸 · 角色配音」里可指定哪条，本机记住）。
// 默认取每招第一条；配乐库里点「指定」就改用那条，再点一次取消。喊招时配乐暂时压低一点，和九天神雷原来的做法一样。
(function () {
  if (typeof doHeroAction !== 'function' || !window.BGM_LIB) return;
  const lib = BGM_LIB.tracks;
  // 每个招式槽：候选 id 按优先顺序
  const SLOT = {};            // 'yunting:ult' -> [ids]
  const NAMES = {};           // 槽名（显示用）
  for (const id in lib) { const t = lib[id]; if (t.kind !== 'voice' || !t.slot) continue; (SLOT[t.slot] = SLOT[t.slot] || []).push(id); }
  Object.assign(NAMES, {
    'hero:atk': '叶孤星·普攻', 'hero:pojun': '叶孤星·天璇', 'hero:tanlang': '叶孤星·追魂', 'hero:tianshu': '叶孤星·天枢', 'hero:xingluo': '叶孤星·星罗', 'hero:jueying': '叶孤星·绝影', 'hero:ult': '叶孤星·星落',
    'yunting:dianxing': '云霆·点星', 'yunting:qunxing': '云霆·群星', 'yunting:shaxing': '云霆·杀星', 'yunting:def': '云霆·凝锋', 'yunting:ult': '云霆·九天神雷',
    'linxue:dianxing': '林雪·点星', 'linxue:qunxing': '林雪·群星', 'linxue:shaxing': '林雪·杀星', 'linxue:ult': '林雪·大雪纷飞',
    'shenle:qingxin': '神乐·仙音镇魂', 'shenle:liehun': '神乐·摄魂乱神', 'shenle:ult': '神乐·寂灭仙曲',
  });
  const pickKey = s => 'voice:' + s;
  function chosen(slot) { const B = window.BGM29; const pk = B && B.PICK[pickKey(slot)]; if (pk && lib[pk]) return pk; const c = SLOT[slot]; if (!c) return null; return /:atk$/.test(slot) ? c[Math.floor(Math.random() * c.length)] : c[0]; }
  let cur = null;
  const cache = {};
  function play(slot, vol) {
    const id = chosen(slot); if (!id) return false;
    try {
      if (typeof AUD !== 'undefined' && AUD.muted) return false;
      if (cur) { try { cur.pause(); } catch (e) {} }
      let a = cache[id]; if (!a) { a = new Audio(BGM29.src(id)); a.preload = 'auto'; cache[id] = a; }
      a.currentTime = 0; a.volume = vol != null ? vol : (lib[id].vol != null ? lib[id].vol : .95); a.play().catch(() => {}); cur = a;
      // 配乐让一让
      if (typeof AUD !== 'undefined' && AUD.musicGain && typeof AC !== 'undefined' && AC) { const g = AUD.musicGain.gain, t = AC.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(.2, t + .1); g.linearRampToValueAtTime(.45, t + Math.max(1.2, (lib[id].dur || 2) + .4)); }
      return true;
    } catch (e) { return false; }
  }
  // 预热：进战斗时把本场会用到的候选先 new 一遍
  function prewarm(ids) { for (const id of ids) if (!cache[id] && lib[id]) { const a = new Audio(BGM29.src(id)); a.preload = 'auto'; cache[id] = a; } }
  const SINGLE = new Set(['atk', 'tanlang', 'jueying', 'tunshi', 'dianxing', 'shaxing', 'qingxin', 'jinwu']);
  doHeroAction = (orig => async function (k) {
    const b = battle, P = b && b.P;
    try {
      if (P && !(SINGLE.has(k) && !b.__picked && aliveEnemies().length > 1)) {   // 还在点选目标时不喊
        const who = P.ally || 'hero';
        if (!(who === 'yunting' && k === 'ult')) {   // 云霆大招由下面 playVoice 的替换来播（跟动画对拍）
          if (k === 'atk' && Math.random() < .5) { /* 普攻一半概率不喊 */ } else play(who + ':' + k);
        }
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  })(doHeroAction);
  // 云霆九天神雷：有库里的候选（或配乐库里指定了）时，用它顶掉 index.html 里原来的三段配音
  if (typeof playVoice === 'function') playVoice = (orig => function (name, vol) {
    if (/^yt_jt/.test(name) && (window.BGM29.PICK[pickKey('yunting:ult')] || SLOT['yunting:ult'])) {
      if (name === 'yt_jt1') play('yunting:ult'); return;   // 三段合成一句，只在起手播
    }
    return orig.apply(this, arguments);
  })(playVoice);
  if (typeof startBattle === 'function') startBattle = (orig => function () { const r = orig.apply(this, arguments); try { prewarm(Object.keys(SLOT).map(chosen)); } catch (e) {} return r; })(startBattle);
  window.VOICE29 = { SLOT, NAMES, chosen, play, slotsOf(id) { const t = lib[id]; return t && t.slot ? [t.slot] : []; }, pickKey };
})();
