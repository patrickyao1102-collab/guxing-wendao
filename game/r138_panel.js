// ================= R138 · 所有「打开宝箱 / 获得道具 / 获得宝物」统一走定稿的获得物品框（素白 A，带图标）=================
// 作者 11-07：云海大亭开宝箱弹的还是老的蓝色文字框、没有图标。原因：通用宝箱和几处剧情奖励直接调 showPanel 画文字框，
// 只有新写的地方调 itemGet。这里把这几类标题的 showPanel 统一转成 itemGet：按名字找回 ITEM_DB 里的物品 → 用游戏物品图标，灵石用灵石图标；
// 「!名字 ×数量」是一件物品，后面不带「!」的那行当这件物品的说明。
(function () {
  if (typeof showPanel !== 'function') return;
  const TITLES = new Set(['打开宝箱', '获得道具', '获得宝物', '获得物品']);
  const byName = () => { const m = {}; try { for (const [id, it] of Object.entries(ITEM_DB)) if (it && it.name) m[it.name] = id; } catch (e) {} return m; };
  let NAMES = null;
  function toItems(lines) {
    NAMES = NAMES || byName(); const out = [];
    for (const raw of lines || []) { const s = String(raw);
      if (s[0] !== '!' && out.length && !/[×x]\s*\d+\s*$/.test(s)) { const it = out[out.length - 1]; it.desc = it.desc ? it.desc + '　' + s : s; continue; }
      const t = s.replace(/^!/, '').trim(), m = t.match(/^(.+?)\s*[×x]\s*(\d+)\s*$/), name = (m ? m[1] : t).trim(), base = name.replace(/（.*?）|\(.*?\)/g, '').trim();
      const id = NAMES[name] || NAMES[base], db = id && ITEM_DB[id];
      out.push({ icon: base === '灵石' ? window.LINGSHI_ICON(m ? +m[2] : 1) : id ? 'item:' + id : (/剑典|剑谱|残本|秘籍|书/.test(base) ? 'item:book_jianpu' : 'item:p_small'), name, count: m ? '×' + m[2] : '×1', desc: (db && db.desc) || '' });
    }
    return out;
  }
  // 作者 11-07：灵石不能再用代码画的三枚黄饼。itemGet 进来前统一换图标：
  //  · 灵石 / 赏金 → 灵石图标（LINGSHI_ICON，Codex 新图到了按数量分小堆 / 中堆 / 大堆，没到先用 R59 图集里的 ui_gold）
  //  · 剧情里误用 'gold' / 'pill' 的物品（乾坤戒、云纹霓裳、残缺玉盘、冰魄玄果……）按名字找回自己的物品图标
  const LS = window.LINGSHI_ICON || (window.LINGSHI_ICON = n => 'item:ui_gold');
  const num = c => +(String(c || '').replace(/[^0-9]/g, '')) || 0;
  function fixIcon(it) {
    if (!it || (it.icon !== 'gold' && it.icon !== 'pill')) return it;
    NAMES = NAMES || byName();
    const name = String(it.name || '').trim(), base = name.replace(/（.*?）|\(.*?\)/g, '').trim(), id = NAMES[name] || NAMES[base];
    if (/灵石|赏金|盘缠/.test(base) && !id) return Object.assign({}, it, { icon: window.LINGSHI_ICON(num(it.count)) });
    if (id) return Object.assign({}, it, { icon: 'item:' + id });
    return Object.assign({}, it, { icon: it.icon === 'gold' ? window.LINGSHI_ICON(num(it.count)) : 'item:p_small' });
  }
  if (typeof window.itemGet === 'function') window.itemGet = (o => function (items, title) {
    const a = [...arguments]; try { if (Array.isArray(items)) a[0] = items.map(fixIcon); } catch (e) {}
    return o.apply(this, a);
  })(window.itemGet);
  showPanel = (orig => function (title, lines) {
    try { if (TITLES.has(String(title || '')) && typeof window.itemGet === 'function' && Array.isArray(lines) && lines.length) { const items = toItems(lines); if (items.length) return window.itemGet(items, String(title)); } } catch (e) { console.warn('r138', e); }
    return orig.apply(this, arguments);
  })(showPanel);
})();
