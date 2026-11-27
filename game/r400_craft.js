// ================= R400 · 合成（五行打造）的内部规矩（只进测试版）=================
// 作者 11-27 中午（12:32–13:15）定的：照《秦殇前传：复活》那样——把五样材料放进炉子合成装备。
//   · 只有各人的「专属套装」有写明的配方（合成秘籍）；别的装备玩家看不到配方，在玩家眼里是随机的。
//     「我说的随机指的是玩家概念里的随机，但是我们其实是知道的」——这张表就是「我们知道的」那一份，玩家界面上一个字都不露。
//   · 游戏里所有材料都能放进去。材料分两类：兵器和饰品用一类（饰品的搭配更复杂），防具和鞋子用一类。
//   · 五个一模一样的材料 → 一定出同一件（不写说明，玩家试出来的经验）。混着放 → 在两三件里随机出一件。
//   · 一件装备可以有好几条路合出来；总体好坏看材料的五行相生相克。
//   · 专属套装用珍稀材料：只有头目 / 妖王、宝箱、剧情里卖的才有。每人大约两套，从前期到后期；现在先做前期。
//   · 普通装备不等于差：低档朴素，高档照样厉害；只是不成套、没有说明。
// 这里只有数据和算法；界面在 r394_forge.js。
(function () {
  if (!window.WX5 || !window.GEAR5 || typeof ITEM_DB === 'undefined' || typeof S === 'undefined') return;
  const WX = WX5.WX, KE = WX5.KE, SHENG = WX5.SHENG, ORDER = WX5.ORDER, F = () => (S.flags = S.flags || {});
  const REALM = lv => { try { return realmOf(lv); } catch (e) { return lv + ' 级'; } };
  const add = (id, o) => { if (!ITEM_DB[id]) ITEM_DB[id] = o; return ITEM_DB[id]; };

  // ---------- 一、新东西 ----------
  // 珍稀材料：三只头目各掉一样（打专属套装用）
  add('m_xingjing', { name: '衔星晶', price: 0, sell: 200, mat: true, wx: 'huo', rare: 1, r400: 1, desc: '赤焰狼王肩上那块星核碎晶，暗红的晶簇里封着一线星光。珍稀——只有落星坡那头狼王身上有。合成秘籍上记着它的用处。' });
  add('m_songxin', { name: '千年松心', price: 0, sell: 200, mat: true, wx: 'mu', rare: 1, r400: 1, desc: '老松魈的树心。琥珀色的一截，年轮密得数不清，中间还有一道青光在走。珍稀——几百年才长这么一段。合成秘籍上记着它的用处。' });
  add('m_tiejia', { name: '穿山铁鳞', price: 0, sell: 200, mat: true, wx: 'jin', rare: 1, r400: 1, desc: '铁鳞穿山甲背上最大的一片鳞，银灰色，比铁甲还硬。珍稀——那畜生啃了上百年铁矿才长成。合成秘籍上记着它的用处。' });
  // 五行灵珠：五枚同一行的精合成一颗；镶在装备上（镶嵌页）
  const GEM = { jin: ['金灵珠', 'atk', 5, '攻击'], mu: ['木灵珠', 'maxhp', 45, '气血'], shui: ['水灵珠', 'maxmp', 25, '灵力'], huo: ['火灵珠', 'spd', 2, '速度'], tu: ['土灵珠', 'def', 5, '防御'] };
  for (const el of ORDER) add('g_' + el, { name: GEM[el][0], price: 0, sell: 120, gem: el, wx: el, r400: 1, desc: '五枚' + WX[el].n + '精炼成的一颗珠子。镶在装备上：' + GEM[el][3] + ' +' + GEM[el][2] + '；装备也是' + WX[el].n + '性的话再多五成。' });
  // 五行佩：五件朴素的普通饰品（合成才有）
  const PEI = [['c_wx_jin', '锐金佩', 'jin', { atk: 4 }, '白铜打的小环佩，素面无纹，系一根灰白细绳。'], ['c_wx_mu', '青木佩', 'mu', { maxhp: 50 }, '青玉磨的叶形小佩，叶脉只有浅浅几道。'],
    ['c_wx_shui', '玄水佩', 'shui', { maxmp: 30 }, '墨蓝色的水滴形石坠，摸着总是凉的。'], ['c_wx_huo', '离火佩', 'huo', { atk: 2, spd: 1 }, '三粒赤玛瑙串成的短坠，贴身戴着微微发暖。'], ['c_wx_tu', '厚土佩', 'tu', { def: 4 }, '土黄色的方形小石牌，四角磨得圆润。']];
  for (const [id, name, wx, st, desc] of PEI) { if (ITEM_DB[id]) continue; ITEM_DB[id] = Object.assign({ name, slot: 'acc', price: 0, sell: 120, lvReq: 8, wx, r400: 1, desc: desc + '（需要境界：' + REALM(8) + '）' }, st); WX5.GEAR[id] = wx; }

  // ---------- 二、材料：哪一类、什么五行、几品 ----------
  // c：W = 兵器 / 饰品料（牙、角、骨、晶、铁、木芯）；A = 防具 / 鞋料（皮、丝、翼、壳、鳞）；null = 百搭（五行之精、内丹、星辰砂）
  // g：1 寻常、2 上等、3 珍稀。五行跟着它的出处走（打什么性的妖兽，掉什么性的料）。
  const MAT = {
    m_fang: { c: 'W', wx: 'huo', g: 1 }, m_tooth: { c: 'W', wx: 'jin', g: 2 }, m_horn: { c: 'W', wx: 'jin', g: 2 }, m_thorn: { c: 'W', wx: 'mu', g: 2 }, m_yanjing: { c: 'W', wx: 'huo', g: 2 },
    m_gupian: { c: 'W', wx: 'shui', g: 3 }, m_yuntie: { c: 'W', wx: 'jin', g: 3 }, m_xingjing: { c: 'W', wx: 'huo', g: 3 }, m_songxin: { c: 'W', wx: 'mu', g: 3 },
    m_hide: { c: 'A', wx: 'tu', g: 1 }, m_yingpi: { c: 'A', wx: 'shui', g: 2 }, m_silk: { c: 'A', wx: 'mu', g: 2 }, m_wing: { c: 'A', wx: 'huo', g: 2 }, m_shike: { c: 'A', wx: 'tu', g: 2 }, m_tielin: { c: 'A', wx: 'jin', g: 2 },
    m_jinsi: { c: 'A', wx: 'jin', g: 3 }, m_tiejia: { c: 'A', wx: 'jin', g: 3 },
    m_neidan: { c: null, wx: null, g: 3 }, m_xcsha: { c: null, wx: null, g: 3 },
  };
  for (const el of ORDER) MAT['m_wx_' + el] = { c: null, wx: el, g: 0 };
  for (const id of Object.keys(MAT)) if (!ITEM_DB[id]) delete MAT[id];
  const CLASS_NAME = { W: '兵器 · 饰品料', A: '衣甲 · 鞋料', X: '百搭' };
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
  ].filter(r => ITEM_DB[r.id] && r.mats.every(m => ITEM_DB[m]));
  const keyOf = ids => ids.slice().sort().join('+');
  const RKEY = {}; for (const r of RECIPES) RKEY[keyOf(r.mats)] = r;
  const whoName = w => w === 'hero' ? '叶孤星' : ((typeof PARTY_DB !== 'undefined' && PARTY_DB[w]) || {}).name || w;
  const recipeShown = r => r.who === 'hero' || (S.party || []).includes(r.who);

  // ---------- 四、五个一模一样的 → 固定这一件 ----------
  const FIXED = {
    m_fang: 'w_chiyan', m_tooth: 'w_baihong', m_horn: 'w_liuguang', m_thorn: 'w_qingteng', m_yanjing: 'w_zidian', m_gupian: 'w_xuanshuang',
    m_hide: 'a_leather', m_yingpi: 'a_xuanshuang', m_silk: 'a_zhusi', m_wing: 'a_zidian', m_shike: 'a_zhenyue', m_tielin: 'a_tielin', m_jinsi: 'a_liuguang',
  };
  for (const el of ORDER) FIXED['m_wx_' + el] = 'g_' + el;
  for (const k of Object.keys(FIXED)) if (!ITEM_DB[k] || !ITEM_DB[FIXED[k]]) delete FIXED[k];

  // ---------- 五、混着放：出哪个部位、哪一行、哪一档，再从两三件里随机 ----------
  // 部位：兵饰料为主——用到的兵饰料不到三种 → 兵器；三种以上 → 饰品（饰品更复杂）。
  //       防具料为主——放了四样以上 → 衣甲；三样以下 → 鞋（料多成衣，料少成靴）。
  // 五行：五样里哪一行最多（一样多看谁先放）。  档：兵饰 / 防具料的平均品级 ≥ 1.6 算第二档。
  // 每格：[垫底的, 正品们, 上品]。正品有好几件时，这一炉认哪件由五样材料本身决定（同样五样永远认同一件）。
  const POOL = {
    weapon: { dud: { 1: 'w_qingfeng', 2: null },
      1: { jin: ['w_baihong'], mu: ['w_qingteng'], shui: ['w_hantie'], huo: ['w_chiyan'], tu: ['w_xuanyan'] },
      2: { jin: ['w_liuguang'], mu: ['w_biluo'], shui: ['w_xuanshuang'], huo: ['w_chixiao', 'w_zidian'], tu: ['w_zhenyue'] } },
    armor: { dud: { 1: 'a_cloth', 2: null },
      1: { jin: ['a_baihong', 'a_iron'], mu: ['a_qingteng', 'a_yunjin'], shui: ['a_hanxing'], huo: ['a_chiyan'], tu: ['a_xuanyan'] },
      2: { jin: ['a_liuguang', 'a_xuanlin'], mu: ['a_biluo', 'a_tiancan'], shui: ['a_xuanshuang', 'a_nichang'], huo: ['a_zidian', 'a_xiaguang'], tu: ['a_zhenyue', 'a_xipi'] } },
    shoe: { dud: { 1: 's_buyun', 2: null },
      1: { jin: ['s_baihong'], mu: ['s_qingteng'], shui: ['s_hanxing'], huo: ['s_chiyan'], tu: ['s_xuanyan', 's_langhao'] },
      2: { jin: ['s_liuguang'], mu: ['s_biluo', 's_zhuifeng'], shui: ['s_xuanshuang', 's_yingbu', 's_taxue'], huo: ['s_zidian'], tu: ['s_zhenyue'] } },
    acc: { dud: { 1: null, 2: null },
      1: { jin: ['c_wx_jin'], mu: ['c_wx_mu'], shui: ['c_wx_shui'], huo: ['c_wx_huo'], tu: ['c_wx_tu'] },
      2: { jin: ['c_jinsi'], mu: ['c_ningshen', 'c_baihua'], shui: ['c_jade'], huo: ['c_wx_huo'], tu: ['c_tusk'] } },
  };
  for (const sl of Object.keys(POOL)) for (const t of [1, 2]) { if (POOL[sl].dud[t] && !ITEM_DB[POOL[sl].dud[t]]) POOL[sl].dud[t] = null; for (const el of ORDER) POOL[sl][t][el] = (POOL[sl][t][el] || []).filter(id => ITEM_DB[id]); }
  const FEE = { 1: 120, 2: 400, gem: 60 };   // 开炉的炭火钱（同档的东西店里卖四五百 / 一千到两千多）
  // 相生相克怎么折成机会：[垫底, 正品, 上品]
  const ODDS = s => s <= -1 ? [50, 50, 0] : s === 0 ? [15, 80, 5] : s === 1 ? [5, 80, 15] : [0, 70, 30];
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  // 看一炉：ids 是五个格子里放的东西（可以有空）。返回这一炉是什么情况（界面只拿其中能给玩家看的那几样）。
  function analyze(slots) { const ids = slots.filter(Boolean);
    if (ids.some(id => !MAT[id])) return { ok: false, why: 'notmat' };
    // 每格相对「主行」是什么关系（界面画连线用）：same / sheng / ke / none
    const cnt = {}; slots.forEach((id, i) => { const el = id && MAT[id].wx; if (el) { cnt[el] = cnt[el] || { n: 0, first: i }; cnt[el].n++; } });
    const E = Object.keys(cnt).sort((a, b) => cnt[b].n - cnt[a].n || cnt[a].first - cnt[b].first)[0] || null;
    const rel = slots.map(id => { if (!id) return null; const x = MAT[id].wx; return !x ? 'wild' : x === E ? 'same' : SHENG[x] === E ? 'sheng' : KE[x] === E ? 'ke' : 'none'; });
    const s = rel.reduce((a, r) => a + (r === 'sheng' || r === 'wild' ? 1 : r === 'ke' ? -1 : 0), 0);
    const base = { el: E, rel, s, n: ids.length, rare: ids.some(id => MAT[id].g >= 3) };
    if (ids.length < 5) return Object.assign(base, { ok: false, why: 'need5' });
    const rc = RKEY[keyOf(ids)];
    if (rc) return Object.assign(base, { ok: true, kind: 'recipe', recipe: rc, cands: [[rc.id, 1]], fee: rc.fee, rare: false });
    if (ids.every(id => id === ids[0]) && FIXED[ids[0]]) { const out = FIXED[ids[0]], it = ITEM_DB[out]; return Object.assign(base, { ok: true, kind: 'fixed', cands: [[out, 1]], fee: it.gem ? FEE.gem : (it.lvReq || 0) >= 10 ? FEE[2] : FEE[1] }); }
    const cl = ids.filter(id => MAT[id].c); if (!cl.length) return Object.assign(base, { ok: false, why: 'noclass' });
    const nW = cl.filter(id => MAT[id].c === 'W').length, nA = cl.length - nW, cls = nW > nA ? 'W' : nA > nW ? 'A' : MAT[cl[0]].c;
    const mine = cl.filter(id => MAT[id].c === cls), slot = cls === 'W' ? (new Set(mine).size >= 3 ? 'acc' : 'weapon') : (mine.length >= 4 ? 'armor' : 'shoe');
    const tier = cl.reduce((a, id) => a + MAT[id].g, 0) / cl.length >= 1.6 ? 2 : 1, el = E || 'jin';
    const P = POOL[slot], mains = P[tier][el].length ? P[tier][el] : P[1][el], main = mains[hash(keyOf(ids)) % mains.length];
    const dud = tier === 1 ? P.dud[1] : (P[1][el][0] || null), up = tier === 1 ? (P[2][el][0] || null) : (mains.length > 1 ? mains[mains.length - 1] : null);
    const [wd, wm, wu] = ODDS(s), m = {}; const put = (id, w) => { if (id && w > 0) m[id] = (m[id] || 0) + w; };
    put(dud && dud !== main ? dud : main, wd); put(main, wm); put(up && up !== main ? up : main, wu);
    return Object.assign(base, { ok: true, kind: 'mix', cls, slot, tier, el, cands: Object.entries(m), fee: FEE[tier], bonus: s >= 2 ? 1 : 0, dudId: dud && dud !== main ? dud : null, mainId: main, upId: up && up !== main ? up : null }); }
  function roll(a) { let t = a.cands.reduce((x, c) => x + c[1], 0), r = Math.random() * t; for (const [id, w] of a.cands) { r -= w; if (r <= 0) return id; } return a.cands[a.cands.length - 1][0]; }

  // 强化等级是按「这一种装备」记的（equip_plus 的老规矩）；身上正穿着这件时把差额补到人身上
  const KEYS = ['atk', 'def', 'maxhp', 'maxmp', 'spd'];
  function setRefine(id, lv) { try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {} const h = S.hero; h.refine = h.refine || {}; const it = ITEM_DB[id]; if (!it) return; const before = {}; for (const k of KEYS) before[k] = it[k] || 0;
    h.refine[id] = lv; const on = h.equip && h.equip[it.slot] === id, d = {}; for (const k of KEYS) { d[k] = (it[k] || 0) - before[k]; if (on && d[k]) h[k] += d[k]; }
    if (on) { h.hp = Math.min(h.hp, h.maxhp); h.mp = Math.min(h.mp, h.maxmp); } return d; }
  const refineOf = id => ((S.hero.refine || {})[id] || 0);

  const have = id => (S.hero.bag[id] || 0);
  const take = (id, n) => { const b = S.hero.bag; b[id] = (b[id] || 0) - n; if (b[id] <= 0) delete b[id]; };
  // 开炉。返回 { id, bonus, a } 或 { err }
  function craft(slots) { const a = analyze(slots); if (!a.ok) return { err: a.why, a };
    const need = {}; for (const id of slots) need[id] = (need[id] || 0) + 1; for (const id in need) if (have(id) < need[id]) return { err: 'lack', a };
    if ((S.hero.gold || 0) < a.fee) return { err: 'gold', a };
    for (const id in need) take(id, need[id]); S.hero.gold -= a.fee;
    const id = roll(a); addItem(id, 1); let bonus = 0;
    if (a.bonus && ITEM_DB[id].slot && refineOf(id) < 1) { setRefine(id, 1); bonus = 1; }
    const f = F(); f.forged = (f.forged || 0) + 1; if (a.kind === 'recipe') f['r400_made_' + id] = 1;
    return { id, bonus, a }; }

  // ---------- 六、珍稀材料从哪来 ----------
  // 三只头目各掉两枚。已经打倒过的：星旋把他「替你收着」的拿出来（落星坡那头狼打倒时他说过这句）。
  const BOSS = { xingwolf: 'm_xingjing', songxiao: 'm_songxin', chuanshanjia: 'm_tiejia' };
  try { for (const [bid, mid] of Object.entries(BOSS)) { const y = (window.R370_YW || []).find(q => q.id === bid); if (!y || !ITEM_DB[mid]) continue;
      y.extra = y.extra || []; if (!y.extra.includes(mid)) y.extra.push(mid, mid);
      y.after = (o => async function () { F()['r400_g_' + bid] = 1; return o ? o.apply(this, arguments) : undefined; })(y.after); } } catch (e) { console.warn('R400 boss', e); }
  let giving = false;
  setInterval(() => { try { if (giving || !S.started || S.scene !== drawMap || !S.hud || world.locked || dialog || choice || sysPanel || battle) return; const f = F(), got = [];
      for (const [bid, mid] of Object.entries(BOSS)) if (f['yw_' + bid] && !f['r400_g_' + bid] && ITEM_DB[mid]) { f['r400_g_' + bid] = 1; addItem(mid, 2); got.push(mid); }
      if (!got.length || !window.SAY_LATER) return; giving = true;
      SAY_LATER(async () => { try { await say('星旋', '先前那几只头目身上的好东西，本神仙一直替你收着。拿去——云海大亭的炉子上，打专属套装用得着。');
          if (window.itemGet) await itemGet(got.map(id => ({ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×2', desc: ITEM_DB[id].desc })), '星旋交还'); } finally { giving = false; } }); } catch (e) {} }, 2000);

  // ---------- 七、图标：Codex R400 画的（r400i/<id>.webp，192 见方）。画法同别的物品：深色圆底 + 一圈品质色；珍稀料、专属的那件是金圈带一层光 ----------
  const ART = new Set(['m_xingjing', 'm_songxin', 'm_tiejia', 'g_jin', 'g_mu', 'g_shui', 'g_huo', 'g_tu', 'c_wx_jin', 'c_wx_mu', 'c_wx_shui', 'c_wx_huo', 'c_wx_tu', 'c_xinghen']);   // Codex R400 的图 11-27 下午到齐
  { const IM = {}, get = id => { if (!ART.has(id)) return null; let o = IM[id]; if (!o) { o = IM[id] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r400i/' + id + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
    const RING = { jin: '#d8dde4', mu: '#6fc98a', shui: '#6fb6ee', huo: '#f08a4a', tu: '#d0a860' };
    if (typeof itemIcon === 'function') itemIcon = (orig => function (id, x, y, r) { const it = ITEM_DB[id], im = it && it.r400 && get(id); if (!im) return orig.apply(this, arguments);
      ctx.save(); const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)'); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill();
      const top = it.rare || it.heroOnly, col = top ? '#f0b43a' : it.gem ? (RING[it.gem] || '#9a8a70') : it.slot ? '#5fbf73' : (RING[it.wx] || '#9a8a70');
      ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = col; ctx.stroke(); if (top) { ctx.globalAlpha = .35; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
      const s2 = r * (it.gem ? 1.9 : 2.1); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x - s2 / 2, y - s2 / 2, s2, s2); ctx.restore();
      try { const gg = it.slot && WX5.GEAR[id]; if (gg && r >= 13) WX5.emblem(gg, x + r * .72, y + r * .72, Math.max(7, r * .36), 1); } catch (e) {} })(itemIcon); }

  try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {}   // 这里和 r389 新加的装备，补套上强化的读数（主程序只在开局三秒时补一遍，载入慢就漏了）
  setTimeout(() => { for (const id of ART) { try { itemIcon(id, -999, -999, 8); } catch (e) {} } }, 8000);   // 图标提前要一遍
  window.CRAFT = { MAT, CLASS_NAME, isMat, RECIPES, recipeShown, whoName, FIXED, POOL, FEE, ODDS, GEM, BOSS, ART, keyOf, analyze, roll, craft, setRefine, refineOf, have, take };
})();
