// ================= R279 · 悦来大堂：坐着吃喝的客人上桌（Codex R277 整桌连人画，6 帧 240ms）=================
// 作者 11-14：「找 codex 做适配这个素材的人物坐帧喝酒吃饭，让他能和我们的桌椅融合在一起」。
// Codex 交了八桌，大堂只有六张桌，挑六桌：划拳（镖师 + 行商）、老人夹菜、女侠喝茶、车夫吃饭、醉汉伏桌、大嫂说笑。
// 原来靠墙站着的镖师、行商、女侠、老人家，改成坐在桌上（站着那一份撤掉，免得一个人出现两次）；二楼的书生、小姐照旧站着。
// 每桌的人都能说话（对着桌边点）。只进测试版。
(function () {
  const T = typeof TMAPS !== 'undefined' && TMAPS.qy_inn; if (!T || !T.baked || typeof IMG === 'undefined') return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const FR = {};
  const key = (k, ph) => { const id = 'r279_' + k; if (Object.getOwnPropertyDescriptor(IMG, id)) return id;
    try { Object.defineProperty(IMG, id, { configurable: true, enumerable: true, set: () => {}, get: () => { const a = FR[k]; return a ? a[(Math.floor(performance.now() / 240) + ph) % 6] : undefined; } }); } catch (e) {} return id; };
  const load = k => { const im = new Image(); im.onload = () => { const a = []; for (let i = 0; i < 6; i++) { const c = document.createElement('canvas'); c.width = 344; c.height = 344; c.getContext('2d').drawImage(im, i * 344, 0, 344, 344, 0, 0, 344, 344); a.push(c); } FR[k] = a; }; im.src = 'r279/' + k + '.webp'; };
  // 六张桌的位置（r269 的桌子左上角） → 换哪一桌；dx/dy 是 Codex 给的「新帧左上角 - 原桌左上角」
  const SLOT = [
    [620, 585, 't01', 12, -21], [1090, 585, 't04', 17, -18],
    [620, 765, 't03', 15, -19], [1090, 765, 't06', 11, -16],
    [620, 945, 't05', 12, -20], [1090, 945, 't07', 12, -16],
  ];
  const B = T.baked;
  B.objs = B.objs.filter(o => !(String(o.id).indexOf('table_set') === 0 && o.y > 500));
  SLOT.forEach(([X, Y, k, dx, dy], i) => { load(k);
    B.objs.push({ id: 'r279_' + k, uid: 'r279_' + k, img: key(k, i * 2), x: X + dx, y: Y + dy, w: 172, h: 172, sy: Y + dy + 161, flip: false, noBlock: true, noPre: true }); });

  // 原来站着的四位 → 坐到桌上（人身上的对话跟着走，台词改成坐着的样子）
  const SEAT = {
    押镖的镖师: [655, 680, ['镖车停在镇口，弟兄们轮流守着。我下来喝两口，就两口……（转头）五魁首啊！', '黑风谷那条道现在太平多了。听说是天剑宗的几个年轻人去收拾的？']],
    贩茶的行商: [780, 680, ['（他划拳输了，仰头灌下一碗）从南边贩茶上来，走了二十天，输一碗不亏！', '楼上天字号房贵是贵，有浴桶。走了二十天路，泡一回热汤，值。']],
    抱剑的女侠: [1250, 680, ['（她一边喝茶，一边盯着隔壁桌划拳的那位押镖的。）', '那人的刀鞘是新换的，刀柄上的缠绳却旧得发黑。……换鞘不换刀，必有缘故。']],
    听书的老人家: [780, 860, ['孙子嘴刁，不夹到碗里不吃。……说书先生今儿个没来，老汉就陪他吃顿饭。', '青阳镇三十年前可没这么热闹。那时候这儿还是个车马店，楼上是后来才加盖的。']],
  };
  for (const n of T.npcs || []) { const s = SEAT[n.name]; if (!s) continue; const [c, r] = P(s[0], s[1]); n.c = c; n.r = r; n.hidden = true; n.h = 100; n.talk = s[2]; n.random = true; }
  // 另外三桌的人
  const reg = n => { try { SPEAKERS[n] = SPEAKERS[n] || { p: '', color: '#e8d7b0' }; } catch (e) {} };
  const add = (x, y, name, talk) => { reg(name); const [c, r] = P(x, y); T.npcs.push({ key: 'none', c, r, name, hidden: true, h: 100, talk, random: talk.length > 1 }); };
  add(718, 1060, '赶车的车夫', ['（他埋头扒饭，头也不抬。）', '吃完这碗还得赶车去玄天城。八方来的掌柜托我捎一箱账本过去，沉得要命，也不知道里头记的什么。']);
  add(1120, 860, '醉倒的酒客', ['（他趴在桌上打着呼噜，手边倒着一只空酒壶。）', '……再、再来一壶……记、记账上……']);
  add(1130, 1040, '卖豆腐的刘嫂', ['你听说没有？孙家那闺女在后厨帮工，说玄天城的云来一间上房，够她挣半年！', '哎哟喂，那得是什么样的床啊，金子打的？']);
  add(1250, 1040, '绣坊的周嫂', ['（她拍着桌子笑出了眼泪）刘嫂你可别逗了！', '我当家的说，八方来的东家一年到头没人见过，账本倒是一箱一箱地往玄天城送。']);
  window.R279 = 1;
})();
