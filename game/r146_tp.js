// ================= R146 · 松伯的传送玉符：地图点选式（作者 11-07 选定 Codex 第五轮「①素白玉」，Codex R146 切图）=================
// 入口不变：青竹小院 / 管事房找松伯 →「传送到去过的地方」。
// 左栏五个地区；中间是该地区的手绘小地图，点上面的传送点：去过的亮玉菱形可传，没去过的上锁；
// 右栏是选中地点的小插画、介绍、解锁状态，点「传送」走。切图上只有标题「传送玉符」是画好的，其余文字由代码写。
// 版面位置、锚点全照 Codex 的 manifest（1280×720 逻辑画布，切图 @2x）；76 张小图合成 4 张图集（线上版发布文件数有上限）。
(function () {
  if (typeof choose !== 'function' || typeof tileSetMap !== 'function') return;
  const F = () => S.flags || (S.flags = {});
  const visited = () => F().visited || (F().visited = {});

  // ---------------- 地区与地点（map_px 来自 Codex 各地区 points.json：相对地图左上角的 @2x 像素）----------------
  // tp:false = 地图上只当地名，不能直接传送（剧情据点 / 首领处，和旧版传送列表的排除规则一致）
  const D = {
    qingzhu_court: ['少爷自小长大的院子。', '松伯他们都在这里。'],
    qingzhu_upper_pavilion: ['青竹小院后的观云高亭。', '云海翻涌，群峰尽收眼底。'],
    tj_hall: ['天剑宗主殿，群峰拱卫。', '宗门议事与授业之所。'],
    tj_front: ['弟子晨昏练剑之地。', '剑鸣终日不绝。'],
    tj_scripture: ['天剑宗典籍收藏之地。', '外院可借阅寻常功法。'],
    tj_houshan: ['后山崖顶，云深林密。', '寻常弟子少有人来。'],
    tj_market: ['仙市琳琅，丹符器物俱全。', '典籍阁也设在这里。'],
    tj_shanmen: ['天剑宗正门与送别台。', '由此下山，便入红尘。'],
    qy_town: ['山下最热闹的小镇。', '客栈、药铺、铁匠铺都在。'],
    lin_court: ['青阳镇林家的宅邸。', '庭院曲水，花木扶疏。'],
    lin_forest: ['云霄山脉外的密林。', '林中常有妖兽出没。'],
    tj_xiashan: ['天剑山下的松林小道。', '上山下山的必经之路。'],
    hf_valley: ['黑风谷的入口，阴风阵阵。', '谷中深处盘踞着匪寨。'],
    hf_camp: ['黑风寨匪巢，盘踞谷中。', '此地无法直接传送。'],
    xt_city: ['玄天城南城大街。', '车马如流，繁华无双。'],
    xt_manor: ['玄天城城主的府邸。', '门禁森严，气象恢宏。'],
    xt_auction: ['玄天城最大的拍卖场。', '奇珍异宝，价高者得。'],
    xt_wanbao: ['城里的老字号宝楼。', '丹药法器一应俱全。'],
    ly_ridge: ['落云岭外岭，松溪潺潺。', '山势渐起，雾气渐浓。'],
    ly_midnorth: ['落云岭腹地的乱林。', '林深路杂，容易迷路。'],
    ly_valley: ['雾锁灵渊，深不可测。', '此地无法直接传送。'],
  };
  const NO_TP = { hf_camp: 1, ly_valley: 1 };
  const PTS = {"tianjian": [["qingzhu_court", "青竹小院", [170, 614]], ["qingzhu_upper_pavilion", "云海大亭", [180, 178]], ["tj_hall", "天剑大殿", [520, 328]], ["tj_front", "演武广场", [520, 526]], ["tj_scripture", "藏经阁", [890, 388]], ["tj_houshan", "天剑后山", [810, 180]], ["tj_market", "天剑宗集市", [888, 570]], ["tj_shanmen", "天剑山门", [520, 770]]], "qingyang": [["qy_town", "青阳镇", [562, 488]], ["lin_court", "林府", [560, 262]], ["lin_forest", "山外树林", [758, 698]], ["tj_xiashan", "松风林道", [188, 696]]], "heifeng": [["hf_valley", "黑风谷口", [302, 580]], ["hf_camp", "黑风寨", [680, 306]]], "xuantian": [["xt_city", "南城", [538, 778]], ["xt_manor", "城主府", [536, 220]], ["xt_auction", "玄元拍卖场", [538, 362]], ["xt_wanbao", "万宝楼", [756, 208]]], "luoyun": [["ly_ridge", "松溪外岭", [230, 706]], ["ly_midnorth", "中北乱林", [492, 474]], ["ly_valley", "落云谷", [868, 166]]]};
  const RNAME = { tianjian: '天剑宗', qingyang: '青阳镇', heifeng: '黑风谷', xuantian: '玄天城', luoyun: '落云岭' };
  const REGIONS = ['tianjian', 'qingyang', 'heifeng', 'xuantian', 'luoyun'].map(key => ({ key, name: RNAME[key],
    nodes: PTS[key].map(([id, name, px]) => ({ id, name, x: 316 + px[0] / 2, y: 168 + px[1] / 2, d: D[id] || ['', ''], tp: !NO_TP[id] })) }));
  const NODE = {}; REGIONS.forEach(R => R.nodes.forEach(n => { n.reg = R; NODE[n.id] = n; }));
  // 当前所在：松伯在青竹小院和管事房，管事房也算青竹小院；林府里的几间屋也算林府
  const hereId = () => { const m = world.mapName; return m === 'qingzhu_steward_room' ? 'qingzhu_court' : /^lin_(manor|guest|study|yi_room|service|teahouse|servants)/.test(m || '') ? 'lin_court' : m; };
  const canTp = n => n.tp !== false && !!TMAPS[n.id] && !!visited()[n.id];
  const regOpen = R => R.nodes.some(n => visited()[n.id]);

  // 落点：和旧版传送列表同一套（地图自带 start / arrive，否则取场景 spawn）
  const spawnOf = id => { const d = TMAPS[id]; if (!d) return null; if (d.start) return d.start; if (d.arrive) { const v = Object.values(d.arrive)[0]; if (v) return v; }
    const B = typeof CXB2 !== 'undefined' && CXB2[id]; if (B && typeof atIn === 'function') return atIn(id, ...(B.spawn || [B.w / 2, B.h * .7])); return null; };

  // ---------------- 图集 ----------------
  const RECT = {"panel":["ui",0,0,2120,1182],"rim":["ui",0,1184,536,300],"ring_2":["ui",538,1184,192,160],"ring_8":["ui",732,1184,192,160],"ring_9":["ui",926,1184,192,160],"ring_6":["ui",1120,1184,192,160],"ring_0":["ui",1314,1184,192,160],"ring_5":["ui",1508,1184,192,160],"ring_1":["ui",1702,1184,192,160],"ring_10":["ui",1896,1184,192,160],"ring_4":["ui",2090,1184,192,160],"ring_3":["ui",0,1486,192,160],"ring_11":["ui",194,1486,192,160],"ring_7":["ui",388,1486,192,160],"go":["ui",582,1486,520,124],"go_off":["ui",1104,1486,520,124],"go_p":["ui",1626,1486,520,124],"tab_lock":["ui",0,1648,336,104],"tab_off":["ui",338,1648,336,104],"tab_on":["ui",676,1648,336,104],"close":["ui",1014,1648,84,84],"close_p":["ui",1100,1648,84,84],"gem_3":["ui",1186,1648,68,68],"pin":["ui",1256,1648,48,68],"gem_7":["ui",1306,1648,68,68],"gem_1":["ui",1376,1648,68,68],"gem_5":["ui",1446,1648,68,68],"gem_2":["ui",1516,1648,68,68],"gem_4":["ui",1586,1648,68,68],"gem_6":["ui",1656,1648,68,68],"gem_0":["ui",1726,1648,68,68],"tag_on":["ui",1796,1648,180,64],"tag_off":["ui",1978,1648,180,64],"callout":["ui",2160,1648,160,58],"plate_lock":["ui",0,1754,188,50],"plate_on":["ui",190,1754,188,50],"plate":["ui",380,1754,188,50],"lock":["ui",570,1754,44,48],"flash_0":["fx",0,0,384,528],"flash_1":["fx",386,0,384,528],"flash_2":["fx",772,0,384,528],"flash_3":["fx",1158,0,384,528],"flash_4":["fx",1544,0,384,528],"flash_5":["fx",1930,0,384,528],"flash_6":["fx",0,530,384,528],"flash_7":["fx",386,530,384,528],"flash_8":["fx",772,530,384,528],"flash_9":["fx",1158,530,384,528],"flash_10":["fx",1544,530,384,528],"flash_11":["fx",1930,530,384,528],"thumb_hf_camp":["thumbs",0,0,524,288],"thumb_hf_valley":["thumbs",526,0,524,288],"thumb_lin_court":["thumbs",1052,0,524,288],"thumb_lin_forest":["thumbs",1578,0,524,288],"thumb_ly_midnorth":["thumbs",0,290,524,288],"thumb_ly_ridge":["thumbs",526,290,524,288],"thumb_ly_valley":["thumbs",1052,290,524,288],"thumb_qingzhu_court":["thumbs",1578,290,524,288],"thumb_qingzhu_upper_pavilion":["thumbs",0,580,524,288],"thumb_qy_town":["thumbs",526,580,524,288],"thumb_tj_front":["thumbs",1052,580,524,288],"thumb_tj_hall":["thumbs",1578,580,524,288],"thumb_tj_houshan":["thumbs",0,870,524,288],"thumb_tj_market":["thumbs",526,870,524,288],"thumb_tj_scripture":["thumbs",1052,870,524,288],"thumb_tj_shanmen":["thumbs",1578,870,524,288],"thumb_tj_xiashan":["thumbs",0,1160,524,288],"thumb_xt_auction":["thumbs",526,1160,524,288],"thumb_xt_city":["thumbs",1052,1160,524,288],"thumb_xt_manor":["thumbs",1578,1160,524,288],"thumb_xt_wanbao":["thumbs",0,1450,524,288],"map_heifeng":["maps",0,0,1096,880],"map_luoyun":["maps",1098,0,1096,880],"map_qingyang":["maps",0,882,1096,880],"map_tianjian":["maps",1098,882,1096,880],"map_xuantian":["maps",0,1764,1096,880]};
  const ATL = {}; let loaded = 0;
  const atl = a => { if (!ATL[a]) { const i = new Image(); i.onload = () => loaded++; i.src = 'r146/r146_' + a + '.webp'; ATL[a] = i; } const i = ATL[a]; return i.complete && i.naturalWidth ? i : null; };
  const has = k => !!(RECT[k] && atl(RECT[k][0]));
  // 整张画（逻辑尺寸 = @2x 像素 / 2）
  function spr(k, x, y, w, h) { const r = RECT[k]; if (!r) return false; const A = atl(r[0]); if (!A) return false; ctx.drawImage(A, r[1], r[2], r[3], r[4], x, y, w == null ? r[3] / 2 : w, h == null ? r[4] / 2 : h); return true; }
  // 横向三段拉伸（L、R 是 @2x 像素）
  function spr3(k, x, y, w, h, L, Rr) { const r = RECT[k]; if (!r) return false; const A = atl(r[0]); if (!A) return false; const l = L / 2, rr = Rr / 2;
    ctx.drawImage(A, r[1], r[2], L, r[4], x, y, l, h); ctx.drawImage(A, r[1] + L, r[2], r[3] - L - Rr, r[4], x + l, y, w - l - rr, h); ctx.drawImage(A, r[1] + r[3] - Rr, r[2], Rr, r[4], x + w - rr, y, rr, h); return true; }

  // ---------------- 版面（Codex manifest.layout）----------------
  const P = { x: 110, y: 64, w: 1060, h: 591 };
  const CLOSE = { x: 1111, y: 76, w: 42, h: 42 };
  const TAB = i => ({ x: 127, y: 185 + i * 59, w: 168, h: 52 });
  const MAP = { x: 316, y: 168, w: 548, h: 440 };
  const THUMB = { x: 889, y: 190, w: 262, h: 144 }, RIM = { x: 886, y: 187, w: 268, h: 150 };
  const TAG = { x: 975, y: 456, w: 90, h: 32 };
  const GO = { x: 890, y: 564, w: 260, h: 62 };
  const NODE_R = 26;

  const TF = typeof BRUSH === 'string' ? BRUSH : '"Ma Shan Zheng",serif';
  const NF = '"LXGW WenKai","ZCOOL XiaoWei",' + (typeof FONT === 'string' ? FONT : 'serif');
  const C = { ink: '#2b2a25', soft: '#7d7a70', jade: '#5f9e8c', jadeD: '#2f6a5c', jadeL: '#d8eee6', line: 'rgba(120,128,118,.35)', red: '#b8402f' };
  const LS = px => { try { ctx.letterSpacing = px; } catch (e) {} };

  let TP = null;

  function lockGlyph(x, y, s, col) { ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = s * .16; ctx.beginPath(); ctx.arc(x, y - s * .2, s * .28, Math.PI, 0); ctx.stroke(); roundRect(x - s * .4, y - s * .2, s * .8, s * .62, s * .12); ctx.fill(); ctx.restore(); }
  function txt(s, x, y, font, col, align, sp) { ctx.save(); ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; if (sp) LS(sp); ctx.fillText(s, x, y); ctx.restore(); }

  function panelBase() {
    if (spr('panel', P.x, P.y, P.w, P.h)) return;
    ctx.save(); ctx.fillStyle = '#f6f5f0'; roundRect(P.x, P.y, P.w, P.h, 14); ctx.fill(); ctx.strokeStyle = 'rgba(150,160,150,.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    txt('传送玉符', P.x + 120, P.y + 34, `46px ${TF}`, '#223c34', 'center', '4px');
  }
  function headings(R) {
    txt('地区', 134, 156, `600 21px ${NF}`, C.ink, 'left');
    txt('地点详情', 891, 154, `600 21px ${NF}`, C.ink, 'left');
    txt(R.name, 322, 153, `600 25px ${NF}`, C.ink, 'left');
    ctx.save(); ctx.font = `600 25px ${NF}`; const w = ctx.measureText(R.name).width; ctx.restore();
    txt('点击地图上的传送点', 322 + w + 22, 155, `15px ${NF}`, C.soft, 'left');
    const hn = NODE[hereId()];
    txt('当前所在', 136, 588, `15px ${NF}`, C.soft, 'left');
    txt(hn ? hn.name : (TMAPS[world.mapName] && TMAPS[world.mapName].title) || '', 136, 614, `600 22px ${NF}`, C.ink, 'left');
  }
  function closeBtn() {
    if (spr(TP.press === 'close' ? 'close_p' : 'close', CLOSE.x, CLOSE.y, CLOSE.w, CLOSE.h)) return;
    ctx.save(); ctx.strokeStyle = '#3b3a34'; ctx.lineWidth = 3; ctx.lineCap = 'round'; const cx = CLOSE.x + 21, cy = CLOSE.y + 21, s = 11; ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s); ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s); ctx.stroke(); ctx.restore();
  }
  function tabs() {
    REGIONS.forEach((R, i) => { const r = TAB(i), open = regOpen(R), on = TP.reg === i, k = !open ? 'tab_lock' : on ? 'tab_on' : 'tab_off';
      if (!spr(k, r.x, r.y, r.w, r.h)) { ctx.save(); ctx.fillStyle = on ? C.jadeL : '#efeee8'; roundRect(r.x, r.y + 3, r.w, r.h - 6, 6); ctx.fill(); ctx.restore(); if (!open) lockGlyph(r.x + 30, r.y + r.h / 2, 20, '#77756d'); }
      const cx = open ? r.x + r.w / 2 : r.x + 49 + (r.w - 49) / 2 - 6;
      txt(R.name, cx, r.y + r.h / 2 + 1, `${on ? 600 : 500} 23px ${NF}`, !open ? '#77756d' : on ? '#1f4d42' : C.ink, 'center', '2px'); });
  }
  function nodes(R, t) {
    if (!spr('map_' + R.key, MAP.x, MAP.y, MAP.w, MAP.h)) { ctx.save(); ctx.fillStyle = '#eef2ea'; roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 10); ctx.fill(); ctx.restore(); }
    const here = hereId(), sel = TP.sel && NODE[TP.sel];
    // 叠放顺序（Codex 接入说明）：选中光圈 → 玉符或锁 → 地名牌、定位针 → 字
    if (sel && sel.reg === R && !spr('ring_' + (Math.floor(t * 1000 / 90) % 12), sel.x - 48, sel.y - 40, 96, 80)) {
      ctx.save(); ctx.strokeStyle = 'rgba(95,180,155,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sel.x, sel.y, 44, 30, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    for (const n of R.nodes) {
      if (canTp(n)) { if (!spr('gem_' + (Math.floor(t * 1000 / 120) % 8), n.x - 17, n.y - 17, 34, 34)) { ctx.save(); ctx.fillStyle = '#7fd8c0'; ctx.beginPath(); ctx.moveTo(n.x, n.y - 12); ctx.lineTo(n.x + 9, n.y); ctx.lineTo(n.x, n.y + 12); ctx.lineTo(n.x - 9, n.y); ctx.fill(); ctx.restore(); } }
      else if (!spr('lock', n.x - 11, n.y - 12, 22, 24)) lockGlyph(n.x, n.y, 22, '#6c6a62');
    }
    for (const n of R.nodes) {
      const lit = canTp(n) || (n.tp === false && visited()[n.id]), on = TP.sel === n.id;
      ctx.save(); ctx.font = `600 16px ${NF}`; const tw = ctx.measureText(n.name).width; ctx.restore();
      const w = Math.max(64, tw + 28), h = 25, px = n.x - w / 2, py = n.y + 12;
      const k = on ? 'plate_on' : lit ? 'plate' : 'plate_lock';
      if (!spr3(k, px, py, w, h, 12, 12)) { ctx.save(); ctx.fillStyle = on ? '#2f5f55' : 'rgba(252,250,242,.96)'; roundRect(px, py, w, h, 5); ctx.fill(); ctx.restore(); }
      txt(n.name, n.x, py + h / 2 + 1, `600 16px ${NF}`, on ? '#f2fbf7' : lit ? C.ink : '#6c6a62', 'center');
      if (n.id === here) {   // 你在这里：红针针尖在点右上 (12,-9)，上方小签
        const tx = n.x + 12, ty = n.y - 9;
        if (!spr('pin', tx - 12, ty - 32, 24, 34)) { ctx.save(); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(tx, ty - 22, 8, Math.PI, 0); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill(); ctx.restore(); }
        if (spr('callout', tx - 40, ty - 32 - 29, 80, 29)) txt('你在这里', tx, ty - 32 - 17, `600 14px ${NF}`, C.red, 'center');
        else txt('你在这里', tx, ty - 44, `600 14px ${NF}`, C.red, 'center');
      }
    }
  }
  function legend() {
    const y = 627;
    spr('gem_0', 418, y - 10, 20, 20); txt('可传送', 444, y, `15px ${NF}`, C.ink, 'left');
    ctx.fillStyle = C.line; ctx.fillRect(516, y - 8, 1, 16);
    if (!spr('lock', 540, y - 8, 15, 16)) lockGlyph(549, y, 15, '#55534c'); txt('未解锁', 562, y, `15px ${NF}`, C.ink, 'left');
    ctx.fillStyle = C.line; ctx.fillRect(634, y - 8, 1, 16);
    spr('pin', 660, y - 11, 14, 20); txt('你在这里', 680, y, `15px ${NF}`, C.ink, 'left');
  }
  function detail() {
    const n = TP.sel && NODE[TP.sel];
    if (!n) { txt('点击地图上的地点', 1020, 300, `17px ${NF}`, C.soft); txt('查看详情', 1020, 326, `17px ${NF}`, C.soft); drawGo(false); return; }
    if (!spr('thumb_' + n.id, THUMB.x, THUMB.y, THUMB.w, THUMB.h)) { ctx.save(); ctx.fillStyle = '#dfeaf0'; ctx.fillRect(THUMB.x, THUMB.y, THUMB.w, THUMB.h); ctx.restore(); }
    spr('rim', RIM.x, RIM.y, RIM.w, RIM.h);
    txt(n.name, 1020, 365, `600 30px ${NF}`, C.ink, 'center', '3px');
    txt(n.d[0] || '', 1020, 406, `17px ${NF}`, '#3e3c35'); txt(n.d[1] || '', 1020, 432, `17px ${NF}`, '#3e3c35');
    const lit = canTp(n), here = n.id === hereId(), label = here ? '你在这里' : lit ? '已解锁' : n.tp === false ? '无法传送' : '未解锁';
    if (!spr(lit && !here ? 'tag_on' : 'tag_off', TAG.x, TAG.y, TAG.w, TAG.h)) { ctx.save(); ctx.fillStyle = '#ecebe5'; roundRect(TAG.x, TAG.y, TAG.w, TAG.h, 5); ctx.fill(); ctx.restore(); }
    txt(label, TAG.x + TAG.w / 2, TAG.y + TAG.h / 2 + 1, `600 16px ${NF}`, here ? C.red : lit ? C.jadeD : '#6c6a62');
    txt('消耗：无', 898, 540, `16px ${NF}`, C.ink, 'left');
    drawGo(lit && !here);
  }
  function drawGo(can) {
    const k = !can ? 'go_off' : TP.press === 'go' ? 'go_p' : 'go';
    if (!spr(k, GO.x, GO.y, GO.w, GO.h)) { ctx.save(); ctx.fillStyle = can ? '#a6dcca' : '#dcdcd6'; roundRect(GO.x, GO.y, GO.w, GO.h, 8); ctx.fill(); ctx.restore(); }
    txt('传送', GO.x + GO.w / 2 + 4, GO.y + GO.h / 2 + (TP.press === 'go' && can ? 3 : 1), `600 32px ${NF}`, can ? '#1f4d42' : '#8a8880', 'center', '8px');
  }
  function drawTP() {
    if (!TP) return; const t = Date.now() / 1000, R = REGIONS[TP.reg];
    ctx.save(); ctx.fillStyle = 'rgba(12,16,20,.45)'; ctx.fillRect(0, 0, W, H);
    panelBase(); closeBtn(); headings(R); tabs(); nodes(R, t); legend(); detail();
    if (TP.msg && t < TP.msgT) { ctx.font = `600 18px ${NF}`; const w = ctx.measureText(TP.msg).width + 40; ctx.fillStyle = 'rgba(40,44,40,.85)'; roundRect(590 - w / 2, 126, w, 34, 8); ctx.fill(); txt(TP.msg, 590, 144, `600 18px ${NF}`, '#f5f2e8'); }
    ctx.restore();
  }
  if (S.overlay) S.overlay.push({ draw() { try { drawTP(); } catch (e) {} } });

  // 输入：面板打开时独占点击（捕获阶段，不让点击漏到地图上走路）
  try {
    cv.addEventListener('pointerdown', e => { if (!TP) return; const q = toLogical(e); TP.down = q; TP.press = inR(q, GO) ? 'go' : inR(q, CLOSE) ? 'close' : null; e.stopImmediatePropagation(); e.preventDefault(); }, true);
    window.addEventListener('pointerup', e => { if (!TP || !TP.down) return; TP.tap = TP.down; TP.down = null; TP.press = null; }, true);
  } catch (e) {}
  const say2 = m => { TP.msg = m; TP.msgT = Date.now() / 1000 + 2.2; };
  const pick = t => REGIONS[TP.reg].nodes.find(n => Math.hypot(t.x - n.x, t.y - n.y) < NODE_R || inR(t, { x: n.x - 48, y: n.y + 10, w: 96, h: 30 })) || null;

  async function tpMap() {
    const hn = NODE[hereId()]; let reg = hn ? REGIONS.indexOf(hn.reg) : 0; if (reg < 0) reg = 0;
    TP = { reg, sel: hn ? hn.id : null, tap: null, down: null, press: null, msg: '', msgT: 0 };
    world.locked = true; const hud0 = S.hud; S.hud = false; let go = null;
    try { playSnd('ui_open'); } catch (e) {}
    for (;;) {
      await nextFrame(); const t = TP.tap; if (!t) continue; TP.tap = null;
      if (inR(t, CLOSE) || t.x < P.x || t.x > P.x + P.w || t.y < P.y || t.y > P.y + P.h) break;
      const ti = REGIONS.findIndex((R, i) => inR(t, TAB(i)));
      if (ti >= 0) { if (!regOpen(REGIONS[ti])) { say2('还没去过' + REGIONS[ti].name + '，松伯记不住那边的路'); continue; }
        if (ti !== TP.reg) { TP.reg = ti; const R = REGIONS[ti]; TP.sel = (R.nodes.find(n => n.id === hereId()) || R.nodes.find(canTp) || {}).id || null; try { playSnd('ui_click'); } catch (e) {} } continue; }
      if (inR(t, GO)) { const n = TP.sel && NODE[TP.sel]; if (!n) continue;
        if (n.id === hereId()) { say2('您就在这里'); continue; } if (!canTp(n)) { say2(n.tp === false ? '那里没法直接传送' : '还没去过这里'); continue; }
        go = n; break; }
      if (inR(t, MAP)) { const n = pick(t); if (n) { if (TP.sel === n.id && canTp(n) && n.id !== hereId()) { go = n; break; } TP.sel = n.id; try { playSnd('ui_click'); } catch (e) {} } }
    }
    TP = null; S.hud = hud0;
    if (!go) { world.locked = false; return; }
    const sp = spawnOf(go.id); if (!sp) { world.locked = false; toast('那里暂时去不了'); return; }
    await flashOut();
    tileSetMap(go.id, sp[0], sp[1], 'down'); S.scene = drawMap; S.hud = true;
    await fadeIn(400); world.locked = false; toast('已传送到：' + go.name, 1600);
  }
  // 传送光效：Codex 12 帧（78ms/帧，播一次），以脚底为锚，逻辑 192×264、锚点 (96,242)，随地图缩放和人物比例
  async function flashOut() {
    try { playSnd('sfx_star', .6); } catch (e) {}
    const p = world.player;
    if (p && atl('fx')) {
      const t0 = performance.now(), o = { draw() { const i = Math.floor((performance.now() - t0) / 78); if (i > 11 || !world.player) return;
        const c = world.cam || { x: 0, y: 0 }, z = typeof VZ === 'function' ? VZ() : 1, s = typeof CZ === 'function' ? CZ() : 1, sx = (world.player.x - c.x) * z, sy = (world.player.y - c.y) * z;
        spr('flash_' + i, sx - 96 * s, sy - 242 * s, 192 * s, 264 * s); } };
      S.overlay.push(o); await sleep(700); S.fade = 0; await fadeOut(260); const j = S.overlay.indexOf(o); if (j >= 0) S.overlay.splice(j, 1); return;
    }
    S.flash = .5; S.flashColor = '#e6f6ef'; await fadeOut(400);
  }
  window.TP146 = tpMap;
  setTimeout(() => { try { ['ui', 'maps', 'thumbs', 'fx'].forEach(atl); } catch (e) {} }, 1500);

  // 松伯对话里的「传送到去过的地方」→ 新界面（拦在最外层，里层 r139 的列表版认不出就不会弹出）。
  // 图集没加载到（极少见：网络失败）就照旧走 r139 列表版，不让玩家看到空白界面。
  choose = (o => function (title, opts) {
    try { if ((window.TP146_FORCE || (has('panel') && has('map_tianjian'))) && (title === '管家' || title === '松伯') && Array.isArray(opts) && opts[0] === '传送到去过的地方') {
      const o2 = opts.slice(); o2[0] = '传送到去过的地方​';
      return o.call(this, '松伯', o2).then(i => i === 0 ? tpMap().then(() => opts.length - 1) : i); } } catch (e) {}
    return o.apply(this, arguments);
  })(choose);
})();
