// R103 装备详情 / 卸下（作者 11-03：装备要有介绍，点装备能看信息，玩家可以自己卸下）
// 装备页：点上面三格（已穿）→ 详情 + 「卸下」；点背包里的装备 → 详情 + 和身上那件的对比 + 「换上」。叶孤星、队友都一样。
(function () {
  if (typeof equipCards !== 'function' || typeof drawEquip !== 'function' || typeof menuUpdate !== 'function') return;
  // ---- 每件装备的来历（游戏里原来只有一句 desc）----
  const LORE = {
    w_wood: '天剑宗外门弟子人手一把的练功木剑。桃木辟邪，剑柄被叶孤星握得发亮——十八年来，他每天清晨都用它劈刺三千次。',
    w_qingfeng: '青阳镇王铁匠的得意之作，百炼精钢，刃口泛着青光。凡铁里的上品，刚入门的散修最爱用它。',
    w_hantie: '北地寒铁铸成，出鞘时剑身会凝一层薄霜，挥动带起寒气。练气后期的修士常用的下品灵器。',
    w_hanxing: '剑锋凝着化不开的寒意，夜里会自己泛出微光。叶孤星第一次握住它时，剑身轻轻鸣了一声，像是等了很久。',
    w_chixiao: '传说中帝道之剑的残锋重铸而成，剑气赤红如霞。握在手里，能感到一股堂皇正气顺着手臂往上走。',
    w_xinghen: '星旋用玉佩里攒下的星辰点换来的极品灵器，专为九曜剑典打造。剑身星纹与叶孤星的灵脉相通，旁人握不住它。',
    w_xinghen2: '以星陨砂重新淬炼过的星痕剑，剑身星纹会随呼吸流转。施展贪狼·绝影时，灵力消耗大减。',
    w_qingxiao: '玄兵阁的镇店之宝，极品灵器，出鞘有风雷之声。云霆在柜台前看了它整整一炷香。',
    w_yunlei: '城主府宝库里的下品玄器，剑脊刻着云雷纹，剑意霸道，与云霆的雷灵根最是相合。',
    a_cloth: '天剑宗外门弟子的制式道袍，青布两层，袖口绣着一柄小剑。挡不了重击，胜在轻便。',
    a_leather: '山外树林的野猪皮鞣成的软甲，猎户手艺，厚实耐磨，挡得住寻常妖兽的爪牙。',
    a_iron: '玄铁丝一圈圈编成的软甲，薄如布衫却坚韧异常，穿在道袍里面看不出来。',
    a_wolf: '黑风寨主的狼皮大氅，毛色乌亮，还带着一丝煞气。披上它，寻常山贼远远就会让路。',
    a_liuyun: '父亲叶擎苍亲手交给他的「极品灵器」——其实是一件极品仙器，能随心意幻化成任何模样。',
    a_nichang: '七彩天蚕丝织成的极品灵衣，衣上云纹缓缓流转，能把一部分攻击化作灵力。',
    a_ziyun: '城主府宝库的下品玄器，紫云丝与天罗藤交织而成。林雪穿上后舞剑，衣摆间紫光隐隐。',
    c_jade: '一块温润的灵犀玉，贴身佩戴能聚拢天地灵气，打坐时灵力回得更快。',
    c_tusk: '铁背獠牙猪的獠牙，用皮绳串着挂在腰间，戴着有股凶劲。',
    c_token: '从黑风寨搜出的令牌，刻满诡异的邪修符文。能借煞气增长杀伐之力，代价是灵力会被慢慢侵蚀。',
  };
  const RANK = { w_wood: '凡品', w_qingfeng: '凡品', a_cloth: '凡品', a_leather: '凡品', c_tusk: '凡品', w_hantie: '下品灵器', a_iron: '下品灵器', c_jade: '下品灵器', w_hanxing: '中品灵器', a_wolf: '中品灵器', c_token: '邪器', w_chixiao: '上品灵器', w_qingxiao: '极品灵器', w_xinghen: '极品灵器', a_nichang: '极品灵器', w_yunlei: '下品玄器', a_ziyun: '下品玄器', w_xinghen2: '中品玄器', a_liuyun: '极品仙器' };
  window.EQUIP_LORE = LORE;
  const SLOT_CN = { weapon: '武器', armor: '衣甲', acc: '饰品' };
  const isAlly = () => S.menu && S.menu.who && S.menu.who !== 'hero';
  const eqNow = () => isAlly() && window.allyEqOf ? allyEqOf(S.menu.who) : S.hero.equip;
  const heroOnly = id => window.ALLY_EQ_OK && !ALLY_EQ_OK(id);

  function unequip(slot) {
    const h = S.hero, id = eqNow()[slot]; if (!id) return;
    if (isAlly()) { allyEqOf(S.menu.who)[slot] = null; try { const k = S.menu.who, a = allyState(k), st = allyStats(k); a.hp = Math.min(a.hp, st.maxhp); a.mp = Math.min(a.mp, st.maxmp); } catch (e) {} }
    else { applyItemStats(id, -1); h.equip[slot] = null; }
    h.bag[id] = (h.bag[id] || 0) + 1; playSnd('ui_confirm'); toast((isAlly() ? memberInfo(S.menu.who).name + ' ' : '') + '卸下了 ' + ITEM_DB[id].name);
  }
  function wear(id) {
    if (isAlly()) { if (equipAlly(S.menu.who, id)) toast(memberInfo(S.menu.who).name + ' 换上了 ' + ITEM_DB[id].name); }
    else { equipItem(id); playSnd('ui_confirm'); toast('已装备 ' + ITEM_DB[id].name); }
  }

  // ---- 详情面板布局 ----
  function box(L) { const w = 620, h = 400; return { x: L.body.x + (L.body.w - w) / 2, y: L.body.y + (L.body.h - h) / 2, w, h }; }
  function btns(L, info) { const B = box(L), y = B.y + B.h - 70; const act = { x: B.x + B.w / 2 - 190, y, w: 170, h: 52 }, close = { x: B.x + B.w / 2 + 20, y, w: 170, h: 52 }; return { act, close }; }
  function wrap(text, maxW) { const out = []; let line = ''; for (const ch of text) { if (ctx.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; }

  function drawInfo(L, info) {
    const B = box(L), it = ITEM_DB[info.id]; if (!it) return;
    ctx.save(); ctx.fillStyle = 'rgba(10,6,2,.45)'; ctx.fillRect(L.body.x - 6, L.body.y - 6, L.body.w + 12, L.body.h + 12);
    lacquer(B.x, B.y, B.w, B.h, { r: 16, corners: true, top: UI.cTop, bot: UI.cBot });
    itemIcon(info.id, B.x + 70, B.y + 74, 40);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `34px ${BRUSH}`; ctx.fillStyle = UI.gold2; ctx.fillText(it.name, B.x + 128, B.y + 58);
    ctx.font = `600 16px ${FONT}`; ctx.fillStyle = UI.sub; ctx.fillText(SLOT_CN[it.slot] + '　·　' + (RANK[info.id] || '灵器') + (heroOnly(info.id) ? '　·　叶孤星专属' : ''), B.x + 130, B.y + 96);
    // 属性：背包里的和身上那件比
    const cur = info.from === 'bag' && eqNow()[it.slot] ? ITEM_DB[eqNow()[it.slot]] : null; let dx = B.x + 40; const sy = B.y + 140;
    ctx.font = `700 19px ${FONT}`;
    for (const k of STATS) { if (!it[k] && !(cur && cur[k])) continue; const v = it[k] || 0, d = cur ? v - (cur[k] || 0) : 0;
      let s = STAT_CN[k] + (v >= 0 ? ' +' : ' ') + v; ctx.fillStyle = v < 0 ? (UI.id === 'paper' ? '#b0352a' : '#ff8a7a') : (UI.id === 'paper' ? '#2f7a2a' : '#9fe0a0'); ctx.fillText(s, dx, sy); dx += ctx.measureText(s).width + 8;
      if (cur && d) { const t = d > 0 ? '▲' + d : '▼' + (-d); ctx.font = `600 15px ${FONT}`; ctx.fillStyle = d > 0 ? (UI.id === 'paper' ? '#2f7a2a' : '#8fe08a') : (UI.id === 'paper' ? '#b0352a' : '#ff8a7a'); ctx.fillText(t, dx, sy + 1); dx += ctx.measureText(t).width + 8; ctx.font = `700 19px ${FONT}`; }
      dx += 18; }
    if (cur) { ctx.font = `600 14px ${FONT}`; ctx.fillStyle = UI.dim; ctx.fillText('（▲▼ 和身上的' + cur.name + '相比）', B.x + 40, sy + 26); }
    ctx.fillStyle = UI.line; ctx.fillRect(B.x + 36, B.y + 186, B.w - 72, 1);
    // 一句效果 + 来历
    ctx.font = `600 17px ${FONT}`; ctx.fillStyle = UI.text; let y = B.y + 214;
    for (const ln of wrap(it.desc || '', B.w - 80)) { ctx.fillText(ln, B.x + 40, y); y += 26; }
    const lore = LORE[info.id]; if (lore) { ctx.font = `16px ${FONT}`; ctx.fillStyle = UI.sub; y += 4; for (const ln of wrap(lore, B.w - 80).slice(0, 3)) { ctx.fillText(ln, B.x + 40, y); y += 24; } }
    const { act, close } = btns(L, info);
    const lab = info.from === 'slot' ? '卸下' : (isAlly() && heroOnly(info.id) ? '专属' : '换上');
    sealText(lab, act.x, act.y, act.w, act.h, !(lab === '专属')); sealText('关闭', close.x, close.y, close.w, close.h, false);
    ctx.restore();
  }

  drawEquip = (orig => function (B, L, mi) {
    orig.apply(this, arguments);
    const m = S.menu; if (m && m.eqInfo && ITEM_DB[m.eqInfo.id]) drawInfo(L, m.eqInfo);
    else if (m) { ctx.save(); ctx.font = `600 15px ${FONT}`; ctx.fillStyle = UI.dim; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('点身上的装备可以查看、卸下', L.body.x + L.body.w - 14, L.body.y + 148); ctx.restore(); }
  })(drawEquip);

  menuUpdate = (orig => function () {
    const m = S.menu; if (!(m && m.tab === 1)) { if (m) m.eqInfo = null; return orig.apply(this, arguments); }
    const t = input.tapped; if (!t) return orig.apply(this, arguments);
    const L = menuLayout();
    if (m.eqInfo) {   // 详情面板打开时，只认面板上的按钮
      consumeTap(); const info = m.eqInfo, { act, close } = btns(L, info), B = box(L);
      if (t.key === 'Escape' || inR(t, close) || !inR(t, B)) { m.eqInfo = null; playSnd('ui_click'); return; }
      if (inR(t, act)) { if (info.from === 'slot') unequip(info.slot); else if (!(isAlly() && heroOnly(info.id))) wear(info.id); else toast(ITEM_DB[info.id].name + '是叶孤星专属，旁人用不了'); m.eqInfo = null; }
      return;
    }
    if (inR(t, L.close) || L.tabs.some(r => inR(t, r)) || L.members.some(r => inR(t, r))) { m.eqInfo = null; return orig.apply(this, arguments); }
    const { top, list } = equipCards(L);
    for (const c of top) if (inR(t, c) && c.id) { consumeTap(); m.eqInfo = { id: c.id, slot: c.s, from: 'slot' }; playSnd('ui_click'); return; }
    for (const c of list) if (inR(t, c)) { consumeTap(); m.eqInfo = { id: c.id, from: 'bag' }; playSnd('ui_click'); return; }
    return orig.apply(this, arguments);
  })(menuUpdate);
})();
