// ================= R153 · 领悟技能 / 技能升级 / 境界提升 都用 Codex「金色海棠云窗」（作者 11-07：现在还是代码框）=================
// 框体拆件和等级提升窗口共用 lvp/（frame_top + 每行中段平铺 + frame_bottom、八剑扇阵、空题签、按钮），
// 顶上原来坐 Q 版人物的位置换成圆形技能图标（金边圆框里画游戏现有的技能图标）。
// 接入点：
//   · 打怪升级 / 支线升级：levelup_panel.js 已接
//   · 剧情升境界（showPanel「突破…」「境界突破」）→ 境界提升窗（属性 旧→新）
//   · 领悟剑诀（showLearns）、剧情里的「领悟…」面板、技能栏「参悟」领悟新招 → 领悟技能窗
//   · 技能栏「参悟」升重数 → 技能升级窗（第 N 重 → 第 N+1 重，威力 旧→新）
(function () {
  const K = ['frame_top', 'frame_body_tile', 'frame_bottom', 'row_divider', 'sword_fan', 'title_blank', 'button_normal', 'button_pressed'], A = {};
  K.forEach(k => { const im = new Image(); im.onload = () => { A[k] = im; }; im.src = (/^(frame_top|frame_body_tile|frame_bottom|row_divider)$/.test(k) ? 'lvpd/' : 'lvp/') + k + '.webp'; });   // 作者 11-08：系统弹窗定黑金（框体纸面改墨黑，Codex R160 黑金拆件交付后换正式版）
  const ready = () => K.every(k => A[k]);
  const SZ = { frame_top: [644, 160], frame_body_tile: [644, 37], frame_bottom: [644, 143], row_divider: [468, 4], sword_fan: [560, 190], title_blank: [420, 80], button_normal: [248, 62], button_pressed: [248, 62] };
  const NUM = '"Times New Roman","Noto Serif SC",serif';
  const CNN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const BROWN = '#efe4cc', GREEN = '#8fdda0', MUTED = '#bda680', BTN = '#422b17';   // 黑金：墨黑底上用浅色字；按钮仍是金色，字保持深色
  let P = null; window.SKWIN_OPEN = () => !!P;

  const txt = (c, v, x, y, font, color, align = 'center') => { c.font = font; c.fillStyle = color; c.textAlign = align; c.textBaseline = 'alphabetic'; const m = c.measureText(String(v)); c.fillText(String(v), x, y + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2); };
  const arrow = (c, x, y, w, h, col, lw) => { c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2 - 2, y); c.stroke(); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2 - h * .7, y - h / 2); c.lineTo(x + w / 2 - h * .7, y + h / 2); c.closePath(); c.fill(); };
  // 按宽度把中文描述折成几行
  function wrap(c, s, font, maxW) { c.font = font; const out = []; let line = ''; for (const ch of String(s)) { if (c.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; }
  // 圆形技能图标：深蓝底 + 金色双圈 + 游戏里的技能图标
  function skillBadge(c, k, x, y, r, now) {
    c.save();
    const g = c.createRadialGradient(x, y - r * .3, r * .1, x, y, r); g.addColorStop(0, '#2c4a8a'); g.addColorStop(1, '#0b1634');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    let drew = false;
    if (k && window.SKILL_ICON) { try { window.SKILL_ICON(k, x, y, r * .78, { glow: false }); drew = true; } catch (e) {} }
    if (!drew) {   // 没有对应图标：画一柄星剑
      c.save(); c.translate(x, y); c.rotate(-.75); c.shadowColor = '#bfe0ff'; c.shadowBlur = 14; c.fillStyle = '#eaf4ff';
      c.beginPath(); c.moveTo(0, -r * .72); c.lineTo(r * .07, -r * .2); c.lineTo(r * .07, r * .32); c.lineTo(-r * .07, r * .32); c.lineTo(-r * .07, -r * .2); c.closePath(); c.fill();
      c.fillStyle = '#d8b065'; c.fillRect(-r * .22, r * .32, r * .44, r * .07); c.fillRect(-r * .04, r * .39, r * .08, r * .22); c.restore();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x - r * .36, y - r * .42, r * .06, 0, 7); c.fill();
    }
    const tw = .5 + .5 * Math.sin(now / 500);
    c.lineWidth = 7; c.strokeStyle = '#c9963e'; c.beginPath(); c.arc(x, y, r + 2, 0, 7); c.stroke();
    c.lineWidth = 2; c.strokeStyle = '#ffe9b0'; c.beginPath(); c.arc(x, y, r - 2, 0, 7); c.stroke();
    c.lineWidth = 1.5; c.strokeStyle = `rgba(255,236,170,${.35 + .35 * tw})`; c.beginPath(); c.arc(x, y, r + 8, 0, 7); c.stroke();
    c.restore();
  }

  function draw(c) {
    const now = performance.now(), t = (now - P.t0) / 1000, e = 1 - Math.pow(1 - Math.min(1, t / .28), 3);
    const n = 5, bottomY = 364 + 37 * n, btnY = 588;
    const img = (key, x, y) => { const [w, h] = SZ[key]; c.drawImage(A[key], x, y, w, h); };
    c.save();
    c.globalAlpha = .55 * e; c.fillStyle = '#05070d'; c.fillRect(0, 0, W, H); c.globalAlpha = e;
    const fit = Math.min(1, (H - 12) / (bottomY + 143));
    c.translate(640, 6); c.scale(fit * (.95 + .05 * e), fit * (.95 + .05 * e)); c.translate(-640, -6 + (1 - e) * 20);
    const ang = Math.sin(now / 1400) * 3 * Math.PI / 180, glow = .35 + .25 * Math.sin(now / 520);
    c.save(); c.translate(640, 255); c.rotate(ang); c.translate(-640, -255); img('sword_fan', 360, 65);
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = e * glow; c.filter = 'blur(4px)'; img('sword_fan', 360, 65); c.restore();
    c.globalAlpha = e;
    img('frame_top', 318, 204); for (let i = 0; i < n; i++) img('frame_body_tile', 318, 364 + 37 * i); img('frame_bottom', 318, bottomY);
    img(P.pressed ? 'button_pressed' : 'button_normal', 516, btnY);
    skillBadge(c, P.k, 640, 190, 64, now);
    img('title_blank', 430, 6);
    txt(c, P.title.slice(0, 2), 580, 44, `46px ${BRUSH}`, '#f5dba9'); txt(c, P.title.slice(2), 699, 44, `46px ${BRUSH}`, '#f5dba9');
    txt(c, P.name, 640, P.kind === 'up' ? 301 : 306, `600 34px ${FONT}`, BROWN);
    if (P.kind === 'learn') {
      const D = wrap(c, P.desc || '', `25px ${FONT}`, 430).slice(0, 3), y0 = D.length >= 3 ? 356 : 375;
      D.forEach((l, i) => txt(c, l, 640, y0 + i * 37, `25px ${FONT}`, BROWN));
      c.fillStyle = 'rgba(214,176,104,.55)'; c.fillRect(410, 451, 460, 1.5);
      if (P.meta) txt(c, P.meta, 640, 488, `23px ${FONT}`, MUTED);
      if (P.note) txt(c, P.note, 640, 528, `20px ${FONT}`, '#b9a27e');
    } else {
      // 第 N 重 → 第 N+1 重
      const a = '第' + CNN[P.t0r] + '重', b = '第' + CNN[P.t1r] + '重';
      c.font = `600 30px ${FONT}`; const wa = c.measureText(a).width, wb = c.measureText(b).width, gap = 56, tot = wa + gap + wb, x0 = 640 - tot / 2;
      txt(c, a, x0, 349, `600 30px ${FONT}`, BROWN, 'left'); arrow(c, x0 + wa + gap / 2, 349, 30, 12, BROWN, 2); txt(c, b, x0 + wa + gap, 349, `600 30px ${FONT}`, GREEN, 'left');
      const R = (P.rows || []).slice(0, 3);
      R.forEach(([lab, o, nv], i) => { const y = 414 + 48 * i;
        txt(c, lab, 404, y, `26px ${FONT}`, BROWN, 'left'); txt(c, o, 652, y, `bold 26px ${NUM}`, BROWN, 'right');
        arrow(c, 716, y, 24, 10, BROWN, 1.4); txt(c, nv, 870, y, `bold 26px ${NUM}`, GREEN, 'right');
        c.fillStyle = 'rgba(214,176,104,.45)'; c.fillRect(396, y + 23, 488, 1.2); });
      if (!R.length && P.desc) wrap(c, P.desc, `24px ${FONT}`, 440).slice(0, 3).forEach((l, i) => txt(c, l, 640, 414 + i * 36, `24px ${FONT}`, GREEN));
    }
    txt(c, P.btn, 640, btnY + 31 + (P.pressed ? 1 : 0), `600 36px ${FONT}`, BTN);
    c.restore();
  }
  const safeDraw = () => { if (P) try { draw(ctx); } catch (e) { console.warn('skillwin', e); const r = P.res; P = null; r(); } };
  let menuDrawn = 0;   // 行囊是在叠层之后才画的：开着行囊时改为画完行囊再画这个窗口，不然被行囊盖住
  S.overlay.push({ draw() { if (!(S.menu && performance.now() - menuDrawn < 200)) safeDraw(); } });
  if (typeof drawMenu === 'function') drawMenu = (o => function () { const r = o.apply(this, arguments); menuDrawn = performance.now(); safeDraw(); return r; })(drawMenu);
  consumeTap = (o => function () { if (P) { const t = o(); P.pressed = !!input.down; if (t && performance.now() - P.t0 > 500) { const r = P.res; P = null; r(); } return null; } return o(); })(consumeTap);
  (function tick() { if (P) { P.pressed = !!input.down; if (input.tapped) consumeTap(); } requestAnimationFrame(tick); })();

  const waitReady = async () => { if (ready()) return true; try { if (window.IMG_GUARD) IMG_GUARD.bumpMatch(['lvp/', 'lvpd/']); } catch (e) {} for (let i = 0; i < 30 && !ready(); i++) await new Promise(r => setTimeout(r, 100)); return ready(); };
  const open = o => waitReady().then(ok => !ok ? false : new Promise(res => {
    const done = () => res(true);
    const go = () => { P = Object.assign({ t0: performance.now(), res: done, pressed: false }, o); };
    if (P) { const prev = P.res; P.res = () => { prev(); setTimeout(go, 60); }; } else go();
  }));
  // 按名字找技能键（图标用）
  // 作者 11-08：领悟窗图标空了（「破军剑意·破军剑阵」找不到、「破军剑阵」被错认成星罗）→ 先精确、再按「·」后半段、再技能树、最后才模糊（取最长的名字）
  const ALIAS = { '破军剑阵': 'pojun', '天璇': 'pojun' };
  const keyOf = name => { const s = String(name || '').replace(/^!/, '').trim(), tail = s.split(/[·・]/).pop().trim(); let E = [];
    try { E = Object.entries(SKILL_DB).filter(([k, d]) => d && d.name); } catch (e) {}
    const tl = n => n.split(/[·・]/).pop().trim();
    for (const [k, d] of E) if (d.name === s) return k;
    if (ALIAS[s]) return ALIAS[s]; if (ALIAS[tail]) return ALIAS[tail];
    for (const [k, d] of E) if (tl(d.name) === tail || d.name === tail) return k;
    try { const k = window.SKT && SKT.iconByName(s); if (k) return k; } catch (e) {}
    let best = null, bl = 0; for (const [k, d] of E) if ((s.includes(d.name) || d.name.includes(s)) && d.name.length > bl) { best = k; bl = d.name.length; }
    return best; };
  window.SKWIN = {
    learn: ({ k, name, desc, meta, note }) => { try { playSnd('sfx_sword_ring'); } catch (e) {} S.flash = .4; S.flashColor = '#cfe6ff'; return open({ kind: 'learn', title: '领悟技能', k: k || keyOf(name), name, desc, meta, note, btn: '知道了' }); },
    upgrade: ({ k, name, t0, t1, rows, desc }) => { try { playSnd('jingle_levelup'); } catch (e) {} S.flash = .4; S.flashColor = '#fff3c0'; return open({ kind: 'up', title: '技能升级', k: k || keyOf(name), name, t0r: t0, t1r: t1, rows, desc, btn: '确定' }); },
    keyOf,
  };

  // ---- 领悟剑诀（升级后的 learnQ）----
  showLearns = async function () {
    const h = S.hero;
    while (h.learnQ && h.learnQ.length) {
      const k = h.learnQ.shift(), s = SKILL_DB[k]; if (!s) continue;
      if (!(await SKWIN.learn({ k, name: s.name, desc: s.desc, meta: (s.star ? s.star + '星 · ' : '') + '消耗灵力：' + s.cost }))) { playSnd('sfx_sword_ring'); await showPanel('领悟剑诀 · ' + s.star + '星', ['!' + s.name, s.desc, '灵力消耗 ' + s.cost]); }
    }
  };

  // ---- 剧情里的面板：领悟 / 突破 换成新窗 ----
  const STATS = [['maxhp', '气血'], ['maxmp', '灵力'], ['atk', '攻击'], ['def', '防御'], ['spd', '身法']];
  const snap = () => { const h = S.hero || {}; const o = {}; STATS.forEach(([k]) => o[k] = Math.round(h[k] || 0)); return o; };
  let pend = null;   // 剧情抬境界时记下抬之前的属性
  if (typeof onLevelUp === 'function') onLevelUp = (orig => function (old, now) { try { if (!pend || performance.now() - pend.t > 60000) pend = { lv0: old, s: snap(), t: performance.now() }; } catch (e) {} return orig.apply(this, arguments); })(onLevelUp);
  if (typeof levelUpShow === 'function') levelUpShow = (orig => function () { pend = null; return orig.apply(this, arguments); })(levelUpShow);
  showPanel = (orig => function (title, lines) {
    try {
      const T = String(title || ''), L = (Array.isArray(lines) ? lines : []).filter(Boolean).map(String);
      if (/领悟/.test(T)) {
        const main = (L.find(l => l[0] === '!') || L[0] || '').replace(/^!/, ''), rest = L.filter(l => l.replace(/^!/, '') !== main);
        const who = (T.match(/^(云霆|林雪|神乐|洛尘)/) || [])[1];
        const meta = rest.find(l => /灵力|怒气|消耗|（/.test(l));
        const desc = rest.filter(l => l !== meta).join('，');
        const self2 = this, a2 = arguments; return SKWIN.learn({ name: main, desc: desc || '', meta: meta ? meta.replace(/^（|）$/g, '') : '', note: who ? who + ' 领悟' : '' }).then(ok => ok ? true : orig.apply(self2, a2));
      }
      if (ready() && window.levelPanel && /突破|境界/.test(T) && !/^(云霆|林雪|神乐|洛尘)/.test(T) && pend && S.hero) {
        const h = S.hero, p = pend; pend = null; const now = snap(), self = this, args = arguments;
        const rows = STATS.map(([k, l]) => [l, p.s[k], now[k]]);
        try { playSnd('jingle_levelup'); } catch (e) {}
        const hint = L.find(l => !/[+＋]\d/.test(l) && l[0] !== '!' && !/→/.test(l));
        return levelPanel({ who: 'hero', title: '境界提升', lv0: p.lv0, lv1: h.lv, rows }).then(ok => { if (!ok) return orig.apply(self, args); if (hint) try { toast(hint, 2600); } catch (e) {} return true; });
      }
    } catch (e) { console.warn('R153 showPanel', e); }
    return orig.apply(this, arguments);
  })(showPanel);

  // 测试入口
  window.SKWIN_TEST = () => SKWIN.learn({ k: 'xingluo', name: '破军剑阵·星罗', desc: '星罗剑芒铺天盖地，多段攻击全体', meta: '类型：主动  /  消耗灵力：44' }).then(() => SKWIN.upgrade({ k: 'tanlang', name: '贪狼剑意·追魂', t0: 2, t1: 3, rows: [['伤害', '130%', '150%'], ['破甲', '2回合', '3回合'], ['消耗灵力', '30', '30']] }));
})();
