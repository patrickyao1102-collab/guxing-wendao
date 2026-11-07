// ================= R155 · 战斗胜利结算框（金色海棠云窗，作者 11-08 定：新风格 R164 出来前先用它）=================
// 拆件 r155/*.webp + r155/layout.json（Codex 交付 R155_战斗胜利结算框，anchorsByCount 按「N人K掉落」给坐标）
// 只接管 showPanel('战斗胜利', …)；拆件没载完 / 出错时退回原来的窗口
(function () {
  if (typeof S === 'undefined' || typeof showPanel !== 'function') return;
  const NAMES = ['frame_top', 'frame_body_tile', 'frame_bottom', 'button_normal', 'button_pressed', 'title_blank', 'portrait_hero', 'portrait_linxue', 'portrait_yunting', 'portrait_luochen', 'portrait_shenle', 'role_row', 'item_slot', 'level_badge', 'xp_track', 'xp_fill', 'victory_glow', 'spirit_stone'];
  const IM = {}; let L = null, ready = false;
  const load = () => { if (load.p) return load.p;
    return load.p = Promise.all([fetch('r155/layout.json', { cache: 'no-cache' }).then(r => r.json()).then(j => { L = j; }),
      ...NAMES.map(n => new Promise((res, rej) => { const im = new Image(); im.onload = () => { IM[n] = im; res(); }; im.onerror = rej; im.src = 'r155/' + n + '.webp'; }))])
      .then(() => { ready = true; }).catch(e => { console.warn('R155 载入失败', e); load.p = null; }); };
  setTimeout(load, 2500);
  const F = { heading: 'GuxingDF', body: 'GuxingKai', number: '"Times New Roman"' };
  const NAME = { hero: '叶孤星', yunting: '云霆', linxue: '林雪', shenle: '神乐', luochen: '洛尘' };

  let cur = null;
  window.R155_OPEN = () => !!cur; window.R155_READY = () => [ready, !!L, Object.keys(IM).length];
  const spr = (k, x, y, w, h) => { const im = IM[k]; if (im) ctx.drawImage(im, x, y, w, h); };
  function txt(s, [x, y, w, h], font, size, color, align, gold) {
    ctx.save(); ctx.font = `${font === 'number' ? 'bold ' : ''}${size}px ${F[font]}, serif`; ctx.textBaseline = 'middle'; ctx.textAlign = align;
    let tw = ctx.measureText(s).width; if (tw > w) { ctx.font = `${font === 'number' ? 'bold ' : ''}${Math.max(16, Math.floor(size * w / tw))}px ${F[font]}, serif`; }
    const tx = align === 'left' ? x : align === 'right' ? x + w : x + w / 2, ty = y + h / 2;
    if (gold) { const g = ctx.createLinearGradient(0, y, 0, y + h); L.text.titleGold.forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
      ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(70,38,12,.85)'; ctx.strokeText(s, tx, ty); ctx.fillStyle = g; }
    else ctx.fillStyle = color;
    ctx.fillText(s, tx, ty); ctx.restore(); }
  function portrait(role, [x, y, w, h]) {
    const im = IM['portrait_' + role] || IM.portrait_hero, c = L.portraitSourceCrops2x[role] || L.portraitSourceCrops2x.hero, cx = x + w / 2, cy = y + h / 2;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, w / 2 - 3, 0, 7); ctx.clip(); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x, y, w, h);
    if (im) ctx.drawImage(im, c[0], c[1], c[2] - c[0], c[3] - c[1], x + 3, y + 3, w - 6, h - 6); ctx.restore();
    for (const [r, col] of [[27, '#765D3E'], [26, '#D8BE88'], [24.5, '#8B7C63']]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke(); } }

  function draw() {
    const c = cur; if (!c) return; const d = c.d, A = c.A, now = performance.now(), e = 1 - Math.pow(1 - Math.min(1, (now - c.t0) / 260), 3);
    ctx.save(); ctx.globalAlpha = .72 * e; ctx.fillStyle = '#04060b'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = e;
    ctx.translate(640, 360); ctx.scale(.95 + .05 * e, .95 + .05 * e); ctx.translate(-640, -360 + (1 - e) * 16);
    try {
      const [fx, fy, fw] = A.frame, ty = A.titleY;
      ctx.save(); ctx.globalAlpha *= .55 + .45 * (.5 - .5 * Math.cos(now / 1600 * Math.PI * 2)); spr('victory_glow', 360, Math.max(0, ty - 16), 560, 110); ctx.restore();
      spr('title_blank', 425, ty, 430, 72);
      txt('战斗', [492, ty + 3, 130, 59], 'heading', 52, '#FFF1D5', 'right', true); txt('胜利', [658, ty + 3, 130, 59], 'heading', 52, '#FFF1D5', 'left', true);
      spr('frame_top', fx, fy, fw, 114); for (let i = 0; i < A.bodyTiles; i++) spr('frame_body_tile', fx, fy + 114 + 68 * i, fw, 68); spr('frame_bottom', fx, fy + 114 + 68 * A.bodyTiles, fw, 129);
      const HC = '#78501F';
      txt('出战角色', [186, fy + 70, 290, 38], 'heading', 28, HC, 'left'); txt('本场经验', [495, fy + 70, 210, 38], 'heading', 28, HC, 'center'); txt('升级进度', [793, fy + 70, 280, 38], 'heading', 28, HC, 'center');
      d.members.forEach((m, i) => { const ox = 160, oy = A.rowsY + 68 * i, R = (r) => [ox + r[0], oy + r[1], r[2], r[3]], T = L.roleTemplate.localRects;
        spr('role_row', ...R(T.role_row)); portrait(m.role, R(T.portrait));
        txt(m.name, R(T.name), 'heading', 31, '#3B271E', 'left');
        if (m.up) { spr('level_badge', ...R(T.level_badge)); txt('升级！', R(T.levelText), 'heading', 26, '#FFF1D5', 'center'); }
        txt('+' + m.gain, R(T.gain), 'number', 37, '#82521F', 'center');
        txt(m.cur + ' / ' + m.need, R(T.progressText), 'number', 29, '#3B271E', 'center');
        spr('xp_track', ...R(T.xp_track)); const fr = m.need > 0 ? Math.max(0, Math.min(1, m.cur / m.need)) : 1, [x, y, w, h] = R(T.xp_fill);
        if (IM.xp_fill && fr > 0) ctx.drawImage(IM.xp_fill, 0, 0, IM.xp_fill.width * fr, IM.xp_fill.height, x, y, w * fr, h); });
      const ry = A.rewardsY, K = d.drops.length;
      ctx.fillStyle = '#B38942'; ctx.beginPath(); ctx.moveTo(171, ry + 20); ctx.lineTo(175, ry + 24); ctx.lineTo(171, ry + 28); ctx.lineTo(167, ry + 24); ctx.fill();
      txt(K ? '掉落物品' : '本场无掉落', [186, ry + 6, 220, 36], 'heading', 29, K ? HC : '#78553D', 'left');
      ctx.strokeStyle = '#C8A777'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(K ? 343 : 375, ry + 25); ctx.lineTo(843, ry + 25); ctx.stroke();
      spr('spirit_stone', 856, ry + 8, 32, 32); txt('灵石', [897, ry + 5, 65, 38], 'heading', 28, HC, 'left'); txt('+' + d.gold, [955, ry + 4, 123, 40], 'number', 34, '#765024', 'right');
      d.drops.forEach((it, i) => { const cx = A.itemCenters[i]; if (cx == null) return;
        spr('item_slot', cx - 32, ry + 48, 64, 64);
        if (it.id && typeof itemIcon === 'function') { ctx.save(); try { itemIcon(it.id, cx, ry + 80, 26); } catch (er) {} ctx.restore(); }
        txt(it.name, [cx - 74, ry + 116, 148, 32], 'body', 26, '#3B271E', 'center'); txt('×' + it.n, [cx - 69, ry + 148, 138, 32], 'number', 28, '#78553D', 'center'); });
      const by = A.buttonY; spr(c.pressed ? 'button_pressed' : 'button_normal', 516, by, 248, 62); txt('确定', [528, by + 5 + (c.pressed ? 1 : 0), 224, 51], 'heading', 36, '#45301D', 'center');
    } catch (err) { console.warn('R155 draw', err); ctx.restore(); close(); return; }
    ctx.restore();
  }
  function close() { const c = cur; cur = null; if (c) c.res(true); }
  // 画在整帧最后（战斗里的队伍血条、行动条都在浮层之后画，放 overlay 会被它们压住）
  if (typeof frameInner === 'function') frameInner = (o => function () { const r = o.apply(this, arguments); if (cur) { ctx.save(); ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.globalAlpha = 1; draw(); ctx.restore(); } return r; })(frameInner);
  else S.overlay.push({ draw }); 
  const inBtn = (x, y) => { if (!cur) return false; const [rx, ry, rw, rh] = cur.A.hitAreas.confirm.rect; return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh; };
  function tap(t) { if (!cur || performance.now() - cur.t0 < 500) return; if (t.key || inBtn(t.x, t.y)) { try { playSnd('ui_click'); } catch (e) {} close(); } }
  consumeTap = (o => function () { if (cur) { o(); return null; } return o(); })(consumeTap);
  if (typeof menuUpdate === 'function') menuUpdate = (o => function () { if (cur) { input.tapped = null; return; } return o.apply(this, arguments); })(menuUpdate);
  cv.addEventListener('pointerup', e => { if (!cur) return; try { tap(toLogical(e)); } catch (err) {} });
  window.addEventListener('keydown', e => { if (cur && (e.key === ' ' || e.key === 'Enter')) tap({ key: true }); });
  (function tick() { if (cur) { cur.pressed = !!input.down && inBtn(input.x, input.y); input.tapped = null; } requestAnimationFrame(tick); })();

  // ---------- 接管「战斗胜利」 ----------
  startBattle = (orig => function () { const r = orig.apply(this, arguments); try { if (battle) battle._lv55 = S.hero.lv; } catch (e) {} return r; })(startBattle);
  const idOf = name => { try { for (const [id, it] of Object.entries(ITEM_DB)) if (it && it.name === name) return id; } catch (e) {} return null; };
  showPanel = (orig => function (title, lines) {
    try {
      if (String(title) === '战斗胜利' && ready && typeof battle !== 'undefined' && battle) {
        const Ls = (lines || []).filter(Boolean).map(String), num = re => { const l = Ls.find(x => re.test(x)); const m = l && l.match(/\+\s*(\d+)/); return m ? +m[1] : 0; };
        const exp = num(/经验/), gold = num(/灵石/), up = S.hero.lv > (battle._lv55 || S.hero.lv), need = typeof expNeed === 'function' ? expNeed(S.hero.lv) : 0;
        const members = (battle.heroes || [battle.P]).filter(Boolean).slice(0, 4).map(u => { const k = u === battle.main || !u.ally ? 'hero' : u.ally;
          return { role: NAME[k] ? k : 'hero', name: k === 'hero' ? '叶孤星' : (NAME[k] || u.name), gain: exp, cur: Math.round(S.hero.exp || 0), need, up }; });
        const cnt = new Map();
        for (const l of Ls) { const m = l.match(/^!?(?:掉落|获得)[：:](.*)$/); if (!m) continue;
          for (const raw of m[1].split(/[、，,]/)) { const nm = raw.trim(); if (!nm) continue; const q = +((nm.match(/[×x]\s*(\d+)$/) || [])[1] || 1), base = nm.replace(/[×x]\s*\d+$/, '').trim(); cnt.set(base, (cnt.get(base) || 0) + q); } }
        const drops = [...cnt].slice(0, 6).map(([name, n]) => ({ name, n, id: idOf(name) }));
        const key = members.length + 'p' + drops.length + 'd', A = L.anchorsByCount[key];
        if (members.length && A) { const self = this, args = arguments;
          return new Promise(res => { cur = { A, d: { members, drops, gold }, t0: performance.now(), pressed: false, res }; }); }
      }
    } catch (e) { console.warn('R155 victory', e); }
    return orig.apply(this, arguments);
  })(showPanel);
  window.R155_TEST = () => showPanel('战斗胜利', ['经验 +360（740 / 1200）', '灵石 +240（共 999）', '!掉落：回春丹、回春丹、狼牙']);
})();
