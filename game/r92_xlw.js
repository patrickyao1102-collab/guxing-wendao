// R92 星落·无上境 —— Codex v14「粗细交织」移植（作者 11-01 定稿：不要凤凰，就用这一版）
// 原版：Codex交付/R83_代码特效改画图/04_叶孤星_星落_无上境_v14_粗细交织（starfall_v14_animation.py）
// 星际星云 + 北斗七星逐颗点亮 + 三波 21/49/126 道落雨（细星雨连击、粗流星砸出星爆和贴地冲击环），最后七颗粗流星齐落。
// 素材全是 Codex 画的原画（打包成一张 webp），代码只做位移、缩放、旋转、显隐、叠加。目标按实战敌人重新排布。
(function () {
  if (typeof skXingluo !== 'function' || typeof addFx !== 'function') return;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const URL = LOC ? 'xlw/xlw14.webp' : '/_blob/' + (window.XLW14_BLOB || '');
  const MAP = {"cloud": [0, 0, 880, 300], "ip0": [882, 0, 330, 220], "ip1": [1214, 0, 330, 220], "hv0": [1546, 0, 420, 211], "hv1": [0, 302, 420, 211], "ring": [422, 302, 360, 205], "burst": [784, 302, 300, 193], "con0": [1086, 302, 484, 173], "con1": [0, 515, 484, 173], "con2": [486, 515, 484, 173], "con3": [972, 515, 484, 173], "con4": [1458, 515, 484, 173], "con5": [0, 690, 484, 173], "con6": [486, 690, 484, 173], "con7": [972, 690, 484, 173], "fn0": [1458, 690, 420, 64], "fn1": [0, 865, 420, 64]};
  let sheet = null, ready = false, BT = [1, 0, 0, 1, 0, 0];
  const load = () => { if (sheet) return; sheet = new Image(); sheet.onload = () => { (sheet.decode ? sheet.decode() : Promise.resolve()).catch(() => {}).then(() => { ready = true; }); }; sheet.src = URL; };
  load();
  const C01 = x => Math.max(0, Math.min(1, x)), ez = q => { q = C01(q); return q * q * (3 - 2 * q); };
  const DUR = 7.2;
  // 北斗七星在原画里的星位（484×173 显示尺寸下），原点 (85,52)
  const RAW = [[183, 166], [590, 174], [920, 260], [1290, 365], [1910, 370], [1800, 605], [1385, 583]];
  const CP = RAW.map(([x, y]) => [x / 2098 * 484, y / 749 * 173]);
  const drift = t => -Math.max(0, t - .45) * 1.8;

  function blit(k, x, y, w, h, a, rot, ax, ay, op) {
    if (a <= .003) return; const m = MAP[k]; if (!m) return;
    // 不用 save/restore：直接设变换，一帧几百次绘制时省下状态栈开销（调用方在整段结束时统一复位）
    ctx.globalAlpha = Math.min(1, a); ctx.globalCompositeOperation = op || 'screen';
    if (rot) { const c = Math.cos(rot), s = Math.sin(rot); ctx.setTransform(c * BT[0], s * BT[0], -s * BT[0], c * BT[0], BT[4] + x * BT[0], BT[5] + y * BT[0]); }
    else ctx.setTransform(BT[0], 0, 0, BT[0], BT[4] + x * BT[0], BT[5] + y * BT[0]);
    ctx.drawImage(sheet, m[0], m[1], m[2], m[3], -w * (ax == null ? .5 : ax), -h * (ay == null ? .5 : ay), w, h);
  }

  // 按实战敌人排布三波落雨（照搬 v14 plan()：每颗星按横向顺序分配给从左到右的敌人；每六道有一道落在身上，其余散落在脚边）
  function plan(units, stars) {
    const ev = []; if (!units.length) return ev;
    const order = units.map((u, i) => i).sort((a, b) => units[a].x - units[b].x);
    const rank = stars.map((s, i) => i).sort((a, b) => stars[a][0] - stars[b][0]);
    [[2.0, 3, .6], [3.05, 7, .8], [4.2, 18, 1.1]].forEach(([start, rounds, span], wi) => {
      for (let r = 0; r < rounds; r++) for (let si = 0; si < 7; si++) {
        const sr = rank.indexOf(si), slot = order[Math.min(units.length - 1, Math.floor(sr * units.length / 7))], u = units[slot];
        const fire = start + r * span / Math.max(1, rounds - 1) + si * .004, seed = si * 53 + r * 97 + wi * 31, body = (r + si) % 6 === 0;
        const rv = ((Math.sin(seed * 12.9898) * 43758.5453) % 1 + 1) % 1, rv2 = ((Math.sin(seed * 78.233) * 19341.715) % 1 + 1) % 1;
        const uh = u.h || 160, uw = u.w || uh * .9;
        const off = body ? [0, -uh * .45] : [(rv - .5) * uw * 1.65, (rv2 - .5) * 38];
        const fin = wi === 2 && r === 17, flight = fin ? .72 : .65 + (seed % 5) * .028;
        ev.push({ wave: wi + 1, star: si, slot, fire, hit: fire + flight, travel: flight, off, body, variant: (r + si) % 2, heavy: (r * 7 + si) % 4 === wi % 4 || fin, fin });
      }
    });
    ev.sort((a, b) => a.hit - b.hit);
    const last = {}; for (const e of ev) if (e.heavy && e.hit - (last[e.slot] ?? -100) > .28) { e.ring = true; last[e.slot] = e.hit; }
    return ev;
  }

  function play(P, units, onHit) {
    const mx = units.reduce((s, u) => s + u.x, 0) / units.length;
    const OX = Math.round(mx - 330), OY = 40;   // 原版星空对着 x≈330 的敌阵；正式战斗顶上有血条，整体下移
    const stars = CP.map(([x, y]) => [x + 85 + OX, y + 52 + OY]);
    const ev = plan(units, stars), b = battle;
    const dst = e => { const u = units[e.slot]; return [u.x + e.off[0], u.y + e.off[1]]; };
    return new Promise(res => {
      let done = false, lastSnd = -1;
      const fin = () => { if (!done) { done = true; res(); } };
      addFx({ life: DUR, layer: 1,
        update(f) { const t = f.t;
          if (b === battle) b.dim = Math.max(b.dim || 0, .62 * ez((t - .3) / .6) * ez((7.0 - t) / .8));
          for (const e of ev) if (!e.done && t >= e.hit) { e.done = true; const u = units[e.slot];
            if (e.heavy) S.shake = Math.max(S.shake || 0, e.fin ? 9 : 3);
            try { onHit(e, u); } catch (er) { console.warn(er); } }
          for (const e of ev) if (!e.snd && t >= e.fire) { e.snd = true; if ((e.star === 0 || e.star === 3 || e.star === 6) && t - lastSnd > .09) { lastSnd = t; playSnd('sfx_star', .09 + e.wave * .02); } }   // 第三波一秒内上百道，音效限流，不然声音堆叠会卡
          if (t >= 6.75) fin(); },
        draw(f) { if (!ready) return; ctx.save(); const T = ctx.getTransform(); BT = [T.a, T.b, T.c, T.d, T.e, T.f]; try { drawAll(f.t); } finally { ctx.restore(); } },
        onEnd() { if (b === battle) b.dim = 0; fin(); } });
      function drawAll(t) {
          // 星云
          const na = ez((t - .4) / .7) * ez((6.9 - t) / .85);
          blit('cloud', -20 + OX + drift(t), 6 + OY, 880, 300, na, 0, 0, 0, 'source-over');
          // 北斗七星逐颗点亮
          const so = ez((6.65 - t) / .5), tt = Math.min(t, 2);
          let k = 0; while (k < 7 && tt >= .65 + k * .145 + .14) k++;
          const g = k < 7 ? ez((tt - (.65 + k * .145)) / .14) : 0;
          blit('con' + k, 85 + OX + drift(t), 52 + OY, 484, 173, so * (1 - g), 0, 0, 0);
          if (g > 0) blit('con' + (k + 1), 85 + OX + drift(t), 52 + OY, 484, 173, so * g, 0, 0, 0);
          // 贴地冲击环
          for (const e of ev) if (e.ring) { const age = t - e.hit; if (age >= 0 && age < .32) { const u = units[e.slot], w = (100 + 22 * e.wave) * (.62 + .65 * ez(age / .22));
            blit('ring', u.x, u.y, w, w * .46, .85 * ez(age / .025) * ez((.32 - age) / .17)); } }
          for (const e of ev) {
            const [dx, dy] = dst(e);
            if (t >= e.fire && t < e.hit) {   // 流星：彗头沿星位→落点直线飞行
              const st = [stars[e.star][0] + drift(e.fire), stars[e.star][1]], u = (t - e.fire) / e.travel;
              const px = st[0] + (dx - st[0]) * u, py = st[1] + (dy - st[1]) * u, ang = Math.atan2(dy - st[1], dx - st[0]);
              const L = (e.heavy ? [170, 190, 210] : [230, 290, 350])[e.wave - 1], Hh = (e.heavy ? [45, 53, 62] : [13, 16, 19])[e.wave - 1];
              const piv = e.heavy ? [[.856, .835][e.variant], .55] : [.932, .5];
              const a = (.95 + .05 * e.wave) * ez(u / .12) * C01(Math.hypot(px - st[0], py - st[1]) / (L * .5));
              blit((e.heavy ? 'hv' : 'fn') + e.variant, px, py, L, Hh, a, ang, piv[0], piv[1]);
            }
            const age = t - e.hit;
            if (age >= 0 && age < .44) { const w = (112 + 21 * e.wave) * (.72 + .35 * ez(age / .14));
              blit(age < .23 ? 'ip0' : 'ip1', dx, dy, w, w * .64, 1.24 * ez(age / .016) * ez((.44 - age) / .18)); }
            if (e.heavy && age >= 0 && age < .24) { const w = (74 + 14 * e.wave) * (.7 + .45 * ez(age / .065));
              blit('burst', dx, dy, w, w * .85, 1.12 * ez(age / .012) * ez((.24 - age) / .12)); }
          }
      }
    });
  }

  const prev = skXingluo;
  skXingluo = async function (Pc) {
    const ts = aliveEnemies().slice(0, 5);
    if (!window.XL_WUSHANG || Pc.ally || !ts.length || !ready) return prev.apply(this, arguments);
    Pc.pose = 'cast'; playSnd('sfx_charge', .7);
    const mult = window.XL_MULT || 2, cnt = new Map(); let lastHit = 0, lastBoom = 0;
    // 伤害只结算在落到身上的那几道和最后齐落的七颗上，按目标平分倍率；其余落雨只是画面
    const dmgHit = e => e.body || e.fin;
    const evAll = plan(ts, CP.map(([x, y]) => [x, y]));
    for (const e of evAll) if (dmgHit(e)) cnt.set(e.slot, (cnt.get(e.slot) || 0) + 1);
    await play(Pc, ts, (e, u) => {
      if (!u || !u.alive || !dmgHit(e)) return;
      const now = performance.now(); if (e.fin ? now - lastBoom > 120 : now - lastHit > 90) { if (e.fin) lastBoom = now; else lastHit = now; playSnd(e.fin ? 'sfx_boom' : 'sfx_hit', e.fin ? .8 : .4); }
      const share = mult / (cnt.get(e.slot) || 1), r = dmgCalc(Pc, u, share, .1); let d = r.d;
      // 借力那一战（sunKill）：齐落之前别把敌人打死，留到最后七颗一起收
      if (!e.fin && battle.cfg && battle.cfg.sunKill) d = Math.min(d, Math.max(0, Math.ceil(u.hp) - 1));
      if (d > 0) applyDamage(u, d, e.fin ? r.crit : false);
    });
    Pc.pose = null;
  };
  window.R92_XLW = { play, plan, ready: () => ready };
})();
