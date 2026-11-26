// ================= R390 · 天剑宗的路：理顺出入口（只进测试版）=================
// 作者 11-27 晨：「理清天剑宗所有的道路通道是不是相互互通的，整体路线是不是合理的。」
// 把宗门二十几张图的出入口全查了一遍（每个出口都走得到）。查出来不顺的三处，在这里改：
//   ① 藏经阁外院往南下台阶能直接到演武广场，广场却没有路回藏经阁（只能绕竹林归径），而且到的地方是广场最南边下山的台阶上——像是从山下上来的。
//      → 广场西南角、去竹林归径的法阵旁边，加一处「西 · 藏经阁」；外院南阶回到这里。两头对上。
//   ② 从竹林归径往西进外院，落在外院的南阶口；可外院回竹林归径的法阵在西南角。→ 改成落在那座法阵旁边。两头对上。
//   ③ 同一个广场三个叫法（演武广场 / 问剑坪 / 宗门广场）：出口牌子统一叫「演武广场」（对白里的「问剑坪」没动，等作者定用哪个名字）。
//   ④ 从天剑山下到山外树林是单行道（见下）。
// 另：「竹影山阶」这张旧图现在没有任何入口（后山和小院之间早就改走云海大亭了），留着不碍事，不动。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.tj_front || !TMAPS.tj_scripture) return;
  const F = TMAPS.tj_front, SC = TMAPS.tj_scripture, BM = TMAPS.qingzhu_bamboo, MK = TMAPS.tj_market;
  const at = (x, y) => [x / 64 - .5, y / 64 - .8];
  try {
    // ① 广场 ↔ 藏经阁外院
    const PZ = [600, 1792];   // 广场西南角、「竹林归径」法阵东边那片空白玉地（世界坐标；廊子里的格子压着栏杆，法阵画上去像悬在栏杆外）
    if (!(F.exits || []).some(e => e.to === 'tj_scripture')) F.exits.push({ x: Math.round(PZ[0] / 32) - 2, y: Math.round(PZ[1] / 32) - 1, w: 3, h: 3, to: 'tj_scripture', label: '西 · 藏经阁', at: [15.75, 29], face: 'up', r390: 1 });
    const s = (SC.exits || []).find(e => e.to === 'tj_front'); if (s) { s.at = at(PZ[0] + 110, PZ[1] + 16); s.face = 'right'; s.label = '南 · 演武广场'; }
    // ② 竹林归径 ↔ 藏经阁外院（西南角法阵）
    const c = (SC.exits || []).find(e => e.to === 'qingzhu_bamboo'), w = BM && (BM.exits || []).find(e => e.to === 'tj_scripture');
    if (c) { c.label = '西南 · 竹林归径'; if (w) { w.at = at((c.x + c.w / 2) * 32 + 120, (c.y + c.h / 2) * 32 - 10); w.face = 'right'; } }
    // ③ 牌子
    const m = MK && (MK.exits || []).find(e => e.to === 'tj_front'); if (m) m.label = '南 · 演武广场';
    // ④ 山外树林 → 松风林道：从天剑山走得下去，却走不回来（林子里没有上山的出口，只能靠松伯的传送玉符）→ 落脚的篝火旁加一处「上山 · 松风林道」
    const LF = TMAPS.lin_forest, XS = TMAPS.tj_xiashan;
    if (LF && XS && !(LF.exits || []).some(e => e.to === 'tj_xiashan')) { const gate = (LF.exits || []).find(e => e.to === 'qy_town');
      LF.exits.push({ x: 42, y: 55, w: 3, h: 2, to: 'tj_xiashan', label: '上山 · 松风林道', at: at(4440, 2760), face: 'left', cond: gate && gate.cond ? gate.cond : null, msg: '呼救声是从林子北边的空地传来的——先去救人！', r390: 1 }); }
  } catch (e) { console.warn('R390', e); }
  window.R390 = 1;
})();
