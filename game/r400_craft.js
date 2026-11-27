// ================= R400 · 合成（五行打造）的内部规矩（只进测试版）=================
// 作者 11-27 中午（12:32–13:15）定的：照《秦殇前传：复活》那样——把五样材料放进炉子合成装备。
//   · 只有各人的「专属套装」有写明的配方（合成秘籍）；别的装备玩家看不到配方，在玩家眼里是随机的。
//     「我说的随机指的是玩家概念里的随机，但是我们其实是知道的」——这张表就是「我们知道的」那一份，玩家界面上一个字都不露。
//   · 游戏里所有材料都能放进去。材料分两类：兵器和饰品用一类（饰品的搭配更复杂），防具和鞋子用一类。
//   · 五个一模一样的材料 → 一定出同一件（不写说明，玩家试出来的经验）。混着放 → 在两三件里随机出一件。
//   · 一件装备可以有好几条路合出来；总体好坏看材料的五行相生相克。
//   · 14:25 又定：不要「走火」。相克不让你出差东西，只让属性低；按相生的顺序摆，属性高。材料自己带副属性，合成时带进成品；
//     五样一模一样最稳，只继承一条。装备分主属性（攻防血灵速）和副属性（某系攻击、特殊效果）。打出来的每一件各是各的。
//   · 专属套装用珍稀材料：只有头目 / 妖王、宝箱、剧情里卖的才有。每人大约两套，从前期到后期；现在先做前期。
//   · 普通装备不等于差：低档朴素，高档照样厉害；只是不成套、没有说明。
// 这里只有数据和算法；界面在 r394_forge.js。
(function () {
  if (!window.WX5 || !window.GEAR5 || !window.GEAR6 || typeof ITEM_DB === 'undefined' || typeof S === 'undefined') return;
  const WX = WX5.WX, KE = WX5.KE, SHENG = WX5.SHENG, ORDER = WX5.ORDER, G6 = window.GEAR6, F = () => (S.flags = S.flags || {});
  const REALM = lv => { try { return realmOf(lv); } catch (e) { return lv + ' 级'; } };
  const add = (id, o) => { if (!ITEM_DB[id]) ITEM_DB[id] = o; return ITEM_DB[id]; };

  // ---------- 一、新东西 ----------
  // 珍稀材料：三只头目各掉一样（打专属套装用）
  add('m_xingjing', { name: '衔星晶', price: 0, sell: 200, mat: true, wx: 'huo', rare: 1, r400: 1, desc: '赤焰狼王肩上那块星核碎晶，暗红的晶簇里封着一线星光。珍稀——只有落星坡那头狼王身上有。合成秘籍上记着它的用处。' });
  add('m_songxin', { name: '千年松心', price: 0, sell: 200, mat: true, wx: 'mu', rare: 1, r400: 1, desc: '老松魈的树心。琥珀色的一截，年轮密得数不清，中间还有一道青光在走。珍稀——几百年才长这么一段。合成秘籍上记着它的用处。' });
  add('m_tiejia', { name: '穿山铁鳞', price: 0, sell: 200, mat: true, wx: 'jin', rare: 1, r400: 1, desc: '铁鳞穿山甲背上最大的一片鳞，银灰色，比铁甲还硬。珍稀——那畜生啃了上百年铁矿才长成。合成秘籍上记着它的用处。' });
  // 五行灵珠：五枚同一行的精合成一颗；镶在装备上（镶嵌页）
  const GEM = { jin: ['金灵珠', 'atk', 5, '攻击'], mu: ['木灵珠', 'maxhp', 45, '气血'], shui: ['水灵珠', 'maxmp', 25, '灵力'], huo: ['火灵珠', 'spd', 2, '速度'], tu: ['土灵珠', 'def', 5, '防御'] };
  for (const el of ORDER) add('g_' + el, { name: GEM[el][0], price: 0, sell: 120, gem: el, glv: 1, wx: el, r400: 1, desc: '五枚' + WX[el].n + '精炼成的一颗珠子。镶在装备上：' + GEM[el][3] + ' +' + GEM[el][2] + '；装备也是' + WX[el].n + '性的话再多五成。两颗一样的，在「镶嵌」那一页能合成高一级的。' });
  // 灵珠能升级（设计稿第六节，作者 11-27 18:02 让设计宝石）：两颗一样的合成高一级的一颗，一到五级。还是五种，各管一样主属性。
  const GEM_V = { jin: [5, 8, 12, 17, 23], mu: [45, 75, 110, 155, 210], shui: [25, 40, 60, 85, 115], huo: [2, 3, 4, 5, 7], tu: [5, 8, 12, 17, 23] }, GEM_MAX = 5, GEM_CN = ['', '', '二', '三', '四', '五'];
  const gemId = (el, lv) => 'g_' + el + (lv > 1 ? lv : '');
  for (const el of ORDER) for (let lv = 2; lv <= GEM_MAX; lv++) add(gemId(el, lv), { name: GEM[el][0] + ' · ' + GEM_CN[lv], price: 0, sell: 120 * (1 << (lv - 1)), gem: el, glv: lv, wx: el, r400: 1, desc: '两颗' + (lv > 2 ? GEM[el][0] + ' · ' + GEM_CN[lv - 1] : GEM[el][0]) + '合成的' + '一二三四五'[lv - 1] + '级灵珠。镶在装备上：' + GEM[el][3] + ' +' + GEM_V[el][lv - 1] + '；装备也是' + WX[el].n + '性的话再多五成。' });
  // 五行佩：五件朴素的普通饰品（合成才有）
  const PEI = [['c_wx_jin', '锐金佩', 'jin', { atk: 4 }, '白铜打的小环佩，素面无纹，系一根灰白细绳。'], ['c_wx_mu', '青木佩', 'mu', { maxhp: 50 }, '青玉磨的叶形小佩，叶脉只有浅浅几道。'],
    ['c_wx_shui', '玄水佩', 'shui', { maxmp: 30 }, '墨蓝色的水滴形石坠，摸着总是凉的。'], ['c_wx_huo', '离火佩', 'huo', { atk: 2, spd: 1 }, '三粒赤玛瑙串成的短坠，贴身戴着微微发暖。'], ['c_wx_tu', '厚土佩', 'tu', { def: 4 }, '土黄色的方形小石牌，四角磨得圆润。']];
  for (const [id, name, wx, st, desc] of PEI) { if (ITEM_DB[id]) continue; ITEM_DB[id] = Object.assign({ name, slot: 'acc', price: 0, sell: 120, lvReq: 8, wx, r400: 1, desc: desc + '（需要境界：' + REALM(8) + '）' }, st); WX5.GEAR[id] = wx; }

  // ---------- 二、材料：哪一类、什么五行、几品 ----------
  // c：W = 兵器 / 饰品料（牙、角、骨、晶、铁、木芯）；A = 防具 / 鞋料（皮、丝、翼、壳、鳞）；null = 百搭（五行之精、内丹、星辰砂）
  // g：1 寻常（练气料）、2 上等（凝丹料）、3 珍稀。五行跟着它的出处走（打什么性的妖兽，掉什么性的料）。
  // sig：这种料多半带哪一条副属性（作者 11-27 18:02 点头的「什么料出什么」）——牙带暴击，骨带克制增伤，晶、铁、木芯带那一行的攻击；
  //      皮、鳞、甲片带减伤，藤皮、蝠翼带回血，蛇蜕、蛛丝带回灵。（角螯的破甲、鳞的五行抗性、甲片的反震、金蛛丝的定心，等那几种副属性做出来再换。）
  const MAT = {
    m_fang: { c: 'W', wx: 'huo', g: 1, sig: 'crit' }, m_tooth: { c: 'W', wx: 'jin', g: 2, sig: 'crit' }, m_horn: { c: 'W', wx: 'jin', g: 2, sig: 'ke' }, m_thorn: { c: 'W', wx: 'mu', g: 2, sig: 'el' }, m_yanjing: { c: 'W', wx: 'huo', g: 2, sig: 'el' },
    m_gupian: { c: 'W', wx: 'shui', g: 3, sig: 'ke' }, m_yuntie: { c: 'W', wx: 'jin', g: 3, sig: 'el' }, m_xingjing: { c: 'W', wx: 'huo', g: 3, sig: 'el' }, m_songxin: { c: 'W', wx: 'mu', g: 3, sig: 'el' },
    m_hide: { c: 'A', wx: 'tu', g: 1, sig: 'guard' }, m_yingpi: { c: 'A', wx: 'shui', g: 2, sig: 'guard' }, m_silk: { c: 'A', wx: 'mu', g: 2, sig: 'mpRegen' }, m_wing: { c: 'A', wx: 'huo', g: 2, sig: 'regen' }, m_shike: { c: 'A', wx: 'tu', g: 2, sig: 'guard' }, m_tielin: { c: 'A', wx: 'jin', g: 2, sig: 'guard' },
    m_jinsi: { c: 'A', wx: 'jin', g: 3, sig: 'mpRegen' }, m_tiejia: { c: 'A', wx: 'jin', g: 3, sig: 'guard' },
    m_neidan: { c: null, wx: null, g: 3 }, m_xcsha: { c: null, wx: null, g: 3 },
    // 11-27 傍晚补的十种（东西在 r406_items.js 里登记）：练气料每个五行两类都有了；凝丹料补上水的兵饰料、土的兵饰料
    m_duanren: { c: 'W', wx: 'jin', g: 1, sig: 'el' }, m_yaomu: { c: 'W', wx: 'mu', g: 1, sig: 'el' }, m_yugu: { c: 'W', wx: 'shui', g: 1, sig: 'ke' }, m_shougu: { c: 'W', wx: 'tu', g: 1, sig: 'ke' },
    m_jiapian: { c: 'A', wx: 'jin', g: 1, sig: 'guard' }, m_tengpi: { c: 'A', wx: 'mu', g: 1, sig: 'regen' }, m_shetui: { c: 'A', wx: 'shui', g: 1, sig: 'mpRegen' }, m_langpi: { c: 'A', wx: 'huo', g: 1, sig: 'guard' },
    m_yingya: { c: 'W', wx: 'shui', g: 2, sig: 'crit' }, m_zhuao: { c: 'W', wx: 'tu', g: 2, sig: 'ke' },
  };
  for (const el of ORDER) MAT['m_wx_' + el] = { c: null, wx: el, g: 0 };
  for (const id of Object.keys(MAT)) if (!ITEM_DB[id]) delete MAT[id];
  const CLASS_NAME = { W: '兵器 · 护腕 · 饰品料', A: '衣甲 · 鞋料', X: '百搭' };
  const isMat = id => !!MAT[id];
  // 背包里的说明加一句「这是哪一类料」
  for (const id of Object.keys(MAT)) { const it = ITEM_DB[id], m = MAT[id]; if (!it || it._r400d) continue; it._r400d = 1;
    it.desc = String(it.desc || '').replace(/可以卖钱，也能找铁匠强化(武器|护甲)$/, '').replace(/。*$/, '') + '。【' + (m.c ? CLASS_NAME[m.c] : '百搭') + (m.wx ? ' · ' + WX[m.wx].n + '性' : '') + '】'; }

  // ---------- 三、合成秘籍：只有专属套装（玩家看得到的只有这一段）----------
  // 每个方子正好五样；谁的专属、是哪一套。料都带一样头目 / 妖王身上才有的珍稀料。
  // 三只头目各掉两枚珍稀料：衔星晶（星痕坠 1、云雷衣 1）、穿山铁鳞（星痕坠 1、云雷靴 1）、千年松心（星痕坠 1，另一枚留给以后）。
  const RECIPES = [
    { id: 'c_xinghen', who: 'hero', mats: ['m_xingjing', 'm_songxin', 'm_tiejia', 'm_wx_jin', 'm_wx_jin'], fee: 600 },   // 三只头目各一样 + 两枚金精：前期就凑得齐（妖王内丹要到二十级的黑甲犀王才有，不放进来）
    { id: 'a_yunlei', who: 'yunting', mats: ['m_xingjing', 'm_yanjing', 'm_yanjing', 'm_wx_huo', 'm_wx_huo'], fee: 600 },
    { id: 's_yunlei', who: 'yunting', mats: ['m_tiejia', 'm_yanjing', 'm_wx_huo', 'm_wx_huo', 'm_wx_huo'], fee: 500 },
    { id: 's_tashuang', who: 'linxue', mats: ['m_gupian', 'm_yingpi', 'm_yingpi', 'm_wx_shui', 'm_wx_shui'], fee: 500 },
    // 11-27 16:39：专属套装五件成套——各补一件护腕；云雷、凝霜各补一件饰品。头目的珍稀料从每只两枚加到三枚，第三枚就用在这里。
    { id: 'r_xinghen', who: 'hero', mats: ['m_songxin', 'm_tiejia', 'm_wx_jin', 'm_wx_jin', 'm_wx_jin'], fee: 600 },
    { id: 'r_yunlei', who: 'yunting', mats: ['m_xingjing', 'm_yanjing', 'm_yanjing', 'm_yanjing', 'm_wx_huo'], fee: 600 },
    { id: 'c_yunlei', who: 'yunting', mats: ['m_jinsi', 'm_yanjing', 'm_wx_huo', 'm_wx_huo', 'm_wx_huo'], fee: 600 },
    { id: 'r_ningshuang', who: 'linxue', mats: ['m_jinsi', 'm_yingpi', 'm_yingpi', 'm_wx_shui', 'm_wx_shui'], fee: 600 },
    { id: 'c_ningshuang', who: 'linxue', mats: ['m_neidan', 'm_tooth', 'm_tooth', 'm_wx_shui', 'm_wx_shui'], fee: 600 },
  ].filter(r => ITEM_DB[r.id] && r.mats.every(m => ITEM_DB[m]));
  const keyOf = ids => ids.slice().sort().join('+');
  const RKEY = {}; for (const r of RECIPES) RKEY[keyOf(r.mats)] = r;
  const whoName = w => w === 'hero' ? '叶孤星' : ((typeof PARTY_DB !== 'undefined' && PARTY_DB[w]) || {}).name || w;
  const recipeShown = r => r.who === 'hero' || (S.party || []).includes(r.who);

  // ---------- 四、格子：这一炉会出哪一格、哪一档 ----------
  // 作者 11-27 17:09 / 17:37 / 17:50 / 18:02 定的（格子表本身在 r406_items.js）：
  //   · 部位 × 五行算一格。练气档一格三件，凝丹档四件，从常见到难得；同样的料随机出其中一件。
  //   · 部位：兵饰料为主——用到的兵饰料只有一两种 → 兵器；三种 → 护腕；四种以上 → 饰品（饰品最复杂）。
  //           防具料为主——放了四样以上 → 衣甲；三样以下 → 鞋（料多成衣，料少成靴）。
  //   · 五行：五样里哪一行最多（一样多看谁摆在前头）。
  //   · 档：不同档的料可以混着放。每放一样高一档的料（凝丹料、珍稀料），出凝丹档的机会多两成；全是高一档的，必出凝丹档。
  //         五行之精不分档，不算在里头（拿它改五行，不拖累也不加成）。
  //   · 出哪一件：练气档 常见五成、套装件三成半、难得一成半；凝丹档 四成、三成、两成、一成。
  //         相生每多一处，难得那件的机会涨两成（五行流转一圈全相生，翻一倍）；相克多过相生，减半。
  //         料比这一档好（珍稀料放得多），稀有和难得的机会跟着涨；拿低档料垫着赌高一档，稀有和难得的机会打折。涨出来、折下去的份量都算在常见那件头上。
  //   · 五个一模一样的料：只出这一格常见的那件，成色整十成（作者：「五件同样物品打造出来的装备属性最稳定」）。五枚同一行的精炼成一颗灵珠。
  const POOL = {}; for (const sl of GEAR5.SLOTS) { POOL[sl] = { 1: {}, 2: {} }; for (const t of [1, 2]) for (const el of ORDER) POOL[sl][t][el] = ((G6.GRID[sl] || {})[t] || {})[el] ? G6.GRID[sl][t][el].filter(id => ITEM_DB[id]) : []; }
  const RANK_W = { 1: { 0: 50, 1: 35, 3: 15 }, 2: { 0: 40, 1: 30, 2: 20, 3: 10 } };
  const FEE = { 1: 120, 2: 400, gem: 60 };   // 开炉的炭火钱（同档的东西店里卖四五百 / 一千上下）；两档混着放，按出凝丹档的机会在两个价钱之间折
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 一格里几件各占多少份（加起来一百）。H：火候（相生处数 − 相克处数）；q：料的成色比这一档高多少（1 = 正好）
  function cellW(ids, t, H, q) { const w = {}, base = RANK_W[t]; let common = null;
    for (const id of ids) { const r = G6.rankOf(id); if (r == null || G6.NO_FORGE[id]) continue;   // 不从炉子里出的那件（寒星剑）：它那一份并给常见的那件（常见的拿剩下的全部）
      let v = base[r] || 0; if (r === 3) v *= (H > 0 ? 1 + .2 * Math.min(5, H) : H < 0 ? .5 : 1) * q; else if (r === 2) v *= q; if (r === 0) common = id; else w[id] = v; }
    const rest = Object.values(w).reduce((a, v) => a + v, 0);
    if (common) { if (rest > 95) { const k = 95 / rest; for (const id of Object.keys(w)) w[id] *= k; w[common] = 5; } else w[common] = 100 - rest; }   // 常见的那件兜底，最少留半成
    return Object.entries(w); }
  // 五个一模一样的：五枚同一行的精 → 灵珠；别的料 → 它那一格常见的那件（兵饰料出兵器，防具料出衣甲；练气料出练气档，凝丹料、珍稀料出凝丹档）
  const FIXED = {};
  for (const el of ORDER) if (ITEM_DB['m_wx_' + el] && ITEM_DB['g_' + el]) FIXED['m_wx_' + el] = 'g_' + el;
  for (const id of Object.keys(MAT)) { const m = MAT[id]; if (!m.c || !m.wx) continue; const ids = POOL[m.c === 'W' ? 'weapon' : 'armor'][m.g >= 2 ? 2 : 1][m.wx] || [], out = ids.find(q => G6.rankOf(q) === 0 && !G6.NO_FORGE[q]) || ids.find(q => !G6.NO_FORGE[q]); if (out) FIXED[id] = out; }

  // ---------- 六、副属性：材料自己带的那一条 ----------
  // 作者 11-27 14:25：「材料本身也有属性……同一个材料它爆出来它也有附带属性」「装备分为主属性跟副属性，主属性就是攻击、防御、速度之类，
  //   附加属性就有什么系的攻击、特殊效果」。
  //   · 主属性：攻击、防御、气血、灵力、速度（装备本来就有的那几项）。
  //   · 副属性：某系攻击（用那一行出手时伤害加几成）、暴击、克制增伤、减伤、出手回灵、出手回血。
  //   · 兵饰料、防具料每掉一件，有机会带一条副属性（寻常四成半、上等六成半、珍稀必带）；五行之精、内丹不带。
  //     兵饰料多半带自己那一行的「某系攻击」，也会带暴击、克制增伤；防具料多半带减伤、回灵、回血，也会带某系攻击。
  // 记法：S.hero.mq[材料] = ['el_huo:4', 'crit:2', …]，一件一条；没记的那几件就是不带的。别处扣材料（强化、精炼、任务、卖店）时先扣不带的，再从数值最低的扣起。
  const SUB = { el_jin: ['金系攻击', '金攻', '%'], el_mu: ['木系攻击', '木攻', '%'], el_shui: ['水系攻击', '水攻', '%'], el_huo: ['火系攻击', '火攻', '%'], el_tu: ['土系攻击', '土攻', '%'],
    crit: ['暴击', '暴击', '%'], ke: ['克制增伤', '克伤', '%'], guard: ['减伤', '减伤', '%'], mpRegen: ['出手回灵', '回灵', ''], regen: ['出手回血', '回血', '%'],
    xj: ['先机', '先机', '%'], tx: ['调息', '调息', '%'], jc: ['聚财', '聚财', '%'], wu: ['悟性', '悟性', '%'] };   // 后四样是饰品独有的（作者 11-27 16:39）：先机＝开战时行动条先走几成，调息＝打完一场回几成气血灵力，聚财 / 悟性＝这一场的灵石 / 修为多几成
  const SUB_TOP = { el: 8, crit: 3, ke: 8, guard: 3, mpRegen: 3, regen: 2, xj: 20, tx: 10, jc: 20, wu: 10 };   // 各种副属性在材料上最高能到多少（比大小用）
  const LV = { el: { 0: [1, 2], 1: [2, 3], 2: [4, 5], 3: [6, 8] }, crit: { 1: [1], 2: [2], 3: [3] }, ke: { 1: [3], 2: [4, 5], 3: [6, 8] }, guard: { 1: [1], 2: [2], 3: [3] }, mpRegen: { 1: [1], 2: [2], 3: [3] }, regen: { 1: [1], 2: [1], 3: [2] } };
  const LK = { W: [['el', 55], ['crit', 28], ['ke', 17]], A: [['guard', 45], ['mpRegen', 30], ['regen', 25]], X: [['el', 100]] }, LP = { 0: .3, 1: .45, 2: .65, 3: 1 };   // X：五行之精，三成机会带一点自己那一行的「某系攻击」
  const parse = ln => { const i = ln.lastIndexOf(':'); return [ln.slice(0, i), +ln.slice(i + 1)]; };
  const subText = (k, v, short) => SUB[k] ? (short ? SUB[k][1] : SUB[k][0]) + ' +' + v + SUB[k][2] : '';
  const lineText = (ln, short) => { if (!ln) return ''; const [k, v] = parse(ln); return subText(k, v, short); };
  const score = ln => { if (!ln) return -1; const [k, v] = parse(ln); return v / (SUB_TOP[k.startsWith('el_') ? 'el' : k] || 1); };
  const ALLOW = { weapon: k => /^el_/.test(k) || k === 'crit' || k === 'ke', wrist: k => k === 'crit' || k === 'ke', armor: k => k === 'guard' || k === 'regen' || k === 'mpRegen', shoe: k => k === 'guard' || k === 'regen' || k === 'mpRegen', acc: () => false };
  const allow = (slot, ln) => { if (!ln) return false; const f = ALLOW[slot]; return f ? f(parse(ln)[0]) : true; };
  const ACC_P = H => H >= 5 ? .2 : H === 4 ? .15 : H === 3 ? .12 : H === 2 ? .1 : H === 1 ? .08 : H === 0 ? .05 : .02;   // 饰品出一条独有属性的机会：摆得再好也只有两成
  const ACC_V = { 1: { xj: [10], tx: [5], jc: [10], wu: [5] }, 2: { xj: [15, 20], tx: [8, 10], jc: [15, 20], wu: [8, 10] } };
  const canLine = m => !!m && (!!m.c || (!!m.wx && m.g === 0));   // 兵饰料、防具料、五行之精会带；内丹、星辰砂不带
  const SIG_P = .6;   // 带副属性的时候，六成是它「多半带」的那一条（MAT 里的 sig），剩下四成照这一类料的老比例摇
  function rollLine(id) { const m = MAT[id]; if (!canLine(m) || Math.random() >= (LP[m.g] || 0)) return null; const tb = LK[m.c || 'X']; let r = Math.random() * tb.reduce((a, t) => a + t[1], 0), k = tb[0][0]; for (const t of tb) { r -= t[1]; if (r <= 0) { k = t[0]; break; } }
    if (m.sig && LV[m.sig] && Math.random() < SIG_P) k = m.sig;
    if (k === 'el' && !m.wx) k = m.c === 'W' ? 'crit' : 'guard'; const vs = (LV[k][m.g] || LV[k][1]), v = vs[Math.floor(Math.random() * vs.length)]; return (k === 'el' ? 'el_' + m.wx : k) + ':' + v; }
  const have = id => (S.hero.bag[id] || 0);
  const MQ = () => (S.hero.mq = S.hero.mq || {});
  function linesOf(id) { const q = MQ(), a = q[id]; if (!a) return []; const n = have(id); if (a.length > n) { a.sort((x, y) => score(y) - score(x)); a.length = Math.max(0, n); } if (!a.length) { delete q[id]; return []; } return a; }
  // 身上这一种材料按「带的是哪一条」分成几叠：[{ id, ln, n }]，带得好的在前，不带的在最后
  function stacks(id) { const a = linesOf(id), n = have(id), m = {}; for (const ln of a) m[ln] = (m[ln] || 0) + 1; const out = Object.keys(m).sort((x, y) => score(y) - score(x) || (x < y ? -1 : 1)).map(ln => ({ id, ln, n: m[ln] })); if (n - a.length > 0) out.push({ id, ln: null, n: n - a.length }); return out; }
  const take = (id, n) => { const b = S.hero.bag; b[id] = (b[id] || 0) - n; if (b[id] <= 0) delete b[id]; linesOf(id); };   // 泛泛地扣几件：先扣不带的、数值低的
  function takeUnit(id, ln) { const b = S.hero.bag; if (ln) { const a = linesOf(id), i = a.indexOf(ln); if (i >= 0) a.splice(i, 1); } b[id] = (b[id] || 0) - 1; if (b[id] <= 0) delete b[id]; linesOf(id); }
  // 新到手的兵饰料、防具料：一件一件摇它带不带、带哪一条
  if (typeof addItem === 'function') addItem = (orig => function (id, n) { const r = orig.apply(this, arguments);
    try { const m = MAT[id]; if (canLine(m) && S.hero && S.hero.bag) { const k = n === undefined ? 1 : +n; const a = MQ()[id] || (MQ()[id] = []); for (let i = 0; i < k; i++) { const ln = rollLine(id); if (ln) a.push(ln); } if (!a.length) delete MQ()[id]; } } catch (e) {} return r; })(addItem);

  // ---------- 七、成色：五样料在阵盘上围成一圈，看相邻两样的生克 ----------
  // 作者 11-27 14:25：「不要学什么走火不走火的……五行相生，按照相生规律去排序的话，生出来的属性会更高；用相克的话属性就会更低。」
  //   五条边（第 1→2→3→4→5→1 格）：相邻两样相生（不分谁生谁）算一处相生，相克算一处相克；同一行的、不分五行的（内丹、星辰砂），不加不减。
  //   火候 H = 相生处数 − 相克处数。五样各一行、照 金→水→木→火→土 的顺序摆成一圈，五处全相生，H = 5；别的摆法最多到 3。
  // 作者 14:35 又补：「最完美的装备只能靠运气用五行相生合出来，但并不一定每次五行相生就一定能比五件同样的合得高……肯定是比相克合得高的。
  //   五行相生一定是能够有概率合出最完美的、继承属性最多的那个装备，有可能把五条属性都继承了，这就是最完美的，要靠运气。」所以：
  //   · 主属性在一个范围里摇（ROLL）：相生的上限最高；相生最差的也压过相克最好的；平和、相生都可能摇到一成以下（比不过五样一模一样的那个整十成）。
  //   · 五样料各自带的那一条副属性，每条各摇一次留不留；留下的数值跟着火候涨落（每处相生 +5%，每处相克 −5%）。
  //     同一种副属性一件装备上只留一条，所以想要五条全留，得五样料带的是五种不同的；五条全留下是有可能的。
  //   · 「五件同样物品打造出来的装备属性最稳定……只会继承第一件或者最高属性的那个属性条」：五个一模一样 → 主属性整十成、不摇，只带头一样料上的那一条；头一样没带，取五样里最高的。
  //   成色看摇出来的结果：分数 = (主属性成数 − 1) × 100 + 4 × 副属性条数。下品 < −4 ≤ 中品 < 8 ≤ 上品 < 20 ≤ 极品；五条全留下、主属性又在一成一五以上的，是「绝品」。
  const GRADES = ['下品', '中品', '上品', '极品', '绝品'];
  //                火候 →  [主属性下限, 上限, 每条副属性留下的机会]
  const ROLL = H => H >= 5 ? [.98, 1.25, .65] : H === 4 ? [.97, 1.20, .60] : H === 3 ? [.96, 1.16, .54] : H === 2 ? [.95, 1.12, .46] : H === 1 ? [.94, 1.08, .38] : H === 0 ? [.92, 1.04, .30] : H === -1 ? [.84, .93, .20] : [.80, .90, .15];
  const gradeOf = (m, n) => { if (n >= 5 && m >= 1.15) return 4; const sc = (m - 1) * 100 + 4 * n; return sc >= 20 ? 3 : sc >= 8 ? 2 : sc >= -4 ? 1 : 0; };
  const edgeRel = (a, b) => !a || !b ? null : a === b ? 'same' : (SHENG[a] === b || SHENG[b] === a) ? 'sheng' : 'ke';
  const U = s => !s ? null : typeof s === 'string' ? { id: s, ln: null } : s;   // 格子里放的是 { id, ln }；也认单写一个名字的
  const scale = (v, V) => Math.max(1, Math.round(v * V));

  // 看一炉：slots 是五个格子（可以有空）。返回这一炉的情况；界面只拿其中能给玩家看的几样（火候、主属性的范围、有几条副属性在炉里），出哪一件不露。
  //   kind：recipe（对上秘籍）/ fixed（五个一模一样）/ mix（混着放）。mix 的 lo、hi、p 是摇的范围和机会；真去摇是 craft 里的事。
  function analyze(slots) { const us = slots.map(U), fl = us.filter(Boolean), ids = fl.map(u => u.id);
    if (ids.some(id => !MAT[id])) return { ok: false, why: 'notmat', n: fl.length, edges: [], lined: 0 };
    const wx = us.map(u => u ? MAT[u.id].wx : null), edges = us.map((u, i) => u && us[(i + 1) % 5] ? edgeRel(wx[i], wx[(i + 1) % 5]) : null);
    const ns = edges.filter(e => e === 'sheng').length, nk = edges.filter(e => e === 'ke').length, H = ns - nk;
    const cnt = {}; us.forEach((u, i) => { const el = wx[i]; if (el) { cnt[el] = cnt[el] || { n: 0, first: i }; cnt[el].n++; } });
    const E = Object.keys(cnt).sort((a, b) => cnt[b].n - cnt[a].n || cnt[a].first - cnt[b].first)[0] || null;
    const base = { el: E, edges, ns, nk, H, n: fl.length, rare: ids.some(id => MAT[id].g >= 3), lined: new Set(fl.filter(u => u.ln).map(u => parse(u.ln)[0])).size };   // lined：炉里有几种副属性（同一种算一种）
    if (fl.length < 5) return Object.assign(base, { ok: false, why: 'need5' });
    const rc = RKEY[keyOf(ids)];
    if (rc) return Object.assign(base, { ok: true, kind: 'recipe', recipe: rc, cands: [[rc.id, 1]], fee: rc.fee, rare: false });
    if (ids.every(id => id === ids[0]) && FIXED[ids[0]]) { const out = FIXED[ids[0]], it = ITEM_DB[out]; let ln = allow(it.slot, us[0].ln) ? us[0].ln : null; if (!ln) ln = us.map(u => u.ln).filter(l => allow(it.slot, l)).sort((x, y) => score(y) - score(x))[0] || null;
      return Object.assign(base, { ok: true, kind: 'fixed', cands: [[out, 1]], fee: it.gem ? FEE.gem : G6.tierOf(out) >= 2 ? FEE[2] : FEE[1], keep: ln && it.slot ? ln : null, gem: !!it.gem, tier: G6.tierOf(out) || 1, p2: G6.tierOf(out) >= 2 ? 1 : 0 }); }
    const cl = ids.filter(id => MAT[id].c); if (!cl.length) return Object.assign(base, { ok: false, why: 'noclass' });
    const nW = cl.filter(id => MAT[id].c === 'W').length, nA = cl.length - nW, cls = nW > nA ? 'W' : nA > nW ? 'A' : MAT[cl[0]].c;
    const mine = cl.filter(id => MAT[id].c === cls), kinds = new Set(mine).size, slot = cls === 'W' ? (kinds >= 4 ? 'acc' : kinds === 3 ? 'wrist' : 'weapon') : (mine.length >= 4 ? 'armor' : 'shoe');
    const el = E || 'jin', avg = cl.reduce((a, id) => a + MAT[id].g, 0) / cl.length, P = POOL[slot];
    let p2 = cl.filter(id => MAT[id].g >= 2).length / cl.length; if (!P[2][el].length) p2 = 0; else if (!P[1][el].length) p2 = 1;   // 出凝丹档的机会
    const m = {}; for (const t of [1, 2]) { const pt = t === 2 ? p2 : 1 - p2; if (pt <= 0) continue; for (const [id, w] of cellW(P[t][el], t, H, clamp(1 + .5 * (avg - t), .5, 2))) m[id] = (m[id] || 0) + w * pt; }
    if (!Object.keys(m).length) return Object.assign(base, { ok: false, why: 'noclass' });
    const tier = p2 >= .5 ? 2 : 1, [lo, hi, p] = ROLL(H);
    return Object.assign(base, { ok: true, kind: 'mix', cls, slot, tier, p2, el, cands: Object.entries(m), fee: Math.round((FEE[1] + (FEE[2] - FEE[1]) * p2) / 10) * 10, lo, hi, p, V: 1 + .05 * Math.max(-3, Math.min(5, H)),
      lined: new Set(fl.filter(u => allow(slot, u.ln)).map(u => parse(u.ln)[0])).size, lost: new Set(fl.filter(u => u.ln && !allow(slot, u.ln)).map(u => parse(u.ln)[0])).size, accP: slot === 'acc' ? ACC_P(H) : 0 }); }   // lined：这个部位留得住的有几种；lost：留不住的有几种
  function roll(a) { let t = a.cands.reduce((x, c) => x + c[1], 0), r = Math.random() * t; for (const [id, w] of a.cands) { r -= w; if (r <= 0) return id; } return a.cands[a.cands.length - 1][0]; }

  // ---------- 八、打出来的每一件都是独一份 ----------
  // 成色和副属性跟着这一件走，所以合成出来的装备各有各的名字牌：原型名 + ~ + 流水号（比如 w_baihong~7），存在 S.hero.fg 里；
  // 读档、开新档时照着 S.hero.fg 把它们重新登记进物品表。强化、镶嵌本来就是按「这一种」记的，换成这样正好一件一记。
  const KEYS = ['atk', 'def', 'maxhp', 'maxmp', 'spd'];
  const FG = () => (S.hero.fg = S.hero.fg || {});
  function rawOf(base) { const h = S.hero, R = (h.refine = h.refine || {}), G = (h.gems = h.gems || {}), r0 = R[base], g0 = G[base]; delete R[base]; delete G[base];
    const B = ITEM_DB[base], o = { name: B.name, desc: B.desc }; for (const k of KEYS) o[k] = B[k] || 0; if (r0) R[base] = r0; if (g0) G[base] = g0; return o; }
  // 登记一件独一份的装备。refresh：换了存档以后，同一个名字牌可能是另一件（流水号是每份存档各记各的），已经登记过的就原地改
  function reg(xid, refresh) { const e = FG()[xid]; if (!e) return; const cur = ITEM_DB[xid]; if (cur && !refresh) return; const B = ITEM_DB[e.b]; if (!B || !B.slot) return;
    const r = rawOf(e.b), M = +e.m || 1, ss = (e.s || []).filter(s => SUB[parse(s)[0]]), g = gradeOf(M, ss.length), fx = {}, txt = [];
    for (const s of ss) { const [k, v] = parse(s); fx[k] = (fx[k] || 0) + (SUB[k][2] === '%' ? v / 100 : v); txt.push(subText(k, v)); }
    const it = { name: r.name + '（' + GRADES[g] + '）', slot: B.slot, price: 0, sell: Math.max(1, Math.round((B.sell || 60) * M * (1 + .1 * ss.length))), lvReq: B.lvReq, wx: B.wx, base: e.b, fg: 1, grade: g, mult: M, fx5: fx, subs: txt,
      desc: '【' + GRADES[g] + ' · 主属性 ' + Math.round(M * 100) + '%】' + (txt.length ? '副属性：' + txt.join('，') + '。' : '没有副属性。') + String(r.desc || '') };
    if (B.heroOnly) it.heroOnly = true; if (B.set389) it.set389 = B.set389;
    const st = {}; for (const k of KEYS) if (r[k]) st[k] = r[k] > 0 ? Math.max(1, Math.round(r[k] * M)) : r[k];
    if (cur) { Object.assign(cur, it); for (const k of KEYS) if (st[k] || cur[k]) cur[k] = st[k] || 0; }   // 强化、灵珠套在读数外面的那两层认这种改法
    else ITEM_DB[xid] = Object.assign(it, st);
    if (WX5.GEAR[e.b]) WX5.GEAR[xid] = WX5.GEAR[e.b];
    // 同一行的剑、衣、靴凑三件：这一件顶它原型的位置
    try { for (const s of GEAR5.SETS) { if (s.owner) continue; for (let i = 0; i < s.parts.length; i++) { const p = s.parts[i]; if (p === e.b) s.parts[i] = [e.b, xid]; else if (Array.isArray(p) && p.includes(e.b) && !p.includes(xid)) p.push(xid); } } } catch (er) {}
    try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (er) {} }
  function syncAll(refresh) { try { const f = S.hero && S.hero.fg; if (f) for (const xid of Object.keys(f)) reg(xid, refresh === true); } catch (e) { console.warn('R400 sync', e); } }
  function makeInstance(base, m, lines) { const h = S.hero; h.fgn = (h.fgn || 0) + 1; const xid = base + '~' + h.fgn; FG()[xid] = { b: base, m: Math.round(m * 100) / 100, s: lines.map(l => l[0] + ':' + l[1]) }; reg(xid); return xid; }
  // 读档 / 开新档会把 S.hero 整个换掉：一换就照着它身上记的把独一份的装备登记回来（赶在任何界面去查物品表之前）
  try { let _h = S.hero; Object.defineProperty(S, 'hero', { configurable: true, enumerable: true, get() { return _h; }, set(v) { _h = v; syncAll(true); } }); syncAll(true); } catch (e) { console.warn('R400 hero', e); }
  setInterval(() => syncAll(false), 3000);

  // 强化等级是按「这一种装备」记的（equip_plus 的老规矩）；身上正穿着这件时把差额补到人身上
  function setRefine(id, lv) { try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {} const h = S.hero; h.refine = h.refine || {}; const it = ITEM_DB[id]; if (!it) return; const before = {}; for (const k of KEYS) before[k] = it[k] || 0;
    h.refine[id] = lv; const on = h.equip && h.equip[it.slot] === id, d = {}; for (const k of KEYS) { d[k] = (it[k] || 0) - before[k]; if (on && d[k]) h[k] += d[k]; }
    if (on) { h.hp = Math.min(h.hp, h.maxhp); h.mp = Math.min(h.mp, h.maxmp); } return d; }
  const refineOf = id => ((S.hero.refine || {})[id] || 0);

  // 开炉。slots 里是 { id, ln }。返回 { id（到手的那一件）, base（它的原型）, grade, lines, a } 或 { err }
  function craft(slots) { const us = slots.map(U), a = analyze(us); if (!a.ok) return { err: a.why, a };
    const need = {}; for (const u of us) { const k = u.id + '|' + (u.ln || ''); need[k] = (need[k] || 0) + 1; }
    for (const k in need) { const i = k.indexOf('|'), id = k.slice(0, i), ln = k.slice(i + 1), st = stacks(id).find(s => (s.ln || '') === ln); if (!st || st.n < need[k]) return { err: 'lack', a }; }
    if ((S.hero.gold || 0) < a.fee) return { err: 'gold', a };
    for (const u of us) takeUnit(u.id, u.ln); S.hero.gold -= a.fee;
    const base = roll(a), it = ITEM_DB[base]; let id = base, m = 1, lines = [];
    if (it.slot && a.kind === 'fixed') { if (a.keep) lines = [parse(a.keep)]; }
    else if (it.slot && a.kind === 'mix') { m = Math.round((a.lo + Math.random() * (a.hi - a.lo)) * 100) / 100;
      for (const u of us) { if (!u.ln || !allow(it.slot, u.ln) || Math.random() >= a.p) continue; const [k, v] = parse(u.ln), sv = scale(v, a.V), i = lines.findIndex(l => l[0] === k); if (i < 0) lines.push([k, sv]); else if (sv > lines[i][1]) lines[i][1] = sv; }
      if (it.slot === 'acc' && Math.random() < ACC_P(a.H)) { const ks = ['xj', 'tx', 'jc', 'wu'], k = ks[Math.floor(Math.random() * ks.length)], vs = ACC_V[G6.tierOf(base) || a.tier] || ACC_V[1]; lines.push([k, vs[k][Math.floor(Math.random() * vs[k].length)]]); } }   // 五样料各自那一条，各摇各的；同一种副属性一件装备上只留一条（留高的）
    if (it.slot && (a.kind === 'mix' || (a.kind === 'fixed' && lines.length))) id = makeInstance(base, m, lines);   // 混着放出来的都是独一份；五个一样又没带副属性的，就是店里那样的一件
    addItem(id, 1); const f = F(); f.forged = (f.forged || 0) + 1; if (a.kind === 'recipe') f['r400_made_' + base] = 1;
    return { id, base, mult: m, lines, grade: ITEM_DB[id].fg ? ITEM_DB[id].grade : null, rank: G6.rankOf(base), tier: G6.tierOf(base), a }; }

  // ---------- 九、珍稀材料从哪来 ----------
  // 三只头目各掉两枚。已经打倒过的：星旋把他「替你收着」的拿出来（落星坡那头狼打倒时他说过这句）。
  const BOSS = { xingwolf: 'm_xingjing', songxiao: 'm_songxin', chuanshanjia: 'm_tiejia' };
  try { for (const [bid, mid] of Object.entries(BOSS)) { const y = (window.R370_YW || []).find(q => q.id === bid); if (!y || !ITEM_DB[mid]) continue;
      y.extra = y.extra || []; if (!y.extra.includes(mid)) y.extra.push(mid, mid, mid);   // 11-27 傍晚：专属套装多了护腕，每只从两枚加到三枚
      y.after = (o => async function () { F()['r400_g_' + bid] = 1; F()['r404_g3_' + bid] = 1; return o ? o.apply(this, arguments) : undefined; })(y.after); } } catch (e) { console.warn('R400 boss', e); }
  let giving = false;
  setInterval(() => { try { if (giving || !S.started || S.scene !== drawMap || !S.hud || world.locked || dialog || choice || sysPanel || battle) return; const f = F(), got = [];
      for (const [bid, mid] of Object.entries(BOSS)) { if (!f['yw_' + bid] || !ITEM_DB[mid]) continue;
        if (!f['r400_g_' + bid]) { f['r400_g_' + bid] = 1; f['r404_g3_' + bid] = 1; addItem(mid, 3); got.push([mid, 3]); }           // 打倒时还没有这套规矩：三枚一起补
        else if (!f['r404_g3_' + bid]) { f['r404_g3_' + bid] = 1; addItem(mid, 1); got.push([mid, 1]); } }                              // 已经拿过两枚的：补第三枚
      if (!got.length || !window.SAY_LATER) return; giving = true; const third = got.every(g => g[1] === 1);
      SAY_LATER(async () => { try { await say('星旋', third ? '那几只头目身上还剩一样，本神仙替你收着。拿去——专属套装如今要配护腕，炉子上用得着。' : '先前那几只头目身上的好东西，本神仙一直替你收着。拿去——云海大亭的炉子上，打专属套装用得着。');
          if (window.itemGet) await itemGet(got.map(([id, n]) => ({ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×' + n, desc: ITEM_DB[id].desc })), '星旋交还'); } finally { giving = false; } }); } catch (e) {} }, 2000);

  // ---------- 十、图标：Codex R400 画的（r400i/<id>.webp，192 见方）。画法同别的物品：深色圆底 + 一圈品质色；珍稀料、专属的那件是金圈带一层光 ----------
  const ART = new Set(['m_xingjing', 'm_songxin', 'm_tiejia', 'g_jin', 'g_mu', 'g_shui', 'g_huo', 'g_tu', 'c_wx_jin', 'c_wx_mu', 'c_wx_shui', 'c_wx_huo', 'c_wx_tu', 'c_xinghen']);   // Codex R400 的图 11-27 下午到齐
  for (const el of ORDER) for (let lv = 2; lv <= GEM_MAX; lv++) ART.add(gemId(el, lv));   // 二到五级的灵珠：Codex R408 画的，也放在 r400i/
  { const IM = {}, get = id => { if (!ART.has(id)) return null; let o = IM[id]; if (!o) { o = IM[id] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r400i/' + id + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
    const RING = { jin: '#d8dde4', mu: '#6fc98a', shui: '#6fb6ee', huo: '#f08a4a', tu: '#d0a860' };
    if (typeof itemIcon === 'function') itemIcon = (orig => function (id, x, y, r) { const it = ITEM_DB[id], im = it && it.r400 && get(id); if (!im) return orig.apply(this, arguments);
      ctx.save(); const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)'); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill();
      const top = it.rare || it.heroOnly, col = top ? '#f0b43a' : it.gem ? (RING[it.gem] || '#9a8a70') : it.slot ? (G6.col(id) || '#5fbf73') : (RING[it.wx] || '#9a8a70');
      ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = col; ctx.stroke(); if (top) { ctx.globalAlpha = .35; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
      const s2 = r * (it.gem ? 1.9 : 2.1); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x - s2 / 2, y - s2 / 2, s2, s2); ctx.restore();
      try { const gg = it.slot && WX5.GEAR[id]; if (gg && r >= 13) WX5.emblem(gg, x + r * .72, y + r * .72, Math.max(7, r * .36), 1); } catch (e) {}
      // 二级以上的灵珠：右下角挂一枚小牌写着几级（二级和三级的图长得很像，光看珠子分不出来）
      try { if (it.gem && it.glv > 1 && r >= 13) { const bx = x + r * .72, by = y + r * .72, br = Math.max(7, r * .38); ctx.save(); ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fillStyle = 'rgba(10,20,26,.94)'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#c9a962'; ctx.stroke();
        ctx.font = '700 ' + Math.round(br * 1.3) + 'px ' + (window.R386_KIT && R386_KIT.KAI ? R386_KIT.KAI() : '"STKaiti","KaiTi",serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3e3b2'; ctx.fillText('一二三四五'[it.glv - 1], bx, by + br * .08); ctx.restore(); } } catch (e) { try { ctx.restore(); } catch (e2) {} } })(itemIcon); }

  // 独一份的装备：图标用它原型的，左上角挂一枚成色小牌（中品不挂）。这一层套在所有图标画法的最外面。
  if (typeof itemIcon === 'function') itemIcon = (orig => function (id, x, y, r) { const it = ITEM_DB[id]; if (!it || !it.fg) return orig.apply(this, arguments);
    const a = Array.prototype.slice.call(arguments); a[0] = it.base; orig.apply(this, a);
    try { const g = it.grade; if (g !== 1 && r >= 13) { const col = ['#8f989c', '', '#6fa8f2', '#f0b43a', '#ff8a5c'][g], rr = Math.max(7, r * .34), cx = x - r * .72, cy = y - r * .72; ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.fillStyle = 'rgba(10,16,20,.94)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = col; ctx.stroke();
        ctx.font = `700 ${Math.round(rr * 1.25)}px GuxingKai, "KaiTi", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(['下', '', '上', '极', '绝'][g], cx, cy + 1); ctx.restore(); } } catch (e) {} })(itemIcon);

  try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {}   // 这里和 r389 新加的装备，补套上强化的读数（主程序只在开局三秒时补一遍，载入慢就漏了）
  setTimeout(() => { for (const id of ART) { try { itemIcon(id, -999, -999, 8); } catch (e) {} } }, 8000);   // 图标提前要一遍
  window.CRAFT = { ALLOW, allow, ACC_P, MAT, CLASS_NAME, isMat, RECIPES, recipeShown, whoName, FIXED, POOL, RANK_W, cellW, FEE, GEM, GEM_V, GEM_MAX, gemId, BOSS, ART, SUB, GRADES, ROLL, gradeOf, keyOf, analyze, roll, craft, setRefine, refineOf, have, take, takeUnit, stacks, linesOf, lineText, subText, parse, score, reg, syncAll, rollLine };
})();
