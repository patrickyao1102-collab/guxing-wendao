// R90 青竹小院（孤星小院）：院里的摆件都能点开看一句系统旁白（不是和物件对话）
// 已有：石桌、小池、两间客舍、晒药竹匾、三尊叶孤星石像、「孤星问道」四字石雕。这里补上剩下的。
(function () {
  const B = typeof CXB2 !== 'undefined' && CXB2.qingzhu_court, M = typeof TMAPS !== 'undefined' && TMAPS.qingzhu_court;
  if (!B || !M) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const byUid = uid => B.objs.find(o => o.uid === uid);
  const add = (uid, name, lines, dy = 26) => { const o = byUid(uid); if (!o) return; const [c, r] = P(o.ax, o.ay + dy);
    M.npcs.push({ key: 'none', c, r, name, hidden: true, h: Math.max(100, Math.min(170, o.h)), talk: async () => { for (const l of lines) await narrate(l); } }); };
  add('court-r32-stone_swordsman_r32', '石剑客像', ['一尊持剑而立的石像，剑尖指地，衣袂被风雨磨得圆润。', '小时候他总学着石像的样子站上大半天——剑没练成，人倒站得笔直。']);
  add('court-r32-carving_bench_r32', '雕刻台', ['木台上摆着刻刀、砂石，还有半块没刻完的青石。', '院里那几尊石像，有几尊是他自己一刀一刀刻出来的。练不成剑，总得有点事做。']);
  add('court-r32-stone_moon_rabbit_r32', '月兔石雕', ['一只捧着药杵的石兔，左耳缺了一角。', '那是他七岁拿木剑练「点星」时敲掉的——十八年来唯一一次点中。']);
  add('water_jar_8', '水缸', ['缸里的水清得能照见人影，水面漂着一片竹叶。']);
  add('water_jar_9', '水缸', ['缸底沉着几枚铜钱。不知是哪个杂役弟子许的愿，许的什么。']);
  add('court-r32-water_jar', '水缸', ['水缸边长了一圈青苔，摸上去凉凉的。']);
  add('court-r32-herb_trays', '晒药竹匾', ['竹匾里晒着当归和黄芪，有股淡淡的苦味。', '管家说这是给他补身子的。他喝了十几年，修为一点没补上来。']);
  add('lantern_pole_51', '石灯', ['灯里的烛火是管家每晚来点的。管家说，点灯比劝少爷早点睡容易多了。']);
  add('lantern_pole_52', '石灯', ['灯罩上糊的纸换过很多回，最新的一张上画着一只歪歪扭扭的小鹤。']);
  add('lantern_pole_53', '石灯', ['夜里这几盏灯一亮，飞蛾就准时来开会。']);
  add('lantern_pole_54', '石灯', ['灯柱上有几道浅浅的剑痕，是他练剑时砍的，一道比一道歪。']);
  add('bamboo_chair_6', '竹椅', ['竹椅坐久了会吱呀作响，像在抗议：请爱护公物。']);
})();

