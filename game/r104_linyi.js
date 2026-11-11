// R104 山外树林 · 林溪获救（作者 11-03）
// 1) 指引：以前一进树林只有「穿过山外树林」，玩家径直走到东北出口，才弹一句「林子里好像有人在呼救……」，完全不知道该去哪。
//    现在：刚进林子就听见呼救、镜头推到北边空地让玩家亲眼看到林溪被两头妖兽围住；
//    任务改成「循着呼救声……」，点任务栏自动寻路直达；离得远时主角身边有金色箭头指着呼救方向；林溪头上一直冒「救命——！」。
// 2) 实景剧情：用现有的建模（林溪、银纹妖狼、黑甲犀牛、烈焰妖豹、叶孤星、云霆）在地图上直接演——
//    妖狼扑倒林溪 → 叶孤星冲上去一剑劈开 → 云霆雷光逼退犀牛 → 第一战 → 妖豹从暗处扑向云霆后背、叶孤星挡在前面（流云仙衣泛光）
//    → 第二战 → 妖豹负伤逃进林子 → 林溪上前道谢 → 林溪在前面带路，在东北南门口等着。
// 代码只做摆放、走位、倒地、气泡和刀光；人物都是原来的立绘。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.lin_forest || typeof tileSetMap !== 'function' || typeof drawActorT !== 'function') return;
  const F = () => S.flags || (S.flags = {});
  const MAP = 'lin_forest';
  const sl = ms => new Promise(r => setTimeout(r, ms));
  const C = () => { const r = TMAPS.lin_forest.rescue || [1664, 578]; return [r[0], r[1]]; };
  const EXIT_WAIT = [2716, 312];   // 林溪在青阳镇南门口等着的位置
  const QUEST_FIND = '循着呼救声，去树林北边的空地救人';
  const QUEST_GO = '跟着林溪，往东北走出青阳镇南门';
  let ST = null;   // 当前这一幕的演员

  // 出口提示改成说清楚方向
  for (const e of TMAPS.lin_forest.exits || []) if (e.to === 'qy_town') e.msg = '呼救声是从林子北边的空地传来的——先去救人！';

  function mk(key, x, y, label, h, dir) { const a = addActor(key, x, y, label, '#ffffff'); a.h = h; a.dir = dir; a.r104 = 1; return a; }
  const bub = (a, t, ms = 1500) => { if (a) a.bub = { t, t0: performance.now(), ms }; };
  const FX = [];   // 刀光 / 光环 / 火痕
  const slash = (x, y, col = '255,236,180', dir = 1) => FX.push({ k: 'slash', x, y, col, dir, t0: performance.now(), ms: 320 });
  const ring = (x, y, col, R = 110, ms = 600, aura = false) => FX.push({ k: 'ring', x, y, col, R, ms, aura, t0: performance.now() });
  const fadeA = (a, to, ms) => { const f = a.alpha ?? 1; return tween(ms, t => a.alpha = f + (to - f) * t); };
  function fall(a, ms = 420, rot = .32) { return tween(ms, t => { a.rot = rot * t; a.alpha = 1 - t; }); }
  // 被打退：往后滑、不转身（moveActor 会按移动方向翻面）
  function knock(a, x, y, ms = 260) { const x0 = a.x, y0 = a.y; a.moving = true; return tween(ms, t => { const e = 1 - (1 - t) * (1 - t); a.x = x0 + (x - x0) * e; a.y = y0 + (y - y0) * e; a.moving = t < 1; }); }
  function drop(a) { world.actors = world.actors.filter(x => x !== a); }

  // ---------------- 布景：林溪 + 两头妖兽（未救下时）/ 南门口等人的林溪（救下后、还没进镇）----------------
  function stage() {
    if (world.mapName !== MAP) return;
    if ((world.actors || []).some(a => a.r104)) return;
    const f = F();
    if (!f.ch2_linyi && f.ch2_forest) {
      const [cx, cy] = C();
      const ly = mk('n_linyi', cx + 6, cy - 34, '林溪', 104, 1);
      const wolf = mk('e_wolf2', cx - 178, cy + 8, '银纹妖狼', 112, 1);
      const rhino = mk('e_rhino', cx + 210, cy - 4, '黑甲犀牛', 124, -1);
      ST = { ly, wolf, rhino, cx, cy, idle: true, home: { ly: [ly.x, ly.y], wolf: [wolf.x, wolf.y], rhino: [rhino.x, rhino.y] }, nextCry: performance.now() + 600 };
      addTrigger(cx, cy + 10, 330, () => rescueScene(), true, false);
      if (!/呼救/.test(S.quest || '')) S.quest = QUEST_FIND;
    } else if (f.ch2_linyi && !f.ch2_town) {
      const ly = mk('n_linyi', EXIT_WAIT[0], EXIT_WAIT[1], '林溪', 104, 1);
      ST = { ly, waiting: true, nextCry: performance.now() + 800 };
    } else ST = null;
  }
  tileSetMap = (o => function (name) { const r = o.apply(this, arguments); try { if (name === MAP) stage(); else if (ST && world.mapName !== MAP) ST = null; } catch (e) { console.warn('r104 stage', e); } return r; })(tileSetMap);

  // 任务栏自动寻路：「呼救声」直接去空地（原来「有人呼救」那条规则指的是落云岭的山洞，这里用不同的字避开）
  function addRule() { const R = window.QUEST_ROUTE && QUEST_ROUTE.RULES; if (!R || R.__r104) return; R.__r104 = 1;
    R.unshift([/呼救声/, () => { const [cx, cy] = C(); return { map: MAP, pt: [cx, cy + 150] }; }]);
    R.unshift([/跟着林溪/, () => ({ map: 'qy_town' })]); }
  addRule(); setTimeout(addRule, 0);

  // ---------------- 每帧：待机小动作、气泡、箭头、刀光 ----------------
  function idle(now) {
    if (!ST || world.mapName !== MAP) return;
    const t = now / 1000;
    if (ST.idle) {
      const { ly, wolf, rhino, home } = ST;
      wolf.x = home.wolf[0] + Math.sin(t * 2.1) * 16; wolf.y = home.wolf[1] + Math.sin(t * 1.3) * 4; wolf.moving = Math.abs(Math.cos(t * 2.1)) > .35; wolf.dir = 1;
      rhino.x = home.rhino[0] + Math.sin(t * 1.4 + 1) * 10; rhino.moving = Math.abs(Math.cos(t * 1.4 + 1)) > .5; rhino.dir = -1;
      ly.x = home.ly[0] + Math.sin(t * 31) * 1.4; ly.dir = Math.sin(t * .9) > 0 ? 1 : -1;
      if (now > ST.nextCry && !dialog) { ST.nextCry = now + 3400; bub(ly, Math.random() < .5 ? '救命——！' : '谁来救救我——！', 1900); }
    } else if (ST.waiting && !world.locked && !dialog) {
      const p = world.player, d = Math.hypot(p.x - ST.ly.x, p.y - ST.ly.y);
      ST.ly.dir = p.x >= ST.ly.x ? 1 : -1;
      if (now > ST.nextCry) { ST.nextCry = now + 4200; bub(ST.ly, d < 260 ? '出了南门就是青阳镇！' : '叶大哥，这边！', 2000); }
    }
  }
  function drawBubble(a) {
    const b = a.bub; if (!b) return; const t = (performance.now() - b.t0) / b.ms; if (t >= 1) { a.bub = null; return; }
    const al = Math.max(0, Math.min(1, t * 9, (1 - t) * 6)), pop = t < .1 ? .55 + .45 * (t / .1) : 1, z = typeof VZ === 'function' ? VZ() : 1;
    const head = a === world.player || a.key === 'w_yunting' ? 122 : (a.h || 110) * (a.sq || 1);
    ctx.save(); ctx.translate(a.x, a.y - head - 14); ctx.scale(pop / z, pop / z); ctx.globalAlpha *= al;
    const big = b.t.length <= 2; ctx.font = `800 ${big ? 34 : 24}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = Math.max(48, ctx.measureText(b.t).width + 30), h = big ? 52 : 44;
    ctx.fillStyle = '#fff8ea'; ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h - 10, w, h, 14); ctx.moveTo(-9, -11); ctx.lineTo(0, 2); ctx.lineTo(9, -11); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff8ea'; ctx.fillRect(-8, -14, 16, 5);
    ctx.fillStyle = /！|!/.test(b.t) && big ? '#c8281c' : '#3a1a0a'; ctx.fillText(b.t, 0, -h / 2 - 10);
    ctx.restore();
  }
  function glow(x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function drawFx(now) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i], k = (now - f.t0) / f.ms; if (k >= 1) { FX.splice(i, 1); continue; }
      if (f.k === 'slash') { const a = 1 - k; glow(f.x, f.y, 70 + 50 * k, f.col, .55 * a); ctx.strokeStyle = `rgba(${f.col},${a})`; ctx.lineCap = 'round';
        for (let j = 0; j < 3; j++) { ctx.lineWidth = (9 - j * 3) * (1 - k * .5); ctx.beginPath(); ctx.arc(f.x - f.dir * 20, f.y, 58 + j * 6 + 30 * k, f.dir > 0 ? -1.15 : Math.PI - 1.15 + .3, f.dir > 0 ? 1.15 - .3 : Math.PI + 1.15); ctx.stroke(); } }
      else if (f.k === 'ring') { const a = 1 - k; ctx.strokeStyle = `rgba(${f.col},${.9 * a})`; ctx.lineWidth = 6 * a + 1; ctx.beginPath();
        if (f.aura) { ctx.ellipse(f.x, f.y, f.R * (.6 + .5 * k), f.R * (1 + .6 * k), 0, 0, 7); glow(f.x, f.y, f.R * 1.4, f.col, .35 * a); } else ctx.ellipse(f.x, f.y, f.R * (.3 + k), f.R * (.3 + k) * .38, 0, 0, 7); ctx.stroke(); } }
    // 妖豹身上的火 + 拖尾
    for (const a of world.actors) if (a.r104 && a.flame && (a.alpha ?? 1) > .02) {
      a.trail = a.trail || []; const l = a.trail[0]; if (!l || Math.hypot(l[0] - a.x, l[1] - a.y) > 8) a.trail.unshift([a.x, a.y, now]); while (a.trail.length && now - a.trail[a.trail.length - 1][2] > 420) a.trail.pop();
      const al = a.alpha ?? 1; for (const [x, y, t0] of a.trail) { const k = (now - t0) / 420; glow(x, y - 40, 46 * (1 - k * .5), '255,130,40', .28 * (1 - k) * al); }
      glow(a.x, a.y - 50, 90 + Math.sin(now / 90) * 6, '255,120,30', .22 * al);
    }
    ctx.restore();
  }
  function drawArrow(now) {
    if (!ST || world.locked || (typeof dialog !== 'undefined' && dialog)) return;
    const tgt = ST.idle ? ST.ly : ST.waiting ? ST.ly : null; if (!tgt) return;
    const p = world.player, dx = tgt.x - p.x, dy = tgt.y - p.y, d = Math.hypot(dx, dy); if (d < 430) return;
    const ang = Math.atan2(dy, dx), r = 92 + Math.sin(now / 160) * 8, z = typeof VZ === 'function' ? VZ() : 1;
    ctx.save(); ctx.translate(p.x + Math.cos(ang) * r, p.y - 46 + Math.sin(ang) * r * .7); ctx.scale(1 / z, 1 / z);
    ctx.save(); ctx.rotate(ang); ctx.fillStyle = '#ffd36a'; ctx.strokeStyle = '#4a2a08'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(-8, -20); ctx.lineTo(-2, -7); ctx.lineTo(-26, -7); ctx.lineTo(-26, 7); ctx.lineTo(-2, 7); ctx.lineTo(-8, 20); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
    ctx.font = `800 20px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(30,14,2,.9)'; ctx.fillStyle = '#ffe9a8';
    const lab = ST.idle ? '呼救声' : '林溪'; ctx.strokeText(lab, 0, 38); ctx.fillText(lab, 0, 38);
    ctx.restore();
  }
  tileAmbientHigh = (o => function (T, cam, now) {
    o && o.apply(this, arguments);
    if (world.mapName !== MAP) return;
    try { const n = performance.now(); idle(n); drawFx(n); for (const a of world.actors) if (a.bub && !a.hidden) drawBubble(a); if (world.player && world.player.bub && !world.actors.includes(world.player)) drawBubble(world.player); drawArrow(n); } catch (e) { console.warn('r104 draw', e); }
  })(typeof tileAmbientHigh === 'function' ? tileAmbientHigh : null);
  // 倒地 / 跌坐 / 鞠躬：绕脚底旋转、压扁；半透明时影子跟着淡
  drawActorT = (o => function (a, now) {
    if (!a || !a.r104) return o.apply(this, arguments);
    const al = a.alpha ?? 1; if (al <= .01) return;
    ctx.save(); ctx.globalAlpha *= al; a.alpha = 1;
    try { if (a.rot || (a.sq && a.sq !== 1)) { ctx.translate(a.x, a.y); if (a.rot) ctx.rotate(a.rot); if (a.sq && a.sq !== 1) ctx.scale(1 + (1 - a.sq) * .4, a.sq); ctx.translate(-a.x, -a.y); } o.apply(this, arguments); }
    finally { a.alpha = al; ctx.restore(); }
  })(drawActorT);

  // ---------------- 进林：远处呼救，镜头推过去看一眼 ----------------
  async function intro() {
    const [cx, cy] = C(); stage(); const s = ST; if (!s || !s.idle) return;
    world.locked = true;
    await sl(250); bub(s.ly, '救命——！', 2200); try { playSnd('sfx_wolf_howl', .7); } catch (e) {}
    await narrate('林子深处忽然传来一声凄厉的呼救——');
    world.camFocus = [cx, cy - 10]; await sl(1300);
    // 妖狼往前一扑，林溪往后跌
    s.idle = false; bub(s.ly, '别过来！', 1300);
    const w0 = [s.wolf.x, s.wolf.y]; await moveActor(s.wolf, w0[0] + 70, w0[1] - 8, 520); try { playSnd('sfx_claw', .6); } catch (e) {}
    await tween(220, t => { s.ly.x = s.home.ly[0] + 16 * t; s.ly.rot = .12 * Math.sin(t * Math.PI); }); s.ly.rot = 0;
    await moveActor(s.wolf, w0[0], w0[1], 260); s.idle = true;
    await say('云霆', '北边那片空地！有人被妖兽围住了！');
    world.camFocus = [world.player.x, world.player.y - 40]; await sl(900); world.camFocus = null;
    await say('叶孤星', '走，去救人！');
    S.quest = QUEST_FIND; toast('呼救声在林子正北——跟着金色箭头走（点右上角任务栏可自动寻路）', 3200);
  }

  // ---------------- 空地：实景救人 ----------------
  async function rescueScene() {
    const s = ST; if (!s || !s.ly) return; s.idle = false;
    const p = world.player, [cx, cy] = [s.cx, s.cy], { ly, wolf, rhino } = s;
    world.mobs && world.mobs.forEach(m => m.hidden = true);
    world.camFocus = [cx, cy + 10];
    // 云霆：把跟随的队友换成能随意走位的替身，演完再换回去
    const fol = (world.followers || []).find(f => f.key === 'w_yunting');
    const yt = mk('w_yunting', fol ? fol.x : p.x + 50, fol ? fol.y : p.y + 30, '云霆', 108, 1); yt.face = 'up'; if (fol) fol.hidden = true;
    // 妖狼扑倒林溪
    try { playSnd('sfx_wolf_howl', .9); } catch (e) {}
    await sl(420); bub(ly, '啊——！', 900);
    await moveActor(wolf, cx - 62, cy - 6, 950); try { playSnd('sfx_claw', .8); } catch (e) {} S.shake = 7;
    await tween(240, t => { ly.rot = .42 * t; ly.sq = 1 - .2 * t; ly.x = cx + 6 + 20 * t; });
    // 叶孤星冲上去一剑劈开
    bub(p, '住手！', 900); await sl(260);
    await moveActor(p, cx - 40, cy + 26, 900); p.dir = -1; p.face = 'left';
    slash(wolf.x + 6, wolf.y - 50, '255,236,180', -1); try { playSnd('sfx_swing', 1); playSnd('sfx_hit', .9); } catch (e) {} S.shake = 10;
    await knock(wolf, cx - 225, cy + 20, 280);
    // 云霆雷光逼退犀牛
    await moveActor(yt, cx + 112, cy + 36, 820); yt.face = 'right'; yt.dir = 1;
    slash(rhino.x - 10, rhino.y - 56, '200,215,255', 1); ring(rhino.x, rhino.y, '190,205,255', 150, 520); try { playSnd('sfx_thunder', .6); } catch (e) {} if (typeof screenFlash === 'function') screenFlash('#e4e8ff', .4); S.shake = 12;
    await knock(rhino, cx + 262, cy + 6, 300);
    await say('云霆', '是一头凝丹一重的银纹妖狼，和一头凝丹二重的黑甲犀牛！');
    await say('星旋', '小子，别大意，附近还藏着一头凝丹四重的妖兽，在伺机偷袭你们！');
    await say('叶孤星', '那边那位，躲到后面去！');
    bub(ly, '是、是！', 900); await tween(260, t => { ly.rot = .42 * (1 - t); ly.sq = .8 + .2 * t; }); ly.rot = 0; ly.sq = 1;
    await moveActor(ly, cx + 26, cy - 168, 330); ly.dir = -1;
    // 第一战
    await fadeOut(200);
    const w1 = startBattle({ title: '山外树林', bg: 'bg_mountain', enemies: [BEAST('wolf2'), BEAST('rhino')], exp: 160, gold: 80 }); await fadeIn(250); await w1;
    S.scene = drawMap; world.camFocus = [cx, cy + 10];
    await Promise.all([fall(wolf, 520, .35), fall(rhino, 520, -.28)]); drop(wolf); drop(rhino);
    // 妖豹从暗处扑向云霆后背，叶孤星挡在前面
    const lp = mk('e_leopard', cx - 600, cy - 70, '烈焰妖豹', 120, 1); lp.alpha = 0; lp.flame = true;
    p.face = 'right'; p.dir = 1; yt.face = 'right'; yt.dir = 1;
    await Promise.all([fadeA(lp, 1, 380), moveActor(lp, cx - 520, cy - 58, 200)]);
    bub(ly, '小心——！', 1100); await sl(240);
    const leap = moveActor(lp, yt.x - 92, yt.y - 8, 1250);
    await sl(330); bub(p, '云霆，小心！', 1200); await moveActor(p, yt.x - 56, yt.y + 2, 1500); p.face = 'left'; p.dir = -1;
    await leap;
    try { playSnd('sfx_claw', 1); playSnd('sfx_buff', .8); } catch (e) {} S.shake = 14; if (typeof screenFlash === 'function') screenFlash('#d6efff', .55);
    ring(p.x, p.y - 62, '190,236,255', 80, 900, true); ring(p.x, p.y, '190,236,255', 160, 700);
    await knock(lp, cx - 230, cy - 40, 340);
    await narrate('利爪重重拍在叶孤星身上——流云仙衣泛起一层流光，竟把这一击卸去了大半。');
    yt.face = 'left'; yt.dir = -1; bub(yt, '！', 700);
    await say('云霆·惊', '你疯了？！');
    await say('叶孤星·伤', '没事，这衣服贵，抗揍。');
    await say('云霆·苦笑', '……灾星。');
    await say('叶孤星', '喂，我刚救了你！……星旋，你这神仙前辈刚才怎么一声不吭？');
    await say('星旋', '咳咳，我那叫考验你的反应速度！');
    // 东边林子里又冲出一头犀牛
    const rh2 = mk('e_rhino', cx + 620, cy + 14, '黑甲犀牛', 124, -1); rh2.alpha = 0;
    await Promise.all([fadeA(rh2, 1, 300), moveActor(rh2, cx + 300, cy + 16, 420)]); S.shake = 6; yt.face = 'right'; yt.dir = 1;
    // 第二战
    await fadeOut(200);
    const lpE = Object.assign(BEAST('leopard'), { name: '烈焰妖豹（凝丹四重）', hp: 720, maxhp: 720, boss: true });
    const w2 = startBattle({ title: '烈焰妖豹', bg: 'bg_mountain', enemies: [lpE, BEAST('rhino')], exp: 260, gold: 120, boss: true }); await fadeIn(250); await w2;
    S.scene = drawMap; world.camFocus = [cx, cy + 10];
    await fall(rh2, 520, -.3); drop(rh2);
    bub(lp, '！', 800); await sl(450); lp.dir = -1;
    const run = moveActor(lp, cx - 820, cy - 120, 1300); await sl(260); fadeA(lp, 0, 380); await run; drop(lp);
    await narrate('烈焰妖豹眼露惊骇，发出一声惊恐的咆哮，化作一道火光窜入密林深处。');
    // 林溪上前道谢
    p.face = 'up'; yt.face = 'up';
    await moveActor(ly, p.x + 34, p.y - 74, 230); ly.dir = -1;
    ly.bowing = 1; await sl(900); ly.bowing = 0;   // 作揖（R105 作揖单帧）
    await say('林溪', '多谢两位出手相救！若非两位仗义相助，我今天恐怕就要丧命于妖兽口中了。');
    await say('云霆', '你是什么人？为何独自闯入这片妖兽横行的树林？');
    await say('林溪', '我叫林溪，是青阳镇林家家主的女儿。数月前黑风寨威胁我林家，要我们每月上交大量灵石……父亲让我去飞云宗求援，谁知刚出镇子就被黑风寨的人一路追杀。');
    await say('叶孤星·笑', '这可真巧，我们正是天剑宗派来剿灭黑风寨的。走，带路，去青阳镇！');
    bub(ly, '好！', 800); await say('林溪·笑', '多谢叶大哥！……叶大哥方才那一剑，真好看。'); await say('林溪', '青阳镇南门就在东北边，我、我在前面带路！叶大哥跟紧我呀！');
    S.flags.ch2_linyi = 1;
    // 林溪往东北跑出画面，再到南门口等着
    ly.dir = 1; const go = moveActor(ly, ly.x + 300, ly.y - 150, 300); await sl(500); await Promise.all([go, fadeA(ly, 0, 420)]);
    ly.x = EXIT_WAIT[0]; ly.y = EXIT_WAIT[1]; ly.alpha = 1; ly.rot = 0; ly.sq = 1;
    Object.assign(s, { idle: false, waiting: true, nextCry: performance.now() + 1500, wolf: null, rhino: null });
    // 云霆换回跟随
    if (fol) { fol.x = yt.x; fol.y = yt.y; fol.hidden = false; } drop(yt);
    world.trail = [[p.x, p.y, p.face]];
    world.mobs && world.mobs.forEach(m => m.hidden = false);
    world.camFocus = null;
    S.quest = QUEST_GO; toast('林溪在东北边的南门口等着——跟着金色箭头走', 2600);
  }

  window.R104_LY = { intro, stage, rescueScene, get state() { return ST; } };
})();
