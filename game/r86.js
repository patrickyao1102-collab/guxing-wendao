// ================= R86 战斗菜单 · A 羊脂白玉（Codex 透明分层件 + 毛笔字实时写）=================
// 主菜单：白玉剑轴 + 六片剑片（普通 / 选中 / 不可用）+ 指令圆章；招式列表：标题条 + 可拖动行 + 剑形滚动条 + 常驻说明卡 + 施展按钮。
// 坐标全部照 Codex layout.json（1280×720）。交互沿用 R79d：点行选中，再点或按「施展」放招；拖动滚动；点外面返回。
(function () {
  if (typeof drawBattleMenu !== 'function' || !window.BM2) return;
  const LOC = !!(window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const B = {"action_normal": "9e1a5dfb05316d5ebd536fe007a0b993", "action_pressed": "03b242b50465c57b31933a09ca6a1e3c", "back_normal": "1bbc8809b3aa8d3b9416740ea97fe660", "back_pressed": "32e7256e8d58ecc31ad2156ae71df7f9", "confirm_normal": "887451b4c6ae457e3670b4c49ef35607", "confirm_pressed": "a73b97f8a1b91ff1b58614b5a89749bd", "cost_plate": "b7686a6e3926d2335632f3ab4ec6bc94", "detail_card": "ff42d53dfb59e48ca76005b0e8bfc6f8", "icon_attack_disabled": "40f0dffab83769c625552416175b293e", "icon_attack_normal": "feb21873f976a0aaba61d198abb7fb08", "icon_defend_disabled": "d253b2c64633c6ee76328bc7dc5f3d04", "icon_defend_normal": "3cf2dd834cbb8e2292b76b1c1594332c", "icon_escape_disabled": "cbb26e0117e86b3e376941cbfb44cede", "icon_escape_normal": "c46e4a1ff423c86d473a2041e471ea0b", "icon_item_disabled": "f17f3792a0f6aca70296a6819e754f60", "icon_item_normal": "d8227100aa2abc0a9cd99013d424b9b1", "icon_secret_disabled": "516cc7fd05534803d8e5a8a91ca55792", "icon_secret_normal": "bac28bc46d0896678f3ba1617e450965", "icon_spell_disabled": "1c6d18f38a2f6736163d1c1b920059cd", "icon_spell_normal": "b83c0c21497229c99ba043725a28082b", "list_footer": "124c52ff4fb061f54884c63f27e97fd6", "list_header": "07202b6c08db875d9929d366db292945", "list_row_disabled": "e19809044232659b620495c5bdfd7536", "list_row_normal": "ffed2e1dac7fc887959d370459709934", "list_row_selected": "f83af25311e12d314a98e1040373e3d1", "main_blade_disabled": "22c2f00dd202ebe749bf1353b6bf22e4", "main_blade_normal": "789a2d2795fbdb46d793512d3539db86", "main_blade_selected": "fc681f531117176a6ccb315ea16ea38e", "scroll_down": "df455cb94e7ccb50af10795bf3d12afc", "scroll_thumb_sword": "b8addff9ae5c911dea91ee9e9f3e8fb3", "scroll_track": "327c0676b9c9432c0e462e04810ffa2d", "scroll_up": "dcc1f7cbeb6fbd3c6ed622a02ab6219e", "skill_icon_frame": "a7f28c14df2e594c9d0c0e9d272c6be0", "sword_axis": "7bd1d92d792dc83dfc90f790e154930a", "tag_attack": "5743e6aa3d7929e5b25d41cc53ee83f8", "tag_control": "446eefde856be48e81ddc4704c293978", "tag_group": "dea999607f35e71bb24258c3d9fcb581", "tag_support": "86d6a882cb0c171cc4c6f13298ffcf8d", "target_banner": "6ca759f8d47883b52123d6e5a3ee64b6", "target_confirm_bar": "e37aed76f650c2e91bb123d0f336f515", "target_marker": "3d6d19d312fdfd8e07e83a4222685953", "target_ring": "32b5c65d35d984c5f43bb4518892b0d7"};
  const IM = {}; let n = 0; const N = Object.keys(B).length;
  for (const k in B) { const im = new Image(); im.onload = () => { IM[k] = im; n++; }; im.src = LOC ? 'r86/' + k + '.webp' : '/_blob/' + B[k]; }
  const READY = () => n >= N; window.R86_READY = READY; window.R79D_READY = READY;
  const FONTN = '"Ma Shan Zheng","STKaiti","KaiTi",serif', INK = '#17282b', DIS = '#5e6367', DIS2 = '#697276';
  // 作者 10-31：菜单太大 → 整体缩到 0.8，以 (620,395) 为中心；画面整体变换，点击坐标反算回原布局
  const K = .8, AX = 620, AY = 395, U = p => ({ x: AX + (p.x - AX) / K, y: AY + (p.y - AY) / K }), XF = () => { ctx.translate(AX, AY); ctx.scale(K, K); ctx.translate(-AX, -AY); };
  window.R86_SCALE = { K, AX, AY, U };
  const D = (k, x, y, w, h) => { const im = IM[k]; if (im) ctx.drawImage(im, x, y, w, h); };
  function txt(s, x, y, w, h, size, align = 'left', col = INK) { if (s == null || s === '') return;
    ctx.save(); let f = size; ctx.font = `400 ${f}px ${FONTN}`; while (f > 10 && ctx.measureText(s).width > w) { f -= 1; ctx.font = `400 ${f}px ${FONTN}`; }
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; const tx = align === 'center' ? x + w / 2 : align === 'right' ? x + w : x;
    ctx.fillText(s, tx, y + h / 2 + 1); ctx.lineWidth = .3; ctx.strokeStyle = col; ctx.strokeText(s, tx, y + h / 2 + 1); ctx.restore(); }
  function wrap(s, w, size) { ctx.save(); ctx.font = `400 ${size}px ${FONTN}`; const out = []; let ln = '';
    for (const ch of s) { if (ctx.measureText(ln + ch).width > w && !'，。、；：！？）」'.includes(ch)) { out.push(ln); ln = ch; } else ln += ch; } if (ln) out.push(ln); ctx.restore(); return out; }

  // ================= 主菜单 =================
  const CMD = [['mi', 'secret', '秘传'], ['skill', 'spell', '仙术'], ['atk', 'attack', '攻击'], ['def', 'defend', '防御'], ['item', 'item', '道具'], ['flee', 'escape', '逃跑']];
  const DEF_NOTE = { atk: '普通攻击', def: '减伤·回灵' };
  const rowY = i => 170 + i * 76, HIT = i => ({ x: 488, y: rowY(i) + 6, w: 346, h: 66 });
  let shownAt = 0, lastP = null, hoverI = -1;
  drawBattleMenu = (orig => function () {
    const b = battle; if (!b || !b.menu || !READY()) return orig.apply(this, arguments);
    if (b.menu.sub) return drawList.call(this, orig, arguments);
    const now = performance.now() / 1000; if (lastP !== b.P) { lastP = b.P; shownAt = now; }
    const L = BM2.CMDS, hu = U(input), hx = hu.x, hy = hu.y; hoverI = -1;
    ctx.save(); XF();
    const ka = Math.max(0, Math.min(1, (now - shownAt) / .18)); ctx.globalAlpha = ka; D('sword_axis', 430, 145, 78, 500);
    CMD.forEach(([k, nm, label], i) => { const it = L.find(x => x.k === k) || { k }, st = BM2.state(it), h = HIT(i);
      const hov = st.on && hx > h.x && hx < h.x + h.w && hy > h.y && hy < h.y + h.h; if (hov) hoverI = i;
      const sel = st.on && (hov || !!st.glow), state = !st.on ? 'disabled' : sel ? 'selected' : 'normal', off = sel ? 6 : 0;
      const k2 = Math.max(0, Math.min(1, (now - shownAt - i * .04) / .2)), e = 1 - Math.pow(1 - k2, 3), sx = (1 - e) * -40, y = rowY(i), x = 480 + off + sx;
      ctx.globalAlpha = e; D('main_blade_' + state, x, y, 390, 80);
      if (st.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = e * (.12 + .1 * Math.sin(now * 4)); D('main_blade_selected', x, y, 390, 80); ctx.restore(); }
      D('icon_' + nm + '_' + (st.on ? 'normal' : 'disabled'), x + 24, y + 7, 64, 64);
      const col = st.on ? '#10282b' : DIS; txt(label, x + 99, y + 6, 186, 40, 39, 'center', col); txt(st.note || DEF_NOTE[k] || '', x + 95, y + 47, 199, 21, 18, 'center', col); });
    ctx.restore();
  })(drawBattleMenu);
  handleMenuTap = (orig => function (tap) {
    const b = battle; if (!b || !b.menu || !READY()) return orig.apply(this, arguments);
    if (b.menu.sub) return listTap.call(this, orig, tap);
    tap = U(tap); const LY = BM2.layout();
    for (let i = 0; i < CMD.length; i++) { const h = HIT(i); if (tap.x > h.x && tap.x < h.x + h.w && tap.y > h.y && tap.y < h.y + h.h) { const r = LY.find(r => r.k === CMD[i][0]); window.__R79D_SECRET = CMD[i][0] === 'mi'; if (r) return orig.call(this, { x: r.x + r.w / 2, y: r.y + r.h / 2 }); } }
  })(handleMenuTap);

  // ================= 列表 + 说明卡 =================
  const VX = 258, VY = 228, VW = 400, VH = 390, PITCH = 78;
  const SC = { y: 0, list: null, sel: 0, drag: null, press: false };
  const maxOff = () => Math.max(0, battle.menu.sub.length * PITCH - VH);
  const sync = () => { const L = battle.menu.sub; if (SC.list !== L) { SC.list = L; SC.y = 0; SC.sel = Math.max(0, L.findIndex(s => !s.disabled)); } SC.y = Math.max(0, Math.min(maxOff(), SC.y)); };
  const rY = i => VY + i * PITCH - SC.y;
  const rowsVis = () => battle.menu.sub.map((s, i) => { const y = rY(i), a = Math.max(y, VY), z = Math.min(y + 78, VY + VH); return z - a < 26 ? { x: -9999, y: -9999, w: 0, h: 0 } : { x: VX + 14, y: a, w: 378, h: z - a }; });
  const BTN = { x: 726, y: 562, w: 258, h: 48 }, CARD = { x: 700, y: 150, w: 310, h: 490 }, PANEL = { x: 200, y: 140, w: 490, h: 510 };
  const inRect = (p, r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
  const open = () => typeof battle !== 'undefined' && battle && battle.menu && battle.menu.sub && READY();
  const oldRects = skillRects;
  skillRects = function () { if (!open()) return oldRects.apply(this, arguments); sync(); return rowsVis(); };
  const TARGET = { 单体: '敌方单体', 群攻: '敌方全体', 控制: '敌方单体', 必杀: '敌方全体', 减伤: '我方全队', 加攻: '我方全队', 回灵: '我方全队', 护盾: '我方全队', 加速: '我方全队', 回血: '我方', 解控: '我方全队', 狂攻: '自身', 增攻: '自身' };
  const POWER = { dianxing: 175, xingluo2: 200, xingyun: 240, tanlang: 200, jueying: 460, duopo: 400, shaxing: 270, yunlei: 150, bingfeng: 80, shenfa: 120, tianshu: 125 };
  const TAGIMG = t => /群攻|必杀/.test(t) ? 'tag_group' : /单体/.test(t) ? 'tag_attack' : /控制/.test(t) ? 'tag_control' : 'tag_support';
  function info(s) { const d = s.desc || '', tg = s.tag || '', m = d.match(/(\d+)\s*%/); const enemy = /单体|群攻|控制|必杀/.test(tg) || /敌/.test(d);
    return { enemy, type: enemy ? '攻击' : '辅助', target: TARGET[tg] || (/全体/.test(d) ? '敌方全体' : /全队/.test(d) ? '我方全队' : '单体'),
      power: POWER[s.k] ? POWER[s.k] + '%' : m ? (enemy ? '' : '+') + m[1] + '%' : '—', cost: s.costLabel || (s.cost ? s.cost + '灵力' : '无消耗') }; }
  function icon(s, x, y, en) { D('skill_icon_frame', x, y, 64, 64); const uk = window.UI_ICONS && UI_ICONS.key(s.k);
    ctx.save(); if (!en) ctx.globalAlpha *= .55; if (uk && UI_ICONS.has(uk)) UI_ICONS.draw(uk, x + 32, y + 32, 22); else D(s.k === 'ult' ? 'icon_secret_normal' : 'icon_spell_normal', x + 8, y + 8, 48, 48); ctx.restore(); }
  function drawList(orig, args) {
    const b = battle, L = b.menu.sub; sync(); const P = b.P || {};
    const secret = !!window.__R79D_SECRET || L.some(s => s.k === 'ult');
    ctx.save(); ctx.fillStyle = 'rgba(4,10,16,.30)'; ctx.fillRect(0, 0, W, H); XF();
    D('sword_axis', 200, 140, 78, 500); D('list_header', 258, 150, 400, 70);
    txt('〈 返回', 278, 170, 72, 25, 21); txt(secret ? '秘传' : '仙术', 377, 159, 140, 46, 39, 'center');
    txt(secret ? '怒气 ' + Math.floor(P.rage || 0) : '灵力 ' + Math.floor(P.mp || 0), 553, 172, 86, 23, 20, 'right');
    ctx.save(); ctx.beginPath(); ctx.rect(VX - 6, VY, VW + 12, VH); ctx.clip();
    L.forEach((s, i) => { const y = rY(i); if (y + 78 < VY || y > VY + VH) return; const en = !s.disabled, col = en ? INK : DIS2;
      D(!en ? 'list_row_disabled' : i === SC.sel ? 'list_row_selected' : 'list_row_normal', VX, y, 400, 78);
      icon(s, 282, y + 6, en);
      txt((s.name || '').replace(/^(破军剑意|贪狼剑意|破军剑阵)·/, ''), 353, y + 6, 218, 32, 26, 'left', col);
      { const d = (s.desc || ''), p = d.split(/[：:]/), sh = s.short || ((p.length > 1 && p[1].length >= 4 ? p[1] : p[0]).split(/[，。；]/)[0]); txt(sh ? sh + '。' : '', 353, y + 39, 216, 25, 18, 'left', col); }
      const cost = s.costLabel ? s.costLabel.replace('怒气 ', '怒') : s.cost != null ? s.cost + '灵' : '';
      if (cost) { D('cost_plate', 576, y + 8, 58, 24); txt(cost, 579, y + 9, 52, 22, 19, 'center', col); }
      if (s.tag) { D(TAGIMG(s.tag), 574, y + 43, 62, 24); txt(s.tag, 578, y + 44, 54, 22, 17, 'center', col); } });
    ctx.restore();
    // 滚动条
    D('scroll_track', 664, 239, 18, 374); D('scroll_up', 664, 220, 18, 18); D('scroll_down', 664, 614, 18, 18);
    const mo = maxOff(); D('scroll_thumb_sword', 663, 250 + (mo > 0 ? SC.y / mo : 0) * 282, 20, 76);
    D('list_footer', 258, 624, 400, 22); txt((mo > 0 ? '上下拖动 · ' : '') + '共' + L.length + '式', 355, 625, 206, 22, 17, 'center', '#eadfbc');
    // 说明卡
    const cur = L[SC.sel];
    if (cur) { const f = info(cur); D('detail_card', 700, 150, 310, 490); icon(cur, 744, 196, !cur.disabled);
      const nm = cur.name || '', parts = nm.length > 5 && nm.includes('·') ? [nm.slice(0, nm.indexOf('·')), nm.slice(nm.indexOf('·'))] : [nm];
      if (parts.length > 1) { txt(parts[0], 836, 196, 153, 33, 27); txt(parts[1], 836, 225, 153, 33, 27); } else txt(nm, 836, 212, 153, 33, 27);
      txt('类型 ' + f.type, 721, 270, 112, 24, 18); txt('目标 ' + f.target, 844, 270, 143, 24, 18);
      txt(f.enemy ? '威力' : '效果', 733, 324, 100, 22, 19, 'center'); txt(f.power, 721, 347, 125, 35, 29, 'center');
      txt('消耗', 871, 324, 100, 22, 19, 'center'); txt(f.cost, 860, 347, 126, 35, 28, 'center');
      txt('招式说明', 725, 414, 240, 25, 23);
      let ls = wrap(cur.desc || '', 257, 22), size = 22, lh = 26; if (ls.length > 4) { size = 19; lh = 22; ls = wrap(cur.desc || '', 257, 19).slice(0, 5); }
      ls.forEach((l, k) => txt(l, 726, 444 + k * lh, 257, lh, size));
      ctx.save(); if (cur.disabled) ctx.globalAlpha = .55; D(SC.press && !cur.disabled ? 'action_pressed' : 'action_normal', 722, 554, 266, 64); txt('施展', 748, 566, 213, 40, 38, 'center'); ctx.restore();
      txt(cur.disabled ? (cur.why || '现在用不了') : f.enemy ? '施展后选择目标' : '施展后立即生效', 734, 616, 238, 20, 16, 'center', cur.disabled ? '#7a2a1a' : INK); }
    ctx.restore();
  }
  function cast(orig, i) { const L = battle.menu.sub, s = L[i]; if (!s) return; if (s.disabled) { toast(s.why || '现在用不了'); return; }
    const top = rY(i); if (top < VY || top + 78 > VY + VH) SC.y = Math.max(0, Math.min(maxOff(), i * PITCH - PITCH)); const r = rowsVis()[i]; SC.list = null;
    return orig({ x: r.x + 10, y: r.y + r.h / 2 }); }
  function listTap(orig, tap) {
    sync(); tap = U(tap);
    if (inRect(tap, BTN)) { try { playSnd('ui_click'); } catch (e) {} return cast(orig, SC.sel); }
    if (inRect(tap, CARD)) return;
    if (inRect(tap, { x: 270, y: 160, w: 90, h: 44 })) { SC.list = null; return orig({ x: -50, y: -50 }); }   // 〈 返回
    if (inRect(tap, { x: 658, y: 212, w: 30, h: 32 })) { SC.y = Math.max(0, SC.y - PITCH); return; }
    if (inRect(tap, { x: 658, y: 606, w: 30, h: 32 })) { SC.y = Math.min(maxOff(), SC.y + PITCH); return; }
    const rs = rowsVis(), i = rs.findIndex(r => inRect(tap, r));
    if (i >= 0) { if (i !== SC.sel) { SC.sel = i; try { playSnd('ui_click'); } catch (e) {} return; } return cast(orig, i); }
    if (inRect(tap, PANEL)) return;
    SC.list = null; return orig({ x: -50, y: -50 });
  }
  const inView = p => p.x > VX && p.x < VX + VW && p.y > VY && p.y < VY + VH;
  cv.addEventListener('pointerdown', e => { if (!open()) return; const raw = toLogical(e), p = U(raw); if (inRect(p, BTN)) SC.press = true; if (!inView(p)) return; SC.drag = { y0: p.y, s0: SC.y, moved: false, p: raw }; input.tapped = null; });
  cv.addEventListener('pointermove', e => { if (!SC.drag) return; const p = U(toLogical(e)), dy = p.y - SC.drag.y0; if (Math.abs(dy) > 8) SC.drag.moved = true; if (SC.drag.moved) SC.y = Math.max(0, Math.min(maxOff(), SC.drag.s0 - dy)); });
  window.addEventListener('pointerup', () => { SC.press = false; const d = SC.drag; SC.drag = null; if (d && !d.moved && open()) input.tapped = d.p; });
  cv.addEventListener('wheel', e => { if (!open()) return; SC.y = Math.max(0, Math.min(maxOff(), SC.y + e.deltaY * .6)); e.preventDefault(); }, { passive: false });
  window.R86 = { IM, D, txt, READY };
})();