// ---------- 作者彩蛋：青竹小院「孤星问道」四字 + 三尊叶孤星像；天剑宗广场禹余道人像；藏经阁外长青剑仙像；大殿青龙白虎玉像 ----------
// 作者的创作历程，搞笑不煽情。点开说话人显示「作者 · 彩蛋」，全部找齐送星辰点。
(function () {
  if (typeof TMAPS === 'undefined') return;
  const EGG = {
    '小院石雕 · 孤': ['写第一章时，作者给主角取名「孤星」。三秒后发现这名字自带一辈子单身buff。改不了了，已经写了十万字。', '这个「孤」字刻歪了。不是失误，是艺术。——作者（嘴硬版）'],
    '小院石雕 · 星': ['「星」字头顶那颗小星星，作者让 Codex 改了七遍。第八遍的时候 Codex 说：我觉得第三版最好。', '本书的星星：九曜。本游戏的星星：作者也数不清，反正特效里塞满了。'],
    '小院石雕 · 问': ['「问」字上那只小鸟，是作者凌晨三点要求加的。没人知道为什么，包括作者。', '作者写书时最常问的问题：这章到底写了啥？第二常问的：外卖到了吗？'],
    '小院石雕 · 道': ['「道」字脚下那团云，本来准备出门远游。后来作者发现地图还没做完，它哪也去不了。', '孤星问道，问到最后——作者也还没想好结局。别催，在写了。'],
    '叶孤星石像': ['第一章那个托腮望天的姿势，作者自己试过。三分钟后脖子酸了，于是叶孤星替他望了十八年。', '头顶那只石雀是作者特批的。主角可以被同门嘲笑，不能被鸟嫌弃——好吧，也可以。'],
    '叶孤星石像 · 长身玉立': ['这是作者心里叶孤星最帅的样子。为了这张脸否掉了十几版建模，Codex 现在一听到「再帅一点」就沉默。', '底座刻着「孤星问道，道不孤」。作者写完这句，得意了一整个下午。'],
    '叶孤星像 · 西装': ['作者的私心：仙侠主角穿西装戴墨镜。别问，问就是平行宇宙的少宗主。', '如果你在这尊像前站满十秒——什么也不会发生。作者只是想看看你会不会站。'],
    '青龙镇殿玉像': ['青龙玉像。作者本来想放齐四神兽，量完尺寸发现大殿只放得下两只，朱雀和玄武还在后台排队。', '青龙盘云而起，霸气侧漏。作者画它的时候，自己的颈椎也跟着盘了一下午。'],
    '白虎镇殿玉像': ['白虎玉像。设计稿里它本来在打哈欠，作者觉得太萌，硬是改成了昂首挺胸。', '白虎昂首望着殿心——据说是在数宗主今天又批了几份弟子的检讨书。'],
  };
  const TOTAL = Object.keys(EGG).length, ORDER = ['小院石雕 · 孤', '小院石雕 · 星', '小院石雕 · 问', '小院石雕 · 道'];
  const F = () => (S.flags = S.flags || {});
  let seq = [];
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  // 地图里没生成热点的雕像，补上（广场的热点被截成 12 个，祖师像没进去）
  const ensure = (map, name, x, y) => { const M = TMAPS[map]; if (!M) return; M.npcs = M.npcs || []; if (M.npcs.some(n => n.name === name || n.name === '长卿剑仙像' && name === '长青剑仙像')) return; const [c, r] = P(x, y); M.npcs.push({ key: 'none', c, r, name, hidden: true, h: 160, talk: [] }); };
  // ---------- 禹余道人：全书最大的伏笔。庄重、神秘，只给感觉不给答案 ----------
  { const M = TMAPS.tj_front; if (M) { M.npcs = M.npcs || [];
    const yuyu = async () => { const f = (S.flags = S.flags || {});
      await narrate('传说，天剑宗开山之前，这尊像就已立在此处。宗门世代供奉，尊为无上祖师——禹余道人。');
      await narrate('长青剑仙一剑横扫群魔，名动九州。可藏经阁旧卷里记着：剑仙每至此像前，必解剑三拜，不敢仰视。');
      await narrate('四柄古剑悬于像侧，剑身无铭，千年未坠。历代宗主都想取下一柄看个究竟——无一人能让它们挪动分毫。');
      await narrate('像座只刻着一行古篆：「上清禹余」。后面的字，被人生生抹去了。');
      await narrate('宗门祖训，关于祖师只有一句：不可问，不可考，不可妄言。');
      if (window.JIUYAO_OWNED && JIUYAO_OWNED()) {
        if (!f.yuyu_stir) { f.yuyu_stir = 1; try { S.shake = 3; } catch (e) {} await narrate('你走近时，四柄古剑同时一颤。剑鸣极低，却像从很远很远的地方传来。'); await narrate('胸前的黑色玉佩骤然发烫——片刻之后，又凉了下去。'); await say('叶孤星', '……星旋？'); await narrate('玉佩里沉默了很久。'); await say('星旋', '走吧。别在这里久留。'); }
        else await narrate('四柄古剑静静悬着。星旋从不在这里开口。'); } };
    const ex = M.npcs.find(n => n.name === '禹余道人 · 创派祖师像');
    if (ex) { ex.talk = yuyu; ex.name = '禹余道人 · 无上祖师像'; } else { const [c, r] = P(1792, 1445); M.npcs.push({ key: 'none', c, r, name: '禹余道人 · 无上祖师像', hidden: true, h: 160, talk: yuyu }); }
    // 守像老人：守了一辈子像，敬畏，不说笑
    const OLD = ['老朽在这里守了六十年像。六十年，没见它落过一粒灰。', '长青剑仙？他当年在这像前跪了三天三夜。起身的时候，满头青丝全白了。为什么？没人敢问。', '祖师爷是谁？宗主问过，长老问过。老朽只知道一件事：那四柄剑，不是给人看的。', '早年有位长老不信邪，伸手去碰那悬剑。剑没动，他闭关了三十年，出关后再不提剑。', '香火不能断——这是祖训第一条。第二条往后写的什么，没人见过。', '月圆的夜里，那四柄剑会一齐转向东方。东边有什么？老朽不敢去看。'];
    const [oc, or] = P(1655, 1500);
    M.npcs.push({ key: 'none', cx: 'riddle_elder', c: oc, r: or, name: '守像老人', h: 118, wander: false, talk: async () => {
      if (window.JIUYAO_OWNED && JIUYAO_OWNED() && (S.flags || {}).yuyu_stir && !(S.flags || {}).yuyu_old) { S.flags.yuyu_old = 1; await say('守像老人', '少宗主……方才那四柄剑——'); await say('守像老人', '老朽守了六十年，头一回见它们动。'); return; }
      const f = (S.flags = S.flags || {}), i = (f.yuyu_old_i || 0) % OLD.length; f.yuyu_old_i = (f.yuyu_old_i || 0) + 1; await say('守像老人', OLD[i]); } });
  } }
  // 长青剑仙：九曜剑典上一任主人，传说级人物（不做搞笑彩蛋）
  { const M = TMAPS.tj_scripture; if (M) { for (const n of (M.npcs || []).filter(n => /^长[青卿]剑仙(石)?像$/.test(n.name))) { n.name = '长青剑仙像';
    n.talk = async () => { await narrate('长青剑仙，千年前以九曜剑典名震九州。传说他一人一剑横扫群魔，飞升之后，剑典只余残篇，藏于此阁。'); await narrate('剑仙按剑而立，像座刻着古老星纹。宗门弟子出入藏经阁，都会在这里停一停。');
      if (window.JIUYAO_OWNED && JIUYAO_OWNED()) await narrate('如今残篇已成完本。像座上的星纹，好像比从前亮了一点点。'); }; } } }
  for (const map of ['qingzhu_court', 'tj_front', 'tj_scripture', 'tj_hall']) { const M = TMAPS[map]; if (!M || !M.npcs) continue;
    for (const n of M.npcs) { if (n.name === '长卿剑仙像') n.name = '长青剑仙像';   // 原著是「长青剑仙」
      const L = EGG[n.name]; if (!L) continue;
      n.talk = async () => { const f = F(), k = 'egg_' + n.name, i = (f[k] || 0) % L.length; f[k] = (f[k] || 0) + 1;
        await say('作者 · 彩蛋', L[i]);
        const got = f.author_eggs = f.author_eggs || {}; if (!got[n.name]) { got[n.name] = 1; const c = Object.keys(got).filter(x => EGG[x]).length;
          if (c < TOTAL) toast('作者彩蛋 ' + c + ' / ' + TOTAL, 1600);
          else { await say('作者 · 彩蛋', '所有作者彩蛋都找到了！作者宣布你是本书第一位真爱读者，奖励星辰点 10 点。'); await say('星旋', '等等，这 10 点是从我账上扣的？'); S.hero.points = (S.hero.points || 0) + 10; toast('星辰点 +10', 1800); } }
        // 按「孤 → 星 → 问 → 道」顺序连着点
        seq = ORDER.includes(n.name) ? (n.name === ORDER[seq.length] ? seq.concat(n.name) : n.name === ORDER[0] ? [n.name] : []) : [];
        if (seq.length === 4) { seq = []; await say('作者 · 彩蛋', '你把四个字连着念了一遍。恭喜，这就是书名。作者为想这四个字熬了一整夜，第二天发现早就写在封面上了。'); }
      };
    }
  }
})();
