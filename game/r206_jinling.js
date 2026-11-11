// ================= 作者 11-11：赵师弟擂台掉落完整「金铃」饰品（原来只写了「金铃（残）」一行字，背包里什么都没有）=================
// 图标：图集里没有铃铛，先用代码画一枚金铃（圆底 + 品质灵绿外圈，和别的物品图标同一套外观）；以后 Codex 出了图标再换
(function () {
  if (typeof itemIcon !== 'function') return;
  function bell(x, y, r) {
    ctx.save();
    const g0 = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g0.addColorStop(0, 'rgba(70,52,34,.9)'); g0.addColorStop(1, 'rgba(18,12,8,.92)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g0; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = '#5fbf73'; ctx.stroke();
    const s = r / 20; ctx.translate(x, y + s * 1.5); ctx.scale(s, s);
    // 系绳
    ctx.strokeStyle = '#b8432f'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -15); ctx.quadraticCurveTo(-3, -18, 0, -20); ctx.quadraticCurveTo(3, -18, 0, -15); ctx.stroke();
    // 铃身
    const g = ctx.createLinearGradient(-11, 0, 11, 0); g.addColorStop(0, '#8a5a14'); g.addColorStop(.35, '#ffe08a'); g.addColorStop(.6, '#e0a930'); g.addColorStop(1, '#7a4c10');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-3, -14); ctx.quadraticCurveTo(-9, -12, -9, -2); ctx.quadraticCurveTo(-9, 6, -13, 9); ctx.lineTo(13, 9); ctx.quadraticCurveTo(9, 6, 9, -2); ctx.quadraticCurveTo(9, -12, 3, -14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,32,4,.85)'; ctx.lineWidth = 1; ctx.stroke();
    // 纹饰两道
    ctx.strokeStyle = 'rgba(120,70,10,.8)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-8.6, -3); ctx.quadraticCurveTo(0, -1, 8.6, -3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10.5, 6); ctx.quadraticCurveTo(0, 8, 10.5, 6); ctx.stroke();
    // 铃舌
    const g2 = ctx.createRadialGradient(-1, 11, .5, 0, 12, 3.4); g2.addColorStop(0, '#fff1b8'); g2.addColorStop(1, '#a86e18'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(0, 12, 3.2, 0, 7); ctx.fill();
    // 高光
    ctx.fillStyle = 'rgba(255,255,240,.55)'; ctx.beginPath(); ctx.ellipse(-4, -6, 1.4, 4.5, .15, 0, 7); ctx.fill();
    ctx.restore();
  }
  itemIcon = (orig => function (id, x, y, r) { if (id === 'c_jinling') return bell(x, y, r); return orig.apply(this, arguments); })(itemIcon);
  // 赢了擂台：真把金铃放进行囊，并用白色「获得物品」框展示
  if (typeof zhaoBattle === 'function') zhaoBattle = (orig => async function () {
    const win = await orig.apply(this, arguments);
    if (win && !(S.flags && S.flags.got_jinling)) { S.flags.got_jinling = 1; addItem('c_jinling', 1);
      try { if (window.itemGet) await itemGet([{ icon: 'item:c_jinling', name: '金铃', count: '×1', desc: '饰品 · 气血+40 身法+3 防御+2' }], '获得物品'); } catch (e) {} }
    return win;
  })(zhaoBattle);
})();

// ================= 作者 11-11：云霆「九天神雷」大幅加强 —— 每个敌人吃到的伤害 ≈ 叶孤星「绝影」的三分之二（群攻）=================
// 绝影 = 叶孤星攻击 × 600%；九天神雷原来三轮小雷 .5×3 + 主雷 1.2 = 云霆攻击 × 270%。
// 现在按「叶孤星攻击 × 400%」折算回云霆身上的倍率（云霆攻击高了低了都对得上），最少也有原来的 1.3 倍。
(function () {
  if (typeof dmgCalc !== 'function') return;
  dmgCalc = (orig => function (att, def, mult = 1, critRate) {
    try { const b = typeof battle !== 'undefined' && battle;
      if (b && b.curSk === 'ult' && att && att.ally === 'yunting' && def && def.side === 'enemy') {
        const H = b.main && !b.main.ally ? b.main : null, ha = H ? H.atk : att.atk;
        mult *= Math.max(1.3, (4.75 * ha) / (2.7 * Math.max(1, att.atk))); /* 4 段各吃一次防御，实测 4.75 ≈ 绝影的 2/3 */ } } catch (e) {}
    return orig.call(this, att, def, mult, critRate);
  })(dmgCalc);
})();

// ================= 作者 11-11：云霆入队就会「强攻」（辅助第一招，原来要到 12 级才领悟）；九天神雷说明改成实际威力 =================
(function () {
  const give = () => { try { (S.sk4 || (S.sk4 = {}))['yunting.qianggong'] = 1; } catch (e) {} };
  if (typeof joinParty === 'function') joinParty = (o => function (k) { const r = o.apply(this, arguments); if (k === 'yunting') give(); return r; })(joinParty);
  // 读档进来、已经在队里的也补上
  setInterval(() => { try { if (S.party && S.party.includes('yunting') && !(S.sk4 && S.sk4['yunting.qianggong'])) give(); } catch (e) {} }, 2000);
  const D = '引九天雷霆劈落全体，每个敌人约吃叶孤星「绝影」三分之二的伤害，40% 麻痹';
  try { if (window.SKT && SKT.nodeOf) { const n = SKT.nodeOf('yunting', 'ult'); if (n) n.desc = D; } } catch (e) {}
  try { if (ITEM_DB.bk_yt_jiutian) ITEM_DB.bk_yt_jiutian.desc = '云霆的秘传。' + D.replace('引', '引') + '。买下后在技能页给云霆参悟'; } catch (e) {}
})();

// ================= 作者 11-11：林溪（Codex R205 重画）对话立绘：默认 / 笑 / 惊 / 羞 / 偷看。旧图集 chars1 里的林逸三格不再用 =================
(function () {
  const E = { default: '', smile: '笑', surprise: '惊', shy: '羞', peek: '偷看' };
  for (const [e, n] of Object.entries(E)) { const key = 'p_lx_' + e, im = new Image(); im.onload = () => { IMG[key] = im; }; im.src = 'portraits/linxi_' + e + '.webp';
    const nm = n ? '林溪·' + n : '林溪'; SPEAKERS[nm] = Object.assign({}, SPEAKERS['林溪'] || {}, { p: key, name: '林溪', color: '#bff5d0' });
    if (typeof MEDAL_FACE !== 'undefined') MEDAL_FACE[key] = { fx: .5, fy: .2, span: .4 }; }
  SPEAKERS['林溪·喜'] = SPEAKERS['林溪·笑']; SPEAKERS['林溪·害羞'] = SPEAKERS['林溪·羞'];
  // 旧图集载完会把 p_c_linyi_* 填成男版林逸——锁成新图
  for (const [c, e] of [['linyi_default', 'default'], ['linyi_smile', 'smile'], ['linyi_surprise', 'surprise']]) { let old = IMG['p_c_' + c];
    Object.defineProperty(IMG, 'p_c_' + c, { configurable: true, enumerable: true, get: () => IMG['p_lx_' + e] || old, set: v => { old = v; } }); }
})();
