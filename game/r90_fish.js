// R90 青竹小院 · 小池垂钓（有点难度）
// 流程：抛竿 → 等鱼（会有假咬，点早了鱼会被吓跑一会儿）→ 浮漂猛沉，0.5 秒内点下去 → 收线：按住收线、松手放线，
// 张力保持在中间那段（青色区）进度才涨；太紧断线、太松脱钩。每次在床榻歇息后刷新 5 竿。
// 画面现在是代码画的占位（池面 / 浮漂 / 张力条），等 Codex 出正式美术再换。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.qingzhu_court || typeof ITEM_DB === 'undefined') return;
  // ---------- 渔获 ----------
  Object.assign(ITEM_DB, {
    f_carp: { name: '红鲤', sell: 15, desc: '小院池里的红鲤，肥得游不动。可以卖钱' },
    f_scale: { name: '青鳞鱼', sell: 22, desc: '青鳞闪闪，劲儿不小。可以卖钱' },
    f_star: { name: '星斑锦鲤', sell: 120, desc: '只在夜里咬钩的锦鲤，鳞上有细碎星斑。星旋看见它两眼放光' },
    f_sword: { name: '小木剑', sell: 0, desc: '刻着歪歪扭扭的「孤星」二字。小时候练剑时脱手飞进池里的那把' },
  });
  const F = () => (S.flags = S.flags || {});
  const CASTS = 5;
  const left = () => CASTS - (F().fish_used || 0);
  if (typeof partyHealAll === 'function') partyHealAll = (orig => function () { F().fish_used = 0; return orig.apply(this, arguments); })(partyHealAll);
  const night = () => F().res_tod === 'night';
  function roll() {
    const f = F(), wins = f.fish_wins || 0;
    if (!f.fish_sword && wins >= 4 && Math.random() < .5) return { id: 'f_sword', name: '小木剑', power: .55, speed: 1.0, zone: .30, need: 3.2, junk: 'sword' };
    const t = [['f_carp', 40], ['f_scale', 28], ['leaf', 9], ['shoe', 8]]; if (night()) t.push(['f_star', 12]);
    let r = Math.random() * t.reduce((a, b) => a + b[1], 0), id = t[0][0]; for (const [k, w] of t) { if ((r -= w) < 0) { id = k; break; } }
    return ({ f_carp: { id, name: '红鲤', power: .5, speed: 1.0, zone: .34, need: 3.0 },
      f_scale: { id, name: '青鳞鱼', power: .75, speed: 1.4, zone: .28, need: 3.6 },
      f_star: { id, name: '星斑锦鲤', power: 1.0, speed: 1.9, zone: .22, need: 4.4, window: .4 },
      leaf: { id: null, name: '一片竹叶', power: .25, speed: .6, zone: .4, need: 1.8, junk: 'leaf' },
      shoe: { id: null, name: '一只破草鞋', power: .35, speed: .7, zone: .4, need: 2.2, junk: 'shoe' } })[id];
  }
  // ---------- 画面（占位）----------
  const G = { on: false, phase: '', t: 0, bob: 0, tension: .5, prog: 0, msg: '', msgT: 0, fish: null, splash: 0, fx: 0 };
  const PX = W / 2, PY = H / 2 + 20;
  function draw() {
    if (!G.on) return; const now = performance.now() / 1000;
    ctx.save(); ctx.fillStyle = 'rgba(4,10,16,.62)'; ctx.fillRect(0, 0, W, H);
    // 池面
    const R = { x: PX - 380, y: PY - 230, w: 760, h: 420 };
    const g = ctx.createLinearGradient(0, R.y, 0, R.y + R.h); g.addColorStop(0, night() ? '#0d2238' : '#2c6a74'); g.addColorStop(1, night() ? '#061322' : '#14424c');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(R.x, R.y, R.w, R.h, 28); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(232,214,170,.85)'; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.roundRect(R.x, R.y, R.w, R.h, 28); ctx.clip();
    for (let i = 0; i < 9; i++) { const y = R.y + 40 + i * 44, a = .06 + .04 * Math.sin(now * 1.3 + i); ctx.strokeStyle = `rgba(220,245,255,${a})`; ctx.lineWidth = 2; ctx.beginPath(); for (let x = R.x; x <= R.x + R.w; x += 20) { const yy = y + Math.sin(x * .02 + now * 1.6 + i) * 4; x === R.x ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
    if (night()) for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(255,250,220,${.3 + .3 * Math.sin(now * 2 + i)})`; ctx.fillRect(R.x + (i * 137) % R.w, R.y + (i * 59) % R.h, 2, 2); }
    // 浮漂
    const fx = PX + G.fx, sink = G.phase === 'bite' ? 26 : 0, fy = PY - 10 + Math.sin(now * 3) * 3 + G.bob * 10 + sink;
    for (let k = 0; k < 3; k++) { const rr = ((now * 40 + k * 26) % 78) + (G.splash ? 30 : 0); ctx.strokeStyle = `rgba(230,250,255,${.35 * (1 - rr / 110)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(fx, PY + 6, rr, rr * .3, 0, 0, 7); ctx.stroke(); }
    if (G.splash > 0) { ctx.fillStyle = `rgba(240,252,255,${G.splash})`; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI, d = 30 + (1 - G.splash) * 40; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * d * 1.4, PY - Math.sin(a) * d * .8, 4, 0, 7); ctx.fill(); } }
    ctx.restore();
    // 鱼线
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PX + 330, R.y - 40); ctx.quadraticCurveTo(PX + 160, PY - 160 + G.tension * 120, fx, fy - 18); ctx.stroke();
    ctx.fillStyle = '#e8463a'; ctx.beginPath(); ctx.ellipse(fx, fy - 12, 7, 12, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff6e0'; ctx.beginPath(); ctx.ellipse(fx, fy - 2, 7, 6, 0, 0, Math.PI); ctx.fill();
    // 收线：张力条 + 进度
    if (G.phase === 'reel') { const B = { x: PX - 300, y: R.y + R.h + 26, w: 600, h: 26 }, z = G.fish.zone, z0 = .5 - z / 2;
      ctx.fillStyle = 'rgba(10,14,20,.8)'; ctx.fillRect(B.x - 4, B.y - 4, B.w + 8, B.h + 8);
      ctx.fillStyle = 'rgba(200,70,50,.55)'; ctx.fillRect(B.x, B.y, B.w, B.h);
      ctx.fillStyle = 'rgba(90,220,210,.85)'; ctx.fillRect(B.x + B.w * z0, B.y, B.w * z, B.h);
      ctx.fillStyle = '#fff4d0'; ctx.fillRect(B.x + B.w * G.tension - 4, B.y - 8, 8, B.h + 16);
      ctx.fillStyle = 'rgba(10,14,20,.8)'; ctx.fillRect(B.x - 4, B.y + 40, B.w + 8, 14); ctx.fillStyle = '#ffd77a'; ctx.fillRect(B.x, B.y + 43, B.w * Math.min(1, G.prog / G.fish.need), 8);
      ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#f6ecd0'; ctx.fillText('按住收线 · 松手放线 · 让白线停在青色区', PX, B.y + 84); }
    // 顶部信息
    ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = '#f6ecd0'; ctx.fillText('小池垂钓　今日还剩 ' + Math.max(0, left()) + ' 竿' + (night() ? '　· 夜钓' : ''), R.x + 6, R.y - 18);
    if (G.msg && G.msgT > 0) { ctx.font = `46px ${typeof BRUSH !== 'undefined' ? BRUSH : FONT}`; ctx.textAlign = 'center'; textOutline(G.msg, PX, R.y + 70, '#ffe39a', '#1a0c00', 6); }
    ctx.restore();
  }
  S.overlay.push({ draw });
  const frame = () => new Promise(r => requestAnimationFrame(r));
  // 自己听按下事件（主循环可能先把 input.tapped 吃掉）
  cv.addEventListener('pointerdown', () => { if (G.on) G.tap = true; });
  const tapNow = () => { const t = G.tap; G.tap = false; consumeTap(); return !!t; };
  function say2(m, s = 1.2) { G.msg = m; G.msgT = s; }
  async function fishOnce() {
    G.on = true; G.phase = 'wait'; G.tension = .5; G.prog = 0; G.splash = .8; G.fx = (Math.random() - .5) * 160; say2('抛竿', .8);
    try { playSnd('sfx_swing'); } catch (e) {}
    let last = performance.now(), wait = 2 + Math.random() * 4, nib = 0; consumeTap(); G.tap = false;
    // 等鱼：中间会有两三次假咬，点早了吓跑
    while (true) { await frame(); const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; G.t += dt; G.msgT -= dt; G.splash = Math.max(0, G.splash - dt * 1.5);
      wait -= dt; nib -= dt; G.bob = nib > 0 ? Math.sin(nib * 40) * .5 : 0; if (nib < -1 && Math.random() < dt * .5 && wait > .6) nib = .35;
      if (tapNow()) { say2('点早了，鱼被吓跑了……', 1.4); wait += 1.8; try { playSnd('ui_cancel'); } catch (e) {} }
      if (wait <= 0) break; }
    // 咬钩
    const fish = roll(); G.fish = fish; G.phase = 'bite'; G.splash = 1; say2('咬钩！', .6); try { playSnd('sfx_hit', .5); } catch (e) {}
    let win = fish.window || .5, hit = false; last = performance.now();
    while (win > 0) { await frame(); const now = performance.now(), dt = (now - last) / 1000; last = now; win -= dt; G.msgT -= dt; G.splash = Math.max(0, G.splash - dt * 2); if (tapNow()) { hit = true; break; } }
    if (!hit) { G.phase = ''; say2('没点中……鱼溜了', 1.4); await sleep(1100); return null; }
    // 收线
    G.phase = 'reel'; let slack = 0, surge = 0, sdir = 1; last = performance.now();
    while (true) { await frame(); const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; G.msgT -= dt; consumeTap();
      surge -= dt; if (surge <= 0) { surge = .4 + Math.random() * 1.2 / fish.speed; sdir = Math.random() < .55 ? 1 : -1; }
      const pull = fish.power * (.35 + .65 * Math.abs(Math.sin(now / 1000 * fish.speed * 2.3))) * sdir;
      G.tension += ((input.down ? .55 : -.5) + pull * .5) * dt; G.tension = Math.max(0, Math.min(1, G.tension));
      G.fx += Math.sin(now / 300 * fish.speed) * 2;  G.fx = Math.max(-300, Math.min(300, G.fx));
      const z0 = .5 - fish.zone / 2, inZone = G.tension >= z0 && G.tension <= z0 + fish.zone;
      G.prog = Math.max(0, G.prog + (inZone ? dt : -dt * .45));
      if (G.tension >= .99) { G.phase = ''; say2('线断了！', 1.4); try { playSnd('sfx_hurt'); } catch (e) {} await sleep(1100); return null; }
      slack = G.tension <= .02 ? slack + dt : 0; if (slack > .9) { G.phase = ''; say2('线太松，脱钩了', 1.4); await sleep(1100); return null; }
      if (G.prog >= fish.need) break; }
    G.phase = ''; G.splash = 1; try { playSnd('ui_confirm'); } catch (e) {} return fish;
  }
  async function fishing() {
    if (left() <= 0) { await narrate('今天钓得够多了。池里的红鲤都学精了——去床上歇一觉再来。'); return; }
    world.locked = true; const hud = S.hud; S.hud = false;
    try {
      while (left() > 0) {
        F().fish_used = (F().fish_used || 0) + 1;
        const got = await fishOnce(); G.on = false;
        if (got) {
          if (got.junk === 'leaf') await narrate('钓上来一片竹叶。它看起来比你还惊讶。');
          else if (got.junk === 'shoe') await narrate('钓上来一只破草鞋。左脚的。右脚那只……大概还在池底等你。');
          else if (got.junk === 'sword') { F().fish_sword = 1; addItem('f_sword', 1); await narrate('鱼线一沉，拽上来的不是鱼——是一把泡得发白的小木剑，剑身刻着歪歪扭扭的「孤星」二字。'); await narrate('七岁那年练剑，剑脱手飞进池里，捞了一下午没捞着。原来一直在这儿。'); if (F().xx_met || window.JIUYAO_OWNED && JIUYAO_OWNED()) await say('星旋', '噗——你七岁就会让剑飞了？天才啊。'); toast('获得 小木剑', 1600); }
          else { F().fish_wins = (F().fish_wins || 0) + 1; addItem(got.id, 1); F().fish_book = F().fish_book || {}; F().fish_book[got.id] = 1;
            if (got.id === 'f_star') { await narrate('一尾通体墨蓝的锦鲤跃出水面，鳞上细碎的星斑一闪一闪——星斑锦鲤！'); if (window.JIUYAO_OWNED && JIUYAO_OWNED()) await say('星旋', '好东西！这鱼吸了几十年星光，拿去卖都嫌可惜。'); }
            toast('钓到 ' + got.name + '（可以拿去卖钱）', 1600); }
        }
        if (left() <= 0) { await narrate('今天的五竿用完了。'); break; }
        const c = await choose('再来一竿？（今日还剩 ' + left() + ' 竿）', ['再来一竿', '收竿']); if (c !== 0) break;
      }
    } finally { G.on = false; world.locked = false; S.hud = hud; }
  }
  window.R90_FISH = fishing; window.R90_FISH_G = G;
  // 小池热点：看看 / 垂钓
  const M = TMAPS.qingzhu_court, pond = (M.npcs || []).find(n => n.name === '小池');
  if (pond) { const lines = Array.isArray(pond.talk) ? pond.talk : null;
    pond.talk = async () => { const c = await choose('小池', ['垂钓（今日还剩 ' + Math.max(0, left()) + ' 竿）', '看看', '离开']); if (c === 0) return fishing(); if (c === 1 && lines) for (const l of lines) await narrate(l); }; }
})();
