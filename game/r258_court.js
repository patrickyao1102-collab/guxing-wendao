// ================= R258 · 天剑宗玄天据点 · 前院（Codex R239 v5，按《素材制作铁律》重做的第五版）=================
// 作者否过四版：门里露出地毯难看、在概念图里堆东西会糊、画风不统一。v5：整院一张母画（3584×2560，12 块原生拼合）定画风，
// 地面另铺新地材（错缝大石板、甬道、剑云圆徽、练剑土场），大槐树、竹林、洗剑池、任务榜亭、院墙门柱都从母画原位剪成遮挡层。
// 进出：玄天城据点大门 → 前院 → 上台阶进正厅；东北角月洞门 → 客舍。正厅出门回到前院。只进测试版。
(function () {
  const D = window.R239_COURT; if (!D || typeof TMAPS === 'undefined' || !TMAPS.xt_city || !TMAPS.xt_sect_hall) return;
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  load('r239c_g', 'r239/court/g.webp'); for (const o of D.objs) load('r239c_' + o.f, 'r239/court/o_' + o.f + '.webp');
  const objs = D.objs.map((o, i) => ({ id: o.id, uid: 'r239c_' + i, img: 'r239c_' + o.f, x: o.x, y: o.y, w: o.w, h: o.h, sy: o.flat ? 1 : o.sy, ax: o.x + o.w / 2, ay: o.sy, flat: o.flat, flip: false, noBlock: true, noPre: true }));
  const cell = R => ({ x: Math.floor(R[0] / D.cs), y: Math.floor(R[1] / D.cs), w: Math.ceil(R[2] / D.cs), h: Math.ceil(R[3] / D.cs) });
  const man = (cx, xy, name, talk, o) => { const [c, r] = P(xy[0], xy[1]); try { SPEAKERS[name] = SPEAKERS[name] || { p: '', color: '#cfe0ff' }; } catch (e) {} return Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk, random: true }, o || {}); };
  const spot = (xy, name, talk) => { const [c, r] = P(xy[0], xy[1]); return { key: 'none', c, r, name, hidden: true, h: 110, talk, random: talk.length > 1 }; };
  const S_ = D.slots, hall = TMAPS.xt_sect_hall, rest = TMAPS.xt_sect_rest;
  const npcs = [
    man('disciple_m', S_.practice_1, '练剑的弟子', ['一百遍劈，一百遍刺。执事说，木桩不会还手，可木桩也不会说谎。', '少宗主！……我这一式「点星」，手腕是不是又高了？', '据点里地方小，练剑只能在这块土场上。山上的演武场，一个角就比这院子大。']),
    man('disciple_f', S_.practice_2, '对练的女弟子', ['师兄的剑太直，我的剑太飘。执事让我们俩对练，说是互相治病。', '那棵老槐树比据点的岁数还大。夏天在树底下打坐，一身的汗都是凉的。']),
    // 作者 11-13：天剑宗弟子不能打扮得和街上的普通人一样——看榜的、擦剑的都换成宗门弟子的装束；扫院杂役、歇脚的老弟子先撤下（等专门的宗门造型画好再放回来）
    man('disciple_m', S_.notice_reader, '看榜的弟子', ['榜上新贴了一张：城南灵灯夜里暗了三盏，查明缘由者，记宗门贡献三十。', '护送、探查、清剿……我的修为只够接护送。慢慢来。', '任务牌子正厅玉璧上也有。这座榜亭贴的是给外门和杂役的零活。'], { face: 'up' }),
    man('disciple_f', S_.sword_cleaner, '池边洗剑的女弟子', ['洗剑池的水是从后山引的活水。剑上沾了妖血，在这儿洗过，煞气才散得干净。', '池子中间那柄石剑，是建据点那年立的。水从剑脊上淌下来，一年四季不断。', '我明日要去幽影林。今晚把剑擦亮些，心里踏实。']),
    spot([1150, 1030], '任务榜亭', ['榜亭里贴着七八张告示，墨迹有新有旧。最上头那张盖着据点长老的印。']),
    spot([1420, 1100], '洗剑池', ['池水清得见底，几尾红鲤绕着石剑打转，睡莲叶子上滚着水珠。']),
  ];
  const [sx, sy] = D.spawn;
  // 作者 11-13：进正厅的传送阵放在台阶下的剑云圆徽上（不是门洞里），样子和别处的传送阵一样；月洞门前同理
  TMAPS.xt_sect_court = { title: '天剑宗玄天据点 · 前院', baked: { ground: 'r239c_g', cs: D.cs, cols: D.cols, rows: D.rows, w: D.w, h: D.h, blocked: D.blocked, objs }, indoor: false, npcs, chests: [], start: P(sx, sy - 16),
    doors: [
      { x: 896, y: 772, rw: 46, rh: 22, to: 'xt_sect_hall', at: hall.start, face: 'up', label: '正厅' },
      rest ? { x: 1676, y: 566, rw: 40, rh: 20, to: 'xt_sect_rest', at: rest.start, face: 'up', label: '月洞门 · 客舍' } : null,
    ].filter(Boolean),
    exits: [Object.assign(cell(D.exits.south_gate), { to: 'xt_city', at: P(960, 892), face: 'down', label: '出门 · 玄天城' })] };
  // 改线：城里的门 → 前院；正厅出门 → 前院台阶下；客舍出门 → 月洞门前
  for (const d of TMAPS.xt_city.doors || []) if (d.to === 'xt_sect_hall') Object.assign(d, { to: 'xt_sect_court', at: P(sx, sy - 16), face: 'up' });
  for (const e of hall.exits || []) if (e.to === 'xt_city') Object.assign(e, { to: 'xt_sect_court', at: P(896, 870), face: 'down', label: '出门 · 前院' });
  if (rest) for (const e of rest.exits || []) if (e.to === 'xt_sect_hall') Object.assign(e, { to: 'xt_sect_court', at: P(1676, 650), face: 'down', label: '出门 · 前院' });
  hall.doors = (hall.doors || []).filter(d => d.to !== 'xt_sect_rest');   // 正厅东南角通客舍的临时传送阵撤掉（客舍改从前院月洞门进）
  for (const n of hall.npcs || []) if (n.name === '任务执事' && typeof n.talk === 'function') { /* 台词里提过「东南角的阵法通客舍」，保持原样不影响进出 */ }
})();
