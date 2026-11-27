// ================= R424 · 万妖塔：迷宫层（只进测试版）=================
// 作者 11-27：「每一层空间那个迷宫……设计的跟本层关底 BOSS 有什么关联……跟《仙剑》锁妖塔一样」「点铸剑师进入副本」。
// 地图是 Codex R418 用素材一件件拼的（tools/r424_build.py 转成 r424/）：底图 + 按行切开的前景（人从墙后走过会被挡住）+ 会换态的机关和门。
// 玩法：迷宫里有三处机关（一层照魂灯 / 二层绞盘），三处都开了，首领那道门才开；路上散着遗物，点了有一段话（剧本作者看过）；
//       走着走着会撞上塔里的怪（像仙剑锁妖塔一样是暗雷），比外面的凶、经验多五成；门开了去找首领，打赢放故事、收进镇妖图卷。
// 入口：云海后庭淬剑潭边的铸剑师（r394：点他选「进万妖塔」）。塔下荒原（Codex R412）到了以后改成先到荒原、再从塔门选层。
(function () {
  const META = window.R424_META; if (!META || !window.TOWER || typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const F = () => (S.flags = S.flags || {}), TS64 = 64, CS = 40, P = (x, y) => [x / TS64 - .5, y / TS64 - .8];
  const ST = n => { const t = F().tw || (F().tw = {}); return t['f' + n] || (t['f' + n] = { mech: [], relic: [], gate: 0, seen: 0, chest: 0 }); };
  const BACK = ['qingzhu_upper_pavilion', ...P(-200, 640)];   // 出塔回到铸剑师身边
  const NEED_LV = { 1: 10, 2: 13 };
  // ---------- 各层的话（剧本：Claude 写、Gemini 润色、作者看过） ----------
  const TXT = {
    1: { title: '万妖塔 · 第一层 · 彼岸花海', mech: '照魂灯', mechVerb: '点亮', mobs: [['tw_huayan', 'tw_huayan'], ['tw_mengkui', 'tw_huayan'], ['tw_mengkui', 'tw_mengkui', 'tw_huayan']],
      intro: [['', '（身后的石门沉沉合拢。眼前是望不到头的血红花海，青石板路全被落花盖住了，花丛深处隐约躺着几道一动不动的人影。）'], ['星旋', '小子，少吸两口。这花香不对劲，闻多了会做梦。'], ['叶孤星', '做梦又怎样？'], ['星旋', '做了，就不想醒了。'], ['云霆', '……路在动。'], ['星旋', '不是路在动，是花香迷了你的眼。瞧见那三盏石灯没？全点亮，花墙才会让路。']],
      mechLines: ['（魂火「噗」地燃起，近处的红花齐齐垂下了头。）', '（风里隐约传来笑声，转眼又化作哭声，风一吹，全散了。）', '（花墙枯萎退开，露出一条小径。花海深处，有人正背对着这边。）'],
      relics: [[['', '（死胡同的石凳上，搁着一本薄册子，纸页被花汁洇成了淡红。每页只写一个名字，底下缀着一行小字。）'], ['', '「陈三娘，梦见她从军的儿子回来了。」「赵守义，梦见他还没出嫁的闺女。」「无名，梦见她自己。」……'], ['叶孤星', '每一页，都是一个睡在这儿的人。'], ['云霆', '她记着他们。']],
        [['', '（花根下压着一把褪了色的木梳，梳齿间还缠着几根白发。）'], ['叶孤星', '……梳头用的。'], ['星旋', '躺进这片花海的人，最舍不得的，往往就是这些零碎。']],
        [['', '（花墙前躺着一截斩断的老根，断口还在往外渗红汁，上面留着一道极深的剑痕。）'], ['星旋', '好利落的一剑……不过，出剑的人当年也没下得去第二剑。']]],
      gateShut: '（一堵长满巨大血色花苞的花墙，严严实实堵住了去路。）',
      meet: [['', '（一株巨大的血色花树下，女子正俯身替花丛里熟睡的老人掖好衣角。）'], ['绛蘅', '嘘——轻点声。他正梦见老伴呢，在给她梳头，别吵醒他。'], ['叶孤星', '他再也醒不过来了。'], ['绛蘅', '（缓缓回过头，笑得温温柔柔）醒来做什么呢？外头又没有等他的人。（目光落在叶孤星身上）你心里也藏着个想见的人吧？很淡，很远……我送你去见一面，好不好？'], ['云霆', '（一声不吭，横剑一步跨到叶孤星身前。）'], ['绛蘅', '真是位冷脸的哥哥。那就——两个一起留下来睡吧。']],
      boss: '绛蘅', pic: 'r415/bianhua_f1_pic.webp?v=1', picH: 210, chest: [[['q_jing', 2], ['g_mu2', 1]], [['juan4', 1], ['q_jing', 1]]], chestTxt: '（花丛根下埋着一只朽了一半的木匣。）', prize: [['q_jing', 2], ['g_mu2', 1]] },
    2: { title: '万妖塔 · 第二层 · 北关雪城', mech: '绞盘', mechVerb: '转开', mobs: [['tw_xuewei', 'tw_bingjia'], ['tw_xuewei', 'tw_xuewei'], ['tw_bingjia', 'tw_bingjia', 'tw_xuewei']],
      intro: [['', '（刺骨的风雪扑面而来。眼前是一段被积雪掩埋的古城墙，城垛上斜插着一面残破军旗。）'], ['星旋', '冷吧？这地方的雪，三百年没化过了。'], ['叶孤星', '这么高的城墙……是用来守关的。'], ['星旋', '守什么关，墙里头早就空了。看见那三道铁闸没？转开三个绞盘，才见得着守关的那位。']],
      mechLines: ['（铁链「哗啦」绞紧，远处第一道铁闸吱呀着抬起一截。）', '（风雪深处传来一声低沉虎啸，城墙上的积雪簌簌震落。）', '（最后一道铁闸轰然升起。城楼之上，一道银甲身影立在风雪里，背对着这边，死死望着北方。）'],
      relics: [[['', '（一只拍开封泥的旧酒坛，里头的酒早已冻成了冰。坛边整整齐齐摆着一排粗瓷碗，全倒扣在雪里。）'], ['叶孤星', '酒碗全倒扣着……这是敬死人的规矩。'], ['云霆', '一、二……十九只。']],
        [['', '（半截军旗插在雪里，原本四个大字，如今只剩三个还看得清：「北关不——」）'], ['叶孤星', '北关不破。'], ['星旋', '最后一个字兴许是叫风撕烂的。也兴许……是它自己扯掉的。']],
        [['', '（一块生着暗红锈的铜腰牌，正面刻着「虎卫十九」，背面用刀尖歪歪扭扭刻了两个字：「阿满」。）'], ['叶孤星', '阿满……像是个孩子的乳名。'], ['星旋', '守边关的兵，十个里头有九个，腰牌背面都刻着家里人的名字。']]],
      gateShut: '（铁闸落着，粗铁栅一根根插进雪里，纹丝不动。）',
      meet: [['', '（城楼垛口前，银甲白发的将军拄着一杆断戟，背对二人。）'], ['玄锋', '（头也不回）回去。'], ['叶孤星', '我们是来闯塔的。'], ['玄锋', '关外的东西，一个也不许进来。'], ['叶孤星', '关外……早就没有妖潮了。已经过去三百年了。'], ['玄锋', '（缓缓转过身，金色竖瞳里没有半点温度）那你们，便是关外来的。']],
      boss: '玄锋', pic: 'r415/baihu_f1_pic.webp?v=1', picH: 220, chest: [[['q_jing', 2], ['g_jin2', 1]], [['juan4', 1], ['q_jing', 1]]], chestTxt: '（雪堆里半埋着一口军中的铁皮箱，锁早叫冻裂了。）', prize: [['q_yu', 1], ['g_jin2', 1], ['juan4', 1]] } };
  // ---------- 图 ----------
  const MECH = n => META['f' + n].objs.filter(o => o.states && !o.opens_when && !o.follows && /^(lamp|winch)/.test(o.name));
  const GATE = n => META['f' + n].objs.find(o => o.opens_when);
  const key = (n, name) => 'r424_f' + n + '_' + name;
  const want = {}, got = {};
  function ld(n, name) { const k = key(n, name); if (k in want) return; want[k] = 1; const im = new Image(); im.onload = () => { IMG[k] = im; got[k] = 1; }; im.onerror = () => { got[k] = 1; }; im.src = 'r424/f' + n + '/' + name + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {} }
  const PIC = {}; const pic = n => { const s = TXT[n].pic; let a = PIC[s]; if (!a) { a = PIC[s] = new Image(); a.src = s; } return a.complete && a.naturalWidth ? a : null; };
  function loadAll(n) { const M = META['f' + n]; ld(n, 'base'); for (const [r] of M.strips) ld(n, 'ov_' + r);
    for (const o of M.objs) { if (o.img) ld(n, o.img[0]); for (const s of Object.values(o.states || {})) ld(n, s[0]); for (const f of o.frames || []) ld(n, f[0]); } pic(n); }
  { const o = window.MAP_EXTRA_READY; window.MAP_EXTRA_READY = m => { let a = 1; try { a = o ? o(m) : 1; } catch (e) {} if (a == null) a = 1; const mm = /^wyt_f(\d)$/.exec(m || ''); if (!mm) return a; const n = +mm[1]; loadAll(n); const ks = Object.keys(want).filter(k => k.startsWith('r424_f' + n + '_')); return Math.min(a, ks.length ? ks.filter(k => got[k]).length / ks.length : 0); }; }
  // ---------- 地图 ----------
  const RELIC_N = n => TXT[n].relics.length;
  function build(n) { const M = META['f' + n], cols = M.w / CS, rows = M.h / CS, g = M.grid, ts = M.ts, k = ts / CS;
    const bl = new Array(cols * rows).fill('0'); const blk = (x0, y0, x1, y1) => { for (let r = Math.floor(y0 / CS); r <= Math.floor((y1 - 1) / CS); r++) for (let c = Math.floor(x0 / CS); c <= Math.floor((x1 - 1) / CS); c++) if (r >= 0 && c >= 0 && r < rows && c < cols) bl[r * cols + c] = '1'; };
    g.forEach((row, R) => [...row].forEach((ch, C) => { if (ch === '#') blk(C * ts, R * ts, (C + 1) * ts, (R + 1) * ts); }));
    for (const o of MECH(n)) blk(o.x - 34, o.y - 30, o.x + 34, o.y + 4);
    for (const o of M.objs) if (o.blocks) blk(...o.blocks);
    const dais = M.objs.find(o => o.name === 'boss_dais'); if (dais) blk(dais.x - dais.img[1] / 2 + 20, dais.y - dais.img[2] + 20, dais.x + dais.img[1] / 2 - 20, dais.y - 50);
    for (const o of M.objs) if (/stele|halberd|tree|gatehouse/.test(o.name) && o.img) blk(o.x - o.img[1] * .3, o.y - 24, o.x + o.img[1] * .3, o.y + 2);
    const objs = [];
    for (const [r, x, y, w, h] of M.strips) objs.push({ id: 'r424_ov', uid: key(n, 'ov_' + r), img: key(n, 'ov_' + r), x, y, w, h, sy: r * ts + ts * .62, flat: false, flip: false, noBlock: true, noPre: true });   // 第 r 行墙的前景：人在这行墙北边（脚在它上面）就被挡住
    for (const o of M.objs) { if (o.layer === 'atmosphere') continue; const im = o.img || (o.frames && o.frames[0]) || (o.states && (o.states[o.initial] || Object.values(o.states)[0])); if (!im) continue;
      objs.push({ id: 'r424_obj', uid: key(n, o.name), img: key(n, im[0]), r424: { n, o }, x: o.x - im[1] / 2, y: o.y - im[2], w: im[1], h: im[2], sy: o.foreground ? o.y - 60 : o.y, flat: /dais/.test(o.name), flip: !!o.flip, noBlock: true, noPre: true }); }
    if (dais) objs.push({ id: 'r424_obj', uid: key(n, 'boss_pic'), img: key(n, 'base'), r424: { n, o: { name: 'boss_pic', x: dais.x, y: dais.y } }, x: dais.x - 200, y: dais.y - 420, w: 400, h: 420, sy: dais.y - 40, flat: false, flip: false, noBlock: true, noPre: true });
    const E = M.entrance ? M.entrance.center : [M.w / 2, M.h - 100];
    const npcs = [];
    const spot = (name, x, y, talk, h = 120, extra) => { const [c, r] = P(x, y); npcs.push(Object.assign({ key: 'none', c, r, name, hidden: true, h, wander: false, r424: n, talk }, extra || {})); };
    MECH(n).forEach((o, i) => spot(TXT[n].mech, o.x, o.y + 30, () => mech(n, i), 120));
    const gate = GATE(n); if (gate) spot(n === 1 ? '花墙' : '铁闸', gate.x, gate.y + 20, () => shut(n), 150, { cond: () => !ST(n).gate });
    (M.relics || []).forEach((rl, i) => { if (i < RELIC_N(n)) spot('遗物', rl.center[0], rl.center[1] + 30, () => relic(n, i), 60); });
    (M.chests || []).forEach((c, j) => { if (TXT[n].chest && TXT[n].chest[j]) spot('残匣', c[0], c[1] + 30, () => chest(n, j), 70); });
    if (dais) spot(TXT[n].boss, dais.x, dais.y - 40, () => boss(n), 200);
    TMAPS['wyt_f' + n] = { title: TXT[n].title, name: 'wyt_f' + n, indoor: false, leaves: false, chests: [], npcs, start: P(E[0], E[1] - 70),
      baked: { ground: key(n, 'base'), w: M.w, h: M.h, cs: CS, cols, rows, blocked: bl.join(''), objs },
      exits: [{ x: Math.floor((E[0] - 150) / CS), y: rows - 1, w: Math.ceil(300 / CS), h: 1, to: BACK[0], at: [BACK[1], BACK[2]], face: 'down', label: '出塔' }] };
    if (typeof MAP_ZOOM === 'object') MAP_ZOOM['wyt_f' + n] = MAP_ZOOM.qingzhu_upper_pavilion || 1; }
  build(1); build(2);
  // 门开着的那一格不挡路；机关、门换态
  const gateCells = n => { const g = GATE(n), M = META['f' + n]; return g ? [Math.floor((g.x - M.ts / 2) / CS), Math.floor((g.y - M.ts) / CS), M.ts / CS] : null; };
  function applyGate(n) { try { if (world.mapName !== 'wyt_f' + n) return; const T = world.map.T, gc = gateCells(n); if (!gc) return; const [c0, r0, k] = gc, v = ST(n).gate ? 0 : 1; for (let r = r0; r < r0 + k; r++) for (let c = c0; c < c0 + k; c++) if (T.block[r]) T.block[r][c] = v; } catch (e) {} }
  tileSetMap = (orig => function (m) { const mm = /^wyt_f(\d)$/.exec(m || ''); if (mm) loadAll(+mm[1]); const res = orig.apply(this, arguments); if (mm) { applyGate(+mm[1]); STEP.d = 0; STEP.next = 700 + Math.random() * 500; } return res; })(tileSetMap);
  const stateOf = (n, o) => { const S2 = ST(n), ms = MECH(n), name = o.follows || o.name, i = ms.findIndex(x => x.name === name);
    if (window.R427_STATE) { const s3 = R427_STATE(n, o); if (s3) return s3; }
    if (o.opens_when) return S2.gate ? 'open' : 'closed'; if (i >= 0) { const on = !!S2.mech[i]; return on ? (o.states.on ? 'on' : 'turned') : (o.states.off ? 'off' : 'idle'); } return o.initial; };
  drawBaked = (orig => function (o, now) { if (!o || (o.id !== 'r424_obj' && o.id !== 'r424_ov')) return orig.apply(this, arguments);
    if (o.id === 'r424_ov') return orig.apply(this, arguments);
    const { n, o: d } = o.r424; let k = o.img;
    if (d.name === 'boss_pic') { if (TOWER_STORY.cleared(n) || n !== curN()) return; const p = pic(n); if (!p) return; const h = TXT[n].picH, w = p.width * h / p.height, fy = d.y - (n === 1 ? 72 : 60);
      ctx.save(); ctx.globalAlpha = .97; ctx.translate(d.x, 0); ctx.scale(-1, 1); ctx.drawImage(p, -w / 2, fy - h, w, h); ctx.restore(); return; }
    if (d.states) { const s = d.states[stateOf(n, d)]; if (s) k = key(n, s[0]); }
    else if (d.frames) { const ms = d.frame_ms || 180, i = Math.floor(now * 1000 / ms + d.x * .01) % (d.frames.length * 2 - 2), j = i < d.frames.length ? i : d.frames.length * 2 - 2 - i; k = key(n, d.frames[j][0]); }
    const im = IMG[k]; if (!im) return; ctx.save(); if (o.flip) { ctx.translate(o.x + o.w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(o.x + o.w / 2), 0); }
    ctx.drawImage(im, o.x, o.y, o.w, o.h);
    if (d.states && d.states.on && stateOf(n, d) === 'on') { const t = performance.now() / 1000, f = .7 + .3 * Math.sin(t * 5 + d.x); ctx.globalCompositeOperation = 'lighter'; const cx = o.x + o.w / 2, cy = o.y + o.h * .35, g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 70); g.addColorStop(0, `rgba(255,240,200,${.45 * f})`); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 70, cy - 70, 140, 140); }
    ctx.restore(); })(drawBaked);
  const curN = () => { const mm = /^wyt_f(\d)$/.exec(world.mapName || ''); return mm ? +mm[1] : 0; };
  // 遗物的一点闪光、氛围（雾 / 雪）
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function (T, cam, now) { if (orig) orig.apply(this, arguments); const n = curN(); if (!n) return;
    try { const M = META['f' + n], t = performance.now() / 1000, S2 = ST(n); ctx.save(); ctx.globalCompositeOperation = 'lighter';
      [...(M.relics || []).map((rl, i) => [rl.center, i < RELIC_N(n) ? S2.relic[i] : 1]), ...(M.chests || []).map((c, j) => [c, (S2.ch || [])[j] || !(TXT[n].chest || [])[j]])].forEach(([ctr, done], i) => { if (done) return; const [x, y] = ctr, f = .5 + .5 * Math.sin(t * 3 + i), g = ctx.createRadialGradient(x, y, 1, x, y, 26); g.addColorStop(0, `rgba(255,236,180,${.55 + .35 * f})`); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.fillRect(x - 26, y - 26, 52, 52);
        for (let j = 0; j < 3; j++) { const a = t * 1.3 + j * 2.1, rr = 12 + 6 * Math.sin(t * 2 + j); ctx.fillStyle = `rgba(255,246,210,${.6 * f})`; ctx.fillRect(x + Math.cos(a) * rr - 1, y - 8 + Math.sin(a) * rr * .5 - 1, 2, 2); } });
      MECH(n).forEach((o, i) => { if (S2.mech[i]) return; const f = .5 + .5 * Math.sin(t * 2.2 + i * 1.7), x = o.x, y = o.y - 30, g = ctx.createRadialGradient(x, y, 2, x, y, 58); g.addColorStop(0, `rgba(${n === 1 ? '255,214,170' : '200,230,255'},${.22 + .2 * f})`); g.addColorStop(1, 'rgba(255,220,180,0)'); ctx.fillStyle = g; ctx.fillRect(x - 60, y - 60, 120, 120); });
      ctx.globalCompositeOperation = 'source-over';
      for (const o of M.objs) { if (o.layer !== 'atmosphere' || !o.img) continue; const im = IMG[key(n, o.img[0])]; if (!im) continue; const dx = o.motion === 'horizontal_drift' ? Math.sin(t * .4 + o.y) * (o.max_offset_px || 10) : 0;
        if (o.motion === 'fall') { const ph = (t * 30 + o.x) % o.img[2]; ctx.globalAlpha = .8; ctx.drawImage(im, o.x - o.img[1] / 2, o.y - o.img[2] + ph - o.img[2]); ctx.drawImage(im, o.x - o.img[1] / 2, o.y - o.img[2] + ph); ctx.globalAlpha = 1; }
        else { ctx.globalAlpha = .85; ctx.drawImage(im, o.x - o.img[1] / 2 + dx, o.y - o.img[2]); ctx.globalAlpha = 1; } }
      ctx.restore(); } catch (e) {} })(typeof tileAmbientHigh === 'function' ? tileAmbientHigh : null);
  // ---------- 互动 ----------
  const lines = async L => { for (const [who, text] of L) await say(who, text); };
  async function mech(n, i) { const S2 = ST(n), X = TXT[n]; if (!S2.mech[i] && window.R427_MECH) { try { if (await R427_MECH(n, MECH(n)[i])) return; } catch (e) { console.warn('R427 mech', e); } } if (S2.mech[i]) { await narrate(X.mech + '已经' + X.mechVerb + '了。'); return; }
    S2.mech[i] = 1; try { playSnd(n === 1 ? 'sfx_buff' : 'sfx_boom', .6); } catch (e) {} S.shake = n === 2 ? 8 : 0; const k = S2.mech.filter(Boolean).length;
    await narrate(X.mechLines[Math.min(k, 3) - 1]);
    if (k >= MECH(n).length && !S2.gate) { S2.gate = 1; applyGate(n); try { playSnd('sfx_charge', .6); } catch (e) {} S.shake = 10; toast((n === 1 ? '花墙' : '铁闸') + '开了', 1800); }
    else if (k < MECH(n).length) toast(X.mech + ' ' + k + ' / ' + MECH(n).length, 1600); }
  async function shut(n) { await narrate(TXT[n].gateShut); await say('星旋', '三处' + TXT[n].mech + '都' + TXT[n].mechVerb + '了才开。迷宫里找找。'); }
  async function relic(n, i) { const S2 = ST(n); if (S2.relic[i]) { await narrate('这件东西已经看过了。'); return; } S2.relic[i] = 1; await lines(TXT[n].relics[i]); }
  async function chest(n, j) { const S2 = ST(n), ch = S2.ch || (S2.ch = []); if (ch[j]) { await narrate('匣子已经空了。'); return; } ch[j] = 1; const got2 = [];
    for (const [id, c] of TXT[n].chest[j] || []) if (ITEM_DB[id]) { addItem(id, c); got2.push(ITEM_DB[id].name + (c > 1 ? ' ×' + c : '')); }
    try { playSnd('ui_open', .7); } catch (e) {} await narrate(TXT[n].chestTxt); if (got2.length) await showPanel('残匣', ['!获得：' + got2.join('、')]); }
  async function boss(n) { if (TOWER_STORY.cleared(n)) { await narrate(n === 1 ? '花树下空荡荡的，只有落花。' : '城楼上只剩一杆断戟插在雪里。'); return; }
    if (!ST(n).gate) return shut(n);
    await lines(TXT[n].meet); world.locked = true; await fadeOut(240);
    const win = await TOWER.fightBoss(n); world.locked = true;
    if (win) { const got2 = []; if (!F()['tw_prize_' + n]) { F()['tw_prize_' + n] = 1; for (const [id, c] of TXT[n].prize || []) if (ITEM_DB[id]) { addItem(id, c); got2.push(ITEM_DB[id].name + (c > 1 ? ' ×' + c : '')); } }
      if (got2.length) await showPanel('万妖塔 · 第' + '一二三四五六七八九'[n - 1] + '层', ['镇妖图卷又展开了一幅。', '!获得：' + got2.join('、')]); }
    else { partyRevive(.3); const p = world.player; const M = META['f' + n], E = M.entrance.center; p.x = E[0]; p.y = E[1] - 70; await fadeIn(240); toast('败下阵来……养好伤、备足丹药再来', 3000); }
    world.locked = false; }
  // ---------- 暗雷：在迷宫里走一段就撞上塔里的怪 ----------
  const STEP = { d: 0, next: 900, lx: 0, ly: 0, busy: false };
  updateMap = (orig => function (dt) { const r = orig.apply(this, arguments);
    try { const n = curN(); const p = world.player; if (!n || !p || world.locked || STEP.busy || dialog || choice || sysPanel || (typeof battle !== 'undefined' && battle)) { if (p) { STEP.lx = p.x; STEP.ly = p.y; } return r; }
      const d = Math.hypot(p.x - STEP.lx, p.y - STEP.ly); STEP.lx = p.x; STEP.ly = p.y; if (d > 0 && d < 40) STEP.d += d;
      const E = META['f' + n].entrance.center; if (Math.hypot(p.x - E[0], p.y - E[1]) < 260) return r;   // 入口那一块不遇怪
      if (STEP.d >= STEP.next) { STEP.d = 0; STEP.next = 800 + Math.random() * 600; encounter(n); } } catch (e) {} return r; })(updateMap);
  async function encounter(n) { STEP.busy = true; world.locked = true; world.path = null; if (world.player) world.player.moving = false;
    try { const X = TXT[n], set = X.mobs[Math.floor(Math.random() * X.mobs.length)]; S.flash = .5; S.flashColor = n === 1 ? '#ff3a4a' : '#cfe8ff'; try { playSnd('sfx_claw', .6); } catch (e) {} await sleep(150); await fadeOut(200);
      const win = await TOWER.fightMobs(n, set); S.scene = drawMap;
      if (!win) { partyRevive(.3); const p = world.player, E = META['f' + n].entrance.center; p.x = E[0]; p.y = E[1] - 70; toast('败下阵来……回到入口', 2600); }
      await fadeIn(240); } catch (e) { console.warn('R424 enc', e); } finally { STEP.busy = false; world.locked = false; } }
  // ---------- 进塔：铸剑师那里选层 ----------
  async function enter() { const lv = (S.hero && S.hero.lv) || 1;
    const opts = [1, 2].map(n => { const ok = n === 1 || TOWER_STORY.cleared(n - 1); return '第' + '一二'[n - 1] + '层 · ' + (n === 1 ? '彼岸花海' : '北关雪城') + (TOWER_STORY.cleared(n) ? '（已镇）' : ok ? '' : '（封印未启）'); });
    const i = await choose('万妖塔', [...opts, '算了']); if (i < 0 || i >= 2) return; const n = i + 1;
    if (n > 1 && !TOWER_STORY.cleared(n - 1)) { await say('铸剑师', '第' + '一二三'[n - 2] + '层还镇着东西，上不去。'); return; }
    if (lv < NEED_LV[n]) { await say('铸剑师', '这身骨头进去，只够给里头的东西添点花肥。到 ' + NEED_LV[n] + ' 级再来。'); return; }
    if (!F().tw_told) { F().tw_told = 1; await say('铸剑师', '潭底下压着一座塔，九层，层层镇着上古的凶物。我守这潭，也守这道门。'); await say('铸剑师', '进去了，生死自理。打不过就往回跑——入口那块地方，它们不敢靠近。'); }
    const M = META['f' + n], E = M.entrance.center; await goMap('wyt_f' + n, ...P(E[0], E[1] - 70), 'up');
    if (!ST(n).seen) { ST(n).seen = 1; world.locked = true; try { await lines(TXT[n].intro); } finally { world.locked = false; } } }
  TOWER.enter = enter; TOWER.MAZE = { ST, TXT, META, build, MECH, key, ld, lines, curN, P };
})();
