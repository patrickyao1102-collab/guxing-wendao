// ================= R470 · 「获得东西」一律用正式的获得框，不再弹卷轴提示框 =================
// 作者 11-28 19:20：「武器获得居然用了这个界面，我都说了我不喜欢这个界面。」（温行舟给照雪）
// 作者 11-28 19:38：「又出现这个框（溯光镜碎片）……你仔细核查游戏里到底还有哪里有这个框，获得东西有单独的框！」
// 全游戏核查过一遍 showPanel：
//   · 标题是「打开宝箱 / 获得道具 / 获得物品 / 获得宝物 / 获得坐骑 / 兑换成功 / 炼器成功…」和「支线完成」的 → R138 早就转成获得框了；
//   · 「战斗胜利」→ R155 的战斗结算框（掉落就在结算框里），这里不动；
//   · 剩下漏网的：所有带「!获得：」那一行的（万妖塔支线赠物、残匣、镇妖图卷、溯光镜碎片、委托完成、二到六层…），
//     以及标题是「获得」「历练完成」「委托完成」的 —— 全在这里接住。
// 做法：整段一个卷轴都不弹。每一行拆开：是东西的（「!获得：甲、乙 ×2」「!名字」「回春丹 ×2」「灵石 +600」「星辰点 +30」）→ 列进获得框；
//       剩下的说明句（「首领消散的地方，落下一片古镜的碎片。」「镇妖图卷又展开了一幅。」）→ 写进获得框里第一件东西的说明，不另外弹框。
(function () {
  if (typeof showPanel !== 'function') return;
  let NAMES = null;
  const names = () => { if (NAMES) return NAMES; NAMES = {}; try { for (const k in ITEM_DB) if (ITEM_DB[k] && ITEM_DB[k].name) NAMES[ITEM_DB[k].name] = k; } catch (e) {} return NAMES; };
  const LS = n => (window.LINGSHI_ICON ? window.LINGSHI_ICON(n) : 'item:ui_gold');
  const ALSO = new Set(['获得', '历练完成', '委托完成', '获得奖励', '奖励']);
  function one(raw) {   // 一件东西 → itemGet 用的格式
    const t = String(raw).replace(/^!/, '').trim(); if (!t) return null;
    const pt = t.match(/^(经验|修为|灵石|星辰点|贡献点?)\s*\+\s*(\d+)/);
    if (pt) { const k = pt[1], n = +pt[2];
      if (k === '灵石') return { icon: LS(n), name: '灵石', count: '×' + n, desc: '' };
      return { icon: 'item:' + (k === '星辰点' ? 'ui_star' : /贡献/.test(k) ? 'ui_contrib' : 'ui_stat_exp'), name: k === '经验' ? '修为' : k, count: '+' + n, desc: '' }; }
    const m = t.match(/^(.+?)\s*[×x]\s*(\d+)\s*$/), name = (m ? m[1] : t).trim(), base = name.replace(/（.*?）|\(.*?\)/g, '').trim(), N = names(), id = N[name] || N[base], db = id && ITEM_DB[id];
    return { icon: /灵石/.test(base) && !id ? LS(m ? +m[2] : 1) : id ? 'item:' + id : (/剑典|剑谱|残本|秘籍|书/.test(base) ? 'item:book_jianpu' : 'item:p_small'), name, count: m ? '×' + m[2] : '×1', desc: (db && db.desc) || '' };
  }
  const isThing = s => /^!/.test(s) || /[×x]\s*\d+\s*$/.test(s) || /^(经验|修为|灵石|星辰点|贡献点?)\s*\+\s*\d+/.test(s);
  showPanel = (orig => function (title, lines, ms) {
    try {
      const T = String(title || '');
      if (window.itemGet && Array.isArray(lines) && T !== '战斗胜利') {
        const L = lines.filter(l => l != null && l !== '').map(String);
        const hasGet = L.some(l => /^!?获得[：:]/.test(l));
        if (hasGet || ALSO.has(T)) {
          const items = [], notes = [];
          for (const s of L) {
            if (/^!?获得[：:]/.test(s)) { s.replace(/^!?获得[：:]\s*/, '').split(/[、，,]/).forEach(x => { const it = one(x); if (it) items.push(it); }); continue; }
            if (/^!?当前/.test(s)) continue;                       // 「当前星辰点：…」这类状态行不算东西
            if (isThing(s)) { const it = one(s); if (it) items.push(it); continue; }
            // 括号里的补充说明（「（青锋剑留给了王铁匠的儿子）」）和普通说明句一样，写进说明
            notes.push(s.replace(/^（(.*)）$/, '$1'));
          }
          if (items.length) {
            if (notes.length) { const it = items[0], nt = notes.join(''); it.desc = it.desc ? nt + '　' + it.desc : nt; }
            return window.itemGet(items, (T === '委托完成' || T === '历练完成') ? T : '获得物品');
          }
        }
      }
    } catch (e) { console.warn('r470', e); }
    return orig.apply(this, arguments);
  })(showPanel);
})();
