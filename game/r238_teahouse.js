// ================= R238 · 听雨楼能进去了（作者 11-13：门口没有传送法阵；设计太好了，想进去看看）=================
// 外观按正确比例重画过（r228_ext.js 里换图）；这里接一层茶堂：圆厅、紫藤老柱、四张茶桌、茶柜和烧水的炉、通露台的短楼梯间。
// 二层雅座 + 观雨露台见 r246_teahouse2.js。只进测试版。
(function () {
  const D = window.R238_TEA; if (!D || typeof TMAPS === 'undefined' || !TMAPS.xt_city) return;
  const F = () => (S.flags = S.flags || {}), P = (x, y) => [x / 64 - .5, y / 64 - .8], L = async a => { for (const [w, t] of a) await say(w, t); };
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  load('r238g_tea', 'r238/g_tea.webp'); for (const k of new Set(D.objs.map(o => o.img))) load(k, 'r238/o_' + k.slice(5) + '.webp');
  const cs = D.cs, ex = D.exits.find(e => e.id === 'to_xt_city'), r = ex.region, up = D.exits.find(e => e.id === 'to_terrace'), S_ = D.slots;
  const man = (cx, xy, name, talk, o) => { const [c, r] = P(xy[0], xy[1]); return Object.assign({ key: 'none', cx, c, r, name, h: 116, wander: false, face: 'down', talk }, o || {}); };
  const BOSS = '听雨楼掌柜', XX = '星旋', YE = '叶孤星';
  const npcs = [
    man('villager_f', [S_.shopkeeper[0], S_.shopkeeper[1] + 6], BOSS, async () => {
      await L([[BOSS, '客官来了。楼下茶堂清净，楼上雅座听琴、露台看雨，随您的意。'], [BOSS, '小店的规矩：下雨天茶钱减半。这楼顶上撑着那么大一把伞，就是为了让客人坐在露台上听雨，一滴都淋不着。']]);
      const k = await choose('听雨楼', ['来一壶「檐下青」（10 灵石，歇一歇，气血灵力回满）', '随便看看']);
      if (k !== 0) return; const h = S.hero; if ((h.gold || 0) < 10) { await say(BOSS, '客官手头不便？不妨事，白水管够。'); return; }
      h.gold -= 10; try { if (typeof partyRevive === 'function') partyRevive(1); h.hp = h.maxhp; h.mp = h.maxmp; playSnd('ui_confirm'); } catch (e) {}
      await L([['', '茶汤入口先是微苦，过了喉咙，一线清甜慢慢回上来。'], [XX, '（嗯。这茶不坏。小子，往后进城，先来这儿坐一坐。）']]); toast('气血、灵力回满', 1800); }),
    // 作者 11-13：伙计都换成美女，掌柜也变成美女——这是个潇洒的地方（R246：女掌柜 + 鹅黄 / 水绿 / 藕色三位茶娘）
    man('villager_f', S_.waiter, '茶娘·阿杏', ['客官里边请！靠柱子那张桌清净。', '那根老柱子上的紫藤，比这楼的岁数还大。掌柜的说，当年是先有藤，后围着藤盖的楼。', '二楼雅座和露台都开着，楼梯在东边，几步就上去了。'], { random: true, ws: 'tea_yellow', wander: true }),
    man('villager_f', [820, 565], '茶娘·青禾', ['水要滚三滚，头一滚鱼眼，二滚珠泉，三滚鼓浪——过了就老了。客官稍等，就好。', '掌柜的说，倒茶的手要稳，看人的眼要活。我手是稳了，眼还在练。', '下雨天茶钱减半，可下雨天的客人反倒最多。您说怪不怪？'], { random: true, ws: 'tea_green', wander: true }),
    man('villager_f', [535, 690], '茶娘·素笺', ['……茶单在这里。新到的是「檐下青」。', '楼上抚琴的那位，一曲不重样。我听了三年，没听她弹过第二遍。', '客官若是来等人的，靠窗那张桌看得见整条街。'], { random: true, ws: 'tea_lotus', wander: true }),
    man('tea_guest', S_.tea_guest_1, '喝茶的老修士', ['玄天城十盏灵灯，老朽坐在这儿一盏一盏都数得见。哪一盏晚亮了半刻，瞒不过这双眼睛。', '年轻人，急什么。茶要等，剑也要等。'], { random: true }),
    man('villager_f', S_.tea_guest_2, '绣庄的女掌柜', ['万宝楼那位老鉴宝师，眼睛看不见，手比谁都准。我的绣样叫他一摸，就知道是哪家的针法。', '丹霞堂新换了门面，像只大葫芦，孩子们都爱绕着它跑。'], { random: true }),
    man('wandering_blade', S_.tea_guest_3, '歇脚的散修', ['城南那批烫金的帖子，你也收到了？……没收到最好。', '镇远镖局这趟镖走得不太平。听说有个镖头，在云来客栈里出了事。'], { random: true }),
  ];
  for (const n of npcs) if (n.name === BOSS) n.ws = 'keeper';
  TMAPS.xt_teahouse = { title: '听雨楼 · 一层茶堂', baked: Object.assign({ ground: 'r238g_tea' }, D), indoor: true, npcs, chests: [], doors: [], start: P(D.spawn[0], D.spawn[1] - 44),
    exits: [{ x: Math.floor(r.x / cs), y: Math.floor(r.y / cs), w: Math.ceil(r.w / cs), h: Math.ceil(r.h / cs), to: 'xt_city', at: P(2976, 2190), face: 'down', label: '出门 · 玄天城' }] };
  (TMAPS.xt_city.doors = TMAPS.xt_city.doors || []).push({ x: 2976, y: 2128, rw: 44, rh: 22, to: 'xt_teahouse', at: P(D.spawn[0], D.spawn[1] - 44), face: 'up', label: '听雨楼' });
})();
