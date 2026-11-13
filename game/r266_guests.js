// ================= R266 · 酒楼里的客人（第一批站姿：行商、镖师、书生、女侠、老人家、富家小姐）=================
// 作者 11-14：「座位帧那么多新东西，你赶快去」——六位客人每人一条 6 帧待机（摸钱袋、按刀、翻书、抱剑、拄杖、摇团扇），240ms 一帧。
// 先摆进醉仙楼：一楼过道站两位，说书角边上一位老人家，二楼回廊三位凭栏往下看。坐着的那一套做好再换上桌。只进测试版。
(function () {
  const T = typeof TMAPS !== 'undefined' && TMAPS.qy_tavern; if (!T || typeof IMG === 'undefined') return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8], FR = {};
  const key = (k, i) => { const id = 'r266_' + k + '_' + i; if (Object.getOwnPropertyDescriptor(IMG, id)) return id;
    try { Object.defineProperty(IMG, id, { configurable: true, enumerable: true, set: () => {}, get: () => { const a = FR[k]; return a ? a[(Math.floor(performance.now() / 240) + i * 2) % 6] : undefined; } }); } catch (e) {} return id; };
  const load = k => { const im = new Image(); im.onload = () => { const a = []; for (let i = 0; i < 6; i++) { const c = document.createElement('canvas'); c.width = 160; c.height = 240; c.getContext('2d').drawImage(im, i * 160, 0, 160, 240, 0, 0, 160, 240); a.push(c); } FR[k] = a; }; im.src = 'r266/' + k + '.webp'; };
  const G = [
    ['merchant', [545, 760], '贩茶的行商', ['从南边贩茶上来，走了二十天。醉仙楼的酒，是这一路上最好的。', '掌柜的说地窖里有一坛三十年的桂花酿，不卖。……那我就闻闻。']],
    ['escort', [1336, 650], '押镖的镖师', ['镖车停在镇口，弟兄们轮流守着。我下来喝两口，就两口。', '黑风谷那条道现在太平多了。听说是天剑宗的几个年轻人去收拾的？']],
    ['scholar', [900, 248], '赶考的书生', ['从这楼上往下看，满堂的人，各有各的心事。', '「醉仙」二字题得好。可我看这楼里，醉的是凡人，仙一个也没有。']],
    ['heroine', [1120, 248], '抱剑的女侠', ['（她靠着栏杆，眼睛一直盯着楼下那位外地刀客。）', '那人的刀鞘是新换的，刀柄上的缠绳却旧得发黑。……换鞘不换刀，必有缘故。']],
    ['elder', [430, 1000], '听书的老人家', ['说书先生今儿个没来，老汉我就坐这儿等。等着等着，一壶茶就凉了。', '青阳镇三十年前可没这么热闹。那时候镇上就一家酒馆，就是这儿，叫「醉仙」，名字倒没改过。']],
    ['lady', [680, 248], '凭栏的富家小姐', ['爹爹不许我下楼，说楼下都是粗人。……可是楼下多热闹呀。', '那个弹琵琶的姐姐，我能听她弹一整天。']],
  ];
  G.forEach(([k, xy, name, talk], i) => { load(k); const [c, r] = P(xy[0], xy[1]);
    try { SPEAKERS[name] = SPEAKERS[name] || { p: '', color: '#e8d7b0' }; } catch (e) {}
    (T.npcs = T.npcs || []).push({ key: key(k, i), c, r, name, h: 120, wander: false, face: 'down', flip: false, talk, random: true, _r266: 1 }); });
})();
