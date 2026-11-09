// ================= R187 · 存档 / 读档整页（Codex「花树系舟 · 白光存档条」，作者 11-10：「存档条做好了 你去接入」）=================
// 花树淡景做底，左上题字：存档页「记下此刻」/ 读档页「前尘再续」；三条白光存档条：
//   地点底图（青阳镇 / 玄天城 / 其余算松风林道）+ 队伍条（按当时队伍人数 1~5 人）+ 选中叠光 + 「存档一/二/三」题字 + 地名 + 日期时间。
// 点一条先选中，再点一次（或点右下「保存进度 / 读取存档」）执行；左下「返回」。读档页有自动存档时，底部中间多一行「最近进度」。
// 存读本身仍走 R145 的 saveGame(slot) / loadGame(slot)，这里只换界面。
(function () {
  const IM = {}, SRC = ['bg', 'title_save', 'title_load', 'slot_1', 'slot_2', 'slot_3', 'empty', 'sel', 'loc_pine', 'loc_qy', 'loc_xt', 'party_1', 'party_2', 'party_3', 'party_4', 'party_5'];
  for (const k of SRC) { const im = new Image(); im.onload = () => { IM[k] = im; }; im.src = 'r187/' + k + '.webp'; }
  const ready = () => ['bg', 'title_save', 'title_load', 'empty', 'slot_1'].every(k => IM[k]);
  const KEY = s => 'gx_save_' + s;
  const read = s => { try { const d = JSON.parse(localStorage.getItem(KEY(s)) || 'null'); return d && d.hero ? d : null; } catch (e) { return null; } };
  const two = n => String(n).padStart(2, '0');
  const when = d => { const t = new Date(d.t || 0); return two(t.getMonth() + 1) + '月' + two(t.getDate()) + '日　' + two(t.getHours()) + ':' + two(t.getMinutes()); };
  const locOf = d => /^qy_/.test(d.map || '') ? 'loc_qy' : /^xt_/.test(d.map || '') ? 'loc_xt' : 'loc_pine';
  const CN = ['一', '二', '三'];

  // 版式（按 Codex 预览 1731×909 的比例换到 1280×720）
  const RX = 38, RW = 1204, RH = Math.round(RW * 244 / 2400), RY0 = 174, GAP = 0;
  const rowR = i => ({ x: RX, y: RY0 + i * (RH + GAP), w: RW, h: RH });
  const BACK = { x: 96, y: 586, w: 140, h: 44 }, ACT = { x: W - 260, y: 586, w: 180, h: 44 }, MODE = { x: 300, y: 76, w: 150, h: 48 }, AUTO = { x: W / 2 - 230, y: 560, w: 460, h: 40 };

  let P = null;   // 打开着的页面状态
  const inR = (t, r) => t && t.x >= r.x && t.x <= r.x + r.w && t.y >= r.y && t.y <= r.y + r.h;
  const snd = k => { try { playSnd(k); } catch (e) {} };

  function draw() {
    const now = performance.now() / 1000;
    if (IM.bg) { const z = 1.02 + Math.sin(now * .12) * .01; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); drawImageFit(IM.bg, -W / 2, -H / 2, W, H); ctx.restore(); }
    else { ctx.fillStyle = '#3a3034'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = 'rgba(70,58,55,.10)'; ctx.fillRect(0, 0, W, H);
    // 题字 + 模式
    const ti = IM[P.mode === 'save' ? 'title_save' : 'title_load'];
    if (ti) { ctx.save(); ctx.shadowColor = 'rgba(80,58,50,.7)'; ctx.shadowBlur = 6; ctx.drawImage(ti, 115, 74, 156, 156 * ti.height / ti.width); ctx.restore(); }
    ctx.save(); ctx.strokeStyle = 'rgba(250,241,227,.7)'; ctx.beginPath(); ctx.moveTo(292, 86); ctx.lineTo(292, 114); ctx.stroke();
    ctx.font = `20px ${FONT}`; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(80,58,50,.8)'; ctx.shadowBlur = 5;
    if (P.toggle) { ctx.fillStyle = P.mode === 'save' ? '#fffdf6' : 'rgba(255,253,246,.5)'; ctx.fillText('存档', 306, 100); ctx.fillStyle = 'rgba(255,253,246,.5)'; ctx.fillText('·', 352, 100); ctx.fillStyle = P.mode === 'load' ? '#fffdf6' : 'rgba(255,253,246,.5)'; ctx.fillText('读档', 368, 100); }
    else { ctx.fillStyle = '#fffdf6'; ctx.fillText(P.mode === 'save' ? '存档' : '读档', 306, 100); }
    ctx.restore();
    // 三条存档条
    for (let i = 0; i < 3; i++) {
      const r = rowR(i), d = P.data[i], s = r.w / 2400;
      if (d) {
        const loc = IM[locOf(d)]; if (loc) ctx.drawImage(loc, r.x, r.y, r.w, r.h);
        const n = Math.max(1, Math.min(5, 1 + ((d.party || []).length))), pt = IM['party_' + n] || IM.party_1; if (pt) ctx.drawImage(pt, r.x, r.y, r.w, r.h);
      } else if (IM.empty) ctx.drawImage(IM.empty, r.x, r.y, r.w, r.h);
      if (i === P.sel && IM.sel) { ctx.save(); ctx.globalAlpha = .75 + .25 * Math.sin(now * 3); ctx.drawImage(IM.sel, r.x, r.y, r.w, r.h); ctx.restore(); }
      const st = IM['slot_' + (i + 1)], tx = r.x + 1296 * s;
      if (st) { const h = 28; ctx.drawImage(st, tx, r.y + r.h * .19, h * st.width / st.height, h); }
      ctx.save(); ctx.fillStyle = '#493a33'; ctx.textBaseline = 'alphabetic';
      ctx.font = `20px ${FONT}`; ctx.fillText(d ? (d.title || d.map || '') : (P.mode === 'save' ? '空 · 点这里记下此刻' : '空'), tx, r.y + r.h * 179 / 244);
      if (d) { ctx.font = `16px ${FONT}`; ctx.textAlign = 'right'; ctx.fillText(when(d), r.x + 2140 * s, r.y + r.h * .82); }
      ctx.restore();
    }
    // 底部：返回 / 动作 / 最近进度
    ctx.save(); ctx.font = `21px ${FONT}`; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fffdf6'; ctx.shadowColor = 'rgba(80,58,50,.9)'; ctx.shadowBlur = 6;
    ctx.fillText('‹　返回', BACK.x + 10, BACK.y + BACK.h / 2);
    const can = P.mode === 'save' ? true : !!P.data[P.sel];
    ctx.textAlign = 'right'; ctx.globalAlpha = can ? 1 : .45; ctx.fillText(P.mode === 'save' ? '保存进度' : '读取存档', ACT.x + ACT.w - 10, ACT.y + ACT.h / 2); ctx.globalAlpha = 1;
    if (P.mode === 'load' && P.auto) { ctx.textAlign = 'center'; ctx.font = `17px ${FONT}`; ctx.fillStyle = 'rgba(255,253,246,.9)'; ctx.fillText('最近进度（自动存档）· ' + (P.auto.title || '') + ' · ' + when(P.auto) + '　›', W / 2, AUTO.y + AUTO.h / 2); }
    ctx.restore();
  }

  async function act(i) {
    const s = String(i + 1), d = P.data[i];
    if (P.mode === 'save') {
      if (d) { P.busy = true; const c = await choose('覆盖「存档' + CN[i] + '」？', ['覆盖', '取消']); P.busy = false; if (c !== 0) return; }
      // R145 只在「地图上自由走动」时肯存：先把画面还给地图，再存
      S.scene = P.prev; const ok = window.saveGame && window.saveGame(s); S.scene = scene;
      if (ok) { snd('ui_confirm'); P.data[i] = read(s); setTimeout(() => close(true), 380); }
    } else {
      if (!d) { snd('ui_click'); return; }
      load(s);
    }
  }
  async function load(s) {
    snd('ui_confirm'); P.busy = true;
    const done = P.done; restore(false);
    try { await fadeOut(400); } catch (e) {}
    const ok = window.loadGame && window.loadGame(s);
    if (!ok && done) { /* 读不出来就留在原处 */ }
    done && done(!!ok);
  }
  function scene() {
    if (!P) return;
    draw();
    if (P.busy || (typeof choice !== 'undefined' && choice)) return;
    const t = input.tapped; if (!t) return;
    input.tapped = null;
    if (t.key) { act(P.sel); return; }
    if (inR(t, BACK)) { snd('ui_click'); close(false); return; }
    if (P.toggle && inR(t, MODE)) { snd('ui_click'); P.mode = P.mode === 'save' ? 'load' : 'save'; return; }
    if (P.mode === 'load' && P.auto && inR(t, AUTO)) { load('auto'); return; }
    if (inR(t, ACT)) { act(P.sel); return; }
    for (let i = 0; i < 3; i++) if (inR(t, rowR(i))) { if (P.sel === i) act(i); else { P.sel = i; snd('ui_click'); } return; }
  }
  function restore(resetScene) {
    if (!P) return;
    if (resetScene !== false) S.scene = P.prev;
    S.hud = P.hud; window.R187_OPEN = false; P = null;
  }
  function close(v) { const done = P && P.done; restore(); done && done(v); }

  function open(mode, toggle) {
    if (P) return Promise.resolve(false);
    return new Promise(res => {
      const data = [read(1), read(2), read(3)];
      let sel = mode === 'save' ? Math.max(0, data.findIndex(d => !d)) : Math.max(0, data.findIndex(d => d));
      P = { mode, toggle: !!toggle, data, sel, auto: read('auto'), prev: S.scene, hud: S.hud, done: res, busy: false };
      window.R187_OPEN = true; S.hud = false; S.scene = scene; snd('ui_open');
    });
  }
  // 地图更新（点地走路）在页面开着时停掉，免得点存档条时人跟着走
  if (typeof updateMap === 'function') updateMap = (o => function () { if (window.R187_OPEN) return; return o.apply(this, arguments); })(updateMap);

  // 接管：菜单里的「存档」按钮（R145 调 GX_SLOTMENU）、标题「前尘再续」（GX_PICKLOAD）
  window.GX_SLOTMENU = async function () {
    if (!ready()) return;   // 图还没到就别开（R145 自己会退回旧弹窗）
    if (S.menu) { try { closeMenu(); } catch (e) { S.menu = null; world.locked = false; } }
    return open('save', true);
  };
  const oldPick = window.GX_PICKLOAD;
  window.GX_PICKLOAD = async function () {
    if (!ready()) return oldPick ? oldPick() : false;
    if (![1, 2, 3, 'auto'].some(read)) return false;
    return open('load', false);
  };
  window.R187_SAVEPAGE = { open, ready };
})();
