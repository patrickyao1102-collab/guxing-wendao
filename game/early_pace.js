// ================= 总策划 · 前期节奏：给玩家自由行走 / 打怪 / 探索 =================
// 1) 借力战之后：流星余力引来小妖，后山出现弱小兽火（绿火，不追人，1~2 只），可以先练手再去藏经阁。
// 2) 父亲的「三日之约」之后不再直接跳「三日后」：醒在居室，三天自由期——
//    后山兽火 Lv8~10（叶孤星此时练气九重 = Lv9）（会追人）、院中星影木人可反复切磋、后山历练任务（击退 5 团兽火有奖励）；
//    走到演武广场（问剑坪）才进入测灵碑剧情。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.tj_houshan) return;
  const F = () => S.flags;
  const phaseA = () => F().hs_explored && !F().res_ch1 && !F().res_trained && !F().ch1_free && !F().ch2_roam && !F().ch2_seal_open && !F().ch1_after;
  const phaseB = () => !!F().ch1_free;

  // ---------- 后山兽火 ----------
  const HS = TMAPS.tj_houshan;
  if (TMAPS.qingzhu_upper_pavilion && !window.HS12_ON) window.HS_DOWN_LABEL = '下山 · 云海大亭';
  const awayFrom = (x, y) => {
    const B = window.HS_BARRIER, Z = window.HS_Z || .74;
    if (B && Math.hypot(x - B.C[0], y - B.C[1]) < B.R + 60) return false;            // 锁灵阵结界附近不刷
    if (Math.hypot(x - 1322 * Z, y - 1800 * Z) < 170) return false;                    // 下山法阵附近不刷
    if (Math.hypot(x - 760 * Z, y - 560 * Z) < 190) return false;                      // 崖边（流星落点）不刷
    return true;
  };
  const zone = (c, r) => awayFrom((c + .5) * CS, (r + .8) * CS);
  const MOBS_A = { n: 4, types: ['wolf', 'tree', 'wolf'], bg: 'bg_night', lv: 0, lvR: [3, 4], zone, early: 'A' };
  const MOBS_B = { n: 6, types: ['wolf', 'monkey', 'tree', 'wolf'], bg: 'bg_mountain', lv: 0, lvR: [8, 10], zone, early: 'B' };
  const own = Object.getOwnPropertyDescriptor(HS, 'mobs'), base = own && own.value;
  Object.defineProperty(HS, 'mobs', { configurable: true, get() { return phaseB() ? MOBS_B : phaseA() ? MOBS_A : base; }, set(v) { /* 其他模块改后山刷怪时忽略 */ } });

  // A 阶段：全是弱小的绿火（不追人，1~2 只），叶孤星此时还没有剑意
  spawnTileMob = (orig => function (T, def) {
    const n = world.mobs.length; orig(T, def); if (def.mobs && def.mobs.early) for (let k = 0; k < 6 && world.mobs.length === n; k++) orig(T, def);   // 后山可走格少：多试几次
    const a = world.mobs[world.mobs.length - 1];
    if (world.mobs.length > n && a && a.fire && def.mobs && def.mobs.early === 'A') { a.fire.tier = 'green'; a.fire.lv = 3 + (Math.random() < .5 ? 0 : 1); }
    if (world.mobs.length > n && a && a.fire && def.mobs && def.mobs.early === 'B' && a.fire.tier === 'gold') a.fire.lv = 10;
  })(spawnTileMob);

  // 打赢兽火：前期历练的计数与奖励
  const prevWin = window.SQ_ON_WIN;
  window.SQ_ON_WIN = async function (info) {
    if (prevWin) await prevWin(info);
    if (info.map !== 'tj_houshan') return;
    const f = F();
    if (phaseA() && !f.hs_first_hunt) {
      f.hs_first_hunt = 1;
      await say('星旋', '不错嘛，还没拿到剑典，光凭一把铁剑也能收拾小妖了。');
      await say('叶孤星·笑', '十八年的基本功，可不是白练的。');
    }
    if (phaseB()) {
      f.ch1_hunt = (f.ch1_hunt || 0) + 1;
      if (f.ch1_hunt < 5) toast('后山历练：击退兽火 ' + f.ch1_hunt + ' / 5', 1800);
      setQuest();
      if (f.ch1_hunt === 5 && !f.ch1_hunt_done) {
        f.ch1_hunt_done = 1; S.hero.points = (S.hero.points || 0) + 30; addItem('p_small', 2);
        await say('星旋', '五团兽火！破军剑阵越来越顺手了嘛。');
        await showPanel('历练完成', ['后山兽火 ×5', '!星辰点 +30（当前 ' + S.hero.points + '）', '疗伤丹 ×2']);
        setQuest();
      }
    }
  };

  // ---------- 院中星影木人（自由期可反复切磋）----------
  const QC = TMAPS.qingzhu_court;
  const DUMMY_AT = [[1600, 660], [1690, 625], [1780, 660]];   // 世界像素坐标：东侧两座客舍之间的草坪（进图后由 placeDummies 校正到可站立格）
  let dummySpots = null;
  function placeDummies() {
    const T = world.map && world.map.T; if (!T || dummySpots) return;
    dummySpots = DUMMY_AT.map(([x, y]) => {
      for (let k = 0; k < 60; k++) { const a = k * 2.4, d = k * 6, nx = x + Math.cos(a) * d, ny = y + Math.sin(a) * d * .6; if (canStand(T, nx, ny)) return [nx, ny]; }
      return [x, y];
    });
  }
  async function spar() {
    const f = F(); f.ch1_spar = (f.ch1_spar || 0) + 1;
    const first = f.ch1_spar === 1, lv = S.hero.lv;
    await say('星旋', first ? '星影木人——起！这回我让它们还手，别光站着挨打。' : '再来？好，这回给木人加点力气！');
    const k = 1 + Math.min(4, f.ch1_spar - 1) * .12;
    const dummies = [0, 1, 2].map(i => ({ name: '星影木人', key: 'm_dummy', hp: Math.round(260 * k), maxhp: Math.round(260 * k), atk: Math.round((14 + lv) * k), def: 4, spd: 6 + i, h: 200, color: '#8a9acf', atkType: 'claw' }));
    await fadeOut(250);
    const pr = startBattle({ title: '星影木人 · 切磋', bg: 'bg_plaza', enemies: dummies, cannotLose: true, exp: 40 + 10 * Math.min(4, f.ch1_spar), gold: 0 });
    await fadeIn(250); const win = await pr; S.scene = drawMap; world.locked = true;
    const h = S.hero; h.hp = h.maxhp; h.mp = h.maxmp;
    if (win && f.ch1_spar <= 3) { h.points = (h.points || 0) + 10; toast('木人切磋 · 星辰点 +10（当前 ' + h.points + '）', 2200); }
    else if (!win) toast('木人收了手——星旋：再练练！', 2000);
    world.locked = false;
  }
  // 画木人（世界坐标）+ 靠近点击
  tileAmbientLow = (orig => function (T, cam, now) {
    orig(T, cam, now);
    if (world.mapName !== 'qingzhu_court' || !phaseB()) return;
    placeDummies(); if (!dummySpots) return;
    let im = IMG.m_dummy; if (!im && !tileAmbientLow._ld) { tileAmbientLow._ld = 1; const i = new Image(); i.onload = () => IMG.m_dummy = i; i.src = 'assets/battle_dummy.webp'; }
    for (const [x, y] of dummySpots) {
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, 26, 8, 0, 0, 7); ctx.fill(); ctx.restore();
      if (im) { const hh = 118, ww = hh * im.width / im.height; ctx.drawImage(im, x - ww / 2, y - hh + 6, ww, hh); }
      else { ctx.fillStyle = '#8a6a44'; ctx.fillRect(x - 6, y - 90, 12, 90); ctx.fillRect(x - 26, y - 70, 52, 10); }
    }
    const [mx, my] = dummySpots[1];
    ctx.save(); ctx.font = `600 20px ${FONT}`; ctx.textAlign = 'center'; textOutline('星影木人 · 切磋', mx, my - 138 + Math.sin(now * 3) * 3, '#e6f0ff', '#141a33', 4); ctx.restore();
  })(tileAmbientLow);
  let sparArmed = true, sparBusy = false;
  window.EARLY_PACE = { get spots() { return dummySpots; }, get armed() { return sparArmed; } };
  updateMap = (orig => function (dt) {
    orig(dt);
    if (world.mapName !== 'qingzhu_court' || !phaseB() || !dummySpots || sparBusy) return;
    if (world.locked || world.hold || dialog || choice || battle || !world.player) return;
    const p = world.player, d = Math.min(...dummySpots.map(([x, y]) => Math.hypot(p.x - x, (p.y - y) * 1.6)));
    if (d > 170) { sparArmed = true; return; }
    if (d < 110 && sparArmed) {
      sparArmed = false; sparBusy = true; world.locked = true; world.path = null; world.walkTarget = null; p.moving = false;
      (async () => { try { const c = await choose('星影木人', ['切磋一场', '走开']); if (c === 0) await spar(); } finally { world.locked = false; sparBusy = false; } })();
    }
  })(updateMap);
  const _tsm = tileSetMap;
  tileSetMap = function (name, c, r, face) { dummySpots = null; return _tsm.apply(this, arguments); };

  // ---------- 自由期任务提示 ----------
  function setQuest() {
    const f = F();
    S.quest = '三日之约：' + (f.ch1_hunt_done ? '' : '后山历练（兽火 ' + Math.min(5, f.ch1_hunt || 0) + '/5）· ') + '院中木人切磋 · 准备好了去演武广场测灵碑';
  }

  // ---------- 自由期开始（接在父亲走后）----------
  window.CH1_FREE_START = async function () {
    const f = F(); f.ch1_free = 1; f.ch1_hunt = f.ch1_hunt || 0;
    RES_TOD('');
    const st = TMAPS.tj_room.start; tileSetMap('tj_room', st[0], st[1], 'down'); S.scene = drawMap; S.hud = true; world.locked = true;
    await caption('三日之期 · 第一日', 1500);
    await fadeIn(600);
    await narrate('一觉睡到日上三竿。窗外竹影摇晃，离宗门的修为检测还有三天。');
    await say('星旋', '三天呢，干等着多无聊。后山那场流星余力未散，还在引妖兽——拿它们练练破军剑阵正好。');
    await say('星旋', '院子里我也给你留了几个星影木人，随时能打。');
    await say('叶孤星', '行。练够了，就去演武广场。');
    setQuest(); world.locked = false;
    toast('自由行动：出门北上云海大亭 → 后山打兽火；院里木人可切磋；往南过竹林就是演武广场', 4200);
  };

  // ---------- 演武广场 = 测灵碑剧情入口 ----------
  let gateBusy = false;
  const _tsm2 = tileSetMap;
  tileSetMap = function (name, c, r, face) {
    const prev = world.mapName;
    const out = _tsm2.apply(this, arguments);
    if (name === 'tj_front' && phaseB() && !gateBusy && prev && prev !== 'tj_front') {
      gateBusy = true;
      setTimeout(async () => {
        try {
          world.locked = true; world.path = null; world.walkTarget = null;
          const c2 = await choose('演武广场 · 测灵碑', ['三日已到——去参加修为检测', '再准备一下']);
          if (c2 === 0) {
            F().ch1_free = 0; F().ch1_after = 1; S.quest = '';
            await fadeOut(600); await caption('三日后', 1500); await part5();
          } else {
            const back = (TMAPS.tj_front.exits || []).concat(TMAPS.tj_front.doors || []).find(e => e.to === prev && e.at);
            if (back) await goMap(prev, back.at[0], back.at[1], back.face || 'down');
            world.locked = false; toast('准备好了再来演武广场', 1800);
          }
        } finally { gateBusy = false; }
      }, 350);
    }
    return out;
  };

  // ---------- 任务文字跟着地图走（试玩时发现：到了黑风谷任务还写着“前往黑风谷”，寻路只会说“四处看看”）----------
  const _tsm3 = tileSetMap;
  tileSetMap = function (name) {
    const out = _tsm3.apply(this, arguments);
    if (name === 'hf_valley' && /前往黑风谷/.test(S.quest || '')) S.quest = '穿过黑风谷，攻入东边的黑风寨';
    if (name === 'ly_midnorth' && S.flags.ly === 4 && !S.flags.ly_b1) S.quest = '往中北乱林深处走（往北），查清兽乱';
    return out;
  };

  // 测试入口：?part=ch1free
  const q = new URLSearchParams(location.search).get('part');
  if (q === 'ch1free') setTimeout(() => {
    S.fade = 1; Object.assign(S.flags, { hs_impact: 1, hs_meet: 1, hs_left: 1, hs_explored: 1, res_fixed: 1, res_trained: 1 });
    Object.assign(S.hero, { realm: '练气九重' }); for (const k of ['pojun', 'tanlang']) if (!S.hero.skills.includes(k)) S.hero.skills.push(k);
    CH1_FREE_START();
  }, 120);
})();
