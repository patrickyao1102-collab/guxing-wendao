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
      out.push({ icon: base === '灵石' ? 'gold' : id ? 'item:' + id : (/剑典|剑谱|残本|秘籍|书/.test(base) ? 'item:book_jianpu' : 'pill'), name, count: m ? '×' + m[2] : '×1', desc: (db && db.desc) || '' });
    }
    return out;
  }
  showPanel = (orig => function (title, lines) {
    try { if (TITLES.has(String(title || '')) && typeof window.itemGet === 'function' && Array.isArray(lines) && lines.length) { const items = toItems(lines); if (items.length) return window.itemGet(items, String(title)); } } catch (e) { console.warn('r138', e); }
    return orig.apply(this, arguments);
  })(showPanel);
})();
