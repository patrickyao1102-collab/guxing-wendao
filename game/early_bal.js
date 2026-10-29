// ================= 总策划 · 前期手感 =================
// 作者要求：
//  · 叶孤星开局就会「天剑一式·点星」——天剑宗弟子的入门剑招（和云霆、林雪同一招）
//  · 前期别太难：赵师弟（赵鸿轩）两下贪狼·追魂打死；后山小怪三下星落 / 天璇清完
//  · 后山溪边岩隙宝箱开出第一把剑「寒星剑」：换上后群攻两下清完
(function () {
  if (typeof SKILL_DB === 'undefined') return;
  const F = () => (S.flags = S.flags || {});

  // ---------- 1) 初始技能：天剑一式·点星 ----------
  SKILL_DB.dianxing = { name: '天剑一式·点星', cost: 18, desc: '天剑宗弟子入门剑招：剑芒凝于一点，贯穿单体', lv: 1 };
  const ensure = () => { const h = S.hero; if (!(h && Array.isArray(h.skills))) return; if (!h.skills.includes('dianxing')) h.skills.unshift('dianxing'); if (!h.skills.includes('xingluo2')) h.skills.splice(h.skills.indexOf('dianxing') + 1, 0, 'xingluo2'); };
  setInterval(ensure, 800);
  startBattle = (orig => function () { ensure(); return orig.apply(this, arguments); })(startBattle);
  doHeroAction = (orig => async function (k) {
    const b = battle, P = b && b.P;
    if (P && !P.ally && k === 'dianxing' && typeof skDianxing === 'function') {
      b.state = 'act'; b.menu = null; P.mp -= SKILL_DB.dianxing.cost; P.pose = 'cast';
      dxNow = .8; try { await skDianxing(P, pickTarget()); } finally { P.pose = null; dxNow = 0; }
      await afterAct(); return;
    }
    return orig.apply(this, arguments);
  })(doHeroAction);

  // ---------- 2) 赵师弟：两下追魂 ----------
  const ZHAO_HP = 280;
  zhaoBoss = (orig => function () { const z = orig.apply(this, arguments); z.hp = z.maxhp = ZHAO_HP; return z; })(zhaoBoss);
  const isZhao = b => b && b.enemies && b.enemies.some(e => e.key === 'b_zhao');
  skillTanlang = (orig => async function () {
    const r = await orig.apply(this, arguments); const b = battle;
    // 没换星痕剑的玩家每战只能用一次追魂——擂台这一战破例给两次，保证「两剑破金铃」
    if (isZhao(b) && !S.hero.sword && !b.__zh2 && b.tanlangUsed >= 1) { b.__zh2 = 1; b.tanlangUsed = 0; }
    return r;
  })(skillTanlang);

  // ---------- 3) 后山兽火：天璇三下清完（寒星剑两下）----------
  const EARLY = new Set(['wolf', 'monkey', 'tree']);
  makeEnemy = (orig => function (t, boost = 0) {
    const e = orig.apply(this, arguments);
    if (typeof world !== 'undefined' && world.mapName === 'tj_houshan' && EARLY.has(t)) {
      const f = F();
      if (f.ch1_free || f.ch1_after) { const hp = Math.round(106 * (1 + .04 * boost)); e.hp = e.maxhp = hp; e.atk = Math.round(e.atk * .85); }
    }
    return e;
  })(makeEnemy);

  // ---------- 4) 寒星剑 ----------
  ITEM_DB.w_hanxing = { name: '寒星剑', slot: 'weapon', atk: 24, aoe: 1.5, desc: '不知哪位前辈遗落在后山的佩剑，剑身凝着一层寒星般的冷光。群攻剑诀威力 +50%' };
  if (typeof itemIcon === 'function') itemIcon = (orig => function (id) { const a = [...arguments]; if (id === 'w_hanxing') a[0] = 'w_hantie'; return orig.apply(this, a); })(itemIcon);
  const GROUP = new Set(['pojun', 'tianshu', 'xingluo', 'xingluo2']);
  let aoeNow = 0, dxNow = 0;
  doHeroAction = (orig => async function (k) {
    const P = battle && battle.P, w = S.hero.equip && ITEM_DB[S.hero.equip.weapon];
    if (P && !P.ally && GROUP.has(k) && w && w.aoe) { aoeNow = w.aoe; try { return await orig.apply(this, arguments); } finally { aoeNow = 0; } }
    return orig.apply(this, arguments);
  })(doHeroAction);
  dmgCalc = (orig => function (att, def, mult = 1, critRate) {
    if (att && att.side === 'hero' && !att.ally && def && def.side === 'enemy') { if (aoeNow) mult *= aoeNow; if (dxNow) mult *= dxNow; }
    return orig.call(this, att, def, mult, critRate);
  })(dmgCalc);

  // 后山「溪边岩隙宝箱」（第一章就能开）：开出第一把剑——寒星剑（作者：第一个宝箱就该拿到武器，提高杀怪效率）
  const HS = TMAPS.tj_houshan;
  if (HS && Array.isArray(HS.npcs)) {
    const box = HS.npcs.find(n => n.name === '溪边岩隙宝箱');
    if (box) box.talk = async function () {
      const f = F(); if (f.hs_chest) { toast('空的箱子'); return; }
      world.locked = true; if (world.player) world.player.moving = false; world.path = null;
      try {
        f.hs_chest = 1; f.hanxing_got = 1; playSnd('ui_confirm'); S.hero.gold += 80; addItem('w_hanxing', 1); addItem('p_small', 2); S.flash = .35; S.flashColor = '#cfe8ff';
        if (!IMG.ic_hanxing && window.UI_ICON2 && UI_ICON2.has('w_hantie')) { try { const cv = document.createElement('canvas'); cv.width = cv.height = 128; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 128, 128); UI_ICON2.draw('w_hantie', 64, 64, 128); cv.getContext('2d').drawImage(ctx.canvas, 0, 0, 128, 128, 0, 0, 128, 128); ctx.restore(); IMG.ic_hanxing = cv; } catch (e) {} }
        const items = [{ icon: 'ic_hanxing', name: '寒星剑', count: '×1', desc: ITEM_DB.w_hanxing.desc }, { icon: 'gold', name: '灵石', count: '×80', desc: '修士之间通行的货币。' }, { icon: 'pill', name: '回春丹', count: '×2', desc: '战斗中服下，恢复一部分气血。' }];
        if (window.itemGet) await itemGet(items, '打开宝箱'); else await showPanel('打开宝箱', ['!寒星剑 ×1', '灵石 ×80', '回春丹 ×2']);
        await say('星旋', '哟，好东西！这剑里的寒气凝而不散——用它催星落、天璇这类群攻剑招，剑光能密上一半。');
        const c = await choose('寒星剑', ['立刻换上', '先收进行囊']);
        if (c === 0) { equipItem('w_hanxing'); toast('已装备寒星剑：攻击 +24，群攻剑招威力 +50%', 2600); }
      } finally { world.locked = false; }
    };
  }

  // ---------- 5) 老存档补强（总策划 2026-10-29：开局战力加强，寒星剑/星痕剑攻击提高）----------
  const mig = () => { const h = S && S.hero, f = F(); if (!h || f.bal2) return; f.bal2 = 1;
    if (h.atk < 38) { h.atk += 12; h.maxhp += 60; h.hp = Math.min(h.maxhp, h.hp + 60); h.maxmp += 30; h.mp = Math.min(h.maxmp, h.mp + 30); h.def += 2; }
    if (h.equip && h.equip.weapon === 'w_hanxing') h.atk += 14; else if (h.equip && h.equip.weapon === 'w_xinghen') h.atk += 20;   // 已装备的剑按新数值补差
    if (typeof toast === 'function' && S.started) toast('叶孤星根基稳固：攻击 / 气血 / 灵力提升', 2400); };
  setInterval(mig, 1500);
})();
