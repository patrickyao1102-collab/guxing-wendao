// ================= R159 · 第一次下山（作者 11-08）=================
// 1) 叶擎苍在演武广场送别后（S.flags.ch2_jm），一路上演武广场 / 云阶松径 / 天剑山门的弟子都来祝贺少宗主（测灵碑一鸣惊人之后）：
//    走近会冒头顶气泡，点他们说话也是祝贺的话。到松风林道 ch2_jm 结束，恢复原来的对话。
// 2) 松风林道：Codex「晴岚迎客松」树下歇脚（原著第十一章《少年心事》开篇），两人席地而坐吃干粮聊天；之后往东继续下山进山外树林。
(function () {
  if (typeof TMAPS === 'undefined' || typeof tileSetMap !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const ROAD = /^tj_(front|yunjie|shanmen)$/;
  const POOL = ['少宗主，恭喜下山历练！', '测灵碑都被您打裂了，黑风寨算什么！', '少宗主一路顺风！', '等您凯旋，我们给您接风！', '天煞孤星？我看是天剑之星！',
    '少宗主，回来教我两招！', '云霆师兄，一路顺风！', '下山路上妖兽多，两位师兄当心。', '少宗主慢走——这回可别又在山下迷了路。', '师兄们都说您那一剑，十年难遇！', '少宗主保重，早去早回！', '一鸣惊人，这回该名扬四方了！', '少宗主威武！', '下山也别忘了给我们捎点好吃的！'];
  const BY = {
    '守碑长老': ['去吧。剑意在心，便不惧风雨。', '问剑碑上，迟早有你一道剑痕。'],
    '扫落叶的老仆': ['少宗主长大喽……老头子扫了四十年叶子，头一回见您下山。', '路上冷了记得添衣裳。'],
    '求道的少年': ['等我进了天剑宗，也要像您一样！'],   // 作者 11-11：删掉「您就是测灵碑上那位少宗主」
    '送儿子拜山的妇人': ['少侠一路平安。', '天剑宗的少宗主……果然一表人才。'],
    '歇脚的行商': ['少宗主下山？松风林道有狼，当心！', '到了青阳镇，报我名号……算了，报您的名号更好使。'],
    '山门执事': ['前方就是天剑山门，出了山门，就是青阳镇的地界了。', '少宗主今日出山——这一笔，我亲手记上。', '名册上写着：一等任务，黑风寨。祝少宗主旗开得胜！'],
  };
  let seq = 0; const pick = name => { const L = BY[name]; if (L) return L[(seq++) % L.length]; return POOL[(seq++ * 7 + (name || '').length) % POOL.length]; };
  const on = () => !!F().ch2_jm && ROAD.test(world.mapName || '');
  // ---------- 祝贺：说话 ----------
  function patchTalk() {
    for (const a of world.actors || []) { const n = a.npc; if (!n || n.hidden || !n.name || a === world.player || a.follower != null) continue;
      if (on()) { if (!('_cheer0' in n)) n._cheer0 = n.talk; const nm = n.name; n.talk = async () => { await say(nm, pick(nm)); }; }
      else if ('_cheer0' in n) { n.talk = n._cheer0; delete n._cheer0; } }
  }
  // ---------- 祝贺：走近冒气泡 ----------
  const said = new Set(); let lastMap = '';
  // 天剑山门六名守山弟子是画在图里的物件（不是人物）：按 Codex 站位冒气泡
  const GUARD = [[1510, 1360], [1946, 1360], [1510, 1530], [1946, 1530], [1510, 1700], [1946, 1700]];
  const bubs = [];   // {x,y,h,t,t0}
  setInterval(() => { try {
    if (!on() || !world.player) return; if (world.mapName !== lastMap) { lastMap = world.mapName; said.clear(); }
    if (world.locked || dialog || choice) return;
    const p = world.player, now = performance.now(), busy = bubs.filter(b => now - b.t0 < 2600).length;
    const cand = [];
    for (const a of world.actors || []) { const n = a.npc; if (!n || n.hidden || !n.name || a.hidden || a === world.player || a.follower != null) continue; cand.push({ k: 'a' + (n.name + a.home), x: a.x, y: a.y, h: (a.h || 113), name: n.name }); }
    if (world.mapName === 'tj_shanmen') GUARD.forEach(([x, y], i) => cand.push({ k: 'g' + i, x, y, h: 136, name: '守山弟子' }));
    for (const c of cand) { if (busy >= 2) break; if (said.has(c.k)) continue; if (Math.hypot(c.x - p.x, c.y - p.y) > 230) continue;
      said.add(c.k); bubs.push({ x: c.x, y: c.y, h: c.h, t: pick(c.name), t0: now + Math.random() * 300 }); }
  } catch (e) {} }, 250);
  tileAmbientHigh = (o => function (T, cam, now) {
    o && o.apply(this, arguments);
    try { const t = performance.now(); for (let i = bubs.length - 1; i >= 0; i--) { const b = bubs[i], u = (t - b.t0) / 2600; if (u >= 1) { bubs.splice(i, 1); continue; } if (u < 0 || !on()) continue; draw(b, u); } } catch (e) {}
  })(typeof tileAmbientHigh === 'function' ? tileAmbientHigh : null);
  function draw(b, u) {
    const al = Math.max(0, Math.min(1, u * 9, (1 - u) * 6)), pop = u < .08 ? .6 + .4 * (u / .08) : 1, z = typeof VZ === 'function' ? VZ() : 1;
    ctx.save(); ctx.translate(b.x, b.y - b.h - 44); ctx.scale(pop / z, pop / z); ctx.globalAlpha *= al;
    ctx.font = `700 22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(b.t).width + 28, h = 40;
    ctx.fillStyle = '#fff8ea'; ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h - 10, w, h, 12); ctx.moveTo(-8, -11); ctx.lineTo(0, 1); ctx.lineTo(8, -11); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff8ea'; ctx.fillRect(-7, -14, 14, 5); ctx.fillStyle = '#3a1a0a'; ctx.fillText(b.t, 0, -h / 2 - 10); ctx.restore();
  }
  // ---------- 松风林道：晴岚迎客松下歇脚 ----------
  const PINE = { show: false, im: {} };
  const getIm = k => (typeof IMG !== 'undefined' && IMG['sf143_' + k]) || null;
  async function pineRest() {
    const f = F(); if (f.sf_pine) return; f.sf_pine = 1; world.locked = true; S.hud = false; const p = world.player; if (p) p.moving = false;
    try {
      await say('云霆', '我们去那里休息片刻吧，顺便吃点东西再继续赶路。');
      await say('叶孤星', '正好，我也有些饿了。');
      await fadeOut(350);
      const hid = [p, ...(world.followers || [])].filter(Boolean); hid.forEach(a => { a._pa = a.alpha ?? 1; a._ph = a.hidden; a.alpha = 0; a.hidden = true; });
      PINE.show = true; await fadeIn(450);
      await narrate('两人来到树下，取出早已准备好的干粮和水囊，就着树荫坐了下来，边吃边聊。');
      await say('叶孤星', '说起来，这还是我第一次下山，十八年来，我都没踏出过天剑宗一步。');
      await say('云霆', '真看不出来，以你的性格，竟然能老老实实地待在宗门里这么多年。');
      await say('云霆·伤', '……我是从山下上来的。七岁那年土匪进村，爹娘把我从刀底下推了出去。');
      await say('叶孤星·笑', '……那这趟你跟紧点。天煞孤星，专克土匪。');
      await say('云霆·苦笑', '……你话真多。');
      await say('叶孤星·坏笑', '这叫活泼。');
      await say('云霆·苦笑', '这叫吵。');
      await fadeOut(350); PINE.show = false; hid.forEach(a => { a.alpha = a._pa; a.hidden = a._ph; }); await fadeIn(400);
    } finally { world.locked = false; S.hud = true; }
    S.quest = '松风林道：往东继续下山（山外树林）'; toast('往东走，继续下山', 2200);
  }
  tileAmbientHigh = (o => function (T, cam, now) {
    o && o.apply(this, arguments);
    if (!PINE.show || world.mapName !== 'tj_xiashan') return;
    try { for (const [k, x, y] of [['干粮与水囊', 1000, 2038], ['叶孤星_席地', 939, 2010], ['云霆_席地', 1046, 2017]]) { const im = getIm(k); if (!im) continue; ctx.drawImage(im, x - im.width / 2, y - im.height, im.width, im.height); } } catch (e) {}
  })(tileAmbientHigh);
  // 进图：说话改祝贺 / 松风林道的歇脚触发 / 第一次走到山外树林接剧情
  tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments);
    try {
      if (name === 'tj_xiashan' && F().ch2_jm) F().ch2_jm = 0;   // 剑鸣到此为止，换回松风林道的曲子
      setTimeout(patchTalk, 60);
      const f = F();
      if (name === 'tj_xiashan' && f.ch2_depart && !f.ch2_forest) {
        if (/前往松风林道|^下山：/.test(S.quest || '')) S.quest = f.sf_pine ? '松风林道：往东继续下山（山外树林）' : '松风林道：往前走走（西边的大松树下歇歇脚）';
        if (!f.sf_pine) setTimeout(() => { if (world.mapName === 'tj_xiashan') addTrigger(993, 2044, 130, pineRest); }, 300);
      }
      if (name === 'lin_forest' && f.ch2_depart && !f.ch2_forest && typeof ch2Forest === 'function') setTimeout(() => { if (!F().ch2_forest) ch2Forest(); }, 50);
    } catch (e) {}
    return r; })(tileSetMap);
  // 自动寻路
  { const R = window.QUEST_ROUTE; if (R && Array.isArray(R.RULES)) { R.RULES.unshift([/往东继续下山/, () => ({ map: 'lin_forest' })]); R.RULES.unshift([/大松树下歇歇脚/, () => ({ map: 'tj_xiashan', x: 993, y: 2044 })]); } }
})();

// 测试面板「叶擎苍送别·下山」：直接从演武广场南端送别开始（剑鸣 → 云阶松径 → 天剑山门 → 松风林道）
(() => { const q = new URLSearchParams(location.search).get('part'); if (q !== 'ch2send') return;
  setTimeout(async () => { const F = S.flags = S.flags || {}; Object.assign(F, { res_ch1: 1, ch1_free: 1, ch1_hunt_done: 1, ch2_night: 1, ch2_roam: 1, ch2_hall: 1, ch2_liuyun: 1, ch2_pill: 1, ch2_market: 1, ch2_seal_open: 1, hs_explored: 1 });
    const h = S.hero; h.skills = ['pojun', 'tanlang']; h.sword = true; h.realm = '凝丹二重'; if (h.lv < 12) h.lv = 12; h.maxhp = h.hp = Math.max(h.maxhp, 420); h.maxmp = h.mp = Math.max(h.maxmp, 140); h.atk = Math.max(h.atk, 52);
    if (typeof joinParty === 'function') joinParty('yunting');
    for (let i = 0; i < 100 && !(window.LOADING_ART_READY && LOADING_ART_READY()); i++) await new Promise(r => setTimeout(r, 100));   // 先等载入插画下好
    S.hero.learnQ = []; S.started = true; S.fade = 1; S.hud = true;
    // 先进演武广场、等地图载完淡入，再开始送别（以前直接在黑屏上就开始对话）
    tileSetMap('tj_front', 1792 / 64 - .5, 2200 / 64 - .8, 'down'); S.scene = drawMap; world.locked = true;
    for (let i = 0; i < 300 && !(window.MAP_READY && MAP_READY()); i++) await new Promise(r => setTimeout(r, 100));
    await fadeIn(500);
    try { await window.CH2_DEPART_GO(); } catch (e) { console.warn('ch2send', e); } }, 120); })();
