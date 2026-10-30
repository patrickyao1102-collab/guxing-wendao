// ================= 剑诀栏：技能树 + 重数 + 参悟 =================
// 菜单「技能」页换成一张星图剑谱：上面是绝技，下面按 单攻 / 群攻 / 增益 / 秘传 分列，每列一条修炼线。
// 每个技能一到五重（总策划）：二重 +15%，三重 +30%（附特效），四重 +45%，五重 +60%（附特效）。
// 参悟：二重要剑谱 ×1，三重要剑谱 ×3（典籍阁有卖）；四重要剑诀玉简 ×1，五重 ×2（支线 / 首领掉落）。练气期最多三重，凝丹之后才能到五重。
(function () {
  if (typeof drawSkills !== 'function' || typeof menuUpdate !== 'function') return;
  const CN = ['', '一', '二', '三', '四', '五'];
  const PAL = {
    zhuihun: ['#8fd0ff', '#123a66'], jueying: ['#c9a6ff', '#2a1450'], tianxuan: ['#ffe39a', '#6a3e0c'], tianshu: ['#fff1c4', '#5a4416'],
    xingluo: ['#9ff3ff', '#0f4656'], tunshi: ['#d7b4ff', '#32164e'], xingyun: ['#ffb27a', '#5e1c0c'], huti: ['#a6f0c8', '#0f4a36'],
    sun: ['#ffd27a', '#7a2a08'], xingluo2: ['#ffe8a8', '#5a3608'], dianxing: ['#d8f6ff', '#164a6e'], qunxing: ['#a9c8ff', '#14265e'], shaxing: ['#ff9a8a', '#5a0c10'],
    ningfeng: ['#ffc98a', '#64200e'], jiutian: ['#d6c4ff', '#2c1660'], daxue: ['#d4f6ff', '#1a4a66'], yinbo: ['#b4fff0', '#0e4a48'],
    luanshen: ['#ffb8e6', '#4e1440'], tianlai: ['#c8ffd8', '#164a2a'], guangming: ['#fff0b0', '#7a5410'], heian: ['#ff8a8a', '#2a0608'],
    riyue: ['#ffe0a0', '#2a1a4e'], shikong: ['#c4b8ff', '#10304a'],
  };
  // ---------- 每重效果 ----------
  const TGT = { tanlang: '单体', jueying: '单体', shaxing: '单体', qingxin: '单体', dianxing: '单体', pojun: '群体', tianshu: '群体', xingluo: '群体', qunxing: '群体', liehun: '群体', xingluo2: '群体', sun: '群体' };
  const dmg = (tg, ex3, ex5) => [tg + '攻击 · 威力 100%', tg + '攻击 · 威力 115%', tg + '攻击 · 威力 130%' + (ex3 ? '，' + ex3 : ''), tg + '攻击 · 威力 145%' + (ex3 ? '，' + ex3 : ''), tg + '攻击 · 威力 160%' + (ex5 ? '，' + ex5 : ex3 ? '，' + ex3 : '')];
  const TIERS = {
    tanlang: dmg('单体', '附破甲：目标防御 −25%，持续 2 回合', '破甲 3 回合，每战可用次数 +1'),
    jueying: dmg('单体', '无视目标 30% 防御', '无视目标 50% 防御，可跨境界重创'),
    pojun: dmg('群体', '出招后自身减伤 15%，持续 1 回合', '出招后全队减伤 15%，持续 1 回合'),
    tianshu: dmg('群体', '附镇压：目标速度 −15%，持续 2 回合'),
    xingluo: dmg('群体', '多段：命中次数 +1', '多段：命中次数 +2'),
    xingluo2: dmg('群体', '附星缚：目标速度 −10%，持续 1 回合'),
    dianxing: ['单体攻击 · 威力 100%', '单体攻击 · 威力 115%', '双目标攻击 · 威力 130%（主目标全额，副目标 70%）', '双目标攻击 · 威力 145%', '三目标攻击 · 威力 160%'],
    shaxing: dmg('单体', '附重创：目标防御 −20%，持续 2 回合', '必定暴击'),
    qunxing: dmg('群体', '附星缚：目标速度 −20%，持续 2 回合'),
    qingxin: dmg('单体', '定身 1 回合', '定身 2 回合'),
    liehun: dmg('群体', '附乱神：目标命中 −15%，持续 2 回合'),
    huti: ['全队减伤 15%，持续 2 回合', '全队减伤 18%，持续 2 回合', '全队减伤 20%，持续 3 回合', '全队减伤 22%，持续 3 回合', '全队减伤 25%，持续 3 回合'],
    ningfeng: ['全队攻击 +15%，持续 2 回合', '全队攻击 +18%，持续 2 回合', '全队攻击 +20%，持续 3 回合', '全队攻击 +22%，持续 3 回合', '全队攻击 +25%，持续 3 回合'],
  };
  const aux = (a, b2) => [a, a.replace(/(\d+)%/, (m, v) => Math.round(v * 1.15) + '%'), a.replace(/(\d+)%/, (m, v) => Math.round(v * 1.3) + '%') + (b2 ? '，' + b2 : ''), a.replace(/(\d+)%/, (m, v) => Math.round(v * 1.45) + '%') + (b2 ? '，' + b2 : ''), a.replace(/(\d+)%/, (m, v) => Math.round(v * 1.6) + '%') + (b2 ? '，' + b2 : '')];
  Object.assign(TIERS, {
    tanlang: dmg('单体 · 必中', '附破甲：目标防御 −25%，持续 2 回合', '破甲 3 回合'),
    duopo: dmg('单体 · 无视防御，命中眩晕 1 回合', '眩晕后目标防御 −30%', '眩晕 2 回合'),
    xingyun: dmg('群体 · 剑阵护队 3 回合', '剑阵减伤 +10%', '剑阵 4 回合'),
    yunlei: dmg('单体 · 先手，气条回半', '气条回七成', '命中附麻痹 30%'),
    bingfeng: dmg('单体 · 冻结 1 回合', '冻结目标受伤再 +20%', '冻结 2 回合（首领仍 1 回合）'),
    shenfa: dmg('群体 · 魂伤', '附定身 20%', '附定身 35%'),
    huti: aux('全队减伤 20%，持续 2 回合', '持续 3 回合'), shuangjia: aux('全队减伤 25% 并回 15% 气血，持续 2 回合', '持续 3 回合'),
    ningshen: aux('自身下一招 +50%'), juling: aux('全队回复 30 灵力'),
    qianggong: aux('全队攻击 +20%，持续 2 回合', '持续 3 回合'), jifeng: aux('全队速度 +30%，持续 2 回合', '持续 3 回合'), boming: aux('自身攻击 +50% 三回合，受伤 +25%'),
    bingxin: aux('全队解控，免疫 1 回合'), bingdun: aux('护盾 30% 上限气血，持续 2 回合', '持续 3 回合'),
    qxq: aux('单体回复 35% 气血并解异常'), yinzhang: aux('全队护盾 25% 上限气血，持续 2 回合', '持续 3 回合'), jiuyinhe: aux('全队回复 35% 气血，怒气 +20'),
  });
  const tiersOf = id => TIERS[id] || dmg(TGT[id] || '单体');
  // ---------- 各人的剑谱 ----------
  const N = (id, icon, short, o) => Object.assign({ id, icon, short }, o || {});
  const TREE = {
    hero: { title: '九曜剑典', gongfa: 'jiuyao', ult: null,
      cols: [['入门', [N('dianxing', 'dianxing', '点星'), N('xingluo2', 'xingluo2', '星落')]],
        ['破军', [N('pojun', 'tianxuan', '天璇'), N('xingluo', 'xingluo', '星罗'), N('xingyun', 'xingyun', '星陨')]],
        ['贪狼', [N('tanlang', 'zhuihun', '追魂'), N('jueying', 'jueying', '绝影'), N('duopo', 'duopo', '夺魄')]],
        ['辅助', [N('huti', 'huti', '护体'), N('ningshen', 'ningshen', '凝神'), N('juling', 'juling', '聚灵')]],
        ['秘传', [N('tunshi', 'tunshi', '纳月'), N('sun', 'sun', '太阳')]]] },
    yunting: { title: '天剑诀', gongfa: 'tianjian', ult: N('ult', 'jiutian', '九天神雷', { name: '九天神雷', cost: '怒气 100', desc: '引九天雷霆劈落，攻击全体并可能麻痹', lock: () => !(S.flags && S.flags.yt_jiutian), why: '城主府之后领悟' }),
      cols: [['剑式', [N('dianxing', 'dianxing', '点星'), N('qunxing', 'qunxing', '群星'), N('shaxing', 'shaxing', '杀星')]],
        ['辅助', [N('qianggong', 'qianggong', '强攻'), N('jifeng', 'jifeng', '疾风'), N('boming', 'boming', '搏命')]],
        ['秘传', [N('yunlei', 'yunlei', '云雷踏影')]]] },
    linxue: { title: '天剑诀', gongfa: 'tianjian', ult: N('ult', 'daxue', '大雪纷飞', { name: '大雪纷飞', cost: '怒气 100', desc: '漫天风雪冰封全体敌人' }),
      cols: [['剑式', [N('dianxing', 'dianxing', '点星'), N('qunxing', 'qunxing', '群星'), N('shaxing', 'shaxing', '寒星')]],
        ['辅助', [N('shuangjia', 'shuangjia', '霜甲'), N('bingxin', 'bingxin', '冰心'), N('bingdun', 'bingdun', '冰盾')]],
        ['秘传', [N('bingfeng', 'bingfeng', '冰封')]]] },
    shenle: { title: '九音录', gongfa: 'jiuyin', ult: N('ult', 'tianlai', '寂灭仙曲', { name: '九音录·寂灭仙曲', cost: '怒气 100', desc: '一曲寂灭，音杀全场' }),
      cols: [['音律', [N('qingxin', 'yinbo', '镇魂'), N('qxq', 'qxq', '清心曲')]],
        ['辅助', [N('yinzhang', 'yinzhang', '音障')]],
        ['秘传', [N('shenfa', 'shenfa', '神罚仙音'), N('jiuyinhe', 'jiuyinhe', '九音灵河')]]] },
    luochen: { title: '血脉本源', gongfa: 'xuemai', ult: null, solo: true,
      cols: [['光明', [N('guangming', 'guangming', '光明本源', { d: '左眸光明神力降下神罚：圣光天罚轰击全体敌人，我方全员气血回满并解除控制' })]], ['黑暗', [N('heian', 'heian', '黑暗本源', { d: '右眸黑暗神力降下神罚：血色暗光贯穿单体，无视防御，威压镇住其余敌人' })]], ['日月', [N('riyue', 'riyue', '日月轮转', { d: '烛龙天赋：本体化龙，昼夜轮转，紫雷龙息轰击全体，日出光雨回复全队' })]], ['时空', [N('shikong', 'shikong', '时空错乱', { d: '两大原初神之力：光阴倒流、万物失序，重创全体并将其行动条打回原点' })]]] },
  };
  // 天剑诀按等级领悟：点星入门，群星 6 级，杀星 14 级（九曜剑典仍按剧情领悟）
  if (typeof ALLY_SKILLS !== 'undefined') { if (ALLY_SKILLS.qunxing && !ALLY_SKILLS.qunxing.lv) ALLY_SKILLS.qunxing.lv = 6; }
  // ---------- 数据 ----------
  const LV = () => (S.skillLv = S.skillLv || {});
  const key = (who, id) => who + '.' + id;
  function info(who, n) {
    let src = null, learned = true, why = '';
    if (n.id === 'ult') { learned = !(n.lock && n.lock()); why = n.why || ''; return Object.assign({ name: n.name, cost: n.cost, desc: n.desc, learned, why, ult: true, max: 1, tier: 1 }, {}); }
    if (n.future) return { name: n.name, cost: n.cost, desc: n.desc, learned: false, why: '下次更新开放', max: 5, tier: 1 };
    const K4 = window.SK4, xd = K4 && K4.X[who] && K4.X[who][n.id];
    if (xd) { const ok = K4.learned(who, n.id), lvok = S.hero.lv >= xd.lv, bid = K4.bookId(who, n.id), bk = xd.kind !== 'gong';
      return { name: xd.name, cost: xd.cost ? '灵力 ' + xd.cost : '不耗灵力', desc: xd.desc, lore: xd.lore, learned: ok, why: bk ? (xd.lv + ' 级，持《' + xd.name + '》' + (xd.kind === 'mi' ? '秘传' : '辅助') + '参悟（典籍阁 ' + (xd.kind === 'mi' ? 1200 : 600) + ' 灵石）') : xd.lv + ' 级领悟', max: 5, tier: Math.max(1, LV()[key(who, n.id)] || 1), book: bk && !ok ? { item: bid, lvok, has: itemCount(bid) > 0, lv: xd.lv } : null }; }
    if (who === 'hero' && n.id === 'sun') { const sd = SKILL_DB.sun || {}; return { name: sd.name || n.name, cost: '灵力 ' + (sd.cost || 80), desc: sd.desc || n.desc, learned: !!(S.flags && S.flags.sun_unlocked), why: '解锁条件：无上境', max: 1, tier: 1 }; }
    if (who === 'hero') { src = SKILL_DB[n.id] || {}; learned = S.hero.skills.includes(n.id); why = src.lv ? src.lv + ' 级（' + realmOf(src.lv) + '）领悟' : '剧情中领悟'; }
    else if (who === 'yunting' || who === 'linxue') { src = Object.assign({}, ALLY_SKILLS[n.id] || {}); if (who === 'linxue' && n.id === 'shaxing') { src.name = '杀星·寒星'; src.desc = '杀星的寒冰版：单体 230%，冻结中的目标再 +50%'; } learned = S.hero.lv >= (src.lv || 0); why = (src.lv || 0) + ' 级（' + realmOf(src.lv || 1) + '）领悟'; }
    else { src = (ALLY2_SKILLS[who] || {})[n.id] || {}; learned = true; }
    const solo = TREE[who].solo;
    return { name: (solo ? n.short : src.name) || n.short, cost: solo ? '随时可放' : (src.rage ? '怒气 ' + src.rage : '灵力 ' + (src.cost || 0)), desc: n.d || src.desc || '', lore: window.SK4 && SK4.LORE[n.id] || '', learned, why, max: solo ? 1 : 5, tier: solo ? 1 : Math.max(1, LV()[key(who, n.id)] || 1), solo };
  }
  // 必杀归入「秘传」列（九天神雷 / 大雪纷飞 / 寂灭仙曲）
  {    for (const w of ['yunting', 'linxue', 'shenle']) { const T = TREE[w]; if (T && T.ult) { const mc = T.cols.find(c => c[0] === '秘传'); if (mc) mc[1].push(T.ult); else T.cols.push(['秘传', [T.ult]]); T.ult = null; } } }
  const realmCap = who => { const l = S.hero.lv; return l <= 9 ? 2 : l <= 18 ? 3 : l <= 27 ? 4 : 5; };   // 练气二重、凝丹三重、引魂四重、归元五重
  const CAPTXT = { 2: '练气期最多修至二重，凝丹后可继续', 3: '凝丹期最多修至三重，引魂后可继续', 4: '引魂期最多修至四重，归元后可继续' };
  const bookId = id => 'jp_' + id;
  function need(who, n, I) {
    const t = I.tier + 1; if (I.max <= 1 || t > I.max) return null;
    return { item: 'juan' + t, n: 1, label: '《剑诀·卷' + CN[t] + '》', cap: realmCap(who), t };
  }
  // 剑谱 / 玉简 进物品表
  for (const id of ['dianxing', 'xingluo2', 'pojun', 'tanlang', 'tianshu', 'qunxing', 'shaxing', 'tunshi', 'xingluo', 'jueying', 'xingyun', 'qingxin', 'liehun']) if (!ITEM_DB[bookId(id)])
    ITEM_DB[bookId(id)] = { name: '《' + ((SKILL_DB[id] || ALLY_SKILLS[id] || {}).name || id).replace(/.*·/, '') + '》剑谱', price: 400, book: true, skill: id, desc: '旧版剑谱（已改为通用卷册），可折算：在「技能」页参悟时等同一本《剑诀·卷二》。' };
  ITEM_DB.yujian = ITEM_DB.yujian || { name: '剑诀玉简', price: 0, book: true, desc: '记载剑诀精要的古玉，参悟四重、五重所需。支线与首领掉落。' };

  // ---------- 图标 ----------
  function star4(x, y, s) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x + s * .14, y - s * .14, x + s, y); ctx.quadraticCurveTo(x + s * .14, y + s * .14, x, y + s); ctx.quadraticCurveTo(x - s * .14, y + s * .14, x - s, y); ctx.quadraticCurveTo(x - s * .14, y - s * .14, x, y - s); ctx.fill(); }
  function blade(x0, y0, x1, y1, w) { // 从剑柄 (x0,y0) 到剑尖 (x1,y1)
    const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), c = Math.cos(a), s = Math.sin(a), P = (u, v) => [x0 + c * u - s * v, y0 + s * u + c * v];
    ctx.beginPath(); let p = P(L * .2, -w); ctx.moveTo(...p); p = P(L * .82, -w); ctx.lineTo(...p); p = P(L, 0); ctx.lineTo(...p); p = P(L * .82, w); ctx.lineTo(...p); p = P(L * .2, w); ctx.lineTo(...p); ctx.closePath(); ctx.fill();
    ctx.beginPath(); p = P(L * .2, -w * 3); ctx.moveTo(...p); p = P(L * .2, w * 3); ctx.lineTo(...p); ctx.stroke();
    ctx.beginPath(); p = P(0, 0); ctx.moveTo(...p); p = P(L * .2, 0); ctx.lineTo(...p); ctx.stroke();
  }
  const MOTIF = {
    zhuihun(r) { for (let i = 0; i < 3; i++) { ctx.globalAlpha = .35 + i * .15; ctx.beginPath(); ctx.moveTo(-r * .8, r * (.05 + i * .18)); ctx.lineTo(-r * .2, r * (-.12 + i * .18)); ctx.stroke(); } ctx.globalAlpha = 1; blade(-r * .55, r * .55, r * .62, -r * .62, r * .07); ctx.beginPath(); ctx.arc(r * .62, -r * .62, r * .12, 0, 7); ctx.fill(); },
    jueying(r) { for (const [d, a] of [[-.28, .25], [-.14, .45], [0, 1]]) { ctx.globalAlpha = a; blade(-r * .55 + d * r, r * .55, r * .6 + d * r, -r * .6, r * .07); } ctx.globalAlpha = 1; },
    tianxuan(r) { ctx.beginPath(); ctx.arc(0, 0, r * .28, 0, 7); ctx.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 - Math.PI / 2; blade(Math.cos(a) * r * .3, Math.sin(a) * r * .3, Math.cos(a) * r * .78, Math.sin(a) * r * .78, r * .05); } },
    tianshu(r) { blade(0, -r * .55, 0, r * .78, r * .12); star4(0, -r * .62, r * .26); },
    xingluo(r) { for (const [x, y, s] of [[-.45, -.35, .7], [.05, -.55, .9], [.45, -.2, .75], [-.15, .1, .8], [.3, .35, .6]]) blade(x * r - r * .14, y * r - r * .2, x * r + r * .14 * s, y * r + r * .34 * s, r * .045); for (const [x, y] of [[-.6, .4], [.62, -.55], [-.1, -.75]]) star4(x * r, y * r, r * .1); },
    tunshi(r) { ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, 7); ctx.arc(r * .25, -r * .12, r * .52, 0, 7, true); ctx.fill('evenodd'); ctx.globalAlpha = .7; ctx.beginPath(); for (let i = 0; i < 40; i++) { const u = i / 39, a = u * Math.PI * 3, rr = r * .5 * (1 - u); ctx.lineTo(r * .25 + Math.cos(a) * rr, -r * .12 + Math.sin(a) * rr); } ctx.stroke(); ctx.globalAlpha = 1; },
    xingyun(r) { const g = ctx.createLinearGradient(r * .7, -r * .7, -r * .3, r * .3); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.95)'); ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(r * .78, -r * .7); ctx.lineTo(-r * .12, r * .42); ctx.lineTo(-r * .42, r * .12); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(-r * .3, r * .3, r * .22, 0, 7); ctx.fill(); },
    huti(r) { ctx.beginPath(); ctx.arc(0, r * .35, r * .7, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); ctx.beginPath(); ctx.arc(0, r * .35, r * .52, Math.PI * 1.12, Math.PI * 1.88); ctx.globalAlpha = .5; ctx.stroke(); ctx.globalAlpha = 1; blade(0, r * .62, 0, -r * .5, r * .08); ctx.beginPath(); ctx.moveTo(-r * .7, r * .4); ctx.lineTo(r * .7, r * .4); ctx.stroke(); },
    sun(r) { ctx.beginPath(); ctx.arc(0, 0, r * .3, 0, 7); ctx.fill(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, l = i % 2 ? .62 : .8; blade(Math.cos(a) * r * .38, Math.sin(a) * r * .38, Math.cos(a) * r * l, Math.sin(a) * r * l, r * .045); } },
    xingluo2(r) { for (const [x, y, s] of [[-.32, -.5, .8], [.12, -.62, 1], [.42, -.4, .75]]) { ctx.globalAlpha = .6; ctx.beginPath(); ctx.moveTo(x * r - r * .22, y * r - r * .3); ctx.lineTo(x * r + r * .3 * s, y * r + r * .78 * s); ctx.lineWidth = r * .05; ctx.strokeStyle = ctx.fillStyle; ctx.stroke(); ctx.globalAlpha = 1; star4(x * r + r * .3 * s, y * r + r * .78 * s, r * .2 * s); } },
    dianxing(r) { ctx.globalAlpha = .55; ctx.fillRect(-r * .025, -r * .8, r * .05, r * 1.6); ctx.globalAlpha = 1; star4(0, 0, r * .55); ctx.beginPath(); ctx.arc(0, 0, r * .1, 0, 7); ctx.fill(); },
    qunxing(r) { for (const [x, y, s] of [[-.4, -.38, .26], [.3, -.48, .2], [.48, .1, .3], [-.12, .05, .36], [-.5, .4, .18], [.15, .5, .2]]) { ctx.globalAlpha = .4; ctx.beginPath(); ctx.moveTo(x * r - r * .3, y * r - r * .3); ctx.lineTo(x * r, y * r); ctx.stroke(); ctx.globalAlpha = 1; star4(x * r, y * r, s * r); } },
    shaxing(r) { star4(0, -r * .32, r * .42); blade(0, -r * .78, 0, r * .8, r * .07); },
    ningfeng(r) { blade(0, r * .75, 0, -r * .75, r * .1); for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const y = r * (.4 - i * .3); ctx.beginPath(); ctx.moveTo(sx * r * .3, y + r * .1); ctx.lineTo(sx * r * .5, y - r * .06); ctx.lineTo(sx * r * .7, y + r * .1); ctx.stroke(); } },
    jiutian(r) { ctx.beginPath(); ctx.arc(-r * .3, -r * .4, r * .25, Math.PI, 0); ctx.arc(r * .05, -r * .5, r * .3, Math.PI, 0); ctx.arc(r * .42, -r * .38, r * .22, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(r * .05, -r * .25); ctx.lineTo(-r * .25, r * .15); ctx.lineTo(r * .02, r * .15); ctx.lineTo(-r * .2, r * .78); ctx.lineTo(r * .3, -r * .02); ctx.lineTo(r * .04, -r * .02); ctx.lineTo(r * .25, -r * .25); ctx.closePath(); ctx.fill(); },
    daxue(r) { for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * .72); for (const u of [.32, .55]) { ctx.moveTo(0, -r * u); ctx.lineTo(-r * .16, -r * (u + .16)); ctx.moveTo(0, -r * u); ctx.lineTo(r * .16, -r * (u + .16)); } ctx.stroke(); ctx.restore(); } ctx.beginPath(); ctx.arc(0, 0, r * .1, 0, 7); ctx.fill(); },
    yinbo(r) { for (let i = 0; i < 3; i++) { ctx.globalAlpha = 1 - i * .25; ctx.beginPath(); ctx.arc(-r * .5, 0, r * (.35 + i * .2), -.8, .8); ctx.stroke(); } ctx.globalAlpha = 1; ctx.beginPath(); ctx.ellipse(-r * .55, r * .35, r * .14, r * .1, -.4, 0, 7); ctx.fill(); ctx.fillRect(-r * .44, -r * .45, r * .05, r * .8); },
    luanshen(r) { ctx.beginPath(); for (let i = 0; i < 60; i++) { const u = i / 59, a = u * Math.PI * 4.5, rr = r * .7 * u; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * .09, 0, 7); ctx.fill(); },
    tianlai(r) { ctx.save(); ctx.rotate(-.7); ctx.fillRect(-r * .7, -r * .06, r * 1.4, r * .12); for (let i = 0; i < 4; i++) { ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(-r * .3 + i * r * .22, 0, r * .035, 0, 7); ctx.fill(); } ctx.restore(); for (const [x, y] of [[.35, -.45], [.55, -.1]]) { ctx.beginPath(); ctx.ellipse(x * r, y * r, r * .1, r * .07, -.4, 0, 7); ctx.fill(); ctx.fillRect(x * r + r * .07, y * r - r * .35, r * .04, r * .35); } },
    guangming(r) { for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.globalAlpha = .6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * .52, Math.sin(a) * r * .52); ctx.lineTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8); ctx.stroke(); } ctx.globalAlpha = 1; ctx.beginPath(); ctx.moveTo(-r * .5, 0); ctx.quadraticCurveTo(0, -r * .45, r * .5, 0); ctx.quadraticCurveTo(0, r * .45, -r * .5, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * .17, 0, 7); ctx.fill(); },
    heian(r) { ctx.beginPath(); ctx.moveTo(-r * .55, 0); ctx.quadraticCurveTo(0, -r * .5, r * .55, 0); ctx.quadraticCurveTo(0, r * .5, -r * .55, 0); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#5a0006'; ctx.beginPath(); ctx.ellipse(0, 0, r * .09, r * .24, 0, 0, 7); ctx.fill(); ctx.restore(); },
    riyue(r) { ctx.beginPath(); ctx.arc(-r * .18, 0, r * .42, Math.PI / 2, Math.PI * 1.5); ctx.fill(); for (let i = 0; i < 5; i++) { const a = Math.PI / 2 + (i + .5) / 5 * Math.PI; ctx.beginPath(); ctx.moveTo(-r * .18 + Math.cos(a) * r * .5, Math.sin(a) * r * .5); ctx.lineTo(-r * .18 + Math.cos(a) * r * .72, Math.sin(a) * r * .72); ctx.stroke(); } ctx.beginPath(); ctx.arc(r * .1, 0, r * .42, -Math.PI / 2, Math.PI / 2); ctx.arc(r * .3, 0, r * .3, Math.PI / 2, -Math.PI / 2, true); ctx.fill(); },
    shikong(r) { ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, 7); ctx.stroke(); ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(0, 0, r * .45, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.fillRect(Math.cos(a) * r * .55 - 1.5, Math.sin(a) * r * .55 - 1.5, 3, 3); } ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * .4); ctx.moveTo(0, 0); ctx.lineTo(r * .28, r * .14); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * .07, 0, 7); ctx.fill(); },
  };
  function icon(k, x, y, r, o = {}) {
    if (!PAL[k] && window.UI_ICONS && UI_ICONS.key) k = UI_ICONS.key(k);   // 新招暂借同系图标
    const [c1, c2] = PAL[k] || ['#dddddd', '#333333'], t = performance.now() / 1000;
    ctx.save(); ctx.translate(x, y);
    if (o.sel || o.glow) { const pr = 1 + Math.sin(t * 4) * .06, g = ctx.createRadialGradient(0, 0, r * .8, 0, 0, r * 1.7 * pr); g.addColorStop(0, c1 + 'aa'); g.addColorStop(1, c1 + '00'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.7 * pr, 0, 7); ctx.fill(); }
    if (window.UI_ICONS && UI_ICONS.has(k)) { UI_ICONS.draw(k, 0, 0, r, o.locked);
      if (o.locked) { ctx.fillStyle = 'rgba(8,10,18,.35)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); lockGlyph(0, 0, r * .32); }
      if (o.sel) { ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(255,236,170,${.6 + Math.sin(t * 5) * .35})`; ctx.setLineDash([r * .3, r * .18]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(0, 0, r + 9, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
      ctx.restore(); return; }
    const g = ctx.createRadialGradient(-r * .3, -r * .35, r * .05, 0, 0, r); g.addColorStop(0, c1); g.addColorStop(.45, mix(c1, c2, .55)); g.addColorStop(1, c2);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = g; ctx.fill();
    // 主纹样
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * .9, 0, 7); ctx.clip();
    ctx.shadowColor = c1; ctx.shadowBlur = r * .35; ctx.fillStyle = 'rgba(255,252,240,.95)'; ctx.strokeStyle = 'rgba(255,252,240,.95)'; ctx.lineWidth = Math.max(1.5, r * .06); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    (MOTIF[k] || (() => {}))(r);
    ctx.restore();
    // 高光 + 边框
    const hl = ctx.createLinearGradient(0, -r, 0, 0); hl.addColorStop(0, 'rgba(255,255,255,.28)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = hl; ctx.beginPath(); ctx.ellipse(0, -r * .45, r * .78, r * .48, 0, 0, 7); ctx.fill();
    ctx.lineWidth = Math.max(2, r * .09); ctx.strokeStyle = '#c9963e'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = '#ffe9b0'; ctx.beginPath(); ctx.arc(0, 0, r - ctx.lineWidth * 2, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r + 2.5, 0, 7); ctx.strokeStyle = 'rgba(80,46,10,.9)'; ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; ctx.save(); ctx.rotate(a); ctx.fillStyle = '#f3d590'; ctx.beginPath(); ctx.moveTo(0, -r - 4); ctx.lineTo(3, -r); ctx.lineTo(0, -r + 4); ctx.lineTo(-3, -r); ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (o.locked) { ctx.fillStyle = 'rgba(8,10,18,.66)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); lockGlyph(0, 0, r * .32); }
    if (o.sel) { ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(255,236,170,${.6 + Math.sin(t * 5) * .35})`; ctx.setLineDash([r * .3, r * .18]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(0, 0, r + 9, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    ctx.restore();
  }
  function lockGlyph(x, y, s) { ctx.save(); ctx.fillStyle = '#d8c49a'; ctx.strokeStyle = '#d8c49a'; ctx.lineWidth = s * .28; ctx.beginPath(); ctx.arc(x, y - s * .35, s * .55, Math.PI, 0); ctx.stroke(); roundRect(x - s * .85, y - s * .3, s * 1.7, s * 1.25, s * .2); ctx.fill(); ctx.fillStyle = '#1a1208'; ctx.beginPath(); ctx.arc(x, y + s * .2, s * .18, 0, 7); ctx.fill(); ctx.restore(); }
  function mix(a, b, u) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, '0')).join(''); }
  window.SKILL_ICON = icon;

  // 功法图标（Codex R60/R58 功法根节点）
  const GF = {}; { const B = { jiuyao: 'd6cb6edb5cd29d504088526ab47df7b6', jiuyin: 'ac4614e5ef6b9658acf70bbbdd780908', tianjian: 'd0b5de9f5d516deac9345fa42b63bc03', xuemai: '32a027ea157a98d7431a7d743ebb4736' }, loc = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
    for (const k in B) { const im = new Image(); im.onload = () => { GF[k] = im; }; im.src = loc ? 'ui3/gongfa_' + k + '2.webp' : '/_blob/' + B[k]; } }
  // ---------- 布局 ----------
  const ACTIVE = {};   // 每人当前看的功法（叶孤星双修：九曜剑典 / 天剑诀 切换）
  function visibleCols(who, T) {
    const RD = T.roots || (T.gongfa ? [{ gongfa: T.gongfa, name: T.title, cols: T.cols.map((c, i) => i) }] : []);
    const act = RD.length > 1 ? (ACTIVE[who] || RD[0].gongfa) : (RD[0] && RD[0].gongfa);
    const R = RD.find(r => r.gongfa === act) || RD[0];
    const idx = R ? R.cols : T.cols.map((c, i) => i);
    const out = [];
    for (const ci of idx) { const [lab, ns] = T.cols[ci]; if (!lab) continue;
      const vis = []; for (const n of ns) { if (n.future) continue; const I = info(who, n); vis.push(n); if (!I.learned) break; }   // 已学的都显示，第一个没学的也显示（即将可学），再后面的不显示
      if (vis.length) out.push({ ci, lab, ns: vis }); }
    return { RD, act, out };
  }
  function geo(B) {
    const who = S.menu.who, T = TREE[who] || TREE.hero, TA = { x: B.x + 12, y: B.y + 12, w: 600, h: B.h - 24 }, DP = { x: B.x + 624, y: B.y + 12, w: B.w - 636, h: B.h - 24 };
    const V = visibleCols(who, T), cols = V.out, nodes = [], n = Math.max(1, cols.length), sp = TA.w / n;
    const multi = V.RD.length > 1;
    const roots = V.RD.map((d, k) => { const on = d.gongfa === V.act; return { gongfa: d.gongfa, name: d.name, cols: d.cols, on, x: multi ? TA.x + TA.w * (k === 0 ? .33 : .67) : TA.x + TA.w / 2, y: TA.y + (multi ? 56 : 66), r: multi ? (on ? 34 : 24) : 40 }; });
    const root = roots.find(r => r.on) || roots[0] || null;   // 最上面最大的是功法本身，当前看的那本亮，另一本小一点、点一下切换
    if (T.ult) nodes.push({ n: T.ult, x: TA.x + TA.w / 2 + (root ? 150 : 0), y: TA.y + (root ? 72 : 84), r: root ? 32 : 42, col: -1 });
    const m = Math.max(1, ...cols.map(c => c.ns.length)), compact = !T.solo && m > 3, tall = m > 4, y0 = tall ? 200 : (compact ? 222 : 232) + (root && !T.solo ? 12 : 0), dy = tall ? 64 : compact ? (root ? 66 : 76) : (root ? 86 : 104), rr = tall ? 22 : compact ? 25 : 31;
    cols.forEach(({ ci, lab, ns }, i) => { const cx = TA.x + sp * (i + .5); ns.forEach((nd, j) => nodes.push({ n: nd, x: cx, y: T.solo ? TA.y + TA.h / 2 + 10 : TA.y + y0 + j * dy, r: T.solo ? 46 : rr, col: ci, j, lab })); });
    const btn = { x: DP.x + 20, y: DP.y + DP.h - 74, w: DP.w - 40, h: 56 };
    return { who, T, TA, DP, nodes, sp, btn, compact, root, roots, multi };
  }
  let selKey = null, anim = null, stars = null;
  // 点功法本身：右边显示这门功法的介绍和它下面的各脉剑招
  const GF_DESC = {
    jiuyao: '上古剑典残本，系着青玉扣，记载九曜星辰之力。剑意分贪狼、破军两脉，另有增益之法与秘传。',
    tianjian: { hero: '天剑宗正统剑诀。叶孤星只学得入门的点星，其余剑招与他无缘；他以天剑诀为根，自创了群攻剑招星落。', other: '天剑宗正统剑诀，宗门弟子人人修习。由点星入门，渐次习得群星、杀星，秘传更有惊天一击。' },
    jiuyin: '神乐所修的乐道功法，以音入道：仙音镇魂，摄魂乱神，一曲寂灭可音杀全场。',
    xuemai: '洛尘体内的上古血脉本源。左眸光明、右眸黑暗，四大本源绝技随时可放，不需修炼重数。',
  };
  const rootSel = G => { if (!selKey || !selKey.startsWith('root:' + G.who + ':')) return null; const g = selKey.split(':')[2]; return G.roots.find(r => r.gongfa === g) || null; };
  function drawRootDetail(G, R, t) {
    const { DP, who, T } = G; ctx.save(); roundRect(DP.x, DP.y, DP.w, DP.h, 12); ctx.fillStyle = 'rgba(22,13,8,.96)'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(232,194,122,.45)'; ctx.stroke();
    const x = DP.x + 20, y = DP.y + 56, im = GF[R.gongfa]; if (im) ctx.drawImage(im, x, y - 38, 76, 76);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `30px ${BRUSH}`; textOutline(R.name, x + 92, y - 12, '#f6dfa6', '#120a04', 4);
    const all = R.cols.flatMap(c => (T.cols[c] || [, []])[1]).filter(n => !n.future), got = all.filter(n => info(who, n).learned).length;
    ctx.font = `600 14px ${FONT}`; ctx.fillStyle = '#9cc3ff'; ctx.fillText('功法　·　已领悟 ' + got + ' / ' + all.length + ' 招', x + 94, y + 22);
    ctx.fillStyle = 'rgba(232,194,122,.35)'; ctx.fillRect(x, y + 50, DP.w - 40, 1);
    const d = GF_DESC[R.gongfa], desc = typeof d === 'object' ? (who === 'hero' ? d.hero : d.other) : d || '';
    ctx.font = `17px ${FONT}`; ctx.fillStyle = '#eadcbc'; let yy = y + 80; for (const l of wrap(desc, DP.w - 44)) { ctx.fillText(l, x, yy); yy += 26; }
    yy += 14; for (const c of R.cols) { const [lab, ns] = T.cols[c] || []; if (!lab) continue;
      ctx.save(); roundRect(x, yy - 12, 46, 24, 12); ctx.fillStyle = 'rgba(142,42,28,.85)'; ctx.fill(); ctx.font = `16px ${BRUSH}`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff2cc'; ctx.fillText(lab, x + 23, yy + 1); ctx.restore();
      let xx = x + 58; ctx.font = `600 16px ${FONT}`; for (const n of ns) { if (n.future) continue; const I = info(who, n), nm = I.name && I.name.length <= 4 ? I.name : n.short; const w = ctx.measureText(nm).width; if (xx + w > DP.x + DP.w - 16) { yy += 26; xx = x + 58; } ctx.fillStyle = I.learned ? '#f6e6bf' : '#7d705e'; ctx.fillText(nm, xx, yy); xx += w + 14; }
      yy += 34; }
    ctx.restore();
  }
  function curSel(G) { let s = G.nodes.find(o => key(G.who, o.n.id) === selKey); if (!s) { s = G.nodes.find(o => o.col >= 0 && info(G.who, o.n).learned) || G.nodes[0]; selKey = key(G.who, s.n.id); } return s; }
  function canUp(G, o) { const I = info(G.who, o.n); if (!I.learned && I.book) return { learn: I.book, I, ok: I.book.has && I.book.lvok }; if (!I.learned || I.max <= 1) return null; const q = need(G.who, o.n, I); if (!q) return { done: true, I }; const have = itemCount(q.item) + (q.t === 2 ? itemCount(bookId(o.n.id)) : 0); return { q, I, ok: q.t <= q.cap && have >= q.n }; }

  // ---------- 画 ----------
  drawSkills = function (B) {
    const G = geo(B), { TA, DP, T, who } = G, t = performance.now() / 1000, selRoot = rootSel(G), sel = selRoot ? { n: { id: '' } } : curSel(G);
    // 星图剑谱底
    ctx.save(); roundRect(TA.x, TA.y, TA.w, TA.h, 12); const bg = ctx.createLinearGradient(0, TA.y, 0, TA.y + TA.h); bg.addColorStop(0, '#18213a'); bg.addColorStop(1, '#0b0f1d'); ctx.fillStyle = bg; ctx.fill(); ctx.clip();
    if (!stars) { stars = []; let s = 7; const R = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < 90; i++) stars.push([R(), R(), R()]); }
    for (const [u, v, w] of stars) { ctx.globalAlpha = .25 + .5 * w * (.6 + .4 * Math.sin(t * 1.5 + w * 20)); ctx.fillStyle = '#cfe0ff'; ctx.fillRect(TA.x + u * TA.w, TA.y + v * TA.h, 1 + w * 1.6, 1 + w * 1.6); }
    ctx.globalAlpha = .08; ctx.strokeStyle = '#e8c27a'; ctx.lineWidth = 1; for (const rr of [150, 230, 320]) { ctx.beginPath(); ctx.arc(TA.x + TA.w / 2, TA.y + (G.root ? 66 : 84), rr, 0, 7); ctx.stroke(); } ctx.globalAlpha = 1;
    ctx.restore();
    roundRect(TA.x, TA.y, TA.w, TA.h, 12); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(232,194,122,.55)'; ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `30px ${BRUSH}`; textOutline(T.title, TA.x + 18, TA.y + 28, '#f6dfa6', '#120a04', 4);
    ctx.font = `600 13px ${FONT}`; ctx.fillStyle = 'rgba(214,196,150,.8)'; ctx.fillText(memberInfo(who).name + ' · ' + (memberInfo(who).realm || ''), TA.x + 20, TA.y + 56);
    // 连线
    const ult = G.nodes.find(o => o.col < 0), byCol = {};
    for (const o of G.nodes) if (o.col >= 0) (byCol[o.col] = byCol[o.col] || []).push(o);
    const link = (a, b, lit, curve) => { ctx.save(); ctx.lineCap = 'round';
      const path = () => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); if (curve) ctx.bezierCurveTo(a[0], (a[1] + b[1]) / 2, b[0], (a[1] + b[1]) / 2, b[0], b[1]); else ctx.lineTo(b[0], b[1]); };
      if (lit) { ctx.strokeStyle = 'rgba(255,214,130,.22)'; ctx.lineWidth = 8; path(); ctx.stroke(); ctx.strokeStyle = '#f0cf86'; ctx.lineWidth = 2; path(); ctx.stroke();
        ctx.setLineDash([3, 22]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = 3.5; path(); ctx.stroke(); }
      else { ctx.setLineDash([5, 7]); ctx.strokeStyle = 'rgba(200,170,110,.28)'; ctx.lineWidth = 1.6; path(); ctx.stroke(); }
      ctx.restore(); };
    for (const c in byCol) { const ns = byCol[c], hx = ns[0].x, hy = ns[0].y - ns[0].r - 30, L0 = info(who, ns[0].n).learned;
      const RT = G.root, src = RT ? [RT.x, RT.y + RT.r + 30] : ult && [ult.x, ult.y + ult.r + 4];
      if (src && !T.solo) link(src, [hx, hy - 14], L0, true);
      if (G.root && T.solo) link([G.root.x, G.root.y + G.root.r + 30], [ns[0].x, ns[0].y - ns[0].r - 30], true, true);
      for (let j = 1; j < ns.length; j++) link([ns[j - 1].x, ns[j - 1].y + ns[j - 1].r + (G.compact ? 20 : 26)], [ns[j].x, ns[j].y - ns[j].r - 4], info(who, ns[j].n).learned, false);
      // 列名
      ctx.save(); const lab = ns[0].lab, tw = 54; roundRect(hx - tw / 2, hy - 13, tw, 26, 13); ctx.fillStyle = 'rgba(142,42,28,.85)'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = '#e8c27a'; ctx.stroke();
      ctx.font = `18px ${BRUSH}`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff2cc'; ctx.fillText(lab, hx, hy + 1); ctx.restore();
      if (!T.solo) link([hx, hy + 13], [ns[0].x, ns[0].y - ns[0].r - 4], L0, false); }
    // 功法根节点
    for (const R of G.roots) { const im = GF[R.gongfa];
      if (ult && R === G.root) link([R.x + R.r + 6, R.y + 4], [ult.x - ult.r - 6, ult.y], info(who, ult.n).learned, false);
      ctx.save(); const pr = 1 + Math.sin(t * 2) * .05, g = ctx.createRadialGradient(R.x, R.y, R.r * .7, R.x, R.y, R.r * 1.9 * pr); g.addColorStop(0, 'rgba(255,224,150,.55)'); g.addColorStop(1, 'rgba(255,214,130,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(R.x, R.y, R.r * 1.9 * pr, 0, 7); ctx.fill();
      if (G.multi && !R.on) ctx.globalAlpha = .55;
      if (im) ctx.drawImage(im, R.x - R.r * 1.12, R.y - R.r * 1.12, R.r * 2.24, R.r * 2.24);
      if (selRoot === R) { ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(255,236,170,${.6 + Math.sin(t * 5) * .35})`; ctx.setLineDash([R.r * .3, R.r * .18]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(R.x, R.y, R.r + 10, 0, 7); ctx.stroke(); ctx.setLineDash([]); } else { ctx.fillStyle = '#2a3150'; ctx.beginPath(); ctx.arc(R.x, R.y, R.r, 0, 7); ctx.fill(); }
      ctx.font = `20px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const nw = ctx.measureText(R.name).width + 26; roundRect(R.x - nw / 2, R.y + R.r + 4, nw, 26, 13); ctx.fillStyle = 'rgba(12,10,20,.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(232,194,122,.7)'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#f6dfa6'; ctx.fillText(R.name, R.x, R.y + R.r + 18);
      if (G.multi && !R.on) { ctx.globalAlpha = .8; ctx.font = `600 11px ${FONT}`; ctx.fillStyle = '#c9b48c'; ctx.fillText('点此切换', R.x, R.y + R.r + 40); }
      ctx.restore(); }
    // 节点
    for (const o of G.nodes) { const I = info(who, o.n), cu = canUp(G, o), isSel = o === sel;
      icon(o.n.icon, o.x, o.y, o.r, { locked: !I.learned, sel: isSel, glow: o.col < 0 && I.learned });
      if (anim && anim.k === key(who, o.n.id)) drawAnim(o, t);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = o.col < 0 ? `24px ${BRUSH}` : `600 15px ${FONT}`;
      if (o.col < 0) { const tw = ctx.measureText(o.n.short).width + 28; ctx.save(); roundRect(o.x - tw / 2, o.y + o.r + 6, tw, 30, 15); ctx.fillStyle = 'rgba(12,10,20,.92)'; ctx.fill(); ctx.strokeStyle = 'rgba(232,194,122,.5)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }
      textOutline(o.n.short, o.x, o.y + o.r + (o.col < 0 ? 20 : G.compact ? 11 : 15), I.learned ? '#f6e6bf' : '#8f8370', '#0a0604', 3);
      if (I.max > 1 && I.learned) for (let k = 1; k <= 5; k++) { const px = o.x + (k - 3) * (G.compact && o.col >= 0 ? 9 : 11), py = o.y + o.r + (G.compact && o.col >= 0 ? -2 : 32); ctx.save(); ctx.translate(px, py); ctx.rotate(Math.PI / 4);
        const lit = k <= I.tier; ctx.fillStyle = lit ? '#ffd76a' : 'rgba(120,100,70,.5)'; if (lit) { ctx.shadowColor = '#ffcc55'; ctx.shadowBlur = 6; } ctx.fillRect(-3.5, -3.5, 7, 7); ctx.restore(); }
      if (o.col < 0) { ctx.font = `600 12px ${FONT}`; ctx.fillStyle = I.learned ? '#ffb070' : '#8f8370'; ctx.fillText(I.learned ? '绝 技' : '未领悟', o.x, o.y - o.r - 12); }
      if (cu && cu.ok) { const bx = o.x + o.r * .78, by = o.y - o.r * .78, p = 1 + Math.sin(t * 6) * .12; ctx.save(); ctx.translate(bx, by); ctx.scale(p, p); ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.fillStyle = '#3fae5a'; ctx.fill(); ctx.strokeStyle = '#eaffd8'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(5, 1); ctx.lineTo(1.8, 1); ctx.lineTo(1.8, 6); ctx.lineTo(-1.8, 6); ctx.lineTo(-1.8, 1); ctx.lineTo(-5, 1); ctx.closePath(); ctx.fill(); ctx.restore(); } }
    if (T.solo) { ctx.textAlign = 'center'; ctx.font = `600 15px ${FONT}`; ctx.fillStyle = 'rgba(232,210,160,.75)'; ctx.fillText('烛龙血脉 · 灵力怒气无限，四大本源绝技随时可放', TA.x + TA.w / 2, TA.y + TA.h - 60); }
    if (selRoot) drawRootDetail(G, selRoot, t); else drawDetail(G, sel, t);
    if (anim && t - anim.t0 > 1.4) anim = null;
  };
  function drawAnim(o, t) {
    const u = (t - anim.t0) / 1.4; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (u < .55) { const k = u / .55; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2 + i, d = (1 - k) * (90 + (i % 5) * 18), x = o.x + Math.cos(a) * d, y = o.y + Math.sin(a) * d; ctx.fillStyle = `rgba(255,${200 + (i % 3) * 20},120,${.3 + k * .7})`; ctx.beginPath(); ctx.arc(x, y, 2 + (i % 3), 0, 7); ctx.fill();
      ctx.strokeStyle = `rgba(255,230,160,${.25 * k})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(o.x + Math.cos(a) * (d + 24), o.y + Math.sin(a) * (d + 24)); ctx.stroke(); } }
    else { const k = (u - .55) / .45; ctx.strokeStyle = `rgba(255,230,150,${1 - k})`; ctx.lineWidth = 6 * (1 - k) + 1; ctx.beginPath(); ctx.arc(o.x, o.y, o.r + k * 70, 0, 7); ctx.stroke();
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 1.6); g.addColorStop(0, `rgba(255,250,220,${.9 * (1 - k)})`); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 1.6, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function wrap(s, w) { const out = []; let line = ''; for (const ch of s) { if (ctx.measureText(line + ch).width > w && line) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; }
  function drawDetail(G, o, t) {
    const { DP, who } = G, I = info(who, o.n), cu = canUp(G, o);
    ctx.save(); roundRect(DP.x, DP.y, DP.w, DP.h, 12); ctx.fillStyle = 'rgba(22,13,8,.96)'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(232,194,122,.45)'; ctx.stroke();
    let x = DP.x + 20, y = DP.y + 54;
    icon(o.n.icon, x + 34, y, 34, { locked: !I.learned });
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `${I.name.length > 6 ? 24 : 28}px ${BRUSH}`; textOutline(I.name, x + 82, y - 14, '#f6dfa6', '#120a04', 4);
    ctx.font = `600 14px ${FONT}`; ctx.fillStyle = '#9cc3ff'; ctx.fillText(I.cost, x + 84, y + 18);
    if (I.max > 1) { ctx.fillStyle = '#ffd76a'; ctx.textAlign = 'right'; ctx.fillText(I.learned ? '第' + CN[I.tier] + '重' : '', DP.x + DP.w - 18, y + 18); ctx.textAlign = 'left'; }
    y += 52; ctx.font = `15px ${FONT}`; ctx.fillStyle = '#e9dcc0'; for (const l of wrap(I.desc, DP.w - 40).slice(0, 3)) { ctx.fillText(l, x, y); y += 24; }
    if (I.lore) { ctx.font = `13px ${FONT}`; ctx.fillStyle = '#a8957a'; for (const l of wrap(I.lore, DP.w - 40).slice(0, 4)) { ctx.fillText(l, x, y); y += 19; } }
    y += 6; ctx.strokeStyle = 'rgba(232,194,122,.3)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(DP.x + DP.w - 20, y); ctx.stroke(); y += 22;
    const row = (lab, txt, col, labCol) => { ctx.font = `600 14px ${FONT}`; ctx.fillStyle = labCol || '#c9b48c'; ctx.fillText(lab, x, y); y += 22; ctx.font = `600 16px ${FONT}`; ctx.fillStyle = col; for (const l of wrap(txt, DP.w - 40)) { ctx.fillText(l, x, y); y += 22; } y += 8; };
    if (!I.learned) { row('尚未领悟 · 领悟条件', I.why || '', '#ff9a7a'); const T0 = tiersOf(o.n.id); row('领悟后 · 第一重', T0[0], '#f5ead2');
      if (I.book) { ctx.font = `600 15px ${FONT}`; ctx.fillStyle = I.book.has ? '#e9dcc0' : '#ff8a7a'; ctx.fillText((I.book.has ? '已持有' : '尚无') + ITEM_DB[I.book.item].name, x, y); y += 24; ctx.fillStyle = I.book.lvok ? '#e9dcc0' : '#ff8a7a'; ctx.fillText('需 ' + I.book.lv + ' 级（现 ' + S.hero.lv + ' 级）', x, y); y += 24; } }
    else if (I.ult || I.solo) { row(I.ult ? '秘传' : '本源绝技', I.ult ? '怒气满 100 时可施展，不需修炼重数。' : '随时可放，不需修炼重数。', '#e9dcc0'); }
    else {
      const T = tiersOf(o.n.id); row('当前 · 第' + CN[I.tier] + '重', T[I.tier - 1], '#f5ead2');
      if (cu && cu.q) { row('下一重 · 第' + CN[cu.q.t] + '重', T[cu.q.t - 1], '#9fe28a', '#9fe28a');
        const have = itemCount(cu.q.item); ctx.font = `600 15px ${FONT}`; ctx.fillStyle = have >= cu.q.n ? '#e9dcc0' : '#ff8a7a'; ctx.fillText('需要 ' + cu.q.label + ' ×' + cu.q.n + '（现有 ' + have + '）', x, y); y += 24;
        if (cu.q.t > cu.q.cap) { ctx.fillStyle = '#ff8a7a'; ctx.fillText(CAPTXT[cu.q.cap] || '境界不足', x, y); y += 24; }
        else if (cu.q.t <= 3) { ctx.fillStyle = '#a8957a'; ctx.font = `14px ${FONT}`; ctx.fillText('卷册可在天剑宗集市·典籍阁购得', x, y); y += 22; }
        else { ctx.fillStyle = '#a8957a'; ctx.font = `14px ${FONT}`; ctx.fillText('卷四、卷五：引魂境后典籍阁上架，首领也掉', x, y); y += 22; } }
      else row('已臻化境', '此招已修至第五重。', '#ffd76a', '#ffd76a');
    }
    // 参悟按钮
    if (!I.ult && !I.solo && cu && (cu.q || cu.learn)) { const b = G.btn, ok = cu.ok;
      lacquer(b.x, b.y, b.w, b.h, { r: 12, top: ok ? '#b8402a' : 'rgba(60,46,34,.9)', bot: ok ? '#6e1a10' : 'rgba(34,26,20,.9)' });
      if (ok) { ctx.save(); roundRect(b.x, b.y, b.w, b.h, 12); ctx.clip(); const sx = b.x + ((t * 160) % (b.w + 200)) - 100, g = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.5, 'rgba(255,240,200,.35)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.restore(); }
      ctx.textAlign = 'center'; ctx.font = `30px ${BRUSH}`; textOutline('参 悟', b.x + b.w / 2, b.y + b.h / 2 + 1, ok ? '#fff2cc' : '#8a7a5c', '#1a0800', 4); }
    ctx.restore();
  }

  // ---------- 点选 ----------
  menuUpdate = (orig => function () {
    const m = S.menu; if (!m || MTABS[m.tab] !== '技能' || !input.tapped) return orig();
    const tp = input.tapped, L = menuLayout(), G = geo(L.body);
    for (const R of G.roots) if (Math.hypot(tp.x - R.x, tp.y - R.y) < R.r + 14 || (Math.abs(tp.x - R.x) < 60 && tp.y > R.y + R.r && tp.y < R.y + R.r + 32)) { input.tapped = null; ACTIVE[G.who] = R.gongfa; selKey = 'root:' + G.who + ':' + R.gongfa; playSnd('ui_click'); return; }
    for (const o of G.nodes) if (Math.hypot(tp.x - o.x, tp.y - o.y) < o.r + 12) { input.tapped = null; selKey = key(G.who, o.n.id); playSnd('ui_click'); return; }
    if (inR(tp, G.btn) && !rootSel(G)) { const o = curSel(G), cu = canUp(G, o);
      if (cu && cu.learn) { input.tapped = null; if (!cu.ok) { playSnd('ui_click'); toast(!cu.learn.has ? '没有' + ITEM_DB[cu.learn.item].name + '（典籍阁有售）' : '境界不足：需 ' + cu.learn.lv + ' 级'); return; }
        const h = S.hero; h.bag[cu.learn.item]--; if (h.bag[cu.learn.item] <= 0) delete h.bag[cu.learn.item]; SK4.learn(G.who, o.n.id); anim = { k: key(G.who, o.n.id), t0: performance.now() / 1000 };
        try { playSnd('jingle_levelup'); } catch (e) {} toast('领悟 · ' + cu.I.name); try { if (typeof saveGame === 'function') saveGame(); } catch (e) {} return; }
      if (cu && cu.q) { input.tapped = null;
      if (!cu.ok) { playSnd('ui_click'); toast(cu.q.t > cu.q.cap ? (CAPTXT[cu.q.cap] || '境界不足') : '没有' + cu.q.label + '（典籍阁有售）'); return; }
      const h = S.hero; { const legacy = cu.q.t === 2 && !itemCount(cu.q.item) ? bookId(o.n.id) : cu.q.item; h.bag[legacy] -= cu.q.n; if (h.bag[legacy] <= 0) delete h.bag[legacy]; }
      LV()[key(G.who, o.n.id)] = cu.q.t; anim = { k: key(G.who, o.n.id), t0: performance.now() / 1000 };
      try { playSnd('jingle_levelup'); } catch (e) {} toast('领悟 · ' + o.n.short + ' 第' + CN[cu.q.t] + '重'); try { if (typeof saveGame === 'function') saveGame(); } catch (e) {} return; } }
    return orig();
  })(menuUpdate);

  // 背包里剑谱 / 玉简的图标
  itemIcon = (orig => function (id, x, y, r) { const it = ITEM_DB[id]; if (!it || !it.book) return orig.apply(this, arguments);
    ctx.save(); ctx.translate(x, y); const jade = id === 'yujian';
    ctx.fillStyle = jade ? '#3f9d84' : '#4a5f96'; roundRect(-r * .72, -r * .85, r * 1.44, r * 1.7, r * .12); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#e8c27a'; ctx.stroke();
    ctx.fillStyle = jade ? '#bff3e0' : '#efe2c0'; ctx.fillRect(-r * .2, -r * .65, r * .4, r * 1.1); ctx.fillStyle = '#5a2a10'; ctx.font = `${Math.round(r * .5)}px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(jade ? '简' : it.vol ? '卷' : it.sk4 ? (it.cat === '秘传' ? '秘' : '辅') : '谱', 0, -r * .1);
    ctx.restore(); })(itemIcon);

  // 对外接口：战斗里查重数
  window.SKILL_TIER = (who, id) => Math.max(1, LV()[key(who, id)] || 1);
  window.SKILL_TREE = TREE;
})();
// 测试面板：一键送剑谱 / 玉简，方便试参悟
(function addTestBtn(n) {
  const pan = document.getElementById('dbgPanel'); if (!pan) { if ((n || 0) < 40) setTimeout(() => addTestBtn((n || 0) + 1), 500); return; }
  const h = document.createElement('h4'); h.textContent = '剑诀 · 技能树'; const row = document.createElement('div'); row.className = 'row';
  const b = document.createElement('button'); b.textContent = '送全套剑谱×3 + 玉简×3，打开技能页';
  b.onclick = () => { for (const id in ITEM_DB) if (ITEM_DB[id].book && (ITEM_DB[id].vol || ITEM_DB[id].sk4)) addItem(id, 3); pan.hidden = true; try { openMenu(); S.menu.tab = MTABS.indexOf('技能'); } catch (e) {} toast('已送入剑谱与玉简'); };
  row.appendChild(b); pan.appendChild(h); pan.appendChild(row);
})();

// 作者：凝丹一重（10 级）领悟破军剑阵·星罗——已过 10 级的存档补发
setInterval(() => { try { const h = S.hero; if (h && h.lv >= 10 && h.skills && h.skills.includes('pojun') && !h.skills.includes('xingluo')) { h.skills.push('xingluo'); toast('领悟 · 破军剑阵·星罗', 2200); } } catch (e) {} }, 2000);
