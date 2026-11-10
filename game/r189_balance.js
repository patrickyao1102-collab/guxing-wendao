// ================= R189 战斗数值重算（作者 11-10）=================
// 作者：「青霄剑是极品灵器，攻击怎么比寒星剑还低」「云霆伤害比叶孤星低好多」「追魂和点星好像是一个加成系数」
//       「提高云霆伤害、叶孤星降八分之一」「技能描述上要改」「追魂的伤害加成应该很多」
// 统一口径：伤害 = 攻击 × 威力% − 目标防御 × 0.6（±10% 浮动，暴击 ×1.8），再乘招式重数（第二重 +15% … 第五重 +60%）。
//   · 点星：天剑宗入门剑招，云霆、林雪 175%；叶孤星不是天剑诀正统，放点星打八折（140%）——作者 11-10：这个设定合理，保留。
//   · 叶孤星战斗攻击 ×7/8（整体降八分之一）；云霆攻击成长提高（16 级时 80 → 100，叶孤星 107——主角还是略高）。
//   · 贪狼杀招线拉开：追魂 300% → 450%，绝影 460% → 600%，夺魄 400% → 700%——一场限次的杀招，要比点星（175%）重得多。
//   · 天剑二式·群星 每段 42% → 50%（九段，分到每个敌人约 150%）。
//   · 青霄剑（极品灵器）攻击 14 → 30，云雷剑（下品玄器）16 → 40。
//   · 技能描述（战斗菜单、技能页每重说明）写实际威力。
(function () {
  if (typeof dmgCalc !== 'function' || typeof ITEM_DB === 'undefined') return;
  const F = () => (S.flags || (S.flags = {}));

  // ---------- 1) 武器 ----------
  const WEAP = { w_qingxiao: [14, 30], w_yunlei: [16, 40] };
  for (const id in WEAP) if (ITEM_DB[id]) ITEM_DB[id].atk = WEAP[id][1];
  if (ITEM_DB.w_qingxiao) ITEM_DB.w_qingxiao.desc = '玄兵阁镇店之宝，极品灵器，出鞘有风雷之声';
  // 叶孤星身上要是正穿着这两把（攻击是穿上那一刻加进面板的），补上差值，免得卸下时扣多了
  setInterval(() => { try { const h = S.hero, f = F(); if (!h || !h.equip || f.r189_w) return; f.r189_w = 1;
    const w = h.equip.weapon; if (WEAP[w]) h.atk += WEAP[w][1] - WEAP[w][0]; } catch (e) {} }, 1500);

  // 作者 11-10：装备全部通用（谁都能穿）；特殊装备穿在对应角色身上才有专属效果 → 说明里把「叶孤星专属」改成「叶孤星佩戴另有专属效果」
  for (const id of ['w_xinghen', 'w_xinghen2']) { const it = ITEM_DB[id]; if (it && it.desc) it.desc = it.desc.replace(/^叶孤星专属 · /, '叶孤星佩戴另有专属效果 · ').replace('九曜剑典剑招威力', '（叶孤星）九曜剑典剑招威力'); }

  // ---------- 2) 云霆攻击成长 ----------
  if (typeof PARTY_DB !== 'undefined' && PARTY_DB.yunting) { PARTY_DB.yunting.base.atk = 48; PARTY_DB.yunting.grow.atk = 3.7; }

  // ---------- 3) 叶孤星战斗攻击 ×7/8 ----------
  const HERO_K = 7 / 8;
  startBattle = (orig => function (cfg) {
    const pr = orig.apply(this, arguments); const b = typeof battle !== 'undefined' && battle;
    try { const P = b && (b.main || b.P); if (P && !P.ally && !P._r189) { P._r189 = 1; P.atk = Math.round(P.atk * HERO_K); } } catch (e) {}
    return pr;
  })(startBattle);

  // ---------- 4) 招式威力 ----------
  // 按招（battle.curSk）乘：各招的演出代码里写死的系数不用一处处改
  const HERO_MUL = { tanlang: 1.5, jueying: 6.0 / 4.6, duopo: 1.75 };
  const ALLY_MUL = { qunxing: 0.50 / 0.42 };
  dmgCalc = (orig => function (att, def, mult = 1, critRate) {
    try { const b = typeof battle !== 'undefined' && battle, k = b && b.curSk;
      if (k && att && att.side === 'hero' && def && def.side === 'enemy') { const M = att.ally ? ALLY_MUL : HERO_MUL; if (M[k]) mult *= M[k]; } } catch (e) {}
    return orig.call(this, att, def, mult, critRate);
  })(dmgCalc);

  // ---------- 5) 描述：写实际威力 ----------
  // 第一重的威力（每个敌人吃到的，多段招合起来算）；第 N 重 × (1 + 0 / .15 / .30 / .45 / .60)
  const POW = { dianxing: 175, xingluo2: 150, pojun: 90, xingluo: 150, xingyun: 150, tanlang: 450, jueying: 600, duopo: 700, qunxing: 150, shaxing: 270, tunshi: 185 };
  const SEG = { xingluo2: '七段剑芒', pojun: '六段', xingyun: '九段', qunxing: '九段剑影' };
  const TMUL = [0, 1, 1.15, 1.30, 1.45, 1.60];
  const powAt = (id, tier) => Math.round(POW[id] * (TMUL[tier] || 1) / 5) * 5;
  window.R189 = { POW, powAt, HERO_K, HERO_MUL, ALLY_MUL };
  // 技能页「每重效果」那几行
  const fixTiers = () => { try { if (!window.SKT || !SKT.tiersOf) return false;
    for (const id in POW) { const T = SKT.tiersOf(id); if (!Array.isArray(T) || T._r189) continue; T._r189 = 1;
      for (let i = 0; i < T.length; i++) if (typeof T[i] === 'string') T[i] = T[i].replace(/威力 \d+%/, '威力 ' + powAt(id, i + 1) + '%' + (SEG[id] && i === 0 ? '（' + SEG[id] + '合计，每个敌人）' : '') + (id === 'dianxing' && i === 0 ? '（叶孤星施展打八折）' : '')); }
    return true; } catch (e) { return false; } };
  if (!fixTiers()) { const iv = setInterval(() => { if (fixTiers()) clearInterval(iv); }, 500); }
  // 战斗菜单里的招式说明后面带上当前威力
  const whoOf = P => (P && P.ally) || 'hero';
  if (typeof heroSkills === 'function') heroSkills = (orig => function () {
    const list = orig.apply(this, arguments); try { const P = battle && battle.P, who = whoOf(P);
      for (const it of list) { if (!it || !POW[it.k] || /威力/.test(it.desc || '')) continue; const t = window.SKILL_TIER ? SKILL_TIER(who, it.k) : 1;
        it.desc = (it.desc || '') + ' · 威力 ' + Math.round(powAt(it.k, t) * (who === 'hero' && it.k === 'dianxing' ? .8 : 1) / 5) * 5 + '%'; } } catch (e) {}
    return list;
  })(heroSkills);
  // 原著味道的详述里「威力是常招的两倍」改掉
  try { if (window.SK4 && SK4.LORE && SK4.LORE.tanlang) SK4.LORE.tanlang = SK4.LORE.tanlang.replace('威力是常招的两倍', '威力 450%，是点星的两倍半'); } catch (e) {}
  if (SKILL_DB.tanlang) SKILL_DB.tanlang.desc = '剑意极致爆发，必中，贯穿单体';
  if (SKILL_DB.duopo) SKILL_DB.duopo.desc = SKILL_DB.duopo.desc.replace('单体 400%', '单体 700%');
})();
