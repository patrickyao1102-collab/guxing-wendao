// ================= R331 · 支线之间串一串（作者 11-16）=================
// 「把现有支线给串一下就好了……你觉得有一点关联的，或者说可以串的，你串一下」「支线跟支线之间还有碰撞」
// 「NPC 对话分三种：常规对话；特定情境 / 剧情里的对白；任务做完之后再找他，对白又不一样」
// 「在黑风寨剧情没有结束之前，青阳镇应该接不到支线，或者很少很少，因为那时候人心惶惶」
// 原则：合逻辑；不新造看着别扭的素材（都用现成的人和小人）；串的时候点到为止，不抢别的支线的戏。只进测试版。
//   ① 青阳镇：黑风寨打完之前只留和黑风寨有关的（小虎子、匪患、犀角、狼牙），兽皮、金灵往后挪
//   ② 王铁匠的儿子：「三十个名字」里染坊门口那个抱刀的散修，就是王铁匠五年没回家的儿子（他爹打了五年剑，他学了五年刀）
//   ③ 名录 × 东厢朝南：在听雨楼问牙牌那天，丹霞堂掌柜正好在后厨学做糕，探出来插一句嘴
//   ④ 万宝楼的赝品 × 东厢朝南：秦老收到丹霞堂掌柜送的明目丹
//   ⑤ 三十年的桂花酿 × 东厢朝南：阿蘅说，玄天城有人托人买她爹晒的陈桂花，「做给一个嫌我手笨的人」
(function () {
  if (typeof TMAPS === 'undefined' || typeof say !== 'function' || typeof choose !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const SQ = id => ((F().sq || {})[id] || {});
  const done = id => SQ(id).s === 3;
  const YE = '叶孤星', XX = '星旋';
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const reg = n => { try { SPEAKERS[n] = SPEAKERS[n] || { p: '', color: '#e6dccb' }; } catch (e) {} };
  const afterCamp = () => { const f = F(); return !!(f.ch3_night || f.ch3_city || f.ch3 || f.ch3_report); };
  const dxOn = () => { const q = SQ('dx_east'); return q.s === 1 && (q.n || 0) <= 4; };   // 东厢朝南在做、还没到中秋夜
  const give = async (id, n, why) => { try { addItem(id, n); const it = ITEM_DB[id] || {}; if (window.itemGet) await itemGet([{ icon: 'item:' + id, id, name: it.name || id, count: '×' + n, desc: it.desc || '' }], why); } catch (e) {} };
  const exp = async n => { try { const lv0 = S.hero.lv; const ups = typeof gainExp === 'function' ? gainExp(n) : 0; toast('修为 +' + n, 1600); if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0); } catch (e) {} };
  // 在一个人原来的对话前面插一段（fn 返回 true 就不再走原来的）
  const wrap = (mid, name, fn) => { const n = ((TMAPS[mid] || {}).npcs || []).find(n => n.name === name && !n.hidden); if (!n) { console.warn('R331 找不到', mid, name); return null; } const o = n.talk;
    n.talk = async function (a) { let used = false; try { used = await fn(n); } catch (e) { console.warn('R331', name, e); } if (used) return;
      if (typeof o === 'function') return o.apply(this, arguments); const A = [].concat(o || '……'); for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(name, l); }; return n; };

  // ---------- ① 青阳镇：黑风寨打完之前冷清一点 ----------
  for (const q of window.SQ_DEFS || []) if (q.id === 'hide' || q.id === 'gold') { const c0 = q.cond; q.cond = () => afterCamp() && (!c0 || c0()); }
  wrap('qy_town', '采药老人', async () => { if (afterCamp() || SQ('hide').s) return false;
    await say('采药老人', ['这阵子山里不太平，老头子药篓都挂起来了。黑风寨的人下山，连采药的都抓。', '后生，天黑别往镇外走。等山上那伙人收了手，老头子再求你帮忙。'][Math.floor(Math.random() * 2)]); return true; });

  // ---------- ② 王铁匠的儿子 ----------
  const SON = '抱着刀的散修';
  { const C = TMAPS.xt_city; if (C) { reg(SON); const [c, r] = P(3420, 2830);
    (C.npcs = C.npcs || []).push({ key: 'none', cx: 'villager_m', c, r, name: SON, h: 116, wander: false, face: 'down', _r331: 1,
      cond: () => done('xt_thirty') && done('fang') && !F().wq_home,
      talk: async () => { const f = F();
        await L([[SON, '（他抱着刀蹲在染坊门口的石墩上，看见你，站了起来）天剑宗的小兄弟。那天要不是你，我这会儿已经在地窖里了。'],
          ['', '他怀里那把刀的刀鞘尾上，烙着一个小小的记号：一把锤子压着一个「王」字。'],
          [XX, '（小子，这记号眼熟。青阳镇王铁匠铺的门板上，烙的就是这个。）'], [YE, '这刀，是青阳镇王铁匠打的？'],
          [SON, '（愣住了）……你认得我爹？'],
          [SON, '我叫王青锋。十五岁出门学剑，剑宗嫌我手笨，不收。后来跟着一个使刀的老镖师走了五年镖，就……学了刀。'],
          [SON, '我爹在家里打了一把剑等我。我背着一把刀，拿什么脸回去？'], [XX, '（哈！他爹打了五年剑，他学了五年刀。这爷儿俩。）'],
          ...(f.fang_keep ? [[YE, '那把剑，你爹还挂在墙上。说是你回来那天，剑是现成的。']] : [[YE, '那把剑，你爹送给我了。'], [SON, '（看了看你腰上的剑）……给你了？他倒舍得。']])]);
        const k = await choose('王青锋', ['「你爹托我，见了你替他骂一句。」', '「刀也好，剑也好，回去让他看一眼。」']);
        if (k === 0) await L([[YE, '「混小子！」——这是原话。'], [SON, '（怔了半天，忽然笑出了声，笑着笑着拿袖子抹了把脸）……是他。是他的口气。']]);
        else await L([[SON, '……他会骂我的。'], [YE, '那就让他骂。骂完了，他会给你磨刀。']]);
        await L([[SON, '我明天一早就回青阳。'], [XX, '（好。这一趟玄天城，又少了一个不回家的人。）']]);
        f.wq_home = 1; try { const a = (world.actors || []).find(a => a.npc && a.npc.name === SON); if (a) a.hidden = true; } catch (e) {} } }); } }
  wrap('qy_smith', '王铁匠', async () => { const f = F(); if (!f.wq_home || f.wq_smith) return false; f.wq_smith = 1;
    await L(f.fang_keep ? [['王铁匠', '少侠！那混小子回来了！背着一把刀回来的！'], ['王铁匠', '我把那把剑从墙上取下来塞给他，他说剑太轻，使不惯。我抄起锤子就要揍他——他倒好，把剑挂到他自己床头上去了。'],
        ['王铁匠', '（嘴上骂着，手里的锤子敲得比哪天都响）这些丹药你拿着。往后你的刀剑，我们爷儿俩一块儿给你磨。']]
      : [['王铁匠', '少侠！那混小子回来了！背着一把刀回来的！'], ['王铁匠', '我跟他说，那把剑让天剑宗的少侠拿走了。他说「那正好，配得上」。……这小子，五年没回家，倒学会说人话了。'],
        ['王铁匠', '我给他另打了一把刀，比给你那把剑还好——你别不服。这些丹药你拿着。']]);
    await give('p_big', 2, '王铁匠的谢礼'); await exp(120); return true; });

  // ---------- ③ 名录 × 东厢朝南：听雨楼后厨探出来一个人 ----------
  setInterval(() => { try { const f = F();
    if (f.lk_tea || world.mapName !== 'xt_teahouse' || (SQ('ml_case').n || 0) !== 8 || !dxOn()) return;
    if ((typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice) || world.locked || (typeof battle !== 'undefined' && battle)) return;
    f.lk_tea = 1; world.locked = true;
    (async () => { try {
      await L([['丹霞堂掌柜', '花婆？那老太太去年给我说过三回媒——三回说的都是她自己侄女。'], ['', '他袖子挽到手肘，两手全是面粉，鼻尖上还沾着一点。'],
        ['听雨楼掌柜', '（团扇往后厨一指，眼皮都没抬）你蒸笼里那一屉，又糊了。'], ['丹霞堂掌柜', '……'], ['', '他转身就走，走得比来的时候快。'],
        [XX, '（丹霞堂的掌柜，在听雨楼……蒸东西？小子，这城里比黑市还热闹。）']]);
    } finally { world.locked = false; } })(); } catch (e) {} }, 400);

  // ---------- ④ 万宝楼的赝品 × 东厢朝南：秦老的明目丹 ----------
  wrap('xt_wanbao_vip', '秦老', async () => { const f = F(); if (!done('xt_fake') || !(SQ('dx_east').s >= 1) || f.lk_qin) return false; f.lk_qin = 1;
    await L([['秦老', '少侠来了。坐。……前两天丹霞堂的掌柜托人送了一瓶明目丹来。'], ['秦老', '瓶子上贴着张字条：「碾药碾坏眼睛的人吃的。鉴宝鉴坏眼睛的，也凑合。」'],
      ['秦老', '（摸着瓷瓶笑）这掌柜的嘴，比他的丹还苦。'], [XX, '（碾药碾坏眼睛的人……小子，这瓶丹，本来是做给谁的？）']]); return true; });

  // ---------- ⑤ 三十年的桂花酿 × 东厢朝南：阿蘅的陈桂花 ----------
  wrap('qy_inn', '弹琵琶的姑娘', async () => { const f = F(); if (!done('qy_wine') || !dxOn() || f.lk_heng) return false; f.lk_heng = 1;
    await L([['弹琵琶的姑娘', '（调着弦）少侠，前些天有个玄天城来的客人，托人来跟我买我爹当年晒的陈桂花。'], ['弹琵琶的姑娘', '我问做什么用，捎话的人说：做糕。我又问，做给谁吃——'],
      ['弹琵琶的姑娘', '捎话的人学着他的口气说：「做给一个嫌我手笨的人。」'], ['弹琵琶的姑娘', '（笑了一下）我把剩下那一小包都给了。我爹的桂花，能进一块糕里，比压在箱底强。'],
      [XX, '（嫌他手笨的人……这城里嫌他手笨的，可不止一个。）']]); return true; });
})();
