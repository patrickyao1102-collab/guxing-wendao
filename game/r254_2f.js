// ================= R254 · 听雨楼二层按《素材制作铁律》重拼（替换 R246 那一版）=================
// 作者 11-13：「听雨楼二层要拼出来，不能是贴上去的概念图」「坐着的人太糊」——Codex R254 逐件重画（2 倍像素、1 倍坐标）：
// 紫藤花架、弧形栏杆和长凳按深度切成小片（人走在栏杆后面会被挡住）、花罩雅座、古琴桌、诗案、棋桌、红泥小炉、油纸大伞、露台圆桌；
// 八个人都会动：琴娘、书生、温先生是「身体 + 桌前手部」两层（手在拨弦、写字、落子），其余整人六帧；新加观雨的老先生、摇扇的妇人。
// 对话、上下楼照旧。只进测试版。
(function () {
  const M = typeof TMAPS !== 'undefined' && TMAPS.xt_teahouse_2f, D = window.R254_2F; if (!M || !D || typeof IMG === 'undefined') return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const ld = (key, file, n, ph) => { const im = new Image(), fr = []; let one = null;
    im.onload = () => { if (n <= 1) { one = im; return; } const w = im.width / n; for (let i = 0; i < n; i++) { const c = document.createElement('canvas'); c.width = w; c.height = im.height; c.getContext('2d').drawImage(im, i * w, 0, w, im.height, 0, 0, w, im.height); fr.push(c); } };
    im.src = 'r254f2/' + file;
    try { Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set: () => {}, get: () => n <= 1 ? one || undefined : fr.length ? fr[(Math.floor(performance.now() / 1000 * 6) + ph) % n] : undefined }); } catch (e) {} };
  let ph = 0; for (const [k, [f, n]] of Object.entries(D.files)) ld(k, f, n, (ph++ * 2) % 6);
  { const im = new Image(); im.onload = () => { try { IMG.r254g_2f = im; } catch (e) {} }; im.src = 'r254f2/g_2f.webp'; }
  M.baked = { ground: 'r254g_2f', w: D.w, h: D.h, cs: D.cs, cols: D.cols, rows: D.rows, blocked: D.blocked, objs: D.objs.map(o => Object.assign({}, o, { noPre: true })) };
  // 对话点挪到新的人旁边；新来的两位也能说话
  const T = D.talk, AT = { 抚琴女子: 'qin_player', 凭栏的白衣剑客: 'rain_swordsman', 对弈的茶客: 'chess_guest_sand', 写诗的书生: 'poet', 斟茶的茶娘: 'tea_attendant' };
  for (const n of M.npcs || []) { const k = AT[n.name]; const xy = k ? T[k] : n.name === '红泥小炉' ? D.stove : null; if (xy) { const [c, r] = P(xy[0], xy[1]); n.c = c; n.r = r; } }
  const spot = (xy, name, talk) => { const [c, r] = P(xy[0], xy[1]); try { SPEAKERS[name] = SPEAKERS[name] || { p: '', color: '#cfe6ea' }; } catch (e) {} return { key: 'none', c, r, name, hidden: true, h: 110, talk, random: true }; };
  if (T.chess_guest_blue) M.npcs.push(spot(T.chess_guest_blue, '执白的温先生', ['（他捻着一枚白子，半天没落下去。）……老贺这一手，是想引我去右上角送死。', '在这楼上下棋，输赢都记在雨里，下楼就忘了。']));
  if (T.rain_elder) M.npcs.push(spot(T.rain_elder, '观雨的老先生', ['老夫每逢下雨就上楼来。年轻时候淋过太多雨，老了，想看看雨落在别人头上是什么样子。', '那边那位白衣的，站了一个时辰了。不是在看雨，是在等人。']));
  if (T.fan_woman) M.npcs.push(spot(T.fan_woman, '摇扇的妇人', ['这楼上的茶钱，比楼下贵一倍。贵的那一半，买的是这片雨。', '下雨天还摇扇子？……扇子是我家那口子画的。他出城三个月了，我拿着它，就像他在旁边。']));
  const sp = P(D.spawn[0], D.spawn[1]); if (Array.isArray(M.start)) { M.start[0] = sp[0]; M.start[1] = sp[1]; } else M.start = sp;
  for (const e of M.exits || []) Object.assign(e, { x: Math.floor(D.exit.x / 8), y: Math.floor(D.exit.y / 8), w: Math.ceil(D.exit.w / 8), h: Math.ceil(D.exit.h / 8) });
})();
