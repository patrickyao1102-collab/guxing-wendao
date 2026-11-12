// ================= R213 · 青阳镇支线的新房子（Codex R213 交付，游戏画风）=================
// 倚翠楼：一楼琴堂 + 二楼听雨阁（苏晚在二楼）；长乐坊：一楼赌坊 + 二楼账房（掀了桌子才上得去）。
// 顶替 r212 里借苍月城室内图的两间屋子。地图数据在 r213/rooms.js（由 tools/r213_convert.py 生成）。
// 另外：河东剑碑、歪脖子老柳换成 Codex 新画的小物件；苏晚、庄家有了自己的地图小人和对话立绘。
(function () {
  const D = window.R213_ROOMS;
  if (!D || typeof TMAPS === 'undefined' || !TMAPS.qy_town || !TMAPS.qy_yicui || !TMAPS.qy_changle) return;
  const F = () => (S.flags = S.flags || {});
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const sq = id => ((F().sq || {})[id] || { s: 0, n: 0 });

  // ---------- 图片 ----------
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; return im; };
  for (const sid of Object.keys(D.rooms)) load('r213g_' + sid, 'r213/g_' + sid + '.webp');
  for (const k of Object.keys(D.objs)) load('r213_' + k, 'r213/o_' + k + '.webp');
  load('p_r213_suwan', 'r213/p_suwan.webp'); load('p_r213_dealer', 'r213/p_dealer.webp');
  try { SPEAKERS['苏晚'] = { p: 'p_r213_suwan', color: '#cfe6d8' }; SPEAKERS['庄家'] = { p: 'p_r213_dealer', color: '#e0b070' }; } catch (e) {}

  // ---------- 新小人（苏晚、庄家）：单独一张小图集 ----------
  const AT = D.npc; let A = null; { const im = new Image(); im.onload = () => { A = im; }; im.src = 'r213/npc_atlas.webp'; }
  if (typeof drawActorT === 'function') drawActorT = (orig => function (a, now) {
    const k = a.npc && a.npc.cx2, r = k && AT[k];
    if (!r || !A || a.hidden) return orig(a, now);
    const dh = r[4] || 113, w = r[2] * dh / r[3], bob = Math.sin(now * 2 + a.x) * 1.2, fo = dh * (r[5] || 0);
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 22, 7, 0, 0, 7); ctx.fill();
    ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y - bob); if (a.npc.flip) ctx.scale(-1, 1);
    ctx.drawImage(A, r[0], r[1], r[2], r[3], -w / 2, -dh + fo, w, dh); ctx.restore();
  })(drawActorT);

  try { delete MAP_ZOOM.qy_yicui; delete MAP_ZOOM.qy_changle; } catch (e) {}
  // ---------- 搭房间 ----------
  const g = (B, v) => v / B.cs;
  function room(sid, title, npcs, exits) {
    const B = Object.assign({ ground: 'r213g_' + sid }, D.rooms[sid]);
    TMAPS[sid] = { title, baked: B, indoor: true, npcs, chests: [], doors: [], exits, start: P(B.w / 2, B.h - 110) };
    return B;
  }
  const exDoor = (B, back) => { const e = B.exits.find(e => e.to === 'qy_town' && e.land); return { x: Math.floor(g(B, e.region.x)), y: Math.floor(g(B, e.region.y)), w: Math.ceil(g(B, e.region.w)), h: 2, to: 'qy_town', at: back, face: 'down', label: '出门 · 青阳镇' }; };
  // 楼梯口：触发区按 Codex 的 layout 来；落点放在对面那层触发区的下方一步，不会一上楼又踩回去
  const exStair = (from, to, label, o) => { const R = D.rooms[from], e = R.exits.find(e => e.to === to), T = D.rooms[to], back = T.exits.find(x => x.to === from), cs = R.cs;
    const by = back ? back.region.y + back.region.h + 46 : 600; const at = back ? P(back.region.x + back.region.w / 2, by < T.h - 40 ? by : back.region.y - 40) : P(147, 600);   // 楼梯口落在触发区下方一步；房门在屋子最下沿的，落在门里侧
    return Object.assign({ x: Math.floor(e.region.x / cs), y: Math.floor(e.region.y / cs), w: Math.ceil(e.region.w / cs), h: Math.max(1, Math.round(e.region.h / cs)), to, at, face: 'down', label, arrow: -Math.PI / 2 }, o || {}); };
  const inAt = B => { const e = B.exits.find(e => e.to === 'qy_town' && e.land); return P(e.land[0], e.land[1] - 34); };
  const mv = (n, xy, o) => { if (!n) return; const [c, r] = P(xy[0], xy[1]); Object.assign(n, { c, r, wander: false }, o || {}); };
  const mk = (cx, xy, name, talk, o) => { const [c, r] = P(xy[0], xy[1]); return Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk }, o || {}); };
  const spot = (xy, name, talk, o) => { const [c, r] = P(xy[0], xy[1]); return Object.assign({ key: 'none', c, r, name, hidden: true, h: 110, talk }, o || {}); };

  // ===== 倚翠楼 =====
  {
    const old = TMAPS.qy_yicui, back = (old.exits[0] || {}).at, suwan = (old.npcs || []).find(n => n.name === '苏晚');
    const done = () => sq('qy_tassel').s === 3;
    const n1 = [
      mk('maid', [800, 690], '倚翠楼侍女', async () => { await say('倚翠楼侍女', done() ? '苏姑娘今日换了新曲子。我在这楼里五年，头一回听见。' : '公子是来听琴的？苏姑娘在二楼听雨阁，从左手边的楼梯上去。……她今日，又在弹那一支。'); }, { face: 'left' }),
      mk('tea_guest', [440, 540], '听琴的茶客', async () => { await say('听琴的茶客', done() ? '怪了，那支曲子不弹了。……倒有点舍不得。' : '这楼里的琴，十年了就听她弹一支曲子。问她，她只说是等人。'); }),
      mk('drunk_scholar', [1090, 520], '醉书生', async () => { await say('醉书生', done() ? '曲终人不见，江上数峰青……好，好。' : '好曲！可惜——曲中人不来。（又斟了一杯）'); }),
    ];
    const B1 = room('qy_yicui', '倚翠楼 · 琴堂', n1, []);
    TMAPS.qy_yicui.exits = [exDoor(B1, back), exStair('qy_yicui', 'qy_yicui_2f', '上楼 · 听雨阁')];
    const n2 = [];
    if (suwan) { const s = D.rooms.qy_yicui_2f.slots.suwan; mv(suwan, [s[0], s[1] + 6], { cx: null, cx2: 'suwan', h: 116 }); n2.push(suwan); }
    const tp = D.rooms.qy_yicui_2f.inter.sword_tassel_socket;
    n2.push(spot([tp[0], tp[1] - 40], '琴案', async () => { await say('', done() ? '琴案的右角空了。压了十年的地方，木色比别处浅一块。' : '琴案右角压着一枚褪了色的青色剑穗，穗子理得整整齐齐，一丝灰都没有。'); }));
    n2.push(spot([600, 250], '临河的窗', async () => { await say('', '推窗就是青阳河。从这儿望出去，正对着东边那座石桥。'); }));
    room('qy_yicui_2f', '倚翠楼 · 听雨阁', n2, [exStair('qy_yicui_2f', 'qy_yicui', '下楼 · 琴堂')]);
    for (const d of TMAPS.qy_town.doors) if (d.to === 'qy_yicui') d.at = inAt(B1);
    for (const q of window.SQ_DEFS || []) if (q.id === 'qy_tassel') { q.giver = ['qy_yicui_2f', '苏晚']; q.where = '青阳镇 · 倚翠楼二楼听雨阁（河边北首）· 琴师苏晚'; }
  }

  // ===== 长乐坊 =====
  {
    const old = TMAPS.qy_changle, back = (old.exits[0] || {}).at, N = old.npcs || [], S1 = D.rooms.qy_changle.slots;
    const by = (name, i) => N.filter(n => n.name === name)[i || 0];
    mv(by('庄家'), [S1.dealer[0], S1.dealer[1] - 8], { cx: null, cx2: 'dealer' });
    mv(by('长乐坊打手', 0), [S1.guard_left[0] - 40, S1.guard_left[1] - 40], { face: 'right' });
    mv(by('长乐坊打手', 1), [S1.guard_right[0] + 40, S1.guard_right[1] - 40], { face: 'left' });
    mv(by('老赌客'), [215, 650]); mv(by('输红眼的汉子'), [1150, 470]);
    N.push(mk('bandit', [130, 500], '守楼梯的打手', ['楼上是账房，闲人免进。'], { cond: () => !F().qd_won }));
    N.push(mk('villager_m', [1010, 730], '看热闹的赌客', async () => { await say('看热闹的赌客', F().qd_won ? '钱都数回去了。这桌子掀得痛快！' : '我就看看，不下注。……这地方，十个进来九个光着出去。'); }));
    const B1 = room('qy_changle', '长乐坊 · 赌坊', N, []);
    TMAPS.qy_changle.exits = [exDoor(B1, back), exStair('qy_changle', 'qy_changle_2f', '上楼 · 账房', { cond: () => !!F().qd_won, msg: '打手横在楼梯口：「楼上是账房，闲人免进。」' })];
    const chest = D.rooms.qy_changle_2f.objs.find(o => /treasure_chest/.test(o.id)), desk = D.rooms.qy_changle_2f.objs.find(o => o.id === 'ledger_desk');
    const n2 = [];
    if (desk) n2.push(spot([desk.x + desk.w / 2, desk.sy + 34], '账桌', async () => {
      const f = F(); try { if (window.R212 && R212.ledgerLook && await R212.ledgerLook()) { f.qd_ledger = 1; return; } } catch (e) {}
      await L([['', '账桌上摊着一本没来得及收的流水账。'], ['', '每月初三都有同一笔开销：「山上茶水钱 · 五十」。翻回去，一笔不落，记了整整两年。'], ['星旋', '（山上——黑风寨。难怪这赌坊在镇上开得这么安稳，没人敢来掀它的桌子。）']]);
      if (!f.qd_ledger) { f.qd_ledger = 1; await L([['叶孤星', '（黑风寨已经没了。这本账……先收着，也许有人用得上。）']]); if (typeof toast === 'function') toast('记下了：长乐坊每月给黑风寨上供', 2400); }
    }));
    if (chest) n2.push(spot([chest.x + chest.w / 2, chest.sy + 30], '钱箱', async () => {
      const f = F(); if (f.qd_box) { await say('', '钱箱空了。'); return; }
      await L([['', '钱箱没锁。赌客们输掉的银子已经各自数回去了，箱底剩下的一小袋，袋口绣着庄家自己的名字。'], ['星旋', '（出千赢来的私房。小子，这个不拿白不拿。）']]);
      f.qd_box = 1; S.hero.gold = (S.hero.gold || 0) + 150;
      if (window.itemGet) await itemGet([{ icon: 'gold', name: '灵石', count: '×150' }], '庄家的私房'); else if (typeof toast === 'function') toast('灵石 +150', 2000);
    }));
    n2.push(spot([1004, 330], '后窗', async () => { await say('', '后窗大敞着，窗台上蹭掉了一块漆。庄家就是从这儿翻出去的。'); }));
    room('qy_changle_2f', '长乐坊 · 账房', n2, [exStair('qy_changle_2f', 'qy_changle', '下楼 · 赌坊')]);
    for (const d of TMAPS.qy_town.doors) if (d.to === 'qy_changle') d.at = inAt(B1);
  }

  // ===== 镇上的小物件：河东剑碑、歪脖子老柳 =====
  try {
    const T = TMAPS.qy_town.baked, O = D.objs;
    const put = (k, x, y) => { const o = O[k]; T.objs.push({ id: 'r213_' + k, img: 'r213_' + k, uid: 'r213-' + k, x: x - o.ax, y: y - o.ay, w: o.w, h: o.h, sy: y, flat: false }); };
    const blk = (x, y, n) => { const b = T.blocked.split(''); for (let i = 0; i < n; i++) { const c = Math.floor(x / T.cs) + i, rr = Math.floor((y - 6) / T.cs); if (c >= 0 && c < T.cols && rr >= 0 && rr < T.rows) b[rr * T.cols + c] = '1'; } T.blocked = b.join(''); };
    put('sword_stele', 2560, 802); blk(2548, 802, 1);                 // 河东老槐树脚下
    put('crooked_willow', 2275, 1992); blk(2262, 1992, 2);            // 西岸，歪着脖子探到河面上
    const w = (TMAPS.qy_town.npcs || []).find(n => n.hidden && /歪脖子/.test(n.name)); if (w) { const [c, r] = P(2232, 2000); w.c = c; w.r = r; }
  } catch (e) { console.warn('R213 小物件', e); }
  window.R213R = { D };
})();
