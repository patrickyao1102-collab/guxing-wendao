// ================= R210 · 黑风寨聚义厅前：剧情在地图上真的演出来（作者 11-11；Codex R207 动画帧，r210/*.webp）=================
// 以前这两段只有对话 + 旁白 + 一次闪白。现在：
//   林震山带三位长老、林家弟子从后面跟上来站阵 → 门板碎飞、周虎一脚踹出，方烈跟出 → 对峙（林震山拔剑前指）→ 首领战
//   → 魔族黑袍现身 → 战后现出真身、化作黑烟 → 方烈灵丹膨胀 → 叶孤星上前一步结双曜剑阵，光壁罩住众人 → 自爆冲击撞在剑阵上 → 剑阵消散，众人无伤。
// 台词、战斗、奖励一字不动，只加地图演出。叶孤星施法帧跟着当前换装走（天剑弟子服 A / 流云仙衣孤星白衣 B）。
(function () {
  if (typeof hfBoss !== 'function' || typeof drawActorT !== 'function') return;
  const DIR = 'r210/', SC = .46, FXS = .92;   // 人物按地图比例；特效图已减半存，画的时候放回去（原 900×600 一格、预览 0.42~0.46 倍）
  const DEF = {   // [每格宽, 高, 脚底 x, y, 帧数]
    lin_zhenshan_walk: [160, 240, 80, 232, 21], elder_teal_walk: [160, 240, 80, 232, 21], elder_ochre_walk: [160, 240, 80, 232, 21], elder_gray_walk: [160, 240, 80, 232, 21],
    disciple_sword_walk: [160, 240, 80, 232, 21], disciple_spear_walk: [160, 240, 80, 232, 21], fanglie_walk: [160, 240, 80, 232, 21],
    lin_zhenshan_point: [280, 320, 140, 312, 1], disciple_protect: [240, 320, 120, 312, 1], zhouhu_kick: [240, 320, 120, 312, 8], zhouhu_idle: [240, 320, 120, 312, 4],
    fanglie_idle: [240, 320, 120, 312, 4], fanglie_swell: [240, 320, 120, 312, 10], ye_A_cast: [240, 320, 120, 312, 8], ye_B_cast: [240, 320, 120, 312, 8],
    demon_reveal: [320, 320, 160, 312, 6], demon_death: [320, 320, 160, 312, 8],
    door_break: [450, 300, 225, 280, 8], explosion: [450, 300, 225, 210, 16], shield_expand: [450, 300, 225, 280, 8], shield_loop: [450, 300, 225, 280, 8], shield_hit: [450, 300, 225, 280, 6], shield_dissolve: [450, 300, 225, 280, 6] };
  /* Codex 的长老、弟子行走帧里人画得偏小（格内 132–156 高，叶孤星、林震山是 215–234）：按人高补回同一比例 */
  const KSC = { elder_teal_walk: 1.36, elder_ochre_walk: 1.48, elder_gray_walk: 1.34, disciple_sword_walk: 1.38, disciple_spear_walk: 1.56, zhouhu_idle: 1.12, zhouhu_kick: 1.12 };
  const IM = {}; let nOk = 0, started = false; const NALL = Object.keys(DEF).length;
  function load() { if (started) return; started = true; for (const k in DEF) { const im = new Image(); im.onload = () => { IM[k] = im; nOk++; }; im.onerror = () => { nOk++; }; im.src = DIR + k + '.webp'; } }
  setInterval(() => { try { if (!started && world.mapName === 'hf_camp' && !S.flags.ch2_done) load(); } catch (e) {} }, 1500);
  const ready = async () => { load(); const t0 = performance.now(); while (nOk < NALL && performance.now() - t0 < 6000) await sleep(100); return Object.keys(IM).length >= NALL; };

  // ---------------- 画：带 r2 的角色走这里（跟地图人物一起按脚底 y 排序）----------------
  let hideP = false;
  drawActorT = (orig => function (a, now) {
    if (hideP && a === world.player) return;
    const r = a && a.r2; if (!r) return orig(a, now);
    const d = DEF[r.k], im = IM[r.k]; if (!d || !im) return;
    const [fw, fh, ax, ay] = d, sc = r.sc || (r.fx ? FXS : SC * (KSC[r.k] || 1));
    let col = 0, row = 0, flip = !!r.flip;
    if (r.walk) { const f = a.face || 'left'; row = f === 'up' ? 1 : f === 'down' ? 0 : 2; flip = f === 'right'; col = a.moving ? 1 + Math.floor(now * 8 + (r.ph || 0)) % 6 : 0; }
    else if (r.loop) col = Math.floor(now * r.loop + (r.ph || 0)) % d[4]; else col = Math.max(0, Math.min(d[4] - 1, r.f | 0));
    ctx.save(); ctx.globalAlpha *= a.alpha ?? 1;
    if (!r.fx) { ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 22, 7, 0, 0, 7); ctx.fill(); }
    ctx.translate(a.x, a.y + (r.dy || 0)); if (flip) ctx.scale(-1, 1); if (r.add) ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, col * fw, row * fh, fw, fh, -ax * sc, -ay * sc, fw * sc, fh * sc);
    if (r.glow) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= r.glow; ctx.drawImage(im, col * fw, row * fh, fw, fh, -ax * sc, -ay * sc, fw * sc, fh * sc); }
    ctx.restore();
  })(drawActorT);
  const mk = (k, x, y, o) => { const a = addActor('none', x, y, '', '#fff'); a.r2 = Object.assign({ k }, o || {}); a.wander = false; return a; };
  const play = async (a, k, fps, o) => { const d = DEF[k]; a.r2 = Object.assign({}, a.r2, { k, walk: false, loop: 0, f: 0 }, o || {}); for (let i = 0; i < d[4]; i++) { a.r2.f = i; await sleep(1000 / fps); } };
  const walkTo = (a, x, y, spd) => moveActor(a, x, y, spd || 170);
  const rm = (...as) => { world.actors = world.actors.filter(a => !as.includes(a)); };
  const snd = (n, v) => { try { playSnd(n, v); } catch (e) {} };

  const orig = hfBoss;
  hfBoss = async function () {
    if (!(await ready())) return orig();   // 图没下全就按原来的演
    const p = world.player; world.locked = true; world.path = null; p.moving = false;
    const B = S.flags.yegx_outfit === 'guxing' || (window.YEGX_OUTFIT && YEGX_OUTFIT.get() === 'guxing') ? 'ye_B_cast' : 'ye_A_cast';
    /* 先走到空地中间偏右：左边是木栅栏，站阵要留出位置 */
    try { if (Math.hypot(p.x - 1570, p.y - 1236) > 12) await moveActor(p, 1570, 1236, 200); } catch (e) {}
    const X = p.x, Y = p.y; p.face = 'right'; p.dir = 1; p.moving = false;
    const cast = []; let lz, zh, fl, mz;
    try {
      // ---- A. 林家援军跟上来站阵 ----
      lz = mk('lin_zhenshan_walk', X - 600, Y - 190, { walk: true }); lz.face = 'right';   /* 左边是木栅栏：大家从栅栏北边的路绕进来，不穿栅栏 */
      const SPOT = [['elder_teal_walk', -150, -78], ['elder_ochre_walk', -178, 4], ['elder_gray_walk', -132, 74],
        ['disciple_sword_walk', -218, -104], ['disciple_spear_walk', -232, -38], ['disciple_sword_walk', -222, 30], ['disciple_spear_walk', -236, 98], ['disciple_sword_walk', -286, -70], ['disciple_spear_walk', -294, -2], ['disciple_sword_walk', -288, 66]];
      const team = SPOT.map(([k, dx, dy], i) => { const a = mk(k, X - 650 - (i % 4) * 44 - (i > 2 ? 90 : 0), Y - 170 - (i % 3) * 26, { walk: true, ph: i * 1.7 }); a.face = 'right'; a._to = [X + dx, Y + dy]; return a; });
      cast.push(lz, ...team);
      const march = Promise.all([(async () => { await walkTo(lz, X - 250, Y - 150, 200); await walkTo(lz, X - 84, Y - 26, 200); })(), ...team.map((a, i) => (async () => { await sleep(120 + i * 90); await walkTo(a, X - 290 + (i % 3) * 22, Y - 150 - (i % 2) * 18, 200); await walkTo(a, a._to[0], a._to[1], 200); })())]);
      await sleep(900); await march; for (const a of [lz, ...team]) { a.face = 'right'; a.moving = false; }
      await narrate('聚义厅前的空地上火把通明。厅门「轰」地被一脚踹开——一个满脸横肉的大汉提着鬼头刀走了出来，身后跟着一个阴沉的灰袍人。');
      // ---- B. 门板碎飞、周虎踹出，方烈跟出 ----
      const door = mk('door_break', X + 372, Y + 6, { fx: true, f: 2 }); cast.push(door);
      zh = mk('zhouhu_kick', X + 318, Y - 26, { f: 0 }); zh.alpha = 0; cast.push(zh);
      snd('sfx_rock', .9); snd('sfx_boom', .6); S.shake = 14;
      tween(160, t => { zh.alpha = t; });
      await Promise.all([(async () => { for (let i = 2; i < 8; i++) { door.r2.f = i; await sleep(100); } rm(door); })(), play(zh, 'zhouhu_kick', 10)]);
      zh.r2 = { k: 'zhouhu_idle', loop: 5 };
      fl = mk('fanglie_walk', X + 620, Y + 34, { walk: true }); fl.face = 'left'; cast.push(fl);
      await walkTo(fl, X + 404, Y + 30, 150); fl.r2 = { k: 'fanglie_idle', loop: 5 };
      await say('周虎·怒', '小畜生，居然敢杀我黑风寨的人！老子今天非要将你们碎尸万段不可！');
      await say('方烈', '寨主稍安。两个天剑宗的娃娃而已，抓活的，那位大人会喜欢。');
      await say('叶孤星', '那位大人？');
      await say('方烈·坏笑', '你很快就知道了。');
      lz.r2 = { k: 'lin_zhenshan_point', f: 0 };
      await say('林震山·怒', '周虎！今日便是你黑风寨覆灭之时！长老们，随我上！');
      await fadeOut(200);
      const pr2 = startBattle({ title: '周虎 · 方烈', bg: 'bg_hall', enemies: [zhouhu(), fanglie()], exp: 520, gold: 400, boss: true, normalBgm: true }); await fadeIn(250); await pr2;
      S.scene = drawMap; lz.r2 = { k: 'lin_zhenshan_walk', walk: true }; lz.face = 'right';
      // ---- 魔族：黑袍现身 ----
      await narrate('就在此时，黑风谷深处，一股强大的气息宛如觉醒的洪荒凶兽般骤然爆发——');
      mz = mk('demon_reveal', X + 250, Y - 74, { f: 0 }); mz.alpha = 0; cast.push(mz); await tween(600, t => { mz.alpha = t; });
      window.R189M && R189M.vo && R189M.vo('b0');
      await say('魔族高手·坏笑', '凝丹一重居然能发挥出这种威力……天剑诀，果然不同凡响。可惜，今日你们都得死在这里。');
      await say('星旋', '小心！这家伙的气息不对劲——是魔族！');
      await fadeOut(200);
      const pr3 = startBattle({ title: '神秘高手', bg: 'bg_hall', enemies: [mozuBoss()], exp: 900, gold: 600, boss: true, normalBgm: true }); await fadeIn(250); await pr3;
      S.scene = drawMap; mz.r2 = { k: 'demon_reveal', f: 5 };   // 战后是被打出的真身
      await narrate('贪狼剑意凌厉无匹，贯穿了魔族高手的魔渊护体。他瞪大猩红的双眼，皮肤下浮现出一道道漆黑的魔纹。');
      window.R189M && R189M.vo && R189M.vo('h');
      await say('魔族高手', '咳……杀了本座又如何……魔族的计划，远比你们想象的……更可怕……');
      await play(mz, 'demon_death', 8); rm(mz);
      await narrate('话音未落，他的身躯化作缕缕黑烟，消散在山谷之中。');
      await say('星旋', '（魔族……这片大陆，已经很久没出现过魔族了。）');
      // ---- C. 方烈自爆 · D. 叶孤星双曜剑阵护众 ----
      await narrate('方烈见势不妙，眼中闪过一抹狠厉，体内灵丹骤然膨胀——他要自爆！');
      const swell = play(fl, 'fanglie_swell', 7); snd('sfx_charge', .8);
      await say('叶孤星', '双曜剑阵——起！');
      const ye = mk(B, X, Y, { f: 0 }); cast.push(ye); hideP = true;
      tween(420, t => { ye.x = X + 46 * t; });
      const sh = mk('shield_expand', X - 110, Y + 118, { fx: true, f: 0, sc: 1.15, glow: .7 }); sh.alpha = 1; cast.push(sh);
      snd('sfx_star', .9); snd('sfx_sword_ring', .7);
      await Promise.all([play(ye, B, 8), (async () => { await sleep(350); await play(sh, 'shield_expand', 10); sh.r2 = { k: 'shield_loop', fx: true, loop: 10, sc: 1.15, glow: .7 }; })(), swell]);
      for (const a of team) if (/disciple/.test(a.r2.k)) a.r2 = { k: 'disciple_protect', f: 0 };
      const ex = mk('explosion', fl.x - 40, fl.y + 150, { fx: true, f: 0, dy: -150, sc: 1.25 }); cast.push(ex);
      S.flash = 1; S.flashColor = '#ffffff'; S.shake = 26; snd('sfx_ult', .9); snd('sfx_boom', 1);
      rm(fl);
      await Promise.all([play(ex, 'explosion', 12), (async () => { await sleep(330); S.shake = 18; await play(sh, 'shield_hit', 12); sh.r2 = { k: 'shield_loop', fx: true, loop: 10, sc: 1.15, glow: .7 }; })()]);
      rm(ex); await sleep(500);
      await play(sh, 'shield_dissolve', 8); rm(sh);
      for (const a of team) if (a.r2.k === 'disciple_protect') { a.r2 = { k: SPOT[team.indexOf(a)][0], walk: true }; a.face = 'right'; }
      hideP = false; p.x = ye.x; rm(ye);
      await narrate('狂暴的气浪撞在星光剑阵上，碎石漫天。烟尘散去，方烈已化为飞灰，剑阵后众人毫发无伤。');
      await say('周虎', '饶……饶命！那人是自己找上门的，说帮我突破修为，我什么都不知道啊！');
      await say('叶孤星', '你满手血腥，害人无数，根本不配继续活在世上。');
      await tween(500, t => { zh.alpha = 1 - t; }); rm(zh);
      await narrate('为祸四方多年的黑风寨，终于被彻底清扫一空。');
      await showPanel('玉佩浮现', ['!【任务完成】击杀黑风寨寨主周虎　星辰点 +100', '!【任务完成】弄清楚神秘高手的真实身份　星辰点 +200', '!【任务完成】击败神秘高手　星辰点 +500', '超额完成　星辰点 +100']);
      S.hero.points = (S.hero.points || 0) + 900;
      await say('云霆', '魔族的事，得尽快报回宗……');
      await narrate('话未说完，云霆身子一晃，脸色瞬间惨白，嘴角渗出一丝鲜血，整个人无力地朝后倒去。');
      await say('叶孤星', '云霆！');
      S.flags.ch2_done = 1;
      await fadeOut(800);
    } finally { hideP = false; rm(...cast); }
    await ch2After();
  };
  window.R210_HF = { load, ready, DEF, IM };
})();

// ================= 方烈战斗建模 · 迎敌精修（Codex R207 修订，作者 11-12「做了新建模方烈的，你接入」）=================
// 朝右（左敌右我）、双脚落地、刀锋前指。用新文件名避开旧图集里的同名缓存；图没下好之前仍用旧图。
(function () {
  if (typeof IMG === 'undefined') return;
  const im = new Image(); let ok = false; im.onload = () => { ok = true; }; im.src = 'assets3/e_fanglie_r207.webp';
  let old = IMG.e_fanglie;
  try { Object.defineProperty(IMG, 'e_fanglie', { configurable: true, enumerable: true, get: () => (ok ? im : old), set: v => { old = v; } }); } catch (e) {}
})();
