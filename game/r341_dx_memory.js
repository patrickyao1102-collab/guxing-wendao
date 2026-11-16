// ================= R341 · 东厢朝南大结局：小时候的回忆（作者 11-17）（只进测试版）=================
// 「直接把这个情景带入小时候……师傅跟他们两个，小时候感情就很好，然后再说话，用头顶冒泡那种方式去说，你一句我一句，
//   这样说着说着，然后慢慢慢慢的就是变黑。」
// 小人：Codex R339 定稿（小阿焰 84px、小阿澈 78px、师父 112px），四向行走 + 朝下待机；图集 4 行（下/上/左/右）× 4 帧，每格 320×480（@2x），脚点 (160,464)。
// 剧情动作帧（看火、烫手、糊药、笑、落桂花）Codex 还在做；做好之前先用行走 / 待机帧 + 走位 + 冒泡演。
// 用法：await DX_MEMORY({ stove: [x, y], gate: [x, y] })   —— 在当前地图上演；演完画面停在全黑，调用方接着放视频。
(function () {
  if (typeof walkFinalDraw !== 'function' || typeof tileDraw !== 'function') return;
  const SH = {};
  const load = (k, s) => { const im = new Image(); im.onload = () => { SH[k] = im; }; im.src = s; };
  for (const k of ['yan', 'che', 'shifu']) { load(k + '_walk', 'r341/' + k + '_walk.webp?v=1'); load(k + '_idle', 'r341/' + k + '_idle.webp?v=1'); }
  const HT = { yan: 84, che: 78, shifu: 112 }, ROW = { down: 0, up: 1, left: 2, right: 3 };
  walkFinalDraw = (o => function (a, now) {
    const who = a && a._r341;
    if (who && SH[who + '_walk']) {
      try {
        let f = a.face || 'down'; if (!(f in ROW)) f = 'down';
        const t = now || performance.now() / 1000;
        ctx.save(); ctx.globalAlpha *= a.alpha ?? 1;
        if (!a.moving && f === 'down' && SH[who + '_idle']) ctx.drawImage(SH[who + '_idle'], (Math.floor(t / .4) % 4) * 320, 0, 320, 480, a.x - 80, a.y - 232 - (a.hop || 0), 160, 240);
        else ctx.drawImage(SH[who + '_walk'], (a.moving ? Math.floor(t / .16) % 4 : 1) * 320, ROW[f] * 480, 320, 480, a.x - 80, a.y - 232 - (a.hop || 0), 160, 240);
        ctx.restore();
      } catch (e) {}
      return true;
    }
    return o.apply(this, arguments);
  })(walkFinalDraw);
  // 回忆滤镜：暖黄、四角压暗；落桂花
  let MEM = 0, PET = [], DARK = 0;
  tileDraw = (o => function () { const r = o.apply(this, arguments);
    try { if (MEM > 0) {
      ctx.save(); ctx.globalAlpha = .42 * MEM; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#e2b877'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .28, W / 2, H / 2, Math.max(W, H) * .75); g.addColorStop(0, 'rgba(40,24,6,0)'); g.addColorStop(1, `rgba(40,24,6,${.72 * MEM})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
      if (PET.length) { const cam = world.cam || { x: 0, y: 0 }, z = typeof VZ === 'function' ? VZ() : 1, now = performance.now() / 1000;
        ctx.save(); if (z !== 1) ctx.scale(z, z); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
        for (const p of PET) { p.y += p.vy; p.x += Math.sin(now * 2 + p.s) * .6; ctx.globalAlpha = Math.min(1, p.life / 40) * MEM; ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(p.x, p.y, 3.2, 2.2, p.s, 0, 7); ctx.fill(); p.life--; }
        PET = PET.filter(p => p.life > 0); ctx.restore(); } }
      if (DARK > 0) { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${Math.min(1, DARK)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    } catch (e) {}
    return r; })(tileDraw);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const tw = (ms, fn) => new Promise(res => { const t0 = performance.now(); const step = () => { const k = Math.min(1, (performance.now() - t0) / ms); fn(k); if (k < 1) requestAnimationFrame(step); else res(); }; step(); });
  const mk = (who, x, y, face) => { const a = addActor('none', x, y, '', '#c9a86a'); a._r341 = who; a.h = HT[who]; a.face = face || 'down'; a.dir = face === 'left' ? -1 : 1; return a; };
  const say = (a, t, ms) => (window.BUB ? BUB.say(a, t, { h: HT[a._r341] + 4, ms }) : wait(1600));
  const hop = async a => { await tw(140, k => a.hop = Math.sin(k * Math.PI) * 10); a.hop = 0; };
  const petals = (x, y, n) => { for (let i = 0; i < n; i++) PET.push({ x: x + (Math.random() - .5) * 260, y: y - 260 - Math.random() * 120, vy: .8 + Math.random() * .9, s: Math.random() * 6, life: 220 + Math.random() * 120, c: Math.random() < .7 ? '#f2c94c' : '#e8a93a' }); };
  // ---------- R345：Codex 正式动作帧（A0 跑进院 / A 看火 / B 烫手 / C 糊药 / D 笑 / E 落桂花 / F 师父）----------
  // tl.json：每段 frames = [毫秒, [[图, 世界左上x, y, 宽, 高, z], …], 说明]；播的时候把这一帧的图层临时塞进地图物件里（和人一起按 z 排前后）
  let TL = null; const FIMG = {};
  try { const x = new XMLHttpRequest(); x.open('GET', 'r345/tl.json?v=1', false); x.send(); if (x.status === 200 || x.status === 0) TL = JSON.parse(x.responseText); } catch (e) {}
  const pre = () => { if (!TL) return; for (const k in TL) for (const f of TL[k].frames) for (const l of f[1]) if (!FIMG[l[0]]) { const im = new Image(); im.src = 'r345/' + l[0] + '.webp?v=1'; FIMG[l[0]] = im; try { IMG['r345_' + l[0]] = im; } catch (e) {} } };
  let CUR = [];
  const show = f => { const T = world.map && world.map.T; if (!T || !T.objs) return; T.objs = T.objs.filter(o => !o._r345); CUR = f[1].map((l, i) => ({ _r345: 1, bk: true, img: 'r345_' + l[0], id: 'r345_' + l[0], uid: 'r345_' + i, x: l[1], y: l[2], w: l[3], h: l[4], sy: l[5], noBlock: true })); T.objs.push(...CUR); };
  const clearSeg = () => { const T = world.map && world.map.T; if (T && T.objs) T.objs = T.objs.filter(o => !o._r345); };
  // 播一段：loops 次（单次段 loops=1）；hold=true 时停在最后一帧不清掉
  const seg = async (k, loops) => { const S0 = TL && TL[k]; if (!S0) return; for (let n = 0; n < (loops || 1); n++) for (const f of S0.frames) { show(f); await wait(f[0]); } };
  const loopWhile = (k) => { let stop = false; const run = (async () => { while (!stop) await seg(k, 1); })(); return () => { stop = true; return run; }; };
  window.DX_MEMORY_TL = !!TL;
  window.DX_MEMORY = async function (o) {
    o = o || {}; const [sx, sy] = o.stove || [world.player.x, world.player.y], [gx, gy] = o.gate || [sx + 300, sy + 220];
    const keep = (world.actors || []).slice();
    world.locked = true; window.R328_OFF = true;
    try {
      // 白一下，进回忆
      S.flash = .9; S.flashColor = '#fff4d8';
      for (const a of world.actors) if (a !== world.player) a.hidden = true; world.player.hidden = true;
      MEM = 1;
      if (TL && o.pos) { pre(); try { if (window.DX_GATE) DX_GATE('half'); } catch (e) {} await new Promise(r => setTimeout(r, 400));
        const Q = o.pos, A = { x: Q.yan[0], y: Q.yan[1], _r341: 'yan' }, C = { x: Q.che[0], y: Q.che[1], _r341: 'che' }, M = { x: Q.shifu[0], y: Q.shifu[1] + 18, _r341: 'shifu' };
        const sb = (a, t, ms, h) => (window.BUB ? BUB.say(a, t, { h: h || 90, ms }) : wait(1600));
        world.camFocus = [Q.stove[0] + 60, Q.stove[1] - 70];
        await wait(700);
        const run0 = seg('A0', 1); await wait(300); sb({ x: Q.che_in[0], y: Q.che_in[1] - 60 }, '师兄——！', 1200, 80); await run0;
        let stopA = loopWhile('A'); await sb(C, '师父让我来看你看火！', 1900, 82);
        await sb(M, '火候是熬出来的，急不得。', 2300, 96);
        await sb(A, '我不急。', 1400, 60);
        await stopA();
        await seg('B', 1); await sb(A, '……不疼。', 1500, 84);
        await seg('C', 1); await sb(C, '我自己配的药……好像配多了。', 2300, 80);
        let stopD = loopWhile('D'); await sb(A, '哈哈……你看我这手，黑得跟炭一样。', 2400, 84);
        await sb(M, '你们俩啊，一个看火，一个下药。往后谁也离不了谁。', 3200, 96); await stopD();
        petals(Q.stove[0] + 40, Q.stove[1], 60);
        await seg('E', 1); await sb(A, '别动，头上有花。', 1700, 84);
        await sb(C, '师兄，以后你炼丹，我给你配药。', 2600, 82); await sb(A, '……嗯。', 1500, 84);
        let stopF = loopWhile('F'); petals(Q.stove[0] + 40, Q.stove[1], 40); await wait(1800);
        await tw(3200, k => DARK = k); DARK = 1; await stopF(); await wait(400); clearSeg();
        return; }
      const Q = o.pos || {}; const at = (k, d) => Q[k] || d;
      const shifu = mk('shifu', ...at('shifu', [sx - 120, sy - 10]), 'down'), yan = mk('yan', ...at('yan', [sx + 34, sy + 6]), 'left');
      const che = mk('che', ...at('che_in', [gx, gy]), 'up'); const cheAt = at('che', [sx + 130, sy + 30]), cheNear = [cheAt[0] - 34, cheAt[1]];
      world.camFocus = [sx, sy - 40];
      await wait(900);
      // 小阿澈从院门口跑进来
      const run = async (a, x, y, spd) => { await moveActor(a, x, y, spd || 200); };
      say(che, '师兄——！'); for (const [px, py] of (Q.che_path || [])) await run(che, px, py, 230); await run(che, cheAt[0], cheAt[1], 230); che.face = 'left';
      await say(che, '师父让我来看你看火！');
      await say(shifu, '火候是熬出来的，急不得。');
      await say(yan, '我不急。');
      await wait(500);
      // 掀炉盖，一烫（动作帧做好之前：跳一下）
      yan.face = 'up'; await wait(500); await hop(yan); yan.face = 'down';
      await say(yan, '……嘶。', 1100);
      await say(yan, '不疼。');
      await run(che, cheNear[0], cheNear[1], 160); che.face = 'left';
      await say(che, '我看看！');
      await say(che, '我自己配的药——', 1500);
      await say(che, '……好像配多了。');
      await say(yan, '哈哈……你看我这手，黑得跟炭一样。');
      await say(shifu, '你们俩啊，一个看火，一个下药。往后谁也离不了谁。', 3200);
      // 一阵风，桂花落下来
      petals(sx + 20, sy, 60); await wait(1200);
      yan.face = 'right'; await wait(600);
      await say(yan, '别动，头上有花。', 1800);
      await say(che, '师兄，以后你炼丹，我给你配药。', 2600);
      await say(yan, '……嗯。', 1600);
      petals(sx + 20, sy, 40);
      await say(shifu, '（摇了摇头，笑着捋胡子）', 1800);
      // 慢慢变黑
      await tw(3200, k => DARK = k); DARK = 1; await wait(500);
    } finally {
      clearSeg(); world.actors = keep; for (const a of world.actors) a.hidden = false; world.player.hidden = false;
      MEM = 0; PET = []; world.camFocus = null; window.R328_OFF = false; world.locked = false;
      try { if (window.BUB) BUB.clear(); } catch (e) {}
      try { S.fade = 1; } catch (e) {} DARK = 0;   // 画面停在全黑（S.fade=1），由调用方接着放视频 / 切图
    }
  };
})();
