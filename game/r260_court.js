// ================= R260 · 天剑宗玄天据点 · 前院（拼接法重做，替换 R258 那一版）=================
// 作者 11-13：「据点进去之后两边的墙不对，划分跟我们不统一；树、泥土都不像我们的画风——让 Codex 重新出素材，用拼接法，不要用剪切法，一点点铺出来。」
// 这一版照城主府前院、林府曲水花庭的规矩：四面墙（上下一排墙段、左右竖墙），青石砖地 + 草地。
// 墙、大门、树、竹、灯、石狮、剑旗、兵器架、告示板、木人桩、客房都是游戏里原有的素材原图；新画的只有正厅、地面、洗剑池的剑柱、草靶和立桩。
// 进出：玄天城据点大门 → 前院 → 正厅台阶下的传送阵进正厅；东北那栋是客舍，门前传送阵进客舍；西北那栋是弟子斋舍（不能进）。只进测试版。
(function () {
  const D = window.R260_COURT; if (!D || typeof TMAPS === 'undefined' || !TMAPS.xt_city || !TMAPS.xt_sect_hall) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  const K = 'r260c_';
  load(K + 'g', 'r260/court/g.webp'); for (const f of new Set(D.objs.map(o => o.f))) load(K + f, 'r260/court/o_' + f + '.webp');
  // 北墙（wall）和贴地的水池、灌木、花带、草丛（floor）先画在地上；其余按脚底和人一起排前后
  // 作者 11-13 晚：「这张地图人物和建筑比例不对」——量下来是几样摆件画大了：灯柱有人的 2.2 倍高、木人桩和草靶比人还高一截、兵器架和剑旗也偏大。
  // 照城主府前院的比例（灯柱约 1.6–1.7 个人高，木人桩、草靶和人差不多高）。
  // 作者 11-13 晚又说：不只是摆件，镜头也要拉远（广角），不然地砖太糊 → 这张图镜头按城主府前院拉到 0.8（人在屏幕上一样大，地图整体小一圈），摆件只再收一点点。
  const SHRINK = { dummy: .85, straw_target: .9 };
  try { MAP_ZOOM.xt_sect_court = .8; } catch (e) {}
  const objs = D.objs.map((o, i) => { const flat = o.layer !== 'depth', k = SHRINK[o.f] || 1, ax = o.x + o.w / 2, w = Math.round(o.w * k), h = Math.round(o.h * k);
    return { id: o.id, uid: 'r260c_' + i, img: K + o.f, x: Math.round(ax - w / 2), y: Math.round(o.sy - (o.sy - o.y) * k), w, h, sy: flat ? 1 : o.sy, ax, ay: o.sy, flat, flip: false, noBlock: true, noPre: true }; });
  const cell = R => ({ x: Math.floor(R[0] / D.cs), y: Math.floor(R[1] / D.cs), w: Math.ceil(R[2] / D.cs), h: Math.ceil(R[3] / D.cs) });
  const reg = n => { try { SPEAKERS[n] = SPEAKERS[n] || { p: '', color: '#cfe0ff' }; } catch (e) {} };
  const man = (key, xy, name, talk, o) => { const [c, r] = P(xy[0], xy[1]); reg(name); return Object.assign({ key, c, r, name, h: 116, wander: false, face: 'down', talk, random: true }, o || {}); };
  const walker = (cx, xy, name, talk, o) => man('none', xy, name, talk, Object.assign({ cx }, o || {}));
  const spot = (xy, name, talk) => { const [c, r] = P(xy[0], xy[1]); return { key: 'none', c, r, name, hidden: true, h: 110, talk, random: talk.length > 1 }; };
  const S_ = D.spots, hall = TMAPS.xt_sect_hall, rest = TMAPS.xt_sect_rest, door = id => D.doors.find(d => d.id === id), inter = id => D.inter.find(x => x.id === id);
  const npcs = [
    man('c_a3', S_.practice_1, '练剑的弟子', ['一百遍劈，一百遍刺。执事说，木桩不会还手，可木桩也不会说谎。', '少宗主！……我这一式「点星」，手腕是不是又高了？', '据点里地方小，练剑只能在这块土场上。山上的演武场，一个角就比这院子大。']),
    man('c_a5', S_.practice_2, '对练的女弟子', ['师兄的剑太直，我的剑太飘。执事让我们俩对练，说是互相治病。', '那棵老槐树比据点的岁数还大。夏天在树底下打坐，一身的汗都是凉的。']),
    walker('disciple_m', S_.notice_reader, '看榜的弟子', ['告示上新贴了一张：城南灵灯夜里暗了三盏，查明缘由者，记宗门贡献三十。', '护送、探查、清剿……我的修为只够接护送。慢慢来。', '任务牌子正厅玉璧上也有。这块告示板贴的是给外门和杂役的零活。'], { face: 'up' }),
    man('c_d3', S_.sword_washer, '池边洗剑的女弟子', ['洗剑池的水是从后山引的活水。剑上沾了妖血，在这儿洗过，煞气才散得干净。', '池子中间那柄石剑，是建据点那年立的。', '我明日要去幽影林。今晚把剑擦亮些，心里踏实。']),
    walker('disciple_m', S_.aisle_walker, '巡院的弟子', ['巡院。一个时辰一圈，大门、正厅、客舍、斋舍。', '西北那栋是弟子斋舍，我们几个就住那儿。少宗主要歇脚，客舍在东北，被褥是新晒的。', '夜里城里的灵灯一盏一盏亮起来，从这院墙上看过去，好看得很。'], { wander: true }),
  ];
  { const t = inter('task_notice'); if (t) npcs.push(spot(t.stand, '任务告示板', ['告示板上贴着七八张告示，墨迹有新有旧。最上头那张盖着据点长老的印。', '「城南灵灯夜暗三盏，查明缘由者，记宗门贡献三十。」'])); }
  { const t = inter('sword_washing_pool'); if (t) npcs.push(spot(t.stand, '洗剑池', ['池水清得见底，几片睡莲叶子浮在水面上。池心立着一柄石剑。'])); }
  { const t = inter('training'); if (t) npcs.push(spot([t.stand[0] - 150, t.stand[1] + 40], '练剑场', ['黄土场子被踩得平平整整。木人桩上留着一道道剑痕，草靶正中已经被刺穿了。'])); }
  const [sx, sy] = D.spawn, hd = door('hall_door'), gd = door('guest_room_door');
  TMAPS.xt_sect_court = { title: '天剑宗玄天据点 · 前院', baked: { ground: K + 'g', cs: D.cs, cols: D.cols, rows: D.rows, w: D.w, h: D.h, blocked: D.blocked, objs }, indoor: false, npcs, chests: [], start: P(sx, sy - 16),
    doors: [
      hd ? { x: hd.stand[0], y: hd.stand[1], rw: 46, rh: 22, to: 'xt_sect_hall', at: hall.start, face: 'up', label: '正厅' } : null,
      gd && rest ? { x: gd.stand[0], y: gd.stand[1], rw: 40, rh: 20, to: 'xt_sect_rest', at: rest.start, face: 'up', label: '客舍' } : null,
    ].filter(Boolean),
    exits: [Object.assign(cell(D.exit), { to: 'xt_city', at: P(960, 892), face: 'down', label: '出门 · 玄天城' })] };
  // 改线：城里的门 → 前院大门里；正厅出门 → 正厅台阶下；客舍出门 → 客舍门前
  for (const d of TMAPS.xt_city.doors || []) if (d.to === 'xt_sect_hall' || d.to === 'xt_sect_court') Object.assign(d, { to: 'xt_sect_court', at: P(sx, sy - 16), face: 'up' });
  if (hd) for (const e of hall.exits || []) if (e.to === 'xt_city' || e.to === 'xt_sect_court') Object.assign(e, { to: 'xt_sect_court', at: P(hd.stand[0], hd.stand[1] + 44), face: 'down', label: '出门 · 前院' });
  if (rest && gd) for (const e of rest.exits || []) if (e.to === 'xt_sect_hall' || e.to === 'xt_sect_court') Object.assign(e, { to: 'xt_sect_court', at: P(gd.stand[0], gd.stand[1] + 44), face: 'down', label: '出门 · 前院' });
  hall.doors = (hall.doors || []).filter(d => d.to !== 'xt_sect_rest');   // 正厅里通客舍的临时传送阵撤掉（客舍从前院进）
  // 作者 11-13：「守门弟子不应该是这样子，不好看，换个造型」「天剑宗弟子怎么会这么土，打扮得和普通人一样」
  // → 据点里站着不动、脸朝外的弟子，用天剑宗山上（演武广场）那一套弟子的样子；会走动的、背对着人的还用原来能走路、有背面的那套。
  try { const LOOK = { 守门弟子: 'c_a3', 侍立弟子: 'c_d2', 候命弟子: 'c_a5' };
    for (const m of ['xt_city', 'xt_sect_hall']) for (const n of (TMAPS[m] && TMAPS[m].npcs) || []) { const k = LOOK[n.name]; if (!k || n.wander || (n.face && n.face !== 'down')) continue; n.key = k; delete n.cx; } } catch (e) {}
})();
