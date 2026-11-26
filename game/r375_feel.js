// ================= R375 · 「游戏感」第二批：首领战名牌、野外多两种妖兽、三间新铺子的头一桩委托、妖王进图鉴（作者 11-26 夜）（只进测试版）=================
// 作者：「现在的游戏就是给人一种一直看剧情、一直看小说的感觉，没有那种游戏感」「例如击败什么……boss、任务」。
// 1）主线 / 支线里的首领战（敌人带 boss 标记的）：顶上亮出和妖王讨伐同一块兽首名牌 + 长血条（头顶那条小血条和小名字收掉），护体罩在长血条上叠一道金边。
//    只换显示，不动任何首领的数值和打法。
// 2）铁背獠牙猪、烈焰妖豹原来只在剧情战里出现，野外一只都碰不到 → 青玄近道、松风林道多了铁背獠牙猪，黑风谷多了烈焰妖豹（都是本来就有兽火的图）。
// 3）三间新铺子各有一桩委托（走原来的支线那一套：头上蓝 !、任务页、任务榜都认）：
//    裁月记 · 秦师傅「头一单」：幽影狼皮 ×3 → 影步靴；锦云坊 · 云娘「赶工的法衣」：影蛛丝 ×4 → 云锦长衫 + 灵石；点绛铺 · 老板娘「烘笼里的火」：烈焰晶 ×2 → 凝神香囊 + 安息香。
// 4）六只妖王打赢后收进妖兽图鉴（类别「妖王」）。
(function () {
  if (typeof TMAPS === 'undefined' || typeof S === 'undefined' || typeof startBattle !== 'function') return;
  const F = () => (S.flags = S.flags || {});

  // ---------- 1）首领战名牌 ----------
  try {
    const art = n => (window.R370_ART ? R370_ART(n) : null);
    const REALM = /(练气|凝丹|引魂|纳月|筑基|金丹|半步|重$|境$|巅峰)/;
    const split = name => { let s = String(name || '').replace(/\s*Lv\d+$/, ''), sub = '';
      let m = s.match(/^(.+?)（(.+?)）$/); if (m) { if (REALM.test(m[2])) { s = m[1]; sub = m[2]; } else s = m[1]; }
      else { m = s.match(/^(.+?)\s*·\s*(.+)$/); if (m && REALM.test(m[2])) { s = m[1]; sub = m[2]; } }
      return [s, sub]; };
    const mainBoss = b => { let best = null; for (const u of (b && b.enemies) || []) if (u && u.alive && u.boss && !u._yw && !u.eye && (!best || (u.maxhp || 0) > (best.maxhp || 0))) best = u; return best; };
    // 头顶的小血条、小名字：正挂着名牌的那只不画
    if (typeof drawUnit === 'function') drawUnit = (orig => function (u) { if (u && u._plate && u.alive && art('boss_plate')) { const nm = u.name; u.name = ''; u._noBar = 1; try { return orig.apply(this, arguments); } finally { u.name = nm; u._noBar = 0; } } return orig.apply(this, arguments); })(drawUnit);
    const layer = { t: 0, draw() { try {
      const b = typeof battle !== 'undefined' && battle; if (!b || b.state === 'end' || b._yw) return;
      const e = mainBoss(b); for (const u of b.enemies || []) if (u !== e && u._plate) u._plate = 0;
      if (!e) return; const pl = art('boss_plate'); if (!pl) return; e._plate = 1;
      const sc = .78, x0 = 452, y0 = 148, k = Math.max(0, Math.min(1, e.hp / e.maxhp)); e._hpShow = e._hpShow == null ? k : e._hpShow + (k - e._hpShow) * .12;
      const [nm, sub] = split(e.name), f = art('boss_bar_fill');
      ctx.save(); ctx.translate(x0, y0); ctx.scale(sc, sc);
      ctx.fillStyle = 'rgba(20,6,4,.78)'; ctx.fillRect(124, 60, 520, 22);
      ctx.fillStyle = 'rgba(255,230,160,.55)'; ctx.fillRect(124, 60, 520 * Math.max(k, e._hpShow), 22);
      if (f) ctx.drawImage(f, 0, 0, f.width * k, f.height, 124, 60, 520 * k, 22); else { ctx.fillStyle = '#c8281e'; ctx.fillRect(124, 60, 520 * k, 22); }
      if (e.shield > 0 && e.shieldMax) { ctx.fillStyle = 'rgba(255,211,74,.9)'; ctx.fillRect(124, 60, 520 * Math.min(1, e.shield / e.shieldMax), 5); }
      ctx.drawImage(pl, 0, 0, 680, 96);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; let fs = 24; ctx.font = `700 ${fs}px ${FONT}`; const maxW = sub ? 330 : 440; while (fs > 15 && ctx.measureText(nm).width > maxW) { fs--; ctx.font = `700 ${fs}px ${FONT}`; }
      textOutline(nm, 145 + 477 / 2, 28, '#ffe9c0', '#2a0a00', 5);
      ctx.textAlign = 'right'; ctx.font = `600 16px ${FONT}`; textOutline(sub || '首领', 145 + 470, 29, '#ffd9a0', '#2a0a00', 4);
      ctx.restore();
    } catch (er) {} } };
    S.overlay.push(layer);
  } catch (e) { console.warn('R375 plate', e); }

  // ---------- 2）野外多两种妖兽 ----------
  try { const addType = (m, t) => { const M = TMAPS[m]; if (M && M.mobs && Array.isArray(M.mobs.types) && typeof MOB_DB !== 'undefined' && MOB_DB[t] && !M.mobs.types.includes(t)) M.mobs.types = M.mobs.types.concat([t]); };
    addType('xt_road', 'boar'); addType('tj_xiashan', 'boar'); addType('hf_valley', 'leopard'); } catch (e) {}

  // ---------- 3）三间新铺子的委托 ----------
  try { if (window.SQ_DEFS && typeof ITEM_DB !== 'undefined' && ITEM_DB.m_yingpi && TMAPS.xt_caifeng && TMAPS.xt_chengyi && TMAPS.xt_yanzhi) {
    const st = id => ((F().sq = F().sq || {})[id] = F().sq[id] || { s: 0, n: 0 });
    const lvOK = n => () => ((S.hero && S.hero.lv) || 1) >= n;
    const QS = [
      { id: 'r375_qin', name: '裁月记的头一单', giver: ['xt_caifeng', '秦师傅'], where: '玄天城 · 裁月记 · 秦师傅', cond: lvOK(8),
        desc: '裁月记的秦师傅只接定做。他说头一单不收工钱——只要带得回三张整的幽影狼皮。', goal: '打幽影林的幽影狼，收集幽影狼皮',
        type: 'item', item: 'm_yingpi', n: 3, drop: { maps: ['m_yy_tiger', 'm_yy_verge'], mobs: ['ywolf'], p: 0 },
        accept: [['秦师傅', '你腰上那柄剑磨得勤，脚上这双鞋倒快磨穿了。'], ['秦师傅', '幽影林的幽影狼，皮子对着光看不见毛色。带三张整的来，我给你做双靴——头一单，不收工钱。']],
        done: [['秦师傅', '（他把皮子拎到窗口，对着光一张张看过）……没伤着里层，会剥。'], ['秦师傅', '坐着等。'], ['', '一盏茶的工夫，一双软靴搁到了你脚边。'], ['秦师傅', '往后要做别的，料和工钱一并带来。']],
        reward: { exp: 260, items: [['s_yingbu', 1]] } },
      { id: 'r375_yun', name: '赶工的法衣', giver: ['xt_chengyi', '云娘'], where: '玄天城 · 锦云坊 · 云娘', cond: lvOK(8),
        desc: '城主府在锦云坊订了一件法衣，后日就要，铺子里偏偏断了影蛛丝。', goal: '打幽影林的影纹蛛姬，收集影蛛丝',
        type: 'item', item: 'm_silk', n: 4, drop: { maps: ['m_yy_tiger', 'm_yy_verge'], mobs: ['spider'], p: 0 },
        accept: [['云娘', '客官来得巧，也来得不巧——城主府订了一件法衣，后日就要，我这儿偏偏断了影蛛丝。'], ['云娘', '您是走山路的人，替我带四束回来？我按市价双倍算，再饶您一件云锦长衫。']],
        done: [['云娘', '哎哟，这丝真齐整，一根没断！'], ['云娘', '说好的，灵石您点一点。长衫我照您的身量改过了，回去就能穿。']],
        reward: { exp: 220, gold: 400, items: [['a_yunjin', 1]] } },
      { id: 'r375_yan', name: '烘笼里的火', giver: ['xt_yanzhi', '胭脂铺老板娘'], where: '玄天城 · 点绛铺 · 老板娘', cond: lvOK(8),
        desc: '入了秋花瓣晒不干，点绛铺的香囊总带潮气。老板娘想找两块握着发烫的晶石搁在烘笼底下。', goal: '打黑风谷的烈焰妖豹，收集烈焰晶',
        type: 'item', item: 'm_yanjing', n: 2, drop: { maps: ['hf_valley'], mobs: ['leopard'], p: 0 },
        accept: [['胭脂铺老板娘', '小哥，问你个事——你们修士打妖兽，可见过一种握着发烫的晶石？'], ['胭脂铺老板娘', '入了秋花瓣晒不干，配出来的香囊总带潮气。拿那晶石搁在烘笼底下，一冬的花都保得住。'], ['胭脂铺老板娘', '帮我寻两块来，新配的香囊头一只归你。']],
        done: [['胭脂铺老板娘', '（她隔着帕子接过去）真烫手……这下烘笼不愁了。'], ['胭脂铺老板娘', '喏，凝神的。里头多放了一味安神草，夜里打坐不容易走神。']],
        reward: { exp: 200, items: [['c_ningshen', 1], ['x_anxi', 3]] } },
    ];
    window.R375_QS = QS;
    const prog = q => Math.min(q.n, itemCount(q.item)), ready = q => (st(q.id).s === 1 && prog(q) >= q.n) || st(q.id).s === 2;
    const rt = q => (window.SQ_REWARD_TEXT ? SQ_REWARD_TEXT(q) : '');
    const lines = async L => { for (const [w, t] of L) await say(w, t); };
    async function reward(q) { const r = q.reward, h = S.hero, out = [], lv0 = h.lv;
      if (r.gold) { h.gold += r.gold; out.push('灵石 +' + r.gold); }
      for (const [id, n] of r.items || []) { addItem(id, n); out.push('!获得：' + ITEM_DB[id].name + (n > 1 ? ' ×' + n : '')); }
      const ups = r.exp ? gainExp(r.exp) : 0; if (r.exp) out.unshift('经验 +' + r.exp);
      try { playSnd('jingle_win'); } catch (e) {} await showPanel('支线完成 · ' + q.name, out);
      if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0); }
    for (const q of QS) { if (SQ_DEFS.some(x => x.id === q.id)) continue;
      const M = TMAPS[q.giver[0]], n = M && (M.npcs || []).find(n => n.name === q.giver[1] && !n.hidden); if (!n) { console.warn('R375 委托：找不到', q.giver); continue; }
      SQ_DEFS.push(q);
      const fn = async () => { const s = st(q.id);
        if (s.s === 3) return false;
        if (ready(q)) { const h = S.hero; h.bag[q.item] -= q.n; if (h.bag[q.item] <= 0) delete h.bag[q.item]; await lines(q.done); s.s = 3; await reward(q); if (window.SQ_AFTER) { try { await SQ_AFTER(q); } catch (e) {} } return true; }
        if (s.s === 1) { const k = await choose(q.name + '　' + ITEM_DB[q.item].name + ' ' + prog(q) + ' / ' + q.n, [n.shop ? '看看货' : (q.id === 'r375_qin' ? '拿材料定做' : '随便聊聊'), '离开']); return k !== 0; }
        if (!q.cond || q.cond()) { await lines(q.accept); const k = await choose('支线 · ' + q.name, ['接下（报酬：' + rt(q) + '）', '下次再说']); if (k === 0) { s.s = 1; try { playSnd('ui_confirm'); } catch (e) {} toast('接取支线：' + q.name + ' —— ' + q.goal, 2600); } return true; }
        return false; };
      const orig = n.talk; (n._sq = n._sq || []).push(fn);
      if (!n._sqWrapped) { n._sqWrapped = true;
        n.talk = async function (a) {
          for (const f of n._sq) { if (await f()) { if (n.shop) { const sh = n.shop; n.shop = null; setTimeout(() => n.shop = sh, 0); } return; } }
          if (typeof orig === 'function') return orig.call(this, a);
          const L = Array.isArray(orig) ? orig : [orig || '……'], pick = n.random ? [L[Math.floor(Math.random() * L.length)]] : L; for (const l of pick) await say(n.name, l); }; } }
  } } catch (e) { console.warn('R375 委托', e); }

  // ---------- 4）妖王进图鉴 ----------
  try { if (window.BESTIARY && BESTIARY.NAME && window.R370_YW) { const D = {
      boar: '青玄近道听瀑亭一带的猪王，脊背的鬃毛硬过铁甲。它刨地蓄力时全队防御；「撼山冲撞」之后它要喘一回合，那是破绽。',
      wolf: '山外树林深处的狼将，身边总跟着两头银纹妖狼，狼死了还会再唤。狼群在，它出手更重；先清狼，再等「骨刃月斩」之后的破绽。',
      leopard: '黑风谷里的火豹，出手极快，爪下带火、挨了会一直灼烧。「离火燎原」放完它会力竭，趁那时下重手。',
      spider: '幽影林追虎迷径的蛛后，会唤小蛛，金丝缚人、吸人气血补自己。「千丝天罗」张开时全队防御，收网之后是破绽。',
      treant: '幽影林尽头的千年妖姬，脚下的荆棘花会替她回血。先掐花，再等「万棘穿心」之后的破绽。',
      rhino: '五只妖王伏诛之后才肯露面的犀王。铁甲一层层往上叠，叠满了就踏地——挨过那一脚，铁甲尽碎。' };
    for (const y of R370_YW) { const id = 'yw_' + y.id; if (BESTIARY.CAT.some(c => c[0] === id)) continue; const m = MOB_DB[y.type]; if (!m) continue;
      BESTIARY.CAT.push([id, new RegExp(y.ep + ' · ' + y.name), m.key, '妖王', (D[y.id] || '') + (y.fabao && ITEM_DB[y.fabao] ? '　伏诛后得法宝「' + ITEM_DB[y.fabao].name + '」。' : '')]); BESTIARY.NAME[id] = y.ep + ' · ' + y.name; } } } catch (e) { console.warn('R375 图鉴', e); }
})();
