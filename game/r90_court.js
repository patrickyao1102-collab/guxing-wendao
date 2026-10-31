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
  add('lantern_pole_51', '石灯', ['灯里的烛火是管家每晚来点的。十几年，没断过一天。']);
  add('lantern_pole_52', '石灯', ['灯罩上糊的纸换过很多回，最新的一张上画着一只歪歪扭扭的小鹤。']);
  add('lantern_pole_53', '石灯', ['夜里只有这几盏灯亮着，整座小院安静得能听见竹叶落地。']);
  add('lantern_pole_54', '石灯', ['灯柱上有几道浅浅的剑痕，是他练剑时砍的，一道比一道歪。']);
  add('bamboo_chair_6', '竹椅', ['竹椅坐久了会吱呀作响。三把椅子，常年只用一把。']);
})();
