// ================= R330 · 正式版关掉种地和钓鱼（作者 11-16）=================
// 「种地跟钓鱼系统全部关闭……正式版的到时候如果我们要上架苹果平台的话，钓鱼系统跟家园菜系统显示未完全开发」「测试版的不取消」。
// window.GX_RELEASE 只有正式版有（tools/build_release.py 写进 <head>）；测试版（/play/）这个文件什么都不做。
// r175h_fish.js（潭边垂钓）、r193_gear.js（钓具）、r175g2_farm.js（菜园种地）在正式版开头直接 return；这里收拾剩下的入口：
//   ① 西院月门 → 青竹菜园：走过去只提示「尚在开发中」，不进图（任何别的路去菜园也拦下）
//   ② 后庭竹钓台：点了只看一眼，提示「尚在开发中」；院里小池不再说「去后庭钓鱼」
//   ③ 支线「胖师兄的烤鱼」（要钓鱼）正式版不出现
//   ④ 厨房里要用菜园 / 潭里收来的食材的新菜，正式版不列出来
//   ⑤ 过图小提示里讲钓鱼、菜园的几条不抽
(function () {
  if (!window.GX_RELEASE) return;
  const SOON_G = '青竹菜园 · 尚在开发中，敬请期待', SOON_F = '潭边垂钓 · 尚在开发中，敬请期待';
  const isGarden = m => /^qingzhu_garden/.test(m || '');
  const say1 = t => { try { toast(t, 2200); } catch (e) {} };
  // ① 菜园的门
  if (typeof buildTileMap === 'function') buildTileMap = (o => function (def) {
    const T = o.apply(this, arguments);
    try { if (T && T.doors) for (const d of T.doors) if (isGarden(d.to)) { d.cond = () => false; d.msg = SOON_G; } } catch (e) {}
    return T; })(buildTileMap);
  if (typeof goMap === 'function') goMap = (o => function (m) { if (isGarden(m)) { say1(SOON_G); return Promise.resolve(); } return o.apply(this, arguments); })(goMap);
  // 存档停在菜园里（以前的正式版能进）：读档时送回西院月门口
  const back = () => { const e = [].concat((TMAPS.qingzhu_garden2 || {}).exits || [], (TMAPS.qingzhu_garden || {}).exits || []).find(e => e.to === 'qingzhu_court' && e.at); return e ? e.at : (TMAPS.qingzhu_court && TMAPS.qingzhu_court.start) || null; };
  if (typeof tileSetMap === 'function') tileSetMap = (o => function (m) { if (isGarden(m) && TMAPS.qingzhu_court) { const b = back(); say1(SOON_G); if (b) return o.call(this, 'qingzhu_court', b[0], b[1], 'right'); } return o.apply(this, arguments); })(tileSetMap);
  // ② 钓台、小池
  const dock = () => { for (const m of ['qingzhu_upper_pavilion']) for (const n of ((TMAPS[m] || {}).npcs || [])) if (n.name === '竹钓台') n.talk = async () => { await narrate('竹钓台伸进潭里，矮凳边放着一只鱼篓，竹笠挂在柱子上。'); say1(SOON_F); }; };
  const pond = () => { const n = ((TMAPS.qingzhu_court || {}).npcs || []).find(x => x.name === '小池'); if (n) n.talk = async () => { await narrate('池水映着日影，几尾红鲤懒洋洋地游着。'); }; };
  // ③ 胖师兄的烤鱼
  const quest = () => { const Q = window.SQ_DEFS; if (!Q) return; for (let i = Q.length - 1; i >= 0; i--) if (Q[i] && Q[i].id === 'tj_fish') Q.splice(i, 1); };
  // ④ 菜谱
  const recipes = () => { const RS = window.R139_RECIPES, W = window.R139_WHERE; if (!RS || !W) return;
    for (let i = RS.length - 1; i >= 0; i--) if ((RS[i].ing || []).some(n => W(n))) RS.splice(i, 1); };
  // ⑤ 小提示
  const tips = () => { const G = window.GX_TIPS; if (!G) return; const bad = s => /钓|菜园|种地|园簿|锦鲤|浮漂|咬钩|烤鱼/.test(Array.isArray(s) ? s[0] : s);
    for (const k of ['gameplay', 'story', 'story_hook']) if (Array.isArray(G[k])) G[k] = G[k].filter(s => !bad(s)); };
  const all = () => { for (const f of [dock, pond, quest, recipes, tips]) try { f(); } catch (e) { console.warn('R330', e); } };
  all(); setTimeout(all, 0); setTimeout(all, 1500);
})();
