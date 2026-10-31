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
  // 菜单字体：霞鹜文楷 Medium（OFL 开源，按游戏里用到的字裁剪，约 0.7MB）——所有设备显示一致，不再依赖系统有没有楷体
  // 作者 10-31 最终：照 Codex 设计图的字——标题粗宋（思源宋体 Heavy），正文宋体（思源宋体 Medium），OFL，按游戏用字裁剪
  // 作者 10-31 定稿（方案 8）：标题阿里妈妈东方大楷（免费商用），正文霞鹜文楷 Bold（OFL）；都按游戏用字裁剪
  for (const [n, b, l] of [['GuxingDF', '30bf9059bcf6fe35c4476899217bee54', 'dongfangdakai'], ['GuxingWKB', '284989e9b6a275e7024c7f042d121f07', 'wenkai_bd']]) { try { const f0 = new FontFace(n, `url(${LOC ? 'fonts/' + l + '.woff' : '/_blob/' + b})`); f0.load().then(f => document.fonts.add(f)).catch(() => {}); } catch (e) {} }
  const FONT_T = '"GuxingDF","GuxingWKB","GuxingKai","Kaiti SC",serif', FONT_B = '"GuxingWKB","GuxingKai","Kaiti SC",serif';
  // 作者 10-31 选定：霞鹜臻楷（OFL，裁剪）为主字体；臻楷缺的字和数字/字母落到文楷
  try { const ff = new FontFace('GuxingKai', `url(${LOC ? 'fonts/wenkai_md.woff' : '/_blob/96b50fbe58c3c7f573008e5f19c47990'})`); ff.load().then(f => document.fonts.add(f)).catch(() => {}); } catch (e) {}
  const FONTN = '"GuxingZK","GuxingKai","Kaiti SC","STKaiti","KaiTi","BiauKai","Ma Shan Zheng",serif' /* 作者 10-31：毛笔字太丑 → 端正的粗楷体 */, INK = '#1c2a30', DIS = '#5e6367', DIS2 = '#697276';
  // 作者 10-31：菜单太大 → 整体缩到 0.8，以 (620,395) 为中心；画面整体变换，点击坐标反算回原布局
  const K = .8, AX = 620, AY = 395, U = p => ({ x: AX + (p.x - AX) / K, y: AY + (p.y - AY) / K }), XF = () => { ctx.translate(AX, AY); ctx.scale(K, K); ctx.translate(-AX, -AY); };
  window.R86_SCALE = { K, AX, AY, U };
  const D = (k, x, y, w, h) => { const im = IM[k]; if (im) ctx.drawImage(im, x, y, w, h); };
  function txt(s, x, y, w, h, size, align = 'left', col = INK) { if (s == null || s === '') return;
    ctx.save(); let f = size; const TT = size >= 26, FN = (TT && window.R86_FONT_T) || window.R86_FONT || (TT ? FONT_T : FONT_B), FW = (TT && window.R86_FWT) || window.R86_FW || 400; if (col === INK && window.R86_INK) col = TT && window.R86_INKT ? window.R86_INKT : window.R86_INK; ctx.font = `${FW} ${f}px ${FN}`; while (f > 10 && ctx.measureText(s).width > w) { f -= 1; ctx.font = `${FW} ${f}px ${FN}`; }
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; const tx = align === 'center' ? x + w / 2 : align === 'right' ? x + w : x;
    ctx.fillText(s, tx, y + h / 2 + 1); const sw = window.R86_SW || 0; if (sw > 0) { ctx.lineWidth = sw; ctx.lineJoin = "round"; ctx.strokeStyle = col; ctx.strokeText(s, tx, y + h / 2 + 1); } ctx.restore(); }
  function wrap(s, w, size) { ctx.save(); ctx.font = `${window.R86_FW || 400} ${size}px ${window.R86_FONT || FONT_B}`; const out = []; let ln = '';
    for (const ch of s) { if (ctx.measureText(ln + ch).width > w && !'，。、；：！？）」'.includes(ch)) { out.push(ln); ln = ch; } else ln += ch; } if (ln) out.push(ln); ctx.restore(); return out; }

  // ================= 主菜单 =================
  const CMD = [['mi', 'secret', '秘传'], ['skill', 'spell', '仙术'], ['atk', 'attack', '攻击'], ['def', 'defend', '防御'], ['item', 'item', '道具'], ['flee', 'escape', '逃跑']];
  const rowY = i => 170 + i * 76, HIT = i => ({ x: 488, y: rowY(i) + 6, w: 346, h: 66 });
  let shownAt = 0, lastP = null, hoverI = -1;
  // ================= 主菜单 · R87 圆形剑印（作者 10-31 选定；Claude 从 Codex 设计原图抠图分层）=================
  // 六枚白玉圆章绕中心剑印；选中的圆章放大并亮起青白灵光（光环缓慢旋转）；打开时圆章从剑印中心依次飞出；
  // 圆盘下方一行楷书小字显示当前圆章的说明（灵力 / 怒气 / 不可用原因）。字都烘在圆章上，只有说明行实时写。
  const R7B = {"base": "f5e4da231387587e9bcf5d59e8e66e01", "glow_add": "db6bc47e9a65649fd0118601e542733b", "seal_atk": "8215c379d4ecc3186b3a0d212d74d87a", "seal_atk_dis": "9f9c345bbbc3ff3f1107790f17e0b35f", "seal_def": "36b4c473362b3904ba2020fcca04d2ae", "seal_def_dis": "097eb928084bd98d7d4f6667e843f02f", "seal_flee": "4d590c592ddb7071acdbaba7d0928443", "seal_flee_dis": "40bd94a6b0a6ce9b477446e11a21f6da", "seal_item": "e47c322761fb0de5d43c238ebeea1ce0", "seal_item_dis": "2eb8132c0db36a4d23f2b37b37edbe9f", "seal_mi": "63d941e5418ab8d1d4128cb051584737", "seal_mi_dis": "c2e332e327c995cebccee2a666004730", "seal_xian": "51848f8efb577ccc930bee1b2b28416c", "seal_xian_dis": "339d9bf21280a59fc9046e60f3878c2d", "seal_xian_sel": "b675486d065f19fa3ab45cbb2c3ce32f"};
  const I7 = {}; let n7 = 0; for (const k in R7B) { const im = new Image(); im.onload = () => { I7[k] = im; n7++; }; im.src = LOC ? 'r87/' + k + '.webp' : '/_blob/' + R7B[k]; }
  const R7OK = () => n7 >= Object.keys(R7B).length;
  const DSC = .7, DCX = 632, DCY = 372;   // 抠图像素 → 游戏像素；圆盘中心
  const RING = [['mi', 'mi', 1, -150], ['skill', 'xian', 126, -63], ['atk', 'atk', 125, 75], ['item', 'item', 1, 147], ['def', 'def', -124, 74], ['flee', 'flee', -128, -63]];
  const SPOS = i => ({ x: DCX + RING[i][2] * DSC, y: DCY + RING[i][3] * DSC });
  const SR = 53 * DSC;
  const DEF_NOTE = { atk: '普通攻击', def: '减伤·回灵', flee: '脱离战斗', item: '使用丹药', mi: '秘传绝技', skill: '施展仙术' };
  let selI = -1, selAt = 0;
  const ease = q => 1 - Math.pow(1 - Math.max(0, Math.min(1, q)), 3), back = q => { q = Math.max(0, Math.min(1, q)); const c = 1.6; return 1 + (c + 1) * Math.pow(q - 1, 3) + c * Math.pow(q - 1, 2); };
  const I7D = (k, cx, cy, sc, rot = 0, a = 1, comp) => { const im = I7[k]; if (!im) return; ctx.save(); ctx.globalAlpha *= a; if (comp) ctx.globalCompositeOperation = comp; ctx.translate(cx, cy); if (rot) ctx.rotate(rot); const w = im.width * sc, h = im.height * sc; ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); };
  function noteLine(s, y, a) { if (!s) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `400 22px ${FONT_B}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(8,16,22,.85)'; ctx.strokeText(s, DCX, y); ctx.fillStyle = '#f4ecd2'; ctx.fillText(s, DCX, y); ctx.restore(); }
  drawBattleMenu = (orig => function () {
    const b = battle; if (!b || !b.menu || !READY() || !R7OK()) return orig.apply(this, arguments);
    if (b.menu.sub) return drawList.call(this, orig, arguments);
    const now = performance.now() / 1000; if (lastP !== b.P) { lastP = b.P; shownAt = now; }
    const L = BM2.CMDS, hx = input.x, hy = input.y, t = now - shownAt; hoverI = -1;
    const st = RING.map(r => { const it = L.find(x => x.k === r[0]) || { k: r[0] }; return BM2.state(it); });
    RING.forEach((r, i) => { const p = SPOS(i); if (st[i].on && Math.hypot(hx - p.x, hy - p.y) < SR + 6) hoverI = i; });
    let si = hoverI >= 0 ? hoverI : st.findIndex(x => x.on && x.glow); if (si < 0) si = selI >= 0 && st[selI] && st[selI].on ? selI : 1;
    if (si !== selI) { selI = si; selAt = now; }
    ctx.save();
    const kb = ease(t / .28); I7D('base', DCX, DCY, DSC * (.86 + .14 * kb), (1 - kb) * -.25, kb);
    RING.forEach((r, i) => { const q = back((t - .05 - i * .035) / .32), p = SPOS(i), x = DCX + (p.x - DCX) * q, y = DCY + (p.y - DCY) * q, sel = i === selI && st[i].on, ks = sel ? 1 + .07 * ease((now - selAt) / .16) : 1;
      if (q <= 0) return; const a = Math.min(1, q * 1.4);
      if (sel) { I7D('glow_add', x, y, DSC * 1.05 * ks, now * .5, a * (.75 + .25 * Math.sin(now * 3.2)), 'lighter'); I7D('glow_add', x, y, DSC * .95 * ks, -now * .35, a * .45, 'lighter'); }
      const k = 'seal_' + r[1] + (!st[i].on ? '_dis' : sel && r[1] === 'xian' ? '_sel' : '');
      I7D(k, x, y, DSC * ks * (.6 + .4 * Math.min(1, q)), 0, a); });
    const cur = st[selI] || {}; noteLine(cur.on ? (cur.note || DEF_NOTE[RING[selI][0]]) : (cur.note || '此时不可用'), DCY + 196, ease((now - selAt) / .2) * kb);
    ctx.restore();
  })(drawBattleMenu);
  handleMenuTap = (orig => function (tap) {
    const b = battle; if (!b || !b.menu || !READY()) return orig.apply(this, arguments);
    if (b.menu.sub) return listTap.call(this, orig, tap);
    if (!R7OK()) return orig.apply(this, arguments);
    const LY = BM2.layout();
    for (let i = 0; i < RING.length; i++) { const p = SPOS(i); if (Math.hypot(tap.x - p.x, tap.y - p.y) < SR + 6) { const r = LY.find(r => r.k === RING[i][0]); window.__R79D_SECRET = RING[i][0] === 'mi'; if (r) return orig.call(this, { x: r.x + r.w / 2, y: r.y + r.h / 2 }); } }
  })(handleMenuTap);

  // ================= 列表 + 说明卡 =================
  const VX = 258, VY = 228, VW = 400, VH = 390, PITCH = 78;
  const SC = { y: 0, list: null, sel: 0, drag: null, press: false };
  const maxOff = () => Math.max(0, battle.menu.sub.length * PITCH - VH);
  const sync = () => { const L = battle.menu.sub; if (SC.list !== L) { SC.list = L; SC.y = 0; SC.sel = Math.max(0, L.findIndex(s => !s.disabled)); } SC.y = Math.max(0, Math.min(maxOff(), SC.y)); };
  const rY = i => VY + i * PITCH - SC.y;
  const rowsVis = () => battle.menu.sub.map((s, i) => { const y = rY(i), a = Math.max(y, VY), z = Math.min(y + 78, VY + VH); return z - a < 26 ? { x: -9999, y: -9999, w: 0, h: 0 } : { x: VX + 14, y: a, w: 378, h: z - a }; });
  const BACKR = { x: 400, y: 652, w: 116, h: 52 }, BTN = { x: 726, y: 562, w: 258, h: 48 }, CARD = { x: 700, y: 150, w: 310, h: 490 }, PANEL = { x: 200, y: 140, w: 490, h: 510 };
  const inRect = (p, r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
  const open = () => typeof battle !== 'undefined' && battle && battle.menu && battle.menu.sub && READY();
  const oldRects = skillRects;
  let FORCE = -1;
  skillRects = function () { if (!open()) return oldRects.apply(this, arguments); if (FORCE >= 0) return battle.menu.sub.map((s, i) => i === FORCE ? { x: -5100, y: -5100, w: 200, h: 200 } : { x: -9999, y: -9999, w: 0, h: 0 }); sync(); return rowsVis(); };
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
    txt(secret ? '秘传' : '仙术', 377, 159, 140, 46, 39, 'center');
    txt(secret ? '怒气' : '灵力', 548, 172, 44, 23, 20, 'left'); txt(String(Math.floor(secret ? (P.rage || 0) : (P.mp || 0))), 590, 168, 52, 30, 25, 'right', secret ? '#a8321e' : '#1f5fd0');
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
    // 作者 11-01：返回键放到菜单下面
    { const pb = SC.backPress; D(pb ? 'back_pressed' : 'back_normal', BACKR.x, BACKR.y, BACKR.w, BACKR.h); txt('返回', BACKR.x, BACKR.y + 2, BACKR.w, BACKR.h - 4, 24, 'center'); }
    D('list_footer', 258, 624, 400, 22); txt((mo > 0 ? '上下拖动 · ' : '') + '共' + L.length + '式', 355, 625, 206, 22, 17, 'center', '#eadfbc');
    // 说明卡
    const cur = L[SC.sel];
    if (cur) { const f = info(cur); D('detail_card', 700, 150, 310, 490); icon(cur, 744, 196, !cur.disabled);
      const nm = cur.name || '', parts = nm.length > 5 && nm.includes('·') ? [nm.slice(0, nm.indexOf('·')), nm.slice(nm.indexOf('·'))] : [nm];
      if (parts.length > 1) { txt(parts[0], 836, 196, 153, 33, 27); txt(parts[1], 836, 225, 153, 33, 27); } else txt(nm, 836, 212, 153, 33, 27);
      txt('类型', 721, 270, 40, 24, 18, 'left', '#8a3a22'); txt(f.type, 761, 270, 72, 24, 18); txt('目标', 844, 270, 40, 24, 18, 'left', '#8a3a22'); txt(f.target, 884, 270, 103, 24, 18);
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
    // 作者 11-01：列表滚动后点哪招放哪招——把这一招的点击框钉死传下去，不再按滚动前的坐标反查（以前 SC.list=null 会把滚动清零，点到下面几招就放成别的招或没反应）
    FORCE = i; try { return orig({ x: -5000, y: -5000 }); } finally { FORCE = -1; SC.list = null; } }
  function listTap(orig, tap) {
    sync(); tap = U(tap);
    if (inRect(tap, BTN)) { try { playSnd('ui_click'); } catch (e) {} return cast(orig, SC.sel); }
    if (inRect(tap, CARD)) return;
    if (inRect(tap, BACKR)) { try { playSnd('ui_cancel'); } catch (e) {} SC.list = null; return orig({ x: -50, y: -50 }); }   // 返回（菜单下面）
    if (inRect(tap, { x: 658, y: 212, w: 30, h: 32 })) { SC.y = Math.max(0, SC.y - PITCH); return; }
    if (inRect(tap, { x: 658, y: 606, w: 30, h: 32 })) { SC.y = Math.min(maxOff(), SC.y + PITCH); return; }
    const rs = rowsVis(), i = rs.findIndex(r => inRect(tap, r));
    if (i >= 0) { if (i !== SC.sel) { SC.sel = i; try { playSnd('ui_click'); } catch (e) {} return; } return cast(orig, i); }
    if (inRect(tap, PANEL)) return;
    SC.list = null; return orig({ x: -50, y: -50 });
  }
  const inView = p => p.x > VX && p.x < VX + VW && p.y > VY && p.y < VY + VH;
  cv.addEventListener('pointerdown', e => { if (!open()) return; const raw = toLogical(e), p = U(raw); if (inRect(p, BTN)) SC.press = true; if (inRect(p, BACKR)) SC.backPress = true; if (!inView(p)) return; SC.drag = { y0: p.y, s0: SC.y, moved: false, p: raw }; input.tapped = null; });
  cv.addEventListener('pointermove', e => { if (!SC.drag) return; const p = U(toLogical(e)), dy = p.y - SC.drag.y0; if (Math.abs(dy) > 8) SC.drag.moved = true; if (SC.drag.moved) SC.y = Math.max(0, Math.min(maxOff(), SC.drag.s0 - dy)); });
  window.addEventListener('pointerup', () => { SC.press = false; SC.backPress = false; const d = SC.drag; SC.drag = null; if (d && !d.moved && open()) input.tapped = d.p; });
  cv.addEventListener('wheel', e => { if (!open()) return; SC.y = Math.max(0, Math.min(maxOff(), SC.y + e.deltaY * .6)); e.preventDefault(); }, { passive: false });
  window.R86 = { IM, D, txt, READY };
})();
