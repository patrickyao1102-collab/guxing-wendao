// ================= R165 · 任务栏「玄金剑令」（作者 11-08 选 A，Codex R165 拆件 + layout.json）=================
// 半透明底（底板自带 49%~55% 透明度，后面的地图做轻微模糊），右上角。
//  · 收起（默认）：只显示主线——「主」+ 任务名 + 一行摘要，右边「展开」
//  · 展开「任务簿」：主线（名、目标两行、目的地）+ 支线列表（本地支线在前、其他地图在后），每条右边眼睛按钮显示 / 隐藏，
//    隐藏的变灰、写「已隐藏」，可再点回来；支线多了上下拖动滚动；底部「点一条自动寻路」
//  · 点主线 / 支线 = 自动寻路（沿用 R140 的 QUEST_NAV）
// 数据和寻路借 r140_quest.js（window.R140Q）；拆件没载完时仍用 R140 的老任务栏。
(function () {
  if (typeof drawMapHud !== 'function' || typeof updateMap !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const hid = () => (F().sq_hide = F().sq_hide || {});
  let L = null, ready = false; const IM = {};
  const load = () => fetch('r165/layout.json', { cache: 'no-cache' }).then(r => r.json()).then(j => { L = j;
    return Promise.all(Object.entries(j.assets).map(([k, a]) => new Promise((res, rej) => { const im = new Image(); im.onload = () => { IM[k] = im; res(); }; im.onerror = rej; im.src = 'r165/' + a.file; }))); })
    .then(() => { ready = !!window.R140Q; }).catch(e => console.warn('R165 载入失败', e));
  { const pr = load(); try { window.PRELOAD && PRELOAD('R165 任务栏', pr); } catch (e) {} }
  window.R165Q = { ready: () => ready && !!window.R140Q };

  // ---------- 数据 ----------
  const shortMap = id => { try { const t = (TMAPS[id] && TMAPS[id].title) || (MAPS[id] && MAPS[id].title) || ''; return t.replace(/^.*·\s*/, ''); } catch (e) { return ''; } };
  function mainModel() {
    const q = String(S.quest || ''); if (!q) return null;
    const i = q.search(/[：:]/); const title = i > 0 && i <= 10 ? q.slice(0, i) : q.slice(0, 8) + (q.length > 8 ? '…' : ''), obj = i > 0 && i <= 10 ? q.slice(i + 1) : q;
    let dest = '';
    try { const R = window.QUEST_ROUTE && QUEST_ROUTE.RULES; const r = R && R.find(([re]) => re.test(q)); const g = r && r[1](); if (g && g.map) dest = shortMap(g.map); } catch (e) {}
    return { title, summary: obj, objective: obj, destination: dest };
  }
  function sideModel() {
    const Q = window.R140Q, st = Q.stOf(), here = world.mapName, out = [];
    for (const q of Q.SQ) { const s = st[q.id]; if (!s || s.s === 3) continue;
      const taken = s.s === 1 || s.s === 2;
      if (!taken && !(s.s === 0 && Q.avail(q) && q.giver[0] === here)) continue;   // 可接的只列本地图的（别处的进了那张图再出现）
      const maps = (q.kill && q.kill.maps) || (q.drop && q.drop.maps) || [], r = taken && Q.isReady(s);
      const local = q.giver[0] === here || (taken && !r && (maps.includes(here) || (q.target && q.target[0] === here) || (Q.GO[q.id] && Q.GO[q.id].map === here)));
      let goal;
      if (!taken) goal = '找' + q.giver[1] + '接下这条支线';
      else if (r) goal = '完成了！回去找' + q.giver[1];
      else if (q.type === 'talk') goal = '去找' + q.target[1];
      else if (q.type === 'item') goal = (ITEM_DB[q.item] ? ITEM_DB[q.item].name : '') + '  ' + s.p + ' / ' + s.n;
      else goal = (q.goal ? q.goal + '  ' : '进度  ') + s.p + ' / ' + s.n;
      out.push({ id: q.id, title: q.name, goal, reward: Q.RT(q) || '—', taken, hidden: !!hid()[q.id], local }); }
    return out;
  }

  // ---------- 画的小工具 ----------
  const font = st => { const S0 = L.typography.styles[st]; return `${S0.bold ? 'bold ' : ''}${S0.size}px ${L.typography.fonts[S0.font].map(f => /\s/.test(f) ? '"' + f + '"' : f).join(',')}`; };
  const ell = (t, max) => { t = String(t || ''); if (ctx.measureText(t).width <= max) return t; const c = [...t]; while (c.length && ctx.measureText(c.join('') + '…').width > max) c.pop(); return c.join('') + '…'; };
  function wrap(t, max, lines) { const out = []; let curL = ''; for (const ch of String(t || '').replace(/\n/g, '')) { if (ctx.measureText(curL + ch).width > max && curL) { out.push(curL); curL = ch; } else curL += ch; } if (curL) out.push(curL);
    if (lines && out.length > lines) { out.length = lines; out[lines - 1] = ell(out[lines - 1] + '……', max); } return out.length ? out : ['']; }
  function text(s, x, y, st, align = 'left', max) {
    const TS = L.typography.textShadow, sz = L.typography.styles[st].size;
    ctx.font = font(st); ctx.textAlign = align; ctx.textBaseline = 'middle'; if (max) s = ell(s, max);
    ctx.save(); ctx.lineJoin = 'round'; ctx.shadowColor = TS.color; ctx.shadowBlur = TS.blur; ctx.shadowOffsetY = TS.offsetY;
    ctx.strokeStyle = TS.stroke; ctx.lineWidth = sz > TS.largeFromSizeExclusive ? TS.largeWidth : TS.width; ctx.strokeText(s, x, y); ctx.shadowColor = 'transparent';
    ctx.fillStyle = L.typography.styles[st].color; ctx.fillText(s, x, y); ctx.restore(); }
  function img(k, x, y, w, h) { const im = IM[k]; if (im) ctx.drawImage(im, x, y, w, h); }
  function nine(k, x, y, w, h) { const im = IM[k], a = L.assets[k]; if (!im) return; const [l, t, r, b] = a.insets1x || [0, 0, 0, 0], sx = im.width / a.size1x[0], sy = im.height / a.size1x[1];
    const SX = [0, l * sx, im.width - r * sx, im.width], SY = [0, t * sy, im.height - b * sy, im.height], DX = [x, x + l, x + w - r, x + w], DY = [y, y + t, y + h - b, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const sw = SX[i + 1] - SX[i], sh = SY[j + 1] - SY[j], dw = DX[i + 1] - DX[i], dh = DY[j + 1] - DY[j]; if (sw > 0 && sh > 0 && dw > 0 && dh > 0) ctx.drawImage(im, SX[i], SY[j], sw, sh, DX[i], DY[j], dw, dh); } }
  function blurBehind(x, y, w, h) {   // 底板后面的地图轻微模糊（不支持 canvas filter 的浏览器直接跳过）
    try { if (!('filter' in ctx)) return; const c = L.backgrounds.cornerCut, kx = cv.width / W, ky = cv.height / H;
      ctx.save(); ctx.beginPath(); ctx.moveTo(x + c, y); ctx.lineTo(x + w - c, y); ctx.lineTo(x + w, y + c); ctx.lineTo(x + w, y + h - c); ctx.lineTo(x + w - c, y + h); ctx.lineTo(x + c, y + h); ctx.lineTo(x, y + h - c); ctx.lineTo(x, y + c); ctx.closePath(); ctx.clip();
      ctx.filter = `blur(${L.backgrounds.blurSigma1x}px)`; ctx.drawImage(cv, (x - 6) * kx, (y - 6) * ky, (w + 12) * kx, (h + 12) * ky, x - 6, y - 6, w + 12, h + 12); ctx.restore(); } catch (e) {} }

  // ---------- 状态 ----------
  const UI = { open: false, scroll: 0, press: null, hits: [], panel: null, clipR: null, contentH: 0 };
  let drag = null;
  function rowH(r) { ctx.font = font('goal'); const gl = wrap(r.goal, 281).length; ctx.font = font('reward'); const rl = wrap(r.reward, 184).length; return { h: 68 + (gl - 1) * 19 + (rl - 1) * 18, gl, rl }; }

  function draw() {
    UI.hits = []; UI.panel = null;
    if (!R165Q.ready() || S.hud === false || S.menu || !world.map || S.scene !== drawMap) return;
    const M = mainModel(), sides = sideModel();
    if (!M && !sides.length) return;
    const st = UI.open ? L.states.expanded : L.states.collapsed, [px, py, pw, ph] = st.panelRect;
    UI.panel = [px, py, pw, ph];
    ctx.save(); blurBehind(px, py, pw, ph); ctx.translate(px, py);
    const pressed = a => UI.press && UI.press.a === a;
    for (const n of st.nodes) {
      if (n.when === 'hasProgress') continue;   // 主线暂无「第几步 / 共几步」数据
      if ((n.asset === 'destination_pin' || n.value === '目的地') && !(M && M.destination)) continue;
      if (n.type === 'image') { const a = L.assets[n.asset]; if (a && a.resizing === 'nineSlice') nine(n.asset, ...n.rect); else img(n.asset, ...n.rect); }
      else if (n.type === 'button') { img(pressed(n.action) ? n.pressed : n.normal, ...n.rect); UI.hits.push({ a: n.action, r: [px + n.hitRect[0], py + n.hitRect[1], n.hitRect[2], n.hitRect[3]] }); }
      else if (n.type === 'text') {
        let v = n.value; if (n.bind === 'mapName') v = (world.map && world.map.def && world.map.def.title) || ''; else if (n.bind && n.bind.startsWith('main.')) v = M ? M[n.bind.slice(5)] : (n.bind === 'main.title' ? '暂无主线' : '');
        if (n.bind === 'main.destination' && !v) continue;
        if (v == null || v === '') continue;
        if (n.wrap) { ctx.font = font(n.style); wrap(v, n.maxWidth, n.maxLines || 2).forEach((l, i) => text(l, n.at[0], n.at[1] + i * (n.lineHeight || 20), n.style, n.align)); }
        else text(v, n.at[0], n.at[1], n.style, n.align || 'left', n.maxWidth); }
      else if (n.type === 'list') drawList(sides, px, py);
    }
    // 目的地图标 / 文字只在有目的地时画（上面 nodes 里 pin 是 image，没有目的地时盖掉不太好看 → 简单处理：没有目的地时不画「目的地」三个字）
    if (M) UI.hits.push({ a: 'main', r: UI.open ? [px + st.mainHit[0], py + st.mainHit[1], st.mainHit[2], st.mainHit[3]] : [px + st.bodyHit[0], py + st.bodyHit[1], st.bodyHit[2], st.bodyHit[3]] });
    ctx.restore();
  }
  function drawList(sides, px, py) {
    const SL = L.sideList, [cx, cy, cw, ch] = SL.clip; UI.clipR = [px + cx, py + cy, cw, ch];
    const groups = [['local', '本地支线', sides.filter(s => s.local)], ['other', '其他地图', sides.filter(s => !s.local)]].filter(g => g[2].length);
    // 先量总高
    let H0 = 0; for (const [, , rs] of groups) { H0 += SL.group.height; for (const r of rs) H0 += rowH(r).h; H0 += SL.separatorGap; } H0 += SL.endPadding;
    UI.contentH = H0; const maxS = Math.max(0, H0 - ch); UI.scroll = Math.max(0, Math.min(maxS, UI.scroll));
    ctx.save(); ctx.beginPath(); ctx.rect(cx, cy, cw, ch); ctx.clip();
    if (!groups.length) text(SL.emptyListText, 195, cy + 30, 'hint', 'center');
    let y = SL.contentOrigin[1] - UI.scroll;
    for (const [, label, rs] of groups) {
      for (const n of SL.group.nodes) { if (n.type === 'image') img(n.asset, n.rect[0], y + n.rect[1], n.rect[2], n.rect[3]);
        else text(n.bind === 'groupLabel' ? label : rs.length + ' 条', n.at[0], y + n.at[1], n.style, n.align || 'left', n.maxWidth); }
      y += SL.group.height;
      rs.forEach((r, ri) => { const { h, gl } = rowH(r), last = ri === rs.length - 1, shG = (gl - 1) * 19;
        for (const n of SL.row.nodes) {
          if (n.when === 'hidden' && !r.hidden) continue; if (n.when === 'notLastInGroup' && last) continue;
          const sh = n.shiftWithGoal ? shG : n.shiftToRowEnd ? h - 68 : 0, stl = r.hidden && n.hiddenStyle ? n.hiddenStyle : (n.availableStyle && !r.taken ? n.availableStyle : n.style);
          if (n.type === 'image') { const k = r.hidden && n.hiddenAsset ? n.hiddenAsset : n.asset, a = L.assets[k], hh = n.growHeight ? n.rect[3] + h - 68 : n.rect[3];
            if (a && a.resizing === 'nineSlice') nine(k, n.rect[0], y + n.rect[1] + sh, n.rect[2], hh); else img(k, n.rect[0], y + n.rect[1] + sh, n.rect[2], hh); }
          else if (n.type === 'eyeButton') { const pr = UI.press && UI.press.a === 'eye' && UI.press.id === r.id; img(r.hidden ? (pr ? n.hiddenPressed : n.hidden) : (pr ? n.shownPressed : n.shown), n.rect[0], y + n.rect[1], n.rect[2], n.rect[3]); }
          else if (n.type === 'text') {
            const v = n.value != null ? n.value : n.bind === 'acceptLabel' ? (r.taken ? '已接' : '！可接') : r[n.bind];
            if (n.wrap) { ctx.font = font(stl); const ls = wrap(v, n.maxWidth); ls.forEach((l, i) => text(l, n.at[0], y + n.at[1] + sh + i * n.lineHeight, stl, n.align)); }
            else text(v, n.at[0], y + n.at[1] + sh, stl, n.align || 'left', n.maxWidth); } }
        const vis = (yy, hh) => yy + hh > cy && yy < cy + ch;
        const eh = SL.row.eyeHit, nh = SL.row.navigateHit;
        if (vis(y + eh[1], eh[3])) UI.hits.unshift({ a: 'eye', id: r.id, r: [px + eh[0], py + y + eh[1], eh[2], eh[3]], clip: true });
        if (vis(y, h)) UI.hits.push({ a: 'side', id: r.id, r: [px + nh[0], py + y, nh[2], h], clip: true });
        y += h; });
      y += SL.separatorGap;
    }
    ctx.restore();
    // 滚动条
    const S2 = SL.scroll; if (groups.length) { const [tx, ty, tw, th] = S2.rect; nine('scroll_track', tx, ty, tw, th);
      const thH = H0 <= ch ? th : Math.max(S2.minimumThumb, Math.min(th, th * ch / H0)), thY = ty + (maxS ? UI.scroll / maxS : 0) * (th - thH); nine('scroll_thumb', tx, thY, tw, thH); }
  }
  drawMapHud = (o => function () { const r = o.apply(this, arguments); try { draw(); } catch (e) { console.warn('R165 draw', e); } return r; })(drawMapHud);

  // ---------- 点 / 拖 ----------
  const inR = (x, y, r) => r && x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3];
  const hitAt = (x, y) => { for (const h of UI.hits) { if (h.clip && !inR(x, y, UI.clipR)) continue; if (inR(x, y, h.r)) return h; } return null; };
  const busy = () => !R165Q.ready() || S.hud === false || !world.map || S.menu || dialog || choice || world.locked || (typeof sysPanel !== 'undefined' && sysPanel);
  cv.addEventListener('pointerdown', e => { if (busy() || !UI.panel) return; let p; try { p = toLogical(e); } catch (er) { return; }
    if (!inR(p.x, p.y, UI.panel)) return; const h = hitAt(p.x, p.y); UI.press = h && (h.a === 'eye' || h.a === 'expand' || h.a === 'collapse') ? h : null;
    drag = UI.open && inR(p.x, p.y, UI.clipR) ? { y0: p.y, s0: UI.scroll, moved: false } : null; });
  cv.addEventListener('pointermove', e => { if (!drag) return; let p; try { p = toLogical(e); } catch (er) { return; } const dy = p.y - drag.y0;
    if (Math.abs(dy) > 8) { drag.moved = true; UI.press = null; } if (drag.moved) UI.scroll = drag.s0 - dy; });
  window.addEventListener('pointerup', () => { setTimeout(() => { UI.press = null; drag = null; }, 0); });
  cv.addEventListener('wheel', e => { if (!UI.open || !UI.clipR) return; let p; try { p = toLogical(e); } catch (er) { return; } if (inR(p.x, p.y, UI.clipR)) { UI.scroll += e.deltaY * .6; e.preventDefault(); } }, { passive: false });
  updateMap = (o => function (dt) {
    const t = input.tapped;
    if (t && !t.key && !busy() && UI.panel && inR(t.x, t.y, UI.panel)) {
      input.tapped = null;
      if (!(drag && drag.moved)) { const h = hitAt(t.x, t.y), Q = window.R140Q;
        if (h) { try { playSnd('ui_click'); } catch (e) {}
          if (h.a === 'expand') { UI.open = true; UI.scroll = 0; } else if (h.a === 'collapse') UI.open = false;
          else if (h.a === 'eye') { const m = hid(); m[h.id] = !m[h.id]; if (!m[h.id]) delete m[h.id]; }
          else if (h.a === 'main') Q.goMain(); else if (h.a === 'side') Q.goSide(h.id); } }
    }
    return o.apply(this, arguments);
  })(updateMap);
  // 隐藏的支线不在地图上标「!」（若地图标记读 SQ_MARK_HIDDEN）
  window.SQ_HIDDEN = id => !!hid()[id];
})();
