// ================= R230 · 房间里能翻的东西（作者 11-12：「房间里可以增加隐藏道具作为探案线索……隐藏在衣柜里，点击就可以掉落或者拾取到」）=================
// 衣柜、行李架、书桌、博古架、酒架……走到跟前点一下就能翻。翻出来的分三种：
//   ① 和案子有关的旁证（案子在办的时候记进证词本，不是破案必需——主线索还是原来那几处，玩家不翻也不会卡）；
//   ② 小东西（回春丹、几枚灵石），每处只能拿一次；③ 只是一段描写，让屋子有人住过的感觉。
// 只进测试版。位置跟着家具走（按家具 id 找），以后换布局不用改坐标。
(function () {
  if (typeof TMAPS === 'undefined' || typeof say !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const act = q => { const s = (F().sq || {})[q]; return !!s && s.s === 1; };
  const note = (key, t) => { const f = F(); f[key] = f[key] || []; if (!f[key].includes(t)) { f[key].push(t); try { playSnd('ui_confirm'); } catch (e) {} if (typeof toast === 'function') toast('记入证词本：' + t, 2600); } };
  const gold = async (n, title) => { S.hero.gold = (S.hero.gold || 0) + n; if (window.itemGet) await itemGet([{ icon: 'gold', name: '灵石', count: '×' + n }], title); else if (typeof toast === 'function') toast('灵石 +' + n, 2000); };
  const pill = async title => { try { addItem('p_small', 1); } catch (e) {} if (window.itemGet) await itemGet([{ icon: 'item:p_small', id: 'p_small', name: '回春丹', count: '×1', desc: (ITEM_DB.p_small || {}).desc || '' }], title); else if (typeof toast === 'function') toast('获得：回春丹', 2000); };
  const give = async (id, title) => { try { addItem(id, 1); } catch (e) {} const d = ITEM_DB[id] || {}; if (window.itemGet) await itemGet([{ icon: 'item:' + id, id, name: d.name || id, count: '×1', desc: d.desc || '' }], title); else if (typeof toast === 'function') toast('获得：' + (d.name || id), 2000); };
  // 叶孤星还没有的辅助 / 秘传技能书里挑一本（没有可挑的就给一册剑诀卷二）
  const heroBook = () => { try { const bag = S.hero.bag || {}, sk = S.hero.skills || []; for (const id in ITEM_DB) { const d = ITEM_DB[id]; if (d.sk4 && d.sk4.who === 'hero' && !bag[id] && !sk.includes(d.sk4.id)) return id; } } catch (e) {} return 'juan2'; };
  const YE = '叶孤星', XX = '星旋';
  // [地图, 家具 id（按出现顺序第几个，默认 0）, 名字, 翻的时候发生什么（返回 true = 这处翻完了，下次只给一句话）, 翻完以后那句话, 往下偏多少站位]
  const T = [
    // —— 云来客栈 · 天字三号房 ——
    ['xt_inn_room3', 'wardrobe', '衣柜', async () => { await L([['', '衣柜里只挂着两件换洗的衣裳，柜底干干净净，连一道箱角的压痕都没有。']]);
      if (act('xt_room3')) { await say(XX, '（半人高的药箱要是在这屋里放过，不搁地上就得搁柜里。两头都没印子。）'); note('xr_notes', '衣柜柜底没有箱子的压痕'); } return true; }, '衣柜里只有两件换洗的衣裳。'],
    ['xt_inn_room3', 'luggage_stand_3', '行李架上的包袱', async () => { await L([['', '包袱里是几件旧衣，和一本翻得卷了边的账册。'], ['', '账册最后一页，墨迹还新：「收丹霞堂定金三百。还利通号旧债九百。余：无。」']]);
      if (act('xt_room3')) { await say(YE, '（定金早就花出去了。）'); note('xr_notes', '钱满仓的账册：定金已拿去还了旧债'); } return true; }, '包袱已经照原样系好了。'],
    ['xt_inn_room3', 'writing_desk_set_2', '窗下的书桌', async () => { await L([['', '桌上摊着一本《玄天城行商律例》。有一页折了角——「店失客物，店赔七成」。']]);
      if (act('xt_room3')) { await say(XX, '（出门做生意带本律例不稀奇。可偏偏折在这一页。）'); note('xr_notes', '书桌上的律例折在「店赔七成」那一页'); } return true; }, '那本律例还摊在折角的那一页。'],
    ['xt_inn_room3', 'bedside', '床头柜', async () => { await say('', '抽屉缝里卡着几枚灵石，像是哪位住客落下的。'); await gold(30, '床头柜的抽屉'); return true; }, '抽屉里空了。'],
    // —— 云来客栈 · 大堂 ——
    ['xt_inn_hall', 'cabinet', '柜台后的立柜', async () => { await L([['', '柜里是客栈的登记簿。翻到前天：「天字三号 · 钱满仓 · 行商 · 随身小藤箱一只」。']]);
      if (act('xt_room3')) note('xr_notes', '登记簿：钱满仓入住时只登记了一只小藤箱'); return true; }, '登记簿放回了原处。'],
    // —— 万宝楼 · 鉴宝雅间 ——
    ['xt_wanbao_vip', 'antique_display_1', '博古架', async () => { await L([['', '博古架底层的瓷瓶后面，压着一张叠成小方块的纸。'], ['', '是玄兵阁的收据：「仿霜河形制长剑一口，定金二十两」。落款的字，一个有铜钱那么大。']]);
      if (act('xt_fake')) { await say(XX, '（字写这么大的人，眼神可不大好。）'); note('xw_notes', '雅间博古架下压着玄兵阁的仿剑收据，落款字极大'); } return true; }, '收据已经放回瓷瓶后面了。'],
    ['xt_wanbao_vip', 'screen', '屏风后面', async () => { await say('', '屏风后头摆着一只矮几，茶还是温的。坐在这儿一抬头，正对着北墙那一排旧剑。'); return true; }, '矮几上的茶凉了。'],
    ['xt_wanbao_vip', 'side_cabinet', '边柜', async () => { await say('', '边柜里是鉴定用的零碎。最里头有一只小瓷瓶，瓶身贴着「待客」。'); await pill('边柜里的小瓷瓶'); return true; }, '边柜里只剩些鉴定用的零碎。'],
    // —— 倚翠楼 ——
    ['qy_yicui_2f', 'music_shelf', '乐谱架', async () => { await say('', '架上的琴谱都是新的，只有最上一格那本手抄的翻得起了毛边。封皮上两个字：《归舟》。'); return true; }, '《归舟》还在最上一格。'],
    ['qy_yicui_2f', 'vanity', '妆台', async () => { await say('', '妆匣里没有胭脂，只有一叠庙会的灯谜笺，叠得整整齐齐。数了数，十张——一年一张。'); return true; }, '那十张灯谜笺还在妆匣里。'],
    ['qy_yicui', 'plain_cabinet', '素柜', async () => { await say('', '柜里是待客的茶叶罐。罐子后面滚出一粒丹药，不知是哪位客人掉的。'); await pill('琴堂的素柜'); return true; }, '柜里只有茶叶罐。'],
    ['qy_yicui', 'instrument_rack', '乐器架', async () => { await say('', '琵琶、洞箫、笛子，都擦得发亮。只有最边上那支短箫落了灰，像是很久没人碰过。'); return true; }, '那支短箫还落着灰。'],
    // —— 装备 / 宝物 / 技能书（作者 11-12 晚：「不只是线索，装备、宝物、技能书都可以通过这种方式，鼓励玩家去探索」——线索混在里面，玩家翻到线索也以为只是件隐藏道具）——
    ['xt_inn_room3', 'bed_footstool_1', '床前的脚踏', async () => { await L([['', '脚踏底下滚着一枚玉坠，绳子断了，落了一层灰。看样子不是这一位住客的——不知在这儿躺了多久。']]); await give('c_jade', '脚踏底下的玉坠'); return true; }, '脚踏底下空了。'],
    ['xt_inn_hall', 'wall_bench_14', '墙边的长凳', async () => { await L([['', '长凳底下塞着一卷旧皮子。抖开一看，是件兽皮软甲，胸口补过两回。'], ['云来客栈伙计', '那个啊？去年一位镖师抵的酒钱，掌柜的嫌占地方。客官用得上就拿去。']]); await give('a_leather', '长凳底下的旧软甲'); return true; }, '长凳底下只剩灰了。'],
    ['xt_wanbao_vip', 'guest_low_tea_table_2', '客座的矮几', async () => { const id = heroBook(); await L([['', '矮几下层垫着一册旧书，书脊都压弯了——看来是拿来垫桌脚的。'], [XX, '（等等，小子。翻开看看。……拿剑谱垫桌脚，这万宝楼的眼力也就这样。）']]); await give(id, '垫桌脚的旧书'); return true; }, '矮几下面换了块木片垫着。'],
    ['qy_changle_2f', 'ledger_bookcase', '账本书柜', async () => { await L([['', '一排排账本中间，夹着一册不一样的。封皮上写着「抵 · 三十两」。'], ['', '翻开，是一册剑诀。不知是哪个输光了的剑修押在这儿的。']]); await give('juan2', '夹在账本里的剑诀'); return true; }, '那一格空出了一册书的位置。'],
    ['qy_yicui', 'flower_console', '花几', async () => { await say('', '花瓶底下压着一只小锦囊，里头是几枚灵石和一张字条：「琴听得好，赏。——过路人」。看来是哪位客人留给琴师的，没人发现。'); await gold(40, '花瓶下的锦囊'); return true; }, '花瓶下面空了。'],
    // —— 长乐坊 ——
    ['qy_changle', 'wine_rack', '酒架', async () => { await L([['', '最里头那一坛，封泥是新的。掀开一看——坛里不是酒，是半坛骰子。'], ['', '拣一颗掂了掂，沉得不对。骰子里灌了铅。'], [XX, '（十赌九输，剩下那一成是庄家自己。）']]);
      await gold(60, '坛底压着的灵石'); return true; }, '那坛灌铅的骰子还在老地方。'],
    ['qy_changle', 'chip_counter', '兑筹柜台', async () => { await say('', '柜台底下钉着一块小木牌：「筹码离柜，概不退换」。木牌边上，被人用指甲刻了一行小字：「还我棺材本」。'); return true; }, '那行指甲刻的小字还在。'],
  ];
  // 作者 11-12 晚：「不亮一遍，让玩家自己找；靠近了有查找，但也可能什么都没有」——这些地方能翻，翻了是空的
  const EMPTY = [
    ['xt_inn_room3', 'clothes_rack', '衣架', '衣架上搭着一件外袍，口袋里空空的。'], ['xt_inn_room3', 'washstand', '脸盆架', '盆里的水早凉了。架子上下都看过，什么也没有。'], ['xt_inn_room3', 'bed', '床铺', '掀开被褥看了看，只有一股晒过的棉花味。'],
    ['xt_inn_hall', 'counter', '柜台', '柜台上是算盘和茶壶。掌柜的看了你一眼，你把手收了回来。'], ['xt_inn_hall', 'menu_board_13', '菜牌', '清蒸鱼、时蔬、茶水。牌子后面什么也没藏。'], ['xt_inn_hall', 'wall_bench_right_15', '墙边的长凳', '凳子底下只有一只不知谁落下的草鞋。'],
    ['xt_wanbao_vip', 'floor_lamp_3', '落地灯', '灯座是实心的，没有夹层。'], ['xt_wanbao_vip', 'appraiser_chair', '圈椅', '椅垫底下干干净净。'],
    ['qy_yicui', 'tea_station', '茶水柜', '茶壶、茶罐、一摞干净的杯子。没有别的。'], ['qy_yicui', 'incense_burner', '香炉', '炉里只有香灰，还是温的。'],
    ['qy_yicui_2f', 'cloak_rack', '披风架', '披风叠得很整齐，口袋里什么也没有。'], ['qy_yicui_2f', 'folding_screen', '屏风后面', '屏风后面只有一只空花架。'], ['qy_yicui_2f', 'tea_round', '小茶几', '两只绣墩，一壶凉茶。'],
    ['qy_changle', 'wine_table', '酒桌', '酒壶是空的，碟子里剩几粒花生。'], ['qy_changle', 'wall_bench', '靠墙的长凳', '凳面上刻满了正字，不知是谁在记输赢。凳子底下什么也没有。'], ['qy_changle', 'brazier', '火盆', '拨了拨炭灰，只有炭灰。'],
    ['qy_changle_2f', 'window_tea_console', '窗下的茶案', '茶案的抽屉拉开，里头是空的，连张纸都没有。'], ['qy_changle_2f', 'dwarf_pine', '矮松盆景', '盆土是实的，没埋东西。'], ['qy_changle_2f', 'guest_low_tea_table', '客座矮几', '矮几下面空空的。'],
  ];
  for (const [map, oid, name, line] of EMPTY) T.push([map, oid, name, async () => { await say('', line); return true; }, line]);
  const done = k => !!(F().srch || {})[k];
  for (const [map, oid, name, fn, after] of T) {
    const M = TMAPS[map]; if (!M || !M.baked) { console.warn('R230 没有地图', map); continue; }
    const o = (M.baked.objs || []).find(o => o.id === oid); if (!o) { console.warn('R230 找不到家具', map, oid); continue; }
    const key = map + ':' + oid, [c, r] = P(o.x + o.w / 2, o.sy + 34);
    (M.npcs = M.npcs || []).push({ key: 'none', c, r, name, hidden: true, h: 110, r230: key, talk: async () => {
      if (done(key)) { await say('', '已经翻过了。'); return; }
      let ok = false; try { ok = await fn(); } catch (e) { console.warn('R230', key, e); }
      if (ok) { const f = F(); (f.srch = f.srch || {})[key] = 1; } } });
  }
  // 提示（作者 11-12 晚定）：电脑——鼠标移到能翻 / 能对话的东西上变小手；手机——走近了头顶冒一只小手；
  // 不做「一键全亮」：让玩家自己找（作者 11-12 晚定）。小手只说明「这里能翻」，不保证有东西——有的地方翻了是空的。
  let reveal = 0;
  const spots = () => (world.actors || []).filter(a => a.npc && a.npc.r230);   // 作者 11-12 晚：翻过的地方小手照样出现，再翻只说「已经翻过了」
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function () { const r = orig.apply(this, arguments);
    try { const t = performance.now() / 1000, p = world.player, rv = false;
      for (const a of spots()) { const near = Math.hypot(a.x - p.x, a.y - p.y) < 170; if (!near && !rv) continue;
        const bob = Math.sin(t * 3 + a.x * .01) * 3, x = a.x, y = a.y - 96 + bob; ctx.save();
        if (rv) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(a.x, a.y - 58, 0, a.x, a.y - 58, 46); g.addColorStop(0, 'rgba(255,236,170,.55)'); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(a.x, a.y - 58, 46, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
        ctx.fillStyle = 'rgba(40,26,10,.82)'; ctx.strokeStyle = '#e8c878'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.fill(); ctx.stroke();
        ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9b0'; ctx.fillText('☝', x, y + 1); ctx.restore(); } } catch (e) {}
    return r; })(tileAmbientHigh);
  try { const cv = document.querySelector('canvas');
    cv.addEventListener('mousemove', e => { try { if (S.scene !== drawMap || world.locked || dialog || choice || S.menu) { cv.style.cursor = ''; return; }
      const b = cv.getBoundingClientRect(), lx = (e.clientX - b.left) * W / b.width, ly = (e.clientY - b.top) * H / b.height, cam = world.cam || { x: 0, y: 0 };
      cv.style.cursor = pickInteract(lx / VZ() + cam.x, ly / VZ() + cam.y) ? 'pointer' : ''; } catch (err) {} });
  } catch (e) {}
  window.R230S = { T, done };
})();
