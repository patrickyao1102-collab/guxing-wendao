// R211 作者 11-12 台词修订：叶孤星 × 云霆 改成兄弟情（不斗嘴调情）、云霆高冷少话、叶擎苍一直疼儿子、星旋是器灵。
// 旧台词散在 index.html 和好几个覆盖文件里（同一句有两三份）——这里统一在 say 最外层按「原句」改写：
//   值是 [[说话人, 台词], ...]（说话人 '' = 旁白）；空数组 = 这句删掉。键可以是「原句」或「说话人|原句」。
(function () {
  if (typeof say !== 'function') return;
  const YE = '叶孤星', YT = '云霆', XX = '星旋', DAD = '叶擎苍', SHOP = '玄兵阁掌柜';
  const RW = {
    '（可十八年过去，我连练气七重都迈不过去。他已经很久……没正眼看过我了。）': [[YE + '·伤', '（可十八年过去，我连练气七重都迈不过去。爹从没怪过我一句，还是把最好的都留给我……越是这样，我越没脸见他。）']],
    // 测灵碑后
    '三天后下山历练，跟我一组。': [[YT, '三天后下山历练，跟我一组，怎么样？']],
    '我命硬。': [[YT, '我命硬。']],
    '……行。那以后你就是我的护身符了，冰块脸。': [[YE + '·笑', '……行。那就这么定了，到时候别嫌我拖后腿。']],
    '……别乱起外号。': [[YT, '不会。']],
    '好的，冰块脸。': [],
    '啧啧啧，没想到你小子魅力还挺大啊。依我看，人家八成是看中你这个天煞孤星，能替他挡灾。': [[XX, '啧啧，天剑宗年轻一辈的第一人主动找你组队。依我看，他是看出你那一剑不简单，想就近摸摸你的底。']],
    '你少胡说八道，人家看中的分明是我的实力！': [[YE + '·大笑', '管他呢。有个靠得住的人同行，这趟下山稳了。']],
    // 大殿
    '宗主放心。我盯着，他死不了。': [[YT, '宗主放心。']],
    '叶孤星|喂！': [[YE + '·苦笑', '（爹，我哪里冒失了……）']],
    '下山之前，先去集市把丹药备齐。出发时，我在山门等你们。': [[DAD, '盘缠执事堂已经拨给你们了。下山之前，先去集市把丹药备齐。'], [DAD, '典籍阁你们两个也去看看，有用得上的功法就买下来。灵石该花就花，别在保命的东西上省。'], [YE, '是，爹。我正好想买一本《剑诀·卷二》。']],
    '典籍阁那本《九天神雷》……正好一起去看看。': [[YT, '我也有一本想买的。我参悟雷系功法多年，一直差最后一步。'], [YT, '阁里那本《九天神雷》，我想在下山之前把它买到手。'], [DAD, '嗯，去吧。出发时，我在山门等你们。']],
    '……《九天神雷》。典籍阁那本，我盯了三年。': [[YT, '……《九天神雷》。这本秘卷，我等了三年。']],
    '……成了。黑风寨那帮人，正好拿来试雷。': [[YT, '……成了。下山正好试试新修的功法。']],
    // 树下歇脚
    '真看不出来，以你的性格，竟然能老老实实地待在宗门里这么多年。': [[YT, '真看不出来，以你的性格，竟然能老老实实地待在宗门里这么多年。'], [YE, '没办法，我爹看得紧。你呢？你是怎么进的天剑宗？']],
    '……那这趟你跟紧点。天煞孤星，专克土匪。': [['', '叶孤星张了张嘴，却不知道该说什么。'], ['', '云霆也没有再开口。树荫下，只剩风吹叶子的声音。']],
    '……你话真多。': [[YE, '……云霆。从今往后，你就是我兄弟。这趟黑风寨，咱们一起把那帮土匪端了。']],
    '这叫活泼。': [[YT, '……嗯。']],
    '这叫吵。': [],
    '（点地面行走，点人说话。地图边缘的箭头通往其他地方。林子里的妖兽会追过来，小心！）': [],
    // 妖豹偷袭
    '没事，这衣服贵，抗揍。': [[YE + '·伤', '没事，我爹给我的衣服，抗揍。']],
    '……灾星。': [[YT, '……']],
    '喂，我刚救了你！……星旋，你这神仙前辈刚才怎么一声不吭？': [[YE, '（星旋，你这神仙前辈刚才怎么一声不吭？）']],
    // 林府夜谈
    '明天那个神秘高手，我来。你和林家的人盯住周虎他们就行。': [[YE, '正好，来喝点酒。']],
    '凭什么你来。': [['', '云霆没说话，接过了酒杯。']],
    '凭我比你帅。': [[YE, '你就穿这身弟子服去打黑风寨？身上连件像样的防御法宝都没有。'], [YT, '宗门发的，够用了。']],
    '云霆没忍住，嘴角动了一下。': [[YE, '（星旋，你那儿有没有好一点的防御法宝？）']],
    '……滚。': [], '好嘞。（拎起酒坛子就走）': [], '……酒留下。': [],
    '你小子只剩 240 星辰点，星陨战甲是买不起了。我这儿有件极品灵器星痕衣，算你 200 点。': [[XX, '星陨战甲你现在的星辰点还买不起。倒是有件极品灵器星痕衣，两百点，挡凝丹境的攻击足够了。']],
    '行，就这件星痕衣——给他。': [[YE, '（就它了。）'], ['', '叶孤星手一翻，一件泛着淡淡星光的内甲从储物袋中现了出来，递到云霆面前。']],
    '云霆|我不要。': [['', '云霆愣了一下。']],
    '又不是给你的，是给我自己保命的。你挂了，谁替我挡刀？': [[YE, '是兄弟就收下。'], ['', '云霆又愣了愣，低头看着那件衣服，半晌才伸手接过，嘴角微微扬起。他别过脸去喝了一口酒，没让叶孤星看见自己的眼神。'], [YT, '……谢了。'], [YE + '·大笑', '哟，原来你这闷葫芦也会说谢谢？'], [YT, '……喝你的酒。'], ['', '两只酒杯在月色下轻轻碰了一下。']],
    // 疗伤
    '我是玉佩，不是钱庄！……行行行，给你。': [[XX, '我是器灵，不是钱庄！……行行行，给你。']],
    // 第三章
    '啧啧，你那冰块兄弟今天又是一大早就没影了。练剑练得跟丢了魂似的。': [[XX, '啧啧，云霆那小子今天又是一大早就没影了。练剑练得跟丢了魂似的。']],
    '（悄悄）就照你那冰块兄弟的样子捏一个——冷着脸那种！': [[XX, '（悄悄）就照云霆那小子的样子捏一个——冷着脸那种！']],
    // 玄天城 · 青霄剑（记账：掌柜认得天剑宗少宗主）
    '叶孤星没有说话，把黑风寨抄来的全部家当，连同林家主硬塞的谢礼，一股脑儿全压在了柜台上。': [[SHOP, '咦……这位莫不是天剑宗的少宗主？叶宗主于小店有恩，少宗主看上的东西，哪有当场收钱的道理。'], [YE, '钱一分不会少你的。先记在我账上，回头让执事堂来结。']],
    '够、够了！成交！': [[SHOP, '好说好说！少宗主的账，小店放一百个心！']],
    '不要就扔。': [[YE, '是兄弟就拿着。']],
    '……这剑，我会还你。': [[YT, '……这份人情，我会还你的。']],
    '行啊，拿你斩的妖兽来还。一头算一百灵石。': [[YE + '·笑', '行，那我可等着了。']],
    '那得斩一百头！哈哈哈——': [[XX, '（这小子，倒是舍得。）']],
  };
  window.R211_RW = RW;
  say = (orig => function (who, text) {
    let seq = null;
    try { const base = String(who || '').split('·')[0]; seq = RW[base + '|' + text] || RW[text] || null; } catch (e) {}
    if (!seq) return orig.apply(this, arguments);
    return (async () => { for (const [w, t] of seq) await orig.call(this, w, t); })();
  })(say);

  // —— 云霆入队自带一件「天剑弟子服」（少量防御），换上星痕衣时才有对比 ——
  try { if (typeof ITEM_DB !== 'undefined' && !ITEM_DB.a_tjdizi) ITEM_DB.a_tjdizi = { name: '天剑弟子服', slot: 'armor', def: 3, maxhp: 20, price: 0, desc: '天剑宗发给内门弟子的制式道服，料子结实，防护聊胜于无。' }; } catch (e) {}
  setInterval(() => { try {
    if (typeof S === 'undefined' || !S.started || !S.flags || S.flags.r211_dz) return;
    if (!(S.party || []).includes('yunting') || !window.allyEqOf) return;
    S.flags.r211_dz = 1; const eq = allyEqOf('yunting'); if (!eq.armor) eq.armor = 'a_tjdizi';
  } catch (e) {} }, 1500);
  // —— 石桥下 · 切磋：叶孤星 对 云霆（一对一、点到为止）——
  function sparImg() {
    try {
      const im = IMG.b_yunting; if (!im || !(im.naturalWidth || im.width)) return false;
      if (IMG.e_yunting_spar && IMG.e_yunting_spar._src === im) return true;
      const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'); x.translate(w, 0); x.scale(-1, 1); x.drawImage(im, 0, 0); c._src = im; c.complete = true; c.naturalWidth = w; c.naturalHeight = h;
      IMG.e_yunting_spar = (window.R211_YT_FOE && R211_YT_FOE.ok) ? R211_YT_FOE.im : c; return true;
    } catch (e) { return false; }
  }
  // 作者 11-12：这一场叶孤星让着他——只带半血上场，云霆抢先一式「点星」直接分出胜负
  window.R211_SPAR = async function () {
    const ok = sparImg(), hero = S.hero, hp0 = hero.hp;
    hero.hp = Math.max(1, Math.round(hero.maxhp / 2));
    const foe = { name: '云霆', key: ok ? 'e_yunting_spar' : 'b_yunting', hp: 600, maxhp: 600, atk: 60, def: 14, spd: 30, h: 250, color: '#b8c4ff', fxColor: '#cfd8ff', slot: [330, 590],
      ai: async (e, b) => {
        try { floatText(W / 2, 220, '天剑一式·点星', '#cfe0ff', 70, 1.2, BRUSH); playSnd('sfx_charge'); } catch (x) {}
        await sleep(650);
        for (const P of (b.heroes || [b.P]).filter(u => u.alive)) { try { fx('fx3_slash_gold', { x: P.x, y: P.y - P.h * .5, scale: 1.25, alpha: 1.5 }); sparks(P.x, P.y - P.h * .5, 18, { speed: 460, size: .9 }); } catch (x) {} if (P.buffs) { delete P.buffs.def; delete P.buffs.shield; } P.shield = 0; applyDamage(P, P.hp + 99, true); }
        try { playSnd('sfx_sword_ring'); } catch (x) {} S.shake = 14; await sleep(700); return true; } };
    const pr = startBattle({ title: '石桥下 · 切磋', bg: 'bg_night', enemies: [foe], solo: true, exp: 0, gold: 0, normalBgm: true });
    try { battle.enemies[0].gauge = 99.5; (battle.main || battle.P).gauge = 0; } catch (e) {}
    let r; try { r = await pr; } finally { try { hero.hp = Math.max(1, Math.min(hero.maxhp, hp0)); } catch (e) {} }
    return r;
  };

})();

