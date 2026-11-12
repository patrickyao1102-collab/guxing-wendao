// ================= R216 · 玄天城探案支线③「三十个名字」（前两案的收束；接青阳镇密信「凝丹修士三十」和九灯）=================
// 追查一张烫金请帖。三次翻转：借名册的丹霞堂客卿是内鬼？→ 他是第一个被抓走的人，名单是被逼着写的 →
// 「月晦之夜」不是一网打尽，是凭帖按号、一刻钟进一个；一号今晚此刻已经站在门口——而且帖子本身就是记号。
// 要求：做完探案②（拿到烫金请帖 xw_hint3）。做过「九灯拱一枢」「黑风寨的账本」有专属对白。
// 玩家不会卡：每一步去找谁，任务栏写明；推理由叶孤星 / 星旋说出口；最后在旧染坊门前当众说穿。
// 不新开室内：全程用玄天城街面、云来客栈大堂、城主府议事正堂。旧染坊 = 南城门东边那户晾着布的院子。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.xt_city || !window.SQ_DEFS) return;
  const CITY = TMAPS.xt_city, CB = CITY.baked || {};
  const F = () => (S.flags = S.flags || {});
  const st = id => ((F().sq = F().sq || {})[id] = F().sq[id] || { s: 0, n: 0 });
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const YE = '叶孤星', XX = '星旋', ELDER = '据点长老', SHUN = '云来客栈伙计', NV = '沈霜', ZB = '城主府主簿', HUA = '卖花姑娘', DAN = '丹霞堂伙计', DENG = '司灯老人', DU = '杜仲', ZS = '斗笠人';
  const ID = 'xt_thirty', q = () => st(ID), on = () => q().s === 1;
  const done = id => ((F().sq || {})[id] || {}).s === 3;
  const note = t => { const f = F(); f.xn_notes = f.xn_notes || []; if (!f.xn_notes.includes(t)) { f.xn_notes.push(t); try { playSnd('ui_confirm'); } catch (e) {} toast('记入证词本：' + t, 2600); } };
  const GOALS = ['三处打听：云来客栈门口的阿顺（帖子是谁印的）、客栈大堂的沈霜（谁收到了）、城主府议事正堂的主簿（城里有多少凝丹散修）', '三十张帖子，三十一个名字——去找送帖子的卖花姑娘，问少送了哪一家', '少的那一户在丹霞堂后巷——去城东问丹霞堂伙计', '杜先生留下的方子指着「灯」——去城中央问司灯老人，哪一片灯照不到', '回天剑宗据点，把地点禀报长老', '来不及等人手了——去南城门东边的旧染坊（晾着布的那个院子）', '（已完成）'];
  const Q = { id: ID, name: '三十个名字', giver: ['xt_city', ELDER], where: '玄天城 · 天剑宗据点 · 据点长老（要先做完「万宝楼的赝品」，拿到那张烫金请帖）', cond: () => !!F().ch3_report && !!F().xw_hint3, type: 'kill', kill: { maps: ['__r216__'], mobs: ['__r216__'] }, n: 6, reward: { exp: 900, gold: 1000 } };
  Object.defineProperty(Q, 'goal', { enumerable: true, get() { return GOALS[Math.min(GOALS.length - 1, q().n)]; } });
  Object.defineProperty(Q, 'desc', { enumerable: true, get() { const n = (F().xn_notes || []); return '一张没有抬头的烫金请帖：「月晦之夜 · 城南 · 鉴宝小会」，下面压着一个数——三十。' + (n.length ? '　【证词本】' + n.map((t, i) => (i + 1) + '. ' + t).join('　') : ''); } });
  SQ_DEFS.push(Q);
  Object.assign(ITEM_DB, { c_lianming: { name: '散修联名帖', slot: 'acc', maxhp: 100, maxmp: 40, def: 4, price: 0, desc: '一张烫金请帖的背面，密密麻麻签着三十个名字。最底下一行小字，是沈霜的笔迹：「欠天剑宗叶孤星一条命。凭此帖，随时来取。」' } });
  try { for (const [n, c] of [[DU, '#cfe0c0'], [ZS, '#c9a0ff'], [ZB, '#e0d0b0'], [HUA, '#ffc8d8']]) SPEAKERS[n] = SPEAKERS[n] || { p: '', color: c }; } catch (e) {}
  const wrap = (M, name, fn) => { const n = (M && M.npcs || []).find(n => n.name === name && !n.hidden); if (!n) { console.warn('R216：找不到', name); return null; } const orig = n.talk;
    n.talk = async function (a) { let ok = false; try { ok = await fn(n); } catch (e) { console.warn('R216', name, e); } if (ok) { if (n.shop) { const sh = n.shop; n.shop = null; setTimeout(() => { n.shop = sh; }, 0); } return; }
      if (typeof orig === 'function') return orig.call(this, a); const A = Array.isArray(orig) ? orig : [orig || '……']; for (const l of n.random ? [A[Math.floor(Math.random() * A.length)]] : A) await say(n.name, l); }; return n; };
  const free = (x, y) => { try { return CB.blocked.charCodeAt(Math.floor(y / CB.cs) * CB.cols + Math.floor(x / CB.cs)) === 48; } catch (e) { return true; } };
  const nearFree = (x, y) => { for (let r = 0; r <= 240; r += 16) for (let a = 0; a < 8; a++) { const px = x + Math.cos(a * Math.PI / 4) * r, py = y + Math.sin(a * Math.PI / 4) * r; if (free(px, py)) return [px, py]; } return [x, y]; };
  const asked = async k => { const f = F(), s = q(); f['xn_a_' + k] = 1; if (s.n !== 0) return; const got = ['s', 'n', 'z'].filter(x => f['xn_a_' + x]).length;
    if (got < 3) { toast('三十个名字　打听 ' + got + ' / 3', 1800); return; }
    await L([[XX, '（小子，把三句话摆在一起：帖子印了三十张；城里登记在册的凝丹散修，三十一个；名册上个月被人借走过。）'], [YE, '请帖是照着名册发的。可名册上三十一个人，帖子只有三十张。'], [XX, '（少请了一个。少的是谁——发帖的人，心里最清楚。帖子是谁送的来着？）'], [YE, '沈霜说，是个卖花的小姑娘。']]);
    s.n = 1; toast('三十个名字 —— 去找街上的卖花姑娘', 2600); };

  // ---------------- 接案：据点长老 ----------------
  wrap(CITY, ELDER, async () => { const s = q(), f = F();
    if (s.s === 3) return false;
    if (s.s === 1) {
      if (s.n === 4) {
        await L([[YE, '长老。地方找到了：南城门东边的旧染坊。南门两侧的灵灯都被蚀过，那一片正是护城灵枢照不到的地方。'], [ELDER, '好！月晦是后天夜里。老夫这就传讯宗门，再向城主府借一队城卫，后天黄昏合围——'], [YE, '（后天。……可是——）'],
          [YE, '长老，请帖能再给弟子看一眼么。'], ['', '叶孤星把那张烫金帖子翻了过来。背面的右下角，有一个指甲盖大的暗记：「廿九」。'], [YE, '阿顺说，每张帖子背面都有个不一样的记号。弟子原以为是防伪。'],
          [XX, '（三十个凝丹修士。小子，炼魂谷凭什么一口气吞下三十个凝丹？吞不下的。除非——他们不是一起来的。）'], [YE, '「凭帖入内，一帖一人。」……是按号进门。一刻钟进一个，进去一个，收拾一个。后面的人站在门外，还以为前头的正在里面看宝。'],
          [ELDER, '（脸色变了）那「月晦之夜」……'], [YE, '是最后一个人进门的日子。第一个人——'], [XX, '（那个擦短剑的冷面丫头！她说她「今晚就去看看」——她的帖子上是几号？！）'], [YE, '长老，来不及等后天了。弟子先去！'],
          [ELDER, '去！老夫带人随后就到——孤星，撑住一炷香！']]);
        note('帖子背面有编号：三十个人是按号、一个一个进门的。「月晦」只是最后一个人的日子——第一个，就是今晚'); s.n = 5; toast('三十个名字 —— 快去南城门东边的旧染坊！', 3000); return true; }
      if (s.n >= 5) { await say(ELDER, '还愣着做什么？快去！'); return true; } return false; }
    if (!Q.cond()) return false;
    const k0 = await choose(ELDER, ['（取出那张烫金请帖）「长老，弟子在城里捡到一样东西。」', '别的事']); if (k0 !== 0) return false;
    await L([[ELDER, '（接过帖子，眉头越皱越紧）「月晦之夜 · 城南 · 鉴宝小会」……没有抬头，没有落款。底下这个「三十」——'],
      done('qy_ledger') ? [YE, '青阳镇那封炼魂谷的密信上写着：「凝丹修士三十，月底前送抵苍月城北」。'] : [YE, '弟子在万宝楼遇上过炼魂谷的人。他们在找「三十」个什么。'],
      [ELDER, '……三十个凝丹修士。在玄天城里，当着护城灵枢的面？'], [ELDER, '宗门弟子他们不敢动。要动，只会动没有靠山的——散修。'],
      [ELDER, '孤星，这件事不能声张。城里的散修最恨宗门指手画脚，老夫出面，他们只当是天剑宗要挡他们的机缘。你是生面孔，你去查：帖子是谁印的，发给了谁，「城南」又是哪里。']]);
    const k = await choose('支线 · 三十个名字', ['「弟子领命。」（报酬：修为 +900、灵石 1000，另有相赠）', '下次再说']); if (k !== 0) return true;
    s.s = 1; s.n = 0; f.xn_notes = []; try { playSnd('ui_confirm'); } catch (e) {}
    await say(XX, '（三条线头：印帖子的书坊——那个抄书的小伙计知道；收帖子的人——客栈里那个冷面丫头就是凝丹散修；还有，城里到底有多少凝丹散修，城主府该有本册子。）'); toast('接取支线：三十个名字 —— 阿顺、沈霜、城主府主簿', 3200); return true;
  });

  // ---------------- 第一幕：三处打听 ----------------
  wrap(CITY, SHUN, async () => { const s = q(), f = F(); if (!on() || s.n !== 0 || f.xn_a_s) return false;
    await L([[YE, '阿顺，你说过书坊在赶一批烫金的帖子。是不是这样的？'], [SHUN, '（凑近一看，倒吸一口气）就是它！客官您哪儿弄来的？老板说这东西要是流出去一张，就砸我们的饭碗！'],
      [SHUN, '一共印了三十张，一张不多一张不少。来订货的人戴着斗笠，声音哑哑的，银子给得爽快，就一个规矩：印坏的当面烧，墨是他自己带来的。'], [YE, '墨是他自己带的？'], [SHUN, '是啊，说是掺了上好的金粉。可我抄了一夜，总觉得那墨……有股子凉气，往骨头里钻。'],
      [SHUN, '还有，每张帖子背面右下角，都要拿小号笔描一个不一样的记号。老板说是防伪。']]);
    note('阿顺：帖子一共三十张；订货的人戴斗笠，墨是他自己带来的，有股凉气；每张背面都有不一样的暗记'); await asked('s'); return true; });
  wrap(TMAPS.xt_inn_hall, NV, async () => { const s = q(), f = F();
    if (s.s === 3) { await say(NV, '（擦剑的手停了停）……欠你一次。我说话算话。'); return true; }
    if (!on()) return false;
    if (s.n >= 5) { await say('', '靠窗的位子空着。桌上的茶还是温的。'); return true; }
    if (f.xn_a_n || s.n !== 0) return false;
    await L([[YE, '沈道友，可曾收到过这样一张帖子？'], [NV, '（瞥了一眼，从袖中抽出一张一模一样的，按在桌上）前天。一个卖花的小丫头送来的。'], [NV, '说是有一柄无主的寒属古剑，只给凝丹以上的散修看，价高者得。'],
      [YE, '沈道友，这帖子来路不正。印它的人——'], [NV, '（把帖子收了回去）我知道来路不正。正路上的东西，轮不到散修。'], [NV, '剑若是真的，我要。局若是假的，我的剑也不是摆设。今晚我就去看看。'],
      [XX, '（好大的口气。……等等，「今晚」？帖子上不是写着月晦么？）'], [YE, '（她大概是想提前去踩一踩地方。）']]);
    note('沈霜：帖子是卖花的小姑娘送的，只请凝丹以上的散修。她说「今晚就去看看」'); await asked('n'); return true; });
  wrap(TMAPS.xt_manor_hall, ZB, async () => { const s = q(), f = F(); if (!on() || s.n !== 0 || f.xn_a_z) return false;
    const k = await choose(ZB, ['「天剑宗据点差我来问：城里登记在册的凝丹散修，有多少位？」', '没事']); if (k !== 0) return false;
    await L([[ZB, '天剑宗的？……稍等。（翻开一本厚册子）凝丹以上、无门无派、在玄天城常住的，眼下是三十一位。'], [YE, '这本名册，外人看得到么？'], [ZB, '看不到。不过上个月倒是借出去过一回——丹霞堂要给城里的修士配「护脉丹」，按人头备药，来抄过一份。'],
      [ZB, '借阅的是他们的客卿丹师，杜仲杜先生，签了字画了押的。怎么，出什么事了？'], [YE, '……没什么。多谢主簿。']]);
    note('主簿：城里凝丹散修登记在册三十一人；名册上个月被丹霞堂的客卿丹师杜仲借抄过'); await asked('z'); return true; });

  // ---------------- 第二幕：卖花姑娘 ----------------
  wrap(CITY, HUA, async () => { const s = q(); if (!(on() && s.n === 1)) return false;
    const k = await choose(HUA, ['（蹲下来）「小妹妹，前几天是不是有人托你送过帖子？」', '买花']); if (k !== 0) return false;
    await L([[HUA, '（眼睛一亮）大哥哥怎么知道？一个戴斗笠的叔叔给了我好多铜板，让我挨家送，送一张给两文！'], [HUA, '我不认字，可我记门！叔叔带我走了一遍，哪家的门上有铜环、哪家门口有石狮子，我都记着呢。三十家，一家没送错！'],
      [YE, '他有没有说过，哪一家不用送？'], [HUA, '（歪着头想了想）有！走到丹霞堂后巷那户，我说这家还没送呢，叔叔说：「这一家，不用送。」'], [HUA, '我问为什么，他笑了一下，说：「他已经来过了。」'], ['', '叶孤星后颈一凉。'],
      [XX, '（名册是丹霞堂的杜仲借的。帖子偏偏不送杜仲。——小子，换了你是城卫，你怎么断？）'], [YE, '借名册的人，就是发帖的人。自己当然不用请自己。'], [XX, '（顺理成章。……太顺理成章了。去丹霞堂。）']]);
    note('卖花姑娘：斗笠人带她认了三十户的门；丹霞堂后巷那户不送——「他已经来过了」'); s.n = 2; toast('三十个名字 —— 去城东，问丹霞堂伙计', 2600); return true; });

  // ---------------- 第三幕：丹霞堂 ----------------
  wrap(CITY, DAN, async () => { const s = q(); if (!(on() && s.n === 2)) return false;
    await L([[YE, '贵堂的客卿丹师杜仲杜先生，可在？'], [DAN, '杜先生？（脸色黯下来）半个月没见人了。说是进山采药，可他的药锄、药篓都还挂在屋里。掌柜的不让声张，怕坏了堂里的名声。'], [YE, '我能看看他的屋子么？'],
      [DAN, '这……少侠是天剑宗的，应当无妨。就在后巷，我带您去。'], ['', '屋子很小，收拾得一丝不苟。书案上压着一张纸，是一份抄到一半的名单。'], ['', '三十个名字，一笔一画，每个名字后面都用小字注着：年岁、修为、灵根属性。有几个名字被重重圈了起来，旁边批着两个字：「魂纯」。'],
      [XX, '（……这不是请客的单子。这是挑牲口的单子。）'], ['', '名单最底下，墨迹和上面的不一样——潦草，发抖，像是趁人不注意匆匆添上去的：'], ['', '「他们说，写完三十个就放我走。可名册上，是三十一个。」'], ['', '「第三十一个，是我。」'],
      [YE, '（攥紧了那张纸）他不是发帖的人。他是第一个被带走的人。名单是他们逼着他写的。'], [XX, '（「他已经来过了」——那个斗笠人，原来是这个意思。）'],
      [DAN, '（声音发颤）杜先生他……还活着么？'], [YE, '炼魂的丹，要丹师来炼。他们留着他有用。'], ['', '纸的背面还有一行字，写得极小，夹在两道折痕中间：「蚀灵散方：硝石三钱，阴沉木灰一两……用处：灯。」'],
      done('xt_lamps') ? [YE, '蚀灵粉——是南城门那几盏被人动过手脚的灵灯！'] : [YE, '灯？'],
      done('xt_lamps') ? [XX, '（那个撒粉的挑夫，原来只是最外头的一只手。灯灭在哪儿，他们就要在哪儿动手。去问那个管灯的老头，被蚀过的灯围出来的是哪一片。）'] : [XX, '（玄天城的灵灯连着护城灵枢，灯照得到的地方，邪修不敢露头。有人在灭灯。去问城中央那个管灯的老头。）']]);
    note('杜仲不是内鬼：他半月前就被抓走，名单是被逼着写的——他自己是「第三十一个」。背面留了一行：蚀灵散，用处是「灯」'); s.n = 3; toast('三十个名字 —— 去城中央，问司灯老人哪一片灯照不到', 2800); return true; });

  // ---------------- 第四幕：司灯老人 ----------------
  wrap(CITY, DENG, async () => { const s = q(); if (!(on() && s.n === 3)) return false;
    const k = await choose(DENG, ['「老人家，城南有没有哪一片，是灵灯照不到的？」', '别的事']); if (k !== 0) return false;
    await L([done('xt_lamps') ? [DENG, '少侠又来了。上回那三盏灯，多亏了你。……照不到的地方？'] : [DENG, '照不到的地方？这话问得怪。九灯拱一枢，满城没有死角——'],
      [DENG, '（忽然停住，低头去翻灯册）……南城门两侧的两盏，加上往云来客栈去的那一盏。这三盏要是一齐暗了，南门往东，城墙根底下，会漏出巴掌大一块来。'], [DENG, '那儿只有一户——早年的染坊，荒了有七八年了。'],
      [YE, '荒了的染坊，院子里会晾着布么？'], [DENG, '（一愣）……晾着布？'], [XX, '（有人住进去了。布是晾给过路人看的：一户寻常人家，没什么好瞧的。）']]);
    note('司灯老人：三盏灯一暗，南城门往东、城墙根下的旧染坊正好照不到。荒了七八年的院子，如今却晾着布'); s.n = 4; toast('三十个名字 —— 回天剑宗据点，禀报长老', 2600); return true; });

  // ---------------- 第五幕：旧染坊门前，当众说穿 ----------------
  const [gx, gy] = nearFree(3540, 2770);
  (CITY.npcs = CITY.npcs || []).push({ key: 'none', c: P(gx, gy)[0], r: P(gx, gy)[1], name: '旧染坊', hidden: true, h: 110, talk: async () => { const s = q();
    if (s.s === 3) { if (TMAPS.xt_dyeyard && window.R219_YARD_IN) { const k = await choose('旧染坊', ['进院子看看', '算了']); if (k === 0) { try { await goMap('xt_dyeyard', R219_YARD_IN[0], R219_YARD_IN[1], 'up'); } catch (e) { tileSetMap('xt_dyeyard', R219_YARD_IN[0], R219_YARD_IN[1], 'up'); } } return; } await say('', '院门贴了城主府的封条。'); return; }
    if (!on() || s.n < 5) { await say('', '一户寻常人家的院子，竹竿上晾着几匹蓝布。院门虚掩着。'); return; }
    await finale(); } });
  for (const [cx, x, y, name, line] of [['wandering_blade', -110, 36, '等着入场的散修', '嘘——别吵。里头正看宝呢，下一个就轮到我。'], ['villager_m', 90, 50, '抱着刀的散修', '七号是我。你几号？没帖子？没帖子凑什么热闹。']]) {
    const [px, py] = nearFree(gx + x, gy + y); CITY.npcs.push({ key: 'none', cx, c: P(px, py)[0], r: P(px, py)[1], name, h: 116, wander: false, face: 'up', talk: [line], cond: () => on() && q().n >= 5 }); }
  async function finale() {
    const s = q(), f = F();
    await L([['', '旧染坊的院门前，已经站了四五个人。都是独来独往的打扮，彼此隔着三步远，谁也不看谁，手里都捏着一张烫金的帖子。'], ['', '院门开了一条缝。门里伸出一只手，接过最前面那人的帖子——是沈霜。她的帖子背面，一个「一」字。'],
      [YE, '沈道友！别进去！'], ['', '沈霜的脚停在门槛上，没有回头。'], ['等着入场的散修', '哪来的小子？天剑宗的？（冷笑）宗门的人，连散修捡口剩饭都要管？'], ['抱着刀的散修', '就是！有宝贝你们宗门先挑，挑剩的还不许我们看一眼？滚远些！'],
      [XX, '（小子，他们不会信一个宗门弟子的。别讲道理，讲他们自己手里的东西。）'], [YE, '诸位不必信我。信你们自己的帖子。'],
      [YE, '第一件。请各位把帖子翻过来，看右下角。这位道友是「七」，那位是「四」，沈道友是「一」。——诸位可曾想过，鉴宝会为什么要排号？'], ['抱着刀的散修', '……一帖一人，依号入场，规矩罢了。'],
      [YE, '一刻钟进一个。前面的人进去了，可有一个出来过？'], ['', '几个人不约而同地，看了一眼那扇只开了一条缝的院门。'],
      [YE, '第二件。这帖子照着城主府的散修名册发的。名册上三十一个人，帖子三十张。少的那一位，是丹霞堂的丹师杜仲——半个月前就失踪了。这是他屋里的名单。'], ['', '叶孤星展开那张纸。三十个名字，每个名字后面注着年岁、修为、灵根。'],
      ['等着入场的散修', '（凑过来，脸色慢慢变了）这上头……有我。「木灵根，魂纯」——「魂纯」是什么意思？！'], [YE, '是挑拣的意思。'],
      [YE, '第三件。印帖子的墨，是订货的人自己带来的。抄帖子的伙计说，那墨有股凉气，往骨头里钻。'], ['', '叶孤星并指一划，星力如水，漫过在场每一个人手里的帖子。'],
      ['', '烫金的字迹底下，齐刷刷泛起一层幽幽的青光——和南城门那几盏被蚀坏的灵灯，一模一样的颜色。'], [XX, '（引魂砂。拿在手里三天，魂火上就落了记号。就算今晚没来，他们也找得到人。）'],
      ['', '「当啷」一声，抱刀的散修把帖子扔在了地上，像扔一块烧红的炭。'], ['', '院门后面，那只手慢慢缩了回去。然后，门自己开了。']]);
    if (TMAPS.xt_dyeyard && window.R219_YARD_IN) { try { await fadeOut(260); tileSetMap('xt_dyeyard', R219_YARD_IN[0], R219_YARD_IN[1], 'up'); S.scene = drawMap; await fadeIn(320); } catch (e) {} await say('', '院子里没有鉴宝会。只有几口倒扣的染缸，两竿没人收的蓝布，和角落里一块压着地窖口的木盖板。'); }
    await L([
      [ZS, '（斗笠压得很低，声音沙哑）天剑宗的小辈。一封密信，一把古剑，如今是三十个人——你坏了谷里三件事了。'], [ZS, '也好。星属性的凝丹修士，魂火比他们三十个加起来都亮。主上见了，想必欢喜。'],
      [NV, '（短剑出鞘，退后一步，与叶孤星并肩）……我的帖子，是一号。'], [NV, '所以这一剑，我先出。']]);
    const lv = Math.max(0, (S.hero.lv || 11) - 11);
    const mk = (name, key, hp, atk, def, extra) => Object.assign({ name, key: (typeof IMG !== 'undefined' && IMG[key]) ? key : 'e_grunt', hp, maxhp: hp, atk, def, spd: 13, h: 250, color: '#665' }, extra || {});
    let win = true;
    try { await fadeOut(220); const pr = startBattle({ bg: (typeof IMG !== 'undefined' && IMG.bg_r219_dye) ? 'bg_r219_dye' : 'bg_night', normalBgm: true, title: '旧染坊 · 月晦之前', boss: true, exp: 320, gold: 240,
      enemies: [mk('炼魂谷接引使（凝丹三重）', 'e_xiexiu', 1900 + lv * 130, 50 + lv * 3, 14, { boss: true }), mk('炼魂谷执事', 'e_xiexiu', 900 + lv * 60, 40 + lv * 2, 10), mk('炼魂谷随从', 'e_grunt', 600 + lv * 40, 36 + lv * 2, 8)] });
      await fadeIn(220); const r = await pr; S.scene = drawMap; await fadeIn(200); win = !!r && r !== 'flee'; } catch (e) { console.warn('R216 fight', e); }
    if (!win) { try { partyRevive(.4); } catch (e) {} await L([[NV, '（挡在前面）退后调息。门口我守着，他们出不来。'], [XX, '（那丫头替你拖着。喘口气，再上。）']]); return; }
    await L([['', '接引使的斗笠裂成两半。他退到院墙下，看了一眼巷口——天剑宗的剑光、城卫的火把，正从三个方向合过来。'], [ZS, '（咬碎了什么东西，嘴角溢出黑血）……三十个不成，还有别处的三十个。苍月城那边，等不了多久了。'], ['', '他倒了下去。'],
      [ELDER, '（御剑落地，扫了一眼满院的人）都活着？……好。好！'], ['', '染坊的地窖里，找到了杜仲。人瘦得脱了形，手腕上锁着封灵链，面前摆着一只冷透的丹炉——他一炉丹都没有炼。'],
      [DU, '（被扶出来，看见院子里站着的人，一个一个数过去）……一、二、三……都在。都还在。'], [DU, '他们说写完三十个就放我走。我写得很慢，很慢……我想着，慢一天，就多一天有人来。'], [YE, '杜先生，您背面那一行字，我看见了。'], [DU, '（笑了，眼泪掉下来）看见了就好。'],
      ['等着入场的散修', '（走过来，别别扭扭地一抱拳）……小兄弟。方才那几句话，对不住。'], ['抱着刀的散修', '我们这些人，没门没派，也没什么拿得出手的。这样吧——'],
      ['', '他捡起地上那张帖子，翻到背面，咬破手指，签了自己的名字。然后递给下一个人。'], ['', '帖子在院子里传了一圈，又被人送去了城里各处。等它回到叶孤星手里的时候，背面已经签满了：三十个名字。'],
      [NV, '（最后一个落笔，在最底下添了一行小字，把帖子拍在叶孤星胸口）拿着。'], [NV, '欠你一条命。随时来取。'], [XX, '（三十个凝丹散修的人情。小子，你下山才几天，这笔账攒得可不小。）'],
      [ELDER, '孤星。「苍月城」三个字，老夫会连夜报回宗门。……你做得很好。比老夫年轻时好。']]);
    f.xn_done = 1; s.s = 3; s.n = 6;
    const h = S.hero, lv0 = h.lv; addItem('c_lianming', 1); h.gold = (h.gold || 0) + Q.reward.gold; try { playSnd('jingle_win'); } catch (e) {}
    if (window.itemGet) await itemGet([{ icon: 'item:c_lianming', id: 'c_lianming', name: '散修联名帖', count: '×1', desc: ITEM_DB.c_lianming.desc }, { icon: 'gold', name: '灵石', count: '×' + Q.reward.gold }], '支线完成 · 三十个名字');
    const ups = typeof gainExp === 'function' ? gainExp(Q.reward.exp) : 0; toast('修为 +' + Q.reward.exp, 1800); if (ups && typeof levelUpShow === 'function') await levelUpShow(lv0);
  }
  window.R216T = { st, Q, finale, gate: [gx, gy] };
})();
