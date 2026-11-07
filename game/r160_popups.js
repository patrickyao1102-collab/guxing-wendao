// ================= R160 · 黑金系统弹窗（作者 11-08 定 R134「C 黑金」，Codex R160 拆件 + 绘制代码）=================
// 领悟技能 / 技能升级 / 等级提升 / 境界提升 / 战斗胜利 五种弹窗都换成 Codex 的黑金框（r160/，画法见 r160_canvas.js = Codex popup-canvas.mjs）。
// 这里只负责：读布局、把游戏数据填进去、把技能图标 / 道具图标画进图标座、点「确定 / 下一页」。
// 拆件还没载完时退回原来的窗口（r153 / levelup_panel），不会卡住剧情。
(function () {
  const P = window.POPUP; if (!P || typeof S === 'undefined') return;
  const FONTS = { body: 'GuxingKai', heading: 'GuxingDF', number: 'Times New Roman' };
  const packs = {}, ok = {};
  const load = k => packs[k] || (packs[k] = P.loadPopup('r160/' + k + '.json').then(p => { p.layout.text.fonts = Object.assign({}, p.layout.text.fonts || {}, FONTS); ok[k] = p; return p; }).catch(e => { console.warn('R160 载入失败', k, e); delete packs[k]; return null; }));
  const KINDS = ['learn', 'up', 'level', 'realm', 'victory'];
  setTimeout(() => KINDS.forEach(load), 3000);
  const CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  const NAME = { hero: '叶孤星', yunting: '云霆', linxue: '林雪', shenle: '神乐', luochen: '洛尘' };

  // ---------- 窗口队列 ----------
  let cur = null; const queue = [];
  window.R160_OPEN = () => !!cur;
  function open(kind, data) {
    return new Promise(res => {
      const go = async () => { const pk = ok[kind] || await load(kind); if (!pk) { res(false); next(); return; }
        cur = { kind, pack: pk, data, page: 0, pressed: false, t0: performance.now(), res, sc: null }; };
      queue.push(go); if (!cur && queue.length === 1) go();
    });
  }
  function next() { queue.shift(); if (queue.length) queue[0](); }
  function close() { const c = cur; cur = null; if (c) c.res(true); next(); }

  // ---------- 画 ----------
  function scene(c) {
    return c.kind === 'victory' ? P.victoryScene(c.pack.layout, c.data, { pressed: c.pressed, timeMs: performance.now(), animate: true })
      : P.systemScene(ctx, c.pack.layout, c.data, { page: c.page, pressed: c.pressed });
  }
  function icons(c, sc) {
    for (const op of sc.draw) {
      if (op.type === 'runtimeIcon' && c.data.skillKey && window.SKILL_ICON) {
        const [x, y, w, h] = op.rect, cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) / 2;
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
        const g = ctx.createRadialGradient(cx, cy - r * .3, r * .1, cx, cy, r); g.addColorStop(0, '#2c4a8a'); g.addColorStop(1, '#0b1634'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
        try { SKILL_ICON(c.data.skillKey, cx, cy, r * .98, {}); } catch (e) {}
        ctx.restore();
      }
      if (op.type === 'itemIcon' && op.icon && typeof itemIcon === 'function') {
        const [x, y, w, h] = op.rect; ctx.save(); try { itemIcon(op.icon, x + w / 2, y + h / 2, Math.min(w, h) / 2); } catch (e) {} ctx.restore();
      }
    }
  }
  function draw() {
    const c = cur; if (!c) return;
    const now = performance.now(), e = 1 - Math.pow(1 - Math.min(1, (now - c.t0) / 260), 3);
    ctx.save(); ctx.globalAlpha = .6 * e; ctx.fillStyle = '#04060b'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = e;
    ctx.translate(640, 360); ctx.scale(.95 + .05 * e, .95 + .05 * e); ctx.translate(-640, -360 + (1 - e) * 16);
    try { const sc = scene(c); c.sc = sc; P.paintPopup(ctx, c.pack, sc, { icons: {}, timeMs: now }); icons(c, sc); } catch (err) { console.warn('R160 draw', err); ctx.restore(); close(); return; }
    ctx.restore();
  }
  let menuDrawn = 0;
  S.overlay.push({ draw() { if (!(S.menu && performance.now() - menuDrawn < 200)) draw(); } });
  if (typeof drawMenu === 'function') drawMenu = (o => function () { const r = o.apply(this, arguments); menuDrawn = performance.now(); draw(); return r; })(drawMenu);

  // ---------- 点 ----------
  const inBtn = (x, y) => cur && cur.sc && P.inConfirmArea(cur.sc.hitArea, x, y);
  function tap(t) {
    if (!cur || performance.now() - cur.t0 < 450) return;
    if (t.key || inBtn(t.x, t.y)) { try { playSnd('ui_click'); } catch (e) {} if (cur.sc && cur.sc.next) { cur.page++; cur.t0 = performance.now() - 200; } else close(); }
  }
  consumeTap = (o => function () { if (cur) { o(); return null; } return o(); })(consumeTap);
  if (typeof menuUpdate === 'function') menuUpdate = (o => function () { if (cur) { input.tapped = null; return; } return o.apply(this, arguments); })(menuUpdate);
  // 点击直接听浏览器事件（游戏主循环里别处会先把 input.tapped 清掉）；窗口开着时游戏本身收不到点击
  cv.addEventListener('pointerup', e => { if (!cur) return; try { const p = toLogical(e); tap(p); } catch (err) {} });
  window.addEventListener('keydown', e => { if (cur && (e.key === ' ' || e.key === 'Enter')) tap({ key: true }); });
  (function tick() { if (cur) { cur.pressed = !!input.down && inBtn(input.x, input.y); input.tapped = null; } requestAnimationFrame(tick); })();

  // ---------- 领悟 / 技能升级 ----------
  const S0 = window.SKWIN;
  if (S0) {
    const L0 = S0.learn, U0 = S0.upgrade;
    S0.learn = function (o) {
      try { playSnd('sfx_sword_ring'); } catch (e) {} S.flash = .4; S.flashColor = '#cfe6ff';
      const meta = String(o.meta || '').replace(/：/g, ' ').replace(/\s*\/\s*/g, '　/　').trim();
      const desc = [o.desc, o.note].filter(Boolean).join('\n');
      return open('learn', { name: o.name, skillKey: o.k || (S0.keyOf && S0.keyOf(o.name)), description: desc || ' ', meta, confirm: '知道了' }).then(r => r || L0.call(this, o));
    };
    S0.upgrade = function (o) {
      try { playSnd('jingle_levelup'); } catch (e) {} S.flash = .4; S.flashColor = '#fff3c0';
      const rows = (o.rows || []).map(([label, before, after]) => ({ label, before: String(before), after: String(after) }));
      if (!rows.length && o.desc) rows.push({ label: '效果', before: '—', after: String(o.desc).slice(0, 12) });
      return open('up', { name: o.name, skillKey: o.k || (S0.keyOf && S0.keyOf(o.name)), before: '第' + CN[o.t0] + '重', after: '第' + CN[o.t1] + '重', changes: rows, confirm: '确定' }).then(r => r || U0.call(this, o));
    };
  }

  // ---------- 等级提升 / 境界提升 ----------
  const LP0 = window.levelPanel;
  const fmt = rows => rows.map(([l, a, b]) => l + ' +' + (b - a)).filter(s => !/\+0$/.test(s));
  function allyGain(k, lv0, lv1) { try { const d = PARTY_DB[k]; const at = lv => { const o = {}; for (const s in d.base) o[s] = Math.round(d.base[s] + (d.grow[s] || 0) * (Math.max(10, lv) - 10)); return o; }; const a = at(lv0), b = at(lv1);
    return [['气血', a.maxhp, b.maxhp], ['灵力', a.maxmp, b.maxmp], ['攻击', a.atk, b.atk], ['防御', a.def, b.def], ['身法', a.spd, b.spd]]; } catch (e) { return []; } }
  window.levelPanel = function (o = {}) {
    const who = o.who || 'hero', rows = (o.rows || []).filter(r => r && r.length >= 3);
    if (/境界/.test(o.title || '')) {
      const before = o.realm0 || (typeof realmOf === 'function' ? realmOf(o.lv0) : ''), after = o.realm1 || (S.hero && S.hero.realm) || (typeof realmOf === 'function' ? realmOf(o.lv1) : '');
      return open('realm', { roleId: who, name: o.name || NAME[who] || '', before, after, changes: rows.map(([label, a, b]) => ({ label, before: String(a), after: String(b), delta: (b - a >= 0 ? '+' : '') + (b - a) })), confirm: '确定' }).then(r => r || (LP0 ? LP0(o) : false));
    }
    const g = fmt(rows), members = [{ roleId: who, name: o.name || NAME[who] || '', before: 'Lv.' + o.lv0, after: 'Lv.' + o.lv1, gains1: g.slice(0, 3).join('　'), gains2: g.slice(3).join('　') }];
    if (who === 'hero') for (const k of (S.party || []).slice(0, 2)) { if (!NAME[k]) continue; const ag = fmt(allyGain(k, o.lv0, o.lv1)); if (!ag.length) continue;
      members.push({ roleId: k, name: NAME[k], before: 'Lv.' + o.lv0, after: 'Lv.' + o.lv1, gains1: ag.slice(0, 3).join('　'), gains2: ag.slice(3).join('　') }); }
    return open('level', { members, confirm: '确定' }).then(r => r || (LP0 ? LP0(o) : false));
  };

  // ---------- 战斗胜利 ----------
  startBattle = (orig => function () { const r = orig.apply(this, arguments); try { if (battle) battle._lv0 = S.hero.lv; } catch (e) {} return r; })(startBattle);
  const idOf = name => { try { const n = String(name).trim().replace(/[×x]\s*\d+$/, '').trim(); for (const [id, it] of Object.entries(ITEM_DB)) if (it && it.name === n) return id; } catch (e) {} return null; };
  showPanel = (orig => function (title, lines) {
    try {
      if (String(title) === '战斗胜利' && typeof battle !== 'undefined' && battle && ok.victory) {
        const L = (lines || []).filter(Boolean).map(String), num = re => { const l = L.find(x => re.test(x)); const m = l && l.match(/\+\s*(\d+)/); return m ? +m[1] : 0; };
        const exp = num(/经验/), gold = num(/灵石/), lv0 = battle._lv0 || S.hero.lv, up = S.hero.lv > lv0;
        const need = typeof expNeed === 'function' ? expNeed(S.hero.lv) : 0;
        const members = (battle.heroes || [battle.P]).filter(Boolean).slice(0, 4).map(u => { const k = u === battle.main || !u.ally ? 'hero' : u.ally;
          return { roleId: NAME[k] ? k : 'hero', name: k === 'hero' ? '叶孤星' : (u.name || NAME[k]), gain: exp, currentXp: Math.round(S.hero.exp || 0), requiredXp: need, didLevelUp: up }; });
        const cnt = new Map();
        for (const l of L) { const m = l.match(/^!?(?:掉落|获得)[：:](.*)$/); if (!m) continue; for (const raw of m[1].split(/[、，,]/)) { const nm = raw.trim(); if (!nm) continue; const q = +((nm.match(/[×x]\s*(\d+)$/) || [])[1] || 1), base = nm.replace(/[×x]\s*\d+$/, '').trim(); cnt.set(base, (cnt.get(base) || 0) + q); } }
        const drops = [...cnt].slice(0, 6).map(([name, quantity]) => ({ name, quantity, icon: idOf(name) }));
        if (members.length) return open('victory', { members, drops, currency: gold }).then(r => r || orig.apply(this, arguments));
      }
    } catch (e) { console.warn('R160 victory', e); }
    return orig.apply(this, arguments);
  })(showPanel);

  // 测试入口：控制台 R160_TEST()
  window.R160_TEST = async () => {
    await SKWIN.learn({ k: 'xingluo', name: '破军剑阵·星罗', desc: '星罗剑芒铺天盖地，多段攻击全体', meta: '消耗灵力 44 / 类型 主动' });
    await SKWIN.upgrade({ k: 'tanlang', name: '贪狼剑意·追魂', t0: 2, t1: 3, rows: [['伤害', '130%', '150%'], ['破甲', '2回合', '3回合']] });
    await levelPanel({ who: 'hero', lv0: 12, lv1: 13, rows: [['气血', 1860, 1980], ['灵力', 96, 108], ['攻击', 268, 284], ['防御', 142, 151], ['身法', 82, 86]] });
    await levelPanel({ who: 'hero', title: '境界提升', lv0: 9, lv1: 11, realm0: '练气九重', realm1: '凝丹二重', rows: [['气血', 336, 420], ['灵力', 109, 140], ['攻击', 43, 52]] });
  };
})();
