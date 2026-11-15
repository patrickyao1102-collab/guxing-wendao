// ================= R315 · 万宝楼的赝品：后院库房按玩家的眼睛重做 =================
// 作者 11-16：「进入库房以后那个探索和现有界面对不上」「库房再多点东西」「中间那把剑太大，手机也不好点」
// 「点开以后里面一把大剑，摸了半天也不知道摸个什么东西」「有些东西应该近距离观察，就像牙婆的册子」
// 「库房上面那个本子我点了很久都没点到，走来走去才点到」。改成：
//  ① 画面里的东西直接点：点鉴宝案上的剑匣、点墙上的出入簿，人自己走过去（不用再找地上看不见的点）；
//  ② 还没看过的东西头顶有一个小金圈「查」，看过就没了；
//  ③ 剑匣是近处细看：整只剑匣放在屏幕中间，上面两个会闪的金圈（「封条」「剑格」）——点哪个看哪个，看完打勾，下面一个「离开」；
//  ④ 出入簿翻开成一本书（和《名录》账册同一本），竖排从右往左写，看完点「合上」；
//  ⑤ 库房里多摆了些东西：酒坛、锁着的箱子、文书匣、米斗、柜子，小伍值夜的椅子和灯。只进测试版。
(function () {
  const T = typeof TMAPS !== 'undefined' && TMAPS.xt_wanbao_store; if (!T || typeof say !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const by = n => (T.npcs || []).find(x => x.name === n);
  const put = (n, x, y) => { const s = by(n); if (s) { const [c, r] = P(x, y); s.c = c; s.r = r; } return s; };
  const load = (k, src) => { try { if (!IMG[k]) { const im = new Image(); im.onload = () => { try { IMG[k] = im; } catch (e) {} }; im.src = src; } } catch (e) {} };
  const CASE = 'r219c_xt_wanbao_store_sword_case', SWORD = 'r219c_xt_wanbao_store_fake_sword', BOOK = 'r297_ledger';
  load(BOOK, 'r297/ledger_ui.webp');
  const on = () => { const s = (F().sq || {}).xt_fake; return !!s && s.s === 1; };
  const seen = k => !!((F().xw_seen || {})[k]);

  // ---------- ⑤ 多摆些东西（都是库房里用得上的） ----------
  const B = T.baked;
  if (B && !B._r315) { B._r315 = 1;
    const ADD = [   // [图, 文件, x, y, w, h]
      ['jars', 'r269/o_jars_106x139.webp', 128, 430, 106, 139], ['chest1', 'r297/s/old_chest_100x50.webp', 250, 516, 100, 50],
      ['box1', 'r297/s/secret_closed_box_90x60.webp', 362, 500, 90, 60], ['doc1', 'r297/s/rev_document_box_100x50.webp', 1092, 470, 100, 50],
      ['cab1', 'r297/s/secret_low_cabinet_140x80.webp', 1078, 868, 140, 80], ['rice', 'r297/s/house_rice_63x71.webp', 1296, 866, 63, 71],
      ['chair', 'r297/s/old_plain_chair_60x98.webp', 404, 660, 60, 98], ['lamp', 'r297/s/floor_lamp_32x88.webp', 476, 668, 32, 88],
      ['bucket', 'r297/s/rev_bucket_40x49.webp', 1232, 900, 40, 49]];
    const G = B.blocked.split(''), cs = B.cs;
    for (const [k, f, x, y, w, h] of ADD) { load('r315_' + k, f); B.objs.push({ id: 'r315_' + k, uid: 'r315_' + k, img: 'r315_' + k, x, y, w, h, sy: y + h, flip: false, noBlock: true, noPre: true });
      const d = Math.min(Math.max(h * .4, 16), 40);
      for (let yy = y + h - d; yy < y + h; yy += cs) for (let xx = x + w * .08; xx < x + w * .92; xx += cs) { const c = Math.floor(xx / cs), r = Math.floor(yy / cs); if (c >= 0 && r >= 0 && c < B.cols && r < B.rows) G[r * B.cols + c] = '1'; } }
    B.blocked = G.join('');
    // 出入簿：原来挂在后墙最上面，进门时在镜头外，点不到 → 摊在鉴宝案左头，和剑匣分开
    B.objs = B.objs.filter(o => o.img !== 'r219c_xt_wanbao_store_ledger');
    load('r315_ledger', 'r297/s/ledger_clean_62x34.webp');
    B.objs.push({ id: 'r315_ledger', uid: 'r315_ledger', img: 'r315_ledger', x: 508, y: 604, w: 62, h: 34, sy: 760, flip: false, noBlock: true, noPre: true });
  }

  // ---------- ① 点画面里的东西就算点到 ----------
  if (typeof pickInteract === 'function' && !window._r315pick) { window._r315pick = 1;
    pickInteract = (o => function (wx, wy) { try { let best = null, ba = 1e12; for (const a of world.actors || []) { const r = a.npc && a.npc.tapRect; if (r && wx >= r[0] && wx <= r[2] && wy >= r[1] && wy <= r[3]) { const ar = (r[2] - r[0]) * (r[3] - r[1]); if (ar < ba) { ba = ar; best = a; } } } if (best) return { type: 'npc', a: best }; } catch (e) {} return o.apply(this, arguments); })(pickInteract); }

  // ---------- 小工具：屏幕上的按钮 / 等一下点击 ----------
  const btn = (x, y, w, h, t) => { ctx.save(); roundRect(x, y, w, h, 12); ctx.fillStyle = 'rgba(58,36,20,.95)'; ctx.fill(); ctx.strokeStyle = '#d8b26a'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = '#f6e2b4'; ctx.font = '700 26px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x + w / 2, y + h / 2 + 1); ctx.restore(); return [x, y, w, h]; };
  const inB = (p, b) => b && p.x >= b[0] && p.x <= b[0] + b[2] && p.y >= b[1] && p.y <= b[1] + b[3];
  const nextTap = () => new Promise(res => { const up = e => { if (dialog || choice) return; cv.removeEventListener('pointerup', up); setTimeout(() => { input.tapped = null; }, 0); res(toLogical(e)); }; setTimeout(() => cv.addEventListener('pointerup', up), 250); });
  const ring = (x, y, r, done, label) => { const t = performance.now() / 380; ctx.save();
    if (!done) { ctx.globalAlpha = .35 + .25 * Math.sin(t); ctx.fillStyle = '#ffd56a'; ctx.beginPath(); ctx.arc(x, y, r * (1.25 + .12 * Math.sin(t)), 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.lineWidth = 4; ctx.strokeStyle = done ? '#8fe08a' : '#ffd56a'; ctx.fillStyle = 'rgba(20,14,8,.55)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = done ? '#8fe08a' : '#ffe9a8'; ctx.font = '800 ' + Math.round(r * .9) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(done ? '✓' : '查', x, y + 1);
    if (label) { ctx.font = '700 22px ' + FONT; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(label, x, y + r + 22); ctx.fillStyle = '#fff1c8'; ctx.fillText(label, x, y + r + 22); }
    ctx.restore(); };

  // ---------- ③ 剑匣：近处细看，两个金圈 ----------
  const ORIG = {};
  const caseView = async () => { const c = IMG[CASE], sw = IMG[SWORD]; if (!c) return ORIG.xia && ORIG.xia();
    const lk = world.locked, h0 = S.hud; world.locked = true; S.hud = false;
    const L = () => { const w = Math.min(W * .5, 660), k = w / c.width, h = c.height * k, x = (W - w) / 2, y = H * .2; return { x, y, w, h, k }; };
    const PTS = [{ key: 'xia', lx: 345, ly: 86, label: '封条 · 铜锁' }, { key: 'jian', lx: 112, ly: 70, label: '剑格' }];
    let leave = null; const o = { draw() { try { const g = L(); ctx.save(); ctx.fillStyle = 'rgba(8,6,4,.78)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f3dca6'; ctx.font = '700 30px ' + FONT; ctx.textAlign = 'center'; ctx.fillText('鉴宝案上的剑匣', W / 2, H * .1);
      ctx.font = '600 20px ' + FONT; ctx.fillStyle = '#cdb88e'; ctx.fillText('点金色的圈，凑近看那一处', W / 2, H * .1 + 34);
      ctx.imageSmoothingQuality = 'high'; ctx.drawImage(c, g.x, g.y, g.w, g.h);
      if (sw) ctx.drawImage(sw, g.x + 39 * g.k, g.y + 54 * g.k, 300 * g.k, 34 * g.k);
      for (const p of PTS) ring(g.x + p.lx * g.k, g.y + p.ly * g.k, 26, seen(p.key), p.label);
      if (!dialog) leave = btn(W / 2 - 90, H * .78, 180, 60, '离　开'); ctx.restore(); } catch (e) {} } };
    S.overlay.push(o);
    try { for (;;) { const t = await nextTap(); const g = L();
      const hit = PTS.find(p => Math.hypot(t.x - (g.x + p.lx * g.k), t.y - (g.y + p.ly * g.k)) < 48);
      if (hit) { try { playSnd('ui_click'); } catch (e) {} if (ORIG[hit.key]) await ORIG[hit.key](); continue; }
      if (inB(t, leave) || t.y > H * .9 || t.y < H * .05) break; } }
    finally { const i = S.overlay.indexOf(o); if (i >= 0) S.overlay.splice(i, 1); world.locked = lk; S.hud = h0; } };

  // ---------- ④ 出入簿：翻开成一本书 ----------
  const bookView = async () => { const im = IMG[BOOK]; if (!im) return ORIG.bu && ORIG.bu();
    const lk = world.locked, h0 = S.hud; world.locked = true; S.hud = false; let close = null, read = false;
    const o = { draw() { try { ctx.save(); ctx.fillStyle = 'rgba(8,6,4,.72)'; ctx.fillRect(0, 0, W, H);
      const sc = Math.min(W / 1536, H * (read ? .92 : .74) / 1024), bx = (W - 1536 * sc) / 2, by0 = read ? (H - 1024 * sc) / 2 : H * .01; ctx.drawImage(im, bx, by0, 1536 * sc, 1024 * sc);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3dca6'; ctx.font = '700 ' + Math.round(34 * sc) + 'px ' + FONT; ctx.fillText('库房出入簿', bx + 768 * sc, by0 + 140 * sc);
      const col = (t, cx, red) => { ctx.fillStyle = red ? '#9a1c12' : '#2a1a0e'; ctx.font = '600 ' + Math.round(32 * sc) + 'px ' + FONT; let y = 300; for (const ch of t) { if (ch === ' ') { y += 14; continue; } ctx.fillText(ch === '·' ? '・' : ch, bx + cx * sc, by0 + y * sc); y += ch === '·' ? 30 : 40; } };
      ['本　月', '初七 · 小伍 · 值夜', '初八 · 掌柜 · 盘库', '初九 · 小伍 · 值夜'].forEach((t, i) => col(t, 1290 - i * 76, i === 0));
      ['上　月', '十三 · 秦 · 复验', '十五 · 秦 · 复验', '十七 · 秦 · 复验', '十九 · 秦 · 复验', '廿一 · 秦 · 复验'].forEach((t, i) => col(t, 680 - i * 76, i === 0));
      if (read && !dialog) { ctx.fillStyle = '#f3dca6'; ctx.font = '700 ' + Math.round(30 * sc) + 'px ' + FONT; ctx.fillText('合　上', bx + 767 * sc, by0 + 914 * sc); close = [bx + 640 * sc, by0 + 870 * sc, 254 * sc, 90 * sc]; }
      ctx.restore(); } catch (e) {} } };
    S.overlay.push(o);
    try { if (ORIG.bu) await ORIG.bu(); read = true; await nextTap(); try { playSnd('ui_click'); } catch (e) {} }
    finally { const i = S.overlay.indexOf(o); if (i >= 0) S.overlay.splice(i, 1); world.locked = lk; S.hud = h0; } };

  // 原来三处的话照新图改几句
  const FIX = [['乌木长匣，三道铜锁。', '乌木长匣开在鉴宝案上，三道铜锁还挂在匣沿。'], ['一只乌木长匣，铜锁锃亮。', '鉴宝案上开着一只乌木长匣，铜锁锃亮，匣里躺着一柄剑。'],
    ['案上横着一柄古剑。', '剑匣里躺着一柄古剑。'], ['墙上挂着一本出入簿。', '鉴宝案的左头，摊着一本出入簿。'], ['匣盖的封条是揭开后又原样贴回去的', '匣盖内沿那道封条，是揭开后又原样贴回去的']];
  const fixed = fn => async function () { const sv = window.say; window.say = function (w, t) { if (typeof t === 'string') for (const [a, b] of FIX) t = t.split(a).join(b); return sv.call(this, w, t); };
    try { return await fn.apply(this, arguments); } finally { window.say = sv; } };
  const CASE_RECT = [576, 540, 972, 668], BOOK_RECT = [488, 580, 576, 664];
  const s1 = put('剑匣', 690, 790), s2 = put('匣中的剑', 850, 790), s3 = put('库房出入簿', 530, 790);
  if (s1 && !s1._r315) { s1._r315 = 1; ORIG.xia = fixed(s1.talk); s1.talk = caseView; s1.tapRect = CASE_RECT; }
  if (s2 && !s2._r315) { s2._r315 = 1; ORIG.jian = fixed(s2.talk); s2.talk = caseView; s2.tapRect = CASE_RECT; }
  if (s3 && !s3._r315) { s3._r315 = 1; ORIG.bu = fixed(s3.talk); s3.talk = bookView; s3.tapRect = BOOK_RECT; }

  // ---------- ② 还没看过的东西头顶一个小金圈 ----------
  const MARK = { draw() { try { if (world.mapName !== 'xt_wanbao_store' || S.scene !== drawMap || dialog || choice || world.locked || !on() || !world.cam) return;
    const z = VZ(), C = world.cam, sx = x => (x - C.x) * z, sy = y => (y - C.y) * z;
    if (!seen('xia') || !seen('jian')) ring(sx(766), sy(528), 20, false, '剑匣');
    if (!seen('bu')) ring(sx(539), sy(586), 18, false, '出入簿'); } catch (e) {} } };
  try { if (!S.overlay.includes(MARK)) S.overlay.push(MARK); } catch (e) {}
  if (typeof updateMap === 'function') updateMap = (o => function () { try { if (world.mapName === 'xt_wanbao_store' && !S.overlay.includes(MARK)) S.overlay.unshift(MARK); } catch (e) {} return o.apply(this, arguments); })(updateMap);
})();
