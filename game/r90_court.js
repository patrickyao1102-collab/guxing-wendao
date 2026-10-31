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

// ---------- 作者彩蛋：「孤星问道」四字石雕 + 三尊叶孤星像（作者的创作历程，搞笑不煽情）----------
(function () {
  const M = typeof TMAPS !== 'undefined' && TMAPS.qingzhu_court; if (!M) return;
  const EGG = {
    '小院石雕 · 孤': ['写第一章时，作者给主角取名「孤星」。三秒后发现这名字自带一辈子单身buff。改不了了，已经写了十万字。', '这个「孤」字刻歪了。不是失误，是艺术。——作者（嘴硬版）'],
    '小院石雕 · 星': ['「星」字头顶那颗小星星，作者让 Codex 改了七遍。第八遍的时候 Codex 说：我觉得第三版最好。', '本书的星星：九曜。本游戏的星星：作者也数不清，反正特效里塞满了。'],
    '小院石雕 · 问': ['「问」字上那只小鸟，是作者凌晨三点要求加的。没人知道为什么，包括作者。', '作者写书时最常问的问题：这章到底写了啥？第二常问的：外卖到了吗？'],
    '小院石雕 · 道': ['「道」字脚下那团云，本来准备出门远游。后来作者发现地图还没做完，它哪也去不了。', '孤星问道，问到最后——作者也还没想好结局。别催，在写了。'],
    '叶孤星石像': ['第一章那个托腮望天的姿势，作者自己试过。三分钟后脖子酸了，于是叶孤星替他望了十八年。', '头顶那只石雀是作者特批的。主角可以被同门嘲笑，不能被鸟嫌弃——好吧，也可以。'],
    '叶孤星石像 · 长身玉立': ['这是作者心里叶孤星最帅的样子。为了这张脸否掉了十几版建模，Codex 现在一听到「再帅一点」就沉默。', '底座刻着「孤星问道，道不孤」。作者写完这句，得意了一整个下午。'],
    '叶孤星像 · 西装': ['作者的私心：仙侠主角穿西装戴墨镜。别问，问就是平行宇宙的少宗主。', '如果你在这尊像前站满十秒——什么也不会发生。作者只是想看看你会不会站。'],
  };
  const ORDER = ['小院石雕 · 孤', '小院石雕 · 星', '小院石雕 · 问', '小院石雕 · 道'];
  const F = () => (S.flags = S.flags || {});
  let seq = [];
  for (const n of M.npcs) { const L = EGG[n.name]; if (!L) continue;
    n.talk = async () => { const f = F(), k = 'egg_' + n.name, i = (f[k] || 0) % L.length; f[k] = (f[k] || 0) + 1;
      await say('作者 · 彩蛋', L[i]);
      const got = f.author_eggs = f.author_eggs || {}; if (!got[n.name]) { got[n.name] = 1; const c = Object.keys(got).length;
        if (c < 7) toast('作者彩蛋 ' + c + ' / 7', 1600);
        else { await say('作者 · 彩蛋', '七个彩蛋全找到了！作者宣布你是本书第一位真爱读者，奖励星辰点 10 点。'); await say('星旋', '等等，这 10 点是从我账上扣的？'); S.hero.points = (S.hero.points || 0) + 10; toast('星辰点 +10', 1800); } }
      // 按「孤 → 星 → 问 → 道」顺序连着点
      seq = ORDER.includes(n.name) ? (n.name === ORDER[seq.length] ? seq.concat(n.name) : n.name === ORDER[0] ? [n.name] : []) : [];
      if (seq.length === 4) { seq = []; await say('作者 · 彩蛋', '你把四个字连着念了一遍。恭喜，这就是书名。作者为想这四个字熬了一整夜，第二天发现早就写在封面上了。'); }
    };
  }
})();
