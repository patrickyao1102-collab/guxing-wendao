// ================= R221 · 支线剧情动画帧 + 支线人物小人（Codex 第一批；只进测试版）=================
// 不改各支线脚本：在 say 最外层包一层，说到指定那句话时，在地图上 / 屏幕上播对应的动画帧。
// 叶孤星本人的动作帧（按骰盅、取剑、并指）Codex 用错了参考，在重做，这里先不用。
(function () {
  const M = window.R221_M; if (!M || typeof TMAPS === 'undefined' || typeof say !== 'function') return;
  const IMGS = {}, need = k => { if (!IMGS[k]) { const im = new Image(); im.src = 'r221/' + k + '.webp'; IMGS[k] = im; } return IMGS[k]; };
  const ok = im => im && im.complete && im.naturalWidth > 0;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const F = () => (S.flags = S.flags || {});
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  // ---------- 播放器 ----------
  const live = [];   // {k, x, y, sc, t0, loop, hold, screen, dim, flip}
  const frameOf = (o, now) => { const d = M[o.k], f = Math.floor((now - o.t0) / 1000 * (o.fps || d.fps)); return o.loop ? f % d.n : Math.min(d.n - 1, f); };
  const drawOne = (o, now) => { const d = M[o.k], im = need(o.k); if (!ok(im)) return; const f = frameOf(o, now), sc = o.sc || d.s || 1;
    ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha; ctx.translate(o.x, o.y); if (o.flip) ctx.scale(-1, 1);
    ctx.drawImage(im, (f % d.cols) * d.w, Math.floor(f / d.cols) * d.h, d.w, d.h, -d.ax * sc, -d.ay * sc, d.w * sc, d.h * sc); ctx.restore(); };
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function (T, cam, now) { orig(T, cam, now); const t = performance.now(); for (const o of live) if (!o.screen) drawOne(o, t); })(tileAmbientHigh);
  const layer = { draw() { const t = performance.now(); for (const o of live) if (o.screen) { if (o.dim) { ctx.save(); ctx.fillStyle = 'rgba(8,10,20,' + o.dim + ')'; ctx.fillRect(0, 0, W, H); ctx.restore(); } drawOne(o, t); } } };
  const ensureLayer = () => { try { if (S.overlay.indexOf(layer) < 0) S.overlay.push(layer); } catch (e) {} };
  const rm = o => { const i = live.indexOf(o); if (i >= 0) live.splice(i, 1); };
  const fx = (k, o) => { need(k); const h = Object.assign({ k, t0: performance.now() }, o || {}); live.push(h); ensureLayer(); return h; };
  const dur = (k, fps) => M[k].n / (fps || M[k].fps) * 1000;
  const once = async (k, o, keep) => { const h = fx(k, o); await sleep(dur(k, o && o.fps) + (keep || 0)); if (!(o && o.stay)) rm(h); return h; };
  const snd = (k, v) => { try { playSnd(k, v); } catch (e) {} };
  const actor = name => (world.actors || []).find(a => a.npc && a.npc.name === name && !a.hidden);
  const hero = () => world.player || { x: 640, y: 400 };
  for (const k of Object.keys(M)) if (!/portrait|walk|^ye_/.test(k)) need(k);

  // ---------- 支线人物小人（三向站立 / 行走）----------
  const WALK = { '沈霜': 'shen_shuang_walk', '柳三娘': 'liu_sanniang_walk', '钱满仓': 'qian_mancang_walk', '云来客栈伙计': 'ashun_walk', '秦老': 'qinlao_walk' };
  for (const k of Object.values(WALK)) need(k);
  if (typeof drawActorT === 'function') drawActorT = (orig => function (a, now) {
    const k = a.npc && WALK[a.npc.name], im = k && IMGS[k]; if (!k || !ok(im) || a.hidden) return orig(a, now);
    const d = M[k], f = a.face || a.npc.face || 'down', row = f === 'up' ? 1 : f === 'down' ? 0 : 2, col = a.moving ? 1 + Math.floor(now * 7) % 6 : 0, sc = d.s;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 22, 7, 0, 0, 7); ctx.fill();
    ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y); if (f === 'right') ctx.scale(-1, 1);
    ctx.drawImage(im, col * d.w, row * d.h, d.w, d.h, -d.ax * sc, -d.ay * sc, d.w * sc, d.h * sc); ctx.restore();
  })(drawActorT);
  // 新画风立绘（Codex R224：人不变，只减写实感）——先到的两张
  try { for (const [n, k, c] of [['沈霜', 'p2_shen_shuang', '#bcd0e0'], ['秦老', 'p2_qinlao', '#d8d0b8']]) { const im = new Image(); im.onload = () => { IMG['p_r221_' + k] = im; }; im.src = 'r221/' + k + '.webp'; SPEAKERS[n] = Object.assign({}, SPEAKERS[n], { p: 'p_r221_' + k, color: (SPEAKERS[n] || {}).color || c }); } } catch (e) {}

  // ---------- 说到哪句话，播哪段 ----------
  const truth = async () => { snd('sfx_star', .5); await once('truth_freeze', { screen: true, x: W / 2, y: H / 2, sc: 1, fps: 14 }); };
  const objOf = (map, id) => { try { return TMAPS[map].baked.objs.find(o => o.id === id); } catch (e) { return null; } };
  let dead = null;
  const CUES = [
    // 长乐坊
    [/叶孤星一掌按在骰盅上/, async () => { const t = objOf('qy_changle', 'dice_table'); if (!t) return; snd('sfx_star', .6); await once('dice_magic', { x: t.x + t.w / 2, y: t.y + 62, sc: .62 }, 300); }],
    [/一脚踹翻了桌子/, async () => { const t = objOf('qy_changle', 'dice_table'); if (!t) return; S.shake = 14; snd('sfx_boom', .7);
      const a = actor('庄家'); const k = a ? fx('dealer_kick', { x: a.x, y: a.y, sc: .5 }) : null; if (a) a.alpha = 0;
      await once('table_flip', { x: t.x + t.w / 2, y: t.sy + 8, sc: .62 }, 200); if (k) rm(k); if (a) a.alpha = 1;
      const p = hero(); fx('thugs_draw', { x: p.x, y: p.y + 96, sc: .5, life: 1 }); await sleep(dur('thugs_draw') + 500); for (const o of live.slice()) if (o.k === 'thugs_draw') rm(o); }],
    // 天字三号房 · 当众说穿
    [/^手很胖。$/, async () => { await once('window_fat_hand', { screen: true, dim: .62, x: W / 2, y: H / 2 + 150, sc: 1.6, fps: 5 }, 500); }, '沈霜'],
    [/所以没有贼。因为从头到尾，就没有那箱药/, truth],
    [/「扑通」一声，从椅子上滑到了地上/, async () => { S.shake = 8; const a = actor('钱满仓'); if (!a) return; a.alpha = 0; const h = fx('qian_mancang_kowtow', { x: a.x, y: a.y, sc: .5 }); const end = async () => { for (let i = 0; i < 600; i++) { await sleep(500); if (!world.locked && !S.dialog) break; } rm(h); a.alpha = 1; }; end(); }],
    // 万宝楼的赝品 · 当众说穿
    [/^他没有偷。$/, truth],
    [/剑出鞘三寸。满室生寒/, async () => { const p = hero(); snd('sfx_sword_ring', .7); const t = objOf('xt_wanbao_vip', 'appraisal_table');
      const ice = t ? fx('tea_ice', { x: t.x + t.w / 2 - 40, y: t.y + 70, sc: .5, fps: 5 }) : null; await once('frost_sword', { x: p.x + 46, y: p.y - 30, sc: .7, fps: 5 }, 600); if (ice) setTimeout(() => rm(ice), 6000); }],
    [/执事撞碎了窗棂/, async () => { const B = TMAPS.xt_wanbao_vip && TMAPS.xt_wanbao_vip.baked; const wx = B ? 1410 : hero().x + 300, wy = 300; S.shake = 12; snd('sfx_boom', .6);
      const w = fx('window_break', { x: wx, y: wy, sc: .7 }); await once('steward_escape', { x: wx - 60, y: wy + 110, sc: .5 }, 100); rm(w);
      const inv = fx('invite_fall', { x: wx - 150, y: wy + 330, sc: .5 }); setTimeout(() => rm(inv), 9000); await sleep(dur('invite_fall')); }],
    // 三十个名字 · 旧染坊
    [/一刻钟进一个。前面的人进去了，可有一个出来过/, truth],
    [/齐刷刷泛起一层幽幽的青光/, async () => { const hs = []; for (const n of ['等着入场的散修', '抱着刀的散修']) { const a = actor(n); if (a) hs.push(fx('invite_glow', { x: a.x + 14, y: a.y - 58, sc: .4, loop: true })); } const p = hero(); hs.push(fx('invite_glow', { x: p.x - 90, y: p.y - 70, sc: .4, loop: true })); snd('sfx_star', .4); setTimeout(() => hs.forEach(rm), 7000); await sleep(900); }],
    [/把帖子扔在了地上，像扔一块烧红的炭/, async () => { const a = actor('抱着刀的散修'); if (!a) return; a.alpha = 0; await once('cultivator_throw', { x: a.x, y: a.y, sc: .5 }, 300); a.alpha = 1; }],
    [/然后，门自己开了/, async () => { await once('dye_gate', { screen: true, dim: .7, x: W / 2, y: H / 2 + 190, sc: 1.5, fps: 5 }, 500); }],
    [/接引使的斗笠裂成两半/, async () => { const p = hero(), x = p.x + 150, y = p.y - 60; snd('sfx_sword_ring', .7); await once('hat_split', { x, y, sc: .5, fps: 6 }, 150); dead = fx('hat_death', { x, y, sc: .5, fps: 3 }); }],
    [/^都活着？/, async () => { if (dead) { rm(dead); dead = null; } }],
  ];
  say = (orig => async function (who, text) {
    try { for (const [re, fn, w] of CUES) if (re.test(String(text || '')) && (!w || w === who)) { try { await fn(); } catch (e) { console.warn('R221 cue', e); } break; } } catch (e) {}
    return orig.apply(this, arguments);
  })(say);
  window.R221 = { fx, once, rm, live, M };
})();
