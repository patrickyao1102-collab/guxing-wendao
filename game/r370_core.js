// ================= R370 · 游戏感①：装备档次、掉落、妖王讨伐、法宝（作者 11-26 夜）（只进测试版）=================
// 作者：「现在的游戏给人一种一直看剧情、一直看小说的感觉，没有那种游戏感……你去看看仙剑奇侠传系列」
//       「例如 法宝 等级 装备 商店系统 你想想」「允许设计新的功能界面以及等级提示牌」
// 照仙剑的骨架补的几样（都不动主线剧情）：
//   ① 新装备一档：玄兵阁卖灵剑灵甲；成衣铺卖衣和鞋；裁缝铺拿妖兽材料定做；胭脂铺卖香囊和香。鞋子这一格以前全游戏只有一双踏云靴。
//   ② 掉落：23 种妖兽以前只有 10 种会掉东西，现在个个有掉落，材料能卖钱也能拿去定做。
//   ③ 妖王讨伐：五张野外地图深处各蹲着一只妖王，可打可不打；各有打法（看它蓄力就防御，它力竭露破绽时猛打），打赢得独一件的法宝。
//   ④ 法宝：带一件进战斗，每场能祭出一次。
(function () {
  if (typeof ITEM_DB === 'undefined' || typeof TMAPS === 'undefined' || typeof MOB_DB === 'undefined' || typeof DROPS === 'undefined') return;
  const F = () => (S.flags = S.flags || {});
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const NEW = {"w_liuguang": {"name": "流光剑", "slot": "weapon", "atk": 22, "lvReq": 10, "price": 900, "desc": "玄兵阁的招牌灵剑，剑身一线流光，出剑比寻常铁剑快半分。", "spd": 1}, "w_xuanshuang": {"name": "玄霜剑", "slot": "weapon", "atk": 27, "lvReq": 12, "price": 1600, "desc": "北地玄霜铁所铸，握之生寒，能助灵力流转。", "maxmp": 20}, "w_zidian": {"name": "紫电剑", "slot": "weapon", "atk": 33, "lvReq": 14, "price": 2800, "desc": "剑脊嵌一缕紫电纹，鲁师傅三年只出这一口。", "spd": 2}, "a_xuanlin": {"name": "玄鳞甲", "slot": "armor", "def": 18, "maxhp": 120, "lvReq": 11, "price": 1500, "desc": "玄铁打成细鳞，一片压一片，沉是沉了些，胜在结实。"}, "a_yunjin": {"name": "云锦长衫", "slot": "armor", "def": 11, "maxhp": 70, "lvReq": 8, "price": 520, "desc": "锦云坊的成衣，云纹暗织，料子里掺了灵蚕丝。", "maxmp": 20}, "a_tiancan": {"name": "天蚕法衣", "slot": "armor", "def": 16, "maxhp": 110, "lvReq": 11, "price": 1300, "desc": "天蚕丝织的法衣，轻若无物，寻常刀剑划不破。", "maxmp": 40}, "a_xiaguang": {"name": "霞光羽衣", "slot": "armor", "def": 20, "maxhp": 150, "lvReq": 13, "price": 2400, "desc": "织入霞鹜翎羽，日光下流转七色，是锦云坊的镇店之衣。", "maxmp": 50, "spd": 1}, "s_buyun": {"name": "步云履", "slot": "shoe", "spd": 2, "def": 2, "lvReq": 6, "price": 380, "desc": "千层底的布履，鞋头绣一朵流云，走远路不磨脚。"}, "s_zhuifeng": {"name": "追风靴", "slot": "shoe", "spd": 4, "def": 3, "lvReq": 10, "price": 980, "desc": "靴筒缝了风翎，赶路时像有人在背后推着走。"}, "s_taxue": {"name": "踏雪无痕靴", "slot": "shoe", "spd": 6, "def": 5, "lvReq": 13, "price": 2100, "desc": "雪貂皮为面、灵丝为底，踏雪不留痕。", "maxhp": 40}, "s_langhao": {"name": "狼毫软靴", "slot": "shoe", "spd": 3, "def": 2, "lvReq": 8, "price": 0, "desc": "裁月记老裁缝用狼牙、兽皮定做的软靴，靴口一圈狼毫，穿上脚下生劲。", "atk": 3}, "a_xipi": {"name": "犀皮护甲", "slot": "armor", "def": 17, "maxhp": 140, "lvReq": 10, "price": 0, "desc": "黑犀皮鞣了七遍缝成的护甲，针脚密得看不见。"}, "a_zhusi": {"name": "蛛丝内甲", "slot": "armor", "def": 15, "maxhp": 90, "lvReq": 12, "price": 0, "desc": "影蛛丝织的贴身内甲，薄如蝉翼，灵力在丝里走得比在经脉里还顺。", "maxmp": 60, "spd": 1}, "s_yingbu": {"name": "影步靴", "slot": "shoe", "spd": 5, "def": 3, "lvReq": 12, "price": 0, "desc": "幽影狼皮缝的靴子，夜里走路连影子都轻。", "maxmp": 20}, "c_jinsi": {"name": "金丝护腕", "slot": "acc", "price": 0, "desc": "金蛛丝一圈一圈缠成的护腕，刀砍上去只留一道白印。", "atk": 6, "def": 6}, "a_yaowang": {"name": "妖王战袍", "slot": "armor", "def": 24, "maxhp": 200, "lvReq": 14, "price": 0, "desc": "取三位妖王身上的材料缝成的战袍。老裁缝说，这辈子就做这一件。", "atk": 4}, "c_ningshen": {"name": "凝神香囊", "slot": "acc", "price": 600, "desc": "点绛铺的香囊，里头是晒干的凝神草，闻着心静。", "maxmp": 40, "def": 2}, "c_baihua": {"name": "百花香囊", "slot": "acc", "price": 900, "desc": "十二种花瓣配的香囊，佩在身上气血都活泛些。", "maxhp": 80, "maxmp": 20}, "x_xingshen": {"name": "醒神香", "use": "heal", "hp": 0, "mp": 80, "price": 60, "desc": "点绛铺的线香，掐一截点上，灵力回来得快。恢复 80 灵力"}, "x_anxi": {"name": "安息香", "use": "heal", "hp": 180, "mp": 40, "price": 90, "desc": "点绛铺的安息香丸，含在舌下，气血灵力一齐回。恢复 180 气血、40 灵力"}, "m_yingpi": {"name": "幽影狼皮", "price": 0, "sell": 30, "desc": "幽影狼的皮，对着光看不见毛色。裁缝铺收，也能卖钱。", "mat": 1}, "m_silk": {"name": "影蛛丝", "price": 0, "sell": 36, "desc": "影纹蛛姬吐的丝，韧而不黏。裁缝铺收，也能卖钱。", "mat": 1}, "m_jinsi": {"name": "金蛛丝", "price": 0, "sell": 160, "desc": "金丝蛛后的丝，一根能吊起一头牛。只有精英蛛后身上有。", "mat": 1}, "m_thorn": {"name": "荆棘芯", "price": 0, "sell": 34, "desc": "荆棘妖姬藤条里最硬的一段芯。能卖钱。", "mat": 1}, "m_yanjing": {"name": "烈焰晶", "price": 0, "sell": 60, "desc": "烈焰妖豹体内凝的火晶，握在手里发烫。能卖钱。", "mat": 1}, "m_wing": {"name": "血蝠翼", "price": 0, "sell": 38, "desc": "血纹蝙蝠的翼膜，薄而韧。能卖钱。", "mat": 1}, "m_shike": {"name": "石蛛壳", "price": 0, "sell": 42, "desc": "洞穴石蛛的背壳，敲起来像石头。能卖钱。", "mat": 1}, "m_gupian": {"name": "妖将骨刃片", "price": 0, "sell": 90, "desc": "苍狼妖将骨刃上崩下来的碎片，寒气未散。只有精英妖将身上有。", "mat": 1}, "m_neidan": {"name": "妖王内丹", "price": 0, "sell": 0, "desc": "妖王一身修为所凝。星旋说，这东西能拿来祭炼法宝。", "mat": 1}, "fb_huxin": {"name": "护心镜", "fabao": 1, "grade": "下品灵器", "price": 0, "desc": "一面巴掌大的铜镜，镜背刻着护心咒。星旋从玉佩宝库的角落里翻出来的。", "eff": "战斗中使用：全队接下来受到的 2 次伤害减半。每场一次。"}, "fb_hanshan": {"name": "撼山獠牙", "fabao": 1, "grade": "中品灵器", "price": 0, "desc": "铁背獠牙猪王的一根獠牙，祭炼之后，握着它像握着一座小山。", "eff": "战斗中使用：重击一个敌人，并打断它正在蓄的招。每场一次。"}, "fb_xiaoyue": {"name": "啸月狼符", "fabao": 1, "grade": "中品灵器", "price": 0, "desc": "苍狼妖将颈间的骨符。吹响时，四周的风都往一个方向走。", "eff": "战斗中使用：号令一出，全队立刻再动一轮。每场一次。"}, "fb_lihuo": {"name": "离火珠", "fabao": 1, "grade": "上品灵器", "price": 0, "desc": "烈焰妖豹的本命火珠，珠心一点离火长明不灭。", "eff": "战斗中使用：离火焚遍全体敌人，并灼烧 3 回合。每场一次。"}, "fb_fuyao": {"name": "缚妖索", "fabao": 1, "grade": "上品灵器", "price": 0, "desc": "金丝蛛后的本命丝搓成的索子，专捆妖物。", "eff": "战斗中使用：捆住一个敌人，让它很久动弹不得（妖王挣脱得快些）。每场一次。"}, "fb_huichun": {"name": "回春木心", "fabao": 1, "grade": "极品灵器", "price": 0, "desc": "千年荆棘妖姬的木心，离了本体还在发芽。", "eff": "战斗中使用：全队恢复四成气血，并解除灼烧、缚丝。每场一次。"}};
  for (const id in NEW) { if (ITEM_DB[id]) continue; const it = ITEM_DB[id] = NEW[id];
    if (it.slot && it.lvReq && !/需要境界/.test(it.desc)) it.desc += '（需要境界：' + (typeof realmOf === 'function' ? realmOf(it.lvReq) : it.lvReq + ' 级') + '）';
    if (it.fabao) it.desc = it.desc + ' ' + it.eff; }
  window.R370_ITEMS = Object.keys(NEW);
  // 图标：Codex R370（r370i/<id>.webp，96×96 透明），画法同 R290 / R368：深色圆底 + 品质外圈
  if (typeof itemIcon === 'function') { const IM = {}, QC = ['#9a8a70', '#5fbf73', '#5f9cf0', '#f0b43a'];
    const Q = id => NEW[id].fabao ? 3 : NEW[id].mat ? (/neidan|jinsi|gupian/.test(id) ? 2 : 0) : /zidian|xiaguang|taxue|yaowang|jinsi/.test(id) ? 2 : 1;
    const get = id => { let o = IM[id]; if (!o) { o = IM[id] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r370i/' + id + '.webp?v=1'; } return o.ok ? o.im : null; };
    window.R370_ICON = get;
    itemIcon = (orig => function (id, x, y, r) { const im = NEW[id] && get(id); if (!im) return orig.apply(this, arguments);
      const q = Q(id); ctx.save(); const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = QC[q]; ctx.stroke();
      if (q >= 2) { ctx.globalAlpha = .35; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
      const s2 = r * 2.15; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x - s2 / 2, y - s2 / 2, s2, s2); ctx.restore(); })(itemIcon);
    setTimeout(() => { for (const id in NEW) get(id); }, 9000); }

  // ---------- ② 掉落：每种妖兽都有东西可掉（键 = 战斗形象的 key） ----------
  const add = (k, list) => { DROPS[k] = (DROPS[k] || []).concat(list.filter(([id]) => ITEM_DB[id] && !(DROPS[k] || []).some(d => d[0] === id))); };
  add('e_leopard', [['m_yanjing', .45], ['m_hide', .3]]);
  add('e_ywolf', [['m_yingpi', .5], ['m_tooth', .25]]);
  add('e_spider', [['m_silk', .5], ['p_mp', .15]]);
  add('e_treant', [['m_thorn', .5], ['p_big', .12]]);
  add('m_tree', [['m_thorn', .2]]);
  add('e_xiexiu', [['p_mp', .3], ['p_big', .15]]);
  add('e_corpse', [['p_big', .25]]);
  add('e_spiderq', [['m_jinsi', 1], ['m_silk', .6], ['c_ningshen', .12]]);
  add('e_wolfking', [['m_gupian', 1], ['m_yingpi', .5], ['s_buyun', .12]]);
  add('e_xbat', [['m_wing', .5], ['p_small', .2]]);
  add('e_xwraith', [['p_mp', .35]]);
  add('e_xspider', [['m_shike', .5], ['m_silk', .25]]);
  add('e_xguard1', [['p_big', .25], ['p_mp', .2]]); add('e_xguard2', [['p_mp', .4]]); add('e_xguard3', [['p_big', .25], ['p_small', .3]]);
  add('e_fox3', [['p_revive', .5]]);
  add('e_rhino', [['a_iron', .04]]); add('e_wolf2', [['m_hide', .3]]);
  window.R370_DROPS_OF = key => (DROPS[key] || []).map(([id, p]) => [id, ITEM_DB[id] ? ITEM_DB[id].name : id, p]);

  // ---------- ① 铺子的货 ----------
  const STOCK = window.R370_STOCK = {
    xuanbing: ['w_liuguang', 'w_xuanshuang', 'w_zidian', 'a_xuanlin', 'w_hantie', 'a_iron'],
    chengyi: ['a_yunjin', 'a_tiancan', 'a_xiaguang', 's_buyun', 's_zhuifeng', 's_taxue'],
    yanzhi: ['c_ningshen', 'c_baihua', 'x_xingshen', 'x_anxi'],
  };
  // 裁缝铺定做：材料 + 工钱
  const CRAFT = window.R370_CRAFT = [
    { id: 's_langhao', mats: { m_fang: 4, m_hide: 3 }, fee: 180 },
    { id: 'a_xipi', mats: { m_horn: 3, m_hide: 4 }, fee: 420 },
    { id: 's_yingbu', mats: { m_yingpi: 4, m_tooth: 2 }, fee: 520 },
    { id: 'a_zhusi', mats: { m_silk: 6, m_shike: 2 }, fee: 680 },
    { id: 'c_jinsi', mats: { m_jinsi: 2, m_gupian: 1 }, fee: 800 },
    { id: 'a_yaowang', mats: { m_neidan: 3, m_yingpi: 3, m_jinsi: 1 }, fee: 1500 },
  ];
  const matLine = c => Object.entries(c.mats).map(([m, n]) => ITEM_DB[m].name + ' ' + itemCount(m) + '/' + n).join('、');
  const canCraft = c => Object.entries(c.mats).every(([m, n]) => itemCount(m) >= n) && S.hero.gold >= c.fee;
  const takeItem = (id, n) => { const h = S.hero; h.bag[id] = (h.bag[id] || 0) - n; if (h.bag[id] <= 0) delete h.bag[id]; };
  window.R370_CRAFT_OPEN = async function (who) {
    who = who || '秦师傅';
    for (;;) {
      const opts = CRAFT.map(c => ITEM_DB[c.id].name + (canCraft(c) ? '　·　料齐，可做' : Object.entries(c.mats).every(([m, n]) => itemCount(m) >= n) ? '　·　工钱不够' : '　·　缺料')).concat(['离开']);
      const i = await choose('裁月记 · 拿材料定做', opts); if (i == null || i < 0 || i >= CRAFT.length) return;
      const c = CRAFT[i], it = ITEM_DB[c.id];
      await showPanel(it.name, [it.desc, '!' + ['atk', 'def', 'maxhp', 'maxmp', 'spd'].filter(k => it[k]).map(k => STAT_CN[k] + ' +' + it[k]).join('　'), '材料：' + matLine(c), '工钱：' + c.fee + ' 灵石（身上 ' + S.hero.gold + '）']);
      if (!canCraft(c)) { await say(who, S.hero.gold < c.fee && Object.entries(c.mats).every(([m, n]) => itemCount(m) >= n) ? '料是齐了。工钱还差一点，攒够了再来。' : '料还不齐。齐了拿来，我给你做。'); continue; }
      const j = await choose('定做 ' + it.name + '？', ['做', '再想想']); if (j !== 0) continue;
      for (const [m, n] of Object.entries(c.mats)) takeItem(m, n); S.hero.gold -= c.fee; addItem(c.id, 1);
      try { playSnd('ui_confirm'); } catch (e) {}
      await say(who, '（他把料子一样样摊开，量、裁、缝，一盏茶的工夫）……成了。穿上试试，不合身再改。');
      if (window.itemGet) await itemGet([{ icon: 'item:' + c.id, name: it.name, count: '×1', desc: it.desc }], '定做完成');
    }
  };
  // 玄兵阁：掌柜以前只在主线里说话，现在平时能买东西了（主线对话说完才开柜）
  try { const n = (TMAPS.xt_city.npcs || []).find(n => n.name === '玄兵阁掌柜'); if (n && !n.shop) n.shop = STOCK.xuanbing; } catch (e) {}

  // ---------- ③ 妖王 ----------
  const YW = window.R370_YW = [
    { id: 'boar', cry: '敢闯本王山头？看我不撞碎你们！', ep: '撼山', name: '铁背獠牙猪王', type: 'boar', map: 'xt_road', pos: [1088, 800], lv: 10, fabao: 'fb_hanshan', bg: 'bg_mountain', scale: 1.9, mh: 200,
      where: '青玄近道 · 道旁野地', tip: '它蓄力冲撞之前会刨地——那一下要防御。撞完它会力竭，那是出手的时候。', extra: ['c_tusk', 'm_hide', 'm_hide'] },
    { id: 'wolf', cry: '踏入本将领地，便把命留下吧！', ep: '啸月', name: '苍狼妖将', type: 'wolfking', map: 'lin_forest', pos: [288, 608], lv: 12, fabao: 'fb_xiaoyue', bg: 'bg_mountain', scale: 1.25, mh: 250, adds: ['wolf2', 'wolf2'],
      where: '云霄山脉 · 山外树林 · 西北溪边', tip: '身边的狼活着，它就越打越凶——先清狼。它举刀蓄势时防御。', extra: ['m_gupian', 'm_yingpi', 'm_yingpi'] },
    { id: 'leopard', cry: '磨磨蹭蹭的，先把你们烧成灰！', ep: '离火', name: '烈焰妖豹', type: 'leopard', map: 'hf_valley', pos: [1280, 448], lv: 14, fabao: 'fb_lihuo', bg: 'bg_mountain', scale: 1.8, mh: 190,
      where: '黑风谷 · 北坡石阶上', tip: '它快，一轮能扑两回。浑身火光大盛就是要放「离火燎原」——不防御会被烧上好几轮。', extra: ['m_yanjing', 'm_yanjing', 'm_yanjing'] },
    { id: 'spider', cry: '细皮嫩肉的，正好留着裹进茧里。', ep: '千丝', name: '金丝蛛后', type: 'spiderq', map: 'm_yy_tiger', pos: [608, 1184], lv: 16, fabao: 'fb_fuyao', bg: 'bg_youying', scale: 1.3, mh: 240,
      where: '幽影林 · 追虎迷径 · 西边林隙', tip: '被它的丝缠住的人要歇一轮。它张网蓄势时全队防御，不然一个都动不了。血少了它会唤小蛛。', extra: ['m_jinsi', 'm_jinsi', 'm_silk', 'm_silk'] },
    { id: 'treant', cry: '来得正好，我的花正缺人血浇呢。', ep: '回春', name: '荆棘妖姬', type: 'treant', map: 'm_yy_verge', pos: [2752, 1472], lv: 18, fabao: 'fb_huichun', bg: 'bg_youying', scale: 1.3, mh: 220, adds: ['tree', 'tree'], addName: '荆棘花',
      where: '幽影林 · 林尽闻声 · 兽骨空地', tip: '两朵荆棘花会一直给它回血——花不除，它打不死。', extra: ['m_thorn', 'm_thorn', 'm_thorn', 'p_revive'] },
  ];
  // 榜外第六只（Gemini 的主意）：五张悬赏全盖了「诛」之后才露面，不上榜
  YW.push({ id: 'rhino', hidden: true, cry: '……多少年了，还有人敢走这条山路。', ep: '镇岳', name: '黑甲犀王', type: 'rhino', map: 'tj_xiashan', pos: [912, 2048], lv: 20, fabao: null, bg: 'bg_mountain', scale: 1.8, mh: 200,
    where: '天剑山 · 下山路深处', tip: '它每动一回，身上的铁甲就厚一层。只有逼它使出「镇岳踏」、力竭之后，铁甲才会碎。', extra: ['m_neidan', 'm_neidan', 'm_horn', 'm_horn', 'p_revive', 'p_revive'] });
  const ywDone = y => !!F()['yw_' + y.id];
  const allFive = () => YW.filter(y => !y.hidden).every(ywDone);
  const HP = lv => 2700 + (lv - 10) * 650, ATK = lv => 66 + Math.round((lv - 10) * 6.5), DEF = lv => 14 + Math.round((lv - 10) * 1.5);
  const SPD = { boar: 9, wolf: 14, leopard: 19, spider: 15, treant: 9, rhino: 8 };
  const heroes = b => (b.heroes || [b.P]).filter(u => u.alive);
  const big = (t, c = '#ff6a4a', s = 62) => floatText(W / 2, 300, t, c, s, 1.5, BRUSH);
  const guard = P => { if (P.buffs.def) { delete P.buffs.def; floatText(P.x, P.y - P.h - 10, '格挡', '#9fd3ff', 36); return .4; } if (P.buffs.shield) { P.buffs.shield--; if (!P.buffs.shield) delete P.buffs.shield; return .5; } return 1; };
  async function charge(e, text) { e._charge = text; e.pose = null; big(e._ep + ' · 蓄势', '#ff5a3a', 58); try { playSnd('sfx_charge'); } catch (e2) {} S.shake = 8;
    try { fx('fx3_orb_violet', { loop: true, life: .9, layer: 2, x: e.x + 40, y: e.y - e.h * .55, scale: k => .4 + k * .7, alpha: 1.2 }); } catch (e2) {} await sleep(1000); return true; }
  async function tired(e) { e._break = 2; e._pojiT = performance.now() / 1000; if (!art('poji')) floatText(e.x, e.y - e.h - 70, '力竭 · 破绽！', '#ffe27a', 44, 1.6, BRUSH); try { playSnd('sfx_boom', .5); } catch (e2) {} await sleep(500); }
  async function aoe(e, b, name, fxName, mult, color, each) {
    e._charge = null; big(name, color, 70); try { playSnd('sfx_charge'); } catch (e2) {} await dimTo(.55, 250); await sleep(500);
    for (const P of heroes(b)) { try { fx(fxName, { x: P.x, y: P.y - P.h * .5, scale: 1.15, alpha: 1.4 }); } catch (e2) {}
      let { d, crit } = dmgCalc(e, P, mult, .05); const g = guard(P); d = Math.round(d * g); applyDamage(P, d, crit); if (each && P.alive) each(P, g < 1, d); }
    try { playSnd('sfx_boom', .8); } catch (e2) {} S.shake = 18; await sleep(600); await dimTo(0, 250); await tired(e); return true; }
  async function strike(e, b, P, name, mult, fxName) {
    if (name) big(name, '#ffb04a', 64); e.pose = 'atk'; await dashTo(e, P.x - 150, P.y, 200); try { playSnd('sfx_claw'); fx(fxName || 'fx3_claw_red', { x: P.x - 10, y: P.y - P.h * .5, scale: .9, rot: -.25 }); } catch (e2) {}
    let { d, crit } = dmgCalc(e, P, mult, .08); d = Math.round(d * guard(P)); applyDamage(P, d, crit); await sleep(260); await dashBack(e, 240); e.pose = null; return d; }
  function summon(b, e, types, name) {
    const slots = [[570, 665], [545, 470], [440, 560], [620, 565], [470, 690]], used = b.enemies.filter(x => x.alive).map(x => [x.x, x.y]); let n = 0;
    for (const t of types) { const s = slots.find(s => used.every(u => Math.hypot(u[0] - s[0], u[1] - s[1]) > 110)); if (!s) break; used.push(s);
      const m = makeEnemy(t, Math.max(0, e.lv - 8) * .5); if (name) { m.name = name; m.hp = m.maxhp = Math.round(m.maxhp * 1.3); m._flower = 1; } m.name += ' Lv' + Math.max(1, e.lv - 2); m.lv = e.lv - 2; m._add = e._id;
      const u = unit(Object.assign({ side: 'enemy' }, m)); u.x = s[0]; u.y = s[1]; u.gauge = ri(0, 30);
      try { const hh = window.BATTLE_SIZE && BATTLE_SIZE[u.key]; if (hh) u.h = hh; } catch (e2) {}
      b.enemies.push(u); b.units.push(u); n++; try { particleBurst(u.x, u.y - u.h / 2, 30, ['#b48cff', '#fff'], 300, .8, 6); } catch (e2) {} }
    return n; }
  const addsAlive = (b, e) => b.enemies.filter(x => x.alive && x._add === e._id);
  // 每只妖王的打法。返回 true = 这一轮已经出过手
  const AI = {
    boar: async (e, b) => { const t = e.turn % 4;
      if (!e._rage && e.hp < e.maxhp * .35) { e._rage = 1; e.atk = Math.round(e.atk * 1.2); big('狂怒', '#ff4a2a', 60); await sleep(700); }
      if (t === 3) return charge(e, '它在刨地蓄力——这一撞要防御！');
      if (t === 0 && e._charge) { e._charge = null; const hs = heroes(b), P = hs.slice().sort((a, c) => c.hp - a.hp)[0]; await strike(e, b, P, '撼山冲撞', 2.6, 'fx3_burst_earth');
        for (const Q of heroes(b)) if (Q !== P) { let { d } = dmgCalc(e, Q, .6, 0); applyDamage(Q, Math.round(d * guard(Q)), false); } S.shake = 20; await tired(e); return true; }
      return false; },
    wolf: async (e, b) => { const n = addsAlive(b, e).length; e.atk = Math.round(e._atk0 * (1 + .1 * n)); const t = e.turn % 4;
      if (!e._howl && e.hp < e.maxhp * .55 && n < 2) { e._howl = 1; big('啸月', '#8fd8ff', 70); try { playSnd('sfx_charge'); } catch (e2) {} await sleep(600); summon(b, e, ['wolf2', 'wolf2'].slice(0, 2 - n)); await sleep(500); return true; }
      if (t === 3) return charge(e, '它举刀蓄势——「骨刃月斩」，防御！');
      if (t === 0 && e._charge) return aoe(e, b, '骨刃月斩', 'fx3_slash_blue', 1.5, '#8fd8ff');
      return false; },
    leopard: async (e, b) => { const t = e.turn % 3;
      for (const P of heroes(b)) if (P._burn > 0) { P._burn--; const d = Math.max(1, Math.round(P.maxhp * .06)); P.hp = Math.max(1, P.hp - d); floatText(P.x, P.y - P.h * .8, '灼烧 -' + d, '#ff8a3a', 34); }
      if (!e._rage && e.hp < e.maxhp * .4) { e._rage = 1; e.spd = Math.round(e.spd * 1.3); big('狂暴', '#ff4a2a', 60); await sleep(700); }
      if (t === 2) return charge(e, '它浑身火光大盛——「离火燎原」，防御！');
      if (t === 0 && e._charge) return aoe(e, b, '离火燎原', 'fx3_burst_red', 1.35, '#ff7a3a', (P, guarded) => { if (!guarded) { P._burn = 3; floatText(P.x, P.y - P.h - 30, '灼烧', '#ff8a3a', 36); } });
      const hs = heroes(b); await strike(e, b, hs[ri(0, hs.length - 1)], null, .75); const h2 = heroes(b); if (h2.length) await strike(e, b, h2[ri(0, h2.length - 1)], null, .75); return true; },
    spider: async (e, b) => { const t = e.turn % 5;
      if (!e._brood && e.hp < e.maxhp * .5) { e._brood = 1; big('唤蛛', '#ffd34a', 66); await sleep(600); summon(b, e, ['spider', 'spider']); await sleep(500); return true; }
      if (t === 4) return charge(e, '它张开金网——「千丝天罗」，防御！');
      if (t === 0 && e._charge) return aoe(e, b, '千丝天罗', 'fx3_slash_gold', 1.15, '#ffd34a', (P, guarded) => { if (!guarded) { P.gauge = -70; floatText(P.x, P.y - P.h - 30, '缚丝', '#ffe27a', 36); } });
      if (t === 1 || t === 3) { const hs = heroes(b), P = hs[ri(0, hs.length - 1)]; const d = await strike(e, b, P, '缚丝吸髓', .7, 'fx3_slash_gold'); if (P.alive) { P.gauge = Math.min(P.gauge, -80); floatText(P.x, P.y - P.h - 30, '缚丝', '#ffe27a', 36); }
        const heal = Math.min(e.maxhp - e.hp, Math.round(d * 1.5)); if (heal > 0) { e.hp += heal; floatText(e.x, e.y - e.h * .8, '+' + heal, '#7dff8a', 40); } return true; }
      return false; },
    treant: async (e, b) => { const fl = addsAlive(b, e), t = e.turn % 4;
      if (fl.length && e.hp < e.maxhp) { const heal = Math.round(e.maxhp * .035 * fl.length); e.hp = Math.min(e.maxhp, e.hp + heal); floatText(e.x, e.y - e.h * .8, '回春 +' + heal, '#7dff8a', 40); try { fx('fx3_burst_green', { x: e.x, y: e.y - e.h * .5, scale: .9 }); } catch (e2) {} await sleep(450); }
      const need = !fl.length && ((!e._s1 && e.hp < e.maxhp * .6) || (!e._s2 && e.hp < e.maxhp * .3));
      if (need) { if (!e._s1) e._s1 = 1; else e._s2 = 1; big('荆棘花开', '#8fe07a', 64); await sleep(600); summon(b, e, ['tree', 'tree'], '荆棘花'); await sleep(500); return true; }
      if (t === 3) return charge(e, '藤条从地里拱起——「万棘穿心」，防御！');
      if (t === 0 && e._charge) return aoe(e, b, '万棘穿心', 'fx3_burst_green', 1.5, '#8fe07a');
      return false; },
  };
  AI.rhino = async (e, b) => { const t = e.turn % 4;
    if (!(e._break > 0) && (e._armor || 0) < 5) { e._armor = (e._armor || 0) + 1; e.def = e._def0 + e._armor * 7; floatText(e.x, e.y - e.h - 40, '铁甲 ×' + e._armor, '#cfd6e0', 34); await sleep(350); }
    if (t === 3) return charge(e, '它人立而起——「镇岳踏」，防御！');
    if (t === 0 && e._charge) { const r = await aoe(e, b, '镇岳踏', 'fx3_burst_earth', 1.6, '#cfd6e0'); e._armor = 0; e.def = e._def0; floatText(e.x, e.y - e.h - 110, '铁甲尽碎', '#ffe27a', 40, 1.4, BRUSH); return r; }
    return false; };
  function makeYW(y) {
    const m = MOB_DB[y.type], lv = y.lv;
    const hp0 = Math.round(HP(lv) * (y.adds ? .78 : 1));
    const e = { name: y.ep + ' · ' + y.name + ' Lv' + lv, key: m.key, hp: hp0, maxhp: hp0, atk: ATK(lv), def: DEF(lv), spd: SPD[y.id], h: m.h, atkType: m.atkType === 'charge' || m.atkType === 'arrow' ? 'claw' : m.atkType /* 「冲撞 / 射箭」那层出手不走妖王的打法，换成爪击 */, color: '#a33', fxColor: m.fxColor, boss: true, lv, slot: [330, 590],
      _yw: y, _id: y.id, _ep: y.ep, _atk0: ATK(lv), _def0: DEF(lv), turn: 0, _type: y.type };
    e.ai = async (en, b) => { en.turn++;
      if (en._break) { en._break--; if (en._break >= 1) { floatText(en.x, en.y - en.h - 40, '喘息……', '#ffe27a', 38); await sleep(700); return true; } }
      try { return await AI[y.id](en, b); } catch (err) { console.warn('R370 ai', err); return false; } };
    return e; }
  window.R370_MAKE = makeYW;
  // 破绽：妖王力竭时受到的伤害 +50%
  dmgCalc = (orig => function (att, def, mult = 1, critRate) { try { if (def && def._yw && def._break > 0 && att && att.side !== 'enemy') mult *= 1.5; } catch (e) {} return orig.call(this, att, def, mult, critRate); })(dmgCalc);
  // 妖王战里登记一下，方便画名牌；小怪出场的尺寸沿用 battle_scale
  let FIGHT = null;
  async function fight(y) {
    const boss = makeYW(y), ens = [boss];
    for (const [i, t] of (y.adds || []).entries()) { const m = makeEnemy(t, Math.max(0, y.lv - 8) * .5); if (y.addName) { m.name = y.addName; m.hp = m.maxhp = Math.round(m.maxhp * 1.3); m._flower = 1; } m.name += ' Lv' + (y.lv - 2); m.lv = y.lv - 2; m._add = y.id; m._type = t; m.slot = [[560, 690], [540, 440]][i]; ens.push(m); }
    const exp = Math.round(expNeed(y.lv) * .55), gold = 300 + (y.lv - 10) * 120;
    FIGHT = { y, boss };
    world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    try { playSnd('sfx_claw', .7); } catch (e) {} S.flash = .6; S.flashColor = '#ff3a1a'; await sleep(150); await fadeOut(220);
    if (!F().r370_tut) { F().r370_tut = 1; S.fade = 0; try { await showPanel('妖王讨伐 · 打法', ['妖王蓄力时，屏幕下方会出红色警示——那一回合全队选「防御」。', '它放完大招会力竭，名牌上亮出「破绽」：这时打它，伤害多五成。', '!左下角的法宝，每场能祭出一次。']); } catch (e) {} }
    const pr = startBattle({ title: '妖王讨伐 · ' + y.ep + ' ' + y.name, bg: y.bg, enemies: ens, exp, gold, boss: true, flee: false, yw: y.id });
    try { if (battle) { let ai = 0; for (const u of battle.enemies) { if (u._yw) { u._scale = y.scale; battle._yw = u; u.x = 290; u.y = 610; } else { const sl = [[570, 665], [545, 470], [440, 560]][ai++] || [600, 560]; u.x = sl[0]; u.y = sl[1]; } } } } catch (e) {}   // 妖王站左边靠后，小怪站它身前，别叠在一起
    await fadeIn(240); const win = await pr; FIGHT = null;
    S.scene = drawMap;
    if (win === true) { F()['yw_' + y.id] = 1; await reward(y); }
    else { partyRevive(.3); const p = world.player, M = TMAPS[y.map]; if (p) { p.y += 150; } toast('败下阵来……' + y.ep + '没有追。养好伤、备足丹药再来', 3000); }
    world.locked = false; return win === true; }
  async function reward(y) {
    await sleep(300); banner('妖王伏诛'); try { playSnd('jingle_win', .6); } catch (e) {} await sleep(1700);
    const give = (y.fabao ? [[y.fabao, 1]] : []).concat([['m_neidan', 1]]); const cnt = {}; for (const id of y.extra || []) cnt[id] = (cnt[id] || 0) + 1; for (const id in cnt) give.push([id, cnt[id]]);
    for (const [id, n] of give) { if (ITEM_DB[id].fabao) fbOwn()[id] = 1; else addItem(id, n); }
    const xs = 40 + (y.lv - 10) * 6; S.hero.xs = (S.hero.xs || 0) + xs;   // 悬赏点（R298 那套：去典籍阁换剑谱、玉简）
    if (!fb().on && y.fabao) fb().on = y.fabao;
    if (window.itemGet) await itemGet(give.map(([id, n]) => ({ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×' + n, desc: ITEM_DB[id].desc })).concat(ITEM_DB.k_xs ? [{ icon: 'item:k_xs', name: '悬赏点', count: '+' + xs, desc: '讨伐榜的赏格。去天剑集市 · 典籍阁换剑谱、玉简' }] : []), '讨伐 ' + y.ep + ' · ' + y.name);
    if (y.fabao) await say('星旋', '「' + ITEM_DB[y.fabao].name + '」——这东西归本姑娘祭炼了。打架的时候点左下角的法宝，一场能用一回。');
    else { await say('星旋', '榜上的、榜外的，都清干净了。……行吧，本姑娘承认，你有点本事。'); toast('讨伐榜内外，再无妖王', 3200); return; }
    const left = YW.filter(q => !q.hidden && !ywDone(q)).length;
    if (left) toast('讨伐榜上还剩 ' + left + ' 只妖王', 3200);
    else { await say('星旋', '五颗内丹凑在一处，玉佩在发烫……天剑山下山的那条路上，还压着一只老东西。榜上没有它。'); toast('讨伐榜上的五只妖王，全数伏诛。——天剑山 · 下山路深处，似乎还有动静', 4200); } }
  window.R370_FIGHT = id => fight(YW.find(y => y.id === id));

  // ---------- ④ 法宝 ----------
  const fb = () => { const h = S.hero; return h.fabao || (h.fabao = { own: {}, on: null }); };
  const fbOwn = () => fb().own;
  // 法宝越用越顺手（Gemini 的主意，照仙剑三仙术练级）：祭出满 4 回「小成」、满 10 回「大成」，效果各涨一档
  const fbRank = id => { const n = (fb().use || {})[id] || 0; return n >= 10 ? 2 : n >= 4 ? 1 : 0; };
  const RANK_CN = ['初炼', '小成', '大成'];
  window.R370_FB_RANK = id => { const n = (fb().use || {})[id] || 0, r = fbRank(id); return { n, r, name: RANK_CN[r], next: r === 0 ? 4 - n : r === 1 ? 10 - n : 0 }; };
  window.R370_FB = { state: fb, give: id => { fbOwn()[id] = 1; if (!fb().on) fb().on = id; }, list: () => Object.keys(NEW).filter(id => NEW[id].fabao) };
  async function useFabao(b) {
    const id = fb().on, it = ITEM_DB[id]; if (!id || !it || b._fbUsed) return;
    const act = b.active && b.active.side === 'hero' ? b.active : b.P; b._fbUsed = 1; b.state = 'act'; b.menu = null;
    const rk0 = fbRank(id); fb().use = fb().use || {}; fb().use[id] = (fb().use[id] || 0) + 1; const rk = fbRank(id), K = [1, 1.2, 1.4][rk0];
    big(it.name, '#ffe9a0', 72); try { playSnd('sfx_charge'); } catch (e) {} await dimTo(.5, 220);
    try { fx('fx3_orb_violet', { life: .8, layer: 2, x: act.x, y: act.y - act.h * .9, scale: k => .3 + k * .8, alpha: 1.3 }); } catch (e) {} await sleep(650);
    const es = aliveEnemies(), hs = heroes(b), tgt = es.find(e => e._charge) || es.find(e => e._yw) || es.slice().sort((a, c) => c.hp - a.hp)[0];
    if (id === 'fb_huxin') { for (const P of hs) { P.buffs.shield = Math.max(P.buffs.shield || 0, 2 + rk0); floatText(P.x, P.y - P.h - 20, '护心', '#ffe9a0', 36); } }
    else if (id === 'fb_hanshan' && tgt) { try { fx('fx3_burst_earth', { x: tgt.x, y: tgt.y - tgt.h * .5, scale: 1.3 }); } catch (e) {} const { d, crit } = dmgCalc(act, tgt, 2.4 * K, 0); applyDamage(tgt, d, crit); S.shake = 18;
      if (tgt.alive && tgt._charge) { tgt._charge = null; tgt._break = 2; tgt._pojiT = performance.now() / 1000; floatText(tgt.x, tgt.y - tgt.h - 130, '打断！', '#ffe27a', 46, 1.6, BRUSH); } }
    else if (id === 'fb_xiaoyue') { for (const P of hs) { P.gauge = 100; if (rk0) P.mp = Math.min(P.maxmp, P.mp + 12 * rk0); floatText(P.x, P.y - P.h - 20, '疾', '#8fd8ff', 40); } }
    else if (id === 'fb_lihuo') { for (const e of es) { try { fx('fx3_burst_red', { x: e.x, y: e.y - e.h * .5, scale: 1.2 }); } catch (e2) {} const { d, crit } = dmgCalc(act, e, 1.4 * K, 0); applyDamage(e, d, crit); if (e.alive) { e.buffs = e.buffs || {}; e.buffs.burn = 3 + rk0; } } S.shake = 14; }
    else if (id === 'fb_fuyao' && tgt) { tgt.gauge = (tgt._yw || tgt.boss ? -110 : -260) * K; if (tgt._charge) { tgt._charge = null; } floatText(tgt.x, tgt.y - tgt.h - 40, '缚！', '#ffe27a', 50, 1.4, BRUSH); try { fx('fx3_slash_gold', { x: tgt.x, y: tgt.y - tgt.h * .5, scale: 1.1 }); } catch (e) {} }
    else if (id === 'fb_huichun') { for (const P of hs) { const h = Math.round(P.maxhp * (.4 + .1 * rk0)); P.hp = Math.min(P.maxhp, P.hp + h); P._burn = 0; if (P.gauge < 0) P.gauge = 0; floatText(P.x, P.y - P.h * .7, '+' + h, '#7dff8a', 46); try { fx('fx3_burst_green', { x: P.x, y: P.y - P.h * .5, scale: .9 }); } catch (e) {} } try { playSnd('sfx_heal'); } catch (e) {} }
    await sleep(600); await dimTo(0, 220); if (act !== b.P || true) act.gauge = Math.max(act.gauge, id === 'fb_xiaoyue' ? 100 : 0);
    if (rk > rk0) setTimeout(() => toast('「' + it.name + '」祭炼' + RANK_CN[rk] + '——往后祭出，效果更强', 3000), 800);
    await afterAct(); }

  // ---------- 画：地图上的妖王、战斗里的名牌 / 警示 / 法宝钮、横幅 ----------
  const ART = {}; const art = (n, dir = 'r372') => { let o = ART[n]; if (!o) { o = ART[n] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.onerror = () => { o.bad = true; }; o.im.src = dir + '/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
  window.R370_ART = art;
  let BAN = null; const banner = t => { BAN = { t, t0: performance.now() }; };
  // 地图上的妖王本体：有即梦序列帧的（猪王、狼将、妖豹、蛛后）直接放待机那几帧；别的走原来的立绘 / 骨骼。图没到就先只画红光和名牌，不画占位人形
  const LIM = {};
  function lairSprite(m, x, yy, H, faceRight, t) {
    const V = window.VSPRITES && VSPRITES[m.key];
    if (V) { let im = LIM[V.id]; if (!im) { im = LIM[V.id] = new Image(); im.src = 'rig/' + V.id + '.webp'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} } if (!im.complete || !im.naturalWidth) return false;
      const mt = V.meta, L = mt.idleEnd + 1, k = Math.floor(t * 8) % (L * 2 - 2 || 1), f = k < L ? k : L * 2 - 2 - k, sc = H / mt.fh, sx = (f % mt.cols) * mt.fw, sy = Math.floor(f / mt.cols) * mt.fh;
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, yy, H * .34, H * .07, 0, 0, 7); ctx.fill(); ctx.translate(x, yy); if (faceRight) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im, sx, sy, mt.fw, mt.fh, -mt.footX * sc, -mt.footY * sc, mt.fw * sc, mt.fh * sc); ctx.restore(); return true; }
    if (typeof IMG !== 'undefined' && !IMG[m.key] && !(window.RIG_MAP && RIG_MAP[m.key])) return false;
    drawSprite(m.key, x, yy, H, faceRight, 1, '#a33', ''); return true; }
  // 妖王现身的条件：① 看过据点的讨伐榜（没看过榜的玩家，这些图和原来一模一样，主线剧情画面里不会多出一只妖王）；② 主角等级 ≥ 妖王等级 − 4（和榜上贴出悬赏的条件一样）
  const hereYW = () => F().r370_fb0 ? YW.find(y => y.map === world.mapName && !ywDone(y) && (!y.hidden || allFive()) && ((S.hero && S.hero.lv) || 1) >= y.lv - 4) : undefined;
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function (T, cam, now) { orig && orig(T, cam, now);
    try { const y = hereYW(); if (!y || battle) return; const [x, yy] = y.pos, m = MOB_DB[y.type], t = performance.now() / 1000;
      ctx.save(); let g = ctx.createRadialGradient(x, yy, 6, x, yy, 150); g.addColorStop(0, 'rgba(255,60,30,.42)'); g.addColorStop(.6, 'rgba(255,60,30,.14)'); g.addColorStop(1, 'rgba(255,60,30,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, yy, 150, 52, 0, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const k = (t * .5 + i / 9) % 1, sx = x + Math.sin(i * 5.1 + t) * (40 + k * 60), sy = yy - 10 - k * 190; ctx.fillStyle = `rgba(255,${120 + i * 8},60,${(1 - k) * .8})`; ctx.beginPath(); ctx.arc(sx, sy, 3.2 * (1 - k) + .6, 0, 7); ctx.fill(); } ctx.restore();
      const p = world.player, flip = p ? p.x > x : false;
      lairSprite(m, x, yy, y.mh, flip, t);
      const mk = art('yw_mark'), np = art('yw_nameplate'), top = yy - y.mh - 34 + Math.sin(t * 2) * 3;
      ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (np) ctx.drawImage(np, x - 110, top - 22, 220, 44); if (mk) ctx.drawImage(mk, x - 32, top - 78, 64, 64);
      ctx.font = `700 19px ${FONT}`; textOutline('妖王 · ' + y.ep + '　Lv' + y.lv, x, top, '#ffd9a0', '#3a0800', 5); ctx.restore();
    } catch (e) {} })(tileAmbientHigh);
  // 走近妖王：先问打不打
  let ASK = 0;
  if (typeof tileMobs === 'function') tileMobs = (orig => function (dt, T, free) { const r = orig.apply(this, arguments);
    try { const y = hereYW(), p = world.player; if (!y || !p || battle) return r; const d = Math.hypot(p.x - y.pos[0], p.y - y.pos[1]);
      // 小怪别挤到妖王身上
      for (const a of world.mobs || []) if (Math.hypot(a.x - y.pos[0], a.y - y.pos[1]) < 220) { a.tx = a.home[0]; a.ty = a.home[1]; if (Math.hypot(a.home[0] - y.pos[0], a.home[1] - y.pos[1]) < 260) { a.hidden = true; } }
      if (d > 230) ASK = 0;
      if (free && !world.locked && !dialog && !choice && d < 120 && !ASK) { ASK = 1; world.locked = true; world.path = null; p.moving = false;
        (async () => { try { const lv = S.hero.lv, hint = lv + 2 < y.lv ? '（它比你高 ' + (y.lv - lv) + ' 级，很险）' : lv >= y.lv + 3 ? '（你已高它不少）' : '';
          const c = await choose('妖王 · ' + y.ep + ' ' + y.name + '　Lv' + y.lv + hint, ['讨伐', '先不打']); if (c === 0) { if (y.cry) await say(y.ep + ' · ' + y.name, y.cry); await fight(y); } } finally { world.locked = false; } })(); }
    } catch (e) {} return r; })(tileMobs);
  window.R370_HERE = hereYW;
  // 野外多几只宝箱（仙剑的老规矩：岔路走到头总有点东西）——放在各图离入口远的角落，里面是新装备和材料
  try { const P2 = (x, y) => [x / 64 - .5, y / 64 - .8]; const BOX = { xt_road: [[1728, 1536, [['c_ningshen', 1], ['gold', 150]]]], lin_forest: [[2496, 704, [['s_buyun', 1], ['m_hide', 2]]]], hf_valley: [[1728, 1536, [['m_yanjing', 2], ['x_anxi', 2]]]],
      m_yy_tiger: [[256, 1600, [['s_zhuifeng', 1], ['m_silk', 2]]]], m_yy_verge: [[2336, 1152, [['a_tiancan', 1], ['gold', 300]]]] };
    for (const m in BOX) { const M = TMAPS[m]; if (!M) continue; M.chests = M.chests || []; for (const [x, y, items] of BOX[m]) { const [c, r] = P2(x, y); if (!M.chests.some(q => q._r370 && q.c === c && q.r === r)) M.chests.push({ c, r, items, _r370: 1 }); } } } catch (e) {}
  // 图鉴：每种妖兽的介绍后面写上会掉什么
  try { if (window.BESTIARY) { for (const c of BESTIARY.CAT) { const d = DROPS[c[2]]; if (d && d.length && !/掉落：/.test(c[4])) c[4] += '　掉落：' + d.map(([id]) => ITEM_DB[id].name).join('、') + '。'; } } } catch (e) {}

  // 战斗里：妖王放大一些；顶上的名牌长血条、蓄力警示、法宝钮
  if (typeof drawUnit === 'function') drawUnit = (orig => function (u) { if (u && u._scale && u.alive) { const ax = u.x + (u.ox || 0), ay = u.y + (u.oy || 0), nm = u.name; ctx.save(); ctx.translate(ax, ay); ctx.scale(u._scale, u._scale); ctx.translate(-ax, -ay); u.name = ''; u._noBar = 1; try { return orig.apply(this, arguments); } finally { u.name = nm; u._noBar = 0; ctx.restore(); } } return orig.apply(this, arguments); })(drawUnit);
  // 妖王头顶不画小血条（顶上有长血条）
  { const H0 = window.R169_HPBAR; window.R169_HPBAR = function (u) { if (u && u._noBar) return true; return H0 ? H0.apply(this, arguments) : false; }; }
  const FBR = { x: 44, y: 520, w: 110, h: 110 };
  const fbReady = b => b && b.state === 'menu' && !b._fbUsed && fb().on && !dialog && !sysPanel && !(b.menu && b.menu.sub);
  const layer = { t: 0, draw() { try {
    const b = typeof battle !== 'undefined' && battle, now = performance.now() / 1000;
    if (b && b.state !== 'end') {
      const e = b._yw;
      if (e && e.alive) { const pl = art('boss_plate'), sc = .78, x0 = 452, y0 = 148; ctx.save();
        const k = Math.max(0, e.hp / e.maxhp), brk = e._break > 0; e._hpShow = e._hpShow == null ? k : e._hpShow + (k - e._hpShow) * .12;
        if (pl) { ctx.translate(x0, y0); ctx.scale(sc, sc); const f = art(brk ? 'boss_bar_fill_break' : 'boss_bar_fill');
          ctx.fillStyle = 'rgba(20,6,4,.78)'; ctx.fillRect(124, 60, 520, 22);
          ctx.fillStyle = 'rgba(255,230,160,.55)'; ctx.fillRect(124, 60, 520 * Math.max(k, e._hpShow), 22);
          if (f) ctx.drawImage(f, 0, 0, f.width * k, f.height, 124, 60, 520 * k, 22); else { ctx.fillStyle = brk ? '#b06aff' : '#c8281e'; ctx.fillRect(124, 60, 520 * k, 22); }
          ctx.drawImage(pl, 0, 0, 680, 96);
          ctx.font = `700 24px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(e._ep + ' · ' + e._yw.name, 145 + 477 / 2, 28, '#ffe9c0', '#2a0a00', 5);
          ctx.textAlign = 'right'; ctx.font = `600 17px ${FONT}`; textOutline(brk ? '破绽' : 'Lv' + e.lv, 145 + 470, 29, brk ? '#e6c2ff' : '#ffd9a0', '#2a0a00', 4); }
        else { const bx = 380, by = 174, bw = 520; ctx.fillStyle = 'rgba(20,8,4,.82)'; roundRect(bx - 10, by - 30, bw + 20, 54, 10); ctx.fill(); ctx.strokeStyle = '#c9a25a'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#2a0a06'; ctx.fillRect(bx, by, bw, 14); ctx.fillStyle = brk ? '#b06aff' : '#d2362a'; ctx.fillRect(bx, by, bw * k, 14);
          ctx.font = `700 20px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; textOutline('妖王 · ' + e._ep + ' ' + e._yw.name, bx, by - 14, '#ffe9c0', '#2a0a00', 4); }
        ctx.restore();
        if (e._charge) { const ws = art('warn_strip'), a = .78 + Math.sin(now * 8) * .22; ctx.save(); ctx.globalAlpha = a; if (ws) ctx.drawImage(ws, 360, 596, 560, 64); else { ctx.fillStyle = 'rgba(40,0,0,.85)'; roundRect(360, 602, 560, 50, 8); ctx.fill(); }
          ctx.globalAlpha = 1; ctx.font = `700 19px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; let t = e._charge; while (ctx.measureText(t).width > 410 && t.length > 6) t = t.slice(0, -1); textOutline(t, 640, 628, '#ffe0c0', '#3a0000', 5); ctx.restore(); }
        if (e._pojiT) { const dt = now - e._pojiT, pj = art('poji'); if (dt > 1.5) e._pojiT = 0; else if (pj) { const a = Math.min(1, dt / .12) * Math.min(1, (1.5 - dt) / .35), s2 = 1 + Math.max(0, .2 - dt) * 3; ctx.save(); ctx.globalAlpha = a; ctx.translate(e.x + 40, e.y - e.h * 1.05); ctx.scale(s2, s2); ctx.drawImage(pj, -110, -110, 220, 220); ctx.restore(); } } }
      // 法宝钮
      const id = fb().on; if (id && ITEM_DB[id] && (b.state === 'menu' || b._fbUsed)) { const used = !!b._fbUsed, im = art(used ? 'fabao_btn_used' : 'fabao_btn_ready'), cx = FBR.x + 55, cy = FBR.y + 55; ctx.save(); if (used) ctx.globalAlpha = .55;
        if (im) ctx.drawImage(im, FBR.x, FBR.y, 110, 110); else if (!used) { const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 62 + Math.sin(now * 4) * 4); g.addColorStop(0, 'rgba(255,220,120,.55)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 66, 0, 7); ctx.fill(); }
        try { itemIcon(id, cx, cy, 36); } catch (e2) {}
        ctx.font = `700 18px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(used ? '已祭出' : '法宝', cx, FBR.y + 118, used ? '#bbb' : '#ffe9a0', '#2a1000', 4); ctx.restore(); }
    }
    if (BAN) { const dt = (performance.now() - BAN.t0) / 1000; if (dt > 2.2) BAN = null; else { const a = Math.min(1, dt / .25) * Math.min(1, (2.2 - dt) / .4), im = art('fuzhu'); ctx.save(); ctx.globalAlpha = a; const s = 1 + Math.max(0, .25 - dt) * 1.6;
        if (im && BAN.t === '妖王伏诛') { ctx.translate(640, 300); ctx.scale(s, s); ctx.drawImage(im, -410, -120, 820, 240); } else { ctx.font = `120px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.translate(640, 300); ctx.scale(s, s); textOutline(BAN.t, 0, 0, '#ffe08a', '#3a0f00', 12); } ctx.restore(); } }
  } catch (e) {} } };
  S.overlay.push(layer);
  try { cv.addEventListener('pointerdown', ev => { const b = typeof battle !== 'undefined' && battle; if (!fbReady(b)) return; const p = toLogical(ev); if (p.x < FBR.x - 8 || p.x > FBR.x + FBR.w + 8 || p.y < FBR.y - 8 || p.y > FBR.y + FBR.h + 30) return;
    ev.stopImmediatePropagation(); ev.preventDefault(); try { input.tapped = null; } catch (e) {} useFabao(b).catch(e => console.warn('R370 fabao', e)); }, true); } catch (e) {}
  window.R370_USE = () => battle && useFabao(battle);
})();
