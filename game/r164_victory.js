// ================= R164 · 战斗胜利 · 月白金绢「卷中群像」（作者 11-08 定，Codex R164 卷中群像 · 金白版）=================
// 卷轴底图（左半是出战阵容的群像，右半空白绢面）r164/scroll_01~04.webp —— 由 Codex 效果图抹掉文字、抠掉背景得来（tools/qa/r164_scroll_build.py）
//   01 叶孤星·林雪·云霆　02 叶孤星·神乐·洛尘　03 叶孤星·云霆　04 叶孤星·林雪；别的阵容挑重合最多的那张
// 右半的标题、角色行、经验条、掉落格、灵石、确定按钮都由代码按效果图位置画。没载完时退回 R155 金色海棠框。
(function () {
  if (typeof S === 'undefined' || typeof showPanel !== 'function') return;
  const SETS = { '01': ['linxue', 'yunting'], '02': ['shenle', 'luochen'], '03': ['yunting'], '04': ['linxue'], '05': ['shenle'], '06': ['luochen'], '07': [], '08': [] };   // 作者 11-10：「有叶孤星一个人的战斗立绘，codex 有的」→ 单人出战用 Codex 金白版 07 回身斩 / 08 收剑睥睨（轮流）   // 作者 11-08：换 Codex 清晰立绘版（金白），加神乐、洛尘两套双人
  const IM = {}, PORT = {}; let ready = false;
  const img = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  const load = () => Promise.all([
    ...Object.keys(SETS).map(k => img('r164/scroll_' + k + '.webp').then(im => { IM[k] = im; })),
    ...['hero', 'linxue', 'yunting', 'luochen', 'shenle'].map(k => img('r155/portrait_' + k + '.webp').then(im => { PORT[k] = im; })),   // 作者 11-08：头像统一用五人 Q 版（R134 原件）
    img('r155/spirit_stone.webp').then(im => { IM.stone = im; })]).then(() => { ready = true; }).catch(e => console.warn('R164 载入失败', e));
  { const pr = load(); try { window.PRELOAD && PRELOAD('R164 战斗结算', pr); } catch (e) {} }
  // 作者 11-11：「战斗胜利画面没接后来的高清版人物图」—— 卷上的群像改用 Codex 清晰立绘版「无字群像」原图（2 倍分辨率）盖在底图同一位置
  //   位置 / 大小是拿原图跟底图逐像素比对出来的（[x, y, w, h]，1280×720 坐标）；04 叶孤星·林雪是作者选的「冰盾护阵」
  const HDP = {"01": [92, 168, 563, 458], "02": [92, 156, 563, 458], "03": [91, 158, 564, 458], "04": [92, 150, 563, 469], "05": [92, 161, 563, 458], "06": [92, 158, 563, 458], "07": [94, 236, 559, 379], "08": [191, 129, 365, 487]}, HD = {};
  for (const k in HDP) img('r164/hd_' + k + '.webp').then(im => { HD[k] = im; }).catch(() => {});
  const CROP = { hero: [84, 36, 304, 256], linxue: [66, 33, 286, 253], yunting: [5, 47, 231, 273], luochen: [69, 32, 289, 252], shenle: [94, 28, 314, 248] };
  const NAME = { hero: '叶孤星', yunting: '云霆', linxue: '林雪', shenle: '神乐', luochen: '洛尘' };
  const INK = '#3b2a1e', MUTED = '#7a6650', GOLD = '#8a5a22', LINE = 'rgba(160,128,78,.45)';
  const HF = 'GuxingDF, "Kaiti SC", serif', BF = 'GuxingKai, "Kaiti SC", serif', NF = '"Times New Roman", serif';

  let cur = null;
  window.R164_OPEN = () => !!cur;
  function T(s, x, y, size, color, align = 'left', font = BF, bold) {
    ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(s, x, y); }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function line(x0, y, x1) { ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y + .5); ctx.lineTo(x1, y + .5); ctx.stroke(); }
  function portrait(k, cx, cy, r) {
    const im = PORT[k] || PORT.hero, c = CROP[k] || CROP.hero;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip(); ctx.fillStyle = '#e9e2d2'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    if (im) ctx.drawImage(im, c[0], c[1], c[2] - c[0], c[3] - c[1], cx - r, cy - r, r * 2, r * 2); ctx.restore();
    ctx.strokeStyle = '#b8995e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r + 1, 0, 7); ctx.stroke(); }

  function draw() {
    const c = cur; if (!c) return; const d = c.d, now = performance.now(), e = 1 - Math.pow(1 - Math.min(1, (now - c.t0) / 320), 3);
    ctx.save(); ctx.globalAlpha = .66 * e; ctx.fillStyle = '#04060b'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = e;
    // 卷轴从中间往两边展开一点的感觉：横向从 .9 放到 1
    ctx.translate(640, 360); ctx.scale(.9 + .1 * e, .97 + .03 * e); ctx.translate(-640, -360);
    try {
      ctx.drawImage(IM[c.k], 0, 0, 1280, 720);
      if (HD[c.k]) { const q = HDP[c.k]; ctx.save(); ctx.beginPath(); ctx.rect(92, 103, 1096, 524); ctx.clip(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(HD[c.k], q[0], q[1], q[2], q[3]); ctx.restore(); }
      // 标题 + 小朱印
      const tt = '战斗胜利'; for (let i = 0; i < 4; i++) T(tt[i], 915 + (i - 1.5) * 58, 156, 50, '#7a4a1e', 'center', HF);
      ctx.fillStyle = '#b8402e'; rr(1058, 132, 22, 42, 3); ctx.fill(); ctx.strokeStyle = 'rgba(255,230,210,.7)'; ctx.lineWidth = 1; rr(1060.5, 134.5, 17, 37, 2); ctx.stroke();
      T('问', 1069, 145, 12, '#fbe9dc', 'center', HF); T('道', 1069, 162, 12, '#fbe9dc', 'center', HF);
      // 表头
      T('出战角色', 692, 211, 20, INK, 'left', HF); T('本场经验', 918, 211, 20, INK, 'center', HF); T('升级进度', 1083, 211, 20, INK, 'center', HF);
      line(688, 232, 1158);
      const N = d.members.length, pitch = Math.min(70, 162 / N), pr = Math.min(20, pitch * .36);
      d.members.forEach((m, i) => { const cy = 236 + pitch * (i + .5);
        portrait(m.role, 711, cy, pr);
        T(m.name, 745, cy, pitch < 48 ? 20 : 24, INK, 'left', HF);
        if (m.up) { ctx.font = `24px ${HF}`; const nx = 745 + ctx.measureText(m.name).width + 10; ctx.fillStyle = '#8a6526'; rr(nx, cy - 11, 54, 22, 4); ctx.fill(); T('升级！', nx + 27, cy + 1, 13, '#fff3d6', 'center', HF); }
        T('+' + m.gain, 918, cy, 24, INK, 'center', NF);
        T(m.cur + ' / ' + m.need, 1083, cy - 6, 18, INK, 'center', NF);
        const fr = m.need > 0 ? Math.max(0, Math.min(1, m.cur / m.need)) : 1;
        ctx.fillStyle = '#ddd2bd'; ctx.fillRect(1010, cy + 13, 147, 4);
        if (fr > 0) { const g = ctx.createLinearGradient(1010, 0, 1157, 0); g.addColorStop(0, '#a77d34'); g.addColorStop(1, '#d9b46a'); ctx.fillStyle = g; ctx.fillRect(1010, cy + 13, 147 * fr, 4); }
        if (i < N - 1) line(688, cy + pitch / 2, 1158); });
      // 掉落 + 灵石
      T('掉落物品', 692, 423, 20, INK, 'left', HF); line(770, 423, 985);
      if (IM.stone) ctx.drawImage(IM.stone, 996, 411, 24, 24);
      T('灵石', 1026, 423, 18, MUTED, 'left', HF); T('+' + d.gold, 1157, 423, 24, INK, 'right', NF);
      const K = d.drops.length;
      if (!K) T('本场无掉落', 920, 478, 20, MUTED, 'center', HF);
      const pitchI = K ? Math.min(118, 460 / K) : 0;
      d.drops.forEach((it, i) => { const cx = 920 + (i - (K - 1) / 2) * pitchI, sy = 449;
        ctx.fillStyle = 'rgba(255,252,242,.75)'; rr(cx - 26, sy, 52, 52, 6); ctx.fill(); ctx.strokeStyle = '#c8b183'; ctx.lineWidth = 1.5; rr(cx - 26, sy, 52, 52, 6); ctx.stroke();
        if (it.id && typeof itemIcon === 'function') { ctx.save(); try { itemIcon(it.id, cx, sy + 26, 22); } catch (er) {} ctx.restore(); }
        if (it.n > 1 || true) { ctx.font = `bold 12px ${NF}`; const s = '×' + it.n, w = ctx.measureText(s).width + 8; ctx.fillStyle = 'rgba(70,52,30,.85)'; rr(cx + 26 - w, sy + 52 - 16, w, 16, 3); ctx.fill(); T(s, cx + 26 - w / 2, sy + 52 - 8, 12, '#fff3d6', 'center', NF, true); }
        let nm = it.name; ctx.font = `17px ${HF}`; while (ctx.measureText(nm).width > pitchI - 6 && nm.length > 2) nm = nm.slice(0, -1); if (nm !== it.name) nm = nm.slice(0, -1) + '…';
        T(nm, cx, 518, 17, INK, 'center', HF); });
      // 确定
      const bx = 840, by = 549, bw = 165, bh = 46, pr2 = c.pressed ? 1 : 0;
      const g = ctx.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, c.pressed ? '#ead39b' : '#fbf0cc'); g.addColorStop(1, c.pressed ? '#c9a45e' : '#dfc07a');
      ctx.fillStyle = g; rr(bx, by + pr2, bw, bh, 9); ctx.fill(); ctx.strokeStyle = '#a5803c'; ctx.lineWidth = 2; rr(bx, by + pr2, bw, bh, 9); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,250,230,.8)'; ctx.lineWidth = 1; rr(bx + 4, by + 4 + pr2, bw - 8, bh - 8, 6); ctx.stroke();
      T('确定', bx + bw / 2, by + bh / 2 + 1 + pr2, 24, '#4a3218', 'center', HF);
    } catch (err) { console.warn('R164 draw', err); ctx.restore(); close(); return; }
    ctx.restore();
  }
  function close() { const c = cur; cur = null; if (c) c.res(true); }
  if (typeof frameInner === 'function') frameInner = (o => function () { const r = o.apply(this, arguments); if (cur) { ctx.save(); ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.globalAlpha = 1; draw(); ctx.restore(); } return r; })(frameInner);
  const inBtn = (x, y) => cur && x >= 830 && x <= 1015 && y >= 540 && y <= 605;
  function tap(t) { if (!cur || performance.now() - cur.t0 < 500) return; if (t.key || inBtn(t.x, t.y)) { try { playSnd('ui_click'); } catch (e) {} close(); } }
  consumeTap = (o => function () { if (cur) { o(); return null; } return o(); })(consumeTap);
  if (typeof menuUpdate === 'function') menuUpdate = (o => function () { if (cur) { input.tapped = null; return; } return o.apply(this, arguments); })(menuUpdate);
  cv.addEventListener('pointerup', e => { if (!cur) return; try { tap(toLogical(e)); } catch (err) {} });
  window.addEventListener('keydown', e => { if (cur && (e.key === ' ' || e.key === 'Enter')) tap({ key: true }); });
  (function tick() { if (cur) { cur.pressed = !!input.down && inBtn(input.x, input.y); input.tapped = null; } requestAnimationFrame(tick); })();

  startBattle = (orig => function () { const r = orig.apply(this, arguments); try { if (battle) battle._lv64 = S.hero.lv; } catch (e) {} return r; })(startBattle);
  const idOf = name => { try { for (const [id, it] of Object.entries(ITEM_DB)) if (it && it.name === name) return id; } catch (e) {} return null; };
  let soloN = 0;
  function pick(allies) { if (!allies.length) return '08';   // 作者 11-12：单人出战只用 08「收剑睥睨」，07 回身斩不再出现
    let best = '03', sc = -Infinity;
    for (const [k, set] of Object.entries(SETS)) { if (k === '07') continue; const hit = set.filter(a => allies.includes(a)).length, miss = set.length - hit, extra = allies.length - hit, s = hit * 10 - miss * 3 - extra; if (s > sc) { sc = s; best = k; } }
    return best; }
  showPanel = (orig => function (title, lines) {
    try {
      if (String(title) === '战斗胜利' && ready && typeof battle !== 'undefined' && battle) {
        const Ls = (lines || []).filter(Boolean).map(String), num = re => { const l = Ls.find(x => re.test(x)); const m = l && l.match(/\+\s*(\d+)/); return m ? +m[1] : 0; };
        const exp = num(/经验/), gold = num(/灵石/), up = S.hero.lv > (battle._lv64 || S.hero.lv), need = typeof expNeed === 'function' ? expNeed(S.hero.lv) : 0;
        const members = (battle.heroes || [battle.P]).filter(Boolean).slice(0, 4).map(u => { const k = u === battle.main || !u.ally ? 'hero' : u.ally;
          return { role: NAME[k] ? k : 'hero', name: k === 'hero' ? '叶孤星' : (NAME[k] || u.name), gain: exp, cur: Math.round(S.hero.exp || 0), need, up }; });
        const cnt = new Map();
        for (const l of Ls) { const m = l.match(/^!?(?:掉落|获得)[：:](.*)$/); if (!m) continue;
          for (const raw of m[1].split(/[、，,]/)) { const nm = raw.trim(); if (!nm) continue; const q = +((nm.match(/[×x]\s*(\d+)$/) || [])[1] || 1), base = nm.replace(/[×x]\s*\d+$/, '').trim(); cnt.set(base, (cnt.get(base) || 0) + q); } }
        const drops = [...cnt].slice(0, 6).map(([name, n]) => ({ name, n, id: idOf(name) }));
        if (members.length) return new Promise(res => { cur = { k: pick(members.map(m => m.role).filter(r => r !== 'hero')), d: { members, drops, gold }, t0: performance.now(), pressed: false, res }; });
      }
    } catch (e) { console.warn('R164 victory', e); }
    return orig.apply(this, arguments);
  })(showPanel);
})();
