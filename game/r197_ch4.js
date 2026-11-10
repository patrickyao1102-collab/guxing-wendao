// ================= R197 · 第四章「苍月炼魂」搬到地图上演（作者 11-11：「从幽影林出来以后去苍月城还都是插画剧情……所有插画剧情都删除」）=================
// 以前：cyScene（玄天城插画压暗）/ cellarScene（密室插画压红）上播旁白。现在全部在 Codex 的地图上演：
//   第三章末「同一时刻，苍月城」→ 苍月城南门府街夜里，林雪在东街被三个蒙面人堵住
//   第四章：南门进城 → 东街救林雪（入队）→ 卖豆腐的妇人 → 城主府正堂（泼茶、北斗剑诀）→ 出北门到白岩沉坛破封印（找阵眼）
//          → 地下一层阴湿密道（一层邪修、符锁石门前的邪修弟子、卖豆腐的汉子）→ 地下二层炼魂密室血阵 → 长老 → 收尾
// 进度存在 S.flags.ch4s：1 林雪入队（去城主府）/ 2 见过城主（出北门）/ 3 封印破了（下密道）/ 4 一层打过 / 5 弟子打过（下二层）/ 6 打完
(function () {
  if (typeof ch4Start !== 'function' || typeof TMAPS !== 'object' || !TMAPS.m_cy_gate || !TMAPS.m_xx_b2) return;
  const F = () => (S.flags = S.flags || {}), stg = () => F().ch4s || 0, setS = v => { F().ch4s = v; };
  const on = () => !!F().ch4 && !F().ch4_clear && stg() < 6;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const P = () => world.player;
  async function go(id, x, y, face) {
    tileSetMap('m_' + id, x / 64 - .5, y / 64 - .8, face || 'up'); S.scene = drawMap; S.hud = true; world.locked = true;
    for (let i = 0; i < 80 && !IMG['r107g_' + id]; i++) await wait(100);
  }
  const cam = (x, y) => { world.camFocus = x == null ? null : [x, y]; };
  const lookAt = (a, b) => { if (!a || !b) return; const dx = b.x - a.x, dy = b.y - a.y; a.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); if (dx) a.dir = dx > 0 ? 1 : -1; };
  const drop = (...as) => { world.actors = world.actors.filter(a => !as.includes(a)); };
  const fadeA = async (a, to) => { const f = a.alpha ?? 1; await tween(400, t => a.alpha = f + (to - f) * t); };
  const masked = () => ['n_xguard1', 'n_xguard2', 'n_xguard3'];

  // ---------- 第三章末：同一时刻，苍月城（夜）----------
  // 东街（南门府街右下那条横街）
  const ALLEY = { lx: 3050, ly: 2425 };
  async function linxueNight() {
    if (window.SET_TOD) SET_TOD('night');
    await go('cy_gate', 2700, 2440, 'right'); world.actors = world.actors.filter(a => a !== P());
    const hide = P().alpha; P().alpha = 0; (world.followers || []).forEach(f => f.alpha = 0);
    cam(ALLEY.lx, ALLEY.ly - 60);
    const lx = addActor('w_linxue', 2780, ALLEY.ly, '林雪', '#bff0ff'); lx.face = 'right';
    await fadeIn(800);
    await narrate('同一时刻，苍月城。');
    const w = moveActor(lx, ALLEY.lx, ALLEY.ly, 120);
    await narrate('夜深了，街上一个人影都没有。林雪走在空荡荡的东街上，脚步忽然一顿。'); await w;
    await say('林雪·坏笑', '……跟了我三条街了。出来吧。');
    const ms = [addActor(masked()[0], ALLEY.lx + 300, ALLEY.ly - 10, '蒙面人', '#9a8aa8'), addActor(masked()[1], ALLEY.lx - 320, ALLEY.ly + 10, '蒙面人', '#9a8aa8'), addActor(masked()[2], ALLEY.lx + 330, ALLEY.ly + 40, '蒙面人', '#9a8aa8')];
    ms.forEach(m => { m.alpha = 0; m.h = 118; });
    await Promise.all(ms.map(m => fadeA(m, 1)));
    await Promise.all([moveActor(ms[0], ALLEY.lx + 150, ALLEY.ly - 10, 160), moveActor(ms[1], ALLEY.lx - 160, ALLEY.ly + 10, 160), moveActor(ms[2], ALLEY.lx + 170, ALLEY.ly + 40, 160)]);
    ms.forEach(m => lookAt(m, lx)); lookAt(lx, ms[0]);
    await narrate('巷子两头，同时走出了三个蒙着面的黑影。');
    await fadeOut(900);
    drop(lx, ...ms); P().alpha = hide ?? 1; (world.followers || []).forEach(f => f.alpha = 1); cam(null);
    if (window.SET_TOD) SET_TOD('');
  }

  // ---------- 第四章 ----------
  const Q1 = '第四章 · 苍月炼魂：去城主府（正街尽头的传送法阵）', Q2 = '第四章 · 苍月炼魂：出北门，去北郊荒林找地底的入口',
    Q3 = '第四章 · 苍月炼魂：顺着石阶下到地底', Q4 = '第四章 · 苍月炼魂：救下被关的人，往深处的符锁石门走', Q5 = '第四章 · 苍月炼魂：下到炼魂密室';
  async function start() {
    const h = S.hero; if (h.lv < 14) { h.realm = '凝丹五重'; }
    if (!h.skills.includes('tunshi')) h.skills.push('tunshi');
    F().ch4 = 1; joinParty('yunting');
    await fadeOut(300); await bigTitle('第四章', '苍月炼魂', 3000);
    if (window.SET_TOD) SET_TOD('');
    // 1. 南门进城
    await go('cy_gate', 1920, 2880, 'up'); cam(1920, 2560);
    await fadeIn(800);
    const w = moveActor(P(), 1920, 2440, 150);
    await narrate('苍月城。比青阳镇还小的一座城，街上空荡荡的，一半的门窗都钉上了木板。'); await w;
    await narrate('墙上贴满了寻人启事——「寻夫」「寻子」「寻兄」，纸已经被雨水泡得发白。');
    await say('云霆·思', '这城里……失踪的人太多了。');
    // 2. 东街：林雪被围
    const lx = addActor('w_linxue', ALLEY.lx, ALLEY.ly, '林雪', '#bff0ff'); lx.face = 'right';
    const ms = [addActor(masked()[0], ALLEY.lx + 150, ALLEY.ly - 10, '蒙面人', '#9a8aa8'), addActor(masked()[1], ALLEY.lx - 160, ALLEY.ly + 10, '蒙面人', '#9a8aa8'), addActor(masked()[2], ALLEY.lx + 170, ALLEY.ly + 40, '蒙面人', '#9a8aa8')];
    ms.forEach(m => { m.h = 118; lookAt(m, lx); });
    cam(ALLEY.lx, ALLEY.ly - 40); S.shake = 4; try { playSnd('sfx_sword_ring', .6); } catch (e) {}
    await narrate('东街深处，传来兵刃相击的声音。');
    cam(1920, 2400); await say('叶孤星', '是剑气，冰系的——林雪师姐！');
    cam(null); await moveActor(P(), ALLEY.lx - 330, ALLEY.ly, 260); lookAt(P(), lx);
    await fadeOut(250);
    joinParty('linxue');
    let pr = startBattle({ title: '苍月城 · 东街', bg: 'bg_shandao', enemies: [maskedMan(), maskedMan(), maskedMan()], exp: 120, gold: 150 }); await fadeIn(250); await pr;
    S.scene = drawMap; drop(...ms); world.locked = true;
    // 林雪不认人（入队后地图上林雪跟在队里；剧情里先用单独的人站着，说完再收起）
    await moveActor(lx, P().x + 70, P().y, 260); lookAt(lx, P()); lookAt(P(), lx); cam(P().x + 40, P().y - 40);
    await narrate('最后一个蒙面人倒下的瞬间，一道冰冷的剑锋抵在了叶孤星的喉咙上。');
    await say('林雪·怒', '你们也是来抓人的？');
    await say('叶孤星', '师、师姐！是我，叶孤星！');
    await say('林雪·思', '叶孤星在宗门是练气六重，你身上的气息是凝丹五重。（剑锋又近了半寸）你是谁？');
    await say('星旋', '哈哈哈哈哈哈——');
    await say('云霆', '林师姐，他是叶孤星。黑风寨之后，他……突破得比较快。');
    await say('叶孤星', '什么叫比较快，明明是天赋异禀。');
    await say('云霆·坏笑', '嗯，灾星异禀。');
    await narrate('林雪盯着云霆看了一会儿，终于收起了剑。');
    await say('林雪·苦笑', '云霆不会撒谎。……抱歉。');
    await say('林雪', '我追查失踪案半个月了，一直没摸到正主。你们来得正好。');
    await say('叶孤星', '那就一起。');
    await say('林雪·笑', '好。剑在，人在。');
    await showPanel('林雪 加入队伍', ['!林雪 · 凝丹五重', '冰系 · 大招「大雪纷飞」', '天剑一式·点星 / 天剑二式·群星']);
    // 剧情里站着的林雪直接变成队伍里跟着走的那个
    if (!(world.followers || []).some(f => f.key === PARTY_DB.linxue.walk)) { const a = addActor(PARTY_DB.linxue.walk, lx.x, lx.y, PARTY_DB.linxue.name, '#9fd3ff'); a.h = 108; a.follower = (world.followers || []).length + 1; a.label = ''; a.face = lx.face; world.followers.push(a); }
    drop(lx);
    // 卖豆腐的妇人
    const tw = addActor('n_maiden', ALLEY.lx - 250, ALLEY.ly + 30, '卖豆腐的妇人', '#f0e0c0'); tw.h = 112; tw.alpha = 0; await fadeA(tw, 1); lookAt(tw, P()); lookAt(P(), tw);
    await narrate('巷口，一个卖豆腐的妇人抱着一张寻人启事，怯生生地看着他们。');
    await say('卖豆腐的妇人', '几位仙长……我男人半个月前出城收黄豆，再没回来……');
    const c1 = await choose('卖豆腐的妇人', ['「我们会把他找回来。」', '「……我们尽力。」']);
    if (c1 === 0) { F().ch4_tofu = 1; await say('卖豆腐的妇人', '谢谢仙长……谢谢……'); } else await say('卖豆腐的妇人', '……');
    await fadeA(tw, 0); drop(tw); cam(null);
    await say('林雪', '城主府在正街尽头，门前那道传送法阵直通府里。城主说抓了个探子，先去问问。');
    setS(1); S.quest = Q1; world.locked = false;
  }

  // 城主府正堂：见城主
  const council = TMAPS.m_cy_council, c0 = council.onEnter;
  council.onEnter = async function () {
    if (c0) await c0.apply(this, arguments);
    if (!on() || stg() !== 1) return;
    world.locked = true; await wait(300);
    cam(1040, 560); await moveActor(P(), 1000, 700, 160); P().face = 'up';
    await narrate('城主府正堂。苍月城主是个方脸短须的中年人，热情得有些过头。');
    await say('苍月城主·笑', '天剑宗的高徒！快请坐快请坐！来人，上茶！');
    const md = addActor('n_maiden', 1240, 640, '侍女', '#f0e0c0'); md.h = 112; lookAt(md, P());
    await moveActor(md, 1100, 690, 120);
    await narrate('侍女端茶时脚下一滑，一整壶滚烫的茶水朝云霆泼了过去——叶孤星想都没想，抬手就挡在了前面。');
    S.shake = 5; try { playSnd('sfx_hurt', .5); } catch (e) {}
    await say('叶孤星', '嘶——');
    await say('云霆·苦笑', '……你是不是傻。');
    await say('叶孤星', '手快，没过脑子。');
    await say('云霆·坏笑', '你哪回过脑子了。');
    await say('林雪·笑', '（低头喝茶）……两个傻子。');
    const mw = moveActor(md, 1300, 640, 160);
    await say('苍月城主·惊', '哎呀哎呀，失礼失礼！叶少侠这一手……好快的身法！敢问修的是什么功法？'); await mw; drop(md);
    await say('叶孤星', '呃……');
    await say('星旋', '（快！编一个！）');
    await say('叶孤星', '北、北斗剑诀。');
    await say('苍月城主·笑', '北斗剑诀！久仰久仰！（其实没听说过）');
    await say('星旋', '（哈哈哈哈哈北斗剑诀哈哈哈哈——）');
    await say('苍月城主', '说正事。我抓了一个炼魂谷的探子，审了三天，只问出两句：被抓的人关在城北地下，看守的长老，已经凝丹九重巅峰。');
    await say('苍月城主', '本城主凝丹七重……打不过，也破不开入口的阵法。');
    await say('苍月城主', '入口在北门外的荒林里，一块刻着血纹的大白石底下。几位……拜托了。');
    cam(null); setS(2); S.quest = Q2; world.locked = false;
  };

  // 北郊白岩沉坛：封印巨石——阵眼用八卦来找（地图上的残纹 / 阵眼两个调查点）
  const north = TMAPS.m_cy_north, n0 = north.onEnter;
  north.onEnter = async function () {
    if (n0) await n0.apply(this, arguments);
    if (!on() || stg() !== 2 || F().ch4_n) return; F().ch4_n = 1;
    world.locked = true;
    await narrate('北门外的荒林。林子正中一圈白岩围着一个深坑，坑底卧着一块一人多高的大石。');
    await say('林雪', '探子说的就是那块石头。石头底下，是空的。');
    S.quest = '第四章 · 苍月炼魂：去林中白岩坑底，查看那块大石'; world.locked = false;
  };
  // r107 阵眼调查点在「一击而下」之前问这里：答对卦象才能打碎
  async function eye() {
    if (!on()) return true;
    await say('星旋', '八卦锁魂阵。阵眼在「生门」——生门在东北方，属土，主止，山之象。');
    let ok = false, tries = 0;
    while (!ok) { const i = await choose('阵眼在哪一卦？', ['乾（天）', '坎（水）', '艮（山）', '震（雷）', '巽（风）', '离（火）', '坤（地）', '兑（泽）']);
      if (i === 2) ok = true; else { tries++; S.flash = .5; S.flashColor = '#ff3020'; S.shake = 8; await say('星旋', tries >= 2 ? '山！山之象！你是不是没听我说话！' : '不对！法阵反震了一下——再想想，「山之象」。'); } }
    await say('叶孤星', '（传音）云霆，艮位，第三道纹。');
    await narrate('云霆一步踏出，青霄剑出鞘，一剑点在阵纹上。整座法阵像玻璃一样碎成了漫天红光。');
    S.flash = .8; S.flashColor = '#ff7060'; S.shake = 10; try { playSnd('sfx_ult', .5); } catch (e) {}
    await say('林雪·惊', '……一剑？');
    if (!tries && typeof C3 === 'object' && C3.shard) C3.shard(1, '一次找对阵眼');
    if (stg() === 2) { setS(3); S.quest = Q3; }
    return true;
  }

  // 地下一层：一进来就撞上巡逻的邪修；符锁石门前守着邪修弟子
  const b1 = TMAPS.m_xx_b1, b10 = b1.onEnter;
  b1.onEnter = async function () {
    if (b10) await b10.apply(this, arguments);
    if (!on()) return;
    if (stg() === 3) {
      world.locked = true; await wait(300);
      await narrate('石阶下是一条长长的地道，阴湿的石壁上渗着水，两侧的木笼、刑柱后面关满了人，一个个面如死灰，灵力被抽得只剩一口气。');
      const es = [addActor(masked()[0], P().x - 90, P().y - 260, '邪修', '#9a8aa8'), addActor('e_corpse', P().x + 20, P().y - 300, '尸傀', '#8a9a8a'), addActor(masked()[2], P().x + 120, P().y - 250, '邪修', '#9a8aa8')];
      es.forEach(e => { e.h = e.key === 'e_corpse' ? 130 : 118; e.face = 'down'; });
      cam(P().x, P().y - 160); await say('邪修', '什么人？！'); await fadeOut(250);
      const pr = startBattle({ title: '地下密室 · 一层', bg: has('bg_cellar_b1') ? 'bg_cellar_b1' : K4.cellar(), enemies: [BEAST('xiexiu'), BEAST('corpse'), BEAST('xiexiu')], exp: 160, gold: 200 }); await fadeIn(250); await pr;
      S.scene = drawMap; drop(...es); cam(null);
      await say('林雪', '笼子里的人还活着。能救的先救——最里面那道符锁石门后面，才是他们的老巢。');
      setS(4); S.quest = Q4; world.locked = false;
    }
    if (stg() === 4) addDoor();
  };
  const DOOR = [592, 470];
  function addDoor() {
    if ((world.triggers || []).some(t => t._ch4d && !t.done)) return;
    addTrigger(DOOR[0], DOOR[1], 170, async () => {
      world.locked = true; world.path = null; P().moving = false;
      const dz = addActor('n_xguard2', DOOR[0], DOOR[1] - 150, '邪修弟子', '#c08aa8'); dz.h = 120; dz.face = 'down'; cam(DOOR[0], DOOR[1] - 60);
      await say('邪修弟子', '哪来的老鼠？长老正在闭关，谁也不许打扰！');
      await fadeOut(250);
      const pr = startBattle({ title: '邪修弟子', bg: has('bg_cellar_b1') ? 'bg_cellar_b1' : K4.cellar(), enemies: [cellarDisciple()], exp: 220, gold: 300 }); await fadeIn(250); await pr;
      S.scene = drawMap; drop(dz);
      if (F().ch4_tofu) {
        await narrate('石门边的铁笼里，一个憔悴的中年汉子缩在角落，手里还攥着半袋黄豆。');
        await say('叶孤星', '你是苍月城卖豆腐那家的？'); await say('???', '你、你怎么知道……'); F().ch4_tofu_saved = 1;
        await narrate('叶孤星一剑斩开了笼锁，让他先顺着石阶回城。'); }
      await narrate('符锁石门上的符纸，在弟子倒下的那一刻全都烧成了灰。门后，是往下的石阶。');
      cam(null); setS(5); S.quest = Q5; world.locked = false;
    }, true, true); world.triggers[world.triggers.length - 1]._ch4d = 1;
  }
  { const ex = (b1.exits || []).find(e => e.to === 'm_xx_b2'); if (ex) { const c = ex.cond; ex.cond = () => !(on() && stg() < 5) && (c ? c() : true); ex.msg = '石门上贴满了符纸，推不开——门前还有人守着'; } }
  { const G = TMAPS.m_cy_gate, ex = (G.exits || []).find(e => e.to === 'm_cy_north'); if (ex) { const c = ex.cond; ex.cond = () => !(on() && stg() < 2) && (c ? c() : true); ex.msg = '北门守兵：城主有令，天黑以后谁也不许出去。（先去城主府）'; } }
  setInterval(() => { try { if (world.mapName === 'm_xx_b1' && on() && stg() === 4 && !world.locked && typeof battle !== 'undefined' && !battle) addDoor(); } catch (e) {} }, 1000);   // 读档直接落在一层

  // 地下二层：血阵、魂灯、长老
  const b2 = TMAPS.m_xx_b2, b20 = b2.onEnter;
  b2.onEnter = async function () {
    if (b20) await b20.apply(this, arguments);
    if (!on() || stg() !== 5) return;
    world.locked = true; await wait(300);
    const C = [1280, 990];
    const el = addActor('e_elder', C[0], C[1], '炼魂谷长老', '#ff7a7a'); el.h = 200; el.face = 'down';
    const lamps = addFx({ life: 9999, layer: 1, draw(f) { if (world.mapName !== 'm_xx_b2' || F().ch4s >= 6) { f.t = f.life; return; } const t = performance.now() / 1000; ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .42, x = C[0] + Math.cos(a) * 130, y = C[1] - 120 + Math.sin(a) * 60 + Math.sin(t * 1.3 + i) * 6, g = ctx.createRadialGradient(x, y, 0, x, y, 26);
        g.addColorStop(0, 'rgba(160,255,180,.9)'); g.addColorStop(1, 'rgba(60,200,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill(); }
      ctx.restore(); } });
    cam(C[0], C[1] + 60); await moveActor(P(), C[0], C[1] + 330, 150); P().face = 'up';
    await narrate('二层。一座巨大的血色法阵在地面上缓缓转动，四周吊着几十个铁笼，笼里的人已经连哀嚎的力气都没有了。');
    await narrate('法阵中央，一个枯瘦的老者盘膝而坐，身后漂浮着七盏惨绿的魂灯。');
    await say('炼魂谷长老', '三个凝丹小辈……来得正好。本座离引魂，就差你们三颗灵丹。');
    await say('叶孤星', '那你可得有命拿。');
    await fadeOut(250);
    const cfg = elderBattleCfg(); const pr = startBattle(cfg); battle.phase = 1; battle.blood = true; bloodArrayFx(true); await fadeIn(250);
    toast('阴魂会不断复活——先打碎阵眼！', 2600);
    await pr;
    S.scene = drawMap; world.locked = true; el.face = 'down';
    await narrate('绝影刺穿了长老的丹田。叶孤星没有拔剑，纳月之力顺着剑身涌了进去——');
    await narrate('长老苦修百年的灵力，如江河倒灌。');
    S.flash = 1; S.flashColor = '#fff3c0'; playSnd('sfx_ult', .8);
    await C3.breakTo(16, '吞噬 · 突破凝丹七重');
    await say('星旋', '还剩点力气？星罗，加追魂——把剩下那些杂碎扫干净。');
    S.flash = .7; S.flashColor = '#cfe6ff'; S.shake = 8; try { playSnd('sfx_ult', .5); } catch (e) {}
    await narrate('星罗剑芒铺满了整个密室。片刻之后，所有邪修都躺在了地上。');
    await say('星旋', '星华丹两颗，200 点，救你那两个护法。……别瞪我，我打折了。');
    S.hero.points = Math.max(0, (S.hero.points || 0) - 200); partyRest();
    await fadeA(el, 0); drop(el);
    await narrate('奄奄一息的长老被收进了储物戒指。');
    await say('叶孤星', '炼魂谷在哪？');
    await say('炼魂谷长老·伤', '……云渺大陆西南……荒魂山脉……你们去了，也是送死……');
    setS(6);
    if (F().ch4_tofu_saved) {
      await fadeOut(600); await go('cy_gate', ALLEY.lx - 200, ALLEY.ly, 'right');
      const tw = addActor('n_maiden', ALLEY.lx - 80, ALLEY.ly, '卖豆腐的妇人', '#f0e0c0'); tw.h = 112; lookAt(tw, P()); cam(ALLEY.lx - 140, ALLEY.ly - 40); await fadeIn(600);
      await narrate('第二天，卖豆腐的妇人抱着丈夫哭了很久，然后硬塞给叶孤星一块磨得发亮的小石头。');
      await say('卖豆腐的妇人', '这是我们家祖上传下来的，说是天上掉下来的星星……仙长拿着！'); C3.shard(1, '豆腐娘子'); drop(tw); cam(null);
    }
    await fadeOut(800);
    // 反派插叙：荒魂山脉的魂灯（纯代码画，不是插画）
    S.hud = false; world.map = null;
    S.scene = () => { ctx.fillStyle = '#05030a'; ctx.fillRect(0, 0, W, H); const t = performance.now() / 1000; for (let i = 0; i < 7; i++) { const x = 340 + i * 100, y = 380 + Math.sin(t + i) * 10, a = i === 3 ? Math.max(0, 1 - (t % 6) / 2) : .8;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 40); g.addColorStop(0, `rgba(120,255,160,${a})`); g.addColorStop(1, 'rgba(60,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - 40, y - 40, 80, 80); } };
    await fadeIn(800);
    await narrate('荒魂山脉深处。一排魂灯里，有一盏，熄灭了。');
    await say('???', '苍月城那条线……断了？');
    await say('???', '天剑宗的小崽子。有意思。去查查，那个叫叶孤星的，修的到底是什么剑。');
    await fadeOut(900);
    world.locked = false; await ch4End();
  };

  ch4Start = start;
  window.R197CH4 = { linxueNight, start, eye, go };
  // 测试入口：?part=ch4b1 直接下密道 / ch4b2 直接进炼魂密室（不改原来的 ?part=ch4 / ch4boss）
  const q = new URLSearchParams(location.search).get('part');
  if (q === 'ch4b1' || q === 'ch4b2' || q === 'ch4boss') setTimeout(async () => {
    for (let i = 0; i < 100 && !(S.hero && world); i++) await wait(100);
    joinParty('yunting'); joinParty('linxue'); Object.assign(F(), { ch4: 1, ch4s: q === 'ch4b1' ? 3 : 5, cyn_fm: 2 }); S.started = true; S.fade = 1;
    const id = q === 'ch4b1' ? 'xx_b1' : 'xx_b2', st = TMAPS['m_' + id].start; tileSetMap('m_' + id, st[0], st[1], 'up'); S.scene = drawMap; S.hud = true;
    for (let i = 0; i < 80 && !IMG['r107g_' + id]; i++) await wait(100); await fadeIn(300); world.locked = true; await TMAPS['m_' + id].onEnter(); world.locked = false;
  }, 900);
})();
