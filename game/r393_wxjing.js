// ================= R393 · 五行之精：金精 / 木精 / 水精 / 火精 / 土精（只进测试版）=================
// 作者 11-27 08:30：「宝箱可以多放一点，不一定都放装备……药材啊，还有炼器材料」。
// 定下的规矩只有一条：打什么属性的妖兽，就掉什么属性的精。金性的掉金精，火性的掉火精……
// 用处（炼器那一套接上之后）：给星痕剑点星纹、打五行兵器衣甲。现在先让它掉、让宝箱里出，玩家先攒着。
// 图标：Codex R389 画的（金精银珠、木精带芽的种子、水精水滴、火精余烬、土精圆石）。
// 顺带放一个小工具给今天这几个文件共用：SAY_LATER(fn) —— 等画面「静下来」（不在战斗、没有对话 / 选项 / 弹窗 / 获得物品框、不在转场）再让星旋开口，一次只说一段，不和别的框叠在一起。
(function () {
  if (window.SAY_LATER || typeof S === 'undefined' || !S.overlay) return;
  let t = performance.now(), busy = false; const Q = [];
  const idle = () => { try { return S.scene === drawMap && !!world.map && !world.locked && !battle && !dialog && !choice && !sysPanel && !S.menu && !(S.fade > .05) && !(window.IG_OPEN && IG_OPEN()) && !(window.ITEMGET_ACTIVE && ITEMGET_ACTIVE()) && !(window.R386 && R386.isOpen && R386.isOpen()); } catch (e) { return false; } };
  window.UI_QUIET = ms => !busy && performance.now() - t >= (ms || 600);
  window.SAY_LATER = fn => { if (typeof fn === 'function') Q.push(fn); };
  S.overlay.push({ draw() { if (busy || !idle()) { t = performance.now(); return; } if (!Q.length || performance.now() - t < 650) return;
      busy = true; const fn = Q.shift(); world.locked = true; if (world.player) world.player.moving = false; world.path = null;
      (async () => { try { await fn(); } catch (e) { console.warn('SAY_LATER', e); } finally { world.locked = false; busy = false; t = performance.now(); } })(); } });
})();
(function () {
  if (typeof ITEM_DB === 'undefined' || !window.WX5) return;
  const EL = {
    jin: ['金精', '金性的妖兽、矿脉里凝出的一点锐金之气，指甲盖大小，又冷又沉。炼器时拿它给兵器衣甲淬上金性。'],
    mu: ['木精', '木性的妖物、老树心里凝出的一点生机，温润带绿。炼器时拿它给兵器衣甲淬上木性。'],
    shui: ['水精', '水性的妖兽、寒潭底下凝出的一滴阴寒，握在手里像握着一块冰。炼器时拿它给兵器衣甲淬上水性。'],
    huo: ['火精', '火性的妖兽体内凝出的一点余烬，隔着布都烫手。炼器时拿它给兵器衣甲淬上火性。'],
    tu: ['土精', '土性的妖兽、山石深处凝出的一点厚重，比同样大的铁还沉。炼器时拿它给兵器衣甲淬上土性。'],
  };
  const ID = el => 'm_wx_' + el;
  for (const el in EL) if (!ITEM_DB[ID(el)]) ITEM_DB[ID(el)] = { name: EL[el][0], price: 0, sell: 30, mat: true, wx: el, desc: EL[el][1] };
  // 掉落：每只妖兽两成机会掉它那一行的精；妖王、头目必掉两枚
  try { if (typeof DROPS !== 'undefined') for (const [key, el] of Object.entries(WX5.ENEMY || {})) { if (!EL[el]) continue; const d = DROPS[key] = DROPS[key] || []; if (!d.some(x => x[0] === ID(el))) d.push([ID(el), .2]); } } catch (e) {}
  try { for (const y of window.R370_YW || []) { const el = (WX5.YW || {})[y.id]; if (!EL[el]) continue; y.extra = y.extra || []; if (!y.extra.includes(ID(el))) y.extra.push(ID(el), ID(el)); } } catch (e) {}
  // 图标：Codex R389 画的五枚（r389i/m_wx_*.webp）；画法同别的材料：深色圆底 + 一圈五行色的细边
  const RING = { jin: '#d8dde4', mu: '#6fc98a', shui: '#6fb6ee', huo: '#f08a4a', tu: '#d0a860' };
  const IM = {}; const get = el => { let o = IM[el]; if (!o) { o = IM[el] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r389i/m_wx_' + el + '.webp?v=1'; } return o.ok ? o.im : null; };
  if (typeof itemIcon === 'function') itemIcon = (orig => function (id, x, y, r) { const it = ITEM_DB[id], im = it && it.wx && /^m_wx_/.test(id) && get(it.wx); if (!im) return orig.apply(this, arguments);
    ctx.save(); const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)'); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = RING[it.wx] || '#9a8a70'; ctx.stroke();
    const s = r * 1.9; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x - s / 2, y - s / 2, s, s); ctx.restore(); })(itemIcon);
  setTimeout(() => { for (const el in EL) get(el); }, 6000);
  window.WXJ = { EL, ID, count: el => { try { return (S.hero.bag[ID(el)] || 0); } catch (e) { return 0; } } };
  // 头一回拿到：星旋交代一句（只说一回）
  let queued = false;
  if (typeof addItem === 'function') addItem = (orig => function (id, n) { const r = orig.apply(this, arguments);
    try { const f = (S.flags = S.flags || {}); if (/^m_wx_/.test(id) && !f.wxj_said && !queued) { queued = true; SAY_LATER(async () => { const g = S.flags || {}; queued = false; if (g.wxj_said) return; g.wxj_said = 1; await say('星旋', '「' + ITEM_DB[id].name + '」？收好。妖兽是什么性，身上就凝什么精——这东西炼器用得上，攒着。'); }); } } catch (e) {} return r; })(addItem);
})();
