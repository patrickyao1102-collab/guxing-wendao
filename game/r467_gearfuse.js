// ================= R467 · 装备：打造 + 合成 + 颜色品级 + 灵窍 + 灵韵（只进测试版）=================
// 作者 11-28 定稿（17:34、17:38 又改过几条，以改过的为准）。一句话：
//   打造出一堆带副属性、带灵窍的装备 → 拿一件四字极品当主装备 → 把副装备一层层合进去 → 合出五属三窍的红装、碰运气出金装
//   → 窍里镶顶级灵珠、强化到 +5。神装能越级打赢下一档装备，但要大量材料和运气。
//
// 这个文件管的事（老文件只加了几个小挂钩，见各处注释）：
//   一、颜色品级：全游戏只留这一套。看「副属性条数 + 灵窍数（+ 灵韵）」合计：白 0 / 绿 1～3 / 蓝 4 / 紫 5～6 / 橙 7 / 红 8 / 金 9。
//       表在 GRADES，作者要改阈值改那一张就行。流云仙衣、星痕剑算金装，挂「仙器」小字。
//       「常见 / 少见 / 稀有 / 难得」「上品 / 极品」「成色」「主属性 112%」都不再给玩家看（格子里的第几等还在内部用，定出哪一件）。
//   二、主属性：每件装备就是格子表里的那个数，固定不波动（作者 17:34）。打造、合成都不动主属性；只有强化动它。
//   三、副属性写法：「火系伤害 +6」「火系减伤 +6」「会心 +3」，不写百分号（内部照旧按百分比算）。
//   四、打造（剑炉原来的「合成」页改名「打造」）：3～5 样料就能开炉。料越少——出四字极品的机会越小、副属性留得越少、数值往区间下段摇、窍开得越少。
//   五、合成（新页）：主装备 + 1～3 件同部位的副装备。到顶的副属性一定留；其余的和副装备的一起摇；会失败、会越合越差；护灵符保住主装备原有的；回炉重摇一次。
//   六、灵窍与灵珠：每件最多三窍。灵珠加副属性不再加主属性（兵器/护腕/饰品上是「某系伤害」，衣甲/鞋履上是「某系减伤」）。珍稀料也能直接镶进窍。
//   七、强化按件记（店里买的普通装备一强化就单独分出一件来记）；+5 另给一条：兵器/护腕/饰品会心 +3，衣甲/鞋履减伤 +3；挪强化只许同档，往高一档挪掉两级。
//   八、流云仙衣跟着叶孤星的等级长；星痕剑把「佩剑 +12」并进剑身（攻击 28 → 40），能强化、开两窍。
//   九、几件前期过强的剧情装数值拉回本档（名字不改）。
//   十、老存档：强化过、镶过珠、炉子里打过的装备换算到新规矩，叶孤星身上的属性补差额（照 r406 fixSave 的写法），脱下来属性对得上。
//   十一、灵韵在战斗里的效果。
//   十二、剑炉界面：打造 / 合成 / 强化 / 镶嵌 四页（精炼、星纹两页没动）。
// Codex 的图（到货前用代码画的占位）：都放 game/r467/，文件名见 ART_NAMES；到了把 ART_ON 改成 true。
(function () {
  const CR = window.CRAFT, G6 = window.GEAR6, G5 = window.GEAR5, R = window.R394, KIT = window.R386_KIT;
  if (!CR || !G6 || !G5 || !R || !R.K || !KIT || !window.WX5 || typeof ITEM_DB === 'undefined' || typeof S === 'undefined') return;
  const K = R.K, { D, T, C, BR, KAI, NUM, fit: fitW, wrap, inR } = KIT, WX = WX5.WX, ORDER = WX5.ORDER, MAT = CR.MAT;
  const F = () => (S.flags = S.flags || {}), H = () => S.hero, KEYS = ['atk', 'def', 'maxhp', 'maxmp', 'spd'], SLOTS = G5.SLOTS;
  const ATK_SLOT = { weapon: 1, wrist: 1, acc: 1 }, SLOT_CN = { weapon: '兵器', wrist: '护腕', armor: '衣甲', shoe: '鞋履', acc: '饰品' };
  const rnd = () => Math.random(), pick = a => a[Math.floor(rnd() * a.length)];
  const snd = (n, v) => { try { playSnd(n, v || .7); } catch (e) {} };
  const baseName = id => String((ITEM_DB[id] || {}).name || '').replace(/ \+\d$/, '').replace(/（(下品|中品|上品|极品|绝品)）$/, '');

  // ---------- 图：Codex 到货前用代码画占位 ----------
  // 到货后放进 game/r467/，把 ART_ON 改成 true（没到货之前不去要图，免得控制台一串 404）。
  const ART_ON = false;
  const ART_NAMES = ['socket_empty', 'socket_full', 'frame_0', 'frame_1', 'frame_2', 'frame_3', 'frame_4', 'frame_5', 'frame_6', 'hulingfu', 'huilu', 'lingyun', 'fx_fuse_ok', 'fx_fuse_fail'];
  const ARTS = {}; const art = n => { if (!ART_ON) return null; let o = ARTS[n]; if (!o) { o = ARTS[n] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r467/' + n + '.webp?v=1'; } return o.ok ? o.im : null; };

  // =====================================================================================================
  // 一、颜色品级
  // =====================================================================================================
  // [名字, 深色界面用的颜色, 纸面（行囊）用的深一号颜色, 合计到几算这一色]。合计 = 副属性条数 + 灵窍数 + 灵韵（有就 +1）
  const GRADES = [['白', '#e4dfd2', '#4d463c', 0], ['绿', '#80dc76', '#2a8531', 1], ['蓝', '#5fb0ff', '#1f5fb4', 4], ['紫', '#c58cff', '#7233bb', 5], ['橙', '#ffa64b', '#bd5c08', 7], ['红', '#ff6252', '#c02a24', 8], ['金', '#ffd75a', '#9c6e04', 9]];
  const XIAN = { w_xinghen: 1, w_xinghen2: 1, a_liuyun: 1 };   // 仙器：流云仙衣、星痕剑（两个品阶）。只能当主装备，永远金装
  const FG = () => (H().fg = H().fg || {}), GU = () => (H().gu = H().gu || {});
  const isInst = id => !!(H() && H().fg && H().fg[id]);
  // 一件装备的「身上记的东西」：炉子里打的 / 分出来单独记的在 S.hero.fg[名字牌]；仙器在 S.hero.gu[名字牌]；店里那样的普通货没有（白装、无窍）
  function recOf(id) { const h = H(); if (!h) return null; if (h.fg && h.fg[id]) return h.fg[id]; if (XIAN[id]) { const g = GU(); return g[id] || (g[id] = { s: [], k: 2, ly: null }); } return null; }
  const linesOf = id => { const r = recOf(id); return r ? (r.s || []).filter(l => CR.SUB[CR.parse(l)[0]]) : []; };
  const socksOf = id => { const r = recOf(id); return r ? Math.max(0, Math.min(3, r.k || 0)) : 0; };
  const gemsOf = id => { const a = ((H() && H().gems) || {})[id] || [], n = socksOf(id), out = []; for (let i = 0; i < n; i++) out.push(a[i] || null); return out; };
  const refLv = id => (((H() && H().refine) || {})[id] || 0);
  const countOf = id => { const r = recOf(id); return r ? linesOf(id).length + socksOf(id) + (r.ly ? 1 : 0) : 0; };
  function gradeOf(id) { const it = ITEM_DB[id]; if (!it || !it.slot) return -1; if (XIAN[id]) return 6; const c = countOf(id); let g = 0; GRADES.forEach((q, i) => { if (c >= q[3]) g = i; }); return g; }
  window.GEAR_COL = (id, paper) => { const g = gradeOf(id); return g < 0 ? null : GRADES[g][paper ? 2 : 1]; };
  const gradeWord = id => { const g = gradeOf(id); return g < 0 ? '' : GRADES[g][0] + '装'; };
  // 别处写「练气档 · 难得」的地方，改写「练气档 · 紫装」；仙器写「仙器 · 金装」
  G6.label = id => { const g = gradeOf(id); if (g < 0) return ''; if (XIAN[id]) return '仙器 · 金装'; const t = G6.tierOf(id); return (t ? G6.TIER_CN[t] + ' · ' : '') + GRADES[g][0] + '装'; };
  G6.col = id => window.GEAR_COL(id);
  G6.rankName = id => gradeWord(id);

  // =====================================================================================================
  // 三、副属性的名字（不写百分号）
  // =====================================================================================================
  const SUBN = { crit: ['会心', '会心'], cd: ['会心伤害', '会伤'], ke: ['克制伤害', '克伤'], pj: ['破甲', '破甲'], guard: ['减伤', '减伤'], regen: ['出手回血', '回血'], mpRegen: ['出手回灵', '回灵'], fz: ['反震', '反震'], dx: ['定心', '定心'],
    xj: ['先机', '先机'], tx: ['调息', '调息'], jc: ['聚财', '聚财'], wu: ['悟性', '悟性'], xb: ['寻宝', '寻宝'], ny: ['怒意', '怒意'] };
  const elN = el => (WX[el] ? WX[el].n : el);
  const subName = (k, short) => /^el_/.test(k) ? elN(k.slice(3)) + (short ? '伤' : '系伤害') : /^res_/.test(k) ? elN(k.slice(4)) + (short ? '减' : '系减伤') : (SUBN[k] || [k, k])[short ? 1 : 0];
  const PCT = k => !CR.SUB[k] || CR.SUB[k][2] === '%';   // 内部单位：带 % 的按百分比算（显示时不写），回灵、怒意是点数
  for (const k in CR.SUB) { CR.SUB[k][0] = subName(k); CR.SUB[k][1] = subName(k, true); }   // 第三格（单位）留着给内部换算用
  CR.subText = (k, v, short) => CR.SUB[k] ? subName(k, short) + ' +' + v : '';
  CR.lineText = (ln, short) => { if (!ln) return ''; const [k, v] = CR.parse(ln); return CR.subText(k, v, short); };
  // 哪个部位留得住哪几条：兵器全部攻击类；护腕攻击类；饰品攻击类里的伤害、会心、克制 + 回灵 + 饰品独有的那几样（原来饰品一条都留不住，定稿说饰品也带副属性）
  CR.ALLOW.weapon = k => /^el_/.test(k) || ['crit', 'ke', 'cd', 'pj'].includes(k);
  CR.ALLOW.wrist = k => /^el_/.test(k) || ['crit', 'ke', 'cd', 'pj'].includes(k);
  CR.ALLOW.acc = k => /^el_/.test(k) || ['crit', 'ke', 'mpRegen', 'xj', 'tx', 'jc', 'wu', 'xb', 'ny'].includes(k);
  // 每条副属性在这一档「到顶」是多少（合成时到顶的那条一定留下）。[练气档, 凝丹档]；照料上最高的数 × 打造时相生最多的那一涨（1.25）算的
  const TOP = { el: [4, 10], crit: [1, 4], ke: [4, 10], guard: [1, 4], mpRegen: [1, 4], regen: [1, 3], cd: [8, 19], pj: [6, 19], res: [4, 10], fz: [4, 10], dx: [8, 19], xj: [10, 20], tx: [5, 10], jc: [10, 20], wu: [5, 10], xb: [10, 20], ny: [10, 20] };
  const kindOf = k => /^el_/.test(k) ? 'el' : /^res_/.test(k) ? 'res' : k;
  const isTop = (ln, t) => { const [k, v] = CR.parse(ln), a = TOP[kindOf(k)]; return !!a && v >= a[Math.min(2, Math.max(1, t || 1)) - 1]; };
  const ACC_V = { 1: { xj: [10], tx: [5], jc: [10], wu: [5], xb: [10], ny: [10] }, 2: { xj: [15, 20], tx: [8, 10], jc: [15, 20], wu: [8, 10], xb: [15, 20], ny: [15, 20] } };   // 同 r400

  // 一个人全身合计的封顶抬一点（灵珠改加副属性以后，一件兵器镶三颗就能有三四十点「火系伤害」）
  try { const SC = G5.SUB_CAP; if (SC) { SC.crit = .3; SC.guard = .3; for (const el of ORDER) { SC['el_' + el] = .5; SC['res_' + el] = .4; } } } catch (e) {}

  // =====================================================================================================
  // 灵韵：合出红装那一下的小运气，按部位随机一条（金装）
  // =====================================================================================================
  const LY = { weapon: [['lianzhan', '连斩', '普攻时一成几率多砍一下（半伤）'], ['zhanyao', '斩妖', '打首领伤害多一成']],
    wrist: [['jishi', '疾势', '打倒一个敌人后，行动条往前推一截'], ['poshi', '破势', '打中时有几率打掉对方的防御姿态']],
    armor: [['huxin', '护心', '一场里头一回倒下时，留 1 点气血'], ['huiyuan', '回元', '气血头一回跌破三成时，回一成气血']],
    shoe: [['tafeng', '踏风', '逃跑必成；开打时身法快一步'], ['qingyan', '身轻如燕', '被群攻时有几率只挨一半']],
    acc: [['juling', '聚灵', '施展仙术少花一成灵力'], ['fuyuan', '福缘', '打完一场掉宝的机会多一点']] };
  const LYI = {}; for (const sl in LY) for (const [k, n, d] of LY[sl]) LYI[k] = { k, n, d, sl };

  // =====================================================================================================
  // 六、灵珠：加副属性，不再加主属性
  // =====================================================================================================
  // 一到五级：某系伤害 / 某系减伤 各加多少。11-28 实测后压过一回（原来五级 +14，三颗就是「火系伤害 +42」，练气档神装打首领比凝丹档紫装高一倍，
  //   超过了作者说的「追上下一档紫装」；现在三颗五级 +24，神装比凝丹档紫装高两成左右）
  const GEM_V = { dmg: [2, 3, 4, 6, 8], res: [3, 4, 6, 8, 10] };
  const tokEl = t => String(t || '').replace(/\d+$/, ''), tokLv = t => +((/(\d+)$/.exec(String(t || '')) || [])[1] || 1);
  const isMatTok = t => String(t || '').startsWith('m:');   // 珍稀料镶进窍里记成 m:料:那一条，比如 m:m_xingjing:el_huo:8
  function tokLine(tok, slot) { tok = String(tok || ''); if (isMatTok(tok)) { const p = tok.split(':'); return [p[2], +p[3]]; } const el = tokEl(tok), lv = Math.min(5, tokLv(tok)); if (!WX[el]) return null; return ATK_SLOT[slot] ? ['el_' + el, GEM_V.dmg[lv - 1]] : ['res_' + el, GEM_V.res[lv - 1]]; }
  const tokItem = tok => isMatTok(tok) ? tok.split(':')[1] : CR.gemId(tokEl(tok), tokLv(tok));
  const tokName = tok => (ITEM_DB[tokItem(tok)] || {}).name || '?';
  // 老规矩里灵珠加主属性的那一层（r394 的 gemWrap）：把它认的主属性改成一个不存在的名字，它就只加 0
  for (const el of ORDER) if (CR.GEM[el]) CR.GEM[el][1] = '_gf467';
  for (const el of ORDER) for (let lv = 1; lv <= 5; lv++) { const it = ITEM_DB[CR.gemId(el, lv)]; if (!it) continue;
    it.desc = (lv > 1 ? '两颗' + (lv > 2 ? '低一级的' : '') + elN(el) + '灵珠合成的' + '一二三四五'[lv - 1] + '级灵珠。' : '五枚' + elN(el) + '精炼成的一颗珠子。') + '镶进装备的灵窍：兵器、护腕、饰品上是「' + elN(el) + '系伤害 +' + GEM_V.dmg[lv - 1] + '」，衣甲、鞋履上是「' + elN(el) + '系减伤 +' + GEM_V.res[lv - 1] + '」。'
      + (lv < 5 ? '两颗一样的能合成高一级的' + (lv >= 2 ? '（还要一样珍稀料' + (lv === 4 ? '，五级要万妖塔里的料' : '') + '）' : '') + '。' : '已是最高一级。'); }
  const RARE = () => Object.keys(MAT).filter(id => MAT[id].g >= 3 && ITEM_DB[id]);
  const TOWER_MATS = ['m_qnhantie'];   // 万妖塔里才有的料（r427）：合五级灵珠要它
  const have = id => ((H().bag || {})[id] || 0);
  // 要用一样珍稀料时挑哪一样：tower=true 只认万妖塔的料；先挑没带副属性的、身上最多的那种
  function rareFor(tower) { const ids = (tower ? TOWER_MATS : RARE()).filter(id => ITEM_DB[id] && have(id) > 0); if (!ids.length) return null;
    ids.sort((a, b) => (have(b) - CR.linesOf(b).length) - (have(a) - CR.linesOf(a).length) || have(b) - have(a)); return ids[0]; }
  // 退一颗珠子 / 一样料回行囊。料要连它那一条副属性一起退（addItem 会给新到手的料另摇一条，摇完换回原来那条）
  function giveTok(tok) { if (!tok) return; if (!isMatTok(tok)) { const g = tokItem(tok); if (ITEM_DB[g]) addItem(g, 1); return; }
    const p = tok.split(':'), id = p[1], ln = p[2] + ':' + p[3], q = (H().mq = H().mq || {}), n0 = (q[id] || []).length; addItem(id, 1); const a = q[id] || (q[id] = []); a.length = Math.min(a.length, n0); a.push(ln); }
  function takeTok(tok) { if (!isMatTok(tok)) { const g = tokItem(tok); if (have(g) <= 0) return false; CR.take(g, 1); return true; }
    const p = tok.split(':'), id = p[1], ln = p[2] + ':' + p[3]; if (!CR.stacks(id).some(s => s.ln === ln)) return false; CR.takeUnit(id, ln); return true; }

  // =====================================================================================================
  // 副属性读数：r389 的战斗钩子看 it.fx5（这件身上每条副属性 + 窍里的珠 / 料 + +5 那一条 + 灵韵）
  // =====================================================================================================
  const PLUS5 = slot => ATK_SLOT[slot] ? ['crit', 3] : ['guard', 3];
  function fxCalc(id) { const it = ITEM_DB[id]; if (!it || !it.slot) return {}; const fx = {}, add = (k, v) => { fx[k] = (fx[k] || 0) + (PCT(k) ? v / 100 : v); };
    for (const ln of linesOf(id)) { const [k, v] = CR.parse(ln); add(k, v); }
    for (const g of gemsOf(id)) if (g) { const l = tokLine(g, it.slot); if (l && CR.SUB[l[0]]) add(l[0], l[1]); }
    if (refLv(id) >= 5) { const [k, v] = PLUS5(it.slot); add(k, v); }
    const r = recOf(id); if (r && r.ly && LYI[r.ly]) { fx['ly_' + r.ly] = 1; if (r.ly === 'fuyuan') fx.xb = (fx.xb || 0) + .15; }
    return fx; }
  const subsLong = id => linesOf(id).map(l => CR.lineText(l));
  function sockText(id, short) { const it = ITEM_DB[id]; return gemsOf(id).map(g => { if (!g) return '空'; const l = tokLine(g, it.slot); return short ? CR.subText(l[0], l[1], true) : tokName(g) + '（' + CR.subText(l[0], l[1]) + '）'; }).join(short ? ' ' : '、'); }
  function descOf(id, lore) { const it = ITEM_DB[id], r = recOf(id), ls = subsLong(id), k = socksOf(id), out = [];
    out.push('【' + gradeWord(id) + (XIAN[id] ? ' · 仙器' : '') + '】');
    out.push(ls.length ? '副属性：' + ls.join('，') + '。' : '没有副属性。');
    if (k) out.push('灵窍 ' + k + '：' + sockText(id) + '。');
    if (refLv(id) >= 5) { const [pk, pv] = PLUS5(it.slot); out.push('强化 +5：' + CR.subText(pk, pv) + '。'); }
    if (r && r.ly && LYI[r.ly]) out.push('灵韵「' + LYI[r.ly].n + '」：' + LYI[r.ly].d + '。');
    return out.join('') + String(lore || ''); }
  // 给一件装备套上读数：fx5（战斗用）、subs（几处界面列副属性用）、desc（说明里写清副属性、灵窍、灵韵）
  function decorate(id, loreFn) { const it = ITEM_DB[id]; if (!it || it._gf467) return; it._gf467 = 1;
    const d0 = Object.getOwnPropertyDescriptor(it, 'desc'); let lore = d0 ? (d0.get ? d0.get.call(it) : d0.value) : '';
    Object.defineProperty(it, 'desc', { configurable: true, enumerable: true, get: () => descOf(id, loreFn ? loreFn() : lore), set(v) { if (!loreFn) lore = v; } });
    Object.defineProperty(it, 'fx5', { configurable: true, enumerable: true, get: () => fxCalc(id), set() {} });
    Object.defineProperty(it, 'subs', { configurable: true, enumerable: true, get: () => subsLong(id), set() {} }); }
  // r400 每登记一件炉子里的装备都来这里一回（r400_craft.js 的 reg 末尾）：名字去掉「（上品）」，不挂成色小牌，说明换成新的
  window.FG_REG = (xid, it, e) => { if (!it || !e) return; it.name = baseName(e.b); it.grade = 1; it.mult = 1; decorate(xid, () => String((ITEM_DB[e.b] || {}).desc || ''));
    const B = ITEM_DB[e.b] || {}; it.sell = Math.max(1, Math.round((B.sell || 60) * (1 + .12 * Math.max(0, gradeOf(xid))))); };
  for (const xid of Object.keys((H() && H().fg) || {})) { try { CR.reg(xid, true); } catch (e) {} }

  // 新登记一件独一份的装备（主属性就是原型的数：m 固定 1）
  function newInst(base, s, k, ly) { const h = H(); h.fgn = (h.fgn || 0) + 1; const xid = base + '~' + h.fgn;
    FG()[xid] = { b: base, m: 1, s: (s || []).map(l => Array.isArray(l) ? l[0] + ':' + l[1] : l), k: k || 0, ly: ly || null, v: 467 }; CR.reg(xid, true); return xid; }
  // 七、强化按件记：店里买的那种普通装备（同一个名字牌好几件）要强化、合成时，先分出「这一件」单独记。who：'hero' / 队友 / null（行囊里）
  function split(id, who) { if (isInst(id) || XIAN[id]) return id; const it = ITEM_DB[id], h = H(); if (!it || !it.slot) return id;
    const eqA = who && who !== 'hero' && S.allyEq && S.allyEq[who];
    if (who === 'hero' ? h.equip[it.slot] !== id : eqA ? eqA[it.slot] !== id : (h.bag[id] || 0) <= 0) return id;
    const xid = newInst(id, [], 0, null);
    if (who === 'hero') h.equip[it.slot] = xid; else if (eqA) eqA[it.slot] = xid;   // 换的是同一件东西的名字牌，主属性一点不变，不用补差额
    else { h.bag[id]--; if (h.bag[id] <= 0) delete h.bag[id]; h.bag[xid] = 1; }
    return xid; }

  // =====================================================================================================
  // 八、仙器：星痕剑把佩剑 +12 并进剑身；流云仙衣跟着等级长
  // =====================================================================================================
  const OLDRAW = {};   // 改数以前的底数（老存档补差额用）
  function setRaw(id, st) { const it = ITEM_DB[id]; if (!it) return; OLDRAW[id] = OLDRAW[id] || (() => { const o = {}; for (const k of KEYS) o[k] = it[k] || 0; return o; })();
    for (const k of KEYS) { const v = st[k] || 0, d = Object.getOwnPropertyDescriptor(it, k); if (d && (d.get || d.set)) it[k] = v; else if (v) it[k] = v; else delete it[k]; }
    try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {} }
  window.XH_FOLD = 1;   // index.html 里叶孤星战斗 / 属性面板的「佩剑 +12」看这个，不再另加（并进剑身了）
  if (ITEM_DB.w_xinghen) { setRaw('w_xinghen', { atk: 40 }); ITEM_DB.w_xinghen.desc = '叶孤星专属 · 专为九曜剑典打造的仙器。九曜剑典剑招威力 +30%，杀招每战多 1 次。原来的「佩剑 +12」已经并进剑身（攻击 40），强化也吃得到；剑上开着两个灵窍'; }
  if (ITEM_DB.w_xinghen2) { setRaw('w_xinghen2', { atk: 48 }); ITEM_DB.w_xinghen2.desc = '叶孤星专属 · 星痕剑升为中品玄器。九曜剑典剑招威力 +30%，杀招每战多 1 次。「佩剑 +12」已并进剑身（攻击 48）；两个灵窍'; }
  // 九、前期过强的剧情装：拉回本档（名字不改）。竹影法衣、青竹劲装 → 练气档衣服；照胆镜 → 凝丹档饰品；妖王战袍 → 凝丹档衣服
  const STORY = { a_qz_jinzhuang: { def: 11, maxhp: 70, spd: 1 }, a_qz_zhuying: { def: 14, maxhp: 95, maxmp: 25 }, acc_zhaodan: { atk: 7, spd: 2 }, a_yaowang: { def: 20, maxhp: 145, atk: 3 } };
  for (const id in STORY) setRaw(id, STORY[id]);
  // 流云仙衣：等于这一档最好的衣服强化满那么强、再多一点（affix_plan 第三节 6 的表），中间的等级按直线插
  const LYP = [[9, 25, 160], [10, 26, 170], [11, 39, 275], [14, 42, 299], [20, 48, 347], [21, 55, 390], [30, 64, 462], [40, 85, 622]];
  function lyTarget(lv) { if (lv <= LYP[0][0]) return { def: LYP[0][1], maxhp: LYP[0][2] };
    for (let i = 1; i < LYP.length; i++) if (lv <= LYP[i][0]) { const [a, d0, h0] = LYP[i - 1], [b, d1, h1] = LYP[i], t = (lv - a) / (b - a); return { def: Math.round(d0 + (d1 - d0) * t), maxhp: Math.round(h0 + (h1 - h0) * t) }; }
    const L = LYP[LYP.length - 1]; return { def: L[1], maxhp: L[2] }; }
  // 读数看「已经算到人身上的那一份」（flags.gf_lyv），升了级由下面的钟点去把差额补到人身上——这样穿上、脱下用的永远是同一个数
  const lyCur = () => { try { return F().gf_lyv || { def: 22, maxhp: 160 }; } catch (e) { return { def: 22, maxhp: 160 }; } };
  if (ITEM_DB.a_liuyun) { const L = ITEM_DB.a_liuyun; for (const k of ['def', 'maxhp']) Object.defineProperty(L, k, { configurable: true, enumerable: true, get: () => lyCur()[k], set() {} });
    L.desc = '爹给的「极品灵器」——其实是一件极品仙器，可随意幻化模样。不用强化：防御、气血跟着叶孤星的修为自己长，永远是同一档最好的衣服。开着两个灵窍'; L.heroOnly = true; }
  setInterval(() => { try { const h = H(); if (!h || !ITEM_DB.a_liuyun || typeof h.lv !== 'number') return; const t = lyTarget(h.lv), c = lyCur(); if (t.def === c.def && t.maxhp === c.maxhp) return;
      if (h.equip && h.equip.armor === 'a_liuyun') { h.def += t.def - c.def; h.maxhp += t.maxhp - c.maxhp; h.hp = Math.max(1, Math.min(h.hp, h.maxhp)); } F().gf_lyv = t; } catch (e) {} }, 500);
  for (const id in XIAN) if (ITEM_DB[id]) decorate(id);

  // =====================================================================================================
  // 十、老存档换算（每份存档一回：flags.gf467）
  // =====================================================================================================
  // 老规矩：强化每级 +15%（至少 +1）——没变；灵珠加主属性（金攻、木血、水灵、火速、土防，同五行多五成）——改成加副属性；
  //   炉子里打的有「成色」0.80～1.25——改成固定 1（主属性就是格子表的数）；强化、镶珠按「这一种装备」记——改成按件记。
  // 做法照 r406 fixSave：先按老规矩把叶孤星身上每件算一遍，换算完再读一遍新的，差额补到他身上。队友的属性是现算的，不用补。
  const OLD_GEM = { jin: 'atk', mu: 'maxhp', shui: 'maxmp', huo: 'spd', tu: 'def' };
  function oldSockN(id) { const it = ITEM_DB[id]; if (!it || !it.slot || /^w_xinghen/.test(id)) return 0; const t6 = G6.tierOf(id); if (t6) return t6 >= 2 ? 2 : 1; const st = G5.setOfItem(id); return (st && st.tier >= 2) || (it.lvReq || 0) >= 10 ? 2 : 1; }
  function oldGemMain(id, k) { let t = 0; for (const g of (((H().gems || {})[id]) || []).slice(0, oldSockN(id))) { if (!g || isMatTok(g)) continue; const el = tokEl(g), lv = Math.min(5, tokLv(g)); if (OLD_GEM[el] !== k || !CR.GEM_V[el]) continue; const v = CR.GEM_V[el][lv - 1]; t += WX5.GEAR[id] === el ? Math.round(v * 1.5) : v; } return t; }
  function rawBase(base, k) { if (OLDRAW[base]) return OLDRAW[base][k] || 0; const h = H(), Rf = (h.refine = h.refine || {}), r0 = Rf[base]; delete Rf[base]; try { return ITEM_DB[base][k] || 0; } finally { if (r0) Rf[base] = r0; } }
  function oldEff(id) { const h = H(), e = h.fg && h.fg[id], base = e ? e.b : id, out = {};
    // 流云仙衣：老规矩下也能强化（强化那层套在 防 22 / 血 160 上）；新规矩它不强化了，读数里没有那一层——换算时把那一层从人身上扣回
    for (const k of KEYS) { if (base === 'a_liuyun') { const l = ((h.refine || {})[id]) || 0, r0 = { def: 22, maxhp: 160 }[k] || 0; out[k] = (ITEM_DB[id][k] || 0) + (l && r0 ? Math.max(l, Math.round(r0 * .15 * l)) : 0) + oldGemMain(id, k); continue; }
      const rb = rawBase(base, k), raw = e ? (rb > 0 ? Math.max(1, Math.round(rb * (+e.m || 1))) : rb) : rb, l = ((h.refine || {})[id]) || 0;
      out[k] = (raw > 0 && l ? raw + Math.max(l, Math.round(raw * .15 * l)) : raw) + oldGemMain(id, k); }
    return out; }
  function convertSave() { const h = H(), f = F(); if (!h || !h.equip || !h.bag || f.gf467) return;
    if (!f.gp406) return;   // r406 先补它那一回
    if (/^w_xinghen/.test(h.equip.weapon || '') && !f.r134_xh) return;   // r134 给很老的存档补星痕剑攻击：等它先补
    for (const sl of SLOTS) { const id = h.equip[sl]; if (id && !ITEM_DB[id]) return; }
    f.gf467 = 1; const worn = {};
    for (const sl of SLOTS) { const id = h.equip[sl]; if (id) worn[sl] = oldEff(id); }
    // 1. 炉子里打过的：成色归一，窍按老规矩的孔数给，副属性照留（最多五条）
    for (const xid of Object.keys(h.fg || {})) { const e = h.fg[xid]; if (!e || e.v === 467) continue; e.m = 1; e.k = oldSockN(xid); e.s = (e.s || []).slice(0, 5); e.ly = null; e.v = 467; try { CR.reg(xid, true); } catch (er) {} }
    // 2. 店里那样的普通装备强化过、镶过珠：分出一件单独记（先给穿在叶孤星身上的，再给队友身上的，再给行囊里的）；同一种的别的几件回到 +0
    const Rf = (h.refine = h.refine || {}), Gm = (h.gems = h.gems || {});
    const ids = new Set([...Object.keys(Rf).filter(id => Rf[id] > 0), ...Object.keys(Gm).filter(id => (Gm[id] || []).some(Boolean))]);
    for (const id of ids) { if (isInst(id) || XIAN[id] || !ITEM_DB[id] || !ITEM_DB[id].slot) continue; const sl = ITEM_DB[id].slot;
      let who = null; if (h.equip[sl] === id) who = 'hero'; else for (const w of S.party || []) { const q = S.allyEq && S.allyEq[w]; if (q && q[sl] === id) { who = w; break; } }
      const lv = Rf[id] || 0, gs = (Gm[id] || []).slice(0, oldSockN(id)), k = gs.some(Boolean) ? oldSockN(id) : 0; delete Rf[id]; delete Gm[id];
      if (!who && !(h.bag[id] > 0)) continue; const xid = split(id, who); if (xid === id) continue;
      h.fg[xid].k = k; if (lv) Rf[xid] = lv; if (k) Gm[xid] = gs; try { CR.reg(xid, true); } catch (er) {} }
    if (Rf.a_liuyun) delete Rf.a_liuyun;   // 流云仙衣不再强化
    // 窍比珠子少的（老存档里孔外头还记着珠子的，界面上看不见、也不生效）：多出来的退回行囊，免得白白丢了
    for (const id of Object.keys(Gm)) { const n = socksOf(id), a = Gm[id] || []; if (!ITEM_DB[id] || a.length <= n) continue; for (let i = n; i < a.length; i++) if (a[i]) giveTok(a[i]); Gm[id] = a.slice(0, n); if (!Gm[id].some(Boolean)) delete Gm[id]; }
    // 3. 叶孤星身上的补差额
    for (const sl in worn) { const id = h.equip[sl]; if (!id || !ITEM_DB[id]) continue; for (const k of KEYS) { const d = (ITEM_DB[id][k] || 0) - worn[sl][k]; if (d) h[k] += d; } }
    h.hp = Math.max(1, Math.min(h.hp, h.maxhp)); h.mp = Math.max(0, Math.min(h.mp, h.maxmp)); }
  setInterval(() => { try { convertSave(); } catch (e) { console.warn('R467 save', e); } }, 600);

  // =====================================================================================================
  // 四、打造：3～5 样料开炉
  // =====================================================================================================
  // 部位：兵饰料多时 5 样 → 兵器、4 样 → 护腕、3 样 → 饰品；防具料多时 5 样 → 衣甲、更少 → 鞋履。五行、出哪一档照老规矩。
  // 料越少越差（作者 11-28 17:38）：出四字极品的机会越小、副属性留得越少、数值往下段摇、窍开得越少。主属性每件固定，不受影响。
  const FORGE = {
    W: { 4: { 1: { 0: 62, 1: 30, 3: 8 }, 2: { 0: 52, 1: 28, 2: 13, 3: 7 } }, 3: { 1: { 0: 99, 3: 1 }, 2: { 0: 99, 3: 1 } } },   // 3、4 样时一格里几件各占几份（5 样照老规矩看相生，见 r400 cellW）
    SUB: { 3: .22, 4: .34 },                                       // 每条料上的副属性留下的机会（5 样看相生：一成五 ~ 六成五，r400 ROLL）
    VAL: n => n >= 5 ? null : n === 4 ? [.75, 1] : [.6, .85],      // 留下的数值打几折（5 样：九折到「每处相生 +5%」）
    SOCK: { 3: .1, 4: .18, 5: .25 }, SOCK_H: .05,                  // 三个窍各自开不开的机会；5 样时每处相生再 +5%
  };
  const U = s => !s ? null : typeof s === 'string' ? { id: s, ln: null } : s;
  const ORIG_AN = CR.analyze, ORIG_CRAFT = CR.craft;
  function cellW2(ids, t, n, Hh, q) { if (n >= 5) return CR.cellW(ids, t, Hh, q); const base = FORGE.W[n][t] || FORGE.W[n][1], w = {};
    for (const id of ids) { const r = G6.rankOf(id); if (r == null || G6.NO_FORGE[id]) continue; const v = base[r] || 0; if (v) w[id] = (w[id] || 0) + v; } return Object.entries(w); }
  function analyze(slots) { const us = slots.map(U), fl = us.filter(Boolean), n = fl.length, o = ORIG_AN(slots);
    if (o.why === 'notmat') return o; if (n < 3) return Object.assign(o, { ok: false, why: 'need3' });
    if (n === 5 && o.ok && o.kind !== 'mix') { if (o.kind === 'fixed') o.pSock = FORGE.SOCK[5]; return o; }   // 秘籍、五样一模一样：照老路
    const ids = fl.map(u => u.id), cl = ids.filter(id => MAT[id].c); if (!cl.length) return Object.assign(o, { ok: false, why: 'noclass' });
    const nW = cl.filter(id => MAT[id].c === 'W').length, nA = cl.length - nW, cls = nW > nA ? 'W' : nA > nW ? 'A' : MAT[cl[0]].c;
    const slot = cls === 'W' ? (n >= 5 ? 'weapon' : n === 4 ? 'wrist' : 'acc') : (n >= 5 ? 'armor' : 'shoe');
    const el = o.el || 'jin', avg = cl.reduce((a, id) => a + MAT[id].g, 0) / cl.length, P = CR.POOL[slot], Hh = o.H || 0;
    let p2 = cl.filter(id => MAT[id].g >= 2).length / cl.length; if (!P[2][el].length) p2 = 0; else if (!P[1][el].length) p2 = 1;
    const m = {}; for (const t of [1, 2]) { const pt = t === 2 ? p2 : 1 - p2; if (pt <= 0) continue; for (const [id, w] of cellW2(P[t][el], t, n, Hh, Math.max(.5, Math.min(2, 1 + .5 * (avg - t))))) m[id] = (m[id] || 0) + w * pt; }
    if (!Object.keys(m).length) return Object.assign(o, { ok: false, why: 'noclass' });
    const FEE = CR.FEE; return Object.assign(o, { ok: true, why: null, kind: 'mix', cls, slot, tier: p2 >= .5 ? 2 : 1, p2, el, cands: Object.entries(m), fee: Math.round((FEE[1] + (FEE[2] - FEE[1]) * p2) / 10) * 10,
      pSub: n >= 5 ? CR.ROLL(Hh)[2] : FORGE.SUB[n], vf: FORGE.VAL(n) || [.9, 1 + .05 * Math.max(0, Math.min(5, Hh))], pSock: Math.min(.6, FORGE.SOCK[n] + (n >= 5 ? FORGE.SOCK_H * Math.max(0, Hh) : 0)),
      accP: slot === 'acc' && n >= 5 ? CR.ACC_P(Hh) : 0, lined: new Set(fl.filter(u => CR.allow(slot, u.ln)).map(u => CR.parse(u.ln)[0])).size, lost: new Set(fl.filter(u => u.ln && !CR.allow(slot, u.ln)).map(u => CR.parse(u.ln)[0])).size }); }
  function craft(slots) { const us = slots.map(U).filter(Boolean), a = analyze(slots); if (!a.ok) return { err: a.why, a };
    if (a.kind === 'recipe' || (a.kind === 'fixed' && a.gem)) return ORIG_CRAFT(slots);   // 秘籍、五枚精炼灵珠：照老路
    const need = {}; for (const u of us) { const k = u.id + '|' + (u.ln || ''); need[k] = (need[k] || 0) + 1; }
    for (const k in need) { const i = k.indexOf('|'), id = k.slice(0, i), ln = k.slice(i + 1), st = CR.stacks(id).find(s => (s.ln || '') === ln); if (!st || st.n < need[k]) return { err: 'lack', a }; }
    if ((H().gold || 0) < a.fee) return { err: 'gold', a };
    for (const u of us) CR.takeUnit(u.id, u.ln); H().gold -= a.fee;
    const base = CR.roll(a), it = ITEM_DB[base]; let lines = [];
    if (a.kind === 'fixed') { if (a.keep) lines = [CR.parse(a.keep)]; }
    else { const [f0, f1] = a.vf;
      for (const u of us) { if (!u.ln || !CR.allow(it.slot, u.ln) || rnd() >= a.pSub) continue; const [k, v] = CR.parse(u.ln), sv = Math.max(1, Math.round(v * (f0 + rnd() * (f1 - f0)))), i = lines.findIndex(l => l[0] === k); if (i < 0) lines.push([k, sv]); else if (sv > lines[i][1]) lines[i][1] = sv; }
      if (it.slot === 'acc' && a.accP && rnd() < a.accP) { const ks = Object.keys(ACC_V[1]), k = pick(ks), vs = ACC_V[G6.tierOf(base) || a.tier] || ACC_V[1]; if (!lines.some(l => l[0] === k)) lines.push([k, pick(vs[k])]); } }
    lines.sort((x, y) => CR.score(y[0] + ':' + y[1]) - CR.score(x[0] + ':' + x[1])); lines = lines.slice(0, 3);   // 打造最多三条（紫装）
    let k = 0; const pS = a.kind === 'fixed' ? FORGE.SOCK[5] : a.pSock; for (let i = 0; i < 3; i++) if (rnd() < pS) k++;
    const id = lines.length || k ? newInst(base, lines, k, null) : base;
    addItem(id, 1); const f = F(); f.forged = (f.forged || 0) + 1;
    return { id, base, lines, k, rank: G6.rankOf(base), tier: G6.tierOf(base), a, grade: gradeOf(id) }; }
  CR.analyze = analyze; CR.craft = craft;

  // =====================================================================================================
  // 五、合成：主装备 + 1～3 件同部位的副装备
  // =====================================================================================================
  // 规矩（作者 11-28 定稿 + 17:34 修正）：
  //   · 合完还是主装备那件：名字、主属性、强化都不变；副装备被吃掉，它们窍里的珠子 / 料退回行囊。
  //   · 主装备身上到顶的副属性（TOP 表）一定留下；其余的和副装备的副属性一起摇：同一条在几件上都有，留下的机会叠加、数值取最高；最多五条。
  //   · 灵窍看几件合计：每个窍各摇一次留不留，最多三窍（合计 8 窍以上大多能合出三窍）。
  //   · 会失败：副装备越差、越少，越容易失败；失败时副装备照样没了，主装备可能丢一条副属性、丢一个窍（越合越差）。
  //   · 护灵符：主装备原有的副属性一条不丢（失败时也不丢）。回炉：花一样珍稀料，把这一回重摇一次（只能一次）。
  //   · 合出五属三窍（红）那一下，小几率多一条灵韵 → 金装。
  const FUSE = {
    // 下面三个数是 11-28 跑了几千回模拟定的（报告里有表）：拿五样相生打出来的装备当副装备，每回随手放三件，中位十四回出红装；专挑绿装以上的，七回左右
    KEEP_MAIN: .75,   // 主装备身上没到顶的那几条，每条留下的机会
    KEEP_SUB: .25,    // 副装备身上的每一条，留下的机会（同一条几件都有就叠加：两件都有 ≈ 四成四，三件都有 ≈ 五成八）
    SOCK_KEEP: .5,    // 几件合计的窍，每个留下的机会（最多三窍）：合计 8 窍时八成五能合出三窍，合计 6 窍六成五，主装备三窍配一件没窍的只有一成多
    LY_P: .12,        // 合出红装那一下，多一条灵韵的机会
    MAXL: 5,
    // 副装备的「好坏合计」Q（每件 = (副属性条数 + 窍数) / 6，紫装满三属三窍算 1）→ 失败几率。一件白装当副装备：四成五失败；三件满紫：半成
    FAIL: [[0, .45], [.5, .35], [1, .26], [1.5, .18], [2, .12], [2.5, .08], [3, .05]],
    FAIL_LOSE_LINE: .7, FAIL_LOSE_SOCK: .5,   // 失败时：七成丢一条（没护住的）副属性，五成丢一个窍
    FEE: { 1: 200, 2: 500 }, WARD: 'f_hulingfu', WARD_PRICE: 300 };
  const qOf = r => Math.min(1, (((r && r.s) || []).length + Math.min(3, (r && r.k) || 0)) / 6);
  // 表里两档之间按直线插（一件绿装比一件白装稍稳一点，不会两件差不多的装备失败几率差一大截）
  function failP(subs) { const Q = subs.reduce((a, r) => a + qOf(r), 0), T = FUSE.FAIL; if (Q <= T[0][0]) return T[0][1];
    for (let i = 1; i < T.length; i++) if (Q <= T[i][0]) { const [q0, p0] = T[i - 1], [q1, p1] = T[i]; return p0 + (p1 - p0) * (Q - q0) / (q1 - q0); } return T[T.length - 1][1]; }
  // 纯算：给主装备的记录（s, k, ly）、部位、档、副装备们的记录，摇一回。不动存档
  function fuseRoll(main, slot, tier, subs, ward) { const ms = (main.s || []).filter(l => CR.SUB[CR.parse(l)[0]]), safe = new Set(ms.filter(l => ward || isTop(l, tier)));
    const out = { fail: false, s: ms.slice(), k: Math.min(3, main.k || 0), ly: main.ly || null, lost: [], gained: [], lostK: 0, newLy: false };
    if (rnd() < failP(subs)) { out.fail = true; const cand = ms.filter(l => !safe.has(l));
      if (cand.length && rnd() < FUSE.FAIL_LOSE_LINE) { const x = pick(cand); out.s = ms.filter(l => l !== x); out.lost = [x]; }
      if (out.k > 0 && rnd() < FUSE.FAIL_LOSE_SOCK) { out.k--; out.lostK = 1; } return out; }
    const pool = {}; const put = (ln, p, force) => { const [k, v] = CR.parse(ln); if (!CR.SUB[k] || !CR.allow(slot, ln)) return; (pool[k] = pool[k] || []).push([v, p, force]); };
    for (const l of ms) put(l, FUSE.KEEP_MAIN, safe.has(l));
    for (const r of subs) for (const l of (r.s || [])) put(l, FUSE.KEEP_SUB, false);
    const kept = [];
    for (const k in pool) { const e = pool[k], v = Math.max(...e.map(x => x[0])), force = e.some(x => x[2]); let ok = force; if (!ok) { let miss = 1; for (const x of e) miss *= 1 - x[1]; ok = rnd() >= miss; } if (ok) kept.push({ ln: k + ':' + v, force }); }
    kept.sort((a, b) => (b.force - a.force) || (CR.score(b.ln) - CR.score(a.ln)));
    out.s = kept.slice(0, FUSE.MAXL).map(x => x.ln);
    const keyOf = l => CR.parse(l)[0]; out.lost = ms.filter(l => !out.s.some(x => keyOf(x) === keyOf(l))); out.gained = out.s.filter(x => !ms.some(l => keyOf(l) === keyOf(x)));
    const Tk = Math.min(3, main.k || 0) + subs.reduce((a, r) => a + Math.min(3, r.k || 0), 0); let k = 0; for (let i = 0; i < Tk; i++) if (rnd() < FUSE.SOCK_KEEP) k++;
    out.k = Math.min(3, k); out.lostK = Math.max(0, Math.min(3, main.k || 0) - out.k);
    if (!out.ly && out.s.length >= 5 && out.k >= 3 && rnd() < FUSE.LY_P) { out.ly = pick(LY[slot])[0]; out.newLy = true; }
    return out; }
  const snapRec = id => { const r = recOf(id) || { s: [], k: 0, ly: null }; return { s: (r.s || []).slice(), k: r.k || 0, ly: r.ly || null }; };
  // 把摇出来的结果落到主装备上；窍少了，多出来的珠子 / 料退回行囊（返回退了哪几样，回炉时要收回来）
  function applyRes(id, res) { const r = recOf(id); r.s = res.s.slice(); r.k = res.k; r.ly = res.ly; const G = (H().gems = H().gems || {}), a = (G[id] || []).slice(), back = [];
    for (let i = res.k; i < a.length; i++) if (a[i]) { back.push(a[i]); giveTok(a[i]); } G[id] = a.slice(0, res.k); if (!G[id].some(Boolean)) delete G[id]; return back; }
  // 吃掉一件副装备：独一份的连记录一起删，窍里的东西退回行囊
  function eat(id) { const h = H(); h.bag[id] = (h.bag[id] || 0) - 1; if (h.bag[id] <= 0) delete h.bag[id];
    if (isInst(id) && !(h.bag[id] > 0)) { for (const g of (((h.gems || {})[id]) || [])) if (g) giveTok(g); if (h.gems) delete h.gems[id]; delete h.fg[id]; if (h.refine) delete h.refine[id]; } }
  // 合一回。main：{ id, who }；subs：行囊里的名字牌。返回 { id（主装备现在的名字牌）, res, before, snap } 或 { err }
  function fuse(main, subs, ward) { const h = H(); if (!main || !ITEM_DB[main.id] || !subs.length) return { err: 'empty' }; const slot = ITEM_DB[main.id].slot, tier = Math.max(1, G6.tierOf(main.id) || 1), fee = FUSE.FEE[Math.min(2, tier)];
    const cnt = {}; for (const s of subs) cnt[s] = (cnt[s] || 0) + 1; if (main.who == null) cnt[main.id] = (cnt[main.id] || 0) + 1;
    for (const s in cnt) if (have(s) < cnt[s]) return { err: 'lack' };
    if (subs.some(s => XIAN[s] || !ITEM_DB[s] || ITEM_DB[s].slot !== slot)) return { err: 'slot' };
    if ((h.gold || 0) < fee) return { err: 'gold', fee }; if (ward && have(FUSE.WARD) <= 0) return { err: 'ward' };
    const id = split(main.id, main.who); if (!recOf(id)) return { err: 'empty' };
    h.gold -= fee; if (ward) CR.take(FUSE.WARD, 1);
    const subRecs = subs.map(snapRec), before = snapRec(id); before.gems = ((h.gems || {})[id] || []).slice();
    for (const s of subs) eat(s);
    const res = fuseRoll(before, slot, tier, subRecs, ward), back = applyRes(id, res); const f = F(); f.fused = (f.fused || 0) + 1;
    return { id, res, before, snap: { id, slot, tier, before, subRecs, ward, back, used: false } }; }
  // 回炉：花一样珍稀料，把刚才那一回按原样重摇（只能一次）
  function redo(snap) { if (!snap || snap.used) return { err: 'used' }; const mid = rareFor(false); if (!mid) return { err: 'rare' };
    for (const t of snap.back) if (!takeTok(t)) return { err: 'back' };
    CR.take(mid, 1); snap.used = true; const r = recOf(snap.id); r.s = snap.before.s.slice(); r.k = snap.before.k; r.ly = snap.before.ly; const G = (H().gems = H().gems || {}); G[snap.id] = snap.before.gems.slice(); if (!G[snap.id].length) delete G[snap.id];
    const res = fuseRoll(snap.before, snap.slot, snap.tier, snap.subRecs, snap.ward); snap.back = applyRes(snap.id, res); return { id: snap.id, res, mat: mid }; }
  // 护灵符：铸剑师那儿用灵石买
  if (!ITEM_DB[FUSE.WARD]) ITEM_DB[FUSE.WARD] = { name: '护灵符', price: FUSE.WARD_PRICE, sell: 60, cat: '材料', r467: 1, desc: '铸剑师画的一道黄符。合成时贴在主装备上：主装备原有的副属性一条不丢（合砸了也不丢）。一回用一张。剑炉「合成」那一页能买。' };

  // =====================================================================================================
  // 图标：圈的颜色按颜色品级；红、金外面再罩一层光；底下一排小圆点是灵窍（空的是暗圈，镶了的亮）
  // =====================================================================================================
  const ELC = { jin: '#e8ecf2', mu: '#7fd88f', shui: '#7cc0ff', huo: '#ff8a50', tu: '#e2b060' };
  if (typeof itemIcon === 'function') itemIcon = (orig => function (id, x, y, r) {
    const it = ITEM_DB[id];
    if (id === FUSE.WARD) { const im = art('hulingfu'); ctx.save(); if (im) ctx.drawImage(im, x - r * 1.05, y - r * 1.05, r * 2.1, r * 2.1); else {   // 护灵符占位：深色圆底上一张黄符
        const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)'); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = '#f0c040'; ctx.stroke();
        ctx.fillStyle = '#f2d36a'; ctx.fillRect(x - r * .32, y - r * .62, r * .64, r * 1.24); ctx.fillStyle = '#b8241c'; ctx.font = `700 ${Math.round(r * .5)}px ${KAI()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('护', x, y - r * .26); ctx.fillText('灵', x, y + r * .26); } ctx.restore(); return; }
    const res = orig.apply(this, arguments);
    try { if (it && it.slot && r >= 11) { const g = gradeOf(id), col = GRADES[g][1], fr = art('frame_' + g); ctx.save();
        if (fr) ctx.drawImage(fr, x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
        else { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.lineWidth = Math.max(1.8, r * .1); ctx.strokeStyle = col; ctx.stroke();
          if (g >= 5) { ctx.globalAlpha = .3 + .12 * Math.sin(performance.now() / 300); ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; } }
        if (XIAN[id] && r >= 16) { const bx = x - r * .74, by = y - r * .74, br = Math.max(7, r * .34); ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fillStyle = 'rgba(40,24,6,.95)'; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#ffd75a'; ctx.stroke(); ctx.font = `700 ${Math.round(br * 1.25)}px ${KAI()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9a0'; ctx.fillText('仙', bx, by + 1); }
        const k = socksOf(id); if (k && r >= 16) { const gs = gemsOf(id), dr = Math.max(3.2, r * .15), se = art('socket_empty'), sf = art('socket_full');
          for (let i = 0; i < k; i++) { const sx = x + (i - (k - 1) / 2) * dr * 2.6, sy = y + r * .9, t = gs[i];
            if (t && sf) ctx.drawImage(sf, sx - dr * 1.3, sy - dr * 1.3, dr * 2.6, dr * 2.6); else if (!t && se) ctx.drawImage(se, sx - dr * 1.3, sy - dr * 1.3, dr * 2.6, dr * 2.6);
            else { ctx.beginPath(); ctx.arc(sx, sy, dr, 0, 7); ctx.fillStyle = t ? (isMatTok(t) ? '#ffd75a' : ELC[tokEl(t)] || '#fff') : 'rgba(8,12,16,.92)'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = t ? 'rgba(255,255,255,.85)' : 'rgba(214,196,140,.8)'; ctx.stroke(); } } }
        ctx.restore(); } } catch (e) { try { ctx.restore(); } catch (e2) {} }
    return res; })(itemIcon);

  // =====================================================================================================
  // 十一、灵韵在战斗里（+5 那一条、副属性、灵珠都在 it.fx5 里，r389 的钩子照算）
  // =====================================================================================================
  const whoOf = u => !u || u.side !== 'hero' ? null : (u.ally || 'hero');
  const ufx = u => { const w = whoOf(u), b = typeof battle !== 'undefined' && battle; if (!w || !b) return {}; b._gfFx = b._gfFx || {}; return b._gfFx[w] || (b._gfFx[w] = G5.activeFx(w)); };
  const ft = (u, s, c) => { try { floatText(u.x, u.y - u.h - 34, s, c || '#ffd75a', 32); } catch (e) {} };
  if (typeof applyDamage === 'function') applyDamage = (orig => function (t, d, crit, opts) { const b = battle; let extra = 0, att = null, fxA = null, fxT = null;
    try { att = b && b.active; if (b && t && t.alive && !(b.cfg && b.cfg.sunKill)) {
        if (t.side === 'enemy' && att && att.side === 'hero') { fxA = ufx(att); let k = 1;
          if (fxA.ly_zhanyao && (t.boss || (b.cfg && b.cfg.boss))) k *= 1.1;   // 斩妖：打首领伤害多一成
          if (fxA.ly_poshi && t.buffs && (t.buffs.def || t.buffs.shield) && rnd() < .3) { delete t.buffs.def; delete t.buffs.shield; ft(t, '破势', '#ffb070'); }
          if (k !== 1) arguments[1] = Math.max(1, Math.round(d * k));
          if (fxA.ly_lianzhan && b.curSk === 'atk' && b._gfLz !== b._actNo) { b._gfLz = b._actNo; if (rnd() < .1) extra = Math.max(1, Math.round(arguments[1] * .5)); } }   // 连斩：一次普攻只摇一回
        else if (t.side === 'hero') { fxT = ufx(t);
          if (b._aoe && fxT.ly_qingyan && rnd() < .35) { arguments[1] = Math.max(1, Math.round(arguments[1] * .5)); ft(t, '身轻如燕', '#bfe8ff'); }
          if (fxT.ly_huxin && !t._gfHx && t.hp > 1 && arguments[1] >= t.hp) { arguments[1] = t.hp - 1; t._gfHx = 1; ft(t, '护心', '#ffd75a'); } } } } catch (e) {}
    const r = orig.apply(this, arguments);
    try { if (extra && t.alive) { ft(t, '连斩', '#ffd34a'); orig.call(this, t, extra, false); }
      if (fxA && fxA.ly_jishi && t.side === 'enemy' && !t.alive && att && att.alive) { att.gauge = Math.min(99, (att.gauge || 0) + 35); ft(att, '疾势', '#ffd75a'); }
      if (fxT && fxT.ly_huiyuan && t.alive && !t._gfHy && t.hp < t.maxhp * .3) { t._gfHy = 1; const v = Math.round(t.maxhp * .1); t.hp = Math.min(t.maxhp, t.hp + v); ft(t, '回元 +' + v, '#8fe39a'); } } catch (e) {}
    return r; })(applyDamage);
  // 聚灵：这一手花的灵力退一成
  if (typeof doHeroAction === 'function') doHeroAction = (orig => async function (k) { const b = battle, u = b && b.P, mp0 = u ? u.mp : 0; const r = await orig.apply(this, arguments);
    try { if (b && battle === b && u && u.alive && k !== 'item' && u.mp < mp0 && ufx(u).ly_juling) { const back = Math.round((mp0 - u.mp) * .1); if (back > 0) { u.mp = Math.min(u.maxmp, u.mp + back); ft(u, '聚灵 +' + back, '#9cc3e8'); } } } catch (e) {} return r; })(doHeroAction);
  // 踏风：开打时行动条先走一截；逃跑必成（battle_menu2.js 问 FLEE_SURE）
  if (typeof updateBattle === 'function') updateBattle = (orig => function (dt) { try { const b = battle; if (b && !b._gfStart && b.units && b.state === 'run') { b._gfStart = 1;
        for (const u of b.units) if (u.side === 'hero' && u.alive && ufx(u).ly_tafeng) { u.gauge = Math.min(99, (u.gauge || 0) + 15); ft(u, '踏风', '#cfe8ff'); } } } catch (e) {} return orig.apply(this, arguments); })(updateBattle);
  window.FLEE_SURE = b => { try { return (b.heroes || [b.P]).some(u => u && u.alive && ufx(u).ly_tafeng); } catch (e) { return false; } };

  // =====================================================================================================
  // 十二、剑炉界面
  // =====================================================================================================
  const UI = K.UI, GD = K.GD, GL = K.GL;
  UI.fu = { main: null, subs: [null, null, null], ward: false, res: null, snap: null, t0: -1 };
  const speak = K.speak, armed = K.armed, arm = k => { UI.arm = { k, t: performance.now() }; }, btn = K.btn;
  const statText = id => { const it = ITEM_DB[id]; return KEYS.filter(k => it[k]).map(k => K.STAT_NAME[k] + ' +' + it[k]).join('　'); };
  const lineCol = ln => { const k = CR.parse(ln)[0]; return /^el_/.test(k) ? (ELC[k.slice(3)] || '#9FC98F') : /^res_/.test(k) ? '#9CC3E8' : k === 'crit' || k === 'ke' || k === 'cd' ? '#f0c86a' : '#bfe0a8'; };
  function subsFit(id, w, size) { ctx.font = `600 ${size || 15}px ${KAI()}`; const L = linesOf(id); if (!L.length) return ''; const long = L.map(l => CR.lineText(l)).join('　'); if (ctx.measureText(long).width <= w) return long; return L.map(l => CR.lineText(l, true)).join(' '); }

  // ---- 装备栏（左边）：身上穿的、行囊里的，同一个名字牌在行囊里有几件写 ×几 ----
  function gearList2() { const out = [], h = H(); try { for (const w of ['hero', ...(S.party || [])]) { const e = G5.eqOf(w); for (const sl of SLOTS) if (e[sl] && ITEM_DB[e[sl]] && ITEM_DB[e[sl]].slot) out.push({ id: e[sl], who: w, n: 1 }); }
      const bag = Object.keys(h.bag).filter(id => (h.bag[id] || 0) > 0 && ITEM_DB[id] && ITEM_DB[id].slot).sort((a, b) => SLOTS.indexOf(ITEM_DB[a].slot) - SLOTS.indexOf(ITEM_DB[b].slot) || gradeOf(b) - gradeOf(a));
      for (const id of bag) out.push({ id, who: null, n: h.bag[id] }); } catch (e) {} return out; }
  const LS = { page: 0 }, PER = 20;
  function drawList(title, o) { D('panel_well_9', GL.x, GL.y, GL.w, GL.h); T(title, GL.x + 16, GL.y + 24, 20, C.gold2, BR(), 400); if (o.hint) T(o.hint, GL.x + GL.w - 14, GL.y + 26, 14, C.sub, KAI(), 500, 'right');
    const list = gearList2(), np = Math.max(1, Math.ceil(list.length / PER)); LS.page = Math.min(LS.page, np - 1);
    if (!list.length) T('身上、行囊里都没有装备。', GL.x + 20, GL.y + 90, 16, C.sub);
    list.slice(LS.page * PER, LS.page * PER + PER).forEach((g, i) => { const r = K.gcR(i), on = o.sel && o.sel(g), dim = o.dim && o.dim(g); ctx.save(); if (dim) ctx.globalAlpha *= .32;
      D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(g.id, r.x + r.w / 2, r.y + 38, 27); } catch (e) {}
      ctx.font = `700 14px ${KAI()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (g.who) textOutline(g.who === 'hero' ? '叶' : CR.whoName(g.who).slice(0, 1), r.x + 13, r.y + 14, C.green, 'rgba(6,14,19,.92)', 4); else if (g.n > 1) textOutline('×' + g.n, r.x + 16, r.y + 14, C.text, 'rgba(6,14,19,.92)', 4);
      const bd = o.badge && o.badge(g); if (bd) { ctx.font = `700 14px ${NUM()}`; ctx.textAlign = 'right'; textOutline(bd, r.x + r.w - 6, r.y + 14, C.gold2, 'rgba(6,14,19,.92)', 4); }
      ctx.font = `600 14px ${KAI()}`; T(fitW(baseName(g.id), r.w - 6), r.x + r.w / 2, r.y + r.h - 14, 14, window.GEAR_COL(g.id) || C.text, KAI(), 600, 'center'); ctx.restore(); });
    if (np > 1) { btn(K.GPG.prev, '上一页', LS.page > 0 ? 'n' : 'd', 15); btn(K.GPG.next, '下一页', LS.page < np - 1 ? 'n' : 'd', 15); T((LS.page + 1) + ' / ' + np, GL.x + GL.w / 2, K.GPG.prev.y + 18, 15, C.sub, NUM(), 600, 'center'); } }
  function tapList(tp) { const list = gearList2(), np = Math.max(1, Math.ceil(list.length / PER));
    if (np > 1 && inR(tp, K.GPG.prev)) { if (LS.page > 0) { LS.page--; snd('ui_click'); } return true; } if (np > 1 && inR(tp, K.GPG.next)) { if (LS.page < np - 1) { LS.page++; snd('ui_click'); } return true; }
    const page = list.slice(LS.page * PER, LS.page * PER + PER); for (let i = 0; i < page.length; i++) if (inR(tp, K.gcR(i))) return page[i]; return null; }
  // ---- 右边头部：这件装备的名字（按颜色）、主属性、副属性、灵窍、灵韵 ----
  function head(id) { const it = ITEM_DB[id], g = WX5.GEAR[id], FX = window.REFINE_FX, rl = refLv(id), nowF = performance.now(), tx = GD.x + (rl ? 150 : 130), mw = GD.x + GD.w - 20 - tx;
    if (rl && FX) FX.under(GD.x + 66, GD.y + 70, 44, rl, nowF); try { itemIcon(id, GD.x + 66, GD.y + 70, 44); } catch (e) {} if (rl && FX) FX.slot(GD.x + 6, GD.y + 12, 120, 120, rl, nowF);
    ctx.font = `400 28px ${BR()}`; const nm = fitW(it.name, mw - 90); T(nm, tx, GD.y + 40, 28, window.GEAR_COL(id) || C.gold2, BR(), 400); const nw = ctx.measureText(nm).width;
    T(gradeWord(id) + (XIAN[id] ? ' · 仙器' : ''), tx + nw + 12, GD.y + 42, 16, window.GEAR_COL(id) || C.sub, KAI(), 700);
    ctx.font = `500 16px ${KAI()}`; T(fitW((g ? WX[g].n + '性 · ' : '') + (SLOT_CN[it.slot] || '') + (G6.tierOf(id) ? ' · ' + G6.TIER_CN[G6.tierOf(id)] : '') + '　' + statText(id), mw), tx, GD.y + 72, 16, C.text);
    const sub = subsFit(id, mw, 15); T(sub || '没有副属性', tx, GD.y + 98, 15, sub ? C.green : C.sub, KAI(), 600);
    const k = socksOf(id), r = recOf(id), lyT = r && r.ly && LYI[r.ly] ? '灵韵「' + LYI[r.ly].n + '」' : '';
    ctx.font = `600 15px ${KAI()}`; T(fitW((k ? '灵窍 ' + k + '：' + sockText(id, true) : '没有灵窍') + (lyT ? '　' + lyT : ''), mw), tx, GD.y + 122, 15, lyT ? '#ffd75a' : k ? '#cfe0f0' : C.dim, KAI(), 600); }
  const infoWrap = (s, y, n) => { ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap(s, GD.x + 26, y, GD.w - 52, 28, n || 6); };

  // ================= 打造 =================
  function hints(a) { const gr = a.ns || a.nk ? [a.ns ? '绿 ' + a.ns : '', a.nk ? '红 ' + a.nk : ''].filter(Boolean).join('　') : '', col = a.nk > a.ns ? C.red : a.ns ? C.green : C.text;
    if (!a.n) return ['点左边的材料放上阵盘。三样起就能开炉，料越多越好。', C.sub];
    if (a.why === 'notmat') return ['阵盘上只能放材料。', C.red];
    if (a.n < 3) return ['至少放三样（还差 ' + (3 - a.n) + ' 样）' + (gr ? '　·　' + gr : ''), C.sub];
    if (a.why === 'noclass') return ['至少放一样牙、角、皮、丝之类的料。', C.red];
    if (a.kind === 'recipe') return K.owned(a.recipe.id) ? ['「' + baseName(a.recipe.id) + '」已经有一件了。', C.sub] : ['对上了秘籍：「' + baseName(a.recipe.id) + '」', C.gold2];
    if (a.kind === 'fixed') return a.gem ? ['五枚同一行的精：炼成一颗灵珠。', C.text] : ['五样同出一源，稳当。', C.text];
    const more = a.n < 5 ? '　·　料多些，出好东西的机会大' : '';
    return [(a.ns === 5 ? '一圈全绿 · 五行流转' : gr ? gr + '　·　绿越多越好' : '五行平和') + more, a.n < 5 && !gr ? C.text : col]; }
  function drawSynth(now) { const a = CR.analyze(UI.slots); K.drawMats('材料', null, null, true); K.drawDisc(now, a);
    const res = UI.res, CX = K.CX, topY = K.CY - K.DISC / 2 - 15;
    if (K.saying(now)) { ctx.font = `500 15px ${KAI()}`; T(fitW(K.smith() + '：' + UI.say, 440), CX, topY, 15, C.gold2, KAI(), 500, 'center'); } else if (res) T('出　炉', CX, topY, 16, C.sub, KAI(), 600, 'center');
    if (res && ITEM_DB[res.id]) { const it = ITEM_DB[res.id]; ctx.font = `400 25px ${BR()}`; const nm = fitW(it.name, 300), gw = it.slot ? gradeWord(res.id) : ''; ctx.font = `400 25px ${BR()}`; const w1 = ctx.measureText(nm).width; ctx.font = `700 16px ${KAI()}`; const w2 = gw ? ctx.measureText(gw).width + 10 : 0;
      T(nm, CX - (w1 + w2) / 2, 581, 25, window.GEAR_COL(res.id) || C.gold2, BR(), 400); if (gw) T(gw, CX - (w1 + w2) / 2 + w1 + 10, 583, 16, window.GEAR_COL(res.id), KAI(), 700);
      const k = socksOf(res.id), s0 = it.slot ? subsFit(res.id, 300, 15) : '', sub = it.slot ? (s0 || '没带出副属性') + (k ? '　· 灵窍 ' + k : '') : statText(res.id);
      ctx.font = `600 15px ${KAI()}`; T(fitW(sub, 440), CX, 607, 15, s0 || k ? C.green : C.sub, KAI(), 600, 'center'); }
    else { const h = hints(a); ctx.font = `600 16px ${KAI()}`; T(fitW(h[0], 440), CX, 590, 16, h[1], KAI(), 600, 'center'); }
    btn(K.B_CLEAR, '清　空', a.n ? 'n' : 'd', 17);
    const ng = H().gold || 0, B = K.B_GO;
    if (a.n < 3) btn(B, '至少放三样', 'd', 18); else if (!a.ok) btn(B, '这一炉开不了', 'd', 18); else if (a.kind === 'recipe' && K.owned(a.recipe.id)) btn(B, '已经有一件了', 'd', 18); else if (ng < a.fee) btn(B, '灵石不够（要 ' + a.fee + '）', 'd', 17);
    else btn(B, armed('go') ? (a.kind !== 'recipe' && a.rare ? '里面有珍稀料 · 再点才开炉' : '再点一次 · 开炉') : '打　造　· 灵石 ' + a.fee, armed('go') ? 'p' : 'n', armed('go') && a.kind !== 'recipe' && a.rare ? 15 : 18);
    // 秘籍（照 r394 原样）
    const RB = K.RB; D('panel_well_9', RB.x, RB.y, RB.w, RB.h); const bk = R.art('book'); if (bk) ctx.drawImage(bk, RB.x + 8, RB.y + 2, 46, 46); T('打造秘籍', RB.x + (bk ? 58 : 16), RB.y + 24, 20, C.gold2, BR(), 400); T('只记各人的专属套装', RB.x + RB.w - 14, RB.y + 26, 14, C.sub, KAI(), 500, 'right');
    T('点一条，料齐的会自己摆上去。', RB.x + 16, RB.y + 56, 14, C.sub);
    const rs = CR.RECIPES.filter(CR.recipeShown).slice(0, 4);
    rs.forEach((rc, i) => { const r = K.rcR(i), it = ITEM_DB[rc.id], need = {}; rc.mats.forEach(m => need[m] = (need[m] || 0) + 1); const own = K.owned(rc.id), okAll = !own && Object.keys(need).every(m => have(m) >= need[m]);
      D(okAll ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(rc.id, r.x + 40, r.y + 40, 28); } catch (e) {}
      ctx.font = `400 21px ${BR()}`; T(fitW(baseName(rc.id), 130), r.x + 78, r.y + 24, 21, C.gold2, BR(), 400); T(CR.whoName(rc.who) + ' · 专属', r.x + r.w - 14, r.y + 24, 14, '#f0c86a', KAI(), 600, 'right');
      let x = r.x + 96; Object.keys(need).forEach(m => { const lack = have(m) < need[m]; ctx.save(); if (lack) ctx.globalAlpha *= .42; try { itemIcon(m, x, r.y + 64, 17); } catch (e) {} ctx.restore();
        if (need[m] > 1 || lack) { ctx.font = `700 13px ${NUM()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(lack ? have(m) + '/' + need[m] : '×' + need[m], x + 13, r.y + 78, lack ? C.red : C.gold2, 'rgba(6,14,19,.92)', 4); } x += 46; });
      T(own ? '已有' : okAll ? '料齐' : '', r.x + 40, r.y + 84, 13, own ? C.gold : C.green, KAI(), 600, 'center'); });
    if (!rs.length) T('秘籍上还是空的。', RB.x + 16, RB.y + 110, 16, C.sub);
    ctx.font = `500 14px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap('五样出兵器或衣甲，四样出护腕或鞋，三样出饰品或鞋。料越多、越绿，越容易出好的。', RB.x + 16, RB.y + RB.h - 44, RB.w - 32, 20, 2); }
  function forgeSpeech(r, a) { const it = ITEM_DB[r.id], g = it.slot ? gradeOf(r.id) : -1;
    if (it.gem) return '五枚精炼成一颗「' + it.name + '」。到镶嵌那一页，镶进装备的灵窍里。';
    if (a.kind === 'recipe') return '成了。「' + baseName(r.id) + '」——这一件只认它的主人。';
    const best = r.rank === 3 ? '「' + baseName(r.base) + '」——这一路料里最好的一件，' + (a.n < 5 ? '料这么少也出来了，运气。' : '十炉也未必出一回。') : '';
    const gw = g >= 3 ? '三属三窍都齐了，紫装。' : g === 2 ? '' : '';
    if (a.kind === 'fixed') return '五样同出一源，稳当。' + (r.lines.length ? '头一样料上的那一条，带进去了。' : '');
    return best + (g >= 3 ? gw : r.lines.length + r.k >= 3 ? '带出 ' + r.lines.length + ' 条副属性' + (r.k ? '、开了 ' + r.k + ' 个窍' : '') + '，不错。' : r.lines.length || r.k ? '带出点东西，留着当合成的料也好。' : (a.nk > a.ns ? '五行相克，什么也没留住。下回把相生的两样挨着摆。' : a.n < 5 ? '料少，能成就不错了。' : '成了。中规中矩。')); }
  function tapSynth(tp) { const m = K.tapMats(tp, null, true);
    if (m && m.id) { const i = UI.slots.indexOf(null); if (i < 0) { speak('五格都放满了。点阵盘上的料可以拿下来。'); snd('ui_cancel'); return; } const used = UI.slots.filter(u => u && u.id === m.id && (u.ln || '') === (m.ln || '')).length; if (m.n - used <= 0) { snd('ui_cancel'); return; } UI.slots[i] = { id: m.id, ln: m.ln || null }; UI.res = null; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    if (m) return;
    for (let i = 0; i < 5; i++) { const [x, y] = K.slotXY(i); if (Math.hypot(tp.x - x, tp.y - y) <= K.SEAT + 6) { if (UI.slots[i]) { UI.slots[i] = null; UI.arm = null; snd('ui_click'); } return; } }
    if (inR(tp, K.B_CLEAR)) { if (UI.slots.some(Boolean)) { UI.slots.fill(null); UI.arm = null; snd('ui_click'); } return; }
    const rs = CR.RECIPES.filter(CR.recipeShown).slice(0, 4); for (let i = 0; i < rs.length; i++) if (inR(tp, K.rcR(i))) { const rc = rs[i], need = {}; rc.mats.forEach(q => need[q] = (need[q] || 0) + 1); const lack = Object.keys(need).filter(q => have(q) < need[q]);
        if (K.owned(rc.id)) { speak('「' + baseName(rc.id) + '」已经有一件了，不用再打。'); snd('ui_cancel'); return; }
        if (lack.length) { speak('「' + baseName(rc.id) + '」还差：' + lack.map(q => ITEM_DB[q].name + ' ' + (need[q] - have(q))).join('、') + '。'); snd('ui_cancel'); return; }
        UI.slots = K.fillRecipe(rc); UI.res = null; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    if (!inR(tp, K.B_GO)) return; const a = CR.analyze(UI.slots);
    if (a.n < 3) { speak('至少放三样料才开得了炉。'); snd('ui_cancel'); return; } if (!a.ok) { speak('光有精气不成器。至少放一样牙、角、皮、丝之类的料。'); snd('ui_cancel'); return; }
    if (a.kind === 'recipe' && K.owned(a.recipe.id)) { speak('这一件已经有了，不用再打。'); snd('ui_cancel'); return; } if ((H().gold || 0) < a.fee) { speak('炭火钱不够。'); snd('ui_cancel'); return; }
    if (!armed('go')) { arm('go'); snd('ui_click'); return; }
    UI.arm = null; const r = CR.craft(UI.slots); if (r.err) { speak(r.err === 'gold' ? '炭火钱不够。' : '料不够了。'); snd('ui_cancel'); return; }
    const it = ITEM_DB[r.id], el = (it.gem || WX5.GEAR[r.id] || a.el || 'jin'), g = it.slot ? gradeOf(r.id) : 0; UI.slots.fill(null); UI.res = { id: r.id, t: performance.now() };
    K.burst(K.CX, K.CY, el, g >= 3 || r.rank >= 3 ? 1.4 : 1.15); if (g >= 3 || (r.rank >= 3 && a.kind === 'mix')) setTimeout(() => { if (UI.open) K.burst(K.CX, K.CY, 'jin', 1.7); }, 160);
    try { S.flash = g >= 3 ? .3 : .22; S.flashColor = '#ffe9b8'; } catch (e) {} snd('sfx_sword_ring', .6); try { playSnd('jingle_levelup', .45); } catch (e) {}
    speak(forgeSpeech(r, a)); return 'forged'; }

  // ================= 合成 =================
  const FU = () => { const f = UI.fu; if (f.t0 !== UI.t0) { Object.assign(f, { main: null, subs: [null, null, null], ward: false, res: null, snap: null, t0: UI.t0 }); } return f; };
  const MC = { x: GD.x + GD.w / 2, y: GD.y + 92 }, MCR = { x: MC.x - 62, y: MC.y - 62, w: 124, h: 124 };
  const subC = i => ({ x: GD.x + GD.w / 2 + (i - 1) * 176, y: GD.y + 262 }), SCR = i => { const c = subC(i); return { x: c.x - 54, y: c.y - 54, w: 108, h: 108 }; };
  const BY = GD.y + GD.h - 64, B_WARD = { x: GD.x + 20, y: BY, w: 214, h: 52 }, B_FUSE = { x: GD.x + GD.w / 2 - 122, y: BY, w: 244, h: 52 }, B_REDO = { x: GD.x + GD.w - 234, y: BY, w: 214, h: 52 };
  const subAvail = (f, e) => { if (!e || e.who) return 0; let n = e.n - f.subs.filter(s => s === e.id).length; if (f.main && f.main.who == null && f.main.id === e.id) n--; return n; };
  const recLike = id => recOf(id) || { s: [], k: 0, ly: null };
  function lineRows(x, y, s, mark, max) { s.slice(0, max || 5).forEach((ln, i) => { const m = mark ? mark(ln) : null; ctx.font = `600 16px ${KAI()}`; T(fitW((m && m[0] ? m[0] : '') + CR.lineText(ln), 300), x, y + i * 22, 16, m && m[1] ? m[1] : lineCol(ln), KAI(), 600); }); }
  function drawFuse(now) { const f = FU(), main = f.main && ITEM_DB[f.main.id] ? f.main : (f.main = null);
    drawList(main ? '选副装备（同部位）' : '先选主装备', { hint: main ? '点「主」那件可换' : '', sel: e => main && e.id === main.id && e.who == main.who, dim: e => main && !(e.id === main.id && e.who == main.who) && (ITEM_DB[e.id].slot !== ITEM_DB[main.id].slot || e.who || XIAN[e.id] || subAvail(f, e) <= 0),
      badge: e => main && e.id === main.id && e.who == main.who ? '主' : f.subs.includes(e.id) && !e.who ? '副' : '' });
    D('panel_well_9', GD.x, GD.y, GD.w, GD.h);
    // 铸剑师的话 / 提示写在主装备格左边那块空地上，折成几行（原来挤在顶上一行，长句被省略号吃掉）
    { const sy = K.saying(now), lw = MCR.x - GD.x - 40; ctx.font = `500 ${sy ? 16 : 15}px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = sy ? C.gold2 : C.sub;
      wrap(sy ? K.smith() + '：' + UI.say : main ? '主装备居中，下面三格放同部位的副装备（一到三件）。点「主」那件可以换。' : '点左边一件装备当主装备。合完还是它：名字、主属性、强化都不变。', GD.x + 22, GD.y + 34, lw, 24, 6); }
    // 主装备格
    D(main ? 'card_s_9' : 'card_n_9', MCR.x, MCR.y, MCR.w, MCR.h);
    if (main) { const rl = refLv(main.id), FX = window.REFINE_FX; if (rl && FX) FX.under(MC.x, MC.y, 40, rl, now); try { itemIcon(main.id, MC.x, MC.y, 40); } catch (e) {} if (rl && FX) FX.slot(MCR.x + 2, MCR.y + 2, 120, 120, rl, now);
      ctx.font = `400 22px ${BR()}`; T(fitW(ITEM_DB[main.id].name, 330), MC.x, GD.y + 172, 22, window.GEAR_COL(main.id) || C.gold2, BR(), 400, 'center');
      const r = recLike(main.id); T(gradeWord(main.id) + (XIAN[main.id] ? ' · 仙器' : '') + '　副属性 ' + linesOf(main.id).length + ' · 灵窍 ' + socksOf(main.id) + (r.ly && LYI[r.ly] ? ' · 灵韵「' + LYI[r.ly].n + '」' : ''), MC.x, GD.y + 196, 15, window.GEAR_COL(main.id) || C.sub, KAI(), 600, 'center'); }
    else { T('主', MC.x, MC.y, 40, C.dim, BR(), 400, 'center'); }
    for (let i = 0; i < 3; i++) { const r = SCR(i), c = subC(i), id = f.subs[i]; D(id ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h);
      if (id && ITEM_DB[id]) { try { itemIcon(id, c.x, c.y - 4, 32); } catch (e) {} ctx.font = `600 15px ${KAI()}`; T(fitW(baseName(id), 160), c.x, r.y + r.h + 14, 15, window.GEAR_COL(id) || C.text, KAI(), 600, 'center'); }
      else T('副', c.x, c.y, 30, C.dim, BR(), 400, 'center'); }
    // 对比 / 预览
    const y0 = GD.y + 356, xl = GD.x + 30, xr = GD.x + GD.w / 2 + 16, subs = f.subs.filter(Boolean);
    if (f.res) { const R0 = f.res; T('合成前', xl, y0, 16, C.sub, KAI(), 700); T(R0.res.fail ? '合成后 · 没合好' : R0.res.newLy ? '合成后 · 多了一条灵韵！' : '合成后', xr, y0, 16, R0.res.fail ? C.red : R0.res.newLy ? '#ffd75a' : C.green, KAI(), 700);
      const gb = cnt => { let g = 0; GRADES.forEach((q, i) => { if (cnt >= q[3]) g = i; }); return g; }, b = R0.before, a = R0.res, gB = XIAN[R0.id] ? 6 : gb(b.s.length + b.k + (b.ly ? 1 : 0)), gA = gradeOf(R0.id);
      T(GRADES[gB][0] + '装 · 灵窍 ' + b.k, xl + 70, y0, 15, GRADES[gB][1], KAI(), 700); T(GRADES[gA][0] + '装 · 灵窍 ' + a.k + (a.k !== b.k ? (a.k > b.k ? ' ▲' : ' ▼') : ''), xr + (a.fail ? 150 : a.newLy ? 196 : 70), y0, 15, GRADES[gA][1], KAI(), 700);
      if (!b.s.length) T('没有副属性', xl, y0 + 26, 15, C.dim); lineRows(xl, y0 + 26, b.s, ln => a.lost.includes(ln) ? ['✕ ', C.red] : null);
      if (!a.s.length) T('没有副属性', xr, y0 + 26, 15, C.dim); lineRows(xr, y0 + 26, a.s, ln => a.gained.includes(ln) ? ['＋ ', C.green] : isTop(ln, Math.max(1, G6.tierOf(R0.id))) ? ['顶 ', '#ffd75a'] : null); }
    else if (main) { const r = recLike(main.id), tier = Math.max(1, G6.tierOf(main.id) || 1), sr = subs.map(recLike), Tk = Math.min(3, r.k || 0) + sr.reduce((a, q) => a + Math.min(3, q.k || 0), 0);
      T('主装备现有', xl, y0, 16, C.sub, KAI(), 700); if (!linesOf(main.id).length) T('没有副属性', xl, y0 + 26, 15, C.dim);
      lineRows(xl, y0 + 26, linesOf(main.id), ln => isTop(ln, tier) ? ['顶 ', '#ffd75a'] : null);   // 到顶的那条前面挂个「顶」字（光靠颜色分不出：会心、克制本来就是金色字）
      T('这一炉', xr, y0, 16, C.sub, KAI(), 700);
      if (!subs.length) T('还没放副装备。', xr, y0 + 26, 16, C.dim);
      else { const pf = failP(sr), pool = {}; for (const q of sr) for (const l of q.s || []) { const [k, v] = CR.parse(l); if (CR.allow(ITEM_DB[main.id].slot, l)) pool[k] = Math.max(pool[k] || 0, v); }
        const rows = [['成功几率 约 ' + Math.round((1 - pf) * 10) + ' 成', pf >= .3 ? C.red : pf >= .15 ? '#d9b46a' : C.green], ['灵窍合计 ' + Tk + '（最多合出三窍）', '#cfe0f0'], ['副装备带来 ' + Object.keys(pool).length + ' 条副属性', C.text], [f.ward ? '贴了护灵符：原有的一条不丢' : linesOf(main.id).some(l => isTop(l, tier)) ? '标「顶」的已到顶，一定留下' : '别的每条都要摇，可能散', f.ward ? '#ffd75a' : C.sub]];
        rows.forEach(([s, c], i) => { ctx.font = `600 16px ${KAI()}`; T(fitW(s, GD.w / 2 - 40), xr, y0 + 26 + i * 22, 16, c, KAI(), 600); }); } }
    else { ctx.font = `500 16px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap('拿一件好的当主装备，把同部位的副装备一件件合进去：副属性、灵窍有机会合到主装备身上，最多五属三窍（红装），运气好还多一条灵韵（金装）。副装备越好、越多，越不容易合砸。合砸了会丢东西——贴一张护灵符，主装备原有的副属性就丢不了。', xl, y0 - 4, GD.w - 60, 25, 5); }
    // 按钮
    const nW = have(FUSE.WARD), ng = H().gold || 0;
    btn(B_WARD, f.ward ? '☑ 护灵符（有 ' + nW + '）' : nW ? '☐ 护灵符（有 ' + nW + '）' : armed('buyw') ? '再点 · 买一张' : '☐ 买护灵符 · ' + FUSE.WARD_PRICE, f.ward ? 'p' : 'n', 16);
    if (f.res) { const can = f.snap && !f.snap.used, mid = rareFor(false); btn(B_REDO, !can ? '回炉用过了' : !mid ? '回炉要一样珍稀料' : armed('redo') ? '再点 · 回炉' : '回炉 · ' + ITEM_DB[mid].name, can && mid ? (armed('redo') ? 'p' : 'n') : 'd', 15); }
    if (!main) btn(B_FUSE, '先选主装备', 'd', 18); else if (!subs.length) btn(B_FUSE, '放副装备', 'd', 18);
    else { const fee = FUSE.FEE[Math.min(2, Math.max(1, G6.tierOf(main.id) || 1))]; btn(B_FUSE, ng < fee ? '灵石不够（要 ' + fee + '）' : armed('fuse') ? '再点一次 · 合成' : '合　成 · 灵石 ' + fee, ng < fee ? 'd' : armed('fuse') ? 'p' : 'n', ng < fee ? 16 : 18); }
    // 合成那一下：成了金光一闪，砸了暗红一下（Codex 的特效到了换图）
    if (f.fx && now - f.fx.t < 700) { const k = (now - f.fx.t) / 700, im = art(f.fx.ok ? 'fx_fuse_ok' : 'fx_fuse_fail'); ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (im) { ctx.globalAlpha = 1 - k; const s = 260 * (.6 + .6 * k); ctx.drawImage(im, MC.x - s / 2, MC.y - s / 2, s, s); }
      else { const c = f.fx.ok ? '255,216,120' : '220,60,40'; const g = ctx.createRadialGradient(MC.x, MC.y, 4, MC.x, MC.y, 150 * (.4 + .8 * k)); g.addColorStop(0, `rgba(${c},${.85 * (1 - k)})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(MC.x, MC.y, 170, 0, 7); ctx.fill(); }
      ctx.restore(); } }
  function fuseSpeech(r) { const a = r.res, g = gradeOf(r.id);
    if (a.fail) return (a.lost.length || a.lostK ? '火候没压住——' + (a.lost.length ? '「' + CR.lineText(a.lost[0]) + '」散了' : '') + (a.lost.length && a.lostK ? '，' : '') + (a.lostK ? '还闭了一个窍' : '') + '。' : '火候没压住，白烧了一炉，好在主装备没伤着。') + '副装备好些、多放几件，就不容易砸。';
    if (a.newLy) return '……五属三窍合齐那一下，炉里多出一缕灵韵「' + LYI[a.ly].n + '」。金装。这辈子我也没见过几回。';
    if (g === 5) return '五属三窍，红装。再往上，就看天意了。';
    return (a.gained.length ? '合进来 ' + a.gained.length + ' 条' : '没合进新的') + (a.lost.length ? '，散了 ' + a.lost.length + ' 条' : '') + (a.k > (r.before.k || 0) ? '，多开了 ' + (a.k - r.before.k) + ' 个窍' : a.k < (r.before.k || 0) ? '，闭了 ' + (r.before.k - a.k) + ' 个窍' : '') + '。' + (a.lost.length && !r.snap.ward ? '想稳当，下回贴张护灵符。' : ''); }
  function tapFuse(tp) { const f = FU(), main = f.main && ITEM_DB[f.main.id] ? f.main : null; const e = tapList(tp);
    if (e && e !== true) { f.res = null; if (!main) { f.main = { id: e.id, who: e.who }; f.subs = [null, null, null]; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
      if (e.id === main.id && e.who == main.who) { f.main = null; f.subs = [null, null, null]; f.snap = null; snd('ui_click'); return; }
      const it = ITEM_DB[e.id], mi = ITEM_DB[main.id];
      if (it.slot !== mi.slot) { speak('部位不一样。合成要四件同一部位——这件是' + SLOT_CN[it.slot] + '，主装备是' + SLOT_CN[mi.slot] + '。点「主」那件可以换主装备。'); snd('ui_cancel'); return; }
      if (XIAN[e.id]) { speak('仙器只能当主装备，不能被合掉。'); snd('ui_cancel'); return; }
      if (e.who) { speak('穿在身上的不能当副装备，先脱下来。'); snd('ui_cancel'); return; }
      if (subAvail(f, e) <= 0) { speak('这件已经放上去了。'); snd('ui_cancel'); return; }
      const i = f.subs.indexOf(null); if (i < 0) { speak('三格都放满了。点下面的格子可以拿下来。'); snd('ui_cancel'); return; } f.subs[i] = e.id; UI.arm = null; snd('ui_click'); return; }
    if (e === true) return;
    if (main && inR(tp, MCR)) { f.main = null; f.subs = [null, null, null]; f.res = null; f.snap = null; snd('ui_click'); return; }
    for (let i = 0; i < 3; i++) if (inR(tp, SCR(i)) && f.subs[i]) { f.subs[i] = null; f.res = null; snd('ui_click'); return; }
    if (inR(tp, B_WARD)) { if (have(FUSE.WARD) > 0) { f.ward = !f.ward; snd('ui_click'); return; }
      if ((H().gold || 0) < FUSE.WARD_PRICE) { speak('一张护灵符 ' + FUSE.WARD_PRICE + ' 灵石。'); snd('ui_cancel'); return; }
      if (!armed('buyw')) { arm('buyw'); snd('ui_click'); return; } UI.arm = null; H().gold -= FUSE.WARD_PRICE; addItem(FUSE.WARD, 1); f.ward = true; snd('ui_confirm'); speak('拿好。贴上它，主装备原有的副属性一条也散不了。'); return; }
    if (f.res && inR(tp, B_REDO)) { if (!f.snap || f.snap.used) { speak('回炉只能一回。'); snd('ui_cancel'); return; } const mid = rareFor(false); if (!mid) { speak('回炉要一样珍稀料（头目、妖王身上的）。'); snd('ui_cancel'); return; }
      if (!armed('redo')) { arm('redo'); snd('ui_click'); return; } UI.arm = null; const before = f.res.before, r = redo(f.snap); if (r.err) { speak(r.err === 'back' ? '退回去的珠子不见了，回不了炉。' : '回不了炉。'); snd('ui_cancel'); return; }
      f.res = { id: r.id, res: r.res, before, snap: f.snap }; f.fx = { ok: !r.res.fail, t: performance.now() }; K.burst(MC.x, MC.y, r.res.fail ? 'huo' : WX5.GEAR[r.id] || 'jin', 1.1); snd('sfx_sword_ring', .6); speak('拿' + ITEM_DB[r.mat].name + '垫着回了一炉。' + fuseSpeech(f.res)); return; }
    if (!inR(tp, B_FUSE) || !main) return; const subs = f.subs.filter(Boolean); if (!subs.length) { speak('下面三格至少放一件副装备。'); snd('ui_cancel'); return; }
    const fee = FUSE.FEE[Math.min(2, Math.max(1, G6.tierOf(main.id) || 1))]; if ((H().gold || 0) < fee) { speak('炭火钱不够，要 ' + fee + ' 灵石。'); snd('ui_cancel'); return; }
    if (f.ward && have(FUSE.WARD) <= 0) f.ward = false;
    if (!armed('fuse')) { arm('fuse'); snd('ui_click'); if (subs.some(s => refLv(s) > 0)) speak('副装备上的强化会跟着它一起没了，想好了再点。'); return; }
    UI.arm = null; const r = fuse(main, subs, f.ward); if (r.err) { speak(r.err === 'gold' ? '炭火钱不够。' : r.err === 'ward' ? '护灵符没了。' : '东西不齐了。'); snd('ui_cancel'); return; }
    f.main = { id: r.id, who: main.who }; f.subs = [null, null, null]; if (f.ward && have(FUSE.WARD) <= 0) f.ward = false; f.res = { id: r.id, res: r.res, before: r.before, snap: r.snap }; f.snap = r.snap; f.fx = { ok: !r.res.fail, t: performance.now() };
    if (r.res.fail) { try { S.flash = .2; S.flashColor = '#7a2a1a'; S.shake = 6; playSnd('sfx_hurt', .5); } catch (e) {} }
    else { K.burst(MC.x, MC.y, WX5.GEAR[r.id] || 'jin', gradeOf(r.id) >= 5 ? 1.5 : 1.1); if (gradeOf(r.id) >= 5) setTimeout(() => { if (UI.open) K.burst(MC.x, MC.y, 'jin', 1.8); }, 160); try { S.flash = .22; S.flashColor = '#ffe9b8'; playSnd('jingle_levelup', .45); } catch (e) {} snd('sfx_sword_ring', .6); }
    speak(fuseSpeech(f.res)); }

  // ================= 强化（按件记；+5 多一条；挪强化只许同档、往高一档掉两级）=================
  const MAXLV = K.MAXLV, RATE = K.RATE, B_REF = K.B_REF, B_MOVE = K.B_MOVE;
  const tierOf2 = id => Math.max(1, Math.min(2, G6.tierOf(id) || K.gearTier(id)));
  const moveTo = (src, lv, to) => { const a = tierOf2(src), b = tierOf2(to); return b === a ? lv : b === a + 1 ? Math.max(0, lv - 2) : -1; };   // 挪过去是几级；-1 = 挪不了
  const canMove = (src, e) => !!src && e && e.id !== src && ITEM_DB[e.id] && ITEM_DB[e.id].slot === ITEM_DB[src].slot && e.id !== 'a_liuyun' && moveTo(src, refLv(src), e.id) > refLv(e.id);
  function drawRefine(now) { const mv = UI.mv && ITEM_DB[UI.mv] && refLv(UI.mv) > 0 ? UI.mv : (UI.mv = null), sel = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null;
    drawList(mv ? '挪到哪一件上' : '强化哪一件', { sel: e => e.id === sel && (UI.gwho === undefined || e.who == UI.gwho), dim: e => mv && e.id !== mv && !canMove(mv, e), badge: e => { const l = refLv(e.id); return mv ? (e.id === mv ? '+' + l : canMove(mv, e) ? '可' : '') : (l ? '+' + l : ''); } });
    D('panel_well_9', GD.x, GD.y, GD.w, GD.h);
    if (!sel) { infoWrap('点左边的一件装备。每强化一级，这件装备的各项主属性加一成半，最高 +5；到 +5 另给一条：兵器、护腕、饰品「会心 +3」，衣甲、鞋履「减伤 +3」。练气档用淬灵砂，凝丹档用淬灵晶：强化到第几级用几份。前三级必成；+4 七成、+5 五成，不成只损材料。强化按件记：店里买的两件，强化一件就只涨那一件。换了新装备可以把强化挪过去——同一档原样挪，往高一档挪掉两级。', GD.y + 44, 8); return; }
    head(sel); const l = refLv(sel), it = ITEM_DB[sel], ng = H().gold || 0, y1 = GD.y + 168;
    if (sel === 'a_liuyun') { T('流云仙衣不用强化。', GD.x + 30, y1, 20, C.gold2, KAI(), 600); infoWrap('它跟着叶孤星的修为自己长：防御、气血永远是同一档最好的衣服那么强，还多一点。', y1 + 40, 3); if (K.saying(now)) T(K.smith() + '：' + UI.say, GD.x + 30, GD.y + GD.h - 100, 16, C.gold2); return; }
    if (mv) { const lv = refLv(mv), e = { id: sel }, ok = canMove(mv, e), to = ok ? moveTo(mv, lv, sel) : 0, fee = ok ? K.moveFee(sel, to) : 0;
      ctx.font = `600 20px ${KAI()}`; T(fitW('把「' + ITEM_DB[mv].name + '」的强化挪过来', GD.w - 60), GD.x + 30, y1, 20, C.gold2, KAI(), 600);
      if (sel === mv) T('点左边另一件' + (SLOT_CN[it.slot] || '装备') + '（右上角标着「可」的）。同一档原样挪，往高一档挪掉两级。', GD.x + 30, y1 + 40, 16, C.sub);
      else if (!ok) T(it.slot !== ITEM_DB[mv].slot ? '部位不一样，挪不过来。' : moveTo(mv, lv, sel) < 0 ? '挪强化只许同一档，或往高一档挪（掉两级）。' : '这一件的强化不比挪过来的低，用不着挪。', GD.x + 30, y1 + 40, 17, C.red);
      else { T('这一件：+' + l + '　→　+' + to + (to < lv ? '（往高一档挪，掉两级）' : ''), GD.x + 30, y1 + 44, 22, C.green, NUM(), 700); T('「' + baseName(mv) + '」回到 +0', GD.x + 30, y1 + 84, 17, C.sub); T('灵石 ' + ng + ' / ' + fee, GD.x + 30, y1 + 118, 17, ng >= fee ? C.green : C.red, NUM(), 600); }
      if (K.saying(now)) T(K.smith() + '：' + UI.say, GD.x + 30, GD.y + GD.h - 100, 16, C.gold2);
      btn(B_MOVE, '不挪了', 'n', 18); if (ok) btn(B_REF, ng < fee ? '灵石不够' : armed('mv') ? '再点一次 · 挪过来' : '挪到这一件', ng < fee ? 'd' : armed('mv') ? 'p' : 'n', 18); return; }
    if (l >= MAXLV) { const [pk, pv] = PLUS5(it.slot); T('已经到 +' + MAXLV + '，再敲就碎了。', GD.x + 30, y1, 19, C.gold2, KAI(), 600); T('+5 加成：' + CR.subText(pk, pv), GD.x + 30, y1 + 36, 17, C.green, KAI(), 600); if (K.saying(now)) T(K.smith() + '：' + UI.say, GD.x + 30, GD.y + GD.h - 100, 16, C.gold2); btn(B_REF, '把强化挪走', 'n', 18); return; }
    const c = K.refCost(sel, l), hv = c.mat ? have(c.mat) : 0;
    T('+' + l + '　→　+' + (l + 1), GD.x + 30, y1, 26, C.gold2, NUM(), 700);
    const nx = K.peekNext(sel, l); let y = y1 + 44; for (const k of KEYS) { const v = it[k]; if (!v || v <= 0) continue; T(K.STAT_NAME[k], GD.x + 30, y, 17, C.sub); T(String(v), GD.x + 100, y, 19, C.text, NUM(), 700); T('→', GD.x + 150, y, 17, C.sub); T(String(nx[k]), GD.x + 186, y, 19, C.green, NUM(), 700); y += 30; }
    if (l + 1 >= MAXLV) { const [pk, pv] = PLUS5(it.slot); T('到 +5 另加：' + CR.subText(pk, pv), GD.x + 30, y + 4, 16, '#ffd75a', KAI(), 600); }
    T('要用的料', GD.x + 330, y1, 17, C.sub);
    if (c.mat) { try { itemIcon(c.mat, GD.x + 356, y1 + 54, 26); } catch (e) {} T(ITEM_DB[c.mat].name + ' ×' + c.n, GD.x + 396, y1 + 46, 19, C.text, KAI(), 600); T('身上有 ' + hv, GD.x + 396, y1 + 72, 15, hv >= c.n ? C.green : C.red, KAI(), 500); }
    T('灵石 ' + ng + ' / ' + c.gold, GD.x + 330, y1 + 120, 17, ng >= c.gold ? C.green : C.red, NUM(), 600); T('成功率 ' + Math.round(RATE[l] * 100) + '%' + (RATE[l] < 1 ? '（不成只损材料）' : ''), GD.x + 330, y1 + 152, 17, RATE[l] < 1 ? '#d9b46a' : C.text);
    if (K.saying(now)) { ctx.font = `500 16px ${KAI()}`; T(fitW(K.smith() + '：' + UI.say, GD.w - 60), GD.x + 30, GD.y + GD.h - 100, 16, C.gold2); }
    if (l > 0) btn(B_MOVE, '把强化挪走', 'n', 17);
    if (!c.mat || hv < c.n) btn(B_REF, '料不够', 'd', 18); else if (ng < c.gold) btn(B_REF, '灵石不够', 'd', 18); else btn(B_REF, armed('ref') ? '再点一次 · 下锤' : '强　化', armed('ref') ? 'p' : 'n'); }
  function tapRefine(tp) { const mv = UI.mv && ITEM_DB[UI.mv] && refLv(UI.mv) > 0 ? UI.mv : (UI.mv = null); const e = tapList(tp);
    if (e && e !== true) { if (UI.gsel !== e.id || UI.gwho != e.who) { UI.gsel = e.id; UI.gwho = e.who; UI.arm = null; UI.say = ''; snd('ui_click'); } return; } if (e === true) return;
    const sel = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null; if (!sel || sel === 'a_liuyun') return; const l = refLv(sel), bx = GD.x + 66, by = GD.y + 70;
    if (mv) { if (inR(tp, B_MOVE)) { UI.mv = null; UI.arm = null; snd('ui_click'); return; } if (!inR(tp, B_REF) || !canMove(mv, { id: sel })) return; const lv = refLv(mv), to = moveTo(mv, lv, sel), fee = K.moveFee(sel, to);
      if ((H().gold || 0) < fee) { speak('挪一回要 ' + fee + ' 灵石的炭火钱。'); snd('ui_cancel'); return; } if (!armed('mv')) { arm('mv'); snd('ui_click'); return; }
      UI.arm = null; const dst = split(sel, UI.gwho); H().gold -= fee; const from = baseName(mv); CR.setRefine(mv, 0); CR.setRefine(dst, to); UI.mv = null; UI.gsel = dst; K.burst(bx, by, WX5.GEAR[dst] || 'jin', .9); snd('sfx_sword_ring', .6); try { S.flash = .18; S.flashColor = '#ffe9b8'; } catch (er) {}
      speak(to < lv ? '挪好了。往高一档挪，火候散了两成，到 +' + to + '。' : '挪好了。「' + from + '」上的火候，原样到了这一件上。'); return; }
    if (inR(tp, B_MOVE) && l > 0 && l < MAXLV) { UI.mv = sel; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    if (!inR(tp, B_REF)) return; if (l >= MAXLV) { UI.mv = sel; UI.arm = null; UI.say = ''; snd('ui_click'); return; }
    const c = K.refCost(sel, l), hv = c.mat ? have(c.mat) : 0; if (!c.mat || hv < c.n) { speak((c.mat ? ITEM_DB[c.mat].name : '淬灵') + '不够，这一级要 ' + c.n + ' 份。' + (c.tier >= 2 ? '头目、妖王身上多，凝丹的妖物偶尔也掉。' : '练气的妖物身上有，铁匠铺也卖。')); snd('ui_cancel'); return; } if ((H().gold || 0) < c.gold) { speak('炭火钱不够。'); snd('ui_cancel'); return; }
    if (!armed('ref')) { arm('ref'); snd('ui_click'); return; }
    UI.arm = null; const id = split(sel, UI.gwho); UI.gsel = id; CR.take(c.mat, c.n); H().gold -= c.gold; snd('sfx_sword_ring', .7);
    if (rnd() < RATE[l]) { CR.setRefine(id, l + 1); K.burst(bx, by, WX5.GEAR[id] || 'jin', .9); try { S.flash = .2; S.flashColor = '#ffe9b8'; playSnd('jingle_levelup', .45); } catch (e2) {} speak('成了，+' + (l + 1) + '。' + (l + 1 >= MAXLV ? '到头了——这一件多了一条「' + CR.subText(...PLUS5(ITEM_DB[id].slot)) + '」。' : '')); }
    else { try { S.flash = .18; S.flashColor = '#7a2a1a'; S.shake = 6; playSnd('sfx_hurt', .5); } catch (e2) {} speak('火候差了一点。料和炭钱没了，东西没坏，还是 +' + l + '。'); } }

  // ================= 镶嵌（灵窍里镶灵珠 / 珍稀料：加副属性）=================
  const skR = i => ({ x: GD.x + 30 + i * 142, y: GD.y + 146, w: 130, h: 124 }), B_OFF = { x: GD.x + 470, y: GD.y + 182, w: 210, h: 50 };
  const gmR = i => ({ x: GD.x + 22 + (i % 4) * 170, y: GD.y + 312 + Math.floor(i / 4) * 66, w: 162, h: 60 }), GPER = 8;
  const GMPG = { prev: { x: GD.x + GD.w - 196, y: GD.y + 280, w: 80, h: 30 }, next: { x: GD.x + GD.w - 106, y: GD.y + 280, w: 80, h: 30 } };
  const B_SET = { x: GD.x + GD.w - 244, y: GD.y + GD.h - 66, w: 224, h: 52 }, B_MERGE = { x: GD.x + GD.w - 244 - 252, y: GD.y + GD.h - 66, w: 240, h: 52 };
  // 行囊里能镶的：灵珠（一样一叠）+ 带着副属性的珍稀料（按那一条分叠）。选了装备时，镶不进这个部位的料不列
  function invList(slot) { const out = []; for (const el of ORDER) for (let lv = 5; lv >= 1; lv--) { const gid = CR.gemId(el, lv), n = have(gid); if (n > 0 && ITEM_DB[gid]) out.push({ gid, el, lv, n, tok: lv > 1 ? el + lv : el }); }
    for (const id of RARE()) for (const s of CR.stacks(id)) if (s.ln && (!slot || CR.allow(slot, s.ln))) out.push({ gid: id, mat: 1, ln: s.ln, n: s.n, tok: 'm:' + id + ':' + s.ln }); return out; }
  const needFor = lv => lv >= 4 ? 'tower' : lv >= 2 ? 'rare' : null;   // 合成 lv + 1 级要什么：二合三、三合四要一样珍稀料，四合五要万妖塔的料
  function drawInlay(now) { const sel = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null, slot = sel ? ITEM_DB[sel].slot : null;
    drawList('镶哪一件', { sel: e => e.id === sel && e.who == UI.gwho, badge: e => { const k = socksOf(e.id); return k ? gemsOf(e.id).filter(Boolean).length + '/' + k : ''; }, dim: e => !socksOf(e.id) });
    D('panel_well_9', GD.x, GD.y, GD.w, GD.h); const st = invList(slot), np = Math.max(1, Math.ceil(st.length / GPER)); UI.gmp = Math.min(UI.gmp || 0, np - 1); const cur = st.find(q => q.tok === UI.gsk) || null; if (!cur) UI.gsk = null;
    let curTok = null;
    if (!sel) infoWrap('点左边一件有灵窍的装备（右上角写着「镶了几颗 / 几个窍」），再点下面的一颗灵珠或一样珍稀料，按「镶上」。灵珠在兵器、护腕、饰品上加「某系伤害」，在衣甲、鞋履上加「某系减伤」；珍稀料把它身上那一条副属性带进去。换下来的东西退回行囊。灵窍是打造、合成时开出来的。', GD.y + 40, 5);
    else { head(sel); const k = socksOf(sel), gs = gemsOf(sel);
      if (!k) { T('这一件没有灵窍。', GD.x + 30, GD.y + 176, 19, C.gold2, KAI(), 600); infoWrap('打造时有机会开窍（料多、相生多，开得多）；也可以拿它当主装备去「合成」，把副装备的窍合过来。', GD.y + 212, 2); }
      else { UI.sock = Math.min(UI.sock || 0, k - 1); curTok = gs[UI.sock];
        for (let i = 0; i < k; i++) { const r = skR(i), on = UI.sock === i, g = gs[i]; D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h);
          if (g) { try { itemIcon(tokItem(g), r.x + r.w / 2, r.y + 48, 30); } catch (e) {} const l = tokLine(g, slot); ctx.font = `600 15px ${KAI()}`; T(fitW(CR.subText(l[0], l[1]), r.w - 8), r.x + r.w / 2, r.y + 102, 15, C.green, KAI(), 600, 'center'); }
          else { const se = art('socket_empty') || R.art('socket_empty'); if (se) ctx.drawImage(se, r.x + r.w / 2 - 34, r.y + 14, 68, 68); else { ctx.save(); ctx.strokeStyle = 'rgba(194,173,120,.5)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + 48, 28, 0, 7); ctx.stroke(); ctx.restore(); } T('空窍', r.x + r.w / 2, r.y + 102, 15, C.sub, KAI(), 600, 'center'); } }
        if (curTok) btn(B_OFF, isMatTok(curTok) ? '取下这一样' : '取下这一颗', 'n', 16); } }
    T('行囊里能镶的' + (st.length ? '（点一颗选中）' : ''), GD.x + 30, GD.y + 294, 15, C.sub);
    if (!st.length) T('一颗灵珠都没有。五枚同一行的精，到「打造」那一页炼一颗。', GD.x + 30, GD.y + 340, 16, C.sub);
    st.slice(UI.gmp * GPER, UI.gmp * GPER + GPER).forEach((q, i) => { const r = gmR(i), on = UI.gsk === q.tok; D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); try { itemIcon(q.gid, r.x + 28, r.y + 30, 20); } catch (e) {}
      ctx.font = `600 15px ${KAI()}`; T(fitW(ITEM_DB[q.gid].name, r.w - 92), r.x + 54, r.y + 19, 15, q.mat ? '#ffd75a' : C.gold2, KAI(), 600); T('×' + q.n, r.x + r.w - 10, r.y + 19, 14, C.sub, KAI(), 600, 'right');   // 件数挪到第一行右边，第二行整条写得下
      const l = slot ? tokLine(q.tok, slot) : null, txt = l ? CR.subText(l[0], l[1]) : q.mat ? CR.lineText(q.ln) : '伤害 +' + GEM_V.dmg[q.lv - 1] + ' / 减伤 +' + GEM_V.res[q.lv - 1];
      ctx.font = `600 14px ${KAI()}`; T(fitW(txt, r.w - 62), r.x + 54, r.y + 42, 14, C.green, KAI(), 600); });
    if (np > 1) { btn(GMPG.prev, '上一页', UI.gmp > 0 ? 'n' : 'd', 14); btn(GMPG.next, '下一页', UI.gmp < np - 1 ? 'n' : 'd', 14); }
    if (K.saying(now)) { ctx.font = `500 16px ${KAI()}`; T(fitW(K.smith() + '：' + UI.say, GD.w - 60), GD.x + 30, GD.y + GD.h - 92, 16, C.gold2, KAI(), 500); }
    else if (cur && !cur.mat) { const nd = needFor(cur.lv); ctx.font = `500 15px ${KAI()}`; T(fitW(ITEM_DB[cur.gid].name + '：' + (cur.lv < 5 ? '两颗合一颗' + '一二三四五'[cur.lv] + '级' + (nd === 'tower' ? '，还要一样万妖塔里的料' : nd ? '，还要一样珍稀料' : '') + '。' : '已经是最高一级。'), GD.w - 60), GD.x + 30, GD.y + GD.h - 92, 15, C.sub, KAI(), 500); }
    else if (cur && cur.mat) { ctx.font = `500 15px ${KAI()}`; T(fitW('珍稀料镶进去就带进它那一条；取下来时连那一条一起退回行囊。', GD.w - 60), GD.x + 30, GD.y + GD.h - 92, 15, C.sub, KAI(), 500); }
    if (cur) { const ng = H().gold || 0;
      if (!cur.mat && cur.lv < 5) { const fee = K.mergeFee(cur.lv), nd = needFor(cur.lv), mid = nd ? rareFor(nd === 'tower') : null, lack = cur.n < 2 ? '要两颗才能合' : nd && !mid ? (nd === 'tower' ? '缺万妖塔的料' : '缺一样珍稀料') : ng < fee ? '灵石不够（要 ' + fee + '）' : '';
        btn(B_MERGE, lack || (armed('mg') ? '再点一次 · 合成' : '两颗合一颗 · 灵石 ' + fee), lack ? 'd' : armed('mg') ? 'p' : 'n', 16); }
      if (sel && socksOf(sel)) btn(B_SET, curTok === cur.tok ? '窍里就是这一颗' : curTok ? '换上这一' + (cur.mat ? '样' : '颗') : '镶　上', curTok === cur.tok ? 'd' : 'n', 18); } }
  function setTok(id, i, tok) { const G = (H().gems = H().gems || {}), a = gemsOf(id), old = a[i]; a[i] = tok || null; G[id] = a; if (!a.some(Boolean)) delete G[id]; if (old) giveTok(old); return old; }
  function tapInlay(tp) { const e = tapList(tp); if (e && e !== true) { if (UI.gsel !== e.id || UI.gwho != e.who) { UI.gsel = e.id; UI.gwho = e.who; UI.sock = 0; UI.arm = null; UI.say = ''; snd('ui_click'); } return; } if (e === true) return;
    const sel = UI.gsel && ITEM_DB[UI.gsel] ? UI.gsel : null, slot = sel ? ITEM_DB[sel].slot : null, k = sel ? socksOf(sel) : 0, st = invList(slot), np = Math.max(1, Math.ceil(st.length / GPER));
    if (sel && k) { for (let i = 0; i < k; i++) if (inR(tp, skR(i))) { UI.sock = i; UI.arm = null; snd('ui_click'); return; }
      const cur = gemsOf(sel)[UI.sock]; if (cur && inR(tp, B_OFF)) { setTok(sel, UI.sock, null); UI.arm = null; snd('ui_click'); speak('取下来了，' + tokName(cur) + '回到行囊里。'); return; } }
    if (np > 1 && inR(tp, GMPG.prev)) { if (UI.gmp > 0) { UI.gmp--; snd('ui_click'); } return; } if (np > 1 && inR(tp, GMPG.next)) { if (UI.gmp < np - 1) { UI.gmp++; snd('ui_click'); } return; }
    const page = st.slice((UI.gmp || 0) * GPER, (UI.gmp || 0) * GPER + GPER); for (let i = 0; i < page.length; i++) if (inR(tp, gmR(i))) { if (UI.gsk !== page[i].tok) { UI.gsk = page[i].tok; UI.arm = null; UI.say = ''; snd('ui_click'); } return; }
    const cur = st.find(q => q.tok === UI.gsk); if (!cur) return;
    if (!cur.mat && cur.lv < 5 && inR(tp, B_MERGE)) { const fee = K.mergeFee(cur.lv), nd = needFor(cur.lv), mid = nd ? rareFor(nd === 'tower') : null;
      if (cur.n < 2) { speak('要两颗一样的才能合。'); snd('ui_cancel'); return; } if (nd && !mid) { speak(nd === 'tower' ? '五级的灵珠要万妖塔里的料才压得住。' : '三级往上，要一样珍稀料（头目、妖王身上的）垫炉。'); snd('ui_cancel'); return; }
      if ((H().gold || 0) < fee) { speak('炭火钱不够，要 ' + fee + ' 灵石。'); snd('ui_cancel'); return; } if (!armed('mg')) { arm('mg'); snd('ui_click'); return; }
      UI.arm = null; CR.take(cur.gid, 2); if (mid) CR.take(mid, 1); H().gold -= fee; const up = CR.gemId(cur.el, cur.lv + 1); addItem(up, 1); UI.gsk = cur.lv + 1 > 1 ? cur.el + (cur.lv + 1) : cur.el; const r = gmR(0); K.burst(r.x + 28, r.y + 30, cur.el, .8); snd('ui_confirm'); try { playSnd('jingle_levelup', .4); } catch (er) {}
      speak('两颗并作一颗：「' + ITEM_DB[up].name + '」。' + (mid ? '垫了一样' + ITEM_DB[mid].name + '。' : '')); return; }
    if (sel && k && inR(tp, B_SET)) { const old = gemsOf(sel)[UI.sock]; if (old === cur.tok) return; if (cur.mat && !CR.allow(slot, cur.ln)) { speak('这一条进不了' + SLOT_CN[slot] + '。'); snd('ui_cancel'); return; }
      UI.arm = null; if (!takeTok(cur.tok)) return; const id = sel; setTok(id, UI.sock, cur.tok); const r = skR(UI.sock); K.burst(r.x + r.w / 2, r.y + 48, cur.el || WX5.GEAR[id] || 'jin', .8); snd('ui_confirm'); try { playSnd('jingle_levelup', .4); } catch (er) {}
      const l = tokLine(cur.tok, slot); speak('镶上了：' + CR.subText(l[0], l[1]) + '。' + (old ? '原来那' + (isMatTok(old) ? '样' : '颗') + '退回行囊了。' : '')); return; } }

  // ---- 换掉剑炉的页：打造（原「合成」）/ 合成（新）/ 强化 / 镶嵌；精炼、星纹不动 ----
  K.TABS[0] = '打造'; K.DRAW[0] = drawSynth; K.TAP[0] = tapSynth; K.DRAW[1] = drawRefine; K.TAP[1] = tapRefine; K.DRAW[2] = drawInlay; K.TAP[2] = tapInlay;
  K.TABS.splice(1, 0, '合成'); K.TABK.splice(1, 0, 'hecheng'); K.DRAW.splice(1, 0, drawFuse); K.TAP.splice(1, 0, tapFuse);   // 合成页先借打造页的小图标，Codex 画了新的再换
  // 老代码里 R394.open(1) 是「强化」那一页（equip_plus 的铁匠强化走这里）：中间插了一页，号码往后挪一位
  { const o = R.open; R.open = function (tab, who) { return o.call(this, typeof tab === 'number' && tab >= 1 ? tab + 1 : tab, who); }; }
  // 头一回在新规矩下见铸剑师：把变了的几条说一遍
  { const o = R.talk; R.talk = async function () { const f = F(); if (f.forge3_met && !f.gf467_met) { f.gf467_met = 1; const sm = '铸剑师';
      await say(sm, '炉子我改过了。如今三样料就能开炉：五样出兵器或衣甲，四样出护腕或鞋，三样出饰品或鞋。料少省事，出的东西也差些。');
      await say(sm, '打出来的东西看颜色：副属性、灵窍越多，颜色越往上走——白、绿、蓝、紫，紫是炉子里打得出的顶了。');
      await say(sm, '再往上的橙、红、金，得去「合成」那一页：拿一件当主装备，把同部位的副装备合进去。会合砸，护灵符能保住原有的。'); }
    return o.apply(this, arguments); }; }

  window.GEARFUSE = { GRADES, FUSE, FORGE, TOP, LY, LYI, GEM_V, XIAN, recOf, linesOf, socksOf, gemsOf, gradeOf, countOf, fxCalc, newInst, split, analyze, craft, fuseRoll, fuse, redo, failP, isTop, convertSave, oldEff, lyTarget, tokLine, setTok, giveTok, takeTok, ART_NAMES, eat };
})();
