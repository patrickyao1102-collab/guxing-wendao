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
    'hero:atk': '叶孤星·普攻', 'hero:dianxing': '叶孤星·点星', 'hero:xingluo2': '叶孤星·星落', 'hero:pojun': '叶孤星·天璇', 'hero:xingluo': '叶孤星·星罗', 'hero:xingyun': '叶孤星·星陨', 'hero:tanlang': '叶孤星·追魂', 'hero:jueying': '叶孤星·绝影', 'hero:duopo': '叶孤星·夺魄', 'hero:huti': '叶孤星·护体', 'hero:ningshen': '叶孤星·凝神', 'hero:juling': '叶孤星·聚灵', 'hero:sun': '叶孤星·太阳', 'hero:tianshu': '叶孤星·天枢', 'hero:xl_wushang': '叶孤星·星落·无上境',
    'yunting:qianggong': '云霆·强攻', 'yunting:jifeng': '云霆·疾风', 'yunting:boming': '云霆·搏命', 'yunting:yunlei': '云霆·云雷踏影',
    'linxue:shuangjia': '林雪·霜甲', 'linxue:bingxin': '林雪·冰心', 'linxue:bingdun': '林雪·冰盾', 'linxue:bingfeng': '林雪·冰封',
    'yunting:dianxing': '云霆·点星', 'yunting:qunxing': '云霆·群星', 'yunting:shaxing': '云霆·杀星', 'yunting:def': '云霆·凝锋', 'yunting:ult': '云霆·九天神雷',
    'linxue:dianxing': '林雪·点星', 'linxue:qunxing': '林雪·群星', 'linxue:shaxing': '林雪·杀星', 'linxue:ult': '林雪·大雪纷飞',
    'shenle:qingxin': '神乐·仙音镇魂', 'shenle:liehun': '神乐·摄魂乱神', 'shenle:ult': '神乐·寂灭仙曲',
    'shenle:qxq': '神乐·清心曲', 'shenle:yinzhang': '神乐·音障', 'shenle:shenfa': '神乐·神罚仙音', 'shenle:jiuyinhe': '神乐·九音灵河',
  });
  const pickKey = s => 'voice:' + s;
  function chosen(slot) { const B = window.BGM29; const pk = B && B.PICK[pickKey(slot)]; if (pk && lib[pk] && lib[pk].slot === slot) return pk; const c = SLOT[slot]; if (!c) return null; return /:atk$/.test(slot) ? c[Math.floor(Math.random() * c.length)] : c[0]; }
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
  const SINGLE = new Set(['atk', 'tanlang', 'jueying', 'tunshi', 'dianxing', 'shaxing', 'jinwu', 'yunlei', 'bingfeng', 'duopo']);   // 要先点选目标的招（与 SK4 PICK 一致）
  // 作者 11-01：等所有脚本加载完再包在最外层——以前后加载的辅助 / 秘传 / 夺魄等招直接接管，喊话层根本走不到
  const install = () => { if (window.__VOICE29_WRAPPED) return; window.__VOICE29_WRAPPED = 1; doHeroAction = (orig => async function (k) {
    const b = battle, P = b && b.P;
    try {
      if (P && !(SINGLE.has(k) && !b.__picked && aliveEnemies().length > 1)) {   // 还在点选目标时不喊
        const who = P.ally || 'hero';
        if (!(who === 'yunting' && k === 'ult')) {   // 云霆大招由下面 playVoice 的替换来播（跟动画对拍）
          if (k === 'atk' && Math.random() < .5) { /* 普攻一半概率不喊 */ } else if (play(who + ':' + k)) { const id = chosen(who + ':' + k); vEnd = performance.now() + ((lib[id] && lib[id].dur) || 1.8) * 1000; }
          if (who === 'shenle' && k === 'jiuyinhe') jiuyinheSfx();
        }
      }
    } catch (e) {}
    const r = await orig.apply(this, arguments);
    // 作者 11-02：辅助招动画一秒多就收，喊招还没喊完就轮到下一个人——等这句喊完再交出回合（最多多等 1.5 秒）
    const left = vEnd - performance.now(); if (left > 0) await new Promise(res => setTimeout(res, Math.min(1500, left + 150)));
    return r;
  })(doHeroAction); };
  let vEnd = 0;
  // 九音灵河原来没有音效：笛音起 → 灵河流到每个队友各一声 → 收尾一声（用仙音镇魂同一套即梦音效）
  function jiuyinheSfx() { if (typeof playSnd !== 'function') return; const at = (ms, n, v) => setTimeout(() => { try { playSnd(n, v); } catch (e) {} }, ms);
    at(150, 'sfx_xz_flute', .7); [850, 1250, 1650].forEach(ms => at(ms, 'sfx_xz_reunion', .6)); at(2100, 'sfx_xz_soul', .7); }
  if (document.readyState === 'complete') install(); else window.addEventListener('load', install);
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
