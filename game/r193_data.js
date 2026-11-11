// ================= R193 · 潭边垂钓：数据与概率 =================
// 作者 11-11 定的设计（《青竹小院 · 潭边垂钓 设计方案》）：看水面猜鱼、靠耐心和钓具的概率游戏。
// 这个文件只有数据和纯函数（选鱼、征兆、咬钩样子、搏鱼一步），画面和操作在 r193_angling.js。
// 所有数字都在这里，玩起来太难或太容易就改这里。
(function (root) {
  const TIERS = ['寻常', '少见', '珍品', '稀世', '传说'];
  const BASE = [10, 8, 6, 3, 1];   // 各品级底数
  // 饵等级系数 [寻常, 少见, 珍品, 稀世, 传说]
  const BAIT_K = { 凡: [1, .5, .15, .02, .006], 良: [1, .8, .4, .08, .01], 珍: [.8, 1, .9, .3, .05], 灵: [.5, .9, 1.2, .8, .25] };
  const LIKE = 3, HATE = .1, NEAR_LAYER = .3;
  // 鱼：t 品级下标，shi 出没时辰，lay 水层（0 浅 1 中 2 深），F 猛冲拉力，st 力气（秒），bite 咬钩样子，sg 常见征兆，wx 天气倍数，arr 来鱼时间（秒）
  const FISH = [
    { id: 'crucian', name: '鲫鱼', t: 0, shi: '卯午酉戌子', lay: [0, 1], F: 15, st: 4, bite: { pre: [2, 3], real: 'dun' }, sg: ['ripple_s'], sz: [4, 9], sell: 12 },
    { id: 'minnow', name: '白条', t: 0, shi: '卯午酉', lay: [0], F: 8, st: 2.5, bite: { pre: [3, 6], real: 'dun', thief: .5 }, sg: ['jump_s'], sz: [3, 6], sell: 6 },
    { id: 'shrimp', name: '青虾', t: 0, shi: '戌子', lay: [0], F: 6, st: 2, bite: { pre: [0, 1], real: 'drift' }, sg: ['lotus'], sz: [2, 4], sell: 8 },
    { id: 'grass_carp', name: '草鱼', t: 0, shi: '卯酉', lay: [1], F: 35, st: 7, bite: { pre: [0, 1], real: 'black' }, sg: ['weed'], sz: [12, 26], sell: 18 },
    { id: 'carp', name: '鲤鱼', t: 1, shi: '午酉', lay: [1, 2], F: 45, st: 9, bite: { pre: [1, 2], real: 'rise' }, sg: ['bubbles', 'bee'], sz: [10, 20], sell: 25 },
    { id: 'yellowcat', name: '黄颡鱼', t: 1, shi: '戌子', lay: [2], F: 30, st: 7, bite: { pre: [0, 1], real: 'dun2' }, sg: ['croak', 'frog_quiet'], sz: [6, 12], sell: 22, isNew: 1 },
    { id: 'perch', name: '鳜鱼', t: 2, shi: '卯午', lay: [2], F: 60, st: 12, bite: { pre: [0, 0], real: 'dun_drag' }, sg: ['scatter'], sz: [9, 16], sell: 40, meat: 1 },
    { id: 'koi', name: '锦鲤', t: 2, shi: '午', lay: [0], F: 40, st: 10, bite: { pre: [1, 2], real: 'sink' }, sg: ['butterfly', 'petals'], sz: [8, 14], sell: 60 },
    { id: 'silver_scale', name: '银鳞鱼', t: 2, shi: '戌子', lay: [1], F: 55, st: 11, bite: { pre: [0, 0], real: 'black' }, sg: ['silver'], sz: [9, 15], sell: 70 },
    { id: 'starfish', name: '星斑鱼', t: 3, shi: '子', lay: [2], F: 95, st: 18, bite: { pre: [3, 3], real: 'black', pause: 1 }, sg: ['fireflies'], sz: [10, 18], sell: 150 },
    { id: 'salamander', name: '灵鲵', t: 3, shi: '卯', lay: [2], F: 110, st: 20, bite: { pre: [0, 1], real: 'drift_far' }, sg: ['mist', 'frog_quiet', 'scatter'], wx: { 雾: 2 }, sz: [14, 24] },
    { id: 'gold_carp', name: '金鳞鲤', t: 3, shi: '午', lay: [1], F: 100, st: 18, bite: { pre: [1, 2], real: 'rise', leap: 1 }, sg: ['gold', 'kingfisher'], sz: [12, 22], sell: 180, isNew: 1 },
    { id: 'turtle', name: '老龟', t: 4, shi: '酉', lay: [2], F: 150, st: 30, slow: 1, bite: { pre: [0, 0], still: 1, real: 'drag_slow' }, sg: ['still', 'egret', 'all_fly'], sz: [16, 22] },
    { id: 'dragon_carp', name: '玉须龙鲤', t: 4, shi: '子', lay: [2], F: 200, st: 40, bite: { pre: [0, 0], real: 'yank' }, sg: ['whirl', 'all_fly'], wx: { 雷雨: 3 }, sz: [30, 48], isNew: 1 },
  ];
  const JUNK = [{ id: 'sandal', name: '破草鞋', junk: 1 }, { id: 'twig', name: '枯枝', junk: 1 }, { id: 'weed', name: '水草团', junk: 1, isNew: 1 }];
  const ARR = [[5, 20], [8, 26], [12, 32], [18, 40], [22, 45]];   // 各品级来鱼时间（秒）
  const P_EMPTY = .3, P_JUNK = .05, WAIT_MAX = 48;
  // 饵：k 等级；like / hate 鱼 id
  const BAITS = [
    { id: 'bait_worm', name: '蚯蚓', k: '凡', like: [], hate: [], from: '菜园翻土时捡' },
    { id: 'bait_dough', name: '面团', k: '凡', like: ['crucian', 'minnow', 'carp'], hate: ['perch', 'turtle'], from: '厨房揉' },
    { id: 'bait_leaf', name: '嫩菜叶', k: '凡', like: ['grass_carp'], hate: ['perch', 'yellowcat'], from: '菜园摘' },
    { id: 'bait_redworm', name: '红虫', k: '良', like: ['shrimp', 'yellowcat', 'perch'], hate: [], from: '镇上杂货铺' },
    { id: 'bait_lees', name: '酒糟', k: '良', like: ['carp', 'koi', 'gold_carp'], hate: ['perch'], from: '厨房酿酒剩下的' },
    { id: 'bait_shrimp', name: '活虾', k: '良', like: ['perch', 'salamander'], hate: ['grass_carp'], from: '钓到的青虾' },
    { id: 'bait_fish', name: '鱼块', k: '良', like: ['turtle', 'perch'], hate: ['koi'], from: '白条切块' },
    { id: 'bait_peach', name: '桃花糕', k: '珍', like: ['koi', 'gold_carp'], hate: ['perch'], from: '小桃做' },
    { id: 'bait_firefly', name: '萤火虫', k: '珍', like: ['silver_scale', 'starfish'], hate: [], from: '戌、子时在院里捉' },
    { id: 'bait_rice', name: '灵米', k: '灵', like: [], hate: [], from: '剧情、松伯' },
    { id: 'bait_dragon', name: '龙涎丸', k: '灵', like: ['dragon_carp'], hate: [], from: '极难得' },
  ];
  const LINES = [{ id: 'line_hemp', name: '麻线', cap: 40 }, { id: 'line_silk', name: '棉丝线', cap: 70 }, { id: 'line_ice', name: '冰蚕丝', cap: 120 }, { id: 'line_jiao', name: '蛟筋线', cap: 220 }];
  // 竿：far 最远能到的水层，tough 卸掉的拉力，sens 灵敏（0 低 1 中 2 中高 3 高）
  const RODS = [{ id: 'rod_old', name: '松伯的旧竹竿', far: 1, tough: 0, sens: 0 }, { id: 'rod_zi', name: '紫竹竿', far: 2, tough: .1, sens: 1 },
    { id: 'rod_xiang', name: '湘妃竹竿', far: 2, tough: .15, sens: 3 }, { id: 'rod_ling', name: '灵木竿', far: 2, tough: .3, sens: 2 }];
  // 征兆：when 只在这些时辰出现（空 = 全天）；w 当「随机气氛」时的权重
  const SIGNS = {
    ripple_s: { name: '漂边细碎涟漪', w: 5 }, ripple_b: { name: '一圈大涟漪慢慢扩开', w: 2 }, bubbles: { name: '一串串气泡', w: 2 }, jump_s: { name: '小鱼跳出水面', w: 3 },
    scatter: { name: '小鱼惊散跳水', w: 1.2 }, gold: { name: '水下金光一闪', w: .8, when: '午' }, silver: { name: '月下银光一闪', w: .8, when: '戌子' }, weed: { name: '水草乱晃', w: 1.5, when: '卯午酉' },
    lotus: { name: '荷叶轻晃', w: 2 }, still: { name: '水面很久一丝不动', w: 2.5 }, whirl: { name: '无风起漩涡', w: .05 }, petals: { name: '水面花瓣打转', w: 1, when: '卯午' },
    dragonfly: { name: '蜻蜓落在竿梢', w: 4, when: '卯午酉' }, butterfly: { name: '蝴蝶落在竿梢', w: 1.2, when: '卯午' }, bee: { name: '蜜蜂绕着竿转', w: 1.2, when: '午酉' },
    kingfisher: { name: '翠鸟在头顶盘旋', w: 1, when: '卯午酉' }, egret: { name: '白鹭从浅水飞走', w: 1, when: '卯午酉' }, frog_quiet: { name: '蛙声一下全停', w: 1, when: '戌子' },
    croak: { name: '水下传来「嘎嘎」轻响', w: .6, when: '戌子' }, fireflies: { name: '萤火虫聚到漂边', w: .8, when: '子' }, mist: { name: '瀑布底雾气聚拢', w: .8, when: '卯' }, all_fly: { name: '竿上虫鸟一齐飞走', w: .5 },
    leaf: { name: '一片落叶飘到水面', w: 4 }, wind: { name: '一阵风吹皱水面', w: 4 },
  };
  const BIG = new Set(['ripple_b']);   // 少见以上的鱼也会冒「大涟漪」
  const tierOf = f => f.junk ? -1 : f.t;
  const bait = id => BAITS.find(b => b.id === id), line = id => LINES.find(b => b.id === id), rod = id => RODS.find(b => b.id === id);
  const fish = id => FISH.find(f => f.id === id) || JUNK.find(f => f.id === id);

  // 这一竿每种鱼的机会（不含空等、杂物）
  function weights(o) { const b = bait(o.bait), k = BAIT_K[b.k], out = [];
    for (const f of FISH) { if (f.shi.indexOf(o.shi) < 0) continue;
      const d = Math.min(...f.lay.map(l => Math.abs(l - o.layer))), lw = d === 0 ? 1 : d === 1 ? NEAR_LAYER : 0; if (!lw) continue;
      let w = BASE[f.t] * lw * k[f.t] * (b.like.includes(f.id) ? LIKE : b.hate.includes(f.id) ? HATE : 1) * ((f.wx && f.wx[o.wx]) || 1);
      if (o.patient && f.t >= 2) w *= o.patient;
      if (o.once && o.once[f.id]) w = 0;   // 老龟一辈子只钓一次之类
      if (w > 0) out.push([f, w]); }
    return out; }
  const pickW = (list, R) => { const s = list.reduce((a, x) => a + x[1], 0); let r = R() * s; for (const x of list) if ((r -= x[1]) < 0) return x[0]; return list.length ? list[list.length - 1][0] : null; };
  const rr = (a, b, R) => a + R() * (b - a);
  // 抛竿时在后台定好这一竿：什么时候来、来的是什么
  function plan(o, R = Math.random) {
    const r = R();
    if (r < P_EMPTY) {   // 空等：等过 20 秒后还有一次机会，这次好鱼 ×1.3（耐心）
      if (R() < .45) { const f = pickW(weights(Object.assign({}, o, { patient: 1.3 })), R); if (f) return { fish: f, at: rr(Math.max(20, ARR[f.t][0]), WAIT_MAX - 2, R), late: 1 }; }
      return { fish: null, at: WAIT_MAX }; }
    if (r < P_EMPTY + P_JUNK && o.layer < 2) return { fish: JUNK[Math.floor(R() * JUNK.length)], at: rr(6, 25, R) };
    const f = pickW(weights(o), R); if (!f) return { fish: null, at: WAIT_MAX };
    return { fish: f, at: rr(ARR[f.t][0], ARR[f.t][1], R) };
  }
  // 征兆：约 45% 来自这一竿的鱼，其余是随机气氛；湘妃竹竿（sens 3）把随机的减半
  function sign(o, p, R = Math.random) {
    const f = p.fish, real = f && !f.junk && R() < (o.sens >= 3 ? .62 : .45);   // .45 真 / .55 假；假的减半后真的占 .45 / (.45 + .275) ≈ .62
    if (real) { const pool = f.sg.slice(); if (f.t >= 1) pool.push('ripple_b'); return pool[Math.floor(R() * pool.length)]; }
    const list = Object.keys(SIGNS).filter(k => !SIGNS[k].when || SIGNS[k].when.indexOf(o.shi) >= 0).map(k => [k, SIGNS[k].w]);
    return pickW(list, R);
  }
  // 咬钩样子：先几下「试口」（提了就空），再一下真的
  function biteSeq(f, R = Math.random) {
    if (f.junk) return { pre: [], real: 'sink_slow' };
    const b = f.bite, n = b.pre[0] + Math.floor(R() * (b.pre[1] - b.pre[0] + 1));
    return { pre: Array.from({ length: n }, () => b.still ? 'none' : 'dot'), real: b.real, pause: b.pause, still: b.still, thief: b.thief };
  }
  // 搏鱼一步：s = 状态，hold 是否按住，drag -1/0/1 玩家往哪边拖竿；返回 'snap' | 'lost' | 'land' | null
  function fightInit(f, rodId, lineId, R = Math.random) { const ro = rod(rodId), li = line(lineId);
    return { f, F: f.junk ? 12 : f.F, st: f.junk ? 1.5 : f.st, st0: f.junk ? 1.5 : f.st, dist: .55, burst: 0, warn: 0, next: f.junk ? 99 : rr(.8, 2, R), dir: R() < .5 ? -1 : 1, ten: 0, cap: li.cap, tough: ro.tough, sens: ro.sens, bt: 0, slack: 0, tired: false, t: 0 }; }
  function fightStep(s, dt, hold, drag, R = Math.random) {
    s.t += dt; const f = s.f;
    if (!s.tired) { s.next -= dt;
      const go = () => { s.burst = rr(.6, 1.2, R) * (f.slow ? 1.6 : 1); s.bt = 0; s.amp = rr(.8, 1, R); s.dir = R() < .5 ? -1 : 1; };
      if (s.warn > 0) { s.warn -= dt; if (s.warn <= 0) go(); }
      else if (s.burst > 0) { s.burst -= dt; s.bt += dt; if (s.burst <= 0) s.next = rr(.9, 2.6, R) * (1.2 - .5 * s.st / s.st0) * (f.slow ? 1.4 : 1); }
      // 猛冲前水面先鼓一下（预警）；稀世以上偶尔不打招呼直接冲
      else if (s.next <= 0) { if (f.t >= 3 && R() < .22) go(); else s.warn = rr(.18, .42, R) + (s.sens || 0) * .04; } }
    const bursting = s.burst > 0, against = drag && drag === -s.dir;
    const base = bursting ? s.F * s.amp * Math.min(1, .35 + s.bt / .3) : s.tired ? s.F * .08 : s.F * .35;
    s.ten = base * (hold ? 1 : .6) * (1 - s.tough);   // 松手时剩六成
    if (s.ten > s.cap) return 'snap';
    // 猛冲最耗它自己的力气
    if (!s.tired) { s.st -= dt * (hold ? 1 : .4) * (bursting ? 1.3 : 1) * (against ? 1.3 : 1); if (s.st <= 0) { s.st = 0; s.tired = true; s.burst = 0; s.warn = 0; } }
    const v = bursting ? (hold ? 0 : .14) : hold ? -(s.tired ? .5 : .15) : .06; s.dist = Math.min(1.2, Math.max(s.tired ? -1 : .12, s.dist + v * dt));   // 没累之前拉不到岸边
    if (s.dist > 1) return 'lost';
    s.slack = !hold && !bursting ? s.slack + dt : 0; if (s.slack > 2) return 'lost';
    if (s.dist <= 0) return 'land';
    return null;
  }
  const A = { TIERS, BASE, BAIT_K, FISH, JUNK, BAITS, LINES, RODS, SIGNS, ARR, P_EMPTY, P_JUNK, WAIT_MAX, weights, plan, sign, biteSeq, fightInit, fightStep, bait, line, rod, fish, tierOf, pickW };
  root.R193 = A; if (typeof module !== 'undefined') module.exports = A;
})(typeof window !== 'undefined' ? window : globalThis);
