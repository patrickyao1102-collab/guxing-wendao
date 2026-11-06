// ================= R135-C · 接入 Codex「修改1」C 装备图标 / D 技能书图标 / F 破空遁符 / I 地图图标 =================
// 素材在 r135c/（全部 webp）：eq_f / eq_u 装备图标图集（128px，8 列，有框 / 无框），books 技能书（8 款横排），
// pokong 破空遁符图标，pokong_fx 使用特效图集（1920×768，5×2，每帧 384），mapicons 地图徽章（4×3，每格 128，取自 512 母版缩小）。
// 只包装已有函数（itemIcon / UI_ICON2 / skillBanner / drawBattle / goMap），不改别的文件。
(function () {
  if (typeof ITEM_DB === 'undefined' || typeof ctx === 'undefined' || typeof IMG === 'undefined') return;
  const load = src => { const im = new Image(); im.onload = () => { im.__ok = 1; }; im.src = src; return im; };
  const ready = im => !!(im && im.__ok && im.naturalWidth);

  // ================= C · 装备图标 =================
  // 作者 11-07（第 10 条）：星痕剑和寒星剑图标一模一样 → 换成 Codex 一整套统一风格的装备图标，两把剑各自一张。
  // 图集顺序 = Codex manifest 顺序
  const EQ = ['xinghen', 'hanxing', 'xingchen', 'iron_sword', 'qinggang', 'zhufeng', 'liuhuo', 'leiming',
    'liuyun_robe', 'plain_robe', 'disciple_robe', 'xinghen_robe', 'leather_vest',
    'tayun_boots', 'cloth_shoes', 'wind_boots', 'iron_boots',
    'black_jade', 'ward_talisman', 'jade_bracelet', 'star_pendant', 'space_pouch'];
  const EQ_CN = ['星痕剑', '寒星剑', '星辰剑', '普通铁剑', '青钢剑', '逐风剑', '流火剑', '雷鸣剑', '流云仙衣', '普通道袍', '天剑弟子服', '星痕衣', '行旅皮衣',
    '踏云靴', '素布鞋', '疾风履', '玄铁靴', '墨玉佩', '护身符', '清心玉镯', '凝星坠', '纳物袋'];
  const EQF = load('r135c/eq_f.webp'), EQU = load('r135c/eq_u.webp');
  // 游戏里的装备 → Codex 图标。名字对得上的直接用；名字相近、样子相符的借同一张（青锋≈青钢、赤霄≈流火、青霄≈逐风、云雷≈雷鸣、寒铁≈铁剑、青布道袍≈普通道袍、兽皮软甲≈行旅皮衣）。
  // 桃木剑、玄铁软甲、狼皮大氅、云纹霓裳、紫云天罗甲、灵犀玉坠、铁背獠牙、黑煞令牌、雪狐尾坠 没有对应的，保留原来的图标。
  const BY_ID = {
    w_xinghen: 'xinghen', w_xinghen2: 'xingchen', w_hanxing: 'hanxing', w_hantie: 'iron_sword', w_qingfeng: 'qinggang',
    w_qingxiao: 'zhufeng', w_chixiao: 'liuhuo', w_yunlei: 'leiming',
    a_liuyun: 'liuyun_robe', a_cloth: 'plain_robe', a_leather: 'leather_vest',
    c_tayun: 'tayun_boots',
  };
  const xhUp = () => { try { return !!(S.flags && S.flags.xh_grade) || /玄器/.test(ITEM_DB.w_xinghen && ITEM_DB.w_xinghen.name || ''); } catch (e) { return false; } };
  // 以后别的补丁新加的装备：按中文名对上 Codex 名字（星痕衣、天剑弟子服、疾风履……）也能自动用上
  const nameCache = {};
  function eqKey(id) {
    if (id === 'w_xinghen') return xhUp() ? 'xingchen' : 'xinghen';   // 炼器升阶（下品玄器）后换成「星辰剑」那张：星辰纹更亮、紫银护手
    if (BY_ID[id]) return BY_ID[id];
    const it = ITEM_DB[id]; if (!it || !it.name) return null;
    const n = String(it.name);
    if (n in nameCache) return nameCache[n];
    const base = n.replace(/[（(·].*$/, '').trim();
    let i = EQ_CN.indexOf(n); if (i < 0) i = EQ_CN.indexOf(base);
    if (i < 0 && /^星痕剑/.test(n)) i = EQ.indexOf('xingchen');
    return (nameCache[n] = i >= 0 ? EQ[i] : null);
  }
  const eqDraw = (k, framed, x, y, s, c = ctx) => { const i = EQ.indexOf(k), im = framed ? EQF : EQU; c.drawImage(im, (i % 8) * 128, Math.floor(i / 8) * 128, 128, 128, x - s / 2, y - s / 2, s, s); };

  // ================= D · 技能书图标 =================
  // 作者 11-07（第 21 条）：技能书统一一套，书皮颜色按属性分（剑 / 雷 / 冰 / 火 / 风 / 治疗 / 秘传），九天神雷单独一张最华丽的
  const BK = ['book_sword', 'book_thunder', 'book_ice', 'book_fire', 'book_wind', 'book_heal', 'book_secret', 'jiutian_shenlei'];
  const BKI = load('r135c/books.webp');
  const OWNER = { hero: 'book_sword', yunting: 'book_thunder', linxue: 'book_ice', shenle: 'book_heal' };
  function bookKey(id) {
    const it = ITEM_DB[id]; if (!it || !it.book) return null;
    if (id === 'yujian') return null;                                    // 剑诀玉简是玉简不是书，保留原图
    const n = String(it.name || '');
    if (id === 'bk_yt_jiutian' || /九天神雷/.test(n)) return 'jiutian_shenlei';
    if (it.cat === '秘传' || /秘传/.test(n)) return 'book_secret';
    if (/雷/.test(n)) return 'book_thunder';
    if (/冰|霜|雪|寒/.test(n)) return 'book_ice';
    if (/火|焰|炎|焚|赤/.test(n)) return 'book_fire';
    if (/风|疾/.test(n)) return 'book_wind';
    if (/治|愈|回春|疗|乐谱|仙音|音/.test(n)) return 'book_heal';
    const who = it.sk4 && it.sk4.who; if (who && OWNER[who]) return OWNER[who];
    if (/^jp_|^juan/.test(id) || /剑/.test(n)) return 'book_sword';    // 叶孤星的剑谱、《剑诀》卷册
    return 'book_secret';
  }
  const bkDraw = (k, x, y, s) => ctx.drawImage(BKI, BK.indexOf(k) * 128, 0, 128, 128, x - s / 2, y - s / 2, s, s);

  // ================= F · 破空遁符图标 =================
  const PKI = load('r135c/pokong.webp');
  const isPokong = id => id === 'k_pokong' || id === 'k_poxu';

  // 破空遁符小图标用的圆底 + 品质圈（和 R59 原来的丹药、材料图标一样；符纸是象牙白，直接放在浅色行囊底上看不清）
  const QC = ['#9a8a70', '#5fbf73', '#5f9cf0', '#f0b43a'];
  function disc(x, y, r, q) {
    const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = QC[q]; ctx.stroke();
    if (q >= 2) { const a0 = ctx.globalAlpha; ctx.globalAlpha = a0 * .35; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = a0; }
  }
  const BIG = 44;   // 半径 ≥44（获得物品框、神器解锁、炼器演出）用无框大图；背包格 / 装备页 / 商店用有框版

  if (typeof itemIcon === 'function') itemIcon = (orig => function (id, x, y, r) {
    try {
      const ek = ready(EQF) && ready(EQU) && eqKey(id);
      if (ek) { ctx.save(); if (r >= BIG) eqDraw(ek, false, x, y, r * 2.15); else eqDraw(ek, true, x, y, r * 2.3); ctx.restore(); return; }
      const bk = ready(BKI) && bookKey(id);
      if (bk) { ctx.save(); bkDraw(bk, x, y, r * 2.45); ctx.restore(); return; }   // 书本身就是整块封皮，不用再垫圆底
      if (isPokong(id) && ready(PKI)) { ctx.save(); if (r < BIG) disc(x, y, r, 2); ctx.drawImage(PKI, x - r * 1.08, y - r * 1.08, r * 2.16, r * 2.16); ctx.restore(); return; }
    } catch (e) { try { ctx.restore(); } catch (e2) {} }
    return orig.apply(this, arguments);
  })(itemIcon);

  // 换装属性面板（r107_maps：剑印圆框里 UI_ICON2.draw(id, x, y, 66)）也用无框新图
  if (window.UI_ICON2) { const U = window.UI_ICON2, h0 = U.has, d0 = U.draw;
    U.has = k => !!((ready(EQU) && eqKey(k)) || (ready(BKI) && bookKey(k)) || (isPokong(k) && ready(PKI))) || h0(k);
    U.draw = (k, x, y, s) => {
      const ek = ready(EQU) && eqKey(k); if (ek) { eqDraw(ek, false, x, y, s * 1.02); return true; }
      const bk = ready(BKI) && bookKey(k); if (bk) { bkDraw(bk, x, y, s * 1.05); return true; }
      if (isPokong(k) && ready(PKI)) { ctx.drawImage(PKI, x - s / 2, y - s / 2, s, s); return true; }
      return d0(k, x, y, s);
    }; }

  // 宝箱拿到寒星剑的「获得物品」框用的是 IMG.ic_hanxing（r107 / early_bal 会往里写旧图）：固定成新的寒星剑
  { let old = IMG.ic_hanxing, cv = null;
    const mk = () => { if (cv || !ready(EQU)) return null; cv = document.createElement('canvas'); cv.width = cv.height = 128; eqDraw('hanxing', false, 64, 64, 128, cv.getContext('2d')); return cv; };
    try { Object.defineProperty(IMG, 'ic_hanxing', { configurable: true, enumerable: true, get: () => cv || mk() || old, set: v => { old = v; } }); } catch (e) {} }

  // ================= F · 破空遁符使用特效（逃跑时）=================
  // 作者 11-07（第 16 条）：带着破空遁符逃跑 → 主角身上先亮符：符纸燃起银光 → 撕开空间门 → 合拢消散（10 帧 10fps，末帧再淡出 0.15 秒），然后才结算逃没逃掉。
  // 逃跑流程在 battle_menu2.js 的闭包里（skillBanner 横幅 → sleep(500) → 掷骰）。这里在横幅出来那一刻起播特效，
  // 并把紧跟着的那一次 500ms 等待拉长到特效播完，骰子照原样掷。
  const FXI = load('r135c/pokong_fx.webp');
  let PK = null;   // { t0, u }
  const FX_DUR = 1.0, FX_FADE = .15;
  const heroUnit = b => { const hs = b.heroes || b.units.filter(u => u.side === 'hero'); return hs.find(u => u.key === 'b_yegx' && u.alive !== false) || hs.find(u => !u.ally && u.side === 'hero') || b.P; };
  if (typeof window.skillBanner === 'function') window.skillBanner = (orig => function (text, color, sub) {
    const r = orig.apply(this, arguments);
    try {
      const b = typeof battle !== 'undefined' && battle;
      if (b && /逃\s*跑/.test(String(text || '')) && /破空遁符/.test(String(sub || '')) && ready(FXI) && S.hero && S.hero.bag && S.hero.bag.k_pokong > 0) {
        PK = { t0: performance.now(), u: heroUnit(b) };
        try { playSnd('sfx_charge', .7); } catch (e) {}
        const st = window.setTimeout; let done = false;
        const restore = () => { if (!done) { done = true; window.setTimeout = st; } };
        window.setTimeout = function (fn, ms, ...rest) { restore(); if (ms >= 300 && ms <= 800) ms = Math.max(ms, (FX_DUR + FX_FADE) * 1000 + 60); return st.call(window, fn, ms, ...rest); };
        Promise.resolve().then(restore);   // 万一后面不是 sleep：本轮同步代码一结束就还原
      }
    } catch (e) { console.warn('R135C pokong', e); }
    return r;
  })(window.skillBanner);
  if (typeof drawBattle === 'function') drawBattle = (orig => function () {
    orig.apply(this, arguments);
    if (!PK) return; const b = typeof battle !== 'undefined' && battle; const t = (performance.now() - PK.t0) / 1000;
    if (!b || t > FX_DUR + FX_FADE || !ready(FXI)) { PK = null; return; }
    const u = PK.u || b.P; if (!u) return;
    const fi = Math.min(9, Math.floor(t * 10)), a = t <= FX_DUR ? 1 : Math.max(0, 1 - (t - FX_DUR) / FX_FADE);
    const hh = u.h || 240, s = Math.max(280, hh * 1.2), cx = u.x + (u.ox || 0), cy = u.y - hh * .45;   // 空间门中心对胸腹
    ctx.save(); ctx.globalAlpha = a; ctx.drawImage(FXI, (fi % 5) * 384, Math.floor(fi / 5) * 384, 384, 384, cx - s / 2, cy - s / 2, s, s); ctx.restore();
  })(drawBattle);

  // ================= I · 地图徽章（进门前「是否进入 ××」）=================
  // 作者 11-07（第 7 条）：进新地图前的提示配地图图标。r134_fix 的弹窗按地名算一个字（殿 / 山 / 竹…）去取 IMG['mapicon_'+字]；
  // 这里给每张地图指定 Codex 的 12 种徽章之一，进门那一刻把对应的徽章放到那个字的位置上（同一时间只会弹一个）。
  const MK = ['temple', 'mountain', 'bamboo', 'market', 'town', 'forest', 'cave', 'realm', 'waterside', 'estate', 'inn', 'library'];
  const MKI = load('r135c/mapicons.webp'), MCV = {};
  MKI.addEventListener('load', () => MK.forEach((k, i) => { const c = document.createElement('canvas'); c.width = c.height = 128; c.getContext('2d').drawImage(MKI, (i % 4) * 128, Math.floor(i / 4) * 128, 128, 128, 0, 0, 128, 128); MCV[k] = c; IMG['mapicon_' + k] = c; }));
  const MAP_KIND = {
    // 天剑宗
    tj_front: 'temple', tj_hall: 'temple', tj_market: 'market', tj_houshan: 'mountain', seal_field: 'mountain', tj_room: 'estate',
    tj_scripture: 'library', tj_library: 'library', tj_forbidden: 'library', tj_xiashan: 'forest',
    qingzhu_court: 'bamboo', qingzhu_stairs: 'bamboo', qingzhu_bamboo: 'bamboo', qingzhu_upper_pavilion: 'mountain', qingzhu_steward_room: 'estate',
    // 青阳镇
    qy_town: 'town', qy_inn: 'inn', qy_tavern: 'inn', qy_tea: 'inn', qy_herb: 'market', qy_smith: 'market', qy_grocery: 'market', qy_treasure: 'market', qy_house: 'estate',
    qy_escape: 'forest', qy_shelter: 'mountain', qy_defense: 'forest', qy_rescue: 'mountain', lin_forest: 'forest',
    // 林府
    lin_manor: 'estate', lin_court: 'estate', lin_guest_west: 'estate', lin_guest_east: 'estate', lin_guest_xue: 'estate', lin_study: 'estate',
    lin_yi_room: 'estate', lin_service: 'estate', lin_teahouse: 'estate', lin_servants: 'estate',
    // 黑风寨 / 落云岭
    hf_valley: 'forest', hf_camp: 'mountain', ly_ridge: 'forest', ly_midnorth: 'forest', ly_cave: 'cave', ly_valley: 'realm',
    // 玄天城
    xt_city: 'town', xt_manor: 'estate', xt_manor_hall: 'estate', xt_manor_recovery: 'estate', xt_manor_treasury: 'estate',
    xt_auction: 'market', xt_auction_vip: 'market', xt_wanbao: 'market',
    // 幽影林 / 女娲秘境
    m_yy_tiger: 'forest', m_yy_verge: 'forest', m_nw_creek: 'realm', m_nw_glade: 'realm', m_nw_stones: 'realm', m_nw_falls: 'waterside',
    m_nw_passage: 'realm', m_nw_temple: 'temple', m_nw_spring: 'waterside',
    // 苍月城
    m_cy_gate: 'town', m_cy_manor: 'estate', m_cy_council: 'estate', m_cy_study: 'estate', m_cy_bedroom: 'estate', m_cy_kitchen: 'estate',
    m_cy_guest: 'estate', m_cy_guiying: 'estate', m_cy_north: 'forest', m_xx_b1: 'cave', m_xx_b2: 'cave',
  };
  // 表里没有的（以后新加的地图）按地名归类
  const GUESS = [[/藏经|经阁|书库/, 'library'], [/客栈|酒楼|醉仙|茶馆|茶坊|楼$/, 'inn'], [/秘境|灵渊|幻境|仙境|神境/, 'realm'], [/殿|宗|宫|观|寺|庙/, 'temple'],
    [/集市|市|商|铺|坊|斋|拍卖|万宝/, 'market'], [/竹/, 'bamboo'], [/洞|窟|地下|密道|密室|窖|墓/, 'cave'], [/溪|湖|池|河|潭|瀑|泉|渡|岸/, 'waterside'],
    [/府|院|居|室|宅|房|舍|厢|堂|屋|庭/, 'estate'], [/城|镇|村|街/, 'town'], [/后山|崖|峰|岭|山阶|山门|营|寨/, 'mountain'], [/林|野|径|道|谷|郊|山/, 'forest']];
  function mapKind(name) {
    if (MAP_KIND[name]) return MAP_KIND[name];
    const bare = String(name).replace(/^[a-z]_(?=[a-z]+_)/, ''); if (MAP_KIND[bare]) return MAP_KIND[bare];
    const M = (typeof TMAPS !== 'undefined' && TMAPS[name]) || {}, t = String(M.title || M.name || name);
    for (const [re, k] of GUESS) if (re.test(t)) return k;
    return 'forest';
  }
  window.R135C_MAPKIND = mapKind;
  // r134_fix 里那一个字是怎么算的（照抄它的表，好知道徽章该放到哪个字上）
  const R134_KIND = [[/殿|阁|堂|宫|神殿/, '殿'], [/后山|崖|峰|山阶|山门|山/, '山'], [/竹/, '竹'], [/集市|市|商|铺|坊/, '市'], [/城|镇|村/, '城'], [/林|野|径|道/, '林'], [/洞|窟|秘境|地下|窖|墓/, '洞'], [/溪|湖|池|河|潭/, '水'], [/院|居|室|府|宅|房|舍/, '院'], [/谷|寨/, '谷'], [/广场|坪/, '坪']];
  const r134Char = title => { for (const [re, k] of R134_KIND) if (re.test(title)) return k; return '途'; };
  if (typeof goMap === 'function') goMap = (orig => function (name, c, r, face) {
    try { const M = typeof TMAPS !== 'undefined' && TMAPS[name]; const cv = MCV[mapKind(name)];
      if (M && cv) { const title = String(M.title || M.name || name); IMG['mapicon_' + r134Char(title)] = cv; } } catch (e) {}
    return orig.apply(this, arguments);
  })(goMap);

  window.R135C = { eqKey, bookKey, mapKind, EQ, BK, MK, test: { pokong: () => { PK = { t0: performance.now(), u: typeof battle !== 'undefined' && battle ? heroUnit(battle) : null }; } } };
})();
