// ================= R135 · G 获得 / 解锁 / 炼器 / 换装界面（Codex R134 修改1 · G 项，作者第 17、18 条）=================
// 作者 11-07：原来这四个画面是代码画的光圈 + 一个圆牌图标，太简陋。换成 Codex 画的三套深木金边底框（reward / forge / wardrobe）+ 光效元件。
// 只换「画面」：加物品、扣星辰点、改攻击、设 flag、换装调用全部照 r134_fix.js / r88_outfit.js 原样。字都由代码画（图里没烘字）。
// 素材在 r135g/（webp），坐标照 Codex 的 manifest.json / 预览.html（1280×720 逻辑坐标）。鼠标、手机触屏都走 input.tapped。
(function () {
  if (typeof S === 'undefined' || !S.overlay || typeof ctx === 'undefined') return;
  const F = () => (S.flags = S.flags || {});
  const DIR = 'r135g/';
  const A = {}, P = {};
  const load = k => P[k] || (P[k] = new Promise(r => { const im = new Image(); im.onload = () => { A[k] = im; r(im); }; im.onerror = () => { P[k] = null; r(null); }; im.src = DIR + k + '.webp'; }));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // 需要的图先等它载完（最多 4 秒）；载不出来就退回原来的画面，不卡剧情
  const need = async keys => { await Promise.race([Promise.all(keys.map(load)), wait(4000)]); return keys.every(k => A[k]); };
  const K_REWARD = ['reward_frame', 'gold_rays', 'button'], K_ROBE = ['cloud_ring', 'robe_0', 'robe_1', 'robe_2', 'robe_3', 'robe_4', 'robe_5'];
  const K_FORGE = ['forge_frame', 'furnace', 'material_slot', 'star_sand', 'button', 'success_burst', 'gold_rays', 'xinghen', 'xingchen'];
  const K_WARD = ['wardrobe_frame', 'halo', 'disciple_robe', 'liuyun_robe'];
  // 开局后慢慢预热（不抢开场加载）
  setTimeout(() => { const all = [...new Set([...K_REWARD, ...K_ROBE, ...K_FORGE, ...K_WARD, 'liuyun_robe', 'pokong'])]; all.forEach((k, i) => setTimeout(() => load(k), i * 250)); }, 9000);

  const snd = (n, v) => { try { playSnd(n, v); } catch (e) {} };
  const ease = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const pic = (k, x, y, w, h, a) => { const im = A[k]; if (!im) return; if (a != null) { const g = ctx.globalAlpha; ctx.globalAlpha = g * a; ctx.drawImage(im, x, y, w, h); ctx.globalAlpha = g; } else ctx.drawImage(im, x, y, w, h); };
  const picC = (k, cx, cy, s, a) => pic(k, cx - s / 2, cy - s / 2, s, s, a);
  const txt = (s, x, y, size, color, font, align) => { ctx.font = `${size}px ${font || BRUSH}`; ctx.fillStyle = color || '#ead5a6'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); };
  const wrap = (s, maxW) => { const out = []; let line = ''; for (const ch of String(s || '')) { if (ctx.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; };
  const inRect = (t, x, y, w, h) => t && t.x >= x && t.x <= x + w && t.y >= y && t.y <= y + h;
  // 底框按钮（图里是空按钮，字代码画）
  const btn = (s, cx, cy, w, on) => { const h = w * 144 / 480 * .82; ctx.save(); if (!on) ctx.globalAlpha *= .55; pic('button', cx - w / 2, cy - h / 2, w, h); ctx.font = `26px ${BRUSH}`; textOutline(s, cx, cy + 2, on ? '#fbe6b0' : '#cbbd9a', 'rgba(20,12,4,.85)', 4); ctx.restore(); return { x: cx - w / 2, y: cy - h / 2, w, h }; };
  // 金色小星屑（四周光效）
  function sparkles(cx, cy, rx, ry, n, t, a, col) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const k = (t * .22 + i / n) % 1, ang = i * 2.399 + t * .3, r = .55 + .45 * ((i * 37 % 17) / 17);
      const x = cx + Math.cos(ang) * rx * r, y = cy + Math.sin(ang) * ry * r - k * 60, al = a * Math.sin(k * Math.PI) * (.5 + .5 * Math.sin(t * 5 + i));
      if (al <= 0) continue; const s = 1.5 + (i % 3) * 1.2; ctx.fillStyle = `rgba(${col || '255,226,160'},${al})`; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
      if (i % 4 === 0) { ctx.strokeStyle = `rgba(${col || '255,236,190'},${al * .7})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - s * 3, y); ctx.lineTo(x + s * 3, y); ctx.moveTo(x, y - s * 3); ctx.lineTo(x, y + s * 3); ctx.stroke(); } }
    ctx.restore();
  }
  const glow = (cx, cy, r, rgb, a) => { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(.45, `rgba(${rgb},${a * .35})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); ctx.restore(); };
  // 金芒：慢慢转、轻轻呼吸
  const rays = (cx, cy, s, t, a) => { if (!A.gold_rays || a <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .12); ctx.globalAlpha *= a * (.86 + .14 * Math.sin(t * 2)); ctx.globalCompositeOperation = 'screen'; ctx.drawImage(A.gold_rays, -s / 2, -s / 2, s, s); ctx.restore(); };

  // ---- 当前全屏界面：开着时地图 / 行囊不吃点击、不画地图 HUD（摇杆、任务栏不压在界面上）----
  let CUR = null;
  window.R135G_OPEN = () => !!CUR; window.R135G_CUR = () => CUR;   // 测试用
  const hideTap = (orig, self, args) => { const t = input.tapped; input.tapped = null; try { return orig.apply(self, args); } finally { if (!input.tapped) input.tapped = t; } };
  if (typeof updateMap === 'function') updateMap = (orig => function () { if (CUR) return hideTap(orig, this, arguments); return orig.apply(this, arguments); })(updateMap);
  if (typeof drawMapHud === 'function') drawMapHud = (orig => function () { if (CUR) return; return orig.apply(this, arguments); })(drawMapHud);
  // 作者 11-07：有的场景画完会残留一点缩放（居室里整屏轻微呼吸），全屏界面要钉死在 1280×720 上，先把变换复位到画布基准
  const resetXf = () => { const c = typeof cv !== 'undefined' ? cv : ctx.canvas; ctx.setTransform(c.width / W, 0, 0, c.height / H, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; };
  function open(o) {
    o.t0 = performance.now(); o.tapAt = o.t0 + 350; input.tapped = null; CUR = o; S.overlay.push(o);
    o.close = () => { const i = S.overlay.indexOf(o); if (i >= 0) S.overlay.splice(i, 1); if (CUR === o) CUR = null; };
    o.draw = () => { if (!o.paint) return; ctx.save(); try { resetXf(); o.paint(); } catch (e) { (window.__gameErrs = window.__gameErrs || []).push('R135G：' + (e && e.message || e)); o.close(); o.res && o.res(); } ctx.restore(); };
    return o;
  }
  // 取一次点击（刚打开的 0.35 秒内不算：防止关上一句对话的那一下直接点穿）
  const takeTap = o => { const t = input.tapped; if (!t) return null; input.tapped = null; return performance.now() < o.tapAt ? null : t; };

  // ======================= 1 + 2：获得流云仙衣 / 神器宝物解锁（reward_frame 通用框）=======================
  // 物品大图：C 项装备图标 512 展示图（只拷了用得到的几张）；没有大图的退回游戏里的小图标
  const BIG = { w_xinghen: 'xinghen', a_liuyun: 'liuyun_robe', c_tianjian: 'disciple_robe', k_pokong: 'pokong' };
  window.R135G_BIG = BIG;   // 以后别的宝物有大图了，往这里加一行 { 物品id: 'r135g 里的文件名' }
  function drawSmallIcon(id, cx, cy, s) {
    const im = typeof IMG !== 'undefined' && IMG['ic_' + id];
    if (im && (im.naturalWidth || im.width)) { ctx.drawImage(im, cx - s / 2, cy - s / 2, s, s); return; }
    try { itemIcon(id, cx, cy, s * .42); } catch (e) {}
  }
  // opt: { robe: true 播仙衣展开 | item: 物品 id, kicker: 顶上标题, name, lines: [说明...], btn: 按钮字 }
  function reward(opt) {
    return new Promise(res => {
      const robe = !!opt.robe, big = !robe && BIG[opt.item] && A[BIG[opt.item]] ? BIG[opt.item] : null;
      const T_NAME = robe ? 1.55 : .7, T_END = robe ? 1.9 : 1.0;   // 仙衣：0.3 秒起 5fps 展开 6 帧（到 1.5 秒）→ 金芒 → 名字
      const lines = (opt.lines || []).filter(Boolean);
      let skip = 0, flashed = false;
      const o = open({ res });
      snd('jingle_levelup');
      o.paint = () => {
        const t = (performance.now() - o.t0) / 1000 + skip, k = ease(t / .3);
        ctx.fillStyle = `rgba(3,5,12,${.8 * k})`; ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = k; ctx.translate(640, 360); ctx.scale(.96 + .04 * k, .96 + .04 * k); ctx.translate(-640, -360);
        pic('reward_frame', 0, 0, 1280, 720);
        txt(opt.kicker || (robe ? '仙衣入手' : '宝物解锁'), 640, 109, 36, '#ead5a6');
        ctx.save(); ctx.beginPath(); ctx.rect(46, 160, 1188, 330); ctx.clip();   // 光效只在展示区里
        const cx = 640, cy = 325;
        if (robe) {
          const rk = clamp01((t - 1.25) / .45);
          glow(cx, cy, 300, '150,190,255', .25 * clamp01(t / .6));
          rays(cx, cy, 520 + 40 * rk, t, .75 * rk);
          // 流云环：压扁成椭圆慢慢转
          const ck = clamp01((t - .35) / .7); if (ck > 0 && A.cloud_ring) { ctx.save(); ctx.translate(cx, cy + 8); ctx.scale(1, .82); ctx.rotate(t * .18); ctx.globalAlpha *= .62 * ck; ctx.drawImage(A.cloud_ring, -225 - 15 * ck, -225 - 15 * ck, 450 + 30 * ck, 450 + 30 * ck); ctx.restore(); }
          const f = Math.max(0, Math.min(5, Math.floor((t - .3) * 5))), fa = clamp01((t - .1) / .3), bob = t > 1.5 ? Math.sin((t - 1.5) * 1.6) * 4 : 0;
          picC('robe_' + f, cx, cy + 6 + bob, 350, fa);
          if (t > 1.3 && !flashed) { flashed = true; snd('sfx_star', .6); }
          glow(cx, cy, 260, '255,240,200', .55 * Math.max(0, 1 - Math.abs(t - 1.4) / .35));
          sparkles(cx, cy, 300, 150, 30, t, clamp01((t - .6) / .5));
        } else {
          const ik = ease((t - .1) / .45);
          glow(cx, cy, 280, '170,200,255', .3 * k);
          rays(cx, cy, 500 + 30 * Math.sin(t * 1.3), t, .7 * clamp01((t - .3) / .4));
          glow(cx, cy, 220, '255,236,190', .5 * Math.max(0, 1 - Math.abs(t - .5) / .3));
          if (big) picC(big, cx, cy + Math.sin(t * 1.7) * 4, 330 * (.7 + .3 * ik), ik);
          else { ctx.globalAlpha *= ik; drawSmallIcon(opt.item, cx, cy, 200 * (.7 + .3 * ik)); ctx.globalAlpha = k; }
          sparkles(cx, cy, 320, 150, 28, t, clamp01((t - .4) / .5));
        }
        ctx.restore();
        // 名字 + 说明
        const nk = ease((t - T_NAME) / .35);
        if (nk > 0) { ctx.save(); ctx.globalAlpha *= nk; ctx.font = `44px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(opt.name || '', 640, 530 + (1 - nk) * 8, '#fff0c8', 'rgba(20,12,4,.9)', 6); ctx.restore(); }
        const dk = ease((t - T_NAME - .2) / .35);
        let rows = [];
        if (dk > 0) { ctx.save(); ctx.globalAlpha *= dk; ctx.font = `600 22px ${FONT}`;
          rows = lines.length <= 1 ? wrap(lines[0] || '', 1040).slice(0, 2) : lines.slice(0, 3);
          rows.forEach((l, i) => { const one = lines.length <= 1; ctx.font = `600 ${i === 0 ? 22 : 19}px ${FONT}`; ctx.fillStyle = i === 0 ? '#e6dfcf' : '#bcc8d6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(l, 640, (one ? 590 : 588) + i * (one ? 30 : 29)); });
          ctx.restore(); }
        const done = t >= T_END;
        if (done) { const a = .55 + .45 * Math.sin(t * 4);
          if (lines.length <= 1 && rows.length <= 1) btn(opt.btn || '收入行囊', 640, 646, 230, true);
          else { ctx.globalAlpha = k * a; txt('点击继续 ›', 1196, 532, 17, '#cdbf9c', FONT, 'right'); ctx.globalAlpha = k; } }
        const tap = takeTap(o);
        if (tap) { if (!done) { skip += T_END - t; snd('ui_click', .6); } else { snd('ui_confirm', .7); o.close(); res(); } }
      };
    });
  }
  window.R135G_REWARD = reward;

  // 第 18 条：取得流云仙衣 → 仙衣展开演出；其他神器 / 宝物 → 通用解锁框。opt 照原接口 { item, kicker, title, lines }
  if (window.R134_UNLOCK) window.R134_UNLOCK = (orig => async function (opt) {
    opt = opt || {}; const robe = opt.item === 'a_liuyun';
    const keys = [...K_REWARD, ...(robe ? K_ROBE : BIG[opt.item] ? [BIG[opt.item]] : [])];
    if (!(await need(keys))) return orig.apply(this, arguments);
    return reward({ robe, item: opt.item, kicker: opt.kicker || (robe ? '九曜神器 · 解锁' : '宝物解锁'), name: opt.title || (ITEM_DB[opt.item] || {}).name || '', lines: opt.lines || [], btn: '收下' });
  })(window.R134_UNLOCK);

  // 第 16/17 条：叶擎苍夜访送宝 —— 剧情一句不动，只把那两次「获得物品」小框换成宝物解锁大框（破空遁符用 F 项的 512 展示图，凝元丹暂无大图用游戏图标）
  if (window.R134_GIFT) window.R134_GIFT = (orig => async function () {
    const ig = window.itemGet;
    const giftGet = async function (items, title) {
      if (!(await need(K_REWARD))) return ig ? ig.apply(this, arguments) : undefined;
      for (const it of items || []) { const id = /^item:/.test(it.icon || '') ? it.icon.slice(5) : it.id; if (id && BIG[id]) await need([BIG[id]]);
        await reward({ item: id, kicker: title || '获得宝物', name: it.name || (ITEM_DB[id] || {}).name || '', lines: [it.desc || (ITEM_DB[id] || {}).desc || ''], btn: '收下' }); }
    };
    window.itemGet = giftGet;
    try { return await orig.apply(this, arguments); } finally { if (window.itemGet === giftGet) window.itemGet = ig; }
  })(window.R134_GIFT);

  // ======================= 3：炼器（forge_frame + 炼器炉 + 材料格 + 成功光效）=======================
  // 点「开始炼制」或点屏幕 → 星辰砂飞入炉口（1.4 秒）→ 炉火大盛（1 秒）→ 成功光效、星痕剑化作下品玄器 → 右侧显示结果，点「收入行囊」关
  function forgeUI(onSuccess) {
    return new Promise(res => {
      let st = 'idle', ts = 0, rang = false;
      const o = open({ res });
      snd('ui_open', .7);
      const FX = 405, FY = 365, MOUTH = 238, SLOT = [930, 215, 160, 160];
      o.paint = () => {
        const now = performance.now(), t = (now - o.t0) / 1000, k = ease(t / .3), ft = st === 'idle' ? -1 : (now - ts) / 1000;
        if (st === 'feed' && ft >= 1.4) { st = 'fire'; snd('sfx_charge', .7); }
        if (st === 'fire' && ft >= 2.4) { st = 'done'; S.flash = .7; S.flashColor = '#efe6ff'; snd('sfx_sword_ring'); try { onSuccess && onSuccess(); } catch (e) { console.warn('R135G forge', e); } }
        ctx.fillStyle = `rgba(3,5,12,${.82 * k})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = k;
        pic('forge_frame', 0, 0, 1280, 720);
        txt('炼　器', 640, 84, 38, '#ead5a6');
        // 左：炼器炉（炉口紫焰随状态加强）
        ctx.save(); ctx.beginPath(); ctx.rect(52, 140, 756, 424); ctx.clip();
        const heat = st === 'idle' ? 0 : st === 'feed' ? clamp01((ft - 1) / .4) * .5 : st === 'fire' ? .5 + .5 * clamp01((ft - 1.4) / .8) : Math.max(.15, 1 - (ft - 2.4) * .6);
        glow(FX, MOUTH, 170 + 90 * heat, '170,120,255', .25 + .45 * heat + .06 * Math.sin(t * 3));
        const shake = st === 'fire' ? Math.sin(now / 30) * 2.5 * heat : 0;
        pic('furnace', FX - 200 + shake, 165, 400, 400);
        glow(FX, 440, 90 + 30 * heat, '255,150,70', .25 + .35 * heat + .05 * Math.sin(t * 7));
        // 星痕剑悬在炉口：炼制时慢慢沉入火中；成功后换成星辰纹的下品玄器
        if (st !== 'done') { const sink = st === 'fire' ? ease((ft - 1.4) / 1) * 40 : 0, sa = st === 'fire' ? 1 - .7 * clamp01((ft - 1.9) / .5) : 1;
          picC('xinghen', FX, 200 + Math.sin(t * 1.8) * 5 + sink, 190, sa);
          if (st === 'fire') glow(FX, 210 + sink, 150, '235,225,255', .6 * clamp01((ft - 1.4) / 1)); }
        else { const dt = ft - 2.4, pk = ease(dt / .4);
          rays(FX, 325, 560, t, .8 * Math.max(.35, 1 - dt * .3));
          if (A.success_burst) { ctx.save(); ctx.translate(FX, 325); ctx.rotate(dt * .4); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= Math.max(.3, .95 - dt * .35); const s = 380 + 160 * pk; ctx.drawImage(A.success_burst, -s / 2, -s / 2, s, s); ctx.restore(); }
          glow(FX, 325, 260, '230,210,255', .7 * Math.max(0, 1 - dt / .6));
          picC('xingchen', FX, 315 + Math.sin(t * 1.6) * 4, 290 * (.75 + .25 * pk), pk);
          sparkles(FX, 320, 260, 170, 26, t, .9, '225,210,255');
          if (dt > .3) { ctx.save(); ctx.globalAlpha *= ease((dt - .3) / .3); ctx.font = `34px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline('炼制成功', FX, 528, '#fff0c8', 'rgba(20,12,4,.9)', 5); ctx.restore(); } }
        if (st === 'fire' || st === 'feed') sparkles(FX, MOUTH, 160, 60, 22, t, heat, '210,180,255');
        ctx.restore();
        // 右：材料格 + 说明
        pic('material_slot', SLOT[0], SLOT[1], SLOT[2], SLOT[3]);
        const scx = SLOT[0] + 80, scy = SLOT[1] + 80;
        if (st === 'idle') { glow(scx, scy, 80, '200,170,255', .2 + .1 * Math.sin(t * 3)); picC('star_sand', scx, scy + 4, 120); }
        else if (st === 'feed') { const v = clamp01(ft / 1.3), u = v * v * (3 - 2 * v), x = scx + (FX - scx) * u, y = scy + (MOUTH - scy) * u - 130 * Math.sin(u * Math.PI), s = 120 - 50 * u;
          // 拖尾：几粒星砂跟在后面
          for (let j = 1; j <= 5; j++) { const w = clamp01(v - j * .05), uu = w * w * (3 - 2 * w); glow(scx + (FX - scx) * uu, scy + (MOUTH - scy) * uu - 130 * Math.sin(uu * Math.PI), 26 - j * 3, '210,190,255', .5 - j * .08); }
          picC('star_sand', x, y, s, 1 - clamp01((v - .9) / .1)); sparkles(x, y, 50, 40, 12, t, .9, '220,200,255'); }
        else if (st === 'done') { const pk = ease((ft - 2.4) / .4); glow(scx, scy, 80, '200,170,255', .3); picC('xingchen', scx, scy, 128 * (.7 + .3 * pk), pk); }
        if (st !== 'done') {
          txt('星辰砂 ×1', 1010, 410, 28, '#ead5a6');
          ctx.font = `600 20px ${FONT}`; ctx.fillStyle = '#cfd6df'; ctx.textAlign = 'center'; ctx.fillText('星痕剑 → 下品玄器', 1010, 456);
          ctx.font = `600 18px ${FONT}`; ctx.fillStyle = '#9fb0c4'; ctx.fillText('灵力引火，剑纳星辰', 1010, 494);
        } else { const a = ease((ft - 2.7) / .35); ctx.save(); ctx.globalAlpha *= a;
          ctx.font = `32px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline('星痕剑·下品玄器', 1010, 410, '#fff0c8', 'rgba(20,12,4,.9)', 5);
          ctx.font = `600 18px ${FONT}`; ctx.fillStyle = '#cfd6df'; ctx.fillText('剑身浮现璀璨的星辰纹路', 1010, 456);
          ctx.font = `600 24px ${FONT}`; ctx.fillStyle = '#ffd77a'; ctx.fillText('攻击 +8', 1010, 498); ctx.restore(); }
        // 底栏按钮
        const ready = st === 'done' && ft > 3.0;
        const b = btn(st === 'idle' ? '开始炼制' : st === 'done' ? '收入行囊' : '炼制中…', 640, 622, 290, st === 'idle' || ready);
        if (st === 'idle' && t > .6) { ctx.globalAlpha = k * (.45 + .4 * Math.sin(t * 4)); txt('点按钮或点屏幕开始', 805, 622, 16, '#bfb393', FONT, 'left'); ctx.globalAlpha = k; }
        const tap = takeTap(o);
        if (tap) {
          if (st === 'idle') { st = 'feed'; ts = performance.now(); snd('ui_confirm'); snd('sfx_star', .5); }
          else if (st === 'done' && ready) { snd('ui_confirm', .7); o.close(); res(); }
        }
        void b;
      };
    });
  }
  window.R135G_FORGE_UI = forgeUI;

  // 第 17 条：星辰商店 → 炼器。商店那段原样；炼器的二选一 + 代码光圈 + 成功面板换成炼器界面。
  // 扣星辰砂、攻击 +8、xh_grade、改剑名：跟 r134_fix.js 一模一样，只是放到「炼制成功」那一刻执行。
  if (window.R134_FORGE) window.R134_FORGE = (orig => async function () {
    if (!(await need(K_FORGE))) return orig.apply(this, arguments);
    const h = S.hero, COST = 350;
    await say('星旋', '不错啊小子！对了——到了凝丹境，玉佩里的「星辰商店」开张了。星痕剑要升阶，得先换一份星辰砂。');
    let bought = false;
    while (!bought) {
      const c = await choose('星辰商店　（星辰点 ' + (h.points || 0) + '）', ['星辰砂 · ' + COST + ' 星辰点（星痕剑升阶材料）', '先看看别的（暂不兑换）']);
      if (c === 0) {
        if ((h.points || 0) < COST) { await say('星旋', '差一点？……算了算了，这次本神仙先给你垫上，记账！'); h.points = COST; }
        h.points -= COST; addItem('m_xcsha', 1); playSnd('ui_confirm'); bought = true;
        if (window.itemGet) await itemGet([{ icon: 'item:m_xcsha', name: '星辰砂', count: '×1', desc: ITEM_DB.m_xcsha.desc }], '星辰商店');
      } else await say('星旋', '别的？等你修为再高些，宝库里还有好东西。今天先把剑升了——兑换星辰砂吧。');
    }
    await say('星旋', '好，打开「炼器」——把星痕剑和星辰砂放进去，灵力引火，剩下的交给剑自己。');
    let applied = false;
    const apply = () => { if (applied) return; applied = true;
      if (h.bag && h.bag.m_xcsha) { h.bag.m_xcsha--; if (!h.bag.m_xcsha) delete h.bag.m_xcsha; }
      h.atk += 8; F().xh_grade = 1; if (ITEM_DB.w_xinghen) ITEM_DB.w_xinghen.name = '星痕剑·下品玄器'; };
    await forgeUI(apply);
    apply();   // 万一界面中途出错被关掉，也保证升阶生效
    await say('星旋', '以后别的装备也能炼——宗门铸剑师、各城铁匠都会精炼，材料打妖兽掉的就行。');
  })(window.R134_FORGE);

  // ======================= 4：换装（wardrobe_frame）=======================
  // 左：叶孤星战斗待机（复用 R88 的 b_yegx_baipao / b_yegx_guxing，不另放一份）；右：天剑弟子服 / 流云仙衣（孤星白衣）两张卡，点一下就换上。
  // 孤星白衣在取得流云仙衣前（R134_OUTFIT_OK 为假）显示锁定。行囊里点「换装」页签打开这里；右上「更多造型」进原来 R88 的六套网格（另外几套和行走切换都还在那）。
  const OUT = window.YEGX_OUTFIT;
  const CARDS = [
    { id: 'baipao', name: '天剑弟子服', sub: '白袍正蓝 · 宗门弟子常服', icon: 'disciple_robe', box: [852, 154, 374, 187] },   // 卡片框是底图里烘好的（852,154）–（1226,341），点选区域跟它对齐
    { id: 'guxing', name: '流云仙衣', sub: '孤星白衣 · 一身素白、金线滚边', icon: 'liuyun_robe', box: [852, 364, 374, 187] },
  ];
  const locked = c => c.id === 'guxing' && window.R134_OUTFIT_OK && !R134_OUTFIT_OK();
  const HERO = {};
  const heroImg = id => { if (HERO[id] !== undefined) return HERO[id]; HERO[id] = null; const o = OUT && OUT.list.find(x => x.id === id); const s = o && o.img && o.img.b_yegx; if (s) { const im = new Image(); im.onload = () => { HERO[id] = im; }; im.src = s; } return null; };
  function lockGlyph(x, y, s, a) { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = '#d9b46a'; ctx.fillStyle = 'rgba(30,20,10,.85)'; ctx.lineWidth = s * .12;
    ctx.beginPath(); ctx.arc(x, y - s * .2, s * .28, Math.PI, 0); ctx.stroke(); roundRect(x - s * .42, y - s * .2, s * .84, s * .66, s * .1); ctx.fill(); ctx.lineWidth = s * .07; ctx.stroke();
    ctx.fillStyle = '#d9b46a'; ctx.beginPath(); ctx.arc(x, y + s * .06, s * .08, 0, 7); ctx.fill(); ctx.fillRect(x - s * .03, y + s * .06, s * .06, s * .2); ctx.restore(); }
  function wardrobe() {
    if (!OUT) return Promise.resolve();
    return new Promise(res => {
      let chT = -9, pressed = null, pressT = 0;
      const o = open({ res });
      snd('ui_open', .7);
      const BTN_BACK = { x: 912, y: 589, w: 256, h: 46 }, BTN_MORE = { x: 1004, y: 58, w: 160, h: 44 }, BTN_X = { x: 1170, y: 54, w: 52, h: 52 };
      const closeAll = (more) => { o.close(); res(); if (more && S.menu && typeof MTABS !== 'undefined') { const i = MTABS.indexOf('换装'); if (i >= 0) { S.menu.tab = i; S.menu.of = OUT.get(); } } };
      o.paint = () => {
        const now = performance.now(), t = (now - o.t0) / 1000, k = ease(t / .25), cur = OUT.get();
        ctx.fillStyle = `rgba(3,5,12,${.8 * k})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = k;
        pic('wardrobe_frame', 0, 0, 1280, 720);
        txt('衣　柜', 640, 80, 38, '#ead5a6');
        // 右上：更多造型 / 关闭
        ctx.font = `600 17px ${FONT}`; ctx.fillStyle = '#cdbf9c'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('更多造型 ›', BTN_MORE.x + BTN_MORE.w - 8, 80);
        ctx.save(); ctx.translate(BTN_X.x + 26, 80); ctx.strokeStyle = '#d9b46a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fillStyle = 'rgba(20,12,6,.6)'; ctx.fill(); ctx.stroke(); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-7, -7); ctx.lineTo(7, 7); ctx.moveTo(7, -7); ctx.lineTo(-7, 7); ctx.stroke(); ctx.restore();
        // 左：人物展示
        ctx.save(); ctx.beginPath(); ctx.rect(48, 131, 774, 528); ctx.clip();
        const wear = CARDS.find(c => c.id === cur);
        const im = (wear && heroImg(cur)) || (typeof IMG !== 'undefined' && IMG.b_yegx);
        glow(425, 400, 300, cur === 'guxing' ? '230,236,255' : '150,180,255', .18);
        if (A.halo) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha *= .55 + .1 * Math.sin(t * 2); ctx.drawImage(A.halo, 210, 520, 430, 160); ctx.restore(); }
        if (im && (im.naturalWidth || im.width)) { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, s = Math.min(570 / iw, 470 / ih), w = iw * s, h = ih * s, bob = Math.sin(t * 1.8) * 3;
          ctx.drawImage(im, 425 - w / 2, 612 - h + bob, w, h); }
        const ck = Math.max(0, 1 - (t - chT) / .6); if (ck > 0) { glow(425, 400, 320, '255,245,220', .6 * ck); sparkles(425, 400, 260, 220, 24, t, ck); }
        ctx.restore();
        ctx.font = `28px ${BRUSH}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; textOutline('叶孤星 · ' + (wear ? (wear.id === 'guxing' ? '孤星白衣' : wear.name) : ((OUT.list.find(x => x.id === cur) || {}).name || '')), 80, 168, '#ead5a6', 'rgba(10,8,4,.8)', 4);
        ctx.font = `600 15px ${FONT}`; ctx.fillStyle = '#9fb0c4'; ctx.fillText('战斗建模、立绘、地图行走一起更换', 80, 636);
        // 右：两张选择卡
        for (const c of CARDS) { const [x, y, w, h] = c.box, on = cur === c.id, lk = locked(c), pr = pressed === c && now - pressT < 160;
          if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(x, y, x + w, y); g.addColorStop(0, 'rgba(230,199,119,.16)'); g.addColorStop(1, 'rgba(230,199,119,.04)'); ctx.fillStyle = g; roundRect(x + 2, y + 2, w - 4, h - 4, 8); ctx.fill(); ctx.restore();
            ctx.save(); ctx.shadowColor = 'rgba(255,215,130,.8)'; ctx.shadowBlur = 14 + 4 * Math.sin(t * 3); ctx.strokeStyle = '#e6c777'; ctx.lineWidth = 3; roundRect(x - 2, y - 2, w + 4, h + 4, 10); ctx.stroke(); ctx.restore(); }
          if (pr) { ctx.fillStyle = 'rgba(255,240,200,.12)'; roundRect(x, y, w, h, 8); ctx.fill(); }
          const iy = y + h / 2;
          ctx.save(); if (lk) ctx.globalAlpha *= .35; if (on) glow(x + 88, iy, 80, '255,230,170', .25); picC(c.icon, x + 88, iy, 140); ctx.restore();
          ctx.font = `30px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(c.name, x + 254, iy - 38, lk ? '#a99f8a' : '#fff0c8', 'rgba(10,8,4,.85)', 4);
          ctx.font = `600 15px ${FONT}`; ctx.fillStyle = lk ? '#8a8578' : '#b7cbdc'; ctx.fillText(c.sub, x + 254, iy + 2);
          if (lk) { lockGlyph(x + 88, iy, 54, 1); ctx.font = `600 16px ${FONT}`; ctx.fillStyle = '#d0a860'; ctx.fillText('未解锁 · 取得流云仙衣后开放', x + 254, iy + 42); }
          else { ctx.font = `600 18px ${FONT}`; ctx.fillStyle = on ? '#ffd77a' : '#cdbf9c'; ctx.fillText(on ? '✦ 已穿戴' : '点击换上', x + 254, iy + 42); } }
        // 底牌：返回
        ctx.font = `24px ${BRUSH}`; ctx.textAlign = 'center'; textOutline('返回行囊', 1040, 612, '#fbe6b0', 'rgba(20,12,4,.85)', 4);
        const tap = takeTap(o); if (!tap) return;
        if (tap.key) { snd('ui_click'); closeAll(false); return; }
        if (inRect(tap, BTN_X.x, BTN_X.y, BTN_X.w, BTN_X.h) || inRect(tap, BTN_BACK.x, BTN_BACK.y, BTN_BACK.w, BTN_BACK.h)) { snd('ui_click'); closeAll(false); return; }
        if (inRect(tap, BTN_MORE.x, BTN_MORE.y, BTN_MORE.w, BTN_MORE.h)) { snd('ui_click'); closeAll(true); return; }
        for (const c of CARDS) { const [x, y, w, h] = c.box; if (!inRect(tap, x, y, w, h)) continue; pressed = c; pressT = now;
          if (locked(c)) { snd('ui_cancel'); try { toast('取得九曜神器「流云仙衣」后解锁这套白衣', 2200); } catch (e) {} return; }
          if (cur === c.id) { snd('ui_click', .6); return; }
          snd('ui_confirm'); chT = t; try { OUT.set(c.id); } catch (e) {} return; }
      };
    });
  }
  window.R135G_WARDROBE = async () => { if (!(await need(K_WARD))) return false; await wardrobe(); return true; };
  heroImg('baipao'); heroImg('guxing');

  // 入口：行囊（菜单）里点「换装」页签 → 打开新衣柜（菜单还开着，关了衣柜回到原来那一页）
  if (OUT && typeof menuUpdate === 'function') menuUpdate = (orig => function () {
    if (CUR) return hideTap(orig, this, arguments);
    const t = input.tapped;
    if (S.menu && t && !t.key && typeof MTABS !== 'undefined' && typeof menuLayout === 'function') {
      const i = MTABS.indexOf('换装'), L = menuLayout(), r = L && L.tabs && L.tabs[i];
      if (i >= 0 && r && inRect(t, r.x, r.y, r.w, r.h) && S.menu.tab !== i) {
        consumeTap(); snd('ui_click');
        need(K_WARD).then(ok => { if (!S.menu) return; if (ok) wardrobe(); else S.menu.tab = i; });   // 图没载出来就照旧进 R88 的换装页
        return;
      }
    }
    return orig.apply(this, arguments);
  })(menuUpdate);
})();
