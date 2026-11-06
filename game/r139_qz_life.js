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
        await sayN('小厮阿福', '……少爷，您走一趟，阿福得走三趟。');
        await sayN('小厮阿福', '这事要让管家知道了，我可要挨骂的。您可千万别说出去！');
        await sayN('星旋', '（挑水也是练下盘，不亏。）');
        f.qz_afu_help = 1; giveFx(); toast('阿福偷偷记下了这份情', 1800);
      } else if (i === 1) {
        await sayN('小厮阿福', '那……那我就歇一口气，就一口！'); PAUSE.servant = now() + 12;
      }
      return;
    }
    await sayN('小厮阿福', pick(['少爷上回帮阿福挑水的事，阿福谁也没说——青禾姐还是知道了，笑了我半天。', '灶上烧着热水，少爷练完剑回来就能用。', '小桃说要给新花圃多浇点，我这就给她送一桶去。', '少爷，水缸满着呢，您可别再抢扁担了。']));
  };
  // 小桃：新花圃种什么
  const bedName = () => FLOWER[F().qz_bed] || '';
  async function askBed(first) {
    if (first) { await sayN('侍女小桃', '少爷！青禾姐门前石板路左边那块新花圃还空着呢——种什么好？'); await sayN('侍女小桃', '小桃想种点好看的，少爷路过一眼就能瞧见。'); }
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
    await sayN('侍女青禾', pick(['竹叶一夜落一层，扫完这头，那头又落了。', '少爷练剑当心些，上回削下来的竹枝，我扫了一早上呢。', '青禾这几晚在绣个小玩意儿……少爷别问，还没好呢。', '管家交代了，院子得干干净净的，少爷带朋友回来才有面子。']));
  };
  // 青禾：夜里在自己屋里 —— 香囊
  const qhNight = ((TMAPS.qingzhu_room_qinghe || {}).npcs || []).find(x => x.name === '侍女青禾');
  if (qhNight) qhNight.talk = async a => {
    const f = F();
    if (f.qz_afu_help && f.qz_bed && !f.qz_sachet) {
      const fl = bedName() || '月季';
      await sayN('侍女青禾', '少爷……您来得正好。');
      await narrate('青禾从枕边的针线笸箩里拿出一只青缎小香囊，上头绣着几竿细竹，针脚密得看不出线头。');
      await sayN('侍女青禾', '里头是西院新开的' + fl + '，小桃摘了晒干的。青禾绣了三个晚上。');
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

  // ================= 五、管家起名「松伯」+ 更多小事 =================
  // 作者 11-07：仙侠游戏，下人不自称奴婢 / 奴才（改成「我」「我们」，也会叫自己的名字；松伯也自称「我」）；管家起个名字 → 院里都叫他「松伯」
  const QZ = () => /^qingzhu_|^tj_room$/.test(world.mapName || '');
  try { if (typeof SPEAKERS === 'object') { SPEAKERS['管家'] = SPEAKERS['管家'] || { color: '#e8d7b0' }; SPEAKERS['松伯'] = SPEAKERS['管家']; } } catch (e) {}
  if (typeof say === 'function') say = (o => function (who, text, ...rest) {
    try { if (QZ()) { if (who === '管家') who = '松伯'; if (typeof text === 'string') text = text.replace(/管家/g, '松伯'); } } catch (e) {}
    return o.call(this, who, text, ...rest);
  })(say);
  for (const id of [COURT, 'qingzhu_steward_room']) for (const n of (TMAPS[id] && TMAPS[id].npcs) || []) if (n.name === '管家' && !n.hidden) {
    n.name = '松伯';
    if (id === COURT) { const t0 = n.talk; n.talk = async a => {
      const f = F();
      if (f.steward_met && !f.qz_song) { f.qz_song = 1;
        await say('松伯', '少爷回来了。西院那边，您去转过了？');
        await say('叶孤星', '转过了。松伯，西院那几间屋子是什么时候盖的？');
        await say('松伯', '去年开春。那块地原先荒着，宗主说——孤星大了，身边该有几个贴心的人，就让我盖了这几间屋子。');
        await say('松伯', '青禾是山下绣娘的女儿，手巧，心细；小桃是青阳镇卖花人家的丫头，见了花就走不动道。');
        await say('松伯', '阿福……是我那年冬天在山门外雪地里捡回来的。那会儿他才这么高，冻得话都说不出来。');
        await say('松伯', '三个孩子都是跟着少爷长大的。少爷待他们好，他们心里都记着。');
        await say('星旋', '（你这院子，倒比别处的宗门暖和。）');
        return; }
      return typeof t0 === 'function' ? t0(a) : say('松伯', '少爷回来了。');
    }; }
  }
  // 阿福夜里：想学写字
  const afuNight = ((TMAPS.qingzhu_room_afu || {}).npcs || []).find(x => x.name === '小厮阿福');
  if (afuNight) afuNight.talk = async a => {
    const f = F();
    if (!f.qz_afu_write) {
      await narrate('阿福趴在书案上，一笔一画地描账本上的字，描得满头大汗。');
      await say('小厮阿福', '少爷……您能教我写几个字吗？账本上的字，我都是照着松伯写的描下来的。');
      const i = await choose('教他写什么？', ['教他写「勤」——墙上那个', '教他写他自己的名字', '改天吧']);
      if (i === 2) { await say('小厮阿福', '那……改天！少爷说话算话啊。'); return; }
      f.qz_afu_write = i === 0 ? 'qin' : 'name';
      if (i === 0) { await narrate('叶孤星握着他的手，一笔一划写了个「勤」字。阿福盯着看了半天，又自己写了十几遍。'); await say('小厮阿福', '原来墙上那个字是这么写的！我天天看，一直不知道。'); }
      else { await narrate('叶孤星蘸了墨，在纸上写下「阿福」两个字。阿福捧着那张纸，看了又看。'); await say('小厮阿福', '这……这就是我的名字啊。'); await say('小厮阿福', '阿福要把它贴在床头。明儿记账，阿福也写自己的名字！'); }
      await say('星旋', '（教人写字比教人练剑还累。……不过这小子学得挺认真。）'); giveFx(); return;
    }
    await say('小厮阿福', pick([f.qz_afu_write === 'qin' ? '少爷教的那个「勤」字，我写在账本第一页了。' : '少爷，您看——账本上那行「阿福记」，是我自己写的！', '灶火我看着呢，少爷放心。', '今儿挑了好几趟水，胳膊都抬不起来啦。']));
  };
  // 小桃夜里
  const xtNight = ((TMAPS.qingzhu_room_xiaotao || {}).npcs || []).find(x => x.name === '侍女小桃');
  if (xtNight) xtNight.talk = async a => {
    const f = F(), fl = bedName();
    if (fl && !f.qz_xt_vase) { f.qz_xt_vase = 1;
      await say('侍女小桃', '少爷！您看——窗台上这瓶' + fl + '，是西院头一茬开的。');
      await say('侍女小桃', '明儿一早给您屋里送过去。青禾姐说，少爷屋里太素了，得有点颜色。');
      return; }
    await say('侍女小桃', pick(['嘘——青禾姐睡得浅。', '少爷要热水吗？灶上一直温着呢。', '明天要是不下雨，小桃就把西院的花都换盆土。']));
  };

  // ================= 六、厨房做饭小游戏 =================
  // 玩法：选菜谱 → 按菜谱顺序把食材下锅（点错扣一颗星）→ 看火候三次（指针扫到金色区域时点）→ 起锅。
  // 两颗星以上出菜（三颗星出两份），做好的菜放进行囊，战斗里也能吃。同一道菜行囊里最多放 5 份。
  // 素材：Codex R139（灶台近景、锅、冒泡、火候条、12 种食材、8 道菜）到了以后替换下面的占位画法（COOK_ART）。
  const RECIPES = [
    { id: 'cook_lianzi', name: '莲子羹', pot: 'soup', ing: ['莲子', '红枣', '蜂蜜'], hp: 260, mp: 60, desc: '莲子炖得软糯，甜得刚好。' },
    { id: 'cook_sun', name: '竹笋鲜汤', pot: 'soup', ing: ['竹笋', '香菇', '青菜'], hp: 340, mp: 0, desc: '后山新挖的竹笋，汤清味鲜。' },
    { id: 'cook_guihua', name: '桂花糕', pot: 'steam', ing: ['糯米', '桂花', '蜂蜜'], hp: 80, mp: 140, desc: '入口即化，满嘴桂花香。' },
    { id: 'cook_doufu', name: '青菜豆腐', pot: 'wok', ing: ['青菜', '豆腐'], hp: 220, mp: 30, desc: '家常小菜，清清白白。' },
    { id: 'cook_zhou', name: '香菇灵米粥', pot: 'soup', ing: ['灵米', '香菇', '山药'], hp: 420, mp: 80, desc: '灵米熬得开了花，暖胃养气。' },
    { id: 'cook_zao', name: '红枣山药汤', pot: 'soup', ing: ['红枣', '山药', '莲子'], hp: 300, mp: 110, desc: '补气养血，松伯最爱喝。' },
    { id: 'cook_dan', name: '香菇蒸蛋', pot: 'steam', ing: ['鸡蛋', '香菇'], hp: 200, mp: 90, desc: '蛋羹蒸得嫩滑，香菇提鲜，青禾的拿手菜。' },
  ];
  const ING = { 竹笋: '#c8b46a', 莲子: '#efe6c8', 红枣: '#b8322e', 桂花: '#f2b33c', 糯米: '#f4f1e6', 青菜: '#5fa84a', 豆腐: '#f1ead2', 香菇: '#8a5a36', 鸡蛋: '#f3d9a4', 灵米: '#d9e8f0', 山药: '#e8dcc4', 蜂蜜: '#e0a228' };
  for (const r of RECIPES) ITEM_DB[r.id] = Object.assign(ITEM_DB[r.id] || {}, { name: r.name, use: 'heal', hp: r.hp, mp: r.mp, price: 40, desc: '叶孤星亲手做的' + r.name + '。' + r.desc + '恢复 ' + r.hp + ' 气血' + (r.mp ? '、' + r.mp + ' 灵力' : '') });
  // —— Codex R139 厨房素材（灶台近景 / 三口锅 / 冒泡·翻炒·蒸汽·溅水·成菜金光 / 火候条 / 12 种食材 / 8 道菜）打成三张图 ——
  const CM = {"U":{"recipe_card":[0,0,300,420],"btn_cook":[0,1046,260,80],"btn_cook_pressed":[262,1046,260,80],"heat_bar":[558,1046,640,64],"heat_needle":[524,1046,32,80],"heat_ok_glow":[764,744,200,200],"cook_burnt":[966,744,192,192],"pot_wok":[342,744,420,260],"pot_soup":[962,422,360,300],"pot_steamer":[0,744,340,300],"ingredients_atlas":[0,422,960,320],"dishes_atlas":[302,0,768,384]},"FX":{"boil_8f":{"y":0,"fw":260,"fh":132,"n":8,"fps":8,"loop":true,"ax":130,"ay":66},"stirfry_8f":{"y":134,"fw":420,"fh":260,"n":8,"fps":8,"loop":true,"ax":210,"ay":215},"steam_8f":{"y":396,"fw":256,"fh":320,"n":8,"fps":6,"loop":true,"ax":128,"ay":286},"splash_6f":{"y":718,"fw":256,"fh":192,"n":6,"fps":12,"loop":false,"ax":128,"ay":155},"cook_success_8f":{"y":912,"fw":512,"fh":512,"n":8,"fps":12,"loop":false,"ax":256,"ay":256}},"P":{"pot_wok":{"ax":210,"ay":234,"mx":210,"my":112},"pot_soup":{"ax":180,"ay":276,"mx":180,"my":104},"pot_steamer":{"ax":170,"ay":280,"mx":170,"my":112}}};
  const CA = {}; let caReq = false;
  const ICK = { cook_lianzi: 0, cook_sun: 1, cook_guihua: 2, cook_doufu: 3, cook_zhou: 4, cook_zao: 5, cook_dan: 6 };
  const INGK = Object.keys(ING);   // 与食材图集顺序一致：竹笋 莲子 红枣 桂花 糯米 青菜 豆腐 香菇 鸡蛋 灵米 山药 蜂蜜
  function mkIcons() { const im = CA.cook_ui; if (!im || typeof IMG === 'undefined') return;
    const mk = (k, i, cols, sz, id) => { const c = document.createElement('canvas'); c.width = c.height = 128; const u = CM.U[k];
      c.getContext('2d').drawImage(im, u[0] + (i % cols) * sz, u[1] + Math.floor(i / cols) * sz, sz, sz, 0, 0, 128, 128); IMG['ic_' + id] = c; };
    INGK.forEach((n, i) => mk('ingredients_atlas', i, 6, 160, 'ing_' + i));
    for (const id in ICK) mk('dishes_atlas', ICK[id], 4, 192, id); }
  const needCook = () => { if (caReq) return; caReq = true;
    for (const k of ['cook_ui', 'cook_fx', 'cook_bg']) { const im = new Image(); im.onload = () => { CA[k] = im; if (k === 'cook_ui') mkIcons(); }; im.src = 'r139/' + k + '.webp'; } };
  setTimeout(needCook, 4000);
  // 行囊 / 获得物品里的图标：食材、菜肴用新图
  if (typeof itemIcon === 'function') itemIcon = (o => function (id, x, y, r) {
    const c = /^(cook_|ing_)/.test(id) && typeof IMG !== 'undefined' && IMG['ic_' + id];
    if (c) { ctx.drawImage(c, x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4); return; }
    return o.apply(this, arguments); })(itemIcon);
  const UI_ = (k, x, y, w, h) => { const u = CM.U[k], im = CA.cook_ui; if (!im) return false; ctx.drawImage(im, u[0], u[1], u[2], u[3], x, y, w == null ? u[2] : w, h == null ? u[3] : h); return true; };
  const ingCell = (n, x, y, s) => { const i = INGK.indexOf(n), u = CM.U.ingredients_atlas, im = CA.cook_ui; if (!im || i < 0) return; ctx.drawImage(im, u[0] + (i % 6) * 160, u[1] + Math.floor(i / 6) * 160, 160, 160, x, y, s, s); };
  const dishCell = (id, x, y, s) => { const i = ICK[id], u = CM.U.dishes_atlas, im = CA.cook_ui; if (!im || i == null) return; ctx.drawImage(im, u[0] + (i % 4) * 192, u[1] + Math.floor(i / 4) * 192, 192, 192, x, y, s, s); };
  const fxf = (k, fi, x, y, sc = 1) => { const f = CM.FX[k], im = CA.cook_fx; if (!im) return; ctx.drawImage(im, fi * f.fw, f.y, f.fw, f.fh, x - f.ax * sc, y - f.ay * sc, f.fw * sc, f.fh * sc); };
  const fxi = (k, t) => { const f = CM.FX[k]; return Math.floor(t * f.fps) % f.n; };
  const POTK = { soup: 'pot_soup', steam: 'pot_steamer', wok: 'pot_wok' }, POTN = { soup: '砂锅 · 慢炖', steam: '竹笼 · 清蒸', wok: '铁锅 · 快炒' };
  const MOUNT = [820, 505];
  const potAt = r => { const pk = POTK[r.pot], P = CM.P[pk], px = MOUNT[0] - P.ax, py = MOUNT[1] - P.ay; return { pk, px, py, mx: px + P.mx, my: py + P.my }; };
  let G = null;
  const BOARD = () => G.board.map((n, i) => ({ n, x: [100, 262, 424][i % 3], y: [360, 466][Math.floor(i / 3)], r: 52 }));
  const PICK = () => RECIPES.map((r, i) => { const row = i < 4 ? 0 : 1, k = row ? i - 4 : i, cx = row ? 460 + k * 180 : 370 + k * 180, cy = row ? 500 : 280; return { r, cx, cy, x: cx - 76, y: cy - 106, w: 152, h: 212 }; });
  const BTN_QUIT = { x: 20, y: 18, w: 170, h: 54 }, BTN_SERVE = { x: 690, y: 566, w: 260, h: 80 };
  const HB = { x: 500, y: 648 }, TR = { x: HB.x + 24, y: HB.y + 12, w: 592, h: 40 };
  const INK = '#4a2a12';
  function drawCook() {
    if (!G) return; const t = now(); needCook(); ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (CA.cook_bg) ctx.drawImage(CA.cook_bg, 0, 0, W, H); else { ctx.fillStyle = '#2a1d14'; ctx.fillRect(0, 0, W, H); }
    // 灶膛的火：跟着火候指针变旺 / 变弱
    const heat = G.phase === 'heat' ? G.needle : G.phase === 'pick' ? .25 : .5;
    ctx.globalCompositeOperation = 'lighter';
    const fg = ctx.createRadialGradient(820, 640, 8, 820, 640, 110 + heat * 150); fg.addColorStop(0, `rgba(255,150,60,${.12 + heat * .4 + .05 * Math.sin(t * 11)})`); fg.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = fg; ctx.fillRect(560, 420, 520, 300); ctx.globalCompositeOperation = 'source-over';
    const r = G.r;
    if (r) { const p = potAt(r);
      UI_(p.pk, p.px, p.py);
      if (G.phase === 'end' && !G.win) { UI_('cook_burnt', p.mx - 96, p.my - 150);
        for (let k = 0; k < 6; k++) { const ph = ((t - G.endT) * .7 + k / 6) % 1; ctx.fillStyle = `rgba(40,34,30,${.45 * (1 - ph)})`; ctx.beginPath(); ctx.ellipse(p.mx - 30 + k * 12 + Math.sin(t * 2 + k) * 14, p.my - 60 - ph * 200, 22 + ph * 40, 16 + ph * 26, 0, 0, 7); ctx.fill(); } }
      else {
        if (r.pot === 'soup' && G.added > 0) fxf('boil_8f', fxi('boil_8f', t), p.mx, p.my);
        if (r.pot === 'wok') { if (G.phase === 'heat' || G.phase === 'serve' || G.phase === 'end') fxf('stirfry_8f', fxi('stirfry_8f', t), p.mx, p.my);
          else for (let k = 0; k < G.added; k++) ingCell(r.ing[k], p.mx - 70 + k * 60, p.my - 44 + Math.sin(t * 4 + k) * 2, 76); }
        if (r.pot !== 'wok' && G.added > 0) { ctx.globalAlpha = r.pot === 'steam' ? .95 : .7; fxf('steam_8f', fxi('steam_8f', t), p.mx, p.my - 6); ctx.globalAlpha = 1; }
        if (G.splT != null) { const f = CM.FX.splash_6f, k = Math.floor((t - G.splT) * f.fps); if (k < f.n) fxf('splash_6f', k, p.mx, p.my); else G.splT = null; } }
      if (G.fly) { const q = Math.min(1, (t - G.fly.t0) / .38), x = G.fly.x + (p.mx - G.fly.x) * q, y = G.fly.y + (p.my - 24 - G.fly.y) * q - Math.sin(q * Math.PI) * 150, s = 110 * (1 - .4 * q);
        ingCell(G.fly.n, x - s / 2, y - s / 2, s); if (q >= 1) { G.fly = null; G.splT = t; } }
      if (G.phase === 'end' && G.win) { const f = CM.FX.cook_success_8f, k = Math.min(f.n - 1, Math.floor((t - G.endT) * f.fps));
        fxf('cook_success_8f', k, p.mx, p.my - 90); const q = Math.min(1, (t - G.endT) / .45), s = 120 + 90 * q; dishCell(r.id, p.mx - s / 2, p.my - 90 - 80 * q - s / 2, s); }
    }
    // 标题、提示
    if (r) { ctx.font = `46px ${BRUSH}`; textOutline('西院厨房 · ' + r.name, 640, 58, '#ffe7b0', '#2a1406', 6); }
    const hint = G.phase === 'pick' ? '' : G.phase === 'add' ? '照菜谱的顺序，把案板上的食材下锅' : G.phase === 'heat' ? '看火候 ' + (G.round + 1) + ' / 3：指针走到亮的那段时点一下' : G.phase === 'serve' ? '火候到了——起锅！' : '';
    if (hint) { ctx.font = `600 24px ${FONT}`; textOutline(hint, 640, 112, '#fbefd5', '#2a1406', 4); }
    // 菜谱卡
    if (r) { const cx = 1052, cy = 14, s = .7; UI_('recipe_card', cx, cy, 300 * s, 420 * s); const mx = cx + 105;
      ctx.font = `32px ${BRUSH}`; ctx.fillStyle = INK; ctx.fillText(r.name, mx, cy + 52);
      ctx.font = `600 15px ${FONT}`; ctx.fillStyle = '#8a6a48'; ctx.fillText(POTN[r.pot], mx, cy + 82);
      ctx.strokeStyle = 'rgba(120,80,40,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 34, cy + 96); ctx.lineTo(cx + 176, cy + 96); ctx.stroke();
      r.ing.forEach((n, i) => { const y = cy + 124 + i * 44, done = i < G.added; ctx.globalAlpha = done ? .45 : 1; ingCell(n, cx + 38, y - 20, 40);
        ctx.textAlign = 'left'; ctx.font = `600 22px ${FONT}`; ctx.fillStyle = done ? '#5a7a3a' : INK; ctx.fillText((done ? '✓ ' : (i + 1) + '　') + n, cx + 84, y); ctx.textAlign = 'center'; ctx.globalAlpha = 1; });
      ctx.font = `26px ${FONT}`; ctx.fillStyle = '#b0602a'; ctx.fillText('★'.repeat(G.stars) + '☆'.repeat(3 - G.stars), mx, cy + 262); }
    // 选菜：七张小菜谱
    if (G.phase === 'pick') { ctx.fillStyle = 'rgba(18,10,4,.45)'; ctx.fillRect(0, 0, W, H);
      ctx.font = `44px ${BRUSH}`; textOutline('做 什 么 菜', 640, 126, '#ffe7b0', '#2a1406', 6);
      for (const c of PICK()) { const l = window.R139_LACK ? R139_LACK(c.r) : [], full = itemCount(c.r.id) >= 5, ok = !l.length && !full;
        UI_('recipe_card', c.x, c.y, c.w, c.h); ctx.globalAlpha = ok ? 1 : .55; dishCell(c.r.id, c.cx - 56, c.cy - 100, 112); ctx.globalAlpha = 1;
        ctx.font = `26px ${BRUSH}`; ctx.fillStyle = INK; ctx.fillText(c.r.name, c.cx, c.cy + 30);
        ctx.font = `600 14px ${FONT}`; ctx.fillStyle = '#8a6a48'; ctx.fillText(c.r.ing.join(' · '), c.cx, c.cy + 56);
        ctx.font = `600 15px ${FONT}`; ctx.fillStyle = full ? '#8a6a48' : l.length ? '#b0402a' : '#4f7a2e';
        ctx.fillText(full ? '行囊里还有' : l.length ? '缺' + l.join('、') : '✓ 料齐', c.cx, c.cy + 80); } }
    // 案板上的食材
    if (G.phase === 'add') for (const b of BOARD()) { ingCell(b.n, b.x - 56, b.y - 60 + Math.sin(t * 2 + b.x) * 1.5, 112);
      ctx.font = `600 19px ${FONT}`; textOutline(b.n, b.x, b.y + 44, '#fff3d6', '#2a1406', 4); }
    // 火候条
    if (G.phase === 'heat' || G.phase === 'serve') { UI_('heat_bar', HB.x, HB.y);
      if (G.phase === 'heat') { const [a0, a1] = G.zone; ctx.fillStyle = `rgba(255,244,200,${.32 + .18 * Math.sin(t * 8)})`; ctx.fillRect(TR.x + TR.w * a0, TR.y, TR.w * (a1 - a0), TR.h);
        ctx.fillStyle = 'rgba(255,252,235,.95)'; ctx.fillRect(TR.x + TR.w * a0 - 1, TR.y - 3, 3, TR.h + 6); ctx.fillRect(TR.x + TR.w * a1 - 1, TR.y - 3, 3, TR.h + 6); }
      UI_('heat_needle', TR.x + TR.w * G.needle - 16, HB.y + 60 - 77);
      if (G.hitT != null && t - G.hitT < .5) { const q = (t - G.hitT) / .5, s = 120 + 80 * q; ctx.globalAlpha = 1 - q; UI_('heat_ok_glow', G.hitX - s / 2, HB.y + 32 - s / 2, s, s); ctx.globalAlpha = 1; }
      ctx.font = `30px ${BRUSH}`; textOutline('文火', HB.x - 40, HB.y + 32, '#cfe0ff', '#14202e', 4); textOutline('武火', HB.x + 680, HB.y + 32, '#ffb0a0', '#2e1410', 4); }
    if (G.phase === 'serve') { const pr = G.pressT != null && t - G.pressT < .15; UI_(pr ? 'btn_cook_pressed' : 'btn_cook', BTN_SERVE.x, BTN_SERVE.y + (pr ? 2 : 0));
      ctx.font = `38px ${BRUSH}`; textOutline('起　锅', BTN_SERVE.x + 130, BTN_SERVE.y + 41 + (pr ? 2 : 0), '#fff3d6', '#3a1a06', 5); }
    if (G.msg && t - G.msgT < 1.3) { ctx.font = `40px ${BRUSH}`; textOutline(G.msg, 640, 196, G.msgOk ? '#ffe08a' : '#ff9a8a', '#2a1406', 6); }
    // 不做了
    if (G.phase !== 'end') { UI_('btn_cook', BTN_QUIT.x, BTN_QUIT.y, BTN_QUIT.w, BTN_QUIT.h) || panel(BTN_QUIT.x, BTN_QUIT.y, BTN_QUIT.w, BTN_QUIT.h);
      ctx.font = `600 22px ${FONT}`; textOutline('不做了', BTN_QUIT.x + BTN_QUIT.w / 2, BTN_QUIT.y + BTN_QUIT.h / 2 + 1, '#fff3d6', '#3a1a06', 4); }
    ctx.restore();
  }
  if (S.overlay) S.overlay.push({ draw() { try { drawCook(); } catch (e) {} } });
  // 做饭界面开着时，点击直接截下来（不让地图 / 小地图 / 行囊按钮抢走）
  const TAPS = [];
  try { cv.addEventListener('pointerdown', e => { if (!G) return; const q = toLogical(e); TAPS.push(q); e.stopImmediatePropagation(); e.preventDefault(); }, true); } catch (e) {}
  const takeTap = () => TAPS.shift() || null;
  const flash = (m, ok) => { G.msg = m; G.msgOk = ok; G.msgT = now(); try { playSnd(ok ? 'ui_confirm' : 'sfx_hurt', .5); } catch (e) {} };
  async function cookGame() {
    needCook();
    G = { r: null, phase: 'pick', stars: 3, added: 0, round: 0, needle: .5, zone: [.42, .64] };
    world.locked = true; const hud0 = S.hud; S.hud = false; TAPS.length = 0;
    const close = () => { G = null; S.hud = hud0; world.locked = false; };
    let r = null;
    while (!r) { await nextFrame(); const tp = takeTap(); if (!tp) continue; if (inR(tp, BTN_QUIT)) { close(); return; }
      for (const c of PICK()) if (inR(tp, c)) { const l = window.R139_LACK ? R139_LACK(c.r) : [];
        if (itemCount(c.r.id) >= 5) flash('行囊里的' + c.r.name + '还有好几份呢', false);
        else if (l.length) flash('还缺' + l.join('、') + '——集市灶膳摊有卖', false);
        else r = c.r; break; } }
    const deco = INGK.filter(n => !r.ing.includes(n)).sort(() => Math.random() - .5).slice(0, 6 - r.ing.length);
    Object.assign(G, { r, board: r.ing.concat(deco).sort(() => Math.random() - .5), phase: 'add', msg: null });
    let quit = false;
    while (G.phase === 'add') { await nextFrame(); const tp = takeTap(); if (!tp) continue;
      if (inR(tp, BTN_QUIT)) { quit = true; break; }
      for (const b of BOARD()) if (Math.hypot(tp.x - b.x, tp.y - b.y) < b.r + 12) {
        if (b.n === r.ing[G.added]) { G.added++; G.board = G.board.filter(n => n !== b.n); G.fly = { n: b.n, x: b.x, y: b.y, t0: now() }; flash('下锅！', true);
          if (G.added >= r.ing.length) { await sleep(450); G.phase = 'heat'; G.t0 = now(); } }
        else { G.stars = Math.max(0, G.stars - 1); flash(r.ing.includes(b.n) ? '顺序不对——' + r.ing[G.added] + '先放' : b.n + '可不是这道菜的料', false); }
        break; } }
    const widths = [.2, .15, .11];
    while (!quit && G.phase === 'heat') { await nextFrame(); const sp = 1.3 + G.round * .45; G.needle = (Math.sin((now() - G.t0) * sp * 2.2) + 1) / 2;
      const tp = takeTap(); if (!tp) continue; if (inR(tp, BTN_QUIT)) { quit = true; break; }
      const [a0, a1] = G.zone;
      if (G.needle >= a0 && G.needle <= a1) { flash('火候正好！', true); G.hitT = now(); G.hitX = TR.x + TR.w * G.needle; }
      else { G.stars = Math.max(0, G.stars - 1); flash(G.needle < a0 ? '火小了' : '火大了', false); }
      G.round++; if (G.round >= 3) { G.phase = 'serve'; break; }
      const c = .3 + Math.random() * .4, w = widths[G.round]; G.zone = [c - w / 2, c + w / 2]; G.t0 = now() - Math.random() * 2; }
    while (!quit && G.phase === 'serve') { await nextFrame(); const tp = takeTap(); if (!tp) continue; if (inR(tp, BTN_QUIT)) { quit = true; break; }
      if (inR(tp, BTN_SERVE)) { G.pressT = now(); try { playSnd('ui_confirm', .5); } catch (e) {} await sleep(160); G.phase = 'end'; } }
    if (quit) { close(); return; }
    const stars = G.stars; G.win = stars >= 2; G.endT = now();
    try { if (window.R139_USEING) R139_USEING(r); } catch (e) {}
    await sleep(G.win ? 1300 : 1600); close(); world.locked = true;
    if (stars >= 2) {
      const n = stars === 3 ? 2 : 1; addItem(r.id, n); try { giveFx(); } catch (e) {}
      try { if (window.itemGet) await itemGet([{ icon: 'item:' + r.id, name: r.name, count: '×' + n, desc: ITEM_DB[r.id].desc }], stars === 3 ? '火候十足 · 三星' : '出锅'); else toast('做好了：' + r.name + ' ×' + n, 1800); } catch (e) { toast('做好了：' + r.name + ' ×' + n, 1800); }
      if (!F().qz_cook1) { F().qz_cook1 = 1;
        await narrate('香味飘出厨房，没一会儿，门口探进来三个脑袋。');
        await say('侍女小桃', '少爷亲自下厨？！……能、能尝一口吗？');
        await narrate('小桃尝了一口，眼睛一下子亮了。');
        await say('侍女小桃', '比我做的还好吃！青禾姐你快尝尝！');
        await say('侍女青禾', '……是好吃。少爷以后别抢小桃的活了，她要哭的。');
        await say('小厮阿福', '我也要我也要——');
        await say('星旋', '（修仙的手，拿来颠勺，倒也稳。）'); }
    } else {
      await narrate('锅底冒出一股黑烟……这锅' + r.name + '，糊了。');
      await say('星旋', '（噗——小子，你这火候，比你出剑还猛。）');
    }
    world.locked = false;
  }
  window.R139_COOK = cookGame; window.R139_G = () => G && { G, board: G.board ? BOARD() : [], pick: PICK() };
  if (stove) stove.talk = async () => {
    await narrate(night() ? '灶膛里压着余火，锅里温着一锅莲子羹。锅盖上压着一张字条：「给少爷留的，喝了早点歇。——小桃」' : '两口锅都烧着，一锅温水，一锅莲子羹。案上的竹篮里，菜和料都备齐了。');
    const i = await choose('灶台', ['盛一碗莲子羹', '自己下厨做点吃的', '不了']);
    if (i === 0) { if (now() - SOUP_T < 90) { await narrate('刚喝过一碗，撑得慌。'); return; } SOUP_T = now(); healAll(false); await narrate('莲子炖得软糯，甜得刚好。一碗下肚，浑身都暖了。'); toast('气血、灵力都回满了', 1800); }
    else if (i === 1) await cookGame();
  };


  // ================= 七、食材（天剑宗集市「灶膳摊」买）+ 菜肴「食补」=================
  // 作者 11-07：菜回气血、灵力，怒气做成特殊玩法；食材去天剑宗交易集市买。
  // 食补：吃一道菜（行囊里「使用」）当场回气血 / 灵力，并记下「食补」——接下来 3 场战斗，开局全队怒气 +N（不同菜 N 不同，后吃的顶掉先吃的）。
  const INGS = ['竹笋', '莲子', '红枣', '桂花', '糯米', '青菜', '豆腐', '香菇', '鸡蛋', '灵米', '山药', '蜂蜜'];
  const ING_PRICE = { 竹笋: 12, 莲子: 15, 红枣: 10, 桂花: 18, 糯米: 10, 青菜: 6, 豆腐: 8, 香菇: 14, 鸡蛋: 8, 灵米: 30, 山药: 16, 蜂蜜: 20 };
  const ING_ID = n => 'ing_' + INGS.indexOf(n);
  INGS.forEach((n, i) => { ITEM_DB[ING_ID(n)] = Object.assign(ITEM_DB[ING_ID(n)] || {}, { name: n, price: ING_PRICE[n], sell: Math.round(ING_PRICE[n] / 2), cat: '食材', desc: '做菜用的食材。天剑宗集市灶膳摊有卖，拿到青竹西院厨房的灶台上做菜。' }); });
  const RAGE = { cook_lianzi: 20, cook_sun: 30, cook_guihua: 20, cook_doufu: 10, cook_zhou: 40, cook_zao: 30, cook_dan: 20 };
  for (const r of RECIPES) { const d = ITEM_DB[r.id]; d.rage = RAGE[r.id]; d.desc = '叶孤星亲手做的' + r.name + '。' + r.desc + '恢复 ' + r.hp + ' 气血' + (r.mp ? '、' + r.mp + ' 灵力' : '') + '；食补：之后 3 场战斗开局全队怒气 +' + d.rage; }
  // 做菜前先看料够不够（错点不耗料，做成才扣）
  const lack = window.R139_LACK = r => r.ing.filter(n => itemCount(ING_ID(n)) < 1);
  const useIng = window.R139_USEING = r => { for (const n of r.ing) { const id = ING_ID(n); S.hero.bag[id]--; if (S.hero.bag[id] <= 0) delete S.hero.bag[id]; } };
  // 第一次站到灶台前：小桃给一份「试手」的料
  const starter = async () => { if (F().qz_ing0) return; F().qz_ing0 = 1;
    for (const n of ['莲子', '红枣', '蜂蜜', '竹笋', '香菇', '青菜', '豆腐', '鸡蛋']) addItem(ING_ID(n), 2);
    await say('侍女小桃', '少爷要下厨？灶边这篮料先拿去试手——莲子、红枣、竹笋、豆腐都有。');
    await say('侍女小桃', '用完了就去天剑宗集市，灶膳摊的大娘什么都卖，报青竹小院的名号还能便宜点。');
    toast('获得：一篮试手的食材', 1800); };
  // 行囊里吃菜：吃饱了也能吃（为了食补）
  if (typeof useItemOn === 'function') useItemOn = (o => function (id, who) {
    const d = ITEM_DB[id]; if (!d || !/^cook_/.test(id)) return o.apply(this, arguments);
    if (!itemCount(id)) return;
    const h = S.hero; h.bag[id]--; if (!h.bag[id]) delete h.bag[id];
    let tgt; if (who === 'hero' || !who) tgt = h; else { try { const a = allyState(who), st = allyStats(who); tgt = { get hp() { return a.hp; }, set hp(v) { a.hp = v; }, get mp() { return a.mp; }, set mp(v) { a.mp = v; }, maxhp: st.maxhp, maxmp: st.maxmp }; } catch (e) { tgt = h; } }
    tgt.hp = Math.min(tgt.maxhp, tgt.hp + (d.hp || 0)); tgt.mp = Math.min(tgt.maxmp, tgt.mp + (d.mp || 0));
    F().meal = { id, name: d.name, rage: d.rage || 10, left: 3 };
    try { playSnd('sfx_heal'); } catch (e) {}
    toast('吃了' + d.name + '　食补：接下来 3 场战斗开局怒气 +' + (d.rage || 10), 2400);
    if (!itemCount(id) && S.menu) S.menu.sel = null;
  })(useItemOn);
  // 开战：食补生效（全队怒气）
  let mealB = null;
  if (typeof drawBattle === 'function') drawBattle = (o => function () {
    try { const b = typeof battle !== 'undefined' && battle; const m = F().meal;
      if (b && b !== mealB) { mealB = b; if (m && m.left > 0) { m.left--; const us = (b.heroes || (b.units || []).filter(u => u.side === 'hero')).filter(u => u.alive !== false); if (!us.length && b.P) us.push(b.P);
          for (const u of us) { u.rage = Math.min(100, (u.rage || 0) + m.rage); try { floatText(u.x, u.y - (u.h || 200) - 30, '怒气 +' + m.rage, '#ffb24a', 34); } catch (e) {} }
          try { toast('食补 · ' + m.name + '：全队怒气 +' + m.rage + (m.left ? '（还剩 ' + m.left + ' 场）' : '（食补用完了）'), 2200); } catch (e) {}
          if (m.left <= 0) F().meal = null; } } } catch (e) {}
    return o.apply(this, arguments);
  })(drawBattle);
  // 天剑宗集市：灶膳摊
  if (TMAPS.tj_market) { const [c, r] = [(2276 + 300) / 64 - .5, (3285 - 60) / 64 - .8];
    TMAPS.tj_market.npcs.push({ key: 'none', cx: 'kitchen_helper', c, r, h: 118, wander: false, name: '灶膳摊大娘', r139stall: 1,
      shop: INGS.map(ING_ID),
      talk: async () => { await say('灶膳摊大娘', pick(['新鲜的竹笋、山里的香菇、今早才摘的青菜——要什么自己挑！', '青竹小院来的？小桃那丫头常来我这儿买莲子，说少爷爱喝莲子羹。', '灵米贵是贵了点，熬粥可补人了。'])); } }); }
  tileSetMap = (o => function (name) { const res = o.apply(this, arguments);
    try { if (name === 'tj_market') { const T = world.map.T, a = (world.actors || []).find(x => x.npc && x.npc.r139stall);
      if (a && typeof canStand === 'function' && !canStand(T, a.x, a.y)) { let best = null;
        for (let d = 16; d < 400 && !best; d += 16) for (let k = 0; k < 16 && !best; k++) { const x = a.x + Math.cos(k / 16 * 6.283) * d, y = a.y + Math.sin(k / 16 * 6.283) * d; if (canStand(T, x, y)) best = [x, y]; }
        if (best) { a.x = best[0]; a.y = best[1]; } } } } catch (e) {}
    return res; })(tileSetMap);
  // 做菜入口改成要料
  const cook0 = cookGame;
  window.R139_COOK = async function () { await starter(); return cook0(); };
  if (stove) stove.talk = async () => {
    await narrate(night() ? '灶膛里压着余火，锅里温着一锅莲子羹。锅盖上压着一张字条：「给少爷留的，喝了早点歇。——小桃」' : '两口锅都烧着，一锅温水，一锅莲子羹。');
    const i = await choose('灶台', ['盛一碗莲子羹', '自己下厨做点吃的', '不了']);
    if (i === 0) { if (now() - SOUP_T < 90) { await narrate('刚喝过一碗，撑得慌。'); return; } SOUP_T = now(); healAll(false); await narrate('莲子炖得软糯，甜得刚好。一碗下肚，浑身都暖了。'); toast('气血、灵力都回满了', 1800); }
    else if (i === 1) await window.R139_COOK();
  };

  // ================= 八、松伯的传送玉符：可上下滑的地点列表（作者 11-07：传送可以下拉；Codex 画专门的界面，到了替换 TP_ART）=================
  const CUR = { qingzhu_court: '青竹小院', tj_front: '演武广场', tj_hall: '天剑大殿', qingzhu_upper_pavilion: '云海大亭', tj_houshan: '天剑后山', tj_scripture: '藏经阁', tj_market: '天剑宗集市', tj_xiashan: '松风林道',
    qy_town: '青阳镇', lin_manor: '林府', lin_court: '林府 · 曲水花庭', lin_forest: '林外山林', hf_valley: '黑风谷', xt_city: '玄天城', xt_manor: '城主府', xt_auction: '玄元拍卖场', xt_wanbao: '万宝楼', ly_ridge: '落云岭 · 外岭' };
  const NO_TP = /room|kitchen|steward|servant|vip|treasury|recovery|escape|rescue|defense|shelter|seal|forbidden|_b1|_b2|council|study|bedroom|guest|guiying|cave|valley$|library|camp/;
  const REG = id => /^(tj_|qingzhu_)/.test(id) ? '天剑宗' : /^(qy_|lin_)/.test(id) ? '青阳镇' : /^hf_/.test(id) ? '黑风谷' : /^xt_/.test(id) ? '玄天城' : /^ly_/.test(id) ? '落云岭' : /^m_cy/.test(id) ? '苍月城' : /^m_(yy|nw)/.test(id) ? '秘境' : '其他';
  const REGS = ['全部', '天剑宗', '青阳镇', '黑风谷', '玄天城', '落云岭', '苍月城', '秘境', '其他'];
  function tpList() { const v = F().visited || {}, out = [];
    for (const id in TMAPS) { if (!v[id] || !TMAPS[id]) continue; if (!CUR[id] && (TMAPS[id].indoor || NO_TP.test(id))) continue;
      const nm = CUR[id] || String(TMAPS[id].title || id).replace(/^天剑宗 · /, ''); out.push({ id, name: nm, reg: REG(id), here: id === world.mapName }); }
    const order = Object.keys(CUR); out.sort((a, b) => (REGS.indexOf(a.reg) - REGS.indexOf(b.reg)) || ((order.indexOf(a.id) + 1 || 99) - (order.indexOf(b.id) + 1 || 99))); return out; }
  const spawnOf = id => { const d = TMAPS[id]; if (!d) return null; if (d.start) return d.start; if (d.arrive) { const v = Object.values(d.arrive)[0]; if (v) return v; }
    const B = typeof CXB2 !== 'undefined' && CXB2[id]; if (B && typeof atIn === 'function') return atIn(id, ...(B.spawn || [B.w / 2, B.h * .7])); return null; };
  window.TP_ART = window.TP_ART || {};
  let TP = null;
  const TPB = { x: 160, y: 26, w: 960, h: 668 }, LIST = { x: 400, y: 150, w: 680, h: 400 }, ROWH = 78;
  const tpBtn = () => ({ go: { x: TPB.x + TPB.w / 2 - 160, y: TPB.y + TPB.h - 104, w: 240, h: 58 }, close: { x: TPB.x + TPB.w / 2 + 96, y: TPB.y + TPB.h - 104, w: 120, h: 58 } });
  const tabR = i => ({ x: TPB.x + 56, y: TPB.y + 126 + i * 48, w: 172, h: 42 });
  const tpRows = () => TP.list.filter(e => TP.reg === '全部' || e.reg === TP.reg);
  // 字体：标题、按钮用毛笔行楷（马善政），地名、页签用清雅的小薇体（ZCOOL XiaoWei），都预先载好再画（画布不会自己去下载网页字体）
  const TF = '"Ma Shan Zheng","STKaiti","KaiTi",serif', NF = '"ZCOOL XiaoWei","Noto Serif SC","Songti SC","STSong",serif';
  try { if (!document.querySelector('link[data-r139font]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.r139font = 1; l.href = 'https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&family=Ma+Shan+Zheng&display=swap'; document.head.appendChild(l); } } catch (e) {}
  const fontsReady = () => { try { document.fonts.load('40px "Ma Shan Zheng"', '传送玉符松伯关闭'); document.fonts.load('30px "ZCOOL XiaoWei"', '青竹小院演武广场天剑大殿云海大亭后山藏经阁集市松风林道青阳镇林府黑风谷玄天城落云岭苍月城秘境全部你在这里'); } catch (e) {} };
  fontsReady();
  const LS = (px) => { try { ctx.letterSpacing = px; } catch (e) {} };
  function seal(x, y, s, ch) { ctx.save(); ctx.translate(x, y); ctx.rotate(-.04); ctx.fillStyle = '#b3382c'; roundRect(-s / 2, -s / 2, s, s, 4); ctx.fill(); ctx.strokeStyle = 'rgba(255,235,220,.6)'; ctx.lineWidth = 1; roundRect(-s / 2 + 3, -s / 2 + 3, s - 6, s - 6, 3); ctx.stroke();
    ctx.font = `${Math.round(s * .62)}px ${TF}`; ctx.fillStyle = '#fff4ea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 1); ctx.restore(); }
  // 仙侠版面：金边宣纸大框（升级面板同款 lvp）+ 白玉列表条（获得物品框同款 igf2）+ Codex 地图徽章（r135c/mapicons）
  const UIK = {}; const uik = k => UIK[k] || (UIK[k] = (() => { const im = new Image(); im.src = k; return im; })());
  const ok = im => im && im.complete && im.naturalWidth;
  const MI = { temple: 0, mountain: 1, bamboo: 2, market: 3, town: 4, forest: 5, cave: 6, realm: 7, waterside: 8, estate: 9, inn: 10, library: 11 };
  const iconOf = id => /^qingzhu_/.test(id) ? (id === 'qingzhu_upper_pavilion' ? 'estate' : 'bamboo') : id === 'tj_scripture' ? 'library' : id === 'tj_market' ? 'market' : /^tj_(houshan|xiashan)/.test(id) ? 'mountain' : /^tj_/.test(id) ? 'temple'
    : id === 'qy_town' || id === 'xt_city' ? 'town' : /^lin_(manor|court)/.test(id) || id === 'xt_manor' ? 'estate' : /forest|^ly_/.test(id) ? 'forest' : /^hf_/.test(id) ? 'mountain' : /^xt_(auction|wanbao)/.test(id) ? 'market'
    : /^m_cy/.test(id) ? 'waterside' : /^m_(nw|yy)/.test(id) ? 'realm' : 'cave';
  // 横向九宫：左 L、右 R 像素不拉伸，中间拉伸
  function slice3(im, x, y, w, h, L, R) { if (!ok(im)) return false; const s = h / im.height, l = L * s, r = R * s;
    ctx.drawImage(im, 0, 0, L, im.height, x, y, l, h); ctx.drawImage(im, L, 0, im.width - L - R, im.height, x + l, y, w - l - r, h); ctx.drawImage(im, im.width - R, 0, R, im.height, x + w - r, y, r, h); return true; }
  // 作者 11-07：要白色、仙侠，不要金灿灿的网游元宝风 → 素白玉框（获得物品框同一套 igf2：云纹回纹白玉边、宣纸心），顶上用底边翻过来当题签
  function frame(x, y, w, h) { const B = uik('igf2/frame_bottom.webp'), M = uik('igf2/frame_body_tile.webp'); if (!ok(B) || !ok(M)) { panel(x, y, w, h); return; }
    const s = w / B.width, bh = B.height * s;
    ctx.save(); ctx.translate(x, y + bh); ctx.scale(1, -1); ctx.drawImage(B, 0, 0, w, bh); ctx.restore();
    ctx.drawImage(M, x, y + bh - 2, w, h - bh * 2 + 4); ctx.drawImage(B, x, y + h - bh, w, bh); }
  function drawTP() {
    if (!TP) return; const A = window.TP_ART, rows = tpRows(), t = now();
    ctx.save(); ctx.fillStyle = 'rgba(14,20,26,.5)'; ctx.fillRect(0, 0, W, H);
    if (A.frame) ctx.drawImage(A.frame, TPB.x, TPB.y, TPB.w, TPB.h); else frame(TPB.x - 20, TPB.y - 10, TPB.w + 40, TPB.h + 20);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `50px ${TF}`; LS('6px'); ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillText('传送玉符', TPB.x + TPB.w / 2 + 2, TPB.y + 66); ctx.fillStyle = '#2b2924'; ctx.fillText('传送玉符', TPB.x + TPB.w / 2, TPB.y + 64); LS('0px');
    seal(TPB.x + TPB.w / 2 + 128, TPB.y + 70, 30, '松');
    ctx.font = `17px ${NF}`; LS('4px'); ctx.fillStyle = '#8b877c'; ctx.fillText('松伯替少爷记着的路 · 上下滑动翻看', TPB.x + TPB.w / 2, TPB.y + 104); LS('0px');
    // 地区页签（白玉小牌；选中换金牌）
    const regs = REGS.filter(r => r === '全部' || TP.list.some(e => e.reg === r)); TP.regs = regs;
    regs.forEach((r, i) => { const R0 = tabR(i), on = TP.reg === r, im = uik('igf2/button_normal.webp');
      if (!slice3(im, R0.x, R0.y, R0.w, R0.h, 56, 56)) { ctx.fillStyle = '#f1ede4'; roundRect(R0.x, R0.y, R0.w, R0.h, 20); ctx.fill(); }
      if (on) { ctx.save(); ctx.fillStyle = 'rgba(96,150,134,.22)'; roundRect(R0.x + 6, R0.y + 5, R0.w - 12, R0.h - 10, 16); ctx.fill(); ctx.strokeStyle = 'rgba(70,120,108,.7)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
      ctx.font = `${on ? 23 : 21}px ${NF}`; LS('2px'); ctx.fillStyle = on ? '#2f5a50' : '#5c584e'; ctx.fillText(r, R0.x + R0.w / 2, R0.y + R0.h / 2 + 2); LS('0px'); });
    // 列表（白玉条，可滑）
    const maxS = Math.max(0, rows.length * ROWH - LIST.h); TP.scroll = Math.max(0, Math.min(maxS, TP.scroll)); TP.maxS = maxS;
    ctx.save(); ctx.beginPath(); ctx.rect(LIST.x - 6, LIST.y, LIST.w + 6, LIST.h); ctx.clip();
    const RW = uik('igf2/reward_row.webp'), MIC = uik('r135c/mapicons.webp');
    rows.forEach((e, i) => { const y = LIST.y + i * ROWH - TP.scroll; if (y < LIST.y - ROWH || y > LIST.y + LIST.h) return; const on = TP.sel === e.id, rw = LIST.w - 26, rh = ROWH - 6;
      ctx.globalAlpha = e.here ? .62 : 1;
      if (!slice3(RW, LIST.x, y + 3, rw, rh, 236, 44)) { ctx.fillStyle = '#efe3c8'; roundRect(LIST.x, y + 3, rw, rh, 12); ctx.fill(); }
      if (on) { ctx.save(); ctx.shadowColor = 'rgba(120,190,170,.8)'; ctx.shadowBlur = 14; ctx.strokeStyle = `rgba(78,138,122,${.75 + .2 * Math.sin(t * 4)})`; ctx.lineWidth = 2.5; roundRect(LIST.x + 2, y + 5, rw - 4, rh - 4, 12); ctx.stroke(); ctx.restore(); }
      const ix = LIST.x + 44 * rh / 70, iy = y + 3 + rh / 2, ir = rh * .36;
      if (ok(MIC)) { const k = MI[iconOf(e.id)]; ctx.save(); ctx.beginPath(); ctx.arc(ix, iy, ir, 0, 7); ctx.clip(); ctx.drawImage(MIC, (k % 4) * 128, Math.floor(k / 4) * 128, 128, 128, ix - ir * 1.12, iy - ir * 1.12, ir * 2.24, ir * 2.24); ctx.restore(); }
      ctx.textAlign = 'left'; ctx.font = `31px ${NF}`; LS('3px'); ctx.fillStyle = '#2f2c26'; ctx.fillText(e.name, LIST.x + 104, iy); LS('0px');
      ctx.textAlign = 'right'; ctx.font = `17px ${NF}`; LS('2px'); ctx.fillStyle = e.here ? '#a24a3a' : '#8b877c'; ctx.fillText(e.here ? '你在这里' : e.reg, LIST.x + rw - 30, iy); LS('0px'); ctx.textAlign = 'center'; ctx.globalAlpha = 1; });
    ctx.restore();
    if (!rows.length) { ctx.font = `24px ${NF}`; ctx.fillStyle = '#8b877c'; ctx.fillText('这一带还没去过。', LIST.x + LIST.w / 2, LIST.y + 80); }
    // 滚动条（细金线 + 玉珠）
    if (maxS > 0) { const tx = LIST.x + LIST.w - 10, th = Math.max(44, LIST.h * LIST.h / (rows.length * ROWH)), ty = LIST.y + (LIST.h - th) * (TP.scroll / maxS);
      ctx.strokeStyle = 'rgba(120,116,104,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, LIST.y + 6); ctx.lineTo(tx, LIST.y + LIST.h - 6); ctx.stroke();
      const g = ctx.createLinearGradient(tx - 5, 0, tx + 5, 0); g.addColorStop(0, '#e8f0ea'); g.addColorStop(1, '#9ab8ae'); ctx.fillStyle = g; roundRect(tx - 5, ty, 10, th, 5); ctx.fill(); }
    // 按钮
    const B2 = tpBtn(), sel = tpRows().find(e => e.id === TP.sel), can = !!sel && !sel.here;
    ctx.globalAlpha = can ? 1 : .5; if (!slice3(uik('igf2/button_normal.webp'), B2.go.x, B2.go.y, B2.go.w, B2.go.h, 56, 56)) panel(B2.go.x, B2.go.y, B2.go.w, B2.go.h);
    if (can) { ctx.save(); ctx.fillStyle = 'rgba(96,150,134,.2)'; roundRect(B2.go.x + 8, B2.go.y + 7, B2.go.w - 16, B2.go.h - 14, 18); ctx.fill(); ctx.restore(); }
    ctx.font = `30px ${TF}`; LS('2px'); ctx.fillStyle = '#2f5a50'; ctx.fillText(can ? '传送 · ' + sel.name.slice(0, 5) : '传 送', B2.go.x + B2.go.w / 2, B2.go.y + B2.go.h / 2 + 2); ctx.globalAlpha = 1;
    if (!slice3(uik('igf2/button_normal.webp'), B2.close.x, B2.close.y, B2.close.w, B2.close.h, 56, 56)) panel(B2.close.x, B2.close.y, B2.close.w, B2.close.h);
    ctx.font = `28px ${TF}`; ctx.fillStyle = '#5c584e'; ctx.fillText('关 闭', B2.close.x + B2.close.w / 2, B2.close.y + B2.close.h / 2 + 2); LS('0px');
    
    ctx.restore();
  }
  if (S.overlay) S.overlay.push({ draw() { try { drawTP(); } catch (e) {} } });
  try {
    cv.addEventListener('pointerdown', e => { if (!TP) return; const q = toLogical(e); TP.down = { x: q.x, y: q.y, s: TP.scroll, moved: false }; e.stopImmediatePropagation(); e.preventDefault(); }, true);
    cv.addEventListener('pointermove', e => { if (!TP || !TP.down) return; const q = toLogical(e), dy = q.y - TP.down.y; if (Math.abs(dy) > 6) TP.down.moved = true; if (TP.down.moved && inR(TP.down, LIST)) TP.scroll = TP.down.s - dy; }, true);
    window.addEventListener('pointerup', e => { if (!TP || !TP.down) return; const d = TP.down; TP.down = null; if (!d.moved) TP.tap = { x: d.x, y: d.y }; }, true);
    cv.addEventListener('wheel', e => { if (!TP) return; TP.scroll += e.deltaY * .8; e.preventDefault(); }, { passive: false, capture: true });
  } catch (e) {}
  async function tpMenu() {
    const list = tpList();
    if (list.filter(e => !e.here).length < 1) { await say('松伯', '少爷，您去过的地方还太少，我的传送符记不住路。等您走过的地方多了再说。'); return; }
    fontsReady(); TP = { list, reg: '全部', scroll: 0, sel: null, tap: null }; world.locked = true; const hud0 = S.hud; S.hud = false; let go = null;
    try { playSnd('ui_open'); } catch (e) {}
    for (;;) { await nextFrame(); const t = TP.tap; if (!t) continue; TP.tap = null; const B2 = tpBtn();
      if (inR(t, B2.close)) break;
      if (inR(t, B2.go)) { const e = tpRows().find(e => e.id === TP.sel); if (e && !e.here) { go = e; break; } continue; }
      const ti = (TP.regs || []).findIndex((r, i) => inR(t, tabR(i))); if (ti >= 0) { TP.reg = TP.regs[ti]; TP.scroll = 0; try { playSnd('ui_click'); } catch (e) {} continue; }
      if (inR(t, LIST)) { const i = Math.floor((t.y - LIST.y + TP.scroll) / ROWH), e = tpRows()[i]; if (e) { if (TP.sel === e.id && !e.here) { go = e; break; } TP.sel = e.id; try { playSnd('ui_click'); } catch (e2) {} } } }
    TP = null; S.hud = hud0;
    if (!go) { world.locked = false; return; }
    const sp = spawnOf(go.id); if (!sp) { world.locked = false; toast('那里暂时去不了'); return; }
    try { playSnd('sfx_star', .6); } catch (e) {} S.flash = .5; S.flashColor = '#cfe6ff';
    await fadeOut(400); tileSetMap(go.id, sp[0], sp[1], 'down'); S.scene = drawMap; S.hud = true;
    await fadeIn(400); world.locked = false; toast('已传送到：' + go.name, 1600);
  }
  window.R139_TP = tpMenu;
  // 松伯的「传送到去过的地方」换成新列表：拦下他对话里的那个 choose
  if (typeof choose === 'function') choose = (o => function (title, opts) {
    try { if (QZ() && (title === '管家' || title === '松伯') && Array.isArray(opts) && opts[0] === '传送到去过的地方') return o.call(this, '松伯', opts).then(i => i === 0 ? tpMenu().then(() => 2) : i); } catch (e) {}
    return o.apply(this, arguments);
  })(choose);

  window.R139 = { R, NPC, setBed, get tea() { return TEA_T; } };
})();