// ================= R134 · 金色海棠云窗：队友也弹升级（接在另一窗口的 levelup_panel.js 后面）=================
// levelup_panel.js 只弹叶孤星一张。作者要的是「五人等级提升」：叶孤星那张点掉之后，队伍里有拆件立绘的队友（云霆 / 林雪 / 洛尘 / 神乐）各弹一张，最后才进「领悟剑诀」。
// 队友属性跟着叶孤星等级走（10 级以上才长），旧值 = 现值 − 这几级长的量（装备加成不受影响）。
(function () {
  if (typeof window.levelPanel !== 'function' || typeof levelUpShow !== 'function') return;
  const STATS = [['maxhp', '气血'], ['maxmp', '灵力'], ['atk', '攻击'], ['def', '防御'], ['spd', '身法']];
  const HAS = { yunting: 1, linxue: 1, luochen: 1, shenle: 1 };
  let pend = null;
  async function allies(lv0, lv1) {
    const L0 = Math.max(10, lv0), L1 = Math.max(10, lv1); if (L1 <= L0) return;
    for (const k of (S.party || []).slice()) {
      const d = PARTY_DB[k]; if (!d || !HAS[k] || !d.base) continue;
      let cur; try { cur = allyStats(k); } catch (e) { continue; }
      const rows = STATS.filter(([s]) => d.base[s] != null).map(([s, l]) => { const g = (d.grow || {})[s] || 0, dl = Math.round(d.base[s] + g * (L1 - 10)) - Math.round(d.base[s] + g * (L0 - 10)), nv = Math.round(cur[s]); return [l, nv - dl, nv]; });
      if (rows.length >= 3) await levelPanel({ who: k, name: d.name, lv0, lv1, rows });
    }
  }
  // 叶孤星那张关掉后、领悟剑诀之前插入队友
  const lp = window.levelPanel;
  window.levelPanel = async function (o = {}) { const r = await lp.apply(this, arguments); if (pend && (o.who || 'hero') === 'hero') { const p = pend; pend = null; try { await allies(p.lv0, p.lv1); } catch (e) {} } return r; };
  levelUpShow = (orig => async function (lv0) { pend = { lv0, lv1: S.hero && S.hero.lv }; try { return await orig.apply(this, arguments); } finally { pend = null; } })(levelUpShow);
})();
