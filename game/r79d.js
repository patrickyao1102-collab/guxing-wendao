/* Codex R79d · 战斗菜单高质感整套（剑侠去穗版）：主指令六块整图玉牌（字已画进图）+ 仙术/秘传列表（五行、可拖动）+ 详情卡（第二层，点一下看详情，再点 / 施展 出手）
 * 全部按 layout.json 原生尺寸贴图（2 倍纹理），不拉伸；动态字用 Ma Shan Zheng。 */
(function () {
  'use strict';
  if (typeof drawBattleMenu !== 'function' || !window.BM2) return;
  const LOC = !!(window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const B = {"cast_disabled":"cd312e7bbd54a8f2835680d02d2368a8","cast_normal":"144229acef710f51b1efca5aa44aed51","cast_pressed":"a776bdf237c5ceb1cc6aee99cd906bec","command_attack_disabled":"2b754687369ae1d008acd6a3c64260dc","command_attack_normal":"11e60cca01234e01b461f7c414a6cc00","command_attack_selected":"77a0af157c3e29aa1a12fc83bad4c638","command_defend_disabled":"9451b22665722ecf8fa20ad84fe90d10","command_defend_normal":"9a952723c615d90d2911a3c513041e0d","command_defend_selected":"8033337446d4bd19c1110f3de8eb878e","command_escape_disabled":"c500d1736d8221a9959b09faac4182a4","command_escape_normal":"5c7ac5974d2fc553468016ffbab462dc","command_escape_selected":"64a8e61f20e70953c6e1115a0e89f0a8","command_item_disabled":"db8f9f87cd275df89c0d7389f3f50490","command_item_normal":"7bfafac1322ed4ed65f68c77107d26e8","command_item_selected":"b97519b40f2496afa57fb47be34a8f48","command_secret_disabled":"0f3fe23f6ba91a678bd2d20aadb394a7","command_secret_normal":"608ce826e2850b03798098b1d9e6b1fb","command_secret_selected":"f271f72d15bccffa83dc1cbc25af96f3","command_spell_disabled":"fe0bae68c86e414b066c82612d65500d","command_spell_normal":"78a1438716638896f82914fc191c1cc0","command_spell_selected":"815cf154ded7096fa8011703894e881b","detail_card":"7b1af3201b0c7c81cbc030be938e25b1","list_secret_frame":"0532a8da5e9d8081aa2987cc9614eaba","list_spell_frame":"3f9808f9462a5651ccde5626a4befcbc","scroll_thumb_sword":"6ac10d7ad0f1ecc633ca29c8bb2b7454","skill_icon_attack":"a048191dd9fcf9c584f741d97cf972f5","skill_icon_defend":"cb16f6d13515566f8286a88810c5ad74","skill_icon_escape":"f45bd15a12b88e7b558a8143f39f39e9","skill_icon_item":"d5e585dd8616e1c9d03969e3da0fdbac","skill_icon_secret":"e0f83329cc5c1f099e01b1fc5e4a313f","skill_icon_spell":"2d0e16de8d4038ad86ad960be53ba609","skill_row_normal":"67ff45d7ee9c7bfad3751f23bf7eb0b9","skill_row_selected":"f90f5a58a15851fa817e09aa3e587e03"};
  const IM = {}; let n = 0; const N = Object.keys(B).length;
  for (const k in B) { const im = new Image(); im.onload = () => { IM[k] = im; n++; }; im.src = LOC ? 'r79d/' + k + '.webp' : '/_blob/' + B[k]; }
  const READY = () => n >= N;
  window.R79D_READY = READY;
  const FONTN = '"Ma Shan Zheng","STKaiti","KaiTi",serif', INK = '#142626';
  function txt(s, x, y, size, align = 'left', col = INK, maxW) {
    ctx.save(); ctx.font = `400 ${size}px ${FONTN}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(245,235,199,.45)'; ctx.shadowOffsetY = .6; ctx.shadowBlur = .4;
    if (maxW) { let t = s; while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -1); s = t + (t.length < s.length ? '…' : ''); }
    ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.lineWidth = .25; ctx.strokeStyle = col; ctx.strokeText(s, x, y); ctx.restore(); }

  // ================= 主菜单：六块整图玉牌 =================
  const CMD = [['mi', 'secret', 660, 196], ['skill', 'spell', 638, 262], ['atk', 'attack', 624, 328], ['def', 'defend', 624, 394], ['item', 'item', 638, 460], ['flee', 'escape', 660, 526]];
  const HIT = c => ({ x: c[2] + 26, y: c[3] + 27, w: 270, h: 62 });
  let shownAt = 0, lastP = null;
  drawBattleMenu = (orig => function () {
    const b = battle; if (!b || !b.menu || !READY()) return orig.apply(this, arguments);
    if (b.menu.sub) return drawList.call(this, orig, arguments);
    const now = performance.now() / 1000; if (lastP !== b.P) { lastP = b.P; shownAt = now; }
    const hx = input.x, hy = input.y, L = BM2.CMDS;
    const items = CMD.map((c, i) => { const it = L.find(x => x.k === c[0]) || { k: c[0] }, st = BM2.state(it), h = HIT(c), hov = st.on && hx > h.x && hx < h.x + h.w && hy > h.y && hy < h.y + h.h; return { c, i, st, sel: hov || !!st.glow }; });
    const order = items.slice().sort((a, b2) => a.sel - b2.sel);
    ctx.save();
    for (const it of order) { const k = Math.max(0, Math.min(1, (now - shownAt - it.i * .04) / .18)), e = 1 - Math.pow(1 - k, 3), [, name, x0, y0] = it.c;
      const st = !it.st.on ? 'disabled' : it.sel ? 'selected' : 'normal', x = x0 + (1 - e) * 70 + (it.sel ? 14 : 0), y = y0 + (it.sel ? -3 : 0);
      ctx.globalAlpha = e; ctx.drawImage(IM['command_' + name + '_' + st], x, y, 310, 112);
      if (it.st.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = e * (.18 + .12 * Math.sin(now * 4)); ctx.drawImage(IM['command_' + name + '_selected'], x, y, 310, 112); ctx.restore(); }
      it.x = x; it.y = y; it.e = e; }
    // 副文最后统一画，层叠边缘的小字也清楚
    for (const it of items) if (it.st.note) { ctx.globalAlpha = it.e; txt(it.st.note, it.x + 136, it.y + 74 + 8.5, 16, 'left', it.st.on ? (it.st.glow ? '#6a3f06' : INK) : '#2b3238', 130); }
    ctx.restore();
  })(drawBattleMenu);
  handleMenuTap = (orig => function (tap) {
    const b = battle; if (!b || !b.menu || !READY()) return orig.apply(this, arguments);
    if (b.menu.sub) return listTap.call(this, orig, tap);
    const LY = BM2.layout();
    for (const c of CMD) { const h = HIT(c); if (tap.x > h.x && tap.x < h.x + h.w && tap.y > h.y && tap.y < h.y + h.h) { const r = LY.find(r => r.k === c[0]); window.__R79D_SECRET = c[0] === 'mi'; if (r) return orig.call(this, { x: r.x + r.w / 2, y: r.y + r.h / 2 }); } }
  })(handleMenuTap);

  // ================= 列表（第一层）+ 详情卡（第二层）=================
  const LX = 24, LY0 = 140, VX = LX + 48, VY = LY0 + 108, VW = 464, VH = 368, PITCH = 74;
  const CX = 604, CY = 140;
  const SC = { y: 0, list: null, sel: 0, drag: null, press: false };
  const maxOff = () => Math.max(0, battle.menu.sub.length * PITCH - 2 - VH);
  const sync = () => { const L = battle.menu.sub; if (SC.list !== L) { SC.list = L; SC.y = 0; SC.sel = Math.max(0, L.findIndex(s => !s.disabled)); } SC.y = Math.max(0, Math.min(maxOff(), SC.y)); };
  const rowY = i => VY + i * PITCH - SC.y;
  const rowsVis = () => battle.menu.sub.map((s, i) => { const y = rowY(i), a = Math.max(y, VY), z = Math.min(y + 72, VY + VH); return z - a < 24 ? { x: -9999, y: -9999, w: 0, h: 0 } : { x: VX, y: a, w: VW, h: z - a }; });
  const BTN = { x: CX + 78, y: CY + 416, w: 264, h: 76 };
  const inRect = (p, r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
  const open = () => typeof battle !== 'undefined' && battle && battle.menu && battle.menu.sub && READY();
  const oldRects = skillRects;
  skillRects = function () { if (!open()) return oldRects.apply(this, arguments); sync(); return rowsVis(); };
  const TARGET = { 单体: '敌方单体', 群攻: '敌方全体', 控制: '敌方单体', 必杀: '敌方全体', 减伤: '我方全队', 加攻: '我方全队', 回灵: '我方全队', 护盾: '我方全队', 加速: '我方全队', 回血: '我方', 解控: '我方全队', 狂攻: '自身', 增攻: '自身' };
  const POWER = { dianxing: 175, xingluo2: 200, xingyun: 240, tanlang: 200, jueying: 460, duopo: 400, shaxing: 270, yunlei: 150, bingfeng: 80, shenfa: 120, tianshu: 125 };
  function info(s) { const d = s.desc || '', tg = s.tag || '', m = d.match(/(\d+)\s*%/); const enemy = /单体|群攻|控制|必杀/.test(tg) || /敌/.test(d);
    return { type: enemy ? '攻击' : '辅助', target: TARGET[tg] || (/全体/.test(d) ? '敌方全体' : /全队/.test(d) ? '我方全队' : '单体'),
      power: POWER[s.k] ? POWER[s.k] + '%' : m ? (enemy ? '' : '+') + m[1] + '%' : '—', cost: s.costLabel || (s.cost ? s.cost + ' 灵力' : '无消耗') }; }
  function wrapLines(s, w, size) { ctx.save(); ctx.font = `400 ${size}px ${FONTN}`; const out = []; let ln = ''; for (const ch of s) { if (ctx.measureText(ln + ch).width > w) { out.push(ln); ln = ch; } else ln += ch; } if (ln) out.push(ln); ctx.restore(); return out; }
  function drawList(orig, args) {
    const b = battle, L = b.menu.sub; sync();
    const title = b.menu.sub.__title || (L.some(s => /秘传|绝技/.test(s.group || '')) || (b.menu.title === '秘传') ? '秘传' : '仙术');
    const secret = !!window.__R79D_SECRET || L.some(s => s.k === 'ult');
    ctx.save(); ctx.fillStyle = 'rgba(4,10,16,.30)'; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(IM[secret ? 'list_secret_frame' : 'list_spell_frame'], LX, LY0, 560, 520);
    ctx.save(); ctx.beginPath(); ctx.rect(VX - 4, VY, VW + 8, VH); ctx.clip();
    L.forEach((s, i) => { const y = rowY(i); if (y + 72 < VY || y > VY + VH) return;
      ctx.globalAlpha = s.disabled ? .55 : 1; ctx.drawImage(IM[i === SC.sel ? 'skill_row_selected' : 'skill_row_normal'], VX, y, 464, 72);
      const cx = VX + 64, cy = y + 36, uk = window.UI_ICONS && UI_ICONS.key(s.k);
      if (uk && UI_ICONS.has(uk)) UI_ICONS.draw(uk, cx, cy, 25); else ctx.drawImage(IM[s.k === 'ult' ? 'skill_icon_secret' : 'skill_icon_spell'], VX + 38, y + 10, 52, 52);
      txt((s.name || '').replace(/^(破军剑意|贪狼剑意|破军剑阵)·/, ''), VX + 92, y + 36, 30, 'left', INK, 214);
      const cost = s.costLabel ? s.costLabel.replace('怒气 ', '怒') : s.cost != null ? s.cost + '灵' : ''; if (cost) txt(cost, VX + 307 + 24.5, y + 36, cost.length > 4 ? 18 : 22, 'center');
      if (s.tag) txt(s.tag, VX + 359 + 33.5, y + 36, s.tag.length > 2 ? 18 : 21, 'center');
      ctx.globalAlpha = 1; });
    ctx.restore();
    const mo = maxOff(); if (mo > 0) ctx.drawImage(IM.scroll_thumb_sword, LX + 525, LY0 + 170 + (SC.y / mo) * 134, 20, 92);
    // 详情卡
    const cur = L[SC.sel];
    if (cur) { const f = info(cur); ctx.drawImage(IM.detail_card, CX, CY, 420, 520);
      txt(cur.name || '', CX + 64 + 145, CY + 59 + 24.5, 36, 'center', INK, 290);
      txt(f.type, CX + 116, CY + 126 + 16, 26); txt(f.target, CX + 116, CY + 164 + 16, 26);
      txt(f.power, CX + 60 + 67, CY + 246 + 17.5, 30, 'center'); txt(f.cost, CX + 230 + 67, CY + 246 + 17.5, 28, 'center', INK, 134);
      let size = 22, lh = 26, ls = wrapLines(cur.desc || '', 310, size); if (ls.length > 2) { size = 20; lh = 22; ls = wrapLines(cur.desc || '', 310, size).slice(0, 3); }
      ls.forEach((l, k) => txt(l, CX + 58, CY + 326 + lh / 2 + k * lh, size));
      const st = cur.disabled ? 'cast_disabled' : SC.press ? 'cast_pressed' : 'cast_normal'; ctx.drawImage(IM[st], CX + 70, CY + 402, 280, 96);
      if (cur.disabled && cur.why) txt(cur.why, CX + 210, CY + 392, 18, 'center', '#7a2a1a'); }
    ctx.restore();
  }
  function cast(orig, i) { const L = battle.menu.sub, s = L[i]; if (!s) return; if (s.disabled) { toast(s.why || '现在用不了'); return; }
    const top = rowY(i); if (top < VY || top + 72 > VY + VH) SC.y = Math.max(0, Math.min(maxOff(), i * PITCH - PITCH)); const r = rowsVis()[i]; SC.list = null;
    return orig({ x: r.x + 10, y: r.y + r.h / 2 }); }
  function listTap(orig, tap) {
    sync(); const L = battle.menu.sub;
    if (inRect(tap, BTN)) { try { playSnd('ui_click'); } catch (e) {} return cast(orig, SC.sel); }
    if (inRect(tap, { x: CX, y: CY, w: 420, h: 520 })) return;   // 点在详情卡上：不关
    if (inRect(tap, { x: LX + 520, y: LY0 + 130, w: 32, h: 32 })) { SC.y = Math.max(0, SC.y - PITCH); return; }
    if (inRect(tap, { x: LX + 520, y: LY0 + 390, w: 32, h: 32 })) { SC.y = Math.min(maxOff(), SC.y + PITCH); return; }
    const rs = rowsVis(), i = rs.findIndex(r => inRect(tap, r));
    if (i >= 0) { if (i !== SC.sel) { SC.sel = i; try { playSnd('ui_click'); } catch (e) {} return; } return cast(orig, i); }
    if (inRect(tap, { x: LX, y: LY0, w: 560, h: 520 })) return;   // 点在面板空白处：不关
    SC.list = null; return orig(tap);   // 点在外面：返回
  }
  // 拖动滚动：列表区按下先不算点击，移动超过 8px 就是拖动；松手没动才算点
  const inView = p => p.x > VX && p.x < VX + VW && p.y > VY && p.y < VY + VH;
  cv.addEventListener('pointerdown', e => { if (!open()) return; const p = toLogical(e); if (inRect(p, BTN)) SC.press = true; if (!inView(p)) return; SC.drag = { y0: p.y, s0: SC.y, moved: false, p }; input.tapped = null; });
  cv.addEventListener('pointermove', e => { if (!SC.drag) return; const p = toLogical(e), dy = p.y - SC.drag.y0; if (Math.abs(dy) > 8) SC.drag.moved = true; if (SC.drag.moved) SC.y = Math.max(0, Math.min(maxOff(), SC.drag.s0 - dy)); });
  window.addEventListener('pointerup', () => { SC.press = false; const d = SC.drag; SC.drag = null; if (d && !d.moved && open()) input.tapped = d.p; });
  cv.addEventListener('wheel', e => { if (!open()) return; SC.y = Math.max(0, Math.min(maxOff(), SC.y + e.deltaY * .6)); e.preventDefault(); }, { passive: false });
})();