// —— 方烈对话立绘换成 Codex R211 新画的（红发高束、黑红甲、脸上一道旧刀疤，和新战斗建模同一个人）——
(function () {
  if (typeof IMG === 'undefined') return;
  const MAP = { default: 'p_c_fanglie_default', grin: 'p_c_fanglie_grin', angry: 'p_c_fanglie_angry', surprise: 'p_c_fanglie_surprise' };
  for (const [e, key] of Object.entries(MAP)) {
    const im = new Image(); let ok = false, old = IMG[key]; im.onload = () => { ok = true; }; im.src = 'portraits/fanglie_r211_' + e + '.webp';
    try { Object.defineProperty(IMG, key, { configurable: true, enumerable: true, get: () => (ok ? im : (old || IMG.__fl_def)), set: v => { old = v; } }); } catch (x) {}
    if (e === 'default') Object.defineProperty(IMG, '__fl_def', { configurable: true, enumerable: false, get: () => (ok ? im : old) });
    try { if (typeof MEDAL_FACE !== 'undefined') MEDAL_FACE[key] = { fx: .42, fy: .24, span: .4 }; } catch (x) {}
  }
  try { if (typeof SPEAKERS !== 'undefined') { const base = SPEAKERS['方烈'] || { color: '#ff7a8a' };
    SPEAKERS['方烈·怒'] = { p: MAP.angry, name: '方烈', color: base.color || '#ff7a8a' };
    SPEAKERS['方烈·惊'] = { p: MAP.surprise, name: '方烈', color: base.color || '#ff7a8a' }; } } catch (x) {}
})();

// —— 作者 11-12：《九天神雷》秘传在行囊里直接点「使用」→ 云霆领悟（和凝元丹一个用法）；买到手不再自动学会 ——
(function () {
  const JT = 'bk_yt_jiutian', isJT = id => id === JT;
  if (typeof useBtn === 'function') useBtn = (o => function (L) {
    const id = S.menu && S.menu.sel;
    if (isJT(id) && itemCount(id) && !(S.flags && S.flags.yt_jiutian)) return { x: L.body.x + L.body.w - 170, y: L.body.y + L.body.h - 92, w: 150, h: 56 };
    return o.apply(this, arguments);
  })(useBtn);
  if (typeof useItemOn === 'function') useItemOn = (o => function (id) {
    if (!isJT(id)) return o.apply(this, arguments);
    if (typeof battle !== 'undefined' && battle) { toast('战斗中不能参悟', 1400); return; }
    if (!(S.party || []).includes('yunting')) { toast('这是云霆的秘传——等他入队再用', 1800); return; }
    try { closeMenu(); } catch (e) { S.menu = null; world.locked = false; }
    setTimeout(() => { try { window.R134_YT_LEARN && R134_YT_LEARN(); } catch (e) {} }, 40);
  })(useItemOn);
})();
