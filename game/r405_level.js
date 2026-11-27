// ================= R405 · 等级用数字说话：一境十级（只进测试版）=================
// 作者 11-27 16:44：「炼气一重是一级……炼气九重是九级，炼气圆满是十级，凝丹一重十一，一直到凝丹圆满是二十，引魂一重是二十一……归元圆满是四十。
//   我们还是以数字去表示等级，玩家更有体验感。但是也要有境界说明，让玩家对小说的代入感更深一点。」
// 做法：
//   · 等级表：每境十级（一～九重 + 圆满）。境界的名字不变，数字换成新表上的——原来 14 级的「凝丹五重」现在是 15 级。
//   · 游戏里按老表（每境九级）记的数字，装载时统一换一遍：技能的领悟等级、装备的需要等级、妖王头目的等级、各图的妖物等级。
//     写在剧情函数里的那些，主文件里用 GXLV() 包着（正式版原样返回）；按等级给敌人涨数值的算式用 GXLVO()，敌人不会平白变强。
//   · 老存档：读档时以存档里记的境界名字为准重新定等级（r145_save.js 里一行），不用另记「换没换过」。
//   · 要玩家比大小的地方写数字：「需要 11 级」「16 级领悟」；境界跟在数字后面当说明：「12 级 · 凝丹二重」。
//   · 跨大境界（10 → 11、20 → 21）的那一次升级，窗口的题签写「境界突破」。
// 要撤掉：从 index.html 里删掉这一个文件的引用即可（主文件里的 GXLV / GXLVO / lvNeedText 会照老样子走）。
(function () {
  if (window.GX_LV10 || typeof realmOf !== 'function' || typeof lvOfRealm !== 'function' || typeof ITEM_DB === 'undefined' || typeof SKILL_DB === 'undefined') return;
  const CN9 = '一二三四五六七八九', BIG = ['练气', '凝丹', '引魂', '归元', '灵台', '洞虚', '万劫', '法相', '无上'];
  const C = n => { n = +n || 0; return n <= 9 ? n : n + Math.floor((n - 1) / 9); };   // 老表上的数字 → 新表上同一个境界的数字（10「凝丹一重」→ 11，19「引魂一重」→ 21）
  const O = n => { n = +n || 0; return n - Math.floor(n / 10); };                      // 新表 → 老表（圆满算九重：10 → 9，20 → 18）
  window.GX_LVC = C; window.GX_LVOLD = O; window.GX_LV10 = 1;

  // ---------- 一、等级 ↔ 境界 ----------
  realmOf = function (lv) { lv = Math.max(1, Math.round(+lv || 1)); const i = Math.min(BIG.length - 1, Math.floor((lv - 1) / 10)), m = lv - i * 10; return BIG[i] + (m >= 10 ? '圆满' : CN9[m - 1] + '重'); };
  lvOfRealm = function (r) { r = String(r || ''); for (let i = 0; i < BIG.length; i++) if (r.startsWith(BIG[i])) { const t = r.slice(BIG[i].length);
      if (/^圆满/.test(t)) return i * 10 + 10; const m = CN9.indexOf(t[0]); if (m >= 0) return i * 10 + m + 1;
      if (/初期/.test(t)) return i * 10 + 1; if (/中期/.test(t)) return i * 10 + 4; if (/后期/.test(t)) return i * 10 + 7; } return 0; };
  const cross = (a, b) => Math.floor((Math.max(1, a) - 1) / 10) < Math.floor((Math.max(1, b) - 1) / 10);   // 这次升级跨没跨大境界
  window.GXLVT = (lv, sep) => lv + ' 级' + (sep || ' · ') + realmOf(lv);                // 「12 级 · 凝丹二重」

  // ---------- 二、把按老表记的数字换一遍（每张表只换一次）----------
  const done = new WeakSet();
  const conv = (o, k) => { if (o && typeof o[k] === 'number' && o[k] > 9) o[k] = C(o[k]); };
  const each = (tb, k) => { if (!tb || typeof tb !== 'object' || done.has(tb)) return; done.add(tb); for (const id of Object.keys(tb)) conv(tb[id], k); };
  // 技能：叶孤星的剑诀、天剑三式、神乐洛尘的招、辅助和秘传
  each(SKILL_DB, 'lv');
  try { each(ALLY_SKILLS, 'lv'); } catch (e) {}
  try { for (const who of Object.keys(ALLY2_SKILLS)) each(ALLY2_SKILLS[who], 'lv'); } catch (e) {}
  try { if (window.SK4) { for (const who of Object.keys(SK4.X)) each(SK4.X[who], 'lv'); const L = SK4.LVNEED; if (L && !done.has(L)) { done.add(L); for (const k of Object.keys(L)) if (L[k] > 9) L[k] = C(L[k]); } } } catch (e) {}
  // 装备：需要等级，连同说明末尾那一句
  const NEED = /（需要境界：[^）]*）/;
  function fixItem(it) { if (!it || it._lv10) return; it._lv10 = 1; if (typeof it.lvReq === 'number' && it.lvReq > 9) it.lvReq = C(it.lvReq);
    try { const d = Object.getOwnPropertyDescriptor(it, 'desc'); if (d && !d.writable && !d.set) return; const s = String(it.desc || '');
      if (it.slot && it.lvReq) it.desc = NEED.test(s) ? s.replace(NEED, '（需要 ' + it.lvReq + ' 级）') : (/（需要 \d+ 级）/.test(s) ? s : s + '（需要 ' + it.lvReq + ' 级）');
      else if (NEED.test(s)) it.desc = s.replace(NEED, ''); } catch (e) {} }
  const fixItems = () => { for (const id of Object.keys(ITEM_DB)) { const it = ITEM_DB[id]; if (it && it.fg) continue; fixItem(it); } };   // 炉子里打出来的那些（it.fg）照着原型现算，不在这儿动
  fixItems(); setTimeout(fixItems, 3500); setTimeout(fixItems, 9000);   // 后面模块再加的装备（载入慢时会晚到）也补上
  // 技能书上写的「到 N 级后参悟」
  try { for (const id of Object.keys(ITEM_DB)) { const it = ITEM_DB[id]; if (!it || !it.sk4 || it._lv10b) continue; it._lv10b = 1; const d = ((window.SK4 || {}).X || {})[it.sk4.who]; const x = d && d[it.sk4.id]; if (!x) continue;
      if (typeof it.eff === 'string') it.eff = it.eff.replace(/· \d+ 级参悟/, '· ' + x.lv + ' 级参悟'); if (typeof it.desc === 'string') it.desc = it.desc.replace(/到 \d+ 级后/, '到 ' + x.lv + ' 级后'); } } catch (e) {}
  // 妖王、头目
  try { const YW = window.R370_YW; if (YW && !done.has(YW)) { done.add(YW); for (const y of YW) conv(y, 'lv'); } } catch (e) {}
  // 各图的妖物等级
  const fixMaps = () => { try { for (const k of Object.keys(TMAPS)) { const m = TMAPS[k] && TMAPS[k].mobs, r = m && m.lvR; if (r && !done.has(r)) { done.add(r); for (let i = 0; i < r.length; i++) if (r[i] > 10) r[i] = C(r[i]); } } } catch (e) {} };   // 上限正好是 10 的（后山 8～10）不动：那是「比练气九重高一级」，新表上 10 级正是练气圆满
  fixMaps(); setTimeout(fixMaps, 3500);
  // 过图提示里讲等级的那两句
  try { const g = window.GX_TIPS && GX_TIPS.gameplay; if (g) { const rep = { '技能的领悟门槛按修为算：练气九重往上，便是凝丹一重': '一境十级：练气一重到九重是 1 到 9 级，10 级是练气圆满，11 级起是凝丹', '卷册在天剑集市 · 典籍阁有售；境界越高，阁里上新的书越多': '卷册在天剑集市 · 典籍阁有售；等级越高，阁里上新的书越多' };
      for (let i = 0; i < g.length; i++) if (rep[g[i]]) g[i] = rep[g[i]]; } } catch (e) {}

  // ---------- 三、开着游戏时就在身上的那个主角：数字也换一遍 ----------
  // 读档走 r145_save.js 里那一行（按境界名字定等级），而且读档一定排在整页脚本跑完之后。所以这一刻身上要是已经有十级以上的主角，
  // 只可能是网址里带调试参数、抢在这个文件之前摆出来的——那时用的还是老表，这里换一次。
  try { const h = S.hero; if (h && h._rpg && typeof h.lv === 'number' && h.lv > 9) h.lv = C(h.lv); } catch (e) {}

  // ---------- 四、升级的窗口 ----------
  // 窗口上的「Lv.12 → Lv.13」换成「12 级 → 13 级」，名字后面跟着境界；跨大境界的那一次，题签写「境界突破」。
  if (typeof window.levelPanel === 'function') window.levelPanel = (orig => function (o) { o = o || {};
    try { if (!o.title && typeof o.lv0 === 'number' && typeof o.lv1 === 'number' && cross(o.lv0, o.lv1)) o = Object.assign({}, o, { title: '境界突破' }); } catch (e) {}
    return orig.call(this, o); })(window.levelPanel);

  window.R405 = { C, O, cross };
})();
