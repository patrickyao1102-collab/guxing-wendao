// ================= R178 · 商店各有特色 + 新丹药图标（作者 11-09：「丹药不是有新版本吗」「各个商店应该做出各个商店的特色」）=================
// Codex R170：十一家店各一件镇店之物（画在 R169 青瓷窗柜左侧壁龛里，名牌写在下方小匾），七种丹药 / 灵草新图标（全游戏凡是画道具图标的地方都换）。
(function () {
  const load = src => { const im = new Image(); im.src = src; return im; };
  // 店铺 → 镇店之物 / 招牌名（店主名一律换成店名）
  const D = [
    [/典籍|藏经|书/, 'books', '缃帙古籍'], [/兵甲/, 'arms', '天工名剑架'], [/玄兵/, 'xuanbing', '玄铁镇阁剑'], [/铁匠|铁铺/, 'smith', '百炼铁砧', '铁匠铺'],
    [/符阵/, 'runes', '北斗阵盘'], [/灵兽/, 'beast', '斑玉灵兽卵'], [/五曜|天剑商阁|商阁/, 'wuyao', '五曜浑天仪'],
    [/万宝/, 'wanbao', '楼藏百宝匣'], [/聚宝/, 'treasure', '双鱼青瓷尊', '聚宝斋'], [/杂货/, 'grocery', '商旅百货匣', '杂货铺'],
    [/醉仙/, 'grocery', '商旅百货匣', '醉仙楼'], [/百草/, 'herb', '铜兽丹炉', '百草轩'], [/丹霞/, 'herb', '铜兽丹炉', '丹霞堂'], [/丹|药/, 'herb', '铜兽丹炉'],
  ];
  const STILL = {}; for (const [, k] of D) if (!STILL[k]) STILL[k] = load('r178/still_' + k + '.webp');
  window.R178_SHOP_DECOR = who => {
    const d = D.find(([re]) => re.test(who || '')); if (!d) return null;
    const sign = d[3] || String(who || '').replace(/(掌柜|老板|伙计|店主)$/, '');
    return { keeper: 'r178/still_' + d[1] + '.webp', label: d[2], sign };
  };
  // 新丹药图标：按道具名认
  const PILL = { '回春丹': 'p1', '大还丹': 'p2', '回灵丹': 'p3', '星华丹': 'p4', '月露灵草': 'p5', '玄魂丹': 'p6', '凝元丹': 'p7' };
  const PI = {}; for (const n in PILL) PI[n] = load('r178/pill_' + PILL[n] + '.webp');
  const pillOf = id => { try { const it = typeof ITEM_DB !== 'undefined' && ITEM_DB[id]; const im = it && PI[it.name]; return im && im.complete && im.naturalWidth ? im : null; } catch (e) { return null; } };
  window.R178_PILL = pillOf;
  const wrapIcon = () => {
    const U = window.UI_ICON2; if (!U || U.__r178) return !!U;
    const has0 = U.has, draw0 = U.draw;
    U.has = k => !!pillOf(k) || has0(k);
    U.draw = function (k, x, y, size) { const im = pillOf(k); if (im) { const s = size * 1.15; ctx.drawImage(im, x - s / 2, y - s / 2, s, s); return true; } return draw0.apply(this, arguments); };
    U.__r178 = true; return true;
  };
  if (!wrapIcon()) { const iv = setInterval(() => { if (wrapIcon()) clearInterval(iv); }, 300); }
  // 没走 UI_ICON2 的地方（旧的 itemIcon）也换
  if (typeof itemIcon === 'function') itemIcon = (o => function (id, x, y, r) { const im = pillOf(id); if (im) { const s = r * 2.4; ctx.drawImage(im, x - s / 2, y - s / 2, s, s); return; } return o.apply(this, arguments); })(itemIcon);
})();
