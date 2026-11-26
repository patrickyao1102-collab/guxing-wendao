// ================= R370 · 游戏感②：妖王讨伐榜、法宝界面、野外等级牌与进图横幅（Codex R372 美术）（只进测试版）=================
// 作者 11-26 夜：「允许设计新的功能界面以及等级提示牌」「各种框游戏感也不足，你找 Codex 设计」。
//   · 讨伐榜：天剑宗玄天据点前院立一块木榜（Codex R372-B），点开是五张悬赏令（R372-A）；修为差得远的妖王先不露面。
//   · 法宝：地图右下角「行囊」上面多一个法宝钮（有了法宝才出现），点开是星图 + 卷轴的法宝界面（R372-E），选一件带上。
//   · 野外：进图时屏幕上方出水墨横幅写地名和妖兽等级（R372-C），入口立木牌；妖王跟前立界碑。
(function () {
  if (!window.R370_YW || typeof S === 'undefined' || typeof TMAPS === 'undefined' || typeof cv === 'undefined') return;
  const YW = R370_YW.filter(y => !y.hidden), FB = R370_FB, art = R370_ART, F = () => (S.flags = S.flags || {});
  const inR = (p, x, y, w, h) => p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
  const DIG = '零一二三四五六七八九';
  const CN = n => n < 10 ? DIG[n] : n < 20 ? '十' + (n % 10 ? DIG[n % 10] : '') : DIG[Math.floor(n / 10)] + '十' + (n % 10 ? DIG[n % 10] : '');
  const done = y => !!F()['yw_' + y.id], shown = y => done(y) || S.hero.lv >= y.lv - 4;
  const INK = '#3a2412', RED = '#9a2a1c';
  const tx = (t, x, y, font, color, align = 'left') => { ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(t, x, y); };
  function wrap(t, x, y, w, lh, font, color, maxLines = 9) { ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; let line = '', n = 0;
    for (const ch of t) { if (ctx.measureText(line + ch).width > w && !/[，。、；：！？」）…—]/.test(ch)) { ctx.fillText(line, x, y + n * lh); line = ch; if (++n >= maxLines) return n; } else line += ch; }
    if (line) ctx.fillText(line, x, y + n * lh); return n + 1; }
  // ---------- 弹出界面：点按都收在这里，不漏到地图上 ----------
  const UI = { cur: null, taps: [] };
  try { cv.addEventListener('pointerdown', e => { if (!UI.cur) return; UI.taps.push(toLogical(e)); e.stopImmediatePropagation(); e.preventDefault(); }, true); } catch (e) {}
  async function modal(draw, onTap) { if (UI.cur) return; const lock0 = world.locked, hud0 = S.hud; S.hud = false; /* 榜 / 法宝开着时收起小地图、队伍条、任务栏（原来任务栏会压在界面右上角） */ UI.cur = { draw, t0: performance.now() }; UI.taps.length = 0; world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    try { playSnd('ui_confirm', .5); } catch (e) {}
    try { for (;;) { await nextFrame(); const tp = UI.taps.shift(); if (!tp) continue; const r = onTap(tp); if (r !== undefined) return r; } } finally { UI.cur = null; world.locked = lock0; S.hud = hud0; try { input.tapped = null; } catch (e) {} } }
  const dim = () => { const a = Math.min(1, (performance.now() - UI.cur.t0) / 160); ctx.fillStyle = `rgba(8,5,3,${.58 * a})`; ctx.fillRect(0, 0, W, H); return a; };

  // ---------- 妖王讨伐榜 ----------
  const BX = 120, BY = 50, PX = [56, 244, 432, 620, 808], PY = 89;
  for (const n of ['board_bg', 'poster', 'poster_02', 'poster_03', 'poster_locked', 'poster_sel', 'stamp_zhu', 'btn', 'btn_down', 'btn_close', 'yw_boar', 'yw_wolf', 'yw_leopard', 'yw_spider', 'yw_treant']) setTimeout(() => art(n), 12000);
  async function openBoard() {
    let sel = YW.findIndex(y => !done(y) && shown(y)); if (sel < 0) sel = 0; let press = 0; let go = null;
    await modal(() => { ctx.save(); const a = dim(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 14);
      const bg = art('board_bg'); if (bg) ctx.drawImage(bg, BX, BY, 1040, 620);
      YW.forEach((y, i) => { const x = BX + PX[i], yy = BY + PY, ok = shown(y), po = art(ok ? ['poster', 'poster_02', 'poster_03'][i % 3] : 'poster_locked'); if (po) ctx.drawImage(po, x, yy, 176, 250);
        tx('悬　赏', x + 88, yy + 22, `700 15px ${FONT}`, '#f8e6b8', 'center');
        if (ok) { const pm = art('yw_' + y.id); if (pm) ctx.drawImage(pm, x + 13, yy + 41, 150, 130); }
        tx(ok ? y.ep + ' · ' + y.name : '？？？', x + 88, yy + 192, `700 14px ${FONT}`, INK, 'center');
        tx(ok ? y.where.split(' · ')[0] : '尚未露面', x + 88, yy + 209, `13px ${FONT}`, '#5a4028', 'center');
        tx('荐战 ' + CN(y.lv) + ' 级', x + 88, yy + 226, `13px ${FONT}`, S.hero.lv + 2 < y.lv ? RED : '#5a4028', 'center');
        if (done(y)) { const st = art('stamp_zhu'); if (st) { ctx.save(); ctx.translate(x + 112, yy + 122); ctx.rotate(-.12); ctx.globalAlpha *= .92; ctx.drawImage(st, -55, -55, 110, 110); ctx.restore(); } }
        if (i === sel) { const ps = art('poster_sel'); if (ps) ctx.drawImage(ps, x - 10, yy - 10, 196, 270); } });
      const y = YW[sel], ok = shown(y), dx = BX + 96, dy = BY + 386;
      if (ok) { tx(y.ep + ' · ' + y.name, dx, dy + 42, `38px ${BRUSH}`, INK);
        if (done(y)) tx('已讨伐', dx + ctx.measureText(y.ep + ' · ' + y.name).width + 26, dy + 46, `700 20px ${FONT}`, RED);
        tx('出没之地', dx, dy + 88, `700 18px ${FONT}`, '#6a4a2a'); tx(y.where, dx + 92, dy + 88, `18px ${FONT}`, INK);
        tx('荐战等级', dx + 392, dy + 88, `700 18px ${FONT}`, '#6a4a2a'); tx(CN(y.lv) + ' 级（你 ' + CN(S.hero.lv) + ' 级）', dx + 484, dy + 88, `18px ${FONT}`, S.hero.lv + 2 < y.lv ? RED : INK);
        const fb = ITEM_DB[y.fabao]; tx('讨伐所得', dx, dy + 120, `700 18px ${FONT}`, '#6a4a2a'); const ic = window.R370_ICON && R370_ICON(y.fabao); if (ic) ctx.drawImage(ic, dx + 88, dy + 102, 36, 36);
        tx('法宝「' + fb.name + '」· ' + fb.grade + '　妖王内丹', dx + 130, dy + 120, `18px ${FONT}`, INK);
        wrap(y.tip, dx, dy + 152, 600, 24, `17px ${FONT}`, '#5a4028', 2); }
      else { tx('？？？', dx, dy + 42, `38px ${BRUSH}`, INK); wrap('这只妖王还没有露面。等你修为到 ' + CN(y.lv - 4) + ' 级前后，榜上自会贴出它的悬赏。', dx, dy + 96, 640, 28, `18px ${FONT}`, '#5a4028', 3); }
      const b = art(press ? 'btn_down' : 'btn'); if (b) ctx.drawImage(b, BX + 760, BY + 478, 200, 60); tx('合上榜单', BX + 860, BY + 508 + (press ? 2 : 0), `700 20px ${FONT}`, '#f3dfae', 'center');
      if (ok && !done(y) && window.QUEST_NAV) { const b3 = art('btn'); if (b3) ctx.drawImage(b3, BX + 760, BY + 410, 200, 60); tx('带我去', BX + 860, BY + 440, `700 20px ${FONT}`, '#f3dfae', 'center'); }   // 自动寻路到妖王跟前（走不通的地方会照原来的规矩提示）
      const c = art('btn_close'); if (c) ctx.drawImage(c, BX + 978, BY + 14, 56, 56);
      ctx.restore(); },
    tp => { for (let i = 0; i < 5; i++) if (inR(tp, BX + PX[i], BY + PY, 176, 250)) { sel = i; try { playSnd('ui_click'); } catch (e) {} return; }
      if (inR(tp, BX + 760, BY + 410, 200, 60) && shown(YW[sel]) && !done(YW[sel]) && window.QUEST_NAV) { go = YW[sel]; try { playSnd('ui_confirm'); } catch (e) {} return true; }
      if (inR(tp, BX + 760, BY + 478, 200, 60) || inR(tp, BX + 970, BY + 6, 72, 72) || !inR(tp, BX, BY, 1040, 620)) return true; });
    // 第一次看榜：星旋借一面护心镜，顺带教一下法宝怎么用
    if (!F().r370_fb0) { F().r370_fb0 = 1; world.locked = true; try {
      await say('星旋', '讨伐妖王？就你这点微末道行……算了，总比天天在城里闲晃强。');
      await say('星旋', '本姑娘的宝库角落里有面护心镜，先借你使着。打架时点左上角的法宝，一场只能祭一回，挑要命的时候再用。');
      FB.give('fb_huxin'); if (window.itemGet) await itemGet([{ icon: 'item:fb_huxin', name: ITEM_DB.fb_huxin.name, count: '×1', desc: ITEM_DB.fb_huxin.desc }], '星旋借出一件法宝');
      toast('地图右下角多了一个「法宝」钮：点开可以换带哪一件', 3200); } finally { world.locked = false; } }
    if (go) { const y = go; try { const R = window.QUEST_ROUTE, here = world.mapName, can = m => here === m || !!(R && R.nextHop && R.nextHop(here, m) !== undefined);
        if (can(y.map)) { window.QNAV_GOAL = () => ({ map: y.map, pt: [y.pos[0], y.pos[1] + 40] }); QUEST_NAV.start(); }
        else if (/^m_yy_/.test(y.map) && can('xt_city')) {   // 幽影林：路网里连不过去（要在南城门自己选往哪走），先带到南城门口
          const C = TMAPS.xt_city, g = (C.exits || []).find(e => e.to === 'yy_forest' || e.to === 'm_yy_tiger'), cs = C.baked && C.baked.cs;
          await say('', '（幽影林在玄天城南城门外。先带你到南城门——出了城门，选「幽影林」。）');
          if (g && cs) { const pt = [(g.x + (g.w || 1) / 2) * cs, g.y * cs - 130]; window.QNAV_GOAL = () => ({ map: 'xt_city', pt }); QUEST_NAV.start(); } }
        else await say('', { hf_valley: '（黑风谷离这里很远。回青竹小院找松伯用传送玉符最快。）', tj_xiashan: '（松风林道在天剑山下。回宗门从山门下山，或者用松伯的传送玉符。）', lin_forest: '（山外树林在青阳镇外。用松伯的传送玉符最快。）' }[y.map] || '（从这里走不过去，得用松伯的传送玉符。）');
      } catch (e) { console.warn('R370 nav', e); } }
  }
  window.R370_BOARD = openBoard;

  // ---------- 法宝界面 ----------
  const SX = [58, 238, 418], SY = [139, 349];
  for (const n of ['fabao_bg', 'fabao_seat_empty', 'fabao_seat_have', 'fabao_seat_on', 'btn_star', 'btn_star_down', 'fabao_btn_ready', 'fabao_btn_used', 'boss_plate', 'boss_bar_fill', 'boss_bar_fill_break', 'warn_strip', 'fuzhu', 'yw_mark', 'yw_nameplate', 'banner_area', 'banner_area_danger']) setTimeout(() => art(n), 10000);
  let ND = null, NDARM = null, NDFX = null;   // 妖王内丹祭炼：一颗内丹直接升一阶（和「多祭出几回自己升」二选一；内丹还能留着做妖王战袍）
  async function openFabao() {
    const ids = FB.list(), st = FB.state(); let sel = Math.max(0, ids.indexOf(st.on)); if (!st.own[ids[sel]]) sel = Math.max(0, ids.findIndex(id => st.own[id]));
    await modal(() => { ctx.save(); const a = dim(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 14);
      const bg = art('fabao_bg'); if (bg) ctx.drawImage(bg, BX, BY, 1040, 620);
      ids.forEach((id, i) => { const x = BX + SX[i % 3], y = BY + SY[Math.floor(i / 3)], own = !!st.own[id], on = st.on === id, seat = art(!own ? 'fabao_seat_empty' : on ? 'fabao_seat_on' : 'fabao_seat_have'); if (seat) ctx.drawImage(seat, x, y, 150, 150);
        if (own) { const ic = window.R370_ICON && R370_ICON(id); if (ic) ctx.drawImage(ic, x + 31, y + 31, 88, 88); }
        if (i === sel) { ctx.save(); ctx.strokeStyle = `rgba(255,236,170,${.55 + Math.sin(performance.now() / 260) * .3})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 75, y + 75, 72, 0, 7); ctx.stroke(); ctx.restore(); }
        tx(own ? ITEM_DB[id].name : '尚未获得', x + 75, y + 166, `${own ? 700 : 400} 18px ${FONT}`, own ? '#f4e6c0' : '#8f95ad', 'center');
        if (on) tx('出战', x + 75, y + 188, `700 14px ${FONT}`, '#ffd76a', 'center'); });
      const id = ids[sel], it = ITEM_DB[id], own = !!st.own[id], on = st.on === id, cx = BX + 795;
      if (own) { tx(it.name, cx, BY + 174, `40px ${BRUSH}`, INK, 'center'); const rk = R370_FB_RANK(id); tx(it.grade + '　·　' + rk.name + (on ? '　·　出战' : ''), cx, BY + 223, `700 17px ${FONT}`, RED, 'center');
        const n = wrap(NEWDESC(it), BX + 662, BY + 268, 266, 25, `16px ${FONT}`, '#4a3420', 3); const n2 = wrap(it.eff, BX + 662, BY + 268 + n * 25 + 10, 266, 25, `700 16px ${FONT}`, INK, 4); const hy = BY + 268 + (n + n2) * 25 + 22, nd = itemCount('m_neidan'); ND = null;
        if (rk.next && nd > 0) { const by = Math.min(hy + 16, BY + 407); if (by - hy >= 14) tx('再祭出 ' + rk.next + ' 回，祭炼' + (rk.r ? '大成' : '小成') + '；或者——', BX + 662, hy, `14px ${FONT}`, '#7a5a34');
          ND = { x: BX + 662, y: by, w: 266, h: 38, id }; const b2 = art('btn_star'), arm = NDARM && NDARM.id === id && performance.now() - NDARM.t < 3500; if (b2) ctx.drawImage(b2, ND.x, ND.y, ND.w, ND.h);
          tx(arm ? '再点一次：用掉 1 颗内丹' : '用妖王内丹祭炼' + (rk.r ? '大成' : '小成') + '（有 ' + nd + ' 颗）', ND.x + ND.w / 2, ND.y + ND.h / 2 + 1, `700 15px ${FONT}`, arm ? RED : '#4a3418', 'center'); }
        else tx(rk.next ? '再祭出 ' + rk.next + ' 回，祭炼' + (rk.r ? '大成' : '小成') + '（效果更强）' : '已祭炼大成', BX + 662, hy, `14px ${FONT}`, '#7a5a34');
        if (NDFX && performance.now() - NDFX.t < 1600 && NDFX.id === id) { const k = (performance.now() - NDFX.t) / 1600; ctx.save(); ctx.globalAlpha = Math.min(1, (1 - k) * 2.2); tx('祭炼' + NDFX.name + '！', cx, BY + 132 - k * 16, `34px ${BRUSH}`, RED, 'center'); ctx.restore(); }
        const b = art('btn_star'); if (b) ctx.drawImage(b, BX + 695, BY + 451, 200, 60); tx(on ? '收回法宝' : '带上出战', cx, BY + 481, `700 20px ${FONT}`, '#4a3418', 'center'); }
      else { tx('？？？', cx, BY + 174, `40px ${BRUSH}`, INK, 'center'); const y = YW.find(q => q.fabao === id); wrap(y ? '讨伐「' + y.ep + ' · ' + y.name + '」所得。妖王的悬赏贴在天剑宗玄天据点前院的讨伐榜上。' : '还没有得到。', BX + 662, BY + 268, 266, 26, `16px ${FONT}`, '#4a3420', 5); }
      const c = art('btn_close'); if (c) ctx.drawImage(c, BX + 986, BY + 30, 50, 50);
      ctx.restore(); },
    tp => { for (let i = 0; i < ids.length; i++) if (inR(tp, BX + SX[i % 3], BY + SY[Math.floor(i / 3)], 150, 190)) { sel = i; try { playSnd('ui_click'); } catch (e) {} return; }
      const id = ids[sel];
      if (ND && ND.id === id && st.own[id] && inR(tp, ND.x, ND.y, ND.w, ND.h)) { const rk = R370_FB_RANK(id);
        if (!(NDARM && NDARM.id === id && performance.now() - NDARM.t < 3500)) { NDARM = { id, t: performance.now() }; try { playSnd('ui_click'); } catch (e) {} return; }
        NDARM = null; if (rk.next && itemCount('m_neidan') > 0) { const h = S.hero; h.bag.m_neidan--; if (h.bag.m_neidan <= 0) delete h.bag.m_neidan; st.use = st.use || {}; st.use[id] = rk.r ? 10 : 4; NDFX = { id, t: performance.now(), name: rk.r ? '大成' : '小成' }; try { playSnd('jingle_levelup', .6); } catch (e) {} } return; }
      if (st.own[id] && inR(tp, BX + 695, BY + 451, 200, 60)) { st.on = st.on === id ? null : id; try { playSnd('ui_confirm'); } catch (e) {} return; }
      if (inR(tp, BX + 978, BY + 22, 66, 66) || !inR(tp, BX, BY, 1040, 620)) return true; });
  }
  const NEWDESC = it => (it.desc || '').replace(' ' + it.eff, '');
  window.R370_FABAO = openFabao;
  // 地图上的法宝钮（有法宝才出现）：行囊钮上方
  const HB = { x: 1166, y: 516, w: 88, h: 88 };
  const hudOn = () => world.map && S.scene === drawMap && S.hud && !world.locked && !dialog && !choice && !sysPanel && !S.menu && !(typeof battle !== 'undefined' && battle) && !UI.cur && Object.keys(FB.state().own).length > 0;
  try { cv.addEventListener('pointerdown', e => { if (UI.cur || !hudOn()) return; const p = toLogical(e); if (!inR(p, HB.x, HB.y, HB.w, HB.h)) return; e.stopImmediatePropagation(); e.preventDefault(); try { input.tapped = null; } catch (e2) {} openFabao(); }, true); } catch (e) {}

  setTimeout(() => { art('banner_area'); art('banner_area_danger'); }, 1500);
  // ---------- 进图横幅 ----------
  let BN = null;
  const lvText = (lo, hi) => '妖兽　' + CN(lo) + '至' + CN(hi) + '级';
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function (name, c, r, face) { const res = orig.apply(this, arguments);
    try { const M = TMAPS[name]; if (M && M.mobs) { const R = M.mobs.lvR || [Math.max(1, S.hero.lv - 1), S.hero.lv + 2], y = YW.find(q => q.map === name && !done(q));
      if (art('banner_area') && art('banner_area_danger')) { try { world.banner = null; } catch (e) {} }
      setTimeout(() => { if (world.mapName === name) { if (art('banner_area')) { try { world.banner = null; } catch (e) {} } BN = { name: (M.title || M.name || '野外').replace(/^.* · /, m => m), lv: lvText(R[0], R[1]) + (() => { try { const cs = M.chests || [], op = cs.filter(ch => S.flags && S.flags['chest_' + name + '_' + ch.c + '_' + ch.r]).length; const pk = window.R379_COUNT ? R379_COUNT(name) : [0, 0]; return (cs.length ? '　·　宝箱 ' + op + '/' + cs.length : '') + (pk[1] ? '　·　灵光 ' + pk[0] + '/' + pk[1] : ''); } catch (e) { return ''; } })() + (y ? '　·　妖王盘踞' : ''),   /* 这张图的宝箱开了几只（仙剑的迷宫：岔路走到头总有点东西） */ danger: R[0] > S.hero.lv + 1 || !!y && y.lv > S.hero.lv + 2, t0: performance.now() }; } }, 500); } } catch (e) {}
    return res; })(tileSetMap);
  if (typeof toast === 'function') toast = (orig => function (t) { if (typeof t === 'string' && /妖物等级 Lv/.test(t) && art('banner_area')) return; return orig.apply(this, arguments); })(toast);

  // ---------- 总图层 ----------
  S.overlay.push({ draw() { try {
    if (BN && !(typeof battle !== 'undefined' && battle)) { const dt = (performance.now() - BN.t0) / 1000, im = art(BN.danger ? 'banner_area_danger' : 'banner_area'); if (dt > 4 || !im) { if (dt > 4) BN = null; } else { const a = Math.min(1, dt / .35) * Math.min(1, (4 - dt) / .6); ctx.save(); ctx.globalAlpha = a; const ox = (1 - Math.min(1, dt / .35)) * -40;
        ctx.drawImage(im, 330 + ox, 62, 620, 120); tx(BN.name, 640 + ox, 62 + 44, `34px ${BRUSH}`, '#f6ecd0', 'center'); tx(BN.lv, 640 + ox, 62 + 82, `17px ${FONT}`, BN.danger ? '#ffb39a' : '#d8d2bc', 'center'); ctx.restore(); } }
    if (hudOn()) { const id = FB.state().on, im = art('fabao_btn_ready'); ctx.save(); if (im) ctx.drawImage(im, HB.x, HB.y, HB.w, HB.h); const ic = id && window.R370_ICON && R370_ICON(id); if (ic) ctx.drawImage(ic, HB.x + 19, HB.y + 19, 50, 50);
      ctx.font = `700 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline('法宝', HB.x + 44, HB.y + 90, '#ffe9a0', '#2a1000', 4); ctx.restore(); }
    if (UI.cur) UI.cur.draw();
  } catch (e) {} } });

  // ---------- 野外入口的等级牌、妖王界碑、据点前院的讨伐榜（实物） ----------
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  function signImg(key, artName, w, h, lines, rects, color) { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const g = c.getContext('2d'); g.drawImage(im, 0, 0, w * 2, h * 2); g.scale(2, 2);
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = color; lines.forEach((t, i) => { const r = rects[i]; let fs = Math.min(r[3], 15); g.font = `700 ${fs}px ${FONT}`; while (g.measureText(t).width > r[2] && fs > 8) { fs--; g.font = `700 ${fs}px ${FONT}`; } g.fillText(t, r[0] + r[2] / 2, r[1] + r[3] / 2 + 1); });
      try { IMG[key] = c; } catch (e) {} }; im.src = 'r372/' + artName + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} }
  const freeAt = (B, x, y) => { const c = Math.floor(x / B.cs), r = Math.floor(y / B.cs); return c >= 1 && r >= 1 && c < B.cols - 1 && r < B.rows - 1 && B.blocked[r * B.cols + c] === '0'; };
  function spotNear(B, x, y, taken) { for (const [dx, dy] of [[-120, -30], [120, -30], [-150, 40], [150, 40], [-100, -110], [100, -110], [-190, -10], [190, -10], [-90, 120], [90, 120], [0, -150]]) { const sx = x + dx, sy = y + dy;
      if (sx < 70 || sy < 150 || sx > B.w - 70 || sy > B.h - 20) continue; if (freeAt(B, sx, sy) && freeAt(B, sx - 28, sy) && freeAt(B, sx + 28, sy) && taken.every(t => Math.hypot(t[0] - sx, t[1] - sy) > 300)) return [sx, sy]; } return null; }
  for (const name of Object.keys(TMAPS)) { const M = TMAPS[name], B = M && M.baked; if (!M || !M.mobs || !B || typeof B.blocked !== 'string') continue;
    const R = M.mobs.lvR, lines = ['妖兽出没', R ? CN(R[0]) + '至' + CN(R[1]) + '级' : '量力而行'], taken = [], ents = [];
    if (M.start) ents.push([(M.start[0] + .5) * 64, (M.start[1] + .8) * 64]); for (const e of M.exits || []) ents.push([(e.x + (e.w || 0) / 2) * B.cs, (e.y + (e.h || 0) / 2) * B.cs]);
    const danger = R && R[0] >= 9, key = 'r372_sign_' + name; let n = 0;
    for (const [ex, ey] of ents) { const s = spotNear(B, ex, ey, taken); if (!s) continue; taken.push(s); if (!n++) signImg(key, danger ? 'sign_danger' : 'sign_normal', 96, 130, lines, danger ? [[19, 29, 59, 13], [19, 43, 59, 13]] : [[14, 26, 72, 15], [14, 42, 72, 15]], '#f3e2b4');
      B.objs.push({ id: key, uid: key + '_' + n, img: key, x: s[0] - 48, y: s[1] - 129, w: 96, h: 130, sy: s[1], flat: false, noPre: true, noBlock: true }); if (n >= 3) break; }
    const y = YW.find(q => q.map === name); if (y) { const k2 = 'r372_king_' + y.id, sx = y.pos[0] - 190, sy = y.pos[1] + 40; signImg(k2, 'sign_king', 130, 180, ['妖王领地', y.ep], [[31, 72, 65, 23], [31, 101, 65, 21]], '#e9dcc0');
      B.objs.push({ id: k2, uid: k2, img: k2, x: sx - 65, y: sy - 179, w: 130, h: 180, sy, flat: false, noPre: true, noBlock: true });
      // 碑可以点：没看过榜的，告诉他榜在哪；等级不够的，告诉他几级再来
      try { const [c, r] = [(sx) / 64 - .5, (sy + 26) / 64 - .8]; (M.npcs = M.npcs || []).push({ key: 'none', c, r, name: '妖王领地碑', hidden: true, h: 150, talk: async () => { const head = '（石碑上刻着「妖王领地 · ' + y.ep + '」。';
        if (done(y)) await say('', head + y.ep + '已经伏诛。）');
        else if (!F().r370_fb0) await say('', head + '玄天城天剑宗据点前院的讨伐榜上，有它的悬赏。）');
        else if (S.hero.lv < y.lv - 4) await say('', head + '妖王不在近处——修为到 ' + CN(y.lv - 4) + ' 级前后再来。）');
        else await say('', head + '它就在附近。）'); } }); } catch (e) {} } }
  // 据点前院：讨伐榜实物 + 可以点的「妖王讨伐榜」
  try { const M = TMAPS.xt_sect_court, B = M && M.baked; if (B && typeof B.blocked === 'string') { const fx = 1644, fy = 1419, w = 221, h = 260;
      const im = new Image(); im.onload = () => { try { IMG.r372_board = im; } catch (e) {} try { if (window.MM_CLEAR) MM_CLEAR('xt_sect_court'); } catch (e) {} }; im.src = 'r372/board_obj.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {}
      B.objs.push({ id: 'r372_board', uid: 'r372_board', img: 'r372_board', x: fx - w / 2, y: fy - h + 1, w, h, sy: fy, flat: false, noPre: true });
      const a = B.blocked.split(''), cs = B.cs; for (let r = Math.floor((fy - 26) / cs); r <= Math.floor(fy / cs); r++) for (let c = Math.floor((fx - 96) / cs); c <= Math.floor((fx + 96) / cs); c++) if (r >= 0 && c >= 0 && r < B.rows && c < B.cols) a[r * B.cols + c] = '1'; B.blocked = a.join('');
      const [c, r] = P(fx, fy + 44); (M.npcs = M.npcs || []).push({ key: 'none', c, r, name: '妖王讨伐榜', hidden: true, h: 170, talk: async () => { await openBoard(); } }); } } catch (e) { console.warn('R370 board', e); }

  // ---------- 第一次回玄天城：告诉玩家城里多了什么（只说一次；正在演剧情就下回再说） ----------
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function (name) { const res = orig.apply(this, arguments);
    try { if (name === 'xt_city' && !F().r370_news) for (const ms of [3500, 6500, 10000, 15000]) setTimeout(async () => { try { if (F().r370_news || world.mapName !== 'xt_city' || world.locked || dialog || choice || sysPanel || S.scene !== drawMap || (typeof battle !== 'undefined' && battle) || (window.MAP_READY && !MAP_READY())) return;
          F().r370_news = 1; world.locked = true; await showPanel('玄天城近况', ['天剑宗据点前院立起一块「妖王讨伐榜」——五只妖王，各有悬赏。', '城西南新开了成衣铺「锦云坊」和胭脂铺「点绛铺」；云来客栈东边是裁缝铺「裁月记」，收妖兽材料定做。', '!玄兵阁掌柜的柜上也添了新剑、新甲。']); world.locked = false; } catch (e) { world.locked = false; } }, ms); } catch (e) {}
    return res; })(tileSetMap);

  // ---------- 测试面板：今晚新加的东西各给一个直达按钮 ----------
  (function addBtn(n) { const pan = document.getElementById('dbgPanel'); if (!pan) { if ((n || 0) < 40) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
    const P2 = (x, y) => [x / 64 - .5, y / 64 - .8], h = document.createElement('h4'); h.textContent = '11-26 夜新加 · 妖王讨伐 / 法宝 / 衣饰三铺（R370–R373）'; const row = document.createElement('div'); row.className = 'row';
    const jump = (m, x, y, face) => { try { dialog = null; choice = null; sysPanel = null; } catch (e) {} const [c, r] = P2(x, y); tileSetMap(m, c, r, face || 'up'); S.scene = drawMap; S.started = true; S.hud = true; S.fade = 0; world.locked = false; };
    const mk = (t, fn) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => { pan.hidden = true; try { fn(); } catch (e) { console.warn('R370 test', e); } }; row.appendChild(b); };
    mk('去讨伐榜（据点前院）', () => jump('xt_sect_court', 1644, 1500));
    mk('去锦云坊', () => jump('xt_chengyi', 672, 620)); mk('去裁月记', () => jump('xt_caifeng', 576, 520)); mk('去点绛铺', () => jump('xt_yanzhi', 576, 560)); mk('去玄兵阁门口', () => jump('xt_city', 1424, 1540));
    for (const y of R370_YW) mk('到「' + y.ep + '」跟前', () => { if (y.hidden) for (const q of R370_YW) if (!q.hidden) F()['yw_' + q.id] = 1; delete F()['yw_' + y.id]; if (!F().r370_fb0) { F().r370_fb0 = 1; try { R370_FB.give('fb_huxin'); } catch (e) {} } let g = 0; const lv0 = S.hero.lv; while (S.hero.lv < y.lv - 2 && g++ < 400) gainExp(expNeed(S.hero.lv)); if (S.hero.lv > lv0) { S.hero.learnQ = []; S.hero.hp = S.hero.maxhp; S.hero.mp = S.hero.maxmp; toast('测试：主角先升到 ' + S.hero.lv + ' 级（妖王要看过讨伐榜、等级也够了才现身）', 2600); } jump(y.map, y.pos[0] + 20, y.pos[1] + 230); });
    mk('六件法宝全给', () => { for (const id of FB.list()) FB.give(id); toast('六件法宝都有了：点地图右下角「法宝」钮', 2400); });
    mk('给一批材料和 5000 灵石', () => { for (const [id, k] of [['m_fang', 6], ['m_hide', 8], ['m_horn', 4], ['m_tooth', 3], ['m_yingpi', 6], ['m_silk', 8], ['m_shike', 3], ['m_jinsi', 3], ['m_gupian', 2], ['m_neidan', 3]]) addItem(id, k); S.hero.gold += 5000; toast('材料和灵石到手：去裁月记找秦师傅定做', 2400); });
    mk('主角升到 12 级（试打用）', () => { let g = 0; while (S.hero.lv < 12 && g++ < 400) gainExp(expNeed(S.hero.lv)); S.hero.hp = S.hero.maxhp; S.hero.mp = S.hero.maxmp; toast('叶孤星 ' + S.hero.lv + ' 级', 1800); });
    const put = () => { if (!pan.contains(row)) pan.prepend(h, row); }; put(); new MutationObserver(put).observe(pan, { childList: true }); })();

  // ---------- 升级之后：告诉玩家这一级解锁了什么 ----------
  if (typeof levelUpShow === 'function') levelUpShow = (orig => async function (lv0) { const r = await orig.apply(this, arguments);
    try { const lv = S.hero.lv, tips = []; const wear = (window.R370_ITEMS || []).filter(id => { const it = ITEM_DB[id]; return it.slot && it.lvReq > lv0 && it.lvReq <= lv && it.price > 0; }).map(id => ITEM_DB[id].name);
      if (wear.length) tips.push('境界到了，玄天城的铺子里可以穿戴：' + wear.slice(0, 4).join('、'));
      const yw = YW.filter(y => !done(y) && y.lv - 4 > lv0 && y.lv - 4 <= lv); if (yw.length) tips.push('讨伐榜贴出了新悬赏：' + yw.map(y => y.ep + ' · ' + y.name).join('、'));
      if (tips.length) setTimeout(() => toast(tips.join('　｜　'), 4200), 600); } catch (e) {}
    return r; })(levelUpShow);
})();
