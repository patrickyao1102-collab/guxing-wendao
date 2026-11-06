// ================= R139 · 青竹小院的日常（作者 11-07：「青竹小院的对话互动、各自素材动作都接进去，挑水浇花、暖心小故事，你去设计」）=================
// 一、人物比例：西院四间屋子按 120px 人物画的家具，人物在屋里显小 → 四间屋里人物放大到和小院里一样的比例。
// 二、白天三个人各有一套日常，在小院 ↔ 西院之间走动（同一张图，寻路走过去），干活用 Codex 的动作帧：
//   青禾：小院东头扫竹叶 → 走到西院石桌擦桌子（R135 擦桌 6 帧）→ 西院石板路上再扫一阵 → 回小院。
//   小桃：浇小院花圃 → 西院四块花圃挨个浇 → 去厨房端茶（端茶走路 6 帧）→ 石桌斟茶（斟茶 6 帧）→ 歇一会 → 收茶杯（收杯 6 帧）→ 端回厨房。
//   阿福：西院井边打水 → 挑去厨房（端水 6 帧）来回两趟 → 再给小桃的花圃送一桶 → 去小院石阶下送热水 → 回井边。
//   少爷走到跟前，走路的人会停下让路；说话时转过来（小厮说话比手势）。
// 三、三段暖心小事（存档里记着，只发生一次）：
//   ① 帮阿福挑一担水；② 小桃问西院那块新花圃种什么（月季 / 绣球 / 菊花，选了花圃立刻换）；
//   ③ ①② 都做过以后，夜里去青禾屋里，她把熬了几晚绣好的「青竹香囊」送给少爷（里头装的是你挑的那种花）。
// 四、能用的地方：厨房灶上的莲子羹（回满气血灵力，隔一阵才能再盛）、小桃刚斟的茶（石桌，回灵力）、
//   西院水井（第一次看有一段旧事）；夜里头一回走进西院，窗里亮着灯，听见两个丫头在说笑。
(function () {
  if (!window.R136W_ON || typeof TMAPS === 'undefined' || !TMAPS.qingzhu_court) return;
  const COURT = 'qingzhu_court', OX = 1664;
  const F = () => (S.flags = S.flags || {});
  const night = () => { try { return window.TOD ? TOD() === 'night' : false; } catch (e) { return false; } };
  const Y = (x, y) => [x - OX, y];   // 西院坐标 → 小院坐标
  const now = () => performance.now() / 1000;
  const FLOWER = { rose: '月季', hydrangea: '绣球', chrysanthemum: '菊花' };

  // ---------- 一、屋里人物比例 ----------
  try { for (const m of ['qingzhu_room_qinghe', 'qingzhu_room_xiaotao', 'qingzhu_room_afu', 'qingzhu_kitchen']) CHAR_SCALE[m] = 1.2; } catch (e) {}

  // ---------- 动作帧（R135 生活动作扩展：擦桌 / 擦雕像 / 端茶走 / 斟茶 / 收杯，各 6 帧，画的朝左前方）----------
  const LIFE = new Image(); let lifeOk = false; LIFE.onload = () => { lifeOk = true; };
  let lifeReq = false; const needLife = () => { if (!lifeReq) { lifeReq = true; LIFE.src = 'r139/life.webp'; } };
  const ROW = { wipe_table: 0, wipe_statue: 1, carry_tea: 2, pour_tea: 3, tidy_tea: 4 };
  const SC = .47;
  if (typeof drawActorT === 'function') drawActorT = (o => function (a, t) {
    const A = a && a._act;
    if (A && lifeOk && !a.hidden) {
      let f;
      if (A.walk) f = a.moving ? Math.floor(t * 8) % 6 : 0;
      else if (A.once) f = Math.min(5, Math.floor((t - A.t0) * A.fps));
      else f = Math.floor((t - A.t0) * 6) % 6;
      const flip = A.face > 0;
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 21, 7, 0, 0, 7); ctx.fill();
      ctx.translate(a.x, a.y); if (flip) ctx.scale(-1, 1); ctx.scale(SC, SC);
      ctx.drawImage(LIFE, f * 256, ROW[A.id] * 256, 256, 256, -128, -240, 256, 256); ctx.restore(); return;
    }
    return o.apply(this, arguments);
  })(drawActorT);

  // ---------- 二、日常路线 ----------
  // 步骤：go 走过去（carry：端水 / 端茶走）；job 原地干活（扫地 / 浇花，R135 原有帧）；act 新动作；wait 歇着
  const R = {
    maid1: [
      { go: [1640, 566] }, { job: 'sweep', t: 9, face: 1 }, { go: [1790, 566] }, { job: 'sweep', t: 8, face: -1 },
      { go: Y(1062, 1444) }, { act: 'wipe_table', t: 6, face: -1 }, { wait: 2.5 },
      { go: Y(560, 1300) }, { job: 'sweep', t: 8, face: 1 }, { go: Y(820, 1300) }, { job: 'sweep', t: 6, face: -1 },
    ],
    maid2: [
      { go: [1292, 628] }, { job: 'water', t: 8, face: 1 },
      { go: Y(352, 650) }, { job: 'water', t: 6, face: -1 },
      { go: Y(640, 694) }, { job: 'water', t: 6, face: 1 },
      { go: Y(1222, 694) }, { job: 'water', t: 6, face: -1 },
      { go: Y(1214, 1000) }, { job: 'water', t: 5, face: 1 },
      { go: Y(335, 1196) }, { wait: 2 },
      { go: Y(1104, 1446), carry: 'tea' }, { wait: .6, carry: 'tea' }, { act: 'pour_tea', once: true, t: 2.6, face: -1, tea: true }, { wait: 9 },
      { act: 'tidy_tea', once: true, t: 2.6, face: -1 }, { go: Y(335, 1196), carry: 'tea' }, { wait: 3 },
    ],
    servant: [
      { go: Y(330, 1472) }, { wait: 2.5 }, { go: Y(335, 1196), carry: 'water' }, { wait: 1.5, carry: 'water' },
      { go: Y(330, 1472) }, { wait: 2.5 }, { go: Y(335, 1196), carry: 'water' }, { wait: 1.5, carry: 'water' },
      { go: Y(330, 1472) }, { wait: 2 }, { go: Y(640, 694), carry: 'water' }, { wait: 2, carry: 'water' },
      { go: [240, 948], carry: 'water' }, { go: [490, 948], carry: 'water' }, { wait: 2.5, carry: 'water' },
    ],
  };
  const STARTS = { maid1: 0, maid2: 0, servant: 0 };
  const court = TMAPS[COURT];
  const day = n => (court.npcs || []).find(x => x.name === n && x._r135day);
  const NPC = { maid1: day('侍女青禾'), maid2: day('侍女小桃'), servant: day('小厮阿福') };
  for (const k in NPC) { const n = NPC[k]; if (!n) continue; n.route = null; n.r139 = k; n.job = null; n.random = false; }

  let TEA_T = -99, PAUSE = {};
  const cellPx = (T, c, r) => [(c + .5) * T.cs, (r + .5) * T.cs];
  function plan(a, T, to) {
    try {
      const cs = T.cs, p = findPath(T, Math.floor(a.x / cs), Math.floor(a.y / cs), Math.floor(to[0] / cs), Math.floor(to[1] / cs));
      if (!p || !p.length) return [to.slice()];
      const out = []; for (let i = 2; i < p.length; i += 2) out.push(cellPx(T, p[i][0], p[i][1])); out.push(to.slice()); return out;
    } catch (e) { return [to.slice()]; }
  }
  function enter(a, T) {
    const n = a.npc, L = R[n.r139], s = a._s;
    const st = L[s.i % L.length]; s.step = st; s.t = 0; s.path = null;
    n.job = null; a._act = null; a.moving = false;
    const r1 = a._r135 || (a._r135 = { dir: 1, wait: 0, mv: false }); r1.mv = false;
    if (st.go) { s.path = plan(a, T, st.go); if (st.carry === 'water') n.job = 'carry'; if (st.carry === 'tea') { needLife(); a._act = { id: 'carry_tea', walk: true, face: -1 }; } }
    else if (st.job) { n.job = st.job; r1.dir = st.face; }
    else if (st.act) { needLife(); a._act = { id: st.act, t0: now(), once: !!st.once, fps: 6 / st.t * 1.6, face: st.face }; if (st.tea) TEA_T = now(); }
    else if (st.wait) { if (st.carry === 'water') n.job = 'carry'; if (st.carry === 'tea') { needLife(); a._act = { id: 'carry_tea', walk: true, face: (a._lastFace || -1) }; } }
  }
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) {
    o.apply(this, arguments);
    try {
      if (world.mapName !== COURT || night() || !world.actors) return;
      const T = world.map.T, p = world.player, busy = (typeof choice !== 'undefined' && choice);
      for (const a of world.actors) { const n = a.npc; if (!n || !n.r139) continue;
        if (!a._s) { a._s = { i: STARTS[n.r139] || 0 }; enter(a, T); }
        const s = a._s, st = s.step, r1 = a._r135;
        const talking = a.talking || (typeof dialog !== 'undefined' && dialog && dialog.who === n.name) || busy;
        if (talking || (PAUSE[n.r139] && now() < PAUSE[n.r139])) { a.moving = false; if (r1) r1.mv = false; continue; }
        if (st.go) {
          const tgt = s.path && s.path[0]; if (!tgt) { s.i++; enter(a, T); continue; }
          if (p && Math.hypot(p.x - a.x, p.y - a.y) < 46) { a.moving = false; r1.mv = false; continue; }   // 少爷挡在路上：停一下让路
          const dx = tgt[0] - a.x, dy = tgt[1] - a.y, d = Math.hypot(dx, dy), sp = (st.carry ? 50 : 56) * Math.min(dt, .05);
          if (d <= sp) { a.x = tgt[0]; a.y = tgt[1]; s.path.shift(); }
          else { a.x += dx / d * sp; a.y += dy / d * sp; }
          a.moving = true; a.tx = tgt[0]; a.ty = tgt[1]; r1.mv = true; if (Math.abs(dx) > .3) { r1.dir = dx > 0 ? 1 : -1; a._lastFace = r1.dir; if (a._act && a._act.walk) a._act.face = r1.dir; }
        } else {
          s.t += dt; if (s.t >= (st.t || st.wait || 1)) { s.i++; enter(a, T); }
        }
      }
    } catch (e) { console.warn('r139 life', e); }
  })(tileUpdate);

  // ---------- 三、对话与小故事 ----------
  const sayN = (who, t) => say(who, t);
  const pick = l => l[Math.floor(Math.random() * l.length)];
  const giveFx = () => { try { playSnd('sfx_heal', .7); } catch (e) {} };
  // 阿福：帮他挑一担水
  if (NPC.servant) NPC.servant.talk = async a => {
    const f = F();
    if (!f.qz_afu_help) {
      await sayN('小厮阿福', pick(['少爷让让——水洒了要挨管家骂的！', '西院这口井水甜，烧茶、浇花都用它。就是一担一担挑着费劲。']));
      const i = await choose('小厮阿福', ['我来挑一担', '辛苦了，歇口气吧', '没事']);
      if (i === 0) {
        await sayN('小厮阿福', '使不得使不得！哪有让少爷挑水的道理——');
        await fadeOut(350);
        await narrate('叶孤星没理他，接过扁担往肩上一搭。灵力往下一沉，两桶满满的井水稳稳当当，一滴没晃出来。');
        await narrate('从井边到厨房水缸，他走了一趟，又走了一趟。');
        await fadeIn(350);
        await sayN('小厮阿福', '……少爷，您走一趟，我得走三趟。');
        await sayN('小厮阿福', '这事要让管家知道了，我可要挨骂的。您可千万别说出去！');
        await sayN('星旋', '（挑水也是练下盘，不亏。）');
        f.qz_afu_help = 1; giveFx(); toast('阿福偷偷记下了这份情', 1800);
      } else if (i === 1) {
        await sayN('小厮阿福', '那……那我就歇一口气，就一口！'); PAUSE.servant = now() + 12;
      }
      return;
    }
    await sayN('小厮阿福', pick(['少爷上回帮我挑水的事，我谁也没说——青禾姐还是知道了，笑了我半天。', '灶上烧着热水，少爷练完剑回来就能用。', '小桃说要给新花圃多浇点，我这就给她送一桶去。', '少爷，水缸满着呢，您可别再抢扁担了。']));
  };
  // 小桃：新花圃种什么
  const bedName = () => FLOWER[F().qz_bed] || '';
  async function askBed(first) {
    if (first) { await sayN('侍女小桃', '少爷！青禾姐门前石板路左边那块新花圃还空着呢——种什么好？'); await sayN('侍女小桃', '我想种点好看的，少爷路过一眼就能瞧见。'); }
    const i = await choose('种什么？', ['月季——一年开好几茬', '绣球——一团一团的', '菊花——秋天也开', first ? '你看着办' : '还是原来的吧']);
    const keys = ['rose', 'hydrangea', 'chrysanthemum'];
    let k = keys[i]; if (i === 3) { if (!first) return; k = 'rose'; }
    F().qz_bed = k; setBed();
    await narrate('小桃挽起袖子蹲下，三两下就把土翻松了。' + (i === 3 ? '她想了想，种下了一畦月季。' : ''));
    await sayN('侍女小桃', '过几天就能开了！到时候摘几朵给少爷屋里插瓶——青禾姐说，还要留一点做别的用。');
  }
  if (NPC.maid2) NPC.maid2.talk = async a => {
    const f = F();
    if (!f.qz_bed) { await askBed(true); return; }
    if (now() - TEA_T < 40) { await sayN('侍女小桃', '石桌上的茶刚沏好，少爷趁热喝一盏？'); return; }
    const i = await choose('侍女小桃', ['聊几句', '花圃换种别的花', '没事了']);
    if (i === 0) await sayN('侍女小桃', pick(['这些花得趁日头没上来浇，晌午再浇要伤根的。', bedName() + '开得可好了，少爷瞧见没？', '嘘——那块别踩，我才撒的花籽。', '我沏茶的手艺是管家教的，他说少爷小时候最爱喝竹叶青。']));
    else if (i === 1) await askBed(false);
  };
  // 青禾：白天
  if (NPC.maid1) NPC.maid1.talk = async a => {
    const f = F();
    if (!f.qz_qh1) { f.qz_qh1 = 1; await sayN('侍女青禾', '少爷早。西院的石桌我每天都擦——您练剑累了，就过去坐坐。'); await sayN('侍女青禾', '小桃沏的茶比我好，我就……管着把桌子擦干净。'); return; }
    await sayN('侍女青禾', pick(['竹叶一夜落一层，扫完这头，那头又落了。', '少爷练剑当心些，上回削下来的竹枝，我扫了一早上呢。', '我这几晚在绣个小玩意儿……少爷别问，还没好呢。', '管家交代了，院子得干干净净的，少爷带朋友回来才有面子。']));
  };
  // 青禾：夜里在自己屋里 —— 香囊
  const qhNight = ((TMAPS.qingzhu_room_qinghe || {}).npcs || []).find(x => x.name === '侍女青禾');
  if (qhNight) qhNight.talk = async a => {
    const f = F();
    if (f.qz_afu_help && f.qz_bed && !f.qz_sachet) {
      const fl = bedName() || '月季';
      await sayN('侍女青禾', '少爷……您来得正好。');
      await narrate('青禾从枕边的针线笸箩里拿出一只青缎小香囊，上头绣着几竿细竹，针脚密得看不出线头。');
      await sayN('侍女青禾', '里头是西院新开的' + fl + '，小桃摘了晒干的。我绣了三个晚上。');
      await sayN('侍女青禾', '阿福说……少爷那天替他挑水。我们没什么能谢少爷的，就这么个小东西。');
      await sayN('侍女青禾', '少爷出门在外，带着它——就当青竹小院一直跟着您。');
      ITEM_DB.acc_qz_sachet = ITEM_DB.acc_qz_sachet || { name: '青竹香囊', slot: 'acc', def: 4, maxhp: 60, desc: '' };
      ITEM_DB.acc_qz_sachet.desc = '青禾一针一线绣的香囊，里头装着西院的' + fl + '花瓣。佩在身上心神安定。防御 +4　气血 +60';
      addItem('acc_qz_sachet'); f.qz_sachet = 1; giveFx();
      try { if (window.itemGet) await itemGet([{ icon: 'item:acc_qz_sachet', name: '青竹香囊', count: '×1', desc: ITEM_DB.acc_qz_sachet.desc }], '青禾所赠'); else toast('获得：青竹香囊', 1800); } catch (e) { toast('获得：青竹香囊', 1800); }
      await sayN('星旋', '（……这丫头，手真巧。）');
      return;
    }
    if (f.qz_sachet) { await sayN('侍女青禾', pick(['香囊里的花味淡了就跟我说，再给您换新的。', '夜深了，少爷早些歇着。']));  return; }
    await sayN('侍女青禾', pick(['少爷怎么到下人房来了？屋里乱，您别嫌弃。', '我在绣个小玩意儿，还差一味花料……等西院的花开了就好了。', '明儿一早还得扫院子，我先歇了。']));
  };
  // 存档里拿到过香囊：物品库也要有（读档后）
  setTimeout(() => { try { if (F().qz_sachet && !ITEM_DB.acc_qz_sachet) ITEM_DB.acc_qz_sachet = { name: '青竹香囊', slot: 'acc', def: 4, maxhp: 60, desc: '青禾一针一线绣的香囊，里头装着西院的' + (bedName() || '月季') + '花瓣。佩在身上心神安定。防御 +4　气血 +60' }; } catch (e) {} }, 0);
  ITEM_DB.acc_qz_sachet = ITEM_DB.acc_qz_sachet || { name: '青竹香囊', slot: 'acc', def: 4, maxhp: 60, desc: '青禾一针一线绣的香囊，里头装着西院的花瓣。佩在身上心神安定。防御 +4　气血 +60' };

  // ---------- 四、能用的地方 ----------
  const spot = (map, name) => ((TMAPS[map] || {}).npcs || []).find(x => x.hidden && x.name === name);
  const healAll = (mpOnly) => {
    const h = S.hero; if (!mpOnly) h.hp = h.maxhp; h.mp = h.maxmp;
    try { for (const k of (S.party || [])) { const st = allyStats(k), a = allyState(k); if (!mpOnly) a.hp = st.maxhp; a.mp = st.maxmp; } } catch (e) {}
    giveFx();
  };
  let SOUP_T = -999;
  const stove = spot('qingzhu_kitchen', '灶台');
  if (stove) stove.talk = async () => {
    if (now() - SOUP_T < 90) { await narrate('锅里的莲子羹还温着，不过刚喝过一碗，撑得慌。'); return; }
    await narrate(night() ? '灶膛里压着余火，锅里温着一锅莲子羹。锅盖上压着一张字条：「给少爷留的，喝了早点歇。——小桃」' : '两口锅都烧着，一锅温水，一锅莲子羹。');
    const i = await choose('灶台', ['盛一碗', '不了']);
    if (i === 0) { SOUP_T = now(); healAll(false); await narrate('莲子炖得软糯，甜得刚好。一碗下肚，浑身都暖了。'); toast('气血、灵力都回满了', 1800); }
  };
  const caian = spot('qingzhu_kitchen', '菜案');
  if (caian) { const [c, r] = [160 / 64 - .5, 620 / 64 - .8]; caian.c = c; caian.r = r; caian.talk = ['蒸笼摞在案上，底下的竹篮里是今早刚摘的菜。'];
    caian.name = '菜案'; }
  const table = spot(COURT, '石桌竹椅');
  if (table) table.talk = async () => {
    if (now() - TEA_T < 40) { await narrate('石桌上一盏竹叶青还冒着热气，是小桃刚斟的。'); await narrate('叶孤星坐下慢慢喝完——茶香清冽，灵台一片清明。'); healAll(true); toast('灵力回满了', 1600); TEA_T = -99; return; }
    await narrate(pick(['下人们忙完活，常在这儿歇脚、说闲话。桌面擦得能照见竹影。', '石桌上落了一片竹叶。青禾待会儿准要来擦。']));
  };
  const well = spot(COURT, '水井');
  if (well) well.talk = async () => {
    const f = F();
    if (!f.qz_well) { f.qz_well = 1;
      await narrate('井沿的青石被绳子磨出了一道道浅槽。');
      await narrate('井台背面刻着一行小字，字迹已经有些旧了：「孤星三岁，扶此学步。」');
      await sayN('叶孤星·思', '……是爹的字。');
      await sayN('星旋', '（你爹这人，嘴上一句软话没有，倒把这些都刻下来了。）');
      return; }
    await narrate(night() ? '井水里浮着一轮月亮，晃一晃，又圆回去了。' : '井水清凉，打上来的水能照见人影。阿福每天一早从这儿挑水。');
  };

  // 西院新花圃按小桃种的花换图（月季 / 绣球 / 菊花，都是 Codex 方形花圃轻摆 8 帧）
  function setBed() {
    try { const T = world.map && world.mapName === COURT && world.map.T; if (!T) return; const k = F().qz_bed || 'rose';
      for (const ob of T.objs) if (ob.id === 'r136w_garden_5' && ob.r) { ob.r.an = 'flower_' + k + '_wind'; ob.r.img = 'c_flower_' + k + '_wind'; } } catch (e) {}
  }
  // 夜里头一回走进西院
  let nightTold = false;
  tileSetMap = (o => function (name) { const res = o.apply(this, arguments); try { if (name === COURT) { setBed(); for (const a of world.actors || []) if (a.npc && a.npc.r139) a._s = null; } } catch (e) {} return res; })(tileSetMap);
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) {
    o.apply(this, arguments);
    try { if (!nightTold && world.mapName === COURT && night() && world.player && world.player.x < -60 && !world.locked) { nightTold = true; toast('西院几扇窗还亮着灯，隐约听见青禾和小桃在屋里说笑。', 2600); } } catch (e) {}
  })(tileUpdate);
  window.R139 = { R, NPC, setBed, get tea() { return TEA_T; } };
})();
