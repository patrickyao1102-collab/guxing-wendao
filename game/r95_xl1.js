// R95 星落·初阶 —— Codex 10-31 交付「04_叶孤星_星落_初阶」（作者 11-02：接进去）
// 叶孤星练气期自创的朴素星落：举剑向天（换掉身体姿势图，不叠在旧身体上）→ 四颗小剑星错拍落下 → 小星爆。没有星云、北斗、天幕。
// 画面全是 Codex 画的原画（打包成一张 webp），代码只做位移、旋转、缩放、显隐；时间轴照 timeline.json；中阶未做，凝丹起仍用九曜阵。
(function () {
  if (typeof skXingluo !== 'function' || typeof addFx !== 'function' || typeof drawSprite !== 'function') return;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const URL = LOC ? 'xl1/xl1.webp' : '/_blob/' + (window.XL1_BLOB || 'cd34cc77254a748820cc5c920c1f201d');
  // 每项：[图集x, 图集y, 宽, 高, 在 512 原格里的左上 x, y, 缩放]
  const MAP = {"c0":[0,0,348,323,100,158,1],"c1":[350,0,348,323,100,158,1],"c2":[700,0,348,323,100,158,1],"c3":[1050,0,348,323,100,158,1],"c4":[1400,0,348,323,100,158,1],"c5":[0,325,348,323,100,158,1],"s0":[350,325,167,70,100,186,0.5],"s1":[519,325,167,70,100,186,0.5],"s2":[688,325,167,70,100,186,0.5],"s3":[857,325,167,70,100,186,0.5],"s4":[1026,325,167,70,100,186,0.5],"s5":[1195,325,167,70,100,186,0.5],"s6":[1364,325,167,70,100,186,0.5],"s7":[1533,325,167,70,100,186,0.5],"s8":[1702,325,167,70,100,186,0.5],"s9":[1871,325,167,70,100,186,0.5],"s10":[0,650,167,70,100,186,0.5],"s11":[169,650,167,70,100,186,0.5],"s12":[338,650,167,70,100,186,0.5],"s13":[507,650,167,70,100,186,0.5],"s14":[676,650,167,70,100,186,0.5],"s15":[845,650,167,70,100,186,0.5],"b1":[1014,650,96,86,154,152,0.5],"b2":[1112,650,96,86,154,152,0.5],"b3":[1210,650,96,86,154,152,0.5],"b4":[1308,650,96,86,154,152,0.5],"b5":[1406,650,96,86,154,152,0.5],"b6":[1504,650,96,86,154,152,0.5],"b7":[1602,650,96,86,154,152,0.5],"b8":[1700,650,96,86,154,152,0.5],"b9":[1798,650,96,86,154,152,0.5],"b10":[1896,650,96,86,154,152,0.5],"b11":[0,738,96,86,154,152,0.5],"b12":[98,738,96,86,154,152,0.5],"b13":[196,738,96,86,154,152,0.5]};
  let sheet = null, ready = false;
  const load = () => { if (sheet) return; sheet = new Image(); sheet.onload = () => { (sheet.decode ? sheet.decode() : Promise.resolve()).catch(() => {}).then(() => { ready = true; }); }; sheet.src = URL; };
  load();
  const ez = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
  // 在「512 原格」坐标系里画一格：(gx, gy) 是这一格左上角在画面上的位置，s = 原格像素 → 画面像素
  function cell(k, gx, gy, s, a, op) {
    const m = MAP[k]; if (!m || a <= .003) return;
    ctx.globalAlpha = Math.min(1, a); ctx.globalCompositeOperation = op || 'source-over';
    ctx.drawImage(sheet, m[0], m[1], m[2], m[3], gx + m[4] * s, gy + m[5] * s, m[2] / m[6] * s, m[3] / m[6] * s);
  }
  // 以格内某点为锚、绕它旋转画一格（星、星爆）
  function cellAt(k, x, y, s, ax, ay, rot, a, op) { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); cell(k, -ax * s, -ay * s, s, a, op); ctx.restore(); }

  // ---- 施法者姿势：举剑蓄力 / 向天一刺（Codex 16 帧 0.9 秒，去重后 6 张；第 6、12 帧是 Codex 画的过渡）----
  const POSE_OF = [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 4, 5, 5, 5];
  let pose = null;   // { t0, hero }
  const od = drawSprite;
  drawSprite = function (key, cx, by, h) {
    if (pose && ready && /^b_yegx/.test(key)) {
      const t = performance.now() / 1000 - pose.t0;
      // 对位：游戏站姿图（高 h，底边 by，水平居中 cx）在 Codex 原格里是高 249、左缘 x=102、脚底 y=481
      const s = h / 249, w = h * 619 / 500, gx = cx - w / 2 - 102 * s, gy = by - 481 * s;
      ctx.save();
      if (t < 2.65) cell('c' + POSE_OF[Math.min(15, Math.max(0, Math.floor(t / .05625)))], gx, gy, s, 1);
      else { const k = ez((t - 2.65) / .2); cell('c5', gx, gy, s, 1 - k); cell('c0', gx, gy, s, k); }
      ctx.restore(); return;
    }
    return od.apply(this, arguments);
  };

  // ---- 四颗小剑星（Codex 预览：狼1 / 山魈 / 狼2 / 狼1；1280×720 画面里施法者身高 249，与游戏 250 同尺度）----
  const SHOTS = [
    { fire: 1.0, travel: .5, role: 0, off: [-8, -47], ph: 147, v: [-32, -248] },
    { fire: 1.35, travel: .53, role: 1, off: [10, -66], ph: 185, v: [12, -168] },
    { fire: 1.53, travel: .46, role: 2, off: [-12, -52], ph: 153, v: [43, -276] },
    { fire: 2.02, travel: .57, role: 0, off: [13, -26], ph: 147, v: [33, -255] },
  ];
  const STAR_AX = .7162109375 * 512, STAR_AY = .495 * 512, STAR_S = .25, BURST_S = .25;
  function plan(n) {
    const pick = n >= 4 ? [0, 1, 2, 3] : n === 3 ? [0, 1, 2, 0] : n === 2 ? [0, 1, 1, 0] : [0, 0, 0, 0];
    const ev = SHOTS.map((sh, i) => Object.assign({}, sh, { slot: pick[i], hit: sh.fire + sh.travel }));
    for (let j = 4; j < n; j++) { const sh = SHOTS[j % 4]; ev.push(Object.assign({}, sh, { slot: j, fire: 1.18 + (j - 4) * .2, hit: 1.18 + (j - 4) * .2 + sh.travel })); }   // 敌人多于四个：每人补一颗，夹在原四颗之间
    return ev.sort((a, b) => a.hit - b.hit);
  }
  function play(P, units, onHit) {
    const ev = plan(units.length), b = battle, sc = (P.h || 250) / 249;
    for (const e of ev) { const u = units[e.slot], k = (u.h || 160) / e.ph; e.dx = u.x + e.off[0] * k; e.dy = u.y + e.off[1] * k; e.sx = e.dx + e.v[0] * sc; e.sy = e.dy + e.v[1] * sc; e.rot = Math.atan2(e.dy - e.sy, e.dx - e.sx); }
    pose = { t0: performance.now() / 1000 };
    return new Promise(res => {
      let done = false; const fin = () => { if (!done) { done = true; pose = null; res(); } };
      addFx({ life: 3.6, layer: 1,
        update(f) { const t = f.t;
          if (b === battle) b.dim = Math.max(b.dim || 0, .3 * ez((t - .2) / .5) * ez((3.3 - t) / .5));
          if (!f.ring && t >= .66) { f.ring = 1; playSnd('sfx_sword_ring', .55); }
          for (const e of ev) if (!e.done && t >= e.hit) { e.done = true; playSnd('sfx_star', .5); try { onHit(e, units[e.slot]); } catch (er) { console.warn(er); } }
          if (t >= 3.0) fin(); },
        draw(f) { if (!ready) return; const t = f.t; ctx.save();
          for (const e of ev) {
            if (t >= e.fire && t < e.hit) { const u = (t - e.fire) / e.travel, q = u * u;   // 由慢到快坠下
              cellAt('s' + (Math.floor((t - e.fire) / (.5 / 16)) % 16), e.sx + (e.dx - e.sx) * q, e.sy + (e.dy - e.sy) * q, STAR_S * sc, STAR_AX, STAR_AY, e.rot, ez(u / .15), 'screen'); }
            const age = t - e.hit;
            if (age >= 0 && age < .43) { const fr = 1 + Math.min(12, Math.floor(age / (.43 / 16))); cellAt('b' + fr, e.dx, e.dy, BURST_S * sc, 256, 256, 0, 1, 'screen'); }
          }
          ctx.restore(); },
        onEnd() { if (b === battle) b.dim = 0; fin(); } });
    });
  }

  const prev = skXingluo;
  skXingluo = async function (Pc) {
    const ts = aliveEnemies();
    const tier = window.XL_TIER ? XL_TIER() : 1, outfit = (S.hero && S.hero.outfit) || 'baipao';
    // 作者 11-03：初阶太丑，练气期也换回原来的星落（只把头顶旋转的星盘改成不转）；初阶素材留着不删
    if (true || window.XL_WUSHANG || tier !== 1 || Pc.ally || !ts.length || !ready || outfit !== 'baipao') return prev.apply(this, arguments);
    const mult = window.XL_MULT || 2.0, ev = plan(ts.length), cnt = new Map();
    for (const e of ev) cnt.set(e.slot, (cnt.get(e.slot) || 0) + 1);
    // 伤害仍按游戏原来的倍率，每个目标挨几颗星就平分几份
    await play(Pc, ts, (e, u) => { if (!u || !u.alive) return; const r = dmgCalc(Pc, u, mult / (cnt.get(e.slot) || 1), .1); applyDamage(u, r.d, r.crit); });
  };
  window.R95_XL1 = { play, plan, ready: () => ready, get posing() { return !!pose; } };
})();
