// ================= R386 · 玉佩：星旋的任务与星辰宝库（只进测试版）=================
// 作者 11-27 晨：「你进了游戏之后，玩家最想玩什么是能留得住人的？你为什么想把时间花在这个游戏上？你想得到什么？
//                 一定要在这个游戏里练级、升级或者往剧情去推进。为什么不想玩两下就走？」
// 小说本身是「系统流」：玉佩里的器灵星旋发任务、给星辰点，星辰宝库里能换好东西。游戏里原来只在剧情里按剧本加减星辰点，
// 宝库没有真的开给玩家逛（星旋只在一处卖过星辰砂，还说了句「宝库里还有好东西」）。这里把它做成真的：
//   · 地图右下角多一枚「玉佩」钮（开场借力那一仗打完就有；有事可做时亮红点）。
//   · 任务：星旋发的事迹（斩妖 / 探索 / 修行），都是一次性的——做成了来领星辰点，星旋损你一句。
//   · 宝库：按境界分层。买得起的、买不起的都摆着——让人知道攒点数是为了什么、练到凝丹能换到什么。
//   · 幻境：星旋在玉佩里开的试炼（以后另一个文件接进来；没接之前这一页不显示）。
// 界面用作者选定的行囊「玄青星图」那套件（Codex R206 A 拆件，r209/），字由代码写，和行囊是一家。
// 星辰点就是原来的 S.hero.points：剧情里的加减照旧（它们本来就带兜底，不会因为玩家把点数花了而卡住）。
(function () {
  if (!window.WX5 || typeof S === 'undefined' || typeof cv === 'undefined' || typeof TMAPS === 'undefined') return;
  const F = () => (S.flags = S.flags || {});
  const J = () => { const f = F(); return f.jade || (f.jade = { claimed: {}, bought: {}, tab: 0 }); };
  const ST = () => WX5.stat();
  const hasXH = () => { try { const h = S.hero; return WX5.isXH(h.equip && h.equip.weapon) || !!(h.bag && (h.bag.w_xinghen || h.bag.w_xinghen2)); } catch (e) { return false; } };
  const xhN = () => Object.keys(WX5.XH().own).length;
  const inR = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const C = { ink: '#0B1921', gold: '#C2AD78', gold2: '#E9D9A8', text: '#E4DDC9', sub: '#A6AEA6', dim: '#667375', seal: '#B0483A', green: '#9FC98F', red: '#D98A78', blue: '#9CC3E8' };
  const BR = () => '"R201MS","GuxingWKB",' + BRUSH, KAI = () => '"R201WK",' + FONT, NUM = () => '"R201NS",' + FONT;
  const T = (s, x, y, size, col, font, wt, align) => { ctx.font = `${wt || 500} ${size}px ${font || KAI()}`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = col || C.text; ctx.fillText(s, x, y); };
  const fit = (s, maxW) => { let t = s; while (t.length > 2 && ctx.measureText(t).width > maxW) t = t.slice(0, -1); return t === s ? s : t.slice(0, -1) + '…'; };
  function wrap(s, x, y, w, lh, maxL) { let ln = '', n = 0; for (const ch of String(s || '')) { if (ctx.measureText(ln + ch).width > w && ln && !/[，。、；：！？」）…—]/.test(ch)) { ctx.fillText(ln, x, y + n * lh); ln = ch; if (++n >= maxL) return n; } else ln += ch; } if (ln) { ctx.fillText(ln, x, y + n * lh); n++; } return n; }

  // ---------- 行囊「玄青星图」的件 ----------
  const KIT = {}, NEED = ['curtain_9', 'panel_main_9', 'panel_detail_9', 'panel_well_9', 'card_n_9', 'card_s_9', 'card_d_9', 'button_n', 'button_p', 'button_d', 'category_n', 'category_s', 'tab_n', 'tab_s', 'relic_disc', 'skill_ring_n', 'skill_ring_s', 'skill_ring_unlearned', 'stat_medallion',
    'currency_bar_9', 'close_n', 'close_p', 'item_slot_n', 'item_slot_s', 'item_disc_n', 'icon_lock', 'bar_track_9', 'bar_exp_9', 'divider_h_3', 'skill_star_base', 'chart_arcs', 'label_blank_9', 'rank_lit', 'rank_dim', 'relic_socket_locked', 'star_corner'];
  const NINE = { curtain_9: [32, 32, 32, 32], panel_main_9: [18, 18, 18, 18], panel_detail_9: [18, 18, 18, 18], panel_well_9: [14, 14, 14, 14], card_n_9: [18, 18, 18, 18], card_s_9: [18, 18, 18, 18], card_d_9: [18, 18, 18, 18], button_n: [24, 14, 24, 14], button_p: [24, 14, 24, 14], button_d: [24, 14, 24, 14],
    category_n: [14, 10, 14, 10], category_s: [14, 10, 14, 10], currency_bar_9: [24, 14, 24, 14], close_n: [20, 12, 20, 12], close_p: [20, 12, 20, 12], item_slot_n: [14, 14, 14, 14], item_slot_s: [14, 14, 14, 14], bar_track_9: [10, 6, 10, 6], bar_exp_9: [10, 6, 10, 6], divider_h_3: [8, 0, 8, 0], label_blank_9: [16, 9, 16, 9] };
  let kitStarted = 0, kitOk = 0;
  function kitLoad() { const now = performance.now(); if (kitStarted && now - kitStarted < 12000) return; kitStarted = now; for (const n of NEED) { if (KIT[n]) continue; const im = new Image(); im.onload = () => { if (!KIT[n]) { KIT[n] = im; kitOk++; } }; im.src = 'r209/' + n + '.webp'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} } }
  const kitReady = () => kitOk >= NEED.length;
  function D(n, x, y, w, h) { const im = KIT[n]; if (!im) return; const e = NINE[n]; if (!e) { ctx.drawImage(im, x, y, w, h); return; }
    let [l, t, r, b] = e; const sw = im.width, sh = im.height, sl = l * 2, st2 = t * 2, sr = r * 2, sb = b * 2; if (l + r > w) { const k = w / (l + r); l *= k; r *= k; } if (t + b > h) { const k = h / (t + b); t *= k; b *= k; }
    const SX = [0, sl, sw - sr, sw], SY = [0, st2, sh - sb, sh], DX = [x, x + l, x + w - r, x + w], DY = [y, y + t, y + h - b, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const a = SX[i + 1] - SX[i], bb = SY[j + 1] - SY[j], c = DX[i + 1] - DX[i], d = DY[j + 1] - DY[j]; if (a > 0 && bb > 0 && c > 0 && d > 0) ctx.drawImage(im, SX[i], SY[j], a, bb, DX[i], DY[j], c, d); } }
  window.R386_KIT = { KIT, D, T, C, BR, KAI, NUM, fit, wrap, kitLoad, kitReady, inR };   // 今天别的面板（装备、剑炉）也用这一套件
  // Codex R383 的图标（到了就用）
  const ART = {}; function art(n) { let a = ART[n]; if (!a) { a = ART[n] = { im: new Image(), ok: false }; a.im.onload = () => { a.ok = true; }; a.im.src = 'r383/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(a.im); } catch (e) {} } return a.ok ? a.im : null; }
  function icon(it, cx, cy, size) { if (it.wx) { const d = KIT.item_disc_n; if (d) ctx.drawImage(d, cx - size / 2, cy - size / 2, size, size); const r = size * .2; [['mu', -1, -1], ['shui', 1, -1], ['huo', -1, 1], ['tu', 1, 1]].forEach(([el, dx, dy]) => WX5.emblem(el, cx + dx * r * .98, cy + dy * r * .98, r * .9, WX5.XH().own[el] ? 1 : .38)); return; }
    const im = it.art && art(it.art); if (im) { ctx.drawImage(im, cx - size / 2, cy - size / 2, size, size); return; }
    try { const ic = it.item && window.R370_ICON && R370_ICON(it.item); if (ic) { ctx.drawImage(ic, cx - size / 2, cy - size / 2, size, size); return; } } catch (e) {}
    const d = KIT.item_disc_n; if (d) ctx.drawImage(d, cx - size / 2, cy - size / 2, size, size); T(it.ch || it.name[0], cx, cy + 2, size * .42, C.gold2, BR(), 400, 'center'); }

  // ---------- 数得出来的事 ----------
  const countFlags = re => { let n = 0; for (const k in F()) if (re.test(k) && F()[k]) n++; return n; };
  const chests = () => countFlags(/^chest_/), picks = () => countFlags(/^pk_/);
  const sideDone = () => { try { return SQ_STATE().filter(q => q.s >= 3).length; } catch (e) { return 0; } };
  const ywDone = id => !!F()['yw_' + id], ywCount = () => (window.R370_YW || []).filter(y => ywDone(y.id)).length;
  const bookN = () => { try { return Object.keys(F().bestiary || {}).length; } catch (e) { return 0; } };
  const fbN = () => { try { return Object.keys(R370_FB.state().own || {}).length; } catch (e) { return 0; } };
  const fbRankMax = () => { try { return Math.max(0, ...R370_FB.list().filter(id => R370_FB.state().own[id]).map(id => R370_FB_RANK(id).r)); } catch (e) { return 0; } };
  const lv = () => (S.hero && S.hero.lv) || 1;
  const mapSwept = () => { try { let n = 0; for (const m in TMAPS) { const c = window.R379_COUNT && TMAPS[m] && TMAPS[m].mobs ? R379_COUNT(m) : null; if (c && c[1] > 0 && c[0] >= c[1]) n++; } return n; } catch (e) { return 0; } };

  // ---------- 星旋的任务（口气照 Gemini 的稿子，星旋是少年器灵，自称本神仙）----------
  const TASKS = [
    // 斩妖
    { id: 'z1', cat: '斩妖', name: '初试剑锋', desc: '打赢 3 场战斗', n: () => [ST().wins || 0, 3], pts: 20, quip: '总算没拿那根烧火棍丢本神仙的脸。这点星辰点，拿去换点防身的玩意儿。' },
    { id: 'z2', cat: '斩妖', name: '一物降一物', desc: '头一回打出「相克」', n: () => [Math.min(1, ST().ke || 0), 1], pts: 20, quip: '看见没有？是妖就有克它的东西。往后先看它名字旁边是什么性，再动手。' },
    { id: 'z3', cat: '斩妖', name: '专挑软肋', desc: '累计打出相克 15 次', n: () => [ST().ke || 0, 15], pts: 30, show: () => (ST().ke || 0) >= 1, quip: '眼睛总算不瞎了，知道挑软肋捅，比你前十八年闭着眼瞎挥剑强多了。' },
    { id: 'z4', cat: '斩妖', name: '以克制胜', desc: '用相克的属性打倒 10 只妖兽', n: () => [ST().keKill || 0, 10], pts: 30, show: () => (ST().ke || 0) >= 1, quip: '十只都是克死的？行，脑子总算比剑快了。' },
    { id: 'z5', cat: '斩妖', name: '百战之身', desc: '累计打赢 40 场战斗', n: () => [ST().wins || 0, 40], pts: 50, show: () => (ST().wins || 0) >= 3, quip: '四十场了？行，起码不是纸糊的了。' },
    { id: 'z6', cat: '斩妖', name: '以弱胜强', desc: '打倒一只比自己高两级以上的妖兽', n: () => [Math.min(1, ST().hi || 0), 1], pts: 30, show: () => (ST().wins || 0) >= 3, quip: '越级杀妖？胆子不小。下回腿别抖得那么明显。' },
    { id: 'z7', cat: '斩妖', name: '星纹三道', desc: '星痕剑点亮三道星纹', n: () => [Math.min(3, xhN()), 3], pts: 60, show: hasXH, quip: '三道了。再攒两道，天底下就没有你克不了的东西。' },
    { id: 'y1', cat: '斩妖', name: '撼山伏猪', desc: '讨伐妖王「撼山 · 铁背獠牙猪王」', n: () => [ywDone('boar') ? 1 : 0, 1], pts: 80, show: () => !!F().r370_fb0, quip: '皮糙肉厚的畜生全靠你硬扛。下回再不会看蓄力防御，本神仙可不替你收尸。' },
    { id: 'y2', cat: '斩妖', name: '幽林擒狼', desc: '讨伐妖王「啸月 · 苍狼妖将」', n: () => [ywDone('wolf') ? 1 : 0, 1], pts: 80, show: () => !!F().r370_fb0, quip: '总算学会趁它力竭喘气时下死手了。孺子可教，勉强够格当本神仙的宿主。' },
    { id: 'y3', cat: '斩妖', name: '榜上除名', desc: '讨伐榜上五只妖王全数伏诛', n: () => [(window.R370_YW || []).filter(y => !y.hidden && ywDone(y.id)).length, 5], pts: 200, show: () => ywCount() >= 1, quip: '五只都清了？……行吧，这回本神仙没什么可挑的。' },
    // 探索
    { id: 't1', cat: '探索', name: '顺手牵羊', desc: '打开 2 只宝箱', n: () => [chests(), 2], pts: 20, quip: '看见箱子就走不动道？……也好，起码知道往犄角旮旯里钻。' },
    { id: 't2', cat: '探索', name: '掘地三尺', desc: '累计打开 12 只宝箱', n: () => [chests(), 12], pts: 50, show: () => chests() >= 2, quip: '十二只。九州的箱子见了你都得绕道走。' },
    { id: 't3', cat: '探索', name: '拾遗', desc: '拾起 6 处灵光', n: () => [picks(), 6], pts: 25, quip: '地上亮一下你就捡，本神仙的宿主是属喜鹊的？' },
    { id: 't4', cat: '探索', name: '寸草不留', desc: '把一张野外地图的灵光拾尽', n: () => [Math.min(1, mapSwept()), 1], pts: 40, show: () => picks() >= 3, quip: '一张图刮得干干净净。山里的妖兽都没你勤快。' },
    { id: 't5', cat: '探索', name: '人间烟火', desc: '办完 3 桩街坊支线', n: () => [sideDone(), 3], pts: 40, quip: '整天替凡人找狗、查假账。小子，你这哪是修仙，分明是巡城司的编外捕快。' },
    { id: 't6', cat: '探索', name: '见多识广', desc: '图鉴收录 12 种', n: () => [bookN(), 12], pts: 40, show: () => bookN() >= 3, quip: '十二种了。记性比剑法强，也算一门本事。' },
    // 修行
    { id: 'x1', cat: '修行', name: '初破桎梏', desc: '修为突破到练气七重', n: () => [Math.min(lv(), 7), 7], pts: 20, quip: '卡了整整两年总算挪了一步。本神仙等得花都谢了，往后敢偷懒你就死定了。' },
    { id: 'x2', cat: '修行', name: '九重圆满', desc: '修为到练气九重', n: () => [Math.min(lv(), 9), 9], pts: 40, show: () => lv() >= 7, quip: '九重了。离凝丹就差一口气——别在这口气上给本神仙岔了。' },
    { id: 'x3', cat: '修行', name: '星力凝丹', desc: '踏入凝丹境', n: () => [Math.min(lv(), 10), 10], pts: 100, show: () => lv() >= 8, quip: '还算没白费本神仙的心血。不过凝丹在九州也就是个起步，少在那儿得意忘形。' },
    { id: 'x4', cat: '修行', name: '法宝在手', desc: '得到第一件法宝', n: () => [Math.min(1, fbN()), 1], pts: 20, quip: '有件法宝压箱底，起码挨揍的时候能多喘一口气。' },
    { id: 'x5', cat: '修行', name: '千锤百炼', desc: '把一件法宝祭炼到小成', n: () => [Math.min(1, fbRankMax()), 1], pts: 40, show: () => fbN() >= 1, quip: '人靠衣装剑靠炼，总算舍得往自己身上下功夫了。' },
    { id: 'x6', cat: '修行', name: '初入宝库', desc: '在星辰宝库里兑换一件东西', n: () => [Math.min(1, Object.keys(J().bought).length), 1], pts: 10, quip: '点数是拿来花的，攒着又不下崽。' },
  ];
  const tShown = t => !t.show || J().claimed[t.id] || (() => { try { return t.show(); } catch (e) { return false; } })();
  const tProg = t => { try { const [a, b] = t.n(); return [Math.min(a, b), b]; } catch (e) { return [0, 1]; } };
  const tDone = t => { const [a, b] = tProg(t); return a >= b; };
  const tClaimable = t => !J().claimed[t.id] && tShown(t) && tDone(t);

  // ---------- 星辰宝库 ----------
  const TIERS = [{ k: 1, name: '练气层', open: () => true, why: '' }, { k: 2, name: '凝丹层', open: () => lv() >= 10, why: '踏入凝丹境后开放' }, { k: 3, name: '引魂层', open: () => false, why: '修为还差得远——星旋说，到时候自然给你看' }];
  const bought = id => J().bought[id] || 0;
  const XW = [['mu', '木纹 · 克土'], ['shui', '水纹 · 克火'], ['huo', '火纹 · 克金'], ['tu', '土纹 · 克水']];
  const SHOP = [
    { id: 'xw', tier: 1, name: '星痕剑星纹', wx: 1, ch: '纹', price: 60, max: 4, tag: '五行', desc: '给星痕剑再点亮一道星纹（木 / 水 / 火 / 土里挑一道还没亮的）。亮了几道，叶孤星就能在几种属性之间换——战斗里轮到他时，点剑旁那枚星纹，一手换一回。', left: () => XW.filter(x => !WX5.XH().own[x[0]]).length, need: () => hasXH() ? '' : '要先有星痕剑',
      buy() {} },
    { id: 'ct', tier: 1, name: '淬体丹', art: 'x_cuiti', ch: '丹', price: 25, max: 3, tag: '丹药', desc: '叶孤星的气血上限永久 +30。宝库里一共三颗，吃完就没了。', buy() { const h = S.hero; h.maxhp += 30; h.hp = Math.min(h.maxhp, h.hp + 30); } },
    { id: 'jl', tier: 1, name: '聚灵丹', art: 'x_juling', ch: '丹', price: 25, max: 3, tag: '丹药', desc: '叶孤星的灵力上限永久 +12。宝库里一共三颗，吃完就没了。', buy() { const h = S.hero; h.maxmp += 12; h.mp = Math.min(h.maxmp, h.mp + 12); } },
    { id: 'jq', tier: 1, name: '剑气开路', art: 'x_jianqi', ch: '剑', price: 50, tag: '赶路', desc: '比你低三级以上的兽火，撞上直接一剑斩散，不必进战斗——修为和灵石照拿一半。回老地方找箱子时省事。', buy() {} },
    { id: 'yx', tier: 1, name: '引星符', art: 'x_jiefa', ch: '符', price: 80, tag: '星坠', desc: '战斗里每打出一次相克，符里攒一格星辉。攒满四格，它自己引下一道星光，砸向全体敌人。', buy() {} },
    { id: 'ny', tier: 2, name: '纳月诀', art: 'x_nayue', ch: '月', price: 150, tag: '续战', desc: '每次打出相克，出手的人回 6% 气血和 8 点灵力。赶路打怪几乎不用再嗑药。', buy() {} },
    { id: 'zp', tier: 2, name: '回锋阵盘', art: 'x_zhenpan', ch: '阵', price: 180, tag: '反击', desc: '我方挨打时，阵盘自动回敬一剑（挨打那人攻击的一半）。把挨打变成还手。', buy() {} },
    { id: 'qk', tier: 2, name: '乾坤囊', art: 'x_qiankun', ch: '囊', price: 200, tag: '法宝', desc: '带着它，法宝一场战斗能祭两回。（法宝要先去玄天城的讨伐榜上挣。）', buy() {} },
    { id: 'hz', tier: 2, name: '护主星符', art: 'x_duopo', ch: '护', price: 250, tag: '保命', desc: '每场战斗一次：我方有人被打倒时，星旋出手把他拉回来，留三成气血。', buy() {} },
    { id: 'xy', tier: 3, name: '星陨战甲', art: 'a_xingyun', ch: '甲', price: 1200, tag: '玄器', desc: '', buy() {} },
    { id: 'zk', tier: 3, name: '镇库之宝', art: 'x_baoku_lock', ch: '？', price: 0, tag: '？？？', desc: '', buy() {} },
  ];
  const sShown = it => !(it.hide && it.hide());
  const sLeft = it => it.left ? it.left() : (it.max || 1) - bought(it.id);
  const has = id => bought(id) > 0;
  window.R386_HAS = has;

  // ---------- 弹出界面 ----------
  const UI = { open: false, t0: 0, taps: [], say: '', sayT: 0 };
  try { cv.addEventListener('pointerdown', e => { if (!UI.open) return; UI.taps.push(toLogical(e)); e.stopImmediatePropagation(); e.preventDefault(); }, true); } catch (e) {}
  const QUIPS = ['有事说事。本神仙很忙的。', '盯着本神仙看什么？任务做了吗。', '点数是拿来花的，攒着又不下崽。', '想变强？榜上的事迹挨个做，别挑三拣四。', '宝库里的东西都是好东西——就看你够不够格。'];
  const speak = s => { UI.say = s; UI.sayT = performance.now(); };
  const P = { x: 124, y: 104, w: 1128, h: 596 }, LEFT = { x: 148, y: 128, w: 252, h: 548 }, BODY = { x: 418, y: 128, w: 812, h: 548 };
  const TABS = window.R384_OPEN ? ['任务', '宝库', '幻境'] : ['任务', '宝库'], tabR = i => ({ x: 30, y: 124 + i * 114, w: 76, h: 104 }), CLOSE = { x: 1136, y: 30, w: 118, h: 46 };
  const tabOn = i => i < 2 || !!window.R384_OPEN;
  let page = 0, cat = '全部', tier = 1, sel = null, arm = null, flash = null;

  function drawLeft(now) {
    D('panel_detail_9', LEFT.x, LEFT.y, LEFT.w, LEFT.h);
    const cx = LEFT.x + LEFT.w / 2, cy = LEFT.y + 86, r = 54;
    try { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = '#0c1c24'; ctx.fill(); ctx.clip(); const im = IMG[(SPEAKERS['星旋'] || {}).p || 'p_xx']; if (im) { const s = (r * 2.5) / (im.width * .5), w = im.width * s, h = im.height * s; ctx.drawImage(im, cx - w * .5, cy - h * .2, w, h); } ctx.restore(); } catch (e) { try { ctx.restore(); } catch (e2) {} }
    if (KIT.skill_ring_s) ctx.drawImage(KIT.skill_ring_s, cx - 68, cy - 68, 136, 136);
    T('星旋', cx, LEFT.y + 166, 30, C.gold2, BR(), 400, 'center'); T('玉佩器灵', cx, LEFT.y + 194, 15, C.sub, KAI(), 500, 'center');
    D('panel_well_9', LEFT.x + 14, LEFT.y + 214, LEFT.w - 28, 132);
    ctx.font = `500 16px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.text; const k = Math.min(1, (now - UI.sayT) / 28 / Math.max(1, UI.say.length)); wrap('「' + [...UI.say].slice(0, Math.ceil(UI.say.length * k)).join('') + (k >= 1 ? '」' : ''), LEFT.x + 28, LEFT.y + 238, LEFT.w - 56, 23, 5);
    // 宿主
    const h = S.hero, y0 = LEFT.y + 368; T('宿主', LEFT.x + 24, y0, 15, C.sub); T('叶孤星', LEFT.x + 70, y0, 18, C.text, KAI(), 600); T(h.realm || '', LEFT.x + LEFT.w - 24, y0, 16, C.gold, KAI(), 500, 'right');
    T('修为', LEFT.x + 24, y0 + 34, 15, C.sub); D('bar_track_9', LEFT.x + 70, y0 + 25, LEFT.w - 94, 18); const need = expNeed(h.lv), kk = Math.max(0, Math.min(1, (h.exp || 0) / need)); if (kk > .02) { ctx.save(); ctx.beginPath(); ctx.rect(LEFT.x + 70, y0 + 25, (LEFT.w - 94) * kk, 18); ctx.clip(); D('bar_exp_9', LEFT.x + 70, y0 + 25, LEFT.w - 94, 18); ctx.restore(); }
    T(Math.round(kk * 100) + '%', LEFT.x + 70 + (LEFT.w - 94) / 2, y0 + 34, 13, C.gold2, NUM(), 600, 'center');
    D('divider_h_3', LEFT.x + 20, y0 + 62, LEFT.w - 40, 3);
    T('星辰点', cx, y0 + 90, 15, C.sub, KAI(), 500, 'center'); T(String(h.points || 0), cx, y0 + 126, 44, C.blue, NUM(), 700, 'center');
    const nc = TASKS.filter(tClaimable).length; if (nc) T('有 ' + nc + ' 桩事迹可以交了', cx, y0 + 162, 15, C.green, KAI(), 500, 'center'); }

  function btn(r, label, state, size) { D(state === 'd' ? 'button_d' : state === 'p' ? 'button_p' : 'button_n', r.x, r.y, r.w, r.h); T(label, r.x + r.w / 2, r.y + r.h / 2 + 1, size || 19, state === 'd' ? C.dim : C.gold2, KAI(), 600, 'center'); }
  const chipR = (i, w) => ({ x: BODY.x + 6 + i * (w + 10), y: BODY.y + 4, w, h: 38 });
  function chip(r, label, on, dimmed) { D(on ? 'category_s' : 'category_n', r.x, r.y, r.w, r.h); T(label, r.x + r.w / 2, r.y + r.h / 2 + 1, 17, on ? C.gold2 : dimmed ? C.dim : C.text, KAI(), 600, 'center'); }

  // —— 任务页 ——
  const CATS = ['全部', '斩妖', '探索', '修行'], PER = 4;
  const taskList = () => { const l = TASKS.filter(t => tShown(t) && (cat === '全部' || t.cat === cat)); const rank = t => J().claimed[t.id] ? 2 : tDone(t) ? 0 : 1; return l.map((t, i) => [t, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || (rank(a[0]) === 1 ? (tProg(b[0])[0] / tProg(b[0])[1]) - (tProg(a[0])[0] / tProg(a[0])[1]) : 0) || a[1] - b[1]).map(a => a[0]); };
  const rowR = i => ({ x: BODY.x + 4, y: BODY.y + 54 + i * 112, w: BODY.w - 8, h: 104 }), claimR = r => ({ x: r.x + r.w - 150, y: r.y + 28, w: 130, h: 48 });
  const PG = { prev: { x: BODY.x + BODY.w / 2 - 150, y: BODY.y + BODY.h - 40, w: 96, h: 36 }, next: { x: BODY.x + BODY.w / 2 + 54, y: BODY.y + BODY.h - 40, w: 96, h: 36 } };
  function drawTasks(now) { const list = taskList(), np = Math.max(1, Math.ceil(list.length / PER)); page = Math.min(page, np - 1);
    CATS.forEach((c, i) => { const n = TASKS.filter(t => tClaimable(t) && (c === '全部' || t.cat === c)).length; chip(chipR(i, 108), c + (n ? ' · ' + n : ''), cat === c); });
    const done = TASKS.filter(t => J().claimed[t.id]).length; T('已交 ' + done + ' 桩', BODY.x + BODY.w - 12, BODY.y + 23, 15, C.sub, KAI(), 500, 'right');
    list.slice(page * PER, page * PER + PER).forEach((t, i) => { const r = rowR(i), cl = !!J().claimed[t.id], ok = tDone(t), [a, b] = tProg(t);
      ctx.save(); if (cl) ctx.globalAlpha = .55; D(ok && !cl ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h);
      if (KIT.stat_medallion) ctx.drawImage(KIT.stat_medallion, r.x + 22, r.y + 24, 56, 56); T(t.cat[0], r.x + 50, r.y + 54, 30, '#2a2114', BR(), 400, 'center');
      const dark = false; T(t.name, r.x + 98, r.y + 34, 27, dark ? '#2a2114' : C.gold2, BR(), 400); T(t.desc, r.x + 100, r.y + 70, 17, dark ? '#3a301e' : C.text, KAI(), 500);
      ctx.font = `600 16px ${NUM()}`; const nw = ctx.measureText(t.name).width; T(a + ' / ' + b, r.x + r.w - 300, r.y + 34, 17, dark ? '#3a301e' : (a >= b ? C.green : C.sub), NUM(), 600, 'right');
      const stI = art('x_xingchen'); if (stI) ctx.drawImage(stI, r.x + r.w - 290, r.y + 55, 30, 30); T((stI ? '' : '星辰点 ') + '+' + t.pts, r.x + r.w - (stI ? 256 : 286), r.y + 70, 19, dark ? '#2a4a78' : C.blue, NUM(), 700);
      ctx.restore();
      const cr = claimR(r); if (cl) { ctx.save(); ctx.translate(cr.x + cr.w / 2, cr.y + cr.h / 2); ctx.rotate(-.1); ctx.strokeStyle = C.seal; ctx.lineWidth = 2.5; ctx.globalAlpha = .9; ctx.strokeRect(-42, -19, 84, 38); T('已交', 0, 1, 22, C.seal, BR(), 400, 'center'); ctx.restore(); }
      else if (ok) { const pu = .5 + .5 * Math.sin(now / 240); ctx.save(); ctx.shadowColor = `rgba(233,217,168,${.35 + pu * .4})`; ctx.shadowBlur = 14; D('button_p', cr.x, cr.y, cr.w, cr.h); ctx.restore(); T('交　付', cr.x + cr.w / 2, cr.y + cr.h / 2 + 1, 19, '#fff3cf', KAI(), 700, 'center'); }
      else btn(cr, '未成', 'd'); });
    if (!list.length) T('这一类眼下没有事迹。', BODY.x + BODY.w / 2, BODY.y + 220, 19, C.sub, KAI(), 500, 'center');
    if (np > 1) { btn(PG.prev, '上一页', page > 0 ? 'n' : 'd', 16); btn(PG.next, '下一页', page < np - 1 ? 'n' : 'd', 16); T((page + 1) + ' / ' + np, BODY.x + BODY.w / 2, BODY.y + BODY.h - 21, 16, C.sub, NUM(), 600, 'center'); } }
  function tapTasks(tp) { const list = taskList(), np = Math.max(1, Math.ceil(list.length / PER));
    for (let i = 0; i < CATS.length; i++) if (inR(tp, chipR(i, 108))) { cat = CATS[i]; page = 0; snd('ui_click'); return; }
    if (np > 1) { if (inR(tp, PG.prev) && page > 0) { page--; snd('ui_click'); return; } if (inR(tp, PG.next) && page < np - 1) { page++; snd('ui_click'); return; } }
    const vis = list.slice(page * PER, page * PER + PER); for (let i = 0; i < vis.length; i++) { const t = vis[i], r = rowR(i); if (!inR(tp, r)) continue;
      if (tClaimable(t)) { J().claimed[t.id] = 1; S.hero.points = (S.hero.points || 0) + t.pts; speak(t.quip); flash = { t0: performance.now(), n: t.pts }; snd('jingle_levelup', .6); }
      else if (J().claimed[t.id]) speak(t.quip); else { const [a, b] = tProg(t); speak('「' + t.name + '」还差得远——' + a + ' / ' + b + '。做成了再来。'); snd('ui_click'); }
      return; } }

  // —— 宝库页 ——
  const cardR = i => ({ x: BODY.x + 4 + (i % 3) * 270, y: BODY.y + 54 + Math.floor(i / 3) * 142, w: 262, h: 134 }), DET = { x: BODY.x + 4, y: BODY.y + 342, w: BODY.w - 8, h: 202 }, BUY = { x: BODY.x + BODY.w - 216, y: BODY.y + 470, w: 196, h: 56 };
  const xwR = i => ({ x: DET.x + 150 + i * 158, y: DET.y + 132, w: 148, h: 54 });   // 星纹：一道一个钮
  const shopList = () => SHOP.filter(it => it.tier === tier && sShown(it));
  const QUIP = { yx: '符收好。专挑克它的打，攒满四格它自己会响——到时候站稳了看。', jq: '往后低你三级的小东西，撞上直接斩了，别耽误工夫。', ct: '吃了。气血厚一分，挨揍多撑一下。', jl: '吃了。灵力多一分，招就多放一次。', ny: '打出相克就回气回血——学会了这个，药钱能省一半。', zp: '阵盘摆上。谁打你，它替你还一剑。', qk: '法宝能祭两回了。头一回救急，第二回要命——自己掂量。', hz: '……本神仙不是每回都有空。一场只拉一回，别真当自己死不了。' };
  function drawShop(now) { TIERS.forEach((t, i) => chip(chipR(i, 124), t.name, tier === t.k, !t.open())); const tr = TIERS.find(t => t.k === tier), open = tr.open(), list = shopList(), pts = S.hero.points || 0, stI = art('x_xingchen');
    if (!open) T(tr.why, BODY.x + BODY.w - 12, BODY.y + 23, 15, C.red, KAI(), 500, 'right');
    list.slice(0, 6).forEach((it, i) => { const r = cardR(i), left = sLeft(it), sold = left <= 0, on = sel === it.id, locked = !open || it.tier === 3, dk = false;
      ctx.save(); if (sold) ctx.globalAlpha = .5; D(on ? 'card_s_9' : 'card_n_9', r.x, r.y, r.w, r.h); icon(it, r.x + 58, r.y + 62, 84);
      if (it.id === 'zk') { T('？？？', r.x + 112, r.y + 46, 24, dk ? '#2a2114' : C.dim, BR(), 400); T('尚未开放', r.x + 114, r.y + 84, 16, dk ? '#3a301e' : C.dim); ctx.restore(); return; }
      ctx.font = `400 24px ${BR()}`; T(fit(it.name, 138), r.x + 112, r.y + 40, 24, dk ? '#2a2114' : C.gold2, BR(), 400);
      T(it.tag + (it.max ? '　余 ' + Math.max(0, left) : ''), r.x + 114, r.y + 70, 15, dk ? '#3a301e' : C.sub);
      if (sold) T('已兑', r.x + 114, r.y + 102, 20, C.seal, BR(), 400); else { if (stI) ctx.drawImage(stI, r.x + 110, r.y + 88, 28, 28); T(String(it.price), r.x + (stI ? 142 : 114), r.y + 103, 22, locked ? C.dim : pts >= it.price ? (dk ? '#2a4a78' : C.blue) : (dk ? '#8a2a1c' : C.red), NUM(), 700); if (locked && KIT.icon_lock) ctx.drawImage(KIT.icon_lock, r.x + r.w - 44, r.y + 86, 24, 28); }
      ctx.restore(); });
    D('panel_well_9', DET.x, DET.y, DET.w, DET.h);
    const it = SHOP.find(s => s.id === sel && s.tier === tier);
    if (!it) { T('点一件货看看。买得起的、买不起的，都摆在这儿。', DET.x + 28, DET.y + 44, 18, C.sub); return; }
    if (it.tier === 3) { icon(it, DET.x + 76, DET.y + 78, 112); T(it.id === 'zk' ? '？？？' : it.name, DET.x + 150, DET.y + 40, 30, C.gold2, BR(), 400); ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub; wrap(it.id === 'zk' ? '封条还没揭。' : '陨铁打的胸甲，甲面像一片夜空。引魂层开了才换得到——眼下只能看看。', DET.x + 150, DET.y + 80, DET.w - 190, 25, 3); return; }
    icon(it, DET.x + 76, DET.y + 78, 112); T(it.name, DET.x + 150, DET.y + 40, 30, C.gold2, BR(), 400); T(it.tag, DET.x + 150 + (ctx.font = `400 30px ${BR()}`, ctx.measureText(it.name).width) + 18, DET.y + 44, 16, C.sub);
    ctx.font = `500 17px ${KAI()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.text; wrap(it.desc, DET.x + 150, DET.y + 78, DET.w - 150 - (it.wx ? 30 : 240), 25, it.wx ? 2 : 4);
    const left = sLeft(it), need = it.need ? it.need() : '', armed = k => arm && arm.id === k && now - arm.t < 3500;
    if (it.wx) { XW.forEach(([el, nm], i) => { const r = xwR(i), own = !!WX5.XH().own[el], k = 'xw_' + el, st = own || need || !open || pts < it.price ? 'd' : armed(k) ? 'p' : 'n'; D('button_' + st, r.x, r.y, r.w, r.h); WX5.emblem(el, r.x + 30, r.y + r.h / 2, 16, own ? .5 : 1); T(own ? '已点亮' : armed(k) ? '再点确认' : nm.slice(0, 2) + ' · ' + it.price, r.x + 54, r.y + r.h / 2 + 1, 17, st === 'd' ? C.dim : C.gold2, KAI(), 600); });
      if (need) T(need, DET.x + DET.w - 24, DET.y + 44, 16, C.red, KAI(), 500, 'right'); else if (pts < it.price && left > 0) T('还差 ' + (it.price - pts) + ' 点', DET.x + DET.w - 24, DET.y + 44, 16, C.red, KAI(), 500, 'right'); return; }
    if (left <= 0) btn(BUY, '已兑换', 'd'); else if (!open) btn(BUY, '尚未开放', 'd'); else if (need) btn(BUY, need, 'd', 16); else if (pts < it.price) btn(BUY, '还差 ' + (it.price - pts) + ' 点', 'd'); else btn(BUY, armed(it.id) ? '再点一次 · 确认' : '兑换 · ' + it.price + ' 点', armed(it.id) ? 'p' : 'n'); }
  function pay(it, quip) { const now = performance.now(); S.hero.points = (S.hero.points || 0) - it.price; J().bought[it.id] = bought(it.id) + 1; flash = { t0: now, n: -it.price }; snd('ui_confirm'); try { playSnd('jingle_levelup', .5); } catch (e) {} speak(quip || QUIP[it.id] || '归你了。'); }
  function tapShop(tp) { for (let i = 0; i < TIERS.length; i++) if (inR(tp, chipR(i, 124))) { tier = TIERS[i].k; sel = null; arm = null; snd('ui_click'); if (!TIERS[i].open()) speak(i === 1 ? '凝丹层？先凝了丹再说。看看也行，省得你不知道该攒多少。' : '引魂层的东西，本神仙现在给你看了也是白看。'); return; }
    const list = shopList().slice(0, 6); for (let i = 0; i < list.length; i++) if (inR(tp, cardR(i))) { sel = list[i].id; arm = null; snd('ui_click'); return; }
    const it = SHOP.find(s => s.id === sel && s.tier === tier), open = TIERS.find(t => t.k === tier).open(); if (!it || it.tier === 3 || !open) return;
    const pts = S.hero.points || 0, now = performance.now(), need = it.need ? it.need() : '';
    if (it.wx) { for (let i = 0; i < XW.length; i++) { const [el] = XW[i]; if (!inR(tp, xwR(i))) continue; if (WX5.XH().own[el]) { speak('这一道早就亮着了。'); snd('ui_click'); return; } if (need) { speak('星痕剑还没到手呢。先把剧情往下走——那把剑，本神仙给你留着。'); snd('ui_click'); return; }
        if (pts < it.price) { speak('还差 ' + (it.price - pts) + ' 点。任务榜上的事迹做了吗？'); snd('ui_click'); return; } const k = 'xw_' + el; if (!(arm && arm.id === k && now - arm.t < 3500)) { arm = { id: k, t: now }; snd('ui_click'); return; }
        arm = null; const o = WX5.XH(); o.own[el] = 1; o.cur = el; pay(it, WX5.WX[el].n + '纹亮了。打架轮到你时，点剑旁那枚星纹就能换——一手换一回。'); return; } return; }
    if (!inR(tp, BUY) || sLeft(it) <= 0) return; if (need) { speak(need + '。'); snd('ui_click'); return; }
    if (pts < it.price) { speak('还差 ' + (it.price - pts) + ' 点。任务榜上的事迹做了吗？'); snd('ui_click'); return; }
    if (!(arm && arm.id === it.id && now - arm.t < 3500)) { arm = { id: it.id, t: now }; snd('ui_click'); return; }
    arm = null; try { it.buy(); } catch (e) { console.warn('R386 buy', e); } pay(it); }

  function snd(n, v) { try { playSnd(n, v || .7); } catch (e) {} }
  function draw() { if (!UI.open) return; kitLoad(); const now = performance.now(), a = Math.min(1, (now - UI.t0) / 180); if (S.toast) { UI.heldToast = S.toast; S.toast = null; }
    ctx.save(); ctx.fillStyle = `rgba(5,13,19,${.9 * a})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
    if (!kitReady()) { T('玉佩微微发烫……', W / 2, H / 2, 22, C.gold2, KAI(), 500, 'center'); ctx.restore(); return; }
    D('curtain_9', 0, 0, W, H); if (KIT.skill_star_base) { ctx.save(); ctx.globalAlpha = a * .5; ctx.drawImage(KIT.skill_star_base, 300, 40, 900, 738); ctx.restore(); }
    ctx.font = `400 66px ${BR()}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; textOutline('玉佩', 26, 62, C.gold2, 'rgba(6,16,24,.85)', 6);
    TABS.forEach((t, i) => { const r = tabR(i), on = J().tab === i, ok = tabOn(i); ctx.save(); if (!ok) ctx.globalAlpha = a * .45; ctx.drawImage(on ? KIT.tab_s : KIT.tab_n, r.x, r.y, r.w, r.h); [...t].forEach((c, k) => T(c, r.x + r.w / 2, r.y + 36 + k * 32, 26, on ? '#2a2114' : C.gold2, BR(), 400, 'center'));
      const dot = i === 0 ? TASKS.some(tClaimable) : false; if (dot) { ctx.beginPath(); ctx.arc(r.x + r.w - 8, r.y + 10, 7, 0, 7); ctx.fillStyle = '#d9483a'; ctx.fill(); ctx.strokeStyle = '#fff2d0'; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); });
    D('close_n', CLOSE.x, CLOSE.y, CLOSE.w, CLOSE.h); T('关　闭', CLOSE.x + CLOSE.w / 2, CLOSE.y + CLOSE.h / 2 + 1, 19, C.gold2, KAI(), 600, 'center');
    D('panel_main_9', P.x, P.y, P.w, P.h); drawLeft(now);
    const tab = J().tab; if (tab === 0) drawTasks(now); else if (tab === 1) drawShop(now); else if (tab === 2 && window.R384_DRAW) { try { R384_DRAW(BODY, { D, T, KIT, C, BR, KAI, NUM, wrap, btn, art, speak }); } catch (e) { console.warn('R384 draw', e); } }
    if (flash) { const k = (now - flash.t0) / 1100; if (k >= 1) flash = null; else { ctx.save(); ctx.globalAlpha = a * (k < .7 ? 1 : (1 - k) / .3); T((flash.n > 0 ? '+' : '') + flash.n, LEFT.x + LEFT.w / 2 + 70, LEFT.y + 494 - k * 34, 30, flash.n > 0 ? C.green : C.red, NUM(), 700, 'center'); ctx.restore(); } }
    ctx.restore(); }
  try { S.overlay.push({ draw() { try { draw(); hud(); } catch (e) { console.warn('R386', e); try { ctx.restore(); } catch (e2) {} } } }); } catch (e) {}

  let closing = null;
  async function open(tab) { if (UI.open || (typeof battle !== 'undefined' && battle)) return; kitLoad(); const lock0 = world.locked, hud0 = S.hud; S.hud = false; world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    UI.open = true; UI.t0 = performance.now(); UI.taps.length = 0; if (tab != null) J().tab = tab; if (!tabOn(J().tab)) J().tab = 0; sel = null; arm = null; page = 0; snd('ui_open');
    const nc = TASKS.filter(tClaimable).length; speak(!F().r386_intro ? '任务榜和宝库，本神仙都给你开了。事迹做成了来交，点数拿去宝库换东西——别攒着。' : nc ? '有 ' + nc + ' 桩事迹做成了，还不快交？' : QUIPS[Math.floor(Math.random() * QUIPS.length)]); F().r386_intro = 1;
    // 开场那段戏的前提是「正版剑典要一百点，叶孤星只有十点，所以去藏经阁拿残本抵九成」。现在拿剑典之前也攒得到点数了，星旋把这笔账说一句，免得对不上
    try { if (!F().jiuyao_full && !F().res_fixed && !F().ch1_free && !F().ch2_roam && (S.hero.points || 0) >= 70 && !F().r386_jy) { F().r386_jy = 1; speak('点数攒起来了？别打歪主意——正版剑典一百点，拿残本来抵只收十点。省下的九十点够你在宝库换好几样。老老实实去藏经阁。'); } } catch (e) {}
    let res; try { for (;;) { await nextFrame(); const tp = UI.taps.shift(); if (!tp) { if (closing) { res = closing; break; } continue; } if (!kitReady()) continue;
        if (inR(tp, CLOSE)) break; let hitTab = false; for (let i = 0; i < TABS.length; i++) if (inR(tp, tabR(i))) { hitTab = true; if (!tabOn(i)) { speak('幻境还没开。等本神仙收拾好了叫你。'); snd('ui_click'); } else if (J().tab !== i) { J().tab = i; sel = null; arm = null; page = 0; snd('ui_click'); } } if (hitTab) continue;
        const tab2 = J().tab; if (tab2 === 0) tapTasks(tp); else if (tab2 === 1) tapShop(tp); else if (tab2 === 2 && window.R384_TAP) { const r = R384_TAP(tp, BODY, { speak, snd }); if (r) { res = r; break; } } } }
    finally { UI.open = false; closing = null; world.locked = lock0; S.hud = hud0; try { input.tapped = null; } catch (e) {} snd('ui_click'); if (UI.heldToast) { const t = UI.heldToast; UI.heldToast = null; try { if (!/^(晌午|清晨|黄昏|入夜|午时|子时|天亮|夜深)/.test(t.text || '')) toast(t.text, t.ms); } catch (e) {} } }
    return res; }
  window.R386 = { open, has, TASKS, SHOP, J, claimable: () => TASKS.filter(tClaimable).length, close(r) { closing = r || 'close'; }, isOpen: () => !!UI.open };

  // ---------- 地图上的玉佩钮 ----------
  const HB = { x: 1066, y: 614, w: 88, h: 88 };
  const unlocked = () => !!(F().xlw_seen || F().r386_intro || F().hs_explored);
  const hudOn = () => world.map && S.scene === drawMap && S.hud && !world.locked && !dialog && !choice && !sysPanel && !S.menu && !(typeof battle !== 'undefined' && battle) && !UI.open && unlocked();
  try { cv.addEventListener('pointerdown', e => { if (UI.open || !hudOn()) return; const p = toLogical(e); if (!inR(p, HB)) return; e.stopImmediatePropagation(); e.preventDefault(); try { input.tapped = null; } catch (e2) {} open(); }, true); } catch (e) {}
  const JB = {}; const jbtn = n => { let o = JB[n]; if (!o) { o = JB[n] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r389i/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
  let lastN = -1, nudgeT = 0;
  function hud() { if (!hudOn()) return; kitLoad(); const now = performance.now(), cx = HB.x + 44, cy = HB.y + 40, nc = TASKS.filter(tClaimable).length, pu = .5 + .5 * Math.sin(now / 300);
    ctx.save();
    // 11-27：钮子换成 Codex R389 画的玉佩钮（和右边行囊钮成对，「玉佩」两个字画在钮里）；有事迹可交时用发光的那一张
    const bim = jbtn(nc ? 'jade_btn_glow' : 'jade_btn') || jbtn('jade_btn');
    if (bim) { const s = 96 + (nc ? pu * 3 : 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bim, cx - s / 2, cy + 4 - s / 2, s, s); }
    else { ctx.beginPath(); ctx.arc(cx, cy + 2, 40, 0, 7); ctx.fillStyle = 'rgba(8,10,12,.5)'; ctx.fill(); ctx.font = `700 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textOutline('玉佩', cx, HB.y + 90, '#ffe9a0', '#2a1000', 4); }
    if (nc) { ctx.beginPath(); ctx.arc(HB.x + 74, HB.y + 12, 11, 0, 7); ctx.fillStyle = '#d9483a'; ctx.fill(); ctx.strokeStyle = '#fff2d0'; ctx.lineWidth = 2; ctx.stroke(); T(String(nc), HB.x + 74, HB.y + 13, 14, '#fff', NUM(), 700, 'center'); }
    ctx.restore();
    // 有事迹刚做成：提醒一句（短，不变成星旋对话）
    if (lastN >= 0 && nc > lastN && now - nudgeT > 4000) { nudgeT = now; const t = TASKS.find(tClaimable); try { toast('事迹达成 · ' + (t ? t.name : ''), 2200); } catch (e) {} } lastN = nc; }
  setTimeout(kitLoad, 7000);
})();
