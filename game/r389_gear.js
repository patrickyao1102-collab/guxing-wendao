// ================= R389 · 装备分五行：合灵根十成、不合八折；三件套；专属套装（只进测试版）=================
// 作者 11-27 08:02–08:28 定的规矩：
//   · 装备分金木水火土。队友的本命灵根不变（林雪水、云霆火——也能激发金、神乐木、洛尘常态土）；
//     穿合自己灵根的装备发挥十成，不合的打八折（云霆穿金九折）。叶孤星灵根为无，穿什么都是十成。
//   · 剑、衣、靴凑齐同一套三件，有套装效果；套装的五行不合灵根就激不活（叶孤星都能激活；云霆火、金都能）。
//     第四件饰品只有玄器 / 仙器那一档的套装才有——以后再加。
//   · 每个角色一套专属套装。
//   · 开局和剧情里发给各人的装备，属性按各人灵根配好（所以云霆的青霄剑从木改成火：「出鞘有风雷之声」）。
// 这里放的是：三十件新装备的数据（图标等 Codex 的 R389）、八折怎么算、套装怎么算和战斗里的效果、物品图标右下角的五行小徽记。
// 人物全身面板在 r389_panel.js，剑炉在 r394_forge.js。
(function () {
  if (!window.WX5 || typeof ITEM_DB === 'undefined' || typeof allyStats !== 'function' || typeof STATS === 'undefined') return;
  const F = () => (S.flags = S.flags || {}), WX = WX5.WX, ROOT = WX5.ROOT, ROOT2 = WX5.ROOT2;
  const REALM = lv => { try { return realmOf(lv); } catch (e) { return lv + ' 级'; } };

  // ---------- 一、新装备 ----------
  // [id, 名字, 部位, 五行, 套, 需要等级, {属性}, 说明]
  const NEW = [
    // 头一档 · 练气（宗门剑炉打的入门货）
    ['w_baihong', '白虹剑', 'weapon', 'jin', 'baihong', 8, { atk: 20, spd: 1 }, '剑炉里出的头等凡铁剑，刃口磨得发白，没有一点花饰。'],
    ['a_baihong', '白虹甲', 'armor', 'jin', 'baihong', 8, { def: 11, maxhp: 60 }, '细铁环一环扣一环编成的环锁甲，不重，走起来哗哗响。'],
    ['s_baihong', '白虹靴', 'shoe', 'jin', 'baihong', 8, { def: 3, spd: 3 }, '靴头包了一层薄铁，踢到石头上只留个白印。'],
    ['w_qingteng', '青藤剑', 'weapon', 'mu', 'qingteng', 8, { atk: 18, maxhp: 30 }, '老藤缠柄的硬木剑，剑脊嵌一线青钢，砍久了手不麻。'],
    ['a_qingteng', '青藤衣', 'armor', 'mu', 'qingteng', 8, { def: 9, maxhp: 90 }, '粗麻底子、细藤编的护胸，带着草木的清气。'],
    ['s_qingteng', '青藤履', 'shoe', 'mu', 'qingteng', 8, { def: 2, spd: 3, maxhp: 20 }, '藤条编底的麻履，踩在泥里不打滑。'],
    ['a_hanxing', '寒星衣', 'armor', 'shui', 'hanxing', 6, { def: 9, maxhp: 60, maxmp: 20 }, '深蓝的窄袖短衣，袖口缝着几粒寒铁星钉，和寒星剑是一炉里出的。'],
    ['s_hanxing', '寒星靴', 'shoe', 'shui', 'hanxing', 6, { def: 2, spd: 3, maxmp: 10 }, '靴筒浸过寒泉，三伏天穿着也是凉的。'],
    ['w_chiyan', '赤炎剑', 'weapon', 'huo', 'chiyan', 8, { atk: 22 }, '剑身带着一层退不掉的暗红火色，像是刚从炉里抽出来。'],
    ['a_chiyan', '赤炎甲', 'armor', 'huo', 'chiyan', 8, { def: 10, maxhp: 60, atk: 2 }, '兽皮底子上缀着烧蓝的铜片，护得住前心。'],
    ['s_chiyan', '赤炎靴', 'shoe', 'huo', 'chiyan', 8, { def: 2, spd: 3, atk: 1 }, '红褐色的硬皮靴，靴底烙过火纹，踩雪雪化。'],
    ['w_xuanyan', '玄岩剑', 'weapon', 'tu', 'xuanyan', 8, { atk: 21, def: 2 }, '又宽又厚的重剑，剑脊像一块没凿完的青石。'],
    ['a_xuanyan', '玄岩甲', 'armor', 'tu', 'xuanyan', 8, { def: 14, maxhp: 80 }, '厚牛皮上钉着一排排石片，沉，但是挨得住。'],
    ['s_xuanyan', '玄岩靴', 'shoe', 'tu', 'xuanyan', 8, { def: 4, spd: 2, maxhp: 20 }, '厚底的硬皮靴，站在哪儿都像生了根。'],
    // 第二档 · 凝丹（玄天城的上品灵器）
    ['a_liuguang', '流光甲', 'armor', 'jin', 'liuguang', 10, { def: 17, maxhp: 110, spd: 1 }, '银白的细鳞软甲，行动时鳞片上流过一线光，和流光剑同出玄兵阁。'],
    ['s_liuguang', '流光靴', 'shoe', 'jin', 'liuguang', 10, { def: 4, spd: 5 }, '靴面嵌着银丝云纹，落地没有声音。'],
    ['w_biluo', '碧落剑', 'weapon', 'mu', 'biluo', 11, { atk: 26, maxhp: 40 }, '剑身泛着春水一样的碧色，剑格是一片舒展的叶子。'],
    ['a_biluo', '碧落衣', 'armor', 'mu', 'biluo', 11, { def: 15, maxhp: 150, maxmp: 20 }, '碧色的广袖法衣，衣摆绣着缠枝，风一吹像有藤在长。'],
    ['s_biluo', '碧落履', 'shoe', 'mu', 'biluo', 11, { def: 3, spd: 4, maxhp: 30 }, '软缎面的履，鞋头缀一粒青玉。'],
    ['a_xuanshuang', '玄霜衣', 'armor', 'shui', 'xuanshuang', 12, { def: 15, maxhp: 110, maxmp: 40 }, '冰蓝的交领长衣，肩头凝着一层擦不掉的薄霜。'],
    ['s_xuanshuang', '玄霜靴', 'shoe', 'shui', 'xuanshuang', 12, { def: 3, spd: 4, maxmp: 20 }, '靴口一圈白狐毛，靴面是霜花暗纹。'],
    ['a_zidian', '紫电甲', 'armor', 'huo', 'zidian', 14, { def: 16, maxhp: 110, atk: 3 }, '深紫的轻甲，甲缝里时不时窜过一丝电光。'],
    ['s_zidian', '紫电靴', 'shoe', 'huo', 'zidian', 14, { def: 3, spd: 5, atk: 2 }, '靴跟嵌着雷纹铜扣，跑起来脚下噼啪作响。'],
    ['w_zhenyue', '镇岳剑', 'weapon', 'tu', 'zhenyue', 12, { atk: 28, def: 3 }, '暗金色的阔剑，剑身刻着山岳纹，剑格嵌一块黄玉。'],
    ['a_zhenyue', '镇岳甲', 'armor', 'tu', 'zhenyue', 12, { def: 21, maxhp: 140 }, '暗金鳞甲，两肩的护肩是两座小小的山。'],
    ['s_zhenyue', '镇岳靴', 'shoe', 'tu', 'zhenyue', 12, { def: 6, spd: 3, maxhp: 30 }, '包金的重靴，靴筒刻着山纹。'],
    // 护腕（作者 11-27 16:33 加的第五个部位；16:39：普通套装四件——剑、护腕、衣、靴）。护腕管攻击，定在同档兵器的四五成。
    ['r_baihong', '白虹护腕', 'wrist', 'jin', 'baihong', 8, { atk: 9, spd: 1 }, '磨得发白的薄铁护腕，腕口扣着一圈细环。'],
    ['r_qingteng', '青藤护腕', 'wrist', 'mu', 'qingteng', 8, { atk: 8, maxhp: 20 }, '老藤一圈圈缠成的护腕，贴着腕子的那面垫了软麻。'],
    ['r_hanxing', '寒星护腕', 'wrist', 'shui', 'hanxing', 6, { atk: 9, maxmp: 10 }, '深蓝的窄护腕，腕背缝着三粒寒铁星钉，和寒星剑是一炉里出的。'],
    ['r_chiyan', '赤炎护腕', 'wrist', 'huo', 'chiyan', 8, { atk: 10 }, '硬皮上钉着烧蓝的铜片，握拳的时候铜片微微发烫。'],
    ['r_xuanyan', '玄岩护腕', 'wrist', 'tu', 'xuanyan', 8, { atk: 9, def: 2 }, '厚牛皮上钉着两排石片，沉甸甸地压着腕子。'],
    ['r_liuguang', '流光护腕', 'wrist', 'jin', 'liuguang', 10, { atk: 10, spd: 1 }, '银白的细鳞护腕，翻腕时鳞片上流过一线光。'],
    ['r_biluo', '碧落护腕', 'wrist', 'mu', 'biluo', 11, { atk: 12, maxhp: 30 }, '碧色软缎裹着细藤，腕口缀一片青玉叶子。'],
    ['r_xuanshuang', '玄霜护腕', 'wrist', 'shui', 'xuanshuang', 12, { atk: 12, maxmp: 20 }, '冰蓝的护腕，腕背凝着一层擦不掉的薄霜。'],
    ['r_zidian', '紫电护腕', 'wrist', 'huo', 'zidian', 14, { atk: 15, spd: 1 }, '深紫的轻甲护腕，出剑时甲缝里窜过一丝电光。'],
    ['r_zhenyue', '镇岳护腕', 'wrist', 'tu', 'zhenyue', 12, { atk: 13, def: 3 }, '暗金的鳞甲护腕，腕背嵌一小块黄玉。'],
    // 专属
    ['a_yunlei', '云雷衣', 'armor', 'huo', 'yunlei', 12, { def: 22, maxhp: 190, spd: 2, atk: 4 }, '云霆的衣。玄色窄袖劲装，衣上暗绣流云，领缘和袖口是雷纹银边。'],
    ['s_yunlei', '云雷靴', 'shoe', 'huo', 'yunlei', 12, { def: 6, spd: 7, atk: 4 }, '云霆的靴。玄色长靴，靴侧一道银色雷纹。'],
    ['s_tashuang', '踏霜履', 'shoe', 'shui', 'ningshuang', 12, { def: 6, spd: 6, maxmp: 45, maxhp: 40 }, '林雪的履。素白的软履，鞋尖一点冰蓝，走过的地方留一线薄霜。'],
    // 专属套装连饰品一起成套，一共五件（作者 11-27 16:39）：三套各补一件护腕，云雷、凝霜各补一件饰品。都在剑炉照合成秘籍打。
    ['r_xinghen', '星痕护腕', 'wrist', 'jin', 'xinghen', 9, { atk: 12, spd: 2, maxmp: 20 }, '叶孤星的护腕。乌银底子上錾着七点星，腕口一道浅浅的剑痕。'],
    ['r_yunlei', '云雷护腕', 'wrist', 'huo', 'yunlei', 12, { atk: 18, spd: 2 }, '云霆的护腕。玄色硬皮，腕背一道银色雷纹，握剑时雷纹会亮一下。'],
    ['r_ningshuang', '凝霜护腕', 'wrist', 'shui', 'ningshuang', 12, { atk: 14, maxmp: 40 }, '林雪的护腕。素白软缎裹着薄冰似的玉片，腕口凝一圈细霜。'],
    ['c_yunlei', '云雷佩', 'acc', 'huo', 'yunlei', 12, { atk: 8, spd: 2 }, '云霆的佩。一块墨玉，玉里天生一道银色雷纹。'],
    ['c_ningshuang', '凝霜簪', 'acc', 'shui', 'ningshuang', 12, { atk: 5, maxmp: 40 }, '林雪的簪。冰蓝的玉簪，簪头一朵六出霜花。'],
  ];
  // 星痕第四件（饰品）：作者说只有玄器、仙器那一档的套装才配饰品——叶孤星的「星痕」是头一套。在剑炉照合成秘籍打（r400_craft.js）。
  if (!ITEM_DB.c_xinghen) ITEM_DB.c_xinghen = { name: '星痕坠', slot: 'acc', price: 0, sell: 400, lvReq: 9, heroOnly: true, r400: 1, atk: 8, spd: 2, maxmp: 30, desc: '叶孤星的坠子。七颗银星连成北斗，正中一道剑痕，和星痕剑是一家的。叶孤星佩戴另有专属效果（需要境界：' + REALM(9) + '）' };
  for (const [id, name, slot, wx, set, lv, st, desc] of NEW) { if (ITEM_DB[id]) continue;
    ITEM_DB[id] = Object.assign({ name, slot, price: 0, sell: 60 + lv * 14, lvReq: lv, wx, r389: 1, desc: desc + '（需要境界：' + REALM(lv) + '）' }, st); WX5.GEAR[id] = wx; }
  WX5.GEAR.w_qingxiao = 'huo';   // 青霄剑是给云霆的：「出鞘有风雷之声」，按他的灵根算火（雷）

  // ---------- 二、套装 ----------
  // owner：专属（只有这个人能激活）；fx：战斗里的效果
  const SETS = [
    { id: 'baihong', name: '白虹', wx: 'jin', tier: 1, parts: ['w_baihong', 'r_baihong', 'a_baihong', 's_baihong'], fx: { crit: .03 }, text: '暴击 +3%' },
    { id: 'qingteng', name: '青藤', wx: 'mu', tier: 1, parts: ['w_qingteng', 'r_qingteng', 'a_qingteng', 's_qingteng'], fx: { regen: .02 }, text: '每次出手后回复 2% 气血' },
    { id: 'hanxing', name: '寒星', wx: 'shui', tier: 1, parts: ['w_hanxing', 'r_hanxing', 'a_hanxing', 's_hanxing'], fx: { mpRegen: 4 }, text: '每次出手后回复 4 灵力' },
    { id: 'chiyan', name: '赤炎', wx: 'huo', tier: 1, parts: ['w_chiyan', 'r_chiyan', 'a_chiyan', 's_chiyan'], fx: { ke: .06 }, text: '打出相克时，伤害再加 6%' },
    { id: 'xuanyan', name: '玄岩', wx: 'tu', tier: 1, parts: ['w_xuanyan', 'r_xuanyan', 'a_xuanyan', 's_xuanyan'], fx: { guard: .04 }, text: '受到的伤害减 4%' },
    { id: 'liuguang', name: '流光', wx: 'jin', tier: 2, parts: ['w_liuguang', 'r_liuguang', 'a_liuguang', 's_liuguang'], fx: { crit: .05 }, text: '暴击 +5%' },
    { id: 'biluo', name: '碧落', wx: 'mu', tier: 2, parts: ['w_biluo', 'r_biluo', 'a_biluo', 's_biluo'], fx: { regen: .03 }, text: '每次出手后回复 3% 气血' },
    { id: 'xuanshuang', name: '玄霜', wx: 'shui', tier: 2, parts: ['w_xuanshuang', 'r_xuanshuang', 'a_xuanshuang', 's_xuanshuang'], fx: { mpRegen: 6 }, text: '每次出手后回复 6 灵力' },
    { id: 'zidian', name: '紫电', wx: 'huo', tier: 2, parts: ['w_zidian', 'r_zidian', 'a_zidian', 's_zidian'], fx: { ke: .10 }, text: '打出相克时，伤害再加一成' },
    { id: 'zhenyue', name: '镇岳', wx: 'tu', tier: 2, parts: ['w_zhenyue', 'r_zhenyue', 'a_zhenyue', 's_zhenyue'], fx: { guard: .06 }, text: '受到的伤害减 6%' },
    { id: 'xinghen', name: '星痕', wx: null, tier: 9, owner: 'hero', parts: [['w_xinghen', 'w_xinghen2'], 'r_xinghen', 'a_liuyun', 'c_tayun'], fx: { rune: .3, crit: .08 }, text: '换过星纹的那一手伤害加三成；暴击 +8%', extra: { id: 'c_xinghen', fx: { ke: .2, mpRegen: 8 }, text: '打出相克时伤害再加两成；每次出手后回复 8 灵力' } },
    { id: 'yunlei', name: '云雷', wx: 'huo', tier: 9, owner: 'yunting', parts: ['w_yunlei', 'r_yunlei', 'a_yunlei', 's_yunlei'], fx: { crit: .2, ke: .2 }, text: '暴击 +20%；打出相克时伤害再加两成', skill: 'yunlei', skillName: '云雷踏影', extra: { id: 'c_yunlei', fx: { xj: .3 }, text: '先机：开战时行动条先走三成' } },
    { id: 'ningshuang', name: '凝霜', wx: 'shui', tier: 9, owner: 'linxue', parts: ['@auc_sword', 'r_ningshuang', 'a_ziyun', 's_tashuang'], partNames: ['凝霜剑'], fx: { mpRegen: 16, regen: .05, guard: .1 }, text: '每次出手后回复 16 灵力、5% 气血；受到的伤害减一成', extra: { id: 'c_ningshuang', fx: { tx: .1 }, text: '调息：每打完一场，回复一成气血和灵力' } },
  ];
  const setOfItem = id => SETS.find(s => s.parts.some(p => Array.isArray(p) ? p.includes(id) : p === id) || (s.extra && s.extra.id === id)) || null;
  for (const s of SETS) for (const p of s.parts) for (const id of (Array.isArray(p) ? p : [p])) if (ITEM_DB[id]) ITEM_DB[id].set389 = s.id;
  for (const s of SETS) if (s.extra && ITEM_DB[s.extra.id]) ITEM_DB[s.extra.id].set389 = s.id;

  // ---------- 三、谁穿着什么；合不合灵根 ----------
  const SLOTS = ['weapon', 'wrist', 'armor', 'shoe', 'acc'];   // 作者 11-27 16:33：加护腕
  window.GX_WRIST = 1;   // 行囊的装备页、状态页照这个多画一格（index.html 的 EQ_SLOTS）
  const eqOf = who => { try { return who === 'hero' ? (S.hero.equip || {}) : (window.allyEqOf ? allyEqOf(who) : {}); } catch (e) { return {}; } };
  const rootOf = who => who === 'hero' ? null : (ROOT[who] || null);
  // 这件装备穿在这个人身上发挥几成：1 / .9 / .8
  function fit(who, id) { const g = WX5.GEAR[id]; if (!g || who === 'hero') return 1; const r = ROOT[who]; if (!r || g === r) return 1; return ROOT2[who] === g ? .9 : .8; }
  const fitText = (who, id) => { const g = WX5.GEAR[id]; if (!g) return ['不分五行', 0]; if (who === 'hero') return ['十成', 1]; const k = fit(who, id); return k >= 1 ? ['合灵根 · 十成', 1] : k >= .9 ? ['次合 · 九折', -1] : ['不合灵根 · 八折', -2]; };
  // 套装：凑了几件、激不激得活
  function setState(who, s) { const eq = eqOf(who), have = s.parts.map(p => typeof p === 'string' && p[0] === '@' ? !!F()[p.slice(1)] && who === s.owner : (Array.isArray(p) ? p : [p]).some(id => SLOTS.some(sl => eq[sl] === id)));
    const n = have.filter(Boolean).length, r = rootOf(who); let why = '';
    if (s.owner && s.owner !== who) why = '只有' + (s.owner === 'hero' ? '叶孤星' : (PARTY_DB[s.owner] || {}).name || '') + '能激活'; else if (s.wx && who !== 'hero' && !(r === s.wx || ROOT2[who] === s.wx)) why = '灵根不合，激不活';
    const on = n >= s.parts.length && !why, ex = !!(s.extra && SLOTS.some(sl => eq[sl] === s.extra.id));   // ex：专属套装的饰品也戴上了（第五件）
    return { n, need: s.parts.length, have, on, why, ex, on4: on && ex }; }
  const setsOf = who => SETS.map(s => [s, setState(who, s)]).filter(([, st]) => st.n > 0);
  // 这个人身上现在生效的效果：激活了的套装 + 身上每件装备自己的副属性（剑炉合成时从材料上带来的：某系攻击 el_金木水火土、暴击、克制增伤、减伤、回灵、回血）
  const activeFx = who => { const fx = {}; for (const [s, st] of setsOf(who)) if (st.on) { for (const k in s.fx) fx[k] = (fx[k] || 0) + s.fx[k]; if (st.on4) for (const k in s.extra.fx) fx[k] = (fx[k] || 0) + s.extra.fx[k]; }
    try { const eq = eqOf(who), sub = {}; for (const sl of SLOTS) { const it = ITEM_DB[eq[sl]], f = it && it.fx5; if (f) for (const k in f) sub[k] = (sub[k] || 0) + f[k]; }
      for (const k in sub) fx[k] = (fx[k] || 0) + Math.min(sub[k], SUB_CAP[k] || (/^el_/.test(k) ? .3 : 9)); } catch (e) {}   // 四件装备的副属性加起来有个顶，免得叠出格
    return fx; };
  const SUB_CAP = { crit: .2, ke: .3, guard: .2, regen: .05, mpRegen: 8, xj: .5, tx: .3, jc: .5, wu: .5 };

  // 队友：不合灵根的装备打折（在 r101 把装备属性加上去之后，把差额减回来）
  allyStats = (orig => function (k) { const o = orig.apply(this, arguments);
    try { const e = window.allyEqOf && S.allyEq && S.allyEq[k]; if (e) for (const s of SLOTS) { const id = e[s], it = ITEM_DB[id], f = it ? fit(k, id) : 1; if (it && f < 1) for (const st of STATS) if (it[st] > 0) o[st] = (o[st] || 0) - Math.round(it[st] * (1 - f)); } } catch (er) {}
    return o; })(allyStats);

  // ---------- 四、套装在战斗里的效果 ----------
  const whoOf = u => !u || u.side !== 'hero' ? null : (u.ally || 'hero');
  const fxOf = u => { const w = whoOf(u); if (!w) return {}; const b = battle; if (!b) return {}; b._setFx = b._setFx || {}; return b._setFx[w] || (b._setFx[w] = activeFx(w)); };
  // 暴击
  if (typeof dmgCalc === 'function') dmgCalc = (orig => function (att, def, mult, critRate) { try { const c = att && att.side === 'hero' && def && def.side === 'enemy' ? fxOf(att).crit : 0; if (c) return orig.call(this, att, def, mult === undefined ? 1 : mult, (critRate === undefined ? .15 : critRate) + c); } catch (e) {} return orig.apply(this, arguments); })(dmgCalc);
  // 伤害：火套（克制再加）、星痕（换纹那一手）、土套（挨打减伤）
  if (typeof applyDamage === 'function') applyDamage = (orig => function (t, d, crit, opts) {
    try { const b = battle, att = b && b.active; if (b && t && t.alive && !(b.cfg && b.cfg.sunKill)) {
        if (t.side === 'enemy' && att && att.side === 'hero' && !(opts && opts.noWx)) { const fx = fxOf(att); let k = 1;
          if (fx.ke && WX5.rel(WX5.unitWx(att), WX5.unitWx(t)) > 0) k *= 1 + fx.ke;
          const ex = fx['el_' + WX5.unitWx(att)]; if (ex) k *= 1 + ex;   // 副属性「某系攻击」：这一手是那一行的，就加
          if (fx.rune && !att.ally && b._wxSw === (b._actNo || 0) && b._wxSw != null) k *= 1 + fx.rune;
          if (k !== 1) arguments[1] = Math.max(1, Math.round(d * k)); }
        else if (t.side === 'hero') { const g = fxOf(t).guard; if (g) arguments[1] = Math.max(1, Math.round(d * (1 - g))); } } } catch (e) {}
    return orig.apply(this, arguments); })(applyDamage);
  // 出手后回气血 / 灵力（木套、水套）
  if (typeof doHeroAction === 'function') doHeroAction = (orig => async function (k) { const b = battle, u = b && b.active; const r = await orig.apply(this, arguments);
    try { if (b && battle === b && u && u.alive && u.side === 'hero' && b.state !== 'menu' && b.state !== 'pick' && k !== 'flee') { const fx = fxOf(u);   // 真出了手才算（只是打开选目标、灵力不够退回菜单都不算）
        if (fx.regen && u.hp < u.maxhp) { const v = Math.max(1, Math.round(u.maxhp * fx.regen)); u.hp = Math.min(u.maxhp, u.hp + v); try { floatText(u.x, u.y - u.h - 20, '+' + v, '#8fe39a', 30); } catch (e) {} }
        if (fx.mpRegen && u.mp < u.maxmp) { u.mp = Math.min(u.maxmp, u.mp + fx.mpRegen); try { floatText(u.x + 40, u.y - u.h - 46, '灵 +' + fx.mpRegen, '#9cc3e8', 24); } catch (e) {} } } } catch (e) {}
    return r; })(doHeroAction);

  // ---------- 五、图标：新装备用 Codex R389 的图（到了才有）；凡是分五行的装备，图标右下角挂一枚小徽记 ----------
  const ART_READY = true;   // Codex R389 的图标 11-27 上午到了（r389i/，用的是 192 的那一份，手机高清屏上不糊）
  const IM = {}; const get = id => { if (!ART_READY) return null; let o = IM[id]; if (!o) { o = IM[id] = { ok: false, bad: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.onerror = () => { o.bad = true; }; o.im.src = 'r389i/' + id + '.webp?v=' + (/^r_|^c_(yunlei|ningshuang)$/.test(id) ? 2 : 1);   /* 护腕和两件专属饰品的图 11-27 傍晚才到（Codex R403）：换个版本号，免得浏览器还记着早先「没有这张图」 */ try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
  const QC = ['#9a8a70', '#5fbf73', '#5f9cf0', '#f0b43a'];
  // 圈的颜色：专属套装金；排进格子的（r406_items.js）看它在那一格里是第几等——常见灰、套装件绿、稀有蓝、难得金；别的照老规矩
  const qOf = id => { const st = setOfItem(id) || {}, it = ITEM_DB[id] || {}; return st.tier >= 9 ? 3 : it.rk != null ? it.rk : st.tier === 2 ? 2 : 1; };
  if (typeof itemIcon === 'function') itemIcon = (orig => function (id, x, y, r) { const it = ITEM_DB[id];
    const im = it && it.r389 && get(id);
    if (im) { const q = qOf(id); ctx.save(); const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = QC[q]; ctx.stroke(); const s2 = r * 2.15; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x - s2 / 2, y - s2 / 2, s2, s2); ctx.restore(); }
    else if (it && it.r389 && (it.slot === 'wrist' || /^c_(yunlei|ningshuang)$/.test(id))) {   // 图还没到的新东西（护腕、两件专属饰品）：先用一个带字的圆顶着，Codex 的图到了自动换上
      const q = qOf(id); ctx.save(); const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = QC[q]; ctx.stroke(); ctx.font = `${Math.round(r * 1.05)}px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e9d9a8'; ctx.fillText(it.slot === 'wrist' ? '腕' : id === 'c_ningshuang' ? '簪' : '佩', x, y + r * .06); ctx.restore(); }
    else { orig.apply(this, arguments);
      // 老图标（主程序、r370 画的那些）排进格子以后，外面那一圈也换成第几等的颜色
      if (it && it.slot && it.rk != null && !it.r406 && !it.r400 && !it.fg) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = QC[it.rk]; ctx.stroke(); ctx.restore(); } }
    try { const g = it && it.slot && WX5.GEAR[id]; if (g && r >= 13) WX5.emblem(g, x + r * .72, y + r * .72, Math.max(7, r * .36), 1); } catch (e) {} })(itemIcon);


  // ---------- 六、护腕：三件旧的搬过来；身上戴错格子的挪正 ----------
  // 金丝护腕、竹纹护腕、陨星护腕原来挂在饰品栏（作者 11-27 16:20：「金丝护腕肯定不属于饰品」）。护腕管攻击：金丝护腕的攻击提到同档兵器的四五成。
  const JINSI_OLD = { atk: 6, def: 6 }, JINSI_NEW = { atk: 12, def: 4 };
  for (const id of ['c_jinsi', 'c_qz_huwan', 'c_yunxing']) if (ITEM_DB[id]) ITEM_DB[id].slot = 'wrist';
  if (ITEM_DB.c_jinsi) Object.assign(ITEM_DB.c_jinsi, JINSI_NEW);
  if (!WX5.GEAR.c_jinsi && ITEM_DB.c_jinsi) WX5.GEAR.c_jinsi = 'jin';
  const fixSlots = () => { try { if (!S.hero || !S.hero.equip) return; const f = F(), h = S.hero;
      // 金丝护腕的数改过：叶孤星正戴着的话，把差额补到他身上（每份存档只补一回）
      if (!f.r404_jinsi) { f.r404_jinsi = 1; if (Object.values(h.equip).includes('c_jinsi')) for (const k in JINSI_NEW) h[k] += JINSI_NEW[k] - JINSI_OLD[k]; }
      const all = [['hero', h.equip]].concat(Object.entries(S.allyEq || {}));
      for (const [who, eq] of all) { if (!eq || typeof eq !== 'object') continue;
        for (const sl of Object.keys(eq)) { const id = eq[sl], it = id && ITEM_DB[id]; if (!it || !it.slot || it.slot === sl || !SLOTS.includes(sl)) continue;
          if (!eq[it.slot]) { eq[it.slot] = id; eq[sl] = null; }   // 这件该戴在另一格：那一格空着就挪过去
          else { eq[sl] = null; if (who === 'hero') { try { applyItemStats(id, -1); } catch (e) {} } h.bag[id] = (h.bag[id] || 0) + 1; } } } } catch (e) {} };
  fixSlots(); setInterval(fixSlots, 2000);

  // ---------- 七、饰品独有的四样（作者 11-27 16:39：别的四个部位没有；很难出，大多数饰品是普通的）----------
  // 先机 xj：开战时行动条先走几成。调息 tx：打完一场回几成气血灵力。聚财 jc：这一场的灵石多几成。悟性 wu：这一场的修为多几成（聚财、悟性全队加起来算）。
  if (typeof updateBattle === 'function') updateBattle = (orig => function (dt) {
    try { const b = battle; if (b && !b._xj && b.units && b.state === 'run') { b._xj = 1; for (const u of b.units) if (u.side === 'hero' && u.alive) { const v = fxOf(u).xj; if (v) { u.gauge = Math.min(99, (u.gauge || 0) + 100 * v); try { floatText(u.x, u.y - u.h - 30, '先机', '#f0d890', 28); } catch (e) {} } } } } catch (e) {}
    return orig.apply(this, arguments); })(updateBattle);
  if (typeof endBattle === 'function') endBattle = (orig => function (win) {
    try { const b = battle; if (win && b && !b._r404 && b.units) { b._r404 = 1; let jc = 0, wu = 0;
        for (const u of b.units) if (u.side === 'hero') { const fx = fxOf(u); jc += fx.jc || 0; wu += fx.wu || 0;
          if (fx.tx && u.alive) { u.hp = Math.min(u.maxhp, u.hp + Math.round(u.maxhp * fx.tx)); u.mp = Math.min(u.maxmp, u.mp + Math.round(u.maxmp * fx.tx)); } }
        jc = Math.min(SUB_CAP.jc, jc); wu = Math.min(SUB_CAP.wu, wu);
        if (wu) b.cfg.exp = Math.round((b.cfg.exp || b.enemies.reduce((s, e) => s + Math.round(e.maxhp / 6), 0)) * (1 + wu));
        if (jc) b.cfg.gold = Math.round((b.cfg.gold || b.enemies.reduce((s, e) => s + Math.round(e.maxhp / 12), 0)) * (1 + jc)); } } catch (e) {}
    return orig.apply(this, arguments); })(endBattle);

  // ---------- 八、套装技能（作者 11-27 16:43 / 16:47）----------
  // 成套的专属套装带一个技能：穿齐了才能施展，脱了就没有；不能用卷册参悟。云雷套带出「云雷踏影」；凝霜套的那一招以后再加；星痕套还没定。
  // 学没学会由这里说了算（index.html 的 learned 先来问一声）：返回 undefined 表示「这招不是套装技能，照老规矩」。
  window.SET_SKILL = (who, id) => { const s = SETS.find(x => x.skill === id && x.owner === who); if (!s) return undefined; try { return !!setState(who, s).on; } catch (e) { return false; } };
  const setSkillOf = who => SETS.filter(x => x.skill && x.owner === who).map(x => ({ set: x, on: !!setState(who, x).on }));
  // 典籍阁不再卖套装技能的书
  if (typeof window.SK4_SHOP === 'function' && window.SK4) window.SK4_SHOP = (o => function () { let out = o.apply(this, arguments); try { for (const x of SETS) if (x.skill) out = out.filter(id => id !== SK4.bookId(x.owner, x.skill)); } catch (e) {} return out; })(window.SK4_SHOP);
  try { for (const x of SETS) if (x.skill && window.SK4) { const bk = ITEM_DB[SK4.bookId(x.owner, x.skill)]; if (bk) { bk.price = 0; bk.desc = '旧书。「' + x.skillName + '」如今是' + x.name + '套装带出来的：穿齐四件就能施展，用不着这本书了。'; } } } catch (e) {}

  window.GEAR5 = { NEW: NEW.map(a => a[0]), SETS, SLOTS, setOfItem, fit, fitText, setState, setsOf, activeFx, eqOf, rootOf, setSkillOf, fixSlots };
})();
