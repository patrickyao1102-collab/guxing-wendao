// ================= R193 · 潭边垂钓：钓具从哪来（作者 11-11「接上」）=================
// 照《潭边垂钓 设计方案》的「从哪来」一栏，把饵、线、竿接到小院各处：
//   菜园：采收时翻土捡到蚯蚓，青菜萝卜金瓜带下几片嫩菜叶；播种时也能捡到几条蚯蚓。
//   厨房：每天头一回下厨，灶边剩的面揉成面团；用了糯米的菜（酿过酒）剩下酒糟。
//   钓具匣里：白条切成鱼块；戌、子时可以去院里捉萤火虫（只能当晚用）；地里收的灵米泡成灵米饵。
//   小桃：情谊到「熟络」后每天往钓具匣里塞两块桃花糕；到「亲近」给少爷搓一卷冰蚕丝。
//   松伯：少爷钓上十二尾以后，送亲手做的湘妃竹竿和几把灵米；钓上过稀世鱼，拿出私藏的蛟筋线；鱼谱记满十二种，交出宗主留下的灵木竿。
//   老龟：头一回钓上老龟，龟背的青苔里卡着一颗龙涎丸。
//   镇上杂货铺：红虫、棉丝线、紫竹竿。
// 竿和线也是行囊里的物品（钓具），钓具匣里能换的就是行囊里有的。
(function () {
  const D = window.R193; if (!D || typeof ITEM_DB === 'undefined') return;
  const F = () => (S.flags = S.flags || {}), SHI = () => F().qz_shi || '午', day = () => F().qz_day || 1;
  const bondOf = k => ((F().qz_bond || {})[k] || 0);
  // ---------- 物品：竿、线、价钱 ----------
  for (const r of D.RODS) ITEM_DB[r.id] = Object.assign(ITEM_DB[r.id] || {}, { name: r.name, cat: '钓具', sell: 0, desc: '钓竿。' + (r.far >= 2 ? '抛得到深水' : '只到潭心') + (r.tough ? '，鱼猛冲时卸掉 ' + Math.round(r.tough * 100) + '% 的拉力' : '') + (r.sens >= 3 ? '；咬钩信号格外清楚，提竿多给一点时间' : '') + '。' });
  for (const l of D.LINES) ITEM_DB[l.id] = Object.assign(ITEM_DB[l.id] || {}, { name: l.name, cat: '钓具', sell: 0, desc: '钓线，承重 ' + l.cap + '。鱼猛冲时的拉力超过承重就断。' });
  const PRICE = { bait_redworm: 3, line_silk: 60, rod_zi: 150 };
  for (const id in PRICE) ITEM_DB[id].price = PRICE[id];
  ITEM_DB.bait_rice.name = '灵米饵'; D.bait('bait_rice').name = '灵米饵'; ITEM_DB.bait_rice.desc = '灵饵。地里收的灵米用潭水泡过一夜，什么好鱼都更容易上钩。（钓具匣里泡，五把灵米泡两份）';
  const RICE = 'ing_9';   // 菜园 / 集市的灵米（r175g2_farm 的 ING('灵米')）
  // ---------- 镇上杂货铺 ----------
  if (typeof openShop === 'function') openShop = (o => function (ids, who) {
    if (/杂货/.test(who || '') && Array.isArray(ids)) ids = ids.concat(['bait_redworm', 'line_silk', 'rod_zi'].filter(id => !/^(rod|line)_/.test(id) || !itemCount(id)));
    return o.call(this, ids, who); })(openShop);
  // ---------- 菜园 / 厨房：收东西时顺带 ----------
  const later = [];   // 弹完收成框再提示
  const note = s => later.push(s);
  const flush = () => { if (!later.length) return; const s = later.splice(0).join('　'); setTimeout(() => toast(s, 2600), 900); };
  if (typeof addItem === 'function') addItem = (o => function (id, n = 1) { const r = o.apply(this, arguments);
    try { if (n > 0 && !window.__r193_give) {
      const RS = window.R139_RECIPES || [], rc = RS.find(x => x.id === id);
      if (rc) { const f = F(); window.__r193_give = 1;
        if (f.r193_dough !== day()) { f.r193_dough = day(); o('bait_dough', 3); note('灶边剩了块面，揉成面团 ×3（钓鱼用）'); }
        if (rc.ing && rc.ing.indexOf('糯米') >= 0) { o('bait_lees', 2); note('酿过的糯米剩下酒糟 ×2（钓鱼用）'); }
        window.__r193_give = 0; flush(); } } } catch (e) { window.__r193_give = 0; }
    return r; })(addItem);
  // 菜园：采收翻土 → 蚯蚓；叶菜 → 嫩菜叶；播种也捡几条（在 r175g2_farm 的 toast / itemGet 前后都行，这里只管给）
  window.R193_FARM = (kind, crop) => { try { if (kind === 'harvest') { const w = 2 + Math.floor(Math.random() * 3); addItem('bait_worm', w); const out = [['bait_worm', w]];
        if (crop && crop !== 'rice') { addItem('bait_leaf', 2); out.push(['bait_leaf', 2]); } return out; }
      if (kind === 'sow' && Math.random() < .6) { addItem('bait_worm', 2); toast('翻土时捡到两条蚯蚓（钓鱼用）', 1800); } } catch (e) {} return []; };
  // ---------- 钓具匣里能做的事 ----------
  const night = () => SHI() === '戌' || SHI() === '子';
  window.R193_EXTRA = () => { const f = F(), L = [];
    if (itemCount('fish_minnow') > 0) L.push({ k: 'cut', label: '白条切鱼块' });
    if (itemCount(RICE) >= 5) L.push({ k: 'rice', label: '泡灵米饵' });
    if (night() && f.r193_ffk !== day() + SHI()) L.push({ k: 'ff', label: '去院里捉萤火虫' });
    return L; };
  window.R193_EXTRA_DO = async k => { const f = F();
    if (k === 'cut') { addItem('fish_minnow', -1); addItem('bait_fish', 3); try { playSnd('ui_confirm', .5); } catch (e) {} toast('一尾白条切成了三块鱼块', 1600); }
    if (k === 'rice') { addItem(RICE, -5); addItem('bait_rice', 2); try { playSnd('ui_confirm', .5); } catch (e) {} toast('五把灵米泡进潭水里，泡成了两份灵米饵', 1800); }
    if (k === 'ff') { f.r193_ffk = day() + SHI(); f.r193_ffd = day(); const n = 3 + Math.floor(Math.random() * 3); addItem('bait_firefly', n);
      await narrate('提着纱袋在竹林边转了一圈。萤火虫一明一灭，捉住 ' + n + ' 只。（只能今晚用，天亮前就放走了）'); } };
  // ---------- 每回到钓台：人送的东西 ----------
  const giveLine = async (id, txt, who) => { await narrate(txt); addItem(id, 1); try { if (window.itemGet) await itemGet([{ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×1', desc: ITEM_DB[id].desc }], who); } catch (e) {} };
  const caughtKinds = () => Object.keys(F().r175_book || {}).filter(id => D.FISH.some(x => x.id === id)).length;
  window.R193_GIFTS = async () => { const f = F();
    // 萤火虫只能当晚用
    if (itemCount('bait_firefly') > 0 && (!night() || f.r193_ffd !== day())) { addItem('bait_firefly', -itemCount('bait_firefly')); toast('昨夜捉的萤火虫，天亮前都放走了', 1800); }
    // 小桃：桃花糕（每天）/ 冰蚕丝（一次）
    if (bondOf('maid2') >= 8 && f.r193_peach !== day()) { f.r193_peach = day(); addItem('bait_peach', 2); toast('钓具匣里多了个油纸包——小桃塞的，两块桃花糕', 2400); }
    if (bondOf('maid2') >= 20 && !f.r193_ice) { f.r193_ice = 1;
      await say('小桃', '少爷少爷！小桃拿青禾姐剩的冰蚕丝，搓了一卷钓线——比麻线结实多了！大鱼也拽不断！');
      await giveLine('line_ice', '一卷细细的线，透着凉，对着光看几乎是透明的。', '小桃的针线活'); }
    const n = f.r193_landed || 0;
    if (n >= 12 && !f.r193_xiang) { f.r193_xiang = 1;
      await say('松伯', '少爷这些天常往潭边跑。老头子闲着，拿后山的湘妃竹削了根竿——竹子上那些斑，是泪痕。竿梢灵，鱼一碰就知道。');
      await giveLine('rod_xiang', '竿身一点一点的褐斑，握在手里比旧竹竿轻得多。', '松伯亲手做的');
      addItem('bait_rice', 3); toast('松伯还塞了三把泡好的灵米饵', 2200); }
    if (f.r193_bigcatch && !f.r193_jiao) { f.r193_jiao = 1;
      await say('松伯', '听说少爷钓上来那样的鱼了。……这卷线，老头子压箱底几十年。当年宗主斩了一条作乱的蛟，筋抽出来搓的。');
      await giveLine('line_jiao', '暗金色，比头发丝粗不了多少，却怎么也扯不断。', '松伯的私藏'); }
    if (caughtKinds() >= 12 && !f.r193_ling) { f.r193_ling = 1;
      await say('松伯', '鱼谱快记满了。……这根竿，宗主当年就在这潭边用的。他说过，等少爷能把潭里的鱼认全了，就交给少爷。');
      await giveLine('rod_ling', '竿身是一截温润的灵木，木纹里隐隐有光在走。', '宗主留下的'); }
    if (f.r193_turtle1 && !f.r193_dragonpill) { f.r193_dragonpill = 1;
      await narrate('收拾钓具时，指尖碰到一颗滑溜溜的东西——是那天老龟背上青苔里卡着的，琥珀色，有一股淡淡的腥甜。');
      addItem('bait_dragon', 1); try { if (window.itemGet) await itemGet([{ icon: 'item:bait_dragon', name: '龙涎丸', count: '×1', desc: ITEM_DB.bait_dragon.desc }], '老龟留下的'); } catch (e) {} } };
  // 钓上来一尾：计数（松伯的竿）、稀世（蛟筋线）、老龟（龙涎丸）、鱼谱里程碑（灵米饵）
  window.R193_LANDED = fish => { const f = F(); if (!fish || fish.junk) return; f.r193_landed = (f.r193_landed || 0) + 1;
    if (fish.t >= 3) f.r193_bigcatch = 1; if (fish.id === 'turtle') f.r193_turtle1 = 1;
    setTimeout(() => { const k = caughtKinds(); f.r193_ms = f.r193_ms || {};
      for (const [need, n] of [[5, 2], [9, 3]]) if (k >= need && !f.r193_ms[need]) { f.r193_ms[need] = 1; addItem('bait_rice', n); toast('鱼谱记下 ' + need + ' 种鱼了——松伯听说，送来 ' + n + ' 份灵米饵', 2600); } }, 400); };
  // ---------- 行囊图标：用 R193G 的钓具图标 ----------
  const ICO = { bait_worm: 0, bait_dough: 1, bait_leaf: 2, bait_redworm: 3, bait_lees: 4, bait_shrimp: 5, bait_fish: 6, bait_peach: 7, bait_firefly: 8, bait_rice: 9, bait_dragon: 10, line_hemp: 11, line_silk: 12, line_ice: 13, line_jiao: 14, rod_old: 15, rod_zi: 16, rod_xiang: 17, rod_ling: 18 };
  const GI = new Image(); GI.src = 'r193g/gear_icons.webp?v=1';
  const wrapIcon = () => { const U = window.UI_ICON2; if (!U || U.__r193) return !!U; const has0 = U.has, draw0 = U.draw;
    U.has = k => ICO[k] != null || has0(k);
    U.draw = function (k, x, y, size) { const i = ICO[k]; if (i != null && GI.complete && GI.naturalWidth) { const s = size * 1.2; ctx.drawImage(GI, (i % 5) * 128, Math.floor(i / 5) * 128, 128, 128, x - s / 2, y - s / 2, s, s); return true; } return draw0.apply(this, arguments); };
    U.__r193 = true; return true; };
  if (!wrapIcon()) { const iv = setInterval(() => { if (wrapIcon()) clearInterval(iv); }, 300); }
})();
