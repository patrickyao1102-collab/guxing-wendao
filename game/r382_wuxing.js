// ================= R382 · 五行（只进测试版）=================
// 作者 11-27 晨：「那个破绽什么的，我觉得真的没有必要。我觉得可以用五行吧，用五行属性去区分怪物。」
// 之后一句一句定下来的规矩（08:00–08:30）：
//   · 妖兽、敌人各带一个五行；神族（月明、洛尘那一档）不入五行，游戏里基本碰不到。
//   · 每个人只有一个属性，普攻、剑招、秘术、大招全是它。队友 = 本命灵根，永远不变：神乐木、林雪水、云霆火（雷按火算，也能激发金）、洛尘常态土。
//   · 全队只有叶孤星会变：他灵根为无，手里的剑是什么属性他就是什么属性（剑本来属金，所以平时是金）。
//     星痕剑是唯一能「植入属性」的成长型仙器——剑里的星纹点亮了几道，就能在几系之间换；战斗里每一手可以免费换一次。
//   · 对敌只有三种结果：克它（金克木、木克土、土克水、水克火、火克金）伤害 +30%；
//     生它（金生水、水生木、木生火、火生土、土生金，等于给树浇水）伤害 −30%；其余照常。先只做进攻（Gemini、GPT 都这么劝）。
//   · 不做新技能特效。
// 这个文件只管战斗里的五行；装备的属性表也放在这里（合灵根十成、不合八折、套装，在 r389 里做）。
// 顺手记一份战绩（打赢几场、哪种妖兽几只、打出几次相克），给星旋的事迹用。
(function () {
  if (typeof applyDamage !== 'function' || typeof drawUnit !== 'function' || typeof endBattle !== 'function' || typeof updateBattle !== 'function') return;
  const WX = { jin: { n: '金', c: '#f4eccd', k: '#b9a25a' }, mu: { n: '木', c: '#a6dc92', k: '#4f9a4a' }, shui: { n: '水', c: '#9fd3ff', k: '#3f86c8' }, huo: { n: '火', c: '#ffa070', k: '#d2552a' }, tu: { n: '土', c: '#e6bd7c', k: '#9a6f34' } };
  const ORDER = ['jin', 'mu', 'shui', 'huo', 'tu'];
  const KE = { jin: 'mu', mu: 'tu', tu: 'shui', shui: 'huo', huo: 'jin' }, SHENG = { jin: 'shui', shui: 'mu', mu: 'huo', huo: 'tu', tu: 'jin' };
  // 出手的属性 a 打 目标属性 t：1 克、.5 次克、-1 生、0 平。
  //   次克（作者 11-27 22:54 定的「游戏自己的理念」，出自「子盗母气」）：谁生谁，被生的那一行反过来次克生它的——木生火，所以火次克木；金生水，所以水次克金。
  const rel = (a, t) => !a || !t ? 0 : KE[a] === t ? 1 : SHENG[t] === a ? .5 : SHENG[a] === t ? -1 : 0;
  const KE_MULT = 1.3, CIKE_MULT = 1.15, SHENG_MULT = .7;
  // 本命灵根（云霆的雷：出手按火；装备和套装上金也算合，见 r389）
  const ROOT = { yunting: 'huo', linxue: 'shui', shenle: 'mu', luochen: 'tu' }, ROOT2 = { yunting: 'jin' };
  // 装备的五行（没列的 = 无属性）。按名字和来历定：寒、霜、雪 = 水；雷、电、火、霞 = 火；木、藤、丝、风 = 木；铁、钢、鳞、金 = 金；皮、骨、岩、牙 = 土
  const GEAR = {
    w_wood: 'mu', w_qingfeng: 'jin', w_hantie: 'shui', w_hanxing: 'shui', w_chixiao: 'huo', w_qingxiao: 'mu', w_yunlei: 'huo', w_liuguang: 'jin', w_xuanshuang: 'shui', w_zidian: 'huo',
    a_cloth: 'mu', a_leather: 'tu', a_iron: 'jin', a_wolf: 'tu', a_nichang: 'shui', a_ziyun: 'shui', a_xinghenyi: 'huo', a_tielin: 'jin', a_xuanlin: 'jin', a_yunjin: 'mu', a_tiancan: 'mu', a_xiaguang: 'huo', a_xipi: 'tu', a_zhusi: 'mu', a_yaowang: 'tu',
    c_tayun: 'jin', s_buyun: 'mu', s_zhuifeng: 'mu', s_taxue: 'shui', s_langhao: 'tu', s_yingbu: 'shui',
    c_jinling: 'jin', c_jade: 'shui', c_tusk: 'tu', c_token: 'huo', c_foxtail: 'shui', acc_qz_sachet: 'mu', c_jinsi: 'jin', c_ningshen: 'mu', c_baihua: 'mu' };
  const isXH = id => id === 'w_xinghen' || id === 'w_xinghen2';
  const F = () => (S.flags = S.flags || {});
  const XH = () => { const f = F(); const o = f.wx || (f.wx = { own: { jin: 1 }, cur: 'jin' }); if (!o.own) o.own = { jin: 1 }; if (!o.own.jin) o.own.jin = 1; if (!o.own[o.cur]) o.cur = 'jin'; return o; };   // 星痕剑里点亮的星纹
  const gearWx = id => !id ? null : isXH(id) ? XH().cur : (GEAR[id] || (typeof ITEM_DB !== 'undefined' && ITEM_DB[id] && ITEM_DB[id].wx) || null);
  const heroWx = () => { try { const w = S.hero.equip && S.hero.equip.weapon; return (w && gearWx(w)) || 'jin'; } catch (e) { return 'jin'; } };   // 剑本来属金：空手、无属性的剑都按金
  // 敌人的五行（按战斗形象的 key；Gemini 和 GPT 各排了一遍，两家几乎一样）
  const ENEMY = {
    m_wolf: 'huo', m_monkey: 'tu', m_tree: 'mu',
    e_wolf2: 'jin', e_boar: 'tu', e_rhino: 'jin', e_leopard: 'huo', e_ywolf: 'shui', e_spider: 'mu', e_treant: 'mu', e_spiderq: 'jin', e_wolfking: 'shui', e_tiger: 'jin', e_fox3: 'shui',
    e_grunt: 'tu', e_archer: 'mu', e_boss: 'tu', e_zhouhu: 'jin', e_fanglie: 'huo', e_mozu: 'huo',
    e_xiexiu: 'shui', e_corpse: 'tu', e_xbat: 'huo', e_xwraith: 'jin', e_xspider: 'tu', e_xguard1: 'shui', e_xguard2: 'huo', e_xguard3: 'jin', e_xxboss: 'shui', e_yyq_f: 'shui', e_yyq_m: 'jin',
    e_ly_wolf: 'mu', e_ly_eagle: 'jin', e_ly_lion: 'huo', e_ly_roc: 'jin', e_xingwolf: 'huo' };
  const YW = { boar: 'tu', wolf: 'shui', leopard: 'huo', spider: 'jin', treant: 'mu', rhino: 'jin' };   // 榜上五只妖王正好一行一只；榜外的犀王属金
  const baseKey = u => String((u && u.key) || '').replace(/_(b|c|d)$/, '');
  const enemyWx = u => { if (!u) return null; if (u._wx !== undefined) return u._wx; if (u._yw && YW[u._yw.id]) return YW[u._yw.id]; return ENEMY[baseKey(u)] || null; };
  const unitWx = u => !u ? null : u.side === 'hero' ? (u.ally ? (ROOT[u.ally] || null) : heroWx()) : enemyWx(u);
  const on = b => !!b && b.state !== 'end' && !(b.cfg && (b.cfg.sunKill || b.cfg.noWx));   // 开场借力那一仗不掺五行
  const ST = () => { const f = F(); const s = f.xs || (f.xs = { wins: 0, kills: {}, ke: 0, hi: 0 }); if (!s.kills) s.kills = {}; return s; };

  // ---------- 徽记 / 字样（Codex R386 到了就用图，没到先用字）----------
  const ART = {}; function art(n) { let a = ART[n]; if (!a) { a = ART[n] = { im: new Image(), ok: false }; a.im.onload = () => { a.ok = true; }; a.im.onerror = () => { a.bad = true; }; a.im.src = 'r386/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(a.im); } catch (e) {} } return a.ok ? a.im : null; }
  setTimeout(() => { for (const n of ['wx_jin', 'wx_mu', 'wx_shui', 'wx_huo', 'wx_tu', 'txt_ke', 'txt_sheng', 'mk_up', 'mk_down']) art(n); }, 9000);
  function emblem(el, x, y, r, a) { if (!el || !WX[el]) return; const im = art('wx_' + el); ctx.save(); if (a != null) ctx.globalAlpha *= a;
    if (im) ctx.drawImage(im, x - r, y - r, r * 2, r * 2);
    else { const w = WX[el]; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); const g = ctx.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); g.addColorStop(0, '#2b2a26'); g.addColorStop(1, '#0d0c0b'); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.4, r * .12); ctx.strokeStyle = w.k; ctx.stroke();
      ctx.font = `${Math.round(r * 1.34)}px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = w.k; ctx.shadowBlur = r * .5; ctx.fillStyle = w.c; ctx.fillText(w.n, x, y + r * .06); }
    ctx.restore(); }
  function arrow(up, x, y, s) { const im = art(up ? 'mk_up' : 'mk_down'); ctx.save();
    if (im) ctx.drawImage(im, x - s, y - s, s * 2, s * 2);
    else { ctx.translate(x, y); if (!up) ctx.scale(1, -1); ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * .9, s * .1); ctx.lineTo(s * .36, s * .1); ctx.lineTo(s * .36, s * .9); ctx.lineTo(-s * .36, s * .9); ctx.lineTo(-s * .36, s * .1); ctx.lineTo(-s * .9, s * .1); ctx.closePath(); ctx.fillStyle = up ? '#ffb84a' : '#8fa3ad'; ctx.strokeStyle = up ? '#5a1c00' : '#1d2a30'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke(); ctx.fill(); }
    ctx.restore(); }
  function pop(name, text, x, y, col, w) { if (typeof addFx !== 'function') return; addFx({ x, y, life: 1.1, layer: 2, draw(f) { const k = f.t / f.life, s = k < .12 ? 1.9 - .9 * (k / .12) : 1, a = k > .72 ? (1 - k) / .28 : 1, im = art(name); ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.translate(f.x, f.y - k * 34); ctx.scale(s, s);
        if (im) { const h = w * im.height / im.width; ctx.drawImage(im, -w / 2, -h / 2, w, h); } else { ctx.font = `${Math.round(w * .62)}px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(text, 0, 0, col, '#1a0800', 7); } ctx.restore(); } }); }

  // ---------- 打到敌人身上：克 / 生 ----------
  applyDamage = (orig => function (t, d, crit, opts) {
    try { const b = battle, att = b && b.active; if (on(b) && t && t.alive && t.side === 'enemy' && att && att.side === 'hero' && !(opts && opts.noWx)) { const a = unitWx(att), e = unitWx(t), r = rel(a, e);
        if (r) { arguments[1] = d = Math.max(1, Math.round(d * (r >= 1 ? KE_MULT : r > 0 ? CIKE_MULT : SHENG_MULT))); mark(b, att, t, r, a, e); } } } catch (e) { console.warn('R382', e); }
    return orig.apply(this, arguments); })(applyDamage);
  function mark(b, att, t, r, a, e) { const an = b._actNo || 0, st = ST(), f = F();
    if (t._wxAct !== an) { t._wxAct = an; const x = t.x + (t.ox || 0) + 8, y = t.y - Math.min(t.h || 200, 340) - 62; if (r >= 1) { pop('txt_ke', '克', x, y, '#ffe9a0', 116); try { sfx('crit'); } catch (e2) {} } else if (r > 0) pop('txt_cike', '次克', x, y + 6, '#ffd9a0', 92); else pop('txt_sheng', '生', x, y + 10, '#b9d8bf', 84); }
    if (r > 0 && r < 1) { if (!f.wx_tip3) { f.wx_tip3 = 1; b._wxTip = { t0: performance.now(), s: WX[a].n + '次克' + WX[e].n + ' —— ' + WX[e].n + '生' + WX[a].n + '，被生的反过来耗它，伤害多一成半' }; } return; }
    if (r > 0) { if (b._wxKeAct !== an) { b._wxKeAct = an; st.ke = (st.ke || 0) + 1; b._keN = (b._keN || 0) + 1; } t._keHit = an; f.wx_last = [a, e, att.name, String(t.name || '').replace(/\s*Lv\s*\d+$/, ''), att.ally ? 0 : 1]; if (!f.wx_tip1) { f.wx_tip1 = 1; b._wxTip = { t0: performance.now(), s: WX[a].n + '克' + WX[e].n + ' —— 用克它的属性去打，伤害多三成' }; } }
    else if (!f.wx_tip2) { f.wx_tip2 = 1; b._wxTip = { t0: performance.now(), s: WX[a].n + '生' + WX[e].n + ' —— 这一下等于给它添了力气，伤害少三成' }; } }

  // ---------- 名字旁边的徽记；轮到我方时，敌人徽记旁标出 ▲ / ▼ ----------
  drawUnit = (orig => function (u) { const r = orig.apply(this, arguments);
    try { const b = battle; if (u && u.alive && on(b) && !b._cineHide) { const el = unitWx(u); if (el) { const y0 = u.y + (u.oy || 0), x0 = u.x + (u.ox || 0);
          if (u.side === 'enemy') { let ex, ey; if (u._noBar || u._plate || u._scale) { ex = x0 - Math.min(90, (u.h || 300) * .26); ey = y0 - Math.min(u.h || 300, 400) - 8; } else { ex = x0 - 55 - 21; ey = y0 - u.h - 26 + 3; }
            emblem(el, ex, ey, 16);
            const act = b.active; if (act && act.side === 'hero' && (b.state === 'menu' || b.state === 'pick')) { const k = rel(unitWx(act), el); if (k) { const bob = Math.sin(performance.now() / 260) * 2.5; arrow(k > 0, ex - 27, ey + (k > 0 ? -bob : bob), k > 0 && k < 1 ? 8 : 11); } } }
          else emblem(el, x0 - 55 - 19, y0 - u.h - 26 + 3, 14); } } } catch (e) {}
    return r; })(drawUnit);

  // 头一回打出克 / 生：战斗画面底下说明一句（几秒自己收）
  if (typeof drawBattle === 'function') drawBattle = (orig => function () { const r = orig.apply(this, arguments);
    try { const b = battle; if (b && b._wxTip) { const dt = (performance.now() - b._wxTip.t0) / 1000; if (dt < 6.5) { const a = Math.min(1, dt * 3) * Math.min(1, (6.5 - dt) * 2), t = b._wxTip.s; ctx.save(); ctx.globalAlpha = a; ctx.font = `600 22px ${FONT}`; const w = ctx.measureText(t).width + 56, x = (W - w) / 2, y = 598;
          const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(12,8,4,0)'); g.addColorStop(.12, 'rgba(12,8,4,.78)'); g.addColorStop(.88, 'rgba(12,8,4,.78)'); g.addColorStop(1, 'rgba(12,8,4,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, 42); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9b8'; ctx.fillText(t, W / 2, y + 22); ctx.restore(); } else b._wxTip = null; }
      dial(b); } catch (e) {}
    return r; })(drawBattle);

  // ---------- 星痕剑：战斗里换星纹（每一手免费换一次）----------
  const DIAL = { x: 836, y: 396, r: 30 };
  const xhOn = b => { try { return on(b) && b.state === 'menu' && b.active && b.active === b.P && isXH(S.hero.equip.weapon) && Object.keys(XH().own).length >= 2; } catch (e) { return false; } };
  function dial(b) { if (!xhOn(b)) return; const o = XH(), now = performance.now(), used = b._wxSw === (b._actNo || 0), pu = .5 + .5 * Math.sin(now / 300);
    ctx.save(); ctx.globalAlpha = used ? .55 : 1; ctx.beginPath(); ctx.arc(DIAL.x, DIAL.y, DIAL.r + 7, 0, 7); ctx.fillStyle = 'rgba(8,10,14,.62)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = used ? 'rgba(160,160,160,.5)' : `rgba(255,224,150,${.5 + pu * .4})`; ctx.stroke();
    emblem(o.cur, DIAL.x, DIAL.y, DIAL.r); ctx.font = `700 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline(used ? '已换' : '换星纹', DIAL.x, DIAL.y + DIAL.r + 20, used ? '#b8b8b8' : '#ffe9a0', '#1a0800', 4); ctx.restore(); }
  function cycle(b) { const o = XH(), own = ORDER.filter(k => o.own[k]); if (own.length < 2) return; if (b._wxSw === (b._actNo || 0)) { try { toast('这一手已经换过了', 1400); } catch (e) {} return; }
    o.cur = own[(own.indexOf(o.cur) + 1) % own.length]; b._wxSw = b._actNo || 0; const P = b.P; try { playSnd('ui_confirm', .6); } catch (e) {}
    try { if (typeof floatText === 'function') floatText(P.x, P.y - P.h - 44, '星纹 · ' + WX[o.cur].n, WX[o.cur].c, 38, 1.2, BRUSH); } catch (e) {} }
  try { cv.addEventListener('pointerdown', e => { const b = typeof battle !== 'undefined' && battle; if (!xhOn(b) || dialog || choice || sysPanel) return; const p = toLogical(e); if (Math.hypot(p.x - DIAL.x, p.y - DIAL.y) > DIAL.r + 12) return; e.stopImmediatePropagation(); e.preventDefault(); try { input.tapped = null; } catch (e2) {} cycle(b); }, true); } catch (e) {}

  // ---------- 拿到星痕剑：星旋再点亮一道星纹（玩家自己挑）----------
  const OPTS = [['mu', '木纹 · 克土（山魈、山贼、獠牙猪）'], ['shui', '水纹 · 克火（妖狼、妖豹）'], ['huo', '火纹 · 克金（银纹妖狼、黑甲犀）'], ['tu', '土纹 · 克水（幽影狼、邪修）']];
  async function pickFirst() { const o = XH(); if (o.pick) return; o.pick = 1; const lock0 = world.locked; world.locked = true;
    try { await say('星旋', '星痕剑认了主，剑里那几道星纹也醒了。金纹是它生来就有的——剑嘛，本来属金。');
      await say('星旋', '本神仙再替你点亮一道。五行里挑一个，小子，想清楚再挑。');
      const c = await choose('星痕剑 · 点亮哪一道星纹？', OPTS.map(x => x[1])); const el = (OPTS[c] || OPTS[0])[0]; o.own[el] = 1; o.cur = el; try { playSnd('jingle_levelup', .6); } catch (e) {}
      await showPanel('星痕剑 · 星纹', ['!' + WX[el].n + '纹 已点亮', '叶孤星的剑招现在是「' + WX[el].n + '」属性', '战斗里轮到他时，点剑旁那枚星纹可以换（一手换一回）']);
      await say('星旋', '剩下几道，自己挣去——星辰宝库里有，妖王的内丹也喂得亮。'); } catch (e) { console.warn('R382 pick', e); } finally { world.locked = lock0; } }
  if (typeof XH_GAIN === 'function') XH_GAIN = (orig => async function () { const r = await orig.apply(this, arguments); try { await pickFirst(); } catch (e) {} return r; })(XH_GAIN);
  // 老存档（已经有星痕剑、还没挑过）：回到地图上闲下来时补这一段
  try { let busy = false; S.overlay.push({ draw() { try { if (busy || XH().pick || S.scene !== drawMap || !S.hud || world.locked || dialog || choice || sysPanel || S.menu || (typeof battle !== 'undefined' && battle)) return; const h = S.hero; if (!h || !(isXH(h.equip && h.equip.weapon) || (h.bag && (h.bag.w_xinghen || h.bag.w_xinghen2)))) return; busy = true; pickFirst().finally(() => { busy = false; }); } catch (e) {} } }); } catch (e) {}

  // ---------- 战绩；妖王伏诛，它那一行的星纹点亮 ----------
  endBattle = (orig => async function (win) { const b = battle; let lit = null;
    try { if (b && win && !b._r382done) { b._r382done = 1; const st = ST(); st.wins = (st.wins || 0) + 1; const lv = (S.hero && S.hero.lv) || 1;
        for (const e of b.enemies || []) { if (e.alive) continue; const k = baseKey(e); st.kills[k] = (st.kills[k] || 0) + 1; if ((e.lv || 0) >= lv + 2) st.hi = (st.hi || 0) + 1; if (e._keHit != null) st.keKill = (st.keKill || 0) + 1; }
        if (b._yw || (b.cfg && b.cfg.boss)) st.boss = (st.boss || 0) + 1;
        const yw = (b.enemies || []).map(e => e._yw).find(Boolean), el = yw && YW[yw.id]; if (el && !XH().own[el]) { XH().own[el] = 1; lit = el; } } } catch (e) { console.warn('R382 end', e); }
    const r = await orig.apply(this, arguments);
    if (lit) setTimeout(() => { try { toast('星痕剑吞了妖王一缕' + WX[lit].n + '性——' + WX[lit].n + '纹亮了。往后碰上' + WX[KE[lit]].n + '性的，换它。', 3600); } catch (e) {} }, 1800);
    return r; })(endBattle);

  // ---------- 头一场：让玩家自己打出一次「克」（拿着水属性的寒星剑，先碰上火性的妖狼），打完星旋说两句 ----------
  if (typeof mobFight === 'function') mobFight = (orig => async function (a) { const f = F(); let M = null, t0 = null;
    try { if (!f.wx_first && world.mapName === 'tj_houshan' && heroWx() === 'shui' && a) { f.wx_first = 1; a.mob = 'wolf'; M = world.map.def && world.map.def.mobs; if (M && M.types) { t0 = M.types; M.types = ['wolf']; } } } catch (e) {}
    try { return await orig.apply(this, arguments); } finally { try { if (M && t0) M.types = t0; } catch (e) {} } })(mobFight);
  { const prev = window.SQ_ON_WIN; window.SQ_ON_WIN = async function (info) { if (prev) await prev.apply(this, arguments);
      try { const f = F(), L = f.wx_last; if (!f.wx_intro && f.wx_tip1 && L) { f.wx_intro = 1; const [a, e, who, foe, hero] = L;
          await say('星旋', '看见没有？' + foe + '是' + WX[e].n + '性，' + (hero ? '你手里的剑属' + WX[a].n : who + '是' + WX[a].n + '灵根') + '——' + WX[a].n + '克' + WX[e].n + '，打上去格外疼。');
          await say('星旋', '谁是什么性，名字旁边那个字写着呢。' + (a === 'shui' ? '反过来可别拿水剑去砍树妖：水生木，那是给它浇水。' : '反过来也一样：' + WX[a].n + '生' + WX[SHENG[a]].n + '，拿它去打' + WX[SHENG[a]].n + '性的东西，等于给它添力气。')); } } catch (e) { console.warn('R382 intro', e); } }; }

  window.WX5 = { WX, ORDER, KE, SHENG, rel, ROOT, ROOT2, GEAR, ENEMY, YW, gearWx, heroWx, unitWx, enemyWx, isXH, XH, stat: ST, baseKey, emblem, arrow, art, KE_MULT, CIKE_MULT, SHENG_MULT };
  window.R382 = { stat: ST, baseKey };   // 旧名字留给别的文件用
})();
