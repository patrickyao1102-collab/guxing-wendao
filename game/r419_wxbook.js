// ================= R419 · 五行图鉴（只进测试版）=================
// 作者 11-27 22:57：「直接点战斗里面最下角有一个提示按钮，然后可以把五行相生相克表列出来……画一个五行圈。
//                   同时也做一个文字版本的，用箭头表示，一行一行的，比如金克木、木克土……底下再写上次克、相生。」
// 图全是 Codex R413 画的（r413/）：五行圈四层（底盘 + 相克 / 次克 / 相生三层箭）、三支文字箭头、「五行」钮。
// 战斗里轮到自己选行动时，左下角出现「五行」钮；点开是图鉴，点三个签可以只看某一种箭。
(function () {
  if (!window.WX5 || !window.R386_KIT || typeof cv === 'undefined') return;
  const K = R386_KIT, { D, T, KAI, BR } = K, W5 = WX5;
  const ART = {}; function art(n) { let a = ART[n]; if (!a) { a = ART[n] = { im: new Image(), ok: false }; a.im.onload = () => { a.ok = true; }; a.im.src = 'r413/' + n + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(a.im); } catch (e) {} } return a.ok ? a.im : null; }
  setTimeout(() => { for (const n of ['btn_wx', 'btn_wx_p', 'wheel_base', 'wheel_ke', 'wheel_cike', 'wheel_sheng', 'row_ke', 'row_cike', 'row_sheng']) art(n); }, 6000);

  const BTN = { x: 54, y: 606, r: 40 };
  const P = { x: 70, y: 36, w: 1140, h: 648 }, CLOSE = { x: 1086, y: 52, w: 108, h: 46 };
  const WH = { x: 100, y: 128, s: 470 };   // 五行圈
  const SOCK = { jin: [280, 90], shui: [461, 221], mu: [392, 434], huo: [168, 434], tu: [99, 221] };
  const S_ORDER = ['jin', 'shui', 'mu', 'huo', 'tu'];
  const KINDS = [
    { k: 'ke', n: '相克', col: '#F0B070', rows: ['jin', 'mu', 'tu', 'shui', 'huo'].map(a => [a, W5.KE[a]]), note: '伤害 × 1.3' },
    { k: 'cike', n: '次克', col: '#F4A35A', rows: S_ORDER.map(b => [W5.SHENG[b], b]), note: '伤害 × 1.15' },
    { k: 'sheng', n: '相生', col: '#A8D8A0', rows: S_ORDER.map(a => [a, W5.SHENG[a]]), note: '伤害 × 0.7' }];
  const COL = i => ({ x: 600 + i * 198, y: 116, w: 190 });
  let open = false, sel = null, pressT = 0;

  const myTurn = b => b && (b.state === 'menu' || b.state === 'pick') && !(typeof dialog !== 'undefined' && dialog) && !(typeof sysPanel !== 'undefined' && sysPanel);

  function drawBtn() { const im = art(performance.now() - pressT < 160 ? 'btn_wx_p' : 'btn_wx'); if (!im) return; const d = BTN.r * 2;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 10; ctx.drawImage(im, BTN.x - BTN.r, BTN.y - BTN.r, d, d); ctx.restore(); }

  function drawBook(mode) { K.kitLoad(); const forge = mode === 'forge';   // 剑炉里也用这本（作者 11-28：精炼旁边要有个小贴士，一点开就看到相生相克）
    ctx.save(); ctx.fillStyle = 'rgba(4,8,12,.86)'; ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = 'rgba(9,20,26,.94)'; ctx.fillRect(P.x + 8, P.y + 8, P.w - 16, P.h - 16); D('panel_main_9', P.x, P.y, P.w, P.h);
    T('五 行 图 鉴', P.x + 300, P.y + 42, 34, '#E9D9A8', BR(), 400, 'center');
    D('close_n', CLOSE.x, CLOSE.y, CLOSE.w, CLOSE.h); T('关　闭', CLOSE.x + CLOSE.w / 2, CLOSE.y + CLOSE.h / 2 + 1, 19, '#E9D9A8', KAI(), 600, 'center');
    // 五行圈
    const k = WH.s / 560, base = art('wheel_base');
    if (base) ctx.drawImage(base, WH.x, WH.y, WH.s, WH.s);
    for (const el of W5.ORDER) { const [sx, sy] = SOCK[el]; W5.emblem(el, WH.x + sx * k, WH.y + sy * k, 44 * k / .9); }
    for (const kd of [KINDS[2], KINDS[1], KINDS[0]]) { if (forge && kd.k === 'cike') continue; const im = art('wheel_' + kd.k); if (!im) continue; ctx.save(); ctx.globalAlpha = !sel || sel === kd.k ? 1 : .1; ctx.drawImage(im, WH.x, WH.y, WH.s, WH.s); ctx.restore(); }
    // 文字版：三列
    (forge ? [Object.assign({}, KINDS[2], { note: '炉里连线发绿' }), Object.assign({}, KINDS[0], { note: '炉里连线发红' })] : KINDS).forEach((kd, i) => { const c = forge ? { x: 640 + i * 250, y: 116, w: 210 } : COL(i), on = forge || !sel || sel === kd.k;
      D(sel === kd.k ? 'category_s' : 'category_n', c.x, c.y, c.w, 46);
      T(kd.n, c.x + c.w / 2, c.y + 24, 22, on ? '#F2E4B8' : '#8E958F', KAI(), 600, 'center');
      ctx.save(); ctx.globalAlpha = on ? 1 : .32;
      T(kd.note, c.x + c.w / 2, c.y + 72, 16, kd.col, KAI(), 500, 'center');
      const im = art('row_' + kd.k);
      kd.rows.forEach(([a, t], j) => { const y = c.y + 118 + j * 58;
        W5.emblem(a, c.x + 20, y, 17);
        if (im) ctx.drawImage(im, c.x + 40, y - 16, 112, 31);
        W5.emblem(t, c.x + 172, y, 17); });
      ctx.restore(); });
    // 说明
    const nx = 610, ny = 508; D('panel_well_9', nx - 10, ny, 586, 152);
    if (forge) { T('剑炉里：相邻两样「相生」，连线发绿；「相克」，连线发红。', nx + 10, ny + 30, 17, '#E4DDC9', KAI(), 500);
      T('绿越多，出的东西越好；红的照样能合，只是差一些。', nx + 10, ny + 64, 17, '#E4DDC9', KAI(), 500);
      T('照 金 → 水 → 木 → 火 → 土 围一圈，一圈全绿。', nx + 10, ny + 98, 17, '#A8D8A0', KAI(), 600);
      T('点哪里都能关上', WH.x + WH.s / 2, P.y + P.h - 22, 15, '#667375', KAI(), 500, 'center'); ctx.restore(); return; }
    T('你打它：「克」伤害多三成，「次克」多一成半，「生」少三成。', nx + 10, ny + 28, 17, '#E4DDC9', KAI(), 500);
    T('次克：被生的那一行，反过来次克生它的——', nx + 10, ny + 62, 17, '#E4DDC9', KAI(), 500);
    T('金生水，所以水打金是次克（子盗母气）。', nx + 10, ny + 90, 17, '#E4DDC9', KAI(), 500);
    T('人物头顶的小徽记，就是他是哪一行。点上面的签，只看一种。', nx + 10, ny + 124, 15, '#A6AEA6', KAI(), 500);
    T('点空白处关闭', WH.x + WH.s / 2, P.y + P.h - 22, 15, '#667375', KAI(), 500, 'center');
    ctx.restore(); }

  // 最后才包：血条、头像这些别的补丁也是包 drawBattle 画的，图鉴要盖在它们上面
  let wrapped = 0; const wrapLate = () => { if (wrapped || typeof drawBattle !== 'function') return; wrapped = 1; drawBattle = (orig => function () { const r = orig.apply(this, arguments);
    try { const b = typeof battle !== 'undefined' && battle; if (!b) open = false; else if (!open && myTurn(b)) drawBtn(); } catch (e) {} return r; })(drawBattle) };
  // 图鉴本身画在血条、头像这些浮层之后（它们画在 S.overlay 里），盖在最上面
  if (typeof drawLetterbox === 'function') drawLetterbox = (orig => function () { const r = orig.apply(this, arguments); try { if (open && typeof battle !== 'undefined' && battle) drawBook(); } catch (e) {} return r; })(drawLetterbox);
  if (document.readyState === 'complete') setTimeout(wrapLate, 0); else window.addEventListener('load', () => setTimeout(wrapLate, 0)); setTimeout(wrapLate, 15000);

  const inR = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  try { cv.addEventListener('pointerdown', e => { const b = typeof battle !== 'undefined' && battle; if (!b) return; const p = toLogical(e);
    if (!open) { if (!myTurn(b) || Math.hypot(p.x - BTN.x, p.y - BTN.y) > BTN.r + 8) return;
      e.stopImmediatePropagation(); e.preventDefault(); try { input.tapped = null; } catch (e2) {} pressT = performance.now(); try { playSnd('ui_confirm', .6); } catch (e2) {} setTimeout(() => { open = true; sel = null; }, 120); return; }
    e.stopImmediatePropagation(); e.preventDefault(); try { input.tapped = null; } catch (e2) {}
    for (let i = 0; i < 3; i++) { const c = COL(i); if (inR(p, { x: c.x, y: c.y, w: c.w, h: 46 })) { sel = sel === KINDS[i].k ? null : KINDS[i].k; try { playSnd('ui_confirm', .4); } catch (e2) {} return; } }
    if (inR(p, CLOSE) || !inR(p, P)) { open = false; try { playSnd('ui_cancel', .5); } catch (e2) {} } }, true); } catch (e) {}
  window.WXBOOK = { open: () => { open = true; sel = null; }, close: () => { open = false; }, isOpen: () => open, draw: drawBook, art };
})();
