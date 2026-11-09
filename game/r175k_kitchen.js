// ================= R175 · 厨房新菜：菜园、果树、畜舍、钓鱼潭的收获进西院厨房 =================
// 成菜图：第 9 批 10 道 + R166 五道（r175g/dishes.webp，5 列 × 192），钓鱼潭 7 道（r175f/dish.webp，一排 7 格 × 192）。
// 新食材是菜园 / 钓鱼潭收来的物品（r175i_* / fish_*）：名字 → 物品登记给 r139 的 ING_ID，案板和菜谱卡用它们的行囊图标。
// 选菜界面按页归类：家常 / 菜园 / 果子 / 鱼鲜。切西瓜不过火（pot: 'cold'）。新菜也能送给院里的人（r162 送吃的）。
(function () {
  const RS = window.R139_RECIPES; if (!RS || typeof ITEM_DB === 'undefined') return;
  const SRC = k => (window.R162_ASSETS && R162_ASSETS[k]) || k;

  // ---------- 名字 → 物品 ----------
  const FARM = { 萝卜: 'radish', 香葱: 'scallion', 甜豌豆: 'pea', 金瓜: 'pumpkin', 西瓜: 'watermelon', 红薯: 'yamred', 莲藕: 'lotus_root', 茭白: 'water_bamboo', 星露灵草: 'stardew',
    桃: 'peach', 李子: 'plum', 梨: 'pear', 柿子: 'persimmon', 灵果: 'spirit_fruit', 葡萄: 'grape', 鸭蛋: 'duck_egg', 鹅蛋: 'goose_egg', 羊奶: 'goat_milk', 牛奶: 'cow_milk' };
  const FISHN = { 鲫鱼: 'crucian', 白条: 'minnow', 草鱼: 'grass_carp', 青虾: 'shrimp', 鲤鱼: 'carp', 鳜鱼: 'perch', 银鳞鱼: 'silver_scale', 星斑鱼: 'starfish' };
  const EX = window.R139_EXTRA_ING = window.R139_EXTRA_ING || {};
  for (const n in FARM) EX[n] = 'r175i_' + FARM[n];
  for (const n in FISHN) EX[n] = 'fish_' + FISHN[n];
  const TREEF = { 桃: 1, 李子: 1, 梨: 1, 柿子: 1, 灵果: 1, 葡萄: 1 }, ANIM = { 鸭蛋: 1, 鹅蛋: 1, 羊奶: 1, 牛奶: 1 };
  // 缺料时告诉玩家去哪儿弄（集市灶膳摊只卖原来那 12 样）
  window.R139_WHERE = n => FISHN[n] ? '后庭潭里钓' : TREEF[n] ? '菜园果树上摘' : ANIM[n] ? '菜园畜舍里收' : FARM[n] ? '菜园里种' : null;
  // 案板、菜谱卡上的食材：用它们的行囊图标（itemIcon 以中心和半径画，菜园格 r×2.3、鱼格 r×2.4）
  window.R139_ING_ART = (n, x, y, s) => { const id = EX[n]; if (id && typeof itemIcon === 'function') itemIcon(id, x + s / 2, y + s / 2, s / 2.35); };

  // ---------- 新菜 ----------
  // art：[图集, 格号]；pg：选菜第几页（0 家常 / 1 菜园 / 2 果子 / 3 鱼鲜）
  const NEW = [
    { id: 'cook_danbing', name: '葱花蛋饼', pot: 'wok', ing: ['鸡蛋', '香葱'], hp: 220, mp: 40, rage: 20, pg: 0, art: ['g', 10], desc: '菜园里拔的香葱切碎了摊进蛋里，两面煎得金黄。' },
    { id: 'cook_wandou', name: '豌豆炒蛋', pot: 'wok', ing: ['甜豌豆', '鸡蛋'], hp: 240, mp: 60, rage: 20, pg: 1, art: ['g', 13], desc: '甜豌豆一粒粒剥出来，和鸡蛋一起炒，绿的绿、黄的黄。' },
    { id: 'cook_luobo', name: '萝卜鹅蛋汤', pot: 'soup', ing: ['萝卜', '鹅蛋', '青菜'], hp: 340, mp: 80, rage: 30, pg: 1, art: ['g', 14], desc: '萝卜炖得透亮，鹅蛋卧在汤里，汤清味甜。' },
    { id: 'cook_jingua', name: '金瓜灵米粥', pot: 'soup', ing: ['金瓜', '灵米', '红枣'], hp: 440, mp: 120, rage: 40, pg: 1, art: ['g', 11], desc: '金瓜熬化在灵米粥里，糯糯的，透着红枣香。' },
    { id: 'cook_hetang', name: '荷塘小炒', pot: 'wok', ing: ['莲藕', '茭白', '甜豌豆'], hp: 320, mp: 120, rage: 30, pg: 1, art: ['g', 8], desc: '莲藕、茭白、甜豌豆一锅快炒，脆生生的，一口荷塘味。' },
    { id: 'cook_hongshu', name: '烤红薯', pot: 'wok', ing: ['红薯', '蜂蜜'], hp: 300, mp: 30, rage: 30, pg: 1, art: ['g', 6], desc: '铁锅里焖得流了糖，剥开烫手，满屋子甜香。' },
    { id: 'cook_naigao', name: '桂花羊奶糕', pot: 'steam', ing: ['羊奶', '桂花', '糯米'], hp: 140, mp: 220, rage: 20, pg: 1, art: ['g', 12], desc: '羊奶和糯米粉蒸成方糕，顶上撒一撮桂花。' },
    { id: 'cook_naicha', name: '牛乳茶', pot: 'soup', ing: ['牛奶', '桂花', '蜂蜜'], hp: 160, mp: 200, rage: 20, pg: 1, art: ['g', 7], desc: '牛奶煮滚，兑一点桂花蜜，捧在手心里暖暖的。' },
    { id: 'cook_xigua', name: '切西瓜', pot: 'cold', ing: ['西瓜'], hp: 180, mp: 180, rage: 10, pg: 1, art: ['g', 5], desc: '在井水里湃了半日的西瓜，红瓤沙甜，凉丝丝的。',
      cold: '西瓜先在井水里湃凉了，一刀下去「咔嚓」一声——红瓤黑籽，沙甜沙甜的。' },
    { id: 'cook_taogeng', name: '蜜桃羹', pot: 'soup', ing: ['桃', '蜂蜜', '莲子'], hp: 260, mp: 140, rage: 20, pg: 2, art: ['g', 0], desc: '桃子切块和莲子一起慢炖，淋一勺蜂蜜，甜而不腻。' },
    { id: 'cook_li', name: '冰糖炖梨', pot: 'steam', ing: ['梨', '红枣', '蜂蜜'], hp: 200, mp: 200, rage: 10, pg: 2, art: ['g', 1], desc: '梨挖了芯，填上红枣和蜂蜜隔水蒸透，最润喉。' },
    { id: 'cook_mijian', name: '李子蜜饯', pot: 'soup', ing: ['李子', '蜂蜜'], hp: 120, mp: 120, rage: 20, pg: 2, art: ['g', 2], desc: '李子用蜂蜜慢慢熬透，酸里带甜，小桃一口一个。' },
    { id: 'cook_shibing', name: '柿饼', pot: 'steam', ing: ['柿子', '桂花'], hp: 220, mp: 100, rage: 20, pg: 2, art: ['g', 3], desc: '柿子削了皮压扁，和桂花一起上笼蒸软，甜得粘牙。' },
    { id: 'cook_putao', name: '葡萄酒', pot: 'soup', ing: ['葡萄', '糯米', '蜂蜜'], hp: 120, mp: 80, rage: 60, pg: 2, art: ['g', 4], desc: '葡萄捣汁兑上糯米甜酒，温一温，入口甜，后劲足。' },
    { id: 'cook_lingguo', name: '灵果羹', pot: 'soup', ing: ['灵果', '莲子', '蜂蜜'], hp: 600, mp: 400, rage: 40, pg: 2, art: ['g', 9], desc: '灵果和莲子炖成一碗清羹，灵气扑面。' },
    { id: 'cook_jiyu', name: '鲫鱼豆腐汤', pot: 'soup', ing: ['鲫鱼', '豆腐', '香葱'], hp: 380, mp: 60, rage: 30, pg: 3, art: ['f', 0], desc: '鲫鱼煎过再炖，汤奶白奶白的，撒一把葱花。' },
    { id: 'cook_guiyu', name: '清蒸鳜鱼', pot: 'steam', ing: ['鳜鱼', '香葱'], hp: 460, mp: 140, rage: 40, pg: 3, art: ['f', 1], desc: '鳜鱼刺少肉嫩，铺一层葱丝，清蒸最鲜。' },
    { id: 'cook_liyu', name: '糖醋鲤鱼', pot: 'wok', ing: ['鲤鱼', '蜂蜜'], hp: 420, mp: 80, rage: 50, pg: 3, art: ['f', 2], desc: '鲤鱼炸得翘起尾巴，浇上蜜汁，酸甜酥香。' },
    { id: 'cook_xia', name: '油焖青虾', pot: 'wok', ing: ['青虾', '香葱'], hp: 260, mp: 80, rage: 30, pg: 3, art: ['f', 3], desc: '青虾下锅一焖就红了，壳脆肉弹，葱香扑鼻。' },
    { id: 'cook_yinlin', name: '银鳞灵米粥', pot: 'soup', ing: ['银鳞鱼', '灵米', '山药'], hp: 420, mp: 260, rage: 30, pg: 3, art: ['f', 4], desc: '银鳞鱼片薄薄地滑进灵米粥里，鲜得眉毛都要掉了。' },
    { id: 'cook_xingban', name: '星斑鱼汤', pot: 'soup', ing: ['星斑鱼', '香菇', '豆腐'], hp: 700, mp: 360, rage: 50, pg: 3, art: ['f', 5], desc: '子夜才钓得到的星斑鱼，汤面上像浮着一层碎星光。' },
    { id: 'cook_xiaoyugan', name: '小鱼干', pot: 'wok', ing: ['白条'], hp: 80, mp: 20, rage: 10, pg: 3, art: ['f', 6], desc: '白条炸得酥脆，嚼着咔咔响。院里的猫闻着味儿就来了——可以喂给它。' },
  ];
  const PGN = ['家常', '菜园', '果子', '鱼鲜'];
  if (RS[0] && !RS[0].pgn) RS[0].pgn = PGN[0];
  const seen = {}; for (const r of NEW) { if (RS.some(x => x.id === r.id)) continue;
    const r2 = { id: r.id, name: r.name, pot: r.pot, ing: r.ing, hp: r.hp, mp: r.mp, desc: r.desc, pg: r.pg };
    if (r.cold) r2.cold = r.cold; if (!seen[r.pg]) { seen[r.pg] = 1; if (r.pg) r2.pgn = PGN[r.pg]; }
    RS.push(r2);
    ITEM_DB[r.id] = Object.assign(ITEM_DB[r.id] || {}, { name: r.name, use: 'heal', hp: r.hp, mp: r.mp, price: 40, rage: r.rage,
      desc: '叶孤星亲手做的' + r.name + '。' + r.desc + '恢复 ' + r.hp + ' 气血' + (r.mp ? '、' + r.mp + ' 灵力' : '') + '；食补：之后 3 场战斗开局全队怒气 +' + r.rage }); }

  // ---------- 成菜图 / 行囊图标 ----------
  const ART = {}; for (const r of NEW) ART[r.id] = r.art;
  const DA = {}; let dReq = 0;
  function mkIcons() { if (typeof IMG === 'undefined') return;
    for (const id in ART) { if (IMG['ic_' + id]) continue; const [k, i] = ART[id], im = DA[k]; if (!im) continue; const cols = k === 'g' ? 5 : 7;
      const c = document.createElement('canvas'); c.width = c.height = 128; c.getContext('2d').drawImage(im, (i % cols) * 192, Math.floor(i / cols) * 192, 192, 192, 0, 0, 128, 128); IMG['ic_' + id] = c; } }
  const dLoad = () => { if (dReq) return; dReq = 1;
    for (const [k, p] of [['g', 'r175g/dishes.webp'], ['f', 'r175f/dish.webp']]) { const im = new Image(); im.onload = () => { DA[k] = im; mkIcons(); }; im.src = SRC(p); } };
  setTimeout(dLoad, 6000);
  window.R139_DISH_ART = (id, x, y, s) => { dLoad(); const a = ART[id]; if (!a) return; const im = DA[a[0]]; if (!im) return; const cols = a[0] === 'g' ? 5 : 7;
    ctx.drawImage(im, (a[1] % cols) * 192, Math.floor(a[1] / cols) * 192, 192, 192, x, y, s, s); };

  // ---------- 送吃的：院里四个人的口味 ----------
  const TASTE = {
    maid1: { cook_jiyu: 5, cook_hetang: 3, cook_luobo: 3, cook_guiyu: 3, cook_li: 3, cook_wandou: 3, cook_danbing: 3, cook_naicha: 3 },
    maid2: { cook_taogeng: 5, cook_xigua: 5, cook_mijian: 5, cook_shibing: 5, cook_naigao: 5, cook_naicha: 5, cook_liyu: 5, cook_li: 3, cook_lingguo: 3, cook_putao: 1 },
    servant: { cook_hongshu: 5, cook_danbing: 5, cook_jingua: 5, cook_yinlin: 5, cook_liyu: 5, cook_xingban: 3, cook_luobo: 3 },
    steward: { cook_putao: 5, cook_guiyu: 5, cook_jiyu: 3, cook_li: 3, cook_yinlin: 3, cook_hongshu: 3, cook_lingguo: 3, cook_shibing: 1, cook_mijian: 1 },
  };
  const SAY = {
    maid1: { cook_jiyu: ['惊喜', '鲫鱼豆腐汤……汤炖得奶白奶白的。少爷，这道青禾记下了，下回青禾炖给少爷喝。'] },
    maid2: { cook_taogeng: ['大笑', '蜜桃羹！小桃的名字里就有个「桃」字——少爷是特意做给小桃的吧？'],
      cook_xigua: ['大笑', '西瓜！还是井水湃过的，凉丝丝的……小桃要坐在台阶上慢慢吃！'],
      cook_putao: ['委屈', '酒？……青禾姐说小桃不许喝酒。小桃、小桃就闻一闻……'] },
    servant: { cook_hongshu: ['大笑', '烤红薯！还烫手呢——阿福小时候在村口偷烤过，被人追了二里地！'],
      cook_danbing: ['大笑', '葱花蛋饼！卷起来一口一个，阿福能吃十张！'],
      cook_liyu: ['大笑', '糖醋鲤鱼！连鱼尾巴都是脆的，阿福把鱼骨头都嚼了！'] },
    steward: { cook_putao: ['感动', '葡萄酒……老头子年轻时跟着宗主，也在雪夜里喝过这么一壶。少爷，陪老头子喝一口？'],
      cook_guiyu: ['感动', '清蒸鳜鱼，刺少肉嫩……老头子牙口不好，少爷连这都想到了。'],
      cook_shibing: ['笑', '柿饼啊……甜得粘牙，老头子这几颗牙可经不住。留给小桃吧，她爱吃。'],
      cook_mijian: ['笑', '蜜饯……老头子吃一颗酸得眯眼。少爷的心意，松伯收下了，剩下的给小桃。'] },
  };
  let giftTry = 0;
  const regGift = () => { const g = window.R162_GIFT; if (!g) { if (giftTry++ < 20) setTimeout(regGift, 1500); return; }
    for (const r of NEW) g.DISH[r.id] = r.name;
    for (const k in TASTE) { g.TASTE[k] = g.TASTE[k] || {}; Object.assign(g.TASTE[k], TASTE[k]); }
    for (const k in SAY) { g.SAY[k] = g.SAY[k] || {}; Object.assign(g.SAY[k], SAY[k]); } };
  regGift();

  window.R175K = { NEW, ART, DA, dLoad };
})();
