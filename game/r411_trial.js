// ================= R411 · 九曜试炼（玉佩第三页；只进测试版）=================
// 作者 11-27 18:02 要「能反复打的副本」；21:02 点头设计稿第七节，又补了两条：
//   · 「从第二层开始，BOSS 肯定要用当前等级能够合成最好的装备……主属性最好的装备才有可能挑战得过，这样才能获得珍稀材料……第一关为第二关做准备，第二关为第三关做准备。」
//   · 「打试炼的时候把人物拉小一点，广角拉大一点。」（普通战斗先不动。）
// 玩家只要知道两句：想要哪一行的东西，就去打哪一曜。守关的拖久了会发狂，越快打倒它，星越多。
//
// 规矩：
//   · 五曜：金木水火土各一曜。里面的妖物全是那一行的；守关的二重、三重是讨伐榜上那一行妖王的「星影」（招数一样，数值另定），一重是那一行个头最大的寻常妖物。
//   · 一趟三场：两波小怪、一个守关的。中间不回血，可以吃药。半路输了，星力不退，打过的那几场照常结算。
//   · 三重：一重推荐 8 级、掉练气档；二重推荐 14 级、掉凝丹档，必给一件珍稀料；三重推荐 18 级、凝丹档，稀有难得多得多，两件珍稀料，守关的会发狂。打过前一重才开后一重。
//   · 进一次要一点「星力」：外面每打赢三场攒一点，打倒头目妖王给一点，最多五点。头一回进玉佩这一页送三点。
//   · 星：一重六手以内、二重八手以内、三重发狂之前打倒守关的，三星；没人倒下两星；打通一星。三星多开一个箱子。
//   · 名器（设计稿第二节末）：每一格「难得」的兵器带「斩妖」——打头目、妖王、试炼守关的伤害多三成；「难得」的衣甲带「镇邪」——它们打你少两成。
(function () {
  if (typeof ITEM_DB === 'undefined' || typeof S === 'undefined' || !window.R370_YW || !window.R370_MAKE || !window.GEAR6 || !window.CRAFT || !window.WX5 || !window.R386_KIT) return;
  const F = () => (S.flags = S.flags || {}), G6 = window.GEAR6, CR = window.CRAFT, WX = WX5.WX, KE = WX5.KE;
  const ORDER = ['jin', 'mu', 'shui', 'huo', 'tu'], CN = { jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' }, NUMCN = ['', '一', '二', '三'];
  const BEAT = el => ORDER.find(a => KE[a] === el);   // 克它的那一行
  // ---------- 一、五曜 ----------
  const TR = {
    jin: { yw: 'spider', waves: [['wolf2', 'wolf2', 'rhino'], ['xwraith', 'xguard3', 'wolf2']], g1: 'rhino' },
    mu: { yw: 'treant', waves: [['tree', 'tree', 'archer'], ['spider', 'archer', 'tree']], g1: 'treant' },
    shui: { yw: 'wolf', waves: [['ywolf', 'ywolf', 'xiexiu'], ['xguard1', 'xiexiu', 'ywolf']], g1: 'xiexiu' },
    huo: { yw: 'leopard', waves: [['wolf', 'wolf', 'xbat'], ['xbat', 'xguard2', 'wolf']], g1: 'leopard' },
    tu: { yw: 'boar', waves: [['grunt', 'grunt', 'boar'], ['xspider', 'corpse', 'grunt']], g1: 'corpse' },
  };
  const LAYER = {
    1: { rec: 8, tier: 1, boost: 0, star: 6, gold: 300, gem: .3, gear: .2, rw: { 0: 55, 1: 35, 3: 10 }, mats: [3, 4], rare: 0, q: 'q_sha', qn: [2, 3] },
    2: { rec: 14, tier: 2, boost: 2.5, star: 8, gold: 800, gem: .4, gear: .25, rw: { 0: 45, 1: 30, 2: 18, 3: 7 }, mats: [3, 4], rare: 1, q: 'q_jing', qn: [2, 3], ywLv: 15, hpK: 1.15, atkK: 1.1, defAdd: 8 },   // 11-27 夜里自动打过：15 级三人一身常见的凝丹档（带克它的火行）只拿普通攻击，第十手险胜——再硬一成半，要靠好装备或者会放招
    3: { rec: 18, tier: 2, boost: 5, star: 8, gold: 1200, gem: .5, gear: .3, rw: { 0: 25, 1: 30, 2: 30, 3: 15 }, mats: [4, 4], rare: 2, q: 'q_jing', qn: [3, 3], ywLv: 19, hpK: 1.15, atkK: 1.3, defAdd: 30, rage: 9 },   // 自动打过：18 级一身常见的只拿普通攻击，第十五手团灭、它还剩六成血；一身最好的（克它 + 名器）第十手打倒
  };
  const ywOf = el => (window.R370_YW || []).find(y => y.id === TR[el].yw);
  const name = (el, L) => CN[el] + '曜' + (L ? NUMCN[L] + '重' : '');
  const rec = () => (F().r411 = F().r411 || {});   // { jin1: { star, hands }, ... }
  const cleared = (el, L) => !!rec()[el + L];
  const open = (el, L) => L === 1 || cleared(el, L - 1);
  const SPMAX = 5, sp = () => { const f = F(); if (f.r411_sp == null) f.r411_sp = 3; return f.r411_sp; };
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  window.R384_OPEN = true;   // 玉佩第三页「试炼」开门（r386 照这个开关画页签）

  // ---------- 二、星力：外面打赢三场攒一点，打倒头目妖王给一点 ----------
  if (typeof endBattle === 'function') endBattle = (orig => function (win) {
    try { const b = battle; if (win && b && b.cfg && !b.cfg.trial && !b._r411 && !b.cfg.sunKill) { b._r411 = 1; const f = F(); sp(); let add = 0;
        if (b.cfg.boss || b.cfg.yw) add = 1; else { f.r411_w = (f.r411_w || 0) + 1; if (f.r411_w >= 3) { f.r411_w = 0; add = 1; } }
        if (add && f.r411_sp < SPMAX) { f.r411_sp++; if (f.r411_seen) setTimeout(() => { try { toast('星力 +1（' + f.r411_sp + ' / ' + SPMAX + '）· 玉佩里的九曜试炼', 2200); } catch (e) {} }, 2600); } } } catch (e) {}
    return orig.apply(this, arguments); })(endBattle);

  // ---------- 三、名器：斩妖、镇邪 ----------
  const FAMED = id => { const b = G6.baseOf(id), it = ITEM_DB[b]; return !!(it && it.rk === 3 && (it.slot === 'weapon' || it.slot === 'armor') && !G6.NO_FORGE[b]); };
  const famedOf = (u, slot) => { try { const eq = u.side !== 'hero' ? null : u.ally ? (S.allyEq && S.allyEq[u.ally]) : S.hero.equip; const id = eq && eq[slot]; return id && ITEM_DB[id] && FAMED(id) ? id : null; } catch (e) { return null; } };
  const isGuard = e => !!(e && (e._trialG || e._yw || e.boss));
  if (typeof dmgCalc === 'function') dmgCalc = (orig => function (att, def, mult, critRate) { try { let m = mult === undefined ? 1 : mult;
      if (att && att.side === 'hero' && def && def.side === 'enemy' && isGuard(def) && famedOf(att, 'weapon')) m *= 1.3;
      else if (def && def.side === 'hero' && att && att.side === 'enemy' && isGuard(att) && famedOf(def, 'armor')) m *= .8;
      if (m !== (mult === undefined ? 1 : mult)) return orig.call(this, att, def, m, critRate); } catch (e) {} return orig.apply(this, arguments); })(dmgCalc);
  const FAMED_LINE = { weapon: '【名器 · 斩妖】打头目、妖王、试炼守关的，伤害多三成。', armor: '【名器 · 镇邪】头目、妖王、试炼守关的打你，少掉两成。' };
  try { for (const slot of ['weapon', 'armor']) for (const t of [1, 2]) for (const el of ORDER) { const ids = ((G6.GRID[slot] || {})[t] || {})[el] || []; for (const id of ids) { const it = ITEM_DB[id]; if (it && it.rk === 3 && !G6.NO_FORGE[id] && !/名器/.test(it.desc || '')) it.desc = (it.desc || '') + FAMED_LINE[slot]; } } } catch (e) { console.warn('R411 famed', e); }

  // ---------- 四、手数和发狂 ----------
  if (typeof enemyAct === 'function') enemyAct = (orig => async function (e) {
    try { if (e && e._trialG && e.alive) { e._hands = (e._hands || 0) + 1; const L = e._trialL, rg = LAYER[L].rage;
        if (rg && e._hands >= rg) { const k = 1 + .15 * (e._hands - rg + 1); e.atk = Math.round(e._atkT * k); try { floatText(e.x, e.y - e.h - 60, '发狂 ×' + (e._hands - rg + 1), '#ff5a3a', 40, 1.2, BRUSH); S.shake = 8; } catch (er) {} }
        else if (rg && e._hands === rg - 2) { try { floatText(e.x, e.y - e.h - 60, '再拖两手，它要发狂了', '#ffb04a', 34); } catch (er) {} }
        e.name = e._nameT + ' · 第' + e._hands + '手'; } } catch (er) {}
    return orig.apply(this, arguments); })(enemyAct);

  // ---------- 五、一场仗 ----------
  const BG = el => (ywOf(el) || {}).bg || 'bg_mountain';
  // 镜头拉远：人物小一些，站位往中间收一收，场面显得大
  function wide(b) { try { for (const u of b.units) { u.h = Math.round(u.h * .8); if (u._scale) u._scale *= .8; const cx = 640, cy = 600; u.x = Math.round(cx + (u.x - cx) * .9); u.y = Math.round(cy + (u.y - cy) * .85); u._wide = 1; } b._wide = 1; } catch (e) {} }
  async function fightWave(el, L, i) { const types = TR[el].waves[i], lv = LAYER[L].rec + i;
    const ens = types.map(t => { const m = makeEnemy(t, LAYER[L].boost); m.name += ' Lv' + lv; m.lv = lv; return m; });
    const pr = startBattle({ title: '九曜试炼 · ' + name(el, L) + ' · 第' + NUMCN[i + 1] + '场', bg: BG(el), enemies: ens, flee: false, trial: el + L });
    if (battle) wide(battle); await fadeIn(220); const w = await pr; S.scene = drawMap; return w === true; }
  async function fightGuard(el, L) { let ens, boss;
    if (L === 1) { boss = makeEnemy(TR[el].g1, 1); boss.hp = boss.maxhp = Math.round(boss.maxhp * 3.2); boss.atk = Math.round(boss.atk * 1.2); boss.def += 4; boss.boss = true; boss.lv = LAYER[1].rec + 2; boss.name = '守关 · ' + boss.name; ens = [boss]; }
    else { const y0 = ywOf(el), Lx = LAYER[L], y = Object.assign({}, y0, { lv: Lx.ywLv }); boss = R370_MAKE(y); boss.hp = boss.maxhp = Math.round(boss.maxhp * Lx.hpK); boss.atk = boss._atk0 = Math.round(boss.atk * Lx.atkK); boss.def = boss._def0 = boss.def + Lx.defAdd;
      boss.name = '星影 · ' + y0.name; ens = [boss];
      for (const [k, t] of (y0.adds || []).entries()) { const m = makeEnemy(t, Lx.boost); if (y0.addName) { m.name = y0.addName; m.hp = m.maxhp = Math.round(m.maxhp * 1.3); m._flower = 1; } m.name += ' Lv' + (Lx.ywLv - 2); m.lv = Lx.ywLv - 2; m._add = y0.id; m._type = t; m.slot = [[560, 690], [540, 440]][k]; ens.push(m); } }
    boss._trialG = 1; boss._trialL = L; boss._hands = 0; boss._atkT = boss.atk; boss._nameT = boss.name;
    const pr = startBattle({ title: '九曜试炼 · ' + name(el, L) + ' · 守关', bg: BG(el), enemies: ens, boss: true, flee: false, trial: el + L, yw: L > 1 ? TR[el].yw : undefined });
    try { if (battle && L > 1) { const y0 = ywOf(el); let ai = 0; for (const u of battle.enemies) { if (u._yw) { u._scale = y0.scale; battle._yw = u; u.x = (y0.bpos || [290, 610])[0]; u.y = (y0.bpos || [290, 610])[1]; } else { const sl = (y0.apos || [[570, 665], [545, 470], [440, 560]])[ai++] || [600, 560]; u.x = sl[0]; u.y = sl[1]; } } } } catch (e) {}
    if (battle) wide(battle);
    let down = false; const b = battle; await fadeIn(240); const w = await pr; S.scene = drawMap;
    try { down = !!(b && b.units.some(u => u.side === 'hero' && !u.alive)) || !!(b && b._down); } catch (e) {}
    return { win: w === true, hands: boss._hands || 0, down }; }
  // 有人倒下过：记下来（打完以后复活的也算倒过）
  if (typeof applyDamage === 'function') applyDamage = (orig => function (t) { const r = orig.apply(this, arguments); try { const b = battle; if (b && b.cfg && b.cfg.trial && t && t.side === 'hero' && t.hp <= 0) b._down = 1; } catch (e) {} return r; })(applyDamage);

  // ---------- 六、掉落 ----------
  const matsOf = (el, g) => Object.keys(CR.MAT).filter(id => { const m = CR.MAT[id]; return m.wx === el && m.g === g && m.c && ITEM_DB[id]; });
  function rollGear(el, tier, rw) { const slot = pick(['weapon', 'wrist', 'armor', 'shoe', 'acc']), ids = (((G6.GRID[slot] || {})[tier] || {})[el] || []).filter(id => ITEM_DB[id] && !G6.NO_FORGE[id]); if (!ids.length) return null;
    const w = ids.map(id => rw[G6.rankOf(id)] || 0), tot = w.reduce((a, c) => a + c, 0); if (!tot) return pick(ids); let r = Math.random() * tot; for (let i = 0; i < ids.length; i++) { r -= w[i]; if (r <= 0) return ids[i]; } return ids[ids.length - 1]; }
  function famedRoll(el) { const slot = pick(['weapon', 'armor']), ids = ((G6.GRID[slot] || {})[2] || {})[el] || []; return ids.find(id => ITEM_DB[id] && ITEM_DB[id].rk === 3 && !G6.NO_FORGE[id]) || null; }
  function loot(el, L, stars, first, part) { const Lx = LAYER[L], got = {}, add = (id, n = 1) => { if (id && ITEM_DB[id]) got[id] = (got[id] || 0) + n; };
    const g = Lx.tier, ms = matsOf(el, g), nm = ri(Lx.mats[0], Lx.mats[1]);
    if (part) { for (let i = 0; i < part; i++) add(pick(ms)); add(Lx.q, 1); return got; }   // 半路输了：打过几场给几件料
    for (let i = 0; i < nm; i++) add(pick(ms)); const rare = matsOf(el, 3); for (let i = 0; i < Lx.rare; i++) add(rare.length ? pick(rare) : 'm_neidan');
    add(Lx.q, ri(Lx.qn[0], Lx.qn[1]));
    if (Math.random() < Lx.gem) add(L === 3 && Math.random() < .3 ? CR.gemId(el, 2) : CR.gemId(el, 1));
    if (Math.random() < Lx.gear) add(rollGear(el, Lx.tier, Lx.rw));
    if (stars >= 3) { if (Math.random() < .5) add(rollGear(el, Lx.tier, Lx.rw)); add(Lx.q, 2); if (L === 3 && Math.random() < .08) add(famedRoll(el)); }
    if (first) { const setIds = ['weapon', 'wrist', 'armor', 'shoe'].map(s => (((G6.GRID[s] || {})[Lx.tier] || {})[el] || []).find(id => ITEM_DB[id] && ITEM_DB[id].rk === 1)).filter(Boolean); add(pick(setIds)); add(CR.gemId(el, 1)); }
    return got; }

  // ---------- 七、一趟 ----------
  const LINES = { open: ['小子，这只是本神仙照着山里最凶的那只捏的。打不过别说是本神仙教的。', '门开了。里头全是那一行的东西，带对了剑再进。', '进去吧。本神仙在外头看着。'],
    three: '哼，还算利索。这个箱子是本神仙额外赏的。', slow: '磨磨蹭蹭。换把像样的剑再来，别让本神仙等。', ok: '还行。这点东西拿去，省得说本神仙小气。', lose: '出来了？伤养好，剑磨利，再进。' };
  let running = false;
  async function run(el, L) { if (running) return; running = true; const f = F(); f.r411_sp = Math.max(0, sp() - 1);
    world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    try { await say('星旋', L >= 2 && !f['r411_l' + L] ? (f['r411_l' + L] = 1, L === 3 ? '三重的星影会发狂：拖到第九手，它一手比一手狠。带最好的剑，快进快出。' : '二重的守关，是照讨伐榜上那只捏的星影，招数一样。外头怎么打它，里头就怎么打。') : pick(LINES.open));
      try { playSnd('sfx_charge', .6); } catch (e) {} S.flash = .5; S.flashColor = '#cfe0ff'; await fadeOut(300);
      let done = 0;
      for (let i = 0; i < 2; i++) { if (i) { try { toast('第' + NUMCN[i + 1] + '场', 1200); } catch (e) {} await fadeOut(250); } const w = await fightWave(el, L, i); if (!w) return await fail(el, L, done); done++; }
      try { toast('守关的来了', 1400); } catch (e) {} await fadeOut(250);
      const r = await fightGuard(el, L); if (!r.win) return await fail(el, L, done);
      const Lx = LAYER[L], fast = Lx.rage ? r.hands < Lx.rage : r.hands <= Lx.star, stars = fast ? 3 : !r.down ? 2 : 1, key = el + L, old = rec()[key], first = !old;
      if (!old || stars > old.star || (stars === old.star && r.hands < old.hands)) rec()[key] = { star: Math.max(stars, old ? old.star : 0), hands: old ? Math.min(old.hands, r.hands) : r.hands };
      await sleep(300); if (typeof banner === 'function') banner(name(el, L) + ' · 打通'); try { playSnd('jingle_win', .6); } catch (e) {} await sleep(1500);
      const got = loot(el, L, stars, first); for (const [id, n] of Object.entries(got)) addItem(id, n); if (first) S.hero.points = (S.hero.points || 0) + 20;
      const list = Object.entries(got).map(([id, n]) => ({ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×' + n, desc: ITEM_DB[id].desc }));
      if (first && ITEM_DB.x_xingchen) list.push({ icon: 'item:x_xingchen', name: '星辰点', count: '+20', desc: '玉佩宝库里换东西用' });
      if (window.itemGet) await itemGet(list, name(el, L) + ' · ' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + ' · 守关' + r.hands + '手');
      await say('星旋', stars >= 3 ? LINES.three : stars === 1 && Lx.rage ? LINES.slow : LINES.ok);
    } finally { running = false; world.locked = false; S.fade = 0; S.scene = drawMap; } }
  async function fail(el, L, done) { S.scene = drawMap; partyRevive(.3); S.fade = 0; const got = done ? loot(el, L, 0, false, done) : {}; for (const [id, n] of Object.entries(got)) addItem(id, n);
    toast('败下阵来……' + (done ? '打过的' + done + '场，东西照给' : '') , 2800); await sleep(600); await say('星旋', LINES.lose); }

  // ---------- 八、玉佩第三页 ----------
  const { D, T, C, BR, KAI, NUM, fit, wrap, inR } = window.R386_KIT;
  const IM = {}; const img = n => { let o = IM[n]; if (!o) { o = IM[n] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r411/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
  const UI = { el: 'jin', L: 1, arm: 0 };
  const cardR = (B, i) => ({ x: B.x + 10 + i * 160, y: B.y + 8, w: 152, h: 214 }), layR = (B, i) => ({ x: B.x + 14 + i * 104, y: B.y + 236, w: 96, h: 40 }), GO = B => ({ x: B.x + B.w - 250, y: B.y + B.h - 66, w: 236, h: 54 });
  const party = () => [['hero', '叶孤星', S.hero.equip || {}]].concat((S.party || []).slice(0, 2).map(k => [k, (PARTY_DB[k] || {}).name || k, (S.allyEq && S.allyEq[k]) || {}]));
  // 「当前档上等」：这一格里排在最好的两等（稀有、难得；练气档是套装件、难得）
  function topPiece(id, tier) { const b = G6.baseOf(id), it = ITEM_DB[b]; if (!it || !it.slot || G6.tierOf(b) !== tier) return false; const ids = (((G6.GRID[it.slot] || {})[tier] || {})[it.wx] || []); const i = ids.indexOf(b); return i >= 0 && i >= ids.length - 2; }
  function gearCheck(tier) { let n = 0; for (const [, , eq] of party()) for (const s of ['weapon', 'wrist', 'armor', 'shoe']) if (eq[s] && topPiece(eq[s], tier)) n++; return n; }
  const NEED = { 1: 0, 2: 2, 3: 4 };
  function draw(B, K) { const f = F(); f.r411_seen = 1; sp(); const now = performance.now(), el = UI.el, L = UI.L, Lx = LAYER[L], y0 = ywOf(el);
    ORDER.forEach((e, i) => { const r = cardR(B, i), on = e === el; K.D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); const im = img('sl_' + e); if (im) { ctx.save(); ctx.beginPath(); ctx.rect(r.x + 6, r.y + 6, r.w - 12, r.h - 52); ctx.clip(); ctx.globalAlpha = on ? 1 : .72; ctx.drawImage(im, r.x + 6, r.y + 6 - 20, r.w - 12, (r.w - 12) * 600 / 360); ctx.restore(); }
      T(CN[e] + '曜', r.x + r.w / 2, r.y + r.h - 32, 22, on ? C.gold2 : C.text, BR(), 400, 'center'); let st = ''; for (let l = 3; l >= 1; l--) { const q = rec()[e + l]; if (q) { st = NUMCN[l] + '重 ' + '★'.repeat(q.star); break; } } T(st || '未打过', r.x + r.w / 2, r.y + r.h - 12, 13, st ? C.gold : C.dim, KAI(), 500, 'center'); });
    [1, 2, 3].forEach(l => { const r = layR(B, l - 1), ok = open(el, l); K.D(l === L ? 'category_s' : 'category_n', r.x, r.y, r.w, r.h); T(NUMCN[l] + '重', r.x + r.w / 2, r.y + r.h / 2 + 1, 17, l === L ? C.gold2 : ok ? C.text : C.dim, KAI(), 600, 'center'); });
    T('星力 ' + sp() + ' / ' + SPMAX, B.x + B.w - 20, B.y + 256, 18, sp() ? C.gold2 : C.red, KAI(), 600, 'right');
    const x0 = B.x + 18, x1 = B.x + 420; let yy = B.y + 300; const ln = (s, col, sz) => { ctx.font = `500 ${sz || 15}px ${KAI()}`; T(fit(s, 380), x0, yy, sz || 15, col || C.text); yy += 26; };
    ln(name(el, L) + ' · 推荐 ' + Lx.rec + ' 级 · 掉' + (Lx.tier === 1 ? '练气' : '凝丹') + '档', C.gold2, 17);
    ln('里头全是' + CN[el] + '行的妖物，怕' + CN[BEAT(el)] + '。', C.text);
    if (L === 1) ln('守关的：' + (MOB_DB[TR[el].g1] || {}).name + '（大个头，没有花招）', C.sub); else { ln('守关的：星影 · ' + y0.name, C.sub); ctx.font = `500 14px ${KAI()}`; ctx.fillStyle = C.sub; wrap(y0.tip || '', x0, yy, 384, 22, 2); yy += 46; }
    if (Lx.rage) ln('拖到第 ' + Lx.rage + ' 手它会发狂，越拖越狠。', C.red);
    const q = rec()[el + L]; ln(q ? '最好：' + '★'.repeat(q.star) + '☆'.repeat(3 - q.star) + ' · 守关' + q.hands + '手' : '还没打通过。头一回打通多给一件套装件、一颗灵珠、二十点星辰点。', q ? C.gold : C.sub, 14);
    // 右边：带什么去
    let y2 = B.y + 300; const ln2 = (s, col, sz) => { ctx.font = `500 ${sz || 15}px ${KAI()}`; T(fit(s, B.x + B.w - 20 - x1), x1, y2, sz || 15, col || C.text); y2 += 26; };
    ln2('谁的剑克它', C.gold2, 17); const good = BEAT(el);
    for (const [, nm, eq] of party()) { const w = eq.weapon, we = w ? WX5.gearWx(w) : null, rr = we ? WX5.rel(we, el) : 0, mark = !we ? '—' : rr >= 1 ? '✓ 克它' : rr > 0 ? '✓ 次克它' : rr < 0 ? '✗ 生它，伤害少三成' : '· 平', col = rr > 0 ? C.green : rr < 0 ? C.red : C.sub; ln2(nm + '：' + (w && ITEM_DB[w] ? ITEM_DB[w].name : '空手') + '　' + mark, col, 14); }
    const n = gearCheck(Lx.tier), need = NEED[L]; if (need) ln2('三人身上当前档上等的主装备 ' + n + ' 件（建议 ≥ ' + need + '）', n >= need ? C.green : C.red, 14); else ln2('一重随便打，攒料攒淬灵用。', C.sub, 14);
    ln2('掉：' + CN[el] + '行的料、' + ITEM_DB[Lx.q].name + (Lx.rare ? '、珍稀料 ×' + Lx.rare : '') + '，有机会出灵珠和装备', C.sub, 14);
    const ok = open(el, L), can = ok && sp() > 0; K.btn(GO(B), !ok ? '先打通' + NUMCN[L - 1] + '重' : !sp() ? '星力不够' : UI.arm && now - UI.arm < 3500 ? '再点一次 · 进门' : '进入（星力 -1）', can ? (UI.arm && now - UI.arm < 3500 ? 'p' : 'n') : 'd', 18);
    if (!sp()) { ctx.font = `500 13px ${KAI()}`; T('外面每打赢三场攒一点，打倒头目妖王给一点', GO(B).x + GO(B).w, GO(B).y - 14, 13, C.sub, KAI(), 500, 'right'); } }
  function tap(tp, B, K) { for (let i = 0; i < ORDER.length; i++) if (inR(tp, cardR(B, i))) { if (UI.el !== ORDER[i]) { UI.el = ORDER[i]; UI.arm = 0; if (!open(UI.el, UI.L)) UI.L = 1; K.snd('ui_click'); } return null; }
    for (let l = 1; l <= 3; l++) if (inR(tp, layR(B, l - 1))) { if (!open(UI.el, l)) { K.speak('先把' + name(UI.el, l - 1) + '打通。'); K.snd('ui_cancel'); } else if (UI.L !== l) { UI.L = l; UI.arm = 0; K.snd('ui_click'); } return null; }
    if (inR(tp, GO(B))) { if (!open(UI.el, UI.L)) return null; if (!sp()) { K.speak('星力用完了。外面打几场再来。'); K.snd('ui_cancel'); return null; }
      const now = performance.now(); if (!(UI.arm && now - UI.arm < 3500)) { UI.arm = now; K.snd('ui_click'); return null; } UI.arm = 0; K.snd('ui_confirm'); pend = [UI.el, UI.L]; return 'trial'; }
    return null; }
  let pend = null;
  window.R384_DRAW = (B, K) => draw(B, K);
  window.R384_TAP = (tp, B, K) => tap(tp, B, Object.assign({ btn: null }, K));
  // 玉佩关上以后再进门（玉佩那一圈循环收尾时会把锁放开，所以等它关干净）
  setInterval(() => { try { if (!pend || running || (window.R386 && R386.isOpen()) || (typeof battle !== 'undefined' && battle) || dialog || choice || sysPanel) return; const [el, L] = pend; pend = null; run(el, L); } catch (e) { pend = null; } }, 200);
  window.R411 = { TR, LAYER, run, loot, rec, sp, gearCheck, FAMED, UI, fightGuard };
})();
