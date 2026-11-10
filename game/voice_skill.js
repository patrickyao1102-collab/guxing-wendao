// ================= 角色技能喊招配音（即梦 SeedAudio 全能配音）=================
// 出招时按「谁 + 哪招」播一句台词：叶孤星 / 云霆 / 林雪 / 神乐。每招可有多条候选（配乐库「癸 · 角色配音」里可指定哪条，本机记住）。
// 默认取每招第一条；配乐库里点「指定」就改用那条，再点一次取消。喊招时配乐暂时压低一点，和九天神雷原来的做法一样。
(function () {
  if (typeof doHeroAction !== 'function' || !window.BGM_LIB) return;
  const lib = BGM_LIB.tracks;
  // 作者 11-06：喊话一律用 11-03 冷厉版。那批定稿切片时整体错了一位（「天璇」那条其实喊的是点星、「星罗」是天璇……），
  // 已按语音识别逐条核对、重新切好 lib29/n3_hero__*.mp4（夺魄定稿批里没有，用同日早一轮冷厉版），这里不再换回 11-01 旧版。
  // 每个招式槽：候选 id 按优先顺序
  const SLOT = {};            // 'yunting:ult' -> [ids]
  const NAMES = {};           // 槽名（显示用）
  for (const id in lib) { const t = lib[id]; if (t.kind !== 'voice' || !t.slot) continue; (SLOT[t.slot] = SLOT[t.slot] || []).push(id); }
  // 作者 11-03：核对喊话要用最新配音——同一招有 11-03 重录版（lib_n3_*）时排在最前（以前林雪点星 / 群星默认还是旧的统一音色版，和她其余几招音色不一致）
  // 作者 11-06：林雪全套重录（lib_n4_*，年轻清冷战斗喊招）通过的几招，排在 11-03 版之前当默认
  // 作者 11-06 晚：九天神雷原版漏了「落」，补录 1 直接当默认；搏命 / 点星补录先当候选，作者在配乐库里指定
  // 作者 11-06 夜：云霆只有九天神雷、搏命换成全套抽卡 8 号那条切出的（lib_n6_yunting__jiutian / boming）当默认，其余几招不换（8 号切出的其他招只进库当候选）；叶孤星点星选定第二轮补录 6（lib_n5_hero__dianxing_b5）；林雪杀星退回原来那条「新一」（lib_n_ss0），11-06 定稿那条作者嫌难听已下线
  // 作者 11-06 深夜：云霆点星（8 号）、林雪杀星 B 选定；云霆群星 / 杀星 8 号先放进游戏试听（lib_n7_*，排最前）
  const rank = id => /^lib_n7_/.test(id) ? 5 : id === 'lib_n6_yunting__jiutian' || id === 'lib_n6_yunting__boming' || id === 'lib_n5_hero__dianxing_b5' || id === 'lib_n_ss0' ? 4 : /^lib_n5_yunting__jiutian/.test(id) ? 3 : /^lib_n4_/.test(id) ? 2 : /^lib_n3_/.test(id) ? 1 : /^lib_n6_yunting__/.test(id) ? -1 : 0;
  for (const s in SLOT) SLOT[s].sort((a, b) => rank(b) - rank(a));
  Object.assign(NAMES, {
    'hero:atk': '叶孤星·普攻', 'hero:dianxing': '叶孤星·点星', 'hero:xingluo2': '叶孤星·星落', 'hero:pojun': '叶孤星·天璇', 'hero:xingluo': '叶孤星·星罗', 'hero:xingyun': '叶孤星·星陨', 'hero:tanlang': '叶孤星·追魂', 'hero:jueying': '叶孤星·绝影', 'hero:duopo': '叶孤星·夺魄', 'hero:huti': '叶孤星·护体', 'hero:ningshen': '叶孤星·凝神', 'hero:juling': '叶孤星·聚灵', 'hero:sun': '叶孤星·太阳', 'hero:tianshu': '叶孤星·天枢', 'hero:tunshi': '叶孤星·纳月吞噬', 'hero:xl_wushang': '叶孤星·星落·无上境',
    'yunting:qianggong': '云霆·强攻', 'yunting:jifeng': '云霆·疾风', 'yunting:boming': '云霆·搏命', 'yunting:yunlei': '云霆·云雷踏影',
    'linxue:shuangjia': '林雪·霜甲', 'linxue:bingxin': '林雪·冰心', 'linxue:bingdun': '林雪·冰盾', 'linxue:bingfeng': '林雪·冰封',
    'yunting:dianxing': '云霆·点星', 'yunting:tunshi': '云霆·纳月吞噬', 'yunting:qunxing': '云霆·群星', 'yunting:shaxing': '云霆·杀星', 'yunting:def': '云霆·凝锋', 'yunting:ult': '云霆·九天神雷',
    'linxue:dianxing': '林雪·点星', 'linxue:qunxing': '林雪·群星', 'linxue:shaxing': '林雪·杀星', 'linxue:ult': '林雪·大雪纷飞',
    'shenle:qingxin': '神乐·仙音镇魂', 'shenle:liehun': '神乐·摄魂乱神', 'shenle:ult': '神乐·寂灭仙曲',
    'shenle:qxq': '神乐·清心曲', 'shenle:yinzhang': '神乐·音障', 'shenle:shenfa': '神乐·神罚仙音', 'shenle:jiuyinhe': '神乐·九音灵河',
  });
  const pickKey = s => 'voice:' + s;
  // 作者 11-06 夜：「林雪的接进去了吗，木人桩听着没变化」——本机以前在配乐库里「指定」过旧候选的话，换了定稿也永远听不到新的。
  // 这里按版本号清一次：指定的那条比现在的默认还旧（rank 更低）就删掉指定，让新定稿生效；作者之后再指定的不受影响（改 V 才会再清）
  try { const CLR = 'voice_pin_clear', V = 2; if (+(localStorage.getItem(CLR) || 0) < V) { const B = window.BGM29; if (B && B.PICK) { for (const s in SLOT) { const k = pickKey(s), pk = B.PICK[k]; if (pk && SLOT[s][0] && rank(pk) < rank(SLOT[s][0])) delete B.PICK[k]; } try { localStorage.setItem('bgm29_pick', JSON.stringify(B.PICK)); } catch (e) {} } localStorage.setItem(CLR, V); } } catch (e) {}
  function chosen(slot) { const B = window.BGM29; const pk = B && B.PICK[pickKey(slot)]; if (pk && lib[pk] && lib[pk].slot === slot) return pk; const c = SLOT[slot]; if (!c) return null; return /:atk$|^hero:tunshi$/.test(slot) ? c[Math.floor(Math.random() * c.length)] : c[0]; }
  let cur = null, lastId = null;   // 作者 11-07：纳月吞噬三版台词都要，出招时随机喊一条
  const cache = {};
  function play(slot, vol) {
    const id = chosen(slot); if (!id) return false; lastId = id;
    try {
      if (typeof AUD !== 'undefined' && AUD.muted) return false;
      if (cur) { try { cur.pause(); } catch (e) {} }
      let a = cache[id]; if (!a) { a = new Audio(BGM29.src(id)); a.preload = 'auto'; cache[id] = a; }
      a.currentTime = 0; a.volume = vol != null ? vol : (lib[id].vol != null ? lib[id].vol : .95); a.play().catch(() => {}); cur = a;
      // 作者 11-02：喊招时不再压低战斗配乐（配乐好听，保持原音量）
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
          if (k === 'atk' && Math.random() < .5) { /* 普攻一半概率不喊 */ } else if (play(who + ':' + k)) { const id = lastId; window.VOICE29_LAST = { slot: who + ':' + k, id, t: performance.now() }; vEnd = performance.now() + ((lib[id] && lib[id].dur) || 1.8) * 1000; }
          if (who === 'shenle' && k === 'jiuyinhe' && !window.R96_JYH3) jiuyinheSfx();   // v3 流萤光河自己按时间轴放音效
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
  // 作者 11-11：「技能喊话都没配音了（加载问题）……确保所有东西不出错再过图」→ 每招当前要喊的那条交给 asset_ready.js 预载，载入画面等它们下好
  window.VOICE29_ALL = () => { const ids = []; for (const s in SLOT) { const id = chosen(s); if (id) ids.push(id); if (/^hero:tunshi$/.test(s)) ids.push(...SLOT[s]); } prewarm(ids); return ids.map(id => ({ id, a: cache[id], src: BGM29.src(id) })); };
  // 作者 11-07：叶孤星「天剑一式，点星！」喊话和剑招不同频——喊话 2.4 秒，「点星」在 1.7 秒、「星！」在 2.05 秒，剑招 0.9 秒就命中了。
  // 改成：先喊「天剑一式」，剑芒凝成；「点——星！」那一下剑芒刺出命中（剑招整体晚起步，命中对在「星」字上）
  const DX_HIT = { lib_n7_hero__dianxing: 2.05 };   // 各条喊话里「星」字的时间（秒）；没标的按时长 − 0.3 估
  // 作者 11-08：不再把剑招整段延后；改成六芒星凝成后多转几圈（luochen_cine.js 的点星按这里算出的秒数多转），刺出命中对上「星」字
  window.DX_VOICE_HOLD = Pc => { try { const L = window.VOICE29_LAST;
    if (!Pc || Pc.ally || !L || L.slot !== 'hero:dianxing' || performance.now() - L.t > 1500) return 0;
    const hit = DX_HIT[L.id] != null ? DX_HIT[L.id] : Math.max(0, ((lib[L.id] && lib[L.id].dur) || 1.2) - .3);
    return Math.max(0, Math.min(1.6, hit - 1.06 - (performance.now() - L.t) / 1000)); } catch (e) { return 0; } };
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
