// ================= R134 · 作者「修改1」（11-07 凌晨）逐条修复 =================
// 这一份最后加载，用包一层的方式改行为，尽量不动前面的老代码。每段前面写着对应作者的第几条。
(function () {
  if (typeof S === 'undefined') return;
  const F = () => (S.flags = S.flags || {});
  const later = (fn, ms = 0) => setTimeout(() => { try { fn(); } catch (e) { console.warn('R134', e); } }, ms);
  const freeNow = () => typeof battle !== 'undefined' && !battle && world && world.map && S.scene === drawMap && !world.locked && !dialog && !choice && !(typeof sysPanel !== 'undefined' && sysPanel) && !(window.IG_OPEN && IG_OPEN());
  // 等到玩家空闲（商店、对话、面板都关了）再跑一段剧情
  const whenFree = (fn, tries = 600) => { const id = setInterval(() => { if (--tries < 0) return clearInterval(id); if (!freeNow()) return; clearInterval(id); fn(); }, 300); };
  const heroTier = () => { const h = S.hero || {}, r = String(h.realm || ''), lv = h.lv || 0; return lv >= 19 || /引魂|归元|灵台|洞虚|万劫|法相|无上/.test(r) ? 2 : lv >= 10 || /凝丹/.test(r) ? 1 : 0; };
  const wrapText = (txt, maxW) => { const out = []; let line = ''; for (const ch of String(txt)) { if (ctx.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; };

  // ---- 新物品（图标先借相近的，Codex 的新图标到了再换）----
  Object.assign(ITEM_DB, {
    c_tayun: { name: '踏云靴', slot: 'acc', spd: 3, def: 4, lvReq: 6, desc: '叶孤星衣柜深处翻出来的旧靴子，靴底绣着流云纹。速度 +3，防御 +4' },
    m_xcsha: { name: '星辰砂', price: 0, desc: '星辰商店兑换的炼器材料。星痕剑升阶用' },
    n_ningyuan: { name: '凝元丹', desc: '叶擎苍所赠。服下可直接冲破练气关，踏入凝丹二重（在行囊里选中它，点「使用」）' },
    bk_yt_jiutian: { name: '《九天神雷》秘传', price: 240, book: true, cat: '秘传', desc: '云霆的秘传。引九天雷霆劈落全体，30% 麻痹。买下后云霆当场参悟' },
  });
  if (ITEM_DB.k_pokong) ITEM_DB.k_pokong.desc = '叶擎苍所赠的珍稀空间符箓。带在身上，战斗中「逃跑」成功率 +25%';
  if (typeof itemIcon === 'function') itemIcon = (orig => function (id) { const a = [...arguments]; const M = { c_tayun: 'a_leather', m_xcsha: 'yunxingshi', n_ningyuan: 'p_big', bk_yt_jiutian: 'book_jianpu' };
    if (M[id] && !(IMG['ic_' + id])) a[0] = M[id]; return orig.apply(this, a); })(itemIcon);

  // ---- 第 15 条：每场战斗打赢后，全队回复 20% 气血、灵力 ----
  function partyRegen(frac) {
    const h = S.hero; if (!h) return;
    if (h.maxhp) h.hp = Math.min(h.maxhp, Math.max(1, (h.hp || 0)) + Math.round(h.maxhp * frac));
    if (h.maxmp) h.mp = Math.min(h.maxmp, (h.mp || 0) + Math.round(h.maxmp * frac));
    for (const k of S.party || []) {
      try { const st = allyStats(k), a = allyState(k);
        a.hp = Math.min(st.maxhp, Math.max(1, a.hp || 0) + Math.round(st.maxhp * frac));
        a.mp = Math.min(st.maxmp, (a.mp || 0) + Math.round(st.maxmp * frac)); } catch (e) {}
    }
  }
  window.R134_partyRegen = partyRegen;
  endBattle = (orig => async function (win) {
    const r = await orig.apply(this, arguments);
    if (win) { try { partyRegen(.2); } catch (e) {} }
    return r;
  })(endBattle);

  // ---- 第 6 条：打完仗地图配乐没声 ----
  // 原因：停曲子的淡出计时器没人取消。同一首曲子刚接回来，0.8 秒后又被旧计时器暂停了，而看门狗以为它还在放。
  // 修法：任何曲子重新 play() 时取消它身上的淡出；淡出结束时如果它又成了当前曲子就不暂停；再加一个看门狗：当前曲子被暂停了 3 秒就接回来。
  { const Pm = HTMLMediaElement.prototype, op = Pm.play;
    Pm.play = function () { if (this.__r134fade) { clearInterval(this.__r134fade); this.__r134fade = 0; } return op.apply(this, arguments); }; }
  stopBgm = function (fade = .6) {
    const b = AUD.bgm; AUD.bgm = null; if (!b) return;
    if (b.s) { b.g.gain.cancelScheduledValues(AC.currentTime); b.g.gain.setValueAtTime(b.g.gain.value, AC.currentTime); b.g.gain.linearRampToValueAtTime(0, AC.currentTime + fade); b.s.stop(AC.currentTime + fade + .05); }
    else if (b.a) { const a = b.a; if (a.__r134fade) clearInterval(a.__r134fade); const v0 = a.volume, t0 = performance.now();
      const id = setInterval(() => { const k = (performance.now() - t0) / (fade * 1000);
        if (AUD.bgm && AUD.bgm.a === a) { clearInterval(id); a.__r134fade = 0; return; }   // 又被接回来当正曲了：别停
        if (k >= 1) { clearInterval(id); a.__r134fade = 0; a.pause(); } else a.volume = v0 * (1 - k); }, 50);
      a.__r134fade = id; }
  };
  { let q = 0; setInterval(() => { try {
    const b = AUD.bgm, stuck = b && b.a && b.a.paused && AUD.mode && !AUD.muted && freeNow();
    if (stuck) { if (++q >= 3) { q = 0; playBgm('bgm_shanmen', true); } } else q = 0;
  } catch (e) {} }, 1000); }

  // ---- 第 14 条：贪狼剑意的使用次数 ----
  // 每场战斗重新计数（开战时清零，保险起见再清一次）；到了凝丹境，追魂不限次数；到了引魂境，绝影也不限次数（上一个境界的杀招不再受限）
  startBattle = (orig => function () { const r = orig.apply(this, arguments); try { if (battle) battle.tanlangUsed = 0; } catch (e) {} return r; })(startBattle);
  const FREE_KILL = () => { const t = heroTier(), s = new Set(); if (t >= 1) s.add('tanlang'); if (t >= 2) s.add('jueying'); return s; };
  heroSkills = (orig => function () {
    const list = orig.apply(this, arguments); const b = battle, P = b && b.P; if (!P || P.ally) return list;
    const fk = FREE_KILL();
    for (const it of list) if (fk.has(it.k)) { it.desc = String(it.desc || '').replace(/（每战 \d+ 次）/, '') + (it.k === 'tanlang' ? '（凝丹境起不限次数）' : '（引魂境起不限次数）'); it.disabled = P.mp < it.cost; if (!it.disabled) it.why = ''; else it.why = '灵力不足'; }
    return list;
  })(heroSkills);
  doHeroAction = (orig => async function (k) {
    const b = battle, free = b && b.P && !b.P.ally && FREE_KILL().has(k), before = b ? (b.tanlangUsed || 0) : 0;
    try { return await orig.apply(this, arguments); } finally { if (free && battle === b && b) b.tanlangUsed = before; }   // 不限次数的那招不占杀招次数
  })(doHeroAction);

  // ---- 第 10 条：星痕剑比寒星剑还弱 / 专属加成 / 装备等级 ----
  // 星痕剑原来不加面板攻击（只加 +12 的佩剑加成），比寒星剑 24 还低。现在：星痕剑 攻击 28（+12 佩剑 = 40），中品玄器 36（+12 = 48）。
  // 专属：装备星痕剑时，九曜剑典的剑招（破军 / 贪狼 / 纳月 / 太阳 一系）威力 +30%，别的功法不吃这个加成。
  if (ITEM_DB.w_xinghen) Object.assign(ITEM_DB.w_xinghen, { atk: 28, heroOnly: true, desc: '叶孤星专属 · 专为九曜剑典打造的极品灵器。九曜剑典剑招威力 +30%，杀招每战多 1 次' });
  if (ITEM_DB.w_xinghen2) Object.assign(ITEM_DB.w_xinghen2, { atk: 36, heroOnly: true, desc: '叶孤星专属 · 星痕剑升为中品玄器。九曜剑典剑招威力 +30%，杀招每战多 1 次' });
  const isXH = id => id === 'w_xinghen' || id === 'w_xinghen2';
  applyItemStats = function (id, sign) {
    const it = ITEM_DB[id]; if (!it) return; const h = S.hero;
    for (const k of STATS) if (it[k]) h[k] += it[k] * sign;
    if (isXH(id)) h.sword = sign > 0;   // 星痕剑（两个品阶）都算佩剑：杀招多 1 次、佩剑 +12
    h.hp = Math.min(h.hp, h.maxhp); h.mp = Math.min(h.mp, h.maxmp);
  };
  // 老存档：已经装着星痕剑的补上新攻击（以前装上时没加面板攻击；10-29 的老存档补强已经补过 20 的，只补差 8）
  setInterval(() => { try { const h = S.hero, f = F(); if (!h || f.r134_xh) return; f.r134_xh = 1;
    const w = h.equip && h.equip.weapon; if (w === 'w_xinghen') h.atk += f.bal2 ? 8 : 28; } catch (e) {} }, 1500);
  const JIUYAO = new Set(['pojun', 'tianshu', 'xingluo', 'xingyun', 'tanlang', 'jueying', 'duopo', 'tunshi', 'sun']);
  dmgCalc = (orig => function (att, def, mult = 1, critRate) {
    try { const b = battle; if (b && att && att.side === 'hero' && !att.ally && def && def.side === 'enemy' && JIUYAO.has(b.curSk) && isXH(S.hero.equip && S.hero.equip.weapon)) mult *= 1.3; } catch (e) {}
    return orig.call(this, att, def, mult, critRate);
  })(dmgCalc);
  // 装备等级：装备有了「需要等级」，境界不够穿不上（剧情里直接给的装备不受限）
  const REQ = { w_wood: 1, w_qingfeng: 3, w_hantie: 8, w_chixiao: 12, w_hanxing: 6, w_xinghen: 6, w_xinghen2: 19, w_qingxiao: 10, w_yunlei: 12,
    a_cloth: 1, a_leather: 5, a_iron: 9, a_wolf: 10, a_liuyun: 9, a_nichang: 12, a_ziyun: 12, c_jade: 4, c_tusk: 6, c_token: 8 };
  for (const id in REQ) { const it = ITEM_DB[id]; if (!it || it.lvReq) continue; it.lvReq = REQ[id]; }
  for (const id in ITEM_DB) { const it = ITEM_DB[id]; if (it && it.slot && it.lvReq && !/需要境界/.test(it.desc || '')) it.desc = (it.desc || '') + '（需要境界：' + (typeof realmOf === 'function' ? realmOf(it.lvReq) : it.lvReq + ' 级') + '）'; }
  equipItem = (orig => function (id) {
    const it = ITEM_DB[id], h = S.hero;
    if (it && it.lvReq && h && (h.lv || 1) < it.lvReq && !world.locked && !dialog) { toast('境界不足：' + it.name + ' 需要' + (typeof realmOf === 'function' ? realmOf(it.lvReq) : it.lvReq + ' 级'), 2200); try { playSnd('ui_cancel'); } catch (e) {} return; }
    return orig.apply(this, arguments);
  })(equipItem);

  // ---- 第 1 条：开场 / 换图时露出老版人物建模 ----
  // 叶孤星的正式行走图还没载好时，不再画旧走路图；画面先盖一张封面（孤星问道），等行走图好了再揭开
  const walkOK = () => { try { return walkFinalReady || (window.WALK8 && WALK8.ready); } catch (e) { return true; } };
  if (typeof walkFinalDraw === 'function') walkFinalDraw = (orig => function (a) { const r = orig.apply(this, arguments); if (!r && a && a.key === 'w_yegx' && !walkOK()) return true; return r; })(walkFinalDraw);
  { let shown = 0, t0 = 0; S.overlay.push({ draw() {
    const need = S.scene === drawMap && world && world.player && !walkOK() && performance.now() - (window.__r134boot || (window.__r134boot = performance.now())) < 15000;
    if (need) { if (!shown) t0 = performance.now(); shown = Math.min(1, shown + .2); } else { shown = Math.max(0, shown - .06); if (!shown) return; }
    // 作者 11-08：老版封面载入（孤星问道封面 +「载入中……」）取消 → 用同一套 R157 插画载入画面
    ctx.save(); ctx.globalAlpha = shown; try { if (window.LOADING_LAYER) LOADING_LAYER.draw(Math.min(.95, (performance.now() - t0) / 6000)); else { ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, W, H); } } catch (e) {} ctx.restore(); } }); }

  // ---- 第 10 条（提示）：顶上那条长提示看不全 → 改成星旋在屏幕下方说一句（对话框样式，点击关闭）----
  const LONG = t => { const s = String(t || ''); return s.length >= 20 || /→|；/.test(s); };
  let TIP = null;
  if (typeof drawToast === 'function') drawToast = (orig => function (dt) {
    const t = S.toast; if (!t || !LONG(t.text) || (typeof battle !== 'undefined' && battle) || S.scene !== drawMap) { TIP = null; return orig.apply(this, arguments); }
    // 作者 11-07：星旋提示放到屏幕下方（和平常人物对话同一个位置、同一个框），点一下就关
    if (dialog || choice || sysPanel || world.locked) return;   // 有对话 / 弹窗 / 剧情时先等着
    const txt = String(t.text).replace(/^自由行动：/, ''); S.toast = null;
    try { void say('星旋', txt); } catch (e) {}
  })(drawToast);

  // ---- 第 13 条：后山历练必须打满 5 团兽火才能去测灵碑；打满领悟新技能「凝神」 ----
  const phaseB = () => !!F().ch1_free;
  tileSetMap = (orig => function (name) {
    const prev = world.mapName, f = F();
    const block = name === 'tj_front' && phaseB() && !f.ch1_hunt_done && prev && prev !== 'tj_front';
    if (!block) return orig.apply(this, arguments);
    f.ch1_free = 0;   // 让早期的「三日已到」弹窗这一次不出来
    let r; try { r = orig.apply(this, arguments); } finally { f.ch1_free = 1; }
    later(async () => {
      world.locked = true; world.path = null; world.walkTarget = null; if (world.player) world.player.moving = false;
      try {
        const n = Math.min(5, f.ch1_hunt || 0);
        await say('星旋', '等等！后山的兽火才打了 ' + n + ' 团，还差 ' + (5 - n) + ' 团。修为检测可不等人，练够了再来！');
        await say('星旋', '出小院北上云海大亭就是后山，碰到发光的兽火就会开打。');
        const back = (TMAPS.tj_front.exits || []).concat(TMAPS.tj_front.doors || []).find(e => e.to === prev && e.at);
        const st = TMAPS[prev] && TMAPS[prev].start;
        if (back) await goMap(prev, back.at[0], back.at[1], back.face || 'down');
        else if (st) await goMap(prev, st[0], st[1], 'down');
      } finally { world.locked = false; }
    }, 380);
    return r;
  })(tileSetMap);
  { const prevWin = window.SQ_ON_WIN; window.SQ_ON_WIN = async function (info) {
    if (prevWin) await prevWin(info);
    const f = F(); if (info && info.map === 'tj_houshan' && f.ch1_hunt_done && !f.r134_ningshen) {
      f.r134_ningshen = 1; const L = (S.sk4 || (S.sk4 = {})); L['hero.ningshen'] = 1;
      S.flash = .6; S.flashColor = '#fff3c0'; try { playSnd('jingle_levelup'); } catch (e) {}
      await say('星旋', '五团兽火打下来，你剑尖那点星光凝得越来越稳了——感觉到了吗？');
      await say('叶孤星·惊', '剑还没出，意先到了……这是？');
      await showPanel('领悟新技能', ['!凝神', '闭目凝意，星光聚于剑尖：自身下一招威力 +50%', '（战斗里「仙术」中可用，灵力 16）']);
      toast('领悟新技能：凝神', 1800);
      await say('星旋', '好了，五团兽火够数了。准备好了就去演武广场测灵碑！');
    } }; }
  // 任务栏写清楚
  later(() => { const tick = () => { const f = F(); if (phaseB() && !f.ch1_hunt_done && /三日后修为检测/.test(S.quest || '') && !/必须/.test(S.quest)) S.quest = S.quest.replace('后山历练（', '后山历练（必须完成 · '); };
    setInterval(() => { try { tick(); } catch (e) {} }, 800); });

  // ---- 第 20 条：天剑宗夜幕突然就来了 ----
  // 出发前夜（服凝元丹）设成了夜晚却没改回来，第二天清晨山门送别、下山的林子都还是黑夜。到了演武广场山门就恢复白天。
  tileSetMap = (orig => function (name) { const f = F();
    if (f.ch2_depart && !f.r134_dawn && name !== 'tj_room' && f.res_tod === 'night' && !(f.qz_shi && (/^qingzhu_/.test(name) || (window.QZ_CLOCK && QZ_CLOCK.zone(name))))) { f.r134_dawn = 1; try { RES_TOD(''); } catch (e) { f.res_tod = ''; } }
    return orig.apply(this, arguments); })(tileSetMap);

  // ---- 第 7 条：进新地图之前先问一声「是否进入 ××」，带地图名和图标 ----
  let stepping = false, ASK = null;
  if (typeof tileUpdate === 'function') tileUpdate = (orig => function () { stepping = true; try { return orig.apply(this, arguments); } finally { stepping = false; } })(tileUpdate);
  const KIND = [[/殿|阁|堂|宫|神殿/, '殿'], [/后山|崖|峰|山阶|山门|山/, '山'], [/竹/, '竹'], [/集市|市|商|铺|坊/, '市'], [/城|镇|村/, '城'], [/林|野|径|道/, '林'], [/洞|窟|秘境|地下|窖|墓/, '洞'], [/溪|湖|池|河|潭/, '水'], [/院|居|室|府|宅|房|舍/, '院'], [/谷|寨/, '谷'], [/广场|坪/, '坪']];
  const kindOf = title => { for (const [re, k] of KIND) if (re.test(title)) return k; return '途'; };
  goMap = (orig => async function (name, c, r, face) {
    const M = TMAPS[name];
    if (!stepping || !M || ASK || (typeof battle !== 'undefined' && battle) || name === world.mapName) return orig.apply(this, arguments);
    const title = String(M.title || M.name || name).replace(/^.*?·\s*/, s => s), p = world.player;
    world.locked = true; world.path = null; world.walkTarget = null; if (p) p.moving = false;
    ASK = { title, kind: kindOf(title), t0: performance.now() };
    let ok = 1; try { ok = await choose('是否进入「' + title + '」？', ['进入', '暂不进入']); } finally { ASK = null; }
    if (ok === 0) { world.locked = false; return orig.apply(this, arguments); }
    // 暂不进入：记住这个出口，站在上面不会再弹；往回退一步
    try { const T = world.map && world.map.T, d = T && (T.doors || []).find(e => e.to === name && (!e.at || (e.at[0] === c && e.at[1] === r))); if (d && world._spawnDoors) world._spawnDoors.add(d);
      if (p) { const back = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] }[p.face] || [0, 1]; p.x += back[0] * 40; p.y += back[1] * 40; } } catch (e) {}
    world.locked = false;
  })(goMap);
  if (typeof drawChoice === 'function') drawChoice = (orig => function () { orig.apply(this, arguments); if (!ASK || !choice) return;
    const k = Math.min(1, (performance.now() - ASK.t0) / 250), cx = W / 2, cy = H / 2 - 200, R = 64;
    ctx.save(); ctx.globalAlpha = k;
    const ic = IMG['mapicon_' + ASK.kind];
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, R * 1.9); g.addColorStop(0, 'rgba(255,226,150,.35)'); g.addColorStop(1, 'rgba(255,226,150,0)'); ctx.fillStyle = g; ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);
    if (ic && ic.width) ctx.drawImage(ic, cx - R, cy - R, R * 2, R * 2);
    else { const rg = ctx.createRadialGradient(cx - 18, cy - 22, 6, cx, cy, R); rg.addColorStop(0, '#2c3d66'); rg.addColorStop(1, '#0c1430'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = '#d8b26a'; ctx.stroke(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,236,190,.7)'; ctx.beginPath(); ctx.arc(cx, cy, R - 9, 0, 7); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + performance.now() / 4000; ctx.fillStyle = '#f3d38a'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (R + 10), cy + Math.sin(a) * (R + 10), 2.5, 0, 7); ctx.fill(); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `64px ${typeof BRUSH !== 'undefined' ? BRUSH : FONT}`; ctx.fillStyle = '#ffe6a8'; ctx.fillText(ASK.kind, cx, cy + 4); }
    ctx.restore(); })(drawChoice);

  // ---- 第 5 条：去拿剑时指引太弱 → 宝箱上方金色光柱 + 跳动箭头 + 主角身边的方向箭头 ----
  const findActor = nm => (world.actors || []).find(a => a.npc && a.npc.name === nm);
  const swordNeed = () => { const f = F(); return world.mapName === 'tj_houshan' && f.hs_explored && !f.hs_chest; };
  function beacon(a, now, label, col = [255, 214, 120]) {
    const x = a.x, y = a.y, rgba = al => `rgba(${col[0]},${col[1]},${col[2]},${al})`;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // 作者 11-10：原来的梯形光柱 + 两圈细环换成全游戏统一的任务光效（r186 QUEST_FX：暗图金、亮图蓝）
    if (window.QUEST_FX) { ctx.restore(); ctx.save(); QUEST_FX.orbs(ctx, x, y, now, 1); /* 作者 11-10：不要光柱和地上光环，改成金蓝白的大光点 */ ctx.restore(); ctx.save(); }
    else { const bh = 420, pulse = .55 + .45 * Math.sin(now * 3);
    const g = ctx.createLinearGradient(0, y - bh, 0, y); g.addColorStop(0, rgba(0)); g.addColorStop(.7, rgba(.22 * pulse + .1)); g.addColorStop(1, rgba(.5));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 26, y); ctx.lineTo(x - 12, y - bh); ctx.lineTo(x + 12, y - bh); ctx.lineTo(x + 26, y); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    const ay = y - 150 + Math.sin(now * 5) * 10; ctx.fillStyle = rgba(1); ctx.strokeStyle = 'rgba(60,30,0,.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, ay + 26); ctx.lineTo(x - 22, ay); ctx.lineTo(x - 9, ay); ctx.lineTo(x - 9, ay - 22); ctx.lineTo(x + 9, ay - 22); ctx.lineTo(x + 9, ay); ctx.lineTo(x + 22, ay); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (label) { ctx.font = `600 20px ${FONT}`; ctx.textAlign = 'center'; const w = ctx.measureText(label).width + 28; ctx.fillStyle = 'rgba(16,10,6,.82)'; roundRect(x - w / 2, ay - 66, w, 32, 16); ctx.fill(); ctx.strokeStyle = rgba(.9); ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#ffe6a8'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, ay - 50); }
    // 主角脚边指向目标的箭头（目标在屏幕外也能看到方向）
    const p = world.player; if (p) { const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy); if (d > 260) { const ux = dx / d, uy = dy / d, bx = p.x + ux * 95, by = p.y - 40 + uy * 70, an = Math.atan2(uy, ux);
      ctx.save(); ctx.translate(bx, by); ctx.rotate(an); ctx.globalAlpha = .65 + .35 * Math.sin(now * 6); ctx.fillStyle = rgba(1); ctx.strokeStyle = 'rgba(60,30,0,.9)'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(0, -16); ctx.lineTo(0, -7); ctx.lineTo(-20, -7); ctx.lineTo(-20, 7); ctx.lineTo(0, 7); ctx.lineTo(0, 16); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } }
    ctx.restore();
  }
  // 家具自己发光（衣柜）：外轮廓柔光 + 柜门缝里透出的光 + 往上飘的光点 + 小标签，不用大光柱
  function objGlow(o, now, label, col = [170, 220, 255]) {
    const im = IMG[o.img]; const rgba = al => `rgba(${col[0]},${col[1]},${col[2]},${al})`, pulse = .6 + .4 * Math.sin(now * 2.6);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (im && im.width) { ctx.save(); ctx.globalCompositeOperation = 'source-over';   // 亮色房间里加色看不出来：用彩色描边光晕（shadow）叠两遍，再把柜子本体盖回去
      for (const bl of [52, 30, 14]) { ctx.shadowColor = rgba(.95); ctx.shadowBlur = bl * (.7 + .5 * pulse); ctx.drawImage(im, o.x, o.y, o.w, o.h); }
      ctx.shadowBlur = 0; ctx.drawImage(im, o.x, o.y, o.w, o.h); ctx.restore();
      ctx.save(); ctx.globalAlpha = .18 + .14 * pulse; ctx.drawImage(im, o.x, o.y, o.w, o.h); ctx.restore(); }
    const cx = o.x + o.w * .7, cy = o.y + o.h * .45, g = ctx.createRadialGradient(cx, cy, 4, cx, cy, o.w * .55);
    g.addColorStop(0, rgba(.8 * pulse)); g.addColorStop(.45, rgba(.3 * pulse)); g.addColorStop(1, rgba(0)); ctx.fillStyle = g; ctx.fillRect(cx - o.w, cy - o.w, o.w * 2, o.w * 2);
    for (let i = 0; i < 14; i++) { const k = (now * .35 + i / 14) % 1, x = o.x + o.w * (.15 + .7 * ((i * 37 % 14) / 14)) + Math.sin(now * 2 + i) * 6, y = o.y + o.h * .9 - k * o.h * 1.1, r = 2 + (i % 3);
      ctx.fillStyle = rgba((1 - k) * Math.sin(k * Math.PI) * .9); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    if (label) { const x = o.x + o.w / 2, y = o.y - 26 + Math.sin(now * 3) * 4; ctx.font = `600 20px ${FONT}`; ctx.textAlign = 'center'; const w = ctx.measureText(label).width + 28;
      ctx.fillStyle = 'rgba(16,10,6,.8)'; roundRect(x - w / 2, y - 16, w, 32, 16); ctx.fill(); ctx.strokeStyle = rgba(.9); ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#e8f4ff'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y); }
    ctx.restore();
  }
  // 宝箱版的衣柜光效：宝箱是 R65_CHEST 画的，不是底图那张 → 用它自己再画几遍带蓝色外发光，再盖回本体
  function chestGlow(o, now, label, col = [120, 190, 255]) {
    const rgba = al => `rgba(${col[0]},${col[1]},${col[2]},${al})`, pulse = .6 + .4 * Math.sin(now * 2.6), st = R65_CHEST.styleOf ? R65_CHEST.styleOf(world.mapName) : undefined;
    ctx.save();
    for (const bl of [56, 32, 16]) { ctx.shadowColor = rgba(1); ctx.shadowBlur = bl * (.7 + .5 * pulse); R65_CHEST.draw(o.ax, o.ay, false, st, now); }
    ctx.shadowBlur = 0; R65_CHEST.draw(o.ax, o.ay, false, st, now);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .07 + .06 * pulse; R65_CHEST.draw(o.ax, o.ay, false, st, now); ctx.globalAlpha = 1;
    const cx = o.ax, cy = o.ay - o.h * .5, g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 70);
    g.addColorStop(0, rgba(.35 * pulse)); g.addColorStop(.45, rgba(.15 * pulse)); g.addColorStop(1, rgba(0)); ctx.fillStyle = g; ctx.fillRect(cx - 70, cy - 70, 140, 140);
    for (let i = 0; i < 14; i++) { const k = (now * .35 + i / 14) % 1, x = o.ax - 40 + 80 * ((i * 37 % 14) / 14) + Math.sin(now * 2 + i) * 6, y = o.ay - 6 - k * 110, r = 2 + (i % 3);
      ctx.fillStyle = rgba((1 - k) * Math.sin(k * Math.PI) * .95); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    if (label) { const x = o.ax, y = o.ay - o.h - 40 + Math.sin(now * 3) * 4; ctx.font = `600 20px ${FONT}`; ctx.textAlign = 'center'; const w = ctx.measureText(label).width + 28;
      ctx.fillStyle = 'rgba(16,10,6,.8)'; roundRect(x - w / 2, y - 16, w, 32, 16); ctx.fill(); ctx.strokeStyle = rgba(.9); ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#e8f4ff'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y); }
    ctx.restore();
  }
  window.R134_BEACON = { list: [] };   // 其他段落往这里放：{ map, name, label, when() }
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function (T, cam, now) {
    orig.apply(this, arguments);
    try { if (world.locked && !(world.player && world.player.moving)) {}
      if (swordNeed()) {   // 作者 11-10：寒星剑宝箱就用衣柜那种光效（物件自己发蓝光 + 上飘光点 + 小标签）
        const T = TMAPS[world.mapName], ch = T && T.baked && (T.baked.objs || []).find(o => o.id === 'treasure_chest_closed' && Math.abs(o.ax - 296) < 60 && Math.abs(o.ay - 811) < 60);
        if (ch && window.R65_CHEST && R65_CHEST.draw) chestGlow(ch, now, '寒星剑在这里'); else { const a = findActor('溪边岩隙宝箱'); if (a) beacon(a, now, '寒星剑在这里'); } }
      for (const B of window.R134_BEACON.list) { if (B.map !== world.mapName || !B.when()) continue; const lb = typeof B.label === 'function' ? B.label() : B.label; if (B.glowObj) { objGlow(B.glowObj, now, lb, B.col); continue; } if (B.npc) continue;   // 作者 11-10：剧情 / 找人有红色感叹号就够了，光效只给需要互动的特殊物品
        const a = findActor(typeof B.name === 'function' ? B.name() : B.name); if (a) beacon(a, now, lb, B.col); }
    } catch (e) {}
  })(tileAmbientHigh);

  // ---- 第 17 条：居室衣柜可以拾取 → 踏云靴（速度 +3、防御 +4），带拾取光效 ----
  { const R = TMAPS.tj_room; const sp = R && (R.npcs || []).find(n => n.name === '弟子服');
    // 作者 11-07：拾取点原来落在地上的「弟子服」坐垫上，挪到真正的衣柜（plain_cabinet）跟前；光效改成衣柜自己发光
    const cab = R.baked && (R.baked.objs || []).find(o => o.id === 'plain_cabinet');
    if (sp && cab) { sp.c = cab.ax / 64 - .5; sp.r = (cab.ay + 40) / 64 - .8; }
    if (sp) { const old = sp.talk; sp.name = '衣柜 · 弟子服'; sp.pick = () => !F().r134_boots;
      sp.talk = async function () { const f = F(); if (f.r134_boots) { if (typeof old === 'function') return old.apply(this, arguments); return narrate(Array.isArray(old) ? old[0] : '叠好的天剑宗弟子服。'); }
        world.locked = true; if (world.player) world.player.moving = false;
        try { f.r134_boots = 1; addItem('c_tayun', 1); S.flash = .3; S.flashColor = '#e8f6ff';
          await narrate('叶孤星翻开衣柜。叠好的弟子服下面，压着一双旧靴子——靴底绣着淡淡的流云纹。');
          if (window.itemGet) await itemGet([{ icon: 'item:c_tayun', name: '踏云靴', count: '×1', desc: ITEM_DB.c_tayun.desc }], '拾取');
          await say('星旋', '咦，这靴子有点意思，穿上走路轻快不少。去行囊里「饰品」栏换上吧！');
          const c = await choose('踏云靴', ['立刻换上', '先收进行囊']); if (c === 0) { equipItem('c_tayun'); toast('已装备踏云靴：速度 +3，防御 +4', 2200); }
        } finally { world.locked = false; } };
      window.R134_BEACON.list.push({ map: 'tj_room', name: '衣柜 · 弟子服', label: '衣柜里好像有东西', when: () => !F().r134_boots && !!S.flags.hs_meet, col: [170, 220, 255], glowObj: cab });
    } }

  // ---- 第 16 条：叶擎苍夜访时就把宝物交给叶孤星（从大殿挪到这里） ----
  window.R134_GIFT = async function () {
    const f = F(); if (f.r134_gift) return; f.r134_gift = 1;
    await narrate('叶擎苍从袖中取出几个精致的木盒，轻轻放在桌上。');
    await say('叶擎苍', '这是破空遁符。危机之时可撕裂空间，瞬间遁出千里之外，就连法相境修士也难以阻拦。');
    addItem('k_pokong'); if (window.itemGet) await itemGet([{ icon: 'item:k_pokong', name: '破空遁符', count: '×1', desc: ITEM_DB.k_pokong.desc }], '父亲所赠');
    await say('叶擎苍', '这是凝元丹。找个清净的时候自己服下，以你如今的根基，能直接冲到凝丹二重。');
    addItem('n_ningyuan'); if (window.itemGet) await itemGet([{ icon: 'item:n_ningyuan', name: '凝元丹', count: '×1', desc: ITEM_DB.n_ningyuan.desc }], '父亲所赠');
    await say('叶擎苍', '还有一件——流云仙衣。你出生那年，我就把它封进了后山的九曜锁灵阵里，用阵中灵脉替你温养了十八年。');
    await say('叶孤星·惊', '九曜……锁灵阵？');
    await say('叶擎苍', '那阵只认九曜之力。别人破不开，你能。趁今夜，就去后山把它取出来。');
    await say('叶擎苍', '还有这袋灵石，下山前去集市添些丹药，别亏着自己。');
    S.hero.gold = (S.hero.gold || 0) + 500; try { playSnd('ui_confirm'); } catch (e) {}
    await showPanel('父亲所赠', ['!灵石 ×500', '下山前去集市添些丹药、秘籍']);
    await say('星旋', '（九曜锁灵阵？你爹……果然什么都知道。）');
  };

  // ---- 第 17 条：星辰商店 + 炼器（星痕剑升为下品玄器），出发前夜让玩家自己动手一次 ----
  async function forgeAnim(ms = 2600) {
    const o = { t0: performance.now() }; S.overlay.push(o);
    o.draw = () => { const t = (performance.now() - o.t0) / ms, cx = W / 2, cy = H / 2; ctx.save(); ctx.fillStyle = `rgba(3,5,12,${.75 * Math.min(1, t * 4)})`; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(150,200,255,${.5 - i * .12})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 90 + i * 40 + Math.sin(t * 12 + i) * 6, t * 8 + i, t * 8 + i + 4.2); ctx.stroke(); }
      for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283 + t * 6, r = 260 * (1 - ((t * 1.6 + i / 40) % 1)); ctx.fillStyle = 'rgba(200,225,255,.8)'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .6, 2.5, 0, 7); ctx.fill(); }
      const core = Math.min(1, t * 1.4); const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 120 * core + 20); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(120,170,255,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 200, cy - 200, 400, 400);
      ctx.globalCompositeOperation = 'source-over'; try { itemIcon('w_xinghen', cx, cy, 64); } catch (e) {}
      ctx.textAlign = 'center'; ctx.font = `44px ${typeof BRUSH !== 'undefined' ? BRUSH : FONT}`; ctx.fillStyle = '#e8f1ff'; ctx.fillText('炼 器', cx, cy - 190); ctx.restore(); };
    playSnd('sfx_charge', .8); await sleep(ms * .8); playSnd('sfx_sword_ring'); S.flash = .9; S.flashColor = '#e8f1ff'; await sleep(ms * .2);
    (S.overlay.indexOf(o) >= 0 && S.overlay.splice(S.overlay.indexOf(o), 1));
  }
  window.R134_FORGE = async function () {
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
    const c2 = await choose('炼器　·　星痕剑 + 星辰砂', ['开始炼制（星痕剑 → 下品玄器）', '再想想']);
    if (c2 !== 0) await say('星旋', '想什么想！剑早一刻升阶，你在黑风寨就多一分底气。来——');
    if (h.bag && h.bag.m_xcsha) { h.bag.m_xcsha--; if (!h.bag.m_xcsha) delete h.bag.m_xcsha; }
    await forgeAnim();
    h.atk += 8; F().xh_grade = 1; if (ITEM_DB.w_xinghen) ITEM_DB.w_xinghen.name = '星痕剑·下品玄器';
    await showPanel('炼器成功', ['!星痕剑 → 下品玄器', '剑身浮现璀璨的星辰纹路', '攻击 +8']);
    await say('星旋', '以后别的装备也能炼——宗门铸剑师、各城铁匠都会精炼，材料打妖兽掉的就行。');
  };
  setInterval(() => { try { if (F().xh_grade && ITEM_DB.w_xinghen && !/玄器/.test(ITEM_DB.w_xinghen.name)) ITEM_DB.w_xinghen.name = '星痕剑·下品玄器'; } catch (e) {} }, 2000);

  // ---- 第 18 条：取得流云仙衣 → 专门的神器解锁界面；同时开启换装 ----
  window.R134_UNLOCK = function (opt) {
    return new Promise(res => {
      const o = { t0: performance.now(), done: false }; S.overlay.push(o); playSnd('jingle_levelup');
      o.draw = () => { const t = (performance.now() - o.t0) / 1000, cx = W / 2, cy = H / 2 - 30, k = Math.min(1, t / .5);
        ctx.save(); ctx.fillStyle = `rgba(3,6,14,${.82 * k})`; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter'; ctx.translate(cx, cy);
        for (let i = 0; i < 18; i++) { ctx.save(); ctx.rotate(i / 18 * 6.283 + t * .25); const g = ctx.createLinearGradient(0, 0, 420, 0); g.addColorStop(0, `rgba(220,236,255,${.22 * k})`); g.addColorStop(1, 'rgba(220,236,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(420, -36); ctx.lineTo(420, 36); ctx.lineTo(0, 10); ctx.fill(); ctx.restore(); }
        for (let i = 0; i < 26; i++) { const a = i * 2.39 + t * .6, r = 150 + (i * 37 % 120) + Math.sin(t * 2 + i) * 12; ctx.fillStyle = `rgba(235,245,255,${.5 * k})`; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r, Math.sin(a) * r * .55, 26, 9, a, 0, 7); ctx.fill(); }
        const g2 = ctx.createRadialGradient(0, 0, 4, 0, 0, 160); g2.addColorStop(0, `rgba(255,255,255,${.55 * k})`); g2.addColorStop(1, 'rgba(160,200,255,0)'); ctx.fillStyle = g2; ctx.fillRect(-170, -170, 340, 340);
        ctx.globalCompositeOperation = 'source-over'; const s = Math.min(1, t / .7); ctx.globalAlpha = k; try { itemIcon(opt.item, 0, 0, 78 * (0.6 + .4 * s)); } catch (e) {}
        ctx.translate(-cx, -cy); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `26px ${typeof BRUSH !== 'undefined' ? BRUSH : FONT}`; ctx.fillStyle = '#cfe0ff'; ctx.fillText(opt.kicker || '九曜神器 · 解锁', W / 2, cy - 200);
        ctx.font = `64px ${typeof BRUSH !== 'undefined' ? BRUSH : FONT}`; textOutline(opt.title, W / 2, cy + 150, '#fff3c8', 'rgba(20,14,4,.9)', 6);
        ctx.font = `600 22px ${FONT}`; ctx.fillStyle = '#e9e2cc'; (opt.lines || []).forEach((l, i) => ctx.fillText(l, W / 2, cy + 212 + i * 32));
        if (t > 1.2) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 4); ctx.font = `600 18px ${FONT}`; ctx.fillStyle = '#bcd0f0'; ctx.fillText('点击继续', W / 2, H - 40); }
        ctx.restore();
        if (t > 1.2 && input.tapped) { input.tapped = null; (S.overlay.indexOf(o) >= 0 && S.overlay.splice(S.overlay.indexOf(o), 1)); res(); }
      };
    });
  };
  // 换装：没拿到流云仙衣之前不开放；拿到之后提示可以在「换装」里自由切换
  window.R134_OUTFIT_OK = () => !!F().ch2_liuyun || !!F().r134_outfit;

  // ---- 第 19 + 21 条：天剑集市的购物引导；临走前云霆买《九天神雷》学会秘传 ----
  if (window.SK4_SHOP) SK4_SHOP = (orig => function () { const out = orig.apply(this, arguments) || []; if (!F().yt_jiutian && !out.includes('bk_yt_jiutian')) out.unshift('bk_yt_jiutian'); return out; })(SK4_SHOP);
  window.SK4_SHOP = SK4_SHOP;
  const SHOPLIST = [
    { id: 'p_small', n: 3, shop: '丹药铺', label: '回春丹 ×3' },
    { id: 'p_mp', n: 2, shop: '丹药铺', label: '回灵丹 ×2' },
    { id: 'bk_yt_jiutian', n: 1, shop: '典籍阁', label: '云霆秘传《九天神雷》' },
    { id: 'juan2', n: 1, shop: '典籍阁', label: '《剑诀·卷二》', opt: true },
  ];
  const buys = () => (F().r134_buy = F().r134_buy || {});
  const shopping = () => { const f = F(); return f.ch2_liuyun && !f.ch2_depart && f.ch2_market; };
  const itemDone = it => it.id === 'bk_yt_jiutian' ? !!F().yt_jiutian : (buys()[it.id] || 0) >= it.n;
  const nextItem = () => SHOPLIST.find(it => !it.opt && !itemDone(it)) || SHOPLIST.find(it => !itemDone(it));
  function shopQuest() { const parts = SHOPLIST.map(it => (itemDone(it) ? '✓' : '') + it.shop + ' ' + it.label + (it.id === 'bk_yt_jiutian' || it.opt ? '' : '（' + Math.min(it.n, buys()[it.id] || 0) + '/' + it.n + '）') + (it.opt ? '（有余钱再买）' : ''));
    const req = SHOPLIST.filter(it => !it.opt).every(itemDone);
    return '集市采买·' + (req ? '必买的都齐了，回问剑坪南边山门出发 · ' : '') + parts.join(' · '); }
  addItem = (orig => function (id, n = 1) { const r = orig.apply(this, arguments);
    try { if (shopping()) { const b = buys(); b[id] = (b[id] || 0) + n; } if (id === 'bk_yt_jiutian') later(() => whenFree(ytLearn), 50); } catch (e) {}
    return r; })(addItem);
  async function ytLearn() {
    const f = F(); if (f.yt_jiutian) return; f.yt_jiutian = 1; const h = S.hero; if (h.bag && h.bag.bk_yt_jiutian) { delete h.bag.bk_yt_jiutian; }
    world.locked = true; try {
      await say('云霆', '……《九天神雷》。典籍阁那本，我盯了三年。');
      await narrate('云霆捧着秘卷，指尖电光噼啪作响。片刻之后，一道细小的紫雷绕着他的手腕转了三圈，钻进了经脉。');
      S.flash = .7; S.flashColor = '#d8c8ff'; try { playSnd('sfx_thunder'); } catch (e) {}
      await showPanel('云霆 · 领悟秘传', ['!九天神雷', '引九天雷霆劈落全体，30% 麻痹', '（怒气满 100 时，在「秘传」中使用）']);
      await say('云霆', '……成了。黑风寨那帮人，正好拿来试雷。');
      if (shopping()) S.quest = shopQuest();
    } finally { world.locked = false; }
  }
  window.R134_YT_LEARN = ytLearn;
  setInterval(() => { try { if (shopping() && /集市采买|在天剑集市采买/.test(S.quest || '')) S.quest = shopQuest(); } catch (e) {} }, 800);
  // 第一次进集市：星旋把要买的东西一件件说清楚
  tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments);
    try { const f = F(); if (name === 'tj_market' && f.ch2_liuyun && !f.ch2_depart && !f.r134_shoptalk) { f.r134_shoptalk = 1;
      later(() => whenFree(async () => { world.locked = true; try {
        await say('星旋', '我给你列个单子，照着买准没错：');
        await say('星旋', '一、丹药铺：回春丹三颗、回灵丹两颗——打黑风寨，丹药就是命。');
        await say('星旋', '二、典籍阁：《九天神雷》——云霆那小子盯了三年的秘传，买下来他当场就能参悟，满怒气就是一记群体雷劈。');
        if ((S.party || []).includes('yunting')) await say('云霆', '……钱不够我自己补上。先看看再说。');
        await say('星旋', '三、有余钱再去典籍阁买《剑诀·卷二》，学过的招式拿它参悟到第二重。');
        await say('星旋', '要买的店，我在头顶给你点了金光，跟着走就行。点任务栏也能自动走过去。');
        S.quest = shopQuest(); } finally { world.locked = false; } }), 2600); } } catch (e) {}
    return r; })(tileSetMap);
  window.R134_BEACON.list.push({ npc: true, map: 'tj_market', name: () => (nextItem() || {}).shop, label: () => { const it = nextItem(); return it ? '买 ' + it.label : ''; }, when: () => shopping() && !!nextItem() });
  { const R = window.QUEST_ROUTE; if (R && Array.isArray(R.RULES)) R.RULES.unshift([/集市采买·/, () => { const it = nextItem(); return it ? { map: 'tj_market', pick: it.shop } : { map: 'tj_front' }; }]); }
  // 出发前：云霆还没学会九天神雷 → 他自己掏钱去买（剧情保证学会）
  window.R134_BEFORE_DEPART = async function () {
    const f = F(); if (f.yt_jiutian) return true;
    await say('云霆', '等等。（从怀里摸出一卷秘卷）自己掏钱买的。走之前，得先学会。');
    await ytLearn(); return true;
  };
})();
