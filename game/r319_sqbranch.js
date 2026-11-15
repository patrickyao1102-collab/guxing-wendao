// ================= R319 · 支线的「关键抉择」「失败结局」公用件（只进测试版）=================
// 作者 11-16：「不是每个任务都是百分百成功。很多探案任务，玩家被误导选到了错误选项，会导致任务失败，不过还可以重新再做；
//   重要问题提醒玩家存档。而且不止一个环节——可能从最开始的某条线索错了就一直错，也有可能歪打正着，做着做着又回到正路上。」
// 各支线自己写剧情分支；这里只管三件事：
//   SQB.key(说明)   —— 关键抉择前提醒存档（可以当场存进某个手动档），玩家点「我想好了」才往下走；
//   SQB.fail(...)   —— 失败结局：演完收尾，弹「支线失败 · xx结局」，清掉这条支线的进度，可以找发任务的人从头再来；
//   SQB.ask(...)    —— 当众推理的一问：答错一次有人提醒，错到上限就算说砸了。
(function () {
  if (typeof choose !== 'function' || typeof say !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  const slotInfo = s => { try { const d = JSON.parse(localStorage.getItem('gx_save_' + s) || 'null'); if (!d || !d.hero) return '存档 ' + s + ' · 空'; const t = new Date(d.t || 0), two = n => String(n).padStart(2, '0');
    return '存档 ' + s + ' · ' + (d.title || '') + ' · ' + (t.getMonth() + 1) + '月' + t.getDate() + '日 ' + two(t.getHours()) + ':' + two(t.getMinutes()); } catch (e) { return '存档 ' + s; } };

  async function key(why) {
    const f = F(); f.sqb_keys = (f.sqb_keys || 0) + 1;
    try { playSnd('ui_open'); } catch (e) {}
    const c = await choose('关键抉择 —— ' + (why || '这一步选错，案子可能就办砸了'), ['先存个档再选', '我想好了，直接选']);
    if (c !== 0) return true;
    const k = await choose('存到哪个档？（存档会覆盖原来的）', [slotInfo(1), slotInfo(2), slotInfo(3), '不存了']);
    if (k <= 2) { let ok = false; try { ok = window.saveGame && saveGame(String(k + 1)); } catch (e) {} if (!ok) { try { toast('这一刻存不了档——先回地图上存，再来找我', 2400); } catch (e) {} return false; } }
    return true; }

  // lines：失败时演的收尾；title：「xx结局」；redo：重做找谁；clear(f)：清这条支线自己的记号
  async function fail(id, title, lines, redo, clear) {
    const f = F(); f.sq = f.sq || {};
    if (lines && lines.length) await L(lines);
    try { playSnd('ui_cancel'); } catch (e) {}
    try { await showPanel('支线失败', ['!' + title, '这一回，事情没能办成。', '这条支线可以从头再来：' + (redo || '找发任务的人重新接取') + '。', '（选错的那一步之前存过档的话，读档就能回去重选。）']); } catch (e) {}
    try { if (clear) clear(f); } catch (e) {}
    f.sq[id] = { s: 0, n: 0 }; f.sq_fail = f.sq_fail || {}; f.sq_fail[id] = (f.sq_fail[id] || 0) + 1;
    try { toast('支线失败 · 可重做', 2400); } catch (e) {} }

  // 当众推理的一问：opts 里 right 是对的下标；wrong(i) 返回答错时的台词；返回 true = 答对
  async function ask(title, opts, right, wrongLines) {
    const c = await choose(title, opts); if (c === right) return true;
    const w = typeof wrongLines === 'function' ? wrongLines(c) : wrongLines; if (w && w.length) await L(w); return false; }

  window.SQB = { key, fail, ask, failed: id => ((F().sq_fail || {})[id] || 0) };
  // 失败过、还没重新接的支线：任务书里名字后面写「失败 · 可重做」；发任务的人头上的「!」换成橙红色
  const failedNow = id => ((F().sq_fail || {})[id] || 0) && (((F().sq || {})[id] || {}).s || 0) === 0;
  try { for (const q of window.SQ_DEFS || []) { if (!q || q._r319) continue; q._r319 = 1; let base = q.name;
    Object.defineProperty(q, 'name', { configurable: true, enumerable: true, get() { return failedNow(q.id) ? base + '（失败 · 可重做）' : base; }, set(v) { base = v; } }); } } catch (e) {}
  if (typeof window.SQ_MARK === 'function') { const M0 = window.SQ_MARK; window.SQ_MARK = function (n) { const m = M0.apply(this, arguments);
    try { if (m && m[0] === '!' && (window.SQ_DEFS || []).some(q => q.giver && q.giver[1] === n.name && failedNow(q.id))) return ['!', '#ff8a5a']; } catch (e) {} return m; }; }
})();
