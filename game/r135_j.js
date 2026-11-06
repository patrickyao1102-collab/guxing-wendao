// ================= R135 · J 林府「月下赠衣」过场动画（作者 11-07：林府夜谈现在只有对话框，要一段能给玩家看的动画）=================
// Codex R134_J 15 秒五镜头分层逐帧演出（曲水花庭背景 + 人物逐帧 + 衣服 / 酒坛 / 剑独立层 + 月光 0.12）。绘制照搬预览.html 的 scene(t)。
// 接法：覆盖 TMAPS.lin_manor.onEnter（照 index.html 原函数重写）。前半段林震山对话、partyRest、换到夜里 lin_court 都照旧；
// 夜谈部分换成「动画 + 对白」：动画是全屏场景层（S.overlay），按镜头播到某个时间点停住，对白照常 say()，说完再往下播。
// 台词以 index.html 当前文本为准，一个字不改；星痕衣数值（云霆 防御 +8 气血 +80）、ch2_plan、goMap 回青阳镇全保留。
// 素材没载完 / 出错时退回原来的纯对话版。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.lin_manor) return;
  // 人物图集：[列数, 帧数]，每格 512×512，统一脚点 (256,490)
  const SEQ = { yun_wipe: [4, 8], ye_walk: [3, 6], ye_sit: [3, 6], ye_throw: [4, 8], yun_receive: [4, 8], expressions: [3, 6], ye_drink: [2, 2] };
  const K = ['background', 'moonlight', 'backs', 'robe', 'wine_closed', 'wine_open', 'sword', ...Object.keys(SEQ)], IM = {}; let loaded = 0;
  K.forEach(k => { const im = new Image(); im.onload = () => { IM[k] = im; loaded++; }; im.src = 'r135j/' + k + '.webp'; });
  const ready = () => loaded >= K.length;
  const lerp = (a, b, t) => a + (b - a) * t;
  function img(k, x, y, w, h, a = 1) { const im = IM[k]; if (!im) return; const g = ctx.globalAlpha; ctx.globalAlpha = g * a; ctx.drawImage(im, x, y, w || im.width, h || im.height); ctx.globalAlpha = g; }
  function char(k, i, x, y) { const im = IM[k], [cols] = SEQ[k]; if (!im) return; ctx.drawImage(im, (i % cols) * 512, Math.floor(i / cols) * 512, 512, 512, x - 256, y - 490, 512, 512); }
  function prop(k, x, y, w, rot = 0) { const a = IM[k]; if (!a) return; const h = w * a.height / a.width; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(a, -w / 2, -h, w, h); ctx.restore(); }
  // t：时间轴秒数（按镜头播放 / 停住）；rt：真实经过秒数（停住时云霆擦剑照样循环）
  function scene(t, rt) {
    ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, W, H);
    ctx.save(); let z = 1, cx = 640, cy = 360;
    if (t >= 2.1 && t < 5.3) { z = 1.08; cx = 640; cy = 400; } else if (t >= 5.3 && t < 8) { z = 1.38; cx = 665; cy = 438; } else if (t >= 8 && t < 13.1) { z = 1.25; cx = 675; cy = 420; }
    // 镜头不出背景边（预览里中景下沿会露出 13px 黑边）
    cx = Math.max(640 / z, Math.min(1280 - 640 / z, cx)); cy = Math.max(360 / z, Math.min(720 - 360 / z, cy));
    ctx.translate(640, 360); ctx.scale(z, z); ctx.translate(-cx, -cy); img('background', 0, 0, 1280, 720);
    if (t >= 13.1) { const a = IM.backs, w = 610; img('backs', 350, 620 - w * a.height / a.width, w, w * a.height / a.width); }
    else {
      const xp = 530, yp = 612, xu = 795;   // manifest 人物落点：叶 (530,612)、云 (795,612)
      if (t < 5.3) char('yun_wipe', Math.floor(rt * 8) % 8, xu, yp);
      else if (t < 8.95) char('expressions', 3 + Math.min(2, Math.floor((t - 5.3) / .95)), xu, yp);
      else char('yun_receive', Math.min(7, Math.floor((t - 8.95) / .5)), xu, yp);
      if (t >= 2.1 && t < 3.9) char('ye_walk', Math.floor((t - 2.1) * 8) % 6, lerp(110, xp, (t - 2.1) / 1.8), yp);
      else if (t >= 3.9 && t < 5.3) char('ye_sit', Math.min(5, Math.floor((t - 3.9) / 1.4 * 6)), xp, yp);
      else if (t >= 5.3 && t < 8) char('expressions', Math.min(2, Math.floor((t - 5.3) / .9)), xp, yp);
      else if (t >= 8 && t < 9.3) { const idx = t < 8.2 ? 0 : t < 8.4 ? 1 : t < 8.58 ? 2 : t < 8.8 ? 3 : t < 9.05 ? 4 : 5; char('ye_throw', idx, xp, yp); }
      else if (t >= 9.3 && t < 10.9) char('ye_drink', t < 9.7 ? 0 : 1, xp, yp);   // 扭头朝左喝酒，不看云霆
      else if (t >= 10.9) char('expressions', 1, xp, yp);
      if (t >= 5.3) prop('sword', 945, 610, 175, -.12);
      if ((t >= 5.3 && t < 9.05) || (t >= 10.9 && t < 11.45)) prop(t < 9.05 ? 'wine_closed' : 'wine_open', 656, 606, 39);
      if (t >= 8.58 && t < 8.95) { const u = (t - 8.58) / .37; prop('robe', lerp(650, 785, u), lerp(424, 435, u) - Math.sin(u * Math.PI) * 40, 86, lerp(-.1, .2, u)); }
    }
    img('moonlight', 0, 0, 1280, 720, .12); ctx.restore();
  }
  // 播放器：target 是要播到的时间点，到了就停住（停住时只有擦剑循环在动）
  function makeCine() {
    const C = { t: 0, target: 0, last: performance.now(), r0: performance.now(), alive: true };
    C.layer = { draw() {
      const now = performance.now(), dt = Math.max(0, Math.min(.1, (now - C.last) / 1000)); C.last = now;
      if (C.t < C.target) C.t = Math.min(C.target, C.t + dt);
      try { scene(C.t, (now - C.r0) / 1000); } catch (e) { C.err = e; }
    } };
    C.go = T => { C.target = Math.max(C.target, T); };
    C.play = async T => { C.go(T); while (C.alive && C.t < T - 1e-6) await nextFrame(); };
    C.stop = () => { C.alive = false; const i = S.overlay.indexOf(C.layer); if (i >= 0) S.overlay.splice(i, 1); };
    S.overlay.push(C.layer); window.R135_J && (R135_J.cur = C); return C;
  }
  // 一句对白同时让动画往前播；说完了还要等动画播到位，再接下一句
  async function sayDuring(C, T, who, text) { if (C) C.go(T); await say(who, text); if (C) await C.play(T); }

  TMAPS.lin_manor.onEnter = async function () {
    if (S.flags.ch2_plan) return;
    const lz = world.actors.find(a => a.npc && a.npc.name === '林震山');
    const ly = addActor('n_linyi', world.player.x + 70, world.player.y, '林逸', '#bff5d0'); ly.h = 104;
    await say('林逸', '父亲！这次幸好在树林中遇到这两位天剑宗的高手，否则孩儿早已葬身妖兽之口了。');
    await say('林震山·伤', '多谢两位少侠救下犬子！林家上下，感激不尽。');
    await say('林震山', '黑风寨寨主名叫周虎，本来只有凝丹二重。近几个月搜刮了大量灵石，修为突破到了凝丹三重。');
    await say('林震山', '更麻烦的是，寨子里来了一位神秘高手，带着个叫方烈的手下，也是凝丹三重。那神秘高手——至少凝丹五重，甚至更高。');
    await say('叶孤星', '林家主，周虎和方烈就由您和三位长老联手牵制，那些练气境的山贼交给林家弟子。那个神秘高手，交给我们。');
    await say('林震山', '好！两位少侠先在府中歇息一晚，明日一早，我们一同前往黑风谷！');
    await fadeOut(500); partyRest(); world.actors = world.actors.filter(a => a !== ly);
    // 作者 11-03：林家府邸早换成 Codex 的「林府 · 曲水花庭」了，夜谈不再用老院子图
    if (TMAPS.lin_court) { if (window.SET_TOD) SET_TOD('night'); tileSetMap('lin_court', 880 / 64 - .5, 745 / 64 - .8, 'right'); world.actors = world.actors.filter(a => !a.follower); world.followers = []; }
    else setMap('courtyard', 560, 600);
    world.locked = true; S.scene = drawMap;
    const yt = TMAPS.lin_court ? addActor(PARTY_DB.yunting.walk, 975, 725, '云霆', '#b8c4ff') : addActor('b_yunting', 760, 480, '云霆', '#b8c4ff'); yt.h = TMAPS.lin_court ? 108 : 118; yt.dir = -1; yt.face = 'left';
    // 素材最多再等 2 秒；还没好就照原来的纯对话演
    for (let i = 0; i < 120 && !ready(); i++) await nextFrame();
    const hud0 = S.hud; let C = null;
    if (ready()) { S.hud = false; S.toast = null; C = makeCine(); }
    try {
      await fadeIn(600);
      // 镜头 1：月下远景，云霆一个人擦剑
      await sayDuring(C, 2.05, '', '夜深。云霆一个人坐在院子的台阶上擦剑。');
      // 镜头 2：叶孤星拎酒走来，往旁边一坐
      await sayDuring(C, 5.25, '', '叶孤星拎着一坛从林府厨房顺来的酒，往他旁边一坐。');
      await say('叶孤星', '睡不着？');
      await say('云霆', '……嗯。');
      // 镜头 3：斗嘴（剑已放到身侧，酒坛在两人中间）
      if (C) await C.play(5.35);
      await say('叶孤星', '明天那个神秘高手，我来。你和林家的人盯住周虎他们就行。');
      await say('云霆', '凭什么你来。');
      if (C) await C.play(6.3);
      await say('叶孤星', '凭我比你帅。');
      await narrate('云霆没忍住，嘴角动了一下。');
      if (C) await C.play(7.25);
      await say('云霆·苦笑', '……滚。');
      await say('叶孤星', '好嘞。（拎起酒坛子就走）');
      await say('云霆·坏笑', '……酒留下。');
      // 镜头 4：随手扔衣，扭头喝酒
      if (C) await C.play(8.05);
      await say('星旋', '你小子只剩 240 星辰点，星陨战甲是买不起了。我这儿有件极品灵器星痕衣，算你 200 点。');
      await sayDuring(C, 8.5, '叶孤星', '行，就这件星痕衣——给他。');
      if (C) await C.play(9.5);   // 8.58 出手、8.95 砸中云霆胸口、9.3 叶孤星扭头朝左喝酒
      await say('云霆', '我不要。');
      await sayDuring(C, 10.3, '叶孤星', '又不是给你的，是给我自己保命的。你挂了，谁替我挡刀？');
      // 镜头 5：云霆嫌弃地收好衣服、把酒坛拽过来 → 两人背影 + 月亮
      if (C) await C.play(14.4);
      { const a = allyState('yunting'); PARTY_DB.yunting.base.def += 8; PARTY_DB.yunting.base.maxhp += 80; a.hp += 80; }
      await showPanel('星痕衣 → 云霆', ['!极品灵器 · 星痕衣', '云霆 防御 +8　气血 +80']);
      await fadeOut(500);
    } finally { if (C) C.stop(); if (S.hud === false) S.hud = hud0; }
    if (window.SET_TOD) SET_TOD('');
    S.flags.ch2_plan = 1; S.quest = '出镇往东，前往黑风谷';
    await goMap('qy_town', 23, 23.2, 'down');
  };
  window.R135_J = { ready, scene };
})();
