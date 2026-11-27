// ================= R422 · 万妖塔：故事回放 + 镇妖图卷（只进测试版）=================
// 作者 11-27：「每一层的关底 BOSS，你都可以给他设计一个故事……击败他以后，就可以看整个的故事情节」
//            「最好做一个……让玩家有期待，第二层是什么，第三层什么……不一定非要叫图志……你自己开动脑筋。」
// 故事：剧本 Claude 写、Gemini 润色（作者看过），一句旁白配一张画（Codex R419 的故事画；画没到之前用 R416 图卷上的画像），画面慢推、交叉淡入。
// 镇妖图卷：玉佩第三页（原来的「试炼」）改成九幅卷轴（Codex R416）。没打通的层只有剪影、一道封条、一句谜面；打通了卷轴展开成画像，点开重看故事。
(function () {
  if (typeof S === 'undefined' || typeof cv === 'undefined') return;
  const F = () => (S.flags = S.flags || {});
  const ART = {}; function art(src) { let a = ART[src]; if (!a) { a = ART[src] = { im: new Image(), ok: false }; a.im.onload = () => { a.ok = true; }; a.im.onerror = () => { a.bad = true; }; a.im.src = src; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(a.im); } catch (e) {} } return a.ok ? a.im : null; }
  const SCROLL = (n, open) => 'r416/floor' + n + (open ? '_open' : '_sealed') + '.webp?v=1';
  const STORYPIC = (n, k) => 'r419/f' + n + '_story_' + k + '.webp?v=1';
  const NAME = ['', '彼岸花精 · 绛蘅', '白虎之魂 · 玄锋', '沉渊龙女 · 霁月', '堕凰 · 焚羽', '负山古龟 · 玄岳', '幽冥帝君 · 殷无赦', '', '', ''];
  const RIDDLE = ['', '花开不见叶，梦里有人等。', '北关不破，十九碗酒倒扣雪中。', '沉渊之下，有一轮不照人间的月。', '焚尽一身羽，只为再飞一回。', '负山万载，背上是谁的家国？', '幽冥有帝，赦与不赦，只在一念。', '封印未启，其名不可知。', '封印未启，其名不可知。', '塔顶没有门，只有一道光。'];
  // ---------- 故事（[画, 谁, 话]：画 = 's' 卷轴画像 / 数字 = 第几张故事画 / null = 不换） ----------
  const STORY = {
    1: [['s', '绛蘅', '我原本……只是开在死人堆里的一朵花。'],
      [1, '', '很多年前，这里是连打了三年仗的古战场。仗打完了，却没人来收尸。'],
      [2, '', '次年开春，白骨堆上开出了一片血红的花——花开时不见叶，叶生时花已落。'],
      [3, '', '直到某天，一个妇人抱着只小绣鞋走进花海，跪在泥里求：「让我再见他一面，就一面。」'],
      [4, '', '花听见了。它织出一场梦，让她在梦里亲手给孩子穿上了那只鞋。'],
      [5, '', '打那以后，寻来的人越来越多。他们心甘情愿躺下，把醒着时的苦，一点一点全交给了她。'],
      [6, '', '她把那些苦全吞了下去。吞得越多，她越像个人；越像个人，她越分不清自己是在渡人，还是在吃人。'],
      ['s', '绛蘅', '……你说，我究竟是妖，还是菩萨？'],
      [null, '叶孤星', '（沉默片刻）人是自己走进来的。可你，从没劝过一个人回头。'],
      [null, '绛蘅', '（轻笑一声，眼角滑落的泪在半空化作花瓣）……是啊。我舍不得。'],
      [7, '', '她化作漫天花雨散开。花海随之退去，露出一地安详沉睡的人影，渐渐化作点点微光，飘向塔外。']],
    2: [[1, '', '上古年间，北关外起了一场前所未有的妖潮，潮里裹着能蚀人心智的魔瘴。'],
      [2, '', '守关的是一缕白虎之魂，带着麾下十九名虎卫。他们在关外血战七天七夜，杀退了妖潮。'],
      [3, '', '可魔瘴已顺着伤口钻进了骨髓。他们心里清楚，用不了几日，自己就会变成比妖潮更疯魔的东西。'],
      [4, '', '玄锋站在关外，对着城楼上的守军吼出了最后一道军令：「落闸！」'],
      [5, '', '铁闸落下的那一夜，他拍开一坛庆功酒，斟满十九碗，一碗一碗倒扣在雪地里。'],
      [6, '', '后来，城空了，关也废了。只有关外那道孤影始终立在风雪里，谁敢靠近，便杀谁。'],
      ['s', '玄锋', '……闸门后头，真的没有人了？'],
      [null, '叶孤星', '没有了。你要护的人，全都平平安安地走了。'],
      [null, '玄锋', '（沉默良久）……那就好。'],
      [7, '', '他将断戟深深插进雪地，身形化作一阵风雪消散。漫天大雪随之停歇。']] };
  const AFTER = { 1: [['星旋', '……都走了。小子，发什么呆，上头还有八层呢。']], 2: [['云霆', '……是个好兵。'], ['星旋', '小子，把那块腰牌收好了。这塔里镇着的家伙，往后一个比一个难缠。']] };
  // ---------- 放映 ----------
  const V = { on: false, cur: null, prev: null, t0: 0 };
  function pic(n, k) { if (k === 's') return art(SCROLL(n, true)); const im = art(STORYPIC(n, k)); return im || art(SCROLL(n, true)); }
  function drawPic(im, a, t) { if (!im || a <= 0) return; ctx.save(); ctx.globalAlpha = a; const wide = im.width / im.height > 1.3, z = 1 + Math.min(t, 9) * .006;
    if (wide) { const s = Math.max(1280 / im.width, 720 / im.height) * z, w = im.width * s, h = im.height * s; ctx.drawImage(im, 640 - w / 2, 330 - h / 2, w, h); }
    else { const s = 660 / im.height * z, w = im.width * s, h = im.height * s; ctx.drawImage(im, 640 - w / 2, 300 - h / 2, w, h); }
    ctx.restore(); }
  const overlay = { draw() { if (!V.on) return; const now = performance.now() / 1000, t = now - V.t0, k = Math.min(1, t / .7);
    ctx.save(); ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, 1280, 720);
    if (V.prev && k < 1) drawPic(V.prev.im(), 1 - k, now - V.prev.t0);
    if (V.cur) drawPic(V.cur.im(), k, t);
    const g = ctx.createLinearGradient(0, 480, 0, 720); g.addColorStop(0, 'rgba(5,6,8,0)'); g.addColorStop(1, 'rgba(5,6,8,.85)'); ctx.fillStyle = g; ctx.fillRect(0, 480, 1280, 240);
    ctx.restore(); } };
  function show(n, k) { const now = performance.now() / 1000; V.prev = V.cur; V.cur = { im: () => pic(n, k), t0: now }; V.t0 = now; }
  async function play(n, after) { const L = STORY[n]; if (!L) return;
    for (const x of L) if (x[0] != null) pic(n, x[0]);   // 先把画都要来
    const lock0 = world.locked; world.locked = true; await fadeOut(400); V.on = true; V.cur = null; V.prev = null; if (!S.overlay.includes(overlay)) S.overlay.push(overlay); await fadeIn(500);
    try { for (const [k, who, text] of L) { if (k != null) { show(n, k); await sleep(450); } await say(who, text); }
      await sleep(300); await fadeOut(600); } finally { V.on = false; const i = S.overlay.indexOf(overlay); if (i >= 0) S.overlay.splice(i, 1); await fadeIn(400); world.locked = lock0; }
    if (after) for (const [who, text] of (AFTER[n] || [])) await say(who, text); }
  // ---------- 镇妖图卷（玉佩第三页） ----------
  const cleared = n => !!F()['tw_clear_' + n];
  const cardR = (B, i) => { const row = i < 5 ? 0 : 1, col = row ? i - 5 : i, cw = 128, ch = 192, gap = 26, n = row ? 4 : 5, x0 = B.x + (B.w - (n * cw + (n - 1) * gap)) / 2; return { x: x0 + col * (cw + gap), y: B.y + 58 + row * (ch + 52), w: cw, h: ch }; };
  let selN = 0, armT = 0;
  function draw(B, K) { const { T, C } = K; const now = performance.now();
    T('镇 妖 图 卷', B.x + B.w / 2, B.y + 24, 26, '#E9D9A8', K.BR(), 400, 'center');
    for (let i = 0; i < 9; i++) { const n = i + 1, r = cardR(B, i), open = cleared(n) && !!STORY[n], im = art(SCROLL(n, open));
      ctx.save(); if (selN === n) { ctx.shadowColor = open ? 'rgba(255,210,140,.9)' : 'rgba(200,120,90,.7)'; ctx.shadowBlur = 22; }
      if (im) ctx.drawImage(im, r.x, r.y, r.w, r.h); ctx.restore();
      T('第' + '一二三四五六七八九'[i] + '层', r.x + r.w / 2, r.y + r.h + 16, 15, open ? '#E9D9A8' : '#8E958F', K.KAI(), 600, 'center'); }
    const n = selN; let line = '点一幅卷轴看看。打通一层，那一层的卷轴就会展开。';
    if (n) line = cleared(n) && STORY[n] ? NAME[n] + ' —— 再点一下，重看它的故事。' : '「' + RIDDLE[n] + '」';
    T(line, B.x + B.w / 2, B.y + B.h - 18, 17, n && cleared(n) ? '#F2E4B8' : '#C9B9A0', K.KAI(), 500, 'center'); }
  let pend = null;
  function tap(tp, B, K) { for (let i = 0; i < 9; i++) { const r = cardR(B, i); if (tp.x >= r.x && tp.x <= r.x + r.w && tp.y >= r.y && tp.y <= r.y + r.h) { const n = i + 1;
        if (selN === n && cleared(n) && STORY[n]) { K.snd('ui_confirm'); pend = n; selN = 0; return 'story'; }
        selN = n; K.snd('ui_click'); if (!cleared(n) && n <= 2) K.speak(n === 1 ? '第一层镇着的是花。别小看花，小子。' : '第二层……冷得很。多穿点。'); return null; } }
    return null; }
  setInterval(() => { try { if (!pend || V.on || (window.R386 && R386.isOpen()) || (typeof battle !== 'undefined' && battle) || dialog || choice || sysPanel) return; const n = pend; pend = null; play(n, false); } catch (e) { pend = null; } }, 200);
  window.R384_OPEN = true; window.R384_TAB_NAME = '图卷';
  window.R384_DRAW = (B, K) => draw(B, K); window.R384_TAP = (tp, B, K) => tap(tp, B, K);
  setTimeout(() => { for (let n = 1; n <= 9; n++) { art(SCROLL(n, false)); if (n <= 6) art(SCROLL(n, true)); } }, 12000);
  window.TOWER_STORY = { play, STORY, cleared };
})();
