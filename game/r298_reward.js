// ================= R298 · 悬赏点 + 支线奖励分档 + 典籍阁改价 + 招式前置（作者 11-15）=================
// 作者：「为了让大家更有动力去做支线，奖励秘籍会比较好」「典籍阁有些秘籍买不到；买要悬赏点 + 灵石」
//      「绝影要等追魂练上去才可以领悟——就算境界到了，前置招没练够也不行，这时候就要去做支线」
//      「大的、难的支线直接给技能书；不难的只给悬赏点，攒够了去典籍阁换」「书大部分用悬赏点去典籍阁买，一部分任务给、宝箱给、首领给」
//      「难度适中偏简单：做个两三个、四五个支线就够，不要每个都得做」
//      「云霆的强攻，是第一次和叶孤星在大树底下谈心的时候领悟」
// 1) 悬赏点 S.hero.xs：支线办完自动发（简单 15–20、中等 30–40、大支线 40–60 + 一本书），旧存档里早办完的也补发一次。
// 2) 典籍阁：卷二 300 灵石；卷三 25 悬赏点 + 400；卷四 60 + 900（凝丹后上架）；卷五不卖（大支线 / 宝箱 / 首领）。
//    叶孤星、云霆的秘传不卖（支线 / 首领给）；《九天神雷》剧情要买照旧卖；后面才入队的林雪、神乐的秘传暂时还在架上（80 悬赏点 + 1200）。
// 3) 招式前置：星罗要天璇三重；星陨要星罗四重；绝影要追魂四重；夺魄要绝影四重。剧情里直接领悟的那几场照旧（不卡剧情）。
// 4) 首领战第一次打赢掉一本卷（凝丹前卷三、之后卷四），部分宝箱里多一本卷。
// 5) 云霆「强攻」：松风林道树下歇脚那场戏结束后领悟（不再到 12 级自动会）。只进测试版。
(function () {
  if (typeof ITEM_DB === 'undefined' || !window.SQ_DEFS) return;
  const F = () => (S.flags = S.flags || {});
  const XS = () => (S.hero && S.hero.xs) || 0;
  // ---------------- 1) 支线分档 ----------------
  //            悬赏点   额外的书（原来就给的书不重复加）
  const T = {
    tj_fish: [15], tj_copy: [15], kite: [15], horn: [20], hide: [20],
    tj_book: [30], tj_beast: [30], fang: [30], qy_wine: [35], qy_tassel: [35], qy_dice: [35], xt_story: [35], spider: [40], yy_ghost: [40],
    bandit: [40], gold: [40], qy_ledger: [40], elite: [50], xt_lamps: [40, [['juan3', 1]]], xt_room3: [40, [['juan3', 1]]],
    xt_fake: [50, [['juan4', 1]]], xt_thirty: [50, [['bk_yunting_yunlei', 1]]], xt_lamp: [50, [['juan4', 1]]], ml_case: [60, [['juan5', 1]]],
  };
  const DIFF = id => { const v = T[id]; if (!v) return ''; return v[1] || ['bandit', 'gold', 'qy_ledger', 'elite'].includes(id) ? '困难' : v[0] >= 30 ? '中等' : '简单'; };
  for (const q of SQ_DEFS) { const v = T[q.id]; if (!v) continue; q.reward = q.reward || {}; q.reward.xs = v[0]; q.reward.bonus = v[1] || []; q.diff = DIFF(q.id); }
  const nm = id => (ITEM_DB[id] && ITEM_DB[id].name) || id;
  const base = window.SQ_REWARD_TEXT;
  window.SQ_REWARD_TEXT = q => { if (typeof q === 'string') q = SQ_DEFS.find(x => x.id === q); if (!q) return '';
    const r = q.reward || {}, a = [];
    if (r.xs) a.push('悬赏点 +' + r.xs);
    for (const [id, n] of r.bonus || []) a.push(nm(id) + (n > 1 ? ' ×' + n : ''));
    const b = base ? base(q) : ''; if (b) a.push(b);
    return (q.diff ? '【' + q.diff + '】' : '') + a.join('、'); };
  window.XS_TABLE = T;
  // 办完发奖（等对话、战斗、菜单都结束再发）
  const calm = () => S.hero && world.map && !battle && !dialog && !choice && !world.locked && !S.menu && S.hud !== false && (typeof sysPanel === 'undefined' || !sysPanel) && S.fade === 0 && (!window.LOADING_SHOWN || LOADING_SHOWN() === 0);
  let paying = false;
  setInterval(async () => { if (paying || !calm()) return; const sq = F().sq || {}, paid = F().xs_paid || (F().xs_paid = {});
    const id = Object.keys(T).find(id => sq[id] && sq[id].s === 3 && !paid[id]); if (!id) return;
    paying = true; try { paid[id] = 1; const [n, bk] = T[id], q = SQ_DEFS.find(x => x.id === id);
      S.hero.xs = XS() + n; const show = [{ icon: 'item:k_xs', name: '悬赏点', count: '+' + n, desc: '去天剑集市 · 典籍阁换剑谱、玉简' }];
      for (const [b, c] of bk || []) { if (!ITEM_DB[b]) continue; addItem(b, c); show.push({ icon: 'item:' + b, id: b, name: nm(b), count: '×' + c, desc: ITEM_DB[b].desc || '' }); }
      try { playSnd('jingle_win'); } catch (e) {}
      const title = '悬赏 · ' + ((q && q.name) || '支线');
      if (window.itemGet) await itemGet(show, title); else await showPanel(title, show.map(s => '!' + s.name + ' ' + s.count));
    } catch (e) { console.warn('R298 pay', e); } paying = false; }, 900);
  ITEM_DB.k_xs = ITEM_DB.k_xs || { name: '悬赏点', cat: '货币', desc: '做支线得来的悬赏点，在天剑集市 · 典籍阁换剑谱、玉简。' };

  // ---------------- 2) 典籍阁 ----------------
  const setP = (id, price, xs) => { const it = ITEM_DB[id]; if (!it) return; it.price = price; if (xs) it.xs = xs; else delete it.xs; };
  setP('juan2', 300); setP('juan3', 400, 25); setP('juan4', 900, 60);
  const MI_SOLD = ['bk_linxue_bingfeng', 'bk_shenle_shenfa', 'bk_shenle_jiuyinhe'];
  for (const id of MI_SOLD) setP(id, 1200, 80);
  try { const X = SK4.X; if (X.yunting && X.yunting.yunlei) X.yunting.yunlei.shopTxt = '支线「三十个名字」或首领战得'; for (const id of MI_SOLD) { const m = id.split('_'); const d = X[m[1]] && X[m[1]][m[2]]; if (d) d.shopTxt = '典籍阁 80 悬赏点 + 1200 灵石'; } } catch (e) {}
  const lvNow = () => (S.hero && S.hero.lv) || 1;
  const wrapShop = () => { const s0 = window.SK4_SHOP; if (!s0 || s0._r298) return; const f = function () { const L = lvNow(); let out = (s0.apply(this, arguments) || []).filter(id => id !== 'juan5' && !/^bk_(hero|yunting)_/.test(id));
      if (L >= 10 && !out.includes('juan4')) out.splice(out.indexOf('juan3') + 1, 0, 'juan4'); return out; }; f._r298 = 1; window.SK4_SHOP = f; };
  wrapShop(); setTimeout(wrapShop, 0); setTimeout(wrapShop, 3000);

  // ---------------- 3) 招式前置 ----------------
  const REQ = { xingluo: ['pojun', 3, '天璇'], xingyun: ['xingluo', 4, '星罗'], jueying: ['tanlang', 4, '追魂'], duopo: ['jueying', 4, '绝影'] };
  const CN = ['', '一', '二', '三', '四', '五'];
  const tier = id => Math.max(1, ((S.skillLv || {})['hero.' + id]) || 1);
  window.SK_REQ = k => { const r = REQ[k]; if (!r) return true; const h = S.hero; return !!(h && h.skills && h.skills.includes(r[0]) && tier(r[0]) >= r[1]); };
  window.SK_REQ_TXT = k => { const r = REQ[k]; if (!r) return ''; return '要先把「' + r[2] + '」参悟到' + CN[r[1]] + '重' + (SK_REQ(k) ? '' : '（现在 ' + CN[Math.min(5, tier(r[0]))] + '重）'); };
  // 前置练够了、境界也到了：补领悟（升级那一刻没领悟成的）
  setInterval(() => { try { const h = S.hero; if (!h || !h.skills || !calm()) return;
    for (const k of Object.keys(REQ)) { const sd = SKILL_DB[k]; if (!sd || !sd.lv || h.lv < sd.lv || h.skills.includes(k) || !SK_REQ(k)) continue;
      h.skills.push(k); (h.learnQ = h.learnQ || []).push(k); toast('前置练成 · 领悟 ' + (sd.name || k), 2600); try { playSnd('sfx_sword_ring'); } catch (e) {} break; } } catch (e) {} }, 2000);

  // ---------------- 4) 首领战掉书、宝箱里加书 ----------------
  if (typeof endBattle === 'function') { const eb = endBattle;
    endBattle = async function (win) { try { const b = battle; if (win && b && b.cfg && b.cfg.boss && !b.cfg.cannotLose) { const key = String(b.cfg.title || (b.enemies && b.enemies[0] && b.enemies[0].name) || 'boss'), got = F().xs_boss || (F().xs_boss = {});
        if (!got[key]) { got[key] = 1; const id = lvNow() >= 19 && Object.keys(got).length % 3 === 0 ? 'juan5' : lvNow() >= 10 ? 'juan4' : 'juan3'; if (ITEM_DB[id]) { addItem(id, 1); b.cfg.loot = (b.cfg.loot ? b.cfg.loot + '、' : '') + nm(id); } } } } catch (e) {}
      return eb.apply(this, arguments); }; }
  const hash = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  for (const m of Object.keys(TMAPS)) for (const ch of TMAPS[m].chests || []) { if (!ch || !Array.isArray(ch.items) || ch._r298) continue; ch._r298 = 1; const h = hash(m + ':' + ch.c + ':' + ch.r);
    if (/^(xt_|m_yy|m_nw|yy_)/.test(m) && h % 5 === 0) ch.items.push(['juan4', 1]); else if (h % 4 === 0) ch.items.push(['juan3', 1]); }

  // ---------------- 5) 云霆「强攻」：松风林道树下谈心 ----------------
  try { const d = SK4.X.yunting.qianggong; d.lv = 999; d.why = '松风林道树下和叶孤星谈心时领悟'; } catch (e) {}
  setInterval(async () => { const f = F(); if (!f.sf_pine || f.yt_qianggong || !calm()) return; f.yt_qianggong = 1;
    const L = S.sk4 || (S.sk4 = {}); L['yunting.qianggong'] = 1;
    if (lvNow() >= 12) return;   // 旧存档早就会了，不再弹
    try { playSnd('sfx_sword_ring'); } catch (e) {}
    try { await showPanel('云霆 · 领悟', ['!辅助 · 强攻', '雷纹落在全队武器上：全队攻击 +20%，两回合', '（树下那番话之后，云霆握剑的手稳了许多）']); } catch (e) {} }, 1200);

  window.R298 = { T, REQ, DIFF };
})();
