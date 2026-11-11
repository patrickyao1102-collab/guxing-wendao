// ================= R135 · J2 林府「月下赠衣」改成地图内演出（作者 11-07：「我想做的是游戏地图内的人物行走帧的剧情，不是这种插画剧情」）=================
// 场景就是夜里的 lin_court（林府 · 曲水花庭）地图，地图照常显示，镜头用 world.camFocus 对准两人。
// 叶孤星 = 主角本人：用平时的地图行走图从院子西头拎着酒坛走过来；到正厅台阶前换成 Codex J 的动作帧（坐下 / 斗嘴 / 扔衣 / 喝酒）。
// 云霆一直坐在台阶上：擦剑循环 → 斗嘴表情 → 接衣 / 收衣 / 拽酒坛。人物、酒坛、剑、星痕衣都是地图 actor，跟别的物件一起按脚底排序。
// Codex 帧统一倍率 SC（512 格、脚点 (256,490)），保持两人身高差；站立约 100px，和同屏行走图一样大。
// 台词与 index.html 原夜谈一字不差；星痕衣数值、ch2_plan、goMap 不动。素材没载完就退回原来的纯对话版。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.lin_manor || typeof drawActorT !== 'function') return;
  const SEQ = { yun_wipe: 4, ye_sit: 3, ye_throw: 4, yun_receive: 4, expressions: 3, ye_drink: 2 };   // 图集列数
  const K = ['robe', 'wine_closed', 'wine_open', 'sword', ...Object.keys(SEQ)], IM = {}; let loaded = 0;
  K.forEach(k => { const im = new Image(); im.onload = () => { IM[k] = im; loaded++; }; im.src = 'r135j/' + k + '.webp'; });
  const ready = () => loaded >= K.length;
  const SC = .23;              // Codex 舞台 px → 屏幕 px（Codex 站立约 433px → 地图约 100px，和行走图同高）
  const SEAT = [1022, 594];    // 叶孤星坐处脚点（正厅台阶前，两盏灯之间、避开门口光圈）
  const lerp = (a, b, t) => a + (b - a) * t;
  const wpp = () => SC / (typeof VZ === 'function' ? VZ() : 1);   // 每个 Codex 舞台 px 对应多少地图坐标
  // 时间轴沿用 Codex J 的秒数（2.1–3.9 走路那段换成真的在地图上走）；停住时只有擦剑循环在动
  const ST = { t: 0, target: 0, last: 0, r0: 0, on: false };
  function tick() { const now = performance.now(), dt = Math.max(0, Math.min(.1, (now - ST.last) / 1000)); ST.last = now; if (ST.t < ST.target) ST.t = Math.min(ST.target, ST.t + dt); }
  async function play(T) { ST.target = Math.max(ST.target, T); while (ST.on && ST.t < T - 1e-6) await nextFrame(); }
  // 在 actor 本地坐标（1 单位 = 1 屏幕 px，原点 = 叶孤星脚点）画 Codex 舞台上的东西
  function cell(k, i, sx, sy) { const im = IM[k], cols = SEQ[k]; ctx.drawImage(im, (i % cols) * 512, Math.floor(i / cols) * 512, 512, 512, (sx - 530 - 256) * SC, (sy - 612 - 490) * SC, 512 * SC, 512 * SC); }
  function prop(k, sx, sy, w, rot = 0) { const im = IM[k]; w *= SC; const h = w * im.height / im.width; ctx.save(); ctx.translate((sx - 530) * SC, (sy - 612) * SC); ctx.rotate(rot); ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore(); }
  function shadow(sx, rx) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse((sx - 530) * SC, -2, rx, 7, 0, 0, 7); ctx.fill(); }
  function drawPart(kind) {
    const t = ST.t, rt = (performance.now() - ST.r0) / 1000;
    if (kind === 'ye') {
      shadow(530, 26);
      if (t < 5.3) cell('ye_sit', Math.max(0, Math.min(5, Math.floor((t - 3.9) / 1.4 * 6))), 530, 612);
      else if (t < 8) cell('expressions', Math.min(2, Math.floor((t - 5.3) / .9)), 530, 612);
      else if (t < 9.3) cell('ye_throw', t < 8.2 ? 0 : t < 8.4 ? 1 : t < 8.58 ? 2 : t < 8.8 ? 3 : t < 9.05 ? 4 : 5, 530, 612);
      else if (t < 10.9) cell('ye_drink', t < 9.7 ? 0 : 1, 530, 612);   // 扭头朝左喝酒，不看云霆
      else cell('expressions', 1, 530, 612);
    } else if (kind === 'yun') {
      shadow(795, 26);
      if (t < 5.3) cell('yun_wipe', Math.floor(rt * 8) % 8, 795, 612);
      else if (t < 8.95) cell('expressions', 3 + Math.min(2, Math.floor((t - 5.3) / .95)), 795, 612);
      else cell('yun_receive', Math.min(7, Math.floor((t - 8.95) / .5)), 795, 612);   // 嫌弃一眼 → 塞到身后 → 把酒坛拽过来
    } else if (kind === 'sword') { if (t >= 5.3) prop('sword', 945, 610, 175, -.12); }
    else if (kind === 'wine') { if ((t >= 5.3 && t < 9.05) || (t >= 10.9 && t < 11.45)) prop(t < 9.05 ? 'wine_closed' : 'wine_open', 656, 606, 39); }
    else if (kind === 'robe') { if (t >= 8.58 && t < 8.95) { const u = (t - 8.58) / .37; prop('robe', lerp(650, 785, u), lerp(424, 435, u) - Math.sin(u * Math.PI) * 40, 86, lerp(-.1, .2, u)); } }
  }
  // 走路时手边的酒坛（主角行走图朝右，酒坛挂在前手下面，随步子轻晃）
  function drawCarry(a, now) {
    const im = IM.wine_closed, w = 12, h = w * im.height / im.width, sw = a.moving ? Math.sin(now * 9.5) * 1.6 : 0, dx = a.face === 'left' ? -11 : 11;
    ctx.save(); ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x + dx + sw, a.y - 47); ctx.drawImage(im, -w / 2, 0, w, h); ctx.restore();
  }
  drawActorT = (o => function (a, now) {
    const j = a && a.j2;
    if (!j || !ready() || a.hidden) { const r = o.apply(this, arguments); if (a && a.j2carry && ready() && !a.hidden) try { drawCarry(a, now); } catch (e) {} return r; }
    if (j.kind === 'ye') tick();   // 一帧推进一次时间轴
    ctx.save();
    try { ctx.translate(j.ox != null ? a.x - j.ox : a.x, a.y - (j.oy || 0)); drawPart(j.kind); }
    catch (e) { console.warn('r135_j2', e); } finally { ctx.restore(); }
  })(drawActorT);

  TMAPS.lin_manor.onEnter = async function () {
    if (S.flags.ch2_plan) return;
    const lz = world.actors.find(a => a.npc && a.npc.name === '林震山');
    const ly = addActor('n_linyi', world.player.x + 70, world.player.y, '林溪', '#bff5d0'); ly.h = 104;
    await say('林溪', '父亲！这次幸好在树林中遇到这两位天剑宗的高手，否则孩儿早已葬身妖兽之口了。');
    await say('林震山·伤', '多谢两位少侠救下小女！林家上下，感激不尽。');
    await say('林震山', '黑风寨寨主名叫周虎，本来只有凝丹二重。近几个月搜刮了大量灵石，修为突破到了凝丹三重。');
    await say('林震山', '更麻烦的是，寨子里来了一位神秘高手，带着个叫方烈的手下，也是凝丹三重。那神秘高手——至少凝丹五重，甚至更高。');
    await say('叶孤星', '林家主，周虎和方烈就由您和三位长老联手牵制，那些练气境的山贼交给林家弟子。那个神秘高手，交给我们。');
    await say('林震山', '好！两位少侠先在府中歇息一晚，明日一早，我们一同前往黑风谷！'); await say('林溪·羞', '叶大哥的客房我去收拾！就在我住的小院隔壁……我、我是说，离得近，有事好照应。'); await say('林震山', '……这丫头。');
    await fadeOut(500); partyRest(); world.actors = world.actors.filter(a => a !== ly);
    // 作者 11-03：林家府邸早换成 Codex 的「林府 · 曲水花庭」了，夜谈不再用老院子图
    if (TMAPS.lin_court) { if (window.SET_TOD) SET_TOD('night'); tileSetMap('lin_court', 880 / 64 - .5, 745 / 64 - .8, 'right'); world.actors = world.actors.filter(a => !a.follower); world.followers = []; }
    else setMap('courtyard', 560, 600);
    world.locked = true; S.scene = drawMap;
    const yt = TMAPS.lin_court ? addActor(PARTY_DB.yunting.walk, 975, 725, '云霆', '#b8c4ff') : addActor('b_yunting', 760, 480, '云霆', '#b8c4ff'); yt.h = TMAPS.lin_court ? 108 : 118; yt.dir = -1; yt.face = 'left';
    // 素材最多再等 2 秒；没好（或不在曲水花庭）就照原来的纯对话演
    for (let i = 0; i < 120 && !ready(); i++) await nextFrame();
    const cine = ready() && world.mapName === 'lin_court';
    const p = world.player, extra = [], hud0 = S.hud, glow = [];
    if (cine) {
      const k = wpp(), [ax, ay] = SEAT;
      ST.t = ST.target = 0; ST.last = ST.r0 = performance.now(); ST.on = true;
      yt.x = ax + 265 * k; yt.y = ay; yt.j2 = { kind: 'yun', ox: 265 * k };   // 云霆坐在台阶上擦剑
      for (const [kind, dy] of [['wine', 1], ['sword', 2], ['robe', 3]]) { const a = addActor('', ax, ay + dy, '', '#fff'); a.j2 = { kind, oy: dy }; a.label = ''; extra.push(a); }
      p.x = 170; p.y = 676; p.face = 'right'; p.j2carry = true;   // 叶孤星在院子西头，镜头外
      for (const d of world.map.T.doors || []) { const cs = world.map.T.cs || TS, x = d.rect ? d.rect[0] : d.edge ? (d.x + (d.w || 1) / 2) * cs : (d.c + .5) * TS, y = d.rect ? d.rect[1] : d.edge ? (d.y + (d.h || 1) / 2) * cs : (d.r + 1) * TS;
        if (Math.abs(x - ax - 100) < 260 && Math.abs(y - ay) < 160) { glow.push([d, Object.prototype.hasOwnProperty.call(d, 'cond'), d.cond]); d.cond = () => false; } }   // 正厅门口的传送光圈 / 门牌先收起来，免得垫在两人脚边
      world.camFocus = [ax + 130 * k + 40, ay + 46]; world.cam = { x: world.camFocus[0] - W / VZ() / 2, y: world.camFocus[1] - H / VZ() / 2 };
      S.hud = false; S.toast = null; world.banner = null;
    }
    try {
      await fadeIn(600);
      await narrate('夜深。云霆一个人坐在院子的台阶上擦剑。');
      if (cine) {   // 拎着酒坛从西边走过来，走到他旁边一屁股坐下
        const [ax, ay] = SEAT, walk = (async () => { await moveActor(p, ax - 120, ay + 10, 190); await moveActor(p, ax, ay, 120); p.face = 'right'; })();
        await narrate('叶孤星拎着一坛从林府厨房顺来的酒，往他旁边一坐。');
        await walk; p.j2carry = false; p.j2 = { kind: 'ye' }; ST.t = ST.target = 3.9; ST.last = performance.now(); await play(5.25);
      } else await narrate('叶孤星拎着一坛从林府厨房顺来的酒，往他旁边一坐。');
      await say('叶孤星', '睡不着？');
      await say('云霆', '……嗯。');
      if (cine) await play(5.35);   // 剑放到身侧，酒坛搁在两人中间
      await say('叶孤星', '明天那个神秘高手，我来。你和林家的人盯住周虎他们就行。');
      await say('云霆', '凭什么你来。');
      if (cine) await play(6.3);
      await say('叶孤星', '凭我比你帅。');
      await narrate('云霆没忍住，嘴角动了一下。');
      if (cine) await play(7.25);
      await say('云霆·苦笑', '……滚。');
      await say('叶孤星', '好嘞。（拎起酒坛子就走）');
      await say('云霆·坏笑', '……酒留下。');
      if (cine) await play(8.05);
      await say('星旋', '你小子只剩 240 星辰点，星陨战甲是买不起了。我这儿有件极品灵器星痕衣，算你 200 点。');
      if (cine) ST.target = Math.max(ST.target, 8.5);
      await say('叶孤星', '行，就这件星痕衣——给他。');
      if (cine) await play(9.5);   // 8.58 随手一扔、8.95 砸进云霆怀里、9.3 扭头朝左喝酒
      await say('云霆', '我不要。');
      if (cine) ST.target = Math.max(ST.target, 10.3);
      await say('叶孤星', '又不是给你的，是给我自己保命的。你挂了，谁替我挡刀？');
      if (cine) await play(12.9);   // 云霆嫌弃地看一眼，把衣服塞到身后，再把酒坛拽到自己这边
      { const a = allyState('yunting'); PARTY_DB.yunting.base.def += 8; PARTY_DB.yunting.base.maxhp += 80; a.hp += 80; }
      await showPanel('星痕衣 → 云霆', ['!极品灵器 · 星痕衣', '云霆 防御 +8　气血 +80']);
      await fadeOut(500);
    } finally {
      ST.on = false; delete p.j2; delete p.j2carry; delete yt.j2;
      world.actors = world.actors.filter(a => !extra.includes(a));
      for (const [d, own, c] of glow) { if (own) d.cond = c; else delete d.cond; }
      if (cine) { world.camFocus = null; if (S.hud === false) S.hud = hud0; }
    }
    if (window.SET_TOD) SET_TOD('');
    S.flags.ch2_plan = 1; S.quest = '出镇往东，前往黑风谷';
    await goMap('qy_town', 23, 23.2, 'down');
  };
  window.R135_J2 = { ready, ST, SEAT, SC };
})();
